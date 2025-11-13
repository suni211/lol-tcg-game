// 이적시장(거래소) 시스템

class MarketSystem {
    // 카드 시세 조회
    async getCardPrice(db, cardId) {
        const [prices] = await db.query(
            'SELECT * FROM card_market_prices WHERE card_id = ?',
            [cardId]
        );

        if (prices.length === 0) {
            // 시세 정보가 없으면 생성
            const [card] = await db.query(
                'SELECT card_price FROM cards_master WHERE card_id = ?',
                [cardId]
            );

            if (card.length === 0) {
                throw new Error('카드를 찾을 수 없습니다.');
            }

            const basePrice = card[0].card_price;
            await db.query(
                `INSERT INTO card_market_prices (card_id, base_price, current_price, min_price, max_price)
                VALUES (?, ?, ?, ?, ?)`,
                [cardId, basePrice, basePrice, basePrice - 100, basePrice + 100]
            );

            return {
                cardId,
                basePrice,
                currentPrice: basePrice,
                minPrice: basePrice - 100,
                maxPrice: basePrice + 100
            };
        }

        return {
            cardId: prices[0].card_id,
            basePrice: prices[0].base_price,
            currentPrice: prices[0].current_price,
            minPrice: prices[0].min_price,
            maxPrice: prices[0].max_price,
            lastUpdated: prices[0].last_updated
        };
    }

    // 시세 업데이트 (거래 체결 시)
    async updateCardPrice(db, cardId, transactionPrice) {
        const price = await this.getCardPrice(db, cardId);

        // 새로운 시세 계산 (거래가 70% + 기존 시세 30%)
        const newPrice = Math.round(transactionPrice * 0.7 + price.currentPrice * 0.3);

        // 상하한가 체크
        const finalPrice = Math.max(price.minPrice, Math.min(price.maxPrice, newPrice));

        await db.query(
            'UPDATE card_market_prices SET current_price = ? WHERE card_id = ?',
            [finalPrice, cardId]
        );

        return finalPrice;
    }

    // 판매 등록
    async createListing(db, userId, userCardId, listingPrice) {
        // 카드 소유권 확인
        const [userCard] = await db.query(
            'SELECT uc.*, cm.card_id, cm.player_name FROM user_cards uc JOIN cards_master cm ON uc.card_id = cm.card_id WHERE uc.user_card_id = ? AND uc.user_id = ?',
            [userCardId, userId]
        );

        if (userCard.length === 0) {
            throw new Error('카드를 찾을 수 없거나 소유하지 않은 카드입니다.');
        }

        // 덱에 등록된 카드인지 확인
        const [inDeck] = await db.query(
            'SELECT * FROM deck_cards WHERE user_card_id = ?',
            [userCardId]
        );

        if (inDeck.length > 0) {
            throw new Error('덱에 등록된 카드는 판매할 수 없습니다.');
        }

        const cardId = userCard[0].card_id;
        const price = await this.getCardPrice(db, cardId);

        // 가격 범위 체크
        if (listingPrice < price.minPrice || listingPrice > price.maxPrice) {
            throw new Error(`가격은 ${price.minPrice}P ~ ${price.maxPrice}P 사이여야 합니다.`);
        }

        // 판매 등록
        const [result] = await db.query(
            `INSERT INTO market_listings (user_card_id, seller_id, card_id, listing_price, status)
            VALUES (?, ?, ?, ?, 'ACTIVE')`,
            [userCardId, userId, cardId, listingPrice]
        );

        // 구매 예약이 있는지 확인 (즉시 매칭)
        await this.matchBids(db, cardId, listingPrice, result.insertId);

        return {
            listingId: result.insertId,
            userCardId,
            cardId,
            playerName: userCard[0].player_name,
            listingPrice
        };
    }

