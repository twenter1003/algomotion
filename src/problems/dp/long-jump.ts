// 멀리 뛰기: 정석 앞의 두 칸을 더하는 표 채우기, 대안 변수 두 개 굴리기, 함정 메모 없는 재귀를 같은 장면 꾸러미로 움직인다.
// 정석·대안은 칸 줄(i칸의 방법 수), 함정은 호출 나무(칸 하나 = 호출 하나)다. 아래쪽은 계산 글 줄이다.
import type { Action, Item, ItemPatch, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

const MOD = 1234567;
const N = 6; // 시각화 입력: 6칸 → 13가지. 정석은 칸 6개를 한 번씩, 함정은 jump를 15번 부른다
const WAYS = [1, 1]; // WAYS[i] = i칸까지 가는 방법 수 (0칸은 제자리 1가지)
for (let i = 2; i <= N; i++) WAYS.push((WAYS[i - 1] + WAYS[i - 2]) % MOD);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TABLE = {
  python: `def solution(n):
    MOD = 1234567
    dp = [0] * (n + 3)  # dp[i] = i칸까지 가는 방법의 수 (n이 1이어도 dp[2]를 쓸 수 있게 여유 칸)
    dp[1], dp[2] = 1, 2  # 1칸은 (1), 2칸은 (1, 1)과 (2)

    for i in range(3, n + 1):
        # 마지막에 1칸을 뛰고 왔거나, 2칸을 뛰고 왔거나
        dp[i] = (dp[i - 1] + dp[i - 2]) % MOD

    return dp[n]`,
  javascript: `function solution(n) {
  const MOD = 1234567;
  const dp = Array(n + 3).fill(0); // dp[i] = i칸까지 가는 방법의 수 (n이 1이어도 dp[2]를 쓸 수 있게 여유 칸)
  dp[1] = 1; // 1칸은 (1)
  dp[2] = 2; // 2칸은 (1, 1)과 (2)

  for (let i = 3; i <= n; i++) {
    // 마지막에 1칸을 뛰고 왔거나, 2칸을 뛰고 왔거나
    dp[i] = (dp[i - 1] + dp[i - 2]) % MOD;
  }

  return dp[n];
}`,
};
const TABLE_AT = {
  start: lines(TABLE, ['dp = [0]'], ['const dp = Array(']),
  one: lines(TABLE, ['dp[1], dp[2] = 1, 2'], ['dp[1] = 1']),
  two: lines(TABLE, ['dp[1], dp[2] = 1, 2'], ['dp[2] = 2']),
  look: lines(TABLE, ['for i in range(3', 'dp[i] = (dp[i - 1]'], ['for (let i = 3', 'dp[i] = (dp[i - 1]']),
  add: lines(TABLE, ['dp[i] = (dp[i - 1]'], ['dp[i] = (dp[i - 1]']),
  done: lines(TABLE, ['return dp[n]'], ['return dp[n]']),
};

const ROLL = {
  python: `def solution(n):
    MOD = 1234567
    a, b = 1, 1  # a = 0칸(제자리), b = 1칸까지 가는 방법의 수

    for _ in range(n - 1):
        a, b = b, (a + b) % MOD  # 한 칸씩 밀면서 새 값을 b에 둡니다

    return b`,
  javascript: `function solution(n) {
  const MOD = 1234567;
  let a = 1; // 0칸(제자리)까지 가는 방법의 수
  let b = 1; // 1칸까지 가는 방법의 수

  for (let i = 2; i <= n; i++) {
    [a, b] = [b, (a + b) % MOD]; // 한 칸씩 밀면서 새 값을 b에 둡니다
  }

  return b;
}`,
};
const ROLL_AT = {
  start: lines(ROLL, ['a, b = 1, 1'], ['let a = 1', 'let b = 1']),
  look: lines(ROLL, ['for _ in range(n - 1)', 'a, b = b, (a + b)'], ['for (let i = 2', '[a, b] = [b, (a + b)']),
  add: lines(ROLL, ['a, b = b, (a + b)'], ['[a, b] = [b, (a + b)']),
  done: lines(ROLL, ['return b'], ['return b']),
};

const RECURSION = {
  python: `# 주의: n = 2000이면 호출이 10^417번을 넘어 끝나지 않는 풀이입니다
def solution(n):
    MOD = 1234567

    def jump(k):
        if k <= 2:
            return k  # 1칸은 1가지, 2칸은 2가지
        # 메모 없이 두 갈래를 매번 다시 계산 → 지수 시간
        return (jump(k - 1) + jump(k - 2)) % MOD

    return jump(n)`,
  javascript: `// 주의: n = 2000이면 호출이 10^417번을 넘어 끝나지 않는 풀이입니다
function solution(n) {
  const MOD = 1234567;

  const jump = (k) => {
    if (k <= 2) {
      return k; // 1칸은 1가지, 2칸은 2가지
    }
    // 메모 없이 두 갈래를 매번 다시 계산 → 지수 시간
    return (jump(k - 1) + jump(k - 2)) % MOD;
  };

  return jump(n);
}`,
};
const REC_AT = {
  start: lines(RECURSION, ['def jump(k)', 'return jump(n)'], ['const jump = (k)', 'return jump(n)']),
  down: lines(RECURSION, ['if k <= 2', 'return (jump(k - 1)'], ['if (k <= 2)', 'return (jump(k - 1)']),
  leaf: lines(RECURSION, ['if k <= 2', 'return k'], ['if (k <= 2)', 'return k;']),
  merge: lines(RECURSION, ['return (jump(k - 1)'], ['return (jump(k - 1)']),
  done: lines(RECURSION, ['return jump(n)'], ['return jump(n)']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const PITCH = 62; // 칸 54 + 사이 8
const CELL_Y = 16; // 위 16px: 칸 위에 붙는 판정 표시(11px)가 장면 안에 들게 둔 여백
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'clearMarks' }, { type: 'unfocus' }]);
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });
const look = (from: string, to: string, label: string, verdict: 'good' | 'seen' = 'good'): Action => ({ type: 'arrow', from, to, verdict, label });

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

