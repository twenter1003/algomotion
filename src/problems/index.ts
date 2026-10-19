import type { AlgorithmStep, Cell, Problem, VisualState } from '../types';

/** 코드에서 needle이 들어 있는 첫 줄의 번호(1부터)를 찾습니다. 코드를 고쳐도 하이라이트가 어긋나지 않습니다. */
const at = (code: string, ...needles: string[]): number[] => {
  const rows = code.split('\n');
  return needles.map((needle) => {
    const index = rows.findIndex((row) => row.includes(needle));
    if (index < 0) throw new Error(`코드에서 "${needle}" 줄을 찾지 못했습니다`);
    return index + 1;
  });
};

// 숫자로 끝나는 말 뒤 조사: 2·4·5·9(이·사·오·구)로 끝나면 받침이 없고, '로'는 ㄹ 받침(1·7·8)에도 씁니다.
const lastDigit = (word: string | number) => String(word).replace(/\D/g, '').slice(-1);
const josa = (word: string | number, batchim: string, plain: string) =>
  `${word}${'2459'.includes(lastDigit(word)) ? plain : batchim}`;
const ro = (word: string | number) => `${word}${'036'.includes(lastDigit(word)) ? '으로' : '로'}`;

const fmt = ([r, c]: Cell) => `(${r}, ${c})`;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/* ------------------------------------------------------------------ */
/* 1. 게임 맵 최단거리                                                   */
/* ------------------------------------------------------------------ */

const GAME_MAP_PY = `from collections import deque

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

    return -1`;

const GAME_MAP_JS = `function solution(maps) {
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
}`;

const gameMap: Problem = {
  id: 'game-map',
  title: '게임 맵 최단거리',
  level: 2,
  category: 'BFS/DFS',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/1844',
  timeComplexity: 'O(N × M)',
  spaceComplexity: 'O(N × M)',
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
      code: { python: GAME_MAP_PY, javascript: GAME_MAP_JS },
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
      code: {
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
      },
    },
    {
      id: 'game-map-dfs',
      name: '깊이 우선 탐색 (백트래킹)',
      rank: 'TRAP',
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
      code: {
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
      },
    },
  ],
  code: { python: GAME_MAP_PY, javascript: GAME_MAP_JS },
  generateSteps: () => {
    const grid = [
      [1, 0, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 1, 1, 1],
      [1, 1, 1, 0, 1],
      [0, 0, 0, 0, 1],
    ];
    const n = grid.length;
    const m = grid[0].length;
    const moves: [number, number, string][] = [
      [-1, 0, '위'],
      [1, 0, '아래'],
      [0, -1, '왼쪽'],
      [0, 1, '오른쪽'],
    ];
    const dist = grid.map((row) => row.map(() => -1));
    const parent = new Map<string, Cell>();
    const queue: Cell[] = [[0, 0]];
    let head = 0;
    dist[0][0] = 1;

    const visual = (current: Cell | null, added: Cell[], path: Cell[], actionLabel: string): VisualState => ({
      type: 'grid',
      actionLabel,
      data: { grid, dist: dist.map((row) => [...row]), current, queue: queue.slice(head), added, path },
    });
    const vars = (current: Cell | null, added: Cell[]) => ({
      '(x, y)': current ? fmt(current) : '-',
      'dist[x][y]': current ? dist[current[0]][current[1]] : '-',
      '새로 넣은 칸': added.length ? added.map(fmt).join(', ') : '없음',
      queue: `[${queue.slice(head).map(fmt).join(', ')}]`,
    });

    const steps: AlgorithmStep[] = [
      {
        title: '출발 칸 (0, 0)을 큐에 넣기',
        narration:
          '출발 칸도 한 칸으로 세므로 거리를 1로 적고 큐에 넣습니다. 이제 큐 맨 앞에서 하나씩 꺼내며 상하좌우로 한 칸씩 넓혀 갑니다.',
        visualState: visual(null, [[0, 0]], [], '출발 칸 거리 = 1'),
        codeHighlights: {
          python: at(GAME_MAP_PY, 'queue = deque', 'dist = [[-1]', 'dist[0][0] = 1'),
          javascript: at(GAME_MAP_JS, 'const queue = [[0, 0]]', 'const dist = Array', 'dist[0][0] = 1'),
        },
        variables: vars(null, [[0, 0]]),
      },
    ];

    while (head < queue.length) {
      const [x, y] = queue[head++];
      const d = dist[x][y];

      if (x === n - 1 && y === m - 1) {
        const path: Cell[] = [];
        for (let cell: Cell | undefined = [x, y]; cell; cell = parent.get(`${cell[0]},${cell[1]}`)) {
          path.unshift(cell);
        }
        steps.push({
          title: `도착 칸 ${fmt([x, y])} 꺼내기 — 최단 거리 ${d}`,
          narration: `큐에서 도착 칸을 꺼냈으니 탐색을 멈추고 ${josa(d, '을', '를')} 돌려줍니다. BFS는 가까운 칸부터 꺼내므로 처음 꺼낸 순간의 거리가 최단 거리입니다. 분홍색 칸은 도착 칸에서 거꾸로 따라간 최단 경로 ${path.length}칸입니다.`,
          visualState: visual([x, y], [], path, `정답 ${d}칸`),
          codeHighlights: {
            python: at(GAME_MAP_PY, 'x, y = queue.popleft()', 'if x == n - 1 and y == m - 1', 'return dist[x][y]'),
            javascript: at(GAME_MAP_JS, 'const [x, y] = queue[head++]', 'if (x === n - 1 && y === m - 1)', 'return dist[x][y]'),
          },
          variables: vars([x, y], []),
          isKeyframe: true,
        });
        break;
      }

      const added: Cell[] = [];
      const fresh: string[] = [];
      const seen: string[] = [];
      const walls: string[] = [];
      for (const [dx, dy, dir] of moves) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;
        const label = `${dir} ${fmt([nx, ny])}`;
        if (grid[nx][ny] === 0) walls.push(label);
        else if (dist[nx][ny] !== -1) seen.push(label);
        else {
          dist[nx][ny] = d + 1;
          parent.set(`${nx},${ny}`, [x, y]);
          queue.push([nx, ny]);
          added.push([nx, ny]);
          fresh.push(label);
        }
      }

      const skipped = [
        seen.length ? `${josa(seen.join(', '), '은', '는')} 이미 거리를 적은 칸` : '',
        walls.length ? `${josa(walls.join(', '), '은', '는')} 벽` : '',
      ]
        .filter(Boolean)
        .join('이고, ');

      steps.push({
        title: fresh.length ? `${fmt([x, y])} 꺼내고 ${fresh.length}칸 넣기` : `${fmt([x, y])} 꺼내기 — 넣을 칸 없음`,
        narration:
          `큐 맨 앞에서 거리 ${d}인 ${fmt([x, y])} 칸을 꺼냈습니다. ` +
          (fresh.length
            ? `${josa(fresh.join(', '), '은', '는')} 처음 가는 칸이라 거리 ${d} + 1 = ${josa(d + 1, '을', '를')} 적고 큐 뒤에 넣습니다.`
            : '새로 넣을 칸이 없습니다.') +
          (skipped ? ` ${skipped}이라 건너뜁니다.` : ''),
        visualState: visual([x, y], added, [], fresh.length ? `거리 ${d}에 +1 → ${d + 1}` : '넣을 칸 없음'),
        codeHighlights: fresh.length
          ? {
              python: at(GAME_MAP_PY, 'x, y = queue.popleft()', 'dist[nx][ny] = dist[x][y] + 1', 'queue.append((nx, ny))'),
              javascript: at(GAME_MAP_JS, 'const [x, y] = queue[head++]', 'dist[nx][ny] = dist[x][y] + 1', 'queue.push([nx, ny])'),
            }
          : {
              python: at(GAME_MAP_PY, 'x, y = queue.popleft()', 'if maps[nx][ny] == 1 and dist[nx][ny] == -1'),
              javascript: at(GAME_MAP_JS, 'const [x, y] = queue[head++]', 'if (maps[nx][ny] === 1 && dist[nx][ny] === -1)'),
            },
        variables: vars([x, y], added),
      });
    }

    return steps;
  },
};

