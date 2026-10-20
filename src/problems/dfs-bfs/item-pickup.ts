// 아이템 줍기: 정석 BFS(좌표 두 배), 대안 DFS(두 방향 모두 걸어 보기), 함정 좌표를 두 배로 늘리지 않은 BFS를 같은 땅에서 움직인다.
// 장면은 위에 줄(큐·스택), 아래에 좌표 판이다. 칸은 길(흰색, 1), 안쪽(회색, 2), 바깥(빗금, 0)이고 x는 오른쪽, y는 위쪽으로 늘어난다.
// 두 배 판은 9×9(둘레 한 칸 여백 포함), 두 배로 늘리지 않은 판은 6×6이다. 칸 글은 BFS가 적은 거리, DFS가 밟은 순서다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { center, grid } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Language, Point, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { fmt, josa, lines, together } from '../shared.ts';
import { fit } from './pacing.ts';

type Cell = [number, number]; // [x, y]
type Lines = Record<Language, number[]>;

// 시각화 입력. 1번째 직사각형 오른쪽 변의 가운데가 2번째 직사각형 안쪽이 되어 지워진다.
// 좌표를 두 배로 늘리지 않으면 그 양쪽의 (3, 2)와 (3, 3)이 바로 이웃이 되어, 함정은 4번 가야 할 길을 2번에 건넌다.
const RECTS = [[1, 1, 3, 4], [2, 2, 4, 3]];
const CHARACTER: Cell = [3, 1];
const ITEM: Cell = [3, 3];
const MIN = 1; // 시각화 입력의 좌표 범위(판 크기)
const MAX = 4;

const key = ([x, y]: Cell) => `${x},${y}`;
const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
const scaled = ([x, y]: Cell, k: number): Cell => [x * k, y * k];
const cid = (c: Cell) => `cell:${key(c)}`;
const D4: [number, number, string][] = [[0, 1, '위쪽'], [0, -1, '아래쪽'], [-1, 0, '왼쪽'], [1, 0, '오른쪽']]; // 상, 하, 좌, 우(코드와 같은 순서)
const around = (c: Cell, d: number): Cell => [c[0] + D4[d][0], c[1] + D4[d][1]];

// k배로 늘린 판 B[x][y]: 0 바깥, 1 테두리(길), 2 안쪽. 직사각형을 차례로 칠하되 이미 안쪽(2)인 칸은 그대로 둔다
function applyRect(B: number[][], k: number, [x1, y1, x2, y2]: number[]): Cell[] {
  const cells: Cell[] = [];
  for (let x = k * x1; x <= k * x2; x++) {
    for (let y = k * y1; y <= k * y2; y++) {
      cells.push([x, y]);
      if (B[x][y] === 2) continue;
      B[x][y] = x === k * x1 || x === k * x2 || y === k * y1 || y === k * y2 ? 1 : 2;
    }
  }
  return cells;
}
const emptyBoard = (k: number, max = MAX) => Array.from({ length: k * max + 2 }, () => Array<number>(k * max + 2).fill(0)); // 둘레에 한 칸 여백
function build(k: number, rects = RECTS, max = MAX): number[][] {
  const B = emptyBoard(k, max);
  for (const r of rects) applyRect(B, k, r);
  return B;
}
const count = (B: number[][], v: number) => B.flat().filter((x) => x === v).length;

const BOARD2 = build(2);

// 두 배 판에서 dfs를 코드와 똑같이 돌려, 도착 칸에 닿은 길(스택)들과 dfs를 부른 횟수를 모은다
function dfsRun(): { paths: Cell[][]; calls: number } {
  const [start, goal] = [scaled(CHARACTER, 2), scaled(ITEM, 2)];
  const visited = new Set([key(start)]);
  const stack: Cell[] = [start];
  const paths: Cell[][] = [];
  let calls = 0;
  const dfs = (c: Cell) => {
    calls++;
    if (same(c, goal)) {
      paths.push([...stack]);
      return;
    }
    for (let d = 0; d < 4; d++) {
      const n = around(c, d);
      if (BOARD2[n[0]][n[1]] === 1 && !visited.has(key(n))) {
        visited.add(key(n));
        stack.push(n);
        dfs(n);
        stack.pop();
        visited.delete(key(n));
      }
    }
  };
  dfs(start);
  return { paths, calls };
}
const { paths: PATHS, calls: DFS_CALLS } = dfsRun();
const SHORT = PATHS.reduce((a, b) => (b.length < a.length ? b : a)); // 가장 짧은 길(두 배 판의 칸 목록)
const TRUTH = (SHORT.length - 1) / 2; // 정답: 두 배 판에서 센 거리의 절반

