// 수식 최대화: 정석 연산자 우선순위를 모두 정해(순열) 높은 연산자부터 합쳐 계산, 대안 같은 순열을 재귀로 쪼개 계산, 함정 수학 우선순위 하나만 쓰기.
// 정석과 대안은 우선순위 순열 나무(칸 = 연산자, 잎마다 결과)와 계산 줄을, 함정은 계산 줄만 쓴다.
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';
import { branch, holdCaptions, layoutTree, set, tone, wait, type Shape } from './common.ts';

// 원문 예제 1. 세 풀이의 시각화 입력이자 점검 사례다. 수학 우선순위(× 먼저)는 60380, 정답은 × > + > −의 60420이다.
const EXPR = '100-200*300-500+20';
const TOKENS = EXPR.split(/([-+*])/);
const OPS = ['+', '-', '*'].filter((o) => EXPR.includes(o));
const sym = (o: string) => (o === '*' ? '×' : o === '-' ? '−' : '+');
const show = (xs: string[]) => xs.map((x) => (x.length === 1 && '+-*'.includes(x) ? sym(x) : x.replace('-', '−'))).join('');
const apply = (a: number, o: string, b: number) => (o === '+' ? a + b : o === '-' ? a - b : a * b);
const num = (n: number) => String(n).replace('-', '−');
interface Meta { work: number; variables: Record<string, string | number> }

