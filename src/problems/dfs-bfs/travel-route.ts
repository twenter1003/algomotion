// 여행경로: 정석 DFS 백트래킹, 대안 모든 경로 모으기, 함정 그리디(사전순 항공권만 계속 쓰기)를 같은 노선도에서 움직인다.
// 장면은 위에 줄(지금까지의 경로), 가운데에 공항 5곳(칸)과 항공권(방향 있는 선), 아래에 풀이마다 다른 결과 표시다.
// 항공권은 선 하나(끝에 화살촉), 쓴 항공권은 분홍. 공항은 여러 번 지날 수 있어서 칸의 '2번'은 지금 경로에서 지난 횟수다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import type { Action, Item, Point, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { lines, together } from '../shared.ts';
import { fit } from './pacing.ts';

type Ticket = [string, string];
interface Look { to: string; verdict: 'seen' | 'new'; i: number } // i: 그 항공권이 풀이가 훑는 차례에서 몇 번째인가

// 시각화 입력. 사전순으로 가장 앞선 ICN → HND는 막다른 길이라, 그것만 따라가는 함정은 항공권 5장을 남기고 끝난다.
// 주어진 순서(대안이 훑는 차례)에서는 ICN → SFO가 ICN → JFK보다 앞서, 대안은 사전순으로 더 뒤인 경로를 먼저 완성한다.
const START = 'ICN';
const TICKETS: Ticket[] = [['ICN', 'HND'], ['ICN', 'SFO'], ['SFO', 'ICN'], ['ICN', 'JFK'], ['JFK', 'ATL'], ['ATL', 'ICN']];
const AIRPORTS = ['ICN', 'HND', 'SFO', 'JFK', 'ATL'];
const cmp = (p: Ticket, q: Ticket) => (p.join() < q.join() ? -1 : p.join() > q.join() ? 1 : 0);
const SORTED = [...TICKETS].sort(cmp); // 정석과 함정이 훑는 차례
const ROUTE_LEN = TICKETS.length + 1; // 항공권을 모두 쓴 경로의 공항 수
const ticketId = ([a, b]: Ticket) => `ticket:${a}-${b}`;
const tk = ([a, b]: Ticket) => `${a}→${b}`;
const listText = (xs: string[]) => `[${xs.join(', ')}]`;
const arrowText = (xs: string[], sep = '→') => xs.join(sep);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const STD = {
  python: `def solution(tickets):
    tickets = sorted(tickets)  # 같은 곳에서 떠나면 도착 공항이 사전순으로 앞서는 항공권부터 써 봅니다
    used = [False] * len(tickets)
    route = ["ICN"]

    def dfs(now):
        if len(route) == len(tickets) + 1:  # 항공권을 모두 썼으면 완성
            return True
        for i, (start, end) in enumerate(tickets):
            if not used[i] and start == now:
                used[i] = True
                route.append(end)
                if dfs(end):
                    return True  # 가장 먼저 완성한 경로가 사전순으로 가장 앞섭니다
                route.pop()  # 막다른 길이면 항공권을 되돌려 놓고 다음 항공권을 써 봅니다
                used[i] = False
        return False

    dfs("ICN")
    return route`,
  javascript: `function solution(tickets) {
  const sorted = [...tickets].sort(); // 같은 곳에서 떠나면 도착 공항이 사전순으로 앞서는 항공권부터 써 봅니다
  const used = Array(sorted.length).fill(false);
  const route = ['ICN'];

  const dfs = (now) => {
    if (route.length === sorted.length + 1) return true; // 항공권을 모두 썼으면 완성
    for (let i = 0; i < sorted.length; i++) {
      const [start, end] = sorted[i];
      if (!used[i] && start === now) {
        used[i] = true;
        route.push(end);
        if (dfs(end)) return true; // 가장 먼저 완성한 경로가 사전순으로 가장 앞섭니다
        route.pop(); // 막다른 길이면 항공권을 되돌려 놓고 다음 항공권을 써 봅니다
        used[i] = false;
      }
    }
    return false;
  };

  dfs('ICN');
  return route;
}`,
};
const STD_AT = {
  start: lines(STD, ['tickets = sorted(tickets)', 'used = [False] * len(tickets)', 'route = ["ICN"]', 'dfs("ICN")'],
    ['const sorted = [...tickets].sort()', 'const used = Array(sorted.length)', "const route = ['ICN']", "dfs('ICN')"]),
  enter: lines(STD, ['used[i] = True', 'route.append(end)', 'if dfs(end):'], ['used[i] = true', 'route.push(end)', 'if (dfs(end)) return true']),
  look: lines(STD, ['for i, (start, end) in enumerate(tickets)', 'if not used[i] and start == now'],
    ['for (let i = 0; i < sorted.length; i++)', 'if (!used[i] && start === now)']),
  stuck: lines(STD, ['for i, (start, end) in enumerate(tickets)', 'return False'], ['for (let i = 0; i < sorted.length; i++)', 'return false;']),
  back: lines(STD, ['route.pop()', 'used[i] = False'], ['route.pop()', 'used[i] = false']),
  done: lines(STD, ['if len(route) == len(tickets) + 1', 'return True'], ['if (route.length === sorted.length + 1) return true']),
};

