# PRD — Unada Onboarding V2: "Build Your Home"

**상태:** In Review  
**작성일:** 2026-05-26  
**최종 수정:** 2026-05-27  
**대상 독자:** 프로덕트, 개발, 디자인

---

## 1. 개요

Onboarding V2는 부동산 에이전트가 신규 클라이언트에게 전송하는 **모바일 우선 온보딩 링크**다. 클라이언트가 질문에 답할 때마다 화면 상단의 집 일러스트가 한 조각씩 완성되는 시각적 피드백을 제공하고, 완료 시점에 AI 기반 "Property Insights Teaser"를 노출해 서비스 가입을 유도한다.

### 핵심 가치 제안

| 문제 | V2의 해결 방식 |
|------|---------------|
| 긴 폼은 이탈률이 높다 | 한 화면에 질문 1개 → 인지 부하 최소화 |
| 완료 동기가 없다 | 집이 쌓이는 애니메이션 → 진행감 시각화 |
| 완료 후 가치가 모호하다 | Reveal 단계에서 AI 매칭 결과 미리보기 제공 |

---

## 2. 목표 및 성공 지표

| 목표 | 지표 | 목표값 |
|------|------|--------|
| 완료율 향상 | 29문항 전체 완료 비율 | ≥ 70% |
| 전환율 | Reveal 후 Sign-up 클릭 | ≥ 25% |
| 소요 시간 | 중간값 완료 시간 | ≤ 5분 |
| 에이전트 효율 | 온보딩 후 에이전트 수동 추가 질문 횟수 | ≤ 2회 |

---

## 3. 사용자 및 역할

### 클라이언트 (End User)
- 에이전트로부터 링크를 받아 처음 온보딩을 완료하는 임차·매수 희망자
- 모바일 환경 우선 (iOS Safari, Android Chrome)
- 부동산·금융 용어에 익숙하지 않을 수 있음 → 질문에 컨텍스트 힌트 필수

### 에이전트 (Indirect User)
- 클라이언트가 완료한 응답을 Agent Dashboard에서 확인
- 온보딩 링크를 신규 리드에게 전송하는 주체
- **에이전트는 Jane 한 명** — 다중 에이전트 지원 없음, agentName은 "Jane"으로 하드코딩

---

## 4. 플로우 아키텍처

### 전체 화면 수: 33

```
[Welcome] → [Q1] → [Q2] → ... → [Q12]
         → [Part Transition 1/2] (Vibe & Space 완료)
         → [Q13] → ... → [Q20]
         → [Part Transition 2/3] (Reality Check 완료)
         → [Q21] → ... → [Q29]
         → [Reveal: Generating]
         → [Reveal Slide 1: Neighborhood Match]
         → [Reveal Slide 2: Budget Reality]
         → [Reveal Slide 3: Teaser Listing + Sign Up CTA]
```

| 화면 유형 | 개수 |
|-----------|------|
| Welcome | 1 |
| 질문 화면 | 29 |
| Part Transition | 2 |
| Reveal (로딩 + 3슬라이드) | 1 로딩 + 3 슬라이드 |
| **합계** | **36** |

### 파트 구성

| Part | 질문 범위 | 카테고리 |
|------|-----------|----------|
| Part 1 · Vibe & Space | Q1 – Q12 | The Squad & The Zoo, The Footprint, The Architecture, Your Turf, The Bottom Line |
| Part 2 · Reality Check | Q13 – Q20 | Timeline & Tactics, The Paper Trail |
| Part 3 · Day-to-Day Reality | Q21 – Q29 | Sensory & Environment, Spatial Footprint, Daily Rhythm, Social Battery & Community |

---

## 5. 화면 명세

### 5.1 Welcome 화면

**목적:** 온보딩 컨셉 설명 + 시작 유도

| 요소 | 내용 |
|------|------|
| 로고 | Unada horizontal, width=96 |
| 헤드라인 | "Answer questions. Build your home." |
| 설명 | "Each answer adds a piece to the house above. By answering all the questions it's fully built, and we know exactly what to find you." |
| 1차 CTA | "Find my ideal home →" (Primary 버튼, full-width, height 52) |
| 개인정보 동의 | CTA 버튼 바로 아래, 체크박스 + 텍스트 (아래 명세 참고) |

**개인정보 동의 UI 명세:**
- 체크박스 미체크 시 CTA 버튼 비활성화 (disabled 스타일 적용)
- 텍스트: "I agree to the collection and use of my personal information, including financial and immigration details, for the purpose of real estate matching. [Privacy Policy]"
- "Privacy Policy"는 링크 (Forest 컬러, 밑줄)
- 폰트: DM Sans 11px, fg3 컬러
- 체크박스: 20×20px, 체크 시 Forest fill + 흰색 체크 아이콘

---

### 5.2 질문 화면 — 공통 레이아웃

모든 질문 화면은 다음 3개 Zone으로 구성된다.

