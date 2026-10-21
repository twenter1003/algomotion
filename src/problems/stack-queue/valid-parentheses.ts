// 올바른 괄호: 정석 여는 괄호 개수 세기, 대안 스택에 쌓고 짝짓기, 함정 두 괄호의 개수만 비교하기를 같은 장면에서 움직인다.
// 장면은 위에 문자열 칸 한 줄(왼쪽에 줄 이름), 그 아래 둘째 줄에 풀이마다 다른 판이다:
// 정석은 count 칸과 기준 0 칸, 대안은 스택 줄, 함정은 opens 칸과 closes 칸.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { grid } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';

// 시각화 입력. 여는 괄호와 닫는 괄호가 5개씩 같지만 9번째 글자에서 짝 없는 ')'가 나온다.
// 정석과 대안은 거기서 false로 끝나고, 개수만 비교하는 함정은 true를 내 오답이 된다.
const S = '(()(())))(';
const N = S.length;
// 앞에서부터 더한 값(여는 괄호 +1, 닫는 괄호 -1)이 처음 0 아래로 내려가는 글자 번호(0부터)
const FAIL = (() => {
  let sum = 0;
  for (let i = 0; i < N; i++) {
    sum += S[i] === '(' ? 1 : -1;
    if (sum < 0) return i;
  }
  throw new Error('시각화 입력은 중간에 0 아래로 내려가야 합니다');
})();
// i번째 글자(0부터)까지 읽었을 때 여는 괄호 수
const opensUpTo = (i: number) => [...S.slice(0, i + 1)].filter((c) => c === '(').length;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const COUNTER = {
  python: `def solution(s):
    count = 0  # 아직 닫히지 않은 여는 괄호 수

    for ch in s:
        if ch == '(':
            count += 1
        else:
            count -= 1
            if count < 0:  # 짝이 없는 닫는 괄호
                return False

    return count == 0  # 모두 짝이 맞아야 올바른 괄호`,
  javascript: `function solution(s) {
  let count = 0; // 아직 닫히지 않은 여는 괄호 수

  for (const ch of s) {
    if (ch === '(') {
      count++;
    } else {
      count--;
      if (count < 0) return false; // 짝이 없는 닫는 괄호
    }
  }

  return count === 0; // 모두 짝이 맞아야 올바른 괄호
}`,
};
const COUNTER_AT = {
  start: lines(COUNTER, ['count = 0'], ['let count = 0']),
  read: lines(COUNTER, ['for ch in s', "if ch == '('"], ['for (const ch of s)', "if (ch === '(')"]),
  open: lines(COUNTER, ["if ch == '('", 'count += 1'], ["if (ch === '(')", 'count++']),
  close: lines(COUNTER, ['else:', 'count -= 1'], ['} else {', 'count--']),
  check: lines(COUNTER, ['if count < 0'], ['if (count < 0)']),
  fail: lines(COUNTER, ['if count < 0', 'return False'], ['if (count < 0) return false']),
};

const STACK = {
  python: `def solution(s):
    stack = []

    for ch in s:
        if ch == '(':
            stack.append(ch)  # 여는 괄호는 쌓아 두고
        else:
            if not stack:  # 짝지을 '('가 없는 닫는 괄호
                return False
            stack.pop()  # 가장 가까운 '('와 짝짓기

    return not stack  # 남은 '('가 없어야 올바른 괄호`,
  javascript: `function solution(s) {
  const stack = [];

  for (const ch of s) {
    if (ch === '(') {
      stack.push(ch); // 여는 괄호는 쌓아 두고
    } else {
      if (stack.length === 0) return false; // 짝지을 '('가 없는 닫는 괄호
      stack.pop(); // 가장 가까운 '('와 짝짓기
    }
  }

  return stack.length === 0; // 남은 '('가 없어야 올바른 괄호
}`,
};
const STACK_AT = {
  start: lines(STACK, ['stack = []'], ['const stack = []']),
  read: lines(STACK, ['for ch in s', "if ch == '('"], ['for (const ch of s)', "if (ch === '(')"]),
  push: lines(STACK, ['stack.append(ch)'], ['stack.push(ch)']),
  check: lines(STACK, ['else:', 'if not stack'], ['} else {', 'if (stack.length === 0)']),
  fail: lines(STACK, ['if not stack', 'return False'], ['if (stack.length === 0) return false']),
  pop: lines(STACK, ['stack.pop()'], ['stack.pop()']),
};

