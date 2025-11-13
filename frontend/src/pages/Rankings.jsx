import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rankingAPI } from '../services/api';

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
            setRankings(rankingsRes.data);
            setMyRank(myRankRes.data);
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            setError(error.response?.data?.error || '데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px' }}>
                <nav>
                    <Link to="/dashboard">← 대시보드</Link>
                </nav>
                <p>로딩 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <nav>
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
        <div style={{ padding: '20px' }}>
            <nav>
                <Link to="/dashboard">← 대시보드</Link>
            </nav>
            <h1>랭킹</h1>

            {myRank && (
                <div style={{ backgroundColor: '#f0f0f0', padding: '15px', marginBottom: '20px' }}>
                    <h2>내 랭킹</h2>
                    <p>순위: #{myRank.rank}</p>
                    <p>티어: {myRank.tierDisplay}</p>
                    <p>티어 포인트: {myRank.tier_points} TP</p>
                    <p>전적: {myRank.wins}승 {myRank.losses}패 (승률 {myRank.winRate}%)</p>
                </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid gray', padding: '8px' }}>순위</th>
                        <th style={{ border: '1px solid gray', padding: '8px' }}>닉네임</th>
                        <th style={{ border: '1px solid gray', padding: '8px' }}>티어</th>
                        <th style={{ border: '1px solid gray', padding: '8px' }}>티어 포인트</th>
                        <th style={{ border: '1px solid gray', padding: '8px' }}>전적</th>
                        <th style={{ border: '1px solid gray', padding: '8px' }}>승률</th>
                    </tr>
                </thead>
                <tbody>
                    {rankings.map(user => (
                        <tr key={user.user_id} style={{ backgroundColor: user.user_id === myRank?.user_id ? '#ffffcc' : 'white' }}>
                            <td style={{ border: '1px solid gray', padding: '8px', textAlign: 'center' }}>
                                {user.rank}
                            </td>
                            <td style={{ border: '1px solid gray', padding: '8px' }}>
                                {user.username}
                            </td>
                            <td style={{ border: '1px solid gray', padding: '8px' }}>
                                {user.tierDisplay}
                            </td>
                            <td style={{ border: '1px solid gray', padding: '8px', textAlign: 'right' }}>
                                {user.tier_points} TP
                            </td>
                            <td style={{ border: '1px solid gray', padding: '8px' }}>
                                {user.wins}승 {user.losses}패
                            </td>
                            <td style={{ border: '1px solid gray', padding: '8px', textAlign: 'right' }}>
                                {user.winRate}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Rankings;
