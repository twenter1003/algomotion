// 배달: 정석 다익스트라(최소 힙), 대안 벨만-포드(모든 도로 반복 완화), 함정 첫 방문에서 거리를 확정하는 BFS를 같은 마을 지도에서 비교한다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import type { Action, Item, ItemPatch, Point, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

// 시각화 입력: 1→3 직통 도로(시간 4)보다 1→2→3 우회 경로(1+1=2)가 더 빠르고, 4번도 1→2→3→4(시간 3)로 K=3 안에 닿는다.
// 첫 방문에서 바로 거리를 확정하는 BFS 함정은 3번(4)과 4번(4)을 K=3 밖으로 잘못 판정해 2곳만 센다.
const N = 5;
const K = 3;
const ROAD: [number, number, number][] = [
  [1, 2, 1],
  [1, 3, 4],
  [2, 3, 1],
  [2, 4, 3],
  [3, 4, 1],
  [4, 5, 2],
];
const INF = 99;

interface Neighbor { to: number; w: number; edgeIdx: number }
const ADJ: Neighbor[][] = Array.from({ length: N + 1 }, () => []);
ROAD.forEach(([a, b, w], i) => {
  ADJ[a].push({ to: b, w, edgeIdx: i });
  ADJ[b].push({ to: a, w, edgeIdx: i });
});

const fmtDist = (dist: number[]) => `[${dist.slice(1).map((d) => (d >= INF ? '∞' : String(d))).join(', ')}]`;

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

const DIJKSTRA = {
  python: `import heapq

def solution(N, road, K):
    graph = [[] for _ in range(N + 1)]
    for a, b, c in road:
        graph[a].append((b, c))
        graph[b].append((a, c))

    dist = [float('inf')] * (N + 1)
    dist[1] = 0
    heap = [(0, 1)]  # (거리, 마을) 최소 힙

    while heap:
        d, now = heapq.heappop(heap)
        if d > dist[now]:
            continue  # 이미 더 짧은 길을 찾았으면 건너뜁니다
        for nxt, w in graph[now]:
            nd = d + w
            if nd < dist[nxt]:  # 더 짧은 길을 찾으면 갱신합니다
                dist[nxt] = nd
                heapq.heappush(heap, (nd, nxt))

    return sum(1 for d in dist[1:] if d <= K)`,
  javascript: `function solution(N, road, K) {
  const graph = Array.from({ length: N + 1 }, () => []);
  for (const [a, b, c] of road) {
    graph[a].push([b, c]);
    graph[b].push([a, c]);
  }

  const dist = Array(N + 1).fill(Infinity);
  dist[1] = 0;
  const heap = [[0, 1]]; // [거리, 마을] — 가장 짧은 것부터 꺼냅니다

  while (heap.length > 0) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const [d, now] = heap.shift();
    if (d > dist[now]) continue; // 이미 더 짧은 길을 찾았으면 건너뜁니다
    for (const [nxt, w] of graph[now]) {
      const nd = d + w;
      if (nd < dist[nxt]) { // 더 짧은 길을 찾으면 갱신합니다
        dist[nxt] = nd;
        heap.push([nd, nxt]);
      }
    }
  }

  return dist.slice(1).filter((d) => d <= K).length;
}`,
};
const DIJ_AT = {
  start: lines(DIJKSTRA, ['dist = [float', 'dist[1] = 0', 'heap = [(0, 1)]'], ['const dist = Array', 'dist[1] = 0', 'const heap = [[0, 1]]']),
  pop: lines(DIJKSTRA, ['while heap:', 'd, now = heapq.heappop(heap)'], ['while (heap.length > 0)', 'const [d, now] = heap.shift()']),
  skip: lines(DIJKSTRA, ['if d > dist[now]:', 'continue'], ['if (d > dist[now]) continue']),
  relax: lines(DIJKSTRA, ['for nxt, w in graph[now]:', 'nd = d + w', 'if nd < dist[nxt]:'], ['for (const [nxt, w] of graph[now])', 'const nd = d + w', 'if (nd < dist[nxt])']),
  push: lines(DIJKSTRA, ['dist[nxt] = nd', 'heapq.heappush(heap, (nd, nxt))'], ['dist[nxt] = nd', 'heap.push([nd, nxt])']),
  done: lines(DIJKSTRA, ['return sum(1 for d in dist[1:] if d <= K)'], ['return dist.slice(1).filter((d) => d <= K).length']),
};

