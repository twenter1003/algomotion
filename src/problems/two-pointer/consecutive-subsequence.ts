// 연속된 부분 수열의 합: 정석 구간 늘리고 줄이기(투 포인터), 대안 누적합 + 끝점 이분 탐색, 함정 첫 합 k 구간에서 바로 멈추기를 비교한다.
import { grid } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

// 시각화 입력: 비내림차순 수열이라 뒤로 갈수록 수가 커져 더 짧은 합 5 구간이 뒤에 나온다 ([0,2] 길이 3 → [3,4] 길이 2 → [5,5] 길이 1)
const SEQ = [1, 2, 2, 2, 3, 5];
const K = 5;
const N = SEQ.length;
const PREFIX = [0, ...SEQ.map((_, i) => SEQ.slice(0, i + 1).reduce((a, b) => a + b, 0))];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TWO_POINTER = {
  python: `def solution(sequence, k):
    n = len(sequence)
    left = 0
    total = sequence[0]
    best = [0, n - 1]
    right = 0
    while left < n:
        if total == k and right - left < best[1] - best[0]:
            best = [left, right]          # 더 짧은 구간이면 갱신
        if total < k and right + 1 < n:
            right += 1                    # 합이 부족하면 오른쪽을 늘린다
            total += sequence[right]
        else:
            total -= sequence[left]       # 합이 k 이상이거나 끝이면 왼쪽을 줄인다
            left += 1
    return best`,
  javascript: `function solution(sequence, k) {
  const n = sequence.length;
  let left = 0;
  let total = sequence[0];
  let best = [0, n - 1];
  let right = 0;
  while (left < n) {
    if (total === k && right - left < best[1] - best[0]) {
      best = [left, right]; // 더 짧은 구간이면 갱신
    }
    if (total < k && right + 1 < n) {
      right += 1; // 합이 부족하면 오른쪽을 늘린다
      total += sequence[right];
    } else {
      total -= sequence[left]; // 합이 k 이상이거나 끝이면 왼쪽을 줄인다
      left += 1;
    }
  }
  return best;
}`,
};
const TP_AT = {
  init: lines(TWO_POINTER, ['left = 0', 'total = sequence[0]', 'best = [0, n - 1]'], ['let left = 0', 'let total = sequence[0]', 'let best = [0, n - 1]']),
  check: lines(TWO_POINTER, ['while left < n', 'if total == k and right - left < best[1] - best[0]'], ['while (left < n)', 'if (total === k && right - left < best[1] - best[0])']),
  record: lines(TWO_POINTER, ['best = [left, right]'], ['best = [left, right]']),
  expand: lines(TWO_POINTER, ['if total < k and right + 1 < n', 'right += 1', 'total += sequence[right]'], ['if (total < k && right + 1 < n)', 'right += 1', 'total += sequence[right]']),
  shrink: lines(TWO_POINTER, ['total -= sequence[left]', 'left += 1'], ['total -= sequence[left]', 'left += 1']),
  done: lines(TWO_POINTER, ['return best'], ['return best']),
};

const BIN_SEARCH = {
  python: `from bisect import bisect_left

def solution(sequence, k):
    n = len(sequence)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + sequence[i]
    best = [0, n - 1]
    for left in range(n):
        target = prefix[left] + k         # prefix[right + 1]이 되어야 할 값
        idx = bisect_left(prefix, target, left + 1, n + 1)
        if idx <= n and prefix[idx] == target:
            right = idx - 1
            if right - left < best[1] - best[0]:
                best = [left, right]
    return best`,
  javascript: `function solution(sequence, k) {
  const n = sequence.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + sequence[i];
  let best = [0, n - 1];
  for (let left = 0; left < n; left++) {
    const target = prefix[left] + k; // prefix[right + 1]이 되어야 할 값
    let lo = left + 1, hi = n + 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (prefix[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    if (lo <= n && prefix[lo] === target && lo - 1 - left < best[1] - best[0]) {
      best = [left, lo - 1];
    }
  }
  return best;
}`,
};
const BS_AT = {
  init: lines(BIN_SEARCH, ['prefix = [0] * (n + 1)', 'prefix[i + 1] = prefix[i] + sequence[i]'], ['const prefix = new Array(n + 1)', 'for (let i = 0; i < n; i++) prefix[i + 1]']),
  pickLeft: lines(BIN_SEARCH, ['for left in range(n)', 'target = prefix[left] + k'], ['for (let left = 0; left < n; left++)', 'const target = prefix[left] + k']),
  search: lines(BIN_SEARCH, ['idx = bisect_left(prefix, target, left + 1, n + 1)'], ['while (lo < hi)', 'if (prefix[mid] < target) lo = mid + 1']),
  update: lines(BIN_SEARCH, ['if idx <= n and prefix[idx] == target', 'best = [left, right]'], ['if (lo <= n && prefix[lo] === target', 'best = [left, lo - 1]']),
  done: lines(BIN_SEARCH, ['return best'], ['return best']),
};

