// 퍼즐 게임 챌린지: 정석 숙련도 이분 탐색, 대안 퍼즐별 시간 배열을 만들어 합산하는 이분 탐색, 함정 숙련도를 1씩 올려 보기를 같은 장면에서 움직인다.
// 장면은 위에 숙련도 수직선(탐색 구간, mid·level·answer 표시), 가운데 퍼즐 5개 칸(난이도·시간과 소요 시간 계산 글), 아래에 합계 시간 막대와 제한 시간(limit)이다.
import { axis, slots } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { lines, ro, sum, together } from '../shared.ts';

// 원문 예제 3번: 5개 퍼즐, 최대 난이도 467, 정답 숙련도 294 (이분 탐색 9회)
const DIFFS = [1, 328, 467, 209, 54];
const TIMES = [2, 7, 1, 4, 3];
const LIMIT = 1723;
const N = DIFFS.length;
const MAX = Math.max(...DIFFS); // 467: 어떤 퍼즐도 틀리지 않는 숙련도 = 이분 탐색의 오른쪽 끝

const costOf = (i: number, level: number): number => {
  if (DIFFS[i] <= level) return TIMES[i];
  const prev = i > 0 ? TIMES[i - 1] : 0;
  return (DIFFS[i] - level) * (TIMES[i] + prev) + TIMES[i];
};
const costsAt = (level: number): number[] => DIFFS.map((_, i) => costOf(i, level));

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BINARY = {
  python: `def solution(diffs, times, limit):
    def can_clear(level):
        total = 0
        for i in range(len(diffs)):
            if diffs[i] <= level:
                total += times[i]
            else:
                mistakes = diffs[i] - level
                total += mistakes * (times[i] + times[i - 1]) + times[i]
            if total > limit:  # 제한 시간을 넘으면 바로 중단
                return False
        return True

    left, right = 1, max(diffs)
    answer = right
    while left <= right:
        mid = (left + right) // 2
        if can_clear(mid):     # 제한 시간 안에 통과 → 숙련도를 더 낮춰 본다
            answer = mid
            right = mid - 1
        else:                  # 시간 초과 → 숙련도를 높인다
            left = mid + 1
    return answer`,
  javascript: `function solution(diffs, times, limit) {
  const canClear = (level) => {
    let total = 0;
    for (let i = 0; i < diffs.length; i++) {
      if (diffs[i] <= level) {
        total += times[i];
      } else {
        const mistakes = diffs[i] - level;
        total += mistakes * (times[i] + times[i - 1]) + times[i];
      }
      if (total > limit) return false; // 제한 시간을 넘으면 바로 중단
    }
    return true;
  };

  let left = 1;
  let right = diffs.reduce((a, b) => Math.max(a, b), 1);
  let answer = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (canClear(mid)) { // 제한 시간 안에 통과 → 숙련도를 더 낮춰 본다
      answer = mid;
      right = mid - 1;
    } else { // 시간 초과 → 숙련도를 높인다
      left = mid + 1;
    }
  }
  return answer;
}`,
};
const BINARY_AT = {
  start: lines(BINARY, ['left, right = 1, max(diffs)', 'answer = right'], ['let left = 1', 'let right = diffs.reduce', 'let answer = right']),
  mid: lines(BINARY, ['while left <= right', 'mid = (left + right) // 2'], ['while (left <= right)', 'const mid = Math.floor']),
  calc: (exceeded: boolean) => lines(BINARY,
    ['for i in range(len(diffs))', 'if diffs[i] <= level', 'mistakes = diffs[i] - level', exceeded ? 'return False' : 'return True'],
    ['for (let i = 0; i < diffs.length; i++)', 'if (diffs[i] <= level)', 'const mistakes = diffs[i] - level', exceeded ? 'if (total > limit) return false' : 'return true']),
  pass: lines(BINARY, ['if can_clear(mid)', 'answer = mid', 'right = mid - 1'], ['if (canClear(mid))', 'answer = mid', 'right = mid - 1']),
  fail: lines(BINARY, ['if can_clear(mid)', 'else:', 'left = mid + 1'], ['if (canClear(mid))', '} else {', 'left = mid + 1']),
  done: lines(BINARY, ['while left <= right', 'return answer'], ['while (left <= right)', 'return answer']),
};

