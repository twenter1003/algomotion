// 게임 맵 최단거리: 정석 BFS, 대안 다익스트라, 함정 DFS(모든 경로)를 같은 장면에서 움직인다.
// 장면은 위에 줄(큐·힙·스택), 아래에 5×5 격자다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { around, center, grid } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Language, Point, Problem, Rect, Scene, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { at, fmt, josa, ro } from '../shared.ts';

type Cell = [number, number];
type Lines = Record<Language, number[]>;

// 예제 1. 세 풀이의 시각화 입력이자 첫 점검 사례다.
const MAPS = [
  [1, 0, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1],
  [1, 1, 1, 0, 1],
  [0, 0, 0, 0, 1],
];
const N = MAPS.length;
const M = MAPS[0].length;
const START: Cell = [0, 0];
const GOAL: Cell = [N - 1, M - 1];
const DIRS: Cell[] = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 상, 하, 좌, 우(세 풀이 코드와 같은 순서)

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

// 풀이 코드에서 조각이 든 줄 번호: Python 조각들, JavaScript 조각들
const lines = (code: Record<Language, string>, python: string[], javascript: string[]): Lines =>
  ({ python: at(code.python, ...python), javascript: at(code.javascript, ...javascript) });

const BFS = {
  python: `from collections import deque

def solution(maps):
    n, m = len(maps), len(maps[0])
    dx = [-1, 1, 0, 0]  # 상, 하, 좌, 우
    dy = [0, 0, -1, 1]

    queue = deque([(0, 0)])
    dist = [[-1] * m for _ in range(n)]
    dist[0][0] = 1  # 출발 칸도 1칸으로 셉니다

    while queue:
        x, y = queue.popleft()
        if x == n - 1 and y == m - 1:
            return dist[x][y]  # 도착 칸을 처음 꺼낸 순간이 최단 거리

        for i in range(4):
            nx, ny = x + dx[i], y + dy[i]
            if 0 <= nx < n and 0 <= ny < m:
                if maps[nx][ny] == 1 and dist[nx][ny] == -1:
                    dist[nx][ny] = dist[x][y] + 1
                    queue.append((nx, ny))

    return -1`,
  javascript: `function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const dx = [-1, 1, 0, 0]; // 상, 하, 좌, 우
  const dy = [0, 0, -1, 1];

  const queue = [[0, 0]];
  const dist = Array.from({ length: n }, () => Array(m).fill(-1));
  dist[0][0] = 1; // 출발 칸도 1칸으로 셉니다

  let head = 0; // shift() 대신 인덱스로 꺼내 O(1)을 유지합니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x === n - 1 && y === m - 1) {
      return dist[x][y]; // 도착 칸을 처음 꺼낸 순간이 최단 거리
    }

    for (let i = 0; i < 4; i++) {
      const nx = x + dx[i];
      const ny = y + dy[i];
      if (nx >= 0 && nx < n && ny >= 0 && ny < m) {
        if (maps[nx][ny] === 1 && dist[nx][ny] === -1) {
          dist[nx][ny] = dist[x][y] + 1;
          queue.push([nx, ny]);
        }
      }
    }
  }

  return -1;
}`,
};
const BFS_AT = {
  start: lines(BFS, ['queue = deque', 'dist = [[-1]', 'dist[0][0] = 1'], ['const queue = [[0, 0]]', 'const dist = Array', 'dist[0][0] = 1']),
  pop: lines(BFS, ['x, y = queue.popleft()'], ['const [x, y] = queue[head++]']),
  look: lines(BFS, ['for i in range(4)', 'if maps[nx][ny] == 1'], ['for (let i = 0; i < 4; i++)', 'if (maps[nx][ny] === 1']),
  mark: lines(BFS, ['for i in range(4)', 'if maps[nx][ny] == 1', 'dist[nx][ny] = dist[x][y] + 1'],
    ['for (let i = 0; i < 4; i++)', 'if (maps[nx][ny] === 1', 'dist[nx][ny] = dist[x][y] + 1']),
  push: lines(BFS, ['queue.append((nx, ny))'], ['queue.push([nx, ny])']),
  next: lines(BFS, ['while queue:'], ['while (head < queue.length)']),
  goal: lines(BFS, ['if x == n - 1 and y == m - 1', 'return dist[x][y]'], ['if (x === n - 1 && y === m - 1)', 'return dist[x][y]']),
};

