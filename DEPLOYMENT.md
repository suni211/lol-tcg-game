# GCP 배포 가이드

Google Cloud Platform에 LOL TCG Game을 배포하는 방법입니다.

## 📋 사전 준비

1. GCP 계정 및 프로젝트 생성
2. Google Cloud SDK (gcloud CLI) 설치
3. Docker 설치 (로컬에서 빌드할 경우)

## 🗄️ Option 1: Cloud Run + Cloud SQL (권장)

서버리스 아키텍처로 자동 스케일링과 비용 효율성이 좋습니다.

### 1. Cloud SQL 인스턴스 생성

```bash
# Cloud SQL 인스턴스 생성 (MySQL)
gcloud sql instances create lol-tcg-db \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=asia-northeast3 \
    --root-password=[ROOT_PASSWORD]

# 데이터베이스 생성
gcloud sql databases create lol_tcg_game --instance=lol-tcg-db

# 사용자 생성
gcloud sql users create lol_user \
    --instance=lol-tcg-db \
    --password=[USER_PASSWORD]
```

### 2. 데이터베이스 스키마 Import

```bash
# Cloud SQL Proxy를 통해 연결
cloud_sql_proxy -instances=[PROJECT_ID]:asia-northeast3:lol-tcg-db=tcp:3306

# 다른 터미널에서 스키마 import
mysql -h 127.0.0.1 -u root -p lol_tcg_game < database/schema.sql
mysql -h 127.0.0.1 -u root -p lol_tcg_game < database/seed.sql
```

### 3. Container Registry에 이미지 업로드

```bash
# Docker 이미지 빌드 및 푸시
gcloud auth configure-docker

# Backend 이미지 빌드 및 푸시
cd backend
docker build -t gcr.io/[PROJECT_ID]/lol-tcg-backend:latest .
docker push gcr.io/[PROJECT_ID]/lol-tcg-backend:latest

# Frontend 이미지 빌드 및 푸시
cd ../frontend
docker build -t gcr.io/[PROJECT_ID]/lol-tcg-frontend:latest .
docker push gcr.io/[PROJECT_ID]/lol-tcg-frontend:latest
```

### 4. Cloud Run에 Backend 배포

```bash
gcloud run deploy lol-tcg-backend \
    --image gcr.io/[PROJECT_ID]/lol-tcg-backend:latest \
    --platform managed \
    --region asia-northeast3 \
    --allow-unauthenticated \
    --add-cloudsql-instances [PROJECT_ID]:asia-northeast3:lol-tcg-db \
    --set-env-vars "DB_HOST=/cloudsql/[PROJECT_ID]:asia-northeast3:lol-tcg-db" \
    --set-env-vars "DB_USER=lol_user" \
    --set-env-vars "DB_PASSWORD=[USER_PASSWORD]" \
    --set-env-vars "DB_NAME=lol_tcg_game" \
    --set-env-vars "JWT_SECRET=[YOUR_JWT_SECRET]" \
    --set-env-vars "FRONTEND_URL=https://[FRONTEND_URL]" \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10
```

### 5. Cloud Run에 Frontend 배포

Backend URL을 확인한 후:

```bash
# Frontend를 다시 빌드 (API URL 포함)
cd frontend
docker build \
    --build-arg VITE_API_URL=https://[BACKEND_URL]/api \
    -t gcr.io/[PROJECT_ID]/lol-tcg-frontend:latest .
docker push gcr.io/[PROJECT_ID]/lol-tcg-frontend:latest

# Cloud Run에 배포
gcloud run deploy lol-tcg-frontend \
    --image gcr.io/[PROJECT_ID]/lol-tcg-frontend:latest \
    --platform managed \
    --region asia-northeast3 \
    --allow-unauthenticated \
    --memory 256Mi \
    --cpu 1 \
    --max-instances 5
```

### 6. Backend CORS 업데이트

Frontend URL을 받은 후, Backend를 다시 배포하여 CORS 설정 업데이트:

```bash
gcloud run services update lol-tcg-backend \
    --update-env-vars "FRONTEND_URL=https://[FRONTEND_CLOUD_RUN_URL]"
```

## 🖥️ Option 2: Compute Engine (VM)

### 1. VM 인스턴스 생성

```bash
gcloud compute instances create lol-tcg-server \
    --zone=asia-northeast3-a \
    --machine-type=e2-medium \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=20GB \
    --tags=http-server,https-server
```

### 2. 방화벽 규칙 설정

```bash
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --target-tags http-server

gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --target-tags https-server

gcloud compute firewall-rules create allow-backend \
    --allow tcp:5000 \
    --target-tags http-server
```

### 3. VM에 접속하여 설치

```bash
# SSH 접속
gcloud compute ssh lol-tcg-server --zone=asia-northeast3-a

# Docker 설치
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER

# 프로젝트 클론
git clone https://github.com/[YOUR_USERNAME]/lol-tcg-game.git
cd lol-tcg-game

# 환경 변수 설정
nano .env
# DB_ROOT_PASSWORD, DB_PASSWORD, JWT_SECRET 등 설정

# Docker Compose로 실행
sudo docker-compose up -d
```

