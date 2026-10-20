# AlgoMotion 2 · 2~4단계 구현 계획: 남은 72문제

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. 이 계획은 유형별 작업 묶음을 여러 작업자가 동시에(각자 git worktree에서) 진행하도록 쓰였다. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1단계에서 만든 엔진과 화면 위에 남은 72문제(아주 자주 38, 자주 22, 가끔 12)를 문제마다 정석·대안·함정 세 풀이 시각화와 함께 채운다.

**Architecture:** 엔진, 화면, 목록(`src/catalog.ts`)은 이미 있다. 문제 하나는 `src/problems/<유형 id>/<문제 id>.ts` 파일 하나이고, 유형별 `index.ts`에 등록하면 목록이 자동으로 '준비 중'에서 열 수 있는 문제로 바뀐다. 작업자는 유형 하나를 맡아 그 폴더 안에서만 일한다.

**Tech Stack:** 1단계와 같음 (TypeScript, Node 25 내장 테스트, python3).

**Spec:** `docs/superpowers/specs/2026-10-20-algomotion-problem-bank-design.md` (특히 4.1, 5-5~5-11, 6.5, 7장). 1단계 계획: `docs/superpowers/plans/2026-10-20-algomotion-phase1-engine-and-screens.md`.

**본보기 문제 파일(먼저 읽을 것):** `src/problems/dfs-bfs/game-map.ts`(격자·큐·DFS 되돌아가기), `src/problems/binary-search/immigration.ts`(수직선·힙·빨리 감기), `src/problems/stack-queue/feature-development.ts`(카드 줄·오답형 함정), `src/problems/dp/integer-triangle.ts`(삼각형 DP·재귀 호출 수).

## Global Constraints

- 엔진, 화면, 스타일 파일(`src/engine/**`, `src/components/**`, `src/styles/**`, `src/catalog.ts`, `src/problems/shared.ts`, `src/problems/registry.ts`, `tests/**`)은 고치지 않는다. 있는 물체 종류(cell, token, text, bar, zone, ring, line)와 색(plain, wall, current, queued, visited, path, trail, explored, chosen, good, bad, muted), 동작(focus, unfocus, set, add, remove, arrow, clearMarks, trace, wait)만으로 그린다. 정말 모자라면 만들지 말고 보고서에 적는다.
- 고칠 수 있는 파일은 맡은 유형 폴더 `src/problems/<유형 id>/` 안의 파일뿐이다. 새 문제는 같은 폴더의 `index.ts`에 한 줄로 등록한다.
- 새 의존성 금지. 문제 파일은 Node가 바로 불러오므로 JSX 없음, 상대 경로 import에 `.ts`, 타입은 `import type`.
- 문제 정보(id, 제목, 레벨, 유형, 원문 주소)는 `src/catalog.ts`의 해당 줄과 같아야 한다. 정석 풀이 이름은 목록의 '정석' 이름과 뜻이 맞아야 한다.
- 지문은 우리 말로 요약하고(원문 문장 복사 금지), 입출력 예는 원문 그대로 쓴다. 원문은 `https://school.programmers.co.kr/learn/courses/30/lessons/<번호>`에서 확인한다. 가져올 수 없으면 보고서에 적는다.
- 움직임 규칙(spec 4.1): 마디 안의 동작은 한 번에 하나씩, `together`는 같은 뜻의 동작만. 흔들림, +1, 작은 점 금지. 살필 때는 `focus`로 상관없는 칸을 흐리게 하고 `arrow`와 판정 표시로 보여 준다.
- 속도(1×): 한 가지 일을 하는 마디 0.5~1초, 살피는 마디 1.5초까지, 단계 2~3.5초. 자막은 글자당 20ms 이상 보이게(필요하면 마지막에 `wait`).
- 단계 수: 정석 8~25, 함정 40 이하. 같은 일이 길게 반복되면 '빨리 감기' 단계 하나로 묶고 work만 올린다.
- 그림, 자막, 하이라이트 줄, 변수 칸은 매 단계 서로 맞아야 한다. 변수는 '단계가 끝났을 때의 값'이다. 아무것도 실행하지 않는 마디는 실제로 도는 줄만 하이라이트한다.
- 숫자 뒤 조사는 `josa()`/`ro()`, 숫자가 아닌 말 뒤 조사는 직접 쓴다.
- 물체는 장면 안에 있고 칸(cell)끼리, 토큰끼리 겹치지 않는다(자동 점검). 글자는 칸 폭을 넘지 않게 넉넉히 잡는다(한글 한 자 ≈ 글자 크기, 숫자·영문 ≈ 0.6배).
- 문제마다 커밋 하나: `feat(problems): <제목> 세 풀이 시각화` (+ 자기 하네스의 Co-Authored-By 줄).

## 문제 하나를 만드는 순서 (작업자가 문제마다 반복)

- [ ] **1. 원문 확인:** 제목, 레벨, 제한 사항, 입출력 예를 원문에서 확인한다.
- [ ] **2. 세 풀이 정하기:**
  - **정석:** 목록의 정석 이름대로 시험에서 쓸 풀이.
  - **대안:** 맞지만 손해를 보거나 덜 일반적인 풀이.
  - **함정:** 자주 떠올리지만 틀리는 풀이(`trap: 'wrong'`) 또는 시간 초과가 나는 풀이(`trap: 'slow'`).
  - 세 풀이 모두 Python과 JavaScript로 같은 알고리즘을 쓴다. JavaScript 큐는 `shift()` 대신 머리 인덱스를 쓴다.
