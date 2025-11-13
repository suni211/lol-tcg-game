-- 카드 강화 컬럼 추가
ALTER TABLE user_cards
ADD COLUMN enhancement_level INT DEFAULT 0 COMMENT '강화 레벨 (0-10)',
ADD COLUMN enhanced_ovr INT DEFAULT NULL COMMENT '강화된 OVR (NULL이면 기본 OVR 사용)';

-- 강화 기록 테이블
CREATE TABLE IF NOT EXISTS card_enhancements (
    enhancement_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_card_id INT NOT NULL COMMENT '강화할 카드 ID',
    material_card_id INT NOT NULL COMMENT '재료로 사용한 카드 ID',
    enhancement_level INT NOT NULL COMMENT '강화 후 레벨',
    ovr_before INT NOT NULL,
    ovr_after INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (target_card_id) REFERENCES user_cards(user_card_id) ON DELETE CASCADE,
    INDEX idx_user_enhancements (user_id, created_at)
);
