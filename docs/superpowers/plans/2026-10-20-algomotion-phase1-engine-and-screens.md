# AlgoMotion 2 · 1단계 구현 계획: 움직임 엔진, 새 화면, 기존 4문제 옮기기

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 마디 단위로 움직이는 새 엔진과 홈·옆 메뉴·풀이 탭·나란히 비교 화면을 만들고, 지금 있는 4문제의 세 풀이(시각화 12개)를 새 구조로 옮긴다.

**Architecture:** 장면(`Scene`)은 id가 붙은 물체(`Item`)의 목록이다. 문제 파일의 생성기가 `StepRecorder`에 동작(`Action`)을 기록하면, 기록기는 같은 동작을 장면에도 적용해 단계마다 '끝난 장면'을 찍어 둔다. 그래서 연출과 끝난 장면이 어긋나지 않는다. 화면 쪽에서는 React 밖의 `Stage`가 DOM을 직접 다룬다. 풀이 탭에서는 한 단계를 마디별로 연출하고(Web Animations API), 나란히 비교에서는 끝난 장면 사이를 CSS 전환으로 잇는다. React는 페이지, 재생 상태, 코드 칸만 맡는다.

**Tech Stack:** React 19, TypeScript 7(`erasableSyntaxOnly`, `verbatimModuleSyntax`, `allowImportingTsExtensions`), Vite 8, CSS 토큰, lucide-react, canvas-confetti, Node 25 내장 테스트(`node --test`, .ts를 바로 실행), python3 3.14

**Spec:** `docs/superpowers/specs/2026-10-20-algomotion-problem-bank-design.md`. 이 계획은 spec 8장의 1단계만 다룬다.

**참고 시안:** `.superpowers/brainstorm/26616-1792446844/content/`의 `motion-feel-v2.html`(움직임), `approach-view.html`(풀이 탭·나란히 비교), `catalog.html`(홈·옆 메뉴). 물체 크기, 색, 움직임 시간은 이 파일들의 CSS와 스크립트를 기준으로 삼는다.

**git:** 이 폴더는 아직 git 저장소가 아니다. Task 0에서 저장소를 만들기로 했을 때만 각 작업의 커밋 단계를 실행한다.

## Global Constraints

- 새 런타임 의존성을 넣지 않는다(spec 5-9). 테스트도 `node:test`와 `node:assert/strict`만 쓴다.
- Node가 직접 불러오는 파일(`src/engine/` 중 `stage.ts`를 뺀 전부, `src/problems/**`, `src/catalog.ts`, `src/progress.ts`, `src/route.ts`, `tests/**`)은 JSX 없는 `.ts`로 쓴다. 상대 경로 import에는 `.ts` 확장자를 붙이고, 타입만 가져올 때는 `import type`을 쓴다. 이 파일들은 React나 CSS를 import하지 않는다.
- 색은 `src/styles/index.css` 맨 위의 토큰만 쓴다. 상태색은 노랑=지금, 파랑=대기, 초록=끝남, 분홍=정답, 연노랑=DFS가 밟고 있는 길, 회색=되돌아온 곳이다.
- 움직임 규칙(spec 4.1)
  - 마디 안의 동작은 한 번에 하나씩 일어난다. `together`로 묶는 것은 같은 뜻의 동작뿐이다(예: 앞 토큰을 꺼낼 때 나머지가 한 칸씩 당겨지는 것).
  - 흔들림, +1 떠오르기, 작은 점 효과는 쓰지 않는다.
  - 크기는 격자 칸 54px, 칸 숫자 18px, 자막 16px 이상(배율 1 기준)이다.
- 시간은 1× 기준이다. 동작 길이는 timeline.ts의 `DUR`, 결과 단계는 끝난 뒤 1.2초 더 머문다. 속도는 0.5×, 1×, 1.5×, 2×다.
- 단계 수는 정석 8~25(안팎), 함정 40 이하다(spec 5-11).
- 자막과 화면 글은 우리말로 쓴다. 숫자 뒤 조사는 `josa()`와 `ro()`로 붙인다(spec 7).
- 문제 지문은 우리 말로 요약하고, 입출력 예는 원문 그대로 쓴다(spec 3).
- localStorage를 읽고 쓰는 곳은 모두 try/catch로 감싼다(spec 5-4).
- 주소는 홈 `#/`, 문제 `#/p/<id>`다(spec 5-3).
- 화면 폭은 1280px 이상이면 3칸, 900~1279px이면 옆 메뉴가 서랍, 900px 미만이면 한 줄이다(spec 5-1).

## Review Focus

1. **연출 도중 연타(다음, 이전, 타임라인, 탭, 속도):** 진행 중인 연출이 멈추고 해당 단계의 끝난 장면에 정확히 놓여야 한다. 화살표, 판정 표시, 날아가던 토큰이 남으면 안 된다. 담당은 Task 5(재생 상태 기계 테스트, 브라우저 확인).
2. **연출 도중 다른 문제나 홈으로 이동:** 타이머와 애니메이션이 정리되고 콘솔 오류가 없어야 한다. 담당은 Task 10(브라우저 확인).
3. **localStorage가 막혀 예외를 던짐:** 홈과 문제 화면은 정상으로 돌고, 봤음 표시만 없어야 한다. 담당은 Task 10(progress 테스트).
4. **없는 문제 id나 준비 중인 문제의 주소:** '문제를 찾을 수 없습니다' 또는 '아직 준비 중인 문제입니다' 안내와 홈 링크를 보여야 한다. 담당은 Task 10(route 테스트, 브라우저 확인).
5. **휴대폰 폭(375px):** 가로 스크롤이 없어야 하고, 무대는 줄어들어 맞고, 나란히 비교 판은 위아래로 쌓이고, 옆 메뉴는 버튼으로 열려야 한다. 담당은 Task 11(브라우저 확인).

---

## 파일 구조

| 파일 | 맡는 일 |
| --- | --- |
| `src/engine/model.ts` | 장면, 동작, 단계, 풀이, 문제, 유형 타입 |
| `src/engine/recorder.ts` | `StepRecorder`: 동작을 장면에 적용하면서 단계를 기록 |
| `src/engine/layout.ts` | 격자, 칸 줄, 수직선, 삼각형 자리 계산 |
| `src/engine/lane.ts` | `Lane`: 큐·힙·스택 토큰 줄(기록기 위에서 동작) |
| `src/engine/timeline.ts` | 마디·동작의 시작 시각과 길이, 마디 표시줄 이름 |
| `src/engine/player.ts` | `playerReducer`: 재생 상태 기계 |
| `src/engine/stage.ts` | `Stage`: DOM 무대(render, tween, play, cancel) |
| `src/styles/stage.css` | 무대 물체 모양과 상태색 |
| `src/problems/shared.ts` | `at`, `josa`, `ro`, `fmt`, `sum` |
| `src/problems/registry.ts` | 문제 id → 동적 import |
| `src/problems/<유형>/<문제>.ts` | 문제 하나(설명, 세 풀이, 시각화, 점검 사례) |
| `src/catalog.ts` | 11개 유형, 76문제 목록 |
| `src/progress.ts` | 봤음, 이어 보기 저장 |
| `src/route.ts` | 해시 주소 해석 |
| `src/components/StageView.tsx` | Stage를 React에 붙이는 껍데기와 배율 맞추기 |
| `src/components/Player.tsx` | 마디 표시줄, 무대, 자막, 진행 막대, 조작, 단축키 |
| `src/components/RaceView.tsx` | 나란히 비교 |
| `src/components/CompareBars.tsx` | 한눈에 비교 막대 |
| `src/components/ApproachTabs.tsx` | 풀이 탭과 '나란히 비교' 버튼 |
| `src/components/ApproachNotes.tsx` | 고른 풀이의 평가, 좋은 점, 아쉬운 점 |
| `src/components/ProblemPage.tsx` | 문제 화면 |
| `src/components/Sidebar.tsx` | 문제 화면 옆 메뉴 |
| `src/components/HomePage.tsx` | 홈 |
| `src/components/CodePanel.tsx` | (고침) 고른 풀이의 코드, 변수, 복잡도 |
| `src/components/PlayerControls.tsx` | (고침) 재생 조작부 |
| `src/components/GuideModal.tsx` | (고침) 사용법 |
| `src/App.tsx` | (다시 씀) 주소에 따라 홈 또는 문제 화면 |
| `tests/*.test.ts`, `tests/python.ts`, `tests/rng.ts` | 점검 |

Task 11에서 지우는 파일은 `src/types/index.ts`, `src/problems/index.ts`, `src/components/{Header,ProblemPanel,MotionViewport,ApproachComparisonView}.tsx`, `src/components/visualizers/`, `scripts/check-problems.ts`, `src/assets/{hero.png,react.svg,vite.svg}`(아무 데서도 쓰지 않음)다.

---

### Task 0: 저장소 준비 (git을 쓰기로 했을 때만)

- [ ] **Step 1:** `git init && git add -A && git commit -m "chore: AlgoMotion 1판 (4문제)"`
- [ ] **Step 2:** `git status`가 깨끗한지 확인한다. `.gitignore`에는 `node_modules`, `dist`, `.superpowers/`가 이미 있다.

---

### Task 1: 테스트 실행기와 공용 도구

**Files:**
- Create: `src/problems/shared.ts`, `tests/shared.test.ts`
- Modify: `src/problems/index.ts:3-20` (지금 있는 `at`, `lastDigit`, `josa`, `ro`, `fmt`, `sum` 정의를 지우고 `./shared.ts`에서 가져온다)
- Modify: `package.json` — `"check": "node --test 'tests/**/*.test.ts' && node scripts/check-problems.ts"` (Task 11에서 앞부분만 남긴다)

