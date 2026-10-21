// 가장 먼 노드: 정석 BFS 거리 배열, 대안 벨만-포드(간선 반복 완화), 함정 DFS로 깊이를 거리로 삼는 풀이를 같은 그래프에서 비교한다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import type { Action, Item, ItemPatch, Point, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { lines, ro, together } from '../shared.ts';

// 원문 입출력 예 그대로: 1-2, 1-3, 2-3, 2-4, 3-4, 2-5, 3-6.
// 최단 거리는 1번(0), 2·3번(1), 4·5·6번(2)이라 가장 먼 노드는 4, 5, 6번 3개다.
// 하지만 DFS로 첫 방문 깊이를 기록하면 1→3→4→2→5로 돌아가 5번만 거리 4가 되어 1개라고 오답을 낸다.
const N = 6;
const VERTEX: [number, number][] = [
  [3, 6],
  [4, 3],
  [3, 2],
  [1, 3],
  [1, 2],
  [2, 4],
  [5, 2],
];

const ADJ: number[][] = Array.from({ length: N + 1 }, () => []);
VERTEX.forEach(([a, b]) => {
  ADJ[a].push(b);
  ADJ[b].push(a);
});

const edgeKey = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;
const EDGE_INDEX = new Map<string, number>(VERTEX.map(([a, b], i) => [edgeKey(a, b), i]));
const edgeOf = (a: number, b: number) => EDGE_INDEX.get(edgeKey(a, b))!;
const fmtDist = (dist: number[]) => `[${dist.slice(1).map((d) => (d < 0 || d >= 99 ? '-' : String(d))).join(', ')}]`;

function holdCaptions(viz: Visualization): Visualization {
  for (const step of viz.steps) {
    const plan = planStep(step);
    step.phases.forEach((phase, i) => {
      const p = plan.phases[i];
      const tail = i < step.phases.length - 1 ? PHASE_GAP : step.isKeyframe ? KEYFRAME_TAIL : STEP_TAIL;
      const need = 20 * [...phase.caption].length;
      if (p.end - p.start + tail >= need) return;
      const actionsEnd = Math.max(p.start, ...p.actions.map((a) => a.start + a.duration)) - p.start;
      phase.actions.push({ type: 'wait', ms: Math.ceil(need - tail - actionsEnd) });
    });
  }
  return viz;
}

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BFS_CODE = {
  python: `from collections import deque

def solution(n, edge):
    graph = [[] for _ in range(n + 1)]
    for a, b in edge:
        graph[a].append(b)
        graph[b].append(a)

    dist = [-1] * (n + 1)
    dist[1] = 0
    queue = deque([1])

    while queue:
        now = queue.popleft()
        for nxt in graph[now]:
            if dist[nxt] == -1:  # 처음 닿는 순간이 곧 최단 거리입니다
                dist[nxt] = dist[now] + 1
                queue.append(nxt)

    farthest = max(dist)
    return dist.count(farthest)`,
  javascript: `function solution(n, edge) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edge) {
    graph[a].push(b);
    graph[b].push(a);
  }

  const dist = Array(n + 1).fill(-1);
  dist[1] = 0;
  const queue = [1];
  let head = 0; // shift() 대신 머리 인덱스를 씁니다

  while (head < queue.length) {
    const now = queue[head++];
    for (const nxt of graph[now]) {
      if (dist[nxt] === -1) { // 처음 닿는 순간이 곧 최단 거리입니다
        dist[nxt] = dist[now] + 1;
        queue.push(nxt);
      }
    }
  }

  const farthest = Math.max(...dist);
  return dist.filter((d) => d === farthest).length;
}`,
};
const BFS_AT = {
  start: lines(BFS_CODE, ['dist = [-1] * (n + 1)', 'dist[1] = 0', 'queue = deque([1])'], ['const dist = Array(n + 1).fill(-1)', 'dist[1] = 0', 'const queue = [1]']),
  pop: lines(BFS_CODE, ['while queue:', 'now = queue.popleft()'], ['while (head < queue.length)', 'const now = queue[head++]']),
  look: lines(BFS_CODE, ['for nxt in graph[now]:', 'if dist[nxt] == -1:'], ['for (const nxt of graph[now])', 'if (dist[nxt] === -1)']),
  push: lines(BFS_CODE, ['dist[nxt] = dist[now] + 1', 'queue.append(nxt)'], ['dist[nxt] = dist[now] + 1', 'queue.push(nxt)']),
  max: lines(BFS_CODE, ['farthest = max(dist)'], ['const farthest = Math.max(...dist)']),
  done: lines(BFS_CODE, ['farthest = max(dist)', 'return dist.count(farthest)'], ['const farthest = Math.max(...dist)', 'return dist.filter((d) => d === farthest).length']),
};

