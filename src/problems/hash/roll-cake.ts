// 롤케이크 자르기: 정석 오른쪽 개수 사전 + 왼쪽 집합으로 한 칸씩 옮기기, 대안 앞뒤 누적 종류 수 배열 두 개 만들기, 함정 자르는 위치마다 양쪽을 잘라 집합 만들기를 같은 장면에서 움직인다.
// 장면은 위에 롤케이크 토핑 8칸과 칼날 선, 가운데에 왼쪽(철수)과 오른쪽(동생)의 토핑 현황 상자, 아래에 자르는 위치 7곳의 판정 줄이다.
import { slots } from '../../engine/layout.ts';
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';

type Lines = Record<Language, number[]>;

// 원문 예제 1. 4번째 뒤(1,2,1,3 | 1,4,1,2)와 5번째 뒤(1,2,1,3,1 | 4,1,2)에서 양쪽 모두 3종류가 되어 정답은 2다.
const TOPPING = [1, 2, 1, 3, 1, 4, 1, 2];
const N = TOPPING.length;
const KINDS = [1, 2, 3, 4];
const dictText = (m: Map<number, number>) =>
  `{${[...m].filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`).join(', ')}}`;
const setText = (s: Set<number>) => `{${[...s].join(', ')}}`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const COUNTER = {
  python: `from collections import Counter

def solution(topping):
    right = Counter(topping)                    # 오른쪽 조각의 토핑별 남은 개수
    left = set()                                # 왼쪽 조각에 담긴 토핑 종류
    answer = 0

    for t in topping[:-1]:                      # 토핑을 하나씩 왼쪽으로 옮기며 자르기
        left.add(t)
        right[t] -= 1
        if right[t] == 0:
            del right[t]                        # 0개가 된 토핑은 사전에서 제거
        if len(left) == len(right):
            answer += 1
    return answer`,
  javascript: `function solution(topping) {
  const right = new Map(); // 오른쪽 조각의 토핑별 남은 개수
  for (const t of topping) right.set(t, (right.get(t) ?? 0) + 1);
  const left = new Set(); // 왼쪽 조각에 담긴 토핑 종류
  let answer = 0;

  for (let i = 0; i < topping.length - 1; i++) { // 토핑을 하나씩 왼쪽으로 옮기며 자르기
    const t = topping[i];
    left.add(t);
    if (right.get(t) === 1) right.delete(t); // 0개가 된 토핑은 사전에서 제거
    else right.set(t, right.get(t) - 1);

    if (left.size === right.size) answer++;
  }
  return answer;
}`,
};
const COUNTER_AT = {
  init: lines(COUNTER, ['right = Counter(topping)', 'left = set()', 'answer = 0'],
    ['const right = new Map()', 'for (const t of topping)', 'const left = new Set()']),
  move: lines(COUNTER, ['for t in topping[:-1]:', 'left.add(t)', 'right[t] -= 1', 'if right[t] == 0:', 'del right[t]'],
    ['for (let i = 0; i < topping.length - 1; i++)', 'left.add(t)', 'if (right.get(t) === 1) right.delete(t)', 'else right.set(t']),
  check: lines(COUNTER, ['if len(left) == len(right):', 'answer += 1'],
    ['if (left.size === right.size) answer++']),
  done: lines(COUNTER, ['return answer'], ['return answer']),
};

const PREFIX_SUFFIX = {
  python: `def solution(topping):
    n = len(topping)
    left_kinds = [0] * n
    right_kinds = [0] * n

    seen = set()
    for i in range(n):                          # 앞에서부터 누적 종류 수 기록
        seen.add(topping[i])
        left_kinds[i] = len(seen)

    seen.clear()
    for i in range(n - 1, -1, -1):              # 뒤에서부터 누적 종류 수 기록
        seen.add(topping[i])
        right_kinds[i] = len(seen)

    return sum(1 for i in range(n - 1) if left_kinds[i] == right_kinds[i + 1])`,
  javascript: `function solution(topping) {
  const n = topping.length;
  const leftKinds = new Array(n);
  const rightKinds = new Array(n);

  const seen = new Set();
  for (let i = 0; i < n; i++) { // 앞에서부터 누적 종류 수 기록
    seen.add(topping[i]);
    leftKinds[i] = seen.size;
  }

  seen.clear();
  for (let i = n - 1; i >= 0; i--) { // 뒤에서부터 누적 종류 수 기록
    seen.add(topping[i]);
    rightKinds[i] = seen.size;
  }

  let answer = 0;
  for (let i = 0; i < n - 1; i++) {
    if (leftKinds[i] === rightKinds[i + 1]) answer++;
  }
  return answer;
}`,
};
const PREFIX_AT = {
  leftPass: lines(PREFIX_SUFFIX, ['seen = set()', 'for i in range(n):', 'left_kinds[i] = len(seen)'],
    ['const seen = new Set()', 'for (let i = 0; i < n; i++)', 'leftKinds[i] = seen.size']),
  rightPass: lines(PREFIX_SUFFIX, ['seen.clear()', 'for i in range(n - 1, -1, -1):', 'right_kinds[i] = len(seen)'],
    ['seen.clear()', 'for (let i = n - 1; i >= 0; i--)', 'rightKinds[i] = seen.size']),
  compare: lines(PREFIX_SUFFIX, ['return sum(1 for i in range(n - 1) if left_kinds[i] == right_kinds[i + 1])'],
    ['for (let i = 0; i < n - 1; i++)', 'if (leftKinds[i] === rightKinds[i + 1]) answer++']),
  done: lines(PREFIX_SUFFIX, ['return sum(1 for i in range(n - 1)'], ['return answer']),
};

const SLICE_SET = {
  python: `# 주의: 자르는 위치마다 배열을 잘라 집합을 만들면 O(N²)이라 시간 초과가 납니다
