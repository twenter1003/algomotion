// 테이블 해시 함수: 정석 다중 기준(col 오름차순, 기본키 내림차순) 정렬 후 구간 행만 계산, 대안 두 번 안정 정렬 후 전체 행 S_i를 다 구해 슬라이싱, 함정 동률일 때 기본키도 오름차순으로 정렬을 같은 장면에서 움직인다.
// 장면은 왼쪽에 행 번호(1~5행), 가운데에 5×3 테이블 칸(정렬하면 행째로 미끄러져 자리를 바꿈), 오른쪽에 행별 S_i 토큰, 아래에 XOR 누적 결과 표시다.
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

// 시각화 입력. 정석과 대안은 4 (S_2=1, S_3=6, S_4=3 → 1 ^ 6 ^ 3 = 4), 기본키도 오름차순으로 정렬하는 함정은 0 (1 ^ 3 ^ 2 = 0)이 나온다.
const DATA = [
  [2, 2, 5],
  [1, 5, 9],
  [4, 2, 9],
  [3, 8, 3],
  [5, 5, 8],
];
const COL = 2;
const ROW_BEGIN = 2;
const ROW_END = 4;
const R = DATA.length;
const C = DATA[0].length;
const BEST_ORDER = DATA.map((_, r) => r).sort((a, b) => DATA[a][COL - 1] - DATA[b][COL - 1] || DATA[b][0] - DATA[a][0]);
const TRAP_ORDER = DATA.map((_, r) => r).sort((a, b) => DATA[a][COL - 1] - DATA[b][COL - 1] || DATA[a][0] - DATA[b][0]);
const TRUTH = 4;
const fmtRow = (row: number[]) => `[${row.join(', ')}]`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const MULTI_KEY = {
  python: `def solution(data, col, row_begin, row_end):
    # col번째 열 오름차순, 같으면 첫 번째 열(기본키) 내림차순(-r[0]) 정렬
    data.sort(key=lambda r: (r[col - 1], -r[0]))
    answer = 0
    for i in range(row_begin, row_end + 1):
        s_i = sum(v % i for v in data[i - 1])
        answer ^= s_i
    return answer`,
  javascript: `function solution(data, col, row_begin, row_end) {
  // col번째 열 오름차순, 같으면 첫 번째 열(기본키) 내림차순 정렬
  data.sort((a, b) => a[col - 1] - b[col - 1] || b[0] - a[0]);
  let answer = 0;
  for (let i = row_begin; i <= row_end; i++) {
    const sI = data[i - 1].reduce((acc, v) => acc + (v % i), 0);
    answer ^= sI;
  }
  return answer;
}`,
};
const BEST_AT = {
  sort: lines(MULTI_KEY, ['data.sort(key=lambda r: (r[col - 1], -r[0]))'], ['data.sort((a, b) => a[col - 1] - b[col - 1] || b[0] - a[0])']),
  init: lines(MULTI_KEY, ['answer = 0'], ['let answer = 0']),
  mod: lines(MULTI_KEY, ['for i in range(row_begin, row_end + 1):', 's_i = sum(v % i for v in data[i - 1])'], ['for (let i = row_begin; i <= row_end; i++)', 'const sI = data[i - 1].reduce']),
  xor: lines(MULTI_KEY, ['answer ^= s_i'], ['answer ^= sI']),
  done: lines(MULTI_KEY, ['return answer'], ['return answer']),
};

