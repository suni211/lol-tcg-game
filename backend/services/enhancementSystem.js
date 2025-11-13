// 카드 강화 시스템

class EnhancementSystem {
    constructor() {
        this.MAX_ENHANCEMENT = 10;
    }

    // 카드 강화 (중복 카드 합성)
    async enhanceCard(db, userId, targetCardId, materialCardId) {
        // 트랜잭션 시작
        await db.query('START TRANSACTION');

        try {
            // 대상 카드 정보 확인
            const [targetCard] = await db.query(
                `SELECT uc.user_card_id, uc.enhancement_level, uc.enhanced_ovr, uc.user_id,
                cm.card_id, cm.player_name, cm.overall_rating as base_ovr
                FROM user_cards uc
                JOIN cards_master cm ON uc.card_id = cm.card_id
                WHERE uc.user_card_id = ? AND uc.user_id = ?`,
                [targetCardId, userId]
            );

            if (targetCard.length === 0) {
                throw new Error('대상 카드를 찾을 수 없거나 권한이 없습니다.');
            }

            const target = targetCard[0];

            // 재료 카드 정보 확인
            const [materialCard] = await db.query(
                `SELECT uc.user_card_id, uc.user_id,
                cm.card_id, cm.player_name
                FROM user_cards uc
                JOIN cards_master cm ON uc.card_id = cm.card_id
                WHERE uc.user_card_id = ? AND uc.user_id = ?`,
                [materialCardId, userId]
            );

            if (materialCard.length === 0) {
                throw new Error('재료 카드를 찾을 수 없거나 권한이 없습니다.');
            }

            const material = materialCard[0];

            // 같은 카드끼리만 합성 가능 (같은 선수)
            if (target.card_id !== material.card_id) {
                throw new Error('같은 선수 카드끼리만 합성할 수 있습니다.');
            }

            // 같은 카드인지 확인
            if (target.user_card_id === material.user_card_id) {
                throw new Error('같은 카드를 재료로 사용할 수 없습니다.');
            }

            // 최대 강화 레벨 확인
            const currentLevel = target.enhancement_level || 0;
            if (currentLevel >= this.MAX_ENHANCEMENT) {
                throw new Error(`이미 최대 강화 레벨(+${this.MAX_ENHANCEMENT})에 도달했습니다.`);
            }

            // 덱에서 사용 중인 카드인지 확인 (재료 카드)
            const [deckUsage] = await db.query(
                'SELECT deck_card_id FROM deck_cards WHERE user_card_id = ?',
                [materialCardId]
            );

            if (deckUsage.length > 0) {
                throw new Error('덱에 등록된 카드는 재료로 사용할 수 없습니다.');
            }

            // 시장에 등록된 카드인지 확인 (재료 카드)
            const [marketUsage] = await db.query(
                'SELECT listing_id FROM market_listings WHERE user_card_id = ? AND status = "active"',
                [materialCardId]
            );

            if (marketUsage.length > 0) {
                throw new Error('이적시장에 등록된 카드는 재료로 사용할 수 없습니다.');
            }

            // 강화 진행
            const newLevel = currentLevel + 1;
            const currentOvr = target.enhanced_ovr || target.base_ovr;
            const newOvr = currentOvr + 1;

            // 대상 카드 업데이트
            await db.query(
                'UPDATE user_cards SET enhancement_level = ?, enhanced_ovr = ? WHERE user_card_id = ?',
                [newLevel, newOvr, targetCardId]
            );

            // 재료 카드 삭제
            await db.query(
                'DELETE FROM user_cards WHERE user_card_id = ?',
                [materialCardId]
            );

            // 강화 기록
            await db.query(
                `INSERT INTO card_enhancements (user_id, target_card_id, material_card_id, enhancement_level, ovr_before, ovr_after)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, targetCardId, materialCardId, newLevel, currentOvr, newOvr]
            );

            await db.query('COMMIT');

            return {
                success: true,
                cardName: target.player_name,
                enhancementLevel: newLevel,
                ovrBefore: currentOvr,
                ovrAfter: newOvr,
                maxReached: newLevel >= this.MAX_ENHANCEMENT
            };

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }

    // 강화 가능한 중복 카드 조회
    async getEnhanceableDuplicates(db, userId, targetCardId) {
        const [targetCard] = await db.query(
            `SELECT cm.card_id, cm.player_name
            FROM user_cards uc
            JOIN cards_master cm ON uc.card_id = cm.card_id
            WHERE uc.user_card_id = ? AND uc.user_id = ?`,
            [targetCardId, userId]
        );

        if (targetCard.length === 0) {
            throw new Error('카드를 찾을 수 없습니다.');
        }

        // 같은 선수의 다른 카드들 찾기 (덱/시장에서 사용 중이지 않은)
        const [duplicates] = await db.query(
            `SELECT uc.user_card_id, uc.enhancement_level, uc.enhanced_ovr, cm.overall_rating as base_ovr,
            cm.player_name, cm.card_tier, cm.team, cm.position
            FROM user_cards uc
            JOIN cards_master cm ON uc.card_id = cm.card_id
            WHERE uc.user_id = ?
            AND uc.card_id = ?
            AND uc.user_card_id != ?
            AND uc.user_card_id NOT IN (SELECT user_card_id FROM deck_cards)
            AND uc.user_card_id NOT IN (SELECT user_card_id FROM market_listings WHERE status = 'active')
            ORDER BY uc.enhancement_level ASC, uc.created_at ASC`,
            [userId, targetCard[0].card_id, targetCardId]
        );

        return duplicates;
    }

    // 강화 기록 조회
    async getEnhancementHistory(db, userId, limit = 50) {
        const [history] = await db.query(
            `SELECT e.*, cm.player_name, cm.team, cm.position
            FROM card_enhancements e
            JOIN user_cards uc ON e.target_card_id = uc.user_card_id
            JOIN cards_master cm ON uc.card_id = cm.card_id
            WHERE e.user_id = ?
            ORDER BY e.created_at DESC
            LIMIT ?`,
            [userId, limit]
        );

        return history;
    }
}

module.exports = new EnhancementSystem();
