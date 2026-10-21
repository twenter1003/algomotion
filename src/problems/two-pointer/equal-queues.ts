// 두 큐 합 같게 만들기: 정석 큰 쪽에서 옮기기(연결 배열 + 투 포인터, 상한 3N), 대안 누적합 + 끝점 이분 탐색, 함정 탐색 상한을 2N으로 잡아 -1을 반환하는 풀이를 비교한다.
import { grid } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

// 시각화 입력: n = 4인데 정답이 9회(2n + 1회)여서 상한을 2n = 8로 잡으면 오답(-1)이 나오는 대표 반례
const Q1 = [1, 1, 1, 1];
const Q2 = [1, 1, 7, 1];
const N = Q1.length;
const ARR = [...Q1, ...Q2];
const M = ARR.length;
const TOTAL = ARR.reduce((a, b) => a + b, 0);
const TARGET = TOTAL / 2;
const PREFIX = [0, ...ARR.map((_, i) => ARR.slice(0, i + 1).reduce((a, b) => a + b, 0))];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TWO_POINTER = {
  python: `def solution(queue1, queue2):
    total = sum(queue1) + sum(queue2)
    if total % 2 != 0:
        return -1
    target = total // 2
    n = len(queue1)
    arr = queue1 + queue2
    i, j = 0, n
    sum1 = sum(queue1)
    for moves in range(3 * n):                # 최대 3N번 안에 반드시 판정 가능
        if sum1 == target:
            return moves
        if sum1 < target:
            sum1 += arr[j % (2 * n)]          # 큐2에서 꺼내 큐1에 추가
            j += 1
        else:
            sum1 -= arr[i % (2 * n)]          # 큐1에서 꺼내 큐2에 추가
            i += 1
    return -1`,
  javascript: `function solution(queue1, queue2) {
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  const total = sum(queue1) + sum(queue2);
  if (total % 2 !== 0) return -1;
  const target = total / 2;
  const n = queue1.length;
  const arr = [...queue1, ...queue2];
  let i = 0, j = n, sum1 = sum(queue1);
  for (let moves = 0; moves < 3 * n; moves++) { // 최대 3N번 안에 반드시 판정 가능
    if (sum1 === target) return moves;
    if (sum1 < target) {
      sum1 += arr[j % (2 * n)]; // 큐2에서 꺼내 큐1에 추가
      j += 1;
    } else {
      sum1 -= arr[i % (2 * n)]; // 큐1에서 꺼내 큐2에 추가
      i += 1;
    }
  }
  return -1;
}`,
};
const TP_AT = {
  init: lines(TWO_POINTER, ['target = total // 2', 'arr = queue1 + queue2', 'i, j = 0, n'], ['const target = total / 2', 'const arr = [...queue1, ...queue2]', 'let i = 0, j = n']),
  check: lines(TWO_POINTER, ['for moves in range(3 * n)', 'if sum1 == target'], ['for (let moves = 0; moves < 3 * n; moves++)', 'if (sum1 === target) return moves']),
  fromQ2: lines(TWO_POINTER, ['if sum1 < target:', 'sum1 += arr[j % (2 * n)]', 'j += 1'], ['if (sum1 < target)', 'sum1 += arr[j % (2 * n)]', 'j += 1']),
  fromQ1: lines(TWO_POINTER, ['sum1 -= arr[i % (2 * n)]', 'i += 1'], ['sum1 -= arr[i % (2 * n)]', 'i += 1']),
  done: lines(TWO_POINTER, ['if sum1 == target:', 'return moves'], ['if (sum1 === target) return moves']),
};

