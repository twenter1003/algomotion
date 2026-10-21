// 할인 행사: 정석 10일 창을 한 칸씩 밀며 양 끝만 갱신하기, 대안 시작일마다 10일 구간을 처음부터 다시 세기, 함정 빠지는 날을 빼지 않고 누적만 하기를 같은 장면에서 움직인다.
// 장면은 위에 14일치 할인 품목 줄과 10일 창 테두리, 가운데에 품목별 목표 수량과 창 안 개수 표, 아래에 시작일별 판정 줄이다.
import { slots } from '../../engine/layout.ts';
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';

type Lines = Record<Language, number[]>;

// 원문 예제 1. 3일째, 4일째, 5일째 시작 구간이 일치해 정답은 3이다.
const WANT = ['banana', 'apple', 'rice', 'pork', 'pot'];
const NUMBER = [3, 2, 2, 2, 1];
const DISCOUNT = [
  'chicken', 'apple', 'apple', 'banana', 'rice', 'apple', 'pork',
  'banana', 'pork', 'rice', 'pot', 'banana', 'apple', 'banana',
];
const N = DISCOUNT.length;
const WIN = 10;
const STARTS = N - WIN + 1; // 5개의 시작일(0..4)
const RIGHT = 3;

const ITEMS = ['banana', 'apple', 'rice', 'pork', 'pot', 'chicken'];
const SHORT: Record<string, string> = {
  banana: '바나나',
  apple: '사과',
  rice: '쌀',
  pork: '돼지',
  pot: '냄비',
  chicken: '치킨',
};
const TARGET = new Map<string, number>(WANT.map((w, i) => [w, NUMBER[i]]));
const dictText = (m: Map<string, number>) =>
  `{${[...m].filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`).join(', ')}}`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const SLIDING = {
  python: `def solution(want, number, discount):
    target = dict(zip(want, number))            # 원하는 품목 → 목표 수량
    window = {}
    for item in discount[:10]:                  # 첫 10일 창 세기
        window[item] = window.get(item, 0) + 1

    answer = 1 if window == target else 0
    for i in range(1, len(discount) - 9):       # 창을 하루씩 오른쪽으로 밀기
        out_item = discount[i - 1]              # 창에서 빠지는 날
        window[out_item] -= 1
        if window[out_item] == 0:
            del window[out_item]
        in_item = discount[i + 9]               # 창에 새로 들어오는 날
        window[in_item] = window.get(in_item, 0) + 1
        if window == target:
            answer += 1
    return answer`,
  javascript: `function solution(want, number, discount) {
  const target = new Map(want.map((w, i) => [w, number[i]]));
  const window = new Map();
  for (let i = 0; i < 10; i++) { // 첫 10일 창 세기
    window.set(discount[i], (window.get(discount[i]) ?? 0) + 1);
  }

  const same = () => target.size === window.size
    && [...target].every(([k, v]) => window.get(k) === v);
  let answer = same() ? 1 : 0;

  for (let i = 1; i <= discount.length - 10; i++) { // 창을 하루씩 오른쪽으로 밀기
    const outItem = discount[i - 1]; // 창에서 빠지는 날
    if (window.get(outItem) === 1) window.delete(outItem);
    else window.set(outItem, window.get(outItem) - 1);

    const inItem = discount[i + 9]; // 창에 새로 들어오는 날
    window.set(inItem, (window.get(inItem) ?? 0) + 1);
    if (same()) answer++;
  }
  return answer;
}`,
};
const SLIDING_AT = {
  target: lines(SLIDING, ['target = dict(zip(want, number))'], ['const target = new Map(']),
  firstWin: lines(SLIDING, ['window = {}', 'for item in discount[:10]:', 'window[item] = window.get(item, 0) + 1'],
    ['const window = new Map()', 'for (let i = 0; i < 10; i++)', 'window.set(discount[i]']),
  firstCheck: lines(SLIDING, ['answer = 1 if window == target else 0'],
    ['const same = () =>', 'let answer = same() ? 1 : 0']),
  slide: lines(SLIDING, ['for i in range(1, len(discount) - 9):', 'out_item = discount[i - 1]', 'in_item = discount[i + 9]'],
    ['for (let i = 1; i <= discount.length - 10; i++)', 'const outItem = discount[i - 1]', 'const inItem = discount[i + 9]']),
  check: lines(SLIDING, ['if window == target:', 'answer += 1'], ['if (same()) answer++']),
  done: lines(SLIDING, ['return answer'], ['return answer']),
};

const RECOUNT = {
  python: `from collections import Counter

