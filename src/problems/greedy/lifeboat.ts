// 구명보트: 정석 정렬 + 양 끝 짝짓기, 대안 무거운 사람부터 짝 찾기, 함정 가벼운 사람끼리 짝짓기를 같은 장면에서 움직인다.
// 장면은 위에 사람 칸(무게순으로 미끄러져 정렬됨), 가운데에 포인터 두 줄, 아래에 보트 줄과 무게 제한·결과 표시다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { grid } from '../../engine/layout.ts';
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { josa, lines, ro, together } from '../shared.ts';
import { PacedRecorder } from './paced.ts';

// 시각화 입력. 정석은 6척, 이웃끼리 짝지으면 8척이 든다.
const PEOPLE = [60, 40, 90, 50, 60, 40, 80, 50, 60, 40];
const LIMIT = 100;
const N = PEOPLE.length;
// 정렬한 순서(같은 몸무게는 입력 순서대로): ORDER[s]는 s번째로 가벼운 사람의 입력 번호
const ORDER = PEOPLE.map((_, k) => k).sort((a, b) => PEOPLE[a] - PEOPLE[b] || a - b);
const SORTED = ORDER.map((k) => PEOPLE[k]);
const list = (xs: number[]) => `[${xs.join(', ')}]`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TWO_ENDS = {
  python: `def solution(people, limit):
    people.sort()                    # 가벼운 순서로 정렬
    i, j = 0, len(people) - 1        # i: 가장 가벼운 사람, j: 가장 무거운 사람
    boats = 0
    while i <= j:
        if people[i] + people[j] <= limit:
            i += 1                   # 가장 가벼운 사람이 함께 탄다
        j -= 1                       # 가장 무거운 사람은 늘 탄다
        boats += 1
    return boats`,
  javascript: `function solution(people, limit) {
  people.sort((a, b) => a - b); // 가벼운 순서로 정렬
  let i = 0; // 가장 가벼운 사람
  let j = people.length - 1; // 가장 무거운 사람
  let boats = 0;
  while (i <= j) {
    if (people[i] + people[j] <= limit) i++; // 가장 가벼운 사람이 함께 탄다
    j--; // 가장 무거운 사람은 늘 탄다
    boats++;
  }
  return boats;
}`,
};
const TWO_AT = {
  sort: lines(TWO_ENDS, ['people.sort()'], ['people.sort((a, b)']),
  init: lines(TWO_ENDS, ['i, j = 0, len(people) - 1', 'boats = 0'], ['let i = 0', 'let j = people.length - 1', 'let boats = 0']),
  look: lines(TWO_ENDS, ['while i <= j', 'if people[i] + people[j] <= limit'], ['while (i <= j)', 'if (people[i] + people[j] <= limit)']),
  pair: lines(TWO_ENDS, ['i += 1', 'j -= 1', 'boats += 1'], ['i++', 'j--', 'boats++']),
  solo: lines(TWO_ENDS, ['j -= 1', 'boats += 1'], ['j--', 'boats++']),
  done: lines(TWO_ENDS, ['while i <= j', 'return boats'], ['while (i <= j)', 'return boats']),
};

const HEAVY_FIRST = {
  python: `def solution(people, limit):
    people.sort()
    boats = 0
    while people:
        heavy = people.pop()                       # 가장 무거운 사람부터 태운다
        # 남은 사람 중 같이 탈 수 있는 가장 무거운 사람을 뒤에서부터 찾는다
        for i in range(len(people) - 1, -1, -1):
            if people[i] + heavy <= limit:
                people.pop(i)
                break
        boats += 1
    return boats`,
  javascript: `function solution(people, limit) {
  people.sort((a, b) => a - b);
  let boats = 0;
  while (people.length > 0) {
    const heavy = people.pop(); // 가장 무거운 사람부터 태웁니다
    // 남은 사람 중 같이 탈 수 있는 가장 무거운 사람을 뒤에서부터 찾습니다
    for (let i = people.length - 1; i >= 0; i--) {
      if (people[i] + heavy <= limit) {
        people.splice(i, 1);
        break;
      }
    }
    boats++;
  }
  return boats;
}`,
};
const HEAVY_AT = {
  sort: lines(HEAVY_FIRST, ['people.sort()'], ['people.sort((a, b)']),
  init: lines(HEAVY_FIRST, ['boats = 0'], ['let boats = 0']),
  take: lines(HEAVY_FIRST, ['while people', 'heavy = people.pop()'], ['while (people.length > 0)', 'const heavy = people.pop()']),
  scan: lines(HEAVY_FIRST, ['for i in range(len(people) - 1', 'if people[i] + heavy <= limit'], ['for (let i = people.length - 1', 'if (people[i] + heavy <= limit)']),
  pair: lines(HEAVY_FIRST, ['people.pop(i)', 'break', 'boats += 1'], ['people.splice(i, 1)', 'break', 'boats++']),
  solo: lines(HEAVY_FIRST, ['boats += 1'], ['boats++']),
  done: lines(HEAVY_FIRST, ['while people', 'return boats'], ['while (people.length > 0)', 'return boats']),
};

