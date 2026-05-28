---
template: sprint-master-plan
version: 1.0
projectId: unada-backend
generatedAt: 2026-05-28
trustLevel: L2
---

# Unada Backend — Next.js API + PostgreSQL on Railway — Sprint Master Plan

> **Sprint ID**: `unada-backend`
> **Date**: 2026-05-28
> **Trust Level**: L2 (Design까지 자동, Do 이후 승인 필요)
> **예상 기간**: 3 Sprints (~6주)
> **Stack**: Next.js API Routes + Prisma ORM + PostgreSQL + Railway

---

## 0. Executive Summary

| 항목 | 내용 |
|------|------|
| **Mission** | Vanilla JS 온보딩 앱의 mock API를 실제 Next.js 백엔드로 교체하여 답변 데이터를 PostgreSQL에 저장 |
| **Anti-Mission** | 에이전트 Admin 대시보드, AI 매칭 알고리즘, 결제, 모바일 앱 (Sprint 5+ 대상) |
| **Core Primitives** | 6 features × 3 sprints × Railway dev/prod 환경 |
| **Trust Level** | L2 — Plan→Design 자동, Do 진입 시 사용자 승인 |
| **Auto-pause 조건** | 4 triggers 활성 |
| **Success Criteria** | 실제 API 응답, DB 저장 확인, CI 파이프라인 green, prod 배포 완료 |

---

## 1. Context Anchor (Plan → Design → Do 전파)

| Key | Value |
|-----|-------|
| **WHY** | 현재 `submitOnboarding()`이 `setTimeout` mock으로 구현되어 있어 실제 데이터가 저장되지 않음. 에이전트 Jane이 클라이언트 답변을 확인할 수 없는 상태. |
| **WHO** | 1차: 에이전트(Jane) — 클라이언트 답변 수신. 2차: 클라이언트 — 온보딩 링크로 접속하여 답변 제출 |
| **WHAT (도메인)** | onboarding_token 인증, 답변 저장 API, DB 스키마, dev/prod 환경 분리, CI/CD |
| **WHAT NOT** | Admin 대시보드 UI, 매칭 알고리즘, 이메일 알림, 클라이언트 이력 조회 |
| **RISK** | PII 데이터(creditScore, immigrationStatus) 저장 → 암호화 필수. onboarding_token 탈취 시 타인 답변 조회 가능 → 1회성 토큰 or 만료 처리 필요 |
| **SUCCESS** | `PATCH /api/v1/onboarding/answers` 실 호출 시 PostgreSQL에 저장, Railway prod 배포 green, GitHub Actions CI 통과 |
| **SCOPE (정량)** | 6 features / 예상 ~800 LOC (API + schema + tests) / 3 sprints / Railway Hobby ~$5/월 |
| **OUT-OF-SCOPE** | Agent Dashboard (Sprint 5), AI 매칭 (Sprint 6), 이메일 알림 (Sprint 4) |

---

## 2. Features (6개 작업 묶음)

| # | Feature | 우선순위 | Sprint | 설명 |
|---|---------|--------|--------|------|
| 1 | `db-schema` | P0 | S1 | Prisma 스키마 — agents, onboarding_sessions, answers |
| 2 | `token-auth` | P0 | S1 | onboarding_token 생성·검증 미들웨어 |
| 3 | `onboarding-api` | P0 | S1 | PATCH /api/v1/onboarding/answers (partial_1, partial_2, complete) |
| 4 | `railway-setup` | P1 | S2 | Railway dev/prod 프로젝트, 환경 변수, PostgreSQL 프로비저닝 |
| 5 | `cicd` | P1 | S2 | GitHub Actions — lint → test → Railway 배포 (dev/prod 분기) |
| 6 | `frontend-integration` | P2 | S3 | app.js mock → 실 API 연결, token URL 파라미터, 에러 핸들링 |

---

## 3. Sprint Roadmap (3 Sprints)

### Sprint 1 — API Foundation
**목표**: Next.js 프로젝트 셋업 + DB 스키마 + 핵심 API 동작 확인 (로컬)

