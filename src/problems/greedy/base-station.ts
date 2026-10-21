// 기지국 설치: 정석 빈 구간 나누기, 대안 왼쪽부터 건너뛰며 기지국 놓기, 함정 아파트마다 칸을 만들어 하나씩 확인(느림)을 같은 장면에서 움직인다.
// 장면은 위에서부터 기존 기지국 이름표, 포인터 줄, 아파트 칸 한 줄(기존 기지국의 범위는 점선 상자), 새로 설치한 기지국 줄, 개수 표시다.
// 아파트 칸의 색: 흰색은 아직 모름, 초록은 기존 기지국이 덮음, 파랑은 새 기지국이 덮음.
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { josa, lines, together } from '../shared.ts';
import { PacedRecorder } from './paced.ts';

// 시각화 입력. 정석 6개, 아파트를 하나씩 보면 같은 답을 내지만 훨씬 많이 반복한다.
const N = 24;
const STATIONS = [3, 10, 14, 18, 21];
const W = 1;
const SPAN = 2 * W + 1; // 기지국 하나가 덮는 아파트 수
const range = (a: number, b: number): number[] => Array.from({ length: Math.max(0, b - a + 1) }, (_, k) => a + k);
const cover = (p: number): number[] => range(Math.max(1, p - W), Math.min(N, p + W)); // 기지국 p가 덮는 아파트
const EXISTING = new Set(STATIONS.flatMap(cover));
const dash = (v: number) => (v < 0 ? '-' : v);
const ratio = (a: number, b: number) => Number((a / b).toFixed(2));

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const SPLIT = {
  python: `def solution(n, stations, w):
    answer = 0
    span = 2 * w + 1                       # 기지국 하나가 덮는 아파트 수
    start = 1                              # 아직 확인하지 않은 가장 왼쪽 아파트
    for s in stations:
        gap = s - w - start                # 이 기지국 범위(s - w ~ s + w) 앞의 빈 아파트 수
        if gap > 0:
            answer += (gap + span - 1) // span   # 빈 구간을 span칸씩 덮는 데 필요한 기지국 수(올림)
        start = s + w + 1                  # 이 기지국 범위 다음부터 다시 센다
    tail = n - start + 1                   # 마지막 기지국 뒤에 남은 빈 아파트 수
    if tail > 0:
        answer += (tail + span - 1) // span
    return answer`,
  javascript: `function solution(n, stations, w) {
  let answer = 0;
  const span = 2 * w + 1; // 기지국 하나가 덮는 아파트 수
  let start = 1; // 아직 확인하지 않은 가장 왼쪽 아파트
  for (const s of stations) {
    const gap = s - w - start; // 이 기지국 범위(s - w ~ s + w) 앞의 빈 아파트 수
    if (gap > 0) {
      answer += Math.ceil(gap / span); // 빈 구간을 span칸씩 덮는 데 필요한 기지국 수(올림)
    }
    start = s + w + 1; // 이 기지국 범위 다음부터 다시 센다
  }
  const tail = n - start + 1; // 마지막 기지국 뒤에 남은 빈 아파트 수
  if (tail > 0) {
    answer += Math.ceil(tail / span);
  }
  return answer;
}`,
};
const SPLIT_AT = {
  init: lines(SPLIT, ['answer = 0', 'span = 2 * w + 1', 'start = 1'], ['let answer = 0', 'const span = 2 * w + 1', 'let start = 1']),
  look: lines(SPLIT, ['for s in stations', 'gap = s - w - start', 'if gap > 0'], ['for (const s of stations)', 'const gap = s - w - start', 'if (gap > 0)']),
  place: lines(SPLIT, ['answer += (gap + span - 1) // span'], ['answer += Math.ceil(gap / span)']),
  skip: lines(SPLIT, ['start = s + w + 1'], ['start = s + w + 1']),
  tail: lines(SPLIT, ['tail = n - start + 1', 'if tail > 0'], ['const tail = n - start + 1', 'if (tail > 0)']),
  tailPlace: lines(SPLIT, ['answer += (tail + span - 1) // span'], ['answer += Math.ceil(tail / span)']),
  done: lines(SPLIT, ['return answer'], ['return answer']),
};

