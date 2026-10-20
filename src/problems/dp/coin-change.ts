// 거스름돈: 정석 동전을 바깥에서 도는 한 줄 표, 대안 동전마다 한 줄씩 쓰는 2차원 표, 함정 금액을 바깥에서 돌아 순서까지 세는 한 줄 표를 움직인다.
// 정석·함정은 0원~5원 칸 줄과 동전 표시, 대안은 '동전 없음 + 동전 3개' × 0원~5원 격자이다. 아래쪽은 계산 글 줄이다.
import type { Action, Item, ItemPatch, Language, Problem, Rect, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

const MOD = 1_000_000_007;
// 시각화 입력: 원문 예제 그대로. 정석은 4가지, 순서까지 세는 함정은 9가지
const N = 5;
const COINS = [1, 2, 5];
const COIN_TEXT = COINS.join(', ');

// 정석(동전이 바깥)과 함정(금액이 바깥)이 칸을 고치는 차례
interface Update { coin: number; x: number; before: number; add: number; after: number; firstOfGroup: boolean }
function updates(coinOuter: boolean): { list: Update[]; dp: number[] } {
  const dp = Array<number>(N + 1).fill(0);
  dp[0] = 1;
  const list: Update[] = [];
  const apply = (coin: number, x: number, firstOfGroup: boolean) => {
    const before = dp[x];
    dp[x] = (dp[x] + dp[x - coin]) % MOD;
    list.push({ coin, x, before, add: dp[x - coin], after: dp[x], firstOfGroup });
  };
  if (coinOuter) for (const coin of COINS) for (let x = coin; x <= N; x++) apply(coin, x, x === coin);
  else for (let x = 1; x <= N; x++) for (const coin of COINS) if (x >= coin) apply(coin, x, coin === COINS.find((c) => c <= x));
  return { list, dp };
}
const BEST_RUN = updates(true);
const TRAP_RUN = updates(false);
const ANSWER = BEST_RUN.dp[N];

// 함정이 같은 동전 묶음을 여러 번 센 대표 예: 순서만 다른 방법이 가장 많은 묶음(동전 개수 벡터)
const fact = (k: number): number => (k <= 1 ? 1 : k * fact(k - 1));
function worstBundle(): { text: string; orders: number } {
  let best = { text: '', orders: 0 };
  const walk = (index: number, left: number, counts: number[]) => {
    if (index === COINS.length) {
      if (left) return;
      const total = counts.reduce((a, b) => a + b, 0);
      const orders = counts.reduce((p, c) => p / fact(c), fact(total));
      if (orders > best.orders) best = { text: counts.flatMap((c, i) => Array<number>(c).fill(COINS[i])).join(' + '), orders };
      return;
    }
    for (let c = 0; c * COINS[index] <= left; c++) walk(index + 1, left - c * COINS[index], [...counts, c]);
  };
  walk(0, N, []);
  return best;
}
const WORST = worstBundle();

// 점검용: 큰 입력(나머지가 실제로 쓰이는 경우)의 기대값을 정석과 같은 식으로 구한다
const countWays = (n: number, money: number[]): number => {
  const dp = Array<number>(n + 1).fill(0);
  dp[0] = 1;
  for (const coin of money) for (let x = coin; x <= n; x++) dp[x] = (dp[x] + dp[x - coin]) % MOD;
  return dp[n];
};
const BIG: [number, number[]] = [100000, [1, 2, 5, 10, 20, 50, 100, 200, 500]];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const LINE = {
  python: `def solution(n, money):
    MOD = 1_000_000_007
    dp = [0] * (n + 1)  # dp[x] = x원을 만드는 방법의 수
    dp[0] = 1  # 0원은 아무것도 내지 않는 1가지

    for coin in money:  # 동전을 바깥에서 하나씩 돌아야 같은 조합을 한 번만 셉니다
        for x in range(coin, n + 1):
            dp[x] = (dp[x] + dp[x - coin]) % MOD  # coin 하나를 더 쓰는 경우를 더합니다

    return dp[n]`,
  javascript: `function solution(n, money) {
  const MOD = 1_000_000_007;
  const dp = Array(n + 1).fill(0); // dp[x] = x원을 만드는 방법의 수
  dp[0] = 1; // 0원은 아무것도 내지 않는 1가지

  for (const coin of money) { // 동전을 바깥에서 하나씩 돌아야 같은 조합을 한 번만 셉니다
    for (let x = coin; x <= n; x++) {
      dp[x] = (dp[x] + dp[x - coin]) % MOD; // coin 하나를 더 쓰는 경우를 더합니다
    }
  }

  return dp[n];
}`,
};
const LINE_AT = {
  start: lines(LINE, ['dp = [0] * (n + 1)', 'dp[0] = 1'], ['const dp = Array(n + 1)', 'dp[0] = 1']),
  coin: lines(LINE, ['for coin in money'], ['for (const coin of money)']),
  look: lines(LINE, ['for coin in money', 'for x in range(coin', 'dp[x] = (dp[x] + dp[x - coin])'], ['for (const coin of money)', 'for (let x = coin', 'dp[x] = (dp[x] + dp[x - coin])']),
  add: lines(LINE, ['dp[x] = (dp[x] + dp[x - coin])'], ['dp[x] = (dp[x] + dp[x - coin])']),
  done: lines(LINE, ['return dp[n]'], ['return dp[n]']),
};

const TABLE = {
  python: `def solution(n, money):
    MOD = 1_000_000_007
    k = len(money)
    dp = [[0] * (n + 1) for _ in range(k + 1)]  # dp[i][x] = 앞의 i가지 동전으로 x원을 만드는 방법의 수
    for i in range(k + 1):
        dp[i][0] = 1  # 0원은 아무것도 내지 않는 1가지

    for i in range(1, k + 1):
        coin = money[i - 1]
        for x in range(1, n + 1):
            dp[i][x] = dp[i - 1][x]  # 이 동전을 안 쓰는 경우
            if x >= coin:
                dp[i][x] = (dp[i][x] + dp[i][x - coin]) % MOD  # 이 동전을 하나 더 쓰는 경우

    return dp[k][n]`,
  javascript: `function solution(n, money) {
  const MOD = 1_000_000_007;
  const k = money.length;
  const dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(0)); // dp[i][x] = 앞의 i가지 동전으로 x원을 만드는 방법의 수
  for (let i = 0; i <= k; i++) dp[i][0] = 1; // 0원은 아무것도 내지 않는 1가지

  for (let i = 1; i <= k; i++) {
    const coin = money[i - 1];
    for (let x = 1; x <= n; x++) {
      dp[i][x] = dp[i - 1][x]; // 이 동전을 안 쓰는 경우
      if (x >= coin) {
        dp[i][x] = (dp[i][x] + dp[i][x - coin]) % MOD; // 이 동전을 하나 더 쓰는 경우
      }
    }
  }

  return dp[k][n];
}`,
};
const TABLE_AT = {
  start: lines(TABLE, ['k = len(money)', 'dp = [[0]', 'dp[i][0] = 1'], ['const k = money.length', 'const dp = Array.from', 'dp[i][0] = 1']),
  small: lines(TABLE, ['for i in range(1, k + 1)', 'coin = money[i - 1]', 'for x in range(1, n + 1)', 'dp[i][x] = dp[i - 1][x]', 'if x >= coin'], ['for (let i = 1', 'const coin = money[i - 1]', 'for (let x = 1', 'dp[i][x] = dp[i - 1][x]', 'if (x >= coin)']),
  big: lines(TABLE, ['for i in range(1, k + 1)', 'coin = money[i - 1]', 'for x in range(1, n + 1)', 'dp[i][x] = dp[i - 1][x]', 'if x >= coin', 'dp[i][x] = (dp[i][x] + dp[i][x - coin])'], ['for (let i = 1', 'const coin = money[i - 1]', 'for (let x = 1', 'dp[i][x] = dp[i - 1][x]', 'if (x >= coin)', 'dp[i][x] = (dp[i][x] + dp[i][x - coin])']),
  addSmall: lines(TABLE, ['dp[i][x] = dp[i - 1][x]'], ['dp[i][x] = dp[i - 1][x]']),
  addBig: lines(TABLE, ['dp[i][x] = dp[i - 1][x]', 'dp[i][x] = (dp[i][x] + dp[i][x - coin])'], ['dp[i][x] = dp[i - 1][x]', 'dp[i][x] = (dp[i][x] + dp[i][x - coin])']),
  done: lines(TABLE, ['return dp[k][n]'], ['return dp[k][n]']),
};

const SWAPPED = {
  python: `# 주의: 금액을 바깥에서 돌면 같은 조합을 순서만 바꿔 여러 번 셉니다
def solution(n, money):
    MOD = 1_000_000_007
    dp = [0] * (n + 1)
    dp[0] = 1

    for x in range(1, n + 1):
        for coin in money:  # 동전이 안쪽이면 (1, 2)와 (2, 1)을 다른 방법으로 셉니다
            if x >= coin:
                dp[x] = (dp[x] + dp[x - coin]) % MOD

    return dp[n]`,
  javascript: `// 주의: 금액을 바깥에서 돌면 같은 조합을 순서만 바꿔 여러 번 셉니다
function solution(n, money) {
  const MOD = 1_000_000_007;
  const dp = Array(n + 1).fill(0);
  dp[0] = 1;

  for (let x = 1; x <= n; x++) {
    for (const coin of money) { // 동전이 안쪽이면 (1, 2)와 (2, 1)을 다른 방법으로 셉니다
      if (x >= coin) {
        dp[x] = (dp[x] + dp[x - coin]) % MOD;
      }
    }
  }

  return dp[n];
}`,
};
const SWAP_AT = {
  start: lines(SWAPPED, ['dp = [0] * (n + 1)', 'dp[0] = 1'], ['const dp = Array(n + 1)', 'dp[0] = 1']),
  amount: lines(SWAPPED, ['for x in range(1, n + 1)'], ['for (let x = 1']),
  look: lines(SWAPPED, ['for x in range(1', 'for coin in money', 'if x >= coin', 'dp[x] = (dp[x] + dp[x - coin])'], ['for (let x = 1', 'for (const coin of money)', 'if (x >= coin)', 'dp[x] = (dp[x] + dp[x - coin])']),
  add: lines(SWAPPED, ['dp[x] = (dp[x] + dp[x - coin])'], ['dp[x] = (dp[x] + dp[x - coin])']),
  done: lines(SWAPPED, ['return dp[n]'], ['return dp[n]']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'clearMarks' }, { type: 'unfocus' }]);
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });

// 자막이 글자당 20ms 이상 보이도록(마디가 끝난 뒤 다음 자막이 뜰 때까지 포함), 한 단계가 2초 이상 가도록 마디 끝에 기다림을 더한다
const MS_PER_CHAR = 20;
const MIN_STEP = 2000;
const busy = (p: { start: number; actions: { start: number; duration: number }[] }) =>
  Math.max(0, ...p.actions.map((a) => a.start + a.duration - p.start));
const paced = (viz: Visualization): Visualization => {
  for (const step of viz.steps) {
    const { phases } = planStep(step);
    phases.forEach((p, i) => {
      const tail = i < phases.length - 1 ? PHASE_GAP : step.isKeyframe ? KEYFRAME_TAIL : STEP_TAIL;
      const want = [...step.phases[i].caption].length * MS_PER_CHAR - tail;
      if (p.end - p.start < want) step.phases[i].actions.push(wait(Math.ceil(want - busy(p))));
    });
    const plan = planStep(step);
    const last = plan.phases.at(-1)!;
    const short = MIN_STEP - plan.total;
    if (short > 0) step.phases.at(-1)!.actions.push(wait(last.end - last.start + short - busy(last)));
  }
  return viz;
};

/* ------------------------------------------------------------------ */
/* 정석·함정 한 줄 표: (동전 고르기 | 금액 고르기) → 값 가져오기 → 더하기       */
/* ------------------------------------------------------------------ */

