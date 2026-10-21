// 피로도: 정석 순열 백트래킹(DFS + 가지치기), 대안 모든 순서를 만들어 하나씩 시뮬레이션, 함정 소모가 적은 던전부터 가기.
// 정석은 결정 나무(칸 = 던전을 고른 모습, 선 = 가지), 대안은 순서 6개를 표로, 함정은 정렬한 던전 한 줄로 그린다.
import { around } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';
import { branch, clear, holdCaptions, layoutTree, ringTo, set, tone, wait, type Shape } from './common.ts';

// 원문 예제. 세 풀이의 시각화 입력이자 점검 사례다. 소모가 적은 순으로 가면 2개, 1번 → 3번 → 2번으로 가면 3개다.
const K = 80;
const DUNGEONS: [number, number][] = [[80, 20], [50, 40], [30, 10]];
const N = DUNGEONS.length;
const nameOf = (i: number) => `${i + 1}번`; // '번'은 받침이 있어 조사는 은·을·이로 직접 쓴다
const infoOf = (i: number) => `[${DUNGEONS[i][0]}, ${DUNGEONS[i][1]}]`;
const trail = (path: number[]) => path.map(nameOf).join(' → ');
const kAt = (path: number[]) => K - path.reduce((s, i) => s + DUNGEONS[i][1], 0);
const placeOf = (path: number[]) => (path.length ? `${trail(path)} 자리` : '맨 처음 자리');
const sign = (ok: boolean) => (ok ? '≥' : '<');
interface Meta { work: number; variables: Record<string, string | number> }

// 정석(DFS)이 시도하는 순서: 아직 안 간 던전을 하나 골라 들어갈 수 있는지 본다. 들어가면 그 아래로 내려간다.
interface Try { parent: number[]; i: number; before: number; ok: boolean; after: number; best: number }
const TRIES: Try[] = [];
{
  let best = 0;
  const dfs = (path: number[]) => {
    best = Math.max(best, path.length);
    for (let i = 0; i < N; i++) {
      if (path.includes(i)) continue;
      const before = kAt(path);
      const ok = before >= DUNGEONS[i][0];
      TRIES.push({ parent: path, i, before, ok, after: ok ? before - DUNGEONS[i][1] : before, best: ok ? Math.max(best, path.length + 1) : best });
      if (ok) dfs([...path, i]);
    }
  };
  dfs([]);
}
const BEST_COUNT = TRIES.at(-1)!.best;
const BEST_PATH = (() => {
  const t = TRIES.find((x) => x.ok && x.parent.length + 1 === BEST_COUNT)!;
  return [...t.parent, t.i];
})();

// 대안이 만드는 순서와 순서마다의 시뮬레이션(못 들어가는 던전을 만나면 거기서 끝)
interface Sim { order: number[]; trials: { i: number; before: number; ok: boolean; after: number }[]; count: number; end: number }
const SIMS: Sim[] = [];
{
  const build = (order: number[]) => {
    if (order.length === N) {
      let k = K;
      let count = 0;
      const trials: Sim['trials'] = [];
      for (const i of order) {
        const ok = k >= DUNGEONS[i][0];
        trials.push({ i, before: k, ok, after: ok ? k - DUNGEONS[i][1] : k });
        if (!ok) break;
        k -= DUNGEONS[i][1];
        count++;
      }
      SIMS.push({ order, trials, count, end: k });
      return;
    }
    for (let i = 0; i < N; i++) if (!order.includes(i)) build([...order, i]);
  };
  build([]);
}
const SIM_CHECKS = SIMS.reduce((s, x) => s + x.trials.length, 0);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST = {
  python: `def solution(k, dungeons):
    visited = [False] * len(dungeons)  # 이미 다녀온 던전
    best = 0

    def dfs(fatigue, count):
        nonlocal best
        best = max(best, count)  # 지금까지 클리어한 개수의 최댓값
        for i, (need, cost) in enumerate(dungeons):
            if visited[i] or fatigue < need:
                continue  # 이미 갔거나 피로도가 모자라면 이 가지는 쳐냅니다
            visited[i] = True
            dfs(fatigue - cost, count + 1)
            visited[i] = False  # 되돌아와서 다른 순서도 해 봅니다

    dfs(k, 0)
    return best`,
  javascript: `function solution(k, dungeons) {
  const visited = Array(dungeons.length).fill(false); // 이미 다녀온 던전
  let best = 0;

  const dfs = (fatigue, count) => {
    best = Math.max(best, count); // 지금까지 클리어한 개수의 최댓값
    for (let i = 0; i < dungeons.length; i++) {
      const [need, cost] = dungeons[i];
      if (visited[i] || fatigue < need) continue; // 이미 갔거나 피로도가 모자라면 이 가지는 쳐냅니다
      visited[i] = true;
      dfs(fatigue - cost, count + 1);
      visited[i] = false; // 되돌아와서 다른 순서도 해 봅니다
    }
  };

  dfs(k, 0);
  return best;
}`,
};
const BT = {
  start: lines(BEST, ['visited = [False]', 'best = 0', 'dfs(k, 0)'], ['const visited', 'let best = 0', 'dfs(k, 0)']),
  pick: lines(BEST, ['for i, (need, cost) in enumerate(dungeons)'], ['for (let i = 0; i < dungeons.length; i++)']),
  check: lines(BEST, ['if visited[i] or fatigue < need:'], ['if (visited[i] || fatigue < need) continue']),
  enter: lines(BEST, ['visited[i] = True', 'dfs(fatigue - cost, count + 1)', 'best = max(best, count)'], ['visited[i] = true', 'dfs(fatigue - cost, count + 1)', 'best = Math.max(best, count)']),
  prune: lines(BEST, ['if visited[i] or fatigue < need:', 'continue'], ['if (visited[i] || fatigue < need) continue']),
  back: lines(BEST, ['visited[i] = False'], ['visited[i] = false']),
  done: lines(BEST, ['dfs(k, 0)', 'return best'], ['dfs(k, 0)', 'return best']),
};

