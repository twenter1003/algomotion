// 큰 수 만들기: 정석 스택으로 작은 수 버리기, 대안 구간에서 가장 큰 숫자 고르기, 함정 작은 숫자부터 k개 지우기를 같은 장면에서 움직인다.
// 장면은 위에 숫자 칸 열 개, 가운데에 줄(정석은 스택, 대안은 만든 수, 함정은 버린 수)과 오른쪽 표시, 아래에 답 표시다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { grid } from '../../engine/layout.ts';
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { josa, lines, together } from '../shared.ts';
import { PacedRecorder } from './paced.ts';

// 시각화 입력. 정석은 "87733", 작은 수부터 지우면 "48773"이 나온다.
const NUMBER = '4872711332';
const K = 5;
const N = NUMBER.length;
const digit = (i: number) => NUMBER[i];
const list = (xs: string[]) => `[${xs.join(', ')}]`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const STACK = {
  python: `def solution(number, k):
    stack = []
    for d in number:
        # 스택 맨 위가 새 숫자보다 작으면 버립니다 (앞자리를 키우는 쪽이 이득)
        while k > 0 and stack and stack[-1] < d:
            stack.pop()
            k -= 1
        stack.append(d)
    # 다 못 버린 k개는 뒤에서 자릅니다 (뒤쪽은 줄어드는 수라서 손해가 가장 작음)
    return ''.join(stack[:len(stack) - k])`,
  javascript: `function solution(number, k) {
  const stack = [];
  for (const d of number) {
    // 스택 맨 위가 새 숫자보다 작으면 버립니다 (앞자리를 키우는 쪽이 이득)
    while (k > 0 && stack.length > 0 && stack[stack.length - 1] < d) {
      stack.pop();
      k--;
    }
    stack.push(d);
  }
  // 다 못 버린 k개는 뒤에서 자릅니다 (뒤쪽은 줄어드는 수라서 손해가 가장 작음)
  return stack.slice(0, stack.length - k).join('');
}`,
};
const STACK_AT = {
  start: lines(STACK, ['stack = []'], ['const stack = []']),
  next: lines(STACK, ['for d in number'], ['for (const d of number)']),
  look: lines(STACK, ['while k > 0 and stack and stack[-1] < d'], ['while (k > 0 && stack.length > 0']),
  drop: lines(STACK, ['while k > 0 and stack and stack[-1] < d', 'stack.pop()', 'k -= 1'], ['while (k > 0 && stack.length > 0', 'stack.pop()', 'k--']),
  push: lines(STACK, ['stack.append(d)'], ['stack.push(d)']),
  cut: lines(STACK, ["return ''.join(stack[:len(stack) - k])"], ['return stack.slice(0, stack.length - k).join']),
};

const WINDOW = {
  python: `def solution(number, k):
    n = len(number)
    answer = ''
    start = 0                            # 이번에 고를 수 있는 가장 앞 칸
    for left in range(n - k, 0, -1):     # left: 아직 골라야 할 자릿수
        end = n - left + 1               # 뒤에 left - 1자리를 남겨야 하므로 end 앞까지만 고릅니다
        pick = start
        for i in range(start + 1, end):  # 이 구간에서 가장 큰 숫자를 찾습니다 (같으면 앞쪽)
            if number[i] > number[pick]:
                pick = i
        answer += number[pick]
        start = pick + 1                 # 고른 칸 앞의 숫자는 모두 버린 셈입니다
    return answer`,
  javascript: `function solution(number, k) {
  const n = number.length;
  let answer = '';
  let start = 0; // 이번에 고를 수 있는 가장 앞 칸
  for (let left = n - k; left > 0; left--) { // left: 아직 골라야 할 자릿수
    const end = n - left + 1; // 뒤에 left - 1자리를 남겨야 하므로 end 앞까지만 고릅니다
    let pick = start;
    for (let i = start + 1; i < end; i++) { // 이 구간에서 가장 큰 숫자를 찾습니다 (같으면 앞쪽)
      if (number[i] > number[pick]) pick = i;
    }
    answer += number[pick];
    start = pick + 1; // 고른 칸 앞의 숫자는 모두 버린 셈입니다
  }
  return answer;
}`,
};
const WINDOW_AT = {
  start: lines(WINDOW, ["answer = ''", 'start = 0'], ["let answer = ''", 'let start = 0']),
  range: lines(WINDOW, ['for left in range(n - k', 'end = n - left + 1'], ['for (let left = n - k', 'const end = n - left + 1']),
  scan: lines(WINDOW, ['pick = start', 'for i in range(start + 1, end)', 'if number[i] > number[pick]', 'pick = i'], ['let pick = start', 'for (let i = start + 1', 'if (number[i] > number[pick])']),
  take: lines(WINDOW, ['answer += number[pick]', 'start = pick + 1'], ['answer += number[pick]', 'start = pick + 1']),
  done: lines(WINDOW, ['return answer'], ['return answer']),
};

