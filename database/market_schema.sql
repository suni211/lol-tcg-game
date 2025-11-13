-- 이적시장(거래소) 테이블

USE lol_tcg_game;

-- 카드 시세 테이블
CREATE TABLE IF NOT EXISTS card_market_prices (
    card_id INT PRIMARY KEY,
    base_price INT NOT NULL DEFAULT 1000,
    current_price INT NOT NULL DEFAULT 1000,
    min_price INT NOT NULL DEFAULT 900,
    max_price INT NOT NULL DEFAULT 1100,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards_master(card_id)
);

-- 판매 등록 테이블
CREATE TABLE IF NOT EXISTS market_listings (
    listing_id INT PRIMARY KEY AUTO_INCREMENT,
    user_card_id INT NOT NULL,
    seller_id INT NOT NULL,
    card_id INT NOT NULL,
    listing_price INT NOT NULL,
    status ENUM('ACTIVE', 'SOLD', 'CANCELLED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP NULL,
    FOREIGN KEY (user_card_id) REFERENCES user_cards(user_card_id),
    FOREIGN KEY (seller_id) REFERENCES users(user_id),
    FOREIGN KEY (card_id) REFERENCES cards_master(card_id),
    INDEX idx_status (status),
    INDEX idx_card (card_id, status)
);

-- 구매 예약 테이블
CREATE TABLE IF NOT EXISTS market_bids (
    bid_id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    card_id INT NOT NULL,
    bid_price INT NOT NULL,
    status ENUM('ACTIVE', 'MATCHED', 'CANCELLED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    matched_at TIMESTAMP NULL,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id),
    FOREIGN KEY (card_id) REFERENCES cards_master(card_id),
    INDEX idx_status (status),
    INDEX idx_card (card_id, status)
);

-- 거래 체결 내역 테이블
CREATE TABLE IF NOT EXISTS market_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    listing_id INT,
    bid_id INT,
    seller_id INT NOT NULL,
    buyer_id INT NOT NULL,
    card_id INT NOT NULL,
    user_card_id INT NOT NULL,
    transaction_price INT NOT NULL,
    transaction_type ENUM('INSTANT_BUY', 'INSTANT_SELL', 'BID_MATCHED') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES market_listings(listing_id),
    FOREIGN KEY (bid_id) REFERENCES market_bids(bid_id),
    FOREIGN KEY (seller_id) REFERENCES users(user_id),
    FOREIGN KEY (buyer_id) REFERENCES users(user_id),
    FOREIGN KEY (card_id) REFERENCES cards_master(card_id),
    FOREIGN KEY (user_card_id) REFERENCES user_cards(user_card_id),
    INDEX idx_card (card_id),
    INDEX idx_created (created_at)
);

-- 초기 시세 데이터 삽입 (카드 등급별 기본 가격)
INSERT INTO card_market_prices (card_id, base_price, current_price, min_price, max_price)
SELECT
    card_id,
    card_price as base_price,
    card_price as current_price,
    card_price - 100 as min_price,
    card_price + 100 as max_price
FROM cards_master
ON DUPLICATE KEY UPDATE
    base_price = VALUES(base_price),
    current_price = VALUES(current_price),
    min_price = VALUES(min_price),
    max_price = VALUES(max_price);
