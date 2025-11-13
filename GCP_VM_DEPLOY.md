# GCP Compute Engine 배포 가이드

## 🖥️ Compute Engine으로 LOL TCG Game 배포하기

### 사전 준비

1. **GCP 계정 및 프로젝트**
   - https://console.cloud.google.com
   - 새 프로젝트 생성 또는 기존 프로젝트 선택

2. **결제 계정 연결**
   - 무료 크레딧($300) 사용 가능

3. **gcloud CLI 설치** (로컬에서 관리하려면)
   - https://cloud.google.com/sdk/docs/install

---

## 📋 Step 1: VM 인스턴스 생성

### 1-1. GCP Console에서 생성 (권장)

1. **GCP Console** → **Compute Engine** → **VM 인스턴스**
2. **인스턴스 만들기** 클릭

#### 기본 설정
- **이름**: `lol-tcg-server`
- **리전**: `asia-northeast3 (서울)`
- **영역**: `asia-northeast3-a`

#### 머신 구성
- **시리즈**: E2
- **머신 유형**: `e2-medium` (2vCPU, 4GB 메모리)
  - 더 저렴한 옵션: `e2-small` (2vCPU, 2GB) - 데이터가 적을 때
  - 더 강력한 옵션: `e2-standard-2` (2vCPU, 8GB) - 트래픽 많을 때

#### 부팅 디스크
- **운영체제**: Ubuntu
- **버전**: Ubuntu 22.04 LTS
- **부팅 디스크 유형**: 표준 영구 디스크
- **크기**: 30GB (권장) ~ 50GB

#### 방화벽
- ✅ **HTTP 트래픽 허용**
- ✅ **HTTPS 트래픽 허용**

3. **만들기** 클릭

### 1-2. gcloud CLI로 생성 (선택사항)

```bash
gcloud compute instances create lol-tcg-server \
    --zone=asia-northeast3-a \
    --machine-type=e2-medium \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=30GB \
    --boot-disk-type=pd-standard \
    --tags=http-server,https-server
```

---

## 🔥 Step 2: 방화벽 규칙 설정

GCP Console → **VPC 네트워크** → **방화벽**

### 필요한 방화벽 규칙

#### 2-1. HTTP (포트 80)
이미 태그로 설정했다면 자동 생성됨. 확인:
- 이름: `default-allow-http`
- 대상 태그: `http-server`
- 포트: `tcp:80`

#### 2-2. HTTPS (포트 443)
- 이름: `default-allow-https`
- 대상 태그: `https-server`
- 포트: `tcp:443`

#### 2-3. Backend API (포트 5000) - 추가 필요
**방화벽 규칙 만들기** 클릭:
- **이름**: `allow-backend-5000`
- **대상**: 지정된 태그
- **대상 태그**: `http-server`
- **소스 IPv4 범위**: `0.0.0.0/0`
- **프로토콜 및 포트**: tcp:5000
- **만들기**

### gcloud CLI 방화벽 설정

```bash
# HTTP (보통 자동 생성됨)
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --target-tags http-server

# HTTPS (보통 자동 생성됨)
gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --target-tags https-server

# Backend API
gcloud compute firewall-rules create allow-backend-5000 \
    --allow tcp:5000 \
    --target-tags http-server
```

---

## 🔌 Step 3: VM에 접속

### 3-1. 브라우저 SSH (가장 쉬움)

GCP Console → **Compute Engine** → **VM 인스턴스** → `lol-tcg-server` 옆 **SSH** 버튼 클릭

### 3-2. gcloud CLI SSH

```bash
gcloud compute ssh lol-tcg-server --zone=asia-northeast3-a
```

---

## 📦 Step 4: VM 환경 설정

SSH로 접속한 상태에서 아래 명령어들을 실행하세요.

### 4-1. 시스템 업데이트

```bash
sudo apt update
sudo apt upgrade -y
```

### 4-2. Docker 설치