```
┌─────────────────────────────┐
│ [상태바] 9:41       ▇ □    │ ← 38px fixed
├─────────────────────────────┤
│ ← Back  PART LABEL   Exit  │
│    [HouseProgress SVG]      │
│    [AI Speech Bubble]       │
│    [Progress Bar]           │ ← Header Zone (가변, ~150px)
├─────────────────────────────┤
│                             │
│  [카테고리 칩]               │
│  [질문 텍스트 h2]            │
│  [힌트 텍스트]               │
│  [입력 컴포넌트]             │ ← Scroll Zone (flex: 1, overflow-y: auto)
│                             │
├─────────────────────────────┤
│  [← Back 버튼] [Next / →]  │ ← Footer Zone (fixed, ~90px)
└─────────────────────────────┘
```

**네비게이션 규칙:**
- Back: 이전 화면으로 (Welcome까지 거슬러 올라감)
- Exit: 온보딩 즉시 종료, 에이전트 대시보드로 복귀
- Next: 다음 화면 (마지막 Q29에서는 "Generate my profile" Sun 버튼)
- **답변 없이 Next 진행 불가 — 모든 질문은 필수 응답** (섹션 16 유효성 검증 참고)

---

### 5.3 HouseProgress 컴포넌트

**집이 쌓이는 순서 (12 stage):**

| Stage | 추가 요소 |
|-------|-----------|
| s ≥ 1 | 땅 바닥 선 |
| s ≥ 2 | 기초 스트라이프 (Meadow) |
| s ≥ 3 | 벽 박스 + 왼쪽 지붕 경사 |
| s ≥ 4 | 오른쪽 지붕 경사 |
| s ≥ 5 | 지붕 채움 (Meadow fill) |
| s ≥ 6 | 문 (PaleSun + Forest 테두리) |
| s ≥ 7 | 문 손잡이 |
| s ≥ 8 | 왼쪽 창문 (격자 포함) |
| s ≥ 9 | 오른쪽 창문 (격자 포함) |
| s ≥ 10 | 지붕 꼭짓점 캡 (Forest 원) |
| s ≥ 11 | 굴뚝 (Forest 직사각형) |
| s = 12 | 연기 (반투명 원 2개) + Sun 팝업 애니메이션 |

**Stage 계산:**
```
stage = round((questionsAnswered / 29) * 12)
```

**SVG viewBox:** `120 × 96`, 렌더 크기 `86 × 69`  
**Ghost outline:** dashed path로 완성 형태를 항상 미리 보여줌  
**전환:** 각 요소 `opacity 0→1`, transition `0.4s`  
**Sun 팝업:** `v2SunPop` keyframe (`scale(0.3)→scale(1)`, 0.5s ease-out)

**AI Speech Bubble:**
- 집 SVG 우측에 tail(말풍선 꼬리)이 있는 흰색 카드
- 카테고리별 메시지 표시 (아래 표 참고)
- 폰트: DM Sans 9px (AI 레이블) + 11px (메시지)

| 카테고리 | AI 메시지 |
|----------|-----------|
| The Squad & The Zoo | "Learning who's coming with you..." |
| The Footprint | "Mapping your ideal space..." |
| The Architecture | "Noting your style preferences..." |
| Your Turf | "Locating your neighbourhood..." |
| The Bottom Line | "Setting your budget range..." |
| Timeline & Tactics | "Checking your move readiness..." |
| The Paper Trail | "Reviewing your application..." |
| Sensory & Environment | "Capturing your comfort needs..." |
| Spatial Footprint | "Understanding your storage..." |
| Daily Rhythm | "Learning your daily patterns..." |
| Social Battery & Community | "Understanding your lifestyle..." |

**Progress Bar:** width 160px, height 4px, Forest fill, transition 0.35s

---

### 5.4 Part Transition 화면 (2개)

**위치:** Q12 완료 후 (→ Part 2), Q20 완료 후 (→ Part 3)

| 요소 | 내용 |
|------|------|
| 완료 배지 | Meadow 원형 + check 아이콘 + "Part N of 3 complete" |
| 제목 | Transition별 타이틀 (아래 참고) |
| 설명 | 다음 파트 성격 설명 |
| Next Part 미리보기 카드 | Forest 아이콘 + 다음 파트 레이블 |
| CTA | "Continue to [Part Name] →" Primary 버튼 |

**Transition 1 (Q12 → Q13):**
- 제목: "Now for the Reality Check"
- 설명: "Great foundation. Now let's make sure we can deliver on it. A few questions on your timeline, paperwork, and financial profile."

**Transition 2 (Q20 → Q21):**
- 제목: "Almost there — Day-to-Day Reality"
- 설명: "Last stretch. These final questions dial in the small details that separate a fine apartment from your actual home."

---

## 6. 질문 전체 목록 (29문항)

### Part 1 · Vibe & Space

