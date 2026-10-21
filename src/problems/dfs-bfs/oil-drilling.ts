// 석유 시추: 정석 BFS로 덩어리 나누기 + 열 합산, 대안 열마다 BFS(완전 탐색), 함정 열을 훑으며 칸마다 덩어리 크기 더하기를 같은 땅에서 움직인다.
// 장면은 위에 줄(큐 · best 표시), 가운데에 5×8 땅(흰 칸이 석유, 회색이 빈 땅), 아래에 열마다 뽑을 수 있는 석유량(total) 표시다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { grid } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Problem, Rect, Scene, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { fmt, josa, lines, ro, together } from '../shared.ts';
import { fit } from './pacing.ts';

type Cell = [number, number];

// 시각화 입력: 원문 예제 1. 덩어리는 크기 7(3~6열), 8(0~2열), 2(6~7열)이고 정답은 6열의 7 + 2 = 9다.
// 한 열에서 같은 덩어리를 칸마다 더하는 함정은 0열에서 8을 세 번 더해 24를 낸다.
const LAND = [
  [0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0],
  [1, 1, 0, 0, 0, 1, 1, 0],
  [1, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 0, 1, 1],
];
const N = LAND.length;
const M = LAND[0].length;
const DIRS: Cell[] = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 상, 하, 좌, 우(세 풀이 코드와 같은 순서)

const key = ([r, c]: Cell) => `${r},${c}`;
const inBoard = ([r, c]: Cell) => r >= 0 && r < N && c >= 0 && c < M;
const isOil = ([r, c]: Cell) => LAND[r][c] === 1;
const around = (c: Cell): Cell[] => DIRS.map(([dr, dc]): Cell => [c[0] + dr, c[1] + dc]).filter(inBoard);
const cid = (c: Cell) => `cell:${key(c)}`;
const listText = (xs: number[]) => `[${xs.join(', ')}]`;

// 석유 덩어리: 훑는 차례(행 우선)대로 첫 칸, 칸 목록(BFS 차례), 걸친 열
interface Deposit { start: Cell; cells: Cell[]; cols: number[] }
const DEPOSITS: Deposit[] = [];
{
  const seen = new Set<string>();
  LAND.forEach((row, r) => row.forEach((v, c) => {
    if (!v || seen.has(key([r, c]))) return;
    const cells: Cell[] = [[r, c]];
    seen.add(key([r, c]));
    for (let head = 0; head < cells.length; head++) {
      for (const n of around(cells[head])) {
        if (isOil(n) && !seen.has(key(n))) {
          seen.add(key(n));
          cells.push(n);
        }
      }
    }
    DEPOSITS.push({ start: [r, c], cells, cols: [...new Set(cells.map((x) => x[1]))].sort((a, b) => a - b) });
  }));
}
// 열마다 뽑을 수 있는 석유량(정답 기준)과 함정이 내는 값(같은 덩어리를 그 열의 칸마다 더함)
const TOTALS = Array.from({ length: M }, (_, c) => DEPOSITS.filter((d) => d.cols.includes(c)).reduce((s, d) => s + d.cells.length, 0));
const WRONG_TOTALS = Array.from({ length: M }, (_, c) => DEPOSITS.reduce((s, d) => s + d.cells.length * d.cells.filter((x) => x[1] === c).length, 0));
const TRUTH = Math.max(...TOTALS);
const MISTAKE = Math.max(...WRONG_TOTALS);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BFS = {
  python: `from collections import deque

def solution(land):
    n, m = len(land), len(land[0])
    visited = [[False] * m for _ in range(n)]
    total = [0] * m  # 열마다 뽑을 수 있는 석유량

    for i in range(n):
        for j in range(m):
            if land[i][j] == 0 or visited[i][j]:
                continue  # 석유가 없거나 이미 센 덩어리
            size = 0
            cols = set()  # 이 덩어리가 걸친 열
            visited[i][j] = True
            queue = deque([(i, j)])
            while queue:
                x, y = queue.popleft()
                size += 1
                cols.add(y)
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < m and land[nx][ny] == 1 and not visited[nx][ny]:
                        visited[nx][ny] = True
                        queue.append((nx, ny))
            for y in cols:
                total[y] += size  # 덩어리 크기를 걸친 열마다 한 번씩만 더합니다

    return max(total)`,
  javascript: `function solution(land) {
  const n = land.length;
  const m = land[0].length;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const total = Array(m).fill(0); // 열마다 뽑을 수 있는 석유량

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (land[i][j] === 0 || visited[i][j]) continue; // 석유가 없거나 이미 센 덩어리
      let size = 0;
      const cols = new Set(); // 이 덩어리가 걸친 열
      visited[i][j] = true;
      const queue = [[i, j]];
      let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
      while (head < queue.length) {
        const [x, y] = queue[head++];
        size++;
        cols.add(y);
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < m && land[nx][ny] === 1 && !visited[nx][ny]) {
            visited[nx][ny] = true;
            queue.push([nx, ny]);
          }
        }
      }
      for (const y of cols) total[y] += size; // 덩어리 크기를 걸친 열마다 한 번씩만 더합니다
    }
  }

  return Math.max(...total);
}`,
};
const BFS_AT = {
  found: lines(BFS, ['if land[i][j] == 0 or visited[i][j]', 'size = 0', 'cols = set()', 'visited[i][j] = True', 'queue = deque([(i, j)])'],
    ['if (land[i][j] === 0 || visited[i][j]) continue', 'let size = 0', 'const cols = new Set()', 'visited[i][j] = true', 'const queue = [[i, j]]']),
  pop: lines(BFS, ['x, y = queue.popleft()', 'size += 1', 'cols.add(y)'], ['const [x, y] = queue[head++]', 'size++', 'cols.add(y)']),
  look: lines(BFS, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m and land[nx][ny] == 1'], ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m && land[nx][ny] === 1']),
  mark: lines(BFS, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m and land[nx][ny] == 1', 'visited[nx][ny] = True'],
    ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m && land[nx][ny] === 1', 'visited[nx][ny] = true']),
  push: lines(BFS, ['queue.append((nx, ny))'], ['queue.push([nx, ny])']),
  next: lines(BFS, ['while queue:'], ['while (head < queue.length)']),
  add: lines(BFS, ['for y in cols', 'total[y] += size'], ['for (const y of cols) total[y] += size']),
  done: lines(BFS, ['return max(total)'], ['return Math.max(...total)']),
};

