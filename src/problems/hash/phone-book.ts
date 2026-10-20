// 전화번호 목록: 정석 집합으로 접두어 찾기, 대안 사전순 정렬 후 이웃 비교, 함정 모든 번호 쌍 비교를 같은 장면에서 움직인다.
// 장면은 위에 번호 목록 칸 한 줄, 가운데에 확인할 번호를 든 토큰 하나, 아래에 상자 하나다.
// 아래 상자는 정석에서는 집합, 대안에서는 정렬한 목록, 함정에서는 번호별 비교 횟수 기록이다.
import { slots } from '../../engine/layout.ts';
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';

type Lines = Record<Language, number[]>;

// 시각화 입력. 88이 883의 접두어라서 정답은 false다. 사전순으로 정렬하면 이 짝이 뒤쪽에 있고, 목록에서도 맨 끝에 있다.
const BOOK = ['326', '49', '520', '97', '88', '883'];
const N = BOOK.length;
const quoted = (xs: string[]) => `[${xs.map((x) => `"${x}"`).join(', ')}]`;

const sortedBook = [...BOOK].sort();
// 병합 정렬이 번호를 사전순으로 놓을 때 하는 문자열 비교 횟수(두 쪽을 나눠 정렬한 뒤, 한쪽이 바닥날 때까지 맨 앞끼리 비교)
const mergeCost = (xs: string[]): number => {
  if (xs.length < 2) return 0;
  const mid = xs.length >> 1;
  const [left, right] = [xs.slice(0, mid).sort(), xs.slice(mid).sort()];
  let [i, j, cost] = [0, 0, mergeCost(xs.slice(0, mid)) + mergeCost(xs.slice(mid))];
  while (i < left.length && j < right.length) {
    cost++;
    if (left[i] < right[j]) i++;
    else j++;
  }
  return cost;
};
const SORT_COST = mergeCost(BOOK);
// 정석 풀이가 시각화 입력에서 하는 집합에서 찾은 횟수(한 번 찾기 = 문자열 비교 1번으로 센다. 대안과 함정의 마지막 자막에서 견준다)
const SET_WORK = (() => {
  const numbers = new Set(BOOK);
  let n = 0;
  for (const number of BOOK) {
    for (let i = 1; i < number.length; i++) {
      n++;
      if (numbers.has(number.slice(0, i))) return n;
    }
  }
  return n;
})();

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const SET = {
  python: `def solution(phone_book):
    numbers = set(phone_book)            # 모든 번호를 집합에 넣기

    for number in phone_book:
        for i in range(1, len(number)):  # 자기 자신은 빼고 앞에서 i글자
            prefix = number[:i]
            if prefix in numbers:        # 접두어가 다른 번호라면
                return False
    return True`,
  javascript: `function solution(phone_book) {
  const numbers = new Set(phone_book); // 모든 번호를 집합에 넣기

  for (const number of phone_book) {
    for (let i = 1; i < number.length; i++) { // 자기 자신은 빼고 앞에서 i글자
      const prefix = number.slice(0, i);
      if (numbers.has(prefix)) { // 접두어가 다른 번호라면
        return false;
      }
    }
  }
  return true;
}`,
};
const SET_AT = {
  build: lines(SET, ['numbers = set(phone_book)'], ['const numbers = new Set(phone_book)']),
  pick: lines(SET, ['for number in phone_book:'], ['for (const number of phone_book)']),
  find: lines(SET, ['for i in range(1, len(number))', 'prefix = number[:i]', 'if prefix in numbers'],
    ['for (let i = 1; i < number.length; i++)', 'const prefix = number.slice(0, i)', 'if (numbers.has(prefix))']),
  found: lines(SET, ['if prefix in numbers', 'return False'], ['if (numbers.has(prefix))', 'return false']),
  done: lines(SET, ['return True'], ['return true']),
};

