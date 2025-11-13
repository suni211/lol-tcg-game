const express = require('express');
const router = express.Router();
const db = require('../config/database');
const marketSystem = require('../services/marketSystem');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트에 인증 필요
router.use(authenticateToken);

// 전체 시장 목록 조회
router.get('/listings', async (req, res) => {
    try {
        const filters = {
            tier: req.query.tier,
            position: req.query.position,
            team: req.query.team
        };

        const listings = await marketSystem.getAllMarketListings(db, filters);
        res.json({ listings });
    } catch (error) {
        console.error('시장 목록 조회 실패:', error);
        res.status(500).json({ error: error.message });
    }
});

// 카드 시세 조회
router.get('/price/:cardId', async (req, res) => {
    try {
        const cardId = parseInt(req.params.cardId);
        const overview = await marketSystem.getMarketOverview(db, cardId);
        res.json(overview);
    } catch (error) {
        console.error('시세 조회 실패:', error);
        res.status(500).json({ error: error.message });
    }
});

// 판매 등록
router.post('/sell', async (req, res) => {
    try {
        const { userCardId, listingPrice } = req.body;
        const userId = req.user.userId;

        if (!userCardId || !listingPrice) {
            return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
        }

        const result = await marketSystem.createListing(db, userId, userCardId, parseInt(listingPrice));
        res.json({
            success: true,
            listing: result
        });
    } catch (error) {
        console.error('판매 등록 실패:', error);
        res.status(400).json({ error: error.message });
    }
});

// 구매 예약
router.post('/bid', async (req, res) => {
    try {
        const { cardId, bidPrice } = req.body;
        const userId = req.user.userId;

        if (!cardId || !bidPrice) {
            return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
        }

        const result = await marketSystem.createBid(db, userId, parseInt(cardId), parseInt(bidPrice));
        res.json({
            success: true,
            bid: result
        });
    } catch (error) {
        console.error('구매 예약 실패:', error);
        res.status(400).json({ error: error.message });
    }
});

// 즉시 구매
router.post('/buy/:listingId', async (req, res) => {
    try {
        const listingId = parseInt(req.params.listingId);
        const userId = req.user.userId;

        const result = await marketSystem.instantBuy(db, userId, listingId);
        res.json(result);
    } catch (error) {
        console.error('즉시 구매 실패:', error);
        res.status(400).json({ error: error.message });
    }
});

// 즉시 판매
router.post('/sell-instant', async (req, res) => {
    try {
        const { userCardId } = req.body;
        const userId = req.user.userId;

        if (!userCardId) {
            return res.status(400).json({ error: '카드 정보가 필요합니다.' });
        }

        const result = await marketSystem.instantSell(db, userId, userCardId);
        res.json(result);
    } catch (error) {
        console.error('즉시 판매 실패:', error);
        res.status(400).json({ error: error.message });
    }
});

// 내 판매 등록 조회
router.get('/my-listings', async (req, res) => {
    try {
        const userId = req.user.userId;
        const listings = await marketSystem.getMyListings(db, userId);
        res.json({ listings });
    } catch (error) {
        console.error('내 판매 등록 조회 실패:', error);
        res.status(500).json({ error: error.message });
    }
});

// 내 구매 예약 조회
router.get('/my-bids', async (req, res) => {
    try {
        const userId = req.user.userId;
        const bids = await marketSystem.getMyBids(db, userId);
        res.json({ bids });
    } catch (error) {
        console.error('내 구매 예약 조회 실패:', error);
        res.status(500).json({ error: error.message });
    }
});

// 판매 등록 취소
router.delete('/listing/:listingId', async (req, res) => {
    try {
        const listingId = parseInt(req.params.listingId);
        const userId = req.user.userId;

        const result = await marketSystem.cancelListing(db, userId, listingId);
        res.json(result);
    } catch (error) {
        console.error('판매 취소 실패:', error);
        res.status(400).json({ error: error.message });
    }
});

// 구매 예약 취소
router.delete('/bid/:bidId', async (req, res) => {
    try {
        const bidId = parseInt(req.params.bidId);
        const userId = req.user.userId;

        const result = await marketSystem.cancelBid(db, userId, bidId);
        res.json(result);
    } catch (error) {
        console.error('구매 예약 취소 실패:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
