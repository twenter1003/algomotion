// 합승 택시 요금: 정석 플로이드 와셜 + 모든 분기점 m 비교, 대안 세 기준점(s, a, b)에서 벨만-포드 실행,
// 함정 출발지·A·B 세 곳만 분기점으로 확인(중간 지점 하차 누락)하는 풀이를 같은 노선도에서 비교한다.
import type { Action, Item, ItemPatch, Point, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { lines, ro, together } from '../shared.ts';

// 시각화 입력: 지점 5개, 출발 S=1, A=4, B=5.
// 1→2(3)→3(3)으로 3번 지점까지 합승(6원)한 뒤 3→4(2원), 3→5(2원)로 갈라지면 6 + 2 + 2 = 10원이 최저 요금이다.
// 출발지(1)나 도착지(4, 5)에서만 갈라진다고 생각하는 함정은 12원을 답한다.
const N = 5;
const S = 1;
const A = 4;
const B = 5;
const FARES: [number, number, number][] = [
  [1, 2, 3],
  [2, 3, 3],
  [1, 4, 10],
  [1, 5, 11],
  [3, 4, 2],
  [3, 5, 2],
];
const INF = 999;

const edgeKey = (u: number, v: number) => `${Math.min(u, v)}-${Math.max(u, v)}`;
const EDGE_INDEX = new Map<string, number>(FARES.map(([u, v], i) => [edgeKey(u, v), i]));
const edgeOf = (u: number, v: number) => EDGE_INDEX.get(edgeKey(u, v));

function computeAllPairs(): number[][] {
  const d: number[][] = Array.from({ length: N + 1 }, (_, i) => Array.from({ length: N + 1 }, (_, j) => (i === j ? 0 : INF)));
  for (const [u, v, f] of FARES) {
    d[u][v] = f;
    d[v][u] = f;
  }
  for (let k = 1; k <= N; k++) {
    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= N; j++) {
        if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
      }
    }
  }
  return d;
}
const TRUE_DIST = computeAllPairs();

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

const FLOYD = {
  python: `def solution(n, s, a, b, fares):
    INF = float('inf')
    dist = [[0 if i == j else INF for j in range(n + 1)] for i in range(n + 1)]
    for u, v, f in fares:
        dist[u][v] = dist[v][u] = f

    for k in range(1, n + 1):  # k번 지점을 거쳐 가는 요금으로 갱신합니다
        for i in range(1, n + 1):
            if dist[i][k] == INF:
                continue
            for j in range(i + 1, n + 1):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]

    # 합승을 마치는 분기점 m(1~n)을 모두 확인합니다
    return min(dist[s][m] + dist[m][a] + dist[m][b] for m in range(1, n + 1))`,
  javascript: `function solution(n, s, a, b, fares) {
  const dist = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === j ? 0 : Infinity)),
  );
  for (const [u, v, f] of fares) {
    dist[u][v] = dist[v][u] = f;
  }

  for (let k = 1; k <= n; k++) { // k번 지점을 거쳐 가는 요금으로 갱신합니다
    for (let i = 1; i <= n; i++) {
      if (dist[i][k] === Infinity) continue;
      for (let j = i + 1; j <= n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  let best = Infinity; // 합승을 마치는 분기점 m(1~n)을 모두 확인합니다
  for (let m = 1; m <= n; m++) {
    best = Math.min(best, dist[s][m] + dist[m][a] + dist[m][b]);
  }
  return best;
}`,
};
const FLOYD_AT = {
  init: lines(FLOYD, ['dist = [[0 if i == j', 'for u, v, f in fares:', 'dist[u][v] = dist[v][u] = f'], ['const dist = Array.from', 'for (const [u, v, f] of fares)', 'dist[u][v] = dist[v][u] = f']),
  via: lines(FLOYD, ['for k in range(1, n + 1):', 'if dist[i][k] + dist[k][j] < dist[i][j]:', 'dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]'], ['for (let k = 1; k <= n; k++)', 'if (dist[i][k] + dist[k][j] < dist[i][j])', 'dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]']),
  split: lines(FLOYD, ['return min(dist[s][m] + dist[m][a] + dist[m][b] for m in range(1, n + 1))'], ['for (let m = 1; m <= n; m++)', 'best = Math.min(best, dist[s][m] + dist[m][a] + dist[m][b])']),
  done: lines(FLOYD, ['return min(dist[s][m] + dist[m][a] + dist[m][b] for m in range(1, n + 1))'], ['return best']),
};

