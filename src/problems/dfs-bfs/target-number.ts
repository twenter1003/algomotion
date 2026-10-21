// 타겟 넘버: 정석 DFS, 대안 BFS, 함정 그리디(target에 가까운 쪽 고르기)를 같은 결정 나무에서 움직인다.
// 장면은 숫자를 쓸 때마다 +/− 두 갈래로 나뉘는 나무(맨 아래 잎이 숫자를 모두 쓴 모습)와 아래 줄의 count·목표 표시다.
// BFS는 위에 큐 줄이 더 있다. 칸의 글은 그 칸까지 쓴 숫자들의 합이다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import type { Action, Item, ItemPatch, Language, Point, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';

type Lines = Record<Language, number[]>;
// d번째 줄의 k번째 칸(왼쪽부터). k를 d자리 이진수로 쓰면 0은 더하기, 1은 빼기 가지다.
interface Node { d: number; k: number }

// 시각화 입력. 더하는 쪽만 고르면 합이 5가 되어 target 3을 지나치지만, 정답은 +1 −1 +3과 −1 +1 +3, 두 가지다.
const NUMBERS = [1, 1, 3];
const TARGET = 3;
const N = NUMBERS.length;
const LEAVES = 2 ** N;
const ROOT: Node = { d: 0, k: 0 };

const key = (n: Node) => `${n.d}:${n.k}`;
const nodeId = (n: Node) => `node:${key(n)}`;
const edgeId = (n: Node) => `edge:${key(n)}`; // 부모에서 이 칸으로 내려오는 가지
const signId = (n: Node) => `sign:${key(n)}`;
const isMinus = (n: Node) => n.k % 2 === 1;
const parent = (n: Node): Node => ({ d: n.d - 1, k: n.k >> 1 });
const children = (n: Node): [Node, Node] => [{ d: n.d + 1, k: n.k * 2 }, { d: n.d + 1, k: n.k * 2 + 1 }];
const pathTo = (n: Node): Node[] => Array.from({ length: n.d + 1 }, (_, d) => ({ d, k: n.k >> (n.d - d) })); // 루트부터 n까지
const moveOf = (n: Node) => (isMinus(n) ? -1 : 1) * NUMBERS[n.d - 1]; // 부모에서 n으로 올 때 쓴 부호 있는 숫자
const sumOf = (n: Node) => pathTo(n).slice(1).reduce((s, p) => s + moveOf(p), 0);
const LEAF_NODES: Node[] = Array.from({ length: LEAVES }, (_, k) => ({ d: N, k }));
const WINNERS = LEAF_NODES.filter((n) => sumOf(n) === TARGET);
const signed = (v: number) => `${v < 0 ? '−' : '+'}${Math.abs(v)}`;
const exprOf = (n: Node) => pathTo(n).slice(1).map((p) => signed(moveOf(p))).join(' ');
const tuple = (n: Node) => `(${n.d}, ${sumOf(n)})`;
const call = (n: Node) => `dfs(${n.d}, ${sumOf(n)})`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const DFS = {
  python: `def solution(numbers, target):
    count = 0

    def dfs(i, total):
        nonlocal count
        if i == len(numbers):  # 숫자를 모두 썼으면 합을 확인
            if total == target:
                count += 1
            return
        dfs(i + 1, total + numbers[i])  # 더하는 가지
        dfs(i + 1, total - numbers[i])  # 빼는 가지

    dfs(0, 0)
    return count`,
  javascript: `function solution(numbers, target) {
  let count = 0;

  const dfs = (i, total) => {
    if (i === numbers.length) { // 숫자를 모두 썼으면 합을 확인
      if (total === target) count++;
      return;
    }
    dfs(i + 1, total + numbers[i]); // 더하는 가지
    dfs(i + 1, total - numbers[i]); // 빼는 가지
  };

  dfs(0, 0);
  return count;
}`,
};
const DFS_AT = {
  start: lines(DFS, ['count = 0', 'dfs(0, 0)'], ['let count = 0', 'dfs(0, 0)']),
  plus: lines(DFS, ['dfs(i + 1, total + numbers[i])'], ['dfs(i + 1, total + numbers[i])']),
  minus: lines(DFS, ['dfs(i + 1, total - numbers[i])'], ['dfs(i + 1, total - numbers[i])']),
  check: lines(DFS, ['if i == len(numbers)', 'if total == target'], ['if (i === numbers.length)', 'if (total === target)']),
  hit: lines(DFS, ['if i == len(numbers)', 'if total == target', 'count += 1'], ['if (i === numbers.length)', 'if (total === target) count++']),
  back: lines(DFS, ['return'], ['return;']),
  done: lines(DFS, ['dfs(0, 0)', 'return count'], ['dfs(0, 0)', 'return count']),
};

