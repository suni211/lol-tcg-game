#!/bin/bash

# 데이터베이스 스키마 적용 스크립트

echo "데이터베이스 스키마를 적용합니다..."

# .env 파일에서 데이터베이스 정보 읽기
source .env

# MySQL 접속 정보
MYSQL_CMD="mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME}"

# 출석체크 스키마 적용
echo "출석체크 스키마 적용 중..."
$MYSQL_CMD < database/attendance_schema.sql
if [ $? -eq 0 ]; then
    echo "✓ 출석체크 스키마 적용 완료"
else
    echo "✗ 출석체크 스키마 적용 실패"
fi

# 카드 강화 스키마 적용
echo "카드 강화 스키마 적용 중..."
$MYSQL_CMD < database/enhancement_schema.sql
if [ $? -eq 0 ]; then
    echo "✓ 카드 강화 스키마 적용 완료"
else
    echo "✗ 카드 강화 스키마 적용 실패"
fi

echo ""
echo "모든 스키마 적용 완료!"
echo ""
echo "서버를 재시작해주세요:"
echo "  pm2 restart lol-tcg-backend"
