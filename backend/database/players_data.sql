-- 추가 선수 카드 데이터 (더 많은 선수 추가)

USE lol_tcg_game;

-- LCK 2025 추가 선수들
INSERT INTO cards_master (player_name, season, region, team, position, overall_rating, card_tier, card_price, stats_top, stats_jungle, stats_mid, stats_adc, stats_support, stats_teamfight, stats_laning, stats_macro, image_url) VALUES

-- KT 추가
('Doran', '25 LCK', 'LCK', 'KT', 'TOP', 85, 'EPIC', 1000, 88, 35, 40, 30, 35, 86, 87, 84, '/images/cards/doran_25.jpg'),
('Umti', '25 LCK', 'LCK', 'KT', 'JUNGLE', 81, 'EPIC', 1000, 35, 84, 45, 35, 40, 82, 80, 81, '/images/cards/umti_25.jpg'),

-- DRX 2025
('Kiin', '25 LCK', 'LCK', 'DRX', 'TOP', 87, 'LEGENDARY', 1000, 90, 35, 40, 30, 35, 88, 89, 86, '/images/cards/kiin_drx_25.jpg'),
('Seolyoung', '25 LCK', 'LCK', 'DRX', 'JUNGLE', 78, 'EPIC', 1000, 35, 82, 45, 35, 40, 79, 77, 78, '/images/cards/seolyoung_25.jpg'),
('Taeyoon', '25 LCK', 'LCK', 'DRX', 'MID', 76, 'RARE', 300, 30, 40, 80, 35, 35, 77, 78, 75, '/images/cards/taeyoon_25.jpg'),
('Paduck', '25 LCK', 'LCK', 'DRX', 'ADC', 74, 'RARE', 300, 30, 35, 40, 78, 40, 75, 76, 73, '/images/cards/paduck_25.jpg'),
('Pleata', '25 LCK', 'LCK', 'DRX', 'SUPPORT', 75, 'RARE', 300, 30, 40, 45, 40, 79, 76, 74, 75, '/images/cards/pleata_25.jpg'),

-- NS 2025
('DnDn', '25 LCK', 'LCK', 'NS', 'TOP', 71, 'RARE', 300, 75, 35, 40, 30, 35, 72, 73, 70, '/images/cards/dndn_25.jpg'),
('Sylvie', '25 LCK', 'LCK', 'NS', 'JUNGLE', 69, 'RARE', 300, 35, 73, 45, 35, 40, 70, 68, 69, '/images/cards/sylvie_25.jpg'),
('Fisher', '25 LCK', 'LCK', 'NS', 'MID', 68, 'RARE', 300, 30, 40, 72, 35, 35, 69, 70, 67, '/images/cards/fisher_25.jpg'),
('Hena', '25 LCK', 'LCK', 'NS', 'SUPPORT', 70, 'RARE', 300, 30, 40, 45, 40, 74, 71, 69, 70, '/images/cards/hena_25.jpg'),

-- BRO 2025
('Soboro', '25 LCK', 'LCK', 'BRO', 'TOP', 67, 'RARE', 300, 71, 35, 40, 30, 35, 68, 69, 66, '/images/cards/soboro_25.jpg'),
('UmTi', '25 LCK', 'LCK', 'BRO', 'JUNGLE', 66, 'RARE', 300, 35, 70, 45, 35, 40, 67, 65, 66, '/images/cards/umti_bro_25.jpg'),
('Karis', '25 LCK', 'LCK', 'BRO', 'MID', 65, 'RARE', 300, 30, 40, 69, 35, 35, 66, 67, 64, '/images/cards/karis_25.jpg'),
('Hoit', '25 LCK', 'LCK', 'BRO', 'ADC', 64, 'RARE', 300, 30, 35, 40, 68, 40, 65, 66, 63, '/images/cards/hoit_25.jpg'),
('Effort', '25 LCK', 'LCK', 'BRO', 'SUPPORT', 72, 'RARE', 300, 30, 40, 45, 40, 76, 73, 71, 72, '/images/cards/effort_25.jpg'),

-- KDF 2025
('DuDu', '25 LCK', 'LCK', 'KDF', 'TOP', 70, 'RARE', 300, 74, 35, 40, 30, 35, 71, 72, 69, '/images/cards/dudu_25.jpg'),
('Ellim', '25 LCK', 'LCK', 'KDF', 'JUNGLE', 68, 'RARE', 300, 35, 72, 45, 35, 40, 69, 67, 68, '/images/cards/ellim_25.jpg'),
('Clear', '25 LCK', 'LCK', 'KDF', 'ADC', 69, 'RARE', 300, 30, 35, 40, 73, 40, 70, 71, 68, '/images/cards/clear_25.jpg'),
('Moham', '25 LCK', 'LCK', 'KDF', 'SUPPORT', 67, 'RARE', 300, 30, 40, 45, 40, 71, 68, 66, 67, '/images/cards/moham_25.jpg'),