const BFS = {
  python: `from collections import deque

def solution(numbers, target):
    queue = deque([(0, 0)])  # (쓴 숫자 수, 지금까지의 합)
    count = 0

    while queue:
        i, total = queue.popleft()
        if i == len(numbers):  # 숫자를 모두 썼으면 합을 확인
            if total == target:
                count += 1
        else:
            queue.append((i + 1, total + numbers[i]))  # 더하는 가지
            queue.append((i + 1, total - numbers[i]))  # 빼는 가지

    return count`,
  javascript: `function solution(numbers, target) {
  const queue = [[0, 0]]; // [쓴 숫자 수, 지금까지의 합]
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  let count = 0;

  while (head < queue.length) {
    const [i, total] = queue[head++];
    if (i === numbers.length) { // 숫자를 모두 썼으면 합을 확인
      if (total === target) count++;
    } else {
      queue.push([i + 1, total + numbers[i]]); // 더하는 가지
      queue.push([i + 1, total - numbers[i]]); // 빼는 가지
    }
  }

  return count;
}`,
};
const BFS_AT = {
  start: lines(BFS, ['queue = deque([(0, 0)])', 'count = 0'], ['const queue = [[0, 0]]', 'let head = 0', 'let count = 0']),
  pop: lines(BFS, ['while queue:', 'i, total = queue.popleft()'], ['while (head < queue.length)', 'const [i, total] = queue[head++]']),
  spread: lines(BFS, ['else:', 'queue.append((i + 1, total + numbers[i]))', 'queue.append((i + 1, total - numbers[i]))'],
    ['} else {', 'queue.push([i + 1, total + numbers[i]])', 'queue.push([i + 1, total - numbers[i]])']),
  push: lines(BFS, ['queue.append((i + 1, total + numbers[i]))', 'queue.append((i + 1, total - numbers[i]))'],
    ['queue.push([i + 1, total + numbers[i]])', 'queue.push([i + 1, total - numbers[i]])']),
  check: lines(BFS, ['if i == len(numbers)', 'if total == target'], ['if (i === numbers.length)', 'if (total === target)']),
  hit: lines(BFS, ['if i == len(numbers)', 'if total == target', 'count += 1'], ['if (i === numbers.length)', 'if (total === target) count++']),
  done: lines(BFS, ['while queue:', 'return count'], ['while (head < queue.length)', 'return count']),
};

const GREEDY = {
  python: `# 주의: 오답이 나오는 풀이입니다 (한 가지 길만 따라갑니다)
def solution(numbers, target):
    total = 0
    for x in numbers:
        # target에 더 가까워지는 쪽 부호를 고릅니다
        if abs(total + x - target) <= abs(total - x - target):
            total += x
        else:
            total -= x
    return 1 if total == target else 0`,
  javascript: `// 주의: 오답이 나오는 풀이입니다 (한 가지 길만 따라갑니다)
function solution(numbers, target) {
  let total = 0;
  for (const x of numbers) {
    // target에 더 가까워지는 쪽 부호를 고릅니다
    if (Math.abs(total + x - target) <= Math.abs(total - x - target)) {
      total += x;
    } else {
      total -= x;
    }
  }
  return total === target ? 1 : 0;
}`,
};
const GREEDY_AT = {
  start: lines(GREEDY, ['total = 0'], ['let total = 0']),
  look: lines(GREEDY, ['for x in numbers', 'if abs(total + x - target)'], ['for (const x of numbers)', 'if (Math.abs(total + x - target)']),
  plus: lines(GREEDY, ['if abs(total + x - target)', 'total += x'], ['if (Math.abs(total + x - target)', 'total += x']),
  minus: lines(GREEDY, ['if abs(total + x - target)', 'else:', 'total -= x'], ['if (Math.abs(total + x - target)', '} else {', 'total -= x']),
  done: lines(GREEDY, ['return 1 if total == target else 0'], ['return total === target ? 1 : 0']),
};

