<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$auth = verifyToken();
$userId = (int)$auth['user_id'];

// ============ STATS ============
if ($method === 'GET' && $action === 'stats') {
    global $pdo, $userId;

    $stmt = $pdo->prepare("
        SELECT
            COUNT(*) AS total,
            SUM(status = 'draft') AS draft,
            SUM(status = 'pending') AS pending,
            SUM(status = 'active') AS active,
            SUM(status IN ('completed','active')) AS completed,
            COALESCE(SUM(CASE WHEN status IN ('active','completed') THEN total_fees ELSE 0 END), 0) AS total_paid
        FROM commercial_contracts
        WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $row = $stmt->fetch() ?: [];

    json_success([
        'total' => (int)($row['total'] ?? 0),
        'draft' => (int)($row['draft'] ?? 0),
        'pending' => (int)($row['pending'] ?? 0),
        'active' => (int)($row['active'] ?? 0),
        'completed' => (int)($row['completed'] ?? 0),
        'total_paid' => (float)($row['total_paid'] ?? 0),
    ]);
}

// ============ LIST ============
elseif ($method === 'GET' && $action === 'list') {
    global $pdo, $userId;

    $status = $_GET['status'] ?? '';
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = max(0, (int)($_GET['offset'] ?? 0));

    $sql = "SELECT id, contract_number, status, property_type, city, district, street_name,
                   annual_rent_amount, total_fees, contract_start_date, contract_duration_years,
                   current_step, created_at, updated_at
            FROM commercial_contracts
            WHERE user_id = ?";
    $params = [$userId];

    if ($status && in_array($status, ['draft','pending','active','expired','cancelled','completed'], true)) {
        $sql .= " AND status = ?";
        $params[] = $status;
    }

    $sql .= " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    json_success($rows);
}

// ============ PROPERTIES (distinct from contracts) ============
elseif ($method === 'GET' && $action === 'properties') {
    global $pdo, $userId;

    $stmt = $pdo->prepare("
        SELECT id, contract_number, property_type, property_usage, region, city, district,
               street_name, building_number, postal_code, deed_number, unit_area,
               status, annual_rent_amount, created_at
        FROM commercial_contracts
        WHERE user_id = ? AND status IN ('active','pending','completed')
        ORDER BY created_at DESC
    ");
    $stmt->execute([$userId]);
    json_success($stmt->fetchAll());
}

else {
    json_error('Method not allowed', 405);
}
