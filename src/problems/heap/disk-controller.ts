// 디스크 컨트롤러: 정석 작업 시간 최소 힙, 대안 매번 모든 작업을 훑어 짧은 작업 찾기, 함정 요청 순서대로 바로 처리하기(오답)를 같은 장면에서 움직인다.
// 장면은 위에 도착 대기 중인 작업 줄과 최소 힙(대기 큐), 가운데에 각 작업의 요청 시각부터 종료 시각까지를 그리는 시간축 줄, 아래에 반환 시간 합계와 평균 표시다.
import { axis, slots } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';

// 시각화 입력: 4개 작업 [요청 시각, 소요 시간].
// 정석과 대안은 0→[0,3](3ms), 3→[2,6](7ms), 9→[4,2](7ms), 11→[1,9](19ms)로 합계 36, 평균 9ms.
// 함정(선입선출)은 [1,9]를 먼저 실행해 뒤 작업들이 오래 기다려 합계 46, 평균 11ms가 나온다.
const JOBS: [number, number][] = [
  [0, 3],
  [1, 9],
  [2, 6],
  [4, 2],
];
const N = JOBS.length;
const MAX_T = 20;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const HEAP = {
  python: `import heapq

def solution(jobs):
    # (요청 시각, 소요 시간, 원래 번호) 순으로 정렬
    tasks = sorted((req, dur, i) for i, (req, dur) in enumerate(jobs))
    heap = []
    now, idx, total, done = 0, 0, 0, 0
    n = len(tasks)

    while done < n:
        while idx < n and tasks[idx][0] <= now:
            req, dur, i = tasks[idx]
            heapq.heappush(heap, (dur, req, i))  # 소요 시간 최소 힙
            idx += 1

        if not heap:
            now = tasks[idx][0]  # 대기 작업이 없으면 다음 요청 시각으로 이동
            continue

        dur, req, i = heapq.heappop(heap)
        now += dur
        total += now - req
        done += 1

    return total // n`,
  javascript: `function solution(jobs) {
  const tasks = jobs.map(([req, dur], i) => [req, dur, i])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  const heap = [];
  const less = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
  const push = (v) => {
    heap.push(v);
    for (let i = heap.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (less(heap[p], heap[i]) <= 0) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (let i = 0;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && less(heap[l], heap[m]) < 0) m = l;
        if (r < heap.length && less(heap[r], heap[m]) < 0) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  };

  let now = 0, idx = 0, total = 0, done = 0;
  while (done < tasks.length) {
    while (idx < tasks.length && tasks[idx][0] <= now) {
      const [req, dur, i] = tasks[idx++];
      push([dur, req, i]); // 소요 시간 최소 힙
    }
    if (!heap.length) {
      now = tasks[idx][0]; // 대기 작업이 없으면 다음 요청 시각으로 이동
      continue;
    }
    const [dur, req] = pop();
    now += dur;
    total += now - req;
    done++;
  }
  return Math.floor(total / tasks.length);
}`,
};
const HEAP_AT = {
  init: lines(HEAP, ['tasks = sorted', 'now, idx, total, done = 0'], ['const tasks = jobs.map', 'let now = 0, idx = 0']),
  arrive: lines(HEAP, ['while idx < n and tasks[idx][0] <= now', 'heapq.heappush(heap, (dur, req, i))'], ['while (idx < tasks.length && tasks[idx][0] <= now)', 'push([dur, req, i])']),
  pop: lines(HEAP, ['dur, req, i = heapq.heappop(heap)'], ['const [dur, req] = pop()']),
  run: lines(HEAP, ['now += dur', 'total += now - req', 'done += 1'], ['now += dur', 'total += now - req', 'done++']),
  done: lines(HEAP, ['return total // n'], ['return Math.floor(total / tasks.length)']),
};

