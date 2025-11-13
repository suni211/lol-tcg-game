// 출석체크 시스템

class AttendanceSystem {
    // 오늘 출석체크
    async checkIn(db, userId) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // 이미 오늘 출석했는지 확인
        const [existing] = await db.query(
            'SELECT attendance_id FROM daily_attendance WHERE user_id = ? AND check_date = ?',
            [userId, today]
        );

        if (existing.length > 0) {
            throw new Error('이미 오늘 출석체크를 완료했습니다.');
        }

        // 연속 출석 정보 가져오기
        const [streakInfo] = await db.query(
            'SELECT * FROM attendance_streak WHERE user_id = ?',
            [userId]
        );

        let currentStreak = 1;
        let longestStreak = 1;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (streakInfo.length > 0) {
            const lastCheckDate = streakInfo[0].last_check_date;

            // 어제 출석했으면 연속 출석
            if (lastCheckDate === yesterdayStr) {
                currentStreak = streakInfo[0].current_streak + 1;
                longestStreak = Math.max(currentStreak, streakInfo[0].longest_streak);
            } else {
                // 연속이 끊김
                currentStreak = 1;
                longestStreak = streakInfo[0].longest_streak;
            }
        }

        // 출석 보너스 계산 (기본 50 + 연속출석 보너스)
        let bonusPoints = 50;
        if (currentStreak >= 7) {
            bonusPoints += 100; // 7일 연속 보너스
        } else if (currentStreak >= 3) {
            bonusPoints += 30; // 3일 연속 보너스
        }

        // 트랜잭션 시작
        await db.query('START TRANSACTION');

        try {
            // 출석 기록
            await db.query(
                'INSERT INTO daily_attendance (user_id, check_date, points_earned) VALUES (?, ?, ?)',
                [userId, today, bonusPoints]
            );

            // 포인트 지급
            await db.query(
                'UPDATE users SET points = points + ? WHERE user_id = ?',
                [bonusPoints, userId]
            );

            // 연속 출석 업데이트
            if (streakInfo.length > 0) {
                await db.query(
                    'UPDATE attendance_streak SET current_streak = ?, longest_streak = ?, last_check_date = ? WHERE user_id = ?',
                    [currentStreak, longestStreak, today, userId]
                );
            } else {
                await db.query(
                    'INSERT INTO attendance_streak (user_id, current_streak, longest_streak, last_check_date) VALUES (?, ?, ?, ?)',
                    [userId, currentStreak, longestStreak, today]
                );
            }

            await db.query('COMMIT');

            return {
                success: true,
                pointsEarned: bonusPoints,
                currentStreak,
                longestStreak
            };
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }

    // 오늘 출석 여부 확인
    async getTodayStatus(db, userId) {
        const today = new Date().toISOString().split('T')[0];

        const [attendance] = await db.query(
            'SELECT * FROM daily_attendance WHERE user_id = ? AND check_date = ?',
            [userId, today]
        );

        const [streak] = await db.query(
            'SELECT * FROM attendance_streak WHERE user_id = ?',
            [userId]
        );

        return {
            checkedIn: attendance.length > 0,
            todayPoints: attendance.length > 0 ? attendance[0].points_earned : 0,
            currentStreak: streak.length > 0 ? streak[0].current_streak : 0,
            longestStreak: streak.length > 0 ? streak[0].longest_streak : 0
        };
    }

    // 출석 기록 조회 (최근 30일)
    async getAttendanceHistory(db, userId, days = 30) {
        const [history] = await db.query(
            `SELECT check_date, points_earned, created_at
            FROM daily_attendance
            WHERE user_id = ?
            ORDER BY check_date DESC
            LIMIT ?`,
            [userId, days]
        );

        return history;
    }

    // 월간 출석 통계
    async getMonthlyStats(db, userId) {
        const [stats] = await db.query(
            `SELECT
                COUNT(*) as total_days,
                SUM(points_earned) as total_points,
                DATE_FORMAT(check_date, '%Y-%m') as month
            FROM daily_attendance
            WHERE user_id = ? AND check_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE_FORMAT(check_date, '%Y-%m')`,
            [userId]
        );

        return stats.length > 0 ? stats[0] : { total_days: 0, total_points: 0 };
    }
}

module.exports = new AttendanceSystem();