// 정석·대안이 같이 쓰는 칸 줄: first칸부터 N칸까지 칸(글은 방법 수)과 아래 이름표, 계산 글. extra는 대안의 a·b 표시
function row(first: number, calcY: number, extra: Item[] = []): Scene {
  const cells = Array.from({ length: N - first + 1 }, (_, k) => first + k);
  const width = cells.length * PITCH - 8;
  const items: Item[] = cells.flatMap((i): Item[] => [
    { id: `cell:${i}`, kind: 'cell', rect: { x: (i - first) * PITCH, y: CELL_Y, w: 54, h: 54 }, tone: 'plain', text: '' },
    { id: `label:${i}`, kind: 'text', rect: { x: (i - first) * PITCH, y: CELL_Y + 58, w: 54, h: 16 }, tone: 'muted', text: `${i}칸` },
  ]);
  items.push({ id: 'calc', kind: 'text', rect: { x: 0, y: calcY, w: width, h: 28 }, text: '' }, ...extra);
  return { width, height: calcY + 28, items };
}
const cellId = (i: number) => `cell:${i}`;
const setCell = (i: number, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: cellId(i), patch, ...(pop ? { pop } : {}) });
const paint = (i: number, tone: Tone) => setCell(i, { tone });

/* ------------------------------------------------------------------ */
/* 정석 표 채우기: 두 칸 보기 → 더하기                                    */
/* ------------------------------------------------------------------ */