const BELLMAN = {
  python: `def solution(N, road, K):
    dist = [float('inf')] * (N + 1)
    dist[1] = 0

    for _ in range(N - 1):  # 최대 N - 1번 모든 도로를 살핍니다
        updated = False
        for a, b, c in road:
            if dist[a] + c < dist[b]:
                dist[b] = dist[a] + c
                updated = True
            if dist[b] + c < dist[a]:
                dist[a] = dist[b] + c
                updated = True
        if not updated:
            break  # 더 줄어든 거리가 없으면 일찍 마칩니다

    return sum(1 for d in dist[1:] if d <= K)`,
  javascript: `function solution(N, road, K) {
  const dist = Array(N + 1).fill(Infinity);
  dist[1] = 0;

  for (let round = 0; round < N - 1; round++) { // 최대 N - 1번 모든 도로를 살핍니다
    let updated = false;
    for (const [a, b, c] of road) {
      if (dist[a] + c < dist[b]) {
        dist[b] = dist[a] + c;
        updated = true;
      }
      if (dist[b] + c < dist[a]) {
        dist[a] = dist[b] + c;
        updated = true;
      }
    }
    if (!updated) break; // 더 줄어든 거리가 없으면 일찍 마칩니다
  }

  return dist.slice(1).filter((d) => d <= K).length;
}`,
};
const BEL_AT = {
  start: lines(BELLMAN, ['dist = [float', 'dist[1] = 0'], ['const dist = Array', 'dist[1] = 0']),
  round: lines(BELLMAN, ['for _ in range(N - 1):', 'for a, b, c in road:', 'if dist[a] + c < dist[b]:'], ['for (let round = 0', 'for (const [a, b, c] of road)', 'if (dist[a] + c < dist[b])']),
  stop: lines(BELLMAN, ['if not updated:', 'break'], ['if (!updated) break']),
  done: lines(BELLMAN, ['return sum(1 for d in dist[1:] if d <= K)'], ['return dist.slice(1).filter((d) => d <= K).length']),
};

const FIRST_VISIT_TRAP = {
  python: `# 주의: 처음 방문할 때 거리를 확정해 버리는 오답 풀이입니다
from collections import deque

def solution(N, road, K):
    graph = [[] for _ in range(N + 1)]
    for a, b, c in road:
        graph[a].append((b, c))
        graph[b].append((a, c))

    dist = [float('inf')] * (N + 1)
    visited = [False] * (N + 1)
    dist[1] = 0
    visited[1] = True
    queue = deque([1])

    while queue:
        now = queue.popleft()
        for nxt, w in graph[now]:
            if not visited[nxt]:  # 첫 방문에서 바로 확정해 돌아가는 빠른 길을 놓칩니다
                visited[nxt] = True
                dist[nxt] = dist[now] + w
                queue.append(nxt)

    return sum(1 for d in dist[1:] if d <= K)`,
  javascript: `// 주의: 처음 방문할 때 거리를 확정해 버리는 오답 풀이입니다
function solution(N, road, K) {
  const graph = Array.from({ length: N + 1 }, () => []);
  for (const [a, b, c] of road) {
    graph[a].push([b, c]);
    graph[b].push([a, c]);
  }

  const dist = Array(N + 1).fill(Infinity);
  const visited = Array(N + 1).fill(false);
  dist[1] = 0;
  visited[1] = true;
  const queue = [1];
  let head = 0;

  while (head < queue.length) {
    const now = queue[head++];
    for (const [nxt, w] of graph[now]) {
      if (!visited[nxt]) { // 첫 방문에서 바로 확정해 돌아가는 빠른 길을 놓칩니다
        visited[nxt] = true;
        dist[nxt] = dist[now] + w;
        queue.push(nxt);
      }
    }
  }

  return dist.slice(1).filter((d) => d <= K).length;
}`,
};
const TRAP_AT = {
  start: lines(FIRST_VISIT_TRAP, ['dist[1] = 0', 'visited[1] = True', 'queue = deque([1])'], ['dist[1] = 0', 'visited[1] = true', 'const queue = [1]']),
  pop: lines(FIRST_VISIT_TRAP, ['while queue:', 'now = queue.popleft()'], ['while (head < queue.length)', 'const now = queue[head++]']),
  look: lines(FIRST_VISIT_TRAP, ['for nxt, w in graph[now]:', 'if not visited[nxt]:'], ['for (const [nxt, w] of graph[now])', 'if (!visited[nxt])']),
  mark: lines(FIRST_VISIT_TRAP, ['visited[nxt] = True', 'dist[nxt] = dist[now] + w', 'queue.append(nxt)'], ['visited[nxt] = true', 'dist[nxt] = dist[now] + w', 'queue.push(nxt)']),
  done: lines(FIRST_VISIT_TRAP, ['return sum(1 for d in dist[1:] if d <= K)'], ['return dist.slice(1).filter((d) => d <= K).length']),
};

