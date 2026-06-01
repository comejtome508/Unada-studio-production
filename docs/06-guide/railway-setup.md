# Railway 설정 가이드 — Unada Backend

> Sprint 2 — Infrastructure 수동 설정 항목

---

## 1단계: Railway 프로젝트 생성

1. [railway.app](https://railway.app) 접속 → GitHub 계정으로 로그인
2. **New Project** → **Deploy from GitHub repo** → `Unada-studio-production` 선택
   - Root directory: `api`
3. **프로젝트 이름**: `unada-api-dev` (dev용)
4. 같은 방법으로 `unada-api-prod` 프로젝트 생성 (prod용)

---

## 2단계: PostgreSQL 데이터베이스 추가

각 프로젝트(dev/prod)에서:
1. **New Service** → **Database** → **PostgreSQL**
2. PostgreSQL 서비스 클릭 → **Connect** 탭 → `DATABASE_URL` 복사

---

## 3단계: 환경 변수 설정

각 Railway 프로젝트 → **Variables** 탭에서 아래 변수 추가:

### Dev 환경 (`unada-api-dev`)

```
DATABASE_URL        = (Railway PostgreSQL에서 자동 연결 — ${{Postgres.DATABASE_URL}} 사용)
PII_ENCRYPTION_KEY  = (openssl rand -hex 32 로 생성)
CORS_ORIGIN         = http://localhost:3456
FRONTEND_URL        = http://localhost:3456
AGENT_API_KEY       = (openssl rand -hex 32 로 생성)
AGENT_ID            = (시드 실행 후 출력된 UUID)
```

### Prod 환경 (`unada-api-prod`)

```
DATABASE_URL        = (Railway PostgreSQL에서 자동 연결)
PII_ENCRYPTION_KEY  = (dev와 다른 별도 키 — openssl rand -hex 32)
CORS_ORIGIN         = https://app.unada.ca
FRONTEND_URL        = https://app.unada.ca
AGENT_API_KEY       = (dev와 다른 별도 키)
AGENT_ID            = (prod DB 시드 후 UUID)
```

> ⚠️ **중요**: dev와 prod의 `PII_ENCRYPTION_KEY`, `AGENT_API_KEY`는 반드시 다른 값을 사용하세요.

---

## 4단계: GitHub Secrets 등록

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret 이름 | 값 | 설명 |
|-------------|-----|------|
| `RAILWAY_TOKEN_DEV` | Railway dev 프로젝트 토큰 | Railway → dev 프로젝트 → Settings → Tokens |
| `RAILWAY_TOKEN_PROD` | Railway prod 프로젝트 토큰 | Railway → prod 프로젝트 → Settings → Tokens |
| `DEV_API_URL` | `https://unada-api-dev.railway.app` | dev 배포 URL |
| `PROD_API_URL` | `https://api.unada.ca` (또는 Railway URL) | prod 배포 URL |

---

## 5단계: 초기 DB 마이그레이션 + 시드

로컬에서 `.env.local` 파일 생성 후 dev DB에 연결:

```bash
cd api
cp .env.example .env.local
# .env.local 편집: DATABASE_URL을 dev DB URL로 설정

# 마이그레이션 생성 및 적용
npm run db:migrate
# 이름: "init"

# 시드 실행 (에이전트 Jane + 샘플 세션 생성)
npm run db:seed
# AGENT_ID 값을 .env.local에 복사
```

---

## 6단계: 첫 배포 확인

`develop` 브랜치에 push하면 자동 dev 배포가 트리거됩니다:

```bash
git checkout develop
git push origin develop
```

GitHub Actions → `deploy-dev.yml` 워크플로우 확인:
1. ✅ lint + test 통과
2. ✅ DB migration 적용
3. ✅ Railway dev 배포
4. ✅ health check: `GET /api/health` → `{ ok: true, db: "connected" }`

---

## 7단계: GitHub Environment 보호 규칙 (prod)

GitHub repo → **Settings** → **Environments** → **prod** → **Required reviewers** 추가

이렇게 하면 `main` 브랜치 push 시 1명 이상의 승인이 있어야 prod 배포가 진행됩니다.

---

## API 테스트 (배포 후)

```bash
# 세션 생성 (에이전트 → 클라이언트 링크 발급)
curl -X POST https://unada-api-dev.railway.app/api/v1/sessions \
  -H "Content-Type: application/json" \
  -H "X-Agent-Key: <AGENT_API_KEY>" \
  -d '{"clientEmail": "client@example.com"}'

# 응답:
# { "sessionId": "...", "onboardingToken": "...",
#   "onboardingUrl": "http://localhost:3456?token=...", "expiresAt": "..." }

# 답변 저장 (클라이언트 → 온보딩 진행 중)
curl -X PATCH https://unada-api-dev.railway.app/api/v1/onboarding/answers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <onboarding_token>" \
  -d '{"status": "partial_1", "answers": {"livingWith": "solo", "budget": 500000}}'

# 세션 조회 (에이전트 → 클라이언트 답변 확인)
curl https://unada-api-dev.railway.app/api/v1/sessions/<onboarding_token> \
  -H "X-Agent-Key: <AGENT_API_KEY>"
```
