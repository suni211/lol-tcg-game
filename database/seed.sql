-- 2025 시즌 정확한 선수 명단 (나무위키 기준)
-- 기존 데이터 삭제 후 재삽입

USE lol_tcg_game;

-- 기존 카드 데이터 삭제
DELETE FROM deck_cards;
DELETE FROM user_cards;
DELETE FROM cards_master;
DELETE FROM team_synergies;

-- ============================================
-- 2025 LCK 선수 카드
-- ============================================

-- Gen.G
INSERT INTO cards_master (player_name, season, region, team, position, overall_rating, card_tier, card_price, stats_top, stats_jungle, stats_mid, stats_adc, stats_support, stats_teamfight, stats_laning, stats_macro, image_url) VALUES
('Kiin', '25 LCK', 'LCK', 'Gen.G', 'TOP', 90, 'RARE', 300, 93, 35, 40, 30, 35, 91, 92, 89, '/images/cards/kiin_25.jpg'),
('Canyon', '25 LCK', 'LCK', 'Gen.G', 'JUNGLE', 95, 'EPIC', 500, 35, 97, 45, 35, 40, 96, 94, 95, '/images/cards/canyon_25.jpg'),
('Chovy', '25 LCK', 'LCK', 'Gen.G', 'MID', 96, 'LEGENDARY', 1000, 30, 40, 98, 35, 35, 95, 97, 96, '/images/cards/chovy_25.jpg'),
('Ruler', '25 LCK', 'LCK', 'Gen.G', 'ADC', 95, 'EPIC', 500, 30, 35, 40, 97, 40, 96, 97, 94, '/images/cards/ruler_25.jpg'),
('Duro', '25 LCK', 'LCK', 'Gen.G', 'SUPPORT', 88, 'RARE', 300, 30, 40, 45, 40, 91, 89, 87, 88, '/images/cards/duro_25.jpg'),

-- Hanwha Life Esports
('Zeus', '25 LCK', 'LCK', 'HLE', 'TOP', 95, 'EPIC', 500, 98, 40, 45, 30, 35, 96, 97, 94, '/images/cards/zeus_25.jpg'),
('Peanut', '25 LCK', 'LCK', 'HLE', 'JUNGLE', 92, 'EPIC', 500, 35, 94, 45, 35, 40, 93, 91, 92, '/images/cards/peanut_25.jpg'),
('Zeka', '25 LCK', 'LCK', 'HLE', 'MID', 88, 'RARE', 300, 30, 40, 91, 35, 35, 89, 90, 87, '/images/cards/zeka_25.jpg'),
('Viper', '25 LCK', 'LCK', 'HLE', 'ADC', 94, 'EPIC', 500, 30, 35, 40, 96, 40, 95, 96, 93, '/images/cards/viper_25.jpg'),
('Delight', '25 LCK', 'LCK', 'HLE', 'SUPPORT', 85, 'RARE', 300, 30, 40, 45, 40, 89, 86, 84, 85, '/images/cards/delight_25.jpg'),

-- KT Rolster
('PerfecT', '25 LCK', 'LCK', 'KT', 'TOP', 83, 'COMMON', 100, 86, 35, 40, 30, 35, 84, 85, 82, '/images/cards/perfect_25.jpg'),
('Cuzz', '25 LCK', 'LCK', 'KT', 'JUNGLE', 85, 'RARE', 300, 35, 88, 45, 35, 40, 86, 84, 85, '/images/cards/cuzz_25.jpg'),
('BDD', '25 LCK', 'LCK', 'KT', 'MID', 87, 'RARE', 300, 30, 40, 90, 35, 35, 88, 89, 86, '/images/cards/bdd_25.jpg'),
('deokdam', '25 LCK', 'LCK', 'KT', 'ADC', 84, 'COMMON', 100, 30, 35, 40, 87, 40, 85, 86, 83, '/images/cards/deokdam_25.jpg'),
('Peter', '25 LCK', 'LCK', 'KT', 'SUPPORT', 82, 'COMMON', 100, 30, 40, 45, 40, 86, 83, 81, 82, '/images/cards/peter_25.jpg'),