const ALL = {
  python: `from itertools import permutations

def solution(k, dungeons):
    best = 0
    for order in permutations(dungeons):  # 던전 순서를 모두 만듭니다
        fatigue, count = k, 0
        for need, cost in order:  # 순서마다 처음부터 시뮬레이션합니다
            if fatigue < need:
                break  # 못 들어가는 던전을 만나면 그 순서는 거기서 끝
            fatigue -= cost
            count += 1
        best = max(best, count)
    return best`,
  javascript: `function solution(k, dungeons) {
  // 던전 순서를 모두 만듭니다
  const orders = [];
  const build = (order, rest) => {
    if (rest.length === 0) {
      orders.push(order);
      return;
    }
    for (let i = 0; i < rest.length; i++) {
      build([...order, rest[i]], [...rest.slice(0, i), ...rest.slice(i + 1)]);
    }
  };
  build([], dungeons);

  let best = 0;
  for (const order of orders) {
    let fatigue = k;
    let count = 0;
    for (const [need, cost] of order) { // 순서마다 처음부터 시뮬레이션합니다
      if (fatigue < need) break; // 못 들어가는 던전을 만나면 그 순서는 거기서 끝
      fatigue -= cost;
      count++;
    }
    best = Math.max(best, count);
  }
  return best;
}`,
};
const ALL_AT = {
  make: lines(ALL, ['for order in permutations(dungeons)'], ['const orders = []', 'build([], dungeons)']),
  start: lines(ALL, ['for order in permutations(dungeons)', 'fatigue, count = k, 0'], ['for (const order of orders)', 'let fatigue = k', 'let count = 0']),
  enter: lines(ALL, ['for need, cost in order:', 'if fatigue < need:', 'fatigue -= cost', 'count += 1'], ['for (const [need, cost] of order)', 'if (fatigue < need) break', 'fatigue -= cost', 'count++']),
  stop: lines(ALL, ['for need, cost in order:', 'if fatigue < need:', 'break'], ['for (const [need, cost] of order)', 'if (fatigue < need) break']),
  record: lines(ALL, ['best = max(best, count)'], ['best = Math.max(best, count)']),
  done: lines(ALL, ['best = max(best, count)', 'return best'], ['best = Math.max(best, count)', 'return best']),
};

const GREEDY = {
  python: `# 주의: 소모 피로도가 적은 던전부터 가는 오답 풀이입니다
def solution(k, dungeons):
    count = 0
    for need, cost in sorted(dungeons, key=lambda d: d[1]):  # 소모 피로도가 적은 순
        if k >= need:
            k -= cost
            count += 1
    return count`,
  javascript: `// 주의: 소모 피로도가 적은 던전부터 가는 오답 풀이입니다
function solution(k, dungeons) {
  let count = 0;
  for (const [need, cost] of [...dungeons].sort((a, b) => a[1] - b[1])) { // 소모 피로도가 적은 순
    if (k >= need) {
      k -= cost;
      count++;
    }
  }
  return count;
}`,
};
const GR_AT = {
  sort: lines(GREEDY, ['count = 0', 'sorted(dungeons'], ['let count = 0', '.sort((a, b) => a[1] - b[1])']),
  check: lines(GREEDY, ['for need, cost in sorted(dungeons', 'if k >= need:'], ['for (const [need, cost] of', 'if (k >= need)']),
  enter: lines(GREEDY, ['if k >= need:', 'k -= cost', 'count += 1'], ['if (k >= need)', 'k -= cost', 'count++']),
  skip: lines(GREEDY, ['for need, cost in sorted(dungeons'], ['for (const [need, cost] of']),
  done: lines(GREEDY, ['return count'], ['return count']),
};

/* ------------------------------------------------------------------ */
/* 장면: 위에 던전 표(세 풀이 공통), 가운데 그림(나무 · 표 · 한 줄), 아래 계산 글과 계수기 */
/* ------------------------------------------------------------------ */

