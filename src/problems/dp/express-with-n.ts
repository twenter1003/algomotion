// N으로 표현: 정석 사용 횟수별 집합, 대안 값마다 처음 만든 횟수만 기억, 함정 짝을 절반만 보는 집합을 같은 장면에서 움직인다.
// 장면은 위에 N·목표 표시, 그 아래에 'k번' 줄(N을 k번 써서 만든 수가 칸으로 들어옴), 맨 아래 계산 글이다.
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, together } from '../shared.ts';

type Lines = Record<Language, number[]>;

// 시각화 입력. 1로 10을 만든다: 정석은 11 − 1 = 10을 3번에 찾고, 함정은 그 짝을 건너뛰어 4번이라고 답한다.
const N = 1;
const NUMBER = 10;
const MAX_USE = 8;
const cat = (k: number) => Number(String(N).repeat(k)); // N을 k번 이어 붙인 수

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const SETS = {
  python: `def solution(N, number):
    dp = [set() for _ in range(9)]  # dp[k] = N을 정확히 k번 써서 만들 수 있는 수

    for k in range(1, 9):
        dp[k].add(int(str(N) * k))  # N, NN, NNN … 이어 붙인 수
        for i in range(1, k):
            for a in dp[i]:
                for b in dp[k - i]:
                    dp[k].add(a + b)
                    dp[k].add(a * b)
                    if a - b > 0:
                        dp[k].add(a - b)
                    if a // b > 0:
                        dp[k].add(a // b)
        if number in dp[k]:
            return k

    return -1`,
  javascript: `function solution(N, number) {
  const dp = Array.from({ length: 9 }, () => new Set()); // dp[k] = N을 정확히 k번 써서 만들 수 있는 수

  for (let k = 1; k <= 8; k++) {
    dp[k].add(Number(String(N).repeat(k))); // N, NN, NNN … 이어 붙인 수
    for (let i = 1; i < k; i++) {
      for (const a of dp[i]) {
        for (const b of dp[k - i]) {
          dp[k].add(a + b);
          dp[k].add(a * b);
          if (a - b > 0) dp[k].add(a - b);
          if (Math.floor(a / b) > 0) dp[k].add(Math.floor(a / b));
        }
      }
    }
    if (dp[k].has(number)) return k;
  }

  return -1;
}`,
};
// 한 쌍의 계산 줄: 더하기·곱하기와 두 조건은 늘 돌고, 빼기·나누기는 0보다 클 때만 넣는 줄이 돈다(JavaScript는 조건과 넣기가 한 줄)
const calcLines = (code: Record<Language, string>) => (minus: boolean, div: boolean): Lines => lines(
  code,
  ['dp[k].add(a + b)', 'dp[k].add(a * b)', 'if a - b > 0', ...(minus ? ['dp[k].add(a - b)'] : []), 'if a // b > 0', ...(div ? ['dp[k].add(a // b)'] : [])],
  ['dp[k].add(a + b)', 'dp[k].add(a * b)', 'if (a - b > 0)', 'if (Math.floor(a / b) > 0)'],
);
const SETS_AT = {
  start: lines(SETS, ['dp = [set()'], ['const dp = Array.from']),
  concat: lines(SETS, ['for k in range(1, 9)', 'dp[k].add(int(str(N) * k))'], ['for (let k = 1', 'dp[k].add(Number(String(N)']),
  pick: lines(SETS, ['for i in range(1, k)', 'for a in dp[i]', 'for b in dp[k - i]'], ['for (let i = 1', 'for (const a of dp[i])', 'for (const b of dp[k - i])']),
  calc: calcLines(SETS),
  check: lines(SETS, ['if number in dp[k]'], ['if (dp[k].has(number))']),
  done: lines(SETS, ['return k'], ['return k']),
};

