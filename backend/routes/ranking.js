const express = require('express');
const router = express.Router();
const db = require('../config/database');
const tierSystem = require('../services/tierSystem');
const { authenticateToken } = require('../middleware/auth');

// 랭킹 조회
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const rankings = await tierSystem.getRankings(db, limit, offset);

        // 티어 표시명 추가
        const rankingsWithDisplay = rankings.map(user => ({
            ...user,
            tierDisplay: tierSystem.getTierDisplayName(user.current_tier),
            winRate: user.wins + user.losses > 0
                ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(1)
                : 0
        }));

        res.json(rankingsWithDisplay);
    } catch (error) {
        console.error('랭킹 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 내 랭킹 조회
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const myRank = await tierSystem.getUserRank(db, req.user.userId);

        if (!myRank) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        myRank.tierDisplay = tierSystem.getTierDisplayName(myRank.current_tier);
        myRank.winRate = myRank.wins + myRank.losses > 0
            ? ((myRank.wins / (myRank.wins + myRank.losses)) * 100).toFixed(1)
            : 0;

        res.json(myRank);
    } catch (error) {
        console.error('내 랭킹 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 티어별 분포 조회
router.get('/distribution', async (req, res) => {
    try {
        const distribution = await tierSystem.getTierDistribution(db);

        const distributionWithDisplay = distribution.map(tier => ({
            ...tier,
            tierDisplay: tierSystem.getTierDisplayName(tier.current_tier)
        }));

        res.json(distributionWithDisplay);
    } catch (error) {
        console.error('티어 분포 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