const SORT = {
  python: `def solution(phone_book):
    sorted_book = sorted(phone_book)     # 사전순: 접두어는 그 번호 바로 앞에 놓인다

    for a, b in zip(sorted_book, sorted_book[1:]):  # 이웃한 두 번호만 비교
        if b.startswith(a):              # 앞 번호가 뒤 번호의 접두어라면
            return False
    return True`,
  javascript: `function solution(phone_book) {
  const sorted = [...phone_book].sort(); // 사전순: 접두어는 그 번호 바로 앞에 놓인다

  for (let i = 0; i + 1 < sorted.length; i++) { // 이웃한 두 번호만 비교
    const a = sorted[i];
    const b = sorted[i + 1];
    if (b.startsWith(a)) { // 앞 번호가 뒤 번호의 접두어라면
      return false;
    }
  }
  return true;
}`,
};
const SORT_AT = {
  sort: lines(SORT, ['sorted_book = sorted(phone_book)'], ['const sorted = [...phone_book].sort()']),
  pair: lines(SORT, ['for a, b in zip('], ['for (let i = 0; i + 1 < sorted.length; i++)', 'const a = sorted[i]', 'const b = sorted[i + 1]']),
  check: lines(SORT, ['if b.startswith(a)'], ['if (b.startsWith(a))']),
  found: lines(SORT, ['if b.startswith(a)', 'return False'], ['if (b.startsWith(a))', 'return false']),
  done: lines(SORT, ['return True'], ['return true']),
};

const PAIRS = {
  python: `# 주의: 번호가 100만 개면 약 1조 번 비교해 시간 초과가 나는 풀이입니다
def solution(phone_book):
    for a in phone_book:
        for b in phone_book:
            if a != b and b.startswith(a):  # 모든 번호 쌍을 비교
                return False
    return True`,
  javascript: `// 주의: 번호가 100만 개면 약 1조 번 비교해 시간 초과가 나는 풀이입니다
function solution(phone_book) {
  for (const a of phone_book) {
    for (const b of phone_book) {
      if (a !== b && b.startsWith(a)) { // 모든 번호 쌍을 비교
        return false;
      }
    }
  }
  return true;
}`,
};
const PAIRS_AT = {
  pick: lines(PAIRS, ['for a in phone_book:'], ['for (const a of phone_book)']),
  compare: lines(PAIRS, ['for b in phone_book:', 'if a != b and b.startswith(a)'], ['for (const b of phone_book)', 'if (a !== b && b.startsWith(a))']),
  found: lines(PAIRS, ['if a != b and b.startswith(a)', 'return False'], ['if (a !== b && b.startsWith(a))', 'return false']),
  done: lines(PAIRS, ['return True'], ['return true']),
};

// 여러 줄 묶음을 하나로(번호 순서, 중복 없이)
const union = (...hs: Lines[]): Lines => ({
  python: [...new Set(hs.flatMap((h) => h.python))].sort((x, y) => x - y),
  javascript: [...new Set(hs.flatMap((h) => h.javascript))].sort((x, y) => x - y),
});

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 64px은 줄 이름, 칸은 x 72부터 54px씩 6px 간격. 상자는 칸 줄을 양옆 6px씩 감싼다(66~432).
// 세로: 번호 목록 28~82(함정의 판정 표시가 칸 위 11px을 쓰므로 위 여백), 가운데 토큰 161~189,
// 상자 226~332(머리글 234~256 아래 칸 268~322). 가운데 토큰은 목록 칸에서 아래로 100px 넘게 떨어져 있어서
// 함정의 비스듬한 화살표가 목록 칸 글자를 덜 건드린다.
const CELL = 54;
const GAP = 6;
const X0 = 72;
const LIST_Y = 28;
const PROBE_Y = 161;
const ZONE_Y = 226;
const HEAD_Y = 234;
const LOW_Y = 268;
const W = 460;
const H = 344;
const MID = 249; // 상자 가운데 x
const listCell = slots({ x: X0, y: LIST_Y, w: CELL, h: CELL, gap: GAP });
const lowCell = slots({ x: X0, y: LOW_Y, w: CELL, h: CELL, gap: GAP });
const colMid = (i: number) => X0 + i * (CELL + GAP) + CELL / 2;
const probeBox = (cx: number, w = 76): Rect => ({ x: cx - w / 2, y: PROBE_Y, w, h: 28 });

