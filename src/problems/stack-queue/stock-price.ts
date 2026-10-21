// 주식가격: 정석 단조 스택, 대안 이중 반복문(첫 하락에서 break), 함정 가격이 유지될 때만 세고 하락하는 1초를 빼먹기를 같은 장면에서 움직인다.
// 장면은 위에서부터 초별 가격 줄 · 유지 기간(answer) 줄 · 단조 스택 줄이다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { slots } from '../../engine/layout.ts';
import type { Action, Item, Problem, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';

// 시각화 입력. 1초(4→3), 2초(3→5→2), 3초(5→2)에서 가격이 떨어져 정석은 [5, 1, 2, 1, 1, 0],
// 떨어지는 그 1초를 빼먹는 함정은 [5, 0, 1, 0, 1, 0]이 나온다.
const PRICES = [2, 4, 3, 5, 2, 4];
const N = PRICES.length;
const TRUTH = [5, 1, 2, 1, 1, 0];

const list = (xs: (number | string)[]) => `[${xs.join(', ')}]`;
const secLabel = (i: number) => `${i}초(${PRICES[i]})`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  python: `def solution(prices):
    n = len(prices)
    # 끝까지 가격이 안 떨어졌을 때의 기간으로 초기화
    answer = [n - 1 - i for i in range(n)]
    stack = []  # 아직 가격이 떨어지지 않은 시점(인덱스)

    for i, price in enumerate(prices):
        while stack and prices[stack[-1]] > price:
            top = stack.pop()
            answer[top] = i - top  # 가격이 떨어진 시점까지의 초
        stack.append(i)

    return answer`,
  javascript: `function solution(prices) {
  const n = prices.length;
  // 끝까지 가격이 안 떨어졌을 때의 기간으로 초기화
  const answer = prices.map((_, i) => n - 1 - i);
  const stack = []; // 아직 가격이 떨어지지 않은 시점(인덱스)

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && prices[stack[stack.length - 1]] > prices[i]) {
      const top = stack.pop();
      answer[top] = i - top; // 가격이 떨어진 시점까지의 초
    }
    stack.push(i);
  }

  return answer;
}`,
};
const BEST_AT = {
  init: lines(BEST_CODE, ['answer = [n - 1 - i', 'stack = []'], ['const answer = prices.map', 'const stack = []']),
  check: lines(BEST_CODE, ['for i, price in enumerate(prices):', 'while stack and prices[stack[-1]] > price:'], ['for (let i = 0; i < n; i++)', 'while (stack.length > 0 && prices[stack[stack.length - 1]] > prices[i])']),
  pop: lines(BEST_CODE, ['top = stack.pop()', 'answer[top] = i - top'], ['const top = stack.pop()', 'answer[top] = i - top']),
  push: lines(BEST_CODE, ['stack.append(i)'], ['stack.push(i)']),
  done: lines(BEST_CODE, ['return answer'], ['return answer;']),
};

const ALT_CODE = {
  python: `def solution(prices):
    n = len(prices)
    answer = [0] * n

    for i in range(n):
        for j in range(i + 1, n):
            answer[i] += 1            # 다음 초까지 1초 경과
            if prices[j] < prices[i]: # 가격이 떨어지면 즉시 멈춤
                break

    return answer`,
  javascript: `function solution(prices) {
  const n = prices.length;
  const answer = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      answer[i] += 1; // 다음 초까지 1초 경과
      if (prices[j] < prices[i]) break; // 가격이 떨어지면 즉시 멈춤
    }
  }

  return answer;
}`,
};
const ALT_AT = {
  init: lines(ALT_CODE, ['answer = [0] * n'], ['const answer = new Array(n).fill(0)']),
  scan: lines(ALT_CODE, ['for i in range(n):', 'for j in range(i + 1, n):', 'answer[i] += 1'], ['for (let i = 0; i < n; i++)', 'for (let j = i + 1; j < n; j++)', 'answer[i] += 1']),
  drop: lines(ALT_CODE, ['if prices[j] < prices[i]:', 'break'], ['if (prices[j] < prices[i]) break']),
  done: lines(ALT_CODE, ['return answer'], ['return answer;']),
};

