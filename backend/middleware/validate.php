<?php
function validateRequired($data, $fields) {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $missing[] = $field;
        }
    }
    if (!empty($missing)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing fields: ' . implode(', ', $missing)]);
        exit;
    }
}

function validateEmail($email) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email']);
        exit;
    }
}

function validatePhone($phone) {
    if (!preg_match('/^[\+]?[0-9]{7,15}$/', $phone)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid phone number']);
        exit;
    }
}

function sanitizeInput($value) {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}