### 4. 도메인 연결 (선택사항)

```bash
# 정적 IP 할당
gcloud compute addresses create lol-tcg-ip --region=asia-northeast3

# IP 확인
gcloud compute addresses describe lol-tcg-ip --region=asia-northeast3

# VM에 IP 할당
gcloud compute instances delete-access-config lol-tcg-server --zone=asia-northeast3-a
gcloud compute instances add-access-config lol-tcg-server \
    --zone=asia-northeast3-a \
    --address=[STATIC_IP]
```

## 🔐 환경 변수 관리

### Secret Manager 사용 (권장)

```bash
# Secret 생성
echo -n "[YOUR_JWT_SECRET]" | gcloud secrets create jwt-secret --data-file=-
echo -n "[DB_PASSWORD]" | gcloud secrets create db-password --data-file=-

# Cloud Run에서 Secret 사용
gcloud run services update lol-tcg-backend \
    --update-secrets=JWT_SECRET=jwt-secret:latest \
    --update-secrets=DB_PASSWORD=db-password:latest
```

## 📊 모니터링 및 로깅

### Cloud Logging 확인

```bash
# Backend 로그 확인
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lol-tcg-backend" --limit 50

# Frontend 로그 확인
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lol-tcg-frontend" --limit 50
```

### Cloud Monitoring 설정

1. GCP Console에서 Monitoring 페이지 이동
2. Dashboard 생성
3. 메트릭 추가:
   - Cloud Run: Request count, Latency, Error rate
   - Cloud SQL: CPU usage, Memory usage, Connections

## 🔄 지속적 배포 (CI/CD)

### Cloud Build 설정

`cloudbuild.yaml` 파일 생성:

```yaml
steps:
  # Backend 빌드
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/lol-tcg-backend:$SHORT_SHA', './backend']

  # Backend 푸시
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/lol-tcg-backend:$SHORT_SHA']

  # Backend 배포
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'lol-tcg-backend'
      - '--image=gcr.io/$PROJECT_ID/lol-tcg-backend:$SHORT_SHA'
      - '--region=asia-northeast3'
      - '--platform=managed'

  # Frontend 빌드
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/lol-tcg-frontend:$SHORT_SHA', './frontend']

  # Frontend 푸시
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/lol-tcg-frontend:$SHORT_SHA']

  # Frontend 배포
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'lol-tcg-frontend'
      - '--image=gcr.io/$PROJECT_ID/lol-tcg-frontend:$SHORT_SHA'
      - '--region=asia-northeast3'
      - '--platform=managed'

images:
  - 'gcr.io/$PROJECT_ID/lol-tcg-backend:$SHORT_SHA'
  - 'gcr.io/$PROJECT_ID/lol-tcg-frontend:$SHORT_SHA'
```

### GitHub와 연동

```bash
# Cloud Build 트리거 생성
gcloud builds triggers create github \
    --repo-name=lol-tcg-game \
    --repo-owner=[YOUR_GITHUB_USERNAME] \
    --branch-pattern="^main$" \
    --build-config=cloudbuild.yaml
```

## 💰 예상 비용 (월간)

### Cloud Run + Cloud SQL
- Cloud SQL (db-f1-micro): ~$10
- Cloud Run Backend: ~$5-15 (트래픽에 따라)
- Cloud Run Frontend: ~$2-5
- **총 예상 비용: $17-30/월**

### Compute Engine
- e2-medium VM: ~$25/월
- 정적 IP: ~$3/월
- **총 예상 비용: $28/월**

## 🔧 문제 해결

### Cloud SQL 연결 오류
```bash
# Cloud SQL Proxy 확인
gcloud sql instances describe lol-tcg-db

# 연결 테스트
gcloud sql connect lol-tcg-db --user=root
```

### Cloud Run 메모리 부족
```bash
# 메모리 증가
gcloud run services update lol-tcg-backend --memory 1Gi
```

### CORS 오류
Backend의 `FRONTEND_URL` 환경 변수가 정확한지 확인

## 📝 체크리스트

배포 전 확인사항:

- [ ] `.env` 파일의 모든 시크릿 값 변경
- [ ] Cloud SQL 인스턴스 생성 및 스키마 import
- [ ] Backend와 Frontend Docker 이미지 빌드 및 푸시
- [ ] Cloud Run 서비스 배포
- [ ] CORS 설정 업데이트
- [ ] 도메인 연결 (선택사항)
- [ ] SSL 인증서 설정 (선택사항)
- [ ] 모니터링 및 알림 설정

## 📚 참고 자료

- [Cloud Run 문서](https://cloud.google.com/run/docs)
- [Cloud SQL 문서](https://cloud.google.com/sql/docs)
- [Container Registry 문서](https://cloud.google.com/container-registry/docs)