// 우선순위 순서(앞이 높음)대로 연산자를 한 종류씩 왼쪽부터 합쳐 계산한다. 합친 뒤의 식과 계산 내용을 남긴다.
interface Pass { op: string; calcs: string[]; line: string }
interface Run { order: string[]; passes: Pass[]; value: number; ops: number }
const runOrder = (order: string[]): Run => {
  let work = [...TOKENS];
  const passes: Pass[] = [];
  let ops = 0;
  for (const op of order) {
    const stack: string[] = [];
    const calcs: string[] = [];
    for (let i = 0; i < work.length; i++) {
      if (work[i] === op) {
        const a = Number(stack.pop());
        const b = Number(work[i + 1]);
        const r = apply(a, op, b);
        calcs.push(`${num(a)} ${sym(op)} ${num(b)} = ${num(r)}`);
        stack.push(String(r));
        i++;
        ops++;
      } else stack.push(work[i]);
    }
    work = stack;
    passes.push({ op, calcs, line: show(work) });
  }
  return { order, passes, value: Number(work[0]), ops };
};
const ORDERS: string[][] = [];
{
  const perm = (p: string[]) => {
    if (p.length === OPS.length) ORDERS.push(p);
    else for (const o of OPS) if (!p.includes(o)) perm([...p, o]);
  };
  perm([]);
}
const RUNS = ORDERS.map(runOrder);
const BEST_RUN = RUNS.reduce((b, r) => (Math.abs(r.value) > Math.abs(b.value) ? r : b));
const BEST = Math.abs(BEST_RUN.value);
// 대안: 우선순위가 가장 낮은 연산자부터 식을 쪼갠 모양(낮은 쪽부터 괄호로 감싼다)
const splitText = (tokens: string[], lowFirst: string[], k: number): string => {
  if (k === lowFirst.length) return show(tokens);
  const parts: string[][] = [[]];
  for (const t of tokens) {
    if (t === lowFirst[k]) parts.push([]);
    else parts.at(-1)!.push(t);
  }
  if (parts.length === 1) return splitText(tokens, lowFirst, k + 1);
  return parts.map((p) => `(${splitText(p, lowFirst, k + 1)})`).join(sym(lowFirst[k]));
};
// 수학 우선순위 하나(× 먼저, + − 는 왼쪽부터)로 계산하는 함정의 결과
const MATH = (() => {
  const times = runOrder(['*']);
  const rest = times.passes[0].line;
  const seq = rest.replace(/−/g, '-').replace(/×/g, '*').split(/([-+*])/);
  let acc = Number(seq[0]);
  const steps: string[] = [];
  for (let i = 1; i < seq.length; i += 2) {
    const r = apply(acc, seq[i], Number(seq[i + 1]));
    steps.push(`${num(acc)} ${sym(seq[i])} ${num(Number(seq[i + 1]))} = ${num(r)}`);
    acc = r;
  }
  return { times, rest, steps, value: acc, ops: times.ops + steps.length };
})();

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const CALC_PY = `import re
from itertools import permutations

def calc(a, op, b):
    return a + b if op == "+" else a - b if op == "-" else a * b
`;
const BEST_CODE = {
  python: `${CALC_PY}
def solution(expression):
    tokens = re.split(r"([-+*])", expression)  # 숫자와 연산자로 나눕니다
    ops = [op for op in "+-*" if op in expression]  # 식에 들어 있는 연산자만
    best = 0
    for order in permutations(ops):  # 우선순위를 정하는 모든 순서(앞이 높음)
        work = tokens[:]
        for op in order:  # 우선순위가 높은 연산자부터 한 종류씩
            stack = []
            i = 0
            while i < len(work):
                if work[i] == op:  # 이 연산자를 만나면 앞의 값과 뒤의 값을 계산해 합칩니다
                    stack.append(calc(int(stack.pop()), op, int(work[i + 1])))
                    i += 2
                else:
                    stack.append(work[i])
                    i += 1
            work = stack
        best = max(best, abs(int(work[0])))  # 절댓값이 가장 큰 결과
    return best`,
  javascript: `const calc = (a, op, b) => (op === "+" ? a + b : op === "-" ? a - b : a * b);

function solution(expression) {
  const tokens = expression.split(/([-+*])/); // 숫자와 연산자로 나눕니다
  const ops = ["+", "-", "*"].filter((op) => expression.includes(op)); // 식에 들어 있는 연산자만
  const orders = [];
  const perm = (p) => {
    if (p.length === ops.length) orders.push(p);
    else for (const op of ops) if (!p.includes(op)) perm([...p, op]);
  };
  perm([]); // 우선순위를 정하는 모든 순서(앞이 높음)

  let best = 0;
  for (const order of orders) {
    let work = [...tokens];
    for (const op of order) { // 우선순위가 높은 연산자부터 한 종류씩
      const stack = [];
      for (let i = 0; i < work.length; i++) {
        if (work[i] === op) { // 이 연산자를 만나면 앞의 값과 뒤의 값을 계산해 합칩니다
          stack.push(calc(Number(stack.pop()), op, Number(work[i + 1])));
          i++;
        } else stack.push(work[i]);
      }
      work = stack;
    }
    best = Math.max(best, Math.abs(Number(work[0]))); // 절댓값이 가장 큰 결과
  }
  return best;
}`,
};
const CL_AT = {
  start: lines(BEST_CODE, ['tokens = re.split', 'best = 0'], ['const tokens = expression.split', 'let best = 0']),
  order: lines(BEST_CODE, ['for order in permutations(ops):', 'work = tokens[:]'], ['for (const order of orders)', 'let work = [...tokens]']),
  pass: lines(BEST_CODE, ['for op in order:', 'if work[i] == op:', 'stack.append(calc(int(stack.pop())', 'work = stack'], ['for (const op of order)', 'if (work[i] === op)', 'stack.push(calc(Number(stack.pop())', 'work = stack']),
  compare: lines(BEST_CODE, ['best = max(best, abs(int(work[0])))'], ['best = Math.max(best, Math.abs(Number(work[0])))']),
  done: lines(BEST_CODE, ['return best'], ['return best']),
};