// 두 배 판 길 칸을 한 바퀴 도는 차례(함정의 마지막 단계에서 진짜 테두리를 그릴 때 쓴다)
function ringOf(B: number[][], first: Cell): Cell[] {
  const ring: Cell[] = [];
  let [prev, now]: [Cell | undefined, Cell] = [undefined, first];
  do {
    ring.push(now);
    const next = [0, 1, 2, 3].map((d) => around(now, d)).find((n) => B[n[0]][n[1]] === 1 && !(prev && same(n, prev)))!;
    [prev, now] = [now, next];
  } while (!same(now, first));
  return ring;
}

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BFS = {
  python: `from collections import deque

def solution(rectangle, characterX, characterY, itemX, itemY):
    board = [[0] * 102 for _ in range(102)]  # 좌표를 두 배로 늘린 판: 0 바깥, 1 테두리(길), 2 안쪽
    for x1, y1, x2, y2 in rectangle:
        for x in range(2 * x1, 2 * x2 + 1):
            for y in range(2 * y1, 2 * y2 + 1):
                if board[x][y] == 2:
                    continue  # 이미 다른 직사각형의 안쪽이면 그대로 둡니다
                board[x][y] = 1 if x in (2 * x1, 2 * x2) or y in (2 * y1, 2 * y2) else 2

    start = (2 * characterX, 2 * characterY)
    goal = (2 * itemX, 2 * itemY)
    dist = {start: 0}
    queue = deque([start])
    while queue:
        x, y = queue.popleft()
        if (x, y) == goal:
            return dist[(x, y)] // 2  # 두 배로 늘렸으니 거리를 반으로
        for dx, dy in ((0, 1), (0, -1), (-1, 0), (1, 0)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy
            if board[nx][ny] == 1 and (nx, ny) not in dist:
                dist[(nx, ny)] = dist[(x, y)] + 1
                queue.append((nx, ny))`,
  javascript: `function solution(rectangle, characterX, characterY, itemX, itemY) {
  const board = Array.from({ length: 102 }, () => Array(102).fill(0)); // 좌표를 두 배로 늘린 판: 0 바깥, 1 테두리(길), 2 안쪽
  for (const [x1, y1, x2, y2] of rectangle) {
    for (let x = 2 * x1; x <= 2 * x2; x++) {
      for (let y = 2 * y1; y <= 2 * y2; y++) {
        if (board[x][y] === 2) continue; // 이미 다른 직사각형의 안쪽이면 그대로 둡니다
        board[x][y] = x === 2 * x1 || x === 2 * x2 || y === 2 * y1 || y === 2 * y2 ? 1 : 2;
      }
    }
  }

  const start = [2 * characterX, 2 * characterY];
  const goal = [2 * itemX, 2 * itemY];
  const dist = Array.from({ length: 102 }, () => Array(102).fill(-1));
  dist[start[0]][start[1]] = 0;
  const queue = [start];
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x === goal[0] && y === goal[1]) return dist[x][y] / 2; // 두 배로 늘렸으니 거리를 반으로
    for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) { // 상, 하, 좌, 우
      const nx = x + dx;
      const ny = y + dy;
      if (board[nx][ny] === 1 && dist[nx][ny] === -1) {
        dist[nx][ny] = dist[x][y] + 1;
        queue.push([nx, ny]);
      }
    }
  }
}`,
};
const BFS_AT = {
  draw: lines(BFS, ['for x1, y1, x2, y2 in rectangle', 'if board[x][y] == 2', 'board[x][y] = 1 if'],
    ['for (const [x1, y1, x2, y2] of rectangle)', 'if (board[x][y] === 2) continue', 'board[x][y] = x === 2 * x1']),
  start: lines(BFS, ['start = (2 * characterX', 'goal = (2 * itemX', 'dist = {start: 0}', 'queue = deque([start])'],
    ['const start = [2 * characterX', 'const goal = [2 * itemX', 'dist[start[0]][start[1]] = 0', 'const queue = [start]']),
  pop: lines(BFS, ['x, y = queue.popleft()'], ['const [x, y] = queue[head++]']),
  look: lines(BFS, ['for dx, dy in', 'if board[nx][ny] == 1'], ['for (const [dx, dy] of', 'if (board[nx][ny] === 1']),
  mark: lines(BFS, ['for dx, dy in', 'if board[nx][ny] == 1', 'dist[(nx, ny)] = dist[(x, y)] + 1'],
    ['for (const [dx, dy] of', 'if (board[nx][ny] === 1', 'dist[nx][ny] = dist[x][y] + 1']),
  push: lines(BFS, ['queue.append((nx, ny))'], ['queue.push([nx, ny])']),
  next: lines(BFS, ['while queue:'], ['while (head < queue.length)']),
  goal: lines(BFS, ['if (x, y) == goal', 'return dist[(x, y)] // 2'], ['if (x === goal[0] && y === goal[1])']),
};

const DFS = {
  python: `def solution(rectangle, characterX, characterY, itemX, itemY):
    board = [[0] * 102 for _ in range(102)]  # 좌표를 두 배로 늘린 판: 0 바깥, 1 테두리(길), 2 안쪽
    for x1, y1, x2, y2 in rectangle:
        for x in range(2 * x1, 2 * x2 + 1):
            for y in range(2 * y1, 2 * y2 + 1):
                if board[x][y] == 2:
                    continue  # 이미 다른 직사각형의 안쪽이면 그대로 둡니다
                board[x][y] = 1 if x in (2 * x1, 2 * x2) or y in (2 * y1, 2 * y2) else 2

    goal = (2 * itemX, 2 * itemY)
    visited = {(2 * characterX, 2 * characterY)}
    best = float("inf")

    def dfs(x, y, count):
        nonlocal best
        if (x, y) == goal:
            best = min(best, count)  # 더 짧은 길이 있을 수 있어 멈추지 않습니다
            return
        for dx, dy in ((0, 1), (0, -1), (-1, 0), (1, 0)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy
            if board[nx][ny] == 1 and (nx, ny) not in visited:
                visited.add((nx, ny))
                dfs(nx, ny, count + 1)
                visited.remove((nx, ny))  # 되돌리기 → 다른 길도 모두 확인

    dfs(2 * characterX, 2 * characterY, 0)
    return best // 2`,
  javascript: `function solution(rectangle, characterX, characterY, itemX, itemY) {
  const board = Array.from({ length: 102 }, () => Array(102).fill(0)); // 좌표를 두 배로 늘린 판: 0 바깥, 1 테두리(길), 2 안쪽
  for (const [x1, y1, x2, y2] of rectangle) {
    for (let x = 2 * x1; x <= 2 * x2; x++) {
      for (let y = 2 * y1; y <= 2 * y2; y++) {
        if (board[x][y] === 2) continue; // 이미 다른 직사각형의 안쪽이면 그대로 둡니다
        board[x][y] = x === 2 * x1 || x === 2 * x2 || y === 2 * y1 || y === 2 * y2 ? 1 : 2;
      }
    }
  }

  const goal = [2 * itemX, 2 * itemY];
  const visited = Array.from({ length: 102 }, () => Array(102).fill(false));
  visited[2 * characterX][2 * characterY] = true;
  let best = Infinity;

  const dfs = (x, y, count) => {
    if (x === goal[0] && y === goal[1]) {
      best = Math.min(best, count); // 더 짧은 길이 있을 수 있어 멈추지 않습니다
      return;
    }
    for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) { // 상, 하, 좌, 우
      const nx = x + dx;
      const ny = y + dy;
      if (board[nx][ny] === 1 && !visited[nx][ny]) {
        visited[nx][ny] = true;
        dfs(nx, ny, count + 1);
        visited[nx][ny] = false; // 되돌리기 → 다른 길도 모두 확인
      }
    }
  };

  dfs(2 * characterX, 2 * characterY, 0);
  return best / 2;
}`,
};
const DFS_AT = {
  draw: lines(DFS, ['for x1, y1, x2, y2 in rectangle', 'if board[x][y] == 2', 'board[x][y] = 1 if'],
    ['for (const [x1, y1, x2, y2] of rectangle)', 'if (board[x][y] === 2) continue', 'board[x][y] = x === 2 * x1']),
  start: lines(DFS, ['goal = (2 * itemX', 'visited = {(2 * characterX', 'best = float("inf")', 'dfs(2 * characterX, 2 * characterY, 0)'],
    ['const goal = [2 * itemX', 'visited[2 * characterX][2 * characterY] = true', 'let best = Infinity', 'dfs(2 * characterX, 2 * characterY, 0)']),
  enter: lines(DFS, ['visited.add((nx, ny))', 'dfs(nx, ny, count + 1)'], ['visited[nx][ny] = true', 'dfs(nx, ny, count + 1)']),
  look: lines(DFS, ['for dx, dy in', 'if board[nx][ny] == 1 and (nx, ny) not in visited'], ['for (const [dx, dy] of', 'if (board[nx][ny] === 1 && !visited[nx][ny])']),
  found: lines(DFS, ['if (x, y) == goal', 'best = min(best, count)'], ['if (x === goal[0] && y === goal[1])', 'best = Math.min(best, count)']),
  back: lines(DFS, ['visited.remove((nx, ny))'], ['visited[nx][ny] = false']),
  fast: lines(DFS, ['for dx, dy in', 'dfs(nx, ny, count + 1)', 'visited.remove((nx, ny))'], ['for (const [dx, dy] of', 'dfs(nx, ny, count + 1)', 'visited[nx][ny] = false']),
  done: lines(DFS, ['dfs(2 * characterX, 2 * characterY, 0)', 'return best // 2'], ['dfs(2 * characterX, 2 * characterY, 0)', 'return best / 2']),
};

