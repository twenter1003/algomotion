// 미로 탈출: 정석 BFS 두 번(시작 → 레버 → 출구), 대안 레버에서 한 번만 BFS, 함정 출구를 벽으로 막은 BFS를 같은 미로에서 움직인다.
// 장면은 위에 큐 줄, 가운데에 5×5 미로(칸 글은 BFS가 적은 거리), 아래에 구간별 거리 표시다. 시작 S, 레버 L, 출구 E는 칸 위 작은 글자로 표시한다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { center, grid } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Language, Point, Problem, Rect, Scene, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { fmt, josa, lines, together } from '../shared.ts';
import { fit } from './pacing.ts';

type Cell = [number, number];

// 시각화 입력. 출구가 시작 칸 가까이에 있지만 레버는 출구 앞을 지나야 닿는 곳에 있다.
// 출구를 벽으로 막는 함정은 레버로 가는 하나뿐인 길이 끊겨 -1을 내고, 정답은 9 + 6 = 15다.
const MAPS = ['OOOXL', 'OXXOO', 'OXOOX', 'XOOXS', 'OXEOO'];
const N = MAPS.length;
const M = MAPS[0].length;
const DIRS: Cell[] = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 상, 하, 좌, 우(세 풀이 코드와 같은 순서)

const key = ([r, c]: Cell) => `${r},${c}`;
const same = (a: Cell, b: Cell) => key(a) === key(b);
const inBoard = ([r, c]: Cell) => r >= 0 && r < N && c >= 0 && c < M;
const charAt = ([r, c]: Cell) => MAPS[r][c];
const around = (c: Cell): Cell[] => DIRS.map(([dr, dc]): Cell => [c[0] + dr, c[1] + dc]).filter(inBoard);
const cid = (c: Cell) => `cell:${key(c)}`;
const find = (ch: string): Cell => {
  const r = MAPS.findIndex((row) => row.includes(ch));
  return [r, MAPS[r].indexOf(ch)];
};
const [START, LEVER, DOOR] = [find('S'), find('L'), find('E')];
const TAG: Record<string, string> = { S: '시작', L: '레버', E: '출구' };

// 두 칸 사이 가장 짧은 거리(출구를 막을지 정한다). 못 가면 -1. 시각화 입력의 정답을 구하는 데 쓴다
function shortest(from: Cell, to: Cell, blockDoor = false): number {
  const dist = new Map([[key(from), 0]]);
  const queue = [from];
  for (let head = 0; head < queue.length; head++) {
    const c = queue[head];
    if (same(c, to)) return dist.get(key(c))!;
    for (const n of around(c)) {
      if (charAt(n) === 'X' || (blockDoor && charAt(n) === 'E') || dist.has(key(n))) continue;
      dist.set(key(n), dist.get(key(c))! + 1);
      queue.push(n);
    }
  }
  return -1;
}
const LEG1 = shortest(START, LEVER);
const LEG2 = shortest(LEVER, DOOR);
const TRUTH = LEG1 + LEG2;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const FIND_PY = `    n, m = len(maps), len(maps[0])
    for i in range(n):
        for j in range(m):
            if maps[i][j] == 'S':
                start = (i, j)
            elif maps[i][j] == 'L':
                lever = (i, j)
            elif maps[i][j] == 'E':
                door = (i, j)
`;
const FIND_JS = `  const n = maps.length;
  const m = maps[0].length;
  let start, lever, door;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (maps[i][j] === 'S') start = [i, j];
      else if (maps[i][j] === 'L') lever = [i, j];
      else if (maps[i][j] === 'E') door = [i, j];
    }
  }
`;

