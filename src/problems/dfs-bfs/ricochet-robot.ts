// 리코쳇 로봇: 정석 BFS(멈춘 칸이 노드), 대안 다익스트라(힙), 함정 한 칸씩 걷는 BFS를 같은 판에서 움직인다.
// 장면은 위에 줄(큐·힙), 아래에 5×7 판이다. 장애물 D는 빗금, 로봇 R과 목표 G는 칸 위 작은 글, 칸 글은 거기까지 미끄러진 횟수다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { center, grid } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Point, Problem, Rect, Scene, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { fmt, josa, lines, together } from '../shared.ts';
import { fit } from './pacing.ts';

type Cell = [number, number];

// 시각화 입력: 원문 예제 1. 미끄러지면 정답은 7번이다.
// 한 칸씩 걷는 함정은 목표 칸을 지나가기만 해도 도착으로 쳐서 4를 낸다.
const BOARD = ['...D..R', '.D.G...', '....D.D', 'D....D.', '..D....'];
const N = BOARD.length;
const M = BOARD[0].length;
const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 상, 하, 좌, 우(세 풀이 코드와 같은 순서)

const key = ([r, c]: Cell) => `${r},${c}`;
const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
const inBoard = ([r, c]: Cell) => r >= 0 && r < N && c >= 0 && c < M;
const open = (c: Cell) => inBoard(c) && BOARD[c[0]][c[1]] !== 'D';
const cid = (c: Cell) => `cell:${key(c)}`;
const find = (ch: string): Cell => {
  const r = BOARD.findIndex((row) => row.includes(ch));
  return [r, BOARD[r].indexOf(ch)];
};
const [START, GOAL] = [find('R'), find('G')];
// 미끄러진다: 장애물이나 판 끝 바로 앞까지 같은 방향으로 간다
const slide = (from: Cell, [dr, dc]: [number, number]): Cell => {
  let c = from;
  while (open([c[0] + dr, c[1] + dc])) c = [c[0] + dr, c[1] + dc];
  return c;
};

// 정석의 답(멈춘 칸을 노드로 한 BFS). 시각화 입력의 정답과 큐가 가장 길어지는 때를 구한다
const { TRUTH, MAX_QUEUE } = (() => {
  const dist = new Map([[key(START), 0]]);
  const queue = [START];
  let widest = 1;
  for (let head = 0; head < queue.length; head++) {
    const c = queue[head];
    if (same(c, GOAL)) return { TRUTH: dist.get(key(c))!, MAX_QUEUE: widest };
    for (const d of DIRS) {
      const n = slide(c, d);
      if (!dist.has(key(n))) {
        dist.set(key(n), dist.get(key(c))! + 1);
        queue.push(n);
      }
    }
    widest = Math.max(widest, queue.length - head - 1);
  }
  return { TRUTH: -1, MAX_QUEUE: widest };
})();

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const FIND_PY = `    n, m = len(board), len(board[0])
    for i in range(n):
        for j in range(m):
            if board[i][j] == 'R':
                start = (i, j)
            elif board[i][j] == 'G':
                goal = (i, j)
`;
const FIND_JS = `  const n = board.length;
  const m = board[0].length;
  let start, goal;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (board[i][j] === 'R') start = [i, j];
      else if (board[i][j] === 'G') goal = [i, j];
    }
  }
`;
const SLIDE_PY = `    def slide(x, y, dx, dy):  # 벽이나 장애물 바로 앞까지 미끄러집니다
        while 0 <= x + dx < n and 0 <= y + dy < m and board[x + dx][y + dy] != 'D':
            x, y = x + dx, y + dy
        return x, y
`;
const SLIDE_JS = `  const slide = (x, y, dx, dy) => { // 벽이나 장애물 바로 앞까지 미끄러집니다
    while (x + dx >= 0 && x + dx < n && y + dy >= 0 && y + dy < m && board[x + dx][y + dy] !== 'D') {
      x += dx;
      y += dy;
    }
    return [x, y];
  };
`;

