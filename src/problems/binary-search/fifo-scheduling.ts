// 선입 선출 스케줄링: 정석 시간을 이분 탐색, 대안 최소 힙 시뮬레이션, 함정 1초씩 흘려보내며 모든 코어 확인을 같은 장면에서 움직인다.
// 장면은 위에 시간 수직선(탐색 구간, mid·t·answer 표시), 가운데 3개 코어의 작업 줄, 아래에 누적 투입 작업 막대와 목표 작업 수(n)다.
import { axis } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { lines, ro, sum, together } from '../shared.ts';

// 시각화 입력: n = 15, cores = [4, 6, 10] → 24초에 2번 코어가 15번째 작업을 시작한다.
const N = 15;
const CORES = [4, 6, 10];
const M = CORES.length;
const MAX_T = Math.max(...CORES) * Math.ceil(N / M); // 50초: 가장 느린 코어 기준으로도 충분한 상한

const startedPerCore = (T: number): number[] => CORES.map((c) => 1 + Math.floor(T / c));
const totalStarted = (T: number): number => (T < 0 ? 0 : sum(startedPerCore(T)));

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BINARY = {
  python: `import math

def solution(n, cores):
    if n <= len(cores):
        return n

    left = 0
    right = max(cores) * math.ceil(n / len(cores))
    time = right
    while left <= right:
        mid = (left + right) // 2
        # mid초까지 시작된 총 작업 수 (0초에 시작하는 len(cores)개 포함)
        started = len(cores) + sum(mid // c for c in cores)
        if started >= n:
            time = mid
            right = mid - 1
        else:
            left = mid + 1

    # time - 1초까지 시작된 작업 수를 빼고, time초에 비는 코어를 앞에서부터 확인
    done_before = len(cores) + sum((time - 1) // c for c in cores)
    remain = n - done_before
    for i, c in enumerate(cores):
        if time % c == 0:
            remain -= 1
            if remain == 0:
                return i + 1`,
  javascript: `function solution(n, cores) {
  if (n <= cores.length) return n;

  let left = 0;
  let right = Math.max(...cores) * Math.ceil(n / cores.length);
  let time = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // mid초까지 시작된 총 작업 수 (0초에 시작하는 cores.length개 포함)
    let started = cores.length;
    for (const c of cores) started += Math.floor(mid / c);
    if (started >= n) {
      time = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  // time - 1초까지 시작된 작업 수를 빼고, time초에 비는 코어를 앞에서부터 확인
  let doneBefore = cores.length;
  for (const c of cores) doneBefore += Math.floor((time - 1) / c);
  let remain = n - doneBefore;
  for (let i = 0; i < cores.length; i++) {
    if (time % cores[i] === 0) {
      remain--;
      if (remain === 0) return i + 1;
    }
  }
  return -1;
}`,
};
const BINARY_AT = {
  start: lines(BINARY,
    ['left = 0', 'right = max(cores) * math.ceil(n / len(cores))', 'time = right'],
    ['let left = 0', 'let right = Math.max(...cores)', 'let time = right']),
  mid: lines(BINARY,
    ['while left <= right:', 'mid = (left + right) // 2', 'started = len(cores) + sum(mid // c'],
    ['while (left <= right)', 'const mid = Math.floor', 'for (const c of cores) started +=']),
  pass: lines(BINARY,
    ['if started >= n:', 'time = mid', 'right = mid - 1'],
    ['if (started >= n)', 'time = mid', 'right = mid - 1']),
  fail: lines(BINARY,
    ['if started >= n:', 'else:', 'left = mid + 1'],
    ['if (started >= n)', '} else {', 'left = mid + 1']),
  remain: lines(BINARY,
    ['done_before = len(cores) + sum((time - 1) // c', 'remain = n - done_before'],
    ['let doneBefore = cores.length', 'let remain = n - doneBefore']),
  pick: lines(BINARY,
    ['for i, c in enumerate(cores):', 'if time % c == 0:', 'if remain == 0:', 'return i + 1'],
    ['for (let i = 0; i < cores.length; i++)', 'if (time % cores[i] === 0)', 'if (remain === 0) return i + 1']),
};

