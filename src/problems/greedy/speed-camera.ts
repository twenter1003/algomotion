// 단속카메라: 정석 끝점 정렬, 대안 시작점 정렬 + 카메라 위치 줄이기, 함정 시작점 정렬 + 첫 차의 끝에 설치를 같은 장면에서 움직인다.
// 장면은 위에 지점 눈금(수직선), 가운데에 차량 경로 줄(정렬하면 줄이 미끄러져 자리를 바꿈), 아래에 카메라 이름표 줄과 개수 표시다.
// 한 지점은 폭 U짜리 칸이고, 경로 [s, e]는 s칸부터 e칸까지 덮는다(양 끝 칸도 포함). 카메라는 칸 한가운데에 세운다.
import { axis } from '../../engine/layout.ts';
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { josa, lines, ro, together } from '../shared.ts';
import { PacedRecorder } from './paced.ts';

// 시각화 입력. 정석은 4대, 시작점 순으로 첫 차의 끝에만 놓으면 2대(오답)가 나온다.
const ROUTES: [number, number][] = [[-5, 2], [-9, 5], [1, 4], [-7, -4], [3, 8], [-2, 0], [6, 9]];
const N = ROUTES.length;
const MIN = Math.min(...ROUTES.map(([s]) => s));
const MAX = Math.max(...ROUTES.map(([, e]) => e));
const list = (xs: number[]) => `[${xs.join(', ')}]`;
const show = (v: number) => (v === -Infinity ? '-∞' : v);
// 정렬한 순서: 값이 같으면 다른 쪽 값으로 가른다. ORDER[t]는 t번째 차의 입력 번호
const BY_END = ROUTES.map((_, i) => i).sort((a, b) => ROUTES[a][1] - ROUTES[b][1] || ROUTES[a][0] - ROUTES[b][0]);
const BY_START = ROUTES.map((_, i) => i).sort((a, b) => ROUTES[a][0] - ROUTES[b][0] || ROUTES[a][1] - ROUTES[b][1]);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const END_SORT = {
  python: `def solution(routes):
    routes.sort(key=lambda r: r[1])      # 나가는 지점이 빠른 순서로 정렬
    answer = 0
    camera = float('-inf')               # 마지막으로 설치한 카메라 위치
    for start, end in routes:
        if start > camera:               # 마지막 카메라가 이 차를 못 만난다
            camera = end                 # 이 차가 나가는 지점에 새 카메라를 설치
            answer += 1
    return answer`,
  javascript: `function solution(routes) {
  routes.sort((a, b) => a[1] - b[1]); // 나가는 지점이 빠른 순서로 정렬
  let answer = 0;
  let camera = -Infinity; // 마지막으로 설치한 카메라 위치
  for (const [start, end] of routes) {
    if (start > camera) { // 마지막 카메라가 이 차를 못 만난다
      camera = end; // 이 차가 나가는 지점에 새 카메라를 설치
      answer++;
    }
  }
  return answer;
}`,
};
const END_AT = {
  sort: lines(END_SORT, ['routes.sort('], ['routes.sort(']),
  init: lines(END_SORT, ['answer = 0', "camera = float('-inf')"], ['let answer = 0', 'let camera = -Infinity']),
  look: lines(END_SORT, ['for start, end in routes', 'if start > camera'], ['for (const [start, end] of routes)', 'if (start > camera)']),
  install: lines(END_SORT, ['camera = end', 'answer += 1'], ['camera = end', 'answer++']),
  done: lines(END_SORT, ['return answer'], ['return answer']),
};

