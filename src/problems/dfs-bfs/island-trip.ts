// 무인도 여행: 정석 BFS 영역 나누기, 대안 DFS 영역 나누기, 함정 BFS(큐에서 꺼낼 때 방문 표시)를 같은 지도에서 움직인다.
// 장면은 위에 줄(큐·스택), 가운데에 4×5 지도(바다 X는 빗금, 땅은 먹을 수 있는 날짜), 아래에 지금 섬의 합 표시와 답 줄(섬마다 합이 쌓임)이다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { grid } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Problem, Rect, Scene, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';
import { fit } from './pacing.ts';

type Cell = [number, number];
interface Probe { to: Cell; verdict: Verdict }

// 시각화 입력: 원문 예제 1. 땅 10칸이 섬 3개(합 27, 1, 1)다.
// 큐에서 꺼낼 때 방문 표시를 하는 함정은 (2, 3)을 큐에 두 번 넣어 1을 두 번 더해 27 대신 28을 낸다.
const MAPS = ['X591X', 'X1X5X', 'X231X', '1XXX1'];
const N = MAPS.length;
const M = MAPS[0].length;
const DIRS: Cell[] = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 상, 하, 좌, 우(세 풀이 코드와 같은 순서)

const key = ([r, c]: Cell) => `${r},${c}`;
const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
const inBoard = ([r, c]: Cell) => r >= 0 && r < N && c >= 0 && c < M;
const isLand = ([r, c]: Cell) => MAPS[r][c] !== 'X';
const value = ([r, c]: Cell) => Number(MAPS[r][c]);
const around = (c: Cell): Cell[] => DIRS.map(([dr, dc]): Cell => [c[0] + dr, c[1] + dc]).filter(inBoard);
const cid = (c: Cell) => `cell:${key(c)}`;
const fmt = ([r, c]: Cell) => `(${r}, ${c})`;
const listText = (xs: number[]) => `[${xs.join(', ')}]`;
const byValue = (xs: number[]) => xs.map((v, k) => [v, k] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([, k]) => k); // 값이 작은 순서로 본 원래 번호

// 땅 칸을 왼쪽 위부터 훑는 차례와, 그 차례로 만나는 섬(첫 땅 번호가 앞선 섬부터)
const LANDS: Cell[] = MAPS.flatMap((row, r) => [...row].flatMap((ch, c): Cell[] => (ch === 'X' ? [] : [[r, c]])));
const SUMS: number[] = [];
const STARTS: Cell[] = [];
{
  const seen = new Set<string>();
  for (const start of LANDS) {
    if (seen.has(key(start))) continue;
    const island = [start];
    seen.add(key(start));
    for (let head = 0; head < island.length; head++) {
      for (const n of around(island[head])) {
        if (isLand(n) && !seen.has(key(n))) {
          seen.add(key(n));
          island.push(n);
        }
      }
    }
    STARTS.push(start);
    SUMS.push(island.reduce((s, c) => s + value(c), 0));
  }
}
const SORTED = [...SUMS].sort((a, b) => a - b);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BFS = {
  python: `from collections import deque

def solution(maps):
    n, m = len(maps), len(maps[0])
    visited = [[False] * m for _ in range(n)]
    answer = []

    for i in range(n):
        for j in range(m):
            if maps[i][j] == 'X' or visited[i][j]:
                continue  # 바다이거나 이미 센 섬의 땅
            total = 0
            visited[i][j] = True
            queue = deque([(i, j)])
            while queue:
                x, y = queue.popleft()
                total += int(maps[x][y])
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and not visited[nx][ny]:
                        visited[nx][ny] = True  # 큐에 넣을 때 방문 표시
                        queue.append((nx, ny))
            answer.append(total)

    return sorted(answer) if answer else [-1]`,
  javascript: `function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const answer = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (maps[i][j] === 'X' || visited[i][j]) continue; // 바다이거나 이미 센 섬의 땅
      let total = 0;
      visited[i][j] = true;
      const queue = [[i, j]];
      let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
      while (head < queue.length) {
        const [x, y] = queue[head++];
        total += Number(maps[x][y]);
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && !visited[nx][ny]) {
            visited[nx][ny] = true; // 큐에 넣을 때 방문 표시
            queue.push([nx, ny]);
          }
        }
      }
      answer.push(total);
    }
  }

  return answer.length ? answer.sort((a, b) => a - b) : [-1];
}`,
};
const BFS_AT = {
  found: lines(BFS, ["if maps[i][j] == 'X' or visited[i][j]", 'total = 0', 'visited[i][j] = True', 'queue = deque([(i, j)])'],
    ["if (maps[i][j] === 'X' || visited[i][j]) continue", 'let total = 0', 'visited[i][j] = true', 'const queue = [[i, j]]']),
  pop: lines(BFS, ['x, y = queue.popleft()', 'total += int(maps[x][y])'], ['const [x, y] = queue[head++]', 'total += Number(maps[x][y])']),
  look: lines(BFS, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m'], ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m']),
  enqueue: lines(BFS, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m', 'visited[nx][ny] = True'],
    ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m', 'visited[nx][ny] = true']),
  push: lines(BFS, ['queue.append((nx, ny))'], ['queue.push([nx, ny])']),
  next: lines(BFS, ['while queue:'], ['while (head < queue.length)']),
  record: lines(BFS, ['answer.append(total)'], ['answer.push(total)']),
  done: lines(BFS, ['return sorted(answer) if answer else [-1]'], ['return answer.length ? answer.sort']),
};

