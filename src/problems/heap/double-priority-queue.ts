// 이중우선순위큐: 정석 최소 힙·최대 힙 두 개와 생존 표시(alive), 대안 배열에서 매번 최댓값·최솟값 찾아 지우기, 함정 개수만 세고 삭제된 원소를 반대편 힙에 남겨 두기(오답)를 같은 장면에서 움직인다.
// 장면은 위에 명령어 줄, 가운데에 최소 힙 줄과 최대 힙 줄(대안은 단일 배열 줄), 아래에 원소별 생존 상태(alive)와 최종 [최댓값, 최솟값] 표시다.
import { slots } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';

// 시각화 입력: 7개 연산.
// I 10, I 20, I 30 → D 1(30 삭제) → D -1(10 삭제) → I 5 → D 1(20 삭제).
// 살아남은 원소는 5 하나뿐이므로 정답은 [5, 5]다.
// 함정(개수만 세고 개별 삭제 여부를 기록하지 않음)은 count가 한 번도 0이 되지 않아,
// D -1로 이미 지운 10이 최대 힙 꼭대기에 유령처럼 남아 [10, 5]를 반환한다.
const OPS = ['I 10', 'I 20', 'I 30', 'D 1', 'D -1', 'I 5', 'D 1'];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TWO_HEAPS = {
  python: `import heapq

def solution(operations):
    min_h, max_h = [], []
    alive = [False] * len(operations)

    for i, op in enumerate(operations):
        cmd, val = op.split()
        num = int(val)
        if cmd == 'I':
            heapq.heappush(min_h, (num, i))
            heapq.heappush(max_h, (-num, i))
            alive[i] = True
        elif num == 1:  # 최댓값 삭제
            while max_h and not alive[max_h[0][1]]:
                heapq.heappop(max_h)
            if max_h:
                alive[heapq.heappop(max_h)[1]] = False
        else:           # 최솟값 삭제
            while min_h and not alive[min_h[0][1]]:
                heapq.heappop(min_h)
            if min_h:
                alive[heapq.heappop(min_h)[1]] = False

    while max_h and not alive[max_h[0][1]]:
        heapq.heappop(max_h)
    while min_h and not alive[min_h[0][1]]:
        heapq.heappop(min_h)

    return [-max_h[0][0], min_h[0][0]] if max_h and min_h else [0, 0]`,
  javascript: `function solution(operations) {
  const makeHeap = (cmp) => {
    const h = [];
    const push = (v) => {
      h.push(v);
      for (let i = h.length - 1; i > 0;) {
        const p = (i - 1) >> 1;
        if (cmp(h[p], h[i]) <= 0) break;
        [h[p], h[i]] = [h[i], h[p]];
        i = p;
      }
    };
    const pop = () => {
      const top = h[0], last = h.pop();
      if (h.length) {
        h[0] = last;
        for (let i = 0;;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < h.length && cmp(h[l], h[m]) < 0) m = l;
          if (r < h.length && cmp(h[r], h[m]) < 0) m = r;
          if (m === i) break;
          [h[i], h[m]] = [h[m], h[i]];
          i = m;
        }
      }
      return top;
    };
    return { h, push, pop };
  };

  const minH = makeHeap((a, b) => a[0] - b[0]);
  const maxH = makeHeap((a, b) => b[0] - a[0]);
  const alive = Array(operations.length).fill(false);
  const clean = (heap) => { while (heap.h.length && !alive[heap.h[0][1]]) heap.pop(); };

  operations.forEach((op, i) => {
    const [cmd, raw] = op.split(' ');
    const num = Number(raw);
    if (cmd === 'I') {
      minH.push([num, i]);
      maxH.push([num, i]);
      alive[i] = true;
    } else if (num === 1) {
      clean(maxH);
      if (maxH.h.length) alive[maxH.pop()[1]] = false;
    } else {
      clean(minH);
      if (minH.h.length) alive[minH.pop()[1]] = false;
    }
  });

  clean(maxH);
  clean(minH);
  return maxH.h.length && minH.h.length ? [maxH.h[0][0], minH.h[0][0]] : [0, 0];
}`,
};
const TWO_HEAPS_AT = {
  init: lines(TWO_HEAPS, ['min_h, max_h = [], []', 'alive = [False]'], ['const minH = makeHeap', 'const maxH = makeHeap', 'const alive = Array']),
  insert: lines(TWO_HEAPS, ["if cmd == 'I':", 'heapq.heappush(min_h', 'heapq.heappush(max_h', 'alive[i] = True'], ["if (cmd === 'I')", 'minH.push([num, i])', 'maxH.push([num, i])', 'alive[i] = true']),
  delMax: lines(TWO_HEAPS, ['elif num == 1:', 'while max_h and not alive', 'alive[heapq.heappop(max_h)[1]] = False'], ['} else if (num === 1)', 'clean(maxH)', 'if (maxH.h.length) alive[maxH.pop()[1]] = false']),
  delMin: lines(TWO_HEAPS, ['else:', 'while min_h and not alive', 'alive[heapq.heappop(min_h)[1]] = False'], ['clean(minH)', 'if (minH.h.length) alive[minH.pop()[1]] = false']),
  finalClean: lines(TWO_HEAPS, ['while max_h and not alive[max_h[0][1]]:', 'return [-max_h[0][0], min_h[0][0]]'], ['clean(maxH)', 'clean(minH)', 'return maxH.h.length']),
};