function table(): Visualization {
  const rec = new StepRecorder(row(1, 100));
  let lit: number | undefined; // 노란 칸(바로 전에 채운 칸)
  let done = 0;
  const now = { i: '-' as number | string, one: '-' as number | string, two: '-' as number | string, v: '-' as number | string };
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({ work: done, variables: { i: now.i, 'dp[i - 1]': now.one, 'dp[i - 2]': now.two, 'dp[i]': now.v } });
  const settle = (): Action[] => (lit ? [paint(lit, 'visited')] : []);
  const fill = (i: number): Action => setCell(i, { text: String(WAYS[i]), tone: 'current' }, true);

  rec.step({ title: '표 만들기', codeHighlights: TABLE_AT.start, ...meta() });
  rec.phase('시작', `1칸이나 2칸씩 뛰어 ${N}칸까지 가는 방법의 수를 구합니다. i칸까지 가는 방법의 수를 dp[i]에 적습니다.`);
  rec.do(calcTo('i칸까지 가는 방법의 수 = dp[i]'));
  rec.phase('규칙', 'i칸에는 1칸 뛰고 오거나 2칸 뛰고 와서, dp[i] = dp[i − 1] + dp[i − 2]입니다.');
  rec.do(calcTo('dp[i] = dp[i − 1] + dp[i − 2]'));

  const bases = [
    { i: 1, why: '1칸까지는 1칸을 한 번 뛰는 방법뿐입니다.', show: '1칸: (1)', put: 'dp[1]에 1을 적습니다.', at: TABLE_AT.one },
    { i: 2, why: '2칸까지는 1칸씩 두 번, 또는 2칸을 한 번 뛰어 2가지입니다.', show: '2칸: (1, 1) · (2)', put: 'dp[2]에 2를 적습니다.', at: TABLE_AT.two },
  ];
  for (const b of bases) {
    done++;
    now.i = b.i;
    now.one = now.two = '-';
    now.v = WAYS[b.i];
    rec.step({ title: `dp[${b.i}] = ${WAYS[b.i]}`, codeHighlights: b.at, ...meta() });
    rec.phase('기본값', b.why, b.at);
    rec.do(...together([...settle(), paint(b.i, 'chosen'), calcTo(b.show)]));
    rec.phase('적기', b.put, b.at);
    rec.do(fill(b.i), calcTo(`dp[${b.i}] = ${WAYS[b.i]}`));
    lit = b.i;
  }

  for (let i = 3; i <= N; i++) {
    const [one, two] = [WAYS[i - 1], WAYS[i - 2]];
    done++;
    now.i = i;
    now.one = one;
    now.two = two;
    now.v = WAYS[i];
    const formula = `dp[${i - 1}] + dp[${i - 2}] = ${one} + ${two}`;
    rec.step({ title: `dp[${i}] = ${one} + ${two} = ${WAYS[i]}`, codeHighlights: TABLE_AT.add, ...meta() });
    rec.phase('두 칸 보기', `${i}칸에는 ${i - 1}칸에서 1칸 뛰어 오거나(${one}가지) ${i - 2}칸에서 2칸 뛰어 옵니다(${two}가지).`, TABLE_AT.look);
    rec.do(...together([...settle(), paint(i, 'current'), { type: 'focus', ids: [cellId(i), cellId(i - 1), cellId(i - 2)] }, calcTo(formula)]));
    rec.do(look(cellId(i), cellId(i - 1), `${one}가지`), look(cellId(i), cellId(i - 2), `${two}가지`), wait(300));
    rec.phase('더하기', `두 방법은 겹치지 않아 ${one} + ${two} = ${WAYS[i]}가지입니다.`, TABLE_AT.add);
    rec.do(...together([fill(i), calcTo(`${formula} = ${WAYS[i]}`)]), wait(300), ...clear());
    lit = i;
  }

  now.i = N;
  now.one = WAYS[N - 1];
  now.two = WAYS[N - 2];
  rec.step({ title: `답 dp[${N}] = ${WAYS[N]}`, codeHighlights: TABLE_AT.done, ...meta(), answer: WAYS[N], isKeyframe: true });
  rec.phase('답', `${N}칸까지 가는 방법은 ${WAYS[N]}가지입니다. 값이 커지면 더할 때마다 ${MOD}로 나눈 나머지를 적습니다.`);
  rec.do(...together([...settle(), paint(N, 'path'), calcTo(`dp[${N}] = ${WAYS[N]}가지`)]));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 변수 두 개 굴리기: 두 값 보기 → 더하기 → 밀기                      */
/* ------------------------------------------------------------------ */

const TOKEN_Y = CELL_Y + 58 + 16 + 6; // 이름표 아래 a, b 표시 줄
const marker = (id: 'a' | 'b', at: number, value: number): Item => ({ id, kind: 'token', rect: { x: at * PITCH, y: TOKEN_Y, w: 54, h: 28 }, tone: 'chosen', text: `${id}=${value}` });
const markerRect = (at: number): Rect => ({ x: at * PITCH, y: TOKEN_Y, w: 54, h: 28 });

function roll(): Visualization {
  const rec = new StepRecorder(row(0, TOKEN_Y + 28 + 8, [marker('a', 0, 1), marker('b', 1, 1)]));
  let done = 1; // 1칸의 방법 수는 처음부터 알고 있다
  const now = { i: '-' as number | string, a: 1, b: 1 };
  const meta = () => ({ work: done, variables: { i: now.i, a: now.a, b: now.b } });
  const keep = (i: number): Action => setCell(i, { text: String(WAYS[i]), tone: 'visited' });

  rec.step({ title: 'a = 1, b = 1로 시작', codeHighlights: ROLL_AT.start, ...meta() });
  rec.phase('시작', `표 없이 변수 a, b 두 개만 씁니다. a는 한 칸 앞(0칸)의 방법 수, b는 1칸의 방법 수입니다.`);
  rec.do(calcTo('a = 0칸, b = 1칸의 방법 수'));
  rec.phase('규칙', `0칸은 제자리 1가지, 1칸은 1가지입니다. 새 값은 a + b이고 한 칸씩 밀어 갑니다.`);
  rec.do(...together([keep(0), keep(1)]), calcTo('새 값 = a + b, 그 뒤 a ← b, b ← 새 값'));

  for (let i = 2; i <= N; i++) {
    const [a, b] = [WAYS[i - 2], WAYS[i - 1]];
    done++;
    now.i = i;
    [now.a, now.b] = [b, WAYS[i]];
    rec.step({ title: `새 값 ${a} + ${b} = ${WAYS[i]}, 한 칸 밀기`, codeHighlights: ROLL_AT.add, ...meta() });
    rec.phase('두 값 보기', `${i}칸에는 ${i - 1}칸의 b = ${b}가지와 ${i - 2}칸의 a = ${a}가지가 모입니다.`, ROLL_AT.look);
    rec.do(...together([paint(i, 'current'), { type: 'focus', ids: [cellId(i), cellId(i - 1), cellId(i - 2)] }, calcTo(`a + b = ${a} + ${b}`)]));
    rec.do(look(cellId(i), cellId(i - 1), `b=${b}`), look(cellId(i), cellId(i - 2), `a=${a}`), wait(300));
    rec.phase('더하기', `${a} + ${b} = ${WAYS[i]}가지를 ${i}칸에 적습니다.`, ROLL_AT.add);
    rec.do(...together([setCell(i, { text: String(WAYS[i]) }, true), calcTo(`${a} + ${b} = ${WAYS[i]}`)]), wait(300), ...clear());
    rec.phase('밀기', `a는 ${ro(b)}, b는 ${ro(WAYS[i])} 바꾸고 ${i - 2}칸의 값은 더 쓰지 않아 지웁니다.`, ROLL_AT.add);
    rec.do(...together([
      setCell(i - 2, { text: '', tone: 'muted' }),
      { type: 'set', id: 'a', patch: { rect: markerRect(i - 1), text: `a=${b}` } },
      { type: 'set', id: 'b', patch: { rect: markerRect(i), text: `b=${WAYS[i]}` } },
      paint(i, 'visited'),
      calcTo(`a = ${b}, b = ${WAYS[i]}`),
    ]));
  }

  rec.step({ title: `답 b = ${WAYS[N]}`, codeHighlights: ROLL_AT.done, ...meta(), answer: WAYS[N], isKeyframe: true });
  rec.phase('답', `${N}칸까지 가는 방법은 b = ${WAYS[N]}가지입니다. 남은 값은 두 개뿐이라 메모리를 거의 쓰지 않았습니다.`);
  rec.do(...together([paint(N, 'path'), calcTo(`b = ${WAYS[N]}가지`)]));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정 메모 없는 재귀: 내려가기 → 돌려주기 (바닥마다), 값 읽기 → 더하기 (합칠 때마다) */
/* ------------------------------------------------------------------ */

interface Call { id: number; k: number; depth: number; parent: number; kids: number[]; x: number; value: number }
// 함정 코드와 같은 차례(jump(k - 1)을 먼저)로 부르는 호출 나무
const calls: Call[] = [];
const grow = (k: number, depth: number, parent: number): number => {
  const id = calls.length;
  const call: Call = { id, k, depth, parent, kids: [], x: 0, value: k };
  calls.push(call);
  if (k > 2) {
    call.kids = [grow(k - 1, depth + 1, id), grow(k - 2, depth + 1, id)];
    call.value = (calls[call.kids[0]].value + calls[call.kids[1]].value) % MOD;
  }
  return id;
};
grow(N, 0, -1);
let leaves = 0;
calls.filter((c) => !c.kids.length).forEach((c) => (c.x = leaves++ * PITCH));
for (const c of [...calls].reverse()) if (c.kids.length) c.x = (calls[c.kids[0]].x + calls[c.kids[1]].x) / 2;

const LEVEL = 80; // 층 사이: 칸 54 + 선과 판정 표시 26
const TREE_W = (leaves - 1) * PITCH + 54;
const CALC_Y = CELL_Y + Math.max(...calls.map((c) => c.depth)) * LEVEL + 54 + 16;
const FULL: Rect = { x: 0, y: 0, w: TREE_W, h: CALC_Y + 28 };
const nodeId = (c: Call) => `node:${c.id}`;
const nodeRect = (c: Call): Rect => ({ x: c.x, y: CELL_Y + c.depth * LEVEL, w: 54, h: 54 });
const edgeId = (c: Call) => `edge:${c.id}`;
const COUNT = (n: number): string => `호출 ${n}번`;

function recursion(): Visualization {
  const rec = new StepRecorder({
    width: TREE_W,
    height: CALC_Y + 28,
    items: [
      { id: 'calc', kind: 'text', rect: { x: 0, y: CALC_Y, w: TREE_W - 112, h: 28 }, text: '' },
      { id: 'count', kind: 'token', rect: { x: TREE_W - 106, y: CALC_Y, w: 106, h: 28 }, tone: 'chosen', text: COUNT(0) },
    ],
  });
  let total = 0; // 지금까지 부른 jump 수
  let shownK: number | string = '-';
  let shownValue: number | string = '-';
  let lit: Call[] = []; // 이번 단계에서 칠한 노랑·초록 칸(다음 단계 처음에 정리한다)
  const returned = new Set<number>();
  const meta = () => ({ work: total, variables: { k: shownK, '호출 수': total, '돌려준 값': shownValue } });
  const paint = (c: Call, tone: Tone): Action => ({ type: 'set', id: nodeId(c), patch: { tone } });
  const settle = (): Action[] => {
    const acts = lit.map((c) => paint(c, returned.has(c.id) ? 'visited' : 'trail'));
    lit = [];
    return acts;
  };
  const give = (c: Call): Action => ({ type: 'set', id: nodeId(c), patch: { text: String(c.value), tag: `${c.k}칸`, tone: 'good' }, pop: true });
  // 호출: 부른 칸에서 날아와 자리를 잡고, 선이 이어지고, 부르던 칸은 기다리는 칸(trail)이 된다
  const callAction = (c: Call): Action[] => {
    total++;
    const parent = c.parent >= 0 ? calls[c.parent] : undefined;
    const node: Item = { id: nodeId(c), kind: 'cell', rect: nodeRect(c), tone: 'current', text: `${c.k}칸` };
    return together([
      { type: 'add', item: node, ...(parent ? { from: nodeId(parent) } : {}) },
      ...(parent
        ? [
          { type: 'add', item: { id: edgeId(c), kind: 'line', rect: FULL, tone: 'trail', points: [[parent.x + 27, nodeRect(parent).y + 54], [c.x + 27, nodeRect(c).y]] } } as Action,
          paint(parent, 'trail'),
        ]
        : []),
      { type: 'set', id: 'count', patch: { text: COUNT(total) }, pop: true },
    ]);
  };

  const root = calls[0];
  const rootActs = callAction(root); // 부른 횟수는 단계가 끝났을 때의 값이라 미리 센다
  lit = [root];
  shownK = N;
  rec.step({ title: `jump(${N}) 부르기`, codeHighlights: REC_AT.start, ...meta() });
  rec.phase('시작', `jump(k)는 k칸까지 가는 방법의 수입니다. 그림의 칸 하나가 jump 호출 하나입니다.`);
  rec.do(calcTo('jump(k) = jump(k − 1) + jump(k − 2)'));
  rec.phase('호출', `${josa(`jump(${N})`, '을', '를')} 부르면 jump(${N - 1})와 jump(${N - 2})를 또 부릅니다.`, REC_AT.start);
  rec.do(...rootActs);

  // 바닥(2칸 이하)에서 값을 돌려주고, 두 번째 갈래까지 끝난 칸은 차례로 합친다
  type Event = { kind: 'leaf'; fresh: Call[] } | { kind: 'merge'; call: Call };
  const events: Event[] = [];
  let pending: Call[] = [];
  for (const c of calls.slice(1)) {
    pending.push(c);
    if (c.kids.length) continue;
    events.push({ kind: 'leaf', fresh: pending });
    pending = [];
    for (let done = c; done.parent >= 0 && calls[done.parent].kids[1] === done.id; done = calls[done.parent]) events.push({ kind: 'merge', call: calls[done.parent] });
  }

  for (const ev of events) {
    if (ev.kind === 'leaf') {
      const { fresh } = ev;
      const leaf = fresh.at(-1)!;
      const from = calls[fresh[0].parent];
      const chain = fresh.map((c) => `jump(${c.k})`);
      const settling = settle();
      const callActs = fresh.map(callAction); // 부른 횟수는 단계가 끝났을 때의 값이라 미리 센다
      returned.add(leaf.id);
      lit = [leaf];
      shownK = leaf.k;
      shownValue = leaf.value;
      rec.step({ title: `jump(${leaf.k}) 호출 → ${leaf.value}`, codeHighlights: REC_AT.leaf, ...meta() });
      rec.phase('내려가기', fresh.length > 1
        ? `jump(${from.k})에서 ${chain.join(', ')} 순서로 바닥까지 내려갑니다.`
        : `jump(${from.k})에서 이어서 ${josa(chain[0], '을', '를')} 부릅니다.`, REC_AT.down);
      callActs.forEach((acts, d) => rec.do(...(d ? acts : together([...settling, ...acts]))));
      if (fresh.length === 1) rec.do(wait(300));
      rec.phase('돌려주기', `${josa(`jump(${leaf.k})`, '은', '는')} 바닥이라 ${josa(leaf.value, '을', '를')} 그대로 돌려줍니다.`, REC_AT.leaf);
      rec.do(...together([give(leaf), calcTo(`jump(${leaf.k}) = ${leaf.value}`)]));
    } else {
      const c = ev.call;
      const [l, r] = c.kids.map((id) => calls[id]);
      const settling = settle();
      returned.add(c.id);
      lit = [c];
      shownK = c.k;
      shownValue = c.value;
      const formula = `jump(${c.k}) = ${l.value} + ${r.value}`;
      rec.step({ title: `${formula} = ${c.value}`, codeHighlights: REC_AT.merge, ...meta() });
      rec.phase('값 읽기', `${josa(`jump(${c.k})`, '은', '는')} 두 갈래가 돌려준 ${josa(l.value, '과', '와')} ${josa(r.value, '을', '를')} 받습니다.`, REC_AT.merge);
      rec.do(...together([...settling, paint(c, 'current'), { type: 'focus', ids: [nodeId(c), nodeId(l), nodeId(r)] }, calcTo(formula)]));
      rec.do(look(nodeId(c), nodeId(l), String(l.value)), look(nodeId(c), nodeId(r), String(r.value)), wait(300));
      rec.phase('더하기', `${l.value} + ${r.value} = ${c.value}. ${josa(`jump(${c.k})`, '은', '는')} ${josa(c.value, '을', '를')} 돌려줍니다.`, REC_AT.merge);
      rec.do(...together([give(c), calcTo(`${formula} = ${c.value}`)]), wait(300), ...clear());
    }
  }

  // 모두 돌아와 jump(N)이 답을 낸다. 같은 칸을 여러 번 부른 것을 짚고, 최대 입력에서의 호출 수를 알려 준다
  const same = (k: number) => calls.filter((c) => c.k === k);
  const settling = settle();
  shownK = N;
  shownValue = root.value;
  rec.step({ title: `jump(${N}) = ${root.value}`, codeHighlights: REC_AT.done, ...meta(), answer: root.value, isKeyframe: true });
  rec.phase('답 확인', `${josa(`jump(${N})`, '은', '는')} ${root.value}입니다. 하지만 jump를 ${total}번 불렀고, jump(2)만 ${same(2).length}번, jump(1)은 ${same(1).length}번 계산했습니다.`);
  rec.do(...together([...settling, paint(root, 'path'), calcTo(`jump(${N}) = ${root.value}`)]));
  rec.phase('반복 계산', `jump(3)은 ${same(3).length}번이나 같은 계산을 되풀이했습니다.`);
  rec.do(...together(same(3).map((c) => paint(c, 'bad'))), calcTo(`같은 jump(3)을 ${same(3).length}번 계산`));
  rec.phase('최대 입력', `n = 2000이면 호출이 10^417번을 넘어 끝나지 않습니다. 정석은 칸 2000개면 충분합니다.`);
  rec.do(calcTo('n = 2000 → 호출 10^417번 이상'));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'long-jump',
  title: '멀리 뛰기',
  level: 2,
  category: 'dp',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12914',
  description: {
    summary:
      '한 번에 1칸 또는 2칸을 뛸 수 있는 효진이가 맨 끝 n번째 칸에 도착하는 방법이 모두 몇 가지인지 구합니다. 답이 매우 커질 수 있어 1234567로 나눈 나머지를 돌려줍니다.',
    rules: [
      'n은 1 이상 2000 이하의 정수',
      '한 번에 1칸 또는 2칸만 뛸 수 있음',
      '뛰는 순서가 다르면 다른 방법 (예: (1, 2)와 (2, 1))',
      '방법의 수를 1234567로 나눈 나머지를 return',
    ],
    examples: [
      { input: 'n = 4', output: '5' },
      { input: 'n = 3', output: '3' },
    ],
  },
  keyIntuitions: [
    'n칸에 도착하기 바로 전에는 n − 1칸이나 n − 2칸에 있습니다. 그래서 n칸까지의 방법 수는 (n − 1칸까지의 방법 수) + (n − 2칸까지의 방법 수)입니다.',
    '1칸은 1가지, 2칸은 2가지로 시작해 앞의 두 값을 더해 가면 피보나치 수열이 됩니다. 표에 적어 두면 같은 계산을 다시 하지 않습니다.',
    'n이 2000이면 값이 아주 커지므로 더할 때마다 1234567로 나눈 나머지를 적습니다. 나머지끼리 더해서 나눠도 최종 나머지는 같습니다.',
  ],
  demo: { input: [N], label: `n = ${N}` },
  workUnit: '방법 수를 구한 횟수',
  approaches: [
    {
      id: 'jump-table',
      name: '앞의 두 칸을 더하는 표 채우기',
      rank: 'BEST',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      verdict: '1칸과 2칸의 값에서 시작해 앞의 두 칸을 더하며 n칸까지 표를 채우는 풀이입니다.',
      pros: [
        '점화식 dp[i] = dp[i − 1] + dp[i − 2]를 그대로 코드로 옮깁니다.',
        '칸마다 한 번씩만 계산해 n = 2000이어도 2000번이면 끝납니다.',
        '표가 남아 있어 중간 값을 확인하기 쉽고 비슷한 문제로 넓히기 좋습니다.',
      ],
      cons: [
        '값이 빨리 커지므로 더할 때마다 1234567로 나누는 것을 잊으면 안 됩니다.',
        'n이 1일 때도 dp[2]에 쓸 수 있도록 표를 넉넉히 만들어야 합니다.',
      ],
      whyThisRank:
        '점화식을 가장 직접 옮긴 풀이라 읽기 쉽고 실수할 곳이 적습니다. n이 2000까지라 표의 메모리는 부담이 되지 않습니다.',
      code: TABLE,
      visualize: table,
    },
    {
      id: 'jump-two-variables',
      name: '변수 두 개만 굴리기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      verdict: '표 없이 변수 두 개를 한 칸씩 밀며 값을 구해 메모리는 아끼지만, 지난 값을 볼 수 없는 풀이입니다.',
      pros: ['메모리가 O(1)이라 n이 아주 커도 부담이 없습니다.', '코드가 짧습니다.'],
      cons: [
        '앞서 계산한 값이 남지 않아 중간 값을 확인하거나 다른 점화식으로 넓히기 어렵습니다.',
        'a와 b를 한꺼번에 바꿔 쓰지 않으면 값이 꼬이고, 반복 횟수(n − 1)를 헷갈리기 쉽습니다.',
      ],
      whyThisRank:
        'n이 2000까지라 표의 메모리는 아낄 이유가 없습니다. 아낄 것이 없는데 뜻이 덜 드러나서, 표를 채우는 정석이 더 안전합니다.',
      code: ROLL,
      visualize: roll,
    },
    {
      id: 'jump-recursion',
      name: '메모 없는 재귀로 세기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(1.6^n)',
      spaceComplexity: 'O(n) 재귀 깊이',
      verdict: '점화식을 메모 없이 재귀로 옮기면 같은 칸을 수없이 다시 계산해 n = 2000에서는 끝나지 않습니다.',
      pros: ['점화식을 그대로 옮겨 이해하기 쉽습니다.', 'n이 작을 때는 정확한 답을 냅니다.'],
      cons: [
        '호출 수가 피보나치 수열처럼 늘어 n = 2000이면 10^417번이 넘습니다.',
        '재귀 깊이도 n이라 파이썬의 기본 재귀 한도(1000)에도 걸립니다.',
      ],
      whyThisRank:
        '같은 부분 문제가 반복된다는 DP의 신호입니다. 이 재귀에 메모(@lru_cache 등)를 붙이면 칸마다 한 번씩만 계산해 O(n)이 됩니다. 다만 재귀 깊이가 n이라 파이썬은 재귀 한도를 늘려야 합니다.',
      code: RECURSION,
      visualize: recursion,
    },
  ],
  checks: {
    cases: [
      { args: [4], expected: 5 },
      { args: [3], expected: 3 },
      { args: [1], expected: 1 },
      { args: [2], expected: 2 },
      { args: [N], expected: 13 },
      { args: [31], expected: 943742 },
      { args: [2000], expected: 694725 },
    ],
    // 1~14칸: 함정이 호출을 수백 번 해도 순식간이다
    random: (rand) => [1 + Math.floor(rand() * 14)],
  },
};

export default problem;