const NEIGHBOR = {
  python: `def solution(people, limit):
    people.sort()
    boats = 0
    i = 0
    while i < len(people):
        # 가장 가벼운 사람 둘을 같이 태울 수 있으면 태운다
        if i + 1 < len(people) and people[i] + people[i + 1] <= limit:
            i += 2
        else:
            i += 1
        boats += 1
    return boats  # [40, 40, 100, 100], 제한 140이면 3척 (정답은 2척)`,
  javascript: `function solution(people, limit) {
  people.sort((a, b) => a - b);
  let boats = 0;
  let i = 0;
  while (i < people.length) {
    // 가장 가벼운 사람 둘을 같이 태울 수 있으면 태웁니다
    if (i + 1 < people.length && people[i] + people[i + 1] <= limit) {
      i += 2;
    } else {
      i += 1;
    }
    boats++;
  }
  return boats; // [40, 40, 100, 100], 제한 140이면 3척 (정답은 2척)
}`,
};
const NEIGHBOR_AT = {
  sort: lines(NEIGHBOR, ['people.sort()'], ['people.sort((a, b)']),
  init: lines(NEIGHBOR, ['boats = 0', 'i = 0'], ['let boats = 0', 'let i = 0']),
  look: lines(NEIGHBOR, ['while i < len(people)', 'if i + 1 < len(people) and people[i] + people[i + 1] <= limit'], ['while (i < people.length)', 'if (i + 1 < people.length && people[i] + people[i + 1] <= limit)']),
  pair: lines(NEIGHBOR, ['i += 2', 'boats += 1'], ['i += 2', 'boats++']),
  solo: lines(NEIGHBOR, ['else:', 'i += 1', 'boats += 1'], ['} else {', 'i += 1', 'boats++']),
  done: lines(NEIGHBOR, ['while i < len(people)', 'return boats'], ['while (i < people.length)', 'return boats']),
};

// 줄 번호 묶음을 합친다(중복 없이, 줄 번호 순)
const merge = (...parts: Record<Language, number[]>[]): Record<Language, number[]> => ({
  python: [...new Set(parts.flatMap((p) => p.python))].sort((a, b) => a - b),
  javascript: [...new Set(parts.flatMap((p) => p.javascript))].sort((a, b) => a - b),
});

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 58px은 줄 이름, 사람 칸은 x 64부터 50px씩 4px 간격(10칸). 세로 띠: 사람 칸 34~84(판정 표시가 칸 위 11px에 붙는다),
// 포인터 두 줄 92~114 · 120~142, 보트 줄 154~192(보트 8척), 표시 줄 206~238.
const cellAt = grid({ x: 64, y: 34, rows: 1, cols: N, cell: 50, gap: 4 });
const W = 608;
const H = 246;
const LANE: LaneOptions = { id: 'boat', x: 64, y: 156, slotW: 58, slotH: 36, gap: 6, max: 8 };
const personId = (k: number) => `p:${k}`;
const sid = (s: number) => personId(ORDER[s]); // 정렬한 s번째 사람 칸
const ptrRect = (row: 0 | 1, s: number): Rect => ({ x: cellAt(0, s).x + 7, y: row ? 120 : 92, w: 36, h: 22 });
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const paint = (s: number, tone: Tone): Action => ({ type: 'set', id: sid(s), patch: { tone } });
const RESULT: Rect[] = [{ x: 64, y: 208, w: 150, h: 32 }, { x: 222, y: 208, w: 150, h: 32 }, { x: 380, y: 208, w: 150, h: 32 }];