- [ ] **3. 시각화 입력과 한 일의 양 정하기:**
  - `demo.input`은 세 풀이가 함께 쓰는 입력이다. 정석이 8~25단계가 되고 함정이 드러나는 가장 작은 입력을 고른다. 오답형이면 오답이 나는 입력이어야 한다.
  - `workUnit`은 세 풀이를 같은 잣대로 세는 단위다.
- [ ] **4. 점검 사례:**
  - `checks.cases`에는 원문 입출력 예 전부와 경계 사례 2개 이상, 시각화 입력을 넣는다.
  - `checks.random(rand)`는 작은 무작위 입력을 만든다. 느린 함정도 순식간에 끝나는 크기로 잡는다.
- [ ] **5. 파일 쓰기:**
  - `src/problems/<유형>/<id>.ts`에 본보기처럼 쓴다: 장면 만드는 함수 하나를 세 풀이가 함께 쓰고, `StepRecorder`/`Lane`, `lines()`/`at()` 하이라이트 표, `meta()`를 쓴다.
  - 그 폴더의 `index.ts`에 한 줄을 등록한다.
- [ ] **6. 점검:** `npm run check`(전체), `npx tsc -b`, `npx oxlint`가 모두 깨끗해야 한다. 각 풀이의 단계 제목, 마디, 자막, work, 변수를 출력해 우리말과 숫자를 한 번 읽어 본다.
- [ ] **7. 커밋:** 문제 하나에 커밋 하나.

---

### Task P0: 유형별 등록 파일과 자동 점검 보강 (동시 작업 전에 먼저)

**Files:**
- Create: `src/problems/<유형 id>/index.ts` 11개 — 각각 `export const loaders: Record<string, () => Promise<Problem>>`. 지금 있는 4문제는 각 유형 파일로 옮기고, 나머지 유형은 빈 객체로 둔다.
- Modify: `src/problems/registry.ts` — 11개 유형의 `loaders`를 펼쳐 합친 `LOADERS`. 바깥 모양(`LOADERS`)은 그대로다.
- Modify: `tests/problems.test.ts` — 아래 점검을 더한다.
  - 단계와 마디의 하이라이트가 비어 있지 않음(언어마다 1줄 이상).
  - `initial`과 모든 단계 장면에서 모든 물체(line은 모든 점)가 장면 크기 안에 있음(0.5px 허용).
  - 같은 장면 안의 `cell`끼리, `token`끼리 사각형이 겹치지 않음(맞닿는 것은 허용).
  - 결과 단계와 answer 단언 메시지에 풀이 id를 붙임.

- [ ] **Step 1:** 테스트를 먼저 더하고, 기존 4문제에 대해 PASS하는지 본다(실패하면 그 문제의 장면을 고친다).
- [ ] **Step 2:** 등록 파일을 나눈다. `npm run check`, `npx tsc -b`가 깨끗하고 홈에서 4문제가 그대로 열린다.
- [ ] **Step 3:** 커밋한다: `refactor(problems): 유형별 등록 파일과 장면 자동 점검`

---

### 작업 묶음 (유형 하나 = 작업자 하나, 각자 worktree)

문제 목록, 순서, 제목, 레벨, 번호, 정석 이름은 `src/catalog.ts`가 기준이다. 표의 수는 새로 만들 문제 수다.

| 묶음 | 유형 id | 새 문제 | 비고 |
| --- | --- | --- | --- |
| W1 | dfs-bfs | 9 | game-map 제외. 그래프(점·선)는 cell + line으로 그린다 |
| W2 | brute-force | 10 | 재귀·결정 나무는 cell(마디) + line(가지)로 그린다 |
| W3 | dp | 9 | integer-triangle 제외. 1·2차원 표는 cell 격자 |
| W4 | greedy | 10 | 구간은 zone/bar, 정렬된 줄은 cell 또는 token |
| W5 | hash | 6 | 키 → 값 표는 cell 두 줄이나 token |
| W6 | stack-queue | 5 | feature-development 제외 |
| W7 | binary-search | 5 | immigration 제외 |
| W8 | sort | 6 | |
| W9 | heap | 4 | 힙은 Lane(정렬된 줄)이나 나무로 그린다 |
| W10 | graph | 4 | |
| W11 | two-pointer | 4 | |

**진행 방식:**
- W1~W4(아주 자주)를 먼저 동시에 돌린다. 하나가 끝날 때마다 W5부터 차례로 다음 묶음을 시작해, 동시에 도는 작업자를 4개 안팎으로 유지한다.
- 묶음이 끝나면 검토자 한 명이 그 묶음 전체를 본다. 점검 결과와 함께, 문제마다 그림·코드·변수가 맞는지 표본을 확인한다. 고칠 것이 있으면 그 작업자에게 돌려보낸다.
- 검토를 통과한 묶음은 작업 브랜치에 합친다. 묶음끼리 겹치는 파일이 없으므로 충돌하지 않는다.

**작업자에게 맡기는 것:** 문제마다 세 풀이 고르기, 시각화 입력, 마디 이름, 한 일의 양 단위, 장면 구성.

---

### 마무리 (모든 묶음이 합쳐진 뒤)

- [ ] 1단계 Task 11 뒷부분: 쓰지 않는 옛 CSS를 정리하고, 반응형(1440×900, 1024×768, 768×1024, 375×812)을 확인하고, 미뤄 둔 작은 지적(진행 막대 색, 경주 '끝!' 도장 위치, README 문구)을 고친다.
- [ ] 전체 브랜치 검토 → 미리보기 다시 올리기 → main에 합칠지 사용자에게 묻기.
