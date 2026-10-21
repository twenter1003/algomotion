// 다리를 지나는 트럭: 정석 시간별 큐(하차 시각 기록 + 시각 점프), 대안 0을 채운 다리 큐를 1초씩 밀기, 함정 무게가 넘칠 때마다 다리 길이만큼 더하고 다리 비우기를 같은 장면에서 움직인다.
// 장면은 위에서부터 상태 칸(시각, 다리 무게, 한도) · 다리 큐 줄 · 대기 트럭 줄 · 건넌 트럭 줄이다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import type { Action, Item, Problem, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';

// 시각화 입력. T2(4)와 T3(5)가 함께 다리에 오른 뒤 7초에 T2만 먼저 내려가면서 T4(4)가 곧바로 올라탄다.
// 다리가 통째로 비어야 다음 트럭이 오른다고 착각하는 함정은 12초를 내어 정답 11초와 갈린다.
const BRIDGE_LENGTH = 3;
const WEIGHT = 10;
const TRUCKS = [7, 4, 5, 4, 6];
const N = TRUCKS.length;

const tName = (i: number) => `T${i + 1}(${TRUCKS[i]})`;
const list = (xs: (number | string)[]) => `[${xs.join(', ')}]`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  python: `from collections import deque

def solution(bridge_length, weight, truck_weights):
    bridge = deque()  # (트럭 무게, 다리를 다 건너는 시각)
    cur_weight = 0
    time = 0

    for truck in truck_weights:
        time += 1
        if bridge and bridge[0][1] == time:
            cur_weight -= bridge.popleft()[0]

        while cur_weight + truck > weight:  # 무게가 넘치면 맨 앞 트럭이 내릴 시각으로 점프
            w, time = bridge.popleft()
            cur_weight -= w

        bridge.append((truck, time + bridge_length))
        cur_weight += truck

    return bridge[-1][1]  # 마지막 트럭이 다리를 빠져나가는 시각`,
  javascript: `function solution(bridge_length, weight, truck_weights) {
  const bridge = []; // [트럭 무게, 다리를 다 건너는 시각]
  let head = 0; // shift() 대신 머리 인덱스로 큐를 꺼냅니다
  let curWeight = 0;
  let time = 0;

  for (const truck of truck_weights) {
    time += 1;
    if (head < bridge.length && bridge[head][1] === time) {
      curWeight -= bridge[head++][0];
    }

    while (curWeight + truck > weight) { // 무게가 넘치면 맨 앞 트럭이 내릴 시각으로 점프
      const [w, exitTime] = bridge[head++];
      curWeight -= w;
      time = exitTime;
    }

    bridge.push([truck, time + bridge_length]);
    curWeight += truck;
  }

  return bridge[bridge.length - 1][1]; // 마지막 트럭이 다리를 빠져나가는 시각
}`,
};
const BEST_AT = {
  start: lines(BEST_CODE, ['bridge = deque()', 'cur_weight = 0', 'time = 0'], ['const bridge = []', 'let curWeight = 0', 'let time = 0']),
  stepTime: lines(BEST_CODE, ['for truck in truck_weights:', 'time += 1', 'if bridge and bridge[0][1] == time:'], ['for (const truck of truck_weights)', 'time += 1;', 'if (head < bridge.length && bridge[head][1] === time)']),
  jump: lines(BEST_CODE, ['while cur_weight + truck > weight:', 'w, time = bridge.popleft()', 'cur_weight -= w'], ['while (curWeight + truck > weight)', 'const [w, exitTime] = bridge[head++]', 'time = exitTime;']),
  enter: lines(BEST_CODE, ['bridge.append((truck, time + bridge_length))', 'cur_weight += truck'], ['bridge.push([truck, time + bridge_length])', 'curWeight += truck;']),
  done: lines(BEST_CODE, ['return bridge[-1][1]'], ['return bridge[bridge.length - 1][1]']),
};