-- LPL 2025 추가 선수들
-- TES 2025
('369', '25 LPL', 'LPL', 'TES', 'TOP', 91, 'LEGENDARY', 1000, 94, 35, 40, 30, 35, 92, 93, 90, '/images/cards/369_tes_25.jpg'),
('Tian', '25 LPL', 'LPL', 'TES', 'JUNGLE', 92, 'LEGENDARY', 1000, 35, 95, 45, 35, 40, 93, 91, 92, '/images/cards/tian_25.jpg'),
('Creme', '25 LPL', 'LPL', 'TES', 'MID', 88, 'LEGENDARY', 1000, 30, 40, 91, 35, 35, 89, 90, 87, '/images/cards/creme_25.jpg'),
('JackeyLove', '25 LPL', 'LPL', 'TES', 'ADC', 92, 'LEGENDARY', 1000, 30, 35, 40, 95, 40, 93, 94, 91, '/images/cards/jackeylove_25.jpg'),
('Meiko', '25 LPL', 'LPL', 'TES', 'SUPPORT', 91, 'LEGENDARY', 1000, 30, 40, 45, 40, 94, 92, 90, 91, '/images/cards/meiko_25.jpg'),

-- LNG 2025
('Zika', '25 LPL', 'LPL', 'LNG', 'TOP', 86, 'EPIC', 1000, 89, 35, 40, 30, 35, 87, 88, 85, '/images/cards/zika_25.jpg'),
('Tarzan', '25 LPL', 'LPL', 'LNG', 'JUNGLE', 90, 'LEGENDARY', 1000, 35, 93, 45, 35, 40, 91, 89, 90, '/images/cards/tarzan_25.jpg'),
('Scout', '25 LPL', 'LPL', 'LNG', 'MID', 91, 'LEGENDARY', 1000, 30, 40, 94, 35, 35, 92, 93, 90, '/images/cards/scout_25.jpg'),
('GALA', '25 LPL', 'LPL', 'LNG', 'ADC', 93, 'LEGENDARY', 1000, 30, 35, 40, 96, 40, 94, 95, 92, '/images/cards/gala_25.jpg'),
('Hang', '25 LPL', 'LPL', 'LNG', 'SUPPORT', 87, 'LEGENDARY', 1000, 30, 40, 45, 40, 90, 88, 86, 87, '/images/cards/hang_25.jpg'),

-- IG 2025
('TheShy', '25 LPL', 'LPL', 'IG', 'TOP', 89, 'LEGENDARY', 1000, 92, 35, 40, 30, 35, 90, 91, 88, '/images/cards/theshy_ig_25.jpg'),
('Xun', '25 LPL', 'LPL', 'IG', 'JUNGLE', 85, 'EPIC', 1000, 35, 88, 45, 35, 40, 86, 84, 85, '/images/cards/xun_ig_25.jpg'),
('Rookie', '25 LPL', 'LPL', 'IG', 'MID', 90, 'LEGENDARY', 1000, 30, 40, 93, 35, 35, 91, 92, 89, '/images/cards/rookie_25.jpg'),
('Ahn', '25 LPL', 'LPL', 'IG', 'ADC', 84, 'EPIC', 1000, 30, 35, 40, 88, 40, 85, 86, 83, '/images/cards/ahn_25.jpg'),
('Wink', '25 LPL', 'LPL', 'IG', 'SUPPORT', 82, 'EPIC', 1000, 30, 40, 45, 40, 86, 83, 81, 82, '/images/cards/wink_25.jpg'),

-- EDG 2025
('Ale', '25 LPL', 'LPL', 'EDG', 'TOP', 87, 'LEGENDARY', 1000, 90, 35, 40, 30, 35, 88, 89, 86, '/images/cards/ale_25.jpg'),
('Jiejie', '25 LPL', 'LPL', 'EDG', 'JUNGLE', 88, 'LEGENDARY', 1000, 35, 91, 45, 35, 40, 89, 87, 88, '/images/cards/jiejie_25.jpg'),
('FoFo', '25 LPL', 'LPL', 'EDG', 'MID', 85, 'EPIC', 1000, 30, 40, 88, 35, 35, 86, 87, 84, '/images/cards/fofo_25.jpg'),
('Leave', '25 LPL', 'LPL', 'EDG', 'ADC', 86, 'EPIC', 1000, 30, 35, 40, 90, 40, 87, 88, 85, '/images/cards/leave_25.jpg'),
('Meiko', '25 LPL', 'LPL', 'EDG', 'SUPPORT', 89, 'LEGENDARY', 1000, 30, 40, 45, 40, 92, 90, 88, 89, '/images/cards/meiko_edg_25.jpg'),