const DFS = {
  python: `def solution(maps):
    n, m = len(maps), len(maps[0])
    visited = [[False] * m for _ in range(n)]
    answer = []
    total = 0

    def dfs(x, y):
        nonlocal total
        visited[x][y] = True
        total += int(maps[x][y])
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and not visited[nx][ny]:
                dfs(nx, ny)  # 이어진 땅으로 파고듭니다

    for i in range(n):
        for j in range(m):
            if maps[i][j] != 'X' and not visited[i][j]:
                total = 0
                dfs(i, j)
                answer.append(total)

    return sorted(answer) if answer else [-1]`,
  javascript: `function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const answer = [];
  let total = 0;

  const dfs = (x, y) => {
    visited[x][y] = true;
    total += Number(maps[x][y]);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && !visited[nx][ny]) {
        dfs(nx, ny); // 이어진 땅으로 파고듭니다
      }
    }
  };

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (maps[i][j] !== 'X' && !visited[i][j]) {
        total = 0;
        dfs(i, j);
        answer.push(total);
      }
    }
  }

  return answer.length ? answer.sort((a, b) => a - b) : [-1];
}`,
};
const DFS_AT = {
  found: lines(DFS, ["if maps[i][j] != 'X' and not visited[i][j]", '                total = 0', 'dfs(i, j)'],
    ["if (maps[i][j] !== 'X' && !visited[i][j])", '        total = 0;', 'dfs(i, j)']),
  enter: lines(DFS, ['visited[x][y] = True', 'total += int(maps[x][y])'], ['visited[x][y] = true', 'total += Number(maps[x][y])']),
  look: lines(DFS, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m'], ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m']),
  back: lines(DFS, ['for dx, dy in'], ['for (const [dx, dy] of']),
  record: lines(DFS, ['answer.append(total)'], ['answer.push(total)']),
  done: lines(DFS, ['return sorted(answer) if answer else [-1]'], ['return answer.length ? answer.sort']),
};

