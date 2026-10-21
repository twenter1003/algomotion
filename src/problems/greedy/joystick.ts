// 조이스틱: 정석 돌아서는 칸마다 좌우 이동 최소, 대안 두 갈래 재귀(완전탐색), 함정 가장 가까운 글자부터 가기를 같은 장면에서 움직인다.
// 장면은 위에서부터 글자 칸 · 칸 번호 · 위아래 횟수 · 계산 글 · 합계 표시 줄이다. 커서(ring)는 대안과 함정에서만 쓴다.
import { around, grid } from '../../engine/layout.ts';
import type { Action, Item, ItemPatch, Language, Problem, Scene, Tone, Visualization } from '../../engine/model.ts';
import { josa, lines, ro, sum, together } from '../shared.ts';
import { PacedRecorder } from './paced.ts';

// 시각화 입력. 바꿀 글자는 0·1·3·9번 칸이고, 가까운 글자부터 가면 8칸(정답은 7칸)이 든다.
const NAME = 'JEANAAAAAZA';
const N = NAME.length;
const costOf = (c: string) => Math.min(c.charCodeAt(0) - 65, 91 - c.charCodeAt(0));
const COSTS = [...NAME].map(costOf);
const UPDOWN = sum(COSTS);
const LETTERS = [...NAME].flatMap((c, i) => (i > 0 && c !== 'A' ? [i] : [])); // 이동으로 만나야 할 글자 칸(0번 칸은 이미 서 있음)
const list = (xs: number[]) => `[${xs.join(', ')}]`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const EXACT = {
  python: `def solution(name):
    n = len(name)
    # 위아래: 글자마다 따로, A에서 올리거나 Z에서 내리는 쪽 중 짧은 쪽
    updown = sum(min(ord(c) - 65, 91 - ord(c)) for c in name)

    move = n - 1                  # 기준: 오른쪽으로 끝까지 가는 경로
    for i in range(n):            # i번 칸까지 갔다가 돌아섭니다
        nxt = i + 1
        while nxt < n and name[nxt] == 'A':
            nxt += 1              # 이어지는 A 구간은 건너뜁니다
        # 오른쪽 먼저 갔다 오기 / 왼쪽(뒤쪽) 먼저 갔다 오기 중 짧은 쪽
        move = min(move, 2 * i + n - nxt, 2 * (n - nxt) + i)
    return updown + move`,
  javascript: `function solution(name) {
  const n = name.length;
  // 위아래: 글자마다 따로, A에서 올리거나 Z에서 내리는 쪽 중 짧은 쪽
  let updown = 0;
  for (const c of name) updown += Math.min(c.charCodeAt(0) - 65, 91 - c.charCodeAt(0));

  let move = n - 1; // 기준: 오른쪽으로 끝까지 가는 경로
  for (let i = 0; i < n; i++) { // i번 칸까지 갔다가 돌아섭니다
    let nxt = i + 1;
    while (nxt < n && name[nxt] === 'A') nxt++; // 이어지는 A 구간은 건너뜁니다
    // 오른쪽 먼저 갔다 오기 / 왼쪽(뒤쪽) 먼저 갔다 오기 중 짧은 쪽
    move = Math.min(move, 2 * i + n - nxt, 2 * (n - nxt) + i);
  }
  return updown + move;
}`,
};
const EXACT_AT = {
  costs: lines(EXACT, ['updown = sum('], ['let updown = 0', 'for (const c of name)']),
  base: lines(EXACT, ['move = n - 1'], ['let move = n - 1']),
  skip: lines(EXACT, ['for i in range(n)', 'nxt = i + 1', 'while nxt < n', 'nxt += 1'], ['for (let i = 0', 'let nxt = i + 1', 'while (nxt < n']),
  pick: lines(EXACT, ['move = min(move, 2 * i'], ['move = Math.min(move, 2 * i']),
  done: lines(EXACT, ['return updown + move'], ['return updown + move']),
};

