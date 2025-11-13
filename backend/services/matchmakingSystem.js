// 매치메이킹 시스템

class MatchmakingSystem {
    constructor() {
        this.matchmakingQueues = new Map(); // userId -> queueData
        this.SAME_TIER_TIMEOUT = 30000; // 30초
    }

    // 큐에 참가
    async joinQueue(db, userId, deckId) {
        // 이미 큐에 있는지 확인
        if (this.matchmakingQueues.has(userId)) {
            throw new Error('이미 매치메이킹 큐에 참가 중입니다.');
        }

        // 사용자 정보 조회
        const [user] = await db.query(
            'SELECT user_id, username, current_tier, tier_points FROM users WHERE user_id = ?',
            [userId]
        );

        if (user.length === 0) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        // 덱 확인
        const [deck] = await db.query(
            'SELECT deck_id FROM user_decks WHERE deck_id = ? AND user_id = ?',
            [deckId, userId]
        );

        if (deck.length === 0) {
            throw new Error('덱을 찾을 수 없습니다.');
        }

        // 덱에 5명의 선수가 있는지 확인
        const [deckCards] = await db.query(
            'SELECT COUNT(*) as card_count FROM deck_cards WHERE deck_id = ?',
            [deckId]
        );

        if (deckCards[0].card_count !== 5) {
            throw new Error('덱에 5명의 선수가 필요합니다.');
        }

        // 큐에 추가
        const queueData = {
            userId: user[0].user_id,
            username: user[0].username,
            deckId: deckId,
            tier: user[0].current_tier,
            tierPoints: user[0].tier_points,
            queuedAt: Date.now(),
            allowCrossTier: false
        };

        this.matchmakingQueues.set(userId, queueData);

        // DB에도 기록
        await db.query(
            'INSERT INTO matchmaking_queue (user_id, deck_id, current_tier, tier_points) VALUES (?, ?, ?, ?)',
            [userId, deckId, user[0].current_tier, user[0].tier_points]
        );

        // 30초 후 크로스 티어 매칭 허용
        setTimeout(() => {
            const queueEntry = this.matchmakingQueues.get(userId);
            if (queueEntry) {
                queueEntry.allowCrossTier = true;
                console.log(`${queueEntry.username} 크로스 티어 매칭 허용`);
            }
        }, this.SAME_TIER_TIMEOUT);

        // 매칭 시도
        this.tryMatch(db, userId);

        return queueData;
    }

    // 큐에서 나가기
    async leaveQueue(db, userId) {
        if (!this.matchmakingQueues.has(userId)) {
            throw new Error('매치메이킹 큐에 참가하고 있지 않습니다.');
        }

        this.matchmakingQueues.delete(userId);

        // DB에서도 제거
        await db.query('DELETE FROM matchmaking_queue WHERE user_id = ?', [userId]);

        return { success: true };
    }

    // 매칭 시도
    async tryMatch(db, userId) {
        const player = this.matchmakingQueues.get(userId);
        if (!player) return;

        // 상대 찾기
        let opponent = null;

        // 1. 동일 티어 찾기
        for (const [opponentId, opponentData] of this.matchmakingQueues) {
            if (opponentId === userId) continue;

            if (this.isSameTier(player.tier, opponentData.tier)) {
                opponent = opponentData;
                break;
            }
        }

        // 2. 30초 경과 후 크로스 티어 매칭
        if (!opponent && player.allowCrossTier) {
            for (const [opponentId, opponentData] of this.matchmakingQueues) {
                if (opponentId === userId) continue;

                if (this.isAdjacentTier(player.tier, opponentData.tier)) {
                    opponent = opponentData;
                    break;
                }
            }
        }

        // 매칭 성공
        if (opponent) {
            console.log(`매칭 성공! ${player.username} vs ${opponent.username}`);
            await this.createMatch(db, player, opponent);
        }
    }

    // 모든 큐 대기자에 대해 매칭 시도
    async tryMatchAll(db) {
        const userIds = Array.from(this.matchmakingQueues.keys());
        for (const userId of userIds) {
            await this.tryMatch(db, userId);
        }
    }

    // 같은 티어인지 확인
    isSameTier(tier1, tier2) {
        return tier1 === tier2;
    }

    // 인접 티어인지 확인 (상하 티어)
    isAdjacentTier(tier1, tier2) {
        const tiers = [
            'BRONZE_5', 'BRONZE_4', 'BRONZE_3', 'BRONZE_2', 'BRONZE_1',
            'SILVER_5', 'SILVER_4', 'SILVER_3', 'SILVER_2', 'SILVER_1',
            'GOLD_5', 'GOLD_4', 'GOLD_3', 'GOLD_2', 'GOLD_1',
            'PLATINUM_5', 'PLATINUM_4', 'PLATINUM_3', 'PLATINUM_2', 'PLATINUM_1',
            'DIAMOND_5', 'DIAMOND_4', 'DIAMOND_3', 'DIAMOND_2', 'DIAMOND_1',
            'CHALLENGER'
        ];

        const index1 = tiers.indexOf(tier1);
        const index2 = tiers.indexOf(tier2);

        return Math.abs(index1 - index2) <= 5; // 한 티어 차이까지 허용
    }

