<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/response.php';
require_once __DIR__ . '/../middleware/roles.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Staff-only (admin + employee)
$auth = require_staff();

function generate_invoice_number(string $docType): string {
    $prefix = match ($docType) {
        'receipt_voucher' => 'RCV',
        'disbursement_voucher' => 'DSB',
        'tax_invoice' => 'INV',
        'simple_receipt' => 'RCP',
        default => 'DOC',
    };
    return $prefix . '-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
}

// ============ CREATE ============
if ($method === 'POST' && $action === 'create') {
    global $pdo, $auth;

    $data = read_json_body();

    $required = ['doc_type','recipient_name','line_items','issued_at'];
    foreach ($required as $k) {
        if (!isset($data[$k]) || $data[$k] === '' || $data[$k] === null) {
            json_error("حقل مطلوب: $k");
        }
    }

    $docType = $data['doc_type'];
    $allowedTypes = ['receipt_voucher','disbursement_voucher','tax_invoice','simple_receipt'];
    if (!in_array($docType, $allowedTypes, true)) json_error('نوع المستند غير صالح');

    $lineItems = $data['line_items'];
    if (!is_array($lineItems) || empty($lineItems)) json_error('يجب إضافة بند واحد على الأقل');

    // Calculate subtotal from items
    $subtotal = 0.0;
    foreach ($lineItems as $item) {
        $qty = (float)($item['qty'] ?? 1);
        $price = (float)($item['price'] ?? 0);
        $subtotal += $qty * $price;
    }

    $vatRate = (float)($data['vat_rate'] ?? 0);
    $discount = (float)($data['discount_amount'] ?? 0);
    $vatAmount = ($subtotal - $discount) * ($vatRate / 100);
    $total = $subtotal - $discount + $vatAmount;

    $number = generate_invoice_number($docType);

    $stmt = $pdo->prepare("
        INSERT INTO invoices (
            invoice_number, doc_type, contract_id, user_id,
            recipient_name, recipient_id_number, recipient_phone,
            payment_method, payment_reference,
            subtotal, vat_rate, vat_amount, discount_amount, total_amount,
            line_items, description, notes,
            status, issued_at, issued_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $number,
        $docType,
        $data['contract_id'] ? (int)$data['contract_id'] : null,
        $data['user_id'] ? (int)$data['user_id'] : null,
        $data['recipient_name'],
        $data['recipient_id_number'] ?? null,
        $data['recipient_phone'] ?? null,
        $data['payment_method'] ?? 'bank_transfer',
        $data['payment_reference'] ?? null,
        $subtotal,
        $vatRate,
        $vatAmount,
        $discount,
        $total,
        json_encode($lineItems, JSON_UNESCAPED_UNICODE),
        $data['description'] ?? null,
        $data['notes'] ?? null,
        $data['status'] ?? 'issued',
        $data['issued_at'],
        $auth['user_id'],
    ]);

    $id = (int)$pdo->lastInsertId();
    json_success([
        'id' => $id,
        'invoice_number' => $number,
        'total_amount' => $total,
    ], 201);
}

// ============ LIST ============
elseif ($method === 'GET' && $action === 'list') {
    global $pdo, $auth;

    $type = $_GET['type'] ?? '';
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));

    $sql = "SELECT i.*, u.name AS issuer_name
            FROM invoices i
            LEFT JOIN users u ON i.issued_by = u.id";
    $params = [];
    $where = [];

    // Employees only see their own unless admin
    if (!is_admin($auth)) {
        $where[] = "i.issued_by = ?";
        $params[] = $auth['user_id'];
    }
    if ($type) {
        $where[] = "i.doc_type = ?";
        $params[] = $type;
    }
    if ($where) $sql .= " WHERE " . implode(' AND ', $where);
    $sql .= " ORDER BY i.created_at DESC LIMIT $limit";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$r) {
        if (isset($r['line_items'])) {
            $r['line_items'] = json_decode($r['line_items'], true);
        }
    }
    unset($r);

    json_success($rows);
}

// ============ GET SINGLE ============
elseif ($method === 'GET' && $action === 'get') {
    global $pdo, $auth;
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_error('id مطلوب');

    $stmt = $pdo->prepare("
        SELECT i.*, u.name AS issuer_name, u.phone AS issuer_phone
        FROM invoices i
        LEFT JOIN users u ON i.issued_by = u.id
        WHERE i.id = ?
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    if (!$row) json_error('الفاتورة غير موجودة', 404);

    if (!is_admin($auth) && (int)$row['issued_by'] !== (int)$auth['user_id']) {
        json_error('غير مصرح', 403);
    }

    $row['line_items'] = json_decode($row['line_items'], true);
    json_success($row);
}

// ============ VALIDATE DISCOUNT CODE ============
elseif ($method === 'POST' && $action === 'validate-discount') {
    global $pdo;
    $data = read_json_body();
    $code = strtoupper(trim($data['code'] ?? ''));
    if (!$code) json_error('الكود مطلوب');

    $stmt = $pdo->prepare("SELECT * FROM discount_codes WHERE code = ? AND is_active = 1");
    $stmt->execute([$code]);
    $row = $stmt->fetch();

    if (!$row) json_error('الكود غير موجود أو غير مفعّل', 404);
    if ($row['expires_at'] && strtotime($row['expires_at']) < time()) {
        json_error('انتهت صلاحية الكود', 410);
    }
    if ($row['max_uses'] && (int)$row['used_count'] >= (int)$row['max_uses']) {
        json_error('تم استخدام الكود الحد الأقصى', 410);
    }

    json_success([
        'code' => $row['code'],
        'type' => $row['type'],
        'value' => (float)$row['value'],
        'applies_to' => $row['applies_to'],
    ]);
}

else {
    json_error('Unknown action', 404);
}
