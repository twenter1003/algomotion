// 프로세스: 정석 큐 + 정렬된 우선순위 기준, 대안 꺼낼 때마다 큐 전체에서 더 큰 중요도 찾기, 함정 중요도 내림차순 정렬만으로 순서 세기를 같은 장면에서 움직인다.
// 장면은 위에서부터 기준/정렬 줄 · 대기 큐 줄 · 꺼낸 프로세스 자리 · 실행 순서 줄이다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { slots } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';

// 시각화 입력. C★(처음 2번 자리, 중요도 2)는 D(중요도 3) 뒤로 밀려 4번째에 실행되지만,
// 큐 회전을 무시하고 중요도 내림차순으로만 줄 세우면 3번째라고 잘못 답한다.
const PRIORITIES = [2, 1, 2, 3, 2];
const LOCATION = 2;
const N = PRIORITIES.length;
const NAMES = ['A', 'B', 'C', 'D', 'E'];
const ORDER = [...PRIORITIES].sort((a, b) => b - a);

const labelOf = (i: number) => `${NAMES[i]}${i === LOCATION ? '★' : ''}(${PRIORITIES[i]})`;
const list = (xs: (number | string)[]) => `[${xs.join(', ')}]`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  python: `from collections import deque

def solution(priorities, location):
    queue = deque(enumerate(priorities))      # (처음 위치, 중요도)
    order = sorted(priorities, reverse=True)  # 실행될 중요도 순서
    executed = 0

    while queue:
        idx, p = queue.popleft()
        if p < order[executed]:               # 더 높은 중요도가 남아 있으면
            queue.append((idx, p))            # 큐 맨 뒤로 보냄
        else:
            executed += 1                     # 지금 가장 높은 중요도라 실행
            if idx == location:
                return executed
    return executed`,
  javascript: `function solution(priorities, location) {
  const queue = priorities.map((p, idx) => [idx, p]); // [처음 위치, 중요도]
  const order = [...priorities].sort((a, b) => b - a); // 실행될 중요도 순서
  let head = 0; // shift() 대신 머리 인덱스로 큐를 꺼냅니다
  let executed = 0;

  while (head < queue.length) {
    const [idx, p] = queue[head++];
    if (p < order[executed]) { // 더 높은 중요도가 남아 있으면
      queue.push([idx, p]); // 큐 맨 뒤로 보냄
    } else {
      executed++; // 지금 가장 높은 중요도라 실행
      if (idx === location) return executed;
    }
  }
  return executed;
}`,
};
const BEST_AT = {
  start: lines(BEST_CODE, ['queue = deque(', 'order = sorted(', 'executed = 0'], ['const queue =', 'const order =', 'let executed = 0']),
  pop: lines(BEST_CODE, ['while queue:', 'idx, p = queue.popleft()', 'if p < order[executed]:'], ['while (head < queue.length)', 'const [idx, p] = queue[head++]', 'if (p < order[executed])']),
  requeue: lines(BEST_CODE, ['if p < order[executed]:', 'queue.append((idx, p))'], ['if (p < order[executed])', 'queue.push([idx, p])']),
  exec: lines(BEST_CODE, ['else:', 'executed += 1', 'if idx == location:'], ['} else {', 'executed++;', 'if (idx === location)']),
  done: lines(BEST_CODE, ['executed += 1', 'if idx == location:', 'return executed'], ['executed++;', 'if (idx === location) return executed']),
};

