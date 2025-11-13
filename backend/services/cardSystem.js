// 카드 시스템 및 시너지 관리

class CardSystem {
    // 팀 시너지 체크
    async checkTeamSynergy(db, deckId) {
        // 덱의 모든 카드 가져오기
        const [deckCards] = await db.query(
            `SELECT cm.card_id, cm.player_name, cm.team, cm.season, cm.overall_rating
            FROM deck_cards dc
            JOIN user_cards uc ON dc.user_card_id = uc.user_card_id
            JOIN cards_master cm ON uc.card_id = cm.card_id
            WHERE dc.deck_id = ?
            ORDER BY dc.position`,
            [deckId]
        );

        if (deckCards.length !== 5) {
            return { hasSynergy: false, bonus: 0, team: null, season: null };
        }

        // 같은 팀과 시즌인지 확인
        const firstCard = deckCards[0];
        const allSameTeam = deckCards.every(
            card => card.team === firstCard.team && card.season === firstCard.season
        );

        if (!allSameTeam) {
            return { hasSynergy: false, bonus: 0, team: null, season: null };
        }

        // 시너지 보너스 조회
        const [synergy] = await db.query(
            'SELECT bonus_percentage, description FROM team_synergies WHERE team_name = ? AND season = ?',
            [firstCard.team, firstCard.season]
        );

        if (synergy.length === 0) {
            // 기본 시너지 보너스 10%
            return {
                hasSynergy: true,
                bonus: 10,
                team: firstCard.team,
                season: firstCard.season,
                description: `${firstCard.team} ${firstCard.season} 팀 시너지`
            };
        }

        return {
            hasSynergy: true,
            bonus: synergy[0].bonus_percentage,
            team: firstCard.team,
            season: firstCard.season,
            description: synergy[0].description
        };
    }

