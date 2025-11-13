const express = require('express');
const router = express.Router();
const db = require('../config/database');
const BattleEngine = require('../services/battleEngine');
const energySystem = require('../services/energySystem');
const matchmakingSystem = require('../services/matchmakingSystem');
const tierSystem = require('../services/tierSystem');
const cardSystem = require('../services/cardSystem');
const { authenticateToken } = require('./auth');

// 에너지 상태 조회
router.get('/energy', authenticateToken, async (req, res) => {
    try {
        const energyInfo = await energySystem.updateEnergy(db, req.user.userId);
        res.json(energyInfo);
    } catch (error) {
        console.error('에너지 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 매치메이킹 큐 참가
router.post('/queue/join', authenticateToken, async (req, res) => {
    try {
        const { deckId } = req.body;

        if (!deckId) {
            return res.status(400).json({ error: '덱 ID가 필요합니다.' });
        }

        // 덱 소유권 및 완전성 확인
        const [deck] = await db.query(
            'SELECT deck_id FROM user_decks WHERE deck_id = ? AND user_id = ?',
            [deckId, req.user.userId]
        );

        if (deck.length === 0) {
            return res.status(400).json({ error: '덱을 찾을 수 없거나 권한이 없습니다.' });
        }

        // 덱에 5명의 카드가 있는지 확인
        const [deckCards] = await db.query(
            'SELECT COUNT(*) as count FROM deck_cards WHERE deck_id = ?',
            [deckId]
        );

        if (deckCards[0].count !== 5) {
            return res.status(400).json({ error: '덱에 5명의 선수가 필요합니다.' });
        }

        // 에너지 확인
        const [user] = await db.query(
            'SELECT battle_energy, last_energy_update FROM users WHERE user_id = ?',
            [req.user.userId]
        );

        const energyInfo = energySystem.calculateCurrentEnergy(
            user[0].battle_energy,
            user[0].last_energy_update
        );

        if (energyInfo.currentEnergy < 1) {
            return res.status(400).json({
                error: '배틀 에너지가 부족합니다.',
                nextRecharge: energyInfo.nextRechargeIn
            });
        }

        const queueData = await matchmakingSystem.joinQueue(db, req.user.userId, deckId);
        res.json({ success: true, queueData });
    } catch (error) {
        console.error('큐 참가 오류:', error);
        res.status(400).json({ error: error.message });
    }
});

// 매치메이킹 큐 나가기
router.post('/queue/leave', authenticateToken, async (req, res) => {
    try {
        const result = await matchmakingSystem.leaveQueue(db, req.user.userId);
        res.json(result);
    } catch (error) {
        console.error('큐 나가기 오류:', error);
        res.status(400).json({ error: error.message });
    }
});

// 큐 상태 조회
router.get('/queue/status', authenticateToken, async (req, res) => {
    try {
        const status = matchmakingSystem.getQueueStatus(req.user.userId);
        res.json(status || { inQueue: false });
    } catch (error) {
        console.error('큐 상태 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 배틀 시작 (테스트용 - 실제로는 매치메이킹에서 자동 호출)
router.post('/start', authenticateToken, async (req, res) => {
    try {
        const { opponentId, deckId } = req.body;

        // 에너지 사용
        await energySystem.useEnergy(db, req.user.userId, 1);

        // 덱 정보 가져오기
        const [player1Deck] = await db.query(
            `SELECT cm.*
            FROM deck_cards dc
            JOIN user_cards uc ON dc.user_card_id = uc.user_card_id
            JOIN cards_master cm ON uc.card_id = cm.card_id
            WHERE dc.deck_id = ?
            ORDER BY dc.position`,
            [deckId]
        );

        // 상대 덱 (활성 덱)
        const [player2Deck] = await db.query(
            `SELECT cm.*
            FROM user_decks ud
            JOIN deck_cards dc ON ud.deck_id = dc.deck_id
            JOIN user_cards uc ON dc.user_card_id = uc.user_card_id
            JOIN cards_master cm ON uc.card_id = cm.card_id
            WHERE ud.user_id = ? AND ud.is_active = TRUE
            ORDER BY dc.position`,
            [opponentId]
        );

        if (player1Deck.length !== 5 || player2Deck.length !== 5) {
            return res.status(400).json({ error: '양쪽 모두 5명의 선수가 필요합니다.' });
        }

        // 시너지 확인
        const synergy1 = await cardSystem.checkTeamSynergy(db, deckId);
        const [opponentActiveDeck] = await db.query(
            'SELECT deck_id FROM user_decks WHERE user_id = ? AND is_active = TRUE',
            [opponentId]
        );
        const synergy2 = await cardSystem.checkTeamSynergy(db, opponentActiveDeck[0].deck_id);

        // 배틀 시뮬레이션
        const battleEngine = new BattleEngine();
        const battleResult = await battleEngine.simulateBattle(
            player1Deck,
            player2Deck,
            synergy1.bonus,
            synergy2.bonus
        );

        // 배틀 결과 저장
        const winnerId = battleResult.winner === 1 ? req.user.userId : opponentId;
        const [battleRecord] = await db.query(
            `INSERT INTO battles (player1_id, player2_id, winner_id, player1_deck_id, player2_deck_id, battle_log, battle_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.user.userId, opponentId, winnerId, deckId, opponentActiveDeck[0].deck_id, battleResult.battleLog, battleResult.duration]
        );

        // 티어 포인트 업데이트
        const tierUpdate = await tierSystem.processBattleResult(db, winnerId, winnerId === req.user.userId ? opponentId : req.user.userId);

        // 배틀 기록에 티어 변동 저장
        await db.query(
            'UPDATE battles SET player1_tier_change = ?, player2_tier_change = ? WHERE battle_id = ?',
            [
                winnerId === req.user.userId ? tierUpdate.winner.pointChange : tierUpdate.loser.pointChange,
                winnerId === opponentId ? tierUpdate.winner.pointChange : tierUpdate.loser.pointChange,
                battleRecord.insertId
            ]
        );

        res.json({
            success: true,
            battleId: battleRecord.insertId,
            winner: battleResult.winner,
            battleLog: battleResult.battleLog,
            tierUpdate: winnerId === req.user.userId ? tierUpdate.winner : tierUpdate.loser
        });
    } catch (error) {
        console.error('배틀 시작 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 배틀 기록 조회
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const [battles] = await db.query(
            `SELECT
                b.*,
                u1.username as player1_name,
                u2.username as player2_name,
                winner.username as winner_name
            FROM battles b
            JOIN users u1 ON b.player1_id = u1.user_id
            JOIN users u2 ON b.player2_id = u2.user_id
            LEFT JOIN users winner ON b.winner_id = winner.user_id
            WHERE b.player1_id = ? OR b.player2_id = ?
            ORDER BY b.started_at DESC
            LIMIT ? OFFSET ?`,
            [req.user.userId, req.user.userId, limit, offset]
        );

        res.json(battles);
    } catch (error) {
        console.error('배틀 기록 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 특정 배틀 상세 조회
router.get('/history/:battleId', authenticateToken, async (req, res) => {
    try {
        const [battle] = await db.query(
            `SELECT
                b.*,
                u1.username as player1_name,
                u2.username as player2_name,
                winner.username as winner_name
            FROM battles b
            JOIN users u1 ON b.player1_id = u1.user_id
            JOIN users u2 ON b.player2_id = u2.user_id
            LEFT JOIN users winner ON b.winner_id = winner.user_id
            WHERE b.battle_id = ? AND (b.player1_id = ? OR b.player2_id = ?)`,
            [req.params.battleId, req.user.userId, req.user.userId]
        );

        if (battle.length === 0) {
            return res.status(404).json({ error: '배틀을 찾을 수 없습니다.' });
        }

        res.json(battle[0]);
    } catch (error) {
        console.error('배틀 상세 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