const SMALLEST = {
  python: `def solution(number, k):
    digits = list(number)
    for _ in range(k):                   # k번 지웁니다
        smallest = 0
        for i in range(1, len(digits)):  # 가장 작은 숫자를 찾습니다 (같으면 앞쪽)
            if digits[i] < digits[smallest]:
                smallest = i
        digits.pop(smallest)             # 지워 버립니다
    return ''.join(digits)               # 작은 수부터 지우면 앞자리가 작아질 수 있습니다`,
  javascript: `function solution(number, k) {
  const digits = [...number];
  for (let r = 0; r < k; r++) { // k번 지웁니다
    let smallest = 0;
    for (let i = 1; i < digits.length; i++) { // 가장 작은 숫자를 찾습니다 (같으면 앞쪽)
      if (digits[i] < digits[smallest]) smallest = i;
    }
    digits.splice(smallest, 1); // 지워 버립니다
  }
  return digits.join(''); // 작은 수부터 지우면 앞자리가 작아질 수 있습니다
}`,
};
const SMALLEST_AT = {
  start: lines(SMALLEST, ['digits = list(number)'], ['const digits = [...number]']),
  find: lines(SMALLEST, ['for _ in range(k)', 'smallest = 0', 'for i in range(1, len(digits))', 'if digits[i] < digits[smallest]', 'smallest = i'],
    ['for (let r = 0; r < k; r++)', 'let smallest = 0', 'for (let i = 1; i < digits.length', 'if (digits[i] < digits[smallest])']),
  erase: lines(SMALLEST, ['digits.pop(smallest)'], ['digits.splice(smallest, 1)']),
  done: lines(SMALLEST, ["return ''.join(digits)"], ["return digits.join('')"]),
};

// 줄 번호 묶음을 합친다(중복 없이, 줄 번호 순)
const merge = (...parts: Record<Language, number[]>[]): Record<Language, number[]> => ({
  python: [...new Set(parts.flatMap((p) => p.python))].sort((a, b) => a - b),
  javascript: [...new Set(parts.flatMap((p) => p.javascript))].sort((a, b) => a - b),
});

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 58px은 줄 이름, 칸은 x 64부터 50px씩 4px 간격(10칸). 세로 띠: 숫자 칸 28~78(판정 표시가 칸 위 11px에 붙는다),
// 줄 120~160(토큰 칸 7개, 오른쪽 x 456~600은 남은 횟수 표시), 답 표시 줄 176~208.
const cellAt = grid({ x: 64, y: 28, rows: 1, cols: N, cell: 50, gap: 4 });
const W = 608;
const H = 216;
const LANE: LaneOptions = { id: 'ln', x: 64, y: 120, slotW: 50, slotH: 40, gap: 4, max: 7 };
const SIDE: Rect = { x: 456, y: 120, w: 144, h: 40 };
const ANSWER_AT: Rect = { x: 64, y: 176, w: 240, h: 32 };
const TRUTH_AT: Rect = { x: 312, y: 176, w: 240, h: 32 };
const cellId = (i: number) => `cell:${i}`;
const tokId = (i: number) => `t:${i}`;
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const paint = (i: number, tone: Tone): Action => ({ type: 'set', id: cellId(i), patch: { tone } });
const tint = (i: number, tone: Tone): Action => ({ type: 'set', id: tokId(i), patch: { tone } });

