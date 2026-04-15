<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/response.php';
require_once __DIR__ . '/../middleware/roles.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$auth = require_staff();

// ============ FEED ============
// Returns recent activity (new contracts + status changes) for the bell.
// `since` lets the client poll only for newer items.
if ($method === 'GET' && $action === 'feed') {
    global $pdo;

    $since = (int)($_GET['since'] ?? 0);
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));

    // New contracts (status=pending) since `since`
    $stmt = $pdo->prepare("
        SELECT
            c.id AS related_id,
            c.contract_number AS title,
            CONCAT('عقد جديد من ', COALESCE(u.name, 'عميل')) AS body,
            c.status AS status,
            c.created_at AS created_at,
            'new_contract' AS kind,
            UNIX_TIMESTAMP(c.created_at) AS ts
        FROM commercial_contracts c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.status = 'pending'
          AND UNIX_TIMESTAMP(c.created_at) > ?
        ORDER BY c.created_at DESC
        LIMIT $limit
    ");
    $stmt->execute([$since]);
    $newContracts = $stmt->fetchAll();

    // Recent status change logs since `since`
    $stmt = $pdo->prepare("
        SELECT
            l.contract_id AS related_id,
            COALESCE(c.contract_number, '—') AS title,
            l.details AS body,
            c.status AS status,
            l.created_at AS created_at,
            'status_change' AS kind,
            UNIX_TIMESTAMP(l.created_at) AS ts
        FROM contract_logs l
        LEFT JOIN commercial_contracts c ON l.contract_id = c.id
        WHERE l.action = 'status_change'
          AND UNIX_TIMESTAMP(l.created_at) > ?
        ORDER BY l.created_at DESC
        LIMIT $limit
    ");
    $stmt->execute([$since]);
    $statusChanges = $stmt->fetchAll();

    $combined = array_merge($newContracts, $statusChanges);
    usort($combined, fn($a, $b) => (int)$b['ts'] - (int)$a['ts']);
    $combined = array_slice($combined, 0, $limit);

    // Latest timestamp the client should send back next time
    $latestTs = $combined ? (int)$combined[0]['ts'] : $since;

    json_success([
        'items' => $combined,
        'latest_ts' => $latestTs,
        'unread_count' => count($combined),
    ]);
}

else {
    json_error('Unknown action', 404);
}