const FIRST = {
  python: `def solution(N, number):
    cost = {N: 1}      # 값 → 그 값을 만든 가장 적은 사용 횟수
    fresh = [[], [N]]  # fresh[k] = 사용 횟수 k로 처음 만든 값들

    def put(v, k):
        if v > 0 and v not in cost:  # 이미 더 적게 써서 만든 값은 건너뜁니다
            cost[v] = k
            fresh[k].append(v)

    for k in range(1, 9):
        if k > 1:
            fresh.append([])
            put(int(str(N) * k), k)  # N, NN, NNN … 이어 붙인 수
            for i in range(1, k):
                for a in fresh[i]:
                    for b in fresh[k - i]:
                        put(a + b, k)
                        put(a * b, k)
                        put(a - b, k)
                        put(a // b, k)
        if number in cost:
            return cost[number]

    return -1`,
  javascript: `function solution(N, number) {
  const cost = new Map([[N, 1]]); // 값 → 그 값을 만든 가장 적은 사용 횟수
  const fresh = [[], [N]]; // fresh[k] = 사용 횟수 k로 처음 만든 값들

  const put = (v, k) => {
    if (v > 0 && !cost.has(v)) { // 이미 더 적게 써서 만든 값은 건너뜁니다
      cost.set(v, k);
      fresh[k].push(v);
    }
  };

  for (let k = 1; k <= 8; k++) {
    if (k > 1) {
      fresh.push([]);
      put(Number(String(N).repeat(k)), k); // N, NN, NNN … 이어 붙인 수
      for (let i = 1; i < k; i++) {
        for (const a of fresh[i]) {
          for (const b of fresh[k - i]) {
            put(a + b, k);
            put(a * b, k);
            put(a - b, k);
            put(Math.floor(a / b), k);
          }
        }
      }
    }
    if (cost.has(number)) return cost.get(number);
  }

  return -1;
}`,
};
const FIRST_AT = {
  start: lines(FIRST, ['cost = {N: 1}', 'fresh = [[], [N]]'], ['const cost = new Map', 'const fresh = [[], [N]]']),
  one: lines(FIRST, ['for k in range(1, 9)', 'if k > 1'], ['for (let k = 1', 'if (k > 1)']),
  // put은 새 값일 때만 사전과 줄에 적는 줄이 돈다
  concat: (fresh: boolean): Lines => lines(
    FIRST,
    ['for k in range(1, 9)', 'if k > 1', 'fresh.append([])', 'put(int(str(N) * k), k)', 'if v > 0 and v not in cost', ...(fresh ? ['cost[v] = k', 'fresh[k].append(v)'] : [])],
    ['for (let k = 1', 'if (k > 1)', 'fresh.push([])', 'put(Number(String(N)', 'if (v > 0 && !cost.has(v))', ...(fresh ? ['cost.set(v, k)', 'fresh[k].push(v)'] : [])],
  ),
  pick: lines(FIRST, ['for i in range(1, k)', 'for a in fresh[i]', 'for b in fresh[k - i]'], ['for (let i = 1', 'for (const a of fresh[i])', 'for (const b of fresh[k - i])']),
  calc: (fresh: boolean): Lines => lines(
    FIRST,
    ['put(a + b, k)', 'put(a * b, k)', 'put(a - b, k)', 'put(a // b, k)', 'if v > 0 and v not in cost', ...(fresh ? ['cost[v] = k', 'fresh[k].append(v)'] : [])],
    ['put(a + b, k)', 'put(a * b, k)', 'put(a - b, k)', 'put(Math.floor(a / b), k)', 'if (v > 0 && !cost.has(v))', ...(fresh ? ['cost.set(v, k)', 'fresh[k].push(v)'] : [])],
  ),
  check: lines(FIRST, ['if number in cost'], ['if (cost.has(number))']),
  done: lines(FIRST, ['return cost[number]'], ['return cost.get(number)']),
};

const HALF = {
  python: `# 주의: 뺄셈과 나눗셈은 순서가 중요한데 짝을 절반만 보는 풀이입니다
def solution(N, number):
    dp = [set() for _ in range(9)]

    for k in range(1, 9):
        dp[k].add(int(str(N) * k))
        for i in range(1, k // 2 + 1):  # 덧셈·곱셈은 순서가 같으니 짝을 절반만?
            for a in dp[i]:
                for b in dp[k - i]:
                    dp[k].add(a + b)
                    dp[k].add(a * b)
                    if a - b > 0:
                        dp[k].add(a - b)
                    if a // b > 0:
                        dp[k].add(a // b)
        if number in dp[k]:
            return k

    return -1`,
  javascript: `// 주의: 뺄셈과 나눗셈은 순서가 중요한데 짝을 절반만 보는 풀이입니다
function solution(N, number) {
  const dp = Array.from({ length: 9 }, () => new Set());

  for (let k = 1; k <= 8; k++) {
    dp[k].add(Number(String(N).repeat(k)));
    for (let i = 1; i <= Math.floor(k / 2); i++) { // 덧셈·곱셈은 순서가 같으니 짝을 절반만?
      for (const a of dp[i]) {
        for (const b of dp[k - i]) {
          dp[k].add(a + b);
          dp[k].add(a * b);
          if (a - b > 0) dp[k].add(a - b);
          if (Math.floor(a / b) > 0) dp[k].add(Math.floor(a / b));
        }
      }
    }
    if (dp[k].has(number)) return k;
  }

  return -1;
}`,
};
const HALF_AT = {
  start: lines(HALF, ['dp = [set()'], ['const dp = Array.from']),
  concat: lines(HALF, ['for k in range(1, 9)', 'dp[k].add(int(str(N) * k))'], ['for (let k = 1', 'dp[k].add(Number(String(N)']),
  pick: lines(HALF, ['for i in range(1, k // 2 + 1)', 'for a in dp[i]', 'for b in dp[k - i]'], ['for (let i = 1', 'for (const a of dp[i])', 'for (const b of dp[k - i])']),
  calc: calcLines(HALF),
  skip: lines(HALF, ['for i in range(1, k // 2 + 1)'], ['for (let i = 1']),
  check: lines(HALF, ['if number in dp[k]'], ['if (dp[k].has(number))']),
  done: lines(HALF, ['return k'], ['return k']),
};

/* ------------------------------------------------------------------ */
/* 세 풀이를 미리 돌려 본 기록: 줄마다 들어간 값, 짝마다 계산 결과, number를 처음 만든 식 */
/* ------------------------------------------------------------------ */

