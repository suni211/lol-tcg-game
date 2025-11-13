# LOL TCG 게임 - 완성 가이드

## 프로젝트 개요

리그오브레전드 프로 선수 카드를 활용한 풀스택 TCG 웹게임입니다.

### 기술 스택
- **백엔드**: Node.js, Express, MariaDB
- **프론트엔드**: React, Vite, React Router
- **인증**: JWT
- **실시간**: WebSocket (매칭 시스템)

## 완성된 기능 목록

### ✅ 백엔드 (100% 완성)

1. **사용자 시스템**
   - JWT 기반 회원가입/로그인
   - 사용자 프로필 관리
   - 티어 및 포인트 시스템

2. **카드 시스템**
   - 100+ 선수 카드 (LCK, LPL, LEC, LTA)
   - 4등급 시스템 (COMMON, RARE, EPIC, LEGENDARY)
   - 카드 구매 및 소유 관리
   - 덱 생성 및 관리 (5명 구성)
   - 팀 시너지 시스템 (10-15% 보너스)

3. **배틀 시스템**
   - 배틀 에너지 시스템 (5분마다 1 충전, 최대 10)
   - 배틀 중에도 지속적인 타이머 작동
   - 실시간 매치메이킹 (동일 티어 우선, 30초 후 크로스 티어)
   - 상세한 배틀 알고리즘:
     - 라인전 페이즈 (0-15분)
     - 미드게임 (15-25분)
     - 후반 팀파이트 (25-35분)
     - 오브젝트 싸움 (드래곤, 전령, 바론)
   - 배틀 로그 기록

4. **티어 & 랭킹 시스템**
   - 브론즈 5 ~ 챌린저 (26단계)
   - 승리 +10 TP, 패배 -9 TP
   - 100 TP마다 티어 승급
   - 전체 랭킹 시스템
   - 티어별 분포 통계

### ✅ 프론트엔드 (100% 완성)

1. **인증 페이지**
   - 세련된 로그인/회원가입 UI
   - 반응형 디자인
   - 에러 처리

2. **대시보드**
   - 사용자 정보 표시
   - 배틀 에너지 게이지
   - 실시간 에너지 충전 타이머
   - 내 랭킹 및 통계
   - 빠른 액션 버튼

3. **카드 상점**
   - 그리드 레이아웃 카드 디스플레이
   - 리그/포지션/등급 필터
   - 등급별 색상 구분
   - 포인트 잔액 표시
   - 즉시 구매 기능

4. **덱 빌더** (완전 개선됨)
   - 3컬럼 레이아웃 (덱 목록 | 작업공간 | 내 카드)
   - 5개 포지션 슬롯 (TOP, JUNGLE, MID, ADC, SUPPORT)
   - 시너지 실시간 표시
   - 드래그 앤 드롭 스타일 UI
   - 포지션별 카드 필터
   - 덱 활성화 기능
   - 카드 제거 기능

5. **배틀 시스템**
   - 실시간 매칭 큐
   - 에너지 표시 및 타이머
   - 배틀 히스토리
   - 상세 배틀 결과 페이지

6. **랭킹 페이지**
   - Top 100 랭킹
   - 내 랭킹 하이라이트
   - 승률 통계
   - 티어 표시

### ✅ 데이터베이스 (100% 완성)

**선수 카드 데이터 (100+ 카드)**

- **LCK 2025**: T1, Gen.G, HLE, KT, DK, DRX, NS, BRO, KDF, LSB
- **LPL 2025**: BLG, JDG, WBG, TES, LNG, IG, EDG
- **LEC 2025**: G2, FNC, MAD
- **LTA 2025**: C9, TL

**팀 시너지 (14개 팀)**
- LCK 8팀, LPL 7팀, LEC 3팀, LTA 2팀

## 설치 및 실행

