const express = require('express');
const router = express.Router();
const enhancementSystem = require('../services/enhancementSystem');
const { authenticateToken } = require('../middleware/auth');

// 카드 강화
router.post('/enhance', authenticateToken, async (req, res) => {
    const db = req.app.get('db');
    const { targetCardId, materialCardId } = req.body;

    if (!targetCardId || !materialCardId) {
        return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
    }

    try {
        const result = await enhancementSystem.enhanceCard(
            db,
            req.user.userId,
            targetCardId,
            materialCardId
        );
        res.json(result);
    } catch (error) {
        console.error('카드 강화 오류:', error);
        res.status(400).json({ error: error.message });
    }
});

// 강화 가능한 중복 카드 조회
router.get('/duplicates/:targetCardId', authenticateToken, async (req, res) => {
    const db = req.app.get('db');
    const { targetCardId } = req.params;

    try {
        const duplicates = await enhancementSystem.getEnhanceableDuplicates(
            db,
            req.user.userId,
            targetCardId
        );
        res.json(duplicates);
    } catch (error) {
        console.error('중복 카드 조회 오류:', error);
        res.status(400).json({ error: error.message });
    }
});

// 강화 기록 조회
router.get('/history', authenticateToken, async (req, res) => {
    const db = req.app.get('db');
    const limit = parseInt(req.query.limit) || 50;

    try {
        const history = await enhancementSystem.getEnhancementHistory(
            db,
            req.user.userId,
            limit
        );
        res.json(history);
    } catch (error) {
        console.error('강화 기록 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
