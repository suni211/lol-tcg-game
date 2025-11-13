const express = require('express');
const router = express.Router();
const db = require('../config/database');
const cardSystem = require('../services/cardSystem');
const { authenticateToken } = require('./auth');

// 카드 상점 목록 조회
router.get('/shop', authenticateToken, async (req, res) => {
    try {
        const filters = {
            region: req.query.region,
            tier: req.query.tier,
            position: req.query.position,
            season: req.query.season,
            minOverall: req.query.minOverall,
            maxOverall: req.query.maxOverall,
            limit: req.query.limit || 100
        };

        const cards = await cardSystem.getShopCards(db, filters);
        res.json(cards);
    } catch (error) {
        console.error('카드 상점 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 랜덤 카드 팩 구매
router.post('/purchase', authenticateToken, async (req, res) => {
    try {
        const { packTier } = req.body;

        if (!packTier) {
            return res.status(400).json({ error: '팩 등급이 필요합니다. (COMMON, RARE, EPIC)' });
        }

        const result = await cardSystem.purchaseRandomCard(db, req.user.userId, packTier);
        res.json(result);
    } catch (error) {
        console.error('카드 팩 구매 오류:', error);
        res.status(400).json({ error: error.message });
    }
});

// 사용자 소유 카드 목록
router.get('/my-cards', authenticateToken, async (req, res) => {
    try {
        const cards = await cardSystem.getUserCards(db, req.user.userId);
        res.json(cards);
    } catch (error) {
        console.error('소유 카드 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 덱 생성
router.post('/decks', authenticateToken, async (req, res) => {
    try {
        const { deckName } = req.body;
        const result = await cardSystem.createDeck(db, req.user.userId, deckName);
        res.json(result);
    } catch (error) {
        console.error('덱 생성 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 사용자 덱 목록
router.get('/decks', authenticateToken, async (req, res) => {
    try {
        const decks = await cardSystem.getUserDecks(db, req.user.userId);
        res.json(decks);
    } catch (error) {
        console.error('덱 목록 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 특정 덱 조회
router.get('/decks/:deckId', authenticateToken, async (req, res) => {
    try {
        const deck = await cardSystem.getDeck(db, req.params.deckId);

        if (!deck) {
            return res.status(404).json({ error: '덱을 찾을 수 없습니다.' });
        }

        // 시너지 확인
        const synergy = await cardSystem.checkTeamSynergy(db, req.params.deckId);
        deck.synergy = synergy;

        res.json(deck);
    } catch (error) {
        console.error('덱 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 덱에 카드 추가
router.post('/decks/:deckId/cards', authenticateToken, async (req, res) => {
    try {
        const { userCardId, position } = req.body;

        if (!userCardId || !position) {
            return res.status(400).json({ error: '카드 ID와 포지션이 필요합니다.' });
        }

        const result = await cardSystem.addCardToDeck(
            db,
            req.user.userId,
            req.params.deckId,
            userCardId,
            position
        );

        res.json(result);
    } catch (error) {
        console.error('덱 카드 추가 오류:', error);
        res.status(400).json({ error: error.message });
    }
});

// 덱에서 카드 제거
router.delete('/decks/:deckId/cards/:position', authenticateToken, async (req, res) => {
    try {
        const result = await cardSystem.removeCardFromDeck(
            db,
            req.user.userId,
            req.params.deckId,
            parseInt(req.params.position)
        );

        res.json(result);
    } catch (error) {
        console.error('덱 카드 제거 오류:', error);
        res.status(400).json({ error: error.message });
    }
});

// 활성 덱 설정
router.post('/decks/:deckId/activate', authenticateToken, async (req, res) => {
    try {
        const result = await cardSystem.setActiveDeck(db, req.user.userId, req.params.deckId);
        res.json(result);
    } catch (error) {
        console.error('활성 덱 설정 오류:', error);
        res.status(400).json({ error: error.message });
    }
});

// 활성 덱 조회
router.get('/decks/active/current', authenticateToken, async (req, res) => {
    try {
        const deck = await cardSystem.getActiveDeck(db, req.user.userId);

        if (!deck) {
            return res.status(404).json({ error: '활성화된 덱이 없습니다.' });
        }

        // 시너지 확인
        const synergy = await cardSystem.checkTeamSynergy(db, deck.deck_id);
        deck.synergy = synergy;

        res.json(deck);
    } catch (error) {
        console.error('활성 덱 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 덱 삭제
router.delete('/decks/:deckId', authenticateToken, async (req, res) => {
    try {
        const result = await cardSystem.deleteDeck(db, req.user.userId, req.params.deckId);
        res.json(result);
    } catch (error) {
        console.error('덱 삭제 오류:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
