// 섬 연결하기: 정석 크루스칼 + 유니온 파인드, 대안 프림(매번 이어진 섬에서 가장 싼 다리 찾기),
// 함정 유니온 파인드 없이 visited 배열만으로 사이클을 판정하는 풀이를 같은 섬 지도에서 비교한다.
import type { Action, Item, ItemPatch, Point, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

// 시각화 입력: 섬 5개(0~4번), 다리 7개.
// [0,1,1], [1,2,2]로 {0,1,2}가 묶이고(중간에 [0,2,3]은 사이클이라 건너뜀), [3,4,3]으로 {3,4}가 묶인다.
// 이때 [2,3,4]는 두 묶음을 이어 주는 필수 다리지만, visited 배열만 보는 함정은 2번과 3번이 모두 visited=True라며 건너뛰어 오답(6)을 낸다.
const N = 5;
const COSTS: [number, number, number][] = [
  [0, 2, 3],
  [0, 1, 1],
  [1, 2, 2],
  [3, 4, 3],
  [2, 3, 4],
  [1, 3, 5],
  [2, 4, 6],
];
const SORTED: [number, number, number][] = [...COSTS].sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1]);

const edgeKey = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;
const COST_INDEX = new Map<string, number>(COSTS.map(([a, b], i) => [edgeKey(a, b), i]));
const edgeOf = (a: number, b: number) => COST_INDEX.get(edgeKey(a, b))!;

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

const KRUSKAL = {
  python: `def solution(n, costs):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total = 0
    for a, b, cost in sorted(costs, key=lambda e: e[2]):
        ra, rb = find(a), find(b)
        if ra != rb:  # 서로 다른 묶음일 때만 다리를 놓습니다
            parent[rb] = ra
            total += cost
    return total`,
  javascript: `function solution(n, costs) {
  const parent = Array.from({ length: n }, (_, i) => i);

  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  let total = 0;
  const sorted = [...costs].sort((a, b) => a[2] - b[2]);
  for (const [a, b, cost] of sorted) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) { // 서로 다른 묶음일 때만 다리를 놓습니다
      parent[rb] = ra;
      total += cost;
    }
  }
  return total;
}`,
};
const KRU_AT = {
  start: lines(KRUSKAL, ['parent = list(range(n))', 'for a, b, cost in sorted'], ['const parent = Array.from', 'const sorted = [...costs].sort']),
  check: lines(KRUSKAL, ['for a, b, cost in sorted', 'ra, rb = find(a), find(b)', 'if ra != rb:'], ['for (const [a, b, cost] of sorted)', 'const ra = find(a)', 'if (ra !== rb)']),
  union: lines(KRUSKAL, ['parent[rb] = ra', 'total += cost'], ['parent[rb] = ra', 'total += cost']),
  done: lines(KRUSKAL, ['return total'], ['return total']),
};

const PRIM = {
  python: `def solution(n, costs):
    connected = [False] * n
    connected[0] = True  # 0번 섬에서 시작합니다
    total = 0

    for _ in range(n - 1):
        best_cost = float('inf')
        best_next = -1
        for a, b, cost in costs:  # 매번 모든 다리를 훑어 가장 싼 다리를 찾습니다
            if connected[a] != connected[b] and cost < best_cost:
                best_cost = cost
                best_next = b if connected[a] else a
        connected[best_next] = True
        total += best_cost

    return total`,
  javascript: `function solution(n, costs) {
  const connected = Array(n).fill(false);
  connected[0] = true; // 0번 섬에서 시작합니다
  let total = 0;

  for (let step = 0; step < n - 1; step++) {
    let bestCost = Infinity;
    let bestNext = -1;
    for (const [a, b, cost] of costs) { // 매번 모든 다리를 훑어 가장 싼 다리를 찾습니다
      if (connected[a] !== connected[b] && cost < bestCost) {
        bestCost = cost;
        bestNext = connected[a] ? b : a;
      }
    }
    connected[bestNext] = true;
    total += bestCost;
  }

  return total;
}`,
};
const PRIM_AT = {
  start: lines(PRIM, ['connected = [False] * n', 'connected[0] = True'], ['const connected = Array(n).fill(false)', 'connected[0] = true']),
  scan: lines(PRIM, ['for a, b, cost in costs:', 'if connected[a] != connected[b] and cost < best_cost:'], ['for (const [a, b, cost] of costs)', 'if (connected[a] !== connected[b] && cost < bestCost)']),
  pick: lines(PRIM, ['connected[best_next] = True', 'total += best_cost'], ['connected[bestNext] = true', 'total += bestCost']),
  done: lines(PRIM, ['return total'], ['return total']),
};

