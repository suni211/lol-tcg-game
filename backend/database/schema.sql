-- LOL TCG Game Database Schema

CREATE DATABASE IF NOT EXISTS lol_tcg_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lol_tcg_game;

-- 사용자 테이블
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tier_points INT DEFAULT 0,
    current_tier VARCHAR(20) DEFAULT 'BRONZE_5',
    battle_energy INT DEFAULT 10,
    last_energy_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tier (current_tier),
    INDEX idx_tier_points (tier_points)
) ENGINE=InnoDB;

-- 선수 카드 마스터 테이블
CREATE TABLE cards_master (
    card_id INT PRIMARY KEY AUTO_INCREMENT,
    player_name VARCHAR(100) NOT NULL,
    season VARCHAR(20) NOT NULL,
    region VARCHAR(10) NOT NULL,
    team VARCHAR(50) NOT NULL,
    position VARCHAR(20) NOT NULL,
    overall_rating INT NOT NULL,
    card_tier VARCHAR(20) NOT NULL,
    card_price INT NOT NULL,
    image_url VARCHAR(255),
    stats_top INT DEFAULT 50,
    stats_jungle INT DEFAULT 50,
    stats_mid INT DEFAULT 50,
    stats_adc INT DEFAULT 50,
    stats_support INT DEFAULT 50,
    stats_teamfight INT DEFAULT 50,
    stats_laning INT DEFAULT 50,
    stats_macro INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_season (season),
    INDEX idx_region (region),
    INDEX idx_team (team),
    INDEX idx_overall (overall_rating)
) ENGINE=InnoDB;