const BELLMAN_CODE = {
  python: `def solution(n, edge):
    INF = n + 1
    dist = [INF] * (n + 1)
    dist[1] = 0

    for _ in range(n - 1):  # 매 라운드 모든 간선을 훑으며 거리를 1씩 넓힙니다
        updated = False
        for a, b in edge:
            if dist[a] + 1 < dist[b]:
                dist[b] = dist[a] + 1
                updated = True
            if dist[b] + 1 < dist[a]:
                dist[a] = dist[b] + 1
                updated = True
        if not updated:
            break

    farthest = max(dist[1:])
    return dist[1:].count(farthest)`,
  javascript: `function solution(n, edge) {
  const INF = n + 1;
  const dist = Array(n + 1).fill(INF);
  dist[1] = 0;

  for (let round = 0; round < n - 1; round++) { // 매 라운드 모든 간선을 훑으며 거리를 1씩 넓힙니다
    let updated = false;
    for (const [a, b] of edge) {
      if (dist[a] + 1 < dist[b]) {
        dist[b] = dist[a] + 1;
        updated = true;
      }
      if (dist[b] + 1 < dist[a]) {
        dist[a] = dist[b] + 1;
        updated = true;
      }
    }
    if (!updated) break;
  }

  const slice = dist.slice(1);
  const farthest = Math.max(...slice);
  return slice.filter((d) => d === farthest).length;
}`,
};
const BEL_AT = {
  start: lines(BELLMAN_CODE, ['dist = [INF] * (n + 1)', 'dist[1] = 0'], ['const dist = Array(n + 1).fill(INF)', 'dist[1] = 0']),
  round: lines(BELLMAN_CODE, ['for _ in range(n - 1):', 'for a, b in edge:', 'if dist[a] + 1 < dist[b]:'], ['for (let round = 0', 'for (const [a, b] of edge)', 'if (dist[a] + 1 < dist[b])']),
  stop: lines(BELLMAN_CODE, ['if not updated:', 'break'], ['if (!updated) break']),
  done: lines(BELLMAN_CODE, ['farthest = max(dist[1:])', 'return dist[1:].count(farthest)'], ['const farthest = Math.max(...slice)', 'return slice.filter((d) => d === farthest).length']),
};

