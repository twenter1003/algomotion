// 가장 큰 정사각형 찾기: 정석 min + 1 표 채우기, 대안 두 줄만 기억하는 표 채우기, 함정 대각선을 빼먹는 min + 1을 같은 격자에서 움직인다.
// 장면은 4 × 4 격자(행·열 번호는 코드처럼 0부터), 아래쪽 계산 글 줄과 가장 큰 변 표시이다. 함정은 그 아래에 내 답·정답 표시를 더 둔다.
import { around } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Language, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, together } from '../shared.ts';

type Cell = [number, number]; // [i, j]: i행 j열 (0부터)

// 시각화 입력: 1 하나가 (1, 1)에 구멍으로 뚫린 4 × 4. 정답은 2 × 2 = 4인데, 대각선을 빼먹으면 구멍 난 4 × 4를 정사각형이라 하여 16이라고 답한다
const BOARD = [[1, 1, 1, 1], [1, 0, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]];
const ROWS = BOARD.length;
const COLS = BOARD[0].length;

// 정석 표(대각선까지 보는 값)와 함정 표(대각선을 빼먹은 값). 첫 줄·첫 열은 칸 값 그대로다
const fillTable = (diagonal: boolean): number[][] => {
  const dp = BOARD.map((row) => [...row]);
  for (let i = 1; i < ROWS; i++) {
    for (let j = 1; j < COLS; j++) {
      if (dp[i][j] === 1) dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], ...(diagonal ? [dp[i - 1][j - 1]] : [])) + 1;
    }
  }
  return dp;
};
const TRUE_DP = fillTable(true);
const TRAP_DP = fillTable(false);
const biggest = (dp: number[][]) => dp.flat().reduce((m, v) => Math.max(m, v), 0);
// 표에서 가장 큰 값이 처음 나오는 칸(왼쪽 위부터 읽는 차례)
const firstMax = (dp: number[][]): Cell => {
  const best = biggest(dp);
  for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) if (dp[i][j] === best) return [i, j];
  return [0, 0];
};

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TABLE = {
  python: `def solution(board):
    rows, cols = len(board), len(board[0])
    dp = [row[:] for row in board]  # dp[i][j] = (i, j)를 오른쪽 아래 모서리로 하는 가장 큰 정사각형의 한 변
    best = max(max(row) for row in dp)  # 1이 하나라도 있으면 한 변 1

    for i in range(1, rows):
        for j in range(1, cols):
            if dp[i][j] == 1:
                # 위, 왼쪽, 왼쪽 위 중 가장 작은 정사각형에 1을 더합니다
                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
                best = max(best, dp[i][j])

    return best * best`,
  javascript: `function solution(board) {
  const rows = board.length;
  const cols = board[0].length;
  const dp = board.map((row) => [...row]); // dp[i][j] = (i, j)를 오른쪽 아래 모서리로 하는 가장 큰 정사각형의 한 변
  let best = 0;
  for (const row of dp) for (const v of row) best = Math.max(best, v); // 1이 하나라도 있으면 한 변 1

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (dp[i][j] === 1) {
        // 위, 왼쪽, 왼쪽 위 중 가장 작은 정사각형에 1을 더합니다
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
        best = Math.max(best, dp[i][j]);
      }
    }
  }

  return best * best;
}`,
};
const TABLE_AT = {
  start: lines(TABLE, ['rows, cols = len(board)', 'dp = [row[:]', 'best = max(max(row)'], ['const rows', 'const cols', 'const dp = board.map', 'let best = 0', 'for (const row of dp)']),
  look: lines(TABLE, ['for i in range(1, rows)', 'for j in range(1, cols)', 'if dp[i][j] == 1', 'dp[i][j] = min('], ['for (let i = 1', 'for (let j = 1', 'if (dp[i][j] === 1)', 'dp[i][j] = Math.min(']),
  add: lines(TABLE, ['dp[i][j] = min(', 'best = max(best, dp[i][j])'], ['dp[i][j] = Math.min(', 'best = Math.max(best, dp[i][j])']),
  zero: lines(TABLE, ['for i in range(1, rows)', 'for j in range(1, cols)', 'if dp[i][j] == 1'], ['for (let i = 1', 'for (let j = 1', 'if (dp[i][j] === 1)']),
  done: lines(TABLE, ['return best * best'], ['return best * best']),
};