const VISITED_TRAP = {
  python: `# 주의: 대표 번호(Union-Find) 대신 단순 visited 배열만 쓰는 오답 풀이입니다
def solution(n, costs):
    visited = [False] * n
    total = 0

    for a, b, cost in sorted(costs, key=lambda e: e[2]):
        # 두 섬 모두 방문 기록이 있으면 이미 이어졌다고 착각합니다
        if visited[a] and visited[b]:
            continue
        visited[a] = True
        visited[b] = True
        total += cost

    return total`,
  javascript: `// 주의: 대표 번호(Union-Find) 대신 단순 visited 배열만 쓰는 오답 풀이입니다
function solution(n, costs) {
  const visited = Array(n).fill(false);
  let total = 0;

  const sorted = [...costs].sort((a, b) => a[2] - b[2]);
  for (const [a, b, cost] of sorted) {
    // 두 섬 모두 방문 기록이 있으면 이미 이어졌다고 착각합니다
    if (visited[a] && visited[b]) continue;
    visited[a] = true;
    visited[b] = true;
    total += cost;
  }

  return total;
}`,
};
const TRAP_AT = {
  start: lines(VISITED_TRAP, ['visited = [False] * n', 'for a, b, cost in sorted'], ['const visited = Array(n).fill(false)', 'const sorted = [...costs].sort']),
  skip: lines(VISITED_TRAP, ['if visited[a] and visited[b]:', 'continue'], ['if (visited[a] && visited[b]) continue']),
  pick: lines(VISITED_TRAP, ['visited[a] = True', 'visited[b] = True', 'total += cost'], ['visited[a] = true', 'visited[b] = true', 'total += cost']),
  done: lines(VISITED_TRAP, ['return total'], ['return total']),
};

/* ------------------------------------------------------------------ */
/* 장면과 도구                                                          */
/* ------------------------------------------------------------------ */

const CELL = 54;
const W = 500;
const H = 350;
const FULL: Rect = { x: 0, y: 0, w: W, h: H };
const CENTERS: Record<number, Point> = {
  0: [68, 122],
  1: [68, 250],
  2: [236, 186],
  3: [364, 250],
  4: [436, 122],
};
const WEIGHT_POS: Point[] = [
  [144, 126], // 0-2 (4)
  [36, 176],  // 0-1 (1)
  [144, 226], // 1-2 (2)
  [292, 198], // 2-3 (1)
  [208, 262], // 1-3 (5)
  [324, 126], // 2-4 (3)
  [412, 186], // 3-4 (6)
];

const rectOf = (v: number): Rect => ({ x: CENTERS[v][0] - CELL / 2, y: CENTERS[v][1] - CELL / 2, w: CELL, h: CELL });
const cardRect = (i: number): Rect => ({ x: 8 + i * 70, y: 6, w: 64, h: 34 });
const nid = (v: number) => `v:${v}`;
const eid = (i: number) => `e:${i}`;
const wid = (i: number) => `w:${i}`;
const cid = (i: number) => `c:${i}`;

function edgePoints(a: number, b: number): Point[] {
  const [[ax, ay], [bx, by]] = [CENTERS[a], CENTERS[b]];
  const len = Math.hypot(bx - ax, by - ay);
  const [ux, uy] = [(bx - ax) / len, (by - ay) / len];
  const gap = CELL / 2 / Math.max(Math.abs(ux), Math.abs(uy)) + 3;
  return [[ax + ux * gap, ay + uy * gap], [bx - ux * gap, by - uy * gap]];
}

