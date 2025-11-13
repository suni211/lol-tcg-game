const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');
const energySystem = require('./services/energySystem');

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 import
const { router: authRouter } = require('./routes/auth');
const cardsRouter = require('./routes/cards');
const battleRouter = require('./routes/battle');
const rankingRouter = require('./routes/ranking');
const userRouter = require('./routes/user');

// 라우트 등록
app.use('/api/auth', authRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/battle', battleRouter);
app.use('/api/ranking', rankingRouter);
app.use('/api/user', userRouter);

// 헬스 체크
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'LOL TCG Game Server is running' });
});

// 데이터베이스 연결 테스트
app.get('/api/db-test', async (req, res) => {
    try {
        const [result] = await db.query('SELECT 1 + 1 AS result');
        res.json({ success: true, result: result[0] });
    } catch (error) {
        console.error('DB 연결 오류:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error('서버 오류:', err);
    res.status(500).json({
        error: '서버 내부 오류가 발생했습니다.',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 핸들링
app.use((req, res) => {
    res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`LOL TCG Game Server`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=================================`);

    // 에너지 충전 백그라운드 작업 시작
    energySystem.startEnergyRechargeTask(db);

    // 매칭 시스템 주기적 체크 (5초마다)
    const matchmakingSystem = require('./services/matchmakingSystem');
    setInterval(async () => {
        try {
            await matchmakingSystem.tryMatchAll(db);
        } catch (error) {
            console.error('매칭 시스템 오류:', error);
        }
    }, 5000);
    console.log('✓ 매칭 시스템 시작됨 (5초 간격)');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT 신호를 받았습니다. 서버를 종료합니다...');
    process.exit(0);
});
