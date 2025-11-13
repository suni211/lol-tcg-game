#!/bin/bash

# LOL TCG Game - GCP VM 자동 설치 스크립트
# 이 스크립트 하나로 모든 설정이 완료됩니다!

set -e  # 오류 발생 시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로고 출력
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════╗
║                                          ║
║      LOL TCG Game 자동 배포 스크립트      ║
║                                          ║
╚══════════════════════════════════════════╝
EOF
echo -e "${NC}"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================${NC}\n"
}

# VM의 외부 IP 가져오기
get_external_ip() {
    curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google"
}

# 도메인 입력 받기
get_domain() {
    echo -e "\n${YELLOW}도메인을 사용하시겠습니까?${NC}"
    echo "1) 예 - 도메인 사용 (SSL 인증서 자동 설정)"
    echo "2) 아니오 - IP 주소만 사용"
    read -p "선택 (1 or 2): " use_domain

    if [ "$use_domain" = "1" ]; then
        read -p "도메인 이름을 입력하세요 (예: loltcg.com): " DOMAIN
        read -p "이메일 주소를 입력하세요 (SSL 인증서용): " EMAIL
        USE_DOMAIN=true
    else
        USE_DOMAIN=false
        DOMAIN=""
        EMAIL=""
    fi
}

# 비밀번호 생성
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

log_step "Step 0: 초기 설정"

# 외부 IP 가져오기
EXTERNAL_IP=$(get_external_ip)
log_info "VM 외부 IP: $EXTERNAL_IP"

# 도메인 설정
get_domain

# 비밀번호 자동 생성
DB_ROOT_PASSWORD=$(generate_password)
DB_PASSWORD=$(generate_password)
JWT_SECRET=$(generate_password)

log_info "보안 비밀번호가 자동 생성되었습니다."

# ==============================================
log_step "Step 1: 시스템 업데이트"
# ==============================================

log_info "시스템 패키지 업데이트 중..."
sudo apt update
sudo apt upgrade -y

# ==============================================
log_step "Step 2: Docker 설치"
# ==============================================

if command -v docker &> /dev/null; then
    log_warn "Docker가 이미 설치되어 있습니다."
else
    log_info "Docker 설치 중..."

    # 필수 패키지 설치
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release

    # Docker GPG 키 추가
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Docker 저장소 추가
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Docker 설치
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io

    # 현재 사용자를 docker 그룹에 추가
    sudo usermod -aG docker $USER

    # Docker 자동 시작 설정
    sudo systemctl enable docker
    sudo systemctl start docker

    log_info "Docker 설치 완료!"
fi

# ==============================================
log_step "Step 3: Docker Compose 설치"
# ==============================================

if command -v docker-compose &> /dev/null; then
    log_warn "Docker Compose가 이미 설치되어 있습니다."
else
    log_info "Docker Compose 설치 중..."

    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    # 심볼릭 링크 생성
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

    log_info "Docker Compose 설치 완료!"
    docker-compose --version
fi

# ==============================================
log_step "Step 4: 추가 도구 설치"
# ==============================================

log_info "Git, Nginx, Certbot 설치 중..."
sudo apt install -y git nginx certbot python3-certbot-nginx

# ==============================================
log_step "Step 5: 프로젝트 클론"
# ==============================================

cd ~

if [ -d "lol-tcg-game" ]; then
    log_warn "프로젝트 폴더가 이미 존재합니다. 업데이트 중..."
    cd lol-tcg-game
    git pull origin main
else
    log_info "GitHub에서 프로젝트 클론 중..."
    git clone https://github.com/suni211/lol-tcg-game.git
    cd lol-tcg-game
fi

# ==============================================
log_step "Step 6: 환경 변수 설정"
# ==============================================

log_info ".env 파일 생성 중..."

if [ "$USE_DOMAIN" = true ]; then
    FRONTEND_URL="https://$DOMAIN"
    API_URL="https://$DOMAIN/api"
else
    FRONTEND_URL="http://$EXTERNAL_IP"
    API_URL="http://$EXTERNAL_IP:5000/api"
fi

cat > .env << EOF
# Database
DB_ROOT_PASSWORD=$DB_ROOT_PASSWORD
DB_USER=lol_user
DB_PASSWORD=$DB_PASSWORD
DB_NAME=lol_tcg_game

# Backend
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=$FRONTEND_URL

# Frontend
VITE_API_URL=$API_URL
EOF

log_info ".env 파일 생성 완료!"

# ==============================================
log_step "Step 7: Docker 컨테이너 실행"
# ==============================================

log_info "Docker 컨테이너 빌드 및 실행 중..."

