<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/response.php';
require_once __DIR__ . '/../middleware/contract-validate.php';

$action = $_GET['action'] ?? '';

if ($action === 'regions') {
    $rows = $pdo->query("SELECT id, name_ar, name_en FROM saudi_regions ORDER BY id ASC")->fetchAll();
    json_success($rows);
}

elseif ($action === 'cities') {
    $regionId = (int)($_GET['region_id'] ?? 0);
    if ($regionId <= 0) json_error('region_id مطلوب');
    $stmt = $pdo->prepare("SELECT id, name_ar, name_en FROM saudi_cities WHERE region_id = ? ORDER BY name_ar ASC");
    $stmt->execute([$regionId]);
    json_success($stmt->fetchAll());
}

elseif ($action === 'property-types') {
    json_success([
        ['value' => 'building', 'label' => 'عمارة'],
        ['value' => 'villa', 'label' => 'فيلا'],
        ['value' => 'plaza_open', 'label' => 'مجمع تجاري مفتوح (بلازا)'],
        ['value' => 'land', 'label' => 'أرض'],
        ['value' => 'plaza_closed', 'label' => 'مجمع تجاري مغلق (بلازا)'],
        ['value' => 'tower', 'label' => 'برج'],
        ['value' => 'factory', 'label' => 'مصنع'],
        ['value' => 'rest_house', 'label' => 'استراحة'],
        ['value' => 'farm', 'label' => 'مزرعة'],
    ]);
}

elseif ($action === 'unit-types') {
    json_success([
        ['value' => 'apartment', 'label' => 'شقة'],
        ['value' => 'land', 'label' => 'أرض'],
        ['value' => 'rest_house', 'label' => 'استراحة'],
        ['value' => 'farm', 'label' => 'مزرعة'],
        ['value' => 'office', 'label' => 'مكتب'],
        ['value' => 'warehouse', 'label' => 'مستودع'],
        ['value' => 'driver_room', 'label' => 'غرفة سائق'],
        ['value' => 'building', 'label' => 'عمارة'],
        ['value' => 'floor', 'label' => 'دور'],
        ['value' => 'duplex', 'label' => 'شقة ثنائية الدور (دوبلكس)'],
        ['value' => 'studio', 'label' => 'شقة صغيرة (استديو)'],
        ['value' => 'villa', 'label' => 'فيلا'],
        ['value' => 'traditional', 'label' => 'بيت شعبي'],
    ]);
}

elseif ($action === 'duration-pricing') {
    $pricing = get_duration_pricing();
    $labels = [1 => 'سنة', 2 => 'سنتين', 3 => '3 سنوات', 4 => '4 سنوات', 5 => '5 سنوات', 6 => '6 سنوات', 7 => '7 سنوات', 8 => '8 سنوات', 9 => '9 سنوات', 10 => '10 سنوات'];
    $result = [];
    foreach ($pricing as $years => $price) {
        $result[] = ['value' => $years, 'label' => $labels[$years], 'price' => $price];
    }
    json_success($result);
}

else {
    json_error('Unknown lookup', 404);
}
