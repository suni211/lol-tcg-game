@echo off
REM LOL TCG Game - GCP 배포 스크립트 (Windows)

setlocal enabledelayedexpansion

REM GCP 프로젝트 ID 확인
if "%GCP_PROJECT_ID%"=="" (
    echo [ERROR] GCP_PROJECT_ID 환경 변수가 설정되지 않았습니다.
    echo 사용법: set GCP_PROJECT_ID=your-project-id
    exit /b 1
)

echo [INFO] GCP 프로젝트: %GCP_PROJECT_ID%

REM 1. Docker 이미지 빌드
echo.
echo ================================================
echo Step 1: Docker 이미지 빌드 중...
echo ================================================

echo [INFO] Backend 이미지 빌드...
docker build -t gcr.io/%GCP_PROJECT_ID%/lol-tcg-backend:latest ./backend
if errorlevel 1 (
    echo [ERROR] Backend 빌드 실패
    exit /b 1
)

echo [INFO] Frontend 이미지 빌드...
docker build -t gcr.io/%GCP_PROJECT_ID%/lol-tcg-frontend:latest ./frontend
if errorlevel 1 (
    echo [ERROR] Frontend 빌드 실패
    exit /b 1
)

REM 2. Container Registry에 푸시
echo.
echo ================================================
echo Step 2: Container Registry에 푸시 중...
echo ================================================

echo [INFO] Docker 인증 설정...
call gcloud auth configure-docker --quiet

echo [INFO] Backend 이미지 푸시...
docker push gcr.io/%GCP_PROJECT_ID%/lol-tcg-backend:latest
if errorlevel 1 (
    echo [ERROR] Backend 푸시 실패
    exit /b 1
)

echo [INFO] Frontend 이미지 푸시...
docker push gcr.io/%GCP_PROJECT_ID%/lol-tcg-frontend:latest
if errorlevel 1 (
    echo [ERROR] Frontend 푸시 실패
    exit /b 1
)

REM 3. Cloud Run에 배포
echo.
echo ================================================
echo Step 3: Cloud Run에 배포 중...
echo ================================================

echo [INFO] Backend 배포...
call gcloud run deploy lol-tcg-backend ^
    --image gcr.io/%GCP_PROJECT_ID%/lol-tcg-backend:latest ^
    --platform managed ^
    --region asia-northeast3 ^
    --allow-unauthenticated ^
    --memory 512Mi ^
    --cpu 1 ^
    --max-instances 10 ^
    --quiet

if errorlevel 1 (
    echo [ERROR] Backend 배포 실패
    exit /b 1
)

REM Backend URL 가져오기
for /f "delims=" %%i in ('gcloud run services describe lol-tcg-backend --platform managed --region asia-northeast3 --format "value(status.url)"') do set BACKEND_URL=%%i
echo [INFO] Backend URL: %BACKEND_URL%

echo [INFO] Frontend 배포...
call gcloud run deploy lol-tcg-frontend ^
    --image gcr.io/%GCP_PROJECT_ID%/lol-tcg-frontend:latest ^
    --platform managed ^
    --region asia-northeast3 ^
    --allow-unauthenticated ^
    --memory 256Mi ^
    --cpu 1 ^
    --max-instances 5 ^
    --quiet

if errorlevel 1 (
    echo [ERROR] Frontend 배포 실패
    exit /b 1
)

REM Frontend URL 가져오기
for /f "delims=" %%i in ('gcloud run services describe lol-tcg-frontend --platform managed --region asia-northeast3 --format "value(status.url)"') do set FRONTEND_URL=%%i
echo [INFO] Frontend URL: %FRONTEND_URL%

REM 4. CORS 설정 업데이트
echo.
echo ================================================
echo Step 4: CORS 설정 업데이트 중...
echo ================================================

call gcloud run services update lol-tcg-backend ^
    --update-env-vars FRONTEND_URL=%FRONTEND_URL% ^
    --region asia-northeast3 ^
    --quiet

echo.
echo ================================================
echo 🎮 LOL TCG Game 배포 완료!
echo ================================================
echo Backend:  %BACKEND_URL%
echo Frontend: %FRONTEND_URL%
echo ================================================
echo.
echo [주의] Frontend 환경 변수(VITE_API_URL)를 업데이트하려면
echo Frontend를 다시 빌드하고 배포해야 합니다.
echo.
echo 다음 명령어를 실행하세요:
echo cd frontend
echo docker build --build-arg VITE_API_URL=%BACKEND_URL%/api -t gcr.io/%GCP_PROJECT_ID%/lol-tcg-frontend:latest .
echo docker push gcr.io/%GCP_PROJECT_ID%/lol-tcg-frontend:latest
echo gcloud run deploy lol-tcg-frontend --image gcr.io/%GCP_PROJECT_ID%/lol-tcg-frontend:latest --region asia-northeast3

endlocal
