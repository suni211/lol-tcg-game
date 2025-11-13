const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lol_tcg_game',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+09:00',
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4'
});

// 연결 테스트
pool.getConnection()
    .then(connection => {
        console.log('✓ 데이터베이스 연결 성공');
        connection.release();
    })
    .catch(err => {
        console.error('✗ 데이터베이스 연결 실패:', err.message);
        console.error('환경 변수를 확인하세요:');
        console.error(`  DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
        console.error(`  DB_USER: ${process.env.DB_USER || 'root'}`);
        console.error(`  DB_NAME: ${process.env.DB_NAME || 'lol_tcg_game'}`);
        console.error(`  DB_PORT: ${process.env.DB_PORT || 3306}`);
    });

module.exports = pool;
