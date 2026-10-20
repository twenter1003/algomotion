// 정수 삼각형: 정석 아래에서 위로 DP, 대안 위에서 아래로 DP, 함정 모든 경로 재귀를 같은 장면에서 움직인다.
// 장면은 삼각형 칸(글은 dp 값, 함정은 원래 값), 오른쪽 줄 이름표('n층'), 아래쪽 계산 글, 경로 선이다.
import { center, pyramid } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Point, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { fmt, josa, lines, ro, sum, together } from '../shared.ts';

type Cell = [number, number];

// 원문 예제. 세 풀이의 시각화 입력이자 첫 점검 사례다.
const TRIANGLE = [[7], [3, 8], [8, 1, 0], [2, 7, 4, 4], [4, 5, 2, 6, 5]];
const N = TRIANGLE.length;
const value = ([r, c]: Cell) => TRIANGLE[r][c];
const row = (r: number) => TRIANGLE[r].map((_, c): Cell => [r, c]);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BOTTOM_UP = {
  python: `def solution(triangle):
    dp = [row[:] for row in triangle]  # 원본을 지키려고 복사
    n = len(dp)

    # 바닥 바로 윗줄부터 꼭대기까지 거꾸로 올라갑니다
    for i in range(n - 2, -1, -1):
        for j in range(i + 1):
            dp[i][j] += max(dp[i + 1][j], dp[i + 1][j + 1])

    return dp[0][0]`,
  javascript: `function solution(triangle) {
  const dp = triangle.map((row) => [...row]); // 원본을 지키려고 복사
  const n = dp.length;

  // 바닥 바로 윗줄부터 꼭대기까지 거꾸로 올라갑니다
  for (let i = n - 2; i >= 0; i--) {
    for (let j = 0; j <= i; j++) {
      dp[i][j] += Math.max(dp[i + 1][j], dp[i + 1][j + 1]);
    }
  }

  return dp[0][0];
}`,
};
const UP_AT = {
  start: lines(BOTTOM_UP, ['dp = [row[:]', 'n = len(dp)'], ['const dp = triangle.map', 'const n = dp.length']),
  look: lines(BOTTOM_UP, ['for i in range(n - 2', 'for j in range(i + 1)', 'dp[i][j] += max'], ['for (let i = n - 2', 'for (let j = 0', 'dp[i][j] += Math.max']),
  add: lines(BOTTOM_UP, ['dp[i][j] += max'], ['dp[i][j] += Math.max']),
  done: lines(BOTTOM_UP, ['return dp[0][0]'], ['return dp[0][0]']),
};

const TOP_DOWN = {
  python: `def solution(triangle):
    dp = [row[:] for row in triangle]
    for i in range(1, len(dp)):
        for j in range(i + 1):
            if j == 0:
                dp[i][j] += dp[i - 1][0]        # 왼쪽 끝: 위 칸이 하나뿐
            elif j == i:
                dp[i][j] += dp[i - 1][j - 1]    # 오른쪽 끝: 위 칸이 하나뿐
            else:
                dp[i][j] += max(dp[i - 1][j - 1], dp[i - 1][j])
    return max(dp[-1])  # 바닥 줄에서 최댓값을 한 번 더 찾습니다`,
  javascript: `function solution(triangle) {
  const dp = triangle.map((row) => [...row]);
  for (let i = 1; i < dp.length; i++) {
    for (let j = 0; j <= i; j++) {
      if (j === 0) dp[i][j] += dp[i - 1][0]; // 왼쪽 끝: 위 칸이 하나뿐
      else if (j === i) dp[i][j] += dp[i - 1][j - 1]; // 오른쪽 끝: 위 칸이 하나뿐
      else dp[i][j] += Math.max(dp[i - 1][j - 1], dp[i - 1][j]);
    }
  }
  return Math.max(...dp[dp.length - 1]); // 바닥 줄에서 최댓값을 한 번 더 찾습니다
}`,
};
// j가 왼쪽 끝(0)인지, 오른쪽 끝(i)인지, 가운데인지. 위 칸 보기는 반복과 그때까지 거친 조건을 비춘다(JS는 조건과 더하기가 한 줄)
type Side = 'left' | 'right' | 'mid';
const LOOP = { python: ['for i in range(1', 'for j in range(i + 1)'], javascript: ['for (let i = 1', 'for (let j = 0'] };
const DOWN_AT = {
  start: lines(TOP_DOWN, ['dp = [row[:]'], ['const dp = triangle.map']),
  look: {
    left: lines(TOP_DOWN, [...LOOP.python, 'if j == 0'], [...LOOP.javascript, 'if (j === 0)']),
    right: lines(TOP_DOWN, [...LOOP.python, 'if j == 0', 'elif j == i'], [...LOOP.javascript, 'if (j === 0)', 'else if (j === i)']),
    mid: lines(TOP_DOWN, [...LOOP.python, 'if j == 0', 'elif j == i', 'else:'], [...LOOP.javascript, 'if (j === 0)', 'else if (j === i)', 'else dp[i][j]']),
  },
  add: {
    left: lines(TOP_DOWN, ['dp[i][j] += dp[i - 1][0]'], ['if (j === 0)']),
    right: lines(TOP_DOWN, ['dp[i][j] += dp[i - 1][j - 1]'], ['else if (j === i)']),
    mid: lines(TOP_DOWN, ['dp[i][j] += max('], ['else dp[i][j]']),
  },
  done: lines(TOP_DOWN, ['return max(dp[-1])'], ['return Math.max(']),
};