const ARRAY_SCAN = {
  python: `def solution(operations):
    arr = []
    for op in operations:
        cmd, val = op.split()
        num = int(val)
        if cmd == 'I':
            arr.append(num)
        elif arr:
            # 삭제할 때마다 배열 전체를 훑어 최댓값/최솟값을 찾는다
            target = max(arr) if num == 1 else min(arr)
            arr.remove(target)

    return [max(arr), min(arr)] if arr else [0, 0]`,
  javascript: `function solution(operations) {
  const arr = [];
  for (const op of operations) {
    const [cmd, raw] = op.split(' ');
    const num = Number(raw);
    if (cmd === 'I') {
      arr.push(num);
    } else if (arr.length) {
      // 삭제할 때마다 배열 전체를 훑어 최댓값/최솟값 위치를 찾는다
      let best = 0;
      for (let i = 1; i < arr.length; i++) {
        if (num === 1 ? arr[i] > arr[best] : arr[i] < arr[best]) best = i;
      }
      arr.splice(best, 1);
    }
  }
  return arr.length ? [Math.max(...arr), Math.min(...arr)] : [0, 0];
}`,
};
const ARRAY_AT = {
  init: lines(ARRAY_SCAN, ['arr = []'], ['const arr = []']),
  insert: lines(ARRAY_SCAN, ["if cmd == 'I':", 'arr.append(num)'], ["if (cmd === 'I')", 'arr.push(num)']),
  remove: lines(ARRAY_SCAN, ['target = max(arr) if num == 1 else min(arr)', 'arr.remove(target)'], ['let best = 0', 'for (let i = 1; i < arr.length; i++)', 'arr.splice(best, 1)']),
  done: lines(ARRAY_SCAN, ['return [max(arr), min(arr)]'], ['return arr.length ? [Math.max(...arr)']),
};