const TRAP_CODE = {
  python: `def solution(prices):
    n = len(prices)
    answer = [0] * n

    for i in range(n):
        for j in range(i + 1, n):
            # 함정: 가격이 이상일 때만 +1을 해서 떨어지는 그 1초를 빼먹음
            if prices[j] >= prices[i]:
                answer[i] += 1
            else:
                break

    return answer`,
  javascript: `function solution(prices) {
  const n = prices.length;
  const answer = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // 함정: 가격이 이상일 때만 +1을 해서 떨어지는 그 1초를 빼먹음
      if (prices[j] >= prices[i]) {
        answer[i] += 1;
      } else {
        break;
      }
    }
  }

  return answer;
}`,
};
const TRAP_AT = {
  init: lines(TRAP_CODE, ['answer = [0] * n'], ['const answer = new Array(n).fill(0)']),
  keep: lines(TRAP_CODE, ['if prices[j] >= prices[i]:', 'answer[i] += 1'], ['if (prices[j] >= prices[i])', 'answer[i] += 1']),
  drop: lines(TRAP_CODE, ['else:', 'break'], ['} else {', 'break;']),
  done: lines(TRAP_CODE, ['return answer'], ['return answer;']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const X0 = 84;
const CELL_W = 66;
const GAP = 8;
const priceSlot = slots({ x: X0, y: 0, w: CELL_W, h: 48, gap: GAP });
const ANS_Y = 78;
const ansSlot = slots({ x: X0, y: ANS_Y, w: CELL_W, h: 48, gap: GAP });
const STACK_Y = 156;
const LANE_W = N * (CELL_W + GAP) - GAP + 8;
const W = X0 + LANE_W + 152;
const H = STACK_Y + 56;

const STACK_LANE: LaneOptions = { id: 'stack', x: X0, y: STACK_Y + 4, slotW: CELL_W, slotH: 44, gap: GAP, max: N };

const pId = (i: number) => `p:${i}`;
const ansId = (i: number) => `ans:${i}`;
const tokId = (i: number) => `stk:${i}`;

const rowLabel = (id: string, text: string, y: number, h: number): Item => ({
  id,
  kind: 'text',
  rect: { x: 0, y, w: 76, h },
  text,
});

function board(bottomLabel: string): Scene {
  const items: Item[] = [
    rowLabel('row:p', '가격', 0, 48),
    rowLabel('row:ans', '유지 초', ANS_Y, 48),
    rowLabel('row:stk', bottomLabel, STACK_Y, 52),
    { id: 'stk:bg', kind: 'zone', rect: { x: X0 - 4, y: STACK_Y, w: LANE_W, h: 52 } },
  ];
  for (let i = 0; i < N; i++) {
    items.push(
      { id: pId(i), kind: 'cell', rect: priceSlot(i), tone: 'plain', text: String(PRICES[i]), tag: `${i}초` },
      { id: ansId(i), kind: 'cell', rect: ansSlot(i), tone: 'plain', text: '-', tag: `${i}초` },
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
  const sLane = new Lane(rec, STACK_LANE);

  const answer = PRICES.map((_, i) => N - 1 - i);
  const stack: number[] = [];
  let comparisons = 0;
  let curI: number | string = '-';

  const meta = () => ({
    work: comparisons,
    variables: {
      i: curI,
      stack: list(stack.map(secLabel)),
      answer: list(answer),
    },
  });

  rec.step({
    title: `끝까지 유지될 때의 기간 ${list(answer)}으로 초기화`,
    codeHighlights: BEST_AT.init,
    ...meta(),
  });
  rec.phase(
    '초기화',
    `끝까지 가격이 안 떨어지면 유지 기간은 (마지막 초 - 현재 초)입니다. 먼저 ${list(answer)}로 채워 두고, 가격이 떨어지는 시점만 스택에서 꺼내 고칩니다.`,
  );
  rec.do(
    ...together(
      answer.map((v, i): Action => ({ type: 'set', id: ansId(i), patch: { text: `${v}초`, tone: 'queued' }, pop: true })),
    ),
    wait(600),
  );

  for (let i = 0; i < N; i++) {
    const price = PRICES[i];
    curI = i;

    while (stack.length > 0 && PRICES[stack.at(-1)!] > price) {
      const top = stack.pop()!;
      const topPrice = PRICES[top];
      comparisons++;
      answer[top] = i - top;

      rec.step({
        title: `${i}초(가격 ${price}): 스택 맨 위 ${top}초(${topPrice}) 하락 → ${i - top}초 확정`,
        codeHighlights: BEST_AT.pop,
        ...meta(),
      });
      rec.phase(
        '하락 비교',
        `현재 ${i}초 가격 ${josa(price, '이', '가')} 스택 맨 위 ${top}초의 가격 ${topPrice}보다 작아 가격이 떨어졌습니다.`,
        BEST_AT.check,
      );
      rec.do(
        { type: 'focus', ids: [pId(i), pId(top), tokId(top), ansId(top)] },
        paint(pId(i), 'current'),
        { type: 'arrow', from: pId(i), to: pId(top), verdict: 'bad', label: `${price} < ${topPrice}` },
        wait(260),
      );
      rec.phase(
        '꺼내서 확정',
        `${top}초를 스택에서 꺼내고 유지 기간을 ${i} - ${top} = ${i - top}초로 확정합니다.`,
        BEST_AT.pop,
      );
      sLane.pop(ansId(top));
      rec.do(
        ...together(
          [
            { type: 'set', id: ansId(top), patch: { text: `${i - top}초`, tone: 'visited' }, pop: true },
            paint(pId(top), 'visited'),
            ...clear(),
          ],
          true,
        ),
        wait(260),
      );
    }

    const prevTop = stack.at(-1);
    if (prevTop !== undefined) comparisons++;
    stack.push(i);

    rec.step({
      title:
        prevTop === undefined
          ? `${i}초(가격 ${price}): 빈 스택에 넣기`
          : `${i}초(가격 ${price}): ${prevTop}초(${PRICES[prevTop]}) ≤ ${price} 유지 → 스택에 넣기`,
      codeHighlights: BEST_AT.push,
      ...meta(),
    });
    if (prevTop !== undefined) {
      rec.phase(
        '유지 확인',
        `스택 맨 위 ${prevTop}초(${PRICES[prevTop]}) ≤ 현재 ${i}초(${price})이므로 가격이 떨어지지 않았습니다.`,
        BEST_AT.check,
      );
      rec.do(
        { type: 'focus', ids: [pId(prevTop), pId(i), tokId(prevTop)] },
        paint(pId(i), 'current'),
        { type: 'arrow', from: pId(prevTop), to: pId(i), verdict: 'good', label: `${PRICES[prevTop]} ≤ ${price}` },
        wait(250),
      );
    }
    rec.phase('스택에 넣기', `${i}초(${price})를 스택에 넣고 다음 초로 넘어갑니다.`, BEST_AT.push);
    sLane.push({ id: tokId(i), text: secLabel(i), tone: 'queued' }, pId(i));
    rec.do(...together([paint(pId(i), 'queued'), ...clear()], true), wait(240));
  }

  rec.step({
    title: `스택에 남은 ${list(stack.map((idx) => `${idx}초`))}는 끝까지 유지 — 정답 ${list(answer)}`,
    codeHighlights: BEST_AT.done,
    ...meta(),
    answer: [...answer],
    isKeyframe: true,
  });
  rec.phase(
    '마무리',
    `스택에 남아 있는 0초, 4초, 5초는 끝까지 가격이 떨어지지 않았으므로 처음 적어 둔 기간이 그대로 정답 ${list(answer)}입니다.`,
    BEST_AT.done,
  );
  rec.do(
    ...together([
      ...Array.from({ length: N }, (_, i) => paint(ansId(i), 'path')),
      ...Array.from({ length: N }, (_, i) => paint(pId(i), 'visited')),
      ...sLane.ids.map((id) => paint(id, 'path')),
    ]),
    wait(400),
  );

  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 이중 반복문 (1초씩 더하며 첫 하락에서 break)                     */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new StepRecorder(board('비교 메모'));
  const answer = new Array<number>(N).fill(0);
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
    title: 'answer를 모두 0으로 두고 0초부터 차례대로 뒤쪽 훑기',
    codeHighlights: ALT_AT.init,
    ...meta(),
  });
  rec.phase('초기화', '스택 없이 시점 i마다 뒤쪽 시점 j를 하나씩 비교해 떨어지는 순간 멈추는 이중 반복문 풀이입니다.');
  rec.do(
    ...together(answer.map((_, i): Action => ({ type: 'set', id: ansId(i), patch: { text: '0초' }, pop: true }))),
    wait(500),
  );

  for (let i = 0; i < N; i++) {
    curI = i;
    const inspected: number[] = [];
    let droppedAt: number | undefined;
    for (let j = i + 1; j < N; j++) {
      inspected.push(j);
      comparisons++;
      answer[i]++;
      if (PRICES[j] < PRICES[i]) {
        droppedAt = j;
        break;
      }
    }
    const last = i === N - 1;

    rec.step({
      title: last
        ? `5초(가격 4): 뒤쪽 시점 없음 → 0초 — 정답 ${list(answer)}`
        : droppedAt !== undefined
          ? `${i}초(가격 ${PRICES[i]}): ${droppedAt}초(${PRICES[droppedAt]})에서 하락 → ${answer[i]}초`
          : `${i}초(가격 ${PRICES[i]}): 끝까지 안 떨어짐 (${inspected.length}번 비교) → ${answer[i]}초`,
      codeHighlights: last ? ALT_AT.done : droppedAt !== undefined ? ALT_AT.drop : ALT_AT.scan,
      ...meta(),
      ...(last ? { answer: [...answer], isKeyframe: true } : {}),
    });

    rec.phase(
      '뒤쪽 훑기',
      last
        ? `마지막 5초는 뒤에 남은 시점이 없어 유지 기간이 0초입니다. 전체 정답은 ${list(answer)}입니다.`
        : droppedAt !== undefined
          ? `${i}초(${PRICES[i]}) 뒤를 훑다가 ${droppedAt}초(${PRICES[droppedAt]})에서 가격이 떨어져 멈춥니다. 거기까지 걸린 ${answer[i]}초를 기록합니다.`
          : `${i}초(${PRICES[i]}) 뒤의 ${inspected.length}개 시점을 끝까지 다 비교해 ${answer[i]}초를 기록합니다.`,
      last ? ALT_AT.done : droppedAt !== undefined ? ALT_AT.drop : ALT_AT.scan,
    );

    if (inspected.length > 0) {
      rec.do({ type: 'focus', ids: [pId(i), ansId(i), ...inspected.map(pId)] }, paint(pId(i), 'current'));
      for (const j of inspected) {
        const drop = PRICES[j] < PRICES[i];
        rec.do({
          type: 'arrow',
          from: pId(i),
          to: pId(j),
          verdict: drop ? 'bad' : 'good',
          label: drop ? `${PRICES[j]} < ${PRICES[i]} 멈춤` : `${PRICES[j]} ≥ ${PRICES[i]}`,
        });
      }
      rec.do(
        { type: 'set', id: ansId(i), patch: { text: `${answer[i]}초`, tone: 'visited' }, pop: true },
        wait(260),
        ...together([paint(pId(i), 'visited'), ...clear()]),
      );
    } else {
      rec.do(
        ...together([
          ...Array.from({ length: N }, (_, k) => paint(ansId(k), 'path', `${answer[k]}초`)),
          paint(pId(i), 'visited'),
        ]),
        wait(400),
      );
    }
  }

  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: 가격이 유지될 때만 +1을 해 떨어지는 1초를 빼먹기                  */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new StepRecorder(board('오답 원인'));
  const answer = new Array<number>(N).fill(0);
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
    title: 'answer를 0으로 두고 prices[j] >= prices[i]일 때만 +1 세기',
    codeHighlights: TRAP_AT.init,
    ...meta(),
  });
  rec.phase(
    '초기화',
    '가격이 떨어지지 않은 기간이라는 말만 보고 prices[j] >= prices[i]일 때만 +1을 하고, 작아지면 더하지 않고 바로 break하는 흔한 실수입니다.',
  );
  rec.do(
    ...together(answer.map((_, i): Action => ({ type: 'set', id: ansId(i), patch: { text: '0초' }, pop: true }))),
    wait(500),
  );

  for (let i = 0; i < N - 1; i++) {
    curI = i;
    const inspected: number[] = [];
    let droppedAt: number | undefined;
    for (let j = i + 1; j < N; j++) {
      inspected.push(j);
      comparisons++;
      if (PRICES[j] >= PRICES[i]) {
        answer[i]++;
      } else {
        droppedAt = j;
        break;
      }
    }
    const wrongHere = answer[i] !== TRUTH[i];

    rec.step({
      title: wrongHere
        ? `${i}초(가격 ${PRICES[i]}): ${droppedAt}초까지 1초를 빼먹어 ${answer[i]}초 기록 (정답은 ${TRUTH[i]}초)`
        : `${i}초(가격 ${PRICES[i]}): 끝까지 안 떨어져 ${answer[i]}초 기록`,
      codeHighlights: droppedAt !== undefined ? TRAP_AT.drop : TRAP_AT.keep,
      ...meta(),
    });
    rec.phase(
      wrongHere ? '1초 누락' : '유지 확인',
      wrongHere
        ? `${droppedAt}초(${PRICES[droppedAt!]})에서 가격이 떨어지자 +1을 하지 않고 바로 break해서, 떨어지기까지 걸린 1초가 빠진 ${answer[i]}초가 됩니다.`
        : `뒤쪽 시점이 모두 ${PRICES[i]} 이상이라 ${answer[i]}초가 그대로 맞습니다.`,
      droppedAt !== undefined ? TRAP_AT.drop : TRAP_AT.keep,
    );
    rec.do({ type: 'focus', ids: [pId(i), ansId(i), ...inspected.map(pId)] }, paint(pId(i), 'current'));
    for (const j of inspected) {
      const drop = PRICES[j] < PRICES[i];
      rec.do({
        type: 'arrow',
        from: pId(i),
        to: pId(j),
        verdict: drop ? 'bad' : 'good',
        label: drop ? `${PRICES[j]} < ${PRICES[i]} (+0)` : `${PRICES[j]} ≥ ${PRICES[i]} (+1)`,
      });
    }
    rec.do(
      { type: 'set', id: ansId(i), patch: { text: `${answer[i]}초`, tone: wrongHere ? 'bad' : 'visited' }, pop: true },
      wait(260),
      ...together([paint(pId(i), 'visited'), ...clear()]),
    );
  }

  curI = N - 1;
  rec.step({
    title: `오답 확인: 이 풀이는 ${list(answer)}, 정답은 ${list(TRUTH)}`,
    codeHighlights: TRAP_AT.done,
    ...meta(),
    answer: [...answer],
    isKeyframe: true,
  });
  rec.phase(
    '오답 확인',
    `바로 다음 초에 가격이 떨어져도 그 1초 동안은 가격이 유지된 것으로 세어야 합니다. 1·2·3초에서 1초씩 빠져 오답 ${list(answer)}이 나왔습니다.`,
    TRAP_AT.done,
  );
  const rightX = X0 + LANE_W + 8;
  rec.do(
    ...together([
      {
        type: 'add',
        item: { id: 'wrong', kind: 'token', rect: { x: rightX, y: STACK_Y, w: 140, h: 24 }, tone: 'bad', text: `오답 ${list(answer)}` },
      },
      {
        type: 'add',
        item: { id: 'truth', kind: 'token', rect: { x: rightX, y: STACK_Y + 28, w: 140, h: 24 }, tone: 'good', text: `정답 ${list(TRUTH)}` },
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
  id: 'stock-price',
  title: '주식가격',
  level: 2,
  category: 'stack-queue',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42584',
  description: {
    summary:
      '초 단위로 기록된 주식가격 배열 prices가 주어질 때, 각 시점의 가격이 떨어지지 않고 유지된 기간이 몇 초인지 구합니다. 바로 다음 초에 가격이 떨어져도 1초 동안은 유지된 것으로 셉니다.',
    rules: [
      'prices의 각 가격은 1 이상 10,000 이하인 자연수',
      'prices의 길이는 2 이상 100,000 이하',
    ],
    examples: [{ input: 'prices = [1, 2, 3, 2, 3]', output: '[4, 3, 1, 1, 0]' }],
  },
  keyIntuitions: [
    '바로 다음 초에 가격이 떨어져도 그 시점까지 흐른 1초를 포함하므로, 시점 top의 가격이 시점 i에서 처음 떨어졌다면 유지 기간은 정확히 i - top초입니다.',
    '아직 가격이 떨어지지 않은 시점들을 스택에 모아 두면 스택 안의 가격은 자연스럽게 오름차순(비내림차순)을 이룹니다.',
    '새 가격이 들어왔을 때 스택 맨 위보다 작으면 떨어졌다는 뜻이므로, 작지 않을 때까지 꺼내며 i - top으로 답을 한꺼번에 확정합니다.',
  ],
  demo: { input: [PRICES], label: 'prices = [2, 4, 3, 5, 2, 4]' },
  workUnit: '가격 비교 횟수',
  approaches: [
    {
      id: 'stock-monotonic-stack',
      name: '단조 스택',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '아직 떨어지지 않은 시점을 스택에 모아 두었다가, 더 작은 가격이 나올 때만 꺼내어 i - top으로 확정하는 O(N) 풀이입니다.',
      pros: [
        '모든 시점이 스택에 한 번 들어가고 최대 한 번 나오므로 전체 비교 횟수가 O(N)입니다.',
        'prices 길이가 100,000이어도 순식간에 끝납니다.',
      ],
      cons: ['스택에 가격 자체가 아니라 시점(인덱스)을 넣어야 기간 i - top을 바로 구할 수 있습니다.'],
      whyThisRank:
        '중복 비교 없이 한 번의 순회로 모든 시점의 첫 하락 위치를 찾아내어 시간 복잡도가 가장 낮습니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'stock-nested-loop',
      name: '이중 반복문 (첫 하락에서 break)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '시점마다 뒤쪽을 차례로 보며 1초씩 더하다가 가격이 떨어지면 멈추는 풀이로, 직관적이지만 가격이 안 떨어지는 구간을 매번 다시 훑습니다.',
      pros: [
        '스택 없이 이중 반복문과 break만으로 구현할 수 있어 코드가 단순합니다.',
        '초반에 가격이 빨리 떨어지는 입력에서는 일찍 멈춥니다.',
      ],
      cons: [
        '가격이 계속 오르거나 유지되면 매 시점마다 끝까지 다 훑어야 해서 최대 N(N-1)/2번(약 50억 번) 비교합니다.',
      ],
      whyThisRank:
        '정답은 같지만 이미 확인한 오름차순 구간을 시점마다 되풀이해 비교하므로 정석(단조 스택)보다 비교 횟수가 훨씬 많습니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'stock-miss-drop-second',
      name: '유지될 때만 +1 하고 하락 시 바로 break',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: 'prices[j] >= prices[i]일 때만 +1을 해서, 가격이 떨어지기까지 걸린 마지막 1초를 빼먹는 가장 흔한 오답입니다.',
      pros: ['"가격이 떨어지지 않은 기간"이라는 문장을 그대로 조건문으로 옮긴 형태라 처음 떠올리기 쉽습니다.'],
      cons: [
        '예를 들어 3에서 바로 다음 초에 2로 떨어지면 1초 동안은 유지된 것인데 0초라고 답합니다.',
        '중간에 가격이 한 번이라도 떨어지는 모든 시점에서 답이 1초씩 모자랍니다.',
      ],
      whyThisRank:
        '다음 초 j를 확인하는 순간 이미 1초가 흐른 것이므로, 먼저 1초를 더한 뒤 하락 여부를 검사하거나 i - top으로 계산해야 합니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [[1, 2, 3, 2, 3]], expected: [4, 3, 1, 1, 0] },
      { args: [[5, 4, 3, 2, 1]], expected: [1, 1, 1, 1, 0] },
      { args: [[1, 2, 3, 4, 5]], expected: [4, 3, 2, 1, 0] },
      { args: [[3, 3, 3]], expected: [2, 1, 0] },
      { args: [PRICES], expected: TRUTH },
    ],
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 7);
      const prices = Array.from({ length: n }, () => 1 + Math.floor(rand() * 9));
      return [prices];
    },
  },
};

export default problem;