| # | Key | 카테고리 | 질문 | 입력 타입 |
|---|-----|----------|------|-----------|
| 1 | `occupants` | The Squad & The Zoo | "Who's joining you on this adventure?" | radio |
| 2 | `pets` | The Squad & The Zoo | "Any furry, feathered, or scaly roommates?" | radio_cond |
| 3 | `wfhStyle` | The Footprint | "How do you use your space?" | radio |
| 4 | `bedrooms` | The Footprint | "Based on that, how many bedrooms are we hunting for?" | pills |
| 5 | `sqft` | The Footprint | "Square footage expectations?" | radio |
| 6 | `archStyle` | The Architecture | "What's your architectural aesthetic?" | radio |
| 7 | `slidingDoors` | The Architecture | "The Great Toronto Condo Debate: how do you feel about glass sliding doors for bedrooms?" | radio |
| 8 | `neighborhoods` | Your Turf | "Where is your turf? Name your top 3 target neighbourhoods." | neighborhoods |
| 9 | `transit` | Your Turf | "How allergic are you to a commute?" | radio |
| 10 | `amenities` | Your Turf | "Your 'Cheat Codes' for living — what are your must-have amenities?" | chips_fixed |
| 11 | `monthlyBudget` | The Bottom Line | "What is your absolute maximum monthly budget?" | slider |
| 12 | `dealbreakers` | The Bottom Line | "Any absolute dealbreakers we should avoid like the plague?" | textarea |

### Part 2 · Reality Check

| # | Key | 카테고리 | 질문 | 입력 타입 |
|---|-----|----------|------|-----------|
| 13 | `exitStrategy` | Timeline & Tactics | "Toronto landlords move fast. What's your current exit strategy?" | radio (flag) |
| 14 | `leaseDuration` | Timeline & Tactics | "How long are we dropping anchor?" | radio (flag) |
| 15 | `firstRodeo` | Timeline & Tactics | "Is this your first rodeo in the Toronto rental market?" | radio |
| 16 | `exclusivity` | Timeline & Tactics | "Are we exclusive?" | radio (flag) |
| 17 | `immigrationStatus` | The Paper Trail | "Status in Canada?" | radio_cond |
| 18 | `combinedSalary` | The Paper Trail | "Fueling the lifestyle: what is the combined total base salary of everyone on the lease?" | slider |
| 19 | `employmentStatus` | The Paper Trail | "The Career Check: are you currently on probation, starting a new job, or on a fixed-term contract?" | radio_cond (flag) |
| 20 | `creditScore` | The Paper Trail | "The Adulting Score: do you know your Canadian credit score?" | radio (flag) |

### Part 3 · Day-to-Day Reality

| # | Key | 카테고리 | 질문 | 입력 타입 |
|---|-----|----------|------|-----------|
| 21 | `sunlight` | Sensory & Environment | "What is your relationship with sunlight?" | radio |
| 22 | `noiseTolerance` | Sensory & Environment | "Rate your city noise tolerance." | radio |
| 23 | `thermostat` | Sensory & Environment | "The Thermostat Wars: how do you run?" | radio |
| 24 | `culinary` | Spatial Footprint | "What is your culinary persona?" | radio |
| 25 | `bulkyBaggage` | Spatial Footprint | "What bulky baggage is moving with you?" | chips_fixed (multi) |
| 26 | `deliveries` | Daily Rhythm | "How heavy is your delivery footprint?" | radio |
| 27 | `morningRoutine` | Daily Rhythm | "What's the most crucial part of your morning routine?" | radio |
| 28 | `saturdayVibe` | Social Battery & Community | "It's a Saturday night. What's the vibe?" | radio |
| 29 | `thirdSpace` | Social Battery & Community | "Besides home and work, where is your 'Third Space'?" | radio |

---

## 7. 입력 컴포넌트 명세

### 7.1 Radio (`type: "radio"`)

- 전체 너비 카드형 버튼, 높이 auto (padding 12px 16px)
- 선택 시: Forest 테두리 + Forest tint 배경 (`rgba(13,122,82,0.06)`)
- 라디오 원: 직경 20px, 선택 시 Forest fill + 흰색 내부 원 (8px)
- 옵션별 `hint` 있으면 Forest fg3 컬러 12px로 표시
- 선택 후 Flag 있으면 V2Flag 인라인 표시

### 7.2 Radio with Conditional (`type: "radio_cond"`)

라디오와 동일하나, 특정 옵션 선택 시 **인라인 서브 입력**이 펼쳐진다.

| condType | 트리거 조건 | 서브 입력 |
|----------|-------------|-----------|
| `dogDetails` | pets = "dog" | 견종 text input + 체중 3개 칩 (Under 25 lbs / 25–50 lbs / Over 50 lbs) |
| `visaExpiry` | immigrationStatus = "workpermit" or "studentvisa" | 만료일 text input (MM/YYYY) |
| `contractEndDate` | employmentStatus = "contract" | 계약 종료일 text input (MM/YYYY) |

서브 입력 컨테이너: Meadow 18% 배경 + Forest 15% 테두리, 8px 라운드, 내부 gap 10px

### 7.3 Pills (`type: "pills"`)