**Interfaces:**
- Produces (`src/problems/shared.ts`):
  ```ts
  export const at: (code: string, ...needles: string[]) => number[];       // needle이 든 첫 줄 번호(1부터). 없으면 needle을 담은 Error
  export const josa: (word: string | number, batchim: string, plain: string) => string; // 끝 숫자가 2·4·5·9면 plain
  export const ro: (word: string | number) => string;                      // 끝 숫자가 0·3·6이면 '으로', 아니면 '로'
  export const fmt: (cell: [number, number]) => string;                    // '(r, c)'
  export const sum: (xs: number[]) => number;
  ```

- [ ] **Step 1: 실패하는 테스트 쓰기** (`tests/shared.test.ts`)
  ```ts
  test('josa: 2·4·5·9로 끝나면 받침 없는 조사', () => {
    assert.equal(josa(2, '을', '를'), '2를');
    assert.equal(josa('(2, 4)', '을', '를'), '(2, 4)를');
  });
  test('josa: 그 밖의 숫자는 받침 있는 조사', () => {
    assert.equal(josa(11, '이', '가'), '11이');
    assert.equal(josa('(1, 0)', '을', '를'), '(1, 0)을');
  });
  test('ro: 0·3·6은 으로, 나머지는 로', () => {
    assert.equal(ro(30), '30으로');
    assert.equal(ro(28), '28로');
    assert.equal(ro(1), '1로');
    assert.equal(ro('(0, 3)'), '(0, 3)으로');
  });
  test('at: 조각이 든 첫 줄 번호, 없으면 오류', () => {
    assert.deepEqual(at('a\nb\nab', 'b', 'ab'), [2, 3]);
    assert.throws(() => at('a', 'zz'), /zz/);
  });
  test('fmt, sum', () => {
    assert.equal(fmt([2, 3]), '(2, 3)');
    assert.equal(sum([1, 2, 3]), 6);
  });
  ```
- [ ] **Step 2:** `node --test 'tests/**/*.test.ts'` → 모듈이 없어 FAIL
- [ ] **Step 3:** `src/problems/shared.ts`를 구현한다(지금 `src/problems/index.ts` 3~20줄의 정의를 옮김). `src/problems/index.ts`는 `import { at, fmt, josa, ro, sum } from './shared.ts';`로 바꾼다.
- [ ] **Step 4:** `npm run check` → 새 테스트 PASS, 그 뒤 `문제 4개 점검 통과`
- [ ] **Step 5:** `git add -A && git commit -m "test: node 테스트 실행기와 공용 조사 도구"`

---

### Task 2: 장면 모델, 기록기, 배치 도구, 토큰 줄

**Files:**
- Create: `src/engine/model.ts`, `src/engine/recorder.ts`, `src/engine/layout.ts`, `src/engine/lane.ts`
- Test: `tests/recorder.test.ts`, `tests/layout.test.ts`, `tests/lane.test.ts`

**Interfaces:**
- Produces (`src/engine/model.ts`). 이 타입들이 이후 모든 작업의 계약이다.
  ```ts
  export type Language = 'python' | 'javascript';
  export type Rank = 'BEST' | 'ALTERNATIVE' | 'TRAP';
  export type Point = [number, number];
  export interface Rect { x: number; y: number; w: number; h: number }
  export type Tone = 'plain' | 'wall' | 'current' | 'queued' | 'visited' | 'path' | 'trail'
    | 'explored' | 'chosen' | 'good' | 'bad' | 'muted';
  export type ItemKind = 'cell' | 'token' | 'text' | 'bar' | 'zone' | 'ring' | 'line';
  export interface Item {
    id: string; kind: ItemKind; rect: Rect;   // line은 rect 대신 points로 그린다
    tone?: Tone; text?: string; sub?: string; tag?: string;
    fill?: number;                            // bar: 0~1
    points?: Point[];                         // line
  }
  export type ItemPatch = Partial<Omit<Item, 'id' | 'kind'>>;
  export interface Scene { width: number; height: number; items: Item[] }
  export type Verdict = 'new' | 'seen' | 'wall' | 'good' | 'bad';
  export type Action = (
    | { type: 'focus'; ids: string[] }                    // 이 물체들만 밝게, 나머지 흐리게
    | { type: 'unfocus' }
    | { type: 'set'; id: string; patch: ItemPatch; pop?: boolean } // rect가 바뀌면 미끄러지고, pop이면 글씨가 톡 튐
    | { type: 'add'; item: Item; from?: string }          // from 물체 자리에서 날아와 제자리에
    | { type: 'remove'; id: string; into?: string }       // into 물체 쪽으로 날아가 사라짐
    | { type: 'arrow'; from: string; to: string; verdict: Verdict; label: string } // 화살표 + to 위에 판정 표시
    | { type: 'clearMarks' }                              // 화살표와 판정 표시 지우기
    | { type: 'trace'; id: string; points: Point[] }      // line 물체를 처음부터 끝까지 그어 나감
    | { type: 'wait'; ms: number }
  ) & { together?: boolean };                             // 바로 앞 동작과 동시에 시작
  export interface Phase { label: string; caption: string; actions: Action[]; codeHighlights?: Record<Language, number[]> }
  export interface AlgorithmStep {
    title: string; phases: Phase[]; scene: Scene;
    codeHighlights: Record<Language, number[]>; variables: Record<string, string | number>;
    work: number; workNote?: string; answer?: unknown; isKeyframe?: boolean;
  }
  export interface Visualization { initial: Scene; steps: AlgorithmStep[] }
  export interface Approach {
    id: string; name: string; rank: Rank; trap?: 'wrong' | 'slow';   // rank가 TRAP이면 trap 필수
    timeComplexity: string; spaceComplexity: string;
    verdict: string; pros: string[]; cons: string[]; whyThisRank: string;
    code: Record<Language, string>;
    visualize: () => Visualization;                                  // 문제의 demo.input으로 돌린다
  }
  export type CategoryId = 'dfs-bfs' | 'brute-force' | 'dp' | 'greedy' | 'hash' | 'stack-queue'
    | 'binary-search' | 'sort' | 'heap' | 'graph' | 'two-pointer';
  export interface Problem {
    id: string; title: string; level: 2 | 3; category: CategoryId; sourceUrl: string;
    description: { summary: string; rules: string[]; examples: { input: string; output: string }[] };
    keyIntuitions: string[];
    demo: { input: unknown[]; label: string };
    workUnit: string;
    approaches: [Approach, Approach, Approach];                       // BEST, ALTERNATIVE, TRAP 순서
    checks: { cases: { args: unknown[]; expected: unknown }[]; random: (rand: () => number) => unknown[] };
  }
  export interface ProblemMeta { id: string; title: string; level: 2 | 3; sourceUrl: string; bestName: string; load?: () => Promise<Problem> }
  export interface Category { id: CategoryId; name: string; tier: 1 | 2 | 3; idea: string; problems: ProblemMeta[] }
  ```
- Produces (`src/engine/recorder.ts`):
  ```ts
  export class StepRecorder {
    constructor(initial: Scene);
    get(id: string): Item;          // 지금 장면의 물체(없으면 id를 담은 Error)
    has(id: string): boolean;
    step(meta: Omit<AlgorithmStep, 'phases' | 'scene'>): void;   // 새 단계를 열고, 열려 있던 단계는 장면을 찍어 닫음
    phase(label: string, caption: string, codeHighlights?: Record<Language, number[]>): void;
    do(...actions: Action[]): void; // 장면에 적용하고 지금 마디에 기록
    finish(): Visualization;        // 마지막 단계를 닫고 { initial, steps } 반환
  }
  ```
  장면에 적용하는 규칙은 다음과 같다. `set`은 patch를 합친다. `add`는 물체를 더한다(같은 id가 있으면 Error). `remove`는 물체를 지운다. `trace`는 해당 line의 points를 바꾼다. `focus`, `unfocus`, `arrow`, `clearMarks`, `wait`은 장면을 바꾸지 않지만, 가리키는 id가 지금 장면에 없으면 Error를 던진다. 찍어 둔 장면은 깊은 복사본이다.
- Produces (`src/engine/layout.ts`):
  ```ts
  export const grid: (o: { x: number; y: number; rows: number; cols: number; cell: number; gap: number }) => (r: number, c: number) => Rect;
  export const slots: (o: { x: number; y: number; w: number; h: number; gap: number }) => (i: number) => Rect;
  export const pyramid: (o: { x: number; y: number; width: number; rows: number; cell: number; gap: number }) => (r: number, c: number) => Rect; // 줄마다 가운데 정렬
  export const axis: (o: { x: number; w: number; min: number; max: number }) => (v: number) => number;
  export const around: (r: Rect, pad: number) => Rect;
  export const center: (r: Rect) => Point;
  ```
- Produces (`src/engine/lane.ts`):
  ```ts
  export interface LaneOptions { id: string; x: number; y: number; slotW: number; slotH: number; gap: number; max: number; foldable?: boolean }
  export class Lane {
    constructor(rec: StepRecorder, o: LaneOptions);
    readonly ids: readonly string[];                          // 논리 순서(앞 → 뒤), 접힌 것 포함
    push(token: { id: string; text: string; tone?: Tone }, from?: string): void;
    shift(into?: string): string;                             // 앞에서 꺼냄. 나머지는 together로 한 칸씩 당김
    pop(into?: string): string;                               // 뒤에서 꺼냄(스택)
    reorder(ids: string[]): void;                             // 새 순서로 자리를 옮김. 움직이는 토큰만 together로 set
  }
  ```
  `foldable`이 아닌 줄이 `max`를 넘으면 Error를 던진다. `foldable` 줄은 넘친 만큼 앞쪽(오래된 쪽)을 접고, 0번 칸에 `${id}:more` 토큰(tone `muted`, 글 `+n`)을 두고 그 뒤에 최근 `max - 1`개를 보인다. 접힌 토큰은 장면에 없다. 꺼내서 다시 보여야 하면 `more` 자리에서 `add`한다.

