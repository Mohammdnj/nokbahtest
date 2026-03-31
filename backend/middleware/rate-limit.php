<?php
function rateLimit($key, $maxAttempts = 5, $windowSeconds = 300) {
    $storageDir = __DIR__ . '/../storage';
    if (!is_dir($storageDir)) mkdir($storageDir, 0755, true);

    $file = "$storageDir/rate_" . md5($key) . ".json";

    $data = file_exists($file) ? json_decode(file_get_contents($file), true) : ['attempts' => [], 'blocked_until' => 0];

    if ($data['blocked_until'] > time()) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many attempts. Try again later.']);
        exit;
    }

    $now = time();
    $data['attempts'] = array_filter($data['attempts'], fn($t) => $t > $now - $windowSeconds);
    $data['attempts'][] = $now;

    if (count($data['attempts']) > $maxAttempts) {
        $data['blocked_until'] = $now + $windowSeconds;
        file_put_contents($file, json_encode($data));
        http_response_code(429);
        echo json_encode(['error' => 'Too many attempts. Try again later.']);
        exit;
    }

    file_put_contents($file, json_encode($data));
}
