<?php
declare(strict_types=1);

// ============================================================
// Always emit JSON for fatal errors / uncaught exceptions so the
// frontend never sees an empty 500 body. Saves hours of debugging.
// ============================================================
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) {
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode([
            'success' => false,
            'error' => 'PHP fatal error',
            'detail' => $err['message'],
            'file' => basename($err['file']),
            'line' => $err['line'],
        ], JSON_UNESCAPED_UNICODE);
    }
});

set_exception_handler(function (Throwable $e) {
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode([
        'success' => false,
        'error' => 'Uncaught exception',
        'detail' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine(),
    ], JSON_UNESCAPED_UNICODE);
});

function json_success($data = null, int $code = 200): void {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'data' => $data,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(string $message, int $code = 400, array $extra = []): void {
    http_response_code($code);
    echo json_encode(array_merge([
        'success' => false,
        'error' => $message,
    ], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

function log_error(string $msg): void {
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) mkdir($logDir, 0755, true);
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL;
    file_put_contents($logDir . '/error.log', $line, FILE_APPEND | LOCK_EX);
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) return [];
    return $data;
}