- 가로 wrap 배열, gap 10px
- 각 pill: padding 12px 20px, 10px 라운드, DM Sans 14px bold
- 선택 시 Forest 배경 + off-white 텍스트
- **단일 선택**

### 7.4 Neighborhoods (`type: "neighborhoods"`)

- 힌트: "Select up to 3"
- **최대 3개** 다중 선택 chip 컴포넌트
- 토론토 동네 목록 (21개): Roncesvalles, High Park, Junction, Leslieville, Riverdale, Kensington, Little Italy, Dundas West, Bloorcourt, Trinity Bellwoods, Parkdale, Corktown, Cabbagetown, Annex, Harbord Village, Ossington, King West, Liberty Village, Distillery District, Yorkville, Canary District
- **3개 선택 후 추가 탭 시 무시** — 이미 선택된 항목을 먼저 해제해야 다른 항목 선택 가능
- 3개 도달 시 비선택 chip에 `opacity: 0.4, cursor: not-allowed` 처리, 힌트 텍스트 "Deselect one to change"로 변경

### 7.5 Chips Fixed (`type: "chips_fixed"`)

- 고정된 옵션 목록, **다중 선택** 가능 (최대 제한 없음)
- 각 chip: 999px 라운드, 선택 시 Forest 배경 + check 아이콘

### 7.6 Slider (`type: "slider"`)

| 필드 | 값 |
|------|----|
| `monthlyBudget` | min $1,500 / max $6,000 / step $50 / fmt `$X,XXX/mo` |
| `combinedSalary` | min $30,000 / max $400,000 / step $5,000 / fmt `$XXXk/yr` |

- 카드형 컨테이너 (흰색, 12px 라운드, Forest border)
- 현재 값: Nunito 26px bold, 우상단 표시
- `<input type="range">` accentColor = Forest
- 최솟값·최댓값 레이블 하단 표시

### 7.7 Textarea (`type: "textarea"`)

- rows=4, 전체 너비, 10px 라운드
- placeholder: 해당 질문 맞춤 텍스트
- resize: none

---

## 8. Flag (경고 메시지) 시스템

특정 답변 선택 시 인라인 노란색 경고 박스 노출.

**스타일:** 배경 `#FFFBEC`, 테두리 `rgba(200,167,60,0.5)`, 텍스트 `#7A5C00`, 아이콘 ⚑

| 질문 | 트리거 답변 | 메시지 |
|------|-------------|--------|
| exitStrategy | `nonotice` | "Heads up — if you want to move next month, we need to talk about your current lease. Let's make sure you're not breaking it by mistake." |
| leaseDuration | `short` | "Short-term is incredibly difficult in the standard market. We may need furnished/serviced options — which are significantly pricier." |
| exclusivity | `shopping` | "Totally fine! To protect both of us, let's get a brief representation agreement signed before we start booking showings." |
| employmentStatus | `newjob` or `contract` | "This can make landlords nervous. Let's talk about whether a guarantor or extra upfront rent months would help." |
| creditScore | `under600` | "No worries — a guarantor or prepaying 2–3 months of rent is done all the time. Let's talk options." |
| pets (dog hint) | — | "Toronto condos can be strict — breed & weight matter!" (옵션 힌트로 표시) |

---

## 9. Reveal Flow

Q29 Next 클릭 → Generating 화면 → Reveal 3-slide 뷰

### 9.1 Generating 화면 (2.4초)

- 완성된 집 HouseProgress (current=29, total=29 → stage 12, Sun 표시)
- 헤드라인: "Your home is taking shape"
- 서브: "Putting your profile together…"
- 스피너: Forest 색 원형, `v2spin` 0.9s linear infinite

### 9.2 Slide 1 — Neighborhood Match

**데이터 소스:** `answers.neighborhoods[0]` (첫 번째 선택 동네 기준)

**점수 산출 방식:** 하드코딩된 Static JSON 기반. 5개 지표 (Transit, Parks, Quiet, Dining, Safety) 각 0–100 점수.

**Static JSON — 전체 21개 동네:**