function board(edgesForCards: [number, number, number][], subText: (v: number) => string): Scene {
  const items: Item[] = [];
  edgesForCards.forEach(([a, b, c], i) => {
    items.push({ id: cid(i), kind: 'token', rect: cardRect(i), tone: 'plain', text: `${a}-${b}(${c})` });
  });
  COSTS.forEach(([a, b, c], i) => {
    items.push({ id: eid(i), kind: 'line', rect: FULL, tone: 'trail', points: edgePoints(a, b) });
    items.push({ id: wid(i), kind: 'text', rect: { x: WEIGHT_POS[i][0], y: WEIGHT_POS[i][1], w: 26, h: 20 }, tone: 'muted', text: String(c) });
  });
  for (let v = 0; v < N; v++) {
    items.push({ id: nid(v), kind: 'cell', rect: rectOf(v), tone: 'plain', text: `${v}번`, sub: subText(v) });
  }
  items.push({ id: 'total', kind: 'token', rect: { x: 8, y: 312, w: 156, h: 30 }, tone: 'plain', text: '총 비용 0 (0/4개)' });
  return { width: W, height: H, items };
}

const paint = (v: number, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: nid(v), patch, ...(pop ? { pop } : {}) });
const cardPatch = (i: number, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: cid(i), patch, ...(pop ? { pop } : {}) });
const edgeTone = (i: number, tone: Tone): Action => ({ type: 'set', id: eid(i), patch: { tone } });
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const totalToken = (cost: number, picked: number, tone: Tone = 'plain'): Action => ({
  type: 'set',
  id: 'total',
  patch: { text: `총 비용 ${cost} (${picked}/${N - 1}개)`, tone },
  pop: true,
});

/* ------------------------------------------------------------------ */
/* 정석: 크루스칼 + 유니온 파인드                                        */
/* ------------------------------------------------------------------ */

