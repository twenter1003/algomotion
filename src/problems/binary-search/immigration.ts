// 입국심사: 정석 이분 탐색, 대안 최소 힙 시뮬레이션, 함정 1분씩 늘리기를 같은 장면에서 움직인다.
// 장면은 위에 시간 수직선(탐색 구간, mid·t·finish 표시, answer 표시), 가운데 심사관 줄, 아래에 합계 막대다.
// 심사관 줄은 수직선과 같은 시간축이라, i번 심사관의 k번째(0부터) 사람은 [k × times[i], (k + 1) × times[i]]분 칸에 놓인다.
import { Lane } from '../../engine/lane.ts';
import { axis } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { lines, ro, sum, together } from '../shared.ts';

// 원문 예제. 세 풀이의 시각화 입력이자 첫 점검 사례다.
const N = 6;
const TIMES = [7, 10];
const MAX = Math.max(...TIMES) * N; // 60분: 가장 느린 심사관 혼자 모두 맡는 시간 = 이분 탐색의 오른쪽 끝
const served = (T: number) => TIMES.map((t) => Math.floor(T / t)); // T분 동안 심사관마다 끝내는 인원

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BINARY = {
  python: `def solution(n, times):
    left, right = 1, max(times) * n  # 가장 느린 심사관 혼자 n명을 맡는 시간
    answer = right

    while left <= right:
        mid = (left + right) // 2
        # mid분 동안 심사관 전원이 처리할 수 있는 인원
        total = sum(mid // t for t in times)

        if total >= n:     # 충분하다 → 답 후보로 저장하고 더 짧게
            answer = mid
            right = mid - 1
        else:              # 부족하다 → 시간을 늘린다
            left = mid + 1

    return answer`,
  javascript: `function solution(n, times) {
  let left = 1;
  let right = Math.max(...times) * n; // 가장 느린 심사관 혼자 n명을 맡는 시간
  let answer = right;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // mid분 동안 심사관 전원이 처리할 수 있는 인원
    let total = 0;
    for (const t of times) total += Math.floor(mid / t);

    if (total >= n) { // 충분하다 → 답 후보로 저장하고 더 짧게
      answer = mid;
      right = mid - 1;
    } else { // 부족하다 → 시간을 늘린다
      left = mid + 1;
    }
  }

  return answer;
}`,
};
const BINARY_AT = {
  start: lines(BINARY, ['left, right = 1', 'answer = right'], ['let left = 1', 'let right = Math.max', 'let answer = right']),
  mid: lines(BINARY, ['while left <= right', 'mid = (left + right) // 2'], ['while (left <= right)', 'const mid = Math.floor']),
  count: lines(BINARY, ['total = sum('], ['let total = 0', 'for (const t of times)']),
  pass: lines(BINARY, ['if total >= n', 'answer = mid', 'right = mid - 1'], ['if (total >= n)', 'answer = mid', 'right = mid - 1']),
  fail: lines(BINARY, ['if total >= n', 'else:', 'left = mid + 1'], ['if (total >= n)', '} else {', 'left = mid + 1']),
  done: lines(BINARY, ['while left <= right', 'return answer'], ['while (left <= right)', 'return answer']),
};