const BIN_SEARCH = {
  python: `from bisect import bisect_left

def solution(queue1, queue2):
    total = sum(queue1) + sum(queue2)
    if total % 2 != 0:
        return -1
    target = total // 2
    n = len(queue1)
    arr = queue1 + queue2
    prefix = [0] * (2 * n + 1)
    for k in range(2 * n):
        prefix[k + 1] = prefix[k] + arr[k]
    best = None
    for l in range(2 * n):
        idx = bisect_left(prefix, prefix[l] + target, l + 1, 2 * n + 1)
        if idx <= 2 * n and prefix[idx] == prefix[l] + target:
            r = idx - 1
            if r < n - 1:
                moves = l + (r + 1) + n
            elif r == n - 1:
                moves = l
            elif r == 2 * n - 1 and l >= n:
                moves = l - n
            else:
                moves = l + (r + 1 - n)
            if best is None or moves < best:
                best = moves
    return -1 if best is None else best`,
  javascript: `function solution(queue1, queue2) {
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  const total = sum(queue1) + sum(queue2);
  if (total % 2 !== 0) return -1;
  const target = total / 2;
  const n = queue1.length;
  const arr = [...queue1, ...queue2];
  const prefix = new Array(2 * n + 1).fill(0);
  for (let k = 0; k < 2 * n; k++) prefix[k + 1] = prefix[k] + arr[k];
  let best = Infinity;
  for (let l = 0; l < 2 * n; l++) {
    const want = prefix[l] + target;
    let lo = l + 1, hi = 2 * n + 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (prefix[mid] < want) lo = mid + 1;
      else hi = mid;
    }
    if (lo <= 2 * n && prefix[lo] === want) {
      const r = lo - 1;
      let moves;
      if (r < n - 1) moves = l + (r + 1) + n;
      else if (r === n - 1) moves = l;
      else if (r === 2 * n - 1 && l >= n) moves = l - n;
      else moves = l + (r + 1 - n);
      if (moves < best) best = moves;
    }
  }
  return best === Infinity ? -1 : best;
}`,
};
const BS_AT = {
  init: lines(BIN_SEARCH, ['prefix = [0] * (2 * n + 1)', 'prefix[k + 1] = prefix[k] + arr[k]'], ['const prefix = new Array(2 * n + 1)', 'for (let k = 0; k < 2 * n; k++) prefix[k + 1]']),
  search: lines(BIN_SEARCH, ['for l in range(2 * n)', 'idx = bisect_left(prefix, prefix[l] + target'], ['for (let l = 0; l < 2 * n; l++)', 'while (lo < hi)']),
  hit: lines(BIN_SEARCH, ['if idx <= 2 * n and prefix[idx] == prefix[l] + target', 'if best is None or moves < best', 'best = moves'], ['if (lo <= 2 * n && prefix[lo] === want)', 'if (moves < best) best = moves']),
  done: lines(BIN_SEARCH, ['return -1 if best is None else best'], ['return best === Infinity ? -1 : best']),
};

const LIMIT_TRAP = {
  python: `# 주의: 상한을 2 * n으로 잡으면 한쪽 큐의 끝 원소만 남기는 경우(최대 3n - 3회)를 놓칩니다
def solution(queue1, queue2):
    total = sum(queue1) + sum(queue2)
    if total % 2 != 0:
        return -1
    target = total // 2
    n = len(queue1)
    arr = queue1 + queue2
    i, j = 0, n
    sum1 = sum(queue1)
    for moves in range(2 * n):                # 2 * n번까지만 확인 (너무 일찍 포기!)
        if sum1 == target:
            return moves
        if sum1 < target:
            sum1 += arr[j % (2 * n)]
            j += 1
        else:
            sum1 -= arr[i % (2 * n)]
            i += 1
    return -1`,
  javascript: `// 주의: 상한을 2 * n으로 잡으면 한쪽 큐의 끝 원소만 남기는 경우(최대 3n - 3회)를 놓칩니다
function solution(queue1, queue2) {
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  const total = sum(queue1) + sum(queue2);
  if (total % 2 !== 0) return -1;
  const target = total / 2;
  const n = queue1.length;
  const arr = [...queue1, ...queue2];
  let i = 0, j = n, sum1 = sum(queue1);
  for (let moves = 0; moves < 2 * n; moves++) { // 2 * n번까지만 확인 (너무 일찍 포기!)
    if (sum1 === target) return moves;
    if (sum1 < target) {
      sum1 += arr[j % (2 * n)];
      j += 1;
    } else {
      sum1 -= arr[i % (2 * n)];
      i += 1;
    }
  }
  return -1;
}`,
};
const LT_AT = {
  init: lines(LIMIT_TRAP, ['target = total // 2', 'i, j = 0, n', 'sum1 = sum(queue1)'], ['const target = total / 2', 'let i = 0, j = n, sum1 = sum(queue1)']),
  loop: lines(LIMIT_TRAP, ['for moves in range(2 * n)', 'if sum1 == target'], ['for (let moves = 0; moves < 2 * n; moves++)', 'if (sum1 === target) return moves']),
  fromQ2: lines(LIMIT_TRAP, ['if sum1 < target:', 'sum1 += arr[j % (2 * n)]', 'j += 1'], ['if (sum1 < target)', 'sum1 += arr[j % (2 * n)]', 'j += 1']),
  fromQ1: lines(LIMIT_TRAP, ['sum1 -= arr[i % (2 * n)]', 'i += 1'], ['sum1 -= arr[i % (2 * n)]', 'i += 1']),
  fail: lines(LIMIT_TRAP, ['return -1'], ['return -1']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 560;
const H = 248;
const cellAt = grid({ x: 68, y: 34, rows: 1, cols: M, cell: 54, gap: 6 });
const cId = (k: number) => `c:${k}`;
const ptrRect = (row: 0 | 1, idx: number): Rect => ({
  x: cellAt(0, idx % M).x + 5,
  y: row === 0 ? 98 : 124,
  w: 44,
  h: 22,
});
const winRect = (l: number, rInclusive: number): Rect => {
  const a = cellAt(0, Math.min(Math.max(l, 0), M - 1));
  const b = cellAt(0, Math.min(Math.max(rInclusive, 0), M - 1));
  const leftX = Math.min(a.x, b.x);
  const rightX = Math.max(a.x + a.w, b.x + b.w);
  return { x: leftX - 3, y: a.y - 3, w: rightX - leftX + 6, h: a.h + 6 };
};
const TOKENS: Rect[] = [
  { x: 68, y: 160, w: 146, h: 36 },
  { x: 224, y: 160, w: 146, h: 36 },
  { x: 380, y: 160, w: 162, h: 36 },
];
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });

const MS_PER_CHAR = 20;
const MIN_STEP = 2000;
const busy = (p: { start: number; actions: { start: number; duration: number }[] }) =>
  Math.max(0, ...p.actions.map((a) => a.start + a.duration - p.start));
const paced = (viz: Visualization): Visualization => {
  for (const step of viz.steps) {
    const { phases } = planStep(step);
    phases.forEach((p, i) => {
      const tail = i < phases.length - 1 ? PHASE_GAP : step.isKeyframe ? KEYFRAME_TAIL : STEP_TAIL;
      const want = [...step.phases[i].caption].length * MS_PER_CHAR - tail;
      if (p.end - p.start < want) step.phases[i].actions.push(wait(Math.ceil(want - busy(p))));
    });
    const plan = planStep(step);
    const last = plan.phases.at(-1)!;
    const short = MIN_STEP - plan.total;
    if (short > 0) step.phases.at(-1)!.actions.push(wait(last.end - last.start + short - busy(last)));
  }
  return viz;
};

function board(row0: string, row1: string): Scene {
  const items: Item[] = [
    { id: 'lab:arr', kind: 'text', rect: { x: 0, y: 34, w: 62, h: 54 }, tone: 'muted', text: 'Q1+Q2' },
    { id: 'lab:p0', kind: 'text', rect: { x: 0, y: 98, w: 62, h: 22 }, tone: 'muted', text: row0 },
    { id: 'lab:p1', kind: 'text', rect: { x: 0, y: 124, w: 62, h: 22 }, tone: 'muted', text: row1 },
    { id: 'win', kind: 'zone', rect: winRect(0, N - 1), tone: 'explored' },
    { id: 'tok:q1', kind: 'token', rect: TOKENS[0], tone: 'chosen', text: '큐1 합 4' },
    { id: 'tok:q2', kind: 'token', rect: TOKENS[1], tone: 'plain', text: '큐2 합 10' },
    { id: 'tok:ans', kind: 'token', rect: TOKENS[2], tone: 'plain', text: `목표 합 ${TARGET}` },
    { id: 'calc', kind: 'text', rect: { x: 68, y: 208, w: 474, h: 28 }, text: '' },
  ];
  ARR.forEach((v, k) =>
    items.push({
      id: cId(k),
      kind: 'cell',
      rect: cellAt(0, k),
      tone: k < N ? 'current' : 'plain',
      text: String(v),
      sub: k < N ? `Q1[${k}]` : `Q2[${k - N}]`,
    }),
  );
  return { width: W, height: H, items };
}

const movePtr = (rec: StepRecorder, id: 'i' | 'j', row: 0 | 1, idx: number, text: string): Action => {
  const rect = ptrRect(row, idx);
  const fullId = `ptr:${id}`;
  return rec.has(fullId)
    ? { type: 'set', id: fullId, patch: { rect, text } }
    : { type: 'add', item: { id: fullId, kind: 'token', rect, tone: 'chosen', text } };
};

const paintQ1Range = (i: number, j: number, activeTone: Tone): Action[] =>
  ARR.map((_, k): Action => ({
    type: 'set',
    id: cId(k),
    patch: { tone: k >= i && k < j ? activeTone : k < i ? 'visited' : 'plain' },
  }));