const COMPARE = {
  python: `def solution(s):
    opens = closes = 0

    for ch in s:
        if ch == '(':
            opens += 1
        else:
            closes += 1

    return opens == closes  # 개수만 같으면 올바르다고 착각 (")("도 True)`,
  javascript: `function solution(s) {
  let opens = 0;
  let closes = 0;

  for (const ch of s) {
    if (ch === '(') opens++;
    else closes++;
  }

  return opens === closes; // 개수만 같으면 올바르다고 착각 (")("도 true)
}`,
};
const COMPARE_AT = {
  start: lines(COMPARE, ['opens = closes = 0'], ['let opens = 0', 'let closes = 0']),
  read: lines(COMPARE, ['for ch in s', "if ch == '('"], ['for (const ch of s)', "if (ch === '(')"]),
  open: lines(COMPARE, ["if ch == '('", 'opens += 1'], ["if (ch === '(')", 'opens++']),
  close: lines(COMPARE, ['else:', 'closes += 1'], ['else closes++']),
  result: lines(COMPARE, ['return opens == closes'], ['return opens === closes']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 64px은 줄 이름, 문자열 칸은 x 72부터 54px씩 8px 간격. 오른쪽 14px은 여유.
// 세로: 문자열 칸 0~54, 둘째 줄 116~170(판정 표시가 칸 위 105~126에 뜨므로 문자열과 51px 띄움), 이름표 174~194.
const CELL = 54;
const X0 = 72;
const cell = grid({ x: X0, y: 0, rows: 1, cols: N, cell: CELL, gap: 8 });
const MID = X0 + (N * (CELL + 8) - 8) / 2; // 문자열 가운데
const W = X0 + N * (CELL + 8) - 8 + 14;
const ROW = 116;
const H = ROW + CELL + 28;
const RIGHT = 560; // 둘째 줄 오른쪽의 결과 토큰 자리(폭 130)
const at2 = (centerX: number): Rect => ({ x: centerX - CELL / 2, y: ROW, w: CELL, h: CELL });
const COUNT = at2(MID - 62);
const FLOOR = at2(MID + 62);
const OPENS_AT = at2(MID - 100);
const CLOSES_AT = at2(MID + 100);
const charId = (i: number) => `ch:${i}`;
const tokId = (i: number) => `tok:${i}`;
const STACK_LANE: LaneOptions = { id: 'stack', x: X0, y: ROW + 4, slotW: CELL, slotH: 46, gap: 8, max: 6 };

const under = (id: string, r: Rect, text: string): Item => ({ id, kind: 'text', rect: { x: r.x - 20, y: r.y + r.h + 4, w: r.w + 40, h: 20 }, text });
const numberCell = (id: string, r: Rect, text: string, tone: Tone): Item => ({ id, kind: 'cell', rect: r, tone, text });
const resultToken = (id: string, y: number, text: string, tone: Tone, h = 34): Item => ({ id, kind: 'token', rect: { x: RIGHT, y, w: 130, h }, tone, text });

// 세 풀이가 같이 쓰는 처음 장면: 줄 이름과 문자열 칸(칸 위쪽 왼쪽에 몇 번째인지)
function board(): Scene {
  const items: Item[] = [{ id: 'row:s', kind: 'text', rect: { x: 0, y: 0, w: 64, h: CELL }, text: '문자열' }];
  [...S].forEach((c, i) => items.push({ id: charId(i), kind: 'cell', rect: cell(0, i), tone: 'plain', text: c, tag: String(i + 1) }));
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone, patch: ItemPatch = {}): Extract<Action, { type: 'set' }> => ({ type: 'set', id, patch: { tone, ...patch } });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const bracket = (c: string) => (c === '(' ? '여는' : '닫는');
const list = (xs: number[]) => `[${xs.map(() => "'('").join(', ')}]`;

// 글자 읽기 마디: 그 글자만 밝히고(함께 볼 칸이 더 있으면 같이) 지금 글자로 칠한다
const readChar = (i: number, also: string[] = []): Action[] =>
  together([{ type: 'focus', ids: [charId(i), ...also] }, paint(charId(i), 'current')]);

/* ------------------------------------------------------------------ */
/* 정석 count: 읽기 → 세기 → (닫는 괄호면) 확인                          */
/* ------------------------------------------------------------------ */

function counter(): Visualization {
  const rec = new StepRecorder(board());
  let count = 0;
  let read = 0;
  let ch = '-';
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({ work: read, workNote: '기억하는 것: 숫자 1개', variables: { ch, count } });
  const countTone = (c: number): Tone => (c < 0 ? 'bad' : c === 0 ? 'visited' : 'queued');

  rec.step({ title: 'count를 0으로 시작하기', codeHighlights: COUNTER_AT.start, ...meta() });
  rec.phase('시작', '열린 괄호를 세는 count를 0으로 두고 문자열을 앞에서부터 한 글자씩 읽습니다. count가 0 아래로 내려가면 바로 틀린 괄호입니다.');
  rec.do(...together([
    { type: 'add', item: numberCell('count', COUNT, '0', 'visited') },
    { type: 'add', item: numberCell('floor', FLOOR, '0', 'plain') },
    { type: 'add', item: under('count:label', COUNT, 'count') },
    { type: 'add', item: under('floor:label', FLOOR, '기준') },
  ]), wait(900));

  for (let i = 0; i <= FAIL; i++) {
    const c = S[i];
    const open = c === '(';
    count += open ? 1 : -1;
    read++;
    ch = `'${c}'`;
    const fail = i === FAIL;

    rec.step({
      title: `${i + 1}번째 '${c}' → count ${count}${fail ? ', false' : ''}`,
      codeHighlights: fail ? COUNTER_AT.fail : open ? COUNTER_AT.open : COUNTER_AT.check,
      ...meta(),
      ...(fail ? { answer: false, isKeyframe: true } : {}),
    });
    rec.phase('읽기', `${i + 1}번째 글자는 ${bracket(c)} 괄호 '${c}'입니다.`, COUNTER_AT.read);
    rec.do(...readChar(i, ['count']), wait(300));

    rec.phase('세기', open
      ? `닫아야 할 괄호가 하나 늘었으니 count를 1 올립니다. count = ${count}.`
      : `괄호 하나가 닫혔으니 count를 1 내립니다. count = ${count}.`, open ? COUNTER_AT.open : COUNTER_AT.close);
    rec.do({ type: 'arrow', from: charId(i), to: 'count', verdict: open ? 'new' : 'good', label: open ? '+1' : '-1' });
    rec.do({ ...paint('count', countTone(count), { text: String(count) }), pop: true }, wait(250));
    if (open) {
      rec.do(...together([paint(charId(i), 'visited'), ...clear()]));
      continue;
    }

    rec.phase('확인', fail
      ? `count가 ${count}${josa(count, '이', '가').slice(String(count).length)} 되어 0 아래로 내려갔습니다. 짝이 없는 ')'가 나왔으니 바로 false를 돌려줍니다.`
      : `count = ${josa(count, '은', '는')} 0 이상이라 아직 짝이 맞습니다.`, fail ? COUNTER_AT.fail : COUNTER_AT.check);
    rec.do({ type: 'focus', ids: ['count', 'floor'] });
    rec.do({ type: 'arrow', from: 'count', to: 'floor', verdict: fail ? 'bad' : 'good', label: `${count} ${fail ? '<' : '≥'} 0` }, wait(250));
    if (fail) {
      rec.do(...together([paint(charId(i), 'bad'), { type: 'add', item: resultToken('result', ROW + 10, '정답 false', 'path') }]), wait(300));
      rec.do(...clear());
    } else {
      rec.do(...together([paint(charId(i), 'visited'), ...clear()]));
    }
  }
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 스택: 읽기 → 넣기, 또는 읽기 → 확인 → 꺼내기                      */
/* ------------------------------------------------------------------ */

function stackPairs(): Visualization {
  const rec = new StepRecorder(board());
  const lane = new Lane(rec, STACK_LANE);
  const stack: number[] = []; // 쌓인 '('의 글자 번호
  let read = 0;
  let ch = '-';
  let peak = 0; // 스택에 한꺼번에 쌓였던 가장 많은 '(' 수: 정석은 숫자 하나로 하는 일에 든 메모리
  const meta = () => ({ work: read, workNote: `기억하는 것: '(' 최대 ${peak}개`, variables: { ch, stack: list(stack) } });

  rec.step({ title: '빈 스택으로 시작하기', codeHighlights: STACK_AT.start, ...meta() });
  rec.phase('시작', "빈 스택을 준비하고 한 글자씩 읽습니다. '('는 쌓아 두고 ')'가 나오면 맨 위 '('와 짝지어 꺼냅니다.");
  rec.do(...together([
    { type: 'add', item: { id: 'stack:label', kind: 'text', rect: { x: 0, y: ROW, w: 64, h: CELL }, text: '스택' } },
    { type: 'add', item: { id: 'stack:bg', kind: 'zone', rect: { x: X0 - 4, y: ROW, w: 6 * (CELL + 8) - 8 + 8, h: CELL } } },
  ]), wait(900));

  for (let i = 0; i <= FAIL; i++) {
    const c = S[i];
    const open = c === '(';
    read++;
    ch = `'${c}'`;
    const fail = i === FAIL;
    const top = stack.at(-1); // 이 ')'와 짝지을 '('(없으면 짝 없음)

    if (open) {
      stack.push(i);
      peak = Math.max(peak, stack.length);
      rec.step({ title: `${i + 1}번째 '(' → 스택에 쌓기`, codeHighlights: STACK_AT.push, ...meta() });
      rec.phase('읽기', `${i + 1}번째 글자는 여는 괄호 '('입니다.`, STACK_AT.read);
      rec.do(...readChar(i), wait(300));
      rec.phase('넣기', `여는 괄호는 짝을 기다려야 하니 스택에 쌓습니다. 스택 크기 = ${stack.length}.`, STACK_AT.push);
      lane.push({ id: tokId(i), text: '(' }, charId(i));
      rec.do(...together([paint(charId(i), 'queued'), ...clear()], true), wait(300));
      continue;
    }

    if (top !== undefined) stack.pop();
    rec.step({
      title: top === undefined ? `${i + 1}번째 ')' → 스택이 비어 false` : `${i + 1}번째 ')' → 맨 위 '('와 짝짓기`,
      codeHighlights: top === undefined ? STACK_AT.fail : STACK_AT.pop,
      ...meta(),
      ...(fail ? { answer: false, isKeyframe: true } : {}),
    });
    rec.phase('읽기', `${i + 1}번째 글자는 닫는 괄호 ')'입니다.`, STACK_AT.read);
    rec.do(...readChar(i, top === undefined ? [] : [charId(top)]), wait(300));

    rec.phase('확인', top === undefined
      ? "스택이 비어 있어 이 ')'와 짝지을 '('가 없습니다. 바로 false를 돌려줍니다."
      : `스택 맨 위에 ${top + 1}번째 '('가 있어 이 ')'와 짝지을 수 있습니다.`, top === undefined ? STACK_AT.fail : STACK_AT.check);
    if (top === undefined) {
      rec.do({ type: 'arrow', from: charId(i), to: 'stack:bg', verdict: 'bad', label: '비어 있음' }, wait(250));
      rec.do(...together([paint(charId(i), 'bad'), { type: 'add', item: resultToken('result', ROW + 6, '정답 false', 'path') }]), wait(300));
      rec.do(...clear());
      break;
    }
    rec.do({ type: 'arrow', from: charId(i), to: tokId(top), verdict: 'good', label: '짝 있음' }, wait(250));

    rec.phase('꺼내기', `맨 위 '('를 꺼내 이 ')'와 짝짓습니다. 스택 크기 = ${stack.length}.`, STACK_AT.pop);
    lane.pop(charId(i));
    rec.do(...together([paint(charId(top), 'visited'), paint(charId(i), 'visited'), ...clear()], true), wait(250));
  }
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 개수 비교: 읽기 → 세기, 마지막에 비교하기 → 오답 확인              */
/* ------------------------------------------------------------------ */

function countBoth(): Visualization {
  const rec = new StepRecorder(board());
  let opens = 0;
  let closes = 0;
  let read = 0;
  let ch = '-';
  const meta = () => ({ work: read, variables: { ch, opens, closes } });

  rec.step({ title: 'opens와 closes를 0으로 시작하기', codeHighlights: COMPARE_AT.start, ...meta() });
  rec.phase('시작', "'('를 세는 opens와 ')'를 세는 closes를 0으로 두고, 순서는 보지 않고 개수만 셉니다.");
  rec.do(...together([
    { type: 'add', item: numberCell('opens', OPENS_AT, '0', 'plain') },
    { type: 'add', item: numberCell('closes', CLOSES_AT, '0', 'plain') },
    { type: 'add', item: under('opens:label', OPENS_AT, 'opens') },
    { type: 'add', item: under('closes:label', CLOSES_AT, 'closes') },
  ]), wait(900));

  for (let i = 0; i < N; i++) {
    const c = S[i];
    const open = c === '(';
    if (open) opens++;
    else closes++;
    read++;
    ch = `'${c}'`;
    const [id, n] = open ? (['opens', opens] as const) : (['closes', closes] as const);

    rec.step({ title: `${i + 1}번째 '${c}' → ${id} ${n}`, codeHighlights: open ? COMPARE_AT.open : COMPARE_AT.close, ...meta() });
    rec.phase('읽기', `${i + 1}번째 글자는 ${bracket(c)} 괄호 '${c}'입니다.`, COMPARE_AT.read);
    rec.do(...readChar(i, [id]), wait(300));
    rec.phase('세기', `${bracket(c)} 괄호라 ${id}를 1 올립니다. ${id} = ${n}.`, open ? COMPARE_AT.open : COMPARE_AT.close);
    rec.do({ type: 'arrow', from: charId(i), to: id, verdict: 'new', label: '+1' });
    rec.do({ ...paint(id, 'queued', { text: String(n) }), pop: true }, wait(250));
    rec.do(...together([paint(charId(i), 'visited'), ...clear()]));
  }

  const same = opens === closes;
  const shownOpens = opensUpTo(FAIL);
  rec.step({
    title: `개수 ${opens} = ${closes} → ${same} (정답은 ${!same})`,
    codeHighlights: COMPARE_AT.result,
    ...meta(),
    answer: same,
    isKeyframe: true,
  });
  rec.phase('비교하기', `opens = ${opens}, closes = ${ro(closes)} 개수가 같으니 true를 돌려줍니다.`);
  rec.do({ type: 'focus', ids: ['opens', 'closes'] });
  rec.do({ type: 'arrow', from: 'opens', to: 'closes', verdict: 'good', label: `${opens} = ${closes}` }, wait(250));
  rec.do(...together([{ type: 'add', item: resultToken('result', ROW, '이 풀이 true', 'chosen', 26) }, ...clear()]), wait(300));
  rec.phase('오답 확인',
    `하지만 ${FAIL + 1}번째 글자까지 읽었을 때 ')'가 ${FAIL + 1 - shownOpens}개, '('가 ${shownOpens}개라 닫을 짝이 없었습니다. 정답은 false입니다.`);
  rec.do(...together([
    paint(charId(FAIL), 'bad', { sub: '짝 없음' }),
    paint('result', 'bad'),
    { type: 'add', item: resultToken('truth', ROW + 28, '정답 false', 'good', 26) },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'valid-parentheses',
  title: '올바른 괄호',
  level: 2,
  category: 'stack-queue',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12909',
  description: {
    summary:
      "'('와 ')'로만 이루어진 문자열이 주어집니다. '('로 열었으면 그 뒤에 짝이 되는 ')'로 닫혀야 올바른 괄호입니다. 문자열이 올바른 괄호이면 true, 아니면 false를 돌려줍니다.",
    rules: [
      '문자열 s의 길이는 100,000 이하의 자연수',
      "s는 '(' 또는 ')' 로만 이루어져 있음",
      "()()나 (())()는 올바른 괄호이고, )()(나 (()(는 올바르지 않은 괄호",
    ],
    examples: [
      { input: 's = "()()"', output: 'true' },
      { input: 's = "(())()"', output: 'true' },
      { input: 's = ")()("', output: 'false' },
      { input: 's = "(()("', output: 'false' },
    ],
  },
  keyIntuitions: [
    "'('는 +1, ')'는 -1로 보고 앞에서부터 더해 가면, 괄호가 짝이 맞는지를 숫자 하나로 따라갈 수 있습니다.",
    "중간에 합이 0 아래로 내려가면 짝 없는 ')'가 나온 것이라 그 자리에서 바로 틀린 괄호입니다. 개수가 같다고 올바른 괄호는 아닙니다(예: ')(').",
    "끝까지 읽었을 때 합이 정확히 0이어야 열린 괄호가 모두 닫힌 것입니다. 괄호 종류가 하나뿐이라 스택에 쌓을 것 없이 개수만 세면 됩니다.",
  ],
  demo: { input: [S], label: `s = "${S}"` },
  workUnit: '글자를 읽은 횟수',
  approaches: [
    {
      id: 'parentheses-counter',
      name: '여는 괄호 개수 세기',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: '괄호 종류가 하나뿐이라 숫자 하나만 들고 한 번 훑으면 끝나는 가장 가벼운 풀이입니다.',
      pros: [
        '문자열을 한 번만 읽으므로 O(N)입니다.',
        '변수 하나(count)만 써서 추가 메모리가 필요 없습니다.',
        'count가 0 아래로 내려가는 순간 바로 false를 돌려주고 멈출 수 있습니다.',
      ],
      cons: ['괄호 종류가 여러 개(), {}, []로 늘면 어느 괄호가 열려 있는지 알아야 해서 스택이 필요합니다.'],
      whyThisRank:
        '괄호가 한 종류뿐이면 스택에 쌓아 둘 정보가 없고 "몇 개가 열려 있나"만 알면 됩니다. 시간은 스택과 같지만 메모리까지 아끼는 가장 단순한 풀이입니다.',
      code: COUNTER,
      visualize: counter,
    },
    {
      id: 'parentheses-stack',
      name: '스택에 쌓고 짝짓기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: "답과 시간은 같지만 '('를 하나하나 쌓아 두느라 메모리를 최대 N개나 쓰는 풀이입니다. 정석은 숫자 하나면 됩니다.",
      pros: [
        '괄호 종류가 늘어나도(소괄호, 중괄호, 대괄호) 그대로 쓸 수 있는 일반적인 방법입니다.',
        "어떤 '('와 어떤 ')'가 짝지어지는지가 눈에 보입니다.",
      ],
      cons: [
        "'('가 길게 이어지면 스택에 최대 N개를 쌓습니다. 정석은 count 숫자 하나로 같은 일을 합니다.",
        "이 문제는 괄호가 한 종류라 쌓인 것이 모두 같은 '('입니다. 저장할 정보가 없는데도 칸을 차지합니다.",
      ],
      whyThisRank:
        '시간은 정석과 같지만 같은 일을 더 많은 메모리로 합니다. 한 종류의 괄호에서는 스택에 쌓은 내용이 늘 같아서 숫자 하나로 줄어들기 때문입니다. (괄호 종류가 여러 개라면 스택이 정석입니다.)',
      code: STACK,
      visualize: stackPairs,
    },
    {
      id: 'parentheses-count-compare',
      name: "'('와 ')' 개수만 비교하기",
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: '개수만 같으면 올바르다고 착각하는 풀이로, 순서가 틀린 괄호도 통과시킵니다.',
      pros: ['코드가 짧고 한 번만 훑습니다.'],
      cons: [
        `")("처럼 개수는 같지만 짝이 맞지 않는 문자열에도 true를 돌려줍니다. 예제 ")()("도 이 풀이로는 틀립니다.`,
        '괄호는 닫는 괄호가 여는 괄호보다 먼저 나오면 안 된다는 순서를 전혀 보지 못합니다.',
      ],
      whyThisRank:
        "올바른 괄호는 '개수가 같다'와 '어느 자리에서도 닫는 괄호가 여는 괄호보다 많지 않다'를 모두 만족해야 합니다. 이 풀이는 앞의 조건만 보므로 오답입니다.",
      code: COMPARE,
      visualize: countBoth,
    },
  ],
  checks: {
    cases: [
      { args: ['()()'], expected: true },
      { args: ['(())()'], expected: true },
      { args: [')()('], expected: false },
      { args: ['(()('], expected: false },
      { args: ['()'], expected: true },
      { args: ['('], expected: false },
      { args: [')'], expected: false },
      { args: ['((()))(()())'], expected: true },
      { args: [S], expected: false },
    ],
    // 길이 1~12: 짝이 맞는 문자열을 만든 뒤 절반쯤은 글자를 하나 바꾸거나 지워 틀린 문자열로 만든다
    random: (rand) => {
      const pairs = 1 + Math.floor(rand() * 6);
      let [open, close, s] = [0, 0, ''];
      while (close < pairs) {
        if (open < pairs && (open === close || rand() < 0.5)) [open, s] = [open + 1, `${s}(`];
        else [close, s] = [close + 1, `${s})`];
      }
      if (rand() < 0.5) {
        const at = Math.floor(rand() * s.length);
        s = rand() < 0.5 ? s.slice(0, at) + (s[at] === '(' ? ')' : '(') + s.slice(at + 1) : s.slice(0, at) + s.slice(at + 1);
      }
      return [s || '('];
    },
  },
};

export default problem;
