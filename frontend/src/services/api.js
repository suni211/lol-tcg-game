import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 토큰을 요청 헤더에 추가하는 인터셉터
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 에러 처리 인터셉터
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401 (인증 실패) 또는 403 (권한 없음) 에러 시 자동 로그아웃
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// 인증 API
export const authAPI = {
    register: (username, password) => api.post('/auth/register', { username, password }),
    login: (username, password) => api.post('/auth/login', { username, password }),
    getMe: () => api.get('/auth/me'),
};

// 카드 API
export const cardAPI = {
    getShop: (filters) => api.get('/cards/shop', { params: filters }),
    purchaseRandomPack: (packTier) => api.post('/cards/purchase', { packTier }),
    getMyCards: () => api.get('/cards/my-cards'),
    createDeck: (deckName) => api.post('/cards/decks', { deckName }),
    getDecks: () => api.get('/cards/decks'),
    getDeck: (deckId) => api.get(`/cards/decks/${deckId}`),
    deleteDeck: (deckId) => api.delete(`/cards/decks/${deckId}`),
    addCardToDeck: (deckId, userCardId, position) =>
        api.post(`/cards/decks/${deckId}/cards`, { userCardId, position }),
    removeCardFromDeck: (deckId, position) =>
        api.delete(`/cards/decks/${deckId}/cards/${position}`),
    activateDeck: (deckId) => api.post(`/cards/decks/${deckId}/activate`),
    getActiveDeck: () => api.get('/cards/decks/active/current'),
};

// 배틀 API
export const battleAPI = {
    getEnergy: () => api.get('/battle/energy'),
    joinQueue: (deckId) => api.post('/battle/queue/join', { deckId }),
    leaveQueue: () => api.post('/battle/queue/leave'),
    getQueueStatus: () => api.get('/battle/queue/status'),
    startBattle: (opponentId, deckId) => api.post('/battle/start', { opponentId, deckId }),
    getBattleHistory: (limit, offset) => api.get('/battle/history', { params: { limit, offset } }),
    getBattleDetail: (battleId) => api.get(`/battle/history/${battleId}`),
};

// 랭킹 API
export const rankingAPI = {
    getRankings: (limit, offset) => api.get('/ranking', { params: { limit, offset } }),
    getMyRank: () => api.get('/ranking/me'),
    getTierDistribution: () => api.get('/ranking/distribution'),
};

// 사용자 API
export const userAPI = {
    getProfile: () => api.get('/user/profile'),
};

export default api;
