// 소수 찾기: 정석 순열 + 소수 판정, 대안 체로 소수표를 먼저 만들기, 함정 중복을 거르지 않고 세기.
// 정석과 함정은 같은 장면(종이 조각 · 순열 나무 · 아래 줄)을 쓰고, 대안은 0~110 소수표(체)를 쓴다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { around, slots } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';
import { branch, holdCaptions, layoutTree, type Shape } from './common.ts';

// 원문 예제 2. 세 풀이의 시각화 입력이자 점검 사례다. 앞에 0이 붙는 수와 같은 숫자 종이가 있어 중복이 생긴다.
const NUMBERS = '011';
const N = NUMBERS.length;
const q = (s: string | number) => `"${s}"`;
const textOf = (path: number[]) => path.map((i) => NUMBERS[i]).join('');
const restOf = (path: number[]) => [...NUMBERS].filter((_, i) => !path.includes(i)).join('');

// 순열 나무의 마디(안 쓴 종이를 하나 붙일 때마다 하나). 코드의 build가 도는 차례(DFS 전위)대로다.
interface Node { path: number[]; text: string; value: number }
const NODES: Node[] = [];
const walk = (path: number[]) => {
  if (path.length) NODES.push({ path, text: textOf(path), value: Number(textOf(path)) });
  for (let i = 0; i < N; i++) if (!path.includes(i)) walk([...path, i]);
};
walk([]);

// 소수 판정에서 나눠 본 횟수와 결과. 코드의 반복(d = 2 .. √n)과 같다.
const probe = (n: number) => {
  if (n < 2) return { prime: false, tries: 0, divisor: 0, root: 0 };
  let tries = 0;
  const root = Math.floor(Math.sqrt(n));
  for (let d = 2; d * d <= n; d++) {
    tries++;
    if (n % d === 0) return { prime: false, tries, divisor: d, root };
  }
  return { prime: true, tries, divisor: 0, root };
};
const kindOf = (n: number) => (probe(n).prime ? 'prime' : n < 2 ? 'small' : 'composite');
interface Meta { work: number; variables: Record<string, string | number> }
const both = (a: number, b: number) => `${josa(a, '과', '와')} ${b}`;
// 수 여러 개 뒤에 조사를 붙인다: 8, 9, 10은
const many = (xs: number[], batchim: string, plain: string) =>
  [...xs.slice(0, -1), josa(xs.at(-1)!, batchim, plain)].join(', ');

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const IS_PRIME_PY = `def is_prime(n):
    if n < 2:
        return False
    for d in range(2, int(n ** 0.5) + 1):  # 제곱근까지만 나눠 봅니다
        if n % d == 0:
            return False
    return True
`;
const IS_PRIME_JS = `function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) { // 제곱근까지만 나눠 봅니다
    if (n % d === 0) return false;
  }
  return true;
}
`;

const BEST = {
  python: `${IS_PRIME_PY}
def solution(numbers):
    found = set()  # 같은 수는 한 번만 세려고 집합에 담습니다

    def build(current, rest):
        if current:
            found.add(int(current))  # "011"도 정수 11이 됩니다
        for i in range(len(rest)):
            # 안 쓴 종이 하나를 더 붙입니다
            build(current + rest[i], rest[:i] + rest[i + 1:])

    build("", numbers)
    return sum(is_prime(x) for x in found)`,
  javascript: `${IS_PRIME_JS}
function solution(numbers) {
  const found = new Set(); // 같은 수는 한 번만 세려고 집합에 담습니다

  const build = (current, rest) => {
    if (current) found.add(Number(current)); // "011"도 정수 11이 됩니다
    for (let i = 0; i < rest.length; i++) {
      // 안 쓴 종이 하나를 더 붙입니다
      build(current + rest[i], rest.slice(0, i) + rest.slice(i + 1));
    }
  };

  build("", numbers);
  let count = 0;
  for (const x of found) if (isPrime(x)) count++;
  return count;
}`,
};
// 소수 판정 줄: 2보다 작음(small) / 나누어떨어짐(composite) / 끝까지 나누어떨어지지 않음(prime)
const testAt = (code: Record<'python' | 'javascript', string>, call: [string, string]) => ({
  small: lines(code, [call[0], 'if n < 2:', '        return False'], [call[1], 'if (n < 2) return false']),
  composite: lines(code, [call[0], 'for d in range(2', 'if n % d == 0:', '            return False'], [call[1], 'for (let d = 2', 'if (n % d === 0) return false']),
  prime: lines(code, [call[0], 'for d in range(2', 'if n % d == 0:', 'return True'], [call[1], 'for (let d = 2', 'if (n % d === 0) return false', 'return true']),
});
const BEST_AT = {
  start: lines(BEST, ['found = set()', 'build("", numbers)'], ['const found = new Set()', 'build("", numbers)']),
  pick: lines(BEST, ['for i in range(len(rest))', 'build(current + rest[i]'], ['for (let i = 0; i < rest.length; i++)', 'build(current + rest[i]']),
  add: lines(BEST, ['if current:', 'found.add(int(current))'], ['if (current) found.add(Number(current))']),
  back: lines(BEST, ['for i in range(len(rest))'], ['for (let i = 0; i < rest.length; i++)']),
  test: testAt(BEST, ['return sum(is_prime(x) for x in found)', 'for (const x of found)']),
  done: lines(BEST, ['return sum(is_prime(x) for x in found)'], ['for (const x of found) if (isPrime(x)) count++', 'return count']),
};