const BRUTE = {
  python: `# 주의: 높이 500이면 2^499가지 경로를 계산하는 풀이입니다
def solution(triangle):
    def best(i, j):
        if i == len(triangle) - 1:
            return triangle[i][j]
        # 메모 없이 두 갈래를 매번 다시 계산 → 지수 시간
        return triangle[i][j] + max(best(i + 1, j), best(i + 1, j + 1))
    return best(0, 0)`,
  javascript: `// 주의: 높이 500이면 2^499가지 경로를 계산하는 풀이입니다
function solution(triangle) {
  // 메모 없이 두 갈래를 매번 다시 계산 → 지수 시간
  const best = (i, j) =>
    i === triangle.length - 1
      ? triangle[i][j]
      : triangle[i][j] + Math.max(best(i + 1, j), best(i + 1, j + 1));
  return best(0, 0);
}`,
};
// 'return triangle[i][j]'는 바닥 칸의 return 줄(아래 max 줄보다 먼저 나온다)
const BRUTE_AT = {
  start: lines(BRUTE, ['def best(i, j)'], ['const best = (i, j)']), // 함수를 만들기만 하고, 부르는 것은 첫 경로부터
  first: lines(BRUTE, ['return best(0, 0)', 'if i == len(triangle) - 1', '+ max(best('], ['return best(0, 0)', 'i === triangle.length - 1', '+ Math.max(best(']),
  down: lines(BRUTE, ['if i == len(triangle) - 1', '+ max(best('], ['i === triangle.length - 1', '+ Math.max(best(']),
  leaf: lines(BRUTE, ['if i == len(triangle) - 1', 'return triangle[i][j]', '+ max(best('], ['i === triangle.length - 1', '? triangle[i][j]', '+ Math.max(best(']),
  done: lines(BRUTE, ['return best(0, 0)'], ['return best(0, 0)']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 삼각형은 0~360 × 12~322(바닥 줄은 x 25~335). 위 12px은 꼭대기 칸에 붙는 판정 표시(칸 위 11px)가 판 안에 들게 둔 여백이다.
// 줄 이름표는 오른쪽 346~380 칸에 둔다(바닥 줄 왼쪽에는 25px뿐이다). 아래쪽 338~366은 계산 글 줄이고,
// 함정은 이 줄 오른쪽에 최댓값 표시를 둔다.
const cellRect = pyramid({ x: 0, y: 12, width: 360, rows: N, cell: 54, gap: 10 });
const W = 380;
const BOTTOM = 338;
const H = BOTTOM + 28;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다
const CALC: Rect = { x: 0, y: BOTTOM, w: 360, h: 28 };
const nodeId = ([r, c]: Cell) => `node:${r},${c}`;
// 경로 선은 칸 가운데보다 20px 왼쪽을 지난다. 기울기 2인 선이 가운데의 값(두 자리까지)과 오른쪽 아래 sub 사이로 지나간다
const pt = (c: Cell): Point => {
  const [x, y] = center(cellRect(...c));
  return [x - 20, y];
};

// 세 풀이가 같이 쓰는 장면: 줄 이름표, 칸 15개(글은 원래 값), 계산 글, 경로 선
function board(calc: Rect, pathTone: Tone, ...extra: Item[]): Scene {
  const items: Item[] = [];
  TRIANGLE.forEach((values, r) => {
    items.push({ id: `floor:${r}`, kind: 'text', rect: { x: 346, y: cellRect(r, 0).y, w: 34, h: 54 }, tone: 'muted', text: `${r}층` });
    values.forEach((v, c) => items.push({ id: nodeId([r, c]), kind: 'cell', rect: cellRect(r, c), tone: 'plain', text: String(v) }));
  });
  items.push({ id: 'calc', kind: 'text', rect: calc, text: '' }, { id: 'path', kind: 'line', rect: FULL, tone: pathTone, points: [] }, ...extra);
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const set = (c: Cell, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: nodeId(c), patch, ...(pop ? { pop } : {}) });
const paint = (c: Cell, tone: Tone) => set(c, { tone });
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });
const focus = (...cells: Cell[]): Action => ({ type: 'focus', ids: cells.map(nodeId) });
const clear = (): Action[] => together([{ type: 'clearMarks' }, { type: 'unfocus' }]);
// 지금 칸에서 살펴보는 칸으로 긋는다. 판정 표시는 화살표 끝 칸 위에 붙으므로, 두 칸을 볼 때 지금 칸에서 나가야 표시가 겹치지 않는다
const look = (from: Cell, to: Cell, verdict: Verdict, label: string): Action =>
  ({ type: 'arrow', from: nodeId(from), to: nodeId(to), verdict, label });
