import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, battleAPI, rankingAPI, attendanceAPI } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import './Dashboard.css';

function Dashboard({ token, user, setUser }) {
    const [userData, setUserData] = useState(null);
    const [energy, setEnergy] = useState(null);
    const [myRank, setMyRank] = useState(null);
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const [userRes, energyRes, rankRes, attendanceRes] = await Promise.all([
                authAPI.getMe(),
                battleAPI.getEnergy(),
                rankingAPI.getMyRank(),
                attendanceAPI.getStatus()
            ]);

            setUserData(userRes.data);
            setEnergy(energyRes.data);
            setMyRank(rankRes.data);
            setAttendanceStatus(attendanceRes.data);

            // setUser는 초기 로딩 시에만 호출
            if (!user) {
                setUser(userRes.data);
            }
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            setError(error.response?.data?.error || '데이터를 불러오는데 실패했습니다.');
            // 에러 발생 시 자동 갱신 중지
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        } finally {
            setLoading(false);
        }
    }, [user, setUser]);

    useEffect(() => {
        fetchData();

        // 자동 갱신 시작
        intervalRef.current = setInterval(() => {
            fetchData();
        }, 30000); // 30초마다 업데이트

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchData]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleCheckIn = async () => {
        try {
            const response = await attendanceAPI.checkIn();
            alert(`출석체크 완료! ${response.data.pointsEarned} 포인트를 받았습니다.\n연속 출석: ${response.data.currentStreak}일`);
            fetchData(); // 데이터 새로고침
        } catch (error) {
            alert(error.response?.data?.error || '출석체크에 실패했습니다.');
        }
    };

    if (loading) {
        return <div className="dashboard-container"><p>로딩 중...</p></div>;
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2>오류 발생</h2>
                    <p>{error}</p>
                    <button onClick={fetchData}>다시 시도</button>
                    <button onClick={handleLogout} style={{ marginLeft: '10px' }}>로그아웃</button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1>LOL TCG Game</h1>
                <div className="nav-links">
                    <Link to="/dashboard">대시보드</Link>
                    <Link to="/shop">카드 상점</Link>
                    <Link to="/market">이적시장</Link>
                    <Link to="/deck">덱 관리</Link>
                    <Link to="/battle">배틀</Link>
                    <Link to="/rankings">랭킹</Link>
                    <Link to="/profile">프로필</Link>
                    <ThemeToggle />
                    <button onClick={handleLogout}>로그아웃</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="user-info-card">
                    <h2>{userData?.username}님 환영합니다!</h2>
                    <div className="stats">
                        <div className="stat-item">
                            <span className="stat-label">티어:</span>
                            <span className="stat-value">{myRank?.tierDisplay || '브론즈 5'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">티어 포인트:</span>
                            <span className="stat-value">{userData?.tier_points || 0} TP</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">랭킹:</span>
                            <span className="stat-value">#{myRank?.rank || '-'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">승률:</span>
                            <span className="stat-value">{myRank?.winRate || 0}%</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">포인트:</span>
                            <span className="stat-value">{userData?.points || 0}P</span>
                        </div>
                    </div>
                </div>

                <div className="energy-card">
                    <h3>배틀 에너지</h3>
                    <div className="energy-display">
                        <span className="energy-count">{energy?.currentEnergy || 0} / 10</span>
                        <div className="energy-bar">
                            <div
                                className="energy-fill"
                                style={{ width: `${((energy?.currentEnergy || 0) / 10) * 100}%` }}
                            ></div>
                        </div>
                        {energy?.currentEnergy < 10 && (
                            <p className="energy-recharge">
                                다음 충전: {energy?.nextRechargeIn?.formatted || '계산 중...'}
                            </p>
                        )}
                    </div>
                </div>

                <div className="attendance-card">
                    <h3>출석체크</h3>
                    {attendanceStatus?.checkedIn ? (
                        <div className="attendance-complete">
                            <p>오늘 출석체크 완료!</p>
                            <p className="points-earned">+{attendanceStatus.todayPoints} 포인트</p>
                            <p className="streak-info">연속 출석: {attendanceStatus.currentStreak}일</p>
                        </div>
                    ) : (
                        <div className="attendance-pending">
                            <p>오늘 출석체크를 하지 않았습니다</p>
                            <p className="streak-info">현재 연속: {attendanceStatus?.currentStreak || 0}일</p>
                            <button onClick={handleCheckIn} className="checkin-btn">
                                출석체크하기
                            </button>
                        </div>
                    )}
                </div>

                <div className="quick-actions">
                    <h3>빠른 액션</h3>
                    <div className="action-buttons">
                        <Link to="/shop" className="action-btn">
                            카드 구매하기
                        </Link>
                        <Link to="/deck" className="action-btn">
                            덱 구성하기
                        </Link>
                        <Link to="/battle" className="action-btn battle-btn">
                            배틀 시작하기
                        </Link>
                    </div>
                </div>

                <div className="game-info">
                    <h3>게임 안내</h3>
                    <ul>
                        <li>배틀 에너지는 5분마다 1개씩 충전됩니다 (최대 10개)</li>
                        <li>승리 시 +10 TP, 패배 시 -9 TP를 얻습니다</li>
                        <li>같은 팀 시즌 5명을 모으면 시너지 보너스를 받습니다</li>
                        <li>100 TP마다 티어가 상승합니다</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
