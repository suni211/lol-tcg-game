const express = require('express');
const router = express.Router();
const attendanceSystem = require('../services/attendanceSystem');
const { authenticateToken } = require('../middleware/auth');

// 출석체크
router.post('/checkin', authenticateToken, async (req, res) => {
    const db = req.app.get('db');
    try {
        const result = await attendanceSystem.checkIn(db, req.user.userId);
        res.json(result);
    } catch (error) {
        console.error('출석체크 오류:', error);
        res.status(400).json({ error: error.message });
    }
});

// 오늘 출석 상태 조회
router.get('/status', authenticateToken, async (req, res) => {
    const db = req.app.get('db');
    try {
        const status = await attendanceSystem.getTodayStatus(db, req.user.userId);
        res.json(status);
    } catch (error) {
        console.error('출석 상태 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 출석 기록 조회
router.get('/history', authenticateToken, async (req, res) => {
    const db = req.app.get('db');
    const days = parseInt(req.query.days) || 30;

    try {
        const history = await attendanceSystem.getAttendanceHistory(db, req.user.userId, days);
        res.json(history);
    } catch (error) {
        console.error('출석 기록 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 월간 통계 조회
router.get('/stats', authenticateToken, async (req, res) => {
    const db = req.app.get('db');

    try {
        const stats = await attendanceSystem.getMonthlyStats(db, req.user.userId);
        res.json(stats);
    } catch (error) {
        console.error('출석 통계 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