    // 구매 예약
    async createBid(db, userId, cardId, bidPrice) {
        const price = await this.getCardPrice(db, cardId);

        // 가격 범위 체크
        if (bidPrice < price.minPrice || bidPrice > price.maxPrice) {
            throw new Error(`가격은 ${price.minPrice}P ~ ${price.maxPrice}P 사이여야 합니다.`);
        }

        // 사용자 포인트 확인
        const [user] = await db.query('SELECT points FROM users WHERE user_id = ?', [userId]);
        if (user.length === 0 || user[0].points < bidPrice) {
            throw new Error('포인트가 부족합니다.');
        }

        // 구매 예약 등록
        const [result] = await db.query(
            `INSERT INTO market_bids (buyer_id, card_id, bid_price, status)
            VALUES (?, ?, ?, 'ACTIVE')`,
            [userId, cardId, bidPrice]
        );

        // 판매 등록이 있는지 확인 (즉시 매칭)
        await this.matchListings(db, cardId, bidPrice, result.insertId);

        return {
            bidId: result.insertId,
            cardId,
            bidPrice
        };
    }

    // 즉시 구매
    async instantBuy(db, userId, listingId) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 판매 등록 조회
            const [listings] = await connection.query(
                `SELECT ml.*, cm.player_name, cm.overall_rating, cm.card_tier
                FROM market_listings ml
                JOIN cards_master cm ON ml.card_id = cm.card_id
                WHERE ml.listing_id = ? AND ml.status = 'ACTIVE'
                FOR UPDATE`,
                [listingId]
            );

            if (listings.length === 0) {
                throw new Error('판매 등록을 찾을 수 없거나 이미 판매되었습니다.');
            }

            const listing = listings[0];

            if (listing.seller_id === userId) {
                throw new Error('자신의 카드는 구매할 수 없습니다.');
            }

            // 구매자 포인트 확인
            const [buyer] = await connection.query(
                'SELECT points FROM users WHERE user_id = ? FOR UPDATE',
                [userId]
            );

            if (buyer.length === 0 || buyer[0].points < listing.listing_price) {
                throw new Error('포인트가 부족합니다.');
            }

            // 포인트 이동 (구매자 -> 판매자)
            await connection.query(
                'UPDATE users SET points = points - ? WHERE user_id = ?',
                [listing.listing_price, userId]
            );

            await connection.query(
                'UPDATE users SET points = points + ? WHERE user_id = ?',
                [listing.listing_price, listing.seller_id]
            );

            // 카드 소유권 이전
            await connection.query(
                'UPDATE user_cards SET user_id = ? WHERE user_card_id = ?',
                [userId, listing.user_card_id]
            );

            // 판매 등록 완료 처리
            await connection.query(
                `UPDATE market_listings SET status = 'SOLD', sold_at = NOW() WHERE listing_id = ?`,
                [listingId]
            );

            // 거래 내역 저장
            await connection.query(
                `INSERT INTO market_transactions (listing_id, seller_id, buyer_id, card_id, user_card_id, transaction_price, transaction_type)
                VALUES (?, ?, ?, ?, ?, ?, 'INSTANT_BUY')`,
                [listingId, listing.seller_id, userId, listing.card_id, listing.user_card_id, listing.listing_price]
            );

            // 시세 업데이트
            await this.updateCardPrice(connection, listing.card_id, listing.listing_price);

            await connection.commit();