```bash
# Docker 설치
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Docker 권한 설정
sudo usermod -aG docker $USER

# Docker 자동 시작 설정
sudo systemctl enable docker
sudo systemctl start docker
```

### 4-3. Docker Compose 설치

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 설치 확인
docker-compose --version
```

### 4-4. Git 설치

```bash
sudo apt install -y git
```

---

## 🚀 Step 5: 프로젝트 배포

### 5-1. 프로젝트 클론

```bash
# 홈 디렉토리로 이동
cd ~

# GitHub에서 클론
git clone https://github.com/suni211/lol-tcg-game.git

# 프로젝트 폴더로 이동
cd lol-tcg-game
```

### 5-2. 환경 변수 설정

```bash
# .env 파일 생성
nano .env
```

아래 내용을 입력하고 **값들을 변경**하세요:

```env
# Database
DB_ROOT_PASSWORD=강력한_루트_비밀번호_입력
DB_USER=lol_user
DB_PASSWORD=강력한_유저_비밀번호_입력
DB_NAME=lol_tcg_game

# Backend
JWT_SECRET=최소_32자_이상의_랜덤_문자열_입력
FRONTEND_URL=http://YOUR_VM_IP

# Frontend
VITE_API_URL=http://YOUR_VM_IP:5000/api
```

**저장**: `Ctrl + O` → `Enter` → `Ctrl + X`

### 5-3. VM의 외부 IP 확인

**새 터미널에서 (로컬):**
```bash
gcloud compute instances list
```

또는 **GCP Console** → **Compute Engine** → **VM 인스턴스**에서 확인

**예시**: `34.64.123.45`

### 5-4. .env 파일 업데이트

VM에서 다시 편집:
```bash
nano .env
```

`YOUR_VM_IP`를 실제 IP로 변경:
```env
FRONTEND_URL=http://34.64.123.45
VITE_API_URL=http://34.64.123.45:5000/api
```

### 5-5. Docker Compose로 실행

```bash
# 권한 재로드 (Docker 그룹 적용)
newgrp docker

# Docker Compose로 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

**컨테이너 상태 확인:**
```bash
docker-compose ps
```

---

## ✅ Step 6: 접속 확인

### 6-1. Frontend 접속

브라우저에서:
```
http://YOUR_VM_IP
```

### 6-2. Backend API 확인

```
http://YOUR_VM_IP:5000/api/health
```

응답:
```json
{
  "status": "ok",
  "message": "LOL TCG Game Server is running"
}
```

---

## 🔒 Step 7: 정적 IP 할당 (선택사항)

VM을 재시작하면 IP가 변경됩니다. 고정 IP를 원한다면:

### 7-1. 정적 IP 예약

**GCP Console** → **VPC 네트워크** → **IP 주소** → **외부 IP 주소 예약**

- **이름**: `lol-tcg-static-ip`
- **네트워크 서비스 계층**: 프리미엄
- **IP 버전**: IPv4
- **유형**: 리전
- **리전**: `asia-northeast3`
- **연결 대상**: `lol-tcg-server`

### 7-2. gcloud로 정적 IP 할당

```bash
# 정적 IP 생성
gcloud compute addresses create lol-tcg-static-ip \
    --region=asia-northeast3

# IP 주소 확인
gcloud compute addresses describe lol-tcg-static-ip \
    --region=asia-northeast3 \
    --format="get(address)"

# VM에 할당
gcloud compute instances delete-access-config lol-tcg-server \
    --zone=asia-northeast3-a

gcloud compute instances add-access-config lol-tcg-server \
    --zone=asia-northeast3-a \
    --address=STATIC_IP_ADDRESS
```

---

## 🌐 Step 8: 도메인 연결 (선택사항)

### 8-1. 도메인 구매

- Google Domains, Namecheap, GoDaddy 등에서 구매

### 8-2. DNS 레코드 설정

도메인 DNS 설정:

```
A Record
Host: @
Value: YOUR_VM_IP
TTL: 3600

A Record (www)
Host: www
Value: YOUR_VM_IP
TTL: 3600
```

### 8-3. Nginx 설정 (도메인용)

VM에서:

```bash
cd ~/lol-tcg-game

# Nginx 컨테이너 설정 추가
nano docker-compose.yml
```

Nginx 리버스 프록시 추가 또는 Let's Encrypt SSL 설정

---

## 🔧 관리 명령어

### 컨테이너 관리

```bash
# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f frontend

# 재시작
docker-compose restart

# 중지
docker-compose down

# 완전 삭제 (볼륨 포함)
docker-compose down -v

# 재빌드 및 실행
docker-compose up -d --build
```

### 데이터베이스 접속

```bash
# MariaDB 컨테이너 접속
docker-compose exec database mysql -u root -p

# 데이터베이스 선택
USE lol_tcg_game;

# 테이블 확인
SHOW TABLES;
```

### 코드 업데이트

```bash
cd ~/lol-tcg-game

# 최신 코드 가져오기
git pull origin main

# 재빌드 및 재시작
docker-compose down
docker-compose up -d --build
```

---

## 📊 모니터링

### 시스템 리소스 확인

```bash
# CPU, 메모리 사용량
docker stats

# 디스크 사용량
df -h

# 로그 크기 확인
du -sh ~/lol-tcg-game
```

---

## 🐛 문제 해결

### 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker-compose logs

# 특정 서비스 재시작
docker-compose restart backend
```

### 데이터베이스 연결 오류

```bash
# 데이터베이스 컨테이너 확인
docker-compose ps database

# 데이터베이스 로그
docker-compose logs database

# 연결 테스트
docker-compose exec backend ping database
```

### 포트가 이미 사용 중

```bash
# 포트 사용 확인
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :80

# 프로세스 종료
sudo kill -9 [PID]
```

### 디스크 공간 부족

```bash
# Docker 정리
docker system prune -a

# 로그 파일 정리
sudo journalctl --vacuum-time=3d
```

---

## 💰 예상 비용

### e2-medium (2vCPU, 4GB)
- **VM**: ~$25/월
- **디스크 (30GB)**: ~$2/월
- **정적 IP**: ~$3/월 (사용 중일 때는 무료)
- **트래픽**: 첫 1GB 무료, 이후 종량제

**총 예상 비용**: ~$27-30/월

### 비용 절감 팁
- **e2-small** 사용: ~$15/월
- **선점형 VM** 사용: ~70% 할인 (하지만 언제든 중단 가능)
- **자동 종료** 설정: 사용하지 않을 때 자동 종료

---

## 🔐 보안 권장사항

1. **SSH 키 인증 사용**
2. **방화벽 규칙 최소화**
3. **정기적인 백업**
4. **OS 및 패키지 업데이트**
5. **강력한 비밀번호 사용**

---

## 📝 체크리스트

배포 전:
- [ ] GCP 프로젝트 생성
- [ ] VM 인스턴스 생성 (e2-medium, Ubuntu 22.04)
- [ ] 방화벽 규칙 설정 (80, 443, 5000)
- [ ] VM에 SSH 접속 확인

배포 중:
- [ ] Docker 및 Docker Compose 설치
- [ ] 프로젝트 클론
- [ ] .env 파일 설정 (비밀번호, IP 주소)
- [ ] docker-compose up -d 실행

배포 후:
- [ ] Frontend 접속 확인 (http://VM_IP)
- [ ] Backend API 확인 (http://VM_IP:5000/api/health)
- [ ] 회원가입 및 로그인 테스트
- [ ] 정적 IP 할당 (선택)
- [ ] 도메인 연결 (선택)

---

## 🆘 도움이 필요하면

- GCP 문서: https://cloud.google.com/compute/docs
- Docker 문서: https://docs.docker.com
- GitHub Issues: https://github.com/suni211/lol-tcg-game/issues