-- LEC 2025
-- G2 2025
('BrokenBlade', '25 LEC', 'LEC', 'G2', 'TOP', 88, 'LEGENDARY', 1000, 91, 35, 40, 30, 35, 89, 90, 87, '/images/cards/brokenblade_25.jpg'),
('Yike', '25 LEC', 'LEC', 'G2', 'JUNGLE', 86, 'EPIC', 1000, 35, 89, 45, 35, 40, 87, 85, 86, '/images/cards/yike_25.jpg'),
('Caps', '25 LEC', 'LEC', 'G2', 'MID', 92, 'LEGENDARY', 1000, 30, 40, 95, 35, 35, 93, 94, 91, '/images/cards/caps_25.jpg'),
('Hans Sama', '25 LEC', 'LEC', 'G2', 'ADC', 89, 'LEGENDARY', 1000, 30, 35, 40, 92, 40, 90, 91, 88, '/images/cards/hanssama_25.jpg'),
('Mikyx', '25 LEC', 'LEC', 'G2', 'SUPPORT', 87, 'LEGENDARY', 1000, 30, 40, 45, 40, 90, 88, 86, 87, '/images/cards/mikyx_25.jpg'),

-- FNC 2025
('Oscarinin', '25 LEC', 'LEC', 'FNC', 'TOP', 85, 'EPIC', 1000, 88, 35, 40, 30, 35, 86, 87, 84, '/images/cards/oscarinin_25.jpg'),
('Razork', '25 LEC', 'LEC', 'FNC', 'JUNGLE', 84, 'EPIC', 1000, 35, 87, 45, 35, 40, 85, 83, 84, '/images/cards/razork_25.jpg'),
('Humanoid', '25 LEC', 'LEC', 'FNC', 'MID', 87, 'LEGENDARY', 1000, 30, 40, 90, 35, 35, 88, 89, 86, '/images/cards/humanoid_25.jpg'),
('Rekkles', '25 LEC', 'LEC', 'FNC', 'ADC', 90, 'LEGENDARY', 1000, 30, 35, 40, 93, 40, 91, 92, 89, '/images/cards/rekkles_25.jpg'),
('Jun', '25 LEC', 'LEC', 'FNC', 'SUPPORT', 83, 'EPIC', 1000, 30, 40, 45, 40, 87, 84, 82, 83, '/images/cards/jun_25.jpg'),

-- MAD 2025
('Chasy', '25 LEC', 'LEC', 'MAD', 'TOP', 82, 'EPIC', 1000, 85, 35, 40, 30, 35, 83, 84, 81, '/images/cards/chasy_25.jpg'),
('Elyoya', '25 LEC', 'LEC', 'MAD', 'JUNGLE', 86, 'EPIC', 1000, 35, 89, 45, 35, 40, 87, 85, 86, '/images/cards/elyoya_25.jpg'),
('Nisqy', '25 LEC', 'LEC', 'MAD', 'MID', 84, 'EPIC', 1000, 30, 40, 87, 35, 35, 85, 86, 83, '/images/cards/nisqy_25.jpg'),
('Carzzy', '25 LEC', 'LEC', 'MAD', 'ADC', 83, 'EPIC', 1000, 30, 35, 40, 86, 40, 84, 85, 82, '/images/cards/carzzy_25.jpg'),
('Alvaro', '25 LEC', 'LEC', 'MAD', 'SUPPORT', 81, 'EPIC', 1000, 30, 40, 45, 40, 85, 82, 80, 81, '/images/cards/alvaro_25.jpg'),

-- LCS 2025 (LTA)
-- C9 2025
('Thanatos', '25 LTA', 'LTA', 'C9', 'TOP', 83, 'EPIC', 1000, 86, 35, 40, 30, 35, 84, 85, 82, '/images/cards/thanatos_25.jpg'),
('Blaber', '25 LTA', 'LTA', 'C9', 'JUNGLE', 87, 'LEGENDARY', 1000, 35, 90, 45, 35, 40, 88, 86, 87, '/images/cards/blaber_25.jpg'),
('Jensen', '25 LTA', 'LTA', 'C9', 'MID', 86, 'EPIC', 1000, 30, 40, 89, 35, 35, 87, 88, 85, '/images/cards/jensen_25.jpg'),
('Berserker', '25 LTA', 'LTA', 'C9', 'ADC', 88, 'LEGENDARY', 1000, 30, 35, 40, 91, 40, 89, 90, 87, '/images/cards/berserker_25.jpg'),
('Zven', '25 LTA', 'LTA', 'C9', 'SUPPORT', 84, 'EPIC', 1000, 30, 40, 45, 40, 88, 85, 83, 84, '/images/cards/zven_25.jpg'),

