// 최솟값 만들기: 정석 A는 오름차순·B는 내림차순 정렬 후 짝짓기, 대안 정렬 없이 매번 min(A)·max(B)를 훑어 뽑기, 함정 두 배열 모두 오름차순 정렬 후 짝짓기를 같은 장면에서 움직인다.
// 장면은 위에 A 배열 칸, 가운데에 B 배열 칸(정렬하면 미끄러져 자리를 바꿈), 아래에 이번 곱셈 표시와 누적합·결과 표시다.
import { grid } from '../../engine/layout.ts';
import type { Action, AlgorithmStep, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

const MS_PER_CHAR = 20;
class PacedRecorder extends StepRecorder {
  private caption = '';
  private acts: Action[] = [];
  private keyframe = false;
  override step(meta: Omit<AlgorithmStep, 'phases' | 'scene'>): void {
    this.settle(false);
    this.keyframe = !!meta.isKeyframe;
    super.step(meta);
  }
  override phase(label: string, caption: string, codeHighlights?: Record<Language, number[]>): void {
    this.settle(true);
    super.phase(label, caption, codeHighlights);
    this.caption = caption;
    this.acts = [];
  }
  override do(...actions: Action[]): void {
    super.do(...actions);
    this.acts.push(...actions);
  }
  override finish() {
    this.settle(false);
    return super.finish();
  }
  private settle(more: boolean): void {
    if (!this.caption) return;
    const hold = more ? PHASE_GAP : this.keyframe ? KEYFRAME_TAIL : STEP_TAIL;
    const plan = planStep({ phases: [{ label: '', caption: '', actions: this.acts }] } as unknown as AlgorithmStep).phases[0];
    const busy = Math.max(0, ...plan.actions.map((a) => a.start + a.duration));
    const need = MS_PER_CHAR * [...this.caption].length - hold - busy;
    this.caption = '';
    if (need > 0 && busy + need > plan.end) super.do({ type: 'wait', ms: Math.ceil(need) });
  }
}

// 시각화 입력. 정석과 대안은 88, 두 배열 모두 오름차순으로 정렬해 곱하는 함정은 151이 나온다.
const A = [4, 1, 7, 2, 6, 3];
const B = [5, 8, 2, 9, 3, 4];
const N = A.length;
const A_ASC_ORDER = A.map((_, i) => i).sort((p, q) => A[p] - A[q] || p - q);
const B_DESC_ORDER = B.map((_, i) => i).sort((p, q) => B[q] - B[p] || p - q);
const B_ASC_ORDER = B.map((_, i) => i).sort((p, q) => B[p] - B[q] || p - q);
const AS = A_ASC_ORDER.map((i) => A[i]);
const BS_DESC = B_DESC_ORDER.map((i) => B[i]);
const BS_ASC = B_ASC_ORDER.map((i) => B[i]);
const TRUTH = AS.reduce((acc, v, i) => acc + v * BS_DESC[i], 0);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const ASC_DESC = {
  python: `def solution(A, B):
    A.sort()                         # 작은 수부터 오름차순
    B.sort(reverse=True)             # 큰 수부터 내림차순
    answer = 0
    for a, b in zip(A, B):
        answer += a * b              # 작은 수와 큰 수를 짝지어 곱한다
    return answer`,
  javascript: `function solution(A, B) {
  A.sort((x, y) => x - y); // 작은 수부터 오름차순
  B.sort((x, y) => y - x); // 큰 수부터 내림차순
  let answer = 0;
  for (let i = 0; i < A.length; i++) {
    answer += A[i] * B[i]; // 작은 수와 큰 수를 짝지어 곱합니다
  }
  return answer;
}`,
};
const BEST_AT = {
  sort: lines(ASC_DESC, ['A.sort()', 'B.sort(reverse=True)'], ['A.sort((x, y) => x - y)', 'B.sort((x, y) => y - x)']),
  init: lines(ASC_DESC, ['answer = 0'], ['let answer = 0']),
  pair: lines(ASC_DESC, ['for a, b in zip(A, B):', 'answer += a * b'], ['for (let i = 0; i < A.length; i++)', 'answer += A[i] * B[i]']),
  done: lines(ASC_DESC, ['return answer'], ['return answer']),
};

const POP_MINMAX = {
  python: `def solution(A, B):
    a_left = list(A)
    b_left = list(B)
    answer = 0
    while a_left:
        # 정렬하지 않고 매번 남은 원소를 전부 훑어 최솟값과 최댓값을 찾는다
        min_a = min(a_left)
        max_b = max(b_left)
        a_left.remove(min_a)
        b_left.remove(max_b)
        answer += min_a * max_b
    return answer`,
  javascript: `function solution(A, B) {
  const aLeft = [...A];
  const bLeft = [...B];
  let answer = 0;
  while (aLeft.length > 0) {
    // 정렬하지 않고 매번 남은 원소를 전부 훑어 최솟값과 최댓값을 찾습니다
    let minIdx = 0;
    let maxIdx = 0;
    for (let i = 1; i < aLeft.length; i++) {
      if (aLeft[i] < aLeft[minIdx]) minIdx = i;
      if (bLeft[i] > bLeft[maxIdx]) maxIdx = i;
    }
    const minA = aLeft.splice(minIdx, 1)[0];
    const maxB = bLeft.splice(maxIdx, 1)[0];
    answer += minA * maxB;
  }
  return answer;
}`,
};
const POP_AT = {
  init: lines(POP_MINMAX, ['a_left = list(A)', 'b_left = list(B)', 'answer = 0'], ['const aLeft = [...A]', 'const bLeft = [...B]', 'let answer = 0']),
  find: lines(POP_MINMAX, ['while a_left:', 'min_a = min(a_left)', 'max_b = max(b_left)'], ['while (aLeft.length > 0)', 'for (let i = 1; i < aLeft.length; i++)']),
  take: lines(POP_MINMAX, ['a_left.remove(min_a)', 'b_left.remove(max_b)', 'answer += min_a * max_b'], ['const minA = aLeft.splice', 'const maxB = bLeft.splice', 'answer += minA * maxB']),
  done: lines(POP_MINMAX, ['return answer'], ['return answer']),
};

const BOTH_ASC_TRAP = {
  python: `def solution(A, B):
    A.sort()
    B.sort()                         # 함정: B도 오름차순으로 정렬해 작은 수끼리, 큰 수끼리 곱한다
    answer = 0
    for a, b in zip(A, B):
        answer += a * b
    return answer  # 큰 수끼리 곱해져 오히려 최댓값이 된다`,
  javascript: `function solution(A, B) {
  A.sort((x, y) => x - y);
  B.sort((x, y) => x - y); // 함정: B도 오름차순으로 정렬해 작은 수끼리, 큰 수끼리 곱합니다
  let answer = 0;
  for (let i = 0; i < A.length; i++) {
    answer += A[i] * B[i];
  }
  return answer; // 큰 수끼리 곱해져 오히려 최댓값이 됩니다
}`,
};
const TRAP_AT = {
  sort: lines(BOTH_ASC_TRAP, ['A.sort()', 'B.sort()'], ['A.sort((x, y) => x - y)', 'B.sort((x, y) => x - y)']),
  init: lines(BOTH_ASC_TRAP, ['answer = 0'], ['let answer = 0']),
  pair: lines(BOTH_ASC_TRAP, ['for a, b in zip(A, B):', 'answer += a * b'], ['for (let i = 0; i < A.length; i++)', 'answer += A[i] * B[i]']),
  done: lines(BOTH_ASC_TRAP, ['return answer'], ['return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 540;
const H = 252;
const rowA = grid({ x: 76, y: 32, rows: 1, cols: N, cell: 56, gap: 8 });
const rowB = grid({ x: 76, y: 120, rows: 1, cols: N, cell: 56, gap: 8 });
const aId = (k: number) => `a:${k}`;
const bId = (k: number) => `b:${k}`;
const sA = (s: number) => aId(A_ASC_ORDER[s]);
const sBDesc = (s: number) => bId(B_DESC_ORDER[s]);
const sBAsc = (s: number) => bId(B_ASC_ORDER[s]);
const PROD_RECT: Rect = { x: 76, y: 196, w: 140, h: 32 };
const SUM_RECT: Rect = { x: 226, y: 196, w: 140, h: 32 };
const TRUTH_RECT: Rect = { x: 376, y: 196, w: 140, h: 32 };

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

function board(): Scene {
  const items: Item[] = [
    { id: 'lab:a', kind: 'text', rect: { x: 6, y: 32, w: 64, h: 56 }, text: '배열 A' },
    { id: 'lab:b', kind: 'text', rect: { x: 6, y: 120, w: 64, h: 56 }, text: '배열 B' },
    { id: 'lab:res', kind: 'text', rect: { x: 6, y: 196, w: 64, h: 32 }, text: '누적합' },
    { id: 'tok:prod', kind: 'token', rect: PROD_RECT, tone: 'plain', text: '곱셈 전' },
    { id: 'tok:sum', kind: 'token', rect: SUM_RECT, tone: 'plain', text: '합 = 0' },
  ];
  A.forEach((v, k) => items.push({ id: aId(k), kind: 'cell', rect: rowA(0, k), tone: 'plain', text: String(v) }));
  B.forEach((v, k) => items.push({ id: bId(k), kind: 'cell', rect: rowB(0, k), tone: 'plain', text: String(v) }));
  return { width: W, height: H, items };
}

/* ------------------------------------------------------------------ */
/* 정석 A 오름차순 · B 내림차순 정렬 후 짝짓기                           */
/* ------------------------------------------------------------------ */

function ascDescViz(): Visualization {
  const rec = new PacedRecorder(board());
  let [answer, work] = [0, 0];
  const meta = (a: number | '-' = '-', b: number | '-' = '-', prod: number | '-' = '-') => ({
    work,
    variables: { a, b, prod, answer },
  });

  rec.step({ title: 'A는 오름차순, B는 내림차순으로 정렬', codeHighlights: BEST_AT.sort, ...meta() });
  rec.phase('정렬하기', '큰 수가 큰 수와 곱해지지 않도록 A는 작은 수부터(오름차순), B는 큰 수부터(내림차순) 정렬합니다.', BEST_AT.sort);
  rec.do(...together([
    ...A_ASC_ORDER.map((k, s): Action => ({ type: 'set', id: aId(k), patch: { rect: rowA(0, s) } })),
    ...B_DESC_ORDER.map((k, s): Action => ({ type: 'set', id: bId(k), patch: { rect: rowB(0, s) } })),
  ]), wait(250));

  rec.step({ title: 'answer = 0에서 시작', codeHighlights: BEST_AT.init, ...meta() });
  rec.phase('초기화', '같은 자리(i = 0..5)끼리 차례로 곱해 누적합 answer에 더합니다.', BEST_AT.init);
  rec.do({ type: 'set', id: 'tok:sum', patch: { text: '합 = 0', tone: 'chosen' }, pop: true });

  for (let s = 0; s < N; s++) {
    const [av, bv] = [AS[s], BS_DESC[s]];
    const prod = av * bv;
    answer += prod;
    work++;

    rec.step({ title: `${s + 1}번째 짝: ${av} × ${bv} = ${prod} (누적 ${answer})`, codeHighlights: BEST_AT.pair, ...meta(av, bv, prod) });
    rec.phase('짝지어 곱하기', `A에서 ${s + 1}번째로 작은 ${josa(av, '과', '와')} B에서 ${s + 1}번째로 큰 ${josa(bv, '을', '를')} 곱하면 ${prod}입니다.`, BEST_AT.pair);
    rec.do(...together([
      { type: 'focus', ids: [sA(s), sBDesc(s)] },
      paint(sA(s), 'current'),
      paint(sBDesc(s), 'current'),
      { type: 'set', id: 'tok:prod', patch: { text: `${av} × ${bv} = ${prod}`, tone: 'chosen' }, pop: true },
    ]));
    rec.do({ type: 'arrow', from: sA(s), to: sBDesc(s), verdict: 'good', label: `× = ${prod}` }, wait(180));

    rec.phase('누적하기', `누적합이 ${answer - prod} + ${prod} = ${ro(answer)} 갱신됩니다.`, BEST_AT.pair);
    rec.do(...clear(
      paint(sA(s), 'visited'),
      paint(sBDesc(s), 'visited'),
      { type: 'set', id: 'tok:sum', patch: { text: `합 = ${answer}`, tone: 'chosen' }, pop: true },
    ));
  }

  rec.step({ title: `최소 누적합 완성: ${answer}`, codeHighlights: BEST_AT.done, ...meta('-', '-', '-'), answer, isKeyframe: true });
  rec.phase('정답', `큰 수를 가장 작은 수로 눌러 주어 최소 누적합 ${josa(answer, '을', '를')} 얻었습니다.`, BEST_AT.done);
  rec.do(...together([
    ...A_ASC_ORDER.map((k): Action => paint(aId(k), 'path')),
    ...B_DESC_ORDER.map((k): Action => paint(bId(k), 'path')),
    { type: 'set', id: 'tok:sum', patch: { text: `정답 ${answer}`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 정렬 없이 매번 min(A) · max(B)를 훑어 뽑기                        */
/* ------------------------------------------------------------------ */

function popMinMaxViz(): Visualization {
  const rec = new PacedRecorder(board());
  const usedA = Array<boolean>(N).fill(false);
  const usedB = Array<boolean>(N).fill(false);
  let [answer, work] = [0, 0];
  const meta = (minA: number | '-' = '-', maxB: number | '-' = '-', left = N) => ({
    work,
    variables: { minA, maxB, left, answer },
  });

  rec.step({ title: '정렬하지 않고 남은 배열 복사', codeHighlights: POP_AT.init, ...meta() });
  rec.phase('초기화', '정렬을 하지 않는 대신, 매번 남은 원소를 처음부터 끝까지 훑어 A의 최솟값과 B의 최댓값을 찾아냅니다.', POP_AT.init);
  rec.do({ type: 'set', id: 'tok:prod', patch: { text: '매번 min·max 탐색', tone: 'chosen' }, pop: true });

  for (let round = 0; round < N; round++) {
    const remA = A.map((_, k) => k).filter((k) => !usedA[k]);
    const remB = B.map((_, k) => k).filter((k) => !usedB[k]);
    work += remA.length;
    let minK = remA[0];
    let maxK = remB[0];
    for (const k of remA) if (A[k] < A[minK]) minK = k;
    for (const k of remB) if (B[k] > B[maxK]) maxK = k;
    usedA[minK] = true;
    usedB[maxK] = true;
    const [av, bv] = [A[minK], B[maxK]];
    const prod = av * bv;
    answer += prod;

    rec.step({
      title: `${round + 1}회차(남은 ${remA.length}개 스캔): min(A)=${av} × max(B)=${bv}`,
      codeHighlights: POP_AT.take,
      ...meta(av, bv, remA.length - 1),
    });
    rec.phase('최솟값·최댓값 찾기', `남은 ${remA.length}개 원소를 모두 확인해 A의 최솟값 ${josa(av, '과', '와')} B의 최댓값 ${josa(bv, '을', '를')} 찾습니다.`, POP_AT.find);
    rec.do(...together([
      { type: 'focus', ids: [...remA.map(aId), ...remB.map(bId)] },
      paint(aId(minK), 'current'),
      paint(bId(maxK), 'current'),
      { type: 'set', id: 'tok:prod', patch: { text: `${av} × ${bv} = ${prod}`, tone: 'chosen' }, pop: true },
    ]));
    rec.do({ type: 'arrow', from: aId(minK), to: bId(maxK), verdict: 'good', label: `× = ${prod}` }, wait(180));

    rec.phase('꺼내고 더하기', `두 원소를 배열에서 지우고(remove/splice) 누적합을 ${ro(answer)} 갱신합니다.`, POP_AT.take);
    rec.do(...clear(
      paint(aId(minK), 'visited'),
      paint(bId(maxK), 'visited'),
      { type: 'set', id: 'tok:sum', patch: { text: `합 = ${answer}`, tone: 'chosen' }, pop: true },
    ));
  }

  rec.step({ title: `최소 누적합 완성: ${answer} (원소 확인 ${work}회)`, codeHighlights: POP_AT.done, ...meta('-', '-', 0), answer, isKeyframe: true });
  rec.phase('정답', `답은 ${ro(answer)} 같지만, 매번 남은 원소를 다시 훑고 배열 중간을 지우느라 ${work}번 확인했습니다(정석은 정렬 후 ${N}번).`, POP_AT.done);
  rec.do(...together([
    ...A.map((_, k): Action => paint(aId(k), 'path')),
    ...B.map((_, k): Action => paint(bId(k), 'path')),
    { type: 'set', id: 'tok:sum', patch: { text: `정답 ${answer}`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 두 배열 모두 오름차순으로 정렬해 곱하기                           */
/* ------------------------------------------------------------------ */

function bothAscTrapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let [answer, work] = [0, 0];
  const meta = (a: number | '-' = '-', b: number | '-' = '-', prod: number | '-' = '-') => ({
    work,
    variables: { a, b, prod, answer },
  });

  rec.step({ title: 'A와 B를 모두 오름차순으로 정렬', codeHighlights: TRAP_AT.sort, ...meta() });
  rec.phase('같은 방향 정렬', '"작은 수끼리 곱하면 작아지겠지"라고 생각해 A와 B를 둘 다 오름차순으로 정렬합니다.', TRAP_AT.sort);
  rec.do(...together([
    ...A_ASC_ORDER.map((k, s): Action => ({ type: 'set', id: aId(k), patch: { rect: rowA(0, s) } })),
    ...B_ASC_ORDER.map((k, s): Action => ({ type: 'set', id: bId(k), patch: { rect: rowB(0, s) } })),
  ]), wait(250));

  rec.step({ title: 'answer = 0에서 시작', codeHighlights: TRAP_AT.init, ...meta() });
  rec.phase('초기화', '같은 순위끼리 차례로 곱해 봅니다.', TRAP_AT.init);
  rec.do({ type: 'set', id: 'tok:sum', patch: { text: '합 = 0', tone: 'chosen' }, pop: true });

  for (let s = 0; s < N; s++) {
    const [av, bv] = [AS[s], BS_ASC[s]];
    const prod = av * bv;
    const big = s >= N - 2;
    answer += prod;
    work++;

    rec.step({ title: `${s + 1}번째 짝: ${av} × ${bv} = ${prod} (누적 ${answer})`, codeHighlights: TRAP_AT.pair, ...meta(av, bv, prod) });
    rec.phase('짝지어 곱하기', big
      ? `뒤쪽으로 갈수록 큰 수끼리 남아서 ${av} × ${bv} = ${josa(prod, '이', '가')} 되어 곱이 폭발합니다!`
      : `앞쪽에서는 작은 수끼리 만나 ${av} × ${bv} = ${ro(prod)} 작아 보입니다.`, TRAP_AT.pair);
    rec.do(...together([
      { type: 'focus', ids: [sA(s), sBAsc(s)] },
      paint(sA(s), big ? 'bad' : 'current'),
      paint(sBAsc(s), big ? 'bad' : 'current'),
      { type: 'set', id: 'tok:prod', patch: { text: `${av} × ${bv} = ${prod}`, tone: big ? 'bad' : 'chosen' }, pop: true },
    ]));
    rec.do({ type: 'arrow', from: sA(s), to: sBAsc(s), verdict: big ? 'bad' : 'seen', label: `× = ${prod}` }, wait(180));

    rec.phase('누적하기', `누적합이 ${ro(answer)} 불어납니다.`, TRAP_AT.pair);
    rec.do(...clear(
      paint(sA(s), big ? 'bad' : 'explored'),
      paint(sBAsc(s), big ? 'bad' : 'explored'),
      { type: 'set', id: 'tok:sum', patch: { text: `합 = ${answer}`, tone: big ? 'bad' : 'chosen' }, pop: true },
    ));
  }

  rec.step({ title: `이 방법 ${answer}, 정답은 ${TRUTH}`, codeHighlights: TRAP_AT.done, ...meta('-', '-', '-'), answer, isKeyframe: true });
  rec.phase('오답 확인', `둘 다 오름차순으로 정렬하면 큰 수끼리 곱해져 최대 누적합(${answer})이 됩니다. 최솟값은 반대 방향으로 짝지은 ${TRUTH}입니다.`, TRAP_AT.done);
  rec.do(...together([
    { type: 'set', id: 'tok:sum', patch: { text: `이 방법 ${answer}`, tone: 'bad' }, pop: true },
    { type: 'add', item: { id: 'tok:truth', kind: 'token', rect: TRUTH_RECT, tone: 'good', text: `정답 ${TRUTH}` } },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'min-sum',
  title: '최솟값 만들기',
  level: 2,
  category: 'sort',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12941',
  description: {
    summary:
      '길이가 같은 두 배열 A, B에서 각각 숫자를 하나씩 뽑아 곱한 값을 배열 길이만큼 누적해 더합니다. 한 번 뽑은 숫자는 다시 뽑을 수 없을 때, 최종 누적합의 최솟값을 구합니다.',
    rules: [
      '배열 A, B의 크기는 1,000 이하의 자연수',
      '배열 A, B의 원소는 1,000 이하의 자연수',
      '한 번 뽑은 원소는 다시 뽑을 수 없음',
    ],
    examples: [
      { input: 'A = [1, 4, 2], B = [5, 4, 4]', output: '29' },
      { input: 'A = [1, 2], B = [3, 4]', output: '10' },
    ],
  },
  keyIntuitions: [
    '큰 수가 큰 수와 곱해지면 누적합이 크게 뛰므로, 한 배열의 큰 수는 반드시 다른 배열의 작은 수와 짝지어야 합니다(재배열 부등식).',
    'A를 오름차순, B를 내림차순으로 정렬한 뒤 같은 인덱스끼리 곱해 더하면 항상 최솟값이 됩니다.',
    '같은 방향으로 정렬해 곱하면 최솟값이 아니라 최댓값이 나옵니다.',
  ],
  demo: { input: [A, B], label: 'A = [4, 1, 7, 2, 6, 3], B = [5, 8, 2, 9, 3, 4]' },
  workUnit: '원소 짝을 확인한 횟수',
  approaches: [
    {
      id: 'min-sum-asc-desc',
      name: 'A 오름차순 · B 내림차순 정렬 후 짝짓기',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: 'A는 오름차순, B는 내림차순으로 정렬해 같은 자리끼리 곱해 더하는 O(N log N) 정석 풀이입니다.',
      pros: [
        '정렬 한 번 뒤에는 선형 스캔(O(N))으로 바로 답이 나옵니다.',
        '재배열 부등식에 의해 어떤 입력에서도 최솟값임이 수학적으로 보장됩니다.',
      ],
      cons: ['JavaScript에서 sort()에 비교 함수를 생략하면 문자열 사전 순으로 정렬되므로 (x, y) => x - y를 꼭 적어야 합니다.'],
      whyThisRank:
        '정렬 후 한 번 훑기만 하면 되므로 시간과 공간 모두 최적이며 코드도 가장 간결합니다.',
      code: ASC_DESC,
      visualize: ascDescViz,
    },
    {
      id: 'min-sum-pop-minmax',
      name: '정렬 없이 매번 min(A) · max(B)를 찾아 꺼내기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '정렬하지 않고 매 회차마다 남은 배열을 끝까지 훑어 최솟값과 최댓값을 찾아 지우는 O(N²) 풀이입니다.',
      pros: [
        '"가장 작은 A와 가장 큰 B를 짝짓는다"는 규칙을 그대로 옮긴 코드입니다.',
        '정석과 같은 정답을 냅니다.',
      ],
      cons: [
        '매번 남은 원소를 전부 훑어 최솟값·최댓값을 찾고 중간 원소를 삭제(remove/splice)하므로 O(N²) 시간이 듭니다.',
      ],
      whyThisRank:
        '한 번 정렬해 두면 O(1)에 꺼낼 수 있는 최솟값·최댓값을 매번 선형 탐색으로 다시 찾아 비교 횟수가 늘어납니다.',
      code: POP_MINMAX,
      visualize: popMinMaxViz,
    },
    {
      id: 'min-sum-both-asc',
      name: '두 배열 모두 오름차순 정렬 후 곱하기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '작은 수끼리 곱하면 작아질 것이라 착각해 두 배열을 모두 오름차순으로 정렬하는 함정으로, 뒤쪽에서 큰 수끼리 곱해져 최댓값이 됩니다.',
      pros: ['앞쪽 첫 짝의 곱은 가장 작게 나와서 그럴듯해 보입니다.'],
      cons: [
        '작은 수를 작은 수끼리 써 버리면 뒤에 남은 큰 수들은 큰 수끼리 곱해져 전체 합이 오히려 최대가 됩니다.',
      ],
      whyThisRank:
        '재배열 부등식에서 같은 방향 정렬은 최댓값, 반대 방향 정렬이 최솟값을 만듭니다.',
      code: BOTH_ASC_TRAP,
      visualize: bothAscTrapViz,
    },
  ],
  checks: {
    cases: [
      { args: [[1, 4, 2], [5, 4, 4]], expected: 29 },
      { args: [[1, 2], [3, 4]], expected: 10 },
      { args: [[5], [7]], expected: 35 },
      { args: [[1, 1, 1], [2, 3, 4]], expected: 9 },
      { args: [A, B], expected: TRUTH },
    ],
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 8);
      const gen = () => Array.from({ length: n }, () => 1 + Math.floor(rand() * 20));
      return [gen(), gen()];
    },
  },
};

export default problem;