const FIRST_MATCH = {
  python: `# 주의: 처음 찾은 합 k 구간을 바로 반환하면 뒤에 있는 더 짧은 구간을 놓칩니다
def solution(sequence, k):
    n = len(sequence)
    left = 0
    total = sequence[0]
    right = 0
    while left < n:
        if total == k:
            return [left, right]          # 첫 구간에서 바로 종료 (오답!)
        if total < k and right + 1 < n:
            right += 1
            total += sequence[right]
        else:
            total -= sequence[left]
            left += 1
    return [0, n - 1]`,
  javascript: `// 주의: 처음 찾은 합 k 구간을 바로 반환하면 뒤에 있는 더 짧은 구간을 놓칩니다
function solution(sequence, k) {
  const n = sequence.length;
  let left = 0;
  let total = sequence[0];
  let right = 0;
  while (left < n) {
    if (total === k) {
      return [left, right]; // 첫 구간에서 바로 종료 (오답!)
    }
    if (total < k && right + 1 < n) {
      right += 1;
      total += sequence[right];
    } else {
      total -= sequence[left];
      left += 1;
    }
  }
  return [0, n - 1];
}`,
};
const FM_AT = {
  init: lines(FIRST_MATCH, ['left = 0', 'total = sequence[0]', 'right = 0'], ['let left = 0', 'let total = sequence[0]', 'let right = 0']),
  check: lines(FIRST_MATCH, ['while left < n', 'if total == k'], ['while (left < n)', 'if (total === k)']),
  earlyReturn: lines(FIRST_MATCH, ['return [left, right]'], ['return [left, right]']),
  expand: lines(FIRST_MATCH, ['if total < k and right + 1 < n', 'right += 1', 'total += sequence[right]'], ['if (total < k && right + 1 < n)', 'right += 1', 'total += sequence[right]']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 560;
const H = 248;
const cellAt = grid({ x: 76, y: 36, rows: 1, cols: N, cell: 54, gap: 10 });
const cId = (i: number) => `c:${i}`;
const ptrRect = (row: 0 | 1, idx: number): Rect => ({
  x: cellAt(0, Math.min(Math.max(idx, 0), N - 1)).x + 5,
  y: row === 0 ? 102 : 130,
  w: 44,
  h: 22,
});
const winRect = (l: number, r: number): Rect => {
  const a = cellAt(0, Math.min(l, r));
  const b = cellAt(0, Math.max(l, r));
  return { x: a.x - 4, y: a.y - 4, w: b.x + b.w - a.x + 8, h: a.h + 8 };
};
const TOKENS: Rect[] = [
  { x: 76, y: 168, w: 136, h: 32 },
  { x: 222, y: 168, w: 146, h: 32 },
  { x: 378, y: 168, w: 166, h: 32 },
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

function board(row0Label: string, row1Label: string): Scene {
  const items: Item[] = [
    { id: 'lab:seq', kind: 'text', rect: { x: 0, y: 36, w: 68, h: 54 }, tone: 'muted', text: '수열' },
    { id: 'lab:p0', kind: 'text', rect: { x: 0, y: 102, w: 68, h: 22 }, tone: 'muted', text: row0Label },
    { id: 'lab:p1', kind: 'text', rect: { x: 0, y: 130, w: 68, h: 22 }, tone: 'muted', text: row1Label },
    { id: 'win', kind: 'zone', rect: winRect(0, 0), tone: 'explored' },
    { id: 'tok:k', kind: 'token', rect: TOKENS[0], tone: 'plain', text: `목표 합 k = ${K}` },
    { id: 'tok:sum', kind: 'token', rect: TOKENS[1], tone: 'chosen', text: `구간 합 ${SEQ[0]}` },
    { id: 'tok:best', kind: 'token', rect: TOKENS[2], tone: 'plain', text: '최단 구간 없음' },
    { id: 'calc', kind: 'text', rect: { x: 76, y: 210, w: 468, h: 28 }, text: '' },
  ];
  SEQ.forEach((v, i) => items.push({ id: cId(i), kind: 'cell', rect: cellAt(0, i), tone: 'plain', text: String(v), sub: `[${i}]` }));
  return { width: W, height: H, items };
}

const movePtr = (rec: StepRecorder, id: 'l' | 'r', row: 0 | 1, idx: number, text: string): Action => {
  const rect = ptrRect(row, idx);
  const fullId = `ptr:${id}`;
  return rec.has(fullId)
    ? { type: 'set', id: fullId, patch: { rect, text } }
    : { type: 'add', item: { id: fullId, kind: 'token', rect, tone: 'chosen', text } };
};

const paintRange = (l: number, r: number, activeTone: Tone): Action[] =>
  SEQ.map((_, i): Action => ({
    type: 'set',
    id: cId(i),
    patch: { tone: i >= l && i <= r ? activeTone : i < l ? 'visited' : 'plain' },
  }));

/* ------------------------------------------------------------------ */
/* 정석: 구간 늘리고 줄이기 (투 포인터)                                    */
/* ------------------------------------------------------------------ */

function twoPointer(): Visualization {
  const rec = new StepRecorder(board('left', 'right'));
  let [left, right, total, comps] = [0, 0, SEQ[0], 0];
  let best: [number, number] = [0, N - 1];
  let found = false;
  const fmtBest = () => (found ? `[${best[0]}, ${best[1]}]` : `[0, ${N - 1}]`);
  const meta = () => ({ work: comps, variables: { left, right, total, best: fmtBest() } });

  rec.step({ title: `초기화: left = 0, right = 0, 합 = ${SEQ[0]}`, codeHighlights: TP_AT.init, ...meta() });
  rec.phase('시작', `포인터 두 개를 0번 칸에 두고 시작합니다. 구간 [0, 0]의 합은 ${SEQ[0]}이고 목표 합 k는 ${K}입니다.`, TP_AT.init);
  rec.do(...together([
    movePtr(rec, 'l', 0, 0, 'L=0'),
    movePtr(rec, 'r', 1, 0, 'R=0'),
    ...paintRange(0, 0, 'current'),
    calcTo(`구간 [0, 0] 합 = ${SEQ[0]}`),
  ]));

  while (left < N) {
    const [curL, curR, curSum] = [left, right, total];
    const isMatch = curSum === K;
    const isShorter = isMatch && (!found || curR - curL < best[1] - best[0]);
    if (isShorter) {
      best = [curL, curR];
      found = true;
    }
    const willExpand = curSum < K && curR + 1 < N;
    if (willExpand) {
      right += 1;
      total += SEQ[right];
    } else {
      total -= SEQ[left];
      left += 1;
    }
    comps += 1;

    const len = curR - curL + 1;
    rec.step({
      title: `[${curL}, ${curR}] 합 ${curSum}: ${isMatch ? `k=${K} 찾음(길이 ${len}) → left+1` : willExpand ? '부족 → right+1' : '초과 → left+1'}`,
      codeHighlights: willExpand ? TP_AT.expand : TP_AT.shrink,
      ...meta(),
    });

    rec.phase(
      '합 비교',
      isMatch
        ? `구간 [${curL}, ${curR}]의 합이 ${ro(curSum)} 목표 ${josa(K, '과', '와')} 같습니다! 길이는 ${len}칸이라 최단 구간을 [${curL}, ${curR}]로 갱신합니다.`
        : curSum < K
          ? `구간 [${curL}, ${curR}]의 합은 ${curSum}이라 목표 ${K}보다 작습니다.`
          : `구간 [${curL}, ${curR}]의 합은 ${curSum}이라 목표 ${K}보다 큽니다.`,
      isShorter ? TP_AT.record : TP_AT.check,
    );
    rec.do(...together([
      { type: 'focus', ids: Array.from({ length: len }, (_, d) => cId(curL + d)) },
      { type: 'arrow', from: cId(curL), to: cId(curR), verdict: isMatch ? 'good' : curSum < K ? 'new' : 'bad', label: `합 ${curSum} ${isMatch ? '=' : curSum < K ? '<' : '>'} ${K}` },
      ...(isShorter
        ? [{ type: 'set', id: 'tok:best', patch: { text: `최단 [${curL}, ${curR}] (길이 ${len})`, tone: 'good' }, pop: true } as Action]
        : []),
    ]));

    if (willExpand) {
      rec.phase(
        '구간 늘리기',
        `right를 ${ro(right)} 한 칸 늘려 ${SEQ[right]}번 값을 더합니다. 구간 합이 ${ro(total)} 됩니다.`,
        TP_AT.expand,
      );
      rec.do(...clear());
      rec.do(...together([
        movePtr(rec, 'r', 1, right, `R=${right}`),
        { type: 'set', id: 'win', patch: { rect: winRect(left, right) } },
        ...paintRange(left, right, 'current'),
        { type: 'set', id: 'tok:sum', patch: { text: `구간 합 ${total}` }, pop: true },
        calcTo(`구간 [${left}, ${right}] 합 = ${total}`),
      ]));
    } else {
      rec.phase(
        '구간 줄이기',
        left < N
          ? `left 칸(${SEQ[curL]})을 빼고 left를 ${ro(left)} 옮깁니다. 남은 구간 합은 ${total}입니다.`
          : `마지막 칸까지 확인하고 left가 배열 끝에 닿아 탐색을 마칩니다.`,
        TP_AT.shrink,
      );
      rec.do(...clear());
      const showL = Math.min(left, N - 1);
      const showR = Math.max(showL, right);
      rec.do(...together([
        movePtr(rec, 'l', 0, showL, `L=${left}`),
        { type: 'set', id: 'win', patch: { rect: winRect(showL, showR) } },
        ...paintRange(left, right, 'current'),
        { type: 'set', id: 'tok:sum', patch: { text: `구간 합 ${total}` }, pop: true },
        calcTo(left < N ? `구간 [${left}, ${right}] 합 = ${total}` : '탐색 완료'),
      ]));
    }
  }

  rec.step({
    title: `정답: 가장 짧은 구간 [${best[0]}, ${best[1]}]`,
    codeHighlights: TP_AT.done,
    ...meta(),
    answer: best,
    isKeyframe: true,
  });
  rec.phase(
    '정답',
    `합이 ${K}인 구간 [0, 2](길이 3), [3, 4](길이 2), [5, 5](길이 1) 중 가장 짧은 구간은 [${best[0]}, ${best[1]}]입니다.`,
    TP_AT.done,
  );
  rec.do(...together([
    { type: 'set', id: 'win', patch: { rect: winRect(best[0], best[1]), tone: 'path' } },
    ...SEQ.map((_, i): Action => ({ type: 'set', id: cId(i), patch: { tone: i >= best[0] && i <= best[1] ? 'path' : 'visited' } })),
    { type: 'set', id: 'tok:best', patch: { text: `정답 [${best[0]}, ${best[1]}]`, tone: 'path' }, pop: true },
    calcTo(`최단 구간 [${best[0]}, ${best[1]}] (길이 ${best[1] - best[0] + 1})`),
  ]));

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 누적합 + 끝점 이분 탐색                                          */
/* ------------------------------------------------------------------ */

function binarySearch(): Visualization {
  const rec = new StepRecorder(board('left', '탐색 끝점'));
  let comps = 0;
  let best: [number, number] = [0, N - 1];
  let found = false;
  let curLeft: number | string = '-';
  let curTarget: number | string = '-';
  const fmtBest = () => `[${best[0]}, ${best[1]}]`;
  const meta = () => ({ work: comps, variables: { left: curLeft, target: curTarget, best: fmtBest() } });

  rec.step({ title: `누적합 배열 만들기: [${PREFIX.join(', ')}]`, codeHighlights: BS_AT.init, ...meta() });
  rec.phase('누적합 준비', `앞에서부터 더한 누적합 P = [${PREFIX.join(', ')}]를 만듭니다. 구간 [left, right]의 합은 P[right+1] − P[left]입니다.`, BS_AT.init);
  rec.do(...together([
    ...SEQ.map((_, i): Action => ({ type: 'set', id: cId(i), patch: { sub: `P=${PREFIX[i + 1]}` }, pop: true })),
    calcTo(`P = [${PREFIX.join(', ')}]`),
  ]));

  for (let left = 0; left < N; left++) {
    const target = PREFIX[left] + K;
    curLeft = left;
    curTarget = target;
    let lo = left + 1;
    let hi = N + 1;
    const mids: number[] = [];
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      mids.push(mid - 1);
      comps += 1;
      if (PREFIX[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const hit = lo <= N && PREFIX[lo] === target;
    const right = hit ? lo - 1 : Math.min(lo - 1, N - 1);
    const isShorter = hit && (!found || right - left < best[1] - best[0]);
    if (isShorter) {
      best = [left, right];
      found = true;
    }
    const subSum = PREFIX[right + 1] - PREFIX[left];

    rec.step({
      title: `left = ${left}: P[right+1] = ${target} 이분 탐색 (${mids.length}번 비교)`,
      codeHighlights: hit ? BS_AT.update : BS_AT.search,
      ...meta(),
    });

    rec.phase(
      '시작점 고정',
      `left = ${ro(left)} 고정하면 P[left] = ${PREFIX[left]}이므로, P[right+1] = ${PREFIX[left]} + ${K} = ${josa(target, '이', '가')} 되는 끝점을 이분 탐색합니다.`,
      BS_AT.pickLeft,
    );
    rec.do(...together([
      movePtr(rec, 'l', 0, left, `L=${left}`),
      movePtr(rec, 'r', 1, right, `R=${right}`),
      { type: 'set', id: 'win', patch: { rect: winRect(left, right) } },
      ...paintRange(left, right, 'current'),
      calcTo(`left=${left}, 찾을 누적합 target = ${target}`),
    ]));

    rec.phase(
      '이분 탐색',
      hit
        ? `${mids.length}번 비교해 P[${right + 1}] = ${target}인 right = ${josa(right, '을', '를')} 찾았습니다.${isShorter ? ` 길이 ${right - left + 1}칸으로 최단 구간을 [${left}, ${right}]로 갱신합니다.` : ''}`
        : `${mids.length}번 비교했지만 누적합이 정확히 ${target}인 끝점이 없습니다.`,
      hit ? BS_AT.update : BS_AT.search,
    );
    rec.do(...together([
      { type: 'focus', ids: [cId(left), cId(right)] },
      { type: 'arrow', from: cId(left), to: cId(right), verdict: hit ? 'good' : 'bad', label: `합 ${subSum} ${hit ? '=' : '≠'} ${K}` },
      { type: 'set', id: 'tok:sum', patch: { text: `구간 합 ${subSum}` }, pop: true },
      ...(isShorter
        ? [{ type: 'set', id: 'tok:best', patch: { text: `최단 [${left}, ${right}] (길이 ${right - left + 1})`, tone: 'good' }, pop: true } as Action]
        : []),
    ]), wait(120), ...clear());
  }

  rec.step({
    title: `정답: [${best[0]}, ${best[1]}] (비교 ${comps}번)`,
    codeHighlights: BS_AT.done,
    ...meta(),
    answer: best,
    isKeyframe: true,
  });
  rec.phase(
    '정답',
    `정석과 같이 [${best[0]}, ${best[1]}]을 찾았지만, 누적합 배열 O(N) 메모리를 추가로 쓰고 이분 탐색 비교를 ${comps}번(정석은 11번) 수행했습니다.`,
    BS_AT.done,
  );
  rec.do(...together([
    { type: 'set', id: 'win', patch: { rect: winRect(best[0], best[1]), tone: 'path' } },
    ...SEQ.map((_, i): Action => ({ type: 'set', id: cId(i), patch: { tone: i >= best[0] && i <= best[1] ? 'path' : 'visited' } })),
    { type: 'set', id: 'tok:best', patch: { text: `정답 [${best[0]}, ${best[1]}]`, tone: 'path' }, pop: true },
    calcTo(`최단 구간 [${best[0]}, ${best[1]}] (이분 탐색 총 ${comps}번 비교)`),
  ]));

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: 첫 번째 합 k 구간에서 바로 멈추기 (오답)                          */
/* ------------------------------------------------------------------ */

function firstMatchTrap(): Visualization {
  const rec = new StepRecorder(board('left', 'right'));
  let [left, right, total, comps] = [0, 0, SEQ[0], 0];
  const meta = () => ({ work: comps, variables: { left, right, total } });

  rec.step({ title: `초기화: left = 0, right = 0, 합 = ${SEQ[0]}`, codeHighlights: FM_AT.init, ...meta() });
  rec.phase('시작', '투 포인터로 구간을 넓히다가 합이 k가 되는 첫 순간 바로 반환하면 어떻게 될지 확인합니다.', FM_AT.init);
  rec.do(...together([
    movePtr(rec, 'l', 0, 0, 'L=0'),
    movePtr(rec, 'r', 1, 0, 'R=0'),
    ...paintRange(0, 0, 'current'),
    calcTo(`구간 [0, 0] 합 = ${SEQ[0]}`),
  ]));

  while (total < K && right + 1 < N) {
    const [curL, curR, curSum] = [left, right, total];
    right += 1;
    total += SEQ[right];
    comps += 1;

    rec.step({
      title: `[${curL}, ${curR}] 합 ${curSum} < ${K} → right = ${right}로 확장`,
      codeHighlights: FM_AT.expand,
      ...meta(),
    });
    rec.phase('합 비교', `구간 [${curL}, ${curR}]의 합은 ${curSum}이라 목표 ${K}보다 작습니다.`, FM_AT.check);
    rec.do(
      { type: 'focus', ids: Array.from({ length: curR - curL + 1 }, (_, d) => cId(curL + d)) },
      { type: 'arrow', from: cId(curL), to: cId(curR), verdict: 'new', label: `합 ${curSum} < ${K}` },
    );

    rec.phase('구간 늘리기', `right를 ${ro(right)} 늘려 ${SEQ[right]}을 더하면 구간 [0, ${right}]의 합이 ${ro(total)} 됩니다.`, FM_AT.expand);
    rec.do(...clear());
    rec.do(...together([
      movePtr(rec, 'r', 1, right, `R=${right}`),
      { type: 'set', id: 'win', patch: { rect: winRect(left, right) } },
      ...paintRange(left, right, 'current'),
      { type: 'set', id: 'tok:sum', patch: { text: `구간 합 ${total}` }, pop: true },
      calcTo(`구간 [${left}, ${right}] 합 = ${total}`),
    ]));
  }

  comps += 1;
  const wrongAns: [number, number] = [left, right];
  rec.step({
    title: `오답: 첫 구간 [${left}, ${right}](길이 3)에서 멈춤 — 정답은 [5, 5](길이 1)`,
    codeHighlights: FM_AT.earlyReturn,
    ...meta(),
    answer: wrongAns,
    isKeyframe: true,
  });
  rec.phase(
    '성급한 종료',
    `구간 [0, 2]의 합이 ${K}가 되자마자 바로 [0, 2](길이 3)를 반환해 버렸습니다.`,
    FM_AT.earlyReturn,
  );
  rec.do(...together([
    { type: 'set', id: 'win', patch: { rect: winRect(0, 2), tone: 'bad' } },
    ...SEQ.map((_, i): Action => ({ type: 'set', id: cId(i), patch: { tone: i <= 2 ? 'bad' : i === 5 ? 'good' : 'plain' } })),
    { type: 'set', id: 'tok:best', patch: { text: '오답 [0, 2] vs 정답 [5, 5]', tone: 'bad' }, pop: true },
  ]));
  rec.phase(
    '오답 확인',
    `수열이 비내림차순이므로 뒤쪽에 더 큰 수(5)로 이루어진 길이 1짜리 구간 [5, 5]가 있습니다. 끝까지 탐색하며 최단 길이를 비교해야 합니다.`,
    FM_AT.earlyReturn,
  );
  rec.do(
    { type: 'focus', ids: [cId(0), cId(1), cId(2), cId(5)] },
    { type: 'arrow', from: cId(2), to: cId(5), verdict: 'good', label: '뒤에 길이 1인 [5, 5] 존재!' },
    calcTo('오답 [0, 2](길이 3) ≠ 정답 [5, 5](길이 1)'),
  );

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제 정의                                                            */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'consecutive-subsequence',
  title: '연속된 부분 수열의 합',
  level: 2,
  category: 'two-pointer',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/178870',
  description: {
    summary:
      '비내림차순으로 정렬된 양의 정수 수열 sequence에서 연속된 부분 수열의 합이 k인 구간 [시작 인덱스, 끝 인덱스]를 구합니다. 합이 k인 구간이 여러 개면 길이가 가장 짧은 구간을, 길이도 같으면 앞쪽에 나오는 구간을 고릅니다.',
    rules: [
      '5 ≤ sequence의 길이 ≤ 1,000,000',
      '1 ≤ sequence의 원소 ≤ 1,000 (비내림차순 정렬)',
      '5 ≤ k ≤ 1,000,000,000 (항상 부분 수열로 만들 수 있는 k만 주어짐)',
      '길이가 가장 짧은 구간을 반환하되, 여러 개면 시작 인덱스가 가장 작은 구간을 반환',
    ],
    examples: [
      { input: 'sequence = [1, 2, 3, 4, 5], k = 7', output: '[2, 3]' },
      { input: 'sequence = [1, 1, 1, 2, 3, 4, 5], k = 5', output: '[6, 6]' },
      { input: 'sequence = [2, 2, 2, 2, 2], k = 6', output: '[0, 2]' },
    ],
  },
  keyIntuitions: [
    '원소가 모두 양수이므로 오른쪽 끝(right)을 늘리면 구간 합이 늘어나고, 왼쪽 끝(left)을 늘리면 구간 합이 줄어듭니다.',
    '이 단조성 덕분에 left와 right 두 포인터를 모두 왼쪽에서 오른쪽으로만 이동시키며 O(N)에 모든 후보 구간을 확인할 수 있습니다.',
    '수열이 비내림차순이므로 뒤쪽으로 갈수록 원소가 커져 더 짧은 구간이 나올 수 있습니다. 첫 구간을 찾았다고 멈추지 말고 끝까지 탐색해야 합니다.',
  ],
  demo: {
    input: [SEQ, K],
    label: `sequence = [${SEQ.join(', ')}], k = ${K}`,
  },
  workUnit: '구간 합을 비교한 횟수',
  approaches: [
    {
      id: 'consecutive-subsequence-two-pointer',
      name: '구간 늘리고 줄이기 (투 포인터)',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: '합이 부족하면 오른쪽을 늘리고, 합이 k 이상이면 왼쪽을 줄이며 한 번에 훑는 정석 풀이입니다.',
      pros: [
        '각 원소가 구간에 최대 한 번 들어가고 한 번 빠지므로 최대 2N번 이동으로 끝납니다.',
        '추가 배열 없이 포인터와 합 변수만으로 O(1) 메모리에 동작합니다.',
        '앞에서부터 순서대로 찾으므로 길이가 같을 때 `<` 조건만 쓰면 앞쪽 구간이 자연스럽게 유지됩니다.',
      ],
      cons: ['합이 k와 같을 때도 다음 후보를 보려면 왼쪽 포인터를 줄여 주어야 무한 루프에 빠지지 않습니다.'],
      whyThisRank:
        '양수 수열의 구간 합 단조성을 그대로 활용해 시간 O(N), 공간 O(1)로 가장 빠르고 간결하게 풀 수 있습니다.',
      code: TWO_POINTER,
      visualize: twoPointer,
    },
    {
      id: 'consecutive-subsequence-binary-search',
      name: '누적합 + 끝점 이분 탐색',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '누적합 배열을 만든 뒤 시작점마다 끝점을 이분 탐색하는 풀이로, 맞지만 O(N) 메모리와 log N 배의 탐색이 더 듭니다.',
      pros: [
        '누적합이 단조증가한다는 성질을 이용해 이분 탐색으로 끝점을 바로 찾을 수 있습니다.',
        '포인터 이동 조건이 헷갈릴 때 반복문 구조가 단순합니다.',
      ],
      cons: [
        '길이 N + 1의 누적합 배열이 필요해 O(N) 메모리를 추가로 씁니다.',
        '시작점마다 이분 탐색을 하므로 O(N log N) 시간이 걸려 투 포인터보다 비교 횟수가 많습니다.',
      ],
      whyThisRank:
        '정답은 정확히 구하지만, 끝점 역시 단조증가하므로 매번 이분 탐색할 필요 없이 포인터만 이어서 밀면 O(N)과 O(1) 공간으로 줄일 수 있습니다.',
      code: BIN_SEARCH,
      visualize: binarySearch,
    },
    {
      id: 'consecutive-subsequence-first-match',
      name: '첫 번째 합 k 구간에서 바로 멈추기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: '합이 k인 첫 구간을 찾자마자 반환하면 뒤쪽에 있는 더 짧은 구간을 놓쳐 오답이 됩니다.',
      pros: ['앞쪽에 가장 짧은 구간이 있는 예제([2, 2, 2, 2, 2], k = 6)는 통과합니다.'],
      cons: [
        '비내림차순 수열에서는 뒤쪽 원소가 더 크므로 뒤로 갈수록 같은 합 k를 더 적은 칸으로 만들 수 있습니다.',
        'sequence = [1, 2, 2, 2, 3, 5], k = 5에서 정답 [5, 5](길이 1) 대신 [0, 2](길이 3)를 반환합니다.',
      ],
      whyThisRank:
        '"앞쪽에 나오는 수열을 찾는다"는 조건만 보고 첫 매칭에서 멈추기 쉽지만, 우선순위는 "길이가 짧은 수열"이 먼저이므로 끝까지 탐색해야 합니다.',
      code: FIRST_MATCH,
      visualize: firstMatchTrap,
    },
  ],
  checks: {
    cases: [
      { args: [[1, 2, 3, 4, 5], 7], expected: [2, 3] },
      { args: [[1, 1, 1, 2, 3, 4, 5], 5], expected: [6, 6] },
      { args: [[2, 2, 2, 2, 2], 6], expected: [0, 2] },
      { args: [SEQ, K], expected: [5, 5] },
      { args: [[1, 1, 1, 1, 1], 5], expected: [0, 4] },
      { args: [[1, 2, 3, 6, 6], 6], expected: [3, 3] },
    ],
    random: (rand) => {
      const len = 5 + Math.floor(rand() * 8);
      const seq = Array.from({ length: len }, () => 1 + Math.floor(rand() * 9)).sort((a, b) => a - b);
      const a = Math.floor(rand() * len);
      const b = a + Math.floor(rand() * (len - a));
      const k = seq.slice(a, b + 1).reduce((s, v) => s + v, 0);
      return [seq, k];
    },
  },
};

export default problem;
