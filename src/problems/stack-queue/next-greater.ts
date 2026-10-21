// 뒤에 있는 큰 수 찾기: 정석 단조 스택, 대안 최소 힙(우선순위 큐), 함정 이중 반복문(시간 초과)을 같은 장면에서 움직인다.
// 장면은 위에서부터 numbers 줄 · 뒷 큰수(answer) 줄 · 대기 줄(단조 스택 / 최소 힙)이다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { slots } from '../../engine/layout.ts';
import type { Action, Item, Problem, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';

// 시각화 입력. 내림차순으로 쌓인 [9, 6, 3, 2] 뒤에 5가 나와 2와 3만 꺼내고, 9·6·5·4·1은 끝까지 남는다.
// 정석(단조 스택)은 8번 비교로 끝나지만, 최소 힙은 힙 정렬 비교가 추가되어 14번, 이중 반복문은 9와 6을 끝까지 다시 훑어 17번 비교한다.
const NUMBERS = [9, 6, 3, 2, 5, 4, 1];
const N = NUMBERS.length;
const TRUTH = [-1, -1, 5, 5, -1, -1, -1];

const list = (xs: (number | string)[]) => `[${xs.join(', ')}]`;
const itemLabel = (i: number) => `${i}번(${NUMBERS[i]})`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  python: `def solution(numbers):
    answer = [-1] * len(numbers)
    stack = []  # 아직 뒷 큰수를 못 찾은 인덱스 (자동으로 내림차순 유지)

    for i, num in enumerate(numbers):
        while stack and numbers[stack[-1]] < num:
            answer[stack.pop()] = num  # 현재 수가 가장 가까운 뒷 큰수
        stack.append(i)

    return answer`,
  javascript: `function solution(numbers) {
  const answer = new Array(numbers.length).fill(-1);
  const stack = []; // 아직 뒷 큰수를 못 찾은 인덱스 (자동으로 내림차순 유지)

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    while (stack.length > 0 && numbers[stack[stack.length - 1]] < num) {
      answer[stack.pop()] = num; // 현재 수가 가장 가까운 뒷 큰수
    }
    stack.push(i);
  }

  return answer;
}`,
};
const BEST_AT = {
  init: lines(BEST_CODE, ['answer = [-1] * len(numbers)', 'stack = []'], ['const answer = new Array(numbers.length).fill(-1)', 'const stack = []']),
  check: lines(BEST_CODE, ['for i, num in enumerate(numbers):', 'while stack and numbers[stack[-1]] < num:'], ['for (let i = 0; i < numbers.length; i++)', 'while (stack.length > 0 && numbers[stack[stack.length - 1]] < num)']),
  pop: lines(BEST_CODE, ['answer[stack.pop()] = num'], ['answer[stack.pop()] = num']),
  push: lines(BEST_CODE, ['stack.append(i)'], ['stack.push(i)']),
  done: lines(BEST_CODE, ['return answer'], ['return answer;']),
};

const ALT_CODE = {
  python: `import heapq

def solution(numbers):
    answer = [-1] * len(numbers)
    heap = []  # (값, 인덱스) 최소 힙

    for i, num in enumerate(numbers):
        while heap and heap[0][0] < num:
            _, idx = heapq.heappop(heap)
            answer[idx] = num
        heapq.heappush(heap, (num, i))

    return answer`,
  javascript: `function solution(numbers) {
  const answer = new Array(numbers.length).fill(-1);
  const heap = []; // [값, 인덱스] 최소 힙

  const push = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      while (i * 2 + 1 < heap.length) {
        let c = i * 2 + 1;
        if (c + 1 < heap.length && heap[c + 1][0] < heap[c][0]) c++;
        if (heap[i][0] <= heap[c][0]) break;
        [heap[i], heap[c]] = [heap[c], heap[i]];
        i = c;
      }
    }
    return top;
  };

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    while (heap.length > 0 && heap[0][0] < num) {
      const [, idx] = pop();
      answer[idx] = num;
    }
    push([num, i]);
  }
  return answer;
}`,
};
const ALT_AT = {
  init: lines(ALT_CODE, ['answer = [-1] * len(numbers)', 'heap = []'], ['const answer = new Array(numbers.length).fill(-1)', 'const heap = []']),
  pop: lines(ALT_CODE, ['while heap and heap[0][0] < num:', '_, idx = heapq.heappop(heap)', 'answer[idx] = num'], ['while (heap.length > 0 && heap[0][0] < num)', 'const [, idx] = pop()', 'answer[idx] = num']),
  push: lines(ALT_CODE, ['heapq.heappush(heap, (num, i))'], ['push([num, i])']),
  done: lines(ALT_CODE, ['return answer'], ['return answer;']),
};

