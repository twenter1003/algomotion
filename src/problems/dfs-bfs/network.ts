// 네트워크: 정석 DFS 연결 요소, 대안 BFS, 함정 직접 연결된 컴퓨터만 묶기를 같은 그래프에서 움직인다.
// 장면은 위에 줄(DFS 스택, BFS 큐), 가운데에 컴퓨터 6대(칸)와 연결선, 왼쪽 아래에 네트워크 수 표시다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import type { Action, Item, ItemPatch, Point, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';

interface Look { j: number; verdict: 'seen' | 'new' }

// 시각화 입력. 0-1, 1-2, 1-3, 4-5로 이어져 네트워크는 2개다. 0번과 직접 이어진 것은 1번뿐이라,
// 직접 연결만 묶는 함정은 2번과 3번을 따로 세어 4개라고 답한다.
const N = 6;
const COMPUTERS = [
  [1, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 0],
  [0, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 1, 1],
];
const PAIRS = COMPUTERS.flatMap((row, a) => row.flatMap((v, b) => (v === 1 && a < b ? [[a, b] as [number, number]] : [])));
const linked = (a: number) => COMPUTERS[a].flatMap((v, b) => (v === 1 && b !== a ? [b] : [])); // a와 직접 이어진 컴퓨터(번호순)
const flags = (visited: boolean[]) => `[${visited.map((v) => (v ? 'T' : 'F')).join(', ')}]`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const DFS = {
  python: `def solution(n, computers):
    visited = [False] * n

    def dfs(now):
        visited[now] = True
        for nxt in range(n):
            if computers[now][nxt] == 1 and not visited[nxt]:
                dfs(nxt)  # 이어진 새 컴퓨터로 파고듭니다

    answer = 0
    for i in range(n):
        if not visited[i]:  # 아직 어느 네트워크에도 속하지 않은 컴퓨터
            dfs(i)
            answer += 1
    return answer`,
  javascript: `function solution(n, computers) {
  const visited = Array(n).fill(false);

  const dfs = (now) => {
    visited[now] = true;
    for (let next = 0; next < n; next++) {
      if (computers[now][next] === 1 && !visited[next]) dfs(next); // 이어진 새 컴퓨터로 파고듭니다
    }
  };

  let answer = 0;
  for (let i = 0; i < n; i++) {
    if (!visited[i]) { // 아직 어느 네트워크에도 속하지 않은 컴퓨터
      dfs(i);
      answer++;
    }
  }
  return answer;
}`,
};
const DFS_AT = {
  start: lines(DFS, ['visited = [False] * n', 'answer = 0'], ['const visited = Array(n)', 'let answer = 0']),
  enterRoot: lines(DFS, ['if not visited[i]', 'dfs(i)', 'visited[now] = True'], ['if (!visited[i])', 'dfs(i)', 'visited[now] = true']),
  enter: lines(DFS, ['dfs(nxt)', 'visited[now] = True'], ['dfs(next)', 'visited[now] = true']),
  look: lines(DFS, ['for nxt in range(n)', 'if computers[now][nxt] == 1 and not visited[nxt]'],
    ['for (let next = 0; next < n; next++)', 'if (computers[now][next] === 1 && !visited[next]) dfs(next)']),
  back: lines(DFS, ['for nxt in range(n)'], ['for (let next = 0; next < n; next++)']),
  count: lines(DFS, ['dfs(i)', 'answer += 1'], ['dfs(i)', 'answer++']),
  done: lines(DFS, ['for i in range(n)', 'return answer'], ['for (let i = 0; i < n; i++)', 'return answer']),
};

