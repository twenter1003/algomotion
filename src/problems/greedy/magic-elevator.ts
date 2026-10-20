// 마법의 엘리베이터: 정석 자릿수 반올림(5는 윗자리를 보고 정함), 대안 올림 여부를 상태로 하는 자릿수 DP, 함정 5 이상은 무조건 올림을 같은 장면에서 움직인다.
// 장면은 위에 현재 층수를 자리마다 나눈 칸 한 줄(일의 자리가 오른쪽 끝), 아래에 누른 버튼 줄(정석·함정) 또는 DP 표(대안), 맨 아래에 표시다.
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { josa, lines, together } from '../shared.ts';
import { PacedRecorder } from './paced.ts';

// 시각화 입력. 정석은 29번, 5 이상을 무조건 올리면 31번(오답)이 나온다.
const STOREY = 24566525;
const DIGITS = [...String(STOREY)].reverse().map(Number); // 일의 자리부터
const D = DIGITS.length;
const COLS = D + 1; // 맨 위 칸은 올림이 넘쳐 올라올 때 쓴다
const PLACE = ['일', '십', '백', '천', '만', '십만', '백만', '천만', '억'];
const POW = (k: number) => 10 ** k;
const fmt = (n: number) => n.toLocaleString('en-US');
const inf = (v: number) => (v === Infinity ? '∞' : String(v));

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const ROUND = {
  python: `def solution(storey):
    answer = 0
    while storey > 0:
        digit = storey % 10                  # 일의 자리 숫자
        storey //= 10                        # 한 자리 위로 올라간다
        if digit > 5 or (digit == 5 and storey % 10 >= 5):   # 5는 한 자리 위를 보고 정한다
            answer += 10 - digit             # 올림: +버튼을 (10 - 숫자)번
            storey += 1                      # 윗자리에 1을 넘긴다
        else:
            answer += digit                  # 내림: -버튼을 숫자만큼
    return answer`,
  javascript: `function solution(storey) {
  let answer = 0;
  while (storey > 0) {
    const digit = storey % 10; // 일의 자리 숫자
    storey = Math.floor(storey / 10); // 한 자리 위로 올라간다
    if (digit > 5 || (digit === 5 && storey % 10 >= 5)) { // 5는 한 자리 위를 보고 정한다
      answer += 10 - digit; // 올림: +버튼을 (10 - 숫자)번
      storey += 1; // 윗자리에 1을 넘긴다
    } else {
      answer += digit; // 내림: -버튼을 숫자만큼
    }
  }
  return answer;
}`,
};
const ROUND_AT = {
  init: lines(ROUND, ['answer = 0'], ['let answer = 0']),
  look: lines(ROUND, ['while storey > 0', 'digit = storey % 10', 'storey //= 10', 'if digit > 5 or (digit == 5'], ['while (storey > 0)', 'const digit = storey % 10', 'storey = Math.floor(storey / 10)', 'if (digit > 5 || (digit === 5']),
  up: lines(ROUND, ['answer += 10 - digit', 'storey += 1'], ['answer += 10 - digit', 'storey += 1']),
  down: lines(ROUND, ['else:', 'answer += digit'], ['} else {', 'answer += digit']),
  done: lines(ROUND, ['while storey > 0', 'return answer'], ['while (storey > 0)', 'return answer']),
};

const DP = {
  python: `def solution(storey):
    down, up = 0, float('inf')           # 아래 자리에서 올림이 없을 때 / 올라왔을 때의 최소 누른 횟수
    for ch in reversed(str(storey)):     # 일의 자리부터
        d = int(ch)
        new_down = min(down + d, up + d + 1)             # 내림: 올림이 올라왔으면 이 자리 값은 d + 1
        new_up = min(down + 10 - d, up + 10 - (d + 1))   # 올림: 윗자리에 1을 넘긴다
        down, up = new_down, new_up
    return min(down, up + 1)             # 맨 위에 올림이 남았으면 + 1층 버튼 한 번`,
  javascript: `function solution(storey) {
  let down = 0; // 아래 자리에서 올림이 없을 때의 최소 누른 횟수
  let up = Infinity; // 올림이 올라왔을 때의 최소 누른 횟수
  for (const ch of [...String(storey)].reverse()) { // 일의 자리부터
    const d = Number(ch);
    const newDown = Math.min(down + d, up + d + 1); // 내림: 올림이 올라왔으면 이 자리 값은 d + 1
    const newUp = Math.min(down + 10 - d, up + 10 - (d + 1)); // 올림: 윗자리에 1을 넘긴다
    down = newDown;
    up = newUp;
  }
  return Math.min(down, up + 1); // 맨 위에 올림이 남았으면 + 1층 버튼 한 번
}`,
};
const DP_AT = {
  init: lines(DP, ["down, up = 0, float('inf')"], ['let down = 0', 'let up = Infinity']),
  calc: lines(DP, ['for ch in reversed(str(storey))', 'd = int(ch)', 'new_down = min', 'new_up = min'], ['for (const ch of [...String(storey)].reverse())', 'const d = Number(ch)', 'const newDown = Math.min', 'const newUp = Math.min']),
  write: lines(DP, ['down, up = new_down, new_up'], ['down = newDown', 'up = newUp']),
  done: lines(DP, ['return min(down, up + 1)'], ['return Math.min(down, up + 1)']),
};