```json
{
  "Roncesvalles":     { "transit": 80, "parks": 84, "quiet": 65, "dining": 78, "safety": 85 },
  "High Park":        { "transit": 72, "parks": 96, "quiet": 74, "dining": 58, "safety": 87 },
  "Junction":         { "transit": 74, "parks": 62, "quiet": 60, "dining": 72, "safety": 78 },
  "Leslieville":      { "transit": 76, "parks": 72, "quiet": 62, "dining": 85, "safety": 82 },
  "Riverdale":        { "transit": 78, "parks": 88, "quiet": 68, "dining": 70, "safety": 84 },
  "Kensington":       { "transit": 86, "parks": 55, "quiet": 30, "dining": 92, "safety": 68 },
  "Little Italy":     { "transit": 82, "parks": 60, "quiet": 52, "dining": 88, "safety": 76 },
  "Dundas West":      { "transit": 84, "parks": 58, "quiet": 50, "dining": 80, "safety": 74 },
  "Bloorcourt":       { "transit": 88, "parks": 62, "quiet": 55, "dining": 78, "safety": 78 },
  "Trinity Bellwoods":{ "transit": 82, "parks": 80, "quiet": 48, "dining": 90, "safety": 76 },
  "Parkdale":         { "transit": 80, "parks": 65, "quiet": 45, "dining": 74, "safety": 68 },
  "Corktown":         { "transit": 78, "parks": 65, "quiet": 52, "dining": 80, "safety": 80 },
  "Cabbagetown":      { "transit": 76, "parks": 70, "quiet": 68, "dining": 68, "safety": 82 },
  "Annex":            { "transit": 90, "parks": 76, "quiet": 58, "dining": 86, "safety": 84 },
  "Harbord Village":  { "transit": 84, "parks": 68, "quiet": 60, "dining": 82, "safety": 82 },
  "Ossington":        { "transit": 82, "parks": 56, "quiet": 40, "dining": 92, "safety": 74 },
  "King West":        { "transit": 88, "parks": 48, "quiet": 28, "dining": 95, "safety": 76 },
  "Liberty Village":  { "transit": 82, "parks": 62, "quiet": 42, "dining": 84, "safety": 80 },
  "Distillery District": { "transit": 75, "parks": 68, "quiet": 55, "dining": 86, "safety": 83 },
  "Yorkville":        { "transit": 92, "parks": 70, "quiet": 64, "dining": 94, "safety": 91 },
  "Canary District":  { "transit": 72, "parks": 88, "quiet": 68, "dining": 66, "safety": 87 }
}
```

> 위 목록에 없는 동네 입력 시 기본값 `{ transit:78, parks:68, quiet:55, dining:78, safety:80 }` 사용

**점수 산출 근거 (지표별 기준):**
- **Transit**: TTC 지하철 도보 접근성 + 버스·스트리트카 노선 빈도
- **Parks**: 녹지 면적 비율 + 주요 공원 (High Park, Riverdale Park, Trinity Bellwoods 등) 인접도
- **Quiet**: 주요 도로·나이트라이프 밀집도 반비례 (King/Queen 간선도로 인접 시 낮음)
- **Dining**: 레스토랑·카페·바 밀집도 (Kensington, Ossington, King West 최상위)
- **Safety**: 토론토 경찰청 공개 범죄 통계 (2023–2024) 기준 상대 점수

점수 바: 높이 34px, Forest fill, width transition 0.7s ease, 값 우측 흰색 텍스트

### 9.3 Slide 2 — Budget Reality Check

**데이터 소스:** `answers.monthlyBudget`, `answers.bedrooms`

| 침실 타입 | 타입명 | 면적 |
|----------|--------|------|
| studio | Studio | ~420 sq ft |
| 1b | 1 Bedroom | ~580 sq ft |
| 1b1d | 1 Bed + Den | ~680 sq ft |
| 2b | 2 Bedrooms | ~850 sq ft |
| 3b | 3+ Bedrooms | ~1,100 sq ft |

표시 항목: Type, Size, Parking (`budget ≥ $3,000` → "Likely included" / 이하 → "Not included"), Lockers ("1 Included")

### 9.4 Slide 3 — Teaser Listing + Sign Up CTA

**목적:** 매칭된 매물 결과를 blur 처리로 보여주고 Sign Up 전환 유도

구성 (위에서 아래):
1. **레이블:** "Your ideal layout made by AI" (Forest, 12px bold)
2. **AI 플로어플랜 이미지:** `assets/layout.jpg`, blur(2px) + scale(1.08) + Forest 52% 오버레이 + 잠금 메시지
3. **Mock 매물 리스트 (4개):** blur(3px) + 하단 흰색 그라디언트로 가림
4. **에이전트 설명 카드:** Meadow 배경, "Your real estate agent + AI are on it"
5. **CTA:** "Sign up to unlock matches!" (Forest, full-width, 48px) → 클릭 시 **Success 화면**으로 이동

**Mock 매물 가격 계산:**
```
price = round((budget * multiplier) / 50) * 50  (최소 $1,500)
multipliers: [0.91, 0.86, 0.80, 1.04]
```

### 9.5 Reveal 슬라이드 네비게이션

하단 고정 바:
- 왼쪽 화살표 버튼 (38px 원형): 첫 슬라이드에선 비활성 (회색)
- 중앙 슬라이드명 버튼 (flex 1, 44px): 현재 슬라이드 레이블 표시 (Deep 배경)
- 오른쪽 화살표 버튼: 마지막 슬라이드에선 숨김 (CTA가 슬라이드 내부에 있음)

### 9.6 Success 화면 (Sign Up CTA 클릭 후)

**목적:** 에이전트 Admin Dashboard 구축 전까지의 임시 완료 화면. 클라이언트에게 요청이 접수되었음을 안내한다.

**트리거:** Slide 3의 "Sign up to unlock matches!" 버튼 클릭 + 백엔드 제출 성공 응답

**레이아웃:**