const ALT_CODE = {
  python: `from collections import deque

def solution(bridge_length, weight, truck_weights):
    bridge = deque([0] * bridge_length)  # 다리 칸마다 무게 기록 (빈칸은 0)
    trucks = deque(truck_weights)
    cur_weight = 0
    time = 0

    while trucks or cur_weight > 0:
        time += 1
        cur_weight -= bridge.popleft()   # 1초마다 맨 앞 칸이 다리를 빠져나감
        if trucks and cur_weight + trucks[0] <= weight:
            w = trucks.popleft()
            bridge.append(w)
            cur_weight += w
        else:
            bridge.append(0)             # 못 올라가면 빈칸(0)을 채워 밀기

    return time`,
  javascript: `function solution(bridge_length, weight, truck_weights) {
  const bridge = new Array(bridge_length).fill(0); // 다리 칸마다 무게 기록 (빈칸은 0)
  let bHead = 0;
  let tHead = 0;
  let curWeight = 0;
  let time = 0;

  while (tHead < truck_weights.length || curWeight > 0) {
    time += 1;
    curWeight -= bridge[bHead++]; // 1초마다 맨 앞 칸이 다리를 빠져나감
    if (tHead < truck_weights.length && curWeight + truck_weights[tHead] <= weight) {
      const w = truck_weights[tHead++];
      bridge.push(w);
      curWeight += w;
    } else {
      bridge.push(0); // 못 올라가면 빈칸(0)을 채워 밀기
    }
  }

  return time;
}`,
};
const ALT_AT = {
  start: lines(ALT_CODE, ['bridge = deque([0] * bridge_length)', 'trucks = deque(truck_weights)'], ['const bridge = new Array(bridge_length).fill(0)', 'let curWeight = 0']),
  tick: lines(ALT_CODE, ['while trucks or cur_weight > 0:', 'time += 1', 'cur_weight -= bridge.popleft()'], ['while (tHead < truck_weights.length || curWeight > 0)', 'time += 1;', 'curWeight -= bridge[bHead++]']),
  enter: lines(ALT_CODE, ['if trucks and cur_weight + trucks[0] <= weight:', 'bridge.append(w)', 'cur_weight += w'], ['if (tHead < truck_weights.length && curWeight + truck_weights[tHead] <= weight)', 'bridge.push(w);', 'curWeight += w;']),
  pushZero: lines(ALT_CODE, ['else:', 'bridge.append(0)'], ['} else {', 'bridge.push(0);']),
  done: lines(ALT_CODE, ['return time'], ['return time;']),
};