// 세 풀이가 같이 쓰는 장면: 사람 칸 열 개(입력 순서), 보트 줄 바탕, 무게 제한 표시, 포인터 줄 이름(있으면)
function board(rows: [string, string?]): Scene {
  const items: Item[] = [
    { id: 'lab:people', kind: 'text', rect: { x: 0, y: 34, w: 58, h: 50 }, text: '몸무게' },
    { id: 'lab:boat', kind: 'text', rect: { x: 0, y: 156, w: 58, h: 36 }, text: '보트' },
    { id: 'boat:bg', kind: 'zone', rect: { x: 60, y: 152, w: LANE.max * 64 - 6 + 8, h: 44 } },
    { id: 'tok:limit', kind: 'token', rect: RESULT[0], tone: 'plain', text: `무게 제한 ${LIMIT}` },
  ];
  rows.forEach((name, row) => name && items.push({ id: `lab:ptr${row}`, kind: 'text', rect: { x: 0, y: row ? 120 : 92, w: 58, h: 22 }, tone: 'muted', text: name }));
  PEOPLE.forEach((w, k) => items.push({ id: personId(k), kind: 'cell', rect: cellAt(0, k), tone: 'plain', text: String(w) }));
  return { width: W, height: H, items };
}

// 표시: 처음이면 그 자리에 나타나고, 그 뒤로는 글만 바뀌며 톡 튄다
const mark = (rec: PacedRecorder, id: string, slot: 0 | 1 | 2, text: string, tone: Tone): Action =>
  rec.has(id) ? { type: 'set', id, patch: { text, tone }, pop: true } : { type: 'add', item: { id, kind: 'token', rect: RESULT[slot], tone, text } };
// 포인터: 처음이면 그 자리에 나타나고, 그 뒤로는 미끄러져 옮겨 간다(끝을 넘으면 맨 끝 칸에 붙인다)
const pointerTo = (rec: PacedRecorder, id: 'i' | 'j', s: number): Action => {
  const rect = ptrRect(id === 'i' ? 0 : 1, Math.min(Math.max(s, 0), N - 1));
  return rec.has(`ptr:${id}`) ? { type: 'set', id: `ptr:${id}`, patch: { rect } } : { type: 'add', item: { id: `ptr:${id}`, kind: 'token', rect, tone: 'chosen', text: id } };
};
const weights = (ws: number[]) => ws.join('+');

// 첫 단계(세 풀이가 같다): 사람 칸이 가벼운 순서로 미끄러져 자리를 바꾼다
function sortStep(rec: PacedRecorder, codeHighlights: Record<Language, number[]>, meta: { work: number; variables: Record<string, string | number> }) {
  rec.step({ title: `몸무게순으로 정렬: ${list(SORTED)}`, codeHighlights, ...meta });
  rec.phase('정렬하기', '가벼운 사람이 왼쪽에 오도록 몸무게순으로 정렬합니다.');
  rec.do(...together(ORDER.map((k, s): Action => ({ type: 'set', id: personId(k), patch: { rect: cellAt(0, s) } }))));
}

/* ------------------------------------------------------------------ */
/* 정석 양 끝 짝짓기: 비교하기 → 태우기 (보트 한 척이 한 단계)               */
/* ------------------------------------------------------------------ */