```
┌─────────────────────────────┐
│ [상태바]                    │
│                             │
│  [완성된 집 HouseProgress]  │  ← stage 12, Sun 표시
│                             │
│  ✓ (Meadow 원형 + check)   │
│                             │
│  "Request sent              │
│   successfully!"            │  ← Nunito 24px bold, Deep
│                             │
│  "Your agent will review    │
│   your profile and reach    │
│   out within 24 hours.      │
│   Please wait for           │
│   confirmation."            │  ← DM Sans 14px, fg2, lineHeight 1.6
│                             │
│  [에이전트 카드]             │  ← "Your agent: Maya" (이름 파라미터)
│                             │
└─────────────────────────────┘
```

**에이전트 카드:**
- Meadow 배경, 10px 라운드
- Forest 아이콘(home) + "Your agent: Jane" Nunito 14px bold (하드코딩)
- 하단: "Questions? She'll be in touch soon." DM Sans 12px fg3

**로딩 상태 (제출 중):**
- CTA 클릭 시 버튼 내부 스피너 표시 (Forest 원형 회전)
- 버튼 텍스트: "Sending…" + disabled 처리
- 성공 응답 수신 후 Success 화면으로 전환

**오류 상태 (제출 실패):**
- 버튼 원복 (재시도 가능)
- 버튼 아래 인라인 에러 메시지: "Something went wrong. Please try again." (danger 컬러 `#BA1A1A`)

---

## 10. 데이터 모델

### 10.1 Answer Schema

모든 단일 선택 필드는 **null 허용 안 함** (프론트엔드 + 백엔드 양쪽 검증). 슬라이더는 항상 기본값을 가지므로 null 불가. 멀티 선택 및 자유 텍스트만 빈 값 허용.

```typescript
// ── 필수 (Required) — null 불가 ──────────────────────────────
interface OnboardingV2Required {
  // Part 1
  occupants:        "solo" | "partner" | "roommate" | "family";
  pets:             "none" | "dog" | "cat" | "other";
  wfhStyle:         "office" | "desk" | "commute";
  bedrooms:         "studio" | "1b" | "1b1d" | "2b" | "3b";
  sqft:             "small" | "medium" | "large";
  archStyle:        "modern" | "character" | "townhouse" | "loft";
  slidingDoors:     "love" | "hate" | "whatever";
  neighborhoods:    string[];   // 최소 1개 이상 필수, max 3
  transit:          "subway" | "bus" | "drive";
  monthlyBudget:    number;     // 1500–6000, default 2500 (slider → 항상 값 존재)

  // Part 2
  exitStrategy:     "notice60" | "m2m" | "nonotice";
  leaseDuration:    "1yr" | "short";
  firstRodeo:       "yes" | "no";
  exclusivity:      "exclusive" | "shopping";
  immigrationStatus:"citizen" | "workpermit" | "studentvisa";
  combinedSalary:   number;     // 30000–400000, default 80000 (slider → 항상 값 존재)
  employmentStatus: "permanent" | "newjob" | "contract";
  creditScore:      "700plus" | "600to699" | "under600";

  // Part 3
  sunlight:         "dark" | "south" | "east";
  noiseTolerance:   "silent" | "normal" | "loud";
  thermostat:       "hot" | "cold" | "neutral";
  culinary:         "chef" | "assembler" | "ubereats";
  deliveries:       "daily" | "occasional" | "rarely";
  morningRoutine:   "shower" | "coffee" | "gym" | "out";
  saturdayVibe:     "host" | "out" | "recharge";
  thirdSpace:       "gym" | "parks" | "bars" | "cafes";
}

// ── 조건부 필수 (Conditionally Required) ────────────────────
interface OnboardingV2Conditional {
  petBreed:         string;   // required when pets = "dog"
  petWeight:        "Under 25 lbs" | "25–50 lbs" | "Over 50 lbs";
                              // required when pets = "dog"
  visaExpiry:       string;   // MM/YYYY, required when immigrationStatus ∈ ["workpermit","studentvisa"]
  contractEndDate:  string;   // MM/YYYY, required when employmentStatus = "contract"
}

// ── 선택 (Optional) — 빈 값 허용 ────────────────────────────
interface OnboardingV2Optional {
  amenities:    ("gym" | "concierge" | "pool" | "rooftop" | "cowork")[];  // 빈 배열 허용
  dealbreakers: string;       // 빈 문자열 허용 (textarea)
  bulkyBaggage: ("light" | "bike" | "sports" | "wardrobe")[];             // 빈 배열 허용
}

type OnboardingV2Answers = OnboardingV2Required & OnboardingV2Conditional & OnboardingV2Optional;
```

### 10.2 Screen State

```typescript
interface OnboardingV2State {
  screenIdx: number;   // -1=welcome, 0–30=SCREENS[], 31=reveal
  answers: OnboardingV2Answers;
}
```

### 10.3 SCREENS 배열 구조 (31개)

```
index 0–11  : 질문 Q1–Q12 (type: "question")
index 12    : Part Transition 1→2 (type: "transition")
index 13–20 : 질문 Q13–Q20 (type: "question")
index 21    : Part Transition 2→3 (type: "transition")
index 22–30 : 질문 Q21–Q29 (type: "question")
```

