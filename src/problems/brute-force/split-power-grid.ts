// 전력망을 둘로 나누기: 정석 전선을 하나씩 끊고 한쪽 송전탑 세기, 대안 한 번의 DFS로 서브트리 크기 구하기,
// 함정 전선이 가장 많이 모인 송전탑의 전선만 끊어 보기. 세 풀이는 같은 송전탑 그림(칸 = 송전탑, 선 = 전선)을 쓴다.
import type { Action, Item, Point, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';
import { clear, holdCaptions, set, tone, wait } from './common.ts';

// 시각화 입력이자 점검 사례. 1번(전선 3개)이 가장 많이 모인 송전탑이라 그 전선만 끊으면 차이 2이지만, [4, 5]를 끊으면 4개와 4개로 0이다.
const N = 8;
const WIRES: [number, number][] = [[1, 2], [1, 3], [1, 4], [4, 5], [5, 6], [6, 7], [7, 8]];
const wireText = (i: number) => `[${WIRES[i][0]}, ${WIRES[i][1]}]`;
const wireJosa = (i: number, batchim: string, plain: string) => josa(wireText(i), batchim, plain);
interface Meta { work: number; variables: Record<string, string | number> }

// 전선 cut을 끊었을 때 그 전선의 한쪽 끝(v1)에서 닿는 송전탑(코드의 BFS와 같다)
const neighbors = (v: number, cut: number) =>
  WIRES.flatMap(([a, b], i) => (i === cut ? [] : a === v ? [b] : b === v ? [a] : []));
const sideOf = (cut: number): number[] => {
  const queue = [WIRES[cut][0]];
  for (let head = 0; head < queue.length; head++) for (const w of neighbors(queue[head], cut)) if (!queue.includes(w)) queue.push(w);
  return queue;
};
const gap = (count: number) => Math.abs(N - 2 * count);
const CUTS = WIRES.map((_, i) => ({ i, side: sideOf(i), diff: gap(sideOf(i).length) }));
const BEST_DIFF = Math.min(...CUTS.map((c) => c.diff));
const BEST_CUT = CUTS.find((c) => c.diff === BEST_DIFF)!; // 처음으로 가장 작은 차이가 나오는 전선
const degree = (v: number) => WIRES.filter((w) => w.includes(v)).length;
const HUB = [...Array(N + 1).keys()].reduce((h, v) => (degree(v) > degree(h) ? v : h), 0); // 같으면 번호가 작은 쪽

// 한 번의 DFS(대안)가 크기를 구하는 차례: 1번에서 내려가 되돌아오는 순서(후위)
interface Visit { v: number; parent: number; kids: number[]; size: number }
const POST: Visit[] = [];
{
  const dfs = (v: number, parent: number): number => {
    const kids: number[] = [];
    let size = 1;
    for (const w of neighbors(v, -1)) if (w !== parent) {
      kids.push(w);
      size += dfs(w, v);
    }
    POST.push({ v, parent, kids, size });
    return size;
  };
  dfs(1, 0);
}
const wireOf = (a: number, b: number) => WIRES.findIndex((w) => w.includes(a) && w.includes(b));

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const SIDE_PY = `from collections import deque

def side_size(n, wires, cut):
    # 전선 cut을 빼고 이어, 그 전선의 한쪽 끝에서 닿는 송전탑 수를 셉니다
    graph = [[] for _ in range(n + 1)]
    for i, (a, b) in enumerate(wires):
        if i != cut:  # 끊은 전선은 잇지 않습니다
            graph[a].append(b)
            graph[b].append(a)
    start = wires[cut][0]
    seen = [False] * (n + 1)
    seen[start] = True
    queue = deque([start])
    count = 0
    while queue:
        v = queue.popleft()
        count += 1
        for w in graph[v]:
            if not seen[w]:
                seen[w] = True
                queue.append(w)
    return count
`;
const SIDE_JS = `function sideSize(n, wires, cut) {
  // 전선 cut을 빼고 이어, 그 전선의 한쪽 끝에서 닿는 송전탑 수를 셉니다
  const graph = Array.from({ length: n + 1 }, () => []);
  wires.forEach(([a, b], i) => {
    if (i === cut) return; // 끊은 전선은 잇지 않습니다
    graph[a].push(b);
    graph[b].push(a);
  });
  const start = wires[cut][0];
  const seen = Array(n + 1).fill(false);
  seen[start] = true;
  const queue = [start];
  let head = 0; // 큐는 shift() 대신 머리 인덱스를 씁니다
  while (head < queue.length) {
    const v = queue[head++];
    for (const w of graph[v]) {
      if (!seen[w]) {
        seen[w] = true;
        queue.push(w);
      }
    }
  }
  return queue.length;
}
`;

const BEST = {
  python: `${SIDE_PY}
def solution(n, wires):
    best = n  # 두 덩어리의 차이는 n보다 클 수 없습니다
    for cut in range(len(wires)):  # 끊을 전선을 하나씩 정합니다
        count = side_size(n, wires, cut)
        best = min(best, abs(n - 2 * count))  # (n - count)와 count의 차이
    return best`,
  javascript: `${SIDE_JS}
function solution(n, wires) {
  let best = n; // 두 덩어리의 차이는 n보다 클 수 없습니다
  for (let cut = 0; cut < wires.length; cut++) { // 끊을 전선을 하나씩 정합니다
    const count = sideSize(n, wires, cut);
    best = Math.min(best, Math.abs(n - 2 * count)); // (n - count)와 count의 차이
  }
  return best;
}`,
};
// 마디: 끊기(전선을 빼고 잇기) → 세어 보기(한쪽 송전탑 세기) → 비교하기(차이를 최솟값과 견주기)
const CUT_AT = {
  start: lines(BEST, ['best = n', 'for cut in range(len(wires))'], ['let best = n', 'for (let cut = 0']),
  cut: lines(BEST, ['for cut in range(len(wires))', 'if i != cut:', 'graph[a].append(b)'], ['for (let cut = 0', 'if (i === cut) return', 'graph[a].push(b)']),
  count: lines(BEST, ['start = wires[cut][0]', 'while queue:', 'count += 1', 'return count'], ['const start = wires[cut][0]', 'while (head < queue.length)', 'return queue.length']),
  compare: lines(BEST, ['count = side_size(n, wires, cut)', 'best = min(best, abs(n - 2 * count))'], ['const count = sideSize(n, wires, cut)', 'best = Math.min(best, Math.abs(n - 2 * count))']),
  done: lines(BEST, ['return best'], ['return best']),
};

const SUBTREE = {
  python: `def solution(n, wires):
    graph = [[] for _ in range(n + 1)]
    for a, b in wires:
        graph[a].append(b)
        graph[b].append(a)

    best = n

    def size(v, parent):
        nonlocal best
        total = 1  # 자기 자신
        for w in graph[v]:
            if w != parent:
                total += size(w, v)  # 아래 송전탑 수를 더합니다
        # v와 부모 사이 전선을 끊으면 v 쪽이 total개, 반대쪽이 n - total개
        best = min(best, abs(n - 2 * total))
        return total

    size(1, 0)
    return best`,
  javascript: `function solution(n, wires) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of wires) {
    graph[a].push(b);
    graph[b].push(a);
  }

  let best = n;

  const size = (v, parent) => {
    let total = 1; // 자기 자신
    for (const w of graph[v]) {
      if (w !== parent) total += size(w, v); // 아래 송전탑 수를 더합니다
    }
    // v와 부모 사이 전선을 끊으면 v 쪽이 total개, 반대쪽이 n - total개
    best = Math.min(best, Math.abs(n - 2 * total));
    return total;
  };

  size(1, 0);
  return best;
}`,
};
const SUB_AT = {
  start: lines(SUBTREE, ['best = n', 'size(1, 0)'], ['let best = n', 'size(1, 0)']),
  size: lines(SUBTREE, ['total = 1', 'total += size(w, v)'], ['let total = 1', 'total += size(w, v)']),
  leaf: lines(SUBTREE, ['total = 1', 'for w in graph[v]:'], ['let total = 1', 'for (const w of graph[v])']),
  compare: lines(SUBTREE, ['best = min(best, abs(n - 2 * total))', 'return total'], ['best = Math.min(best, Math.abs(n - 2 * total))', 'return total']),
  done: lines(SUBTREE, ['size(1, 0)', 'return best'], ['size(1, 0)', 'return best']),
};

const HUB_TRAP = {
  python: `# 주의: 전선이 가장 많이 모인 송전탑에 붙은 전선만 끊어 보는 오답 풀이입니다
${SIDE_PY}
def solution(n, wires):
    degree = [0] * (n + 1)
    for a, b in wires:
        degree[a] += 1
        degree[b] += 1
    hub = degree.index(max(degree))  # 전선이 가장 많이 모인 송전탑

    best = n
    for cut in range(len(wires)):
        if hub not in wires[cut]:
            continue  # 허브에 붙지 않은 전선은 끊어 보지 않습니다
        count = side_size(n, wires, cut)
        best = min(best, abs(n - 2 * count))
    return best`,
  javascript: `// 주의: 전선이 가장 많이 모인 송전탑에 붙은 전선만 끊어 보는 오답 풀이입니다
${SIDE_JS}
function solution(n, wires) {
  const degree = Array(n + 1).fill(0);
  for (const [a, b] of wires) {
    degree[a]++;
    degree[b]++;
  }
  const hub = degree.indexOf(Math.max(...degree)); // 전선이 가장 많이 모인 송전탑

  let best = n;
  for (let cut = 0; cut < wires.length; cut++) {
    if (!wires[cut].includes(hub)) continue; // 허브에 붙지 않은 전선은 끊어 보지 않습니다
    const count = sideSize(n, wires, cut);
    best = Math.min(best, Math.abs(n - 2 * count));
  }
  return best;
}`,
};
const HUB_AT = {
  hub: lines(HUB_TRAP, ['degree = [0] * (n + 1)', 'degree[a] += 1', 'hub = degree.index(max(degree))'], ['const degree = Array(n + 1)', 'degree[a]++', 'const hub = degree.indexOf']),
  skip: lines(HUB_TRAP, ['for cut in range(len(wires)):', 'if hub not in wires[cut]:', 'continue'], ['for (let cut = 0; cut < wires.length; cut++)', 'if (!wires[cut].includes(hub)) continue']),
  cut: lines(HUB_TRAP, ['for cut in range(len(wires)):', 'if hub not in wires[cut]:', 'if i != cut:', 'graph[a].append(b)'], ['for (let cut = 0; cut < wires.length; cut++)', 'if (!wires[cut].includes(hub)) continue', 'if (i === cut) return', 'graph[a].push(b)']),
  count: lines(HUB_TRAP, ['start = wires[cut][0]', 'while queue:', 'count += 1', 'return count'], ['const start = wires[cut][0]', 'while (head < queue.length)', 'return queue.length']),
  compare: lines(HUB_TRAP, ['count = side_size(n, wires, cut)', 'best = min(best, abs(n - 2 * count))'], ['const count = sideSize(n, wires, cut)', 'best = Math.min(best, Math.abs(n - 2 * count))']),
  done: lines(HUB_TRAP, ['return best'], ['return best']),
};

/* ------------------------------------------------------------------ */
/* 장면: 위에 전선 목록, 가운데 송전탑 그림, 아래에 계산 글과 최솟값            */
/* ------------------------------------------------------------------ */

// 가로: 칸 46px, 사슬 여섯이 12~408(사이 24px). 세로: 안내 글 0~16, 전선 목록 22~56, 송전탑 70~256, 계산 글 272~298, 최솟값 304~334.
const W = 420;
const H = 340;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다
const CELL = 46;
const rect = (x: number, y: number): Rect => ({ x, y, w: CELL, h: CELL });
const NODE: Record<number, Rect> = { 1: rect(12, 140), 2: rect(12, 70), 3: rect(12, 210), 4: rect(82, 140), 5: rect(152, 140), 6: rect(222, 140), 7: rect(292, 140), 8: rect(362, 140) };
const nid = (v: number) => `v:${v}`;
const wid = (i: number) => `w:${i}`;
const eid = (i: number) => `e:${i}`;
const wireRect = (i: number): Rect => ({ x: 10 + i * 58, y: 22, w: 52, h: 34 });
// 전선: 두 칸의 맞닿는 가장자리끼리 잇는다(선이 칸 숫자를 덮지 않게)
const edgePoints = ([a, b]: [number, number]): Point[] => {
  const [p, q] = [NODE[a], NODE[b]];
  if (p.y === q.y) {
    const [l, r] = p.x < q.x ? [p, q] : [q, p];
    return [[l.x + CELL, l.y + CELL / 2], [r.x, r.y + CELL / 2]];
  }
  const [t, u] = p.y < q.y ? [p, q] : [q, p];
  return [[t.x + CELL / 2, t.y + CELL], [u.x + CELL / 2, u.y]];
};
const wireLine = (i: number): Item => ({ id: eid(i), kind: 'line', rect: FULL, tone: 'trail', points: edgePoints(WIRES[i]) });

function board(title: string, withWires: boolean): Scene {
  const items: Item[] = [{ id: 'title', kind: 'text', rect: { x: 12, y: 0, w: 396, h: 16 }, tone: 'muted', text: title }];
  if (withWires) WIRES.forEach(([a, b], i) => items.push({ id: wid(i), kind: 'cell', rect: wireRect(i), tone: 'plain', text: `${a}-${b}` }));
  for (let v = 1; v <= N; v++) items.push({ id: nid(v), kind: 'cell', rect: NODE[v], tone: 'plain', text: String(v) });
  WIRES.forEach((_, i) => items.push(wireLine(i)));
  items.push(
    { id: 'calc', kind: 'text', rect: { x: 12, y: 272, w: 396, h: 26 }, text: '' },
    { id: 't:best', kind: 'token', rect: { x: 12, y: 304, w: 130, h: 30 }, tone: 'chosen', text: `최소 차이 ${N}` },
  );
  return { width: W, height: H, items };
}
const calcTo = (text: string) => set('calc', { text });
const bestTo = (best: number, t: Tone = 'chosen') => set('t:best', { text: `최소 차이 ${best}`, tone: t }, true);
// 두 덩어리를 칠한다: side는 한쪽(초록), 나머지는 반대쪽(파랑)
const paintSides = (side: number[]): Action[] =>
  [...Array(N).keys()].map((k) => tone(nid(k + 1), side.includes(k + 1) ? 'visited' : 'queued'));
const paintPlain = (): Action[] => [...Array(N).keys()].map((k) => tone(nid(k + 1), 'plain'));

/* ------------------------------------------------------------------ */
/* 정석 · 함정: 끊기 → 세어 보기 → 비교하기                               */
/* ------------------------------------------------------------------ */

function cutting(trap: boolean): Visualization {
  const rec = new StepRecorder(board(trap ? '전선이 가장 많이 모인 송전탑의 전선만 끊어 봅니다' : '전선을 하나씩 끊어 봅니다', true));
  const AT = trap ? HUB_AT : CUT_AT;
  const picks = CUTS.filter((c) => !trap || WIRES[c.i].includes(HUB));
  let best = N;
  let bestWire = -1;
  let work = 0; // 송전탑을 센 횟수
  let cut: number | undefined;
  let count: number | undefined;
  const meta = (): Meta => ({
    work,
    variables: { ...(trap ? { hub: HUB } : {}), cut: cut ?? '-', count: count ?? '-', best },
  });

  rec.step({ title: trap ? `허브: ${HUB}번 (전선 ${degree(HUB)}개)` : '전선을 하나씩 끊어 보기', codeHighlights: trap ? HUB_AT.hub : CUT_AT.start, ...meta() });
  if (trap) {
    rec.phase('허브 찾기', `송전탑마다 이어진 전선 수를 세어 보니 ${HUB}번이 ${degree(HUB)}개로 가장 많습니다. 가운데일 것 같은 ${HUB}번에 붙은 전선만 끊어 보기로 합니다.`, HUB_AT.hub);
    rec.do(...together([...Array(N).keys()].map((k) => set(nid(k + 1), { tag: `전선 ${degree(k + 1)}` }))));
    rec.do(...together([
      tone(nid(HUB), 'current', true),
      ...WIRES.map((w, i) => tone(wid(i), w.includes(HUB) ? 'queued' : 'muted')),
    ]));
  } else {
    rec.phase('시작', `송전탑 ${N}개가 전선 ${WIRES.length}개로 이어진 트리입니다. 전선을 하나씩 끊어 보고, 갈라진 두 덩어리의 송전탑 수 차이가 가장 작은 경우를 찾습니다. 최솟값은 ${N}에서 시작합니다.`, CUT_AT.start);
    rec.do(wait(300));
  }

  for (const c of picks) {
    const [a, b] = WIRES[c.i];
    const count1 = c.side.length;
    const other = N - count1;
    const prev = best;
    const improved = c.diff < best;
    cut = c.i;
    count = count1;
    work += count1;
    best = Math.min(best, c.diff);
    rec.step({ title: `전선 ${wireText(c.i)} 끊기: ${count1}개와 ${other}개, 차이 ${c.diff}`, codeHighlights: AT.compare, ...meta() });

    rec.phase('끊기', `${c.i + 1}번째 전선 ${wireJosa(c.i, '을', '를')} 끊습니다. 이 전선을 뺀 나머지 전선만 이어서 생각합니다.`, AT.cut);
    rec.do({ type: 'focus', ids: [wid(c.i), nid(a), nid(b)] });
    rec.do(...together([tone(wid(c.i), 'bad'), { type: 'remove', id: eid(c.i) }, calcTo(`전선 ${wireText(c.i)} 끊김`)]));

    rec.phase('세어 보기', `${a}번에서 닿는 송전탑은 ${count1}개이고, 반대쪽은 ${N} − ${count1} = ${other}개입니다.`, AT.count);
    rec.do(...together([{ type: 'unfocus' }, ...paintSides(c.side)]));
    rec.do(calcTo(`${a}번 쪽 ${count1}개 · 반대쪽 ${other}개`));

    rec.phase('비교하기', improved
      ? `차이는 |${count1} − ${other}| = ${ro(c.diff)}, 지금까지의 최솟값 ${prev}보다 작아 최솟값을 ${ro(c.diff)} 바꿉니다. 전선은 다시 잇습니다.`
      : `차이는 |${count1} − ${other}| = ${ro(c.diff)}, 최솟값 ${prev}보다 작지 않아 그대로 둡니다. 전선은 다시 잇습니다.`, AT.compare);
    rec.do(...together([calcTo(`|${count1} − ${other}| = ${c.diff}`), ...(improved ? [bestTo(best)] : [])]));
    rec.do(...together([
      { type: 'add', item: wireLine(c.i) },
      ...paintPlain(),
      ...(improved && bestWire >= 0 ? [tone(wid(bestWire), 'explored')] : []),
      tone(wid(c.i), improved ? 'good' : 'explored'),
    ]));
    if (improved) bestWire = c.i;
  }

  cut = undefined;
  count = undefined;
  if (trap) {
    const win = BEST_CUT;
    rec.step({ title: `최솟값 ${best} — 정답은 ${BEST_DIFF}`, codeHighlights: HUB_AT.done, ...meta(), answer: best, isKeyframe: true });
    rec.phase('비교하기', `허브에 붙은 전선만 끊어 보니 최솟값은 ${best}입니다. 하지만 ${wireJosa(win.i, '을', '를')} 끊으면 ${win.side.length}개와 ${N - win.side.length}개로 갈라져 차이가 ${BEST_DIFF}입니다. 허브에서 먼 전선도 모두 확인해야 합니다.`, HUB_AT.done);
    rec.do(...together([...paintSides(win.side), { type: 'remove', id: eid(win.i) }, tone(wid(win.i), 'good', true), bestTo(best, 'bad'), calcTo(`내 답 ${best} ≠ 정답 ${BEST_DIFF}: ${wireJosa(win.i, '을', '를')} 끊으면 ${win.side.length}개 · ${N - win.side.length}개`)]));
    return holdCaptions(rec.finish());
  }
  const win = BEST_CUT;
  rec.step({ title: `최솟값 ${best}`, codeHighlights: CUT_AT.done, ...meta(), answer: best, isKeyframe: true });
  rec.phase('결과', `전선을 모두 끊어 보니 ${wireJosa(win.i, '을', '를')} 끊을 때 ${win.side.length}개와 ${N - win.side.length}개로 갈라져 차이가 ${ro(best)} 가장 작습니다. 송전탑을 센 횟수는 모두 ${work}번입니다.`, CUT_AT.done);
  rec.do(...together([...paintSides(win.side), { type: 'remove', id: eid(win.i) }, tone(wid(win.i), 'path', true), bestTo(best, 'path'), calcTo(`${wireJosa(win.i, '을', '를')} 끊으면 ${win.side.length}개 · ${N - win.side.length}개 → 차이 ${best}`)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 크기 구하기 → 비교하기 (후위 순서로 송전탑마다)                    */
/* ------------------------------------------------------------------ */

function subtreeSizes(): Visualization {
  const rec = new StepRecorder(board('1번을 뿌리로 잡고 아래부터 크기를 셉니다', false));
  let best = N;
  let work = 0;
  let current: Visit | undefined;
  const meta = (): Meta => ({ work, variables: { v: current?.v ?? '-', total: current?.size ?? '-', best } });

  rec.step({ title: '1번을 뿌리로 잡고 시작', codeHighlights: SUB_AT.start, ...meta() });
  rec.phase('시작', `1번을 뿌리로 잡고 아래로 내려갔다가 올라오며, 송전탑마다 자기 아래(자기 포함)의 송전탑 수인 크기를 셉니다. 크기가 s인 송전탑 위의 전선을 끊으면 s개와 ${N} − s개로 갈라집니다.`, SUB_AT.start);
  rec.do(tone(nid(1), 'current', true), wait(200));

  let winner = 0;
  let winDiff = N;
  POST.filter((p) => p.v !== 1).forEach((p) => {
    const diff = gap(p.size);
    const improved = diff < best;
    const prev = best;
    if (diff < winDiff) {
      winDiff = diff;
      winner = p.v;
    }
    current = p;
    work++;
    best = Math.min(best, diff);
    rec.step({ title: `${p.v}번의 크기 ${p.size}: 위 전선을 끊으면 ${p.size}개와 ${N - p.size}개, 차이 ${diff}`, codeHighlights: SUB_AT.compare, ...meta() });

    if (p.kids.length) {
      const kid = p.kids[0]; // 이 그림에서는 아래가 하나뿐이다
      rec.phase('크기 구하기', `${p.v}번의 크기는 자기 1 + 아래 ${kid}번의 크기 ${POST.find((q) => q.v === kid)!.size} = ${p.size}입니다.`, SUB_AT.size);
      rec.do({ type: 'focus', ids: [nid(kid), nid(p.v)] });
      rec.do({ type: 'arrow', from: nid(kid), to: nid(p.v), verdict: 'new', label: `+${POST.find((q) => q.v === kid)!.size}` }, wait(150));
      rec.do(...together([...clear(), set(nid(p.v), { tone: 'visited', tag: `크기 ${p.size}` }, true), calcTo(`1 + ${POST.find((q) => q.v === kid)!.size} = ${p.size}`)]));
    } else {
      rec.phase('크기 구하기', `${p.v}번은 아래에 송전탑이 없어 크기가 1입니다.`, SUB_AT.leaf);
      rec.do(...together([set(nid(p.v), { tone: 'visited', tag: `크기 ${p.size}` }, true), calcTo(`크기 ${p.size}`)]));
    }

    rec.phase('비교하기', improved
      ? `${p.v}번 위의 전선을 끊으면 ${p.size}개와 ${N - p.size}개, 차이는 ${diff}입니다. 최솟값 ${prev}보다 작아 ${ro(diff)} 바꿉니다.`
      : `${p.v}번 위의 전선을 끊으면 ${p.size}개와 ${N - p.size}개, 차이는 ${diff}입니다. 최솟값 ${prev}보다 작지 않아 그대로 둡니다.`, SUB_AT.compare);
    rec.do({ type: 'focus', ids: [nid(p.parent), nid(p.v)] });
    rec.do({ type: 'arrow', from: nid(p.parent), to: nid(p.v), verdict: (improved ? 'good' : 'seen') as Verdict, label: `차이 ${diff}` }, wait(150));
    rec.do(...together([...clear(), calcTo(`|${N} − 2 × ${p.size}| = ${diff}`), ...(improved ? [bestTo(best)] : [])]));
  });

  const root = POST.at(-1)!;
  current = root;
  work++;
  const wi = wireOf(POST.find((q) => q.v === winner)!.parent, winner);
  rec.step({ title: `최솟값 ${best}`, codeHighlights: SUB_AT.done, ...meta(), answer: best, isKeyframe: true });
  rec.phase('결과', `뿌리 1번의 크기는 ${ro(N)}, 송전탑을 한 번씩만 거쳐 모든 전선의 차이를 구했습니다. ${wireJosa(wi, '을', '를')} 끊을 때 ${POST.find((q) => q.v === winner)!.size}개와 ${N - POST.find((q) => q.v === winner)!.size}개로 차이가 ${ro(best)} 가장 작습니다. 송전탑을 센 횟수는 ${work}번뿐입니다.`, SUB_AT.done);
  rec.do(...together([set(nid(1), { tone: 'visited', tag: `크기 ${N}` }, true), calcTo(`크기 ${N} = 송전탑 전체`)]));
  rec.do(...together([set(eid(wi), { tone: 'path' }), bestTo(best, 'path'), calcTo(`${wireJosa(wi, '을', '를')} 끊으면 차이 ${best}`)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'split-power-grid',
  title: '전력망을 둘로 나누기',
  level: 2,
  category: 'brute-force',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/86971',
  description: {
    summary:
      'n개의 송전탑이 전선 n − 1개로 이어진, 하나의 트리 모양 전력망이 있습니다. 전선 하나를 끊어 송전탑을 두 전력망으로 나눌 때, 두 전력망이 가진 송전탑 수의 차이(절댓값)가 가장 작아지도록 합니다. 그때의 차이를 구합니다.',
    rules: [
      'n은 2 이상 100 이하의 자연수',
      'wires는 길이 n − 1인 2차원 배열이고, 각 원소 [v1, v2]는 v1번과 v2번 송전탑이 전선으로 이어져 있다는 뜻 (1 ≤ v1 < v2 ≤ n)',
      '전력망은 항상 하나의 트리 모양으로만 주어짐',
    ],
    examples: [
      { input: 'n = 9, wires = [[1,3],[2,3],[3,4],[4,5],[4,6],[4,7],[7,8],[7,9]]', output: '3' },
      { input: 'n = 4, wires = [[1,2],[2,3],[3,4]]', output: '0' },
      { input: 'n = 7, wires = [[1,2],[2,7],[3,7],[3,4],[4,5],[6,7]]', output: '1' },
    ],
  },
  keyIntuitions: [
    'n이 100 이하라 전선(최대 99개)을 하나씩 끊어 보는 완전탐색으로 충분합니다. 전선마다 송전탑을 한 번 훑어도 100 × 100 정도입니다.',
    '트리에서 전선 하나를 끊으면 항상 정확히 두 덩어리가 됩니다. 한쪽 송전탑 수를 세면 다른 쪽은 n에서 빼면 되니, 차이는 |n − 2 × (한쪽 수)|입니다.',
    '"전선이 가장 많이 모인 송전탑 근처가 한가운데겠지" 같은 짐작은 틀릴 수 있습니다. 균형은 끊었을 때 갈라지는 덩어리 크기로 정해지므로, 모든 전선을 끊어 봐야 안전합니다.',
  ],
  demo: { input: [N, WIRES], label: 'n = 8, wires = [[1,2],[1,3],[1,4],[4,5],[5,6],[6,7],[7,8]]' },
  workUnit: '송전탑을 센 횟수',
  approaches: [
    {
      id: 'grid-cut-each',
      name: '전선을 하나씩 끊고 한쪽 송전탑 세기',
      rank: 'BEST',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '전선을 하나씩 끊어 보며, 끊은 전선의 한쪽 끝에서 닿는 송전탑 수를 세어 두 덩어리의 차이를 견줍니다.',
      pros: [
        '생각이 단순해서 맞게 짜기 쉽습니다.',
        '트리의 성질을 몰라도, 이어진 송전탑을 세는 BFS만 알면 풀 수 있습니다.',
        'n이 100 이하라 전선마다 한 번씩 세어도 1만 번 안팎이면 끝납니다.',
      ],
      cons: [
        '전선을 끊을 때마다 그래프를 새로 만들고 처음부터 세어 같은 계산이 겹칩니다.',
        'n이 수만 개로 커지면 시간 초과가 날 수 있습니다.',
      ],
      whyThisRank: '송전탑이 100개 이하라 전선을 모두 끊어 봐도 충분히 빠르고, 가정이 거의 없어 틀리기 어렵습니다. "하나씩 모두 시도한다"는 완전탐색의 정석이 그대로 통합니다.',
      code: BEST,
      visualize: () => cutting(false),
    },
    {
      id: 'grid-subtree-size',
      name: '한 번의 DFS로 서브트리 크기 구하기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '1번을 뿌리로 잡고 한 번만 훑으며 송전탑마다 아래 크기를 구해, 위 전선을 끊을 때의 차이를 한꺼번에 계산합니다.',
      pros: ['훑는 것이 한 번뿐이라 송전탑 수에 비례해 빠릅니다.', 'n이 아주 커져도 쓸 수 있습니다.'],
      cons: [
        '"크기 = 1 + 아래 크기의 합"과 "끊으면 s개와 n − s개"라는 두 발상을 함께 떠올려야 합니다.',
        '재귀 깊이가 n까지 갈 수 있어, 입력이 아주 크면 스택 한계에 걸립니다.',
        '트리가 아닌 그래프에는 쓸 수 없습니다.',
      ],
      whyThisRank: '더 빠르지만 n이 100 이하라 정석으로도 충분하고, 서브트리 크기라는 한 단계 더 나아간 발상이 필요합니다. 정석을 확실히 익힌 뒤 갈아타는 풀이로 둡니다.',
      code: SUBTREE,
      visualize: subtreeSizes,
    },
    {
      id: 'grid-hub-only',
      name: '전선이 가장 많이 모인 송전탑의 전선만 끊기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N × 허브의 전선 수)',
      spaceComplexity: 'O(N)',
      verdict: '가운데일 것 같은 송전탑 주변만 끊어 보다가 더 좋은 전선을 놓쳐 오답이 나옵니다.',
      pros: ['끊어 볼 전선이 줄어 계산이 빠릅니다.', '원문 예제 세 개를 모두 통과해서 틀린 줄 알아채기 어렵습니다.'],
      cons: [
        '전선이 가장 많이 모인 송전탑이 송전탑 수로 한가운데라는 보장이 없습니다.',
        '시각화 입력에서 1번의 전선만 끊으면 차이가 2에 그치지만, 허브에서 먼 [4, 5]를 끊으면 4개와 4개로 갈라져 0입니다.',
      ],
      whyThisRank: '송전탑 수의 균형은 전선이 몇 개 모였는지가 아니라 끊었을 때 갈라지는 덩어리 크기로 정해집니다. 후보를 짐작으로 줄이지 말고 모든 전선을 확인해야 합니다.',
      code: HUB_TRAP,
      visualize: () => cutting(true),
    },
  ],
  checks: {
    cases: [
      { args: [9, [[1, 3], [2, 3], [3, 4], [4, 5], [4, 6], [4, 7], [7, 8], [7, 9]]], expected: 3 },
      { args: [4, [[1, 2], [2, 3], [3, 4]]], expected: 0 },
      { args: [7, [[1, 2], [2, 7], [3, 7], [3, 4], [4, 5], [6, 7]]], expected: 1 },
      { args: [2, [[1, 2]]], expected: 0 },
      { args: [3, [[1, 2], [2, 3]]], expected: 1 },
      { args: [5, [[1, 2], [1, 3], [1, 4], [1, 5]]], expected: 3 },
      { args: [100, Array.from({ length: 99 }, (_, i) => [i + 1, i + 2])], expected: 0 },
      { args: [100, Array.from({ length: 99 }, (_, i) => [1, i + 2])], expected: 98 },
      { args: [N, WIRES], expected: 0 },
    ],
    // 송전탑 2~12개의 무작위 트리: 번호를 섞고, 새 송전탑을 앞선 송전탑 하나에 붙이고, 전선 순서도 섞는다
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 11);
      const label = Array.from({ length: n }, (_, i) => i + 1);
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [label[i], label[j]] = [label[j], label[i]];
      }
      const wires = Array.from({ length: n - 1 }, (_, k) => {
        const [x, y] = [label[k + 1], label[Math.floor(rand() * (k + 1))]];
        return [Math.min(x, y), Math.max(x, y)];
      });
      for (let i = wires.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [wires[i], wires[j]] = [wires[j], wires[i]];
      }
      return [n, wires];
    },
  },
};

export default problem;
