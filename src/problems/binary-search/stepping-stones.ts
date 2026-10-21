// 징검다리 건너기: 정석 인원 수 이분 탐색, 대안 돌을 깎아 본 뒤 확인하는 이분 탐색, 함정 한 명씩 건너 보기를 같은 장면에서 움직인다.
// 장면은 위에 인원 수 수직선(탐색 구간, mid·answer 표시), 가운데 징검다리 칸 열(돌 값과 번호), 대안은 아래에 '깎은 뒤' 칸 열이다.
// 돌을 훑을 때는 못 밟는 돌을 주황, 밟을 수 있는 돌을 초록으로 칠하고, 연속 구간에 테두리를 두른 뒤 판정을 단다.
import { around, axis } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { lines, ro, together } from '../shared.ts';

// 시각화 입력. 3칸 연속으로 약한 구간(27, 33, 41)이 답을 정한다: 41명이 건너면 셋이 모두 0이 되어 42번째 사람이 막힌다.
const STONES = [91, 88, 27, 33, 41, 16, 23, 70, 83, 32];
const K = 3;
const N = STONES.length;
const MAX = Math.max(...STONES); // 91: 이분 탐색의 오른쪽 끝(이 인원이면 가장 튼튼한 돌도 마지막으로 밟힌다)
const list = (xs: number[]) => `[${xs.join(', ')}]`;

// 답: 모든 K칸 구간의 최댓값 중 가장 작은 값(앞선 구간). 시각화의 마지막 장면에서 가장 약한 구간을 보여 줄 때 쓴다
const WEAKEST = Array.from({ length: N - K + 1 }, (_, i) => i).reduce(
  (best, i) => (Math.max(...STONES.slice(i, i + K)) < Math.max(...STONES.slice(best, best + K)) ? i : best), 0);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BINARY = {
  python: `def solution(stones, k):
    def can_cross(people):
        # people번째 사람이 건널 때는 앞사람 people - 1명이 밟은 뒤라,
        # 적힌 수가 people보다 작은 돌은 이미 0입니다
        run = 0  # 연속으로 밟을 수 없는 돌 수
        for s in stones:
            if s < people:
                run += 1
                if run >= k:  # k칸을 뛰어넘을 수 없다
                    return False
            else:
                run = 0
        return True

    left, right = 1, max(stones)
    answer = 0
    while left <= right:
        mid = (left + right) // 2
        if can_cross(mid):  # mid명이 건넌다 → 더 많이
            answer = mid
            left = mid + 1
        else:               # 막힌다 → 더 적게
            right = mid - 1
    return answer`,
  javascript: `function solution(stones, k) {
  const canCross = (people) => {
    // people번째 사람이 건널 때는 앞사람 people - 1명이 밟은 뒤라,
    // 적힌 수가 people보다 작은 돌은 이미 0입니다
    let run = 0; // 연속으로 밟을 수 없는 돌 수
    for (const s of stones) {
      if (s < people) {
        run++;
        if (run >= k) return false; // k칸을 뛰어넘을 수 없다
      } else {
        run = 0;
      }
    }
    return true;
  };

  let left = 1;
  let right = stones.reduce((a, b) => Math.max(a, b), 0);
  let answer = 0;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (canCross(mid)) { // mid명이 건넌다 → 더 많이
      answer = mid;
      left = mid + 1;
    } else { // 막힌다 → 더 적게
      right = mid - 1;
    }
  }
  return answer;
}`,
};
// 돌 훑기: 막혀서 멈추면 return False, 끝까지 가면 return True. 밟을 수 있는 돌(else)을 하나라도 지났다면 run = 0도 돈다
const scanLines = (blocked: boolean, reset: boolean) => lines(BINARY,
  ['run = 0  #', 'for s in stones', 'if s < people', 'run += 1', 'if run >= k', ...(reset ? ['                run = 0'] : []), blocked ? 'return False' : 'return True'],
  ['let run = 0', 'for (const s of stones)', 'if (s < people)', 'run++', 'if (run >= k)', ...(reset ? ['        run = 0;'] : []), blocked ? 'return false' : 'return true']);
const BINARY_AT = {
  start: lines(BINARY, ['left, right = 1, max(stones)', 'answer = 0'], ['let left = 1', 'let right = stones.reduce', 'let answer = 0']),
  mid: lines(BINARY, ['while left <= right', 'mid = (left + right) // 2'], ['while (left <= right)', 'const mid = Math.floor']),
  pass: lines(BINARY, ['if can_cross(mid)', 'answer = mid', 'left = mid + 1'], ['if (canCross(mid))', 'answer = mid', 'left = mid + 1']),
  fail: lines(BINARY, ['if can_cross(mid)', 'else:  ', 'right = mid - 1'], ['if (canCross(mid))', '} else { //', 'right = mid - 1']),
  done: lines(BINARY, ['while left <= right', 'return answer'], ['while (left <= right)', 'return answer']),
};