def solution(want, number, discount):
    target = dict(zip(want, number))
    answer = 0

    for i in range(len(discount) - 9):
        # 시작일마다 10일치를 처음부터 다시 센다
        window = Counter(discount[i:i + 10])
        if window == target:
            answer += 1
    return answer`,
  javascript: `function solution(want, number, discount) {
  const target = new Map(want.map((w, i) => [w, number[i]]));
  let answer = 0;

  for (let i = 0; i <= discount.length - 10; i++) {
    // 시작일마다 10일치를 처음부터 다시 센다
    const window = new Map();
    for (let j = i; j < i + 10; j++) {
      window.set(discount[j], (window.get(discount[j]) ?? 0) + 1);
    }
    const ok = target.size === window.size
      && [...target].every(([k, v]) => window.get(k) === v);
    if (ok) answer++;
  }
  return answer;
}`,
};
const RECOUNT_AT = {
  target: lines(RECOUNT, ['target = dict(zip(want, number))', 'answer = 0'],
    ['const target = new Map(', 'let answer = 0']),
  loop: lines(RECOUNT, ['for i in range(len(discount) - 9):', 'window = Counter(discount[i:i + 10])'],
    ['for (let i = 0; i <= discount.length - 10; i++)', 'const window = new Map()', 'for (let j = i; j < i + 10; j++)']),
  check: lines(RECOUNT, ['if window == target:', 'answer += 1'],
    ['const ok = target.size === window.size', 'if (ok) answer++']),
  done: lines(RECOUNT, ['return answer'], ['return answer']),
};

const FORGET_OUT = {
  python: `# 주의: 창을 밀 때 지나간 날의 품목을 빼지 않아 틀리는 풀이입니다
def solution(want, number, discount):
    target = dict(zip(want, number))
    window = {}
    for item in discount[:10]:
        window[item] = window.get(item, 0) + 1

    answer = 1 if window == target else 0
    for i in range(1, len(discount) - 9):
        in_item = discount[i + 9]               # 새로 들어오는 날만 더하고 빠지는 날을 안 뺌!
        window[in_item] = window.get(in_item, 0) + 1
        if window == target:
            answer += 1
    return answer`,
  javascript: `// 주의: 창을 밀 때 지나간 날의 품목을 빼지 않아 틀리는 풀이입니다
