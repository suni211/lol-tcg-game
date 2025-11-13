import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cardAPI } from '../services/api';
import './DeckBuilder.css';

function DeckBuilder({ token }) {
    const [decks, setDecks] = useState([]);
    const [myCards, setMyCards] = useState([]);
    const [selectedDeckId, setSelectedDeckId] = useState(null);
    const [deckDetails, setDeckDetails] = useState(null);
    const [filterPosition, setFilterPosition] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedDeckId) {
            fetchDeckDetails(selectedDeckId);
        } else {
            setDeckDetails(null);
        }
    }, [selectedDeckId]);

    const fetchData = async () => {
        try {
            setError(null);
            const [decksRes, cardsRes] = await Promise.all([
                cardAPI.getDecks(),
                cardAPI.getMyCards()
            ]);
            setDecks(decksRes.data);
            setMyCards(cardsRes.data);
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            setError(error.response?.data?.error || '데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDeckDetails = async (deckId) => {
        try {
            const res = await cardAPI.getDeck(deckId);
            setDeckDetails(res.data);
        } catch (error) {
            console.error('덱 상세 로딩 실패:', error);
            setError('덱 상세 정보를 불러오는데 실패했습니다.');
        }
    };

    const handleCreateDeck = async () => {
        const name = prompt('덱 이름을 입력하세요:');
        if (name) {
            try {
                await cardAPI.createDeck(name);
                fetchData();
                alert('덱이 생성되었습니다!');
            } catch (error) {
                alert('덱 생성 실패');
            }
        }
    };

    const handleAddCard = async (userCardId, position) => {
        if (!selectedDeckId) {
            alert('덱을 먼저 선택해주세요');
            return;
        }

        try {
            await cardAPI.addCardToDeck(selectedDeckId, userCardId, position);
            alert('카드가 추가되었습니다');
            // 덱 상세 정보 다시 가져오기
            await fetchDeckDetails(selectedDeckId);
            // 덱 목록도 업데이트 (카드 카운트 갱신)
            await fetchData();
        } catch (error) {
            console.error('카드 추가 오류:', error);
            alert(error.response?.data?.error || '카드 추가 실패');
        }
    };

    const handleRemoveCard = async (position) => {
        if (!selectedDeckId) return;

        if (window.confirm('이 카드를 덱에서 제거하시겠습니까?')) {
            try {
                await cardAPI.removeCardFromDeck(selectedDeckId, position);
                alert('카드가 제거되었습니다');
                // 덱 상세 정보 다시 가져오기
                await fetchDeckDetails(selectedDeckId);
                // 덱 목록도 업데이트 (카드 카운트 갱신)
                await fetchData();
            } catch (error) {
                console.error('카드 제거 오류:', error);
                alert('카드 제거 실패');
            }
        }
    };

    const handleActivateDeck = async () => {
        if (!selectedDeckId) return;

        if (deckDetails?.cards?.length !== 5) {
            alert('덱에 5명의 선수가 필요합니다');
            return;
        }

        try {
            await cardAPI.activateDeck(selectedDeckId);
            alert('덱이 활성화되었습니다!');
            await fetchData();
        } catch (error) {
            alert(error.response?.data?.error || '덱 활성화 실패');
        }
    };

    const handleDeleteDeck = async () => {
        if (!selectedDeckId) return;

        const deck = decks.find(d => d.deck_id === selectedDeckId);

        if (deck?.is_active) {
            alert('활성화된 덱은 삭제할 수 없습니다. 먼저 다른 덱을 활성화하세요.');
            return;
        }

        if (!window.confirm(`"${deck?.deck_name}" 덱을 정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`)) {
            return;
        }

        try {
            await cardAPI.deleteDeck(selectedDeckId);
            alert('덱이 삭제되었습니다');
            setSelectedDeckId(null);
            setDeckDetails(null);
            await fetchData();
        } catch (error) {
            console.error('덱 삭제 오류:', error);
            alert(error.response?.data?.error || '덱 삭제 실패');
        }
    };

    const getTierColor = (tier) => {
        const colors = {
            LEGENDARY: '#ff8c00',
            EPIC: '#9400d3',
            RARE: '#4169e1',
            COMMON: '#808080'
        };
        return colors[tier] || '#000';
    };

    const filteredCards = filterPosition
        ? myCards.filter(card => card.position === filterPosition)
        : myCards;

    const positionNames = { 1: 'TOP', 2: 'JUNGLE', 3: 'MID', 4: 'ADC', 5: 'SUPPORT' };

    if (loading) {
        return (
            <div className="deckbuilder-container">
                <nav className="deckbuilder-nav">
                    <Link to="/dashboard">← 대시보드</Link>
                </nav>
                <p>로딩 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="deckbuilder-container">
                <nav className="deckbuilder-nav">
                    <Link to="/dashboard">← 대시보드</Link>
                </nav>
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <h2>오류 발생</h2>
                    <p>{error}</p>
                    <button onClick={fetchData}>다시 시도</button>
                </div>
            </div>
        );
    }

    return (
        <div className="deckbuilder-container">
            <nav className="deckbuilder-nav">
                <Link to="/dashboard">← 대시보드</Link>
                <h2>덱 관리</h2>
                <button onClick={handleCreateDeck} className="create-deck-btn">새 덱 만들기</button>
            </nav>

            <div className="deckbuilder-content">
                <div className="decks-sidebar">
                    <h3>내 덱 목록</h3>
                    <div className="decks-list">
                        {decks.map(deck => (
                            <div
                                key={deck.deck_id}
                                onClick={() => setSelectedDeckId(deck.deck_id)}
                                className={`deck-item ${selectedDeckId === deck.deck_id ? 'selected' : ''}`}
                            >
                                <h4>{deck.deck_name}</h4>
                                <div className="deck-info">
                                    <span className="card-count">카드: {deck.cardCount}/5</span>
                                    {deck.is_active && <span className="active-badge">활성</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="deck-workspace">
                    {selectedDeckId ? (
                        <>
                            <div className="deck-header">
                                <h3>{decks.find(d => d.deck_id === selectedDeckId)?.deck_name || '덱'}</h3>
                                <div className="deck-actions">
                                    <button
                                        onClick={handleActivateDeck}
                                        disabled={deckDetails?.cards?.length !== 5}
                                        className="activate-btn"
                                    >
                                        덱 활성화
                                    </button>
                                    <button
                                        onClick={handleDeleteDeck}
                                        disabled={decks.find(d => d.deck_id === selectedDeckId)?.is_active}
                                        className="delete-btn"
                                        style={{ marginLeft: '10px' }}
                                    >
                                        덱 삭제
                                    </button>
                                </div>
                            </div>

                            {deckDetails?.synergy?.hasSynergy && (
                                <div className="synergy-alert">
                                    시너지 발동! {deckDetails.synergy.description} (+{deckDetails.synergy.bonus}%)
                                </div>
                            )}

                            <div className="deck-slots">
                                {deckDetails ? (
                                    [1, 2, 3, 4, 5].map(position => {
                                        // deck_position으로 비교 (backend에서 deck_position으로 반환됨)
                                        const card = deckDetails?.cards?.find(c => {
                                            return parseInt(c.deck_position) === position;
                                        });

                                        return (
                                            <div key={position} className="deck-slot">
                                                <div className="slot-header">
                                                    <span className="position-label">{positionNames[position]}</span>
                                                </div>
                                                {card ? (
                                                    <div className="slot-card">
                                                        <div className="card-mini" style={{ borderColor: getTierColor(card.card_tier) }}>
                                                            <span className="card-tier-mini" style={{ color: getTierColor(card.card_tier) }}>
                                                                {card.card_tier}
                                                            </span>
                                                            <h4>{card.player_name}</h4>
                                                            <p className="ovr">{card.overall_rating} OVR</p>
                                                            <p className="team-info">{card.team} | {card.season}</p>
                                                            <button
                                                                onClick={() => handleRemoveCard(position)}
                                                                className="remove-btn"
                                                            >
                                                                제거
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="slot-empty">
                                                        <p>빈 슬롯</p>
                                                        <p className="slot-hint">아래에서 카드 선택</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>덱 정보를 불러오는 중...</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="no-deck-selected">
                            <p>좌측에서 덱을 선택하거나 새 덱을 만들어주세요</p>
                        </div>
                    )}
                </div>

                <div className="cards-panel">
                    <div className="cards-header">
                        <h3>내 카드</h3>
                        <select
                            value={filterPosition}
                            onChange={(e) => setFilterPosition(e.target.value)}
                            className="position-filter"
                        >
                            <option value="">전체 포지션</option>
                            <option value="TOP">TOP</option>
                            <option value="JUNGLE">JUNGLE</option>
                            <option value="MID">MID</option>
                            <option value="ADC">ADC</option>
                            <option value="SUPPORT">SUPPORT</option>
                        </select>
                    </div>
                    <div className="cards-grid-small">
                        {filteredCards.map(card => (
                            <div key={card.user_card_id} className="card-small" style={{ borderColor: getTierColor(card.card_tier) }}>
                                <span className="card-tier-badge" style={{ backgroundColor: getTierColor(card.card_tier) }}>
                                    {card.card_tier}
                                </span>
                                <h4>{card.player_name}</h4>
                                <p className="ovr-large">{card.overall_rating}</p>
                                <p className="position-badge">{card.position}</p>
                                <p className="team-season">{card.team}</p>
                                {selectedDeckId && (
                                    <button
                                        onClick={() => {
                                            const posMap = { TOP: 1, JUNGLE: 2, MID: 3, ADC: 4, SUPPORT: 5 };
                                            const defaultPos = posMap[card.position] || 1;
                                            const pos = prompt(`포지션 (1-5, 기본: ${defaultPos} - ${card.position}):`, defaultPos);
                                            if (pos) handleAddCard(card.user_card_id, parseInt(pos));
                                        }}
                                        className="add-to-deck-btn"
                                    >
                                        덱에 추가
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeckBuilder;