const COPY = {
  python: `def solution(stones, k):
    left, right = 1, max(stones)
    answer = 0
    while left <= right:
        mid = (left + right) // 2
        # mid - 1명이 건넌 뒤 돌에 남은 수 (0이 되면 밟을 수 없다)
        after = [max(0, s - (mid - 1)) for s in stones]

        run, ok = 0, True
        for s in after:
            run = run + 1 if s == 0 else 0
            if run >= k:  # 0인 돌이 k칸 연속이면 못 건넌다
                ok = False
                break

        if ok:   # mid명이 건넌다 → 더 많이
            answer = mid
            left = mid + 1
        else:    # 막힌다 → 더 적게
            right = mid - 1
    return answer`,
  javascript: `function solution(stones, k) {
  let left = 1;
  let right = stones.reduce((a, b) => Math.max(a, b), 0);
  let answer = 0;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // mid - 1명이 건넌 뒤 돌에 남은 수 (0이 되면 밟을 수 없다)
    const after = stones.map((s) => Math.max(0, s - (mid - 1)));

    let run = 0;
    let ok = true;
    for (const s of after) {
      run = s === 0 ? run + 1 : 0;
      if (run >= k) { // 0인 돌이 k칸 연속이면 못 건넌다
        ok = false;
        break;
      }
    }

    if (ok) { // mid명이 건넌다 → 더 많이
      answer = mid;
      left = mid + 1;
    } else { // 막힌다 → 더 적게
      right = mid - 1;
    }
  }
  return answer;
}`,
};
const COPY_AT = {
  start: lines(COPY, ['left, right = 1, max(stones)', 'answer = 0'], ['let left = 1', 'let right = stones.reduce', 'let answer = 0']),
  mid: lines(COPY, ['while left <= right', 'mid = (left + right) // 2'], ['while (left <= right)', 'const mid = Math.floor']),
  shave: lines(COPY, ['after = [max(0'], ['const after = stones.map']),
  scan: (blocked: boolean) => lines(COPY,
    ['run, ok = 0, True', 'for s in after', 'run = run + 1 if s == 0', 'if run >= k', ...(blocked ? ['ok = False', 'break'] : [])],
    ['let run = 0', 'let ok = true', 'for (const s of after)', 'run = s === 0', 'if (run >= k)', ...(blocked ? ['ok = false', 'break'] : [])]),
  pass: lines(COPY, ['if ok:', 'answer = mid', 'left = mid + 1'], ['if (ok)', 'answer = mid', 'left = mid + 1']),
  fail: lines(COPY, ['if ok:', 'else:', 'right = mid - 1'], ['if (ok)', '} else {', 'right = mid - 1']),
  done: lines(COPY, ['while left <= right', 'return answer'], ['while (left <= right)', 'return answer']),
};