    // 매치 생성 및 배틀 자동 실행
    async createMatch(db, player1, player2) {
        console.log(`매칭 성공: ${player1.username} vs ${player2.username}`);

        // 큐에서 제거
        this.matchmakingQueues.delete(player1.userId);
        this.matchmakingQueues.delete(player2.userId);

        // DB에서도 제거
        await db.query(
            'DELETE FROM matchmaking_queue WHERE user_id IN (?, ?)',
            [player1.userId, player2.userId]
        );

        // 배틀 자동 실행
        try {
            await this.executeBattle(db, player1, player2);
        } catch (error) {
            console.error('배틀 실행 오류:', error);
        }

        return {
            player1,
            player2,
            matchId: `${player1.userId}_${player2.userId}_${Date.now()}`
        };
    }

    // 배틀 실행
    async executeBattle(db, player1, player2) {
        const BattleEngine = require('./battleEngine');
        const energySystem = require('./energySystem');
        const tierSystem = require('./tierSystem');
        const cardSystem = require('./cardSystem');

        console.log(`배틀 시작: ${player1.username} vs ${player2.username}`);

        // 에너지 차감
        await energySystem.useEnergy(db, player1.userId, 1);
        await energySystem.useEnergy(db, player2.userId, 1);

        // 덱 정보 가져오기
        const [player1Cards] = await db.query(
            `SELECT cm.*
            FROM deck_cards dc
            JOIN user_cards uc ON dc.user_card_id = uc.user_card_id
            JOIN cards_master cm ON uc.card_id = cm.card_id
            WHERE dc.deck_id = ?
            ORDER BY dc.position`,
            [player1.deckId]
        );

        const [player2Cards] = await db.query(
            `SELECT cm.*
            FROM deck_cards dc
            JOIN user_cards uc ON dc.user_card_id = uc.user_card_id
            JOIN cards_master cm ON uc.card_id = cm.card_id
            WHERE dc.deck_id = ?
            ORDER BY dc.position`,
            [player2.deckId]
        );

        if (player1Cards.length !== 5 || player2Cards.length !== 5) {
            throw new Error('양쪽 모두 5명의 선수가 필요합니다.');
        }

        // 시너지 확인
        const synergy1 = await cardSystem.checkTeamSynergy(db, player1.deckId);
        const synergy2 = await cardSystem.checkTeamSynergy(db, player2.deckId);

        // 배틀 시뮬레이션
        const battleEngine = new BattleEngine();
        const battleResult = await battleEngine.simulateBattle(
            player1Cards,
            player2Cards,
            synergy1.bonus || 0,
            synergy2.bonus || 0
        );

        // 승자 결정
        const winnerId = battleResult.winner === 1 ? player1.userId : player2.userId;
        const loserId = battleResult.winner === 1 ? player2.userId : player1.userId;

        // 배틀 결과 저장
        const [battleRecord] = await db.query(
            `INSERT INTO battles (player1_id, player2_id, winner_id, player1_deck_id, player2_deck_id, battle_log, battle_duration, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                player1.userId,
                player2.userId,
                winnerId,
                player1.deckId,
                player2.deckId,
                battleResult.battleLog,
                battleResult.duration
            ]
        );

        // 티어 포인트 업데이트
        const tierUpdate = await tierSystem.processBattleResult(db, winnerId, loserId);

        // 배틀 기록에 티어 변동 저장
        await db.query(
            'UPDATE battles SET player1_tier_change = ?, player2_tier_change = ? WHERE battle_id = ?',
            [
                winnerId === player1.userId ? tierUpdate.winner.pointChange : tierUpdate.loser.pointChange,
                winnerId === player2.userId ? tierUpdate.winner.pointChange : tierUpdate.loser.pointChange,
                battleRecord.insertId
            ]
        );

        console.log(`배틀 완료: ${winnerId === player1.userId ? player1.username : player2.username} 승리!`);

        return {
            battleId: battleRecord.insertId,
            winnerId,
            battleResult
        };
    }

    // 큐 상태 조회
    getQueueStatus(userId) {
        const player = this.matchmakingQueues.get(userId);
        if (!player) {
            return null;
        }

        const waitTime = Date.now() - player.queuedAt;
        const waitSeconds = Math.floor(waitTime / 1000);

        return {
            ...player,
            waitTime: waitSeconds,
            allowCrossTier: player.allowCrossTier,
            queueSize: this.matchmakingQueues.size
        };
    }

    // 전체 큐 크기
    getQueueSize() {
        return this.matchmakingQueues.size;
    }
}

module.exports = new MatchmakingSystem();