const BRANCH = {
  python: `def solution(name):
    n = len(name)
    updown = sum(min(ord(c) - 65, 91 - ord(c)) for c in name)

    best = float('inf')

    def dfs(pos, todo, move):       # todo: 아직 바꾸지 않은 글자 칸들
        nonlocal best
        if not todo:
            best = min(best, move)  # 모든 글자를 만났다 → 경로 하나 완성
            return
        right = min((t - pos) % n for t in todo)  # 오른쪽으로 가장 가까운 글자까지
        left = min((pos - t) % n for t in todo)   # 왼쪽으로 가장 가까운 글자까지
        dfs((pos + right) % n, todo - {(pos + right) % n}, move + right)  # 오른쪽 갈래
        dfs((pos - left) % n, todo - {(pos - left) % n}, move + left)     # 왼쪽 갈래

    dfs(0, frozenset(i for i in range(1, n) if name[i] != 'A'), 0)
    return updown + best`,
  javascript: `function solution(name) {
  const n = name.length;
  let updown = 0;
  for (const c of name) updown += Math.min(c.charCodeAt(0) - 65, 91 - c.charCodeAt(0));

  let best = Infinity;
  const dfs = (pos, todo, move) => { // todo: 아직 바꾸지 않은 글자 칸들
    if (todo.length === 0) {
      best = Math.min(best, move); // 모든 글자를 만났다 → 경로 하나 완성
      return;
    }
    let right = n;
    let left = n;
    for (const t of todo) {
      right = Math.min(right, (t - pos + n) % n); // 오른쪽으로 가장 가까운 글자까지
      left = Math.min(left, (pos - t + n) % n); // 왼쪽으로 가장 가까운 글자까지
    }
    const goRight = (pos + right) % n;
    const goLeft = (pos - left + n) % n;
    dfs(goRight, todo.filter((t) => t !== goRight), move + right); // 오른쪽 갈래
    dfs(goLeft, todo.filter((t) => t !== goLeft), move + left); // 왼쪽 갈래
  };

  dfs(0, [...Array(n).keys()].filter((i) => i > 0 && name[i] !== 'A'), 0);
  return updown + best;
}`,
};
const BRANCH_AT = {
  costs: lines(BRANCH, ['updown = sum('], ['let updown = 0', 'for (const c of name)']),
  start: lines(BRANCH, ['best = float', 'dfs(0, frozenset('], ['let best = Infinity', 'dfs(0, [...Array(n)']),
  leaf: lines(BRANCH, ['if not todo', 'best = min(best, move)'], ['if (todo.length === 0)', 'best = Math.min(best, move)']),
  right: lines(BRANCH, ['right = min(', 'dfs((pos + right) % n'], ['right = Math.min(right', 'dfs(goRight']),
  left: lines(BRANCH, ['left = min(', 'dfs((pos - left) % n'], ['left = Math.min(left', 'dfs(goLeft']),
  back: lines(BRANCH, ['dfs((pos + right) % n', 'dfs((pos - left) % n'], ['dfs(goRight', 'dfs(goLeft']),
  done: lines(BRANCH, ['return updown + best'], ['return updown + best']),
};

const NEAREST = {
  python: `def solution(name):
    n = len(name)
    updown = sum(min(ord(c) - 65, 91 - ord(c)) for c in name)

    todo = {i for i in range(1, n) if name[i] != 'A'}  # 아직 바꾸지 않은 글자 칸 (0번 칸에서 시작)
    pos, move = 0, 0
    while todo:
        right = min((t - pos) % n for t in todo)  # 오른쪽으로 가장 가까운 글자까지
        left = min((pos - t) % n for t in todo)   # 왼쪽으로 가장 가까운 글자까지
        if right <= left:  # 더 가까운 쪽으로 간다 (같으면 오른쪽)
            pos, move = (pos + right) % n, move + right
        else:
            pos, move = (pos - left) % n, move + left
        todo.remove(pos)
    return updown + move  # 가까운 글자부터 가면 멀리 돌아오게 될 수 있다`,
  javascript: `function solution(name) {
  const n = name.length;
  let updown = 0;
  for (const c of name) updown += Math.min(c.charCodeAt(0) - 65, 91 - c.charCodeAt(0));

  const todo = new Set(); // 아직 바꾸지 않은 글자 칸 (0번 칸에서 시작)
  for (let i = 1; i < n; i++) if (name[i] !== 'A') todo.add(i);
  let pos = 0;
  let move = 0;
  while (todo.size > 0) {
    let right = n;
    let left = n;
    for (const t of todo) {
      right = Math.min(right, (t - pos + n) % n); // 오른쪽으로 가장 가까운 글자까지
      left = Math.min(left, (pos - t + n) % n); // 왼쪽으로 가장 가까운 글자까지
    }
    if (right <= left) { // 더 가까운 쪽으로 간다 (같으면 오른쪽)
      pos = (pos + right) % n;
      move += right;
    } else {
      pos = (pos - left + n) % n;
      move += left;
    }
    todo.delete(pos);
  }
  return updown + move; // 가까운 글자부터 가면 멀리 돌아오게 될 수 있다
}`,
};
const NEAREST_AT = {
  costs: lines(NEAREST, ['updown = sum('], ['let updown = 0', 'for (const c of name)']),
  start: lines(NEAREST, ['todo = {i for i', 'pos, move = 0, 0'], ['const todo = new Set()', 'let pos = 0', 'let move = 0']),
  look: lines(NEAREST, ['while todo', 'right = min(', 'left = min('], ['while (todo.size > 0)', 'right = Math.min(right', 'left = Math.min(left']),
  right: lines(NEAREST, ['if right <= left', 'pos, move = (pos + right) % n', 'todo.remove(pos)'], ['if (right <= left)', 'pos = (pos + right) % n', 'move += right', 'todo.delete(pos)']),
  left: lines(NEAREST, ['if right <= left', 'else:', 'pos, move = (pos - left) % n', 'todo.remove(pos)'], ['if (right <= left)', '} else {', 'pos = (pos - left + n) % n', 'move += left', 'todo.delete(pos)']),
  done: lines(NEAREST, ['return updown + move'], ['return updown + move']),
};