# Docker 그룹 적용
newgrp docker << EONG
cd ~/lol-tcg-game
docker-compose down 2>/dev/null || true
docker-compose up -d --build
EONG

log_info "컨테이너 시작 대기 중... (30초)"
sleep 30

# 컨테이너 상태 확인
log_info "컨테이너 상태:"
docker-compose ps

# ==============================================
if [ "$USE_DOMAIN" = true ]; then
    log_step "Step 8: Nginx 리버스 프록시 설정"

    log_info "Nginx 설정 파일 생성 중..."

    sudo tee /etc/nginx/sites-available/lol-tcg-game > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Nginx 설정 활성화
    sudo ln -sf /etc/nginx/sites-available/lol-tcg-game /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default

    # Nginx 테스트
    sudo nginx -t

    # Nginx 재시작
    sudo systemctl restart nginx

    log_info "Nginx 설정 완료!"

    # ==============================================
    log_step "Step 9: SSL 인증서 설치 (Let's Encrypt)"
    # ==============================================

    log_info "SSL 인증서 발급 중..."
    log_warn "도메인의 DNS A 레코드가 이 서버 IP($EXTERNAL_IP)를 가리켜야 합니다!"

    read -p "DNS 설정이 완료되었습니까? (y/n): " dns_ready

    if [ "$dns_ready" = "y" ] || [ "$dns_ready" = "Y" ]; then
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

        log_info "SSL 인증서 설치 완료!"
        log_info "자동 갱신 설정 확인..."
        sudo certbot renew --dry-run
    else
        log_warn "SSL 설치를 건너뜁니다. 나중에 다음 명령어로 설치하세요:"
        echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --redirect"
    fi
fi

# ==============================================
log_step "완료! 🎉"
# ==============================================

echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════╗
║                                          ║
║         배포가 완료되었습니다! 🎉         ║
║                                          ║
╚══════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}      LOL TCG Game 접속 정보${NC}"
echo -e "${BLUE}========================================${NC}"

if [ "$USE_DOMAIN" = true ]; then
    echo -e "${GREEN}🌐 웹사이트:${NC} https://$DOMAIN"
    echo -e "${GREEN}📡 API:${NC} https://$DOMAIN/api"
else
    echo -e "${GREEN}🌐 웹사이트:${NC} http://$EXTERNAL_IP"
    echo -e "${GREEN}📡 API:${NC} http://$EXTERNAL_IP:5000/api"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}      데이터베이스 정보${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}⚠️  이 정보를 안전한 곳에 저장하세요!${NC}"
echo ""
echo -e "${GREEN}DB Root 비밀번호:${NC} $DB_ROOT_PASSWORD"
echo -e "${GREEN}DB User:${NC} lol_user"
echo -e "${GREEN}DB 비밀번호:${NC} $DB_PASSWORD"
echo -e "${GREEN}JWT Secret:${NC} $JWT_SECRET"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}      유용한 명령어${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "📊 컨테이너 상태 확인:"
echo "   docker-compose ps"
echo ""
echo "📋 로그 확인:"
echo "   docker-compose logs -f"
echo ""
echo "🔄 재시작:"
echo "   docker-compose restart"
echo ""
echo "🛑 중지:"
echo "   docker-compose down"
echo ""
echo "🗄️ 데이터베이스 접속:"
echo "   docker-compose exec database mysql -u root -p"
echo ""

if [ "$USE_DOMAIN" = false ]; then
    echo -e "${YELLOW}💡 Tip: 도메인을 연결하려면 다음 단계를 따르세요:${NC}"
    echo "   1. 도메인의 DNS A 레코드를 $EXTERNAL_IP로 설정"
    echo "   2. 이 스크립트를 다시 실행하고 도메인 옵션 선택"
    echo ""
fi

echo -e "${GREEN}✅ 모든 설정이 완료되었습니다!${NC}"
echo ""

# 비밀번호를 파일로 저장
cat > ~/lol-tcg-credentials.txt << EOF
===========================================
LOL TCG Game - 인증 정보
생성일: $(date)
===========================================

외부 IP: $EXTERNAL_IP
$([ "$USE_DOMAIN" = true ] && echo "도메인: $DOMAIN")

DB Root 비밀번호: $DB_ROOT_PASSWORD
DB User: lol_user
DB 비밀번호: $DB_PASSWORD
JWT Secret: $JWT_SECRET

이 파일을 안전한 곳에 백업하세요!
===========================================
EOF

log_info "인증 정보가 ~/lol-tcg-credentials.txt 파일에 저장되었습니다."
log_warn "이 파일을 안전한 곳에 백업하고 서버에서는 삭제하세요!"

echo ""
log_info "브라우저에서 접속해보세요!"