const ALL = {
  python: `def solution(tickets):
    used = [False] * len(tickets)
    routes = []  # 완성된 경로를 모두 모읍니다

    def dfs(now, route):
        if len(route) == len(tickets) + 1:
            routes.append(route[:])  # 완성해도 멈추지 않고 다른 경로도 찾습니다
            return
        for i, (start, end) in enumerate(tickets):
            if not used[i] and start == now:
                used[i] = True
                route.append(end)
                dfs(end, route)
                route.pop()
                used[i] = False

    dfs("ICN", ["ICN"])
    return min(routes)  # 리스트는 앞에서부터 비교하므로 사전순으로 가장 앞선 경로`,
  javascript: `function solution(tickets) {
  const used = Array(tickets.length).fill(false);
  const routes = []; // 완성된 경로를 모두 모읍니다

  const dfs = (now, route) => {
    if (route.length === tickets.length + 1) {
      routes.push([...route]); // 완성해도 멈추지 않고 다른 경로도 찾습니다
      return;
    }
    for (let i = 0; i < tickets.length; i++) {
      const [start, end] = tickets[i];
      if (!used[i] && start === now) {
        used[i] = true;
        route.push(end);
        dfs(end, route);
        route.pop();
        used[i] = false;
      }
    }
  };

  dfs('ICN', ['ICN']);
  // 앞에서부터 비교해 사전순으로 가장 앞선 경로
  return routes.sort((p, q) => (p.join() < q.join() ? -1 : 1))[0];
}`,
};
const ALL_AT = {
  start: lines(ALL, ['used = [False] * len(tickets)', 'routes = []', 'dfs("ICN", ["ICN"])'], ['const used = Array(tickets.length)', 'const routes = []', "dfs('ICN', ['ICN'])"]),
  enter: lines(ALL, ['used[i] = True', 'route.append(end)', 'dfs(end, route)'], ['used[i] = true', 'route.push(end)', 'dfs(end, route)']),
  look: lines(ALL, ['for i, (start, end) in enumerate(tickets)', 'if not used[i] and start == now'],
    ['for (let i = 0; i < tickets.length; i++)', 'if (!used[i] && start === now)']),
  stuck: lines(ALL, ['if len(route) == len(tickets) + 1', 'for i, (start, end) in enumerate(tickets)'],
    ['if (route.length === tickets.length + 1)', 'for (let i = 0; i < tickets.length; i++)']),
  back: lines(ALL, ['route.pop()', 'used[i] = False'], ['route.pop()', 'used[i] = false']),
  done: lines(ALL, ['if len(route) == len(tickets) + 1', 'routes.append(route[:])'], ['if (route.length === tickets.length + 1)', 'routes.push([...route])']),
  fast: lines(ALL, ['for i, (start, end) in enumerate(tickets)', 'dfs(end, route)'], ['for (let i = 0; i < tickets.length; i++)', 'dfs(end, route)']),
  min: lines(ALL, ['return min(routes)'], ['return routes.sort']),
};

