// 연속 펄스 부분 수열의 합: 정석 칸마다 끝나는 최대 합(최대 부분합), 대안 앞쪽 합 중 가장 작은 값을 빼기, 함정 모든 부분 수열의 합 구하기를 같은 장면에서 움직인다.
// 장면은 위 줄에 펄스를 곱한 값, 아래 줄에 풀이마다 다른 값(cur / prefix / total), 맨 아래 계산 글과 가장 큰 합 표시이다.
import type { Action, Item, ItemPatch, Language, Problem, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

// 시각화 입력: 원문 예제의 앞 여섯 칸. 펄스 [-1, 1, -1 …]을 곱하면 3, 6, 1이 이어져 10이 된다
const SEQ = [2, 3, -6, 1, 3, -1];
const N = SEQ.length;
const SIGNS = [1, -1]; // 펄스가 +1로 시작하는 경우와 -1로 시작하는 경우
const xsOf = (sign: number) => SEQ.map((v, i) => (i % 2 === 0 ? v : -v) * sign);
const num = (v: number) => String(v).replace('-', '−'); // 마이너스는 글자 폭이 넉넉한 − 로 쓴다
const term = (v: number) => (v < 0 ? `(${num(v)})` : String(v));
const sumFor = (xs: number[], from: number, to: number) => xs.slice(from, to + 1).reduce((a, b) => a + b, 0);

// 정답과 그 값을 만드는 구간(점검과 마지막 자막용)
const BEST_RUN = (() => {
  let best = { value: 0, sign: 1, from: 0, to: 0 };
  for (const sign of SIGNS) {
    const xs = xsOf(sign);
    for (let a = 0; a < N; a++) for (let b = a; b < N; b++) if (sumFor(xs, a, b) > best.value) best = { value: sumFor(xs, a, b), sign, from: a, to: b };
  }
  return best;
})();
const PAIRS = (N * (N + 1)) / 2; // 펄스 하나에서 고를 수 있는 구간 수

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const KADANE = {
  python: `def solution(sequence):
    best = 0
    for sign in (1, -1):  # 펄스가 +1로 시작하는 경우와 -1로 시작하는 경우
        cur = 0  # 지금 칸에서 끝나는 가장 큰 부분합
        for i, v in enumerate(sequence):
            x = v * sign if i % 2 == 0 else -v * sign  # 펄스를 곱한 값
            cur = max(x, cur + x)  # 새로 시작하거나, 앞의 부분합에 이어 붙이거나
            best = max(best, cur)
    return best`,
  javascript: `function solution(sequence) {
  let best = 0;
  for (const sign of [1, -1]) { // 펄스가 +1로 시작하는 경우와 -1로 시작하는 경우
    let cur = 0; // 지금 칸에서 끝나는 가장 큰 부분합
    for (let i = 0; i < sequence.length; i++) {
      const x = i % 2 === 0 ? sequence[i] * sign : -sequence[i] * sign; // 펄스를 곱한 값
      cur = Math.max(x, cur + x); // 새로 시작하거나, 앞의 부분합에 이어 붙이거나
      best = Math.max(best, cur);
    }
  }
  return best;
}`,
};
const KADANE_AT = {
  start: lines(KADANE, ['best = 0'], ['let best = 0']),
  pulse: lines(KADANE, ['for sign in (1, -1)', 'cur = 0'], ['for (const sign of [1, -1])', 'let cur = 0']),
  look: lines(KADANE, ['for i, v in enumerate(sequence)', 'x = v * sign', 'cur = max(x, cur + x)'], ['for (let i = 0', 'const x = i % 2 === 0', 'cur = Math.max(x, cur + x)']),
  pick: lines(KADANE, ['cur = max(x, cur + x)', 'best = max(best, cur)'], ['cur = Math.max(x, cur + x)', 'best = Math.max(best, cur)']),
  done: lines(KADANE, ['return best'], ['return best']),
};

const PREFIX = {
  python: `def solution(sequence):
    best = 0
    for sign in (1, -1):  # 펄스가 +1로 시작하는 경우와 -1로 시작하는 경우
        prefix = 0  # 앞에서부터 펄스를 곱해 더한 합 P
        lowest = 0  # 지금까지의 P 중 가장 작은 값 (처음의 0 포함)
        for i, v in enumerate(sequence):
            prefix += v * sign if i % 2 == 0 else -v * sign
            best = max(best, prefix - lowest)  # P에서 가장 작은 앞쪽 P를 빼면 그 사이 구간의 합
            lowest = min(lowest, prefix)
    return best`,
  javascript: `function solution(sequence) {
  let best = 0;
  for (const sign of [1, -1]) { // 펄스가 +1로 시작하는 경우와 -1로 시작하는 경우
    let prefix = 0; // 앞에서부터 펄스를 곱해 더한 합 P
    let lowest = 0; // 지금까지의 P 중 가장 작은 값 (처음의 0 포함)
    for (let i = 0; i < sequence.length; i++) {
      prefix += i % 2 === 0 ? sequence[i] * sign : -sequence[i] * sign;
      best = Math.max(best, prefix - lowest); // P에서 가장 작은 앞쪽 P를 빼면 그 사이 구간의 합
      lowest = Math.min(lowest, prefix);
    }
  }
  return best;
}`,
};
const PREFIX_AT = {
  start: lines(PREFIX, ['best = 0'], ['let best = 0']),
  pulse: lines(PREFIX, ['for sign in (1, -1)', 'prefix = 0', 'lowest = 0'], ['for (const sign of [1, -1])', 'let prefix = 0', 'let lowest = 0']),
  grow: lines(PREFIX, ['for i, v in enumerate(sequence)', 'prefix += v * sign'], ['for (let i = 0', 'prefix += i % 2 === 0']),
  cand: lines(PREFIX, ['best = max(best, prefix - lowest)'], ['best = Math.max(best, prefix - lowest)']),
  low: lines(PREFIX, ['lowest = min(lowest, prefix)'], ['lowest = Math.min(lowest, prefix)']),
  done: lines(PREFIX, ['return best'], ['return best']),
};

const BRUTE = {
  python: `# 주의: 모든 구간의 합을 하나씩 구하는 풀이는 길이 500,000에서 끝나지 않습니다
def solution(sequence):
    n = len(sequence)
    best = 0
    for sign in (1, -1):  # 펄스가 +1로 시작하는 경우와 -1로 시작하는 경우
        for start in range(n):
            total = 0  # start칸부터 end칸까지의 합
            for end in range(start, n):
                total += sequence[end] * sign if end % 2 == 0 else -sequence[end] * sign
                best = max(best, total)
    return best`,
  javascript: `// 주의: 모든 구간의 합을 하나씩 구하는 풀이는 길이 500,000에서 끝나지 않습니다
function solution(sequence) {
  const n = sequence.length;
  let best = 0;
  for (const sign of [1, -1]) { // 펄스가 +1로 시작하는 경우와 -1로 시작하는 경우
    for (let start = 0; start < n; start++) {
      let total = 0; // start칸부터 end칸까지의 합
      for (let end = start; end < n; end++) {
        total += end % 2 === 0 ? sequence[end] * sign : -sequence[end] * sign;
        best = Math.max(best, total);
      }
    }
  }
  return best;
}`,
};
const BRUTE_AT = {
  start: lines(BRUTE, ['n = len(sequence)', 'best = 0'], ['const n = sequence.length', 'let best = 0']),
  pulse: lines(BRUTE, ['for sign in (1, -1)'], ['for (const sign of [1, -1])']),
  from: lines(BRUTE, ['for start in range(n)', 'total = 0'], ['for (let start = 0', 'let total = 0']),
  sums: lines(BRUTE, ['for end in range(start, n)', 'total += sequence[end] * sign'], ['for (let end = start', 'total += end % 2 === 0']),
  best: lines(BRUTE, ['best = max(best, total)'], ['best = Math.max(best, total)']),
  done: lines(BRUTE, ['return best'], ['return best']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 이름표는 맨 왼쪽 0~56, 칸은 x 62부터. 위 줄(곱한 값)은 y 24, 아래 줄은 y 100(두 줄 사이 22px: 판정 표시 11px이 위 줄과 겹치지 않는다).
// 대안의 아래 줄은 처음의 0 칸 때문에 한 칸 더 길다. 계산 글은 맨 아래, 오른쪽에 가장 큰 합 표시.
const X0 = 62;
const PITCH = 62;
const A_Y = 24;
const B_Y = 100;
const CALC_Y = B_Y + 54 + 18;
const HEIGHT = CALC_Y + 28;
const aId = (i: number) => `a:${i}`;
const bId = (i: number) => `b:${i}`;
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'clearMarks' }, { type: 'unfocus' }]);
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });
const setItem = (id: string, patch: ItemPatch, pop = false): Action => ({ type: 'set', id, patch, ...(pop ? { pop } : {}) });
const paint = (id: string, tone: Tone) => setItem(id, { tone });
const bestTo = (best: number): Action => setItem('best', { text: `가장 큰 합 ${num(best)}` }, true);
const focus = (...ids: string[]): Action => ({ type: 'focus', ids });
const look = (from: string, to: string, good: boolean, label: string): Action => ({ type: 'arrow', from, to, verdict: good ? 'good' : 'seen', label });