type Mode = 'full' | 'dict' | 'half';
interface Calc { sym: '+' | '×' | '−' | '÷'; value: number } // value가 0 이하면 버린다
interface Pair { i: number; a: number; b: number; calcs: Calc[]; fresh: number[] } // fresh: 이 짝으로 줄에 새로 들어간 값
interface Block { k: number; concatFresh: boolean; pairs: Pair[]; row: number[]; found: boolean }
interface Made { k: number; i: number; a: number; b: number; sym: string } // number를 처음 만든 식 a ○ b
interface Sim { blocks: Block[]; answer: number; made?: Made }

// 코드와 같은 차례(이어 붙인 수 → i = 1부터 짝 → 짝마다 a + b, a × b, a − b, a ÷ b)로 줄을 채운다.
// 정석과 함정은 줄 안의 값만, 대안은 지금까지 만든 모든 값을 보고 중복을 거른다. 함정은 i를 k // 2까지만 돈다.
function simulate(mode: Mode): Sim {
  const rows: number[][] = [[], []];
  const seen = new Set<number>();
  const blocks: Block[] = [];
  let made: Made | undefined;
  for (let k = 1; k <= MAX_USE; k++) {
    const row: number[] = [];
    rows[k] = row;
    const put = (v: number) => {
      if (v <= 0 || (mode === 'dict' ? seen.has(v) : row.includes(v))) return false;
      row.push(v);
      seen.add(v);
      return true;
    };
    const block: Block = { k, concatFresh: put(cat(k)), pairs: [], row, found: false };
    for (let i = 1; i <= (mode === 'half' ? Math.floor(k / 2) : k - 1); i++) {
      for (const a of rows[i]) {
        for (const b of rows[k - i]) {
          const calcs: Calc[] = [
            { sym: '+', value: a + b }, { sym: '×', value: a * b }, { sym: '−', value: a - b }, { sym: '÷', value: Math.floor(a / b) },
          ];
          const fresh = calcs.filter((c) => {
            const ok = put(c.value);
            if (ok && c.value === NUMBER && !made) made = { k, i, a, b, sym: c.sym };
            return ok;
          }).map((c) => c.value);
          block.pairs.push({ i, a, b, calcs, fresh });
        }
      }
    }
    block.found = row.includes(NUMBER);
    blocks.push(block);
    if (block.found) return { blocks, answer: k, made };
  }
  return { blocks, answer: -1 };
}

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const CELL = 54;
const GAP = 8;
const PER_ROW = 8;
const X0 = 60; // 줄 이름표 54px 오른쪽부터 칸
const W = X0 + PER_ROW * CELL + (PER_ROW - 1) * GAP;
const TOP = 44; // 위 28px은 N·목표 표시
const ROW_GAP = 30; // 줄 사이: 칸 위에 붙는 판정 표시(11px)가 앞 줄과 겹치지 않을 만큼
const LINE = CELL + 14; // 한 줄이 넘쳐 다음 칸 줄로 내려갈 때의 간격(위 칸 줄과 판정 표시가 겹치지 않게 14px)
const RESULT_Y = 40; // 함정은 계산 글 아래에 답 표시 줄을 더 둔다

// 줄마다 칸 수(미리 돌려 본 기록의 마지막 모습)로 줄 위치를 정한다. 한 줄에 8칸, 넘치면 다음 줄
interface Lay { count: number; tops: number[]; calcY: number }
function layoutOf(sim: Sim): Lay {
  const tops: number[] = [];
  let y = TOP;
  for (const b of sim.blocks) {
    tops[b.k] = y;
    y += Math.max(1, Math.ceil(b.row.length / PER_ROW)) * LINE - 14 + ROW_GAP;
  }
  return { count: sim.blocks.length, tops, calcY: y - ROW_GAP + 22 };
}
const slotOf = (lay: Lay, k: number, n: number): Rect => ({
  x: X0 + (n % PER_ROW) * (CELL + GAP),
  y: lay.tops[k] + Math.floor(n / PER_ROW) * LINE,
  w: CELL,
  h: CELL,
});
const cellId = (k: number, v: number) => `cell:${k}:${v}`;

// 세 풀이가 같이 쓰는 장면: N과 목표 표시, 줄 이름표, 계산 글(칸은 값이 들어올 때 생긴다)
function board(lay: Lay, withResult: boolean): Scene {
  const items: Item[] = [
    { id: 'n', kind: 'token', rect: { x: X0, y: 0, w: 84, h: 28 }, tone: 'plain', text: `N = ${N}` },
    { id: 'goal', kind: 'token', rect: { x: W - 104, y: 0, w: 104, h: 28 }, tone: 'plain', text: `목표 ${NUMBER}` },
  ];
  for (let k = 1; k <= lay.count; k++) items.push({ id: `label:${k}`, kind: 'text', rect: { x: 0, y: lay.tops[k], w: 54, h: CELL }, tone: 'muted', text: `${k}번` });
  items.push({ id: 'calc', kind: 'text', rect: { x: 0, y: lay.calcY, w: W, h: 28 }, text: '' });
  return { width: W, height: lay.calcY + 28 + (withResult ? RESULT_Y : 0), items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paintId = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });
const focusIds = (ids: string[]): Action => ({ type: 'focus', ids });
const clear = (): Action[] => together([{ type: 'clearMarks' }, { type: 'unfocus' }]);
const dp = (k: number) => `dp[${k}]`;
const list = (xs: number[]) => xs.join(', ');
const was = (v: number) => (v > 0 ? String(v) : `${String(v).replace('-', '−')} ✗`); // 0 이하는 버린다

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
/* 세 풀이가 함께 쓰는 연출: 이어 붙이기 → 짝 고르기 → 계산하기 → 목표 찾기    */
/* ------------------------------------------------------------------ */

interface Script {
  mode: Mode;
  at: {
    start: Lines; concat: (fresh: boolean) => Lines; pick: Lines;
    calc: (fresh: boolean, minus: boolean, div: boolean) => Lines; skip?: Lines; check: Lines; done: Lines;
  };
  oneLines?: Lines; // k = 1에서 이어 붙이기 마디가 비추는 줄(없으면 concat과 같다)
  rowKey: string; // 변수 칸에 보이는 줄 이름(dp[k], fresh[k])
  rowName: (k: number) => string; // 자막에서 부르는 줄 이름
  intro: string; // 시작 두 번째 마디(규칙) 자막
  introCalc: string;
  calcNew: (k: number, fresh: number[]) => string; // 계산하기 자막: 새 값이 있을 때
  calcNone: (k: number) => string; // 새 값이 없을 때
  checkNo: (k: number) => string; // 목표를 못 찾았을 때
  groupFrom?: number; // 이 k부터는 같은 i의 짝 전부를 한 단계로(함정)
}

const SCRIPTS: Record<Mode, Script> = {
  full: {
    mode: 'full',
    at: { ...SETS_AT, concat: () => SETS_AT.concat, calc: (_f, minus, div) => SETS_AT.calc(minus, div) },
    rowKey: 'dp[k]',
    rowName: dp,
    intro: `dp[k]는 ${josa(N, '을', '를')} 정확히 k번 써서 만들 수 있는 수의 집합입니다.`,
    introCalc: 'dp[k] = N을 이어 붙인 수 + 짝마다 a + b, a × b, a − b, a ÷ b',
    calcNew: (k, fresh) => `네 계산 중 0보다 큰 새 값 ${josa(list(fresh), '을', '를')} ${dp(k)}에 넣습니다.`,
    calcNone: (k) => `네 계산이 모두 0 이하이거나 이미 ${dp(k)}에 있어 새 값이 없습니다.`,
    checkNo: (k) => `${dp(k)}에 ${josa(NUMBER, '이', '가')} 없습니다. 한 번 더 써 봅니다.`,
  },
  dict: {
    mode: 'dict',
    at: { ...FIRST_AT },
    oneLines: FIRST_AT.one,
    rowKey: 'fresh[k]',
    rowName: (k) => `fresh[${k}]`,
    intro: '값마다 처음 만든 사용 횟수만 기억하고, 이미 만든 값은 다시 넣지 않습니다.',
    introCalc: '이미 만든 값 · 0 이하는 건너뜀',
    calcNew: (k, fresh) => `0보다 크고 처음 만든 값 ${list(fresh)}만 fresh[${k}]에 넣습니다.`,
    calcNone: () => '새 값이 없습니다. 모두 0 이하이거나 이미 만든 값입니다.',
    checkNo: () => `지금까지 만든 값에 ${josa(NUMBER, '이', '가')} 없습니다. 한 번 더 써 봅니다.`,
  },
  half: {
    mode: 'half',
    at: { ...HALF_AT, concat: () => HALF_AT.concat, calc: (_f, minus, div) => HALF_AT.calc(minus, div) },
    rowKey: 'dp[k]',
    rowName: dp,
    intro: 'i는 k // 2까지만 돌아, dp[i]와 dp[k − i]의 짝을 절반만 봅니다.',
    introCalc: '짝 (i, k − i)는 i ≤ k − i인 것만',
    calcNew: (k, fresh) => `네 계산 중 0보다 큰 새 값 ${josa(list(fresh), '을', '를')} ${dp(k)}에 넣습니다.`,
    calcNone: (k) => `네 계산이 모두 0 이하이거나 이미 ${dp(k)}에 있어 새 값이 없습니다.`,
    checkNo: (k) => `${dp(k)}에 ${josa(NUMBER, '이', '가')} 없습니다. 한 번 더 써 봅니다.`,
    groupFrom: 4,
  },
};

interface Plan { pairs: Pair[]; kind: 'one' | 'rest' | 'group' }

// 단계로 묶기: 정석·대안은 짝마다 한 단계, 한 i의 끝에서 새 값 없는 짝이 두 쌍 넘게 이어지면 한 단계로 묶는다. 함정은 groupFrom부터 i마다 한 단계
function plansOf(block: Block, groupFrom?: number): Plan[] {
  const plans: Plan[] = [];
  if (groupFrom && block.k >= groupFrom) {
    for (const p of block.pairs) {
      const last = plans.at(-1);
      if (last && last.pairs[0].i === p.i) last.pairs.push(p);
      else plans.push({ pairs: [p], kind: 'group' });
    }
    return plans;
  }
  block.pairs.forEach((p, n) => {
    const rest = block.pairs.slice(n);
    const prev = plans.at(-1);
    if (prev?.kind === 'rest' && prev.pairs[0].i === p.i) prev.pairs.push(p);
    else if (rest.length >= 2 && rest.every((q) => q.i === p.i && !q.fresh.length)) plans.push({ pairs: [p], kind: 'rest' });
    else plans.push({ pairs: [p], kind: 'one' });
  });
  return plans;
}

