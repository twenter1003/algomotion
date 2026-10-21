// 등굣길: 정석 위·왼쪽을 더하는 표 채우기, 대안 오른쪽·아래로 보내 주는 표 채우기, 함정 메모 없는 재귀를 같은 격자에서 움직인다.
// 장면은 5열 × 3행 격자(집은 왼쪽 위, 학교는 오른쪽 아래, 웅덩이는 회색 칸), 열·행 번호, 아래쪽 계산 글이다.
import { center, grid } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Point, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { fmt, josa, lines, ro, together } from '../shared.ts';

type Cell = [number, number]; // [x, y]: x번째 열, y번째 행(1부터). 원문의 웅덩이 좌표와 같은 모양이다
const MOD = 1_000_000_007;

// 시각화 입력. 웅덩이가 가운데에 하나 있는 5열 × 3행 격자: 정석은 칸 15개를 한 번씩, 함정은 paths를 39번 부른다.
const M = 5;
const N = 3;
const PUDDLES: Cell[] = [[2, 2]];
const HOME: Cell = [1, 1];
const SCHOOL: Cell = [M, N];
const key = ([x, y]: Cell) => `${x},${y}`;
const same = (a: Cell, b: Cell) => key(a) === key(b);
const isPuddle = (c: Cell) => PUDDLES.some((p) => same(p, c));
const cellId = (c: Cell) => `cell:${key(c)}`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const PULL = {
  python: `def solution(m, n, puddles):
    MOD = 1_000_000_007
    blocked = {(x, y) for x, y in puddles}  # 웅덩이 좌표는 [열, 행] 순서

    dp = [[0] * (m + 1) for _ in range(n + 1)]  # 0번 줄과 0번 열은 표 바깥(길 0가지)
    dp[1][1] = 1

    for y in range(1, n + 1):
        for x in range(1, m + 1):
            if (x, y) == (1, 1):
                continue
            if (x, y) in blocked:
                dp[y][x] = 0  # 웅덩이로 오는 길은 없습니다
            else:
                dp[y][x] = (dp[y - 1][x] + dp[y][x - 1]) % MOD  # 위 + 왼쪽

    return dp[n][m]`,
  javascript: `function solution(m, n, puddles) {
  const MOD = 1_000_000_007;
  const blocked = new Set(puddles.map(([x, y]) => x + ',' + y)); // 웅덩이 좌표는 [열, 행] 순서

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0)); // 0번 줄과 0번 열은 표 바깥(길 0가지)
  dp[1][1] = 1;

  for (let y = 1; y <= n; y++) {
    for (let x = 1; x <= m; x++) {
      if (x === 1 && y === 1) continue;
      if (blocked.has(x + ',' + y)) {
        dp[y][x] = 0; // 웅덩이로 오는 길은 없습니다
      } else {
        dp[y][x] = (dp[y - 1][x] + dp[y][x - 1]) % MOD; // 위 + 왼쪽
      }
    }
  }

  return dp[n][m];
}`,
};
const LOOPS = { python: ['for y in range', 'for x in range'], javascript: ['for (let y = 1', 'for (let x = 1'] };
const PULL_AT = {
  start: lines(PULL, ['dp = [[0]', 'dp[1][1] = 1'], ['const dp = Array.from', 'dp[1][1] = 1']),
  look: lines(PULL, [...LOOPS.python, 'dp[y][x] = (dp[y - 1][x]'], [...LOOPS.javascript, 'dp[y][x] = (dp[y - 1][x]']),
  add: lines(PULL, ['dp[y][x] = (dp[y - 1][x]'], ['dp[y][x] = (dp[y - 1][x]']),
  check: lines(PULL, [...LOOPS.python, 'if (x, y) in blocked'], [...LOOPS.javascript, 'if (blocked.has']),
  zero: lines(PULL, ['dp[y][x] = 0'], ['dp[y][x] = 0']),
  done: lines(PULL, ['return dp[n][m]'], ['return dp[n][m]']),
};