const TRAP_CODE = {
  python: `def solution(numbers):
    n = len(numbers)
    answer = [-1] * n

    # 함정: 매 원소마다 오른쪽을 끝까지 훑어 O(N²) 시간 초과
    for i in range(n):
        for j in range(i + 1, n):
            if numbers[j] > numbers[i]:
                answer[i] = numbers[j]
                break

    return answer`,
  javascript: `function solution(numbers) {
  const n = numbers.length;
  const answer = new Array(n).fill(-1);

  // 함정: 매 원소마다 오른쪽을 끝까지 훑어 O(N²) 시간 초과
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (numbers[j] > numbers[i]) {
        answer[i] = numbers[j];
        break;
      }
    }
  }

  return answer;
}`,
};
const TRAP_AT = {
  init: lines(TRAP_CODE, ['answer = [-1] * n'], ['const answer = new Array(n).fill(-1)']),
  scan: lines(TRAP_CODE, ['for i in range(n):', 'for j in range(i + 1, n):', 'if numbers[j] > numbers[i]:'], ['for (let i = 0; i < n; i++)', 'for (let j = i + 1; j < n; j++)', 'if (numbers[j] > numbers[i])']),
  found: lines(TRAP_CODE, ['answer[i] = numbers[j]', 'break'], ['answer[i] = numbers[j];', 'break;']),
  done: lines(TRAP_CODE, ['return answer'], ['return answer;']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const X0 = 84;
const CELL_W = 64;
const GAP = 8;
const numSlot = slots({ x: X0, y: 0, w: CELL_W, h: 48, gap: GAP });
const ANS_Y = 78;
const ansSlot = slots({ x: X0, y: ANS_Y, w: CELL_W, h: 48, gap: GAP });
const LANE_Y = 156;
const LANE_W = N * (CELL_W + GAP) - GAP + 8;
const W = X0 + LANE_W + 150;
const H = LANE_Y + 56;

const WAIT_LANE: LaneOptions = { id: 'wait', x: X0, y: LANE_Y + 4, slotW: CELL_W, slotH: 44, gap: GAP, max: N };

const numId = (i: number) => `num:${i}`;
const ansId = (i: number) => `ans:${i}`;
const tokId = (i: number) => `wt:${i}`;

const rowLabel = (id: string, text: string, y: number, h: number): Item => ({
  id,
  kind: 'text',
  rect: { x: 0, y, w: 76, h },
  text,
});

function board(bottomTitle: string): Scene {
  const items: Item[] = [
    rowLabel('row:num', 'numbers', 0, 48),
    rowLabel('row:ans', '뒷 큰수', ANS_Y, 48),
    rowLabel('row:wait', bottomTitle, LANE_Y, 52),
    { id: 'wait:bg', kind: 'zone', rect: { x: X0 - 4, y: LANE_Y, w: LANE_W, h: 52 } },
  ];
  for (let i = 0; i < N; i++) {
    items.push(
      { id: numId(i), kind: 'cell', rect: numSlot(i), tone: 'plain', text: String(NUMBERS[i]), tag: String(i) },
      { id: ansId(i), kind: 'cell', rect: ansSlot(i), tone: 'plain', text: '-1', tag: String(i) },
    );
  }
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const paint = (id: string, tone: Tone, text?: string): Action => ({
  type: 'set',
  id,
  patch: { tone, ...(text !== undefined ? { text } : {}) },
});

/* ------------------------------------------------------------------ */
/* 정석: 단조 스택                                                      */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new StepRecorder(board('단조 스택'));
  const sLane = new Lane(rec, WAIT_LANE);

  const answer = new Array<number>(N).fill(-1);
  const stack: number[] = [];
  let comparisons = 0;
  let curI: number | string = '-';

  const meta = () => ({
    work: comparisons,
    variables: {
      i: curI,
      stack: list(stack.map(itemLabel)),
      answer: list(answer),
    },
  });

  rec.step({
    title: 'answer를 모두 -1로 초기화하고 빈 스택 준비',
    codeHighlights: BEST_AT.init,
    ...meta(),
  });
  rec.phase(
    '초기화',
    '뒷 큰수가 없는 원소는 -1이므로 처음부터 모두 -1로 채워 둡니다. 스택에는 아직 뒷 큰수를 만나지 못한 인덱스를 넣습니다.',
  );
  rec.do(wait(500));

  for (let i = 0; i < N; i++) {
    const num = NUMBERS[i];
    curI = i;

    while (stack.length > 0 && NUMBERS[stack.at(-1)!] < num) {
      const top = stack.pop()!;
      const topVal = NUMBERS[top];
      comparisons++;
      answer[top] = num;

      rec.step({
        title: `${i}번(${num}): 스택 맨 위 ${top}번(${topVal}) < ${num} → 뒷 큰수 ${num} 확정`,
        codeHighlights: BEST_AT.pop,
        ...meta(),
      });
      rec.phase(
        '비교하기',
        `현재 ${i}번 값 ${josa(num, '이', '가')} 스택 맨 위 ${top}번(${topVal})보다 큽니다.`,
        BEST_AT.check,
      );
      rec.do(
        { type: 'focus', ids: [numId(i), numId(top), tokId(top), ansId(top)] },
        paint(numId(i), 'current'),
        { type: 'arrow', from: numId(i), to: numId(top), verdict: 'good', label: `${topVal} < ${num}` },
        wait(240),
      );
      rec.phase(
        '꺼내서 확정',
        `${top}번을 스택에서 꺼내고 answer[${top}] = ${num}로 확정합니다.`,
        BEST_AT.pop,
      );
      sLane.pop(ansId(top));
      rec.do(
        ...together(
          [
            { type: 'set', id: ansId(top), patch: { text: String(num), tone: 'visited' }, pop: true },
            paint(numId(top), 'visited'),
            ...clear(),
          ],
          true,
        ),
        wait(240),
      );
    }

    const prevTop = stack.at(-1);
    if (prevTop !== undefined) comparisons++;
    stack.push(i);

    rec.step({
      title:
        prevTop === undefined
          ? `${i}번(${num}): 빈 스택에 넣기`
          : `${i}번(${num}): 맨 위 ${prevTop}번(${NUMBERS[prevTop]}) ≥ ${num} → 스택에 넣기`,
      codeHighlights: BEST_AT.push,
      ...meta(),
    });
    if (prevTop !== undefined) {
      rec.phase(
        '비교 멈춤',
        `스택 맨 위 ${prevTop}번(${NUMBERS[prevTop]})이 ${num} 이상이면 그 아래에 깔린 값들은 더 크므로 볼 필요 없이 멈춥니다.`,
        BEST_AT.check,
      );
      rec.do(
        { type: 'focus', ids: [numId(prevTop), numId(i), tokId(prevTop)] },
        paint(numId(i), 'current'),
        { type: 'arrow', from: numId(prevTop), to: numId(i), verdict: 'bad', label: `${NUMBERS[prevTop]} ≥ ${num}` },
        wait(240),
      );
    }
    rec.phase('스택에 넣기', `${i}번(${num})을 스택에 넣어 자기보다 큰 뒤쪽 수를 기다립니다.`, BEST_AT.push);
    sLane.push({ id: tokId(i), text: itemLabel(i), tone: 'queued' }, numId(i));
    rec.do(...together([paint(numId(i), 'queued'), ...clear()], true), wait(240));
  }

  rec.step({
    title: `스택에 남은 5개는 뒷 큰수 없음(-1) — 정답 ${list(answer)}`,
    codeHighlights: BEST_AT.done,
    ...meta(),
    answer: [...answer],
    isKeyframe: true,
  });
  rec.phase(
    '마무리',
    `끝까지 스택에 남은 [9, 6, 5, 4, 1]은 뒤에 더 큰 수가 없으므로 처음 채워 둔 -1이 그대로 남습니다. 총 비교 횟수는 ${comparisons}번입니다.`,
    BEST_AT.done,
  );
  rec.do(
    ...together([
      ...Array.from({ length: N }, (_, i) => paint(ansId(i), 'path')),
      ...Array.from({ length: N }, (_, i) => paint(numId(i), 'visited')),
      ...sLane.ids.map((id) => paint(id, 'muted')),
    ]),
    wait(400),
  );

  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 최소 힙 (우선순위 큐)                                          */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new StepRecorder(board('최소 힙'));
  const hLane = new Lane(rec, WAIT_LANE);

  const answer = new Array<number>(N).fill(-1);
  const heap: number[] = []; // 작은 값 순서로 정렬된 인덱스
  let comparisons = 0;
  let curI: number | string = '-';

  const meta = () => ({
    work: comparisons,
    variables: {
      i: curI,
      heap: list(heap.map(itemLabel)),
      answer: list(answer),
    },
  });

  rec.step({
    title: 'answer를 -1로 두고 (값, 인덱스) 최소 힙 준비',
    codeHighlights: ALT_AT.init,
    ...meta(),
  });
  rec.phase(
    '초기화',
    '가장 작은 대기 원소부터 꺼내려고 최소 힙을 쓰는 풀이입니다. 넣거나 꺼낼 때마다 힙 순서를 맞추는 추가 비교가 듭니다.',
  );
  rec.do(wait(500));

  for (let i = 0; i < N; i++) {
    const num = NUMBERS[i];
    curI = i;

    const popped: number[] = [];
    while (heap.length > 0) {
      comparisons++; // heap[0][0] < num 비교
      if (NUMBERS[heap[0]] < num) {
        const idx = heap.shift()!;
        popped.push(idx);
        answer[idx] = num;
        if (heap.length > 1) comparisons++; // heappop 뒤 자식끼리 비교해 자리 맞추기
      } else {
        break;
      }
    }

    // heappush할 때 부모와 비교하는 횟수(비어 있지 않으면 최소 1번)
    const pushComps = heap.length === 0 ? 0 : 1;
    comparisons += pushComps;
    heap.push(i);
    heap.sort((a, b) => NUMBERS[a] - NUMBERS[b]);

    rec.step({
      title:
        popped.length > 0
          ? `${i}번(${num}): 힙에서 ${popped.map(itemLabel).join(', ')} 꺼내 ${num} 확정 후 삽입`
          : `${i}번(${num}): 힙 최솟값 확인 후 힙에 넣어 정렬 유지`,
      codeHighlights: popped.length > 0 ? ALT_AT.pop : ALT_AT.push,
      ...meta(),
    });

    if (popped.length > 0) {
      rec.phase(
        '최솟값 꺼내기',
        `힙 맨 앞의 ${popped.map(itemLabel).join(', ')}이 ${num}보다 작아 차례로 꺼내고 뒷 큰수를 ${num}로 적습니다.`,
        ALT_AT.pop,
      );
      for (const idx of popped) {
        hLane.shift(ansId(idx));
        rec.do(
          { type: 'set', id: ansId(idx), patch: { text: String(num), tone: 'visited' }, pop: true },
          paint(numId(idx), 'visited'),
        );
      }
    }

    rec.phase(
      '힙에 넣기',
      `힙에 ${itemLabel(i)}을 넣고 최솟값이 맨 앞에 오도록 자리를 맞춥니다. 단조 스택과 달리 넣을 때도 정렬 비교가 추가됩니다.`,
      ALT_AT.push,
    );
    hLane.push({ id: tokId(i), text: itemLabel(i), tone: 'queued' }, numId(i));
    hLane.reorder(heap.map(tokId));
    rec.do(paint(numId(i), 'queued'), wait(260));
  }

  rec.step({
    title: `모든 원소 확인 완료 (총 ${comparisons}번 비교) — 정답 ${list(answer)}`,
    codeHighlights: ALT_AT.done,
    ...meta(),
    answer: [...answer],
    isKeyframe: true,
  });
  rec.phase(
    '마무리',
    `정답은 ${list(answer)}로 같지만, 스택이면 자동으로 맞춰질 순서를 힙으로 유지하느라 정석(8번)보다 많은 ${comparisons}번 비교했습니다.`,
    ALT_AT.done,
  );
  rec.do(
    ...together([
      ...Array.from({ length: N }, (_, i) => paint(ansId(i), 'path')),
      ...Array.from({ length: N }, (_, i) => paint(numId(i), 'visited')),
      ...hLane.ids.map((id) => paint(id, 'muted')),
    ]),
    wait(400),
  );

  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: 이중 반복문으로 매번 오른쪽 끝까지 훑기 (시간 초과)              */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new StepRecorder(board('시간 초과'));
  const answer = new Array<number>(N).fill(-1);
  let comparisons = 0;
  let curI: number | string = '-';

  const meta = () => ({
    work: comparisons,
    variables: {
      i: curI,
      answer: list(answer),
    },
  });

  rec.step({
    title: 'answer를 -1로 두고 0번부터 차례대로 오른쪽 끝까지 훑기',
    codeHighlights: TRAP_AT.init,
    ...meta(),
  });
  rec.phase('초기화', '원소 i마다 오른쪽 원소 j를 하나씩 비교해 첫 큰 수를 찾는 이중 반복문 풀이입니다.');
  rec.do(wait(500));

  for (let i = 0; i < N - 1; i++) {
    curI = i;
    const inspected: number[] = [];
    let foundJ: number | undefined;
    for (let j = i + 1; j < N; j++) {
      inspected.push(j);
      comparisons++;
      if (NUMBERS[j] > NUMBERS[i]) {
        answer[i] = NUMBERS[j];
        foundJ = j;
        break;
      }
    }

    rec.step({
      title:
        foundJ !== undefined
          ? `${i}번(${NUMBERS[i]}): ${inspected.length}번 비교 끝에 ${foundJ}번(${NUMBERS[foundJ]}) 발견`
          : `${i}번(${NUMBERS[i]}): 오른쪽 ${inspected.length}개 전부 비교 → 큰 수 없음(-1)`,
      codeHighlights: foundJ !== undefined ? TRAP_AT.found : TRAP_AT.scan,
      ...meta(),
    });
    rec.phase(
      '오른쪽 훑기',
      foundJ !== undefined
        ? `${i}번(${NUMBERS[i]}) 오른쪽을 차례로 비교해 ${foundJ}번에서 더 큰 수 ${NUMBERS[foundJ]}를 찾았습니다.`
        : `${i}번(${NUMBERS[i]})보다 큰 수가 없어서 오른쪽 끝까지 ${inspected.length}개를 전부 비교하고도 -1로 끝납니다.`,
      foundJ !== undefined ? TRAP_AT.found : TRAP_AT.scan,
    );
    rec.do({ type: 'focus', ids: [numId(i), ansId(i), ...inspected.map(numId)] }, paint(numId(i), 'current'));
    for (const j of inspected) {
      const bigger = NUMBERS[j] > NUMBERS[i];
      rec.do({
        type: 'arrow',
        from: numId(i),
        to: numId(j),
        verdict: bigger ? 'good' : 'bad',
        label: bigger ? `${NUMBERS[j]} > ${NUMBERS[i]}` : `${NUMBERS[j]} ≤ ${NUMBERS[i]}`,
      });
    }
    rec.do(
      { type: 'set', id: ansId(i), patch: { text: String(answer[i]), tone: foundJ !== undefined ? 'visited' : 'bad' }, pop: true },
      wait(240),
      ...together([paint(numId(i), 'visited'), ...clear()]),
    );
  }

  curI = N - 1;
  rec.step({
    title: `비교 횟수 폭발: 7개에서 ${comparisons}번 (N = 1,000,000이면 약 5,000억 번)`,
    codeHighlights: TRAP_AT.done,
    ...meta(),
    answer: [...answer],
    isKeyframe: true,
  });
  rec.phase(
    '시간 초과 확인',
    `내림차순에 가까운 구간마다 매번 오른쪽 끝까지 다시 훑어 7개만으로도 ${comparisons}번 비교했습니다. 최대 입력 N = 1,000,000에서는 약 5,000억 번 비교해 시간 초과가 납니다.`,
    TRAP_AT.done,
  );
  const rightX = X0 + LANE_W + 8;
  rec.do(
    ...together([
      {
        type: 'add',
        item: { id: 'slow', kind: 'token', rect: { x: rightX, y: LANE_Y, w: 138, h: 24 }, tone: 'bad', text: `이중 루프: ${comparisons}번` },
      },
      {
        type: 'add',
        item: { id: 'fast', kind: 'token', rect: { x: rightX, y: LANE_Y + 28, w: 138, h: 24 }, tone: 'good', text: '단조 스택: 8번' },
      },
    ]),
    wait(500),
  );

  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'next-greater',
  title: '뒤에 있는 큰 수 찾기',
  level: 2,
  category: 'stack-queue',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/154539',
  description: {
    summary:
      '정수 배열 numbers의 각 원소마다 자신보다 뒤에 있는 숫자 가운데 자신보다 크면서 가장 가까이 있는 수(뒷 큰수)를 구합니다. 뒷 큰수가 존재하지 않는 원소는 -1을 담습니다.',
    rules: [
      'numbers의 길이는 4 이상 1,000,000 이하',
      'numbers의 각 원소는 1 이상 1,000,000 이하인 정수',
    ],
    examples: [
      { input: 'numbers = [2, 3, 3, 5]', output: '[3, 5, 5, -1]' },
      { input: 'numbers = [9, 1, 5, 3, 6, 2]', output: '[-1, 5, 6, 6, -1, -1]' },
    ],
  },
  keyIntuitions: [
    '아직 뒷 큰수를 찾지 못한 원소들의 인덱스를 스택에 담아 두면, 새로운 수 num이 들어올 때 스택 맨 위보다 크면 그 수가 바로 가장 가까운 뒷 큰수입니다.',
    '새 수를 넣기 전에 자신보다 작은 값들을 모두 꺼내므로, 스택 안의 값들은 바닥에서 위로 갈수록 항상 작거나 같은 단조 감소 순서를 유지합니다.',
    '따라서 스택 맨 위가 num 이상이면 그 아래에 있는 원소들은 볼 필요도 없이 모두 num 이상이므로 바로 비교를 멈출 수 있습니다.',
  ],
  demo: { input: [NUMBERS], label: 'numbers = [9, 6, 3, 2, 5, 4, 1]' },
  workUnit: '숫자 비교 횟수',
  approaches: [
    {
      id: 'next-greater-monotonic-stack',
      name: '단조 스택',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '아직 답을 못 찾은 인덱스를 스택에 쌓아 두고, 더 큰 수가 나오면 연쇄로 꺼내 확정하는 O(N) 정석 풀이입니다.',
      pros: [
        '각 원소가 스택에 한 번 들어가고 최대 한 번 나오므로 N = 1,000,000에서도 200만 번 안팎의 연산으로 끝납니다.',
        '스택이 자연스럽게 내림차순으로 유지되어 맨 위 원소 하나만 보면 됩니다.',
      ],
      cons: ['스택에 값이 아니라 인덱스를 저장해야 어느 자리의 답인지 바로 적을 수 있습니다.'],
      whyThisRank:
        '정렬이나 힙 없이 스택 하나로 대기 원소의 최솟값을 O(1)에 확인하므로 시간과 코드 길이가 모두 최적입니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'next-greater-min-heap',
      name: '최소 힙 (우선순위 큐)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '대기 중인 원소를 (값, 인덱스) 최소 힙에 담아 작은 것부터 꺼내는 풀이로, 정답은 같지만 불필요한 힙 정렬 비용이 듭니다.',
      pros: [
        '"아직 답을 못 찾은 수 가운데 가장 작은 것부터 비교한다"는 발상을 우선순위 큐로 곧장 옮길 수 있습니다.',
      ],
      cons: [
        '넣고 꺼낼 때마다 O(log N)번의 힙 비교가 추가로 들어 단조 스택보다 느립니다.',
        'JavaScript에서는 내장 힙이 없어 직접 구현해야 하는 부담도 있습니다.',
      ],
      whyThisRank:
        '스택에 쌓기만 해도 작은 수가 그때그때 빠져나가 맨 위가 자동으로 최솟값이 되는데, 이를 깨닫지 못해 힙으로 O(N log N) 비용을 치르기 때문에 대안입니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'next-greater-nested-loop',
      name: '이중 반복문으로 매번 오른쪽 훑기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '원소마다 오른쪽을 끝까지 훑어, 내림차순 구간에서 똑같은 원소들을 되풀이해 비교하다 시간 초과가 나는 풀이입니다.',
      pros: ['코드가 직관적이고 작은 예제에서는 답이 맞습니다.'],
      cons: [
        'numbers가 내림차순이면 매 원소마다 끝까지 다 확인해야 해서 N(N-1)/2번 비교합니다.',
        'N이 최대 1,000,000이므로 최악 약 5,000억 번 연산해 반드시 시간 초과가 납니다.',
      ],
      whyThisRank:
        'N ≤ 1,000,000 제한에서는 O(N²) 풀이가 절대 통과할 수 없습니다. 이미 확인한 작은 수들을 스택으로 한 번에 처리해야 합니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [[2, 3, 3, 5]], expected: [3, 5, 5, -1] },
      { args: [[9, 1, 5, 3, 6, 2]], expected: [-1, 5, 6, 6, -1, -1] },
      { args: [[5, 4, 3, 2]], expected: [-1, -1, -1, -1] },
      { args: [[1, 2, 3, 4]], expected: [2, 3, 4, -1] },
      { args: [[4, 4, 4, 4]], expected: [-1, -1, -1, -1] },
      { args: [NUMBERS], expected: TRUTH },
    ],
    random: (rand) => {
      const n = 4 + Math.floor(rand() * 5);
      const numbers = Array.from({ length: n }, () => 1 + Math.floor(rand() * 9));
      return [numbers];
    },
  },
};

export default problem;