// 여러 줄 묶음을 합친다(중복 없이, 줄 번호 순)
const merge = (...parts: Record<Language, number[]>[]): Record<Language, number[]> => ({
  python: [...new Set(parts.flatMap((p) => p.python))].sort((a, b) => a - b),
  javascript: [...new Set(parts.flatMap((p) => p.javascript))].sort((a, b) => a - b),
});

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 58px은 줄 이름, 칸은 x 64부터 48px씩 4px 간격(11칸). 세로 띠: 글자 칸 28~76(화살표 판정 표시가 칸 위 11px에 붙는다),
// 칸 번호 80~98, 위아래 횟수 100~120, 계산 글 130~154, 합계 표시 줄 166~196(표시 4칸, 136px씩 8px 간격).
const cellAt = grid({ x: 64, y: 28, rows: 1, cols: N, cell: 48, gap: 4 });
const W = 640;
const H = 204;
const cellId = (i: number) => `cell:${i}`;
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const dirName = (d: 'R' | 'L') => (d === 'R' ? '오른쪽' : '왼쪽');

function board(): Scene {
  const items: Item[] = [
    { id: 'lab:cell', kind: 'text', rect: { x: 0, y: 28, w: 58, h: 48 }, text: '글자' },
    { id: 'lab:idx', kind: 'text', rect: { x: 0, y: 80, w: 58, h: 18 }, tone: 'muted', text: '칸 번호' },
    { id: 'lab:cost', kind: 'text', rect: { x: 0, y: 100, w: 58, h: 20 }, text: '위아래' },
  ];
  [...NAME].forEach((c, i) => {
    const r = cellAt(0, i);
    items.push(
      { id: cellId(i), kind: 'cell', rect: r, tone: 'plain', text: c },
      { id: `idx:${i}`, kind: 'text', rect: { x: r.x, y: 80, w: r.w, h: 18 }, tone: 'muted', text: String(i) },
      { id: `cost:${i}`, kind: 'text', rect: { x: r.x, y: 100, w: r.w, h: 20 }, text: '' },
    );
  });
  items.push({ id: 'calc', kind: 'text', rect: { x: 64, y: 130, w: 568, h: 24 }, text: '' });
  return { width: W, height: H, items };
}

// 합계 표시: 처음이면 그 자리에 나타나고, 그 뒤로는 글만 바뀌며 톡 튄다
const SLOT = [64, 208, 352, 496].map((x) => ({ x, y: 166, w: 136, h: 30 }));
const mark = (rec: PacedRecorder, id: string, slot: 0 | 1 | 2 | 3, text: string, tone: Tone): Action =>
  rec.has(id) ? { type: 'set', id, patch: { text, tone }, pop: true } : { type: 'add', item: { id, kind: 'token', rect: SLOT[slot], tone, text } };
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });
const patchCell = (i: number, patch: ItemPatch): Action => ({ type: 'set', id: cellId(i), patch });

// 글자마다 위아래 횟수를 한꺼번에 적는다(A는 0이라 흐리게)
const writeCosts = (): Action[] =>
  together(COSTS.map((c, i): Action => ({ type: 'set', id: `cost:${i}`, patch: { text: String(c), tone: c ? 'plain' : 'muted' }, pop: true })));

// 칸 색을 tones대로, 칸 이름표를 tags대로 맞춘다(바뀌는 것만)
const recolor = (rec: PacedRecorder, tones: Tone[], tags: Record<number, string> = {}): Action[] =>
  tones.flatMap((tone, i): Action[] => {
    const now = rec.get(cellId(i));
    const tag = tags[i] ?? '';
    return now.tone === tone && (now.tag ?? '') === tag ? [] : [patchCell(i, { tone, tag })];
  });

// 커서 테두리: 처음에는 그 자리에 나타나고, 그 뒤로는 미끄러져 옮겨 간다
const ringAt = (rec: PacedRecorder, i: number): Action => {
  const rect = around(cellAt(0, i), 5);
  return rec.has('ring') ? { type: 'set', id: 'ring', patch: { rect } } : { type: 'add', item: { id: 'ring', kind: 'ring', rect } };
};

// 위아래 횟수를 적고 합을 표시하는 첫 단계(세 풀이가 같다)
function costsStep(rec: PacedRecorder, title: string, codeHighlights: Record<Language, number[]>, meta: { work: number; variables: Record<string, string | number> }) {
  rec.step({ title, codeHighlights, ...meta });
  rec.phase('위아래 세기', '알파벳은 A와 Z가 이어진 고리라서, 글자마다 위로 올리는 쪽과 아래로 내리는 쪽 중 짧은 쪽을 고릅니다. J는 위로 9번, Z는 아래로 1번입니다.');
  rec.do(...writeCosts());
  rec.phase('합하기', `위아래 횟수는 커서 이동과 상관없이 정해지므로 모두 더해 둡니다. ${COSTS.filter(Boolean).join(' + ')} = ${UPDOWN}번입니다.`);
  rec.do(mark(rec, 'tok:updown', 0, `위아래 합 ${UPDOWN}`, 'chosen'));
}

/* ------------------------------------------------------------------ */
/* 정석: 구간 정하기 → 최소 이동 고르기 (돌아서는 칸 i마다 한 단계)          */
/* ------------------------------------------------------------------ */