-- 사용자 소유 카드 테이블
CREATE TABLE user_cards (
    user_card_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards_master(card_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_card_id (card_id)
) ENGINE=InnoDB;

-- 사용자 덱 테이블
CREATE TABLE user_decks (
    deck_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    deck_name VARCHAR(50) DEFAULT 'My Deck',
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- 덱 카드 구성 테이블 (5명의 선수)
CREATE TABLE deck_cards (
    deck_card_id INT PRIMARY KEY AUTO_INCREMENT,
    deck_id INT NOT NULL,
    user_card_id INT NOT NULL,
    position INT NOT NULL CHECK (position BETWEEN 1 AND 5),
    FOREIGN KEY (deck_id) REFERENCES user_decks(deck_id) ON DELETE CASCADE,
    FOREIGN KEY (user_card_id) REFERENCES user_cards(user_card_id) ON DELETE CASCADE,
    UNIQUE KEY unique_deck_position (deck_id, position),
    INDEX idx_deck_id (deck_id)
) ENGINE=InnoDB;

-- 배틀 기록 테이블
CREATE TABLE battles (
    battle_id INT PRIMARY KEY AUTO_INCREMENT,
    player1_id INT NOT NULL,
    player2_id INT NOT NULL,
    winner_id INT,
    player1_deck_id INT NOT NULL,
    player2_deck_id INT NOT NULL,
    player1_tier_change INT DEFAULT 0,
    player2_tier_change INT DEFAULT 0,
    battle_log TEXT,
    battle_duration INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (player1_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_player1 (player1_id),
    INDEX idx_player2 (player2_id),
    INDEX idx_started_at (started_at)
) ENGINE=InnoDB;

-- 매칭 큐 테이블
CREATE TABLE matchmaking_queue (
    queue_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    deck_id INT NOT NULL,
    current_tier VARCHAR(20) NOT NULL,
    tier_points INT NOT NULL,
    queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (deck_id) REFERENCES user_decks(deck_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_tier (current_tier),
    INDEX idx_queued_at (queued_at)
) ENGINE=InnoDB;

-- 팀 시너지 마스터 테이블
CREATE TABLE team_synergies (
    synergy_id INT PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(50) NOT NULL,
    season VARCHAR(20) NOT NULL,
    bonus_percentage INT DEFAULT 10,
    description TEXT,
    UNIQUE KEY unique_team_season (team_name, season)
) ENGINE=InnoDB;

-- 샘플 카드 데이터 삽입 (2025 LCK)
INSERT INTO cards_master (player_name, season, region, team, position, overall_rating, card_tier, card_price, stats_top, stats_jungle, stats_mid, stats_adc, stats_support, stats_teamfight, stats_laning, stats_macro, image_url) VALUES
-- T1 2025 (예상)
('Zeus', '25 LCK', 'LCK', 'T1', 'TOP', 92, 'LEGENDARY', 1000, 95, 40, 45, 30, 35, 93, 94, 90, '/images/cards/zeus_25.jpg'),
('Oner', '25 LCK', 'LCK', 'T1', 'JUNGLE', 90, 'LEGENDARY', 1000, 35, 94, 50, 35, 40, 91, 88, 92, '/images/cards/oner_25.jpg'),
('Faker', '25 LCK', 'LCK', 'T1', 'MID', 95, 'LEGENDARY', 1000, 30, 40, 98, 35, 35, 95, 93, 96, '/images/cards/faker_25.jpg'),
('Gumayusi', '25 LCK', 'LCK', 'T1', 'ADC', 91, 'LEGENDARY', 1000, 30, 35, 40, 95, 40, 92, 94, 89, '/images/cards/gumayusi_25.jpg'),
('Keria', '25 LCK', 'LCK', 'T1', 'SUPPORT', 93, 'LEGENDARY', 1000, 30, 40, 45, 40, 96, 94, 90, 95, '/images/cards/keria_25.jpg'),

-- Gen.G 2025
('Kiin', '25 LCK', 'LCK', 'Gen.G', 'TOP', 89, 'LEGENDARY', 1000, 92, 35, 40, 30, 35, 90, 91, 88, '/images/cards/kiin_25.jpg'),
('Canyon', '25 LCK', 'LCK', 'Gen.G', 'JUNGLE', 94, 'LEGENDARY', 1000, 35, 96, 45, 35, 40, 94, 92, 95, '/images/cards/canyon_25.jpg'),
('Chovy', '25 LCK', 'LCK', 'Gen.G', 'MID', 94, 'LEGENDARY', 1000, 30, 40, 96, 35, 35, 93, 95, 94, '/images/cards/chovy_25.jpg'),
('Peyz', '25 LCK', 'LCK', 'Gen.G', 'ADC', 88, 'LEGENDARY', 1000, 30, 35, 40, 92, 40, 89, 90, 87, '/images/cards/peyz_25.jpg'),
('Lehends', '25 LCK', 'LCK', 'Gen.G', 'SUPPORT', 90, 'LEGENDARY', 1000, 30, 40, 45, 40, 93, 91, 88, 92, '/images/cards/lehends_25.jpg'),

-- HLE 2025
('Kingen', '25 LCK', 'LCK', 'HLE', 'TOP', 85, 'EPIC', 1000, 88, 35, 40, 30, 35, 86, 87, 84, '/images/cards/kingen_25.jpg'),
('Peanut', '25 LCK', 'LCK', 'HLE', 'JUNGLE', 91, 'LEGENDARY', 1000, 35, 93, 45, 35, 40, 92, 89, 91, '/images/cards/peanut_25.jpg'),
('Zeka', '25 LCK', 'LCK', 'HLE', 'MID', 87, 'LEGENDARY', 1000, 30, 40, 90, 35, 35, 88, 89, 86, '/images/cards/zeka_25.jpg'),
('Viper', '25 LCK', 'LCK', 'HLE', 'ADC', 93, 'LEGENDARY', 1000, 30, 35, 40, 95, 40, 94, 95, 92, '/images/cards/viper_25.jpg'),
('Delight', '25 LCK', 'LCK', 'HLE', 'SUPPORT', 84, 'EPIC', 1000, 30, 40, 45, 40, 88, 85, 83, 85, '/images/cards/delight_25.jpg'),

-- KT 2025
('PerfecT', '25 LCK', 'LCK', 'KT', 'TOP', 82, 'EPIC', 1000, 85, 35, 40, 30, 35, 83, 84, 81, '/images/cards/perfect_25.jpg'),
('Pyosik', '25 LCK', 'LCK', 'KT', 'JUNGLE', 83, 'EPIC', 1000, 35, 86, 45, 35, 40, 84, 82, 83, '/images/cards/pyosik_25.jpg'),
('BDD', '25 LCK', 'LCK', 'KT', 'MID', 86, 'EPIC', 1000, 30, 40, 89, 35, 35, 87, 88, 85, '/images/cards/bdd_25.jpg'),
('Aiming', '25 LCK', 'LCK', 'KT', 'ADC', 84, 'EPIC', 1000, 30, 35, 40, 87, 40, 85, 86, 83, '/images/cards/aiming_25.jpg'),
('BeryL', '25 LCK', 'LCK', 'KT', 'SUPPORT', 87, 'EPIC', 1000, 30, 40, 45, 40, 90, 88, 85, 88, '/images/cards/beryl_25.jpg'),

-- DK 2025
('ShowMaker', '25 LCK', 'LCK', 'DK', 'MID', 90, 'LEGENDARY', 1000, 30, 40, 93, 35, 35, 91, 92, 89, '/images/cards/showmaker_25.jpg'),
('Deft', '25 LCK', 'LCK', 'DK', 'ADC', 89, 'LEGENDARY', 1000, 30, 35, 40, 92, 40, 90, 91, 88, '/images/cards/deft_25.jpg'),

-- 저등급 카드들 (RARE - 50~75 Overall)
('Rascal', '25 LCK', 'LCK', 'KDF', 'TOP', 74, 'RARE', 300, 78, 35, 40, 30, 35, 75, 76, 73, '/images/cards/rascal_25.jpg'),
('Cuzz', '25 LCK', 'LCK', 'KDF', 'JUNGLE', 72, 'RARE', 300, 35, 76, 45, 35, 40, 73, 71, 72, '/images/cards/cuzz_25.jpg'),
('Dove', '25 LCK', 'LCK', 'KDF', 'MID', 70, 'RARE', 300, 30, 40, 74, 35, 35, 71, 72, 69, '/images/cards/dove_25.jpg'),

-- 커먼 카드들 (COMMON - 30~55 Overall)
('Morgan', '25 LCK', 'LCK', 'DRX', 'TOP', 52, 'COMMON', 100, 56, 35, 40, 30, 35, 53, 54, 51, '/images/cards/morgan_25.jpg'),
('Sponge', '25 LCK', 'LCK', 'NS', 'JUNGLE', 48, 'COMMON', 100, 35, 52, 45, 35, 40, 49, 47, 48, '/images/cards/sponge_25.jpg'),
('Quad', '25 LCK', 'LCK', 'BRO', 'MID', 50, 'COMMON', 100, 30, 40, 54, 35, 35, 51, 52, 49, '/images/cards/quad_25.jpg'),
('Teddy', '25 LCK', 'LCK', 'NS', 'ADC', 54, 'COMMON', 100, 30, 35, 40, 58, 40, 55, 56, 53, '/images/cards/teddy_25.jpg'),
('Kellin', '25 LCK', 'LCK', 'DRX', 'SUPPORT', 51, 'COMMON', 100, 30, 40, 45, 40, 55, 52, 50, 51, '/images/cards/kellin_25.jpg');

-- 2025 LPL 샘플 카드
INSERT INTO cards_master (player_name, season, region, team, position, overall_rating, card_tier, card_price, stats_top, stats_jungle, stats_mid, stats_adc, stats_support, stats_teamfight, stats_laning, stats_macro, image_url) VALUES
-- BLG 2025
('Bin', '25 LPL', 'LPL', 'BLG', 'TOP', 93, 'LEGENDARY', 1000, 96, 40, 45, 30, 35, 94, 95, 91, '/images/cards/bin_25.jpg'),
('Xun', '25 LPL', 'LPL', 'BLG', 'JUNGLE', 89, 'LEGENDARY', 1000, 35, 92, 45, 35, 40, 90, 87, 89, '/images/cards/xun_25.jpg'),
('Knight', '25 LPL', 'LPL', 'BLG', 'MID', 92, 'LEGENDARY', 1000, 30, 40, 95, 35, 35, 93, 94, 91, '/images/cards/knight_25.jpg'),
('Elk', '25 LPL', 'LPL', 'BLG', 'ADC', 91, 'LEGENDARY', 1000, 30, 35, 40, 94, 40, 92, 93, 90, '/images/cards/elk_25.jpg'),
('ON', '25 LPL', 'LPL', 'BLG', 'SUPPORT', 88, 'LEGENDARY', 1000, 30, 40, 45, 40, 91, 89, 86, 89, '/images/cards/on_25.jpg'),

-- JDG 2025
('369', '25 LPL', 'LPL', 'JDG', 'TOP', 90, 'LEGENDARY', 1000, 93, 35, 40, 30, 35, 91, 92, 89, '/images/cards/369_25.jpg'),
('Kanavi', '25 LPL', 'LPL', 'JDG', 'JUNGLE', 95, 'LEGENDARY', 1000, 35, 97, 45, 35, 40, 96, 94, 95, '/images/cards/kanavi_25.jpg'),
('Yagao', '25 LPL', 'LPL', 'JDG', 'MID', 87, 'LEGENDARY', 1000, 30, 40, 90, 35, 35, 88, 89, 86, '/images/cards/yagao_25.jpg'),
('Ruler', '25 LPL', 'LPL', 'JDG', 'ADC', 94, 'LEGENDARY', 1000, 30, 35, 40, 96, 40, 95, 96, 93, '/images/cards/ruler_25.jpg'),
('Missing', '25 LPL', 'LPL', 'JDG', 'SUPPORT', 89, 'LEGENDARY', 1000, 30, 40, 45, 40, 92, 90, 87, 90, '/images/cards/missing_25.jpg'),

-- WBG 2025
('TheShy', '25 LPL', 'LPL', 'WBG', 'TOP', 88, 'LEGENDARY', 1000, 91, 35, 40, 30, 35, 89, 90, 87, '/images/cards/theshy_25.jpg'),
('Weiwei', '25 LPL', 'LPL', 'WBG', 'JUNGLE', 85, 'EPIC', 1000, 35, 88, 45, 35, 40, 86, 84, 85, '/images/cards/weiwei_25.jpg'),
('Xiaohu', '25 LPL', 'LPL', 'WBG', 'MID', 89, 'LEGENDARY', 1000, 30, 40, 92, 35, 35, 90, 91, 88, '/images/cards/xiaohu_25.jpg'),
('Light', '25 LPL', 'LPL', 'WBG', 'ADC', 86, 'EPIC', 1000, 30, 35, 40, 89, 40, 87, 88, 85, '/images/cards/light_25.jpg'),
('Crisp', '25 LPL', 'LPL', 'WBG', 'SUPPORT', 90, 'LEGENDARY', 1000, 30, 40, 45, 40, 93, 91, 88, 91, '/images/cards/crisp_25.jpg');

-- 팀 시너지 데이터 삽입
INSERT INTO team_synergies (team_name, season, bonus_percentage, description) VALUES
('T1', '25 LCK', 15, 'T1 2025 시즌 시너지 - 전설적인 조합'),
('Gen.G', '25 LCK', 15, 'Gen.G 2025 시즌 시너지 - 완벽한 팀워크'),
('HLE', '25 LCK', 12, 'HLE 2025 시즌 시너지 - 강력한 조합'),
('KT', '25 LCK', 10, 'KT 2025 시즌 시너지'),
('DK', '25 LCK', 10, 'DK 2025 시즌 시너지'),
('BLG', '25 LPL', 15, 'BLG 2025 시즌 시너지 - LPL 최강'),
('JDG', '25 LPL', 15, 'JDG 2025 시즌 시너지 - 완벽한 밸런스'),
('WBG', '25 LPL', 12, 'WBG 2025 시즌 시너지');
