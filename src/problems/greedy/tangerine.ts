// 귤 고르기: 정석 크기별 개수를 세고 많은 순으로 담기, 대안 남은 크기에서 가장 많은 것을 매번 찾기, 함정 크기마다 귤 전체를 훑어 세기(느림)를 같은 장면에서 움직인다.
// 장면은 위에 귤 한 줄(입력 순서), 왼쪽 아래에 크기별로 묶은 줄(귤이 날아와 묶이고, 정렬하면 줄이 자리를 바꿈), 오른쪽에 k칸짜리 상자와 표시다.
// 상자에 담긴 귤은 줄에서 상자 칸으로 미끄러져 들어간다.
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { josa, lines, together } from '../shared.ts';
import { PacedRecorder } from './paced.ts';

// 시각화 입력. 정석은 크기 5종류, 크기 순으로 앞에서 k개를 담으면 7종류가 나오는 입력이다(함정이 아니라 대안 설명용).
const K = 11;
const TANGERINE = [7, 3, 8, 5, 1, 7, 6, 8, 2, 5, 8, 7, 4, 6];
const N = TANGERINE.length;
const SIZES = [...new Set(TANGERINE)]; // 처음 나온 순서
const U = SIZES.length;
const groupOf = (s: number): number[] => TANGERINE.flatMap((x, i) => (x === s ? [i] : [])); // 크기 s인 귤의 입력 번호들
const countOf = (s: number) => groupOf(s).length;
const BY_COUNT = [...SIZES].sort((a, b) => countOf(b) - countOf(a)); // 안정 정렬: 개수가 같으면 먼저 나온 크기가 앞
const SORT_COST = Math.round(U * Math.log2(U)); // 개수 U개를 정렬하는 비교 횟수(대략)
const list = (xs: number[]) => `[${xs.join(', ')}]`;
// 담는 순서: 개수가 많은 크기부터, k가 0 이하가 되면 멈춘다
const TAKES: { size: number; before: number; after: number }[] = [];
{
  let k = K;
  for (const s of BY_COUNT) {
    TAKES.push({ size: s, before: k, after: k - countOf(s) });
    k -= countOf(s);
    if (k <= 0) break;
  }
}

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const SORTED = {
  python: `from collections import Counter

def solution(k, tangerine):
    counts = Counter(tangerine)                      # 크기별 개수
    answer = 0
    for c in sorted(counts.values(), reverse=True):  # 개수가 많은 크기부터
        k -= c                                       # 이 크기를 통째로 담는다
        answer += 1
        if k <= 0:                                   # 상자가 찼다
            break
    return answer`,
  javascript: `function solution(k, tangerine) {
  const counts = new Map();
  for (const size of tangerine) counts.set(size, (counts.get(size) ?? 0) + 1); // 크기별 개수
  let answer = 0;
  for (const c of [...counts.values()].sort((a, b) => b - a)) { // 개수가 많은 크기부터
    k -= c; // 이 크기를 통째로 담는다
    answer++;
    if (k <= 0) break; // 상자가 찼다
  }
  return answer;
}`,
};
const SORTED_AT = {
  count: lines(SORTED, ['counts = Counter(tangerine)', 'answer = 0'], ['const counts = new Map()', 'for (const size of tangerine)', 'let answer = 0']),
  sort: lines(SORTED, ['for c in sorted(counts.values(), reverse=True)'], ['for (const c of [...counts.values()].sort']),
  next: lines(SORTED, ['for c in sorted(counts.values(), reverse=True)'], ['for (const c of [...counts.values()].sort']),
  take: lines(SORTED, ['k -= c', 'answer += 1'], ['k -= c', 'answer++']),
  check: lines(SORTED, ['if k <= 0', 'break'], ['if (k <= 0)', 'break']),
  done: lines(SORTED, ['return answer'], ['return answer']),
};