const SPLIT_CODE = {
  python: `${CALC_PY}
def solution(expression):
    tokens = re.split(r"([-+*])", expression)  # 숫자와 연산자로 나눕니다
    ops = [op for op in "+-*" if op in expression]
    best = 0

    def evaluate(part, low_first):
        # part에 우선순위가 가장 낮은 연산자가 있으면 거기서 쪼개 각 조각을 먼저 계산합니다
        if len(part) == 1:
            return int(part[0])
        op, rest = low_first[0], low_first[1:]
        pieces = [[]]
        for token in part:
            if token == op:
                pieces.append([])
            else:
                pieces[-1].append(token)
        values = [evaluate(piece, rest) for piece in pieces]
        # 조각의 값들을 왼쪽부터 op로 합칩니다
        result = values[0]
        for value in values[1:]:
            result = calc(result, op, value)
        return result

    for order in permutations(ops):  # 우선순위를 정하는 모든 순서(앞이 높음)
        low_first = list(reversed(order))  # 쪼갤 때는 우선순위가 낮은 연산자부터
        best = max(best, abs(evaluate(tokens, low_first)))
    return best`,
  javascript: `const calc = (a, op, b) => (op === "+" ? a + b : op === "-" ? a - b : a * b);

function solution(expression) {
  const tokens = expression.split(/([-+*])/); // 숫자와 연산자로 나눕니다
  const ops = ["+", "-", "*"].filter((op) => expression.includes(op));
  const orders = [];
  const perm = (p) => {
    if (p.length === ops.length) orders.push(p);
    else for (const op of ops) if (!p.includes(op)) perm([...p, op]);
  };
  perm([]);

  // part에 우선순위가 가장 낮은 연산자가 있으면 거기서 쪼개 각 조각을 먼저 계산합니다
  const evaluate = (part, lowFirst) => {
    if (part.length === 1) return Number(part[0]);
    const [op, ...rest] = lowFirst;
    const pieces = [[]];
    for (const token of part) {
      if (token === op) pieces.push([]);
      else pieces.at(-1).push(token);
    }
    const values = pieces.map((piece) => evaluate(piece, rest));
    // 조각의 값들을 왼쪽부터 op로 합칩니다
    return values.reduce((result, value) => calc(result, op, value));
  };

  let best = 0;
  for (const order of orders) { // 우선순위를 정하는 모든 순서(앞이 높음)
    const lowFirst = [...order].reverse(); // 쪼갤 때는 우선순위가 낮은 연산자부터
    best = Math.max(best, Math.abs(evaluate(tokens, lowFirst)));
  }
  return best;
}`,
};
const SP_AT = {
  start: lines(SPLIT_CODE, ['tokens = re.split', 'best = 0'], ['const tokens = expression.split', 'let best = 0']),
  order: lines(SPLIT_CODE, ['for order in permutations(ops):', 'low_first = list(reversed(order))'], ['for (const order of orders)', 'const lowFirst = [...order].reverse()']),
  split: lines(SPLIT_CODE, ['op, rest = low_first[0], low_first[1:]', 'if token == op:', 'pieces.append([])'], ['const [op, ...rest] = lowFirst', 'if (token === op) pieces.push([])']),
  merge: lines(SPLIT_CODE, ['values = [evaluate(piece, rest) for piece in pieces]', 'result = calc(result, op, value)'], ['const values = pieces.map', 'values.reduce((result, value) => calc(result, op, value))']),
  compare: lines(SPLIT_CODE, ['best = max(best, abs(evaluate(tokens, low_first)))'], ['best = Math.max(best, Math.abs(evaluate(tokens, lowFirst)))']),
  done: lines(SPLIT_CODE, ['return best'], ['return best']),
};

