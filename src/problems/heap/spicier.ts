// 더 맵게: 정석 최소 힙, 대안 섞을 때마다 다시 정렬하기, 함정 처음 한 번만 정렬하고 앞에서부터 섞기(오답)를 같은 장면에서 움직인다.
// 장면은 위에 현재 줄(힙 또는 배열) 칸들, 가운데에 꺼낸 두 음식을 섞는 작업대(첫째, 둘째, 섞은 결과), 아래에 목표 지수 K와 섞은 횟수 표시다.
import { slots } from '../../engine/layout.ts';
import type { Action, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';

// 시각화 입력. 정석과 대안은 4번 섞어 모든 음식을 15 이상으로 만들고, 함정은 새로 만든 음식이 뒤 음식보다 커진 줄 모르고 3번 만에 멈춰 틀린다.
const SCOVILLE = [1, 2, 3, 4, 5, 8];
const K = 15;
const N = SCOVILLE.length;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const HEAP = {
  python: `import heapq

def solution(scoville, K):
    heap = list(scoville)
    heapq.heapify(heap)  # 최소 힙으로 만들기
    answer = 0

    while heap[0] < K:
        if len(heap) < 2:
            return -1
        first = heapq.heappop(heap)
        second = heapq.heappop(heap)
        mixed = first + second * 2
        heapq.heappush(heap, mixed)
        answer += 1

    return answer`,
  javascript: `function solution(scoville, K) {
  const heap = [...scoville];
  const siftDown = (i) => {
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      let m = i;
      if (l < heap.length && heap[l] < heap[m]) m = l;
      if (r < heap.length && heap[r] < heap[m]) m = r;
      if (m === i) return;
      [heap[i], heap[m]] = [heap[m], heap[i]];
      i = m;
    }
  };
  for (let i = heap.length >> 1; i >= 0; i--) siftDown(i); // 최소 힙으로 만들기
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) { heap[0] = last; siftDown(0); }
    return top;
  };
  const push = (v) => {
    heap.push(v);
    for (let i = heap.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };

  let answer = 0;
  while (heap[0] < K) {
    if (heap.length < 2) return -1;
    const first = pop();
    const second = pop();
    const mixed = first + second * 2;
    push(mixed);
    answer++;
  }
  return answer;
}`,
};
const HEAP_AT = {
  init: lines(HEAP, ['heap = list(scoville)', 'heapq.heapify(heap)', 'answer = 0'], ['const heap = [...scoville]', 'for (let i = heap.length >> 1', 'let answer = 0']),
  check: lines(HEAP, ['while heap[0] < K'], ['while (heap[0] < K)']),
  pop: lines(HEAP, ['first = heapq.heappop(heap)', 'second = heapq.heappop(heap)'], ['const first = pop()', 'const second = pop()']),
  mix: lines(HEAP, ['mixed = first + second * 2'], ['const mixed = first + second * 2']),
  push: lines(HEAP, ['heapq.heappush(heap, mixed)', 'answer += 1'], ['push(mixed)', 'answer++']),
  done: lines(HEAP, ['while heap[0] < K', 'return answer'], ['while (heap[0] < K)', 'return answer']),
};

const RESORT = {
  python: `def solution(scoville, K):
    arr = sorted(scoville)
    answer = 0

    while arr[0] < K:
        if len(arr) < 2:
            return -1
        first = arr.pop(0)
        second = arr.pop(0)
        arr.append(first + second * 2)
        arr.sort()  # 섞을 때마다 배열 전체를 다시 정렬
        answer += 1

    return answer`,
  javascript: `function solution(scoville, K) {
  const arr = [...scoville].sort((a, b) => a - b);
  let answer = 0;

  while (arr[0] < K) {
    if (arr.length < 2) return -1;
    const first = arr.shift();
    const second = arr.shift();
    arr.push(first + second * 2);
    arr.sort((a, b) => a - b); // 섞을 때마다 배열 전체를 다시 정렬
    answer++;
  }
  return answer;
}`,
};
const RESORT_AT = {
  init: lines(RESORT, ['arr = sorted(scoville)', 'answer = 0'], ['const arr = [...scoville].sort', 'let answer = 0']),
  pop: lines(RESORT, ['while arr[0] < K', 'first = arr.pop(0)', 'second = arr.pop(0)'], ['while (arr[0] < K)', 'const first = arr.shift()', 'const second = arr.shift()']),
  sort: lines(RESORT, ['arr.append(first + second * 2)', 'arr.sort()', 'answer += 1'], ['arr.push(first + second * 2)', 'arr.sort((a, b) => a - b)', 'answer++']),
  done: lines(RESORT, ['while arr[0] < K', 'return answer'], ['while (arr[0] < K)', 'return answer']),
};

const ONCE = {
  python: `def solution(scoville, K):
    arr = sorted(scoville)  # 처음 한 번만 정렬
    cur = arr[0]
    answer = 0

    for i in range(1, len(arr)):
        if cur >= K:
            return answer
        # 새로 섞은 cur가 다음 원소보다 클 수 있는데도 그대로 앞에서부터 섞는다
        cur = cur + arr[i] * 2
        answer += 1

    return answer if cur >= K else -1`,
  javascript: `function solution(scoville, K) {
  const arr = [...scoville].sort((a, b) => a - b); // 처음 한 번만 정렬
  let cur = arr[0];
  let answer = 0;

  for (let i = 1; i < arr.length; i++) {
    if (cur >= K) return answer;
    // 새로 섞은 cur가 다음 원소보다 클 수 있는데도 그대로 앞에서부터 섞는다
    cur = cur + arr[i] * 2;
    answer++;
  }
  return cur >= K ? answer : -1;
}`,
};
const ONCE_AT = {
  init: lines(ONCE, ['arr = sorted(scoville)', 'cur = arr[0]', 'answer = 0'], ['const arr = [...scoville].sort', 'let cur = arr[0]', 'let answer = 0']),
  check: lines(ONCE, ['for i in range(1, len(arr))', 'if cur >= K'], ['for (let i = 1; i < arr.length; i++)', 'if (cur >= K)']),
  mix: lines(ONCE, ['cur = cur + arr[i] * 2', 'answer += 1'], ['cur = cur + arr[i] * 2', 'answer++']),
  done: lines(ONCE, ['if cur >= K', 'return answer'], ['if (cur >= K) return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 540;
const H = 280;
const slotRect = slots({ x: 88, y: 24, w: 62, h: 48, gap: 10 });
const MIX_A: Rect = { x: 112, y: 120, w: 80, h: 48 };
const MIX_B: Rect = { x: 224, y: 120, w: 80, h: 48 };
const MIX_OUT: Rect = { x: 364, y: 120, w: 96, h: 48 };
const GOAL_RECT: Rect = { x: 88, y: 214, w: 128, h: 40 };
const MIN_RECT: Rect = { x: 232, y: 214, w: 136, h: 40 };
const ANS_RECT: Rect = { x: 384, y: 214, w: 120, h: 40 };

interface Food { id: string; val: number }

function board(rowLabel: string): Scene {
  return {
    width: W,
    height: H,
    items: [
      { id: 'lab:row', kind: 'text', rect: { x: 0, y: 24, w: 80, h: 48 }, text: rowLabel },
      { id: 'row:zone', kind: 'zone', rect: { x: 82, y: 18, w: 444, h: 60 } },
      { id: 'lab:mix', kind: 'text', rect: { x: 0, y: 120, w: 80, h: 48 }, text: '섞기 작업대' },
      { id: 'slot:a', kind: 'zone', rect: MIX_A, tag: '가장 안 매움' },
      { id: 'plus', kind: 'text', rect: { x: 194, y: 120, w: 28, h: 48 }, text: '+' },
      { id: 'slot:b', kind: 'zone', rect: MIX_B, tag: '둘째 × 2' },
      { id: 'eq', kind: 'text', rect: { x: 308, y: 120, w: 52, h: 48 }, text: '→' },
      { id: 'slot:out', kind: 'zone', rect: MIX_OUT, tag: '새 음식' },
      { id: 'goal', kind: 'token', rect: GOAL_RECT, tone: 'plain', text: `K = ${K}`, tag: '목표 지수' },
      { id: 'min:tok', kind: 'token', rect: MIN_RECT, tone: 'plain', text: `최솟값 ${SCOVILLE[0]}`, tag: '맨 앞' },
      { id: 'ans:tok', kind: 'token', rect: ANS_RECT, tone: 'plain', text: '0번 섞음', tag: 'answer' },
    ],
  };
}

const cellTone = (v: number): Tone => (v >= K ? 'good' : 'queued');
const syncRow = (items: Food[]): Action[] =>
  items.map((f, idx): Action => ({ type: 'set', id: f.id, patch: { rect: slotRect(idx), tone: cellTone(f.val), text: String(f.val) } }));

/* ------------------------------------------------------------------ */
/* 정석 최소 힙: 최솟값 확인 → 두 개 꺼내 섞기 → 힙에 다시 넣기          */
/* ------------------------------------------------------------------ */

function minHeapViz(): Visualization {
  const rec = new StepRecorder(board('최소 힙'));
  const heap: Food[] = SCOVILLE.map((val, i) => ({ id: `f:${i}`, val }));
  let answer = 0;
  let work = 0;
  let seq = N;
  const meta = (extra: Record<string, string | number> = {}) => ({
    work,
    variables: { heap: `[${heap.map((x) => x.val).join(', ')}]`, K, answer, ...extra },
  });

  work = N;
  rec.step({ title: `음식 ${N}개를 최소 힙에 넣기`, codeHighlights: HEAP_AT.init, ...meta() });
  rec.phase('힙 만들기', `초기 음식 ${N}개를 최소 힙으로 만듭니다. 맨 앞(루트)에는 항상 가장 덜 매운 음식이 옵니다.`, HEAP_AT.init);
  rec.do(...together(heap.map((f, i): Action => ({
    type: 'add',
    item: { id: f.id, kind: 'cell', rect: slotRect(i), tone: cellTone(f.val), text: String(f.val) },
  }))));

  while (heap[0].val < K) {
    const a = heap.shift()!;
    const b = heap.shift()!;
    const mixedVal = a.val + b.val * 2;
    const mixed: Food = { id: `f:${seq++}`, val: mixedVal };
    answer++;
    work += 2; // 두 번 꺼내기(heappop 2번)

    rec.step({
      title: `${answer}번째 꺼내기: ${a.val}, ${b.val} → ${mixedVal}`,
      codeHighlights: HEAP_AT.mix,
      ...meta({ first: a.val, second: b.val, mixed: mixedVal }),
    });

    rec.phase('최솟값 확인', `맨 앞 음식의 지수가 ${a.val} < ${K}이므로 가장 덜 매운 두 음식 ${a.val}, ${josa(b.val, '을', '를')} 꺼냅니다.`, HEAP_AT.pop);
    rec.do({ type: 'focus', ids: [a.id, b.id] });
    rec.do({ type: 'arrow', from: 'min:tok', to: 'goal', verdict: 'bad', label: `${a.val} < ${K}` });
    rec.do(...together([
      { type: 'unfocus' },
      { type: 'clearMarks' },
      { type: 'set', id: a.id, patch: { rect: MIX_A, tone: 'current' } },
      { type: 'set', id: b.id, patch: { rect: MIX_B, tone: 'current' } },
      ...syncRow(heap),
    ]));

    rec.phase('섞기', `${a.val} + ${b.val} × 2 = ${mixedVal}인 새 음식을 만듭니다.`, HEAP_AT.mix);
    rec.do(...together([
      { type: 'remove', id: a.id, into: 'slot:out' },
      { type: 'remove', id: b.id, into: 'slot:out' },
      { type: 'add', item: { id: mixed.id, kind: 'cell', rect: MIX_OUT, tone: cellTone(mixedVal), text: String(mixedVal) }, from: 'slot:b' },
    ]));

    heap.push(mixed);
    heap.sort((x, y) => x.val - y.val);
    const insertedIdx = heap.indexOf(mixed);
    work += 1; // 한 번 넣기(heappush)

    rec.step({
      title: `${answer}번째 넣기: ${josa(mixedVal, '을', '를')} 힙에 넣고 최솟값 ${heap[0].val} 확인`,
      codeHighlights: HEAP_AT.push,
      ...meta({ first: a.val, second: b.val, mixed: mixedVal }),
    });

    rec.phase('힙에 넣기', `새 음식 ${josa(mixedVal, '을', '를')} 힙에 넣으면 부모·자식만 비교해 제자리(${insertedIdx + 1}번째)로 들어갑니다.`, HEAP_AT.push);
    rec.do(...together([
      ...syncRow(heap),
      { type: 'set', id: 'min:tok', patch: { text: `최솟값 ${heap[0].val}`, tone: heap[0].val >= K ? 'good' : 'plain' }, pop: true },
      { type: 'set', id: 'ans:tok', patch: { text: `${answer}번 섞음`, tone: 'chosen' }, pop: true },
    ]));

    rec.phase('조건 확인', heap[0].val >= K
      ? `이제 맨 앞 최솟값이 ${heap[0].val} ≥ ${K}이므로 모든 음식이 ${K} 이상입니다.`
      : `맨 앞 최솟값이 ${heap[0].val} < ${K}이므로 한 번 더 섞어야 합니다.`, HEAP_AT.check);
    rec.do({ type: 'focus', ids: [heap[0].id] });
    rec.do({ type: 'unfocus' });
  }

  rec.step({ title: `모두 ${K} 이상 달성 → ${answer}번`, codeHighlights: HEAP_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `맨 앞 최솟값이 ${heap[0].val} ≥ ${K}이므로 모든 음식이 ${K} 이상입니다. 최소 ${answer}번 섞었습니다.`, HEAP_AT.done);
  rec.do({ type: 'arrow', from: 'min:tok', to: 'goal', verdict: 'good', label: `${heap[0].val} ≥ ${K}` });
  rec.do(...together([
    ...heap.map((f): Action => ({ type: 'set', id: f.id, patch: { tone: 'path' } })),
    { type: 'set', id: 'ans:tok', patch: { tone: 'path' }, pop: true },
  ]));
  rec.do({ type: 'clearMarks' });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 매번 다시 정렬: 두 개 꺼내 섞기 → 전체 다시 정렬하기             */
/* ------------------------------------------------------------------ */

function resortViz(): Visualization {
  const rec = new StepRecorder(board('정렬 배열'));
  const arr: Food[] = SCOVILLE.map((val, i) => ({ id: `f:${i}`, val }));
  let answer = 0;
  let work = N;
  let seq = N;
  const meta = (extra: Record<string, string | number> = {}) => ({
    work,
    variables: { arr: `[${arr.map((x) => x.val).join(', ')}]`, K, answer, ...extra },
  });

  rec.step({ title: `음식 ${N}개를 오름차순 정렬하기`, codeHighlights: RESORT_AT.init, ...meta() });
  rec.phase('정렬하기', `처음 음식 ${N}개를 오름차순으로 정렬합니다.`, RESORT_AT.init);
  rec.do(...together(arr.map((f, i): Action => ({
    type: 'add',
    item: { id: f.id, kind: 'cell', rect: slotRect(i), tone: cellTone(f.val), text: String(f.val) },
  }))));

  while (arr[0].val < K) {
    const a = arr.shift()!;
    const b = arr.shift()!;
    const mixedVal = a.val + b.val * 2;
    const mixed: Food = { id: `f:${seq++}`, val: mixedVal };
    arr.push(mixed);
    arr.sort((x, y) => x.val - y.val);
    answer++;
    work += arr.length * 2; // shift 2번 + 전체 재정렬 비용

    rec.step({
      title: `${answer}번째 섞기 후 배열 전체 다시 정렬`,
      codeHighlights: RESORT_AT.sort,
      ...meta({ first: a.val, second: b.val, mixed: mixedVal }),
    });

    rec.phase('꺼내어 섞기', `맨 앞 두 음식 ${a.val}, ${josa(b.val, '을', '를')} 꺼내 ${a.val} + ${b.val} × 2 = ${mixedVal}로 섞습니다.`, RESORT_AT.pop);
    rec.do(...together([
      { type: 'set', id: a.id, patch: { rect: MIX_A, tone: 'current' } },
      { type: 'set', id: b.id, patch: { rect: MIX_B, tone: 'current' } },
      ...syncRow(arr.filter((x) => x.id !== mixed.id)),
    ]));
    rec.do(...together([
      { type: 'remove', id: a.id, into: 'slot:out' },
      { type: 'remove', id: b.id, into: 'slot:out' },
      { type: 'add', item: { id: mixed.id, kind: 'cell', rect: MIX_OUT, tone: cellTone(mixedVal), text: String(mixedVal) }, from: 'slot:b' },
    ]));

    rec.phase('다시 정렬', `새 음식 ${josa(mixedVal, '을', '를')} 넣고 남은 ${arr.length}개를 처음부터 다시 정렬합니다.`, RESORT_AT.sort);
    rec.do(...together([
      ...syncRow(arr),
      { type: 'set', id: 'min:tok', patch: { text: `최솟값 ${arr[0].val}`, tone: arr[0].val >= K ? 'good' : 'plain' }, pop: true },
      { type: 'set', id: 'ans:tok', patch: { text: `${answer}번 섞음`, tone: 'chosen' }, pop: true },
    ]));
  }

  rec.step({ title: `모두 ${K} 이상 달성 → ${answer}번 (매번 재정렬)`, codeHighlights: RESORT_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `답은 ${answer}번으로 같지만 섞을 때마다 배열을 밀고 다시 정렬해 연산이 ${work}번 들었습니다. N이 100만이면 시간 초과입니다.`, RESORT_AT.done);
  rec.do(...together([
    ...arr.map((f): Action => ({ type: 'set', id: f.id, patch: { tone: 'path' } })),
    { type: 'set', id: 'ans:tok', patch: { tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 한 번만 정렬하고 앞에서부터 섞기(오답)                            */
/* ------------------------------------------------------------------ */

function sortOnceViz(): Visualization {
  const rec = new StepRecorder(board('초기 정렬 줄'));
  const arr: Food[] = SCOVILLE.map((val, i) => ({ id: `f:${i}`, val }));
  let cur = arr[0];
  let answer = 0;
  let work = N;
  let seq = N;
  const currentLine = () => [cur, ...arr.slice(answer + 1)];
  const meta = (extra: Record<string, string | number> = {}) => ({
    work,
    variables: { cur: cur.val, next: arr[answer + 1]?.val ?? '-', K, answer, ...extra },
  });

  rec.step({ title: '처음 한 번만 정렬하기', codeHighlights: ONCE_AT.init, ...meta() });
  rec.phase('정렬하기', `처음 한 번만 오름차순으로 정렬하고 cur = ${cur.val}에서 시작합니다.`, ONCE_AT.init);
  rec.do(...together(arr.map((f, i): Action => ({
    type: 'add',
    item: { id: f.id, kind: 'cell', rect: slotRect(i), tone: cellTone(f.val), text: String(f.val) },
  }))));

  for (let i = 1; i < arr.length; i++) {
    if (cur.val >= K) break;
    const prev = cur;
    const nextFood = arr[i];
    const mixedVal = prev.val + nextFood.val * 2;
    cur = { id: `f:${seq++}`, val: mixedVal };
    answer++;
    work += 2;
    const rem = currentLine();
    const outOfOrder = rem.length > 1 && rem[0].val > rem[1].val;

    rec.step({
      title: `${answer}번째: cur(${prev.val}) + arr[${i}](${nextFood.val}) × 2 = ${mixedVal}`,
      codeHighlights: ONCE_AT.mix,
      ...meta(),
    });

    rec.phase('앞에서 꺼내기', `재정렬 없이 바로 앞의 cur(${prev.val})와 arr[${i}](${nextFood.val})를 골라 섞습니다.`, ONCE_AT.check);
    rec.do(...together([
      { type: 'set', id: prev.id, patch: { rect: MIX_A, tone: 'current' } },
      { type: 'set', id: nextFood.id, patch: { rect: MIX_B, tone: 'current' } },
    ]));

    rec.phase('그대로 맨 앞에 두기', outOfOrder
      ? `새로 만든 ${josa(mixedVal, '이', '가')} 뒤의 ${rem[1].val}보다 커졌는데도 다시 정렬하지 않고 맨 앞(cur)에 그대로 둡니다.`
      : `새로 만든 ${josa(mixedVal, '을', '를')} cur에 저장합니다.`, ONCE_AT.mix);
    rec.do(...together([
      { type: 'remove', id: prev.id, into: 'slot:out' },
      { type: 'remove', id: nextFood.id, into: 'slot:out' },
      { type: 'add', item: { id: cur.id, kind: 'cell', rect: slotRect(0), tone: outOfOrder ? 'bad' : cellTone(mixedVal), text: String(mixedVal) }, from: 'slot:b' },
      ...rem.slice(1).map((f, idx): Action => ({ type: 'set', id: f.id, patch: { rect: slotRect(idx + 1) } })),
      { type: 'set', id: 'min:tok', patch: { text: `cur = ${cur.val}`, tone: outOfOrder ? 'bad' : 'plain' }, pop: true },
      { type: 'set', id: 'ans:tok', patch: { text: `${answer}번 섞음`, tone: 'chosen' }, pop: true },
    ]));
  }

  const leftSmall = currentLine().slice(1).filter((f) => f.val < K);
  rec.step({
    title: `오답: ${leftSmall.map((f) => f.val).join(', ')}이 남았는데 ${answer}번으로 종료`,
    codeHighlights: ONCE_AT.done,
    ...meta(),
    answer,
    isKeyframe: true,
  });
  rec.phase('오답 확인', `cur = ${josa(cur.val, '이', '가')} ${K} 이상이라 멈췄지만, 뒤에 아직 ${K} 미만인 음식(${leftSmall.map((f) => f.val).join(', ')})이 남아 있습니다. 섞은 음식이 기존 음식보다 커질 수 있으므로 매번 최소 힙에서 꺼내야 합니다.`, ONCE_AT.done);
  rec.do({ type: 'focus', ids: [cur.id, ...leftSmall.map((f) => f.id)] });
  rec.do(...together(leftSmall.map((f): Action => ({ type: 'set', id: f.id, patch: { tone: 'bad' } }))));
  rec.do({ type: 'arrow', from: cur.id, to: leftSmall[0].id, verdict: 'bad', label: `${leftSmall[0].val} < ${K} 남음` });
  rec.do({ type: 'set', id: 'ans:tok', patch: { text: `오답 ${answer} (정답 4)`, tone: 'bad' }, pop: true });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'spicier',
  title: '더 맵게',
  level: 2,
  category: 'heap',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42626',
  description: {
    summary:
      '모든 음식의 스코빌 지수를 K 이상으로 만들고 싶습니다. 가장 덜 매운 음식과 두 번째로 덜 매운 음식을 골라 (가장 덜 매운 지수 + 두 번째 지수 × 2)로 섞는 일을 반복할 때, 최소 몇 번 섞어야 하는지 구합니다. 끝까지 K 이상으로 만들 수 없으면 -1을 돌려줍니다.',
    rules: [
      'scoville의 길이는 2 이상 1,000,000 이하입니다.',
      'K는 0 이상 1,000,000,000 이하입니다.',
      'scoville의 원소는 각각 0 이상 1,000,000 이하입니다.',
      '모든 음식의 스코빌 지수를 K 이상으로 만들 수 없는 경우에는 -1을 return 합니다.',
    ],
    examples: [{ input: 'scoville = [1, 2, 3, 9, 10, 12], K = 7', output: '2' }],
  },
  keyIntuitions: [
    '새로 섞은 음식의 스코빌 지수는 원래 있던 다른 음식보다 커질 수 있어서 순서가 계속 바뀝니다.',
    '매번 "지금 남은 음식 중 가장 작은 두 개"를 꺼내고 새 음식을 다시 넣어야 하므로 최소 힙이 딱 맞습니다.',
    '힙의 최솟값(heap[0])이 K 이상이 되는 순간, 나머지 음식도 모두 K 이상이므로 바로 멈출 수 있습니다.',
  ],
  demo: { input: [SCOVILLE, K], label: `scoville = [${SCOVILLE.join(', ')}], K = ${K}` },
  workUnit: '힙·배열 정리 연산 수',
  approaches: [
    {
      id: 'spicier-min-heap',
      name: '최소 힙',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '최소 힙에서 가장 작은 두 음식을 꺼내 섞고 다시 넣기를 반복하는 정석 풀이입니다.',
      pros: [
        '가장 작은 두 값 꺼내기와 새 값 넣기가 모두 O(log N)이라 100만 개도 빠르게 처리합니다.',
        'heap[0] >= K 조건 하나로 모든 음식이 K 이상인지 O(1)에 확인합니다.',
      ],
      cons: ['JavaScript에는 내장 힙이 없어 간단한 최소 힙 함수를 직접 작성해야 합니다.'],
      whyThisRank:
        '원소를 꺼내고 새 원소를 넣으면서 최솟값을 최대 N번 찾아야 하므로 O(log N)에 갱신하는 최소 힙이 정석입니다.',
      code: HEAP,
      visualize: minHeapViz,
    },
    {
      id: 'spicier-resort',
      name: '섞을 때마다 다시 정렬하기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N² log N)',
      spaceComplexity: 'O(N)',
      verdict: '배열에서 앞의 두 개를 꺼내 섞은 뒤 매번 배열 전체를 다시 정렬하는 풀이입니다.',
      pros: ['힙 자료구조 없이 기본 정렬 함수만으로 구현할 수 있습니다.'],
      cons: [
        '섞을 때마다 O(N log N) 정렬을 반복해 전체 시간이 O(N² log N)으로 늘어납니다.',
        '음식 수가 100만 개까지 커지면 효율성 테스트에서 시간 초과가 납니다.',
      ],
      whyThisRank:
        '정확한 답은 내지만 새 원소 하나 때문에 이미 정렬된 나머지 원소까지 매번 다시 정렬하는 비용이 큽니다.',
      code: RESORT,
      visualize: resortViz,
    },
    {
      id: 'spicier-sort-once',
      name: '처음 한 번만 정렬하고 앞에서부터 섞기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '처음에만 정렬해 두고 새로 섞은 음식을 재정렬 없이 다음 음식과 바로 섞는 오답 풀이입니다.',
      pros: ['정렬을 한 번만 해 빨라 보입니다.'],
      cons: [
        '섞어서 커진 음식이 뒤에 있던 음식보다 더 매워질 수 있는데도 순서를 고치지 않습니다.',
        '가장 덜 매운 두 음식이 아닌 큰 음식을 먼저 섞어 버려 섞는 횟수가 틀립니다.',
      ],
      whyThisRank:
        '1과 2를 섞어 5가 되면 뒤에 있던 3, 4보다 커집니다. 새로 만든 값의 자리가 바뀐다는 점을 놓치기 쉬운 대표적인 함정입니다.',
      code: ONCE,
      visualize: sortOnceViz,
    },
  ],
  checks: {
    cases: [
      { args: [[1, 2, 3, 9, 10, 12], 7], expected: 2 },
      { args: [SCOVILLE, K], expected: 4 },
      { args: [[1, 2, 3], 100], expected: -1 },
      { args: [[10, 12], 7], expected: 0 },
      { args: [[0, 0, 1], 2], expected: 2 },
    ],
    random: (rand) => {
      const len = 2 + Math.floor(rand() * 7);
      const arr = Array.from({ length: len }, () => Math.floor(rand() * 15));
      const k = 1 + Math.floor(rand() * 35);
      return [arr, k];
    },
  },
};

export default problem;