// 세 풀이가 같이 쓰는 장면: 숫자 칸 열 개와 줄(이름, 바탕). 줄 이름은 정석 '스택', 대안 '만든 수', 함정 '버린 수'
function board(laneName: string): Scene {
  const items: Item[] = [
    { id: 'lab:num', kind: 'text', rect: { x: 0, y: 28, w: 58, h: 50 }, text: '숫자' },
    { id: 'lab:lane', kind: 'text', rect: { x: 0, y: 120, w: 58, h: 40 }, text: laneName },
    { id: 'lane:bg', kind: 'zone', rect: { x: 60, y: 116, w: LANE.max * 54 - 4 + 8, h: 48 } },
  ];
  [...NUMBER].forEach((c, i) => items.push({ id: cellId(i), kind: 'cell', rect: cellAt(0, i), tone: 'plain', text: c }));
  return { width: W, height: H, items };
}

// 표시: 처음이면 그 자리에 나타나고, 그 뒤로는 글만 바뀌며 톡 튄다
const mark = (rec: PacedRecorder, id: string, rect: Rect, text: string, tone: Tone): Action =>
  rec.has(id) ? { type: 'set', id, patch: { text, tone }, pop: true } : { type: 'add', item: { id, kind: 'token', rect, tone, text } };
const kText = (n: number) => `k = ${n}번 남음`;

/* ------------------------------------------------------------------ */
/* 정석 스택: 버리기 → 비교하기 → 쌓기 (숫자 하나가 한 단계)               */
/* ------------------------------------------------------------------ */

// 숫자 하나를 처리한 결과: 버린 칸(위에서부터), 버리기를 멈추게 한 맨 위 칸(비교 없이 멈췄으면 없음), 비교 횟수, 처리한 뒤 k와 스택
interface Turn { idx: number; pops: number[]; fail?: number; comps: number; k: number; stack: number[] }
const TURNS: Turn[] = [];
{
  const stack: number[] = [];
  let k = K;
  for (let idx = 0; idx < N; idx++) {
    const pops: number[] = [];
    let fail: number | undefined;
    let comps = 0;
    while (k > 0 && stack.length > 0) {
      comps++;
      const top = stack.at(-1)!;
      if (digit(top) < digit(idx)) {
        pops.push(stack.pop()!);
        k--;
      } else {
        fail = top;
        break;
      }
    }
    stack.push(idx);
    TURNS.push({ idx, pops, fail, comps, k, stack: [...stack] });
  }
}
const LAST = TURNS.at(-1)!;
const LEFTOVER = LAST.k; // 다 못 버린 k
const KEPT = LAST.stack.slice(0, LAST.stack.length - LEFTOVER);
const CUT = LAST.stack.slice(LAST.stack.length - LEFTOVER);
const ANSWER = KEPT.map(digit).join('');