const ROLL = {
  python: `def solution(board):
    rows, cols = len(board), len(board[0])
    prev = board[0][:]  # 바로 윗줄의 dp 값 (두 줄만 기억합니다)
    best = max(max(row) for row in board)  # 1이 하나라도 있으면 한 변 1

    for i in range(1, rows):
        cur = board[i][:]  # 이번 줄의 dp 값
        for j in range(1, cols):
            if cur[j] == 1:
                cur[j] = min(prev[j], cur[j - 1], prev[j - 1]) + 1
                best = max(best, cur[j])
        prev = cur  # 지난 줄은 버립니다

    return best * best`,
  javascript: `function solution(board) {
  const rows = board.length;
  const cols = board[0].length;
  let prev = [...board[0]]; // 바로 윗줄의 dp 값 (두 줄만 기억합니다)
  let best = 0;
  for (const row of board) for (const v of row) best = Math.max(best, v); // 1이 하나라도 있으면 한 변 1

  for (let i = 1; i < rows; i++) {
    const cur = [...board[i]]; // 이번 줄의 dp 값
    for (let j = 1; j < cols; j++) {
      if (cur[j] === 1) {
        cur[j] = Math.min(prev[j], cur[j - 1], prev[j - 1]) + 1;
        best = Math.max(best, cur[j]);
      }
    }
    prev = cur; // 지난 줄은 버립니다
  }

  return best * best;
}`,
};
const ROLL_AT = {
  start: lines(ROLL, ['rows, cols = len(board)', 'prev = board[0][:]', 'best = max(max(row)'], ['const rows', 'const cols', 'let prev = [...board[0]]', 'let best = 0', 'for (const row of board)']),
  look: lines(ROLL, ['for i in range(1, rows)', 'cur = board[i][:]', 'for j in range(1, cols)', 'if cur[j] == 1', 'cur[j] = min('], ['for (let i = 1', 'const cur = [...board[i]]', 'for (let j = 1', 'if (cur[j] === 1)', 'cur[j] = Math.min(']),
  add: lines(ROLL, ['cur[j] = min(', 'best = max(best, cur[j])'], ['cur[j] = Math.min(', 'best = Math.max(best, cur[j])']),
  zero: lines(ROLL, ['for i in range(1, rows)', 'cur = board[i][:]', 'for j in range(1, cols)', 'if cur[j] == 1'], ['for (let i = 1', 'const cur = [...board[i]]', 'for (let j = 1', 'if (cur[j] === 1)']),
  drop: lines(ROLL, ['prev = cur'], ['prev = cur']),
  done: lines(ROLL, ['return best * best'], ['return best * best']),
};