const WRONG = {
  python: `# 주의: 오답이 나오는 풀이입니다 (큐에서 꺼낼 때 방문 표시를 해서 같은 칸이 큐에 두 번 들어갈 수 있습니다)
from collections import deque

def solution(maps):
    n, m = len(maps), len(maps[0])
    visited = [[False] * m for _ in range(n)]
    answer = []

    for i in range(n):
        for j in range(m):
            if maps[i][j] == 'X' or visited[i][j]:
                continue  # 바다이거나 이미 센 섬의 땅
            total = 0
            queue = deque([(i, j)])
            while queue:
                x, y = queue.popleft()
                visited[x][y] = True  # 꺼낼 때 방문 표시: 그 전에 같은 칸이 또 큐에 들어올 수 있습니다
                total += int(maps[x][y])
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and not visited[nx][ny]:
                        queue.append((nx, ny))
            answer.append(total)

    return sorted(answer) if answer else [-1]`,
  javascript: `// 주의: 오답이 나오는 풀이입니다 (큐에서 꺼낼 때 방문 표시를 해서 같은 칸이 큐에 두 번 들어갈 수 있습니다)
function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const answer = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (maps[i][j] === 'X' || visited[i][j]) continue; // 바다이거나 이미 센 섬의 땅
      let total = 0;
      const queue = [[i, j]];
      let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
      while (head < queue.length) {
        const [x, y] = queue[head++];
        visited[x][y] = true; // 꺼낼 때 방문 표시: 그 전에 같은 칸이 또 큐에 들어올 수 있습니다
        total += Number(maps[x][y]);
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && !visited[nx][ny]) {
            queue.push([nx, ny]);
          }
        }
      }
      answer.push(total);
    }
  }

  return answer.length ? answer.sort((a, b) => a - b) : [-1];
}`,
};
const WRONG_AT = {
  found: lines(WRONG, ["if maps[i][j] == 'X' or visited[i][j]", 'total = 0', 'queue = deque([(i, j)])'],
    ["if (maps[i][j] === 'X' || visited[i][j]) continue", 'let total = 0', 'const queue = [[i, j]]']),
  pop: lines(WRONG, ['x, y = queue.popleft()', 'visited[x][y] = True', 'total += int(maps[x][y])'],
    ['const [x, y] = queue[head++]', 'visited[x][y] = true', 'total += Number(maps[x][y])']),
  look: lines(WRONG, ['for dx, dy in', 'if 0 <= nx < n and 0 <= ny < m'], ['for (const [dx, dy] of', 'if (nx >= 0 && nx < n && ny >= 0 && ny < m']),
  enqueue: lines(WRONG, ['for dx, dy in', 'queue.append((nx, ny))'], ['for (const [dx, dy] of', 'queue.push([nx, ny])']),
  push: lines(WRONG, ['queue.append((nx, ny))'], ['queue.push([nx, ny])']),
  next: lines(WRONG, ['while queue:'], ['while (head < queue.length)']),
  record: lines(WRONG, ['answer.append(total)'], ['answer.push(total)']),
  done: lines(WRONG, ['return sorted(answer) if answer else [-1]'], ['return answer.length ? answer.sort']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로 0~330, 세로: 줄 0~40, 지도 칸 y 58~298(54px 칸, 간격 8), 지금 섬 합 표시 310~340(오답 비교 표시가 오른쪽에 붙음), 답 줄 346~386.
const W = 330;
const H = 392;
const cellRect = grid({ x: 14, y: 58, rows: N, cols: M, cell: 54, gap: 8 });
const rectOf = (c: Cell): Rect => cellRect(c[0], c[1]);
const LANE: LaneOptions = { id: 'lane', x: 40, y: 5, slotW: 64, slotH: 30, gap: 6, max: 4 };
const ANSWER: LaneOptions = { id: 'ans', x: 40, y: 351, slotW: 50, slotH: 30, gap: 6, max: 4 };
const TOTAL_RECT: Rect = { x: 0, y: 310, w: 84, h: 30 };
const VERDICT_LABEL = { wall: '바다', seen: '방문함', new: '새 땅', bad: '큐에 또 넣음', good: '' } as const;

// 세 풀이가 같이 쓰는 장면: 줄 이름표와 바탕, 지도(바다는 빗금, 땅은 날짜), 지금 섬 합, 답 줄 이름표와 바탕
function board(lane: '큐' | '스택'): Scene {
  const items: Item[] = [
    { id: 'lane:label', kind: 'text', rect: { x: 0, y: 0, w: 34, h: 40 }, text: lane },
    { id: 'lane:bg', kind: 'zone', rect: { x: 34, y: 0, w: W - 34, h: 40 } },
  ];
  MAPS.forEach((row, r) => [...row].forEach((ch, c) => {
    items.push({ id: cid([r, c]), kind: 'cell', rect: rectOf([r, c]), tone: ch === 'X' ? 'wall' : 'plain', ...(ch === 'X' ? {} : { text: ch }) });
  }));
  items.push(
    { id: 'total', kind: 'token', rect: TOTAL_RECT, tone: 'plain', text: '섬 합 0' },
    { id: 'ans:label', kind: 'text', rect: { x: 0, y: 346, w: 34, h: 40 }, text: '답' },
    { id: 'ans:bg', kind: 'zone', rect: { x: 34, y: 346, w: W - 34, h: 40 } },
  );
  return { width: W, height: H, items };
}

const paint = (c: Cell, patch: ItemPatch, pop = false): Extract<Action, { type: 'set' }> => ({ type: 'set', id: cid(c), patch, ...(pop ? { pop } : {}) });
const clear = (): Action[] => [{ type: 'unfocus' }, { type: 'clearMarks' }];
const setTotal = (total: number): Action => ({ type: 'set', id: 'total', patch: { text: `섬 합 ${total}` }, pop: true });

// from에서 probes의 칸마다 화살표를 긋는다. 새 땅은 onNew의 동작을 화살표와 같이 한다. 흐림과 화살표는 다음 마디에서 걷는다
function probeAt(rec: StepRecorder, from: Cell, probes: Probe[], onNew: (p: Probe) => Action[] = () => []) {
  rec.do({ type: 'focus', ids: [cid(from), ...probes.map((p) => cid(p.to))] });
  for (const p of probes) {
    rec.do({ type: 'arrow', from: cid(from), to: cid(p.to), verdict: p.verdict, label: VERDICT_LABEL[p.verdict] });
    if (p.verdict === 'new') for (const a of onNew(p)) rec.do({ ...a, together: true });
  }
}

// 훑다가 새 섬의 첫 땅을 만났다는 말
const findText = (start: Cell, first: boolean) =>
  `${first ? '지도를 왼쪽 위부터 훑다가 ' : '이어서 훑다가 '}${fmt(start)}에서 아직 안 센 땅을 만났습니다. 새 섬이라 total을 0으로 하고`;

// 답 줄에 섬 합을 쌓고(지금 섬 합 표시에서 날아옴), 마지막에 오름차순으로 정렬한다
const ansId = (k: number) => `ans:${k}`;
// 마지막 단계의 변수: 정렬해 돌려줄 값을 더한다(Python의 sorted는 answer를 그대로 두고, JavaScript의 sort는 answer를 바꾸므로 따로 보인다)
const withReturn = <T extends { variables: Record<string, string | number> }>(m: T, sorted: number[]): T => ({ ...m, variables: { ...m.variables, '돌려줄 값': listText(sorted) } });

/* ------------------------------------------------------------------ */
/* 정석 BFS · 함정 BFS(꺼낼 때 방문 표시): 찾기 → 꺼내기 → 살피기 → 넣기 → 기록하기 */
/* ------------------------------------------------------------------ */

// trap이면 큐에서 꺼낼 때 방문 표시를 한다. 그러면 큐에 든 칸이 또 큐에 들어갈 수 있고, 두 번 꺼낼 때마다 합에 더한다.
function layered(trap: boolean): Visualization {
  const AT = trap ? WRONG_AT : BFS_AT;
  const rec = new StepRecorder(board('큐'));
  const lane = new Lane(rec, LANE);
  const ans = new Lane(rec, ANSWER);
  const visited = MAPS.map((row) => [...row].map(() => false));
  const popped = new Set<string>(); // 꺼낸 적 있는 칸(함정이 같은 칸을 두 번 꺼내는지 알아보는 데 쓴다)
  const queue: { cell: Cell; id: string }[] = []; // 큐에 든 칸(꺼낼 차례대로). 토큰 id는 넣을 때마다 새로 붙인다
  const answer: number[] = [];
  let total = 0;
  let scan: Cell | undefined; // 지금 훑고 있는 섬의 첫 땅
  let pops = 0;
  let seq = 0;
  let last: Cell | undefined; // 바로 전에 꺼낸 칸
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = (cur?: Cell) => ({
    work: pops,
    variables: {
      '(i, j)': scan ? fmt(scan) : '-',
      '(x, y)': cur ? fmt(cur) : '-',
      total,
      queue: `[${queue.map((q) => fmt(q.cell)).join(', ')}]`,
      answer: listText(answer),
    },
  });
  const entry = (cell: Cell) => ({ cell, id: `tok:${key(cell)}:${++seq}` });
  const copies = (cell: Cell) => queue.filter((q) => same(q.cell, cell)).length;

  STARTS.forEach((start, k) => {
    // 찾기: 훑다가 새 섬의 첫 땅을 만나 큐에 넣는다
    scan = start;
    total = 0;
    const first = entry(start);
    queue.push(first);
    if (!trap) visited[start[0]][start[1]] = true;
    rec.step({ title: `${fmt(start)}에서 새 섬 발견`, codeHighlights: AT.found, ...meta() });
    rec.phase('찾기', `${findText(start, k === 0)} 큐에 넣습니다.`, AT.found);
    rec.do({ type: 'focus', ids: [cid(start)] }, ...together([paint(start, { tone: 'queued' }, true), ...(k ? [setTotal(0)] : [])], true), { type: 'unfocus' });
    lane.push({ id: first.id, text: fmt(start) }, cid(start));

    while (queue.length) {
      const { cell: cur } = queue.shift()!;
      pops++;
      const again = popped.has(key(cur)); // (함정) 이미 센 칸을 또 꺼냄
      popped.add(key(cur));
      if (trap) visited[cur[0]][cur[1]] = true;
      total += value(cur);
      const probes = around(cur).map((to): Probe => ({
        to,
        verdict: !isLand(to) ? 'wall' : visited[to[0]][to[1]] ? 'seen' : trap && copies(to) ? 'bad' : 'new',
      }));
      const fresh = probes.filter((p) => p.verdict === 'new' || p.verdict === 'bad').map((p) => p.to);
      const added = fresh.map(entry);
      for (const e of added) if (!trap) visited[e.cell[0]][e.cell[1]] = true;
      queue.push(...added);
      const end = queue.length === 0; // 이 섬의 마지막 칸
      if (end) answer.push(total);

      rec.step({
        title: again ? `${fmt(cur)} 또 꺼내기 — 합 ${total}` : fresh.length ? `${fmt(cur)} 꺼내고 ${fresh.length}칸 넣기` : `${fmt(cur)} 꺼내기 — 넣을 칸 없음`,
        codeHighlights: end ? AT.record : fresh.length ? AT.push : AT.next,
        ...meta(cur),
      });
      rec.phase('꺼내기', again
        ? `큐 맨 앞에서 ${josa(fmt(cur), '을', '를')} 또 꺼냅니다. 이미 센 칸인데 날짜 ${josa(value(cur), '을', '를')} 다시 더해, 합이 ${total}이 됩니다.`
        : `큐 맨 앞에서 ${josa(fmt(cur), '을', '를')} 꺼내${trap ? ' 방문 표시를 하고' : ''} 날짜 ${josa(value(cur), '을', '를')} 더합니다. 합은 ${total}입니다.`, AT.pop);
      lane.shift(cid(cur));
      rec.do(...together([paint(cur, { tone: 'current', sub: '' }), setTotal(total), ...(last && !same(last, cur) ? [paint(last, { tone: 'visited' })] : [])], true));
      const dups = probes.filter((p) => p.verdict === 'bad').map((p) => fmt(p.to));
      rec.phase('살피기', dups.length
        ? `상하좌우 칸을 하나씩 확인합니다. ${josa(dups.join(', '), '은', '는')} 이미 큐에 있지만 방문 표시가 없어서 또 넣을 칸이 됩니다.`
        : `상하좌우 칸을 하나씩 확인합니다. 바다이거나 이미 방문한 칸은 건너뛰고${
          fresh.length ? (trap ? ', 방문 표시가 없는 땅은 모두 큐에 넣습니다.' : ', 새 땅에는 방문 표시를 합니다.') : ' 넘어갑니다.'}`,
      fresh.length ? AT.enqueue : AT.look);
      probeAt(rec, cur, probes, (p) => [paint(p.to, { tone: 'queued' }, true)]);
      for (const p of probes.filter((q) => q.verdict === 'bad')) rec.do({ ...paint(p.to, { sub: `${copies(p.to)}번` }, true), together: true });
      rec.phase('넣기', fresh.length
        ? `${dups.length ? '중복이어도 ' : trap ? '방문 표시가 아직 없어서 ' : '새로 찾은 '}${josa(fresh.map(fmt).join(', '), '을', '를')} 큐 뒤에 넣습니다.`
        : '새로 넣을 칸이 없어 그대로 넘어갑니다.', fresh.length ? AT.push : AT.next);
      if (added.length) {
        added.forEach((e, i) => {
          lane.push({ id: e.id, text: fmt(e.cell) }, cid(e.cell));
          if (!i) rec.do(...together(clear(), true)); // 흐림과 화살표 걷기는 첫 토큰이 날아가는 것과 같이
        });
      } else {
        rec.do(...together(clear()));
      }
      last = cur;
      if (end) {
        rec.phase('기록하기', `큐가 비어 이 섬이 끝났습니다. 합 ${josa(total, '을', '를')} answer에 담습니다.`, AT.record);
        rec.do(paint(cur, { tone: 'visited' }));
        ans.push({ id: ansId(answer.length - 1), text: String(total) }, 'total');
        scan = undefined;
      }
    }
  });

  // 오름차순으로 정렬해 돌려준다
  const order = byValue(answer);
  const sorted = order.map((k) => answer[k]);
  rec.step({ title: `답 정렬 — ${listText(sorted)}`, codeHighlights: AT.done, ...withReturn(meta(), sorted), answer: sorted, isKeyframe: true });
  rec.phase('정렬하기', `answer를 오름차순으로 정렬하면 ${josa(listText(sorted), '이', '가')} 됩니다.`, AT.done);
  ans.reorder(order.map(ansId));
  if (trap) {
    rec.phase('오답 확인', `정답은 ${listText(SORTED)}인데 ${josa(listText(sorted), '이', '가')} 나왔습니다. 큐에 든 칸을 또 넣어 날짜를 두 번 더했기 때문입니다.`);
    rec.do({ type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 92, y: 310, w: 114, h: 30 }, tone: 'bad', text: `내 답 ${sorted.join(',')}` } },
      { type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 212, y: 310, w: 114, h: 30 }, tone: 'good', text: `정답 ${SORTED.join(',')}` }, together: true });
  }
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 DFS: 찾기 → 들어가기 → 살피기 → 돌아가기 → 기록하기                   */
/* ------------------------------------------------------------------ */