const BFS = {
  python: `from collections import deque

def solution(board):
${FIND_PY}
${SLIDE_PY}
    dist = {start: 0}
    queue = deque([start])
    while queue:
        x, y = queue.popleft()
        if (x, y) == goal:
            return dist[(x, y)]  # 목표에서 멈춘 순간의 미끄러진 횟수
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
            nx, ny = slide(x, y, dx, dy)
            if (nx, ny) not in dist:
                dist[(nx, ny)] = dist[(x, y)] + 1
                queue.append((nx, ny))
    return -1`,
  javascript: `function solution(board) {
${FIND_JS}
${SLIDE_JS}
  const dist = Array.from({ length: n }, () => Array(m).fill(-1));
  dist[start[0]][start[1]] = 0;
  const queue = [start];
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x === goal[0] && y === goal[1]) return dist[x][y]; // 목표에서 멈춘 순간의 미끄러진 횟수
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
      const [nx, ny] = slide(x, y, dx, dy);
      if (dist[nx][ny] === -1) {
        dist[nx][ny] = dist[x][y] + 1;
        queue.push([nx, ny]);
      }
    }
  }
  return -1;
}`,
};
const BFS_AT = {
  find: lines(BFS, ["if board[i][j] == 'R'", "elif board[i][j] == 'G'"], ["if (board[i][j] === 'R')", "else if (board[i][j] === 'G')"]),
  start: lines(BFS, ['dist = {start: 0}', 'queue = deque([start])'], ['dist[start[0]][start[1]] = 0', 'const queue = [start]']),
  pop: lines(BFS, ['x, y = queue.popleft()'], ['const [x, y] = queue[head++]']),
  look: lines(BFS, ['for dx, dy in', 'nx, ny = slide(x, y, dx, dy)', 'if (nx, ny) not in dist'],
    ['for (const [dx, dy] of', 'const [nx, ny] = slide(x, y, dx, dy)', 'if (dist[nx][ny] === -1)']),
  mark: lines(BFS, ['for dx, dy in', 'nx, ny = slide(x, y, dx, dy)', 'dist[(nx, ny)] = dist[(x, y)] + 1'],
    ['for (const [dx, dy] of', 'const [nx, ny] = slide(x, y, dx, dy)', 'dist[nx][ny] = dist[x][y] + 1']),
  push: lines(BFS, ['queue.append((nx, ny))'], ['queue.push([nx, ny])']),
  next: lines(BFS, ['while queue:'], ['while (head < queue.length)']),
  goal: lines(BFS, ['if (x, y) == goal', 'return dist[(x, y)]'], ['if (x === goal[0] && y === goal[1])']),
};

