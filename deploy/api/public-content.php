<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/response.php';

// No auth — this is what the landing page reads.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

try {
    $stmt = $pdo->query("SELECT group_key, content_key, content_value FROM site_content");
    $rows = $stmt->fetchAll();
    $out = [];
    foreach ($rows as $r) {
        $out[$r['group_key']][$r['content_key']] = $r['content_value'];
    }
    // Add 15-minute cache so we don't hammer the DB
    header('Cache-Control: public, max-age=900');
    json_success($out);
} catch (Throwable $e) {
    // Table might not exist yet — return empty so landing doesn't break
    json_success([]);
}