---

## 11. 애니메이션

| 이름 | 대상 | 사양 |
|------|------|------|
| `v2QIn` | 질문 화면 전환 | `opacity 0→1, translateY 10px→0`, 0.28s ease-out |
| `v2SunPop` | Reveal 완성 시 Sun 등장 | `opacity 0→1, scale 0.3→1`, 0.5s ease-out, transform-origin: Sun 중심 |
| `v2spin` | Generating 스피너 | 360° 회전, 0.9s linear infinite |
| HouseProgress 요소 | 각 stage 요소 | `opacity 0→1`, 0.4s |
| Progress bar fill | 답변 진행 | `width`, 0.35s |
| 점수 바 (Reveal) | Neighborhood match | `width`, 0.7s ease |

---

## 12. 디자인 토큰

`assets/colors_and_type.css` 에 정의. 주요 토큰:

| 토큰 | 값 | 용도 |
|------|----|------|
| `--unada-forest` / `U.forest` | `#0D7A52` | CTA, 선택 상태, 아이콘 |
| `--unada-sun` / `U.sun` | `#F2C94C` | 마지막 CTA ("Generate") |
| `--unada-deep` / `U.deep` | `#0D2B1E` | 헤드라인, 주요 텍스트 |
| `--unada-meadow` / `U.meadow` | `#A8D4BE` | 카테고리 칩, 완료 배지, 지붕 fill |
| `--unada-pale-sun` / `U.paleSun` | `#FAECC8` | 창문/문 fill |
| `--unada-off-white` / `U.off` | `#F7F4EE` | 페이지 배경, 선택된 버튼 텍스트 |
| `U.fg2` | `#3A4A42` | 보조 텍스트 |
| `U.fg3` | `#6B7A73` | 힌트, 메타 정보 |
| `U.border` | `rgba(13,43,30,0.12)` | 기본 테두리 |

**폰트:**
- Display / 제목: **Nunito** (700, 800)
- Body / UI: **DM Sans** (400, 500, 600, 700)

**핵심 치수:**
- 폰 프레임: width 420px, minHeight 820px, borderRadius 32px
- 상태바: 38px
- Footer Zone: 90px (padding 14px top + 28px bottom + 버튼 52px)

---

## 13. 비기능 요구사항

### 13.1 성능
- 첫 번째 질문 화면 렌더 < 1.5초 (모바일 4G 기준)
- 화면 전환 애니메이션 60fps 유지
- 이미지 (layout.jpg): 최대 200KB, WebP 우선

### 13.2 접근성
- 모든 인터랙티브 요소 키보드 접근 가능 (Tab / Enter / Space)
- 라디오 카드는 실제 `button` 또는 `role="radio"` 명시
- 색상 대비 AA 준수 (Forest on White: 5.1:1 이상)
- Slider에 `aria-label`, `aria-valuenow` 포함

### 13.3 모바일 최적화
- Viewport: `device-width`, `initial-scale=1`
- 터치 타겟 최소 44×44px
- Scroll Zone은 `-webkit-overflow-scrolling: touch`
- 키보드 올라올 때 Footer Zone이 가려지지 않도록 `position: fixed` 처리 또는 `env(safe-area-inset-bottom)` 적용

### 13.4 데이터 저장

**저장 전략: 파트 완료마다 저장 + 최종 제출**

| 시점 | 트리거 | status 값 | 저장 범위 |
|------|--------|-----------|-----------|
| Part 1 완료 | Part Transition 1 화면 진입 시 | `"partial_1"` | Q1–Q12 answers |
| Part 2 완료 | Part Transition 2 화면 진입 시 | `"partial_2"` | Q1–Q20 answers |
| 최종 제출 | Sign Up CTA 클릭 성공 응답 시 | `"complete"` | 전체 answers |

**중복 제출 처리:** 동일 토큰으로 재요청 시 기존 레코드를 **덮어씀(upsert)**. 버전 관리 없이 최신 데이터만 유지.

**브라우저 임시 저장:**
- 각 파트 저장 성공 후 `localStorage`에도 동일 데이터 기록 (key: `unada_onboarding_<token>`)
- 링크 재접속 시 `localStorage` 유무 확인 → 있으면 이어 풀기 화면 제공 (MVP 이후 구현)

**API 명세:**

```
PATCH /api/v1/onboarding/answers

Headers:
  Authorization: Bearer <onboarding_token>
  Content-Type: application/json

Body:
{
  "status": "partial_1" | "partial_2" | "complete",
  "savedAt": "ISO8601",
  "answers": { ...OnboardingV2Answers }
}

Response 200:
{
  "leadId": "string",
  "agentName": "string"
}

Response 401: 토큰 만료 또는 유효하지 않음
Response 422: 유효성 검증 실패 (필드별 오류 목록 반환)
```