const NO_DIAGONAL = {
  python: `# 주의: 왼쪽 위(대각선)를 빼먹어 구멍 난 정사각형도 인정하는 풀이입니다
def solution(board):
    rows, cols = len(board), len(board[0])
    dp = [row[:] for row in board]
    best = max(max(row) for row in dp)

    for i in range(1, rows):
        for j in range(1, cols):
            if dp[i][j] == 1:
                # 위와 왼쪽만 보고 대각선은 안 봅니다 → 구멍을 놓칩니다
                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + 1
                best = max(best, dp[i][j])

    return best * best`,
  javascript: `// 주의: 왼쪽 위(대각선)를 빼먹어 구멍 난 정사각형도 인정하는 풀이입니다
function solution(board) {
  const rows = board.length;
  const cols = board[0].length;
  const dp = board.map((row) => [...row]);
  let best = 0;
  for (const row of dp) for (const v of row) best = Math.max(best, v);

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (dp[i][j] === 1) {
        // 위와 왼쪽만 보고 대각선은 안 봅니다 → 구멍을 놓칩니다
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + 1;
        best = Math.max(best, dp[i][j]);
      }
    }
  }

  return best * best;
}`,
};
const WRONG_AT = {
  start: lines(NO_DIAGONAL, ['rows, cols = len(board)', 'dp = [row[:]', 'best = max(max(row)'], ['const rows', 'const cols', 'const dp = board.map', 'let best = 0', 'for (const row of dp)']),
  look: lines(NO_DIAGONAL, ['for i in range(1, rows)', 'for j in range(1, cols)', 'if dp[i][j] == 1', 'dp[i][j] = min('], ['for (let i = 1', 'for (let j = 1', 'if (dp[i][j] === 1)', 'dp[i][j] = Math.min(']),
  add: lines(NO_DIAGONAL, ['dp[i][j] = min(', 'best = max(best, dp[i][j])'], ['dp[i][j] = Math.min(', 'best = Math.max(best, dp[i][j])']),
  zero: lines(NO_DIAGONAL, ['for i in range(1, rows)', 'for j in range(1, cols)', 'if dp[i][j] == 1'], ['for (let i = 1', 'for (let j = 1', 'if (dp[i][j] === 1)']),
  done: lines(NO_DIAGONAL, ['return best * best'], ['return best * best']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 열 이름표는 맨 위 0~16, 행 이름표는 맨 왼쪽 0~34, 칸은 (40, 28)부터. 칸 위 11px에 붙는 판정 표시가 윗줄 칸과 겹치지 않게 칸 사이는 12px,
// 가장 큰 정사각형 테두리(칸 둘레 5px)와 판정 표시가 오른쪽·아래에서 잘리지 않게 8px 여백을 둔다.
const X0 = 40;
const Y0 = 28;
const PITCH = 66;
const cellRect = (i: number, j: number): Rect => ({ x: X0 + j * PITCH, y: Y0 + i * PITCH, w: 54, h: 54 });
const W = X0 + COLS * PITCH - 12 + 8;
const CALC_Y = Y0 + ROWS * PITCH - 12 + 16;
const HEIGHT = CALC_Y + 28;
const cellId = ([i, j]: Cell) => `cell:${i},${j}`;
const wait = (ms: number): Action => ({ type: 'wait', ms });
const set = (c: Cell, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: cellId(c), patch, ...(pop ? { pop } : {}) });
const paint = (c: Cell, tone: Tone) => set(c, { tone });
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });
const bestTo = (best: number): Action => ({ type: 'set', id: 'best', patch: { text: `가장 큰 변 ${best}` }, pop: true });
const focus = (...cells: Cell[]): Action => ({ type: 'focus', ids: cells.map(cellId) });
const clear = (): Action[] => together([{ type: 'clearMarks' }, { type: 'unfocus' }]);
const look = (from: Cell, to: Cell, verdict: Verdict, label: string): Action => ({ type: 'arrow', from: cellId(from), to: cellId(to), verdict, label });
const squareRing = ([i, j]: Cell, side: number): Item => {
  const [a, b] = [cellRect(i - side + 1, j - side + 1), cellRect(i, j)];
  return { id: 'ring', kind: 'ring', rect: around({ x: a.x, y: a.y, w: b.x + b.w - a.x, h: b.y + b.h - a.y }, 5) };
};
const squareCells = ([i, j]: Cell, side: number): Cell[] =>
  Array.from({ length: side * side }, (_, k): Cell => [i - side + 1 + Math.floor(k / side), j - side + 1 + (k % side)]);

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