    // 랜덤 카드 뽑기 (가챠 시스템)
    async purchaseRandomCard(db, userId, packTier) {
        // 팩 가격 및 확률 정의
        const packs = {
            COMMON: { price: 100, tiers: { COMMON: 100 } },
            RARE: { price: 300, tiers: { COMMON: 50, RARE: 50 } },
            EPIC: { price: 1000, tiers: { COMMON: 20, RARE: 30, EPIC: 40, LEGENDARY: 10 } }
        };

        if (!packs[packTier]) {
            throw new Error('유효하지 않은 팩 등급입니다.');
        }

        const pack = packs[packTier];

        // 사용자 포인트 조회
        const [user] = await db.query(
            'SELECT points FROM users WHERE user_id = ?',
            [userId]
        );

        if (user.length === 0) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        const userPoints = user[0].points;

        if (userPoints < pack.price) {
            throw new Error(`포인트가 부족합니다. (필요: ${pack.price}P, 보유: ${userPoints}P)`);
        }

        // 등급 확률에 따라 랜덤 카드 선택
        const selectedTier = this.selectRandomTier(pack.tiers);

        // 해당 등급의 랜덤 카드 조회
        const [cards] = await db.query(
            'SELECT card_id, player_name, card_tier, overall_rating, team, season, position, image_url FROM cards_master WHERE card_tier = ? ORDER BY RAND() LIMIT 1',
            [selectedTier]
        );

        if (cards.length === 0) {
            throw new Error('뽑을 수 있는 카드가 없습니다.');
        }

        const drawnCard = cards[0];

        // 트랜잭션 시작
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 포인트 차감
            await connection.query(
                'UPDATE users SET points = points - ? WHERE user_id = ?',
                [pack.price, userId]
            );

            // 카드 추가
            const [insertResult] = await connection.query(
                'INSERT INTO user_cards (user_id, card_id) VALUES (?, ?)',
                [userId, drawnCard.card_id]
            );

            await connection.commit();

            return {
                success: true,
                packTier,
                price: pack.price,
                card: {
                    userCardId: insertResult.insertId,
                    cardId: drawnCard.card_id,
                    playerName: drawnCard.player_name,
                    cardTier: drawnCard.card_tier,
                    overallRating: drawnCard.overall_rating,
                    team: drawnCard.team,
                    season: drawnCard.season,
                    position: drawnCard.position,
                    imageUrl: drawnCard.image_url
                },
                remainingPoints: userPoints - pack.price
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 확률에 따라 등급 선택
    selectRandomTier(tiers) {
        const random = Math.random() * 100;
        let cumulative = 0;

        for (const [tier, probability] of Object.entries(tiers)) {
            cumulative += probability;
            if (random <= cumulative) {
                return tier;
            }
        }

        // 기본값 (혹시 모를 경우)
        return Object.keys(tiers)[0];
    }

    // 사용자 소유 카드 목록
    async getUserCards(db, userId) {
        const [cards] = await db.query(
            `SELECT uc.user_card_id, cm.*
            FROM user_cards uc
            JOIN cards_master cm ON uc.card_id = cm.card_id
            WHERE uc.user_id = ?
            ORDER BY cm.overall_rating DESC, cm.card_id ASC`,
            [userId]
        );

        return cards;
    }

    // 카드 상점 목록 (구매 가능한 카드)
    async getShopCards(db, filters = {}) {
        let query = 'SELECT * FROM cards_master WHERE 1=1';
        const params = [];

        if (filters.region) {
            query += ' AND region = ?';
            params.push(filters.region);
        }

        if (filters.tier) {
            query += ' AND card_tier = ?';
            params.push(filters.tier);
        }

        if (filters.position) {
            query += ' AND position = ?';
            params.push(filters.position);
        }

        if (filters.season) {
            query += ' AND season = ?';
            params.push(filters.season);
        }

        if (filters.minOverall) {
            query += ' AND overall_rating >= ?';
            params.push(filters.minOverall);
        }

        if (filters.maxOverall) {
            query += ' AND overall_rating <= ?';
            params.push(filters.maxOverall);
        }

        query += ' ORDER BY overall_rating DESC, card_id ASC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        const [cards] = await db.query(query, params);
        return cards;
    }

    // 덱 생성
    async createDeck(db, userId, deckName = 'My Deck') {
        const [result] = await db.query(
            'INSERT INTO user_decks (user_id, deck_name) VALUES (?, ?)',
            [userId, deckName]
        );

        return {
            deckId: result.insertId,
            deckName,
            userId
        };
    }

    // 덱에 카드 추가
    async addCardToDeck(db, userId, deckId, userCardId, position) {
        // 포지션 검증 (1-5)
        if (position < 1 || position > 5) {
            throw new Error('포지션은 1에서 5 사이여야 합니다.');
        }

        // 덱 소유권 확인
        const [deck] = await db.query(
            'SELECT deck_id FROM user_decks WHERE deck_id = ? AND user_id = ?',
            [deckId, userId]
        );

        if (deck.length === 0) {
            throw new Error('덱을 찾을 수 없거나 권한이 없습니다.');
        }

        // 카드 소유권 확인
        const [card] = await db.query(
            'SELECT user_card_id FROM user_cards WHERE user_card_id = ? AND user_id = ?',
            [userCardId, userId]
        );

        if (card.length === 0) {
            throw new Error('카드를 찾을 수 없거나 권한이 없습니다.');
        }

        // 해당 포지션에 이미 카드가 있는지 확인
        const [existing] = await db.query(
            'SELECT deck_card_id FROM deck_cards WHERE deck_id = ? AND position = ?',
            [deckId, position]
        );

        if (existing.length > 0) {
            // 기존 카드 제거
            await db.query(
                'DELETE FROM deck_cards WHERE deck_id = ? AND position = ?',
                [deckId, position]
            );
        }

        // 카드 추가
        await db.query(
            'INSERT INTO deck_cards (deck_id, user_card_id, position) VALUES (?, ?, ?)',
            [deckId, userCardId, position]
        );

        return { success: true, deckId, userCardId, position };
    }

    // 덱 카드 제거
    async removeCardFromDeck(db, userId, deckId, position) {
        // 덱 소유권 확인
        const [deck] = await db.query(
            'SELECT deck_id FROM user_decks WHERE deck_id = ? AND user_id = ?',
            [deckId, userId]
        );

        if (deck.length === 0) {
            throw new Error('덱을 찾을 수 없거나 권한이 없습니다.');
        }

        await db.query(
            'DELETE FROM deck_cards WHERE deck_id = ? AND position = ?',
            [deckId, position]
        );

        return { success: true };
    }

    // 덱 조회
    async getDeck(db, deckId) {
        const [deck] = await db.query(
            'SELECT * FROM user_decks WHERE deck_id = ?',
            [deckId]
        );

        if (deck.length === 0) {
            return null;
        }

        const [cards] = await db.query(
            `SELECT
                dc.position as deck_position,
                uc.user_card_id,
                cm.card_id,
                cm.player_name,
                cm.team,
                cm.region,
                cm.season,
                cm.position as card_position,
                cm.overall_rating,
                cm.card_tier,
                cm.card_price,
                cm.image_url
            FROM deck_cards dc
            JOIN user_cards uc ON dc.user_card_id = uc.user_card_id
            JOIN cards_master cm ON uc.card_id = cm.card_id
            WHERE dc.deck_id = ?
            ORDER BY dc.position`,
            [deckId]
        );

        return {
            ...deck[0],
            cards
        };
    }

    // 사용자의 모든 덱 조회
    async getUserDecks(db, userId) {
        const [decks] = await db.query(
            'SELECT * FROM user_decks WHERE user_id = ? ORDER BY deck_id DESC',
            [userId]
        );

        // 각 덱의 카드 정보 가져오기
        for (const deck of decks) {
            const [cards] = await db.query(
                `SELECT dc.position, cm.player_name, cm.overall_rating, cm.position as card_position
                FROM deck_cards dc
                JOIN user_cards uc ON dc.user_card_id = uc.user_card_id
                JOIN cards_master cm ON uc.card_id = cm.card_id
                WHERE dc.deck_id = ?
                ORDER BY dc.position`,
                [deck.deck_id]
            );

            deck.cards = cards;
            deck.cardCount = cards.length;
        }

        return decks;
    }

    // 활성 덱 설정
    async setActiveDeck(db, userId, deckId) {
        // 덱 소유권 확인
        const [deck] = await db.query(
            'SELECT deck_id FROM user_decks WHERE deck_id = ? AND user_id = ?',
            [deckId, userId]
        );

        if (deck.length === 0) {
            throw new Error('덱을 찾을 수 없거나 권한이 없습니다.');
        }

        // 덱에 5명의 카드가 있는지 확인
        const [deckCards] = await db.query(
            'SELECT COUNT(*) as count FROM deck_cards WHERE deck_id = ?',
            [deckId]
        );

        if (deckCards[0].count !== 5) {
            throw new Error('덱에 5명의 선수가 필요합니다. 현재 ' + deckCards[0].count + '명');
        }

        // 모든 덱 비활성화
        await db.query(
            'UPDATE user_decks SET is_active = FALSE WHERE user_id = ?',
            [userId]
        );

        // 선택한 덱 활성화
        await db.query(
            'UPDATE user_decks SET is_active = TRUE WHERE deck_id = ?',
            [deckId]
        );

        return { success: true, activeDeckId: deckId };
    }

    // 활성 덱 조회
    async getActiveDeck(db, userId) {
        const [deck] = await db.query(
            'SELECT deck_id FROM user_decks WHERE user_id = ? AND is_active = TRUE LIMIT 1',
            [userId]
        );

        if (deck.length === 0) {
            return null;
        }

        return await this.getDeck(db, deck[0].deck_id);
    }

    // 덱 삭제
    async deleteDeck(db, userId, deckId) {
        // 덱 소유권 확인
        const [deck] = await db.query(
            'SELECT deck_id, is_active FROM user_decks WHERE deck_id = ? AND user_id = ?',
            [deckId, userId]
        );

        if (deck.length === 0) {
            throw new Error('덱을 찾을 수 없거나 권한이 없습니다.');
        }

        // 활성 덱인 경우 삭제 불가
        if (deck[0].is_active) {
            throw new Error('활성화된 덱은 삭제할 수 없습니다. 먼저 다른 덱을 활성화하세요.');
        }

        // 덱 삭제 (CASCADE로 deck_cards도 자동 삭제됨)
        await db.query(
            'DELETE FROM user_decks WHERE deck_id = ?',
            [deckId]
        );

        return { success: true, message: '덱이 삭제되었습니다.' };
    }
}

module.exports = new CardSystem();