const HEAP = {
  python: `import heapq

def solution(n, times):
    # (다음 심사가 끝나는 시각, 심사 시간)
    heap = [(t, t) for t in times]
    heapq.heapify(heap)

    finish = 0
    for _ in range(n):  # 사람마다 힙 연산 → n이 10억이면 시간 초과
        end, t = heapq.heappop(heap)
        finish = end
        heapq.heappush(heap, (end + t, t))
    return finish`,
  javascript: `function solution(n, times) {
  // [다음 심사가 끝나는 시각, 심사 시간]을 담는 최소 힙 (정렬된 배열은 이미 힙입니다)
  const heap = times.map((t) => [t, t]).sort((a, b) => a[0] - b[0]);
  const siftDown = (i) => {
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let min = i;
      if (l < heap.length && heap[l][0] < heap[min][0]) min = l;
      if (r < heap.length && heap[r][0] < heap[min][0]) min = r;
      if (min === i) return;
      [heap[min], heap[i]] = [heap[i], heap[min]];
      i = min;
    }
  };

  let finish = 0;
  for (let k = 0; k < n; k++) { // 사람마다 힙 연산 → n이 10억이면 시간 초과
    const [end, t] = heap[0];
    finish = end;
    heap[0] = [end + t, t]; // 루트 값만 커지므로 아래로 내리면 됩니다
    siftDown(0);
  }
  return finish;
}`,
};
const HEAP_AT = {
  start: lines(HEAP, ['heap = [(t, t) for t in times]', 'heapq.heapify(heap)'], ['const heap = times.map']),
  pop: lines(HEAP, ['for _ in range(n)', 'end, t = heapq.heappop(heap)'], ['for (let k = 0; k < n; k++)', 'const [end, t] = heap[0]']),
  assign: lines(HEAP, ['finish = end'], ['finish = end']),
  push: lines(HEAP, ['heapq.heappush(heap, (end + t, t))'], ['heap[0] = [end + t, t]', 'siftDown(0)']),
  done: lines(HEAP, ['return finish'], ['return finish']),
};