/* ------------------------------------------------------------------ */
/* 장면과 도구                                                          */
/* ------------------------------------------------------------------ */

const CELL = 54;
const W = 500;
const H = 350;
const FULL: Rect = { x: 0, y: 0, w: W, h: H };
const CENTERS: Record<number, Point> = {
  1: [66, 178],
  2: [200, 102],
  3: [200, 254],
  4: [336, 178],
  5: [448, 178],
};
const WEIGHT_POS: Point[] = [
  [118, 114], // 1-2 (1)
  [118, 224], // 1-3 (4)
  [208, 168], // 2-3 (1)
  [272, 114], // 2-4 (3)
  [272, 224], // 3-4 (1)
  [380, 150], // 4-5 (2)
];
const LANE: LaneOptions = { id: 'lane', x: 42, y: 6, slotW: 78, slotH: 30, gap: 6, max: 5, foldable: true };

const rectOf = (v: number): Rect => ({ x: CENTERS[v][0] - CELL / 2, y: CENTERS[v][1] - CELL / 2, w: CELL, h: CELL });
const nid = (v: number) => `v:${v}`;
const eid = (i: number) => `e:${i}`;
const wid = (i: number) => `w:${i}`;

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
    items.push({ id: 'top:info', kind: 'text', rect: { x: 12, y: 8, w: W - 24, h: 24 }, tone: 'muted', text: '모든 도로를 반복 확인해 최단 시간을 줄입니다' });
  }
  ROAD.forEach(([a, b, c], i) => {
    items.push({ id: eid(i), kind: 'line', rect: FULL, tone: 'trail', points: edgePoints(a, b) });
    items.push({ id: wid(i), kind: 'text', rect: { x: WEIGHT_POS[i][0], y: WEIGHT_POS[i][1], w: 28, h: 20 }, tone: 'muted', text: String(c) });
  });
  for (let v = 1; v <= N; v++) {
    items.push({
      id: nid(v),
      kind: 'cell',
      rect: rectOf(v),
      tone: v === 1 ? 'current' : 'plain',
      text: `${v}번`,
      sub: v === 1 ? '0' : '∞',
    });
  }
  items.push({ id: 'count', kind: 'token', rect: { x: 8, y: 312, w: 148, h: 30 }, tone: 'plain', text: `K ≤ ${K} 배달: 1곳` });
  return { width: W, height: H, items };
}

const paint = (v: number, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: nid(v), patch, ...(pop ? { pop } : {}) });
const edgeTone = (i: number, tone: Tone): Action => ({ type: 'set', id: eid(i), patch: { tone } });
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const countToken = (cnt: number, tone: Tone = 'plain'): Action => ({
  type: 'set',
  id: 'count',
  patch: { text: `K ≤ ${K} 배달: ${cnt}곳`, tone },
  pop: true,
});

/* ------------------------------------------------------------------ */
/* 정석: 다익스트라 (최소 힙)                                           */
/* ------------------------------------------------------------------ */

