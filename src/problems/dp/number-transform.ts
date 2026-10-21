// 숫자 변환하기: 정석 숫자별 최소 연산 횟수 표(앞 숫자 보기), 대안 x에서 넓혀 가는 BFS, 함정 y에서 큰 수로 먼저 나누는 거꾸로 탐욕을 같은 장면에서 움직인다.
// 장면은 숫자 x~y 칸(글은 x에서 그 숫자까지의 최소 연산 횟수, 아래 이름표는 숫자)을 한 줄 5칸씩 두 줄로 놓은 표와 계산 글이다. 대안은 그 아래에 큐 줄을 더 둔다.
import { Lane } from '../../engine/lane.ts';
import type { Action, Item, ItemPatch, Language, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

type Lines = Record<Language, number[]>;

// 시각화 입력: 1에서 10까지, 더하는 수 6. 정석은 숫자 9개를 한 번씩, 함정은 10을 2로 나누다 막혀 -1이라고 답한다(정답은 1 → 2 → 4 → 10으로 3번)
const X = 1;
const Y = 10;
const ADD = 6;
const INF = Infinity;
const show = (d: number) => (d === INF ? '∞' : String(d));

// 정석 표: dp[v] = x를 v로 만드는 최소 연산 횟수(불가능하면 INF)
const preds = (v: number): { kind: 'add' | 'two' | 'three'; from: number }[] => [
  ...(v - ADD >= X ? [{ kind: 'add' as const, from: v - ADD }] : []),
  ...(v % 2 === 0 && v / 2 >= X ? [{ kind: 'two' as const, from: v / 2 }] : []),
  ...(v % 3 === 0 && v / 3 >= X ? [{ kind: 'three' as const, from: v / 3 }] : []),
];
const DP: number[] = Array<number>(Y + 1).fill(INF);
DP[X] = 0;
for (let v = X + 1; v <= Y; v++) DP[v] = Math.min(INF, ...preds(v).map((p) => DP[p.from])) + 1;
const ANSWER = DP[Y] === INF ? -1 : DP[Y];
const ROUTE: number[] = [Y]; // y에서 x까지 연산 횟수가 하나씩 줄어드는 숫자들
for (let v = Y; v !== X; ) {
  v = preds(v).find((p) => DP[p.from] === DP[v] - 1)!.from;
  ROUTE.push(v);
}

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TABLE = {
  python: `def solution(x, y, n):
    INF = float('inf')
    dp = [INF] * (y + 1)  # dp[v] = x를 v로 만드는 최소 연산 횟수 (못 만들면 INF)
    dp[x] = 0

    for v in range(x + 1, y + 1):
        best = INF
        if v - n >= x:
            best = min(best, dp[v - n])  # n을 더해서 왔다
        if v % 2 == 0 and v // 2 >= x:
            best = min(best, dp[v // 2])  # 2를 곱해서 왔다
        if v % 3 == 0 and v // 3 >= x:
            best = min(best, dp[v // 3])  # 3을 곱해서 왔다
        dp[v] = best + 1

    return dp[y] if dp[y] != INF else -1`,
  javascript: `function solution(x, y, n) {
  const dp = Array(y + 1).fill(Infinity); // dp[v] = x를 v로 만드는 최소 연산 횟수 (못 만들면 Infinity)
  dp[x] = 0;

  for (let v = x + 1; v <= y; v++) {
    let best = Infinity;
    if (v - n >= x) {
      best = Math.min(best, dp[v - n]); // n을 더해서 왔다
    }
    if (v % 2 === 0 && v / 2 >= x) {
      best = Math.min(best, dp[v / 2]); // 2를 곱해서 왔다
    }
    if (v % 3 === 0 && v / 3 >= x) {
      best = Math.min(best, dp[v / 3]); // 3을 곱해서 왔다
    }
    dp[v] = best + 1;
  }

  return dp[y] === Infinity ? -1 : dp[y];
}`,
};
const TABLE_AT = {
  start: lines(TABLE, ['dp = [INF] * (y + 1)', 'dp[x] = 0'], ['const dp = Array(y + 1)', 'dp[x] = 0']),
  // 세 조건은 늘 검사하고, 조건이 맞는 줄에서만 min이 돈다
  look: (n: boolean, two: boolean, three: boolean): Lines => lines(
    TABLE,
    ['for v in range(x + 1, y + 1)', 'best = INF', 'if v - n >= x', ...(n ? ['best = min(best, dp[v - n])'] : []), 'if v % 2 == 0', ...(two ? ['best = min(best, dp[v // 2])'] : []), 'if v % 3 == 0', ...(three ? ['best = min(best, dp[v // 3])'] : [])],
    ['for (let v = x + 1', 'let best = Infinity', 'if (v - n >= x)', ...(n ? ['best = Math.min(best, dp[v - n])'] : []), 'if (v % 2 === 0', ...(two ? ['best = Math.min(best, dp[v / 2])'] : []), 'if (v % 3 === 0', ...(three ? ['best = Math.min(best, dp[v / 3])'] : [])],
  ),
  add: lines(TABLE, ['dp[v] = best + 1'], ['dp[v] = best + 1']),
  done: lines(TABLE, ['return dp[y] if'], ['return dp[y] === Infinity']),
};

const BFS = {
  python: `from collections import deque

def solution(x, y, n):
    if x == y:
        return 0
    dist = {x: 0}  # 숫자 → x에서 그 숫자까지의 최소 연산 횟수 (처음 만난 횟수가 최소)
    queue = deque([x])
    while queue:
        v = queue.popleft()
        for nxt in (v + n, v * 2, v * 3):
            if nxt == y:
                return dist[v] + 1
            if nxt < y and nxt not in dist:
                dist[nxt] = dist[v] + 1
                queue.append(nxt)
    return -1`,
  javascript: `function solution(x, y, n) {
  if (x === y) return 0;
  const dist = new Map([[x, 0]]); // 숫자 → x에서 그 숫자까지의 최소 연산 횟수 (처음 만난 횟수가 최소)
  const queue = [x];
  let head = 0; // shift() 대신 머리 인덱스
  while (head < queue.length) {
    const v = queue[head++];
    for (const next of [v + n, v * 2, v * 3]) {
      if (next === y) {
        return dist.get(v) + 1;
      }
      if (next < y && !dist.has(next)) {
        dist.set(next, dist.get(v) + 1);
        queue.push(next);
      }
    }
  }
  return -1;
}`,
};
const BFS_AT = {
  start: lines(BFS, ['dist = {x: 0}', 'queue = deque([x])'], ['const dist = new Map', 'const queue = [x]']),
  pop: lines(BFS, ['while queue', 'v = queue.popleft()'], ['while (head < queue.length)', 'const v = queue[head++]']),
  look: lines(BFS, ['for nxt in (v + n', 'if nxt == y', 'if nxt < y and nxt not in dist'], ['for (const next of', 'if (next === y)', 'if (next < y && !dist.has(next))']),
  push: lines(BFS, ['dist[nxt] = dist[v] + 1', 'queue.append(nxt)'], ['dist.set(next', 'queue.push(next)']),
  found: lines(BFS, ['for nxt in (v + n', 'if nxt == y', 'return dist[v] + 1'], ['for (const next of', 'if (next === y)', 'return dist.get(v) + 1']),
};

const GREEDY = {
  python: `# 주의: 가능하면 큰 수로 먼저 나누며 거꾸로 가는 풀이는 막다른 길에 들어가 오답이 나옵니다
def solution(x, y, n):
    count = 0
    while y > x:
        if y % 3 == 0 and y // 3 >= x:
            y //= 3  # 3으로 나눌 수 있으면 먼저
        elif y % 2 == 0 and y // 2 >= x:
            y //= 2  # 안 되면 2로
        elif y - n >= x:
            y -= n  # 안 되면 n을 빼기
        else:
            return -1  # 어느 쪽도 안 되면 막힙니다
        count += 1
    return count`,
  javascript: `// 주의: 가능하면 큰 수로 먼저 나누며 거꾸로 가는 풀이는 막다른 길에 들어가 오답이 나옵니다
function solution(x, y, n) {
  let count = 0;
  while (y > x) {
    if (y % 3 === 0 && y / 3 >= x) {
      y /= 3; // 3으로 나눌 수 있으면 먼저
    } else if (y % 2 === 0 && y / 2 >= x) {
      y /= 2; // 안 되면 2로
    } else if (y - n >= x) {
      y -= n; // 안 되면 n을 빼기
    } else {
      return -1; // 어느 쪽도 안 되면 막힙니다
    }
    count++;
  }
  return count;
}`,
};
const GREEDY_AT = {
  start: lines(GREEDY, ['count = 0'], ['let count = 0']),
  look: lines(GREEDY, ['while y > x', 'if y % 3 == 0'], ['while (y > x)', 'if (y % 3 === 0']),
  three: lines(GREEDY, ['if y % 3 == 0', 'y //= 3'], ['if (y % 3 === 0', 'y /= 3']),
  two: lines(GREEDY, ['if y % 3 == 0', 'elif y % 2 == 0', 'y //= 2'], ['if (y % 3 === 0', 'else if (y % 2 === 0', 'y /= 2']),
  sub: lines(GREEDY, ['if y % 3 == 0', 'elif y % 2 == 0', 'elif y - n >= x', 'y -= n'], ['if (y % 3 === 0', 'else if (y % 2 === 0', 'else if (y - n >= x)', 'y -= n']),
  stuck: lines(GREEDY, ['if y % 3 == 0', 'elif y % 2 == 0', 'elif y - n >= x', 'return -1'], ['if (y % 3 === 0', 'else if (y % 2 === 0', 'else if (y - n >= x)', 'return -1']),
  count: lines(GREEDY, ['count += 1'], ['count++']),
  done: lines(GREEDY, ['return -1'], ['return -1']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 숫자 x~y를 한 줄 5칸씩 둔다. 칸 위 11px에 붙는 판정 표시가 위 줄의 이름표와 겹치지 않게 줄 사이를 24px 띄운다.
const PER_ROW = 5;
const PITCH = 62;
const Y0 = 14;
const ROW_PITCH = 54 + 4 + 16 + 24;
const W = PER_ROW * PITCH - 8;
const rows = Math.ceil((Y - X + 1) / PER_ROW);
const cellRect = (v: number): Rect => ({ x: ((v - X) % PER_ROW) * PITCH, y: Y0 + Math.floor((v - X) / PER_ROW) * ROW_PITCH, w: 54, h: 54 });
const CALC_Y = Y0 + (rows - 1) * ROW_PITCH + 54 + 4 + 16 + 12;
const cellId = (v: number) => `cell:${v}`;
const wait = (ms: number): Action => ({ type: 'wait', ms });
const set = (v: number, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: cellId(v), patch, ...(pop ? { pop } : {}) });
const paint = (v: number, tone: Tone) => set(v, { tone });
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });
const focus = (...vs: number[]): Action => ({ type: 'focus', ids: vs.map(cellId) });
const clear = (): Action[] => together([{ type: 'clearMarks' }, { type: 'unfocus' }]);
const look = (from: number, to: number, verdict: Verdict, label: string): Action => ({ type: 'arrow', from: cellId(from), to: cellId(to), verdict, label });
const numbers = Array.from({ length: Y - X + 1 }, (_, k) => X + k);

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