/* ------------------------------------------------------------------ */
/* 2. 입국심사                                                           */
/* ------------------------------------------------------------------ */

const IMMIGRATION_PY = `def solution(n, times):
    left, right = 1, max(times) * n  # 가장 느린 심사관 혼자 n명을 맡는 시간
    answer = right

    while left <= right:
        mid = (left + right) // 2
        # mid분 동안 심사관 전원이 처리할 수 있는 인원
        total = sum(mid // t for t in times)

        if total >= n:     # 충분하다 → 답 후보로 저장하고 더 짧게
            answer = mid
            right = mid - 1
        else:              # 부족하다 → 시간을 늘린다
            left = mid + 1

    return answer`;

const IMMIGRATION_JS = `function solution(n, times) {
  let left = 1;
  let right = Math.max(...times) * n; // 가장 느린 심사관 혼자 n명을 맡는 시간
  let answer = right;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // mid분 동안 심사관 전원이 처리할 수 있는 인원
    let total = 0;
    for (const t of times) total += Math.floor(mid / t);

    if (total >= n) { // 충분하다 → 답 후보로 저장하고 더 짧게
      answer = mid;
      right = mid - 1;
    } else { // 부족하다 → 시간을 늘린다
      left = mid + 1;
    }
  }

  return answer;
}`;

