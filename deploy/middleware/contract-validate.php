<?php
declare(strict_types=1);

/**
 * Validation for commercial contract steps.
 * Each function returns [bool isValid, string|null error, array cleanData]
 */

function validate_national_id($value): bool {
    return is_string($value) && preg_match('/^[12]\d{9}$/', $value) === 1;
}

function validate_saudi_phone($value): bool {
    return is_string($value) && preg_match('/^05\d{8}$/', $value) === 1;
}

function validate_postal_code($value): bool {
    return is_string($value) && preg_match('/^\d{5}$/', $value) === 1;
}

function validate_building_number($value): bool {
    return is_string($value) && preg_match('/^\d{4}$/', $value) === 1;
}

function validate_date($value): bool {
    if (!is_string($value) || empty($value)) return false;
    $d = DateTime::createFromFormat('Y-m-d', $value);
    return $d && $d->format('Y-m-d') === $value;
}

function validate_enum($value, array $allowed): bool {
    return in_array($value, $allowed, true);
}

function v_required(array $data, array $keys): ?string {
    foreach ($keys as $key) {
        if (!isset($data[$key]) || $data[$key] === '' || $data[$key] === null) {
            return "حقل مطلوب: $key";
        }
    }
    return null;
}

function validate_step1(array $data): ?string {
    $err = v_required($data, ['owner_or_tenant','owner_alive','deed_type','property_type','property_usage','deed_number','deed_date']);
    if ($err) return $err;

    if (!validate_enum($data['owner_or_tenant'], ['owner','tenant'])) return 'قيمة غير صالحة: owner_or_tenant';
    if (!validate_enum($data['owner_alive'], ['alive','deceased'])) return 'قيمة غير صالحة: owner_alive';
    if (!validate_enum($data['deed_type'], ['electronic','real_estate_registry','paper'])) return 'قيمة غير صالحة: deed_type';
    if (!validate_enum($data['property_usage'], ['commercial','residential_commercial'])) return 'قيمة غير صالحة: property_usage';
    if (!validate_date($data['deed_date'])) return 'تاريخ الصك غير صالح';

    return null;
}

function validate_step2(array $data): ?string {
    $err = v_required($data, ['region','city','district','street_name','building_number','postal_code','additional_number']);
    if ($err) return $err;

    if (!validate_postal_code($data['postal_code'])) return 'الرمز البريدي يجب أن يكون 5 أرقام';
    if (!validate_building_number($data['building_number'])) return 'رقم المبنى يجب أن يكون 4 أرقام';
    if (!validate_building_number($data['additional_number'])) return 'الرقم الإضافي يجب أن يكون 4 أرقام';

    return null;
}

function validate_step3(array $data): ?string {
    $err = v_required($data, ['owner_name','owner_id_number','owner_dob','owner_phone']);
    if ($err) return $err;

    if (!validate_national_id($data['owner_id_number'])) return 'رقم الهوية يجب أن يبدأ بـ 1 أو 2 ويتكون من 10 أرقام';
    if (!validate_date($data['owner_dob'])) return 'تاريخ الميلاد غير صالح';
    if (!validate_saudi_phone($data['owner_phone'])) return 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';

    if (!empty($data['has_agent'])) {
        $err = v_required($data, ['agent_name','agent_id_number','agent_dob','agent_phone']);
        if ($err) return $err;
        if (!validate_national_id($data['agent_id_number'])) return 'رقم هوية الوكيل غير صالح';
        if (!validate_date($data['agent_dob'])) return 'تاريخ ميلاد الوكيل غير صالح';
        if (!validate_saudi_phone($data['agent_phone'])) return 'رقم جوال الوكيل غير صالح';
    }

    return null;
}