const SIEVE = {
  python: `def solution(numbers):
    # 만들 수 있는 가장 큰 수까지 에라토스테네스의 체로 소수표를 먼저 만듭니다
    limit = int("".join(sorted(numbers, reverse=True)))
    is_prime = [True] * (limit + 1)
    is_prime[0] = False
    if limit >= 1:
        is_prime[1] = False
    for p in range(2, int(limit ** 0.5) + 1):
        if is_prime[p]:
            for multiple in range(p * p, limit + 1, p):
                is_prime[multiple] = False  # p의 배수를 지웁니다

    found = set()

    def build(current, rest):
        if current:
            found.add(int(current))
        for i in range(len(rest)):
            build(current + rest[i], rest[:i] + rest[i + 1:])

    build("", numbers)
    return sum(is_prime[x] for x in found)  # 표를 조회만 합니다`,
  javascript: `function solution(numbers) {
  // 만들 수 있는 가장 큰 수까지 에라토스테네스의 체로 소수표를 먼저 만듭니다
  const limit = Number([...numbers].sort().reverse().join(""));
  const isPrime = Array(limit + 1).fill(true);
  isPrime[0] = false;
  if (limit >= 1) isPrime[1] = false;
  for (let p = 2; p * p <= limit; p++) {
    if (!isPrime[p]) continue;
    for (let multiple = p * p; multiple <= limit; multiple += p) {
      isPrime[multiple] = false; // p의 배수를 지웁니다
    }
  }

  const found = new Set();
  const build = (current, rest) => {
    if (current) found.add(Number(current));
    for (let i = 0; i < rest.length; i++) {
      build(current + rest[i], rest.slice(0, i) + rest.slice(i + 1));
    }
  };

  build("", numbers);
  let count = 0;
  for (const x of found) if (isPrime[x]) count++; // 표를 조회만 합니다
  return count;
}`,
};
const SIEVE_AT = {
  table: lines(SIEVE, ['limit = int(', 'is_prime = [True] * (limit + 1)', 'is_prime[0] = False', 'is_prime[1] = False'],
    ['const limit = Number(', 'const isPrime = Array(limit + 1)', 'isPrime[0] = false', 'if (limit >= 1) isPrime[1] = false']),
  round: lines(SIEVE, ['for p in range(2, int(limit ** 0.5) + 1)', 'if is_prime[p]:', 'for multiple in range(p * p', 'is_prime[multiple] = False'],
    ['for (let p = 2; p * p <= limit; p++)', 'if (!isPrime[p]) continue', 'for (let multiple = p * p', 'isPrime[multiple] = false']),
  finish: lines(SIEVE, ['for p in range(2, int(limit ** 0.5) + 1)', 'if is_prime[p]:'], ['for (let p = 2; p * p <= limit; p++)', 'if (!isPrime[p]) continue']),
  collect: lines(SIEVE, ['found = set()', 'build("", numbers)'], ['const found = new Set()', 'build("", numbers)']),
  look: lines(SIEVE, ['return sum(is_prime[x] for x in found)'], ['for (const x of found) if (isPrime[x]) count++']),
  done: lines(SIEVE, ['return sum(is_prime[x] for x in found)'], ['for (const x of found) if (isPrime[x]) count++', 'return count']),
};

const TRAP = {
  python: `${IS_PRIME_PY}
# 주의: 같은 수가 여러 번 만들어져도 그대로 세는 오답 풀이입니다
def solution(numbers):
    count = 0

    def build(current, rest):
        nonlocal count
        if current and is_prime(int(current)):
            count += 1  # 집합에 담지 않아 같은 수가 또 나와도 셉니다
        for i in range(len(rest)):
            build(current + rest[i], rest[:i] + rest[i + 1:])

    build("", numbers)
    return count`,
  javascript: `${IS_PRIME_JS}
// 주의: 같은 수가 여러 번 만들어져도 그대로 세는 오답 풀이입니다
function solution(numbers) {
  let count = 0;

  const build = (current, rest) => {
    if (current && isPrime(Number(current))) {
      count++; // 집합에 담지 않아 같은 수가 또 나와도 셉니다
    }
    for (let i = 0; i < rest.length; i++) {
      build(current + rest[i], rest.slice(0, i) + rest.slice(i + 1));
    }
  };

  build("", numbers);
  return count;
}`,
};
const TRAP_AT = {
  start: lines(TRAP, ['count = 0', 'build("", numbers)'], ['let count = 0', 'build("", numbers)']),
  pick: lines(TRAP, ['for i in range(len(rest))', 'build(current + rest[i]'], ['for (let i = 0; i < rest.length; i++)', 'build(current + rest[i]']),
  test: testAt(TRAP, ['if current and is_prime(int(current))', 'if (current && isPrime(Number(current)))']),
  count: lines(TRAP, ['if current and is_prime(int(current))', 'for d in range(2', 'if n % d == 0:', 'return True', 'count += 1'],
    ['if (current && isPrime(Number(current)))', 'for (let d = 2', 'if (n % d === 0) return false', 'return true', 'count++']),
  back: lines(TRAP, ['for i in range(len(rest))'], ['for (let i = 0; i < rest.length; i++)']),
  done: lines(TRAP, ['return count'], ['return count']),
};