const numId = (i: number) => `num:${i}`;
const setId = (i: number) => `set:${i}`;
const sortId = (k: number) => `sort:${k}`;
const countId = (i: number) => `count:${i}`;

// 세 풀이가 같이 쓰는 장면: 번호 목록 칸 6개, 아래 상자와 머리글
function board(head: string): Scene {
  const items: Item[] = [
    { id: 'row:list', kind: 'text', rect: { x: 0, y: LIST_Y, w: 64, h: CELL }, text: '번호 목록' },
    { id: 'low:bg', kind: 'zone', rect: { x: 66, y: ZONE_Y, w: 366, h: 106 } },
    { id: 'low:head', kind: 'text', rect: { x: X0, y: HEAD_Y, w: 130, h: 22 }, text: head },
  ];
  BOOK.forEach((n, i) => items.push({ id: numId(i), kind: 'cell', rect: listCell(i), tone: 'plain', text: n }));
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });
const probeToken = (cx: number, text: string, tone: Tone = 'chosen'): Item => ({ id: 'probe', kind: 'token', rect: probeBox(cx), tone, text });
// 결과 토큰: 가운데 토큰이 가운데로 미끄러져 와 글과 색이 바뀐다
const resultOf = (text: string, tone: Tone, w: number): Action => ({ type: 'set', id: 'probe', patch: { rect: probeBox(MID, w), tone, text }, pop: true });

// 접두어 관계인 첫 짝: 앞 번호(접두어)와 뒤 번호(더 긴 번호)의 목록 칸 번호
interface Found { prefix: number; longer: number }

/* ------------------------------------------------------------------ */
/* 정석 집합: 번호 고르기 → 접두어 찾기 → 판정                            */
/* ------------------------------------------------------------------ */

