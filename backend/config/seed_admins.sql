-- ============================================================
-- Seed admin accounts
-- Run this in phpMyAdmin → SQL tab on u902557766_nokbh
-- Both accounts use temporary password "admin123" — CHANGE IT after first login.
-- ============================================================

USE u902557766_nokbh;

-- Admin 1: WhatsApp number
INSERT INTO users (name, email, password, phone, role, is_verified)
VALUES (
    'مدير النخبة',
    'admin@alnokbh.sa',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    '966563214000',
    'admin',
    1
)
ON DUPLICATE KEY UPDATE
    role = 'admin',
    is_verified = 1,
    name = VALUES(name);

-- Admin 2: Mohammed
INSERT INTO users (name, email, password, phone, role, is_verified)
VALUES (
    'محمد',
    'mohammed@alnokbh.sa',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    '966558696269',
    'admin',
    1
)
ON DUPLICATE KEY UPDATE
    role = 'admin',
    is_verified = 1,
    name = VALUES(name);

-- Verify
SELECT id, name, phone, role, is_verified FROM users WHERE role = 'admin';
