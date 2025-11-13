const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// 프로필 통계 조회
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. 기본 사용자 정보
        const [users] = await db.query(
            `SELECT user_id, username, current_tier, tier_points, battle_energy, points,
            created_at, last_energy_update
            FROM users WHERE user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const user = users[0];

        // 2. 전적 통계 (승/패)
        const [winStats] = await db.query(
            `SELECT COUNT(*) as total_wins
            FROM battles
            WHERE winner_id = ? AND completed_at IS NOT NULL`,
            [userId]
        );

        const [loseStats] = await db.query(
            `SELECT COUNT(*) as total_losses
            FROM battles
            WHERE (player1_id = ? OR player2_id = ?)
            AND winner_id != ?
            AND completed_at IS NOT NULL`,
            [userId, userId, userId]
        );

        const totalWins = winStats[0].total_wins;
        const totalLosses = loseStats[0].total_losses;
        const totalGames = totalWins + totalLosses;
        const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0;

        // 3. 보유 카드 통계
        const [cardStats] = await db.query(
            `SELECT cm.card_tier, COUNT(*) as count
            FROM user_cards uc
            JOIN cards_master cm ON uc.card_id = cm.card_id
            WHERE uc.user_id = ?
            GROUP BY cm.card_tier`,
            [userId]
        );

        const cardsByTier = {
            LEGENDARY: 0,
            EPIC: 0,
            RARE: 0,
            COMMON: 0
        };

        cardStats.forEach(stat => {
            cardsByTier[stat.card_tier] = stat.count;
        });

        const totalCards = Object.values(cardsByTier).reduce((sum, count) => sum + count, 0);

        // 4. 최근 배틀 기록 (5개)
        const [recentBattles] = await db.query(
            `SELECT
                b.battle_id,
                b.player1_id,
                b.player2_id,
                b.winner_id,
                p1.username as player1_name,
                p2.username as player2_name,
                winner.username as winner_name,
                b.player1_tier_change,
                b.player2_tier_change,
                b.started_at,
                b.completed_at
            FROM battles b
            JOIN users p1 ON b.player1_id = p1.user_id
            JOIN users p2 ON b.player2_id = p2.user_id
            JOIN users winner ON b.winner_id = winner.user_id
            WHERE (b.player1_id = ? OR b.player2_id = ?)
            AND b.completed_at IS NOT NULL
            ORDER BY b.completed_at DESC
            LIMIT 5`,
            [userId, userId]
        );

        // 각 배틀에 승/패 표시 추가
        const recentBattlesWithResult = recentBattles.map(battle => ({
            ...battle,
            isWin: battle.winner_id === userId,
            myTierChange: battle.player1_id === userId ? battle.player1_tier_change : battle.player2_tier_change
        }));

        // 5. 티어 기준 랭킹 순위
        const [rankInfo] = await db.query(
            `SELECT COUNT(*) + 1 as rank
            FROM users
            WHERE
                (current_tier > ? OR (current_tier = ? AND tier_points > ?))
                AND user_id != ?`,
            [user.current_tier, user.current_tier, user.tier_points, userId]
        );

        // 응답 구성
        res.json({
            user: {
                userId: user.user_id,
                username: user.username,
                tier: user.current_tier,
                tierPoints: user.tier_points,
                battleEnergy: user.battle_energy,
                points: user.points,
                createdAt: user.created_at
            },
            stats: {
                totalGames,
                totalWins,
                totalLosses,
                winRate: parseFloat(winRate),
                rank: rankInfo[0].rank
            },
            cards: {
                totalCards,
                byTier: cardsByTier
            },
            recentBattles: recentBattlesWithResult
        });

    } catch (error) {
        console.error('프로필 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
