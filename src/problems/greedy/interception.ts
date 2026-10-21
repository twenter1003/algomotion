// 요격 시스템: 정석 끝점 정렬, 대안 시작점 정렬 + 요격 위치 줄이기, 함정 끝점 정렬인데 s > last로 비교(열린 구간을 닫힌 구간처럼 취급)를 같은 장면에서 움직인다.
// 장면은 위에 좌표 눈금(수직선), 가운데에 폭격 미사일 구간 줄(정렬하면 줄이 미끄러져 자리를 바꿈), 아래에 요격 위치 이름표 줄과 개수 표시다.
// 구간 (s, e)는 s 눈금에서 e 눈금까지 막대로 그리고, 요격은 끝점 바로 왼쪽(e − ε)에 가는 기둥으로 세운다. 끝점 눈금에서는 못 맞히므로 기둥은 눈금보다 8px 왼쪽이다.
import { axis } from '../../engine/layout.ts';
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { josa, lines, together } from '../shared.ts';
import { PacedRecorder } from './paced.ts';

// 시각화 입력. 정석은 4발, 끝점이 맞닿은 구간(3, 6, 9)을 닫힌 구간처럼 비교하면 2발(오답)이 나온다.
const TARGETS: [number, number][] = [[3, 6], [9, 12], [2, 3], [1, 10], [9, 13], [6, 9], [2, 4]];
const N = TARGETS.length;
const MIN = Math.min(...TARGETS.map(([s]) => s));
const MAX = Math.max(...TARGETS.map(([, e]) => e));
const list = (xs: number[]) => `[${xs.map((x) => `${x}-ε`).join(', ')}]`;
const show = (v: number) => (v === -Infinity ? '-∞' : v);
// 정렬한 순서: BY_END[t]는 t번째로 끝나는 미사일의 입력 번호(끝이 같으면 시작이 빠른 것)
const BY_END = TARGETS.map((_, i) => i).sort((a, b) => TARGETS[a][1] - TARGETS[b][1] || TARGETS[a][0] - TARGETS[b][0]);
const BY_START = TARGETS.map((_, i) => i).sort((a, b) => TARGETS[a][0] - TARGETS[b][0] || TARGETS[a][1] - TARGETS[b][1]);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const END_SORT = {
  python: `def solution(targets):
    targets.sort(key=lambda t: t[1])     # 끝점이 빠른 순서로 정렬
    answer = 0
    last = float('-inf')                 # 마지막 요격 위치(그 미사일의 끝점 바로 왼쪽)
    for s, e in targets:
        if s >= last:                    # 열린 구간이라 s == last도 못 맞힌다
            answer += 1                  # 이 미사일의 끝점 바로 왼쪽에서 요격
            last = e
    return answer`,
  javascript: `function solution(targets) {
  targets.sort((a, b) => a[1] - b[1]); // 끝점이 빠른 순서로 정렬
  let answer = 0;
  let last = -Infinity; // 마지막 요격 위치(그 미사일의 끝점 바로 왼쪽)
  for (const [s, e] of targets) {
    if (s >= last) { // 열린 구간이라 s === last도 못 맞힌다
      answer++; // 이 미사일의 끝점 바로 왼쪽에서 요격
      last = e;
    }
  }
  return answer;
}`,
};
const END_AT = {
  sort: lines(END_SORT, ['targets.sort('], ['targets.sort(']),
  init: lines(END_SORT, ['answer = 0', "last = float('-inf')"], ['let answer = 0', 'let last = -Infinity']),
  look: lines(END_SORT, ['for s, e in targets', 'if s >= last'], ['for (const [s, e] of targets)', 'if (s >= last)']),
  install: lines(END_SORT, ['answer += 1', 'last = e'], ['answer++', 'last = e']),
  done: lines(END_SORT, ['return answer'], ['return answer']),
};