const DIJKSTRA = {
  python: `import heapq

def solution(board):
${FIND_PY}
${SLIDE_PY}
    dist = {start: 0}
    heap = [(0, start[0], start[1])]  # (비용, x, y)
    while heap:
        cost, x, y = heapq.heappop(heap)
        if cost > dist[(x, y)]:
            continue  # 이미 더 짧게 온 적이 있는 칸
        if (x, y) == goal:
            return cost
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
            nx, ny = slide(x, y, dx, dy)
            if cost + 1 < dist.get((nx, ny), float('inf')):
                dist[(nx, ny)] = cost + 1
                heapq.heappush(heap, (cost + 1, nx, ny))
    return -1`,
  javascript: `function solution(board) {
${FIND_JS}
${SLIDE_JS}
  const dist = Array.from({ length: n }, () => Array(m).fill(Infinity));
  dist[start[0]][start[1]] = 0;
  const pq = [[0, start[0], start[1]]]; // [비용, x, y]를 담는 최소 힙

  // [비용, x, y]를 앞에서부터 비교합니다(Python의 튜플 비교와 같은 순서)
  const less = (a, b) => (a[0] - b[0] || a[1] - b[1] || a[2] - b[2]) < 0;
  const push = (item) => {
    pq.push(item);
    for (let i = pq.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (!less(pq[i], pq[p])) break;
      [pq[p], pq[i]] = [pq[i], pq[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = pq[0];
    const last = pq.pop();
    if (pq.length > 0) {
      pq[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1;
        const r = l + 1;
        let min = i;
        if (l < pq.length && less(pq[l], pq[min])) min = l;
        if (r < pq.length && less(pq[r], pq[min])) min = r;
        if (min === i) break;
        [pq[min], pq[i]] = [pq[i], pq[min]];
        i = min;
      }
    }
    return top;
  };

  while (pq.length > 0) {
    const [cost, x, y] = pop();
    if (cost > dist[x][y]) continue; // 이미 더 짧게 온 적이 있는 칸
    if (x === goal[0] && y === goal[1]) return cost;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
      const [nx, ny] = slide(x, y, dx, dy);
      if (cost + 1 < dist[nx][ny]) {
        dist[nx][ny] = cost + 1;
        push([cost + 1, nx, ny]);
      }
    }
  }
  return -1;
}`,
};
const DIJ_AT = {
  start: lines(DIJKSTRA, ['dist = {start: 0}', 'heap = [(0, start[0], start[1])]'], ['dist[start[0]][start[1]] = 0', 'const pq = [[0, start[0], start[1]]]']),
  pop: lines(DIJKSTRA, ['cost, x, y = heapq.heappop(heap)'], ['const [cost, x, y] = pop()']),
  look: lines(DIJKSTRA, ['for dx, dy in', 'nx, ny = slide(x, y, dx, dy)', "if cost + 1 < dist.get((nx, ny)"],
    ['for (const [dx, dy] of', 'const [nx, ny] = slide(x, y, dx, dy)', 'if (cost + 1 < dist[nx][ny])']),
  mark: lines(DIJKSTRA, ['for dx, dy in', 'nx, ny = slide(x, y, dx, dy)', 'dist[(nx, ny)] = cost + 1'],
    ['for (const [dx, dy] of', 'const [nx, ny] = slide(x, y, dx, dy)', 'dist[nx][ny] = cost + 1']),
  push: lines(DIJKSTRA, ['heapq.heappush(heap, (cost + 1, nx, ny))'], ['push([cost + 1, nx, ny])', 'for (let i = pq.length - 1; i > 0; )']),
  next: lines(DIJKSTRA, ['while heap:'], ['while (pq.length > 0)']),
  goal: lines(DIJKSTRA, ['if (x, y) == goal', 'return cost'], ['if (x === goal[0] && y === goal[1]) return cost']),
};