// dfs를 코드와 똑같이 돌려, 들어감과 돌아옴을 일어난 차례로 모은다. 살핀 결과(looks)는 그 뒤 첫 사건에 붙는다.
interface Ev { kind: 'enter' | 'return'; cell: Cell; parent?: Cell; looks: Probe[]; total: number }
function dfsEvents(): Ev[] {
  const visited = MAPS.map((row) => [...row].map(() => false));
  const events: Ev[] = [];
  let total = 0;
  let cur!: Ev;
  const dfs = (c: Cell, parent?: Cell) => {
    visited[c[0]][c[1]] = true;
    total += value(c);
    cur = { kind: 'enter', cell: c, parent, looks: [], total };
    events.push(cur);
    for (const n of around(c)) {
      if (!isLand(n)) {
        cur.looks.push({ to: n, verdict: 'wall' });
      } else if (visited[n[0]][n[1]]) {
        cur.looks.push({ to: n, verdict: 'seen' });
      } else {
        cur.looks.push({ to: n, verdict: 'new' });
        dfs(n, c);
        cur = { kind: 'return', cell: n, parent: c, looks: [], total }; // n에서 돌아와 c가 이어서 살핀다
        events.push(cur);
      }
    }
  };
  for (const start of LANDS) {
    if (visited[start[0]][start[1]]) continue;
    total = 0;
    dfs(start);
    events.push({ kind: 'return', cell: start, looks: [], total }); // 맨 위 호출이 끝나고 answer에 담는다
  }
  return events;
}