function prefixSet(): Visualization {
  const rec = new StepRecorder(board('집합 numbers'));
  const numbers = new Set(BOOK);
  let number = '-';
  let i: number | string = '-';
  let prefix = '-';
  let found = '-';
  let lookups = 0;
  let hitPair: Found | undefined;
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({ work: lookups, variables: { number, i, prefix, '집합에 있나?': found } });

  rec.step({ title: `번호 ${N}개를 집합에 넣기`, codeHighlights: SET_AT.build, ...meta() });
  rec.phase('집합 만들기', `번호 ${N}개를 모두 집합에 넣습니다. 집합은 어떤 값이 있는지 한 번에 알려 주고, 순서는 따지지 않습니다.`);
  rec.do(...together(BOOK.map((n, k): Action => ({
    type: 'add', item: { id: setId(k), kind: 'cell', rect: lowCell(k), tone: 'chosen', text: n }, from: numId(k),
  }))), wait(500));

  for (let k = 0; k < N && !hitPair; k++) {
    number = BOOK[k];
    const tried: string[] = [];
    let hit: string | undefined;
    for (let n = 1; n < number.length && hit === undefined; n++) {
      const p = number.slice(0, n);
      tried.push(p);
      if (numbers.has(p)) hit = p;
    }
    lookups += tried.length;
    i = tried.length;
    prefix = tried.at(-1) ?? '-';
    found = hit === undefined ? '없음' : '있음';
    const owner = hit === undefined ? -1 : BOOK.indexOf(hit); // 접두어와 같은 번호의 칸
    if (hit !== undefined) hitPair = { prefix: owner, longer: k };
    const list = tried.join(', ');

    rec.step({
      title: hit === undefined ? `${number}: 앞부분 ${josa(list, '이', '가')} 집합에 없음` : `${number}: 앞부분 ${josa(hit, '이', '가')} 집합에 있음!`,
      codeHighlights: hit === undefined ? union(SET_AT.pick, SET_AT.find) : union(SET_AT.pick, SET_AT.found),
      ...meta(),
    });
    rec.phase('번호 고르기', `${josa(number, '을', '를')} 고릅니다. 앞부분이 집합에 있는지 짧은 것부터 찾아봅니다.`, SET_AT.pick);
    rec.do(...together([paint(numId(k), 'current'), { type: 'focus', ids: [numId(k)] }]), wait(400));

    rec.phase('접두어 찾기', hit === undefined
      ? `앞부분 ${josa(list, '을', '를')} ${tried.length > 1 ? '차례로 집합에서 찾습니다. 모두 없습니다.' : '집합에서 찾습니다. 없습니다.'}`
      : `앞부분을 짧은 것부터 찾다가 ${josa(hit, '이', '가')} 집합에 있음을 발견합니다.`, SET_AT.find);
    tried.forEach((p, t) => {
      const isHit = p === hit;
      const cx = isHit ? colMid(owner) : MID;
      if (t === 0) rec.do({ type: 'add', item: probeToken(cx, p), from: numId(k) });
      else rec.do(...together([{ type: 'clearMarks' }, { type: 'set', id: 'probe', patch: { text: p, rect: probeBox(cx) }, pop: true }]));
      if (isHit) rec.do({ type: 'focus', ids: [numId(k), setId(owner)] }, { type: 'arrow', from: 'probe', to: setId(owner), verdict: 'bad', label: '있음!', together: true });
      else rec.do({ type: 'arrow', from: 'probe', to: 'low:bg', verdict: 'seen', label: '없음' });
    });

    if (hit === undefined) {
      rec.phase('판정', '앞부분이 모두 집합에 없으니 이 번호는 통과입니다.', k + 1 < N ? SET_AT.pick : SET_AT.done);
      rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }, { type: 'remove', id: 'probe' }, paint(numId(k), 'visited')]));
    } else {
      rec.phase('판정', `집합에 ${josa(hit, '이', '가')} 있습니다. ${josa(hit, '은', '는')} ${number}의 접두어이니 false입니다.`, SET_AT.found);
      rec.do(...together([paint(numId(k), 'bad'), paint(setId(owner), 'bad')]));
    }
  }

  const pair = hitPair;
  const answer = pair === undefined;
  rec.step({
    title: answer ? '끝까지 접두어가 없음 → true' : `${josa(BOOK[pair.prefix], '이', '가')} ${BOOK[pair.longer]}의 접두어 → false`,
    codeHighlights: answer ? SET_AT.done : SET_AT.found,
    ...meta(),
    answer,
    isKeyframe: true,
  });
  if (pair) {
    const [small, big] = [BOOK[pair.prefix], BOOK[pair.longer]];
    rec.phase('정답', `번호 ${josa(small, '이', '가')} ${big}의 앞부분이라 정답은 false입니다. 모든 쌍을 비교하지 않고 ${lookups}번 만에 끝났습니다.`);
    rec.do(...together([
      paint(numId(pair.prefix), 'path'), paint(numId(pair.longer), 'path'), paint(setId(pair.prefix), 'path'),
      { type: 'unfocus' }, resultOf('정답 false', 'path', 104),
    ]));
  } else {
    rec.phase('정답', `모든 번호의 앞부분이 집합에 없었습니다. 정답은 true이고, ${lookups}번 찾았습니다.`);
    rec.do(...together([{ type: 'unfocus' }, ...BOOK.map((_, k) => paint(numId(k), 'path'))]));
  }
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 정렬: 정렬하기, (짝 고르기 → 시작 비교 → 판정) 이웃마다               */
/* ------------------------------------------------------------------ */

