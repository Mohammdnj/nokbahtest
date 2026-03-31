<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

// Override content type for SSE
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no'); // Tell nginx not to buffer

// SSE: support token via query param since EventSource can't send headers
if (isset($_GET['token']) && !isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $_GET['token'];
}

$auth = verifyToken();
$userId = $auth['user_id'];
$role = $auth['role'];

// Get the last known event ID from client
$lastEventId = $_SERVER['HTTP_LAST_EVENT_ID'] ?? ($_GET['last_id'] ?? 0);
$lastEventId = (int)$lastEventId;

// Flush helper
function sendSSE($id, $event, $data) {
    echo "id: $id\n";
    echo "event: $event\n";
    echo "data: " . json_encode($data) . "\n\n";
    ob_flush();
    flush();
}

// Send initial connection event
sendSSE(0, 'connected', ['message' => 'Connected to real-time updates', 'user_id' => $userId]);

// Keep connection alive and check for new contracts
$maxRuntime = 120; // 2 minutes max, then client reconnects
$startTime = time();

while ((time() - $startTime) < $maxRuntime) {
    // Check for new/updated contracts since last event
    if ($role === 'admin' || $role === 'employee') {
        // Admins and employees see all new contracts
        $stmt = $pdo->prepare("
            SELECT c.*, u.name as client_name
            FROM contracts c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id > ?
            ORDER BY c.id ASC
            LIMIT 10
        ");
        $stmt->execute([$lastEventId]);
    } else {
        // Regular users see only their contracts
        $stmt = $pdo->prepare("
            SELECT c.*
            FROM contracts c
            WHERE c.user_id = ? AND c.id > ?
            ORDER BY c.id ASC
            LIMIT 10
        ");
        $stmt->execute([$userId, $lastEventId]);
    }

    $contracts = $stmt->fetchAll();

    foreach ($contracts as $contract) {
        sendSSE($contract['id'], 'new_contract', $contract);
        $lastEventId = $contract['id'];
    }

    // Check for status updates on existing contracts
    if ($role === 'admin' || $role === 'employee') {
        $stmt = $pdo->prepare("
            SELECT cl.*, c.title as contract_title
            FROM contract_logs cl
            LEFT JOIN contracts c ON cl.contract_id = c.id
            WHERE cl.id > ?
            ORDER BY cl.id ASC
            LIMIT 10
        ");
        $stmt->execute([$_GET['last_log_id'] ?? 0]);
    } else {
        $stmt = $pdo->prepare("
            SELECT cl.*, c.title as contract_title
            FROM contract_logs cl
            LEFT JOIN contracts c ON cl.contract_id = c.id
            WHERE c.user_id = ? AND cl.id > ?
            ORDER BY cl.id ASC
            LIMIT 10
        ");
        $stmt->execute([$userId, $_GET['last_log_id'] ?? 0]);
    }

    $logs = $stmt->fetchAll();
    foreach ($logs as $log) {
        sendSSE($log['id'], 'contract_update', $log);
    }

    // Send heartbeat to keep connection alive
    sendSSE(0, 'heartbeat', ['time' => time()]);

    // Check if client disconnected
    if (connection_aborted()) break;

    // Wait 3 seconds before checking again
    sleep(3);
}

// Tell client to reconnect
sendSSE(0, 'reconnect', ['message' => 'Session expired, reconnecting...']);
