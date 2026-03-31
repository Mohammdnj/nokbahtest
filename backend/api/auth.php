<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/validate.php';
require_once __DIR__ . '/../middleware/rate-limit.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'register') {
    rateLimit('register_' . ($_SERVER['REMOTE_ADDR'] ?? ''), 5, 300);

    $data = json_decode(file_get_contents('php://input'), true);
    validateRequired($data, ['name', 'email', 'password', 'phone']);
    validateEmail($data['email']);
    validatePhone($data['phone']);

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already registered']);
        exit;
    }

    $hash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 10]);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'user')");
    $stmt->execute([
        sanitizeInput($data['name']),
        $data['email'],
        $hash,
        sanitizeInput($data['phone']),
    ]);

    $userId = $pdo->lastInsertId();
    $token = generateToken($userId, 'user');

    echo json_encode(['token' => $token, 'user' => ['id' => $userId, 'name' => $data['name'], 'role' => 'user']]);
}

elseif ($method === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    validateRequired($data, ['email', 'password']);

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }

    $token = generateToken($user['id'], $user['role']);
    echo json_encode([
        'token' => $token,
        'user' => ['id' => $user['id'], 'name' => $user['name'], 'role' => $user['role']]
    ]);
}

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