function solution(want, number, discount) {
  const target = new Map(want.map((w, i) => [w, number[i]]));
  const window = new Map();
  for (let i = 0; i < 10; i++) {
    window.set(discount[i], (window.get(discount[i]) ?? 0) + 1);
  }

  const same = () => target.size === window.size
    && [...target].every(([k, v]) => window.get(k) === v);
  let answer = same() ? 1 : 0;

  for (let i = 1; i <= discount.length - 10; i++) {
    const inItem = discount[i + 9]; // 새로 들어오는 날만 더하고 빠지는 날을 안 뺌!
    window.set(inItem, (window.get(inItem) ?? 0) + 1);
    if (same()) answer++;
  }
  return answer;
}`,
};
const FORGET_AT = {
  init: lines(FORGET_OUT, ['target = dict(zip(want, number))', 'for item in discount[:10]:', 'answer = 1 if window == target else 0'],
    ['const target = new Map(', 'for (let i = 0; i < 10; i++)', 'let answer = same() ? 1 : 0']),
  slide: lines(FORGET_OUT, ['for i in range(1, len(discount) - 9):', 'in_item = discount[i + 9]', 'window[in_item] = window.get(in_item, 0) + 1'],
    ['for (let i = 1; i <= discount.length - 10; i++)', 'const inItem = discount[i + 9]', 'window.set(inItem']),
  check: lines(FORGET_OUT, ['if window == target:', 'answer += 1'], ['if (same()) answer++']),
  done: lines(FORGET_OUT, ['return answer'], ['return answer']),
};

const union = (...hs: Lines[]): Lines => ({
  python: [...new Set(hs.flatMap((h) => h.python))].sort((a, b) => a - b),
  javascript: [...new Set(hs.flatMap((h) => h.javascript))].sort((a, b) => a - b),
});

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const DAY_Y = 26;
const TARGET_Y = 108;
const CUR_Y = 170;
const START_Y = 248;
const W = 670;
const H = 300;

const dayRect = slots({ x: 60, y: DAY_Y, w: 40, h: 48, gap: 3 });
const itemCol = slots({ x: 68, y: TARGET_Y, w: 88, h: 50, gap: 8 });
const curCol = slots({ x: 68, y: CUR_Y, w: 88, h: 50, gap: 8 });
const startRect = slots({ x: 68, y: START_Y, w: 82, h: 34, gap: 8 });
const ANS_RECT: Rect = { x: 526, y: START_Y, w: 132, h: 34 };
const winRect = (s: number): Rect => ({
  x: dayRect(s).x - 2,
  y: DAY_Y - 4,
  w: WIN * 40 + (WIN - 1) * 3 + 4,
  h: 56,
});

const dayId = (i: number) => `day:${i}`;
const targetId = (k: number) => `target:${k}`;
const curId = (k: number) => `cur:${k}`;
const startId = (s: number) => `start:${s}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'row:day', kind: 'text', rect: { x: 0, y: DAY_Y, w: 56, h: 48 }, text: '할인 일정' },
    { id: 'row:target', kind: 'text', rect: { x: 0, y: TARGET_Y, w: 62, h: 50 }, text: '목표 수량' },
    { id: 'row:cur', kind: 'text', rect: { x: 0, y: CUR_Y, w: 62, h: 50 }, text: '창 안 개수' },
    { id: 'row:start', kind: 'text', rect: { x: 0, y: START_Y, w: 62, h: 34 }, text: '시작일 판정' },
  ];
  DISCOUNT.forEach((d, i) => {
    items.push({ id: dayId(i), kind: 'cell', rect: dayRect(i), tone: 'plain', text: SHORT[d], tag: `${i + 1}일` });
  });
  ITEMS.forEach((item, k) => {
    const goal = TARGET.get(item) ?? 0;
    items.push(
      { id: targetId(k), kind: 'cell', rect: itemCol(k), tone: goal > 0 ? 'chosen' : 'muted', text: String(goal), tag: SHORT[item] },
      { id: curId(k), kind: 'cell', rect: curCol(k), tone: 'plain', text: '0', tag: item },
    );
  });
  for (let s = 0; s < STARTS; s++) {
    items.push({ id: startId(s), kind: 'token', rect: startRect(s), tone: 'plain', text: `${s + 1}일째: 대기` });
  }
  items.push({ id: 'ans', kind: 'token', rect: ANS_RECT, tone: 'chosen', text: '가능 0일' });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

const syncCounts = (win: Map<string, number>): Action[] =>
  together(ITEMS.map((item, k): Action => {
    const c = win.get(item) ?? 0;
    const goal = TARGET.get(item) ?? 0;
    return {
      type: 'set',
      id: curId(k),
      patch: { text: String(c), tone: c === goal ? 'good' : 'bad' },
      pop: true,
    };
  }));

const paintWindowDays = (s: number): Action[] =>
  together(DISCOUNT.map((_, i) => paint(dayId(i), i >= s && i < s + WIN ? 'chosen' : 'plain')));

const isMatch = (win: Map<string, number>) =>
  ITEMS.every((item) => (win.get(item) ?? 0) === (TARGET.get(item) ?? 0));

/* ------------------------------------------------------------------ */
/* 정석 슬라이딩 윈도우: 첫 10일 세기 → 하루씩 밀며 양 끝 갱신 → 판정      */
/* ------------------------------------------------------------------ */