// 돌아서는 칸 i에서: 이어지는 A를 건너뛴 다음 글자 칸 nxt와 두 순서의 이동 횟수
const turn = (i: number) => {
  let nxt = i + 1;
  while (nxt < N && NAME[nxt] === 'A') nxt++;
  const right = 2 * i + N - nxt; // 오른쪽 먼저
  const left = 2 * (N - nxt) + i; // 왼쪽 먼저
  return { i, nxt, right, left, cost: Math.min(right, left) };
};
// 정석이 도는 순서대로 본 최소 이동(기준 경로 n − 1에서 시작)과 그것을 처음 만든 돌아서는 칸
let [MOVE, BEST_TURN] = [N - 1, N - 1];
for (let i = 0; i < N; i++) {
  const { cost } = turn(i);
  if (cost < MOVE) [MOVE, BEST_TURN] = [cost, i];
}
const ANSWER = UPDOWN + MOVE;

// 3칸 이상 이어지는 A 구간은 한 단계로 묶어 빨리 감는다: [첫 칸, 끝 칸]
const FAST: [number, number][] = [];
for (let i = 0; i < N; i++) {
  if (NAME[i] !== 'A') continue;
  let end = i;
  while (end + 1 < N && NAME[end + 1] === 'A') end++;
  if (end - i >= 2) FAST.push([i, end]);
  i = end;
}

// 돌아서는 칸 i일 때 칸 색: 오른쪽 구간(파랑) · 건너뛴 A(회색) · 왼쪽 구간(노랑)
const routeTones = (i: number, nxt: number): Tone[] =>
  Array.from({ length: N }, (_, c): Tone => (c <= i ? 'chosen' : c < nxt ? 'explored' : 'current'));