- [ ] **Step 1: 실패하는 테스트 쓰기**
  ```ts
  // tests/recorder.test.ts
  const base = (): Scene => ({ width: 100, height: 100, items: [
    { id: 'a', kind: 'cell', rect: { x: 0, y: 0, w: 10, h: 10 }, tone: 'plain' } ] });
  test('set·add·remove가 장면에 반영되고 단계마다 깊은 복사로 찍힌다', () => {
    const rec = new StepRecorder(base());
    rec.step({ title: '1', codeHighlights: { python: [1], javascript: [1] }, variables: {}, work: 1 });
    rec.phase('칠하기', '노랗게');
    rec.do({ type: 'set', id: 'a', patch: { tone: 'current' } });
    rec.step({ title: '2', codeHighlights: { python: [1], javascript: [1] }, variables: {}, work: 2 });
    rec.phase('더하기', '하나 더');
    rec.do({ type: 'add', item: { id: 'b', kind: 'token', rect: { x: 20, y: 0, w: 10, h: 10 } }, from: 'a' },
           { type: 'remove', id: 'a', into: 'b', together: true });
    const { initial, steps } = rec.finish();
    assert.equal(initial.items[0].tone, 'plain');
    assert.equal(steps[0].scene.items.find((i) => i.id === 'a')?.tone, 'current');
    assert.deepEqual(steps[1].scene.items.map((i) => i.id), ['b']);
    assert.equal(steps[1].phases[0].actions.length, 2);
  });
  test('없는 id, 겹치는 id, 순서 위반은 오류', () => {
    const rec = new StepRecorder(base());
    assert.throws(() => rec.phase('x', 'y'));                         // step 전
    rec.step({ title: '1', codeHighlights: { python: [1], javascript: [1] }, variables: {}, work: 0 });
    assert.throws(() => rec.do({ type: 'unfocus' }));                 // phase 전
    rec.phase('x', 'y');
    assert.throws(() => rec.do({ type: 'set', id: 'nope', patch: {} }), /nope/);
    assert.throws(() => rec.do({ type: 'add', item: base().items[0] }), /a/);
    assert.throws(() => rec.do({ type: 'arrow', from: 'a', to: 'zz', verdict: 'new', label: '새 칸' }), /zz/);
  });
  ```
  ```ts
  // tests/layout.test.ts
  test('grid', () => assert.deepEqual(grid({ x: 10, y: 50, rows: 5, cols: 5, cell: 54, gap: 8 })(1, 2), { x: 134, y: 112, w: 54, h: 54 }));
  test('slots', () => assert.deepEqual(slots({ x: 40, y: 5, w: 64, h: 30, gap: 6 })(3), { x: 250, y: 5, w: 64, h: 30 }));
  test('pyramid: 줄마다 가운데', () => {
    const at = pyramid({ x: 0, y: 0, width: 290, rows: 5, cell: 50, gap: 10 });
    assert.equal(at(0, 0).x, 120);
    assert.equal(at(4, 0).x, 0);
    assert.equal(at(4, 0).y, 240);
  });
  test('axis', () => { const x = axis({ x: 20, w: 200, min: 1, max: 101 }); assert.equal(x(1), 20); assert.equal(x(101), 220); assert.equal(x(51), 120); });
  test('around, center', () => {
    assert.deepEqual(around({ x: 10, y: 10, w: 54, h: 54 }, 5), { x: 5, y: 5, w: 64, h: 64 });
    assert.deepEqual(center({ x: 0, y: 0, w: 10, h: 20 }), [5, 10]);
  });
  ```
  ```ts
  // tests/lane.test.ts — 아래 조건을 각각 test로 쓴다
  // 1) push 3번 → 토큰 rect.x가 slot 0, 1, 2 순서
  // 2) shift('cell:0,0') → 앞 id를 돌려주고, 기록된 동작이 remove(into 'cell:0,0') 다음 together인 set rect 2개, 남은 토큰은 slot 0, 1
  // 3) foldable, max 4에서 push 6번 → 장면에 'lane:more'(text '+3')와 토큰 4~6이 slot 1~3. pop 한 번 → '+2'와 토큰 3~5
  // 4) foldable이 아닌 max 2 줄에 push 3번 → Error
  // 5) reorder(['t2', 't1']) → 두 토큰의 rect.x가 서로 바뀌고, 움직인 것만 set 동작으로 기록
  ```
- [ ] **Step 2:** `node --test 'tests/**/*.test.ts'` → FAIL (모듈 없음)
- [ ] **Step 3:** 네 파일을 구현한다.
- [ ] **Step 4:** `npm run check` → 모두 PASS
- [ ] **Step 5:** `git add -A && git commit -m "feat(engine): 장면 모델, 기록기, 배치 도구, 토큰 줄"`

---

### Task 3: 게임 맵 최단거리 — 세 풀이 시각화와 문제 점검

**Files:**
- Create: `src/problems/dfs-bfs/game-map.ts` (`export default` Problem), `src/problems/registry.ts`
- Test: `tests/problems.test.ts`

**Interfaces:**
- Consumes: Task 1의 shared, Task 2의 model, recorder, layout, lane
- Produces:
  ```ts
  // src/problems/registry.ts
  export const LOADERS: Record<string, () => Promise<Problem>> = {
    'game-map': () => import('./dfs-bfs/game-map.ts').then((m) => m.default),
  };
  ```

**내용:** 설명, 제한 사항, 입출력 예, 핵심 발상, 세 풀이의 이름·평가·장단점·코드는 지금 `src/problems/index.ts`의 `gameMap`에서 그대로 옮긴다. 새로 정하는 것은 아래와 같다.

| 항목 | 값 |
| --- | --- |
| `demo` | `{ input: [예제 1의 maps], label: 'maps = 예제 1 (5×5)' }` |
| `workUnit` | `'칸을 밟은 횟수'` |
| 함정 | DFS, `trap: 'slow'` |
| `checks.cases` | 원문 예제 2개(11, -1)와 `[[[1, 1], [1, 1]]]` → 3, `[[[1, 0], [1, 1]]]` → 3, `[[[1, 1, 1, 1]]]` → 4 |
| `checks.random` | n, m은 1~4(둘 다 1은 아님, 함정 DFS가 모든 길을 도는 시간을 짧게 두려고 4까지), 칸마다 70% 확률로 1, (0, 0)과 (n-1, m-1)은 항상 1 |

**장면(세 풀이 공통):** 330×372 크기다.
- 위쪽에 줄 이름표(text `lane:label`, '큐', '힙', '스택' 중 하나)와 줄 바탕(zone `lane:bg`, x 34, y 0, w 296, h 40)이 있다. 토큰 칸은 `slots({ x: 40, y: 5, w: 64, h: 30, gap: 6 })`이고 최대 4칸이다.
- 그 아래 격자는 `grid({ x: 14, y: 58, rows: 5, cols: 5, cell: 54, gap: 8 })`이다. 칸 id는 `cell:r,c`, 벽은 tone `wall`이고, (0, 0)과 (4, 4)에는 tag '출발', '도착'을 붙인다.
- 지금 칸 테두리는 ring `ring`(`around(칸, 5)`), 정답 경로는 line `path`다.

| 풀이 | 마디 (첫 단계 / 반복 / 마지막) | 줄 | work | answer |
| --- | --- | --- | --- | --- |
| 정석 BFS | 시작 / 꺼내기 → 살피기 → 넣기 / 꺼내기 → 도착 | 큐 | 꺼낸 칸 수, 끝에 16 | 11 |
| 대안 다익스트라 | 시작 / 꺼내기 → 살피기 → 넣고 정렬 / 꺼내기 → 도착 | 힙 | 꺼낸 칸 수, 끝에 16 (`workNote: '힙 정렬 n번'`, 끝에 32) | 11 |
| 함정 DFS | 들어가기 / 들어가기, 되돌아가기, 경로 찾음 / 최단 확정 | 스택(`foldable`, max 4) | 함수 호출 수, 끝에 25 | 11 |

**정석 BFS의 마디:** 시안 ① 수정안과 같다.
- **꺼내기:** `lane.shift(칸)`, 앞서 꺼낸 칸은 `visited`, 지금 칸은 `current`, ring을 옮긴다.
- **살피기:** 지금 칸과 범위 안 이웃만 `focus`한다. 이웃마다 `arrow`를 긋고 판정을 붙인다(`wall`은 '벽', `seen`은 '방문함', `new`는 '새 칸'). 새 칸은 `set { tone: 'queued', text: 거리 }, pop`으로 칠한다.
- **넣기:** `unfocus`, `clearMarks`를 하고, 새 칸마다 `lane.push(토큰, from 칸)`을 한다. 새 칸이 없으면 자막으로 '새로 넣을 칸이 없어 그대로 넘어갑니다.'를 띄운다.
- **도착:** 경로 칸을 together로 `path`로 칠하고 `trace('path', 칸 중심들)`을 한다.

**대안 다익스트라:** 같은 흐름에서 넣은 뒤 `lane.reorder(비용순)`을 한다.

