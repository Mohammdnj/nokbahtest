<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/response.php';
require_once __DIR__ . '/../middleware/roles.php';
require_once __DIR__ . '/../config/sms.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$auth = require_admin(); // Only admins can broadcast SMS

// ============ SEND ============
if ($method === 'POST' && $action === 'send') {
    global $pdo;

    $data = read_json_body();
    $message = trim((string)($data['message'] ?? ''));
    if (!$message) json_error('الرسالة مطلوبة');
    if (mb_strlen($message) > 600) json_error('الرسالة طويلة جداً (600 حرف كحد أقصى)');

    // Targets: either explicit phones[] or user_ids[]
    $phones = [];

    if (!empty($data['phones']) && is_array($data['phones'])) {
        foreach ($data['phones'] as $p) {
            if ($p) $phones[] = normalizePhone((string)$p);
        }
    }

    if (!empty($data['user_ids']) && is_array($data['user_ids'])) {
        $ids = array_map('intval', $data['user_ids']);
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $pdo->prepare("SELECT phone FROM users WHERE id IN ($placeholders)");
        $stmt->execute($ids);
        foreach ($stmt->fetchAll() as $row) {
            $phones[] = normalizePhone((string)$row['phone']);
        }
    }

    // Or "all" customers
    if (!empty($data['all_users'])) {
        $stmt = $pdo->query("SELECT phone FROM users WHERE role = 'user'");
        foreach ($stmt->fetchAll() as $row) {
            $phones[] = normalizePhone((string)$row['phone']);
        }
    }

    $phones = array_values(array_unique(array_filter($phones)));
    if (empty($phones)) json_error('لا يوجد مستلمون');

    $sent = 0;
    $failed = 0;
    $errors = [];

    foreach ($phones as $phone) {
        $r = sendSMS($phone, $message);
        if ($r['success'] ?? false) {
            $sent++;
        } else {
            $failed++;
            if (isset($r['error'])) $errors[] = $r['error'];
        }
    }

    json_success([
        'total' => count($phones),
        'sent' => $sent,
        'failed' => $failed,
        'errors' => array_unique($errors),
    ]);
}

else {
    json_error('Unknown action', 404);
}