const ARRAY_BINARY = {
  python: `def solution(diffs, times, limit):
    left, right = 1, max(diffs)
    answer = right
    while left <= right:
        mid = (left + right) // 2
        # 검사마다 퍼즐별 소요 시간 배열을 새로 만들어 합산
        spent = [
            times[i] if diffs[i] <= mid
            else (diffs[i] - mid) * (times[i] + times[i - 1]) + times[i]
            for i in range(len(diffs))
        ]
        if sum(spent) <= limit:
            answer = mid
            right = mid - 1
        else:
            left = mid + 1
    return answer`,
  javascript: `function solution(diffs, times, limit) {
  let left = 1;
  let right = diffs.reduce((a, b) => Math.max(a, b), 1);
  let answer = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // 검사마다 퍼즐별 소요 시간 배열을 새로 만들어 합산
    const spent = diffs.map((d, i) =>
      d <= mid ? times[i] : (d - mid) * (times[i] + times[i - 1]) + times[i],
    );
    const total = spent.reduce((a, b) => a + b, 0);
    if (total <= limit) {
      answer = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return answer;
}`,
};
const ARRAY_AT = {
  start: lines(ARRAY_BINARY, ['left, right = 1, max(diffs)', 'answer = right'], ['let left = 1', 'let right = diffs.reduce', 'let answer = right']),
  mid: lines(ARRAY_BINARY, ['while left <= right', 'mid = (left + right) // 2'], ['while (left <= right)', 'const mid = Math.floor']),
  build: lines(ARRAY_BINARY, ['spent = [', 'times[i] if diffs[i] <= mid'], ['const spent = diffs.map', 'd <= mid ? times[i]']),
  sum: lines(ARRAY_BINARY, ['if sum(spent) <= limit:'], ['const total = spent.reduce', 'if (total <= limit)']),
  pass: lines(ARRAY_BINARY, ['if sum(spent) <= limit:', 'answer = mid', 'right = mid - 1'], ['if (total <= limit)', 'answer = mid', 'right = mid - 1']),
  fail: lines(ARRAY_BINARY, ['if sum(spent) <= limit:', 'else:', 'left = mid + 1'], ['if (total <= limit)', '} else {', 'left = mid + 1']),
  done: lines(ARRAY_BINARY, ['while left <= right', 'return answer'], ['while (left <= right)', 'return answer']),
};

const LINEAR = {
  python: `def solution(diffs, times, limit):
    level = 1
    while True:
        total = 0
        for i in range(len(diffs)):
            if diffs[i] <= level:
                total += times[i]
            else:
                total += (diffs[i] - level) * (times[i] + times[i - 1]) + times[i]
        if total <= limit:
            return level
        level += 1  # 숙련도가 최대 10만이면 10만 번 반복`,
  javascript: `function solution(diffs, times, limit) {
  let level = 1;
  while (true) {
    let total = 0;
    for (let i = 0; i < diffs.length; i++) {
      if (diffs[i] <= level) {
        total += times[i];
      } else {
        total += (diffs[i] - level) * (times[i] + times[i - 1]) + times[i];
      }
    }
    if (total <= limit) return level;
    level++; // 숙련도가 최대 10만이면 10만 번 반복
  }
}`,
};
const LINEAR_AT = {
  start: lines(LINEAR, ['level = 1'], ['let level = 1']),
  calc: lines(LINEAR, ['for i in range(len(diffs))', 'if diffs[i] <= level', 'if total <= limit'], ['for (let i = 0; i < diffs.length; i++)', 'if (diffs[i] <= level)', 'if (total <= limit)']),
  next: lines(LINEAR, ['level += 1'], ['level++']),
  loop: lines(LINEAR, ['while True:', 'for i in range(len(diffs))', 'level += 1'], ['while (true)', 'for (let i = 0; i < diffs.length; i++)', 'level++']),
  done: lines(LINEAR, ['if total <= limit:', 'return level'], ['if (total <= limit) return level']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 620;
const H = 326;
const FULL: Rect = { x: 0, y: 0, w: W, h: H };
const tx = axis({ x: 88, w: 444, min: 1, max: MAX });
const puzzleSlot = slots({ x: 38, y: 146, w: 102, h: 56, gap: 14 });
const costSlot = slots({ x: 38, y: 208, w: 102, h: 24, gap: 14 });
const TALLY_Y = 262;

const puzzleId = (i: number) => `puzzle:${i}`;
const costId = (i: number) => `cost:${i}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'track', kind: 'line', rect: FULL, tone: 'trail', points: [[tx(1), 104], [tx(MAX), 104]] },
  ];
  DIFFS.forEach((d, i) => {
    items.push(
      { id: puzzleId(i), kind: 'cell', rect: puzzleSlot(i), tone: 'plain', text: `난이도 ${d}`, sub: `시간 ${TIMES[i]}`, tag: `#${i + 1}` },
      { id: costId(i), kind: 'text', rect: costSlot(i), tone: 'muted', text: '-' },
    );
  });
  items.push(
    { id: 'sum:label', kind: 'text', rect: { x: 24, y: TALLY_Y, w: 68, h: 36 }, text: '총 시간' },
    { id: 'tally', kind: 'bar', rect: { x: 96, y: TALLY_Y, w: 340, h: 36 }, fill: 0, text: '0' },
    { id: 'goal', kind: 'token', rect: { x: 448, y: TALLY_Y, w: 132, h: 36 }, tone: 'plain', text: `limit ${LIMIT}`, tag: '제한' },
  );
  return { width: W, height: H, items };
}