const DIJKSTRA = {
  python: `import heapq

def solution(maps):
    n, m = len(maps), len(maps[0])
    dist = [[float('inf')] * m for _ in range(n)]
    dist[0][0] = 1
    pq = [(1, 0, 0)]  # (비용, x, y)

    while pq:
        cost, x, y = heapq.heappop(pq)
        if cost > dist[x][y]:
            continue  # 이미 더 짧게 온 적이 있는 칸
        if x == n - 1 and y == m - 1:
            return cost
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] == 1:
                if cost + 1 < dist[nx][ny]:
                    dist[nx][ny] = cost + 1
                    heapq.heappush(pq, (cost + 1, nx, ny))
    return -1`,
  javascript: `function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const dist = Array.from({ length: n }, () => Array(m).fill(Infinity));
  const heap = [[1, 0, 0]]; // [비용, x, y]를 담는 최소 힙
  dist[0][0] = 1;

  const push = (item) => {
    heap.push(item);
    for (let i = heap.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1;
        const r = l + 1;
        let min = i;
        if (l < heap.length && heap[l][0] < heap[min][0]) min = l;
        if (r < heap.length && heap[r][0] < heap[min][0]) min = r;
        if (min === i) break;
        [heap[min], heap[i]] = [heap[i], heap[min]];
        i = min;
      }
    }
    return top;
  };

  while (heap.length > 0) {
    const [cost, x, y] = pop();
    if (cost > dist[x][y]) continue; // 이미 더 짧게 온 적이 있는 칸
    if (x === n - 1 && y === m - 1) return cost;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] === 1 && cost + 1 < dist[nx][ny]) {
        dist[nx][ny] = cost + 1;
        push([cost + 1, nx, ny]);
      }
    }
  }
  return -1;
}`,
};
const DIJKSTRA_AT = {
  start: lines(DIJKSTRA, ['dist[0][0] = 1', 'pq = [(1, 0, 0)]'], ['const heap = [[1, 0, 0]]', 'dist[0][0] = 1']),
  pop: lines(DIJKSTRA, ['cost, x, y = heapq.heappop(pq)'], ['const [cost, x, y] = pop()']),
  look: lines(DIJKSTRA, ['for dx, dy in', 'if 0 <= nx < n', 'if cost + 1 < dist[nx][ny]'], ['for (const [dx, dy] of', 'cost + 1 < dist[nx][ny]']),
  mark: lines(DIJKSTRA, ['for dx, dy in', 'if 0 <= nx < n', 'if cost + 1 < dist[nx][ny]', 'dist[nx][ny] = cost + 1'],
    ['for (const [dx, dy] of', 'cost + 1 < dist[nx][ny]', 'dist[nx][ny] = cost + 1']),
  push: lines(DIJKSTRA, ['heapq.heappush(pq, (cost + 1, nx, ny))'], ['push([cost + 1, nx, ny])', 'for (let i = heap.length - 1; i > 0; )']),
  next: lines(DIJKSTRA, ['while pq:'], ['while (heap.length > 0)']),
  goal: lines(DIJKSTRA, ['if x == n - 1 and y == m - 1', 'return cost'], ['if (x === n - 1 && y === m - 1) return cost']),
};

