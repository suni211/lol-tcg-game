#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "데이터베이스 스키마 적용 시작"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# .env 파일에서 환경변수 로드
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 출석체크 스키마 적용
echo "1. 출석체크 스키마 적용 중..."
docker-compose exec -T db mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < database/attendance_schema.sql

if [ $? -eq 0 ]; then
    echo "   ✓ 출석체크 스키마 적용 완료"
else
    echo "   ✗ 출석체크 스키마 적용 실패"
    exit 1
fi

echo ""

# 카드 강화 스키마 적용
echo "2. 카드 강화 스키마 적용 중..."
docker-compose exec -T db mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < database/enhancement_schema.sql

if [ $? -eq 0 ]; then
    echo "   ✓ 카드 강화 스키마 적용 완료"
else
    echo "   ✗ 카드 강화 스키마 적용 실패"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "모든 스키마 적용 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "서버를 재시작합니다..."
docker-compose restart backend

echo ""
echo "완료! 서비스가 정상 동작하는지 확인하세요:"
echo "  docker-compose logs -f backend"