const immigration: Problem = {
  id: 'immigration',
  title: '입국심사',
  level: 3,
  category: '이분 탐색',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/43238',
  timeComplexity: 'O(M log(n × maxT))',
  spaceComplexity: 'O(1)',
  description: {
    summary:
      'n명이 입국심사를 기다립니다. 심사관마다 한 명을 심사하는 데 걸리는 시간이 다를 때, 모든 사람이 심사를 받는 데 걸리는 시간의 최솟값을 구합니다. 빈 심사대가 있어도 더 빨리 끝나는 심사대를 기다렸다 갈 수 있습니다.',
    rules: [
      'n은 1 이상 1,000,000,000 이하',
      '심사 시간 times[i]는 1분 이상 1,000,000,000분 이하',
      '심사관 수(times의 길이)는 1명 이상 100,000명 이하',
    ],
    examples: [{ input: 'n = 6, times = [7, 10]', output: '28' }],
  },
  keyIntuitions: [
    'n이 최대 10억이라 사람을 한 명씩 심사대에 배정하면 시간 초과입니다.',
    '질문을 뒤집어 "T분이 주어지면 몇 명을 심사할 수 있나?"를 묻습니다. 답은 심사관마다 ⌊T ÷ times[i]⌋명을 더한 값입니다.',
    'T가 늘면 처리 인원은 줄지 않으므로, n명 이상이 되는 가장 작은 T를 이분 탐색으로 찾습니다.',
  ],
  approaches: [
    {
      id: 'immigration-binary',
      name: '답을 이분 탐색 (매개변수 탐색)',
      rank: 'BEST',
      timeComplexity: 'O(M log(n × maxT))',
      spaceComplexity: 'O(1)',
      verdict: '답(시간)의 범위를 반씩 줄여 60번 안팎의 검사로 끝나는 풀이입니다.',
      pros: [
        '검사 한 번이 O(M)이고 검사 횟수는 log₂(10¹⁸) ≈ 60번이라 최악의 입력도 금방 끝납니다.',
        '추가 메모리가 거의 필요 없습니다.',
        '"T분 동안 처리 인원 = Σ⌊T ÷ times[i]⌋" 한 줄로 판정합니다.',
      ],
      cons: [
        '"시간을 이분 탐색한다"는 발상을 떠올려야 합니다.',
        'JavaScript는 답이 2⁵³을 넘으면 Number 정밀도가 깨질 수 있어, 극단 입력까지 대비하려면 BigInt를 씁니다.',
      ],
      whyThisRank:
        'n이 최대 10억이므로 사람 단위로 처리하는 풀이는 모두 탈락합니다. 시간이 늘면 처리 인원도 줄지 않는다는 단조성 덕분에 답 자체를 이분 탐색할 수 있습니다.',
      code: { python: IMMIGRATION_PY, javascript: IMMIGRATION_JS },
    },
    {
      id: 'immigration-heap',
      name: '최소 힙 시뮬레이션',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(n log M)',
      spaceComplexity: 'O(M)',
      verdict: '한 명씩 가장 빨리 끝나는 심사대에 배정하는 직관적인 풀이지만 n이 크면 시간 초과입니다.',
      pros: ['실제 줄서기와 똑같이 동작해 이해하기 쉽습니다.', 'n이 작다면 정확한 답을 냅니다.'],
      cons: [
        '사람마다 힙 연산(log M)을 하므로 n = 10억이면 수백억 번의 연산이 필요합니다.',
        '작은 예제만 통과하고 큰 테스트에서 시간 초과가 납니다.',
      ],
      whyThisRank:
        'n이 작다면 좋은 시뮬레이션이지만 이 문제의 n은 최대 10억입니다. 풀이를 고르기 전에 입력 크기부터 확인해야 하는 이유입니다.',
      code: {
        python: `import heapq

def solution(n, times):
    # (다음 심사가 끝나는 시각, 심사 시간)
    heap = [(t, t) for t in times]
    heapq.heapify(heap)

    finish = 0
    for _ in range(n):  # 사람마다 힙 연산 → n이 10억이면 시간 초과
        end, t = heapq.heappop(heap)
        finish = end
        heapq.heappush(heap, (end + t, t))
    return finish`,
        javascript: `function solution(n, times) {
  // [다음 심사가 끝나는 시각, 심사 시간]을 담는 최소 힙 (정렬된 배열은 이미 힙입니다)
  const heap = times.map((t) => [t, t]).sort((a, b) => a[0] - b[0]);
  const siftDown = (i) => {
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let min = i;
      if (l < heap.length && heap[l][0] < heap[min][0]) min = l;
      if (r < heap.length && heap[r][0] < heap[min][0]) min = r;
      if (min === i) return;
      [heap[min], heap[i]] = [heap[i], heap[min]];
      i = min;
    }
  };

  let finish = 0;
  for (let k = 0; k < n; k++) { // 사람마다 힙 연산 → n이 10억이면 시간 초과
    const [end, t] = heap[0];
    finish = end;
    heap[0] = [end + t, t]; // 루트 값만 커지므로 아래로 내리면 됩니다
    siftDown(0);
  }
  return finish;
}`,
      },
    },
    {
      id: 'immigration-linear',
      name: '1분씩 늘려 보는 선형 탐색',
      rank: 'TRAP',
      timeComplexity: 'O(답 × M)',
      spaceComplexity: 'O(1)',
      verdict: '1분, 2분, 3분… 하나씩 늘려 가며 n명이 되는지 확인합니다.',
      pros: ['코드가 가장 짧습니다.'],
      cons: [
        '답이 최대 10¹⁸분이라 그만큼 반복할 수 있어 사실상 끝나지 않습니다.',
        '시간을 1분 늘릴 때마다 심사관 전원(최대 10만 명)을 다시 더합니다.',
      ],
      whyThisRank:
        '처리 인원이 시간에 따라 늘어난다는 성질을 쓰지 않고 답을 하나씩 확인합니다. 같은 판정 식을 이분 탐색으로 감싸기만 하면 정석 풀이가 됩니다.',
      code: {
        python: `def solution(n, times):
    t = 1
    while sum(t // time for time in times) < n:
        t += 1  # 답이 10^18이면 10^18번 반복
    return t`,
        javascript: `function solution(n, times) {
  let t = 1;
  while (times.reduce((acc, time) => acc + Math.floor(t / time), 0) < n) {
    t++; // 답이 10^18이면 10^18번 반복
  }
  return t;
}`,
      },
    },
  ],
  code: { python: IMMIGRATION_PY, javascript: IMMIGRATION_JS },
  generateSteps: () => {
    const n = 6;
    const times = [7, 10];
    const maxTime = Math.max(...times) * n;
    let left = 1;
    let right = maxTime;
    let answer = right;

    const counts = (t: number) => times.map((time) => Math.floor(t / time));
    const visual = (phase: 'init' | 'check' | 'pass' | 'fail' | 'done', mid: number | null, actionLabel: string): VisualState => {
      const c = mid === null ? times.map(() => 0) : counts(mid);
      return {
        type: 'parametric',
        actionLabel,
        data: { left, right, mid, n, times, counts: c, total: mid === null ? null : sum(c), answer, maxTime, phase },
      };
    };
    const vars = (mid: number | null) => ({
      left,
      right,
      mid: mid ?? '-',
      total: mid === null ? '-' : sum(counts(mid)),
      answer,
    });
    const rangeNote = () =>
      left <= right ? `남은 구간은 [${left}, ${right}]입니다.` : 'left가 right보다 커졌으니 반복을 끝냅니다.';

    const steps: AlgorithmStep[] = [
      {
        title: `탐색 구간 정하기: 1분 ~ ${maxTime}분`,
        narration: `n = ${n}명, times = [${times.join(', ')}]입니다. 답이 될 수 있는 시간은 최소 1분, 최대 가장 느린 심사관 혼자 ${n}명을 모두 맡는 ${Math.max(...times)} × ${n} = ${maxTime}분입니다. 이 구간에서 "mid분이면 ${n}명을 심사할 수 있나?"를 반복해서 묻습니다.`,
        visualState: visual('init', null, `1분 ~ ${maxTime}분 사이 어딘가`),
        codeHighlights: {
          python: at(IMMIGRATION_PY, 'left, right = 1', 'answer = right'),
          javascript: at(IMMIGRATION_JS, 'let left = 1', 'let right = Math.max', 'let answer = right'),
        },
        variables: vars(null),
      },
    ];

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const c = counts(mid);
      const total = sum(c);
      steps.push({
        title: `mid = ${mid}분이면 몇 명?`,
        narration:
          `mid = ⌊(${left} + ${right}) ÷ 2⌋ = ${mid}분입니다. ` +
          times.map((t, i) => `${t}분 심사관은 ⌊${mid} ÷ ${t}⌋ = ${c[i]}명`).join(', ') +
          `, 모두 ${total}명을 심사합니다.`,
        visualState: visual('check', mid, `${mid}분 → ${total}명`),
        codeHighlights: {
          python: at(IMMIGRATION_PY, 'mid = (left + right) // 2', 'total = sum('),
          javascript: at(IMMIGRATION_JS, 'const mid = Math.floor', 'let total = 0', 'for (const t of times)'),
        },
        variables: vars(mid),
      });

      if (total >= n) {
        answer = mid;
        right = mid - 1;
        steps.push({
          title: `${total}명 ≥ ${n}명 → 더 짧게`,
          narration: `${mid}분이면 ${n}명을 모두 심사할 수 있습니다. answer = ${ro(mid)} 저장하고, 더 짧은 시간도 되는지 보려고 right = ${ro(right)} 줄입니다. ${rangeNote()}`,
          visualState: visual('pass', mid, `충분 → 답 후보 ${mid}분`),
          codeHighlights: {
            python: at(IMMIGRATION_PY, 'if total >= n', 'answer = mid', 'right = mid - 1'),
            javascript: at(IMMIGRATION_JS, 'if (total >= n)', 'answer = mid', 'right = mid - 1'),
          },
          variables: vars(mid),
        });
      } else {
        left = mid + 1;
        steps.push({
          title: `${total}명 < ${n}명 → 더 길게`,
          narration: `${mid}분으로는 ${total}명뿐이라 부족합니다. 시간을 늘려야 하므로 left = ${ro(left)} 올립니다. ${rangeNote()}`,
          visualState: visual('fail', mid, `부족 → left = ${left}`),
          codeHighlights: {
            python: at(IMMIGRATION_PY, 'else:', 'left = mid + 1'),
            javascript: at(IMMIGRATION_JS, '} else {', 'left = mid + 1'),
          },
          variables: vars(mid),
        });
      }
    }

    const finalCounts = counts(answer);
    steps.push({
      title: `최소 시간 ${answer}분`,
      narration:
        `반복이 끝났습니다. ${n}명을 모두 심사하는 최소 시간은 ${answer}분입니다. ${answer}분이면 ` +
        times.map((t, i) => `${t}분 심사관이 ${finalCounts[i]}명`).join(', ') +
        `을 맡아 모두 ${sum(finalCounts)}명을 심사합니다.`,
      visualState: visual('done', answer, `정답 ${answer}분`),
      codeHighlights: {
        python: at(IMMIGRATION_PY, 'return answer'),
        javascript: at(IMMIGRATION_JS, 'return answer'),
      },
      variables: vars(answer),
      isKeyframe: true,
    });

    return steps;
  },
};