-- T1
('Doran', '25 LCK', 'LCK', 'T1', 'TOP', 87, 'RARE', 300, 90, 35, 40, 30, 35, 88, 89, 86, '/images/cards/doran_25.jpg'),
('Oner', '25 LCK', 'LCK', 'T1', 'JUNGLE', 93, 'EPIC', 500, 35, 96, 50, 35, 40, 94, 91, 95, '/images/cards/oner_25.jpg'),
('Faker', '25 LCK', 'LCK', 'T1', 'MID', 97, 'LEGENDARY', 1000, 30, 40, 99, 35, 35, 98, 96, 97, '/images/cards/faker_25.jpg'),
('Gumayusi', '25 LCK', 'LCK', 'T1', 'ADC', 92, 'EPIC', 500, 30, 35, 40, 96, 40, 93, 95, 91, '/images/cards/gumayusi_25.jpg'),
('Keria', '25 LCK', 'LCK', 'T1', 'SUPPORT', 94, 'EPIC', 500, 30, 40, 45, 40, 97, 95, 93, 96, '/images/cards/keria_25.jpg'),

-- Dplus KIA
('Siwoo', '25 LCK', 'LCK', 'DK', 'TOP', 81, 'COMMON', 100, 84, 35, 40, 30, 35, 82, 83, 80, '/images/cards/siwoo_25.jpg'),
('Lucid', '25 LCK', 'LCK', 'DK', 'JUNGLE', 80, 'COMMON', 100, 35, 83, 45, 35, 40, 81, 79, 80, '/images/cards/lucid_25.jpg'),
('ShowMaker', '25 LCK', 'LCK', 'DK', 'MID', 91, 'RARE', 300, 30, 40, 94, 35, 35, 92, 93, 90, '/images/cards/showmaker_25.jpg'),
('Aiming', '25 LCK', 'LCK', 'DK', 'ADC', 85, 'RARE', 300, 30, 35, 40, 88, 40, 86, 87, 84, '/images/cards/aiming_25.jpg'),
('BeryL', '25 LCK', 'LCK', 'DK', 'SUPPORT', 88, 'RARE', 300, 30, 40, 45, 40, 91, 89, 87, 88, '/images/cards/beryl_25.jpg'),

-- Nongshim RedForce
('Kingen', '25 LCK', 'LCK', 'NS', 'TOP', 82, 'COMMON', 100, 85, 35, 40, 30, 35, 83, 84, 81, '/images/cards/kingen_25.jpg'),
('GIDEON', '25 LCK', 'LCK', 'NS', 'JUNGLE', 76, 'COMMON', 100, 35, 80, 45, 35, 40, 77, 75, 76, '/images/cards/gideon_25.jpg'),
('Calix', '25 LCK', 'LCK', 'NS', 'MID', 75, 'COMMON', 100, 30, 40, 79, 35, 35, 76, 77, 74, '/images/cards/calix_25.jpg'),
('Jiwoo', '25 LCK', 'LCK', 'NS', 'ADC', 74, 'COMMON', 100, 30, 35, 40, 78, 40, 75, 76, 73, '/images/cards/jiwoo_25.jpg'),
('Lehends', '25 LCK', 'LCK', 'NS', 'SUPPORT', 87, 'RARE', 300, 30, 40, 45, 40, 90, 88, 86, 87, '/images/cards/lehends_25.jpg'),

-- OKSavingsBank BRION
('Morgan', '25 LCK', 'LCK', 'BRO', 'TOP', 70, 'COMMON', 100, 74, 35, 40, 30, 35, 71, 72, 69, '/images/cards/morgan_25.jpg'),
('Croco', '25 LCK', 'LCK', 'BRO', 'JUNGLE', 76, 'COMMON', 100, 35, 80, 45, 35, 40, 77, 75, 76, '/images/cards/croco_25.jpg'),
('Clozer', '25 LCK', 'LCK', 'BRO', 'MID', 78, 'COMMON', 100, 30, 40, 82, 35, 35, 79, 80, 77, '/images/cards/clozer_25.jpg'),
('Hype', '25 LCK', 'LCK', 'BRO', 'ADC', 72, 'COMMON', 100, 30, 35, 40, 76, 40, 73, 74, 71, '/images/cards/hype_25.jpg'),
('Pollu', '25 LCK', 'LCK', 'BRO', 'SUPPORT', 69, 'COMMON', 100, 30, 40, 45, 40, 73, 70, 68, 69, '/images/cards/pollu_25.jpg'),