const THREE_BELLMAN = {
  python: `def solution(n, s, a, b, fares):
    def from_start(start):
        dist = [float('inf')] * (n + 1)
        dist[start] = 0
        for _ in range(n - 1):
            updated = False
            for u, v, f in fares:
                if dist[u] + f < dist[v]:
                    dist[v] = dist[u] + f
                    updated = True
                if dist[v] + f < dist[u]:
                    dist[u] = dist[v] + f
                    updated = True
            if not updated:
                break
        return dist

    ds, da, db = from_start(s), from_start(a), from_start(b)
    return min(ds[m] + da[m] + db[m] for m in range(1, n + 1))`,
  javascript: `function solution(n, s, a, b, fares) {
  const fromStart = (start) => {
    const dist = Array(n + 1).fill(Infinity);
    dist[start] = 0;
    for (let r = 0; r < n - 1; r++) {
      let updated = false;
      for (const [u, v, f] of fares) {
        if (dist[u] + f < dist[v]) {
          dist[v] = dist[u] + f;
          updated = true;
        }
        if (dist[v] + f < dist[u]) {
          dist[u] = dist[v] + f;
          updated = true;
        }
      }
      if (!updated) break;
    }
    return dist;
  };

  const ds = fromStart(s);
  const da = fromStart(a);
  const db = fromStart(b);
  let best = Infinity;
  for (let m = 1; m <= n; m++) {
    best = Math.min(best, ds[m] + da[m] + db[m]);
  }
  return best;
}`,
};
const BEL3_AT = {
  run: lines(THREE_BELLMAN, ['def from_start(start):', 'for u, v, f in fares:', 'ds, da, db = from_start(s), from_start(a), from_start(b)'], ['const fromStart = (start) =>', 'for (const [u, v, f] of fares)', 'const ds = fromStart(s)']),
  split: lines(THREE_BELLMAN, ['return min(ds[m] + da[m] + db[m] for m in range(1, n + 1))'], ['for (let m = 1; m <= n; m++)', 'best = Math.min(best, ds[m] + da[m] + db[m])']),
  done: lines(THREE_BELLMAN, ['return min(ds[m] + da[m] + db[m] for m in range(1, n + 1))'], ['return best']),
};

const ENDPOINTS_ONLY_TRAP = {
  python: `# 주의: 출발지(s)와 두 도착지(a, b) 세 곳만 분기점으로 확인하는 오답 풀이입니다
def solution(n, s, a, b, fares):
    INF = float('inf')
    dist = [[0 if i == j else INF for j in range(n + 1)] for i in range(n + 1)]
    for u, v, f in fares:
        dist[u][v] = dist[v][u] = f

    for k in range(1, n + 1):
        for i in range(1, n + 1):
            if dist[i][k] == INF:
                continue
            for j in range(i + 1, n + 1):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]

    # 합승 안 함(s), A 집까지 합승(a), B 집까지 합승(b)만 보고 제3의 분기점을 놓칩니다
    return min(dist[s][m] + dist[m][a] + dist[m][b] for m in (s, a, b))`,
  javascript: `// 주의: 출발지(s)와 두 도착지(a, b) 세 곳만 분기점으로 확인하는 오답 풀이입니다
function solution(n, s, a, b, fares) {
  const dist = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === j ? 0 : Infinity)),
  );
  for (const [u, v, f] of fares) {
    dist[u][v] = dist[v][u] = f;
  }

  for (let k = 1; k <= n; k++) {
    for (let i = 1; i <= n; i++) {
      if (dist[i][k] === Infinity) continue;
      for (let j = i + 1; j <= n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  // 합승 안 함(s), A 집까지 합승(a), B 집까지 합승(b)만 보고 제3의 분기점을 놓칩니다
  let best = Infinity;
  for (const m of [s, a, b]) {
    best = Math.min(best, dist[s][m] + dist[m][a] + dist[m][b]);
  }
  return best;
}`,
};
const TRAP_AT = {
  init: lines(ENDPOINTS_ONLY_TRAP, ['dist = [[0 if i == j', 'dist[u][v] = dist[v][u] = f'], ['const dist = Array.from', 'dist[u][v] = dist[v][u] = f']),
  via: lines(ENDPOINTS_ONLY_TRAP, ['for k in range(1, n + 1):', 'dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]'], ['for (let k = 1; k <= n; k++)', 'dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]']),
  split: lines(ENDPOINTS_ONLY_TRAP, ['return min(dist[s][m] + dist[m][a] + dist[m][b] for m in (s, a, b))'], ['for (const m of [s, a, b])', 'best = Math.min(best, dist[s][m] + dist[m][a] + dist[m][b])']),
  done: lines(ENDPOINTS_ONLY_TRAP, ['return min(dist[s][m] + dist[m][a] + dist[m][b] for m in (s, a, b))'], ['return best']),
};

/* ------------------------------------------------------------------ */
/* 장면과 도구                                                          */
/* ------------------------------------------------------------------ */

