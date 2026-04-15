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
$auth = require_admin();

// ============ STATS (global) ============
if ($method === 'GET' && $action === 'stats') {
    global $pdo;

    $stats = [];

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM commercial_contracts");
    $stats['total_contracts'] = (int)$stmt->fetch()['c'];

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM commercial_contracts WHERE status = 'pending'");
    $stats['pending_contracts'] = (int)$stmt->fetch()['c'];

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM commercial_contracts WHERE status IN ('completed','active')");
    $stats['completed_contracts'] = (int)$stmt->fetch()['c'];

    $stmt = $pdo->query("SELECT COALESCE(SUM(total_amount),0) AS s FROM invoices WHERE status IN ('issued','paid')");
    $stats['total_revenue'] = (float)$stmt->fetch()['s'];

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM users WHERE role = 'user'");
    $stats['total_users'] = (int)$stmt->fetch()['c'];

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM users WHERE role = 'employee'");
    $stats['total_employees'] = (int)$stmt->fetch()['c'];

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM discount_codes WHERE is_active = 1");
    $stats['active_discounts'] = (int)$stmt->fetch()['c'];

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM invoices WHERE DATE(created_at) = CURDATE()");
    $stats['invoices_today'] = (int)$stmt->fetch()['c'];

    json_success($stats);
}

// ============ CONTRACTS (all) ============
elseif ($method === 'GET' && $action === 'contracts') {
    global $pdo;

    $status = $_GET['status'] ?? '';
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
    $offset = max(0, (int)($_GET['offset'] ?? 0));

    $sql = "SELECT c.*, u.name AS client_name, u.phone AS client_phone
            FROM commercial_contracts c
            LEFT JOIN users u ON c.user_id = u.id";
    $params = [];
    if ($status) {
        $sql .= " WHERE c.status = ?";
        $params[] = $status;
    }
    $sql .= " ORDER BY c.created_at DESC LIMIT $limit OFFSET $offset";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_success($stmt->fetchAll());
}

