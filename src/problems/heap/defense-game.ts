// 디펜스 게임: 정석 무적권으로 막은 라운드 최소 힙(크기 k 유지), 대안 매 라운드마다 지나온 라운드를 정렬해 작은 쪽을 병사로 막기, 함정 병사가 부족할 때만 현재 라운드에 무적권 쓰기(오답)를 같은 장면에서 움직인다.
// 장면은 위에 라운드별 적의 수(enemy) 줄, 가운데에 무적권 힙(최대 k칸), 아래에 남은 병사 n과 통과한 라운드 수 표시다.
import { slots } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { lines, together } from '../shared.ts';

// 시각화 입력: 병사 n = 8, 무적권 k = 2, enemy = [6, 2, 2, 2, 2, 5, 4].
// 정석과 대안은 가장 큰 6과 5에 무적권을 쓰고 2 네 번(합 8)을 병사로 막아 6라운드를 통과한다.
// 함정(병사가 남으면 그대로 병사를 쓰고 부족할 때만 무적권 사용)은 1라운드의 6에 병사를 써 버려 4라운드밖에 못 간다.
const INIT_N = 8;
const K = 2;
const ENEMY = [6, 2, 2, 2, 2, 5, 4];
const M = ENEMY.length;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const HEAP = {
  python: `import heapq

def solution(n, k, enemy):
    heap = []  # 무적권으로 막은 라운드들 (최소 힙, 최대 k개)

    for i, e in enumerate(enemy):
        heapq.heappush(heap, e)
        if len(heap) > k:
            # 무적권이 k개를 넘으면 그중 가장 적이 적은 라운드를 병사로 막는다
            n -= heapq.heappop(heap)
        if n < 0:
            return i

    return len(enemy)`,
  javascript: `function solution(n, k, enemy) {
  const heap = []; // 무적권으로 막은 라운드들 (최소 힙, 최대 k개)
  const push = (v) => {
    heap.push(v);
    for (let i = heap.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) break;
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
        if (l < heap.length && heap[l] < heap[m]) m = l;
        if (r < heap.length && heap[r] < heap[m]) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  };

  for (let i = 0; i < enemy.length; i++) {
    push(enemy[i]);
    if (heap.length > k) {
      // 무적권이 k개를 넘으면 그중 가장 적이 적은 라운드를 병사로 막는다
      n -= pop();
    }
    if (n < 0) return i;
  }
  return enemy.length;
}`,
};
const HEAP_AT = {
  init: lines(HEAP, ['heap = []'], ['const heap = []']),
  push: lines(HEAP, ['for i, e in enumerate(enemy):', 'heapq.heappush(heap, e)'], ['for (let i = 0; i < enemy.length; i++)', 'push(enemy[i])']),
  pop: lines(HEAP, ['if len(heap) > k:', 'n -= heapq.heappop(heap)'], ['if (heap.length > k)', 'n -= pop()']),
  fail: lines(HEAP, ['if n < 0:', 'return i'], ['if (n < 0) return i']),
  done: lines(HEAP, ['return i', 'return len(enemy)'], ['if (n < 0) return i', 'return enemy.length']),
};

const SORT_EACH = {
  python: `def solution(n, k, enemy):
    seen = []
    for i, e in enumerate(enemy):
        seen.append(e)
        seen.sort()  # 매 라운드마다 지금까지 본 적의 수를 다시 정렬
        # 가장 큰 k개를 뺀 나머지(작은 라운드들)의 합이 병사 수 n을 넘는지 확인
        need = sum(seen[:max(0, len(seen) - k)])
        if need > n:
            return i
    return len(enemy)`,
  javascript: `function solution(n, k, enemy) {
  const seen = [];
  for (let i = 0; i < enemy.length; i++) {
    seen.push(enemy[i]);
    seen.sort((a, b) => a - b); // 매 라운드마다 지금까지 본 적의 수를 다시 정렬
    // 가장 큰 k개를 뺀 나머지(작은 라운드들)의 합이 병사 수 n을 넘는지 확인
    let need = 0;
    for (let j = 0; j < seen.length - k; j++) need += seen[j];
    if (need > n) return i;
  }
  return enemy.length;
}`,
};
const SORT_AT = {
  init: lines(SORT_EACH, ['seen = []'], ['const seen = []']),
  sort: lines(SORT_EACH, ['seen.append(e)', 'seen.sort()'], ['seen.push(enemy[i])', 'seen.sort((a, b) => a - b)']),
  check: lines(SORT_EACH, ['need = sum(seen[:max(0, len(seen) - k)])', 'if need > n:'], ['let need = 0', 'for (let j = 0; j < seen.length - k; j++)', 'if (need > n) return i']),
  done: lines(SORT_EACH, ['return i', 'return len(enemy)'], ['if (need > n) return i', 'return enemy.length']),
};