const START_NARROW = {
  python: `def solution(targets):
    targets.sort()                       # 시작점이 빠른 순서로 정렬
    answer = 0
    hi = float('-inf')                   # 지금 묶음을 한 발로 맞힐 수 있는 가장 오른쪽 끝점
    for s, e in targets:
        if s >= hi:                      # 지금 묶음과 겹치지 않는다 → 새 묶음, 새 요격
            answer += 1
            hi = e
        else:                            # 겹친다 → 요격 위치를 더 이른 끝점으로 줄인다
            hi = min(hi, e)
    return answer`,
  javascript: `function solution(targets) {
  targets.sort((a, b) => a[0] - b[0] || a[1] - b[1]); // 시작점이 빠른 순서로 정렬
  let answer = 0;
  let hi = -Infinity; // 지금 묶음을 한 발로 맞힐 수 있는 가장 오른쪽 끝점
  for (const [s, e] of targets) {
    if (s >= hi) { // 지금 묶음과 겹치지 않는다 → 새 묶음, 새 요격
      answer++;
      hi = e;
    } else { // 겹친다 → 요격 위치를 더 이른 끝점으로 줄인다
      hi = Math.min(hi, e);
    }
  }
  return answer;
}`,
};
const NARROW_AT = {
  sort: lines(START_NARROW, ['targets.sort()'], ['targets.sort(']),
  init: lines(START_NARROW, ['answer = 0', "hi = float('-inf')"], ['let answer = 0', 'let hi = -Infinity']),
  look: lines(START_NARROW, ['for s, e in targets', 'if s >= hi'], ['for (const [s, e] of targets)', 'if (s >= hi)']),
  open: lines(START_NARROW, ['answer += 1', 'hi = e'], ['answer++', 'hi = e']),
  narrow: lines(START_NARROW, ['else:', 'hi = min(hi, e)'], ['} else {', 'hi = Math.min(hi, e)']),
  done: lines(START_NARROW, ['return answer'], ['return answer']),
};