/* ------------------------------------------------------------------ */
/* 장면: 종이 조각 · 순열 나무 · 모음 줄 · 계산 글                         */
/* ------------------------------------------------------------------ */

// 세로: 종이 0~54, 나무 70~306(마디 54×44, 깊이마다 64px), 줄 330~364, 계산 글 372~400.
// 가로: 마디 54px에 10px 간격, 잎 6개가 18~392. 오른쪽 끝 판정 표시(이미 있음)가 판 안에 들게 여백을 둔다.
const W = 420;
const H = 404;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다
const TREE = { x: 18, y: 70, w: 54, h: 44, gapX: 10, gapY: 20 };
const key = (path: number[]) => `n:${path.join('')}`;
const shape = (path: number[]): Shape => ({
  id: key(path),
  kids: [...Array(N).keys()].filter((i) => !path.includes(i)).map((i) => shape([...path, i])),
});
const RECTS = layoutTree(shape([]), TREE);
const nodeRect = (path: number[]) => RECTS.get(key(path))!;
const LANE: LaneOptions = { id: 'lane', x: 76, y: 330, slotW: 48, slotH: 34, gap: 6, max: 6 };
const CALC_Y = 372;

// 정석과 함정이 같이 쓰는 장면. 줄 이름과 계산 글 너비만 다르다(함정은 오른쪽에 정답 표시 자리를 남긴다)
function board(laneName: string, calcW: number, tallyX: number): Scene {
  const items: Item[] = [];
  [...NUMBERS].forEach((d, i) => items.push({ id: `paper:${i}`, kind: 'cell', rect: { x: 18 + i * 64, y: 0, w: 54, h: 54 }, tone: 'plain', text: d, tag: `${i + 1}번` }));
  const root = nodeRect([]);
  items.push(
    { id: key([]), kind: 'cell', rect: root, tone: 'plain', text: '""' },
    { id: 'root:label', kind: 'text', rect: { x: root.x + root.w + 8, y: root.y, w: 64, h: root.h }, tone: 'muted', text: '빈 숫자' },
  );
  items.push(
    { id: 'lane:label', kind: 'text', rect: { x: 18, y: LANE.y, w: 54, h: LANE.slotH }, text: laneName },
    { id: 'lane:bg', kind: 'zone', rect: { x: LANE.x - 4, y: LANE.y - 3, w: LANE.max * (LANE.slotW + LANE.gap) + 2, h: LANE.slotH + 6 } },
    { id: 'calc', kind: 'text', rect: { x: 18, y: CALC_Y, w: calcW, h: 28 }, text: '' },
    { id: 'tally', kind: 'token', rect: { x: tallyX, y: CALC_Y, w: 84, h: 28 }, tone: 'chosen', text: '소수 0개' },
  );
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const set = (id: string, patch: ItemPatch, pop = false): Action => ({ type: 'set', id, patch, ...(pop ? { pop } : {}) });
const tone = (id: string, t: Tone, pop = false) => set(id, { tone: t }, pop);
const calcTo = (text: string) => set('calc', { text });
const tallyTo = (count: number, t: Tone = 'chosen') => set('tally', { text: `소수 ${count}개`, tone: t }, true);
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const ringTo = (rec: StepRecorder, path: number[]): Action => {
  const rect = around(nodeRect(path), 5);
  return rec.has('ring') ? set('ring', { rect }) : { type: 'add', item: { id: 'ring', kind: 'ring', rect } };
};
// 길(path)에 든 종이는 쓴 종이(초록), 방금 고른 종이는 노랑. 달라진 것만 동작으로 만든다
const papersTo = (rec: StepRecorder, path: number[], newest = -1): Action[] =>
  [...NUMBERS].flatMap((_, i) => {
    const t: Tone = i === newest ? 'current' : path.includes(i) ? 'visited' : 'plain';
    return rec.get(`paper:${i}`).tone === t ? [] : [tone(`paper:${i}`, t)];
  });

/* ------------------------------------------------------------------ */
/* 정석 · 함정: 이어 붙이기 → (모음에 넣기 | 소수 판정) → 되돌리기          */
/* ------------------------------------------------------------------ */

const joinCaption = (path: number[]) => {
  const parent = path.slice(0, -1);
  const from = parent.length ? q(textOf(parent)) : '빈 숫자';
  return `${from}에 ${path.at(-1)! + 1}번 종이 ${josa(q(NUMBERS[path.at(-1)!]), '을', '를')} 붙여 ${josa(q(textOf(path)), '을', '를')} 만듭니다.`;
};
// 잎에서 돌아갈 자리: 다음 마디의 부모. 다음 마디가 없으면 맨 처음
const returnTo = (k: number): number[] => NODES[k + 1]?.path.slice(0, -1) ?? [];
const backCaption = (to: number[], last: boolean) =>
  last ? `종이를 다 썼고 더 고를 갈래도 남지 않았습니다. 만들 수 있는 수 ${NODES.length}개를 모두 만들었습니다.`
    : `종이를 다 써서 더 붙일 수 없습니다. ${to.length ? `${q(textOf(to))} 자리` : '맨 처음 자리'}로 돌아가 안 쓴 종이를 다시 고릅니다.`;
// 돌아가기: 쓰지 않게 된 종이를 비우고, 고리를 돌아갈 자리로 옮긴다(끝이면 고리를 거둔다)
const goBack = (rec: StepRecorder, to: number[], last: boolean) =>
  rec.do(...together([...papersTo(rec, to), last ? { type: 'remove', id: 'ring' } as Action : ringTo(rec, to)]));
const addNode = (rec: StepRecorder, path: number[], text: string): Action[] => {
  const parent = path.slice(0, -1);
  const [pr, cr] = [nodeRect(parent), nodeRect(path)];
  return together([
    { type: 'add', item: { id: key(path), kind: 'cell', rect: cr, tone: 'current', text }, from: key(parent) },
    { type: 'add', item: { id: `e:${path.join('')}`, kind: 'line', rect: FULL, tone: 'trail', points: branch(pr, cr) } },
    ringTo(rec, path),
  ]);
};

function permutations(trap: boolean): Visualization {
  const rec = new StepRecorder(board(trap ? '센 소수' : '모음', trap ? 214 : 290, trap ? 238 : 316));
  const lane = new Lane(rec, LANE);
  const members: number[] = []; // 모음에 든 수(넣은 차례)
  const tokenOf = new Map<number, string>();
  let frame: number[] = []; // 지금 build()가 맡은 자리
  let building = true; // 순열을 만드는 중(변수에 current, rest를 보인다)
  let hits = 0; // 함정이 소수로 센 횟수
  let count = 0; // 정석이 찾은 소수 수
  let tries = 0; // 나눠 본 횟수
  let x: number | undefined;
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = (): Meta => ({
    work: tries,
    variables: trap
      ? { current: q(textOf(frame)), rest: q(restOf(frame)), count: hits }
      : building
        ? { current: q(textOf(frame)), rest: q(restOf(frame)), found: `{${members.join(', ')}}` }
        : { found: `{${members.join(', ')}}`, x: x ?? '-', '소수 개수': count },
  });

  rec.step({ title: '빈 숫자에서 시작', codeHighlights: trap ? TRAP_AT.start : BEST_AT.start, ...meta() });
  rec.phase('시작', trap
    ? `종이 조각 ${ro([...NUMBERS].map(q).join(', '))} 만들 수 있는 수를 모두 만들어 소수를 셉니다. 먼저 빈 숫자에서 시작합니다.`
    : `종이 조각 ${ro([...NUMBERS].map(q).join(', '))} 만들 수 있는 수를 모두 만들어 봅니다. 먼저 빈 숫자에서 시작하고, 만든 수는 모음(집합)에 담습니다.`);
  rec.do(ringTo(rec, []), wait(500));

  NODES.forEach(({ path, text, value }, k) => {
    const id = key(path);
    const leaf = path.length === N;
    const last = k === NODES.length - 1;
    const back = leaf ? returnTo(k) : undefined;
    const isNew = !members.includes(value);
    const r = probe(value);
    if (!trap && isNew) members.push(value);
    if (trap) {
      tries += r.tries;
      if (r.prime) hits++;
    }
    frame = back ?? path;
    const converted = text === String(value) ? `${josa(q(text), '은', '는')} 정수 ${value}입니다.` : `${josa(q(text), '은', '는')} 정수로 바꾸면 ${value}입니다.`;

    rec.step({
      title: trap ? `${q(text)} → ${value}: ${r.prime ? '소수, 센다' : '소수 아님'}` : `${q(text)} → ${value} (${isNew ? '새 수' : '이미 있음'})`,
      codeHighlights: trap ? TRAP_AT.test[kindOf(value)] : BEST_AT.add,
      ...meta(),
    });
    rec.phase('이어 붙이기', joinCaption(path), (trap ? TRAP_AT : BEST_AT).pick);
    rec.do(...papersTo(rec, path, path.at(-1)));
    rec.do(...addNode(rec, path, text));

    if (!trap) {
      rec.phase('모음에 넣기', `${converted} ${isNew ? '모음에 없는 수라 넣습니다.' : '모음에 이미 있어 넣지 않습니다.'}`, BEST_AT.add);
      if (isNew) {
        const token = `val:${value}`;
        tokenOf.set(value, token);
        lane.push({ id: token, text: String(value), tone: 'plain' }, id);
        rec.do(...together([tone(id, 'visited'), ...papersTo(rec, path)], true));
      } else {
        rec.do(...together([{ type: 'focus', ids: [id] }, tone(id, 'visited')]));
        rec.do({ type: 'arrow', from: id, to: tokenOf.get(value)!, verdict: 'seen', label: '이미 있음' }, wait(200));
        rec.do(...clear(), ...papersTo(rec, path).map((a): Action => ({ ...a, together: true })));
      }
    } else {
      const why = r.prime ? `${josa(value, '은', '는')} 2부터 ${r.root}까지 나눠 봐도 나누어떨어지지 않아 소수입니다.`
        : value < 2 ? `${josa(value, '은', '는')} 2보다 작아 소수가 아닙니다.`
          : `${josa(value, '은', '는')} ${ro(r.divisor)} 나누어떨어져 소수가 아닙니다.`;
      rec.phase('소수 판정', r.prime ? `${why} 센 적이 있는 수인지는 따지지 않고 그냥 셉니다(소수 ${hits}개).` : why, TRAP_AT.test[kindOf(value)]);
      const formula = r.prime ? `${value} ÷ 2~${r.root}: 나누어떨어짐 없음` : value < 2 ? `${value} < 2` : `${value} ÷ ${r.divisor} = ${value / r.divisor}`;
      rec.do(...together([{ type: 'focus', ids: [id] }, calcTo(formula)]));
      if (r.prime) {
        lane.push({ id: `hit:${hits}`, text: String(value), tone: 'path' }, id);
        rec.do(...together([tone(id, 'path', true), tallyTo(hits), ...papersTo(rec, path)], true));
      } else {
        rec.do(...together([tone(id, 'explored'), ...papersTo(rec, path)]));
      }
      rec.do({ type: 'unfocus' });
    }

    if (back) {
      rec.phase('되돌리기', backCaption(back, last), (trap ? TRAP_AT : BEST_AT).back);
      goBack(rec, back, last);
    }
  });

  if (trap) {
    rec.step({ title: `${hits}개로 셈 — 정답은 2개`, codeHighlights: TRAP_AT.done, ...meta(), answer: hits, isKeyframe: true });
    rec.phase('비교', `같은 수 11을 4번, 101을 2번 세어 ${hits}개가 되었습니다. 서로 다른 소수는 11과 101 두 개뿐이라 정답은 2입니다. 만든 수를 집합에 담아 중복을 없애야 합니다.`);
    rec.do(...together([tallyTo(hits, 'bad'), calcTo('서로 다른 소수: 11, 101')]));
    rec.do({ type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 330, y: CALC_Y, w: 72, h: 28 }, tone: 'good', text: '정답 2개' } });
    return holdCaptions(rec.finish());
  }

  // 모음의 수를 넣은 차례대로 소수인지 본다. 0과 1은 2보다 작아 나눠 볼 것도 없으니 한 단계로 묶는다.
  building = false;
  const groups: number[][] = [];
  for (const v of members) {
    if (v < 2 && (groups.at(-1)?.[0] ?? 2) < 2) groups.at(-1)!.push(v);
    else groups.push([v]);
  }
  for (const group of groups) {
    const [v] = group;
    const r = probe(v);
    const ids = group.map((g) => tokenOf.get(g)!);
    const kind = kindOf(v);
    x = v;
    tries += r.tries;
    if (r.prime) count++;
    const formula = v < 2 ? `${group.join(', ')} < 2` : r.prime ? `${v} ÷ 2~${r.root}: 나누어떨어짐 없음` : `${v} ÷ ${r.divisor} = ${v / r.divisor}`;
    const look = v < 2 ? `${group.length > 1 ? `${both(group[0], group[1])}은` : josa(v, '은', '는')} 2보다 작아 나눠 볼 것도 없이 소수가 아닙니다.`
      : r.prime ? `${josa(v, '을', '를')} 2부터 ${r.root}까지 ${r.tries}번 나눠 봅니다. 나머지가 모두 0이 아니라 나누어떨어지는 수가 없습니다.`
        : `${josa(v, '을', '를')} ${ro(r.divisor)} 나누면 ${v / r.divisor}, 나머지 0입니다. 나누어떨어집니다.`;
    rec.step({ title: group.length > 1 ? `${group.join(', ')} → 소수 아님` : `${v} → ${r.prime ? `소수 (나눗셈 ${r.tries}번)` : '소수 아님'}`, codeHighlights: BEST_AT.test[kind], ...meta() });
    rec.phase('나눠 보기', look, BEST_AT.test[kind]);
    rec.do(...together([...ids.map((id) => tone(id, 'current')), { type: 'focus', ids: [] }, calcTo(formula)]));
    rec.phase('판정하기', r.prime ? `${josa(v, '은', '는')} 소수입니다. 지금까지 소수 ${count}개.` : `${group.length > 1 ? '둘 다' : josa(v, '은', '는')} 소수가 아닙니다. 지금까지 소수 ${count}개.`, BEST_AT.test[kind]);
    rec.do(...together([...ids.map((id) => tone(id, r.prime ? 'path' : 'explored', true)), tallyTo(count)]), { type: 'unfocus' });
  }

  x = undefined;
  const primes = members.filter((v) => probe(v).prime);
  rec.step({ title: `소수 ${count}개`, codeHighlights: BEST_AT.done, ...meta(), answer: count, isKeyframe: true });
  rec.phase('세기', `모음 ${members.length}개 중 소수는 ${primes.length === 2 ? both(primes[0], primes[1]) : primes.join(', ')}, 모두 ${count}개입니다. 서로 다른 수만 판정해 나눗셈은 ${tries}번이면 됩니다.`);
  rec.do(...together([tallyTo(count, 'path'), calcTo(`소수 ${primes.join(', ')}`)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 체: 표 만들기 → (수 모으기) → 표 조회                              */
/* ------------------------------------------------------------------ */

// 0~LIMIT 소수표. 12칸이 한 줄이고, 3자리 숫자가 들어가도록 토큰(14px 글자)으로 그린다.
// 세로: 표 16~303(위 16px은 첫 줄 위에 붙는 판정 표시 자리), 모음 줄 322~356, 계산 글 370~398.
const LIMIT = Number([...NUMBERS].sort().reverse().join('')); // 110
const SW = 432;
const SH = 406;
const gid = (v: number) => `s:${v}`;
const gridRect = (v: number): Rect => ({ x: 8 + (v % 12) * 35, y: 16 + Math.floor(v / 12) * 29, w: 32, h: 26 });
const LANE_Y = 322;
const SLOT = slots({ x: 66, y: LANE_Y, w: 48, h: 34, gap: 6 });

function sieveBoard(): Scene {
  return {
    width: SW,
    height: SH,
    items: [
      { id: 'lane:label', kind: 'text', rect: { x: 8, y: LANE_Y, w: 54, h: 34 }, text: '모음' },
      { id: 'lane:bg', kind: 'zone', rect: { x: 62, y: LANE_Y - 3, w: 6 * 54 + 2, h: 40 } },
      { id: 'calc', kind: 'text', rect: { x: 8, y: 370, w: 310, h: 28 }, text: '' },
      { id: 'tally', kind: 'token', rect: { x: 340, y: 370, w: 84, h: 28 }, tone: 'chosen', text: '소수 0개' },
    ],
  };
}

function sieveTable(): Visualization {
  const rec = new StepRecorder(sieveBoard());
  const crossed = new Set<number>([0, 1]);
  const settled = new Set<number>([0, 1]); // 이미 칠을 마친 칸(0, 1과 확정된 소수 p)
  const members: number[] = [];
  let erased = 0; // 지운 횟수(이미 지운 칸을 또 지우는 것도 센다)
  let p = 0;
  let count = 0;
  let x: number | undefined;
  const meta = () => ({
    work: erased,
    variables: { limit: LIMIT, p: p || '-', found: members.length ? `{${members.join(', ')}}` : '-', x: x ?? '-', '지운 횟수': erased },
  });
  const gridToken = (v: number, t: Tone): Item => ({ id: gid(v), kind: 'token', rect: gridRect(v), tone: t, text: String(v) });

  rec.step({ title: `0~${LIMIT} 소수표 만들기`, codeHighlights: SIEVE_AT.table, ...meta() });
  rec.phase('표 만들기', `종이를 큰 숫자부터 이어 붙이면 만들 수 있는 가장 큰 수 ${LIMIT}이 됩니다. 0부터 ${LIMIT}까지 소수 후보로 두고, 0과 1은 소수가 아니라 바로 지웁니다.`, SIEVE_AT.table);
  rec.do(...together(Array.from({ length: LIMIT + 1 }, (_, v): Action => ({ type: 'add', item: gridToken(v, v < 2 ? 'explored' : 'plain') }))));

  // 체: p가 2 .. √LIMIT. 지워지지 않은 p만 그 배수를 지운다(지워진 p는 건너뛴다)
  const skipped: number[] = [];
  const rootLimit = Math.floor(Math.sqrt(LIMIT));
  for (let c = 2; c <= rootLimit; c++) {
    if (crossed.has(c)) {
      skipped.push(c);
      continue;
    }
    const multiples: number[] = [];
    for (let m = c * c; m <= LIMIT; m += c) multiples.push(m);
    const again = multiples.filter((m) => crossed.has(m)).length;
    multiples.forEach((m) => crossed.add(m));
    p = c;
    erased += multiples.length;
    rec.step({ title: `p = ${c}: ${c}의 배수 ${multiples.length}번 지우기`, codeHighlights: SIEVE_AT.round, ...meta() });
    rec.phase('표 만들기',
      `${skipped.length ? `${many(skipped, '은', '는')} 이미 지워져 건너뜁니다. ` : ''}${josa(c, '은', '는')} 지워지지 않았으니 소수입니다. ${c} × ${c} = ${c * c}부터 ${multiples.slice(0, 3).join(', ')}, … 를 ${multiples.length}번 지웁니다.${again ? ` 이 중 ${again}칸은 이미 지워져 있습니다.` : ''}`,
      SIEVE_AT.round);
    skipped.length = 0;
    rec.do(tone(gid(c), 'current'));
    rec.do(...together(multiples.map((m) => tone(gid(m), 'explored'))));
    rec.do(tone(gid(c), 'visited'));
    settled.add(c);
  }

  // 표 완성: 남은 칸은 모두 소수
  const primes = Array.from({ length: LIMIT + 1 }, (_, v) => v).filter((v) => !crossed.has(v));
  rec.step({ title: `표 완성: ${LIMIT} 이하 소수 ${primes.length}개`, codeHighlights: SIEVE_AT.finish, ...meta() });
  rec.phase('표 만들기',
    `${skipped.length ? `${skipped.join(', ')}도 이미 지워진 수라 건너뜁니다. ` : ''}${rootLimit + 1} × ${rootLimit + 1} = ${josa((rootLimit + 1) ** 2, '이', '가')} ${LIMIT}보다 커서 더 지울 것이 없습니다. 남은 ${primes.length}개가 ${LIMIT} 이하의 소수입니다.`,
    SIEVE_AT.finish);
  rec.do(...together(primes.filter((v) => !settled.has(v)).map((v) => tone(gid(v), 'visited'))));
  rec.do(calcTo(`${LIMIT} 이하 소수 ${primes.length}개`));

  // 순열로 만든 수를 중복 없이 모은다(정석과 같은 build). 한 단계로 묶는다
  for (const { value } of NODES) if (!members.includes(value)) members.push(value);
  p = 0;
  rec.step({ title: `순열로 만든 수 ${NODES.length}개 → 서로 다른 수 ${members.length}개`, codeHighlights: SIEVE_AT.collect, ...meta() });
  rec.phase('수 모으기', `정석과 똑같이 종이를 이어 붙여 만든 수 ${NODES.length}개를 집합에 담습니다. 앞의 0이 떨어지고 같은 수가 합쳐져 ${members.join(', ')} 여섯 개가 남습니다.`, SIEVE_AT.collect);
  rec.do(...together(members.map((v, i): Action => ({ type: 'add', item: { id: `val:${v}`, kind: 'token', rect: SLOT(i), tone: 'plain', text: String(v) } }))));

  for (const v of members) {
    const r = probe(v);
    x = v;
    if (r.prime) count++;
    rec.step({ title: `표[${v}] → ${r.prime ? '소수' : '소수 아님'}`, codeHighlights: SIEVE_AT.look, ...meta() });
    rec.phase('표 조회', `소수표에서 ${v}번 칸을 찾아봅니다. ${v}번 칸은 ${r.prime ? '지워지지 않고 남아 있어 소수입니다.' : '지워져 있어 소수가 아닙니다.'}`, SIEVE_AT.look);
    rec.do(tone(`val:${v}`, 'current'));
    rec.do({ type: 'arrow', from: `val:${v}`, to: gid(v), verdict: r.prime ? 'good' : 'bad', label: r.prime ? '소수' : '지워짐' }, wait(300));
    rec.do(...together([tone(`val:${v}`, r.prime ? 'path' : 'explored', true), tallyTo(count), { type: 'clearMarks' }]));
  }

  x = undefined;
  const found = members.filter((v) => probe(v).prime);
  rec.step({ title: `소수 ${count}개`, codeHighlights: SIEVE_AT.done, ...meta(), answer: count, isKeyframe: true });
  rec.phase('세기', `모음 ${members.length}개 중 소수는 ${found.length === 2 ? both(found[0], found[1]) : found.join(', ')}, 모두 ${count}개입니다. 정답은 정석과 같지만 표를 만드느라 ${erased}번을 지웠습니다.`);
  rec.do(...together([tallyTo(count, 'path'), calcTo(`소수 ${found.join(', ')}`)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'prime-finder',
  title: '소수 찾기',
  level: 2,
  category: 'brute-force',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42839',
  description: {
    summary:
      '한 자리 숫자가 하나씩 적힌 종이 조각들이 있습니다. 조각을 이어 붙여 만들 수 있는 수 가운데 소수가 몇 개인지 구합니다. 앞에 0이 붙은 수는 0을 뗀 수와 같은 수로 보고, 같은 수는 한 번만 셉니다.',
    rules: [
      'numbers는 길이 1 이상 7 이하의 문자열',
      'numbers는 0부터 9까지의 숫자로만 이루어짐',
      '"013"은 0, 1, 3이 적힌 종이 조각이 흩어져 있다는 뜻',
      '11과 011은 같은 숫자로 취급',
    ],
    examples: [
      { input: 'numbers = "17"', output: '3' },
      { input: 'numbers = "011"', output: '2' },
    ],
  },
  keyIntuitions: [
    '종이가 최대 7장이라 만들 수 있는 수는 모두 합쳐 13,699개(7 + 42 + 210 + 840 + 2,520 + 5,040 + 5,040)뿐입니다. 전부 만들어 보는 완전탐색이 가능합니다.',
    '"011"과 "11"처럼 앞의 0이 붙어도, 같은 숫자 종이를 바꿔 붙여도 같은 수가 나옵니다. 정수로 바꿔 집합에 담으면 한 번씩만 판정합니다.',
    '소수 판정은 2부터 √n까지만 나눠 보면 됩니다. n이 합성수라면 √n 이하의 약수가 반드시 하나는 있기 때문입니다.',
  ],
  demo: { input: [NUMBERS], label: 'numbers = "011"' },
  workUnit: '나누거나 지운 횟수',
  approaches: [
    {
      id: 'prime-permutation',
      name: '순열로 수를 모두 만들고 소수 판정',
      rank: 'BEST',
      timeComplexity: 'O(P × √M)',
      spaceComplexity: 'O(P)',
      verdict: '종이로 만들 수 있는 수를 빠짐없이 만든 뒤, 집합으로 중복을 없애고 제곱근까지만 나눠 소수를 가립니다.',
      pros: [
        '종이가 7장이어도 만드는 수가 1만 4천 개 이하(P)라 모두 만들어 봐도 충분합니다.',
        '정수로 바꿔 집합에 담아 같은 수를 한 번만 판정합니다.',
        '제곱근까지만 나누므로 수 하나를 판정하는 데 최대 3,000번 남짓이면 끝납니다.',
      ],
      cons: [
        '순열 만들기와 소수 판정을 따로 짜야 해서 코드가 두 덩어리입니다.',
        '앞에 0이 붙은 수("011" → 11)처럼 같은 수가 여러 번 만들어지는 점을 챙겨야 합니다.',
      ],
      whyThisRank: '입력이 7자리 이하라 완전탐색이 가능합니다. 집합과 제곱근 판정, 이 두 가지만 챙기면 가장 단순하고 확실한 풀이입니다.',
      code: BEST,
      visualize: () => permutations(false),
    },
    {
      id: 'prime-sieve',
      name: '체로 소수표를 먼저 만들고 조회',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(M log log M + P)',
      spaceComplexity: 'O(M)',
      verdict: '만들 수 있는 가장 큰 수까지 소수표를 미리 만들어 두고, 만든 수마다 표를 조회합니다.',
      pros: [
        '소수 판정이 표 조회 한 번(O(1))이라 판정할 수가 많아도 빠릅니다.',
        '소수표를 한 번 만들면 다른 수에도 그대로 다시 쓸 수 있습니다.',
      ],
      cons: [
        '7자리면 천만 칸이 넘는 표를 만들어야 해서 메모리를 많이 씁니다.',
        '만든 수가 몇 개 안 될 때에도 표 전체를 채우는 비용이 먼저 듭니다.',
      ],
      whyThisRank:
        '판정할 수는 많아야 1만 4천 개인데 표는 천만 칸입니다. 판정을 몇 번 하지 않는 이 문제에서는 정석의 제곱근 판정이 더 가볍습니다.',
      code: SIEVE,
      visualize: sieveTable,
    },
    {
      id: 'prime-duplicates',
      name: '중복을 거르지 않고 소수를 센다',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(P × √M)',
      spaceComplexity: 'O(N) 재귀 스택',
      verdict: '같은 수가 여러 번 만들어지는데 그대로 세어서 답이 부풀려지는 오답 풀이입니다.',
      pros: ['정석과 코드 모양이 거의 같고, 집합이 없어 조금 더 짧습니다.'],
      cons: [
        '"011"에서는 11이 네 번, 101이 두 번 만들어져 6개로 세어 정답 2와 다릅니다.',
        '같은 수를 매번 다시 판정하느라 나눗셈도 더 합니다.',
        '예제 "17"처럼 숫자가 모두 달라 중복이 없는 입력은 통과해서 실수를 알아채기 어렵습니다.',
      ],
      whyThisRank:
        '종이가 다르면 순열은 다른 경우지만, 만든 수가 같으면 한 번만 세어야 합니다. 정수로 바꾼 값을 집합에 담아 중복을 없애면 정석이 됩니다.',
      code: TRAP,
      visualize: () => permutations(true),
    },
  ],
  checks: {
    cases: [
      { args: ['17'], expected: 3 },
      { args: ['011'], expected: 2 },
      { args: ['1'], expected: 0 },
      { args: ['7'], expected: 1 },
      { args: ['000'], expected: 0 },
      { args: ['2'], expected: 1 },
      { args: ['013'], expected: 4 },
      { args: ['1231'], expected: 18 },
    ],
    // 길이 1~5, 숫자 0~9(같은 숫자가 자주 나오도록 0~4로 좁힌 입력도 섞는다)
    random: (rand) => {
      const length = 1 + Math.floor(rand() * 5);
      const top = rand() < 0.5 ? 5 : 10;
      return [Array.from({ length }, () => String(Math.floor(rand() * top))).join('')];
    },
  },
};

export default problem;
