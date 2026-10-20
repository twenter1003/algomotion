// 택배 배달과 수거하기: 정석 먼 집부터 밀린 양을 들고 가기, 대안 포인터 두 개로 왕복을 직접 따라 하기, 함정 왕복마다 집을 처음부터 다시 훑기(느림)를 같은 장면에서 움직인다.
// 장면은 위에 집 번호와 배달·수거 상자 수(두 줄), 가운데에 표시 줄(정석은 밀린 양 d, p, 나머지는 포인터), 아래에 왕복 기록 막대다.
// 왕복 막대는 집 칸과 같은 가로 축이라, i번 집까지 가는 왕복은 창고(왼쪽 끝)에서 i번 집 칸 오른쪽 끝까지 닿는다.
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { josa, lines, ro, together } from '../shared.ts';
import { PacedRecorder } from './paced.ts';

// 시각화 입력. 정석은 왕복 4번에 40, 배달 상자가 있는 집과 수거 상자가 있는 집이 엇갈린다.
const CAP = 3;
const DELIV = [2, 0, 1, 3, 0, 1, 4];
const PICK = [0, 2, 3, 0, 5, 0, 1];
const N = DELIV.length;
const MAX_TRIPS = 4; // 세 풀이 모두 왕복 4번

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const CARRY = {
  python: `def solution(cap, n, deliveries, pickups):
    answer = 0
    d = p = 0                        # 아직 처리하지 못한 배달·수거 상자 수 (음수면 트럭에 여유가 남음)
    for i in range(n, 0, -1):        # i번 집: 먼 집부터
        d += deliveries[i - 1]
        p += pickups[i - 1]
        while d > 0 or p > 0:        # 이 집까지 가야 하는 상자가 남았다
            d -= cap                 # 한 번 왕복에 배달 cap개
            p -= cap                 # 수거도 cap개
            answer += i * 2          # i번 집까지 갔다 오는 거리
    return answer`,
  javascript: `function solution(cap, n, deliveries, pickups) {
  let answer = 0;
  let d = 0; // 아직 처리하지 못한 배달 상자 수 (음수면 트럭에 여유가 남음)
  let p = 0; // 아직 처리하지 못한 수거 상자 수
  for (let i = n; i > 0; i--) { // i번 집: 먼 집부터
    d += deliveries[i - 1];
    p += pickups[i - 1];
    while (d > 0 || p > 0) { // 이 집까지 가야 하는 상자가 남았다
      d -= cap; // 한 번 왕복에 배달 cap개
      p -= cap; // 수거도 cap개
      answer += i * 2; // i번 집까지 갔다 오는 거리
    }
  }
  return answer;
}`,
};
const CARRY_AT = {
  init: lines(CARRY, ['answer = 0', 'd = p = 0'], ['let answer = 0', 'let d = 0', 'let p = 0']),
  add: lines(CARRY, ['for i in range(n, 0, -1)', 'd += deliveries[i - 1]', 'p += pickups[i - 1]'], ['for (let i = n; i > 0; i--)', 'd += deliveries[i - 1]', 'p += pickups[i - 1]']),
  check: lines(CARRY, ['while d > 0 or p > 0'], ['while (d > 0 || p > 0)']),
  trip: lines(CARRY, ['while d > 0 or p > 0', 'd -= cap', 'p -= cap', 'answer += i * 2'], ['while (d > 0 || p > 0)', 'd -= cap', 'p -= cap', 'answer += i * 2']),
  done: lines(CARRY, ['for i in range(n, 0, -1)', 'return answer'], ['for (let i = n; i > 0; i--)', 'return answer']),
};