const CLOSED = {
  python: `def solution(targets):
    targets.sort(key=lambda t: t[1])     # 끝점이 빠른 순서로 정렬
    answer = 0
    last = float('-inf')                 # 마지막 요격 위치(그 미사일의 끝점 바로 왼쪽)
    for s, e in targets:
        if s > last:                     # 끝점이 같으면 맞힌다고 본다 (열린 구간인데!)
            answer += 1
            last = e
    return answer  # [[1, 3], [3, 6]]은 1발 (정답은 2발)`,
  javascript: `function solution(targets) {
  targets.sort((a, b) => a[1] - b[1]); // 끝점이 빠른 순서로 정렬
  let answer = 0;
  let last = -Infinity; // 마지막 요격 위치(그 미사일의 끝점 바로 왼쪽)
  for (const [s, e] of targets) {
    if (s > last) { // 끝점이 같으면 맞힌다고 본다 (열린 구간인데!)
      answer++;
      last = e;
    }
  }
  return answer; // [[1, 3], [3, 6]]은 1발 (정답은 2발)
}`,
};
const CLOSED_AT = {
  sort: lines(CLOSED, ['targets.sort('], ['targets.sort(']),
  init: lines(CLOSED, ['answer = 0', "last = float('-inf')"], ['let answer = 0', 'let last = -Infinity']),
  look: lines(CLOSED, ['for s, e in targets', 'if s > last'], ['for (const [s, e] of targets)', 'if (s > last)']),
  install: lines(CLOSED, ['answer += 1', 'last = e'], ['answer++', 'last = e']),
  done: lines(CLOSED, ['return answer'], ['return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 90px은 줄 이름, 눈금 1칸은 36px(x 96부터). 세로 띠: 눈금 글 0~16, 눈금선 24, 미사일 줄 36부터 36px 간격(24px 막대, 판정 표시가 막대 위 11px에 붙으므로 줄 사이 12px 틈 안에 든다),
// 요격 이름표 줄은 마지막 줄 22px 아래, 그 아래가 개수 표시 줄. 오른쪽 70px은 마지막 막대 위 판정 표시가 장면 안에 들도록 둔 여백이다.
const U = 36;
const X0 = 96;
const OFF = 8; // 요격은 끝점 눈금보다 8px 왼쪽(= 끝점 바로 왼쪽, e − ε)
const tx = axis({ x: X0, w: (MAX - MIN) * U, min: MIN, max: MAX });
const AXIS_Y = 24;
const ROW0 = 36;
const PITCH = 36;
const ROW_H = 24;
const rowY = (slot: number) => ROW0 + slot * PITCH;
const ROWS_END = rowY(N - 1) + ROW_H;
const CAM_Y = ROWS_END + 22;
const RES_Y = CAM_Y + 24 + 8;
const W = tx(MAX) + 70;
const H = RES_Y + 28 + 6;
const FULL: Rect = { x: 0, y: 0, w: W, h: H }; // line은 rect 대신 points로 그린다

const barId = (i: number) => `route:${i}`;
const labelId = (i: number) => `lab:${i}`;
const barRect = (i: number, slot: number): Rect => ({ x: tx(TARGETS[i][0]), y: rowY(slot), w: (TARGETS[i][1] - TARGETS[i][0]) * U, h: ROW_H });
const labelRect = (slot: number): Rect => ({ x: 0, y: rowY(slot), w: 90, h: ROW_H });
// k번째 요격: 미사일 줄을 꿰뚫는 가는 기둥과 그 아래 이름표(끝점 − ε). 위치 e는 그 미사일 끝점의 눈금 값
const poleRect = (e: number): Rect => ({ x: tx(e) - OFF - 3, y: ROW0 - 6, w: 6, h: CAM_Y - (ROW0 - 6) });
const tagW = (e: number) => (String(e).length > 1 ? 52 : 40);
const tagRect = (e: number): Rect => ({ x: tx(e) - OFF - tagW(e) / 2, y: CAM_Y, w: tagW(e), h: 24 });
const pole = (k: number, e: number, tone: Tone): Item => ({ id: `cam:${k}`, kind: 'token', rect: poleRect(e), tone });
const tag = (k: number, e: number, tone: Tone): Item => ({ id: `camlab:${k}`, kind: 'token', rect: tagRect(e), tone, text: `${e}-ε` });
const COUNT_AT: Rect = { x: X0, y: RES_Y, w: 132, h: 28 };
const TRUTH_AT: Rect = { x: X0 + 142, y: RES_Y, w: 132, h: 28 };

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const paint = (i: number, tone: Tone): Action => ({ type: 'set', id: barId(i), patch: { tone } });
const camTone = (k: number, tone: Tone): Action[] => together([{ type: 'set', id: `cam:${k}`, patch: { tone } }, { type: 'set', id: `camlab:${k}`, patch: { tone } }]);
const camAdd = (k: number, e: number, tone: Tone, from: string): Action[] =>
  together([{ type: 'add', item: pole(k, e, tone), from }, { type: 'add', item: tag(k, e, tone), from }]);
const camMove = (k: number, e: number): Action[] =>
  together([{ type: 'set', id: `cam:${k}`, patch: { rect: poleRect(e) } }, { type: 'set', id: `camlab:${k}`, patch: { rect: tagRect(e), text: `${e}-ε` } }]);
const count = (n: number, tone: Tone, text = `요격 ${n}발`): Action => ({ type: 'set', id: 'tok:count', patch: { text, tone }, pop: true });

// 세 풀이가 같이 쓰는 장면: 좌표 눈금, 미사일 구간 줄(입력 순서), 요격 줄 이름, 개수 표시
function board(): Scene {
  const items: Item[] = [
    { id: 'axis', kind: 'line', rect: FULL, tone: 'trail', points: [[tx(MIN) - 12, AXIS_Y], [tx(MAX) + 12, AXIS_Y]] },
    { id: 'lab:tick', kind: 'text', rect: { x: 0, y: 0, w: 90, h: 16 }, tone: 'muted', text: '좌표' },
    { id: 'lab:cam', kind: 'text', rect: { x: 0, y: CAM_Y, w: 90, h: 24 }, text: '요격 위치' },
    { id: 'tok:count', kind: 'token', rect: COUNT_AT, tone: 'plain', text: '요격 0발' },
  ];
  for (let v = MIN; v <= MAX; v++) items.push({ id: `tick:${v}`, kind: 'text', rect: { x: tx(v) - 15, y: 0, w: 30, h: 16 }, tone: 'muted', text: String(v) });
  TARGETS.forEach(([s, e], i) => items.push(
    { id: labelId(i), kind: 'text', rect: labelRect(i), text: `(${s}, ${e})` },
    { id: barId(i), kind: 'cell', rect: barRect(i, i), tone: 'plain' },
  ));
  return { width: W, height: H, items };
}

// 정렬 단계(세 풀이가 같다): 구간 줄이 정렬한 순서대로 미끄러져 자리를 바꾼다
function sortStep(rec: PacedRecorder, order: number[], title: string, caption: string, codeHighlights: Record<Language, number[]>, meta: { work: number; variables: Record<string, string | number> }) {
  rec.step({ title, codeHighlights, ...meta });
  rec.phase('정렬하기', caption);
  rec.do(...together(order.flatMap((i, slot): Action[] => [
    { type: 'set', id: barId(i), patch: { rect: barRect(i, slot) } },
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
/* 정석 끝점 정렬: 살피기 → 정하기 (미사일 하나가 한 단계)                  */
/* ------------------------------------------------------------------ */

function endSort(): Visualization {
  const rec = new PacedRecorder(board());
  const cams: number[] = [];
  let [last, answer, seen] = [-Infinity, 0, 0];
  let cur: [number, number] | undefined;
  const meta = () => ({ work: seen, variables: { s: cur ? cur[0] : '-', e: cur ? cur[1] : '-', last: show(last), answer } });

  sortStep(rec, BY_END, '끝점이 빠른 순서로 정렬하기', '끝점이 빠른 미사일이 위에 오도록 정렬합니다.', END_AT.sort, meta());
  startStep(rec, '요격 0발, 마지막 요격 위치 없음', '발사 수 answer는 0발, 마지막 요격 위치 last는 아직 없어서 -∞로 둡니다.', END_AT.init, meta());

  BY_END.forEach((i) => {
    const [s, e] = TARGETS[i];
    const [was, prev] = [last, cams.length - 1]; // 비교하기 전의 요격 위치와 그 요격의 번호
    const hit = s < was;
    seen++;
    cur = [s, e];
    if (!hit) {
      last = e;
      answer++;
      cams.push(e);
    }

    rec.step({ title: `(${s}, ${e}): ${hit ? `요격 ${was}-ε에 맞음` : `새 요격 ${e}-ε`}`, codeHighlights: hit ? END_AT.look : END_AT.install, ...meta() });
    if (was === -Infinity) {
      rec.phase('살피기', '아직 쏜 요격 미사일이 없습니다. 이 미사일은 맞히지 못했습니다.', END_AT.look);
      rec.do(...together([{ type: 'focus', ids: [barId(i)] }, paint(i, 'current')]), wait(300));
    } else {
      rec.phase('살피기', hit
        ? `시작점 ${josa(s, '이', '가')} ${was}보다 작아, ${was} 바로 왼쪽에서 쏜 요격 미사일이 이 구간 안을 지납니다.`
        : s === was
          ? `시작점 ${josa(s, '이', '가')} ${josa(was, '과', '와')} 같습니다. 열린 구간이라 끝점에서는 못 맞히니 맞히지 못했습니다.`
          : `시작점 ${josa(s, '이', '가')} ${was}보다 커서, ${was} 바로 왼쪽의 요격 미사일은 이 구간에 닿지 못합니다.`, END_AT.look);
      rec.do(...together([{ type: 'focus', ids: [barId(i)] }, paint(i, 'current')]));
      rec.do({ type: 'arrow', from: `camlab:${prev}`, to: barId(i), verdict: hit ? 'good' : 'new', label: hit ? `${s} < ${was} 맞힘` : `${s} ≥ ${was} 새 요격` }, wait(450));
    }

    if (hit) {
      rec.phase('정하기', '이미 쏜 요격 미사일이 맞히는 미사일이라 새로 쏘지 않습니다.', END_AT.look);
      rec.do(...clear(paint(i, 'visited')), wait(250));
    } else {
      rec.phase('정하기', `이 미사일의 끝점 ${e} 바로 왼쪽에 새로 쏩니다. 요격은 ${answer}발입니다.`, END_AT.install);
      rec.do(...clear());
      rec.do(...camAdd(cams.length - 1, e, 'chosen', barId(i)));
      rec.do(...together([paint(i, 'chosen'), count(answer, 'chosen')], true));
    }
  });

  cur = undefined;
  rec.step({ title: `요격 ${answer}발`, codeHighlights: END_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `요격은 ${answer}발, 위치는 ${list(cams)}입니다. 끝점 순으로 보았기에 마지막 요격 위치만 확인해도 충분했습니다.`);
  rec.do(...together([...cams.flatMap((_, k) => camTone(k, 'path')), count(answer, 'path')]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 시작점 정렬 + 요격 위치 줄이기: 살피기 → 정하기                    */
/* ------------------------------------------------------------------ */

// 대안의 묶음 번호: 시작점 순으로 훑으며 겹치는 동안 같은 묶음
const GROUP_OF: number[] = [];
{
  let [hi, g] = [-Infinity, -1];
  for (const i of BY_START) {
    const [s, e] = TARGETS[i];
    if (s >= hi) [hi, g] = [e, g + 1];
    else hi = Math.min(hi, e);
    GROUP_OF[i] = g;
  }
}

function startNarrow(): Visualization {
  const rec = new PacedRecorder(board());
  const cams: number[] = [];
  let [hi, answer, work] = [-Infinity, 0, 0];
  let cur: [number, number] | undefined;
  const meta = () => ({ work, variables: { s: cur ? cur[0] : '-', e: cur ? cur[1] : '-', hi: show(hi), answer } });

  sortStep(rec, BY_START, '시작점이 빠른 순서로 정렬하기', '시작점이 빠른 미사일이 위에 오도록 정렬합니다.', NARROW_AT.sort, meta());
  startStep(rec, '요격 0발, 요격 위치 후보 없음', '발사 수 answer는 0발, 지금 묶음을 맞힐 수 있는 가장 오른쪽 끝점 hi는 아직 없어서 -∞로 둡니다.', NARROW_AT.init, meta());

  BY_START.forEach((i) => {
    const [s, e] = TARGETS[i];
    const [was, last] = [hi, cams.length - 1]; // 비교하기 전의 hi와 그 묶음의 요격 번호
    const fresh = s >= was; // 지금 묶음과 겹치지 않아 새 묶음을 시작
    const shrinks = !fresh && e < was; // 겹치면서 끝점이 더 이르면 요격 위치가 줄어듦
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
      title: `(${s}, ${e}): ${fresh ? (was === -Infinity ? `첫 묶음, 요격 후보 ${e}-ε` : `새 묶음, 요격 후보 ${e}-ε`) : shrinks ? `요격 후보를 ${e}-ε로 줄임` : `요격 후보 ${hi}-ε 그대로`}`,
      codeHighlights: fresh ? NARROW_AT.open : NARROW_AT.narrow,
      ...meta(),
    });
    if (was === -Infinity) {
      rec.phase('살피기', '아직 묶음이 없어서 이 미사일로 첫 묶음을 시작합니다.', NARROW_AT.look);
      rec.do(...together([{ type: 'focus', ids: [barId(i)] }, paint(i, 'current')]), wait(300));
    } else {
      rec.phase('살피기', fresh
        ? `시작점 ${josa(s, '이', '가')} hi = ${was} 이상이라, 지금 묶음과 겹치지 않습니다.`
        : `시작점 ${josa(s, '이', '가')} hi = ${was}보다 작아, 지금 묶음과 겹칩니다.`, NARROW_AT.look);
      rec.do(...together([{ type: 'focus', ids: [barId(i)] }, paint(i, 'current')]));
      rec.do({ type: 'arrow', from: `camlab:${last}`, to: barId(i), verdict: fresh ? 'new' : 'good', label: fresh ? `${s} ≥ ${was} 새 묶음` : `${s} < ${was} 겹침` }, wait(450));
    }

    if (fresh) {
      rec.phase('정하기', was === -Infinity
        ? `이 미사일의 끝점 ${e} 바로 왼쪽을 요격 후보로 둡니다. 요격은 ${answer}발입니다.`
        : `지금 묶음의 요격을 ${was}-ε에 확정하고, 끝점 ${e}에서 새 묶음을 시작합니다. 요격은 ${answer}발입니다.`, NARROW_AT.open);
      rec.do(...clear());
      if (was !== -Infinity) {
        rec.do(...camTone(last, 'chosen'));
        rec.do(...together(BY_START.filter((j) => GROUP_OF[j] === last).map((j) => paint(j, 'visited')), true));
      }
      rec.do(...camAdd(cams.length - 1, e, 'queued', barId(i)));
      rec.do(...together([paint(i, 'queued'), count(answer, 'chosen')], true));
    } else {
      rec.phase('정하기', shrinks
        ? `끝점 ${josa(e, '이', '가')} hi = ${was}보다 작아, hi를 ${e}로 줄여 요격 후보를 ${e} 바로 왼쪽으로 옮깁니다.`
        : `끝점 ${josa(e, '이', '가')} hi = ${was}보다 크거나 같아, 요격 후보는 그대로 ${hi}-ε입니다.`, NARROW_AT.narrow);
      rec.do(...clear());
      if (shrinks) rec.do(...camMove(last, e));
      rec.do(paint(i, 'queued'), ...(shrinks ? [] : [wait(250)]));
    }
  });

  cur = undefined;
  rec.step({ title: `요격 ${answer}발`, codeHighlights: NARROW_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `마지막 묶음의 요격도 ${hi}-ε에 확정합니다. 요격은 ${answer}발, 위치는 ${list(cams)}입니다.`);
  rec.do(...together([...cams.flatMap((_, k) => camTone(k, 'path')), count(answer, 'path'), ...BY_START.map((j) => paint(j, 'visited'))]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 끝점 정렬인데 s > last: 살피기 → 정하기, 오답 확인                  */
/* ------------------------------------------------------------------ */

// 요격 위치 e들 중 하나라도 구간 (s, e')를 지나면 그 미사일은 맞는다: s < c ≤ e' (c는 끝점, 실제 위치는 c − ε)
const meets = (cams: number[], i: number) => cams.some((c) => TARGETS[i][0] < c && c <= TARGETS[i][1]);
const TRUTH = (() => {
  let [last, n] = [-Infinity, 0];
  for (const i of BY_END) if (TARGETS[i][0] >= last) [last, n] = [TARGETS[i][1], n + 1];
  return n;
})();

function closedCompare(): Visualization {
  const rec = new PacedRecorder(board());
  const cams: number[] = [];
  let [last, answer, seen] = [-Infinity, 0, 0];
  let cur: [number, number] | undefined;
  const meta = () => ({ work: seen, variables: { s: cur ? cur[0] : '-', e: cur ? cur[1] : '-', last: show(last), answer } });

  sortStep(rec, BY_END, '끝점이 빠른 순서로 정렬하기', '끝점이 빠른 미사일이 위에 오도록 정렬합니다.', CLOSED_AT.sort, meta());
  startStep(rec, '요격 0발, 마지막 요격 위치 없음', '발사 수 answer는 0발, 마지막 요격 위치 last는 아직 없어서 -∞로 둡니다.', CLOSED_AT.init, meta());

  BY_END.forEach((i) => {
    const [s, e] = TARGETS[i];
    const [was, prev] = [last, cams.length - 1];
    const skip = s <= was; // s > last가 아니면 맞힌다고 본다
    seen++;
    cur = [s, e];
    if (!skip) {
      last = e;
      answer++;
      cams.push(e);
    }

    rec.step({ title: `(${s}, ${e}): ${skip ? `${s} ≤ ${was}, 맞힌다고 봄` : `새 요격 ${e}-ε`}`, codeHighlights: skip ? CLOSED_AT.look : CLOSED_AT.install, ...meta() });
    if (was === -Infinity) {
      rec.phase('살피기', '아직 쏜 요격 미사일이 없습니다. 이 미사일은 맞히지 못했습니다.', CLOSED_AT.look);
      rec.do(...together([{ type: 'focus', ids: [barId(i)] }, paint(i, 'current')]), wait(300));
    } else {
      rec.phase('살피기', skip
        ? s === was
          ? `시작점 ${josa(s, '이', '가')} ${josa(was, '과', '와')} 같아 s > last가 거짓이라 맞힌다고 봅니다. 열린 구간이라 사실은 못 맞힙니다.`
          : `시작점 ${josa(s, '이', '가')} ${was} 이하라 맞힌다고 봅니다.`
        : `시작점 ${josa(s, '이', '가')} ${was}보다 커서, ${was} 바로 왼쪽의 요격 미사일은 이 구간에 닿지 못합니다.`, CLOSED_AT.look);
      rec.do(...together([{ type: 'focus', ids: [barId(i)] }, paint(i, 'current')]));
      rec.do({ type: 'arrow', from: `camlab:${prev}`, to: barId(i), verdict: skip ? 'good' : 'new', label: skip ? `${s} ≤ ${was} 맞힌다고 봄` : `${s} > ${was} 새 요격` }, wait(450));
    }

    if (skip) {
      rec.phase('정하기', '새로 쏘지 않고 넘어갑니다.', CLOSED_AT.look);
      rec.do(...clear(paint(i, 'visited')), wait(250));
    } else {
      rec.phase('정하기', `이 미사일의 끝점 ${e} 바로 왼쪽에 새로 쏩니다. 요격은 ${answer}발입니다.`, CLOSED_AT.install);
      rec.do(...clear());
      rec.do(...camAdd(cams.length - 1, e, 'chosen', barId(i)));
      rec.do(...together([paint(i, 'chosen'), count(answer, 'chosen')], true));
    }
  });

  cur = undefined;
  const missed = BY_END.filter((i) => !meets(cams, i));
  rec.step({ title: `이 방법 ${answer}발, 정답은 ${TRUTH}발`, codeHighlights: CLOSED_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('오답 확인', `${answer}발로 끝났지만, 요격 위치 ${list(cams)}를 지나지 않는 미사일이 ${missed.length}개 남습니다(주황색). 정답은 ${TRUTH}발입니다.`);
  rec.do(...together(missed.map((i) => paint(i, 'bad'))));
  rec.do(...together([count(answer, 'bad', `이 방법 ${answer}발`), { type: 'add', item: { id: 'tok:truth', kind: 'token', rect: TRUTH_AT, tone: 'good', text: `정답 ${TRUTH}발` } }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'interception',
  title: '요격 시스템',
  level: 2,
  category: 'greedy',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/181188',
  description: {
    summary:
      'A 나라가 B 나라의 미사일 기지를 향해 폭격 미사일을 쏩니다. 폭격 미사일은 x축 위의 열린 구간 (s, e)를 지나고, 요격 미사일은 어떤 실수 좌표 x에서든 쏠 수 있어 그 좌표가 구간 안(s < x < e)인 폭격 미사일을 모두 맞힙니다. 끝점에서는 맞히지 못합니다. 모든 폭격 미사일을 맞히는 데 필요한 요격 미사일의 최소 수를 구합니다.',
    rules: [
      '폭격 미사일은 1개 이상 500,000개 이하',
      'targets의 각 원소는 [s, e]이고 0 ≤ s < e ≤ 100,000,000',
      '폭격 미사일은 열린 구간 (s, e)이고, 끝점에서는 맞힐 수 없음',
      '요격 미사일은 실수 좌표 어디서나 쏠 수 있음',
    ],
    examples: [{ input: 'targets = [[4, 5], [4, 8], [10, 14], [11, 13], [5, 12], [3, 7], [1, 4]]', output: '3' }],
  },
  keyIntuitions: [
    '끝이 가장 이른 미사일을 맞히려면 그 구간 안에서 쏴야 하고, 가장 오른쪽인 끝점 바로 왼쪽에 쏘면 아직 지나지 않은 다른 미사일을 가장 많이 함께 맞힙니다.',
    '끝점 순서로 정렬해 하나씩 봅니다. 마지막 요격 위치가 이 미사일의 시작점 이하면 닿지 못하므로 새로 쏘고, 아니면 이미 맞힌 것입니다. 끝점에서는 못 맞히니 시작점이 같아도 새로 쏩니다.',
    '단속카메라와 같은 생각이지만 구간이 열려 있습니다. 비교를 s > last로 쓰면 끝점이 맞닿은 미사일을 놓칩니다. 등호를 포함해 s >= last로 써야 합니다.',
  ],
  demo: { input: [TARGETS], label: 'targets = [[3, 6], [9, 12], [2, 3], [1, 10], [9, 13], [6, 9], [2, 4]]' },
  workUnit: '값을 비교한 횟수',
  approaches: [
    {
      id: 'interception-end-sort',
      name: '끝점 기준 정렬',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '끝점이 빠른 미사일부터 보며, 마지막 요격이 닿지 못하는 미사일의 끝점 바로 왼쪽에 새로 쏘는 풀이입니다.',
      pros: [
        '정렬한 뒤에는 한 번만 훑으면 되어 O(N)이라, 미사일 50만 개도 순식간입니다.',
        '마지막 요격 위치 하나만 기억하면 됩니다.',
        '코드가 짧고 분기가 하나뿐입니다.',
      ],
      cons: [
        '구간이 열려 있어서 비교에 등호를 넣어야 한다는 점을 놓치기 쉽습니다.',
        '시작점이 아니라 끝점으로 정렬해야 한다는 발상이 필요합니다.',
      ],
      whyThisRank:
        '가장 먼저 끝나는 미사일을 맞히려면 그 끝점 바로 왼쪽에 쏘는 것이 아직 끝나지 않은 미사일을 가장 많이 함께 맞히는 선택입니다. 그래서 끝점이 가장 빠른 미사일부터 그 끝점에 쏘는 것이 항상 안전합니다.',
      code: END_SORT,
      visualize: endSort,
    },
    {
      id: 'interception-start-narrow',
      name: '시작점 정렬 + 요격 위치 줄이기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '시작점 순으로 정렬하고, 겹치는 미사일을 한 묶음으로 보며 요격 위치를 가장 이른 끝점으로 줄여 가는 풀이입니다.',
      pros: [
        '정석과 같은 O(N log N)이고 답도 같습니다.',
        '"겹치는 미사일은 한 발로 맞힌다"는 설명이 그림으로 바로 이해됩니다.',
      ],
      cons: [
        '겹칠 때마다 min으로 요격 위치를 줄여야 해서, 정석보다 신경 쓸 것이 하나 늘어납니다.',
        'min을 빼먹으면 시작점 정렬 + 첫 미사일의 끝점에 쏘는 틀린 풀이가 됩니다.',
      ],
      whyThisRank:
        '정렬 기준만 시작점으로 바꿔도 풀 수 있지만, 먼저 끝나는 미사일의 끝점을 따로 챙겨야 합니다. 끝점 기준 정렬은 그 일을 정렬이 대신해 줍니다.',
      code: START_NARROW,
      visualize: startNarrow,
    },
    {
      id: 'interception-closed-compare',
      name: '끝점 정렬인데 닫힌 구간처럼 비교',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '단속카메라처럼 끝점 정렬로 풀지만 비교를 s > last로 써서, 끝점이 맞닿은 미사일을 맞혔다고 착각하는 풀이입니다.',
      pros: ['단속카메라 풀이에서 비교 한 군데만 다르고, 끝점이 맞닿지 않은 입력은 모두 맞힙니다.'],
      cons: [
        '요격 미사일은 끝점에서 맞히지 못하므로, 시작점이 마지막 요격 위치(그 끝점 바로 왼쪽)와 같으면 맞히지 못합니다.',
        'targets = [[1, 3], [3, 6]]이면 정답은 2발인데 1발이 나옵니다. 공식 예제도 2발이 나와 틀립니다.',
      ],
      whyThisRank:
        '이 문제의 구간은 열려 있습니다. 단속카메라는 끝점에 카메라가 있어도 만난 것으로 쳤지만, 요격 시스템은 끝점에서는 맞히지 못하므로 비교의 등호가 정반대입니다.',
      code: CLOSED,
      visualize: closedCompare,
    },
  ],
  checks: {
    cases: [
      { args: [[[4, 5], [4, 8], [10, 14], [11, 13], [5, 12], [3, 7], [1, 4]]], expected: 3 },
      { args: [[[0, 1]]], expected: 1 },
      { args: [[[0, 100000000], [0, 100000000]]], expected: 1 },
      { args: [[[1, 3], [3, 6]]], expected: 2 },
      { args: [[[1, 4], [2, 5], [3, 6]]], expected: 1 },
      { args: [[[1, 2], [3, 4], [5, 6]]], expected: 3 },
      { args: [[[0, 10], [1, 2], [3, 4]]], expected: 2 },
      { args: [TARGETS], expected: 4 },
    ],
    // 미사일 1~8개, 0 ≤ s < e ≤ 10(끝점이 맞닿는 경우가 자주 나온다)
    random: (rand) => [
      Array.from({ length: 1 + Math.floor(rand() * 8) }, () => {
        const s = Math.floor(rand() * 10);
        return [s, s + 1 + Math.floor(rand() * Math.min(5, 10 - s))];
      }),
    ],
  },
};

export default problem;