function exact(): Visualization {
  const rec = new PacedRecorder(board());
  let move = 0; // 0이면 아직 정하지 않음
  let at = -1; // 지금 돌아서는 칸 i (-1이면 아직 반복 전, nxt도 같다)
  let nxt = -1;
  let tried = 0; // 따져 본 돌아서는 칸 수
  const meta = () => ({
    work: tried,
    variables: { updown: UPDOWN, i: at < 0 ? '-' : at, nxt: nxt < 0 ? '-' : nxt, move: move || '-' },
  });

  costsStep(rec, `글자마다 위아래 횟수 구하기: 합 ${UPDOWN}`, EXACT_AT.costs, meta());

  move = N - 1;
  rec.step({ title: `기준 경로: 오른쪽으로 끝까지 ${move}칸`, codeHighlights: EXACT_AT.base, ...meta() });
  rec.phase('기준 정하기', `이제 커서 이동입니다. 가장 단순한 경로는 오른쪽으로 끝까지 가는 것이고 n − 1 = ${move}칸입니다. 이 값을 기준으로 삼습니다.`);
  rec.do(...together([...recolor(rec, Array(N).fill('chosen')), calcTo(`오른쪽으로만 끝까지 n − 1 = ${move}칸`)]));
  rec.do(mark(rec, 'tok:move', 1, `최소 이동 ${move}칸`, 'chosen'));

  // 돌아서는 칸 i 하나를 따져 보고 변수를 갱신한다
  const check = (i: number) => {
    const t = turn(i);
    const was = move;
    [at, nxt] = [i, t.nxt];
    tried++;
    if (t.cost < move) move = t.cost;
    return { ...t, gap: t.nxt - i - 1, was, improved: t.cost < was };
  };

  const stepFor = (i: number) => {
    const t = check(i);
    rec.step({ title: `i = ${i}에서 돌아서기 → ${t.cost}칸${t.improved ? ', 최소 갱신' : ''}`, codeHighlights: EXACT_AT.pick, ...meta() });
    rec.phase('구간 정하기', t.nxt >= N
      ? `${i}번 칸에서 돌아섭니다. 오른쪽에 글자가 더 없어 nxt = ${N}이고, 왼쪽으로 갈 구간은 없습니다.`
      : t.gap
        ? `${i}번 칸에서 돌아섭니다. 이어지는 A ${t.gap}칸을 건너뛰면 다음 글자는 ${t.nxt}번 칸입니다.`
        : `${i}번 칸에서 돌아섭니다. 바로 옆 ${t.nxt}번 칸이 A가 아니라 건너뛸 칸이 없습니다.`, EXACT_AT.skip);
    rec.do(...together([...recolor(rec, routeTones(i, t.nxt), { [i]: 'i', ...(t.nxt < N ? { [t.nxt]: 'nxt' } : {}) }), calcTo('')]));
    if (t.nxt < N) {
      rec.do({ type: 'focus', ids: Array.from({ length: t.nxt - i + 1 }, (_, k) => cellId(i + k)) });
      rec.do({ type: 'arrow', from: cellId(i), to: cellId(t.nxt), verdict: 'good', label: t.gap ? `A ${t.gap}칸 건너뜀` : '바로 옆' }, wait(100));
      rec.do(...clear());
    }
    const verdict = t.improved
      ? `지금까지 최소 ${t.was}칸보다 짧아 ${t.cost}칸으로 줄입니다.`
      : t.cost === t.was ? `지금까지 최소와 같은 ${t.was}칸이라 그대로 둡니다.` : `지금까지 최소 ${t.was}칸보다 길어 그대로 둡니다.`;
    rec.phase('최소 이동 고르기', `오른쪽 먼저면 ${t.right}칸, 왼쪽 먼저면 ${t.left}칸이라 후보는 ${t.cost}칸입니다. ${verdict}`, EXACT_AT.pick);
    rec.do(calcTo(`오른쪽 먼저 2×${i} + ${N - t.nxt} = ${t.right}칸 · 왼쪽 먼저 2×${N - t.nxt} + ${i} = ${t.left}칸`));
    if (t.improved) rec.do(mark(rec, 'tok:move', 1, `최소 이동 ${move}칸`, 'good'));
  };

  for (let i = 0; i < N; ) {
    const run = FAST.find(([a]) => a === i);
    if (!run) {
      stepFor(i);
      i++;
      continue;
    }
    // 빨리 감기: A만 이어지는 구간 안에서 돌아서는 경우들은 오른쪽 구간만 늘어난다
    const [a, b] = run;
    const costs = Array.from({ length: b - a + 1 }, (_, k) => {
      const t = check(a + k);
      if (t.improved) throw new Error('빨리 감기 구간에서 최소가 바뀌면 단계를 나눠야 합니다');
      return t.cost;
    });
    rec.step({ title: `i = ${a}~${b} 빨리 감기: ${costs.join(', ')}칸`, codeHighlights: EXACT_AT.skip, ...meta() });
    rec.phase('빨리 감기', `i = ${josa(`${a}~${b}`, '은', '는')} 모두 A 위에서 돌아서는 경우입니다. 오른쪽 구간만 길어져 ${costs.join(', ')}칸으로 늘기만 하고, ${move}칸보다 짧은 값은 없습니다.`);
    rec.do(...together([...recolor(rec, routeTones(b, nxt), { [b]: 'i', [nxt]: 'nxt' }), calcTo(`i = ${a}~${b}: ${costs.join(', ')}칸 (모두 ${move}칸보다 큼)`)]));
    i = b + 1;
  }

  const best = turn(BEST_TURN);
  rec.step({ title: `위아래 ${UPDOWN} + 이동 ${move} = ${ANSWER}번`, codeHighlights: EXACT_AT.done, ...meta(), answer: ANSWER, isKeyframe: true });
  rec.phase('정답', `모든 돌아서는 칸을 확인했습니다. ${BEST_TURN}번 칸에서 돌아서는 경로가 ${move}칸으로 가장 짧습니다. 위아래 ${UPDOWN}번과 더해 ${ANSWER}번이 답입니다.`);
  rec.do(...together([
    ...recolor(rec, routeTones(BEST_TURN, best.nxt).map((t): Tone => (t === 'explored' ? 'explored' : 'path')), { [BEST_TURN]: 'i', [best.nxt]: 'nxt' }),
    calcTo(`위아래 ${UPDOWN} + 이동 ${move} = ${ANSWER}번`),
  ]));
  rec.do(mark(rec, 'tok:total', 2, `합계 ${ANSWER}번`, 'path'));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 두 갈래 재귀: 되돌아가기 → 갈래 따라가기 → 기록하기 (경로 하나가 한 단계) */
/* ------------------------------------------------------------------ */

interface Leg { dir: 'R' | 'L'; to: number; dist: number }
interface Route { legs: Leg[]; calls: number } // calls: 이 경로가 완성될 때까지 부른 dfs 수
const ROUTES: Route[] = [];
{
  let calls = 0;
  const walk = (pos: number, todo: number[], legs: Leg[]) => {
    calls++;
    if (!todo.length) {
      ROUTES.push({ legs, calls });
      return;
    }
    const right = Math.min(...todo.map((t) => (t - pos + N) % N));
    const left = Math.min(...todo.map((t) => (pos - t + N) % N));
    const [goRight, goLeft] = [(pos + right) % N, (pos - left + N) % N];
    walk(goRight, todo.filter((t) => t !== goRight), [...legs, { dir: 'R', to: goRight, dist: right }]);
    walk(goLeft, todo.filter((t) => t !== goLeft), [...legs, { dir: 'L', to: goLeft, dist: left }]);
  };
  walk(0, LETTERS, []);
}
const posAfter = (legs: Leg[], depth: number) => (depth ? legs[depth - 1].to : 0);
const dists = (legs: Leg[], depth: number) => legs.slice(0, depth).map((l) => l.dist);
const total = (legs: Leg[]) => sum(legs.map((l) => l.dist));
const nowTones = (visited: number[]): Tone[] => Array.from({ length: N }, (_, c): Tone => (visited.includes(c) ? 'visited' : LETTERS.includes(c) ? 'queued' : 'plain'));

function branching(): Visualization {
  const rec = new PacedRecorder(board());
  let started = false;
  let best = 0; // 0이면 아직 없음
  let [pos, move, calls] = [0, 0, 0];
  const meta = () => ({ work: calls, variables: { updown: UPDOWN, pos: started ? pos : '-', move: started ? move : '-', best: best || '-' } });

  costsStep(rec, `글자마다 위아래 횟수 구하기: 합 ${UPDOWN}`, BRANCH_AT.costs, meta());

  started = true;
  calls = 1;
  rec.step({ title: `0번 칸에서 시작: 바꿀 글자 ${list(LETTERS)}`, codeHighlights: BRANCH_AT.start, ...meta() });
  rec.phase('시작', `커서는 0번 칸에서 시작하고, 이동으로 만나야 할 글자는 ${LETTERS.join(', ')}번 칸입니다. dfs는 지금 칸에서 오른쪽·왼쪽으로 가장 가까운 글자로 가는 두 갈래를 모두 따라갑니다.`);
  rec.do(...together([ringAt(rec, 0), ...recolor(rec, nowTones([]))]));

  let prev: Route | undefined;
  ROUTES.forEach((route, k) => {
    const { legs } = route;
    const cost = total(legs);
    // 앞 경로와 같은 갈래를 고른 깊이까지는 이어서 가고, 그 뒤부터 되돌아가 다른 갈래를 따른다
    const shared = prev ? legs.findIndex((l, d) => l.dir !== prev!.legs[d].dir || l.to !== prev!.legs[d].to) : 0;
    const improved = !best || cost < best;
    const was = best;
    [pos, move, calls] = [legs.at(-1)!.to, cost, route.calls];
    if (improved) best = cost;

    rec.step({ title: `경로 ${k + 1}: ${legs.map((l) => dirName(l.dir)).join(' → ')} = ${cost}칸`, codeHighlights: BRANCH_AT.leaf, ...meta() });
    if (prev) {
      const back = posAfter(legs, shared);
      rec.phase('되돌아가기', shared
        ? `앞 경로와 ${shared}번째 갈래까지 같습니다. ${back}번 칸으로 되돌아가 다른 갈래를 따라갑니다.`
        : '처음 칸으로 되돌아가 첫 갈래부터 다시 따라갑니다.', BRANCH_AT.back);
      rec.do(...together([
        ringAt(rec, back),
        ...recolor(rec, nowTones(legs.slice(0, shared).map((l) => l.to))),
        calcTo(shared ? `${dists(legs, shared).join(' + ')} = ${sum(dists(legs, shared))}칸` : ''),
      ]));
    }
    const from = prev ? shared : 0;
    const follow = legs.slice(from);
    rec.phase('갈래 따라가기', `${follow.map((l) => `${l.to}번 칸(${dirName(l.dir)} ${l.dist}칸)`).join(' → ')}으로 갑니다.`,
      merge(...follow.map((l) => (l.dir === 'R' ? BRANCH_AT.right : BRANCH_AT.left))));
    follow.forEach((l, d) => {
      const depth = from + d + 1;
      rec.do(...together([
        ringAt(rec, l.to),
        patchCell(l.to, { tone: 'visited' }),
        calcTo(`${dists(legs, depth).join(' + ')} = ${sum(dists(legs, depth))}칸`),
      ]));
    });
    rec.phase('기록하기', `모든 글자를 만났습니다. 이 경로는 ${cost}칸입니다. ${improved
      ? (was ? `지금까지 최소 ${was}칸보다 짧아 best를 ${ro(cost)} 줄입니다.` : `첫 경로라 best = ${cost}입니다.`)
      : was === cost ? `지금까지 최소와 같은 ${was}칸이라 best는 그대로입니다.` : `지금까지 최소 ${was}칸보다 길어 best는 그대로입니다.`}`, BRANCH_AT.leaf);
    rec.do(mark(rec, 'tok:move', 1, `최소 이동 ${best}칸`, improved ? 'good' : 'chosen'));
    prev = route;
  });

  const winner = ROUTES.find((r) => total(r.legs) === best)!;
  pos = winner.legs.at(-1)!.to;
  move = best;
  rec.step({ title: `위아래 ${UPDOWN} + 최소 이동 ${best} = ${UPDOWN + best}번`, codeHighlights: BRANCH_AT.done, ...meta(), answer: UPDOWN + best, isKeyframe: true });
  rec.phase('정답', `갈래 ${ROUTES.length}가지를 모두 따라가 보았습니다(dfs ${calls}번 호출). 가장 짧은 경로는 ${winner.legs.map((l) => `${dirName(l.dir)} ${l.dist}칸`).join(' → ')}의 ${best}칸이고, 위아래 ${UPDOWN}번과 더해 ${UPDOWN + best}번입니다.`);
  rec.do(...together([
    ringAt(rec, pos),
    ...recolor(rec, Array.from({ length: N }, (_, c): Tone => (winner.legs.some((l) => l.to === c) ? 'path' : 'plain'))),
    calcTo(`위아래 ${UPDOWN} + 이동 ${best} = ${UPDOWN + best}번`),
  ]));
  rec.do(mark(rec, 'tok:total', 2, `합계 ${UPDOWN + best}번`, 'path'));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 가까운 글자부터: 가까운 글자 찾기 → 가까운 쪽으로 가기, 오답 확인    */
/* ------------------------------------------------------------------ */

function nearest(): Visualization {
  const rec = new PacedRecorder(board());
  const todo = new Set(LETTERS);
  let started = false;
  let [pos, move, decided] = [0, 0, 0];
  const meta = () => ({
    work: decided,
    variables: { updown: UPDOWN, pos: started ? pos : '-', move: started ? move : '-', todo: started ? `{${[...todo].join(', ')}}` : '-' },
  });

  costsStep(rec, `글자마다 위아래 횟수 구하기: 합 ${UPDOWN}`, NEAREST_AT.costs, meta());

  started = true;
  rec.step({ title: `0번 칸에서 시작: 바꿀 글자 ${list(LETTERS)}`, codeHighlights: NEAREST_AT.start, ...meta() });
  rec.phase('시작', `커서는 0번 칸에서 시작하고, 이동으로 만나야 할 글자는 ${LETTERS.join(', ')}번 칸입니다. 매번 가장 가까운 글자로 가 보겠습니다.`);
  rec.do(...together([ringAt(rec, 0), ...recolor(rec, nowTones([]))]));

  while (todo.size) {
    const dist = (a: number, b: number) => (b - a + N) % N; // a에서 오른쪽으로 b까지의 칸 수
    const rightTo = [...todo].reduce((a, t) => (dist(pos, t) < dist(pos, a) ? t : a));
    const leftTo = [...todo].reduce((a, t) => (dist(t, pos) < dist(a, pos) ? t : a));
    const [right, left] = [dist(pos, rightTo), dist(leftTo, pos)];
    const goRight = right <= left;
    const [to, steps] = goRight ? [rightTo, right] : [leftTo, left];
    const from = pos;
    decided++;
    todo.delete(to);
    [pos, move] = [to, move + steps];
    const way = dirName(goRight ? 'R' : 'L');

    rec.step({ title: `${from}번 칸에서 ${way} ${to}번 칸으로 ${steps}칸`, codeHighlights: goRight ? NEAREST_AT.right : NEAREST_AT.left, ...meta() });
    rec.phase('가까운 글자 찾기', rightTo === leftTo
      ? `남은 글자는 ${to}번 칸뿐입니다. 오른쪽으로 ${right}칸, 왼쪽으로 ${left}칸이라 ${way}이 더 가깝습니다.`
      : `${from}번 칸에서 오른쪽으로 가장 가까운 글자는 ${right}칸, 왼쪽은 ${left}칸 거리입니다. ${right === left ? '같으면 오른쪽으로 갑니다.' : `${way}이 더 가깝습니다.`}`, NEAREST_AT.look);
    rec.do({ type: 'focus', ids: [cellId(from), ...new Set([cellId(rightTo), cellId(leftTo)])] });
    if (rightTo === leftTo) {
      rec.do({ type: 'arrow', from: cellId(from), to: cellId(to), verdict: 'good', label: `${way} ${steps}칸` }, wait(100));
    } else {
      rec.do({ type: 'arrow', from: cellId(from), to: cellId(rightTo), verdict: goRight ? 'good' : 'seen', label: `오른쪽 ${right}칸` });
      rec.do({ type: 'arrow', from: cellId(from), to: cellId(leftTo), verdict: goRight ? 'seen' : 'good', label: `왼쪽 ${left}칸` }, wait(100));
    }
    rec.phase('가까운 쪽으로 가기', `${way}으로 ${steps}칸 가서 ${to}번 칸에 닿습니다. 지금까지 이동은 ${move}칸입니다.`, goRight ? NEAREST_AT.right : NEAREST_AT.left);
    rec.do(...clear());
    rec.do(...together([ringAt(rec, to), patchCell(to, { tone: 'visited' }), calcTo(`이동 ${move}칸`)]));
    rec.do(mark(rec, 'tok:move', 1, `이동 ${move}칸`, 'chosen'));
  }

  const answer = UPDOWN + move;
  const last = LETTERS.at(-1)!;
  rec.step({ title: `위아래 ${UPDOWN} + 이동 ${move} = ${answer}번, 정답은 ${ANSWER}번`, codeHighlights: NEAREST_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('오답 확인', `이 방법의 답은 ${UPDOWN} + ${move} = ${answer}번이지만 정답은 ${ANSWER}번입니다. 가까운 글자를 차례로 가는 동안 ${last}번 칸이 점점 멀어졌습니다. 처음에 왼쪽으로 ${last}번 칸을 먼저 들렀다 오면 이동이 ${MOVE}칸으로 줄어듭니다.`);
  rec.do(mark(rec, 'tok:total', 2, `이 방법 ${answer}번`, 'bad'));
  rec.do(mark(rec, 'tok:truth', 3, `정답 ${ANSWER}번`, 'good'));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'joystick',
  title: '조이스틱',
  level: 2,
  category: 'greedy',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42860',
  description: {
    summary:
      '처음에는 모든 칸이 A인 이름을 조이스틱으로 목표 이름으로 바꿉니다. 위·아래로 현재 칸의 알파벳을 다음·이전 글자로 바꾸고, 왼쪽·오른쪽으로 커서를 옮길 수 있습니다. 알파벳은 A와 Z가 이어져 있고, 커서도 맨 앞에서 왼쪽으로 가면 맨 뒤 칸으로 갑니다. 이름을 만드는 조작 횟수의 최솟값을 구합니다.',
    rules: [
      'name은 알파벳 대문자로만 이루어져 있고, 길이는 1 이상 20 이하',
      '커서는 처음에 맨 앞 칸(0번)에 있음',
      '위·아래: 현재 칸의 글자를 다음·이전 알파벳으로 바꿈(A에서 아래로 가면 Z, Z에서 위로 가면 A)',
      '왼쪽·오른쪽: 커서를 한 칸 옮김(맨 앞에서 왼쪽이면 맨 뒤 칸, 맨 뒤에서 오른쪽이면 맨 앞 칸)',
    ],
    examples: [
      { input: 'name = "JEROEN"', output: '56' },
      { input: 'name = "JAN"', output: '23' },
    ],
  },
  keyIntuitions: [
    '위아래 조작은 글자마다 독립입니다. 글자 하나를 바꾸는 최소 횟수는 min(글자 − A, Z − 글자 + 1)이고, 전체 합은 커서를 어떻게 움직이든 같습니다.',
    '남는 문제는 A가 아닌 글자를 모두 만나는 가장 짧은 커서 경로입니다. 경로는 "오른쪽으로 i칸 갔다 돌아와 왼쪽으로 가기" 또는 그 반대 순서의 꼴로 줄어듭니다.',
    '돌아서는 칸 i마다 이어지는 A를 건너뛴 다음 글자(nxt)를 찾아 두 순서의 이동 횟수를 비교합니다. 가까운 글자부터 가는 방법은 가까운 쪽을 먼저 갔다가 멀리 돌아와야 해서 최단이 아닐 수 있습니다.',
  ],
  demo: { input: [NAME], label: 'name = "JEANAAAAAZA"' },
  workUnit: '따져 본 경우의 수',
  approaches: [
    {
      id: 'joystick-turn',
      name: '위아래 합 + 돌아서는 칸마다 좌우 이동 최소',
      rank: 'BEST',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(1)',
      verdict: '위아래는 글자마다 따로 더하고, 좌우는 돌아서는 칸마다 짧은 경로를 골라 반복문 하나로 끝내는 풀이입니다.',
      pros: [
        '글자의 위아래 횟수와 커서 이동이 서로 영향을 주지 않는다는 점을 써서 두 문제로 나눕니다.',
        'A 구간을 통째로 건너뛰는 식 하나로 모든 경로를 빠짐없이 확인합니다.',
        'N이 20 이하라 계산이 순식간에 끝납니다.',
      ],
      cons: [
        '"오른쪽으로 갔다 돌아오기"와 "왼쪽 먼저"를 둘 다 비교해야 하고, 식 2i + n − nxt가 낯설어 실수하기 쉽습니다.',
      ],
      whyThisRank:
        '이동 경로는 돌아서는 칸 하나로 정해지므로 후보가 N개뿐입니다. 후보마다 두 순서의 이동 횟수를 식으로 바로 구해, 경로를 직접 따라가 볼 필요가 없습니다.',
      code: EXACT,
      visualize: exact,
    },
    {
      id: 'joystick-branch',
      name: '왼쪽·오른쪽 두 갈래 재귀 (완전탐색)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(2^K × K)',
      spaceComplexity: 'O(K)',
      verdict: '다음에 만날 글자를 왼쪽·오른쪽 두 갈래로 모두 따라가 가장 짧은 경로를 찾는, 맞지만 갈래가 두 배씩 늘어나는 풀이입니다.',
      pros: [
        '모든 갈래를 따라가 보므로 경로 모양에 대한 가정이 필요 없어 확실하게 맞습니다.',
        '이동 비용이 칸마다 다른 문제로 바꿔도 그대로 쓸 수 있습니다.',
      ],
      cons: [
        'A가 아닌 글자가 K개이면 갈래가 2^K가지입니다. K가 19면 50만 가지가 넘어 Python은 눈에 띄게 느려집니다.',
        '재귀와 집합 연산이 들어가 코드가 정석보다 깁니다.',
      ],
      whyThisRank:
        '정석이 N번의 계산으로 끝내는 일을 2^K가지 경로로 확인합니다. 글자가 적을 때는 충분하지만 최대 길이에서는 필요 이상으로 많은 경로를 봅니다.',
      code: BRANCH,
      visualize: branching,
    },
    {
      id: 'joystick-nearest',
      name: '가장 가까운 글자부터 가기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(K²)',
      spaceComplexity: 'O(K)',
      verdict: '지금 커서에서 가장 가까운 글자로 계속 가는 그리디인데, 어떤 이름에서는 정답보다 길게 돌게 됩니다.',
      pros: ['코드가 직관적이고, 예제 두 개는 우연히 통과합니다.'],
      cons: [
        '가까운 글자를 먼저 가면 반대쪽에 남은 글자까지 돌아오는 길이 길어질 수 있어, 정답보다 큰 값이 나옵니다.',
        '왼쪽과 오른쪽이 똑같이 가까울 때 어느 쪽을 고르든 틀리는 입력도 있습니다.',
      ],
      whyThisRank:
        '지금 한 걸음이 가장 짧다고 전체 경로가 가장 짧지는 않습니다. 이 문제의 안전한 선택은 "돌아서는 칸"을 정한 뒤 양쪽 구간을 한꺼번에 계산하는 것입니다.',
      code: NEAREST,
      visualize: nearest,
    },
  ],
  checks: {
    cases: [
      { args: ['JEROEN'], expected: 56 },
      { args: ['JAN'], expected: 23 },
      { args: ['A'], expected: 0 },
      { args: ['AAAAZ'], expected: 2 },
      { args: ['BBBBAAAABA'], expected: 12 },
      { args: [NAME], expected: 34 },
    ],
    // 길이 1~8, 글자는 A를 절반쯤 섞은 알파벳 대문자(재귀 갈래가 많지 않게)
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 8);
      const name = Array.from({ length: n }, () => (rand() < 0.5 ? 'A' : String.fromCharCode(65 + Math.floor(rand() * 26)))).join('');
      return [name];
    },
  },
};

export default problem;