// 자막이 글자당 20ms 이상 보이도록(마디가 끝난 뒤 다음 자막이 뜰 때까지 포함), 한 단계가 2초 이상 가도록 마디 끝에 기다림을 더한다
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

interface Look { rowLabel: string; offsetB: number }
// 세 풀이가 같이 쓰는 장면: 위 줄(처음엔 원래 수열), 아래 줄(비어 있음), 줄 이름표, 계산 글, 가장 큰 합 표시. 대안은 아래 줄이 한 칸 더 길다(처음의 0)
function board(opts: Look): Scene {
  const items: Item[] = [
    { id: 'label:a', kind: 'text', rect: { x: 0, y: A_Y, w: 56, h: 54 }, tone: 'muted', text: '곱한 값' },
    { id: 'label:b', kind: 'text', rect: { x: 0, y: B_Y, w: 56, h: 54 }, tone: 'muted', text: opts.rowLabel },
  ];
  const shift = opts.offsetB;
  for (let i = 0; i < N; i++) items.push({ id: aId(i), kind: 'cell', rect: { x: X0 + (i + shift) * PITCH, y: A_Y, w: 54, h: 54 }, tone: 'plain', text: num(SEQ[i]) });
  for (let i = 0; i < N + shift; i++) items.push({ id: bId(i), kind: 'cell', rect: { x: X0 + i * PITCH, y: B_Y, w: 54, h: 54 }, tone: 'plain', text: '' });
  const width = X0 + (N + shift) * PITCH;
  items.push(
    { id: 'calc', kind: 'text', rect: { x: 0, y: CALC_Y, w: width - 136, h: 28 }, text: '' },
    { id: 'best', kind: 'token', rect: { x: width - 128, y: CALC_Y, w: 120, h: 28 }, tone: 'chosen', text: '가장 큰 합 0' },
  );
  return { width, height: HEIGHT, items };
}
// 두 번째 펄스를 시작하기 전에 두 줄을 처음 모습으로 돌린다
const resetRows = (cols: number): Action[] => [
  ...Array.from({ length: cols }, (_, i) => setItem(bId(i), { text: '', tone: 'plain', tag: '' })),
  ...Array.from({ length: N }, (_, i) => setItem(aId(i), { tone: 'plain', sub: '' })),
];