const HEAP_CODE = {
  python: `import heapq

def solution(n, cores):
    if n <= len(cores):
        return n
    # (다음에 비는 시각, 코어 번호) 최소 힙
    heap = [(0, i + 1) for i in range(len(cores))]
    heapq.heapify(heap)

    last_core = 1
    for _ in range(n):
        avail, idx = heapq.heappop(heap)
        last_core = idx
        heapq.heappush(heap, (avail + cores[idx - 1], idx))
    return last_core`,
  javascript: `function solution(n, cores) {
  if (n <= cores.length) return n;
  // [다음에 비는 시각, 코어 번호] 최소 힙
  const heap = cores.map((_, i) => [0, i + 1]);
  const less = (a, b) => (a[0] !== b[0] ? a[0] < b[0] : a[1] < b[1]);
  const siftDown = (i) => {
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      let best = i;
      if (l < heap.length && less(heap[l], heap[best])) best = l;
      if (r < heap.length && less(heap[r], heap[best])) best = r;
      if (best === i) return;
      [heap[i], heap[best]] = [heap[best], heap[i]];
      i = best;
    }
  };

  let lastCore = 1;
  for (let k = 0; k < n; k++) {
    const [avail, idx] = heap[0];
    lastCore = idx;
    heap[0] = [avail + cores[idx - 1], idx];
    siftDown(0);
  }
  return lastCore;
}`,
};
const HEAP_AT = {
  start: lines(HEAP_CODE,
    ['heap = [(0, i + 1) for i in range(len(cores))]', 'heapq.heapify(heap)'],
    ['const heap = cores.map((_, i) => [0, i + 1])']),
  step: lines(HEAP_CODE,
    ['for _ in range(n):', 'avail, idx = heapq.heappop(heap)', 'heapq.heappush(heap'],
    ['for (let k = 0; k < n; k++)', 'const [avail, idx] = heap[0]', 'siftDown(0)']),
  done: lines(HEAP_CODE, ['return last_core'], ['return lastCore']),
};

