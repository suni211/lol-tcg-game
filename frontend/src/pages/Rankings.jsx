import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rankingAPI } from '../services/api';
import './Rankings.css';

function Rankings({ token }) {
    const [rankings, setRankings] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setError(null);
            const [rankingsRes, myRankRes] = await Promise.all([
                rankingAPI.getRankings(100, 0),
                rankingAPI.getMyRank()
            ]);
            setRankings(rankingsRes.data || []);
            setMyRank(myRankRes.data);
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            setError(error.response?.data?.error || '데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const getTierColor = (tierDisplay) => {
        if (!tierDisplay) return 'var(--gray-600)';
        if (tierDisplay.includes('챌린저') || tierDisplay.includes('그랜드마스터') || tierDisplay.includes('마스터')) {
            return 'var(--legendary)';
        }
        if (tierDisplay.includes('다이아몬드')) return 'var(--epic)';
        if (tierDisplay.includes('플래티넘') || tierDisplay.includes('골드')) return 'var(--rare)';
        return 'var(--common)';
    };

    if (loading) {
        return (
            <div className="rankings-container">
                <nav className="rankings-nav">
                    <Link to="/dashboard">← 대시보드</Link>
                    <h2>🏆 랭킹</h2>
                </nav>
                <div className="loading">로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rankings-container">
                <nav className="rankings-nav">
                    <Link to="/dashboard">← 대시보드</Link>
                    <h2>🏆 랭킹</h2>
                </nav>
                <div className="error-container">
                    <h2>오류 발생</h2>
                    <p>{error}</p>
                    <button className="btn-primary" onClick={fetchData}>다시 시도</button>
                </div>
            </div>
        );
    }

    return (
        <div className="rankings-container">
            <nav className="rankings-nav">
                <Link to="/dashboard">← 대시보드</Link>
                <h2>🏆 랭킹</h2>
            </nav>

            <div className="rankings-content">
                {myRank && (
                    <div className="my-rank-card">
                        <h3>내 랭킹</h3>
                        <div className="my-rank-stats">
                            <div className="rank-stat">
                                <span className="stat-label">순위</span>
                                <span className="stat-value rank-number">#{myRank.rank}</span>
                            </div>
                            <div className="rank-stat">
                                <span className="stat-label">티어</span>
                                <span className="stat-value tier-display" style={{ color: getTierColor(myRank.tierDisplay) }}>
                                    {myRank.tierDisplay}
                                </span>
                            </div>
                            <div className="rank-stat">
                                <span className="stat-label">티어 포인트</span>
                                <span className="stat-value">{myRank.tier_points} TP</span>
                            </div>
                            <div className="rank-stat">
                                <span className="stat-label">전적</span>
                                <span className="stat-value">{myRank.wins}승 {myRank.losses}패</span>
                            </div>
                            <div className="rank-stat">
                                <span className="stat-label">승률</span>
                                <span className="stat-value winrate">{myRank.winRate}%</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="rankings-table-container">
                    <h3>전체 랭킹</h3>
                    {rankings.length === 0 ? (
                        <p className="no-data">랭킹 데이터가 없습니다.</p>
                    ) : (
                        <table className="rankings-table">
                            <thead>
                                <tr>
                                    <th>순위</th>
                                    <th>닉네임</th>
                                    <th>티어</th>
                                    <th>TP</th>
                                    <th>전적</th>
                                    <th>승률</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankings.map((user, index) => (
                                    <tr
                                        key={user.user_id}
                                        className={user.user_id === myRank?.user_id ? 'my-rank-row' : ''}
                                    >
                                        <td className="rank-cell">
                                            {user.rank <= 3 ? (
                                                <span className={`medal medal-${user.rank}`}>
                                                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                                                </span>
                                            ) : (
                                                <span className="rank-number">#{user.rank}</span>
                                            )}
                                        </td>
                                        <td className="username-cell">{user.username}</td>
                                        <td className="tier-cell">
                                            <span className="tier-badge" style={{ color: getTierColor(user.tierDisplay) }}>
                                                {user.tierDisplay}
                                            </span>
                                        </td>
                                        <td className="tp-cell">{user.tier_points}</td>
                                        <td className="record-cell">{user.wins}승 {user.losses}패</td>
                                        <td className="winrate-cell">
                                            <span className={`winrate ${user.winRate >= 60 ? 'high' : user.winRate >= 50 ? 'mid' : 'low'}`}>
                                                {user.winRate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Rankings;