const PUSH = {
  python: `def solution(m, n, puddles):
    MOD = 1_000_000_007
    blocked = {(x, y) for x, y in puddles}  # 웅덩이 좌표는 [열, 행] 순서

    dp = [[0] * (m + 1) for _ in range(n + 1)]
    dp[1][1] = 1

    for y in range(1, n + 1):
        for x in range(1, m + 1):
            if (x, y) in blocked:
                continue  # 웅덩이는 받지도 보내지도 않습니다
            # 이 칸으로 오는 길은 이미 다 모였으니 오른쪽과 아래로 나눠 줍니다
            if x < m and (x + 1, y) not in blocked:
                dp[y][x + 1] = (dp[y][x + 1] + dp[y][x]) % MOD
            if y < n and (x, y + 1) not in blocked:
                dp[y + 1][x] = (dp[y + 1][x] + dp[y][x]) % MOD

    return dp[n][m]`,
  javascript: `function solution(m, n, puddles) {
  const MOD = 1_000_000_007;
  const blocked = new Set(puddles.map(([x, y]) => x + ',' + y)); // 웅덩이 좌표는 [열, 행] 순서

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  dp[1][1] = 1;

  for (let y = 1; y <= n; y++) {
    for (let x = 1; x <= m; x++) {
      if (blocked.has(x + ',' + y)) continue; // 웅덩이는 받지도 보내지도 않습니다
      // 이 칸으로 오는 길은 이미 다 모였으니 오른쪽과 아래로 나눠 줍니다
      if (x < m && !blocked.has(x + 1 + ',' + y)) {
        dp[y][x + 1] = (dp[y][x + 1] + dp[y][x]) % MOD;
      }
      if (y < n && !blocked.has(x + ',' + (y + 1))) {
        dp[y + 1][x] = (dp[y + 1][x] + dp[y][x]) % MOD;
      }
    }
  }

  return dp[n][m];
}`,
};
const PUSH_AT = {
  start: lines(PUSH, ['dp = [[0]', 'dp[1][1] = 1'], ['const dp = Array.from', 'dp[1][1] = 1']),
  check: lines(PUSH, [...LOOPS.python, 'if (x, y) in blocked'], [...LOOPS.javascript, 'if (blocked.has']),
  skip: lines(PUSH, [...LOOPS.python, 'if (x, y) in blocked', 'continue'], [...LOOPS.javascript, 'if (blocked.has']),
  rightNo: lines(PUSH, ['if x < m and'], ['if (x < m &&']),
  right: lines(PUSH, ['if x < m and', 'dp[y][x + 1] = '], ['if (x < m &&', 'dp[y][x + 1] = ']),
  downNo: lines(PUSH, ['if y < n and'], ['if (y < n &&']),
  down: lines(PUSH, ['if y < n and', 'dp[y + 1][x] = '], ['if (y < n &&', 'dp[y + 1][x] = ']),
  done: lines(PUSH, ['return dp[n][m]'], ['return dp[n][m]']),
};