const SCAN = {
  python: `def solution(k, tangerine):
    counts = {}
    for size in tangerine:                           # 크기별 개수
        counts[size] = counts.get(size, 0) + 1
    answer = 0
    while k > 0:                                     # 상자가 찰 때까지
        best = max(counts, key=counts.get)           # 남은 크기 중 가장 많은 것을 매번 처음부터 찾는다
        k -= counts.pop(best)                        # 그 크기를 통째로 담는다
        answer += 1
    return answer`,
  javascript: `function solution(k, tangerine) {
  const counts = new Map();
  for (const size of tangerine) counts.set(size, (counts.get(size) ?? 0) + 1); // 크기별 개수
  let answer = 0;
  while (k > 0) { // 상자가 찰 때까지
    let best = -1; // 남은 크기 중 가장 많은 것을 매번 처음부터 찾는다
    for (const [size, c] of counts) if (best < 0 || c > counts.get(best)) best = size;
    k -= counts.get(best); // 그 크기를 통째로 담는다
    counts.delete(best);
    answer++;
  }
  return answer;
}`,
};
const SCAN_AT = {
  count: lines(SCAN, ['counts = {}', 'for size in tangerine', 'answer = 0'], ['const counts = new Map()', 'for (const size of tangerine)', 'let answer = 0']),
  find: lines(SCAN, ['while k > 0', 'best = max(counts, key=counts.get)'], ['while (k > 0)', 'let best = -1', 'for (const [size, c] of counts)']),
  take: lines(SCAN, ['k -= counts.pop(best)', 'answer += 1'], ['k -= counts.get(best)', 'counts.delete(best)', 'answer++']),
  check: lines(SCAN, ['while k > 0'], ['while (k > 0)']),
  done: lines(SCAN, ['while k > 0', 'return answer'], ['while (k > 0)', 'return answer']),
};