/* ------------------------------------------------------------------ */
/* 정석: 큰 쪽에서 옮기기 (연결 배열 + 투 포인터)                          */
/* ------------------------------------------------------------------ */

function twoPointer(): Visualization {
  const rec = new StepRecorder(board('i (큐1 앞)', 'j (큐2 앞)'));
  let [i, j, sum1, moves, comps] = [0, N, 4, 0, 0];
  const meta = () => ({ work: comps, variables: { i, j, sum1, sum2: TOTAL - sum1, moves } });

  rec.step({ title: `초기화: Q1 합 = 4, Q2 합 = 10, 목표 합 = ${TARGET}`, codeHighlights: TP_AT.init, ...meta() });
  rec.phase(
    '이어 붙이기',
    `Q1과 Q2를 이어 붙인 배열 arr에서 큐1은 구간 [i=${i}, j=${j})에 해당합니다. 전체 합은 ${TOTAL}이므로 목표 합은 ${TARGET}입니다.`,
    TP_AT.init,
  );
  rec.do(...together([
    movePtr(rec, 'i', 0, i, `i=${i}`),
    movePtr(rec, 'j', 1, j, `j=${j}`),
    calcTo(`초기 Q1 합 = 4, Q2 합 = 10 (목표 ${TARGET})`),
  ]));

  while (sum1 !== TARGET && moves < 3 * N) {
    const [wasI, wasJ, wasSum1] = [i, j, sum1];
    const fromQ2 = wasSum1 < TARGET;
    const movedIdx = (fromQ2 ? wasJ : wasI) % M;
    const val = ARR[movedIdx];
    if (fromQ2) {
      sum1 += val;
      j += 1;
    } else {
      sum1 -= val;
      i += 1;
    }
    moves += 1;
    comps += 1;
    const sum2 = TOTAL - sum1;
    const matched = sum1 === TARGET;

    rec.step({
      title: `${moves}회: ${fromQ2 ? `Q2→Q1 (${val})` : `Q1→Q2 (${val})`} → Q1 합 ${sum1}`,
      codeHighlights: fromQ2 ? TP_AT.fromQ2 : TP_AT.fromQ1,
      ...meta(),
    });

    rec.phase(
      '합 비교',
      fromQ2
        ? `큐1의 합(${wasSum1})이 목표(${TARGET})보다 작으므로 합이 더 큰 큐2에서 원소 ${josa(val, '을', '를')} 가져옵니다.`
        : `큐1의 합(${wasSum1})이 목표(${TARGET})보다 크므로 큐1의 맨 앞 원소 ${josa(val, '을', '를')} 큐2로 보냅니다.`,
      TP_AT.check,
    );
    rec.do(
      { type: 'focus', ids: [cId(movedIdx)] },
      { type: 'arrow', from: cId(movedIdx), to: fromQ2 ? 'tok:q1' : 'tok:q2', verdict: matched ? 'good' : 'new', label: fromQ2 ? `+${val} (Q2→Q1)` : `-${val} (Q1→Q2)` },
    );

    rec.phase(
      '포인터 이동',
      matched
        ? `${fromQ2 ? `j를 ${ro(j)}` : `i를 ${ro(i)}`} 옮기자 큐1 합 = ${sum1}, 큐2 합 = ${sum2}로 같아졌습니다!`
        : `${fromQ2 ? `j를 ${ro(j)}` : `i를 ${ro(i)}`} 옮겨 큐1 구간이 [${i}, ${j})가 되었습니다 (합 ${sum1}).`,
      fromQ2 ? TP_AT.fromQ2 : TP_AT.fromQ1,
    );
    rec.do(...clear());
    rec.do(...together([
      movePtr(rec, 'i', 0, i, `i=${i}`),
      movePtr(rec, 'j', 1, j, `j=${j}`),
      { type: 'set', id: 'win', patch: { rect: winRect(i, j - 1), tone: matched ? 'path' : 'explored' } },
      ...paintQ1Range(i, j, matched ? 'path' : 'current'),
      { type: 'set', id: 'tok:q1', patch: { text: `큐1 합 ${sum1}`, tone: matched ? 'good' : 'chosen' }, pop: true },
      { type: 'set', id: 'tok:q2', patch: { text: `큐2 합 ${sum2}`, tone: matched ? 'good' : 'plain' }, pop: true },
      { type: 'set', id: 'tok:ans', patch: { text: `이동 ${moves}회`, tone: matched ? 'good' : 'plain' }, pop: true },
      calcTo(`구간 [${i}, ${j}): Q1 합 = ${sum1}, Q2 합 = ${sum2}`),
    ]));
  }

  rec.step({
    title: `정답: 최소 ${moves}회 이동으로 두 큐 합이 ${TARGET}`,
    codeHighlights: TP_AT.done,
    ...meta(),
    answer: moves,
    isKeyframe: true,
  });
  rec.phase(
    '정답',
    `Q2에 있던 7 하나만 Q1에 남기고 나머지 원소를 모두 Q2로 보내어 총 ${moves}번 만에 두 큐의 합을 ${ro(TARGET)} 맞췄습니다.`,
    TP_AT.done,
  );
  rec.do(...together([
    { type: 'set', id: 'tok:ans', patch: { text: `정답 ${moves}회`, tone: 'path' }, pop: true },
    calcTo(`최소 작업 횟수 = ${moves}회 (2N = 8보다 1회 더 필요)`),
  ]));

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 누적합 + 끝점 이분 탐색                                          */
/* ------------------------------------------------------------------ */

function binarySearch(): Visualization {
  const rec = new StepRecorder(board('구간 시작 l', '구간 끝 r'));
  let comps = 0;
  let best = Infinity;
  let curL: number | string = '-';
  let curR: number | string = '-';
  const fmtBest = () => (best === Infinity ? '-' : best);
  const meta = () => ({ work: comps, variables: { l: curL, r: curR, target: TARGET, best: fmtBest() } });

  rec.step({ title: `누적합 배열 준비: P = [${PREFIX.join(', ')}]`, codeHighlights: BS_AT.init, ...meta() });
  rec.phase(
    '누적합 계산',
    `연결 배열 arr의 누적합 P를 구합니다. 합이 ${TARGET}인 연속 구간 [l, r]을 이분 탐색으로 찾아 최소 이동 횟수를 계산합니다.`,
    BS_AT.init,
  );
  rec.do(...together([
    ...ARR.map((_, k): Action => ({ type: 'set', id: cId(k), patch: { sub: `P=${PREFIX[k + 1]}` } })),
    calcTo(`P = [${PREFIX.join(', ')}]`),
  ]));

  for (let l = 0; l < M; l++) {
    const want = PREFIX[l] + TARGET;
    let lo = l + 1;
    let hi = M + 1;
    let stepsHere = 0;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      stepsHere += 1;
      comps += 1;
      if (PREFIX[mid] < want) lo = mid + 1;
      else hi = mid;
    }
    const hit = lo <= M && PREFIX[lo] === want;
    const r = hit ? lo - 1 : Math.min(lo - 1, M - 1);
    let movesHere = -1;
    if (hit) {
      if (r < N - 1) movesHere = l + (r + 1) + N;
      else if (r === N - 1) movesHere = l;
      else if (r === M - 1 && l >= N) movesHere = l - N;
      else movesHere = l + (r + 1 - N);
      if (movesHere < best) best = movesHere;
    }
    curL = l;
    curR = r;
    const subSum = PREFIX[r + 1] - PREFIX[l];

    rec.step({
      title: `시작 l = ${l}: 이분 탐색 ${stepsHere}번 비교 → ${hit ? `구간 [${l}, ${r}] (${movesHere}회)` : '합 7 없음'}`,
      codeHighlights: hit ? BS_AT.hit : BS_AT.search,
      ...meta(),
    });
    rec.phase(
      '이분 탐색',
      `l = ${l}에서 P[r+1] = ${PREFIX[l]} + ${TARGET} = ${josa(want, '을', '를')} 이분 탐색으로 찾습니다(${stepsHere}번 비교).`,
      BS_AT.search,
    );
    rec.do(...together([
      movePtr(rec, 'i', 0, l, `l=${l}`),
      movePtr(rec, 'j', 1, r, `r=${r}`),
      { type: 'set', id: 'win', patch: { rect: winRect(l, r) } },
      ...paintQ1Range(l, r + 1, hit ? 'good' : 'current'),
      { type: 'set', id: 'tok:q1', patch: { text: `구간 합 ${subSum}`, tone: hit ? 'good' : 'chosen' }, pop: true },
      calcTo(`l = ${l}에서 끝점 이분 탐색 → r = ${r} (구간 합 ${subSum})`),
    ]));

    rec.phase(
      '이동 횟수 계산',
      hit
        ? `구간 [${l}, ${r}]의 합이 ${TARGET}입니다! 이 구간만 남기는 이동 횟수는 ${movesHere}회이며 최솟값은 ${best}회입니다.`
        : `합이 정확히 ${TARGET}이 되는 끝점이 없어 다음 시작점으로 넘어갑니다.`,
      hit ? BS_AT.hit : BS_AT.search,
    );
    rec.do(
      { type: 'focus', ids: [cId(l), cId(r)] },
      { type: 'arrow', from: cId(l), to: cId(r), verdict: hit ? 'good' : 'bad', label: hit ? `합 ${TARGET} (${movesHere}회)` : `합 ${subSum} ≠ ${TARGET}` },
      ...(hit ? [{ type: 'set', id: 'tok:ans', patch: { text: `최소 ${best}회`, tone: 'good' }, pop: true } as Action] : []),
      wait(100),
      ...clear(),
    );
  }

  rec.step({
    title: `정답: ${best}회 (이분 탐색 비교 ${comps}번)`,
    codeHighlights: BS_AT.done,
    ...meta(),
    answer: best,
    isKeyframe: true,
  });
  rec.phase(
    '정답',
    `정석과 같이 ${best}회를 구했지만, 이분 탐색으로 ${comps}번(정석은 9번) 비교했고 구간 위치별 이동 횟수 공식을 따로 나누어 계산해야 합니다.`,
    BS_AT.done,
  );
  rec.do(...together([
    { type: 'set', id: 'win', patch: { rect: winRect(6, 6), tone: 'path' } },
    ...paintQ1Range(6, 7, 'path'),
    { type: 'set', id: 'tok:ans', patch: { text: `정답 ${best}회`, tone: 'path' }, pop: true },
    calcTo(`정답 ${best}회 (비교 ${comps}번 vs 정석 9번)`),
  ]));

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: 탐색 상한을 2N으로 잡기 (오답)                                    */
/* ------------------------------------------------------------------ */

function limitTrap(): Visualization {
  const rec = new StepRecorder(board('i (큐1 앞)', 'j (큐2 앞)'));
  let [i, j, sum1, moves, comps] = [0, N, 4, 0, 0];
  const limit = 2 * N;
  const meta = () => ({ work: comps, variables: { i, j, sum1, moves, limit } });

  rec.step({ title: `초기화: 반복 상한을 2N = ${limit}회로 설정`, codeHighlights: LT_AT.init, ...meta() });
  rec.phase(
    '시작',
    `두 큐의 길이가 각각 N = ${N}이니 2N = ${limit}번만 옮겨 보면 충분하다고 생각하기 쉽습니다. 상한을 ${limit}번으로 두고 실행해 봅니다.`,
    LT_AT.init,
  );
  rec.do(...together([
    movePtr(rec, 'i', 0, i, `i=${i}`),
    movePtr(rec, 'j', 1, j, `j=${j}`),
    { type: 'set', id: 'tok:ans', patch: { text: `상한 2N = ${limit}회` } },
    calcTo(`상한 2N = ${limit}회까지 탐색`),
  ]));

  while (moves < limit) {
    const [wasI, wasJ, wasSum1] = [i, j, sum1];
    const fromQ2 = wasSum1 < TARGET;
    const movedIdx = (fromQ2 ? wasJ : wasI) % M;
    const val = ARR[movedIdx];
    if (fromQ2) {
      sum1 += val;
      j += 1;
    } else {
      sum1 -= val;
      i += 1;
    }
    moves += 1;
    comps += 1;
    const sum2 = TOTAL - sum1;

    rec.step({
      title: `${moves}/${limit}회: ${fromQ2 ? `Q2→Q1 (${val})` : `Q1→Q2 (${val})`} → Q1 합 ${sum1}`,
      codeHighlights: fromQ2 ? LT_AT.fromQ2 : LT_AT.fromQ1,
      ...meta(),
    });
    rec.phase(
      '합 비교',
      fromQ2
        ? `큐1 합(${wasSum1}) < ${TARGET}이므로 큐2에서 ${josa(val, '을', '를')} 가져옵니다.`
        : `큐1 합(${wasSum1}) > ${TARGET}이므로 큐1에서 ${josa(val, '을', '를')} 빼냅니다.`,
      LT_AT.loop,
    );
    rec.do(
      { type: 'focus', ids: [cId(movedIdx)] },
      { type: 'arrow', from: cId(movedIdx), to: fromQ2 ? 'tok:q1' : 'tok:q2', verdict: 'new', label: fromQ2 ? `+${val}` : `-${val}` },
    );

    rec.phase(
      '포인터 이동',
      `${moves}회 이동 후 큐1 합은 ${sum1}, 큐2 합은 ${sum2}입니다.`,
      fromQ2 ? LT_AT.fromQ2 : LT_AT.fromQ1,
    );
    rec.do(...clear());
    rec.do(...together([
      movePtr(rec, 'i', 0, i, `i=${i}`),
      movePtr(rec, 'j', 1, j, `j=${j}`),
      { type: 'set', id: 'win', patch: { rect: winRect(i, j - 1) } },
      ...paintQ1Range(i, j, 'current'),
      { type: 'set', id: 'tok:q1', patch: { text: `큐1 합 ${sum1}` }, pop: true },
      { type: 'set', id: 'tok:q2', patch: { text: `큐2 합 ${sum2}` }, pop: true },
      { type: 'set', id: 'tok:ans', patch: { text: `${moves}/${limit}회 진행` }, pop: true },
      calcTo(`구간 [${i}, ${j}): Q1 합 = ${sum1} (목표 ${TARGET}까지 1회 남음)`),
    ]));
  }

  rec.step({
    title: `오답: ${limit}회에서 포기해 -1 반환 — 실제로는 1회만 더 하면 정답 9회!`,
    codeHighlights: LT_AT.fail,
    ...meta(),
    answer: -1,
    isKeyframe: true,
  });
  rec.phase(
    '오답 확인',
    `2N = ${limit}회가 끝나 루프가 종료되어 -1을 반환했습니다! 하지만 바로 다음 9회째에 i=5의 1만 빼면 큐1에 [7]만 남아 합이 ${TARGET}이 됩니다.`,
    LT_AT.fail,
  );
  rec.do(...together([
    { type: 'set', id: 'win', patch: { rect: winRect(i, j - 1), tone: 'bad' } },
    { type: 'set', id: cId(5), patch: { tone: 'bad' } },
    { type: 'set', id: cId(6), patch: { tone: 'good' } },
    { type: 'set', id: 'tok:ans', patch: { text: '오답 -1 (정답 9회)', tone: 'bad' }, pop: true },
    calcTo('한쪽 큐의 뒤쪽 원소 하나만 남기려면 최대 3N − 3회(9회)가 필요합니다!'),
  ]));

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제 정의                                                            */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'equal-queues',
  title: '두 큐 합 같게 만들기',
  level: 2,
  category: 'two-pointer',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/118667',
  description: {
    summary:
      '길이가 같은 두 개의 큐 queue1, queue2에서 한 번에 한 원소를 꺼내(pop) 다른 큐의 뒤에 넣는(insert) 작업을 반복해 두 큐의 원소 합을 같게 만듭니다. 필요한 최소 작업 횟수를 구하고, 불가능하면 -1을 반환합니다.',
    rules: [
      '1 ≤ queue1의 길이 = queue2의 길이 ≤ 300,000',
      '1 ≤ 각 원소 ≤ 10^9',
      'pop 한 번과 insert 한 번을 합쳐 작업 1회로 침',
      '어떤 방법으로도 두 큐의 합을 같게 만들 수 없으면 -1을 반환',
    ],
  examples: [
      { input: 'queue1 = [3, 2, 7, 2], queue2 = [4, 6, 5, 1]', output: '2' },
      { input: 'queue1 = [1, 2, 1, 2], queue2 = [1, 10, 1, 2]', output: '7' },
      { input: 'queue1 = [1, 1], queue2 = [1, 5]', output: '-1' },
    ],
  },
  keyIntuitions: [
    '두 큐의 입출력이 서로 연결되어 있으므로 queue1과 queue2를 이어 붙인 원형 배열에서 queue1이 차지하는 연속 구간 [i, j)의 양 끝 포인터를 옮기는 문제와 같습니다.',
    '모든 원소가 양수이므로 합이 부족하면 오른쪽 포인터 j를 늘리고(큐2→큐1), 합이 넘치면 왼쪽 포인터 i를 늘리는(큐1→큐2) 그리디 선택이 유일한 최단 경로입니다.',
    '한쪽 큐의 끝부분 원소 하나만 남기려면 다른 큐에 보냈다가 원래 큐의 원소들까지 모두 빼내야 하므로 최대 3N − 3번까지 이동할 수 있습니다. 따라서 반복 상한은 2N이 아니라 3N 이상으로 잡아야 합니다.',
  ],
  demo: {
    input: [Q1, Q2],
    label: `queue1 = [${Q1.join(', ')}], queue2 = [${Q2.join(', ')}]`,
  },
  workUnit: '구간 합을 비교한 횟수',
  approaches: [
    {
      id: 'equal-queues-two-pointer',
      name: '큰 쪽에서 옮기기 (연결 배열 + 투 포인터)',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '두 큐를 이어 붙인 배열에서 합이 큰 쪽의 앞 포인터를 전진시키며 최대 3N번 안에 판정하는 정석 풀이입니다.',
      pros: [
        '실제 큐에서 원소를 빼고 넣는 대신 인덱스 i, j만 1씩 늘리므로 매 이동이 O(1)입니다.',
        '최대 3N번만 반복하므로 N = 300,000에서도 90만 번 이하의 연산으로 빠르게 끝납니다.',
      ],
      cons: ['불가능한 입력에서 무한 루프에 빠지지 않도록 반복 상한(3N 이상)을 정확히 설정해야 합니다.'],
      whyThisRank:
        '큐 두 개의 이동을 연결 배열 위의 투 포인터로 바꾸어 시간과 구현 복잡도를 모두 최소화한 풀이입니다.',
      code: TWO_POINTER,
      visualize: twoPointer,
    },
    {
      id: 'equal-queues-binary-search',
      name: '누적합 + 끝점 이분 탐색',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '연결 배열의 누적합에서 합이 절반인 구간을 이분 탐색으로 찾고 이동 횟수 공식을 적용하는 풀이로, 맞지만 O(N log N) 시간과 복잡한 분기가 필요합니다.',
      pros: [
        '반복 상한을 몇 번으로 잡을지 고민할 필요 없이 모든 시작점 l만 확인하면 됩니다.',
        '구간 합 문제를 누적합 이분 탐색으로 일관되게 풀 수 있습니다.',
      ],
      cons: [
        '시작점마다 이분 탐색을 수행해 O(N log N) 시간이 걸립니다.',
        '구간 [l, r]이 원래 큐 경계에 걸쳐 있는지, 한쪽 큐 내부에 있는지에 따라 이동 횟수 공식을 네 가지로 나누어야 해서 실수하기 쉽습니다.',
      ],
      whyThisRank:
        '정답은 항상 일치하지만, 큰 쪽에서 작은 쪽으로 옮기는 방향이 매 순간 하나로 정해지므로 투 포인터로 시뮬레이션하는 편이 훨씬 직관적이고 빠릅니다.',
      code: BIN_SEARCH,
      visualize: binarySearch,
    },
    {
      id: 'equal-queues-limit-2n',
      name: '탐색 상한을 2N으로 잡기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '반복 상한을 2N으로 잡으면 한쪽 큐의 뒤쪽 원소 하나만 남겨야 하는 경우(최대 3N − 3회)를 찾지 못해 오답(-1)을 냅니다.',
      pros: ['공식 예제 세 개는 모두 2N회 이하에서 끝나므로 예제 테스트는 통과합니다.'],
      cons: [
        'queue2의 뒤쪽 원소 하나만 queue1에 남기려면 queue2에서 N−1개를 가져오고 queue1의 원래 N개와 앞쪽 N−2개를 모두 빼내야 해서 최대 3N − 3회가 필요합니다.',
        'queue1 = [1, 1, 1, 1], queue2 = [1, 1, 7, 1](N = 4)에서 정답은 9회인데 2N = 8회에서 멈춰 -1을 반환합니다.',
      ],
      whyThisRank:
        '이 문제에서 가장 많이 틀리는 실수로, 두 큐의 원소가 한 바퀴 도는 상한을 계산할 때 양쪽 포인터가 각각 이동할 수 있는 최대 거리를 따져 3N 이상으로 잡아야 합니다.',
      code: LIMIT_TRAP,
      visualize: limitTrap,
    },
  ],
  checks: {
    cases: [
      { args: [[3, 2, 7, 2], [4, 6, 5, 1]], expected: 2 },
      { args: [[1, 2, 1, 2], [1, 10, 1, 2]], expected: 7 },
      { args: [[1, 1], [1, 5]], expected: -1 },
      { args: [Q1, Q2], expected: 9 },
      { args: [[2, 2], [2, 2]], expected: 0 },
      { args: [[2, 2, 2], [2, 8, 2]], expected: -1 },
    ],
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 4);
      const q1 = Array.from({ length: n }, () => 1 + Math.floor(rand() * 6));
      const q2 = Array.from({ length: n }, () => 1 + Math.floor(rand() * 6));
      return [q1, q2];
    },
  },
};

export default problem;