const TWO_SORT_ALL_S = {
  python: `def solution(data, col, row_begin, row_end):
    # 1차로 기본키 내림차순 정렬 후, 2차로 col번째 열 오름차순 안정 정렬
    rows = sorted(data, key=lambda r: -r[0])
    rows.sort(key=lambda r: r[col - 1])
    # 모든 행의 S_i를 다 구한 뒤 필요한 구간만 골라 XOR한다
    s_all = [sum(v % (idx + 1) for v in row) for idx, row in enumerate(rows)]
    answer = 0
    for s_i in s_all[row_begin - 1 : row_end]:
        answer ^= s_i
    return answer`,
  javascript: `function solution(data, col, row_begin, row_end) {
  // 1차로 기본키 내림차순 정렬 후, 2차로 col번째 열 오름차순 안정 정렬
  const rows = [...data].sort((a, b) => b[0] - a[0]);
  rows.sort((a, b) => a[col - 1] - b[col - 1]);
  // 모든 행의 S_i를 다 구한 뒤 필요한 구간만 골라 XOR합니다
  const sAll = rows.map((row, idx) => row.reduce((acc, v) => acc + (v % (idx + 1)), 0));
  let answer = 0;
  for (let i = row_begin - 1; i < row_end; i++) {
    answer ^= sAll[i];
  }
  return answer;
}`,
};
const ALT_AT = {
  sort1: lines(TWO_SORT_ALL_S, ['rows = sorted(data, key=lambda r: -r[0])'], ['const rows = [...data].sort((a, b) => b[0] - a[0])']),
  sort2: lines(TWO_SORT_ALL_S, ['rows.sort(key=lambda r: r[col - 1])'], ['rows.sort((a, b) => a[col - 1] - b[col - 1])']),
  sAll: lines(TWO_SORT_ALL_S, ['s_all = [sum(v % (idx + 1) for v in row)'], ['const sAll = rows.map']),
  xor: lines(TWO_SORT_ALL_S, ['answer = 0', 'for s_i in s_all[row_begin - 1 : row_end]:', 'answer ^= s_i'], ['let answer = 0', 'for (let i = row_begin - 1; i < row_end; i++)', 'answer ^= sAll[i]']),
  done: lines(TWO_SORT_ALL_S, ['return answer'], ['return answer']),
};

