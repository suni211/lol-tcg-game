-- IP 주소 기반 계정 제한 스키마
USE lol_tcg_game;

-- users 테이블에 IP 주소 컬럼 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS registration_ip VARCHAR(45) DEFAULT NULL COMMENT '가입 시 IP 주소 (IPv4/IPv6)',
ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45) DEFAULT NULL COMMENT '마지막 로그인 IP',
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL DEFAULT NULL COMMENT '마지막 로그인 시간',
ADD INDEX idx_registration_ip (registration_ip);

-- IP 차단 테이블 (관리자가 특정 IP 차단 가능)
CREATE TABLE IF NOT EXISTS blocked_ips (
    blocked_ip_id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    reason VARCHAR(255) DEFAULT NULL,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_by INT DEFAULT NULL COMMENT '차단한 관리자 user_id',
    UNIQUE KEY unique_ip (ip_address),
    INDEX idx_ip (ip_address)
) ENGINE=InnoDB;

-- IP 로그 테이블 (모든 가입 시도 기록)
CREATE TABLE IF NOT EXISTS registration_attempts (
    attempt_id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    username VARCHAR(50) DEFAULT NULL,
    success BOOLEAN DEFAULT FALSE,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_time (ip_address, attempted_at)
) ENGINE=InnoDB;