// 세 풀이가 같이 쓰는 장면: 숫자 칸 10개(글은 최소 연산 횟수)와 이름표, 계산 글. extra는 대안의 큐 줄, 함정의 결과 표시
function board(initial: (v: number) => { text: string; tone: Tone }, calcWidth: number, height: number, extra: Item[] = []): Scene {
  const items: Item[] = numbers.flatMap((v): Item[] => [
    { id: cellId(v), kind: 'cell', rect: cellRect(v), ...initial(v) },
    { id: `label:${v}`, kind: 'text', rect: { x: cellRect(v).x, y: cellRect(v).y + 58, w: 54, h: 16 }, tone: 'muted', text: String(v) },
  ]);
  items.push({ id: 'calc', kind: 'text', rect: { x: 0, y: CALC_Y, w: calcWidth, h: 28 }, text: '' }, ...extra);
  return { width: W, height, items };
}
const HEIGHT = CALC_Y + 28;

/* ------------------------------------------------------------------ */
/* 정석 최소 연산 표: 앞 숫자 보기 → 정하기                                */
/* ------------------------------------------------------------------ */

const ADD_EUL = josa(ADD, '을', '를'); // 더하는 수 뒤 조사(6을)
const KIND_TEXT = { add: `${ADD_EUL} 더해서`, two: '2를 곱해서', three: '3을 곱해서' } as const;

