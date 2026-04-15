-- ============================================================
-- Migration: admin + employee features
-- Run this on an existing database after schema.sql
-- ============================================================

USE u902557766_nokbh;

-- ------------------------------------------------------------
-- DISCOUNT CODES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discount_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
    value DECIMAL(10,2) NOT NULL,
    applies_to ENUM('all','residential','commercial') DEFAULT 'all',
    max_uses INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    expires_at DATE DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    notes VARCHAR(255) DEFAULT NULL,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- INVOICES / VOUCHERS
-- Covers: سند قبض, سند صرف, فاتورة ضريبية, إيصال
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,

    -- Document type
    doc_type ENUM('receipt_voucher','disbursement_voucher','tax_invoice','simple_receipt') NOT NULL,

    -- Relations
    contract_id INT DEFAULT NULL,
    user_id INT DEFAULT NULL,

    -- Recipient (denormalized for historical accuracy)
    recipient_name VARCHAR(200) NOT NULL,
    recipient_id_number VARCHAR(20) DEFAULT NULL,
    recipient_phone VARCHAR(20) DEFAULT NULL,

    -- Payment info
    payment_method ENUM('cash','bank_transfer','mada','credit_card','stc_pay','other') DEFAULT 'bank_transfer',
    payment_reference VARCHAR(100) DEFAULT NULL,

    -- Amounts
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    vat_rate DECIMAL(5,2) DEFAULT 0,
    vat_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,

    -- Line items stored as JSON for flexibility
    -- Example: [{"description":"توثيق عقد تجاري","qty":1,"price":349}]
    line_items JSON NOT NULL,

    -- Description / notes
    description TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,

    -- Status
    status ENUM('draft','issued','paid','void') DEFAULT 'issued',
    issued_at DATE NOT NULL,
    paid_at DATE DEFAULT NULL,

    -- Audit
    issued_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (contract_id) REFERENCES commercial_contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_doc_type (doc_type),
    INDEX idx_status (status),
    INDEX idx_issued_at (issued_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- SITE CONTENT (admin-editable landing copy, phone, prices)
-- Simple key-value store with grouping
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `group_key` VARCHAR(50) NOT NULL,
    content_key VARCHAR(100) NOT NULL,
    content_value TEXT NOT NULL,
    content_label VARCHAR(200) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_key (`group_key`, content_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial editable content
INSERT INTO site_content (`group_key`, content_key, content_value, content_label) VALUES
    ('contact', 'whatsapp_phone', '966563214000', 'رقم الواتساب'),
    ('contact', 'support_phone', '0563214000', 'رقم الدعم الفني'),
    ('pricing', 'residential_price', '249', 'سعر العقد السكني'),
    ('pricing', 'residential_old_price', '549', 'السعر القديم للعقد السكني'),
    ('pricing', 'commercial_price', '349', 'سعر العقد التجاري'),
    ('pricing', 'commercial_old_price', '749', 'السعر القديم للعقد التجاري'),
    ('hero', 'badge_text', 'عقدك الموثق من شبكة إيجار خلال 25 دقيقة', 'نص الشارة في البانر'),
    ('hero', 'promise_minutes', '25', 'عدد الدقائق في الوعد')
ON DUPLICATE KEY UPDATE content_label = VALUES(content_label);

-- ------------------------------------------------------------
-- Update user roles: add clear employee permission
-- (column already exists, this just ensures an admin account)
-- ------------------------------------------------------------
-- If you need a quick employee account for testing:
-- INSERT INTO users (name, email, password, phone, role, is_verified) VALUES (
--     'موظف تجريبي', 'emp@nokba.com',
--     '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
--     '966500000001', 'employee', 1
-- );