const RECURSION = {
  python: `# 주의: 100 x 100이면 호출이 10^58번이 넘어 끝나지 않는 풀이입니다
def solution(m, n, puddles):
    MOD = 1_000_000_007
    blocked = {(x, y) for x, y in puddles}

    def paths(x, y):
        if (x, y) in blocked:
            return 0
        if x == 1 and y == 1:
            return 1
        # 메모 없이 왼쪽 칸과 위쪽 칸을 매번 다시 계산 → 지수 시간
        total = 0
        if x > 1:
            total += paths(x - 1, y)
        if y > 1:
            total += paths(x, y - 1)
        return total % MOD

    return paths(m, n)`,
  javascript: `// 주의: 100 x 100이면 호출이 10^58번이 넘어 끝나지 않는 풀이입니다
function solution(m, n, puddles) {
  const MOD = 1_000_000_007;
  const blocked = new Set(puddles.map(([x, y]) => x + ',' + y));

  const paths = (x, y) => {
    if (blocked.has(x + ',' + y)) return 0;
    if (x === 1 && y === 1) return 1;
    // 메모 없이 왼쪽 칸과 위쪽 칸을 매번 다시 계산 → 지수 시간
    let total = 0;
    if (x > 1) total += paths(x - 1, y);
    if (y > 1) total += paths(x, y - 1);
    return total % MOD;
  };

  return paths(m, n);
}`,
};
const REC_AT = {
  start: lines(RECURSION, ['def paths(x, y)'], ['const paths = (x, y)']),
  first: lines(RECURSION, ['return paths(m, n)', 'if (x, y) in blocked', 'total += paths(x - 1, y)'], ['return paths(m, n)', 'if (blocked.has', 'total += paths(x - 1, y)']),
  down: lines(RECURSION, ['if (x, y) in blocked', 'total += paths(x - 1, y)', 'total += paths(x, y - 1)'], ['if (blocked.has', 'total += paths(x - 1, y)', 'total += paths(x, y - 1)']),
  home: lines(RECURSION, ['if x == 1 and y == 1', 'return 1'], ['if (x === 1 && y === 1)']),
  puddle: lines(RECURSION, ['if (x, y) in blocked', 'return 0'], ['if (blocked.has']),
  done: lines(RECURSION, ['return paths(m, n)'], ['return paths(m, n)']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 열 번호(x=1…)는 맨 위 0~16, 행 번호(y=1…)는 맨 왼쪽 0~32, 칸은 36부터. 맨 윗줄 칸에 붙는 판정 표시(칸 위 11px)가 열 번호와 겹치지 않게 칸은 y 30부터 둔다.
// 아래쪽 222~250은 계산 글 줄이고, 함정은 이 줄 오른쪽에 찾은 길 수를 둔다.
const cellRect = grid({ x: 36, y: 30, rows: N, cols: M, cell: 54, gap: 10 });
const rectOf = ([x, y]: Cell): Rect => cellRect(y - 1, x - 1);
const mid = (c: Cell): Point => center(rectOf(c));
const W = 350;
const CALC_Y = 222;
const H = CALC_Y + 30;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다
const CALC: Rect = { x: 0, y: CALC_Y, w: W, h: 28 };

// 세 풀이가 같이 쓰는 장면: 열·행 번호, 칸 15개(집·학교 이름표, 웅덩이는 빗금), 계산 글
function board(calc: Rect, ...extra: Item[]): Scene {
  const items: Item[] = [];
  for (let x = 1; x <= M; x++) items.push({ id: `col:${x}`, kind: 'text', rect: { x: rectOf([x, 1]).x, y: 0, w: 54, h: 16 }, tone: 'muted', text: `x=${x}` });
  for (let y = 1; y <= N; y++) items.push({ id: `row:${y}`, kind: 'text', rect: { x: 0, y: rectOf([1, y]).y, w: 32, h: 54 }, tone: 'muted', text: `y=${y}` });
  for (let y = 1; y <= N; y++) {
    for (let x = 1; x <= M; x++) {
      const c: Cell = [x, y];
      const tag = same(c, HOME) ? '집' : same(c, SCHOOL) ? '학교' : undefined; // 웅덩이는 빗금 칸(이름표는 빗금에 묻힌다)
      items.push({ id: cellId(c), kind: 'cell', rect: rectOf(c), tone: isPuddle(c) ? 'wall' : 'plain', ...(tag ? { tag } : {}) });
    }
  }
  items.push({ id: 'calc', kind: 'text', rect: calc, text: '' }, ...extra);
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const set = (c: Cell, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: cellId(c), patch, ...(pop ? { pop } : {}) });
const paint = (c: Cell, tone: Tone) => set(c, { tone });
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });
const focus = (...cells: Cell[]): Action => ({ type: 'focus', ids: cells.map(cellId) });
const clear = (): Action[] => together([{ type: 'clearMarks' }, { type: 'unfocus' }]);
// 지금 칸에서 살펴보는 칸으로 긋는다. 판정 표시는 화살표 끝 칸 위에 붙는다
const look = (from: Cell, to: Cell, verdict: Verdict, label: string): Action =>
  ({ type: 'arrow', from: cellId(from), to: cellId(to), verdict, label });
const ways = (v: number) => `${v}가지`;
// 읽는 칸의 판정: 웅덩이는 '웅덩이', 길이 있으면 '3가지', 없으면 '0가지'
const reading = (c: Cell, v: number): [Verdict, string] => (isPuddle(c) ? ['wall', '웅덩이'] : v ? ['good', ways(v)] : ['seen', ways(0)]);

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

/* ------------------------------------------------------------------ */
/* 정석 위·왼쪽 더하기: 이웃 보기 → 더하기 (웅덩이는 웅덩이 확인 → 0 채우기)  */
/* ------------------------------------------------------------------ */

interface Computed { cell: Cell; up: number | string; left: number | string; total: number }