function validate_step4(array $data): ?string {
    if (empty($data['tenant_type']) || !validate_enum($data['tenant_type'], ['individual','establishment','company'])) {
        return 'نوع المستأجر مطلوب';
    }
    if (!validate_saudi_phone($data['tenant_phone'] ?? '')) {
        return 'رقم جوال المستأجر يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
    }

    if ($data['tenant_type'] === 'individual') {
        $err = v_required($data, ['tenant_id_number','tenant_dob']);
        if ($err) return $err;
        if (!validate_national_id($data['tenant_id_number'])) return 'رقم هوية المستأجر غير صالح';
        if (!validate_date($data['tenant_dob'])) return 'تاريخ ميلاد المستأجر غير صالح';
    } else {
        $err = v_required($data, ['commercial_register','company_name']);
        if ($err) return $err;
    }

    return null;
}

function validate_step5(array $data): ?string {
    $err = v_required($data, ['unit_type','unit_usage','unit_number','floor_number','unit_area']);
    if ($err) return $err;

    if (!validate_enum($data['unit_usage'], ['family','individual','collective'])) return 'الاستخدام غير صالح';
    $area = (float)$data['unit_area'];
    if ($area <= 0 || $area > 100000) return 'مساحة الوحدة غير صالحة';

    return null;
}

function validate_step6(array $data): ?string {
    $err = v_required($data, ['contract_start_date','contract_duration_years','annual_rent_amount','payment_method']);
    if ($err) return $err;

    if (!validate_date($data['contract_start_date'])) return 'تاريخ بداية العقد غير صالح';
    if (strtotime($data['contract_start_date']) < strtotime(date('Y-m-d'))) return 'تاريخ بداية العقد يجب أن يكون اليوم أو بعده';

    $duration = (int)$data['contract_duration_years'];
    if ($duration < 1 || $duration > 10) return 'مدة العقد غير صالحة';

    $rent = (float)$data['annual_rent_amount'];
    if ($rent <= 0 || $rent > 10000000) return 'قيمة الإيجار غير صالحة';

    if (!validate_enum($data['payment_method'], ['monthly','quarterly','semi_annual','annual'])) {
        return 'طريقة السداد غير صالحة';
    }

    return null;
}

/**
 * Status state machine: returns the list of allowed next statuses
 * given the current one. Used by both API and admin UI.
 */
function allowed_status_transitions(string $current): array {
    return match ($current) {
        'draft'       => ['pending', 'cancelled'],
        'pending'     => ['in_progress', 'rejected', 'cancelled'],
        'in_progress' => ['reviewing', 'completed', 'rejected'],
        'reviewing'   => ['completed', 'in_progress', 'rejected'],
        'completed'   => ['active'],
        'active'      => ['expired', 'cancelled'],
        'rejected'    => ['in_progress'],
        'cancelled'   => [],
        'expired'     => [],
        default       => [],
    };
}

function can_transition_status(string $from, string $to): bool {
    if ($from === $to) return true;
    return in_array($to, allowed_status_transitions($from), true);
}

function get_duration_pricing(): array {
    return [
        1 => 349,
        2 => 799,
        3 => 1399,
        4 => 1799,
        5 => 2299,
        6 => 3099,
        7 => 3899,
        8 => 4699,
        9 => 4999,
        10 => 5999,
    ];
}

function allowed_step_fields(int $step): array {
    return match ($step) {
        1 => ['owner_or_tenant','owner_alive','deed_type','property_type','property_usage','deed_number','deed_date'],
        2 => ['region','city','district','street_name','building_number','postal_code','additional_number'],
        3 => ['owner_name','owner_id_number','owner_dob','owner_phone','has_agent','agent_name','agent_id_number','agent_dob','agent_phone'],
        4 => ['tenant_type','tenant_id_number','tenant_dob','tenant_phone','commercial_register','vat_number','company_name'],
        5 => ['unit_type','unit_usage','unit_number','floor_number','unit_area','window_ac_count','split_ac_count','electricity_meter','water_meter'],
        6 => ['contract_start_date','contract_duration_years','annual_rent_amount','payment_method','additional_conditions','agreed_terms'],
        default => [],
    };
}