type Meta = () => { work: number; variables: Record<string, string | number> };
// 펄스 하나를 시작하는 단계: 펄스를 정하고 위 줄 값을 펄스를 곱한 값으로 바꾼다
function pulseStep(rec: StepRecorder, sign: number, k: number, at: Record<Language, number[]>, metaOf: Meta, head: Action[], extra?: () => void) {
  const xs = xsOf(sign);
  const pulse = SEQ.map((_, i) => num(i % 2 === 0 ? sign : -sign)).join(', ');
  rec.step({ title: `펄스 ${k + 1}: ${sign > 0 ? '+1' : '−1'}로 시작`, codeHighlights: at, ...metaOf() });
  rec.phase('펄스 정하기', `${k ? '이번에는 ' : ''}펄스 [${pulse}, …]를 곱해 봅니다. ${sign > 0 ? '+1' : '−1'}로 시작하는 펄스입니다.`, at);
  rec.do(...together([...head, calcTo(`펄스 ${pulse}`)]));
  rec.phase('곱하기', `수열의 각 칸에 펄스를 곱하면 ${xs.slice(0, -1).map(num).join(', ')}, ${josa(num(xs.at(-1)!), '이', '가')} 됩니다. 이 수열에서 구간을 고릅니다.`, at);
  rec.do(...together(xs.map((x, i) => setItem(aId(i), { text: num(x), sub: `×${num(i % 2 === 0 ? sign : -sign)}` }, true))));
  extra?.();
}
const finish = (rec: StepRecorder, at: Record<Language, number[]>, metaOf: Meta, best: number, caption: string) => {
  rec.step({ title: `답: 가장 큰 합 ${num(best)}`, codeHighlights: at, ...metaOf(), answer: best, isKeyframe: true });
  rec.phase('답', caption);
  rec.do(...together([{ type: 'set', id: 'best', patch: { tone: 'path' } }, calcTo(`가장 큰 합 = ${num(best)}`)]));
};