function table(): Visualization {
  const rec = new StepRecorder(board((v) => (v === X ? { text: '0', tone: 'visited' } : { text: '∞', tone: 'plain' }), W, HEIGHT));
  let lit: number | undefined; // 노란 칸(바로 전에 정한 칸)
  let done = 0;
  const now = { v: '-' as number | string, add: '-' as number | string, two: '-' as number | string, three: '-' as number | string, best: '-' as number | string, dp: '-' as number | string };
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({ work: done, variables: { v: now.v, 'dp[v - n]': now.add, 'dp[v // 2]': now.two, 'dp[v // 3]': now.three, best: now.best, 'dp[v]': now.dp } });
  const settle = (): Action[] => (lit === undefined ? [] : [paint(lit, DP[lit] === INF ? 'wall' : 'visited')]);

  rec.step({ title: `dp[${X}] = 0으로 시작`, codeHighlights: TABLE_AT.start, ...meta() });
  rec.phase('시작', `${X}에 ${ADD_EUL} 더하거나 2나 3을 곱해 ${Y}을 만드는 최소 연산 횟수를 구합니다. dp[v]는 ${josa(X, '을', '를')} v로 만드는 최소 횟수입니다.`);
  rec.do(calcTo('못 만드는 숫자는 ∞'));
  rec.phase('규칙', `${X}은 연산 0번이고 나머지는 ∞로 시작합니다. v는 v − ${ADD}, v ÷ 2, v ÷ 3 중 이어질 수 있는 숫자의 최솟값에 1을 더해 정합니다.`);
  rec.do(calcTo('dp[v] = min(앞 숫자들) + 1'));

  for (let v = X + 1; v <= Y; v++) {
    const ps = preds(v);
    const values = ps.map((p) => DP[p.from]);
    const best = Math.min(INF, ...values);
    const settling = settle();
    done++;
    lit = v;
    const get = (kind: 'add' | 'two' | 'three') => {
      const p = ps.find((q) => q.kind === kind);
      return p ? show(DP[p.from]) : '-';
    };
    Object.assign(now, { v, add: get('add'), two: get('two'), three: get('three'), best: show(best), dp: show(DP[v]) });
    const formula = !ps.length ? '이어질 숫자 없음' : ps.length === 1 ? `${show(values[0])} + 1` : `min(${values.map(show).join(', ')}) + 1`;
    const froms = [...new Set(ps.map((p) => p.from))]; // 같은 숫자에서 두 연산으로 올 수 있으면 화살표는 하나만
    const best1 = froms.find((f) => DP[f] === best);
    const at = TABLE_AT.look(ps.some((p) => p.kind === 'add'), ps.some((p) => p.kind === 'two'), ps.some((p) => p.kind === 'three'));

    rec.step({ title: `dp[${v}] = ${ps.length ? `${formula} = ${show(DP[v])}` : '∞ (만들 수 없음)'}`, codeHighlights: TABLE_AT.add, ...meta() });
    if (!ps.length) {
      rec.phase('앞 숫자 보기', `${v}에서 ${ADD_EUL} 빼면 ${X}보다 작고, 2나 3으로 나누어떨어지지도 않아 이어질 숫자가 없습니다.`, at);
      rec.do(...together([...settling, paint(v, 'current'), focus(v), calcTo(formula)]));
      rec.phase('정하기', `만들 수 없어 ${josa(`dp[${v}]`, '은', '는')} ∞ 그대로입니다.`, TABLE_AT.add);
      rec.do(...together([paint(v, 'wall'), calcTo(`dp[${v}] = ∞`)]), wait(300), { type: 'unfocus' });
      continue;
    }
    rec.phase('앞 숫자 보기', `${josa(v, '은', '는')} ${froms.map((f) => `${f}에서 ${ps.filter((p) => p.from === f).map((p) => KIND_TEXT[p.kind]).join(' 또는 ')}`).join(', ')} 올 수 있습니다. 이어질 숫자의 최솟값은 ${show(best)}입니다.`, at);
    rec.do(...together([...settling, paint(v, 'current'), focus(v, ...froms), calcTo(formula)]));
    rec.do(...froms.map((f): Action => look(v, f, f === best1 ? 'good' : 'seen', show(DP[f]))), wait(300));
    rec.phase('정하기', best === INF
      ? `이어질 숫자가 모두 ∞라 ${josa(`dp[${v}]`, '도', '도')} ∞입니다.`
      : `${show(best)} + 1 = ${DP[v]}이므로 ${josa(`dp[${v}]`, '은', '는')} ${DP[v]}입니다.`, TABLE_AT.add);
    rec.do(...together([set(v, { text: show(DP[v]) }, true), calcTo(`${formula} = ${show(DP[v])}`)]), wait(300), ...clear());
  }

  const settling = settle();
  rec.step({ title: `답 dp[${Y}] = ${ANSWER}`, codeHighlights: TABLE_AT.done, ...meta(), answer: ANSWER, isKeyframe: true });
  rec.phase('답', `dp[${Y}] = ${ANSWER}이라 ${josa(X, '을', '를')} ${ro(Y)} 바꾸는 최소 연산은 ${ANSWER}번입니다. ${ro(ROUTE.slice().reverse().join(' → '))} 이어집니다.`);
  rec.do(...together([...settling, ...ROUTE.map((v) => paint(v, 'path')), calcTo(`${ROUTE.slice().reverse().join(' → ')}: ${ANSWER}번`)]));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 x에서 넓혀 가는 BFS: 꺼내기 → 살피기 → 넣기                          */
/* ------------------------------------------------------------------ */

const QUEUE_Y = CALC_Y + 28 + 12;
const QUEUE_ITEMS: Item[] = [{ id: 'queue-label', kind: 'text', rect: { x: 0, y: QUEUE_Y, w: 44, h: 28 }, tone: 'muted', text: '큐' }];
const tokenId = (v: number) => `q:${v}`;

function bfs(): Visualization {
  const rec = new StepRecorder(board(() => ({ text: '', tone: 'plain' }), W, QUEUE_Y + 28 + 4, QUEUE_ITEMS));
  const queue = new Lane(rec, { id: 'queue', x: 52, y: QUEUE_Y, slotW: 44, slotH: 28, gap: 6, max: 5, foldable: true });
  const dist = new Map<number, number>([[X, 0]]);
  const waiting: number[] = [];
  let work = 0;
  let lit: number | undefined;
  const now = { v: '-' as number | string, d: '-' as number | string };
  const meta = () => ({ work, variables: { v: now.v, 'dist[v]': now.d, queue: `[${waiting.join(', ')}]` } });
  const settle = (): Action[] => (lit === undefined ? [] : [paint(lit, 'visited')]);

  rec.step({ title: `큐에 ${X} 넣고 시작`, codeHighlights: BFS_AT.start, ...meta() });
  rec.phase('시작', `${X}에서 넓혀 가며 ${Y}에 처음 닿는 연산 횟수를 찾습니다. 숫자마다 처음 만난 횟수가 최소라서 먼저 만난 숫자부터 꺼냅니다.`);
  rec.do(calcTo(`연산: +${ADD}, ×2, ×3 · ${Y} 넘으면 건너뜀`));
  rec.phase('넣기', `${josa(X, '을', '를')} 큐에 넣고 연산 횟수 0으로 적습니다.`, BFS_AT.start);
  waiting.push(X);
  rec.do(set(X, { text: '0', tone: 'queued' }, true));
  queue.push({ id: tokenId(X), text: String(X) }, cellId(X));

  let found: { v: number; d: number } | undefined;
  while (waiting.length && !found) {
    const v = waiting.shift()!;
    const d = dist.get(v)!;
    const cands = [...new Set([v + ADD, v * 2, v * 3])]; // 같은 숫자가 두 번 나오면 한 번만 보여 준다
    const settling = settle();
    work++;
    now.v = v;
    now.d = d;
    lit = v;
    // 후보를 차례로 본다: y에 닿으면 거기서 끝, y를 넘으면 건너뜀, 이미 있으면 방문함, 아니면 새 숫자
    const fresh: number[] = [];
    const marks: { n: number; verdict: Verdict; label: string }[] = [];
    for (const next of cands) {
      if (next === Y) {
        found = { v, d };
        marks.push({ n: next, verdict: 'good', label: '도착!' });
        break;
      }
      if (next > Y) continue;
      if (dist.has(next) || fresh.includes(next)) marks.push({ n: next, verdict: 'seen', label: '방문함' });
      else {
        fresh.push(next);
        marks.push({ n: next, verdict: 'new', label: `${d + 1}번` });
      }
    }
    for (const f of fresh) {
      dist.set(f, d + 1);
      waiting.push(f);
    }

    rec.step({ title: found ? `${v}에서 ${Y}에 도착` : `${josa(v, '을', '를')} 꺼내 ${fresh.length ? `${fresh.join(', ')} 넣기` : '넣을 숫자 없음'}`, codeHighlights: found ? BFS_AT.found : fresh.length ? BFS_AT.push : BFS_AT.look, ...meta() });
    rec.phase('꺼내기', v === X ? `큐 맨 앞의 ${josa(v, '을', '를')} 꺼냅니다. 출발 숫자라 연산 0번입니다.` : `큐 맨 앞의 ${josa(v, '을', '를')} 꺼냅니다. ${X}에서 ${v}까지는 ${d}번입니다.`, BFS_AT.pop);
    rec.do(...settling);
    queue.shift(cellId(v));
    rec.do(...together([paint(v, 'current'), calcTo(`${v}: ${d}번`)], true));
    const tail = found ? `${Y}에 닿았습니다!` : cands.some((c) => c > Y) && marks.some((m) => m.verdict === 'seen') ? `${Y}보다 큰 숫자와 이미 있는 숫자는 건너뜁니다.` : cands.some((c) => c > Y) ? `${Y}보다 큰 숫자는 건너뜁니다.` : marks.some((m) => m.verdict === 'seen') ? '이미 있는 숫자는 건너뜁니다.' : '모두 새 숫자입니다.';
    rec.phase('살피기', `${v}에서 만들 수 있는 숫자는 ${cands.join(', ')}입니다. ${tail}`, found ? BFS_AT.found : BFS_AT.look);
    if (marks.length) {
      rec.do(focus(v, ...marks.map((m) => m.n)));
      rec.do(...marks.map((m): Action => look(v, m.n, m.verdict, m.label)));
    } else rec.do(wait(400));
    rec.do(...clear());
    if (!found && fresh.length) {
      rec.phase('넣기', `새 숫자 ${fresh.join(', ')}에 ${d + 1}번을 적고 큐 뒤에 넣습니다.`, BFS_AT.push);
      for (const f of fresh) {
        queue.push({ id: tokenId(f), text: String(f) }, cellId(v));
        rec.do({ ...set(f, { text: String(d + 1), tone: 'queued' }, true), together: true });
      }
    }
  }

  const answer = found ? found.d + 1 : -1;
  const settling = settle();
  rec.step({ title: `답 ${answer}번`, codeHighlights: BFS_AT.found, ...meta(), answer, isKeyframe: true });
  rec.phase('답', `${found!.v}에서 ${ADD_EUL} 더하면 ${Y}입니다. 큐를 먼저 만난 순서로 꺼내서 처음 닿았으니 최소 ${answer}번입니다.`);
  rec.do(...together([...settling, ...ROUTE.map((v) => paint(v, 'path')), set(Y, { text: String(answer) }), calcTo(`${ROUTE.slice().reverse().join(' → ')}: ${answer}번`)]));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정 거꾸로 큰 수로 먼저 나누기: 살펴보기 → 이동 (막히면 막힘)               */
/* ------------------------------------------------------------------ */

const RESULT_Y = CALC_Y + 28 + 8;

function greedy(): Visualization {
  const rec = new StepRecorder(board(() => ({ text: '', tone: 'plain' }), W, RESULT_Y + 28 + 4));
  let work = 0;
  let count = 0;
  let current = Y;
  const meta = () => ({ work, variables: { y: current, count } });

  rec.step({ title: `${Y}에서 거꾸로 가기`, codeHighlights: GREEDY_AT.start, ...meta() });
  rec.phase('시작', `${Y}에서 거꾸로, 3으로 나누어지면 3으로, 아니면 2로, 아니면 ${ADD_EUL} 빼며 ${josa(X, '을', '를')} 찾아갑니다.`);
  rec.do(...together([paint(Y, 'current'), calcTo(`${Y}에서 ${X}까지 거꾸로`)]));
  rec.phase('규칙', '큰 수로 나누는 쪽이 연산 횟수가 가장 적을 것 같아, 가능하면 큰 수로 먼저 나눕니다.', GREEDY_AT.look);
  rec.do(calcTo('3으로 → 2로 → 빼기 순서'));

  // 10 → 5(2로 나눔) → 막힘
  for (let v = Y; v > X; ) {
    const by3 = v % 3 === 0 && v / 3 >= X;
    const by2 = !by3 && v % 2 === 0 && v / 2 >= X;
    const bySub = !by3 && !by2 && v - ADD >= X;
    const next = by3 ? v / 3 : by2 ? v / 2 : v - ADD;
    const op = by3 ? '÷3' : by2 ? '÷2' : `−${ADD}`;
    work++;
    if (by3 || by2 || bySub) count++;
    current = by3 || by2 || bySub ? next : v;

    rec.step({ title: by3 || by2 || bySub ? `${v} ${op} → ${next}` : `${v}에서 막힘`, codeHighlights: by3 ? GREEDY_AT.three : by2 ? GREEDY_AT.two : bySub ? GREEDY_AT.sub : GREEDY_AT.stuck, ...meta() });
    if (!(by3 || by2 || bySub)) {
      rec.phase('살펴보기', `${josa(v, '은', '는')} 3으로도 2로도 나누어지지 않고, ${ADD_EUL} 빼면 ${X}보다 작아집니다.`, GREEDY_AT.stuck);
      rec.do(...together([focus(v), calcTo(`${v}: 갈 곳 없음`)]));
      rec.phase('막힘', `갈 곳이 없어 막혔습니다. ${josa('−1', '을', '를')} 돌려줍니다.`, GREEDY_AT.stuck);
      rec.do(...together([paint(v, 'bad'), calcTo('막힘 → −1')]), wait(300), { type: 'unfocus' });
      break;
    }
    const how = by3 ? '3으로 나누어떨어집니다' : by2 ? '3으로는 안 되고 2로 나누어떨어집니다' : `3으로도 2로도 안 되어 ${ADD_EUL} 뺍니다`;
    rec.phase('살펴보기', `${josa(v, '은', '는')} ${how}.`, by3 ? GREEDY_AT.three : by2 ? GREEDY_AT.two : GREEDY_AT.sub);
    rec.do(...together([focus(v, next), calcTo(`${v} ${op} = ${next}`)]));
    rec.do(look(v, next, 'good', op), wait(300));
    rec.phase('이동', `${ro(next)} 이동합니다. 연산은 ${count}번입니다.`, GREEDY_AT.count);
    rec.do(...together([paint(v, 'bad'), paint(next, 'current'), calcTo(`연산 ${count}번`)]), wait(300), ...clear());
    v = next;
  }

  // 결과: 내 답 −1 옆에 정답 경로(1 → 2 → 4 → 10)를 보여 준다
  const rev = ROUTE.slice().reverse();
  rec.step({ title: `오답 확인: −1, 정답은 ${ANSWER}`, codeHighlights: GREEDY_AT.done, ...meta(), answer: -1, isKeyframe: true });
  rec.phase('오답 확인', `이 풀이는 −1이라고 답합니다. 하지만 ${X}에서 ${Y}까지는 ${ANSWER}번에 만들 수 있습니다.`);
  rec.do(calcTo('내 답 = −1'));
  rec.do({ type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 0, y: RESULT_Y, w: 110, h: 28 }, tone: 'bad', text: '내 답 −1' } });
  rec.phase('놓친 길', `${Y}에서 2로 나누는 대신 ${ADD_EUL} 빼면 ${josa(rev.at(-2)!, '이', '가')} 되고, ${ro(rev.join(' → '))} 이어져 ${ANSWER}번에 만들 수 있었습니다.`);
  rec.do(...together([...rev.map((v, k) => set(v, { text: String(k), tone: 'good' })), calcTo(`정답 = ${rev.join(' → ')}: ${ANSWER}번`)]));
  rec.do({ type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 122, y: RESULT_Y, w: 110, h: 28 }, tone: 'good', text: `정답 ${ANSWER}` } }, wait(300));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