            return {
                success: true,
                card: {
                    playerName: listing.player_name,
                    overallRating: listing.overall_rating,
                    cardTier: listing.card_tier
                },
                price: listing.listing_price
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 즉시 판매 (가장 높은 구매 예약에 판매)
    async instantSell(db, userId, userCardId) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 카드 확인
            const [userCard] = await connection.query(
                'SELECT * FROM user_cards WHERE user_card_id = ? AND user_id = ? FOR UPDATE',
                [userCardId, userId]
            );

            if (userCard.length === 0) {
                throw new Error('카드를 찾을 수 없습니다.');
            }

            const cardId = userCard[0].card_id;

            // 가장 높은 구매 예약 찾기
            const [bids] = await connection.query(
                `SELECT * FROM market_bids
                WHERE card_id = ? AND status = 'ACTIVE'
                ORDER BY bid_price DESC, created_at ASC
                LIMIT 1
                FOR UPDATE`,
                [cardId]
            );

            if (bids.length === 0) {
                throw new Error('구매 예약이 없습니다.');
            }

            const bid = bids[0];
            const buyerId = bid.buyer_id;
            const bidPrice = bid.bid_price;

            // 구매자 포인트 확인
            const [buyer] = await connection.query(
                'SELECT points FROM users WHERE user_id = ? FOR UPDATE',
                [buyerId]
            );

            if (buyer.length === 0 || buyer[0].points < bidPrice) {
                // 포인트 부족하면 예약 취소
                await connection.query(
                    `UPDATE market_bids SET status = 'CANCELLED' WHERE bid_id = ?`,
                    [bid.bid_id]
                );
                throw new Error('구매자의 포인트가 부족하여 거래가 취소되었습니다.');
            }

            // 포인트 이동
            await connection.query(
                'UPDATE users SET points = points - ? WHERE user_id = ?',
                [bidPrice, buyerId]
            );

            await connection.query(
                'UPDATE users SET points = points + ? WHERE user_id = ?',
                [bidPrice, userId]
            );

            // 카드 소유권 이전
            await connection.query(
                'UPDATE user_cards SET user_id = ? WHERE user_card_id = ?',
                [buyerId, userCardId]
            );

            // 구매 예약 완료 처리
            await connection.query(
                `UPDATE market_bids SET status = 'MATCHED', matched_at = NOW() WHERE bid_id = ?`,
                [bid.bid_id]
            );

            // 거래 내역 저장
            await connection.query(
                `INSERT INTO market_transactions (bid_id, seller_id, buyer_id, card_id, user_card_id, transaction_price, transaction_type)
                VALUES (?, ?, ?, ?, ?, ?, 'INSTANT_SELL')`,
                [bid.bid_id, userId, buyerId, cardId, userCardId, bidPrice]
            );

            // 시세 업데이트
            await this.updateCardPrice(connection, cardId, bidPrice);

            await connection.commit();

            return {
                success: true,
                price: bidPrice
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 구매 예약 매칭 확인
    async matchBids(db, cardId, listingPrice, listingId) {
        // 판매가 이하의 구매 예약 찾기
        const [bids] = await db.query(
            `SELECT * FROM market_bids
            WHERE card_id = ? AND status = 'ACTIVE' AND bid_price >= ?
            ORDER BY bid_price DESC, created_at ASC
            LIMIT 1`,
            [cardId, listingPrice]
        );

        if (bids.length > 0) {
            // 즉시 매칭
            const bid = bids[0];
            // 여기서 거래 체결 로직 실행
            // (복잡도를 줄이기 위해 생략, 실제로는 instantBuy와 유사한 로직)
        }
    }

    // 판매 등록 매칭 확인
    async matchListings(db, cardId, bidPrice, bidId) {
        // 구매가 이상의 판매 등록 찾기
        const [listings] = await db.query(
            `SELECT * FROM market_listings
            WHERE card_id = ? AND status = 'ACTIVE' AND listing_price <= ?
            ORDER BY listing_price ASC, created_at ASC
            LIMIT 1`,
            [cardId, bidPrice]
        );

        if (listings.length > 0) {
            // 즉시 매칭
            // (복잡도를 줄이기 위해 생략)
        }
    }

    // 시장 현황 조회
    async getMarketOverview(db, cardId) {
        const price = await this.getCardPrice(db, cardId);

        // 최근 거래 내역
        const [transactions] = await db.query(
            `SELECT transaction_price, transaction_type, created_at
            FROM market_transactions
            WHERE card_id = ?
            ORDER BY created_at DESC
            LIMIT 10`,
            [cardId]
        );

        // 판매 등록 현황
        const [listings] = await db.query(
            `SELECT COUNT(*) as count, MIN(listing_price) as lowest, MAX(listing_price) as highest
            FROM market_listings
            WHERE card_id = ? AND status = 'ACTIVE'`,
            [cardId]
        );

        // 구매 예약 현황
        const [bids] = await db.query(
            `SELECT COUNT(*) as count, MIN(bid_price) as lowest, MAX(bid_price) as highest
            FROM market_bids
            WHERE card_id = ? AND status = 'ACTIVE'`,
            [cardId]
        );

        return {
            price,
            listings: listings[0],
            bids: bids[0],
            recentTransactions: transactions
        };
    }

    // 전체 시장 목록
    async getAllMarketListings(db, filters = {}) {
        let query = `
            SELECT
                ml.listing_id,
                ml.listing_price,
                ml.created_at,
                cm.card_id,
                cm.player_name,
                cm.team,
                cm.position,
                cm.overall_rating,
                cm.card_tier,
                cm.season,
                cmp.current_price,
                cmp.min_price,
                cmp.max_price,
                u.username as seller_name
            FROM market_listings ml
            JOIN cards_master cm ON ml.card_id = cm.card_id
            LEFT JOIN card_market_prices cmp ON cm.card_id = cmp.card_id
            JOIN users u ON ml.seller_id = u.user_id
            WHERE ml.status = 'ACTIVE'
        `;

        const params = [];

        if (filters.tier) {
            query += ' AND cm.card_tier = ?';
            params.push(filters.tier);
        }

        if (filters.position) {
            query += ' AND cm.position = ?';
            params.push(filters.position);
        }

        if (filters.team) {
            query += ' AND cm.team = ?';
            params.push(filters.team);
        }

        query += ' ORDER BY ml.created_at DESC LIMIT 50';

        const [listings] = await db.query(query, params);
        return listings;
    }

    // 내 판매 등록 조회
    async getMyListings(db, userId) {
        const [listings] = await db.query(
            `SELECT
                ml.*,
                cm.player_name,
                cm.team,
                cm.position,
                cm.overall_rating,
                cm.card_tier
            FROM market_listings ml
            JOIN cards_master cm ON ml.card_id = cm.card_id
            WHERE ml.seller_id = ? AND ml.status = 'ACTIVE'
            ORDER BY ml.created_at DESC`,
            [userId]
        );

        return listings;
    }

    // 내 구매 예약 조회
    async getMyBids(db, userId) {
        const [bids] = await db.query(
            `SELECT
                mb.*,
                cm.player_name,
                cm.team,
                cm.position,
                cm.overall_rating,
                cm.card_tier
            FROM market_bids mb
            JOIN cards_master cm ON mb.card_id = cm.card_id
            WHERE mb.buyer_id = ? AND mb.status = 'ACTIVE'
            ORDER BY mb.created_at DESC`,
            [userId]
        );

        return bids;
    }

    // 판매 등록 취소
    async cancelListing(db, userId, listingId) {
        const [listing] = await db.query(
            'SELECT * FROM market_listings WHERE listing_id = ? AND seller_id = ? AND status = "ACTIVE"',
            [listingId, userId]
        );

        if (listing.length === 0) {
            throw new Error('판매 등록을 찾을 수 없습니다.');
        }

        await db.query(
            `UPDATE market_listings SET status = 'CANCELLED' WHERE listing_id = ?`,
            [listingId]
        );

        return { success: true };
    }

    // 구매 예약 취소
    async cancelBid(db, userId, bidId) {
        const [bid] = await db.query(
            'SELECT * FROM market_bids WHERE bid_id = ? AND buyer_id = ? AND status = "ACTIVE"',
            [bidId, userId]
        );

        if (bid.length === 0) {
            throw new Error('구매 예약을 찾을 수 없습니다.');
        }

        await db.query(
            `UPDATE market_bids SET status = 'CANCELLED' WHERE bid_id = ?`,
            [bidId]
        );

        return { success: true };
    }
}

module.exports = new MarketSystem();