const NAIVE = {
  python: `def solution(n, k, enemy):
    for i, e in enumerate(enemy):
        if n >= e:       # 병사가 충분하면 무조건 병사부터 소모
            n -= e
        elif k > 0:      # 병사가 부족할 때만 무적권 사용
            k -= 1
        else:
            return i
    return len(enemy)`,
  javascript: `function solution(n, k, enemy) {
  for (let i = 0; i < enemy.length; i++) {
    const e = enemy[i];
    if (n >= e) {      // 병사가 충분하면 무조건 병사부터 소모
      n -= e;
    } else if (k > 0) { // 병사가 부족할 때만 무적권 사용
      k--;
    } else {
      return i;
    }
  }
  return enemy.length;
}`,
};
const NAIVE_AT = {
  spend: lines(NAIVE, ['if n >= e:', 'n -= e'], ['if (n >= e)', 'n -= e']),
  shield: lines(NAIVE, ['elif k > 0:', 'k -= 1'], ['} else if (k > 0)', 'k--']),
  fail: lines(NAIVE, ['else:', 'return i'], ['} else {', 'return i']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 560;
const H = 290;
const roundSlot = slots({ x: 88, y: 18, w: 58, h: 48, gap: 8 });
const heapSlot = slots({ x: 96, y: 112, w: 96, h: 44, gap: 10 });
const N_RECT: Rect = { x: 88, y: 210, w: 144, h: 44 };
const K_RECT: Rect = { x: 248, y: 210, w: 136, h: 44 };
const ANS_RECT: Rect = { x: 400, y: 210, w: 144, h: 44 };

function board(midLabel: string): Scene {
  return {
    width: W,
    height: H,
    items: [
      { id: 'lab:enemy', kind: 'text', rect: { x: 0, y: 18, w: 84, h: 48 }, text: '라운드 적' },
      ...ENEMY.map((e, i): Item => ({
        id: `e:${i}`,
        kind: 'cell',
        rect: roundSlot(i),
        tone: 'plain',
        text: String(e),
        sub: `${i + 1}R`,
      })),
      { id: 'lab:heap', kind: 'text', rect: { x: 0, y: 112, w: 90, h: 44 }, text: midLabel },
      { id: 'zone:heap', kind: 'zone', rect: { x: 90, y: 106, w: 332, h: 56 } },
      { id: 'n:tok', kind: 'token', rect: N_RECT, tone: 'good', text: `병사 n = ${INIT_N}`, tag: '남은 병사' },
      { id: 'k:tok', kind: 'token', rect: K_RECT, tone: 'queued', text: `무적권 k = ${K}`, tag: '한도' },
      { id: 'ans:tok', kind: 'token', rect: ANS_RECT, tone: 'plain', text: '0라운드 통과', tag: 'answer' },
    ],
  };
}

interface RoundEntry { i: number; e: number }
const hId = (i: number) => `h:${i}`;

/* ------------------------------------------------------------------ */
/* 정석 막은 라운드 최소 힙                                             */
/* ------------------------------------------------------------------ */

function minHeapDefenseViz(): Visualization {
  const rec = new StepRecorder(board('무적권 최소 힙'));
  const heap: RoundEntry[] = [];
  let n = INIT_N;
  let work = 0;
  let cleared = 0;
  const syncHeap = (): Action[] =>
    heap.map((r, idx): Action => ({
      type: 'set',
      id: hId(r.i),
      patch: { rect: heapSlot(idx), tone: 'queued', text: `${r.i + 1}R(${r.e})` },
    }));
  const meta = (round = '-') => ({
    work,
    variables: {
      라운드: round,
      n,
      heap: `[${heap.map((r) => r.e).join(', ')}]`,
      통과: `${cleared}R`,
    },
  });

  rec.step({ title: `병사 ${INIT_N}명, 무적권 ${K}개로 시작`, codeHighlights: HEAP_AT.init, ...meta() });
  rec.phase('초기화', `무적권으로 막을 라운드(최대 ${K}개)를 담는 최소 힙을 준비합니다. 힙이 ${K}개를 넘으면 가장 적이 적은 라운드를 꺼내 병사로 막습니다.`, HEAP_AT.init);
  rec.do({ type: 'focus', ids: ['n:tok', 'k:tok'] });
  rec.do({ type: 'unfocus' });

  for (let i = 0; i < M; i++) {
    const e = ENEMY[i];
    const entry: RoundEntry = { i, e };
    heap.push(entry);
    heap.sort((a, b) => a.e - b.e || a.i - b.i);
    work++;

    if (heap.length <= K) {
      cleared = i + 1;
      rec.step({
        title: `${i + 1}라운드(적 ${e}명): 무적권 힙에 추가 (${heap.length}/${K})`,
        codeHighlights: HEAP_AT.push,
        ...meta(`${i + 1}R (${e}명)`),
      });
      rec.phase('힙에 넣기', `아직 무적권 힙에 자리가 있으므로 ${i + 1}라운드(적 ${e}명)를 최소 힙에 넣습니다.`, HEAP_AT.push);
      rec.do(...together([
        { type: 'set', id: `e:${i}`, patch: { tone: 'queued' } },
        { type: 'add', item: { id: hId(i), kind: 'token', rect: heapSlot(heap.indexOf(entry)), tone: 'queued', text: `${i + 1}R(${e})` }, from: `e:${i}` },
        ...syncHeap(),
        { type: 'set', id: 'ans:tok', patch: { text: `${cleared}라운드 통과`, tone: 'chosen' }, pop: true },
      ]));
      continue;
    }

    const popped = heap.shift()!;
    const beforeN = n;
    n -= popped.e;
    work++;

    if (n >= 0) {
      cleared = i + 1;
      rec.step({
        title: `${i + 1}라운드(적 ${e}명): 최솟값 ${popped.i + 1}R(${popped.e}명)을 병사로 막기 → n = ${n}`,
        codeHighlights: HEAP_AT.pop,
        ...meta(`${i + 1}R (${e}명)`),
      });
      rec.phase('힙에 넣고 최솟값 꺼내기', `${i + 1}라운드(${e}명)를 힙에 넣으면 ${K + 1}개가 됩니다. 그중 적이 가장 적은 ${popped.i + 1}라운드(${popped.e}명)를 꺼내 병사로 막고(${beforeN} − ${popped.e} = ${n}), 큰 라운드 ${K}개에 무적권을 유지합니다.`, HEAP_AT.pop);
      rec.do(...together([
        { type: 'add', item: { id: hId(i), kind: 'token', rect: heapSlot(K), tone: 'queued', text: `${i + 1}R(${e})` }, from: `e:${i}` },
        { type: 'set', id: `e:${i}`, patch: { tone: 'queued' } },
      ]));
      rec.do(...together([
        { type: 'remove', id: hId(popped.i), into: 'n:tok' },
        { type: 'set', id: `e:${popped.i}`, patch: { tone: 'visited' } },
        ...syncHeap(),
        { type: 'set', id: 'n:tok', patch: { text: `병사 n = ${n}`, tone: 'chosen' }, pop: true },
        { type: 'set', id: 'ans:tok', patch: { text: `${cleared}라운드 통과`, tone: 'chosen' }, pop: true },
      ]));
    } else {
      rec.step({
        title: `${i + 1}라운드(적 ${e}명): 최솟값 ${popped.e}명도 막을 병사 부족 (n = ${n})`,
        codeHighlights: HEAP_AT.fail,
        ...meta(`${i + 1}R (${e}명)`),
      });
      rec.phase('병사 부족', `${i + 1}라운드(${e}명)를 넣고 가장 작은 ${popped.i + 1}라운드(${popped.e}명)를 병사로 막으려 했지만, 남은 병사가 ${beforeN}명뿐이라 n = ${n} < 0이 됩니다.`, HEAP_AT.fail);
      rec.do(...together([
        { type: 'add', item: { id: hId(i), kind: 'token', rect: heapSlot(K), tone: 'queued', text: `${i + 1}R(${e})` }, from: `e:${i}` },
        { type: 'remove', id: hId(popped.i), into: 'n:tok' },
        { type: 'set', id: `e:${i}`, patch: { tone: 'bad' } },
        ...syncHeap(),
        { type: 'set', id: 'n:tok', patch: { text: `병사 부족 (${n})`, tone: 'bad' }, pop: true },
      ]));
      break;
    }
  }

  rec.step({
    title: `최대 ${cleared}라운드 통과`,
    codeHighlights: HEAP_AT.done,
    ...meta('종료'),
    answer: cleared,
    isKeyframe: true,
  });
  rec.phase('정답', `가장 적이 많았던 1라운드(6명)와 6라운드(5명)를 무적권으로 막고, 나머지 2·3·4·5라운드(각 2명, 합 8명)를 병사로 막아 총 ${cleared}라운드를 통과했습니다.`, HEAP_AT.done);
  rec.do(...together([
    ... Array.from({ length: cleared }, (_, idx): Action => ({ type: 'set', id: `e:${idx}`, patch: { tone: 'path' } })),
    { type: 'set', id: 'ans:tok', patch: { text: `${cleared}라운드 통과`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 매 라운드마다 지금까지 본 적을 정렬해 확인                      */
/* ------------------------------------------------------------------ */

function sortEachDefenseViz(): Visualization {
  const rec = new StepRecorder(board('매번 정렬'));
  const seen: number[] = [];
  let work = 0;
  let cleared = 0;
  let need = 0;
  const meta = (round = '-') => ({
    work,
    variables: { 라운드: round, seen: `[${seen.join(', ')}]`, 필요병사: need, 한도n: INIT_N },
  });

  rec.step({ title: '빈 배열 seen으로 시작', codeHighlights: SORT_AT.init, ...meta() });
  rec.phase('초기화', '라운드가 끝날 때마다 지금까지 만난 적의 수를 배열에 넣고 매번 오름차순으로 정렬합니다.', SORT_AT.init);
  rec.do({ type: 'add', item: { id: 'need:tok', kind: 'token', rect: heapSlot(0), tone: 'plain', text: '필요 병사 0명' } });

  for (let i = 0; i < M; i++) {
    seen.push(ENEMY[i]);
    seen.sort((a, b) => a - b);
    work += seen.length * 2; // 매 라운드 정렬 + 합산 비용
    need = seen.slice(0, Math.max(0, seen.length - K)).reduce((a, b) => a + b, 0);

    if (need <= INIT_N) {
      cleared = i + 1;
      rec.step({
        title: `${i + 1}라운드 정렬 후 작은 ${Math.max(0, seen.length - K)}개 합 = ${need} ≤ ${INIT_N}`,
        codeHighlights: SORT_AT.check,
        ...meta(`${i + 1}R`),
      });
      rec.phase('정렬 및 합산', `지금까지의 ${seen.length}개 라운드를 전체 정렬해 큰 ${Math.min(K, seen.length)}개를 뺀 나머지 합(${need}명)이 ${INIT_N}명 이하인지 확인합니다.`, SORT_AT.sort);
      rec.do(...together([
        { type: 'set', id: `e:${i}`, patch: { tone: 'visited' } },
        { type: 'set', id: 'need:tok', patch: { text: `필요 ${need}명 ≤ ${INIT_N}` }, pop: true },
        { type: 'set', id: 'ans:tok', patch: { text: `${cleared}라운드 통과`, tone: 'chosen' }, pop: true },
      ]));
    } else {
      rec.step({
        title: `${i + 1}라운드 정렬 후 작은 쪽 합 = ${need} > ${INIT_N} (중단)`,
        codeHighlights: SORT_AT.check,
        ...meta(`${i + 1}R`),
      });
      rec.phase('병사 초과', `가장 큰 ${K}개를 무적권으로 막아도 나머지 합이 ${need}명 > ${INIT_N}명이라 ${i + 1}라운드는 통과할 수 없습니다.`, SORT_AT.check);
      rec.do(...together([
        { type: 'set', id: `e:${i}`, patch: { tone: 'bad' } },
        { type: 'set', id: 'need:tok', patch: { text: `필요 ${need}명 > ${INIT_N}`, tone: 'bad' }, pop: true },
      ]));
      break;
    }
  }

  rec.step({
    title: `최대 ${cleared}라운드 통과 (연산 ${work}번)`,
    codeHighlights: SORT_AT.done,
    ...meta('종료'),
    answer: cleared,
    isKeyframe: true,
  });
  rec.phase('정답', `답은 ${cleared}라운드로 같지만, 매 라운드마다 처음부터 다시 정렬하고 더해 연산이 ${work}번 들었습니다. 라운드가 100만 개면 O(M² log M)으로 시간 초과가 납니다.`, SORT_AT.done);
  rec.do(...together([
    ...Array.from({ length: cleared }, (_, idx): Action => ({ type: 'set', id: `e:${idx}`, patch: { tone: 'path' } })),
    { type: 'set', id: 'ans:tok', patch: { text: `${cleared}라운드 통과`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 병사가 부족할 때만 무적권 쓰기(오답)                            */
/* ------------------------------------------------------------------ */

function naiveDefenseViz(): Visualization {
  const rec = new StepRecorder(board('사용한 무적권'));
  let n = INIT_N;
  let k = K;
  let work = 0;
  let cleared = 0;
  let shieldUsed = 0;
  const meta = (round = '-') => ({
    work,
    variables: { 라운드: round, n, k, 통과: `${cleared}R` },
  });

  rec.step({ title: '병사가 남으면 무조건 병사부터 소모하기', codeHighlights: NAIVE_AT.spend, ...meta() });
  rec.phase('초기화', '앞으로 나올 라운드를 고려하지 않고, 현재 병사로 막을 수 있으면 무조건 병사를 쓰고 부족할 때만 무적권을 씁니다.', NAIVE_AT.spend);
  rec.do({ type: 'focus', ids: ['n:tok', 'k:tok'] });
  rec.do({ type: 'unfocus' });

  for (let i = 0; i < M; i++) {
    const e = ENEMY[i];
    work++;
    if (n >= e) {
      n -= e;
      cleared = i + 1;
      rec.step({
        title: `${i + 1}라운드(적 ${e}명): 병사 ${e}명 소모 → 남은 병사 ${n}명`,
        codeHighlights: NAIVE_AT.spend,
        ...meta(`${i + 1}R (${e}명)`),
      });
      rec.phase('병사 소모', i === 0
        ? `1라운드 적이 ${e}명으로 매우 많지만, 현재 병사(${INIT_N}명)로 막을 수 있다는 이유로 병사 ${e}명을 그대로 써 버립니다.`
        : `병사 ${e}명을 소모해 ${i + 1}라운드를 막습니다.`, NAIVE_AT.spend);
      rec.do(...together([
        { type: 'set', id: `e:${i}`, patch: { tone: i === 0 ? 'bad' : 'visited' } },
        { type: 'set', id: 'n:tok', patch: { text: `병사 n = ${n}`, tone: 'chosen' }, pop: true },
        { type: 'set', id: 'ans:tok', patch: { text: `${cleared}라운드 통과`, tone: 'chosen' }, pop: true },
      ]));
    } else if (k > 0) {
      k--;
      cleared = i + 1;
      const slotIdx = shieldUsed++;
      rec.step({
        title: `${i + 1}라운드(적 ${e}명): 병사 부족 → 작은 적 ${e}명에 무적권 낭비`,
        codeHighlights: NAIVE_AT.shield,
        ...meta(`${i + 1}R (${e}명)`),
      });
      rec.phase('무적권 사용', `남은 병사가 ${n}명이라 적 ${e}명에게 무적권을 씁니다. 1라운드(6명) 대신 ${e}명짜리 작은 라운드에 무적권이 쓰였습니다.`, NAIVE_AT.shield);
      rec.do(...together([
        { type: 'set', id: `e:${i}`, patch: { tone: 'queued' } },
        { type: 'add', item: { id: hId(i), kind: 'token', rect: heapSlot(slotIdx), tone: 'bad', text: `${i + 1}R(${e}) 무적권` }, from: `e:${i}` },
        { type: 'set', id: 'k:tok', patch: { text: `무적권 k = ${k}` }, pop: true },
        { type: 'set', id: 'ans:tok', patch: { text: `${cleared}라운드 통과`, tone: 'chosen' }, pop: true },
      ]));
    } else {
      rec.step({
        title: `${i + 1}라운드(적 ${e}명): 병사도 무적권도 없어 실패`,
        codeHighlights: NAIVE_AT.fail,
        ...meta(`${i + 1}R (${e}명)`),
      });
      rec.phase('실패', `5라운드(적 ${e}명)에서 병사(${n}명)도 무적권(${k}개)도 남아 있지 않아 일찍 멈춥니다.`, NAIVE_AT.fail);
      rec.do({ type: 'set', id: `e:${i}`, patch: { tone: 'bad' } });
      break;
    }
  }

  rec.step({
    title: `오답: ${cleared}라운드 종료 (정답 6라운드)`,
    codeHighlights: NAIVE_AT.fail,
    ...meta('종료'),
    answer: cleared,
    isKeyframe: true,
  });
  rec.phase('오답 확인', `1라운드의 큰 적(6명)에 병사를 써 버리는 바람에 정작 무적권 2개를 적 2명짜리 라운드에 낭비해 ${cleared}라운드(정답 6라운드)밖에 가지 못했습니다. 지나온 라운드 중 가장 큰 곳을 무적권으로 바꿀 수 있도록 최소 힙을 써야 합니다.`, NAIVE_AT.fail);
  rec.do({ type: 'arrow', from: 'e:0', to: 'ans:tok', verdict: 'bad', label: '1R(6명)에 병사 낭비' });
  rec.do({ type: 'set', id: 'ans:tok', patch: { text: `오답 ${cleared}R (정답 6R)`, tone: 'bad' }, pop: true });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'defense-game',
  title: '디펜스 게임',
  level: 2,
  category: 'heap',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/142085',
  description: {
    summary:
      '보유한 병사 n명으로 매 라운드 몰려오는 enemy[i]명의 적을 순서대로 막습니다. 병사를 enemy[i]명 소모하거나, 병사 소모 없이 한 라운드를 통째로 넘기는 무적권을 최대 k번 사용할 수 있을 때, 최대 몇 라운드까지 막을 수 있는지 구합니다.',
    rules: [
      '1 ≤ n ≤ 1,000,000,000',
      '1 ≤ k ≤ 500,000',
      '1 ≤ enemy의 길이 ≤ 1,000,000',
      '1 ≤ enemy[i] ≤ 1,000,000',
      '모든 라운드를 막을 수 있는 경우에는 enemy의 길이를 return 합니다.',
    ],
    examples: [
      { input: 'n = 7, k = 3, enemy = [4, 2, 4, 5, 3, 3, 1]', output: '5' },
      { input: 'n = 2, k = 4, enemy = [3, 3, 3, 3]', output: '4' },
    ],
  },
  keyIntuitions: [
    '무적권 k개는 지금까지 진행한 라운드 가운데 "적이 가장 많았던 상위 k개 라운드"에 썼을 때 남은 병사를 가장 많이 아낄 수 있습니다.',
    '무적권으로 막은 라운드들을 크기 k인 최소 힙에 담아 두고, 새 라운드가 들어와 k + 1개가 되면 그중 가장 적이 적은 라운드(heap[0])를 꺼내 병사로 막습니다.',
    '꺼낸 최솟값을 병사로 막다가 남은 병사 n이 0보다 작아지는 순간이 더 이상 진행할 수 없는 첫 라운드입니다.',
  ],
  demo: { input: [INIT_N, K, ENEMY], label: `n = ${INIT_N}, k = ${K}, enemy = [${ENEMY.join(', ')}]` },
  workUnit: '힙·정렬 연산 수',
  approaches: [
    {
      id: 'defense-game-min-heap',
      name: '막은 라운드 최소 힙',
      rank: 'BEST',
      timeComplexity: 'O(M log k) (M = 라운드 수)',
      spaceComplexity: 'O(k)',
      verdict: '무적권으로 막은 상위 k개 라운드를 최소 힙에 유지하고, k개를 넘을 때마다 최솟값을 꺼내 병사로 막는 정석 풀이입니다.',
      pros: [
        '힙의 크기가 최대 k + 1로 유지되므로 라운드마다 O(log k)에 처리됩니다.',
        '나중에 더 작은 적을 만나면 과거의 큰 적에게 무적권을 양보하는 효과가 자동으로 일어납니다.',
      ],
      cons: ['최소 힙에 무엇을 남기고(무적권 라운드) 무엇을 꺼내는지(병사로 막을 라운드) 역할을 명확히 기억해야 합니다.'],
      whyThisRank:
        '100만 라운드를 한 번만 훑으면서 매 순간 상위 k개 라운드를 무적권으로 유지할 수 있는 가장 빠른 방법입니다.',
      code: HEAP,
      visualize: minHeapDefenseViz,
    },
    {
      id: 'defense-game-sort-each',
      name: '매 라운드마다 지금까지의 적을 정렬해 확인하기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(M² log M)',
      spaceComplexity: 'O(M)',
      verdict: '라운드마다 지금까지 등장한 적을 배열에 넣고 정렬해 가장 큰 k개를 제외한 합을 구하는 풀이입니다.',
      pros: ['힙 없이 정렬과 배열 슬라이싱만으로 상위 k개를 바로 구할 수 있습니다.'],
      cons: [
        '매 라운드마다 전체 정렬과 합산을 반복하므로 라운드 수가 많으면 O(M² log M)으로 시간 초과가 납니다.',
      ],
      whyThisRank:
        '상위 k개에 무적권을 쓴다는 논리는 같지만, 매 라운드 정렬을 다시 수행해 불필요한 중복 연산이 발생합니다.',
      code: SORT_EACH,
      visualize: sortEachDefenseViz,
    },
    {
      id: 'defense-game-naive-greedy',
      name: '병사가 부족할 때만 그때그때 무적권 쓰기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(M)',
      spaceComplexity: 'O(1)',
      verdict: '병사가 남아 있으면 큰 적에게도 무조건 병사를 쓰고, 병사가 바닥난 뒤에야 작은 적에게 무적권을 쓰는 오답 풀이입니다.',
      pros: ['반복문 하나로 끝나 코드가 아주 단순합니다.'],
      cons: [
        '초반에 큰 적이 나왔을 때 병사를 다 써 버리고, 정작 후반의 작은 적들에게 무적권을 낭비합니다.',
      ],
      whyThisRank:
        '무적권은 "병사가 떨어진 시점"이 아니라 "지나온 라운드 중 적이 가장 많았던 시점"에 써야 최대로 버틸 수 있습니다.',
      code: NAIVE,
      visualize: naiveDefenseViz,
    },
  ],
  checks: {
    cases: [
      { args: [7, 3, [4, 2, 4, 5, 3, 3, 1]], expected: 5 },
      { args: [2, 4, [3, 3, 3, 3]], expected: 4 },
      { args: [INIT_N, K, ENEMY], expected: 6 },
      { args: [10, 1, [12, 5, 5, 5]], expected: 3 },
      { args: [5, 2, [1, 1, 1, 10, 10]], expected: 5 },
    ],
    random: (rand) => {
      const len = 2 + Math.floor(rand() * 8);
      const n = 1 + Math.floor(rand() * 20);
      const k = 1 + Math.floor(rand() * 4);
      const enemy = Array.from({ length: len }, () => 1 + Math.floor(rand() * 9));
      return [n, k, enemy];
    },
  },
};

export default problem;