const BFS = {
  python: `from collections import deque

def solution(n, computers):
    visited = [False] * n
    answer = 0

    for start in range(n):
        if visited[start]:
            continue
        answer += 1  # 새 네트워크를 찾았습니다
        visited[start] = True
        queue = deque([start])
        while queue:
            now = queue.popleft()
            for nxt in range(n):
                if computers[now][nxt] == 1 and not visited[nxt]:
                    visited[nxt] = True
                    queue.append(nxt)
    return answer`,
  javascript: `function solution(n, computers) {
  const visited = Array(n).fill(false);
  let answer = 0;

  for (let start = 0; start < n; start++) {
    if (visited[start]) continue;
    answer++; // 새 네트워크를 찾았습니다
    visited[start] = true;
    const queue = [start];
    let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
    while (head < queue.length) {
      const now = queue[head++];
      for (let next = 0; next < n; next++) {
        if (computers[now][next] === 1 && !visited[next]) {
          visited[next] = true;
          queue.push(next);
        }
      }
    }
  }
  return answer;
}`,
};
const BFS_AT = {
  start: lines(BFS, ['visited = [False] * n', 'answer = 0'], ['const visited = Array(n)', 'let answer = 0']),
  found: lines(BFS, ['for start in range(n)', 'if visited[start]', 'answer += 1', 'visited[start] = True', 'queue = deque([start])'],
    ['for (let start = 0; start < n; start++)', 'if (visited[start]) continue', 'answer++', 'visited[start] = true', 'const queue = [start]']),
  pop: lines(BFS, ['while queue:', 'now = queue.popleft()'], ['while (head < queue.length)', 'const now = queue[head++]']),
  look: lines(BFS, ['for nxt in range(n)', 'if computers[now][nxt] == 1 and not visited[nxt]'],
    ['for (let next = 0; next < n; next++)', 'if (computers[now][next] === 1 && !visited[next])']),
  mark: lines(BFS, ['if computers[now][nxt] == 1 and not visited[nxt]', 'visited[nxt] = True'],
    ['if (computers[now][next] === 1 && !visited[next])', 'visited[next] = true']),
  push: lines(BFS, ['queue.append(nxt)'], ['queue.push(next)']),
  next: lines(BFS, ['while queue:'], ['while (head < queue.length)']),
  done: lines(BFS, ['for start in range(n)', 'return answer'], ['for (let start = 0; start < n; start++)', 'return answer']),
};