/* ------------------------------------------------------------------ */
/* 3. 기능개발                                                           */
/* ------------------------------------------------------------------ */

const FEATURE_PY = `import math

def solution(progresses, speeds):
    # 기능마다 배포까지 남은 날: 올림((100 - 진도) / 속도)
    days = [math.ceil((100 - p) / s) for p, s in zip(progresses, speeds)]

    answer = []
    deploy_day = days[0]  # 지금 묶음이 배포되는 날
    count = 1

    for day in days[1:]:
        if day <= deploy_day:
            count += 1            # 이미 끝나 있으니 함께 배포
        else:
            answer.append(count)  # 지금 묶음을 내보내고
            deploy_day = day      # 새 묶음 시작
            count = 1

    answer.append(count)          # 마지막 묶음
    return answer`;

const FEATURE_JS = `function solution(progresses, speeds) {
  // 기능마다 배포까지 남은 날: 올림((100 - 진도) / 속도)
  const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));

  const answer = [];
  let deployDay = days[0]; // 지금 묶음이 배포되는 날
  let count = 1;

  for (let i = 1; i < days.length; i++) {
    if (days[i] <= deployDay) {
      count++; // 이미 끝나 있으니 함께 배포
    } else {
      answer.push(count); // 지금 묶음을 내보내고
      deployDay = days[i]; // 새 묶음 시작
      count = 1;
    }
  }

  answer.push(count); // 마지막 묶음
  return answer;
}`;