const MATH_CODE = {
  python: `import re

# 주의: 연산자 우선순위를 수학에서 쓰는 한 가지(곱셈 먼저)로 고정하는 오답 풀이입니다
def solution(expression):
    tokens = re.split(r"([-+*])", expression)
    stack = []
    i = 0
    while i < len(tokens):  # 곱셈을 먼저 계산해 합칩니다
        if tokens[i] == "*":
            stack.append(int(stack.pop()) * int(tokens[i + 1]))
            i += 2
        else:
            stack.append(tokens[i])
            i += 1
    result = int(stack[0])
    for k in range(1, len(stack), 2):  # 덧셈과 뺄셈은 왼쪽부터
        value = int(stack[k + 1])
        result = result + value if stack[k] == "+" else result - value
    return abs(result)`,
  javascript: `// 주의: 연산자 우선순위를 수학에서 쓰는 한 가지(곱셈 먼저)로 고정하는 오답 풀이입니다
function solution(expression) {
  const tokens = expression.split(/([-+*])/);
  const stack = [];
  for (let i = 0; i < tokens.length; i++) { // 곱셈을 먼저 계산해 합칩니다
    if (tokens[i] === "*") {
      stack.push(Number(stack.pop()) * Number(tokens[i + 1]));
      i++;
    } else stack.push(tokens[i]);
  }
  let result = Number(stack[0]);
  for (let k = 1; k < stack.length; k += 2) { // 덧셈과 뺄셈은 왼쪽부터
    const value = Number(stack[k + 1]);
    result = stack[k] === "+" ? result + value : result - value;
  }
  return Math.abs(result);
}`,
};
const MT_AT = {
  start: lines(MATH_CODE, ['tokens = re.split', 'stack = []'], ['const tokens = expression.split', 'const stack = []']),
  times: lines(MATH_CODE, ['while i < len(tokens):', 'if tokens[i] == "*":', 'stack.append(int(stack.pop()) * int(tokens[i + 1])'], ['for (let i = 0; i < tokens.length; i++)', 'if (tokens[i] === "*")', 'stack.push(Number(stack.pop()) * Number(tokens[i + 1]))']),
  rest: lines(MATH_CODE, ['result = int(stack[0])', 'for k in range(1, len(stack), 2):', 'result = result + value if stack[k]'], ['let result = Number(stack[0])', 'for (let k = 1; k < stack.length; k += 2)', 'result = stack[k] === "+"']),
  done: lines(MATH_CODE, ['return abs(result)'], ['return Math.abs(result)']),
};

/* ------------------------------------------------------------------ */
/* 장면: 위에 우선순위 순열 나무, 아래에 계산 줄 넷과 계수기                    */
/* ------------------------------------------------------------------ */

// 나무: 칸 54×40, 깊이마다 58px. 깊이 1이 가장 높은 우선순위, 깊이 3(잎)이 가장 낮은 우선순위.
// 세로: 안내 글 0~16, 나무 26~240, 잎 결과 글 244~260, 계산 줄 272~350(줄마다 20px), 계수기 366~396. 가로: 잎 여섯이 12~386.
const W = 420;
const H = 404;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다
const TREE = { x: 12, y: 26, w: 54, h: 40, gapX: 10, gapY: 18 };
const key = (prefix: string[]) => `n:${prefix.join('')}`;
const ROOT: Shape = { id: key([]), kids: [] };
{
  const by = new Map<string, Shape>([[ROOT.id, ROOT]]);
  for (const o of ORDERS) {
    for (let d = 1; d <= o.length; d++) {
      const prefix = o.slice(0, d);
      if (by.has(key(prefix))) continue;
      const shape: Shape = { id: key(prefix), kids: [] };
      by.get(key(prefix.slice(0, -1)))!.kids!.push(shape);
      by.set(shape.id, shape);
    }
  }
}
const RECTS = layoutTree(ROOT, TREE);
const nodeRect = (prefix: string[]) => RECTS.get(key(prefix))!;
const lineRect = (k: number): Rect => ({ x: 12, y: 272 + k * 20, w: 396, h: 20 });
const tokenAt = (id: string, x: number, w: number, text: string, t: Tone): Item => ({ id, kind: 'token', rect: { x, y: 366, w, h: 30 }, tone: t, text });
const calcLines = (first: string): Item[] =>
  [0, 1, 2, 3].map((k): Item => ({ id: `ln:${k}`, kind: 'text', rect: lineRect(k), tone: k ? undefined : 'muted', text: k ? '' : first }));

