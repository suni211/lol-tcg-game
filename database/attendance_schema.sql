-- 출석체크 테이블
CREATE TABLE IF NOT EXISTS daily_attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    check_date DATE NOT NULL,
    points_earned INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, check_date),
    INDEX idx_user_date (user_id, check_date)
);

-- 연속 출석 보너스 기록
CREATE TABLE IF NOT EXISTS attendance_streak (
    user_id INT PRIMARY KEY,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_check_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