const UNSYNCED = {
  python: `import heapq

def solution(operations):
    min_h, max_h = [], []
    count = 0

    for op in operations:
        cmd, val = op.split()
        num = int(val)
        if cmd == 'I':
            heapq.heappush(min_h, num)
            heapq.heappush(max_h, -num)
            count += 1
        elif count > 0:
            if num == 1:
                heapq.heappop(max_h)  # min_h에는 이 값이 그대로 남는다
            else:
                heapq.heappop(min_h)  # max_h에는 이 값이 그대로 남는다
            count -= 1
            if count == 0:            # 완전히 비었을 때만 두 힙을 비운다
                min_h.clear()
                max_h.clear()

    return [-max_h[0], min_h[0]] if count > 0 else [0, 0]`,
  javascript: `function solution(operations) {
  const minH = [], maxH = [];
  let count = 0;

  for (const op of operations) {
    const [cmd, raw] = op.split(' ');
    const num = Number(raw);
    if (cmd === 'I') {
      minH.push(num); minH.sort((a, b) => a - b);
      maxH.push(num); maxH.sort((a, b) => b - a);
      count++;
    } else if (count > 0) {
      if (num === 1) maxH.shift(); // minH에는 이 값이 그대로 남는다
      else minH.shift();           // maxH에는 이 값이 그대로 남는다
      count--;
      if (count === 0) {           // 완전히 비었을 때만 두 힙을 비운다
        minH.length = 0;
        maxH.length = 0;
      }
    }
  }
  return count > 0 ? [maxH[0], minH[0]] : [0, 0];
}`,
};
const UNSYNCED_AT = {
  init: lines(UNSYNCED, ['min_h, max_h = [], []', 'count = 0'], ['const minH = [], maxH = []', 'let count = 0']),
  insert: lines(UNSYNCED, ["if cmd == 'I':", 'heapq.heappush(min_h, num)', 'count += 1'], ["if (cmd === 'I')", 'minH.push(num)', 'count++']),
  del: lines(UNSYNCED, ['elif count > 0:', 'heapq.heappop(max_h)', 'heapq.heappop(min_h)', 'count -= 1'], ['} else if (count > 0)', 'if (num === 1) maxH.shift()', 'else minH.shift()', 'count--']),
  done: lines(UNSYNCED, ['return [-max_h[0], min_h[0]]'], ['return count > 0 ? [maxH[0], minH[0]]']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 560;
const H = 310;
const opSlot = slots({ x: 88, y: 12, w: 60, h: 34, gap: 6 });
const maxSlot = slots({ x: 96, y: 68, w: 82, h: 36, gap: 8 });
const minSlot = slots({ x: 96, y: 124, w: 82, h: 36, gap: 8 });
const aliveSlot = slots({ x: 96, y: 184, w: 82, h: 38, gap: 8 });
const ANS_RECT: Rect = { x: 96, y: 248, w: 240, h: 42 };

function board(topLabel: string, bottomLabel: string, stateLabel: string): Scene {
  const items: Item[] = [
    { id: 'lab:ops', kind: 'text', rect: { x: 0, y: 12, w: 84, h: 34 }, text: '연산 목록' },
    ...OPS.map((op, i): Item => ({ id: `op:${i}`, kind: 'cell', rect: opSlot(i), tone: 'plain', text: op })),
    { id: 'lab:max', kind: 'text', rect: { x: 0, y: 68, w: 90, h: 36 }, text: topLabel },
    { id: 'zone:max', kind: 'zone', rect: { x: 92, y: 64, w: 456, h: 44 } },
    { id: 'lab:min', kind: 'text', rect: { x: 0, y: 124, w: 90, h: 36 }, text: bottomLabel },
    { id: 'zone:min', kind: 'zone', rect: { x: 92, y: 120, w: 456, h: 44 } },
    { id: 'lab:alive', kind: 'text', rect: { x: 0, y: 184, w: 90, h: 38 }, text: stateLabel },
    { id: 'zone:alive', kind: 'zone', rect: { x: 92, y: 180, w: 456, h: 46 } },
    { id: 'ans:tok', kind: 'token', rect: ANS_RECT, tone: 'plain', text: '[최댓값, 최솟값] = -', tag: '결과' },
  ];
  return { width: W, height: H, items };
}

interface Entry { id: number; val: number }

/* ------------------------------------------------------------------ */
/* 정석 힙 두 개 + alive 표시                                           */
/* ------------------------------------------------------------------ */

function twoHeapsViz(): Visualization {
  const rec = new StepRecorder(board('최대 힙', '최소 힙', '생존(alive)'));
  const maxH: Entry[] = [];
  const minH: Entry[] = [];
  const inserted: Entry[] = [];
  const alive = new Map<number, boolean>();
  let work = 0;

  const maxId = (id: number) => `max:${id}`;
  const minId = (id: number) => `min:${id}`;
  const alvId = (id: number) => `alv:${id}`;
  const syncHeaps = (): Action[] => [
    ...maxH.map((e, k): Action => ({
      type: 'set',
      id: maxId(e.id),
      patch: { rect: maxSlot(k), tone: alive.get(e.id) ? 'queued' : 'muted' },
    })),
    ...minH.map((e, k): Action => ({
      type: 'set',
      id: minId(e.id),
      patch: { rect: minSlot(k), tone: alive.get(e.id) ? 'queued' : 'muted' },
    })),
  ];
  const meta = (op = '-') => ({
    work,
    variables: {
      op,
      maxH: `[${maxH.map((e) => (alive.get(e.id) ? e.val : `${e.val}(삭제됨)`)).join(', ')}]`,
      minH: `[${minH.map((e) => (alive.get(e.id) ? e.val : `${e.val}(삭제됨)`)).join(', ')}]`,
      alive: `[${inserted.filter((e) => alive.get(e.id)).map((e) => e.val).join(', ')}]`,
    },
  });

  rec.step({ title: '최대 힙·최소 힙과 alive 배열 준비', codeHighlights: TWO_HEAPS_AT.init, ...meta() });
  rec.phase('초기화', '최댓값용 최대 힙, 최솟값용 최소 힙, 그리고 각 원소가 아직 살아 있는지 기록할 alive 배열을 준비합니다.', TWO_HEAPS_AT.init);
  rec.do({ type: 'focus', ids: OPS.map((_, i) => `op:${i}`) });
  rec.do({ type: 'unfocus' });

  OPS.forEach((op, i) => {
    const [cmd, raw] = op.split(' ');
    const num = Number(raw);
    work++;

    if (cmd === 'I') {
      const entry: Entry = { id: i, val: num };
      const slotIdx = inserted.length;
      inserted.push(entry);
      alive.set(i, true);
      maxH.push(entry);
      maxH.sort((a, b) => b.val - a.val);
      minH.push(entry);
      minH.sort((a, b) => a.val - b.val);

      rec.step({ title: `${op}: 두 힙에 ${num} 넣고 alive = True`, codeHighlights: TWO_HEAPS_AT.insert, ...meta(op) });
      rec.phase('삽입하기', `${josa(num, '을', '를')} 최대 힙과 최소 힙에 모두 넣고, alive[${i}] = True로 표시합니다.`, TWO_HEAPS_AT.insert);
      rec.do(...together([
        { type: 'set', id: `op:${i}`, patch: { tone: 'current' } },
        { type: 'add', item: { id: maxId(i), kind: 'token', rect: maxSlot(maxH.indexOf(entry)), tone: 'queued', text: String(num) }, from: `op:${i}` },
        { type: 'add', item: { id: minId(i), kind: 'token', rect: minSlot(minH.indexOf(entry)), tone: 'queued', text: String(num) }, from: `op:${i}` },
        { type: 'add', item: { id: alvId(i), kind: 'token', rect: aliveSlot(slotIdx), tone: 'good', text: `${num}: 생존` }, from: `op:${i}` },
        ...syncHeaps(),
      ]));
      rec.do({ type: 'set', id: `op:${i}`, patch: { tone: 'visited' } });
    } else if (num === 1) {
      const deadPopped: Entry[] = [];
      while (maxH.length && !alive.get(maxH[0].id)) {
        deadPopped.push(maxH.shift()!);
        work++;
      }
      const target = maxH.shift()!;
      alive.set(target.id, false);

      rec.step({ title: `${op}: 최대 힙에서 최댓값 ${target.val} 삭제`, codeHighlights: TWO_HEAPS_AT.delMax, ...meta(op) });
      rec.phase('최댓값 삭제', `최대 힙 맨 앞의 ${josa(target.val, '을', '를')} 꺼내고 alive를 False로 바꿉니다. 최소 힙에 남아 있는 ${target.val}은 나중에 맨 앞에 오면 버립니다.`, TWO_HEAPS_AT.delMax);
      rec.do(...together([
        { type: 'set', id: `op:${i}`, patch: { tone: 'current' } },
        ...deadPopped.map((d): Action => ({ type: 'remove', id: maxId(d.id) })),
        { type: 'remove', id: maxId(target.id), into: alvId(target.id) },
        { type: 'set', id: alvId(target.id), patch: { tone: 'muted', text: `${target.val}: 삭제됨` } },
        ...syncHeaps(),
      ]));
      rec.do({ type: 'set', id: `op:${i}`, patch: { tone: 'visited' } });
    } else {
      const deadPopped: Entry[] = [];
      while (minH.length && !alive.get(minH[0].id)) {
        deadPopped.push(minH.shift()!);
        work++;
      }
      const target = minH.shift()!;
      alive.set(target.id, false);

      rec.step({ title: `${op}: 최소 힙에서 최솟값 ${target.val} 삭제`, codeHighlights: TWO_HEAPS_AT.delMin, ...meta(op) });
      rec.phase('최솟값 삭제', `최소 힙 맨 앞의 ${josa(target.val, '을', '를')} 꺼내고 alive를 False로 바꿉니다. 최대 힙에 있는 ${target.val}도 삭제됨(회색)으로 표시됩니다.`, TWO_HEAPS_AT.delMin);
      rec.do(...together([
        { type: 'set', id: `op:${i}`, patch: { tone: 'current' } },
        ...deadPopped.map((d): Action => ({ type: 'remove', id: minId(d.id) })),
        { type: 'remove', id: minId(target.id), into: alvId(target.id) },
        { type: 'set', id: alvId(target.id), patch: { tone: 'muted', text: `${target.val}: 삭제됨` } },
        ...syncHeaps(),
      ]));
      rec.do({ type: 'set', id: `op:${i}`, patch: { tone: 'visited' } });
    }
  });

  const deadMax: Entry[] = [];
  while (maxH.length && !alive.get(maxH[0].id)) {
    deadMax.push(maxH.shift()!);
    work++;
  }
  const deadMin: Entry[] = [];
  while (minH.length && !alive.get(minH[0].id)) {
    deadMin.push(minH.shift()!);
    work++;
  }
  const answer = [maxH[0].val, minH[0].val];

  rec.step({
    title: `죽은 원소 정리 후 정답 [${answer[0]}, ${answer[1]}]`,
    codeHighlights: TWO_HEAPS_AT.finalClean,
    ...meta('종료 정리'),
    answer,
    isKeyframe: true,
  });
  rec.phase('유령 원소 정리 및 정답', `마지막에 최대 힙 꼭대기에 남아 있던 이미 삭제된 원소(${deadMax.map((d) => d.val).join(', ')})와 최소 힙의 이미 삭제된 원소를 걷어내면 살아 있는 최댓값 ${answer[0]}, 최솟값 ${josa(answer[1], '이', '가')} 남습니다.`, TWO_HEAPS_AT.finalClean);
  rec.do(...together([
    ...deadMax.map((d): Action => ({ type: 'remove', id: maxId(d.id) })),
    ...deadMin.map((d): Action => ({ type: 'remove', id: minId(d.id) })),
    ...syncHeaps(),
    { type: 'set', id: maxId(maxH[0].id), patch: { tone: 'path' } },
    { type: 'set', id: minId(minH[0].id), patch: { tone: 'path' } },
    { type: 'set', id: 'ans:tok', patch: { text: `[최댓값, 최솟값] = [${answer[0]}, ${answer[1]}]`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 배열에서 매번 탐색·삭제                                         */
/* ------------------------------------------------------------------ */

function arrayScanViz(): Visualization {
  const rec = new StepRecorder(board('배열(arr)', '(미사용)', '탐색 상태'));
  const arr: Entry[] = [];
  let work = 0;
  const itemId = (id: number) => `arr:${id}`;
  const syncArr = (): Action[] =>
    arr.map((e, k): Action => ({ type: 'set', id: itemId(e.id), patch: { rect: maxSlot(k), tone: 'queued' } }));
  const meta = (op = '-') => ({
    work,
    variables: { op, arr: `[${arr.map((e) => e.val).join(', ')}]` },
  });

  rec.step({ title: '빈 배열 하나로 시작하기', codeHighlights: ARRAY_AT.init, ...meta() });
  rec.phase('초기화', '힙 대신 배열 하나에 원소를 담고, 삭제할 때마다 배열 전체를 훑어 최댓값이나 최솟값을 찾습니다.', ARRAY_AT.init);
  rec.do({ type: 'focus', ids: OPS.map((_, i) => `op:${i}`) });
  rec.do({ type: 'unfocus' });

  OPS.forEach((op, i) => {
    const [cmd, raw] = op.split(' ');
    const num = Number(raw);
    if (cmd === 'I') {
      const entry = { id: i, val: num };
      arr.push(entry);
      work++;
      rec.step({ title: `${op}: 배열 끝에 ${num} 추가`, codeHighlights: ARRAY_AT.insert, ...meta(op) });
      rec.phase('추가하기', `배열 맨 뒤에 ${josa(num, '을', '를')} 넣습니다.`, ARRAY_AT.insert);
      rec.do(...together([
        { type: 'set', id: `op:${i}`, patch: { tone: 'current' } },
        { type: 'add', item: { id: itemId(i), kind: 'token', rect: maxSlot(arr.length - 1), tone: 'queued', text: String(num) }, from: `op:${i}` },
      ]));
      rec.do({ type: 'set', id: `op:${i}`, patch: { tone: 'visited' } });
    } else {
      work += arr.length * 2; // 전체 훑기 + splice 밀기
      let best = 0;
      for (let k = 1; k < arr.length; k++) {
        if (num === 1 ? arr[k].val > arr[best].val : arr[k].val < arr[best].val) best = k;
      }
      const [removed] = arr.splice(best, 1);
      rec.step({ title: `${op}: 배열 전체를 훑어 ${removed.val} 삭제`, codeHighlights: ARRAY_AT.remove, ...meta(op) });
      rec.phase('훑어서 지우기', `배열의 모든 원소를 비교해 ${num === 1 ? '최댓값' : '최솟값'} ${josa(removed.val, '을', '를')} 찾아 지우고 뒷부분을 당깁니다.`, ARRAY_AT.remove);
      rec.do({ type: 'focus', ids: [itemId(removed.id)] });
      rec.do(...together([
        { type: 'unfocus' },
        { type: 'set', id: `op:${i}`, patch: { tone: 'visited' } },
        { type: 'remove', id: itemId(removed.id) },
        ...syncArr(),
      ]));
    }
  });

  work += arr.length * 2;
  const answer = [arr[0].val, arr[0].val];
  rec.step({ title: `정답 [${answer[0]}, ${answer[1]}] (매번 선형 탐색)`, codeHighlights: ARRAY_AT.done, ...meta('완료'), answer, isKeyframe: true });
  rec.phase('정답', `남은 원소에서 최댓값과 최솟값을 구해 [${answer[0]}, ${answer[1]}]을 얻습니다. 삭제할 때마다 배열 전체를 훑어 연산이 ${work}번 들었고, 연산이 100만 개면 O(N²)으로 시간 초과가 납니다.`, ARRAY_AT.done);
  rec.do(...together([
    { type: 'set', id: itemId(arr[0].id), patch: { tone: 'path' } },
    { type: 'set', id: 'ans:tok', patch: { text: `[최댓값, 최솟값] = [${answer[0]}, ${answer[1]}]`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 개수(count)만 세고 반대편 힙에 삭제된 원소를 남기기(오답)        */
/* ------------------------------------------------------------------ */

function unsyncedHeapsViz(): Visualization {
  const rec = new StepRecorder(board('최대 힙', '최소 힙', '개수(count)'));
  const maxH: Entry[] = [];
  const minH: Entry[] = [];
  let count = 0;
  let work = 0;
  const maxId = (id: number) => `max:${id}`;
  const minId = (id: number) => `min:${id}`;
  const syncHeaps = (): Action[] => [
    ...maxH.map((e, k): Action => ({ type: 'set', id: maxId(e.id), patch: { rect: maxSlot(k) } })),
    ...minH.map((e, k): Action => ({ type: 'set', id: minId(e.id), patch: { rect: minSlot(k) } })),
  ];
  const meta = (op = '-') => ({
    work,
    variables: {
      op,
      count,
      maxH: `[${maxH.map((e) => e.val).join(', ')}]`,
      minH: `[${minH.map((e) => e.val).join(', ')}]`,
    },
  });

  rec.step({ title: 'alive 없이 count만 세기', codeHighlights: UNSYNCED_AT.init, ...meta() });
  rec.phase('초기화', '개별 원소의 삭제 여부를 기록하지 않고 전체 개수 count만 세어 봅니다.', UNSYNCED_AT.init);
  rec.do({ type: 'add', item: { id: 'cnt:tok', kind: 'token', rect: aliveSlot(0), tone: 'plain', text: 'count = 0' } });

  OPS.forEach((op, i) => {
    const [cmd, raw] = op.split(' ');
    const num = Number(raw);
    work++;
    if (cmd === 'I') {
      const entry = { id: i, val: num };
      maxH.push(entry);
      maxH.sort((a, b) => b.val - a.val);
      minH.push(entry);
      minH.sort((a, b) => a.val - b.val);
      count++;
      rec.step({ title: `${op}: 두 힙에 ${num} 넣고 count = ${count}`, codeHighlights: UNSYNCED_AT.insert, ...meta(op) });
      rec.phase('삽입하기', `두 힙에 ${josa(num, '을', '를')} 넣고 count를 ${count}로 늘립니다.`, UNSYNCED_AT.insert);
      rec.do(...together([
        { type: 'set', id: `op:${i}`, patch: { tone: 'visited' } },
        { type: 'add', item: { id: maxId(i), kind: 'token', rect: maxSlot(maxH.indexOf(entry)), tone: 'queued', text: String(num) }, from: `op:${i}` },
        { type: 'add', item: { id: minId(i), kind: 'token', rect: minSlot(minH.indexOf(entry)), tone: 'queued', text: String(num) }, from: `op:${i}` },
        { type: 'set', id: 'cnt:tok', patch: { text: `count = ${count}`, tone: 'chosen' }, pop: true },
        ...syncHeaps(),
      ]));
    } else if (num === 1) {
      const popped = maxH.shift()!;
      count--;
      rec.step({ title: `${op}: 최대 힙에서만 ${popped.val} 제거 (최소 힙엔 남음)`, codeHighlights: UNSYNCED_AT.del, ...meta(op) });
      rec.phase('한쪽만 꺼내기', `최대 힙에서만 ${josa(popped.val, '을', '를')} 꺼내고, 최소 힙에 남아 있는 ${popped.val}은 그대로 둡니다.`, UNSYNCED_AT.del);
      rec.do(...together([
        { type: 'set', id: `op:${i}`, patch: { tone: 'visited' } },
        { type: 'remove', id: maxId(popped.id) },
        { type: 'set', id: minId(popped.id), patch: { tone: 'bad', text: `${popped.val}(유령)` } },
        { type: 'set', id: 'cnt:tok', patch: { text: `count = ${count}` }, pop: true },
        ...syncHeaps(),
      ]));
    } else {
      const popped = minH.shift()!;
      count--;
      rec.step({ title: `${op}: 최소 힙에서만 ${popped.val} 제거 (최대 힙엔 남음)`, codeHighlights: UNSYNCED_AT.del, ...meta(op) });
      rec.phase('한쪽만 꺼내기', `최소 힙에서만 ${josa(popped.val, '을', '를')} 꺼내고, 최대 힙에 남아 있는 ${popped.val}은 그대로 둡니다.`, UNSYNCED_AT.del);
      rec.do(...together([
        { type: 'set', id: `op:${i}`, patch: { tone: 'visited' } },
        { type: 'remove', id: minId(popped.id) },
        { type: 'set', id: maxId(popped.id), patch: { tone: 'bad', text: `${popped.val}(유령)` } },
        { type: 'set', id: 'cnt:tok', patch: { text: `count = ${count}` }, pop: true },
        ...syncHeaps(),
      ]));
    }
  });

  const answer = [maxH[0].val, minH[0].val];
  rec.step({
    title: `오답: 이미 지운 10이 최대 힙 맨 앞에 남아 [${answer[0]}, ${answer[1]}]`,
    codeHighlights: UNSYNCED_AT.done,
    ...meta('종료'),
    answer,
    isKeyframe: true,
  });
  rec.phase('오답 확인', `count가 중간에 0이 된 적이 없어 두 힙을 비우지 못했습니다. D -1로 이미 삭제된 10이 최대 힙 꼭대기에 남아 [${answer[0]}, ${answer[1]}](정답 [5, 5])이라는 오답이 나옵니다.`, UNSYNCED_AT.done);
  rec.do({ type: 'arrow', from: maxId(maxH[0].id), to: 'ans:tok', verdict: 'bad', label: '이미 삭제된 10' });
  rec.do({ type: 'set', id: 'ans:tok', patch: { text: `오답 [${answer[0]}, ${answer[1]}] (정답 [5, 5])`, tone: 'bad' }, pop: true });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'double-priority-queue',
  title: '이중우선순위큐',
  level: 3,
  category: 'heap',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42628',
  description: {
    summary:
      '숫자를 삽입하는 "I 숫자", 최댓값을 지우는 "D 1", 최솟값을 지우는 "D -1" 연산을 차례대로 처리하는 이중 우선순위 큐를 구현합니다. 모든 연산을 끝낸 뒤 큐가 비어 있으면 [0, 0]을, 비어 있지 않으면 [최댓값, 최솟값]을 돌려줍니다.',
    rules: [
      'operations는 길이가 1 이상 1,000,000 이하인 문자열 배열입니다.',
      '"I 숫자"는 큐에 주어진 숫자를 삽입합니다.',
      '"D 1"은 큐에서 최댓값을 삭제하고, "D -1"은 큐에서 최솟값을 삭제합니다.',
      '빈 큐에 데이터를 삭제하라는 연산이 주어질 경우, 해당 연산은 무시합니다.',
      '최댓값/최솟값이 둘 이상인 경우, 하나만 삭제합니다.',
    ],
    examples: [
      { input: 'operations = ["I 16", "I -5643", "D -1", "D 1", "D 1", "I 123", "D -1"]', output: '[0, 0]' },
      { input: 'operations = ["I -45", "I 653", "D 1", "I -642", "I 45", "I 97", "D 1", "D -1", "I 333"]', output: '[333, -45]' },
    ],
  },
  keyIntuitions: [
    '최솟값과 최댓값을 모두 빠르게 꺼내려면 최소 힙과 최대 힙 두 개를 함께 두어야 합니다.',
    '한쪽 힙에서 지운 원소를 다른 쪽 힙에서 즉시 찾아 지우면 O(N)이 걸리므로, 원소마다 고유 번호(id)와 생존 여부(alive)만 기록해 두고 나중에 반대편 힙 꼭대기에 올라왔을 때 버립니다(지연 삭제).',
    '모든 연산이 끝난 뒤에도 두 힙 꼭대기에 이미 삭제된 원소가 남아 있을 수 있으므로 마지막에 한 번 더 청소해야 합니다.',
  ],
  demo: { input: [OPS], label: `operations = [${OPS.map((s) => `"${s}"`).join(', ')}]` },
  workUnit: '힙·배열 연산 수',
  approaches: [
    {
      id: 'double-pq-two-heaps',
      name: '힙 두 개 + 생존 표시 (지연 삭제)',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '최소 힙과 최대 힙 두 개를 두고, 반대편 힙에서 삭제된 원소는 alive 배열로 걸러 내는 정석 풀이입니다.',
      pros: [
        '각 원소가 두 힙에 최대 한 번씩 들어가고 한 번씩 나오므로 100만 개 연산도 O(N log N)에 끝납니다.',
        '중복된 숫자가 들어와도 연산 인덱스 i를 고유 번호로 함께 넣으면 정확히 하나만 지울 수 있습니다.',
      ],
      cons: ['연산 루프가 끝난 뒤 두 힙의 꼭대기를 한 번 더 청소하는 단계를 잊기 쉽습니다.'],
      whyThisRank:
        '최댓값과 최솟값 삭제를 모두 O(log N)에 처리하면서 두 힙의 상태를 어긋나지 않게 맞추는 표준 기법입니다.',
      code: TWO_HEAPS,
      visualize: twoHeapsViz,
    },
    {
      id: 'double-pq-array-scan',
      name: '배열 하나에서 매번 최댓값·최솟값 찾아 지우기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '배열 하나에 값을 모아 두고 삭제할 때마다 전체 배열을 훑어 최댓값이나 최솟값을 지우는 풀이입니다.',
      pros: ['힙 동기화를 신경 쓸 필요가 없어 구현이 매우 단순합니다.'],
      cons: [
        '삭제 연산마다 배열 전체를 탐색하고 당겨야 해서 최악 시간 복잡도가 O(N²)입니다.',
        '연산 수가 최대 100만 개이므로 큰 입력에서는 시간 초과가 납니다.',
      ],
      whyThisRank:
        '작은 테스트에서는 정확한 답을 내지만 삭제할 때마다 O(N)이 걸려 힙을 쓰는 정석보다 훨씬 많은 원소를 확인합니다.',
      code: ARRAY_SCAN,
      visualize: arrayScanViz,
    },
    {
      id: 'double-pq-unsynced',
      name: '개수(count)만 세고 개별 삭제 여부를 기록하지 않기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: 'count가 0일 때만 두 힙을 비우고, 중간에 반대편 힙에서 삭제된 원소를 걸러 내지 않는 오답 풀이입니다.',
      pros: ['alive 배열 없이 변수 하나로 해결하려 해 코드가 짧아 보입니다.'],
      cons: [
        '큐가 완전히 비지 않은 채 삭제와 삽입이 섞이면, 최소 힙에서 이미 지운 원소가 최대 힙 꼭대기에 그대로 남습니다.',
      ],
      whyThisRank:
        'count > 0인 동안에는 반대편 힙에서 지워진 유령 원소를 구분할 방법이 없어 잘못된 최댓값·최솟값을 반환합니다.',
      code: UNSYNCED,
      visualize: unsyncedHeapsViz,
    },
  ],
  checks: {
    cases: [
      { args: [['I 16', 'I -5643', 'D -1', 'D 1', 'D 1', 'I 123', 'D -1']], expected: [0, 0] },
      { args: [['I -45', 'I 653', 'D 1', 'I -642', 'I 45', 'I 97', 'D 1', 'D -1', 'I 333']], expected: [333, -45] },
      { args: [OPS], expected: [5, 5] },
      { args: [['D 1', 'D -1', 'I 7', 'I 7', 'D 1']], expected: [7, 7] },
      { args: [['I 1', 'I 2', 'I 3', 'D -1', 'D 1']], expected: [2, 2] },
    ],
    random: (rand) => {
      const len = 3 + Math.floor(rand() * 10);
      const ops = Array.from({ length: len }, () => {
        const r = rand();
        if (r < 0.55) return `I ${Math.floor(rand() * 41) - 20}`;
        return r < 0.78 ? 'D 1' : 'D -1';
      });
      return [ops];
    },
  },
};

export default problem;