const START_NARROW = {
  python: `def solution(routes):
    routes.sort()                        # 들어오는 지점이 빠른 순서로 정렬
    answer = 0
    hi = float('-inf')                   # 지금 묶음의 카메라를 놓을 수 있는 가장 오른쪽 위치
    for start, end in routes:
        if start > hi:                   # 지금 묶음과 겹치지 않는다 → 새 묶음, 새 카메라
            answer += 1
            hi = end
        else:                            # 겹친다 → 카메라 위치를 가장 이른 끝으로 줄인다
            hi = min(hi, end)
    return answer`,
  javascript: `function solution(routes) {
  routes.sort((a, b) => a[0] - b[0] || a[1] - b[1]); // 들어오는 지점이 빠른 순서로 정렬
  let answer = 0;
  let hi = -Infinity; // 지금 묶음의 카메라를 놓을 수 있는 가장 오른쪽 위치
  for (const [start, end] of routes) {
    if (start > hi) { // 지금 묶음과 겹치지 않는다 → 새 묶음, 새 카메라
      answer++;
      hi = end;
    } else { // 겹친다 → 카메라 위치를 가장 이른 끝으로 줄인다
      hi = Math.min(hi, end);
    }
  }
  return answer;
}`,
};
const NARROW_AT = {
  sort: lines(START_NARROW, ['routes.sort()'], ['routes.sort(']),
  init: lines(START_NARROW, ['answer = 0', "hi = float('-inf')"], ['let answer = 0', 'let hi = -Infinity']),
  look: lines(START_NARROW, ['for start, end in routes', 'if start > hi'], ['for (const [start, end] of routes)', 'if (start > hi)']),
  open: lines(START_NARROW, ['answer += 1', 'hi = end'], ['answer++', 'hi = end']),
  narrow: lines(START_NARROW, ['else:', 'hi = min(hi, end)'], ['} else {', 'hi = Math.min(hi, end)']),
  done: lines(START_NARROW, ['return answer'], ['return answer']),
};

