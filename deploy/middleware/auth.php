<?php
function verifyToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Token required']);
        exit;
    }

    $token = $matches[1];
    $secret = getenv('JWT_SECRET') ?: 'change-this-secret';

    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }

    [$header, $payload, $signature] = $parts;

    $validSignature = rtrim(strtr(base64_encode(
        hash_hmac('sha256', "$header.$payload", $secret, true)
    ), '+/', '-_'), '=');

    if (!hash_equals($validSignature, $signature)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }

    $data = json_decode(base64_decode(strtr($payload, '-_', '+/')), true);

    if (isset($data['exp']) && $data['exp'] < time()) {
        http_response_code(401);
        echo json_encode(['error' => 'Token expired']);
        exit;
    }

    return $data;
}

function generateToken($userId, $role) {
    $secret = getenv('JWT_SECRET') ?: 'change-this-secret';
    $expiry = (int)(getenv('JWT_EXPIRY') ?: 86400);

    $header = rtrim(strtr(base64_encode(json_encode([
        'alg' => 'HS256',
        'typ' => 'JWT'
    ])), '+/', '-_'), '=');

    $payload = rtrim(strtr(base64_encode(json_encode([
        'user_id' => $userId,
        'role' => $role,
        'iat' => time(),
        'exp' => time() + $expiry,
    ])), '+/', '-_'), '=');

    $signature = rtrim(strtr(base64_encode(
        hash_hmac('sha256', "$header.$payload", $secret, true)
    ), '+/', '-_'), '=');

    return "$header.$payload.$signature";
}