const ALT_CODE = {
  python: `from collections import deque

def solution(priorities, location):
    queue = deque(enumerate(priorities))
    executed = 0

    while queue:
        idx, p = queue.popleft()
        # 남은 큐를 훑어 더 높은 중요도가 있는지 매번 확인
        if any(p < other for _, other in queue):
            queue.append((idx, p))
        else:
            executed += 1
            if idx == location:
                return executed
    return executed`,
  javascript: `function solution(priorities, location) {
  const queue = priorities.map((p, idx) => [idx, p]);
  let head = 0;
  let executed = 0;

  while (head < queue.length) {
    const [idx, p] = queue[head++];
    // 남은 큐를 훑어 더 높은 중요도가 있는지 매번 확인
    let hasHigher = false;
    for (let i = head; i < queue.length; i++) {
      if (p < queue[i][1]) {
        hasHigher = true;
        break;
      }
    }
    if (hasHigher) {
      queue.push([idx, p]);
    } else {
      executed++;
      if (idx === location) return executed;
    }
  }
  return executed;
}`,
};
const ALT_AT = {
  start: lines(ALT_CODE, ['queue = deque(', 'executed = 0'], ['const queue =', 'let executed = 0']),
  pop: lines(ALT_CODE, ['while queue:', 'idx, p = queue.popleft()'], ['while (head < queue.length)', 'const [idx, p] = queue[head++]']),
  scan: lines(ALT_CODE, ['if any(p < other for _, other in queue):'], ['for (let i = head; i < queue.length; i++)', 'if (p < queue[i][1])']),
  requeue: lines(ALT_CODE, ['queue.append((idx, p))'], ['if (hasHigher)', 'queue.push([idx, p])']),
  exec: lines(ALT_CODE, ['else:', 'executed += 1', 'if idx == location:'], ['} else {', 'executed++;', 'if (idx === location)']),
  done: lines(ALT_CODE, ['executed += 1', 'if idx == location:', 'return executed'], ['executed++;', 'if (idx === location) return executed']),
};