### 13.5 언어
- **영어 단일 운영** — 다국어 지원 없음
- 모든 UI 텍스트, 질문, 힌트, 에러 메시지, Flag 메시지 전부 영어
- i18n 라이브러리 도입 불필요

### 13.6 브라우저 지원
- iOS Safari 16+
- Android Chrome 112+
- 데스크탑 Chrome / Safari / Firefox (현재 프로토타입은 420px 고정 폰 프레임)

---

## 14. 미결 사항 (Open Questions)

| # | 질문 | 상태 | 결정 |
|---|------|------|------|
| ~~OQ-1~~ | ~~Neighborhoods 3개 선택 후 추가 탭 시 UX~~ | **확정** | 무시 처리. 3개 도달 후 비선택 chip 비활성화, 해제 후 선택 가능 (섹션 7.4) |
| ~~OQ-2~~ | ~~답변 없이 Next 진행 허용 여부~~ | **확정** | 프론트 + 백엔드 모두 null 불허, Next 버튼 비활성화 (섹션 16) |
| ~~OQ-3~~ | ~~Sign Up CTA 후 플로우~~ | **확정** | 계정 생성 없이 Success 안내 페이지로 이동 (섹션 9.6) |
| ~~OQ-4~~ | ~~중간 저장 필요 여부~~ | **확정** | 파트 완료마다 저장 (섹션 13.4), 이어 풀기는 MVP 이후 |
| ~~OQ-5~~ | ~~Reveal 동네 점수 데이터 소스~~ | **확정** | 21개 동네 Static JSON 하드코딩 (섹션 9.2). 실제 데이터 API 연동은 추후 과제 |
| ~~OQ-6~~ | ~~에이전트명 파라미터 주입 방식~~ | **확정** | 에이전트는 Jane 단독. agentName = "Jane" 하드코딩, 파라미터화 불필요 (섹션 3) |
| ~~OQ-7~~ | ~~다국어 지원 계획~~ | **확정** | 영어 단일 운영, i18n 불필요 (섹션 13.5) |

---

## 15. 개발 단계 제안

| 스프린트 | 범위 | 비고 |
|---------|------|------|
| Sprint 1 | Welcome (개인정보 동의 포함) + 29문항 (HouseProgress, 모든 입력 컴포넌트, Flag, 프론트엔드 validation) | |
| Sprint 2 | Part Transition, Reveal 3슬라이드, Success 화면, 애니메이션 polish | |
| Sprint 3 | 백엔드 연동: 토큰 인증, 파트별 저장 API (PATCH), 최종 제출, 백엔드 validation | |
| Sprint 4 | 접근성 감사, 성능 최적화, QA | |
| Sprint 5 *(다음 분기)* | 에이전트 Admin Dashboard (리드 상태 조회, 답변 열람, 알림) | 이번 범위 제외 |

---

## 16. 유효성 검증 규칙

### 16.1 프론트엔드 (클라이언트 측)

**Next 버튼 활성화 조건 (질문 화면):**
- `radio` / `pills`: 선택값 존재 (non-null)
- `radio_cond`: 메인 선택값 존재 + 조건부 서브 입력 완료 (해당 시)
- `neighborhoods`: 배열 길이 ≥ 1
- `slider`: 항상 활성 (기본값 존재)
- `textarea`: 항상 활성 (빈 문자열 허용)
- `chips_fixed`: 항상 활성 (빈 배열 허용)

**비활성 버튼 스타일:** 불투명도 40%, cursor not-allowed

**조건부 서브 입력 검증:**
- `pets = "dog"` → petWeight 선택 전까지 Next 비활성
- `immigrationStatus ∈ ["workpermit","studentvisa"]` → visaExpiry 입력 전까지 Next 비활성
- `employmentStatus = "contract"` → contractEndDate 입력 전까지 Next 비활성

**Welcome 화면:** 개인정보 동의 체크 전까지 CTA 비활성

### 16.2 백엔드 (서버 측)

`status: "complete"` 요청 시 전체 필드 검증. `status: "partial_*"` 시 해당 파트 필드만 검증.

| 규칙 | 대상 필드 | 오류 코드 |
|------|-----------|-----------|
| non-null | 모든 Required 필드 | `FIELD_REQUIRED` |
| enum 값 일치 | 모든 단일 선택 필드 | `INVALID_VALUE` |
| 범위 | monthlyBudget (1500–6000), combinedSalary (30000–400000) | `OUT_OF_RANGE` |
| 길이 | neighborhoods (1–3개) | `INVALID_LENGTH` |
| 형식 | visaExpiry, contractEndDate (MM/YYYY, 미래 날짜) | `INVALID_FORMAT` |
| 조건부 | pets=dog → petWeight 필수 | `CONDITIONAL_REQUIRED` |

오류 응답 형식:
```json
{
  "errors": [
    { "field": "occupants", "code": "FIELD_REQUIRED", "message": "Answer is required." },
    { "field": "neighborhoods", "code": "INVALID_LENGTH", "message": "Select at least 1 neighbourhood." }
  ]
}
```