const LINEAR = {
  python: `def solution(n, times):
    t = 1
    while sum(t // time for time in times) < n:
        t += 1  # 답이 10^18이면 10^18번 반복
    return t`,
  javascript: `function solution(n, times) {
  let t = 1;
  while (times.reduce((acc, time) => acc + Math.floor(t / time), 0) < n) {
    t++; // 답이 10^18이면 10^18번 반복
  }
  return t;
}`,
};
const LINEAR_AT = {
  start: lines(LINEAR, ['t = 1'], ['let t = 1']),
  check: lines(LINEAR, ['while sum('], ['while (times.reduce(']),
  next: lines(LINEAR, ['t += 1'], ['t++']),
  loop: lines(LINEAR, ['while sum(', 't += 1'], ['while (times.reduce(', 't++']),
  done: lines(LINEAR, ['return t'], ['return t']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 위에서부터 answer 이름표 · left, right(대안은 힙 줄) · mid, t, finish 이름표 · 수직선 · 심사관 줄 · 합계 막대.
// 이름표마다 줄을 따로 두어 값이 가까워져도 겹치지 않고, 시각 표시 선은 제 이름표 아래에서 시작해 left, right를 지나지 않는다.
const tx = axis({ x: 96, w: 360, min: 0, max: MAX }); // 시각(분) → x, 1분에 6px
const TRACK_Y = 108;
const rowRect = (i: number): Rect => ({ x: 92, y: 132 + i * 54, w: 368, h: 44 });
const ROWS_END = rowRect(TIMES.length - 1).y + 44;
const TALLY_Y = ROWS_END + 22; // 판정 표시가 마지막 심사관 줄과 겹치지 않을 만큼 띄운다
const W = 540;
const H = TALLY_Y + 44;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다

const personId = (i: number, k: number) => `person:${i}:${k}`;
const person = (i: number, k: number, text: string): Item => {
  const [from, to] = [tx(k * TIMES[i]), tx((k + 1) * TIMES[i])];
  return { id: personId(i, k), kind: 'cell', rect: { x: from + 2, y: rowRect(i).y + 4, w: to - from - 4, h: 36 }, tone: 'visited', text };
};
// i번 심사관 줄에 지금 놓인 사람 칸(앞에서부터 빈틈없이 놓인다)
const persons = (rec: StepRecorder, i: number): string[] => {
  const ids: string[] = [];
  for (let k = 0; rec.has(personId(i, k)); k++) ids.push(personId(i, k));
  return ids;
};

// 정석의 탐색 구간 [l, r]: 분 v를 [v - 0.5, v + 0.5] 칸으로 보고, left는 구간 왼쪽 바깥, right는 오른쪽 바깥에 붙인다
// (left가 right를 넘어서도 두 이름표가 겹치지 않는다)
const range = (l: number, r: number): Item[] => [
  { id: 'range', kind: 'zone', rect: { x: tx(l - 0.5), y: 96, w: tx(r + 0.5) - tx(l - 0.5), h: 24 } },
  { id: 'left', kind: 'token', rect: { x: tx(l - 0.5) - 76, y: 30, w: 76, h: 24 }, tone: 'plain', text: `left ${l}` },
  { id: 'right', kind: 'token', rect: { x: tx(r + 0.5), y: 30, w: 76, h: 24 }, tone: 'plain', text: `right ${r}` },
];
const answerLabel = (v: number): Item =>
  ({ id: 'answer', kind: 'token', rect: { x: tx(v) - 42, y: 0, w: 84, h: 24 }, tone: 'path', text: `answer ${v}` });

// 세 풀이가 같이 쓰는 장면: 수직선, 심사관 줄(이름, 속도, 줄 바탕, 계산 글), 합계 막대와 목표
function board(...extra: Item[]): Scene {
  const items: Item[] = [{ id: 'track', kind: 'line', rect: FULL, tone: 'trail', points: [[tx(0), TRACK_Y], [tx(MAX), TRACK_Y]] }];
  TIMES.forEach((t, i) => {
    const row = rowRect(i);
    items.push(
      { id: `name:${i}`, kind: 'text', rect: { x: 0, y: row.y, w: 88, h: 22 }, text: `${i + 1}번 심사관` },
      { id: `speed:${i}`, kind: 'text', rect: { x: 0, y: row.y + 22, w: 88, h: 22 }, tone: 'muted', text: `${t}분에 1명` },
      { id: `row:${i}`, kind: 'zone', rect: row },
      { id: `calc:${i}`, kind: 'text', rect: { x: 324, y: row.y, w: 128, h: 44 }, text: '' },
    );
  });
  items.push(
    { id: 'sum', kind: 'text', rect: { x: 0, y: TALLY_Y, w: 88, h: 36 }, text: '합계' },
    { id: 'tally', kind: 'bar', rect: { x: 96, y: TALLY_Y, w: 240, h: 36 }, fill: 0, text: '0명' },
    { id: 'goal', kind: 'token', rect: { x: 344, y: TALLY_Y, w: 72, h: 36 }, tone: 'plain', text: `${N}명`, tag: '목표' },
    ...extra,
  );
  return { width: W, height: H, items };
}

// 처음이면 그 자리에 나타나고, 이미 있으면 미끄러져 옮겨 가며 글과 색을 바꾼다
const put = (rec: StepRecorder, { id, kind, ...patch }: Item): Action =>
  rec.has(id) ? { type: 'set', id, patch } : { type: 'add', item: { id, kind, ...patch } };
// 시각 표시: 이름표와, 그 아래로 수직선과 심사관 줄을 꿰뚫는 선. 정석은 mid, 함정은 t, 대안은 finish를 가리킨다
const probeTo = (rec: StepRecorder, v: number, text: string, tone: Tone): Action[] => [
  put(rec, { id: 'probe', kind: 'token', rect: { x: tx(v) - 2, y: 90, w: 4, h: ROWS_END - 90 }, tone }),
  put(rec, { id: 'probe:label', kind: 'token', rect: { x: tx(v) - 42, y: 64, w: 84, h: 26 }, tone, text }),
];
const setText = (id: string, text: string): Action => ({ type: 'set', id, patch: { text } });
// i번 심사관의 계산 글: '⌊28 ÷ 7⌋ = 4명'
const calcAt = (i: number, T: number): Action => setText(`calc:${i}`, `⌊${T} ÷ ${TIMES[i]}⌋ = ${served(T)[i]}명`);
const tallyTo = (total: number, tone: Tone): Action =>
  ({ type: 'set', id: 'tally', patch: { fill: Math.min(1, total / N), text: `${total}명`, tone } });
// 판정: 합계에서 목표로 화살표를 긋고 목표 위에 '충분' 또는 '부족'
const verdict = (enough: boolean): Action =>
  ({ type: 'arrow', from: 'tally', to: 'goal', verdict: enough ? 'good' : 'bad', label: enough ? '충분' : '부족' });
// '⌊28 ÷ 7⌋ + ⌊28 ÷ 10⌋ = 4 + 2 = 6명'
const formula = (T: number) => `${TIMES.map((t) => `⌊${T} ÷ ${t}⌋`).join(' + ')} = ${served(T).join(' + ')} = ${sum(served(T))}명`;

// i번 심사관 줄의 사람 칸을 k개로 맞춘다: 모자라면 더하고(칸 글은 1, 2, 3 …), 넘치면 지운다
const fit = (rec: StepRecorder, i: number, k: number): Action[] => {
  const acts: Action[] = [];
  for (let j = 0; j < k || rec.has(personId(i, j)); j++) {
    if (j >= k) acts.push({ type: 'remove', id: personId(i, j) });
    else if (!rec.has(personId(i, j))) acts.push({ type: 'add', item: person(i, j, String(j + 1)) });
  }
  return acts;
};

// 세어 보기: 심사관마다 그 줄만 밝혀 T분 안에 끝나는 사람 칸을 맞추고 계산 글을 쓴 뒤, 합계 막대를 채운다
const countAt = (rec: StepRecorder, T: number) => {
  served(T).forEach((k, i) => rec.do(...together([
    ...fit(rec, i, k),
    calcAt(i, T),
    { type: 'focus', ids: Array.from({ length: k }, (_, j) => personId(i, j)) },
  ])));
  const total = sum(served(T));
  rec.do(...together([{ type: 'unfocus' }, tallyTo(total, total >= N ? 'good' : 'bad')]));
};

// 정답: 놓인 사람 칸을 모두 분홍으로
const crown = (rec: StepRecorder): Action[] =>
  TIMES.flatMap((_, i) => persons(rec, i)).map((id): Action => ({ type: 'set', id, patch: { tone: 'path' } }));

/* ------------------------------------------------------------------ */
/* 정석 이분 탐색: 가운데 고르기 → 세어 보기 → 범위 줄이기                */
/* ------------------------------------------------------------------ */

function binarySearch(): Visualization {
  const rec = new StepRecorder(board());
  let [left, right] = [1, MAX];
  let answer = right;
  let mid = 0; // 0이면 아직 고르지 않음
  let loops = 0;
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({ work: loops, variables: { left, right, mid: mid || '-', total: mid ? sum(served(mid)) : '-', answer } });

  rec.step({ title: `탐색 구간 1분 ~ ${MAX}분 정하기`, codeHighlights: BINARY_AT.start, ...meta() });
  rec.phase('시작', `답은 1분과 ${MAX}분 사이에 있습니다. ${MAX}분은 가장 느린 심사관 혼자 ${N}명을 모두 맡는 시간이라 늘 되므로 answer = ${MAX}에서 시작합니다.`);
  rec.do(...together(range(left, right).map((it) => put(rec, it))));
  rec.do(put(rec, answerLabel(answer)));

  while (left <= right) {
    const [l, r] = [left, right];
    mid = Math.floor((left + right) / 2);
    loops++;
    const total = sum(served(mid));
    const enough = total >= N;
    if (enough) [answer, right] = [mid, mid - 1];
    else left = mid + 1;
    const decide = enough ? BINARY_AT.pass : BINARY_AT.fail;

    rec.step({ title: `mid ${mid}분 → ${total}명, ${enough ? '더 짧게' : '더 길게'}`, codeHighlights: decide, ...meta() });
    rec.phase('가운데 고르기', `mid = ⌊(${l} + ${r}) ÷ 2⌋ = ${mid}분입니다. ${mid}분이면 ${N}명을 모두 심사할 수 있을까요?`, BINARY_AT.mid);
    rec.do(...together(probeTo(rec, mid, `mid ${mid}`, 'current')));

    const ks = served(mid);
    rec.phase('세어 보기',
      `${TIMES.map((t, i) => `${i + 1}번 심사관은 ⌊${mid} ÷ ${t}⌋ = ${ks[i]}명`).join(', ')}, 모두 ${total}명을 심사합니다.`, BINARY_AT.count);
    countAt(rec, mid);

    rec.phase('범위 줄이기', enough
      ? `${total}명 ≥ ${N}명이라 ${mid}분이면 충분합니다. answer = ${ro(mid)} 저장하고, 더 짧은 시간을 보려고 right = ${ro(right)} 줄입니다.`
      : `${total}명 < ${N}명이라 ${mid}분으로는 부족합니다. 시간을 늘려야 하므로 left = ${ro(left)} 올립니다.${left > right ? ' 이제 left가 right보다 큽니다.' : ''}`,
    decide);
    const [zone, leftMark, rightMark] = range(left, right);
    rec.do(verdict(enough));
    rec.do(...together([put(rec, zone), put(rec, enough ? rightMark : leftMark), ...(enough ? [put(rec, answerLabel(answer))] : [])]));
    rec.do({ type: 'clearMarks' });
  }

  // 반복을 끝낸 뒤 답을 확인한다: answer 이름표가 mid 표시 자리로 내려와 분홍 선이 되고, 그 시각의 사람 칸을 다시 센다
  const ks = served(answer);
  rec.step({ title: `최소 시간 ${answer}분`, codeHighlights: BINARY_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `반복 ${loops}번 만에 left가 right보다 커져(${left} > ${right}) 끝났습니다. 답은 ${answer}분입니다. ${answer}분이면 ${
    TIMES.map((_, i) => `${i + 1}번 심사관이 ${ks[i]}명`).join(', ')}을 맡아 ${N}명을 모두 심사합니다.`);
  rec.do(...together([
    { type: 'remove', id: 'answer' },
    ...probeTo(rec, answer, `answer ${answer}`, 'path'),
    { type: 'remove', id: 'range' },
    { type: 'set', id: 'left', patch: { tone: 'muted' } },
    { type: 'set', id: 'right', patch: { tone: 'muted' } },
  ]));
  rec.do(...together([
    ...ks.flatMap((k, i) => [...fit(rec, i, k), calcAt(i, answer)]),
    tallyTo(sum(ks), 'good'),
  ]));
  rec.do(...together(crown(rec)));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 최소 힙: 꺼내기 → 배정하기 → 다시 넣기                           */
/* ------------------------------------------------------------------ */

// 힙 항목: (끝나는 시각, 심사관 번호). 줄도 힙도 Python 튜플 (end, t)와 같은 순서로 둔다
interface Entry { end: number; i: number }
const byEnd = (a: Entry, b: Entry) => a.end - b.end || TIMES[a.i] - TIMES[b.i];

function heapSimulation(): Visualization {
  const rec = new StepRecorder(board(
    { id: 'heap:label', kind: 'text', rect: { x: 0, y: 14, w: 88, h: 34 }, text: '힙' },
    { id: 'heap:bg', kind: 'zone', rect: { x: 92, y: 14, w: 208, h: 34 } },
  ));
  const lane = new Lane(rec, { id: 'heap', x: 96, y: 17, slotW: 96, slotH: 28, gap: 8, max: TIMES.length });
  const heap: Entry[] = TIMES.map((t, i) => ({ end: t, i })).sort(byEnd);
  const assigned = TIMES.map(() => 0); // 심사관마다 맡은 사람 수
  let k = 0; // 배정한 사람 수
  let finish = 0;
  let popped: Entry | undefined;
  const token = ({ end, i }: Entry) => ({ id: `heap:${end}:${i}`, text: `${end}분 · ${i + 1}번` });
  const tuple = ({ end, i }: Entry) => `(${end}, ${TIMES[i]})`;
  const meta = () => ({
    work: k,
    variables: { '배정한 사람': `${k}명`, '(end, t)': popped ? tuple(popped) : '-', finish, heap: `[${heap.map(tuple).join(', ')}]` },
  });

  const first = heap[0];
  rec.step({ title: '심사관마다 첫 사람이 끝나는 시각을 힙에 넣기', codeHighlights: HEAP_AT.start, ...meta() });
  rec.phase('시작', `심사관마다 '다음 사람을 맡으면 끝나는 시각'을 힙에 넣습니다. ${token(first).text}은 ${first.i + 1}번 심사관에게 가면 ${first.end}분에 끝난다는 뜻입니다.`);
  for (const e of heap) lane.push(token(e), `name:${e.i}`);

  while (k < N) {
    const e = heap.shift()!;
    const { end, i } = e;
    const seat = assigned[i]++; // i번 심사관이 맡는 몇 번째(0부터) 사람인지
    const next = { end: end + TIMES[i], i };
    heap.push(next);
    heap.sort(byEnd);
    const behind = heap[heap.indexOf(next) + 1]; // 다시 넣은 항목이 앞지른 항목(없으면 맨 뒤에 그대로)
    k++;
    finish = end;
    popped = e;

    rec.step({ title: `${k}번째 사람 → ${i + 1}번 심사관, ${end}분에 끝`, codeHighlights: HEAP_AT.push, ...meta() });
    rec.phase('꺼내기', `힙에서 가장 빨리 끝나는 ${token(e).text}을 꺼냅니다.`, HEAP_AT.pop);
    lane.shift(`name:${i}`);

    rec.phase('배정하기', `${k}번째 사람을 ${i + 1}번 심사관에게 맡깁니다. ${end - TIMES[i]}분에 시작해 ${end}분에 끝나므로 finish = ${end}입니다.`, HEAP_AT.assign);
    rec.do(...together([
      { type: 'add', item: person(i, seat, String(k)), from: `name:${i}` },
      setText(`calc:${i}`, `${assigned[i]}명 맡음`),
      tallyTo(k, k >= N ? 'good' : 'chosen'),
    ]));
    rec.do(...together(probeTo(rec, end, `finish ${end}`, 'path')));

    rec.phase('다시 넣기', `${i + 1}번 심사관이 다음 사람을 맡으면 ${next.end}분에 끝나므로 ${token(next).text}을 힙에 다시 넣습니다.${
      behind ? ` ${next.end}분이 ${behind.end}분보다 빨라 앞으로 갑니다.` : ''}`, HEAP_AT.push);
    lane.push(token(next), personId(i, seat));
    lane.reorder(heap.map((h) => token(h).id));
  }

  rec.step({ title: `마지막 사람이 끝나는 ${finish}분`, codeHighlights: HEAP_AT.done, ...meta(), answer: finish, isKeyframe: true });
  rec.phase('정답', `${N}명을 모두 맡겼고 마지막 사람이 ${finish}분에 끝나므로 답은 ${finish}분입니다. 사람마다 한 번씩 반복하므로 n이 10억이면 10억 번 반복합니다.`);
  rec.do(...together(crown(rec)));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 1분씩: 1분 늘리기 → 세어 보기, 빨리 감기, 정답                    */
/* ------------------------------------------------------------------ */

const SLOW = 5; // t = 1~5분은 한 단계씩 보이고, 그 뒤 답 바로 앞까지는 빨리 감기 한 단계로 묶는다

function linearScan(): Visualization {
  const rec = new StepRecorder(board());
  let found = 1;
  while (sum(served(found)) < N) found++; // 함정 코드와 같은 반복으로, 처음 N명이 되는 t를 먼저 구한다
  const last = found - 1;
  const meta = (t: number) => ({ work: t, variables: { t: t || '-', '처리 인원': t ? sum(served(t)) : '-' } });

  const tick = (t: number) => {
    rec.phase('1분 늘리기', t === 1 ? 't = 1분부터 확인합니다.' : `t를 1분 늘려 ${t}분을 확인합니다.`, t === 1 ? LINEAR_AT.start : LINEAR_AT.next);
    rec.do(...together(probeTo(rec, t, `t ${t}`, 'current')));
    rec.phase('세어 보기', `${formula(t)}이라 ${sum(served(t)) >= N ? `드디어 ${N}명이 됩니다.` : `${N}명에 못 미칩니다.`}`, LINEAR_AT.check);
    countAt(rec, t);
  };

  rec.step({ title: '1분부터 하나씩 확인하기', codeHighlights: LINEAR_AT.check, ...meta(0) });
  rec.phase('시작', `t를 1분부터 1분씩 늘려 가며, t분 동안 심사할 수 있는 인원이 ${N}명이 되는지 봅니다.`);
  rec.do(...together(TIMES.map((time, i) => setText(`calc:${i}`, `⌊t ÷ ${time}⌋명`))));

  for (let t = 1; t <= SLOW; t++) {
    rec.step({ title: `t = ${t}분 → ${sum(served(t))}명`, codeHighlights: LINEAR_AT.check, ...meta(t) });
    tick(t);
  }

  // 빨리 감기: 표시가 last분까지 미끄러지는 동안 그사이 끝난 사람 칸이 나타나고, 계산 글과 합계를 한 번에 고친다
  rec.step({ title: `t = ${SLOW + 1}~${last}분 빨리 감기`, codeHighlights: LINEAR_AT.loop, ...meta(last) });
  rec.phase('빨리 감기', `${SLOW + 1}분부터 ${last}분까지 ${last - SLOW}번을 더 확인합니다. ${last}분에도 ${formula(last)}이라 아직 부족합니다.`);
  rec.do(...together([...probeTo(rec, last, `t ${last}`, 'current'), ...served(last).flatMap((k, i) => fit(rec, i, k))]));
  rec.do(...together([...TIMES.map((_, i) => calcAt(i, last)), tallyTo(sum(served(last)), 'bad')]));

  rec.step({ title: `t = ${found}분 → ${N}명, 정답`, codeHighlights: LINEAR_AT.done, ...meta(found), answer: found, isKeyframe: true });
  tick(found);
  rec.phase('정답', `${found}분에 처음으로 ${N}명이 되어 반복을 멈춥니다. 답은 맞지만 1분씩 ${found}번 확인했습니다. 답이 10¹⁸분이면 10¹⁸번 반복합니다.`, LINEAR_AT.done);
  rec.do(verdict(true));
  rec.do(...together([...probeTo(rec, found, `t ${found}`, 'path'), ...crown(rec)]));
  rec.do({ type: 'clearMarks' });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'immigration',
  title: '입국심사',
  level: 3,
  category: 'binary-search',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/43238',
  description: {
    summary:
      'n명이 입국심사를 기다립니다. 심사관마다 한 명을 심사하는 데 걸리는 시간이 다를 때, 모든 사람이 심사를 받는 데 걸리는 시간의 최솟값을 구합니다. 빈 심사대가 있어도 더 빨리 끝나는 심사대를 기다렸다 갈 수 있습니다.',
    rules: [
      'n은 1 이상 1,000,000,000 이하',
      '심사 시간 times[i]는 1분 이상 1,000,000,000분 이하',
      '심사관 수(times의 길이)는 1명 이상 100,000명 이하',
    ],
    examples: [{ input: 'n = 6, times = [7, 10]', output: '28' }],
  },
  keyIntuitions: [
    'n이 최대 10억이라 사람을 한 명씩 심사대에 배정하면 시간 초과입니다.',
    '질문을 뒤집어 "T분이 주어지면 몇 명을 심사할 수 있나?"를 묻습니다. 답은 심사관마다 ⌊T ÷ times[i]⌋명을 더한 값입니다.',
    'T가 늘면 처리 인원은 줄지 않으므로, n명 이상이 되는 가장 작은 T를 이분 탐색으로 찾습니다.',
  ],
  demo: { input: [N, TIMES], label: 'n = 6, times = [7, 10]' },
  workUnit: '반복 횟수',
  approaches: [
    {
      id: 'immigration-binary',
      name: '답을 이분 탐색 (매개변수 탐색)',
      rank: 'BEST',
      timeComplexity: 'O(M log(n × maxT))',
      spaceComplexity: 'O(1)',
      verdict: '답(시간)의 범위를 반씩 줄여 60번 안팎의 검사로 끝나는 풀이입니다.',
      pros: [
        '검사 한 번이 O(M)이고 검사 횟수는 log₂(10¹⁸) ≈ 60번이라 최악의 입력도 금방 끝납니다.',
        '추가 메모리가 거의 필요 없습니다.',
        '"T분 동안 처리 인원 = Σ⌊T ÷ times[i]⌋" 한 줄로 판정합니다.',
      ],
      cons: [
        '"시간을 이분 탐색한다"는 발상을 떠올려야 합니다.',
        'JavaScript는 답이 2⁵³을 넘으면 Number 정밀도가 깨질 수 있어, 극단 입력까지 대비하려면 BigInt를 씁니다.',
      ],
      whyThisRank:
        'n이 최대 10억이므로 사람 단위로 처리하는 풀이는 모두 탈락합니다. 시간이 늘면 처리 인원도 줄지 않는다는 단조성 덕분에 답 자체를 이분 탐색할 수 있습니다.',
      code: BINARY,
      visualize: binarySearch,
    },
    {
      id: 'immigration-heap',
      name: '최소 힙 시뮬레이션',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(n log M)',
      spaceComplexity: 'O(M)',
      verdict: '한 명씩 가장 빨리 끝나는 심사대에 배정하는 직관적인 풀이지만 n이 크면 시간 초과입니다.',
      pros: ['실제 줄서기와 똑같이 동작해 이해하기 쉽습니다.', 'n이 작다면 정확한 답을 냅니다.'],
      cons: [
        '사람마다 힙 연산(log M)을 하므로 n = 10억이면 수백억 번의 연산이 필요합니다.',
        '작은 예제만 통과하고 큰 테스트에서 시간 초과가 납니다.',
      ],
      whyThisRank:
        'n이 작다면 좋은 시뮬레이션이지만 이 문제의 n은 최대 10억입니다. 풀이를 고르기 전에 입력 크기부터 확인해야 하는 이유입니다.',
      code: HEAP,
      visualize: heapSimulation,
    },
    {
      id: 'immigration-linear',
      name: '1분씩 늘려 보는 선형 탐색',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(답 × M)',
      spaceComplexity: 'O(1)',
      verdict: '1분, 2분, 3분… 하나씩 늘려 가며 n명이 되는지 확인합니다.',
      pros: ['코드가 가장 짧습니다.'],
      cons: [
        '답이 최대 10¹⁸분이라 그만큼 반복할 수 있어 사실상 끝나지 않습니다.',
        '시간을 1분 늘릴 때마다 심사관 전원(최대 10만 명)을 다시 더합니다.',
      ],
      whyThisRank:
        '처리 인원이 시간에 따라 늘어난다는 성질을 쓰지 않고 답을 하나씩 확인합니다. 같은 판정 식을 이분 탐색으로 감싸기만 하면 정석 풀이가 됩니다.',
      code: LINEAR,
      visualize: linearScan,
    },
  ],
  checks: {
    cases: [
      { args: [N, TIMES], expected: 28 },
      { args: [1, [1]], expected: 1 },
      { args: [3, [1, 1]], expected: 2 },
      { args: [10, [6, 8, 10]], expected: 30 },
    ],
    // n은 1~20, times는 길이 1~4, 값 1~10(함정이 답만큼 도는 시간도 짧다)
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 20);
      const times = Array.from({ length: 1 + Math.floor(rand() * 4) }, () => 1 + Math.floor(rand() * 10));
      return [n, times];
    },
  },
};

export default problem;