const SCAN = {
  python: `def solution(jobs):
    n = len(jobs)
    used = [False] * n
    now, total, done = 0, 0, 0

    while done < n:
        best = -1
        for i, (req, dur) in enumerate(jobs):  # 매번 전체 작업을 다 훑는다
            if used[i] or req > now:
                continue
            if best < 0 or (dur, req, i) < (jobs[best][1], jobs[best][0], best):
                best = i

        if best < 0:
            now = min(jobs[i][0] for i in range(n) if not used[i])
            continue

        used[best] = True
        now += jobs[best][1]
        total += now - jobs[best][0]
        done += 1

    return total // n`,
  javascript: `function solution(jobs) {
  const n = jobs.length;
  const used = Array(n).fill(false);
  let now = 0, total = 0, done = 0;

  while (done < n) {
    let best = -1;
    for (let i = 0; i < n; i++) { // 매번 전체 작업을 다 훑는다
      if (used[i] || jobs[i][0] > now) continue;
      if (
        best < 0 ||
        jobs[i][1] - jobs[best][1] ||
        jobs[i][0] - jobs[best][0] ||
        i - best < 0
      ) {
        if (
          best < 0 ||
          jobs[i][1] < jobs[best][1] ||
          (jobs[i][1] === jobs[best][1] && (jobs[i][0] < jobs[best][0] || (jobs[i][0] === jobs[best][0] && i < best)))
        ) best = i;
      }
    }
    if (best < 0) {
      let nextReq = Infinity;
      for (let i = 0; i < n; i++) if (!used[i] && jobs[i][0] < nextReq) nextReq = jobs[i][0];
      now = nextReq;
      continue;
    }
    used[best] = true;
    now += jobs[best][1];
    total += now - jobs[best][0];
    done++;
  }
  return Math.floor(total / n);
}`,
};
const SCAN_AT = {
  init: lines(SCAN, ['used = [False] * n', 'now, total, done = 0, 0, 0'], ['const used = Array(n).fill(false)', 'let now = 0, total = 0, done = 0']),
  scan: lines(SCAN, ['for i, (req, dur) in enumerate(jobs)', 'if best < 0 or (dur, req, i)'], ['for (let i = 0; i < n; i++)', 'if (used[i] || jobs[i][0] > now)']),
  run: lines(SCAN, ['used[best] = True', 'now += jobs[best][1]', 'total += now - jobs[best][0]'], ['used[best] = true', 'now += jobs[best][1]', 'total += now - jobs[best][0]']),
  done: lines(SCAN, ['return total // n'], ['return Math.floor(total / n)']),
};

