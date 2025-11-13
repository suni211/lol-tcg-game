# 🚀 LOL TCG Game - 5분 만에 배포하기

## 📋 필요한 것

1. **GCP 계정** - https://console.cloud.google.com
2. **5분의 시간**

그게 전부입니다! 나머지는 자동으로 됩니다.

---

## Step 1: GCP에서 VM 만들기 (2분)

### 1-1. GCP Console 접속
https://console.cloud.google.com

### 1-2. Compute Engine → VM 인스턴스

왼쪽 메뉴 → **Compute Engine** → **VM 인스턴스**

### 1-3. 인스턴스 만들기

**빠른 설정:**
- **이름**: `lol-tcg-server`
- **리전**: `asia-northeast3 (서울)`
- **영역**: `asia-northeast3-a`
- **머신 유형**: `e2-medium` (2vCPU, 4GB)
- **부팅 디스크**:
  - Ubuntu 22.04 LTS
  - 30GB
- **방화벽**:
  - ✅ HTTP 트래픽 허용
  - ✅ HTTPS 트래픽 허용

**만들기** 클릭!

### 1-4. 방화벽 추가 설정

**VPC 네트워크** → **방화벽** → **방화벽 규칙 만들기**

- **이름**: `allow-backend-5000`
- **대상 태그**: `http-server`
- **소스 IPv4 범위**: `0.0.0.0/0`
- **프로토콜 및 포트**: `tcp:5000`

**만들기** 클릭!

---

## Step 2: VM에 접속 및 자동 설치 (3분)

### 2-1. SSH 접속

VM 인스턴스 목록에서 `lol-tcg-server` 옆의 **SSH** 버튼 클릭

### 2-2. 자동 설치 스크립트 실행

SSH 창에서 다음 명령어 **한 줄씩** 복사해서 붙여넣기:

```bash
# 설치 스크립트 다운로드
curl -sSL https://raw.githubusercontent.com/suni211/lol-tcg-game/main/setup-vm.sh -o setup-vm.sh

# 실행 권한 부여
chmod +x setup-vm.sh

# 스크립트 실행
./setup-vm.sh
```

### 2-3. 질문에 답하기

스크립트가 질문합니다:

**1. 도메인을 사용하시겠습니까?**
```
1) 예 - 도메인 사용 (SSL 인증서 자동 설정)
2) 아니오 - IP 주소만 사용
```

- **도메인이 있으면**: `1` 입력 후 도메인 이름과 이메일 입력
- **도메인이 없으면**: `2` 입력

**2. DNS 설정이 완료되었습니까?** (도메인 사용 시만)
- DNS A 레코드를 VM IP로 설정했으면 `y`
- 아직 안 했으면 `n` (나중에 다시 설정 가능)

### 2-4. 설치 완료 대기 (약 5-10분)

스크립트가 자동으로:
- ✅ Docker 설치
- ✅ Docker Compose 설치
- ✅ Nginx 설치
- ✅ 프로젝트 클론
- ✅ 환경 변수 설정
- ✅ 컨테이너 빌드 및 실행
- ✅ SSL 인증서 설치 (도메인 사용 시)

---

## Step 3: 완료! 🎉

### 접속 정보

스크립트가 끝나면 출력됩니다:

**도메인 사용:**
```
🌐 웹사이트: https://yourdomain.com
📡 API: https://yourdomain.com/api
```

**IP 사용:**
```
🌐 웹사이트: http://YOUR_VM_IP
📡 API: http://YOUR_VM_IP:5000/api
```

### 중요 정보 저장

스크립트가 자동 생성한 비밀번호들이 표시됩니다:
- DB Root 비밀번호
- DB User 비밀번호
- JWT Secret

**이 정보는 ~/lol-tcg-credentials.txt 파일에도 저장됩니다.**

```bash
# 정보 확인
cat ~/lol-tcg-credentials.txt

# 안전한 곳에 복사한 후 서버에서 삭제
rm ~/lol-tcg-credentials.txt
```

---

## 🎮 게임 시작!

### 1. 브라우저로 접속

- 도메인: https://yourdomain.com
- IP: http://YOUR_VM_IP

### 2. 회원가입

### 3. 게임 플레이!

---

## 🔧 관리 명령어

### 컨테이너 상태 확인
```bash
cd ~/lol-tcg-game
docker-compose ps
```

### 로그 확인
```bash
docker-compose logs -f
```

### 재시작
```bash
docker-compose restart
```

### 중지
```bash
docker-compose down
```

### 코드 업데이트
```bash
cd ~/lol-tcg-game
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## 🌐 도메인 연결 가이드 (선택사항)

### 도메인을 나중에 연결하고 싶다면:

### 1. 도메인 구매
- Google Domains, Namecheap, GoDaddy 등

### 2. DNS 설정
도메인 관리 페이지에서 A 레코드 추가:

```
Type: A
Name: @
Value: YOUR_VM_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_VM_IP
TTL: 3600
```

### 3. DNS 전파 확인 (5분~1시간)
```bash
nslookup yourdomain.com
```

### 4. SSL 인증서 설치
```bash
cd ~/lol-tcg-game
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --email your@email.com --redirect
```

### 5. 환경 변수 업데이트
```bash
nano .env
```

다음 줄 수정:
```env
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
```

### 6. 재배포
```bash
docker-compose down
docker-compose up -d --build
```

---

## ❓ 문제 해결

### 접속이 안 돼요

**1. 컨테이너 상태 확인**
```bash
docker-compose ps
```

모든 컨테이너가 "Up" 상태여야 합니다.

**2. 로그 확인**
```bash
docker-compose logs backend
docker-compose logs frontend
```

**3. 방화벽 확인**
GCP Console → VPC 네트워크 → 방화벽에서 80, 443, 5000 포트가 열려있는지 확인

### 도메인 SSL 오류

**DNS 전파 확인**
```bash
nslookup yourdomain.com
```

VM의 IP가 나와야 합니다.

**Certbot 재시도**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --email your@email.com --redirect
```

### Docker 권한 오류

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## 💰 비용

### 예상 월간 비용 (e2-medium)
- VM: ~$25/월
- 디스크 (30GB): ~$2/월
- 정적 IP (선택): ~$3/월
- **총**: **~$30/월**

### 비용 절감
- **e2-small** 사용: ~$15/월 (트래픽 적을 때)
- **선점형 VM**: ~70% 할인 (프로덕션 비추천)

---

## 📚 더 알아보기

- 전체 문서: `GCP_VM_DEPLOY.md`
- GitHub: https://github.com/suni211/lol-tcg-game
- 문제 신고: https://github.com/suni211/lol-tcg-game/issues

---

## 🎉 완료!

이제 여러분의 LOL TCG Game이 클라우드에서 실행되고 있습니다!

게임을 즐기세요! 🎮
