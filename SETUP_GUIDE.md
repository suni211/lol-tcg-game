# LOL TCG 게임 설치 가이드

## 1. 사전 준비사항

### 필수 프로그램 설치
1. **Node.js** (v16 이상)
   - https://nodejs.org/ 에서 다운로드
   - 설치 후 확인: `node --version`

2. **MariaDB** (v10.5 이상)
   - Windows: https://mariadb.org/download/
   - 설치 시 root 비밀번호 설정

3. **Git** (선택사항)
   - https://git-scm.com/

## 2. 데이터베이스 설정

### 2.1 MariaDB 접속
```bash
mysql -u root -p
# 비밀번호 입력
```

### 2.2 데이터베이스 생성
```sql
CREATE DATABASE lol_tcg_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 2.3 스키마 생성
```bash
cd lol-tcg-game/backend
mysql -u root -p lol_tcg_game < database/schema.sql
```

## 3. 백엔드 설정

### 3.1 디렉토리 이동
```bash
cd backend
```

### 3.2 의존성 설치
```bash
npm install
```

### 3.3 환경 변수 설정
`.env.example` 파일을 `.env`로 복사하고 수정:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

`.env` 파일 내용 수정:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=여기에_마리아DB_비밀번호_입력
DB_NAME=lol_tcg_game
DB_PORT=3306

JWT_SECRET=랜덤한_긴_문자열_입력
PORT=5000
```

### 3.4 서버 실행
```bash
# 일반 실행
npm start

# 개발 모드 (자동 재시작)
npm run dev
```

서버가 정상 실행되면:
```
=================================
LOL TCG Game Server
Server running on port 5000
Environment: development
=================================
에너지 충전 시스템이 시작되었습니다.
```

## 4. 프론트엔드 설정

### 4.1 새 터미널 열기
백엔드 서버는 실행 상태로 두고 새 터미널을 엽니다.

### 4.2 디렉토리 이동
```bash
cd frontend
```

### 4.3 의존성 설치
```bash
npm install
```

### 4.4 개발 서버 실행
```bash
npm run dev
```

프론트엔드가 정상 실행되면:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## 5. 접속 및 테스트

### 5.1 웹 브라우저로 접속
http://localhost:5173

### 5.2 회원가입
1. "회원가입" 버튼 클릭
2. 아이디, 비밀번호 입력
3. 회원가입 완료

### 5.3 로그인
1. 가입한 아이디/비밀번호로 로그인
2. 대시보드 화면 확인

### 5.4 초기 상태 확인
- 티어: 브론즈 5
- 티어 포인트: 0 TP
- 포인트: 1000P
- 배틀 에너지: 10/10

## 6. 게임 플레이

### 6.1 카드 구매
1. 좌측 메뉴에서 "카드 상점" 클릭
2. 원하는 카드 선택 후 구매
3. 1000P로 전설 등급 카드 5장 구매 가능

### 6.2 덱 구성
1. "덱 관리" 클릭
2. "새 덱 만들기" 버튼 클릭
3. 생성한 덱 선택
4. 구매한 카드를 포지션 1~5에 배치
5. 같은 팀 선수 5명을 모으면 시너지 보너스!

### 6.3 배틀 시작
1. "배틀" 메뉴 클릭
2. 사용할 덱 선택
3. "매칭 시작" 버튼 클릭
4. 상대가 매칭될 때까지 대기
5. 배틀 결과 확인

## 7. 문제 해결

### 데이터베이스 연결 오류
```
Error: connect ECONNREFUSED
```
- MariaDB가 실행 중인지 확인
- `.env` 파일의 DB 정보가 정확한지 확인
- 방화벽 설정 확인

### 포트 충돌
```
Port 5000 is already in use
```
- 다른 프로그램이 5000 포트를 사용 중
- `.env` 파일에서 PORT 변경

### 프론트엔드 연결 오류
```
Network Error
```
- 백엔드 서버가 실행 중인지 확인
- `frontend/src/services/api.js`의 API_URL 확인

### npm install 오류
- Node.js 버전 확인: `node --version`
- npm 캐시 삭제: `npm cache clean --force`
- node_modules 삭제 후 재설치

## 8. 추가 설정 (선택사항)

### 카드 이미지 추가
1. `frontend/public/images/cards/` 폴더 생성
2. 선수 이미지 파일 추가 (예: `faker_25.jpg`)

### 더미 계정 생성 (테스트용)
테스트를 위해 여러 계정을 만들어 매칭을 테스트할 수 있습니다.

### 프로덕션 빌드
```bash
# 프론트엔드 빌드
cd frontend
npm run build

# 백엔드 프로덕션 실행
cd ../backend
NODE_ENV=production npm start
```

## 9. 개발 팁

### 핫 리로드
- 백엔드: nodemon으로 코드 변경 시 자동 재시작
- 프론트엔드: Vite가 자동으로 핫 리로드

### 디버깅
- 브라우저 개발자 도구 (F12) 활용
- 백엔드 로그 확인
- Network 탭에서 API 요청/응답 확인

### 데이터베이스 확인
```bash
mysql -u root -p lol_tcg_game

# 테이블 확인
SHOW TABLES;

# 사용자 확인
SELECT * FROM users;

# 카드 확인
SELECT * FROM cards_master LIMIT 10;
```

## 10. 지원

문제가 발생하면:
1. 에러 메시지 확인
2. 콘솔 로그 확인
3. README.md 및 이 가이드 재확인
4. GitHub Issues에 질문 등록

즐거운 게임 되세요!
