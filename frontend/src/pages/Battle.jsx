import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { battleAPI, cardAPI } from '../services/api';
import './Battle.css';

function Battle({ token }) {
    const [energy, setEnergy] = useState(null);
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [inQueue, setInQueue] = useState(false);
    const [queueStatus, setQueueStatus] = useState(null);
    const [battleHistory, setBattleHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [latestBattle, setLatestBattle] = useState(null);
    const [selectedBattle, setSelectedBattle] = useState(null);
    const [showBattleLog, setShowBattleLog] = useState(false);
    const queueCheckInterval = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        return () => {
            if (queueCheckInterval.current) {
                clearInterval(queueCheckInterval.current);
            }
        };
    }, []);

    useEffect(() => {
        if (inQueue) {
            // 큐에 있을 때 2초마다 상태 체크
            queueCheckInterval.current = setInterval(checkQueueStatus, 2000);
        } else {
            if (queueCheckInterval.current) {
                clearInterval(queueCheckInterval.current);
            }
        }

        return () => {
            if (queueCheckInterval.current) {
                clearInterval(queueCheckInterval.current);
            }
        };
    }, [inQueue]);

    const fetchData = async () => {
        try {
            setError(null);
            const [energyRes, decksRes, historyRes] = await Promise.all([
                battleAPI.getEnergy(),
                cardAPI.getDecks(),
                battleAPI.getBattleHistory(10, 0)
            ]);
            setEnergy(energyRes.data);
            setDecks(decksRes.data);
            setBattleHistory(historyRes.data);

            // 최신 배틀 확인
            if (historyRes.data.length > 0) {
                setLatestBattle(historyRes.data[0]);
            }
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            setError(error.response?.data?.error || '데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const checkQueueStatus = async () => {
        try {
            const status = await battleAPI.getQueueStatus();
            console.log('큐 상태:', status.data);

            if (status.data && status.data.userId) {
                setInQueue(true);
                setQueueStatus(status.data);
            } else {
                // 큐에 없으면 배틀이 완료된 것
                setInQueue(false);
                setQueueStatus(null);
                // 데이터 새로고침
                await fetchData();
            }
        } catch (error) {
            console.error('큐 상태 확인 실패:', error);
            setInQueue(false);
            setQueueStatus(null);
        }
    };

    const handleJoinQueue = async () => {
        if (!selectedDeck) {
            alert('덱을 선택해주세요');
            return;
        }

        const selectedDeckData = decks.find(d => d.deck_id === parseInt(selectedDeck));
        if (!selectedDeckData || selectedDeckData.cardCount !== 5) {
            alert('5명의 선수로 구성된 완전한 덱이 필요합니다');
            return;
        }

        if (energy?.currentEnergy < 1) {
            alert('배틀 에너지가 부족합니다');
            return;
        }

        try {
            await battleAPI.joinQueue(selectedDeck);
            setInQueue(true);
            alert('매칭 대기 중... 상대를 찾고 있습니다!');
        } catch (error) {
            alert(error.response?.data?.error || '큐 참가 실패');
        }
    };

    const handleLeaveQueue = async () => {
        try {
            await battleAPI.leaveQueue();
            setInQueue(false);
            setQueueStatus(null);
        } catch (error) {
            alert('큐 나가기 실패');
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

    if (loading) {
        return (
            <div className="battle-container">
                <nav className="battle-nav">
                    <Link to="/dashboard">← 대시보드</Link>
                </nav>
                <p>로딩 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="battle-container">
                <nav className="battle-nav">
                    <Link to="/dashboard">← 대시보드</Link>
                </nav>
                <div className="error-message">
                    <h2>오류 발생</h2>
                    <p>{error}</p>
                    <button onClick={fetchData}>다시 시도</button>
                </div>
            </div>
        );
    }

    return (
        <div className="battle-container">
            <nav className="battle-nav">
                <Link to="/dashboard">← 대시보드</Link>
                <h2>배틀</h2>
            </nav>

            <div className="battle-content">
                {/* 에너지 섹션 */}
                <div className="energy-section">
                    <h3>⚡ 배틀 에너지</h3>
                    <div className="energy-display">
                        <div className="energy-count">{energy?.currentEnergy || 0} / 10</div>
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

                {/* 덱 선택 섹션 */}
                <div className="deck-selection-section">
                    <h3>🎴 덱 선택</h3>
                    <select
                        value={selectedDeck || ''}
                        onChange={(e) => setSelectedDeck(e.target.value)}
                        disabled={inQueue}
                        className="deck-select"
                    >
                        <option value="">덱을 선택하세요</option>
                        {decks.map(deck => (
                            <option
                                key={deck.deck_id}
                                value={deck.deck_id}
                                disabled={deck.cardCount !== 5}
                            >
                                {deck.deck_name} ({deck.cardCount}/5)
                                {deck.is_active ? ' ✓ 활성' : ''}
                                {deck.cardCount !== 5 ? ' (불완전)' : ''}
                            </option>
                        ))}
                    </select>
                    {selectedDeck && decks.find(d => d.deck_id === parseInt(selectedDeck))?.cardCount !== 5 && (
                        <p className="warning-text">
                            ⚠ 선택한 덱이 불완전합니다. 5명의 선수가 필요합니다.
                        </p>
                    )}
                </div>

                {/* 매칭 섹션 */}
                <div className="matching-section">
                    {!inQueue ? (
                        <div className="queue-join">
                            <button
                                onClick={handleJoinQueue}
                                disabled={!selectedDeck || energy?.currentEnergy < 1}
                                className="match-start-btn"
                            >
                                🎮 매칭 시작
                            </button>
                            <p className="match-info">
                                • 동일 티어 우선 매칭<br />
                                • 30초 후 상하 티어 매칭<br />
                                • 매칭 성공 시 자동 배틀
                            </p>
                        </div>
                    ) : (
                        <div className="queue-waiting">
                            <div className="loading-spinner"></div>
                            <h3>매칭 대기 중...</h3>
                            <p className="wait-time">대기 시간: {queueStatus?.waitTime || 0}초</p>
                            <p className="queue-info">현재 대기: {queueStatus?.queueSize || 1}명</p>
                            {queueStatus?.allowCrossTier && (
                                <p className="cross-tier-notice">🔄 크로스 티어 매칭 활성화됨</p>
                            )}
                            <button onClick={handleLeaveQueue} className="cancel-btn">
                                매칭 취소
                            </button>
                        </div>
                    )}
                </div>

                {/* 최신 배틀 결과 */}
                {latestBattle && (
                    <div className="latest-battle">
                        <h3>📊 최근 배틀 결과</h3>
                        <div className="battle-result-card">
                            <div className="battle-players">
                                <span className="player">{latestBattle.player1_name}</span>
                                <span className="vs">VS</span>
                                <span className="player">{latestBattle.player2_name}</span>
                            </div>
                            <div className="battle-winner">
                                승자: <strong>{latestBattle.winner_name}</strong>
                            </div>
                            <div className="battle-tier-change">
                                티어 변동:
                                <span className={latestBattle.player1_tier_change > 0 ? 'positive' : 'negative'}>
                                    {latestBattle.player1_tier_change > 0 ? '+' : ''}{latestBattle.player1_tier_change} TP
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 배틀 히스토리 */}
                <div className="battle-history-section">
                    <h3>📜 배틀 히스토리</h3>
                    <div className="battle-history-list">
                        {battleHistory.length === 0 ? (
                            <p className="no-history">배틀 기록이 없습니다</p>
                        ) : (
                            battleHistory.map(battle => (
                                <div
                                    key={battle.battle_id}
                                    className="battle-history-item"
                                    onClick={() => {
                                        setSelectedBattle(battle);
                                        setShowBattleLog(true);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="battle-date">
                                        {new Date(battle.started_at).toLocaleString('ko-KR')}
                                    </div>
                                    <div className="battle-match">
                                        <span className="player-name">{battle.player1_name}</span>
                                        <span className="vs-small">vs</span>
                                        <span className="player-name">{battle.player2_name}</span>
                                    </div>
                                    <div className="battle-outcome">
                                        <span className="winner">승: {battle.winner_name}</span>
                                        <span className={`tier-change ${battle.player1_tier_change > 0 ? 'positive' : 'negative'}`}>
                                            {battle.player1_tier_change > 0 ? '+' : ''}{battle.player1_tier_change} TP
                                        </span>
                                    </div>
                                    <div className="view-log-hint">클릭하여 상세 보기 →</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 배틀 로그 모달 */}
            {showBattleLog && selectedBattle && (
                <div className="battle-log-modal-overlay" onClick={() => setShowBattleLog(false)}>
                    <div className="battle-log-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>⚔️ 배틀 상세 로그</h2>
                            <button onClick={() => setShowBattleLog(false)} className="close-btn">✕</button>
                        </div>

                        <div className="modal-battle-info">
                            <div className="modal-players">
                                <div className="modal-player">
                                    <h3>{selectedBattle.player1_name}</h3>
                                    <span className={selectedBattle.winner_name === selectedBattle.player1_name ? 'winner-badge' : 'loser-badge'}>
                                        {selectedBattle.winner_name === selectedBattle.player1_name ? '승리' : '패배'}
                                    </span>
                                </div>
                                <div className="vs-large">VS</div>
                                <div className="modal-player">
                                    <h3>{selectedBattle.player2_name}</h3>
                                    <span className={selectedBattle.winner_name === selectedBattle.player2_name ? 'winner-badge' : 'loser-badge'}>
                                        {selectedBattle.winner_name === selectedBattle.player2_name ? '승리' : '패배'}
                                    </span>
                                </div>
                            </div>
                            <div className="modal-tier-changes">
                                <div>
                                    <span className={selectedBattle.player1_tier_change > 0 ? 'positive' : 'negative'}>
                                        {selectedBattle.player1_tier_change > 0 ? '+' : ''}{selectedBattle.player1_tier_change} TP
                                    </span>
                                </div>
                                <div>
                                    <span className={selectedBattle.player2_tier_change > 0 ? 'positive' : 'negative'}>
                                        {selectedBattle.player2_tier_change > 0 ? '+' : ''}{selectedBattle.player2_tier_change} TP
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="battle-log-content">
                            <h3>배틀 진행 상황</h3>
                            <pre className="log-text">{selectedBattle.battle_log}</pre>
                        </div>

                        <div className="modal-footer">
                            <button onClick={() => setShowBattleLog(false)} className="close-modal-btn">
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Battle;
