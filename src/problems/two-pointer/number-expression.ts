// 숫자의 표현: 정석 연속 합 구간(투 포인터), 대안 누적합 + 끝점 이분 탐색, 함정 합이 넘쳐도 끝까지 더하는 이중 반복문을 비교한다.
import { grid } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

// 시각화 입력: 9 = 2+3+4 = 4+5 = 9 (총 3가지)
const TARGET = 9;
const HALF = Math.floor(TARGET / 2); // 4: 길이 2 이상인 연속 자연수 합의 시작점 상한
const NUMS = Array.from({ length: TARGET }, (_, i) => i + 1);
const PREFIX = [0, ...NUMS.map((_, i) => ((i + 1) * (i + 2)) / 2)];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TWO_POINTER = {
  python: `def solution(n):
    count = 1                             # 자기 자신(n = n) 1가지는 미리 센다
    left = 1
    right = 1
    total = 1
    while left <= n // 2:                 # 시작점이 n // 2를 넘으면 2개 이상 합이 항상 n보다 크다
        if total == n:
            count += 1
        if total < n:
            right += 1
            total += right                # 합이 부족하면 오른쪽 수를 더한다
        else:
            total -= left                 # 합이 n 이상이면 왼쪽 수를 뺀다
            left += 1
    return count`,
  javascript: `function solution(n) {
  let count = 1; // 자기 자신(n = n) 1가지는 미리 센다
  let left = 1;
  let right = 1;
  let total = 1;
  while (left <= Math.floor(n / 2)) { // 시작점이 n // 2를 넘으면 2개 이상 합이 항상 n보다 크다
    if (total === n) {
      count += 1;
    }
    if (total < n) {
      right += 1;
      total += right; // 합이 부족하면 오른쪽 수를 더한다
    } else {
      total -= left; // 합이 n 이상이면 왼쪽 수를 뺀다
      left += 1;
    }
  }
  return count;
}`,
};
const TP_AT = {
  init: lines(TWO_POINTER, ['count = 1', 'left = 1', 'total = 1'], ['let count = 1', 'let left = 1', 'let total = 1']),
  check: lines(TWO_POINTER, ['while left <= n // 2', 'if total == n'], ['while (left <= Math.floor(n / 2))', 'if (total === n)']),
  hit: lines(TWO_POINTER, ['if total == n:', 'count += 1'], ['if (total === n)', 'count += 1']),
  expand: lines(TWO_POINTER, ['if total < n:', 'right += 1', 'total += right'], ['if (total < n)', 'right += 1', 'total += right']),
  shrink: lines(TWO_POINTER, ['total -= left', 'left += 1'], ['total -= left', 'left += 1']),
  done: lines(TWO_POINTER, ['return count'], ['return count']),
};

const BIN_SEARCH = {
  python: `from bisect import bisect_left

def solution(n):
    prefix = [0] * (n + 1)
    for i in range(1, n + 1):
        prefix[i] = prefix[i - 1] + i
    count = 0
    for left in range(1, n + 1):
        want = prefix[left - 1] + n       # prefix[right]가 되어야 할 값
        right = bisect_left(prefix, want, left, n + 1)
        if right <= n and prefix[right] == want:
            count += 1
    return count`,
  javascript: `function solution(n) {
  const prefix = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) prefix[i] = prefix[i - 1] + i;
  let count = 0;
  for (let left = 1; left <= n; left++) {
    const want = prefix[left - 1] + n; // prefix[right]가 되어야 할 값
    let lo = left, hi = n + 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (prefix[mid] < want) lo = mid + 1;
      else hi = mid;
    }
    if (lo <= n && prefix[lo] === want) count += 1;
  }
  return count;
}`,
};
const BS_AT = {
  init: lines(BIN_SEARCH, ['prefix = [0] * (n + 1)', 'prefix[i] = prefix[i - 1] + i'], ['const prefix = new Array(n + 1)', 'for (let i = 1; i <= n; i++) prefix[i]']),
  search: lines(BIN_SEARCH, ['for left in range(1, n + 1)', 'right = bisect_left(prefix, want'], ['for (let left = 1; left <= n; left++)', 'while (lo < hi)']),
  hit: lines(BIN_SEARCH, ['if right <= n and prefix[right] == want', 'count += 1'], ['if (lo <= n && prefix[lo] === want) count += 1']),
  done: lines(BIN_SEARCH, ['return count'], ['return count']),
};