const CELL = 54;
const W = 500;
const H = 350;
const FULL: Rect = { x: 0, y: 0, w: W, h: H };
const CENTERS: Record<number, Point> = {
  1: [64, 178],
  2: [192, 178],
  3: [316, 178],
  4: [434, 96],
  5: [434, 260],
};
const WEIGHT_POS: Point[] = [
  [116, 150], // 1-2 (3)
  [242, 150], // 2-3 (3)
  [210, 74],  // 1-4 (10)
  [210, 266], // 1-5 (11)
  [368, 112], // 3-4 (2)
  [368, 224], // 3-5 (2)
];

const rectOf = (v: number): Rect => ({ x: CENTERS[v][0] - CELL / 2, y: CENTERS[v][1] - CELL / 2, w: CELL, h: CELL });
const slotRect = (m: number): Rect => ({ x: 8 + (m - 1) * 98, y: 6, w: 92, h: 34 });
const nid = (v: number) => `v:${v}`;
const eid = (i: number) => `e:${i}`;
const wid = (i: number) => `w:${i}`;
const midId = (m: number) => `m:${m}`;

function edgePoints(a: number, b: number): Point[] {
  const [[ax, ay], [bx, by]] = [CENTERS[a], CENTERS[b]];
  const len = Math.hypot(bx - ax, by - ay);
  const [ux, uy] = [(bx - ax) / len, (by - ay) / len];
  const gap = CELL / 2 / Math.max(Math.abs(ux), Math.abs(uy)) + 3;
  return [[ax + ux * gap, ay + uy * gap], [bx - ux * gap, by - uy * gap]];
}

const roleSub = (v: number) => (v === S ? '출발 S' : v === A ? 'A 도착' : v === B ? 'B 도착' : '경유지');

function board(): Scene {
  const items: Item[] = [];
  for (let m = 1; m <= N; m++) {
    items.push({ id: midId(m), kind: 'token', rect: slotRect(m), tone: 'plain', text: `분기 ${m}: -` });
  }
  FARES.forEach(([u, v, f], i) => {
    items.push({ id: eid(i), kind: 'line', rect: FULL, tone: 'trail', points: edgePoints(u, v) });
    items.push({ id: wid(i), kind: 'text', rect: { x: WEIGHT_POS[i][0], y: WEIGHT_POS[i][1], w: 30, h: 20 }, tone: 'muted', text: String(f) });
  });
  for (let v = 1; v <= N; v++) {
    items.push({
      id: nid(v),
      kind: 'cell',
      rect: rectOf(v),
      tone: v === S ? 'current' : v === A || v === B ? 'queued' : 'plain',
      text: `${v}번`,
      sub: roleSub(v),
    });
  }
  items.push(
    { id: 'calc', kind: 'text', rect: { x: 180, y: 314, w: 310, h: 26 }, text: '최단 요금 계산 전' },
    { id: 'best', kind: 'token', rect: { x: 8, y: 312, w: 160, h: 30 }, tone: 'plain', text: '최저 요금: ∞' },
  );
  return { width: W, height: H, items };
}

const paint = (v: number, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: nid(v), patch, ...(pop ? { pop } : {}) });
const slotPatch = (m: number, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: midId(m), patch, ...(pop ? { pop } : {}) });
const edgeTone = (i: number, tone: Tone): Action => ({ type: 'set', id: eid(i), patch: { tone } });
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });
const bestTo = (val: number | string, tone: Tone = 'chosen'): Action => ({
  type: 'set',
  id: 'best',
  patch: { text: `최저 요금: ${val}`, tone },
  pop: true,
});
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);

const rowText = (d: number[][], r: number) => `[${d[r].slice(1).map((x) => (x >= INF ? '∞' : String(x))).join(', ')}]`;

/* ------------------------------------------------------------------ */
/* 정석: 플로이드 와셜 + 모든 분기점 m(1~5) 확인                         */
/* ------------------------------------------------------------------ */

