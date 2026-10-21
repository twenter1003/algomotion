// 단어 변환: 정석 BFS, 대안 DFS 모든 길(백트래킹), 함정 DFS 처음 찾은 길을 같은 단어 그래프에서 움직인다.
// 장면은 위에 줄(BFS 큐, DFS 스택), 가운데에 단어 7개(칸)와 한 글자만 다른 단어끼리 잇는 선, 칸 밑에 거리(바꾼 횟수) 표시다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import type { Action, Item, ItemPatch, Point, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';
import { fit } from './pacing.ts';

interface Look { w: string; verdict: 'seen' | 'new' }

// 시각화 입력: 원문 예제 1. words의 차례 때문에 DFS는 hit → hot → dot → dog → log → cog(5번)를 먼저 찾지만,
// dog에서 cog으로 바로 가면 4번이다. 시각화에 나오는 영어 단어는 모두 t나 g로 끝나 받침 있는 조사를 쓴다.
const BEGIN = 'hit';
const TARGET = 'cog';
const WORDS = ['hot', 'dot', 'dog', 'lot', 'log', 'cog'];
const NODES = [BEGIN, ...WORDS];
const diffOne = (a: string, b: string) => [...a].filter((ch, i) => ch !== b[i]).length === 1;
const near = (w: string) => WORDS.filter((x) => diffOne(w, x)); // w와 한 글자만 다른 words의 단어(words 차례대로)
const PAIRS = NODES.flatMap((a, i) => NODES.slice(i + 1).filter((b) => diffOne(a, b)).map((b): [string, string] => [a, b]));
const setText = (ws: Iterable<string>) => `{${[...ws].join(', ')}}`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BFS = {
  python: `from collections import deque

def solution(begin, target, words):
    if target not in words:
        return 0

    def diff_one(a, b):  # 한 글자만 다르면 True
        return sum(x != y for x, y in zip(a, b)) == 1

    queue = deque([(begin, 0)])  # (단어, 바꾼 횟수)
    visited = {begin}
    while queue:
        now, count = queue.popleft()
        if now == target:
            return count  # 목표를 처음 꺼낸 순간의 횟수가 최소
        for word in words:
            if word not in visited and diff_one(now, word):
                visited.add(word)
                queue.append((word, count + 1))
    return 0`,
  javascript: `function solution(begin, target, words) {
  if (!words.includes(target)) return 0;

  const diffOne = (a, b) => { // 한 글자만 다르면 true
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff === 1;
  };

  const queue = [[begin, 0]]; // [단어, 바꾼 횟수]
  const visited = new Set([begin]);
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [now, count] = queue[head++];
    if (now === target) return count; // 목표를 처음 꺼낸 순간의 횟수가 최소
    for (const word of words) {
      if (!visited.has(word) && diffOne(now, word)) {
        visited.add(word);
        queue.push([word, count + 1]);
      }
    }
  }
  return 0;
}`,
};
const BFS_AT = {
  start: lines(BFS, ['queue = deque([(begin, 0)])', 'visited = {begin}'], ['const queue = [[begin, 0]]', 'const visited = new Set([begin])']),
  pop: lines(BFS, ['while queue:', 'now, count = queue.popleft()'], ['while (head < queue.length)', 'const [now, count] = queue[head++]']),
  look: lines(BFS, ['for word in words', 'if word not in visited and diff_one(now, word)'], ['for (const word of words)', 'if (!visited.has(word) && diffOne(now, word))']),
  mark: lines(BFS, ['for word in words', 'if word not in visited and diff_one(now, word)', 'visited.add(word)'],
    ['for (const word of words)', 'if (!visited.has(word) && diffOne(now, word))', 'visited.add(word)']),
  push: lines(BFS, ['queue.append((word, count + 1))'], ['queue.push([word, count + 1])']),
  next: lines(BFS, ['while queue:'], ['while (head < queue.length)']),
  goal: lines(BFS, ['if now == target', 'return count'], ['if (now === target) return count']),
};

