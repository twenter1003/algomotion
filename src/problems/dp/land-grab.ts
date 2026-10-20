// 땅따먹기: 정석 줄마다 윗줄 다른 열의 최댓값을 더하기, 대안 윗줄의 1등·2등만 기억하기, 함정 줄마다 가장 큰 칸만 고르는 탐욕을 같은 격자에서 움직인다.
// 장면은 3행 4열 격자(행·열 번호는 코드처럼 0부터), 아래쪽 계산 글 줄이다. 함정은 오른쪽에 합 표시, 그 아래에 내 답·정답 표시를 둔다.
import type { Action, Item, ItemPatch, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, together } from '../shared.ts';

type Cell = [number, number]; // [i, j]: i행 j열 (0부터)

// 시각화 입력: 가장 큰 9를 따라 밟으면 다음 줄의 9와 마지막 줄의 9를 놓친다(탐욕 19, 정답 25)
const LAND = [[9, 5, 2, 7], [9, 3, 5, 7], [1, 2, 3, 9]];
const ROWS = LAND.length;
const COLS = 4;

// dp 표(정석 계산과 같은 값)와, 정답 경로(마지막 줄 최댓값에서 윗줄로 거슬러 간 칸들)
const DP = LAND.map((row) => [...row]);
for (let i = 1; i < ROWS; i++) for (let j = 0; j < COLS; j++) DP[i][j] += Math.max(...DP[i - 1].filter((_, k) => k !== j));
const ANSWER = Math.max(...DP[ROWS - 1]);
const ROUTE: Cell[] = [];
for (let i = ROWS - 1, j = DP[i].indexOf(ANSWER); i >= 0; i--) {
  ROUTE.unshift([i, j]);
  if (i) j = DP[i - 1].map((v, k) => (k === j ? -1 : v)).reduce((b, v, k, all) => (v > all[b] ? k : b), 0);
}
// 탐욕: 밟은 열을 뺀 가장 큰 칸(같으면 왼쪽)을 줄마다 고른 칸들
const GREEDY: Cell[] = [];
for (let i = 0, prev = -1; i < ROWS; i++) {
  let pick = -1;
  LAND[i].forEach((v, c) => {
    if (c !== prev && (pick < 0 || v > LAND[i][pick])) pick = c;
  });
  GREEDY.push([i, pick]);
  prev = pick;
}

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TABLE = {
  python: `def solution(land):
    n = len(land)
    dp = [row[:] for row in land]  # dp[i][j] = i행 j열을 밟았을 때까지의 최대 점수 (원본을 지키려고 복사)

    for i in range(1, n):
        for j in range(4):
            # 같은 열을 뺀 윗줄 세 칸 중 가장 큰 값을 더합니다
            dp[i][j] += max(dp[i - 1][k] for k in range(4) if k != j)

    return max(dp[-1])`,
  javascript: `function solution(land) {
  const n = land.length;
  const dp = land.map((row) => [...row]); // dp[i][j] = i행 j열을 밟았을 때까지의 최대 점수 (원본을 지키려고 복사)

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < 4; j++) {
      // 같은 열을 뺀 윗줄 세 칸 중 가장 큰 값을 더합니다
      let best = 0;
      for (let k = 0; k < 4; k++) {
        if (k !== j) best = Math.max(best, dp[i - 1][k]);
      }
      dp[i][j] += best;
    }
  }

  return Math.max(...dp[n - 1]);
}`,
};
const TABLE_AT = {
  start: lines(TABLE, ['n = len(land)', 'dp = [row[:]'], ['const n = land.length', 'const dp = land.map']),
  look: lines(TABLE, ['for i in range(1, n)', 'for j in range(4)', 'dp[i][j] += max('], ['for (let i = 1', 'for (let j = 0', 'let best = 0', 'for (let k = 0', 'if (k !== j)']),
  add: lines(TABLE, ['dp[i][j] += max('], ['dp[i][j] += best']),
  done: lines(TABLE, ['return max(dp[-1])'], ['return Math.max(...dp[n - 1])']),
};