### 1. MariaDB 설정
```bash
# 데이터베이스 생성
mysql -u root -p lol_tcg_game < backend/database/schema.sql

# 추가 선수 데이터 삽입
mysql -u root -p lol_tcg_game < backend/database/players_data.sql
```

### 2. 백엔드 실행
```bash
cd backend
npm install
cp .env.example .env
# .env 파일 수정 (DB 정보 입력)
npm start
```

### 3. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

### 4. 접속
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:5000

## 게임 플레이 가이드

### 1. 시작하기
1. 회원가입 (자동으로 1000P, 10 에너지 지급)
2. 브론즈 5 티어에서 시작

### 2. 카드 수집
1. 카드 상점 방문
2. 1000P로 LEGENDARY 카드 5장 또는 다양한 등급 구매
3. 리그, 포지션, 등급별 필터 활용

### 3. 덱 구성
1. 덱 관리 페이지에서 "새 덱 만들기"
2. 생성한 덱 선택
3. 내 카드에서 5명의 선수 선택
4. 포지션별로 배치 (TOP-JUNGLE-MID-ADC-SUPPORT)
5. **같은 팀 선수 5명을 모으면 시너지 보너스!**
6. 덱 활성화

### 4. 배틀 참가
1. 배틀 메뉴에서 덱 선택
2. "매칭 시작" 클릭
3. 동일 티어 우선 매칭 (30초 후 크로스 티어)
4. 자동 배틀 진행
5. 결과 확인 및 티어 포인트 획득

### 5. 랭킹 상승
1. 승리하여 티어 포인트 획득 (+10 TP)
2. 100 TP마다 티어 승급
3. 챌린저를 목표로!

## 주요 시스템 상세

### 배틀 에너지 시스템
- **충전**: 5분마다 자동으로 1 에너지 충전
- **최대**: 10 에너지
- **사용**: 배틀 1회당 1 에너지 소모
- **특징**: 배틀 중에도 타이머 작동

### 매치메이킹 시스템
1. 동일 티어 우선 매칭 (0-30초)
2. 30초 후에도 매칭 안되면 상하 티어 매칭
3. 실시간 큐 상태 표시

### 티어 시스템
```
브론즈 5-1 (0-500 TP)
실버 5-1 (500-1000 TP)
골드 5-1 (1000-1500 TP)
플래티넘 5-1 (1500-2000 TP)
다이아 5-1 (2000-2500 TP)
챌린저 (2500+ TP)
```

### 시너지 시스템
같은 팀/시즌 선수 5명 조합 시:
- **일반 시너지**: +10%
- **강화 시너지**: +12-15% (주요 팀)

**시너지 발동 팀 예시:**
- T1 2025 (Zeus, Oner, Faker, Gumayusi, Keria): +15%
- Gen.G 2025 (Kiin, Canyon, Chovy, Peyz, Lehends): +15%
- BLG 2025 (Bin, Xun, Knight, Elk, ON): +15%

## 카드 등급 시스템

| 등급 | 오버롤 범위 | 가격 | 설명 |
|------|------------|------|------|
| COMMON | 30-55 | 100P | 기본 카드 |
| RARE | 50-75 | 300P | 준수한 선수 |
| EPIC | 70-95 | 1000P | 우수한 선수 |
| LEGENDARY | 70-95 | 1000P | 최고의 선수 |

## API 엔드포인트

### 인증
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### 카드
- GET /api/cards/shop (필터 쿼리 지원)
- POST /api/cards/purchase
- GET /api/cards/my-cards
- GET /api/cards/decks
- POST /api/cards/decks (덱 생성)
- GET /api/cards/decks/:deckId (덱 상세)
- POST /api/cards/decks/:deckId/cards (카드 추가)
- DELETE /api/cards/decks/:deckId/cards/:position (카드 제거)
- POST /api/cards/decks/:deckId/activate (덱 활성화)

### 배틀
- GET /api/battle/energy
- POST /api/battle/queue/join
- POST /api/battle/queue/leave
- GET /api/battle/queue/status
- POST /api/battle/start
- GET /api/battle/history
- GET /api/battle/history/:battleId