const DFS_TRAP = {
  python: `# 주의: DFS 방문 깊이를 최단 거리로 착각하는 오답 풀이입니다
import sys
sys.setrecursionlimit(30000)

def solution(n, edge):
    graph = [[] for _ in range(n + 1)]
    for a, b in edge:
        graph[a].append(b)
        graph[b].append(a)

    dist = [-1] * (n + 1)

    def dfs(now, d):
        dist[now] = d  # 처음 들어온 경로의 깊이를 그대로 거리로 적습니다
        for nxt in graph[now]:
            if dist[nxt] == -1:
                dfs(nxt, d + 1)

    dfs(1, 0)
    farthest = max(dist)
    return dist.count(farthest)`,
  javascript: `// 주의: DFS 방문 깊이를 최단 거리로 착각하는 오답 풀이입니다
function solution(n, edge) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edge) {
    graph[a].push(b);
    graph[b].push(a);
  }

  const dist = Array(n + 1).fill(-1);

  const dfs = (now, d) => {
    dist[now] = d; // 처음 들어온 경로의 깊이를 그대로 거리로 적습니다
    for (const nxt of graph[now]) {
      if (dist[nxt] === -1) dfs(nxt, d + 1);
    }
  };

  dfs(1, 0);
  const farthest = Math.max(...dist);
  return dist.filter((d) => d === farthest).length;
}`,
};
const TRAP_AT = {
  start: lines(DFS_TRAP, ['dist = [-1] * (n + 1)', 'dfs(1, 0)'], ['const dist = Array(n + 1).fill(-1)', 'dfs(1, 0)']),
  enter: lines(DFS_TRAP, ['def dfs(now, d):', 'dist[now] = d'], ['const dfs = (now, d) =>', 'dist[now] = d']),
  look: lines(DFS_TRAP, ['for nxt in graph[now]:', 'if dist[nxt] == -1:', 'dfs(nxt, d + 1)'], ['for (const nxt of graph[now])', 'if (dist[nxt] === -1) dfs(nxt, d + 1)']),
  done: lines(DFS_TRAP, ['farthest = max(dist)', 'return dist.count(farthest)'], ['const farthest = Math.max(...dist)', 'return dist.filter((d) => d === farthest).length']),
};

/* ------------------------------------------------------------------ */
/* 장면과 도구                                                          */
/* ------------------------------------------------------------------ */

const CELL = 54;
const W = 500;
const H = 350;
const FULL: Rect = { x: 0, y: 0, w: W, h: H };
const CENTERS: Record<number, Point> = {
  1: [70, 178],
  2: [205, 110],
  3: [205, 246],
  4: [340, 178],
  5: [440, 96],
  6: [440, 260],
};
const LANE: LaneOptions = { id: 'lane', x: 42, y: 6, slotW: 66, slotH: 30, gap: 6, max: 6 };

const rectOf = (v: number): Rect => ({ x: CENTERS[v][0] - CELL / 2, y: CENTERS[v][1] - CELL / 2, w: CELL, h: CELL });
const nid = (v: number) => `v:${v}`;
const eid = (i: number) => `e:${i}`;

function edgePoints(a: number, b: number): Point[] {
  const [[ax, ay], [bx, by]] = [CENTERS[a], CENTERS[b]];
  const len = Math.hypot(bx - ax, by - ay);
  const [ux, uy] = [(bx - ax) / len, (by - ay) / len];
  const gap = CELL / 2 / Math.max(Math.abs(ux), Math.abs(uy)) + 3;
  return [[ax + ux * gap, ay + uy * gap], [bx - ux * gap, by - uy * gap]];
}

function board(laneLabel?: string): Scene {
  const items: Item[] = [];
  if (laneLabel) {
    items.push(
      { id: 'lane:label', kind: 'text', rect: { x: 4, y: 6, w: 34, h: 30 }, text: laneLabel },
      { id: 'lane:bg', kind: 'zone', rect: { x: 38, y: 4, w: W - 42, h: 34 } },
    );
  } else {
    items.push({ id: 'top:info', kind: 'text', rect: { x: 12, y: 8, w: W - 24, h: 24 }, tone: 'muted', text: '간선 목록을 반복 순회하며 1번에서의 거리를 구합니다' });
  }
  VERTEX.forEach(([a, b], i) => {
    items.push({ id: eid(i), kind: 'line', rect: FULL, tone: 'trail', points: edgePoints(a, b) });
  });
  for (let v = 1; v <= N; v++) {
    items.push({
      id: nid(v),
      kind: 'cell',
      rect: rectOf(v),
      tone: v === 1 ? 'current' : 'plain',
      text: `${v}번`,
      sub: v === 1 ? '거리 0' : '-',
    });
  }
  items.push({ id: 'count', kind: 'token', rect: { x: 8, y: 312, w: 164, h: 30 }, tone: 'plain', text: '가장 먼 노드: -' });
  return { width: W, height: H, items };
}

const paint = (v: number, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: nid(v), patch, ...(pop ? { pop } : {}) });
const edgeTone = (i: number, tone: Tone): Action => ({ type: 'set', id: eid(i), patch: { tone } });
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const statusToken = (text: string, tone: Tone = 'plain'): Action => ({
  type: 'set',
  id: 'count',
  patch: { text, tone },
  pop: true,
});