function treeBoard(title: string): Scene {
  return {
    width: W,
    height: H,
    items: [
      { id: 'title', kind: 'text', rect: { x: 12, y: 0, w: 396, h: 16 }, tone: 'muted', text: title },
      { id: key([]), kind: 'cell', rect: nodeRect([]), tone: 'visited', text: '시작' },
      ...calcLines(show(TOKENS)),
      tokenAt('t:val', 12, 170, '이번 결과 -', 'plain'),
      tokenAt('t:best', 190, 218, '절댓값의 최댓값 0', 'chosen'),
    ],
  };
}
const orderText = (order: string[]) => order.map(sym).join(' > ');
const valueTo = (v: number) => set('t:val', { text: `이번 결과 ${num(v)}` }, true);

// 이번 우선순위의 길을 나무에 그린다(없던 칸만 새로 만든다)
const pathAdd = (rec: StepRecorder, order: string[]): Action[] =>
  order.flatMap((o, d): Action[] => {
    const prefix = order.slice(0, d + 1);
    if (rec.has(key(prefix))) return [];
    const parent = prefix.slice(0, -1);
    return [
      { type: 'add', item: { id: key(prefix), kind: 'cell', rect: nodeRect(prefix), tone: 'visited', text: sym(o), tag: `${d + 1}순위` }, from: key(parent) },
      { type: 'add', item: { id: `e:${key(prefix)}`, kind: 'line', rect: FULL, tone: 'trail', points: branch(nodeRect(parent), nodeRect(prefix)) } },
    ];
  });