const featureDevelopment: Problem = {
  id: 'feature-development',
  title: '기능개발',
  level: 2,
  category: '스택/큐',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42586',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(N)',
  description: {
    summary:
      '기능은 진도가 100%가 되어야 배포할 수 있고, 뒤 기능이 먼저 끝나도 앞 기능이 배포될 때 함께 배포됩니다. 작업 진도와 하루 개발 속도가 주어질 때 배포마다 몇 개의 기능이 나가는지 구합니다.',
    rules: [
      '작업 개수(progresses, speeds의 길이)는 100개 이하',
      '작업 진도는 100 미만, 작업 속도는 100 이하의 자연수',
      '배포는 하루에 한 번, 하루의 끝에 이루어짐',
      '진도 95%, 속도 4%라면 2일 뒤에 배포됨',
    ],
    examples: [
      { input: 'progresses = [93, 30, 55], speeds = [1, 30, 5]', output: '[2, 1]' },
      { input: 'progresses = [95, 90, 99, 99, 80, 99], speeds = [1, 1, 1, 1, 1, 1]', output: '[1, 3, 2]' },
    ],
  },
  keyIntuitions: [
    '기능마다 배포까지 걸리는 날을 먼저 구합니다: ⌈(100 − 진도) ÷ 속도⌉. 첫 예제는 [7, 3, 9]일입니다.',
    '뒤 기능이 먼저 끝나도 앞 기능이 나갈 때까지 기다립니다. 그래서 묶음의 기준은 그 묶음 맨 앞 기능의 완료일입니다.',
    '기준일보다 늦게 끝나는 기능을 만나면 지금 묶음을 배포하고, 그 기능의 완료일로 새 묶음을 시작합니다.',
  ],
  approaches: [
    {
      id: 'feature-single-pass',
      name: '배포일 기준으로 한 번 훑기',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '남은 날을 미리 구한 뒤 반복문 한 번으로 묶음을 세는 가장 간결한 풀이입니다.',
      pros: [
        '배열을 한 번만 훑으므로 O(N)입니다.',
        '변수 두 개(배포일, 개수)만으로 상태를 관리합니다.',
        '날짜를 하루씩 흘려보낼 필요가 없습니다.',
      ],
      cons: ['올림 나눗셈 ⌈(100 − p) ÷ s⌉을 정확히 써야 합니다. Python에서는 -((p - 100) // s)로도 쓸 수 있습니다.'],
      whyThisRank:
        '남은 날만 알면 시뮬레이션 없이 "기준일 이하면 같은 묶음"이라는 비교 하나로 끝납니다. 코드가 짧아 실수할 곳이 적습니다.',
      code: { python: FEATURE_PY, javascript: FEATURE_JS },
    },
    {
      id: 'feature-queue',
      name: '큐에서 앞부터 꺼내기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '큐의 FIFO 동작을 그대로 옮긴 풀이로, 정석과 결과와 복잡도가 같습니다.',
      pros: [
        '맨 앞 기능을 꺼낼 때 이미 끝난 뒤 기능을 함께 꺼내는 구조가 문제 설명과 그대로 맞습니다.',
        '"스택/큐" 유형을 연습하기에 좋습니다.',
      ],
      cons: [
        'JavaScript에는 덱이 없어 shift()를 쓰면 꺼낼 때마다 O(N)이 듭니다. 이 문제는 N ≤ 100이라 괜찮지만, 머리 인덱스로 꺼내는 습관이 안전합니다.',
      ],
      whyThisRank: '동작과 복잡도는 정석과 같습니다. 다만 같은 일을 하는 코드가 조금 더 길어 대안으로 둡니다.',
      code: {
        python: `from collections import deque
import math

def solution(progresses, speeds):
    queue = deque(math.ceil((100 - p) / s) for p, s in zip(progresses, speeds))
    answer = []

    while queue:
        first = queue.popleft()  # 맨 앞 기능이 배포되는 날
        count = 1
        while queue and queue[0] <= first:
            queue.popleft()      # 이미 끝난 뒤 기능을 함께 꺼냄
            count += 1
        answer.append(count)
    return answer`,
        javascript: `function solution(progresses, speeds) {
  const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));
  const answer = [];
  let head = 0; // shift() 대신 머리 인덱스로 큐를 꺼냅니다

  while (head < days.length) {
    const first = days[head++]; // 맨 앞 기능이 배포되는 날
    let count = 1;
    while (head < days.length && days[head] <= first) {
      head++; // 이미 끝난 뒤 기능을 함께 꺼냄
      count++;
    }
    answer.push(count);
  }
  return answer;
}`,
      },
    },
    {
      id: 'feature-compare-previous',
      name: '직전 기능하고만 비교하기',
      rank: 'TRAP',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '복잡도는 같지만 묶음 기준을 잘못 잡아 오답이 나옵니다.',
      pros: ['코드 모양이 정석 풀이와 거의 같습니다.'],
      cons: [
        '남은 날이 [5, 3, 4]이면 4를 직전 값 3과 비교해 새 묶음으로 나눕니다. 실제로는 5일째에 셋이 함께 나가므로 정답 [3]이 아니라 [2, 1]이 나옵니다.',
        '문제의 두 예제는 우연히 통과해서 실수를 알아채기 어렵습니다.',
      ],
      whyThisRank:
        '뒤 기능은 앞 기능이 배포될 때까지 기다리므로, 비교 기준은 직전 기능이 아니라 지금 묶음의 배포일(맨 앞 기능의 완료일)이어야 합니다.',
      code: {
        python: `import math

def solution(progresses, speeds):
    days = [math.ceil((100 - p) / s) for p, s in zip(progresses, speeds)]
    answer = []
    count = 1

    for i in range(1, len(days)):
        if days[i] <= days[i - 1]:  # 잘못된 기준: 직전 기능과만 비교
            count += 1
        else:
            answer.append(count)
            count = 1
    answer.append(count)
    return answer  # days = [5, 3, 4] → [2, 1] (정답은 [3])`,
        javascript: `function solution(progresses, speeds) {
  const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));
  const answer = [];
  let count = 1;

  for (let i = 1; i < days.length; i++) {
    if (days[i] <= days[i - 1]) { // 잘못된 기준: 직전 기능과만 비교
      count++;
    } else {
      answer.push(count);
      count = 1;
    }
  }
  answer.push(count);
  return answer; // days = [5, 3, 4] → [2, 1] (정답은 [3])
}`,
      },
    },
  ],
  code: { python: FEATURE_PY, javascript: FEATURE_JS },
  generateSteps: () => {
    const progresses = [93, 30, 55];
    const speeds = [1, 30, 5];
    const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));
    const deployed = new Set<number>();
    const log: { day: number; count: number }[] = [];
    let batch: number[] = [];
    const name = (i: number) => `기능 ${i + 1}`;
    const answerText = () => `[${log.map((entry) => entry.count).join(', ')}]`;

    const visual = (day: number, deployDay: number | null, focus: number | null, actionLabel: string): VisualState => ({
      type: 'queue',
      actionLabel,
      data: {
        day,
        deployDay,
        focus,
        log: [...log],
        features: progresses.map((p, i) => ({
          name: name(i),
          progress: p,
          speed: speeds[i],
          days: days[i],
          progressNow: Math.min(100, p + speeds[i] * day),
          status: deployed.has(i) ? 'deployed' : batch.includes(i) ? 'bundled' : 'waiting',
        })),
      },
    });
    const vars = (deployDay: number | string, count: number | string) => ({
      days: `[${days.join(', ')}]`,
      deploy_day: deployDay,
      count,
      answer: answerText(),
    });

    const steps: AlgorithmStep[] = [
      {
        title: `배포까지 남은 날 구하기: [${days.join(', ')}]`,
        narration:
          '기능마다 남은 진도를 하루 속도로 나눠 올림하면 배포까지 걸리는 날이 나옵니다. ' +
          progresses.map((p, i) => `${josa(name(i), '은', '는')} ⌈${100 - p} ÷ ${speeds[i]}⌉ = ${days[i]}일`).join(', ') +
          '입니다.',
        visualState: visual(0, null, null, '올림((100 − 진도) ÷ 속도)'),
        codeHighlights: {
          python: at(FEATURE_PY, 'days = [math.ceil'),
          javascript: at(FEATURE_JS, 'const days = progresses.map'),
        },
        variables: vars('-', '-'),
      },
    ];

    let deployDay = days[0];
    let count = 1;
    batch = [0];
    steps.push({
      title: `첫 묶음의 배포일: ${deployDay}일째`,
      narration: `맨 앞 ${josa(name(0), '이', '가')} 끝나는 ${deployDay}일째가 첫 배포일입니다. 앞 기능이 나가기 전에는 뒤 기능도 나갈 수 없으니 이 날을 기준으로 묶음을 셉니다. count = 1.`,
      visualState: visual(deployDay, deployDay, 0, `기준일 ${deployDay}일째`),
      codeHighlights: {
        python: at(FEATURE_PY, 'deploy_day = days[0]', 'count = 1'),
        javascript: at(FEATURE_JS, 'let deployDay = days[0]', 'let count = 1'),
      },
      variables: vars(deployDay, count),
    });

    for (let i = 1; i < days.length; i++) {
      if (days[i] <= deployDay) {
        count += 1;
        batch.push(i);
        steps.push({
          title: `${name(i)}: ${days[i]}일 ≤ ${deployDay}일 → 함께 배포`,
          narration: `${josa(name(i), '은', '는')} ${days[i]}일째에 이미 끝나지만 앞 기능을 기다렸다가 ${deployDay}일째에 함께 나갑니다. count = ${count}.`,
          visualState: visual(deployDay, deployDay, i, `+1 → ${count}개 묶음`),
          codeHighlights: {
            python: at(FEATURE_PY, 'if day <= deploy_day', 'count += 1'),
            javascript: at(FEATURE_JS, 'if (days[i] <= deployDay)', 'count++'),
          },
          variables: vars(deployDay, count),
        });
      } else {
        const shipped = { day: deployDay, count };
        log.push(shipped);
        batch.forEach((j) => deployed.add(j));
        deployDay = days[i];
        count = 1;
        batch = [i];
        steps.push({
          title: `${shipped.day}일째 ${shipped.count}개 배포, 새 묶음 시작`,
          narration: `${josa(name(i), '은', '는')} ${days[i]}일째에 끝나 ${shipped.day}일째 배포에 끼지 못합니다. 지금까지 모은 ${shipped.count}개를 ${shipped.day}일째에 배포하고(answer = ${answerText()}), ${days[i]}일째를 새 배포일로 잡습니다.`,
          visualState: visual(shipped.day, deployDay, i, `${shipped.day}일째 ${shipped.count}개 출발`),
          codeHighlights: {
            python: at(FEATURE_PY, 'else:', '# 지금 묶음을 내보내고', '# 새 묶음 시작'),
            javascript: at(FEATURE_JS, '} else {', '// 지금 묶음을 내보내고', '// 새 묶음 시작'),
          },
          variables: vars(deployDay, count),
        });
      }
    }

    log.push({ day: deployDay, count });
    batch.forEach((j) => deployed.add(j));
    steps.push({
      title: `${deployDay}일째 마지막 ${count}개 배포 — 정답 ${answerText()}`,
      narration: `모든 기능을 확인했으니 남은 묶음 ${count}개를 ${deployDay}일째에 배포합니다. 배포마다 나간 기능 수를 모은 ${josa(answerText(), '이', '가')} 정답입니다.`,
      visualState: visual(deployDay, deployDay, null, `정답 ${answerText()}`),
      codeHighlights: {
        python: at(FEATURE_PY, '# 마지막 묶음', 'return answer'),
        javascript: at(FEATURE_JS, '// 마지막 묶음', 'return answer'),
      },
      variables: vars(deployDay, count),
      isKeyframe: true,
    });

    return steps;
  },
};