**함정 DFS:** 시안 ②의 함정 흐름을 따른다.
- **들어가기:** 앞 칸은 `trail`, 지금 칸은 `current`로 칠하고, `trail` line의 points를 늘리고, `lane.push`를 한다. 두 번 이상 밟은 칸은 `sub: 'n번'`으로 표시한다.
- **되돌아가기:** 연달아 돌아온 만큼을 한 단계로 묶는다. `lane.pop(칸)`을 하고 칸을 `explored`로 칠한다.
- **경로 찾음:** 지금 길을 `path`로 칠하고, 자막에 길이와 지금까지의 최단을 쓴다.
- **최단 확정:** 최단 경로를 `path`로 칠하고 `trace`한다. 자막에 '모든 경로를 다 본 뒤에야 최단 11칸을 확정합니다.'를 쓴다.

**공통:** 자막과 변수는 지금 생성기와 시안의 문장을 바탕으로 쓴다. 하이라이트 줄은 각 풀이 자기 코드에서 `at()`으로 찾는다.

- [ ] **Step 1: 실패하는 테스트 쓰기** (`tests/problems.test.ts`). 모든 문제에 같은 점검을 돌리고, 기대값 표는 있는 문제만 확인한다.
  ```ts
  const load = (code: string) => new Function(`${code}\nreturn solution;`)() as (...a: unknown[]) => unknown;
  const json = (v: unknown) => JSON.parse(JSON.stringify(v));
  const EXPECT: Record<string, { work: [number, number, number]; answer: unknown }> = {
    'game-map': { work: [16, 16, 25], answer: 11 },
  };
  for (const [id, loader] of Object.entries(LOADERS)) {
    const problem = await loader();
    const vizs = problem.approaches.map((a) => a.visualize());
    describe(id, () => {
      test('세 풀이가 정석, 대안, 함정 순서이고 함정은 trap 종류가 있음', () => {
        assert.deepEqual(problem.approaches.map((a) => a.rank), ['BEST', 'ALTERNATIVE', 'TRAP']);
        assert.ok(problem.approaches[2].trap);
      });
      test('정석과 대안의 JS 코드가 모든 사례를 맞힘', () => {
        for (const a of problem.approaches.slice(0, 2))
          for (const c of problem.checks.cases)
            assert.deepEqual(json(load(a.code.javascript)(...structuredClone(c.args))), c.expected, `${a.id} ${JSON.stringify(c.args)}`);
      });
      test('단계마다 마디가 있고 자막이 있고 하이라이트 줄이 코드 안에 있음', () => {
        problem.approaches.forEach((a, i) => vizs[i].steps.forEach((s) => {
          assert.ok(s.phases.length > 0 && s.phases.every((p) => p.caption.trim()), `${a.id} ${s.title}`);
          for (const lang of ['python', 'javascript'] as const) {
            const lines = a.code[lang].split('\n').length;
            for (const h of [s.codeHighlights, ...s.phases.map((p) => p.codeHighlights).filter(Boolean)])
              for (const n of h![lang]) assert.ok(n >= 1 && n <= lines, `${a.id} ${s.title} ${lang} ${n}`);
          }
        }));
      });
      test('work는 줄지 않고, 마지막 단계는 결과 단계이며 answer가 같은 풀이 코드의 결과와 같음', () => {
        problem.approaches.forEach((a, i) => {
          const steps = vizs[i].steps;
          steps.forEach((s, k) => k && assert.ok(s.work >= steps[k - 1].work, `${a.id} ${s.title}`));
          const last = steps.at(-1)!;
          assert.ok(last.isKeyframe);
          assert.deepEqual(json(last.answer), json(load(a.code.javascript)(...structuredClone(problem.demo.input))));
        });
      });
      test('함정이 드러남', () => {
        const [best, , trap] = vizs.map((v) => v.steps.at(-1)!);
        if (problem.approaches[2].trap === 'wrong') assert.notDeepEqual(json(trap.answer), json(best.answer));
        else assert.ok(trap.work > best.work);
      });
      test('단계 수: 정석 8~25, 함정 40 이하', () => {
        assert.ok(vizs[0].steps.length >= 8 && vizs[0].steps.length <= 25);
        assert.ok(vizs[2].steps.length <= 40);
      });
      if (EXPECT[id]) test('기대값', () => {
        assert.deepEqual(vizs.map((v) => v.steps.at(-1)!.work), EXPECT[id].work);
        assert.deepEqual(json(vizs[0].steps.at(-1)!.answer), EXPECT[id].answer);
      });
    });
  }
  ```
- [ ] **Step 2:** `node --test 'tests/**/*.test.ts'` → FAIL (`registry.ts` 없음)
- [ ] **Step 3:** `src/problems/registry.ts`와 `src/problems/dfs-bfs/game-map.ts`를 위 표대로 구현한다.
- [ ] **Step 4:** `npm run check` → 모두 PASS
- [ ] **Step 5:** `git add -A && git commit -m "feat(problems): 게임 맵 최단거리 세 풀이 시각화"`

---

### Task 4: Python 실행과 무작위 비교 점검

**Files:**
- Create: `tests/python.ts`, `tests/rng.ts`
- Modify: `tests/problems.test.ts` (테스트 두 개를 더함)

**Interfaces:**
- Produces:
  ```ts
  // tests/python.ts
  export const PYTHON: string | null;   // `python3 --version`이 되면 'python3', 아니면 null
  export function runPython(code: string, argsList: unknown[][]): unknown[];  // 하위 프로세스 하나로 모든 사례를 돌림. 실패하면 stderr를 담은 Error
  // tests/rng.ts
  export function mulberry32(seed: number): () => number;
  ```
  하위 프로세스는 `python3 -c <아래 코드>`로 띄우고, 표준 입력으로 `{"code", "cases"}` JSON을 넘긴다.
  ```python
  import json, sys
  data = json.load(sys.stdin)
  ns = {}
  exec(data['code'], ns)
  print(json.dumps([ns['solution'](*args) for args in data['cases']]))
  ```

- [ ] **Step 1: 실패하는 테스트 쓰기** (`describe(id)` 안에 추가)
  ```ts
  test('정석과 대안의 Python 코드가 모든 사례를 맞힘', { skip: !PYTHON && 'python3 없음' }, () => {
    for (const a of problem.approaches.slice(0, 2))
      assert.deepEqual(runPython(a.code.python, problem.checks.cases.map((c) => c.args)), problem.checks.cases.map((c) => json(c.expected)), a.id);
  });
  test('무작위 입력 30개에서 정석·대안(과 느린 함정)의 JS·Python 답이 모두 같음', () => {
    const rand = mulberry32(20261020);
    const inputs = Array.from({ length: 30 }, () => problem.checks.random(rand));
    const same = problem.approaches.filter((a) => a.rank !== 'TRAP' || a.trap === 'slow');
    const expected = inputs.map((args) => json(load(same[0].code.javascript)(...structuredClone(args))));
    for (const a of same) {
      assert.deepEqual(inputs.map((args) => json(load(a.code.javascript)(...structuredClone(args)))), expected, `${a.id} JS`);
      if (PYTHON) assert.deepEqual(runPython(a.code.python, inputs), expected, `${a.id} Python`);
    }
  });
  ```
- [ ] **Step 2:** `node --test 'tests/**/*.test.ts'` → FAIL (`tests/python.ts` 없음)
- [ ] **Step 3:** 두 파일을 구현한다. `spawnSync`를 쓰고 `encoding: 'utf8'`, `input: JSON.stringify(...)`로 넘긴다.
- [ ] **Step 4:** `npm run check` → PASS. python3가 있는 이 컴퓨터에서는 Python 점검이 건너뛰어지지 않았는지 출력으로 확인한다.
- [ ] **Step 5:** `git add -A && git commit -m "test: Python 풀이 실행과 무작위 입력 비교"`

---

### Task 5: 무대와 재생기 (게임 맵을 새 화면에서 재생)

**Files:**
- Create: `src/engine/timeline.ts`, `src/engine/player.ts`, `src/engine/stage.ts`, `src/styles/stage.css`, `src/components/StageView.tsx`, `src/components/Player.tsx`, `src/components/ProblemPage.tsx`(이번에는 최소 판)
- Modify: `src/components/PlayerControls.tsx` (반복 버튼은 지우고 처음으로·이전·재생·다음·속도·타임라인만 남긴다), `src/App.tsx` (다시 씀), `src/main.tsx` (`./styles/stage.css` import 추가)
- Test: `tests/timeline.test.ts`, `tests/player.test.ts`

**Interfaces:**
- Produces (`src/engine/timeline.ts`):
  ```ts
  export const DUR = { focus: 200, unfocus: 200, set: 260, setMove: 420, add: 460, remove: 460, arrow: 380, clearMarks: 180, trace: 1200 } as const;
  export const PHASE_GAP = 140;
  export const STEP_TAIL = 320;
  export const KEYFRAME_TAIL = 1200;
  export interface PlannedAction { action: Action; start: number; duration: number }
  export interface PlannedPhase { label: string; caption: string; start: number; end: number; actions: PlannedAction[] }
  export interface StepPlan { phases: PlannedPhase[]; total: number }   // 1× 기준 ms
  export function planStep(step: AlgorithmStep, opts?: { reducedMotion?: boolean }): StepPlan;
  export function cycleLabels(viz: Visualization): string[];             // 두 단계 이상에 나오는 마디 이름, 처음 나온 순서
  ```
  시간 규칙은 다음과 같다.
  - 동작은 앞 동작이 끝나면 시작한다. `together`면 앞 동작과 같이 시작한다.
  - `set`은 patch에 rect가 있으면 `setMove`, 없으면 `set` 길이다. `wait`은 자기 ms만큼이다.
  - 마디의 끝은 그 안 동작들이 끝나는 가장 늦은 시각이고, 동작이 없는 마디는 300ms다. 다음 마디는 `PHASE_GAP` 뒤에 시작한다.
  - 전체 길이는 마지막 마디 끝에 `isKeyframe`이면 `KEYFRAME_TAIL`, 아니면 `STEP_TAIL`을 더한 값이다.
  - `reducedMotion`이면 `wait`을 뺀 모든 동작 길이를 `min(길이, 120)`으로 줄인다.