const EACH = {
  python: `def solution(k, tangerine):
    counts = []
    for size in dict.fromkeys(tangerine):            # 크기 종류마다 (처음 나온 순서)
        counts.append(tangerine.count(size))         # 매번 귤 전체를 처음부터 끝까지 훑는다
    answer = 0
    for c in sorted(counts, reverse=True):           # 개수가 많은 크기부터
        k -= c
        answer += 1
        if k <= 0:
            break
    return answer`,
  javascript: `function solution(k, tangerine) {
  const counts = [];
  for (const size of new Set(tangerine)) { // 크기 종류마다 (처음 나온 순서)
    counts.push(tangerine.filter((x) => x === size).length); // 매번 귤 전체를 처음부터 끝까지 훑는다
  }
  let answer = 0;
  for (const c of counts.sort((a, b) => b - a)) { // 개수가 많은 크기부터
    k -= c;
    answer++;
    if (k <= 0) break;
  }
  return answer;
}`,
};
const EACH_AT = {
  scan: lines(EACH, ['for size in dict.fromkeys(tangerine)', 'counts.append(tangerine.count(size))'], ['for (const size of new Set(tangerine))', 'counts.push(tangerine.filter']),
  sort: lines(EACH, ['answer = 0', 'for c in sorted(counts, reverse=True)'], ['let answer = 0', 'for (const c of counts.sort']),
  next: lines(EACH, ['for c in sorted(counts, reverse=True)'], ['for (const c of counts.sort']),
  take: lines(EACH, ['k -= c', 'answer += 1'], ['k -= c', 'answer++']),
  check: lines(EACH, ['if k <= 0', 'break'], ['if (k <= 0)', 'break']),
  done: lines(EACH, ['return answer'], ['return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 64px은 줄 이름, 칸은 30px 정사각형에 34px 간격. 위 귤 한 줄은 x 70부터, 묶은 줄은 x 70부터 한 줄에 최대 3칸, 상자는 x 330부터 4칸씩.
// 세로 띠: 귤 줄 0~30, 묶은 줄 52부터 36px 간격(크기 8종류), 상자 칸 80부터 34px 간격(3줄), 표시는 상자 아래 196~224와 262~290.
const CELL = 30;
const PITCH = 34;
const BOX_X = 330;
const BOX_Y = 80;
const SCENE_W = 560;
const SCENE_H = 340;
const inRect = (i: number): Rect => ({ x: 70 + i * PITCH, y: 0, w: CELL, h: CELL });
const rowY = (slot: number) => 52 + slot * 36;
const tableRect = (slot: number, j: number): Rect => ({ x: 70 + j * PITCH, y: rowY(slot), w: CELL, h: CELL });
const labelRect = (slot: number): Rect => ({ x: 0, y: rowY(slot), w: 64, h: CELL });
const slotRect = (n: number): Rect => ({ x: BOX_X + (n % 4) * PITCH, y: BOX_Y + Math.floor(n / 4) * PITCH, w: CELL, h: CELL });
const K_AT: Rect = { x: BOX_X, y: 196, w: 132, h: 28 };
const ANS_AT: Rect = { x: BOX_X, y: 262, w: 132, h: 28 };

const inId = (i: number) => `in:${i}`;
const tId = (i: number) => `t:${i}`;
const rowId = (s: number) => `row:${s}`;
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const paint = (ids: string[], tone: Tone): Action[] => ids.map((id): Action => ({ type: 'set', id, patch: { tone } }));
const kText = (k: number): Action => ({ type: 'set', id: 'tok:k', patch: { text: `남은 k = ${k}`, tone: 'chosen' }, pop: true });
const ansText = (n: number): Action => ({ type: 'set', id: 'tok:ans', patch: { text: `크기 종류 ${n}개`, tone: 'chosen' }, pop: true });

// 세 풀이가 같이 쓰는 장면: 상자 칸(점선), 줄 이름, 귤 한 줄, 표시
function board(): Scene {
  const items: Item[] = Array.from({ length: K }, (_, n): Item => ({ id: `slot:${n}`, kind: 'zone', rect: slotRect(n) }));
  items.push(
    { id: 'lab:in', kind: 'text', rect: { x: 0, y: 0, w: 64, h: CELL }, text: '귤' },
    { id: 'lab:box', kind: 'text', rect: { x: BOX_X, y: BOX_Y - 28, w: 132, h: 22 }, text: `상자 (k = ${K})` },
    { id: 'tok:k', kind: 'token', rect: K_AT, tone: 'plain', text: `남은 k = ${K}` },
    { id: 'tok:ans', kind: 'token', rect: ANS_AT, tone: 'plain', text: '크기 종류 0개' },
  );
  TANGERINE.forEach((s, i) => items.push({ id: inId(i), kind: 'cell', rect: inRect(i), tone: 'plain', text: String(s) }));
  return { width: SCENE_W, height: SCENE_H, items };
}

// 크기 s의 묶은 줄을 slot번 줄에 만든다: 귤이 입력 줄에서 날아와 한 줄로 서고, 줄 이름이 생기며, 입력 줄의 귤은 회색이 된다
const makeRow = (s: number, slot: number): Action[] => together([
  ...groupOf(s).map((i, j): Action => ({ type: 'add', item: { id: tId(i), kind: 'cell', rect: tableRect(slot, j), tone: 'plain', text: String(s) }, from: inId(i) })),
  { type: 'add', item: { id: rowId(s), kind: 'text', rect: labelRect(slot), text: `크기 ${s}` } },
  ...paint(groupOf(s).map(inId), 'explored'),
]);
// 줄들을 order 순서대로 다시 놓는다
const arrange = (order: number[]): Action[] => together(order.flatMap((s, slot): Action[] => [
  { type: 'set', id: rowId(s), patch: { rect: labelRect(slot) } },
  ...groupOf(s).map((i, j): Action => ({ type: 'set', id: tId(i), patch: { rect: tableRect(slot, j) } })),
]));

// 크기 s를 상자에 담는다: 줄의 귤이 상자의 빈 칸으로 미끄러진다(남은 칸보다 많으면 칸만큼만). 이미 담긴 칸 수 filled에서 이어서 채운다
const boxMoves = (s: number, filled: number): { acts: Action[]; ids: string[] } => {
  const moved = groupOf(s).slice(0, K - filled);
  return {
    acts: [
      ...moved.map((i, j): Action => ({ type: 'set', id: tId(i), patch: { rect: slotRect(filled + j), tone: 'chosen' } })),
      { type: 'set', id: rowId(s), patch: { tone: 'muted' } },
    ],
    ids: moved.map(tId),
  };
};

interface Take { size: number; before: number; after: number }
interface Marks { next: Record<Language, number[]>; take: Record<Language, number[]>; check: Record<Language, number[]> }

// 한 크기를 담는 마디(정석과 함정은 정렬한 줄 위에서부터, 대안은 찾은 크기): 담기 → 확인하기. 담은 귤 id를 돌려준다
function load(rec: PacedRecorder, { size: s, before, after }: Take, n: number, filled: number, at: Marks): string[] {
  const c = countOf(s);
  const { acts, ids } = boxMoves(s, filled);
  rec.phase('담기', `크기 ${s} 귤 ${c}개를 통째로 상자에 담습니다. k = ${before} − ${c} = ${josa(after, '이', '가')} 되고, 쓴 크기 종류는 ${n}개입니다.`, at.take);
  rec.do(...clear());
  rec.do(...together([...acts, kText(after), ansText(n)]));
  rec.phase('확인하기', after > 0
    ? `k = ${josa(after, '이', '가')} 0보다 커서 상자가 아직 차지 않았습니다. 다음 크기로 갑니다.`
    : `k = ${josa(after, '이', '가')} 0 이하라 상자가 찼습니다. 반복을 멈춥니다.`, at.check);
  rec.do({ type: 'arrow', from: 'tok:k', to: 'tok:ans', verdict: after > 0 ? 'new' : 'good', label: after > 0 ? `${after} > 0 계속` : `${after} ≤ 0 끝` }, wait(450));
  return ids;
}

// 정렬한 줄에서 위부터 고르는 마디(정석과 함정이 같다)
function choose(rec: PacedRecorder, s: number, n: number, at: Marks) {
  const ids = groupOf(s).map(tId);
  rec.phase('고르기', `${n === 1 ? '개수가 가장 많은' : '다음으로 많은'} 크기 ${s}(${countOf(s)}개)를 고릅니다.`, at.next);
  rec.do(...together([{ type: 'focus', ids }, ...paint(ids, 'current')]), wait(250));
}

// 개수를 센 뒤의 공통 마무리 문구에 쓰는 값
const TOP = Math.max(...SIZES.map(countOf));
const TOP_SIZES = SIZES.filter((s) => countOf(s) === TOP).join(', ');

/* ------------------------------------------------------------------ */
/* 정석 개수 세고 많은 순으로 담기: 세기, 정렬하기, 그리고 크기마다 고르기 → 담기 → 확인하기 */
/* ------------------------------------------------------------------ */

function sortedCounts(): Visualization {
  const rec = new PacedRecorder(board());
  let [k, answer, work] = [K, 0, 0];
  let c = 0;
  let note: string | undefined;
  const boxed: string[] = [];
  const meta = () => ({ work, variables: { k, answer, c: c || '-' }, ...(note ? { workNote: note } : {}) });

  work = N;
  rec.step({ title: `크기별로 세기: ${U}종류`, codeHighlights: SORTED_AT.count, ...meta() });
  rec.phase('세기', `귤 ${N}개를 하나씩 보며 크기별 개수를 셉니다. 크기는 ${U}종류이고, ${josa(TOP_SIZES, '이', '가')} ${TOP}개로 가장 많습니다.`, SORTED_AT.count);
  rec.do(...together(SIZES.flatMap((s, slot) => makeRow(s, slot)), true));

  note = `+ 개수 정렬 약 ${SORT_COST}번`;
  rec.step({ title: '개수가 많은 순으로 정렬', codeHighlights: SORTED_AT.sort, ...meta() });
  rec.phase('정렬하기', '개수가 많은 크기가 위로 오도록 정렬합니다. 개수가 같으면 먼저 나온 크기가 위입니다.', SORTED_AT.sort);
  rec.do(...arrange(BY_COUNT));

  TAKES.forEach((take, idx) => {
    [k, c] = [take.after, countOf(take.size)];
    answer = idx + 1;
    work++;
    rec.step({ title: `크기 ${take.size}(${c}개) 담기 → k = ${k}`, codeHighlights: SORTED_AT.take, ...meta() });
    choose(rec, take.size, answer, SORTED_AT);
    boxed.push(...load(rec, take, answer, K - take.before, SORTED_AT));
  });

  c = 0;
  rec.step({ title: `크기 종류 ${answer}개`, codeHighlights: SORTED_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `크기 ${answer}종류만 써서 귤 ${K}개를 채웠습니다. 개수가 많은 크기부터 담았으니 이보다 적은 종류로는 ${K}개를 채울 수 없습니다.`);
  rec.do(...together([...paint(boxed, 'path'), { type: 'set', id: 'tok:ans', patch: { tone: 'path' }, pop: true }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 최댓값 찾기: 세기, 그리고 크기마다 찾기 → 담기 → 확인하기            */
/* ------------------------------------------------------------------ */

function maxScan(): Visualization {
  const rec = new PacedRecorder(board());
  let [k, answer, work] = [K, 0, 0];
  let best = 0;
  const boxed: string[] = [];
  const left = [...SIZES]; // 아직 안 담은 크기(처음 나온 순서)
  const meta = () => ({ work, variables: { k, answer, best: best || '-' } });

  work = N;
  rec.step({ title: `크기별로 세기: ${U}종류`, codeHighlights: SCAN_AT.count, ...meta() });
  rec.phase('세기', `귤 ${N}개를 하나씩 보며 크기별 개수를 셉니다. 크기는 ${U}종류이고, ${josa(TOP_SIZES, '이', '가')} ${TOP}개로 가장 많습니다.`, SCAN_AT.count);
  rec.do(...together(SIZES.flatMap((s, slot) => makeRow(s, slot)), true));

  TAKES.forEach((take, idx) => {
    const scanned = left.length; // 남은 크기를 모두 훑는다
    const remainIds = left.flatMap((s) => groupOf(s).map(tId));
    const c = countOf(take.size);
    [best, k] = [take.size, take.after];
    answer = idx + 1;
    work += scanned;
    left.splice(left.indexOf(take.size), 1);

    rec.step({ title: `남은 ${scanned}종류에서 가장 많은 크기 ${best}(${c}개) 담기 → k = ${k}`, codeHighlights: SCAN_AT.take, ...meta() });
    rec.phase('찾기', `남은 크기 ${scanned}종류를 처음부터 훑어, 개수가 가장 많은 크기 ${best}(${c}개)를 찾습니다. 같은 개수면 먼저 만난 크기입니다.`, SCAN_AT.find);
    rec.do(...together([{ type: 'focus', ids: remainIds }, ...paint(groupOf(best).map(tId), 'current')]), wait(600));
    boxed.push(...load(rec, take, answer, K - take.before, { next: SCAN_AT.find, take: SCAN_AT.take, check: SCAN_AT.check }));
  });

  best = 0;
  rec.step({ title: `크기 종류 ${answer}개`, codeHighlights: SCAN_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `크기 ${answer}종류로 귤 ${K}개를 채웠습니다. 정석과 같은 답이지만 담을 때마다 남은 크기를 처음부터 훑어 ${work - N}번을 더 확인했습니다. 정렬은 한 번이면 됩니다.`);
  rec.do(...together([...paint(boxed, 'path'), { type: 'set', id: 'tok:ans', patch: { tone: 'path' }, pop: true }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 크기마다 훑기(느림): 훑기 → 묶기, 정렬, 담기, 그리고 정답 확인        */
/* ------------------------------------------------------------------ */

function countEach(): Visualization {
  const rec = new PacedRecorder(board());
  let [k, answer, work] = [K, 0, 0];
  let [size, c] = [0, 0];
  const counts: number[] = [];
  const boxed: string[] = [];
  let note: string | undefined;
  const meta = () => ({
    work,
    variables: { size: size || '-', counts: list(counts), c: c || '-', k, answer },
    ...(note ? { workNote: note } : {}),
  });

  SIZES.forEach((s, slot) => {
    const ids = groupOf(s).map(inId);
    [size, c] = [s, countOf(s)];
    counts.push(c);
    work += N;
    rec.step({ title: `크기 ${s}: 귤 ${N}개를 훑어 ${c}개`, codeHighlights: EACH_AT.scan, ...meta() });
    rec.phase('훑기', `count(${s}): 귤 ${N}개를 처음부터 끝까지 훑어, 크기 ${josa(s, '이', '가')} ${c}개임을 셉니다. 이미 센 귤도 크기마다 다시 봅니다.`, EACH_AT.scan);
    rec.do(...together([{ type: 'focus', ids }, ...paint(ids, 'current')]), wait(550));
    rec.phase('묶기', `크기 ${s} ${c}개를 ${slot + 1}번째 줄에 묶어 둡니다. 지금까지 귤을 ${work}번 확인했습니다.`, EACH_AT.scan);
    rec.do(...clear());
    rec.do(...makeRow(s, slot));
  });

  [size, c] = [0, 0];
  note = `+ 개수 정렬 약 ${SORT_COST}번`;
  rec.step({ title: '개수가 많은 순으로 정렬', codeHighlights: EACH_AT.sort, ...meta() });
  rec.phase('정렬하기', '개수가 많은 크기가 위로 오도록 정렬합니다. 여기부터는 정석과 같습니다.', EACH_AT.sort);
  rec.do(...arrange(BY_COUNT));

  TAKES.forEach((take, idx) => {
    [k, c] = [take.after, countOf(take.size)];
    answer = idx + 1;
    work++;
    rec.step({ title: `크기 ${take.size}(${c}개) 담기 → k = ${k}`, codeHighlights: EACH_AT.take, ...meta() });
    choose(rec, take.size, answer, EACH_AT);
    boxed.push(...load(rec, take, answer, K - take.before, EACH_AT));
  });

  c = 0;
  rec.step({ title: `크기 종류 ${answer}개`, codeHighlights: EACH_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `답은 ${answer}개로 맞지만, 크기마다 귤을 처음부터 훑어 ${U} × ${N} = ${U * N}번을 확인했습니다. 귤과 크기 종류가 10만이면 100억 번이라 시간 초과입니다.`);
  rec.do(...together([...paint(boxed, 'path'), { type: 'set', id: 'tok:ans', patch: { tone: 'path' }, pop: true }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'tangerine',
  title: '귤 고르기',
  level: 2,
  category: 'greedy',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/138476',
  description: {
    summary:
      '귤을 한 상자에 k개 담아 팔려고 합니다. 상자가 보기 좋도록 서로 다른 크기의 종류를 되도록 적게 하고 싶을 때, 귤 k개를 고르면서 만들 수 있는 크기 종류 수의 최솟값을 구합니다.',
    rules: [
      '1 ≤ k ≤ tangerine의 길이 ≤ 100,000',
      '1 ≤ tangerine의 원소(귤 하나의 크기) ≤ 10,000,000',
    ],
    examples: [
      { input: 'k = 6, tangerine = [1, 3, 2, 5, 4, 5, 2, 3]', output: '3' },
      { input: 'k = 4, tangerine = [1, 3, 2, 5, 4, 5, 2, 3]', output: '2' },
      { input: 'k = 2, tangerine = [1, 1, 1, 1, 2, 2, 2, 3]', output: '1' },
    ],
  },
  keyIntuitions: [
    '상자에 담을 귤 수는 k개로 정해져 있으니, 크기 종류를 줄이려면 한 종류에서 되도록 많이 담아야 합니다.',
    '크기별 개수를 세고, 개수가 많은 크기부터 통째로 담으며 k를 줄입니다. k가 0 이하가 될 때까지 쓴 크기 종류 수가 답입니다.',
    '크기마다 귤 전체를 다시 훑으면 (귤 수 × 크기 종류 수)번이라 시간 초과입니다. 개수는 귤을 한 번만 훑어도 모두 셀 수 있습니다.',
  ],
  demo: { input: [K, TANGERINE], label: 'k = 11, tangerine = [7, 3, 8, 5, 1, 7, 6, 8, 2, 5, 8, 7, 4, 6]' },
  workUnit: '귤이나 크기를 하나 살펴본 횟수',
  approaches: [
    {
      id: 'tangerine-sorted-counts',
      name: '크기별 개수를 세고 많은 순으로 담기',
      rank: 'BEST',
      timeComplexity: 'O(N + U log U) (U = 크기 종류 수)',
      spaceComplexity: 'O(U)',
      verdict: '크기별 개수를 한 번에 세고, 개수가 많은 크기부터 통째로 담아 k를 채우는 풀이입니다.',
      pros: [
        '귤을 한 번만 훑어 개수를 세고, 정렬은 크기 종류 수만큼만 하므로 10만 개도 순식간입니다.',
        '"많은 크기부터 담는다"는 그리디가 그대로 코드가 됩니다.',
        'Counter나 Map만 알면 짧게 쓸 수 있습니다.',
      ],
      cons: [
        'k가 0 이하가 되는 순간 멈추는 break를 빼먹으면 크기 종류 수를 잘못 셉니다.',
        '개수를 세고 정렬하는 두 단계를 거칩니다.',
      ],
      whyThisRank:
        '같은 k개를 채울 때 한 종류에서 더 많이 담을수록 종류 수가 줄어듭니다. 그래서 개수가 가장 많은 크기부터 담으면 어떤 다른 선택보다도 종류 수가 늘지 않습니다.',
      code: SORTED,
      visualize: sortedCounts,
    },
    {
      id: 'tangerine-max-scan',
      name: '남은 크기에서 가장 많은 것을 매번 찾기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N + m × U) (m = 담은 크기 수)',
      spaceComplexity: 'O(U)',
      verdict: '정렬하지 않고, 상자가 찰 때까지 남은 크기 중 개수가 가장 많은 것을 매번 처음부터 찾아 담는 풀이입니다.',
      pros: [
        '정렬 없이 최댓값 찾기만 알면 됩니다.',
        '크기 종류가 적으면 정석과 비슷하게 빠릅니다.',
      ],
      cons: [
        '담을 때마다 남은 크기를 모두 훑어, 크기 종류가 U개고 대부분 담아야 하면 O(U²)입니다.',
        '크기 종류가 10만이면 최대 약 50억 번을 확인해 시간 초과가 날 수 있습니다.',
      ],
      whyThisRank:
        '정렬 한 번이면 끝날 일을 담을 때마다 처음부터 최댓값을 다시 찾습니다. 같은 생각이지만 확인하는 횟수가 크기 종류 수의 제곱으로 늘어납니다.',
      code: SCAN,
      visualize: maxScan,
    },
    {
      id: 'tangerine-count-each',
      name: '크기마다 귤 전체를 훑어 개수 세기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(N × U)',
      spaceComplexity: 'O(U)',
      verdict: '크기 종류마다 귤 전체를 처음부터 끝까지 훑어 개수를 세는 풀이로, 답은 맞지만 귤이 많으면 시간 초과입니다.',
      pros: ['count를 부르기만 하면 되어 코드가 가장 짧습니다.', '귤이 적을 때는 답이 맞습니다.'],
      cons: [
        '크기 종류마다 귤 전체를 다시 훑습니다. 귤과 크기 종류가 모두 10만이면 약 100억 번입니다.',
        '정렬과 담기는 정석과 같은데, 개수를 세는 한 줄이 전체 시간을 정합니다.',
      ],
      whyThisRank:
        '개수는 귤을 한 번만 훑으면 모두 셀 수 있습니다. 크기마다 처음부터 다시 세는 순간, 이미 본 귤을 크기 종류 수만큼 반복해서 보게 됩니다.',
      code: EACH,
      visualize: countEach,
    },
  ],
  checks: {
    cases: [
      { args: [6, [1, 3, 2, 5, 4, 5, 2, 3]], expected: 3 },
      { args: [4, [1, 3, 2, 5, 4, 5, 2, 3]], expected: 2 },
      { args: [2, [1, 1, 1, 1, 2, 2, 2, 3]], expected: 1 },
      { args: [1, [5]], expected: 1 },
      { args: [3, [3, 3, 3]], expected: 1 },
      { args: [4, [1, 1, 2, 3]], expected: 3 },
      { args: [2, [1, 2, 3, 4]], expected: 2 },
      { args: [5, [1, 1, 1, 2, 2, 3]], expected: 2 },
      { args: [K, TANGERINE], expected: 5 },
    ],
    // 귤 1~14개, 크기 1~6, k는 1 ~ 귤 수
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 14);
      return [1 + Math.floor(rand() * n), Array.from({ length: n }, () => 1 + Math.floor(rand() * 6))];
    },
  },
};

export default problem;