-- DRX
('Rich', '25 LCK', 'LCK', 'DRX', 'TOP', 73, 'COMMON', 100, 77, 35, 40, 30, 35, 74, 75, 72, '/images/cards/rich_25.jpg'),
('Sponge', '25 LCK', 'LCK', 'DRX', 'JUNGLE', 71, 'COMMON', 100, 35, 75, 45, 35, 40, 72, 70, 71, '/images/cards/sponge_25.jpg'),
('kyeahoo', '25 LCK', 'LCK', 'DRX', 'MID', 70, 'COMMON', 100, 30, 40, 74, 35, 35, 71, 72, 69, '/images/cards/kyeahoo_25.jpg'),
('Teddy', '25 LCK', 'LCK', 'DRX', 'ADC', 83, 'COMMON', 100, 30, 35, 40, 86, 40, 84, 85, 82, '/images/cards/teddy_25.jpg'),
('Andil', '25 LCK', 'LCK', 'DRX', 'SUPPORT', 68, 'COMMON', 100, 30, 40, 45, 40, 72, 69, 67, 68, '/images/cards/andil_25.jpg'),

-- DN FREECS
('DuDu', '25 LCK', 'LCK', 'DNF', 'TOP', 68, 'COMMON', 100, 72, 35, 40, 30, 35, 69, 70, 67, '/images/cards/dudu_25.jpg'),
('Pyosik', '25 LCK', 'LCK', 'DNF', 'JUNGLE', 79, 'COMMON', 100, 35, 83, 45, 35, 40, 80, 78, 79, '/images/cards/pyosik_25.jpg'),
('BuLLDoG', '25 LCK', 'LCK', 'DNF', 'MID', 67, 'COMMON', 100, 30, 40, 71, 35, 35, 68, 69, 66, '/images/cards/bulldog_25.jpg'),
('Berserker', '25 LCK', 'LCK', 'DNF', 'ADC', 82, 'COMMON', 100, 30, 35, 40, 85, 40, 83, 84, 81, '/images/cards/berserker_25.jpg'),
('Life', '25 LCK', 'LCK', 'DNF', 'SUPPORT', 77, 'COMMON', 100, 30, 40, 45, 40, 81, 78, 76, 77, '/images/cards/life_25.jpg'),

-- BNK FEARX
('Clear', '25 LCK', 'LCK', 'FEARX', 'TOP', 75, 'COMMON', 100, 79, 35, 40, 30, 35, 76, 77, 74, '/images/cards/clear_25.jpg'),
('Raptor', '25 LCK', 'LCK', 'FEARX', 'JUNGLE', 73, 'COMMON', 100, 35, 77, 45, 35, 40, 74, 72, 73, '/images/cards/raptor_25.jpg'),
('VicLa', '25 LCK', 'LCK', 'FEARX', 'MID', 76, 'COMMON', 100, 30, 40, 80, 35, 35, 77, 78, 75, '/images/cards/vicla_25.jpg'),
('Diable', '25 LCK', 'LCK', 'FEARX', 'ADC', 74, 'COMMON', 100, 30, 35, 40, 78, 40, 75, 76, 73, '/images/cards/diable_25.jpg'),
('Kellin', '25 LCK', 'LCK', 'FEARX', 'SUPPORT', 77, 'COMMON', 100, 30, 40, 45, 40, 81, 78, 76, 77, '/images/cards/kellin_25.jpg');

-- ============================================
-- 2025 LPL 선수 카드
-- ============================================

-- BLG (Bilibili Gaming)
INSERT INTO cards_master (player_name, season, region, team, position, overall_rating, card_tier, card_price, stats_top, stats_jungle, stats_mid, stats_adc, stats_support, stats_teamfight, stats_laning, stats_macro, image_url) VALUES
('Bin', '25 LPL', 'LPL', 'BLG', 'TOP', 94, 'EPIC', 500, 97, 40, 45, 30, 35, 95, 96, 93, '/images/cards/bin_25.jpg'),
('Xun', '25 LPL', 'LPL', 'BLG', 'JUNGLE', 90, 'RARE', 300, 35, 93, 45, 35, 40, 91, 89, 90, '/images/cards/xun_25.jpg'),
('Knight', '25 LPL', 'LPL', 'BLG', 'MID', 93, 'EPIC', 500, 30, 40, 96, 35, 35, 94, 95, 92, '/images/cards/knight_25.jpg'),
('Elk', '25 LPL', 'LPL', 'BLG', 'ADC', 92, 'EPIC', 500, 30, 35, 40, 95, 40, 93, 94, 91, '/images/cards/elk_25.jpg'),
('ON', '25 LPL', 'LPL', 'BLG', 'SUPPORT', 89, 'RARE', 300, 30, 40, 45, 40, 92, 90, 88, 89, '/images/cards/on_25.jpg'),