// 가로: 던전 칸 118px 셋이 18~392. 세로: 안내 글 0~16, 던전 28~74(판정 표시가 칸 위로 11px 올라오니 안내 글 아래로 내린다).
const W = 420;
const legendId = (i: number) => `d:${i}`;
const legendRect = (i: number): Rect => ({ x: 18 + i * 128, y: 28, w: 118, h: 46 });
const topItems = (title: string): Item[] => [
  { id: 'title', kind: 'text', rect: { x: 18, y: 0, w: 384, h: 16 }, tone: 'muted', text: title },
  ...DUNGEONS.map((_, i): Item => ({ id: legendId(i), kind: 'cell', rect: legendRect(i), tone: 'plain', text: infoOf(i), tag: `${nameOf(i)} 던전` })),
];
const TITLE = `던전 [필요, 소모] · 처음 피로도 k = ${K}`;
// 길에 든 던전은 초록, 지금 시험하는 던전은 노랑. 달라진 것만 동작으로 만든다
const legendTo = (rec: StepRecorder, path: number[], trying = -1): Action[] =>
  DUNGEONS.flatMap((_, i) => {
    const t: Tone = i === trying ? 'current' : path.includes(i) ? 'visited' : 'plain';
    return rec.get(legendId(i)).tone === t ? [] : [tone(legendId(i), t)];
  });
const tokenAt = (id: string, x: number, y: number, w: number, text: string, t: Tone): Item => ({ id, kind: 'token', rect: { x, y, w, h: 30 }, tone: t, text });

/* ------------------------------------------------------------------ */
/* 정석: 고르기 → 확인하기 → 들어가기(또는 쳐내기) → 되돌아가기              */
/* ------------------------------------------------------------------ */

// 나무: 시도마다 칸 하나(못 들어간 칸도 가지 끝에 남는다). 가지 끝마다 가로 칸을 하나씩 받는다.
// 세로: 나무 92~328(칸 54×44, 깊이마다 64px), 계산 글 338~366, 계수기 372~402. 가로: 가지 끝 여섯이 18~392.
const TREE = { x: 18, y: 92, w: 54, h: 44, gapX: 10, gapY: 20 };
const H_TREE = 410;
const FULL: Rect = { x: 0, y: 0, w: W, h: H_TREE }; // line은 rect 대신 points로 그린다
const keyOf = (path: number[]) => `n:${path.map((i) => i + 1).join('')}`;
const ROOT: Shape = { id: keyOf([]), kids: [] };
{
  const byKey = new Map<string, Shape>([[ROOT.id, ROOT]]);
  for (const t of TRIES) {
    const shape: Shape = { id: keyOf([...t.parent, t.i]), kids: [] };
    byKey.get(keyOf(t.parent))!.kids!.push(shape);
    byKey.set(shape.id, shape);
  }
}
const RECTS = layoutTree(ROOT, TREE);
const nodeRect = (path: number[]) => RECTS.get(keyOf(path))!;

function treeBoard(): Scene {
  return {
    width: W,
    height: H_TREE,
    items: [
      ...topItems(TITLE),
      { id: keyOf([]), kind: 'cell', rect: nodeRect([]), tone: 'visited', text: '시작', tag: `남은 ${K}` },
      { id: 'calc', kind: 'text', rect: { x: 18, y: 338, w: 384, h: 28 }, text: '' },
      tokenAt('t:now', 18, 372, 116, '클리어 0개', 'plain'),
      tokenAt('t:best', 142, 372, 116, '최대 0개', 'chosen'),
    ],
  };
}

