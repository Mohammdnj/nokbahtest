<?php
// When frontend + backend share the same origin (Hostinger setup),
// the browser won't even send an Origin header for same-origin requests,
// so CORS isn't required. For cross-origin callers we allow the configured list.
$defaultAllowed = 'http://localhost:3000,http://localhost:3002,https://demo3.fmistsolutions.com,https://www.demo3.fmistsolutions.com';
$allowedOrigins = array_map('trim', explode(',', getenv('ALLOWED_ORIGINS') ?: $defaultAllowed));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Vary: Origin");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
