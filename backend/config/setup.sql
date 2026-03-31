CREATE DATABASE IF NOT EXISTS nokba CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nokba;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('admin', 'employee', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    contract_type ENUM('residential', 'commercial') NOT NULL DEFAULT 'residential',
    property_type VARCHAR(100) NOT NULL,

    -- Landlord info
    landlord_name VARCHAR(255) NOT NULL,
    landlord_id_number VARCHAR(20) DEFAULT '',
    landlord_phone VARCHAR(20) DEFAULT '',

    -- Tenant info
    tenant_name VARCHAR(255) NOT NULL,
    tenant_id_number VARCHAR(20) DEFAULT '',
    tenant_phone VARCHAR(20) DEFAULT '',

    -- Property location
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) DEFAULT '',
    street VARCHAR(255) DEFAULT '',
    building_number VARCHAR(50) DEFAULT '',

    -- Financial
    rent_amount DECIMAL(12, 2) NOT NULL,
    rent_period ENUM('monthly', 'quarterly', 'semi_annual', 'annual') NOT NULL DEFAULT 'annual',

    -- Dates
    contract_start DATE DEFAULT NULL,
    contract_end DATE DEFAULT NULL,

    -- Status
    status ENUM('pending', 'in_progress', 'reviewing', 'completed', 'rejected') DEFAULT 'pending',
    notes TEXT DEFAULT '',

    -- Attachments
    ejar_number VARCHAR(50) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contract activity logs (for SSE real-time updates)
CREATE TABLE IF NOT EXISTS contract_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT DEFAULT '',
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    INDEX idx_contract (contract_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin
INSERT INTO users (name, email, password, phone, role) VALUES (
    'مدير النظام',
    'admin@nokba.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    '0500000000',
    'admin'
);