// 칸 0원~5원은 y 44부터(위 44px: 동전 표시 28px + 칸 위 판정 표시 11px), 이름표 그 아래, 계산 글 맨 아래. 함정은 그 아래에 내 답·정답 표시를 더 둔다.
const PITCH = 62;
const ROW_W = (N + 1) * PITCH - 8;
const ROW_Y = 44;
const ROW_CALC_Y = ROW_Y + 54 + 4 + 16 + 8;
const ROW_H = ROW_CALC_Y + 28;
const rowCell = (x: number) => `cell:${x}`;
const rowRect = (x: number): Rect => ({ x: x * PITCH, y: ROW_Y, w: 54, h: 54 });

type Lines = Record<Language, number[]>;
interface RowPlan {
  run: ReturnType<typeof updates>;
  trap: boolean;
  at: { start: Lines; group: Lines; look: Lines; add: Lines; done: Lines };
}
function oneRow(plan: RowPlan): Visualization {
  const { run, trap, at } = plan;
  const items: Item[] = [{ id: 'coin', kind: 'token', rect: { x: 0, y: 0, w: 130, h: 28 }, tone: 'chosen', text: '동전 -' }];
  for (let x = 0; x <= N; x++) {
    items.push({ id: rowCell(x), kind: 'cell', rect: rowRect(x), tone: x ? 'plain' : 'visited', text: x ? '0' : '1' });
    items.push({ id: `label:${x}`, kind: 'text', rect: { x: x * PITCH, y: ROW_Y + 58, w: 54, h: 16 }, tone: 'muted', text: `${x}원` });
  }
  items.push({ id: 'calc', kind: 'text', rect: { x: 0, y: ROW_CALC_Y, w: ROW_W, h: 28 }, text: '' });
  const rec = new StepRecorder({ width: ROW_W, height: ROW_H + (trap ? 40 : 0), items });
  const paint = (x: number, tone: Tone): Action => ({ type: 'set', id: rowCell(x), patch: { tone } });
  let lit: number | undefined; // 노란 칸(바로 전에 고친 칸)
  let done = 0;
  let now: Update | undefined;
  const meta = () => ({ work: done, variables: { coin: now?.coin ?? '-', x: now?.x ?? '-', 'dp[x - coin]': now?.add ?? '-', 'dp[x]': now?.after ?? '-' } });
  const settle = (): Action[] => (lit === undefined ? [] : [paint(lit, 'visited')]);

  rec.step({ title: '표 만들기: dp[0] = 1', codeHighlights: at.start, ...meta() });
  rec.phase('시작', `거스름돈 ${N}원을 동전 ${COIN_TEXT}원으로 만드는 방법의 수를 구합니다. dp[x]는 x원을 만드는 방법의 수입니다.`);
  rec.do(calcTo('dp[x] = x원을 만드는 방법의 수'));
  rec.phase('규칙', trap
    ? '0원은 아무것도 내지 않는 1가지입니다. 금액을 하나씩 정해 놓고, 모든 동전을 마지막에 내 보며 더합니다.'
    : '0원은 아무것도 내지 않는 1가지입니다. 동전을 하나씩 정해 놓고, 그 동전을 하나 더 쓰는 경우를 더해 갑니다.');
  rec.do(calcTo('dp[x] += dp[x − 동전]'));

  for (const u of run.list) {
    const settling = settle();
    now = u;
    lit = u.x;
    done++;
    const step = `dp[${u.x}] += dp[${u.x - u.coin}]`;
    rec.step({ title: `${step} → ${u.after}`, codeHighlights: at.add, ...meta() });
    if (u.firstOfGroup) {
      rec.phase(trap ? '금액 고르기' : '동전 고르기', trap
        ? `${u.x}원을 만드는 방법을 셉니다. 동전을 하나씩 마지막으로 내 봅니다.`
        : `${u.coin}원짜리 동전을 쓰는 경우를 더합니다. ${u.coin}원 이상인 칸을 왼쪽부터 차례로 고칩니다.`, at.group);
      rec.do(...together([...settling, { type: 'set', id: 'coin', patch: { text: `동전 ${u.coin}원` }, pop: true }, calcTo(trap ? `${u.x}원 만들기` : `${u.coin}원 동전 쓰기`)]));
    }
    rec.phase('값 가져오기', `${u.x}원에서 ${u.coin}원 동전 하나를 빼면 ${u.x - u.coin}원입니다. ${u.x - u.coin}원을 만드는 방법은 ${u.add}가지입니다.`, at.look);
    rec.do(...together([
      ...(u.firstOfGroup ? [] : [...settling, { type: 'set', id: 'coin', patch: { text: `동전 ${u.coin}원` }, pop: true } as Action]),
      { type: 'focus', ids: [rowCell(u.x), rowCell(u.x - u.coin)] },
      paint(u.x, 'current'),
      calcTo(`${step} = ${u.before} + ${u.add}`),
    ]));
    rec.do({ type: 'arrow', from: rowCell(u.x), to: rowCell(u.x - u.coin), verdict: 'good', label: `${u.add}가지` }, wait(300));
    rec.phase('더하기', `${u.before} + ${u.add} = ${u.after}. ${josa(`dp[${u.x}]`, '을', '를')} ${ro(u.after)} 고칩니다.`, at.add);
    rec.do(...together([{ type: 'set', id: rowCell(u.x), patch: { text: String(u.after) }, pop: true }, calcTo(`${step} = ${u.after}`)]), wait(300), ...clear());
  }

  const answer = run.dp[N];
  const settling = settle();
  now = run.list.at(-1);
  rec.step({ title: `답 dp[${N}] = ${answer}`, codeHighlights: at.done, ...meta(), answer, isKeyframe: true });
  if (!trap) {
    rec.phase('답', `${N}원을 만드는 방법은 dp[${N}] = ${answer}가지입니다. 동전을 바깥에서 돌아서 같은 동전 묶음을 한 번씩만 셌습니다.`);
    rec.do(...together([...settling, paint(N, 'path'), calcTo(`dp[${N}] = ${answer}가지`)]));
  } else {
    // 함정: 답을 오답 색으로 칠하고, 같은 묶음을 순서만 바꿔 여러 번 센 예와 정답을 보여 준다
    const resultY = ROW_H + 8;
    rec.phase('오답 확인', `dp[${N}] = ${answer}가지라고 답합니다. 하지만 정답은 ${ANSWER}가지입니다.`);
    rec.do(...together([...settling, paint(N, 'bad'), calcTo(`내 답 = dp[${N}] = ${answer}`)]));
    rec.do({ type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 0, y: resultY, w: 110, h: 28 }, tone: 'bad', text: `내 답 ${answer}` } });
    rec.phase('순서까지 센 이유', `${josa(WORST.text, '은', '는')} 동전 묶음이 하나인데 순서를 바꿔 ${WORST.orders}번 셌습니다. 같은 동전 묶음은 한 번만 세어야 합니다.`);
    rec.do(calcTo(`${WORST.text}: 순서만 바꿔 ${WORST.orders}번`));
    rec.do({ type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 122, y: resultY, w: 110, h: 28 }, tone: 'good', text: `정답 ${ANSWER}` } }, wait(300));
  }
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 2차원 표: 두 칸 보기 → 더하기 (칸마다)                              */
/* ------------------------------------------------------------------ */