const PLAIN = {
  python: `# 주의: 오답이 나오는 풀이입니다 (미끄러지지 않고 한 칸씩 걷는다고 생각합니다)
from collections import deque

def solution(board):
${FIND_PY}
    dist = {start: 0}
    queue = deque([start])
    while queue:
        x, y = queue.popleft()
        if (x, y) == goal:
            return dist[(x, y)]
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy  # 한 칸만 움직입니다
            if 0 <= nx < n and 0 <= ny < m and board[nx][ny] != 'D' and (nx, ny) not in dist:
                dist[(nx, ny)] = dist[(x, y)] + 1
                queue.append((nx, ny))
    return -1`,
  javascript: `// 주의: 오답이 나오는 풀이입니다 (미끄러지지 않고 한 칸씩 걷는다고 생각합니다)
function solution(board) {
${FIND_JS}
  const dist = Array.from({ length: n }, () => Array(m).fill(-1));
  dist[start[0]][start[1]] = 0;
  const queue = [start];
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x === goal[0] && y === goal[1]) return dist[x][y];
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
      const nx = x + dx; // 한 칸만 움직입니다
      const ny = y + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < m && board[nx][ny] !== 'D' && dist[nx][ny] === -1) {
        dist[nx][ny] = dist[x][y] + 1;
        queue.push([nx, ny]);
      }
    }
  }
  return -1;
}`,
};
const PLAIN_AT = {
  start: lines(PLAIN, ['dist = {start: 0}', 'queue = deque([start])'], ['dist[start[0]][start[1]] = 0', 'const queue = [start]']),
  pop: lines(PLAIN, ['x, y = queue.popleft()'], ['const [x, y] = queue[head++]']),
  look: lines(PLAIN, ['for dx, dy in', "if 0 <= nx < n and 0 <= ny < m and board[nx][ny] != 'D'"],
    ['for (const [dx, dy] of', "if (nx >= 0 && nx < n && ny >= 0 && ny < m && board[nx][ny] !== 'D'"]),
  mark: lines(PLAIN, ['for dx, dy in', "if 0 <= nx < n and 0 <= ny < m and board[nx][ny] != 'D'", 'dist[(nx, ny)] = dist[(x, y)] + 1'],
    ['for (const [dx, dy] of', "if (nx >= 0 && nx < n && ny >= 0 && ny < m && board[nx][ny] !== 'D'", 'dist[nx][ny] = dist[x][y] + 1']),
  push: lines(PLAIN, ['queue.append((nx, ny))'], ['queue.push([nx, ny])']),
  next: lines(PLAIN, ['while queue:'], ['while (head < queue.length)']),
  goal: lines(PLAIN, ['if (x, y) == goal', 'return dist[(x, y)]'], ['if (x === goal[0] && y === goal[1]) return dist[x][y]']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로 0~454, 세로: 줄 0~40, 판 칸 y 58~360(54px 칸, 간격 8), 함정이면 아래에 내 답·정답 표시 372~402.
const W = 454;
const cellRect = grid({ x: 14, y: 58, rows: N, cols: M, cell: 54, gap: 8 });
const rectOf = (c: Cell): Rect => cellRect(c[0], c[1]);
const mid = (c: Cell): Point => center(rectOf(c));
const LANE: LaneOptions = { id: 'lane', x: 40, y: 5, slotW: 56, slotH: 30, gap: 6, max: Math.max(6, MAX_QUEUE) };
const TAGS: Record<string, string> = { R: '로봇', G: '목표' };
const VERDICT_LABEL: Record<string, string> = { wall: '장애물', seen: '방문함', new: '새 칸' };

// 세 풀이가 같이 쓰는 장면: 줄 이름표와 바탕, 판(장애물은 빗금), 지나온 길을 그을 선. 함정은 아래에 표시 줄이 더 있다
function board(lane: '큐' | '힙', extraRow: boolean): Scene {
  const height = extraRow ? 410 : 372;
  const full: Rect = { x: 0, y: 0, w: W, h: height }; // line은 rect 대신 points로 그린다
  const items: Item[] = [
    { id: 'lane:label', kind: 'text', rect: { x: 0, y: 0, w: 34, h: 40 }, text: lane },
    { id: 'lane:bg', kind: 'zone', rect: { x: 34, y: 0, w: W - 34, h: 40 } },
  ];
  BOARD.forEach((row, r) => [...row].forEach((ch, c) => {
    items.push({ id: cid([r, c]), kind: 'cell', rect: rectOf([r, c]), tone: ch === 'D' ? 'wall' : 'plain', ...(TAGS[ch] ? { tag: TAGS[ch] } : {}) });
  }));
  items.push({ id: 'path', kind: 'line', rect: full, tone: 'path', points: [] });
  return { width: W, height, items };
}

const paint = (c: Cell, patch: ItemPatch): Extract<Action, { type: 'set' }> => ({ type: 'set', id: cid(c), patch });
const token = (c: Cell) => ({ id: `tok:${key(c)}`, text: fmt(c) });
interface Probe { to: Cell; verdict: Verdict }

/* ------------------------------------------------------------------ */
/* 정석 BFS · 대안 다익스트라 · 함정 한 칸씩 걷는 BFS: 꺼내기 → 미끄러지기(살피기) → 넣기 */
/* ------------------------------------------------------------------ */

type Mode = 'stop' | 'heap' | 'plain';

function viz(mode: Mode): Visualization {
  const heap = mode === 'heap';
  const plain = mode === 'plain';
  const AT = plain ? PLAIN_AT : heap ? { ...DIJ_AT } : BFS_AT;
  const rec = new StepRecorder(board(heap ? '힙' : '큐', plain));
  const lane = new Lane(rec, LANE);
  const dist = new Map<string, number>([[key(START), 0]]);
  const prev = new Map<string, Cell>();
  const waiting: Cell[] = [START]; // 큐(힙)에 든 칸, 꺼낼 차례대로
  let pops = 0;
  let sorts = 1; // 힙 정렬 횟수: 넣을 때와 꺼낼 때마다 1번
  let last: Cell | undefined; // 바로 전에 꺼낸 칸
  const d = (c: Cell) => dist.get(key(c))!;
  const nameOf = heap ? 'cost' : 'dist';
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = (cur?: Cell, news: Cell[] = []) => ({
    work: pops,
    ...(heap ? { workNote: `힙 정렬 ${sorts}번` } : {}),
    variables: {
      '(x, y)': cur ? fmt(cur) : '-',
      [nameOf]: cur ? d(cur) : '-',
      '새로 넣은 칸': news.length ? news.map(fmt).join(', ') : '없음',
      [heap ? 'heap' : 'queue']: `[${waiting.map((c) => (heap ? `(${d(c)}, ${c[0]}, ${c[1]})` : fmt(c))).join(', ')}]`,
    },
  });
  // 꺼내기: 줄 맨 앞 토큰이 칸으로 날아가 그 칸이 지금 칸이 되고, 바로 전 칸은 방문을 마친다
  const takeOut = (cur: Cell) => {
    lane.shift(cid(cur));
    rec.do(...together([paint(cur, { tone: 'current' }), ...(last ? [paint(last, { tone: 'visited' })] : [])], true));
  };

  rec.step({ title: `로봇 ${fmt(START)}을 ${heap ? '힙' : '큐'}에 넣기`, codeHighlights: AT.start, ...meta(undefined, [START]) });
  rec.phase('시작', `로봇이 있는 ${fmt(START)}에 ${heap ? '비용' : '거리'} 0을 적고 ${heap ? '힙' : '큐'}에 넣습니다.`);
  rec.do({ ...paint(START, { tone: 'queued', text: '0' }), pop: true });
  lane.push(token(START), cid(START));

  while (waiting.length) {
    const cur = waiting.shift()!;
    pops++;
    if (heap) sorts++;

    if (same(cur, GOAL)) {
      const path = [cur];
      for (let c = prev.get(key(cur)); c; c = prev.get(key(c))) path.unshift(c);
      rec.step({ title: `목표 칸 ${fmt(cur)} 꺼내기 — ${plain ? '거리' : '미끄러진 횟수'} ${d(cur)}`, codeHighlights: AT.goal, ...meta(cur), answer: d(cur), isKeyframe: true });
      rec.phase('꺼내기', `${heap ? '힙에서 비용이 가장 작은' : '큐 맨 앞에서'} 목표 칸 ${josa(fmt(cur), '을', '를')} 꺼냈습니다.`, AT.pop);
      takeOut(cur);
      if (plain) {
        rec.phase('오답 확인', `한 칸씩 걸어 목표 칸을 지나가기만 해도 도착으로 쳐서 ${josa(d(cur), '이', '가')} 나왔습니다. 로봇은 미끄러져 멈추는 칸만 갈 수 있어서 정답은 ${TRUTH}입니다.`);
        rec.do(...together([...path.map((c) => paint(c, { tone: 'bad' })), { type: 'trace', id: 'path', points: path.map(mid) },
          { type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 0, y: 372, w: 110, h: 30 }, tone: 'bad', text: `내 답 ${d(cur)}` } },
          { type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 118, y: 372, w: 110, h: 30 }, tone: 'good', text: `정답 ${TRUTH}` } }]));
      } else {
        rec.phase('도착', `목표 칸에서 멈춘 순간의 ${heap ? '비용' : '횟수'} ${josa(d(cur), '이', '가')} 최소 미끄러진 횟수입니다. 멈춘 칸을 ${pops}번 꺼냈습니다.`);
        rec.do(...together(path.map((c) => paint(c, { tone: 'path' }))));
        rec.do({ type: 'trace', id: 'path', points: path.map(mid) });
      }
      break;
    }

    // 미끄러지기(한 칸씩 걷는 함정은 이웃 칸 살피기): 방향마다 멈추는 칸의 판정. 제자리에 멈추는(못 움직이는) 방향은 건너뛴다
    const probes: Probe[] = DIRS.flatMap((dir): Probe[] => {
      const to: Cell = plain ? [cur[0] + dir[0], cur[1] + dir[1]] : slide(cur, dir);
      if (plain ? !inBoard(to) : same(to, cur)) return [];
      return [{ to, verdict: plain && !open(to) ? 'wall' : dist.has(key(to)) ? 'seen' : 'new' }];
    });
    const news = probes.filter((p) => p.verdict === 'new').map((p) => p.to);
    for (const to of news) {
      dist.set(key(to), d(cur) + 1);
      prev.set(key(to), cur);
      waiting.push(to);
    }
    if (heap) {
      sorts += news.length;
      waiting.sort((a, b) => d(a) - d(b) || a[0] - b[0] || a[1] - b[1]); // (비용, x, y) 순: 두 코드의 힙과 같다
    }
    rec.step({
      title: news.length ? `${fmt(cur)} 꺼내고 ${news.length}칸 넣기` : `${fmt(cur)} 꺼내기 — 넣을 칸 없음`,
      codeHighlights: news.length ? AT.push : AT.next,
      ...meta(cur, news),
    });
    rec.phase('꺼내기', `${heap ? '힙에서 비용이 가장 작은' : '큐 맨 앞에서'} ${josa(fmt(cur), '을', '를')} 꺼냅니다. ${plain ? '이 칸까지의 거리는' : heap ? '이 칸까지의 비용은' : '이 칸까지 미끄러진 횟수는'} ${d(cur)}입니다.`, AT.pop);
    takeOut(cur);
    rec.phase(plain ? '살피기' : '미끄러지기', plain
      ? `상하좌우 한 칸씩 확인합니다. 장애물이나 이미 방문한 칸은 건너뛰고${news.length ? `, 새 칸에는 거리 ${josa(d(cur) + 1, '을', '를')} 적습니다.` : ' 넘어갑니다.'}`
      : `상하좌우로 미끄러져 멈추는 칸을 봅니다. 못 움직이거나 이미 방문한 칸은 건너뛰고${news.length ? `, 새로 멈춘 칸에는 ${heap ? '비용' : '횟수'} ${josa(d(cur) + 1, '을', '를')} 적습니다.` : ' 넘어갑니다.'}`,
    news.length ? AT.mark : AT.look);
    rec.do({ type: 'focus', ids: [cid(cur), ...probes.map((p) => cid(p.to))] });
    for (const p of probes) {
      rec.do({ type: 'arrow', from: cid(cur), to: cid(p.to), verdict: p.verdict, label: VERDICT_LABEL[p.verdict] });
      if (p.verdict === 'new') rec.do({ ...paint(p.to, { tone: 'queued', text: String(d(p.to)) }), pop: true, together: true });
    }
    rec.phase(heap ? '넣고 정렬' : '넣기', news.length
      ? `새로 찾은 ${josa(news.map(fmt).join(', '), '을', '를')} ${heap ? '힙에 넣고 비용순으로 정렬합니다. 순서는 큐와 같습니다.' : '큐 뒤에 넣습니다.'}`
      : '새로 넣을 칸이 없어 그대로 넘어갑니다.', news.length ? AT.push : AT.next);
    const clear: Action[] = [{ type: 'unfocus' }, { type: 'clearMarks' }];
    if (news.length) news.forEach((to, i) => {
      lane.push(token(to), cid(to));
      if (!i) rec.do(...together(clear, true)); // 흐림과 화살표 걷기는 첫 토큰이 날아가는 것과 같이
    });
    else rec.do(...together(clear));
    if (heap && news.length) lane.reorder(waiting.map((c) => token(c).id));
    last = cur;
  }
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'ricochet-robot',
  title: '리코쳇 로봇',
  level: 2,
  category: 'dfs-bfs',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/169199',
  description: {
    summary:
      '격자판에 빈칸(.), 장애물(D), 로봇(R), 목표(G)가 있습니다. 로봇은 상하좌우 중 한 방향을 골라 장애물이나 판의 끝에 부딪힐 때까지 쭉 미끄러지고, 그곳에서 멈춥니다. 로봇이 목표 칸에서 멈추려면 최소 몇 번 미끄러져야 하는지 구하고, 멈출 수 없으면 -1을 돌려줍니다.',
    rules: [
      'board의 가로·세로 길이는 3 이상 100 이하',
      '글자는 . (빈칸), D (장애물), R (로봇 처음 위치), G (목표 위치)',
      'R과 G는 각각 한 번씩만 나옴',
      '로봇은 한 번 미끄러지기 시작하면 장애물이나 판 끝까지 멈추지 못함',
    ],
    examples: [
      { input: 'board = ["...D..R", ".D.G...", "....D.D", "D....D.", "..D...."]', output: '7' },
      { input: 'board = [".D.R", "....", ".G..", "...D"]', output: '-1' },
    ],
  },
  keyIntuitions: [
    '한 번 움직이면 끝까지 미끄러지므로 "멈추는 칸"만 노드로 보고, 한 번 미끄러지는 것을 간선 하나(비용 1)로 봅니다. 그러면 가중치가 모두 1인 그래프의 최단 거리라 BFS로 풉니다.',
    '지나가기만 하는 칸은 노드가 아닙니다. 목표 칸을 지나가도 멈추지 못하면 도착이 아니고, 목표 칸에서 멈추는 순간만 정답입니다.',
    '한 칸씩 걷는 BFS는 미끄러지는 규칙을 무시해서 목표를 지나가기만 해도 도착으로 칩니다. 이동 한 번의 뜻이 "한 칸"이 아니라 "한 방향으로 끝까지"라는 점을 놓치면 안 됩니다.',
  ],
  demo: { input: [BOARD], label: 'board = 예제 1 (5×7)' },
  workUnit: '칸을 꺼낸 횟수',
  approaches: [
    {
      id: 'ricochet-bfs',
      name: '너비 우선 탐색 (멈춘 칸을 노드로)',
      rank: 'BEST',
      timeComplexity: 'O(N × M × (N + M))',
      spaceComplexity: 'O(N × M)',
      verdict: '미끄러지는 한 번을 간선 하나로 보고, 멈추는 칸을 BFS로 퍼뜨리는 표준 풀이입니다.',
      pros: [
        '미끄러지는 규칙을 slide 함수 하나로 묶어, 나머지는 평범한 BFS 틀 그대로입니다.',
        '멈추는 칸을 한 번만 큐에 넣고, 목표에서 멈춘 칸을 처음 꺼낸 순간이 최소 횟수입니다.',
        '모든 칸을 노드로 쓰지 않고 멈추는 칸만 보아 훨씬 적게 확인합니다.',
      ],
      cons: ['칸을 꺼낼 때마다 네 방향으로 끝까지 미끄러져 보므로 한 노드의 비용이 판 크기에 비례합니다.'],
      whyThisRank:
        '이동 한 번의 비용이 모두 같은 최단 거리라 BFS가 가장 단순합니다. 달라진 것은 한 칸이 아니라 한 방향 끝까지 움직이는 간선을 만드는 slide 하나뿐입니다.',
      code: BFS,
      visualize: () => viz('stop'),
    },
    {
      id: 'ricochet-dijkstra',
      name: '다익스트라 (우선순위 큐)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × M × (N + M) + NM log NM)',
      spaceComplexity: 'O(N × M)',
      verdict: '정답은 나오지만 간선 비용이 모두 1이라 힙 연산만큼 손해입니다.',
      pros: ['미끄러진 거리에 따라 비용이 달라지는 문제로 그대로 확장할 수 있습니다.', '힙에서 꺼낸 순간의 비용이 최단 거리라는 성질은 BFS와 같습니다.'],
      cons: [
        '넣고 꺼낼 때마다 힙 정렬 비용이 붙습니다. 시각화 입력에서는 힙 정렬이 정석 큐보다 수십 번 많습니다.',
        'JavaScript에는 내장 힙이 없어 직접 구현해야 해서 코드가 훨씬 길어집니다.',
      ],
      whyThisRank:
        '간선 비용이 모두 같으면 일반 큐가 이미 거리 순서입니다. 힙은 이 문제에 필요 이상의 도구라 정석인 BFS보다 한 단계 낮습니다.',
      code: DIJKSTRA,
      visualize: () => viz('heap'),
    },
    {
      id: 'ricochet-plain',
      name: '한 칸씩 걷는 BFS',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N × M)',
      spaceComplexity: 'O(N × M)',
      verdict: '평범한 격자 BFS 틀을 그대로 쓰지만 미끄러지는 규칙을 무시해 오답이 나옵니다.',
      pros: ['최단 거리 BFS 틀을 그대로 쓰는 가장 짧은 코드입니다.'],
      cons: [
        '로봇은 한 방향으로 끝까지 미끄러지는데 한 칸씩 걸어서 목표 칸을 지나가기만 해도 도착으로 칩니다. 시각화 입력에서는 4칸 만에 닿았다고 하지만 정답은 7번입니다.',
        '목표 칸이 막다른 곳이 아니면 멈출 수 없는 경우도 많아서, -1이어야 할 판에서도 숫자가 나옵니다.',
      ],
      whyThisRank:
        '이 문제의 이동은 "한 칸"이 아니라 "한 방향 끝까지"입니다. 이동의 뜻을 바꾸지 않고 BFS 틀만 쓰면 목표를 지나치는 것도 도착이 되어 틀립니다.',
      code: PLAIN,
      visualize: () => viz('plain'),
    },
  ],
  checks: {
    cases: [
      { args: [['...D..R', '.D.G...', '....D.D', 'D....D.', '..D....']], expected: 7 },
      { args: [['.D.R', '....', '.G..', '...D']], expected: -1 },
      { args: [['RGD', '...', '...']], expected: 1 },
      { args: [['R..', '.G.', '...']], expected: -1 },
      { args: [['R.D', '...', '..G']], expected: 2 },
      { args: [BOARD], expected: TRUTH },
    ],
    // 세로 3~6칸, 가로 3~6칸, 칸마다 25% 확률로 장애물(D), R과 G는 서로 다른 빈칸에 하나씩
    random: (rand) => {
      const [n, m] = [3 + Math.floor(rand() * 4), 3 + Math.floor(rand() * 4)];
      const cells = Array.from({ length: n * m }, (_, k) => k);
      const grid2 = Array.from({ length: n }, () => Array.from({ length: m }, (): string => (rand() < 0.25 ? 'D' : '.')));
      for (const ch of ['R', 'G']) {
        const k = cells.splice(Math.floor(rand() * cells.length), 1)[0];
        grid2[Math.floor(k / m)][k % m] = ch;
      }
      return [grid2.map((row) => row.join(''))];
    },
  },
};

export default problem;