const TRAP_CODE = {
  python: `def solution(priorities, location):
    # 함정: 큐 회전을 무시하고 중요도 내림차순으로만 줄 세움
    ranked = sorted(enumerate(priorities), key=lambda x: -x[1])

    for turn, (idx, _) in enumerate(ranked, start=1):
        if idx == location:
            return turn
    return len(priorities)`,
  javascript: `function solution(priorities, location) {
  // 함정: 큐 회전을 무시하고 중요도 내림차순으로만 줄 세움
  const ranked = priorities
    .map((p, idx) => [idx, p])
    .sort((a, b) => b[1] - a[1]);

  for (let i = 0; i < ranked.length; i++) {
    if (ranked[i][0] === location) return i + 1;
  }
  return priorities.length;
}`,
};
const TRAP_AT = {
  sort: lines(TRAP_CODE, ['ranked = sorted('], ['const ranked = priorities', '.sort((a, b) => b[1] - a[1])']),
  check: lines(TRAP_CODE, ['for turn, (idx, _) in enumerate(ranked, start=1):', 'if idx == location:'], ['for (let i = 0; i < ranked.length; i++)', 'if (ranked[i][0] === location)']),
  done: lines(TRAP_CODE, ['if idx == location:', 'return turn'], ['if (ranked[i][0] === location) return i + 1']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const X0 = 80;
const SLOT_W = 62;
const GAP = 8;
const topSlot = slots({ x: X0, y: 0, w: SLOT_W, h: 48, gap: GAP });
const QUEUE_Y = 86;
const CUR_Y = 160;
const DONE_Y = 234;
const LANE_W = N * (SLOT_W + GAP) - GAP + 8;
const W = X0 + LANE_W + 150;
const H = DONE_Y + 56;

const QUEUE_LANE: LaneOptions = { id: 'queue', x: X0, y: QUEUE_Y + 4, slotW: SLOT_W, slotH: 44, gap: GAP, max: N };
const DONE_LANE: LaneOptions = { id: 'done', x: X0, y: DONE_Y + 4, slotW: SLOT_W, slotH: 44, gap: GAP, max: N };
const CUR_RECT: Rect = { x: X0, y: CUR_Y, w: SLOT_W, h: 48 };

const topId = (i: number) => `top:${i}`;
const qTokId = (i: number) => `q:${i}`;
const doneTokId = (i: number) => `done:${i}`;

const rowLabel = (id: string, text: string, y: number, h: number): Item => ({
  id,
  kind: 'text',
  rect: { x: 0, y, w: 72, h },
  text,
});

function board(topTitle: string): Scene {
  const items: Item[] = [
    rowLabel('row:top', topTitle, 0, 48),
    rowLabel('row:queue', '대기 큐', QUEUE_Y, 52),
    { id: 'queue:bg', kind: 'zone', rect: { x: X0 - 4, y: QUEUE_Y, w: LANE_W, h: 52 } },
    rowLabel('row:cur', '꺼낸 것', CUR_Y, 48),
    { id: 'cur:bg', kind: 'zone', rect: { x: X0 - 4, y: CUR_Y - 2, w: SLOT_W + 8, h: 52 } },
    { id: 'cur', kind: 'cell', rect: CUR_RECT, tone: 'plain', text: '-' },
    rowLabel('row:done', '실행 순서', DONE_Y, 52),
    { id: 'done:bg', kind: 'zone', rect: { x: X0 - 4, y: DONE_Y, w: LANE_W, h: 52 } },
  ];
  for (let i = 0; i < N; i++) {
    items.push({ id: topId(i), kind: 'cell', rect: topSlot(i), tone: 'plain', text: '', tag: String(i + 1) });
  }
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const paint = (id: string, tone: Tone, text?: string, sub?: string): Action => ({
  type: 'set',
  id,
  patch: { tone, ...(text !== undefined ? { text } : {}), ...(sub !== undefined ? { sub } : {}) },
});

/* ------------------------------------------------------------------ */
/* 정석: 큐 + 정렬된 우선순위 기준                                       */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new StepRecorder(board('기준 순서'));
  const qLane = new Lane(rec, QUEUE_LANE);
  const doneLane = new Lane(rec, DONE_LANE);

  const queue: number[] = [0, 1, 2, 3, 4];
  let executed = 0;
  let comparisons = 0;
  let curName = '-';

  const meta = () => ({
    work: comparisons,
    variables: {
      queue: list(queue.map(labelOf)),
      'order[executed]': ORDER[executed] ?? '-',
      cur: curName,
      executed,
    },
  });

  rec.step({
    title: `큐와 중요도 내림차순 기준 ${list(ORDER)} 준비`,
    codeHighlights: BEST_AT.start,
    ...meta(),
  });
  rec.phase(
    '준비',
    `중요도를 내림차순으로 정렬한 order = ${list(ORDER)}를 준비하고, 대기 큐에 A~E를 차례대로 넣습니다. 목표는 ${labelOf(LOCATION)}입니다.`,
  );
  for (let i = 0; i < N; i++) {
    qLane.push({ id: qTokId(i), text: labelOf(i), tone: i === LOCATION ? 'chosen' : 'queued' });
  }
  rec.do(
    ...together(
      ORDER.map((v, i): Action => ({
        type: 'set',
        id: topId(i),
        patch: { text: String(v), tone: i === 0 ? 'current' : 'plain' },
        pop: true,
      })),
    ),
    wait(600),
  );

  while (queue.length > 0) {
    const idx = queue.shift()!;
    const p = PRIORITIES[idx];
    const targetP = ORDER[executed];
    const name = labelOf(idx);
    curName = name;
    comparisons++;
    const lower = p < targetP;

    if (lower) {
      queue.push(idx);
    } else {
      executed++;
    }
    const isTarget = !lower && idx === LOCATION;

    rec.step({
      title: lower
        ? `${name} 꺼내기: ${p} < ${targetP} → 큐 맨 뒤로`
        : `${name} 꺼내기: ${p} = ${targetP} → ${executed}번째 실행${isTarget ? ` (정답 ${executed})` : ''}`,
      codeHighlights: isTarget ? BEST_AT.done : lower ? BEST_AT.requeue : BEST_AT.exec,
      ...meta(),
      ...(isTarget ? { answer: executed, isKeyframe: true } : {}),
    });

    rec.phase('꺼내기', `대기 큐 맨 앞에서 ${josa(name, '을', '를')} 꺼내 기준 중요도 ${targetP}과 비교합니다.`, BEST_AT.pop);
    qLane.shift('cur');
    rec.do(
      paint('cur', idx === LOCATION ? 'chosen' : 'current', name),
      { type: 'focus', ids: ['cur', topId(lower ? executed : executed - 1)] },
      {
        type: 'arrow',
        from: 'cur',
        to: topId(lower ? executed : executed - 1),
        verdict: lower ? 'bad' : 'good',
        label: lower ? `${p} < ${targetP}` : `${p} = ${targetP}`,
      },
      wait(300),
    );

    if (lower) {
      rec.phase(
        '뒤로 보내기',
        `중요도 ${josa(p, '이', '가')} 기준 ${targetP}보다 작으므로 ${josa(name, '을', '를')} 다시 대기 큐 맨 뒤에 넣습니다.`,
        BEST_AT.requeue,
      );
      qLane.push({ id: qTokId(idx), text: name, tone: idx === LOCATION ? 'chosen' : 'queued' }, 'cur');
      rec.do(...together([paint('cur', 'plain', '-'), ...clear()], true), wait(250));
    } else {
      rec.phase(
        '실행하기',
        isTarget
          ? `중요도 ${josa(p, '이', '가')} 기준과 같아 ${executed}번째로 실행합니다. 찾던 ${name}이므로 정답은 ${executed}입니다.`
          : `중요도 ${josa(p, '이', '가')} 지금 가장 높은 기준과 같으므로 ${executed}번째로 실행합니다.`,
        isTarget ? BEST_AT.done : BEST_AT.exec,
      );
      doneLane.push({ id: doneTokId(idx), text: name, tone: isTarget ? 'path' : 'visited' }, 'cur');
      const nextActs: Action[] = [
        paint('cur', 'plain', '-'),
        paint(topId(executed - 1), 'visited'),
        ...(executed < N ? [paint(topId(executed), 'current')] : []),
        ...clear(),
      ];
      rec.do(...together(nextActs, true), wait(300));
      if (isTarget) break;
    }
  }

  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 꺼낼 때마다 남은 큐 전체에서 더 큰 중요도 찾기                    */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new StepRecorder(board('처음 중요도'));
  const qLane = new Lane(rec, QUEUE_LANE);
  const doneLane = new Lane(rec, DONE_LANE);

  const queue: number[] = [0, 1, 2, 3, 4];
  let executed = 0;
  let comparisons = 0;
  let curName = '-';

  const meta = () => ({
    work: comparisons,
    variables: {
      queue: list(queue.map(labelOf)),
      cur: curName,
      executed,
    },
  });

  rec.step({
    title: '대기 큐에 프로세스 넣기 (정렬 기준 없음)',
    codeHighlights: ALT_AT.start,
    ...meta(),
  });
  rec.phase(
    '준비',
    `정렬된 기준 없이 대기 큐에 A~E를 그대로 넣습니다. 꺼낼 때마다 남은 큐를 직접 훑어 더 높은 중요도가 있는지 찾습니다.`,
  );
  for (let i = 0; i < N; i++) {
    qLane.push({ id: qTokId(i), text: labelOf(i), tone: i === LOCATION ? 'chosen' : 'queued' });
  }
  rec.do(
    ...together(
      PRIORITIES.map((_, i): Action => ({
        type: 'set',
        id: topId(i),
        patch: { text: labelOf(i), tone: i === LOCATION ? 'chosen' : 'plain' },
        pop: true,
      })),
    ),
    wait(600),
  );

  while (queue.length > 0) {
    const idx = queue.shift()!;
    const p = PRIORITIES[idx];
    const name = labelOf(idx);
    curName = name;

    // 남은 큐에서 p보다 큰 중요도를 찾을 때까지 하나씩 비교
    const checked: number[] = [];
    let higherIdx: number | undefined;
    for (const other of queue) {
      checked.push(other);
      comparisons++;
      if (p < PRIORITIES[other]) {
        higherIdx = other;
        break;
      }
    }

    const lower = higherIdx !== undefined;
    if (lower) {
      queue.push(idx);
    } else {
      executed++;
    }
    const isTarget = !lower && idx === LOCATION;

    rec.step({
      title: lower
        ? `${name}: 큐를 ${checked.length}번 비교해 ${labelOf(higherIdx!)} 발견 → 뒤로`
        : `${name}: 큐 ${checked.length}개 모두 확인 → ${executed}번째 실행${isTarget ? ` (정답 ${executed})` : ''}`,
      codeHighlights: isTarget ? ALT_AT.done : lower ? ALT_AT.requeue : ALT_AT.exec,
      ...meta(),
      ...(isTarget ? { answer: executed, isKeyframe: true } : {}),
    });

    rec.phase('꺼내기', `대기 큐 맨 앞에서 ${josa(name, '을', '를')} 꺼냅니다.`, ALT_AT.pop);
    qLane.shift('cur');
    rec.do(paint('cur', idx === LOCATION ? 'chosen' : 'current', name), wait(240));

    rec.phase(
      '큐 훑기',
      checked.length === 0
        ? '남은 대기 큐가 비어 있어 비교할 대상이 없습니다.'
        : lower
          ? `남은 큐를 앞에서부터 비교하다가 ${labelOf(higherIdx!)}에서 더 큰 중요도를 찾았습니다 (${checked.length}번 비교).`
          : `남은 큐 ${checked.length}개를 끝까지 비교해 더 큰 중요도가 없음을 확인했습니다.`,
      ALT_AT.scan,
    );
    if (checked.length > 0) {
      rec.do({ type: 'focus', ids: ['cur', ...checked.map(qTokId)] });
      for (const other of checked) {
        const bigger = p < PRIORITIES[other];
        rec.do({
          type: 'arrow',
          from: 'cur',
          to: qTokId(other),
          verdict: bigger ? 'bad' : 'good',
          label: bigger ? `${p} < ${PRIORITIES[other]}` : `${p} ≥ ${PRIORITIES[other]}`,
        });
      }
      rec.do(wait(200));
    } else {
      rec.do(wait(300));
    }

    if (lower) {
      rec.phase('뒤로 보내기', `더 높은 중요도가 있으므로 ${josa(name, '을', '를')} 다시 큐 맨 뒤에 넣습니다.`, ALT_AT.requeue);
      qLane.push({ id: qTokId(idx), text: name, tone: idx === LOCATION ? 'chosen' : 'queued' }, 'cur');
      rec.do(...together([paint('cur', 'plain', '-'), ...clear()], true), wait(250));
    } else {
      rec.phase(
        '실행하기',
        isTarget
          ? `남은 큐에 더 높은 중요도가 없어 ${executed}번째로 실행합니다. 목표 ${name}이므로 정답은 ${executed}입니다.`
          : `남은 큐에 더 높은 중요도가 없어 ${executed}번째로 실행합니다.`,
        isTarget ? ALT_AT.done : ALT_AT.exec,
      );
      doneLane.push({ id: doneTokId(idx), text: name, tone: isTarget ? 'path' : 'visited' }, 'cur');
      rec.do(...together([paint('cur', 'plain', '-'), paint(topId(idx), 'visited'), ...clear()], true), wait(300));
      if (isTarget) break;
    }
  }

  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: 중요도 내림차순 정렬만으로 순서 세기                             */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new StepRecorder(board('정렬 결과'));
  const doneLane = new Lane(rec, DONE_LANE);

  const ranked = PRIORITIES.map((p, idx) => ({ idx, p })).sort((a, b) => b.p - a.p);
  let checkedCount = 0;
  let turn = 0;

  const meta = () => ({
    work: checkedCount,
    variables: {
      ranked: list(ranked.map((r) => labelOf(r.idx))),
      location: LOCATION,
      turn: turn || '-',
    },
  });

  rec.step({
    title: '중요도 내림차순으로만 줄 세우기 (큐 회전 무시)',
    codeHighlights: TRAP_AT.sort,
    ...meta(),
  });
  rec.phase(
    '정렬하기',
    `중요도가 큰 순서대로 정렬하면 ${list(ranked.map((r) => labelOf(r.idx)))}가 됩니다. 같은 중요도끼리는 처음 번호 순서(A → C★ → E)가 그대로 남습니다.`,
  );
  rec.do(
    ...together(
      ranked.map((r, i): Action => ({
        type: 'set',
        id: topId(i),
        patch: { text: labelOf(r.idx), tone: r.idx === LOCATION ? 'chosen' : 'queued' },
        pop: true,
      })),
    ),
    wait(700),
  );

  for (let i = 0; i < ranked.length; i++) {
    const { idx } = ranked[i];
    const name = labelOf(idx);
    checkedCount++;
    turn = i + 1;
    const hit = idx === LOCATION;

    if (!hit) {
      rec.step({
        title: `${turn}번째 ${name} 확인 → 목표(${labelOf(LOCATION)}) 아님`,
        codeHighlights: TRAP_AT.check,
        ...meta(),
      });
      rec.phase('순서 확인', `정렬된 줄의 ${turn}번째인 ${josa(name, '을', '를')} 확인합니다. 처음 위치 ${idx} ≠ ${LOCATION}이므로 넘어갑니다.`, TRAP_AT.check);
      rec.do({ type: 'focus', ids: [topId(i)] }, paint(topId(i), 'current'));
      doneLane.push({ id: doneTokId(idx), text: name, tone: 'visited' }, topId(i));
      rec.do(...together([paint(topId(i), 'visited'), ...clear()], true), wait(300));
    } else {
      rec.step({
        title: `오답 확인: 정렬 순서는 ${turn}번째, 실제 정답은 4번째`,
        codeHighlights: TRAP_AT.done,
        ...meta(),
        answer: turn,
        isKeyframe: true,
      });
      rec.phase('오답 반환', `정렬된 줄의 ${turn}번째에서 ${josa(name, '을', '를')} 만나 ${turn}을 돌려줍니다.`, TRAP_AT.done);
      rec.do({ type: 'focus', ids: [topId(i)] });
      doneLane.push({ id: doneTokId(idx), text: name, tone: 'bad' }, topId(i));
      rec.do(...together([paint(topId(i), 'bad'), ...clear()], true), wait(300));

      rec.phase(
        '오답 확인',
        `실제로는 D(3)가 나오기 전에 A(2)와 C★(2)가 모두 큐 뒤로 밀려나서, D(3) 바로 뒤에 있던 E(2)가 먼저 실행됩니다. 정답은 ${ro(4)} ${turn}이 아닙니다.`,
      );
      const rightX = X0 + LANE_W + 8;
      rec.do(
        ...together([
          {
            type: 'add',
            item: { id: 'wrong', kind: 'token', rect: { x: rightX, y: DONE_Y, w: 134, h: 24 }, tone: 'bad', text: `이 풀이: ${turn}번째` },
          },
          {
            type: 'add',
            item: { id: 'truth', kind: 'token', rect: { x: rightX, y: DONE_Y + 28, w: 134, h: 24 }, tone: 'good', text: '정답: 4번째' },
          },
        ]),
        wait(500),
      );
      break;
    }
  }

  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'process',
  title: '프로세스',
  level: 2,
  category: 'stack-queue',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42587',
  description: {
    summary:
      '대기 큐 맨 앞에서 프로세스를 꺼냈을 때 큐에 중요도가 더 높은 프로세스가 하나라도 있으면 다시 큐 맨 뒤에 넣고, 없으면 바로 실행합니다. 각 프로세스의 중요도와 알고 싶은 프로세스의 처음 위치가 주어질 때 몇 번째로 실행되는지 구합니다.',
    rules: [
      'priorities의 길이는 1 이상 100 이하이고, 원소는 1 이상 9 이하의 정수(클수록 중요도가 높음)',
      'location은 0 이상 (대기 큐 길이 - 1) 이하이며 맨 앞이 0번째',
    ],
    examples: [
      { input: 'priorities = [2, 1, 3, 2], location = 2', output: '1' },
      { input: 'priorities = [1, 1, 9, 1, 1, 1], location = 0', output: '5' },
    ],
  },
  keyIntuitions: [
    '중요도가 같은 프로세스라도 더 높은 중요도 프로세스를 기다리며 큐 뒤로 밀려나면 실행 순서가 바뀝니다.',
    '실행되는 중요도의 순서는 처음 배열을 내림차순 정렬한 결과와 항상 같습니다.',
    '따라서 중요도를 미리 내림차순 정렬해 두고, 큐에서 꺼낸 값이 지금 차례의 최댓값과 같은지만 비교하면 매번 큐를 다 훑지 않아도 됩니다.',
  ],
  demo: { input: [PRIORITIES, LOCATION], label: 'priorities = [2, 1, 2, 3, 2], location = 2 (C★)' },
  workUnit: '우선순위 비교 횟수',
  approaches: [
    {
      id: 'process-queue-sorted',
      name: '큐 + 정렬된 우선순위 기준',
      rank: 'BEST',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '실행될 중요도 순서를 미리 정렬해 두어, 큐에서 꺼낼 때마다 값 하나로만 비교하는 정석 풀이입니다.',
      pros: [
        '꺼낸 프로세스를 실행할지 판단할 때 order[executed] 하나와만 비교하면 됩니다.',
        '큐가 회전하면서 같은 중요도끼리 순서가 바뀌는 현상을 정확히 처리합니다.',
      ],
      cons: ['최악의 경우 큐가 한 바퀴씩 돌아 꺼내는 횟수 자체는 O(N²)까지 늘 수 있습니다.'],
      whyThisRank:
        '큐 시뮬레이션을 그대로 따르면서도 매번 남은 큐의 최댓값을 다시 찾는 낭비를 없애 비교 횟수가 가장 적습니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'process-queue-scan',
      name: '꺼낼 때마다 큐 전체 훑기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '문제 설명을 그대로 코드로 옮겨 이해하기 쉽지만, 꺼낼 때마다 남은 큐를 다시 훑어 비교 횟수가 늘어나는 풀이입니다.',
      pros: [
        '문제의 규칙("남은 큐에 더 높은 중요도가 있으면 뒤로")이 코드 한 줄로 그대로 읽힙니다.',
        '따로 정렬 배열을 만들지 않아도 됩니다.',
      ],
      cons: [
        '프로세스를 하나 꺼낼 때마다 남은 큐를 앞에서부터 다시 훑어야 해서 우선순위 비교 횟수가 불필요하게 많습니다.',
      ],
      whyThisRank:
        '정답은 같지만 매번 큐를 훑느라 정석보다 우선순위 비교를 훨씬 많이 합니다. N ≤ 100이라 통과하지만 비교 비용에서 손해를 봅니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'process-sort-only',
      name: '중요도 내림차순 정렬만으로 세기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '중요도가 높은 것부터 실행된다는 점만 보고 정렬로 끝내려다, 큐가 돌며 같은 중요도의 순서가 바뀌는 것을 놓치는 오답입니다.',
      pros: ['정렬 한 번으로 끝나 코드가 매우 짧습니다.'],
      cons: [
        '중요도 3이 맨 뒤쪽에 있으면 앞의 중요도 2들이 큐 뒤로 밀려나면서, 3 뒤에 있던 중요도 2가 먼저 실행됩니다.',
        '정렬만 하면 같은 중요도끼리 늘 처음 번호 순서대로 실행된다고 가정해 오답이 됩니다.',
      ],
      whyThisRank:
        '가장 높은 중요도가 빠져나가는 순간 큐의 시작 위치가 달라집니다. 이 회전을 시뮬레이션하지 않으면 같은 중요도 사이의 순서를 맞힐 수 없습니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [[2, 1, 3, 2], 2], expected: 1 },
      { args: [[1, 1, 9, 1, 1, 1], 0], expected: 5 },
      { args: [[2, 1, 3, 2], 0], expected: 3 },
      { args: [[5], 0], expected: 1 },
      { args: [[1, 2, 3, 4], 0], expected: 4 },
      { args: [PRIORITIES, LOCATION], expected: 4 },
    ],
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 7);
      const priorities = Array.from({ length: n }, () => 1 + Math.floor(rand() * 9));
      const location = Math.floor(rand() * n);
      return [priorities, location];
    },
  },
};

export default problem;