const POINTERS = {
  python: `def solution(cap, n, deliveries, pickups):
    answer = 0
    d = p = n                                   # 배달·수거가 남은 가장 먼 집 (1번부터 센다)
    while True:
        while d > 0 and deliveries[d - 1] == 0:   # 남은 배달이 있는 가장 먼 집으로
            d -= 1
        while p > 0 and pickups[p - 1] == 0:      # 남은 수거가 있는 가장 먼 집으로
            p -= 1
        if d == 0 and p == 0:                     # 더 할 일이 없다
            break
        answer += max(d, p) * 2                   # 더 먼 쪽 집까지 갔다 온다
        load = cap
        while load > 0 and d > 0:                 # 먼 집부터 cap개를 배달한다
            take = min(load, deliveries[d - 1])
            deliveries[d - 1] -= take
            load -= take
            if deliveries[d - 1] == 0:
                d -= 1
        load = cap
        while load > 0 and p > 0:                 # 먼 집부터 cap개를 수거한다
            take = min(load, pickups[p - 1])
            pickups[p - 1] -= take
            load -= take
            if pickups[p - 1] == 0:
                p -= 1
    return answer`,
  javascript: `function solution(cap, n, deliveries, pickups) {
  let answer = 0;
  let d = n; // 배달·수거가 남은 가장 먼 집 (1번부터 센다)
  let p = n;
  while (true) {
    while (d > 0 && deliveries[d - 1] === 0) d--; // 남은 배달이 있는 가장 먼 집으로
    while (p > 0 && pickups[p - 1] === 0) p--; // 남은 수거가 있는 가장 먼 집으로
    if (d === 0 && p === 0) break; // 더 할 일이 없다
    answer += Math.max(d, p) * 2; // 더 먼 쪽 집까지 갔다 온다
    let load = cap;
    while (load > 0 && d > 0) { // 먼 집부터 cap개를 배달한다
      const take = Math.min(load, deliveries[d - 1]);
      deliveries[d - 1] -= take;
      load -= take;
      if (deliveries[d - 1] === 0) d--;
    }
    load = cap;
    while (load > 0 && p > 0) { // 먼 집부터 cap개를 수거한다
      const take = Math.min(load, pickups[p - 1]);
      pickups[p - 1] -= take;
      load -= take;
      if (pickups[p - 1] === 0) p--;
    }
  }
  return answer;
}`,
};
const POINTERS_AT = {
  init: lines(POINTERS, ['answer = 0', 'd = p = n'], ['let answer = 0', 'let d = n', 'let p = n']),
  find: lines(POINTERS, ['while d > 0 and deliveries[d - 1] == 0', 'while p > 0 and pickups[p - 1] == 0', 'if d == 0 and p == 0'], ['while (d > 0 && deliveries[d - 1] === 0)', 'while (p > 0 && pickups[p - 1] === 0)', 'if (d === 0 && p === 0)']),
  trip: lines(POINTERS, ['answer += max(d, p) * 2'], ['answer += Math.max(d, p) * 2']),
  move: lines(POINTERS, ['load = cap', 'while load > 0 and d > 0', 'take = min(load, deliveries[d - 1])', 'while load > 0 and p > 0', 'take = min(load, pickups[p - 1])'],
    ['let load = cap', 'while (load > 0 && d > 0)', 'const take = Math.min(load, deliveries[d - 1])', 'while (load > 0 && p > 0)', 'const take = Math.min(load, pickups[p - 1])']),
  done: lines(POINTERS, ['if d == 0 and p == 0', 'return answer'], ['if (d === 0 && p === 0)', 'return answer']),
};