function depthFirst(): Visualization {
  const rec = new StepRecorder(board('스택'));
  const lane = new Lane(rec, { ...LANE, foldable: true });
  const ans = new Lane(rec, ANSWER);
  const stack: Cell[] = [];
  const answer: number[] = [];
  let total = 0;
  let calls = 0;
  let deepest = 0;
  let scan: Cell | undefined;
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({
    work: calls,
    workNote: `재귀 깊이 최대 ${deepest}`,
    variables: { '(i, j)': scan ? fmt(scan) : '-', '(x, y)': stack.length ? fmt(stack.at(-1)!) : '-', total, answer: listText(answer) },
  });
  const token = (c: Cell) => ({ id: `frame:${key(c)}`, text: fmt(c) });
  // 순서대로 본 결과 글. 칸 이름이 '(2, 3)은'처럼 숫자로 끝나 josa로 조사를 고른다
  const talk = (probes: Probe[]) => `${probes.map((p, i) => {
    const end = i === probes.length - 1;
    const name = (x: string, a: string, b: string) => josa(fmt(p.to), a, b) + x;
    if (p.verdict === 'wall') return name(end ? ' 바다라 건너뜁니다' : ' 바다이고', '은', '는');
    if (p.verdict === 'seen') return name(end ? ' 이미 방문해 건너뜁니다' : ' 이미 방문했고', '은', '는');
    return name(' 아직 안 간 땅이라 들어갑니다', '은', '는');
  }).join(', ')}.`;

  const events = dfsEvents();
  // 살필 새 땅이 없어 바로 또 돌아오는 사건들은 한 단계로 묶는다(스택이 연달아 비워지는 모습). 한 단계에는 최대 3칸
  const groups: Ev[][] = [];
  for (const ev of events) {
    const prev = groups.at(-1)?.at(-1);
    const chain = ev.kind === 'return' && prev?.kind === 'return' && prev.parent !== undefined && !prev.looks.some((l) => l.verdict === 'new') && groups.at(-1)!.length < 3;
    if (chain) groups.at(-1)!.push(ev);
    else groups.push([ev]);
  }

  groups.forEach((group) => {
    const [head] = group;
    if (head.kind === 'enter') {
      const { cell, parent, looks } = head;
      const root = parent === undefined;
      stack.push(cell);
      calls++;
      deepest = Math.max(deepest, stack.length);
      total = head.total;
      if (root) scan = cell;
      rec.step({ title: root ? `${fmt(cell)}에서 새 섬 발견` : `${fmt(cell)} 들어가기`, codeHighlights: looks.length ? DFS_AT.look : DFS_AT.enter, ...meta() });
      if (root) {
        rec.phase('찾기', `${findText(cell, answer.length === 0)} dfs로 들어갑니다.`, DFS_AT.found);
        rec.do({ type: 'focus', ids: [cid(cell)] }, ...(answer.length ? [{ ...setTotal(0), together: true }] : []), { type: 'unfocus' });
      }
      rec.phase('들어가기', root
        ? `방문 표시를 하고 날짜 ${josa(value(cell), '을', '를')} 더합니다. 합은 ${total}입니다.`
        : `${fmt(parent!)}에서 이어진 ${fmt(cell)}에 들어갑니다. 방문 표시를 하고 날짜 ${josa(value(cell), '을', '를')} 더해 합은 ${total}입니다.`, DFS_AT.enter);
      rec.do(...together([paint(cell, { tone: 'current' }, true), setTotal(total), ...(parent ? [paint(parent, { tone: 'trail' })] : [])]));
      lane.push(token(cell), cid(cell));
      if (looks.length) {
        rec.phase('살피기', `상하좌우 칸을 차례로 봅니다. ${talk(looks)}`, DFS_AT.look);
        probeAt(rec, cell, looks);
      }
    } else {
      const last = group.at(-1)!;
      const root = last.parent === undefined;
      const resumes = last.looks.some((l) => l.verdict === 'new');
      group.forEach(() => stack.pop());
      if (root) answer.push(total);
      rec.step({
        title: root ? `${fmt(last.cell)} 끝 — 섬 합 ${total}` : `${group.map((e) => fmt(e.cell)).join(', ')} 끝, ${ro(fmt(last.parent!))} 돌아가기`,
        codeHighlights: root ? DFS_AT.record : resumes ? DFS_AT.look : DFS_AT.back,
        ...meta(),
      });
      rec.phase('돌아가기', root
        ? `${fmt(last.cell)}까지 모두 돌아와 이 섬을 끝냅니다.`
        : `더 갈 땅이 없어 ${group.map((e) => fmt(e.cell)).join(', ')}에서 ${ro(fmt(last.parent!))} 돌아갑니다.`, DFS_AT.back);
      for (const ev of group) {
        lane.pop(cid(ev.cell));
        rec.do(...together([paint(ev.cell, { tone: 'visited' }), ...(ev.parent ? [paint(ev.parent, { tone: 'current' })] : [])], true));
      }
      if (resumes) {
        rec.phase('살피기', `${fmt(last.parent!)}에서 이어서 봅니다. ${talk(last.looks)}`, DFS_AT.look);
        probeAt(rec, last.parent!, last.looks);
      }
      if (root) {
        rec.phase('기록하기', `맨 위 호출이 끝났으니 합 ${josa(total, '을', '를')} answer에 담습니다.`, DFS_AT.record);
        ans.push({ id: ansId(answer.length - 1), text: String(total) }, 'total');
        scan = undefined;
      }
    }
  });

  // 오름차순으로 정렬해 돌려준다
  const order = byValue(answer);
  const sorted = order.map((k) => answer[k]);
  rec.step({ title: `답 정렬 — ${listText(sorted)}`, codeHighlights: DFS_AT.done, ...withReturn(meta(), sorted), answer: sorted, isKeyframe: true });
  rec.phase('정렬하기', `answer를 오름차순으로 정렬하면 ${josa(listText(sorted), '이', '가')} 됩니다.`, DFS_AT.done);
  ans.reorder(order.map(ansId));
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'island-trip',
  title: '무인도 여행',
  level: 2,
  category: 'dfs-bfs',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/154540',
  description: {
    summary:
      '지도에서 X는 바다이고 숫자 1~9는 땅입니다. 상하좌우로 이어진 땅이 한 섬이고, 숫자는 그 칸에서 머물 수 있는 날짜입니다. 섬마다 머물 수 있는 날짜의 합을 구해 오름차순으로 돌려주고, 섬이 하나도 없으면 [-1]을 돌려줍니다.',
    rules: [
      'maps의 가로·세로 길이는 3 이상 100 이하',
      'maps[i]는 X 또는 1~9의 숫자로 이루어진 문자열',
      '지도는 직사각형 모양',
      '섬이 없으면 [-1] 반환',
    ],
    examples: [
      { input: 'maps = ["X591X","X1X5X","X231X", "1XXX1"]', output: '[1, 1, 27]' },
      { input: 'maps = ["XXX","XXX","XXX"]', output: '[-1]' },
    ],
  },
  keyIntuitions: [
    '"이어진 땅 덩어리마다 합을 구하라"는 문제는 땅 칸을 하나씩 훑다가 아직 안 센 땅을 만나면 BFS나 DFS로 그 섬 전체를 한 번에 센다는 뜻입니다.',
    '방문 표시를 큐에 넣을 때 해야 같은 칸이 큐에 두 번 들어가지 않습니다. 꺼낼 때 하면 큐에 든 칸을 또 넣어 날짜를 두 번 더할 수 있습니다.',
    '섬을 찾는 순서는 지도를 훑는 순서라서 합이 작은 순서가 아닙니다. 마지막에 오름차순으로 정렬하고, 섬이 없을 때만 [-1]을 돌려줍니다.',
  ],
  demo: { input: [MAPS], label: 'maps = 예제 1 ["X591X","X1X5X","X231X","1XXX1"]' },
  workUnit: '칸을 방문한 횟수',
  approaches: [
    {
      id: 'island-bfs',
      name: '너비 우선 탐색 (BFS 영역 나누기)',
      rank: 'BEST',
      timeComplexity: 'O(N × M + K log K)',
      spaceComplexity: 'O(N × M)',
      verdict: '아직 안 센 땅에서 BFS로 섬 하나를 통째로 세는 영역 나누기의 표준 풀이입니다.',
      pros: [
        '큐에 넣을 때 방문 표시를 해 땅 칸을 정확히 한 번씩만 방문합니다.',
        '재귀가 없어 100 × 100 지도에서도 재귀 한도를 걱정할 필요가 없습니다.',
        '지도를 한 번 훑는 반복문과 BFS 한 개로 영역 나누기가 끝납니다.',
      ],
      cons: ['섬이 K개면 합을 정렬하는 일이 따로 필요합니다.', '큐와 방문 표시 배열에 지도 크기만큼 메모리가 필요합니다.'],
      whyThisRank:
        '이어진 땅을 한 덩어리씩 묶는 문제에는 BFS가 가장 안전합니다. 칸마다 한 번만 보고, 지도가 커져도 재귀 걱정이 없습니다.',
      code: BFS,
      visualize: () => layered(false),
    },
    {
      id: 'island-dfs',
      name: '깊이 우선 탐색 (DFS 영역 나누기)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × M + K log K)',
      spaceComplexity: 'O(N × M) 재귀 깊이',
      verdict: '답과 방문 횟수는 같지만 재귀가 깊어질 수 있는 풀이입니다.',
      pros: [
        '재귀로 "이어진 땅으로 파고들기"를 짧게 쓸 수 있습니다.',
        '땅 칸마다 한 번씩만 방문해 BFS와 일의 양이 같습니다.',
      ],
      cons: [
        '섬이 길게 이어지면 재귀가 깊어집니다. 100 × 100 지도에서 한 섬이 지도 전체를 구불구불 채우면 깊이가 최대 10,000이라 Python 기본 재귀 한도(1,000)를 넘어 RecursionError가 납니다.',
        '합을 바깥 변수 total에 더하는 방식이라 섬마다 0으로 되돌리는 것을 잊기 쉽습니다.',
      ],
      whyThisRank:
        '맞게 풀고 일의 양도 같지만, 지도가 커지면 재귀 깊이가 위험해 BFS가 더 안전합니다. 시험에서 재귀 한도를 따로 올려야 하는 부담이 생깁니다.',
      code: DFS,
      visualize: depthFirst,
    },
    {
      id: 'island-wrong',
      name: 'BFS (꺼낼 때 방문 표시)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N × M + K log K)',
      spaceComplexity: 'O(N × M)',
      verdict: '정석과 한 줄만 다른데, 같은 칸을 두 번 세어 합이 틀립니다.',
      pros: ['방문 표시를 꺼낼 때 하니 코드가 자연스러워 보입니다.'],
      cons: [
        '꺼낼 때까지 방문 표시가 없어서, 큐에 든 칸을 다른 이웃이 또 큐에 넣을 수 있습니다. 시각화 입력에서는 (2, 3)이 큐에 두 번 들어가 1을 두 번 더하고 27 대신 28이 나옵니다.',
        '틀리는 칸이 섬 모양에 따라 달라서, 예제는 통과하고 채점에서 떨어지기 쉽습니다.',
      ],
      whyThisRank:
        'BFS에서 방문 표시는 큐에 넣는 순간 해야 합니다. 꺼낼 때 하면 큐에 중복이 생기고, 칸마다 값을 더하는 이 문제에서는 합이 틀립니다.',
      code: WRONG,
      visualize: () => layered(true),
    },
  ],
  checks: {
    cases: [
      { args: [['X591X', 'X1X5X', 'X231X', '1XXX1']], expected: [1, 1, 27] },
      { args: [['XXX', 'XXX', 'XXX']], expected: [-1] },
      { args: [['XXX', 'X5X', 'XXX']], expected: [5] },
      { args: [['X1X', '1X1', 'X1X']], expected: [1, 1, 1, 1] },
      { args: [['999', '999', '999']], expected: [81] },
      { args: [MAPS], expected: SORTED },
    ],
    // 세로 3~6칸, 가로 3~6칸, 칸마다 45% 확률로 바다(X), 아니면 1~9
    random: (rand) => {
      const [n, m] = [3 + Math.floor(rand() * 4), 3 + Math.floor(rand() * 4)];
      return [Array.from({ length: n }, () => Array.from({ length: m }, () => (rand() < 0.45 ? 'X' : String(1 + Math.floor(rand() * 9)))).join(''))];
    },
  },
};

export default problem;