const TICK_CODE = {
  python: `def solution(n, cores):
    t = 0
    remain = n
    while True:
        # 매초 모든 코어를 돌며 t초에 비는 코어에 작업을 배정
        for i, c in enumerate(cores):
            if t % c == 0:
                remain -= 1
                if remain == 0:
                    return i + 1
        t += 1`,
  javascript: `function solution(n, cores) {
  let t = 0;
  let remain = n;
  while (true) {
    // 매초 모든 코어를 돌며 t초에 비는 코어에 작업을 배정
    for (let i = 0; i < cores.length; i++) {
      if (t % cores[i] === 0) {
        remain--;
        if (remain === 0) return i + 1;
      }
    }
    t++;
  }
}`,
};
const TICK_AT = {
  start: lines(TICK_CODE, ['t = 0', 'remain = n'], ['let t = 0', 'let remain = n']),
  loop: lines(TICK_CODE,
    ['while True:', 'for i, c in enumerate(cores):', 'if t % c == 0:', 't += 1'],
    ['while (true)', 'for (let i = 0; i < cores.length; i++)', 'if (t % cores[i] === 0)', 't++']),
  done: lines(TICK_CODE, ['if remain == 0:', 'return i + 1'], ['if (remain === 0) return i + 1']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 620;
const H = 338;
const FULL: Rect = { x: 0, y: 0, w: W, h: H };
const tx = axis({ x: 96, w: 380, min: 0, max: MAX_T });
const rowRect = (i: number): Rect => ({ x: 96, y: 126 + i * 50, w: 380, h: 40 });
const TALLY_Y = 286;

const coreBoxId = (i: number) => `core:${i}`;
const calcId = (i: number) => `calc:${i}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'track', kind: 'line', rect: FULL, tone: 'trail', points: [[tx(0), 100], [tx(MAX_T), 100]] },
  ];
  CORES.forEach((c, i) => {
    const r = rowRect(i);
    items.push(
      { id: coreBoxId(i), kind: 'token', rect: { x: 12, y: r.y + 4, w: 78, h: 32 }, tone: 'plain', text: `${i + 1}번 (${c}초)` },
      { id: `row:${i}`, kind: 'zone', rect: r },
      { id: calcId(i), kind: 'text', rect: { x: 484, y: r.y + 6, w: 124, h: 28 }, text: '-' },
    );
  });
  items.push(
    { id: 'sum:label', kind: 'text', rect: { x: 12, y: TALLY_Y, w: 78, h: 34 }, text: '투입 작업' },
    { id: 'tally', kind: 'bar', rect: { x: 96, y: TALLY_Y, w: 310, h: 34 }, fill: 0, text: '0개' },
    { id: 'goal', kind: 'token', rect: { x: 416, y: TALLY_Y, w: 96, h: 34 }, tone: 'plain', text: `n = ${N}개`, tag: '목표' },
  );
  return { width: W, height: H, items };
}

const put = (rec: StepRecorder, { id, kind, ...patch }: Item): Action =>
  rec.has(id) ? { type: 'set', id, patch } : { type: 'add', item: { id, kind, ...patch } };

const range = (l: number, r: number): Item[] => [
  { id: 'range', kind: 'zone', rect: { x: tx(l - 0.5), y: 88, w: tx(r + 0.5) - tx(l - 0.5), h: 24 } },
  { id: 'left', kind: 'token', rect: { x: tx(l - 0.5) - 74, y: 28, w: 74, h: 24 }, tone: 'plain', text: `left ${l}` },
  { id: 'right', kind: 'token', rect: { x: tx(r + 0.5), y: 28, w: 78, h: 24 }, tone: 'plain', text: `right ${r}` },
];

const timeLabel = (v: number): Item =>
  ({ id: 'time:ans', kind: 'token', rect: { x: tx(v) - 44, y: 0, w: 88, h: 24 }, tone: 'path', text: `time ${v}초` });

const probeTo = (rec: StepRecorder, v: number, text: string, tone: Tone): Action[] => [
  put(rec, { id: 'probe', kind: 'token', rect: { x: tx(v) - 2, y: 84, w: 4, h: 186 }, tone }),
  put(rec, { id: 'probe:label', kind: 'token', rect: { x: tx(v) - 44, y: 56, w: 88, h: 26 }, tone, text }),
];

function updateRowsAt(T: number): Action[] {
  const counts = startedPerCore(T);
  const total = sum(counts);
  return [
    ...counts.map((cnt, i): Action => ({
      type: 'set',
      id: calcId(i),
      patch: { text: `1+⌊${T}/${CORES[i]}⌋ = ${cnt}개`, tone: 'visited' },
    })),
    {
      type: 'set',
      id: 'tally',
      patch: { fill: Math.min(1, total / N), text: `${total}개`, tone: total >= N ? 'good' : 'bad' },
    },
  ];
}

/* ------------------------------------------------------------------ */
/* 정석: 시간을 이분 탐색 + 마지막 시각 T에서 코어 찾기                  */
/* ------------------------------------------------------------------ */

function binarySearch(): Visualization {
  const rec = new StepRecorder(board());
  let [left, right] = [0, MAX_T];
  let time = right;
  let work = 0;

  rec.step({
    title: `탐색 구간 0 ~ ${MAX_T}초 정하기`,
    codeHighlights: BINARY_AT.start,
    work,
    variables: { left, right, time, n: N },
  });
  rec.phase('시작', `0초에는 코어 ${M}개가 동시에 작업을 시작하고, T초까지 시작된 총 작업 수는 M + Σ⌊T ÷ c⌋개입니다.`, BINARY_AT.start);
  rec.do(...together([...range(left, right).map((it) => put(rec, it)), put(rec, timeLabel(time))]));

  while (left <= right) {
    const [l, r] = [left, right];
    const mid = Math.floor((left + right) / 2);
    const counts = startedPerCore(mid);
    const started = sum(counts);
    work += M;
    const enough = started >= N;
    if (enough) [time, right] = [mid, mid - 1];
    else left = mid + 1;
    const decide = enough ? BINARY_AT.pass : BINARY_AT.fail;

    rec.step({
      title: `mid = ${mid}초 → 투입 ${started}개 (${enough ? '충분, 더 이르게' : '부족, 더 늦게'})`,
      codeHighlights: decide,
      work,
      variables: { left, right, mid, started, time },
    });
    rec.phase('가운데 고르기', `mid = ⌊(${l} + ${r}) ÷ 2⌋ = ${mid}초까지 투입된 작업 수를 셉니다.`, BINARY_AT.mid);
    rec.do(...together([...probeTo(rec, mid, `mid ${mid}초`, 'current'), ...updateRowsAt(mid)]));

    rec.phase('범위 줄이기', enough
      ? `${started}개 ≥ ${N}개이므로 time = ${ro(mid)} 저장하고 right = ${ro(right)} 줄입니다.`
      : `${started}개 < ${N}개이므로 시간을 늘려 left = ${ro(left)} 올립니다.`,
    decide);
    const [zone, leftMark, rightMark] = range(left, right);
    rec.do(...together([put(rec, zone), put(rec, enough ? rightMark : leftMark), ...(enough ? [put(rec, timeLabel(time))] : [])]));
  }

  // time - 1초까지 시작된 작업 수 확인
  const doneBefore = totalStarted(time - 1);
  let remain = N - doneBefore;
  work += M;
  rec.step({
    title: `${time - 1}초까지 ${doneBefore}개 투입 → ${time}초에 남은 ${remain}개 배정`,
    codeHighlights: BINARY_AT.remain,
    work,
    variables: { time, doneBefore, remain },
  });
  rec.phase('직전 시각 확인', `마지막 작업이 시작되는 시각은 ${time}초입니다. 바로 직전인 ${time - 1}초까지 이미 ${doneBefore}개가 투입되었으므로 ${time}초에 ${remain}번째로 비는 코어를 찾으면 됩니다.`, BINARY_AT.remain);
  rec.do(...together([
    { type: 'remove', id: 'range' },
    ...probeTo(rec, time - 1, `${time - 1}초 (${doneBefore}개)`, 'visited'),
    ...updateRowsAt(time - 1),
  ]));

  // time초에 비는 코어를 앞에서부터 확인
  let answer = 1;
  for (let i = 0; i < M; i++) {
    work++;
    if (time % CORES[i] === 0) {
      remain--;
      if (remain === 0) {
        answer = i + 1;
        break;
      }
    }
  }

  rec.step({
    title: `${time}초에 비는 코어 확인 → ${answer}번 코어 정답`,
    codeHighlights: BINARY_AT.pick,
    work,
    variables: { time, '14번째 작업': '1번 코어', '15번째 작업': `${answer}번 코어`, answer },
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `${time}초에 1번 코어(24 % 4 == 0)가 14번째 작업을 맡고, 이어서 2번 코어(24 % 6 == 0)가 15번째 작업을 맡으므로 정답은 ${answer}번 코어입니다.`, BINARY_AT.pick);
  rec.do(...together([
    ...probeTo(rec, time, `${time}초`, 'path'),
    ...updateRowsAt(time),
    { type: 'set', id: coreBoxId(0), patch: { tone: 'visited' } },
    { type: 'set', id: coreBoxId(answer - 1), patch: { tone: 'path' } },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 최소 힙으로 작업을 하나씩 코어에 배정                           */
/* ------------------------------------------------------------------ */

function heapViz(): Visualization {
  const rec = new StepRecorder(board());
  let work = 0;

  rec.step({
    title: '0초에 비어 있는 코어 3개를 최소 힙에 넣기',
    codeHighlights: HEAP_AT.start,
    work,
    variables: { '남은 작업': N, heap: '[(0,1), (0,2), (0,3)]' },
  });
  rec.phase('시작', '(다음에 비는 시각, 코어 번호)를 최소 힙에 넣고, 작업 15개를 순서대로 하나씩 꺼내 배정합니다.', HEAP_AT.start);
  rec.do(...together(probeTo(rec, 0, '0초', 'current')));

  const heap: [number, number][] = CORES.map((_, i) => [0, i + 1]);
  const counts = [0, 0, 0];
  let lastCore = 1;
  let lastTime = 0;

  // 앞의 4개 작업은 한 단계로 묶고, 중간을 빨리 감기한 뒤 마지막 14·15번째 작업을 보여 준다
  for (let k = 1; k <= 3; k++) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const [avail, idx] = heap.shift()!;
    counts[idx - 1]++;
    lastCore = idx;
    lastTime = avail;
    heap.push([avail + CORES[idx - 1], idx]);
    work += M;
  }

  rec.step({
    title: '1~3번째 작업 → 0초에 1, 2, 3번 코어 배정',
    codeHighlights: HEAP_AT.step,
    work,
    variables: { '투입 작업': 3, lastCore, heap: JSON.stringify(heap) },
  });
  rec.phase('초기 배정', '0초에 비어 있는 1, 2, 3번 코어가 작업 1, 2, 3을 맡고 다음 완료 시각 (4,1), (6,2), (10,3)으로 힙에 들어갑니다.', HEAP_AT.step);
  rec.do(...together([
    ...counts.map((cnt, i): Action => ({ type: 'set', id: calcId(i), patch: { text: `${cnt}개 맡음` } })),
    { type: 'set', id: 'tally', patch: { fill: 3 / N, text: '3개', tone: 'chosen' } },
  ]));

  for (let k = 4; k <= N - 2; k++) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const [avail, idx] = heap.shift()!;
    counts[idx - 1]++;
    lastCore = idx;
    lastTime = avail;
    heap.push([avail + CORES[idx - 1], idx]);
    work += M;
  }

  rec.step({
    title: `4~${N - 2}번째 작업 빨리 감기 (힙에서 하나씩 꺼내 배정)`,
    codeHighlights: HEAP_AT.step,
    work,
    variables: { '투입 작업': N - 2, 시각: `${lastTime}초`, lastCore },
  });
  rec.phase('빨리 감기', `작업마다 힙에서 가장 먼저 비는 코어를 꺼내고 다시 넣기를 반복해 ${lastTime}초까지 ${N - 2}개를 배정했습니다.`, HEAP_AT.step);
  rec.do(...together([
    ...probeTo(rec, lastTime, `${lastTime}초`, 'current'),
    ...counts.map((cnt, i): Action => ({ type: 'set', id: calcId(i), patch: { text: `${cnt}개 맡음` } })),
    { type: 'set', id: 'tally', patch: { fill: (N - 2) / N, text: `${N - 2}개`, tone: 'chosen' } },
  ]));

  for (let k = N - 1; k <= N; k++) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const [avail, idx] = heap.shift()!;
    counts[idx - 1]++;
    lastCore = idx;
    lastTime = avail;
    heap.push([avail + CORES[idx - 1], idx]);
    work += M;
  }

  rec.step({
    title: `${N}번째 작업 → ${lastTime}초에 ${lastCore}번 코어 배정, 정답`,
    codeHighlights: HEAP_AT.done,
    work,
    variables: { '투입 작업': N, 시각: `${lastTime}초`, answer: lastCore, '비교 횟수': work },
    answer: lastCore,
    isKeyframe: true,
  });
  rec.phase('정답', `${lastTime}초에 1번 코어가 14번째, ${lastCore}번 코어가 15번째 작업을 맡아 정답은 ${lastCore}번입니다. 작업마다 힙 연산을 하므로 이분 탐색보다 연산이 더 듭니다.`, HEAP_AT.done);
  rec.do(...together([
    ...probeTo(rec, lastTime, `${lastTime}초`, 'path'),
    ...counts.map((cnt, i): Action => ({ type: 'set', id: calcId(i), patch: { text: `${cnt}개 맡음`, tone: 'good' } })),
    { type: 'set', id: 'tally', patch: { fill: 1, text: `${N}개`, tone: 'good' } },
    { type: 'set', id: coreBoxId(lastCore - 1), patch: { tone: 'path' } },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: 0초부터 1초씩 늘려 가며 매초 모든 코어 확인                     */
/* ------------------------------------------------------------------ */

function tickLinearViz(): Visualization {
  const rec = new StepRecorder(board());
  let work = 0;

  rec.step({
    title: '0초부터 1초씩 늘려 가며 매초 모든 코어 확인',
    codeHighlights: TICK_AT.start,
    work,
    variables: { t: 0, remain: N },
  });
  rec.phase('시작', '시간 t를 0초부터 1초씩 흘려보내며, 매초마다 모든 코어를 돌아 t % c == 0인지 확인합니다.', TICK_AT.start);
  rec.do(...together(probeTo(rec, 0, 't 0초', 'current')));

  let remain = N;
  const counts = [0, 0, 0];
  for (let t = 0; t <= 2; t++) {
    for (let i = 0; i < M; i++) {
      work++;
      if (t % CORES[i] === 0) {
        counts[i]++;
        remain--;
      }
    }
    rec.step({
      title: `t = ${t}초 → 남은 작업 ${remain}개`,
      codeHighlights: TICK_AT.loop,
      work,
      variables: { t, remain, '코어 확인': work },
    });
    rec.phase('1초 진행', t === 0
      ? '0초에는 3개 코어가 모두 비어 있어 작업을 하나씩 시작합니다.'
      : `t = ${t}초에는 새로 끝나는 코어가 없는데도 코어 3개를 모두 확인하고 넘어갑니다.`,
    TICK_AT.loop);
    rec.do(...together([
      ...probeTo(rec, t, `t ${t}초`, 'current'),
      ...counts.map((cnt, i): Action => ({ type: 'set', id: calcId(i), patch: { text: `${cnt}개 맡음` } })),
      { type: 'set', id: 'tally', patch: { fill: (N - remain) / N, text: `${N - remain}개`, tone: 'bad' } },
    ]));
  }

  for (let t = 3; t <= 23; t++) {
    for (let i = 0; i < M; i++) {
      work++;
      if (t % CORES[i] === 0) {
        counts[i]++;
        remain--;
      }
    }
  }

  rec.step({
    title: 't = 3 ~ 23초 빨리 감기 (매초 코어 3개 전부 확인)',
    codeHighlights: TICK_AT.loop,
    work,
    variables: { t: 23, remain, '코어 확인': work },
  });
  rec.phase('빨리 감기', `3초부터 23초까지 아무 일도 일어나지 않는 초에도 매번 코어 전체를 확인하며 ${work}번이나 돌았습니다.`, TICK_AT.loop);
  rec.do(...together([
    ...probeTo(rec, 23, 't 23초', 'current'),
    ...counts.map((cnt, i): Action => ({ type: 'set', id: calcId(i), patch: { text: `${cnt}개 맡음` } })),
    { type: 'set', id: 'tally', patch: { fill: (N - remain) / N, text: `${N - remain}개`, tone: 'bad' } },
  ]));

  let answer = 1;
  for (let i = 0; i < M; i++) {
    work++;
    if (24 % CORES[i] === 0) {
      counts[i]++;
      remain--;
      if (remain === 0) {
        answer = i + 1;
        break;
      }
    }
  }

  rec.step({
    title: `t = 24초 → ${answer}번 코어에서 마지막 작업 시작`,
    codeHighlights: TICK_AT.done,
    work,
    variables: { t: 24, remain: 0, answer, '총 코어 확인': work },
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `24초에 ${answer}번 코어를 찾았지만 코어를 총 ${work}번 확인했습니다. 코어 1만 개, 작업 시간 1만 초, 작업 5만 개이면 수억 번 이상 반복해 시간 초과입니다.`, TICK_AT.done);
  rec.do(...together([
    ...probeTo(rec, 24, 't 24초', 'path'),
    { type: 'set', id: 'tally', patch: { fill: 1, text: `${N}개`, tone: 'good' } },
    { type: 'set', id: coreBoxId(answer - 1), patch: { tone: 'path' } },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'fifo-scheduling',
  title: '선입 선출 스케줄링',
  level: 3,
  category: 'binary-search',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12920',
  description: {
    summary:
      '동일한 작업 n개를 여러 CPU 코어가 선입선출로 처리합니다. 코어마다 작업 1개를 처리하는 시간이 다르고, 동시에 여러 코어가 비면 앞 번호 코어부터 작업을 맡을 때, 마지막(n번째) 작업을 처리하는 코어의 번호를 구합니다.',
    rules: [
      '코어의 수(cores의 길이)는 2 이상 10,000 이하입니다.',
      '코어별 처리 시간 cores[i]는 10,000 이하의 자연수입니다.',
      '처리해야 할 작업 수 n은 50,000 이하의 자연수입니다.',
      '코어 번호는 1번부터 시작합니다.',
    ],
    examples: [{ input: 'n = 6, cores = [1, 2, 3]', output: '2' }],
  },
  keyIntuitions: [
    '0초에 모든 코어가 작업 1개씩을 바로 시작하므로, 시각 T초까지 투입된 총 작업 수는 len(cores) + Σ⌊T ÷ cores[i]⌋개입니다.',
    '투입된 작업 수가 n개 이상이 되는 가장 이른 시각 T를 이분 탐색으로 찾으면, 그 T초가 바로 마지막 작업이 시작되는 시각입니다.',
    'T - 1초까지 이미 투입된 작업 수를 뺀 뒤, T초에 딱 나누어떨어지는(T % cores[i] == 0) 코어를 앞 번호부터 세면 마지막 코어를 정확히 찾습니다.',
  ],
  demo: {
    input: [N, CORES],
    label: 'n = 15, cores = [4, 6, 10]',
  },
  workUnit: '코어 확인·비교 횟수',
  approaches: [
    {
      id: 'fifo-binary',
      name: '시간을 이분 탐색',
      rank: 'BEST',
      timeComplexity: 'O(M log(n × maxC))',
      spaceComplexity: 'O(1)',
      verdict: 'n번째 작업이 투입되는 시각 T를 이분 탐색으로 찾고, T - 1초까지의 작업 수를 빼 마지막 코어를 바로 구합니다.',
      pros: [
        '시각 T가 정해지면 나눗셈 합산 한 번 O(M)으로 그때까지 투입된 총 작업 수를 구합니다.',
        '이분 탐색 횟수가 20번 안팎이라 코어 1만 개, 작업 5만 개도 순식간에 끝납니다.',
      ],
      cons: [
        'T초에 여러 코어가 동시에 비므로, 반드시 T - 1초까지의 작업 수를 먼저 뺀 뒤 앞에서부터 남은 개수를 세어야 합니다.',
        'n이 코어 수 이하일 때(0초에 바로 끝날 때) 예외 처리를 챙겨야 합니다.',
      ],
      whyThisRank:
        '작업 하나씩 시뮬레이션하지 않고도 "T초까지 시작된 작업 수" 공식으로 시간을 건너뛸 수 있어 가장 빠르고 메모리를 쓰지 않습니다.',
      code: BINARY,
      visualize: binarySearch,
    },
    {
      id: 'fifo-heap',
      name: '최소 힙으로 작업을 하나씩 배정',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(n log M)',
      spaceComplexity: 'O(M)',
      verdict: '(다음에 비는 시각, 코어 번호) 최소 힙에서 작업을 하나씩 배정하는 풀이로, 이분 탐색보다 연산과 메모리가 더 듭니다.',
      pros: [
        '문제의 스케줄링 규칙(가장 먼저 비는 코어, 동률이면 앞 번호 코어)을 그대로 옮겨 직관적입니다.',
      ],
      cons: [
        '작업 n개마다 힙 연산을 반복하고 크기 M짜리 힙을 유지해야 해서 정석보다 느리고, n이 더 커지면 시간 초과가 납니다.',
      ],
      whyThisRank:
        '작은 입력이나 n = 50,000 수준에서는 동작하지만, 같은 코어들의 주기적인 반복을 한 번의 나눗셈으로 줄이지 못해 정석보다 손해를 봅니다.',
      code: HEAP_CODE,
      visualize: heapViz,
    },
    {
      id: 'fifo-tick-linear',
      name: '0초부터 1초씩 늘려 가며 매초 모든 코어 확인',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(T × M)',
      spaceComplexity: 'O(1)',
      verdict: '시간을 1초씩 흘려보내며 매초 모든 코어가 비었는지 확인하는 풀이로, 효율성 테스트에서 시간 초과가 납니다.',
      pros: ['코드가 매우 짧고 단순합니다.'],
      cons: [
        '아무 코어도 끝나지 않는 초에도 코어 1만 개를 매번 확인해 최악에는 수억 번 이상 반복합니다.',
      ],
      whyThisRank:
        '시간을 1초씩 전진시키는 전형적인 시간 초과 함정입니다. 시간에 따라 투입 작업 수가 단조 증가하므로 이분 탐색으로 바로 점프해야 합니다.',
      code: TICK_CODE,
      visualize: tickLinearViz,
    },
  ],
  checks: {
    cases: [
      { args: [6, [1, 2, 3]], expected: 2 },
      { args: [N, CORES], expected: 2 },
      { args: [2, [5, 10, 15]], expected: 2 },
      { args: [5, [2, 2]], expected: 1 },
    ],
    random: (rand) => {
      const m = 2 + Math.floor(rand() * 4);
      const cores = Array.from({ length: m }, () => 1 + Math.floor(rand() * 8));
      const n = 1 + Math.floor(rand() * 25);
      return [n, cores];
    },
  },
};

export default problem;