const put = (rec: StepRecorder, { id, kind, ...patch }: Item): Action =>
  rec.has(id) ? { type: 'set', id, patch } : { type: 'add', item: { id, kind, ...patch } };

const range = (l: number, r: number): Item[] => [
  { id: 'range', kind: 'zone', rect: { x: tx(l - 0.5), y: 92, w: tx(r + 0.5) - tx(l - 0.5), h: 24 } },
  { id: 'left', kind: 'token', rect: { x: tx(l - 0.5) - 78, y: 30, w: 78, h: 24 }, tone: 'plain', text: `left ${l}` },
  { id: 'right', kind: 'token', rect: { x: tx(r + 0.5), y: 30, w: 82, h: 24 }, tone: 'plain', text: `right ${r}` },
];

const answerLabel = (v: number): Item =>
  ({ id: 'answer', kind: 'token', rect: { x: tx(v) - 46, y: 0, w: 92, h: 24 }, tone: 'path', text: `answer ${v}` });

const probeTo = (rec: StepRecorder, v: number, text: string, tone: Tone): Action[] => [
  put(rec, { id: 'probe', kind: 'token', rect: { x: tx(v) - 2, y: 88, w: 4, h: 32 }, tone }),
  put(rec, { id: 'probe:label', kind: 'token', rect: { x: tx(v) - 46, y: 60, w: 92, h: 26 }, tone, text }),
];

function showCosts(level: number, count = N): Action[] {
  const cs = costsAt(level);
  const total = sum(cs.slice(0, count));
  const ok = total <= LIMIT;
  return [
    ...DIFFS.map((d, i): Action => ({
      type: 'set',
      id: puzzleId(i),
      patch: { tone: i >= count ? 'muted' : d <= level ? 'visited' : 'bad' },
    })),
    ...cs.map((c, i): Action => ({
      type: 'set',
      id: costId(i),
      patch: {
        text: i >= count ? '생략' : DIFFS[i] <= level ? `${c}` : `틀림 ${DIFFS[i] - level}회→${c}`,
        tone: i >= count ? 'muted' : DIFFS[i] <= level ? 'good' : 'bad',
      },
    })),
    {
      type: 'set',
      id: 'tally',
      patch: { fill: Math.min(1, total / LIMIT), text: `${total}`, tone: ok ? 'good' : 'bad' },
    },
  ];
}

/* ------------------------------------------------------------------ */
/* 정석: 숙련도를 이분 탐색 (조기 중단 포함)                              */
/* ------------------------------------------------------------------ */

