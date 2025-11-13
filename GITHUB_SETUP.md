# GitHub 업로드 가이드

## 1. Git 초기화 (저장소가 없는 경우)

```bash
cd lol-tcg-game
git init
```

## 2. GitHub 저장소 생성

1. https://github.com 접속
2. 우측 상단 '+' 클릭 → 'New repository'
3. Repository name: `lol-tcg-game`
4. Public 또는 Private 선택
5. **"Initialize this repository with a README" 체크 해제**
6. 'Create repository' 클릭

## 3. 환경 변수 파일 확인

**중요**: `.env` 파일이 `.gitignore`에 포함되어 있는지 확인!

```bash
# .gitignore 확인
cat .gitignore | grep .env
```

출력 예시:
```
.env
.env.local
.env.production
.env.development
```

## 4. Git 커밋 및 푸시

```bash
# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: LOL TCG Game"

# GitHub 저장소 연결
git remote add origin https://github.com/[YOUR_USERNAME]/lol-tcg-game.git

# 브랜치 이름 확인 및 변경 (필요시)
git branch -M main

# 푸시
git push -u origin main
```

## 5. 업로드 전 체크리스트

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `.env` 파일이 Git에 추가되지 않았는가? (`git status`로 확인)
- [ ] `node_modules/` 폴더가 제외되었는가?
- [ ] `README.md`가 작성되었는가?
- [ ] 민감한 정보 (API 키, 비밀번호 등)가 코드에 하드코딩되어 있지 않은가?

## 6. 로컬에서 .env 파일 제외 확인

```bash
# Git에 추적되는 파일 목록 확인
git ls-files | grep .env

# 아무것도 출력되지 않으면 정상
# .env가 출력되면 아래 명령어 실행:
git rm --cached backend/.env
git rm --cached frontend/.env
git rm --cached .env
git commit -m "Remove .env files from git"
```

## 7. 협업자 추가 (선택사항)

1. GitHub 저장소 페이지 → Settings
2. Collaborators → Add people
3. 협업자의 GitHub 사용자명 입력

## 8. 브랜치 보호 규칙 (선택사항)

프로덕션 브랜치 보호:

1. Settings → Branches
2. Branch protection rules → Add rule
3. Branch name pattern: `main`
4. 체크 항목:
   - Require pull request reviews before merging
   - Require status checks to pass before merging

## 9. GitHub Actions (CI/CD) 설정 (선택사항)

`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to GCP

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}

    - name: Configure Docker
      run: gcloud auth configure-docker

    - name: Build and Push Backend
      run: |
        docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/lol-tcg-backend:${{ github.sha }} ./backend
        docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/lol-tcg-backend:${{ github.sha }}

    - name: Build and Push Frontend
      run: |
        docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/lol-tcg-frontend:${{ github.sha }} ./frontend
        docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/lol-tcg-frontend:${{ github.sha }}

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy lol-tcg-backend --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/lol-tcg-backend:${{ github.sha }} --region asia-northeast3
        gcloud run deploy lol-tcg-frontend --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/lol-tcg-frontend:${{ github.sha }} --region asia-northeast3
```

GitHub Secrets 설정:
- `GCP_PROJECT_ID`: GCP 프로젝트 ID
- `GCP_SA_KEY`: 서비스 계정 키 (JSON)

## 10. 이후 업데이트

```bash
# 파일 수정 후
git add .
git commit -m "Update: [변경 내용 설명]"
git push origin main
```

## 문제 해결

### "Repository not found" 오류

```bash
# 원격 저장소 URL 확인
git remote -v

# 잘못된 경우 수정
git remote set-url origin https://github.com/[YOUR_USERNAME]/lol-tcg-game.git
```

### 푸시가 거부됨 (rejected)

```bash
# 원격 저장소의 변경사항 가져오기
git pull origin main --rebase

# 충돌 해결 후
git push origin main
```

### .env 파일이 실수로 커밋됨

```bash
# Git 히스토리에서 완전히 제거
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# 강제 푸시 (주의!)
git push origin --force --all
```

## 유용한 Git 명령어

```bash
# 현재 상태 확인
git status

# 변경 이력 확인
git log --oneline

# 특정 파일의 변경 내역
git log --follow [파일명]

# 마지막 커밋 수정
git commit --amend

# 브랜치 생성 및 이동
git checkout -b [브랜치명]

# 브랜치 병합
git merge [브랜치명]
```