const join = (...hs: Lines[]): Lines => ({
  python: [...new Set(hs.flatMap((h) => h.python))],
  javascript: [...new Set(hs.flatMap((h) => h.javascript))],
});

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 64px은 줄 이름표, 잎 8칸은 x 72부터 62px 간격(칸 54px). 세로: 줄 간격 90px(칸 54px + 가지 36px).
// 맨 아래 잎 줄 밑 34px 띄워 아래 줄(count와, 잎 밑으로 미끄러지는 목표 표시)을 둔다. BFS는 맨 위 48px에 큐 줄이 있다.
const CELL = 54;
const PITCH = 62;
const ROW = 90;
const LEFT = 72;
const W = LEFT + (LEAVES - 1) * PITCH + CELL + 8; // 오른쪽 8px은 맨 오른쪽 잎 위 판정 표시('-5 ≠ 3')가 판 안에 들도록 둔 여백
const LANE: LaneOptions = { id: 'lane', x: 40, y: 5, slotW: 56, slotH: 30, gap: 6, max: LEAVES };

function frame(lane: boolean) {
  const top = lane ? 52 : 4;
  const rect = ({ d, k }: Node): Rect => {
    const span = 2 ** (N - d); // 이 칸 아래에 놓인 잎 수
    return { x: LEFT + PITCH * (k * span + (span - 1) / 2), y: top + d * ROW, w: CELL, h: CELL };
  };
  const bottom = top + N * ROW + CELL + 34;
  return { top, rect, bottom, H: bottom + 30, FULL: { x: 0, y: 0, w: W, h: bottom + 30 } as Rect };
}
type Frame = ReturnType<typeof frame>;
const FLAT = frame(false);
const TALL = frame(true);

const targetRect = (f: Frame, leaf: Node): Rect => ({ x: f.rect(leaf).x, y: f.bottom, w: CELL, h: 30 });

// 세 풀이가 같이 쓰는 장면: 줄 이름표, 가지 선과 부호 글, 빈 칸 15개, (count와) 목표 표시. 칸은 가본 만큼만 글이 채워진다.
function board(f: Frame, o: { lane?: boolean; count?: boolean }): Scene {
  const items: Item[] = [];
  if (o.lane) {
    items.push({ id: 'lane:label', kind: 'text', rect: { x: 0, y: 0, w: 34, h: 40 }, text: '큐' }, { id: 'lane:bg', kind: 'zone', rect: { x: 34, y: 0, w: W - 34, h: 40 } });
  }
  for (let d = 0; d <= N; d++) {
    items.push({ id: `row:${d}`, kind: 'text', rect: { x: 0, y: f.top + d * ROW, w: 64, h: CELL }, text: d ? `${d}번째 ±${NUMBERS[d - 1]}` : '시작' });
  }
  // 가지: 부모 칸 아래 가운데에서 자식 칸 위 가운데로. 부호 글은 선 바깥쪽(위쪽)에 둔다
  for (let d = 1; d <= N; d++) {
    for (let k = 0; k < 2 ** d; k++) {
      const n = { d, k };
      const p = f.rect(parent(n));
      const c = f.rect(n);
      const from: Point = [p.x + CELL / 2, p.y + CELL];
      const to: Point = [c.x + CELL / 2, c.y];
      items.push(
        { id: edgeId(n), kind: 'line', rect: f.FULL, tone: 'trail', points: [from, to] },
        { id: signId(n), kind: 'token', rect: { x: (from[0] + to[0]) / 2 - 13, y: (from[1] + to[1]) / 2 - 10, w: 26, h: 20 }, tone: 'plain', text: signed(moveOf(n)) },
      );
    }
  }
  for (let d = 0; d <= N; d++) {
    for (let k = 0; k < 2 ** d; k++) items.push({ id: nodeId({ d, k }), kind: 'cell', rect: f.rect({ d, k }), tone: 'plain', text: '' });
  }
  if (o.count) items.push({ id: 'count', kind: 'token', rect: { x: 0, y: f.bottom, w: 70, h: 30 }, tone: 'plain', text: 'count 0' });
  items.push({ id: 'target', kind: 'token', rect: targetRect(f, LEAF_NODES[0]), tone: 'chosen', text: `목표 ${TARGET}` });
  return { width: W, height: f.H, items };
}

const set = (n: Node, patch: ItemPatch, pop = false): Extract<Action, { type: 'set' }> => ({ type: 'set', id: nodeId(n), patch, ...(pop ? { pop } : {}) });
const edgeTone = (n: Node, tone: Tone): Action => ({ type: 'set', id: edgeId(n), patch: { tone } });
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => [{ type: 'unfocus' }, { type: 'clearMarks' }];

