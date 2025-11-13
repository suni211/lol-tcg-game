import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketAPI, authAPI, cardAPI } from '../services/api';
import './Market.css';

function Market({ token }) {
    const [activeTab, setActiveTab] = useState('buy'); // 'buy', 'sell', 'my'
    const [listings, setListings] = useState([]);
    const [myCards, setMyCards] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [userPoints, setUserPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        tier: '',
        position: '',
        team: ''
    });

    // 판매 등록 모달
    const [sellModal, setSellModal] = useState({ show: false, card: null, price: '' });
    // 구매 예약 모달
    const [bidModal, setBidModal] = useState({ show: false, card: null, price: '' });
    // 카드 상세 모달
    const [detailModal, setDetailModal] = useState({ show: false, card: null, overview: null });

    useEffect(() => {
        fetchData();
    }, [activeTab, filters]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 사용자 포인트 조회
            const userRes = await authAPI.getMe();
            setUserPoints(userRes.data.points);

            if (activeTab === 'buy') {
                // 시장 매물 조회
                const res = await marketAPI.getListings(filters);
                setListings(res.data.listings);
            } else if (activeTab === 'sell') {
                // 내 카드 조회
                const res = await cardAPI.getMyCards();
                setMyCards(res.data.cards);
            } else if (activeTab === 'my') {
                // 내 판매/구매 예약 조회
                const [listingsRes, bidsRes] = await Promise.all([
                    marketAPI.getMyListings(),
                    marketAPI.getMyBids()
                ]);
                setMyListings(listingsRes.data.listings);
                setMyBids(bidsRes.data.bids);
            }
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            alert(error.response?.data?.error || '데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
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

    const getTierName = (tier) => {
        const names = {
            LEGENDARY: '전설',
            EPIC: '영웅',
            RARE: '희귀',
            COMMON: '일반'
        };
        return names[tier] || tier;
    };

    // 즉시 구매
    const handleInstantBuy = async (listingId) => {
        if (!confirm('즉시 구매하시겠습니까?')) return;

        try {
            const res = await marketAPI.instantBuy(listingId);
            alert(`구매 성공! ${res.data.card.playerName} 카드를 획득했습니다.`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || '구매 실패');
        }
    };

    // 구매 예약
    const handleCreateBid = async () => {
        if (!bidModal.card || !bidModal.price) {
            alert('가격을 입력해주세요.');
            return;
        }

        try {
            await marketAPI.createBid(bidModal.card.card_id, parseInt(bidModal.price));
            alert('구매 예약이 등록되었습니다.');
            setBidModal({ show: false, card: null, price: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || '구매 예약 실패');
        }
    };

    // 판매 등록
    const handleCreateListing = async () => {
        if (!sellModal.card || !sellModal.price) {
            alert('가격을 입력해주세요.');
            return;
        }

        try {
            await marketAPI.createListing(sellModal.card.user_card_id, parseInt(sellModal.price));
            alert('판매 등록이 완료되었습니다.');
            setSellModal({ show: false, card: null, price: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || '판매 등록 실패');
        }
    };

    // 즉시 판매
    const handleInstantSell = async (userCardId) => {
        if (!confirm('가장 높은 구매 예약 가격에 즉시 판매하시겠습니까?')) return;

        try {
            const res = await marketAPI.instantSell(userCardId);
            alert(`판매 성공! ${res.data.price}P를 획득했습니다.`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || '판매 실패');
        }
    };

    // 판매 취소
    const handleCancelListing = async (listingId) => {
        if (!confirm('판매를 취소하시겠습니까?')) return;

        try {
            await marketAPI.cancelListing(listingId);
            alert('판매가 취소되었습니다.');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || '취소 실패');
        }
    };

    // 구매 예약 취소
    const handleCancelBid = async (bidId) => {
        if (!confirm('구매 예약을 취소하시겠습니까?')) return;

        try {
            await marketAPI.cancelBid(bidId);
            alert('구매 예약이 취소되었습니다.');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || '취소 실패');
        }
    };

    // 카드 상세 정보 조회
    const handleShowDetail = async (card) => {
        try {
            const res = await marketAPI.getCardPrice(card.card_id);
            setDetailModal({ show: true, card, overview: res.data });
        } catch (error) {
            alert('정보를 불러오는데 실패했습니다.');
        }
    };

    if (loading) {
        return <div className="market-container"><p>로딩 중...</p></div>;
    }

    return (
        <div className="market-container">
            <nav className="market-nav">
                <Link to="/dashboard">← 대시보드</Link>
                <h2>⚖️ 이적시장</h2>
                <div className="points-display">{userPoints}P</div>
            </nav>

            {/* 탭 메뉴 */}
            <div className="market-tabs">
                <button
                    className={activeTab === 'buy' ? 'active' : ''}
                    onClick={() => setActiveTab('buy')}
                >
                    💰 구매
                </button>
                <button
                    className={activeTab === 'sell' ? 'active' : ''}
                    onClick={() => setActiveTab('sell')}
                >
                    🏷️ 판매
                </button>
                <button
                    className={activeTab === 'my' ? 'active' : ''}
                    onClick={() => setActiveTab('my')}
                >
                    📋 내 거래
                </button>
            </div>

            {/* 구매 탭 */}
            {activeTab === 'buy' && (
                <div className="market-content">
                    <div className="market-filters">
                        <select value={filters.tier} onChange={(e) => setFilters({ ...filters, tier: e.target.value })}>
                            <option value="">모든 등급</option>
                            <option value="LEGENDARY">전설</option>
                            <option value="EPIC">영웅</option>
                            <option value="RARE">희귀</option>
                            <option value="COMMON">일반</option>
                        </select>
                        <select value={filters.position} onChange={(e) => setFilters({ ...filters, position: e.target.value })}>
                            <option value="">모든 포지션</option>
                            <option value="TOP">탑</option>
                            <option value="JUNGLE">정글</option>
                            <option value="MID">미드</option>
                            <option value="ADC">원딜</option>
                            <option value="SUPPORT">서포터</option>
                        </select>
                    </div>

                    <div className="listings-grid">
                        {listings.length === 0 ? (
                            <p className="no-data">판매 중인 카드가 없습니다.</p>
                        ) : (
                            listings.map((listing) => (
                                <div key={listing.listing_id} className="listing-card">
                                    <div className="card-tier" style={{ color: getTierColor(listing.card_tier) }}>
                                        {getTierName(listing.card_tier)}
                                    </div>
                                    <div className="card-ovr">{listing.overall_rating} OVR</div>
                                    <h3>{listing.player_name}</h3>
                                    <p>{listing.team} | {listing.position}</p>
                                    <div className="price-info">
                                        <div className="current-price">
                                            판매가: <strong>{listing.listing_price}P</strong>
                                        </div>
                                        <div className="market-price">
                                            시세: {listing.current_price}P ({listing.min_price}~{listing.max_price})
                                        </div>
                                    </div>
                                    <div className="card-actions">
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleInstantBuy(listing.listing_id)}
                                            disabled={userPoints < listing.listing_price}
                                        >
                                            즉시 구매
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => setBidModal({ show: true, card: listing, price: listing.current_price })}
                                        >
                                            구매 예약
                                        </button>
                                        <button
                                            className="btn-info"
                                            onClick={() => handleShowDetail(listing)}
                                        >
                                            상세
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* 판매 탭 */}
            {activeTab === 'sell' && (
                <div className="market-content">
                    <h3>판매 가능한 내 카드</h3>
                    <div className="listings-grid">
                        {myCards.length === 0 ? (
                            <p className="no-data">판매 가능한 카드가 없습니다.</p>
                        ) : (
                            myCards.map((card) => (
                                <div key={card.user_card_id} className="listing-card">
                                    <div className="card-tier" style={{ color: getTierColor(card.card_tier) }}>
                                        {getTierName(card.card_tier)}
                                    </div>
                                    <div className="card-ovr">{card.overall_rating} OVR</div>
                                    <h3>{card.player_name}</h3>
                                    <p>{card.team} | {card.position}</p>
                                    <div className="card-actions">
                                        <button
                                            className="btn-primary"
                                            onClick={() => setSellModal({ show: true, card, price: card.card_price })}
                                        >
                                            판매 등록
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => handleInstantSell(card.user_card_id)}
                                        >
                                            즉시 판매
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* 내 거래 탭 */}
            {activeTab === 'my' && (
                <div className="market-content">
                    <div className="my-transactions">
                        <div className="transaction-section">
                            <h3>내 판매 등록</h3>
                            {myListings.length === 0 ? (
                                <p className="no-data">판매 등록이 없습니다.</p>
                            ) : (
                                <table className="transaction-table">
                                    <thead>
                                        <tr>
                                            <th>선수</th>
                                            <th>팀</th>
                                            <th>등급</th>
                                            <th>판매가</th>
                                            <th>등록일</th>
                                            <th>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myListings.map((listing) => (
                                            <tr key={listing.listing_id}>
                                                <td>{listing.player_name}</td>
                                                <td>{listing.team}</td>
                                                <td style={{ color: getTierColor(listing.card_tier) }}>
                                                    {getTierName(listing.card_tier)}
                                                </td>
                                                <td>{listing.listing_price}P</td>
                                                <td>{new Date(listing.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn-cancel"
                                                        onClick={() => handleCancelListing(listing.listing_id)}
                                                    >
                                                        취소
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="transaction-section">
                            <h3>내 구매 예약</h3>
                            {myBids.length === 0 ? (
                                <p className="no-data">구매 예약이 없습니다.</p>
                            ) : (
                                <table className="transaction-table">
                                    <thead>
                                        <tr>
                                            <th>선수</th>
                                            <th>팀</th>
                                            <th>등급</th>
                                            <th>예약가</th>
                                            <th>예약일</th>
                                            <th>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myBids.map((bid) => (
                                            <tr key={bid.bid_id}>
                                                <td>{bid.player_name}</td>
                                                <td>{bid.team}</td>
                                                <td style={{ color: getTierColor(bid.card_tier) }}>
                                                    {getTierName(bid.card_tier)}
                                                </td>
                                                <td>{bid.bid_price}P</td>
                                                <td>{new Date(bid.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn-cancel"
                                                        onClick={() => handleCancelBid(bid.bid_id)}
                                                    >
                                                        취소
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 판매 등록 모달 */}
            {sellModal.show && (
                <div className="modal-overlay" onClick={() => setSellModal({ show: false, card: null, price: '' })}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>판매 등록</h3>
                        <div className="modal-body">
                            <p><strong>{sellModal.card?.player_name}</strong> 카드</p>
                            <p>기본 가격: {sellModal.card?.card_price}P</p>
                            <p className="price-range">
                                가격 범위: {sellModal.card?.card_price - 100}P ~ {sellModal.card?.card_price + 100}P
                            </p>
                            <input
                                type="number"
                                placeholder="판매 가격"
                                value={sellModal.price}
                                onChange={(e) => setSellModal({ ...sellModal, price: e.target.value })}
                                min={sellModal.card?.card_price - 100}
                                max={sellModal.card?.card_price + 100}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-primary" onClick={handleCreateListing}>등록</button>
                            <button className="btn-secondary" onClick={() => setSellModal({ show: false, card: null, price: '' })}>취소</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 구매 예약 모달 */}
            {bidModal.show && (
                <div className="modal-overlay" onClick={() => setBidModal({ show: false, card: null, price: '' })}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>구매 예약</h3>
                        <div className="modal-body">
                            <p><strong>{bidModal.card?.player_name}</strong> 카드</p>
                            <p>현재 시세: {bidModal.card?.current_price}P</p>
                            <p className="price-range">
                                가격 범위: {bidModal.card?.min_price}P ~ {bidModal.card?.max_price}P
                            </p>
                            <input
                                type="number"
                                placeholder="구매 희망 가격"
                                value={bidModal.price}
                                onChange={(e) => setBidModal({ ...bidModal, price: e.target.value })}
                                min={bidModal.card?.min_price}
                                max={bidModal.card?.max_price}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-primary" onClick={handleCreateBid}>예약</button>
                            <button className="btn-secondary" onClick={() => setBidModal({ show: false, card: null, price: '' })}>취소</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 카드 상세 모달 */}
            {detailModal.show && detailModal.overview && (
                <div className="modal-overlay" onClick={() => setDetailModal({ show: false, card: null, overview: null })}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <h3>{detailModal.card?.player_name} 시세 정보</h3>
                        <div className="modal-body">
                            <div className="price-detail">
                                <div className="price-item">
                                    <span>기본가:</span>
                                    <strong>{detailModal.overview.price.basePrice}P</strong>
                                </div>
                                <div className="price-item">
                                    <span>현재 시세:</span>
                                    <strong className="highlight">{detailModal.overview.price.currentPrice}P</strong>
                                </div>
                                <div className="price-item">
                                    <span>상한가:</span>
                                    <strong>{detailModal.overview.price.maxPrice}P</strong>
                                </div>
                                <div className="price-item">
                                    <span>하한가:</span>
                                    <strong>{detailModal.overview.price.minPrice}P</strong>
                                </div>
                            </div>

                            <div className="market-stats">
                                <div className="stat-section">
                                    <h4>판매 현황</h4>
                                    <p>등록 수: {detailModal.overview.listings.count}건</p>
                                    {detailModal.overview.listings.count > 0 && (
                                        <p>최저가: {detailModal.overview.listings.lowest}P</p>
                                    )}
                                </div>
                                <div className="stat-section">
                                    <h4>구매 예약</h4>
                                    <p>예약 수: {detailModal.overview.bids.count}건</p>
                                    {detailModal.overview.bids.count > 0 && (
                                        <p>최고가: {detailModal.overview.bids.highest}P</p>
                                    )}
                                </div>
                            </div>

                            {detailModal.overview.recentTransactions.length > 0 && (
                                <div className="recent-transactions">
                                    <h4>최근 거래</h4>
                                    <ul>
                                        {detailModal.overview.recentTransactions.map((tx, idx) => (
                                            <li key={idx}>
                                                {tx.transaction_price}P
                                                <span className="tx-date">
                                                    ({new Date(tx.created_at).toLocaleDateString()})
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setDetailModal({ show: false, card: null, overview: null })}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Market;