// 세 풀이가 같이 쓰는 장면: 행·열 이름표, 칸 16개(1은 흰 칸, 0은 빗금 칸), 계산 글, 가장 큰 변 표시. extra는 함정의 결과 표시
const BEST: Item = { id: 'best', kind: 'token', rect: { x: W - 128, y: CALC_Y, w: 120, h: 28 }, tone: 'chosen', text: '가장 큰 변 1' };
function board(height: number, ...extra: Item[]): Scene {
  const items: Item[] = [];
  for (let j = 0; j < COLS; j++) items.push({ id: `col:${j}`, kind: 'text', rect: { x: cellRect(0, j).x, y: 0, w: 54, h: 16 }, tone: 'muted', text: `${j}열` });
  for (let i = 0; i < ROWS; i++) {
    items.push({ id: `row:${i}`, kind: 'text', rect: { x: 0, y: cellRect(i, 0).y, w: 34, h: 54 }, tone: 'muted', text: `${i}행` });
    for (let j = 0; j < COLS; j++) items.push({ id: cellId([i, j]), kind: 'cell', rect: cellRect(i, j), tone: BOARD[i][j] ? 'plain' : 'wall', text: String(BOARD[i][j]) });
  }
  items.push({ id: 'calc', kind: 'text', rect: { x: 0, y: CALC_Y, w: W - 136, h: 28 }, text: '' }, BEST, ...extra);
  return { width: W, height, items };
}

// 안쪽 칸 하나를 계산한 뒤의 모습(정석·대안·함정이 같이 쓰는 변수)
interface Now { cell: Cell; up: number; left: number; diag: number | string; value: number }
const FIRST_LINE = '첫 줄과 첫 열은 칸 값 그대로입니다.';
const insideCells = (): Cell[] => Array.from({ length: (ROWS - 1) * (COLS - 1) }, (_, k): Cell => [1 + Math.floor(k / (COLS - 1)), 1 + (k % (COLS - 1))]);

type Lines = Record<Language, number[]>;
interface Plan {
  names: { up: string; left: string; diag: string; value: string };
  at: { start: Lines; look: Lines; add: Lines; zero: Lines; done: Lines };
  dp: number[][]; // 이 풀이가 채우는 표
  diagonal: boolean; // 왼쪽 위 칸도 보는가
  intro: string; // 규칙 마디 자막
  introCalc: string;
  answerCaption: (best: number) => string;
  rows: 'keep' | 'drop'; // drop이면 한 줄이 끝날 때 윗줄을 버린다
  dropAt?: Lines;
}