elseif ($method === 'PUT' && $action === 'update-contract-status') {
    global $pdo, $auth;

    $data = read_json_body();
    $id = (int)($data['id'] ?? 0);
    $status = $data['status'] ?? '';
    $ejarNumber = $data['ejar_number'] ?? null;

    if ($id <= 0) json_error('id مطلوب');

    $stmt = $pdo->prepare("
        SELECT c.status, c.contract_number, u.phone AS client_phone
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

    $stmt = $pdo->prepare("UPDATE commercial_contracts SET status = ?, ejar_number = COALESCE(?, ejar_number) WHERE id = ?");
    $stmt->execute([$status, $ejarNumber, $id]);

    $stmt = $pdo->prepare("INSERT INTO contract_logs (contract_id, action, details, created_by) VALUES (?, 'status_change', ?, ?)");
    $stmt->execute([$id, 'تم تحديث الحالة إلى ' . $status, $auth['user_id']]);

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

// ============ USERS ============
elseif ($method === 'GET' && $action === 'users') {
    global $pdo;
    $role = $_GET['role'] ?? '';
    $sql = "SELECT id, name, email, phone, role, is_verified, created_at FROM users";
    $params = [];
    if ($role && in_array($role, ['admin','employee','user'], true)) {
        $sql .= " WHERE role = ?";
        $params[] = $role;
    }
    $sql .= " ORDER BY created_at DESC LIMIT 200";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_success($stmt->fetchAll());
}

elseif ($method === 'PUT' && $action === 'update-user-role') {
    global $pdo;
    $data = read_json_body();
    $id = (int)($data['id'] ?? 0);
    $role = $data['role'] ?? '';
    if (!in_array($role, ['admin','employee','user'], true)) json_error('صلاحية غير صالحة');
    $stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
    $stmt->execute([$role, $id]);
    json_success(['id' => $id, 'role' => $role]);
}

// ============ DISCOUNT CODES ============
elseif ($method === 'GET' && $action === 'discounts') {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM discount_codes ORDER BY created_at DESC");
    json_success($stmt->fetchAll());
}

elseif ($method === 'POST' && $action === 'create-discount') {
    global $pdo, $auth;
    $data = read_json_body();

    $err = v_required($data, ['code','type','value']);
    if ($err) json_error($err);
    if (!in_array($data['type'], ['percent','fixed'], true)) json_error('نوع الخصم غير صالح');

    $appliesTo = $data['applies_to'] ?? 'all';
    if (!in_array($appliesTo, ['all','residential','commercial'], true)) {
        json_error('التطبيق غير صالح');
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO discount_codes
                (code, type, value, applies_to, max_uses, expires_at, is_active, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            strtoupper(trim($data['code'])),
            $data['type'],
            (float)$data['value'],
            $appliesTo,
            $data['max_uses'] ? (int)$data['max_uses'] : null,
            $data['expires_at'] ?: null,
            !empty($data['is_active']) ? 1 : 1,
            $data['notes'] ?? null,
            $auth['user_id'],
        ]);
        json_success(['id' => (int)$pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            json_error('هذا الكود موجود مسبقاً', 409);
        }
        throw $e;
    }
}

elseif ($method === 'PUT' && $action === 'update-discount') {
    global $pdo;
    $data = read_json_body();
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) json_error('id مطلوب');

    $stmt = $pdo->prepare("
        UPDATE discount_codes
        SET value = ?, applies_to = ?, max_uses = ?, expires_at = ?, is_active = ?, notes = ?
        WHERE id = ?
    ");
    $stmt->execute([
        (float)($data['value'] ?? 0),
        $data['applies_to'] ?? 'all',
        $data['max_uses'] ? (int)$data['max_uses'] : null,
        $data['expires_at'] ?: null,
        !empty($data['is_active']) ? 1 : 0,
        $data['notes'] ?? null,
        $id,
    ]);
    json_success(['id' => $id]);
}

elseif ($method === 'DELETE' && $action === 'delete-discount') {
    global $pdo;
    $id = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare("DELETE FROM discount_codes WHERE id = ?");
    $stmt->execute([$id]);
    json_success(['deleted' => true]);
}

// ============ SITE CONTENT ============
elseif ($method === 'GET' && $action === 'site-content') {
    global $pdo;
    $stmt = $pdo->query("SELECT group_key, content_key, content_value, content_label FROM site_content ORDER BY group_key, id");
    json_success($stmt->fetchAll());
}

elseif ($method === 'PUT' && $action === 'update-site-content') {
    global $pdo;
    $data = read_json_body();
    if (empty($data['items']) || !is_array($data['items'])) json_error('items مطلوب');

    $stmt = $pdo->prepare("
        UPDATE site_content
        SET content_value = ?
        WHERE group_key = ? AND content_key = ?
    ");
    foreach ($data['items'] as $item) {
        if (!isset($item['group_key'], $item['content_key'], $item['content_value'])) continue;
        $stmt->execute([
            (string)$item['content_value'],
            (string)$item['group_key'],
            (string)$item['content_key'],
        ]);
    }
    json_success(['updated' => count($data['items'])]);
}

// ============ INVOICES (admin sees all) ============
elseif ($method === 'GET' && $action === 'invoices') {
    global $pdo;
    $type = $_GET['type'] ?? '';
    $sql = "SELECT i.*, u.name AS issuer_name
            FROM invoices i
            LEFT JOIN users u ON i.issued_by = u.id";
    $params = [];
    if ($type) {
        $sql .= " WHERE i.doc_type = ?";
        $params[] = $type;
    }
    $sql .= " ORDER BY i.created_at DESC LIMIT 100";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_success($stmt->fetchAll());
}

else {
    json_error('Unknown action', 404);
}

// Tiny helper to mirror the one in contract-validate
function v_required(array $data, array $keys): ?string {
    foreach ($keys as $key) {
        if (!isset($data[$key]) || $data[$key] === '' || $data[$key] === null) {
            return "حقل مطلوب: $key";
        }
    }
    return null;
}