/* ------------------------------------------------------------------ */
/* 정석: BFS 거리 배열                                                  */
/* ------------------------------------------------------------------ */

function bfsViz(): Visualization {
  const rec = new StepRecorder(board('큐'));
  const lane = new Lane(rec, LANE);
  const dist = Array<number>(N + 1).fill(-1);
  dist[1] = 0;
  const queue: number[] = [1];
  let work = 0;
  let now: number | '-' = '-';
  let farthest: number | '-' = '-';

  const meta = () => ({
    work,
    variables: { now, farthest, dist: fmtDist(dist), queue: `[${queue.join(', ')}]` },
  });

  rec.step({ title: '1번 노드에서 출발 (거리 0)', codeHighlights: BFS_AT.start, ...meta() });
  rec.phase('시작', '1번 노드의 거리를 0, 나머지를 -1(미방문)로 두고 큐에 1번을 넣습니다.', BFS_AT.start);
  lane.push({ id: 'q:1', text: '1번(0)' }, nid(1));
  rec.do(wait(400));

  while (queue.length > 0) {
    const u = queue.shift()!;
    now = u;
    const looks: { to: number; isNew: boolean; d: number; eIdx: number }[] = [];
    for (const nxt of ADJ[u]) {
      work++;
      const isNew = dist[nxt] === -1;
      if (isNew) {
        dist[nxt] = dist[u] + 1;
        queue.push(nxt);
      }
      looks.push({ to: nxt, isNew, d: dist[nxt], eIdx: edgeOf(u, nxt) });
    }
    const news = looks.filter((l) => l.isNew);
    const curMax = Math.max(...dist.slice(1));
    farthest = curMax;

    rec.step({
      title: news.length
        ? `${u}번(거리 ${dist[u]}) 꺼내기 → ${news.map((n) => `${n.to}번(거리 ${n.d})`).join(', ')} 발견`
        : `${u}번(거리 ${dist[u]}) 꺼내기 — 새 이웃 없음`,
      codeHighlights: news.length ? BFS_AT.push : BFS_AT.look,
      ...meta(),
    });

    rec.phase('꺼내기', `큐 맨 앞에서 ${u}번(거리 ${dist[u]})을 꺼냅니다.`, BFS_AT.pop);
    lane.shift(nid(u));
    rec.do(paint(u, { tone: 'current' }, true));

    const cap = looks
      .map((l) => (l.isNew ? `${l.to}번은 처음이라 거리 ${ro(l.d)} 기록` : `${l.to}번은 이미 거리 ${l.d}`))
      .join(', ');
    rec.phase('살피기', `${u}번과 이어진 노드를 확인합니다: ${cap}.`, news.length ? BFS_AT.push : BFS_AT.look);
    rec.do({ type: 'focus', ids: [nid(u), ...looks.map((l) => nid(l.to))] });
    for (const l of looks) {
      rec.do({
        type: 'arrow',
        from: nid(u),
        to: nid(l.to),
        verdict: l.isNew ? 'new' : 'seen',
        label: l.isNew ? `거리 ${l.d}` : '방문함',
      });
      if (l.isNew) {
        rec.do(...together([
          paint(l.to, { tone: 'queued', sub: `거리 ${l.d}` }, true),
          edgeTone(l.eIdx, 'path'),
        ], true));
      }
    }
    rec.do(wait(120), ...clear());

    if (news.length) {
      rec.phase('넣기', `새로 거리를 기록한 ${news.map((n) => `${n.to}번`).join(', ')}을 큐 뒤에 넣습니다.`, BFS_AT.push);
      for (const n of news) lane.push({ id: `q:${n.to}`, text: `${n.to}번(${n.d})` }, nid(n.to));
    }

    const maxCnt = dist.slice(1).filter((d) => d === curMax).length;
    rec.do(...together([
      paint(u, { tone: 'visited' }),
      statusToken(`최대 거리 ${curMax} (${maxCnt}개)`),
    ]));
  }

  now = '-';
  const maxD = Math.max(...dist.slice(1));
  farthest = maxD;
  const winners = [1, 2, 3, 4, 5, 6].filter((v) => dist[v] === maxD);
  const answer = winners.length;

  rec.step({ title: `최대 거리 ${maxD} 찾기`, codeHighlights: BFS_AT.max, ...meta() });
  rec.phase('최댓값 찾기', `모든 노드의 최단 거리가 구해졌습니다. 가장 먼 거리는 ${maxD}입니다.`, BFS_AT.max);
  rec.do(...together(winners.map((v) => paint(v, { tone: 'chosen' }, true))));

  rec.step({ title: `가장 먼 노드(거리 ${maxD}): ${winners.map((v) => `${v}번`).join(', ')} → ${answer}개`, codeHighlights: BFS_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('결과 확인', `거리가 ${maxD}인 노드는 ${winners.map((v) => `${v}번`).join(', ')}으로 모두 ${answer}개입니다.`, BFS_AT.done);
  rec.do(...together([
    ...winners.map((v) => paint(v, { tone: 'path' }, true)),
    statusToken(`가장 먼 노드: ${answer}개`, 'good'),
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 벨만-포드 (간선 반복 완화)                                      */
/* ------------------------------------------------------------------ */

function bellmanViz(): Visualization {
  const rec = new StepRecorder(board());
  const INF = N + 1;
  const dist = Array<number>(N + 1).fill(INF);
  dist[1] = 0;
  let work = 0;
  let round: number | '-' = '-';
  let updated = false;

  const meta = () => ({
    work,
    variables: { round, updated: updated ? 'True' : 'False', dist: fmtDist(dist) },
  });

  rec.step({ title: '1번 노드 거리 0으로 초기화', codeHighlights: BEL_AT.start, ...meta() });
  rec.phase('시작', '큐 없이 거리 배열만 두고, 매 라운드 모든 간선을 훑으며 거리를 줄입니다.', BEL_AT.start);
  rec.do(wait(500));

  for (let r = 1; r <= N - 1; r++) {
    round = r;
    updated = false;
    const changes: { from: number; to: number; nd: number; eIdx: number }[] = [];
    VERTEX.forEach(([a, b], idx) => {
      work += 2;
      if (dist[a] + 1 < dist[b]) {
        dist[b] = dist[a] + 1;
        updated = true;
        changes.push({ from: a, to: b, nd: dist[b], eIdx: idx });
      }
      if (dist[b] + 1 < dist[a]) {
        dist[a] = dist[b] + 1;
        updated = true;
        changes.push({ from: b, to: a, nd: dist[a], eIdx: idx });
      }
    });

    if (changes.length > 0) {
      rec.step({
        title: `${r}라운드: 간선 ${VERTEX.length}개 확인 → ${changes.map((c) => `${c.to}번(거리 ${c.nd})`).join(', ')} 갱신`,
        codeHighlights: BEL_AT.round,
        ...meta(),
      });
      rec.phase(
        '간선 훑기',
        `${r}라운드에서 간선 ${VERTEX.length}개를 양방향(${VERTEX.length * 2}번) 확인해 ${changes.map((c) => `${c.to}번을 거리 ${ro(c.nd)}`).join(', ')} 갱신합니다.`,
        BEL_AT.round,
      );
      for (const c of changes) {
        rec.do({ type: 'focus', ids: [nid(c.from), nid(c.to)] });
        rec.do({ type: 'arrow', from: nid(c.from), to: nid(c.to), verdict: 'good', label: `거리 ${c.nd}` });
        rec.do(...together([
          paint(c.to, { tone: 'visited', sub: `거리 ${c.nd}` }, true),
          edgeTone(c.eIdx, 'path'),
        ], true));
      }
      rec.do(wait(120), ...clear());
    } else {
      rec.step({ title: `${r}라운드: 더 바뀌는 거리 없음 → 종료`, codeHighlights: BEL_AT.stop, ...meta() });
      rec.phase('간선 훑기', `${r}라운드에서 모든 간선을 다시 확인했지만 더 줄어드는 거리가 없어 멈춥니다.`, BEL_AT.stop);
      rec.do(wait(500));
      break;
    }
  }

  round = '-';
  const maxD = Math.max(...dist.slice(1));
  const winners = [1, 2, 3, 4, 5, 6].filter((v) => dist[v] === maxD);
  const answer = winners.length;

  rec.step({ title: `가장 먼 노드(거리 ${maxD}): ${answer}개`, codeHighlights: BEL_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('결과 확인', `최대 거리는 ${maxD}이고 4, 5, 6번 ${answer}개입니다. 간선 확인 횟수는 ${work}번으로 BFS(14번)보다 많습니다.`, BEL_AT.done);
  rec.do(...together([
    ...winners.map((v) => paint(v, { tone: 'path' }, true)),
    statusToken(`가장 먼 노드: ${answer}개`, 'good'),
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: DFS로 처음 들어간 깊이를 거리로 기록                              */
/* ------------------------------------------------------------------ */

function dfsTrapViz(): Visualization {
  const rec = new StepRecorder(board('스택'));
  const lane = new Lane(rec, LANE);
  const dist = Array<number>(N + 1).fill(-1);
  const stack: number[] = [];
  let work = 0;
  let now: number | '-' = '-';
  const truth = 3;

  const meta = () => ({
    work,
    variables: { now, dist: fmtDist(dist), stack: `[${stack.join(', ')}]` },
  });

  rec.step({ title: '1번 노드에서 DFS 시작', codeHighlights: TRAP_AT.start, ...meta() });
  rec.phase('시작', 'DFS로 한 길을 끝까지 파고들며 처음 닿았을 때의 깊이를 거리로 적습니다.', TRAP_AT.start);
  rec.do(wait(500));

  const visit = (u: number, d: number, parent?: number) => {
    dist[u] = d;
    stack.push(u);
    now = u;

    const looks: { to: number; isNew: boolean; eIdx: number }[] = [];
    for (const nxt of ADJ[u]) {
      work++;
      const isNew = dist[nxt] === -1;
      looks.push({ to: nxt, isNew, eIdx: edgeOf(u, nxt) });
      if (isNew) break; // 첫 미방문 이웃으로 바로 재귀 진입
    }
    const nextNode = looks.find((l) => l.isNew)?.to;

    rec.step({
      title: parent
        ? `${parent}번 → ${u}번 진입 (깊이 ${d} 기록)`
        : `1번 진입 (깊이 0 기록)`,
      codeHighlights: TRAP_AT.enter,
      ...meta(),
    });
    rec.phase(
      '들어가기',
      parent
        ? `${parent}번에서 ${u}번으로 들어가 거리를 ${ro(d)} 기록합니다.`
        : `1번에서 출발해 거리를 0으로 기록합니다.`,
      TRAP_AT.enter,
    );
    lane.push({ id: `s:${u}`, text: `${u}번(${d})` }, nid(u));
    rec.do(...together([
      paint(u, { tone: 'current', sub: `거리 ${d}` }, true),
      ...(parent ? [paint(parent, { tone: 'trail' }), edgeTone(edgeOf(parent, u), 'path')] : []),
    ]));

    if (nextNode !== undefined) {
      rec.phase('살피기', `${u}번의 이웃을 보다가 아직 방문 전인 ${nextNode}번으로 바로 파고듭니다.`, TRAP_AT.look);
      rec.do({ type: 'focus', ids: [nid(u), ...looks.map((l) => nid(l.to))] });
      for (const l of looks) {
        rec.do({
          type: 'arrow',
          from: nid(u),
          to: nid(l.to),
          verdict: l.isNew ? 'new' : 'seen',
          label: l.isNew ? `깊이 ${d + 1} 진입` : '방문함',
        });
      }
      rec.do(wait(120), ...clear());
    }

    for (let i = 0; i < ADJ[u].length; i++) {
      const nxt = ADJ[u][i];
      if (i >= looks.length) work++;
      if (dist[nxt] === -1) {
        visit(nxt, d + 1, u);
      }
    }

    stack.pop();
    lane.pop(nid(u));
    rec.do(paint(u, { tone: 'visited' }));
  };

  visit(1, 0);

  now = '-';
  const maxD = Math.max(...dist.slice(1));
  const answer = dist.slice(1).filter((d) => d === maxD).length;
  rec.step({ title: `내 답 ${answer}개(5번 거리 ${maxD}), 정답은 ${truth}개`, codeHighlights: TRAP_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase(
    '오답 확인',
    `1→2 직통(거리 1)을 두고 1→3→4→2(거리 3)로 돌아가 기록하는 바람에, 2번(3)과 5번(4)의 거리가 부풀려져 최대 거리 노드가 5번 ${answer}개만 나왔습니다. 정답은 4, 5, 6번 ${truth}개입니다.`,
    TRAP_AT.done,
  );
  rec.do(...together([
    paint(2, { tone: 'bad', tag: '실제 1' }, true),
    paint(5, { tone: 'bad', tag: '실제 2' }, true),
    statusToken(`내 답: ${answer}개`, 'bad'),
    { type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 200, y: 312, w: 96, h: 30 }, tone: 'bad', text: `내 답 ${answer}개` } },
    { type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 304, y: 312, w: 96, h: 30 }, tone: 'good', text: `정답 ${truth}개` } },
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제 정의                                                            */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'farthest-node',
  title: '가장 먼 노드',
  level: 3,
  category: 'graph',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/49189',
  description: {
    summary:
      '1번부터 n번까지 번호가 붙은 노드가 양방향 간선으로 이어져 있습니다. 1번 노드에서 각 노드로 최단 경로로 이동했을 때, 거치는 간선의 개수가 가장 많은 노드가 모두 몇 개인지 구합니다.',
    rules: [
      '노드의 개수 n은 2 이상 20,000 이하',
      '간선은 양방향이며 1개 이상 50,000개 이하',
      'edge 배열의 각 원소 [a, b]는 a번 노드와 b번 노드 사이에 간선이 있다는 뜻',
    ],
    examples: [
      { input: 'n = 6, vertex = [[3, 6], [4, 3], [3, 2], [1, 3], [1, 2], [2, 4], [5, 2]]', output: '3' },
    ],
  },
  keyIntuitions: [
    '모든 간선의 가중치가 1(간선 개수)이므로, 1번에서 시작하는 너비 우선 탐색(BFS)으로 처음 도달하는 순간의 깊이가 곧 최단 거리입니다.',
    'dist 배열을 -1로 초기화해 두고 미방문 확인과 거리 기록을 한 번에 처리하면 O(N + E)로 끝납니다.',
    '사이클이 있는 그래프에서 DFS를 쓰면 돌아서 들어간 길의 깊이가 먼저 기록되어 최단 거리가 깨집니다.',
  ],
  demo: {
    input: [N, VERTEX],
    label: 'n = 6, vertex = [[3,6],[4,3],[3,2],[1,3],[1,2],[2,4],[5,2]]',
  },
  workUnit: '간선을 따라 이웃을 확인한 횟수',
  approaches: [
    {
      id: 'farthest-bfs',
      name: '너비 우선 탐색 (BFS 거리 배열)',
      rank: 'BEST',
      timeComplexity: 'O(N + E)',
      spaceComplexity: 'O(N + E)',
      verdict: '1번 노드에서 가까운 순서대로 한 겹씩 넓혀 가며 각 노드의 최단 거리를 한 번에 확정하는 정석 풀이입니다.',
      pros: [
        '가중치가 없는 그래프에서 처음 방문하는 순간이 항상 최단 거리임이 보장됩니다.',
        '모든 노드와 간선을 딱 한 번씩만 확인해 O(N + E)로 가장 빠릅니다.',
        'dist 배열 하나로 방문 여부(-1인지)와 최단 거리를 동시에 관리할 수 있습니다.',
      ],
      cons: ['JavaScript에서는 배열의 shift()가 O(N)이므로 머리 인덱스(head)를 두고 꺼내야 합니다.'],
      whyThisRank:
        '간선 가중치가 모두 같은 최단 거리 문제의 표준 해법으로, 시간·공간 복잡도와 구현 간결성 모두 최고입니다.',
      code: BFS_CODE,
      visualize: bfsViz,
    },
    {
      id: 'farthest-bellman',
      name: '벨만-포드 (간선 반복 완화)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × E)',
      spaceComplexity: 'O(N)',
      verdict: '큐와 인접 리스트 없이 간선 배열만 반복 순회해 답은 맞히지만, 같은 간선을 여러 라운드 다시 확인해 느립니다.',
      pros: [
        '인접 리스트나 큐를 만들지 않고 주어진 edge 배열을 그대로 순회해 코드가 단순합니다.',
        '더 이상 갱신이 일어나지 않는 라운드에서 바로 멈춰 불필요한 뒷 라운드를 줄입니다.',
      ],
      cons: [
        '매 라운드 모든 간선을 처음부터 다시 확인하므로 BFS보다 간선 확인 횟수가 배수로 늘어납니다.',
        '최악의 경우(일렬 그래프에서 역순 간선) O(N × E) 시간이 걸려 큰 입력에서는 느립니다.',
      ],
      whyThisRank:
        '최단 거리를 정확히 구하지만, 큐를 쓰는 BFS가 간선을 한 번씩만 보는 데 비해 매 라운드 간선 전체를 다시 훑는 손해가 있어 대안으로 둡니다.',
      code: BELLMAN_CODE,
      visualize: bellmanViz,
    },
    {
      id: 'farthest-dfs-trap',
      name: '깊이 우선 탐색 (DFS 깊이 기록)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N + E)',
      spaceComplexity: 'O(N + E)',
      verdict: '한 경로를 끝까지 파고들며 처음 닿은 깊이를 거리로 적으면, 돌아서 간 먼 길이 기록되어 오답이 나옵니다.',
      pros: ['재귀 함수 몇 줄로 작성할 수 있어 겉보기에는 간단합니다.'],
      cons: [
        '1번과 직접 이어진 2번(실제 거리 1)을 1→3→4→2 순서로 먼저 방문해 거리 3으로 잘못 기록합니다.',
        '2번에 연결된 5번의 거리도 4로 부풀려져 가장 먼 노드의 개수가 틀립니다.',
      ],
      whyThisRank:
        '트리가 아닌 일반 그래프에는 여러 경로가 있어 DFS의 첫 방문 깊이가 최단 거리가 아닙니다. 최단 간선 수는 반드시 BFS로 구해야 합니다.',
      code: DFS_TRAP,
      visualize: dfsTrapViz,
    },
  ],
  checks: {
    cases: [
      {
        args: [6, [[3, 6], [4, 3], [3, 2], [1, 3], [1, 2], [2, 4], [5, 2]]],
        expected: 3,
      },
      { args: [2, [[1, 2]]], expected: 1 },
      { args: [4, [[1, 2], [1, 3], [1, 4]]], expected: 3 },
      { args: [5, [[1, 2], [2, 3], [3, 4], [4, 5]]], expected: 1 },
      { args: [5, [[1, 2], [1, 3], [2, 4], [3, 4], [4, 5]]], expected: 1 },
    ],
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 7);
      const seen = new Set<string>();
      const edges: [number, number][] = [];
      const addEdge = (a: number, b: number) => {
        if (a === b) return;
        const k = edgeKey(a, b);
        if (seen.has(k)) return;
        seen.add(k);
        edges.push([a, b]);
      };
      for (let v = 2; v <= n; v++) {
        addEdge(v, 1 + Math.floor(rand() * (v - 1)));
      }
      const extra = Math.floor(rand() * n);
      for (let i = 0; i < extra; i++) {
        addEdge(1 + Math.floor(rand() * n), 1 + Math.floor(rand() * n));
      }
      return [n, edges];
    },
  },
};

export default problem;