-- JDG (JD Gaming)
('369', '25 LPL', 'LPL', 'JDG', 'TOP', 91, 'RARE', 300, 94, 35, 40, 30, 35, 92, 93, 90, '/images/cards/369_25.jpg'),
('Kanavi', '25 LPL', 'LPL', 'JDG', 'JUNGLE', 96, 'LEGENDARY', 1000, 35, 98, 45, 35, 40, 97, 95, 96, '/images/cards/kanavi_25.jpg'),
('Yagao', '25 LPL', 'LPL', 'JDG', 'MID', 88, 'RARE', 300, 30, 40, 91, 35, 35, 89, 90, 87, '/images/cards/yagao_25.jpg'),
('Ruler', '25 LPL', 'LPL', 'JDG', 'ADC', 95, 'EPIC', 500, 30, 35, 40, 97, 40, 96, 97, 94, '/images/cards/ruler_jdg_25.jpg'),
('Missing', '25 LPL', 'LPL', 'JDG', 'SUPPORT', 90, 'RARE', 300, 30, 40, 45, 40, 93, 91, 89, 90, '/images/cards/missing_25.jpg'),

-- WBG (Weibo Gaming)
('TheShy', '25 LPL', 'LPL', 'WBG', 'TOP', 89, 'RARE', 300, 92, 35, 40, 30, 35, 90, 91, 88, '/images/cards/theshy_25.jpg'),
('Weiwei', '25 LPL', 'LPL', 'WBG', 'JUNGLE', 86, 'RARE', 300, 35, 89, 45, 35, 40, 87, 85, 86, '/images/cards/weiwei_25.jpg'),
('Xiaohu', '25 LPL', 'LPL', 'WBG', 'MID', 90, 'RARE', 300, 30, 40, 93, 35, 35, 91, 92, 89, '/images/cards/xiaohu_25.jpg'),
('Light', '25 LPL', 'LPL', 'WBG', 'ADC', 87, 'RARE', 300, 30, 35, 40, 90, 40, 88, 89, 86, '/images/cards/light_25.jpg'),
('Crisp', '25 LPL', 'LPL', 'WBG', 'SUPPORT', 91, 'RARE', 300, 30, 40, 45, 40, 94, 92, 90, 91, '/images/cards/crisp_25.jpg'),

-- TES (Top Esports)
('Wayward', '25 LPL', 'LPL', 'TES', 'TOP', 85, 'RARE', 300, 88, 35, 40, 30, 35, 86, 87, 84, '/images/cards/wayward_25.jpg'),
('Tian', '25 LPL', 'LPL', 'TES', 'JUNGLE', 93, 'EPIC', 500, 35, 95, 45, 35, 40, 94, 92, 93, '/images/cards/tian_25.jpg'),
('Creme', '25 LPL', 'LPL', 'TES', 'MID', 89, 'RARE', 300, 30, 40, 92, 35, 35, 90, 91, 88, '/images/cards/creme_25.jpg'),
('JackeyLove', '25 LPL', 'LPL', 'TES', 'ADC', 93, 'EPIC', 500, 30, 35, 40, 96, 40, 94, 95, 92, '/images/cards/jackeylove_25.jpg'),
('Meiko', '25 LPL', 'LPL', 'TES', 'SUPPORT', 92, 'EPIC', 500, 30, 40, 45, 40, 95, 93, 91, 92, '/images/cards/meiko_25.jpg'),

-- LNG (LNG Esports)
('Zika', '25 LPL', 'LPL', 'LNG', 'TOP', 87, 'RARE', 300, 90, 35, 40, 30, 35, 88, 89, 86, '/images/cards/zika_25.jpg'),
('Tarzan', '25 LPL', 'LPL', 'LNG', 'JUNGLE', 91, 'RARE', 300, 35, 94, 45, 35, 40, 92, 90, 91, '/images/cards/tarzan_25.jpg'),
('Scout', '25 LPL', 'LPL', 'LNG', 'MID', 92, 'EPIC', 500, 30, 40, 95, 35, 35, 93, 94, 91, '/images/cards/scout_25.jpg'),
('GALA', '25 LPL', 'LPL', 'LNG', 'ADC', 94, 'EPIC', 500, 30, 35, 40, 97, 40, 95, 96, 93, '/images/cards/gala_25.jpg'),
('Hang', '25 LPL', 'LPL', 'LNG', 'SUPPORT', 88, 'RARE', 300, 30, 40, 45, 40, 91, 89, 87, 88, '/images/cards/hang_25.jpg'),