const COLUMNS = {
  python: `from collections import deque

def solution(land):
    n, m = len(land), len(land[0])
    best = 0

    for col in range(m):  # 시추관을 꽂을 열을 하나씩 해 봅니다
        visited = [[False] * m for _ in range(n)]  # 열마다 방문 표시를 새로 만듭니다
        oil = 0
        for row in range(n):
            if land[row][col] == 0 or visited[row][col]:
                continue  # 석유가 없거나 이미 센 덩어리
            visited[row][col] = True
            queue = deque([(row, col)])
            while queue:  # 이 열에 닿은 덩어리의 크기를 BFS로 셉니다
                x, y = queue.popleft()
                oil += 1
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < m and land[nx][ny] == 1 and not visited[nx][ny]:
                        visited[nx][ny] = True
                        queue.append((nx, ny))
        best = max(best, oil)

    return best`,
  javascript: `function solution(land) {
  const n = land.length;
  const m = land[0].length;
  let best = 0;

  for (let col = 0; col < m; col++) { // 시추관을 꽂을 열을 하나씩 해 봅니다
    const visited = Array.from({ length: n }, () => Array(m).fill(false)); // 열마다 방문 표시를 새로 만듭니다
    let oil = 0;
    for (let row = 0; row < n; row++) {
      if (land[row][col] === 0 || visited[row][col]) continue; // 석유가 없거나 이미 센 덩어리
      visited[row][col] = true;
      const queue = [[row, col]];
      let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
      while (head < queue.length) { // 이 열에 닿은 덩어리의 크기를 BFS로 셉니다
        const [x, y] = queue[head++];
        oil++;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < m && land[nx][ny] === 1 && !visited[nx][ny]) {
            visited[nx][ny] = true;
            queue.push([nx, ny]);
          }
        }
      }
    }
    best = Math.max(best, oil);
  }

  return best;
}`,
};
const COLUMNS_AT = {
  drill: lines(COLUMNS, ['for col in range(m)', 'visited = [[False] * m for _ in range(n)]', 'oil = 0'],
    ['for (let col = 0; col < m; col++)', 'const visited = Array.from', 'let oil = 0']),
  count: lines(COLUMNS, ['for row in range(n)', "if land[row][col] == 0 or visited[row][col]", 'while queue:', 'oil += 1'],
    ['for (let row = 0; row < n; row++)', 'if (land[row][col] === 0 || visited[row][col]) continue', 'while (head < queue.length)', 'oil++']),
  best: lines(COLUMNS, ['best = max(best, oil)'], ['best = Math.max(best, oil)']),
  done: lines(COLUMNS, ['return best'], ['return best']),
};

