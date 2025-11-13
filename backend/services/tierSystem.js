// 티어 및 랭킹 시스템

class TierSystem {
    constructor() {
        this.TIERS = [
            { name: 'BRONZE_5', division: 'BRONZE', rank: 5, minPoints: 0, maxPoints: 100 },
            { name: 'BRONZE_4', division: 'BRONZE', rank: 4, minPoints: 100, maxPoints: 200 },
            { name: 'BRONZE_3', division: 'BRONZE', rank: 3, minPoints: 200, maxPoints: 300 },
            { name: 'BRONZE_2', division: 'BRONZE', rank: 2, minPoints: 300, maxPoints: 400 },
            { name: 'BRONZE_1', division: 'BRONZE', rank: 1, minPoints: 400, maxPoints: 500 },

            { name: 'SILVER_5', division: 'SILVER', rank: 5, minPoints: 500, maxPoints: 600 },
            { name: 'SILVER_4', division: 'SILVER', rank: 4, minPoints: 600, maxPoints: 700 },
            { name: 'SILVER_3', division: 'SILVER', rank: 3, minPoints: 700, maxPoints: 800 },
            { name: 'SILVER_2', division: 'SILVER', rank: 2, minPoints: 800, maxPoints: 900 },
            { name: 'SILVER_1', division: 'SILVER', rank: 1, minPoints: 900, maxPoints: 1000 },

            { name: 'GOLD_5', division: 'GOLD', rank: 5, minPoints: 1000, maxPoints: 1100 },
            { name: 'GOLD_4', division: 'GOLD', rank: 4, minPoints: 1100, maxPoints: 1200 },
            { name: 'GOLD_3', division: 'GOLD', rank: 3, minPoints: 1200, maxPoints: 1300 },
            { name: 'GOLD_2', division: 'GOLD', rank: 2, minPoints: 1300, maxPoints: 1400 },
            { name: 'GOLD_1', division: 'GOLD', rank: 1, minPoints: 1400, maxPoints: 1500 },

            { name: 'PLATINUM_5', division: 'PLATINUM', rank: 5, minPoints: 1500, maxPoints: 1600 },
            { name: 'PLATINUM_4', division: 'PLATINUM', rank: 4, minPoints: 1600, maxPoints: 1700 },
            { name: 'PLATINUM_3', division: 'PLATINUM', rank: 3, minPoints: 1700, maxPoints: 1800 },
            { name: 'PLATINUM_2', division: 'PLATINUM', rank: 2, minPoints: 1800, maxPoints: 1900 },
            { name: 'PLATINUM_1', division: 'PLATINUM', rank: 1, minPoints: 1900, maxPoints: 2000 },

            { name: 'DIAMOND_5', division: 'DIAMOND', rank: 5, minPoints: 2000, maxPoints: 2100 },
            { name: 'DIAMOND_4', division: 'DIAMOND', rank: 4, minPoints: 2100, maxPoints: 2200 },
            { name: 'DIAMOND_3', division: 'DIAMOND', rank: 3, minPoints: 2200, maxPoints: 2300 },
            { name: 'DIAMOND_2', division: 'DIAMOND', rank: 2, minPoints: 2300, maxPoints: 2400 },
            { name: 'DIAMOND_1', division: 'DIAMOND', rank: 1, minPoints: 2400, maxPoints: 2500 },

            { name: 'CHALLENGER', division: 'CHALLENGER', rank: 0, minPoints: 2500, maxPoints: 999999 }
        ];
    }

    // 티어 포인트로 티어 결정
    getTierByPoints(points) {
        for (let i = this.TIERS.length - 1; i >= 0; i--) {
            if (points >= this.TIERS[i].minPoints) {
                return this.TIERS[i];
            }
        }
        return this.TIERS[0]; // BRONZE_5
    }

    // 티어 포인트 계산 (승패에 따라)
    calculateTierPointChange(winner, loser, isWinner) {
        // 단순히 승리 시 +10, 패배 시 -9
        return isWinner ? 10 : -9;
    }