const TOP2 = {
  python: `def solution(land):
    n = len(land)
    dp = [row[:] for row in land]

    for i in range(1, n):
        prev = dp[i - 1]
        first = max(range(4), key=lambda c: prev[c])  # 윗줄에서 가장 큰 칸의 열
        second = max((c for c in range(4) if c != first), key=lambda c: prev[c])  # 두 번째로 큰 칸의 열
        for j in range(4):
            # 같은 열이 1등이면 2등을, 아니면 1등을 더합니다
            dp[i][j] += prev[second] if j == first else prev[first]

    return max(dp[-1])`,
  javascript: `function solution(land) {
  const n = land.length;
  const dp = land.map((row) => [...row]);

  for (let i = 1; i < n; i++) {
    const prev = dp[i - 1];
    let first = 0; // 윗줄에서 가장 큰 칸의 열
    for (let c = 1; c < 4; c++) if (prev[c] > prev[first]) first = c;
    let second = first === 0 ? 1 : 0; // 두 번째로 큰 칸의 열
    for (let c = 0; c < 4; c++) if (c !== first && prev[c] > prev[second]) second = c;
    for (let j = 0; j < 4; j++) {
      // 같은 열이 1등이면 2등을, 아니면 1등을 더합니다
      dp[i][j] += j === first ? prev[second] : prev[first];
    }
  }

  return Math.max(...dp[n - 1]);
}`,
};
const TOP2_AT = {
  start: lines(TOP2, ['n = len(land)', 'dp = [row[:]'], ['const n = land.length', 'const dp = land.map']),
  rank: lines(TOP2, ['for i in range(1, n)', 'prev = dp[i - 1]', 'first = max(range(4)', 'second = max((c for c'], ['for (let i = 1', 'const prev = dp[i - 1]', 'let first = 0', 'for (let c = 1', 'let second', 'for (let c = 0']),
  pick: lines(TOP2, ['for j in range(4)', 'dp[i][j] += prev[second]'], ['for (let j = 0', 'dp[i][j] += j === first']),
  add: lines(TOP2, ['dp[i][j] += prev[second]'], ['dp[i][j] += j === first']),
  done: lines(TOP2, ['return max(dp[-1])'], ['return Math.max(...dp[n - 1])']),
};

const GREEDY_CODE = {
  python: `# 주의: 줄마다 가장 큰 칸만 고르는 풀이는 오답이 나옵니다
def solution(land):
    total = 0
    prev = -1  # 바로 윗줄에서 밟은 열 (처음에는 없음)

    for row in land:
        # 밟았던 열을 뺀 칸 중 가장 큰 칸을 고릅니다
        j = max((c for c in range(4) if c != prev), key=lambda c: row[c])
        total += row[j]
        prev = j

    return total`,
  javascript: `// 주의: 줄마다 가장 큰 칸만 고르는 풀이는 오답이 나옵니다
function solution(land) {
  let total = 0;
  let prev = -1; // 바로 윗줄에서 밟은 열 (처음에는 없음)

  for (const row of land) {
    // 밟았던 열을 뺀 칸 중 가장 큰 칸을 고릅니다
    let j = -1;
    for (let c = 0; c < 4; c++) {
      if (c !== prev && (j < 0 || row[c] > row[j])) j = c;
    }
    total += row[j];
    prev = j;
  }

  return total;
}`,
};
const GREEDY_AT = {
  start: lines(GREEDY_CODE, ['total = 0', 'prev = -1'], ['let total = 0', 'let prev = -1']),
  pick: lines(GREEDY_CODE, ['for row in land', 'j = max((c for c'], ['for (const row of land)', 'let j = -1', 'for (let c = 0', 'if (c !== prev']),
  step: lines(GREEDY_CODE, ['total += row[j]', 'prev = j'], ['total += row[j]', 'prev = j']),
  done: lines(GREEDY_CODE, ['return total'], ['return total']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 행 이름표는 맨 왼쪽 0~40, 열 이름표는 맨 위 0~16, 칸은 (46, 32)부터. 칸 위 11px에 붙는 판정 표시가 윗줄 칸과 겹치지 않게 칸 사이는 12px이다.
const X0 = 46;
const Y0 = 32;
const PITCH = 66;
const cellRect = (i: number, j: number): Rect => ({ x: X0 + j * PITCH, y: Y0 + i * PITCH, w: 54, h: 54 });
const W = X0 + COLS * PITCH - 12;
const CALC_Y = Y0 + ROWS * PITCH - 12 + 14;
const cellId = ([i, j]: Cell) => `cell:${i},${j}`;
const wait = (ms: number): Action => ({ type: 'wait', ms });
const set = (c: Cell, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: cellId(c), patch, ...(pop ? { pop } : {}) });
const paint = (c: Cell, tone: Tone) => set(c, { tone });
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });
const focus = (...cells: Cell[]): Action => ({ type: 'focus', ids: cells.map(cellId) });
const clear = (): Action[] => together([{ type: 'clearMarks' }, { type: 'unfocus' }]);
const look = (from: Cell, to: Cell, verdict: Verdict, label: string): Action => ({ type: 'arrow', from: cellId(from), to: cellId(to), verdict, label });
const rowOf = (i: number): Cell[] => Array.from({ length: COLS }, (_, j): Cell => [i, j]);
const others = (i: number, j: number): Cell[] => rowOf(i).filter(([, k]) => k !== j);