function build(s: Script): Visualization {
  const sim = simulate(s.mode);
  const lay = layoutOf(sim);
  const trap = s.mode === 'half';
  const rec = new StepRecorder(board(lay, trap));
  const shown: number[][] = []; // 줄마다 장면에 들어와 있는 값(들어온 차례)
  let lit: string[] = []; // 노랑·파랑으로 칠한 칸(다음 단계 처음에 초록으로 돌린다)
  let work = 0;
  // 변수는 단계가 끝났을 때의 값이다. row는 그때의 현재 줄(k번 줄)
  const st = { k: 0, i: '-' as number | string, a: '-' as number | string, b: '-' as number | string, row: [] as number[] };
  const meta = () => ({
    work,
    variables: { k: st.k || '-', i: st.i, a: st.a, b: st.b, [s.rowKey]: st.k ? `{${list(st.row)}}` : '-' },
  });
  const settle = (): Action[] => {
    const acts = lit.map((id) => paintId(id, 'visited'));
    lit = [];
    return acts;
  };
  const ids = (k: number) => (shown[k] ?? []).map((v) => cellId(k, v));
  // 값을 줄 끝 칸에 넣는다: 연산한 칸(from)에서 날아오고, 이어 붙인 수는 그 자리에 나타난다
  const addCell = (k: number, v: number, from?: string): Action => {
    (shown[k] ??= []).push(v);
    const id = cellId(k, v);
    lit.push(id);
    return { type: 'add', item: { id, kind: 'cell', rect: slotOf(lay, k, shown[k].length - 1), tone: 'current', text: String(v) }, ...(from ? { from } : {}) };
  };

  rec.step({ title: `${josa(NUMBER, '을', '를')} 만드는 최소 횟수 구하기`, codeHighlights: s.at.start, ...meta() });
  rec.phase('시작', `${josa(N, '과', '와')} 사칙연산만으로 ${josa(NUMBER, '을', '를')} 만들 때, ${josa(N, '을', '를')} 가장 적게 쓰는 횟수를 구합니다.`);
  rec.do({ type: 'set', id: 'goal', patch: { tone: 'chosen' }, pop: true });
  rec.phase('규칙', s.intro);
  rec.do(calcTo(s.introCalc));

  for (const block of sim.blocks) {
    const { k } = block;
    const row = s.rowName(k);
    const joined = cat(k);
    const plans = plansOf(block, s.groupFrom);
    // 함정은 i가 k // 2에서 멈춘다: 건너뛴 짝은 마지막에 따로 보여 준다
    const skipped: number[] = [];
    if (trap) for (let i = Math.floor(k / 2) + 1; i < k; i++) skipped.push(i);
    const foundCell = block.found ? cellId(k, NUMBER) : undefined;

    // 목표 찾기: 줄을 밝혀 number가 있는지 본다
    const check = () => {
      rec.phase('목표 찾기', block.found
        ? `${row}에서 ${josa(NUMBER, '을', '를')} 찾았습니다! ${josa(N, '을', '를')} ${k}번 쓰면 됩니다.`
        : s.checkNo(k), s.at.check);
      rec.do(...together([focusIds(ids(k)), calcTo(`${NUMBER} ${block.found ? '∈' : '∉'} ${row}`)]));
      if (foundCell) rec.do({ type: 'arrow', from: 'goal', to: foundCell, verdict: 'good', label: '찾음!' }, { ...paintId('goal', 'good'), together: true });
      rec.do(wait(300), ...clear());
    };

    // 1. 이어 붙이기 → 넣기: k = 1은 N 하나. 이미 있는 값이면 넣지 않는다
    const joinLines = k === 1 ? (s.oneLines ?? s.at.concat(true)) : s.at.concat(block.concatFresh);
    work++;
    st.k = k;
    st.i = st.a = st.b = '-';
    st.row = [...(shown[k] ?? []), ...(block.concatFresh ? [joined] : [])];
    rec.step({ title: k === 1 ? `${dp(1)} = {${N}}` : block.concatFresh ? `${row}에 ${joined} 넣기` : `${josa(joined, '은', '는')} 이미 있어 건너뜀`, codeHighlights: joinLines, ...meta() });
    rec.phase('이어 붙이기', k === 1 ? `${josa(N, '을', '를')} 1번 쓰면 ${N} 하나뿐입니다.` : `${josa(N, '을', '를')} ${k}번 이어 붙이면 ${joined}입니다.`, joinLines);
    rec.do(...together([...settle(), calcTo(`${josa(N, '을', '를')} ${k}번 이어 붙인 수 = ${joined}`)]));
    rec.phase('넣기', block.concatFresh ? `${row}에 ${josa(joined, '을', '를')} 넣습니다.` : `${josa(joined, '은', '는')} 이미 있어 넣지 않습니다.`, joinLines);
    rec.do(...(block.concatFresh ? [addCell(k, joined)] : [wait(300)]));
    if (!plans.length && !skipped.length) check();

    // 2. 짝마다 계산
    plans.forEach((plan, n) => {
      const { pairs } = plan;
      const first = pairs[0];
      const i = first.i;
      const fresh = pairs.flatMap((p) => p.fresh);
      const one = plan.kind === 'one';
      const minus = pairs.some((p) => p.calcs[2].value > 0);
      const div = pairs.some((p) => p.calcs[3].value > 0);
      work += pairs.length * 4;
      st.i = i;
      [st.a, st.b] = one ? [first.a, first.b] : [pairs.at(-1)!.a, pairs.at(-1)!.b];
      st.row = [...(shown[k] ?? []), ...fresh];
      rec.step({
        title: one
          ? `${row}: a = ${first.a}, b = ${first.b} → ${fresh.length ? `새 값 ${list(fresh)}` : '새 값 없음'}`
          : plan.kind === 'group'
            ? `${row}: ${josa(s.rowName(i), '과', '와')} ${s.rowName(k - i)}의 짝 ${pairs.length}쌍 → ${fresh.length ? `새 값 ${fresh.length}개` : '새 값 없음'}`
            : `${row}: 남은 ${pairs.length}쌍도 계산 → ${fresh.length ? `새 값 ${list(fresh)}` : '새 값 없음'}`,
        codeHighlights: s.at.calc(fresh.length > 0, minus, div),
        ...meta(),
      });

      // 짝 고르기: a, b(여러 쌍이면 그 칸들)만 밝히고 파랗게
      const picked = [...new Set(pairs.flatMap((p) => [cellId(p.i, p.a), cellId(k - p.i, p.b)]))];
      rec.phase('짝 고르기', one
        ? `${s.rowName(i)}에서 a = ${first.a}, ${s.rowName(k - i)}에서 b = ${josa(first.b, '을', '를')} 고릅니다.`
        : plan.kind === 'group'
          ? `${josa(s.rowName(i), '과', '와')} ${s.rowName(k - i)}의 모든 짝 ${pairs.length}쌍을 한꺼번에 고릅니다.`
          : `나머지 ${pairs.length}쌍도 같은 방식으로 고릅니다.`, s.at.pick);
      rec.do(...together([...settle(), ...picked.map((id) => paintId(id, 'chosen')), focusIds(picked),
        calcTo(one ? `a = ${first.a}, b = ${first.b}` : `${pairs.length}쌍 × 4 = ${pairs.length * 4}번 계산`)]));
      lit.push(...picked);

      // 계산하기: 네 계산을 보여 주고 0보다 큰 새 값만 줄에 넣는다
      rec.phase('계산하기', fresh.length ? s.calcNew(k, fresh) : s.calcNone(k), s.at.calc(fresh.length > 0, minus, div));
      rec.do(...together([{ type: 'unfocus' }, calcTo(one
        ? first.calcs.map((c) => `${first.a}${c.sym}${first.b}=${was(c.value)}`).join(' · ')
        : `${pairs.length}쌍 계산 → ${fresh.length ? `새 값 ${list(fresh)}` : '새 값 없음'}`)]));
      if (fresh.length) rec.do(...together(fresh.map((v) => addCell(k, v, cellId(i, first.a)))));
      if (n === plans.length - 1 && !skipped.length) check();
    });

    // 3. 함정: 건너뛴 짝과 목표 찾기를 한 단계로
    if (skipped.length) {
      const [i] = skipped;
      st.i = st.a = st.b = '-';
      st.row = shown[k] ?? [];
      rec.step({ title: `${josa(dp(i), '과', '와')} ${dp(k - i)}의 짝은 건너뜀`, codeHighlights: s.at.skip!, ...meta() });
      rec.phase('짝 건너뛰기', `i는 k // 2 = ${Math.floor(k / 2)}까지만 돌아서 ${josa(dp(i), '과', '와')} ${dp(k - i)}의 짝은 계산하지 않습니다.`, s.at.skip);
      rec.do(...together([...settle(), focusIds([...ids(i), ...ids(k - i)]), calcTo(`i = ${josa(i, '은', '는')} k // 2 = ${josa(Math.floor(k / 2), '을', '를')} 넘어 건너뜀`)]));
      rec.do({ type: 'arrow', from: cellId(i, shown[i][0]), to: cellId(k - i, shown[k - i][0]), verdict: 'bad', label: '짝 건너뜀' }, wait(300), ...clear());
      check();
    }
  }

  // 결과 단계
  const { answer, made } = sim;
  const finalCell = cellId(answer, NUMBER);
  st.row = shown[answer] ?? [];
  if (!trap) {
    const usedA = made && cellId(made.i, made.a);
    const usedB = made && cellId(made.k - made.i, made.b);
    st.i = made?.i ?? '-';
    st.a = made?.a ?? '-';
    st.b = made?.b ?? '-';
    rec.step({ title: `정답 ${answer}번${made ? `: ${NUMBER} = ${made.a} ${made.sym} ${made.b}` : ''}`, codeHighlights: s.at.done, ...meta(), answer, isKeyframe: true });
    rec.phase('정답', made
      ? `${josa(NUMBER, '은', '는')} ${made.a} ${made.sym} ${made.b}입니다. ${josa(made.a, '은', '는')} ${josa(N, '을', '를')} ${made.i}번, ${josa(made.b, '은', '는')} ${made.k - made.i}번 써서 모두 ${answer}번입니다.`
      : `${josa(N, '을', '를')} ${answer}번 이어 붙인 수라서 답은 ${answer}번입니다.`);
    rec.do(...together([...settle(), ...[finalCell, usedA, usedB].filter((id): id is string => !!id).map((id) => paintId(id, 'path')),
      calcTo(made ? `${NUMBER} = ${made.a} ${made.sym} ${made.b}  →  ${josa(N, '을', '를')} ${answer}번 사용` : `${NUMBER} = ${josa(N, '을', '를')} ${answer}번 이어 붙인 수`)]));
  } else {
    // 함정: 찾은 칸을 오답으로 칠하고, 건너뛴 짝이 만드는 식(정답)을 나란히 보여 준다
    const truth = simulate('full');
    const tm = truth.made!;
    const [ta, tb] = [cellId(tm.i, tm.a), cellId(tm.k - tm.i, tm.b)];
    const resultY = lay.calcY + RESULT_Y - 6;
    st.i = st.a = st.b = '-';
    rec.step({ title: `오답 확인: ${answer}번, 정답은 ${truth.answer}번`, codeHighlights: s.at.done, ...meta(), answer, isKeyframe: true });
    rec.phase('오답 확인', `${dp(answer)}에서 ${josa(NUMBER, '을', '를')} 찾아 답이 ${answer}번이 됩니다. 하지만 정답은 ${truth.answer}번입니다.`);
    rec.do(...together([...settle(), paintId(finalCell, 'bad')]));
    rec.do({ type: 'add', item: { id: 'mine', kind: 'token', rect: { x: X0, y: resultY, w: 110, h: 28 }, tone: 'bad', text: `내 답 ${answer}번` } });
    rec.phase('놓친 짝', `${dp(tm.i)}의 ${josa(tm.a, '과', '와')} ${dp(tm.k - tm.i)}의 ${tm.b}로 ${tm.a} ${tm.sym} ${tm.b} = ${josa(NUMBER, '을', '를')} 만들 수 있었습니다. 건너뛴 짝입니다.`);
    rec.do(...together([focusIds([ta, tb]), calcTo(`${tm.a} ${tm.sym} ${tm.b} = ${NUMBER}  →  ${josa(N, '을', '를')} ${truth.answer}번 사용`)]));
    rec.do({ type: 'arrow', from: ta, to: tb, verdict: 'good', label: `${tm.a}${tm.sym}${tm.b}=${NUMBER}` });
    rec.do({ type: 'add', item: { id: 'truth', kind: 'token', rect: { x: X0 + 122, y: resultY, w: 110, h: 28 }, tone: 'good', text: `정답 ${truth.answer}번` } }, wait(300));
  }
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'express-with-n',
  title: 'N으로 표현',
  level: 3,
  category: 'dp',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42895',
  description: {
    summary:
      '숫자 N과 괄호, 사칙연산(+, −, ×, ÷)만 써서 number를 만들 때, N을 쓴 횟수의 최솟값을 구합니다. 나눗셈의 나머지는 버리고, 최솟값이 8보다 크면 -1을 돌려줍니다.',
    rules: [
      'N은 1 이상 9 이하의 자연수',
      'number는 1 이상 32,000 이하의 자연수',
      '수식에는 괄호와 사칙연산만 쓸 수 있고, 나눗셈의 나머지는 무시',
      '최솟값이 8보다 크면 -1을 return',
    ],
    examples: [
      { input: 'N = 5, number = 12', output: '4' },
      { input: 'N = 2, number = 11', output: '3' },
    ],
  },
  keyIntuitions: [
    'N을 8번까지만 쓰므로, N을 정확히 k번 써서 만들 수 있는 수의 집합 dp[k]를 k = 1부터 차례로 만들면 됩니다.',
    'dp[k]는 N을 k번 이어 붙인 수(5, 55, 555 …)와, dp[i]의 수 a와 dp[k − i]의 수 b로 만든 a + b, a × b, a − b, a ÷ b를 모두 모은 것입니다. 괄호로 묶는 모든 경우가 이 짝 (i, k − i)로 나뉩니다.',
    '뺄셈과 나눗셈은 순서가 중요하니 a, b를 바꿔 b − a, b ÷ a도 만들어야 합니다. dp[k]에 number가 처음 나오는 k가 답이고, 8번까지 없으면 -1입니다.',
  ],
  demo: { input: [N, NUMBER], label: 'N = 1, number = 10' },
  workUnit: '계산한 식의 수',
  approaches: [
    {
      id: 'express-sets',
      name: '사용 횟수별 집합 만들기',
      rank: 'BEST',
      timeComplexity: 'O(Σ |dp[i]| × |dp[k − i]|)',
      spaceComplexity: 'O(Σ |dp[k]|)',
      verdict: 'N을 k번 써서 만들 수 있는 수의 집합을 k = 1, 2, 3 … 차례로 만들어 number가 처음 나오는 k를 찾는 풀이입니다.',
      pros: [
        '괄호로 묶는 모든 경우를 짝 (i, k − i)로 나누는 것만으로 빠짐없이 만듭니다.',
        '집합이라 같은 값을 한 번만 보관해 k = 8까지 가도 수천 개로 끝납니다.',
        'number가 처음 나오는 k가 바로 최솟값이라 따로 비교할 것이 없습니다.',
      ],
      cons: [
        '뺄셈과 나눗셈은 순서가 달라서 짝을 (i, k − i)와 (k − i, i) 양쪽 순서로 모두 봐야 합니다.',
        '0 이하의 값은 버리므로, 나눗셈이 0이 되거나 0으로 나누는 경우를 코드에서 챙겨야 합니다.',
      ],
      whyThisRank:
        'N을 8번까지만 쓰는 제한이 작아서 만들 수 있는 수를 집합으로 모두 만들어 보는 것이 가장 단순하고 확실합니다. 집합의 크기가 k = 8에서도 5천 개 안팎이라 계산이 순식간에 끝납니다.',
      code: SETS,
      visualize: () => build(SCRIPTS.full),
    },
    {
      id: 'express-first-cost',
      name: '값마다 처음 만든 횟수만 기억하기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(Σ |fresh[i]| × |fresh[k − i]|)',
      spaceComplexity: 'O(만든 값의 수)',
      verdict: '이미 더 적게 써서 만든 값은 다시 넣지 않아 집합이 작아지지만, 줄의 뜻과 코드가 더 복잡해지는 풀이입니다.',
      pros: [
        '같은 값을 다시 만들지 않아 줄이 짧아지고 계산 횟수가 줄어듭니다.',
        '값마다 가장 적게 쓴 횟수를 사전으로 바로 알 수 있습니다.',
      ],
      cons: [
        '줄이 "정확히 k번으로 만든 수"가 아니라 "k번으로 처음 만든 수"라서 뜻을 따로 기억해야 합니다.',
        '사전(cost), 줄(fresh), 넣는 함수(put)까지 필요해 정석보다 코드가 길고 실수할 곳이 많습니다.',
      ],
      whyThisRank:
        '결과는 정석과 같고 계산도 조금 줄지만, N을 8번까지만 쓰는 이 문제에서는 얻는 것이 작습니다. 줄의 뜻이 흐려지는 대가가 커서 짧고 뜻이 분명한 정석이 더 안전합니다.',
      code: FIRST,
      visualize: () => build(SCRIPTS.dict),
    },
    {
      id: 'express-half-pairs',
      name: '짝을 절반만 보는 집합 만들기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(Σ |dp[i]| × |dp[k − i]|)',
      spaceComplexity: 'O(Σ |dp[k]|)',
      verdict: '덧셈·곱셈은 순서가 같다고 짝을 절반만 보다가, 순서가 중요한 뺄셈·나눗셈을 놓쳐 오답이 나옵니다.',
      pros: ['정석과 코드가 거의 같고 반복이 절반이라 빨라 보입니다.', 'number가 덧셈·곱셈만으로 만들어지는 경우에는 정답이 나옵니다.'],
      cons: [
        'dp[i]의 a와 dp[k − i]의 b로 a − b와 a ÷ b만 계산해 b − a, b ÷ a를 놓칩니다.',
        '1로 10을 만들 때 11 − 1 = 10은 dp[2]의 11과 dp[1]의 1이라 짝 (2, 1)이 필요한데, i를 1까지만 돌아 건너뛰고 3번이 아니라 4번이라고 답합니다.',
        '원문 예제 2(N = 2, number = 11)에서도 22 ÷ 2 = 11의 짝을 건너뛰어 3이 아니라 5라고 답합니다.',
      ],
      whyThisRank:
        '뺄셈과 나눗셈은 교환법칙이 성립하지 않아 a, b를 정하는 순서마다 따로 계산해야 합니다. 반복을 줄이려다 정확성을 잃은 경우입니다. 짝을 (i, k − i)와 (k − i, i) 모두 보면 정답입니다.',
      code: HALF,
      visualize: () => build(SCRIPTS.half),
    },
  ],
  checks: {
    cases: [
      { args: [5, 12], expected: 4 },
      { args: [2, 11], expected: 3 },
      { args: [N, NUMBER], expected: 3 },
      { args: [5, 5], expected: 1 },
      { args: [7, 1], expected: 2 },
      { args: [3, 5], expected: 4 },
      { args: [1, 41], expected: 8 },
      { args: [1, 70], expected: -1 },
      { args: [9, 32000], expected: -1 },
    ],
    // N 1~9, number 1~120. 못 만드는 수는 8번까지 만들어도 집합이 몇천 개라 순식간이다
    random: (rand) => [1 + Math.floor(rand() * 9), 1 + Math.floor(rand() * 120)],
  },
};

export default problem;