- Produces (`src/engine/player.ts`):
  ```ts
  export interface PlayerState { total: number; index: number; playing: boolean; animating: boolean; speed: number }
  // index: -1은 시작 전(initial 장면), k는 k단계가 끝난 모습. animating이면 index+1단계를 연출하는 중
  export type PlayerEvent = { type: 'play' } | { type: 'pause' } | { type: 'next' } | { type: 'prev' }
    | { type: 'seek'; index: number } | { type: 'reset' } | { type: 'stepDone' } | { type: 'speed'; speed: number };
  export const initialPlayer: (total: number) => PlayerState;   // index -1, 멈춤, speed 1
  export function playerReducer(s: PlayerState, e: PlayerEvent): PlayerState;
  ```
- Produces (`src/engine/stage.ts`):
  ```ts
  export class Stage {
    constructor(host: HTMLElement, scene: Scene, opts?: { reducedMotion?: boolean });
    render(scene: Scene): void;                    // 진행 중 연출을 취소하고 장면을 그대로 그림
    tween(scene: Scene): void;                     // 같은 id끼리 위치·색·채움을 CSS 전환(0.45초)으로 이음
    play(step: AlgorithmStep, speed: number, onPhase: (i: number) => void): Promise<boolean>; // 끝까지 가면 true, 취소되면 false
    cancel(): void;                                // 연출을 멈추고 덧그림(화살표, 판정, 날아가는 토큰)을 지움
    destroy(): void;
  }
  ```
  물체는 `data-id`를 단 절대 위치 요소로 그린다. 클래스는 `it it-<kind> tone-<tone>`이다. line은 SVG polyline, 화살표와 판정 표시는 덧그림 층에 그린다.
  `play`는 `planStep`의 시각대로 동작을 실행하고, 끝나면 `render(step.scene)`으로 맞춘다. 각 동작의 모양은 다음과 같다.
  - **focus:** 대상만 밝게 두고 나머지는 opacity 0.22로 흐린다.
  - **arrow:** 시작 칸 중심에서 12px 나가 끝 칸 중심 20px 앞까지 선을 긋고, 화살촉은 판정 색으로 칠한다. 판정 표시는 끝 칸 위 가운데에 단다.
  - **add(from):** from 물체 자리에서 포물선으로 날아온다.
  - **remove(into):** into 쪽으로 날아가 줄어들며 사라진다.
  - **set pop:** 글씨가 0.3 → 1.2 → 1배로 튄다.
  - **trace:** stroke-dashoffset으로 선을 그어 나간다.
- Produces (`src/components/StageView.tsx`): `StageView({ scene, stageRef, maxScale })`. 마운트할 때 `new Stage`를 만들어 `stageRef.current`에 넣고, 언마운트할 때 `destroy()`한다. 무대 논리 크기를 칸 폭에 맞춰 `transform: scale(min(maxScale, 폭 / scene.width))`로 줄이거나 늘린다(ResizeObserver).
- Produces (`src/components/Player.tsx`): `Player({ viz, demoLabel, workUnit, onFinish, onLinesChange, onVariablesChange })`.
  - **위:** 마디 표시줄(`cycleLabels`, 지금 마디는 형광펜)이 있다. 한 번만 나오는 마디(시작, 도착 등)는 오른쪽에 잠깐 칩으로 보인다.
  - **가운데:** StageView(maxScale 1.35)가 있다.
  - **아래:** `k/n단계`, `{workUnit} {work}번` + workNote, 입력 라벨, 자막을 둔다. 연출 중에는 그 마디의 자막을, 멈춰 있으면 그 단계 마지막 마디의 자막을, -1에서는 '재생을 누르면 시작합니다.'를 보인다.
  - **진행 막대:** 연출 중에는 그 단계 총 길이 동안 끊기지 않고 흐른다.
  - **조작:** PlayerControls와 단축키(Space, ←, →, R)를 쓴다. 단축키는 입력 칸에 글을 쓰는 중이거나 조합키를 누른 상태에서는 무시한다.
  - **바깥으로 알림:** 하이라이트 줄은 마디의 codeHighlights나 단계의 것을, 변수는 연출이 시작될 때 그 단계 값을 `onLinesChange`, `onVariablesChange`로 올려 보낸다.
  - **onFinish:** index가 마지막 단계에 닿으면 부른다.
  - **속도:** 바꾸면 다음 단계부터 적용한다.
  - **움직임 줄이기:** `prefers-reduced-motion`이면 Stage에 `reducedMotion`을 넘긴다.
- Produces (`src/App.tsx`, 이번 판): 해시가 `#/p/<id>`이면 `<ProblemPage id>`, 아니면 `LOADERS`의 id 링크 목록을 보인다(Task 10에서 홈으로 바꾼다).
- Produces (`src/components/ProblemPage.tsx`, 이번 판): `ProblemPage({ id })`. `LOADERS[id]`로 문제를 불러오고, 정석 풀이의 `Player`와 기존 `CodePanel`을 3칸 대시보드 자리에 놓는다. 불러오는 동안에는 '불러오는 중'을 보인다.

- [ ] **Step 1: 실패하는 테스트 쓰기**
  ```ts
  // tests/timeline.test.ts
  const step = (phases: Phase[], isKeyframe = false): AlgorithmStep => ({ title: 't', phases, scene: { width: 1, height: 1, items: [] },
    codeHighlights: { python: [1], javascript: [1] }, variables: {}, work: 0, isKeyframe });
  test('동작은 차례로, together는 같이', () => {
    const p = planStep(step([{ label: 'a', caption: 'c', actions: [
      { type: 'set', id: 'x', patch: { tone: 'current' } },
      { type: 'add', item: { id: 'y', kind: 'token', rect: { x: 0, y: 0, w: 1, h: 1 } } },
      { type: 'set', id: 'z', patch: { rect: { x: 1, y: 0, w: 1, h: 1 } }, together: true } ] }]));
    assert.deepEqual(p.phases[0].actions.map((a) => [a.start, a.duration]), [[0, 260], [260, 460], [260, 420]]);
    assert.equal(p.phases[0].end, 720);
    assert.equal(p.total, 720 + 320);
  });
  test('다음 마디는 PHASE_GAP 뒤, 결과 단계는 KEYFRAME_TAIL', () => {
    const p = planStep(step([{ label: 'a', caption: 'c', actions: [] }, { label: 'b', caption: 'd', actions: [{ type: 'unfocus' }] }], true));
    assert.deepEqual([p.phases[1].start, p.phases[1].end, p.total], [440, 640, 1840]);
  });
  test('움직임 줄이기는 120ms 상한', () => {
    const p = planStep(step([{ label: 'a', caption: 'c', actions: [{ type: 'trace', id: 'l', points: [] }] }]), { reducedMotion: true });
    assert.equal(p.phases[0].actions[0].duration, 120);
  });
  test('cycleLabels: 게임 맵 정석은 꺼내기, 살피기, 넣기', async () => {
    const viz = (await LOADERS['game-map']()).approaches[0].visualize();
    assert.deepEqual(cycleLabels(viz), ['꺼내기', '살피기', '넣기']);
  });
  ```
  ```ts
  // tests/player.test.ts
  const s = (o: Partial<PlayerState>): PlayerState => ({ ...initialPlayer(10), ...o });
  test('재생: 시작 전에서 첫 단계를 연출', () => assert.deepEqual(playerReducer(s({}), { type: 'play' }), s({ playing: true, animating: true })));
  test('연출이 끝나면 다음 단계도 이어서', () => assert.deepEqual(playerReducer(s({ index: 2, playing: true, animating: true }), { type: 'stepDone' }), s({ index: 3, playing: true, animating: true })));
  test('마지막 단계에 닿으면 멈춤', () => assert.deepEqual(playerReducer(s({ index: 8, playing: true, animating: true }), { type: 'stepDone' }), s({ index: 9 })));
  test('연출 중 다음 → 그 단계 끝난 모습으로 바로', () => assert.deepEqual(playerReducer(s({ index: 3, playing: true, animating: true }), { type: 'next' }), s({ index: 4 })));
  test('연출 중 이전 → 연출 전 모습으로', () => assert.deepEqual(playerReducer(s({ index: 3, animating: true }), { type: 'prev' }), s({ index: 3 })));
  test('멈춰 있을 때 다음 → 한 단계만 연출', () => assert.deepEqual(playerReducer(s({ index: 3 }), { type: 'next' }), s({ index: 3, animating: true })));
  test('끝에서 재생 → 처음부터', () => assert.deepEqual(playerReducer(s({ index: 9 }), { type: 'play' }), s({ index: -1, playing: true, animating: true })));
  test('seek는 -1~9로 자르고 멈춤', () => {
    assert.equal(playerReducer(s({}), { type: 'seek', index: 99 }).index, 9);
    assert.equal(playerReducer(s({ playing: true, animating: true }), { type: 'seek', index: -5 }).index, -1);
  });
  test('멈춤 → 지금 연출은 마치고 이어 가지 않음', () => assert.deepEqual(playerReducer(s({ index: 3, playing: true, animating: true }), { type: 'pause' }), s({ index: 3, animating: true })));
  ```