/* ------------------------------------------------------------------ */
/* 정석 칸마다 끝나는 최대 합: 후보 보기 → 고르기                           */
/* ------------------------------------------------------------------ */

const SHARED_START = '수열의 연속한 구간을 골라 펄스(1과 −1이 번갈아 나오는 수열)를 곱해 더한 값의 최댓값을 구합니다.';

function kadane(): Visualization {
  const rec = new StepRecorder(board({ rowLabel: 'cur', offsetB: 0 }));
  let best = 0;
  let work = 0;
  const now = { sign: '-' as number | string, i: '-' as number | string, x: '-' as number | string, cur: '-' as number | string };
  const meta: Meta = () => ({ work, variables: { sign: now.sign, i: now.i, x: now.x, cur: now.cur, best } });

  rec.step({ title: 'best = 0으로 시작', codeHighlights: KADANE_AT.start, ...meta() });
  rec.phase('시작', `${SHARED_START} 길이 ${N}의 수열입니다.`);
  rec.do(calcTo('펄스를 곱한 구간의 최대 합'));
  rec.phase('규칙', '펄스는 +1로 시작하는 것과 −1로 시작하는 것 두 가지뿐입니다. 곱한 수열마다 최대 부분합을 구해 더 큰 쪽을 답으로 합니다.');
  rec.do(calcTo('최대 부분합을 두 번 구한다'));

  SIGNS.forEach((sign, k) => {
    const xs = xsOf(sign);
    now.sign = sign;
    now.i = now.x = now.cur = '-';
    pulseStep(rec, sign, k, KADANE_AT.pulse, meta, k ? resetRows(N) : []);
    let cur = 0;
    let lit: string | undefined; // 노란 칸(바로 전에 고른 칸)
    for (let i = 0; i < N; i++) {
      const x = xs[i];
      const prev = cur;
      const ext = prev + x;
      cur = Math.max(x, ext);
      const grew = cur > best;
      const settling = lit ? [paint(lit, 'visited')] : [];
      if (grew) best = cur;
      now.i = i;
      now.x = x;
      now.cur = cur;
      work++;
      lit = bId(i);
      const pick = i === 0 ? `첫 칸이라 cur = ${num(cur)}입니다.` : x > ext ? `새로 시작하는 ${josa(num(x), '이', '가')} 더 커서 cur = ${num(cur)}입니다.` : ext > x ? `이어 붙인 ${josa(num(ext), '이', '가')} 더 커서 cur = ${num(cur)}입니다.` : `둘이 같아 cur = ${num(cur)}입니다.`;

      rec.step({ title: `${i}번 칸: cur = max(${num(x)}, ${num(prev)} + ${term(x)}) = ${num(cur)}`, codeHighlights: KADANE_AT.pick, ...meta() });
      rec.phase('후보 보기', i === 0
        ? `${i}번 칸은 첫 칸이라 ${num(x)}에서 새로 시작합니다.`
        : `새로 시작하면 ${num(x)}, 앞의 합 ${num(prev)}에 이어 붙이면 ${num(prev)} + ${term(x)} = ${num(ext)}입니다.`, KADANE_AT.look);
      rec.do(...together([...settling, paint(bId(i), 'current'), focus(bId(i), aId(i), ...(i ? [bId(i - 1)] : [])), calcTo(i ? `max(${num(x)}, ${num(ext)})` : `max(${num(x)}, ${num(x)})`)]));
      rec.do(look(bId(i), aId(i), x >= ext || i === 0, num(x)), ...(i ? [look(bId(i), bId(i - 1), ext >= x, num(ext))] : []), wait(300));
      rec.phase('고르기', `${pick}${grew ? ` 가장 큰 합도 ${ro(num(cur))} 바뀝니다.` : ''}`, KADANE_AT.pick);
      rec.do(...together([setItem(bId(i), { text: num(cur) }, true), calcTo(`cur = ${num(cur)}`)]), ...(grew ? [bestTo(best)] : []), wait(300), ...clear());
    }
  });

  finish(rec, KADANE_AT.done, meta, best, `두 펄스 중 더 큰 최대 부분합은 ${num(best)}입니다. 원래 수열의 ${BEST_RUN.from}번~${BEST_RUN.to}번 칸에 ${BEST_RUN.sign > 0 ? '+1' : '−1'}로 시작하는 펄스를 곱한 구간입니다.`);
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 앞쪽 합 중 가장 작은 값 빼기: 합 늘리기 → 빼 보기 → 최솟값 갱신        */
/* ------------------------------------------------------------------ */

function prefixMin(): Visualization {
  const rec = new StepRecorder(board({ rowLabel: 'prefix', offsetB: 1 }));
  let best = 0;
  let work = 0;
  const now = { sign: '-' as number | string, i: '-' as number | string, prefix: '-' as number | string, lowest: '-' as number | string };
  const meta: Meta = () => ({ work, variables: { sign: now.sign, i: now.i, prefix: now.prefix, lowest: now.lowest, best } });

  rec.step({ title: 'best = 0으로 시작', codeHighlights: PREFIX_AT.start, ...meta() });
  rec.phase('시작', `${SHARED_START} 길이 ${N}의 수열입니다.`);
  rec.do(calcTo('펄스를 곱한 구간의 최대 합'));
  rec.phase('규칙', '앞에서부터 더한 합 P를 적으면 구간의 합은 P의 차입니다. j칸까지의 P에서 앞쪽 P 중 가장 작은 값을 빼면 j칸에서 끝나는 가장 큰 합입니다.');
  rec.do(calcTo('구간의 합 = P[끝] − P[앞쪽]'));

  SIGNS.forEach((sign, k) => {
    const xs = xsOf(sign);
    now.sign = sign;
    now.i = '-';
    now.prefix = 0;
    now.lowest = 0;
    pulseStep(rec, sign, k, PREFIX_AT.pulse, meta, k ? resetRows(N + 1) : [], () => {
      // 처음의 0 칸: 아무 칸도 더하지 않은 합이 지금까지 가장 작은 P
      rec.phase('처음 값', '아무 칸도 더하지 않은 합 0이 P의 처음 값이고, 지금까지 가장 작은 P입니다.', PREFIX_AT.pulse);
      rec.do(...together([setItem(bId(0), { text: '0', tag: '최소', tone: 'chosen' }, true), calcTo('P = 0, 최소 = 0')]));
    });
    let prefix = 0;
    let lowest = 0;
    let lowAt = 0;
    let lit: string | undefined;
    for (let i = 0; i < N; i++) {
      const x = xs[i];
      const previous = prefix;
      const lowBefore = lowest;
      const lowAtBefore = lowAt;
      prefix += x;
      const candidate = prefix - lowBefore;
      const grew = candidate > best;
      if (grew) best = candidate;
      const newLow = prefix < lowest;
      if (newLow) [lowest, lowAt] = [prefix, i + 1];
      const settling = lit ? [paint(lit, 'visited')] : [];
      now.i = i;
      now.prefix = prefix;
      now.lowest = lowest;
      work++;
      lit = bId(i + 1);

      rec.step({ title: `${i}번 칸: P = ${num(previous)} + ${term(x)} = ${num(prefix)}`, codeHighlights: PREFIX_AT.low, ...meta() });
      rec.phase('합 늘리기', `${i}번 칸의 ${josa(num(x), '을', '를')} 더해 P = ${num(previous)} + ${term(x)} = ${num(prefix)}입니다.`, PREFIX_AT.grow);
      rec.do(...together([...settling, paint(bId(i + 1), 'current'), focus(bId(i + 1), bId(i), aId(i)), calcTo(`P = ${num(previous)} + ${term(x)}`)]));
      rec.do(look(bId(i + 1), aId(i), true, num(x)), look(bId(i + 1), bId(i), true, num(previous)));
      rec.do(...together([setItem(bId(i + 1), { text: num(prefix) }, true), calcTo(`P = ${num(prefix)}`)]), ...clear());
      rec.phase('빼 보기', `가장 작은 앞쪽 P는 ${num(lowBefore)}입니다. ${num(prefix)} − ${term(lowBefore)} = ${num(candidate)}입니다.${grew ? ` 가장 큰 합이 ${ro(num(candidate))} 바뀝니다.` : ''}`, PREFIX_AT.cand);
      rec.do(...together([focus(bId(i + 1), bId(lowAtBefore)), calcTo(`${num(prefix)} − ${term(lowBefore)} = ${num(candidate)}`)]));
      rec.do(look(bId(i + 1), bId(lowAtBefore), true, `최소 ${num(lowBefore)}`), ...(grew ? [bestTo(best)] : []), ...clear());
      rec.phase('최솟값 갱신', newLow
        ? `${josa(num(prefix), '이', '가')} 지금까지의 최솟값 ${num(lowBefore)}보다 작아 최솟값이 ${ro(num(prefix))} 바뀝니다.`
        : `${josa(num(prefix), '은', '는')} 최솟값 ${num(lowBefore)}보다 크거나 같아 최솟값은 그대로입니다.`, PREFIX_AT.low);
      rec.do(...(newLow ? together([setItem(bId(lowAtBefore), { tag: '', tone: 'visited' }), setItem(bId(i + 1), { tag: '최소' })]) : [wait(400)]));
    }
  });

  finish(rec, PREFIX_AT.done, meta, best, `두 펄스 중 더 큰 값은 ${num(best)}입니다. P의 차를 구하는 것만으로 한 번 훑어 끝났습니다.`);
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정 모든 구간의 합: 시작점 정하기 → 합 구하기 → 최댓값 기록               */
/* ------------------------------------------------------------------ */

function bruteForce(): Visualization {
  const rec = new StepRecorder(board({ rowLabel: 'total', offsetB: 0 }));
  let best = 0;
  let work = 0;
  const now = { sign: '-' as number | string, start: '-' as number | string, end: '-' as number | string, total: '-' as number | string };
  const meta: Meta = () => ({ work, variables: { sign: now.sign, start: now.start, end: now.end, total: now.total, best } });

  rec.step({ title: 'best = 0으로 시작', codeHighlights: BRUTE_AT.start, ...meta() });
  rec.phase('시작', `${SHARED_START} 길이 ${N}의 수열입니다.`);
  rec.do(calcTo('펄스를 곱한 구간의 최대 합'));
  rec.phase('규칙', `가능한 구간을 전부 만들어 합을 하나씩 구해 보면 어떨까요? 펄스 하나에 구간이 ${PAIRS}개입니다.`);
  rec.do(calcTo('모든 구간의 합을 구한다'));

  SIGNS.forEach((sign, k) => {
    const xs = xsOf(sign);
    now.sign = sign;
    now.start = now.end = now.total = '-';
    pulseStep(rec, sign, k, BRUTE_AT.pulse, meta, k ? resetRows(N) : []);
    for (let start = 0; start < N; start++) {
      const sums = Array.from({ length: N - start }, (_, d) => sumFor(xs, start, start + d));
      const top = Math.max(...sums);
      const topAt = start + sums.indexOf(top);
      const before = best;
      const grew = top > best;
      if (grew) best = top;
      work += sums.length;
      now.start = start;
      now.end = N - 1;
      now.total = sums.at(-1)!;

      rec.step({ title: `시작 ${start}번 칸: 합 ${sums.length}개, 최대 ${num(top)}`, codeHighlights: BRUTE_AT.best, ...meta() });
      rec.phase('시작점 정하기', start === N - 1 ? `${start}번 칸에서 시작하는 구간은 ${start}번 칸 하나뿐입니다.` : `${start}번 칸에서 시작하는 구간을 모두 봅니다. 끝점을 ${start}번부터 ${N - 1}번까지 하나씩 늘립니다.`, BRUTE_AT.from);
      rec.do(...together([...Array.from({ length: N }, (_, i) => setItem(bId(i), { text: '', tone: 'plain' })), paint(aId(start), 'current'), focus(aId(start)), calcTo(`${start}번 칸에서 시작`)]), wait(300), { type: 'unfocus' });
      rec.phase('합 구하기', `끝점마다 합을 구합니다. 합 ${sums.length}개를 새로 계산합니다.`, BRUTE_AT.sums);
      rec.do(...together([...sums.map((s, d) => setItem(bId(start + d), { text: num(s) }, true)), paint(aId(start), 'plain'), calcTo(`합 ${sums.length}개: ${sums.map(num).join(', ')}`)]));
      rec.phase('최댓값 기록', grew
        ? `가장 큰 합은 ${num(top)}이고 지금까지의 최댓값 ${num(before)}보다 커서 ${ro(num(top))} 바뀝니다.`
        : `가장 큰 합은 ${num(top)}이고 지금까지의 최댓값 ${num(best)}${top === best ? '와 같아' : '보다 작아'} 그대로입니다.`, BRUTE_AT.best);
      rec.do(...together([paint(bId(topAt), 'good'), calcTo(`max = ${num(top)}`)]), ...(grew ? [bestTo(best)] : []), wait(300));
    }
  });

  rec.step({ title: `답: 가장 큰 합 ${num(best)} (합 ${work}개)`, codeHighlights: BRUTE_AT.done, ...meta(), answer: best, isKeyframe: true });
  rec.phase('답 확인', `${josa(num(best), '이', '가')} 답입니다. 하지만 합을 ${work}번 구했습니다. 정석은 ${2 * N}번이면 됩니다.`);
  rec.do(...together([{ type: 'set', id: 'best', patch: { tone: 'path' } }, calcTo(`합 ${work}개를 구함`)]));
  rec.phase('최대 입력', '길이 500,000이면 구간이 펄스마다 약 1.25 × 10^11개라 끝나지 않습니다.');
  rec.do(calcTo('n = 500,000 → 합 2.5 × 10^11개'));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'pulse-subarray',
  title: '연속 펄스 부분 수열의 합',
  level: 3,
  category: 'dp',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/161988',
  description: {
    summary:
      '정수 수열에서 연속한 구간을 하나 골라, 그 구간과 길이가 같은 펄스 수열(1과 −1이 번갈아 나오는 수열)을 칸마다 곱한 뒤 모두 더합니다. 펄스는 1로 시작하거나 −1로 시작할 수 있고, 이렇게 얻을 수 있는 합의 최댓값을 구합니다.',
    rules: [
      '수열의 길이는 1 이상 500,000 이하',
      '수열의 원소는 −100,000 이상 100,000 이하의 정수',
      '고른 구간에 곱하는 펄스는 [1, −1, 1, …] 또는 [−1, 1, −1, …]',
    ],
    examples: [{ input: 'sequence = [2, 3, -6, 1, 3, -1, 2, 4]', output: '10' }],
  },
  keyIntuitions: [
    '펄스를 곱하는 것은 구간에서 한 칸 건너 부호를 뒤집는 것입니다. 구간의 시작 위치와 상관없이 수열 전체에 펄스를 곱해 놓고 그 안에서 구간을 고르면 같은 결과입니다.',
    '펄스는 +1로 시작하는 것과 −1로 시작하는 것 두 가지뿐이니, 곱한 수열 두 개에서 각각 최대 부분합을 구해 큰 쪽을 고르면 됩니다.',
    '최대 부분합은 칸마다 "여기서 끝나는 가장 큰 합"을 이어 가며 구합니다. 앞의 합이 음수이면 버리고 새로 시작하는 것이 더 큽니다. 구간을 모두 만들어 보면 O(n²)이라 500,000에서는 불가능합니다.',
  ],
  demo: { input: [SEQ], label: `sequence = [${SEQ.map(num).join(', ')}]` },
  workUnit: '구한 부분합의 수',
  approaches: [
    {
      id: 'pulse-kadane',
      name: '칸마다 끝나는 최대 합 (최대 부분합)',
      rank: 'BEST',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      verdict: '펄스를 곱한 수열마다 "여기서 끝나는 가장 큰 합"을 이어 가며 최대 부분합을 구하는 풀이입니다.',
      pros: [
        '칸마다 새로 시작할지 이어 붙일지만 고르면 되어 코드가 세 줄뿐입니다.',
        '수열을 두 번만 훑으면 되어 길이 500,000도 100만 번 남짓한 계산으로 끝납니다.',
        '변수가 cur와 best 둘이라 메모리가 거의 들지 않습니다.',
      ],
      cons: [
        '펄스가 두 종류라는 것을 놓치면 한 가지만 구해 오답이 나옵니다.',
        '구간이 비어도 되는지(0점)와 음수만 있는 경우를 헷갈리기 쉽습니다. 이 문제는 한 칸만 골라도 부호를 맞춰 0 이상이 됩니다.',
      ],
      whyThisRank:
        '구간의 끝마다 가장 좋은 시작을 하나만 기억하면 되는 DP라서 가장 짧고 확실합니다. 펄스 두 가지를 반복문으로 감싸기만 하면 문제의 변형도 그대로 풀립니다.',
      code: KADANE,
      visualize: kadane,
    },
    {
      id: 'pulse-prefix-min',
      name: '앞쪽 합 중 가장 작은 값 빼기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      verdict: '앞에서부터 더한 합 P에서 지금까지 가장 작은 P를 빼 최대 구간 합을 구하는 풀이로, 정석과 같은 O(n)이지만 한 단계 더 돌려 생각해야 합니다.',
      pros: ['구간의 합이 두 P의 차라는 생각은 구간 합 문제 전반에 쓰입니다.', '정석과 같은 O(n)이고 한 번 훑으면 됩니다.'],
      cons: [
        '"P 중 가장 작은 값을 처음의 0까지 포함해 기억한다"는 점을 놓치면 첫 칸부터 시작하는 구간을 빠뜨립니다.',
        '왜 가장 작은 P를 빼면 가장 큰 구간이 되는지 설명하려면 한 단계 더 생각해야 해서 정석보다 실수하기 쉽습니다.',
      ],
      whyThisRank:
        '복잡도는 같지만 "여기서 끝나는 가장 큰 합"을 바로 이어 가는 정석이 더 직접적입니다. P와 lowest를 따로 관리해야 해서 코드와 생각이 한 단계 더 듭니다.',
      code: PREFIX,
      visualize: prefixMin,
    },
    {
      id: 'pulse-all-ranges',
      name: '모든 구간의 합을 하나씩 구하기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      verdict: '시작점과 끝점을 모두 정해 구간마다 합을 구하면 맞지만, 길이 500,000에서는 합이 천억 번 넘게 필요해 끝나지 않습니다.',
      pros: ['모든 구간을 보므로 틀릴 수가 없고 가장 먼저 떠오릅니다.', '길이가 작을 때는 정확한 답을 냅니다.'],
      cons: [
        '길이가 500,000이면 구간이 펄스마다 약 1.25 × 10^11개라 시간 안에 끝나지 않습니다.',
        '시작점이 달라도 앞쪽 합이 겹치는데 매번 처음부터 다시 더합니다.',
      ],
      whyThisRank:
        '구간의 끝이 같으면 앞쪽 합을 다시 쓸 수 있다는 DP의 신호를 놓친 풀이입니다. "끝나는 칸마다 가장 큰 합"만 기억하면 구간을 모두 만들지 않고 O(n)으로 같은 답을 얻습니다.',
      code: BRUTE,
      visualize: bruteForce,
    },
  ],
  checks: {
    cases: [
      { args: [[2, 3, -6, 1, 3, -1, 2, 4]], expected: 10 },
      { args: [SEQ], expected: BEST_RUN.value },
      { args: [[5]], expected: 5 },
      { args: [[-5]], expected: 5 },
      { args: [[0]], expected: 0 },
      { args: [[1, 1, 1, 1]], expected: 1 },
      { args: [[-100000, 100000, -100000, 100000]], expected: 400000 },
      { args: [[-1, -2, -3]], expected: 3 },
    ],
    // 길이 1~8, 값 −9~9(함정이 모든 구간을 보아도 순식간이다)
    random: (rand) => [Array.from({ length: 1 + Math.floor(rand() * 8) }, () => Math.floor(rand() * 19) - 9)],
  },
};

export default problem;