function backtracking(): Visualization {
  const rec = new StepRecorder(treeBoard());
  let frame: number[] = []; // 지금 dfs가 서 있는 자리(길)
  let best = 0;
  let checks = 0; // 들어갈 수 있는지 확인한 횟수
  const meta = (): Meta => ({
    work: checks,
    variables: { fatigue: kAt(frame), count: frame.length, best, '다녀온 던전': frame.length ? frame.map(nameOf).join(', ') : '-' },
  });

  rec.step({ title: `dfs(k = ${K}, 0)에서 시작`, codeHighlights: BT.start, ...meta() });
  rec.phase('시작', `던전 ${N}개를 가는 순서를 정해 가장 많이 클리어하려 합니다. 처음 피로도 ${K}에서 시작해, 아직 안 간 던전을 하나씩 골라 들어갈 수 있는지 살핍니다. 못 들어가는 던전을 고르면 그 가지는 바로 쳐냅니다.`, BT.start);
  rec.do(ringTo(rec, around(nodeRect([]), 5)), wait(300));

  TRIES.forEach((t, n) => {
    const path = [...t.parent, t.i];
    const [need, cost] = DUNGEONS[t.i];
    const [id, pid, edge] = [keyOf(path), keyOf(t.parent), `e:${path.map((i) => i + 1).join('')}`];
    const after = TRIES[n + 1]?.parent ?? []; // 이 시도가 끝난 뒤 dfs가 서 있을 자리
    const last = n === TRIES.length - 1;
    const stay = t.ok ? path : t.parent;
    const prevBest = best;
    checks++;
    best = t.best;
    frame = after;

    rec.step({
      title: t.ok ? `${trail(path)}: 들어감, 남은 ${t.after}` : `${trail(path)}: 못 들어감 (${t.before} < ${need})`,
      codeHighlights: t.ok ? BT.enter : BT.prune,
      ...meta(),
    });
    rec.phase('고르기', `${placeOf(t.parent)}에서 아직 안 간 ${nameOf(t.i)} 던전 ${josa(infoOf(t.i), '을', '를')} 골라 봅니다.`, BT.pick);
    rec.do(...together([
      tone(legendId(t.i), 'current'),
      set('calc', { text: `${nameOf(t.i)}: 필요 ${need}, 소모 ${cost}` }),
      { type: 'add', item: { id, kind: 'cell', rect: nodeRect(path), tone: 'queued', text: nameOf(t.i), tag: `필요 ${need}` }, from: pid },
      { type: 'add', item: { id: edge, kind: 'line', rect: FULL, tone: 'trail', points: branch(nodeRect(t.parent), nodeRect(path)) } },
    ]));

    rec.phase('확인하기', t.ok
      ? `남은 피로도 ${josa(t.before, '이', '가')} 필요 피로도 ${need} 이상이라 들어갈 수 있습니다.`
      : `남은 피로도 ${ro(t.before)}는 필요 피로도 ${need}에 모자랍니다. 들어갈 수 없습니다.`, BT.check);
    rec.do({ type: 'focus', ids: [pid, id, legendId(t.i)] });
    rec.do({ type: 'arrow', from: pid, to: id, verdict: (t.ok ? 'good' : 'bad') as Verdict, label: `${t.before} ${sign(t.ok)} ${need}` }, wait(250));

    if (t.ok) {
      rec.phase('들어가기', `${nameOf(t.i)}에 들어갑니다. 남은 피로도는 ${t.before} − ${cost} = ${t.after}입니다.${t.best > prevBest ? ` 클리어 ${path.length}개로 최대 기록을 올립니다.` : ''}`, BT.enter);
      rec.do(...clear());
      rec.do(...together([
        set(id, { tone: 'visited', tag: `남은 ${t.after}` }, true),
        tone(legendId(t.i), 'visited'),
        ringTo(rec, around(nodeRect(path), 5)),
        set('calc', { text: `${t.before} − ${cost} = ${t.after}` }),
      ]));
      rec.do(...together([set('t:now', { text: `클리어 ${path.length}개` }, true), ...(t.best > prevBest ? [set('t:best', { text: `최대 ${t.best}개` }, true)] : [])]));
    } else {
      rec.phase('쳐내기', `${nameOf(t.i)}은 못 들어가니 이 가지는 여기서 쳐냅니다. 아래로는 내려가지 않습니다.`, BT.prune);
      rec.do(...clear());
      rec.do(...together([tone(id, 'explored'), tone(legendId(t.i), 'plain')]));
    }

    if (stay.length > after.length) {
      rec.phase('되돌아가기', last
        ? '더 고를 던전도, 다시 고를 갈래도 없어 맨 처음 자리로 돌아옵니다. 모든 순서를 살펴봤습니다.'
        : `더 고를 던전이 없어 ${placeOf(after)}로 돌아갑니다.`, BT.back);
      rec.do(...together([ringTo(rec, around(nodeRect(after), 5)), ...legendTo(rec, after)]));
    }
  });

  rec.step({ title: `최대 ${best}개`, codeHighlights: BT.done, ...meta(), answer: best, isKeyframe: true });
  rec.phase('결과', `모든 순서를 살펴 최대 ${best}개를 찾았습니다. ${trail(BEST_PATH)} 순서로 가면 ${best}개를 모두 클리어합니다. 던전에 들어갈 수 있는지 ${checks}번만 확인했고, 쳐낸 가지 아래는 보지 않았습니다.`, BT.done);
  rec.do(...together([
    { type: 'remove', id: 'ring' },
    ...[[], ...BEST_PATH.map((_, d) => BEST_PATH.slice(0, d + 1))].map((p) => tone(keyOf(p), 'path')),
    set('calc', { text: `${trail(BEST_PATH)} → ${best}개 클리어` }),
    tone('t:best', 'path', true),
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 순서 만들기 → 확인하기(칸마다) → 기록하기                           */
/* ------------------------------------------------------------------ */

// 표: 순서 한 줄에 시작 표시와 칸 셋, 맨 오른쪽에 그 순서의 결과. 판정 표시가 위 줄에 3px 걸치도록 줄 간격을 50px로 둔다.
// 세로: 표 92~384(줄마다 칸 42 + 간격 8), 계산 글 392~418, 최대 표시 390~420.
const H_TABLE = 426;
const rowY = (r: number) => 92 + r * 50;
const startRect = (r: number): Rect => ({ x: 18, y: rowY(r), w: 54, h: 42 });
const cellRect = (r: number, c: number): Rect => ({ x: 84 + c * 64, y: rowY(r), w: 54, h: 42 });
const resultRect = (r: number): Rect => ({ x: 282, y: rowY(r) + 6, w: 110, h: 30 });
const cid = (r: number, c: number) => `c:${r}:${c}`;

function tableBoard(): Scene {
  return {
    width: W,
    height: H_TABLE,
    items: [
      ...topItems(TITLE),
      { id: 'calc', kind: 'text', rect: { x: 18, y: 392, w: 270, h: 26 }, text: '' },
      tokenAt('t:best', 296, 390, 106, '최대 0개', 'chosen'),
    ],
  };
}

function everyOrder(): Visualization {
  const rec = new StepRecorder(tableBoard());
  let best = 0;
  let checks = 0;
  let cur: { order: number[]; fatigue: number; count: number } | undefined; // 따라가는 중인 경우
  const meta = (): Meta => ({
    work: checks,
    variables: cur
      ? { order: cur.order.map((i) => i + 1).join(', '), fatigue: cur.fatigue, count: cur.count, best }
      : { '순서 수': SIMS.length, best },
  });

  rec.step({ title: `순서 ${SIMS.length}가지 만들기`, codeHighlights: ALL_AT.make, ...meta() });
  rec.phase('순서 만들기', `던전 ${N}개를 가는 순서는 ${N}! = ${SIMS.length}가지입니다. 먼저 순서를 전부 만들어 한 줄씩 놓습니다. 줄마다 처음 피로도 ${K}에서 시작합니다.`, ALL_AT.make);
  rec.do(...together(SIMS.flatMap(({ order }, r): Action[] => [
    { type: 'add', item: { id: `s:${r}`, kind: 'token', rect: startRect(r), tone: 'plain', text: `k ${K}` } },
    ...order.map((i, c): Action => ({ type: 'add', item: { id: cid(r, c), kind: 'cell', rect: cellRect(r, c), tone: 'plain', text: nameOf(i) } })),
  ])));
  checks = 0;

  SIMS.forEach((sim, r) => {
    const prevBest = best;
    sim.trials.forEach((tr, c) => {
      const [need, cost] = DUNGEONS[tr.i];
      const [id, prev] = [cid(r, c), c ? cid(r, c - 1) : `s:${r}`];
      const lastTrial = c === sim.trials.length - 1;
      checks++;
      if (lastTrial) best = Math.max(best, sim.count);
      cur = { order: sim.order, fatigue: tr.after, count: tr.ok ? c + 1 : c };
      rec.step({
        title: `${r + 1}번째 경우 · ${nameOf(tr.i)}: ${tr.ok ? `들어감, 남은 ${tr.after}` : `못 들어감 (${tr.before} < ${need})`}${lastTrial ? ` → ${sim.count}개` : ''}`,
        codeHighlights: tr.ok ? ALL_AT.enter : ALL_AT.stop,
        ...meta(),
      });
      const state = `${nameOf(tr.i)}은 필요 ${need}, 남은 ${josa(tr.before, '이라', '라')} ${tr.ok ? '들어갈 수 있습니다.' : '들어갈 수 없습니다.'}`;
      rec.phase('확인하기', c ? `이어서 ${state}` : `${r + 1}번째 경우, ${trail(sim.order)} 순서로 처음부터 가 봅니다. ${state}`, tr.ok ? ALL_AT.enter : ALL_AT.stop);
      rec.do({ type: 'focus', ids: [prev, id, legendId(tr.i)] });
      rec.do({ type: 'arrow', from: prev, to: id, verdict: (tr.ok ? 'good' : 'bad') as Verdict, label: `${tr.before} ${sign(tr.ok)} ${need}` }, wait(150));
      if (tr.ok) {
        rec.phase('들어가기', `${nameOf(tr.i)}에 들어가 소모 피로도 ${josa(cost, '을', '를')} 쓰니 남은 피로도는 ${tr.before} − ${cost} = ${tr.after}입니다.`, ALL_AT.enter);
        rec.do(...together([...clear(), set(id, { tone: 'visited', tag: `남은 ${tr.after}` }, true), set('calc', { text: `${tr.before} − ${cost} = ${tr.after}` })]));
      } else {
        rec.phase('멈추기', `${nameOf(tr.i)}은 못 들어가니 이 경우는 여기서 끝납니다. ${sim.count}개를 클리어했습니다.`, ALL_AT.stop);
        rec.do(...together([...clear(), set(id, { tone: 'bad', tag: `필요 ${need}` }, true), set('calc', { text: `${tr.before} < ${need}: 이 경우는 여기서 끝` })]));
      }
      if (lastTrial) {
        rec.phase('기록하기', `이 경우는 ${sim.count}개로 끝났습니다. ${count2(sim.count, prevBest)}`, ALL_AT.record);
        rec.do(...together([
          { type: 'add', item: tokenAt(`res:${r}`, resultRect(r).x, resultRect(r).y, 110, `${sim.count}개 클리어`, sim.count > prevBest ? 'good' : 'plain') },
          ...sim.order.slice(sim.trials.length).map((_, u) => tone(cid(r, sim.trials.length + u), 'explored')),
        ]));
        if (sim.count > prevBest) rec.do(set('t:best', { text: `최대 ${best}개` }, true));
      }
    });
  });

  const winner = SIMS.findIndex((s) => s.count === best);
  cur = undefined;
  rec.step({ title: `최대 ${best}개`, codeHighlights: ALL_AT.done, ...meta(), answer: best, isKeyframe: true });
  rec.phase('결과', `${SIMS.length}가지 경우를 모두 따라가 최대 ${best}개를 찾았습니다. ${trail(SIMS[winner].order)} 순서입니다. 앞부분이 같은 경우도 처음부터 다시 확인해 ${checks}번을 확인했습니다. 가지치기를 쓰는 정석은 ${TRIES.length}번이면 됩니다.`, ALL_AT.done);
  rec.do(...together([
    ...SIMS[winner].order.map((_, c) => tone(cid(winner, c), 'path')),
    tone('t:best', 'path', true),
    set('calc', { text: `${trail(SIMS[winner].order)} → ${best}개 클리어` }),
  ]));
  return holdCaptions(rec.finish());
}
const count2 = (count: number, prevBest: number) =>
  count > prevBest ? `지금까지의 최대 ${prevBest}개보다 많아 ${count}개로 올립니다.` : `지금까지의 최대 ${prevBest}개를 넘지 못합니다.`;

/* ------------------------------------------------------------------ */
/* 함정: 소모 피로도 순으로 정렬 → 확인하기 → 들어가기(또는 건너뛰기) → 비교하기   */
/* ------------------------------------------------------------------ */

// 던전을 소모 피로도 순으로 한 줄에 놓고 차례로 한 번씩만 본다. 세로: 던전 28~74, 계수기 104~134, 계산 글 144~172, 답 비교 186~216.
const H_LINE = 228;
const SORTED = [...DUNGEONS.keys()].sort((a, b) => DUNGEONS[a][1] - DUNGEONS[b][1]);

function costFirst(): Visualization {
  const rec = new StepRecorder({
    width: W,
    height: H_LINE,
    items: [
      ...topItems(TITLE),
      { id: 'calc', kind: 'text', rect: { x: 18, y: 144, w: 384, h: 28 }, text: '' },
      { id: 't:k', kind: 'token', rect: { x: 18, y: 104, w: 150, h: 34 }, tone: 'chosen', text: `남은 피로도 ${K}` },
      tokenAt('t:count', 176, 104, 110, '클리어 0개', 'plain'),
    ],
  });
  let k = K;
  let count = 0;
  let checks = 0;
  let seen: number | undefined; // 방금 본 던전
  const meta = (): Meta => ({
    work: checks,
    variables: { k, count, need: seen === undefined ? '-' : DUNGEONS[seen][0], cost: seen === undefined ? '-' : DUNGEONS[seen][1] },
  });

  rec.step({ title: '소모 피로도 순으로 정렬', codeHighlights: GR_AT.sort, ...meta() });
  rec.phase('정렬하기', `소모 피로도가 적은 던전부터 가면 피로도를 아껴 더 많이 갈 수 있을 것 같습니다. 소모 피로도 ${SORTED.map((i) => DUNGEONS[i][1]).join(', ')} 순으로 ${SORTED.map(nameOf).join(', ')}을 늘어놓습니다.`, GR_AT.sort);
  rec.do(...together([
    ...SORTED.map((d, slot): Action => set(legendId(d), { rect: legendRect(slot) })),
    set('title', { text: `소모 피로도가 적은 순 · 처음 피로도 k = ${K}` }),
  ]));

  SORTED.forEach((d, slot) => {
    const [need, cost] = DUNGEONS[d];
    const ok = k >= need;
    const before = k;
    checks++;
    seen = d;
    if (ok) {
      k -= cost;
      count++;
    }
    rec.step({ title: ok ? `${nameOf(d)}: 들어감, 남은 ${k}` : `${nameOf(d)}: 못 들어가 건너뜀 (${before} < ${need})`, codeHighlights: ok ? GR_AT.enter : GR_AT.skip, ...meta() });
    rec.phase('확인하기', ok
      ? `${slot + 1}번째로 ${nameOf(d)}을 봅니다. 필요 피로도 ${need}, 남은 피로도 ${josa(before, '이라', '라')} 들어갈 수 있습니다.`
      : `${slot + 1}번째로 ${nameOf(d)}을 봅니다. 필요 피로도는 ${need}인데 남은 피로도는 ${before}뿐이라 들어갈 수 없습니다.`, GR_AT.check);
    rec.do({ type: 'focus', ids: [legendId(d)] });
    rec.do({ type: 'arrow', from: 't:k', to: legendId(d), verdict: (ok ? 'good' : 'bad') as Verdict, label: `${before} ${sign(ok)} ${need}` }, wait(250));
    if (ok) {
      rec.phase('들어가기', `${nameOf(d)}에 들어가 소모 피로도 ${josa(cost, '을', '를')} 쓰니 남은 피로도는 ${before} − ${cost} = ${k}입니다. 클리어한 던전은 ${count}개입니다.`, GR_AT.enter);
      rec.do(...clear());
      rec.do(...together([tone(legendId(d), 'visited'), set('t:k', { text: `남은 피로도 ${k}` }, true), set('calc', { text: `${before} − ${cost} = ${k}` })]));
      rec.do(set('t:count', { text: `클리어 ${count}개` }, true));
    } else {
      rec.phase('건너뛰기', `${nameOf(d)}은 못 들어가니 건너뛰고 다음 던전으로 갑니다. 이미 지나쳤기 때문에 나중에 돌아와 다시 시도하지 않습니다.`, GR_AT.skip);
      rec.do(...clear());
      rec.do(...together([tone(legendId(d), 'explored'), set('calc', { text: `${before} < ${need}: 건너뜀` })]));
    }
  });

  seen = undefined;
  rec.step({ title: `${count}개 — 정답은 ${BEST_COUNT}개`, codeHighlights: GR_AT.done, ...meta(), answer: count, isKeyframe: true });
  rec.phase('비교하기', `${count}개를 돌려줍니다. 하지만 ${trail(BEST_PATH)} 순서로 가면 ${BEST_COUNT}개를 모두 클리어할 수 있습니다. 소모가 적은 ${nameOf(SORTED[0])}을 먼저 가면 남은 피로도가 ${josa(kAt([SORTED[0]]), '이', '가')} 되어 필요 ${DUNGEONS[0][0]}인 ${nameOf(0)}에 못 들어갑니다. 필요 피로도가 큰 던전은 피로도가 많을 때 먼저 가야 합니다.`, GR_AT.done);
  rec.do(...together([tone('t:count', 'bad', true), set('calc', { text: `내 답 ${count}개 ≠ 정답 ${BEST_COUNT}개` })]));
  rec.do({ type: 'add', item: tokenAt('t:mine', 18, 186, 110, `내 답 ${count}개`, 'bad') });
  rec.do({ type: 'add', item: tokenAt('t:truth', 136, 186, 266, `정답 ${BEST_COUNT}개 (${trail(BEST_PATH)})`, 'good') });
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'fatigue',
  title: '피로도',
  level: 2,
  category: 'brute-force',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/87946',
  description: {
    summary:
      '하루에 던전을 여러 곳 돌 수 있는 게임입니다. 던전마다 들어가려면 지금 피로도가 "최소 필요 피로도" 이상이어야 하고, 한 번 클리어할 때마다 "소모 피로도"만큼 피로도가 줄어듭니다. 처음 피로도 k가 주어질 때, 던전을 도는 순서를 잘 골라 하루에 클리어할 수 있는 던전의 최대 개수를 구합니다. 같은 던전은 한 번만 돌 수 있습니다.',
    rules: [
      'k는 1 이상 5,000 이하의 자연수',
      '던전은 1개 이상 8개 이하이고, 각 던전은 [최소 필요 피로도, 소모 피로도]로 주어짐',
      '최소 필요 피로도는 소모 피로도보다 크거나 같고, 둘 다 1 이상 1,000 이하의 자연수',
      '[최소 필요 피로도, 소모 피로도]가 같은 던전이 여러 개 있을 수 있음',
    ],
    examples: [{ input: 'k = 80, dungeons = [[80,20],[50,40],[30,10]]', output: '3' }],
  },
  keyIntuitions: [
    '던전이 최대 8개라 가는 순서는 8! = 40,320가지뿐입니다. 순서를 전부 살펴도 충분히 빠르니 완전탐색 문제입니다.',
    '같은 던전을 두 번 돌 수 없으니 순열입니다. 던전을 하나 고를 때마다 피로도가 줄어드는데, 못 들어가는 던전을 고른 순간 그 뒤로 이어질 순서는 볼 필요가 없습니다(가지치기).',
    '소모가 적은 순이나 필요가 큰 순처럼 한 가지 기준으로 정렬해 가면 안 됩니다. 순서에 따라 들어갈 수 있는 던전이 달라지므로 모든 순서를 시도해야 합니다.',
  ],
  demo: { input: [K, DUNGEONS], label: 'k = 80, dungeons = [[80,20],[50,40],[30,10]]' },
  workUnit: '던전에 들어갈 수 있는지 확인한 횟수',
  approaches: [
    {
      id: 'fatigue-backtracking',
      name: '순열 백트래킹 (DFS + 가지치기)',
      rank: 'BEST',
      timeComplexity: 'O(N × N!)',
      spaceComplexity: 'O(N)',
      verdict: '던전을 하나씩 골라 들어가 보고, 못 들어가는 던전을 고르면 그 가지를 바로 쳐내며 가장 많이 도는 순서를 찾습니다.',
      pros: [
        '못 들어가는 던전에서 바로 되돌아가 필요 없는 순서를 만들지 않습니다.',
        '순서를 따로 저장하지 않고 재귀 하나로 전부 훑어 코드가 짧습니다.',
        '던전이 8개여도 가능한 순서가 40,320가지라 충분히 빠릅니다.',
      ],
      cons: [
        'visited 표시를 하고 되돌려 놓는 줄을 빠뜨리기 쉽습니다.',
        '모든 던전에 들어갈 수 있는 입력이면 쳐낼 가지가 없어 순서 전부를 보게 됩니다.',
      ],
      whyThisRank: '순서가 결과를 바꾸고 던전이 8개 이하라, 순서를 모두 살피되 막힌 가지는 일찍 버리는 백트래킹이 가장 자연스럽습니다. 같은 앞부분을 다시 계산하지도 않습니다.',
      code: BEST,
      visualize: backtracking,
    },
    {
      id: 'fatigue-permutations',
      name: '모든 순서를 만든 뒤 하나씩 시뮬레이션',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × N!)',
      spaceComplexity: 'O(N × N!)',
      verdict: '던전 순서를 전부 만들어 두고, 순서마다 처음부터 피로도를 깎아 가며 몇 개를 도는지 셉니다.',
      pros: [
        '순서 만들기와 확인을 나눠서 코드를 이해하기 쉽습니다.',
        '파이썬에서는 itertools.permutations 한 줄로 순서를 만들 수 있습니다.',
      ],
      cons: [
        '못 들어가는 던전이 앞에 있어도 그 뒤 순서까지 전부 만들고 따라갑니다.',
        '앞부분이 같은 순서를 처음부터 다시 시뮬레이션해 같은 계산을 되풀이합니다.',
        'JavaScript로는 순서를 배열에 모두 담아야 해서 메모리를 더 씁니다.',
      ],
      whyThisRank: `답은 정석과 같지만 쳐낼 수 있는 가지를 끝까지 따라갑니다. 이 입력에서 정석은 ${TRIES.length}번이면 되는데 이 풀이는 ${SIM_CHECKS}번을 확인합니다. 던전이 많아질수록 차이가 벌어집니다.`,
      code: ALL,
      visualize: everyOrder,
    },
    {
      id: 'fatigue-cheapest-first',
      name: '소모 피로도가 적은 던전부터 가기 (그리디)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '소모가 적은 던전부터 가면 많이 돌 것 같지만, 필요 피로도를 놓쳐 더 적게 돌게 되는 오답 풀이입니다.',
      pros: ['정렬 한 번에 끝나서 코드가 짧고 빠릅니다.', '던전의 필요 피로도와 소모 피로도가 거의 같은 입력에서는 우연히 맞습니다.'],
      cons: [
        '예제에서 3번(소모 10)을 먼저 가면 남은 피로도가 70이 되어 필요 피로도 80인 1번에 못 들어가고, 2개에 그칩니다. 정답은 3개입니다.',
        '순서가 결과를 바꾸는 문제라서 한 가지 기준의 정렬로는 최선을 보장하지 못합니다.',
      ],
      whyThisRank: '던전을 도는 순서에 따라 들어갈 수 있는 던전이 달라집니다. 필요 피로도가 큰 던전은 피로도가 많이 남았을 때 먼저 가야 하는데, 소모만 보면 이를 놓칩니다. 가능한 순서를 모두 살펴야 합니다.',
      code: GREEDY,
      visualize: costFirst,
    },
  ],
  checks: {
    cases: [
      { args: [80, [[80, 20], [50, 40], [30, 10]]], expected: 3 },
      { args: [1, [[2, 1]]], expected: 0 },
      { args: [10, [[5, 5], [5, 5]]], expected: 2 },
      { args: [10, [[10, 10], [10, 1]]], expected: 1 },
      { args: [30, [[30, 30], [20, 5], [20, 5]]], expected: 2 },
      { args: [500, Array.from({ length: 8 }, () => [100, 10])], expected: 8 },
      { args: [K, DUNGEONS], expected: 3 },
    ],
    // 던전 1~6개, 필요 피로도 1~40, 소모 피로도 1~필요 피로도
    random: (rand) => {
      const count = 1 + Math.floor(rand() * 6);
      const dungeons = Array.from({ length: count }, () => {
        const need = 1 + Math.floor(rand() * 40);
        return [need, 1 + Math.floor(rand() * need)];
      });
      return [1 + Math.floor(rand() * 100), dungeons];
    },
  },
};

export default problem;