function sortNeighbors(): Visualization {
  const rec = new StepRecorder(board('정렬한 목록'));
  const order = BOOK.map((_, i) => i).sort((p, q) => (BOOK[p] < BOOK[q] ? -1 : 1)); // 사전순 k번째 번호의 목록 칸
  let a = '-';
  let b = '-';
  let starts = '-';
  let compared = 0; // 이웃끼리 비교한 횟수
  let sortedYet = false; // 정렬 비교는 첫 단계에서 한꺼번에 센다
  const meta = () => ({
    work: compared + (sortedYet ? SORT_COST : 0),
    workNote: `정렬 ${SORT_COST}번 포함`,
    variables: { a, b, 'b.startswith(a)': starts },
  });

  sortedYet = true;
  rec.step({ title: `번호를 사전순으로 정렬하기 (비교 ${SORT_COST}번)`, codeHighlights: SORT_AT.sort, ...meta() });
  rec.phase('정렬하기', `번호를 사전순으로 정렬합니다. 정렬에는 문자열 비교가 ${SORT_COST}번 듭니다(병합 정렬 기준). 이제 이웃끼리만 비교하면 됩니다.`);
  rec.do(...together(order.map((orig, k): Action => ({
    type: 'add', item: { id: sortId(k), kind: 'cell', rect: lowCell(k), tone: 'chosen', text: BOOK[orig] }, from: numId(orig),
  }))), wait(700));

  let pair: Found | undefined;
  for (let k = 0; k + 1 < N && !pair; k++) {
    [a, b] = [sortedBook[k], sortedBook[k + 1]];
    const hit = b.startsWith(a);
    compared++;
    starts = hit ? 'True' : 'False';
    if (hit) pair = { prefix: order[k], longer: order[k + 1] };

    rec.step({
      title: hit ? `${josa(b, '이', '가')} ${ro(a)} 시작함! → 접두어 발견` : `${josa(b, '이', '가')} ${ro(a)} 시작하는가? 아님`,
      codeHighlights: hit ? union(SORT_AT.pair, SORT_AT.found) : union(SORT_AT.pair, SORT_AT.check),
      ...meta(),
    });
    rec.phase('짝 고르기', `이웃한 두 번호 ${josa(a, '과', '와')} ${josa(b, '을', '를')} 고릅니다.`, SORT_AT.pair);
    rec.do(...together([paint(sortId(k), 'current'), paint(sortId(k + 1), 'current'), { type: 'focus', ids: [sortId(k), sortId(k + 1)] }]), wait(200));

    rec.phase('시작 비교', `${josa(b, '이', '가')} ${ro(a)} 시작하는지 비교합니다. ${hit ? '시작합니다!' : '아닙니다.'}`, SORT_AT.check);
    rec.do({ type: 'add', item: probeToken(colMid(k + 1), a), from: sortId(k) });
    rec.do({ type: 'arrow', from: 'probe', to: sortId(k + 1), verdict: hit ? 'bad' : 'seen', label: hit ? '접두어!' : '아님' });

    if (hit) {
      rec.phase('판정', `${josa(a, '은', '는')} ${b}의 접두어입니다! 바로 false를 돌려줍니다.`, SORT_AT.found);
      rec.do(...together([paint(sortId(k), 'bad'), paint(sortId(k + 1), 'bad')]));
    } else {
      rec.phase('판정', `${josa(a, '은', '는')} ${b}의 접두어가 아닙니다. 다음 이웃으로 넘어갑니다.`, k + 2 < N ? SORT_AT.pair : SORT_AT.done);
      rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }, { type: 'remove', id: 'probe' }, paint(sortId(k), 'visited'), paint(sortId(k + 1), 'plain')]));
    }
  }

  const answer = pair === undefined;
  rec.step({
    title: pair ? `${josa(BOOK[pair.prefix], '이', '가')} ${BOOK[pair.longer]}의 접두어 → false` : '이웃 모두 접두어가 아님 → true',
    codeHighlights: answer ? SORT_AT.done : SORT_AT.found,
    ...meta(),
    answer,
    isKeyframe: true,
  });
  if (pair) {
    rec.phase('정답', `이웃끼리 ${compared}번 비교해서 찾았고 정답은 false입니다. 정렬 ${SORT_COST}번을 더하면 ${compared + SORT_COST}번이라 정석의 ${SET_WORK}번보다 많습니다.`);
    const k = order.indexOf(pair.prefix);
    rec.do(...together([
      paint(numId(pair.prefix), 'path'), paint(numId(pair.longer), 'path'), paint(sortId(k), 'path'), paint(sortId(k + 1), 'path'),
      { type: 'unfocus' }, resultOf('정답 false', 'path', 104),
    ]));
  } else {
    rec.phase('정답', `이웃끼리 ${compared}번 비교했는데 접두어가 없었습니다. 정답은 true입니다.`);
    rec.do(...together([{ type: 'unfocus' }, ...BOOK.map((_, k) => paint(numId(k), 'path'))]));
  }
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 모든 쌍: 번호 고르기 → 모두 비교 → 정리, 번호마다 한 단계                */
/* ------------------------------------------------------------------ */