// 두 칸 비교: 큰 쪽은 '큰 값', 작은 쪽은 '작은 값', 같으면 둘 다 '같은 값'
const compare = (from: Cell, [a, b]: Cell[], [va, vb]: number[]): Action[] => {
  const label = (mine: number, other: number) => (mine === other ? '같은 값' : mine > other ? '큰 값' : '작은 값');
  return [look(from, a, va >= vb ? 'good' : 'seen', label(va, vb)), look(from, b, vb >= va ? 'good' : 'seen', label(vb, va))];
};
const pickCaption = (where: string, [a, b]: number[], best: number) =>
  `${where} 두 칸은 ${josa(a, '과', '와')} ${b}입니다. ${a === b ? `둘이 같아 어느 쪽이든 ${best}입니다.` : `큰 값은 ${best}입니다.`}`;
const addCaption = (orig: number, add: number, total: number) =>
  `원래 값 ${orig}에 ${josa(add, '을', '를')} 더해 ${orig} + ${add} = ${josa(total, '이', '가')} 됩니다.`;

// 정석·대안의 변수: 마지막으로 계산한 칸(없으면 '-')
interface Computed { i: number; j: number; orig: number; add: number; total: number }
const cellVars = (now: Computed | undefined, addKey: string) => ({
  i: now?.i ?? '-',
  j: now?.j ?? '-',
  'triangle[i][j]': now?.orig ?? '-',
  [addKey]: now?.add ?? '-',
  'dp[i][j]': now?.total ?? '-',
});

/* ------------------------------------------------------------------ */
/* 정석 아래에서 위로: 아래 두 칸 보기 → 더하기, 경로 따라가기           */
/* ------------------------------------------------------------------ */