const HALF_UP = {
  python: `def solution(storey):
    answer = 0
    while storey > 0:
        digit = storey % 10
        storey //= 10
        if digit >= 5:                       # 5도 무조건 올린다 (한 자리 위를 보지 않는다)
            answer += 10 - digit
            storey += 1
        else:
            answer += digit
    return answer  # 25는 7번 (정답) 대신 8번`,
  javascript: `function solution(storey) {
  let answer = 0;
  while (storey > 0) {
    const digit = storey % 10;
    storey = Math.floor(storey / 10);
    if (digit >= 5) { // 5도 무조건 올린다 (한 자리 위를 보지 않는다)
      answer += 10 - digit;
      storey += 1;
    } else {
      answer += digit;
    }
  }
  return answer; // 25는 7번 (정답) 대신 8번
}`,
};
const HALF_AT = {
  init: lines(HALF_UP, ['answer = 0'], ['let answer = 0']),
  look: lines(HALF_UP, ['while storey > 0', 'digit = storey % 10', 'storey //= 10', 'if digit >= 5'], ['while (storey > 0)', 'const digit = storey % 10', 'storey = Math.floor(storey / 10)', 'if (digit >= 5)']),
  up: lines(HALF_UP, ['answer += 10 - digit', 'storey += 1'], ['answer += 10 - digit', 'storey += 1']),
  down: lines(HALF_UP, ['else:', 'answer += digit'], ['} else {', 'answer += digit']),
  done: lines(HALF_UP, ['while storey > 0', 'return answer'], ['while (storey > 0)', 'return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 64px은 줄 이름, 자리 칸은 x 70부터 54px씩(칸 48px, 일의 자리가 오른쪽 끝). 오른쪽 50px 여백.
// 세로 띠: 자리 칸 30~78(판정 표시가 칸 위 11px에 붙는다), 자리 이름 84~100. 정석·함정은 자리마다 누른 횟수 토큰 줄 122~150, 표시 170~198.
// 대안은 DP 표(올림 없음 줄 118~158, 올림 있음 줄 166~206)와 표시 222~250.
const X0 = 70;
const PITCH = 54;
const CELL = 48;
const colX = (k: number) => X0 + (COLS - 1 - k) * PITCH; // 자리 k(0 = 일의 자리)의 칸 왼쪽 x
const DIGIT_Y = 30;
const SCENE_W = X0 + COLS * PITCH + 50;
const dId = (k: number) => `d:${k}`;
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const resultRect = (kind: 'lane' | 'dp'): Rect => ({ x: X0, y: kind === 'dp' ? 224 : 172, w: 160, h: 28 });
const truthRect = (): Rect => ({ x: X0 + 170, y: 172, w: 160, h: 28 });
const ansText = (n: number, tone: Tone = 'chosen', text = `누른 횟수 ${n}`): Action => ({ type: 'set', id: 'tok:ans', patch: { text, tone }, pop: true });

// 층 숫자 칸 맞추기: 자리 done개(0 ~ done − 1)는 눌러서 0이 된 자리, 그 위는 윗부분 upper의 자리 숫자(맨 앞 0은 비운다)
const floorActs = (done: number, upper: number, current: number[] = []): Action[] =>
  Array.from({ length: COLS }, (_, k): Action => {
    if (k < done) return { type: 'set', id: dId(k), patch: { text: '0', tone: 'visited' } };
    const v = Math.floor(upper / POW(k - done));
    const hidden = v === 0;
    return { type: 'set', id: dId(k), patch: { text: hidden ? '' : String(v % 10), tone: hidden ? 'explored' : current.includes(k) ? 'current' : 'plain' } };
  });

// 세 풀이가 같이 쓰는 장면: 자리 칸, 자리 이름, 표시. 대안은 DP 표 두 줄을 더한다
function board(kind: 'lane' | 'dp'): Scene {
  const items: Item[] = [{ id: 'lab:floor', kind: 'text', rect: { x: 0, y: DIGIT_Y, w: 64, h: CELL }, text: '층' }];
  if (kind === 'lane') {
    items.push({ id: 'lab:btn', kind: 'text', rect: { x: 0, y: 122, w: 64, h: 28 }, text: '누른 횟수' });
  } else {
    items.push(
      { id: 'lab:down', kind: 'text', rect: { x: 0, y: 118, w: 64, h: 40 }, text: '올림 없음' },
      { id: 'lab:up', kind: 'text', rect: { x: 0, y: 166, w: 64, h: 40 }, text: '올림 있음' },
    );
    for (let k = 0; k < D; k++) {
      items.push(
        { id: `dn:${k}`, kind: 'cell', rect: { x: colX(k), y: 118, w: CELL, h: 40 }, tone: 'explored', text: '' },
        { id: `upc:${k}`, kind: 'cell', rect: { x: colX(k), y: 166, w: CELL, h: 40 }, tone: 'explored', text: '' },
      );
    }
  }
  items.push({ id: 'tok:ans', kind: 'token', rect: resultRect(kind), tone: 'plain', text: kind === 'dp' ? '최소 횟수 -' : '누른 횟수 0' });
  for (let k = 0; k < COLS; k++) {
    const digit = k < D ? String(DIGITS[k]) : '';
    items.push(
      { id: dId(k), kind: 'cell', rect: { x: colX(k), y: DIGIT_Y, w: CELL, h: CELL }, tone: k < D ? 'plain' : 'explored', text: digit },
      { id: `pl:${k}`, kind: 'text', rect: { x: colX(k), y: 84, w: CELL, h: 16 }, tone: 'muted', text: PLACE[k] },
    );
  }
  return { width: SCENE_W, height: kind === 'dp' ? 262 : 208, items };
}

/* ------------------------------------------------------------------ */
/* 정석·함정 자릿수 반올림: 살피기 → 누르기 (자리 하나가 한 단계)            */
/* ------------------------------------------------------------------ */

// half가 true면 정석(5는 윗자리를 본다), false면 함정(5 이상은 무조건 올림)
function rounding(half: boolean): Visualization {
  const rec = new PacedRecorder(board('lane'));
  const AT = half ? ROUND_AT : HALF_AT;
  let [upper, answer, work, done] = [STOREY, 0, 0, 0];
  let digit = 0;
  const pressed: string[] = [];
  const meta = () => ({ work, variables: { digit: digit || '-', storey: upper, answer } });

  rec.step({ title: 'answer = 0', codeHighlights: AT.init, ...meta() });
  rec.phase('시작', half
    ? '일의 자리부터 한 자리씩 0으로 만듭니다. 숫자가 작으면 −버튼을 숫자만큼, 크면 +버튼을 (10 − 숫자)번 눌러 윗자리에 1을 넘깁니다.'
    : '일의 자리부터 한 자리씩 0으로 만듭니다. 숫자가 5 이상이면 +버튼으로 올리고, 아니면 −버튼으로 내립니다.');
  rec.do(ansText(0));

  for (let k = 0; upper > 0; k++) {
    const d = upper % 10;
    const rest = Math.floor(upper / 10);
    const nd = rest % 10;
    const tie = d === 5;
    const up = half ? d > 5 || (tie && nd >= 5) : d >= 5;
    const cost = up ? 10 - d : d;
    const before = fmt(upper * POW(k));
    [digit, upper, done] = [d, up ? rest + 1 : rest, k + 1];
    answer += cost;
    work++;
    const press = `${up ? '+' : '-'}${fmt(POW(k))}`;
    const after = fmt(upper * POW(k + 1));

    rec.step({ title: `${PLACE[k]}의 자리 ${d}: ${up ? '올림' : '내림'}, ${cost}번`, codeHighlights: up ? AT.up : AT.down, ...meta() });
    rec.phase('살피기', half
      ? tie
        ? `${PLACE[k]}의 자리 ${d}는 딱 5입니다. 한 자리 위의 ${josa(nd, '이', '가')} ${nd >= 5 ? '5 이상이라 올리는 쪽이 이득입니다' : '5보다 작아 내리는 쪽이 이득입니다'}.`
        : `${PLACE[k]}의 자리 ${josa(d, '은', '는')} 5보다 ${d > 5 ? '커서 올립니다' : '작아서 내립니다'}.`
      : `${PLACE[k]}의 자리 ${josa(d, '은', '는')} 5 ${d >= 5 ? '이상이라 올립니다' : '미만이라 내립니다'}.${tie ? ' 한 자리 위는 보지 않습니다.' : ''}`, AT.look);
    rec.do(...together([{ type: 'focus', ids: tie && half ? [dId(k), dId(k + 1)] : [dId(k)] }, { type: 'set', id: dId(k), patch: { tone: 'current' } }]));
    if (tie && half) {
      rec.do({ type: 'arrow', from: dId(k), to: dId(k + 1), verdict: nd >= 5 ? 'good' : 'bad', label: nd >= 5 ? `${nd} ≥ 5 올림` : `${nd} < 5 내림` }, wait(450));
    } else {
      rec.do(wait(450));
    }

    rec.phase('누르기', `${press}층 버튼을 ${cost}번 눌러 ${PLACE[k]}의 자리를 0으로 만들${up ? '고 윗자리에 1을 넘깁니다' : '니다'}. 층은 ${before}에서 ${josa(after, '이', '가')} 됩니다.`.replace('만들니다', '만듭니다'), up ? AT.up : AT.down);
    rec.do(...clear());
    if (cost) {
      pressed.push(`p:${k}`);
      rec.do(...together([
        { type: 'add', item: { id: `p:${k}`, kind: 'token', rect: { x: colX(k) + 4, y: 122, w: 40, h: 28 }, tone: up ? 'chosen' : 'visited', text: `${up ? '+' : '-'}${cost}` }, from: dId(k) },
        ...floorActs(done, upper),
        ansText(answer),
      ]));
    } else {
      rec.do(...together([...floorActs(done, upper), ansText(answer)]));
    }
  }

  digit = 0;
  rec.step({ title: `누른 횟수 ${answer}번`, codeHighlights: AT.done, ...meta(), answer, isKeyframe: true });
  if (half) {
    rec.phase('정답', `층이 0이 됐습니다. 버튼을 모두 ${answer}번 눌렀고 자릿수만큼만 반복했습니다. 딱 5인 자리는 한 자리 위를 보고 더 적게 누르는 쪽을 골랐습니다.`);
    rec.do(...together([...pressed.map((id): Action => ({ type: 'set', id, patch: { tone: 'path' } })), ansText(answer, 'path')]));
  } else {
    rec.phase('오답 확인', `5를 무조건 올렸더니 ${answer}번입니다. 한 자리 위가 5보다 작은 5는 내리는 쪽이 더 적게 누르므로 정답은 ${TRUTH}번입니다.`);
    rec.do(...together([ansText(answer, 'bad', `이 방법 ${answer}번`), { type: 'add', item: { id: 'tok:truth', kind: 'token', rect: truthRect(), tone: 'good', text: `정답 ${TRUTH}번` } }]));
  }
  return rec.finish();
}

// 정답(정석 코드와 같은 규칙으로 구한 값)
const TRUTH = (() => {
  let [x, a] = [STOREY, 0];
  while (x > 0) {
    const d = x % 10;
    x = Math.floor(x / 10);
    if (d > 5 || (d === 5 && x % 10 >= 5)) [a, x] = [a + 10 - d, x + 1];
    else a += d;
  }
  return a;
})();

/* ------------------------------------------------------------------ */
/* 대안 자릿수 DP: 후보 계산 → 표에 쓰기 (자리 하나가 한 단계)               */
/* ------------------------------------------------------------------ */

function digitDp(): Visualization {
  const rec = new PacedRecorder(board('dp'));
  let [down, up, work] = [0, Infinity, 0];
  let d = 0;
  const meta = () => ({ work, variables: { d: d || '-', down: inf(down), up: inf(up) } });

  rec.step({ title: 'down = 0, up = ∞', codeHighlights: DP_AT.init, ...meta() });
  rec.phase('시작', '올림이 없을 때(down)와 올림이 올라왔을 때(up)의 최소 횟수를 자리마다 구합니다. 처음엔 down = 0, up = ∞입니다.');
  rec.do(ansText(0, 'plain', '최소 횟수 -'));

  DIGITS.forEach((dv, k) => {
    const [dn0, up0] = [down, up];
    const nd = Math.min(dn0 + dv, up0 + dv + 1);
    const nu = Math.min(dn0 + 10 - dv, up0 + 10 - (dv + 1));
    d = dv;
    work += 4;
    [down, up] = [nd, nu];

    rec.step({ title: `${PLACE[k]}의 자리 ${dv}: down ${inf(nd)}, up ${inf(nu)}`, codeHighlights: DP_AT.write, ...meta() });
    rec.phase('후보 계산', `내림 min(${inf(dn0)} + ${dv}, ${inf(up0)} + ${dv + 1}) = ${inf(nd)}, 올림 min(${inf(dn0)} + ${10 - dv}, ${inf(up0)} + ${9 - dv}) = ${inf(nu)}.`, DP_AT.calc);
    const prev = k ? [`dn:${k - 1}`, `upc:${k - 1}`] : [];
    rec.do(...together([{ type: 'focus', ids: [dId(k), ...prev] }, { type: 'set', id: dId(k), patch: { tone: 'current' } }]), wait(500));

    rec.phase('표에 쓰기', `${PLACE[k]}의 자리 칸에 down = ${inf(nd)}, up = ${inf(nu)}를 적습니다.`, DP_AT.write);
    rec.do(...clear(
      { type: 'set', id: `dn:${k}`, patch: { text: inf(nd), tone: 'visited' }, pop: true },
      { type: 'set', id: `upc:${k}`, patch: { text: inf(nu), tone: 'chosen' }, pop: true },
      { type: 'set', id: dId(k), patch: { tone: 'visited' } },
    ));
  });

  d = 0;
  const answer = Math.min(down, up + 1);
  rec.step({ title: `최소 ${answer}번`, codeHighlights: DP_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `맨 위에 올림이 남았다면 +1층 버튼을 한 번 더 눌러야 하니 min(${down}, ${inf(up)} + 1) = ${answer}번입니다. 자릿수마다 두 값만 갱신하므로 계산은 ${work}번입니다.`);
  rec.do(...together([{ type: 'set', id: `dn:${D - 1}`, patch: { tone: 'path' } }, ansText(answer, 'path', `최소 횟수 ${answer}`)]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'magic-elevator',
  title: '마법의 엘리베이터',
  level: 2,
  category: 'greedy',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/148653',
  description: {
    summary:
      '마법의 엘리베이터에는 절댓값이 10의 거듭제곱(1, 10, 100, …)인 정수가 적힌 버튼이 있고, 누를 때마다 그 값만큼 층이 바뀝니다. 0층보다 낮아지는 버튼은 눌러도 움직이지 않습니다. 버튼을 한 번 누를 때마다 마법의 돌이 1개 듭니다. storey층에서 0층으로 가는 데 필요한 돌의 최소 개수를 구합니다.',
    rules: [
      '1 ≤ storey ≤ 100,000,000',
      '버튼의 값은 ±1, ±10, ±100, … (10의 거듭제곱)',
      '0층보다 낮은 층으로는 갈 수 없음',
    ],
    examples: [
      { input: 'storey = 16', output: '6' },
      { input: 'storey = 2554', output: '16' },
    ],
  },
  keyIntuitions: [
    '큰 버튼 하나로 여러 자리를 한꺼번에 움직일 수 없으니, 자리마다 따로 0으로 만들어야 합니다. 일의 자리부터 보면 윗자리와 겹치지 않습니다.',
    '한 자리 숫자 d는 −버튼을 d번(내림) 누르거나, +버튼을 (10 − d)번 누르고 윗자리에 1을 넘기는(올림) 두 방법뿐입니다. 5보다 크면 올림, 작으면 내림이 이득입니다.',
    '딱 5일 때는 올림과 내림이 이 자리에서는 같지만, 올림은 윗자리를 1 키웁니다. 윗자리가 5 이상이면 올려서 이어서 올림이 되고, 5보다 작으면 내리는 편이 이득이라 한 자리 위를 보고 정해야 합니다.',
  ],
  demo: { input: [STOREY], label: 'storey = 24566525' },
  workUnit: '자리에서 값을 계산한 횟수',
  approaches: [
    {
      id: 'magic-elevator-round',
      name: '자릿수 반올림 (5는 윗자리를 보고)',
      rank: 'BEST',
      timeComplexity: 'O(log storey)',
      spaceComplexity: 'O(1)',
      verdict: '일의 자리부터 한 자리씩 올림이나 내림 중 적게 누르는 쪽을 고르고, 5일 때만 한 자리 위를 보는 풀이입니다.',
      pros: [
        '자릿수(최대 9번)만큼만 반복하므로 storey가 1억이어도 순식간입니다.',
        '추가 메모리가 필요 없고 코드가 짧습니다.',
        '자리마다 "올릴까 내릴까"만 정하면 되어 이해하기 쉽습니다.',
      ],
      cons: [
        '딱 5일 때 한 자리 위를 봐야 한다는 점을 놓치기 쉽습니다.',
        '올림으로 윗자리가 9에서 10이 되는 경우처럼 올림이 연달아 올라오는 것도 storey += 1로 한 번에 처리됩니다. 눈으로 확인하기 어려운 부분입니다.',
      ],
      whyThisRank:
        '한 자리를 0으로 만드는 방법은 내림(d번)과 올림(10 − d번)뿐이고, 윗자리에 주는 영향은 올림이 +1입니다. 5를 넘으면 올림이 거의 항상 이득이고, 딱 5일 때만 윗자리가 올림을 더 이어 갈지가 결과를 가릅니다.',
      code: ROUND,
      visualize: () => rounding(true),
    },
    {
      id: 'magic-elevator-dp',
      name: '자릿수 DP (올림 여부를 상태로)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(log storey)',
      spaceComplexity: 'O(1)',
      verdict: '자리마다 "아래에서 올림이 올라왔는지"를 상태로 두고, 두 상태의 최소 횟수를 갱신하는 맞지만 더 무거운 풀이입니다.',
      pros: [
        '5일 때 윗자리를 보는 예외 규칙 없이 모든 경우를 따져 봅니다.',
        '자릿수만큼만 반복하므로 느리지 않습니다.',
      ],
      cons: [
        '자리마다 후보를 네 개 계산해, 정석의 한 번보다 계산이 많고 식도 길어집니다.',
        '올림이 올라오면 이 자리 값이 d + 1이 되는 것을 식마다 챙겨야 합니다.',
      ],
      whyThisRank:
        '정석의 "5는 윗자리를 본다"는 규칙은 사실 이 DP가 매번 하는 비교를 줄여 쓴 것입니다. 규칙을 모를 때 안전하게 쓸 수 있지만, 알고 나면 정석이 더 짧고 빠릅니다.',
      code: DP,
      visualize: digitDp,
    },
    {
      id: 'magic-elevator-half-up',
      name: '5 이상은 무조건 올림',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(log storey)',
      spaceComplexity: 'O(1)',
      verdict: '자리 숫자가 5 이상이면 올리고 아니면 내리는 풀이로, 딱 5일 때 한 자리 위를 보지 않아 틀립니다.',
      pros: ['코드가 가장 짧고 반올림 규칙 그대로여서 자연스럽습니다.', '공식 예제 두 개는 우연히 통과합니다.'],
      cons: [
        '딱 5인 자리의 윗자리가 5보다 작을 때는 내리는 쪽이 더 적게 누르는데, 그것을 놓칩니다.',
        'storey = 25이면 정답은 7번(5번 내리고 2번 내림)인데 8번이 나옵니다.',
      ],
      whyThisRank:
        '올림은 윗자리를 1 키우므로 딱 5일 때는 윗자리가 어떤지에 따라 이득이 달라집니다. 일의 자리만 보고 올리면 윗자리 비용이 늘어 전체가 손해가 될 수 있습니다.',
      code: HALF_UP,
      visualize: () => rounding(false),
    },
  ],
  checks: {
    cases: [
      { args: [16], expected: 6 },
      { args: [2554], expected: 16 },
      { args: [1], expected: 1 },
      { args: [5], expected: 5 },
      { args: [6], expected: 5 },
      { args: [25], expected: 7 },
      { args: [55], expected: 10 },
      { args: [95], expected: 6 },
      { args: [100000000], expected: 1 },
      { args: [99999999], expected: 2 },
      { args: [STOREY], expected: 29 },
    ],
    // 1 ~ 99,999(자리마다 숫자가 골고루, 5와 9가 자주 나오게 한 자리씩 고른다)
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 5);
      return [Number(Array.from({ length: n }, (_, i) => (i === 0 ? 1 + Math.floor(rand() * 9) : Math.floor(rand() * 10))).join(''))];
    },
  },
};

export default problem;