// 잎 검사: 목표 표시가 그 잎 밑으로 미끄러지고, 잎에서 목표 표시로 화살표를 긋고, 결과대로 잎을 칠한다
function checkLeaf(rec: StepRecorder, f: Frame, leaf: Node, o: { count?: number; miss?: Tone }) {
  const sum = sumOf(leaf);
  const hit = sum === TARGET;
  rec.do(...together([{ type: 'focus', ids: [nodeId(leaf), 'target'] }, { type: 'set', id: 'target', patch: { rect: targetRect(f, leaf) } }]));
  rec.do({ type: 'arrow', from: nodeId(leaf), to: 'target', verdict: hit ? 'good' : 'bad', label: `${sum} ${hit ? '=' : '≠'} ${TARGET}` }, wait(150));
  rec.do(...together([
    set(leaf, { tone: hit ? 'good' : (o.miss ?? 'explored') }),
    ...(hit && o.count !== undefined ? [{ type: 'set', id: 'count', patch: { text: `count ${o.count}` }, pop: true } as Action] : []),
    ...clear(),
  ]));
}

const checkCaption = (sum: number, tail: string) =>
  sum === TARGET
    ? `숫자를 모두 썼습니다. 합 ${josa(sum, '이', '가')} target ${TARGET}과 같으니 ${tail}`
    : `숫자를 모두 썼습니다. 합 ${josa(sum, '은', '는')} target ${TARGET}과 달라서 ${tail}`;

// 정답 가지(+1 −1 +3 처럼 쓴 숫자)를 글로
const waysText = () => WINNERS.map(exprOf).join(', ');

// 정답 가지를 분홍으로: 루트에서 잎까지의 칸과 가지 선
const WIN_NODES: Node[] = [...new Map(WINNERS.flatMap((w) => pathTo(w)).map((n): [string, Node] => [key(n), n])).values()];
const paintWinners = (): Action[] => WIN_NODES.flatMap((n): Action[] => [set(n, { tone: 'path' }), ...(n.d ? [edgeTone(n, 'path')] : [])]);

/* ------------------------------------------------------------------ */
/* 정석 DFS: 내려가기 → 합 확인 → 되돌아가기 (잎마다 한 단계)             */
/* ------------------------------------------------------------------ */

