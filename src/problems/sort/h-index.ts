// H-Index: 정석 내림차순 정렬 후 순위(i + 1)와 비교, 대안 h = n부터 1까지 줄이며 인용 논문 수 세기, 함정 배열 안의 인용 횟수 값 중에서만 고르기를 같은 장면에서 움직인다.
// 장면은 위에 논문 인용 횟수 칸(정렬하면 미끄러져 자리를 바꿈), 가운데에 순위(i + 1) 표시 줄, 아래에 현재 H-Index 후보와 결과 표시다.
import { grid } from '../../engine/layout.ts';
import type { Action, AlgorithmStep, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, together } from '../shared.ts';

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

// 시각화 입력. 정석과 대안은 4(배열에 4가 없어도 4편이 4회 이상 인용됨), 배열 원소만 후보로 보는 함정은 3이 나온다.
const CITATIONS = [6, 5, 3, 5, 1, 5, 2, 0];
const N = CITATIONS.length;
const ORDER = CITATIONS.map((_, i) => i).sort((a, b) => CITATIONS[b] - CITATIONS[a] || a - b);
const SORTED = ORDER.map((i) => CITATIONS[i]);
const TRUTH = 4;
const list = (xs: number[]) => `[${xs.join(', ')}]`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const DESC_SORT = {
  python: `def solution(citations):
    citations.sort(reverse=True)     # 많이 인용된 논문부터 내림차순 정렬
    h = 0
    for i, c in enumerate(citations):
        if c >= i + 1:               # (i + 1)번째 논문이 (i + 1)회 이상 인용되었는가?
            h = i + 1
        else:
            break                    # 뒤 논문은 인용 수가 더 적으므로 멈춘다
    return h`,
  javascript: `function solution(citations) {
  citations.sort((a, b) => b - a); // 많이 인용된 논문부터 내림차순 정렬
  let h = 0;
  for (let i = 0; i < citations.length; i++) {
    if (citations[i] >= i + 1) { // (i + 1)번째 논문이 (i + 1)회 이상 인용되었는가?
      h = i + 1;
    } else {
      break; // 뒤 논문은 인용 수가 더 적으므로 멈춥니다
    }
  }
  return h;
}`,
};
const DESC_AT = {
  sort: lines(DESC_SORT, ['citations.sort(reverse=True)'], ['citations.sort((a, b) => b - a)']),
  init: lines(DESC_SORT, ['h = 0'], ['let h = 0']),
  check: lines(DESC_SORT, ['for i, c in enumerate(citations):', 'if c >= i + 1:'], ['for (let i = 0; i < citations.length; i++)', 'if (citations[i] >= i + 1)']),
  pass: lines(DESC_SORT, ['h = i + 1'], ['h = i + 1']),
  stop: lines(DESC_SORT, ['else:', 'break'], ['} else {', 'break']),
  done: lines(DESC_SORT, ['return h'], ['return h']),
};

const SCAN_H = {
  python: `def solution(citations):
    n = len(citations)
    # 후보 h를 n부터 1까지 줄이며 h회 이상 인용된 논문 수를 매번 센다
    for h in range(n, 0, -1):
        count = sum(1 for c in citations if c >= h)
        if count >= h:
            return h
    return 0`,
  javascript: `function solution(citations) {
  const n = citations.length;
  // 후보 h를 n부터 1까지 줄이며 h회 이상 인용된 논문 수를 매번 셉니다
  for (let h = n; h >= 1; h--) {
    const count = citations.filter((c) => c >= h).length;
    if (count >= h) return h;
  }
  return 0;
}`,
};
const SCAN_AT = {
  init: lines(SCAN_H, ['n = len(citations)'], ['const n = citations.length']),
  loop: lines(SCAN_H, ['for h in range(n, 0, -1):', 'count = sum(1 for c in citations if c >= h)'], ['for (let h = n; h >= 1; h--)', 'const count = citations.filter']),
  cond: lines(SCAN_H, ['if count >= h:'], ['if (count >= h) return h']),
  found: lines(SCAN_H, ['if count >= h:', 'return h'], ['if (count >= h) return h']),
};

