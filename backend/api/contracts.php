<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/validate.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET - List contracts
if ($method === 'GET' && $action === 'list') {
    $auth = verifyToken();
    $role = $auth['role'];
    $userId = $auth['user_id'];

    $status = $_GET['status'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 20;
    $offset = ($page - 1) * $limit;

    if ($role === 'admin' || $role === 'employee') {
        $sql = "SELECT c.*, u.name as client_name FROM contracts c LEFT JOIN users u ON c.user_id = u.id";
        $params = [];
        if ($status) {
            $sql .= " WHERE c.status = ?";
            $params[] = $status;
        }
        $sql .= " ORDER BY c.created_at DESC LIMIT $limit OFFSET $offset";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    } else {
        $sql = "SELECT * FROM contracts WHERE user_id = ?";
        $params = [$userId];
        if ($status) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }
        $sql .= " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    echo json_encode($stmt->fetchAll());
}

// GET - Single contract
elseif ($method === 'GET' && $action === 'view') {
    $auth = verifyToken();
    $id = (int)($_GET['id'] ?? 0);

    $stmt = $pdo->prepare("SELECT c.*, u.name as client_name, u.phone as client_phone FROM contracts c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?");
    $stmt->execute([$id]);
    $contract = $stmt->fetch();

    if (!$contract) {
        http_response_code(404);
        echo json_encode(['error' => 'Contract not found']);
        exit;
    }

    // Only owner, admin, or employee can view
    if ($contract['user_id'] != $auth['user_id'] && !in_array($auth['role'], ['admin', 'employee'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    echo json_encode($contract);
}

// POST - Create contract request
elseif ($method === 'POST' && $action === 'create') {
    $auth = verifyToken();
    $data = json_decode(file_get_contents('php://input'), true);

    validateRequired($data, ['title', 'contract_type', 'property_type', 'landlord_name', 'tenant_name', 'city', 'rent_amount', 'rent_period']);

    $stmt = $pdo->prepare("
        INSERT INTO contracts (
            user_id, title, contract_type, property_type,
            landlord_name, landlord_id_number, landlord_phone,
            tenant_name, tenant_id_number, tenant_phone,
            city, district, street, building_number,
            rent_amount, rent_period, contract_start, contract_end,
            notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ");

    $stmt->execute([
        $auth['user_id'],
        sanitizeInput($data['title']),
        sanitizeInput($data['contract_type']),
        sanitizeInput($data['property_type']),
        sanitizeInput($data['landlord_name']),
        sanitizeInput($data['landlord_id_number'] ?? ''),
        sanitizeInput($data['landlord_phone'] ?? ''),
        sanitizeInput($data['tenant_name']),
        sanitizeInput($data['tenant_id_number'] ?? ''),
        sanitizeInput($data['tenant_phone'] ?? ''),
        sanitizeInput($data['city']),
        sanitizeInput($data['district'] ?? ''),
        sanitizeInput($data['street'] ?? ''),
        sanitizeInput($data['building_number'] ?? ''),
        (float)$data['rent_amount'],
        sanitizeInput($data['rent_period']),
        $data['contract_start'] ?? null,
        $data['contract_end'] ?? null,
        sanitizeInput($data['notes'] ?? ''),
    ]);

    $contractId = $pdo->lastInsertId();

    // Log the creation
    $logStmt = $pdo->prepare("INSERT INTO contract_logs (contract_id, action, details, created_by) VALUES (?, 'created', 'تم إنشاء طلب العقد', ?)");
    $logStmt->execute([$contractId, $auth['user_id']]);

    echo json_encode(['id' => $contractId, 'message' => 'Contract request created successfully']);
}

// PUT - Update contract status (admin/employee only)
elseif ($method === 'PUT' && $action === 'update-status') {
    $auth = verifyToken();

    if (!in_array($auth['role'], ['admin', 'employee'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    validateRequired($data, ['id', 'status']);

    $allowedStatuses = ['pending', 'in_progress', 'reviewing', 'completed', 'rejected'];
    if (!in_array($data['status'], $allowedStatuses)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE contracts SET status = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$data['status'], (int)$data['id']]);

    $statusLabels = [
        'pending' => 'قيد الانتظار',
        'in_progress' => 'جاري التنفيذ',
        'reviewing' => 'قيد المراجعة',
        'completed' => 'مكتمل',
        'rejected' => 'مرفوض',
    ];

    $logStmt = $pdo->prepare("INSERT INTO contract_logs (contract_id, action, details, created_by) VALUES (?, 'status_change', ?, ?)");
    $logStmt->execute([(int)$data['id'], 'تم تغيير الحالة إلى: ' . ($statusLabels[$data['status']] ?? $data['status']), $auth['user_id']]);

    echo json_encode(['message' => 'Status updated successfully']);
}

// GET - Dashboard stats
elseif ($method === 'GET' && $action === 'stats') {
    $auth = verifyToken();

    if (!in_array($auth['role'], ['admin', 'employee'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    $stats = [];

    $stmt = $pdo->query("SELECT COUNT(*) as total FROM contracts");
    $stats['total'] = $stmt->fetch()['total'];

    $stmt = $pdo->query("SELECT COUNT(*) as pending FROM contracts WHERE status = 'pending'");
    $stats['pending'] = $stmt->fetch()['pending'];

    $stmt = $pdo->query("SELECT COUNT(*) as in_progress FROM contracts WHERE status = 'in_progress'");
    $stats['in_progress'] = $stmt->fetch()['in_progress'];

    $stmt = $pdo->query("SELECT COUNT(*) as completed FROM contracts WHERE status = 'completed'");
    $stats['completed'] = $stmt->fetch()['completed'];

    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
    $stats['total_clients'] = $stmt->fetch()['total'];

    echo json_encode($stats);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
