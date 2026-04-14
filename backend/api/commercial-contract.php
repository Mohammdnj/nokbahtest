<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/response.php';
require_once __DIR__ . '/../middleware/contract-validate.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Auth required for all operations
$auth = verifyToken();
$userId = (int)$auth['user_id'];

function generate_contract_number(): string {
    return 'CC-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
}

// ============ CREATE DRAFT ============
if ($method === 'POST' && $action === 'create') {
    global $pdo, $userId;

    // Rule 1: if user already has an open draft, return it instead of creating a new one
    $stmt = $pdo->prepare("
        SELECT id, contract_number, current_step
        FROM commercial_contracts
        WHERE user_id = ? AND status = 'draft'
        ORDER BY id DESC
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $existingDraft = $stmt->fetch();
    if ($existingDraft) {
        json_success([
            'contract_id' => (int)$existingDraft['id'],
            'contract_number' => $existingDraft['contract_number'],
            'current_step' => (int)$existingDraft['current_step'],
            'resumed' => true,
        ], 200);
    }

    // Rule 2: hard limit of 4 contracts per calendar day (any status)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS c
        FROM commercial_contracts
        WHERE user_id = ? AND DATE(created_at) = CURDATE()
    ");
    $stmt->execute([$userId]);
    $todayCount = (int)($stmt->fetch()['c'] ?? 0);
    if ($todayCount >= 4) {
        json_error('وصلت للحد الأقصى 4 عقود في اليوم الواحد. حاول مرة ثانية غداً.', 429, [
            'daily_limit' => 4,
            'today_count' => $todayCount,
        ]);
    }

    $contractNumber = generate_contract_number();
    $stmt = $pdo->prepare("INSERT INTO commercial_contracts (user_id, contract_number, status, current_step) VALUES (?, ?, 'draft', 1)");
    $stmt->execute([$userId, $contractNumber]);
    $id = (int)$pdo->lastInsertId();

    json_success([
        'contract_id' => $id,
        'contract_number' => $contractNumber,
        'current_step' => 1,
        'resumed' => false,
    ], 201);
}

// ============ SAVE STEP ============
elseif ($method === 'PUT' && $action === 'save-step') {
    global $pdo, $userId;

    $body = read_json_body();
    $contractId = (int)($body['contract_id'] ?? 0);
    $step = (int)($body['step'] ?? 0);
    $data = $body['data'] ?? [];

    if ($contractId <= 0) json_error('contract_id مطلوب');
    if ($step < 1 || $step > 6) json_error('رقم الخطوة غير صالح');
    if (!is_array($data)) json_error('البيانات غير صالحة');

    // Verify ownership
    $stmt = $pdo->prepare("SELECT id, status FROM commercial_contracts WHERE id = ? AND user_id = ?");
    $stmt->execute([$contractId, $userId]);
    $contract = $stmt->fetch();
    if (!$contract) json_error('العقد غير موجود', 404);
    if ($contract['status'] !== 'draft') json_error('لا يمكن تعديل عقد غير مسودة', 409);

    // Validate step data
    $validator = "validate_step$step";
    $err = $validator($data);
    if ($err !== null) json_error($err);

    // Filter allowed fields only
    $allowed = allowed_step_fields($step);
    $update = [];
    $params = [];
    foreach ($allowed as $field) {
        if (array_key_exists($field, $data)) {
            $update[] = "$field = ?";
            $val = $data[$field];
            if (in_array($field, ['has_agent','agreed_terms'], true)) {
                $val = !empty($val) ? 1 : 0;
            }
            $params[] = $val === '' ? null : $val;
        }
    }

    if (empty($update)) json_error('لا توجد بيانات للحفظ');

    // Advance current_step if moving forward
    $nextStep = min($step + 1, 6);
    $update[] = "current_step = ?";
    $params[] = $nextStep;
    $params[] = $contractId;

    $sql = "UPDATE commercial_contracts SET " . implode(', ', $update) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    json_success([
        'contract_id' => $contractId,
        'current_step' => $nextStep,
        'saved_step' => $step,
    ]);
}

// ============ GET CONTRACT ============
elseif ($method === 'GET' && $action === 'get') {
    global $pdo, $userId;

    $contractId = (int)($_GET['contract_id'] ?? 0);
    if ($contractId <= 0) json_error('contract_id مطلوب');

    $stmt = $pdo->prepare("SELECT * FROM commercial_contracts WHERE id = ? AND user_id = ?");
    $stmt->execute([$contractId, $userId]);
    $contract = $stmt->fetch();

    if (!$contract) json_error('العقد غير موجود', 404);

    json_success($contract);
}

// ============ SUBMIT ============
elseif ($method === 'POST' && $action === 'submit') {
    global $pdo, $userId;

    $body = read_json_body();
    $contractId = (int)($body['contract_id'] ?? 0);
    if ($contractId <= 0) json_error('contract_id مطلوب');

    $stmt = $pdo->prepare("SELECT * FROM commercial_contracts WHERE id = ? AND user_id = ?");
    $stmt->execute([$contractId, $userId]);
    $contract = $stmt->fetch();
    if (!$contract) json_error('العقد غير موجود', 404);
    if ($contract['status'] !== 'draft') json_error('العقد تم إرساله مسبقاً', 409);

    // Validate all steps
    for ($step = 1; $step <= 6; $step++) {
        $validator = "validate_step$step";
        $err = $validator($contract);
        if ($err !== null) {
            json_error("الخطوة $step غير مكتملة: $err", 400, ['failed_step' => $step]);
        }
    }

    if (empty($contract['agreed_terms'])) {
        json_error('يجب الموافقة على الشروط والأحكام');
    }

    // Calculate total fees from pricing table
    $pricing = get_duration_pricing();
    $totalFees = $pricing[(int)$contract['contract_duration_years']] ?? 0;

    $stmt = $pdo->prepare("UPDATE commercial_contracts SET status = 'pending', total_fees = ? WHERE id = ?");
    $stmt->execute([$totalFees, $contractId]);

    // Log to contract_logs for SSE real-time feed
    try {
        $stmt = $pdo->prepare("INSERT INTO contract_logs (contract_id, action, details, created_by) VALUES (?, 'submitted', 'تم إرسال عقد تجاري جديد', ?)");
        $stmt->execute([$contractId, $userId]);
    } catch (Throwable $e) {
        log_error('contract_logs insert failed: ' . $e->getMessage());
    }

    json_success([
        'contract_id' => $contractId,
        'contract_number' => $contract['contract_number'],
        'status' => 'pending',
        'total_fees' => $totalFees,
    ]);
}

else {
    json_error('Method not allowed', 405);
}