### 랭킹
- GET /api/ranking
- GET /api/ranking/me
- GET /api/ranking/distribution

## 프로젝트 구조

```
lol-tcg-game/
├── backend/
│   ├── server.js                      # 메인 서버
│   ├── config/
│   │   └── database.js                # DB 설정
│   ├── routes/
│   │   ├── auth.js                    # 인증 라우트
│   │   ├── cards.js                   # 카드 라우트
│   │   ├── battle.js                  # 배틀 라우트
│   │   └── ranking.js                 # 랭킹 라우트
│   ├── services/
│   │   ├── battleEngine.js            # 배틀 알고리즘
│   │   ├── energySystem.js            # 에너지 시스템
│   │   ├── matchmakingSystem.js       # 매칭 시스템
│   │   ├── tierSystem.js              # 티어 시스템
│   │   └── cardSystem.js              # 카드 시스템
│   └── database/
│       ├── schema.sql                 # 기본 스키마
│       └── players_data.sql           # 추가 선수 데이터
│
└── frontend/
    ├── src/
    │   ├── App.jsx                    # 메인 앱
    │   ├── App.css                    # 전역 스타일
    │   ├── services/
    │   │   └── api.js                 # API 클라이언트
    │   └── pages/
    │       ├── Login.jsx              # 로그인
    │       ├── Register.jsx           # 회원가입
    │       ├── Dashboard.jsx          # 대시보드
    │       ├── CardShop.jsx           # 카드 상점
    │       ├── DeckBuilder.jsx        # 덱 빌더 (개선됨)
    │       ├── Battle.jsx             # 배틀
    │       ├── BattleDetail.jsx       # 배틀 상세
    │       ├── Rankings.jsx           # 랭킹
    │       └── *.css                  # 각 페이지 스타일
    └── package.json
```

## 완성도 체크리스트

### 백엔드
- [x] 사용자 인증 시스템
- [x] 카드 시스템 (100+ 카드)
- [x] 덱 시스템
- [x] 팀 시너지 시스템
- [x] 배틀 에너지 시스템 (5분 충전)
- [x] 배틀 중 타이머 작동
- [x] 매치메이킹 시스템 (동일/크로스 티어)
- [x] 배틀 알고리즘 (4단계)
- [x] 티어 시스템 (브론즈~챌린저)
- [x] 랭킹 시스템
- [x] 배틀 로그

### 프론트엔드
- [x] 로그인/회원가입 UI
- [x] 대시보드 (완성)
- [x] 카드 상점 (필터링, 구매)
- [x] 덱 빌더 (3컬럼, 시너지 표시)
- [x] 배틀 시스템 (큐, 히스토리)
- [x] 배틀 상세 결과
- [x] 랭킹 페이지
- [x] 반응형 디자인
- [x] 애니메이션 효과

### 데이터
- [x] LCK 선수 (50+ 카드)
- [x] LPL 선수 (35+ 카드)
- [x] LEC 선수 (15+ 카드)
- [x] LTA 선수 (10+ 카드)
- [x] 팀 시너지 (14개 팀)

## 추가 개선 아이디어

### 단기
- [ ] 카드 이미지 추가
- [ ] 프로필 페이지
- [ ] 배틀 리플레이
- [ ] 친구 시스템

### 중기
- [ ] 카드 트레이딩
- [ ] 일일 퀘스트
- [ ] 시즌 패스
- [ ] 토너먼트 모드

### 장기
- [ ] 모바일 앱
- [ ] 실시간 채팅
- [ ] 길드 시스템
- [ ] e스포츠 토너먼트

## 문의 및 지원

- GitHub Issues: 버그 리포트 및 기능 제안
- README.md: 기본 가이드
- SETUP_GUIDE.md: 상세 설치 가이드

## 라이선스

MIT License

---

**게임을 즐겨주세요!** 🎮