function build(plan: Plan): Visualization {
  const trap = plan.dp === TRAP_DP;
  const rec = new StepRecorder(board(trap ? HEIGHT + 36 : HEIGHT));
  const resultY = HEIGHT + 4;
  const dp = BOARD.map((row) => [...row]);
  let now: Now | undefined;
  let lit: Cell | undefined; // 노란 칸(바로 전에 계산한 칸)
  let best = 1; // 1이 하나라도 있으면 한 변 1
  let done = 0; // 계산한 안쪽 칸 수
  const wrong = new Set<string>(); // 오답을 적은 칸(함정)
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({
    work: done,
    variables: {
      i: now ? now.cell[0] : '-',
      j: now ? now.cell[1] : '-',
      [plan.names.up]: now?.up ?? '-',
      [plan.names.left]: now?.left ?? '-',
      ...(plan.diagonal ? { [plan.names.diag]: now?.diag ?? '-' } : {}),
      [plan.names.value]: now?.value ?? '-',
      best,
    },
  });
  const settle = (): Action[] => (lit ? [paint(lit, wrong.has(cellId(lit)) ? 'bad' : 'visited')] : []);
  const kept = (i: number): Cell[] => Array.from({ length: COLS }, (_, j): Cell => [i, j]);

  rec.step({ title: '첫 줄과 첫 열은 그대로', codeHighlights: plan.at.start, ...meta() });
  rec.phase('시작', `0과 1로 된 ${ROWS} × ${COLS} 표에서 1로만 이루어진 가장 큰 정사각형의 넓이를 구합니다.`);
  rec.do(calcTo('1로만 된 가장 큰 정사각형'));
  rec.phase('규칙', plan.intro);
  rec.do(...together([
    ...kept(0).map((c) => paint(c, BOARD[0][c[1]] ? 'visited' : 'wall')),
    ...Array.from({ length: ROWS - 1 }, (_, i): Cell => [i + 1, 0]).map((c) => paint(c, BOARD[c[0]][0] ? 'visited' : 'wall')),
    calcTo(plan.introCalc),
  ]));

  for (const cell of insideCells()) {
    const [i, j] = cell;
    const settling = settle();
    const where = `(${i}, ${j})`;
    const isLast = j === COLS - 1;

    if (!BOARD[i][j]) {
      lit = undefined;
      now = { cell, up: dp[i - 1][j], left: dp[i][j - 1], diag: plan.diagonal ? dp[i - 1][j - 1] : '-', value: 0 };
      done++;
      rec.step({ title: `dp[${i}][${j}] = 0 (칸이 0)`, codeHighlights: plan.at.zero, ...meta() });
      rec.phase('칸 확인', `${josa(where, '은', '는')} 0이라 정사각형의 모서리가 될 수 없습니다.`, plan.at.zero);
      rec.do(...together([...settling, focus(cell), calcTo(`${where} = 0`)]));
      rec.phase('그대로 두기', `${josa(`dp[${i}][${j}]`, '은', '는')} 0 그대로입니다.`, plan.at.zero);
      rec.do(wait(300), { type: 'unfocus' });
      if (plan.rows === 'drop' && isLast) dropRow(i);
      continue;
    }

    const up = dp[i - 1][j];
    const left = dp[i][j - 1];
    const diag = dp[i - 1][j - 1];
    const seen = plan.diagonal ? [up, left, diag] : [up, left];
    const m = Math.min(...seen);
    const value = plan.dp[i][j]; // 이 풀이가 적는 값(함정은 대각선을 빼먹은 값)
    const fixed = Math.min(up, left, diag) + 1; // 대각선까지 봤다면 적었을 값
    const bestBefore = best;
    dp[i][j] = value;
    now = { cell, up, left, diag: plan.diagonal ? diag : '-', value };
    lit = cell;
    done++;
    best = Math.max(best, value);
    const isWrong = value !== fixed;
    if (isWrong) wrong.add(cellId(cell));
    const sources: Cell[] = plan.diagonal ? [[i - 1, j], [i, j - 1], [i - 1, j - 1]] : [[i - 1, j], [i, j - 1]];
    const formula = `min(${seen.join(', ')})`;

    rec.step({ title: `dp[${i}][${j}] = ${formula} + 1 = ${value}`, codeHighlights: plan.at.add, ...meta() });
    rec.phase(plan.diagonal ? '세 칸 보기' : '두 칸 보기', plan.diagonal
      ? `${where}의 위는 ${up}, 왼쪽은 ${left}, 왼쪽 위는 ${diag}입니다. 가장 작은 값은 ${m}입니다.`
      : `${where}의 위는 ${up}, 왼쪽은 ${left}입니다. 두 값 중 작은 값은 ${m}입니다.`, plan.at.look);
    rec.do(...together([...settling, paint(cell, 'current'), focus(cell, ...sources), calcTo(formula)]));
    rec.do(...sources.map((s, n) => look(cell, s, seen[n] === m ? 'good' : 'seen', String(seen[n]))), wait(300));
    rec.phase('더하기', `가장 작은 값 ${m}에 1을 더해 dp[${i}][${j}] = ${value}입니다.`, plan.at.add);
    rec.do(...together([set(cell, { text: String(value) }, true), ...(best > bestBefore ? [bestTo(best)] : []), calcTo(`${formula} + 1 = ${value}`)]), wait(300), ...clear());
    if (isWrong) {
      rec.phase('놓친 칸', `왼쪽 위 (${i - 1}, ${j - 1})의 ${josa(diag, '을', '를')} 안 봐서 ${josa(value, '이', '가')} 됐습니다. 대각선까지 보면 ${fixed}입니다.`, plan.at.add);
      rec.do(look(cell, [i - 1, j - 1], 'bad', `안 봄 ${diag}`), ...together([paint(cell, 'bad')], true), wait(300), ...clear());
    }
    if (plan.rows === 'drop' && isLast) dropRow(i);
  }

  // 한 줄을 다 계산하면 바로 윗줄(두 줄만 기억하는 풀이)을 버린다
  function dropRow(i: number): void {
    if (i < 1 || !plan.dropAt) return;
    rec.phase('지난 줄 버리기', `${i}행을 다 계산했으니 ${i - 1}행의 값은 더 쓰지 않아 버립니다. 이제 ${i}행만 기억합니다.`, plan.dropAt);
    rec.do(...together([...kept(i - 1).map((c) => set(c, { text: '', tone: 'muted' })), calcTo(`${i - 1}행은 버림`)]));
  }

  const [bi, bj] = firstMax(dp);
  const side = biggest(dp);
  const settling = settle();
  rec.step({ title: `답: 변 ${side} → 넓이 ${side * side}`, codeHighlights: plan.at.done, ...meta(), answer: side * side, isKeyframe: true });
  rec.phase('답', plan.answerCaption(side));
  if (trap) {
    // 함정: 구멍이 든 정사각형을 정답처럼 둘러싸고, 정석의 진짜 가장 큰 정사각형을 나란히 보여 준다
    const trueSide = biggest(TRUE_DP);
    const [ti, tj] = firstMax(TRUE_DP);
    rec.do(...together([...settling, { type: 'add', item: squareRing([bi, bj], side) } as Action, calcTo(`내 답 = ${side} × ${side} = ${side * side}`)]));
    rec.do({ type: 'add', item: { id: 'mine', kind: 'token', rect: { x: X0, y: resultY, w: 110, h: 28 }, tone: 'bad', text: `내 답 ${side * side}` } });
    rec.phase('놓친 구멍', `이 정사각형 안에 0이 있습니다. 진짜로 1만 있는 가장 큰 정사각형은 ${trueSide} × ${trueSide} = ${trueSide * trueSide}입니다.`);
    rec.do(...together([...squareCells([ti, tj], trueSide).map((c) => paint(c, 'good')), calcTo(`정답 = ${trueSide} × ${trueSide} = ${trueSide * trueSide}`)]));
    rec.do({ type: 'add', item: { id: 'truth', kind: 'token', rect: { x: X0 + 122, y: resultY, w: 110, h: 28 }, tone: 'good', text: `정답 ${trueSide * trueSide}` } }, wait(300));
  } else if (plan.rows === 'keep') {
    rec.do(...together([...settling, ...squareCells([bi, bj], side).map((c) => paint(c, 'path')), { type: 'add', item: squareRing([bi, bj], side) } as Action, calcTo(`${side} × ${side} = ${side * side}`)]));
  } else {
    // 지난 줄을 버렸으니 표에는 가장 큰 정사각형이 남아 있지 않다: best 표시로 보여 준다
    rec.do(...together([...settling, { type: 'set', id: 'best', patch: { tone: 'path' } }, calcTo(`${side} × ${side} = ${side * side}`)]));
  }
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'largest-square',
  title: '가장 큰 정사각형 찾기',
  level: 2,
  category: 'dp',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12905',
  description: {
    summary:
      '0과 1로만 이루어진 표에서 1로만 채워진 가장 큰 정사각형을 찾아 그 넓이를 구합니다. 정사각형의 변은 표의 가로, 세로와 나란해야 합니다.',
    rules: [
      '표의 행과 열의 크기는 각각 1,000 이하의 자연수',
      '표의 값은 0 또는 1',
      '1로만 이루어진 정사각형 중 가장 큰 것의 넓이를 return',
    ],
    examples: [
      { input: 'board = [[0, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [0, 0, 1, 0]]', output: '9' },
      { input: 'board = [[0, 0, 1, 1], [1, 1, 1, 1]]', output: '4' },
    ],
  },
  keyIntuitions: [
    '칸마다 "이 칸을 오른쪽 아래 모서리로 하는 가장 큰 정사각형의 한 변"을 dp[i][j]로 두면, 모든 정사각형을 직접 확인하지 않아도 됩니다.',
    '칸이 1이면 dp[i][j] = min(위, 왼쪽, 왼쪽 위) + 1입니다. 세 방향의 정사각형이 모두 자라야 이 칸까지 한 칸 더 큰 정사각형이 되므로 가장 작은 값을 고릅니다.',
    '왼쪽 위(대각선)까지 봐야 합니다. 위와 왼쪽만 보면 대각선에 있는 0 하나가 만드는 구멍을 놓쳐 정사각형이 실제보다 크게 나옵니다.',
  ],
  demo: { input: [BOARD], label: `board = [${BOARD.map((r) => `[${r.join(', ')}]`).join(', ')}]` },
  workUnit: '계산한 칸 수',
  approaches: [
    {
      id: 'square-min-plus-one',
      name: '위·왼쪽·왼쪽 위의 최솟값 + 1',
      rank: 'BEST',
      timeComplexity: 'O(행 × 열)',
      spaceComplexity: 'O(행 × 열), 원본에 덮어쓰면 추가 O(1)',
      verdict: '칸마다 위, 왼쪽, 왼쪽 위 세 칸 중 가장 작은 값에 1을 더하는 한 줄로 가장 큰 정사각형의 변을 구하는 풀이입니다.',
      pros: [
        '모든 정사각형을 확인하지 않고 칸마다 세 칸만 보므로 1,000 × 1,000도 100만 칸이면 끝납니다.',
        '"가장 작은 값 + 1"이라는 식 하나가 곧 점화식이라 코드가 짧습니다.',
        '지나간 칸만 쓰므로 왼쪽 위부터 차례로 채우면 필요한 값이 이미 계산되어 있습니다.',
      ],
      cons: [
        '왼쪽 위(대각선)를 빼먹으면 구멍이 있는 정사각형을 인정하는 오답이 나옵니다.',
        '첫 줄과 첫 열은 윗줄·왼쪽이 없어 따로 두거나 한 칸 더 큰 표를 써야 합니다.',
      ],
      whyThisRank:
        '세 방향 중 가장 작은 값이 이 칸까지 이어질 수 있는 정사각형의 크기를 정하기 때문에 식이 간단하고 틀리기 어렵습니다. 모든 칸을 한 번씩만 보므로 효율도 충분합니다.',
      code: TABLE,
      visualize: () => build({
        names: { up: 'dp[i - 1][j]', left: 'dp[i][j - 1]', diag: 'dp[i - 1][j - 1]', value: 'dp[i][j]' },
        at: TABLE_AT, dp: TRUE_DP, diagonal: true, rows: 'keep',
        intro: `dp[i][j]는 (i, j)를 오른쪽 아래 모서리로 하는 가장 큰 정사각형의 한 변입니다. ${FIRST_LINE}`,
        introCalc: 'min(세 칸) + 1',
        answerCaption: (side) => `가장 큰 dp 값은 ${side}이므로 변이 ${side}인 정사각형, 넓이는 ${side} × ${side} = ${side * side}입니다.`,
      }),
    },
    {
      id: 'square-two-rows',
      name: '윗줄과 이번 줄, 두 줄만 기억하는 표 채우기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(행 × 열)',
      spaceComplexity: 'O(열)',
      verdict: '같은 식을 쓰되 바로 윗줄과 이번 줄만 남겨 메모리를 줄이지만, 줄을 바꿔 쓰는 코드가 늘어나는 풀이입니다.',
      pros: ['표 전체 대신 두 줄만 기억해 메모리가 O(열)로 줄어듭니다.', '가장 큰 변을 best 하나로 따로 기억하므로 지난 줄이 없어도 답을 구할 수 있습니다.'],
      cons: [
        '줄이 끝날 때 prev = cur로 바꿔 끼우는 것을 잊거나 같은 배열을 가리키게 하면 값이 꼬입니다.',
        '지난 줄을 버리므로 어떤 정사각형이었는지 되짚어 볼 수 없고 중간 값을 확인하기 어렵습니다.',
      ],
      whyThisRank:
        '1,000 × 1,000 표도 100만 칸 정도라 표 전체를 두는 메모리가 문제되지 않습니다. 아낄 것이 거의 없는데 코드가 복잡해져서, 표 전체에 쓰는 정석이 더 안전합니다.',
      code: ROLL,
      visualize: () => build({
        names: { up: 'prev[j]', left: 'cur[j - 1]', diag: 'prev[j - 1]', value: 'cur[j]' },
        at: { ...ROLL_AT }, dp: TRUE_DP, diagonal: true, rows: 'drop', dropAt: ROLL_AT.drop,
        intro: `윗줄 prev와 이번 줄 cur, 두 줄만 기억합니다. ${FIRST_LINE}`,
        introCalc: 'min(세 칸) + 1',
        answerCaption: (side) => `가장 큰 변은 best로 따로 기억해 둔 ${side}입니다. 넓이는 ${side} × ${side} = ${side * side}입니다.`,
      }),
    },
    {
      id: 'square-no-diagonal',
      name: '위와 왼쪽만 보는 min + 1',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(행 × 열)',
      spaceComplexity: 'O(행 × 열)',
      verdict: '위와 왼쪽만 보고 왼쪽 위(대각선)를 빼먹으면 대각선의 0이 만드는 구멍을 놓쳐 정사각형이 실제보다 크게 나옵니다.',
      pros: ['정석과 코드가 거의 같고 가장 작은 값을 고른다는 발상도 같아 맞아 보입니다.', '구멍이 없는 표(예: 원문 입출력 예)에서는 정답이 나오기도 합니다.'],
      cons: [
        '시각화 입력은 (1, 1) 하나만 0인 4 × 4인데, 대각선을 안 봐서 정사각형의 변을 4로 보고 16이라고 답합니다(정답은 4).',
        '위와 왼쪽의 정사각형이 아무리 커도, 대각선 쪽에 0이 있으면 그 칸을 모서리로 하는 정사각형은 자랄 수 없습니다.',
      ],
      whyThisRank:
        '정사각형이 한 칸 커지려면 위, 왼쪽, 왼쪽 위의 정사각형이 모두 이전 크기 이상이어야 하는데, 한 방향을 빼서 조건 하나를 잃었습니다. 세 값의 최솟값을 쓰면 정답입니다.',
      code: NO_DIAGONAL,
      visualize: () => build({
        names: { up: 'dp[i - 1][j]', left: 'dp[i][j - 1]', diag: 'dp[i - 1][j - 1]', value: 'dp[i][j]' },
        at: WRONG_AT, dp: TRAP_DP, diagonal: false, rows: 'keep',
        intro: `이 풀이는 위와 왼쪽만 봅니다. ${FIRST_LINE}`,
        introCalc: 'min(위, 왼쪽) + 1',
        answerCaption: (side) => `가장 큰 dp 값은 ${side}이므로 변이 ${side}인 정사각형, 넓이는 ${side} × ${side} = ${side * side}이라고 답합니다.`,
      }),
    },
  ],
  checks: {
    cases: [
      { args: [[[0, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [0, 0, 1, 0]]], expected: 9 },
      { args: [[[0, 0, 1, 1], [1, 1, 1, 1]]], expected: 4 },
      { args: [BOARD], expected: 4 },
      { args: [[[0]]], expected: 0 },
      { args: [[[1]]], expected: 1 },
      { args: [[[1, 1, 1]]], expected: 1 },
      { args: [[[0, 0], [0, 0]]], expected: 0 },
      { args: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: 9 },
      { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: 1 },
      { args: [Array.from({ length: 1000 }, () => Array<number>(1000).fill(1))], expected: 1000000 },
    ],
    // 1~6행, 1~6열, 칸이 1일 확률 70%
    random: (rand) => {
      const [rows, cols] = [1 + Math.floor(rand() * 6), 1 + Math.floor(rand() * 6)];
      return [Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rand() < 0.7 ? 1 : 0)))];
    },
  },
};

export default problem;
