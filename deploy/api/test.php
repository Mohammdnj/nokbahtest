<?php
// Dead-simple test file — no dependencies.
// If you can load https://alnokbh.sa/api/test.php and see this JSON,
// PHP is running and .htaccess routing works.
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'ok' => true,
    'message' => 'PHP is working',
    'php_version' => PHP_VERSION,
    'time' => date('c'),
]);