-- IG (Invictus Gaming)
('Neny', '25 LPL', 'LPL', 'IG', 'TOP', 78, 'COMMON', 100, 82, 35, 40, 30, 35, 79, 80, 77, '/images/cards/neny_25.jpg'),
('Tianzhen', '25 LPL', 'LPL', 'IG', 'JUNGLE', 76, 'COMMON', 100, 35, 80, 45, 35, 40, 77, 75, 76, '/images/cards/tianzhen_25.jpg'),
('Cryin', '25 LPL', 'LPL', 'IG', 'MID', 79, 'COMMON', 100, 30, 40, 83, 35, 35, 80, 81, 78, '/images/cards/cryin_25.jpg'),
('Ahn', '25 LPL', 'LPL', 'IG', 'ADC', 77, 'COMMON', 100, 30, 35, 40, 81, 40, 78, 79, 76, '/images/cards/ahn_25.jpg'),
('Wink', '25 LPL', 'LPL', 'IG', 'SUPPORT', 75, 'COMMON', 100, 30, 40, 45, 40, 79, 76, 74, 75, '/images/cards/wink_25.jpg');

-- ============================================
-- 2025 LEC 선수 카드
-- ============================================

-- G2 Esports
INSERT INTO cards_master (player_name, season, region, team, position, overall_rating, card_tier, card_price, stats_top, stats_jungle, stats_mid, stats_adc, stats_support, stats_teamfight, stats_laning, stats_macro, image_url) VALUES
('BrokenBlade', '25 LEC', 'LEC', 'G2', 'TOP', 89, 'RARE', 300, 92, 35, 40, 30, 35, 90, 91, 88, '/images/cards/brokenblade_25.jpg'),
('Yike', '25 LEC', 'LEC', 'G2', 'JUNGLE', 87, 'RARE', 300, 35, 90, 45, 35, 40, 88, 86, 87, '/images/cards/yike_25.jpg'),
('Caps', '25 LEC', 'LEC', 'G2', 'MID', 93, 'EPIC', 500, 30, 40, 96, 35, 35, 94, 95, 92, '/images/cards/caps_25.jpg'),
('Hans Sama', '25 LEC', 'LEC', 'G2', 'ADC', 90, 'RARE', 300, 30, 35, 40, 93, 40, 91, 92, 89, '/images/cards/hanssama_25.jpg'),
('Mikyx', '25 LEC', 'LEC', 'G2', 'SUPPORT', 88, 'RARE', 300, 30, 40, 45, 40, 91, 89, 87, 88, '/images/cards/mikyx_25.jpg'),

-- Fnatic
('Oscarinin', '25 LEC', 'LEC', 'FNC', 'TOP', 86, 'RARE', 300, 89, 35, 40, 30, 35, 87, 88, 85, '/images/cards/oscarinin_25.jpg'),
('Razork', '25 LEC', 'LEC', 'FNC', 'JUNGLE', 85, 'RARE', 300, 35, 88, 45, 35, 40, 86, 84, 85, '/images/cards/razork_25.jpg'),
('Humanoid', '25 LEC', 'LEC', 'FNC', 'MID', 88, 'RARE', 300, 30, 40, 91, 35, 35, 89, 90, 87, '/images/cards/humanoid_25.jpg'),
('Noah', '25 LEC', 'LEC', 'FNC', 'ADC', 84, 'COMMON', 100, 30, 35, 40, 87, 40, 85, 86, 83, '/images/cards/noah_25.jpg'),
('Jun', '25 LEC', 'LEC', 'FNC', 'SUPPORT', 83, 'COMMON', 100, 30, 40, 45, 40, 87, 84, 82, 83, '/images/cards/jun_25.jpg'),