def solution(topping):
    answer = 0
    for i in range(1, len(topping)):
        if len(set(topping[:i])) == len(set(topping[i:])):
            answer += 1
    return answer`,
  javascript: `// 주의: 자르는 위치마다 배열을 잘라 집합을 만들면 O(N²)이라 시간 초과가 납니다
function solution(topping) {
  let answer = 0;
  for (let i = 1; i < topping.length; i++) {
    const left = new Set(topping.slice(0, i));
    const right = new Set(topping.slice(i));
    if (left.size === right.size) answer++;
  }
  return answer;
}`,
};
const SLICE_AT = {
  cut: lines(SLICE_SET, ['for i in range(1, len(topping)):', 'if len(set(topping[:i])) == len(set(topping[i:])):'],
    ['for (let i = 1; i < topping.length; i++)', 'const left = new Set(topping.slice(0, i))', 'const right = new Set(topping.slice(i))']),
  match: lines(SLICE_SET, ['if len(set(topping[:i])) == len(set(topping[i:])):', 'answer += 1'],
    ['if (left.size === right.size) answer++']),
  done: lines(SLICE_SET, ['return answer'], ['return answer']),
};

const union = (...hs: Lines[]): Lines => ({
  python: [...new Set(hs.flatMap((h) => h.python))].sort((a, b) => a - b),
  javascript: [...new Set(hs.flatMap((h) => h.javascript))].sort((a, b) => a - b),
});

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const TOP_Y = 26;
const BOX_Y = 108;
const CELL_Y = 146;
const CUT_Y = 248;
const W = 620;
const H = 300;
const FULL: Rect = { x: 0, y: 0, w: W, h: H };

const topRect = slots({ x: 72, y: TOP_Y, w: 56, h: 52, gap: 8 });
const leftCell = slots({ x: 82, y: CELL_Y, w: 50, h: 64, gap: 8 });
const rightCell = slots({ x: 342, y: CELL_Y, w: 50, h: 64, gap: 8 });
const cutRect = slots({ x: 72, y: CUT_Y, w: 66, h: 36, gap: 8 });

const topId = (i: number) => `top:${i}`;
const leftId = (k: number) => `left:${k}`;
const rightId = (k: number) => `right:${k}`;
const cutId = (c: number) => `cut:${c}`;
const knifeX = (i: number) => topRect(i).x + 56 + 4;

function board(leftTitle: string, rightTitle: string): Scene {
  const items: Item[] = [
    { id: 'row:top', kind: 'text', rect: { x: 0, y: TOP_Y, w: 66, h: 52 }, text: '롤케이크' },
    { id: 'left:bg', kind: 'zone', rect: { x: 72, y: BOX_Y, w: 244, h: 114 } },
    { id: 'left:head', kind: 'text', rect: { x: 80, y: BOX_Y + 6, w: 228, h: 22 }, text: leftTitle },
    { id: 'right:bg', kind: 'zone', rect: { x: 332, y: BOX_Y, w: 244, h: 114 } },
    { id: 'right:head', kind: 'text', rect: { x: 340, y: BOX_Y + 6, w: 228, h: 22 }, text: rightTitle },
    { id: 'row:cut', kind: 'text', rect: { x: 0, y: CUT_Y, w: 66, h: 36 }, text: '자르기 위치' },
  ];
  TOPPING.forEach((t, i) => {
    items.push({ id: topId(i), kind: 'cell', rect: topRect(i), tone: 'plain', text: String(t), tag: `#${i}` });
  });
  KINDS.forEach((t, k) => {
    items.push(
      { id: leftId(k), kind: 'cell', rect: leftCell(k), tone: 'muted', text: '-', tag: `토핑 ${t}` },
      { id: rightId(k), kind: 'cell', rect: rightCell(k), tone: 'muted', text: '0', tag: `토핑 ${t}` },
    );
  });
  for (let c = 0; c < N - 1; c++) {
    items.push({ id: cutId(c), kind: 'token', rect: cutRect(c), tone: 'plain', text: `${c + 1}|${N - 1 - c}` });
  }
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석 양쪽 종류 수: 오른쪽 사전 초기화 → 한 칸씩 왼쪽으로 옮기며 비교       */
/* ------------------------------------------------------------------ */