const GREEDY = {
  python: `# 주의: 오답이 나오는 풀이입니다 (막다른 길에서 되돌아오지 않습니다)
def solution(tickets):
    left = sorted(tickets)
    route = ["ICN"]
    while True:
        # 지금 공항에서 떠나는 항공권 중 도착 공항이 사전순으로 가장 앞선 것을 씁니다
        options = [t for t in left if t[0] == route[-1]]
        if not options:
            return route  # 쓸 항공권이 없으면 남은 항공권이 있어도 거기서 끝냅니다
        left.remove(options[0])
        route.append(options[0][1])`,
  javascript: `// 주의: 오답이 나오는 풀이입니다 (막다른 길에서 되돌아오지 않습니다)
function solution(tickets) {
  const left = [...tickets].sort();
  const route = ['ICN'];
  while (true) {
    // 지금 공항에서 떠나는 항공권 중 도착 공항이 사전순으로 가장 앞선 것을 씁니다
    const i = left.findIndex(([start]) => start === route.at(-1));
    if (i === -1) return route; // 쓸 항공권이 없으면 남은 항공권이 있어도 거기서 끝냅니다
    route.push(left.splice(i, 1)[0][1]);
  }
}`,
};
const GREEDY_AT = {
  start: lines(GREEDY, ['left = sorted(tickets)', 'route = ["ICN"]'], ['const left = [...tickets].sort()', "const route = ['ICN']"]),
  look: lines(GREEDY, ['while True', 'options = [t for t in left', 'if not options'], ['while (true)', 'const i = left.findIndex', 'if (i === -1) return route']),
  move: lines(GREEDY, ['left.remove(options[0])', 'route.append(options[0][1])'], ['route.push(left.splice(i, 1)[0][1])']),
  stuck: lines(GREEDY, ['options = [t for t in left', 'if not options', 'return route'], ['const i = left.findIndex', 'if (i === -1) return route']),
  done: lines(GREEDY, ['return route'], ['if (i === -1) return route']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로 0~520. 세로: 줄 0~40, 공항 칸 y 78~302(54px 칸), 그 아래 결과 표시 줄(36px 간격)이 있으면 326부터.
// 칸 가운데 좌표. 판정 표시(칸 위 11px)와 화살표가 판 안에 들도록 가장자리에서 띄웠다.
const CELL = 54;
const W = 520;
const CENTERS: Record<string, Point> = { ICN: [250, 190], HND: [70, 105], SFO: [70, 275], JFK: [440, 105], ATL: [440, 275] };
const LANE: LaneOptions = { id: 'lane', x: 40, y: 5, slotW: 56, slotH: 30, gap: 6, max: ROUTE_LEN };
const ROW0 = 326;
const ROW = 36;
const heightOf = (rows: number) => (rows ? ROW0 + rows * ROW - 6 : 318);
const rectOf = (a: string): Rect => ({ x: CENTERS[a][0] - CELL / 2, y: CENTERS[a][1] - CELL / 2, w: CELL, h: CELL });
const cellId = (a: string) => `ap:${a}`;
const VERDICT_LABEL = { new: '쓸 수 있음', seen: '이미 씀' } as const;

// 항공권 선: 칸 테두리에서 3px 띄워 시작하고, 도착 칸 앞 4px에 화살촉(선 하나로 ‹ 모양)을 단다.
// 반대 방향 항공권이 함께 있으면 서로 7px씩 비켜 그린다.
function ticketPoints([a, b]: Ticket): Point[] {
  const [[ax, ay], [bx, by]] = [CENTERS[a], CENTERS[b]];
  const len = Math.hypot(bx - ax, by - ay);
  const [ux, uy] = [(bx - ax) / len, (by - ay) / len];
  const side = TICKETS.some(([p, q]) => p === b && q === a) ? 7 : 0;
  const [ox, oy] = [-uy * side, ux * side];
  // 칸 가운데에서 (ox, oy)만큼 비켜 선 점이 (dx, dy) 방향으로 정사각형 칸을 나가는 거리
  const leave = (dx: number, dy: number) => Math.min(...[[dx, ox], [dy, oy]].filter(([d]) => d !== 0).map(([d, o]) => (CELL / 2 * Math.sign(d) - o) / d));
  const from: Point = [ax + ox + ux * (leave(ux, uy) + 3), ay + oy + uy * (leave(ux, uy) + 3)];
  const tip: Point = [bx + ox - ux * (leave(-ux, -uy) + 4), by + oy - uy * (leave(-ux, -uy) + 4)];
  const barb = (s: number): Point => [tip[0] - ux * 11 + -uy * 6 * s, tip[1] - uy * 11 + ux * 6 * s];
  return [from, tip, barb(1), tip, barb(-1)];
}

// 세 풀이가 같이 쓰는 장면: 줄 이름표와 바탕, 항공권 선, 공항 칸. rows는 아래 결과 표시 줄 수, heading은 그 줄들의 제목
function board(rows: number, heading?: string): Scene {
  const h = heightOf(rows);
  const full: Rect = { x: 0, y: 0, w: W, h }; // line은 rect 대신 points로 그린다
  const items: Item[] = [
    { id: 'lane:label', kind: 'text', rect: { x: 0, y: 0, w: 34, h: 40 }, text: '경로' },
    { id: 'lane:bg', kind: 'zone', rect: { x: 34, y: 0, w: W - 34, h: 40 } },
  ];
  for (const t of TICKETS) items.push({ id: ticketId(t), kind: 'line', rect: full, tone: 'trail', points: ticketPoints(t) });
  for (const a of AIRPORTS) items.push({ id: cellId(a), kind: 'cell', rect: rectOf(a), tone: 'plain', text: a, ...(a === START ? { tag: '출발' } : {}) });
  if (heading) items.push({ id: 'rows:heading', kind: 'text', rect: { x: 0, y: ROW0, w: 84, h: 30 }, text: heading });
  return { width: W, height: h, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => [{ type: 'unfocus' }, { type: 'clearMarks' }];
const rowRect = (k: number, w: number): Rect => ({ x: 90, y: ROW0 + k * ROW, w, h: 30 });

// 지금 경로(route)와 쓴 항공권(used)에 맞게 칸과 선의 색, 칸의 '몇 번' 표시를 맞춘다. 바뀐 것만 동작으로 남긴다.
// stuck이면 맨 끝 공항을 막다른 길로, all이면 경로 전체를 완성 색으로 칠한다.
function restyle(rec: StepRecorder, route: string[], used: Ticket[], o: { stuck?: boolean; all?: boolean } = {}): Action[] {
  const acts: Action[] = [];
  const top = route.at(-1);
  for (const a of AIRPORTS) {
    const times = route.filter((x) => x === a).length;
    const tone: Tone = o.all ? (times ? 'path' : 'plain') : a !== top ? (times ? 'trail' : 'plain') : o.stuck ? 'bad' : 'current';
    const sub = a === top && o.stuck ? '막힘' : times > 1 ? `${times}번` : '';
    const now = rec.get(cellId(a));
    if (now.tone !== tone || (now.sub ?? '') !== sub) acts.push({ type: 'set', id: cellId(a), patch: { tone, sub }, ...(tone === 'current' && now.tone !== 'current' ? { pop: true } : {}) });
  }
  for (const t of TICKETS) {
    const tone: Tone = used.some((u) => ticketId(u) === ticketId(t)) ? 'path' : 'trail';
    if (rec.get(ticketId(t)).tone !== tone) acts.push({ type: 'set', id: ticketId(t), patch: { tone } });
  }
  return acts;
}

// from 공항에서 looks의 공항마다 화살표를 긋는다. 끝나면 흐림과 화살표를 걷는다
function lookAt(rec: StepRecorder, from: string, looks: { to: string; verdict: Verdict; label: string }[]) {
  rec.do({ type: 'focus', ids: [cellId(from), ...looks.map((l) => cellId(l.to))] });
  for (const l of looks) rec.do({ type: 'arrow', from: cellId(from), to: cellId(l.to), verdict: l.verdict, label: l.label });
  rec.do(wait(120), ...together(clear()));
}

// 살핀 결과를 우리말로: 연달아 같은 판정이 난 항공권은 한 마디로 묶고(공항 이름 뒤에 '행'을 붙여 조사가 늘 같다), 마지막 말만 끝맺는 꼴로 쓴다
function lookText(looks: Look[]): string {
  const runs: { verdict: Look['verdict']; to: string[] }[] = [];
  for (const l of looks) {
    if (runs.at(-1)?.verdict === l.verdict) runs.at(-1)!.to.push(l.to);
    else runs.push({ verdict: l.verdict, to: [l.to] });
  }
  // 안 쓴 항공권을 찾으면 거기서 멈추므로 '안 썼으니 씁니다'는 늘 맨 끝이다
  const clause = ({ verdict, to }: (typeof runs)[number], last: boolean) => {
    const names = to.map((x) => `${x}행`).join(', ');
    return verdict === 'new' ? `${names}은 아직 안 썼으니 씁니다` : `${names}은 이미 썼${last ? '습니다' : '고'}`;
  };
  return `${runs.map((r, k) => clause(r, k === runs.length - 1)).join(', ')}.`;
}

/* ------------------------------------------------------------------ */
/* 정석 DFS 백트래킹 · 대안 모든 경로: 이동하기 → 살피기 → 되돌아가기       */
/* ------------------------------------------------------------------ */

// dfs를 코드와 똑같이 돌려, 항공권을 쓴 일(enter)과 되돌린 일(back)을 일어난 차례로 모은다.
// 살핀 결과(looks)는 그 공항에서 다음 항공권을 쓰거나 되돌아오기 전까지 가장 가까운 사건에 붙는다.
// first이면 경로를 처음 완성하는 순간 멈춘다(정석의 return True). 아니면 완성한 경로를 모으며 끝까지 간다.
interface Ev { kind: 'enter' | 'back'; to: string; from?: string; ticket?: number; looks: Look[]; route: string[]; used: number[]; enters: number; done?: boolean }
function simulate(order: Ticket[], first: boolean): { events: Ev[]; routes: string[][] } {
  const used = order.map(() => false);
  const route = [START];
  const routes: string[][] = [];
  const events: Ev[] = [];
  let enters = 0;
  const snap = (kind: Ev['kind'], to: string, from?: string, ticket?: number): Ev =>
    ({ kind, to, from, ticket, looks: [], route: [...route], used: used.flatMap((u, i) => (u ? [i] : [])), enters });
  let cur = snap('enter', START);
  events.push(cur);
  const dfs = (now: string): boolean => {
    if (route.length === ROUTE_LEN) {
      cur.done = true;
      routes.push([...route]);
      return first;
    }
    for (let i = 0; i < order.length; i++) {
      const [start, end] = order[i];
      if (start !== now) continue;
      if (used[i]) {
        cur.looks.push({ to: end, verdict: 'seen', i });
        continue;
      }
      cur.looks.push({ to: end, verdict: 'new', i });
      used[i] = true;
      route.push(end);
      enters++;
      events.push((cur = snap('enter', end, now, i)));
      if (dfs(end) && first) return true;
      route.pop();
      used[i] = false;
      events.push((cur = snap('back', now, end, i)));
    }
    return false;
  };
  dfs(START);
  return { events, routes };
}

function search(first: boolean): Visualization {
  const order = first ? SORTED : TICKETS;
  const AT = first ? STD_AT : ALL_AT;
  const { events, routes } = simulate(order, first);
  const rec = new StepRecorder(board(first ? 0 : 2, first ? undefined : '모은 경로'));
  const lane = new Lane(rec, LANE);
  let ev = events[0]; // 지금까지 그린 마지막 사건
  let idle = false; // dfs가 모두 끝났는가
  let found = 0; // 모은 경로 수
  const usedOf = (e: Ev): Ticket[] => e.used.map((i) => order[i]);
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({
    work: ev.enters,
    variables: {
      now: idle ? '-' : ev.route.at(-1)!,
      route: idle ? '-' : listText(ev.route),
      used: `{${usedOf(ev).map(tk).join(', ')}}`,
      ...(first ? {} : { routes: `${found}개` }),
    },
  });
  const left = (e: Ev) => order.length - e.used.length; // 아직 안 쓴 항공권 수
  const labelled = (looks: Look[]) => looks.map((l) => ({ to: l.to, verdict: l.verdict, label: VERDICT_LABEL[l.verdict] }));

  // 보여 줄 사건: 정석은 경로를 완성할 때까지, 대안은 첫 경로를 모을 때까지 한 단계씩 보이고, 나머지는 빨리 감기로 묶는다
  const cut = first ? events.length : events.findIndex((e) => e.done) + 1;
  // 살필 것이 없어 바로 또 되돌아오는 사건들은 한 단계로 묶는다(경로가 연달아 줄어드는 모습)
  const groups: Ev[][] = [];
  for (const e of events.slice(0, cut)) {
    const prev = groups.at(-1)?.at(-1);
    if (e.kind === 'back' && prev?.kind === 'back' && !prev.looks.some((l) => l.verdict === 'new')) groups.at(-1)!.push(e);
    else groups.push([e]);
  }

  groups.forEach((group, g) => {
    const [head] = group;
    if (head.kind === 'enter') {
      ev = head;
      const { to, from, route, looks, done } = head;
      const stuck = !done && !looks.some((l) => l.verdict === 'new');
      if (done && !first) found++;
      const hl = done ? AT.done : stuck ? AT.stuck : AT.look;
      rec.step({
        title: g === 0 ? `${START}에서 출발` : `${tk([from!, to])} 항공권 쓰기${done ? ' — 경로 완성' : stuck ? ' — 막다른 길' : ''}`,
        codeHighlights: hl,
        ...meta(),
        ...(done && first ? { answer: route, isKeyframe: true } : {}),
      });
      rec.phase('이동하기', g === 0
        ? (first ? `항공권을 사전순으로 정렬하고 ${START}에서 출발합니다.` : `정렬하지 않고, 주어진 순서대로 항공권을 보며 ${START}에서 출발합니다.`)
        : `${from}에서 ${to}까지 가는 항공권을 씁니다. 지금 경로에 쓴 항공권은 ${route.length - 1}장입니다.`, g === 0 ? AT.start : AT.enter);
      rec.do(...together(restyle(rec, route, usedOf(head))));
      lane.push({ id: `r:${route.length - 1}`, text: to }, cellId(to));
      if (done) {
        rec.phase(first ? '완성' : '경로 모으기', first
          ? `항공권 ${TICKETS.length}장을 모두 썼습니다. 사전순으로 처음 완성한 경로라 True가 위로 전해지고 탐색이 바로 끝납니다.`
          : `항공권 ${TICKETS.length}장을 모두 썼습니다. 경로를 routes에 모으고, 멈추지 않고 되돌아가 다른 경로도 찾습니다.`, hl);
        rec.do(...together(restyle(rec, route, usedOf(head), { all: true })));
        if (!first) rec.do({ type: 'add', item: { id: 'routes:0', kind: 'token', rect: rowRect(0, 300), tone: 'plain', text: arrowText(route) }, from: cellId(to) });
      } else if (stuck) {
        rec.phase('살피기', `${to}에서 쓸 수 있는 항공권이 없는데 아직 ${left(head)}장이 남았으니 막다른 길입니다.`, hl);
        rec.do({ type: 'focus', ids: [cellId(to)] }, ...together(restyle(rec, route, usedOf(head), { stuck: true }), true), wait(200), { type: 'unfocus' });
      } else {
        rec.phase('살피기', `${to}에서 떠나는 항공권을 ${first ? '사전순으로' : '주어진 순서대로'} 봅니다. ${lookText(looks)}`, hl);
        lookAt(rec, to, labelled(looks));
      }
    } else {
      const last = group.at(-1)!;
      ev = last;
      const undone = group.map((e) => order[e.ticket!]);
      rec.step({
        title: group.length === 1 ? `${tk(undone[0])} 되돌리기` : `항공권 ${group.length}장 되돌리기`,
        codeHighlights: last.looks.length ? AT.look : AT.back,
        ...meta(),
      });
      rec.phase('되돌아가기', group.length === 1
        ? `막다른 길이라 ${tk(undone[0])} 항공권을 되돌려 놓고 route의 마지막 공항을 뺍니다.`
        : `막다른 길이라 항공권 ${group.length}장을 되돌려 놓고 route의 마지막 공항을 하나씩 뺍니다. ${last.to}까지 돌아왔습니다.`, AT.back);
      for (const e of group) {
        lane.pop(cellId(e.from!));
        rec.do(...together(restyle(rec, e.route, usedOf(e)), true));
      }
      if (last.looks.length) {
        rec.phase('살피기', `${last.to}에서 이어서 항공권을 봅니다. ${lookText(last.looks)}`, AT.look);
        lookAt(rec, last.to, labelled(last.looks));
      }
    }
  });

  if (!first) {
    // 남은 경로는 빨리 감기로 묶는다. 경로가 더 완성되고(줄은 비고 칸은 처음 색), 모인 경로를 비교해 사전순으로 가장 앞선 것을 고른다
    const shownRoute = events[cut - 1].route; // 줄에 남아 있는 경로
    const best = [...routes].sort((p, q) => (p.join() < q.join() ? -1 : 1))[0];
    const other = routes.find((r) => r !== best)!;
    const diff = best.findIndex((a, k) => a !== other[k]);
    const before = events[cut - 1].enters;
    ev = { ...events.at(-1)!, route: [], used: [] };
    idle = true;
    found = routes.length;
    rec.step({ title: `나머지 경로 확인 — 경로 ${routes.length}개`, codeHighlights: ALL_AT.min, ...meta(), answer: best, isKeyframe: true });
    rec.phase('빨리 감기', `나머지 길도 끝까지 확인하느라 항공권을 ${ev.enters - before}번 더 씁니다. 경로가 ${routes.length - 1}개 더 완성됩니다.`, ALL_AT.fast);
    rec.do(...together([
      ...lane.ids.map((id, k): Action => ({ type: 'remove', id, into: cellId(shownRoute[k]) })),
      ...restyle(rec, [], []),
    ]));
    rec.do(...routes.slice(1).map((r, k): Action => ({
      type: 'add', item: { id: `routes:${k + 1}`, kind: 'token', rect: rowRect(k + 1, 300), tone: 'plain', text: arrowText(r) }, from: 'routes:0',
    })));
    rec.phase('최소 고르기', `routes의 경로를 앞에서부터 비교하면 ${diff + 1}번째 공항에서 갈립니다. 사전순으로 앞서는 쪽은 ${best[diff]}입니다. min(routes)는 ${arrowText(best, ' → ')}입니다.`, ALL_AT.min);
    rec.do(...together(routes.map((r, k): Action => ({ type: 'set', id: `routes:${k}`, patch: { tone: r === best ? 'good' : 'muted' } }))));
    rec.do(...together(restyle(rec, best, best.slice(1).map((b, k): Ticket => [best[k], b]), { all: true }), true));
  }
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정 그리디: 이동하기 → 살피기, 오답 확인                                */
/* ------------------------------------------------------------------ */

function greedy(): Visualization {
  const rec = new StepRecorder(board(2));
  const lane = new Lane(rec, LANE);
  const rest = [...SORTED]; // 아직 안 쓴 항공권
  const route = [START];
  const used: Ticket[] = [];
  let result: string[] | '-' = '-';
  const truth = ['ICN', 'JFK', 'ATL', 'ICN', 'SFO', 'ICN', 'HND']; // 정석의 답
  // 변수와 일의 양은 단계가 끝났을 때의 값이다(다음 공항으로 가는 일은 다음 단계 맨 앞이라 반복문 끝에서 한다)
  const meta = () => ({
    work: used.length,
    variables: { route: listText(route), left: `${rest.length}장`, '돌려줄 값': result === '-' ? '-' : listText(result) },
  });

  for (;;) {
    const now = route.at(-1)!;
    const options = rest.filter(([a]) => a === now);
    const start = route.length === 1;
    rec.step({
      title: start ? `${START}에서 출발` : `${tk([route.at(-2)!, now])} 항공권 쓰기${options.length ? '' : ' — 막다른 길'}`,
      codeHighlights: options.length ? GREEDY_AT.look : GREEDY_AT.stuck,
      ...meta(),
    });
    rec.phase('이동하기', start
      ? `항공권을 사전순으로 정렬하고 ${START}에서 출발합니다.`
      : `${route.at(-2)}에서 ${now}까지 가는 항공권을 씁니다. 지금 경로에 쓴 항공권은 ${route.length - 1}장입니다.`, start ? GREEDY_AT.start : GREEDY_AT.move);
    rec.do(...together(restyle(rec, route, used)));
    lane.push({ id: `r:${route.length - 1}`, text: now }, cellId(now));
    if (!options.length) {
      rec.phase('살피기', `${now}에서 쓸 수 있는 항공권이 없습니다. 아직 ${rest.length}장이 남았지만 되돌아가지 않고 여기서 끝냅니다.`, GREEDY_AT.stuck);
      rec.do({ type: 'focus', ids: [cellId(now)] }, ...together(restyle(rec, route, used, { stuck: true }), true), wait(200), { type: 'unfocus' });
      break;
    }
    rec.phase('살피기', `${now}에서 떠나는 항공권은 ${options.map(([, to]) => `${to}행`).join(', ')}입니다. 사전순으로 가장 앞선 ${options[0][1]}행을 바로 씁니다.`, GREEDY_AT.look);
    lookAt(rec, now, options.map(([, to], k) => ({ to, verdict: k ? 'seen' : 'good', label: k ? '쓰지 않음' : '가장 앞섬' })));
    rest.splice(rest.indexOf(options[0]), 1);
    used.push(options[0]);
    route.push(options[0][1]);
  }

  result = [...route];
  rec.step({ title: `내 답 ${arrowText(result)}, 정답은 ${arrowText(truth)}`, codeHighlights: GREEDY_AT.done, ...meta(), answer: result, isKeyframe: true });
  rec.phase('오답 확인', `${arrowText(result, ' → ')}에서 막혀 항공권 ${rest.length}장이 남았습니다. 정답은 ${arrowText(truth, ' → ')}입니다.`);
  rec.do(...together(AIRPORTS.filter((a) => !route.includes(a)).map((a): Action => ({ type: 'set', id: cellId(a), patch: { tone: 'bad' } }))));
  rec.do({ type: 'add', item: { id: 'mine', kind: 'token', rect: rowRect(0, 300), tone: 'bad', text: `내 답 ${arrowText(result)}` } },
    { type: 'add', item: { id: 'truth', kind: 'token', rect: rowRect(1, 300), tone: 'good', text: `정답 ${arrowText(truth)}` }, together: true });
  return fit(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'travel-route',
  title: '여행경로',
  level: 3,
  category: 'dfs-bfs',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/43164',
  description: {
    summary:
      '항공권 [출발 공항, 도착 공항]이 여러 장 주어집니다. ICN 공항에서 출발해 항공권을 한 장도 남기지 않고 한 번씩만 써서 여행하는 경로를 구합니다. 가능한 경로가 여럿이면 알파벳 순서로 가장 앞선 경로를 돌려줍니다.',
    rules: [
      '공항 이름은 알파벳 대문자 3글자',
      '공항은 3개 이상 10,000개 이하',
      'tickets의 [a, b]는 a 공항에서 b 공항으로 가는 항공권 한 장',
      '주어진 항공권은 모두 써야 함',
      '가능한 경로가 둘 이상이면 알파벳 순서가 앞서는 경로를 return',
      '모든 항공권을 쓸 수 없는 경우는 주어지지 않음',
    ],
    examples: [
      { input: 'tickets = [["ICN", "JFK"], ["HND", "IAD"], ["JFK", "HND"]]', output: '["ICN", "JFK", "HND", "IAD"]' },
      { input: 'tickets = [["ICN", "SFO"], ["ICN", "ATL"], ["SFO", "ATL"], ["ATL", "ICN"], ["ATL","SFO"]]', output: '["ICN", "ATL", "ICN", "SFO", "ATL", "SFO"]' },
    ],
  },
  keyIntuitions: [
    '공항은 여러 번 지날 수 있지만 항공권은 한 장씩만 씁니다. 그래서 "방문한 공항"이 아니라 "쓴 항공권"에 표시를 해야 합니다.',
    '항공권을 도착 공항 사전순으로 정렬해 두고 앞선 것부터 써 보면, 항공권을 모두 쓰는 경로를 처음 완성한 순간이 곧 사전순으로 가장 앞선 경로라서 거기서 멈춥니다.',
    '사전순으로 앞선 항공권이 막다른 길일 수 있습니다. 그때는 항공권을 되돌려 놓고(백트래킹) 다음 항공권을 써 봐야 하며, 앞선 것만 계속 쓰는 그리디는 오답입니다.',
  ],
  demo: {
    input: [TICKETS],
    label: 'tickets = [["ICN","HND"],["ICN","SFO"],["SFO","ICN"],["ICN","JFK"],["JFK","ATL"],["ATL","ICN"]]',
  },
  workUnit: '항공권을 쓴 횟수',
  approaches: [
    {
      id: 'travel-dfs',
      name: '깊이 우선 탐색 (DFS 백트래킹)',
      rank: 'BEST',
      timeComplexity: '최악 지수 시간, 보통은 훨씬 적음',
      spaceComplexity: 'O(N) 재귀 깊이',
      verdict: '항공권을 사전순으로 써 보다가 막다른 길이면 되돌리는, 문제 그대로의 풀이입니다.',
      pros: [
        '정렬해 두면 "가장 먼저 완성한 경로 = 사전순으로 가장 앞선 경로"라서 완성하는 즉시 멈출 수 있습니다.',
        '쓴 항공권과 경로를 함께 되돌리는 백트래킹 틀이라 경로를 만드는 다른 문제에도 그대로 씁니다.',
        '공항이 아니라 항공권에 사용 표시를 해서, 같은 공항을 여러 번 지나는 경로도 자연스럽게 다룹니다.',
      ],
      cons: [
        '막다른 길을 만날 때마다 되돌아가므로 최악에는 시도하는 경우가 지수적으로 늘어납니다.',
        'dfs를 부를 때마다 항공권 전체를 훑어 출발 공항이 같은 것을 찾습니다(공항별 목록을 만들어 두면 줄일 수 있습니다).',
      ],
      whyThisRank:
        '이 문제의 핵심은 사전순 정렬과 막다른 길에서 되돌아오는 백트래킹이고, 둘을 모두 갖춘 가장 짧고 확실한 풀이입니다. 항상 경로가 있다는 조건 덕분에 처음 완성한 경로에서 멈추면 됩니다.',
      code: STD,
      visualize: () => search(true),
    },
    {
      id: 'travel-all',
      name: 'DFS로 모든 경로를 모은 뒤 최소 고르기',
      rank: 'ALTERNATIVE',
      timeComplexity: '지수 시간 (모든 경로 확인)',
      spaceComplexity: 'O(경로 수 × N)',
      verdict: '정답은 나오지만 정렬 없이 모든 경로를 끝까지 찾아서 훨씬 많이 돕니다.',
      pros: [
        '정렬 순서에 기대지 않고 가능한 경로를 전부 모아 min으로 고르니 정답이 보장됩니다.',
        '백트래킹 틀은 정석과 같아 코드도 거의 같습니다.',
      ],
      cons: [
        '경로를 하나 완성해도 멈추지 못하고 나머지 경우를 모두 확인합니다. 시각화 입력에서는 항공권을 쓰는 횟수가 정석의 8번보다 많은 15번입니다.',
        '완성한 경로를 모두 저장하고 비교해야 해서 메모리와 시간이 더 듭니다.',
      ],
      whyThisRank:
        '틀리지는 않지만 정석이 정렬 한 번으로 피하는 일을 모든 경로를 모아 비교하는 방식으로 처리해 손해를 봅니다. 항공권이 많아지면 경로 수가 폭발해 시간 초과가 날 수 있습니다.',
      code: ALL,
      visualize: () => search(false),
    },
    {
      id: 'travel-greedy',
      name: '그리디 (사전순 항공권만 계속 쓰기)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '빠르고 그럴듯하지만 막다른 길에서 되돌아오지 않아 오답이 나옵니다.',
      pros: ['정렬 한 번과 반복문 하나로 끝나 가장 짧고 빠릅니다.'],
      cons: [
        '사전순으로 가장 앞선 항공권이 막다른 길이면 거기서 끝나 버리고, 쓰지 못한 항공권이 남습니다. 시각화 입력에서는 ICN → HND만 쓰고 5장을 남깁니다.',
        '항공권을 모두 써야 한다는 조건을 한 번도 확인하지 않습니다.',
      ],
      whyThisRank:
        '이 문제는 항공권을 모두 쓰는 경로 중 사전순으로 가장 앞선 것을 구합니다. 앞서 보이는 선택이 막다른 길이면 되돌아가 다른 항공권을 써 봐야 하므로, 한 길만 따라가는 그리디로는 풀 수 없습니다.',
      code: GREEDY,
      visualize: greedy,
    },
  ],
  checks: {
    cases: [
      { args: [[['ICN', 'JFK'], ['HND', 'IAD'], ['JFK', 'HND']]], expected: ['ICN', 'JFK', 'HND', 'IAD'] },
      { args: [[['ICN', 'SFO'], ['ICN', 'ATL'], ['SFO', 'ATL'], ['ATL', 'ICN'], ['ATL', 'SFO']]], expected: ['ICN', 'ATL', 'ICN', 'SFO', 'ATL', 'SFO'] },
      { args: [[['ICN', 'AAA'], ['ICN', 'BBB'], ['BBB', 'ICN']]], expected: ['ICN', 'BBB', 'ICN', 'AAA'] },
      { args: [[['ICN', 'ATL'], ['ATL', 'ICN'], ['ICN', 'ATL']]], expected: ['ICN', 'ATL', 'ICN', 'ATL'] },
      { args: [[['ICN', 'ATL'], ['ATL', 'ICN']]], expected: ['ICN', 'ATL', 'ICN'] },
      { args: [TICKETS], expected: ['ICN', 'JFK', 'ATL', 'ICN', 'SFO', 'ICN', 'HND'] },
    ],
    // ICN에서 출발해 공항 4곳(ICN, ATL, JFK, SFO) 사이를 항공권 3~7장만큼 이어 가며 만들고(그래서 모든 항공권을 쓰는 경로가 반드시 있다) 순서를 섞는다
    random: (rand) => {
      const airports = ['ICN', 'ATL', 'JFK', 'SFO'];
      const tickets: string[][] = [];
      let now = 'ICN';
      for (let k = 3 + Math.floor(rand() * 5); k > 0; k--) {
        const next = airports.filter((a) => a !== now)[Math.floor(rand() * 3)];
        tickets.push([now, next]);
        now = next;
      }
      for (let k = tickets.length - 1; k > 0; k--) {
        const j = Math.floor(rand() * (k + 1));
        [tickets[k], tickets[j]] = [tickets[j], tickets[k]];
      }
      return [tickets];
    },
  },
};

export default problem;
