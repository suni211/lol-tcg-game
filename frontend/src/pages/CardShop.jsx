import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cardAPI, authAPI } from '../services/api';
import './CardShop.css';

function CardShop({ token }) {
    const [userPoints, setUserPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purchaseResult, setPurchaseResult] = useState(null);
    const [isPurchasing, setIsPurchasing] = useState(false);

    // 카드 팩 정의
    const cardPacks = [
        {
            id: 'COMMON',
            name: '일반 팩',
            price: 100,
            color: '#808080',
            description: '일반 등급 중심 (희귀 10%)',
            rates: [
                { tier: 'COMMON', rate: 90, color: '#808080' },
                { tier: 'RARE', rate: 10, color: '#4169e1' }
            ]
        },
        {
            id: 'RARE',
            name: '희귀 팩',
            price: 300,
            color: '#4169e1',
            description: '희귀 등급 중심 (영웅 5%)',
            rates: [
                { tier: 'COMMON', rate: 60, color: '#808080' },
                { tier: 'RARE', rate: 35, color: '#4169e1' },
                { tier: 'EPIC', rate: 5, color: '#9400d3' }
            ]
        },
        {
            id: 'EPIC',
            name: '프리미엄 팩',
            price: 500,
            color: '#9400d3',
            description: '영웅 등급 중심 (전설 2%)',
            rates: [
                { tier: 'COMMON', rate: 40, color: '#808080' },
                { tier: 'RARE', rate: 40, color: '#4169e1' },
                { tier: 'EPIC', rate: 18, color: '#9400d3' },
                { tier: 'LEGENDARY', rate: 2, color: '#ff8c00' }
            ]
        }
    ];

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setError(null);
            const userRes = await authAPI.getMe();
            setUserPoints(userRes.data.points);
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            setError(error.response?.data?.error || '데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchasePack = async (packTier, price) => {
        if (userPoints < price) {
            alert('포인트가 부족합니다!');
            return;
        }

        if (isPurchasing) {
            return;
        }

        try {
            setIsPurchasing(true);
            setPurchaseResult(null);

            const result = await cardAPI.purchaseRandomPack(packTier);

            setPurchaseResult(result.data);
            setUserPoints(result.data.remainingPoints);

            // 3초 후 결과 창 자동 닫기
            setTimeout(() => {
                setPurchaseResult(null);
            }, 5000);

        } catch (error) {
            alert(error.response?.data?.error || '구매 실패');
        } finally {
            setIsPurchasing(false);
        }
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

    const getTierColor = (tier) => {
        const colors = {
            LEGENDARY: '#ff8c00',
            EPIC: '#9400d3',
            RARE: '#4169e1',
            COMMON: '#808080'
        };
        return colors[tier] || '#000';
    };

    if (loading) {
        return <div className="shop-container"><p>로딩 중...</p></div>;
    }

    return (
        <div className="shop-container">
            <nav className="shop-nav">
                <Link to="/dashboard">← 대시보드</Link>
                <h2>카드 상점</h2>
                <div className="points-display">보유 포인트: {userPoints}P</div>
            </nav>

            {error && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                    <p>{error}</p>
                    <button onClick={fetchUserData}>다시 시도</button>
                </div>
            )}

            <div className="shop-info">
                <h3>🎁 카드 팩 상점</h3>
                <p>카드 팩을 구매하여 랜덤 선수 카드를 획득하세요!</p>
            </div>

            <div className="packs-container">
                {cardPacks.map((pack) => (
                    <div key={pack.id} className="pack-card" style={{ borderColor: pack.color }}>
                        <div className="pack-header" style={{ backgroundColor: pack.color }}>
                            <h3>{pack.name}</h3>
                            <p className="pack-price">{pack.price}P</p>
                        </div>

                        <div className="pack-body">
                            <p className="pack-description">{pack.description}</p>

                            <div className="pack-rates">
                                <h4>확률</h4>
                                {pack.rates.map((rate) => (
                                    <div key={rate.tier} className="rate-item">
                                        <span className="rate-tier" style={{ color: rate.color }}>
                                            {getTierName(rate.tier)}
                                        </span>
                                        <span className="rate-percentage">{rate.rate}%</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="purchase-pack-btn"
                                onClick={() => handlePurchasePack(pack.id, pack.price)}
                                disabled={userPoints < pack.price || isPurchasing}
                                style={{ backgroundColor: pack.color }}
                            >
                                {isPurchasing ? '구매 중...' : '팩 구매'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 카드 획득 결과 모달 */}
            {purchaseResult && (
                <div className="result-modal-overlay" onClick={() => setPurchaseResult(null)}>
                    <div className="result-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="result-header">
                            <h2>🎉 카드 획득!</h2>
                        </div>

                        <div className="result-card" style={{ borderColor: getTierColor(purchaseResult.card.cardTier) }}>
                            <div className="result-card-tier" style={{ color: getTierColor(purchaseResult.card.cardTier) }}>
                                {getTierName(purchaseResult.card.cardTier)}
                            </div>
                            <div className="result-card-ovr">
                                {purchaseResult.card.overallRating} OVR
                            </div>
                            <div className="result-card-image">
                                <img
                                    src={purchaseResult.card.imageUrl}
                                    alt={purchaseResult.card.playerName}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <div className="result-card-name">
                                    {purchaseResult.card.playerName}
                                </div>
                            </div>
                            <div className="result-card-info">
                                <p>{purchaseResult.card.season} | {purchaseResult.card.team}</p>
                                <p>{purchaseResult.card.position}</p>

                                {/* 특성 표시 */}
                                {(purchaseResult.card.trait_1 || purchaseResult.card.trait_2 || purchaseResult.card.trait_3) && (
                                    <div className="card-traits">
                                        {purchaseResult.card.trait_1 && (
                                            <span className="trait-badge trait-primary">
                                                ⭐ {purchaseResult.card.trait_1}
                                            </span>
                                        )}
                                        {purchaseResult.card.trait_2 && (
                                            <span className="trait-badge trait-secondary">
                                                ✦ {purchaseResult.card.trait_2}
                                            </span>
                                        )}
                                        {purchaseResult.card.trait_3 && (
                                            <span className="trait-badge trait-tertiary">
                                                • {purchaseResult.card.trait_3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="result-footer">
                            <p>남은 포인트: {purchaseResult.remainingPoints}P</p>
                            <button onClick={() => setPurchaseResult(null)}>확인</button>
                            <Link to="/deck" className="goto-deck-btn">덱 관리 →</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CardShop;