function slidingWindow(): Visualization {
  const rec = new StepRecorder(board());
  const win = new Map<string, number>();
  let checked = 0;
  let answer = 0;
  let startDay = '-';
  let outItem = '-';
  let inItem = '-';
  const meta = () => ({
    work: checked,
    variables: { 시작일: startDay, 빠짐: outItem, 들어옴: inItem, window: dictText(win), answer },
  });

  rec.step({
    title: '원하는 품목과 목표 수량 사전 만들기',
    codeHighlights: SLIDING_AT.target,
    ...meta(),
  });
  rec.phase('목표 사전', '정현이가 원하는 품목 5가지의 목표 수량(합계 10개)을 사전에 기록합니다. 치킨은 목표가 0개입니다.', SLIDING_AT.target);
  rec.do(...together(ITEMS.map((_, k) => ({ type: 'focus' as const, ids: [targetId(k)] }))), wait(400), { type: 'unfocus' });

  for (let i = 0; i < 5; i++) win.set(DISCOUNT[i], (win.get(DISCOUNT[i]) ?? 0) + 1);
  checked += 5;
  startDay = '1일째(준비)';
  rec.step({
    title: '첫 10일 창 세기 (1/2): 1일~5일 품목 담기',
    codeHighlights: SLIDING_AT.firstWin,
    ...meta(),
  });
  rec.phase('앞 5일 세기', '먼저 1일째부터 5일째까지 할인 품목 5개를 창에 담아 개수를 셉니다.', SLIDING_AT.firstWin);
  rec.do(
    { type: 'add', item: { id: 'win', kind: 'zone', rect: winRect(0), tone: 'chosen' } },
    ...together(Array.from({ length: 5 }, (_, i) => paint(dayId(i), 'current'))),
    ...syncCounts(win),
    wait(300),
  );

  for (let i = 5; i < 10; i++) win.set(DISCOUNT[i], (win.get(DISCOUNT[i]) ?? 0) + 1);
  checked += 5;
  rec.step({
    title: '첫 10일 창 세기 (2/2): 6일~10일 품목 담기',
    codeHighlights: SLIDING_AT.firstWin,
    ...meta(),
  });
  rec.phase('뒤 5일 세기', '6일째부터 10일째까지 마저 담아 첫 10일 창(1일~10일)의 개수 세기를 마칩니다.', SLIDING_AT.firstWin);
  rec.do(
    ...paintWindowDays(0),
    ...syncCounts(win),
    wait(300),
  );

  startDay = '1일째(1~10일)';
  rec.step({
    title: '1일째(1~10일) 판정: 치킨 1개·사과 3개라 불일치',
    codeHighlights: SLIDING_AT.firstCheck,
    ...meta(),
  });
  rec.phase('1일째 판정', '1일~10일 창에는 치킨이 1개 끼어 있고 바나나(2<3)와 냄비(0<1)가 부족해 가입할 수 없습니다.', SLIDING_AT.firstCheck);
  rec.do(
    { type: 'set', id: startId(0), patch: { text: '1일째: 불가', tone: 'bad' }, pop: true },
    wait(350),
  );

  for (let s = 1; s < STARTS; s++) {
    const out = DISCOUNT[s - 1];
    const inc = DISCOUNT[s + WIN - 1];
    win.set(out, (win.get(out) ?? 0) - 1);
    if ((win.get(out) ?? 0) <= 0) win.delete(out);
    win.set(inc, (win.get(inc) ?? 0) + 1);
    checked += 2;
    startDay = `${s + 1}일째(${s + 1}~${s + WIN}일)`;
    outItem = `${s}일(${SHORT[out]})`;
    inItem = `${s + WIN}일(${SHORT[inc]})`;
    const ok = isMatch(win);
    if (ok) answer++;

    rec.step({
      title: `${s + 1}일째: ${SHORT[out]} 빠지고 ${SHORT[inc]} 들어옴 → ${ok ? `일치! (${answer}일째 가능)` : '불일치'}`,
      codeHighlights: union(SLIDING_AT.slide, SLIDING_AT.check),
      ...meta(),
    });
    rec.phase(
      '창 한 칸 밀기',
      `창을 오른쪽으로 한 칸 밀어 ${s}일째 ${josa(SHORT[out], '은', '는')} 1 빼고, ${s + WIN}일째 ${josa(SHORT[inc], '은', '는')} 1 더합니다. 가운데 9일은 다시 세지 않습니다.`,
      SLIDING_AT.slide,
    );
    rec.do(
      ...together([
        { type: 'set', id: 'win', patch: { rect: winRect(s), tone: ok ? 'good' : 'chosen' } },
        ...paintWindowDays(s),
        paint(dayId(s - 1), 'muted'),
        paint(dayId(s + WIN - 1), 'current'),
      ]),
      { type: 'arrow', from: dayId(s - 1), to: curId(ITEMS.indexOf(out)), verdict: 'bad', label: '-1' },
      { type: 'arrow', from: dayId(s + WIN - 1), to: curId(ITEMS.indexOf(inc)), verdict: 'good', label: '+1', together: true },
      ...syncCounts(win),
    );

    rec.phase(
      '목표와 비교',
      ok
        ? `모든 품목 수량이 목표와 정확히 일치합니다! 가능한 날짜가 ${ro(answer)} 늘어납니다.`
        : '아직 목표 수량과 다른 품목이 있어 이 날은 가입하지 않습니다.',
      SLIDING_AT.check,
    );
    rec.do(
      ...together([
        { type: 'clearMarks' },
        paint(dayId(s + WIN - 1), 'chosen'),
        { type: 'set', id: startId(s), patch: { text: `${s + 1}일째: ${ok ? '가능!' : '불가'}`, tone: ok ? 'good' : 'bad' }, pop: true },
        { type: 'set', id: 'ans', patch: { text: `가능 ${answer}일`, tone: answer > 0 ? 'good' : 'chosen' }, pop: ok },
      ]),
    );
  }

  rec.step({
    title: `총 ${answer}일(3일·4일·5일째) 등록 가능 — 품목 갱신 ${checked}번`,
    codeHighlights: SLIDING_AT.done,
    ...meta(),
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `3일째, 4일째, 5일째에 등록하면 10일 동안 원하는 품목을 모두 할인받습니다. 양 끝만 갱신해 ${checked}번만 세고 끝났습니다.`, SLIDING_AT.done);
  rec.do(
    ...together([
      paint(startId(2), 'path'),
      paint(startId(3), 'path'),
      paint(startId(4), 'path'),
      { type: 'set', id: 'ans', patch: { text: `정답 ${answer}일`, tone: 'path' }, pop: true },
    ]),
    wait(500),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 매번 다시 세기: 시작일마다 10일 구간을 처음부터 다시 세기            */
/* ------------------------------------------------------------------ */

function recountEveryWindow(): Visualization {
  const rec = new StepRecorder(board());
  let checked = 0;
  let answer = 0;
  let startDay = '-';
  let winText = '-';
  const meta = () => ({
    work: checked,
    variables: { 시작일: startDay, window: winText, answer },
  });

  rec.step({
    title: '목표 수량 사전 준비하기',
    codeHighlights: RECOUNT_AT.target,
    ...meta(),
  });
  rec.phase('목표 사전', '원하는 품목과 목표 수량을 사전에 저장하고 시작일마다 10일 구간을 검사합니다.', RECOUNT_AT.target);
  rec.do({ type: 'add', item: { id: 'win', kind: 'zone', rect: winRect(0), tone: 'chosen' } }, wait(350));

  for (let s = 0; s < STARTS; s++) {
    const win = new Map<string, number>();
    for (let j = s; j < s + WIN; j++) win.set(DISCOUNT[j], (win.get(DISCOUNT[j]) ?? 0) + 1);
    checked += WIN;
    startDay = `${s + 1}일째(${s + 1}~${s + WIN}일)`;
    winText = dictText(win);
    const ok = isMatch(win);
    if (ok) answer++;

    rec.step({
      title: `${s + 1}일째: ${s + 1}~${s + WIN}일 10개를 처음부터 다시 세기 → ${ok ? '일치!' : '불일치'}`,
      codeHighlights: union(RECOUNT_AT.loop, RECOUNT_AT.check),
      ...meta(),
    });
    rec.phase('10일 다시 세기', `${s + 1}일째부터 ${s + WIN}일째까지 10칸을 처음부터 모두 다시 셉니다 (누적 ${checked}번).`, RECOUNT_AT.loop);
    rec.do(
      ...together([
        { type: 'set', id: 'win', patch: { rect: winRect(s), tone: ok ? 'good' : 'chosen' } },
        ...paintWindowDays(s),
        ...syncCounts(win),
      ]),
      wait(250),
    );

    rec.phase('판정', ok ? '목표 수량과 모두 같으므로 answer를 1 늘립니다.' : '목표 수량과 다른 품목이 있어 넘어갑니다.', RECOUNT_AT.check);
    rec.do(
      ...together([
        { type: 'set', id: startId(s), patch: { text: `${s + 1}일째: ${ok ? '가능!' : '불가'}`, tone: ok ? 'good' : 'bad' }, pop: true },
        { type: 'set', id: 'ans', patch: { text: `가능 ${answer}일`, tone: answer > 0 ? 'good' : 'chosen' }, pop: ok },
      ]),
    );
  }

  rec.step({
    title: `총 ${answer}일 가능 — 품목 세기 ${checked}번 (정석은 18번)`,
    codeHighlights: RECOUNT_AT.done,
    ...meta(),
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `답은 ${answer}일로 같지만, 겹치는 9일을 매번 다시 세어 품목을 ${checked}번(정석은 18번) 확인했습니다.`, RECOUNT_AT.done);
  rec.do(
    ...together([
      paint(startId(2), 'path'),
      paint(startId(3), 'path'),
      paint(startId(4), 'path'),
      { type: 'set', id: 'ans', patch: { text: `정답 ${answer}일`, tone: 'path' }, pop: true },
    ]),
    wait(500),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 빠지는 날 안 빼기: 들어오는 날만 더하다가 개수가 부풀어 오답          */
/* ------------------------------------------------------------------ */

function forgetOutgoing(): Visualization {
  const rec = new StepRecorder(board());
  const win = new Map<string, number>();
  let checked = 0;
  let answer = 0;
  let startDay = '-';
  let inItem = '-';
  const meta = () => ({
    work: checked,
    variables: { 시작일: startDay, 들어옴: inItem, window: dictText(win), answer },
  });

  for (let i = 0; i < WIN; i++) win.set(DISCOUNT[i], (win.get(DISCOUNT[i]) ?? 0) + 1);
  checked += WIN;
  startDay = '1일째(1~10일)';
  rec.step({
    title: '1일째(1~10일) 세기: 여기까지는 정석과 같음 (불일치)',
    codeHighlights: FORGET_AT.init,
    ...meta(),
  });
  rec.phase('첫 10일 세기', '첫 10일(1~10일)을 세어 비교합니다. 치킨이 끼어 있고 냄비가 없어 1일째는 불가입니다.', FORGET_AT.init);
  rec.do(
    { type: 'add', item: { id: 'win', kind: 'zone', rect: winRect(0), tone: 'bad' } },
    ...paintWindowDays(0),
    ...syncCounts(win),
    { type: 'set', id: startId(0), patch: { text: '1일째: 불가', tone: 'bad' }, pop: true },
  );

  for (let s = 1; s < STARTS; s++) {
    const inc = DISCOUNT[s + WIN - 1];
    win.set(inc, (win.get(inc) ?? 0) + 1);
    checked += 1;
    startDay = `${s + 1}일째`;
    inItem = `${s + WIN}일(${SHORT[inc]})`;
    const ok = isMatch(win);
    if (ok) answer++;

    rec.step({
      title: `${s + 1}일째: ${SHORT[inc]}만 더하고 ${s}일째 ${SHORT[DISCOUNT[s - 1]]}을 안 뺌 → 총합 ${10 + s}개`,
      codeHighlights: union(FORGET_AT.slide, FORGET_AT.check),
      ...meta(),
    });
    rec.phase(
      '빠지는 날 누락',
      `새로 들어온 ${s + WIN}일째 ${josa(SHORT[inc], '은', '는')} 더했지만, 창에서 빠진 ${s}일째 ${josa(SHORT[DISCOUNT[s - 1]], '을', '를')} 빼지 않아 창 안 개수 합이 ${10 + s}개로 부풀었습니다.`,
      FORGET_AT.slide,
    );
    rec.do(
      ...together([
        { type: 'set', id: 'win', patch: { rect: { x: dayRect(0).x - 2, y: DAY_Y - 4, w: (WIN + s) * 43 - 3 + 4, h: 56 }, tone: 'bad' } },
        paint(dayId(s + WIN - 1), 'current'),
        ...syncCounts(win),
      ]),
      { type: 'arrow', from: dayId(s + WIN - 1), to: curId(ITEMS.indexOf(inc)), verdict: 'bad', label: '+1 (안 뺌!)' },
    );

    rec.phase('판정 실패', '지나간 날의 품목이 그대로 남아 있어 목표 수량(합계 10개)과 절대 같아질 수 없습니다.', FORGET_AT.check);
    rec.do(
      { type: 'clearMarks' },
      { type: 'set', id: startId(s), patch: { text: `${s + 1}일째: 불가`, tone: 'bad' }, pop: true },
    );
  }

  rec.step({
    title: `오답 ${answer}일 — 정답은 ${RIGHT}일`,
    codeHighlights: FORGET_AT.done,
    ...meta(),
    answer,
    isKeyframe: true,
  });
  rec.phase('오답 확인', `창을 오른쪽으로 밀 때는 새로 들어오는 날(+1)뿐 아니라 창에서 빠지는 날(-1, 0이 되면 키 삭제)도 함께 처리해야 정답 ${RIGHT}일이 나옵니다.`, FORGET_AT.done);
  rec.do(
    { type: 'set', id: 'ans', patch: { text: `오답 ${answer}일`, tone: 'bad' }, pop: true },
    { type: 'add', item: { id: 'right', kind: 'token', rect: { x: 526, y: START_Y - 36, w: 132, h: 30 }, tone: 'good', text: `정답은 ${RIGHT}일` } },
    wait(600),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'discount-event',
  title: '할인 행사',
  level: 2,
  category: 'hash',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/131127',
  description: {
    summary:
      '마트에서 매일 한 가지 제품을 할인하고 회원은 하루에 하나씩만 살 수 있습니다. 원하는 제품(want)과 수량(number, 합계 10개)이 회원 자격 기간인 연속 10일 동안의 할인 제품 구성과 정확히 일치하는 회원등록 시작일이 모두 며칠인지 구합니다.',
    rules: [
      '1 ≤ want의 길이 = number의 길이 ≤ 10',
      '1 ≤ number의 원소 ≤ 10이며, number 원소의 합은 10',
      '10 ≤ discount의 길이 ≤ 100,000',
      '가능한 날이 없으면 0을 반환',
    ],
    examples: [
      {
        input: 'want = ["banana", "apple", "rice", "pork", "pot"], number = [3, 2, 2, 2, 1], discount = ["chicken", "apple", "apple", "banana", "rice", "apple", "pork", "banana", "pork", "rice", "pot", "banana", "apple", "banana"]',
        output: '3',
      },
      {
        input: 'want = ["apple"], number = [10], discount = ["banana", "banana", "banana", "banana", "banana", "banana", "banana", "banana", "banana", "banana"]',
        output: '0',
      },
    ],
  },
  keyIntuitions: [
    '원하는 품목과 수량의 합이 항상 10이므로, 연속 10일 구간 안의 품목별 개수 사전이 목표 수량 사전과 같은지 비교하는 문제입니다.',
    '시작일이 하루 뒤로 밀릴 때 가운데 9일은 그대로이고 맨 앞 하루만 빠지고 맨 뒤 하루만 새로 들어옵니다.',
    '슬라이딩 윈도우로 빠지는 품목(-1)과 들어오는 품목(+1)만 갱신하면 구간 길이가 길어져도 하루에 두 번만 사전을 고치면 됩니다.',
  ],
  demo: {
    input: [WANT, NUMBER, DISCOUNT],
    label: 'want = ["banana", "apple", "rice", "pork", "pot"], number = [3, 2, 2, 2, 1], discount = 14일치',
  },
  workUnit: '할인 품목을 세어 본 횟수',
  approaches: [
    {
      id: 'discount-event-sliding',
      name: '10일 창 밀며 양 끝만 갱신하기 (슬라이딩 윈도우)',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: '첫 10일만 세고, 이후에는 빠지는 날과 들어오는 날 두 개만 갱신하는 풀이입니다.',
      pros: [
        '겹치는 9일치 품목을 다시 세지 않아 할인 배열을 한 번만 훑습니다.',
        '창의 크기가 10일이 아니라 수천 일로 늘어나는 변형 문제에서도 그대로 O(N)에 동작합니다.',
      ],
      cons: [
        '빠지는 품목의 개수가 0이 되었을 때 사전에서 키를 지워야(del / delete) 사전 동등 비교가 어긋나지 않습니다.',
      ],
      whyThisRank:
        '"연속된 고정 길이 구간의 빈도표"를 다루는 가장 정석적인 해시 + 슬라이딩 윈도우 결합입니다.',
      code: SLIDING,
      visualize: slidingWindow,
    },
    {
      id: 'discount-event-recount',
      name: '시작일마다 10일 구간을 처음부터 다시 세기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(10 × N)',
      spaceComplexity: 'O(1)',
      verdict: '시작일마다 길이 10짜리 부분 배열의 개수를 새로 세는 풀이로, 코드는 짧지만 매번 10개씩 다시 셉니다.',
      pros: [
        'Python의 Counter(discount[i:i+10]) == target처럼 몇 줄로 간단히 구현할 수 있습니다.',
        '개수가 0이 된 키를 지우는 관리를 신경 쓰지 않아도 됩니다.',
      ],
      cons: [
        '시작일마다 10개씩 다시 세므로 품목 확인 횟수가 10 × (N − 9)번(이 예에서 50번 vs 정석 18번)으로 늘어납니다.',
        '만약 회원 자격 기간이 10일이 아니라 K일로 커지는 일반화된 문제라면 O(N × K)가 되어 시간 초과가 납니다.',
      ],
      whyThisRank:
        '"창 길이가 10으로 고정"이라는 이 문제의 특수한 조건 덕분에 통과하지만, 불필요한 중복 세기를 하고 일반성이 떨어져 대안으로 둡니다.',
      code: RECOUNT,
      visualize: recountEveryWindow,
    },
    {
      id: 'discount-event-forget-out',
      name: '창을 밀 때 빠지는 날을 빼지 않기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: '새로 들어오는 날만 더하고 10일 창 밖으로 밀려난 날의 품목을 빼지 않아 틀리는 풀이입니다.',
      pros: [
        '첫 10일 구간(1일째)에서 일치하는 경우는 그대로 찾을 수 있습니다.',
      ],
      cons: [
        '2일째부터는 창 안 개수 합이 11, 12, 13…으로 늘어나 목표 수량(합계 10)과 절대 일치할 수 없습니다.',
      ],
      whyThisRank:
        '슬라이딩 윈도우에서 가장 흔한 실수는 들어오는 값만 반영하고 나가는 값을 되돌리지 않는 것입니다.',
      code: FORGET_OUT,
      visualize: forgetOutgoing,
    },
  ],
  checks: {
    cases: [
      {
        args: [
          ['banana', 'apple', 'rice', 'pork', 'pot'],
          [3, 2, 2, 2, 1],
          ['chicken', 'apple', 'apple', 'banana', 'rice', 'apple', 'pork', 'banana', 'pork', 'rice', 'pot', 'banana', 'apple', 'banana'],
        ],
        expected: 3,
      },
      {
        args: [
          ['apple'],
          [10],
          ['banana', 'banana', 'banana', 'banana', 'banana', 'banana', 'banana', 'banana', 'banana', 'banana'],
        ],
        expected: 0,
      },
      {
        args: [
          ['apple'],
          [10],
          ['apple', 'apple', 'apple', 'apple', 'apple', 'apple', 'apple', 'apple', 'apple', 'apple'],
        ],
        expected: 1,
      },
      {
        args: [
          ['a', 'b'],
          [5, 5],
          ['c', 'a', 'b', 'a', 'b', 'a', 'b', 'a', 'b', 'a', 'b', 'a'],
        ],
        expected: 2,
      },
    ],
    // want 2~3종류(합계 10), discount 길이 10~15
    random: (rand) => {
      const n1 = 1 + Math.floor(rand() * 8);
      const n2 = 10 - n1;
      const want = ['a', 'b'];
      const number = [n1, n2];
      const pool = ['a', 'b', 'c'];
      const len = 10 + Math.floor(rand() * 6);
      const discount = Array.from({ length: len }, () => pool[Math.floor(rand() * (rand() < 0.7 ? 2 : 3))]);
      return [want, number, discount];
    },
  },
};

export default problem;