// 자막이 글자당 20ms 이상 보이도록(마디가 끝난 뒤 다음 자막이 뜰 때까지 포함), 한 단계가 2초 이상 가도록 마디 끝에 기다림을 더한다
const MS_PER_CHAR = 20;
const MIN_STEP = 2000;
const busy = (p: { start: number; actions: { start: number; duration: number }[] }) =>
  Math.max(0, ...p.actions.map((a) => a.start + a.duration - p.start));
const paced = (viz: Visualization): Visualization => {
  for (const step of viz.steps) {
    const { phases } = planStep(step);
    phases.forEach((p, i) => {
      const tail = i < phases.length - 1 ? PHASE_GAP : step.isKeyframe ? KEYFRAME_TAIL : STEP_TAIL;
      const want = [...step.phases[i].caption].length * MS_PER_CHAR - tail;
      if (p.end - p.start < want) step.phases[i].actions.push(wait(Math.ceil(want - busy(p))));
    });
    const plan = planStep(step);
    const last = plan.phases.at(-1)!;
    const short = MIN_STEP - plan.total;
    if (short > 0) step.phases.at(-1)!.actions.push(wait(last.end - last.start + short - busy(last)));
  }
  return viz;
};

// 세 풀이가 같이 쓰는 장면: 행·열 이름표, 칸 12개(글은 원래 점수), 계산 글. extra는 함정의 합·결과 표시
function board(calc: Rect, height: number, ...extra: Item[]): Scene {
  const items: Item[] = [];
  for (let j = 0; j < COLS; j++) items.push({ id: `col:${j}`, kind: 'text', rect: { x: cellRect(0, j).x, y: 0, w: 54, h: 16 }, tone: 'muted', text: `${j}열` });
  for (let i = 0; i < ROWS; i++) {
    items.push({ id: `row:${i}`, kind: 'text', rect: { x: 0, y: cellRect(i, 0).y, w: 40, h: 54 }, tone: 'muted', text: `${i}행` });
    for (let j = 0; j < COLS; j++) items.push({ id: cellId([i, j]), kind: 'cell', rect: cellRect(i, j), tone: 'plain', text: String(LAND[i][j]) });
  }
  items.push({ id: 'calc', kind: 'text', rect: calc, text: '' }, ...extra);
  return { width: W, height, items };
}
const CALC: Rect = { x: 0, y: CALC_Y, w: W, h: 28 };
const HEIGHT = CALC_Y + 28;

// 표 채우기 마디가 같이 쓰는 값: 칸 하나를 계산한 뒤의 모습
const addCaption = (orig: number, add: number, total: number, [i, j]: Cell) =>
  `원래 점수 ${orig}에 ${josa(add, '을', '를')} 더해 dp[${i}][${j}] = ${total}입니다.`;