function floydViz(): Visualization {
  const rec = new StepRecorder(board());
  const d: number[][] = Array.from({ length: N + 1 }, (_, i) => Array.from({ length: N + 1 }, (_, j) => (i === j ? 0 : INF)));
  for (const [u, v, f] of FARES) {
    d[u][v] = f;
    d[v][u] = f;
  }
  let work = 0;
  let kCur: number | '-' = '-';
  let mCur: number | '-' = '-';
  let best: number | string = '∞';

  const meta = () => ({
    work,
    variables: {
      k: kCur,
      m: mCur,
      best,
      'dist[1]': rowText(d, 1),
      'dist[3]': rowText(d, 3),
    },
  });

  rec.step({ title: '직접 이어진 도로 요금으로 dist 표 초기화', codeHighlights: FLOYD_AT.init, ...meta() });
  rec.phase('초기화', '자기 자신으로 가는 요금은 0, 직접 이어진 도로는 주어진 요금, 나머지는 ∞로 최단 거리 표를 초기화합니다.', FLOYD_AT.init);
  rec.do(calcTo('1→4 직통 10원, 1→5 직통 11원'), wait(400));

  for (let k = 1; k <= N; k++) {
    kCur = k;
    const updates: { i: number; j: number; oldVal: number; newVal: number }[] = [];
    for (let i = 1; i <= N; i++) {
      if (d[i][k] >= INF) continue;
      for (let j = i + 1; j <= N; j++) {
        work++;
        if (d[i][k] + d[k][j] < d[i][j]) {
          const oldVal = d[i][j];
          const newVal = d[i][k] + d[k][j];
          d[i][j] = newVal;
          d[j][i] = newVal;
          updates.push({ i, j, oldVal, newVal });
        }
      }
    }

    rec.step({
      title: updates.length
        ? `경유지 k = ${k}번: ${updates.map((u) => `${u.i}↔${u.j}(${u.newVal}원)`).join(', ')} 단축`
        : `경유지 k = ${k}번: 더 줄어드는 쌍 없음`,
      codeHighlights: FLOYD_AT.via,
      ...meta(),
    });

    if (updates.length) {
      const desc = updates
        .map((u) => `${u.i}↔${u.j}가 ${u.oldVal >= INF ? '∞' : u.oldVal}→${ro(u.newVal)}`)
        .join(', ');
      rec.phase('경유 갱신', `${k}번 지점을 거쳐 가면 ${desc} 줄어듭니다.`, FLOYD_AT.via);
      const first = updates[0];
      rec.do({ type: 'focus', ids: [nid(k), nid(first.i), nid(first.j)] });
      rec.do(
        { type: 'arrow', from: nid(first.i), to: nid(k), verdict: 'good', label: `${d[first.i][k]}원` },
        { type: 'arrow', from: nid(k), to: nid(first.j), verdict: 'good', label: `합 ${first.newVal}원` },
      );
      rec.do(...together([...clear(), calcTo(`${k}번 경유: ${desc}`)]));
    } else {
      rec.phase('경유 갱신', `${k}번 지점을 거쳐 가도 기존 요금보다 싸지는 구간이 없습니다.`, FLOYD_AT.via);
      rec.do({ type: 'focus', ids: [nid(k)] }, wait(300), ...clear());
    }
  }

  kCur = '-';
  let bestVal = INF;
  for (let m = 1; m <= N; m++) {
    mCur = m;
    work++;
    const share = d[S][m];
    const toA = d[m][A];
    const toB = d[m][B];
    const sumCost = share + toA + toB;
    const improved = sumCost < bestVal;
    if (improved) bestVal = sumCost;
    best = bestVal;

    rec.step({
      title: `분기점 m = ${m}번: 합승 ${share} + A ${toA} + B ${toB} = ${sumCost}원`,
      codeHighlights: FLOYD_AT.split,
      ...meta(),
    });
    rec.phase(
      '분기점 비교',
      `${m}번까지 합승(${share}원)한 뒤 A(${toA}원)와 B(${toB}원)가 갈라지면 총 ${sumCost}원입니다.${improved ? ` 최저 요금을 ${ro(sumCost)} 갱신합니다.` : ''}`,
      FLOYD_AT.split,
    );
    rec.do({ type: 'focus', ids: [nid(S), nid(m), nid(A), nid(B), midId(m)] });
    if (m !== A) rec.do({ type: 'arrow', from: nid(m), to: nid(A), verdict: improved ? 'good' : 'seen', label: `A ${toA}원` });
    if (m !== B) rec.do({ type: 'arrow', from: nid(m), to: nid(B), verdict: improved ? 'good' : 'seen', label: `B ${toB}원`, together: m !== A });
    rec.do(...together([
      ...clear(),
      slotPatch(m, { text: `분기 ${m}: ${sumCost}`, tone: improved ? 'good' : 'explored' }, true),
      calcTo(`m=${m}: ${share} + ${toA} + ${toB} = ${sumCost}원`),
      ...(improved ? [bestTo(bestVal)] : []),
    ]));
  }

  mCur = '-';
  rec.step({ title: `최저 택시 요금: ${bestVal}원 (3번 지점까지 합승)`, codeHighlights: FLOYD_AT.done, ...meta(), answer: bestVal, isKeyframe: true });
  rec.phase('결과 확인', `1→2→3까지 합승(6원)하고 3→4(2원), 3→5(2원)로 갈라지는 3번 분기점이 총 ${bestVal}원으로 가장 저렴합니다.`, FLOYD_AT.done);
  rec.do(...together([
    edgeTone(edgeOf(1, 2)!, 'path'),
    edgeTone(edgeOf(2, 3)!, 'path'),
    edgeTone(edgeOf(3, 4)!, 'path'),
    edgeTone(edgeOf(3, 5)!, 'path'),
    paint(3, { tone: 'path', tag: '최적 분기점' }, true),
    slotPatch(3, { tone: 'path' }, true),
    bestTo(bestVal, 'good'),
    calcTo('1→2→3 합승(6) + 3→4(2) + 3→5(2) = 10원'),
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 세 기준점(s, a, b)에서 벨만-포드 실행 후 분기점 비교              */
/* ------------------------------------------------------------------ */

function threeBellmanViz(): Visualization {
  const rec = new StepRecorder(board());
  let work = 0;
  let origin: string = '-';
  let mCur: number | '-' = '-';
  let best: number | string = '∞';

  const runBellmanCount = (start: number): number[] => {
    const dist = Array<number>(N + 1).fill(INF);
    dist[start] = 0;
    for (let r = 0; r < N - 1; r++) {
      let updated = false;
      for (const [u, v, f] of FARES) {
        work += 2;
        if (dist[u] + f < dist[v]) {
          dist[v] = dist[u] + f;
          updated = true;
        }
        if (dist[v] + f < dist[u]) {
          dist[u] = dist[v] + f;
          updated = true;
        }
      }
      if (!updated) break;
    }
    return dist;
  };

  let ds = Array<number>(N + 1).fill(INF);
  let da = Array<number>(N + 1).fill(INF);
  let db = Array<number>(N + 1).fill(INF);
  const fmtArr = (arr: number[]) => `[${arr.slice(1).map((x) => (x >= INF ? '∞' : String(x))).join(', ')}]`;
  const meta = () => ({
    work,
    variables: { origin, m: mCur, best, ds: fmtArr(ds), da: fmtArr(da), db: fmtArr(db) },
  });

  origin = `S=${S}`;
  ds = runBellmanCount(S);
  rec.step({ title: `출발지 S(${S}번)에서 벨만-포드로 모든 지점까지 거리 계산`, codeHighlights: BEL3_AT.run, ...meta() });
  rec.phase('기준점 탐색', `S(${S}번)에서 모든 도로를 반복 완화해 ds = ${fmtArr(ds)}를 구합니다.`, BEL3_AT.run);
  rec.do({ type: 'focus', ids: [nid(S)] }, calcTo(`ds = ${fmtArr(ds)}`), wait(350), ...clear());

  origin = `A=${A}`;
  da = runBellmanCount(A);
  rec.step({ title: `도착지 A(${A}번)에서 벨만-포드로 모든 지점까지 거리 계산`, codeHighlights: BEL3_AT.run, ...meta() });
  rec.phase('기준점 탐색', `양방향 도로이므로 m→A 거리 대신 A(${A}번)에서 출발하는 벨만-포드로 da = ${fmtArr(da)}를 구합니다.`, BEL3_AT.run);
  rec.do({ type: 'focus', ids: [nid(A)] }, calcTo(`da = ${fmtArr(da)}`), wait(350), ...clear());

  origin = `B=${B}`;
  db = runBellmanCount(B);
  rec.step({ title: `도착지 B(${B}번)에서 벨만-포드로 모든 지점까지 거리 계산`, codeHighlights: BEL3_AT.run, ...meta() });
  rec.phase('기준점 탐색', `B(${B}번)에서 출발하는 벨만-포드로 db = ${fmtArr(db)}를 구합니다.`, BEL3_AT.run);
  rec.do({ type: 'focus', ids: [nid(B)] }, calcTo(`db = ${fmtArr(db)}`), wait(350), ...clear());

  origin = '-';
  let bestVal = INF;
  for (let m = 1; m <= N; m++) {
    mCur = m;
    work++;
    const sumCost = ds[m] + da[m] + db[m];
    const improved = sumCost < bestVal;
    if (improved) bestVal = sumCost;
    best = bestVal;

    rec.step({
      title: `분기점 m = ${m}번: ds[${m}](${ds[m]}) + da[${m}](${da[m]}) + db[${m}](${db[m]}) = ${sumCost}원`,
      codeHighlights: BEL3_AT.split,
      ...meta(),
    });
    rec.phase('분기점 비교', `분기점 ${m}번의 합산 요금은 ${ds[m]} + ${da[m]} + ${db[m]} = ${sumCost}원입니다.`, BEL3_AT.split);
    rec.do(...together([
      slotPatch(m, { text: `분기 ${m}: ${sumCost}`, tone: improved ? 'good' : 'explored' }, true),
      calcTo(`m=${m}: ${ds[m]} + ${da[m]} + ${db[m]} = ${sumCost}원`),
      ...(improved ? [bestTo(bestVal)] : []),
    ]));
  }

  mCur = '-';
  rec.step({ title: `최저 택시 요금: ${bestVal}원`, codeHighlights: BEL3_AT.done, ...meta(), answer: bestVal, isKeyframe: true });
  rec.phase(
    '결과 확인',
    `3번 분기점에서 최저 요금 ${bestVal}원을 찾았습니다. 세 기준점에서 벨만-포드를 따로 돌려 비교 횟수는 ${work}번으로 플로이드 와셜(53번)보다 많습니다.`,
    BEL3_AT.done,
  );
  rec.do(...together([
    paint(3, { tone: 'path', tag: '최적 분기점' }, true),
    slotPatch(3, { tone: 'path' }, true),
    bestTo(bestVal, 'good'),
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: s, a, b 세 곳만 분기점으로 확인 (중간 지점 하차 누락)            */
/* ------------------------------------------------------------------ */

function endpointsTrapViz(): Visualization {
  const rec = new StepRecorder(board());
  const d = TRUE_DIST;
  let work = 48; // 플로이드 와셜 갱신(48회 비교) 후 분기점 확인부터 비교
  let mCur: number | '-' = '-';
  let best: number | string = '∞';
  const truth = 10;

  const meta = () => ({
    work,
    variables: {
      candidates: `[${S}, ${A}, ${B}]`,
      m: mCur,
      best,
      'dist[1]': rowText(d, 1),
      'dist[3]': rowText(d, 3),
    },
  });

  rec.step({ title: '최단 거리 표 계산 완료 → 분기점 후보를 [s, a, b] 세 곳만 준비', codeHighlights: TRAP_AT.via, ...meta() });
  rec.phase('최단 거리 계산', '플로이드 와셜로 모든 지점 사이의 최단 요금을 구했습니다. 이제 합승 분기점으로 s(1), a(4), b(5) 세 곳만 확인합니다.', TRAP_AT.via);
  rec.do(...together([
    slotPatch(2, { text: '분기 2: 건너뜀', tone: 'muted' }),
    slotPatch(3, { text: '분기 3: 건너뜀', tone: 'muted' }),
    calcTo('중간 지점 2번·3번은 분기점 후보에서 제외됨'),
  ]));

  let bestVal = INF;
  for (const m of [S, A, B]) {
    mCur = m;
    work++;
    const share = d[S][m];
    const toA = d[m][A];
    const toB = d[m][B];
    const sumCost = share + toA + toB;
    const improved = sumCost < bestVal;
    if (improved) bestVal = sumCost;
    best = bestVal;

    const labelDesc = m === S ? '합승 안 함(1번)' : m === A ? 'A 도착지(4번)까지 합승' : 'B 도착지(5번)까지 합승';
    rec.step({
      title: `${labelDesc}: ${share} + ${toA} + ${toB} = ${sumCost}원`,
      codeHighlights: TRAP_AT.split,
      ...meta(),
    });
    rec.phase('세 후보만 비교', `${labelDesc}일 때 총 요금은 ${share} + ${toA} + ${toB} = ${sumCost}원입니다.`, TRAP_AT.split);
    rec.do({ type: 'focus', ids: [nid(m), midId(m)] });
    rec.do(...together([
      ...clear(),
      slotPatch(m, { text: `분기 ${m}: ${sumCost}`, tone: improved ? 'good' : 'explored' }, true),
      calcTo(`m=${m}: ${share} + ${toA} + ${toB} = ${sumCost}원`),
      ...(improved ? [bestTo(bestVal)] : []),
    ]));
  }

  mCur = '-';
  rec.step({ title: `내 답 ${bestVal}원, 정답은 ${truth}원 (3번 분기점 누락)`, codeHighlights: TRAP_AT.done, ...meta(), answer: bestVal, isKeyframe: true });
  rec.phase(
    '오답 확인',
    `중간 지점인 3번에서 함께 내려 각자 이동하면 6 + 2 + 2 = ${truth}원인데, (s, a, b) 세 곳만 확인해 ${bestVal}원이라는 오답이 나왔습니다.`,
    TRAP_AT.done,
  );
  rec.do({ type: 'focus', ids: [nid(3), midId(3)] });
  rec.do({ type: 'arrow', from: nid(1), to: nid(3), verdict: 'bad' as Verdict, label: '놓친 분기점 10원!' });
  rec.do(...together([
    ...clear(),
    paint(3, { tone: 'bad', tag: '놓친 10원' }, true),
    slotPatch(3, { text: '분기 3: 10!', tone: 'bad' }, true),
    bestTo(bestVal, 'bad'),
    calcTo(`내 답 ${bestVal}원 ≠ 정답 ${truth}원 (3번 분기점)`),
    { type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 180, y: 312, w: 96, h: 30 }, tone: 'bad', text: `내 답 ${bestVal}원` } },
    { type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 284, y: 312, w: 96, h: 30 }, tone: 'good', text: `정답 ${truth}원` } },
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제 정의                                                            */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'shared-taxi',
  title: '합승 택시 요금',
  level: 3,
  category: 'graph',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/72413',
  description: {
    summary:
      '지점 n개와 택시 요금(fares)이 주어집니다. A와 B 두 사람이 출발 지점 s에서 택시를 타고 각자의 도착 지점 a, b까지 이동할 때, 어느 지점까지 함께 타고 갈지(합승하지 않는 경우 포함)를 잘 골라 두 사람의 택시 요금 합이 최소가 되도록 합니다.',
    rules: [
      '지점의 개수 n은 3 이상 200 이하의 자연수',
      '출발지 s와 두 도착지 a, b는 1 이상 n 이하의 서로 다른 자연수',
      'fares의 각 원소 [c, d, f]는 c번과 d번 지점 사이 양방향 요금이 f원이라는 뜻 (1 ≤ f ≤ 100,000)',
      '합승하지 않고 처음부터 각자 이동하는 것이 더 싸다면 합승하지 않아도 됨',
    ],
    examples: [
      {
        input: 'n = 6, s = 4, a = 6, b = 2, fares = [[4,1,10],[3,5,24],[5,6,2],[3,1,41],[5,1,24],[4,6,50],[2,4,66],[2,3,22],[1,6,25]]',
        output: '82',
      },
      {
        input: 'n = 7, s = 3, a = 4, b = 1, fares = [[5,7,9],[4,6,4],[3,6,1],[3,2,3],[2,1,6]]',
        output: '14',
      },
      {
        input: 'n = 6, s = 4, a = 5, b = 6, fares = [[2,6,6],[6,3,7],[4,6,7],[6,5,11],[2,5,12],[5,3,20],[2,4,4],[2,1,7],[4,1,7]]',
        output: '18',
      },
    ],
  },
  keyIntuitions: [
    '"어디까지 함께 타고 어디서 갈라질까?"를 분기점 m(1 ≤ m ≤ n) 하나로 모델링하면, 총 요금은 `dist(s, m) + dist(m, a) + dist(m, b)`가 됩니다.',
    'm이 출발지 s이면 처음부터 따로 타는 경우(`dist(s, s) = 0`)이고, m이 a나 b이면 한 사람의 집까지 같이 가는 경우까지 하나의 식으로 모두 포함됩니다.',
    'n ≤ 200이므로 플로이드 와셜로 모든 지점 쌍의 최단 요금을 한 번에 구해 두면, 모든 분기점 m을 O(n)에 비교해 바로 답을 얻습니다.',
  ],
  demo: {
    input: [N, S, A, B, FARES],
    label: 'n = 5, s = 1, a = 4, b = 5, fares = [[1,2,3],[2,3,3],[1,4,10],[1,5,11],[3,4,2],[3,5,2]]',
  },
  workUnit: '경유·완화 조건을 비교한 횟수',
  approaches: [
    {
      id: 'taxi-floyd',
      name: '플로이드 와셜 (모든 쌍 최단 거리)',
      rank: 'BEST',
      timeComplexity: 'O(N³)',
      spaceComplexity: 'O(N²)',
      verdict: '플로이드 와셜로 모든 지점 사이의 최단 요금 표를 채운 뒤, 1번부터 n번까지 모든 분기점 m을 비교하는 정석 풀이입니다.',
      pros: [
        '3중 반복문 몇 줄로 모든 지점 쌍의 최단 요금을 한꺼번에 구할 수 있어 구현이 매우 간결합니다.',
        '양방향 대칭(`i < j`)과 도달 불가능한 경유지 건너뛰기(`dist[i][k] == INF`)를 적용하면 실제 연산량이 크게 줄어듭니다.',
        '최단 거리 표가 완성되면 분기점 비교는 `min(dist[s][m] + dist[m][a] + dist[m][b])` 한 줄로 끝납니다.',
      ],
      cons: ['지점 수 n이 수천 개 이상으로 커지면 O(N³) 시간과 O(N²) 공간이 부담됩니다(이 문제는 n ≤ 200이라 충분합니다).'],
      whyThisRank:
        'n ≤ 200 조건에서 코드가 가장 짧고 실수할 여지가 적으며, 모든 분기점의 합산 요금을 즉시 조회할 수 있는 표준 풀이입니다.',
      code: FLOYD,
      visualize: floydViz,
    },
    {
      id: 'taxi-three-bellman',
      name: '세 기준점(s, a, b)에서 벨만-포드 탐색',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × E)',
      spaceComplexity: 'O(N)',
      verdict: '도로가 양방향임을 이용해 s, a, b 세 곳에서 각각 최단 거리를 구하지만, 매번 간선을 반복 순회해 확인 횟수가 더 많습니다.',
      pros: [
        '`dist(m, a) = dist(a, m)` 대칭 성질 덕분에 s, a, b 세 정점에서만 단일 출발점 최단 거리를 구해도 충분합니다.',
        '2차원 행렬 대신 1차원 배열 세 개(`ds, da, db`)만 써서 메모리를 적게 씁니다.',
      ],
      cons: [
        '단일 출발점 최단 거리 함수를 따로 작성해 세 번 호출해야 하므로 플로이드 와셜보다 코드가 깁니다.',
        '벨만-포드로 세 번 반복 완화하면 작은 그래프에서도 유효 쌍만 보는 플로이드 와셜보다 비교 횟수가 많습니다.',
      ],
      whyThisRank:
        '`m → a`를 `a → m`으로 뒤집는 발상은 좋지만, n ≤ 200에서는 플로이드 와셜이 코드도 훨씬 짧고 대칭 최적화 시 연산도 적어 대안으로 둡니다.',
      code: THREE_BELLMAN,
      visualize: threeBellmanViz,
    },
    {
      id: 'taxi-endpoints-only-trap',
      name: '출발지와 도착지(s, a, b)만 분기점으로 확인',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N³)',
      spaceComplexity: 'O(N²)',
      verdict: '"따로 가기"와 "한 사람 집까지 같이 가기"만 비교하고 제3의 중간 지점에서 헤어지는 경우를 빼먹어 오답이 나옵니다.',
      pros: ['분기점 후보를 s, a, b 세 곳만 보므로 얼핏 그럴듯해 보입니다.'],
      cons: [
        '두 사람이 출발지도 도착지도 아닌 중간 지점(예: 3번)까지 함께 타고 거기서 각자 집으로 갈라지는 최적 경로를 전혀 확인하지 않습니다.',
        '원문 입출력 예 1번과 시각화 입력 모두에서 중간 지점 하차가 더 저렴해 오답을 냅니다.',
      ],
      whyThisRank:
        '합승이 끝나는 지점 m은 s, a, b뿐 아니라 1번부터 n번까지 어느 지점이든 될 수 있습니다. 반드시 모든 지점 m을 후보로 확인해야 합니다.',
      code: ENDPOINTS_ONLY_TRAP,
      visualize: endpointsTrapViz,
    },
  ],
  checks: {
    cases: [
      {
        args: [
          6, 4, 6, 2,
          [[4, 1, 10], [3, 5, 24], [5, 6, 2], [3, 1, 41], [5, 1, 24], [4, 6, 50], [2, 4, 66], [2, 3, 22], [1, 6, 25]],
        ],
        expected: 82,
      },
      {
        args: [
          7, 3, 4, 1,
          [[5, 7, 9], [4, 6, 4], [3, 6, 1], [3, 2, 3], [2, 1, 6]],
        ],
        expected: 14,
      },
      {
        args: [
          6, 4, 5, 6,
          [[2, 6, 6], [6, 3, 7], [4, 6, 7], [6, 5, 11], [2, 5, 12], [5, 3, 20], [2, 4, 4], [2, 1, 7], [4, 1, 7]],
        ],
        expected: 18,
      },
      {
        args: [3, 1, 2, 3, [[1, 2, 5], [1, 3, 5], [2, 3, 1]]],
        expected: 6,
      },
      {
        args: [4, 1, 3, 4, [[1, 2, 10], [2, 3, 10], [1, 4, 5]]],
        expected: 25,
      },
      {
        args: [N, S, A, B, FARES],
        expected: 10,
      },
    ],
    random: (rand) => {
      const n = 3 + Math.floor(rand() * 5);
      const nodes = Array.from({ length: n }, (_, i) => i + 1);
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
      }
      const [s, a, b] = [nodes[0], nodes[1], nodes[2]];
      const seen = new Set<string>();
      const fares: [number, number, number][] = [];
      const add = (u: number, v: number, f: number) => {
        if (u === v) return;
        const k = edgeKey(u, v);
        if (seen.has(k)) return;
        seen.add(k);
        fares.push([u, v, f]);
      };
      for (let v = 2; v <= n; v++) {
        add(v, 1 + Math.floor(rand() * (v - 1)), 1 + Math.floor(rand() * 20));
      }
      const extra = 1 + Math.floor(rand() * n);
      for (let i = 0; i < extra; i++) {
        add(1 + Math.floor(rand() * n), 1 + Math.floor(rand() * n), 1 + Math.floor(rand() * 20));
      }
      return [n, s, a, b, fares];
    },
  },
};

export default problem;
