import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import './Profile.css';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setError(null);
            const res = await userAPI.getProfile();
            setProfile(res.data);
        } catch (error) {
            console.error('프로필 로딩 실패:', error);
            setError(error.response?.data?.error || '프로필을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const getTierDisplay = (tier) => {
        const tierMap = {
            'BRONZE_5': '브론즈 5', 'BRONZE_4': '브론즈 4', 'BRONZE_3': '브론즈 3', 'BRONZE_2': '브론즈 2', 'BRONZE_1': '브론즈 1',
            'SILVER_5': '실버 5', 'SILVER_4': '실버 4', 'SILVER_3': '실버 3', 'SILVER_2': '실버 2', 'SILVER_1': '실버 1',
            'GOLD_5': '골드 5', 'GOLD_4': '골드 4', 'GOLD_3': '골드 3', 'GOLD_2': '골드 2', 'GOLD_1': '골드 1',
            'PLATINUM_5': '플래티넘 5', 'PLATINUM_4': '플래티넘 4', 'PLATINUM_3': '플래티넘 3', 'PLATINUM_2': '플래티넘 2', 'PLATINUM_1': '플래티넘 1',
            'DIAMOND_5': '다이아 5', 'DIAMOND_4': '다이아 4', 'DIAMOND_3': '다이아 3', 'DIAMOND_2': '다이아 2', 'DIAMOND_1': '다이아 1',
            'CHALLENGER': '챌린저'
        };
        return tierMap[tier] || tier;
    };

    const getTierColor = (tier) => {
        if (tier.startsWith('BRONZE')) return '#cd7f32';
        if (tier.startsWith('SILVER')) return '#c0c0c0';
        if (tier.startsWith('GOLD')) return '#ffd700';
        if (tier.startsWith('PLATINUM')) return '#00ffaa';
        if (tier.startsWith('DIAMOND')) return '#b9f2ff';
        if (tier === 'CHALLENGER') return '#ff4655';
        return '#808080';
    };

    const getCardTierColor = (tier) => {
        const colors = {
            LEGENDARY: '#ff8c00',
            EPIC: '#9400d3',
            RARE: '#4169e1',
            COMMON: '#808080'
        };
        return colors[tier] || '#000';
    };

    if (loading) {
        return (
            <div className="profile-container">
                <nav className="profile-nav">
                    <Link to="/dashboard">← 대시보드</Link>
                </nav>
                <p className="loading-text">로딩 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <nav className="profile-nav">
                    <Link to="/dashboard">← 대시보드</Link>
                </nav>
                <div className="error-message">
                    <h2>오류 발생</h2>
                    <p>{error}</p>
                    <button onClick={fetchProfile}>다시 시도</button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <nav className="profile-nav">
                <Link to="/dashboard">← 대시보드</Link>
                <h2>프로필</h2>
            </nav>

            <div className="profile-content">
                {/* 사용자 기본 정보 */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        <div className="avatar-icon">👤</div>
                    </div>
                    <div className="profile-info">
                        <h1 className="username">{profile.user.username}</h1>
                        <div className="tier-badge" style={{ borderColor: getTierColor(profile.user.tier) }}>
                            <span className="tier-name" style={{ color: getTierColor(profile.user.tier) }}>
                                {getTierDisplay(profile.user.tier)}
                            </span>
                            <span className="tier-points">{profile.user.tierPoints} TP</span>
                        </div>
                        <p className="rank-text">전체 순위: #{profile.stats.rank}</p>
                        <p className="joined-date">
                            가입일: {new Date(profile.user.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                    </div>
                </div>

                {/* 전적 통계 */}
                <div className="stats-section">
                    <h3>📊 전적 통계</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{profile.stats.totalGames}</div>
                            <div className="stat-label">총 게임</div>
                        </div>
                        <div className="stat-card wins">
                            <div className="stat-value">{profile.stats.totalWins}</div>
                            <div className="stat-label">승리</div>
                        </div>
                        <div className="stat-card losses">
                            <div className="stat-value">{profile.stats.totalLosses}</div>
                            <div className="stat-label">패배</div>
                        </div>
                        <div className="stat-card winrate">
                            <div className="stat-value">{profile.stats.winRate}%</div>
                            <div className="stat-label">승률</div>
                        </div>
                    </div>
                </div>

                {/* 보유 카드 통계 */}
                <div className="cards-stats-section">
                    <h3>🎴 보유 카드</h3>
                    <div className="total-cards">
                        <span className="total-cards-count">{profile.cards.totalCards}</span>
                        <span className="total-cards-label">장</span>
                    </div>
                    <div className="cards-by-tier">
                        <div className="tier-stat legendary" style={{ borderColor: getCardTierColor('LEGENDARY') }}>
                            <div className="tier-icon" style={{ background: getCardTierColor('LEGENDARY') }}>★</div>
                            <div className="tier-info">
                                <div className="tier-name">전설</div>
                                <div className="tier-count">{profile.cards.byTier.LEGENDARY}장</div>
                            </div>
                        </div>
                        <div className="tier-stat epic" style={{ borderColor: getCardTierColor('EPIC') }}>
                            <div className="tier-icon" style={{ background: getCardTierColor('EPIC') }}>◆</div>
                            <div className="tier-info">
                                <div className="tier-name">영웅</div>
                                <div className="tier-count">{profile.cards.byTier.EPIC}장</div>
                            </div>
                        </div>
                        <div className="tier-stat rare" style={{ borderColor: getCardTierColor('RARE') }}>
                            <div className="tier-icon" style={{ background: getCardTierColor('RARE') }}>▲</div>
                            <div className="tier-info">
                                <div className="tier-name">희귀</div>
                                <div className="tier-count">{profile.cards.byTier.RARE}장</div>
                            </div>
                        </div>
                        <div className="tier-stat common" style={{ borderColor: getCardTierColor('COMMON') }}>
                            <div className="tier-icon" style={{ background: getCardTierColor('COMMON') }}>●</div>
                            <div className="tier-info">
                                <div className="tier-name">일반</div>
                                <div className="tier-count">{profile.cards.byTier.COMMON}장</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 최근 배틀 기록 */}
                <div className="recent-battles-section">
                    <h3>⚔️ 최근 전적</h3>
                    {profile.recentBattles.length === 0 ? (
                        <p className="no-battles">배틀 기록이 없습니다</p>
                    ) : (
                        <div className="battles-list">
                            {profile.recentBattles.map(battle => (
                                <div
                                    key={battle.battle_id}
                                    className={`battle-item ${battle.isWin ? 'win' : 'loss'}`}
                                >
                                    <div className="battle-result">
                                        <span className="result-badge">
                                            {battle.isWin ? '승' : '패'}
                                        </span>
                                    </div>
                                    <div className="battle-details">
                                        <div className="battle-opponent">
                                            vs {battle.player1_name === profile.user.username
                                                ? battle.player2_name
                                                : battle.player1_name}
                                        </div>
                                        <div className="battle-date">
                                            {new Date(battle.completed_at).toLocaleString('ko-KR')}
                                        </div>
                                    </div>
                                    <div className="battle-tp-change">
                                        <span className={battle.myTierChange > 0 ? 'positive' : 'negative'}>
                                            {battle.myTierChange > 0 ? '+' : ''}{battle.myTierChange} TP
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