const BEST = {
  python: `from collections import deque

def solution(maps):
${FIND_PY}
    def bfs(src, dst):  # src에서 dst까지 가는 가장 짧은 거리, 못 가면 -1
        dist = [[-1] * m for _ in range(n)]
        dist[src[0]][src[1]] = 0
        queue = deque([src])
        while queue:
            x, y = queue.popleft()
            if (x, y) == dst:
                return dist[x][y]
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                nx, ny = x + dx, y + dy
                if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and dist[nx][ny] == -1:
                    dist[nx][ny] = dist[x][y] + 1
                    queue.append((nx, ny))
        return -1

    a = bfs(start, lever)  # 시작 → 레버
    if a == -1:
        return -1
    b = bfs(lever, door)  # 레버 → 출구 (출구는 레버를 당기기 전에도 지나갈 수 있습니다)
    return a + b if b != -1 else -1`,
  javascript: `function solution(maps) {
${FIND_JS}
  const bfs = (src, dst) => { // src에서 dst까지 가는 가장 짧은 거리, 못 가면 -1
    const dist = Array.from({ length: n }, () => Array(m).fill(-1));
    dist[src[0]][src[1]] = 0;
    const queue = [src];
    let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
    while (head < queue.length) {
      const [x, y] = queue[head++];
      if (x === dst[0] && y === dst[1]) return dist[x][y];
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && dist[nx][ny] === -1) {
          dist[nx][ny] = dist[x][y] + 1;
          queue.push([nx, ny]);
        }
      }
    }
    return -1;
  };

  const a = bfs(start, lever); // 시작 → 레버
  if (a === -1) return -1;
  const b = bfs(lever, door); // 레버 → 출구 (출구는 레버를 당기기 전에도 지나갈 수 있습니다)
  return b === -1 ? -1 : a + b;
}`,
};
const BEST_AT = {
  find: lines(BEST, ["if maps[i][j] == 'S'", "elif maps[i][j] == 'L'", "elif maps[i][j] == 'E'"],
    ["if (maps[i][j] === 'S')", "else if (maps[i][j] === 'L')", "else if (maps[i][j] === 'E')"]),
  first: lines(BEST, ['a = bfs(start, lever)', 'dist = [[-1] * m', 'dist[src[0]][src[1]] = 0', 'queue = deque([src])'],
    ['const a = bfs(start, lever)', 'const dist = Array.from', 'dist[src[0]][src[1]] = 0', 'const queue = [src]']),
  second: lines(BEST, ['b = bfs(lever, door)', 'dist = [[-1] * m', 'dist[src[0]][src[1]] = 0', 'queue = deque([src])'],
    ['const b = bfs(lever, door)', 'const dist = Array.from', 'dist[src[0]][src[1]] = 0', 'const queue = [src]']),
  pop: lines(BEST, ['x, y = queue.popleft()'], ['const [x, y] = queue[head++]']),
  look: lines(BEST, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m'], ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m']),
  mark: lines(BEST, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m', 'dist[nx][ny] = dist[x][y] + 1'],
    ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m', 'dist[nx][ny] = dist[x][y] + 1']),
  push: lines(BEST, ['queue.append((nx, ny))'], ['queue.push([nx, ny])']),
  next: lines(BEST, ['while queue:'], ['while (head < queue.length)']),
  goal: lines(BEST, ['if (x, y) == dst', 'return dist[x][y]'], ['if (x === dst[0] && y === dst[1])']),
  firstDone: lines(BEST, ['if (x, y) == dst', 'return dist[x][y]', 'a = bfs(start, lever)'], ['if (x === dst[0] && y === dst[1])', 'const a = bfs(start, lever)']),
  answer: lines(BEST, ['return a + b if b != -1 else -1'], ['return b === -1 ? -1 : a + b']),
};

const ALL = {
  python: `from collections import deque

def solution(maps):
${FIND_PY}
    # 이동은 왔던 길로 되돌아갈 수 있으니, 레버에서 한 번만 BFS를 해도
    # 레버 → 출구 거리와 레버 → 시작 거리(= 시작 → 레버 거리)를 한꺼번에 얻습니다
    dist = [[-1] * m for _ in range(n)]
    dist[lever[0]][lever[1]] = 0
    queue = deque([lever])
    while queue:
        x, y = queue.popleft()
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and dist[nx][ny] == -1:
                dist[nx][ny] = dist[x][y] + 1
                queue.append((nx, ny))

    a = dist[start[0]][start[1]]
    b = dist[door[0]][door[1]]
    return a + b if a != -1 and b != -1 else -1`,
  javascript: `function solution(maps) {
${FIND_JS}
  // 이동은 왔던 길로 되돌아갈 수 있으니, 레버에서 한 번만 BFS를 해도
  // 레버 → 출구 거리와 레버 → 시작 거리(= 시작 → 레버 거리)를 한꺼번에 얻습니다
  const dist = Array.from({ length: n }, () => Array(m).fill(-1));
  dist[lever[0]][lever[1]] = 0;
  const queue = [lever];
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && dist[nx][ny] === -1) {
        dist[nx][ny] = dist[x][y] + 1;
        queue.push([nx, ny]);
      }
    }
  }

  const a = dist[start[0]][start[1]];
  const b = dist[door[0]][door[1]];
  return a !== -1 && b !== -1 ? a + b : -1;
}`,
};
const ALL_AT = {
  find: lines(ALL, ["if maps[i][j] == 'S'", "elif maps[i][j] == 'L'", "elif maps[i][j] == 'E'"],
    ["if (maps[i][j] === 'S')", "else if (maps[i][j] === 'L')", "else if (maps[i][j] === 'E')"]),
  start: lines(ALL, ['dist = [[-1] * m', 'dist[lever[0]][lever[1]] = 0', 'queue = deque([lever])'],
    ['const dist = Array.from', 'dist[lever[0]][lever[1]] = 0', 'const queue = [lever]']),
  pop: lines(ALL, ['x, y = queue.popleft()'], ['const [x, y] = queue[head++]']),
  look: lines(ALL, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m'], ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m']),
  mark: lines(ALL, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m', 'dist[nx][ny] = dist[x][y] + 1'],
    ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m', 'dist[nx][ny] = dist[x][y] + 1']),
  push: lines(ALL, ['queue.append((nx, ny))'], ['queue.push([nx, ny])']),
  next: lines(ALL, ['while queue:'], ['while (head < queue.length)']),
  answer: lines(ALL, ['a = dist[start[0]][start[1]]', 'b = dist[door[0]][door[1]]', 'return a + b if a != -1'],
    ['const a = dist[start[0]][start[1]]', 'const b = dist[door[0]][door[1]]', 'return a !== -1 && b !== -1']),
};

