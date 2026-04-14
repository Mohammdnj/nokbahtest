<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/sms.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/validate.php';
require_once __DIR__ . '/../middleware/rate-limit.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// ============ REGISTER ============
if ($method === 'POST' && $action === 'register') {
    rateLimit("register_$clientIp", 5, 600);

    $data = json_decode(file_get_contents('php://input'), true);
    validateRequired($data, ['name', 'phone', 'password']);
    validatePhone($data['phone']);

    $phone = normalizePhone($data['phone']);
    $name = sanitizeInput($data['name']);

    // Check if verified user already exists
    $stmt = $pdo->prepare("SELECT id, is_verified FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    $existing = $stmt->fetch();

    if ($existing && $existing['is_verified']) {
        http_response_code(409);
        echo json_encode(['error' => 'رقم الجوال مسجّل مسبقاً']);
        exit;
    }

    $hash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 10]);

    if ($existing) {
        // Unverified account — update and resend OTP
        $stmt = $pdo->prepare("UPDATE users SET name = ?, password = ?, email = ? WHERE id = ?");
        $stmt->execute([$name, $hash, $data['email'] ?? null, $existing['id']]);
        $userId = $existing['id'];
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (name, phone, password, email, is_verified) VALUES (?, ?, ?, ?, 0)");
        $stmt->execute([$name, $phone, $hash, $data['email'] ?? null]);
        $userId = $pdo->lastInsertId();
    }

    // Generate & store OTP
    $otp = generateOTP();
    $stmt = $pdo->prepare("INSERT INTO otp_codes (phone, code, purpose, expires_at) VALUES (?, ?, 'register', DATE_ADD(NOW(), INTERVAL 5 MINUTE))");
    $stmt->execute([$phone, $otp]);

    // Send SMS
    $smsResult = sendOTP($phone, $otp);

    echo json_encode([
        'message' => 'تم إرسال رمز التحقق',
        'phone' => $phone,
        'purpose' => 'register',
        'sms_sent' => $smsResult['success'] ?? false,
    ]);
}

// ============ LOGIN ============
elseif ($method === 'POST' && $action === 'login') {
    rateLimit("login_$clientIp", 10, 600);

    $data = json_decode(file_get_contents('php://input'), true);
    validateRequired($data, ['phone', 'password']);

    $phone = normalizePhone($data['phone']);

    $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'رقم الجوال أو كلمة المرور غير صحيحة']);
        exit;
    }

    if (!$user['is_verified']) {
        // Unverified — resend registration OTP
        $otp = generateOTP();
        $stmt = $pdo->prepare("INSERT INTO otp_codes (phone, code, purpose, expires_at) VALUES (?, ?, 'register', DATE_ADD(NOW(), INTERVAL 5 MINUTE))");
        $stmt->execute([$phone, $otp]);
        sendOTP($phone, $otp);

        echo json_encode([
            'message' => 'يجب التحقق من رقم الجوال أولاً',
            'phone' => $phone,
            'purpose' => 'register',
            'needs_verification' => true,
        ]);
        exit;
    }

    // Generate login OTP
    $otp = generateOTP();
    $stmt = $pdo->prepare("INSERT INTO otp_codes (phone, code, purpose, expires_at) VALUES (?, ?, 'login', DATE_ADD(NOW(), INTERVAL 5 MINUTE))");
    $stmt->execute([$phone, $otp]);

    $smsResult = sendOTP($phone, $otp);

    echo json_encode([
        'message' => 'تم إرسال رمز التحقق',
        'phone' => $phone,
        'purpose' => 'login',
        'sms_sent' => $smsResult['success'] ?? false,
    ]);
}

// ============ VERIFY OTP ============
elseif ($method === 'POST' && $action === 'verify-otp') {
    rateLimit("verify_$clientIp", 15, 600);

    $data = json_decode(file_get_contents('php://input'), true);
    validateRequired($data, ['phone', 'code', 'purpose']);

    $phone = normalizePhone($data['phone']);
    $code = preg_replace('/[^0-9]/', '', $data['code']);
    $purpose = $data['purpose'];

    if (!in_array($purpose, ['register', 'login', 'reset'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid purpose']);
        exit;
    }

    // Find latest valid OTP for this phone + purpose
    $stmt = $pdo->prepare("
        SELECT * FROM otp_codes
        WHERE phone = ? AND purpose = ? AND used_at IS NULL AND expires_at > NOW()
        ORDER BY id DESC LIMIT 1
    ");
    $stmt->execute([$phone, $purpose]);
    $otpRow = $stmt->fetch();

    if (!$otpRow) {
        http_response_code(400);
        echo json_encode(['error' => 'انتهت صلاحية الرمز أو غير موجود']);
        exit;
    }

    // Max 5 attempts
    if ($otpRow['attempts'] >= 5) {
        http_response_code(429);
        echo json_encode(['error' => 'تجاوزت عدد المحاولات المسموح بها']);
        exit;
    }

    if ($otpRow['code'] !== $code) {
        $pdo->prepare("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?")->execute([$otpRow['id']]);
        http_response_code(400);
        echo json_encode(['error' => 'رمز التحقق غير صحيح']);
        exit;
    }

    // Mark OTP as used
    $pdo->prepare("UPDATE otp_codes SET used_at = NOW() WHERE id = ?")->execute([$otpRow['id']]);

    // Get user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'المستخدم غير موجود']);
        exit;
    }

    // Activate user if registering
    if ($purpose === 'register' && !$user['is_verified']) {
        $pdo->prepare("UPDATE users SET is_verified = 1 WHERE id = ?")->execute([$user['id']]);
        $user['is_verified'] = 1;
    }

    $token = generateToken($user['id'], $user['role']);

    echo json_encode([
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'phone' => $user['phone'],
            'email' => $user['email'],
            'role' => $user['role'],
        ],
    ]);
}

// ============ RESEND OTP ============
elseif ($method === 'POST' && $action === 'resend-otp') {
    rateLimit("resend_$clientIp", 3, 300);

    $data = json_decode(file_get_contents('php://input'), true);
    validateRequired($data, ['phone', 'purpose']);

    $phone = normalizePhone($data['phone']);
    $purpose = $data['purpose'];

    if (!in_array($purpose, ['register', 'login', 'reset'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid purpose']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'المستخدم غير موجود']);
        exit;
    }

    $otp = generateOTP();
    $stmt = $pdo->prepare("INSERT INTO otp_codes (phone, code, purpose, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))");
    $stmt->execute([$phone, $otp, $purpose]);

    $smsResult = sendOTP($phone, $otp);

    echo json_encode([
        'message' => 'تم إعادة إرسال رمز التحقق',
        'sms_sent' => $smsResult['success'] ?? false,
    ]);
}

// ============ ME ============
elseif ($method === 'GET' && $action === 'me') {
    $auth = verifyToken();
    $stmt = $pdo->prepare("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?");
    $stmt->execute([$auth['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }
    echo json_encode($user);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