// 점검용: 큰 입력의 기대값을 정석과 같은 식으로 구한다
const minOps = (x: number, y: number, n: number): number => {
  const dp = Array<number>(y + 1).fill(Infinity);
  dp[x] = 0;
  for (let v = x + 1; v <= y; v++) {
    if (v - n >= x) dp[v] = Math.min(dp[v], dp[v - n] + 1);
    if (v % 2 === 0 && v / 2 >= x) dp[v] = Math.min(dp[v], dp[v / 2] + 1);
    if (v % 3 === 0 && v / 3 >= x) dp[v] = Math.min(dp[v], dp[v / 3] + 1);
  }
  return dp[y] === Infinity ? -1 : dp[y];
};

const problem: Problem = {
  id: 'number-transform',
  title: '숫자 변환하기',
  level: 2,
  category: 'dp',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/154538',
  description: {
    summary:
      '자연수 x를 y로 바꾸려고 합니다. x에 n을 더하거나, 2를 곱하거나, 3을 곱하는 세 가지 연산만 쓸 수 있고, x를 y로 만드는 데 필요한 연산 횟수의 최솟값을 구합니다. 만들 수 없으면 -1을 돌려줍니다.',
    rules: [
      '1 ≤ x ≤ y ≤ 1,000,000',
      '1 ≤ n < y',
      '쓸 수 있는 연산은 n 더하기, 2 곱하기, 3 곱하기',
      'x를 y로 만들 수 없으면 -1을 return',
    ],
    examples: [
      { input: 'x = 10, y = 40, n = 5', output: '2' },
      { input: 'x = 10, y = 40, n = 30', output: '1' },
      { input: 'x = 2, y = 5, n = 4', output: '-1' },
    ],
  },
  keyIntuitions: [
    'x에서 v까지의 최소 연산 횟수를 dp[v]로 두면, v는 v − n에서 n을 더해서, v / 2에서 2를 곱해서, v / 3에서 3을 곱해서 올 수 있습니다.',
    'dp[v] = min(dp[v − n], dp[v / 2], dp[v / 3]) + 1이고, 이어질 숫자가 없거나 모두 만들 수 없으면 v도 만들 수 없습니다(무한대).',
    '작은 숫자부터 x ≤ v ≤ y 순서로 채우면 필요한 값이 이미 계산되어 있습니다. 가장 큰 연산으로 먼저 줄여 가는 탐욕은 막다른 길에 빠질 수 있어 정답이 아닙니다.',
  ],
  demo: { input: [X, Y, ADD], label: `x = ${X}, y = ${Y}, n = ${ADD}` },
  workUnit: '확인한 숫자의 수',
  approaches: [
    {
      id: 'transform-table',
      name: '숫자별 최소 연산 횟수 표',
      rank: 'BEST',
      timeComplexity: 'O(y − x)',
      spaceComplexity: 'O(y)',
      verdict: 'x부터 y까지 숫자마다 v − n, v ÷ 2, v ÷ 3에서 온 경우의 최솟값에 1을 더해 표를 채우는 풀이입니다.',
      pros: [
        '숫자마다 세 칸만 보면 되어 y = 1,000,000이어도 100만 칸으로 끝납니다.',
        '못 만드는 숫자를 무한대로 두면 이어지는 숫자도 자연스럽게 만들 수 없게 됩니다.',
        '표가 남아 있어 y뿐 아니라 중간 숫자의 최소 횟수도 바로 알 수 있습니다.',
      ],
      cons: [
        '나누어떨어지는지와 x보다 작아지지 않는지를 숫자마다 확인해야 합니다.',
        '무한대 값에 1을 더해도 무한대로 남는다는 점을 -1로 바꾸는 마지막 처리까지 챙겨야 합니다.',
      ],
      whyThisRank:
        '"어디서 왔는가"만 따지면 되는 가장 단순한 DP입니다. 작은 숫자부터 채워 가면 필요한 값이 이미 계산되어 있어 큐도 방문 표시도 따로 필요 없습니다.',
      code: TABLE,
      visualize: table,
    },
    {
      id: 'transform-bfs',
      name: 'x에서 넓혀 가는 BFS',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(y)',
      spaceComplexity: 'O(y)',
      verdict: 'x에서 연산을 하나씩 적용해 가며 처음 y에 닿는 횟수를 찾는 풀이로, 맞지만 큐와 방문 기록이 더 필요합니다.',
      pros: ['"가장 적은 연산 횟수"를 최단 거리로 보는 가장 직관적인 풀이입니다.', 'y에 처음 닿는 순간 멈출 수 있어 못 가는 숫자가 많으면 빨리 끝나기도 합니다.'],
      cons: [
        '큐와 방문 기록(dist)을 따로 관리해야 하고, y를 넘는 숫자를 걸러 내는 조건을 챙겨야 합니다.',
        '최악에는 y 이하의 거의 모든 숫자를 큐에 넣어 표 채우기와 같은 크기의 메모리를 씁니다.',
      ],
      whyThisRank:
        '맞는 풀이이지만 표를 채우는 DP가 같은 결과를 큐 없이 얻습니다. 시험에서는 코드가 더 짧고 실수할 곳이 적은 DP가 안전합니다.',
      code: BFS,
      visualize: bfs,
    },
    {
      id: 'transform-greedy',
      name: '거꾸로 큰 수로 먼저 나누기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(log y)',
      spaceComplexity: 'O(1)',
      verdict: 'y에서 거꾸로 가며 가능하면 3으로, 아니면 2로, 아니면 n을 빼는 탐욕은 막다른 길에 들어가 오답이 나옵니다.',
      pros: ['코드가 짧고 아주 빠릅니다.', '원문 입출력 예처럼 큰 수로 나누는 쪽이 맞는 경우도 있습니다.'],
      cons: [
        '시각화 입력(x = 1, y = 10, n = 6)에서 10을 2로 나누어 5로 갔다가 막혀 -1을 답하지만, 6을 빼서 4로 가면 3번에 만들 수 있습니다.',
        '지금의 선택이 앞으로 만들 수 있는 길을 막을 수 있는데, 한 번 고른 길은 되돌릴 방법이 없습니다.',
      ],
      whyThisRank:
        '어느 연산이 최소 횟수로 이어질지는 끝까지 가 봐야 압니다. 숫자마다 가능한 모든 앞 숫자의 최솟값을 기억하는 DP(또는 BFS)가 필요합니다.',
      code: GREEDY,
      visualize: greedy,
    },
  ],
  checks: {
    cases: [
      { args: [10, 40, 5], expected: 2 },
      { args: [10, 40, 30], expected: 1 },
      { args: [2, 5, 4], expected: -1 },
      { args: [X, Y, ADD], expected: ANSWER },
      { args: [5, 5, 3], expected: 0 },
      { args: [1, 2, 1], expected: 1 },
      { args: [1, 1000000, 1], expected: minOps(1, 1000000, 1) },
      { args: [2, 1000000, 999999], expected: minOps(2, 1000000, 999999) },
      { args: [3, 999999, 7], expected: minOps(3, 999999, 7) },
    ],
    // x 1~6, y는 x 이상 x + 24 이하(2 이상), n은 1 이상 y 미만
    random: (rand) => {
      const x = 1 + Math.floor(rand() * 6);
      const y = Math.max(2, x + Math.floor(rand() * 25));
      return [x, y, 1 + Math.floor(rand() * (y - 1))];
    },
  },
};

export default problem;