const SIM = {
  python: `def solution(stones, k):
    now = stones[:]  # 원본을 지키려고 복사
    people = 0
    while True:
        run = 0  # 연속으로 0인 돌 수
        for s in now:
            run = run + 1 if s == 0 else 0
            if run >= k:  # 0인 돌이 k칸 연속이면 이 사람은 못 건넌다
                return people
        now = [max(0, s - 1) for s in now]  # 건너며 돌을 한 번씩 밟는다
        people += 1  # 돌이 2억이면 2억 번 반복`,
  javascript: `function solution(stones, k) {
  let now = [...stones]; // 원본을 지키려고 복사
  let people = 0;
  while (true) {
    let run = 0; // 연속으로 0인 돌 수
    for (const s of now) {
      run = s === 0 ? run + 1 : 0;
      if (run >= k) return people; // 0인 돌이 k칸 연속이면 이 사람은 못 건넌다
    }
    now = now.map((s) => Math.max(0, s - 1)); // 건너며 돌을 한 번씩 밟는다
    people++; // 돌이 2억이면 2억 번 반복
  }
}`,
};
const SIM_AT = {
  start: lines(SIM, ['now = stones[:]', 'people = 0'], ['let now = [...stones]', 'let people = 0']),
  scan: (blocked: boolean) => lines(SIM,
    ['while True', 'run = 0  #', 'for s in now', 'run = run + 1 if s == 0', 'if run >= k', ...(blocked ? ['return people'] : [])],
    ['while (true)', 'let run = 0', 'for (const s of now)', 'run = s === 0', 'if (run >= k)', ...(blocked ? ['return people'] : [])]),
  step: lines(SIM, ['now = [max(0, s - 1)', 'people += 1'], ['now = now.map', 'people++']),
  loop: lines(SIM, ['while True', 'run = 0  #', 'for s in now', 'now = [max(0, s - 1)', 'people += 1'],
    ['while (true)', 'let run = 0', 'for (const s of now)', 'now = now.map', 'people++']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 위에서부터 answer 이름표 0~24 · left, right 30~54 · mid(또는 n번째) 이름표 62~88 · 수직선 94~118(선은 106) · k 이름표 130~154 ·
// 돌 칸 176~230 · 돌 번호 236~254 · (대안) 설명 글 266~288, 깎은 뒤 칸 296~350. 연속 구간 테두리는 칸에서 5px 나오고 판정 표시는 그 위 11px까지 올라온다.
// 가로: 돌 10칸이 24~618(54px 칸, 6px 간격), 수직선은 인원 1~91이 88~558. left, right 이름표(80px)가 양끝에서 판 안에 들도록 양옆을 비워 둔다.
const W = 642;
const AX = 88;
const tx = axis({ x: AX, w: 470, min: 1, max: MAX }); // 인원 → x, 1명에 5.2px
const TW = 80;
const stoneRect = (i: number): Rect => ({ x: 24 + i * 60, y: 176, w: 54, h: 54 });
const afterRect = (i: number): Rect => ({ x: 24 + i * 60, y: 296, w: 54, h: 54 });
const stoneId = (i: number) => `stone:${i}`;
const afterId = (i: number) => `after:${i}`;
const stoneIds = Array.from({ length: N }, (_, i) => stoneId(i));
const afterIds = Array.from({ length: N }, (_, i) => afterId(i));

// 세 풀이가 같이 쓰는 장면: 수직선, k 이름표, 돌 칸 10개(글은 적힌 수)와 번호. 대안은 '깎은 뒤' 줄도 둔다
function board(withAfter: boolean): Scene {
  const height = withAfter ? 366 : 262;
  const items: Item[] = [
    { id: 'track', kind: 'line', rect: { x: 0, y: 0, w: W, h: height }, tone: 'trail', points: [[tx(1), 106], [tx(MAX), 106]] },
    { id: 'k', kind: 'token', rect: { x: 24, y: 130, w: 72, h: 24 }, tone: 'plain', text: `k = ${K}` },
  ];
  STONES.forEach((v, i) => items.push(
    { id: stoneId(i), kind: 'cell', rect: stoneRect(i), tone: 'plain', text: String(v) },
    { id: `no:${i}`, kind: 'text', rect: { x: 24 + i * 60, y: 236, w: 54, h: 18 }, tone: 'muted', text: `${i + 1}번` },
  ));
  if (withAfter) items.push({ id: 'after:label', kind: 'text', rect: { x: 24, y: 266, w: 594, h: 22 }, text: '' });
  return { width: W, height, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const setText = (id: string, text: string, pop = false): Action => ({ type: 'set', id, patch: { text }, ...(pop ? { pop } : {}) });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });
// 처음이면 그 자리에 나타나고, 이미 있으면 미끄러져 옮겨 가며 글과 색을 바꾼다
const put = (rec: StepRecorder, { id, kind, ...patch }: Item): Action =>
  rec.has(id) ? { type: 'set', id, patch } : { type: 'add', item: { id, kind, ...patch } };

// 정석의 탐색 구간 [l, r]: 인원 v를 [v - 0.5, v + 0.5] 칸으로 보고, left는 구간 왼쪽 바깥, right는 오른쪽 바깥에 붙인다
const range = (l: number, r: number): Item[] => [
  { id: 'range', kind: 'zone', rect: { x: tx(l - 0.5), y: 94, w: tx(r + 0.5) - tx(l - 0.5), h: 24 } },
  { id: 'left', kind: 'token', rect: { x: tx(l - 0.5) - TW, y: 30, w: TW, h: 24 }, tone: 'plain', text: `left ${l}` },
  { id: 'right', kind: 'token', rect: { x: tx(r + 0.5), y: 30, w: TW, h: 24 }, tone: 'plain', text: `right ${r}` },
];
const answerLabel = (v: number): Item =>
  ({ id: 'answer', kind: 'token', rect: { x: tx(v) - 44, y: 0, w: 88, h: 24 }, tone: 'path', text: `answer ${v}` });
// 시험하는 인원 표시: 이름표와, 그 아래로 수직선까지 내려오는 선
const probeTo = (rec: StepRecorder, v: number, text: string, tone: Tone): Action[] => [
  put(rec, { id: 'probe', kind: 'token', rect: { x: tx(v) - 2, y: 88, w: 4, h: 30 }, tone }),
  put(rec, { id: 'probe:label', kind: 'token', rect: { x: tx(v) - 44, y: 62, w: 88, h: 26 }, tone, text }),
];

// 못 밟는 돌(flags)을 왼쪽부터 훑는다. 못 밟는 돌이 K칸 이어지면 그 자리에서 멈추고, 아니면 끝까지 가서 가장 긴 연속(앞선 것)을 돌려준다
interface Look { looked: number; start: number; len: number; blocked: boolean }
function look(flags: boolean[]): Look {
  let run = 0;
  let best = { start: 0, len: 0 };
  for (let i = 0; i < flags.length; i++) {
    run = flags[i] ? run + 1 : 0;
    if (run > best.len) best = { start: i - run + 1, len: run };
    if (run >= K) return { looked: i + 1, ...best, blocked: true };
  }
  return { looked: flags.length, ...best, blocked: false };
}

// 돌 칸 start부터 len개를 5px 띄워 두른 테두리
const ringRect = (rectOf: (i: number) => Rect, start: number, len: number): Rect => {
  const [a, b] = [rectOf(start), rectOf(start + len - 1)];
  return around({ x: a.x, y: a.y, w: b.x + b.w - a.x, h: a.h }, 5);
};

// 돌 훑기: 훑은 칸만 밝히고 못 밟는 돌은 주황, 밟을 수 있는 돌은 초록으로 칠한다. 그다음 연속 구간에 테두리를 두르고 from 이름표에서 판정을 긋는다
// (연속이 하나도 없으면 k 이름표에 판정한다)
const inspect = (rec: StepRecorder, ids: string[], rectOf: (i: number) => Rect, flags: boolean[], l: Look, from: string) => {
  const seen = ids.slice(0, l.looked);
  rec.do(...together([
    { type: 'focus', ids: seen },
    ...seen.map((id, i) => paint(id, flags[i] ? 'bad' : 'visited')),
    ...(l.len ? [{ type: 'add', item: { id: 'run', kind: 'ring', rect: ringRect(rectOf, l.start, l.len) } } as Action] : []),
  ]));
  const label = l.blocked ? `연속 ${K}칸 · 막힘` : l.len ? `연속 ${l.len}칸 · 통과` : '막힘 없음';
  rec.do({ type: 'arrow', from, to: l.len ? 'run' : 'k', verdict: l.blocked ? 'bad' : 'good', label });
};
// 훑기가 끝나면 표시를 걷는다: 초점, 화살표, 테두리. 훑은 칸의 색은 toneOf대로 돌려놓는다
const clearInspect = (rec: StepRecorder, ids: string[], l: Look, toneOf: (i: number) => Tone = () => 'plain'): Action[] =>
  together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...(rec.has('run') ? [{ type: 'remove', id: 'run' } as Action] : []),
    ...ids.slice(0, l.looked).map((id, i) => paint(id, toneOf(i)))]);