const ALL = {
  python: `def solution(begin, target, words):
    if target not in words:
        return 0

    def diff_one(a, b):  # 한 글자만 다르면 True
        return sum(x != y for x, y in zip(a, b)) == 1

    visited = [False] * len(words)
    best = float('inf')

    def dfs(now, count):
        nonlocal best
        if now == target:
            best = min(best, count)  # 더 짧은 길이 있을 수 있어 멈추지 않고 계속
            return
        for i, word in enumerate(words):
            if not visited[i] and diff_one(now, word):
                visited[i] = True
                dfs(word, count + 1)
                visited[i] = False  # 되돌리기 → 다른 길도 모두 시도

    dfs(begin, 0)
    return 0 if best == float('inf') else best`,
  javascript: `function solution(begin, target, words) {
  if (!words.includes(target)) return 0;

  const diffOne = (a, b) => { // 한 글자만 다르면 true
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff === 1;
  };

  const visited = Array(words.length).fill(false);
  let best = Infinity;

  const dfs = (now, count) => {
    if (now === target) {
      best = Math.min(best, count); // 더 짧은 길이 있을 수 있어 멈추지 않고 계속
      return;
    }
    for (let i = 0; i < words.length; i++) {
      if (!visited[i] && diffOne(now, words[i])) {
        visited[i] = true;
        dfs(words[i], count + 1);
        visited[i] = false; // 되돌리기 → 다른 길도 모두 시도
      }
    }
  };

  dfs(begin, 0);
  return best === Infinity ? 0 : best;
}`,
};
const ALL_AT = {
  start: lines(ALL, ['visited = [False] * len(words)', "best = float('inf')", 'dfs(begin, 0)'], ['const visited = Array(words.length)', 'let best = Infinity', 'dfs(begin, 0)']),
  enter: lines(ALL, ['visited[i] = True', 'dfs(word, count + 1)'], ['visited[i] = true', 'dfs(words[i], count + 1)']),
  look: lines(ALL, ['for i, word in enumerate(words)', 'if not visited[i] and diff_one(now, word)'], ['for (let i = 0; i < words.length; i++)', 'if (!visited[i] && diffOne(now, words[i]))']),
  found: lines(ALL, ['if now == target', 'best = min(best, count)'], ['if (now === target)', 'best = Math.min(best, count)']),
  back: lines(ALL, ['visited[i] = False'], ['visited[i] = false']),
  done: lines(ALL, ['dfs(begin, 0)', "return 0 if best == float('inf') else best"], ['dfs(begin, 0)', 'return best === Infinity ? 0 : best']),
};