-- MAD Lions
('Chasy', '25 LEC', 'LEC', 'MAD', 'TOP', 82, 'COMMON', 100, 85, 35, 40, 30, 35, 83, 84, 81, '/images/cards/chasy_25.jpg'),
('Elyoya', '25 LEC', 'LEC', 'MAD', 'JUNGLE', 87, 'RARE', 300, 35, 90, 45, 35, 40, 88, 86, 87, '/images/cards/elyoya_25.jpg'),
('Nisqy', '25 LEC', 'LEC', 'MAD', 'MID', 85, 'RARE', 300, 30, 40, 88, 35, 35, 86, 87, 84, '/images/cards/nisqy_25.jpg'),
('Carzzy', '25 LEC', 'LEC', 'MAD', 'ADC', 84, 'COMMON', 100, 30, 35, 40, 87, 40, 85, 86, 83, '/images/cards/carzzy_25.jpg'),
('Alvaro', '25 LEC', 'LEC', 'MAD', 'SUPPORT', 81, 'COMMON', 100, 30, 40, 45, 40, 85, 82, 80, 81, '/images/cards/alvaro_25.jpg');

-- ============================================
-- 2025 LCS/LTA 선수 카드
-- ============================================

-- Cloud9
INSERT INTO cards_master (player_name, season, region, team, position, overall_rating, card_tier, card_price, stats_top, stats_jungle, stats_mid, stats_adc, stats_support, stats_teamfight, stats_laning, stats_macro, image_url) VALUES
('Thanatos', '25 LCS', 'LCS', 'C9', 'TOP', 83, 'COMMON', 100, 86, 35, 40, 30, 35, 84, 85, 82, '/images/cards/thanatos_25.jpg'),
('Blaber', '25 LCS', 'LCS', 'C9', 'JUNGLE', 88, 'RARE', 300, 35, 91, 45, 35, 40, 89, 87, 88, '/images/cards/blaber_25.jpg'),
('Jojopyun', '25 LCS', 'LCS', 'C9', 'MID', 85, 'RARE', 300, 30, 40, 88, 35, 35, 86, 87, 84, '/images/cards/jojopyun_25.jpg'),
('Berserker', '25 LCS', 'LCS', 'C9', 'ADC', 89, 'RARE', 300, 30, 35, 40, 92, 40, 90, 91, 88, '/images/cards/berserker_c9_25.jpg'),
('Vulcan', '25 LCS', 'LCS', 'C9', 'SUPPORT', 84, 'COMMON', 100, 30, 40, 45, 40, 88, 85, 83, 84, '/images/cards/vulcan_25.jpg'),

-- Team Liquid
('Impact', '25 LCS', 'LCS', 'TL', 'TOP', 86, 'RARE', 300, 89, 35, 40, 30, 35, 87, 88, 85, '/images/cards/impact_25.jpg'),
('Umti', '25 LCS', 'LCS', 'TL', 'JUNGLE', 82, 'COMMON', 100, 35, 85, 45, 35, 40, 83, 81, 82, '/images/cards/umti_25.jpg'),
('APA', '25 LCS', 'LCS', 'TL', 'MID', 85, 'RARE', 300, 30, 40, 88, 35, 35, 86, 87, 84, '/images/cards/apa_25.jpg'),
('Yeon', '25 LCS', 'LCS', 'TL', 'ADC', 83, 'COMMON', 100, 30, 35, 40, 86, 40, 84, 85, 82, '/images/cards/yeon_25.jpg'),
('CoreJJ', '25 LCS', 'LCS', 'TL', 'SUPPORT', 90, 'RARE', 300, 30, 40, 45, 40, 93, 91, 89, 90, '/images/cards/corejj_25.jpg');

-- 팀 시너지 업데이트
INSERT INTO team_synergies (team_name, season, bonus_percentage, description) VALUES
('Gen.G', '25 LCK', 15, ''),
('HLE', '25 LCK', 15, ''),
('KT', '25 LCK', 12, ''),
('T1', '25 LCK', 14, ''),
('DK', '25 LCK', 12, ''),
('NS', '25 LCK', 11, ''),
('BRO', '25 LCK', 9, ''),
('DRX', '25 LCK', 10, ''),
('DNF', '25 LCK', 10, ''),

('BLG', '25 LPL', 15, ''),
('JDG', '25 LPL', 15, ''),
('WBG', '25 LPL', 14, ''),
('TES', '25 LPL', 14, ''),
('LNG', '25 LPL', 14, ''),
('IG', '25 LPL', 10, ''),

('G2', '25 LEC', 14, ''),
('FNC', '25 LEC', 13, ''),
('MAD', '25 LEC', 12, ''),

('C9', '25 LCS', 12, ''),
('TL', '25 LCS', 12, '');