const FIFO = {
  python: `def solution(jobs):
    # 요청 시각 순으로만 정렬해 차례대로 실행 (대기 중 짧은 작업 우선 규칙 무시)
    tasks = sorted(jobs, key=lambda x: (x[0], x[1]))
    now, total = 0, 0

    for req, dur in tasks:
        if now < req:
            now = req
        now += dur
        total += now - req

    return total // len(tasks)`,
  javascript: `function solution(jobs) {
  // 요청 시각 순으로만 정렬해 차례대로 실행 (대기 중 짧은 작업 우선 규칙 무시)
  const tasks = [...jobs].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let now = 0, total = 0;

  for (const [req, dur] of tasks) {
    if (now < req) now = req;
    now += dur;
    total += now - req;
  }
  return Math.floor(total / tasks.length);
}`,
};
const FIFO_AT = {
  init: lines(FIFO, ['tasks = sorted(jobs', 'now, total = 0, 0'], ['const tasks = [...jobs].sort', 'let now = 0, total = 0']),
  pick: lines(FIFO, ['for req, dur in tasks', 'if now < req'], ['for (const [req, dur] of tasks)', 'if (now < req)']),
  run: lines(FIFO, ['now += dur', 'total += now - req'], ['now += dur', 'total += now - req']),
  done: lines(FIFO, ['return total // len(tasks)'], ['return Math.floor(total / tasks.length)']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 560;
const H = 320;
const FULL: Rect = { x: 0, y: 0, w: W, h: H };
const tx = axis({ x: 96, w: 340, min: 0, max: MAX_T }); // 1ms = 17px
const heapSlot = slots({ x: 96, y: 14, w: 98, h: 32, gap: 8 });
const rowY = (i: number) => 78 + i * 42;
const rowRect = (i: number): Rect => ({ x: 94, y: rowY(i), w: 344, h: 34 });
const TALLY_Y = 264;

function board(queueLabel: string): Scene {
  const items: Item[] = [
    { id: 'q:label', kind: 'text', rect: { x: 0, y: 14, w: 90, h: 32 }, text: queueLabel },
    { id: 'q:zone', kind: 'zone', rect: { x: 92, y: 10, w: 452, h: 40 } },
    { id: 'axis:line', kind: 'line', rect: FULL, tone: 'trail', points: [[tx(0), 64], [tx(MAX_T), 64]] },
  ];
  JOBS.forEach(([req, dur], i) => {
    const y = rowY(i);
    items.push(
      { id: `jname:${i}`, kind: 'text', rect: { x: 0, y, w: 90, h: 18 }, text: `작업 ${i + 1}` },
      { id: `jspec:${i}`, kind: 'text', rect: { x: 0, y: y + 16, w: 90, h: 18 }, tone: 'muted', text: `${req}ms·${dur}ms` },
      { id: `jrow:${i}`, kind: 'zone', rect: rowRect(i) },
      { id: `jreq:${i}`, kind: 'token', rect: { x: tx(req) - 3, y: y + 2, w: 6, h: 30 }, tone: 'queued' },
      { id: `jcalc:${i}`, kind: 'text', rect: { x: 444, y, w: 112, h: 34 }, text: `${req}ms 요청` },
    );
  });
  items.push(
    { id: 'now:tok', kind: 'token', rect: { x: 96, y: TALLY_Y, w: 116, h: 38 }, tone: 'current', text: 'now = 0ms', tag: '현재 시각' },
    { id: 'sum:tok', kind: 'token', rect: { x: 224, y: TALLY_Y, w: 152, h: 38 }, tone: 'plain', text: '총 0ms', tag: '반환 시간 합' },
    { id: 'avg:tok', kind: 'token', rect: { x: 388, y: TALLY_Y, w: 156, h: 38 }, tone: 'plain', text: '평균 -', tag: 'answer' },
  );
  return { width: W, height: H, items };
}

interface JobEntry { i: number; req: number; dur: number }
const byDur = (a: JobEntry, b: JobEntry) => a.dur - b.dur || a.req - b.req || a.i - b.i;
const qId = (i: number) => `q:${i}`;
const barId = (i: number) => `bar:${i}`;

const runBar = (i: number, start: number, end: number, tone: Tone): Item => ({
  id: barId(i),
  kind: 'cell',
  rect: { x: tx(start) + 1, y: rowY(i) + 3, w: tx(end) - tx(start) - 2, h: 28 },
  tone,
  text: `${end - start}ms`,
});

/* ------------------------------------------------------------------ */
/* 정석 작업 시간 최소 힙: 도착 작업 넣기 → 가장 짧은 작업 실행하기        */
/* ------------------------------------------------------------------ */

function minHeapDiskViz(): Visualization {
  const rec = new StepRecorder(board('최소 힙'));
  const tasks: JobEntry[] = JOBS.map(([req, dur], i) => ({ i, req, dur }));
  const heap: JobEntry[] = [];
  let now = 0;
  let idx = 0;
  let total = 0;
  let done = 0;
  let work = 0;
  const meta = (extra: Record<string, string | number> = {}) => ({
    work,
    variables: {
      now: `${now}ms`,
      heap: `[${heap.map((e) => `(${e.dur}ms,작업${e.i + 1})`).join(', ')}]`,
      total: `${total}ms`,
      done: `${done}/${N}`,
      ...extra,
    },
  });

  work = N;
  rec.step({ title: '요청 시각 순으로 작업 정렬하기', codeHighlights: HEAP_AT.init, ...meta() });
  rec.phase('정렬하기', `작업 ${N}개를 요청 시각 순으로 정렬해 두고 now = 0ms에서 시작합니다.`, HEAP_AT.init);
  rec.do({ type: 'focus', ids: tasks.map((t) => `jreq:${t.i}`) });
  rec.do({ type: 'unfocus' });

  while (done < N) {
    const arrived: JobEntry[] = [];
    while (idx < N && tasks[idx].req <= now) {
      arrived.push(tasks[idx]);
      heap.push(tasks[idx]);
      idx++;
      work++;
    }
    heap.sort(byDur);

    rec.step({
      title: `now = ${now}ms: 도착한 작업 ${arrived.length ? arrived.map((a) => `작업 ${a.i + 1}(${a.dur}ms)`).join(', ') : '없음'} → 힙 정렬`,
      codeHighlights: HEAP_AT.arrive,
      ...meta(),
    });
    rec.phase('힙에 넣기', arrived.length
      ? `now = ${now}ms까지 도착한 ${arrived.map((a) => `작업 ${a.i + 1}(소요 ${a.dur}ms)`).join(', ')}을 최소 힙에 넣습니다. 맨 앞은 가장 짧은 작업 ${heap[0].i + 1}(${heap[0].dur}ms)입니다.`
      : `새로 도착한 작업이 없어 기존 힙에서 가장 짧은 작업 ${heap[0].i + 1}(${heap[0].dur}ms)이 맨 앞에 있습니다.`, HEAP_AT.arrive);
    rec.do(...together([
      ...arrived.map((a): Action => ({
        type: 'add',
        item: { id: qId(a.i), kind: 'token', rect: heapSlot(heap.indexOf(a)), tone: 'queued', text: `작업${a.i + 1}·${a.dur}ms` },
        from: `jname:${a.i}`,
      })),
      ...heap.filter((h) => !arrived.includes(h)).map((h): Action => ({
        type: 'set',
        id: qId(h.i),
        patch: { rect: heapSlot(heap.indexOf(h)) },
      })),
    ]));

    const picked = heap.shift()!;
    const start = now;
    now += picked.dur;
    const turnaround = now - picked.req;
    total += turnaround;
    done++;
    work++;

    rec.step({
      title: `작업 ${picked.i + 1}(${picked.dur}ms) 실행: ${start}~${now}ms (반환 ${turnaround}ms)`,
      codeHighlights: HEAP_AT.run,
      ...meta({ 실행작업: `작업 ${picked.i + 1}`, 반환시간: `${turnaround}ms` }),
    });
    rec.phase('꺼내기', `힙 맨 앞에서 소요 시간이 가장 짧은 작업 ${picked.i + 1}(${picked.dur}ms)을 꺼냅니다.`, HEAP_AT.pop);
    rec.do(...together([
      { type: 'remove', id: qId(picked.i), into: `jname:${picked.i}` },
      ...heap.map((h, k): Action => ({ type: 'set', id: qId(h.i), patch: { rect: heapSlot(k) } })),
    ]));

    rec.phase('실행하기', `${start}ms부터 ${now}ms까지 실행합니다. 요청(${picked.req}ms)부터 종료(${now}ms)까지 ${now} − ${picked.req} = ${turnaround}ms가 걸렸습니다.`, HEAP_AT.run);
    rec.do(...together([
      { type: 'add', item: runBar(picked.i, start, now, 'chosen'), from: `jname:${picked.i}` },
      { type: 'set', id: `jcalc:${picked.i}`, patch: { text: `${now}−${picked.req} = ${turnaround}ms` } },
      { type: 'set', id: 'now:tok', patch: { text: `now = ${now}ms` }, pop: true },
      { type: 'set', id: 'sum:tok', patch: { text: `총 ${total}ms`, tone: 'chosen' }, pop: true },
    ]));
  }

  const answer = Math.floor(total / N);
  rec.step({ title: `평균 반환 시간 ⌊${total} ÷ ${N}⌋ = ${answer}ms`, codeHighlights: HEAP_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `네 작업의 반환 시간 합은 3 + 7 + 7 + 19 = ${total}ms이고, 평균의 정수 부분은 ⌊${total} ÷ ${N}⌋ = ${answer}ms입니다.`, HEAP_AT.done);
  rec.do(...together([
    ...JOBS.map((_, i): Action => ({ type: 'set', id: barId(i), patch: { tone: 'path' } })),
    { type: 'set', id: 'avg:tok', patch: { text: `평균 ${answer}ms`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 매번 전체 작업 훑기: 전체 작업 훑기 → 짧은 작업 실행하기          */
/* ------------------------------------------------------------------ */

function scanDiskViz(): Visualization {
  const rec = new StepRecorder(board('전체 훑기'));
  const used = Array<boolean>(N).fill(false);
  let now = 0;
  let total = 0;
  let done = 0;
  let work = 0;
  const meta = (extra: Record<string, string | number> = {}) => ({
    work,
    variables: { now: `${now}ms`, total: `${total}ms`, done: `${done}/${N}`, ...extra },
  });

  rec.step({ title: '대기 힙 없이 시작하기', codeHighlights: SCAN_AT.init, ...meta() });
  rec.phase('시작', `별도의 힙을 두지 않고 매번 작업 ${N}개를 처음부터 끝까지 훑어 실행할 작업을 고릅니다.`, SCAN_AT.init);
  rec.do(...together(JOBS.map(([req, dur], i): Action => ({
    type: 'add',
    item: { id: qId(i), kind: 'token', rect: heapSlot(i), tone: 'plain', text: `작업${i + 1}:${req}·${dur}` },
  }))));

  while (done < N) {
    let best = -1;
    for (let i = 0; i < N; i++) {
      if (used[i] || JOBS[i][0] > now) continue;
      if (best < 0 || byDur({ i, req: JOBS[i][0], dur: JOBS[i][1] }, { i: best, req: JOBS[best][0], dur: JOBS[best][1] }) < 0) {
        best = i;
      }
    }
    const start = now;
    const [req, dur] = JOBS[best];
    used[best] = true;
    now += dur;
    const turnaround = now - req;
    total += turnaround;
    done++;
    work += N;

    rec.step({
      title: `${N}개 전체 확인 → 작업 ${best + 1}(${dur}ms) 실행`,
      codeHighlights: SCAN_AT.run,
      ...meta({ best: `작업 ${best + 1}`, 반환시간: `${turnaround}ms` }),
    });
    rec.phase('전체 훑기', `now = ${start}ms에서 작업 ${N}개를 모두 확인해, 도착했고 아직 안 끝난 작업 중 가장 짧은 작업 ${best + 1}(${dur}ms)을 찾습니다.`, SCAN_AT.scan);
    rec.do({ type: 'focus', ids: JOBS.map((_, i) => qId(i)) });
    rec.do({ type: 'set', id: qId(best), patch: { tone: 'current' } });

    rec.phase('실행하기', `작업 ${best + 1}을 ${start}~${now}ms 동안 실행합니다. 반환 시간은 ${turnaround}ms입니다.`, SCAN_AT.run);
    rec.do(...together([
      { type: 'unfocus' },
      { type: 'set', id: qId(best), patch: { tone: 'muted' } },
      { type: 'add', item: runBar(best, start, now, 'chosen'), from: `jname:${best}` },
      { type: 'set', id: `jcalc:${best}`, patch: { text: `${now}−${req} = ${turnaround}ms` } },
      { type: 'set', id: 'now:tok', patch: { text: `now = ${now}ms` }, pop: true },
      { type: 'set', id: 'sum:tok', patch: { text: `총 ${total}ms`, tone: 'chosen' }, pop: true },
    ]));
  }

  const answer = Math.floor(total / N);
  rec.step({ title: `평균 반환 시간 ${answer}ms (확인 ${work}번)`, codeHighlights: SCAN_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `답은 ${answer}ms로 같지만 매번 전체 작업을 다시 훑어 ${work}번 확인했습니다. 작업이 500개면 최대 25만 번 확인합니다.`, SCAN_AT.done);
  rec.do(...together([
    ...JOBS.map((_, i): Action => ({ type: 'set', id: barId(i), patch: { tone: 'path' } })),
    { type: 'set', id: 'avg:tok', patch: { text: `평균 ${answer}ms`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 요청 순서대로 처리(오답): 긴 작업 때문에 뒤 작업들이 밀림          */
/* ------------------------------------------------------------------ */

function fifoDiskViz(): Visualization {
  const rec = new StepRecorder(board('요청순 큐'));
  let now = 0;
  let total = 0;
  let work = N;
  const meta = (extra: Record<string, string | number> = {}) => ({
    work,
    variables: { now: `${now}ms`, total: `${total}ms`, ...extra },
  });

  rec.step({ title: '요청 시각 순으로 줄 세우기', codeHighlights: FIFO_AT.init, ...meta() });
  rec.phase('줄 세우기', '요청 시각 순서대로만 줄을 세우고, 대기 중인 작업의 소요 시간은 비교하지 않습니다.', FIFO_AT.init);
  rec.do(...together(JOBS.map(([, dur], i): Action => ({
    type: 'add',
    item: { id: qId(i), kind: 'token', rect: heapSlot(i), tone: 'queued', text: `작업${i + 1}·${dur}ms` },
  }))));

  JOBS.forEach(([req, dur], i) => {
    const start = Math.max(now, req);
    now = start + dur;
    const turnaround = now - req;
    total += turnaround;
    work++;
    const isLong = i === 1;

    rec.step({
      title: `작업 ${i + 1}(${dur}ms) 요청순 실행: ${start}~${now}ms (반환 ${turnaround}ms)`,
      codeHighlights: FIFO_AT.run,
      ...meta({ 실행작업: `작업 ${i + 1}`, 반환시간: `${turnaround}ms` }),
    });
    rec.phase('순서대로 꺼내기', isLong
      ? `3ms 시점에 더 짧은 작업 3(6ms)도 도착해 있지만, 요청 시각이 1ms로 앞선다는 이유로 긴 작업 2(9ms)를 먼저 실행합니다.`
      : `요청 순서에 따라 작업 ${i + 1}(${dur}ms)을 꺼내 실행합니다.`, FIFO_AT.pick);
    rec.do(...together([
      { type: 'remove', id: qId(i), into: `jname:${i}` },
      { type: 'add', item: runBar(i, start, now, i >= 1 ? 'bad' : 'chosen'), from: `jname:${i}` },
      { type: 'set', id: `jcalc:${i}`, patch: { text: `${now}−${req} = ${turnaround}ms` } },
      { type: 'set', id: 'now:tok', patch: { text: `now = ${now}ms` }, pop: true },
      { type: 'set', id: 'sum:tok', patch: { text: `총 ${total}ms`, tone: i >= 1 ? 'bad' : 'chosen' }, pop: true },
    ]));
  });

  const answer = Math.floor(total / N);
  rec.step({ title: `오답: 평균 ${answer}ms (정답 9ms)`, codeHighlights: FIFO_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('오답 확인', `긴 작업 2(9ms)가 먼저 실행되는 바람에 뒤의 짧은 작업 3(6ms), 작업 4(2ms)가 모두 9ms씩 더 기다렸습니다. 총합이 ${josa(total, '이', '가')} 되어 평균이 ${answer}ms(정답 9ms)로 커집니다.`, FIFO_AT.done);
  rec.do({ type: 'arrow', from: barId(1), to: barId(3), verdict: 'bad', label: '긴 작업 때문에 대기 증가' });
  rec.do({ type: 'set', id: 'avg:tok', patch: { text: `오답 ${answer}ms (정답 9)`, tone: 'bad' }, pop: true });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'disk-controller',
  title: '디스크 컨트롤러',
  level: 3,
  category: 'heap',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42627',
  description: {
    summary:
      '하드디스크는 한 번에 하나의 작업만 수행합니다. 각 작업의 [요청 시각, 소요 시간]이 주어질 때, 현재 도착해 대기 중인 작업들 가운데 소요 시간이 가장 짧은 작업부터 처리하여 모든 작업의 요청부터 종료까지 걸린 시간(반환 시간)의 평균을 최소화하고, 그 평균의 정수 부분을 구합니다.',
    rules: [
      'jobs의 길이는 1 이상 500 이하입니다.',
      'jobs의 각 행은 [작업이 요청되는 시점, 작업의 소요시간] 입니다.',
      '각 작업에 대해 작업이 요청되는 시간은 0 이상 1,000 이하입니다.',
      '각 작업에 대해 작업의 소요시간은 1 이상 1,000 이하입니다.',
      '대기 큐가 비어 있을 때는 아직 남아 있는 작업 중 가장 먼저 요청되는 작업부터 처리합니다.',
      '평균 반환 시간의 소수점 이하를 버린 정수 부분을 return 합니다.',
    ],
    examples: [
      { input: 'jobs = [[0, 3], [1, 9], [2, 6]]', output: '9' },
      { input: 'jobs = [[0, 3], [1, 9], [3, 5]]', output: '8' },
    ],
  },
  keyIntuitions: [
    '뒤에 기다리는 작업이 k개 있을 때 지금 고른 작업의 소요 시간 dur는 k개 작업 모두의 대기 시간에 더해집니다. 따라서 지금 도착해 있는 작업 중 소요 시간이 가장 짧은 것(SJF)을 먼저 끝내야 총 대기 시간이 가장 작습니다.',
    '현재 시각 now 이하에 요청된 작업들을 최소 힙(기준: 소요 시간 → 요청 시각 → 작업 번호)에 넣고, 가장 짧은 작업을 하나씩 꺼내 실행합니다.',
    '힙이 비어 있는데 아직 남은 작업이 있다면 현재 시각 now를 다음 작업의 요청 시각으로 바로 점프시킵니다.',
  ],
  demo: { input: [JOBS], label: 'jobs = [[0, 3], [1, 9], [2, 6], [4, 2]]' },
  workUnit: '작업 비교·힙 연산 수',
  approaches: [
    {
      id: 'disk-controller-min-heap',
      name: '작업 시간 최소 힙',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '요청 시각 순으로 정렬한 뒤, 현재 시각까지 도착한 작업을 소요 시간 최소 힙에 넣어 하나씩 꺼내는 정석 풀이입니다.',
      pros: [
        '각 작업이 힙에 딱 한 번 들어가고 한 번 나오므로 전체 O(N log N)에 끝납니다.',
        '대기 중인 작업이 없을 때 다음 요청 시각으로 점프하는 처리도 깔끔합니다.',
      ],
      cons: ['정렬 기준(요청 시각)과 힙 기준(소요 시간 우선)이 서로 달라 튜플 순서를 헷갈리지 않아야 합니다.'],
      whyThisRank:
        '시간이 흐르면서 대기열에 새 작업이 계속 추가되고 그중 최소 소요 시간을 바로 꺼내야 하므로 최소 힙이 가장 알맞습니다.',
      code: HEAP,
      visualize: minHeapDiskViz,
    },
    {
      id: 'disk-controller-scan',
      name: '매번 전체 작업을 훑어 짧은 작업 찾기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '힙을 쓰지 않고 작업이 하나 끝날 때마다 전체 작업 배열을 처음부터 훑어 다음 작업을 고르는 풀이입니다.',
      pros: ['힙을 구현할 필요가 없어 배열과 반복문만으로 작성할 수 있습니다.'],
      cons: [
        '작업 하나를 고를 때마다 N개를 모두 확인하므로 O(N²) 시간이 걸립니다.',
        '작업 수가 수만 개로 늘어나는 변형 문제에서는 시간 초과가 납니다.',
      ],
      whyThisRank:
        'N ≤ 500에서는 통과하지만, 이미 도착한 작업과 아직 도착하지 않은 작업을 매번 처음부터 다시 확인하는 중복 연산이 발생합니다.',
      code: SCAN,
      visualize: scanDiskViz,
    },
    {
      id: 'disk-controller-fifo',
      name: '요청 순서대로 바로 처리하기 (선입선출)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '대기 중인 작업의 소요 시간을 비교하지 않고 요청된 순서대로 처리하는 오답 풀이입니다.',
      pros: ['정렬 한 번과 단순 합산만 있어 코드가 매우 짧습니다.'],
      cons: [
        '소요 시간이 긴 작업이 먼저 실행되면 그사이에 도착한 짧은 작업들이 모두 긴 시간 동안 묶여 평균 반환 시간이 크게 늘어납니다.',
      ],
      whyThisRank:
        '요청 시각 순으로만 처리하면 대기열에 짧은 작업이 여러 개 쌓여 있을 때 평균 대기 시간을 줄일 수 없습니다.',
      code: FIFO,
      visualize: fifoDiskViz,
    },
  ],
  checks: {
    cases: [
      { args: [[[0, 3], [1, 9], [2, 6]]], expected: 9 },
      { args: [[[0, 3], [1, 9], [3, 5]]], expected: 8 },
      { args: [JOBS], expected: 9 },
      { args: [[[5, 4]]], expected: 4 },
      { args: [[[0, 10], [2, 3], [2, 2], [15, 4]]], expected: 9 },
    ],
    random: (rand) => {
      const len = 1 + Math.floor(rand() * 6);
      const jobs = Array.from({ length: len }, () => [Math.floor(rand() * 12), 1 + Math.floor(rand() * 9)]);
      return [jobs];
    },
  },
};

export default problem;