function dijkstraViz(): Visualization {
  const rec = new StepRecorder(board('힙'));
  const lane = new Lane(rec, LANE);
  const dist = [INF, 0, INF, INF, INF, INF];
  const parentEdge = Array<number>(N + 1).fill(-1);
  let heap: { id: string; d: number; v: number }[] = [];
  let seq = 0;
  let work = 0;
  let now: number | '-' = '-';
  let dNow: number | '-' = '-';

  const heapText = () => `[${heap.map((h) => `(${h.d},${h.v}번)`).join(', ')}]`;
  const countReachable = () => dist.slice(1).filter((d) => d <= K).length;
  const meta = () => ({
    work,
    variables: { now, d: dNow, K, dist: fmtDist(dist), heap: heapText() },
  });

  const startId = `h:${++seq}`;
  heap.push({ id: startId, d: 0, v: 1 });
  rec.step({ title: '1번 마을에서 출발 (거리 0)', codeHighlights: DIJ_AT.start, ...meta() });
  rec.phase('시작', '1번 마을의 최단 시간을 0, 나머지를 ∞로 두고 최소 힙에 1번(0)을 넣습니다.', DIJ_AT.start);
  lane.push({ id: startId, text: '1번(0)' }, nid(1));
  rec.do(wait(400));

  while (heap.length > 0) {
    const top = heap.shift()!;
    now = top.v;
    dNow = top.d;

    if (top.d > dist[top.v]) {
      rec.step({ title: `${top.v}번(${top.d}) 꺼내기 — 이미 더 짧은 시간 ${dist[top.v]} 있음`, codeHighlights: DIJ_AT.skip, ...meta() });
      rec.phase('꺼내기', `힙에서 ${top.v}번(시간 ${top.d})을 꺼냅니다.`, DIJ_AT.pop);
      lane.shift(nid(top.v));
      rec.phase('건너뛰기', `${top.v}번은 이미 최단 시간 ${josa(dist[top.v], '으로', '로')} 확정되어 있어 건너뜁니다.`, DIJ_AT.skip);
      rec.do({ type: 'focus', ids: [nid(top.v)] }, wait(350), ...clear());
      continue;
    }

    const checks: { to: number; w: number; edgeIdx: number; nd: number; old: number; improved: boolean }[] = [];
    for (const nb of ADJ[top.v]) {
      work++;
      const nd = top.d + nb.w;
      const old = dist[nb.to];
      const improved = nd < old;
      if (improved) dist[nb.to] = nd;
      checks.push({ to: nb.to, w: nb.w, edgeIdx: nb.edgeIdx, nd, old, improved });
    }
    const improvedList = checks.filter((c) => c.improved);

    // 힙에 넣을 항목들을 먼저 상태에 반영해 meta()가 단계 끝 시점의 heap과 일치하게 한다
    const pushedTokens: { id: string; d: number; v: number; edgeIdx: number }[] = [];
    for (const c of improvedList) {
      const id = `h:${++seq}`;
      heap.push({ id, d: c.nd, v: c.to });
      pushedTokens.push({ id, d: c.nd, v: c.to, edgeIdx: c.edgeIdx });
    }
    heap.sort((a, b) => a.d - b.d || a.v - b.v);

    rec.step({
      title: improvedList.length
        ? `${top.v}번(시간 ${top.d}) 확정 → ${improvedList.map((c) => `${c.to}번(${c.nd})`).join(', ')} 갱신`
        : `${top.v}번(시간 ${top.d}) 확정 — 더 줄어드는 이웃 없음`,
      codeHighlights: improvedList.length ? DIJ_AT.push : DIJ_AT.relax,
      ...meta(),
    });

    rec.phase('꺼내기', `힙에서 가장 시간이 짧은 ${top.v}번(시간 ${top.d})을 꺼내 최단 시간을 확정합니다.`, DIJ_AT.pop);
    lane.shift(nid(top.v));
    rec.do(paint(top.v, { tone: 'current' }, true));

    const relaxCaption = checks
      .map((c) => (c.improved
        ? `${c.to}번은 ${top.d}+${c.w}=${ro(c.nd)} (${c.old >= INF ? '∞' : c.old}보다 짧음)`
        : `${c.to}번은 ${top.d}+${c.w}=${c.nd} (기존 ${c.old} 유지)`))
      .join(', ');
    rec.phase('살피기', `${top.v}번과 이어진 도로를 확인합니다: ${relaxCaption}.`, DIJ_AT.relax);
    rec.do({ type: 'focus', ids: [nid(top.v), ...checks.map((c) => nid(c.to))] });
    for (const c of checks) {
      rec.do({
        type: 'arrow',
        from: nid(top.v),
        to: nid(c.to),
        verdict: c.improved ? 'good' : 'seen',
        label: c.improved ? `${c.nd} 단축!` : `${c.nd} ≥ ${c.old}`,
      });
      if (c.improved) {
        const acts: Action[] = [paint(c.to, { tone: 'queued', sub: String(c.nd) }, true), edgeTone(c.edgeIdx, 'path')];
        if (parentEdge[c.to] >= 0 && parentEdge[c.to] !== c.edgeIdx) acts.push(edgeTone(parentEdge[c.to], 'trail'));
        parentEdge[c.to] = c.edgeIdx;
        rec.do(...together(acts, true));
      }
    }
    rec.do(wait(120), ...clear());

    if (pushedTokens.length) {
      rec.phase('넣기', `시간이 줄어든 ${pushedTokens.map((t) => `${t.v}번(${t.d})`).join(', ')}을 최소 힙에 넣습니다.`, DIJ_AT.push);
      for (const t of pushedTokens) {
        lane.push({ id: t.id, text: `${t.v}번(${t.d})` }, nid(t.v));
      }
      lane.reorder(heap.map((h) => h.id));
    }

    rec.do(...together([
      paint(top.v, { tone: top.d <= K ? 'visited' : 'muted' }),
      countToken(countReachable()),
    ]));
  }

  const answer = countReachable();
  now = '-';
  dNow = '-';
  rec.step({ title: `K = ${K} 이하 배달 가능 마을: ${answer}곳`, codeHighlights: DIJ_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('결과 확인', `최단 시간이 ${K} 이하인 마을은 1번(0), 2번(1), 3번(2), 4번(3)으로 모두 ${answer}곳입니다.`, DIJ_AT.done);
  rec.do(...together([
    ...[1, 2, 3, 4].map((v) => paint(v, { tone: 'path' }, true)),
    paint(5, { tone: 'muted' }),
    countToken(answer, 'good'),
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 벨만-포드 (모든 도로 반복 완화)                                  */
/* ------------------------------------------------------------------ */

function bellmanViz(): Visualization {
  const rec = new StepRecorder(board());
  const dist = [INF, 0, INF, INF, INF, INF];
  let work = 0;
  let round: number | '-' = '-';
  let updated = false;

  const countReachable = () => dist.slice(1).filter((d) => d <= K).length;
  const meta = () => ({
    work,
    variables: { round, updated: updated ? 'True' : 'False', K, dist: fmtDist(dist) },
  });

  rec.step({ title: '1번 마을 시간 0으로 시작', codeHighlights: BEL_AT.start, ...meta() });
  rec.phase('시작', '힙 없이 배열만 두고, 매 라운드 모든 도로를 차례로 확인해 최단 시간을 줄입니다.', BEL_AT.start);
  rec.do(wait(600));

  for (let r = 1; r <= N - 1; r++) {
    round = r;
    updated = false;
    const changes: { from: number; to: number; nd: number; edgeIdx: number }[] = [];

    ROAD.forEach(([a, b, c], idx) => {
      work += 2;
      if (dist[a] + c < dist[b]) {
        dist[b] = dist[a] + c;
        updated = true;
        changes.push({ from: a, to: b, nd: dist[b], edgeIdx: idx });
      }
      if (dist[b] + c < dist[a]) {
        dist[a] = dist[b] + c;
        updated = true;
        changes.push({ from: b, to: a, nd: dist[a], edgeIdx: idx });
      }
    });

    if (changes.length > 0) {
      rec.step({
        title: `${r}라운드: 도로 ${ROAD.length}개 모두 확인 → ${changes.map((c) => `${c.to}번(${c.nd})`).join(', ')} 갱신`,
        codeHighlights: BEL_AT.round,
        ...meta(),
      });
      rec.phase(
        '도로 훑기',
        `${r}라운드에서 모든 도로를 양방향(${ROAD.length * 2}번) 비교해 ${changes.map((c) => `${c.from}→${c.to}(${c.nd})`).join(', ')}로 줄입니다.`,
        BEL_AT.round,
      );
      for (const c of changes) {
        rec.do({ type: 'focus', ids: [nid(c.from), nid(c.to)] });
        rec.do({ type: 'arrow', from: nid(c.from), to: nid(c.to), verdict: 'good', label: `${c.nd} 단축` });
        rec.do(...together([
          paint(c.to, { tone: c.nd <= K ? 'visited' : 'explored', sub: String(c.nd) }, true),
          edgeTone(c.edgeIdx, 'path'),
        ], true));
      }
      rec.do(wait(120), ...clear(), countToken(countReachable()));
    } else {
      rec.step({
        title: `${r}라운드: 더 줄어든 거리 없음 → 조기 종료`,
        codeHighlights: BEL_AT.stop,
        ...meta(),
      });
      rec.phase('도로 훑기', `${r}라운드에서 모든 도로를 다시 확인했지만 더 줄어드는 마을이 없어 반복을 마칩니다.`, BEL_AT.stop);
      rec.do(wait(600));
      break;
    }
  }

  const answer = countReachable();
  round = '-';
  rec.step({ title: `K = ${K} 이하 배달 가능 마을: ${answer}곳`, codeHighlights: BEL_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('결과 확인', `최단 시간이 ${K} 이하인 마을은 1, 2, 3, 4번으로 ${answer}곳입니다. 힙 없이 풀었지만 도로 확인은 ${work}번으로 다익스트라(12번)보다 많습니다.`, BEL_AT.done);
  rec.do(...together([
    ...[1, 2, 3, 4].map((v) => paint(v, { tone: 'path' }, true)),
    paint(5, { tone: 'muted' }),
    countToken(answer, 'good'),
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: 첫 방문에서 바로 거리를 확정하는 BFS                             */
/* ------------------------------------------------------------------ */

function firstVisitTrapViz(): Visualization {
  const rec = new StepRecorder(board('큐'));
  const lane = new Lane(rec, LANE);
  const dist = [INF, 0, INF, INF, INF, INF];
  const visited = [false, true, false, false, false, false];
  const queue: number[] = [1];
  let work = 0;
  let now: number | '-' = '-';
  const truth = 4;

  const countReachable = () => dist.slice(1).filter((d) => d <= K).length;
  const meta = () => ({
    work,
    variables: { now, K, dist: fmtDist(dist), queue: `[${queue.join(', ')}]` },
  });

  rec.step({ title: '1번 마을에서 BFS 시작', codeHighlights: TRAP_AT.start, ...meta() });
  rec.phase('시작', '1번 마을을 방문 확정하고 큐에 넣습니다. 가중치를 고려하지 않고 처음 닿을 때 바로 거리를 확정합니다.', TRAP_AT.start);
  lane.push({ id: 'q:1', text: '1번' }, nid(1));
  rec.do(wait(400));

  while (queue.length > 0) {
    const u = queue.shift()!;
    now = u;
    const looks: { to: number; w: number; edgeIdx: number; nd: number; isNew: boolean; missedBetter: boolean }[] = [];
    for (const nb of ADJ[u]) {
      work++;
      const nd = dist[u] + nb.w;
      const isNew = !visited[nb.to];
      const missedBetter = !isNew && nd < dist[nb.to];
      if (isNew) {
        visited[nb.to] = true;
        dist[nb.to] = nd;
        queue.push(nb.to);
      }
      looks.push({ to: nb.to, w: nb.w, edgeIdx: nb.edgeIdx, nd, isNew, missedBetter });
    }
    const news = looks.filter((l) => l.isNew);
    const missed = looks.filter((l) => l.missedBetter);

    rec.step({
      title: news.length
        ? `${u}번 꺼내기 → ${news.map((n) => `${n.to}번(${n.nd})`).join(', ')} 첫 방문 확정`
        : `${u}번 꺼내기 — 새로 방문할 마을 없음`,
      codeHighlights: news.length ? TRAP_AT.mark : TRAP_AT.look,
      ...meta(),
    });

    rec.phase('꺼내기', `큐에서 ${u}번(기록된 시간 ${dist[u]})을 꺼냅니다.`, TRAP_AT.pop);
    lane.shift(nid(u));
    rec.do(paint(u, { tone: 'current' }, true));

    const lookCap = looks
      .map((l) => {
        if (l.isNew) return `${l.to}번은 첫 방문이라 시간 ${ro(l.nd)} 확정`;
        if (l.missedBetter) return `${l.to}번은 ${l.nd}로 더 빠르지만 이미 방문해 무시`;
        return `${l.to}번은 이미 방문함`;
      })
      .join(', ');
    rec.phase('살피기', `${u}번의 이웃을 확인합니다: ${lookCap}.`, news.length ? TRAP_AT.mark : TRAP_AT.look);
    rec.do({ type: 'focus', ids: [nid(u), ...looks.map((l) => nid(l.to))] });
    for (const l of looks) {
      const verdict: Verdict = l.isNew ? 'new' : l.missedBetter ? 'bad' : 'seen';
      const label = l.isNew ? `첫 방문 ${l.nd}` : l.missedBetter ? `${l.nd} < ${dist[l.to]} 무시!` : '방문함';
      rec.do({ type: 'arrow', from: nid(u), to: nid(l.to), verdict, label });
      if (l.isNew) {
        rec.do(...together([
          paint(l.to, { tone: 'queued', sub: String(l.nd) }, true),
          edgeTone(l.edgeIdx, 'path'),
        ], true));
      }
    }
    rec.do(wait(120), ...clear());

    if (news.length) {
      rec.phase('넣기', `처음 방문한 ${news.map((n) => `${n.to}번`).join(', ')}을 큐에 넣습니다.`, TRAP_AT.mark);
      for (const n of news) lane.push({ id: `q:${n.to}`, text: `${n.to}번` }, nid(n.to));
    }

    rec.do(...together([
      paint(u, { tone: dist[u] <= K ? 'visited' : 'bad' }),
      countToken(countReachable()),
    ]));
    if (missed.length) {
      rec.do(wait(150));
    }
  }

  const answer = countReachable();
  now = '-';
  rec.step({ title: `내 답 ${answer}곳, 정답은 ${truth}곳`, codeHighlights: TRAP_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase(
    '오답 확인',
    `1→3 직통(4)과 1→2→4(4)를 첫 방문에서 확정하는 바람에, 1→2→3(2)과 1→2→3→4(3)이라는 더 빠른 길을 놓쳤습니다. 내 답은 ${answer}곳이지만 정답은 ${truth}곳입니다.`,
    TRAP_AT.done,
  );
  rec.do(...together([
    paint(3, { tone: 'bad', tag: '실제 2' }, true),
    paint(4, { tone: 'bad', tag: '실제 3' }, true),
    countToken(answer, 'bad'),
    { type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 210, y: 312, w: 96, h: 30 }, tone: 'bad', text: `내 답 ${answer}곳` } },
    { type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 314, y: 312, w: 96, h: 30 }, tone: 'good', text: `정답 ${truth}곳` } },
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제 정의                                                            */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'delivery',
  title: '배달',
  level: 2,
  category: 'graph',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12978',
  description: {
    summary:
      '1번부터 N번까지 번호가 붙은 마을들이 양방향 도로로 이어져 있고, 도로마다 지나는 데 걸리는 시간이 다릅니다. 1번 마을에 있는 음식점에서 출발해 K시간 이하로 배달할 수 있는 마을이 모두 몇 곳인지(1번 마을 포함) 구합니다.',
    rules: [
      '마을의 개수 N은 1 이상 50 이하의 자연수',
      'road의 길이는 1 이상 2,000 이하이고, 각 원소 [a, b, c]는 a번과 b번 마을을 잇는 도로의 소요 시간이 c라는 뜻 (1 ≤ c ≤ 10,000)',
      '두 마을을 잇는 도로가 여러 개 있을 수 있음',
      '배달 가능 시간 K는 1 이상 500,000 이하의 자연수',
    ],
    examples: [
      { input: 'N = 5, road = [[1,2,1],[2,3,3],[5,2,2],[1,4,2],[5,3,1],[5,4,2]], K = 3', output: '4' },
      { input: 'N = 6, road = [[1,2,1],[1,3,2],[2,3,2],[3,4,3],[3,5,2],[3,5,3],[5,6,1]], K = 4', output: '4' },
    ],
  },
  keyIntuitions: [
    '도로마다 걸리는 시간이 다르므로, 거쳐 간 도로 수가 적다고 해서 더 빨리 도착하는 것이 아닙니다. 1번 마을에서 모든 마을까지의 가중치 최단 시간을 구해야 합니다.',
    '다익스트라 알고리즘은 최소 힙에서 지금까지 가장 짧은 시간의 마을을 꺼내 확정하고, 그 마을을 거쳐 이웃으로 가는 시간이 기존보다 짧아질 때만 갱신합니다.',
    '두 마을 사이에 도로가 여러 개 있어도 "기존 최단 시간보다 짧을 때만 갱신"하는 규칙 하나면 가장 빠른 도로만 자연스럽게 반영됩니다.',
  ],
  demo: {
    input: [N, ROAD, K],
    label: 'N = 5, road = [[1,2,1],[1,3,4],[2,3,1],[2,4,3],[3,4,1],[4,5,2]], K = 3',
  },
  workUnit: '이웃 도로를 살핀 횟수',
  approaches: [
    {
      id: 'delivery-dijkstra',
      name: '다익스트라 (최소 힙)',
      rank: 'BEST',
      timeComplexity: 'O((N + E) log N)',
      spaceComplexity: 'O(N + E)',
      verdict: '최소 힙으로 가장 가까운 마을부터 최단 시간을 확정해 나가며, 도로를 필요한 만큼만 살피는 정석 풀이입니다.',
      pros: [
        '가장 짧은 시간의 마을부터 확정하므로 한 번 확정된 마을의 이웃 도로는 딱 한 번만 살핍니다.',
        '두 마을 사이에 여러 도로가 있어도 별도 전처리 없이 더 짧은 시간만 남깁니다.',
        '마을과 도로가 훨씬 많아져도 O((N + E) log N)으로 빠르게 동작합니다.',
      ],
      cons: ['최소 힙에 옛 기록이 남을 수 있어 꺼낼 때 `d > dist[now]`인지 한 줄 확인해야 합니다.'],
      whyThisRank:
        '양수 가중치 그래프에서 한 출발점의 최단 거리를 구하는 가장 빠르고 표준적인 풀이입니다.',
      code: DIJKSTRA,
      visualize: dijkstraViz,
    },
    {
      id: 'delivery-bellman-ford',
      name: '벨만-포드 (모든 도로 반복 완화)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × E)',
      spaceComplexity: 'O(N)',
      verdict: '힙 없이 이중 반복문만으로 짤 수 있지만, 이미 확정된 도로까지 매 라운드 다시 확인해 연산이 더 많습니다.',
      pros: [
        '우선순위 큐(힙) 자료구조 없이 배열과 반복문만으로 간단하게 구현할 수 있습니다.',
        '더 이상 줄어드는 거리가 없을 때 일찍 멈추면 실제 라운드 수를 줄일 수 있습니다.',
      ],
      cons: [
        '매 라운드 모든 도로를 처음부터 끝까지 다시 살피므로 다익스트라보다 도로 확인 횟수가 훨씬 많습니다.',
        '정점과 간선이 많은 문제에서는 시간 초과가 나기 쉽습니다(이 문제는 N ≤ 50이라 통과합니다).',
      ],
      whyThisRank:
        '정답은 같고 코드가 짧지만, 다익스트라가 도로를 한 번씩만 살피는 데 비해 같은 도로를 여러 라운드 반복 확인하는 손해가 있어 대안으로 둡니다.',
      code: BELLMAN,
      visualize: bellmanViz,
    },
    {
      id: 'delivery-first-visit-bfs',
      name: '첫 방문에서 거리를 확정하는 BFS',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N + E)',
      spaceComplexity: 'O(N + E)',
      verdict: '처음 닿았을 때 바로 방문 표시를 해 버리면, 여러 마을을 거쳐 더 빠르게 돌아가는 길을 무시해 오답이 나옵니다.',
      pros: ['가중치 없는 BFS 코드를 거의 그대로 써서 구현이 익숙합니다.'],
      cons: [
        '1→3 직통 도로(시간 4)를 먼저 보았다는 이유만으로 3번을 확정해 버려, 1→2→3 우회 도로(시간 2)를 무시합니다.',
        '그 여파로 3번을 거쳐 가는 4번 마을의 시간도 3이 아닌 4로 잘못 계산되어 배달 가능 마을에서 빠집니다.',
      ],
      whyThisRank:
        '도로마다 시간이 다른 그래프에서는 먼저 발견한 길이 최단 경로라는 보장이 없습니다. 방문 여부(`visited`)로 막지 말고, 더 짧은 시간이 나올 때마다 갱신해야 합니다.',
      code: FIRST_VISIT_TRAP,
      visualize: firstVisitTrapViz,
    },
  ],
  checks: {
    cases: [
      {
        args: [5, [[1, 2, 1], [2, 3, 3], [5, 2, 2], [1, 4, 2], [5, 3, 1], [5, 4, 2]], 3],
        expected: 4,
      },
      {
        args: [6, [[1, 2, 1], [1, 3, 2], [2, 3, 2], [3, 4, 3], [3, 5, 2], [3, 5, 3], [5, 6, 1]], 4],
        expected: 4,
      },
      { args: [1, [[1, 1, 1]], 1], expected: 1 },
      { args: [3, [[1, 2, 5], [1, 2, 2], [2, 3, 1]], 3], expected: 3 },
      { args: [4, [[1, 2, 10], [2, 3, 10], [3, 4, 10]], 5], expected: 1 },
      { args: [N, ROAD, K], expected: 4 },
    ],
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 6);
      const road: [number, number, number][] = [];
      for (let v = 2; v <= n; v++) {
        const u = 1 + Math.floor(rand() * (v - 1));
        road.push([u, v, 1 + Math.floor(rand() * 10)]);
      }
      const extra = Math.floor(rand() * n);
      for (let i = 0; i < extra; i++) {
        const a = 1 + Math.floor(rand() * n);
        const b = 1 + Math.floor(rand() * n);
        if (a !== b) road.push([a, b, 1 + Math.floor(rand() * 10)]);
      }
      const k = 1 + Math.floor(rand() * 15);
      return [n, road, k];
    },
  },
};

export default problem;
