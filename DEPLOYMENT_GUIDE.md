# 배포 가이드

## 변경 사항 요약

이번 업데이트에서 다음 기능들이 추가되었습니다:

### 1. 배틀 승리 포인트 버그 수정
- **수정 내용**: 승리 시 50 포인트를 지급하도록 변경
- **파일**: `backend/services/tierSystem.js`

### 2. 덱 5명 필수 검증
- **기능**: 덱에 5명의 선수가 없으면 활성화 및 배틀 불가
- **파일**: `backend/services/cardSystem.js`, `backend/routes/battle.js`

### 3. 중복 선수 사용 방지
- **기능**: 같은 선수를 덱에 중복으로 추가할 수 없음
- **파일**: `backend/services/cardSystem.js`

### 4. 출석체크 시스템
- **기능**: 일일 출석체크로 포인트 지급 (기본 50 + 연속 보너스)
- **새 파일**:
  - `database/attendance_schema.sql`
  - `backend/services/attendanceSystem.js`
  - `backend/routes/attendance.js`
  - `frontend/src/pages/Dashboard.jsx` (출석 UI 추가)

### 5. 카드 강화 시스템
- **기능**: 중복 카드를 합성하여 OVR +1 (최대 +10)
- **새 파일**:
  - `database/enhancement_schema.sql`
  - `backend/services/enhancementSystem.js`
  - `backend/routes/enhancement.js`

## 배포 단계

### 1단계: 코드 업데이트

```bash
cd ~/lol-tcg-game
git pull origin main
```

### 2단계: 데이터베이스 스키마 적용

```bash
# 스크립트 실행 권한 부여
chmod +x apply-schemas.sh

# 스키마 적용
./apply-schemas.sh
```

또는 수동으로 적용:

```bash
# .env 파일에서 DB 정보 확인
source .env

# 출석체크 스키마
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/attendance_schema.sql

# 카드 강화 스키마
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/enhancement_schema.sql
```

### 3단계: 백엔드 재시작

```bash
cd ~/lol-tcg-game/backend
npm install  # 새로운 의존성이 있다면
pm2 restart lol-tcg-backend
pm2 logs lol-tcg-backend  # 로그 확인
```

### 4단계: 프론트엔드 재빌드 및 재시작

```bash
cd ~/lol-tcg-game/frontend
npm install  # 새로운 의존성이 있다면
npm run build
pm2 restart lol-tcg-frontend
pm2 logs lol-tcg-frontend  # 로그 확인
```

### 5단계: 동작 확인

1. **배틀 포인트 테스트**
   - 배틀을 진행하고 승리 시 50 포인트가 지급되는지 확인

2. **덱 검증 테스트**
   - 5명 미만의 덱을 활성화하려고 하면 에러 메시지가 나타나는지 확인
   - 같은 선수를 중복으로 추가하려고 하면 에러가 나는지 확인

3. **출석체크 테스트**
   - 대시보드에서 출석체크 버튼이 보이는지 확인
   - 출석체크 클릭 시 50 포인트가 지급되는지 확인
   - 같은 날 두 번 출석체크를 시도하면 에러가 나는지 확인

4. **카드 강화 테스트**
   - 중복 카드를 가진 사용자로 테스트
   - API 엔드포인트 확인: `/api/enhancement/enhance`

## API 엔드포인트 추가 목록

### 출석체크 API
- `POST /api/attendance/checkin` - 출석체크
- `GET /api/attendance/status` - 오늘 출석 상태
- `GET /api/attendance/history` - 출석 기록
- `GET /api/attendance/stats` - 월간 통계

### 카드 강화 API
- `POST /api/enhancement/enhance` - 카드 강화
- `GET /api/enhancement/duplicates/:targetCardId` - 강화 가능한 중복 카드 조회
- `GET /api/enhancement/history` - 강화 기록

## 데이터베이스 테이블 추가

### 출석체크
- `daily_attendance` - 일일 출석 기록
- `attendance_streak` - 연속 출석 정보

### 카드 강화
- `user_cards` 테이블에 컬럼 추가:
  - `enhancement_level` - 강화 레벨 (0-10)
  - `enhanced_ovr` - 강화된 OVR
- `card_enhancements` - 강화 기록

## 문제 해결

### 스키마 적용 실패
```bash
# MySQL 접속 확인
mysql -h $DB_HOST -u $DB_USER -p

# 수동으로 SQL 실행
USE lol_tcg_game;
SOURCE database/attendance_schema.sql;
SOURCE database/enhancement_schema.sql;
```

### PM2 재시작 문제
```bash
# 모든 프로세스 확인
pm2 list

# 로그 확인
pm2 logs

# 재시작
pm2 restart all
```

### 프론트엔드 빌드 오류
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 롤백 방법

문제가 발생한 경우:

```bash
# 이전 커밋으로 되돌리기
git log  # 이전 커밋 해시 확인
git checkout <commit-hash>

# 서버 재시작
pm2 restart all
```

데이터베이스 롤백:
```sql
-- 출석체크 테이블 삭제
DROP TABLE IF EXISTS card_enhancements;
DROP TABLE IF EXISTS attendance_streak;
DROP TABLE IF EXISTS daily_attendance;

-- user_cards 테이블 컬럼 삭제
ALTER TABLE user_cards DROP COLUMN enhancement_level;
ALTER TABLE user_cards DROP COLUMN enhanced_ovr;
```
