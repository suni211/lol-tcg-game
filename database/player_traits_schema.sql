-- 선수 고유 특성 시스템
USE lol_tcg_game;

-- cards_master 테이블에 특성 컬럼 추가
ALTER TABLE cards_master
ADD COLUMN IF NOT EXISTS trait_1 VARCHAR(50) DEFAULT NULL COMMENT '주 특성',
ADD COLUMN IF NOT EXISTS trait_2 VARCHAR(50) DEFAULT NULL COMMENT '부 특성',
ADD COLUMN IF NOT EXISTS trait_3 VARCHAR(50) DEFAULT NULL COMMENT '추가 특성',
ADD COLUMN IF NOT EXISTS playstyle VARCHAR(30) DEFAULT NULL COMMENT '플레이 스타일 (aggressive, defensive, balanced, clutch)';

-- 특성 마스터 테이블 (특성 효과 정의)
CREATE TABLE IF NOT EXISTS player_traits (
    trait_id INT PRIMARY KEY AUTO_INCREMENT,
    trait_name VARCHAR(50) UNIQUE NOT NULL,
    trait_category VARCHAR(30) NOT NULL COMMENT 'carry, playmaker, support, tank, utility',
    description TEXT,
    effect_type VARCHAR(30) NOT NULL COMMENT 'laning_boost, teamfight_boost, clutch, comeback, snowball, vision, engage, peel',
    effect_value INT DEFAULT 0 COMMENT '효과 수치 (퍼센트 또는 점수)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 포지션별 시너지 테이블
CREATE TABLE IF NOT EXISTS position_synergies (
    synergy_id INT PRIMARY KEY AUTO_INCREMENT,
    position_1 VARCHAR(20) NOT NULL,
    position_2 VARCHAR(20) NOT NULL,
    synergy_type VARCHAR(30) NOT NULL COMMENT 'jungle_mid, bot_duo, top_jungle, etc',
    bonus_percentage INT DEFAULT 5,
    description TEXT,
    UNIQUE KEY unique_position_pair (position_1, position_2, synergy_type)
) ENGINE=InnoDB;

-- 특성 데이터 삽입
INSERT INTO player_traits (trait_name, trait_category, description, effect_type, effect_value) VALUES
-- 캐리 특성
('하이퍼캐리', 'carry', '후반 팀파이트에서 압도적인 딜을 넣습니다', 'teamfight_boost', 15),
('솔로킬러', 'carry', '라인전에서 상대를 압도합니다', 'laning_boost', 20),
('스노볼러', 'carry', '우위를 잡으면 더욱 강력해집니다', 'snowball', 12),

-- 플레이메이커 특성
('클러치', 'playmaker', '중요한 순간에 빛을 발합니다', 'clutch', 18),
('역전의 명수', 'playmaker', '불리한 상황에서 더 강해집니다', 'comeback', 15),
('만능 플레이어', 'playmaker', '모든 상황에서 안정적입니다', 'teamfight_boost', 10),

-- 정글러 특성
('맵 장악', 'playmaker', '정글과 시야 싸움에서 우위를 가져갑니다', 'vision', 15),
('갱킹 마스터', 'playmaker', '라인 개입력이 뛰어납니다', 'laning_boost', 12),
('정글 지배자', 'carry', '정글 대결에서 압도합니다', 'jungle_control', 18),

-- 서포터 특성
('완벽한 보호', 'support', '아군 캐리를 지켜냅니다', 'peel', 15),
('완벽한 이니시', 'support', '팀파이트 개시력이 뛰어납니다', 'engage', 18),
('시야 장악', 'support', '시야 싸움에서 우위를 점합니다', 'vision', 12),

-- 탱커 특성
('불굴의 탱커', 'tank', '전선을 유지하며 버팁니다', 'teamfight_boost', 12),
('이니시에이터', 'tank', '한타 개시에 특화되어 있습니다', 'engage', 15),

-- 유틸리티 특성
('팀플레이어', 'utility', '팀 전체의 능력을 향상시킵니다', 'team_boost', 10),
('멘탈 강철', 'utility', '압박 상황에서도 흔들리지 않습니다', 'clutch', 8),
('경험 많은 베테랑', 'utility', '모든 스탯에 소폭 보너스를 받습니다', 'all_round', 5);

-- 포지션 시너지 데이터 삽입
INSERT INTO position_synergies (position_1, position_2, synergy_type, bonus_percentage, description) VALUES
('JUNGLE', 'MID', 'jungle_mid', 8, '정글-미드 연계 플레이'),
('ADC', 'SUPPORT', 'bot_duo', 12, '봇 듀오 조합력'),
('TOP', 'JUNGLE', 'top_jungle', 7, '탑-정글 연계'),
('MID', 'SUPPORT', 'mid_sup_roam', 6, '미드-서폿 로밍 연계'),
('JUNGLE', 'SUPPORT', 'jungle_sup_vision', 10, '정글-서폿 시야 장악');

-- 주요 선수들에게 특성 부여 (예시)
UPDATE cards_master SET
    trait_1 = '하이퍼캐리',
    trait_2 = '클러치',
    playstyle = 'aggressive'
WHERE player_name = 'Faker';

UPDATE cards_master SET
    trait_1 = '솔로킬러',
    trait_2 = '스노볼러',
    playstyle = 'aggressive'
WHERE player_name = 'Zeus';

UPDATE cards_master SET
    trait_1 = '정글 지배자',
    trait_2 = '맵 장악',
    playstyle = 'balanced'
WHERE player_name IN ('Canyon', 'Oner');

UPDATE cards_master SET
    trait_1 = '완벽한 이니시',
    trait_2 = '시야 장악',
    playstyle = 'balanced'
WHERE player_name = 'Keria';

UPDATE cards_master SET
    trait_1 = '하이퍼캐리',
    trait_2 = '만능 플레이어',
    playstyle = 'balanced'
WHERE player_name IN ('Gumayusi', 'Viper', 'Ruler');

UPDATE cards_master SET
    trait_1 = '클러치',
    trait_2 = '만능 플레이어',
    playstyle = 'clutch'
WHERE player_name = 'Chovy';

UPDATE cards_master SET
    trait_1 = '갱킹 마스터',
    trait_2 = '역전의 명수',
    playstyle = 'aggressive'
WHERE player_name = 'Peanut';

UPDATE cards_master SET
    trait_1 = '솔로킬러',
    trait_2 = '하이퍼캐리',
    playstyle = 'aggressive'
WHERE player_name = 'Bin';

UPDATE cards_master SET
    trait_1 = '정글 지배자',
    trait_2 = '맵 장악',
    playstyle = 'balanced'
WHERE player_name = 'Kanavi';

-- 나머지 선수들에게 기본 특성 부여
UPDATE cards_master SET
    trait_1 = '팀플레이어',
    playstyle = 'balanced'
WHERE trait_1 IS NULL AND overall_rating >= 80;

UPDATE cards_master SET
    trait_1 = '경험 많은 베테랑',
    playstyle = 'balanced'
WHERE trait_1 IS NULL AND overall_rating >= 50;