const ASC_TIE_TRAP = {
  python: `def solution(data, col, row_begin, row_end):
    # 함정: 동률일 때도 기본키를 오름차순(r[0])으로 정렬해 버린다
    data.sort(key=lambda r: (r[col - 1], r[0]))
    answer = 0
    for i in range(row_begin, row_end + 1):
        s_i = sum(v % i for v in data[i - 1])
        answer ^= s_i
    return answer`,
  javascript: `function solution(data, col, row_begin, row_end) {
  // 함정: 동률일 때도 기본키를 오름차순(a[0] - b[0])으로 정렬해 버립니다
  data.sort((a, b) => a[col - 1] - b[col - 1] || a[0] - b[0]);
  let answer = 0;
  for (let i = row_begin; i <= row_end; i++) {
    const sI = data[i - 1].reduce((acc, v) => acc + (v % i), 0);
    answer ^= sI;
  }
  return answer;
}`,
};
const TRAP_AT = {
  sort: lines(ASC_TIE_TRAP, ['data.sort(key=lambda r: (r[col - 1], r[0]))'], ['data.sort((a, b) => a[col - 1] - b[col - 1] || a[0] - b[0])']),
  init: lines(ASC_TIE_TRAP, ['answer = 0'], ['let answer = 0']),
  mod: lines(ASC_TIE_TRAP, ['for i in range(row_begin, row_end + 1):', 's_i = sum(v % i for v in data[i - 1])', 'answer ^= s_i'], ['for (let i = row_begin; i <= row_end; i++)', 'const sI = data[i - 1].reduce', 'answer ^= sI']),
  done: lines(ASC_TIE_TRAP, ['return answer'], ['return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 580;
const H = 356;
const cellAt = grid({ x: 82, y: 38, rows: R, cols: C, cell: 46, gap: 6 });
const sRect = (slot: number): Rect => ({ x: 256, y: cellAt(slot, 0).y + 7, w: 150, h: 32 });
const cId = (origRow: number, col: number) => `c:${origRow}:${col}`;
const sTokId = (slot: number) => `s:${slot}`;
const ANS_RECT: Rect = { x: 82, y: 306, w: 210, h: 32 };
const TRUTH_RECT: Rect = { x: 304, y: 306, w: 210, h: 32 };

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const paintRow = (origRow: number, tone: Tone): Action[] =>
  Array.from({ length: C }, (_, c): Action => ({ type: 'set', id: cId(origRow, c), patch: { tone } }));
const moveRows = (order: number[], toneOf?: (slot: number) => Tone): Action[] =>
  order.flatMap((origRow, slot) =>
    Array.from({ length: C }, (_, c): Action => ({
      type: 'set',
      id: cId(origRow, c),
      patch: { rect: cellAt(slot, c), ...(toneOf ? { tone: toneOf(slot) } : {}) },
    })),
  );

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:c0', kind: 'text', rect: { x: 82, y: 10, w: 46, h: 22 }, tone: 'muted', text: '1열(PK)' },
    { id: 'hdr:c1', kind: 'text', rect: { x: 134, y: 10, w: 46, h: 22 }, tone: 'chosen', text: '2열(기준)' },
    { id: 'hdr:c2', kind: 'text', rect: { x: 186, y: 10, w: 46, h: 22 }, tone: 'muted', text: '3열' },
    { id: 'hdr:s', kind: 'text', rect: { x: 256, y: 10, w: 150, h: 22 }, tone: 'muted', text: '나머지 합 S_i' },
    { id: 'lab:ans', kind: 'text', rect: { x: 8, y: 306, w: 68, h: 32 }, text: 'XOR 결과' },
    { id: 'tok:ans', kind: 'token', rect: ANS_RECT, tone: 'plain', text: 'answer = 0' },
  ];
  for (let r = 0; r < R; r++) {
    items.push({ id: `lab:r${r}`, kind: 'text', rect: { x: 8, y: cellAt(r, 0).y, w: 68, h: 46 }, text: `i = ${r + 1}` });
    items.push({ id: sTokId(r), kind: 'token', rect: sRect(r), tone: 'muted', text: `S_${r + 1} 대기` });
    for (let c = 0; c < C; c++) {
      items.push({ id: cId(r, c), kind: 'cell', rect: cellAt(r, c), tone: 'plain', text: String(DATA[r][c]) });
    }
  }
  return { width: W, height: H, items };
}

/* ------------------------------------------------------------------ */
/* 정석 다중 기준 정렬 + 구간 행만 나머지 합산                           */
/* ------------------------------------------------------------------ */

function multiKeyViz(): Visualization {
  const rec = new PacedRecorder(board());
  let [answer, work] = [0, 0];
  const meta = (i: number | '-' = '-', sI: number | '-' = '-') => ({
    work,
    variables: { col: COL, range: `${ROW_BEGIN}..${ROW_END}`, i, s_i: sI, answer },
  });

  rec.step({ title: `정렬 기준 확인: ${COL}열 오름차순, 1열(PK) 내림차순`, codeHighlights: BEST_AT.sort, ...meta() });
  rec.phase('기준 열 확인', `${COL}번째 열 값을 오름차순으로 보되, 값이 같으면 1번째 열(기본키)이 큰 행이 위로 오게 정렬합니다.`, BEST_AT.sort);
  rec.do(...together(Array.from({ length: R }, (_, r): Action => ({ type: 'set', id: cId(r, COL - 1), patch: { tone: 'current' } }))), wait(200));

  rec.step({ title: '2열 동률(2와 5)은 기본키 내림차순으로 순서 결정', codeHighlights: BEST_AT.sort, ...meta() });
  rec.phase('동률 비교', '2열이 2로 같은 [2, 2, 5]와 [4, 2, 9]는 기본키 4 > 2순으로, 2열이 5로 같은 [1, 5, 9]와 [5, 5, 8]은 기본키 5 > 1순으로 놓습니다.', BEST_AT.sort);
  rec.do(...together([
    { type: 'focus', ids: [cId(0, 0), cId(2, 0), cId(1, 0), cId(4, 0)] },
    { type: 'set', id: cId(2, 0), patch: { tone: 'good' } },
    { type: 'set', id: cId(4, 0), patch: { tone: 'good' } },
  ]));
  rec.do({ type: 'arrow', from: cId(2, 0), to: cId(0, 0), verdict: 'good', label: 'PK 4 > 2' }, wait(200));

  rec.step({ title: '다중 기준으로 5개 행 정렬 배치', codeHighlights: BEST_AT.sort, ...meta() });
  rec.phase('정렬하기', '(r[col-1], -r[0]) 키 하나로 5개 행이 한 번에 제자리로 이동합니다.', BEST_AT.sort);
  rec.do(...clear(...moveRows(BEST_ORDER, () => 'plain')), wait(250));

  rec.step({ title: `구간 선택: i = ${ROW_BEGIN}부터 ${ROW_END}까지, answer = 0`, codeHighlights: BEST_AT.init, ...meta() });
  rec.phase('초기화', `1번째 행과 5번째 행은 건너뛰고, i = ${ROW_BEGIN}..${ROW_END}인 세 행만 S_i를 계산합니다.`, BEST_AT.init);
  rec.do(...together([
    ...paintRow(BEST_ORDER[0], 'explored'),
    ...paintRow(BEST_ORDER[4], 'explored'),
    { type: 'set', id: 'tok:ans', patch: { text: 'answer = 0', tone: 'chosen' }, pop: true },
  ]), wait(200));

  for (let i = ROW_BEGIN; i <= ROW_END; i++) {
    const slot = i - 1;
    const orig = BEST_ORDER[slot];
    const row = DATA[orig];
    const mods = row.map((v) => v % i);
    const sI = mods.reduce((a, b) => a + b, 0);
    const prevAns = answer;
    work += C;

    rec.step({
      title: `i = ${i}행 ${fmtRow(row)}: S_${i} = ${mods.join('+')} = ${sI}`,
      codeHighlights: BEST_AT.mod,
      ...meta(i, sI),
    });
    rec.phase('나머지 합산', `i = ${i}번째 행의 각 원소를 ${ro(i)} 나눈 나머지(${mods.join(', ')})를 더하면 S_${i} = ${sI}입니다.`, BEST_AT.mod);
    rec.do(...together([
      { type: 'focus', ids: [cId(orig, 0), cId(orig, 1), cId(orig, 2), sTokId(slot)] },
      ...paintRow(orig, 'current'),
      { type: 'set', id: sTokId(slot), patch: { text: `S_${i} = ${mods.join('+')} = ${sI}`, tone: 'chosen' }, pop: true },
    ]), wait(200));

    answer = prevAns ^ sI;
    rec.step({
      title: `XOR 누적: ${prevAns} ^ ${sI} = ${answer}`,
      codeHighlights: BEST_AT.xor,
      ...meta(i, sI),
    });
    rec.phase('XOR 누적', `answer = ${prevAns} ^ ${sI} = ${ro(answer)} 갱신합니다.`, BEST_AT.xor);
    rec.do(...clear(
      ...paintRow(orig, 'visited'),
      { type: 'set', id: sTokId(slot), patch: { tone: 'visited' } },
      { type: 'set', id: 'tok:ans', patch: { text: `answer = ${answer}`, tone: 'chosen' }, pop: true },
    ));
  }

  rec.step({ title: `해시 값 완성: ${answer} (나머지 연산 ${work}회)`, codeHighlights: BEST_AT.done, ...meta('-', '-'), answer, isKeyframe: true });
  rec.phase('정답', `필요한 구간(i = ${ROW_BEGIN}..${ROW_END})의 9칸만 나머지를 구하고 XOR해 정답 ${josa(answer, '을', '를')} 얻었습니다.`, BEST_AT.done);
  rec.do(...together([
    ...paintRow(BEST_ORDER[1], 'path'),
    ...paintRow(BEST_ORDER[2], 'path'),
    ...paintRow(BEST_ORDER[3], 'path'),
    { type: 'set', id: 'tok:ans', patch: { text: `정답 ${answer}`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 두 번 안정 정렬 + 모든 행의 S_i를 다 구한 뒤 구간 XOR            */
/* ------------------------------------------------------------------ */

function twoSortAllSViz(): Visualization {
  const rec = new PacedRecorder(board());
  let [answer, work] = [0, 0];
  const pkDescOrder = DATA.map((_, r) => r).sort((a, b) => DATA[b][0] - DATA[a][0]);
  const sAll: number[] = [];
  const meta = (stepDesc: string) => ({
    work,
    variables: { step: stepDesc, s_all: `[${sAll.join(', ')}]`, answer },
  });

  rec.step({ title: '1차 정렬: 기본키(1열) 내림차순 정렬', codeHighlights: ALT_AT.sort1, ...meta('1차 PK 내림차순') });
  rec.phase('1차 정렬', '복합 키 대신 먼저 1열(기본키) 내림차순으로 전체 행을 정렬합니다.', ALT_AT.sort1);
  rec.do(...together(moveRows(pkDescOrder, () => 'chosen')), wait(250));

  rec.step({ title: `2차 정렬: ${COL}열 오름차순 안정 정렬`, codeHighlights: ALT_AT.sort2, ...meta('2차 col 오름차순') });
  rec.phase('2차 정렬', `그다음 ${COL}열 오름차순으로 안정 정렬해 다중 기준 순서를 맞춥니다.`, ALT_AT.sort2);
  rec.do(...together(moveRows(BEST_ORDER, () => 'plain')), wait(250));

  for (let slot = 0; slot < R; slot++) {
    const i = slot + 1;
    const orig = BEST_ORDER[slot];
    const row = DATA[orig];
    const mods = row.map((v) => v % i);
    const sI = mods.reduce((a, b) => a + b, 0);
    sAll.push(sI);
    work += C;
    const inRange = i >= ROW_BEGIN && i <= ROW_END;

    rec.step({
      title: `전체 행 계산 i = ${i}${inRange ? '' : '(구간 밖)'}: S_${i} = ${sI}`,
      codeHighlights: ALT_AT.sAll,
      ...meta(`S_${i} 계산`),
    });
    rec.phase('전체 S_i 계산', inRange
      ? `구간 안인 i = ${i}행의 나머지 합 S_${i} = ${josa(sI, '을', '를')} 배열에 담습니다.`
      : `i = ${i}행은 구간(${ROW_BEGIN}..${ROW_END}) 밖인데도 전체 리스트 컴프리헨션이라 나머지 연산 ${C}번을 수행합니다.`, ALT_AT.sAll);
    rec.do(...together([
      { type: 'focus', ids: [cId(orig, 0), cId(orig, 1), cId(orig, 2), sTokId(slot)] },
      ...paintRow(orig, inRange ? 'current' : 'explored'),
      { type: 'set', id: sTokId(slot), patch: { text: `S_${i} = ${sI}`, tone: inRange ? 'chosen' : 'muted' }, pop: true },
    ]), wait(180));
    rec.phase('저장하기', `s_all 배열에 ${josa(sI, '을', '를')} 추가합니다.`, ALT_AT.sAll);
    rec.do(...clear(...paintRow(orig, inRange ? 'visited' : 'explored')));
  }

  for (let i = ROW_BEGIN; i <= ROW_END; i++) answer ^= sAll[i - 1];
  rec.step({ title: `구간 S_2..S_4만 슬라이싱해 XOR: ${answer}`, codeHighlights: ALT_AT.xor, ...meta('구간 XOR') });
  rec.phase('구간 XOR', `s_all에서 ${ROW_BEGIN}~${ROW_END}번째 값(${sAll.slice(ROW_BEGIN - 1, ROW_END).join(', ')})만 꺼내 XOR하면 ${answer}입니다.`, ALT_AT.xor);
  rec.do({ type: 'set', id: 'tok:ans', patch: { text: `answer = ${answer}`, tone: 'chosen' }, pop: true }, wait(200));

  rec.step({ title: `해시 값 완성: ${answer} (나머지 연산 ${work}회)`, codeHighlights: ALT_AT.done, ...meta('완료'), answer, isKeyframe: true });
  rec.phase('정답', `답은 ${ro(answer)} 같지만, 두 번 정렬하고 구간 밖 행까지 나머지를 다 계산해 ${work}번 연산했습니다(정석은 9번).`, ALT_AT.done);
  rec.do(...together([
    ...paintRow(BEST_ORDER[1], 'path'),
    ...paintRow(BEST_ORDER[2], 'path'),
    ...paintRow(BEST_ORDER[3], 'path'),
    { type: 'set', id: 'tok:ans', patch: { text: `정답 ${answer}`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 동률일 때 기본키도 오름차순으로 정렬                              */
/* ------------------------------------------------------------------ */

function ascTieTrapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let [answer, work] = [0, 0];
  const meta = (i: number | '-' = '-', sI: number | '-' = '-') => ({
    work,
    variables: { i, s_i: sI, answer },
  });

  rec.step({ title: '함정 정렬: 2열 오름차순 + 1열(기본키)도 오름차순', codeHighlights: TRAP_AT.sort, ...meta() });
  rec.phase('동률 방향 실수', '동률일 때 기본키를 내림차순(-r[0])으로 뒤집지 않고 그대로 오름차순(r[0])으로 정렬해 버립니다!', TRAP_AT.sort);
  rec.do(...together(moveRows(TRAP_ORDER, (slot) => (slot <= 3 ? 'bad' : 'plain'))), wait(250));

  rec.step({ title: '동률 행들의 자리(i = 1..4)가 정석과 뒤바뀜', codeHighlights: TRAP_AT.init, ...meta() });
  rec.phase('행 번호 왜곡', 'i = 2 자리에 [2, 2, 5] 대신 [4, 2, 9]가, i = 3 자리에 [5, 5, 8] 대신 [1, 5, 9]가 놓이면서 나눌 수 i가 전부 달라집니다.', TRAP_AT.init);
  rec.do({ type: 'set', id: 'tok:ans', patch: { text: 'answer = 0', tone: 'bad' }, pop: true }, wait(200));

  for (let i = ROW_BEGIN; i <= ROW_END; i++) {
    const slot = i - 1;
    const orig = TRAP_ORDER[slot];
    const row = DATA[orig];
    const mods = row.map((v) => v % i);
    const sI = mods.reduce((a, b) => a + b, 0);
    work += C;
    answer ^= sI;

    rec.step({
      title: `잘못 놓인 i = ${i}행 ${fmtRow(row)}: S_${i} = ${sI} → XOR ${answer}`,
      codeHighlights: TRAP_AT.mod,
      ...meta(i, sI),
    });
    rec.phase('나머지 및 XOR', `엉뚱한 행 ${fmtRow(row)}을 ${ro(i)} 나누어 S_${i} = ${josa(sI, '이', '가')} 나오고, answer는 ${josa(answer, '이', '가')} 됩니다.`, TRAP_AT.mod);
    rec.do(...together([
      { type: 'focus', ids: [cId(orig, 0), cId(orig, 1), cId(orig, 2), sTokId(slot)] },
      ...paintRow(orig, 'bad'),
      { type: 'set', id: sTokId(slot), patch: { text: `S_${i} = ${mods.join('+')} = ${sI}`, tone: 'bad' }, pop: true },
      { type: 'set', id: 'tok:ans', patch: { text: `answer = ${answer}`, tone: 'bad' }, pop: true },
    ]), wait(180));
    rec.phase('다음 행', `잘못된 S_${i}가 누적되었습니다.`, TRAP_AT.mod);
    rec.do(...clear());
  }

  rec.step({ title: `이 방법 ${answer}, 정답은 ${TRUTH}`, codeHighlights: TRAP_AT.done, ...meta('-', '-'), answer, isKeyframe: true });
  rec.phase('오답 확인', `동률 행의 정렬 방향이 반대여서 각 행을 나누는 번호 i가 바뀌어 ${josa(answer, '이', '가')} 나왔습니다. 정답은 ${TRUTH}입니다.`, TRAP_AT.done);
  rec.do(...together([
    { type: 'set', id: 'tok:ans', patch: { text: `이 방법 ${answer}`, tone: 'bad' }, pop: true },
    { type: 'add', item: { id: 'tok:truth', kind: 'token', rect: TRUTH_RECT, tone: 'good', text: `정답 ${TRUTH}` } },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'table-hash',
  title: '테이블 해시 함수',
  level: 2,
  category: 'sort',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/147354',
  description: {
    summary:
      '2차원 테이블 data의 행들을 col번째 컬럼 값 기준 오름차순으로 정렬하되, 값이 같으면 첫 번째 컬럼(기본키) 값 기준 내림차순으로 정렬합니다. 정렬된 테이블에서 row_begin번째 행부터 row_end번째 행까지(1부터 시작), i번째 행의 각 원소를 i로 나눈 나머지들의 합 S_i를 모두 비트 XOR(^)한 값을 반환합니다.',
    rules: [
      'data의 행 수는 1 이상 2,500 이하, 열 수는 1 이상 500 이하',
      '원소는 1 이상 1,000,000 이하의 자연수',
      '첫 번째 컬럼은 기본키이므로 모든 행에서 값이 중복되지 않음',
      'col, row_begin, row_end는 모두 1부터 시작하는 번호(1-based)',
    ],
    examples: [
      {
        input: 'data = [[2,2,6],[1,5,10],[4,2,9],[3,8,3]], col = 2, row_begin = 2, row_end = 3',
        output: '4',
      },
    ],
  },
  keyIntuitions: [
    '1차 기준은 오름차순(r[col - 1]), 2차 기준은 내림차순(-r[0])이므로 부호를 반대로 주면 정렬 한 번으로 끝납니다.',
    'col, row_begin, row_end, 그리고 나눗셈에 쓰는 행 번호 i까지 모두 1부터 시작(1-based)한다는 점을 정확히 맞춰야 합니다.',
    'S_i는 row_begin부터 row_end 사이의 행에 대해서만 구하면 되므로 구간 밖의 행은 나머지를 계산할 필요가 없습니다.',
  ],
  demo: {
    input: [DATA, COL, ROW_BEGIN, ROW_END],
    label: 'data = [[2,2,5],[1,5,9],[4,2,9],[3,8,3],[5,5,8]], col = 2, row_begin = 2, row_end = 4',
  },
  workUnit: '원소의 나머지(%)를 계산한 횟수',
  approaches: [
    {
      id: 'table-hash-multi-key',
      name: '다중 기준 한 번에 정렬 + 구간 행만 계산',
      rank: 'BEST',
      timeComplexity: 'O(R log R + (row_end - row_begin) · C)',
      spaceComplexity: 'O(1)',
      verdict: '(r[col - 1], -r[0]) 다중 기준으로 한 번에 정렬하고, row_begin..row_end 구간의 행만 나머지 합을 구해 즉시 XOR하는 정석 풀이입니다.',
      pros: [
        '정렬 한 번으로 오름차순 주 기준과 내림차순 보조 기준을 동시에 해결합니다.',
        '필요한 구간의 행만 계산하고 별도의 S_i 배열도 만들지 않아 빠르고 간결합니다.',
      ],
      cons: ['1-based 번호(col, i)와 0-based 배열 인덱스(col - 1, i - 1)를 헷갈리지 않아야 합니다.'],
      whyThisRank:
        '정렬 횟수와 나머지 연산 횟수, 추가 메모리를 모두 최소로 쓰는 가장 깔끔한 풀이입니다.',
      code: MULTI_KEY,
      visualize: multiKeyViz,
    },
    {
      id: 'table-hash-two-sort-all-s',
      name: '두 번 나누어 안정 정렬 + 전체 행 S_i 계산',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(R log R + R · C)',
      spaceComplexity: 'O(R)',
      verdict: '보조 기준과 주 기준으로 두 번 정렬하고, 모든 행의 S_i를 배열로 다 만들어 둔 뒤 구간을 잘라 XOR하는 풀이입니다.',
      pros: [
        '안정 정렬의 성질을 이용해 정렬 기준을 하나씩 단계별로 적용할 수 있습니다.',
        '정석과 똑같은 정답을 냅니다.',
      ],
      cons: [
        '정렬을 두 번 수행하고, row_begin..row_end 밖의 행까지 모두 나머지 연산을 수행해 불필요한 계산과 메모리가 듭니다.',
      ],
      whyThisRank:
        '정답은 같지만, 복합 키 하나로 한 번에 할 정렬을 두 번 나누어 하고 필요 없는 행의 S_i까지 모두 계산하므로 손해를 봅니다.',
      code: TWO_SORT_ALL_S,
      visualize: twoSortAllSViz,
    },
    {
      id: 'table-hash-asc-tie-trap',
      name: '동률일 때 기본키도 오름차순으로 정렬',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(R log R + (row_end - row_begin) · C)',
      spaceComplexity: 'O(1)',
      verdict: 'col번째 열이 같을 때 기본키를 내림차순으로 정렬하라는 조건을 놓치고 둘 다 오름차순으로 정렬하는 함정입니다.',
      pros: ['동률이 없는 입력에서는 정석과 같은 결과를 냅니다.'],
      cons: [
        '동률인 행들의 순서가 뒤집히면서 각 행이 놓이는 행 번호 i가 달라지고, i로 나눈 나머지 합 S_i가 완전히 달라집니다.',
      ],
      whyThisRank:
        'S_i는 행의 위치 번호 i로 나누어 구하므로, 동률 정렬 방향 하나만 틀려도 해시 값이 전혀 다르게 나옵니다.',
      code: ASC_TIE_TRAP,
      visualize: ascTieTrapViz,
    },
  ],
  checks: {
    cases: [
      {
        args: [[[2, 2, 6], [1, 5, 10], [4, 2, 9], [3, 8, 3]], 2, 2, 3],
        expected: 4,
      },
      {
        args: [[[1, 2, 3]], 1, 1, 1],
        expected: 0,
      },
      {
        args: [[[1, 5, 4], [2, 5, 4], [3, 5, 4]], 2, 1, 3],
        expected: 5,
      },
      {
        args: [DATA, COL, ROW_BEGIN, ROW_END],
        expected: TRUTH,
      },
    ],
    random: (rand) => {
      const r = 2 + Math.floor(rand() * 5);
      const c = 2 + Math.floor(rand() * 3);
      const pks = Array.from({ length: r }, (_, idx) => idx + 1);
      for (let i = r - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [pks[i], pks[j]] = [pks[j], pks[i]];
      }
      const data = pks.map((pk) => [pk, ...Array.from({ length: c - 1 }, () => 1 + Math.floor(rand() * 12))]);
      const col = 1 + Math.floor(rand() * c);
      const a = 1 + Math.floor(rand() * r);
      const b = 1 + Math.floor(rand() * r);
      return [data, col, Math.min(a, b), Math.max(a, b)];
    },
  },
};

export default problem;