function allPairs(): Visualization {
  const rec = new StepRecorder(board('번호별 비교 횟수'));
  let a = '-';
  let b = '-';
  let starts = '-';
  let compared = 0;
  const meta = () => ({ work: compared, variables: { a, b, 'b.startswith(a)': starts } });
  const countAt = (i: number): Rect => ({ x: listCell(i).x, y: LOW_Y + 12, w: CELL, h: 30 });

  let pair: Found | undefined;
  for (let i = 0; i < N && !pair; i++) {
    a = BOOK[i];
    const looked: number[] = []; // b로 비교한 번호들(자기 자신은 건너뜀)
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      looked.push(j);
      if (BOOK[j].startsWith(a)) {
        pair = { prefix: i, longer: j };
        break;
      }
    }
    b = BOOK[looked.at(-1)!];
    starts = pair ? 'True' : 'False';
    compared += looked.length;

    rec.step({
      title: pair ? `${a}: ${looked.length}번째 비교에서 ${josa(b, '이', '가')} ${ro(a)} 시작함!` : `${a}: 나머지 ${looked.length}개와 비교 — 접두어 아님`,
      codeHighlights: pair ? union(PAIRS_AT.pick, PAIRS_AT.found) : union(PAIRS_AT.pick, PAIRS_AT.compare),
      ...meta(),
    });
    rec.phase('번호 고르기', `${josa(a, '을', '를')} 기준으로 고릅니다. 나머지 번호가 ${ro(a)} 시작하는지 봅니다.`, PAIRS_AT.pick);
    rec.do(...together([paint(numId(i), 'current'), { type: 'add', item: probeToken(MID, a), from: numId(i) }]), wait(200));

    rec.phase('모두 비교', pair
      ? `나머지를 하나씩 ${ro(a)} 시작하는지 비교하다가 ${josa(b, '이', '가')} ${ro(a)} 시작하는 것을 찾습니다.`
      : `나머지 ${looked.length}개를 하나씩 ${ro(a)} 시작하는지 비교합니다. 모두 아닙니다.`, PAIRS_AT.compare);
    for (const j of looked) {
      const hit = j === pair?.longer;
      rec.do({ type: 'arrow', from: 'probe', to: numId(j), verdict: hit ? 'bad' : 'seen', label: hit ? '접두어!' : '아님' });
    }

    if (pair) {
      rec.phase('정리', `${josa(a, '은', '는')} ${b}의 접두어입니다. ${looked.length}번째 비교에서 false가 정해집니다.`, PAIRS_AT.found);
      rec.do(...together([paint(numId(i), 'bad'), paint(numId(pair.longer), 'bad'), { type: 'add', item: { id: countId(i), kind: 'token', rect: countAt(i), tone: 'bad', text: `${looked.length}번` }, from: 'probe' }]));
    } else {
      rec.phase('정리', `${josa(a, '은', '는')} 다른 번호의 접두어가 아닙니다. ${looked.length}번 비교했습니다.`, i + 1 < N ? PAIRS_AT.pick : PAIRS_AT.done);
      rec.do(...together([
        { type: 'clearMarks' }, paint(numId(i), 'visited'),
        { type: 'add', item: { id: countId(i), kind: 'token', rect: countAt(i), tone: 'visited', text: `${looked.length}번` }, from: 'probe' },
        { type: 'remove', id: 'probe' },
      ]));
    }
  }

  const answer = pair === undefined;
  rec.step({
    title: `비교 ${compared}번 끝에 ${answer ? 'true' : 'false'} — 정석은 ${SET_WORK}번`,
    codeHighlights: answer ? PAIRS_AT.done : PAIRS_AT.found,
    ...meta(),
    answer,
    isKeyframe: true,
  });
  rec.phase('시간 초과', `답은 맞지만 ${compared}번을 비교했고 정석은 ${SET_WORK}번이었습니다. 번호가 100만 개면 쌍마다 비교해 약 1조 번이라 시간 초과입니다.`);
  const big = '100만 개면 약 1조 번';
  rec.do(rec.has('probe') ? resultOf(big, 'bad', 190) : { type: 'add', item: { ...probeToken(MID, big, 'bad'), id: 'probe', rect: probeBox(MID, 190) } }, wait(900));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'phone-book',
  title: '전화번호 목록',
  level: 2,
  category: 'hash',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42577',
  description: {
    summary:
      '전화번호부에 적힌 번호 중에 다른 번호의 맨 앞부분(접두어)과 똑같은 번호가 있는지 확인합니다. 그런 번호가 하나라도 있으면 false, 하나도 없으면 true를 돌려줍니다.',
    rules: [
      'phone_book의 길이는 1 이상 1,000,000 이하',
      '각 전화번호의 길이는 1 이상 20 이하',
      '같은 전화번호는 중복해서 들어 있지 않음',
    ],
    examples: [
      { input: 'phone_book = ["119", "97674223", "1195524421"]', output: 'false' },
      { input: 'phone_book = ["123","456","789"]', output: 'true' },
      { input: 'phone_book = ["12","123","1235","567","88"]', output: 'false' },
    ],
  },
  keyIntuitions: [
    '번호가 100만 개면 모든 쌍을 비교하는 데 약 1조 번이 들어서, 쌍을 하나씩 비교하는 풀이는 시간 초과입니다.',
    '번호 하나의 접두어는 길이 1~19로 최대 19개뿐입니다. 그 접두어가 다른 번호인지는 집합에서 한 번에 찾을 수 있습니다.',
    '사전순으로 정렬하면 접두어 관계인 번호가 이웃에 붙으므로, 이웃끼리만 비교해도 같은 답이 나옵니다.',
  ],
  demo: { input: [BOOK], label: `phone_book = ${quoted(BOOK)}` },
  workUnit: '문자열 비교 횟수',
  approaches: [
    {
      id: 'phone-book-set',
      name: '집합에서 접두어 찾기 (해시)',
      rank: 'BEST',
      timeComplexity: 'O(N × L)',
      spaceComplexity: 'O(N)',
      verdict: '번호마다 앞부분 몇 개만 집합에서 찾아서, 모든 쌍을 비교하지 않는 풀이입니다.',
      pros: [
        '번호 하나의 접두어는 길이가 L 이하이면 L − 1개뿐이라, 전체 찾기 횟수가 N × (L − 1) 안팎입니다.',
        '집합에서 찾기는 한 번에 끝나서(평균 O(1)) 번호가 100만 개여도 금방 끝납니다.',
        '"앞부분을 잘라 집합에서 찾는다"는 발상이 코드에 그대로 읽힙니다.',
      ],
      cons: [
        '앞부분을 잘라 낼 때마다 새 문자열이 생겨서, 번호 길이만큼의 비용이 따로 붙습니다.',
        '모든 번호를 집합에 담아야 해서 번호 개수만큼 메모리가 듭니다.',
      ],
      whyThisRank:
        '"번호 길이는 20 이하"라는 제한 사항이 열쇠입니다. 번호 하나가 가질 수 있는 접두어가 많아야 19개라서, 모든 쌍을 비교하던 일을 번호마다 접두어 몇 개를 찾는 일로 바꿀 수 있습니다.',
      code: SET,
      visualize: prefixSet,
    },
    {
      id: 'phone-book-sort',
      name: '사전순 정렬 후 이웃 비교',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log N × L)',
      spaceComplexity: 'O(N)',
      verdict: '정렬하면 이웃끼리만 비교하면 되지만, 정렬에 문자열 비교가 더 들고 정렬한 복사본 메모리도 필요합니다.',
      pros: [
        '해시를 몰라도 정렬만 알면 떠올릴 수 있습니다.',
        '정렬한 뒤의 비교는 이웃 N − 1번이면 끝납니다.',
      ],
      cons: [
        `정렬에만 문자열 비교가 N log N번 듭니다. 이 예에서는 정렬 ${SORT_COST}번과 이웃 비교 4번을 합쳐 ${SORT_COST + 4}번으로, 정석의 ${SET_WORK}번보다 많습니다.`,
        '정렬한 복사본을 따로 만들어야 해서 번호 개수만큼 메모리가 한 번 더 듭니다.',
        '"왜 이웃만 비교해도 되는지"가 바로 보이지 않습니다. 번호를 숫자로 바꿔 정렬하면 순서가 달라져 오답이 나는 것도 실수하기 쉬운 곳입니다.',
      ],
      whyThisRank:
        '답과 통과 여부는 정석과 같습니다. 하지만 정렬이라는 큰 일을 먼저 하고 복사본 메모리도 쓰기 때문에, 번호마다 접두어 몇 개만 찾는 정석보다 비교도 메모리도 더 듭니다. 이웃만 비교해도 되는 이유를 따로 알아야 하는 점도 손해입니다.',
      code: SORT,
      visualize: sortNeighbors,
    },
    {
      id: 'phone-book-pairs',
      name: '모든 번호 쌍 비교',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(N² × L)',
      spaceComplexity: 'O(1)',
      verdict: '작은 입력은 통과하지만, 번호가 100만 개면 약 1조 번을 비교해서 시간 초과가 나는 풀이입니다.',
      pros: ['가장 직관적이어서 틀릴 곳이 거의 없습니다.', '추가 메모리가 필요 없습니다.'],
      cons: [
        '번호가 N개면 N × (N − 1)번 비교합니다. 100만 개면 약 1조 번이라 효율성 테스트에서 시간 초과가 납니다.',
        'startswith도 번호 길이만큼의 비용이 따로 듭니다.',
      ],
      whyThisRank:
        '번호 하나가 가질 수 있는 접두어는 최대 19개뿐인데도 나머지 번호 전부와 비교합니다. "번호 길이가 20 이하"라는 제한 사항을 쓰지 않은 풀이입니다.',
      code: PAIRS,
      visualize: allPairs,
    },
  ],
  checks: {
    cases: [
      { args: [['119', '97674223', '1195524421']], expected: false },
      { args: [['123', '456', '789']], expected: true },
      { args: [['12', '123', '1235', '567', '88']], expected: false },
      { args: [['7']], expected: true },
      { args: [['12', '1']], expected: false }, // 접두어가 목록 뒤쪽에 있어도 찾는다
      { args: [['12', '21']], expected: true },
      { args: [BOOK], expected: false },
    ],
    // 번호 1~6개, 길이 1~4, 숫자 1~3만 써서 접두어 관계가 자주 생기게 한다(함정이 모든 쌍을 도는 시간도 짧다)
    random: (rand) => {
      const book = new Set<string>();
      const n = 1 + Math.floor(rand() * 6);
      while (book.size < n) {
        const length = 1 + Math.floor(rand() * 4);
        book.add(Array.from({ length }, () => String(1 + Math.floor(rand() * 3))).join(''));
      }
      return [[...book]];
    },
  },
};

export default problem;