const BLOCK = {
  python: `# 주의: 오답이 나오는 풀이입니다 (레버를 당기기 전에는 출구를 벽처럼 막아 둡니다)
from collections import deque

def solution(maps):
${FIND_PY}
    def bfs(src, dst, door_open):  # src에서 dst까지 가는 가장 짧은 거리, 못 가면 -1
        dist = [[-1] * m for _ in range(n)]
        dist[src[0]][src[1]] = 0
        queue = deque([src])
        while queue:
            x, y = queue.popleft()
            if (x, y) == dst:
                return dist[x][y]
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                nx, ny = x + dx, y + dy
                if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and dist[nx][ny] == -1:
                    if maps[nx][ny] == 'E' and not door_open:
                        continue  # 출구는 레버를 당겨야 열린다고 생각해 막아 버립니다
                    dist[nx][ny] = dist[x][y] + 1
                    queue.append((nx, ny))
        return -1

    a = bfs(start, lever, False)  # 시작 → 레버 (출구 막힘)
    if a == -1:
        return -1
    b = bfs(lever, door, True)  # 레버 → 출구
    return a + b if b != -1 else -1`,
  javascript: `// 주의: 오답이 나오는 풀이입니다 (레버를 당기기 전에는 출구를 벽처럼 막아 둡니다)
function solution(maps) {
${FIND_JS}
  const bfs = (src, dst, doorOpen) => { // src에서 dst까지 가는 가장 짧은 거리, 못 가면 -1
    const dist = Array.from({ length: n }, () => Array(m).fill(-1));
    dist[src[0]][src[1]] = 0;
    const queue = [src];
    let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
    while (head < queue.length) {
      const [x, y] = queue[head++];
      if (x === dst[0] && y === dst[1]) return dist[x][y];
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && dist[nx][ny] === -1) {
          if (maps[nx][ny] === 'E' && !doorOpen) continue; // 출구는 레버를 당겨야 열린다고 생각해 막아 버립니다
          dist[nx][ny] = dist[x][y] + 1;
          queue.push([nx, ny]);
        }
      }
    }
    return -1;
  };

  const a = bfs(start, lever, false); // 시작 → 레버 (출구 막힘)
  if (a === -1) return -1;
  const b = bfs(lever, door, true); // 레버 → 출구
  return b === -1 ? -1 : a + b;
}`,
};
const BLOCK_AT = {
  find: lines(BLOCK, ["if maps[i][j] == 'S'", "elif maps[i][j] == 'L'", "elif maps[i][j] == 'E'"],
    ["if (maps[i][j] === 'S')", "else if (maps[i][j] === 'L')", "else if (maps[i][j] === 'E')"]),
  first: lines(BLOCK, ['a = bfs(start, lever, False)', 'dist = [[-1] * m', 'dist[src[0]][src[1]] = 0', 'queue = deque([src])'],
    ['const a = bfs(start, lever, false)', 'const dist = Array.from', 'dist[src[0]][src[1]] = 0', 'const queue = [src]']),
  pop: lines(BLOCK, ['x, y = queue.popleft()'], ['const [x, y] = queue[head++]']),
  look: lines(BLOCK, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m'], ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m']),
  mark: lines(BLOCK, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m', 'dist[nx][ny] = dist[x][y] + 1'],
    ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m', 'dist[nx][ny] = dist[x][y] + 1']),
  block: lines(BLOCK, ["if maps[nx][ny] == 'E' and not door_open", 'continue'], ["if (maps[nx][ny] === 'E' && !doorOpen) continue"]),
  push: lines(BLOCK, ['queue.append((nx, ny))'], ['queue.push([nx, ny])']),
  next: lines(BLOCK, ['while queue:'], ['while (head < queue.length)']),
  fail: lines(BLOCK, ['return -1', 'if a == -1'], ['return -1;', 'if (a === -1) return -1']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로 0~330, 세로: 줄 0~40, 미로 칸 y 58~358(54px 칸, 간격 8), 아래 거리 표시 줄 372~402.
const W = 330;
const H = 410;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다
const LANE: LaneOptions = { id: 'lane', x: 40, y: 5, slotW: 64, slotH: 30, gap: 6, max: 4 };
const cellRect = grid({ x: 14, y: 58, rows: N, cols: M, cell: 54, gap: 8 });
const mid = (c: Cell): Point => center(cellRect(c[0], c[1]));
const slot = (k: number): Rect => ({ x: k * 108, y: 372, w: 100, h: 30 }); // 아래 표시 줄의 k번째 칸
const VERDICT_LABEL = { wall: '벽', door: '출구 막음', seen: '방문함', new: '새 칸' } as const;

// 세 풀이가 같이 쓰는 장면: 줄 이름표와 바탕, 미로(벽은 빗금, 시작·레버·출구는 작은 글), 지나온 길 선
function board(): Scene {
  const items: Item[] = [
    { id: 'lane:label', kind: 'text', rect: { x: 0, y: 0, w: 34, h: 40 }, text: '큐' },
    { id: 'lane:bg', kind: 'zone', rect: { x: 34, y: 0, w: W - 34, h: 40 } },
  ];
  MAPS.forEach((row, r) => [...row].forEach((ch, c) => {
    items.push({ id: cid([r, c]), kind: 'cell', rect: cellRect(r, c), tone: ch === 'X' ? 'wall' : 'plain', ...(TAG[ch] ? { tag: TAG[ch] } : {}) });
  }));
  items.push({ id: 'path', kind: 'line', rect: FULL, tone: 'path', points: [] });
  return { width: W, height: H, items };
}

const paint = (c: Cell, patch: ItemPatch): Extract<Action, { type: 'set' }> => ({ type: 'set', id: cid(c), patch });
const badge = (id: string, k: number, text: string, tone: 'plain' | 'good' | 'bad' = 'plain'): Action => ({ type: 'add', item: { id, kind: 'token', rect: slot(k), tone, text } });
type Probe = { to: Cell; verdict: 'wall' | 'door' | 'seen' | 'new' };
type Lines = Record<Language, number[]>;
interface At { pop: Lines; look: Lines; mark: Lines; push: Lines; next: Lines }

/* ------------------------------------------------------------------ */
/* 정석 BFS 두 번 · 대안 레버에서 BFS 한 번 · 함정 출구 막은 BFS: 모두 꺼내기 → 살피기 → 넣기 */
/* ------------------------------------------------------------------ */

type Kind = 'best' | 'alt' | 'trap';
interface Round { from: Cell; to?: Cell; blocked?: boolean; label: string; text: string; startAt: Lines; wipe?: boolean }

function viz(kind: Kind): Visualization {
  const AT: At = { best: BEST_AT, alt: ALL_AT, trap: BLOCK_AT }[kind];
  const rec = new StepRecorder(board());
  const lane = new Lane(rec, LANE);
  let pops = 0;
  let seq = 0;
  let a: number | '-' = '-';
  let b: number | '-' = '-';
  let dist = new Map<string, number>();
  let prev = new Map<string, Cell>();
  let waiting: Cell[] = [];
  let last: Cell | undefined; // 바로 전에 꺼낸 칸
  let route: Point[] = []; // 지나온 길 선: 첫 구간 뒤에 둘째 구간이 이어 붙는다
  const d = (c: Cell) => dist.get(key(c))!;
  const pathOf = (cur: Cell) => {
    const path = [cur];
    for (let c = prev.get(key(cur)); c; c = prev.get(key(c))) path.unshift(c);
    return path;
  };
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = (cur?: Cell, news: Cell[] = []) => ({
    work: pops,
    variables: {
      '(x, y)': cur ? fmt(cur) : '-',
      dist: cur ? d(cur) : '-',
      '새로 넣은 칸': news.length ? news.map(fmt).join(', ') : '없음',
      queue: `[${waiting.map(fmt).join(', ')}]`,
      a,
      b,
    },
  });
  const takeOut = (cur: Cell) => {
    lane.shift(cid(cur));
    rec.do(...together([paint(cur, { tone: 'current' }), ...(last ? [paint(last, { tone: 'visited' })] : [])], true));
  };

  // BFS 한 번: from에서 퍼져 나가 to를 꺼내는 순간 끝낸다(to가 없으면 큐가 빌 때까지). blocked면 출구 칸은 벽처럼 건너뛴다.
  // to를 꺼냈으면 그 칸까지의 거리, 아니면 -1
  const bfs = (o: Round): number => {
    dist = new Map([[key(o.from), 0]]);
    prev = new Map();
    waiting = [o.from];
    last = undefined;
    rec.step({ title: `${fmt(o.from)}에서 BFS 시작`, codeHighlights: o.startAt, ...meta(undefined, [o.from]) });
    rec.phase(o.label, o.text, o.startAt);
    // 두 번째 BFS는 방문 표시를 새로 만든다: 지난 칠과 글을 지운다(길 선은 남긴다)
    const wipe = !o.wipe ? [] : MAPS.flatMap((row, r) => [...row].flatMap((ch, c): Action[] => {
      const now = rec.get(cid([r, c]));
      return ch === 'X' || same([r, c], o.from) || (now.tone === 'plain' && !now.text) ? [] : [paint([r, c], { tone: 'plain', text: '' })];
    }));
    rec.do(...together([...wipe, { ...paint(o.from, { tone: 'queued', text: '0' }), pop: true }]));
    lane.push({ id: `tok:${key(o.from)}:${++seq}`, text: fmt(o.from) }, cid(o.from));

    while (waiting.length) {
      const cur = waiting.shift()!;
      pops++;
      if (o.to && same(cur, o.to)) {
        const path = pathOf(cur);
        const first = kind !== 'best' || same(o.to, LEVER);
        if (first) a = d(cur);
        else b = d(cur);
        const total = a !== '-' && b !== '-' ? a + b : undefined;
        rec.step({
          title: `${first ? '레버' : '출구'} ${fmt(cur)} 꺼내기 — 거리 ${d(cur)}`,
          codeHighlights: first ? BEST_AT.firstDone : BEST_AT.answer,
          ...meta(cur),
          ...(total === undefined ? {} : { answer: total, isKeyframe: true }),
        });
        rec.phase('꺼내기', `큐 맨 앞에서 ${first ? '레버' : '출구'} 칸 ${josa(fmt(cur), '을', '를')} 꺼냈습니다.`, BEST_AT.pop);
        takeOut(cur);
        rec.phase(first ? '레버 도착' : '출구 도착', first
          ? `시작에서 레버까지의 거리 ${josa(d(cur), '이', '가')} a에 담깁니다. 지나온 길을 분홍으로 표시합니다.`
          : `레버에서 출구까지의 거리 ${josa(d(cur), '이', '가')} b에 담깁니다. a + b = ${a} + ${b}이니 답은 ${total}입니다.`, BEST_AT.goal);
        // 길 선을 긋고(둘째 구간은 이어 붙여 긋는다), 길 칸을 분홍으로, 구간 거리 표시를 한꺼번에 낸다
        const leg = path.map(mid);
        route = first ? leg : [...route, ...leg.slice(1)];
        rec.do(first ? { type: 'trace', id: 'path', points: leg } : { type: 'set', id: 'path', patch: { points: route } },
          ...together([
            ...path.map((c) => paint(c, { tone: 'path' })),
            badge(first ? 'leg1' : 'leg2', first ? 0 : 1, first ? `S→L ${d(cur)}` : `L→E ${d(cur)}`),
            ...(total === undefined ? [] : [badge('sum', 2, `합 ${total}`, 'good')]),
          ], true));
        return d(cur);
      }
      const probes = around(cur).map((to): Probe => ({
        to,
        verdict: charAt(to) === 'X' ? 'wall' : o.blocked && charAt(to) === 'E' ? 'door' : dist.has(key(to)) ? 'seen' : 'new',
      }));
      const news = probes.filter((p) => p.verdict === 'new').map((p) => p.to);
      for (const to of news) {
        dist.set(key(to), d(cur) + 1);
        prev.set(key(to), cur);
        waiting.push(to);
      }
      const closed = probes.some((p) => p.verdict === 'door');
      rec.step({
        title: news.length ? `${fmt(cur)} 꺼내고 ${news.length}칸 넣기` : `${fmt(cur)} 꺼내기 — 넣을 칸 없음`,
        codeHighlights: news.length ? AT.push : AT.next,
        ...meta(cur, news),
      });
      rec.phase('꺼내기', `큐 맨 앞에서 ${josa(fmt(cur), '을', '를')} 꺼냅니다. 이 칸까지의 거리는 ${d(cur)}입니다.${
        kind === 'best' && same(cur, DOOR) ? ' 출구 칸이어도 레버 전에 지날 수 있어 그냥 지납니다.' : ''}`, AT.pop);
      takeOut(cur);
      rec.phase('살피기', closed
        ? '상하좌우 칸을 하나씩 확인합니다. 출구는 레버를 당기기 전이라 막힌 곳으로 보고 건너뜁니다.'
        : `상하좌우 칸을 하나씩 확인합니다. 벽이나 이미 방문한 칸은 건너뛰고${news.length ? `, 새 칸에는 거리 ${josa(d(cur) + 1, '을', '를')} 적습니다.` : ' 넘어갑니다.'}`,
      closed ? BLOCK_AT.block : news.length ? AT.mark : AT.look);
      rec.do({ type: 'focus', ids: [cid(cur), ...probes.map((p) => cid(p.to))] });
      for (const p of probes) {
        rec.do({ type: 'arrow', from: cid(cur), to: cid(p.to), verdict: p.verdict === 'door' ? 'wall' : p.verdict, label: VERDICT_LABEL[p.verdict] });
        if (p.verdict === 'new') rec.do({ ...paint(p.to, { tone: 'queued', text: String(d(p.to)) }), pop: true, together: true });
      }
      rec.phase('넣기', news.length ? `새로 찾은 ${josa(news.map(fmt).join(', '), '을', '를')} 큐 뒤에 넣습니다.` : '새로 넣을 칸이 없어 그대로 넘어갑니다.', news.length ? AT.push : AT.next);
      const clearMarks: Action[] = [{ type: 'unfocus' }, { type: 'clearMarks' }];
      if (news.length) news.forEach((to, i) => {
        lane.push({ id: `tok:${key(to)}:${++seq}`, text: fmt(to) }, cid(to));
        if (!i) rec.do(...together(clearMarks, true)); // 흐림과 화살표 걷기는 첫 토큰이 날아가는 것과 같이
      });
      else rec.do(...together(clearMarks));
      last = cur;
    }
    return -1;
  };

  if (kind === 'best') {
    bfs({ from: START, to: LEVER, label: '1번째 BFS', startAt: BEST_AT.first,
      text: `시작 칸 ${fmt(START)}에서 레버까지 가는 거리를 구하는 BFS를 합니다. 거리 0을 적고 큐에 넣습니다.` });
    bfs({ from: LEVER, to: DOOR, label: '2번째 BFS', startAt: BEST_AT.second, wipe: true,
      text: `이번에는 레버 칸 ${fmt(LEVER)}에서 출구까지 가는 거리를 구합니다. 방문 표시를 새로 만들고 레버 칸을 큐에 넣습니다.` });
  } else if (kind === 'trap') {
    bfs({ from: START, to: LEVER, blocked: true, label: '1번째 BFS', startAt: BLOCK_AT.first,
      text: `출구는 레버를 당겨야 열린다고 생각해 출구를 막아 두고, 시작 칸 ${fmt(START)}에서 레버까지 BFS를 합니다.` });
    a = -1;
    rec.step({ title: '큐가 비었습니다 — 레버에 못 닿음', codeHighlights: BLOCK_AT.fail, ...meta(), answer: -1, isKeyframe: true });
    rec.phase('레버에 못 닿음', `큐가 비었는데 레버에 닿지 못해 a는 -1이고, -1을 돌려줍니다. 정답은 ${TRUTH}입니다.`, BLOCK_AT.fail);
    rec.do(badge('mine', 0, '내 답 -1', 'bad'), { ...badge('truth', 1, `정답 ${TRUTH}`, 'good'), together: true });
  } else {
    bfs({ from: LEVER, label: '레버에서 시작', startAt: ALL_AT.start,
      text: `레버 칸 ${fmt(LEVER)}에서 BFS를 한 번만 합니다. 거리 0을 적고 큐에 넣습니다.` });
    a = d(START);
    b = d(DOOR);
    const toStart = pathOf(START).reverse(); // 시작 → 레버
    const toDoor = pathOf(DOOR); // 레버 → 출구
    rec.step({ title: `거리 합 ${a} + ${b}`, codeHighlights: ALL_AT.answer, ...meta(), answer: a + b, isKeyframe: true });
    rec.phase('거리 더하기', `레버에서 시작 칸까지 ${a}, 출구까지 ${b}입니다. 길은 되돌아갈 수 있어서 시작 → 레버 거리도 ${a}이고, 더한 ${josa(a + b, '이', '가')} 답입니다.`, ALL_AT.answer);
    rec.do({ type: 'trace', id: 'path', points: [...toStart, ...toDoor.slice(1)].map(mid) },
      ...together([paint(START, { tone: 'path' }), paint(DOOR, { tone: 'path' }), badge('leg1', 0, `S→L ${a}`), badge('leg2', 1, `L→E ${b}`), badge('sum', 2, `합 ${a + b}`, 'good')], true));
  }
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'maze-escape',
  title: '미로 탈출',
  level: 2,
  category: 'dfs-bfs',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/159993',
  description: {
    summary:
      '격자 미로에서 시작 지점 S에서 출발해 레버 L을 당긴 뒤 출구 E로 나가야 합니다. 한 칸 움직이는 데 1초가 걸리고, 통로 O만 지날 수 있으며 벽 X는 못 지납니다. 출구는 레버를 당기기 전에도 지나갈 수 있고, 같은 칸을 여러 번 지나도 됩니다. 탈출하는 가장 짧은 시간을 구하고, 못 나가면 -1을 돌려줍니다.',
    rules: [
      'maps의 가로·세로 길이는 5 이상 100 이하',
      'maps의 글자는 S(시작), E(출구), L(레버), O(통로), X(벽)',
      '시작 지점, 출구, 레버는 서로 다른 곳에 한 개씩만 있음',
      '출구는 레버를 당기기 전에도 지나갈 수 있고, 모든 칸은 여러 번 지나도 됨',
    ],
    examples: [
      { input: 'maps = ["SOOOL","XXXXO","OOOOO","OXXXX","OOOOE"]', output: '16' },
      { input: 'maps = ["LOOXS","OOOOX","OOOOO","OOOOO","EOOOO"]', output: '-1' },
    ],
  },
  keyIntuitions: [
    '"레버를 먼저 당긴 뒤 출구"라는 순서는 시작 → 레버, 레버 → 출구 두 구간으로 나뉩니다. 각 구간의 최단 거리를 BFS로 구해 더하면 됩니다. BFS를 두 번 하는 것입니다.',
    '출구는 레버를 당기기 전에도 지나갈 수 있습니다. 출구를 벽처럼 막아 두면 레버로 가는 길이 끊겨 -1이 나올 수 있습니다.',
    '둘 중 한 구간이라도 못 가면 -1입니다. 첫 BFS에서 레버에 못 닿으면 두 번째는 해 볼 필요가 없습니다.',
  ],
  demo: { input: [MAPS], label: 'maps = ["OOOXL","OXXOO","OXOOX","XOOXS","OXEOO"]' },
  workUnit: '칸을 꺼낸 횟수',
  approaches: [
    {
      id: 'maze-bfs-twice',
      name: '너비 우선 탐색 두 번 (시작 → 레버 → 출구)',
      rank: 'BEST',
      timeComplexity: 'O(N × M)',
      spaceComplexity: 'O(N × M)',
      verdict: '시작 → 레버, 레버 → 출구를 각각 BFS로 구해 더하는 표준 풀이입니다.',
      pros: [
        '문제의 순서(레버를 먼저 당기고 출구)를 그대로 두 구간으로 옮겨 이해하기 쉽습니다.',
        '구간마다 목표 칸을 꺼내는 즉시 끝내서 필요 없는 칸은 보지 않습니다.',
        '한 구간이라도 막히면 바로 -1을 돌려줘 나머지를 계산하지 않습니다.',
      ],
      cons: ['BFS 함수를 두 번 부르므로 거리표와 큐를 구간마다 새로 만듭니다.'],
      whyThisRank:
        '목표를 거치는 순서가 정해진 최단 거리는 "목표까지 BFS를 구간마다 한 번씩" 하는 것이 정석입니다. 코드가 문제와 같은 모양이라 규칙이 바뀌어도 그대로 고칠 수 있습니다.',
      code: BEST,
      visualize: () => viz('best'),
    },
    {
      id: 'maze-bfs-lever',
      name: '레버에서 한 번만 BFS',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × M)',
      spaceComplexity: 'O(N × M)',
      verdict: '일은 더 적게 하지만 왔던 길로 되돌아갈 수 있다는 성질에 기댄 덜 일반적인 풀이입니다.',
      pros: [
        '길은 되돌아갈 수 있어서 시작 → 레버 거리와 레버 → 시작 거리가 같으니, 레버에서 한 번만 퍼져 나가면 시작과 출구까지의 거리를 함께 얻습니다.',
        'BFS를 한 번만 써서 코드와 거리표가 하나입니다.',
      ],
      cons: [
        '일방통행이나 "레버를 당기기 전에는 못 지나는 칸"처럼 오갈 때 규칙이 달라지면 틀립니다.',
        '목표를 찾아도 멈추지 않고 큐가 빌 때까지 퍼져서, 미로가 넓으면 필요 없는 칸까지 모두 봅니다.',
      ],
      whyThisRank:
        '이 문제에서는 맞고 일의 양도 적지만, 이동 규칙의 대칭성이라는 숨은 조건에 기대고 있습니다. 규칙이 바뀌어도 통하는 구간별 BFS가 더 믿을 만한 정석입니다.',
      code: ALL,
      visualize: () => viz('alt'),
    },
    {
      id: 'maze-block-door',
      name: '출구를 막고 BFS (레버 전에는 출구를 벽 취급)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N × M)',
      spaceComplexity: 'O(N × M)',
      verdict: '"출구는 레버를 당겨야 열린다"를 벽으로 옮겨서 레버로 가는 길을 끊어 오답이 나옵니다.',
      pros: ['레버를 당기기 전에는 출구로 못 나가는 규칙을 코드에 그대로 옮긴 듯 보입니다.'],
      cons: [
        '출구는 레버를 당기기 전에도 지나갈 수 있는데 벽처럼 막으면, 출구를 거쳐야 레버에 닿는 미로에서 레버를 못 찾아 -1이 나옵니다. 시각화 입력의 정답은 15인데 -1을 돌려줍니다.',
        '출구가 길목에 있지 않은 미로에서는 우연히 맞아서 예제만 통과하기 쉽습니다.',
      ],
      whyThisRank:
        '탈출은 레버를 당긴 뒤에만 되지만, 출구 칸을 지나가는 것은 언제든 됩니다. 두 규칙을 섞어 출구를 벽으로 막은 것이 오답의 원인입니다.',
      code: BLOCK,
      visualize: () => viz('trap'),
    },
  ],
  checks: {
    cases: [
      { args: [['SOOOL', 'XXXXO', 'OOOOO', 'OXXXX', 'OOOOE']], expected: 16 },
      { args: [['LOOXS', 'OOOOX', 'OOOOO', 'OOOOO', 'EOOOO']], expected: -1 },
      { args: [['SLOOE', 'OOOOO', 'OOOOO', 'OOOOO', 'OOOOO']], expected: 4 },
      { args: [['SOOOE', 'XXXXX', 'LOOOO', 'OOOOO', 'OOOOO']], expected: -1 },
      { args: [['SEOOL', 'OOOOO', 'OOOOO', 'OOOOO', 'OOOOO']], expected: 7 },
      { args: [MAPS], expected: TRUTH },
    ],
    // 5~6칸 정사각형이 아닌 미로. 칸마다 25% 확률로 벽(X), S, L, E는 서로 다른 칸에 하나씩
    random: (rand) => {
      const [n, m] = [5 + Math.floor(rand() * 2), 5 + Math.floor(rand() * 2)];
      const grid2 = Array.from({ length: n }, () => Array.from({ length: m }, (): string => (rand() < 0.25 ? 'X' : 'O')));
      const cells = Array.from({ length: n * m }, (_, k) => k);
      for (const ch of ['S', 'L', 'E']) {
        const k = cells.splice(Math.floor(rand() * cells.length), 1)[0];
        grid2[Math.floor(k / m)][k % m] = ch;
      }
      return [grid2.map((row) => row.join(''))];
    },
  },
};

export default problem;
