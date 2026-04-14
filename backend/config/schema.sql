-- ============================================================
-- النخبة / Nokba - Complete database schema
-- Run this once on a fresh MySQL database.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables (if running a clean reinstall)
DROP TABLE IF EXISTS contract_logs;
DROP TABLE IF EXISTS commercial_contracts;
DROP TABLE IF EXISTS saudi_cities;
DROP TABLE IF EXISTS saudi_regions;
DROP TABLE IF EXISTS otp_codes;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    role ENUM('admin','employee','user') DEFAULT 'user',
    is_verified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- OTP CODES (for SMS verification via 4jawaly)
-- ============================================================
CREATE TABLE otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL,
    purpose ENUM('register','login','reset') NOT NULL,
    attempts INT DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone_purpose (phone, purpose),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SAUDI REGIONS + CITIES
-- ============================================================
CREATE TABLE saudi_regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE saudi_cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region_id INT NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (region_id) REFERENCES saudi_regions(id) ON DELETE CASCADE,
    INDEX idx_region (region_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- COMMERCIAL CONTRACTS (commercial lease wizard)
-- ============================================================
CREATE TABLE commercial_contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    contract_number VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('draft','pending','active','expired','cancelled','completed','rejected') DEFAULT 'draft',
    current_step TINYINT DEFAULT 1,

    -- Step 1: Deed
    owner_or_tenant ENUM('owner','tenant') DEFAULT NULL,
    owner_alive ENUM('alive','deceased') DEFAULT NULL,
    deed_type ENUM('electronic','real_estate_registry','paper') DEFAULT NULL,
    property_type VARCHAR(50) DEFAULT NULL,
    property_usage ENUM('commercial','residential_commercial') DEFAULT NULL,
    deed_number VARCHAR(50) DEFAULT NULL,
    deed_date DATE DEFAULT NULL,

    -- Step 2: Address
    region VARCHAR(50) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    district VARCHAR(100) DEFAULT NULL,
    street_name VARCHAR(200) DEFAULT NULL,
    building_number VARCHAR(10) DEFAULT NULL,
    postal_code VARCHAR(10) DEFAULT NULL,
    additional_number VARCHAR(10) DEFAULT NULL,

    -- Step 3: Owner
    owner_name VARCHAR(200) DEFAULT NULL,
    owner_id_number VARCHAR(10) DEFAULT NULL,
    owner_dob DATE DEFAULT NULL,
    owner_phone VARCHAR(10) DEFAULT NULL,
    has_agent TINYINT(1) DEFAULT 0,
    agent_name VARCHAR(200) DEFAULT NULL,
    agent_id_number VARCHAR(10) DEFAULT NULL,
    agent_dob DATE DEFAULT NULL,
    agent_phone VARCHAR(10) DEFAULT NULL,

    -- Step 4: Tenant
    tenant_type ENUM('individual','establishment','company') DEFAULT NULL,
    tenant_id_number VARCHAR(10) DEFAULT NULL,
    tenant_dob DATE DEFAULT NULL,
    tenant_phone VARCHAR(10) DEFAULT NULL,
    commercial_register VARCHAR(20) DEFAULT NULL,
    vat_number VARCHAR(20) DEFAULT NULL,
    company_name VARCHAR(200) DEFAULT NULL,

    -- Step 5: Unit
    unit_type VARCHAR(50) DEFAULT NULL,
    unit_usage ENUM('family','individual','collective') DEFAULT NULL,
    unit_number VARCHAR(10) DEFAULT NULL,
    floor_number VARCHAR(10) DEFAULT NULL,
    unit_area DECIMAL(8,2) DEFAULT NULL,
    window_ac_count INT DEFAULT 0,
    split_ac_count INT DEFAULT 0,
    electricity_meter VARCHAR(30) DEFAULT NULL,
    water_meter VARCHAR(30) DEFAULT NULL,

    -- Step 6: Financial
    contract_start_date DATE DEFAULT NULL,
    contract_duration_years TINYINT DEFAULT NULL,
    total_fees DECIMAL(10,2) DEFAULT NULL,
    annual_rent_amount DECIMAL(12,2) DEFAULT NULL,
    payment_method ENUM('monthly','quarterly','semi_annual','annual') DEFAULT NULL,
    additional_conditions TEXT DEFAULT NULL,
    agreed_terms TINYINT(1) DEFAULT 0,

    -- Optional integration
    ejar_number VARCHAR(50) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_contract_number (contract_number),
    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_owner_id (owner_id_number),
    INDEX idx_tenant_id (tenant_id_number),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CONTRACT LOGS (for SSE real-time updates to admin/employee)
-- Not FK-bound to allow linking to any contract table in the future.
-- ============================================================
CREATE TABLE contract_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    contract_kind VARCHAR(30) DEFAULT 'commercial',
    action VARCHAR(50) NOT NULL,
    details TEXT DEFAULT NULL,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_contract (contract_id),
    INDEX idx_kind (contract_kind),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED: default admin user (change password after first login)
-- Default password: admin123
-- ============================================================
INSERT INTO users (name, email, password, phone, role, is_verified) VALUES (
    'مدير النظام',
    'admin@nokba.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    '966500000000',
    'admin',
    1
);

-- ============================================================
-- SEED: Saudi regions (13)
-- ============================================================
INSERT INTO saudi_regions (id, name_ar, name_en) VALUES
    (1,  'الرياض',            'Riyadh'),
    (2,  'مكة المكرمة',       'Makkah'),
    (3,  'المدينة المنورة',   'Madinah'),
    (4,  'الشرقية',           'Eastern'),
    (5,  'القصيم',            'Qassim'),
    (6,  'عسير',              'Asir'),
    (7,  'تبوك',              'Tabuk'),
    (8,  'حائل',              'Hail'),
    (9,  'الجوف',             'Jouf'),
    (10, 'الحدود الشمالية',   'Northern Borders'),
    (11, 'نجران',             'Najran'),
    (12, 'الباحة',            'Bahah'),
    (13, 'جازان',             'Jazan');

-- ============================================================
-- SEED: Saudi cities
-- ============================================================
INSERT INTO saudi_cities (region_id, name_ar, name_en) VALUES
    -- Riyadh
    (1, 'الرياض', 'Riyadh'),
    (1, 'الدرعية', 'Diriyah'),
    (1, 'الخرج', 'Al Kharj'),
    (1, 'المجمعة', 'Al Majmaah'),
    (1, 'الزلفي', 'Az Zulfi'),
    (1, 'وادي الدواسر', 'Wadi Ad Dawasir'),
    (1, 'الأفلاج', 'Al Aflaj'),
    (1, 'الدوادمي', 'Ad Dawadmi'),
    (1, 'شقراء', 'Shaqra'),
    (1, 'حوطة بني تميم', 'Hawtat Bani Tamim'),

    -- Makkah
    (2, 'مكة المكرمة', 'Makkah'),
    (2, 'جدة', 'Jeddah'),
    (2, 'الطائف', 'Taif'),
    (2, 'رابغ', 'Rabigh'),
    (2, 'القنفذة', 'Al Qunfudhah'),
    (2, 'الليث', 'Al Lith'),
    (2, 'خليص', 'Khulays'),
    (2, 'الجموم', 'Al Jumum'),
    (2, 'بحرة', 'Bahrah'),
    (2, 'تربة', 'Turbah'),

    -- Madinah
    (3, 'المدينة المنورة', 'Madinah'),
    (3, 'ينبع', 'Yanbu'),
    (3, 'العلا', 'Al Ula'),
    (3, 'بدر', 'Badr'),
    (3, 'خيبر', 'Khaybar'),
    (3, 'الحناكية', 'Al Hanakiyah'),
    (3, 'المهد', 'Mahd Adh Dhahab'),

    -- Eastern
    (4, 'الدمام', 'Dammam'),
    (4, 'الخبر', 'Khobar'),
    (4, 'الظهران', 'Dhahran'),
    (4, 'الأحساء', 'Al Ahsa'),
    (4, 'القطيف', 'Qatif'),
    (4, 'الجبيل', 'Jubail'),
    (4, 'حفر الباطن', 'Hafr Al Batin'),
    (4, 'الخفجي', 'Khafji'),
    (4, 'رأس تنورة', 'Ras Tanura'),
    (4, 'بقيق', 'Abqaiq'),
    (4, 'النعيرية', 'Nairiyah'),

    -- Qassim
    (5, 'بريدة', 'Buraydah'),
    (5, 'عنيزة', 'Unaizah'),
    (5, 'الرس', 'Ar Rass'),
    (5, 'المذنب', 'Al Midhnab'),
    (5, 'البكيرية', 'Al Bukayriyah'),
    (5, 'البدائع', 'Al Badayea'),
    (5, 'رياض الخبراء', 'Riyadh Al Khabra'),

    -- Asir
    (6, 'أبها', 'Abha'),
    (6, 'خميس مشيط', 'Khamis Mushait'),
    (6, 'بيشة', 'Bisha'),
    (6, 'النماص', 'An Namas'),
    (6, 'محايل عسير', 'Muhayil'),
    (6, 'ظهران الجنوب', 'Dhahran Al Janub'),
    (6, 'سراة عبيدة', 'Sarat Obaidah'),
    (6, 'تثليث', 'Tathlith'),

    -- Tabuk
    (7, 'تبوك', 'Tabuk'),
    (7, 'الوجه', 'Al Wajh'),
    (7, 'ضباء', 'Duba'),
    (7, 'تيماء', 'Tayma'),
    (7, 'أملج', 'Umluj'),
    (7, 'حقل', 'Haql'),

    -- Hail
    (8, 'حائل', 'Hail'),
    (8, 'بقعاء', 'Baqaa'),
    (8, 'الشنان', 'Ash Shinan'),
    (8, 'الغزالة', 'Al Ghazalah'),

    -- Jouf
    (9, 'سكاكا', 'Sakaka'),
    (9, 'دومة الجندل', 'Dumat Al Jandal'),
    (9, 'القريات', 'Al Qurayyat'),

    -- Northern Borders
    (10, 'عرعر', 'Arar'),
    (10, 'رفحاء', 'Rafha'),
    (10, 'طريف', 'Turaif'),

    -- Najran
    (11, 'نجران', 'Najran'),
    (11, 'شرورة', 'Sharurah'),
    (11, 'حبونا', 'Habuna'),

    -- Bahah
    (12, 'الباحة', 'Al Bahah'),
    (12, 'بلجرشي', 'Baljurashi'),
    (12, 'المندق', 'Al Mandaq'),
    (12, 'المخواة', 'Al Mikhwah'),

    -- Jazan
    (13, 'جازان', 'Jazan'),
    (13, 'صبيا', 'Sabya'),
    (13, 'أبو عريش', 'Abu Arish'),
    (13, 'صامطة', 'Samtah'),
    (13, 'أحد المسارحة', 'Ahad Al Masarihah');