// 이분 탐색의 '범위 줄이기' 자막
const narrowed = (ok: boolean, mid: number, left: number, right: number) => ok
  ? `${mid}명은 건널 수 있습니다. answer를 ${ro(mid)} 저장하고 left를 ${ro(left)} 올립니다.`
  : `${mid}명은 막힙니다. right를 ${ro(right)} 줄여 더 적은 인원을 봅니다.${left > right ? ' 이제 left가 right보다 큽니다.' : ''}`;
// 탐색 구간을 줄이고 answer 이름표를 옮긴다
const narrow = (rec: StepRecorder, ok: boolean, left: number, right: number, answer: number) => {
  const [zone, leftMark, rightMark] = range(left, right);
  rec.do(...together([put(rec, zone), put(rec, ok ? leftMark : rightMark), ...(ok ? [put(rec, answerLabel(answer))] : [])]));
};
// 반복을 끝낸 뒤: 범위 표시를 걷고 가장 약한 구간의 세 돌을 분홍으로 두른다
const crown = (rec: StepRecorder) => {
  rec.do(...together([
    { type: 'remove', id: 'range' },
    { type: 'set', id: 'left', patch: { tone: 'muted' } },
    { type: 'set', id: 'right', patch: { tone: 'muted' } },
    ...Array.from({ length: K }, (_, i) => paint(stoneId(WEAKEST + i), 'path')),
  ]));
  rec.do({ type: 'add', item: { id: 'run', kind: 'ring', rect: ringRect(stoneRect, WEAKEST, K) } });
};
const WEAK = STONES.slice(WEAKEST, WEAKEST + K).join(', ');

/* ------------------------------------------------------------------ */
/* 정석 인원 수 이분 탐색: 가운데 고르기 → 돌 살피기 → 범위 줄이기          */
/* ------------------------------------------------------------------ */