const JUMP = {
  python: `def solution(n, stations, w):
    answer = 0
    span = 2 * w + 1                       # 기지국 하나가 덮는 아파트 수
    pos = 1                                # 아직 덮이지 않은 가장 왼쪽 아파트
    i = 0                                  # 다음에 만날 기존 기지국
    while pos <= n:
        if i < len(stations) and stations[i] - w <= pos:   # pos가 기존 기지국 범위에 닿는다
            pos = stations[i] + w + 1                      # 그 범위 끝까지 건너뛴다
            i += 1
        else:                                              # 덮이지 않은 아파트 → 새 기지국을 놓는다
            answer += 1
            pos += span                                    # 새 기지국이 span칸을 덮는다
    return answer`,
  javascript: `function solution(n, stations, w) {
  let answer = 0;
  const span = 2 * w + 1; // 기지국 하나가 덮는 아파트 수
  let pos = 1; // 아직 덮이지 않은 가장 왼쪽 아파트
  let i = 0; // 다음에 만날 기존 기지국
  while (pos <= n) {
    if (i < stations.length && stations[i] - w <= pos) { // pos가 기존 기지국 범위에 닿는다
      pos = stations[i] + w + 1; // 그 범위 끝까지 건너뛴다
      i++;
    } else { // 덮이지 않은 아파트 → 새 기지국을 놓는다
      answer++;
      pos += span; // 새 기지국이 span칸을 덮는다
    }
  }
  return answer;
}`,
};
const JUMP_AT = {
  init: lines(JUMP, ['answer = 0', 'span = 2 * w + 1', 'pos = 1', 'i = 0'], ['let answer = 0', 'const span = 2 * w + 1', 'let pos = 1', 'let i = 0']),
  look: lines(JUMP, ['while pos <= n', 'if i < len(stations) and stations[i] - w <= pos'], ['while (pos <= n)', 'if (i < stations.length && stations[i] - w <= pos)']),
  jump: lines(JUMP, ['pos = stations[i] + w + 1', 'i += 1'], ['pos = stations[i] + w + 1', 'i++']),
  place: lines(JUMP, ['else:', 'answer += 1', 'pos += span'], ['} else {', 'answer++', 'pos += span']),
  done: lines(JUMP, ['while pos <= n', 'return answer'], ['while (pos <= n)', 'return answer']),
};

