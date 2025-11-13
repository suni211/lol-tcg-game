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
