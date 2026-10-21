// 가장 큰 수: 정석 이어 붙여 비교 정렬(b+a vs a+b), 대안 3번 반복 문자열 키(x*3) 정렬, 함정 단순 문자열 내림차순 정렬을 같은 장면에서 움직인다.
// 장면은 위에 입력 숫자 칸(정렬하면 미끄러져 자리를 바꿈), 가운데에 두 수 이어 붙이기 비교 판, 아래에 결과 문자열 표시다.
import { grid } from '../../engine/layout.ts';
import type { Action, AlgorithmStep, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { lines, together } from '../shared.ts';

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

// 시각화 입력. 정석과 대안은 "953433130", 단순 사전 순 내림차순 함정은 "953431303"이 나온다.
const NUMBERS = [3, 30, 34, 5, 9, 31];
const N = NUMBERS.length;
const STRS = NUMBERS.map(String);
const BEST_ORDER = STRS.map((_, i) => i).sort((i, j) => (STRS[j] + STRS[i]).localeCompare(STRS[i] + STRS[j]));
const BEST_SORTED = BEST_ORDER.map((i) => STRS[i]);
const TRUTH = BEST_SORTED.join('');
const TRAP_ORDER = STRS.map((_, i) => i).sort((i, j) => STRS[j].localeCompare(STRS[i]));
const TRAP_SORTED = TRAP_ORDER.map((i) => STRS[i]);
const TRAP_ANS = TRAP_SORTED.join('');
const list = (xs: (string | number)[]) => `[${xs.map((x) => `"${x}"`).join(', ')}]`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const CONCAT_SORT = {
  python: `from functools import cmp_to_key

def compare(a, b):
    if a + b > b + a:
        return -1                  # a + b가 더 크면 a가 앞
    if a + b < b + a:
        return 1                   # b + a가 더 크면 b가 앞
    return 0

def solution(numbers):
    strs = [str(n) for n in numbers]
    strs.sort(key=cmp_to_key(compare))
    answer = ''.join(strs)
    return '0' if answer[0] == '0' else answer`,
  javascript: `function solution(numbers) {
  const strs = numbers.map(String);
  strs.sort((a, b) => {
    if (a + b > b + a) return -1; // a + b가 더 크면 a가 앞
    if (a + b < b + a) return 1;  // b + a가 더 크면 b가 앞
    return 0;
  });
  const answer = strs.join('');
  return answer[0] === '0' ? '0' : answer;
}`,
};
const CONCAT_AT = {
  toStr: lines(CONCAT_SORT, ['strs = [str(n) for n in numbers]'], ['const strs = numbers.map(String)']),
  cmpA: lines(CONCAT_SORT, ['def compare(a, b):', 'if a + b > b + a:', 'return -1'], ['strs.sort((a, b) => {', 'if (a + b > b + a) return -1']),
  cmpB: lines(CONCAT_SORT, ['def compare(a, b):', 'if a + b < b + a:', 'return 1'], ['strs.sort((a, b) => {', 'if (a + b < b + a) return 1']),
  sortDone: lines(CONCAT_SORT, ['strs.sort(key=cmp_to_key(compare))'], ['strs.sort((a, b) => {']),
  join: lines(CONCAT_SORT, ["answer = ''.join(strs)", "return '0' if answer[0] == '0' else answer"], ["const answer = strs.join('')", "return answer[0] === '0' ? '0' : answer"]),
};

const SELECTION_CONCAT = {
  python: `def solution(numbers):
    strs = [str(n) for n in numbers]
    # 앞자리부터 올 문자열을 하나씩 선택 정렬로 골라낸다
    for i in range(len(strs)):
        best = i
        for j in range(i + 1, len(strs)):
            if strs[j] + strs[best] > strs[best] + strs[j]:
                best = j
        strs[i], strs[best] = strs[best], strs[i]
    answer = ''.join(strs)
    return '0' if answer[0] == '0' else answer`,
  javascript: `function solution(numbers) {
  const strs = numbers.map(String);
  // 앞자리부터 올 문자열을 하나씩 선택 정렬로 골라냅니다
  for (let i = 0; i < strs.length; i++) {
    let best = i;
    for (let j = i + 1; j < strs.length; j++) {
      if (strs[j] + strs[best] > strs[best] + strs[j]) best = j;
    }
    [strs[i], strs[best]] = [strs[best], strs[i]];
  }
  const answer = strs.join('');
  return answer[0] === '0' ? '0' : answer;
}`,
};
const SEL_AT = {
  toStr: lines(SELECTION_CONCAT, ['strs = [str(n) for n in numbers]'], ['const strs = numbers.map(String)']),
  scan: lines(SELECTION_CONCAT, ['for i in range(len(strs)):', 'for j in range(i + 1, len(strs)):', 'if strs[j] + strs[best] > strs[best] + strs[j]:'], ['for (let i = 0; i < strs.length; i++)', 'for (let j = i + 1; j < strs.length; j++)', 'if (strs[j] + strs[best] > strs[best] + strs[j])']),
  swap: lines(SELECTION_CONCAT, ['strs[i], strs[best] = strs[best], strs[i]'], ['[strs[i], strs[best]] = [strs[best], strs[i]]']),
  join: lines(SELECTION_CONCAT, ["answer = ''.join(strs)", "return '0' if answer[0] == '0' else answer"], ["const answer = strs.join('')", "return answer[0] === '0' ? '0' : answer"]),
};

const LEX_TRAP = {
  python: `def solution(numbers):
    strs = [str(n) for n in numbers]
    strs.sort(reverse=True)        # 이어 붙이지 않고 문자열 그대로 사전 순 내림차순 정렬
    answer = ''.join(strs)
    return '0' if answer[0] == '0' else answer  # [3, 30]에서 "303" 반환 (정답은 "330")`,
  javascript: `function solution(numbers) {
  const strs = numbers.map(String);
  strs.sort((a, b) => (b > a ? 1 : b < a ? -1 : 0)); // 문자열 그대로 사전 순 내림차순 정렬
  const answer = strs.join('');
  return answer[0] === '0' ? '0' : answer; // [3, 30]에서 "303" 반환 (정답은 "330")
}`,
};
const TRAP_AT = {
  toStr: lines(LEX_TRAP, ['strs = [str(n) for n in numbers]'], ['const strs = numbers.map(String)']),
  sort: lines(LEX_TRAP, ['strs.sort(reverse=True)'], ['strs.sort((a, b) =>']),
  join: lines(LEX_TRAP, ["answer = ''.join(strs)", "return '0' if answer[0] == '0' else answer"], ["const answer = strs.join('')", "return answer[0] === '0' ? '0' : answer"]),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 560;
const H = 236;
const cellAt = grid({ x: 86, y: 36, rows: 1, cols: N, cell: 62, gap: 10 });
const numId = (k: number) => `n:${k}`;
const CMP_AB: Rect = { x: 86, y: 118, w: 196, h: 36 };
const CMP_BA: Rect = { x: 298, y: 118, w: 196, h: 36 };
const ANS_RECT: Rect = { x: 86, y: 178, w: 200, h: 36 };
const TRUTH_RECT: Rect = { x: 298, y: 178, w: 200, h: 36 };

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

function board(): Scene {
  const items: Item[] = [
    { id: 'lab:arr', kind: 'text', rect: { x: 8, y: 36, w: 72, h: 62 }, text: '문자열' },
    { id: 'lab:cmp', kind: 'text', rect: { x: 8, y: 118, w: 72, h: 36 }, tone: 'muted', text: '비교 판' },
    { id: 'lab:ans', kind: 'text', rect: { x: 8, y: 178, w: 72, h: 36 }, text: '결과' },
    { id: 'tok:ab', kind: 'token', rect: CMP_AB, tone: 'plain', text: 'a + b 대기' },
    { id: 'tok:ba', kind: 'token', rect: CMP_BA, tone: 'plain', text: 'b + a 대기' },
    { id: 'tok:ans', kind: 'token', rect: ANS_RECT, tone: 'plain', text: '이어 붙이기 전' },
  ];
  NUMBERS.forEach((v, k) => items.push({ id: numId(k), kind: 'cell', rect: cellAt(0, k), tone: 'plain', text: String(v) }));
  return { width: W, height: H, items };
}

/* ------------------------------------------------------------------ */
/* 정석 이어 붙여 비교 정렬                                              */
/* ------------------------------------------------------------------ */

function concatSortViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  let curOrder = [...Array(N).keys()];
  const meta = (pair = '-', answer = '-') => ({
    work,
    variables: { strs: list(curOrder.map((k) => STRS[k])), compare: pair, answer },
  });

  rec.step({ title: '숫자를 문자열로 변환하기', codeHighlights: CONCAT_AT.toStr, ...meta() });
  rec.phase('변환하기', `정수를 이어 붙여 비교할 수 있도록 ${N}개의 숫자를 모두 문자열로 바꿉니다.`, CONCAT_AT.toStr);
  rec.do(...together(STRS.map((s, k): Action => ({ type: 'set', id: numId(k), patch: { text: `"${s}"`, tone: 'chosen' }, pop: true }))), wait(200));

  // 핵심 비교 6쌍을 단계별로 보여 주며 자리를 정한다
  const pairs: [number, number][] = [
    [0, 1], // "3" vs "30" -> "330" > "303"
    [0, 2], // "3" vs "34" -> "334" < "343"
    [3, 4], // "5" vs "9"  -> "59"  < "95"
    [2, 3], // "34" vs "5" -> "345" < "534"
    [0, 5], // "3" vs "31" -> "331" > "313"
    [5, 1], // "31" vs "30" -> "3130" > "3031"
  ];

  for (const [ka, kb] of pairs) {
    const [a, b] = [STRS[ka], STRS[kb]];
    const [ab, ba] = [a + b, b + a];
    const aWins = ab > ba;
    work++;
    const hl = aWins ? CONCAT_AT.cmpA : CONCAT_AT.cmpB;
    rec.step({ title: `"${a}" vs "${b}": "${ab}" ${aWins ? '>' : '<'} "${ba}"`, codeHighlights: hl, ...meta(`"${ab}" vs "${ba}"`) });
    rec.phase('이어 붙이기', `"${a}"와 "${b}"를 두 순서로 이어 붙여 "${ab}"와 "${ba}"를 만듭니다.`, hl);
    rec.do(...together([
      { type: 'focus', ids: [numId(ka), numId(kb), 'tok:ab', 'tok:ba'] },
      paint(numId(ka), 'current'),
      paint(numId(kb), 'current'),
      { type: 'set', id: 'tok:ab', patch: { text: `a+b = "${ab}"`, tone: aWins ? 'good' : 'bad' }, pop: true },
      { type: 'set', id: 'tok:ba', patch: { text: `b+a = "${ba}"`, tone: aWins ? 'bad' : 'good' }, pop: true },
    ]));
    rec.do({ type: 'arrow', from: numId(ka), to: numId(kb), verdict: aWins ? 'good' : 'bad', label: aWins ? `"${ab}" > "${ba}"` : `"${ab}" < "${ba}"` }, wait(200));

    rec.phase('순서 판정', aWins
      ? `"${ab}"가 "${ba}"보다 크므로 "${a}"가 "${b}"보다 앞에 옵니다.`
      : `"${ba}"가 "${ab}"보다 크므로 "${b}"가 "${a}"보다 앞에 옵니다.`, hl);
    rec.do(...clear(paint(numId(ka), 'plain'), paint(numId(kb), 'plain')));
  }

  curOrder = BEST_ORDER;
  rec.step({ title: `비교 결과대로 정렬 완료: ${list(BEST_SORTED)}`, codeHighlights: CONCAT_AT.sortDone, ...meta('완료') });
  rec.phase('정렬 배치', `이어 붙여 비교한 결과대로 ${list(BEST_SORTED)} 순서로 자리가 정해집니다.`, CONCAT_AT.sortDone);
  rec.do(...together(BEST_ORDER.map((k, slot): Action => ({ type: 'set', id: numId(k), patch: { rect: cellAt(0, slot), tone: 'visited' } }))), wait(300));

  rec.step({ title: `이어 붙여 가장 큰 수 완성: "${TRUTH}"`, codeHighlights: CONCAT_AT.join, ...meta('완료', TRUTH), answer: TRUTH, isKeyframe: true });
  rec.phase('정답', `정렬된 문자열을 차례로 이어 붙이면 "${TRUTH}"입니다. 맨 앞 글자가 '0'이 아니므로 그대로 반환합니다.`, CONCAT_AT.join);
  rec.do(...together([
    ...BEST_ORDER.map((k): Action => paint(numId(k), 'path')),
    { type: 'set', id: 'tok:ans', patch: { text: `정답 "${TRUTH}"`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 선택 정렬로 이어 붙여 비교하기                                   */
/* ------------------------------------------------------------------ */

function selectionConcatViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const order = [...Array(N).keys()];
  const meta = (i: number | '-', best: string, answer = '-') => ({
    work,
    variables: { i, best, strs: list(order.map((k) => STRS[k])), answer },
  });

  rec.step({ title: '숫자를 문자열로 변환하기', codeHighlights: SEL_AT.toStr, ...meta('-', '-') });
  rec.phase('변환하기', `정수를 문자열로 바꾼 뒤, 0번 자리부터 남은 원소를 모두 비교해 가장 앞에 올 문자열을 하나씩 뽑습니다.`, SEL_AT.toStr);
  rec.do(...together(STRS.map((s, k): Action => ({ type: 'set', id: numId(k), patch: { text: `"${s}"` }, pop: true }))), wait(200));

  for (let i = 0; i < N - 1; i++) {
    let bestIdx = i;
    const scanned: number[] = [];
    for (let j = i + 1; j < N; j++) {
      work++;
      scanned.push(order[j]);
      const cand = STRS[order[j]];
      const cur = STRS[order[bestIdx]];
      if (cand + cur > cur + cand) bestIdx = j;
    }
    const chosenOrig = order[bestIdx];
    const chosenStr = STRS[chosenOrig];
    const firstOrig = order[i];
    [order[i], order[bestIdx]] = [order[bestIdx], order[i]];

    rec.step({ title: `${i}번 자리 확정: "${chosenStr}" (${N - 1 - i}번 비교)`, codeHighlights: SEL_AT.scan, ...meta(i, `"${chosenStr}"`) });
    rec.phase('훑어 비교', `남은 ${N - i}개 원소를 모두 이어 붙여 비교(${N - 1 - i}회)한 결과 "${chosenStr}"가 가장 앞에 와야 합니다.`, SEL_AT.scan);
    rec.do(...together([
      { type: 'focus', ids: [numId(firstOrig), ...scanned.map(numId)] },
      paint(numId(chosenOrig), 'current'),
      { type: 'set', id: 'tok:ab', patch: { text: `${i}번 후보 비교 ${N - 1 - i}회`, tone: 'chosen' }, pop: true },
      { type: 'set', id: 'tok:ba', patch: { text: `최선 = "${chosenStr}"`, tone: 'good' }, pop: true },
    ]));
    rec.do({ type: 'arrow', from: numId(firstOrig), to: numId(chosenOrig), verdict: 'good', label: `최선 "${chosenStr}"` }, wait(180));

    rec.phase('자리 확정', `"${chosenStr}"를 ${i}번 자리로 옮겨 확정합니다.`, SEL_AT.swap);
    rec.do(...clear(
      ...order.map((k, slot): Action => ({ type: 'set', id: numId(k), patch: { rect: cellAt(0, slot), tone: slot <= i ? 'visited' : 'plain' } })),
    ));
  }

  rec.step({ title: `정렬 완료 및 이어 붙이기: "${TRUTH}"`, codeHighlights: SEL_AT.join, ...meta(N - 1, `"${STRS[order[N - 1]]}"`, TRUTH), answer: TRUTH, isKeyframe: true });
  rec.phase('정답', `마지막 칸까지 확정해 "${TRUTH}"를 얻었습니다. 정석과 같은 답이지만, 매 자리마다 남은 원소를 다 비교해 ${work}번 비교했습니다.`, SEL_AT.join);
  rec.do(...together([
    ...order.map((k): Action => paint(numId(k), 'path')),
    { type: 'set', id: 'tok:ans', patch: { text: `정답 "${TRUTH}"`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 단순 문자열 내림차순 정렬                                        */
/* ------------------------------------------------------------------ */

function lexTrapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  let curOrder = [...Array(N).keys()];
  const meta = (pair = '-', answer = '-') => ({
    work,
    variables: { strs: list(curOrder.map((k) => STRS[k])), compare: pair, answer },
  });

  rec.step({ title: '숫자를 문자열로 변환하기', codeHighlights: TRAP_AT.toStr, ...meta() });
  rec.phase('변환하기', `정수를 문자열로 바꾼 뒤, 이어 붙이지 않고 문자열 자체의 사전 순 내림차순으로 정렬해 봅니다.`, TRAP_AT.toStr);
  rec.do(...together(STRS.map((s, k): Action => ({ type: 'set', id: numId(k), patch: { text: `"${s}"` }, pop: true }))), wait(200));

  const trapPairs: [number, number, string][] = [
    [4, 3, '"9" > "5" (첫 글자 비교)'],
    [2, 5, '"34" > "31" (둘째 글자 4 > 1)'],
    [5, 1, '"31" > "30" (둘째 글자 1 > 0)'],
    [1, 0, '"30" > "3" (길이가 긴 "30"이 앞!)'],
  ];

  for (const [ka, kb, reason] of trapPairs) {
    const [a, b] = [STRS[ka], STRS[kb]];
    const isTrapPair = ka === 1 && kb === 0;
    work++;
    rec.step({ title: `사전 순 비교: "${a}" > "${b}"`, codeHighlights: TRAP_AT.sort, ...meta(`"${a}" vs "${b}"`) });
    rec.phase('사전 순 비교', isTrapPair
      ? `문자열 자체로 비교하면 "${a}"이 "${b}"보다 길어서 크다고 판정합니다. 하지만 이어 붙이면 "${a}${b}"(303) < "${b}${a}"(330)입니다!`
      : `문자열 사전 순으로 ${reason}이므로 "${a}"가 앞에 옵니다.`, TRAP_AT.sort);
    rec.do(...together([
      { type: 'focus', ids: [numId(ka), numId(kb)] },
      paint(numId(ka), isTrapPair ? 'bad' : 'current'),
      paint(numId(kb), isTrapPair ? 'bad' : 'current'),
      { type: 'set', id: 'tok:ab', patch: { text: `사전 순: "${a}" > "${b}"`, tone: isTrapPair ? 'bad' : 'chosen' }, pop: true },
      { type: 'set', id: 'tok:ba', patch: { text: isTrapPair ? `실제: "${a}${b}" < "${b}${a}"` : `이어 붙여도 "${a}${b}" 앞`, tone: isTrapPair ? 'good' : 'plain' }, pop: true },
    ]));
    rec.do({ type: 'arrow', from: numId(ka), to: numId(kb), verdict: isTrapPair ? 'bad' : 'good', label: `"${a}" > "${b}"` }, wait(200));
    rec.phase('판정 기록', isTrapPair
      ? `"30"과 "31"이 "3"보다 앞에 서면서 백의 자리에 3 대신 1이나 0이 오게 됩니다.`
      : `"${a}"를 "${b}"보다 앞에 둡니다.`, TRAP_AT.sort);
    rec.do(...clear(paint(numId(ka), 'plain'), paint(numId(kb), 'plain')));
  }

  curOrder = TRAP_ORDER;
  rec.step({ title: `사전 순 내림차순 배치: ${list(TRAP_SORTED)}`, codeHighlights: TRAP_AT.sort, ...meta('완료') });
  rec.phase('정렬 배치', `사전 순 내림차순으로 정렬하면 "31", "30"이 "3"보다 앞에 놓입니다.`, TRAP_AT.sort);
  rec.do(...together(TRAP_ORDER.map((k, slot): Action => ({
    type: 'set',
    id: numId(k),
    patch: { rect: cellAt(0, slot), tone: k === 0 || k === 1 || k === 5 ? 'bad' : 'visited' },
  }))), wait(300));

  rec.step({ title: `이 방법 "${TRAP_ANS}", 정답은 "${TRUTH}"`, codeHighlights: TRAP_AT.join, ...meta('완료', TRAP_ANS), answer: TRAP_ANS, isKeyframe: true });
  rec.phase('오답 확인', `이 방법은 "${TRAP_ANS}"을 만들지만, "3"을 "31"·"30"보다 앞에 둔 "${TRUTH}"이 더 큽니다.`, TRAP_AT.join);
  rec.do(...together([
    { type: 'set', id: 'tok:ans', patch: { text: `이 방법 "${TRAP_ANS}"`, tone: 'bad' }, pop: true },
    { type: 'add', item: { id: 'tok:truth', kind: 'token', rect: TRUTH_RECT, tone: 'good', text: `정답 "${TRUTH}"` } },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'largest-number',
  title: '가장 큰 수',
  level: 2,
  category: 'sort',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42746',
  description: {
    summary:
      '0 또는 양의 정수가 담긴 배열 numbers가 주어질 때, 정수를 이어 붙여 만들 수 있는 가장 큰 수를 문자열로 바꾸어 반환합니다.',
    rules: [
      'numbers의 길이는 1 이상 100,000 이하',
      'numbers의 원소는 0 이상 1,000 이하',
      '정답이 너무 클 수 있으니 문자열로 바꾸어 반환',
      '모든 원소가 0이면 "00...0"이 아니라 "0"을 반환해야 함',
    ],
    examples: [
      { input: 'numbers = [6, 10, 2]', output: '"6210"' },
      { input: 'numbers = [3, 30, 34, 5, 9]', output: '"9534330"' },
    ],
  },
  keyIntuitions: [
    '두 문자열 a와 b 중 어느 것이 앞에 와야 하는지는 a + b와 b + a를 직접 이어 붙여 비교하면 바로 결정됩니다.',
    '문자열 자체를 사전 순으로 비교하면 "30" > "3"이지만, 이어 붙이면 "330" > "303"이므로 "3"이 앞에 와야 합니다.',
    '입력이 [0, 0, 0]처럼 모두 0일 때 그대로 이어 붙이면 "000"이 되므로, 맨 앞 글자가 "0"이면 "0"으로 처리해야 합니다.',
  ],
  demo: { input: [NUMBERS], label: 'numbers = [3, 30, 34, 5, 9, 31]' },
  workUnit: '두 문자열을 비교한 횟수',
  approaches: [
    {
      id: 'largest-number-concat-sort',
      name: '이어 붙여 비교 정렬',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '두 문자열 a, b를 a + b와 b + a로 이어 붙여 비교하는 정렬 기준을 써서 O(N log N)에 가장 큰 순서를 구합니다.',
      pros: [
        '원소의 자릿수 제한이 얼마든 상관없이 언제나 정확한 순서를 정합니다.',
        '표준 정렬에 비교 함수만 넘기므로 O(N log N) 시간에 끝납니다.',
        '추이성(a가 b보다 앞이고 b가 c보다 앞이면 a가 c보다 앞)이 성립해 전체 최적 순서가 보장됩니다.',
      ],
      cons: ['모든 원소가 0인 입력([0, 0])에서 "00"이 아닌 "0"을 반환하는 예외 처리를 잊기 쉽습니다.'],
      whyThisRank:
        '두 수를 이어 붙인 두 결과(a + b와 b + a)는 길이가 같아서 사전 순 비교가 곧 실제 숫자 크기 비교와 같습니다. O(N log N) 비교만으로 가장 큰 수를 만듭니다.',
      code: CONCAT_SORT,
      visualize: concatSortViz,
    },
    {
      id: 'largest-number-selection',
      name: '선택 정렬로 이어 붙여 뽑기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '비교 기준(a + b vs b + a)은 정석과 같지만, 매 자리마다 남은 원소를 끝까지 훑어 O(N²)번 비교하는 느린 풀이입니다.',
      pros: [
        '가장 앞에 올 문자열부터 하나씩 확정하는 과정이 직관적입니다.',
        '작은 입력에서는 정석과 똑같은 정답을 냅니다.',
      ],
      cons: [
        'N이 최대 100,000이므로 O(N²) 비교를 하면 약 50억 번 비교해 시간 초과가 납니다.',
      ],
      whyThisRank:
        '이어 붙여 비교한다는 핵심 규칙은 맞지만, O(N log N) 표준 정렬 대신 O(N²) 선택 정렬로 자리를 정해 비교 횟수가 크게 늘어납니다.',
      code: SELECTION_CONCAT,
      visualize: selectionConcatViz,
    },
    {
      id: 'largest-number-lex-trap',
      name: '단순 문자열 사전 순 내림차순',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '문자열을 이어 붙이지 않고 그대로 사전 순 내림차순으로 정렬해, "30"이 "3"보다 앞에 오면서 오답을 내는 함정입니다.',
      pros: ['코드가 한 줄로 가장 짧고, [6, 10, 2] 같은 첫 번째 예제는 우연히 통과합니다.'],
      cons: [
        '사전 순으로는 길이가 더 긴 "30"이 "3"보다 크지만, 이어 붙이면 "303" < "330"이라 손해를 봅니다.',
        '[3, 30, 34, 5, 9]에서 정답 "9534330" 대신 "9534303"을 반환합니다.',
      ],
      whyThisRank:
        '접두어가 같은 두 숫자("3"과 "30")는 뒤에 무엇이 이어지느냐에 따라 우열이 갈리므로, 단독 문자열 사전 순 비교로는 순서를 정할 수 없습니다.',
      code: LEX_TRAP,
      visualize: lexTrapViz,
    },
  ],
  checks: {
    cases: [
      { args: [[6, 10, 2]], expected: '6210' },
      { args: [[3, 30, 34, 5, 9]], expected: '9534330' },
      { args: [[0, 0, 0]], expected: '0' },
      { args: [[0]], expected: '0' },
      { args: [[12, 121]], expected: '12121' },
      { args: [[21, 212]], expected: '21221' },
      { args: [NUMBERS], expected: TRUTH },
    ],
    random: (rand) => {
      const len = 1 + Math.floor(rand() * 7);
      if (rand() < 0.1) return [Array.from({ length: len }, () => 0)];
      const nums = Array.from({ length: len }, () => Math.floor(rand() * 1001));
      return [nums];
    },
  },
};

export default problem;