    // 티어 업데이트
    async updateTier(db, userId, pointChange) {
        const [user] = await db.query(
            'SELECT user_id, username, tier_points, current_tier FROM users WHERE user_id = ?',
            [userId]
        );

        if (user.length === 0) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        const currentPoints = user[0].tier_points;
        const newPoints = Math.max(0, currentPoints + pointChange); // 0 이하로 내려가지 않음

        const newTier = this.getTierByPoints(newPoints);
        const oldTier = user[0].current_tier;

        // 티어 업데이트
        await db.query(
            'UPDATE users SET tier_points = ?, current_tier = ? WHERE user_id = ?',
            [newPoints, newTier.name, userId]
        );

        const tierChanged = oldTier !== newTier.name;

        return {
            userId,
            username: user[0].username,
            oldTier,
            newTier: newTier.name,
            oldPoints: currentPoints,
            newPoints,
            pointChange,
            tierChanged,
            promoted: tierChanged && newPoints > currentPoints,
            demoted: tierChanged && newPoints < currentPoints
        };
    }

    // 승리/패배 처리
    async processBattleResult(db, winnerId, loserId) {
        // 승자 티어 포인트 증가
        const winnerUpdate = await this.updateTier(db, winnerId, 10);

        // 패자 티어 포인트 감소
        const loserUpdate = await this.updateTier(db, loserId, -9);

        return {
            winner: winnerUpdate,
            loser: loserUpdate
        };
    }

    // 랭킹 조회
    async getRankings(db, limit = 100, offset = 0) {
        const [rankings] = await db.query(
            `SELECT
                user_id,
                username,
                current_tier,
                tier_points,
                (SELECT COUNT(*) FROM battles WHERE winner_id = users.user_id) as wins,
                (SELECT COUNT(*) FROM battles WHERE (player1_id = users.user_id OR player2_id = users.user_id) AND winner_id != users.user_id AND winner_id IS NOT NULL) as losses
            FROM users
            ORDER BY tier_points DESC, user_id ASC
            LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        return rankings.map((user, index) => ({
            rank: offset + index + 1,
            ...user
        }));
    }

    // 특정 유저의 랭킹 조회
    async getUserRank(db, userId) {
        const [result] = await db.query(
            `SELECT COUNT(*) + 1 as rank
            FROM users
            WHERE tier_points > (SELECT tier_points FROM users WHERE user_id = ?)
            OR (tier_points = (SELECT tier_points FROM users WHERE user_id = ?) AND user_id < ?)`,
            [userId, userId, userId]
        );

        const [userInfo] = await db.query(
            `SELECT
                user_id,
                username,
                current_tier,
                tier_points,
                (SELECT COUNT(*) FROM battles WHERE winner_id = ?) as wins,
                (SELECT COUNT(*) FROM battles WHERE (player1_id = ? OR player2_id = ?) AND winner_id != ? AND winner_id IS NOT NULL) as losses
            FROM users
            WHERE user_id = ?`,
            [userId, userId, userId, userId, userId]
        );

        if (userInfo.length === 0) {
            return null;
        }

        return {
            rank: result[0].rank,
            ...userInfo[0]
        };
    }

    // 티어별 분포 조회
    async getTierDistribution(db) {
        const [distribution] = await db.query(
            `SELECT current_tier, COUNT(*) as count
            FROM users
            GROUP BY current_tier
            ORDER BY
                CASE
                    WHEN current_tier LIKE 'BRONZE%' THEN 1
                    WHEN current_tier LIKE 'SILVER%' THEN 2
                    WHEN current_tier LIKE 'GOLD%' THEN 3
                    WHEN current_tier LIKE 'PLATINUM%' THEN 4
                    WHEN current_tier LIKE 'DIAMOND%' THEN 5
                    WHEN current_tier = 'CHALLENGER' THEN 6
                END,
                current_tier DESC`
        );

        return distribution;
    }

    // 티어 이름을 한글로 변환
    getTierDisplayName(tierName) {
        const tierMap = {
            'BRONZE': '브론즈',
            'SILVER': '실버',
            'GOLD': '골드',
            'PLATINUM': '플래티넘',
            'DIAMOND': '다이아몬드',
            'CHALLENGER': '챌린저'
        };

        const parts = tierName.split('_');
        const division = tierMap[parts[0]] || parts[0];
        const rank = parts[1] || '';

        return rank ? `${division} ${rank}` : division;
    }
}

module.exports = new TierSystem();