function pull(): Visualization {
  const rec = new StepRecorder(board(CALC));
  const dp = Array.from({ length: N + 1 }, () => Array<number>(M + 1).fill(0));
  dp[1][1] = 1;
  let now: Computed | undefined;
  let lit: Cell | undefined; // 노란 칸(바로 전에 계산한 칸)
  let done = 1; // 집 칸은 처음부터 1가지라 한 칸을 채운 셈이다
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({
    work: done,
    variables: {
      x: now ? now.cell[0] : '-',
      y: now ? now.cell[1] : '-',
      'dp[y - 1][x]': now?.up ?? '-',
      'dp[y][x - 1]': now?.left ?? '-',
      'dp[y][x]': now?.total ?? '-',
    },
  });
  const settle = (): Action[] => (lit ? [paint(lit, 'visited')] : []);

  rec.step({ title: '집 칸 dp[1][1] = 1로 시작', codeHighlights: PULL_AT.start, ...meta() });
  rec.phase('시작', `집 ${josa(fmt(HOME), '은', '는')} 가만히 있어도 길이 1가지입니다.`);
  rec.do(set(HOME, { text: '1', tone: 'visited' }, true));
  rec.phase('규칙', '나머지 칸은 위와 왼쪽의 길 수를 더해 채웁니다.');
  rec.do(calcTo('dp[y][x] = 위 + 왼쪽'));

  for (let y = 1; y <= N; y++) {
    for (let x = 1; x <= M; x++) {
      const cell: Cell = [x, y];
      if (same(cell, HOME)) continue;
      const where = fmt(cell);
      done++;

      if (isPuddle(cell)) {
        const settling = settle();
        lit = undefined;
        dp[y][x] = 0;
        now = { cell, up: '-', left: '-', total: 0 };
        rec.step({ title: `dp[${y}][${x}] = 0 (웅덩이)`, codeHighlights: PULL_AT.zero, ...meta() });
        rec.phase('웅덩이 확인', `${josa(where, '은', '는')} 웅덩이입니다. 이 칸으로 오는 길은 없습니다.`, PULL_AT.check);
        rec.do(...together([...settling, focus(cell), calcTo('웅덩이 → 0')]));
        rec.phase('0 채우기', `${ro(0)} 채우고 넘어갑니다.`, PULL_AT.zero);
        rec.do(set(cell, { text: '0' }, true), { type: 'unfocus' });
        continue;
      }

      const upCell: Cell = [x, y - 1];
      const leftCell: Cell = [x - 1, y];
      const reads: Cell[] = [...(y > 1 ? [upCell] : []), ...(x > 1 ? [leftCell] : [])];
      const up = dp[y - 1][x];
      const left = dp[y][x - 1];
      const total = (up + left) % MOD;
      const settling = settle();
      dp[y][x] = total;
      now = { cell, up, left, total };
      lit = cell;
      const formula = `위 ${up} + 왼쪽 ${left}`;

      rec.step({ title: `dp[${y}][${x}] = ${up} + ${left} = ${total}`, codeHighlights: PULL_AT.add, ...meta() });
      rec.phase('이웃 보기',
        y === 1 ? `${josa(where, '은', '는')} 맨 윗줄이라 위쪽이 없습니다. 왼쪽에서 ${ways(left)}가 옵니다.`
          : x === 1 ? `${josa(where, '은', '는')} 맨 왼쪽 줄이라 왼쪽이 없습니다. 위에서 ${ways(up)}가 옵니다.`
            : `${where}에 오는 길은 위에서 ${ways(up)}, 왼쪽에서 ${ways(left)}입니다.`, PULL_AT.look);
      rec.do(...together([...settling, paint(cell, 'current'), focus(cell, ...reads), calcTo(formula)]));
      for (const c of reads) rec.do(look(cell, c, ...reading(c, c === upCell ? up : left)));
      rec.phase('더하기',
        y === 1 ? `왼쪽에서 오는 ${ways(left)}가 그대로 길 수입니다.`
          : x === 1 ? `위에서 오는 ${ways(up)}가 그대로 길 수입니다.`
            : `더하면 ${up} + ${left} = ${ways(total)}입니다.`, PULL_AT.add);
      rec.do(...together([set(cell, { text: String(total) }, true), calcTo(`${formula} = ${total}`)]), wait(300), ...clear());
    }
  }

  const answer = dp[N][M];
  const settling = settle();
  rec.step({ title: `학교 칸 dp[${N}][${M}] = ${answer}`, codeHighlights: PULL_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('답', `학교 ${fmt(SCHOOL)}에 모인 ${ways(answer)}가 답입니다. 칸 ${M * N}개를 한 번씩만 계산했습니다.`);
  rec.do(...together([...settling, paint(SCHOOL, 'path'), calcTo(`답 = dp[${N}][${M}] = ${answer}`)]));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 오른쪽·아래로 보내기: 값 확인 → 오른쪽으로 보내기 → 아래로 보내기      */
/* ------------------------------------------------------------------ */

function push(): Visualization {
  const rec = new StepRecorder(board(CALC));
  const dp = Array.from({ length: N + 1 }, () => Array<number>(M + 1).fill(0));
  dp[1][1] = 1;
  let cur: Cell | undefined; // 지금 보내는 칸
  let lit: Cell | undefined; // 노란 칸(바로 전에 보낸 칸)
  let done = 0;
  // 변수와 일의 양은 단계가 끝났을 때의 값이다. 건너뛴 웅덩이는 보내지 않았으니 받는 두 칸을 '-'로 둔다
  const meta = (sending = true) => {
    const [x, y] = cur ?? [0, 0];
    const at = (cx: number, cy: number, inside: boolean) => (cur && sending && inside ? dp[cy][cx] : '-');
    return {
      work: done,
      variables: {
        x: cur ? x : '-',
        y: cur ? y : '-',
        'dp[y][x]': cur ? dp[y][x] : '-',
        'dp[y][x + 1]': at(x + 1, y, x < M),
        'dp[y + 1][x]': at(x, y + 1, y < N),
      },
    };
  };
  const settle = (): Action[] => (lit ? [paint(lit, 'visited')] : []);
  // 받은 칸: 파란 점선 + 지금까지 받은 합
  const receive = (c: Cell): Action => ({ ...set(c, { text: String(dp[c[1]][c[0]]), tone: 'queued' }, true), together: true });
  const DIRS = [
    { label: '오른쪽으로 보내기', where: '오른쪽', outside: '오른쪽은', at: PUSH_AT.right, no: PUSH_AT.rightNo },
    { label: '아래로 보내기', where: '아래', outside: '아래는', at: PUSH_AT.down, no: PUSH_AT.downNo },
  ];
  const all: Cell[] = [];
  for (let y = 1; y <= N; y++) for (let x = 1; x <= M; x++) all.push([x, y]);

  rec.step({ title: '표를 0으로 채우고 집 칸에 1', codeHighlights: PUSH_AT.start, ...meta() });
  rec.phase('시작', `표를 모두 0으로 두고 집 ${fmt(HOME)}에만 1을 적습니다.`);
  rec.do(...together(all.map((c) => set(c, { text: same(c, HOME) ? '1' : '0' }, same(c, HOME)))));
  rec.phase('규칙', '각 칸은 자기 길 수를 오른쪽과 아래 칸에 더해 줍니다.');
  rec.do(calcTo('이 칸의 값을 오른쪽·아래에 더한다'));

  for (const cell of all) {
    const [x, y] = cell;
    done++;
    const where = fmt(cell);
    const settling = settle();
    const v = dp[y][x];
    cur = cell;

    if (same(cell, SCHOOL)) break; // 학교 칸은 아래 마지막 단계에서 확인한다
    if (isPuddle(cell)) {
      lit = undefined;
      rec.step({ title: `${josa(where, '은', '는')} 웅덩이라 건너뜀`, codeHighlights: PUSH_AT.skip, ...meta(false) });
      rec.phase('웅덩이 건너뛰기', `${josa(where, '은', '는')} 웅덩이라 받지도 보내지도 않습니다.`, PUSH_AT.skip);
      rec.do(...together([...settling, focus(cell), calcTo('웅덩이 → 건너뜀')]), wait(300), { type: 'unfocus' });
      continue;
    }

    // 보낼 두 칸: 오른쪽, 아래. 표 바깥이면 보내지 않고, 웅덩이면 막힌다
    const targets = ([[x + 1, y], [x, y + 1]] as Cell[]).map((t) => ({ t, outside: t[0] > M || t[1] > N }));
    const sent = targets.map(({ t, outside }) => !outside && !isPuddle(t));
    const sentTo = targets.filter((_, i) => sent[i]);
    for (const { t } of sentTo) dp[t[1]][t[0]] = (dp[t[1]][t[0]] + v) % MOD;
    lit = cell;

    const to = sentTo.length === 2 ? '오른쪽·아래로' : x < M && sent[0] ? '오른쪽으로' : '아래로';
    rec.step({ title: sentTo.length ? `${where}의 ${ways(v)}를 ${to} 보내기` : `${where}에서 보낼 곳 없음`, codeHighlights: PUSH_AT.down, ...meta() });
    rec.phase('값 확인', `${where}에 오는 길은 ${ways(v)}로 다 모였습니다.`, PUSH_AT.check);
    rec.do(...together([...settling, paint(cell, 'current'), focus(cell, ...sentTo.map(({ t }) => t)), calcTo(`dp[${y}][${x}] = ${v}`)]));

    DIRS.forEach((dir, i) => {
      const { t, outside } = targets[i];
      rec.phase(dir.label,
        outside ? `${dir.outside} 표 바깥이라 보낼 곳이 없습니다.`
          : isPuddle(t) ? `${dir.where} ${josa(fmt(t), '은', '는')} 웅덩이라 보내지 않습니다.`
            : `${dir.where} ${fmt(t)}에 ${ways(v)}를 더합니다.`, sent[i] ? dir.at : dir.no);
      if (outside) rec.do(wait(300));
      else if (isPuddle(t)) rec.do(look(cell, t, 'wall', '웅덩이'), wait(300));
      else rec.do(look(cell, t, 'good', `${v} 더함`), receive(t), wait(300), calcTo(`${fmt(t)} = ${dp[t[1]][t[0]]}`));
    });
    rec.do(...clear());
  }

  const answer = dp[N][M];
  const settling = settle();
  cur = SCHOOL;
  rec.step({ title: `학교 칸 dp[${N}][${M}] = ${answer}`, codeHighlights: PUSH_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('답', `길이 모두 학교 ${fmt(SCHOOL)}에 모였습니다. 답은 ${ways(answer)}입니다.`);
  rec.do(...together([...settling, paint(SCHOOL, 'path'), calcTo(`답 = dp[${N}][${M}] = ${answer}`)]));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정 메모 없는 재귀: 내려가기 → 값 돌려주기 (완성된 길마다), 길 수 확정     */
/* ------------------------------------------------------------------ */

const WAYS: Item = { id: 'ways', kind: 'token', rect: { x: 244, y: CALC_Y, w: 106, h: 28 }, tone: 'chosen', text: '찾은 길 0개' }; // 처음 마디에서 나타난다
const TRAP_CALC: Rect = { x: 0, y: CALC_Y, w: 236, h: 28 };

function recursion(): Visualization {
  const rec = new StepRecorder(board(TRAP_CALC, { id: 'trail', kind: 'line', rect: FULL, tone: 'trail', points: [] }));
  // 함정 코드와 같은 차례(왼쪽 칸을 먼저)로 끝나는 호출 줄기: 집이나 웅덩이에서 끝난다
  const routes: Cell[][] = [];
  const walk = (route: Cell[]) => {
    const [x, y] = route.at(-1)!;
    if (isPuddle([x, y]) || (x === 1 && y === 1)) routes.push(route);
    else {
      if (x > 1) walk([...route, [x - 1, y]]);
      if (y > 1) walk([...route, [x, y - 1]]);
    }
  };
  walk([SCHOOL]);
  const calls = new Map<string, number>(); // 칸마다 paths가 불린 횟수
  const count = (c: Cell) => calls.get(key(c)) ?? 0;
  let total = 0; // 지금까지 부른 paths 수
  let found = 0; // 지금까지 찾은 길 수(집에 닿은 줄기 수)
  let route: Cell[] = []; // 화면의 줄기 = 지금 재귀 스택
  // 변수는 단계가 끝났을 때 화면의 줄기 기준이다(마지막 단계는 paths(m, n)으로 돌아온 뒤)
  const meta = (top = route.at(-1)) => ({
    work: total,
    variables: { '(x, y)': top ? fmt(top) : '-', '부른 횟수': total, '찾은 길': found },
  });
  const leafTone = (c: Cell): Tone => (isPuddle(c) ? 'wall' : 'explored');

  rec.step({ title: '재귀 함수 paths(x, y) 정의', codeHighlights: REC_AT.start, ...meta() });
  rec.phase('시작', 'paths(x, y)는 집에서 (x, y)까지 오는 길의 수입니다.');
  rec.do(calcTo('paths(x, y) = 왼쪽 + 위'));
  rec.phase('횟수 세기', '메모가 없으니 칸마다 부른 횟수와, 찾은 길 수를 셉니다.');
  rec.do({ type: 'add', item: WAYS });

  routes.forEach((next, k) => {
    const from = k ? next.findIndex((c, d) => !same(c, routes[k - 1][d])) : 0; // 앞 줄기와 갈라지는 깊이
    const fresh = next.slice(from); // 새로 부르는 칸
    const gone = route.slice(from); // 돌아와 스택에서 빠지는 칸
    const back = next[from - 1]; // 돌아와 위쪽 갈래를 부르는 칸
    for (const c of fresh) calls.set(key(c), count(c) + 1);
    total += fresh.length;
    const leaf = next.at(-1)!;
    const reachedHome = !isPuddle(leaf);
    if (reachedHome) found++;
    route = next;
    const most = fresh.reduce((m, c) => (count(c) > count(m) ? c : m)); // 새로 부른 칸 중 가장 많이 불린 칸
    const times = count(most);
    const again = times > 1 ? `${fmt(most)} 칸은 벌써 ${times}번째 호출입니다.` : fresh.length > 1 ? '모두 처음 부르는 칸입니다.' : '처음 부르는 칸입니다.';

    rec.step({ title: `길 ${k + 1}: ${reachedHome ? '집에 닿음 → 1' : '웅덩이에 막힘 → 0'}`, codeHighlights: reachedHome ? REC_AT.home : REC_AT.puddle, ...meta() });
    rec.phase('내려가기', k
      ? `${ro(fmt(back))} 돌아와 위쪽 칸을 부릅니다. ${again}`
      : `paths(${M}, ${N})부터 왼쪽 칸을 먼저 부르며 끝까지 내려갑니다. 칸 ${fresh.length}개를 처음 부릅니다.`, k ? REC_AT.down : REC_AT.first);
    // 되돌아오기: 빠지는 칸은 지난 호출 모습으로, 선은 back까지 줄고 back이 다시 지금 칸이 된다. 앞 줄기의 계산 글도 지운다
    if (gone.length) {
      rec.do(...together([
        ...gone.map((c) => paint(c, leafTone(c))),
        paint(back, 'current'),
        { type: 'set', id: 'trail', patch: { points: next.slice(0, from).map(mid) } },
        calcTo(''),
      ]));
    }
    // 내려가기: 한 칸씩 부를 때마다 앞 칸은 밟고 있는 길, 새 칸은 지금 칸이 되고 부른 횟수가 하나 는다
    fresh.forEach((c, d) => {
      const depth = from + d;
      rec.do(...together([
        ...(depth ? [paint(next[depth - 1], 'trail')] : []),
        set(c, { tone: 'current', text: `${count(c)}번` }, true),
        { type: 'set', id: 'trail', patch: { points: next.slice(0, depth + 1).map(mid) } },
      ]));
    });

    rec.phase('값 돌려주기', reachedHome
      ? `집에 닿았습니다. 1을 돌려주고 찾은 길은 ${found}개가 됩니다.`
      : `웅덩이에 막혔습니다. 0을 돌려줍니다.`, reachedHome ? REC_AT.home : REC_AT.puddle);
    rec.do(...together([
      paint(leaf, reachedHome ? 'good' : 'bad'),
      calcTo(`paths(${leaf[0]}, ${leaf[1]}) → ${reachedHome ? 1 : 0}`),
      ...(reachedHome ? [{ type: 'set', id: 'ways', patch: { text: `찾은 길 ${found}개` }, pop: true } as Action] : []),
    ]));
  });

  // 재귀가 paths(m, n)까지 돌아와 답을 낸다. 마지막 줄기의 칸은 지난 호출 모습으로 돌리고 선을 지운다
  const last = route;
  route = [];
  const home = count(HOME);
  const answer = found;
  rec.step({ title: `길 ${answer}개 확정`, codeHighlights: REC_AT.done, ...meta(SCHOOL), answer, isKeyframe: true });
  rec.phase('답 확인', `paths를 ${total}번 불러서야 답 ${ways(answer)}가 나왔습니다. 집 ${fmt(HOME)}만 ${home}번이나 계산했습니다.`);
  rec.do(...together([
    ...last.map((c) => paint(c, leafTone(c))),
    { type: 'set', id: 'trail', patch: { points: [] } },
    paint(HOME, 'path'),
    { type: 'set', id: 'ways', patch: { tone: 'path' } },
    calcTo(`paths(${M}, ${N}) = ${answer}`),
  ]));
  rec.phase('최대 입력', `100 × 100이면 호출이 10^58번이 넘어 끝나지 않습니다. 정석은 칸 ${M * N}개면 충분합니다.`);
  rec.do(wait(300));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'way-to-school',
  title: '등굣길',
  level: 3,
  category: 'dp',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42898',
  description: {
    summary:
      '집(왼쪽 위)에서 학교(오른쪽 아래)까지 오른쪽과 아래로만 움직이는 가장 짧은 길이 모두 몇 가지인지 구합니다. 비로 물이 찬 웅덩이 칸은 지나갈 수 없고, 답이 커질 수 있어 1,000,000,007로 나눈 나머지를 구합니다.',
    rules: [
      '격자의 가로 칸 수 m과 세로 칸 수 n은 1 이상 100 이하의 자연수 (둘 다 1인 경우는 주어지지 않음)',
      '웅덩이는 0개 이상 10개 이하이며, [x, y]는 x번째 열, y번째 행 (집은 (1, 1), 학교는 (m, n))',
      '집과 학교는 웅덩이가 아님',
      '오른쪽 또는 아래로만 이동 가능',
    ],
    examples: [{ input: 'm = 4, n = 3, puddles = [[2, 2]]', output: '4' }],
  },
  keyIntuitions: [
    '오른쪽과 아래로만 가면 어떤 길이든 최단 경로이므로, 가장 짧은 길을 찾는 것이 아니라 길의 가짓수만 세면 됩니다.',
    '어떤 칸에 오는 길은 바로 위 칸에서 오는 길과 바로 왼쪽 칸에서 오는 길을 더한 것입니다. 웅덩이 칸은 0으로 둡니다.',
    '왼쪽 위부터 차례로 표를 채우면 칸마다 한 번만 계산하고, 값이 커지므로 더할 때마다 1,000,000,007로 나눕니다.',
  ],
  demo: { input: [M, N, PUDDLES], label: 'm = 5, n = 3, puddles = [[2, 2]]' },
  workUnit: '계산한 칸 수',
  approaches: [
    {
      id: 'school-pull',
      name: '위·왼쪽을 더하는 표 채우기',
      rank: 'BEST',
      timeComplexity: 'O(m × n)',
      spaceComplexity: 'O(m × n)',
      verdict: '칸마다 위와 왼쪽 값을 한 번 더해 m × n칸으로 끝나는 풀이입니다.',
      pros: [
        '칸마다 한 번씩만 계산해 100 × 100이어도 1만 칸이면 끝납니다.',
        '"위 + 왼쪽" 한 줄이 곧 점화식이라 코드가 짧습니다.',
        '표 바깥 줄을 0으로 채워 두면 맨 윗줄과 맨 왼쪽 줄도 같은 식으로 처리됩니다.',
      ],
      cons: [
        '웅덩이 칸을 0으로 되돌려 놓는 것을 잊으면 웅덩이를 지나는 길까지 세게 됩니다.',
        '웅덩이 좌표는 [열, 행] 순서인데 표는 dp[행][열]로 쓰므로 순서를 뒤집어 쓰는 데 주의해야 합니다.',
      ],
      whyThisRank:
        '왼쪽 위부터 채우면 필요한 값이 항상 먼저 계산되어 있습니다. 웅덩이는 0 하나로 처리되고 계산 횟수도 칸 수와 같아 가장 단순하고 안전합니다.',
      code: PULL,
      visualize: pull,
    },
    {
      id: 'school-push',
      name: '오른쪽·아래로 보내 주는 표 채우기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(m × n)',
      spaceComplexity: 'O(m × n)',
      verdict: '각 칸이 자기 길 수를 오른쪽과 아래 칸에 나눠 주는 풀이로, 비용은 같지만 확인할 조건이 더 많습니다.',
      pros: [
        '"이 칸에서 갈 수 있는 곳"을 생각하는 방식이라 길을 따라가는 감각과 닮았습니다.',
        '웅덩이로는 값을 보내지 않으면 되어 웅덩이 칸이 저절로 0으로 남습니다.',
      ],
      cons: [
        '보낼 때마다 표 바깥인지, 받는 칸이 웅덩이인지 확인하는 조건이 두 번씩 필요합니다.',
        '한 칸이 값을 두 번에 나눠 받아 계속 더해 가므로 표가 0으로 시작해야 하고, 빠뜨리기 쉽습니다.',
      ],
      whyThisRank:
        '복잡도는 같지만 보내는 쪽에서 범위와 웅덩이를 일일이 검사해야 합니다. 받는 쪽에서 위와 왼쪽을 더하는 정석이 더 짧고 실수할 곳이 적습니다.',
      code: PUSH,
      visualize: push,
    },
    {
      id: 'school-recursion',
      name: '메모 없는 재귀로 길 세기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(2^(m + n))',
      spaceComplexity: 'O(m + n) 재귀 깊이',
      verdict: '점화식을 메모 없이 재귀로 옮기면 같은 칸을 수없이 다시 계산해 100 × 100에서는 끝나지 않습니다.',
      pros: ['점화식을 그대로 옮겨 이해하기 쉽습니다.', '칸이 몇 개 안 되는 작은 격자에서는 정확한 답을 냅니다.'],
      cons: [
        'paths를 부르는 횟수가 길의 수에 비례해 늘어, 100 × 100이면 10^58번이 넘어 사실상 끝나지 않습니다.',
        '같은 칸까지의 길 수를 부를 때마다 처음부터 다시 구합니다.',
      ],
      whyThisRank:
        '같은 부분 문제가 반복된다는 DP의 신호입니다. 이 재귀에 메모(@lru_cache 등)만 붙여도 칸마다 한 번씩만 계산해 정석과 같은 O(m × n)이 됩니다.',
      code: RECURSION,
      visualize: recursion,
    },
  ],
  checks: {
    cases: [
      { args: [4, 3, [[2, 2]]], expected: 4 },
      { args: [M, N, PUDDLES], expected: 7 },
      { args: [1, 5, []], expected: 1 },
      { args: [5, 1, [[3, 1]]], expected: 0 },
      { args: [3, 3, []], expected: 6 },
      { args: [2, 2, [[2, 1], [1, 2]]], expected: 0 },
      { args: [100, 100, []], expected: 690285631 },
    ],
    // 가로·세로 1~6, 웅덩이 0~3개(집과 학교는 제외). 함정이 호출을 수백 번 해도 순식간이다
    random: (rand) => {
      const m = 1 + Math.floor(rand() * 6);
      const n = 1 + Math.floor(rand() * 6);
      const free: Cell[] = [];
      for (let y = 1; y <= n; y++) for (let x = 1; x <= m; x++) if (!(x === 1 && y === 1) && !(x === m && y === n)) free.push([x, y]);
      const puddles: Cell[] = [];
      for (let k = Math.floor(rand() * 4); k > 0 && free.length; k--) puddles.push(...free.splice(Math.floor(rand() * free.length), 1));
      return [m, n, puddles];
    },
  },
};

export default problem;