const FIRST = {
  python: `# 주의: 오답이 나오는 풀이입니다 (처음 도착한 길을 최단이라고 믿습니다)
def solution(begin, target, words):
    if target not in words:
        return 0

    def diff_one(a, b):  # 한 글자만 다르면 True
        return sum(x != y for x, y in zip(a, b)) == 1

    visited = [False] * len(words)

    def dfs(now, count):
        if now == target:
            return count  # 처음 도착한 길의 횟수를 바로 돌려줌
        for i, word in enumerate(words):
            if not visited[i] and diff_one(now, word):
                visited[i] = True
                found = dfs(word, count + 1)
                if found:
                    return found
                visited[i] = False
        return 0

    return dfs(begin, 0)`,
  javascript: `// 주의: 오답이 나오는 풀이입니다 (처음 도착한 길을 최단이라고 믿습니다)
function solution(begin, target, words) {
  if (!words.includes(target)) return 0;

  const diffOne = (a, b) => { // 한 글자만 다르면 true
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff === 1;
  };

  const visited = Array(words.length).fill(false);

  const dfs = (now, count) => {
    if (now === target) return count; // 처음 도착한 길의 횟수를 바로 돌려줌
    for (let i = 0; i < words.length; i++) {
      if (!visited[i] && diffOne(now, words[i])) {
        visited[i] = true;
        const found = dfs(words[i], count + 1);
        if (found) return found;
        visited[i] = false;
      }
    }
    return 0;
  };

  return dfs(begin, 0);
}`,
};
const FIRST_AT = {
  start: lines(FIRST, ['visited = [False] * len(words)', 'return dfs(begin, 0)'], ['const visited = Array(words.length)', 'return dfs(begin, 0)']),
  enter: lines(FIRST, ['visited[i] = True', 'found = dfs(word, count + 1)'], ['visited[i] = true', 'const found = dfs(words[i], count + 1)']),
  look: lines(FIRST, ['for i, word in enumerate(words)', 'if not visited[i] and diff_one(now, word)'], ['for (let i = 0; i < words.length; i++)', 'if (!visited[i] && diffOne(now, words[i]))']),
  found: lines(FIRST, ['if now == target', 'return count'], ['if (now === target) return count']),
  back: lines(FIRST, ['if found', 'visited[i] = False'], ['if (found) return found', 'visited[i] = false']),
  done: lines(FIRST, ['if found', 'return found'], ['if (found) return found']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로 0~548, 세로: 줄 0~40, 단어 칸 y 83~297(54px 칸), 칸 밑 거리 표시 한 줄, 맨 아래 표시 326~356.
// 칸 가운데 좌표: 단어는 BFS 거리(바꾼 횟수)별로 한 칸씩 오른쪽에 놓았다.
const CELL = 54;
const W = 548;
const H = 360;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다
const CENTERS: Record<string, Point> = {
  hit: [40, 190], hot: [150, 190], dot: [270, 110], lot: [270, 270], dog: [390, 110], log: [390, 270], cog: [506, 190],
};
const LANE: LaneOptions = { id: 'lane', x: 40, y: 5, slotW: 56, slotH: 30, gap: 6, max: 7 };
const rectOf = (w: string): Rect => ({ x: CENTERS[w][0] - CELL / 2, y: CENTERS[w][1] - CELL / 2, w: CELL, h: CELL });
const cellId = (w: string) => `w:${w}`;
const edgeId = (a: string, b: string) => `edge:${[a, b].sort().join('-')}`;
const badgeId = (w: string) => `dist:${w}`;
const BOTTOM = 326;
const VERDICT_LABEL = { seen: '방문함', new: '새 단어' } as const;

// 두 칸 가운데를 잇는 선을 칸 테두리에서 3px 띄워 자른다
function edgePoints(a: string, b: string): Point[] {
  const [[ax, ay], [bx, by]] = [CENTERS[a], CENTERS[b]];
  const len = Math.hypot(bx - ax, by - ay);
  const [ux, uy] = [(bx - ax) / len, (by - ay) / len];
  const gap = CELL / 2 / Math.max(Math.abs(ux), Math.abs(uy)) + 3;
  return [[ax + ux * gap, ay + uy * gap], [bx - ux * gap, by - uy * gap]];
}

// 세 풀이가 같이 쓰는 장면: 줄 이름표와 바탕, 연결선, 단어 칸. extra는 풀이마다 다른 아래쪽 표시
function board(lane: '큐' | '스택', ...extra: Item[]): Scene {
  const items: Item[] = [
    { id: 'lane:label', kind: 'text', rect: { x: 0, y: 0, w: 34, h: 40 }, text: lane },
    { id: 'lane:bg', kind: 'zone', rect: { x: 34, y: 0, w: W - 34, h: 40 } },
  ];
  for (const [a, b] of PAIRS) items.push({ id: edgeId(a, b), kind: 'line', rect: FULL, tone: 'trail', points: edgePoints(a, b) });
  for (const w of NODES) {
    const tag = w === BEGIN ? 'begin' : w === TARGET ? 'target' : undefined;
    items.push({ id: cellId(w), kind: 'cell', rect: rectOf(w), tone: 'plain', text: w, ...(tag ? { tag } : {}) });
  }
  items.push(...extra);
  return { width: W, height: H, items };
}

const paint = (w: string, patch: ItemPatch, pop = false): Extract<Action, { type: 'set' }> => ({ type: 'set', id: cellId(w), patch, ...(pop ? { pop } : {}) });
const edgeTone = (a: string, b: string, tone: Tone): Action => ({ type: 'set', id: edgeId(a, b), patch: { tone } });
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => [{ type: 'unfocus' }, { type: 'clearMarks' }];
// 칸 밑 거리 표시(알약): 거리를 처음 적을 때 칸에서 나타난다
const badge = (w: string, n: number): Action => ({
  type: 'add',
  item: { id: badgeId(w), kind: 'token', rect: { x: CENTERS[w][0] - 13, y: CENTERS[w][1] + CELL / 2 + 3, w: 26, h: 20 }, tone: 'plain', text: String(n) },
  from: cellId(w),
});

// from에서 looks의 단어마다 화살표를 긋는다. 끝나면 흐림과 화살표를 걷는다
function lookAt(rec: StepRecorder, from: string, looks: Look[], extra: (l: Look) => Action[] = () => []) {
  rec.do({ type: 'focus', ids: [cellId(from), ...looks.map((l) => cellId(l.w))] });
  for (const l of looks) {
    rec.do({ type: 'arrow', from: cellId(from), to: cellId(l.w), verdict: l.verdict, label: VERDICT_LABEL[l.verdict] });
    for (const a of extra(l)) rec.do({ ...a, together: true });
  }
  rec.do(wait(120), ...together(clear()));
}

// 살핀 결과를 우리말로: 연달아 같은 판정이 난 단어는 한 마디로 묶고, 마지막 말만 끝맺는 꼴(mid: 이어지는 꼴, end: 끝맺는 꼴)로 쓴다.
// 단어는 모두 t나 g로 끝나 받침 있는 조사(은·을·이·으로)를 쓴다.
interface Clause { mid: string; end: string }
const sentence = (clauses: Clause[]) => `${clauses.map((c, k) => (k === clauses.length - 1 ? c.end : c.mid)).join(', ')}.`;
const lookText = (looks: Look[], onNew: (ws: string) => Clause) => {
  const runs: { verdict: Look['verdict']; ws: string[] }[] = [];
  for (const l of looks) {
    if (runs.at(-1)?.verdict === l.verdict) runs.at(-1)!.ws.push(l.w);
    else runs.push({ verdict: l.verdict, ws: [l.w] });
  }
  return sentence(runs.map(({ verdict, ws }) => (verdict === 'seen'
    ? { mid: `${ws.join(', ')}은 이미 썼고`, end: `${ws.join(', ')}은 이미 썼습니다` }
    : onNew(ws.join(', ')))));
};

/* ------------------------------------------------------------------ */
/* 정석 BFS: 꺼내기 → 살피기 → 넣기, 도착                                  */
/* ------------------------------------------------------------------ */

function breadthFirst(): Visualization {
  const rec = new StepRecorder(board('큐'));
  const lane = new Lane(rec, LANE);
  const dist = new Map<string, number>([[BEGIN, 0]]);
  const prev = new Map<string, string>();
  const queue: string[] = [BEGIN];
  let pops = 0;
  let now: string | '-' = '-';
  let last: string | undefined; // 바로 전에 꺼낸 단어
  const meta = () => ({
    work: pops,
    variables: {
      now,
      count: now === '-' ? '-' : dist.get(now)!,
      queue: `[${queue.map((w) => `(${w}, ${dist.get(w)})`).join(', ')}]`,
      visited: setText(dist.keys()),
    },
  });
  const token = (w: string) => ({ id: `tok:${w}`, text: w });

  rec.step({ title: `${BEGIN}을 큐에 넣고 시작`, codeHighlights: BFS_AT.start, ...meta() });
  rec.phase('시작', `begin ${BEGIN}을 바꾼 횟수 0으로 큐에 넣고 방문 표시를 합니다.`);
  rec.do(...together([paint(BEGIN, { tone: 'queued' }, true), badge(BEGIN, 0)]));
  lane.push(token(BEGIN), cellId(BEGIN));

  while (queue.length) {
    const w = queue.shift()!;
    pops++;
    now = w;
    const d = dist.get(w)!;
    const takeOut = () => {
      lane.shift(cellId(w));
      rec.do(...together([paint(w, { tone: 'current' }), ...(last !== undefined ? [paint(last, { tone: 'visited' })] : [])], true));
      last = w;
    };

    if (w === TARGET) {
      const path = [w];
      while (prev.has(path[0])) path.unshift(prev.get(path[0])!);
      rec.step({ title: `목표 ${w} 꺼내기 — 최소 ${d}번`, codeHighlights: BFS_AT.goal, ...meta(), answer: d, isKeyframe: true });
      rec.phase('꺼내기', `큐 맨 앞에서 목표 단어 ${w}을 꺼냈습니다.`, BFS_AT.pop);
      takeOut();
      rec.phase('도착', `${w}을 처음 꺼낸 순간의 횟수 ${josa(d, '이', '가')} 답입니다. ${path.join(' → ')} 순서로 ${d}번 바꾸면 됩니다.`);
      const onPath = new Set(path);
      const hops = path.slice(1).map((x, k): [string, string] => [path[k], x]);
      const isHop = (a: string, b: string) => hops.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
      rec.do(...together([
        ...[...onPath].map((x) => paint(x, { tone: 'path' })),
        ...PAIRS.map(([a, b]) => edgeTone(a, b, isHop(a, b) ? 'path' : 'trail')),
      ]));
      break;
    }

    const looks: Look[] = near(w).map((x) => ({ w: x, verdict: dist.has(x) ? 'seen' : 'new' }));
    const news = looks.filter((l) => l.verdict === 'new').map((l) => l.w);
    for (const x of news) {
      dist.set(x, d + 1);
      prev.set(x, w);
      queue.push(x);
    }
    rec.step({
      title: news.length ? `${w} 꺼내고 ${news.join(', ')} 넣기` : `${w} 꺼내기 — 넣을 단어 없음`,
      codeHighlights: news.length ? BFS_AT.push : BFS_AT.next,
      ...meta(),
    });
    rec.phase('꺼내기', `큐 맨 앞에서 ${w}을 꺼냅니다. 바꾼 횟수는 ${d}입니다.`, BFS_AT.pop);
    takeOut();
    rec.phase('살피기', looks.length
      ? `한 글자만 다른 단어를 찾습니다. ${lookText(looks, (ws) => ({ mid: `${ws}은 처음이라 방문 표시를 하고`, end: `${ws}은 처음이라 방문 표시를 합니다` }))}`
      : '한 글자만 다른 단어가 없습니다.', news.length ? BFS_AT.mark : BFS_AT.look);
    if (looks.length) {
      lookAt(rec, w, looks, (l) => (l.verdict === 'new' ? [paint(l.w, { tone: 'queued' }, true), edgeTone(w, l.w, 'path')] : []));
    } else {
      rec.do(wait(300));
    }
    rec.phase('넣기', news.length ? `새로 찾은 ${news.join(', ')}을 바꾼 횟수 ${josa(d + 1, '과', '와')} 함께 큐 뒤에 넣습니다.` : '새로 넣을 단어가 없어 그대로 넘어갑니다.', news.length ? BFS_AT.push : BFS_AT.next);
    for (const x of news) {
      lane.push(token(x), cellId(x));
      rec.do({ ...badge(x, d + 1), together: true }); // 큐에 넣는 토큰과 함께 칸 밑에 거리가 적힌다
    }
  }
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 DFS 모든 길 · 함정 DFS 처음 찾은 길: 들어가기 → 살피기 → 돌아가기    */
/* ------------------------------------------------------------------ */

// dfs를 코드와 똑같이 돌려, 들어감과 돌아옴을 일어난 차례로 모은다. 살핀 결과(looks)는 그 뒤 첫 사건에 붙는다.
// first이면 목표에 처음 닿는 순간 멈춘다(함정 코드의 return found).
interface Ev { kind: 'enter' | 'return'; node: string; parent?: string; looks: Look[]; count: number; calls: number; best: number }
function dfsEvents(first: boolean): { events: Ev[]; calls: number; best: number } {
  const used = new Set<string>();
  const events: Ev[] = [];
  let calls = 0;
  let best = Infinity;
  let stop = false;
  let cur!: Ev;
  const add = (kind: Ev['kind'], node: string, parent: string | undefined, count: number) => {
    cur = { kind, node, parent, looks: [], count, calls, best };
    events.push(cur);
  };
  const dfs = (now: string, count: number, parent?: string) => {
    calls++;
    if (now === TARGET) best = Math.min(best, count);
    add('enter', now, parent, count);
    if (now === TARGET) {
      if (first) stop = true;
      return;
    }
    for (const w of near(now)) {
      if (used.has(w)) {
        cur.looks.push({ w, verdict: 'seen' });
        continue;
      }
      cur.looks.push({ w, verdict: 'new' });
      used.add(w);
      dfs(w, count + 1, now);
      if (stop) return;
      used.delete(w);
      add('return', w, now, count + 1); // w에서 돌아와 now가 이어서 살핀다
    }
  };
  dfs(BEGIN, 0);
  return { events, calls, best };
}

function depthFirst(first: boolean): Visualization {
  const AT = first ? FIRST_AT : ALL_AT;
  const { events, calls: totalCalls, best: finalBest } = dfsEvents(first);
  const rec = new StepRecorder(board('스택', ...(first ? [] : [{ id: 'best', kind: 'token', rect: { x: 0, y: BOTTOM, w: 100, h: 30 }, tone: 'plain', text: 'best ∞' } as Item])));
  const lane = new Lane(rec, LANE);
  const used = new Set<string>();
  const stack: string[] = [];
  let calls = 0;
  let best = Infinity;
  let result: number | '-' = '-';
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({
    work: calls,
    variables: {
      now: stack.at(-1) ?? '-',
      count: stack.length ? stack.length - 1 : '-',
      ...(first ? { '돌려줄 값': result } : { best: best === Infinity ? '∞' : best }),
      visited: setText(WORDS.filter((w) => used.has(w))),
    },
  });
  const token = (w: string) => ({ id: `frame:${w}`, text: w });

  // 보여 줄 사건: 모든 길 풀이는 최소가 처음 정해지는 사건까지만 한 단계씩 보이고, 나머지는 빨리 감기로 묶는다
  const cut = first ? events.length : events.findIndex((e) => e.kind === 'enter' && e.node === TARGET && e.best === finalBest) + 1;
  const shown = events.slice(0, cut);
  // 살핀 것이 없어 바로 또 돌아오는 사건들은 한 단계로 묶는다(스택이 연달아 비워지는 모습)
  const groups: Ev[][] = [];
  for (const ev of shown) {
    const prev = groups.at(-1)?.at(-1);
    if (ev.kind === 'return' && prev?.kind === 'return' && !prev.looks.length) groups.at(-1)!.push(ev);
    else groups.push([ev]);
  }

  groups.forEach((group, g) => {
    const [head] = group;
    if (head.kind === 'enter') {
      const { node, parent, looks, count } = head;
      const start = g === 0;
      calls = head.calls;
      stack.push(node);
      if (parent !== undefined) used.add(node);
      const isTarget = node === TARGET;
      if (isTarget) {
        best = Math.min(best, count);
        if (first) result = count;
      }
      rec.step({
        title: start ? `${node}에서 시작` : isTarget ? `${node} 도착 — ${count}번` : `${node} 들어가기`,
        codeHighlights: isTarget ? AT.found : looks.length ? AT.look : AT.enter,
        ...meta(),
        ...(first && isTarget ? { answer: count, isKeyframe: true } : {}),
      });
      rec.phase('들어가기', start
        ? `begin ${node}에서 dfs를 시작합니다. 바꾼 횟수는 0입니다.`
        : `${node}으로 들어갑니다. 지금까지 ${count}번 바꿨습니다.`, start ? AT.start : AT.enter);
      rec.do(...together([
        paint(node, { tone: 'current' }, true),
        ...(parent !== undefined ? [paint(parent, { tone: 'trail' }), edgeTone(parent, node, 'path')] : []),
        badge(node, count),
      ]));
      lane.push(token(node), cellId(node));
      if (isTarget) {
        const before = events[events.indexOf(head) - 1]?.best ?? Infinity; // 이 도착 직전까지의 최소
        rec.phase('도착', first
          ? `목표 단어 ${node}에 처음 도착했습니다! 바꾼 횟수 ${count}번을 그대로 돌려주고 끝냅니다.`
          : before === Infinity
            ? `목표 단어 ${node}에 도착했습니다. ${count}번 바꾼 첫 길이라 best = ${count}입니다. 더 짧은 길이 있을 수 있어 멈추지 않습니다.`
            : `목표 단어 ${node}에 도착했습니다. ${count}번으로 지금까지의 best ${before}보다 ${count < before ? '짧아 best를 바꿉니다' : '짧지 않아 그대로입니다'}.`, AT.found);
        rec.do(...together([paint(node, { tone: 'good' }), ...(first ? [] : [{ type: 'set', id: 'best', patch: { text: `best ${best}` }, pop: true } as Action])]), wait(400));
      } else if (looks.length) {
        rec.phase('살피기', `한 글자만 다른 단어를 words 순서로 봅니다. ${lookText(looks, (ws) => ({ mid: `${ws}은 아직 안 썼으니 들어가고`, end: `${ws}은 아직 안 썼으니 들어갑니다` }))}`, AT.look);
        lookAt(rec, node, looks);
      }
    } else {
      const last = group.at(-1)!;
      const nodes = group.map((ev) => ev.node);
      group.forEach((ev) => {
        stack.pop();
        used.delete(ev.node);
      });
      rec.step({
        title: `${nodes.join(', ')} 끝, ${last.parent}으로 돌아가기`,
        codeHighlights: last.looks.length ? AT.look : AT.back,
        ...meta(),
      });
      const deadEnd = group[0].node !== TARGET;
      rec.phase('돌아가기', `${nodes.join(', ')}에서 ${deadEnd ? '갈 곳이 없어' : '목표 처리를 마치고'} ${last.parent}으로 돌아가며 방문 표시를 되돌립니다.`, AT.back);
      for (const ev of group) {
        lane.pop(cellId(ev.node));
        rec.do(...together([
          paint(ev.node, { tone: 'plain' }),
          edgeTone(ev.node, ev.parent!, 'trail'),
          paint(ev.parent!, { tone: 'current' }),
          { type: 'remove', id: badgeId(ev.node) },
        ], true));
      }
      rec.do(wait(150));
      if (last.looks.length) {
        rec.phase('살피기', `${last.parent}이 이어서 한 글자만 다른 단어를 봅니다. ${lookText(last.looks, (ws) => ({ mid: `${ws}은 아직 안 썼으니 들어가고`, end: `${ws}은 아직 안 썼으니 들어갑니다` }))}`, AT.look);
        lookAt(rec, last.parent!, last.looks);
      }
    }
  });

  // 줄(스택)에 남은 토큰을 한꺼번에 칸으로 돌려보낸다
  const flush = () => rec.do(...together(lane.ids.map((id): Action => ({ type: 'remove', id, into: cellId(id.slice('frame:'.length)) }))));
  const shortest = ['hit', 'hot', 'dot', 'dog', 'cog']; // 정답 길(4번)
  const isHop = (a: string, b: string) => shortest.some((x, k) => k && ((shortest[k - 1] === a && x === b) || (shortest[k - 1] === b && x === a)));
  const paintShortest = (offPath: Tone) => together([
    ...NODES.filter((w) => rec.get(cellId(w)).tone !== 'plain' || shortest.includes(w)).map((w) => paint(w, { tone: shortest.includes(w) ? 'path' : offPath })),
    ...PAIRS.map(([a, b]) => edgeTone(a, b, isHop(a, b) ? 'path' : 'trail')),
  ]);

  if (first) {
    // 목표에서 받은 값이 위로 그대로 전해져 dfs가 끝난다. 처음 닿은 길 중 정답 길이 아닌 단어는 오답 색으로 보인다
    const detour = stack.slice();
    stack.length = 0;
    rec.step({ title: `내 답 ${result}, 정답은 4`, codeHighlights: AT.done, ...meta(), answer: result, isKeyframe: true });
    rec.phase('돌아가기', `목표에서 받은 ${josa(result, '을', '를')} 모든 호출이 그대로 위로 돌려주며 dfs가 끝납니다.`, AT.done);
    flush();
    rec.phase('오답 확인', `처음 닿은 길은 ${detour.join(' → ')}(${result}번)입니다. 그런데 dog에서 cog으로 바로 가면 4번이라, 길이를 비교하지 않은 이 답은 틀렸습니다.`);
    rec.do(...paintShortest('bad'));
    rec.do({ type: 'add', item: { id: 'mine', kind: 'token', rect: { x: 0, y: BOTTOM, w: 100, h: 30 }, tone: 'bad', text: `내 답 ${result}` } },
      { type: 'add', item: { id: 'truth', kind: 'token', rect: { x: 110, y: BOTTOM, w: 100, h: 30 }, tone: 'good', text: '정답 4' }, together: true });
    return fit(rec.finish());
  }

  // 모든 길: 남은 호출은 빨리 감기로 묶는다. 더 짧은 길은 나오지 않고, 스택이 비며 최소가 된 길만 분홍으로 남는다
  const left = totalCalls - calls;
  calls = totalCalls;
  stack.length = 0;
  used.clear();
  best = finalBest;
  rec.step({ title: `나머지 길 확인 — 최소 ${best}번`, codeHighlights: AT.done, ...meta(), answer: best, isKeyframe: true });
  rec.phase('빨리 감기', `나머지 길도 모두 확인하려고 dfs를 ${left}번 더 부릅니다. 더 짧은 길은 없어 best는 ${best}번 그대로입니다.`, AT.look);
  flush();
  rec.phase('결과 확인', `dfs는 모두 ${totalCalls}번 불렸고(BFS는 7번), best = ${josa(best, '을', '를')} 돌려줍니다.`, AT.done);
  rec.do(...paintShortest('plain'));
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'word-conversion',
  title: '단어 변환',
  level: 3,
  category: 'dfs-bfs',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/43163',
  description: {
    summary:
      '시작 단어 begin을 목표 단어 target으로 바꾸려 합니다. 한 번에 알파벳 한 글자만 바꿀 수 있고, 바꾼 단어는 반드시 words 안에 있어야 합니다. 가장 적게 바꾸는 횟수를 구하고, 바꿀 수 없으면 0을 돌려줍니다.',
    rules: [
      '모든 단어는 알파벳 소문자이고 길이가 3 이상 10 이하로 같음',
      'words는 3개 이상 50개 이하이고 같은 단어가 없음',
      'begin과 target은 서로 다름',
      '변환할 수 없으면 0 반환',
    ],
    examples: [
      { input: 'begin = "hit", target = "cog", words = ["hot", "dot", "dog", "lot", "log", "cog"]', output: '4' },
      { input: 'begin = "hit", target = "cog", words = ["hot", "dot", "dog", "lot", "log"]', output: '0' },
    ],
  },
  keyIntuitions: [
    '단어를 점, 한 글자만 다른 단어끼리를 선으로 보면 "최소 횟수"는 가중치 없는 그래프의 최단 거리이고, 이는 BFS가 가장 잘 푸는 문제입니다.',
    'BFS는 가까운 단어부터 거리 1, 2, 3 순서로 퍼지므로 목표 단어를 처음 꺼낸 순간의 거리가 곧 최소 횟수입니다.',
    'DFS는 한 길을 끝까지 파고들어서 먼저 닿은 길이 가장 짧다는 보장이 없습니다. 모든 길을 다 보고 최솟값을 고르거나, 처음 길에서 멈추면 오답이 됩니다.',
  ],
  demo: { input: [BEGIN, TARGET, WORDS], label: 'begin = "hit", target = "cog", words = 예제 1' },
  workUnit: '단어를 방문한 횟수',
  approaches: [
    {
      id: 'word-bfs',
      name: '너비 우선 탐색 (BFS)',
      rank: 'BEST',
      timeComplexity: 'O(N² × L)',
      spaceComplexity: 'O(N)',
      verdict: '가까운 단어부터 한 겹씩 퍼져 나가 목표를 처음 꺼내는 순간이 최소 횟수인 정석 풀이입니다.',
      pros: [
        '거리 1, 2, 3 순서로 퍼지므로 목표 단어를 처음 꺼낸 순간의 횟수가 곧 최소입니다.',
        '단어마다 한 번만 큐에 넣어 모든 길을 다시 보지 않습니다.',
        '목표를 꺼내는 즉시 끝내서 멀리 있는 단어는 확인하지 않습니다.',
      ],
      cons: ['큐와 방문 집합이 필요하고, 단어 쌍마다 한 글자 차이를 비교하므로 단어가 많아지면 비교 횟수가 늘어납니다.'],
      whyThisRank:
        '가중치 없는 그래프의 최단 거리는 BFS가 가장 단순하고 확실합니다. N ≤ 50, 길이 ≤ 10이라 비교가 몇만 번에 그쳐 충분히 빠릅니다.',
      code: BFS,
      visualize: breadthFirst,
    },
    {
      id: 'word-dfs-all',
      name: 'DFS로 모든 길 확인 (백트래킹)',
      rank: 'ALTERNATIVE',
      timeComplexity: '최악 지수 시간',
      spaceComplexity: 'O(N) 재귀 깊이',
      verdict: '정답은 나오지만 닿은 뒤에도 모든 길을 끝까지 확인해야 해서 BFS보다 훨씬 많이 돕니다.',
      pros: ['재귀와 되돌리기만으로 짧게 쓸 수 있습니다.', '길을 모두 보고 최솟값을 고르므로 정답이 보장됩니다.'],
      cons: [
        '목표에 닿아도 더 짧은 길이 있을 수 있어 멈추지 못하고, 방문 표시를 되돌려 가며 가능한 길을 모두 봅니다. 예제 1만 해도 dfs를 24번 부르는데 BFS는 7번이면 끝납니다.',
        '단어가 많아지면 길의 수가 폭발적으로 늘어나 시간 초과가 날 수 있습니다.',
      ],
      whyThisRank:
        '맞게는 풀지만 BFS가 한 번씩만 보는 단어를 여러 번 다시 봅니다. 최단 거리는 "처음 닿는 순간"을 쓰는 BFS로 푸는 것이 정석입니다.',
      code: ALL,
      visualize: () => depthFirst(false),
    },
    {
      id: 'word-dfs-first',
      name: 'DFS로 처음 찾은 길 반환',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N × L)',
      spaceComplexity: 'O(N) 재귀 깊이',
      verdict: '빨리 끝나서 그럴듯하지만 처음 닿은 길이 가장 짧다는 보장이 없어 오답이 나옵니다.',
      pros: ['목표를 만나는 즉시 끝내서 호출 수가 적습니다.'],
      cons: [
        'DFS는 깊이 먼저 들어가서 처음 닿은 길이 돌아가는 길일 수 있습니다. 예제 1에서는 dog에서 cog으로 바로 가지 않고 log을 먼저 골라 5를 돌려줍니다(정답은 4).',
        '단어 순서에 따라 답이 달라져서 우연히 맞는 입력이 있으면 실수를 알아채기 어렵습니다.',
      ],
      whyThisRank:
        '최소 횟수를 구하려면 가까운 단어부터 보는 BFS이거나, 모든 길을 다 보고 비교해야 합니다. 처음 찾은 길에서 멈추는 DFS는 어느 쪽도 아닙니다.',
      code: FIRST,
      visualize: () => depthFirst(true),
    },
  ],
  checks: {
    cases: [
      { args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']], expected: 4 },
      { args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], expected: 0 },
      { args: ['aaa', 'aab', ['aab', 'abb', 'bbb']], expected: 1 },
      { args: ['abc', 'xyz', ['xyz', 'xya', 'xaa']], expected: 0 },
      { args: ['aaa', 'ccc', ['aab', 'abb', 'bbb', 'bbc', 'bcc', 'ccc']], expected: 6 },
      { args: [BEGIN, TARGET, WORDS], expected: 4 },
    ],
    // 글자는 a, b, c 세 가지, 길이 3. 단어는 begin을 뺀 26개 중 3~7개, 목표는 대개 words 안에 있다(DFS가 모든 길을 도는 시간도 짧다)
    random: (rand) => {
      const pool = Array.from({ length: 27 }, (_, k) => [Math.floor(k / 9), Math.floor(k / 3) % 3, k % 3].map((d) => 'abc'[d]).join(''));
      const pick = () => pool.splice(Math.floor(rand() * pool.length), 1)[0];
      const begin = pick();
      const words = Array.from({ length: 3 + Math.floor(rand() * 5) }, pick);
      const target = rand() < 0.85 ? words[Math.floor(rand() * words.length)] : pool[Math.floor(rand() * pool.length)];
      return [begin, target, words];
    },
  },
};

export default problem;
