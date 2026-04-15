<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/response.php';
require_once __DIR__ . '/../middleware/roles.php';
require_once __DIR__ . '/../middleware/contract-validate.php';
require_once __DIR__ . '/../config/sms.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$auth = require_staff();

// ============ STATS (queue-focused) ============
if ($method === 'GET' && $action === 'stats') {
    global $pdo, $auth;

    $stats = [];
    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM commercial_contracts WHERE status = 'pending'");
    $stats['pending'] = (int)$stmt->fetch()['c'];

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM commercial_contracts WHERE status IN ('in_progress','reviewing')");
    $stats['in_progress'] = (int)$stmt->fetch()['c'];

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM commercial_contracts WHERE status IN ('completed','active') AND DATE(updated_at) = CURDATE()");
    $stats['completed_today'] = (int)$stmt->fetch()['c'];

    $stmt = $pdo->prepare("SELECT COUNT(*) AS c FROM invoices WHERE issued_by = ? AND DATE(created_at) = CURDATE()");
    $stmt->execute([$auth['user_id']]);
    $stats['my_invoices_today'] = (int)$stmt->fetch()['c'];

    json_success($stats);
}

// ============ CONTRACTS QUEUE ============
elseif ($method === 'GET' && $action === 'queue') {
    global $pdo;

    $status = $_GET['status'] ?? '';
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));

    $allowed = ['draft','pending','in_progress','reviewing','completed','active','rejected','cancelled','expired'];

    $sql = "SELECT c.*, u.name AS client_name, u.phone AS client_phone
            FROM commercial_contracts c
            LEFT JOIN users u ON c.user_id = u.id";
    $params = [];
    if ($status && in_array($status, $allowed, true)) {
        $sql .= " WHERE c.status = ?";
        $params[] = $status;
    }
    $sql .= " ORDER BY c.created_at DESC LIMIT $limit";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_success($stmt->fetchAll());
}

elseif ($method === 'GET' && $action === 'contract') {
    global $pdo;
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_error('id مطلوب');

    $stmt = $pdo->prepare("
        SELECT c.*, u.name AS client_name, u.phone AS client_phone, u.email AS client_email
        FROM commercial_contracts c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) json_error('العقد غير موجود', 404);

    json_success($row);
}

elseif ($method === 'PUT' && $action === 'update-status') {
    global $pdo, $auth;
    $data = read_json_body();
    $id = (int)($data['id'] ?? 0);
    $status = $data['status'] ?? '';
    $ejarNumber = $data['ejar_number'] ?? null;
    $notes = $data['notes'] ?? null;

    // Fetch current contract to validate transition + get phone for SMS
    $stmt = $pdo->prepare("
        SELECT c.id, c.status, c.contract_number, u.phone AS client_phone
        FROM commercial_contracts c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    ");
    $stmt->execute([$id]);
    $contract = $stmt->fetch();
    if (!$contract) json_error('العقد غير موجود', 404);

    if (!can_transition_status($contract['status'], $status)) {
        json_error("لا يمكن تغيير الحالة من {$contract['status']} إلى $status", 400, [
            'allowed' => allowed_status_transitions($contract['status']),
        ]);
    }

    $stmt = $pdo->prepare("
        UPDATE commercial_contracts
        SET status = ?, ejar_number = COALESCE(?, ejar_number)
        WHERE id = ?
    ");
    $stmt->execute([$status, $ejarNumber, $id]);

    $logMsg = "تم تحديث الحالة إلى $status";
    if ($notes) $logMsg .= " — $notes";
    $stmt = $pdo->prepare("INSERT INTO contract_logs (contract_id, action, details, created_by) VALUES (?, 'status_change', ?, ?)");
    $stmt->execute([$id, $logMsg, $auth['user_id']]);

    // Auto-notify customer via SMS
    $smsResult = null;
    if (!empty($contract['client_phone'])) {
        $smsResult = notifyContractStatus(
            $contract['client_phone'],
            $contract['contract_number'],
            $status
        );
    }

    json_success([
        'id' => $id,
        'status' => $status,
        'sms_sent' => $smsResult['success'] ?? false,
    ]);
}

else {
    json_error('Unknown action', 404);
}