-- TL 2025
('Impact', '25 LTA', 'LTA', 'TL', 'TOP', 85, 'EPIC', 1000, 88, 35, 40, 30, 35, 86, 87, 84, '/images/cards/impact_25.jpg'),
('Umti', '25 LTA', 'LTA', 'TL', 'JUNGLE', 82, 'EPIC', 1000, 35, 85, 45, 35, 40, 83, 81, 82, '/images/cards/umti_tl_25.jpg'),
('APA', '25 LTA', 'LTA', 'TL', 'MID', 84, 'EPIC', 1000, 30, 40, 87, 35, 35, 85, 86, 83, '/images/cards/apa_25.jpg'),
('Yeon', '25 LTA', 'LTA', 'TL', 'ADC', 83, 'EPIC', 1000, 30, 35, 40, 86, 40, 84, 85, 82, '/images/cards/yeon_25.jpg'),
('CoreJJ', '25 LTA', 'LTA', 'TL', 'SUPPORT', 89, 'LEGENDARY', 1000, 30, 40, 45, 40, 92, 90, 88, 89, '/images/cards/corejj_25.jpg'),

-- 커먼 카드들 추가 (30-55 OVR)
('Kingen', '25 LCK', 'LCK', 'DK', 'TOP', 54, 'COMMON', 100, 58, 35, 40, 30, 35, 55, 56, 53, '/images/cards/kingen_common_25.jpg'),
('Malrang', '25 LCK', 'LCK', 'LSB', 'JUNGLE', 52, 'COMMON', 100, 35, 56, 45, 35, 40, 53, 51, 52, '/images/cards/malrang_25.jpg'),
('Bay', '25 LCK', 'LCK', 'DK', 'MID', 53, 'COMMON', 100, 30, 40, 57, 35, 35, 54, 55, 52, '/images/cards/bay_25.jpg'),
('Envyy', '25 LCK', 'LCK', 'LSB', 'ADC', 51, 'COMMON', 100, 30, 35, 40, 55, 40, 52, 53, 50, '/images/cards/envyy_25.jpg'),
('Kael', '25 LCK', 'LCK', 'LSB', 'SUPPORT', 50, 'COMMON', 100, 30, 40, 45, 40, 54, 51, 49, 50, '/images/cards/kael_25.jpg'),
('Rich', '25 LCK', 'LCK', 'DK', 'TOP', 49, 'COMMON', 100, 53, 35, 40, 30, 35, 50, 51, 48, '/images/cards/rich_25.jpg'),
('Lucid', '25 LCK', 'LCK', 'BRO', 'JUNGLE', 47, 'COMMON', 100, 35, 51, 45, 35, 40, 48, 46, 47, '/images/cards/lucid_25.jpg'),
('Feisty', '25 LCK', 'LCK', 'KDF', 'MID', 48, 'COMMON', 100, 30, 40, 52, 35, 35, 49, 50, 47, '/images/cards/feisty_25.jpg'),
('Route', '25 LCK', 'LCK', 'NS', 'ADC', 46, 'COMMON', 100, 30, 35, 40, 50, 40, 47, 48, 45, '/images/cards/route_25.jpg'),
('Key', '25 LCK', 'LCK', 'KDF', 'SUPPORT', 45, 'COMMON', 100, 30, 40, 45, 40, 49, 46, 44, 45, '/images/cards/key_25.jpg');

-- 팀 시너지 추가
INSERT INTO team_synergies (team_name, season, bonus_percentage, description) VALUES
('DRX', '25 LCK', 12, 'DRX 2025 시즌 시너지'),
('NS', '25 LCK', 8, 'NS 2025 시즌 시너지'),
('BRO', '25 LCK', 8, 'BRO 2025 시즌 시너지'),
('KDF', '25 LCK', 8, 'KDF 2025 시즌 시너지'),
('LSB', '25 LCK', 8, 'LSB 2025 시즌 시너지'),
('TES', '25 LPL', 15, 'TES 2025 시즌 시너지 - LPL 강호'),
('LNG', '25 LPL', 15, 'LNG 2025 시즌 시너지 - 막강한 조합'),
('IG', '25 LPL', 12, 'IG 2025 시즌 시너지 - 전설의 부활'),
('EDG', '25 LPL', 14, 'EDG 2025 시즌 시너지 - 월드 챔피언'),
('G2', '25 LEC', 14, 'G2 2025 시즌 시너지 - 유럽 최강'),
('FNC', '25 LEC', 13, 'FNC 2025 시즌 시너지 - 전통의 명가'),
('MAD', '25 LEC', 11, 'MAD 2025 시즌 시너지'),
('C9', '25 LTA', 12, 'C9 2025 시즌 시너지 - 북미 강호'),
('TL', '25 LTA', 12, 'TL 2025 시즌 시너지 - 베테랑 조합');