- [ ] **Step 2:** `node --test 'tests/**/*.test.ts'` → FAIL
- [ ] **Step 3:** `timeline.ts`와 `player.ts`를 구현하고 → `npm run check` PASS
- [ ] **Step 4:** `stage.ts`, `stage.css`, `StageView.tsx`, `Player.tsx`, 최소 판 `ProblemPage.tsx`와 `App.tsx`를 구현하고, `PlayerControls.tsx`를 고친다. `npx tsc -b`와 `npm run lint`에 오류가 없어야 한다.
- [ ] **Step 5: 브라우저 확인** (`preview_start` name `algomotion`)
  - `#/p/game-map`을 열고 재생한다. 마디 표시줄이 꺼내기 → 살피기 → 넣기로 넘어가는지, 토큰이 큐에서 칸으로 날아가는지, 살피기에서 다른 칸이 흐려지고 화살표와 '벽·방문함·새 칸' 표시가 뜨는지 마디마다 스크린샷으로 확인한다.
  - 연출 중에 '다음'을 10번 빠르게 누른다. 그 뒤 `document.querySelectorAll('.stage-mark, .is-flying').length === 0`이고 화면이 해당 단계의 끝난 모습인지 확인한다(Review Focus 1).
  - '이전'과 타임라인 끌기도 같은 방법으로 확인한다.
  - 콘솔 오류가 없어야 한다.
- [ ] **Step 6:** `git add -A && git commit -m "feat(engine): 무대와 재생기, 게임 맵 새 화면 재생"`

---

### Task 6: 문제 화면 — 풀이 탭, 나란히 비교, 비교 막대, 코드 칸

**Files:**
- Create: `src/components/ApproachTabs.tsx`, `src/components/RaceView.tsx`, `src/components/CompareBars.tsx`, `src/components/ApproachNotes.tsx`, `src/components/GradeMark.tsx` (`ApproachComparisonView.tsx`의 `GradeMark`를 옮기고, 그 파일은 Task 11에서 지울 때까지 여기서 가져다 씀)
- Modify: `src/components/ProblemPage.tsx`, `src/components/CodePanel.tsx`, `src/styles/index.css` (새 문제 화면 칸 배치 절을 추가하고, 옛 '풀이 비교 화면' 절에서 평가 상자·장단점·빨간펜 표시 스타일은 옮겨 쓴다)

**Interfaces:**
- Consumes: Task 5의 `Player`, `StageView`, `Stage.tween`
- Produces:
  ```ts
  ApproachTabs({ approaches: Approach[]; active: number; onSelect: (i: number) => void; comparing: boolean; onToggleCompare: () => void })
  // 탭 글은 '○ 정석 · {name}', '△ 대안 · {name}', '✕ 함정 · {name}' (빨간펜 채점 표시는 지금 GradeMark 모양을 씀). role="tablist"
  RaceView({ problem: Problem; vizs: Visualization[] })
  // 작은 판 3개(StageView maxScale 1)가 tween으로 같은 박자(1단계 600ms)에 돈다. 판마다 '{workUnit} n번'과 workNote, 끝나면 '끝!' 도장.
  // 다 끝나면 멈추고 '↺ 다시 경주' 버튼. 900px 미만에서는 위아래로 쌓음.
  CompareBars({ problem: Problem; vizs: Visualization[]; active: number })
  // 제목 '한눈에 비교: {workUnit}'. 막대 길이 = 마지막 work / 셋 중 최대. 값 '{work}번' (+ ' · {workNote}').
  // 결과 칩: 마지막 answer가 정석과 같으면 '정답', 다르면 '오답 {JSON}'. active 줄은 굵게.
  ApproachNotes({ approach: Approach })   // 평가 이유 상자, 좋은 점, 아쉬운 점, 시간·공간 복잡도 칩
  CodePanel({ code: Record<Language, string>; activeLines: Record<Language, number[]> | null;
              variables: Record<string, string | number>; prevVariables?: Record<string, string | number>;
              complexity: { time: string; space: string }; language: Language; onLanguageChange: (l: Language) => void })
  ```
  ProblemPage의 상태는 다음과 같다.
  - `active`(풀이 번호)와 `comparing`을 둔다. 탭을 바꾸면 Player를 `key={approach.id}`로 새로 만들어 -1부터 시작하고, 언어 선택은 유지한다.
  - `vizs = useMemo(() => problem.approaches.map((a) => a.visualize()))`로 시각화를 한 번만 만든다.
  - 비교 중에는 Player 대신 RaceView를 보이고, CodePanel은 고른 탭의 코드를 하이라이트 없이 보인다.
  - 가운데 칸은 위에서부터 문제 머리(레벨, 제목, 유형 이름, 원문 링크, `<details>` '문제 보기'), ApproachTabs, Player 또는 RaceView, ApproachNotes, CompareBars 순서다.
  - 오른쪽 칸은 CodePanel이다.
  - 정석 풀이에서 onFinish가 불리면 지금처럼 색종이를 뿌린다.

- [ ] **Step 1:** 네 컴포넌트를 만들고 ProblemPage와 CodePanel을 고친다. `npx tsc -b`와 `npm run lint`에 오류가 없어야 한다.
- [ ] **Step 2: 브라우저 확인**
  - `#/p/game-map`에서 세 탭이 각자의 그림, 마디 이름(정석: 꺼내기·살피기·넣기, 함정: 들어가기·되돌아가기·경로 찾음), 코드, 변수로 바뀌는지 확인한다.
  - 비교 막대가 '16번', '16번 · 힙 정렬 32번', '25번'이고 세 줄 모두 '정답'인지 확인한다.
  - '나란히 비교'를 켜면 세 판이 같이 돌고, 정석과 대안이 먼저 '끝!'이 되고 함정이 계속 도는지 확인한다.
  - 연출 중에 탭을 바꿔도 덧그림이 남지 않는지 확인한다(Review Focus 1).
  - 마디마다 스크린샷을 남긴다.
- [ ] **Step 3:** `git add -A && git commit -m "feat(ui): 풀이 탭, 나란히 비교, 비교 막대"`

---

### Task 7: 입국심사 옮기기

**Files:**
- Create: `src/problems/binary-search/immigration.ts`
- Modify: `src/problems/registry.ts` (`immigration` 추가), `tests/problems.test.ts` (`EXPECT.immigration = { work: [6, 6, 28], answer: 28 }`)

**내용:** 설명, 핵심 발상, 세 풀이 글과 코드는 지금 `immigration`에서 옮긴다.

| 항목 | 값 |
| --- | --- |
| `demo` | `{ input: [6, [7, 10]], label: 'n = 6, times = [7, 10]' }` |
| `workUnit` | `'반복 횟수'` |
| 함정 | 1분씩 늘려 보기, `trap: 'slow'` |
| `checks.cases` | 원문 예제(28), `[1, [1]]` → 1, `[3, [1, 1]]` → 2, `[10, [6, 8, 10]]` → 30 |
| `checks.random` | n은 1~20, times는 길이 1~4, 값 1~10 |

**장면:** 수직선 위에 탐색 구간(zone), left·right 글, mid 표시, answer 표시를 둔다. 그 아래에는 심사관 줄마다 이름, 속도, 계산 글, 처리 인원을 작은 cell로 늘어놓고, 맨 아래에 합계 막대(bar, fill = 합계/n, 최대 1)와 'n명 / 목표 6명'을 둔다. 지금 `ParametricVisualizer`의 구성을 물체로 옮긴 모습이다.

| 풀이 | 마디 (첫 / 반복 / 마지막) | work | 단계 수 |
| --- | --- | --- | --- |
| 정석 이분 탐색 | 시작 / 가운데 고르기 → 세어 보기 → 범위 줄이기 / 정답 | while 반복 수, 끝에 6 (mid 30, 15, 22, 26, 28, 27) | 8 |
| 대안 힙 시뮬레이션 | 시작 / 꺼내기 → 배정하기 → 다시 넣기 / 정답 | 배정한 사람 수, 끝에 6 (끝나는 시각 7, 10, 14, 20, 21, 28) | 8 |
| 함정 1분씩 | 시작 / 1분 늘리기 → 세어 보기 (t = 1~5) / 빨리 감기 (t = 6~27을 한 단계로) / 정답 (t = 28) | t 값, 끝에 28 | 8 |

- 대안의 마지막 자막은 'n이 10억이면 10억 번 반복합니다'를 짚는다.
- 함정의 마지막 자막은 '답이 10¹⁸분이면 10¹⁸번 반복합니다'를 짚는다.
- 대안은 힙 줄을 `Lane`(text '7분 · 1번' 같은 토큰)으로 보이고, 배정된 사람은 시간축 위 심사관 줄에 놓는다.

- [ ] **Step 1:** `EXPECT`와 registry 항목을 먼저 더하고 → `npm run check` FAIL(모듈 없음)
- [ ] **Step 2:** 문제 파일을 구현하고 → `npm run check` PASS
- [ ] **Step 3: 브라우저 확인:** `#/p/immigration`의 세 탭을 재생하며 마디마다 스크린샷을 남기고, 비교 막대가 6·6·28인지 본다.
- [ ] **Step 4:** `git add -A && git commit -m "feat(problems): 입국심사 세 풀이 시각화"`

---

### Task 8: 기능개발 옮기기

**Files:**
- Create: `src/problems/stack-queue/feature-development.ts`
- Modify: `src/problems/registry.ts`, `tests/problems.test.ts` (`EXPECT['feature-development'] = { work: [7, 7, 7], answer: [4, 2, 1] }`)

**내용:**