function stackScan(): Visualization {
  const rec = new PacedRecorder(board('스택'));
  const lane = new Lane(rec, LANE);
  let [shown, k, comps] = [-1, K, 0]; // 지금 처리하는 칸(-1이면 반복 전이거나 끝), 남은 삭제 횟수, 비교 횟수
  let stack: number[] = [];
  const meta = () => ({ work: comps, variables: { d: shown < 0 ? '-' : digit(shown), stack: list(stack.map(digit)), k } });

  rec.step({ title: `k = ${K}번 지울 수 있습니다`, codeHighlights: STACK_AT.start, ...meta() });
  rec.phase('시작', '앞에서부터 숫자를 하나씩 스택에 쌓습니다. 스택 맨 위가 새 숫자보다 작으면 그 숫자를 버려 앞자리를 키우고, 지울 수 있는 횟수 k를 하나 줄입니다.');
  rec.do(mark(rec, 'tok:k', SIDE, kText(K), 'chosen'));

  for (const t of TURNS) {
    const d = digit(t.idx);
    // 이 숫자가 오기 전 스택(아래 → 위). 버릴 때마다 위에서 하나씩 줄어든다
    let before = [...t.stack.slice(0, -1), ...t.pops.toReversed()];
    let kNow = t.k + t.pops.length;
    let head = true; // 단계의 첫 마디면 반복문 줄도 비춘다(숫자를 꺼내는 줄)
    const open = (): Action[] => {
      const first = head;
      head = false;
      return first ? [paint(t.idx, 'current')] : [];
    };
    const first = () => (head ? STACK_AT.next : { python: [], javascript: [] });

    // 변수와 일의 양은 단계가 끝났을 때의 값이다
    [shown, k, comps, stack] = [t.idx, t.k, comps + t.comps, t.stack];
    const dropped = t.pops.map(digit);
    rec.step({
      title: dropped.length ? `숫자 ${d}: ${josa(dropped.join(', '), '을', '를')} 버리고 쌓기` : `숫자 ${d} 쌓기`,
      codeHighlights: STACK_AT.push,
      ...meta(),
    });

    t.pops.forEach((i, n) => {
      const top = digit(i);
      kNow--;
      rec.phase('버리기', n
        ? `그 아래 ${josa(top, '은', '는')} ${d}보다 작아 이것도 버립니다. k = ${kNow}번 남았습니다.`
        : `스택 맨 위 ${josa(top, '은', '는')} 새 숫자 ${d}보다 작으므로 버립니다. k = ${kNow}번 남았습니다.`, merge(first(), STACK_AT.drop));
      rec.do(...together([{ type: 'focus', ids: [cellId(t.idx), tokId(i)] }, ...open()]));
      rec.do({ type: 'arrow', from: cellId(t.idx), to: tokId(i), verdict: 'bad', label: `${top} < ${d} → 버림` }, wait(100));
      lane.pop(cellId(i));
      rec.do({ ...paint(i, 'explored'), together: true }, { type: 'set', id: 'tok:k', patch: { text: kText(kNow) }, pop: true, together: true });
      rec.do(...clear());
      before = before.slice(0, -1);
    });

    if (t.fail !== undefined) {
      const top = digit(t.fail);
      rec.phase('비교하기', `스택 맨 위 ${josa(top, '은', '는')} ${d}보다 작지 않아(${top} ≥ ${d}) 버리지 않습니다.`, merge(first(), STACK_AT.look));
      rec.do(...together([{ type: 'focus', ids: [cellId(t.idx), tokId(t.fail)] }, ...open()]));
      rec.do({ type: 'arrow', from: cellId(t.idx), to: tokId(t.fail), verdict: 'good', label: `${top} ≥ ${d} → 남김` }, wait(100));
      rec.do(...clear());
    }

    const why = t.fail !== undefined ? '' : before.length === 0 ? '스택이 비어 있어 비교 없이 바로 ' : '더 버릴 수 없어(k = 0) 비교 없이 바로 ';
    rec.phase('쌓기', `${why}${josa(d, '을', '를')} 스택에 쌓습니다. 스택은 ${list(t.stack.map(digit))}입니다.`,
      merge(t.fail === undefined ? merge(first(), STACK_AT.look) : { python: [], javascript: [] }, STACK_AT.push));
    rec.do(...open());
    lane.push({ id: tokId(t.idx), text: d, tone: 'chosen' }, cellId(t.idx));
    rec.do({ ...paint(t.idx, 'visited'), together: true });
  }

  // 마무리: 다 못 버린 k개는 스택 뒤에서 자른다(코드는 slice로 잘라 이어 붙이므로 스택은 그대로 두고 표시만 한다)
  shown = -1;
  rec.step({ title: `스택을 이어 붙인 답 ${ANSWER}`, codeHighlights: STACK_AT.cut, ...meta(), answer: ANSWER, isKeyframe: true });
  if (LEFTOVER) {
    rec.phase('뒤에서 자르기', `숫자를 다 쌓았지만 k = ${LEFTOVER}번이 남았습니다. 스택 뒤쪽은 값이 줄어드는 부분이라, 뒤에서 ${LEFTOVER}개(${CUT.map(digit).join(', ')})를 잘라 냅니다.`);
    rec.do(...together(CUT.flatMap((i): Action[] => [tint(i, 'explored'), paint(i, 'explored')])));
  }
  rec.phase('답 만들기', `${LEFTOVER ? '남은 스택' : 'k = 0이라 자를 것이 없습니다. 스택'}을 이어 붙이면 ${ANSWER}입니다.`);
  rec.do(...together(KEPT.flatMap((i): Action[] => [tint(i, 'path'), paint(i, 'path')])));
  rec.do(mark(rec, 'tok:ans', ANSWER_AT, `답 ${ANSWER}`, 'path'));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 구간 최댓값: 구간 정하기 → 가장 큰 수 고르기 → 옮기기 (자리 하나가 한 단계) */
/* ------------------------------------------------------------------ */

interface Pick { left: number; start: number; end: number; pick: number; comps: number }
const PICKS: Pick[] = [];
{
  let start = 0;
  for (let left = N - K; left > 0; left--) {
    const end = N - left + 1;
    let pick = start;
    let comps = 0;
    for (let i = start + 1; i < end; i++) {
      comps++;
      if (digit(i) > digit(pick)) pick = i;
    }
    PICKS.push({ left, start, end, pick, comps });
    start = pick + 1;
  }
}
const ordinal = (n: number) => `${n}번째`;

function windowMax(): Visualization {
  const rec = new PacedRecorder(board('만든 수'));
  const lane = new Lane(rec, LANE);
  let [left, start, end, pick, comps] = [-1, 0, -1, -1, 0];
  let answer = '';
  const meta = () => ({
    work: comps,
    variables: { left: left < 0 ? '-' : left, start, end: end < 0 ? '-' : end, pick: pick < 0 ? '-' : pick, answer: answer || "''" },
  });
  const leftText = (n: number) => `남은 자릿수 ${n}개`;

  rec.step({ title: `${N - K}자리를 앞에서부터 고르기`, codeHighlights: WINDOW_AT.start, ...meta() });
  rec.phase('시작', `남길 숫자는 ${N} − ${K} = ${N - K}개입니다. 앞자리부터 한 자리씩, 뒤에 남은 자릿수를 지킬 수 있는 구간에서 가장 큰 숫자를 고릅니다.`);
  rec.do(mark(rec, 'tok:left', SIDE, leftText(N - K), 'chosen'));

  PICKS.forEach((p, n) => {
    const d = digit(p.pick);
    const win = Array.from({ length: p.end - p.start }, (_, i) => p.start + i);
    const skipped = Array.from({ length: p.pick - p.start }, (_, i) => p.start + i); // 고른 칸 앞에서 버려지는 칸
    const winDigits = win.map(digit);
    [left, start, end, pick, comps] = [p.left, p.pick + 1, p.end, p.pick, comps + p.comps];
    answer += d;

    rec.step({ title: `${ordinal(n + 1)} 자리: ${d} 고르기`, codeHighlights: WINDOW_AT.take, ...meta() });
    rec.phase('구간 정하기', `${p.left}자리가 남았으니 뒤에 ${p.left - 1}자리를 남기려면 ${p.start}번~${p.end - 1}번 칸 중에서 골라야 합니다.`, WINDOW_AT.range);
    rec.do(...together([{ type: 'focus', ids: win.map(cellId) }, ...win.map((i) => paint(i, 'queued'))]));

    const tie = winDigits.filter((x) => x === d).length > 1;
    rec.phase('가장 큰 수 고르기', `구간의 숫자 ${winDigits.join(', ')} 중 가장 큰 수는 ${d}입니다${tie ? '. 같은 수가 여럿이면 앞쪽을 고릅니다' : ''}. 비교는 ${p.comps}번 했습니다.`, WINDOW_AT.scan);
    if (p.pick === p.start) {
      rec.do(paint(p.pick, 'current'), wait(300));
    } else {
      rec.do(paint(p.pick, 'current'));
      rec.do({ type: 'arrow', from: cellId(p.start), to: cellId(p.pick), verdict: 'good', label: `가장 큼: ${d}` }, wait(100));
    }

    rec.phase('옮기기', `${josa(d, '을', '를')} 고르고, 앞에서 건너뛴 ${skipped.length ? `${josa(skipped.map(digit).join(', '), '은', '는')} 버립니다` : '숫자는 없습니다'}. 다음에는 ${p.pick + 1}번 칸부터 고릅니다.`, WINDOW_AT.take);
    rec.do(...clear());
    lane.push({ id: tokId(p.pick), text: d, tone: 'chosen' }, cellId(p.pick));
    rec.do(
      ...together([
        paint(p.pick, 'visited'),
        ...skipped.map((i) => paint(i, 'explored')),
        ...win.filter((i) => i > p.pick).map((i) => paint(i, 'plain')),
        { type: 'set', id: 'tok:left', patch: { text: leftText(p.left - 1) }, pop: true },
      ], true),
    );
  });

  // 반복을 마치면 고른 숫자만 남고, 마지막으로 고른 칸 뒤의 숫자는 쓰이지 않는다
  const rest = Array.from({ length: N - start }, (_, i) => start + i);
  [left, end, pick] = [0, N, PICKS.at(-1)!.pick];
  rec.step({ title: `${N - K}자리를 모두 골라 답 ${answer}`, codeHighlights: WINDOW_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('답 만들기', `${N - K}자리를 모두 골랐으므로 답은 ${answer}입니다.${rest.length ? ` 마지막으로 고른 칸 뒤의 ${josa(rest.map(digit).join(', '), '은', '는')} 쓰이지 않습니다.` : ''} 지운 숫자는 모두 ${K}개입니다.`);
  rec.do(...together([
    ...PICKS.flatMap((p): Action[] => [tint(p.pick, 'path'), paint(p.pick, 'path')]),
    ...rest.map((i) => paint(i, 'explored')),
  ]));
  rec.do(mark(rec, 'tok:ans', ANSWER_AT, `답 ${answer}`, 'path'));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 작은 수부터: 가장 작은 수 찾기 → 지우기, 오답 확인                  */
/* ------------------------------------------------------------------ */

// 라운드마다 남은 칸(앞 → 뒤)에서 가장 작은 숫자(같으면 앞쪽)를 지운다
interface Round { remain: number[]; erase: number; ties: number[] }
const ROUNDS: Round[] = [];
let WRONG = '';
{
  const remain = [...Array(N).keys()];
  for (let r = 0; r < K; r++) {
    const erase = remain.reduce((a, i) => (digit(i) < digit(a) ? i : a));
    ROUNDS.push({ remain: [...remain], erase, ties: remain.filter((i) => digit(i) === digit(erase)) });
    remain.splice(remain.indexOf(erase), 1);
  }
  WRONG = remain.map(digit).join('');
}

function eraseSmallest(): Visualization {
  const rec = new PacedRecorder(board('버린 수'));
  const lane = new Lane(rec, LANE);
  let remain = [...Array(N).keys()];
  let [smallest, comps] = [-1, 0];
  const meta = () => ({ work: comps, variables: { smallest: smallest < 0 ? '-' : smallest, digits: list(remain.map(digit)) } });

  rec.step({ title: `가장 작은 숫자를 ${K}번 지우기`, codeHighlights: SMALLEST_AT.start, ...meta() });
  rec.phase('시작', `${K}번 동안 남은 숫자 중 가장 작은 숫자(같으면 앞쪽)를 지워 보겠습니다. 작은 숫자를 지우면 남는 수가 커질 것 같습니다.`);
  rec.do(mark(rec, 'tok:k', SIDE, kText(K), 'chosen'));

  ROUNDS.forEach((round, r) => {
    const d = digit(round.erase);
    const others = round.ties.filter((i) => i !== round.erase);
    smallest = round.remain.indexOf(round.erase);
    comps += round.remain.length - 1;
    remain = round.remain.filter((i) => i !== round.erase);

    rec.step({ title: `${ordinal(r + 1)}: ${d} 지우기`, codeHighlights: SMALLEST_AT.erase, ...meta() });
    rec.phase('가장 작은 수 찾기', `남은 숫자 ${round.remain.length}개를 훑으면 가장 작은 숫자는 ${d}입니다.${others.length ? ' 같은 수가 여럿이라 가장 앞쪽 것을 고릅니다.' : ''} 비교는 ${round.remain.length - 1}번 했습니다.`, SMALLEST_AT.find);
    rec.do(...together([
      { type: 'focus', ids: round.remain.map(cellId) },
      paint(round.erase, 'current'),
      ...others.map((i) => paint(i, 'queued')),
    ]));
    rec.do(wait(400));

    rec.phase('지우기', `${josa(d, '을', '를')} 지웁니다. 지운 숫자는 ${ROUNDS.slice(0, r + 1).map((x) => digit(x.erase)).join(', ')}이고 k = ${K - r - 1}번 남았습니다.`, SMALLEST_AT.erase);
    rec.do(...clear());
    lane.push({ id: tokId(round.erase), text: d, tone: 'chosen' }, cellId(round.erase));
    rec.do(...together([
      paint(round.erase, 'explored'),
      ...others.map((i) => paint(i, 'plain')),
      { type: 'set', id: 'tok:k', patch: { text: kText(K - r - 1) }, pop: true },
    ], true));
  });

  smallest = -1;
  rec.step({ title: `이 방법 ${WRONG}, 정답은 ${ANSWER}`, codeHighlights: SMALLEST_AT.done, ...meta(), answer: WRONG, isKeyframe: true });
  rec.phase('오답 확인', `남은 숫자를 이으면 ${WRONG}입니다. 정답은 ${ANSWER}입니다. 맨 앞 ${josa(digit(0), '은', '는')} 가장 작은 숫자가 아니라 지워지지 않았지만, 지웠다면 앞자리가 ${josa(digit(1), '이', '가')} 되어 훨씬 큰 수가 됩니다.`);
  rec.do(...together(remain.map((i): Action => paint(i, 'bad'))));
  rec.do(mark(rec, 'tok:ans', ANSWER_AT, `이 방법 ${WRONG}`, 'bad'));
  rec.do(mark(rec, 'tok:truth', TRUTH_AT, `정답 ${ANSWER}`, 'good'));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'make-big-number',
  title: '큰 수 만들기',
  level: 2,
  category: 'greedy',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42883',
  description: {
    summary:
      '어떤 숫자가 문자열로 주어질 때, 그중 k개의 숫자를 지워서 만들 수 있는 가장 큰 수를 구합니다. 남은 숫자의 순서는 바꾸지 않고, 결과는 문자열로 돌려줍니다.',
    rules: [
      'number는 2자리 이상 1,000,000자리 이하인 숫자',
      'k는 1 이상 number의 자릿수 미만인 자연수',
      '지운 뒤 남은 숫자는 원래 순서 그대로 이어 붙임',
    ],
    examples: [
      { input: 'number = "1924", k = 2', output: '"94"' },
      { input: 'number = "1231234", k = 3', output: '"3234"' },
      { input: 'number = "4177252841", k = 4', output: '"775841"' },
    ],
  },
  keyIntuitions: [
    '자릿수가 같은 수는 앞자리부터 비교합니다. 그래서 맨 앞자리부터 최대한 큰 숫자가 오게 하는 것이 안전한 선택입니다.',
    '앞 숫자가 바로 뒤 숫자보다 작으면 그 앞 숫자를 지우는 쪽이 항상 이득입니다. 스택에 쌓다가 새 숫자가 맨 위보다 크면 맨 위를 버립니다.',
    '다 못 지운 횟수는 값이 줄어드는 뒤쪽을 자르면 됩니다. 값이 작은 숫자부터 지우는 방법은 앞자리의 위치를 보지 않아 틀립니다.',
  ],
  demo: { input: [NUMBER, K], label: 'number = "4872711332", k = 5' },
  workUnit: '숫자를 비교한 횟수',
  approaches: [
    {
      id: 'big-number-stack',
      name: '스택으로 작은 수 버리기',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '앞에서부터 쌓다가 새 숫자보다 작은 맨 위를 버려, 한 번 훑는 동안 답이 만들어지는 풀이입니다.',
      pros: [
        '숫자를 한 번만 훑으므로 100만 자리도 금방 끝납니다.',
        '"작은 앞 숫자를 지운다"는 규칙 하나로 모든 경우를 처리합니다.',
        '배열의 push와 pop만 쓰면 되어 JavaScript도 간단합니다.',
      ],
      cons: ['다 못 지운 k를 뒤에서 자르는 마무리를 빼먹기 쉽습니다.'],
      whyThisRank:
        '지울 숫자는 "바로 뒤에 더 큰 숫자가 오는 숫자"라는 사실만 알면 됩니다. 각 숫자가 스택에 한 번 들어가고 한 번 나올 뿐이라 O(N)입니다.',
      code: STACK,
      visualize: stackScan,
    },
    {
      id: 'big-number-window',
      name: '구간에서 가장 큰 숫자를 한 자리씩 고르기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × (N − k)) 최악',
      spaceComplexity: 'O(1) (답 문자열 제외)',
      verdict: '남길 자릿수만큼 앞자리부터 고를 수 있는 구간의 가장 큰 숫자를 고르는, 맞지만 구간을 자리마다 다시 훑는 풀이입니다.',
      pros: [
        '"앞자리부터 가장 큰 숫자를 고른다"는 그리디 설명이 그대로 코드가 됩니다.',
        '스택 없이 인덱스 몇 개만으로 풀 수 있습니다.',
      ],
      cons: [
        '자리마다 구간을 다시 훑어서 N이 100만이고 k가 크면 시간 초과가 날 수 있습니다.',
        '뒤에 남겨 둘 자릿수 계산(end = n − left + 1)에서 한 칸씩 틀리기 쉽습니다.',
      ],
      whyThisRank:
        '생각은 정석과 같지만, 한 번 훑을 일을 자리마다 구간 전체를 다시 훑으며 합니다. 구간이 길수록 같은 숫자를 여러 번 비교합니다.',
      code: WINDOW,
      visualize: windowMax,
    },
    {
      id: 'big-number-smallest',
      name: '작은 숫자부터 k개 지우기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N × k)',
      spaceComplexity: 'O(N)',
      verdict: '가장 작은 숫자를 k번 지우면 될 것 같지만, 숫자의 위치를 보지 않아 틀립니다.',
      pros: ['직관적이고 코드가 짧습니다.', '공식 예제 두 개는 우연히 통과합니다.'],
      cons: [
        '값이 작지 않아도 앞에 있으면 지우는 편이 이득인데, 이 방법은 위치를 보지 않습니다.',
        'number = "4872711332", k = 5이면 48773이 나오지만 정답은 87733입니다.',
        '지울 때마다 전체를 훑어 느리기도 합니다.',
      ],
      whyThisRank:
        '큰 수는 앞자리가 결정합니다. 지울 숫자는 "값이 작은 숫자"가 아니라 "뒤에 더 큰 숫자가 오는 숫자"입니다. 이 차이를 놓치면 맨 앞의 작은 숫자가 남아 답이 작아집니다.',
      code: SMALLEST,
      visualize: eraseSmallest,
    },
  ],
  checks: {
    cases: [
      { args: ['1924', 2], expected: '94' },
      { args: ['1231234', 3], expected: '3234' },
      { args: ['4177252841', 4], expected: '775841' },
      { args: ['10', 1], expected: '1' },
      { args: ['987654321', 4], expected: '98765' },
      { args: ['1000000', 1], expected: '100000' },
      { args: ['99', 1], expected: '9' },
      { args: [NUMBER, K], expected: '87733' },
    ],
    // 2~8자리(첫 자리는 1~9, 나머지는 0~9), k는 1 ~ 자릿수 − 1
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 7);
      const number = Array.from({ length: n }, (_, i) => String(i ? Math.floor(rand() * 10) : 1 + Math.floor(rand() * 9))).join('');
      return [number, 1 + Math.floor(rand() * (n - 1))];
    },
  },
};

export default problem;
