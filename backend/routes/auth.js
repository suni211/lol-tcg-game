const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// 회원가입
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
        }

        if (password.length < 4) {
            return res.status(400).json({ error: '비밀번호는 최소 4자 이상이어야 합니다.' });
        }

        // 중복 확인
        const [existing] = await db.query(
            'SELECT user_id FROM users WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
        }

        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성 (브론즈 5, 0 티어포인트, 10 배틀에너지, 1000 포인트로 시작)
        const [result] = await db.query(
            `INSERT INTO users (username, password_hash, tier_points, current_tier, battle_energy, points)
            VALUES (?, ?, 0, 'BRONZE_5', 10, 1000)`,
            [username, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            userId: result.insertId
        });
    } catch (error) {
        console.error('회원가입 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
        }

        // 사용자 조회
        const [users] = await db.query(
            'SELECT user_id, username, password_hash, current_tier, tier_points, battle_energy, points FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        const user = users[0];

        // 비밀번호 확인
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: user.user_id, username: user.username },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                userId: user.user_id,
                username: user.username,
                tier: user.current_tier,
                tierPoints: user.tier_points,
                battleEnergy: user.battle_energy,
                points: user.points
            }
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 현재 사용자 정보 조회
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT user_id, username, current_tier, tier_points, battle_energy, points, last_energy_update FROM users WHERE user_id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

module.exports = { router };