type Cell = [number, number]; // [i, x]: i번째 동전(0은 동전 없음), x원
const G0 = 66; // 칸 사이는 66px(칸 54 + 12): 칸 위 판정 표시(11px)가 윗줄 칸과 겹치지 않는다
const GX = 66;
const GY = 30;
const gridRect = (i: number, x: number): Rect => ({ x: GX + x * G0, y: GY + i * G0, w: 54, h: 54 });
const G_W = GX + (N + 1) * G0 - 12 + 8;
const G_CALC_Y = GY + (COINS.length + 1) * G0 - 12 + 16;
const gridId = ([i, x]: Cell) => `cell:${i},${x}`;
const gridLabel = (i: number) => (i ? `${COINS[i - 1]}원` : '동전 없음');

function twoD(): Visualization {
  const dp = Array.from({ length: COINS.length + 1 }, () => Array<number>(N + 1).fill(0));
  const items: Item[] = [];
  for (let x = 0; x <= N; x++) items.push({ id: `col:${x}`, kind: 'text', rect: { x: gridRect(0, x).x, y: 0, w: 54, h: 16 }, tone: 'muted', text: `${x}원` });
  for (let i = 0; i <= COINS.length; i++) {
    items.push({ id: `row:${i}`, kind: 'text', rect: { x: 0, y: gridRect(i, 0).y, w: 60, h: 54 }, tone: 'muted', text: gridLabel(i) });
    for (let x = 0; x <= N; x++) items.push({ id: gridId([i, x]), kind: 'cell', rect: gridRect(i, x), tone: 'plain', text: '0' });
  }
  items.push({ id: 'calc', kind: 'text', rect: { x: 0, y: G_CALC_Y, w: G_W, h: 28 }, text: '' });
  const rec = new StepRecorder({ width: G_W, height: G_CALC_Y + 28, items });
  const set = (c: Cell, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: gridId(c), patch, ...(pop ? { pop } : {}) });
  let lit: Cell | undefined;
  let done = 0;
  let now: { i: number; x: number; coin: number; up: number; left: number | string; value: number } | undefined;
  const meta = () => ({
    work: done,
    variables: { i: now?.i ?? '-', coin: now?.coin ?? '-', x: now?.x ?? '-', 'dp[i - 1][x]': now?.up ?? '-', 'dp[i][x - coin]': now?.left ?? '-', 'dp[i][x]': now?.value ?? '-' },
  });
  const settle = (): Action[] => (lit ? [set(lit, { tone: 'visited' })] : []);

  // 0원 열은 1, 동전 없음 줄의 나머지는 0이다
  for (let i = 0; i <= COINS.length; i++) dp[i][0] = 1;
  rec.step({ title: '0원 열은 1로 시작', codeHighlights: TABLE_AT.start, ...meta() });
  rec.phase('시작', `동전 ${COIN_TEXT}원으로 ${N}원을 만드는 방법의 수를 구합니다. dp[i][x]는 앞의 i가지 동전으로 x원을 만드는 방법의 수입니다.`);
  rec.do(calcTo('줄 = 쓸 수 있는 동전, 칸 = 금액'));
  rec.phase('규칙', '0원은 아무것도 내지 않는 1가지라서 0원 열은 모두 1입니다. 동전 없이는 1원 이상을 만들 수 없어 0입니다.');
  rec.do(...together([
    ...Array.from({ length: COINS.length + 1 }, (_, i) => set([i, 0], { text: '1', tone: 'visited' })),
    ...Array.from({ length: N }, (_, x) => set([0, x + 1], { tone: 'visited' })),
    calcTo('dp[i][x] = 안 쓰는 경우 + 하나 더 쓰는 경우'),
  ]));

  for (let i = 1; i <= COINS.length; i++) {
    const coin = COINS[i - 1];
    for (let x = 1; x <= N; x++) {
      const cell: Cell = [i, x];
      const use = x >= coin;
      const up = dp[i - 1][x];
      const left = use ? dp[i][x - coin] : 0;
      const value = use ? (up + left) % MOD : up;
      dp[i][x] = value;
      const settling = settle();
      now = { i, x, coin, up, left: use ? left : '-', value };
      lit = cell;
      done++;
      const sources: Cell[] = use ? [[i - 1, x], [i, x - coin]] : [[i - 1, x]];
      const formula = use ? `${up} + ${left}` : `${up}`;

      rec.step({ title: use ? `dp[${i}][${x}] = ${formula} = ${value}` : `dp[${i}][${x}] = ${up} (위 칸 그대로)`, codeHighlights: use ? TABLE_AT.addBig : TABLE_AT.addSmall, ...meta() });
      rec.phase('두 칸 보기', use
        ? `${x}원은 ${coin}원 동전을 안 쓰는 경우(위 칸) ${up}가지와, 하나 더 쓰는 경우(${coin}칸 왼쪽) ${left}가지를 더합니다.`
        : `${x}원은 ${coin}원보다 작아 이 동전을 쓸 수 없습니다. 위 칸의 ${up}가지를 그대로 씁니다.`, use ? TABLE_AT.big : TABLE_AT.small);
      rec.do(...together([...settling, set(cell, { tone: 'current' }), { type: 'focus', ids: [gridId(cell), ...sources.map(gridId)] }, calcTo(use ? `안 씀 ${up} + 하나 더 ${left}` : `위 칸 ${up}`)]));
      rec.do(...sources.map((s, n): Action => ({ type: 'arrow', from: gridId(cell), to: gridId(s), verdict: 'good', label: `${n ? left : up}가지` })), wait(300));
      rec.phase('더하기', use ? `${up} + ${left} = ${value}가지를 dp[${i}][${x}]에 적습니다.` : `${josa(`dp[${i}][${x}]`, '은', '는')} 위 칸과 같은 ${value}가지입니다.`, use ? TABLE_AT.addBig : TABLE_AT.addSmall);
      rec.do(...together([set(cell, { text: String(value) }, true), calcTo(`dp[${i}][${x}] = ${value}`)]), wait(300), ...clear());
    }
  }

  const k = COINS.length;
  const settling = settle();
  rec.step({ title: `답 dp[${k}][${N}] = ${dp[k][N]}`, codeHighlights: TABLE_AT.done, ...meta(), answer: dp[k][N], isKeyframe: true });
  rec.phase('답', `모든 동전을 쓴 마지막 줄의 ${N}원 칸이 답입니다. ${N}원을 만드는 방법은 ${dp[k][N]}가지입니다.`);
  rec.do(...together([...settling, set([k, N], { tone: 'path' }), calcTo(`dp[${k}][${N}] = ${dp[k][N]}가지`)]));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'coin-change',
  title: '거스름돈',
  level: 3,
  category: 'dp',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12907',
  description: {
    summary:
      '편의점 직원이 손님에게 n원을 거슬러 주려고 합니다. 가진 동전의 종류가 주어질 때, 그 동전들로 n원을 만드는 방법이 모두 몇 가지인지 구합니다. 동전은 종류마다 얼마든지 쓸 수 있고, 답이 커질 수 있어 1,000,000,007로 나눈 나머지를 돌려줍니다.',
    rules: [
      'n은 100,000 이하의 자연수',
      '동전의 종류는 100개 이하이고, 종류마다 무제한으로 쓸 수 있음',
      '같은 동전 묶음이면 순서가 달라도 한 가지 (예: 1원 + 2원과 2원 + 1원은 같음)',
      '방법의 수를 1,000,000,007로 나눈 나머지를 return',
    ],
    examples: [{ input: 'n = 5, money = [1, 2, 5]', output: '4' }],
  },
  keyIntuitions: [
    'x원을 만드는 방법의 수 dp[x]를 0원부터 n원까지 표로 채웁니다. 0원은 아무것도 내지 않는 1가지입니다.',
    '동전을 하나씩 바깥에서 정하고, 그 동전을 하나 더 쓰는 경우 dp[x] += dp[x − 동전]을 더합니다. 동전 순서가 고정되므로 같은 조합이 한 번만 세어집니다.',
    '금액을 바깥에서 돌고 동전을 안쪽에서 돌리면 (1, 2)와 (2, 1)을 따로 세어 순서까지 다른 방법으로 셉니다. 반복문 순서가 조합과 순열을 가릅니다.',
  ],
  demo: { input: [N, COINS], label: `n = ${N}, money = [${COIN_TEXT}]` },
  workUnit: '표 칸을 계산한 횟수',
  approaches: [
    {
      id: 'coin-outer-loop',
      name: '동전을 바깥에서 도는 한 줄 표',
      rank: 'BEST',
      timeComplexity: 'O(n × 동전 수)',
      spaceComplexity: 'O(n)',
      verdict: '동전을 하나씩 정해 놓고 그 동전을 더 쓰는 경우를 한 줄 표에 더해 가며 조합의 수를 세는 풀이입니다.',
      pros: [
        '길이 n + 1의 표 하나로 끝나 메모리가 적고 코드가 짧습니다.',
        '동전을 바깥에서 돌리기만 하면 같은 동전 묶음이 한 번씩만 세어집니다.',
        'n = 100,000, 동전 100종이어도 천만 번 남짓한 계산이면 끝납니다.',
      ],
      cons: [
        '반복문의 안팎 순서를 바꾸면 조합이 아니라 순열을 세는 오답이 됩니다.',
        '동전을 쓰는 순서를 정해 놓고 세는 방식이라 처음에는 왜 맞는지 헷갈립니다.',
      ],
      whyThisRank:
        '2차원 표의 한 줄만 남겨 같은 값을 덮어쓰는 형태라 가장 짧고 메모리도 적습니다. 반복문 순서가 곧 조합 세기의 열쇠라서 핵심만 남은 풀이입니다.',
      code: LINE,
      visualize: () => oneRow({ run: BEST_RUN, trap: false, at: { start: LINE_AT.start, group: LINE_AT.coin, look: LINE_AT.look, add: LINE_AT.add, done: LINE_AT.done } }),
    },
    {
      id: 'coin-2d-table',
      name: '동전마다 한 줄씩 쓰는 2차원 표',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(n × 동전 수)',
      spaceComplexity: 'O(n × 동전 수)',
      verdict: '"앞의 i가지 동전으로 x원"을 줄마다 따로 적어 이해하기는 쉽지만, 동전 수만큼 메모리가 더 드는 풀이입니다.',
      pros: [
        '동전을 안 쓰는 경우(위 칸)와 하나 더 쓰는 경우(왼쪽 칸)가 눈에 보여 왜 조합이 세어지는지 이해하기 좋습니다.',
        '줄마다 값이 남아 어떤 동전까지 썼을 때의 방법 수인지 되짚어 볼 수 있습니다.',
      ],
      cons: [
        'n = 100,000, 동전 100종이면 천만 칸이라 메모리를 한 줄 표보다 100배 가까이 씁니다.',
        '0원 열 채우기, 동전 번호(i − 1)처럼 인덱스를 챙길 것이 늘어납니다.',
      ],
      whyThisRank:
        '시간은 정석과 같지만 표가 동전 수만큼 커집니다. 한 줄만 남겨도 되는 값을 전부 들고 있어서, 정석이 같은 계산을 더 적은 메모리로 합니다.',
      code: TABLE,
      visualize: twoD,
    },
    {
      id: 'coin-amount-outer',
      name: '금액을 바깥에서 도는 한 줄 표',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(n × 동전 수)',
      spaceComplexity: 'O(n)',
      verdict: '정석과 코드가 거의 같지만 반복문 안팎이 바뀌어, 같은 동전 묶음을 순서만 바꿔 여러 번 세는 오답이 나옵니다.',
      pros: ['정석과 한 줄 표, 점화식이 같아 맞는 풀이처럼 보입니다.', '동전을 몇 번 내는지(순서 있는 방법의 수)를 세는 다른 문제에서는 이 코드가 정답입니다.'],
      cons: [
        '원문 입출력 예(n = 5, money = [1, 2, 5])에서 4가 아니라 9를 답합니다.',
        '1원, 1원, 1원, 2원처럼 같은 묶음을 순서만 바꿔 4번 세는 식으로 중복이 생깁니다.',
      ],
      whyThisRank:
        '금액마다 "마지막에 낸 동전"을 모든 종류로 따지면 낸 순서가 구분되어 순열을 세게 됩니다. 조합을 세려면 동전을 바깥, 금액을 안쪽에 두어 동전 순서를 고정해야 합니다.',
      code: SWAPPED,
      visualize: () => oneRow({ run: TRAP_RUN, trap: true, at: { start: SWAP_AT.start, group: SWAP_AT.amount, look: SWAP_AT.look, add: SWAP_AT.add, done: SWAP_AT.done } }),
    },
  ],
  checks: {
    cases: [
      { args: [5, [1, 2, 5]], expected: 4 },
      { args: [N, COINS], expected: ANSWER },
      { args: [1, [2]], expected: 0 },
      { args: [10, [1]], expected: 1 },
      { args: [3, [1, 2]], expected: 2 },
      { args: [4, [2, 1]], expected: 3 },
      { args: BIG, expected: countWays(...BIG) },
    ],
    // n 1~12, 동전 1~3종(1~6원, 서로 다름)
    random: (rand) => {
      const pool = [1, 2, 3, 4, 5, 6];
      const money: number[] = [];
      for (let k = 1 + Math.floor(rand() * 3); k > 0; k--) money.push(...pool.splice(Math.floor(rand() * pool.length), 1));
      return [1 + Math.floor(rand() * 12), money];
    },
  },
};

export default problem;