| 작업 | 내용 |
|------|------|
| Next.js 프로젝트 생성 | `npx create-next-app@latest unada-api --typescript --no-src-dir --app` |
| Prisma + PostgreSQL | `schema.prisma` — agents / onboarding_sessions / answers 테이블 |
| onboarding_token 미들웨어 | UUID v4 생성, Bearer 토큰 검증, 만료(7일) 처리 |
| PATCH API 엔드포인트 | `/api/v1/onboarding/answers` — status(partial_1/partial_2/complete) + answers JSONB |
| 로컬 테스트 | Jest + supertest — 인증 성공/실패, 저장 확인 |

**완료 기준**: 로컬에서 `curl -X PATCH` 성공, DB row 확인

---

### Sprint 2 — Infrastructure & CI/CD
**목표**: Railway dev/prod 환경 구성 + GitHub Actions 파이프라인

| 작업 | 내용 |
|------|------|
| Railway dev 환경 | PostgreSQL 프로비저닝, 환경 변수 주입, dev 도메인 |
| Railway prod 환경 | 별도 Railway 프로젝트, prod DB, prod 도메인 (`api.unada.ca`) |
| 환경 변수 관리 | `DATABASE_URL`, `TOKEN_SECRET`, `CORS_ORIGIN` — Railway Secrets |
| GitHub Actions | PR→lint+test, `develop`→dev 배포, `main`→prod 배포 (approval gate) |
| DB 마이그레이션 | `prisma migrate deploy` — 배포 파이프라인에 자동 포함 |
| Health check | `GET /api/health` — Railway 헬스 프로브 연결 |

**완료 기준**: Railway dev에 배포 성공, GitHub Actions green, prod 배포 approval flow 동작

---

### Sprint 3 — Frontend Integration
**목표**: 기존 Vanilla JS `app.js`를 실 API와 연결

| 작업 | 내용 |
|------|------|
| `window.ENV` 주입 | `index.html`에 런타임 환경 변수 주입 패턴 추가 |
| URL token 파싱 | `?token=<uuid>` 파라미터 읽기 + 미존재 시 에러 화면 |
| `submitOnboarding()` 교체 | mock setTimeout → 실 `fetch` PATCH 호출 |
| 에러 핸들링 | 401(토큰 만료), 429(rate limit), 네트워크 실패 → 재시도 UI |
| CORS 설정 | Next.js API에서 프론트 origin 허용 |
| E2E 스모크 테스트 | 전체 플로우 — Welcome → Q29 → Reveal → DB 저장 확인 |

**완료 기준**: 실제 브라우저에서 온보딩 완료 시 PostgreSQL에 answers 저장 확인

---

## 4. DB 스키마 설계 (Prisma)

```prisma
model Agent {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  phone     String?
  createdAt DateTime @default(now())
  sessions  OnboardingSession[]
}

model OnboardingSession {
  id               String   @id @default(uuid())
  onboardingToken  String   @unique
  agentId          String
  agent            Agent    @relation(fields: [agentId], references: [id])
  clientEmail      String?
  status           String   @default("pending") // pending | partial_1 | partial_2 | complete
  answers          Json     @default("{}")
  expiresAt        DateTime
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

**PII 처리**: `answers` JSONB 내 `creditScore`, `immigrationStatus`, `employmentStatus`는 저장 전 AES-256 암호화 (Sprint 1 P1 태스크)

---

## 5. API Contract

```
PATCH /api/v1/onboarding/answers
Authorization: Bearer <onboarding_token>
Content-Type: application/json

Body:
{
  "status": "partial_1" | "partial_2" | "complete",
  "answers": { [questionKey: string]: any }
}

Response 200:
{ "ok": true, "sessionId": "uuid", "status": "partial_1" }

Response 401: { "error": "invalid_token" }
Response 410: { "error": "token_expired" }
Response 429: { "error": "rate_limit_exceeded" }
```

---

## 6. 환경 변수 전략

```bash
# Railway dev (자동 주입)
DATABASE_URL=postgresql://...railway-dev.../railway
TOKEN_SECRET=dev-32-char-random-string
CORS_ORIGIN=http://localhost:3456
NEXT_PUBLIC_API_URL=https://unada-api-dev.railway.app