function binarySearch(): Visualization {
  const rec = new StepRecorder(board(false));
  let [left, right] = [1, MAX];
  let answer = 0;
  let mid = 0; // 0이면 아직 고르지 않음
  let verdict = '-';
  let looks = 0;
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({ work: looks, variables: { left, right, mid: mid || '-', '건널 수 있나': verdict, answer } });

  rec.step({ title: `인원 수의 범위 1명 ~ ${MAX}명 정하기`, codeHighlights: BINARY_AT.start, ...meta() });
  rec.phase('시작', `건널 수 있는 사람은 1명에서 ${MAX}명 사이입니다. 가장 튼튼한 돌이 ${MAX}이기 때문입니다.`);
  rec.do(...together(range(left, right).map((it) => put(rec, it))), wait(500));

  while (left <= right) {
    const [l, r] = [left, right];
    mid = Math.floor((left + right) / 2);
    const flags = STONES.map((s) => s < mid); // mid번째 사람 앞에서 이미 0인 돌
    const seen = look(flags);
    looks += seen.looked;
    const ok = !seen.blocked;
    verdict = ok ? '예' : '아니오';
    if (ok) [answer, left] = [mid, mid + 1];
    else right = mid - 1;
    const weak = STONES.slice(seen.start, seen.start + seen.len).join(', ');

    rec.step({ title: `mid ${mid}명 → ${ok ? '건넘, 더 많이' : '막힘, 더 적게'}`, codeHighlights: ok ? BINARY_AT.pass : BINARY_AT.fail, ...meta() });
    rec.phase('가운데 고르기', `mid = ⌊(${l} + ${r}) ÷ 2⌋ = ${mid}명입니다.`, BINARY_AT.mid);
    rec.do(...together(probeTo(rec, mid, `mid ${mid}`, 'current')));

    rec.phase('돌 살피기', seen.blocked
      ? `${mid}보다 작은 돌은 이미 0입니다. 왼쪽부터 훑으니 ${weak} 세 칸이 연속으로 막힙니다.`
      : seen.len
        ? `${mid}보다 작은 돌은 이미 0입니다. 막히는 돌은 연속 ${seen.len}칸(${weak})이 가장 깁니다.`
        : `${mid}보다 작은 돌이 없어 막히는 곳이 없습니다.`,
    scanLines(seen.blocked, flags.slice(0, seen.looked).includes(false)));
    inspect(rec, stoneIds, stoneRect, flags, seen, 'probe:label');

    rec.phase('범위 줄이기', narrowed(ok, mid, left, right), ok ? BINARY_AT.pass : BINARY_AT.fail);
    narrow(rec, ok, left, right, answer);
    rec.do(...clearInspect(rec, stoneIds, seen));
  }

  // 반복을 끝낸 뒤 답을 확인한다: 가장 약한 구간의 세 돌이 답을 정한다
  rec.step({ title: `건널 수 있는 최대 ${answer}명`, codeHighlights: BINARY_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `${WEAK} 세 칸은 ${answer}명이 건너면 모두 0이 됩니다. 그래서 ${answer + 1}번째 사람은 막히고 답은 ${answer}입니다.`);
  crown(rec);
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 돌 깎아 보기: 가운데 고르기 → 돌 깎기 → 돌 살피기 → 범위 줄이기      */
/* ------------------------------------------------------------------ */

function shaveAndSearch(): Visualization {
  const rec = new StepRecorder(board(true));
  let [left, right] = [1, MAX];
  let answer = 0;
  let mid = 0;
  let verdict = '-';
  let after: number[] = [];
  let looks = 0;
  const meta = () => ({
    work: looks,
    variables: { left, right, mid: mid || '-', after: after.length ? list(after) : '-', ok: verdict, answer },
  });

  rec.step({ title: `인원 수의 범위 1명 ~ ${MAX}명 정하기`, codeHighlights: COPY_AT.start, ...meta() });
  rec.phase('시작', '정석과 같은 범위에서 시작합니다. 다만 검사마다 ‘깎은 뒤’의 돌 배열을 새로 만들어 확인합니다.');
  rec.do(...together(range(left, right).map((it) => put(rec, it))), wait(500));

  while (left <= right) {
    const [l, r] = [left, right];
    mid = Math.floor((left + right) / 2);
    after = STONES.map((s) => Math.max(0, s - (mid - 1)));
    const flags = after.map((v) => v === 0);
    const seen = look(flags);
    looks += N + seen.looked; // 배열을 만들며 돌 N개를 한 번씩, 그 뒤 깎은 돌을 훑은 만큼
    const ok = !seen.blocked;
    verdict = ok ? 'True' : 'False';
    if (ok) [answer, left] = [mid, mid + 1];
    else right = mid - 1;

    rec.step({ title: `mid ${mid}명 → ${ok ? '건넘, 더 많이' : '막힘, 더 적게'}`, codeHighlights: ok ? COPY_AT.pass : COPY_AT.fail, ...meta() });
    rec.phase('가운데 고르기', `mid = ⌊(${l} + ${r}) ÷ 2⌋ = ${mid}명입니다.`, COPY_AT.mid);
    rec.do(...together(probeTo(rec, mid, `mid ${mid}`, 'current')));

    rec.phase('돌 깎기', `${mid - 1}명이 건넌 뒤 돌에 남은 수를 새 배열에 적습니다.`, COPY_AT.shave);
    rec.do(...together([
      setText('after:label', `${mid - 1}명이 건넌 뒤 돌에 남은 수`),
      ...after.map((v, i): Action => (rec.has(afterId(i))
        ? { type: 'set', id: afterId(i), patch: { text: String(v) }, pop: true }
        : { type: 'add', item: { id: afterId(i), kind: 'cell', rect: afterRect(i), tone: 'plain', text: String(v) }, from: stoneId(i) })),
    ]));

    rec.phase('돌 살피기', seen.blocked
      ? `깎은 돌을 왼쪽부터 훑으니 0이 세 칸 연속이라 막힙니다.`
      : seen.len
        ? `깎은 돌에서 0은 연속 ${seen.len}칸이 가장 깁니다.`
        : '깎은 돌에 0이 없어 막히는 곳이 없습니다.',
    COPY_AT.scan(seen.blocked));
    inspect(rec, afterIds, afterRect, flags, seen, 'probe:label');

    rec.phase('범위 줄이기', narrowed(ok, mid, left, right), ok ? COPY_AT.pass : COPY_AT.fail);
    narrow(rec, ok, left, right, answer);
    rec.do(...clearInspect(rec, afterIds, seen));
  }

  rec.step({ title: `건널 수 있는 최대 ${answer}명`, codeHighlights: COPY_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `${WEAK} 세 칸은 ${answer}명이 건너면 모두 0이 됩니다. 그래서 ${answer + 1}번째 사람은 막히고 답은 ${answer}입니다.`);
  crown(rec);
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 한 명씩 건너 보기: 다음 사람 → 돌 살피기 → 돌 밟기, 빨리 감기       */
/* ------------------------------------------------------------------ */

const SHOWN = 2; // 1, 2번째 사람은 한 단계씩 보이고, 그 뒤 마지막 두 사람 앞까지는 빨리 감기 한 단계로 묶는다

function simulate(): Visualization {
  const rec = new StepRecorder(board(false));
  let now = [...STONES];
  let people = 0;
  let looks = 0;
  const trample = (xs: number[]) => xs.map((s) => Math.max(0, s - 1)); // 건너며 돌을 한 번씩 밟은 뒤
  const meta = () => ({ work: looks, variables: { people, now: list(now) } });
  const dead = (xs: number[]) => (i: number): Tone => (xs[i] === 0 ? 'muted' : 'plain'); // 0이 된 돌은 회색
  // 돌 값과 색을 한꺼번에 쓴다(값이 바뀐 돌만 글씨가 튄다)
  const writeAll = (from: number[], to: number[], pop: boolean): Action[] =>
    to.map((v, i): Action => ({ type: 'set', id: stoneId(i), patch: { text: String(v), tone: dead(to)(i) }, ...(pop && v !== from[i] ? { pop } : {}) }));
  // 몇 번째 사람이 건너는지 알리는 이름표
  const nth = (p: number, tone: Tone) => together(probeTo(rec, p, `${p}번째`, tone));

  // 정답: 막히기 전까지 건너는 사람 수
  let total = 0;
  for (let xs = [...STONES]; !look(xs.map((s) => s === 0)).blocked; xs = trample(xs)) total++;

  rec.step({ title: '한 명씩 건너 보기 시작', codeHighlights: SIM_AT.start, ...meta() });
  rec.phase('시작', `사람을 한 명씩 실제로 건너게 합니다. 건널 때마다 밟은 돌의 수가 1씩 줄고, 0인 돌이 ${K}칸 연속이면 멈춥니다.`);
  rec.do(...together(probeTo(rec, 0, '0명', 'plain')), wait(500));

  // 사람 한 명: 다음 사람 → 돌 살피기(막힘 없음 확인) → 돌 밟기
  const person = (p: number) => {
    const before = now;
    const flags = before.map((s) => s === 0);
    const seen = look(flags);
    looks += seen.looked;
    people = p;
    now = trample(before);
    rec.step({ title: `${p}번째 사람 건넘`, codeHighlights: SIM_AT.loop, ...meta() });
    rec.phase('다음 사람', `${p}번째 사람이 건너려고 합니다.`);
    rec.do(...nth(p, 'current'));
    rec.phase('돌 살피기', seen.len
      ? `0인 돌은 연속 ${seen.len}칸이 가장 길어 ${K}칸에 못 미칩니다. 건널 수 있습니다.`
      : '0인 돌이 없어 막히는 곳이 없습니다. 건널 수 있습니다.', SIM_AT.scan(false));
    inspect(rec, stoneIds, stoneRect, flags, seen, 'probe:label');
    rec.phase('돌 밟기', '건너며 돌을 한 번씩 밟아, 0이 아닌 돌이 모두 1씩 줄어듭니다.', SIM_AT.step);
    rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...(rec.has('run') ? [{ type: 'remove', id: 'run' } as Action] : []), ...writeAll(before, now, true)]));
  };

  for (let p = 1; p <= SHOWN; p++) person(p);

  // 빨리 감기: 3 ~ total - 1번째 사람이 같은 일을 되풀이한다. 이름표가 미끄러지고 돌 값이 한꺼번에 줄어든다
  const [from, to] = [SHOWN + 1, total - 1];
  const before = now;
  for (let p = from; p <= to; p++) {
    looks += look(now.map((s) => s === 0)).looked;
    now = trample(now);
  }
  people = to;
  rec.step({ title: `${from}~${to}번째 사람 빨리 감기`, codeHighlights: SIM_AT.loop, ...meta() });
  rec.phase('빨리 감기', `${from}번째부터 ${to}번째까지 ${to - from + 1}명도 같은 일을 되풀이해, 돌마다 ${to}번 밟힙니다.`);
  rec.do(...together([...nth(to, 'current'), ...writeAll(before, now, false)]), wait(130));

  person(total);

  // 막히는 사람
  const flags = now.map((s) => s === 0);
  const seen = look(flags);
  looks += seen.looked;
  const blockedAt = total + 1;
  rec.step({ title: `${blockedAt}번째 사람은 막힘 — ${total}명`, codeHighlights: SIM_AT.scan(true), ...meta(), answer: total, isKeyframe: true });
  rec.phase('다음 사람', `${blockedAt}번째 사람이 건너려고 합니다.`);
  rec.do(...nth(blockedAt, 'bad'));
  rec.phase('돌 살피기', `0인 돌이 세 칸 연속이라 막힙니다. ${total}명까지만 건넌 것입니다.`, SIM_AT.scan(true));
  inspect(rec, stoneIds, stoneRect, flags, seen, 'probe:label');
  rec.phase('정답', `답은 ${total}명으로 정석과 같지만 돌을 ${looks}번 확인했습니다. 돌이 20만 개, 값이 2억이면 4 × 10¹³번이 넘습니다.`);
  rec.do(...together([put(rec, answerLabel(total)), ...clearInspect(rec, stoneIds, seen, dead(now))]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'stepping-stones',
  title: '징검다리 건너기',
  level: 3,
  category: 'binary-search',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/64062',
  description: {
    summary:
      '일렬로 놓인 징검다리 돌마다 밟을 수 있는 횟수가 적혀 있고, 친구들이 한 명씩 건너며 밟은 돌의 수를 1씩 줄입니다. 수가 0인 돌은 밟을 수 없지만, 한 번에 최대 k칸까지는 건너뛸 수 있습니다. 징검다리를 끝까지 건널 수 있는 친구가 최대 몇 명인지 구합니다.',
    rules: [
      'stones의 길이는 1 이상 200,000 이하',
      'stones의 원소는 1 이상 200,000,000 이하의 자연수',
      'k는 1 이상 stones의 길이 이하의 자연수',
      '건너는 친구 수에는 제한이 없고, 건너뛸 돌이 여럿이면 가장 가까운 돌로 뜁니다',
    ],
    examples: [{ input: 'stones = [2, 4, 5, 3, 2, 1, 4, 2, 5, 1], k = 3', output: '3' }],
  },
  keyIntuitions: [
    '친구를 한 명씩 건너게 하면 최대 2억 명이 돌 20만 개를 훑어야 해서 시간 초과입니다.',
    '질문을 뒤집어 "m명이 건널 수 있나?"를 묻습니다. m번째 사람 앞에서는 적힌 수가 m보다 작은 돌이 이미 0이라, 그런 돌이 k칸 연속이면 막힙니다.',
    'm이 커질수록 건너기 어려워지는 한쪽 방향이라서, 건널 수 있는 가장 큰 m을 이분 탐색으로 찾습니다.',
  ],
  demo: { input: [STONES, K], label: 'stones = [91, 88, 27, 33, 41, 16, 23, 70, 83, 32], k = 3' },
  workUnit: '돌을 확인한 횟수',
  approaches: [
    {
      id: 'stones-binary',
      name: '건널 수 있는 인원 수를 이분 탐색',
      rank: 'BEST',
      timeComplexity: 'O(N log M)',
      spaceComplexity: 'O(1)',
      verdict: '인원 수를 정해 놓고 한 번 훑어 판정하는 풀이로, 검사는 28번 안팎이면 끝납니다.',
      pros: [
        '판정이 "m보다 작은 돌이 k칸 연속인가?" 한 번의 훑기라 코드가 짧고 틀릴 곳이 적습니다.',
        '검사 횟수가 log₂(2억) ≈ 28번이라 돌 20만 개도 금방 끝납니다.',
        '돌 배열을 건드리지 않고 비교만 해서 추가 메모리가 필요 없습니다.',
      ],
      cons: [
        '"m번째 사람 앞에서는 m보다 작은 돌이 이미 0"이라는 관계를 떠올려야 합니다.',
        'right를 max(stones)로 잡아야 반복이 줄어듭니다(2억으로 잡아도 맞지만 더 돕니다).',
      ],
      whyThisRank:
        '인원이 늘수록 건너기 어려워지는 단조성이 있어 답을 이분 탐색할 수 있습니다. 배열을 새로 만들지 않고 s < m으로 바로 비교하므로 가장 단순하고 안전합니다.',
      code: BINARY,
      visualize: binarySearch,
    },
    {
      id: 'stones-shave',
      name: '돌을 깎아 본 뒤 확인하는 이분 탐색',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log M)',
      spaceComplexity: 'O(N)',
      verdict: '같은 이분 탐색이지만 검사마다 m − 1명이 건넌 뒤의 돌 배열을 새로 만들어, 정석보다 시간도 메모리도 더 씁니다.',
      pros: [
        '"사람이 건너면 돌이 닳는다"는 문제 설명을 그대로 옮겨 이해하기 쉽습니다.',
        '깎은 값이 0인 돌만 세면 되어 판정 조건이 단순합니다.',
      ],
      cons: [
        '검사마다 돌 배열을 통째로 새로 만들어 추가 메모리 O(N)과 돌을 한 번 더 훑는 시간이 듭니다(돌 20만 개를 28번 복사).',
        '깎은 값에서 mid와 mid − 1을 헷갈리기 쉽습니다.',
      ],
      whyThisRank:
        '답은 정석과 같지만, 정석은 s < m으로 바로 비교해 복사본이 필요 없습니다. 검사마다 배열을 만드는 만큼 일과 메모리를 더 써서 대안입니다.',
      code: COPY,
      visualize: shaveAndSearch,
    },
    {
      id: 'stones-simulate',
      name: '친구를 한 명씩 건너 보게 하기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(M × N)',
      spaceComplexity: 'O(N)',
      verdict: '친구를 실제로 한 명씩 건너게 하다 처음 막히는 순간 멈춥니다. 답은 맞지만 돌 값이 2억이면 끝나지 않습니다.',
      pros: ['문제 설명을 그대로 옮긴 가장 직관적인 풀이입니다.', '작은 입력에서는 정석과 같은 답을 냅니다.'],
      cons: [
        '건널 수 있는 사람이 최대 2억 명이고 사람마다 돌 20만 개를 훑어, 최악에는 4 × 10¹³번이 넘게 확인합니다.',
        '효율성 테스트에서 시간 초과가 납니다.',
      ],
      whyThisRank:
        '"m명이 건널 수 있나?"를 한 명씩 쌓아 가며 알아냅니다. 같은 질문을 m을 정해 놓고 한 번에 판정하면 28번의 검사로 끝납니다.',
      code: SIM,
      visualize: simulate,
    },
  ],
  checks: {
    cases: [
      { args: [[2, 4, 5, 3, 2, 1, 4, 2, 5, 1], 3], expected: 3 },
      { args: [[1], 1], expected: 1 },
      { args: [[5, 5, 5], 3], expected: 5 },
      { args: [[3, 1, 2], 1], expected: 1 },
      { args: [[4, 1, 9], 3], expected: 9 },
      { args: [STONES, K], expected: 41 },
    ],
    // 돌 1~8개, 값 1~12, k는 1~돌 수(함정이 사람 수만큼 도는 시간도 짧다)
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 8);
      const stones = Array.from({ length: n }, () => 1 + Math.floor(rand() * 12));
      return [stones, 1 + Math.floor(rand() * n)];
    },
  },
};

export default problem;