/* ------------------------------------------------------------------ */
/* 4. 정수 삼각형                                                         */
/* ------------------------------------------------------------------ */

const TRIANGLE_PY = `def solution(triangle):
    dp = [row[:] for row in triangle]  # 원본을 지키려고 복사
    n = len(dp)

    # 바닥 바로 윗줄부터 꼭대기까지 거꾸로 올라갑니다
    for i in range(n - 2, -1, -1):
        for j in range(i + 1):
            dp[i][j] += max(dp[i + 1][j], dp[i + 1][j + 1])

    return dp[0][0]`;

const TRIANGLE_JS = `function solution(triangle) {
  const dp = triangle.map((row) => [...row]); // 원본을 지키려고 복사
  const n = dp.length;

  // 바닥 바로 윗줄부터 꼭대기까지 거꾸로 올라갑니다
  for (let i = n - 2; i >= 0; i--) {
    for (let j = 0; j <= i; j++) {
      dp[i][j] += Math.max(dp[i + 1][j], dp[i + 1][j + 1]);
    }
  }

  return dp[0][0];
}`;

const integerTriangle: Problem = {
  id: 'integer-triangle',
  title: '정수 삼각형',
  level: 3,
  category: '동적계획법(DP)',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/43105',
  timeComplexity: 'O(N²)',
  spaceComplexity: 'O(N²)',
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
      code: { python: TRIANGLE_PY, javascript: TRIANGLE_JS },
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
      code: {
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
      },
    },
    {
      id: 'triangle-brute-force',
      name: '모든 경로를 재귀로 탐색',
      rank: 'TRAP',
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
      code: {
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
      },
    },
  ],
  code: { python: TRIANGLE_PY, javascript: TRIANGLE_JS },
  generateSteps: () => {
    const triangle = [[7], [3, 8], [8, 1, 0], [2, 7, 4, 4], [4, 5, 2, 6, 5]];
    const dp = triangle.map((row) => [...row]);
    const n = triangle.length;

    const visual = (active: Cell | null, children: Cell[], chosen: Cell | null, path: Cell[], actionLabel: string): VisualState => ({
      type: 'dp-pyramid',
      actionLabel,
      data: { triangle, dp: dp.map((row) => [...row]), active, children, chosen, path },
    });
    const vars = (i: number | string, j: number | string, orig: number | string, best: number | string, value: number | string) => ({
      i,
      j,
      'triangle[i][j]': orig,
      'max(아래 두 칸)': best,
      'dp[i][j]': value,
    });

    const steps: AlgorithmStep[] = [
      {
        title: '바닥 줄은 그대로 두고 시작',
        narration: `높이 ${n}의 삼각형입니다. 맨 아래 ${n - 1}층은 더 내려갈 곳이 없어 자기 값이 곧 최댓값입니다. 바로 윗줄인 ${n - 2}층부터 거꾸로 올라가며 계산합니다.`,
        visualState: visual(null, [], null, [], '바닥부터 거꾸로'),
        codeHighlights: {
          python: at(TRIANGLE_PY, 'dp = [row[:]', 'n = len(dp)'),
          javascript: at(TRIANGLE_JS, 'const dp = triangle.map', 'const n = dp.length'),
        },
        variables: vars('-', '-', '-', '-', '-'),
      },
    ];

    for (let i = n - 2; i >= 0; i--) {
      for (let j = 0; j <= i; j++) {
        const left = dp[i + 1][j];
        const right = dp[i + 1][j + 1];
        const best = Math.max(left, right);
        const orig = dp[i][j];
        dp[i][j] += best;
        steps.push({
          title: `dp[${i}][${j}] = ${orig} + max(${left}, ${right}) = ${dp[i][j]}`,
          narration: `${i}층 ${j}번 칸의 원래 값은 ${orig}입니다. 바로 아래 두 칸 ${left}, ${right} 중 큰 값 ${josa(best, '을', '를')} 더해 ${orig} + ${best} = ${josa(dp[i][j], '이', '가')} 됩니다.`,
          visualState: visual(
            [i, j],
            [
              [i + 1, j],
              [i + 1, j + 1],
            ],
            left >= right ? [i + 1, j] : [i + 1, j + 1],
            [],
            `${orig} + ${best} = ${dp[i][j]}`,
          ),
          codeHighlights: {
            python: at(TRIANGLE_PY, 'for i in range(n - 2', 'for j in range(i + 1)', 'dp[i][j] += max'),
            javascript: at(TRIANGLE_JS, 'for (let i = n - 2', 'for (let j = 0', 'dp[i][j] += Math.max'),
          },
          variables: vars(i, j, orig, best, dp[i][j]),
        });
      }
    }

    const path: Cell[] = [[0, 0]];
    for (let i = 0, j = 0; i < n - 1; i++) {
      if (dp[i + 1][j + 1] > dp[i + 1][j]) j += 1;
      path.push([i + 1, j]);
    }
    const values = path.map(([r, c]) => triangle[r][c]);
    steps.push({
      title: `꼭대기 dp[0][0] = ${dp[0][0]}`,
      narration: `꼭대기 한 칸에 전체 최댓값 ${josa(dp[0][0], '이', '가')} 모였습니다. 위에서부터 더 큰 쪽을 따라 내려가면 경로는 ${values.join(' → ')}, 합은 ${sum(values)}입니다.`,
      visualState: visual(null, [], null, path, `최댓값 ${dp[0][0]}`),
      codeHighlights: {
        python: at(TRIANGLE_PY, 'return dp[0][0]'),
        javascript: at(TRIANGLE_JS, 'return dp[0][0]'),
      },
      variables: vars(0, 0, triangle[0][0], '-', dp[0][0]),
      isKeyframe: true,
    });

    return steps;
  },
};

export const PROBLEMS: Problem[] = [gameMap, immigration, featureDevelopment, integerTriangle];
