# Vercel + Neon 설정 가이드 — Unada Backend

> 완전 무료 플랜으로 운영 가능 (개발/스테이징 기준)

---

## 1단계: Neon 데이터베이스 생성

1. [neon.tech](https://neon.tech) → GitHub 계정으로 회원가입 (무료)
2. **New Project** 클릭
   - Project name: `unada-dev`
   - Region: `US East (N. Virginia)` 또는 가장 가까운 리전
3. 프로젝트 생성 후 **Connection Details** 탭 → **Connection string** 복사
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **prod용 별도 프로젝트** `unada-prod`도 같은 방법으로 생성

> 💡 Neon 무료 플랜: 0.5GB 저장, 프로젝트 10개, 컴퓨팅 시간 제한 있음 (소규모 앱 충분)

---

## 2단계: 초기 DB 마이그레이션

로컬에서 `.env.local` 생성 후 dev DB에 연결:

```bash
cd api
cp .env.example .env.local
# DATABASE_URL을 Neon dev connection string으로 수정

# 마이그레이션 생성 및 적용
npm run db:migrate
# 이름 입력: "init"

# 시드 실행 (에이전트 Jane 생성)
npm run db:seed
# 출력된 Agent ID를 .env.local의 AGENT_ID에 복사
```

---

## 3단계: Vercel 프로젝트 생성

1. [vercel.com](https://vercel.com) → GitHub 계정으로 회원가입 (무료)
2. **Add New Project** → `Unada-studio-production` repo 선택
3. **Root Directory**: `api` 설정 (⚠️ 필수)
4. **Framework Preset**: Next.js (자동 감지)
5. **Environment Variables** 탭에서 아래 변수 추가:

### Dev/Preview 환경

| 변수 | 값 | 환경 |
|------|-----|------|
| `DATABASE_URL` | Neon dev connection string | Preview + Development |
| `PII_ENCRYPTION_KEY` | `openssl rand -hex 32` 결과 | Preview + Development |
| `CORS_ORIGIN` | `http://localhost:3456` | Development |
| `FRONTEND_URL` | `http://localhost:3456` | Development |
| `AGENT_API_KEY` | `openssl rand -hex 32` 결과 | Preview + Development |
| `AGENT_ID` | 시드 후 출력된 UUID | Preview + Development |

### Production 환경

| 변수 | 값 | 환경 |
|------|-----|------|
| `DATABASE_URL` | Neon **prod** connection string | Production |
| `PII_ENCRYPTION_KEY` | **dev와 다른** 별도 키 | Production |
| `CORS_ORIGIN` | `https://app.unada.ca` | Production |
| `FRONTEND_URL` | `https://app.unada.ca` | Production |
| `AGENT_API_KEY` | **dev와 다른** 별도 키 | Production |
| `AGENT_ID` | prod DB 시드 후 UUID | Production |

6. **Deploy** 클릭 → 첫 배포 완료 후 URL 확인
   - 예: `https://unada-studio-production-api.vercel.app`

---

## 4단계: GitHub Secrets 등록

GitHub repo → **Settings** → **Secrets and variables** → **Actions**

| Secret | 값 | 설명 |
|--------|-----|------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens → Create | Vercel CLI 인증 |
| `VERCEL_ORG_ID` | Vercel → Settings → General → Team ID | 조직 ID |
| `VERCEL_PROJECT_ID` | Vercel → Project → Settings → General → Project ID | 프로젝트 ID |
| `PROD_API_URL` | `https://your-app.vercel.app` | Smoke test용 prod URL |

> `VERCEL_ORG_ID`와 `VERCEL_PROJECT_ID`는 `api/` 폴더에서 `npx vercel link` 실행 후 생성되는 `.vercel/project.json` 파일에서 확인 가능

---

## 5단계: GitHub Environment 보호 (prod)

GitHub → **Settings** → **Environments** → **New environment** → `prod`
- **Required reviewers**: 본인 GitHub 계정 추가
- `main` 브랜치 push 시 승인 후 prod 배포

---

## 6단계: 자동 배포 흐름 확인

```bash
# develop 브랜치 → Preview 배포 자동 트리거
git checkout develop
git push origin develop

# PR 오픈 → Preview URL 자동 생성 (Vercel Bot이 PR 코멘트로 알림)
# main merge → prod 배포 (approval gate)
```

---

## API 테스트 (배포 후)

```bash
BASE_URL=https://your-app.vercel.app

# Health check
curl $BASE_URL/api/health
# → { "ok": true, "db": "connected" }

# 세션 생성 (에이전트 → 클라이언트 링크 발급)
curl -X POST $BASE_URL/api/v1/sessions \
  -H "Content-Type: application/json" \
  -H "X-Agent-Key: $AGENT_API_KEY" \
  -d '{"clientEmail": "client@example.com"}'
# → { "onboardingUrl": "https://app.unada.ca?token=..." }

# 답변 저장 (클라이언트 온보딩 중)
curl -X PATCH $BASE_URL/api/v1/onboarding/answers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "partial_1", "answers": {"livingWith": "solo"}}'
```

---

## 무료 플랜 한도 요약

| 서비스 | 무료 한도 | 초과 시 |
|--------|-----------|---------|
| **Vercel** | 100GB 대역폭/월, 100 배포/일 | $20/월 Pro |
| **Neon** | 0.5GB 저장, 컴퓨팅 191시간/월 | $19/월 Launch |
| **GitHub Actions** | 2,000분/월 | $0.008/분 |

초기 서비스라면 **3개 모두 무료** 범위 내에서 충분히 운영 가능합니다.