const RESCAN = {
  python: `def solution(cap, n, deliveries, pickups):
    answer = 0
    while True:
        far = n                                           # 가장 먼 집을 매번 끝에서부터 다시 찾는다
        while far > 0 and deliveries[far - 1] == 0 and pickups[far - 1] == 0:
            far -= 1
        if far == 0:                                      # 더 할 일이 없다
            break
        answer += far * 2
        load = cap
        for i in range(far, 0, -1):                       # 먼 집부터 cap개를 배달한다 (다 실어도 끝까지 훑는다)
            take = min(load, deliveries[i - 1])
            deliveries[i - 1] -= take
            load -= take
        load = cap
        for i in range(far, 0, -1):                       # 먼 집부터 cap개를 수거한다
            take = min(load, pickups[i - 1])
            pickups[i - 1] -= take
            load -= take
    return answer`,
  javascript: `function solution(cap, n, deliveries, pickups) {
  let answer = 0;
  while (true) {
    let far = n; // 가장 먼 집을 매번 끝에서부터 다시 찾는다
    while (far > 0 && deliveries[far - 1] === 0 && pickups[far - 1] === 0) far--;
    if (far === 0) break; // 더 할 일이 없다
    answer += far * 2;
    let load = cap;
    for (let i = far; i > 0; i--) { // 먼 집부터 cap개를 배달한다 (다 실어도 끝까지 훑는다)
      const take = Math.min(load, deliveries[i - 1]);
      deliveries[i - 1] -= take;
      load -= take;
    }
    load = cap;
    for (let i = far; i > 0; i--) { // 먼 집부터 cap개를 수거한다
      const take = Math.min(load, pickups[i - 1]);
      pickups[i - 1] -= take;
      load -= take;
    }
  }
  return answer;
}`,
};
const RESCAN_AT = {
  init: lines(RESCAN, ['answer = 0'], ['let answer = 0']),
  find: lines(RESCAN, ['far = n', 'while far > 0 and deliveries[far - 1] == 0', 'if far == 0'], ['let far = n', 'while (far > 0 && deliveries[far - 1] === 0', 'if (far === 0)']),
  trip: lines(RESCAN, ['answer += far * 2'], ['answer += far * 2']),
  move: lines(RESCAN, ['load = cap', 'for i in range(far, 0, -1)', 'take = min(load, deliveries[i - 1])', 'take = min(load, pickups[i - 1])'],
    ['let load = cap', 'for (let i = far; i > 0; i--)', 'const take = Math.min(load, deliveries[i - 1])', 'const take = Math.min(load, pickups[i - 1])']),
  done: lines(RESCAN, ['far = n', 'if far == 0', 'return answer'], ['let far = n', 'if (far === 0)', 'return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 78px은 줄 이름, 집 칸은 x 84부터 52px씩(칸 46px). 오른쪽 40px은 맨 끝 집 위 판정 표시가 장면 안에 들도록 둔 여백이다.
// 세로 띠: 집 번호 0~16, 배달 포인터 22~42, 배달 칸 48~88, 수거 칸 96~136, 수거 포인터 142~162, 표시 176~204(판정 표시가 위 11px에 붙는다),
// 왕복 막대는 214부터 28px 간격(22px 막대, 4줄). 왕복 막대는 창고(x 78)에서 시작한다.
const X0 = 84;
const PITCH = 52;
const CELL = 46;
const colX = (h: number) => X0 + (h - 1) * PITCH; // h번 집(1부터)의 칸 왼쪽 x
const DV_Y = 48;
const PK_Y = 96;
const TOK_Y = 176;
const LANE_Y = 214;
const SCENE_W = X0 + N * PITCH + 40;
const SCENE_H = LANE_Y + MAX_TRIPS * 28 + 6;
const dvId = (h: number) => `dv:${h}`;
const pkId = (h: number) => `pk:${h}`;
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const setCell = (id: string, patch: { text?: string; tone?: Tone }, pop = false): Action => ({ type: 'set', id, patch, pop });
const ptrRect = (row: 'd' | 'p' | 's', h: number): Rect => ({ x: h > 0 ? colX(h) + 3 : X0 - 50, y: row === 'p' ? 142 : 22, w: 40, h: 20 });
const ptrTo = (rec: PacedRecorder, row: 'd' | 'p' | 's', h: number, name: string): Action => {
  const id = `ptr:${row}`;
  return rec.has(id) ? { type: 'set', id, patch: { rect: ptrRect(row, h) } } : { type: 'add', item: { id, kind: 'token', rect: ptrRect(row, h), tone: 'chosen', text: name } };
};
const answerText = (n: number): Action => ({ type: 'set', id: 'tok:ans', patch: { text: `거리 ${n}`, tone: 'chosen' }, pop: true });
// r번째(0부터) 왕복 막대: 창고에서 h번 집 칸 오른쪽 끝까지
const tripItem = (r: number, h: number): Item => ({
  id: `trip:${r}`, kind: 'bar', rect: { x: X0 - 6, y: LANE_Y + r * 28, w: h * PITCH, h: 22 }, tone: 'path', fill: 1, text: `왕복 ${h * 2}`,
});

// 세 풀이가 같이 쓰는 장면: 집 번호, 배달·수거 상자 수, 줄 이름, 거리 표시. 상자가 없는 칸은 회색
function board(extra: Item[] = []): Scene {
  const items: Item[] = [
    { id: 'lab:dv', kind: 'text', rect: { x: 0, y: DV_Y, w: 78, h: 40 }, text: '배달' },
    { id: 'lab:pk', kind: 'text', rect: { x: 0, y: PK_Y, w: 78, h: 40 }, text: '수거' },
    { id: 'lab:trip', kind: 'text', rect: { x: 0, y: LANE_Y, w: 78, h: 22 }, tone: 'muted', text: '왕복 기록' },
    { id: 'tok:ans', kind: 'token', rect: { x: X0 + 280, y: TOK_Y, w: 96, h: 28 }, tone: 'plain', text: '거리 0' },
    ...extra,
  ];
  DELIV.forEach((dv, k) => items.push(
    { id: `hd:${k + 1}`, kind: 'text', rect: { x: colX(k + 1), y: 0, w: CELL, h: 16 }, tone: 'muted', text: `${k + 1}번 집` },
    { id: dvId(k + 1), kind: 'cell', rect: { x: colX(k + 1), y: DV_Y, w: CELL, h: 40 }, tone: dv ? 'plain' : 'explored', text: String(dv) },
    { id: pkId(k + 1), kind: 'cell', rect: { x: colX(k + 1), y: PK_Y, w: CELL, h: 40 }, tone: PICK[k] ? 'plain' : 'explored', text: String(PICK[k]) },
  ));
  return { width: SCENE_W, height: SCENE_H, items };
}

/* ------------------------------------------------------------------ */
/* 정석 밀린 양 들고 가기: 쌓기 → 왕복(여러 번 가능) → 확인하기 (집 하나가 한 단계)  */
/* ------------------------------------------------------------------ */

function carry(): Visualization {
  const rec = new PacedRecorder(board([
    { id: 'tok:d', kind: 'token', rect: { x: X0, y: TOK_Y, w: 130, h: 28 }, tone: 'plain', text: '배달 d = 0' },
    { id: 'tok:p', kind: 'token', rect: { x: X0 + 140, y: TOK_Y, w: 130, h: 28 }, tone: 'plain', text: '수거 p = 0' },
  ]));
  let [d, p, answer, work, trips, i] = [0, 0, 0, 0, 0, 0];
  const meta = () => ({ work, variables: { i: i || '-', d, p, answer } });
  const tokens = (): Action[] => [
    { type: 'set', id: 'tok:d', patch: { text: `배달 d = ${d}`, tone: 'chosen' }, pop: true },
    { type: 'set', id: 'tok:p', patch: { text: `수거 p = ${p}`, tone: 'chosen' }, pop: true },
  ];

  rec.step({ title: 'answer = 0, d = p = 0', codeHighlights: CARRY_AT.init, ...meta() });
  rec.phase('시작', '멀리 있는 집부터 보며 처리하지 못한 배달 d개와 수거 p개를 들고 갑니다. 처음엔 0개입니다.');
  rec.do(...together(tokens()));

  for (i = N; i > 0; i--) {
    const [dv, pk] = [DELIV[i - 1], PICK[i - 1]];
    const [d0, p0] = [d, p];
    d += dv;
    p += pk;
    work++;
    const done: Action[] = [setCell(dvId(i), { tone: 'visited' }), setCell(pkId(i), { tone: 'visited' })];
    const stops = Math.max(0, Math.ceil(Math.max(d, p) / CAP)); // 이 집에서 출발하는 왕복 수
    const dist = i * 2;

    // 단계 끝의 값(왕복을 모두 마친 d, p, answer, work)을 먼저 구해 둔다
    const [d1, p1] = [d - stops * CAP, p - stops * CAP];
    const [dMid, pMid] = [d, p];
    d = d1;
    p = p1;
    answer += stops * dist;
    rec.step({ title: `${i}번 집: 배달 ${dv}, 수거 ${pk} → ${stops ? `왕복 ${stops}번` : '왕복 없음'}`, codeHighlights: stops ? CARRY_AT.trip : CARRY_AT.check, ...meta() });
    rec.phase('쌓기', `${i}번 집 배달 ${dv}, 수거 ${josa(pk, '을', '를')} 더합니다. d = ${d0} + ${dv} = ${dMid}, p = ${p0} + ${pk} = ${pMid}`, CARRY_AT.add);
    rec.do(...together([
      { type: 'focus', ids: [dvId(i), pkId(i)] }, setCell(dvId(i), { tone: 'current' }), setCell(pkId(i), { tone: 'current' }),
      { type: 'set', id: 'tok:d', patch: { text: `배달 d = ${dMid}`, tone: 'chosen' }, pop: true },
      { type: 'set', id: 'tok:p', patch: { text: `수거 p = ${pMid}`, tone: 'chosen' }, pop: true },
    ]));
    let [dNow, pNow] = [dMid, pMid];
    for (let t = 0; t < stops; t++) {
      [dNow, pNow] = [dNow - CAP, pNow - CAP];
      trips++;
      rec.phase('왕복', `${dist}만큼 왕복: ${CAP}개씩 덜어 d = ${dNow}, p = ${pNow}`, CARRY_AT.trip);
      rec.do(...clear());
      rec.do(...together([
        { type: 'add', item: tripItem(trips - 1, i), from: dvId(i) },
        { type: 'set', id: 'tok:d', patch: { text: `배달 d = ${dNow}` }, pop: true },
        { type: 'set', id: 'tok:p', patch: { text: `수거 p = ${pNow}` }, pop: true },
        answerText(answer - (stops - 1 - t) * dist),
      ]));
    }
    rec.phase('확인하기', `d = ${dNow}, p = ${pNow}, 둘 다 0 이하라 ${i > 1 ? '다음 집으로 갑니다.' : '모든 집을 봤습니다.'}`, CARRY_AT.check);
    rec.do(...clear(...done));
    rec.do({ type: 'arrow', from: 'tok:d', to: 'tok:p', verdict: 'good', label: i > 1 ? 'd, p ≤ 0 → 다음 집' : 'd, p ≤ 0 → 끝' }, wait(300));
  }

  i = 0;
  rec.step({ title: `거리 합 ${answer}`, codeHighlights: CARRY_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `집을 한 번씩만 보고 왕복 ${trips}번에 거리 합 ${answer}입니다. 밀린 양이 음수인 만큼은 가까운 집에서 쓰입니다.`);
  rec.do(...together([...Array.from({ length: trips }, (_, r): Action => ({ type: 'set', id: `trip:${r}`, patch: { tone: 'good' } })), { type: 'set', id: 'tok:ans', patch: { tone: 'path' }, pop: true }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안·함정 왕복 따라 하기: 같은 상자 줄이기를 두 방식으로(포인터 / 처음부터 다시 훑기)  */
/* ------------------------------------------------------------------ */

// 왕복 한 번의 기록: 갈 집, 옮긴 상자(집, 개수), 이 왕복에서 집을 확인한 횟수
interface Trip { far: number; dFar: number; pFar: number; delivered: [number, number][]; picked: [number, number][]; reads: number; dEnd: number; pEnd: number }

// 대안(포인터 d, p를 유지) 코드를 그대로 따라 하며 왕복을 모은다
function simulatePointers(): { trips: Trip[]; tail: number } {
  const [dv, pk] = [[...DELIV], [...PICK]];
  let [d, p] = [N, N];
  const trips: Trip[] = [];
  for (;;) {
    let reads = 0;
    while (d > 0) { reads++; if (dv[d - 1] === 0) d--; else break; }
    while (p > 0) { reads++; if (pk[p - 1] === 0) p--; else break; }
    if (d === 0 && p === 0) return { trips, tail: reads };
    const [dFar, pFar] = [d, p];
    const [delivered, picked]: [number, number][][] = [[], []];
    let load = CAP;
    while (load > 0 && d > 0) {
      reads++;
      const take = Math.min(load, dv[d - 1]);
      dv[d - 1] -= take;
      load -= take;
      delivered.push([d, take]);
      if (dv[d - 1] === 0) d--;
    }
    load = CAP;
    while (load > 0 && p > 0) {
      reads++;
      const take = Math.min(load, pk[p - 1]);
      pk[p - 1] -= take;
      load -= take;
      picked.push([p, take]);
      if (pk[p - 1] === 0) p--;
    }
    trips.push({ far: Math.max(dFar, pFar), dFar, pFar, delivered, picked, reads, dEnd: d, pEnd: p });
  }
}

// 함정(왕복마다 처음부터 다시 훑기) 코드를 그대로 따라 하며 왕복을 모은다
function simulateRescan(): { trips: Trip[]; tail: number } {
  const [dv, pk] = [[...DELIV], [...PICK]];
  const trips: Trip[] = [];
  for (;;) {
    let reads = 0;
    let far = N;
    while (far > 0) { reads++; if (dv[far - 1] === 0 && pk[far - 1] === 0) far--; else break; }
    if (far === 0) return { trips, tail: reads };
    const [delivered, picked]: [number, number][][] = [[], []];
    let load = CAP;
    for (let i = far; i > 0; i--) {
      reads++;
      const take = Math.min(load, dv[i - 1]);
      dv[i - 1] -= take;
      load -= take;
      if (take) delivered.push([i, take]);
    }
    load = CAP;
    for (let i = far; i > 0; i--) {
      reads++;
      const take = Math.min(load, pk[i - 1]);
      pk[i - 1] -= take;
      load -= take;
      if (take) picked.push([i, take]);
    }
    trips.push({ far, dFar: far, pFar: far, delivered, picked, reads, dEnd: 0, pEnd: 0 });
  }
}

const parts = (xs: [number, number][]) => (xs.some(([, t]) => t) ? xs.filter(([, t]) => t).map(([h, t]) => `${h}번 집 ${t}개`).join(', ') : '없음');

// 왕복 하나를 따라 하는 단계(대안과 함정이 같은 뼈대): 찾기 → 왕복 → 상자 옮기기
function simulate(mode: 'pointers' | 'rescan'): Visualization {
  const isPtr = mode === 'pointers';
  const sim = isPtr ? simulatePointers() : simulateRescan();
  const AT = isPtr ? POINTERS_AT : RESCAN_AT;
  const rec = new PacedRecorder(board());
  const [dv, pk] = [[...DELIV], [...PICK]];
  let [answer, work, shown] = [0, 0, 0];
  let [d, p] = [N, N];
  const meta = () => ({ work, variables: (isPtr ? { d, p, answer } : { far: shown || '-', answer }) as Record<string, string | number> });

  rec.step({ title: isPtr ? 'd = p = n에서 시작' : '왕복마다 처음부터 다시 훑기', codeHighlights: AT.init, ...meta() });
  rec.phase('시작', isPtr
    ? `배달·수거가 남은 가장 먼 집을 가리키는 포인터 d, p를 ${N}번 집에 두고 시작합니다.`
    : '왕복할 때마다 가장 먼 집을 맨 끝(7번 집)에서부터 다시 찾고, 집을 끝까지 훑습니다.');
  rec.do(...together(isPtr ? [ptrTo(rec, 'd', N, 'd'), ptrTo(rec, 'p', N, 'p')] : [ptrTo(rec, 's', N, 'far')]));

  sim.trips.forEach((t, r) => {
    work += t.reads;
    answer += t.far * 2;
    shown = t.far;
    // 단계가 끝난 뒤의 값
    t.delivered.forEach(([h, take]) => (dv[h - 1] -= take));
    t.picked.forEach(([h, take]) => (pk[h - 1] -= take));
    [d, p] = [t.dEnd, t.pEnd];
    const cellActs = (): Action[] => [
      ...t.delivered.filter(([, take]) => take).map(([h]): Action => setCell(dvId(h), { text: String(dv[h - 1]), tone: dv[h - 1] ? 'plain' : 'visited' }, true)),
      ...t.picked.filter(([, take]) => take).map(([h]): Action => setCell(pkId(h), { text: String(pk[h - 1]), tone: pk[h - 1] ? 'plain' : 'visited' }, true)),
    ];

    rec.step({ title: `${r + 1}번째 왕복: ${t.far}번 집까지 (거리 ${t.far * 2})`, codeHighlights: AT.move, ...meta() });
    rec.phase(isPtr ? '먼 집 찾기' : '훑기', isPtr
      ? `배달은 ${t.dFar ? `${t.dFar}번` : '끝'}, 수거는 ${t.pFar ? `${t.pFar}번` : '끝'} 집까지 남았으니 ${t.far}번 집까지 갑니다.`
      : `${N}번 집부터 거꾸로 확인해 가장 먼 집 ${t.far}번을 찾습니다. 집을 ${N - t.far + 1}번 확인했습니다.`, AT.find);
    const focusIds = isPtr
      ? [...(t.dFar ? [dvId(t.dFar)] : []), ...(t.pFar ? [pkId(t.pFar)] : [])]
      : [dvId(t.far), pkId(t.far)];
    rec.do(...together([{ type: 'focus', ids: focusIds }, ...(isPtr ? [ptrTo(rec, 'd', t.dFar, 'd'), ptrTo(rec, 'p', t.pFar, 'p')] : [ptrTo(rec, 's', t.far, 'far')])]));

    rec.phase('왕복', `${t.far}번 집까지 왕복해 거리 ${josa(t.far * 2, '을', '를')} 더합니다. 합계 ${answer}입니다.`, AT.trip);
    rec.do(...clear());
    rec.do(...together([{ type: 'add', item: tripItem(r, t.far), from: dvId(t.far) }, answerText(answer)]));

    rec.phase('상자 옮기기', isPtr
      ? `먼 집부터 ${CAP}개씩 옮깁니다. 배달: ${parts(t.delivered)}, 수거: ${parts(t.picked)}.`
      : `집 ${t.far}채를 두 번 끝까지 훑으며 옮깁니다. 배달: ${parts(t.delivered)}, 수거: ${parts(t.picked)}.`, AT.move);
    rec.do(...together([...cellActs(), ...(isPtr ? [ptrTo(rec, 'd', d, 'd'), ptrTo(rec, 'p', p, 'p')] : [])]));
  });

  work += sim.tail;
  shown = 0;
  rec.step({ title: `거리 합 ${answer}`, codeHighlights: AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', isPtr
    ? `남은 상자가 없어 거리 합 ${answer}입니다. 정석과 같은 답이지만 집을 ${work}번 확인했고, 정석은 ${N}번이면 됩니다.`
    : `답은 ${ro(answer)} 맞지만 집을 ${work}번 확인했습니다. 왕복마다 집을 처음부터 훑어 왕복 수 × n이 되므로, n = 10만이면 시간 초과입니다.`);
  rec.do(...together([...Array.from({ length: sim.trips.length }, (_, r): Action => ({ type: 'set', id: `trip:${r}`, patch: { tone: 'good' } })), { type: 'set', id: 'tok:ans', patch: { tone: 'path' }, pop: true }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'delivery-pickup',
  title: '택배 배달과 수거하기',
  level: 2,
  category: 'greedy',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/150369',
  description: {
    summary:
      '창고에서 일직선으로 늘어선 n개의 집으로 택배를 배달하고, 집에 쌓인 빈 상자를 수거해 창고로 가져옵니다. i번 집은 창고에서 i만큼 떨어져 있고, 트럭에는 상자를 한 번에 최대 cap개 실을 수 있습니다. 모든 배달과 수거를 마치고 창고로 돌아오는 최소 이동 거리를 구합니다.',
    rules: [
      '1 ≤ cap ≤ 50',
      '1 ≤ n ≤ 100,000',
      'deliveries와 pickups의 길이는 n이고, 각 원소는 0 이상 50 이하',
      '빈 상자는 창고로 가져와야 하므로, 수거한 상자를 실을 자리도 트럭에 남아 있어야 함',
    ],
    examples: [
      { input: 'cap = 4, n = 5, deliveries = [1, 0, 3, 1, 2], pickups = [0, 3, 0, 4, 0]', output: '16' },
      { input: 'cap = 2, n = 7, deliveries = [1, 0, 2, 0, 1, 0, 2], pickups = [0, 2, 0, 1, 0, 2, 0]', output: '30' },
    ],
  },
  keyIntuitions: [
    '가장 먼 집까지 가는 왕복은 어차피 필요하니, 먼 집부터 처리해야 가까운 집은 그 왕복에 덤으로 끼워 넣을 수 있습니다.',
    '배달은 갈 때 내려놓고 수거는 올 때 싣습니다. 그래서 배달과 수거는 서로 영향을 주지 않고, 왕복 한 번에 각각 cap개씩 처리됩니다.',
    '먼 집부터 처리하지 못한 배달 d개와 수거 p개를 들고 가면서, d나 p가 0보다 크면 그 집까지 왕복을 한 번 더 합니다. 음수는 트럭에 여유가 남았다는 뜻입니다.',
  ],
  demo: { input: [CAP, N, DELIV, PICK], label: 'cap = 3, n = 7, deliveries = [2, 0, 1, 3, 0, 1, 4], pickups = [0, 2, 3, 0, 5, 0, 1]' },
  workUnit: '집을 확인한 횟수',
  approaches: [
    {
      id: 'delivery-pickup-carry',
      name: '먼 집부터 밀린 양을 들고 가기',
      rank: 'BEST',
      timeComplexity: 'O(n + 왕복 수)',
      spaceComplexity: 'O(1)',
      verdict: '먼 집부터 처리하지 못한 배달·수거 상자 수를 들고 가며, 0보다 크면 그 집까지 왕복을 더하는 풀이입니다.',
      pros: [
        '집을 한 번씩만 보고, 배열을 고치지 않아 코드가 짧습니다.',
        '음수로 트럭의 남은 자리까지 한 변수에 담아, 가까운 집을 덤으로 처리하는 일을 따로 계산하지 않습니다.',
        'n이 10만이어도 순식간에 끝납니다.',
      ],
      cons: [
        'd와 p가 "처리하지 못한 양"이면서 음수일 땐 "여유"라는 이중 의미를 이해해야 합니다.',
        '배달과 수거를 합쳐 왕복 거리를 하나로 세는 이유(더 먼 쪽 기준)가 코드에 드러나지 않습니다.',
      ],
      whyThisRank:
        '가장 먼 집까지의 왕복은 반드시 필요하고, 그 왕복에 cap개씩 배달·수거를 모두 끼워 넣는 것이 가장 알뜰합니다. 먼 집부터 처리하면 이 선택이 매번 안전합니다.',
      code: CARRY,
      visualize: carry,
    },
    {
      id: 'delivery-pickup-pointers',
      name: '포인터 두 개로 왕복 따라 하기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(n + 왕복 수)',
      spaceComplexity: 'O(1)',
      verdict: '배달·수거가 남은 가장 먼 집을 포인터 둘로 가리키며, 왕복마다 상자를 실제로 덜어 내는 맞지만 손이 많이 가는 풀이입니다.',
      pros: [
        '왕복을 눈으로 따라 하는 방식이라 직관적입니다.',
        '포인터를 되감지 않아 집을 처음부터 다시 훑지 않습니다.',
      ],
      cons: [
        '포인터 두 개와 상자를 덜어 내는 반복문이 있어 코드가 길고 경계를 틀리기 쉽습니다.',
        'deliveries와 pickups 배열을 직접 고칩니다.',
      ],
      whyThisRank:
        '아이디어는 정석과 같지만 상자 하나하나를 덜어 내며 배열을 고쳐야 합니다. 정석은 같은 일을 "밀린 양" 두 개로 압축합니다.',
      code: POINTERS,
      visualize: () => simulate('pointers'),
    },
    {
      id: 'delivery-pickup-rescan',
      name: '왕복마다 집을 처음부터 다시 훑기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(왕복 수 × n)',
      spaceComplexity: 'O(1)',
      verdict: '왕복할 때마다 가장 먼 집을 끝에서부터 다시 찾고 집을 끝까지 훑는 풀이로, 답은 맞지만 왕복이 많으면 시간 초과입니다.',
      pros: ['생각한 대로 그대로 따라 하면 되어 가장 쉽습니다.', '작은 입력에서는 답이 맞습니다.'],
      cons: [
        'cap = 1이고 상자가 많으면 왕복이 수백만 번인데, 왕복마다 집 10만 채를 다시 훑습니다.',
        '트럭이 이미 가득 차도 반복문이 끝까지 돌아 낭비가 큽니다.',
      ],
      whyThisRank:
        '이미 확인한 집을 왕복마다 다시 확인합니다. 먼 집부터 한 번만 훑으며 밀린 양을 들고 가면, 왕복 수와 n을 곱할 필요가 없습니다.',
      code: RESCAN,
      visualize: () => simulate('rescan'),
    },
  ],
  checks: {
    cases: [
      { args: [4, 5, [1, 0, 3, 1, 2], [0, 3, 0, 4, 0]], expected: 16 },
      { args: [2, 7, [1, 0, 2, 0, 1, 0, 2], [0, 2, 0, 1, 0, 2, 0]], expected: 30 },
      { args: [1, 1, [1], [0]], expected: 2 },
      { args: [3, 2, [0, 0], [0, 0]], expected: 0 },
      { args: [50, 3, [1, 1, 1], [1, 1, 1]], expected: 6 },
      { args: [1, 2, [0, 1], [1, 0]], expected: 4 },
      { args: [2, 4, [0, 0, 0, 5], [0, 0, 0, 0]], expected: 24 },
      { args: [CAP, N, DELIV, PICK], expected: 40 },
    ],
    // cap 1~4, 집 1~7채, 상자 0~4개
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 7);
      const row = () => Array.from({ length: n }, () => Math.floor(rand() * 5));
      return [1 + Math.floor(rand() * 4), n, row(), row()];
    },
  },
};

export default problem;