| 항목 | 값 |
| --- | --- |
| `demo` | `{ input: [[95, 97, 96, 98, 94, 99, 93], [1, 1, 1, 1, 1, 1, 1]], label: 'progresses = [95, 97, 96, 98, 94, 99, 93], speeds = 모두 1' }` |
| 남은 날 | [5, 3, 4, 2, 6, 1, 7] → 정답 [4, 2, 1], 함정 [2, 2, 2, 1] |
| `workUnit` | `'살펴본 기능 수'` |
| 함정 | 직전 기능하고만 비교, `trap: 'wrong'` |
| `checks.cases` | 원문 예제 2개, `[[95, 97, 96], [1, 1, 1]]` → [3], `[[99], [1]]` → [1], demo 입력 → [4, 2, 1] |
| `checks.random` | 길이 1~6, progresses 1~99, speeds 1~30 |

**장면:** 기능 카드 7개(zone 바탕, 이름, 진도 bar, 남은 날 글, 상태 글)가 앞에서 뒤로 늘어서고, 위에는 기준 배포일 표시, 아래에는 배포 기록 토큰 줄을 둔다.

| 풀이 | 마디 | 단계 수 |
| --- | --- | --- |
| 정석 한 번 훑기 | 남은 날 계산(시작) / 비교하기 → 묶기 또는 배포하기 / 마지막 배포 | 9 |
| 대안 큐 | 큐에 넣기(시작) / 맨 앞 꺼내기 → 함께 꺼내기 → 배포 (묶음마다 한 단계) | 4 |
| 함정 직전과 비교 | 남은 날 계산 / 직전과 비교하기 → 묶기 또는 배포하기 / 오답 확인 | 9 |

- 정석의 비교하기는 기준일 표시에서 카드로 `arrow`를 긋는다. 판정은 `good`('5일 ≤ 5일')이나 `bad`('6일 > 5일')다.
- 함정의 비교하기는 직전 카드에서 지금 카드로 `arrow`를 긋는다. 판정은 '4일 > 3일 → 새 묶음'처럼 쓴다.
- 함정의 마지막 단계 '오답 확인'은 배포 기록 [2, 2, 2, 1]을 tone `bad`로, 그 옆에 '정답은 [4, 2, 1]'을 보인다. 자막은 '기준은 직전 기능이 아니라 지금 묶음의 배포일이어야 합니다'다.

- [ ] **Step 1:** `EXPECT`와 registry 항목을 더하고 → `npm run check` FAIL
- [ ] **Step 2:** 문제 파일을 구현하고 → `npm run check` PASS. 함정 테스트는 `trap: 'wrong'` 갈래로 확인된다.
- [ ] **Step 3: 브라우저 확인:** 세 탭과 나란히 비교를 확인하고, 비교 막대에서 함정 줄이 '오답 [2,2,2,1]'인지 본다.
- [ ] **Step 4:** `git add -A && git commit -m "feat(problems): 기능개발 세 풀이 시각화"`

---

### Task 9: 정수 삼각형 옮기기

**Files:**
- Create: `src/problems/dp/integer-triangle.ts`
- Modify: `src/problems/registry.ts`, `tests/problems.test.ts` (`EXPECT['integer-triangle'] = { work: [10, 14, 31], answer: 30 }`)

**내용:**

| 항목 | 값 |
| --- | --- |
| `demo` | `{ input: [[[7], [3, 8], [8, 1, 0], [2, 7, 4, 4], [4, 5, 2, 6, 5]]], label: '예제 삼각형 (높이 5)' }` |
| `workUnit` | `'계산한 칸 수'` |
| 함정 | 모든 경로 재귀, `trap: 'slow'` |
| `checks.cases` | 원문 예제(30), `[[[1]]]` → 1, `[[[1], [2, 3]]]` → 4 |
| `checks.random` | 높이 1~7, 값 0~20 |

**장면:** `pyramid({ x: 0, y: 0, width: 360, rows: 5, cell: 54, gap: 10 })`로 칸(`node:r,c`, 글 = dp 값, sub = '원래 n')을 놓고, 줄 이름표('n층'), 아래쪽 계산 글('7 + max(…) = …'), 경로 line `path`를 둔다.

| 풀이 | 마디 | work | 단계 수 |
| --- | --- | --- | --- |
| 정석 아래에서 위로 | 시작 / 아래 두 칸 보기 → 더하기 / 경로 따라가기 | 계산한 칸, 끝에 10 | 12 |
| 대안 위에서 아래로 | 시작 / 위 칸 보기 → 더하기 / 바닥에서 최댓값 | 계산한 칸, 끝에 14 | 16 |
| 함정 모든 경로 | 시작 / 경로 내려가기 → 합 비교 (완성된 경로마다 한 단계, 16개) / 최댓값 확정 | 재귀 호출 수의 누적, 끝에 31 | 18 |

- 정석의 '아래 두 칸 보기'는 아래 두 칸에서 지금 칸으로 `arrow`를 긋는다. 큰 쪽은 `good`('큰 값'), 작은 쪽은 `seen`이다.
- 함정은 칸마다 지나간 횟수를 sub `'n번'`으로 보인다. 바닥 줄은 1, 4, 6, 4, 1번이 된다. work는 이전 경로 이후 새로 부른 호출 수만큼 늘어난다(5, 1, 2, 1, …, 합 31).

- [ ] **Step 1:** `EXPECT`와 registry 항목을 더하고 → `npm run check` FAIL
- [ ] **Step 2:** 문제 파일을 구현하고 → `npm run check` PASS
- [ ] **Step 3: 브라우저 확인:** 세 탭과 나란히 비교를 확인한다.
- [ ] **Step 4:** `git add -A && git commit -m "feat(problems): 정수 삼각형 세 풀이 시각화"`

---

### Task 10: 목록, 홈, 옆 메뉴, 주소, 봤음 표시

**Files:**
- Create: `src/catalog.ts`, `src/progress.ts`, `src/route.ts`, `src/components/HomePage.tsx`, `src/components/Sidebar.tsx`
- Modify: `src/App.tsx`, `src/components/ProblemPage.tsx`, `src/styles/index.css` (홈·옆 메뉴 절)
- Test: `tests/catalog.test.ts`, `tests/progress.test.ts`, `tests/route.test.ts`

**Interfaces:**
- Produces (`src/catalog.ts`):
  ```ts
  export const TIER_NAMES: Record<1 | 2 | 3, string> = { 1: '아주 자주 나와요', 2: '자주 나와요', 3: '가끔 나와요' };
  export const CATEGORIES: Category[];   // 11개. 순서, 이름, 핵심 발상 문구는 catalog.html 시안 그대로
  export function findProblem(id: string): { category: Category; meta: ProblemMeta; index: number } | null;
  ```
  - 문제 목록, 레벨, 번호, 정석 이름은 spec 4.4 표를 따른다. `sourceUrl`은 `https://school.programmers.co.kr/learn/courses/30/lessons/<번호>`, `load`는 `LOADERS[id]`다(없으면 준비 중).
  - 문제 id는 아래 표와 같다.

  | 유형 id | 문제 id (spec 표 순서) |
  | --- | --- |
  | dfs-bfs | game-map, target-number, network, word-conversion, travel-route, item-pickup, island-trip, maze-escape, ricochet-robot, oil-drilling |
  | brute-force | prime-finder, carpet, fatigue, split-power-grid, vowel-dictionary, n-queen, archery, emoticon-sale, maximize-expression, menu-renewal |
  | dp | integer-triangle, way-to-school, express-with-n, long-jump, tiling-2xn, land-grab, largest-square, coin-change, pulse-subarray, number-transform |
  | greedy | joystick, make-big-number, lifeboat, speed-camera, base-station, tangerine, delivery-pickup, interception, number-game, magic-elevator |
  | hash | phone-book, clothes, best-album, discount-event, roll-cake, open-chat |
  | stack-queue | feature-development, valid-parentheses, process, bridge-truck, stock-price, next-greater |
  | binary-search | immigration, stepping-stones, rank-search, puzzle-challenge, gold-silver, fifo-scheduling |
  | sort | largest-number, h-index, file-name-sort, tuple, min-sum, table-hash |
  | heap | spicier, disk-controller, double-priority-queue, defense-game |
  | graph | delivery, farthest-node, connect-islands, shared-taxi |
  | two-pointer | consecutive-subsequence, gem-shopping, equal-queues, number-expression |

- Produces (`src/progress.ts`):
  ```ts
  export interface ProgressStore { seen(): Set<string>; markSeen(id: string): void; last(): string | null; setLast(id: string): void }
  export function createProgress(storage: Pick<Storage, 'getItem' | 'setItem'> | null): ProgressStore; // 키 'algomotion:seen'(JSON 배열), 'algomotion:last'
  export const progress: ProgressStore;   // localStorage를 꺼내는 일부터 try/catch
  ```
- Produces (`src/route.ts`):
  ```ts
  export type Route = { page: 'home' } | { page: 'problem'; id: string };
  export function parseHash(hash: string): Route;
  export const problemHref: (id: string) => string;   // '#/p/<id>'
  ```

**화면:**
- **App:** `hashchange`를 구독해 Route에 따라 HomePage 또는 ProblemPage를 그리고, `document.title`을 '문제 이름 · AlgoMotion'이나 'AlgoMotion'으로 바꾼다. 헤더의 브랜드는 `#/` 링크다.
- **HomePage:** catalog.html 시안 A안 구조를 따른다.
  - 빈도 단계 아래에 유형 카드를 둔다. 카드 수로 나누어떨어지는 열 수만 쓴다(4개면 4열·2열·1열, 3개면 3열·1열).
  - 카드에는 이름, 핵심 발상, '{n}문제', '{봤음}/{n} 봤음' 막대, 문제 줄(레벨 칩, 제목, '정석 · {bestName}', 봤으면 ✓)이 있고, 5개를 넘으면 '나머지 n문제 더 보기'로 펼친다.
  - 준비 중인 문제 줄은 흐리게 '준비 중'을 붙이고 누를 수 없다.
  - 검색은 제목, 유형 이름, 정석 이름으로 거른다. 맞는 문제가 없으면 '{검색어}에 맞는 문제가 없습니다'를 보인다.
  - '이어 보기 · {제목} →'는 last가 있고 준비된 문제일 때만 보인다. '사용법' 버튼도 둔다.
