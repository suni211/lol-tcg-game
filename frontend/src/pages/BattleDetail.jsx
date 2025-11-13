import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { battleAPI } from '../services/api';
import './BattleDetail.css';

function BattleDetail({ token }) {
    const { battleId } = useParams();
    const [battle, setBattle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBattleDetail();
    }, [battleId]);

    const fetchBattleDetail = async () => {
        try {
            const res = await battleAPI.getBattleDetail(battleId);
            setBattle(res.data);
        } catch (error) {
            console.error('배틀 상세 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (!battle) {
        return <div className="error">배틀 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="battle-detail-container">
            <nav className="battle-detail-nav">
                <Link to="/battle">← 배틀</Link>
                <h2>배틀 상세</h2>
            </nav>

            <div className="battle-detail-content">
                <div className="battle-summary">
                    <div className="battle-vs">
                        <div className={`player-box ${battle.winner_id === battle.player1_id ? 'winner' : 'loser'}`}>
                            <h3>{battle.player1_name}</h3>
                            <div className="tier-change">
                                {battle.player1_tier_change > 0 ? '+' : ''}{battle.player1_tier_change} TP
                            </div>
                        </div>
                        <div className="vs-text">VS</div>
                        <div className={`player-box ${battle.winner_id === battle.player2_id ? 'winner' : 'loser'}`}>
                            <h3>{battle.player2_name}</h3>
                            <div className="tier-change">
                                {battle.player2_tier_change > 0 ? '+' : ''}{battle.player2_tier_change} TP
                            </div>
                        </div>
                    </div>

                    <div className="battle-result">
                        <h2>승자: {battle.winner_name}</h2>
                        <p>전투 시간: {battle.battle_duration}분</p>
                        <p>시작 시간: {new Date(battle.started_at).toLocaleString()}</p>
                    </div>
                </div>

                {/* MVP 및 경기 요약 */}
                {battle.summary && (
                    <div className="battle-stats-section">
                        <h3>🏆 경기 요약</h3>

                        {/* MVP */}
                        <div className="mvp-card">
                            <div className="mvp-header">
                                <h4>⭐ MVP</h4>
                                <span className={`mvp-team team-${battle.summary.mvp.team}`}>
                                    {battle.summary.mvp.team === 1 ? '블루팀' : '레드팀'}
                                </span>
                            </div>
                            <div className="mvp-body">
                                <h3>{battle.summary.mvp.playerName}</h3>
                                <p className="mvp-position">{battle.summary.mvp.position}</p>
                                <div className="mvp-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">KDA</span>
                                        <span className="stat-value highlight">{battle.summary.mvp.kda}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">K / D / A</span>
                                        <span className="stat-value">{battle.summary.mvp.kills} / {battle.summary.mvp.deaths} / {battle.summary.mvp.assists}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">데미지</span>
                                        <span className="stat-value">{battle.summary.mvp.damageDealt.toLocaleString()}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">골드</span>
                                        <span className="stat-value">{battle.summary.mvp.goldEarned.toLocaleString()}G</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 팀 통계 */}
                        <div className="team-stats-grid">
                            <div className="team-stat-card team1">
                                <h4>블루팀 통계</h4>
                                <div className="team-stats">
                                    <div className="stat-row">
                                        <span>킬</span>
                                        <span className="bold">{battle.summary.teamStats.team1.totalKills}</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>데스</span>
                                        <span className="bold">{battle.summary.teamStats.team1.totalDeaths}</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>어시스트</span>
                                        <span className="bold">{battle.summary.teamStats.team1.totalAssists}</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>총 데미지</span>
                                        <span className="bold">{battle.summary.teamStats.team1.totalDamage.toLocaleString()}</span>
                                    </div>
                                    <div className="stat-row score">
                                        <span>점수</span>
                                        <span className="bold">{battle.summary.teamStats.team1.score}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="team-stat-card team2">
                                <h4>레드팀 통계</h4>
                                <div className="team-stats">
                                    <div className="stat-row">
                                        <span>킬</span>
                                        <span className="bold">{battle.summary.teamStats.team2.totalKills}</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>데스</span>
                                        <span className="bold">{battle.summary.teamStats.team2.totalDeaths}</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>어시스트</span>
                                        <span className="bold">{battle.summary.teamStats.team2.totalAssists}</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>총 데미지</span>
                                        <span className="bold">{battle.summary.teamStats.team2.totalDamage.toLocaleString()}</span>
                                    </div>
                                    <div className="stat-row score">
                                        <span>점수</span>
                                        <span className="bold">{battle.summary.teamStats.team2.score}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 선수별 KDA */}
                        {(battle.team1KDA || battle.team2KDA) && (
                            <div className="player-kda-section">
                                <h4>선수별 KDA</h4>
                                <div className="kda-tables">
                                    {battle.team1KDA && (
                                        <div className="kda-table">
                                            <h5>블루팀</h5>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>선수</th>
                                                        <th>포지션</th>
                                                        <th>K</th>
                                                        <th>D</th>
                                                        <th>A</th>
                                                        <th>KDA</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(battle.team1KDA).map(([name, stats]) => (
                                                        <tr key={name}>
                                                            <td>{name}</td>
                                                            <td>{stats.position}</td>
                                                            <td>{stats.kills}</td>
                                                            <td>{stats.deaths}</td>
                                                            <td>{stats.assists}</td>
                                                            <td className="kda-value">
                                                                {stats.deaths === 0
                                                                    ? (stats.kills + stats.assists).toFixed(2)
                                                                    : ((stats.kills + stats.assists) / stats.deaths).toFixed(2)
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {battle.team2KDA && (
                                        <div className="kda-table">
                                            <h5>레드팀</h5>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>선수</th>
                                                        <th>포지션</th>
                                                        <th>K</th>
                                                        <th>D</th>
                                                        <th>A</th>
                                                        <th>KDA</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(battle.team2KDA).map(([name, stats]) => (
                                                        <tr key={name}>
                                                            <td>{name}</td>
                                                            <td>{stats.position}</td>
                                                            <td>{stats.kills}</td>
                                                            <td>{stats.deaths}</td>
                                                            <td>{stats.assists}</td>
                                                            <td className="kda-value">
                                                                {stats.deaths === 0
                                                                    ? (stats.kills + stats.assists).toFixed(2)
                                                                    : ((stats.kills + stats.assists) / stats.deaths).toFixed(2)
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="battle-log-section">
                    <h3>배틀 로그</h3>
                    <div className="battle-log">
                        <pre>{battle.battle_log}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BattleDetail;