const cellVars = (now: { cell: Cell; orig: number; add: number; total: number } | undefined) => ({
  i: now ? now.cell[0] : '-',
  j: now ? now.cell[1] : '-',
  'land[i][j]': now?.orig ?? '-',
  '윗줄 최댓값': now?.add ?? '-',
  'dp[i][j]': now?.total ?? '-',
});
// 마지막 단계: 정답 경로를 분홍으로 칠하고 점수를 더한 식을 보여 준다
const routeText = `${ROUTE.map(([i, j]) => LAND[i][j]).join(' + ')} = ${ANSWER}`;

/* ------------------------------------------------------------------ */
/* 정석 표 채우기: 윗줄 보기 → 더하기                                      */
/* ------------------------------------------------------------------ */

function table(): Visualization {
  const rec = new StepRecorder(board(CALC, HEIGHT));
  const dp = LAND.map((row) => [...row]);
  let now: { cell: Cell; orig: number; add: number; total: number } | undefined;
  let lit: Cell | undefined; // 노란 칸(바로 전에 계산한 칸)
  let done = COLS; // 0행은 처음부터 점수가 곧 dp 값이다
  const meta = () => ({ work: done, variables: cellVars(now) });
  const settle = (): Action[] => (lit ? [paint(lit, 'visited')] : []);

  rec.step({ title: '0행은 점수 그대로', codeHighlights: TABLE_AT.start, ...meta() });
  rec.phase('시작', `땅은 ${ROWS}행 ${COLS}열입니다. 줄마다 한 칸씩 밟고, 바로 윗줄과 같은 열은 밟을 수 없습니다.`);
  rec.do(calcTo('행·열 번호는 코드처럼 0부터'));
  rec.phase('규칙', 'dp[i][j]는 i행 j열을 밟았을 때까지의 최대 점수입니다. 첫 줄은 점수가 곧 dp 값입니다.');
  rec.do(...together([...rowOf(0).map((c) => paint(c, 'visited')), calcTo('dp[i][j] = 점수 + 윗줄 다른 열의 최댓값')]));

  for (let i = 1; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const cell: Cell = [i, j];
      const sources = others(i - 1, j);
      const values = sources.map(([a, b]) => dp[a][b]);
      const best = Math.max(...values);
      const settling = settle();
      now = { cell, orig: LAND[i][j], add: best, total: LAND[i][j] + best };
      dp[i][j] = now.total;
      lit = cell;
      done++;
      const formula = `${now.orig} + max(${values.join(', ')})`;

      rec.step({ title: `dp[${i}][${j}] = ${formula} = ${now.total}`, codeHighlights: TABLE_AT.add, ...meta() });
      rec.phase('윗줄 보기', `${i}행 ${j}열의 윗줄에서 같은 열을 뺀 세 칸은 ${values.join(', ')}입니다. 가장 큰 값은 ${best}입니다.`, TABLE_AT.look);
      rec.do(...together([...settling, paint(cell, 'current'), focus(cell, ...sources), calcTo(formula)]));
      rec.do(...sources.map((s, n) => look(cell, s, values[n] === best ? 'good' : 'seen', String(values[n]))), wait(300));
      rec.phase('더하기', addCaption(now.orig, best, now.total, cell), TABLE_AT.add);
      rec.do(...together([set(cell, { text: String(now.total), sub: `원래 ${now.orig}` }, true), calcTo(`${formula} = ${now.total}`)]), wait(300), ...clear());
    }
  }

  const settling = settle();
  const [li, lj] = ROUTE.at(-1)!;
  rec.step({ title: `답: 마지막 줄 최댓값 ${ANSWER}`, codeHighlights: TABLE_AT.done, ...meta(), answer: ANSWER, isKeyframe: true });
  rec.phase('답', `마지막 줄에서 가장 큰 dp[${li}][${lj}] = ${josa(ANSWER, '이', '가')} 답입니다. 칸 ${done}개를 한 번씩만 계산했습니다.`);
  rec.do(...together([...settling, ...ROUTE.map((c) => paint(c, 'path')), calcTo(routeText)]));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 1등·2등만 기억하기: 1·2등 찾기 → 기억하기 (줄마다), 윗줄 고르기 → 더하기 (칸마다) */
/* ------------------------------------------------------------------ */