const ARRAY = {
  python: `def solution(n, stations, w):
    covered = [False] * (n + 2)            # 아파트마다 칸 하나 → N이 2억이면 2억 칸
    for s in stations:
        for k in range(max(1, s - w), min(n, s + w) + 1):
            covered[k] = True              # 기존 기지국이 덮는 아파트를 하나씩 표시
    answer = 0
    span = 2 * w + 1                       # 기지국 하나가 덮는 아파트 수
    i = 1
    while i <= n:                          # 아파트를 하나씩 확인 → 최대 2억 번
        if covered[i]:
            i += 1                         # 이미 덮여 있다
        else:
            answer += 1                    # i를 덮도록 i + w에 새 기지국을 놓는다
            i += span
    return answer`,
  javascript: `function solution(n, stations, w) {
  const covered = new Array(n + 2).fill(false); // 아파트마다 칸 하나 → N이 2억이면 2억 칸
  for (const s of stations) {
    for (let k = Math.max(1, s - w); k <= Math.min(n, s + w); k++) {
      covered[k] = true; // 기존 기지국이 덮는 아파트를 하나씩 표시
    }
  }
  let answer = 0;
  const span = 2 * w + 1; // 기지국 하나가 덮는 아파트 수
  let i = 1;
  while (i <= n) { // 아파트를 하나씩 확인 → 최대 2억 번
    if (covered[i]) {
      i++; // 이미 덮여 있다
    } else {
      answer++; // i를 덮도록 i + w에 새 기지국을 놓는다
      i += span;
    }
  }
  return answer;
}`,
};
const ARRAY_AT = {
  alloc: lines(ARRAY, ['covered = [False] * (n + 2)'], ['const covered = new Array(n + 2).fill(false)']),
  mark: lines(ARRAY, ['for s in stations', 'for k in range(max(1, s - w)', 'covered[k] = True'], ['for (const s of stations)', 'for (let k = Math.max(1, s - w)', 'covered[k] = true']),
  init: lines(ARRAY, ['answer = 0', 'span = 2 * w + 1', 'i = 1'], ['let answer = 0', 'const span = 2 * w + 1', 'let i = 1']),
  look: lines(ARRAY, ['while i <= n', 'if covered[i]'], ['while (i <= n)', 'if (covered[i])']),
  skip: lines(ARRAY, ['i += 1'], ['i++']),
  place: lines(ARRAY, ['else:', 'answer += 1', 'i += span'], ['} else {', 'answer++', 'i += span']),
  done: lines(ARRAY, ['while i <= n', 'return answer'], ['while (i <= n)', 'return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 64px은 줄 이름, 아파트 칸은 x 70부터 22px씩(칸 20px, 번호는 칸 아래 눈금 글). 오른쪽 40px은 맨 끝 포인터와 판정 표시가 장면 안에 들도록 둔 여백이다.
// 세로 띠: 기존 기지국 이름표 0~22, 포인터 28~50, 아파트 칸 84~120(판정 표시가 칸 위 11px에 붙는다), 눈금 글 126~142, 새 기지국 148~172, 개수 표시 184~212.
const CELL = 20;
const PITCH = 22;
const X0 = 70;
const cellX = (v: number) => X0 + (v - 1) * PITCH;
const midX = (v: number) => cellX(v) + CELL / 2;
const EX_Y = 0;
const PTR_Y = 28;
const CELL_Y = 84;
const CELL_H = 36;
const TICK_Y = CELL_Y + CELL_H + 6;
const NEW_Y = 148;
const RES_Y = 184;
const SCENE_W = X0 + N * PITCH + 40;
const SCENE_H = RES_Y + 28 + 6;
const COUNT_AT: Rect = { x: X0, y: RES_Y, w: 150, h: 28 };
const MEM_AT: Rect = { x: X0 + 160, y: RES_Y, w: 150, h: 28 };

const cellId = (v: number) => `cell:${v}`;
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const paint = (vs: number[], tone: Tone): Action[] => vs.map((v): Action => ({ type: 'set', id: cellId(v), patch: { tone } }));
const count = (n: number): Action => ({ type: 'set', id: 'tok:count', patch: { text: `새 기지국 ${n}개`, tone: 'chosen' }, pop: true });
const ptrRect = (v: number): Rect => ({ x: midX(Math.min(v, N + 1)) - 24, y: PTR_Y, w: 48, h: 22 });
// 포인터: 처음이면 그 자리에 나타나고, 그 뒤로는 미끄러져 옮겨 간다(맨 끝을 넘으면 마지막 칸 바로 뒤에 붙인다)
const ptrTo = (rec: PacedRecorder, name: string, v: number): Action =>
  rec.has('ptr') ? { type: 'set', id: 'ptr', patch: { rect: ptrRect(v) } } : { type: 'add', item: { id: 'ptr', kind: 'token', rect: ptrRect(v), tone: 'chosen', text: name } };
// 새 기지국 토큰: p번 아파트에서 날아와 새 기지국 줄의 p번 아래에 놓인다
const stationItem = (k: number, p: number): Item => ({ id: `new:${k}`, kind: 'token', rect: { x: midX(p) - 15, y: NEW_Y, w: 30, h: 24 }, tone: 'chosen', text: String(p) });
// 새 기지국이 새로 덮는 아파트: 기존 기지국이 이미 덮는 칸은 제외
const fresh = (p: number): number[] => cover(p).filter((v) => !EXISTING.has(v));
const place = (k: number, p: number, total: number): Action[] =>
  together([{ type: 'add', item: stationItem(k, p), from: cellId(p) }, ...paint(fresh(p), 'chosen'), count(total)]);

// 세 풀이가 같이 쓰는 장면: 기존 기지국 범위(점선 상자), 줄 이름, 기존 기지국 이름표, 아파트 칸, 개수 표시
function board(): Scene {
  const items: Item[] = STATIONS.map((s, j): Item => {
    const [a, b] = [Math.max(1, s - W), Math.min(N, s + W)];
    return { id: `zone:${j}`, kind: 'zone', rect: { x: cellX(a) - 3, y: CELL_Y - 4, w: (b - a + 1) * PITCH - (PITCH - CELL) + 6, h: CELL_H + 8 } };
  });
  items.push(
    { id: 'lab:ex', kind: 'text', rect: { x: 0, y: EX_Y, w: 64, h: 22 }, text: '기존' },
    { id: 'lab:cell', kind: 'text', rect: { x: 0, y: CELL_Y, w: 64, h: CELL_H }, text: '아파트' },
    { id: 'lab:new', kind: 'text', rect: { x: 0, y: NEW_Y, w: 64, h: 24 }, text: '새로 설치' },
    { id: 'tok:count', kind: 'token', rect: COUNT_AT, tone: 'plain', text: '새 기지국 0개' },
  );
  STATIONS.forEach((s, j) => items.push({ id: `ex:${j}`, kind: 'token', rect: { x: midX(s) - 15, y: EX_Y, w: 30, h: 22 }, tone: 'muted', text: String(s) }));
  for (let v = 1; v <= N; v++) {
    items.push(
      { id: cellId(v), kind: 'cell', rect: { x: cellX(v), y: CELL_Y, w: CELL, h: CELL_H }, tone: 'plain' },
      { id: `tick:${v}`, kind: 'text', rect: { x: cellX(v) - 1, y: TICK_Y, w: PITCH, h: 16 }, tone: 'muted', text: String(v) },
    );
  }
  return { width: SCENE_W, height: SCENE_H, items };
}

// 새 기지국이 놓인 토큰 id 모두(정답에서 분홍색으로)
const stationIds = (rec: PacedRecorder): string[] => Array.from({ length: 20 }, (_, k) => `new:${k}`).filter((id) => rec.has(id));

/* ------------------------------------------------------------------ */
/* 정석 빈 구간 나누기: 빈 구간 찾기 → 기지국 놓기 → 건너뛰기             */
/* ------------------------------------------------------------------ */

function gapSplit(): Visualization {
  const rec = new PacedRecorder(board());
  let [start, answer, work, placed] = [1, 0, 0, 0];
  let [s, gap, tail] = [-1, -1, -1];
  const meta = () => ({ work, variables: { s: dash(s), gap: s < 0 ? '-' : gap, start, tail: dash(tail), answer, span: SPAN } });

  rec.step({ title: 'start = 1, answer = 0', codeHighlights: SPLIT_AT.init, ...meta() });
  rec.phase('시작', `기지국 하나는 양옆 ${W}칸씩 모두 ${SPAN}칸(span)을 덮습니다. 1번 아파트에서 시작하고, 새 기지국은 0개입니다.`);
  rec.do(...together([ptrTo(rec, 'start', 1), count(0)]));

  // 빈 구간 [a, b]를 맡은 새 기지국 자리: 구간 안에서 왼쪽부터 SPAN칸씩 덮도록 놓는다
  const seatsFor = (a: number, b: number): number[] => Array.from({ length: Math.ceil((b - a + 1) / SPAN) }, (_, j) => Math.min(a + j * SPAN + W, b));

  STATIONS.forEach((st) => {
    const [a, left, right] = [start, st - W, st + W];
    const g = left - a;
    const gapCells = g > 0 ? range(a, left - 1) : [];
    const seats = g > 0 ? seatsFor(a, left - 1) : [];
    [s, gap] = [st, g];
    work++;
    start = right + 1;
    answer += seats.length;

    rec.step({
      title: g > 0 ? `기지국 ${st}: 앞 빈 구간 ${a}~${left - 1}번 → ${seats.length}개` : `기지국 ${st}: 앞에 빈 구간 없음`,
      codeHighlights: seats.length ? SPLIT_AT.place : SPLIT_AT.skip,
      ...meta(),
    });
    rec.phase('빈 구간 찾기', g > 0
      ? `기지국 ${st}번은 ${left}~${right}번을 덮습니다. 그 앞의 빈 구간은 ${a}~${left - 1}번, ${g}칸입니다.`
      : `기지국 ${st}번은 ${left}~${right}번을 덮습니다. 바로 앞까지 이어져 있어 빈 구간이 없습니다.`, SPLIT_AT.look);
    if (g > 0) {
      rec.do(...together([{ type: 'focus', ids: gapCells.map(cellId) }, ...paint(gapCells, 'current')]));
      rec.do({ type: 'arrow', from: 'ptr', to: cellId(left - 1), verdict: 'new', label: `빈 구간 ${g}칸` }, wait(400));
    } else {
      rec.do({ type: 'focus', ids: cover(st).map(cellId) }, wait(500));
    }

    if (seats.length) {
      rec.phase('기지국 놓기', `${g} ÷ ${SPAN} = ${josa(ratio(g, SPAN), '이라', '라')} 올림해서 기지국 ${seats.length}개를 놓습니다.`, SPLIT_AT.place);
      rec.do(...clear());
      seats.forEach((p, j) => {
        rec.do(...place(placed, p, answer - seats.length + j + 1));
        placed++;
      });
    }

    rec.phase('건너뛰기', `기지국 ${st}번의 범위 ${left}~${right}번은 이미 덮여 있으니 건너뜁니다. start = ${start}입니다.`, SPLIT_AT.skip);
    rec.do(...clear(...paint(cover(st), 'visited'), ptrTo(rec, 'start', start)));
  });

  // 마지막 기지국 뒤의 빈 구간
  const rest = N - start + 1;
  const seats = rest > 0 ? seatsFor(start, N) : [];
  tail = rest;
  work++;
  answer += seats.length;
  rec.step({
    title: rest > 0 ? `마지막 빈 구간 ${start}~${N}번 → ${seats.length}개` : '마지막 기지국 뒤에 빈 구간 없음',
    codeHighlights: seats.length ? SPLIT_AT.tailPlace : SPLIT_AT.tail,
    ...meta(),
  });
  rec.phase('빈 구간 찾기', rest > 0
    ? `마지막 기지국 뒤에 ${start}~${N}번, ${rest}칸이 비어 있습니다.`
    : '마지막 기지국 뒤에는 빈 아파트가 없습니다.', SPLIT_AT.tail);
  if (rest > 0) {
    const tailCells = range(start, N);
    rec.do(...together([{ type: 'focus', ids: tailCells.map(cellId) }, ...paint(tailCells, 'current')]));
    rec.do({ type: 'arrow', from: 'ptr', to: cellId(N), verdict: 'new', label: `빈 구간 ${rest}칸` }, wait(400));
    rec.phase('기지국 놓기', `${rest} ÷ ${SPAN} = ${josa(ratio(rest, SPAN), '이라', '라')} 올림해서 기지국 ${seats.length}개를 놓습니다.`, SPLIT_AT.tailPlace);
    rec.do(...clear());
    seats.forEach((p, j) => {
      rec.do(...place(placed, p, answer - seats.length + j + 1));
      placed++;
    });
  } else {
    rec.do(wait(500));
  }

  rec.step({ title: `새 기지국 ${answer}개`, codeHighlights: SPLIT_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `빈 구간마다 올림 나눗셈으로 센 기지국을 더하면 ${answer}개입니다. 반복은 ${work}번뿐이라, N이 2억이어도 기지국 수만큼만 돕니다.`);
  rec.do(...together([...stationIds(rec).map((id): Action => ({ type: 'set', id, patch: { tone: 'path' } })), { type: 'set', id: 'tok:count', patch: { tone: 'path' }, pop: true }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 건너뛰며 기지국 놓기: 확인하기 → 건너뛰기 또는 기지국 놓기 (반복 한 번이 한 단계) */
/* ------------------------------------------------------------------ */

function jumps(): Visualization {
  const rec = new PacedRecorder(board());
  let [pos, i, answer, work, placed] = [1, 0, 0, 0, 0];
  const meta = () => ({ work, variables: { pos, i, answer, span: SPAN } });

  rec.step({ title: 'pos = 1, i = 0, answer = 0', codeHighlights: JUMP_AT.init, ...meta() });
  rec.phase('시작', `1번 아파트부터 덮이지 않은 곳을 찾아 나갑니다. 다음에 만날 기존 기지국은 i = 0번째이고, 새 기지국은 0개입니다.`);
  rec.do(...together([ptrTo(rec, 'pos', 1), count(0)]));

  while (pos <= N) {
    const was = pos;
    const next = i < STATIONS.length ? STATIONS[i] : undefined;
    const reach = next !== undefined && next - W <= was;
    work++;
    if (reach) {
      pos = next + W + 1;
      i++;
    } else {
      answer++;
      pos += SPAN;
    }

    rec.step({
      title: reach ? `pos ${was}: 기존 기지국 ${next}의 범위 → pos ${pos}` : `pos ${was}: 덮이지 않음 → 새 기지국 → pos ${pos}`,
      codeHighlights: reach ? JUMP_AT.jump : JUMP_AT.place,
      ...meta(),
    });
    if (next === undefined) {
      rec.phase('확인하기', `더 만날 기존 기지국이 없습니다. ${was}번 아파트는 덮이지 않았습니다.`, JUMP_AT.look);
      rec.do(...together([{ type: 'focus', ids: [cellId(was)] }, ...paint([was], 'current')]), wait(500));
    } else {
      rec.phase('확인하기', reach
        ? `다음 기존 기지국 ${next}번은 ${next - W}~${next + W}번을 덮습니다. ${was}번 아파트는 그 범위 안이라 이미 덮여 있습니다.`
        : `다음 기존 기지국 ${next}번의 범위는 ${next - W}번부터라, ${was}번 아파트는 덮여 있지 않습니다.`, JUMP_AT.look);
      rec.do(...together([{ type: 'focus', ids: [cellId(was), cellId(next - W)] }, ...paint([was], 'current')]));
      rec.do({ type: 'arrow', from: 'ptr', to: cellId(next - W), verdict: reach ? 'good' : 'new', label: reach ? `${next - W} ≤ ${was} 덮임` : `${next - W} > ${was} 비어 있음` }, wait(450));
    }

    if (reach) {
      const covered = range(was, Math.min(N, next + W));
      rec.phase('건너뛰기', `그 범위 끝까지 건너뜁니다. pos = ${pos}, 다음 기존 기지국은 ${i}번째입니다.`, JUMP_AT.jump);
      rec.do(...clear(...paint(covered, 'visited'), ptrTo(rec, 'pos', pos)));
    } else {
      const p = Math.min(was + W, N);
      rec.phase('기지국 놓기', `${was}번을 덮도록 ${was + W <= N ? `${was + W}번` : `끝 아파트 ${N}번`}에 새 기지국을 놓습니다. ${SPAN}칸을 건너뛰어 pos = ${pos}입니다.`, JUMP_AT.place);
      rec.do(...clear());
      rec.do(...place(placed, p, answer), { type: 'set', id: 'ptr', patch: { rect: ptrRect(pos) }, together: true });
      placed++;
    }
  }

  rec.step({ title: `새 기지국 ${answer}개`, codeHighlights: JUMP_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `pos = ${josa(pos, '이', '가')} N = ${josa(N, '을', '를')} 넘어 끝났습니다. 새 기지국은 ${answer}개입니다. 답은 정석과 같지만 ${work}번 반복했고, 새 기지국마다 한 번씩 더 돕니다.`);
  rec.do(...together([...stationIds(rec).map((id): Action => ({ type: 'set', id, patch: { tone: 'path' } })), { type: 'set', id: 'tok:count', patch: { tone: 'path' }, pop: true }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 아파트마다 확인(느림): 배열 만들기 → 표시하기 → 확인하기 → 건너뛰기/놓기, 빨리 감기 */
/* ------------------------------------------------------------------ */

// 확인 순서: 아파트 i에서 시작해 덮여 있으면 1칸, 아니면 새 기지국 SPAN칸 건너뜀. 덮인 칸이 이어지면 한 묶음(빨리 감기)
interface Visit { at: number; len: number; covered: boolean }
const VISITS: Visit[] = [];
{
  let i = 1;
  while (i <= N) {
    if (EXISTING.has(i)) {
      const last = VISITS.at(-1);
      if (last?.covered && last.at + last.len === i) last.len++;
      else VISITS.push({ at: i, len: 1, covered: true });
      i++;
    } else {
      VISITS.push({ at: i, len: 1, covered: false });
      i += SPAN;
    }
  }
}
const BEST_WORK = STATIONS.length + 1; // 정석이 반복한 횟수: 기지국마다 한 번, 마지막 빈 구간 한 번

function booleanArray(): Visualization {
  const rec = new PacedRecorder(board());
  let [i, answer, work, placed] = [0, 0, 0, 0];
  const meta = () => ({ work, variables: { i: i || '-', answer, span: SPAN } });

  rec.step({ title: `covered 배열 ${N}칸 만들기`, codeHighlights: ARRAY_AT.alloc, ...meta() });
  rec.phase('배열 만들기', `아파트마다 칸 하나씩, 아파트 수 ${N}만큼 covered 배열을 만듭니다. N이 2억이면 2억 칸입니다.`);
  rec.do({ type: 'add', item: { id: 'tok:mem', kind: 'token', rect: MEM_AT, tone: 'muted', text: `covered ${N}칸` } });

  STATIONS.forEach((st) => {
    const marked = cover(st);
    work += marked.length;
    rec.step({ title: `기지국 ${st}의 범위 ${marked[0]}~${marked.at(-1)}번 표시`, codeHighlights: ARRAY_AT.mark, ...meta() });
    rec.phase('표시하기', `기지국 ${st}번이 덮는 ${marked[0]}~${marked.at(-1)}번, ${marked.length}칸을 하나씩 True로 표시합니다.`, ARRAY_AT.mark);
    rec.do(...together([{ type: 'focus', ids: marked.map(cellId) }, ...paint(marked, 'visited')]));
    rec.do(...clear(), wait(150));
  });

  i = 1;
  rec.step({ title: 'i = 1부터 하나씩 확인', codeHighlights: ARRAY_AT.init, ...meta() });
  rec.phase('시작', '이제 1번 아파트부터 covered 값을 하나씩 확인하며, 덮이지 않은 곳마다 새 기지국을 놓습니다.');
  rec.do(...together([ptrTo(rec, 'i', 1), count(0)]));

  VISITS.forEach((v) => {
    const was = v.at;
    work += v.len;
    if (v.covered) {
      i = was + v.len;
    } else {
      answer++;
      i = was + SPAN;
    }
    const p = Math.min(was + W, N);
    const last = was + v.len - 1;

    if (v.covered && v.len > 1) {
      rec.step({ title: `i = ${was}~${last} 빨리 감기: 모두 덮여 있음`, codeHighlights: ARRAY_AT.skip, ...meta() });
      rec.phase('빨리 감기', `covered[${was}]부터 covered[${last}]까지 ${v.len}칸이 모두 True라, 하나씩 확인하며 i를 ${v.len}번 올립니다. i = ${i}입니다.`, ARRAY_AT.skip);
      rec.do(ptrTo(rec, 'i', i));
      return;
    }
    rec.step({
      title: v.covered ? `i = ${was}: 덮여 있음 → i = ${i}` : `i = ${was}: 덮이지 않음 → 새 기지국 → i = ${i}`,
      codeHighlights: v.covered ? ARRAY_AT.skip : ARRAY_AT.place,
      ...meta(),
    });
    rec.phase('확인하기', `covered[${was}] = ${v.covered ? 'True라서 이미 덮여 있습니다.' : 'False라서 덮여 있지 않습니다.'}`, ARRAY_AT.look);
    rec.do(...together([{ type: 'focus', ids: [cellId(was)] }, ...paint([was], 'current')]));
    rec.do({ type: 'arrow', from: 'ptr', to: cellId(was), verdict: v.covered ? 'seen' : 'new', label: v.covered ? '덮임' : '비어 있음' }, wait(450));
    if (v.covered) {
      rec.phase('건너뛰기', `다음 아파트로 넘어갑니다. i = ${i}입니다.`, ARRAY_AT.skip);
      rec.do(...clear(...paint([was], 'visited'), ptrTo(rec, 'i', i)));
    } else {
      rec.phase('기지국 놓기', `${was}번을 덮도록 ${was + W <= N ? `${was + W}번` : `끝 아파트 ${N}번`}에 새 기지국을 놓고 ${SPAN}칸을 건너뜁니다. i = ${i}입니다.`, ARRAY_AT.place);
      rec.do(...clear());
      rec.do(...place(placed, p, answer), { type: 'set', id: 'ptr', patch: { rect: ptrRect(i) }, together: true });
      placed++;
    }
  });

  rec.step({ title: `새 기지국 ${answer}개, 반복 ${work}번`, codeHighlights: ARRAY_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `답은 ${answer}개로 맞지만 칸 ${N}개를 만들고 ${work}번 반복했습니다. N이 2억이면 2억 칸에 2억 번 가까운 반복이라 시간 초과입니다. 정석은 ${BEST_WORK}번이면 됩니다.`);
  rec.do(...together([...stationIds(rec).map((id): Action => ({ type: 'set', id, patch: { tone: 'path' } })), { type: 'set', id: 'tok:count', patch: { tone: 'path' }, pop: true }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'base-station',
  title: '기지국 설치',
  level: 3,
  category: 'greedy',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12979',
  description: {
    summary:
      'N개의 아파트가 일렬로 서 있고, 일부 아파트에는 기지국이 있습니다. 기지국은 자기 자리에서 양옆 W칸까지, 모두 2W + 1칸의 아파트에 전파를 보냅니다. 모든 아파트에 전파가 닿으려면 새 기지국을 최소 몇 개 더 세워야 하는지 구합니다.',
    rules: [
      'N은 2억 이하의 자연수',
      'stations는 길이 1만 이하이고, N 이하의 자연수가 오름차순으로 들어 있음',
      'W는 1만 이하의 자연수',
      '기지국 하나는 자기 자리와 양옆 W칸씩, 모두 2W + 1칸의 아파트를 덮음',
    ],
    examples: [
      { input: 'N = 11, stations = [4, 11], W = 1', output: '3' },
      { input: 'N = 16, stations = [9], W = 2', output: '3' },
    ],
  },
  keyIntuitions: [
    '기존 기지국이 덮는 구간을 빼면 남는 빈 구간들은 서로 영향을 주지 않습니다. 구간마다 따로 필요한 기지국 수를 세어 더하면 됩니다.',
    '새 기지국 하나는 2W + 1칸을 덮으므로, 길이가 g인 빈 구간에는 ⌈g ÷ (2W + 1)⌉개가 듭니다. 아파트를 하나씩 보지 않고 구간 길이만 계산합니다.',
    'stations가 정렬되어 있으니 왼쪽부터 기지국마다 앞의 빈 구간을 계산하고, 마지막 기지국 뒤의 빈 구간도 빼먹지 않습니다. N이 2억이라 아파트를 하나씩 보는 풀이는 시간 초과입니다.',
  ],
  demo: { input: [N, STATIONS, W], label: 'N = 24, stations = [3, 10, 14, 18, 21], W = 1' },
  workUnit: '반복한 횟수',
  approaches: [
    {
      id: 'base-station-gap-split',
      name: '빈 구간 나누기 (올림 나눗셈)',
      rank: 'BEST',
      timeComplexity: 'O(K) (K = 기지국 수)',
      spaceComplexity: 'O(1)',
      verdict: '기존 기지국 사이의 빈 구간 길이만 구해, 구간마다 ⌈길이 ÷ (2W + 1)⌉개씩 더하는 풀이입니다.',
      pros: [
        '기지국 수 K(최대 1만)만큼만 반복하므로 N이 2억이어도 순식간에 끝납니다.',
        '추가 메모리가 필요 없습니다.',
        '구간끼리 서로 독립이라 계산이 단순합니다.',
      ],
      cons: [
        '마지막 기지국 뒤의 빈 구간을 빼먹기 쉽습니다.',
        '올림을 정수로 쓰려면 (gap + span − 1) // span처럼 써야 합니다.',
        '기존 기지국 범위가 서로 겹치면 gap이 음수가 되므로 gap > 0일 때만 더합니다.',
      ],
      whyThisRank:
        '빈 구간은 서로 영향을 주지 않고, 구간 하나에는 길이를 기지국 범위(2W + 1)로 나눈 값의 올림만큼 놓으면 됩니다. 아파트를 하나씩 볼 필요가 없어서 입력 크기 N이 아니라 기지국 수만큼만 일합니다.',
      code: SPLIT,
      visualize: gapSplit,
    },
    {
      id: 'base-station-jump',
      name: '왼쪽부터 건너뛰며 기지국 놓기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(K + 새 기지국 수)',
      spaceComplexity: 'O(1)',
      verdict: '왼쪽부터 덮이지 않은 첫 아파트에 기지국을 놓고 2W + 1칸을 건너뛰는, 맞지만 새 기지국 수만큼 반복하는 풀이입니다.',
      pros: [
        '생각한 순서대로 코드가 되어 직관적입니다.',
        '기존 기지국 범위는 한 번에 건너뛰므로 아파트를 하나씩 보는 풀이보다 훨씬 빠릅니다.',
      ],
      cons: [
        '새 기지국 수만큼 반복합니다. 기지국이 하나도 없고 W = 1이면 약 6,700만 번이라 Python에서는 느립니다.',
        'pos와 i 두 값을 함께 움직이므로 범위의 끝과 마지막 기지국 경계를 한 칸씩 틀리기 쉽습니다.',
      ],
      whyThisRank:
        '왼쪽부터 놓는다는 생각은 정석과 같지만, 빈 구간 하나를 나눗셈 한 번이 아니라 기지국 하나씩 반복해서 처리합니다. 빈 구간이 길수록 정석과의 차이가 벌어집니다.',
      code: JUMP,
      visualize: jumps,
    },
    {
      id: 'base-station-array',
      name: '아파트마다 칸을 만들어 하나씩 확인',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: 'covered 배열을 만들어 아파트를 하나씩 확인하는 풀이로, 답은 맞지만 N이 2억이면 시간과 메모리가 모자랍니다.',
      pros: ['생각하기 가장 쉽고, 작은 입력에서는 답이 맞습니다.'],
      cons: [
        'N이 최대 2억이라 covered 배열만 2억 칸이고, 확인도 2억 번 가까이 합니다.',
        '기지국이 몇 개인지와 상관없이 늘 아파트 수만큼 일합니다.',
      ],
      whyThisRank:
        '이 문제에서 큰 것은 기지국 수(최대 1만)가 아니라 아파트 수 N(최대 2억)입니다. 아파트를 하나씩 보는 순간 일의 양이 N에 비례하므로, 구간 길이만 계산하는 풀이가 필요합니다.',
      code: ARRAY,
      visualize: booleanArray,
    },
  ],
  checks: {
    cases: [
      { args: [11, [4, 11], 1], expected: 3 },
      { args: [16, [9], 2], expected: 3 },
      { args: [1, [1], 1], expected: 0 },
      { args: [10, [1], 1], expected: 3 },
      { args: [10, [10], 2], expected: 2 },
      { args: [5, [3], 5], expected: 0 },
      { args: [9, [2, 5, 8], 1], expected: 0 },
      { args: [24, [5, 6], 2], expected: 5 },
      { args: [N, STATIONS, W], expected: 6 },
    ],
    // N 1~25, W 1~3, 기지국 1~5개(겹치는 범위도 나옴)
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 25);
      const w = 1 + Math.floor(rand() * 3);
      const pool = Array.from({ length: n }, (_, k) => k + 1);
      const stations: number[] = [];
      for (let k = 1 + Math.floor(rand() * Math.min(5, n)); k > 0; k--) stations.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
      return [n, stations.sort((a, b) => a - b), w];
    },
  },
};

export default problem;
