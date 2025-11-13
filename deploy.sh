#!/bin/bash

# LOL TCG Game - GCP 배포 스크립트

set -e  # 오류 발생 시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# GCP 프로젝트 ID 확인
if [ -z "$GCP_PROJECT_ID" ]; then
    log_error "GCP_PROJECT_ID 환경 변수가 설정되지 않았습니다."
    echo "사용법: export GCP_PROJECT_ID=your-project-id"
    exit 1
fi

log_info "GCP 프로젝트: $GCP_PROJECT_ID"

# 1. Docker 이미지 빌드
log_info "Step 1: Docker 이미지 빌드 중..."

log_info "Backend 이미지 빌드..."
docker build -t gcr.io/$GCP_PROJECT_ID/lol-tcg-backend:latest ./backend

log_info "Frontend 이미지 빌드..."
docker build -t gcr.io/$GCP_PROJECT_ID/lol-tcg-frontend:latest ./frontend

# 2. Container Registry에 푸시
log_info "Step 2: Container Registry에 푸시 중..."

log_info "Docker 인증 설정..."
gcloud auth configure-docker --quiet

log_info "Backend 이미지 푸시..."
docker push gcr.io/$GCP_PROJECT_ID/lol-tcg-backend:latest

log_info "Frontend 이미지 푸시..."
docker push gcr.io/$GCP_PROJECT_ID/lol-tcg-frontend:latest

# 3. Cloud Run에 배포
log_info "Step 3: Cloud Run에 배포 중..."

# Backend 배포
log_info "Backend 배포..."
gcloud run deploy lol-tcg-backend \
    --image gcr.io/$GCP_PROJECT_ID/lol-tcg-backend:latest \
    --platform managed \
    --region asia-northeast3 \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --quiet

# Backend URL 가져오기
BACKEND_URL=$(gcloud run services describe lol-tcg-backend \
    --platform managed \
    --region asia-northeast3 \
    --format 'value(status.url)')

log_info "Backend URL: $BACKEND_URL"

# Frontend 배포
log_info "Frontend 배포..."
gcloud run deploy lol-tcg-frontend \
    --image gcr.io/$GCP_PROJECT_ID/lol-tcg-frontend:latest \
    --platform managed \
    --region asia-northeast3 \
    --allow-unauthenticated \
    --memory 256Mi \
    --cpu 1 \
    --max-instances 5 \
    --quiet

# Frontend URL 가져오기
FRONTEND_URL=$(gcloud run services describe lol-tcg-frontend \
    --platform managed \
    --region asia-northeast3 \
    --format 'value(status.url)')

log_info "Frontend URL: $FRONTEND_URL"

# 4. CORS 설정 업데이트
log_info "Step 4: CORS 설정 업데이트 중..."
gcloud run services update lol-tcg-backend \
    --update-env-vars FRONTEND_URL=$FRONTEND_URL \
    --region asia-northeast3 \
    --quiet

log_info "✅ 배포 완료!"
echo ""
echo "================================================"
echo "🎮 LOL TCG Game 배포 완료!"
echo "================================================"
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo "================================================"
echo ""
log_warn "주의: Frontend 환경 변수(VITE_API_URL)를 업데이트하려면 Frontend를 다시 빌드하고 배포해야 합니다."
echo "다음 명령어를 실행하세요:"
echo ""
echo "cd frontend"
echo "docker build --build-arg VITE_API_URL=$BACKEND_URL/api -t gcr.io/$GCP_PROJECT_ID/lol-tcg-frontend:latest ."
echo "docker push gcr.io/$GCP_PROJECT_ID/lol-tcg-frontend:latest"
echo "gcloud run deploy lol-tcg-frontend --image gcr.io/$GCP_PROJECT_ID/lol-tcg-frontend:latest --region asia-northeast3"