function top2(): Visualization {
  const rec = new StepRecorder(board(CALC, HEIGHT));
  const dp = LAND.map((row) => [...row]);
  let now: { cell: Cell; orig: number; add: number; total: number } | undefined;
  let lit: Cell | undefined;
  let done = COLS;
  const meta = () => ({ work: done, variables: cellVars(now) });
  const settle = (): Action[] => (lit ? [paint(lit, 'visited')] : []);
  let ranked: Cell[] = []; // 1등·2등 표시가 붙은 칸들(줄이 끝나면 지운다)
  const unrank = (): Action[] => ranked.map((c) => set(c, { tag: '', tone: 'visited' }));

  rec.step({ title: '0행은 점수 그대로', codeHighlights: TOP2_AT.start, ...meta() });
  rec.phase('시작', `땅은 ${ROWS}행 ${COLS}열입니다. 줄마다 한 칸씩 밟고, 바로 윗줄과 같은 열은 밟을 수 없습니다.`);
  rec.do(calcTo('행·열 번호는 코드처럼 0부터'));
  rec.phase('규칙', '같은 열만 못 밟으니, 윗줄에서 가장 큰 칸과 두 번째로 큰 칸만 알면 충분합니다.');
  rec.do(...together([...rowOf(0).map((c) => paint(c, 'visited')), calcTo('윗줄의 1등·2등만 기억')]));

  for (let i = 1; i < ROWS; i++) {
    const prev = dp[i - 1];
    let first = 0;
    for (let c = 1; c < COLS; c++) if (prev[c] > prev[first]) first = c;
    let second = first === 0 ? 1 : 0;
    for (let c = 0; c < COLS; c++) if (c !== first && prev[c] > prev[second]) second = c;
    const [c1, c2]: Cell[] = [[i - 1, first], [i - 1, second]];
    const settlingRank = settle();
    lit = undefined;

    rec.step({ title: `${i - 1}행의 1등 ${prev[first]}, 2등 ${prev[second]}`, codeHighlights: TOP2_AT.rank, ...meta() });
    rec.phase('1·2등 찾기', `${i - 1}행(${prev.join(', ')})에서 가장 큰 두 칸을 찾습니다.`, TOP2_AT.rank);
    rec.do(...together([...settlingRank, ...unrank(), focus(...rowOf(i - 1)), calcTo(`${i - 1}행: ${prev.join(', ')}`)]));
    ranked = [c1, c2];
    rec.phase('기억하기', `1등은 ${first}열의 ${prev[first]}, 2등은 ${second}열의 ${prev[second]}입니다. 이 둘만 기억합니다.`, TOP2_AT.rank);
    rec.do(...together([set(c1, { tag: '1등', tone: 'chosen' }), set(c2, { tag: '2등', tone: 'queued' }), calcTo(`1등 ${prev[first]} · 2등 ${prev[second]}`)]), wait(300), { type: 'unfocus' });

    for (let j = 0; j < COLS; j++) {
      const cell: Cell = [i, j];
      const useFirst = j !== first;
      const source = useFirst ? c1 : c2;
      const add = useFirst ? prev[first] : prev[second];
      const settling = settle();
      now = { cell, orig: LAND[i][j], add, total: LAND[i][j] + add };
      dp[i][j] = now.total;
      lit = cell;
      done++;
      const formula = `${now.orig} + ${add}`;

      rec.step({ title: `dp[${i}][${j}] = ${formula} = ${now.total}`, codeHighlights: TOP2_AT.add, ...meta() });
      rec.phase('윗줄 고르기', useFirst
        ? `${j}열은 1등의 열(${first})과 달라서 1등 ${josa(add, '을', '를')} 씁니다.`
        : `${j}열은 1등과 같은 열이라 밟을 수 없어서 2등 ${josa(add, '을', '를')} 씁니다.`, TOP2_AT.pick);
      rec.do(...together([...settling, paint(cell, 'current'), focus(cell, source), calcTo(formula)]));
      rec.do(look(cell, source, 'good', useFirst ? '1등' : '2등'), wait(300));
      rec.phase('더하기', addCaption(now.orig, add, now.total, cell), TOP2_AT.add);
      rec.do(...together([set(cell, { text: String(now.total), sub: `원래 ${now.orig}` }, true), calcTo(`${formula} = ${now.total}`)]), wait(300), ...clear());
    }
  }

  const settling = [...settle(), ...unrank()];
  const [li, lj] = ROUTE.at(-1)!;
  rec.step({ title: `답: 마지막 줄 최댓값 ${ANSWER}`, codeHighlights: TOP2_AT.done, ...meta(), answer: ANSWER, isKeyframe: true });
  rec.phase('답', `마지막 줄에서 가장 큰 dp[${li}][${lj}] = ${josa(ANSWER, '이', '가')} 답입니다. 칸마다 1등·2등만 보고 계산했습니다.`);
  rec.do(...together([...settling, ...ROUTE.map((c) => paint(c, 'path')), calcTo(routeText)]));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정 줄마다 가장 큰 칸 고르기: 고르기 → 밟기, 오답 확인 → 놓친 길          */
/* ------------------------------------------------------------------ */

const SUM_TOKEN: Item = { id: 'sum', kind: 'token', rect: { x: W - 120, y: CALC_Y, w: 120, h: 28 }, tone: 'chosen', text: '합 0' };
const RESULT_Y = CALC_Y + 28 + 8;
const TRAP_CALC: Rect = { x: 0, y: CALC_Y, w: W - 128, h: 28 };

function greedy(): Visualization {
  const rec = new StepRecorder(board(TRAP_CALC, RESULT_Y + 28, SUM_TOKEN));
  let total = 0;
  let picked: Cell | undefined;
  let lit: Cell | undefined;
  const meta = () => ({ work: picked ? picked[0] + 1 : 0, variables: { i: picked ? picked[0] : '-', 'prev (밟은 열)': picked ? picked[1] : -1, total } });

  rec.step({ title: '줄마다 가장 큰 칸 고르기', codeHighlights: GREEDY_AT.start, ...meta() });
  rec.phase('시작', '줄마다 밟을 수 있는 칸 중 가장 큰 칸을 고르면 답이 될까요? 이 방법으로 내려가 봅니다.');
  rec.do(calcTo('가장 큰 칸을 고른다'));
  rec.phase('규칙', '윗줄에서 밟은 열만 빼고, 줄마다 가장 큰 칸을 하나씩 고릅니다.');
  rec.do(calcTo('가장 큰 칸 · 다른 열'));

  for (let i = 0; i < ROWS; i++) {
    const [, pick] = GREEDY[i];
    const prevCell = i ? GREEDY[i - 1] : undefined;
    const candidates = rowOf(i).filter(([, c]) => c !== prevCell?.[1]);
    const best = LAND[i][pick];
    const settling = lit ? [paint(lit, 'chosen')] : [];
    picked = GREEDY[i];
    lit = picked;
    total += best;
    const prevText = prevCell ? `${josa(LAND[prevCell[0]][prevCell[1]], '을', '를')} 밟았으니 ${prevCell[1]}열은 빼고, ` : '';

    rec.step({ title: `${i}행: ${pick}열의 ${best} 고르기`, codeHighlights: GREEDY_AT.step, ...meta() });
    rec.phase('고르기', `${prevText}${i}행에서 가장 큰 칸은 ${pick}열의 ${best}입니다.`, GREEDY_AT.pick);
    rec.do(...together([...settling, focus(...(prevCell ? [prevCell, [i, prevCell[1]] as Cell] : []), ...candidates), calcTo(`max(${candidates.map(([a, b]) => LAND[a][b]).join(', ')}) = ${best}`)]));
    if (prevCell) {
      rec.do(
        look(prevCell, [i, prevCell[1]], 'wall', '같은 열'),
        ...candidates.map((c) => look(prevCell, c, c[1] === pick ? 'good' : 'seen', String(LAND[c[0]][c[1]]))),
      );
    } else rec.do(wait(500));
    rec.phase('밟기', `${pick}열의 ${josa(best, '을', '를')} 밟습니다. 점수 합은 ${josa(total, '이', '가')} 됩니다.`, GREEDY_AT.step);
    rec.do(...together([paint(picked, 'current'), { type: 'set', id: 'sum', patch: { text: `합 ${total}` }, pop: true }, calcTo(GREEDY.slice(0, i + 1).map(([a, b]) => LAND[a][b]).join(' + ') + ` = ${total}`)]), wait(300), ...clear());
  }

  // 결과: 탐욕으로 고른 칸은 오답 색, 정답 경로는 초록으로 나란히 보여 준다
  const settling = lit ? [paint(lit, 'chosen')] : [];
  rec.step({ title: `오답 확인: ${total}, 정답은 ${ANSWER}`, codeHighlights: GREEDY_AT.done, ...meta(), answer: total, isKeyframe: true });
  rec.phase('오답 확인', `가장 큰 칸만 따라가면 합은 ${total}입니다. 하지만 정답은 ${ANSWER}입니다.`);
  rec.do(...together([...settling, ...GREEDY.map((c) => paint(c, 'bad')), calcTo(`내 답 = ${GREEDY.map(([a, b]) => LAND[a][b]).join(' + ')} = ${total}`)]));
  rec.do({ type: 'add', item: { id: 'mine', kind: 'token', rect: { x: X0, y: RESULT_Y, w: 110, h: 28 }, tone: 'bad', text: `내 답 ${total}` } });
  rec.phase('놓친 길', `처음에 가장 큰 ${Math.max(...LAND[0])} 대신 ${josa(LAND[ROUTE[0][0]][ROUTE[0][1]], '을', '를')} 밟고 내려가면 합 ${josa(ANSWER, '을', '를')} 얻습니다.`);
  rec.do(...together([...ROUTE.map((c) => paint(c, 'good')), calcTo(`정답 = ${routeText}`)]));
  rec.do({ type: 'add', item: { id: 'truth', kind: 'token', rect: { x: X0 + 122, y: RESULT_Y, w: 110, h: 28 }, tone: 'good', text: `정답 ${ANSWER}` } }, wait(300));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'land-grab',
  title: '땅따먹기',
  level: 2,
  category: 'dp',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12913',
  description: {
    summary:
      'N행 4열의 땅이 있고 칸마다 점수가 적혀 있습니다. 첫 줄부터 마지막 줄까지 줄마다 한 칸씩 밟고 내려가되, 바로 윗줄에서 밟은 열은 밟을 수 없습니다. 얻을 수 있는 점수 합의 최댓값을 구합니다.',
    rules: [
      '행의 수 N은 100,000 이하의 자연수이고 열은 항상 4개',
      '칸의 점수는 100 이하의 자연수',
      '줄마다 정확히 한 칸을 밟고, 같은 열을 연속된 두 줄에서 밟을 수 없음',
    ],
    examples: [{ input: 'land = [[1, 2, 3, 5], [5, 6, 7, 8], [4, 3, 2, 1]]', output: '16' }],
  },
  keyIntuitions: [
    '줄마다 가장 큰 칸만 고르면 다음 줄의 큰 칸을 놓칠 수 있습니다. 지금 큰 값이 끝까지 가장 큰 합으로 이어진다는 보장이 없습니다.',
    'i행 j열을 밟았을 때까지의 최대 점수 dp[i][j]는 점수 + (윗줄에서 같은 열을 뺀 세 칸의 dp 최댓값)입니다. 윗줄의 dp만 알면 됩니다.',
    '0행부터 마지막 줄까지 4칸씩 채우면 칸 수가 N × 4로 끝나고, 마지막 줄의 최댓값이 답입니다.',
  ],
  demo: { input: [LAND], label: `land = [${LAND.map((r) => `[${r.join(', ')}]`).join(', ')}]` },
  workUnit: '점수를 정한 칸 수',
  approaches: [
    {
      id: 'land-row-max',
      name: '윗줄 다른 열의 최댓값을 더하기',
      rank: 'BEST',
      timeComplexity: 'O(N × 4 × 3) = O(N)',
      spaceComplexity: 'O(N × 4), 원본에 누적하면 추가 O(1)',
      verdict: '줄마다 칸의 최대 점수를 윗줄의 다른 열 세 칸에서 가장 큰 값으로 이어 붙여 내려가는 풀이입니다.',
      pros: [
        '"같은 열만 빼고 최댓값"이라는 규칙이 코드 한 줄과 같아 틀리기 어렵습니다.',
        '칸마다 한 번씩만 계산해 N = 100,000이어도 40만 칸이면 끝납니다.',
        '열이 4개뿐이라 윗줄 세 칸을 매번 훑어도 부담이 없습니다.',
      ],
      cons: ['원본 land를 그대로 쓰면 값이 바뀌므로 복사해서 쓰거나 바뀌어도 되는지 확인해야 합니다.'],
      whyThisRank:
        '윗줄의 dp 값만 있으면 다음 줄이 정해져서 상태가 단순합니다. 같은 열만 빼는 조건을 그대로 코드로 옮겨 가장 읽기 쉽고 안전합니다.',
      code: TABLE,
      visualize: table,
    },
    {
      id: 'land-top-two',
      name: '윗줄의 1등·2등만 기억하기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N × 4), 원본에 누적하면 추가 O(1)',
      verdict: '윗줄에서 가장 큰 칸과 두 번째로 큰 칸만 찾아 두고 칸마다 골라 쓰지만, 코드가 길어지고 이 문제의 규칙에만 맞는 풀이입니다.',
      pros: ['줄마다 윗줄을 한 번만 훑어 1등·2등을 구하면 칸마다 비교할 것이 없습니다.', '열이 아주 많아지는 비슷한 문제로 넓히면 계산 횟수가 줄어듭니다.'],
      cons: [
        '"같은 열 하나만 못 밟는다"는 규칙에서만 맞습니다. 못 밟는 열이 둘로 늘면 3등까지 필요합니다.',
        '1등과 2등의 열을 따로 기억하고 값이 같을 때(동점)도 챙겨야 해서 실수하기 쉽습니다.',
      ],
      whyThisRank:
        '열이 4개뿐이라 줄여서 얻는 이득이 거의 없습니다. 코드는 길어지고 규칙이 바뀌면 쓸 수 없어서, 세 칸을 그대로 훑는 정석이 더 안전합니다.',
      code: TOP2,
      visualize: top2,
    },
    {
      id: 'land-greedy',
      name: '줄마다 가장 큰 칸만 고르기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: '줄마다 밟을 수 있는 가장 큰 칸을 고르면 빠르지만, 지금의 큰 값 때문에 다음 줄의 더 큰 값을 놓쳐 오답이 나옵니다.',
      pros: ['코드가 짧고 빠르며 가장 먼저 떠오르는 방법입니다.', '원문 입출력 예처럼 우연히 정답이 되는 경우도 있습니다.'],
      cons: [
        '시각화 입력에서 9, 7, 3을 밟아 19점이지만, 7, 9, 9를 밟으면 25점입니다.',
        '지금 고른 칸이 다음 줄에서 막을 칸을 계산하지 않아, 앞선 선택을 되돌릴 방법이 없습니다.',
      ],
      whyThisRank:
        '윗줄의 선택이 아랫줄에서 못 밟을 열을 정하므로 지금의 최선이 전체의 최선이 아닙니다. 줄마다 "각 열에서 끝나는 최대 점수"를 기억하는 DP가 정답입니다.',
      code: GREEDY_CODE,
      visualize: greedy,
    },
  ],
  checks: {
    cases: [
      { args: [[[1, 2, 3, 5], [5, 6, 7, 8], [4, 3, 2, 1]]], expected: 16 },
      { args: [LAND], expected: ANSWER },
      { args: [[[1, 2, 3, 4]]], expected: 4 },
      { args: [[[4, 1, 1, 1], [4, 1, 1, 1]]], expected: 5 },
      { args: [[[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]], expected: 3 },
      { args: [Array.from({ length: 100000 }, () => [100, 100, 100, 100])], expected: 10000000 },
    ],
    // 1~6행, 점수 1~9
    random: (rand) => [Array.from({ length: 1 + Math.floor(rand() * 6) }, () => Array.from({ length: 4 }, () => 1 + Math.floor(rand() * 9)))],
  },
};

export default problem;
