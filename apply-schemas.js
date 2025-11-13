const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function applySchemas() {
    console.log('데이터베이스 스키마를 적용합니다...\n');

    // 데이터베이스 연결
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        // 출석체크 스키마 적용
        console.log('출석체크 스키마 적용 중...');
        const attendanceSchema = await fs.readFile(
            path.join(__dirname, 'database', 'attendance_schema.sql'),
            'utf8'
        );
        await connection.query(attendanceSchema);
        console.log('✓ 출석체크 스키마 적용 완료\n');

        // 카드 강화 스키마 적용
        console.log('카드 강화 스키마 적용 중...');
        const enhancementSchema = await fs.readFile(
            path.join(__dirname, 'database', 'enhancement_schema.sql'),
            'utf8'
        );
        await connection.query(enhancementSchema);
        console.log('✓ 카드 강화 스키마 적용 완료\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('모든 스키마 적용 완료!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('서버를 재시작해주세요:');
        console.log('  pm2 restart lol-tcg-backend');
        console.log('  cd frontend && npm run build && pm2 restart lol-tcg-frontend\n');

    } catch (error) {
        console.error('✗ 스키마 적용 중 오류 발생:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

applySchemas();