function binarySearch(): Visualization {
  const rec = new StepRecorder(board());
  let [left, right] = [1, MAX];
  let answer = right;
  let mid = 0;
  let work = 0;

  rec.step({
    title: `숙련도 탐색 구간 1 ~ ${MAX} 정하기`,
    codeHighlights: BINARY_AT.start,
    work,
    variables: { left, right, answer, limit: LIMIT },
  });
  rec.phase('시작', `숙련도가 가장 어려운 퍼즐 난이도(${MAX}) 이상이면 한 번도 틀리지 않으므로 탐색 구간을 1 ~ ${ro(MAX)} 잡습니다.`, BINARY_AT.start);
  rec.do(...together([...range(left, right).map((it) => put(rec, it)), put(rec, answerLabel(answer))]));

  while (left <= right) {
    const [l, r] = [left, right];
    mid = Math.floor((left + right) / 2);
    let total = 0;
    let checked = 0;
    for (let i = 0; i < N; i++) {
      total += costOf(i, mid);
      checked++;
      if (total > LIMIT) break;
    }
    work += checked;
    const ok = total <= LIMIT;
    if (ok) [answer, right] = [mid, mid - 1];
    else left = mid + 1;
    const decide = ok ? BINARY_AT.pass : BINARY_AT.fail;

    rec.step({
      title: `mid = ${mid} → 시간 ${total} (${ok ? '통과, 더 낮게' : '초과, 더 높게'})`,
      codeHighlights: decide,
      work,
      variables: { left, right, mid, '확인 퍼즐': `${checked}개`, total, answer },
    });
    rec.phase('가운데 고르기', `mid = ⌊(${l} + ${r}) ÷ 2⌋ = ${mid}입니다. 숙련도 ${mid}로 제한 시간 ${LIMIT} 안에 풀 수 있는지 확인합니다.`, BINARY_AT.mid);
    rec.do(...together(probeTo(rec, mid, `mid ${mid}`, 'current')));

    rec.phase('시간 세기', ok
      ? `퍼즐 5개의 소요 시간을 더하면 ${total} ≤ ${LIMIT}이라 제한 시간 안에 모두 해결합니다.`
      : `${checked}번째 퍼즐까지 더했을 때 이미 ${total} > ${LIMIT}이 되어 뒤 퍼즐은 보지 않고 멈춥니다.`,
    BINARY_AT.calc(!ok));
    rec.do(...together(showCosts(mid, checked)));

    rec.phase('범위 줄이기', ok
      ? `제한 시간 안에 풀었으므로 answer = ${ro(mid)} 저장하고 더 낮은 숙련도를 보려고 right = ${ro(right)} 줄입니다.`
      : `시간이 초과되므로 숙련도를 높여야 합니다. left = ${ro(left)} 올립니다.`,
    decide);
    const [zone, leftMark, rightMark] = range(left, right);
    rec.do({ type: 'arrow', from: 'tally', to: 'goal', verdict: ok ? 'good' : 'bad', label: ok ? '통과' : '초과' });
    rec.do(...together([put(rec, zone), put(rec, ok ? rightMark : leftMark), ...(ok ? [put(rec, answerLabel(answer))] : [])]));
    rec.do({ type: 'clearMarks' });
  }

  const finalTotal = sum(costsAt(answer));
  rec.step({
    title: `최소 숙련도 ${answer} 확정 (소요 시간 ${finalTotal})`,
    codeHighlights: BINARY_AT.done,
    work,
    variables: { answer, '총 소요 시간': finalTotal, limit: LIMIT, '확인 횟수': work },
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `이분 탐색 9번(퍼즐 확인 ${work}회) 만에 최소 숙련도 ${answer}을 찾았습니다. 숙련도 ${answer}일 때 총 소요 시간은 ${finalTotal} ≤ ${LIMIT}입니다.`, BINARY_AT.done);
  rec.do(...together([
    { type: 'remove', id: 'answer' },
    ...probeTo(rec, answer, `answer ${answer}`, 'path'),
    { type: 'remove', id: 'range' },
    { type: 'set', id: 'left', patch: { tone: 'muted' } },
    { type: 'set', id: 'right', patch: { tone: 'muted' } },
    ...showCosts(answer, N),
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 퍼즐별 소요 시간 배열을 새로 만들어 합산하는 이분 탐색            */
/* ------------------------------------------------------------------ */

function arrayBinarySearch(): Visualization {
  const rec = new StepRecorder(board());
  let [left, right] = [1, MAX];
  let answer = right;
  let mid = 0;
  let work = 0;

  rec.step({
    title: `숙련도 탐색 구간 1 ~ ${MAX} 정하기 (배열 생성 방식)`,
    codeHighlights: ARRAY_AT.start,
    work,
    variables: { left, right, answer, limit: LIMIT },
  });
  rec.phase('시작', '정석과 같은 이분 탐색이지만, 검사마다 퍼즐별 시간 배열 spent를 새로 만들고 합산합니다.', ARRAY_AT.start);
  rec.do(...together([...range(left, right).map((it) => put(rec, it)), put(rec, answerLabel(answer))]));

  while (left <= right) {
    const [l, r] = [left, right];
    mid = Math.floor((left + right) / 2);
    const spent = costsAt(mid);
    const total = sum(spent);
    work += N * 2; // 배열 생성 N번 + 합산 N번 (중간에 넘어도 끝까지 계산)
    const ok = total <= LIMIT;
    if (ok) [answer, right] = [mid, mid - 1];
    else left = mid + 1;
    const decide = ok ? ARRAY_AT.pass : ARRAY_AT.fail;

    rec.step({
      title: `mid = ${mid} → spent 배열 합 ${total}`,
      codeHighlights: decide,
      work,
      variables: { left, right, mid, spent: `[${spent.join(', ')}]`, total, answer },
    });
    rec.phase('가운데 고르기', `mid = ⌊(${l} + ${r}) ÷ 2⌋ = ${mid}입니다.`, ARRAY_AT.mid);
    rec.do(...together(probeTo(rec, mid, `mid ${mid}`, 'current')));

    rec.phase('배열 생성·합산', `조기 중단 없이 5개 퍼즐의 소요 시간 배열 [${spent.join(', ')}]을 끝까지 만들고 다시 더합니다 (합계 ${total}).`, ARRAY_AT.build);
    rec.do(...together(showCosts(mid, N)));

    rec.phase('범위 줄이기', ok
      ? `${total} ≤ ${LIMIT}이므로 answer = ${ro(mid)} 갱신하고 right = ${ro(right)} 줄입니다.`
      : `${total} > ${LIMIT}이므로 left = ${ro(left)} 높입니다.`,
    decide);
    const [zone, leftMark, rightMark] = range(left, right);
    rec.do(...together([put(rec, zone), put(rec, ok ? rightMark : leftMark), ...(ok ? [put(rec, answerLabel(answer))] : [])]));
  }

  const finalTotal = sum(costsAt(answer));
  rec.step({
    title: `최소 숙련도 ${answer} (정석보다 배열 생성·합산 비용 추가)`,
    codeHighlights: ARRAY_AT.done,
    work,
    variables: { answer, '총 소요 시간': finalTotal, '확인 횟수': work },
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `답은 ${answer}로 같지만, 매번 길이 N 배열을 새로 만들고 끝까지 합산해 정석보다 많은 ${work}번의 연산과 O(N) 메모리를 씁니다.`, ARRAY_AT.done);
  rec.do(...together([
    { type: 'remove', id: 'answer' },
    ...probeTo(rec, answer, `answer ${answer}`, 'path'),
    { type: 'remove', id: 'range' },
    ...showCosts(answer, N),
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: 숙련도를 1부터 1씩 높여 보기                                    */
/* ------------------------------------------------------------------ */

const SLOW_SHOWN = 4;

function linearScan(): Visualization {
  const rec = new StepRecorder(board());
  let found = 1;
  while (sum(costsAt(found)) > LIMIT) found++;
  const last = found - 1;
  let work = 0;

  rec.step({
    title: '숙련도 1부터 1씩 높여 가며 확인 시작',
    codeHighlights: LINEAR_AT.start,
    work,
    variables: { level: 1, limit: LIMIT },
  });
  rec.phase('시작', `숙련도를 1부터 1씩 올려 가며, 총 소요 시간이 ${LIMIT} 이하가 되는 첫 순간을 찾습니다.`, LINEAR_AT.start);
  rec.do(...together(probeTo(rec, 1, 'level 1', 'current')));

  for (let lv = 1; lv <= SLOW_SHOWN; lv++) {
    const total = sum(costsAt(lv));
    work += N;
    rec.step({
      title: `level = ${lv} → 시간 ${total} (초과)`,
      codeHighlights: LINEAR_AT.calc,
      work,
      variables: { level: lv, total, limit: LIMIT },
    });
    rec.phase('1씩 올리기', lv === 1 ? 'level = 1일 때를 확인합니다.' : `숙련도를 1 올려 level = ${lv}을 확인합니다.`, lv === 1 ? LINEAR_AT.start : LINEAR_AT.next);
    rec.do(...together(probeTo(rec, lv, `level ${lv}`, 'current')));
    rec.phase('시간 세기', `퍼즐 5개를 푸는 데 총 ${total}이 걸려 제한 시간 ${LIMIT}을 넘깁니다.`, LINEAR_AT.calc);
    rec.do(...together(showCosts(lv, N)));
  }

  work = last * N;
  const lastTotal = sum(costsAt(last));
  rec.step({
    title: `level = ${SLOW_SHOWN + 1} ~ ${last} 빨리 감기`,
    codeHighlights: LINEAR_AT.loop,
    work,
    variables: { level: last, total: lastTotal, '누적 확인': work },
  });
  rec.phase('빨리 감기', `숙련도 ${SLOW_SHOWN + 1}부터 ${last}까지 ${last - SLOW_SHOWN}번을 1씩 올리며 똑같이 계산합니다. level = ${last}에서도 ${lastTotal} > ${LIMIT}이라 부족합니다.`, LINEAR_AT.loop);
  rec.do(...together([...probeTo(rec, last, `level ${last}`, 'current'), ...showCosts(last, N)]));

  work = found * N;
  const foundTotal = sum(costsAt(found));
  rec.step({
    title: `level = ${found} → 시간 ${foundTotal} ≤ ${LIMIT}, 정답`,
    codeHighlights: LINEAR_AT.done,
    work,
    variables: { level: found, total: foundTotal, '누적 확인': work },
    answer: found,
    isKeyframe: true,
  });
  rec.phase('1씩 올리기', `숙련도를 1 더 올려 level = ${found}을 확인합니다.`, LINEAR_AT.next);
  rec.do(...together(probeTo(rec, found, `level ${found}`, 'current')));
  rec.phase('정답', `총 시간이 ${foundTotal} ≤ ${LIMIT}이 되어 멈춥니다. 답은 맞지만 퍼즐을 ${work}번이나 계산했습니다. 난이도가 10만, 퍼즐이 30만 개면 3×10¹⁰번 반복해 시간 초과입니다.`, LINEAR_AT.done);
  rec.do(...together([...probeTo(rec, found, `level ${found}`, 'path'), ...showCosts(found, N)]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'puzzle-challenge',
  title: '퍼즐 게임 챌린지',
  level: 2,
  category: 'binary-search',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/340212',
  description: {
    summary:
      'n개의 퍼즐을 순서대로 풀 때, 퍼즐 난이도가 내 숙련도(level)보다 높으면 차이(diffs[i] - level)만큼 틀리며 매번 현재 퍼즐과 이전 퍼즐을 다시 풀어야 합니다. 전체 제한 시간(limit) 안에 모든 퍼즐을 풀기 위한 최소 숙련도를 구합니다.',
    rules: [
      'diffs와 times의 길이는 1 이상 300,000 이하이며 diffs[0] = 1입니다.',
      'diffs[i]는 1 이상 100,000 이하, times[i]는 1 이상 10,000 이하의 자연수입니다.',
      'diffs[i] > level이면 (diffs[i] - level) × (times[i] + times[i - 1]) + times[i]만큼 시간이 걸립니다.',
      '제한 시간 limit은 1 이상 10^15 이하이며, 항상 해결 가능한 입력만 주어집니다.',
    ],
    examples: [
      { input: 'diffs = [1, 5, 3], times = [2, 4, 7], limit = 30', output: '3' },
      { input: 'diffs = [1, 4, 4, 2], times = [6, 3, 8, 2], limit = 59', output: '2' },
      { input: 'diffs = [1, 328, 467, 209, 54], times = [2, 7, 1, 4, 3], limit = 1723', output: '294' },
    ],
  },
  keyIntuitions: [
    '숙련도(level)가 높아질수록 각 퍼즐에서 틀리는 횟수가 줄어들어 총 소요 시간이 단조 감소합니다.',
    '숙련도가 정해지면 전체 소요 시간은 한 번의 순회 O(N)으로 바로 계산할 수 있습니다.',
    '최소 숙련도는 1, 최대 숙련도는 max(diffs)(최대 100,000)이므로 이분 탐색을 쓰면 최대 17번의 검사로 답을 찾습니다.',
  ],
  demo: {
    input: [DIFFS, TIMES, LIMIT],
    label: 'diffs = [1, 328, 467, 209, 54], times = [2, 7, 1, 4, 3], limit = 1723',
  },
  workUnit: '퍼즐 소요 시간 계산 횟수',
  approaches: [
    {
      id: 'puzzle-binary',
      name: '숙련도를 이분 탐색',
      rank: 'BEST',
      timeComplexity: 'O(N log(maxDiff))',
      spaceComplexity: 'O(1)',
      verdict: '숙련도 구간 [1, max(diffs)]를 반씩 좁히며, 누적 시간이 limit을 넘는 순간 조기 중단해 빠르게 판정합니다.',
      pros: [
        '난이도가 최대 100,000이므로 log₂(100,000) ≈ 17번 안팎의 검사로 끝납니다.',
        '배열을 새로 만들지 않고 변수 하나로 합산하며 limit 초과 시 바로 멈춰 불필요한 계산을 줄입니다.',
      ],
      cons: [
        '탐색 왼쪽 끝을 0으로 잡으면 문제 조건(양의 정수 숙련도)을 어겨 오답이 나올 수 있으니 left = 1로 시작해야 합니다.',
      ],
      whyThisRank:
        '숙련도가 높을수록 소요 시간이 줄어드는 단조성이 뚜렷하고, 판정 함수를 O(1) 추가 메모리와 조기 중단으로 가장 가볍게 구현할 수 있습니다.',
      code: BINARY,
      visualize: binarySearch,
    },
    {
      id: 'puzzle-array-binary',
      name: '퍼즐별 소요 시간 배열을 만들어 합산하는 이분 탐색',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log(maxDiff))',
      spaceComplexity: 'O(N)',
      verdict: '같은 이분 탐색이지만 검사마다 퍼즐별 시간 배열을 통째로 만든 뒤 합산해 시간과 메모리를 더 씁니다.',
      pros: [
        '퍼즐마다 걸리는 시간을 배열로 만든 뒤 sum()으로 더하므로 식이 한눈에 보입니다.',
      ],
      cons: [
        '검사마다 길이 30만짜리 배열을 새로 할당해 O(N) 메모리를 쓰고, 앞에서 이미 limit을 넘어도 끝까지 계산한 뒤 다시 합산합니다.',
      ],
      whyThisRank:
        '시간 복잡도 차수는 같지만, 매 검사마다 배열 생성과 전체 합산으로 두 번씩 훑어 정석보다 상수 시간과 메모리를 손해 봅니다.',
      code: ARRAY_BINARY,
      visualize: arrayBinarySearch,
    },
    {
      id: 'puzzle-linear',
      name: '숙련도를 1부터 1씩 높여 보기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(maxDiff × N)',
      spaceComplexity: 'O(1)',
      verdict: '숙련도를 1, 2, 3… 하나씩 올리며 제한 시간 안에 들어오는지 매번 처음부터 계산합니다.',
      pros: ['이분 탐색 없이 단순 반복문만으로 작성할 수 있습니다.'],
      cons: [
        '답이 100,000 근처이고 퍼즐이 30만 개면 최대 3 × 10¹⁰번 계산해야 해서 시간 초과가 납니다.',
      ],
      whyThisRank:
        '소요 시간이 숙련도에 따라 단조 감소한다는 성질을 버리고 1씩 확인하는 풀이입니다. 같은 판정 식을 이분 탐색으로 감싸면 정석이 됩니다.',
      code: LINEAR,
      visualize: linearScan,
    },
  ],
  checks: {
    cases: [
      { args: [[1, 5, 3], [2, 4, 7], 30], expected: 3 },
      { args: [[1, 4, 4, 2], [6, 3, 8, 2], 59], expected: 2 },
      { args: [DIFFS, TIMES, LIMIT], expected: 294 },
      { args: [[1], [10], 10], expected: 1 },
      { args: [[1, 10], [2, 3], 5], expected: 10 },
    ],
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 5);
      const diffs = [1, ...Array.from({ length: n - 1 }, () => 1 + Math.floor(rand() * 25))];
      const times = Array.from({ length: n }, () => 1 + Math.floor(rand() * 8));
      const targetLevel = 1 + Math.floor(rand() * 25);
      const minLimit = diffs.reduce(
        (acc, d, i) => acc + (d <= targetLevel ? times[i] : (d - targetLevel) * (times[i] + times[i - 1]) + times[i]),
        0,
      );
      return [diffs, times, minLimit];
    },
  },
};

export default problem;
