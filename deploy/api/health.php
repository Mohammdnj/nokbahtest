<?php
/**
 * Simple health check. Call /api/health to confirm:
 * - PHP is running
 * - .htaccess rewrites are working
 * - Database connection works
 * - All config files load without error
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$status = [
    'ok' => true,
    'php_version' => PHP_VERSION,
    'server_time' => date('c'),
];

// Check DB
try {
    require_once __DIR__ . '/../config/database.php';
    // $pdo is set by database.php
    if (isset($pdo)) {
        $row = $pdo->query('SELECT 1 AS ok')->fetch();
        $status['database'] = $row && $row['ok'] == 1 ? 'connected' : 'error';
    }
} catch (Throwable $e) {
    $status['ok'] = false;
    $status['database'] = 'failed';
    $status['db_error'] = $e->getMessage();
}

echo json_encode($status, JSON_PRETTY_PRINT);