function bottomUp(): Visualization {
  const rec = new StepRecorder(board(CALC, 'path'));
  const dp = TRIANGLE.map((values) => [...values]);
  let now: Computed | undefined;
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  let done = 0;
  const meta = () => ({ work: done, variables: cellVars(now, 'max(아래 두 칸)') });

  rec.step({ title: '바닥 줄은 그대로 두고 시작', codeHighlights: UP_AT.start, ...meta() });
  rec.phase('시작', `높이 ${N}의 삼각형입니다. 맨 아래 ${N - 1}층은 더 내려갈 곳이 없어 자기 값이 곧 최댓값입니다. 바로 윗줄인 ${N - 2}층부터 거꾸로 올라가며 계산합니다.`);
  rec.do(...together([...row(N - 1).map((c) => paint(c, 'visited')), calcTo('dp[i][j] = 값 + max(아래 두 칸)')]), wait(1100));

  for (let i = N - 2; i >= 0; i--) {
    for (let j = 0; j <= i; j++) {
      const cur: Cell = [i, j];
      const kids: Cell[] = [[i + 1, j], [i + 1, j + 1]];
      const [l, r] = kids.map(([a, b]) => dp[a][b]);
      const last = now;
      now = { i, j, orig: dp[i][j], add: Math.max(l, r), total: dp[i][j] + Math.max(l, r) };
      dp[i][j] = now.total;
      done++;
      const formula = `${now.orig} + max(${l}, ${r})`;

      rec.step({ title: `dp[${i}][${j}] = ${formula} = ${now.total}`, codeHighlights: UP_AT.add, ...meta() });
      rec.phase('아래 두 칸 보기', pickCaption(`${i}층 ${j}번 칸의 바로 아래`, [l, r], now.add), UP_AT.look);
      rec.do(...together([...(last ? [paint([last.i, last.j], 'visited')] : []), paint(cur, 'current'), focus(cur, ...kids), calcTo(formula)]));
      rec.do(...compare(cur, kids, [l, r]), wait(300));
      // 값을 쓰는 동안 화살표를 남겨 두고, 화살표가 사라진 뒤 '원래 n'을 단다(오른쪽 화살표가 sub 자리를 지난다)
      rec.phase('더하기', addCaption(now.orig, now.add, now.total), UP_AT.add);
      rec.do(...together([set(cur, { text: String(now.total) }, true), calcTo(`${formula} = ${now.total}`)]), wait(300), ...clear());
      rec.do(set(cur, { sub: `원래 ${now.orig}` }));
    }
  }

  // 꼭대기에서 더 큰 아래 칸을 따라 내려가면 최댓값 경로가 나온다(같으면 왼쪽)
  const route: Cell[] = [[0, 0]];
  for (let i = 0, j = 0; i < N - 1; i++) {
    if (dp[i + 1][j + 1] > dp[i + 1][j]) j++;
    route.push([i + 1, j]);
  }
  const values = route.map(value);
  rec.step({ title: `꼭대기 dp[0][0] = ${dp[0][0]}`, codeHighlights: UP_AT.done, ...meta(), answer: dp[0][0], isKeyframe: true });
  rec.phase('경로 따라가기', `꼭대기 한 칸에 전체 최댓값 ${josa(dp[0][0], '이', '가')} 모였습니다. 위에서부터 더 큰 쪽을 따라 내려가면 경로는 ${values.join(' → ')}, 합은 ${sum(values)}입니다.`);
  rec.do(...together(route.map((c) => paint(c, 'path'))));
  rec.do({ type: 'trace', id: 'path', points: route.map(pt) }, calcTo(`${values.join(' + ')} = ${sum(values)}`));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 위에서 아래로: 위 칸 보기 → 더하기, 바닥에서 최댓값               */
/* ------------------------------------------------------------------ */

function topDown(): Visualization {
  const rec = new StepRecorder(board(CALC, 'path'));
  const dp = TRIANGLE.map((values) => [...values]);
  let now: Computed | undefined;
  let done = 0;
  let found: number | undefined; // 바닥 줄 최댓값(마지막 단계)
  const meta = () => ({ work: done, variables: { ...cellVars(now, 'max(위 칸)'), '바닥 줄 최댓값': found ?? '-' } });
  // 바로 전에 계산한 칸은 끝난 칸(초록)이 되고 '원래 n'을 뗀다. 그 칸은 다음 줄에서 위 칸으로 쓰이는데,
  // 오른쪽 아래에서 올라오는 화살표가 오른쪽 아래 sub 자리를 지나기 때문이다
  const settle = (): Action[] => (now ? [set([now.i, now.j], { tone: 'visited', sub: '' })] : []);

  rec.step({ title: '꼭대기는 그대로 두고 시작', codeHighlights: DOWN_AT.start, ...meta() });
  rec.phase('시작', `꼭대기 0층은 위에서 내려올 칸이 없어 ${TRIANGLE[0][0]} 그대로입니다. 1층부터 위 칸의 값을 더하며 내려갑니다.`);
  rec.do(...together([paint([0, 0], 'visited'), calcTo('dp[i][j] = 값 + max(위 두 칸)')]), wait(900));

  for (let i = 1; i < N; i++) {
    for (let j = 0; j <= i; j++) {
      const side: Side = j === 0 ? 'left' : j === i ? 'right' : 'mid';
      const cur: Cell = [i, j];
      const ups: Cell[] = side === 'left' ? [[i - 1, 0]] : side === 'right' ? [[i - 1, j - 1]] : [[i - 1, j - 1], [i - 1, j]];
      const vals = ups.map(([a, b]) => dp[a][b]);
      const settling = settle();
      now = { i, j, orig: dp[i][j], add: Math.max(...vals), total: dp[i][j] + Math.max(...vals) };
      dp[i][j] = now.total;
      done++;
      const formula = side === 'mid' ? `${now.orig} + max(${vals.join(', ')})` : `${now.orig} + ${vals[0]}`;
      const where = `${i}층 ${j}번 칸`;

      rec.step({ title: `dp[${i}][${j}] = ${formula} = ${now.total}`, codeHighlights: DOWN_AT.add[side], ...meta() });
      rec.phase('위 칸 보기', side === 'mid'
        ? pickCaption(`${where}의 위`, vals, now.add)
        : `${where}은 ${side === 'left' ? '왼쪽' : '오른쪽'} 끝이라 위 칸이 하나뿐입니다. 그 값은 ${vals[0]}입니다.`, DOWN_AT.look[side]);
      rec.do(...together([...settling, paint(cur, 'current'), focus(cur, ...ups), calcTo(formula)]));
      rec.do(...(side === 'mid' ? compare(cur, ups, vals) : [look(cur, ups[0], 'good', '하나뿐')]), wait(300));
      rec.phase('더하기', addCaption(now.orig, now.add, now.total), DOWN_AT.add[side]);
      rec.do(...together([set(cur, { text: String(now.total) }, true), calcTo(`${formula} = ${now.total}`)]), wait(300), ...clear());
      rec.do(set(cur, { sub: `원래 ${now.orig}` }));
    }
  }

  const bottom = dp[N - 1];
  const settling = settle();
  found = Math.max(...bottom);
  rec.step({ title: `바닥 줄 최댓값 ${found}`, codeHighlights: DOWN_AT.done, ...meta(), answer: found, isKeyframe: true });
  rec.phase('바닥에서 최댓값', `위에서 내려오면 바닥 줄 칸마다 그 칸에서 끝나는 경로의 최댓값이 남습니다. 그래서 ${bottom.join(', ')} 중 가장 큰 값을 한 번 더 찾으면 답은 ${found}입니다.`);
  rec.do(...together([...settling, focus(...row(N - 1))]));
  rec.do(calcTo(`max(${bottom.join(', ')}) = ${found}`), set([N - 1, bottom.indexOf(found)], { tone: 'path' }, true), wait(500), { type: 'unfocus' });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 모든 경로: 경로 내려가기 → 합 비교 (완성된 경로마다), 최댓값 확정 */
/* ------------------------------------------------------------------ */

const TRAP_CALC: Rect = { x: 0, y: BOTTOM, w: 280, h: 28 };
const MAX_MARK: Item = { id: 'max', kind: 'token', rect: { x: 290, y: BOTTOM, w: 86, h: 28 }, tone: 'chosen' };

function allPaths(): Visualization {
  const rec = new StepRecorder(board(TRAP_CALC, 'trail'));
  // 함정 코드와 같은 차례(왼쪽 아래 best(i + 1, j)를 먼저)로 완성되는 경로들
  const routes: Cell[][] = [];
  const walk = (route: Cell[]) => {
    const [i, j] = route.at(-1)!;
    if (i === N - 1) routes.push(route);
    else for (const next of [[i + 1, j], [i + 1, j + 1]] as Cell[]) walk([...route, next]);
  };
  walk([[0, 0]]);
  const calls = TRIANGLE.map((values) => values.map(() => 0)); // 칸마다 best가 불린 횟수
  let total = 0; // 지금까지 부른 best 수
  let best = -1; // 지금까지 본 경로 합의 최댓값. -1이면 아직 없음
  let bestRoute: Cell[] = [];
  let route: Cell[] = []; // 화면의 경로 = 지금 재귀 스택
  // 변수는 단계가 끝났을 때 화면의 경로 기준이다(마지막 단계는 best(0, 0)으로 돌아온 뒤)
  const meta = (top = route.at(-1)) => ({
    work: total,
    variables: { '(i, j)': top ? fmt(top) : '-', '경로 합': route.length ? sum(route.map(value)) : '-', '지금까지 최댓값': best < 0 ? '-' : best },
  });

  rec.step({ title: '재귀 함수 best(i, j) 정의', codeHighlights: BRUTE_AT.start, ...meta() });
  rec.phase('시작', 'best(i, j)는 (i, j)에서 바닥까지 가는 경로 합의 최댓값입니다. 메모가 없어 같은 칸을 몇 번이고 다시 부르므로, 칸마다 불린 횟수를 셉니다.');
  rec.do(calcTo('값 + max(아래 두 칸의 best)'), wait(1400));

  routes.forEach((next, k) => {
    const from = k ? next.findIndex((c, d) => fmt(c) !== fmt(route[d])) : 0; // 앞 경로와 갈라지는 깊이
    const fresh = next.slice(from); // 새로 부르는 칸
    const gone = route.slice(from); // 되돌아와 경로에서 빠지는 칸
    const back = next[from - 1]; // 되돌아와 다음 갈래를 부르는 칸
    for (const [r, c] of fresh) calls[r][c]++;
    total += fresh.length;
    const values = next.map(value);
    const s = sum(values);
    const before = best;
    if (s > best) [best, bestRoute] = [s, next];
    route = next;
    const most = fresh.reduce((m, c) => (calls[c[0]][c[1]] > calls[m[0]][m[1]] ? c : m)); // 새로 부른 칸 중 가장 많이 불린 칸
    const times = calls[most[0]][most[1]];
    const again = times > 1 ? `${fmt(most)} 칸은 벌써 ${times}번째 계산입니다.` : fresh.length > 1 ? '모두 처음 계산하는 칸입니다.' : '처음 계산하는 칸입니다.';

    rec.step({ title: `경로 ${k + 1}: ${values.join(' + ')} = ${s}`, codeHighlights: BRUTE_AT.leaf, ...meta() });
    rec.phase('경로 내려가기', k
      ? `${fmt(back)} 칸으로 돌아와 오른쪽 갈래로 내려갑니다. ${again}`
      : `best(0, 0)부터 왼쪽 아래 칸을 먼저 부르며 바닥까지 내려갑니다. 칸 ${fresh.length}개를 처음 계산합니다.`, k ? BRUTE_AT.down : BRUTE_AT.first);
    // 되돌아오기: 빠지는 칸은 원래대로, 선은 back까지 줄고 back이 다시 지금 칸이 된다. 앞 경로의 합 글도 지운다
    if (gone.length) {
      rec.do(...together([
        ...gone.map((c) => paint(c, 'plain')),
        paint(back, 'current'),
        { type: 'set', id: 'path', patch: { points: next.slice(0, from).map(pt) } },
        calcTo(''),
      ]));
    }
    // 내려가기: 한 칸씩 부를 때마다 앞 칸은 밟고 있는 길, 새 칸은 지금 칸이 되고 불린 횟수가 하나 는다
    fresh.forEach((c, d) => {
      const depth = from + d;
      rec.do(...together([
        ...(depth ? [paint(next[depth - 1], 'trail')] : []),
        set(c, { tone: 'current', sub: `${calls[c[0]][c[1]]}번` }, true),
        { type: 'set', id: 'path', patch: { points: next.slice(0, depth + 1).map(pt) } },
      ]));
    });
    if (fresh.length < 3) rec.do(wait(500)); // 짧게 내려갈 때 자막을 읽을 틈

    const sumIs = `바닥에 닿았습니다. 이 경로의 합 ${josa(s, '은', '는')}`;
    rec.phase('합 비교', before < 0
      ? `바닥에 닿았습니다. 이 경로의 합은 ${s}입니다. 첫 경로라 지금까지의 최댓값이 됩니다.`
      : s > before
        ? `${sumIs} 지금까지의 최댓값 ${before}보다 커서 최댓값이 ${ro(s)} 바뀝니다.`
        : `${sumIs} 지금까지의 최댓값 ${s === best ? `${josa(best, '과', '와')} 같습니다` : `${best}보다 작습니다`}.`,
    BRUTE_AT.leaf);
    rec.do(calcTo(`${values.join(' + ')} = ${s}`));
    if (s > before) {
      const text = `최댓값 ${s}`;
      rec.do(before < 0 ? { type: 'add', item: { ...MAX_MARK, text } } : { type: 'set', id: 'max', patch: { text }, pop: true });
    }
    rec.do(wait(500));
  });

  // 재귀가 best(0, 0)까지 돌아와 답을 낸다. 마지막 경로의 칸은 원래 색으로 돌리고, 최댓값 경로를 분홍으로 긋는다
  const values = bestRoute.map(value);
  const bottom = calls[N - 1];
  const busiest: Cell = [N - 1, bottom.indexOf(Math.max(...bottom))];
  const onBest = new Set(bestRoute.map(fmt));
  const last = route;
  route = bestRoute;
  rec.step({ title: `최댓값 ${best} 확정`, codeHighlights: BRUTE_AT.done, ...meta([0, 0]), answer: best, isKeyframe: true });
  rec.phase('최댓값 확정', `경로 ${routes.length}개를 모두 계산하고서야 최댓값 ${josa(best, '을', '를')} 확정합니다. best를 ${total}번 불렀고, 바닥 줄 ${fmt(busiest)} 칸 하나를 ${Math.max(...bottom)}번이나 계산했습니다. 높이 500이면 경로가 2^499가지라 끝나지 않습니다.`);
  rec.do(...together([
    ...last.filter((c) => !onBest.has(fmt(c))).map((c) => paint(c, 'plain')),
    ...bestRoute.map((c) => paint(c, 'path')),
    { type: 'set', id: 'path', patch: { tone: 'path', points: [] } },
  ]));
  rec.do({ type: 'trace', id: 'path', points: bestRoute.map(pt) });
  rec.do(...together([calcTo(`${values.join(' + ')} = ${best}`), { type: 'set', id: 'max', patch: { tone: 'path' } }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'integer-triangle',
  title: '정수 삼각형',
  level: 3,
  category: 'dp',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/43105',
  description: {
    summary:
      '삼각형의 꼭대기에서 바닥까지 내려가는 경로 중 거쳐 간 숫자의 합이 가장 큰 값을 구합니다. 한 줄 아래로 내려갈 때는 대각선 왼쪽이나 오른쪽으로만 갈 수 있습니다.',
    rules: [
      '삼각형의 높이는 1 이상 500 이하',
      '각 칸의 숫자는 0 이상 9,999 이하의 정수',
      '아래로는 바로 왼쪽 또는 오른쪽 대각선 칸으로만 이동',
    ],
    examples: [{ input: 'triangle = [[7], [3, 8], [8, 1, 0], [2, 7, 4, 4], [4, 5, 2, 6, 5]]', output: '30' }],
  },
  keyIntuitions: [
    '모든 경로를 다 보면 높이 N일 때 2^(N-1)가지라 N = 500이면 불가능합니다.',
    '여러 경로가 같은 칸을 지나며 같은 계산을 반복하므로, 칸마다 한 번 구한 최댓값을 저장해 쓰는 DP가 맞습니다.',
    '바닥에서 위로 올라가며 아래 두 칸 중 큰 값을 더하면, 꼭대기 한 칸에 전체 최댓값이 모입니다.',
  ],
  demo: { input: [TRIANGLE], label: '예제 삼각형 (높이 5)' },
  workUnit: '계산한 칸 수',
  approaches: [
    {
      id: 'triangle-bottom-up',
      name: '아래에서 위로 올라가는 DP',
      rank: 'BEST',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N²), 원본에 누적하면 추가 O(1)',
      verdict: '바닥에서 위로 더해 올라가 경계 처리 없이 짧게 끝나는 풀이입니다.',
      pros: [
        '아래에서 올라오면 모든 칸이 항상 아래 두 칸(j, j+1)을 가져 경계 if문이 필요 없습니다.',
        '원본 배열에 바로 누적하면 추가 메모리 없이 풀 수 있습니다.',
        '답이 꼭대기 한 칸에 모여 마지막에 최댓값을 다시 찾을 필요가 없습니다.',
      ],
      cons: ['위에서 내려가는 문제를 거꾸로 푼다는 발상이 처음엔 낯섭니다.'],
      whyThisRank:
        '위에서 내려가는 DP와 시간 복잡도는 같지만 분기가 없어 실수할 곳이 적습니다. 높이 500이면 칸이 약 12만 5천 개라 O(N²)로 충분합니다.',
      code: BOTTOM_UP,
      visualize: bottomUp,
    },
    {
      id: 'triangle-top-down',
      name: '위에서 아래로 내려가는 DP',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N²)',
      verdict: '문제를 읽은 순서대로 푸는 풀이로 통과하지만, 양 끝 칸의 분기 처리가 필요합니다.',
      pros: ['문제 설명(꼭대기에서 아래로 내려간다)과 같은 방향이라 떠올리기 쉽습니다.'],
      cons: [
        '왼쪽 끝(j = 0)과 오른쪽 끝(j = i)은 위 칸이 하나뿐이라 따로 처리해야 합니다.',
        '마지막에 바닥 줄 전체에서 최댓값을 한 번 더 찾아야 합니다.',
      ],
      whyThisRank:
        '복잡도는 같지만 경계 분기가 늘어 인덱스 실수가 나기 쉽습니다. 시험에서는 분기가 없는 아래→위 방향이 더 안전합니다.',
      code: TOP_DOWN,
      visualize: topDown,
    },
    {
      id: 'triangle-brute-force',
      name: '모든 경로를 재귀로 탐색',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(2^N)',
      spaceComplexity: 'O(N) 재귀 스택',
      verdict: '칸마다 왼쪽·오른쪽 두 갈래를 모두 다시 계산해 높이 500에서는 끝나지 않습니다.',
      pros: ['점화식을 그대로 옮겨 이해하기 쉽습니다.'],
      cons: [
        '높이 500이면 경로가 2^499 ≈ 1.6 × 10^150가지로, 우주의 원자 수(약 10^80)보다 훨씬 많습니다.',
        '같은 칸의 최댓값을 수없이 다시 계산합니다.',
      ],
      whyThisRank:
        '같은 부분 문제가 반복된다는 신호입니다. 이 재귀에 메모이제이션(@lru_cache 등)만 붙여도 칸마다 한 번씩만 계산해 O(N²)로 통과합니다.',
      code: BRUTE,
      visualize: allPaths,
    },
  ],
  checks: {
    cases: [
      { args: [TRIANGLE], expected: 30 },
      { args: [[[1]]], expected: 1 },
      { args: [[[1], [2, 3]]], expected: 4 },
    ],
    // 높이 1~7, 값 0~20(함정이 경로 2^6 = 64개를 다 도는 시간도 짧다)
    random: (rand) => {
      const height = 1 + Math.floor(rand() * 7);
      return [Array.from({ length: height }, (_, r) => Array.from({ length: r + 1 }, () => Math.floor(rand() * 21)))];
    },
  },
};

export default problem;