function kruskalViz(): Visualization {
  const rec = new StepRecorder(board(SORTED, (v) => `대표 ${v}`));
  const parent = Array.from({ length: N }, (_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) x = parent[x];
    return x;
  };
  let total = 0;
  let picked = 0;
  let work = 0;
  let bridge = '-';

  const meta = () => ({
    work,
    variables: {
      bridge,
      picked: `${picked}/${N - 1}`,
      total,
      parent: `[${parent.map((_, i) => find(i)).join(', ')}]`,
    },
  });

  rec.step({ title: '다리를 비용 오름차순으로 정렬하고 대표 번호 초기화', codeHighlights: KRU_AT.start, ...meta() });
  rec.phase('정렬·초기화', '다리 7개를 비용이 싼 순서로 정렬하고, 각 섬의 대표 번호(parent)를 자기 자신으로 초기화합니다.', KRU_AT.start);
  rec.do(wait(500));

  for (let i = 0; i < SORTED.length; i++) {
    const [a, b, cost] = SORTED[i];
    const ra = find(a);
    const rb = find(b);
    const diff = ra !== rb;
    work++;
    bridge = `${a}-${b}(비용 ${cost})`;
    if (diff) {
      parent[rb] = ra;
      total += cost;
      picked++;
    }
    const eIdx = edgeOf(a, b);

    rec.step({
      title: diff
        ? `다리 ${a}-${b}(비용 ${cost}) 선택 — 묶음 ${ra}와 ${rb} 합치기 (총 비용 ${total})`
        : `다리 ${a}-${b}(비용 ${cost}) 건너뜀 — 둘 다 대표 ${ra} (사이클)`,
      codeHighlights: diff ? KRU_AT.union : KRU_AT.check,
      ...meta(),
    });

    rec.phase(
      '대표 확인',
      diff
        ? `${a}번의 대표는 ${ra}, ${b}번의 대표는 ${ro(rb)} 서로 다른 묶음입니다.`
        : `${a}번과 ${b}번의 대표가 둘 다 ${ro(ra)} 이미 같은 묶음입니다.`,
      KRU_AT.check,
    );
    rec.do({ type: 'focus', ids: [cid(i), nid(a), nid(b)] });
    rec.do({
      type: 'arrow',
      from: nid(a),
      to: nid(b),
      verdict: diff ? 'good' : 'bad',
      label: diff ? `대표 ${ra} ≠ ${rb}` : `대표 ${ra} = ${rb}`,
    });

    if (diff) {
      rec.phase('다리 놓기', `다리 ${a}-${b}(비용 ${cost})를 건설하고 대표를 ${ro(ra)} 합칩니다. 총 비용은 ${total}입니다.`, KRU_AT.union);
      const updatedNodes = Array.from({ length: N }, (_, v) => v).filter((v) => find(v) === ra);
      rec.do(...together([
        ...clear(),
        cardPatch(i, { tone: 'good' }, true),
        edgeTone(eIdx, 'path'),
        ...updatedNodes.map((v) => paint(v, { tone: 'visited', sub: `대표 ${find(v)}` }, v === a || v === b)),
        totalToken(total, picked),
      ]));
    } else {
      rec.phase('건너뛰기', `다리를 놓으면 사이클이 생기므로 건너뜁니다.`, KRU_AT.check);
      rec.do(...together([
        ...clear(),
        cardPatch(i, { tone: 'muted' }),
      ]));
    }
  }

  bridge = '-';
  rec.step({ title: `모든 섬 연결 완료 — 최소 비용 ${total}`, codeHighlights: KRU_AT.done, ...meta(), answer: total, isKeyframe: true });
  rec.phase('결과 확인', `다리 ${N - 1}개로 5개 섬이 모두 하나의 묶음(대표 0)으로 이어졌습니다. 최소 비용은 ${total}입니다.`, KRU_AT.done);
  rec.do(...together([
    ...Array.from({ length: N }, (_, v) => paint(v, { tone: 'path' }, true)),
    totalToken(total, picked, 'good'),
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 프림 (매 단계 이어진 섬과 안 이어진 섬 사이의 최소 다리 탐색)     */
/* ------------------------------------------------------------------ */

function primViz(): Visualization {
  const rec = new StepRecorder(board(COSTS, (v) => (v === 0 ? '연결됨' : '대기')));
  const connected = Array<boolean>(N).fill(false);
  connected[0] = true;
  let total = 0;
  let picked = 0;
  let work = 0;
  let round: number | '-' = '-';

  const connText = () => `[${connected.map((c, i) => (c ? i : null)).filter((v) => v !== null).join(', ')}]`;
  const meta = () => ({
    work,
    variables: { round, picked: `${picked}/${N - 1}`, total, connected: connText() },
  });

  rec.step({ title: '0번 섬에서 시작', codeHighlights: PRIM_AT.start, ...meta() });
  rec.phase('시작', '0번 섬만 연결된 상태로 시작해, 매 단계마다 모든 다리를 훑어 새 섬으로 가는 가장 싼 다리를 고릅니다.', PRIM_AT.start);
  rec.do(paint(0, { tone: 'visited', sub: '연결됨' }, true), wait(400));

  for (let s = 1; s <= N - 1; s++) {
    round = s;
    let bestCost = Infinity;
    let bestNext = -1;
    let bestFrom = -1;
    let bestIdx = -1;
    const candidates: { idx: number; from: number; to: number; cost: number }[] = [];

    COSTS.forEach(([a, b, cost], idx) => {
      work++;
      if (connected[a] !== connected[b]) {
        const from = connected[a] ? a : b;
        const to = connected[a] ? b : a;
        candidates.push({ idx, from, to, cost });
        if (cost < bestCost) {
          bestCost = cost;
          bestNext = to;
          bestFrom = from;
          bestIdx = idx;
        }
      }
    });

    connected[bestNext] = true;
    total += bestCost;
    picked++;

    rec.step({
      title: `${s}단계: 다리 ${COSTS.length}개 모두 확인 → ${bestFrom}-${bestNext}(비용 ${bestCost}) 선택`,
      codeHighlights: PRIM_AT.pick,
      ...meta(),
    });

    const candText = candidates.map((c) => `${c.from}-${c.to}(${c.cost})`).join(', ');
    rec.phase(
      '후보 찾기',
      `모든 다리 ${COSTS.length}개를 훑어 연결된 섬에서 밖으로 나가는 후보(${candText}) 중 가장 싼 ${bestFrom}-${bestNext}(비용 ${bestCost})를 찾습니다.`,
      PRIM_AT.scan,
    );
    rec.do({ type: 'focus', ids: [nid(bestFrom), nid(bestNext), cid(bestIdx)] });
    rec.do({
      type: 'arrow',
      from: nid(bestFrom),
      to: nid(bestNext),
      verdict: 'good',
      label: `최소 비용 ${bestCost}`,
    });

    rec.phase('다리 놓기', `${bestNext}번 섬을 연결하고 비용 ${josa(bestCost, '을', '를')} 더해 총 비용이 ${josa(total, '이', '가')} 됩니다.`, PRIM_AT.pick);
    rec.do(...together([
      ...clear(),
      cardPatch(bestIdx, { tone: 'good' }, true),
      edgeTone(bestIdx, 'path'),
      paint(bestNext, { tone: 'visited', sub: '연결됨' }, true),
      totalToken(total, picked),
    ]));
  }

  round = '-';
  rec.step({ title: `모든 섬 연결 완료 — 최소 비용 ${total}`, codeHighlights: PRIM_AT.done, ...meta(), answer: total, isKeyframe: true });
  rec.phase(
    '결과 확인',
    `최소 비용은 ${ro(total)} 같지만, 정렬 없이 매 단계 다리 ${COSTS.length}개를 처음부터 다시 훑어 총 ${work}번 확인했습니다(크루스칼은 7번).`,
    PRIM_AT.done,
  );
  rec.do(...together([
    ...Array.from({ length: N }, (_, v) => paint(v, { tone: 'path' }, true)),
    totalToken(total, picked, 'good'),
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: 유니온 파인드 없이 visited 배열만 확인                          */
/* ------------------------------------------------------------------ */

function visitedTrapViz(): Visualization {
  const rec = new StepRecorder(board(SORTED, () => '미방문'));
  const visited = Array<boolean>(N).fill(false);
  let total = 0;
  let picked = 0;
  let work = 0;
  let bridge = '-';
  const truth = 10;

  const meta = () => ({
    work,
    variables: {
      bridge,
      picked: `${picked}/${N - 1}`,
      total,
      visited: `[${visited.map((v) => (v ? 'T' : 'F')).join(', ')}]`,
    },
  });

  rec.step({ title: '다리를 비용순 정렬하고 visited를 모두 False로 초기화', codeHighlights: TRAP_AT.start, ...meta() });
  rec.phase('시작', '대표 번호 없이 단순 visited 배열만 두고, 두 섬 모두 visited가 True이면 건너뛰기로 합니다.', TRAP_AT.start);
  rec.do(wait(500));

  for (let i = 0; i < SORTED.length; i++) {
    const [a, b, cost] = SORTED[i];
    work++;
    bridge = `${a}-${b}(비용 ${cost})`;
    const bothVisited = visited[a] && visited[b];
    const eIdx = edgeOf(a, b);

    if (!bothVisited) {
      visited[a] = true;
      visited[b] = true;
      total += cost;
      picked++;
      rec.step({
        title: `다리 ${a}-${b}(비용 ${cost}) 선택 — visited[${a}], visited[${b}] = True`,
        codeHighlights: TRAP_AT.pick,
        ...meta(),
      });
      rec.phase('다리 놓기', `${a}번과 ${b}번 중 아직 미방문인 섬이 있어 다리를 놓고 둘 다 방문 표시합니다.`, TRAP_AT.pick);
      rec.do({ type: 'focus', ids: [cid(i), nid(a), nid(b)] });
      rec.do({ type: 'arrow', from: nid(a), to: nid(b), verdict: 'new', label: `비용 +${cost}` });
      rec.do(...together([
        ...clear(),
        cardPatch(i, { tone: 'good' }, true),
        edgeTone(eIdx, 'path'),
        paint(a, { tone: 'visited', sub: '방문함' }, true),
        paint(b, { tone: 'visited', sub: '방문함' }, true),
        totalToken(total, picked),
      ]));
    } else {
      const crucial = a === 2 && b === 3;
      rec.step({
        title: crucial
          ? `다리 2-3(비용 4) 건너뜀! — {0,1,2}와 {3,4}가 끊어진 채 방치됨`
          : `다리 ${a}-${b}(비용 ${cost}) 건너뜀 — 둘 다 visited = True`,
        codeHighlights: TRAP_AT.skip,
        ...meta(),
      });
      rec.phase(
        '잘못된 건너뛰기',
        crucial
          ? `2번은 {0,1,2} 묶음, 3번은 {3,4} 묶음으로 서로 떨어져 있는데도 둘 다 visited가 True라는 이유만으로 다리 2-3을 건너뛰어 버립니다!`
          : `${a}번과 ${b}번 모두 visited가 True라며 건너뜁니다.`,
        TRAP_AT.skip,
      );
      rec.do({ type: 'focus', ids: [cid(i), nid(a), nid(b)] });
      rec.do({
        type: 'arrow',
        from: nid(a),
        to: nid(b),
        verdict: 'bad',
        label: crucial ? '다른 묶음인데 무시!' : '둘 다 True',
      });
      rec.do(...together([
        ...clear(),
        cardPatch(i, { tone: crucial ? 'bad' : 'muted' }, crucial),
      ]));
    }
  }

  bridge = '-';
  rec.step({ title: `내 답 ${total} (섬이 두 덩어리로 끊어짐), 정답은 ${truth}`, codeHighlights: TRAP_AT.done, ...meta(), answer: total, isKeyframe: true });
  rec.phase(
    '오답 확인',
    `{0, 1, 2}와 {3, 4} 두 묶음을 잇는 다리 2-3(비용 4)을 건너뛰어 다리를 ${picked}개밖에 놓지 못했습니다. 내 답은 ${total}이지만 모든 섬을 잇는 정답은 ${truth}입니다.`,
    TRAP_AT.done,
  );
  rec.do(...together([
    paint(0, { tone: 'bad', tag: '묶음 A' }, true),
    paint(1, { tone: 'bad', tag: '묶음 A' }, true),
    paint(2, { tone: 'bad', tag: '묶음 A' }, true),
    paint(3, { tone: 'explored', tag: '묶음 B' }),
    paint(4, { tone: 'explored', tag: '묶음 B' }),
    totalToken(total, picked, 'bad'),
    { type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 200, y: 312, w: 92, h: 30 }, tone: 'bad', text: `내 답 ${total}` } },
    { type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 300, y: 312, w: 92, h: 30 }, tone: 'good', text: `정답 ${truth}` } },
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제 정의                                                            */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'connect-islands',
  title: '섬 연결하기',
  level: 3,
  category: 'graph',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42861',
  description: {
    summary:
      'n개의 섬 사이에 다리를 건설하는 비용(costs)이 주어질 때, 모든 섬이 서로 통행 가능하도록 다리를 놓는 데 필요한 최소 비용을 구합니다. 다리를 여러 번 건너 도달할 수만 있어도 통행 가능한 것으로 봅니다.',
    rules: [
      '섬의 개수 n은 1 이상 100 이하',
      'costs의 길이는 ((n − 1) × n) / 2 이하이고, 각 원소 [a, b, c]는 a번 섬과 b번 섬을 잇는 다리 비용이 c라는 뜻',
      '같은 두 섬을 잇는 다리 정보는 중복해서 주어지지 않음',
      '연결할 수 없는 섬은 주어지지 않음',
    ],
    examples: [
      { input: 'n = 4, costs = [[0,1,1],[0,2,2],[1,2,5],[1,3,1],[2,3,8]]', output: '4' },
    ],
  },
  keyIntuitions: [
    '모든 섬을 최소 비용으로 잇는 최소 신장 트리(MST) 문제입니다. 섬이 n개이면 사이클 없이 정확히 n − 1개의 다리만 고르면 됩니다.',
    '크루스칼 알고리즘은 가장 싼 다리부터 차례로 보면서, 두 섬이 아직 다른 묶음일 때만 다리를 놓고 두 묶음을 하나로 합칩니다.',
    '"이미 다리가 놓인 적이 있는 섬인지(visited)"가 아니라 "두 섬이 같은 묶음에 속하는지(유니온 파인드의 대표 번호)"를 확인해야 떨어진 두 묶음을 제대로 이을 수 있습니다.',
  ],
  demo: {
    input: [N, COSTS],
    label: 'n = 5, costs = [[0,2,3],[0,1,1],[1,2,2],[3,4,3],[2,3,4],[1,3,5],[2,4,6]]',
  },
  workUnit: '다리 후보를 확인한 횟수',
  approaches: [
    {
      id: 'islands-kruskal',
      name: '크루스칼 + 유니온 파인드',
      rank: 'BEST',
      timeComplexity: 'O(E log E)',
      spaceComplexity: 'O(N)',
      verdict: '다리를 비용 오름차순으로 정렬한 뒤, 유니온 파인드로 서로 다른 묶음만 이어 나가는 정석 풀이입니다.',
      pros: [
        '정렬한 뒤에는 다리를 앞에서부터 한 번씩만 확인하고, n − 1개를 고르는 즉시 멈출 수 있습니다.',
        '유니온 파인드(경로 압축)로 두 섬이 같은 묶음인지 거의 O(1)에 판정합니다.',
        '코드가 짧고 직관적이어서 최소 신장 트리 문제에서 가장 널리 쓰입니다.',
      ],
      cons: ['대표 번호를 찾고 합치는 find/union 함수를 함께 작성해야 합니다.'],
      whyThisRank:
        '간선 목록이 바로 주어지는 문제에서 정렬 한 번과 유니온 파인드로 가장 빠르고 깔끔하게 풀 수 있는 표준 해법입니다.',
      code: KRUSKAL,
      visualize: kruskalViz,
    },
    {
      id: 'islands-prim-scan',
      name: '프림 (매 단계 최소 다리 탐색)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × E)',
      spaceComplexity: 'O(N)',
      verdict: '유니온 파인드 없이 연결된 섬 집합을 하나씩 넓혀 가지만, 매 단계 모든 다리를 다시 훑어 확인 횟수가 많습니다.',
      pros: [
        '항상 하나의 연결된 덩어리를 유지하며 넓혀 가므로 별도의 대표 번호(Union-Find) 자료구조가 필요 없습니다.',
        'connected[a] != connected[b] 조건 하나로 사이클 없이 새 섬으로 가는 다리만 골라냅니다.',
      ],
      cons: [
        '섬을 하나 추가할 때마다 costs 배열 전체를 처음부터 끝까지 다시 확인하므로 다리 확인 횟수가 O(N × E)로 늘어납니다.',
        '힙을 쓰지 않으면 섬과 다리 수가 많을 때 크루스칼보다 느립니다.',
      ],
      whyThisRank:
        '유니온 파인드를 잊었을 때 떠올리기 좋은 올바른 풀이지만, 크루스칼이 다리를 한 번씩만 보는 데 비해 매 단계 전체 다리를 반복 순회하는 손해가 있어 대안으로 둡니다.',
      code: PRIM,
      visualize: primViz,
    },
    {
      id: 'islands-visited-trap',
      name: 'visited 배열만으로 사이클 판정하기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(E log E)',
      spaceComplexity: 'O(N)',
      verdict: '두 섬의 visited가 모두 True라고 건너뛰면, 서로 떨어져 만들어진 두 묶음을 영영 잇지 못해 오답이 나옵니다.',
      pros: ['유니온 파인드 대신 불리언 배열 하나만 써서 코드가 아주 짧아 보입니다.'],
      cons: [
        '[0,1,1]과 [2,3,1]을 먼저 고르면 {0,1} 묶음과 {2,3} 묶음이 따로 생기는데, 1번과 2번 모두 visited가 True가 됩니다.',
        '그 뒤 두 묶음을 이어 줄 [1,2,2] 다리를 만났을 때 둘 다 방문했다며 건너뛰어 섬이 두 덩어리로 끊어진 채 끝납니다.',
      ],
      whyThisRank:
        '방문 여부(visited)는 "어느 한 다리라도 걸쳤는가"만 알려 줄 뿐 "어느 묶음에 속하는가"를 구분하지 못합니다. 묶음 판정에는 반드시 유니온 파인드를 써야 합니다.',
      code: VISITED_TRAP,
      visualize: visitedTrapViz,
    },
  ],
  checks: {
    cases: [
      { args: [4, [[0, 1, 1], [0, 2, 2], [1, 2, 5], [1, 3, 1], [2, 3, 8]]], expected: 4 },
      { args: [1, []], expected: 0 },
      { args: [3, [[0, 1, 5], [1, 2, 3], [0, 2, 4]]], expected: 7 },
      { args: [4, [[0, 1, 1], [2, 3, 1], [1, 2, 10], [0, 3, 4]]], expected: 6 },
      { args: [N, COSTS], expected: 10 },
    ],
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 6);
      const seen = new Set<string>();
      const costs: [number, number, number][] = [];
      const add = (a: number, b: number, c: number) => {
        if (a === b) return;
        const k = edgeKey(a, b);
        if (seen.has(k)) return;
        seen.add(k);
        costs.push([a, b, c]);
      };
      for (let v = 1; v < n; v++) {
        add(v, Math.floor(rand() * v), 1 + Math.floor(rand() * 15));
      }
      const extra = Math.floor(rand() * n);
      for (let i = 0; i < extra; i++) {
        add(Math.floor(rand() * n), Math.floor(rand() * n), 1 + Math.floor(rand() * 15));
      }
      return [n, costs];
    },
  },
};

export default problem;