function slideCutWithCounter(): Visualization {
  const rec = new StepRecorder(board('왼쪽 집합 (종류 0)', '오른쪽 사전 (종류 0)'));
  const right = new Map<number, number>();
  const left = new Set<number>();
  let checked = 0;
  let answer = 0;
  let cutPos = '-';
  const meta = () => ({
    work: checked,
    variables: { 자른위치: cutPos, left: setText(left), right: dictText(right), '양쪽 종류': `${left.size} vs ${right.size}`, answer },
  });

  for (const t of TOPPING) right.set(t, (right.get(t) ?? 0) + 1);
  checked += N;
  rec.step({
    title: `토핑 ${N}개를 모두 오른쪽 사전에 담기 (4종류)`,
    codeHighlights: COUNTER_AT.init,
    ...meta(),
  });
  rec.phase('오른쪽 사전 준비', `처음에는 롤케이크 전체를 오른쪽 조각으로 보고 토핑별 개수를 셉니다. 오른쪽은 4종류, 왼쪽은 0종류입니다.`, COUNTER_AT.init);
  rec.do(
    ...together(TOPPING.map((_, i) => paint(topId(i), 'queued'))),
    ...together(KINDS.map((t, k): Action => ({
      type: 'set', id: rightId(k), patch: { text: `${right.get(t)!}개`, tone: 'queued' }, pop: true,
    }))),
    { type: 'set', id: 'right:head', patch: { text: `오른쪽 사전 (종류 ${right.size})` } },
    wait(400),
  );

  for (let i = 0; i < N - 1; i++) {
    const t = TOPPING[i];
    const k = KINDS.indexOf(t);
    left.add(t);
    const rem = (right.get(t) ?? 0) - 1;
    if (rem <= 0) right.delete(t);
    else right.set(t, rem);
    checked += 1;
    cutPos = `${i + 1}|${N - 1 - i}`;
    const eq = left.size === right.size;
    if (eq) answer++;

    const x = knifeX(i);
    const moveKnife: Action = rec.has('knife')
      ? { type: 'trace', id: 'knife', points: [[x, TOP_Y - 8], [x, TOP_Y + 60]] }
      : { type: 'add', item: { id: 'knife', kind: 'line', rect: FULL, tone: 'current', points: [[x, TOP_Y - 8], [x, TOP_Y + 60]] } };

    rec.step({
      title: `${i + 1}번째 뒤 자르기: 토핑 ${t} 이동 → ${left.size}종류 vs ${right.size}종류${eq ? ' (공평!)' : ''}`,
      codeHighlights: union(COUNTER_AT.move, COUNTER_AT.check),
      ...meta(),
    });
    rec.phase(
      '한 칸 옮기기',
      `${i}번 칸의 토핑 ${josa(t, '을', '를')} 왼쪽으로 옮깁니다. 왼쪽 집합에 ${josa(t, '을', '를')} 넣고 오른쪽 사전에서 1을 뺍니다${rem === 0 ? ` (0개가 되어 오른쪽에서 토핑 ${t} 소멸!)` : ''}.`,
      COUNTER_AT.move,
    );
    rec.do(
      moveKnife,
      paint(topId(i), 'chosen'),
      { type: 'arrow', from: topId(i), to: leftId(k), verdict: 'good', label: '왼쪽 추가' },
      { type: 'arrow', from: topId(i), to: rightId(k), verdict: rem === 0 ? 'bad' : 'seen', label: rem === 0 ? '0개 삭제!' : '-1', together: true },
      ...together([
        { type: 'set', id: leftId(k), patch: { text: '있음', tone: 'chosen' }, pop: true },
        { type: 'set', id: rightId(k), patch: { text: `${rem}개`, tone: rem > 0 ? 'queued' : 'muted' }, pop: true },
        { type: 'set', id: 'left:head', patch: { text: `왼쪽 집합 (종류 ${left.size})` } },
        { type: 'set', id: 'right:head', patch: { text: `오른쪽 사전 (종류 ${right.size})` } },
      ]),
    );

    rec.phase(
      '종류 수 비교',
      eq
        ? `왼쪽 ${left.size}종류 = 오른쪽 ${right.size}종류로 똑같습니다! 공평한 자르기(${answer}번째)입니다.`
        : `왼쪽 ${left.size}종류 ≠ 오른쪽 ${right.size}종류라 공평하지 않습니다.`,
      COUNTER_AT.check,
    );
    rec.do(
      { type: 'clearMarks' },
      { type: 'set', id: cutId(i), patch: { text: `${left.size}:${right.size}${eq ? ' ✓' : ''}`, tone: eq ? 'good' : 'visited' }, pop: true },
      wait(200),
    );
  }

  rec.step({
    title: `공평하게 자르는 방법 ${answer}가지 (토핑 확인 ${checked}번)`,
    codeHighlights: COUNTER_AT.done,
    ...meta(),
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `칼날을 한 칸씩 옮기며 토핑 1개만 갱신해 총 ${checked}번의 확인만으로 ${answer}가지(4|4, 5|3)를 찾았습니다.`, COUNTER_AT.done);
  rec.do(
    ...together([paint(cutId(3), 'path'), paint(cutId(4), 'path')]),
    wait(500),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 앞뒤 누적 배열: 왼쪽 누적 기록 → 오른쪽 누적 기록 → 위치마다 비교     */
/* ------------------------------------------------------------------ */

function prefixSuffixArrays(): Visualization {
  const rec = new StepRecorder(board('앞에서 누적 (left_kinds)', '뒤에서 누적 (right_kinds)'));
  const leftKinds = new Array<number>(N).fill(0);
  const rightKinds = new Array<number>(N).fill(0);
  let checked = 0;
  let answer = 0;
  const meta = () => ({
    work: checked,
    variables: {
      left_kinds: `[${leftKinds.map((v) => v || '-').join(',')}]`,
      right_kinds: `[${rightKinds.map((v) => v || '-').join(',')}]`,
      answer,
    },
  });

  const seenLeft = new Set<number>();
  for (let i = 0; i < N; i++) {
    seenLeft.add(TOPPING[i]);
    leftKinds[i] = seenLeft.size;
  }
  checked += N;
  rec.step({
    title: `왼쪽→오른쪽 훑기: left_kinds = [${leftKinds.join(', ')}]`,
    codeHighlights: PREFIX_AT.leftPass,
    ...meta(),
  });
  rec.phase('앞에서 누적', `0번부터 끝까지 집합에 넣으며 i번까지 자른 왼쪽 조각의 종류 수를 배열에 적어 둡니다.`, PREFIX_AT.leftPass);
  rec.do(
    ...together(TOPPING.map((_, i): Action => ({
      type: 'set', id: topId(i), patch: { sub: `L:${leftKinds[i]}`, tone: 'chosen' }, pop: true,
    }))),
    ...together(KINDS.map((_, k): Action => ({
      type: 'set', id: leftId(k), patch: { text: '기록됨', tone: 'chosen' },
    }))),
    wait(400),
  );

  const seenRight = new Set<number>();
  for (let i = N - 1; i >= 0; i--) {
    seenRight.add(TOPPING[i]);
    rightKinds[i] = seenRight.size;
  }
  checked += N;
  rec.step({
    title: `오른쪽→왼쪽 훑기: right_kinds = [${rightKinds.join(', ')}]`,
    codeHighlights: PREFIX_AT.rightPass,
    ...meta(),
  });
  rec.phase('뒤에서 누적', `맨 뒤에서부터 거꾸로 집합에 넣으며 i번부터 끝까지 오른쪽 조각의 종류 수를 두 번째 배열에 적어 둡니다.`, PREFIX_AT.rightPass);
  rec.do(
    ...together(TOPPING.map((_, i): Action => ({
      type: 'set', id: topId(i), patch: { sub: `L${leftKinds[i]}·R${rightKinds[i]}`, tone: 'queued' }, pop: true,
    }))),
    ...together(KINDS.map((_, k): Action => ({
      type: 'set', id: rightId(k), patch: { text: '기록됨', tone: 'queued' },
    }))),
    wait(400),
  );

  for (let i = 0; i < N - 1; i++) {
    checked += 1;
    const l = leftKinds[i];
    const r = rightKinds[i + 1];
    const eq = l === r;
    if (eq) answer++;

    rec.step({
      title: `${i + 1}번째 뒤 비교: left_kinds[${i}](${l}) vs right_kinds[${i + 1}](${r})${eq ? ' → 같음!' : ''}`,
      codeHighlights: PREFIX_AT.compare,
      ...meta(),
    });
    rec.phase('배열 값 비교', `${i}번까지의 왼쪽 종류 수(${l})와 ${i + 1}번부터의 오른쪽 종류 수(${r})를 비교합니다.`, PREFIX_AT.compare);
    rec.do(
      { type: 'focus', ids: [topId(i), topId(i + 1)] },
      { type: 'arrow', from: topId(i), to: topId(i + 1), verdict: eq ? 'good' : 'seen', label: `${l} vs ${r}` },
      { type: 'set', id: cutId(i), patch: { text: `${l}:${r}${eq ? ' ✓' : ''}`, tone: eq ? 'good' : 'visited' }, pop: true },
    );
    rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }]));
  }

  rec.step({
    title: `정답 ${answer}가지 — 3번 훑어 총 ${checked}번 확인 (정석은 15번)`,
    codeHighlights: PREFIX_AT.done,
    ...meta(),
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `답은 ${answer}가지로 같지만, 길이 N짜리 배열 두 개를 추가로 만들고 세 번 훑어 ${checked}번(정석은 15번) 확인했습니다.`, PREFIX_AT.done);
  rec.do(...together([paint(cutId(3), 'path'), paint(cutId(4), 'path')]), wait(500));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 매번 잘라 집합 만들기: 위치마다 전체 N개를 다시 훑어 시간 초과      */
/* ------------------------------------------------------------------ */

function sliceSetEachCut(): Visualization {
  const rec = new StepRecorder(board('매번 set(topping[:i])', '매번 set(topping[i:])'));
  let checked = 0;
  let answer = 0;
  let cutPos = '-';
  let lSize: number | string = '-';
  let rSize: number | string = '-';
  const meta = () => ({
    work: checked,
    variables: { 자른위치: cutPos, 'len(left)': lSize, 'len(right)': rSize, answer },
  });

  for (let i = 1; i < N; i++) {
    const left = new Set(TOPPING.slice(0, i));
    const right = new Set(TOPPING.slice(i));
    checked += N;
    cutPos = `${i}|${N - i}`;
    lSize = left.size;
    rSize = right.size;
    const eq = left.size === right.size;
    if (eq) answer++;

    const x = knifeX(i - 1);
    const moveKnife: Action = rec.has('knife')
      ? { type: 'trace', id: 'knife', points: [[x, TOP_Y - 8], [x, TOP_Y + 60]] }
      : { type: 'add', item: { id: 'knife', kind: 'line', rect: FULL, tone: 'bad', points: [[x, TOP_Y - 8], [x, TOP_Y + 60]] } };

    rec.step({
      title: `${i}|${N - i} 자르기: ${N}개를 처음부터 다시 잘라 집합 생성 (누적 ${checked}번)`,
      codeHighlights: eq ? union(SLICE_AT.cut, SLICE_AT.match) : SLICE_AT.cut,
      ...meta(),
    });
    rec.phase('처음부터 다시 세기', `앞 ${i}개와 뒤 ${N - i}개를 잘라 두 집합을 처음부터 새로 만듭니다. 토핑 ${N}개를 통째로 다시 읽습니다.`, SLICE_AT.cut);
    rec.do(
      moveKnife,
      ...together(TOPPING.map((_, idx) => paint(topId(idx), idx < i ? 'chosen' : 'queued'))),
      ...together(KINDS.map((t, k): Action => ({
        type: 'set', id: leftId(k), patch: { text: left.has(t) ? '있음' : '-', tone: left.has(t) ? 'chosen' : 'muted' },
      }))),
      ...together(KINDS.map((t, k): Action => ({
        type: 'set', id: rightId(k), patch: { text: right.has(t) ? '있음' : '-', tone: right.has(t) ? 'queued' : 'muted' },
      }))),
      { type: 'set', id: cutId(i - 1), patch: { text: `${left.size}:${right.size}${eq ? ' ✓' : ''}`, tone: eq ? 'good' : 'bad' }, pop: true },
      wait(250),
    );
  }

  rec.step({
    title: `확인 ${checked}번 끝에 ${answer}가지 — N=100만이면 약 1조 번으로 시간 초과`,
    codeHighlights: SLICE_AT.done,
    ...meta(),
    answer,
    isKeyframe: true,
  });
  rec.phase('시간 초과', `8개에서도 ${checked}번(정석은 15번) 확인했습니다. 토핑이 100만 개면 자르는 위치마다 100만 개를 다시 세어 약 1조 번이 걸려 시간 초과입니다.`, SLICE_AT.done);
  rec.do(...together(Array.from({ length: N - 1 }, (_, c) => paint(cutId(c), 'bad'))), wait(600));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'roll-cake',
  title: '롤케이크 자르기',
  level: 2,
  category: 'hash',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/132265',
  description: {
    summary:
      '일렬로 놓인 롤케이크를 한 번 잘라 철수와 동생이 왼쪽·오른쪽 조각을 나눠 갖습니다. 조각의 크기와 상관없이 두 조각에 올라간 서로 다른 토핑의 종류 수가 같을 때 공평하다고 할 때, 공평하게 자르는 방법의 수를 구합니다.',
    rules: [
      '1 ≤ topping의 길이 ≤ 1,000,000',
      '1 ≤ topping의 원소 ≤ 10,000',
      '공평하게 나누는 방법이 없으면 0을 반환',
    ],
    examples: [
      { input: 'topping = [1, 2, 1, 3, 1, 4, 1, 2]', output: '2' },
      { input: 'topping = [1, 2, 3, 1, 4]', output: '0' },
    ],
  },
  keyIntuitions: [
    '칼날이 오른쪽으로 한 칸 움직일 때 바뀌는 것은 그 칸의 토핑 하나뿐입니다: 오른쪽 조각에서 1개 줄고 왼쪽 조각에 1개 들어갑니다.',
    '왼쪽은 들어오기만 하니 집합(Set)으로 종류 수를 관리하고, 오른쪽은 빠질 때 아직 같은 토핑이 남았는지 알아야 하므로 개수 사전(Map/Counter)으로 관리합니다.',
    '오른쪽 사전에서 어떤 토핑의 개수가 0이 되는 순간 그 키를 지우면, 사전의 크기(len / size)가 곧 오른쪽에 남은 토핑 종류 수입니다.',
  ],
  demo: {
    input: [TOPPING],
    label: 'topping = [1, 2, 1, 3, 1, 4, 1, 2]',
  },
  workUnit: '토핑을 확인한 횟수',
  approaches: [
    {
      id: 'roll-cake-counter',
      name: '오른쪽 개수 사전 + 왼쪽 집합으로 한 칸씩 옮기기',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(K)',
      verdict: '오른쪽은 개수 사전, 왼쪽은 집합으로 두고 토핑을 하나씩 옮기며 크기만 비교하는 풀이입니다.',
      pros: [
        '자르는 위치를 옮길 때마다 연산이 O(1)이라 토핑이 100만 개여도 금방 끝납니다.',
        '길이가 N인 추가 배열 없이 토핑 종류 수(최대 10,000)만큼의 사전과 집합만 씁니다.',
      ],
      cons: [
        '오른쪽 사전에서 개수가 0이 된 토핑 키를 반드시 삭제해야 size/len이 실제 종류 수와 맞습니다.',
      ],
      whyThisRank:
        '"추가만 일어나는 왼쪽은 집합, 삭제가 일어나는 오른쪽은 빈도 사전"이라는 해시 자료구조의 역할을 가장 잘 보여주는 정석 풀이입니다.',
      code: COUNTER,
      visualize: slideCutWithCounter,
    },
    {
      id: 'roll-cake-prefix-suffix',
      name: '앞뒤 누적 종류 수 배열 두 개 만들기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '앞에서부터 센 종류 수 배열과 뒤에서부터 센 종류 수 배열을 미리 만들어 비교하는 풀이입니다.',
      pros: [
        '개수를 1씩 줄이다 0이 되면 키를 삭제하는 로직 없이 집합(Set)만으로 구현할 수 있습니다.',
        '앞에서 한 번, 뒤에서 한 번 훑는 대칭 구조라 이해하기 쉽습니다.',
      ],
      cons: [
        '길이 N(최대 100만)짜리 배열 두 개를 추가로 만들어야 해서 메모리를 더 씁니다.',
        '배열 전체를 세 번(앞→뒤, 뒤→앞, 비교) 훑으므로 정석보다 확인 횟수와 메모리가 모두 늘어납니다.',
      ],
      whyThisRank:
        '시간 복잡도는 O(N)으로 통과하지만, 빈도 사전을 쓰면 누적 배열 두 개와 세 번째 순회를 아낄 수 있어 대안으로 둡니다.',
      code: PREFIX_SUFFIX,
      visualize: prefixSuffixArrays,
    },
    {
      id: 'roll-cake-slice-set',
      name: '자르는 위치마다 양쪽을 잘라 집합 만들기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '매 위치마다 배열을 슬라이싱해 집합 크기를 비교하므로 N이 100만이면 시간 초과가 납니다.',
      pros: [
        '문제 설명 그대로 코드로 옮겨 두세 줄이면 작성할 수 있습니다.',
      ],
      cons: [
        '자르는 위치 N − 1곳마다 길이 N인 배열을 잘라 집합을 새로 만드므로 약 N²번 동작합니다.',
        'N = 1,000,000이면 연산 횟수가 약 1조 번에 달해 시간 초과가 납니다.',
      ],
      whyThisRank:
        '칼날이 한 칸 이동할 때 토핑 하나만 바뀐다는 성질을 쓰지 않고 매번 전체를 다시 세는 전형적인 O(N²) 시간 초과 함정입니다.',
      code: SLICE_SET,
      visualize: sliceSetEachCut,
    },
  ],
  checks: {
    cases: [
      { args: [[1, 2, 1, 3, 1, 4, 1, 2]], expected: 2 },
      { args: [[1, 2, 3, 1, 4]], expected: 0 },
      { args: [[1]], expected: 0 },
      { args: [[1, 1]], expected: 1 },
      { args: [[1, 2, 1, 2]], expected: 1 },
      { args: [[1, 1, 1, 1]], expected: 3 },
    ],
    // 길이 2~9, 토핑 종류 1~4
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 8);
      return [Array.from({ length: n }, () => 1 + Math.floor(rand() * 4))];
    },
  },
};

export default problem;