function twoEnds(): Visualization {
  const rec = new PacedRecorder(board(['가벼운 쪽', '무거운 쪽']));
  const lane = new Lane(rec, LANE);
  let [i, j, boats, comps] = [0, N - 1, 0, 0];
  let started = false;
  const meta = () => ({ work: comps, variables: { i: started ? i : '-', j: started ? j : '-', boats } });

  sortStep(rec, TWO_AT.sort, meta());

  started = true;
  rec.step({ title: `양 끝에 포인터 놓기: i = 0, j = ${N - 1}`, codeHighlights: TWO_AT.init, ...meta() });
  rec.phase('시작', `가장 가벼운 사람(i = 0)과 가장 무거운 사람(j = ${N - 1})에서 시작합니다. 보트는 0척입니다.`);
  rec.do(...together([pointerTo(rec, 'i', 0), pointerTo(rec, 'j', N - 1)]));

  while (i <= j) {
    const [light, heavy] = [SORTED[i], SORTED[j]];
    const sum = light + heavy;
    const fits = sum <= LIMIT && i !== j;
    const [wasI, wasJ] = [i, j];
    if (fits) i++;
    j--;
    boats++;
    comps++;
    const names = fits ? weights([light, heavy]) : String(heavy);

    rec.step({ title: `${boats}번째 보트: ${fits ? `${josa(light, '과', '와')} ${heavy}` : `${heavy} 혼자`}`, codeHighlights: fits ? TWO_AT.pair : TWO_AT.solo, ...meta() });
    rec.phase('비교하기', `가장 가벼운 ${josa(light, '과', '와')} 가장 무거운 ${heavy}의 합은 ${sum}입니다. 무게 제한 ${LIMIT}${fits ? ' 이하라 함께 탈 수 있습니다.' : `을 넘어서 ${josa(heavy, '은', '는')} 혼자 탑니다.`}`, TWO_AT.look);
    rec.do({ type: 'focus', ids: [sid(wasI), sid(wasJ)] });
    rec.do({ type: 'arrow', from: sid(wasJ), to: sid(wasI), verdict: fits ? 'good' : 'bad', label: `${light} + ${heavy} = ${sum} ${fits ? '≤' : '>'} ${LIMIT}` }, wait(100));

    rec.phase('태우기', fits
      ? `${josa(light, '과', '와')} ${josa(heavy, '을', '를')} 보트 한 척에 태웁니다. 보트는 ${boats}척입니다.`
      : `${josa(heavy, '만', '만')} 보트에 태웁니다. ${josa(light, '은', '는')} 다음 차례를 기다립니다. 보트는 ${boats}척입니다.`, fits ? TWO_AT.pair : TWO_AT.solo);
    rec.do(...clear());
    lane.push({ id: `b:${boats}`, text: names, tone: 'chosen' }, sid(wasJ));
    rec.do(...together([
      paint(wasJ, 'visited'),
      ...(fits ? [paint(wasI, 'visited')] : []),
      pointerTo(rec, 'j', j),
      ...(fits ? [pointerTo(rec, 'i', i)] : []),
    ], true));
  }

  rec.step({ title: `i > j: 모두 태워 보트 ${boats}척`, codeHighlights: TWO_AT.done, ...meta(), answer: boats, isKeyframe: true });
  rec.phase('정답', `i = ${josa(i, '이', '가')} j = ${j}보다 커져 모두 태웠습니다. 보트는 ${boats}척입니다. 가장 무거운 사람이 가장 가벼운 사람과도 못 타면 누구와도 못 타므로, 이 짝짓기가 가장 알뜰합니다.`);
  rec.do(...together(lane.ids.map((id): Action => ({ type: 'set', id, patch: { tone: 'path' } }))));
  rec.do(mark(rec, 'tok:ans', 1, `보트 ${boats}척`, 'path'));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 무거운 사람부터 짝 찾기: 짝 찾기 → 태우기                          */
/* ------------------------------------------------------------------ */

function heavyFirst(): Visualization {
  const rec = new PacedRecorder(board(['']));
  const lane = new Lane(rec, LANE);
  const left = [...Array(N).keys()]; // 아직 안 탄 사람(정렬한 번호, 가벼운 순)
  let [boats, comps] = [0, 0];
  let heavy = 0;
  const meta = () => ({ work: comps, variables: { heavy: heavy || '-', boats, people: list(left.map((s) => SORTED[s])) } });

  sortStep(rec, HEAVY_AT.sort, meta());

  while (left.length) {
    const h = left.pop()!; // 가장 무거운 사람
    const scanned: number[] = []; // 비교한 사람(뒤에서부터)
    let partner: number | undefined;
    for (let n = left.length - 1; n >= 0; n--) {
      scanned.push(left[n]);
      comps++;
      if (SORTED[left[n]] + SORTED[h] <= LIMIT) {
        partner = left[n];
        left.splice(n, 1);
        break;
      }
    }
    heavy = SORTED[h];
    boats++;
    const mate = partner === undefined ? undefined : SORTED[partner];
    const last = scanned.at(-1)!; // 마지막으로 비교한 사람(짝이거나, 짝이 없을 때 가장 가벼운 사람)
    const lastSum = SORTED[last] + heavy;
    const names = mate === undefined ? String(heavy) : weights([mate, heavy]);

    rec.step({ title: `${boats}번째 보트: ${mate === undefined ? `${heavy} 혼자` : `${josa(heavy, '과', '와')} ${mate}`}`, codeHighlights: mate === undefined ? HEAVY_AT.solo : HEAVY_AT.pair, ...meta() });
    rec.phase('짝 찾기', scanned.length
      ? `가장 무거운 ${josa(heavy, '을', '를')} 꺼내고, 남은 사람을 무거운 쪽부터 ${scanned.length}명 비교합니다. ${mate === undefined ? `가장 가벼운 ${josa(SORTED[last], '과', '와')} 합해도 ${ro(lastSum)}, 제한 ${LIMIT}을 넘어 짝이 없습니다.` : `${josa(SORTED[last], '과', '와')} 합하면 ${ro(lastSum)}, 제한 ${LIMIT} 이하라 짝이 됩니다.`}`
      : `가장 무거운 ${josa(heavy, '을', '를')} 꺼냈지만 남은 사람이 없어 혼자 탑니다.`, merge(HEAVY_AT.take, HEAVY_AT.scan));
    rec.do(...together([{ type: 'focus', ids: [sid(h), ...scanned.map(sid)] }, paint(h, 'current')]));
    if (scanned.length) {
      rec.do({ type: 'arrow', from: sid(h), to: sid(last), verdict: mate === undefined ? 'bad' : 'good', label: `${SORTED[last]} + ${heavy} = ${lastSum} ${mate === undefined ? '>' : '≤'} ${LIMIT}` }, wait(100));
    }

    rec.phase('태우기', mate === undefined
      ? `${heavy}만 보트에 태웁니다. 보트는 ${boats}척입니다.`
      : `${josa(heavy, '과', '와')} ${josa(mate, '을', '를')} 보트 한 척에 태웁니다. 보트는 ${boats}척입니다.`, mate === undefined ? HEAVY_AT.solo : HEAVY_AT.pair);
    rec.do(...clear());
    lane.push({ id: `b:${boats}`, text: names, tone: 'chosen' }, sid(h));
    rec.do(...together([paint(h, 'visited'), ...(partner === undefined ? [] : [paint(partner, 'visited')])], true));
  }

  heavy = 0;
  rec.step({ title: `남은 사람이 없어 보트 ${boats}척`, codeHighlights: HEAVY_AT.done, ...meta(), answer: boats, isKeyframe: true });
  rec.phase('정답', `남은 사람이 없어 보트는 ${boats}척입니다. 정석과 같은 답이지만, 짝을 찾으려고 남은 사람을 ${comps}번 비교했습니다. 정석은 ${boats}번이면 됩니다.`);
  rec.do(...together(lane.ids.map((id): Action => ({ type: 'set', id, patch: { tone: 'path' } }))));
  rec.do(mark(rec, 'tok:ans', 1, `보트 ${boats}척`, 'path'));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 가벼운 사람끼리: 비교하기 → 태우기, 오답 확인                       */
/* ------------------------------------------------------------------ */

function neighbors(): Visualization {
  const rec = new PacedRecorder(board(['가벼운 쪽']));
  const lane = new Lane(rec, LANE);
  let [i, boats, comps] = [0, 0, 0];
  let started = false;
  const meta = () => ({ work: comps, variables: { i: started ? i : '-', boats } });

  sortStep(rec, NEIGHBOR_AT.sort, meta());

  started = true;
  rec.step({ title: '가장 가벼운 사람에서 시작: i = 0', codeHighlights: NEIGHBOR_AT.init, ...meta() });
  rec.phase('시작', '가장 가벼운 사람(i = 0)부터, 이웃한 두 사람을 짝지어 봅니다. 가벼운 사람끼리 타면 한 척에 두 명이 타서 알뜰해 보입니다.');
  rec.do(pointerTo(rec, 'i', 0));

  while (i < N) {
    const light = SORTED[i];
    const next = i + 1 < N ? SORTED[i + 1] : undefined;
    const fits = next !== undefined && light + next <= LIMIT;
    const was = i;
    if (next !== undefined) comps++;
    i += fits ? 2 : 1;
    boats++;
    const names = fits ? weights([light, next]) : String(light);

    rec.step({ title: `${boats}번째 보트: ${fits ? `${josa(light, '과', '와')} ${next}` : `${light} 혼자`}`, codeHighlights: fits ? NEIGHBOR_AT.pair : NEIGHBOR_AT.solo, ...meta() });
    if (next === undefined) {
      rec.phase('비교하기', `마지막 한 명이 남았습니다. 짝지을 이웃이 없어 ${josa(light, '은', '는')} 혼자 탑니다.`, NEIGHBOR_AT.look);
      rec.do(...together([{ type: 'focus', ids: [sid(was)] }, paint(was, 'current')]), wait(300));
    } else {
      rec.phase('비교하기', `가장 가벼운 ${josa(light, '과', '와')} 바로 다음 ${next}의 합은 ${light + next}입니다. 무게 제한 ${LIMIT}${fits ? ' 이하라 함께 탑니다.' : `을 넘어서 ${josa(light, '은', '는')} 혼자 탑니다.`}`, NEIGHBOR_AT.look);
      rec.do({ type: 'focus', ids: [sid(was), sid(was + 1)] });
      rec.do({ type: 'arrow', from: sid(was + 1), to: sid(was), verdict: fits ? 'good' : 'bad', label: `${light} + ${next} = ${light + next} ${fits ? '≤' : '>'} ${LIMIT}` }, wait(100));
    }

    rec.phase('태우기', fits
      ? `${josa(light, '과', '와')} ${josa(next, '을', '를')} 보트 한 척에 태웁니다. 보트는 ${boats}척입니다.`
      : `${josa(light, '만', '만')} 보트에 태웁니다. 보트는 ${boats}척입니다.`, fits ? NEIGHBOR_AT.pair : NEIGHBOR_AT.solo);
    rec.do(...clear());
    lane.push({ id: `b:${boats}`, text: names, tone: 'chosen' }, sid(was));
    rec.do(...together([paint(was, 'visited'), ...(fits ? [paint(was + 1, 'visited')] : []), pointerTo(rec, 'i', i)], true));
  }

  const truth = 6;
  rec.step({ title: `이 방법 ${boats}척, 정답은 ${truth}척`, codeHighlights: NEIGHBOR_AT.done, ...meta(), answer: boats, isKeyframe: true });
  rec.phase('오답 확인', `이 방법은 ${boats}척이지만 정답은 ${truth}척입니다. 가벼운 사람끼리 타 버려서, 무거운 사람들이 같이 탈 가벼운 사람이 남지 않아 모두 혼자 탔습니다.`);
  rec.do(...together(lane.ids.map((id): Action => ({ type: 'set', id, patch: { tone: 'bad' } }))));
  rec.do(mark(rec, 'tok:ans', 1, `이 방법 ${boats}척`, 'bad'));
  rec.do(mark(rec, 'tok:truth', 2, `정답 ${truth}척`, 'good'));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'lifeboat',
  title: '구명보트',
  level: 2,
  category: 'greedy',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42885',
  description: {
    summary:
      '섬에 갇힌 사람들을 구명보트로 구출합니다. 보트 한 척에는 한 번에 최대 2명까지 탈 수 있고, 탄 사람들의 몸무게 합이 보트의 무게 제한을 넘으면 안 됩니다. 모든 사람을 구출하는 데 필요한 보트의 최소 수를 구합니다.',
    rules: [
      '사람은 1명 이상 50,000명 이하',
      '몸무게는 40kg 이상 240kg 이하',
      '무게 제한은 40kg 이상 240kg 이하이고, 늘 사람들 몸무게의 최댓값보다 큼(구출하지 못하는 사람은 없음)',
      '보트 한 척에는 최대 2명, 두 사람의 몸무게 합이 무게 제한 이하여야 함',
    ],
    examples: [
      { input: 'people = [70, 50, 80, 50], limit = 100', output: '3' },
      { input: 'people = [70, 80, 50], limit = 100', output: '3' },
    ],
  },
  keyIntuitions: [
    '보트에는 최대 2명만 타므로, 가장 무거운 사람의 짝만 정하면 됩니다. 가장 무거운 사람이 가장 가벼운 사람과도 못 타면 누구와도 못 탑니다.',
    '무게순으로 정렬한 뒤 가장 무거운 사람과 가장 가벼운 사람을 짝지어 봅니다. 합이 제한 이하이면 둘을 함께, 아니면 무거운 사람만 먼저 태웁니다.',
    '양 끝에서 안쪽으로 포인터 두 개를 움직이면 한 번 훑는 것으로 끝납니다. 가벼운 사람끼리 짝지으면 무거운 사람들이 짝을 잃어 보트가 더 필요합니다.',
  ],
  demo: { input: [PEOPLE, LIMIT], label: 'people = [60, 40, 90, 50, 60, 40, 80, 50, 60, 40], limit = 100' },
  workUnit: '몸무게 합을 비교한 횟수',
  approaches: [
    {
      id: 'lifeboat-two-ends',
      name: '정렬 + 양 끝 짝짓기 (투 포인터)',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '무게순으로 정렬한 뒤 가장 가벼운 사람과 가장 무거운 사람을 짝지어 한 번 훑는 풀이입니다.',
      pros: [
        '정렬한 뒤에는 포인터 두 개로 한 번만 훑으므로 O(N)입니다.',
        '가장 무거운 사람은 늘 보트를 타므로 매번 보트 한 척이 확정됩니다.',
        '정렬 말고는 따로 자료구조가 필요 없습니다.',
      ],
      cons: ['i ≤ j 조건과 한 명만 남는 경우(i = j)를 놓치기 쉽습니다.'],
      whyThisRank:
        '가장 무거운 사람이 가장 가벼운 사람과도 탈 수 없다면 누구와도 탈 수 없습니다. 그래서 무거운 사람의 짝으로는 가장 가벼운 사람을 시도하는 것이 안전한 선택입니다.',
      code: TWO_ENDS,
      visualize: twoEnds,
    },
    {
      id: 'lifeboat-heavy-first',
      name: '무거운 사람부터 짝 찾기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(1)',
      verdict: '가장 무거운 사람부터 같이 탈 수 있는 가장 무거운 사람을 찾아 태우는, 맞지만 짝을 찾느라 남은 사람을 다시 훑는 풀이입니다.',
      pros: ['보트를 최대한 꽉 채운다는 생각이 직관적입니다.', '정석과 같은 답을 냅니다.'],
      cons: [
        '짝을 찾을 때마다 남은 사람을 훑고, 목록 중간을 지우는 pop(i)도 O(N)이라 N = 50,000이면 효율성 테스트에서 시간 초과가 날 수 있습니다.',
        '짝이 없는 무거운 사람이 많으면 매번 끝까지 훑습니다.',
      ],
      whyThisRank:
        '양 끝만 보면 되는 문제인데, 짝을 찾는 탐색과 목록 중간 삭제가 더해져 일이 늘어납니다. 정렬된 목록에서는 가장 가벼운 사람 하나만 확인해도 짝이 있는지 알 수 있습니다.',
      code: HEAVY_FIRST,
      visualize: heavyFirst,
    },
    {
      id: 'lifeboat-neighbors',
      name: '가벼운 사람끼리 짝짓기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '정렬한 뒤 이웃한 두 사람을 짝지어 보는 풀이로, 무거운 사람들이 짝을 잃어 보트가 더 필요합니다.',
      pros: ['코드가 짧고, 공식 예제 두 개는 우연히 통과합니다.'],
      cons: [
        '가벼운 사람끼리 타 버리면 무거운 사람이 같이 탈 가벼운 사람이 남지 않습니다.',
        'people = [40, 40, 100, 100], limit = 140이면 정답은 2척인데 3척이 나옵니다.',
      ],
      whyThisRank:
        '무거운 사람이 가장 짝을 찾기 어려우므로, 가벼운 사람은 무거운 사람을 위해 남겨 둬야 합니다. 이웃끼리 묶으면 가벼운 사람을 가장 비효율적으로 쓰게 됩니다.',
      code: NEIGHBOR,
      visualize: neighbors,
    },
  ],
  checks: {
    cases: [
      { args: [[70, 50, 80, 50], 100], expected: 3 },
      { args: [[70, 80, 50], 100], expected: 3 },
      { args: [[40], 50], expected: 1 },
      { args: [[40, 40], 100], expected: 1 },
      { args: [[60, 60, 60], 100], expected: 3 },
      { args: [[40, 40, 100, 100], 140], expected: 2 },
      { args: [PEOPLE, LIMIT], expected: 6 },
    ],
    // 1~8명, 무게 제한 41~140, 몸무게는 40 이상 제한 미만(늘 구출할 수 있음)
    random: (rand) => {
      const limit = 41 + Math.floor(rand() * 100);
      const people = Array.from({ length: 1 + Math.floor(rand() * 8) }, () => 40 + Math.floor(rand() * (limit - 40)));
      return [people, limit];
    },
  },
};

export default problem;