const ARRAY_VALUE_TRAP = {
  python: `def solution(citations):
    citations.sort(reverse=True)
    # 함정: 배열에 들어 있는 인용 횟수 c만 H-Index 후보로 검사한다
    for c in citations:
        count = sum(1 for x in citations if x >= c)
        if count >= c:
            return c
    return 0  # [6, 5, 3, 5, 1, 5, 2, 0]에서 3 반환 (정답은 4)`,
  javascript: `function solution(citations) {
  citations.sort((a, b) => b - a);
  // 함정: 배열에 들어 있는 인용 횟수 c만 H-Index 후보로 검사합니다
  for (const c of citations) {
    const count = citations.filter((x) => x >= c).length;
    if (count >= c) return c;
  }
  return 0; // [6, 5, 3, 5, 1, 5, 2, 0]에서 3 반환 (정답은 4)
}`,
};
const TRAP_AT = {
  sort: lines(ARRAY_VALUE_TRAP, ['citations.sort(reverse=True)'], ['citations.sort((a, b) => b - a)']),
  loop: lines(ARRAY_VALUE_TRAP, ['for c in citations:', 'count = sum(1 for x in citations if x >= c)'], ['for (const c of citations)', 'const count = citations.filter']),
  cond: lines(ARRAY_VALUE_TRAP, ['if count >= c:'], ['if (count >= c) return c']),
  ret: lines(ARRAY_VALUE_TRAP, ['if count >= c:', 'return c'], ['if (count >= c) return c']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 568;
const H = 228;
const cellAt = grid({ x: 76, y: 36, rows: 1, cols: N, cell: 54, gap: 6 });
const rankRect = (s: number): Rect => ({ x: cellAt(0, s).x + 5, y: 100, w: 44, h: 24 });
const paperId = (k: number) => `p:${k}`;
const sid = (s: number) => paperId(ORDER[s]);
const STATUS_RECT: Rect = { x: 76, y: 142, w: 224, h: 32 };
const ANS_RECT: Rect = { x: 76, y: 184, w: 180, h: 32 };
const TRUTH_RECT: Rect = { x: 268, y: 184, w: 180, h: 32 };

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

function board(showRanks: boolean): Scene {
  const items: Item[] = [
    { id: 'lab:cit', kind: 'text', rect: { x: 6, y: 36, w: 64, h: 54 }, text: '인용 수' },
    { id: 'lab:rank', kind: 'text', rect: { x: 6, y: 100, w: 64, h: 24 }, tone: 'muted', text: showRanks ? '순위 i+1' : '번호' },
    { id: 'lab:stat', kind: 'text', rect: { x: 6, y: 142, w: 64, h: 32 }, tone: 'muted', text: '판정' },
    { id: 'lab:ans', kind: 'text', rect: { x: 6, y: 184, w: 64, h: 32 }, text: 'H-Index' },
    { id: 'tok:stat', kind: 'token', rect: STATUS_RECT, tone: 'plain', text: '검사 전' },
    { id: 'tok:ans', kind: 'token', rect: ANS_RECT, tone: 'plain', text: 'h = 0' },
  ];
  CITATIONS.forEach((c, k) => items.push({ id: paperId(k), kind: 'cell', rect: cellAt(0, k), tone: 'plain', text: String(c) }));
  for (let s = 0; s < N; s++) {
    items.push({ id: `r:${s}`, kind: 'token', rect: rankRect(s), tone: 'muted', text: `${s + 1}위` });
  }
  return { width: W, height: H, items };
}

/* ------------------------------------------------------------------ */
/* 정석 내림차순 정렬 후 순위(i + 1)와 비교                              */
/* ------------------------------------------------------------------ */

function descSortViz(): Visualization {
  const rec = new PacedRecorder(board(true));
  let [h, work] = [0, 0];
  const meta = (i: number | '-', c: number | '-') => ({
    work,
    variables: { i, rank: i === '-' ? '-' : i + 1, c, h },
  });

  rec.step({ title: `인용 횟수 내림차순 정렬: ${list(SORTED)}`, codeHighlights: DESC_AT.sort, ...meta('-', '-') });
  rec.phase('정렬하기', '인용 횟수가 많은 논문부터 왼쪽에 오도록 내림차순으로 정렬합니다.', DESC_AT.sort);
  rec.do(...together(ORDER.map((k, s): Action => ({ type: 'set', id: paperId(k), patch: { rect: cellAt(0, s) } }))), wait(200));

  rec.step({ title: 'h = 0에서 시작', codeHighlights: DESC_AT.init, ...meta('-', '-') });
  rec.phase('초기화', '1위 논문(i = 0)부터 차례대로 인용 횟수 c가 순위(i + 1) 이상인지 확인합니다.', DESC_AT.init);
  rec.do({ type: 'set', id: 'tok:stat', patch: { text: 'c ≥ i + 1 비교 시작', tone: 'chosen' }, pop: true });

  for (let s = 0; s <= 4; s++) {
    const c = SORTED[s];
    const rank = s + 1;
    const ok = c >= rank;
    work++;
    if (ok) h = rank;

    rec.step({
      title: `${rank}위 논문: 인용 ${c}회 ${ok ? '≥' : '<'} ${rank}편 → ${ok ? `h = ${h}` : '멈춤'}`,
      codeHighlights: ok ? DESC_AT.pass : DESC_AT.stop,
      ...meta(s, c),
    });
    rec.phase('비교하기', `${rank}위 논문의 인용 횟수는 ${c}회입니다. ${rank}회 이상 인용된 논문이 ${rank}편 이상 되려면 ${c} ≥ ${rank}이어야 합니다.`, DESC_AT.check);
    rec.do(...together([
      { type: 'focus', ids: [sid(s), `r:${s}`] },
      paint(sid(s), 'current'),
      paint(`r:${s}`, 'chosen'),
    ]));
    rec.do({ type: 'arrow', from: sid(s), to: `r:${s}`, verdict: ok ? 'good' : 'bad', label: `${c} ${ok ? '≥' : '<'} ${rank}` }, wait(180));

    if (ok) {
      rec.phase('갱신하기', `${c} ≥ ${josa(rank, '이라', '라')} ${rank}회 이상 인용된 논문이 최소 ${rank}편 있습니다. h를 ${rank}로 갱신합니다.`, DESC_AT.pass);
      rec.do(...clear(
        paint(sid(s), 'visited'),
        paint(`r:${s}`, 'visited'),
        { type: 'set', id: 'tok:stat', patch: { text: `${rank}편이 ${rank}회 이상 통과`, tone: 'good' }, pop: true },
        { type: 'set', id: 'tok:ans', patch: { text: `h = ${h}`, tone: 'chosen' }, pop: true },
      ));
    } else {
      rec.phase('멈추기', `${c} < ${josa(rank, '이라', '라')} ${rank}위 논문부터는 ${rank}회 이상 인용되지 않았습니다. 뒤는 더 작으므로 멈춥니다.`, DESC_AT.stop);
      rec.do(...clear(
        paint(sid(s), 'bad'),
        paint(`r:${s}`, 'bad'),
        { type: 'set', id: 'tok:stat', patch: { text: `${c} < ${rank} → 탐색 종료`, tone: 'bad' }, pop: true },
      ));
    }
  }

  rec.step({ title: `최대 H-Index 확정: h = ${h}`, codeHighlights: DESC_AT.done, ...meta('-', '-'), answer: h, isKeyframe: true });
  rec.phase('정답', `4위 논문까지 4회 이상 인용되었고 5위 논문은 3회뿐이므로 H-Index는 ${h}입니다.`, DESC_AT.done);
  rec.do(...together([
    ...[0, 1, 2, 3].map((s): Action => paint(sid(s), 'path')),
    { type: 'set', id: 'tok:ans', patch: { text: `정답 h = ${h}`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 h = n부터 1까지 줄이며 논문 수 세기                              */
/* ------------------------------------------------------------------ */

function scanHViz(): Visualization {
  const rec = new PacedRecorder(board(false));
  let work = 0;
  const meta = (h: number | '-', count: number | '-') => ({
    work,
    variables: { n: N, h, count },
  });

  rec.step({ title: `n = ${N}에서 내려가며 검사 준비`, codeHighlights: SCAN_AT.init, ...meta('-', '-') });
  rec.phase('초기화', `정렬하지 않고 가능한 H-Index의 최댓값인 n = ${N}부터 1씩 줄이며 배열 전체를 훑어 논문 수를 셉니다.`, SCAN_AT.init);
  rec.do({ type: 'set', id: 'tok:stat', patch: { text: `h = ${N}부터 전체 스캔`, tone: 'chosen' }, pop: true });

  for (let cand = N; cand >= TRUTH; cand--) {
    const matchedIdx: number[] = [];
    for (let k = 0; k < N; k++) {
      work++;
      if (CITATIONS[k] >= cand) matchedIdx.push(k);
    }
    const count = matchedIdx.length;
    const ok = count >= cand;

    rec.step({
      title: `후보 h = ${cand}: ${cand}회 이상 논문 ${count}편 (${ok ? '통과' : '부족'})`,
      codeHighlights: ok ? SCAN_AT.found : SCAN_AT.loop,
      ...meta(cand, count),
    });
    rec.phase('전체 훑기', `배열의 논문 ${N}편을 전부 확인해 ${cand}회 이상 인용된 논문을 세면 ${count}편입니다.`, SCAN_AT.loop);
    rec.do(...together([
      { type: 'focus', ids: CITATIONS.map((_, k) => paperId(k)) },
      ...CITATIONS.map((c, k): Action => paint(paperId(k), c >= cand ? 'current' : 'explored')),
      { type: 'set', id: 'tok:stat', patch: { text: `h=${cand}: ${count}편 ≥ ${cand}?`, tone: ok ? 'good' : 'bad' }, pop: true },
    ]), wait(220));

    rec.phase('판정하기', ok
      ? `${count}편 ≥ ${cand}편이므로 조건을 만족하는 가장 큰 h = ${josa(cand, '을', '를')} 찾았습니다!`
      : `${count}편 < ${cand}편이라 모자랍니다. h를 1 줄여 다시 ${N}편을 처음부터 셉니다.`, ok ? SCAN_AT.found : SCAN_AT.cond);
    rec.do(...clear(...CITATIONS.map((c, k): Action => paint(paperId(k), ok && c >= cand ? 'visited' : 'plain'))));
  }

  rec.step({ title: `H-Index 확정: ${TRUTH} (비교 ${work}회)`, codeHighlights: SCAN_AT.found, ...meta(TRUTH, 4), answer: TRUTH, isKeyframe: true });
  rec.phase('정답', `정답 ${TRUTH}를 찾았지만, 정렬하지 않고 매번 논문 ${N}편을 다시 세느라 ${work}번 비교했습니다. 정석은 5번이면 됩니다.`, SCAN_AT.found);
  rec.do(...together([
    ...CITATIONS.map((c, k): Action => paint(paperId(k), c >= TRUTH ? 'path' : 'plain')),
    { type: 'set', id: 'tok:ans', patch: { text: `정답 h = ${TRUTH}`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 배열 안의 인용 횟수 중에서만 고르기                              */
/* ------------------------------------------------------------------ */

function arrayValueTrapViz(): Visualization {
  const rec = new PacedRecorder(board(true));
  let work = 0;
  const meta = (c: number | '-', count: number | '-') => ({
    work,
    variables: { candidateC: c, count, citations: list(SORTED) },
  });

  rec.step({ title: `내림차순 정렬: ${list(SORTED)}`, codeHighlights: TRAP_AT.sort, ...meta('-', '-') });
  rec.phase('정렬하기', '내림차순으로 정렬한 뒤, 배열에 들어 있는 인용 횟수 c를 차례로 H-Index 후보로 삼아 검사해 봅니다.', TRAP_AT.sort);
  rec.do(...together(ORDER.map((k, s): Action => ({ type: 'set', id: paperId(k), patch: { rect: cellAt(0, s) } }))), wait(200));

  // 고유 후보들(6, 5, 3)이 차례로 검사되는 과정(5가 세 번이지만 코드대로 s = 0..4를 진행한다)
  for (let s = 0; s <= 4; s++) {
    const c = SORTED[s];
    let count = 0;
    for (let j = 0; j < N; j++) {
      work++;
      if (SORTED[j] >= c) count++;
    }
    const ok = count >= c;

    rec.step({
      title: `${s + 1}번째 원소 c = ${c}: ${c}회 이상 ${count}편 (${ok ? '통과!' : '부족'})`,
      codeHighlights: ok ? TRAP_AT.ret : TRAP_AT.loop,
      ...meta(c, count),
    });
    rec.phase('원소 검사', `배열의 ${s + 1}번째 값인 c = ${josa(c, '을', '를')} 후보로 삼아 ${c}회 이상 인용된 논문을 세면 ${count}편입니다.`, TRAP_AT.loop);
    rec.do(...together([
      { type: 'focus', ids: [sid(s), `r:${s}`] },
      paint(sid(s), ok ? 'bad' : 'current'),
      { type: 'set', id: 'tok:stat', patch: { text: `후보 c=${c}: ${count}편 ${ok ? '≥' : '<'} ${c}`, tone: ok ? 'bad' : 'chosen' }, pop: true },
    ]));
    rec.do({ type: 'arrow', from: sid(s), to: `r:${s}`, verdict: ok ? 'bad' : 'seen', label: `${count}편 ${ok ? '≥' : '<'} ${c}` }, wait(180));

    rec.phase('판정하기', ok
      ? `c = 5에서 c = 3으로 건너뛰면서 배열에 없는 숫자 4를 검사하지 못하고 3을 반환해 버립니다!`
      : `${count}편 < ${c}편이므로 다음 원소로 넘어갑니다.`, ok ? TRAP_AT.ret : TRAP_AT.cond);
    rec.do(...clear(paint(sid(s), ok ? 'bad' : 'explored')));
  }

  const wrong = 3;
  rec.step({ title: `이 방법 ${wrong}, 정답은 ${TRUTH}`, codeHighlights: TRAP_AT.ret, ...meta(wrong, 5), answer: wrong, isKeyframe: true });
  rec.phase('오답 확인', `이 방법은 배열 안의 값만 후보로 보아 ${wrong}을 반환하지만, 4회 이상 인용된 논문이 4편(6, 5, 5, 5)이므로 정답은 ${TRUTH}입니다.`, TRAP_AT.ret);
  rec.do(...together([
    { type: 'set', id: 'tok:ans', patch: { text: `이 방법 h = ${wrong}`, tone: 'bad' }, pop: true },
    { type: 'add', item: { id: 'tok:truth', kind: 'token', rect: TRUTH_RECT, tone: 'good', text: `정답 h = ${TRUTH}` } },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'h-index',
  title: 'H-Index',
  level: 2,
  category: 'sort',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42747',
  description: {
    summary:
      '과학자가 발표한 논문 n편 중, h번 이상 인용된 논문이 h편 이상이고 나머지 논문이 h번 이하 인용되었다면 h의 최댓값이 이 과학자의 H-Index입니다. 논문의 인용 횟수를 담은 배열 citations가 주어질 때 H-Index를 구합니다.',
    rules: [
      '발표한 논문의 수 n은 1편 이상 1,000편 이하',
      '논문별 인용 횟수는 0회 이상 10,000회 이하',
      'H-Index는 citations 배열에 들어 있는 값과 같지 않을 수도 있음',
    ],
    examples: [
      { input: 'citations = [3, 0, 6, 1, 5]', output: '3' },
    ],
  },
  keyIntuitions: [
    '인용 횟수를 내림차순으로 정렬하면, 앞에서부터 (i + 1)번째 논문이 (i + 1)회 이상 인용되었는지만 보면 됩니다.',
    '(i + 1)번째 논문의 인용 횟수가 (i + 1) 이상이면 그 앞의 논문들은 전부 (i + 1)회 이상 인용된 것이므로 최소 (i + 1)편이 보장됩니다.',
    'H-Index는 논문 편수(순위)에서 나오는 값이므로 배열 안에 없는 숫자일 수도 있습니다.',
  ],
  demo: { input: [CITATIONS], label: 'citations = [6, 5, 3, 5, 1, 5, 2, 0]' },
  workUnit: '인용 횟수를 기준값과 비교한 횟수',
  approaches: [
    {
      id: 'h-index-desc',
      name: '내림차순 정렬 후 순위(i + 1)와 비교',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '많이 인용된 순으로 정렬한 뒤, c >= i + 1을 만족하는 마지막 순위(i + 1)를 한 번에 찾습니다.',
      pros: [
        '정렬한 뒤에는 앞에서부터 한 번만 훑다가 조건이 깨지는 즉시 멈추므로 매우 빠릅니다.',
        '배열에 없는 숫자라도 순위(i + 1)로 자연스럽게 찾아냅니다.',
        '추가 메모리가 필요 없습니다.',
      ],
      cons: ['0부터 시작하는 인덱스 i와 1부터 시작하는 논문 편수(i + 1)를 헷갈리지 않아야 합니다.'],
      whyThisRank:
        '내림차순 정렬을 해 두면 i번째 원소 하나로 "i + 1편 이상이 i + 1회 이상 인용되었는가"를 O(1)에 판정할 수 있어 가장 깔끔합니다.',
      code: DESC_SORT,
      visualize: descSortViz,
    },
    {
      id: 'h-index-scan-h',
      name: 'h = n부터 1까지 줄이며 논문 수 세기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(1)',
      verdict: '정렬하지 않고 가능한 h를 n부터 1까지 하나씩 줄여 가며 그때마다 전체 배열을 훑어 논문 수를 세는 풀이입니다.',
      pros: [
        '문제 정의("h번 이상 인용된 논문이 h편 이상")를 그대로 코드로 옮겨 이해하기 쉽습니다.',
        '배열에 없는 H-Index도 빠짐없이 찾습니다.',
      ],
      cons: [
        '후보 h마다 배열 전체를 다시 훑으므로 최악에 O(N²)번 비교합니다.',
      ],
      whyThisRank:
        '정확한 답을 내지만, 한 번 정렬해 두면 사라질 반복 집계를 후보 h마다 되풀이해 비교 횟수가 늘어납니다.',
      code: SCAN_H,
      visualize: scanHViz,
    },
    {
      id: 'h-index-from-array',
      name: '배열 안의 인용 횟수 중에서만 고르기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(1)',
      verdict: 'H-Index 후보를 배열에 들어 있는 인용 횟수 값으로만 한정해, 정답이 배열에 없는 숫자일 때 틀리는 함정입니다.',
      pros: ['공식 예제 [3, 0, 6, 1, 5]는 정답 3이 배열에 들어 있어서 우연히 통과합니다.'],
      cons: [
        '[6, 5, 5, 5, 3, 2, 1, 0]처럼 4회 이상 인용된 논문이 4편인데 배열에 4가 없으면 3을 반환합니다.',
        '[10, 10, 10]처럼 모든 인용 횟수가 논문 수(3)보다 크면 0을 반환해 틀립니다.',
      ],
      whyThisRank:
        'H-Index는 인용 횟수 자체가 아니라 "조건을 만족하는 논문 편수 h"의 최댓값이므로 1부터 n까지의 정수가 모두 후보가 되어야 합니다.',
      code: ARRAY_VALUE_TRAP,
      visualize: arrayValueTrapViz,
    },
  ],
  checks: {
    cases: [
      { args: [[3, 0, 6, 1, 5]], expected: 3 },
      { args: [[10, 10, 10]], expected: 3 },
      { args: [[0, 0, 0]], expected: 0 },
      { args: [[1]], expected: 1 },
      { args: [[0]], expected: 0 },
      { args: [[6, 5, 3, 5, 1, 5, 2, 0]], expected: 4 },
      { args: [[4, 4, 4, 5, 0, 1, 2, 3]], expected: 4 },
    ],
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 10);
      const citations = Array.from({ length: n }, () => Math.floor(rand() * 12));
      return [citations];
    },
  },
};

export default problem;