function orders(split: boolean): Visualization {
  const rec = new StepRecorder(treeBoard(split ? '우선순위 순열마다 식을 쪼개 계산합니다' : '우선순위 순열마다 높은 연산자부터 합쳐 계산합니다'));
  const AT = split ? SP_AT : CL_AT;
  let best = 0;
  let bestOrder = -1;
  let work = 0;
  let cur: Run | undefined;
  const meta = (): Meta => ({
    work,
    variables: { order: cur ? `(${cur.order.map(sym).join(', ')})` : '-', ...(cur ? { 'work[0]': cur.value } : {}), best },
  });

  rec.step({ title: `연산자 ${OPS.length}개의 우선순위 ${ORDERS.length}가지`, codeHighlights: AT.start, ...meta() });
  rec.phase('시작', `식에 ${OPS.map(sym).join(', ')} 세 연산자가 있어 우선순위를 정하는 방법은 ${OPS.length}! = ${ORDERS.length}가지입니다. 방법마다 계산해서 결과의 절댓값이 가장 큰 것을 고릅니다.`, AT.start);
  rec.do(wait(300));

  RUNS.forEach((run, idx) => {
    const abs = Math.abs(run.value);
    const better = abs > best;
    const [pb] = [best];
    cur = run;
    work += run.ops;
    if (better) best = abs;
    rec.step({ title: `우선순위 ${orderText(run.order)} → ${num(run.value)}${better ? ' (새 최댓값)' : ''}`, codeHighlights: AT.compare, ...meta() });

    rec.phase('우선순위 정하기', `우선순위를 ${orderText(run.order)} 순서로 정합니다(앞이 높음).`, AT.order);
    rec.do(...together([...pathAdd(rec, run.order), ...[1, 2, 3].map((k) => set(`ln:${k}`, { text: '' })), set('ln:0', { text: show(TOKENS) }), set('t:val', { text: '이번 결과 -' })]));

    if (split) {
      const lowFirst = [...run.order].reverse();
      rec.phase('쪼개기', `낮은 ${lowFirst.map(sym).join(', ')} 순서로 식을 쪼개 괄호로 묶습니다.`, SP_AT.split);
      rec.do(set('ln:1', { text: splitText(TOKENS, lowFirst, 0) }));
      rec.phase('합치기', `안쪽 조각부터 합치면 ${num(run.value)}입니다. 연산은 ${run.ops}번입니다.`, SP_AT.merge);
      rec.do(...together([set('ln:2', { text: `안쪽부터 계산 → ${num(run.value)}` }), valueTo(run.value)]));
    } else {
      run.passes.forEach((p, k) => {
        rec.phase('계산하기', `${sym(p.op)} 계산: ${p.calcs.join(', ')}`, CL_AT.pass);
        rec.do(set(`ln:${k + 1}`, { text: p.line }));
      });
      rec.do(valueTo(run.value));
    }

    rec.phase('비교하기', better
      ? `결과 ${num(run.value)}의 절댓값 ${josa(abs, '이', '가')} 지금까지의 최댓값 ${pb}보다 커서 새 최댓값입니다.`
      : `결과 ${num(run.value)}의 절댓값 ${josa(abs, '은', '는')} 최댓값 ${josa(pb, '을', '를')} 넘지 못합니다.`, AT.compare);
    const leafId = key(run.order);
    rec.do(...together([
      { type: 'add', item: { id: `r:${idx}`, kind: 'text', rect: { x: nodeRect(run.order).x, y: nodeRect(run.order).y + TREE.h + 4, w: TREE.w, h: 16 }, text: num(run.value) } },
      ...(better ? [set('t:best', { text: `절댓값의 최댓값 ${best}` }, true), tone(leafId, 'good', true), ...(bestOrder >= 0 ? [tone(key(RUNS[bestOrder].order), 'visited')] : [])] : [tone(leafId, 'explored')]),
    ]));
    if (better) bestOrder = idx;
  });

  cur = BEST_RUN;
  rec.step({ title: `최댓값 ${best}`, codeHighlights: AT.done, ...meta(), answer: best, isKeyframe: true });
  rec.phase('결과', `우선순위 ${ORDERS.length}가지를 모두 계산해 절댓값이 가장 큰 ${josa(best, '을', '를')} 찾았습니다. ${orderText(BEST_RUN.order)} 순서일 때이고, 수학에서 쓰는 곱셈 먼저의 ${Math.abs(MATH.value)}보다 큽니다.`, AT.done);
  rec.do(...together([tone(key(BEST_RUN.order), 'path', true), set('t:best', { tone: 'path' }, true), set('ln:3', { text: `답 ${best}` })]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: 곱셈 먼저 → 덧셈·뺄셈은 왼쪽부터 → 비교하기                        */
/* ------------------------------------------------------------------ */

function mathOrder(): Visualization {
  const rec = new StepRecorder({
    width: W,
    height: 250,
    items: [
      { id: 'title', kind: 'text', rect: { x: 12, y: 0, w: 396, h: 16 }, tone: 'muted', text: '우선순위를 수학처럼 곱셈 먼저로 고정합니다' },
      ...calcLines(show(TOKENS)).map((it, k) => ({ ...it, rect: { ...it.rect, y: 30 + k * 28, h: 24 } })),
      { id: 't:val', kind: 'token', rect: { x: 12, y: 150, w: 170, h: 30 }, tone: 'plain', text: '이번 결과 -' },
      { id: 't:best', kind: 'token', rect: { x: 190, y: 150, w: 218, h: 30 }, tone: 'chosen', text: '내 답 -' },
    ],
  });
  let work = 0;
  let value: number | undefined;
  const meta = (): Meta => ({ work, variables: { result: value ?? '-' } });

  rec.step({ title: '곱셈 먼저 계산', codeHighlights: MT_AT.times, ...meta() });
  work = MATH.times.ops;
  rec.phase('계산하기', `곱셈을 먼저 계산합니다. ${MATH.times.passes[0].calcs.join(', ')}`, MT_AT.times);
  rec.do(set('ln:1', { text: MATH.rest }));

  work = MATH.ops;
  value = MATH.value;
  rec.step({ title: `덧셈·뺄셈은 왼쪽부터 → ${num(MATH.value)}`, codeHighlights: MT_AT.rest, ...meta() });
  rec.phase('계산하기', `덧셈·뺄셈은 같은 순위라 왼쪽부터: ${MATH.steps.join(', ')}`, MT_AT.rest);
  rec.do(set('ln:2', { text: `왼쪽부터 → ${num(MATH.value)}` }), set('t:val', { text: `이번 결과 ${num(MATH.value)}` }, true));

  const mine = Math.abs(MATH.value);
  rec.step({ title: `${mine} — 정답은 ${BEST}`, codeHighlights: MT_AT.done, ...meta(), answer: mine, isKeyframe: true });
  rec.phase('비교하기', `절댓값 ${josa(mine, '을', '를')} 돌려줍니다. 하지만 ${orderText(BEST_RUN.order)} 순서로 계산하면 ${num(BEST_RUN.value)}이고 절댓값은 ${BEST}입니다. 곱셈이 늘 먼저가 아니라, 우선순위를 바꿔 모두 계산해 봐야 합니다.`, MT_AT.done);
  rec.do(...together([set('t:best', { text: `내 답 ${mine}`, tone: 'bad' }, true), set('t:val', { tone: 'bad' }), set('ln:3', { text: `정답 ${BEST} (${orderText(BEST_RUN.order)})` })]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'maximize-expression',
  title: '수식 최대화',
  level: 2,
  category: 'brute-force',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/67257',
  description: {
    summary:
      '숫자와 연산자 +, -, *로만 이루어진 수식이 주어집니다. 연산자의 우선순위를 마음대로 정할 수 있고, 연산자마다 우선순위는 모두 달라야 합니다(같은 연산자끼리는 왼쪽이 먼저). 우선순위를 정해 수식을 계산했을 때 나오는 결과의 절댓값이 가장 커지는 경우를 찾아 그 값을 구합니다.',
    rules: [
      'expression은 길이 3 이상 100 이하의 문자열이고, 공백과 괄호는 없음',
      '피연산자는 0 이상 999 이하의 정수이고, 연산자는 +, -, * 가운데 하나 이상 포함',
      '어떤 우선순위로 계산해도 중간 결과와 최종 결과의 절댓값은 2^63 − 1 이하',
    ],
    examples: [
      { input: 'expression = "100-200*300-500+20"', output: '60420' },
      { input: 'expression = "50*6-3*2"', output: '300' },
    ],
  },
  keyIntuitions: [
    '연산자 종류는 최대 3개라 우선순위를 정하는 방법은 3! = 6가지뿐입니다. 모든 순서를 정해 계산해 보는 완전탐색이 가능합니다.',
    '우선순위가 높은 연산자부터 한 종류씩, 식에서 왼쪽부터 만나는 대로 앞뒤 값을 계산해 하나로 합쳐 가면 됩니다. 같은 연산자끼리는 왼쪽이 먼저입니다.',
    '식에 없는 연산자는 순열에 넣을 필요가 없고, 결과는 음수일 수 있으니 절댓값으로 비교합니다. 곱셈을 먼저 하는 수학 규칙이 늘 최선은 아닙니다.',
  ],
  demo: { input: [EXPR], label: 'expression = "100-200*300-500+20"' },
  workUnit: '연산을 계산한 횟수',
  approaches: [
    {
      id: 'expression-permutations',
      name: '우선순위 순열마다 높은 연산자부터 합쳐 계산',
      rank: 'BEST',
      timeComplexity: 'O(3! × L)',
      spaceComplexity: 'O(L)',
      verdict: '식의 연산자로 만들 수 있는 우선순위 순서를 모두 정하고, 순서마다 높은 연산자부터 앞뒤 값을 합쳐 계산해 절댓값이 가장 큰 결과를 고릅니다.',
      pros: [
        '우선순위가 정해지면 한 종류씩 왼쪽에서 오른쪽으로 합치기만 하면 되어 계산이 단순합니다.',
        '식에 들어 있는 연산자만 순열로 만들어 쓸데없는 순서를 피합니다.',
        '순서가 6가지뿐이라 식 길이가 100이어도 아주 빠릅니다.',
      ],
      cons: [
        '문자열을 숫자와 연산자로 정확히 나누는 부분(정규식 split)에서 실수하기 쉽습니다.',
        '같은 연산자끼리는 왼쪽부터 계산하는 규칙과 음수 결과의 절댓값을 놓치면 틀립니다.',
      ],
      whyThisRank: '우선순위 순열 6가지를 모두 계산하는 가장 직관적인 풀이입니다. 계산이 반복문 하나로 끝나 코드가 짧고 실수할 곳이 적습니다.',
      code: BEST_CODE,
      visualize: () => orders(false),
    },
    {
      id: 'expression-split',
      name: '우선순위 순열마다 식을 쪼개 재귀로 계산',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(3! × L)',
      spaceComplexity: 'O(L)',
      verdict: '같은 우선순위 순열에서, 우선순위가 가장 낮은 연산자로 식을 쪼개 조각마다 재귀로 계산한 뒤 왼쪽부터 합칩니다.',
      pros: ['식을 쪼개는 방식이라 괄호를 친 것처럼 계산 구조가 눈에 보입니다.', '연산자가 더 늘어나도 같은 재귀로 처리됩니다.'],
      cons: [
        '재귀와 조각 리스트를 함께 다뤄야 해서 정석보다 읽기 어렵습니다.',
        '계산 횟수는 정석과 같아서 빨라지는 것은 없습니다.',
      ],
      whyThisRank: '연산 횟수는 정석과 같고 재귀 구조만 더 복잡합니다. 같은 순열 완전탐색이지만 시험장에서는 한 종류씩 합치는 쪽이 쓰기 쉽습니다.',
      code: SPLIT_CODE,
      visualize: () => orders(true),
    },
    {
      id: 'expression-math-order',
      name: '수학 우선순위(곱셈 먼저) 하나로 계산',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(L)',
      spaceComplexity: 'O(L)',
      verdict: '곱셈을 먼저 하고 덧셈·뺄셈은 왼쪽부터 계산하는 한 가지 방법만 써서, 더 큰 결과를 놓치는 오답 풀이입니다.',
      pros: ['순서를 정할 필요 없이 한 번만 계산해 가장 빠릅니다.', '연산자가 한 종류뿐인 입력에서는 맞습니다.'],
      cons: [
        `시각화 입력에서 곱셈 먼저는 ${Math.abs(MATH.value)}이지만, ${orderText(BEST_RUN.order)} 순서로 계산하면 ${ro(BEST)} 더 큽니다.`,
        '연산자가 한 종류뿐이라 우선순위를 고를 필요가 없는 입력(예: "2*3*4")은 맞아서, 직접 예제로 확인하기 전까지 틀린 줄 모를 수 있습니다.',
      ],
      whyThisRank: '문제는 우선순위를 마음대로 정할 수 있다고 했습니다. 곱셈 먼저는 가능한 6가지 중 하나일 뿐이라, 모든 순서를 계산해 절댓값이 가장 큰 것을 골라야 합니다.',
      code: MATH_CODE,
      visualize: mathOrder,
    },
  ],
  checks: {
    cases: [
      { args: ['100-200*300-500+20'], expected: 60420 },
      { args: ['50*6-3*2'], expected: 300 },
      { args: ['1+1'], expected: 2 },
      { args: ['10-5'], expected: 5 },
      { args: ['1-2-3'], expected: 4 },
      { args: ['2*3+4'], expected: 14 },
      { args: ['9*9-9'], expected: 72 },
      { args: ['999*999*999'], expected: 997002999 },
      { args: [EXPR], expected: 60420 },
    ],
    // 숫자 2~5개(0~99)와 무작위 연산자
    random: (rand) => {
      const count = 2 + Math.floor(rand() * 4);
      let expression = String(Math.floor(rand() * 100));
      for (let i = 1; i < count; i++) expression += '+-*'[Math.floor(rand() * 3)] + Math.floor(rand() * 100);
      return [expression];
    },
  },
};

export default problem;