# Railway prod
DATABASE_URL=postgresql://...railway-prod.../railway
TOKEN_SECRET=<강한 랜덤값, Railway Secrets>
CORS_ORIGIN=https://app.unada.ca
NEXT_PUBLIC_API_URL=https://api.unada.ca
```

**프론트엔드 주입**: `index.html`의 `<script>` 블록에 `window.ENV = { API_URL: '...' }` 빌드 시 치환

---

## 7. GitHub Actions 파이프라인

```yaml
# 브랜치 전략
feature/* → PR → lint + test + preview
develop   → dev Railway 자동 배포
main      → prod Railway (manual approval gate)
```

```
PR 오픈:
  lint (ESLint + tsc)
  unit test (Jest)
  prisma validate

develop merge:
  prisma migrate deploy (dev DB)
  Railway dev 배포
  smoke test (GET /api/health)

main merge:
  [Required review: 1명]
  prisma migrate deploy (prod DB)
  Railway prod 배포
  smoke test
  실패 시 Railway rollback 트리거
```

---

## 8. Quality Gates 매트릭스

| Phase | Gates | 기준 |
|-------|-------|------|
| design | M4, M8 | API Contract ↔ 모듈 구조 일치 |
| do | M2, M3, M7 | critical issue 0, style 준수 |
| iterate | M1 | matchRate ≥ 90% |
| qa | M3=0, S1=100 | 7-Layer 데이터 흐름 검증 |
| report | M10 | cycle time 기록 |

---

## 9. Risks & Mitigation

| Risk | 가능성 | 영향 | 대응 |
|------|--------|------|------|
| PII 데이터 노출 | 중 | 높음 | JSONB 암호화 + Railway Secrets, HTTPS only |
| onboarding_token 탈취 | 낮 | 높음 | 7일 만료 + HTTPS, rate limiting |
| Railway 장애 | 낮 | 중 | Health check + 자동 재배포 설정 |
| DB migration 실패 | 중 | 높음 | staging 먼저 apply, prod approval gate |
| 프론트 CORS 오류 | 높 | 낮음 | origin whitelist 명시, 로컬 dev proxy 설정 |

---

## 10. Sprint Phase Roadmap (표준 8-phase)

| Phase | 산출물 | Quality Gates |
|-------|--------|---------------|
| prd | PRD 문서 | M8 |
| plan | Plan 문서 | M8 |
| design | DB 스키마 + API Contract + 모듈 구조 | M4, M8 |
| do | 구현 코드 (API + 마이그레이션 + 테스트) | M2, M3, M7 |
| iterate | matchRate ≥ 90% | M1 |
| qa | 7-Layer S1 검증 | M3=0, S1=100 |
| report | 완료 보고서 + carry items | M10 |
| archived | terminal state | — |

---

## 11. Cross-Sprint Dependency

```
[onboarding-v2 sprint] ──uses──▶ [unada-backend sprint S1]
                                    (token-auth + onboarding-api)
                                         │
                              ◀──────────┘ (frontend-integration S3)
                              app.js submitOnboarding() 실 API 연결
```

**이 프로젝트의 frontend-integration(S3) 완료 후**:
- 에이전트 Admin Dashboard (별도 sprint) 착수 가능
- onboarding_token 발급 UI 필요

---

## 12. Resume / Abort 흐름

| 상황 | 절차 |
|------|------|
| Auto-pause 후 resume | `/sprint resume unada-backend` |
| Design 후 Do 진입 승인 | `/sprint phase unada-backend --to do --approve --reason "Design review OK"` |
| 사용자 abort | `/sprint archive unada-backend` |

---

## 13. Sprint 추적 (Living Document)

본 Master Plan은 sprint 진행 중 갱신됨. 각 sprint 완료 시 `phaseHistory` append.

| Sprint | 상태 | 시작일 | 완료일 |
|--------|------|--------|--------|
| S1 — API Foundation | 🔵 대기 | — | — |
| S2 — Infrastructure & CI/CD | ⬜ 대기 | — | — |
| S3 — Frontend Integration | ⬜ 대기 | — | — |