const WRONG = {
  python: `# 주의: 오답이 나오는 풀이입니다 (좌표를 두 배로 늘리지 않습니다)
from collections import deque

def solution(rectangle, characterX, characterY, itemX, itemY):
    board = [[0] * 52 for _ in range(52)]  # 원래 좌표 그대로: 0 바깥, 1 테두리(길), 2 안쪽
    for x1, y1, x2, y2 in rectangle:
        for x in range(x1, x2 + 1):
            for y in range(y1, y2 + 1):
                if board[x][y] == 2:
                    continue  # 이미 다른 직사각형의 안쪽이면 그대로 둡니다
                board[x][y] = 1 if x in (x1, x2) or y in (y1, y2) else 2

    start = (characterX, characterY)
    goal = (itemX, itemY)
    dist = {start: 0}
    queue = deque([start])
    while queue:
        x, y = queue.popleft()
        if (x, y) == goal:
            return dist[(x, y)]
        for dx, dy in ((0, 1), (0, -1), (-1, 0), (1, 0)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy
            if board[nx][ny] == 1 and (nx, ny) not in dist:
                dist[(nx, ny)] = dist[(x, y)] + 1
                queue.append((nx, ny))`,
  javascript: `// 주의: 오답이 나오는 풀이입니다 (좌표를 두 배로 늘리지 않습니다)
function solution(rectangle, characterX, characterY, itemX, itemY) {
  const board = Array.from({ length: 52 }, () => Array(52).fill(0)); // 원래 좌표 그대로: 0 바깥, 1 테두리(길), 2 안쪽
  for (const [x1, y1, x2, y2] of rectangle) {
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        if (board[x][y] === 2) continue; // 이미 다른 직사각형의 안쪽이면 그대로 둡니다
        board[x][y] = x === x1 || x === x2 || y === y1 || y === y2 ? 1 : 2;
      }
    }
  }

  const start = [characterX, characterY];
  const dist = Array.from({ length: 52 }, () => Array(52).fill(-1));
  dist[start[0]][start[1]] = 0;
  const queue = [start];
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x === itemX && y === itemY) return dist[x][y];
    for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) { // 상, 하, 좌, 우
      const nx = x + dx;
      const ny = y + dy;
      if (board[nx][ny] === 1 && dist[nx][ny] === -1) {
        dist[nx][ny] = dist[x][y] + 1;
        queue.push([nx, ny]);
      }
    }
  }
}`,
};
const WRONG_AT = {
  draw: lines(WRONG, ['for x1, y1, x2, y2 in rectangle', 'if board[x][y] == 2', 'board[x][y] = 1 if'],
    ['for (const [x1, y1, x2, y2] of rectangle)', 'if (board[x][y] === 2) continue', 'board[x][y] = x === x1']),
  start: lines(WRONG, ['start = (characterX, characterY)', 'goal = (itemX, itemY)', 'dist = {start: 0}', 'queue = deque([start])'],
    ['const start = [characterX, characterY]', 'dist[start[0]][start[1]] = 0', 'const queue = [start]']),
  pop: lines(WRONG, ['x, y = queue.popleft()'], ['const [x, y] = queue[head++]']),
  look: lines(WRONG, ['for dx, dy in', 'if board[nx][ny] == 1'], ['for (const [dx, dy] of', 'if (board[nx][ny] === 1']),
  mark: lines(WRONG, ['for dx, dy in', 'if board[nx][ny] == 1', 'dist[(nx, ny)] = dist[(x, y)] + 1'],
    ['for (const [dx, dy] of', 'if (board[nx][ny] === 1', 'dist[nx][ny] = dist[x][y] + 1']),
  push: lines(WRONG, ['queue.append((nx, ny))'], ['queue.push([nx, ny])']),
  next: lines(WRONG, ['while queue:'], ['while (head < queue.length)']),
  goal: lines(WRONG, ['if (x, y) == goal', 'return dist[(x, y)]'], ['if (x === itemX && y === itemY) return dist[x][y]']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 판: 왼쪽 26px은 y 눈금, 위 54px은 줄, 판 아래 눈금 한 줄(18px), 그 아래에 결과 표시 줄(34px 간격)이 있으면 둔다.
// 두 배 판은 칸 40px, 아닌 판은 54px.
interface Spec { k: 1 | 2; lo: number; hi: number; width: number; bottom: number; cellRect: (c: Cell) => Rect }
function spec(k: 1 | 2): Spec {
  const [cell, gap] = k === 2 ? [40, 4] : [54, 6];
  const lo = k * MIN - 1; // 직사각형 둘레 한 칸 여백까지 그린다
  const hi = k * MAX + 1;
  const n = hi - lo + 1;
  const at = grid({ x: 26, y: 54, rows: n, cols: n, cell, gap });
  return { k, lo, hi, width: 26 + n * (cell + gap) - gap + 12, bottom: 54 + n * (cell + gap) - gap, cellRect: ([x, y]) => at(hi - y, x - lo) };
}
const LANE: LaneOptions = { id: 'lane', x: 40, y: 5, slotW: 58, slotH: 30, gap: 6, max: 5 };
const VERDICT_LABEL = { wall: '길 아님', seen: '방문함', new: '새 칸' } as const;
const TONE_OF = ['wall', 'plain', 'explored'] as const; // 판의 값 0, 1, 2에 칠하는 색
const rowRect = (sp: Spec, row: number, w: number, x = 0): Rect => ({ x, y: sp.bottom + 28 + row * 34, w, h: 30 });
const mid = (sp: Spec, c: Cell): Point => center(sp.cellRect(c));

// 세 풀이가 같이 쓰는 장면: 줄 이름표와 바탕, 판의 모든 칸(처음에는 모두 0), 눈금, 선(길 등). 아래 표시 줄이 rows개 있다.
function board(sp: Spec, lane: '큐' | '스택', rows: number, linesOf: { id: string; tone?: Tone }[], extra: Item[] = []): Scene {
  const height = sp.bottom + 28 + (rows ? rows * 34 - 4 : 0);
  const full: Rect = { x: 0, y: 0, w: sp.width, h: height }; // line은 rect 대신 points로 그린다
  const items: Item[] = [
    { id: 'lane:label', kind: 'text', rect: { x: 0, y: 0, w: 34, h: 40 }, text: lane },
    { id: 'lane:bg', kind: 'zone', rect: { x: 34, y: 0, w: sp.width - 34, h: 40 } },
  ];
  const side = sp.cellRect([sp.lo, sp.lo]).w;
  for (let x = sp.lo; x <= sp.hi; x++) {
    for (let y = sp.hi; y >= sp.lo; y--) {
      const tag = same([x, y], scaled(CHARACTER, sp.k)) ? '캐릭터' : same([x, y], scaled(ITEM, sp.k)) ? '아이템' : undefined;
      items.push({ id: cid([x, y]), kind: 'cell', rect: sp.cellRect([x, y]), tone: 'wall', ...(tag ? { tag } : {}) });
    }
  }
  // 눈금은 원래 좌표(두 배 판에서는 짝수 칸)에만 단다
  for (let v = MIN; v <= MAX; v++) {
    const [bx, by] = [sp.cellRect([sp.k * v, sp.lo]), sp.cellRect([sp.lo, sp.k * v])];
    items.push(
      { id: `axis:x:${v}`, kind: 'text', rect: { x: bx.x, y: sp.bottom + 4, w: side, h: 18 }, text: String(v) },
      { id: `axis:y:${v}`, kind: 'text', rect: { x: 0, y: by.y + (side - 18) / 2, w: 22, h: 18 }, text: String(v) },
    );
  }
  for (const l of linesOf) items.push({ id: l.id, kind: 'line', rect: full, ...(l.tone ? { tone: l.tone } : {}), points: [] });
  items.push(...extra);
  return { width: sp.width, height, items };
}

const paint = (c: Cell, patch: ItemPatch): Extract<Action, { type: 'set' }> => ({ type: 'set', id: cid(c), patch });
const wait = (ms: number): Action => ({ type: 'wait', ms });
const token = (c: Cell) => ({ id: `tok:${key(c)}`, text: fmt(c) });
const clear = (): Action[] => [{ type: 'unfocus' }, { type: 'clearMarks' }];

// 직사각형들을 차례로 한 마디씩 그린다: 그 직사각형의 칸만 밝게 하고, 바뀐 칸을 한꺼번에 칠한다
function draw(rec: StepRecorder, sp: Spec, at: { draw: Lines }, B: number[][]) {
  const mine = emptyBoard(sp.k);
  rec.step({
    title: `직사각형 ${RECTS.length}개를 ${sp.k === 2 ? '두 배로 ' : ''}그리기`,
    codeHighlights: at.draw,
    work: 0,
    variables: { '길(1)인 칸': `${count(B, 1)}칸`, '안쪽(2)인 칸': `${count(B, 2)}칸` },
  });
  RECTS.forEach((r, i) => {
    const cells = applyRect(mine, sp.k, r);
    const changed = cells.filter((c) => rec.get(cid(c)).tone !== TONE_OF[mine[c[0]][c[1]]]);
    const rect = `[${r.join(', ')}]`;
    const own = `${i + 1}번째 직사각형 ${sp.k === 2 ? `${rect}의 좌표를 두 배로 늘려` : josa(rect, '을', '를')}`;
    rec.phase('그리기', i === 0
      ? `${own} 칠합니다. 테두리는 1(길, 흰색), 안쪽은 2(못 가는 곳, 회색)입니다.`
      : `${own} 칠합니다. 겹친 곳은 안쪽(2)이 우선이라 가운데에 든 선이 지워지고 바깥 테두리만 남습니다.`, at.draw);
    rec.do({ type: 'focus', ids: cells.map(cid) }, ...together(changed.map((c) => paint(c, { tone: TONE_OF[mine[c[0]][c[1]]] })), true), wait(150), { type: 'unfocus' });
  });
}

// from에서 probes의 칸마다 화살표를 긋는다. 새 칸은 onNew의 동작을 화살표와 같이 한다. 흐림과 화살표는 다음 마디에서 걷는다
interface Probe { to: Cell; name: string; verdict: Verdict }
function probeAt(rec: StepRecorder, from: Cell, probes: Probe[], onNew: (p: Probe) => Action[] = () => []) {
  rec.do({ type: 'focus', ids: [cid(from), ...probes.map((p) => cid(p.to))] });
  for (const p of probes) {
    rec.do({ type: 'arrow', from: cid(from), to: cid(p.to), verdict: p.verdict, label: VERDICT_LABEL[p.verdict as keyof typeof VERDICT_LABEL] });
    if (p.verdict === 'new') for (const a of onNew(p)) rec.do({ ...a, together: true });
  }
}

/* ------------------------------------------------------------------ */
/* 정석 BFS(두 배 판) · 함정 BFS(두 배로 늘리지 않은 판): 꺼내기 → 살피기 → 넣기 */
/* ------------------------------------------------------------------ */

// k = 2이면 정석, k = 1이면 함정. 두 코드는 판 크기와 마지막에 거리를 반으로 나누는지만 다르다.
function breadthFirst(k: 1 | 2): Visualization {
  const sp = spec(k);
  const at = k === 2 ? BFS_AT : WRONG_AT;
  const B = build(k);
  const rec = new StepRecorder(board(sp, '큐', k === 1 ? 2 : 0, [{ id: 'path', tone: 'path' }, ...(k === 1 ? [{ id: 'outline' }] : [])]));
  const lane = new Lane(rec, LANE);
  const [start, goal] = [scaled(CHARACTER, k), scaled(ITEM, k)];
  const dist = new Map<string, number>([[key(start), 0]]);
  const prev = new Map<string, Cell>();
  const waiting: Cell[] = [start];
  let pops = 0;
  let last: Cell | undefined; // 바로 전에 꺼낸 칸
  const d = (c: Cell) => dist.get(key(c))!;
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = (cur?: Cell, news: Cell[] = []) => ({
    work: pops,
    variables: {
      '(x, y)': cur ? fmt(cur) : '-',
      dist: cur ? d(cur) : '-',
      '새로 넣은 칸': news.length ? news.map(fmt).join(', ') : '없음',
      queue: `[${waiting.map(fmt).join(', ')}]`,
    },
  });
  const takeOut = (cur: Cell) => {
    lane.shift(cid(cur));
    rec.do(...together([paint(cur, { tone: 'current' }), ...(last ? [paint(last, { tone: 'visited' })] : [])], true));
  };

  draw(rec, sp, at, B);
  rec.step({ title: `캐릭터 ${josa(fmt(start), '을', '를')} 큐에 넣기`, codeHighlights: at.start, ...meta(undefined, [start]) });
  rec.phase('시작', k === 2
    ? `캐릭터 ${josa(fmt(CHARACTER), '은', '는')} 두 배로 늘린 판의 ${fmt(start)} 칸입니다. 거리 0을 적고 큐에 넣습니다.`
    : `좌표를 그대로 써서 캐릭터 ${fmt(start)}에 거리 0을 적고 큐에 넣습니다.`);
  rec.do({ ...paint(start, { tone: 'queued', text: '0' }), pop: true });
  lane.push(token(start), cid(start));

  while (waiting.length) {
    const cur = waiting.shift()!;
    pops++;
    if (same(cur, goal)) {
      const path = [cur];
      for (let c = prev.get(key(cur)); c; c = prev.get(key(c))) path.unshift(c);
      rec.step({ title: `도착 칸 ${fmt(cur)} 꺼내기 — 거리 ${d(cur)}`, codeHighlights: at.goal, ...meta(cur), answer: k === 2 ? d(cur) / 2 : d(cur), isKeyframe: true });
      rec.phase('꺼내기', `큐 맨 앞에서 도착 칸 ${josa(fmt(cur), '을', '를')} 꺼냈습니다.`, at.pop);
      takeOut(cur);
      if (k === 2) {
        rec.phase('도착', `거리 ${josa(d(cur), '을', '를')} 반으로 나눈 ${josa(d(cur) / 2, '이', '가')} 실제 최단 거리입니다. 칸을 ${pops}번 밟았습니다.`);
        rec.do(...together(path.map((c) => paint(c, { tone: 'path' }))));
        rec.do({ type: 'trace', id: 'path', points: path.map((c) => mid(sp, c)) });
      } else {
        // 건너뛴 곳: 이웃한 두 칸 사이의 두 배 판 가운데 칸이 길이 아니면(안쪽으로 지워진 선) 그 두 칸은 못 건넌다
        const jumps = path.slice(1).flatMap((c, i): Cell[] => (BOARD2[path[i][0] + c[0]][path[i][1] + c[1]] === 1 ? [] : [path[i], c]));
        const ring = ringOf(BOARD2, scaled(CHARACTER, 2));
        const [a, b] = jumps;
        rec.phase('테두리 확인', `진짜 테두리는 이렇게 생겼습니다. ${fmt(a)}에서 ${josa(fmt(b), '으로', '로')} 곧장 가는 길은 테두리가 아니라 안쪽을 가로지르는 선입니다.`);
        rec.do({ type: 'trace', id: 'outline', points: [...ring, ring[0]].map(([x, y]) => mid(sp, [x / 2, y / 2])) });
        rec.phase('오답 확인', `좌표를 두 배로 늘리지 않아 두 칸이 이웃이 되었고, 막혀 있어야 할 곳을 건너 거리 ${d(cur)}가 나왔습니다. 정답은 ${TRUTH}입니다.`);
        rec.do(...together([
          ...path.map((c) => paint(c, { tone: jumps.some((j) => same(j, c)) ? 'bad' : 'path' })),
          { type: 'trace', id: 'path', points: path.map((c) => mid(sp, c)) },
          { type: 'add', item: { id: 'mine', kind: 'token', rect: rowRect(sp, 0, 110), tone: 'bad', text: `내 답 ${d(cur)}` } },
          { type: 'add', item: { id: 'truth', kind: 'token', rect: rowRect(sp, 1, 110), tone: 'good', text: `정답 ${TRUTH}` } },
        ]));
      }
      break;
    }
    const probes = [0, 1, 2, 3].map((i): Probe => {
      const to = around(cur, i);
      return { to, name: D4[i][2], verdict: B[to[0]][to[1]] !== 1 ? 'wall' : dist.has(key(to)) ? 'seen' : 'new' };
    });
    const news = probes.filter((p) => p.verdict === 'new').map((p) => p.to);
    for (const to of news) {
      dist.set(key(to), d(cur) + 1);
      prev.set(key(to), cur);
      waiting.push(to);
    }
    rec.step({
      title: news.length ? `${fmt(cur)} 꺼내고 ${news.length}칸 넣기` : `${fmt(cur)} 꺼내기 — 넣을 칸 없음`,
      codeHighlights: news.length ? at.push : at.next,
      ...meta(cur, news),
    });
    rec.phase('꺼내기', `큐 맨 앞에서 ${josa(fmt(cur), '을', '를')} 꺼냅니다. 이 칸까지의 거리는 ${d(cur)}입니다.`, at.pop);
    takeOut(cur);
    rec.phase('살피기', `상하좌우 칸을 하나씩 확인합니다. 길이 아니거나 이미 방문한 칸은 건너뛰고${news.length ? `, 새 칸에는 거리 ${josa(d(cur) + 1, '을', '를')} 적습니다.` : ' 넘어갑니다.'}`, news.length ? at.mark : at.look);
    probeAt(rec, cur, probes, (p) => [{ ...paint(p.to, { tone: 'queued', text: String(d(cur) + 1) }), pop: true }]);
    rec.phase('넣기', news.length ? `새로 찾은 ${josa(news.map(fmt).join(', '), '을', '를')} 큐 뒤에 넣습니다.` : '새로 넣을 칸이 없어 그대로 넘어갑니다.', news.length ? at.push : at.next);
    if (news.length) news.forEach((to, i) => {
      lane.push(token(to), cid(to));
      if (!i) rec.do(...together(clear(), true)); // 흐림과 화살표 걷기는 첫 토큰이 날아가는 것과 같이
    });
    else rec.do(...together(clear()));
    last = cur;
  }
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 DFS: 들어가기 → 살피기 → 되돌아가기, 반대 방향은 빨리 감기             */
/* ------------------------------------------------------------------ */

function depthFirst(): Visualization {
  const sp = spec(2);
  const at = DFS_AT;
  const [first, second] = PATHS; // 위쪽부터 가서 처음 닿는 길과, 되돌아와 반대 방향으로 가서 닿는 길
  const start = first[0];
  const goal = first.at(-1)!;
  const rec = new StepRecorder(board(sp, '스택', 1, [{ id: 'trail', tone: 'trail' }, { id: 'walked', tone: 'trail' }, { id: 'path', tone: 'path' }],
    [{ id: 'best', kind: 'token', rect: rowRect(sp, 0, 110), tone: 'plain', text: 'best ∞' }]));
  const lane = new Lane(rec, { ...LANE, foldable: true });
  const stack: Cell[] = []; // 지금 길 = 호출 스택
  const shown: Cell[] = []; // 그림에 쌓인 길(마디가 끝나면 stack과 같다)
  let calls = 0; // dfs를 부른 횟수 = 칸을 밟은 횟수
  let best = Infinity;
  let running = true; // dfs가 끝나기 전까지
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => {
    const top = stack.at(-1);
    return { work: calls, variables: { '(x, y)': running && top ? fmt(top) : '-', count: running && top ? stack.length - 1 : '-', best: best === Infinity ? '∞' : best } };
  };
  const trail = (cells: Cell[]): Action => ({ type: 'set', id: 'trail', patch: { points: cells.map((c) => mid(sp, c)) } });
  const dirOf = (a: Cell, b: Cell) => [0, 1, 2, 3].find((d) => same(around(a, d), b))!;

  // 살피기: from에서 dirFrom 방향부터 차례로 보다가 안 간 길이 나오면 멈춘다(그 길로 들어간다)
  const looksFrom = (from: Cell, dirFrom: number): Probe[] => {
    const probes: Probe[] = [];
    for (let i = dirFrom; i < 4; i++) {
      const to = around(from, i);
      const verdict: Verdict = BOARD2[to[0]][to[1]] !== 1 ? 'wall' : stack.some((c) => same(c, to)) ? 'seen' : 'new';
      probes.push({ to, name: D4[i][2], verdict });
      if (verdict === 'new') break;
    }
    return probes;
  };
  const lookText = (probes: Probe[]) => `${probes.map((p, i) => {
    const end = i === probes.length - 1;
    if (p.verdict === 'wall') return `${p.name}은 길이 아니${end ? '라 건너뜁니다' : '고'}`;
    if (p.verdict === 'seen') return `${p.name}은 이미 지난 칸${end ? '이라 건너뜁니다' : '이고'}`;
    return `${p.name} ${josa(fmt(p.to), '은', '는')} 아직 안 간 길이라 들어갑니다`;
  }).join(', ')}.`;
  const look = (from: Cell, probes: Probe[], resumed = false) => {
    rec.phase('살피기', `${fmt(from)}에서 ${resumed ? '아직 안 본 방향을 이어서' : '상하좌우를 차례로'} 봅니다. ${lookText(probes)}`, at.look);
    probeAt(rec, from, probes); // 흐림과 화살표는 단계가 끝나면 무대가 걷는다
  };
  // 들어가기: 토큰이 스택에 쌓이면서 칸이 지금 칸이 되고, 앞 칸은 밟고 있는 길, 길 선이 늘어난다
  const enter = (cell: Cell) => {
    const from = shown.at(-1);
    shown.push(cell);
    lane.push(token(cell), cid(cell));
    rec.do(...together([...(from ? [paint(from, { tone: 'trail' })] : []), paint(cell, { tone: 'current', text: String(shown.length - 1) }), trail(shown)], true));
  };

  draw(rec, sp, at, BOARD2);

  stack.push(start);
  calls++;
  rec.step({ title: `캐릭터 ${fmt(start)}에서 시작`, codeHighlights: at.look, ...meta() });
  rec.phase('들어가기', `캐릭터 ${josa(fmt(CHARACTER), '은', '는')} 두 배로 늘린 판의 ${fmt(start)} 칸입니다. 방문 표시를 하고 dfs를 시작합니다.`, at.start);
  enter(start);
  look(start, looksFrom(start, 0));

  // 처음 닿는 길: 같은 방향으로 가는 칸을 한 마디로(최대 3칸) 들어간다. 한 마디 끝에서 갈림길(방향이 바뀌는 칸)을 살핀다
  const runs: { dir: number; cells: Cell[] }[] = [];
  first.slice(1).forEach((c, i) => {
    const dir = dirOf(first[i], c);
    if (runs.at(-1)?.dir === dir && runs.at(-1)!.cells.length < 3) runs.at(-1)!.cells.push(c);
    else runs.push({ dir, cells: [c] });
  });
  runs.forEach(({ dir, cells }, r) => {
    const arrive = r === runs.length - 1;
    stack.push(...cells);
    calls += cells.length;
    if (arrive) best = stack.length - 1;
    rec.step({ title: arrive ? `도착 — ${best}칸 길 찾음` : `${D4[dir][2]}으로 ${cells.length}칸 들어가기`, codeHighlights: arrive ? at.found : at.look, ...meta() });
    rec.phase('들어가기', `${D4[dir][2]}으로 ${cells.length}칸, ${cells.map(fmt).join(', ')}에 차례로 들어갑니다.`, at.enter);
    cells.forEach(enter);
    if (arrive) {
      rec.phase('도착', `도착 칸에 닿았습니다. 지나온 칸은 ${best}개라 best = ${best}입니다. 더 짧은 길이 있을 수 있어 멈추지 않고 되돌아갑니다.`, at.found);
      rec.do(...together([paint(goal, { tone: 'good' }), { type: 'set', id: 'best', patch: { text: `best ${best}` }, pop: true }]));
    } else {
      look(cells.at(-1)!, looksFrom(cells.at(-1)!, 0));
    }
  });

  // 도착 칸에서 출발 칸까지 3칸씩 끊어 되돌아간다(한 마디가 너무 길지 않게)
  const back = first.slice(1).reverse();
  for (let done = 0; done < back.length;) {
    const chunk = back.slice(done, done + 3);
    const opening = done === 0;
    done += chunk.length;
    const left = back.length - done;
    stack.length = first.length - done;
    rec.step({ title: `${left ? `${fmt(stack.at(-1)!)}까지` : '출발 칸까지'} 되돌아가기 ${done}/${back.length}칸`, codeHighlights: at.back, ...meta() });
    rec.phase('되돌아가기', left
      ? `${opening ? '도착해도 멈추지 않고, 방문 표시를 지우며 되돌아갑니다.' : '계속 되돌아갑니다.'} ${left}칸 남았습니다.`
      : `${opening ? '도착해도 멈추지 않고, 방문 표시를 지우며 되돌아갑니다.' : '계속 되돌아가'} 출발 칸에 닿았습니다.`, at.back);
    for (const cell of chunk) {
      shown.pop();
      lane.pop(cid(cell));
      rec.do(...together([paint(cell, { tone: 'explored', text: '' }), trail(shown), paint(shown.at(-1)!, { tone: 'current' })], true));
    }
    if (!left) look(start, looksFrom(start, dirOf(start, first[1]) + 1), true);
  }

  // 반대 방향 길: 끝까지 걸어 도착 칸에 닿지만 best보다 길어 그대로. 한꺼번에 빨리 감기로 그린다
  const more = second.length - 1;
  calls += more;
  rec.step({ title: `반대 방향도 끝까지 — ${more}칸 더 밟기`, codeHighlights: at.fast, ...meta() });
  rec.phase('빨리 감기', `왼쪽 길로도 끝까지 걸어 도착 칸에 닿습니다. 그 길은 ${more}칸이라 best ${best}보다 길어 best는 그대로이고, 출발 칸까지 되돌아옵니다.`, at.fast);
  rec.do(...together([{ type: 'trace', id: 'walked', points: second.map((c) => mid(sp, c)) },
    ...second.slice(1).map((c) => paint(c, { tone: 'explored' }))]));

  // dfs가 끝나고 가장 짧은 길(best)을 반으로 나눠 돌려준다
  running = false;
  stack.length = 0;
  if (calls !== DFS_CALLS) throw new Error(`그림이 센 dfs 호출 수 ${calls}가 코드를 돌린 수 ${DFS_CALLS}와 다릅니다`);
  rec.step({ title: `최단 ${best}칸 확정`, codeHighlights: at.done, ...meta(), answer: best / 2, isKeyframe: true });
  rec.phase('결과 확인', `dfs가 끝났습니다. 가장 짧은 길 ${josa(best, '을', '를')} 반으로 나눈 ${josa(best / 2, '이', '가')} 실제 최단 거리입니다.`, at.done);
  rec.do({ type: 'trace', id: 'path', points: first.map((c) => mid(sp, c)) },
    ...together([
      ...first.map((c, i) => paint(c, { tone: 'path', text: String(i) })),
      { type: 'set', id: 'trail', patch: { points: [] } },
      { type: 'set', id: 'best', patch: { tone: 'good' } },
      ...lane.ids.map((id): Action => ({ type: 'remove', id, into: cid(start) })), // dfs가 끝나 출발 칸의 호출도 스택에서 빠진다
    ], true));
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'item-pickup',
  title: '아이템 줍기',
  level: 3,
  category: 'dfs-bfs',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/87694',
  description: {
    summary:
      '직사각형 여러 개가 겹쳐 하나의 다각형 땅을 이룹니다. 캐릭터는 이 땅의 가장 바깥 테두리를 따라서만 걸을 수 있습니다. 테두리 위의 캐릭터 위치에서 아이템 위치까지 가는 가장 짧은 거리를 구합니다. 겹쳐서 땅 안쪽에 들어간 선은 걸을 수 없습니다.',
    rules: [
      '직사각형은 1개 이상 4개 이하',
      '직사각형은 [왼쪽 아래 x, 왼쪽 아래 y, 오른쪽 위 x, 오른쪽 위 y]이고 모든 좌표는 1 이상 50 이하의 자연수',
      '서로 다른 두 직사각형이 x 좌표나 y 좌표를 같게 갖는 경우는 없음',
      '캐릭터와 아이템은 다각형 테두리 위의 서로 다른 점',
      '좌표 한 칸을 가는 거리가 1',
    ],
    examples: [
      { input: 'rectangle = [[1,1,7,4],[3,2,5,5],[4,3,6,9],[2,6,8,8]], characterX = 1, characterY = 3, itemX = 7, itemY = 8', output: '17' },
      { input: 'rectangle = [[1,1,8,4],[2,2,4,9],[3,6,9,8],[6,3,7,7]], characterX = 9, characterY = 7, itemX = 6, itemY = 1', output: '11' },
      { input: 'rectangle = [[1,1,5,7]], characterX = 1, characterY = 1, itemX = 4, itemY = 7', output: '9' },
      { input: 'rectangle = [[2,1,7,5],[6,4,10,10]], characterX = 3, characterY = 1, itemX = 7, itemY = 10', output: '15' },
      { input: 'rectangle = [[2,2,5,5],[1,3,6,4],[3,1,4,6]], characterX = 1, characterY = 4, itemX = 6, itemY = 3', output: '10' },
    ],
  },
  keyIntuitions: [
    '테두리만 걸을 수 있으니 테두리 칸을 길(1), 안쪽을 못 가는 곳(2)으로 칠한 판에서 BFS로 가장 짧은 거리를 구합니다.',
    '좌표를 그대로 쓰면 안쪽으로 지워진 선을 사이에 둔 두 테두리 칸이 바로 이웃이 되어 잘못 건널 수 있습니다. 모든 좌표를 두 배로 늘리면 그 사이에 칸이 하나 생겨 지워진 선이 제대로 막습니다.',
    '두 배로 늘린 판에서 한 칸은 원래 거리의 절반이므로, 구한 거리를 2로 나눈 값이 답입니다.',
  ],
  demo: { input: [RECTS, CHARACTER[0], CHARACTER[1], ITEM[0], ITEM[1]], label: 'rectangle = [[1,1,3,4],[2,2,4,3]], 캐릭터 (3, 1), 아이템 (3, 3)' },
  workUnit: '칸을 밟은 횟수',
  approaches: [
    {
      id: 'pickup-bfs',
      name: '너비 우선 탐색 (BFS, 좌표 두 배)',
      rank: 'BEST',
      timeComplexity: 'O(C²) (C: 두 배로 늘린 좌표 범위, 최대 100)',
      spaceComplexity: 'O(C²)',
      verdict: '좌표를 두 배로 늘려 안쪽 선을 막고, BFS로 가까운 칸부터 찾는 표준 풀이입니다.',
      pros: [
        '좌표를 두 배로 늘려 두 직사각형의 테두리가 바로 이웃하는 일이 없어, 지워진 안쪽 선을 잘못 건너지 않습니다.',
        '도착 칸을 처음 꺼내는 순간이 최단 거리라 길이 갈라져도 반대 방향까지 다 걸어 볼 필요가 없습니다.',
        '판 크기가 102 × 102뿐이라 칸마다 한 번씩만 큐에 넣어 충분히 빠릅니다.',
      ],
      cons: ['판이 네 배 커지고, 답을 낼 때 거리를 2로 나누는 것을 잊기 쉽습니다.'],
      whyThisRank:
        '이 문제의 핵심은 "좌표 두 배"로 테두리만 길이 되게 만드는 것이고, 그 위에서 최단 거리는 BFS가 가장 단순합니다. 길이 갈라져도 한 번 훑으면 끝납니다.',
      code: BFS,
      visualize: () => breadthFirst(2),
    },
    {
      id: 'pickup-dfs',
      name: '깊이 우선 탐색 (두 방향 모두 걸어 보기)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(C²) (길마다 끝까지 확인)',
      spaceComplexity: 'O(둘레) 재귀 깊이',
      verdict: '정답은 나오지만 도착해도 멈추지 못하고 반대 방향까지 끝까지 걸어야 합니다.',
      pros: ['테두리가 고리 하나라 길이 둘뿐이어서, 두 방향을 모두 걸어 보고 짧은 쪽을 고르면 정답입니다.', '큐 없이 재귀와 되돌리기만으로 짧게 쓸 수 있습니다.'],
      cons: [
        '먼저 닿은 길이 짧다는 보장이 없어 반대 방향까지 끝까지 걸어야 합니다. 시각화 입력에서는 칸을 25번 밟는데 BFS는 16번이면 끝납니다.',
        '둘레가 길어지면 재귀가 깊어져 Python 기본 재귀 한도(1,000)를 넘길 수 있습니다.',
        '길이 여러 갈래로 갈라지는 문제로 바뀌면 시도할 길이 지수적으로 늘어납니다.',
      ],
      whyThisRank:
        '맞게는 풀지만 BFS가 가까운 칸부터 한 번씩만 보며 끝내는 일을, 길 하나를 끝까지 가고 되돌아와 다시 가는 방식으로 합니다. 최단 거리는 BFS가 더 알맞습니다.',
      code: DFS,
      visualize: depthFirst,
    },
    {
      id: 'pickup-wrong',
      name: '좌표를 두 배로 늘리지 않은 BFS',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(C²)',
      spaceComplexity: 'O(C²)',
      verdict: '코드는 정석과 거의 같지만 지워진 안쪽 선을 건너 더 짧은 오답이 나옵니다.',
      pros: ['판이 절반 크기라 코드가 조금 더 짧고 거리를 나눌 필요도 없습니다.'],
      cons: [
        '안쪽으로 지워진 선 양쪽의 테두리 칸이 바로 이웃이 되어 갈 수 없는 길을 건넙니다. 시각화 입력에서는 (3, 2)에서 (3, 3)으로 건너 4번 가야 할 길을 2번에 갑니다.',
        '직사각형 폭이 1인 부분처럼 선끼리 가까운 입력에서만 틀려서, 예제만 통과하고 채점에서 떨어지기 쉽습니다.',
      ],
      whyThisRank:
        '좌표를 그대로 쓰면 두 테두리 사이에 칸이 없어 "지워진 선"이 길을 막지 못합니다. 이 문제에서 BFS만큼 중요한 것이 좌표를 두 배로 늘리는 일입니다.',
      code: WRONG,
      visualize: () => breadthFirst(1),
    },
  ],
  checks: {
    cases: [
      { args: [[[1, 1, 7, 4], [3, 2, 5, 5], [4, 3, 6, 9], [2, 6, 8, 8]], 1, 3, 7, 8], expected: 17 },
      { args: [[[1, 1, 8, 4], [2, 2, 4, 9], [3, 6, 9, 8], [6, 3, 7, 7]], 9, 7, 6, 1], expected: 11 },
      { args: [[[1, 1, 5, 7]], 1, 1, 4, 7], expected: 9 },
      { args: [[[2, 1, 7, 5], [6, 4, 10, 10]], 3, 1, 7, 10], expected: 15 },
      { args: [[[2, 2, 5, 5], [1, 3, 6, 4], [3, 1, 4, 6]], 1, 4, 6, 3], expected: 10 },
      { args: [[[1, 1, 2, 2]], 1, 1, 2, 2], expected: 2 },
      { args: [[[1, 1, 3, 3]], 1, 1, 1, 2], expected: 1 },
      { args: [RECTS, CHARACTER[0], CHARACTER[1], ITEM[0], ITEM[1]], expected: TRUTH },
    ],
    // 직사각형 1~3개를 좌표 1~6에서 고른다(모든 x와 모든 y가 서로 다름). 안쪽과 바깥이 각각 하나로 이어진(구멍 없는 하나의 다각형) 모양이 나올 때까지 다시 뽑고, 캐릭터와 아이템은 테두리 위의 서로 다른 점에서 고른다
    random: (rand) => {
      const connected = (B: number[][], v: number) => {
        const all = B.flatMap((col, x) => col.flatMap((c, y) => (c === v ? [[x, y] as Cell] : [])));
        const seen = new Set([key(all[0])]);
        const todo = [all[0]];
        for (let head = 0; head < todo.length; head++) {
          for (let d = 0; d < 4; d++) {
            const n = around(todo[head], d);
            if (B[n[0]]?.[n[1]] === v && !seen.has(key(n))) {
              seen.add(key(n));
              todo.push(n);
            }
          }
        }
        return seen.size === all.length;
      };
      const pick = (n: number) => {
        const pool = [1, 2, 3, 4, 5, 6];
        return Array.from({ length: n }, () => pool.splice(Math.floor(rand() * pool.length), 1)[0]).sort((a, b) => a - b);
      };
      for (;;) {
        const n = 1 + Math.floor(rand() * 3);
        const [xs, ys] = [pick(2 * n), pick(2 * n)];
        const order = (v: number[]) => v.map((x, i) => [x, i] as const).sort(() => rand() - 0.5).map(([x]) => x); // 직사각형마다 두 좌표를 섞어 짝짓는다
        const [xo, yo] = [order(xs), order(ys)];
        const rects = Array.from({ length: n }, (_, i) => [Math.min(xo[2 * i], xo[2 * i + 1]), Math.min(yo[2 * i], yo[2 * i + 1]), Math.max(xo[2 * i], xo[2 * i + 1]), Math.max(yo[2 * i], yo[2 * i + 1])]);
        const B = build(2, rects, 6);
        if (!connected(B, 2) || !connected(B, 0)) continue;
        const ring = B.flatMap((col, x) => col.flatMap((c, y) => (c === 1 && x % 2 === 0 && y % 2 === 0 ? [[x / 2, y / 2] as Cell] : [])));
        const [a, b] = [ring.splice(Math.floor(rand() * ring.length), 1)[0], ring[Math.floor(rand() * ring.length)]];
        return [rects, a[0], a[1], b[0], b[1]];
      }
    },
  },
};

export default problem;