- **Sidebar:** catalog.html 시안 B안 구조를 따른다.
  - 빈도 → 유형(펼치기/접기, 지금 유형은 펼침) → 문제 순으로 늘어놓고, 지금 문제는 `aria-current`로 표시한다. 준비 중인 문제는 흐리게 두고 누를 수 없다. 위에 검색 칸이 있다.
  - 1280px 미만에서는 문제 머리의 '☰ 문제 목록' 버튼으로 서랍처럼 열고, 문제를 고르면 닫는다.
- **ProblemPage:**
  - 왼쪽에 Sidebar를 붙이고, 머리에 '{빈도} › {유형} › {n}/{전체}' 경로와 같은 유형 안의 '← 이전 문제'/'다음 문제 →' 버튼(준비 중이면 비활성)을 더한다.
  - 문제를 열면 `progress.setLast(id)`를 하고, 정석 풀이의 onFinish에서 `progress.markSeen(id)`를 한다.
  - 없는 id면 '문제를 찾을 수 없습니다', 준비 중이면 '아직 준비 중인 문제입니다'를 보이고, 둘 다 '홈으로' 링크를 단다.

- [ ] **Step 1: 실패하는 테스트 쓰기**
  ```ts
  // tests/catalog.test.ts
  test('유형 11개, 단계별 문제 수 10/6/4, 모두 76문제, id 중복 없음', () => {
    assert.equal(CATEGORIES.length, 11);
    for (const c of CATEGORIES) assert.equal(c.problems.length, { 1: 10, 2: 6, 3: 4 }[c.tier], c.id);
    const ids = CATEGORIES.flatMap((c) => c.problems.map((p) => p.id));
    assert.equal(ids.length, 76);
    assert.equal(new Set(ids).size, 76);
  });
  test('LOADERS의 문제는 목록에 있고 load가 붙어 있음', () => {
    for (const id of Object.keys(LOADERS)) assert.ok(findProblem(id)?.meta.load, id);
    for (const c of CATEGORIES) for (const p of c.problems) assert.equal(!!p.load, id in LOADERS, p.id);
  });
  test('불러온 문제의 제목, 레벨, 유형, 주소가 목록과 같음', async () => {
    for (const c of CATEGORIES) for (const p of c.problems.filter((m) => m.load)) {
      const problem = await p.load!();
      assert.deepEqual([problem.id, problem.title, problem.level, problem.category, problem.sourceUrl], [p.id, p.title, p.level, c.id, p.sourceUrl]);
    }
  });
  test('주소 모양', () => {
    for (const c of CATEGORIES) for (const p of c.problems) assert.match(p.sourceUrl, /^https:\/\/school\.programmers\.co\.kr\/learn\/courses\/30\/lessons\/\d+$/);
  });
  ```
  ```ts
  // tests/progress.test.ts
  const memory = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
  test('봤음과 이어 보기를 저장하고 읽음', () => {
    const p = createProgress(memory());
    p.markSeen('game-map'); p.markSeen('game-map'); p.setLast('immigration');
    assert.deepEqual([...p.seen()], ['game-map']);
    assert.equal(p.last(), 'immigration');
  });
  test('저장소가 예외를 던져도 앱은 계속 (Review Focus 3)', () => {
    const p = createProgress({ getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } });
    assert.doesNotThrow(() => { p.markSeen('a'); p.setLast('a'); });
    assert.equal(p.seen().size, 0);
    assert.equal(p.last(), null);
  });
  test('저장소가 없거나 값이 깨져도 빈 값', () => {
    assert.equal(createProgress(null).seen().size, 0);
    const bad = memory(); bad.setItem('algomotion:seen', '{깨짐');
    assert.equal(createProgress(bad).seen().size, 0);
  });
  ```
  ```ts
  // tests/route.test.ts (Review Focus 4)
  test('parseHash', () => {
    for (const h of ['', '#', '#/', '#/p/', '#/x', '#/p']) assert.deepEqual(parseHash(h), { page: 'home' }, h);
    assert.deepEqual(parseHash('#/p/game-map'), { page: 'problem', id: 'game-map' });
    assert.deepEqual(parseHash('#/p/%EA%B0%80'), { page: 'problem', id: '가' });
    assert.equal(problemHref('game-map'), '#/p/game-map');
  });
  ```
- [ ] **Step 2:** `npm run check` → FAIL
- [ ] **Step 3:** `catalog.ts`, `progress.ts`, `route.ts`를 구현하고 → `npm run check` PASS
- [ ] **Step 4:** HomePage, Sidebar를 만들고 App과 ProblemPage를 고친다. `npx tsc -b`와 `npm run lint`에 오류가 없어야 한다.
- [ ] **Step 5: 브라우저 확인**
  - 홈에 76문제가 3단계 11유형으로 보이고, 4문제만 누를 수 있는지 확인한다.
  - 검색에 '이분'을 넣으면 이분 탐색 카드만 남는지 확인한다.
  - 게임 맵 정석을 끝까지 재생한 뒤 홈에 ✓와 '1/10 봤음'이 보이는지 확인한다.
  - '이어 보기'가 마지막 문제로 가는지 확인한다.
  - 연출 도중 옆 메뉴로 다른 문제로 가거나 홈으로 가도 콘솔 오류가 없는지 확인한다(Review Focus 2).
  - `#/p/nope`과 `#/p/target-number`의 안내 문구와 홈 링크를 확인한다(Review Focus 4).
  - 뒤로 가기가 동작하는지 확인한다.
- [ ] **Step 6:** `git add -A && git commit -m "feat(ui): 홈, 옆 메뉴, 주소, 봤음 표시"`

---

### Task 11: 정리, 사용법, 반응형, 최종 확인, 미리보기 올리기

**Files:**
- Delete: 파일 구조 절의 '지우는 파일' 목록
- Modify: `package.json` (`"check": "node --test 'tests/**/*.test.ts'"`), `src/styles/index.css` (옛 시각화 절 855~1584줄, 풀이 비교 화면 절, 옛 3단 대시보드와 문제 탭 스타일 중 쓰지 않는 것을 지운다. 지우기 전에 `grep`으로 클래스 사용처를 확인한다), `src/components/GuideModal.tsx`, `README.md`, `vite.config.ts` (`base: './'`)

**사용법 창 내용:**
- 마디: 한 단계가 꺼내기·살피기·넣기처럼 몇 마디로 나뉘고 위쪽에 지금 마디가 표시된다.
- 풀이 탭: 정석, 대안, 함정을 바꿔 가며 각각 움직이는 그림을 본다.
- 나란히 비교: 세 풀이를 동시에 돌려 한 일의 양을 비교한다.
- 문제 고르기: 홈의 유형 카드와 문제 화면 옆 메뉴로 고른다.
- 단축키(Space, ←, →, R, Esc)는 그대로 둔다.

**README:**
- 76문제 구조(빈도 3단계, 11유형)와 지금 준비된 문제를 표로 적는다.
- 문제 추가 방법을 적는다: `src/problems/<유형>/<id>.ts`를 만들고, `registry.ts`에 한 줄을 더하고, `StepRecorder`로 마디를 기록하고, `checks`에 사례와 무작위 입력을 넣는다.
- `npm run check`가 확인하는 것을 적는다.

- [ ] **Step 1:** 파일을 지우고 위 내용을 고친다. `npm run check`, `npm run build`, `npm run lint`가 모두 통과해야 한다.
- [ ] **Step 2: 반응형 확인** (Review Focus 5). `resize_window`로 1440×900, 1024×768, 768×1024, 375×812에서 각각 확인한다.
  - 홈과 `#/p/game-map`에서 `document.documentElement.scrollWidth <= innerWidth`이어야 한다.
  - 1280px 미만에서는 옆 메뉴가 서랍으로 열린다.
  - 375px에서는 무대가 칸 폭에 맞게 줄고, 나란히 비교 판이 위아래로 쌓인다.
  - 확인이 끝나면 `preset: 'desktop'`으로 되돌린다.
- [ ] **Step 3: 최종 확인.** 4문제 × 3풀이를 모두 끝까지 재생하며 콘솔 오류가 없는지 본다. 각 문제의 정석 마디 하나씩 스크린샷을 남긴다.
- [ ] **Step 4: 사용자용 미리보기 올리기.** 사용자가 원격으로 쓰고 있어 localhost를 볼 수 없다.
  - `npm run build`를 한다.
  - `dist/index.html`에서 doctype, html, head, body 태그를 걷어 낸 사본(title, meta, 폰트 link, CSS link, `#root`, 모듈 script는 남김)을 scratchpad에 만든다.
  - 그 사본과 `dist/assets/*`를 `files`로 함께 Artifact로 올린다. 제목은 'AlgoMotion 1단계 미리보기', 아이콘은 'play'다.
  - 올린 페이지에서 해시 주소 이동이 되는지 확인한다. 안 되면 사용자에게 그 한계를 알린다.
- [ ] **Step 5:** `git add -A && git commit -m "chore: 옛 화면 정리, 사용법과 README 갱신"`
- [ ] **Step 6: 사용자 확인 (spec 8의 1단계 확인 지점).** 미리보기 링크와 함께 움직임, 풀이 탭, 나란히 비교, 홈, 옆 메뉴를 확인해 달라고 하고, 의견을 반영한 뒤 2단계 계획으로 넘어간다.