function depthFirst(): Visualization {
  const f = FLAT;
  const rec = new StepRecorder(board(f, { count: true }));
  let count = 0;
  let calls = 1; // dfs를 부른 횟수(= 만든 합의 개수). 맨 처음 dfs(0, 0)까지
  let path: Node[] = [ROOT]; // 루트에서 지금 칸까지의 길 = 호출 스택
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => {
    const top = path.at(-1)!;
    return { work: calls, variables: { i: top.d, total: sumOf(top), count } };
  };

  rec.step({ title: '합 0에서 시작', codeHighlights: DFS_AT.start, ...meta() });
  rec.phase('시작', `숫자 ${josa(`[${NUMBERS.join(', ')}]`, '을', '를')} 차례로 +나 −로 쓰는 모든 경우가 이 나무의 가지입니다. dfs(0, 0)이 합 0에서 시작합니다.`);
  rec.do(set(ROOT, { tone: 'current', text: '0' }, true), wait(1300));

  LEAF_NODES.forEach((leaf, idx) => {
    const full = pathTo(leaf); // 루트에서 잎까지
    const from = path.length - 1; // 내려가기를 시작하는 칸(full 안의 자리)
    const fresh = full.slice(from + 1); // 새로 내려가는 칸
    const upcoming = LEAF_NODES[idx + 1];
    let m = 0; // 다음 잎의 길과 갈라지는 칸의 깊이. 다음 잎이 없으면 루트까지 올라온다
    if (upcoming) while (key(full[m + 1]) === key(pathTo(upcoming)[m + 1])) m++;
    const gone = full.slice(m + 1); // 되돌아가며 마치는 칸
    const branch = full[m];
    const sum = sumOf(leaf);
    const hit = sum === TARGET;
    calls += fresh.length;
    if (hit) count++;
    path = full.slice(0, m + 1);

    rec.step({ title: `${exprOf(leaf)} = ${sum} → ${hit ? '같음' : '다름'}`, codeHighlights: DFS_AT.back, ...meta() });
    const moves = fresh.map((n) => signed(moveOf(n)));
    const lastMove = josa(moves.pop()!, '을', '를');
    rec.phase('내려가기', `${[...moves, lastMove].join(', ')}${moves.length ? ' 차례로 써서' : ' 써서'} 내려갑니다.`,
      join(...fresh.map((n) => (isMinus(n) ? DFS_AT.minus : DFS_AT.plus))));
    fresh.forEach((n, j) => {
      rec.do(...together([set(full[from + j], { tone: 'trail' }), set(n, { tone: 'current', text: String(sumOf(n)) }, true), edgeTone(n, 'path')]));
    });
    rec.phase('합 확인', checkCaption(sum, hit ? `count가 ${josa(count, '이', '가')} 됩니다.` : '세지 않습니다.'), hit ? DFS_AT.hit : DFS_AT.check);
    checkLeaf(rec, f, leaf, { count });
    rec.phase('되돌아가기', upcoming
      ? `맨 아래라 ${ro(call(branch))} 돌아옵니다. 빼는 가지가 남았습니다.`
      : `마지막 가지라 ${call(branch)}까지 모두 올라옵니다.`, DFS_AT.back);
    // 끝낸 칸은 회색, 선은 옅게. 잎은 이미 검사 결과로 칠해져 있고, 돌아온 칸이 다시 지금 칸이 된다
    rec.do(...together([...gone.slice(0, -1).map((n) => set(n, { tone: 'explored' })), ...gone.map((n) => edgeTone(n, 'trail')), set(branch, { tone: 'current' })]));
  });

  rec.step({ title: `모든 가지 확인 — 정답 ${count}`, codeHighlights: DFS_AT.done, ...meta(), answer: count, isKeyframe: true });
  rec.phase('정답 확인', `합이 ${TARGET}인 방법은 ${waysText()}, 모두 ${count}가지라서 count = ${count}를 돌려줍니다.`);
  rec.do(...together([...paintWinners(), { type: 'set', id: 'count', patch: { tone: 'good' } }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 BFS: 꺼내기 → 뻗기 → 넣기(잎은 합 확인), 칸마다 한 단계            */
/* ------------------------------------------------------------------ */

function breadthFirst(): Visualization {
  const f = TALL;
  const rec = new StepRecorder(board(f, { lane: true, count: true }));
  const lane = new Lane(rec, LANE);
  const waiting: Node[] = [ROOT]; // 큐에 든 칸, 꺼낼 차례대로
  let count = 0;
  let made = 1; // 만든 합의 개수(큐에 넣은 (i, total) 수)
  let cur: Node | undefined;
  let last: Node | undefined; // 바로 전에 꺼낸 칸
  const meta = () => ({
    work: made,
    variables: { i: cur ? cur.d : '-', total: cur ? sumOf(cur) : '-', queue: `[${waiting.map(tuple).join(', ')}]`, count },
  });
  const token = (n: Node) => ({ id: `tok:${key(n)}`, text: String(sumOf(n)) });

  rec.step({ title: `${josa(tuple(ROOT), '을', '를')} 큐에 넣고 시작`, codeHighlights: BFS_AT.start, ...meta() });
  rec.phase('시작', `숫자를 0개 썼고 합이 0인 ${josa(tuple(ROOT), '을', '를')} 큐에 넣고 시작합니다.`);
  rec.do(set(ROOT, { tone: 'queued', text: '0' }, true));
  lane.push(token(ROOT), nodeId(ROOT));
  rec.do(wait(500));

  while (waiting.length) {
    const n = waiting.shift()!;
    const kids = n.d < N ? children(n) : [];
    const sum = sumOf(n);
    const hit = n.d === N && sum === TARGET;
    const before = last;
    cur = n;
    waiting.push(...kids);
    made += kids.length;
    if (hit) count++;
    last = n;

    const pop = () => {
      rec.phase('꺼내기', `큐 맨 앞에서 ${josa(tuple(n), '을', '를')} 꺼냅니다. 합은 ${sum}입니다.`, BFS_AT.pop);
      lane.shift(nodeId(n));
      rec.do(...together([set(n, { tone: 'current' }), ...(before && before.d < N ? [set(before, { tone: 'explored' })] : [])], true));
    };

    if (kids.length) {
      const x = NUMBERS[n.d];
      rec.step({ title: `${tuple(n)} 꺼내고 ${kids.map(tuple).join(', ')} 넣기`, codeHighlights: BFS_AT.push, ...meta() });
      pop();
      rec.phase('뻗기', `다음 숫자 ${josa(x, '을', '를')} 더하거나 빼면 합이 ${sumOf(kids[0])} 또는 ${josa(sumOf(kids[1]), '이', '가')} 됩니다.`, BFS_AT.spread);
      rec.do({ type: 'focus', ids: [nodeId(n), ...kids.map(nodeId)] });
      for (const kid of kids) {
        rec.do({ type: 'arrow', from: nodeId(n), to: nodeId(kid), verdict: 'new', label: `${signed(moveOf(kid))} → ${sumOf(kid)}` });
        rec.do({ ...set(kid, { tone: 'queued', text: String(sumOf(kid)) }, true), together: true });
      }
      rec.phase('넣기', `새로 생긴 ${josa(tuple(kids[0]), '과', '와')} ${josa(tuple(kids[1]), '을', '를')} 큐 뒤에 넣습니다.`, BFS_AT.push);
      rec.do(...together(clear()));
      for (const kid of kids) lane.push(token(kid), nodeId(kid));
    } else {
      rec.step({ title: `${tuple(n)} 꺼내기 → ${hit ? '같음' : '다름'}`, codeHighlights: hit ? BFS_AT.hit : BFS_AT.check, ...meta() });
      pop();
      rec.phase('합 확인', checkCaption(sum, hit ? `count가 ${josa(count, '이', '가')} 됩니다.` : '세지 않습니다.'), hit ? BFS_AT.hit : BFS_AT.check);
      checkLeaf(rec, f, n, { count });
    }
  }

  cur = undefined;
  rec.step({ title: `큐가 비었습니다 — 정답 ${count}`, codeHighlights: BFS_AT.done, ...meta(), answer: count, isKeyframe: true });
  rec.phase('정답 확인', `큐가 비었습니다. 합이 ${TARGET}인 방법은 ${waysText()}, 모두 ${count}가지라서 count = ${count}를 돌려줍니다.`);
  rec.do(...together([...paintWinners(), { type: 'set', id: 'count', patch: { tone: 'good' } }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 그리디: 두 가지 보기 → 고르기, 합 확인, 정답과 비교               */
/* ------------------------------------------------------------------ */

function greedy(): Visualization {
  const f = FLAT;
  const rec = new StepRecorder(board(f, {}));
  let cur = ROOT;
  let made = 1; // 만든 합의 개수
  let result: number | '-' = '-';
  let looping = false; // 반복문 안(x가 숫자를 가리키는 동안)인가
  const meta = () => ({ work: made, variables: { x: looping ? NUMBERS[cur.d - 1] : '-', total: sumOf(cur), '돌려줄 값': result } });

  rec.step({ title: '합 0에서 시작', codeHighlights: GREEDY_AT.start, ...meta() });
  rec.phase('시작', `숫자를 쓸 때마다 target ${TARGET}에 더 가까워지는 쪽만 고르고, 한 번 고르면 되돌아오지 않습니다.`);
  rec.do(set(ROOT, { tone: 'current', text: '0' }, true), wait(900));

  while (cur.d < N) {
    const x = NUMBERS[cur.d];
    const [plus, minus] = children(cur);
    const [a, b] = [sumOf(plus), sumOf(minus)];
    const [da, db] = [Math.abs(a - TARGET), Math.abs(b - TARGET)];
    const pickPlus = da <= db;
    const [chosen, other] = pickPlus ? [plus, minus] : [minus, plus];
    made += 2;
    const from = cur;

    cur = chosen;
    looping = true;
    rec.step({ title: `${josa(x, '을', '를')} ${pickPlus ? '더하기' : '빼기'} (${sumOf(from)} → ${sumOf(chosen)})`, codeHighlights: pickPlus ? GREEDY_AT.plus : GREEDY_AT.minus, ...meta() });
    rec.phase('두 가지 보기', `${josa(x, '을', '를')} 더하면 합이 ${a}(거리 ${da}), 빼면 ${b}(거리 ${db})입니다.`, GREEDY_AT.look);
    rec.do({ type: 'focus', ids: [nodeId(from), nodeId(plus), nodeId(minus)] });
    for (const [kid, dist, v] of [[plus, da, pickPlus], [minus, db, !pickPlus]] as [Node, number, boolean][]) {
      const verdict: Verdict = v ? 'good' : 'seen';
      rec.do({ type: 'arrow', from: nodeId(from), to: nodeId(kid), verdict, label: `거리 ${dist}` });
      rec.do({ ...set(kid, { tone: 'queued', text: String(sumOf(kid)) }, true), together: true });
    }
    rec.phase('고르기', da === db
      ? `거리가 같으면 더하는 쪽을 고릅니다. 합은 ${sumOf(chosen)}입니다.`
      : `거리가 더 짧은 ${pickPlus ? '더하는' : '빼는'} 쪽을 고릅니다. 합은 ${josa(sumOf(chosen), '이', '가')} 됩니다.`, pickPlus ? GREEDY_AT.plus : GREEDY_AT.minus);
    rec.do(...together([...clear(), set(from, { tone: 'trail' }), set(chosen, { tone: 'current' }), set(other, { tone: 'explored' }), edgeTone(chosen, 'path')]));
  }

  const sum = sumOf(cur);
  result = sum === TARGET ? 1 : 0;
  looping = false;
  rec.step({ title: `합 ${sum} ≠ ${TARGET} → ${result} 반환`, codeHighlights: GREEDY_AT.done, ...meta() });
  rec.phase('합 확인', checkCaption(sum, `${result}을 돌려줍니다.`), GREEDY_AT.done);
  checkLeaf(rec, f, cur, { miss: 'bad' });

  rec.step({ title: `내 답 ${result}, 정답은 ${WINNERS.length}`, codeHighlights: GREEDY_AT.done, ...meta(), answer: result, isKeyframe: true });
  rec.phase('정답과 비교', `합이 ${TARGET}인 방법은 ${waysText()}, 두 가지나 있습니다. 한 길만 따라가서는 하나도 찾지 못했습니다.`);
  // 정답 가지는 분홍으로 채우고(아직 비어 있던 칸에는 합을 적는다), 내가 따라온 길 중 정답이 아닌 부분은 옅게 돌린다
  const filled = WIN_NODES.filter((n) => rec.get(nodeId(n)).text === '');
  const winKeys = new Set(WIN_NODES.map(key));
  const wrong = pathTo(cur).filter((n) => !winKeys.has(key(n)));
  rec.do(...together([
    ...paintWinners(),
    ...filled.map((n) => set(n, { text: String(sumOf(n)) }, true)),
    ...wrong.map((n) => edgeTone(n, 'trail')),
    ...wrong.filter((n) => n.d < N).map((n) => set(n, { tone: 'explored' })),
  ]));
  rec.do({ type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 300, y: f.bottom, w: 90, h: 30 }, tone: 'bad', text: `내 답 ${result}` } },
    { type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 400, y: f.bottom, w: 90, h: 30 }, tone: 'good', text: `정답 ${WINNERS.length}` }, together: true });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'target-number',
  title: '타겟 넘버',
  level: 2,
  category: 'dfs-bfs',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/43165',
  description: {
    summary:
      '자연수 몇 개가 차례로 주어집니다. 순서는 그대로 두고 각 수 앞에 + 또는 −를 붙여 모두 더하거나 뺄 때, 그 합이 target과 같아지는 방법이 몇 가지인지 구합니다.',
    rules: [
      '숫자는 2개 이상 20개 이하, 각 숫자는 1 이상 50 이하의 자연수',
      'target은 1 이상 1,000 이하의 자연수',
      '숫자의 순서는 바꿀 수 없고, 모든 숫자에 + 또는 −를 하나씩 붙임',
    ],
    examples: [
      { input: 'numbers = [1, 1, 1, 1, 1], target = 3', output: '5' },
      { input: 'numbers = [4, 1, 2, 1], target = 4', output: '2' },
    ],
  },
  keyIntuitions: [
    '숫자마다 +와 −, 두 갈래로 나뉘므로 방법은 모두 2^n가지입니다. n이 최대 20이라 약 100만 가지를 전부 따져 봐도 시간 안에 끝납니다.',
    'DFS는 한 갈래를 맨 아래까지 내려가 숫자를 모두 쓴 순간 합을 확인하고, 되돌아와 다음 갈래로 갑니다. 합이 target과 같은 가지를 셀 때마다 count를 올립니다.',
    '"target에 가까운 쪽"만 고르는 그리디는 지금은 멀어지는 길로 가야 닿는 가지를 놓치고, 방법의 개수도 셀 수 없습니다.',
  ],
  demo: { input: [NUMBERS, TARGET], label: 'numbers = [1, 1, 3], target = 3' },
  workUnit: '합을 만든 횟수',
  approaches: [
    {
      id: 'target-dfs',
      name: '깊이 우선 탐색 (DFS)',
      rank: 'BEST',
      timeComplexity: 'O(2^N)',
      spaceComplexity: 'O(N) 재귀 깊이',
      verdict: '숫자마다 더하기와 빼기 두 갈래로 끝까지 내려가며 세는, 문제 그대로의 풀이입니다.',
      pros: [
        '"더할까, 뺄까"를 재귀 호출 두 줄로 그대로 옮겨 코드가 가장 짧습니다.',
        '재귀 깊이가 숫자 개수(최대 20)뿐이라 메모리를 거의 쓰지 않습니다.',
        'N ≤ 20이면 가지가 2^20 ≈ 100만 개라 모두 따져 봐도 시간 안에 끝납니다.',
      ],
      cons: ['숫자가 30개만 돼도 가지가 10억 개를 넘어 쓸 수 없습니다.', '같은 (자리, 합)이 여러 번 나와도 매번 다시 따집니다.'],
      whyThisRank:
        '갈래가 둘뿐이고 깊이가 낮아 모든 경우를 따지는 것이 곧 정답입니다. 코드가 짧고 메모리도 가장 적게 들어 시험에서 가장 먼저 떠올릴 풀이입니다.',
      code: DFS,
      visualize: depthFirst,
    },
    {
      id: 'target-bfs',
      name: '너비 우선 탐색 (BFS)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(2^N)',
      spaceComplexity: 'O(2^N) 큐',
      verdict: '답은 같지만 큐에 한 줄의 가지를 한꺼번에 쌓아 메모리를 훨씬 더 씁니다.',
      pros: [
        '재귀 없이 반복문 하나로 풀 수 있어 재귀 한도를 걱정하지 않아도 됩니다.',
        '숫자를 하나 쓸 때마다 가능한 합이 어떻게 두 배로 늘어나는지 줄 단위로 볼 수 있습니다.',
      ],
      cons: [
        '맨 아래 줄에서 큐에 2^N개가 한꺼번에 쌓여, N = 20이면 (쓴 숫자 수, 합) 쌍 100만 개를 담아야 합니다.',
        'DFS는 한 갈래만 들고 있어 같은 시간에 메모리를 훨씬 적게 씁니다.',
      ],
      whyThisRank:
        '시간은 DFS와 같습니다. 그런데 큐가 가지 수만큼 자라는 만큼 메모리를 더 쓰므로, 이 문제에서는 깊이 우선이 더 가볍습니다.',
      code: BFS,
      visualize: breadthFirst,
    },
    {
      id: 'target-greedy',
      name: '그리디 (target에 가까운 쪽 고르기)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: '빠르고 그럴듯하지만 한 길만 가 보고 끝나서 오답이 나옵니다.',
      pros: ['숫자를 한 번만 훑어 O(N)으로 끝납니다.'],
      cons: [
        '매번 target에 가까운 쪽만 고르므로 지금은 멀어져도 나중에 target에 닿는 가지를 놓칩니다. numbers = [1, 1, 3], target = 3이면 +1 +1 +3 = 5로 끝나 0을 돌려주지만 정답은 2입니다.',
        '한 가지 길만 따라가므로 방법이 여러 개여도 많아야 1만 돌려줄 수 있습니다.',
      ],
      whyThisRank:
        '이 문제는 합이 target이 되는 방법이 모두 몇 가지인지 묻습니다. 가지를 하나도 놓치지 않으려면 DFS로 모든 가지를 살펴야 합니다.',
      code: GREEDY,
      visualize: greedy,
    },
  ],
  checks: {
    cases: [
      { args: [[1, 1, 1, 1, 1], 3], expected: 5 },
      { args: [[4, 1, 2, 1], 4], expected: 2 },
      { args: [[1, 1], 2], expected: 1 },
      { args: [[1, 1], 3], expected: 0 },
      { args: [[1, 2], 1], expected: 1 },
      { args: [Array(10).fill(1), 4], expected: 120 },
      { args: [NUMBERS, TARGET], expected: 2 },
    ],
    // 숫자 2~7개(1~10), target 1~25(DFS와 BFS가 2^7 가지를 도는 시간도 짧다)
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 6);
      return [Array.from({ length: n }, () => 1 + Math.floor(rand() * 10)), 1 + Math.floor(rand() * 25)];
    },
  },
};

export default problem;
