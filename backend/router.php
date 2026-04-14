<?php
/**
 * Router for PHP's built-in server (`php -S localhost:8000 -t . router.php`)
 * Mimics the .htaccess rewrite rules so endpoints work in local dev.
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = ltrim($uri, '/');

// Serve static files (images, etc.) as-is
if ($uri !== '' && file_exists(__DIR__ . '/' . $uri) && !is_dir(__DIR__ . '/' . $uri)) {
    return false;
}

// /api/contracts/commercial/{action} -> api/commercial-contract.php?action={action}
if (preg_match('#^api/contracts/commercial/([a-z\-]+)/?$#', $uri, $m)) {
    $_GET['action'] = $m[1];
    require __DIR__ . '/api/commercial-contract.php';
    return true;
}

// /api/lookups/{action} -> api/lookups.php?action={action}
if (preg_match('#^api/lookups/([a-z\-]+)/?$#', $uri, $m)) {
    $_GET['action'] = $m[1];
    require __DIR__ . '/api/lookups.php';
    return true;
}

// /api/{name} -> api/{name}.php
if (preg_match('#^api/([a-zA-Z0-9_\-]+)/?$#', $uri, $m)) {
    $file = __DIR__ . '/api/' . $m[1] . '.php';
    if (file_exists($file)) {
        require $file;
        return true;
    }
}

// /api/{name}.php direct
if (preg_match('#^api/([a-zA-Z0-9_\-]+)\.php$#', $uri, $m)) {
    require __DIR__ . '/api/' . $m[1] . '.php';
    return true;
}

http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['error' => 'Not Found', 'uri' => $uri]);
return true;