const TRAP_CODE = {
  python: `def solution(bridge_length, weight, truck_weights):
    time = 0
    cur_weight = 0

    for w in truck_weights:
        if cur_weight + w <= weight:
            time += 1
            cur_weight += w
        else:
            # 함정: 무게가 넘치면 다리 길이만큼 더하고 다리가 통째로 빈다고 착각
            time += bridge_length
            cur_weight = w

    return time + bridge_length`,
  javascript: `function solution(bridge_length, weight, truck_weights) {
  let time = 0;
  let curWeight = 0;

  for (const w of truck_weights) {
    if (curWeight + w <= weight) {
      time += 1;
      curWeight += w;
    } else {
      // 함정: 무게가 넘치면 다리 길이만큼 더하고 다리가 통째로 빈다고 착각
      time += bridge_length;
      curWeight = w;
    }
  }

  return time + bridge_length;
}`,
};
const TRAP_AT = {
  start: lines(TRAP_CODE, ['time = 0', 'cur_weight = 0'], ['let time = 0', 'let curWeight = 0']),
  fit: lines(TRAP_CODE, ['if cur_weight + w <= weight:', 'time += 1', 'cur_weight += w'], ['if (curWeight + w <= weight)', 'time += 1;', 'curWeight += w;']),
  reset: lines(TRAP_CODE, ['else:', 'time += bridge_length', 'cur_weight = w'], ['} else {', 'time += bridge_length;', 'curWeight = w;']),
  done: lines(TRAP_CODE, ['return time + bridge_length'], ['return time + bridge_length;']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const X0 = 84;
const BRIDGE_Y = 74;
const WAIT_Y = 152;
const DONE_Y = 230;
const W = 616;
const H = DONE_Y + 56;

const BRIDGE_LANE: LaneOptions = { id: 'bridge', x: X0, y: BRIDGE_Y + 4, slotW: 96, slotH: 46, gap: 8, max: BRIDGE_LENGTH };
const WAIT_LANE: LaneOptions = { id: 'wait', x: X0, y: WAIT_Y + 4, slotW: 72, slotH: 46, gap: 8, max: N };
const DONE_LANE: LaneOptions = { id: 'done', x: X0, y: DONE_Y + 4, slotW: 72, slotH: 44, gap: 8, max: N };

const waitTokId = (i: number) => `wt:${i}`;
const bridgeTokId = (i: number) => `br:${i}`;
const doneTokId = (i: number) => `dn:${i}`;

const rowLabel = (id: string, text: string, y: number, h: number): Item => ({
  id,
  kind: 'text',
  rect: { x: 0, y, w: 76, h },
  text,
});

function board(): Scene {
  return {
    width: W,
    height: H,
    items: [
      rowLabel('row:stat', '상태', 0, 52),
      { id: 'cell:time', kind: 'cell', rect: { x: X0, y: 0, w: 78, h: 52 }, tone: 'plain', text: '0초', tag: '시각' },
      { id: 'cell:weight', kind: 'cell', rect: { x: X0 + 88, y: 0, w: 78, h: 52 }, tone: 'plain', text: '0', tag: '다리 무게' },
      { id: 'cell:limit', kind: 'cell', rect: { x: X0 + 176, y: 0, w: 78, h: 52 }, tone: 'plain', text: String(WEIGHT), tag: '한도' },
      rowLabel('row:bridge', `다리(${BRIDGE_LENGTH})`, BRIDGE_Y, 54),
      { id: 'bridge:bg', kind: 'zone', rect: { x: X0 - 4, y: BRIDGE_Y, w: BRIDGE_LENGTH * 104, h: 54 } },
      rowLabel('row:wait', '대기 큐', WAIT_Y, 54),
      { id: 'wait:bg', kind: 'zone', rect: { x: X0 - 4, y: WAIT_Y, w: N * 80, h: 54 } },
      rowLabel('row:done', '건넌 트럭', DONE_Y, 52),
      { id: 'done:bg', kind: 'zone', rect: { x: X0 - 4, y: DONE_Y, w: N * 80, h: 52 } },
    ],
  };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const setStat = (time: number, curWeight: number, wTone: Tone = 'queued'): Action[] =>
  together([
    { type: 'set', id: 'cell:time', patch: { text: `${time}초`, tone: 'current' }, pop: true },
    { type: 'set', id: 'cell:weight', patch: { text: String(curWeight), tone: curWeight === 0 ? 'plain' : wTone }, pop: true },
  ]);

/* ------------------------------------------------------------------ */
/* 정석: 시간별 큐 (트럭의 하차 시각 기록 + 점프)                         */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new StepRecorder(board());
  const bLane = new Lane(rec, BRIDGE_LANE);
  const wLane = new Lane(rec, WAIT_LANE);
  const dLane = new Lane(rec, DONE_LANE);

  const onBridge: { idx: number; w: number; exit: number }[] = [];
  let curWeight = 0;
  let time = 0;
  let events = 0;

  const meta = () => ({
    work: events,
    variables: {
      time: `${time}초`,
      cur_weight: curWeight,
      bridge: list(onBridge.map((b) => `${tName(b.idx)}→${b.exit}초`)),
    },
  });

  rec.step({
    title: `대기 트럭 ${list(TRUCKS)} 준비 (다리 길이 ${BRIDGE_LENGTH}, 한도 ${WEIGHT})`,
    codeHighlights: BEST_AT.start,
    ...meta(),
  });
  rec.phase('준비', `다리에는 최대 ${BRIDGE_LENGTH}대, 무게 합 ${WEIGHT}까지 올라갈 수 있습니다. 다리 큐에는 (트럭, 나가는 시각)만 기록합니다.`);
  for (let i = 0; i < N; i++) {
    wLane.push({ id: waitTokId(i), text: tName(i), tone: 'queued' });
  }
  rec.do(wait(600));

  // 1. T1(7) at t=1
  time = 1;
  curWeight = 7;
  events++;
  onBridge.push({ idx: 0, w: 7, exit: 4 });
  rec.step({
    title: '1초: T1(7) 다리 진입 (4초 하차 예정)',
    codeHighlights: BEST_AT.enter,
    ...meta(),
  });
  rec.phase('진입', '1초에 T1(7)이 다리에 올라갑니다. 다리 길이가 3이므로 1 + 3 = 4초에 다리를 빠져나갑니다.', BEST_AT.enter);
  wLane.shift( 'bridge:bg');
  bLane.push({ id: bridgeTokId(0), text: 'T1(7)·4초', tone: 'current' });
  rec.do(...setStat(time, curWeight), wait(400));

  // 2. T2(4) checks at t=2 -> jumps to t=4
  time = 2;
  events++;
  rec.step({
    title: '2초: T2(4) 대기 — 7 + 4 > 10이라 진입 불가',
    codeHighlights: BEST_AT.stepTime,
    ...meta(),
  });
  rec.phase('무게 확인', '2초에 T2(4)가 올라가려 하지만 다리 무게 7 + 4 = 11 > 10이라 올라갈 수 없습니다.', BEST_AT.stepTime);
  rec.do(
    ...setStat(time, curWeight),
    { type: 'focus', ids: [waitTokId(1), 'cell:weight', 'cell:limit'] },
    { type: 'arrow', from: waitTokId(1), to: 'cell:limit', verdict: 'bad', label: '7 + 4 > 10' },
    wait(350),
    ...clear(),
  );

  // 3. Jump to t=4: T1 exits, T2 enters
  time = 4;
  onBridge.shift();
  onBridge.push({ idx: 1, w: 4, exit: 7 });
  curWeight = 4;
  events++;
  rec.step({
    title: '4초로 점프: T1(7) 하차 후 T2(4) 진입 (7초 하차 예정)',
    codeHighlights: BEST_AT.jump,
    ...meta(),
  });
  rec.phase('시각 점프', '빈 초를 일일이 세지 않고 맨 앞 T1(7)이 내리는 4초로 바로 건너뛰어 T1을 내보냅니다.', BEST_AT.jump);
  bLane.shift('done:bg');
  dLane.push({ id: doneTokId(0), text: tName(0), tone: 'visited' });
  rec.do(...setStat(time, 0), wait(250));
  rec.phase('진입', '4초에 다리가 비었으므로 T2(4)가 올라갑니다. 4 + 3 = 7초에 하차합니다.', BEST_AT.enter);
  wLane.shift('bridge:bg');
  bLane.push({ id: bridgeTokId(1), text: 'T2(4)·7초', tone: 'current' });
  rec.do(...setStat(time, curWeight), wait(300));

  // 4. t=5: T3(5) enters
  time = 5;
  onBridge.push({ idx: 2, w: 5, exit: 8 });
  curWeight = 9;
  events++;
  rec.step({
    title: '5초: 4 + 5 ≤ 10 → T3(5) 이어서 진입 (8초 하차 예정)',
    codeHighlights: BEST_AT.enter,
    ...meta(),
  });
  rec.phase('무게 확인', '5초에 다리 무게 4 + T3(5) = 9 ≤ 10이므로 기다리지 않고 바로 올라갑니다.', BEST_AT.stepTime);
  rec.do(
    { type: 'focus', ids: [waitTokId(2), 'cell:weight', 'cell:limit'] },
    { type: 'arrow', from: waitTokId(2), to: 'cell:limit', verdict: 'good', label: '4 + 5 ≤ 10' },
    wait(250),
  );
  rec.phase('진입', 'T3(5)가 다리에 올라 5 + 3 = 8초에 하차합니다. 다리 위에는 T2(4), T3(5) 두 대가 있습니다.', BEST_AT.enter);
  wLane.shift('bridge:bg');
  bLane.push({ id: bridgeTokId(2), text: 'T3(5)·8초', tone: 'current' });
  rec.do(...together([...setStat(time, curWeight), ...clear()], true), wait(300));

  // 5. t=6: T4(4) checks -> 9+4 > 10
  time = 6;
  events++;
  rec.step({
    title: '6초: T4(4) 대기 — 9 + 4 > 10이라 진입 불가',
    codeHighlights: BEST_AT.stepTime,
    ...meta(),
  });
  rec.phase('무게 확인', '6초에 T4(4)가 올라가려 하지만 9 + 4 = 13 > 10이라 맨 앞 T2(4)가 내릴 때까지 기다려야 합니다.', BEST_AT.stepTime);
  rec.do(
    ...setStat(time, curWeight),
    { type: 'focus', ids: [waitTokId(3), 'cell:weight', 'cell:limit'] },
    { type: 'arrow', from: waitTokId(3), to: 'cell:limit', verdict: 'bad', label: '9 + 4 > 10' },
    wait(350),
    ...clear(),
  );

  // 6. Jump to t=7: T2(4) exits, T4(4) enters alongside T3(5)!
  time = 7;
  onBridge.shift();
  onBridge.push({ idx: 3, w: 4, exit: 10 });
  curWeight = 9;
  events++;
  rec.step({
    title: '7초로 점프: T2(4)만 하차 후 T4(4) 즉시 진입 (10초 하차)',
    codeHighlights: BEST_AT.jump,
    ...meta(),
  });
  rec.phase('시각 점프', '맨 앞 T2(4)가 내리는 7초로 건너뜁니다. T3(5)는 아직 다리 위에 남아 무게가 5가 됩니다.', BEST_AT.jump);
  bLane.shift('done:bg');
  dLane.push({ id: doneTokId(1), text: tName(1), tone: 'visited' });
  rec.do(...setStat(time, 5), wait(250));
  rec.phase('진입', '남은 무게 5 + T4(4) = 9 ≤ 10이므로 T3(5)가 내려가길 기다리지 않고 7초에 바로 T4(4)가 진입합니다.', BEST_AT.enter);
  wLane.shift('bridge:bg');
  bLane.push({ id: bridgeTokId(3), text: 'T4(4)·10초', tone: 'current' });
  rec.do(...setStat(time, curWeight), wait(300));

  // 7. t=8: T3(5) exits at 8, T5(6) enters at 8 (exit 11)
  time = 8;
  onBridge.shift();
  onBridge.push({ idx: 4, w: 6, exit: 11 });
  curWeight = 10;
  events++;
  rec.step({
    title: '8초: T3(5) 하차 후 마지막 T5(6) 진입 (11초 하차)',
    codeHighlights: BEST_AT.enter,
    ...meta(),
  });
  rec.phase('하차 후 진입', '8초에 T3(5)가 내려가면 다리 무게가 4가 되고, 4 + T5(6) = 10 ≤ 10이라 T5(6)가 바로 진입합니다.', BEST_AT.stepTime);
  bLane.shift('done:bg');
  dLane.push({ id: doneTokId(2), text: tName(2), tone: 'visited' });
  wLane.shift('bridge:bg');
  bLane.push({ id: bridgeTokId(4), text: 'T5(6)·11초', tone: 'current' });
  rec.do(...setStat(time, curWeight), wait(350));

  // 8. Final exit at t=11
  time = 11;
  onBridge.length = 0;
  curWeight = 0;
  events++;
  rec.step({
    title: '11초: 마지막 T5(6) 하차 완료 — 정답 11초',
    codeHighlights: BEST_AT.done,
    ...meta(),
    answer: 11,
    isKeyframe: true,
  });
  rec.phase('완주', '대기 트럭이 모두 올라갔으므로 마지막 트럭 T5(6)의 하차 시각인 bridge[-1][1] = 11초가 그대로 정답입니다.', BEST_AT.done);
  bLane.shift('done:bg');
  dLane.push({ id: doneTokId(3), text: tName(3), tone: 'path' });
  bLane.shift('done:bg');
  dLane.push({ id: doneTokId(4), text: tName(4), tone: 'path' });
  rec.do(
    ...together(
      [
        ...setStat(time, 0),
        ...dLane.ids.map((id): Action => ({ type: 'set', id, patch: { tone: 'path' } })),
      ],
      true,
    ),
    wait(400),
  );

  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 0을 채운 다리 큐를 1초씩 밀기                                    */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new StepRecorder(board());
  const bLane = new Lane(rec, BRIDGE_LANE);
  const wLane = new Lane(rec, WAIT_LANE);
  const dLane = new Lane(rec, DONE_LANE);

  const bridge: number[] = [0, 0, 0];
  let curWeight = 0;
  let time = 0;
  let nextTruck = 0;
  let zCount = 3;

  const meta = () => ({
    work: time,
    variables: {
      time: `${time}초`,
      cur_weight: curWeight,
      bridge: list(bridge),
      trucks: list(TRUCKS.slice(nextTruck)),
    },
  });

  rec.step({
    title: `길이 ${BRIDGE_LENGTH}짜리 다리 큐를 [0, 0, 0]으로 채워 시작`,
    codeHighlights: ALT_AT.start,
    ...meta(),
  });
  rec.phase('준비', `다리 칸마다 토큰을 두어 빈칸은 0으로 채웁니다. 1초마다 맨 앞을 꺼내고 뒤에서 새 트럭이나 0을 밀어 넣습니다.`);
  for (let i = 0; i < BRIDGE_LENGTH; i++) {
    bLane.push({ id: `z:${i}`, text: '0', tone: 'muted' });
  }
  for (let i = 0; i < N; i++) {
    wLane.push({ id: waitTokId(i), text: tName(i), tone: 'queued' });
  }
  rec.do(wait(600));

  // 1초~8초까지 매초 진행
  const exitedOrder: number[] = [];
  for (let t = 1; t <= 8; t++) {
    time = t;
    const out = bridge.shift()!;
    curWeight -= out;
    const cand = nextTruck < N ? TRUCKS[nextTruck] : undefined;
    const canEnter = cand !== undefined && curWeight + cand <= WEIGHT;
    let enteredIdx: number | undefined;
    if (canEnter) {
      enteredIdx = nextTruck++;
      bridge.push(cand!);
      curWeight += cand!;
    } else {
      bridge.push(0);
    }

    rec.step({
      title: canEnter
        ? `${t}초: 앞 칸(${out}) 빠지고 ${tName(enteredIdx!)} 진입`
        : `${t}초: ${curWeight} + ${cand} > 10 → 빈칸(0) 밀어 넣기`,
      codeHighlights: canEnter ? ALT_AT.enter : ALT_AT.pushZero,
      ...meta(),
    });
    rec.phase(
      '1초 진행',
      out > 0
        ? `${t}초가 되어 맨 앞 트럭(${out})이 다리를 빠져나가고 다리 무게가 ${curWeight - (canEnter ? cand! : 0)}이 됩니다.`
        : `${t}초가 되어 다리 맨 앞 빈칸(0)이 빠집니다.`,
      ALT_AT.tick,
    );
    bLane.shift(out > 0 ? 'done:bg' : undefined);
    if (out > 0) {
      const doneIdx = exitedOrder.length;
      exitedOrder.push(doneIdx);
      dLane.push({ id: doneTokId(doneIdx), text: tName(doneIdx), tone: 'visited' });
    }

    if (canEnter) {
      rec.phase('트럭 진입', `다리 무게가 ${curWeight} ≤ ${WEIGHT}이므로 ${josa(tName(enteredIdx!), '을', '를')} 다리 끝에 올립니다.`, ALT_AT.enter);
      wLane.shift('bridge:bg');
      bLane.push({ id: bridgeTokId(enteredIdx!), text: tName(enteredIdx!), tone: 'current' });
    } else {
      rec.phase('0 채우기', `다음 트럭(${cand})이 올라가면 한도 ${WEIGHT}을 넘으므로 빈칸(0)을 넣어 한 칸만 전진시킵니다.`, ALT_AT.pushZero);
      bLane.push({ id: `z:${zCount++}`, text: '0', tone: 'muted' });
    }
    rec.do(...setStat(time, curWeight), wait(250));
  }

  // 9~11초: 마지막 트럭이 다리를 빠져나가는 3초 빨리 감기
  time = 11;
  curWeight = 0;
  bridge.splice(0, 3, 0, 0, 0);
  rec.step({
    title: '9~11초(빨리 감기): 남은 트럭 2대 하차 — 정답 11초',
    codeHighlights: ALT_AT.done,
    ...meta(),
    answer: 11,
    isKeyframe: true,
  });
  rec.phase('남은 구간 진행', '대기 트럭이 모두 올라갔으니 9초, 10초, 11초까지 0을 밀어 넣어 T4(4)와 T5(6)가 모두 건너면 총 11초입니다.', ALT_AT.done);
  for (let k = 0; k < 3; k++) {
    bLane.shift('done:bg');
    bLane.push({ id: `z:${zCount++}`, text: '0', tone: 'muted' });
  }
  dLane.push({ id: doneTokId(3), text: tName(3), tone: 'path' });
  dLane.push({ id: doneTokId(4), text: tName(4), tone: 'path' });
  rec.do(
    ...together(
      [
        ...setStat(time, 0),
        ...dLane.ids.map((id): Action => ({ type: 'set', id, patch: { tone: 'path' } })),
      ],
      true,
    ),
    wait(400),
  );

  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: 무게가 넘치면 bridge_length를 더하고 다리가 다 빈다고 착각         */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new StepRecorder(board());
  const wLane = new Lane(rec, WAIT_LANE);
  const dLane = new Lane(rec, DONE_LANE);

  let time = 0;
  let curWeight = 0;
  let steps = 0;

  const meta = () => ({
    work: steps,
    variables: {
      time: `${time}초`,
      cur_weight: curWeight,
      bridge_length: BRIDGE_LENGTH,
    },
  });

  rec.step({
    title: '큐 없이 time과 cur_weight 변수만으로 계산 시작',
    codeHighlights: TRAP_AT.start,
    ...meta(),
  });
  rec.phase('준비', '각 트럭이 언제 내려가는지 큐에 기록하지 않고, 무게 합이 넘치면 무조건 bridge_length(3초)를 더하는 함정 풀이입니다.');
  for (let i = 0; i < N; i++) {
    wLane.push({ id: waitTokId(i), text: tName(i), tone: 'queued' });
  }
  rec.do(wait(500));

  for (let i = 0; i < N; i++) {
    const w = TRUCKS[i];
    const fits = curWeight + w <= WEIGHT;
    const prevWeight = curWeight;
    steps++;
    if (fits) {
      time += 1;
      curWeight += w;
    } else {
      time += BRIDGE_LENGTH;
      curWeight = w;
    }

    rec.step({
      title: fits
        ? `${tName(i)}: ${prevWeight} + ${w} ≤ 10 → time +1 (${time}초)`
        : `${tName(i)}: ${prevWeight} + ${w} > 10 → time +${BRIDGE_LENGTH} (${time}초), 무게 초기화`,
      codeHighlights: fits ? TRAP_AT.fit : TRAP_AT.reset,
      ...meta(),
    });
    rec.phase(
      fits ? '이어서 진입' : '다리 비우기 착각',
      fits
        ? `${prevWeight} + ${w} ≤ ${WEIGHT}이므로 1초 뒤인 ${time}초에 바로 올라탄다고 계산합니다.`
        : i === 3
          ? `9 + 4 > 10이라 ${BRIDGE_LENGTH}초를 통째로 더해 ${time}초로 잡고 다리 무게를 4로 덮어씁니다. 실제로는 7초에 앞의 T2(4)만 먼저 내려가 T3(5)와 T4(4)가 함께 다리에 있을 수 있습니다!`
          : `${prevWeight} + ${w} > ${WEIGHT}이므로 ${BRIDGE_LENGTH}초를 더해 ${time}초로 잡고 다리가 완전히 비었다고 가정합니다.`,
      fits ? TRAP_AT.fit : TRAP_AT.reset,
    );
    wLane.shift('done:bg');
    dLane.push({ id: doneTokId(i), text: tName(i), tone: !fits && i === 3 ? 'bad' : 'visited' });
    rec.do(...setStat(time, curWeight, !fits && i === 3 ? 'bad' : 'queued'), wait(350));
  }

  time += BRIDGE_LENGTH;
  rec.step({
    title: `오답 확인: 이 풀이는 ${time}초, 실제 정답은 11초`,
    codeHighlights: TRAP_AT.done,
    ...meta(),
    answer: time,
    isKeyframe: true,
  });
  rec.phase(
    '오답 확인',
    `마지막 트럭이 건너는 ${BRIDGE_LENGTH}초를 더해 ${time}초를 돌려주지만 오답입니다. 7초에 T2(4)가 먼저 내려가 T4(4)가 1초 일찍 진입하고, T3(5)도 여전히 다리 위에 남아 있기 때문입니다.`,
    TRAP_AT.done,
  );
  rec.do(
    ...together([
      ...setStat(time, curWeight, 'bad'),
      { type: 'add', item: { id: 'wrong', kind: 'token', rect: { x: X0 + 266, y: 4, w: 120, h: 44 }, tone: 'bad', text: `이 풀이: ${time}초` } },
      { type: 'add', item: { id: 'truth', kind: 'token', rect: { x: X0 + 394, y: 4, w: 120, h: 44 }, tone: 'good', text: '정답: 11초' } },
    ]),
    wait(500),
  );

  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'bridge-truck',
  title: '다리를 지나는 트럭',
  level: 2,
  category: 'stack-queue',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42583',
  description: {
    summary:
      '트럭 여러 대가 정해진 순서로 일차선 다리를 건넙니다. 다리에는 최대 bridge_length대까지 올라갈 수 있고, 다리 위 트럭들의 무게 합은 weight 이하여야 합니다. 모든 트럭이 다리를 건너는 데 걸리는 최소 시간을 구합니다.',
    rules: [
      'bridge_length는 1 이상 10,000 이하',
      'weight는 1 이상 10,000 이하',
      'truck_weights의 길이는 1 이상 10,000 이하이고, 각 트럭 무게는 1 이상 weight 이하',
      '다리에 완전히 오르지 않은 트럭의 무게는 포함하지 않음',
    ],
    examples: [
      { input: 'bridge_length = 2, weight = 10, truck_weights = [7, 4, 5, 6]', output: '8' },
      { input: 'bridge_length = 100, weight = 100, truck_weights = [10]', output: '101' },
      { input: 'bridge_length = 100, weight = 100, truck_weights = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]', output: '110' },
    ],
  },
  keyIntuitions: [
    '트럭이 다리에 머무는 시간은 늘 bridge_length초로 일정하므로, 진입 시각이 t이면 정확히 t + bridge_length초에 다리에서 내려갑니다.',
    '다음 트럭이 무게 때문에 못 올라가면 1초씩 흘려보낼 필요 없이 다리 맨 앞 트럭이 내려가는 시각으로 바로 점프하면 됩니다.',
    '앞 트럭 한 대가 내려가면서 생긴 여유 무게로 새 트럭이 올라타면, 아직 다리 위에 남은 다른 트럭과 함께 건너게 됩니다.',
  ],
  demo: {
    input: [BRIDGE_LENGTH, WEIGHT, TRUCKS],
    label: 'bridge_length = 3, weight = 10, truck_weights = [7, 4, 5, 4, 6]',
  },
  workUnit: '시뮬레이션한 시각 단계 수',
  approaches: [
    {
      id: 'bridge-event-queue',
      name: '시간별 큐 (하차 시각 기록 + 점프)',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '다리 큐에 (무게, 나가는 시각)을 넣고 막힐 때는 맨 앞 트럭의 하차 시각으로 바로 점프하는 O(N) 풀이입니다.',
      pros: [
        '다리 길이(최대 10,000)가 아무리 길어도 트럭이 오르내리는 시각으로만 이동하므로 트럭 수 N에 비례하는 시간에 끝납니다.',
        '다리 위에 실제로 올라간 트럭만 큐에 담아 메모리를 아낍니다.',
      ],
      cons: ['점프할 때와 1초 뒤 바로 진입할 때 양쪽에서 하차 처리를 빠뜨리지 않게 주의해야 합니다.'],
      whyThisRank:
        '트럭마다 큐에 한 번 들어가고 한 번 나오므로 다리 길이와 무관하게 O(N)에 풀립니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'bridge-zero-padding',
      name: '0을 채운 다리 큐를 1초씩 밀기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × bridge_length)',
      spaceComplexity: 'O(bridge_length)',
      verdict: '다리를 길이 bridge_length짜리 큐로 만들고 매초 0이나 트럭을 밀어 넣는 직관적인 풀이이지만, 빈 초도 일일이 세어 느립니다.',
      pros: [
        '다리를 벨트 컨베이어처럼 다루어 구현이 단순합니다.',
        '매초 똑같은 규칙으로 돌아가 경계 조건 실수가 적습니다.',
      ],
      cons: [
        '트럭이 못 올라가는 동안에도 1초씩 0을 밀어 넣어야 해서, 다리 길이와 트럭 수가 모두 10,000이면 최대 1억 번 가까이 반복할 수 있습니다.',
        '다리 길이만큼의 배열을 늘 메모리에 들고 있어야 합니다.',
      ],
      whyThisRank:
        '이 문제의 제한에서는 통과하지만, 정석이 한 번의 점프로 넘기는 빈 시간 구간을 1초씩 전부 실행하느라 시간과 메모리를 더 씁니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'bridge-batch-reset',
      name: '무게 초과 시 다리 길이만큼 더하고 초기화',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: '무게가 넘칠 때 무조건 bridge_length초를 더하고 다리가 완전히 빈다고 가정해, 트럭이 한 대씩 교대하는 경우를 놓치는 오답입니다.',
      pros: ['큐 없이 변수 두 개만으로 짜서 문제의 기본 예제 3개를 모두 통과합니다.'],
      cons: [
        '다리 위에 [4, 5]가 있을 때 맨 앞 4만 내려가도 다음 트럭 4가 올라갈 수 있는데, 다리가 통째로 비어야 한다고 계산해 시간이 어긋납니다.',
        '교대로 올라탄 뒤 아직 다리 위에 남아 있는 앞 트럭(5)의 무게도 잃어버립니다.',
      ],
      whyThisRank:
        '예제 3개를 모두 맞혀서 가장 속기 쉬운 함정입니다. 다리 위 트럭들은 각자 다른 시각에 내려가므로 개별 하차 시각을 큐로 관리해야 합니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [2, 10, [7, 4, 5, 6]], expected: 8 },
      { args: [100, 100, [10]], expected: 101 },
      { args: [100, 100, [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]], expected: 110 },
      { args: [3, 10, [4, 5, 6]], expected: 8 },
      { args: [1, 5, [2, 3, 5]], expected: 4 },
      { args: [BRIDGE_LENGTH, WEIGHT, TRUCKS], expected: 11 },
    ],
    random: (rand) => {
      const bridgeLength = 1 + Math.floor(rand() * 5);
      const weight = 5 + Math.floor(rand() * 15);
      const n = 1 + Math.floor(rand() * 6);
      const trucks = Array.from({ length: n }, () => 1 + Math.floor(rand() * weight));
      return [bridgeLength, weight, trucks];
    },
  },
};

export default problem;