const START_FIRST = {
  python: `def solution(routes):
    routes.sort()                        # 들어오는 지점이 빠른 순서로 정렬
    answer = 0
    camera = float('-inf')               # 마지막으로 설치한 카메라 위치
    for start, end in routes:
        if start > camera:               # 마지막 카메라보다 오른쪽에서 들어오면
            camera = end                 # 이 차가 나가는 지점에 새 카메라를 설치
            answer += 1
        # 아니면 카메라를 지난다고 본다 (끝점은 확인하지 않는다)
    return answer  # [[0, 10], [1, 2], [3, 4]]는 1대 (정답은 2대)`,
  javascript: `function solution(routes) {
  routes.sort((a, b) => a[0] - b[0] || a[1] - b[1]); // 들어오는 지점이 빠른 순서로 정렬
  let answer = 0;
  let camera = -Infinity; // 마지막으로 설치한 카메라 위치
  for (const [start, end] of routes) {
    if (start > camera) { // 마지막 카메라보다 오른쪽에서 들어오면
      camera = end; // 이 차가 나가는 지점에 새 카메라를 설치
      answer++;
    }
    // 아니면 카메라를 지난다고 본다 (끝점은 확인하지 않는다)
  }
  return answer; // [[0, 10], [1, 2], [3, 4]]는 1대 (정답은 2대)
}`,
};
const FIRST_AT = {
  sort: lines(START_FIRST, ['routes.sort()'], ['routes.sort(']),
  init: lines(START_FIRST, ['answer = 0', "camera = float('-inf')"], ['let answer = 0', 'let camera = -Infinity']),
  look: lines(START_FIRST, ['for start, end in routes', 'if start > camera'], ['for (const [start, end] of routes)', 'if (start > camera)']),
  install: lines(START_FIRST, ['camera = end', 'answer += 1'], ['camera = end', 'answer++']),
  done: lines(START_FIRST, ['return answer'], ['return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 80px은 줄 이름, 지점 칸은 x 86부터 26px씩(MIN~MAX). 세로 띠: 눈금 글 0~16, 눈금선 24, 차량 줄 36부터 36px 간격(24px 칸, 판정 표시가 칸 위 11px에 붙으므로 줄 사이 12px 틈 안에 든다),
// 카메라 이름표 줄은 마지막 차량 줄 22px 아래, 그 아래가 개수 표시 줄. 오른쪽 62px은 마지막 칸 위 판정 표시가 장면 안에 들도록 둔 여백이다.
const U = 26;
const X0 = 86;
const tx = axis({ x: X0 + U / 2, w: (MAX - MIN) * U, min: MIN, max: MAX }); // 지점 → 그 칸의 가운데 x
const LEFT = (v: number) => tx(v) - U / 2;
const RIGHT = (v: number) => tx(v) + U / 2;
const AXIS_Y = 24;
const ROW0 = 36;
const PITCH = 36;
const ROW_H = 24;
const rowY = (slot: number) => ROW0 + slot * PITCH;
const ROWS_END = rowY(N - 1) + ROW_H;
const CAM_Y = ROWS_END + 22;
const RES_Y = CAM_Y + 24 + 8;
const W = X0 + (MAX - MIN + 1) * U + 62;
const H = RES_Y + 28 + 6;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다

const routeId = (i: number) => `route:${i}`;
const labelId = (i: number) => `lab:${i}`;
const routeRect = (i: number, slot: number): Rect => ({ x: LEFT(ROUTES[i][0]) + 2, y: rowY(slot), w: (ROUTES[i][1] - ROUTES[i][0] + 1) * U - 4, h: ROW_H });
const labelRect = (slot: number): Rect => ({ x: 0, y: rowY(slot), w: 80, h: ROW_H });
// k번째 카메라: 차량 줄을 꿰뚫는 가는 기둥과 그 아래 이름표(위치)
const poleRect = (c: number): Rect => ({ x: tx(c) - 3, y: ROW0 - 6, w: 6, h: CAM_Y - (ROW0 - 6) });
const tagRect = (c: number): Rect => ({ x: tx(c) - 22, y: CAM_Y, w: 44, h: 24 });
const pole = (k: number, c: number, tone: Tone): Item => ({ id: `cam:${k}`, kind: 'token', rect: poleRect(c), tone });
const tag = (k: number, c: number, tone: Tone): Item => ({ id: `camlab:${k}`, kind: 'token', rect: tagRect(c), tone, text: String(c) });
const COUNT_AT: Rect = { x: X0, y: RES_Y, w: 132, h: 28 };
const TRUTH_AT: Rect = { x: X0 + 142, y: RES_Y, w: 132, h: 28 };

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const paint = (i: number, tone: Tone): Action => ({ type: 'set', id: routeId(i), patch: { tone } });
const camTone = (k: number, tone: Tone): Action[] => together([{ type: 'set', id: `cam:${k}`, patch: { tone } }, { type: 'set', id: `camlab:${k}`, patch: { tone } }]);
const camAdd = (k: number, c: number, tone: Tone, from: string): Action[] =>
  together([{ type: 'add', item: pole(k, c, tone), from }, { type: 'add', item: tag(k, c, tone), from }]);
const camMove = (k: number, c: number): Action[] =>
  together([{ type: 'set', id: `cam:${k}`, patch: { rect: poleRect(c) } }, { type: 'set', id: `camlab:${k}`, patch: { rect: tagRect(c), text: String(c) } }]);
const count = (n: number, tone: Tone, text = `카메라 ${n}대`): Action => ({ type: 'set', id: 'tok:count', patch: { text, tone }, pop: true });

// 세 풀이가 같이 쓰는 장면: 지점 눈금, 차량 경로 줄(입력 순서), 카메라 줄 이름, 개수 표시
function board(): Scene {
  const items: Item[] = [
    { id: 'axis', kind: 'line', rect: FULL, tone: 'trail', points: [[LEFT(MIN), AXIS_Y], [RIGHT(MAX), AXIS_Y]] },
    { id: 'lab:tick', kind: 'text', rect: { x: 0, y: 0, w: 80, h: 16 }, tone: 'muted', text: '지점' },
    { id: 'lab:cam', kind: 'text', rect: { x: 0, y: CAM_Y, w: 80, h: 24 }, text: '카메라' },
    { id: 'tok:count', kind: 'token', rect: COUNT_AT, tone: 'plain', text: '카메라 0대' },
  ];
  for (let v = MIN; v <= MAX; v++) items.push({ id: `tick:${v}`, kind: 'text', rect: { x: tx(v) - U / 2, y: 0, w: U, h: 16 }, tone: 'muted', text: String(v) });
  ROUTES.forEach(([s, e], i) => items.push(
    { id: labelId(i), kind: 'text', rect: labelRect(i), text: `${s} ~ ${e}` },
    { id: routeId(i), kind: 'cell', rect: routeRect(i, i), tone: 'plain' },
  ));
  return { width: W, height: H, items };
}

// 정렬 단계(세 풀이가 같다): 차량 줄이 정렬한 순서대로 미끄러져 자리를 바꾼다
function sortStep(rec: PacedRecorder, order: number[], title: string, caption: string, codeHighlights: Record<Language, number[]>, meta: { work: number; variables: Record<string, string | number> }) {
  rec.step({ title, codeHighlights, ...meta });
  rec.phase('정렬하기', caption);
  rec.do(...together(order.flatMap((i, slot): Action[] => [
    { type: 'set', id: routeId(i), patch: { rect: routeRect(i, slot) } },
    { type: 'set', id: labelId(i), patch: { rect: labelRect(slot) } },
  ])), wait(600));
}

// 시작 단계: 변수를 정하고 개수 표시를 켠다
function startStep(rec: PacedRecorder, title: string, caption: string, codeHighlights: Record<Language, number[]>, meta: { work: number; variables: Record<string, string | number> }) {
  rec.step({ title, codeHighlights, ...meta });
  rec.phase('시작', caption);
  rec.do(count(0, 'chosen'));
}

/* ------------------------------------------------------------------ */
/* 정석 끝점 정렬: 살피기 → 정하기 (차 한 대가 한 단계)                    */
/* ------------------------------------------------------------------ */

function endSort(): Visualization {
  const rec = new PacedRecorder(board());
  const cams: number[] = [];
  let [camera, answer, seen] = [-Infinity, 0, 0];
  let cur: [number, number] | undefined;
  const meta = () => ({ work: seen, variables: { start: cur ? cur[0] : '-', end: cur ? cur[1] : '-', camera: show(camera), answer } });

  sortStep(rec, BY_END, '나가는 지점 순서로 정렬하기', '나가는 지점이 빠른 차가 위에 오도록 정렬합니다.', END_AT.sort, meta());
  startStep(rec, '카메라 0대, 마지막 카메라 없음', '카메라 수 answer는 0대, 마지막 카메라 위치 camera는 아직 없어서 -∞로 둡니다.', END_AT.init, meta());

  BY_END.forEach((i) => {
    const [s, e] = ROUTES[i];
    const [was, last] = [camera, cams.length - 1]; // 비교하기 전의 카메라 위치와 그 카메라의 번호
    const covered = s <= was;
    seen++;
    cur = [s, e];
    if (!covered) {
      camera = e;
      answer++;
      cams.push(e);
    }

    rec.step({ title: `${s} ~ ${e} 차: ${covered ? `카메라 ${josa(was, '을', '를')} 지나감` : `새 카메라 ${e}`}`, codeHighlights: covered ? END_AT.look : END_AT.install, ...meta() });
    if (was === -Infinity) {
      rec.phase('살피기', '아직 카메라가 없습니다. 이 차는 카메라를 만나지 못합니다.', END_AT.look);
      rec.do(...together([{ type: 'focus', ids: [routeId(i)] }, paint(i, 'current')]), wait(300));
    } else {
      rec.phase('살피기', covered
        ? `시작점 ${josa(s, '은', '는')} 카메라 위치 ${was} 이하이고, 끝점 ${josa(e, '은', '는')} 카메라 위치 이상이라 이 차는 카메라를 지나갑니다.`
        : `시작점 ${josa(s, '이', '가')} 마지막 카메라 ${was}보다 오른쪽이라, 이 차는 카메라를 만나지 못합니다.`, END_AT.look);
      rec.do(...together([{ type: 'focus', ids: [routeId(i)] }, paint(i, 'current')]));
      rec.do({ type: 'arrow', from: `camlab:${last}`, to: routeId(i), verdict: covered ? 'good' : 'new', label: covered ? `${s} ≤ ${was} 지나감` : `${s} > ${was} 새 카메라` }, wait(450));
    }

    if (covered) {
      rec.phase('정하기', '이미 설치한 카메라가 만나는 차라서 새로 설치하지 않습니다.', END_AT.look);
      rec.do(...clear(paint(i, 'visited')), wait(250));
    } else {
      rec.phase('정하기', `이 차의 끝점 ${e}에 새 카메라를 설치합니다. 카메라는 ${answer}대입니다.`, END_AT.install);
      rec.do(...clear());
      rec.do(...camAdd(cams.length - 1, e, 'chosen', routeId(i)));
      rec.do(...together([paint(i, 'chosen'), count(answer, 'chosen')], true));
    }
  });

  cur = undefined;
  rec.step({ title: `카메라 ${answer}대`, codeHighlights: END_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `카메라는 ${answer}대, 위치는 ${list(cams)}입니다. 끝점 순으로 보았기에 마지막 카메라만 확인해도 충분했습니다.`);
  rec.do(...together([...cams.flatMap((_, k) => camTone(k, 'path')), count(answer, 'path')]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 시작점 정렬 + 카메라 위치 줄이기: 살피기 → 정하기                  */
/* ------------------------------------------------------------------ */

function startNarrow(): Visualization {
  const rec = new PacedRecorder(board());
  const cams: number[] = [];
  let [hi, answer, work] = [-Infinity, 0, 0];
  let cur: [number, number] | undefined;
  const meta = () => ({ work, variables: { start: cur ? cur[0] : '-', end: cur ? cur[1] : '-', hi: show(hi), answer } });

  sortStep(rec, BY_START, '들어오는 지점 순서로 정렬하기', '들어오는 지점이 빠른 차가 위에 오도록 정렬합니다.', NARROW_AT.sort, meta());
  startStep(rec, '카메라 0대, 카메라 후보 없음', '카메라 수 answer는 0대, 카메라를 놓을 수 있는 가장 오른쪽 위치 hi는 아직 없어서 -∞로 둡니다.', NARROW_AT.init, meta());

  BY_START.forEach((i) => {
    const [s, e] = ROUTES[i];
    const [was, last] = [hi, cams.length - 1]; // 비교하기 전의 hi와 그 묶음의 카메라 번호
    const fresh = s > was; // 지금 묶음과 겹치지 않아 새 묶음을 시작
    const shrinks = !fresh && e < was; // 겹치면서 끝점이 더 이르면 카메라 후보가 줄어듦
    work += fresh ? 1 : 2; // 시작점과 hi를 비교하고, 겹치면 min으로 끝점과 한 번 더 비교
    cur = [s, e];
    if (fresh) {
      answer++;
      hi = e;
      cams.push(e);
    } else {
      hi = Math.min(hi, e);
      cams[last] = hi;
    }

    rec.step({
      title: `${s} ~ ${e} 차: ${fresh ? (was === -Infinity ? `첫 묶음, 카메라 후보 ${e}` : `새 묶음, 카메라 후보 ${e}`) : shrinks ? `카메라 후보를 ${ro(e)} 줄임` : `카메라 후보 ${hi} 그대로`}`,
      codeHighlights: fresh ? NARROW_AT.open : NARROW_AT.narrow,
      ...meta(),
    });
    if (was === -Infinity) {
      rec.phase('살피기', '아직 묶음이 없어서 이 차로 첫 묶음을 시작합니다.', NARROW_AT.look);
      rec.do(...together([{ type: 'focus', ids: [routeId(i)] }, paint(i, 'current')]), wait(300));
    } else {
      rec.phase('살피기', fresh
        ? `시작점 ${josa(s, '이', '가')} 카메라 후보 ${was}보다 오른쪽이라, 지금 묶음과 겹치지 않습니다.`
        : `시작점 ${josa(s, '이', '가')} 카메라 후보 ${was} 이하라, 지금 묶음과 겹칩니다.`, NARROW_AT.look);
      rec.do(...together([{ type: 'focus', ids: [routeId(i)] }, paint(i, 'current')]));
      rec.do({ type: 'arrow', from: `camlab:${last}`, to: routeId(i), verdict: fresh ? 'new' : 'good', label: fresh ? `${s} > ${was} 새 묶음` : `${s} ≤ ${was} 겹침` }, wait(450));
    }

    if (fresh) {
      rec.phase('정하기', was === -Infinity
        ? `이 차의 끝점 ${e}에 카메라 후보를 둡니다. 카메라는 ${answer}대입니다.`
        : `지금 묶음의 카메라를 ${was}에 확정하고, 이 차의 끝점 ${e}에서 새 묶음을 시작합니다. 카메라는 ${answer}대입니다.`, NARROW_AT.open);
      rec.do(...clear());
      if (was !== -Infinity) {
        rec.do(...camTone(last, 'chosen'));
        rec.do(...together(closed(last), true));
      }
      rec.do(...camAdd(cams.length - 1, e, 'queued', routeId(i)));
      rec.do(...together([paint(i, 'queued'), count(answer, 'chosen')], true));
    } else {
      rec.phase('정하기', shrinks
        ? `끝점 ${josa(e, '이', '가')} 카메라 후보 ${was}보다 왼쪽이라, 카메라 후보를 ${ro(e)} 줄입니다.`
        : `끝점 ${josa(e, '이', '가')} 카메라 후보 ${was}보다 오른쪽이라, 카메라 후보는 그대로 ${hi}입니다.`, NARROW_AT.narrow);
      rec.do(...clear());
      if (shrinks) rec.do(...camMove(last, e));
      rec.do(paint(i, 'queued'), ...(shrinks ? [] : [wait(250)]));
    }
  });

  // 방금 닫힌 묶음(번호 g)의 차를 초록으로
  function closed(g: number): Action[] {
    return BY_START.filter((j) => GROUP_OF[j] === g).map((j) => paint(j, 'visited'));
  }

  cur = undefined;
  rec.step({ title: `카메라 ${answer}대`, codeHighlights: NARROW_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `마지막 묶음의 카메라도 ${hi}에 확정합니다. 카메라는 ${answer}대, 위치는 ${list(cams)}입니다.`);
  rec.do(...together([...cams.flatMap((_, k) => camTone(k, 'path')), count(answer, 'path'), ...BY_START.map((j) => paint(j, 'visited'))]));
  return rec.finish();
}

// 대안의 묶음 번호: 차마다 어느 묶음에 드는지(시작점 순으로 훑으며 겹치는 동안 같은 묶음)
const GROUP_OF: number[] = [];
{
  let [hi, g] = [-Infinity, -1];
  for (const i of BY_START) {
    const [s, e] = ROUTES[i];
    if (s > hi) [hi, g] = [e, g + 1];
    else hi = Math.min(hi, e);
    GROUP_OF[i] = g;
  }
}

/* ------------------------------------------------------------------ */
/* 함정 시작점 정렬 + 첫 차의 끝에 설치: 살피기 → 정하기, 오답 확인          */
/* ------------------------------------------------------------------ */

// 카메라 위치들 중 하나라도 [s, e] 안에 있으면 그 차는 카메라를 만난다
const meets = (cams: number[], i: number) => cams.some((c) => ROUTES[i][0] <= c && c <= ROUTES[i][1]);
const TRUTH = (() => {
  let [camera, n] = [-Infinity, 0];
  for (const i of BY_END) if (ROUTES[i][0] > camera) [camera, n] = [ROUTES[i][1], n + 1];
  return n;
})();

function startFirst(): Visualization {
  const rec = new PacedRecorder(board());
  const cams: number[] = [];
  let [camera, answer, seen] = [-Infinity, 0, 0];
  let cur: [number, number] | undefined;
  const meta = () => ({ work: seen, variables: { start: cur ? cur[0] : '-', end: cur ? cur[1] : '-', camera: show(camera), answer } });

  sortStep(rec, BY_START, '들어오는 지점 순서로 정렬하기', '들어오는 지점이 빠른 차가 위에 오도록 정렬합니다.', FIRST_AT.sort, meta());
  startStep(rec, '카메라 0대, 마지막 카메라 없음', '카메라 수 answer는 0대, 마지막 카메라 위치 camera는 아직 없어서 -∞로 둡니다.', FIRST_AT.init, meta());

  BY_START.forEach((i) => {
    const [s, e] = ROUTES[i];
    const [was, last] = [camera, cams.length - 1];
    const skip = s <= was;
    seen++;
    cur = [s, e];
    if (!skip) {
      camera = e;
      answer++;
      cams.push(e);
    }

    rec.step({ title: `${s} ~ ${e} 차: ${skip ? `시작점 ${s} ≤ ${was}, 지나간다고 봄` : `새 카메라 ${e}`}`, codeHighlights: skip ? FIRST_AT.look : FIRST_AT.install, ...meta() });
    if (was === -Infinity) {
      rec.phase('살피기', '아직 카메라가 없습니다. 이 차는 카메라를 만나지 못합니다.', FIRST_AT.look);
      rec.do(...together([{ type: 'focus', ids: [routeId(i)] }, paint(i, 'current')]), wait(300));
    } else {
      rec.phase('살피기', skip
        ? `시작점 ${josa(s, '이', '가')} 카메라 ${was} 이하라 카메라를 지난다고 봅니다. 끝점은 확인하지 않습니다.`
        : `시작점 ${josa(s, '이', '가')} 마지막 카메라 ${was}보다 오른쪽이라, 이 차는 카메라를 만나지 못합니다.`, FIRST_AT.look);
      rec.do(...together([{ type: 'focus', ids: [routeId(i)] }, paint(i, 'current')]));
      rec.do({ type: 'arrow', from: `camlab:${last}`, to: routeId(i), verdict: skip ? 'good' : 'new', label: skip ? `${s} ≤ ${was} 지나감?` : `${s} > ${was} 새 카메라` }, wait(450));
    }

    if (skip) {
      rec.phase('정하기', '새로 설치하지 않고 넘어갑니다.', FIRST_AT.look);
      rec.do(...clear(paint(i, 'visited')), wait(250));
    } else {
      rec.phase('정하기', `이 차의 끝점 ${e}에 새 카메라를 설치합니다. 카메라는 ${answer}대입니다.`, FIRST_AT.install);
      rec.do(...clear());
      rec.do(...camAdd(cams.length - 1, e, 'chosen', routeId(i)));
      rec.do(...together([paint(i, 'chosen'), count(answer, 'chosen')], true));
    }
  });

  cur = undefined;
  const missed = BY_START.filter((i) => !meets(cams, i));
  rec.step({ title: `이 방법 ${answer}대, 정답은 ${TRUTH}대`, codeHighlights: FIRST_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('오답 확인', `카메라 ${answer}대로 끝났지만, 카메라 ${list(cams)}를 만나지 못하는 차가 ${missed.length}대입니다(주황색). 정답은 ${TRUTH}대입니다.`);
  rec.do(...together(missed.map((i) => paint(i, 'bad'))));
  rec.do(...together([count(answer, 'bad', `이 방법 ${answer}대`), { type: 'add', item: { id: 'tok:truth', kind: 'token', rect: TRUTH_AT, tone: 'good', text: `정답 ${TRUTH}대` } }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'speed-camera',
  title: '단속카메라',
  level: 3,
  category: 'greedy',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42884',
  description: {
    summary:
      '고속도로를 달리는 차량마다 들어온 지점과 나간 지점이 주어집니다. 모든 차량이 자기 경로에서 카메라를 적어도 한 번은 만나도록 카메라를 설치할 때, 필요한 카메라의 최소 대수를 구합니다. 들어온 지점이나 나간 지점에 카메라가 있어도 만난 것으로 칩니다.',
    rules: [
      '차량은 1대 이상 10,000대 이하',
      'routes[i]는 i번째 차량이 고속도로에 들어온 지점과 나간 지점',
      '들어온 지점과 나간 지점은 -30,000 이상 30,000 이하',
      '들어온 지점이나 나간 지점에 카메라가 있어도 카메라를 만난 것으로 봄',
    ],
    examples: [{ input: 'routes = [[-20, -15], [-14, -5], [-18, -13], [-5, -3]]', output: '2' }],
  },
  keyIntuitions: [
    '나가는 지점이 가장 빠른 차를 만나려면 카메라는 그 차의 경로 안에 있어야 합니다. 그중 가장 오른쪽인 나가는 지점에 놓으면, 아직 나가지 않은 다른 차를 가장 많이 만납니다.',
    '나가는 지점 순서로 정렬해 차를 하나씩 봅니다. 마지막 카메라가 이 차를 만나지 못할 때(들어온 지점이 카메라보다 오른쪽)만 이 차의 나가는 지점에 새 카메라를 놓습니다.',
    '들어오는 지점으로 정렬하면 나가는 지점이 더 이른 차를 놓칩니다. 그때는 카메라 위치를 가장 이른 나가는 지점으로 계속 줄여 가야 합니다.',
  ],
  demo: { input: [ROUTES], label: 'routes = [[-5, 2], [-9, 5], [1, 4], [-7, -4], [3, 8], [-2, 0], [6, 9]]' },
  workUnit: '값을 비교한 횟수',
  approaches: [
    {
      id: 'speed-camera-end-sort',
      name: '끝점(나가는 지점) 기준 정렬',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '나가는 지점이 빠른 차부터 보며, 마지막 카메라가 못 만나는 차의 나가는 지점에 카메라를 놓는 풀이입니다.',
      pros: [
        '정렬한 뒤에는 한 번만 훑으면 되어 O(N)입니다.',
        '마지막 카메라 위치 하나만 기억하면 됩니다. 나가는 지점 순서라 카메라보다 먼저 나가는 차가 없기 때문입니다.',
        '코드가 짧고 분기가 하나뿐입니다.',
      ],
      cons: [
        '시작점이 아니라 끝점으로 정렬해야 한다는 발상이 필요합니다.',
        '들어오거나 나가는 지점에 카메라가 있어도 만난 것으로 치므로, 비교는 등호 없이 start > camera로 씁니다.',
      ],
      whyThisRank:
        '가장 먼저 나가는 차를 만나려면 카메라가 그 차의 끝점 이전에 있어야 하고, 끝점에 놓을수록 아직 나가지 않은 차를 가장 많이 만납니다. 그래서 끝점이 가장 빠른 차부터 그 끝점에 설치하는 선택은 항상 안전합니다.',
      code: END_SORT,
      visualize: endSort,
    },
    {
      id: 'speed-camera-start-narrow',
      name: '시작점 정렬 + 카메라 위치 줄이기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '들어오는 지점 순으로 정렬하고, 겹치는 차를 한 묶음으로 보며 카메라 위치를 가장 이른 끝점으로 줄여 가는 풀이입니다.',
      pros: [
        '정석과 같은 O(N log N)이고 답도 같습니다.',
        '"겹치는 차를 한 묶음으로 본다"는 설명이 그림으로 바로 이해됩니다.',
      ],
      cons: [
        '겹칠 때마다 끝점으로 카메라 위치를 줄이는 min을 챙겨야 해서, 정석보다 신경 쓸 것이 하나 늘어납니다.',
        'min을 빼먹으면 아래 함정 풀이가 됩니다.',
      ],
      whyThisRank:
        '정렬 기준만 시작점으로 바꿔도 풀 수 있지만, 먼저 나가는 차의 끝점을 따로 챙겨야 합니다. 끝점 기준 정렬은 그 일을 정렬이 대신해 줍니다.',
      code: START_NARROW,
      visualize: startNarrow,
    },
    {
      id: 'speed-camera-start-first',
      name: '시작점 정렬 + 첫 차의 끝에 설치',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '들어오는 지점 순으로 정렬해 첫 차의 끝점에 카메라를 놓고, 시작점이 그 카메라 이하인 차는 모두 만난다고 보는 풀이로, 끝점이 더 빠른 차를 놓칩니다.',
      pros: ['코드가 가장 짧고, 공식 예제는 우연히 통과합니다.'],
      cons: [
        '시작점이 카메라 이하여도 끝점이 카메라보다 왼쪽이면 그 차는 카메라를 만나지 못합니다.',
        'routes = [[0, 10], [1, 2], [3, 4]]이면 정답은 2대인데 1대가 나옵니다.',
      ],
      whyThisRank:
        '차가 카메라를 만나려면 시작점 ≤ 카메라 ≤ 끝점이어야 하는데, 이 풀이는 앞쪽 조건만 봅니다. 끝점 확인을 빼먹은 대가로 카메라 수를 적게 셉니다.',
      code: START_FIRST,
      visualize: startFirst,
    },
  ],
  checks: {
    cases: [
      { args: [[[-20, -15], [-14, -5], [-18, -13], [-5, -3]]], expected: 2 },
      { args: [[[0, 0]]], expected: 1 },
      { args: [[[-30000, 30000]]], expected: 1 },
      { args: [[[1, 2], [2, 3]]], expected: 1 },
      { args: [[[1, 2], [3, 4], [5, 6]]], expected: 3 },
      { args: [[[0, 10], [1, 2], [3, 4]]], expected: 2 },
      { args: [[[-3, -3], [-3, -3]]], expected: 1 },
      { args: [ROUTES], expected: 4 },
    ],
    // 차 1~8대, 지점 -8~8, 들어온 지점 ≤ 나간 지점(길이 0~6)
    random: (rand) => [
      Array.from({ length: 1 + Math.floor(rand() * 8) }, () => {
        const s = -8 + Math.floor(rand() * 17);
        return [s, Math.min(8, s + Math.floor(rand() * 7))];
      }),
    ],
  },
};

export default problem;
