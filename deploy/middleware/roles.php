<?php
declare(strict_types=1);

/**
 * Role-based access control helpers.
 * All use verifyToken() under the hood.
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/response.php';

function require_admin(): array {
    $auth = verifyToken();
    if (($auth['role'] ?? '') !== 'admin') {
        json_error('صلاحية المدير مطلوبة', 403);
    }
    return $auth;
}

function require_staff(): array {
    $auth = verifyToken();
    $role = $auth['role'] ?? '';
    if (!in_array($role, ['admin', 'employee'], true)) {
        json_error('هذه الصلاحية للموظفين فقط', 403);
    }
    return $auth;
}

function is_admin(array $auth): bool {
    return ($auth['role'] ?? '') === 'admin';
}