const DIRECT = {
  python: `# 주의: 오답이 나오는 풀이입니다 (직접 연결된 컴퓨터까지만 묶습니다)
def solution(n, computers):
    visited = [False] * n
    answer = 0
    for i in range(n):
        if not visited[i]:
            for j in range(n):
                if computers[i][j] == 1:
                    visited[j] = True  # i와 직접 이어진 컴퓨터만 표시, 그 이웃의 이웃은 놓칩니다
            answer += 1
    return answer`,
  javascript: `// 주의: 오답이 나오는 풀이입니다 (직접 연결된 컴퓨터까지만 묶습니다)
function solution(n, computers) {
  const visited = Array(n).fill(false);
  let answer = 0;
  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      for (let j = 0; j < n; j++) {
        if (computers[i][j] === 1) visited[j] = true; // i와 직접 이어진 컴퓨터만 표시, 그 이웃의 이웃은 놓칩니다
      }
      answer++;
    }
  }
  return answer;
}`,
};
const DIRECT_AT = {
  start: lines(DIRECT, ['visited = [False] * n', 'answer = 0'], ['const visited = Array(n)', 'let answer = 0']),
  check: lines(DIRECT, ['for i in range(n)', 'if not visited[i]'], ['for (let i = 0; i < n; i++)', 'if (!visited[i])']),
  mark: lines(DIRECT, ['for j in range(n)', 'if computers[i][j] == 1', 'visited[j] = True'], ['for (let j = 0; j < n; j++)', 'if (computers[i][j] === 1) visited[j] = true']),
  count: lines(DIRECT, ['answer += 1'], ['answer++']),
  done: lines(DIRECT, ['for i in range(n)', 'return answer'], ['for (let i = 0; i < n; i++)', 'return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로 0~500, 세로: 줄 0~40, 컴퓨터 칸은 y 83~297, 맨 아래 네트워크 수 표시 312~342.
// 칸 54px의 가운데 좌표(컴퓨터 번호 순서). 판정 표시(칸 위 11px)와 화살표가 판 안에 들도록 가장자리에서 띄웠다.
const CELL = 54;
const W = 500;
const H = 350;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다
const CENTERS: Point[] = [[62, 190], [190, 190], [320, 110], [320, 270], [446, 130], [446, 250]];
const LANE: LaneOptions = { id: 'lane', x: 40, y: 5, slotW: 62, slotH: 30, gap: 6, max: 6 };
const rectOf = (c: number): Rect => ({ x: CENTERS[c][0] - CELL / 2, y: CENTERS[c][1] - CELL / 2, w: CELL, h: CELL });
const cellId = (c: number) => `pc:${c}`;
const edgeId = (a: number, b: number) => `edge:${Math.min(a, b)}-${Math.max(a, b)}`;
const COUNT_RECT: Rect = { x: 0, y: 312, w: 104, h: 30 };
const VERDICT_LABEL = { seen: '방문함', new: '새 컴퓨터' } as const;

// 두 칸 가운데를 잇는 선을 칸 테두리에서 3px 띄워 자른다(선이 칸 안의 글자를 가리지 않게)
function edgePoints(a: number, b: number): Point[] {
  const [[ax, ay], [bx, by]] = [CENTERS[a], CENTERS[b]];
  const len = Math.hypot(bx - ax, by - ay);
  const [ux, uy] = [(bx - ax) / len, (by - ay) / len];
  const gap = CELL / 2 / Math.max(Math.abs(ux), Math.abs(uy)) + 3;
  return [[ax + ux * gap, ay + uy * gap], [bx - ux * gap, by - uy * gap]];
}

// 세 풀이가 같이 쓰는 장면: (줄 이름표와 바탕), 연결선, 컴퓨터 칸, 네트워크 수 표시
function board(lane?: '스택' | '큐'): Scene {
  const items: Item[] = [];
  if (lane) {
    items.push({ id: 'lane:label', kind: 'text', rect: { x: 0, y: 0, w: 34, h: 40 }, text: lane }, { id: 'lane:bg', kind: 'zone', rect: { x: 34, y: 0, w: W - 34, h: 40 } });
  }
  for (const [a, b] of PAIRS) items.push({ id: edgeId(a, b), kind: 'line', rect: FULL, tone: 'trail', points: edgePoints(a, b) });
  for (let c = 0; c < N; c++) items.push({ id: cellId(c), kind: 'cell', rect: rectOf(c), tone: 'plain', text: String(c) });
  items.push({ id: 'count', kind: 'token', rect: COUNT_RECT, tone: 'plain', text: '네트워크 0개' });
  return { width: W, height: H, items };
}

const paint = (c: number, patch: ItemPatch, pop = false): Extract<Action, { type: 'set' }> => ({ type: 'set', id: cellId(c), patch, ...(pop ? { pop } : {}) });
const edgeTone = (a: number, b: number, tone: Tone): Action => ({ type: 'set', id: edgeId(a, b), patch: { tone } });
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => [{ type: 'unfocus' }, { type: 'clearMarks' }];
const countTo = (n: number): Action => ({ type: 'set', id: 'count', patch: { text: `네트워크 ${n}개` }, pop: true });
const dfsCall = (c: number) => `dfs(${c})`;

// from에서 looks의 컴퓨터마다 화살표를 긋는다(판정: 새 컴퓨터 / 방문함). 끝나면 흐림과 화살표를 걷는다
function lookAt(rec: StepRecorder, from: number, looks: Look[], extra: (l: Look) => Action[] = () => []) {
  rec.do({ type: 'focus', ids: [cellId(from), ...looks.map((l) => cellId(l.j))] });
  for (const l of looks) {
    rec.do({ type: 'arrow', from: cellId(from), to: cellId(l.j), verdict: l.verdict, label: VERDICT_LABEL[l.verdict] });
    for (const a of extra(l)) rec.do({ ...a, together: true });
  }
  rec.do(wait(120), ...together(clear()));
}

// 살핀 결과를 우리말로. 마지막 말만 끝맺는 꼴(mid: 이어지는 꼴, end: 끝맺는 꼴)로 쓴다
interface Clause { mid: string; end: string }
const sentence = (clauses: Clause[]) => `${clauses.map((c, k) => (k === clauses.length - 1 ? c.end : c.mid)).join(', ')}.`;
const lookText = (looks: Look[], onNew: (j: number) => Clause) =>
  sentence(looks.map((l) => (l.verdict === 'seen' ? { mid: `${l.j}번은 이미 방문했고`, end: `${l.j}번은 이미 방문했습니다` } : onNew(l.j))));
const goText = (j: number): Clause => ({ mid: `${j}번은 처음이라 ${ro(dfsCall(j))} 들어가고`, end: `${j}번은 처음이라 ${ro(dfsCall(j))} 들어갑니다` });
const markText = (j: number): Clause => ({ mid: `${j}번은 처음이라 표시하고`, end: `${j}번은 처음이라 표시합니다` });

/* ------------------------------------------------------------------ */
/* 정석 DFS: 들어가기 → 이웃 찾기 → 돌아가기(+ 네트워크 세기)              */
/* ------------------------------------------------------------------ */

// dfs를 코드와 똑같이 돌려, 들어감과 돌아옴을 일어난 차례로 모은다. 살핀 결과(looks)는 그 뒤 첫 사건에 붙는다.
interface Ev { kind: 'enter' | 'return'; node: number; parent?: number; looks: Look[] }
function dfsEvents(): Ev[] {
  const visited = Array<boolean>(N).fill(false);
  const events: Ev[] = [];
  let cur!: Ev;
  const dfs = (now: number, parent?: number) => {
    visited[now] = true;
    cur = { kind: 'enter', node: now, parent, looks: [] };
    events.push(cur);
    for (const next of linked(now)) {
      if (visited[next]) {
        cur.looks.push({ j: next, verdict: 'seen' });
      } else {
        cur.looks.push({ j: next, verdict: 'new' });
        dfs(next, now);
        cur = { kind: 'return', node: next, parent: now, looks: [] }; // next에서 돌아와 now가 이어서 살핀다
        events.push(cur);
      }
    }
  };
  for (let i = 0; i < N; i++) {
    if (visited[i]) continue;
    dfs(i);
    events.push({ kind: 'return', node: i, looks: [] });
  }
  return events;
}

function depthFirst(): Visualization {
  const rec = new StepRecorder(board('스택'));
  const lane = new Lane(rec, LANE);
  const visited = Array<boolean>(N).fill(false);
  const stack: number[] = [];
  let answer = 0;
  let marks = 0; // 방문 표시를 한 횟수
  let i: number | '-' = '-';
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({ work: marks, variables: { i, now: stack.at(-1) ?? '-', answer, visited: flags(visited) } });
  const token = (c: number) => ({ id: `frame:${c}`, text: dfsCall(c) });

  rec.step({ title: '아직 방문한 컴퓨터가 없음', codeHighlights: DFS_AT.start, ...meta() });
  rec.phase('시작', 'visited를 모두 False로, answer를 0으로 두고 0번 컴퓨터부터 차례로 살핍니다.');
  rec.do(wait(1000));

  // 살핀 것이 없어 바로 또 돌아오는 사건들은 한 단계로 묶는다(스택이 연달아 비워지는 모습)
  const groups: Ev[][] = [];
  for (const ev of dfsEvents()) {
    const prev = groups.at(-1)?.at(-1);
    if (ev.kind === 'return' && prev?.kind === 'return' && !prev.looks.length && prev.parent !== undefined) groups.at(-1)!.push(ev);
    else groups.push([ev]);
  }

  for (const group of groups) {
    const [first] = group;
    if (first.kind === 'enter') {
      const { node, parent, looks } = first;
      const root = parent === undefined;
      visited[node] = true;
      marks++;
      stack.push(node);
      if (root) i = node;
      rec.step({ title: root ? `${node}번에서 새 네트워크 시작` : `${node}번 들어가기`, codeHighlights: looks.length ? DFS_AT.look : root ? DFS_AT.enterRoot : DFS_AT.enter, ...meta() });
      rec.phase('들어가기', root
        ? `${node}번은 아직 방문 전이라 새 네트워크입니다. ${ro(dfsCall(node))} 들어갑니다.`
        : `${ro(dfsCall(node))} 들어가 ${node}번에 방문 표시를 합니다.`, root ? DFS_AT.enterRoot : DFS_AT.enter);
      rec.do(...together([
        paint(node, { tone: 'current' }, true),
        ...(parent !== undefined ? [paint(parent, { tone: 'trail' }), edgeTone(parent, node, 'path')] : []),
      ]));
      lane.push(token(node), cellId(node));
      if (looks.length) {
        rec.phase('이웃 찾기', lookText(looks, goText), DFS_AT.look);
        lookAt(rec, node, looks);
      }
    } else {
      const last = group.at(-1)!;
      const root = last.parent === undefined;
      const nodes = group.map((ev) => ev.node);
      group.forEach(() => stack.pop());
      if (root) answer++;
      const next = visited.indexOf(false); // 바깥 반복이 이어서 찾을 방문 전 컴퓨터
      rec.step({
        title: `${nodes.map((n) => `${n}번`).join(', ')} 끝${root ? ` — 네트워크 ${answer}개째 완성` : `, ${last.parent}번으로 돌아가기`}`,
        codeHighlights: root ? DFS_AT.count : last.looks.length ? DFS_AT.look : DFS_AT.back,
        ...meta(),
      });
      const ended = nodes.map(dfsCall);
      const endedText = `${[...ended.slice(0, -1), josa(ended.at(-1)!, '이', '가')].join(', ')}${ended.length > 1 ? ' 차례로' : ''}`;
      rec.phase('돌아가기', `더 갈 곳이 없어 ${endedText} 끝납니다. ${root ? '이어진 컴퓨터를 모두 찾았습니다.' : `${last.parent}번으로 돌아갑니다.`}`, DFS_AT.back);
      for (const ev of group) {
        lane.pop(cellId(ev.node));
        rec.do(...together([paint(ev.node, { tone: 'visited' }), ...(ev.parent !== undefined ? [paint(ev.parent, { tone: 'current' })] : [])], true));
      }
      rec.do(wait(150));
      if (last.looks.length) {
        rec.phase('이웃 찾기', `${last.parent}번이 이어서 살핍니다. ${lookText(last.looks, goText)}`, DFS_AT.look);
        lookAt(rec, last.parent!, last.looks);
      }
      if (root) {
        rec.phase('네트워크 세기', `answer += 1로 네트워크는 ${answer}개입니다. ${next >= 0 ? `이어서 i를 올리며 아직 방문 전인 ${next}번을 찾습니다.` : '이제 모든 컴퓨터를 방문했습니다.'}`, DFS_AT.count);
        rec.do(countTo(answer), wait(600));
      }
    }
  }

  i = '-';
  rec.step({ title: `모든 컴퓨터 확인 — 네트워크 ${answer}개`, codeHighlights: DFS_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('결과 확인', `방문 전인 컴퓨터가 더 없습니다. 네트워크는 ${answer}개이고, answer = ${josa(answer, '을', '를')} 돌려줍니다.`);
  rec.do(...together([...Array.from({ length: N }, (_, c) => paint(c, { tone: 'path' })), { type: 'set', id: 'count', patch: { tone: 'good' } }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 BFS: 새 네트워크 → 꺼내기 → 이웃 찾기 → 넣기                       */
/* ------------------------------------------------------------------ */

function breadthFirst(): Visualization {
  const rec = new StepRecorder(board('큐'));
  const lane = new Lane(rec, LANE);
  const visited = Array<boolean>(N).fill(false);
  const queue: number[] = [];
  let answer = 0;
  let marks = 0;
  let start: number | '-' = '-';
  let now: number | '-' = '-';
  let last: number | undefined; // 바로 전에 꺼낸 컴퓨터
  const meta = () => ({ work: marks, variables: { start, now, answer, visited: flags(visited), queue: `[${queue.join(', ')}]` } });
  const token = (c: number) => ({ id: `tok:${c}`, text: `${c}번` });

  rec.step({ title: '아직 방문한 컴퓨터가 없음', codeHighlights: BFS_AT.start, ...meta() });
  rec.phase('시작', 'visited를 모두 False로, answer를 0으로 두고 0번 컴퓨터부터 차례로 살핍니다.');
  rec.do(wait(1000));

  const bfs = (s: number) => {
    visited[s] = true;
    marks++;
    answer++;
    start = s;
    now = '-';
    queue.push(s);
    const before = last; // 앞 네트워크에서 마지막으로 꺼낸 컴퓨터는 이제 방문을 마친다
    last = undefined;
    rec.step({ title: `${s}번에서 새 네트워크 시작`, codeHighlights: BFS_AT.found, ...meta() });
    rec.phase('새 네트워크', `${s}번은 아직 방문 전이라 새 네트워크입니다. answer가 ${josa(answer, '이', '가')} 되고 ${s}번을 큐에 넣습니다.`, BFS_AT.found);
    rec.do(...together([paint(s, { tone: 'queued' }, true), countTo(answer), ...(before !== undefined ? [paint(before, { tone: 'visited' })] : [])]));
    lane.push(token(s), cellId(s));

    while (queue.length) {
      const c = queue.shift()!;
      const looks: Look[] = linked(c).map((j) => ({ j, verdict: visited[j] ? 'seen' : 'new' }));
      const news = looks.filter((l) => l.verdict === 'new').map((l) => l.j);
      for (const j of news) {
        visited[j] = true;
        marks++;
        queue.push(j);
      }
      now = c;
      rec.step({
        title: news.length ? `${c}번 꺼내고 ${news.map((j) => `${j}번`).join(', ')} 넣기` : `${c}번 꺼내기 — 넣을 컴퓨터 없음`,
        codeHighlights: news.length ? BFS_AT.push : BFS_AT.next,
        ...meta(),
      });
      rec.phase('꺼내기', `큐 맨 앞에서 ${c}번을 꺼냅니다.`, BFS_AT.pop);
      lane.shift(cellId(c));
      rec.do(...together([paint(c, { tone: 'current' }), ...(last !== undefined ? [paint(last, { tone: 'visited' })] : [])], true));
      last = c;
      rec.phase('이웃 찾기', looks.length ? `${c}번과 이어진 컴퓨터를 살핍니다. ${lookText(looks, markText)}` : `${c}번과 이어진 다른 컴퓨터가 없습니다.`,
        news.length ? BFS_AT.mark : BFS_AT.look);
      if (looks.length) lookAt(rec, c, looks, (l) => (l.verdict === 'new' ? [paint(l.j, { tone: 'queued' }, true), edgeTone(c, l.j, 'path')] : []));
      else rec.do(wait(300));
      rec.phase('넣기', news.length ? `새로 표시한 ${news.map((j) => `${j}번`).join(', ')}을 큐 뒤에 넣습니다.` : '새로 넣을 컴퓨터가 없어 그대로 넘어갑니다.',
        news.length ? BFS_AT.push : BFS_AT.next);
      for (const j of news) lane.push(token(j), cellId(j));
    }
  };

  for (let s = 0; s < N; s++) if (!visited[s]) bfs(s);

  start = '-';
  now = '-';
  rec.step({ title: `모든 컴퓨터 확인 — 네트워크 ${answer}개`, codeHighlights: BFS_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('결과 확인', `방문 전인 컴퓨터가 더 없습니다. 네트워크는 ${answer}개이고, answer = ${josa(answer, '을', '를')} 돌려줍니다.`);
  rec.do(...together([...Array.from({ length: N }, (_, c) => paint(c, { tone: 'path' })), { type: 'set', id: 'count', patch: { tone: 'good' } }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 직접 연결만 묶기: 확인하기 → 이웃 표시 → 네트워크 세기, 오답 확인    */
/* ------------------------------------------------------------------ */

function directOnly(): Visualization {
  const rec = new StepRecorder(board());
  const visited = Array<boolean>(N).fill(false);
  let answer = 0;
  let marks = 0;
  let i: number | '-' = '-';
  const meta = () => ({ work: marks, variables: { i, answer, visited: flags(visited) } });
  const truth = 2; // 정답(0-1-2-3, 4-5)
  const starts: number[] = []; // 새 네트워크로 센 컴퓨터

  rec.step({ title: '아직 방문한 컴퓨터가 없음', codeHighlights: DIRECT_AT.start, ...meta() });
  rec.phase('시작', 'visited를 모두 False로, answer를 0으로 둡니다. 방문 전인 컴퓨터마다 직접 이어진 것만 표시하며 네트워크를 셉니다.');
  rec.do(wait(1200));

  for (let c = 0; c < N; c++) {
    i = c;
    if (visited[c]) {
      rec.step({ title: `${c}번: 이미 방문함 → 건너뜀`, codeHighlights: DIRECT_AT.check, ...meta() });
      rec.phase('확인하기', `${c}번은 앞에서 이미 표시되어 있어 건너뜁니다.`, DIRECT_AT.check);
      rec.do({ type: 'focus', ids: [cellId(c)] }, wait(500), { type: 'unfocus' });
      continue;
    }
    const mine = linked(c);
    const marked = [c, ...mine]; // computers[c][c]도 1이라 자기 자신도 표시한다
    const fresh = mine.filter((j) => !visited[j]);
    marked.forEach((j) => (visited[j] = true));
    marks += marked.length;
    answer++;
    starts.push(c);
    rec.step({ title: `${c}번: 새 네트워크로 셈 (answer ${answer})`, codeHighlights: DIRECT_AT.count, ...meta() });
    rec.phase('확인하기', `${c}번은 아직 방문 전이라 새 네트워크로 셉니다.`, DIRECT_AT.check);
    rec.do(...together([paint(c, { tone: 'current' }, true), { type: 'focus', ids: [cellId(c)] }]), wait(200), { type: 'unfocus' });
    if (mine.length) {
      rec.phase('이웃 표시', `${c}번과 직접 이어진 ${mine.map((j) => `${j}번`).join(', ')}만 표시합니다. 그 이웃의 이웃은 보지 않습니다.`, DIRECT_AT.mark);
      lookAt(rec, c, mine.map((j): Look => ({ j, verdict: fresh.includes(j) ? 'new' : 'seen' })),
        (l) => (l.verdict === 'new' ? [paint(l.j, { tone: 'visited' }, true), edgeTone(c, l.j, 'path')] : [edgeTone(c, l.j, 'path')]));
    } else {
      rec.phase('이웃 표시', `${c}번과 이어진 다른 컴퓨터가 없습니다.`, DIRECT_AT.mark);
      rec.do(wait(300));
    }
    rec.phase('네트워크 세기', `answer += 1로 네트워크는 ${answer}개입니다.`, DIRECT_AT.count);
    rec.do(...together([paint(c, { tone: 'visited' }), countTo(answer)]), wait(400));
  }

  i = '-';
  rec.step({ title: `내 답 ${answer}, 정답은 ${truth}`, codeHighlights: DIRECT_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('오답 확인', `0, 1, 2, 3번은 서로 이어진 네트워크 하나인데 ${starts.filter((c) => c < 4).length}번이나 세어서 답이 ${josa(answer, '이', '가')} 되었습니다. 정답은 ${truth}입니다.`);
  rec.do(...together([0, 1, 2, 3].map((c) => paint(c, { tone: 'bad' }))));
  rec.do({ type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 210, y: 312, w: 90, h: 30 }, tone: 'bad', text: `내 답 ${answer}` } },
    { type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 310, y: 312, w: 90, h: 30 }, tone: 'good', text: `정답 ${truth}` }, together: true });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'network',
  title: '네트워크',
  level: 3,
  category: 'dfs-bfs',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/43162',
  description: {
    summary:
      '컴퓨터 n대 중 일부가 직접 연결되어 있습니다. 다른 컴퓨터를 거쳐 간접적으로라도 이어진 컴퓨터는 같은 네트워크입니다. 연결 정보가 담긴 n × n 표가 주어질 때, 네트워크가 모두 몇 개인지 구합니다.',
    rules: [
      '컴퓨터는 1대 이상 200대 이하이고, 번호는 0부터 n − 1까지',
      'i번과 j번이 직접 연결되어 있으면 computers[i][j]가 1',
      'computers[i][i]는 항상 1',
    ],
    examples: [
      { input: 'n = 3, computers = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]', output: '2' },
      { input: 'n = 3, computers = [[1, 1, 0], [1, 1, 1], [0, 1, 1]]', output: '1' },
    ],
  },
  keyIntuitions: [
    '"이어진 묶음의 개수"는 DFS나 BFS로 한 컴퓨터에서 갈 수 있는 곳을 모두 방문 표시한 횟수와 같습니다. 새로 시작할 때마다 네트워크가 하나 늘어납니다.',
    '직접 연결된 컴퓨터만 보면 안 됩니다. 0-1-2처럼 한 다리 건너 이어진 컴퓨터도 같은 네트워크라, 이웃의 이웃까지 끝까지 따라가야 합니다.',
    '방문 표시가 없는 컴퓨터를 만날 때만 새 탐색을 시작하므로, 한 컴퓨터는 딱 한 번만 방문합니다.',
  ],
  demo: { input: [N, COMPUTERS], label: 'n = 6, 연결: 0-1, 1-2, 1-3, 4-5' },
  workUnit: '방문 표시를 한 횟수',
  approaches: [
    {
      id: 'network-dfs',
      name: '깊이 우선 탐색 (DFS 연결 요소)',
      rank: 'BEST',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n) 재귀 깊이',
      verdict: '방문 전 컴퓨터에서 이어진 곳을 끝까지 파고들며 시작 횟수를 세는 정석 풀이입니다.',
      pros: [
        '재귀 함수 몇 줄로 "이어진 곳을 모두 방문 표시"를 끝냅니다.',
        '컴퓨터마다 한 번만 방문하고 표를 한 줄씩 읽어 O(n²)로 끝납니다.',
        '탐색을 새로 시작한 횟수가 곧 정답이라 따로 묶음을 관리할 필요가 없습니다.',
      ],
      cons: ['컴퓨터가 많아 한 줄로 길게 이어지면 재귀가 깊어집니다(이 문제는 n ≤ 200이라 괜찮습니다).'],
      whyThisRank:
        '연결 요소의 개수를 세는 가장 짧고 대표적인 풀이입니다. n이 작아 재귀 깊이 걱정이 없고, BFS와 시간 복잡도도 같습니다.',
      code: DFS,
      visualize: depthFirst,
    },
    {
      id: 'network-bfs',
      name: '너비 우선 탐색 (BFS)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n) 큐',
      verdict: '답과 복잡도는 같지만 큐 코드가 조금 더 길어지는 풀이입니다.',
      pros: [
        '재귀를 쓰지 않아 재귀 한도를 걱정하지 않아도 됩니다.',
        '가까운 컴퓨터부터 한 겹씩 넓혀 가는 모습이 눈에 잘 들어옵니다.',
      ],
      cons: [
        '큐를 만들고 꺼내고 넣는 코드가 DFS 재귀보다 깁니다. JavaScript에는 덱이 없어 머리 인덱스도 따로 관리해야 합니다.',
        '이 문제는 거리를 묻지 않아 BFS의 장점(최단 거리)을 쓸 일이 없습니다.',
      ],
      whyThisRank:
        '묶음의 개수만 세는 문제라 DFS와 BFS는 결과가 같습니다. 코드가 더 짧은 DFS가 시험에서 더 쓰기 좋아 대안으로 둡니다.',
      code: BFS,
      visualize: breadthFirst,
    },
    {
      id: 'network-direct',
      name: '직접 연결된 컴퓨터만 묶기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)',
      verdict: '빠르고 간단해 보이지만 한 다리 건너 이어진 컴퓨터를 놓쳐 오답이 나옵니다.',
      pros: ['반복문 두 겹이면 끝나는 가장 짧은 코드입니다.'],
      cons: [
        '시작한 컴퓨터와 직접 이어진 컴퓨터까지만 방문 표시를 해서, 그 이웃의 이웃은 방문 전으로 남습니다.',
        '0-1, 1-2, 1-3으로 이어진 네트워크 하나를 0번, 2번, 3번에서 세 번 세어 오답이 됩니다. 연결이 한 겹뿐인 예제는 우연히 맞아 실수를 알아채기 어렵습니다.',
      ],
      whyThisRank:
        '문제는 간접적으로 이어진 컴퓨터도 같은 네트워크로 본다고 합니다. 이웃의 이웃까지 끝까지 따라가려면 DFS나 BFS로 방문을 이어 가야 합니다.',
      code: DIRECT,
      visualize: directOnly,
    },
  ],
  checks: {
    cases: [
      { args: [3, [[1, 1, 0], [1, 1, 0], [0, 0, 1]]], expected: 2 },
      { args: [3, [[1, 1, 0], [1, 1, 1], [0, 1, 1]]], expected: 1 },
      { args: [1, [[1]]], expected: 1 },
      { args: [3, [[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: 3 },
      { args: [4, [[1, 1, 0, 0], [1, 1, 1, 0], [0, 1, 1, 1], [0, 0, 1, 1]]], expected: 1 },
      { args: [N, COMPUTERS], expected: 2 },
    ],
    // 컴퓨터 1~7대, 두 컴퓨터가 직접 이어질 확률 25%(대칭 표, 대각선은 늘 1)
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 7);
      const computers = Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => (a === b ? 1 : 0)));
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (rand() < 0.25) computers[a][b] = computers[b][a] = 1;
      return [n, computers];
    },
  },
};

export default problem;
