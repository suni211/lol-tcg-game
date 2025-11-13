# LOL TCG Game

리그오브레전드 프로 선수 카드를 활용한 TCG(Trading Card Game) 웹게임입니다.

## 주요 기능

### 게임 시스템
- **카드 수집**: 30~95 오버롤 등급의 선수 카드 수집
  - COMMON (30-55 OVR): 100P
  - RARE (50-75 OVR): 300P
  - EPIC (70-95 OVR): 1000P
  - LEGENDARY (70-95 OVR): 1000P

- **배틀 시스템**
  - 5분마다 1회씩 자동 충전 (최대 10회)
  - 배틀 중에도 타이머 지속
  - 실시간 매치메이킹 시스템
  - 동일 티어 우선 매칭 (30초 후 상하 티어 매칭)

- **티어 시스템**
  - 브론즈(5단계) → 실버(5단계) → 골드(5단계) → 플래티넘(5단계) → 다이아(5단계) → 챌린저
  - 승리 시 +10 TP, 패배 시 -9 TP
  - 100 TP마다 티어 승급

- **팀 시너지**
  - 같은 팀/시즌 선수 5명 조합 시 시너지 보너스 발동
  - 시너지 보너스: 10-15% 능력치 상승

### 카드 시즌
- 25 LCK (T1, Gen.G, HLE, KT, DK 등)
- 25 LPL (BLG, JDG, WBG 등)
- 25 LTA
- 25 LCP
- 25 LEC

## 기술 스택

### 백엔드
- Node.js + Express
- MariaDB
- JWT 인증
- WebSocket (매칭 시스템)

### 프론트엔드
- React
- React Router
- Axios
- Vite

## 설치 및 실행

### 1. MariaDB 설정

```bash
# MariaDB 설치 및 실행
# database/schema.sql 파일 실행하여 데이터베이스 생성
mysql -u root -p < backend/database/schema.sql
```

### 2. 백엔드 설정

```bash
cd backend

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 데이터베이스 정보 입력

# 서버 실행
npm start
# 또는 개발 모드
npm run dev
```

### 3. 프론트엔드 설정

```bash
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

### 4. 접속

- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:5000

## 환경 변수 설정 (.env)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lol_tcg_game
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 카드
- `GET /api/cards/shop` - 카드 상점 목록
- `POST /api/cards/purchase` - 카드 구매
- `GET /api/cards/my-cards` - 내 카드 목록
- `GET /api/cards/decks` - 내 덱 목록
- `POST /api/cards/decks` - 덱 생성
- `POST /api/cards/decks/:deckId/cards` - 덱에 카드 추가
- `POST /api/cards/decks/:deckId/activate` - 덱 활성화

### 배틀
- `GET /api/battle/energy` - 배틀 에너지 조회
- `POST /api/battle/queue/join` - 매칭 큐 참가
- `POST /api/battle/queue/leave` - 매칭 큐 나가기
- `GET /api/battle/history` - 배틀 기록

### 랭킹
- `GET /api/ranking` - 전체 랭킹
- `GET /api/ranking/me` - 내 랭킹
- `GET /api/ranking/distribution` - 티어 분포

## 배틀 시스템 상세

### 배틀 알고리즘
1. **라인전 페이즈 (0-15분)**
   - 탑/미드/봇 라인별 능력치 비교
   - 솔로킬, CS 우위 등 시뮬레이션

2. **미드게임 (15-25분)**
   - 정글 컨트롤
   - 로밍 및 갱킹
   - 소규모 교전

3. **후반 팀파이트 (25-35분)**
   - 대규모 5vs5 팀파이트 3회
   - 팀파이트 능력치 기반 승패 결정

4. **오브젝트 싸움**
   - 드래곤, 전령, 바론 획득
   - 추가 점수 부여

### 승패 결정
각 페이즈에서 획득한 점수의 총합으로 승패 결정

## 게임 진행 가이드

1. **회원가입 및 로그인**
   - 초기 1000P, 배틀 에너지 10개 지급
   - 브론즈 5 티어에서 시작

2. **카드 구매**
   - 카드 상점에서 선수 카드 구매
   - 리그, 포지션, 등급별 필터링 가능

3. **덱 구성**
   - 5명의 선수로 덱 구성
   - 같은 팀/시즌 조합 시 시너지 보너스

4. **배틀 참가**
   - 배틀 에너지 1개 소모
   - 자동 매칭메이킹
   - 배틀 로그 확인 가능

5. **랭킹 상승**
   - 승리하여 티어 포인트 획득
   - 챌린저 달성을 목표로!

## 카드 이미지

카드 이미지는 `/frontend/public/images/cards/` 경로에 저장해주세요.
파일명 형식: `{선수명}_25.jpg` (예: `faker_25.jpg`)

이미지가 없을 경우 플레이스홀더가 표시됩니다.

## 개발 로드맵

- [ ] 실시간 배틀 애니메이션
- [ ] 카드 트레이딩 시스템
- [ ] 일일 퀘스트 및 보상
- [ ] 시즌 패스
- [ ] 친구 대전
- [ ] 토너먼트 모드
- [ ] 더 많은 리그 및 시즌 추가

## 라이선스

MIT License

## 기여

버그 리포트 및 기능 제안은 이슈로 등록해주세요.