const DFS = {
  python: `# 주의: 효율성 테스트에서 시간 초과가 나는 풀이입니다
def solution(maps):
    n, m = len(maps), len(maps[0])
    visited = [[False] * m for _ in range(n)]
    best = float('inf')

    def dfs(x, y, count):
        nonlocal best
        if x == n - 1 and y == m - 1:
            best = min(best, count)
            return
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] == 1 and not visited[nx][ny]:
                visited[nx][ny] = True
                dfs(nx, ny, count + 1)
                visited[nx][ny] = False  # 되돌리기 → 모든 경로를 다시 탐색

    visited[0][0] = True
    dfs(0, 0, 1)
    return best if best != float('inf') else -1`,
  javascript: `// 주의: 효율성 테스트에서 시간 초과가 나는 풀이입니다
function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  let best = Infinity;

  const dfs = (x, y, count) => {
    if (x === n - 1 && y === m - 1) {
      best = Math.min(best, count);
      return;
    }
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] === 1 && !visited[nx][ny]) {
        visited[nx][ny] = true;
        dfs(nx, ny, count + 1);
        visited[nx][ny] = false; // 되돌리기 → 모든 경로를 다시 탐색
      }
    }
  };

  visited[0][0] = true;
  dfs(0, 0, 1);
  return best === Infinity ? -1 : best;
}`,
};
const DFS_AT = {
  start: lines(DFS, ['visited[0][0] = True', 'dfs(0, 0, 1)'], ['visited[0][0] = true', 'dfs(0, 0, 1)']),
  enter: lines(DFS, ['visited[nx][ny] = True', 'dfs(nx, ny, count + 1)'], ['visited[nx][ny] = true', 'dfs(nx, ny, count + 1)']),
  found: lines(DFS, ['if x == n - 1 and y == m - 1', 'best = min(best, count)'], ['if (x === n - 1 && y === m - 1)', 'best = Math.min(best, count)']),
  back: lines(DFS, ['visited[nx][ny] = False'], ['visited[nx][ny] = false']),
  result: lines(DFS, ['return best if best'], ['return best === Infinity']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 330;
const H = 372;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다
const LANE: LaneOptions = { id: 'lane', x: 40, y: 5, slotW: 64, slotH: 30, gap: 6, max: 4 };
const cellRect = grid({ x: 14, y: 58, rows: N, cols: M, cell: 54, gap: 8 });
const key = ([r, c]: Cell) => `${r},${c}`;
const same = (a: Cell, b: Cell) => key(a) === key(b);
const cellId = (c: Cell) => `cell:${key(c)}`;
const mid = ([r, c]: Cell): Point => center(cellRect(r, c));
const token = (c: Cell) => ({ id: `tok:${key(c)}`, text: fmt(c) });
const neighbors = ([r, c]: Cell): Cell[] =>
  DIRS.map(([dr, dc]): Cell => [r + dr, c + dc]).filter(([nr, nc]) => nr >= 0 && nr < N && nc >= 0 && nc < M);

// 세 풀이가 같이 쓰는 장면: 줄 이름표와 바탕, 격자, 정답 경로 선(처음에는 비어 있음)
function board(lane: '큐' | '힙' | '스택', ...extra: Item[]): Scene {
  const items: Item[] = [
    { id: 'lane:label', kind: 'text', rect: { x: 0, y: 0, w: 34, h: 40 }, text: lane },
    { id: 'lane:bg', kind: 'zone', rect: { x: 34, y: 0, w: 296, h: 40 } },
  ];
  MAPS.forEach((row, r) => row.forEach((open, c) => {
    const tag = same([r, c], START) ? '출발' : same([r, c], GOAL) ? '도착' : undefined;
    items.push({ id: cellId([r, c]), kind: 'cell', rect: cellRect(r, c), tone: open ? 'plain' : 'wall', ...(tag ? { tag } : {}) });
  }));
  items.push({ id: 'path', kind: 'line', rect: FULL, tone: 'path', points: [] }, ...extra);
  return { width: W, height: H, items };
}

const paint = (c: Cell, patch: ItemPatch): Extract<Action, { type: 'set' }> => ({ type: 'set', id: cellId(c), patch });
// 한 묶음: 첫 동작은 앞 동작이 끝난 뒤, 나머지는 첫 동작과 같이 시작한다. join이면 첫 동작도 앞 동작과 같이 시작한다.
const together = (actions: Action[], join = false): Action[] =>
  actions.map((a, i) => (i || join ? { ...a, together: true } : a));
// 지금 칸 테두리: 처음에는 그 자리에 나타나고, 그 뒤로는 미끄러져 옮겨 간다
const ringTo = (rec: StepRecorder, c: Cell): Action => {
  const rect = around(cellRect(...c), 5);
  return rec.has('ring') ? { type: 'set', id: 'ring', patch: { rect } } : { type: 'add', item: { id: 'ring', kind: 'ring', rect } };
};
// 경로 칸을 한꺼번에 분홍으로 칠하고(칸 글은 출발부터 1, 2, 3 …), 분홍 선을 출발에서 도착까지 긋는다
const drawPath = (rec: StepRecorder, path: Cell[]) => {
  rec.do(...together(path.map((c, i) => paint(c, { tone: 'path', text: String(i + 1) }))));
  rec.do({ type: 'trace', id: 'path', points: path.map(mid) });
};

/* ------------------------------------------------------------------ */
/* 정석 BFS · 대안 다익스트라: 꺼내기 → 살피기 → 넣기(넣고 정렬)          */
/* ------------------------------------------------------------------ */

// 가중치가 모두 1이라 두 풀이는 칸을 꺼내는 순서까지 같다. 흐름은 하나로 두고 코드 줄과 말만 풀이마다 끼운다.
interface Script {
  heap: boolean; // 다익스트라: 넣은 뒤 비용순으로 정렬하고 힙 정렬 횟수를 센다
  at: Record<'start' | 'pop' | 'look' | 'mark' | 'push' | 'next' | 'goal', Lines>;
  start: string;
  pop: (c: Cell, d: number) => string;
  look: (next?: number) => string; // next: 새 칸에 적는 값(새 칸이 없으면 없음)
  push: (news: Cell[]) => string;
  goal: string; // 도착 칸을 꺼낼 때
  arrive: (o: { d: number; pops: number; sorts: number }) => string;
}

const BFS_SCRIPT: Script = {
  heap: false,
  at: BFS_AT,
  start: '출발 칸도 한 칸으로 세므로 (0, 0)에 거리 1을 적고 큐에 넣습니다.',
  pop: (c, d) => `큐 맨 앞에서 ${josa(fmt(c), '을', '를')} 꺼냅니다. 이 칸까지의 거리는 ${d}입니다.`,
  look: (next) => `상하좌우 칸을 하나씩 확인합니다. 벽이나 이미 방문한 칸은 ${
    next ? `건너뛰고, 새 칸에는 거리 ${josa(next, '을', '를')} 적습니다.` : '건너뜁니다.'}`,
  push: (news) => `새로 찾은 ${josa(news.map(fmt).join(', '), '을', '를')} 큐 뒤에 넣습니다.`,
  goal: `큐 맨 앞에서 도착 칸 ${josa(fmt(GOAL), '을', '를')} 꺼냈습니다.`,
  arrive: ({ d, pops }) => `도착 칸을 처음 꺼낸 순간의 거리 ${josa(d, '이', '가')} 최단 거리입니다. 칸을 ${pops}번 밟았습니다.`,
};

const DIJKSTRA_SCRIPT: Script = {
  heap: true,
  at: DIJKSTRA_AT,
  start: '출발 칸 (0, 0)에 비용 1을 적고 힙에 넣습니다.',
  pop: (c, d) => `힙에서 비용이 가장 작은 ${josa(fmt(c), '을', '를')} 꺼냅니다. 이 칸까지의 비용은 ${d}입니다.`,
  look: (next) => `상하좌우 칸을 하나씩 확인합니다. 벽이나 이미 적힌 비용이 같거나 더 작은 칸은 ${
    next ? `건너뛰고, 새 칸에는 비용 ${josa(next, '을', '를')} 적습니다.` : '건너뜁니다.'}`,
  push: (news) => `새로 찾은 ${josa(news.map(fmt).join(', '), '을', '를')} 힙에 넣고 비용순으로 정렬합니다. 가중치가 모두 1이라 순서는 그대로입니다.`,
  goal: `힙에서 비용이 가장 작은 도착 칸 ${josa(fmt(GOAL), '을', '를')} 꺼냈습니다.`,
  arrive: ({ d, sorts }) => `도착 칸을 꺼낸 순간의 비용 ${josa(d, '이', '가')} 최단 거리입니다. 답은 BFS와 같지만, 힙에 넣고 꺼내느라 정렬을 ${sorts}번 더 했습니다.`,
};

const VERDICT_LABEL = { wall: '벽', seen: '방문함', new: '새 칸' } as const;

function layered(s: Script): Visualization {
  const rec = new StepRecorder(board(s.heap ? '힙' : '큐'));
  const lane = new Lane(rec, LANE);
  const dist = MAPS.map((row) => row.map(() => 0)); // 0이면 아직 못 간 칸
  const prev = new Map<string, Cell>(); // 도착 칸에서 경로를 되짚을 때 쓰는 직전 칸
  const waiting: Cell[] = [START]; // 큐(힙)에 든 칸, 꺼낼 차례대로
  let pops = 0;
  let sorts = 1; // 힙 정렬 횟수: 넣을 때와 꺼낼 때마다 1번
  let last: Cell | undefined; // 바로 전에 꺼낸 칸
  const d = ([r, c]: Cell) => dist[r][c];
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = (cur?: Cell, news: Cell[] = []) => ({
    work: pops,
    ...(s.heap ? { workNote: `힙 정렬 ${sorts}번` } : {}),
    variables: {
      '(x, y)': cur ? fmt(cur) : '-',
      [s.heap ? 'cost' : 'dist[x][y]']: cur ? d(cur) : '-',
      '새로 넣은 칸': news.length ? news.map(fmt).join(', ') : '없음',
      [s.heap ? 'heap' : 'queue']: `[${waiting.map((c) => (s.heap ? `(${d(c)}, ${c[0]}, ${c[1]})` : fmt(c))).join(', ')}]`,
    },
  });
  // 꺼내기: 줄 맨 앞 토큰이 칸으로 날아가 그 칸이 지금 칸이 되고, 바로 전 칸은 방문을 마친다
  const takeOut = (cur: Cell) => {
    lane.shift(cellId(cur));
    rec.do(...together([paint(cur, { tone: 'current' }), ringTo(rec, cur), ...(last ? [paint(last, { tone: 'visited' })] : [])]));
  };

  dist[0][0] = 1;
  rec.step({ title: `출발 칸 (0, 0)을 ${s.heap ? '힙' : '큐'}에 넣기`, codeHighlights: s.at.start, ...meta(undefined, [START]) });
  rec.phase('시작', s.start);
  rec.do({ ...paint(START, { tone: 'queued', text: '1' }), pop: true });
  lane.push(token(START), cellId(START));

  while (waiting.length) {
    const cur = waiting.shift()!;
    pops++;
    if (s.heap) sorts++;

    if (same(cur, GOAL)) {
      rec.step({ title: `도착 칸 ${fmt(cur)} 꺼내기 — 최단 거리 ${d(cur)}`, codeHighlights: s.at.goal, ...meta(cur), answer: d(cur), isKeyframe: true });
      rec.phase('꺼내기', s.goal, s.at.pop);
      takeOut(cur);
      rec.phase('도착', s.arrive({ d: d(cur), pops, sorts }));
      const path = [cur];
      for (let c = prev.get(key(cur)); c; c = prev.get(key(c))) path.unshift(c);
      drawPath(rec, path);
      break;
    }

    // 상하좌우 판정. 다익스트라의 'cost + 1 < dist'도 가중치가 모두 1이면 '아직 못 간 칸'과 같다.
    const probes = neighbors(cur).map((n) => ({ n, verdict: !MAPS[n[0]][n[1]] ? 'wall' : d(n) ? 'seen' : 'new' } as const));
    const news = probes.filter((p) => p.verdict === 'new').map((p) => p.n);
    for (const [r, c] of news) {
      dist[r][c] = d(cur) + 1;
      prev.set(key([r, c]), cur);
      waiting.push([r, c]);
    }
    if (s.heap) {
      sorts += news.length;
      waiting.sort((a, b) => d(a) - d(b)); // 비용이 같으면 넣은 차례대로
    }

    rec.step({
      title: news.length ? `${fmt(cur)} 꺼내고 ${news.length}칸 넣기` : `${fmt(cur)} 꺼내기 — 넣을 칸 없음`,
      codeHighlights: news.length ? s.at.push : s.at.next,
      ...meta(cur, news),
    });
    rec.phase('꺼내기', s.pop(cur, d(cur)), s.at.pop);
    takeOut(cur);

    rec.phase('살피기', s.look(news.length ? d(cur) + 1 : undefined), news.length ? s.at.mark : s.at.look);
    rec.do({ type: 'focus', ids: [cellId(cur), 'ring', ...probes.map((p) => cellId(p.n))] });
    for (const { n, verdict } of probes) {
      rec.do({ type: 'arrow', from: cellId(cur), to: cellId(n), verdict, label: VERDICT_LABEL[verdict] });
      if (verdict === 'new') rec.do({ ...paint(n, { tone: 'queued', text: String(d(n)) }), pop: true });
    }

    rec.phase(s.heap ? '넣고 정렬' : '넣기', news.length ? s.push(news) : '새로 넣을 칸이 없어 그대로 넘어갑니다.');
    rec.do({ type: 'unfocus' }, { type: 'clearMarks', together: true });
    for (const n of news) lane.push(token(n), cellId(n));
    if (s.heap && news.length) lane.reorder(waiting.map((c) => token(c).id));
    last = cur;
  }
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 DFS: 들어가기 · 되돌아가기 · 경로 찾음 → 최단 확정               */
/* ------------------------------------------------------------------ */

function backtrack(): Visualization {
  const rec = new StepRecorder(board('스택', { id: 'trail', kind: 'line', rect: FULL, tone: 'trail', points: [] }));
  const lane = new Lane(rec, { ...LANE, foldable: true });
  const visited = MAPS.map((row) => row.map(() => false));
  const visits = MAPS.map((row) => row.map(() => 0)); // 칸마다 밟은 횟수
  const stack: Cell[] = []; // 지금 경로 = 호출 스택
  let back: Cell[] = []; // 되돌아왔지만 아직 단계로 남기지 않은 칸(먼저 빠져나온 칸부터)
  let calls = 0;
  let best = Infinity;
  let bestPath: Cell[] = [];
  const meta = () => {
    const top = stack.at(-1);
    return { work: calls, variables: { '(x, y)': top ? fmt(top) : '-', count: top ? stack.length : '-', best: best === Infinity ? '∞' : best } };
  };

  // 들어가기: 앞 칸은 밟고 있는 길, 새 칸은 지금 칸으로 칠하고, 길 선을 늘리고, 토큰을 스택에 쌓는다
  const enter = (cell: Cell) => {
    const [r, c] = cell;
    const from = stack.at(-2);
    rec.do(...together([
      ...(from ? [paint(from, { tone: 'trail' })] : []),
      paint(cell, { tone: 'current', text: String(stack.length), ...(visits[r][c] > 1 ? { sub: `${visits[r][c]}번` } : {}) }),
      ringTo(rec, cell),
      { type: 'set', id: 'trail', patch: { points: stack.map(mid) } },
    ]));
    lane.push(token(cell), cellId(cell));
  };

  // 되돌아가기: 연달아 돌아온 칸을 한 단계로 묶는다. 위에서부터 토큰을 칸으로 돌려보내고 칸을 회색으로 칠한다.
  const retreat = () => {
    if (!back.length) return;
    const top = stack.at(-1);
    const why = same(back[0], GOAL) ? '다른 경로를 찾으러' : `${josa(fmt(back[0]), '은', '는')} 막다른 곳이라`;
    rec.step({ title: top ? `${fmt(top)}까지 ${back.length}칸 되돌아가기` : `${back.length}칸 모두 되돌아 나오기`, codeHighlights: DFS_AT.back, ...meta() });
    rec.phase('되돌아가기', top
      ? `${why} 안 가 본 방향이 남은 ${fmt(top)}까지 ${back.length}칸 되돌아갑니다.`
      : `${why} 되돌아가지만 남은 방향이 없어 ${back.length}칸을 모두 빠져나옵니다.`);
    const path = [...stack, ...back.toReversed()];
    for (const cell of back) {
      path.pop();
      const head = path.at(-1);
      lane.pop(cellId(cell));
      rec.do(...together([
        paint(cell, { tone: 'explored', text: '' }),
        { type: 'set', id: 'trail', patch: { points: path.map(mid) } },
        head ? ringTo(rec, head) : { type: 'remove', id: 'ring' },
      ], true));
    }
    // 남은 길: 맨 위 칸은 다시 지금 칸, 나머지는 밟고 있는 길(경로를 찾은 뒤라면 분홍에서 되돌린다)
    rec.do(...together(stack.flatMap((c, i) => {
      const tone = i === stack.length - 1 ? 'current' : 'trail';
      return rec.get(cellId(c)).tone === tone ? [] : [paint(c, { tone })];
    })));
    back = [];
  };

  const dfs = (cell: Cell) => {
    retreat();
    calls++;
    const times = ++visits[cell[0]][cell[1]];
    stack.push(cell);
    const count = stack.length;
    const again = times > 1 ? ` 이 칸은 이번이 ${times}번째입니다.` : '';
    if (same(cell, GOAL)) {
      const shortest = best;
      if (count < best) [best, bestPath] = [count, [...stack]];
      rec.step({ title: `도착 — ${count}칸 경로 찾음`, codeHighlights: DFS_AT.found, ...meta() });
      rec.phase('들어가기', `도착 칸 ${ro(fmt(cell))} 들어갑니다.${again}`, DFS_AT.enter);
      enter(cell);
      rec.phase('경로 찾음', `${shortest === Infinity
        ? `도착! 처음 찾은 경로라 지금까지의 최단은 ${count}칸입니다.`
        : `도착! 이번 경로는 ${count}칸으로 지금까지의 최단 ${shortest}칸보다 ${count < shortest ? '짧습니다' : '짧지 않습니다'}.`
      } 더 짧은 경로가 있을 수 있어 나머지도 끝까지 확인합니다.`);
      rec.do(...together(stack.map((c) => paint(c, { tone: 'path' }))));
    } else {
      const first = count === 1;
      rec.step({ title: first ? '출발 칸 (0, 0)에서 시작' : `${ro(fmt(cell))} 들어가기`, codeHighlights: first ? DFS_AT.start : DFS_AT.enter, ...meta() });
      rec.phase('들어가기', first
        ? '출발 칸 (0, 0)에 방문 표시를 하고 들어갑니다. 지금 경로는 1칸째입니다.'
        : `${ro(fmt(cell))} 들어갑니다. 지금 경로는 ${count}칸째입니다.${again}`);
      enter(cell);
      for (const [nx, ny] of neighbors(cell)) {
        if (!MAPS[nx][ny] || visited[nx][ny]) continue;
        visited[nx][ny] = true;
        dfs([nx, ny]);
        visited[nx][ny] = false;
      }
    }
    stack.pop();
    back.push(cell);
  };

  visited[0][0] = true;
  dfs(START);
  retreat();
  rec.step({ title: `최단 ${best}칸 확정`, codeHighlights: DFS_AT.result, ...meta(), answer: best, isKeyframe: true });
  // 벽 없는 6×6 맵에서 이 함정 코드는 dfs를 18,470,411번 부르고, BFS는 칸을 36번 꺼낸다(직접 세어 봄)
  rec.phase('최단 확정', `모든 경로를 다 본 뒤에야 최단 ${best}칸을 확정합니다. 벽이 없는 6×6 맵만 돼도 칸을 1,847만 번 밟아야 해서(BFS는 36번) 100×100 맵에서는 시간 초과가 납니다.`);
  drawPath(rec, bestPath);
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'game-map',
  title: '게임 맵 최단거리',
  level: 2,
  category: 'dfs-bfs',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/1844',
  description: {
    summary:
      '0은 벽, 1은 길인 n×m 맵에서 왼쪽 위 칸에서 출발해 오른쪽 아래 상대 진영까지 가는 최소 칸 수를 구합니다. 출발 칸과 도착 칸도 셉니다. 도착할 수 없으면 -1을 돌려줍니다.',
    rules: [
      'n, m은 1 이상 100 이하 (둘 다 1인 경우는 없음)',
      '0은 벽, 1은 지나갈 수 있는 길',
      '상하좌우로 한 칸씩만 이동하고 맵 밖으로는 나갈 수 없음',
      '상대 진영에 도착할 수 없으면 -1 반환',
    ],
    examples: [
      { input: 'maps = [[1,0,1,1,1],[1,0,1,0,1],[1,0,1,1,1],[1,1,1,0,1],[0,0,0,0,1]]', output: '11' },
      { input: 'maps = [[1,0,1,1,1],[1,0,1,0,1],[1,0,1,1,1],[1,1,1,0,0],[0,0,0,0,1]]', output: '-1' },
    ],
  },
  keyIntuitions: [
    '가중치 없는 격자의 최단 거리는 BFS로 구합니다. 가까운 칸부터 한 겹씩 넓혀 가므로 도착 칸을 처음 꺼내는 순간이 곧 최단 거리입니다.',
    'DFS는 먼저 찾은 경로가 최단이라는 보장이 없어 모든 경로를 살펴야 하고, 효율성 테스트에서 시간 초과가 납니다.',
    '큐에 넣는 순간 거리를 적어 방문 표시를 겸하면 같은 칸이 큐에 두 번 들어가지 않습니다.',
  ],
  demo: { input: [MAPS], label: 'maps = 예제 1 (5×5)' },
  workUnit: '칸을 밟은 횟수',
  approaches: [
    {
      id: 'game-map-bfs',
      name: '너비 우선 탐색 (BFS)',
      rank: 'BEST',
      timeComplexity: 'O(N × M)',
      spaceComplexity: 'O(N × M)',
      verdict: '가중치가 모두 1인 격자 최단 거리의 표준 풀이입니다.',
      pros: [
        '거리 1, 2, 3 순서로 퍼져 나가므로 도착 칸을 처음 꺼낸 순간의 거리가 최단 거리입니다.',
        '각 칸을 한 번만 큐에 넣어 100×100 맵도 1만 번 안팎의 연산으로 끝납니다.',
        '재귀 없이 큐로 돌아가 재귀 한도를 걱정할 필요가 없습니다.',
      ],
      cons: ['큐와 거리 배열에 맵 크기만큼 메모리가 필요합니다.'],
      whyThisRank:
        '가중치 없는 그래프의 최단 경로는 BFS가 가장 단순하고 빠릅니다. 도착 칸을 꺼내는 즉시 반환하므로 필요 없는 칸은 보지 않습니다.',
      code: BFS,
      visualize: () => layered(BFS_SCRIPT),
    },
    {
      id: 'game-map-dijkstra',
      name: '다익스트라 (우선순위 큐)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(NM log NM)',
      spaceComplexity: 'O(N × M)',
      verdict: '정답은 나오지만 가중치가 모두 1이라 힙 연산만큼 손해입니다.',
      pros: [
        '칸마다 이동 비용이 다른 문제로 그대로 확장할 수 있습니다.',
        '힙에서 꺼낸 순간의 비용이 최단 거리라는 성질은 BFS와 같습니다.',
      ],
      cons: [
        '넣고 꺼낼 때마다 O(log N)의 힙 정렬 비용이 붙습니다.',
        'JavaScript에는 내장 힙이 없어 직접 구현해야 하므로 코드가 세 배 가까이 길어집니다.',
      ],
      whyThisRank:
        '가중치가 모두 같으면 일반 큐가 이미 거리 순서로 정렬되어 있습니다. 힙은 이 문제에서 필요 이상의 도구입니다.',
      code: DIJKSTRA,
      visualize: () => layered(DIJKSTRA_SCRIPT),
    },
    {
      id: 'game-map-dfs',
      name: '깊이 우선 탐색 (백트래킹)',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: '지수 시간',
      spaceComplexity: 'O(N × M) 재귀 스택',
      verdict: '작은 맵은 통과하지만 효율성 테스트에서 시간 초과가 납니다.',
      pros: ['재귀로 짧게 쓸 수 있습니다.'],
      cons: [
        '한 경로를 끝까지 간 뒤 되돌아와 다른 경로를 찾으므로, 모든 경로를 다 봐야 최솟값을 확정할 수 있습니다.',
        '맵이 커지면 가능한 경로 수가 폭발적으로 늘어 시간 초과가 납니다.',
        '경로가 길어지면 Python 기본 재귀 한도(1,000)를 넘겨 RecursionError가 날 수 있습니다.',
      ],
      whyThisRank:
        '최단 거리는 "처음 도착한 순간"을 이용해야 빨리 끝납니다. DFS는 깊이 먼저 들어가므로 처음 도착한 경로가 가장 짧다는 보장이 없습니다.',
      code: DFS,
      visualize: backtrack,
    },
  ],
  checks: {
    cases: [
      { args: [MAPS], expected: 11 },
      { args: [[[1, 0, 1, 1, 1], [1, 0, 1, 0, 1], [1, 0, 1, 1, 1], [1, 1, 1, 0, 0], [0, 0, 0, 0, 1]]], expected: -1 },
      { args: [[[1, 1], [1, 1]]], expected: 3 },
      { args: [[[1, 0], [1, 1]]], expected: 3 },
      { args: [[[1, 1, 1, 1]]], expected: 4 },
    ],
    // n, m은 1~4(둘 다 1은 아님). 함정 DFS가 모든 길을 도는 시간을 짧게 두려고 4까지만 쓴다.
    // 칸마다 70% 확률로 길이고, 출발 칸과 도착 칸은 늘 길이다.
    random: (rand) => {
      const size = () => 1 + Math.floor(rand() * 4);
      let [n, m] = [size(), size()];
      while (n === 1 && m === 1) [n, m] = [size(), size()];
      const maps = Array.from({ length: n }, (_, r) => Array.from({ length: m }, (_, c) =>
        (r === 0 && c === 0) || (r === n - 1 && c === m - 1) || rand() < 0.7 ? 1 : 0));
      return [maps];
    },
  },
};

export default problem;