const BRUTE = {
  python: `# 주의: 합이 n을 넘어도 멈추지 않고 끝까지 더하면 O(n²)으로 효율성 테스트에서 시간 초과가 납니다
def solution(n):
    count = 0
    for start in range(1, n + 1):
        total = 0
        for end in range(start, n + 1):
            total += end
            if total == n:
                count += 1
    return count`,
  javascript: `// 주의: 합이 n을 넘어도 멈추지 않고 끝까지 더하면 O(n²)으로 효율성 테스트에서 시간 초과가 납니다
function solution(n) {
  let count = 0;
  for (let start = 1; start <= n; start++) {
    let total = 0;
    for (let end = start; end <= n; end++) {
      total += end;
      if (total === n) count += 1;
    }
  }
  return count;
}`,
};
const BRUTE_AT = {
  init: lines(BRUTE, ['count = 0'], ['let count = 0']),
  startLoop: lines(BRUTE, ['for start in range(1, n + 1)', 'total = 0'], ['for (let start = 1; start <= n; start++)', 'let total = 0']),
  innerLoop: lines(BRUTE, ['for end in range(start, n + 1)', 'total += end'], ['for (let end = start; end <= n; end++)', 'total += end']),
  hit: lines(BRUTE, ['if total == n:', 'count += 1'], ['if (total === n) count += 1']),
  done: lines(BRUTE, ['return count'], ['return count']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 584;
const H = 248;
const cellAt = grid({ x: 68, y: 34, rows: 1, cols: TARGET, cell: 50, gap: 6 });
const cId = (v: number) => `n:${v}`;
const ptrRect = (row: 0 | 1, v: number): Rect => ({
  x: cellAt(0, Math.min(Math.max(v - 1, 0), TARGET - 1)).x + 4,
  y: row === 0 ? 94 : 120,
  w: 42,
  h: 22,
});
const winRect = (l: number, r: number): Rect => {
  const a = cellAt(0, Math.min(Math.max(l - 1, 0), TARGET - 1));
  const b = cellAt(0, Math.min(Math.max(r - 1, 0), TARGET - 1));
  return { x: Math.min(a.x, b.x) - 3, y: a.y - 3, w: Math.abs(b.x - a.x) + a.w + 6, h: a.h + 6 };
};
const TOKENS: Rect[] = [
  { x: 68, y: 158, w: 148, h: 36 },
  { x: 226, y: 158, w: 156, h: 36 },
  { x: 392, y: 158, w: 174, h: 36 },
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
    { id: 'lab:nums', kind: 'text', rect: { x: 0, y: 34, w: 62, h: 50 }, tone: 'muted', text: '자연수' },
    { id: 'lab:p0', kind: 'text', rect: { x: 0, y: 94, w: 62, h: 22 }, tone: 'muted', text: row0 },
    { id: 'lab:p1', kind: 'text', rect: { x: 0, y: 120, w: 62, h: 22 }, tone: 'muted', text: row1 },
    { id: 'win', kind: 'zone', rect: winRect(1, 1), tone: 'explored' },
    { id: 'tok:target', kind: 'token', rect: TOKENS[0], tone: 'plain', text: `목표 n = ${TARGET}` },
    { id: 'tok:sum', kind: 'token', rect: TOKENS[1], tone: 'chosen', text: '구간 합 1' },
    { id: 'tok:cnt', kind: 'token', rect: TOKENS[2], tone: 'plain', text: '찾은 표현 0가지' },
    { id: 'calc', kind: 'text', rect: { x: 68, y: 206, w: 498, h: 28 }, text: '' },
  ];
  NUMS.forEach((v) => items.push({ id: cId(v), kind: 'cell', rect: cellAt(0, v - 1), tone: 'plain', text: String(v) }));
  return { width: W, height: H, items };
}

const movePtr = (rec: StepRecorder, id: 'l' | 'r', row: 0 | 1, v: number, text: string): Action => {
  const rect = ptrRect(row, v);
  const fullId = `ptr:${id}`;
  return rec.has(fullId)
    ? { type: 'set', id: fullId, patch: { rect, text } }
    : { type: 'add', item: { id: fullId, kind: 'token', rect, tone: 'chosen', text } };
};

const paintSpan = (l: number, r: number, activeTone: Tone, keep9 = false): Action[] =>
  NUMS.map((v): Action => ({
    type: 'set',
    id: cId(v),
    patch: { tone: v >= l && v <= r ? activeTone : keep9 && v === TARGET ? 'good' : v < l ? 'visited' : 'plain' },
  }));

/* ------------------------------------------------------------------ */
/* 정석: 연속 합 구간 (투 포인터)                                         */
/* ------------------------------------------------------------------ */

function twoPointer(): Visualization {
  const rec = new StepRecorder(board('left', 'right'));
  let [left, right, total, count, comps] = [1, 1, 1, 1, 0];
  const meta = () => ({ work: comps, variables: { left, right, total, count } });

  rec.step({ title: `초기화: 자기 자신(${TARGET} = ${TARGET}) 1가지 미리 포함`, codeHighlights: TP_AT.init, ...meta() });
  rec.phase(
    '시작',
    `자기 자신 하나로 표현하는 ${TARGET} = ${TARGET}을 먼저 세어 count = 1로 시작합니다. 길이 2 이상인 구간은 left ≤ ${HALF}까지만 확인하면 됩니다.`,
    TP_AT.init,
  );
  rec.do(...together([
    movePtr(rec, 'l', 0, 1, 'L=1'),
    movePtr(rec, 'r', 1, 1, 'R=1'),
    ...paintSpan(1, 1, 'current', true),
    { type: 'set', id: 'tok:cnt', patch: { text: '찾은 표현 1가지 (9)', tone: 'good' }, pop: true },
    calcTo(`초기: ${TARGET} = ${TARGET} (1가지), 구간 [1..1] 합 = 1`),
  ]));

  while (left <= HALF) {
    const [curL, curR, curSum] = [left, right, total];
    const matched = curSum === TARGET;
    if (matched) count += 1;
    const expand = curSum < TARGET;
    if (expand) {
      right += 1;
      total += right;
    } else {
      total -= left;
      left += 1;
    }
    comps += 1;
    const expr = Array.from({ length: curR - curL + 1 }, (_, d) => curL + d).join('+');

    rec.step({
      title: `[${curL}..${curR}] 합 ${curSum}: ${matched ? `${expr}=${TARGET} 찾음! (${count}가지)` : expand ? `부족 → right=${right}` : `초과 → left=${left}`}`,
      codeHighlights: matched ? TP_AT.hit : expand ? TP_AT.expand : TP_AT.shrink,
      ...meta(),
    });

    rec.phase(
      '구간 합 비교',
      matched
        ? `${expr} = ${TARGET}입니다! 표현 가짓수가 ${ro(count)} 늘어납니다.`
        : expand
          ? `${expr} = ${curSum}이라 ${TARGET}보다 작습니다.`
          : `${expr} = ${curSum}이라 ${TARGET}보다 큽니다.`,
      matched ? TP_AT.hit : TP_AT.check,
    );
    rec.do(...together([
      { type: 'focus', ids: Array.from({ length: curR - curL + 1 }, (_, d) => cId(curL + d)) },
      { type: 'arrow', from: cId(curL), to: cId(curR), verdict: matched ? 'good' : expand ? 'new' : 'bad', label: `합 ${curSum} ${matched ? '=' : expand ? '<' : '>'} ${TARGET}` },
      ...(matched ? [{ type: 'set', id: 'tok:cnt', patch: { text: `찾은 표현 ${count}가지`, tone: 'good' }, pop: true } as Action] : []),
    ]));

    rec.phase(
      expand ? '오른쪽 늘리기' : '왼쪽 줄이기',
      expand
        ? `right를 ${ro(right)} 늘려 ${right}을 더하면 합이 ${ro(total)} 됩니다.`
        : left <= HALF
          ? `왼쪽 끝 ${josa(curL, '을', '를')} 빼고 left를 ${ro(left)} 옮기면 합이 ${ro(total)} 됩니다.`
          : `left가 ${ro(left)} 되어 상한 ${HALF}을 넘었으므로 탐색을 마칩니다(5+6 = 11 > 9).`,
      expand ? TP_AT.expand : TP_AT.shrink,
    );
    rec.do(...clear());
    const showL = Math.min(left, right);
    rec.do(...together([
      movePtr(rec, 'l', 0, showL, `L=${left}`),
      movePtr(rec, 'r', 1, right, `R=${right}`),
      { type: 'set', id: 'win', patch: { rect: winRect(showL, right) } },
      ...paintSpan(showL, right, 'current', true),
      { type: 'set', id: 'tok:sum', patch: { text: `구간 합 ${total}` }, pop: true },
      calcTo(left <= HALF ? `구간 [${left}..${right}] 합 = ${total}` : `left = ${left} > ${HALF}: 탐색 종료`),
    ]));
  }

  rec.step({
    title: `정답: 총 ${count}가지 (2+3+4, 4+5, 9)`,
    codeHighlights: TP_AT.done,
    ...meta(),
    answer: count,
    isKeyframe: true,
  });
  rec.phase(
    '정답',
    `투 포인터로 ${comps}번만 비교해 2+3+4 = 9, 4+5 = 9, 9 = 9의 총 ${count}가지 표현을 찾았습니다.`,
    TP_AT.done,
  );
  rec.do(...together([
    { type: 'set', id: 'win', patch: { rect: winRect(4, 5), tone: 'path' } },
    ...NUMS.map((v): Action => ({
      type: 'set',
      id: cId(v),
      patch: { tone: v >= 2 && v <= 5 || v === 9 ? 'path' : 'visited' },
    })),
    { type: 'set', id: 'tok:cnt', patch: { text: `정답 ${count}가지`, tone: 'path' }, pop: true },
    calcTo(`정답 ${count}가지: (2+3+4), (4+5), (9)`),
  ]));

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 누적합 + 끝점 이분 탐색                                          */
/* ------------------------------------------------------------------ */

function binarySearch(): Visualization {
  const rec = new StepRecorder(board('시작 left', '끝 right'));
  let [count, comps] = [0, 0];
  let curL: number | string = '-';
  let curR: number | string = '-';
  const meta = () => ({ work: comps, variables: { left: curL, right: curR, count } });

  rec.step({ title: `누적합 배열 준비: P[i] = 1부터 i까지의 합`, codeHighlights: BS_AT.init, ...meta() });
  rec.phase(
    '누적합 준비',
    `1부터 i까지의 합 P = [${PREFIX.join(', ')}]를 배열로 만듭니다. 구간 [left..right]의 합은 P[right] − P[left−1]입니다.`,
    BS_AT.init,
  );
  rec.do(...together([
    ...NUMS.map((v): Action => ({ type: 'set', id: cId(v), patch: { sub: `P=${PREFIX[v]}` } })),
    calcTo(`P = [${PREFIX.join(', ')}]`),
  ]));

  for (let left = 1; left <= TARGET; left++) {
    const want = PREFIX[left - 1] + TARGET;
    let lo = left;
    let hi = TARGET + 1;
    let stepsHere = 0;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      stepsHere += 1;
      comps += 1;
      if (PREFIX[mid] < want) lo = mid + 1;
      else hi = mid;
    }
    const hit = lo <= TARGET && PREFIX[lo] === want;
    const right = hit ? lo : Math.min(lo, TARGET);
    if (hit) count += 1;
    curL = left;
    curR = right;
    const subSum = PREFIX[right] - PREFIX[left - 1];

    rec.step({
      title: `시작 ${left}: 이분 탐색 ${stepsHere}번 비교 → ${hit ? `[${left}..${right}] 합 ${TARGET} 찾음!` : '없음'}`,
      codeHighlights: hit ? BS_AT.hit : BS_AT.search,
      ...meta(),
    });
    rec.phase(
      '이분 탐색',
      `left = ${left}에서 P[right] = ${PREFIX[left - 1]} + ${TARGET} = ${josa(want, '이', '가')} 되는 끝점 right를 이분 탐색합니다(${stepsHere}번 비교).`,
      BS_AT.search,
    );
    rec.do(...together([
      movePtr(rec, 'l', 0, left, `L=${left}`),
      movePtr(rec, 'r', 1, right, `R=${right}`),
      { type: 'set', id: 'win', patch: { rect: winRect(left, right) } },
      ...paintSpan(left, right, hit ? 'good' : 'current'),
      { type: 'set', id: 'tok:sum', patch: { text: `구간 합 ${subSum}` }, pop: true },
      calcTo(`left=${left}, 찾을 P[right] = ${want} → 구간 [${left}..${right}] 합 = ${subSum}`),
    ]));

    rec.phase(
      '결과 확인',
      hit
        ? `P[${right}] = ${want}이어서 [${left}..${right}] 구간의 합이 ${TARGET}입니다! 찾은 표현은 ${count}가지입니다.`
        : `누적합이 정확히 ${want}인 끝점이 없습니다.`,
      hit ? BS_AT.hit : BS_AT.search,
    );
    rec.do(
      { type: 'focus', ids: [cId(left), cId(right)] },
      { type: 'arrow', from: cId(left), to: cId(right), verdict: hit ? 'good' : 'bad', label: hit ? `합 ${TARGET}!` : `합 ${subSum} ≠ ${TARGET}` },
      ...(hit ? [{ type: 'set', id: 'tok:cnt', patch: { text: `찾은 표현 ${count}가지`, tone: 'good' }, pop: true } as Action] : []),
      wait(100),
      ...clear(),
    );
  }

  rec.step({
    title: `정답: ${count}가지 (이분 탐색 비교 ${comps}번)`,
    codeHighlights: BS_AT.done,
    ...meta(),
    answer: count,
    isKeyframe: true,
  });
  rec.phase(
    '정답',
    `정석과 같이 ${count}가지를 찾았지만, O(n) 누적합 배열을 만들고 비교를 ${comps}번(정석은 8번) 수행했습니다.`,
    BS_AT.done,
  );
  rec.do(...together([
    { type: 'set', id: 'win', patch: { rect: winRect(9, 9), tone: 'path' } },
    { type: 'set', id: 'tok:cnt', patch: { text: `정답 ${count}가지`, tone: 'path' }, pop: true },
    calcTo(`정답 ${count}가지 (비교 ${comps}번 vs 정석 8번)`),
  ]));

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: 합이 넘쳐도 끝까지 더하는 이중 반복문 (시간 초과)                    */
/* ------------------------------------------------------------------ */

function bruteForce(): Visualization {
  const rec = new StepRecorder(board('start', 'end'));
  let [count, comps] = [0, 0];
  let curS: number | string = '-';
  let curE: number | string = '-';
  const meta = () => ({ work: comps, variables: { start: curS, end: curE, count } });

  rec.step({ title: `초기화: 시작점 1~${TARGET}마다 끝점 ${TARGET}까지 모두 더하기`, codeHighlights: BRUTE_AT.init, ...meta() });
  rec.phase(
    '시작',
    `시작점마다 끝점을 ${TARGET}까지 늘리며 합이 ${TARGET}를 넘어도 멈추지(break) 않고 끝까지 더하면 비교 횟수가 어떻게 불어나는지 봅니다.`,
    BRUTE_AT.init,
  );
  rec.do(...together([
    movePtr(rec, 'l', 0, 1, 'S=1'),
    movePtr(rec, 'r', 1, 1, 'E=1'),
    calcTo('모든 [start..end] 구간 합을 끝까지 계산'),
  ]));

  for (let start = 1; start <= TARGET; start++) {
    let total = 0;
    let hitEnd: number | null = null;
    for (let end = start; end <= TARGET; end++) {
      total += end;
      comps += 1;
      if (total === TARGET) {
        count += 1;
        hitEnd = end;
      }
    }
    const terms = TARGET - start + 1;
    curS = start;
    curE = TARGET;

    rec.step({
      title: `시작 ${start}: ${TARGET}까지 ${terms}번 덧셈 (최종 합 ${total})${hitEnd ? ` → [${start}..${hitEnd}] 찾음` : ''}`,
      codeHighlights: hitEnd ? BRUTE_AT.hit : BRUTE_AT.innerLoop,
      ...meta(),
    });
    rec.phase(
      '끝까지 더하기',
      `${start}부터 ${TARGET}까지 ${terms}개 수를 차례로 다 더합니다. 중간에 합이 ${TARGET}를 넘어도 멈추지 않아 최종 합이 ${total}까지 커졌습니다.`,
      BRUTE_AT.innerLoop,
    );
    rec.do(...together([
      movePtr(rec, 'l', 0, start, `S=${start}`),
      movePtr(rec, 'r', 1, TARGET, `E=${TARGET}`),
      { type: 'set', id: 'win', patch: { rect: winRect(start, TARGET) } },
      ...paintSpan(start, TARGET, hitEnd ? 'good' : 'current'),
      { type: 'set', id: 'tok:sum', patch: { text: `끝까지 합 ${total}` }, pop: true },
      calcTo(`시작 ${start}: ${terms}번 비교 (누적 ${comps}번)`),
    ]));

    rec.phase(
      '판정',
      hitEnd
        ? `도중에 [${start}..${hitEnd}]에서 합 ${TARGET}을 찾았지만(${count}가지), 이후 ${hitEnd + 1}~${TARGET}도 불필요하게 계속 더했습니다.`
        : `합이 ${TARGET}을 훌쩍 넘었는데도 ${TARGET}번 칸까지 끝까지 더했습니다.`,
      hitEnd ? BRUTE_AT.hit : BRUTE_AT.startLoop,
    );
    rec.do(
      { type: 'focus', ids: [cId(start), cId(TARGET)] },
      { type: 'arrow', from: cId(start), to: cId(TARGET), verdict: hitEnd ? 'good' : 'bad', label: `${terms}번 덧셈 (합 ${total})` },
      ...(hitEnd ? [{ type: 'set', id: 'tok:cnt', patch: { text: `찾은 표현 ${count}가지`, tone: 'good' }, pop: true } as Action] : []),
      wait(100),
      ...clear(),
    );
  }

  rec.step({
    title: `시간 초과 위험: 총 ${comps}번 비교 (정석은 8번)`,
    codeHighlights: BRUTE_AT.done,
    ...meta(),
    answer: count,
    isKeyframe: true,
  });
  rec.phase(
    '작업량 비교',
    `답은 ${count}가지로 같지만 n = ${TARGET}에서 ${comps}번(정석은 8번) 비교했습니다. n = 10,000이면 약 5,000만 번 반복해 효율성 테스트에서 시간 초과가 납니다.`,
    BRUTE_AT.done,
  );
  rec.do(...together([
    { type: 'set', id: 'win', patch: { rect: winRect(1, TARGET), tone: 'bad' } },
    { type: 'set', id: 'tok:cnt', patch: { text: `비교 ${comps}번 vs 8번`, tone: 'bad' }, pop: true },
    calcTo('n = 10,000일 때 n(n+1)/2 ≈ 50,005,000번 → 효율성 시간 초과!'),
  ]));

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제 정의                                                            */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'number-expression',
  title: '숫자의 표현',
  level: 2,
  category: 'two-pointer',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12924',
  description: {
    summary:
      '자연수 n이 주어질 때, n을 연속한 자연수들의 합으로 표현하는 방법의 수를 구합니다. 자기 자신 하나로 표현하는 경우(n = n)도 한 가지로 셉니다.',
    rules: [
      'n은 10,000 이하의 자연수',
      '연속된 자연수들의 합이 정확히 n이 되는 경우의 수를 반환',
      '자기 자신(길이 1인 구간)도 유효한 표현에 포함',
    ],
    examples: [{ input: 'n = 15', output: '4' }],
  },
  keyIntuitions: [
    '연속한 자연수 구간 [left..right]의 합이 n보다 작으면 right를 1 늘려 더하고, n 이상이면 left를 1 늘려 빼면 O(n)에 모든 구간을 훑을 수 있습니다.',
    '2개 이상의 연속한 자연수 합은 시작점 left가 n // 2를 넘으면 (n // 2 + 1) + (n // 2 + 2) > n이 되어 절대 n이 될 수 없으므로, 자기 자신(n = n) 1가지를 미리 세고 left ≤ n // 2까지만 보면 절반으로 줄어듭니다.',
    '시작점마다 끝까지 다 더해 보는 O(n²) 이중 반복문은 불필요한 덧셈을 반복해 효율성 테스트에서 시간 초과가 납니다.',
  ],
  demo: {
    input: [TARGET],
    label: `n = ${TARGET}`,
  },
  workUnit: '구간 합을 비교한 횟수',
  approaches: [
    {
      id: 'number-expression-two-pointer',
      name: '연속 합 구간 (투 포인터)',
      rank: 'BEST',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      verdict: '자기 자신을 미리 세고 left ≤ n // 2 범위에서 두 포인터로 구간 합을 늘리고 줄이는 정석 풀이입니다.',
      pros: [
        '이전 구간의 합에서 양 끝 자연수만 더하고 빼므로 중복 덧셈이 전혀 없습니다.',
        '시작점을 n // 2까지만 확인하므로 최대 n번 안팎의 포인터 이동으로 빠르게 끝납니다.',
        '변수 몇 개만 사용해 공간 복잡도가 O(1)입니다.',
      ],
      cons: ['합이 정확히 n일 때도 다음 구간을 찾으려면 left를 한 칸 줄이거나 right를 한 칸 늘려야 합니다.'],
      whyThisRank:
        '연속된 양수 구간 합이라는 문제 구조에 가장 직접적으로 들어맞는 O(n) 시간, O(1) 공간 풀이입니다.',
      code: TWO_POINTER,
      visualize: twoPointer,
    },
    {
      id: 'number-expression-binary-search',
      name: '누적합 + 끝점 이분 탐색',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      verdict: '1부터 i까지의 누적합 배열에서 시작점마다 끝점을 이분 탐색으로 찾는 풀이로, 맞지만 O(n) 메모리와 log n배의 비교가 더 듭니다.',
      pros: [
        '누적합의 차 P[right] − P[left−1] = n을 만족하는 right를 이분 탐색으로 바로 찾을 수 있습니다.',
      ],
      cons: [
        '길이 n + 1의 누적합 배열을 만들어야 해서 O(n) 메모리를 추가로 사용합니다.',
        '시작점마다 이분 탐색을 수행해 O(n log n) 시간이 걸리므로 투 포인터보다 비교 횟수가 많습니다.',
      ],
      whyThisRank:
        '정답은 정확히 구하지만, 연속한 자연수의 합은 양 끝만 옮기면 O(1)에 갱신되므로 배열과 이분 탐색을 쓸 이유가 없습니다.',
      code: BIN_SEARCH,
      visualize: binarySearch,
    },
    {
      id: 'number-expression-brute-force',
      name: '모든 시작점에서 끝까지 더하기 (이중 반복문)',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      verdict: '시작점마다 n까지 모든 끝점을 더해 보면 합이 이미 n을 넘은 뒤에도 계속 더하느라 효율성 테스트에서 시간 초과가 납니다.',
      pros: ['이중 for문만으로 가장 단순하게 작성할 수 있습니다.'],
      cons: [
        '합이 이미 n을 넘어 더 이상 답이 될 수 없는데도 n까지 끝까지 더합니다.',
        '시작점이 바뀔 때마다 이전 구간에서 이미 더했던 수들을 처음부터 다시 더합니다.',
      ],
      whyThisRank:
        '자연수는 더할수록 커진다는 단조성을 무시하고 모든 구간을 다 확인하는 풀이로, 투 포인터를 쓰면 겹치는 구간 합을 그대로 재활용할 수 있습니다.',
      code: BRUTE,
      visualize: bruteForce,
    },
  ],
  checks: {
    cases: [
      { args: [15], expected: 4 },
      { args: [TARGET], expected: 3 },
      { args: [1], expected: 1 },
      { args: [2], expected: 1 },
      { args: [3], expected: 2 },
      { args: [6], expected: 2 },
      { args: [10], expected: 2 },
    ],
    random: (rand) => [1 + Math.floor(rand() * 60)],
  },
};

export default problem;