const CELLS = {
  python: `# 주의: 오답이 나오는 풀이입니다 (한 열에서 같은 덩어리를 칸마다 여러 번 더합니다)
from collections import deque

def solution(land):
    n, m = len(land), len(land[0])
    comp = [[-1] * m for _ in range(n)]  # 칸이 속한 덩어리 번호
    sizes = []  # 덩어리마다 크기

    for i in range(n):
        for j in range(m):
            if land[i][j] == 0 or comp[i][j] != -1:
                continue  # 석유가 없거나 이미 번호를 붙인 덩어리
            comp[i][j] = len(sizes)
            queue = deque([(i, j)])
            size = 0
            while queue:
                x, y = queue.popleft()
                size += 1
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < m and land[nx][ny] == 1 and comp[nx][ny] == -1:
                        comp[nx][ny] = len(sizes)
                        queue.append((nx, ny))
            sizes.append(size)

    best = 0
    for col in range(m):
        oil = 0
        for row in range(n):
            if land[row][col] == 1:
                oil += sizes[comp[row][col]]  # 같은 덩어리를 칸마다 더해 버립니다
        best = max(best, oil)
    return best`,
  javascript: `// 주의: 오답이 나오는 풀이입니다 (한 열에서 같은 덩어리를 칸마다 여러 번 더합니다)
function solution(land) {
  const n = land.length;
  const m = land[0].length;
  const comp = Array.from({ length: n }, () => Array(m).fill(-1)); // 칸이 속한 덩어리 번호
  const sizes = []; // 덩어리마다 크기

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (land[i][j] === 0 || comp[i][j] !== -1) continue; // 석유가 없거나 이미 번호를 붙인 덩어리
      comp[i][j] = sizes.length;
      const queue = [[i, j]];
      let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
      let size = 0;
      while (head < queue.length) {
        const [x, y] = queue[head++];
        size++;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < m && land[nx][ny] === 1 && comp[nx][ny] === -1) {
            comp[nx][ny] = sizes.length;
            queue.push([nx, ny]);
          }
        }
      }
      sizes.push(size);
    }
  }

  let best = 0;
  for (let col = 0; col < m; col++) {
    let oil = 0;
    for (let row = 0; row < n; row++) {
      if (land[row][col] === 1) oil += sizes[comp[row][col]]; // 같은 덩어리를 칸마다 더해 버립니다
    }
    best = Math.max(best, oil);
  }
  return best;
}`,
};
const CELLS_AT = {
  label: lines(CELLS, ['comp[i][j] = len(sizes)', 'queue = deque([(i, j)])', 'sizes.append(size)'], ['comp[i][j] = sizes.length', 'const queue = [[i, j]]', 'sizes.push(size)']),
  column: lines(CELLS, ['for col in range(m)', 'if land[row][col] == 1', 'oil += sizes[comp[row][col]]'],
    ['for (let col = 0; col < m; col++)', 'if (land[row][col] === 1) oil += sizes[comp[row][col]]']),
  best: lines(CELLS, ['best = max(best, oil)'], ['best = Math.max(best, oil)']),
  done: lines(CELLS, ['return best'], ['return best']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로 0~546, 세로: 줄 0~40, 땅 칸 y 58~360(54px 칸, 간격 8), 열별 석유량 표시 372~402. 왼쪽 44px은 그 줄의 이름표
const W = 546;
const H = 410;
const cellRect = grid({ x: 44, y: 58, rows: N, cols: M, cell: 54, gap: 8 });
const colX = (c: number) => cellRect(0, c).x;
const LANE: LaneOptions = { id: 'lane', x: 50, y: 5, slotW: 64, slotH: 30, gap: 6, max: 6 };
const VERDICT_LABEL = { wall: '빈 땅', seen: '방문함', new: '새 칸' } as const;
const drillRect = (c: number): Rect => ({ x: colX(c) - 4, y: 50, w: 62, h: 318 }); // 시추관: 한 열을 감싸는 점선 상자
const paint = (c: Cell, patch: ItemPatch, pop = false): Extract<Action, { type: 'set' }> => ({ type: 'set', id: cid(c), patch, ...(pop ? { pop } : {}) });
const setTotal = (c: number, v: number): Action => ({ type: 'set', id: `col:${c}`, patch: { text: String(v) }, pop: true });
const wait = (ms: number): Action => ({ type: 'wait', ms });

// 세 풀이가 같이 쓰는 장면: (줄 이름표와 바탕), (시추관), 땅 칸(석유는 흰색, 빈 땅은 회색), 열별 석유량 표시, (위쪽 표시)
function board(o: { lane?: boolean; drill?: boolean; best?: boolean }): Scene {
  const items: Item[] = [];
  if (o.lane) {
    items.push({ id: 'lane:label', kind: 'text', rect: { x: 0, y: 0, w: 34, h: 40 }, text: '큐' }, { id: 'lane:bg', kind: 'zone', rect: { x: 34, y: 0, w: W - 34, h: 40 } });
  }
  if (o.drill) items.push({ id: 'drill', kind: 'zone', rect: drillRect(0) }); // 칸보다 먼저 두어 칸 아래에 깔린다
  LAND.forEach((row, r) => row.forEach((v, c) => items.push({ id: cid([r, c]), kind: 'cell', rect: cellRect(r, c), tone: v ? 'plain' : 'muted' })));
  items.push({ id: 'total:label', kind: 'text', rect: { x: 0, y: 372, w: 40, h: 30 }, text: '열 합' });
  for (let c = 0; c < M; c++) items.push({ id: `col:${c}`, kind: 'token', rect: { x: colX(c), y: 372, w: 54, h: 30 }, tone: 'plain', text: '0' });
  if (o.best) items.push({ id: 'best', kind: 'token', rect: { x: 50, y: 5, w: 90, h: 30 }, tone: 'plain', text: 'best 0' });
  return { width: W, height: H, items };
}

interface Probe { to: Cell; verdict: Verdict }
const cellsText = (cells: Cell[]) => cells.map(fmt).join(', ');

/* ------------------------------------------------------------------ */
/* 정석 BFS 영역 나누기 + 열 합산: 찾기 → 꺼내기 → 살피기 → 넣기 → 열에 더하기      */
/* ------------------------------------------------------------------ */

function labeling(): Visualization {
  const rec = new StepRecorder(board({ lane: true }));
  const lane = new Lane(rec, LANE);
  const visited = LAND.map((row) => row.map(() => false));
  const queue: Cell[] = [];
  const total = Array<number>(M).fill(0);
  let size = 0;
  let cols: number[] = [];
  let scan: Cell | undefined;
  let pops = 0;
  let last: Cell | undefined; // 바로 전에 꺼낸 칸
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = (cur?: Cell) => ({
    work: pops,
    variables: {
      '(i, j)': scan ? fmt(scan) : '-',
      '(x, y)': cur ? fmt(cur) : '-',
      size,
      cols: `{${cols.join(', ')}}`,
      queue: `[${queue.map(fmt).join(', ')}]`,
      total: listText(total),
    },
  });
  const token = (c: Cell) => ({ id: `tok:${key(c)}`, text: fmt(c) });

  DEPOSITS.forEach(({ start }, k) => {
    // 찾기: 훑다가 아직 안 센 석유 칸을 만나면 새 덩어리다
    scan = start;
    size = 0;
    cols = [];
    visited[start[0]][start[1]] = true;
    queue.push(start);
    last = undefined;
    rec.step({ title: `${fmt(start)}에서 새 덩어리 발견`, codeHighlights: BFS_AT.found, ...meta() });
    rec.phase('찾기', `${k === 0 ? '땅을 왼쪽 위부터 훑다가' : '이어서 훑다가'} ${fmt(start)}에서 아직 안 센 석유를 만났습니다. 새 덩어리라 size를 0으로 하고 큐에 넣습니다.`, BFS_AT.found);
    rec.do({ type: 'focus', ids: [cid(start)] }, { ...paint(start, { tone: 'queued' }, true), together: true }, { type: 'unfocus' });
    lane.push(token(start), cid(start));

    while (queue.length) {
      const cur = queue.shift()!;
      pops++;
      size++;
      if (!cols.includes(cur[1])) cols = [...cols, cur[1]].sort((a, b) => a - b);
      const probes = around(cur).map((to): Probe => ({ to, verdict: !isOil(to) ? 'wall' : visited[to[0]][to[1]] ? 'seen' : 'new' }));
      const news = probes.filter((p) => p.verdict === 'new').map((p) => p.to);
      for (const n of news) {
        visited[n[0]][n[1]] = true;
        queue.push(n);
      }
      const end = queue.length === 0; // 이 덩어리의 마지막 칸
      if (end) for (const c of cols) total[c] += size;
      rec.step({
        title: news.length ? `${fmt(cur)} 꺼내고 ${news.length}칸 넣기` : `${fmt(cur)} 꺼내기 — 넣을 칸 없음`,
        codeHighlights: end ? BFS_AT.add : news.length ? BFS_AT.push : BFS_AT.next,
        ...meta(cur),
      });
      rec.phase('꺼내기', `큐 맨 앞에서 ${josa(fmt(cur), '을', '를')} 꺼내 size를 ${ro(size)} 늘리고, ${cur[1]}열을 cols에 담습니다.`, BFS_AT.pop);
      lane.shift(cid(cur));
      rec.do(...together([paint(cur, { tone: 'current', text: String(size) }, true), ...(last ? [paint(last, { tone: 'visited' })] : [])], true));
      rec.phase('살피기', `상하좌우 칸을 하나씩 확인합니다. 석유가 없거나 이미 방문한 칸은 건너뛰고${news.length ? ', 새 석유 칸에는 방문 표시를 합니다.' : ' 넘어갑니다.'}`, news.length ? BFS_AT.mark : BFS_AT.look);
      rec.do({ type: 'focus', ids: [cid(cur), ...probes.map((p) => cid(p.to))] });
      for (const p of probes) {
        rec.do({ type: 'arrow', from: cid(cur), to: cid(p.to), verdict: p.verdict, label: VERDICT_LABEL[p.verdict as keyof typeof VERDICT_LABEL] });
        if (p.verdict === 'new') rec.do({ ...paint(p.to, { tone: 'queued' }, true), together: true });
      }
      rec.phase('넣기', news.length ? `새로 찾은 ${josa(cellsText(news), '을', '를')} 큐 뒤에 넣습니다.` : '새로 넣을 칸이 없어 그대로 넘어갑니다.', news.length ? BFS_AT.push : BFS_AT.next);
      const clear: Action[] = [{ type: 'unfocus' }, { type: 'clearMarks' }];
      if (news.length) news.forEach((n, i) => {
        lane.push(token(n), cid(n));
        if (!i) rec.do(...together(clear, true)); // 흐림과 화살표 걷기는 첫 토큰이 날아가는 것과 같이
      });
      else rec.do(...together(clear));
      last = cur;
      if (end) {
        rec.phase('열에 더하기', `큐가 비어 덩어리가 끝났습니다. 크기 ${josa(size, '을', '를')} 걸친 열 ${cols.join(', ')}에 한 번씩만 더합니다.`, BFS_AT.add);
        rec.do(...together([paint(cur, { tone: 'visited' }), ...cols.map((c) => setTotal(c, total[c]))]));
        scan = undefined;
      }
    }
  });

  // 열마다의 석유량 가운데 가장 큰 값
  const best = total.indexOf(TRUTH);
  rec.step({ title: `가장 큰 열 ${best} — ${TRUTH}`, codeHighlights: BFS_AT.done, ...meta(), answer: TRUTH, isKeyframe: true });
  rec.phase('최댓값 고르기', `열마다의 석유량 ${listText(total)}에서 가장 큰 값은 ${best}열의 ${TRUTH}입니다.`, BFS_AT.done);
  rec.do({ type: 'set', id: `col:${best}`, patch: { tone: 'good' }, pop: true });
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 열마다 BFS: 시추하기 → 덩어리 세기 → best 갱신                         */
/* ------------------------------------------------------------------ */

function perColumn(): Visualization {
  const rec = new StepRecorder(board({ drill: true, best: true }));
  let work = 0;
  let best = 0;
  let showing: Cell[] = []; // 지금 칠해 둔 석유 칸
  const meta = (col: number | '-', oil: number | '-') => ({ work, variables: { col, oil, best } });

  for (let c = 0; c < M; c++) {
    const touched = DEPOSITS.filter((d) => d.cols.includes(c));
    const oil = touched.reduce((s, d) => s + d.cells.length, 0);
    work += oil;
    const prevBest = best;
    best = Math.max(best, oil);
    rec.step({ title: `${c}열에 시추 — ${oil}`, codeHighlights: COLUMNS_AT.best, ...meta(c, oil) });
    rec.phase('시추하기', `${c}열에 시추관을 꽂습니다. 방문 표시를 새로 만들고 oil을 0으로 합니다.`, COLUMNS_AT.drill);
    rec.do(...together([{ type: 'set', id: 'drill', patch: { rect: drillRect(c) } }, ...showing.map((x) => paint(x, { tone: 'plain', text: '' }))]));
    showing = touched.flatMap((d) => d.cells);
    rec.phase('덩어리 세기', touched.length === 0
      ? '이 열에는 석유가 없어 oil은 0입니다.'
      : touched.length === 1
        ? `이 열에 닿은 덩어리는 하나입니다. BFS로 ${oil}칸을 세어 oil이 ${oil}입니다.`
        : `이 열에 닿은 덩어리 ${touched.length}개를 BFS로 차례로 세어 ${touched.map((d) => d.cells.length).join(' + ')} = ${oil}입니다.`, COLUMNS_AT.count);
    rec.do(...together(showing.map((x) => paint(x, { tone: 'queued' }, true))));
    rec.phase('best 갱신', oil > prevBest
      ? `oil ${josa(oil, '이', '가')} 지금까지의 best ${prevBest}보다 커서 best를 ${best}로 바꿉니다.`
      : `oil ${josa(oil, '은', '는')} best ${best}보다 크지 않아 그대로입니다.`, COLUMNS_AT.best);
    rec.do(...together([setTotal(c, oil), { type: 'set', id: 'best', patch: { text: `best ${best}` }, pop: true }]));
  }

  const col = TOTALS.indexOf(TRUTH);
  rec.step({ title: `가장 큰 열 ${col} — ${TRUTH}`, codeHighlights: COLUMNS_AT.done, ...meta('-', '-'), answer: best, isKeyframe: true });
  rec.phase('결과 확인', `모든 열을 해 본 뒤 가장 큰 값 ${best}를 돌려줍니다. 칸을 ${work}번 훑었는데, 정석은 석유 ${DEPOSITS.reduce((s, d) => s + d.cells.length, 0)}칸을 한 번씩만 훑습니다.`, COLUMNS_AT.done);
  rec.do(...together([{ type: 'set', id: `col:${col}`, patch: { tone: 'good' }, pop: true }, { type: 'set', id: 'best', patch: { tone: 'good' } }]));
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정 칸마다 더하기: 덩어리 번호 붙이기 → 열 훑기 → 정답과 비교                */
/* ------------------------------------------------------------------ */

function everyCell(): Visualization {
  const rec = new StepRecorder(board({ drill: true }));
  let work = 0;
  let best = 0;
  const sizes: number[] = [];
  const sizeOf = new Map<string, number>();
  const owner = new Map<string, number>(); // 칸이 속한 덩어리 번호
  let shown: Cell[] = [];
  const meta = (col: number | '-', oil: number | '-') => ({ work, variables: { col, oil, best, sizes: listText(sizes) } });

  // 덩어리 번호 붙이기: 덩어리 하나를 BFS로 번호를 붙이고 크기를 적는다(빨리 감기). 칸마다 그 덩어리 크기를 적어 둔다
  DEPOSITS.forEach(({ start, cells }, k) => {
    work += cells.length;
    sizes.push(cells.length);
    for (const c of cells) {
      sizeOf.set(key(c), cells.length);
      owner.set(key(c), k);
    }
    rec.step({ title: `덩어리 ${k} — 크기 ${cells.length}`, codeHighlights: CELLS_AT.label, ...meta('-', '-') });
    rec.phase('번호 붙이기', `${fmt(start)}에서 BFS로 이어진 석유 ${cells.length}칸에 덩어리 번호 ${josa(k, '을', '를')} 붙이고 sizes에 크기 ${josa(cells.length, '을', '를')} 담습니다.`, CELLS_AT.label);
    rec.do({ type: 'focus', ids: cells.map(cid) }, ...together(cells.map((c) => paint(c, { tone: 'visited', text: String(cells.length) }, true)), true), wait(150), { type: 'unfocus' });
  });

  for (let c = 0; c < M; c++) {
    const inCol = DEPOSITS.flatMap((d) => d.cells.filter((x) => x[1] === c)).sort((a, b) => a[0] - b[0]);
    const oil = inCol.reduce((s, x) => s + sizeOf.get(key(x))!, 0);
    best = Math.max(best, oil);
    rec.step({ title: `${c}열 훑기 — ${oil}`, codeHighlights: CELLS_AT.column, ...meta(c, oil) });
    const terms = inCol.map((x) => sizeOf.get(key(x)));
    const again = inCol.length > new Set(inCol.map((x) => owner.get(key(x)))).size; // 같은 덩어리를 두 번 이상 만났는가
    rec.phase('열 훑기', inCol.length === 0
      ? `${c}열에는 석유가 없어 oil은 0입니다.`
      : `${c}열을 위에서 아래로 훑으며 석유 칸을 만날 때마다 그 칸 덩어리의 크기를 더합니다. ${inCol.length === 1 ? `oil은 ${oil}` : `${terms.join(' + ')} = ${oil}`}입니다.${again ? ' 같은 덩어리를 여러 번 더했습니다.' : ''}`, CELLS_AT.column);
    rec.do({ type: 'set', id: 'drill', patch: { rect: drillRect(c) } }, ...together([...shown.map((x) => paint(x, { tone: 'visited' })), ...inCol.map((x) => paint(x, { tone: 'bad' })), setTotal(c, oil)], true));
    shown = inCol;
  }

  const col = WRONG_TOTALS.indexOf(MISTAKE);
  rec.step({ title: `내 답 ${best}, 정답은 ${TRUTH}`, codeHighlights: CELLS_AT.done, ...meta('-', '-'), answer: best, isKeyframe: true });
  rec.phase('오답 확인', `가장 큰 열은 ${col}열의 ${best}입니다. 하지만 한 덩어리는 한 열에서 한 번만 세어야 해서 정답은 ${TRUTH}입니다.`, CELLS_AT.done);
  rec.do(...together([{ type: 'set', id: `col:${col}`, patch: { tone: 'bad' }, pop: true }]));
  rec.do({ type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 50, y: 5, w: 110, h: 30 }, tone: 'bad', text: `내 답 ${best}` } },
    { type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 168, y: 5, w: 110, h: 30 }, tone: 'good', text: `정답 ${TRUTH}` }, together: true });
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'oil-drilling',
  title: '석유 시추',
  level: 2,
  category: 'dfs-bfs',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/250136',
  description: {
    summary:
      '땅 속 석유가 격자로 주어집니다(1은 석유, 0은 빈 땅). 상하좌우로 이어진 석유는 하나의 덩어리입니다. 시추관을 세로로 한 열에만 꽂을 수 있고, 그 열이 지나는 덩어리의 석유를 모두 얻습니다. 얻을 수 있는 가장 많은 석유의 양을 구합니다.',
    rules: [
      'land는 n × m 격자이고 n, m은 1 이상 500 이하(정확성 테스트는 100 이하)',
      '각 칸은 0(빈 땅) 또는 1(석유)',
      '상하좌우로 이어진 석유가 하나의 덩어리이고, 덩어리의 석유는 모두 뽑힘',
      '시추관은 세로로 한 열에만 꽂을 수 있음',
    ],
    examples: [
      { input: 'land = [[0,0,0,1,1,1,0,0],[0,0,0,0,1,1,0,0],[1,1,0,0,0,1,1,0],[1,1,1,0,0,0,0,0],[1,1,1,0,0,0,1,1]]', output: '9' },
      { input: 'land = [[1,0,1,0,1,1],[1,0,1,0,0,0],[1,0,1,0,0,1],[1,0,0,1,0,0],[1,0,0,1,0,1],[1,0,0,0,0,0],[1,1,1,1,1,1]]', output: '16' },
    ],
  },
  keyIntuitions: [
    '열마다 BFS를 새로 하면 같은 덩어리를 걸친 열의 수만큼 다시 셉니다. 덩어리를 BFS로 한 번만 찾아 "크기와 걸친 열"을 적어 두면 땅 전체를 한 번만 훑으면 됩니다.',
    '덩어리의 크기는 걸친 열마다 한 번씩만 더합니다. 한 열에서 같은 덩어리의 칸이 여러 개여도 덩어리는 하나라서, 걸친 열을 set으로 모읍니다.',
    '모든 덩어리를 열에 더한 뒤 열별 합의 최댓값이 답입니다. 500 × 500 효율성 테스트에서는 열마다 BFS(최대 약 1억 2,500만 번)가 시간 초과가 납니다.',
  ],
  demo: { input: [LAND], label: 'land = 예제 1 (5×8)' },
  workUnit: '칸을 훑은 횟수',
  approaches: [
    {
      id: 'oil-bfs',
      name: '너비 우선 탐색 (덩어리 나누기 + 열 합산)',
      rank: 'BEST',
      timeComplexity: 'O(N × M)',
      spaceComplexity: 'O(N × M)',
      verdict: '덩어리를 BFS로 한 번만 찾아 크기를 걸친 열에 더하고 열별 최댓값을 고르는 표준 풀이입니다.',
      pros: [
        '석유 칸을 한 번씩만 훑어서 500 × 500 효율성 테스트도 충분히 빠릅니다.',
        '덩어리마다 걸친 열을 set으로 모아 한 열에 한 번씩만 더하므로 같은 덩어리를 두 번 세지 않습니다.',
        '재귀가 없어 땅이 커도 재귀 한도를 걱정할 필요가 없습니다.',
      ],
      cons: ['열마다 석유량을 담는 배열과 방문 표시 배열이 따로 필요합니다.'],
      whyThisRank:
        '"덩어리마다 한 번 구하고 열에 나눠 더한다"가 이 문제의 핵심입니다. 열마다 처음부터 세는 것보다 훨씬 적게 일하고, 방문 표시 한 겹으로 모든 것이 끝납니다.',
      code: BFS,
      visualize: labeling,
    },
    {
      id: 'oil-columns',
      name: '열마다 BFS (완전 탐색)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × M²)',
      spaceComplexity: 'O(N × M)',
      verdict: '정답은 나오지만 열마다 덩어리를 처음부터 다시 세어 효율성 테스트에서 시간 초과가 납니다.',
      pros: ['문제를 읽은 그대로 옮긴 가장 직관적인 풀이라 틀리기 어렵습니다.', '땅이 작은 정확성 테스트(100 × 100)는 통과합니다.'],
      cons: [
        '같은 덩어리를 걸친 열마다 다시 세서, 시각화 입력에서는 칸을 56번 훑는데 정석은 17번이면 끝납니다.',
        '500 × 500 효율성 테스트에서는 열마다 최대 25만 칸을 훑어 약 1억 2,500만 번이라 시간 초과가 납니다.',
      ],
      whyThisRank:
        '맞게는 풀지만 덩어리를 열마다 다시 센다는 점이 정석과의 차이입니다. 같은 덩어리의 크기는 한 번만 구하면 되므로 땅이 커지면 이 풀이는 시간 안에 끝나지 않습니다.',
      code: COLUMNS,
      visualize: perColumn,
    },
    {
      id: 'oil-cells',
      name: '열을 훑으며 칸마다 덩어리 크기 더하기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N × M)',
      spaceComplexity: 'O(N × M)',
      verdict: '덩어리 크기를 구해 두는 것까지는 같지만 한 열에서 같은 덩어리를 칸마다 더해 오답이 나옵니다.',
      pros: ['덩어리마다 크기를 한 번만 구하는 점은 정석과 같아 시간도 빠릅니다.'],
      cons: [
        '열을 훑으며 석유 칸마다 그 칸 덩어리의 크기를 더해, 한 덩어리가 한 열에서 여러 칸이면 크기를 여러 번 더합니다. 시각화 입력의 0열은 크기 8인 덩어리가 3칸이라 8을 세 번 더해 24가 나옵니다(정답은 9).',
        '덩어리가 한 열에서 한 칸씩만 지나는 입력에서는 우연히 맞아 예제 일부를 통과합니다.',
      ],
      whyThisRank:
        '시추관은 덩어리를 한 번에 통째로 뽑습니다. 그래서 한 열에서 같은 덩어리는 한 번만 세어야 하고, 이를 위해 덩어리가 걸친 열을 set으로 모아 크기를 한 번씩만 더해야 합니다.',
      code: CELLS,
      visualize: everyCell,
    },
  ],
  checks: {
    cases: [
      { args: [[[0, 0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 0, 1, 1, 0, 0], [1, 1, 0, 0, 0, 1, 1, 0], [1, 1, 1, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 1, 1]]], expected: 9 },
      { args: [[[1, 0, 1, 0, 1, 1], [1, 0, 1, 0, 0, 0], [1, 0, 1, 0, 0, 1], [1, 0, 0, 1, 0, 0], [1, 0, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1]]], expected: 16 },
      { args: [[[0]]], expected: 0 },
      { args: [[[1]]], expected: 1 },
      { args: [[[1], [1], [1]]], expected: 3 },
      { args: [[[1, 1, 1]]], expected: 3 },
      { args: [[[1, 0, 1], [0, 0, 0], [1, 0, 1]]], expected: 2 },
      { args: [LAND], expected: TRUTH },
    ],
    // 세로 1~6칸, 가로 1~6칸, 칸마다 45% 확률로 석유(1)
    random: (rand) => {
      const [n, m] = [1 + Math.floor(rand() * 6), 1 + Math.floor(rand() * 6)];
      return [Array.from({ length: n }, () => Array.from({ length: m }, () => (rand() < 0.45 ? 1 : 0)))];
    },
  },
};

export default problem;
