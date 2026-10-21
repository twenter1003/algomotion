// 카펫: 정석 약수 쌍(세로 3 ~ √전체), 대안 근의 공식, 함정 갈색 칸 수만 보고 정사각형에 가깝게 정하기.
// 장면은 위에 세로 후보 줄(정석)이나 식 칸(대안·함정), 가운데 카펫 그림, 아래에 갈색·노랑·전체 칸 수 표시다.
// 카펫은 칸 5개(갈색 테두리 4조각 + 안쪽 노랑)를 칸 수에 맞는 크기로 그려서, 가로가 길어도 한 판에 들어온다.
import type { Action, Item, ItemPatch, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';
import { holdCaptions } from './common.ts';

// 시각화 입력. 전체 112칸의 약수 쌍 28×4, 16×7, 14×8 가운데 세 번째가 답이고, 갈색 40칸만 보면 11×11이 정사각형에 가장 가깝다.
const BROWN = 40;
const YELLOW = 72;
const TOTAL = BROWN + YELLOW;
const isqrt = (n: number) => Math.floor(Math.sqrt(n));
const ROOT = isqrt(TOTAL); // 10
const SUM = (BROWN + 4) / 2; // 가로 + 세로 = 22
const inner = (w: number, h: number) => (w - 2) * (h - 2);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const DIVISORS = {
  python: `from math import isqrt

def solution(brown, yellow):
    total = brown + yellow  # 카펫 전체 칸 수 = 가로 × 세로

    # 세로(작은 쪽)를 3부터 √total까지 하나씩 정해 봅니다
    for height in range(3, isqrt(total) + 1):
        if total % height != 0:
            continue  # 나누어떨어지지 않으면 직사각형이 안 됩니다
        width = total // height
        # 갈색 한 겹을 빼면 안쪽 노란 칸은 (가로 - 2) × (세로 - 2)
        if (width - 2) * (height - 2) == yellow:
            return [width, height]`,
  javascript: `function solution(brown, yellow) {
  const total = brown + yellow; // 카펫 전체 칸 수 = 가로 × 세로

  // 세로(작은 쪽)를 3부터 √total까지 하나씩 정해 봅니다
  for (let height = 3; height * height <= total; height++) {
    if (total % height !== 0) continue; // 나누어떨어지지 않으면 직사각형이 안 됩니다
    const width = total / height;
    // 갈색 한 겹을 빼면 안쪽 노란 칸은 (가로 - 2) × (세로 - 2)
    if ((width - 2) * (height - 2) === yellow) return [width, height];
  }
}`,
};
const DIV_AT = {
  start: lines(DIVISORS, ['total = brown + yellow'], ['const total = brown + yellow']),
  check: lines(DIVISORS, ['for height in range(3', 'if total % height != 0'], ['for (let height = 3', 'if (total % height !== 0)']),
  skip: lines(DIVISORS, ['for height in range(3', 'if total % height != 0', 'continue'], ['for (let height = 3', 'if (total % height !== 0) continue']),
  draw: lines(DIVISORS, ['width = total // height'], ['const width = total / height']),
  yellow: lines(DIVISORS, ['if (width - 2) * (height - 2) == yellow'], ['if ((width - 2) * (height - 2) === yellow)']),
  found: lines(DIVISORS, ['if (width - 2) * (height - 2) == yellow', 'return [width, height]'], ['if ((width - 2) * (height - 2) === yellow) return [width, height]']),
};

const ROOTS = {
  python: `from math import isqrt

def solution(brown, yellow):
    # 둘레: 2 × (가로 + 세로) - 4 = brown → 가로 + 세로 = s
    s = (brown + 4) // 2
    # 넓이: 가로 × 세로 = brown + yellow = p
    p = brown + yellow
    # 합이 s, 곱이 p인 두 수는 x² - s·x + p = 0의 두 근입니다
    root = isqrt(s * s - 4 * p)
    return [(s + root) // 2, (s - root) // 2]`,
  javascript: `function solution(brown, yellow) {
  // 둘레: 2 × (가로 + 세로) - 4 = brown → 가로 + 세로 = s
  const s = (brown + 4) / 2;
  // 넓이: 가로 × 세로 = brown + yellow = p
  const p = brown + yellow;
  // 합이 s, 곱이 p인 두 수는 x² - s·x + p = 0의 두 근입니다
  const root = Math.round(Math.sqrt(s * s - 4 * p));
  return [(s + root) / 2, (s - root) / 2];
}`,
};
const ROOT_AT = {
  sum: lines(ROOTS, ['s = (brown + 4) // 2', 'p = brown + yellow'], ['const s = (brown + 4) / 2', 'const p = brown + yellow']),
  root: lines(ROOTS, ['root = isqrt(s * s - 4 * p)'], ['const root = Math.round(Math.sqrt(s * s - 4 * p))']),
  pair: lines(ROOTS, ['return [(s + root) // 2, (s - root) // 2]'], ['return [(s + root) / 2, (s - root) / 2]']),
};

const SQUARE = {
  python: `# 주의: 갈색 칸 수만 보고 가로, 세로를 정사각형에 가깝게 나누는 오답 풀이입니다
def solution(brown, yellow):
    # 가로 + 세로 = (brown + 4) / 2 까지만 알 수 있는데, 노랑은 쓰지 않습니다
    s = (brown + 4) // 2
    return [(s + 1) // 2, s // 2]  # 가장 정사각형에 가깝게`,
  javascript: `// 주의: 갈색 칸 수만 보고 가로, 세로를 정사각형에 가깝게 나누는 오답 풀이입니다
function solution(brown, yellow) {
  // 가로 + 세로 = (brown + 4) / 2 까지만 알 수 있는데, 노랑은 쓰지 않습니다
  const s = (brown + 4) / 2;
  return [Math.ceil(s / 2), Math.floor(s / 2)]; // 가장 정사각형에 가깝게
}`,
};
const SQUARE_AT = {
  sum: lines(SQUARE, ['s = (brown + 4) // 2'], ['const s = (brown + 4) / 2']),
  split: lines(SQUARE, ['return [(s + 1) // 2, s // 2]'], ['return [Math.ceil(s / 2), Math.floor(s / 2)]']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 세로: 안내 글 0~18, 후보 줄 22~66(식 칸은 22~76), 계산 글 80~106, 카펫 그림 116~256, 칸 수 표시 270~300, 함정의 답 비교 308~338.
// 가로: 후보 칸은 44px에 6px 간격으로 8개가 13~407. 카펫 그림은 30~390 안에서 가운데로 맞춘다.
const W = 420;
const H = 346;
const AREA: Rect = { x: 30, y: 116, w: 360, h: 140 };
const hCell = (h: number) => `h:${h}`;
const hRect = (i: number): Rect => ({ x: 13 + i * 50, y: 24, w: 44, h: 44 });
const TOKEN_Y = 270;
const tokenRect = (i: number): Rect => ({ x: 10 + i * 100, y: TOKEN_Y, w: 92, h: 30 });
const PIECES = ['top', 'bottom', 'left', 'right', 'in'] as const;
const cid = (piece: (typeof PIECES)[number]) => `c:${piece}`;

// 가로 w × 세로 h 카펫을 칸 한 변 u로 그린 다섯 조각의 자리
function carpetRects(w: number, h: number): Record<(typeof PIECES)[number], Rect> {
  const u = Math.min(AREA.w / w, AREA.h / h);
  const x0 = AREA.x + (AREA.w - w * u) / 2;
  const y0 = AREA.y + (AREA.h - h * u) / 2;
  return {
    top: { x: x0, y: y0, w: w * u, h: u },
    bottom: { x: x0, y: y0 + (h - 1) * u, w: w * u, h: u },
    left: { x: x0, y: y0 + u, w: u, h: (h - 2) * u },
    right: { x: x0 + (w - 1) * u, y: y0 + u, w: u, h: (h - 2) * u },
    in: { x: x0 + u, y: y0 + u, w: (w - 2) * u, h: (h - 2) * u },
  };
}
const carpetItem = (piece: (typeof PIECES)[number], rect: Rect): Item =>
  ({ id: cid(piece), kind: 'cell', rect, tone: piece === 'in' ? 'current' : 'wall' });
// 처음이면 그 자리에 나타나고, 그 뒤로는 새 크기로 미끄러진다
const drawCarpet = (rec: StepRecorder, w: number, h: number): Action[] => {
  const rects = carpetRects(w, h);
  return together(PIECES.map((p): Action => (rec.has(cid(p)) ? { type: 'set', id: cid(p), patch: { rect: rects[p] } } : { type: 'add', item: carpetItem(p, rects[p]) })));
};

function board(top: Item[], bottomExtra: Item[] = []): Scene {
  return {
    width: W,
    height: H,
    items: [
      ...top,
      { id: 'calc', kind: 'text', rect: { x: 10, y: 80, w: 400, h: 26 }, text: '' },
      { id: 't:brown', kind: 'token', rect: tokenRect(0), tone: 'plain', text: `갈색 ${BROWN}` },
      { id: 't:yellow', kind: 'token', rect: tokenRect(1), tone: 'plain', text: `노랑 ${YELLOW}` },
      ...bottomExtra,
    ],
  };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const set = (id: string, patch: ItemPatch, pop = false): Action => ({ type: 'set', id, patch, ...(pop ? { pop } : {}) });
const tone = (id: string, t: Tone) => set(id, { tone: t });
const calcTo = (text: string) => set('calc', { text });
const token = (id: string, i: number, t: Tone, text: string): Item => ({ id, kind: 'token', rect: tokenRect(i), tone: t, text });
// 안쪽 노랑에서 노랑 칸 수 표시로 화살표를 긋는다
const checkYellow = (w: number, h: number): Action => {
  const ok = inner(w, h) === YELLOW;
  return { type: 'arrow', from: cid('in'), to: 't:yellow', verdict: (ok ? 'good' : 'bad') as Verdict, label: `${inner(w, h)}칸 ${ok ? '=' : '≠'} 노랑 ${YELLOW}칸` };
};

interface Meta { work: number; variables: Record<string, string | number> }

/* ------------------------------------------------------------------ */
/* 정석: 약수 확인 → 카펫 그리기 → 노랑 확인                              */
/* ------------------------------------------------------------------ */

function divisorPairs(): Visualization {
  const items: Item[] = [{ id: 'h:label', kind: 'text', rect: { x: 10, y: 0, w: 400, h: 20 }, tone: 'muted', text: `세로 h를 3부터 ${ROOT}까지 (${ROOT} × ${ROOT} ≤ ${TOTAL})` }];
  for (let h = 3; h <= ROOT; h++) items.push({ id: hCell(h), kind: 'cell', rect: hRect(h - 3), tone: 'plain', text: String(h) });
  const rec = new StepRecorder(board(items));
  let checked = 0;
  let h = 0;
  let w: number | undefined;
  let yellowCells: number | undefined;
  const meta = (): Meta => ({
    work: checked,
    variables: { total: TOTAL, height: h || '-', width: w ?? '-', '노랑 칸': yellowCells ?? '-' },
  });

  rec.step({ title: `전체 칸 수 total = ${BROWN} + ${YELLOW} = ${TOTAL}`, codeHighlights: DIV_AT.start, ...meta() });
  rec.phase('시작', `카펫 전체는 갈색 ${BROWN}칸과 노랑 ${YELLOW}칸을 합친 ${TOTAL}칸이고, 이것이 가로 × 세로입니다. 가로 × 세로가 ${TOTAL}인 직사각형을 세로부터 하나씩 만들어 봅니다.`);
  rec.do({ type: 'add', item: token('t:total', 2, 'chosen', `전체 ${TOTAL}`), from: 't:yellow' }, calcTo(`${BROWN} + ${YELLOW} = ${TOTAL}칸`));

  for (let c = 3; c <= ROOT; c++) {
    checked++;
    h = c;
    const divisible = TOTAL % c === 0;
    w = divisible ? TOTAL / c : undefined;
    yellowCells = w === undefined ? undefined : inner(w, c);
    const found = w !== undefined && inner(w, c) === YELLOW;
    const q = Math.floor(TOTAL / c);
    const r = TOTAL % c;

    rec.step({
      title: !divisible ? `세로 ${c}: 나누어떨어지지 않아 건너뜀` : `세로 ${c}, 가로 ${w}: 노랑 ${yellowCells}칸 ${found ? '= 맞음' : '≠ 아님'}`,
      codeHighlights: !divisible ? DIV_AT.skip : found ? DIV_AT.found : DIV_AT.yellow,
      ...meta(),
    });
    rec.phase('약수 확인', divisible
      ? `${TOTAL} ÷ ${c} = ${w}, 나머지가 0이라 나누어떨어집니다. 세로가 ${c}칸이면 가로는 ${w}칸입니다.`
      : `${TOTAL} ÷ ${c} = ${q} … ${r}, 나머지가 ${josa(r, '이라', '라')} 나누어떨어지지 않습니다.`, divisible ? DIV_AT.check : DIV_AT.skip);
    rec.do(...together([tone(hCell(c), 'current'), calcTo(divisible ? `${TOTAL} ÷ ${c} = ${w}` : `${TOTAL} ÷ ${c} = ${q} … ${r}`)]));
    if (!divisible) {
      rec.phase('건너뛰기', `나누어떨어지지 않으면 가로가 정수가 되지 않아 직사각형이 안 됩니다. 세로 ${josa(c, '은', '는')} 건너뜁니다.`, DIV_AT.skip);
      rec.do(tone(hCell(c), 'explored'));
      continue;
    }

    rec.phase('카펫 그리기', `가로 ${w} × 세로 ${c} 카펫을 그립니다. 가장자리 한 겹은 갈색이고 안쪽은 노랑입니다.`, DIV_AT.draw);
    rec.do(...drawCarpet(rec, w!, c), calcTo(`${w} × ${c} = ${TOTAL}칸 카펫`));

    rec.phase('노랑 확인', `안쪽 노란 칸은 (${w} − 2) × (${c} − 2) = ${yellowCells}칸입니다. 노랑 ${YELLOW}칸${found ? '과 같으니 이 카펫이 답입니다.' : '과 다릅니다. 다음 세로로 넘어갑니다.'}`, found ? DIV_AT.found : DIV_AT.yellow);
    rec.do(...together([{ type: 'focus', ids: [hCell(c), ...PIECES.map(cid)] }, calcTo(`(${w} − 2) × (${c} − 2) = ${yellowCells}`)]));
    rec.do(checkYellow(w!, c), wait(300));
    rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }, tone(hCell(c), found ? 'path' : 'bad')]));
    if (found) break;
  }

  rec.step({ title: `[${w}, ${h}] 반환`, codeHighlights: DIV_AT.found, ...meta(), answer: [w, h], isKeyframe: true });
  rec.phase('답', `세로 ${h}, 가로 ${w}에서 노란 칸이 ${YELLOW}칸으로 맞아 ${josa(`[${w}, ${h}]`, '을', '를')} 돌려주고 반복을 마칩니다. ${checked}번만 확인했습니다.${h < ROOT ? ` 세로 ${h + 1}부터 ${ROOT}까지는 볼 필요가 없었습니다.` : ''}`);
  rec.do(...together([tone(cid('in'), 'path'), tone('t:total', 'plain')]));
  rec.do({ type: 'add', item: token('t:answer', 3, 'path', `답 [${w}, ${h}]`) });
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 근의 공식: 식 세우기 → 근 구하기 → 확인하기                       */
/* ------------------------------------------------------------------ */

const formulaCell = (id: string, i: number, text: string, tag: string): Item =>
  ({ id, kind: 'cell', rect: { x: 10 + i * 78, y: 22, w: 66, h: 54 }, tone: 'plain', text, tag });

function quadratic(): Visualization {
  const p = TOTAL;
  const disc = SUM * SUM - 4 * p;
  const root = Math.round(Math.sqrt(disc));
  const [w, h] = [(SUM + root) / 2, (SUM - root) / 2];
  const rec = new StepRecorder(board([]));
  let known = 0; // 지금까지 구한 값(0 식 전, 1 합·곱, 2 √, 3 가로·세로)
  let done = 0;
  const meta = (): Meta => ({
    work: done,
    variables: {
      s: known >= 1 ? SUM : '-',
      p: known >= 1 ? p : '-',
      root: known >= 2 ? root : '-',
      가로: known >= 3 ? w : '-',
      세로: known >= 3 ? h : '-',
    },
  });

  known = 1;
  done = 1;
  rec.step({ title: `가로 + 세로 = ${SUM}, 가로 × 세로 = ${p}`, codeHighlights: ROOT_AT.sum, ...meta() });
  rec.phase('식 세우기', `갈색은 테두리 한 바퀴라 2 × (가로 + 세로) − 4 = ${BROWN}, 곧 가로 + 세로 = ${SUM}입니다. 전체 칸은 가로 × 세로 = ${BROWN} + ${YELLOW} = ${p}입니다.`, ROOT_AT.sum);
  rec.do({ type: 'add', item: formulaCell('v:s', 0, String(SUM), '가로 + 세로'), from: 't:brown' });
  rec.do({ type: 'add', item: formulaCell('v:p', 1, String(p), '가로 × 세로'), from: 't:yellow' }, calcTo(`합 ${SUM}, 곱 ${p}인 두 수를 찾습니다`));

  known = 2;
  rec.step({ title: `판별식 ${SUM}² − 4 × ${p} = ${disc}, √${disc} = ${root}`, codeHighlights: ROOT_AT.root, ...meta() });
  rec.phase('근 구하기', `합이 ${SUM}이고 곱이 ${p}인 두 수는 x² − ${SUM}x + ${p} = 0의 두 근입니다. 근의 공식에 쓸 판별식은 ${SUM}² − 4 × ${p} = ${disc}이고, 제곱근은 ${root}입니다.`, ROOT_AT.root);
  rec.do({ type: 'add', item: formulaCell('v:root', 2, String(root), '√판별식'), from: 'v:p' }, calcTo(`${SUM}² − 4 × ${p} = ${disc}  →  √${disc} = ${root}`));

  known = 3;
  rec.step({ title: `가로 = (${SUM} + ${root}) ÷ 2 = ${w}, 세로 = (${SUM} − ${root}) ÷ 2 = ${h}`, codeHighlights: ROOT_AT.pair, ...meta() });
  rec.phase('근 구하기', `가로는 (${SUM} + ${root}) ÷ 2 = ${w}, 세로는 (${SUM} − ${root}) ÷ 2 = ${h}입니다. 반복 없이 식 하나로 두 길이가 나왔습니다.`, ROOT_AT.pair);
  rec.do(...together([
    { type: 'add', item: formulaCell('v:w', 3, String(w), '가로'), from: 'v:root' } as Action,
    { type: 'add', item: formulaCell('v:h', 4, String(h), '세로'), from: 'v:root' } as Action,
  ]));
  rec.do(...drawCarpet(rec, w, h), calcTo(`가로 ${w} × 세로 ${h} 카펫`));

  rec.step({ title: `[${w}, ${h}] 확인`, codeHighlights: ROOT_AT.pair, ...meta(), answer: [w, h], isKeyframe: true });
  rec.phase('확인하기', `이 카펫의 안쪽 노란 칸은 (${w} − 2) × (${h} − 2) = ${inner(w, h)}칸으로 노랑 ${YELLOW}칸과 맞습니다. [${w}, ${h}]입니다. 다만 입력이 늘 올바른 카펫이라는 가정이 있어야 쓸 수 있는 풀이입니다.`, ROOT_AT.pair);
  rec.do(calcTo(`(${w} − 2) × (${h} − 2) = ${inner(w, h)}`));
  rec.do(checkYellow(w, h), wait(300));
  rec.do(...together([{ type: 'clearMarks' }, tone(cid('in'), 'path')]));
  rec.do({ type: 'add', item: token('t:answer', 2, 'path', `답 [${w}, ${h}]`) });
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정 정사각형 가정: 합 구하기 → 정사각형으로 나누기 → 확인하기          */
/* ------------------------------------------------------------------ */

function squarest(): Visualization {
  const [w, h] = [Math.ceil(SUM / 2), Math.floor(SUM / 2)];
  const truth = [14, 8]; // 정석의 답. 이 입력의 정석은 divisorPairs가 보인다
  const rec = new StepRecorder(board([]));
  const meta = (s?: number): Meta => ({ work: s === undefined ? 0 : 1, variables: { s: s ?? '-', 가로: s === undefined ? '-' : w, 세로: s === undefined ? '-' : h } });

  rec.step({ title: `가로 + 세로 = ${SUM}`, codeHighlights: SQUARE_AT.sum, ...meta(SUM) });
  rec.phase('합 구하기', `갈색은 테두리 한 바퀴라 2 × (가로 + 세로) − 4 = ${BROWN}, 곧 가로 + 세로 = ${SUM}입니다. 여기까지는 맞습니다. 하지만 합만으로는 가로와 세로가 정해지지 않습니다.`, SQUARE_AT.sum);
  rec.do({ type: 'add', item: formulaCell('v:s', 0, String(SUM), '가로 + 세로'), from: 't:brown' }, calcTo(`2 × (가로 + 세로) − 4 = ${BROWN}`));

  rec.step({ title: `${josa(SUM, '을', '를')} 반으로 나눠 가로 ${w}, 세로 ${h}`, codeHighlights: SQUARE_AT.split, ...meta(SUM) });
  rec.phase('정사각형으로 나누기', `카펫은 정사각형에 가까울 것이라고 짐작해 ${josa(SUM, '을', '를')} 반으로 나눕니다. 가로 ${w}, 세로 ${h}입니다. 노랑 칸 수는 쓰지 않았습니다.`, SQUARE_AT.split);
  rec.do(...together([
    { type: 'add', item: formulaCell('v:w', 1, String(w), '가로'), from: 'v:s' } as Action,
    { type: 'add', item: formulaCell('v:h', 2, String(h), '세로'), from: 'v:s' } as Action,
  ]));
  rec.do(...drawCarpet(rec, w, h), calcTo(`가로 ${w} × 세로 ${h} 카펫`));

  rec.step({ title: `[${w}, ${h}] 반환 — 정답은 [${truth.join(', ')}]`, codeHighlights: SQUARE_AT.split, ...meta(SUM), answer: [w, h], isKeyframe: true });
  rec.phase('확인하기', `${josa(`[${w}, ${h}]`, '을', '를')} 돌려줍니다. 그런데 이 카펫의 노란 칸은 (${w} − 2) × (${h} − 2) = ${inner(w, h)}칸이라 노랑 ${YELLOW}칸과 다릅니다. 정답은 [${truth.join(', ')}]입니다. 갈색과 노랑을 둘 다 맞춰야 합니다.`, SQUARE_AT.split);
  rec.do(calcTo(`(${w} − 2) × (${h} − 2) = ${inner(w, h)}`));
  rec.do(checkYellow(w, h), wait(300));
  rec.do(...together([{ type: 'clearMarks' }, tone(cid('in'), 'bad')]));
  // 답 글씨가 길어 칸 수 표시 아래 둘째 줄에 넓게 둔다
  rec.do({ type: 'add', item: { id: 't:answer', kind: 'token', rect: { x: 10, y: 308, w: 200, h: 30 }, tone: 'bad', text: `내 답 [${w}, ${h}]` } });
  rec.do({ type: 'add', item: { id: 't:truth', kind: 'token', rect: { x: 216, y: 308, w: 194, h: 30 }, tone: 'good', text: `정답 [${truth.join(', ')}]` } });
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'carpet',
  title: '카펫',
  level: 2,
  category: 'brute-force',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42842',
  description: {
    summary:
      '가장자리 한 겹은 갈색 격자, 안쪽은 노란 격자로 채운 직사각형 카펫이 있습니다. 갈색 격자의 수와 노란 격자의 수가 주어질 때 카펫의 가로, 세로 길이를 [가로, 세로] 순서로 구합니다. 가로는 세로와 같거나 더 깁니다.',
    rules: [
      '갈색 격자의 수 brown은 8 이상 5,000 이하의 자연수',
      '노란색 격자의 수 yellow는 1 이상 2,000,000 이하의 자연수',
      '카펫의 가로 길이는 세로 길이와 같거나 세로 길이보다 김',
    ],
    examples: [
      { input: 'brown = 10, yellow = 2', output: '[4, 3]' },
      { input: 'brown = 8, yellow = 1', output: '[3, 3]' },
      { input: 'brown = 24, yellow = 24', output: '[8, 6]' },
    ],
  },
  keyIntuitions: [
    '카펫 전체 칸 수는 brown + yellow이고 이것이 가로 × 세로입니다. 그래서 (가로, 세로)는 전체 칸 수의 약수 쌍 가운데 하나입니다.',
    '약수 쌍 하나를 정하면 안쪽 노란 칸은 (가로 − 2) × (세로 − 2)로 정해집니다. 이 값이 yellow와 같은 쌍이 답입니다. 갈색 칸 수만으로는 답이 하나로 정해지지 않습니다.',
    '세로를 3부터 √(전체 칸 수)까지만 보면 가로 ≥ 세로가 지켜지고 쌍을 한 번씩만 봅니다. 전체가 200만 칸이어도 1,500번이 안 됩니다.',
  ],
  demo: { input: [BROWN, YELLOW], label: 'brown = 40, yellow = 72' },
  workUnit: '확인한 후보 수',
  approaches: [
    {
      id: 'carpet-divisors',
      name: '전체 칸 수의 약수 쌍을 하나씩 확인',
      rank: 'BEST',
      timeComplexity: 'O(√(brown + yellow))',
      spaceComplexity: 'O(1)',
      verdict: '세로를 3부터 √전체까지 정해 보며, 안쪽 노랑 칸 수가 맞는 약수 쌍을 찾습니다.',
      pros: [
        '세로가 √전체 이하라 가로 ≥ 세로가 저절로 지켜지고, 약수 쌍을 한 번씩만 봅니다.',
        '전체 칸이 200만이어도 반복이 1,500번이 안 되어 충분히 빠릅니다.',
        '식 하나만 확인하면 되어 틀리기 어렵습니다.',
      ],
      cons: ['"갈색 + 노랑 = 가로 × 세로"와 "노랑 = (가로 − 2) × (세로 − 2)" 두 식을 떠올려야 합니다.'],
      whyThisRank: '완전탐색이 필요한 만큼만 탐색하면서도 식이 단순해 가장 안전합니다. 수학을 쓰는 풀이보다 입력 가정에 덜 기댑니다.',
      code: DIVISORS,
      visualize: divisorPairs,
    },
    {
      id: 'carpet-quadratic',
      name: '근의 공식으로 한 번에 계산',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      verdict: '둘레와 넓이로 합과 곱을 구해 이차방정식의 두 근으로 가로, 세로를 바로 구합니다.',
      pros: ['반복문이 없어 계산이 한 번이면 끝납니다.', '입력이 아무리 커도 시간이 변하지 않습니다.'],
      cons: [
        '식 세우기와 근의 공식을 정확히 써야 하고, 판별식이 완전제곱수라는 가정에 기댑니다.',
        '실수 제곱근을 쓰면 반올림 오차에 주의해야 합니다(정수 제곱근을 쓰면 안전합니다).',
        '완전탐색 유형의 풀이 감각을 연습하기에는 맞지 않습니다.',
      ],
      whyThisRank: '더 빠르지만 이 문제의 반복은 1,500번이 안 되어 속도 이득이 없습니다. 수식 실수 위험을 감수할 이유가 없어 대안으로 둡니다.',
      code: ROOTS,
      visualize: quadratic,
    },
    {
      id: 'carpet-square',
      name: '갈색만 보고 정사각형에 가깝게 나누기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      verdict: '갈색 칸 수로 가로 + 세로만 알 수 있는데, 노랑을 보지 않고 정사각형이라 짐작해 오답이 나옵니다.',
      pros: ['코드가 두 줄이고 반복이 없습니다.', '카펫이 정사각형일 때는 우연히 맞습니다.'],
      cons: [
        '갈색 40칸이면 가로 + 세로 = 22인 카펫은 11×11, 14×8, 16×6 …으로 여러 가지인데, 노랑 칸 수를 쓰지 않아 어느 것인지 가릴 수 없습니다.',
        '예제 (10, 2)와 (8, 1)은 가로와 세로가 거의 같아 우연히 맞지만, (24, 24)는 [7, 7]이 나와 정답 [8, 6]과 다릅니다.',
      ],
      whyThisRank:
        '갈색 칸 수는 가로 + 세로를 알려 줄 뿐입니다. 노랑 칸 수까지 맞는 쌍을 골라야 하므로, 후보를 만들어 두 조건을 모두 확인해야 합니다.',
      code: SQUARE,
      visualize: squarest,
    },
  ],
  checks: {
    cases: [
      { args: [10, 2], expected: [4, 3] },
      { args: [8, 1], expected: [3, 3] },
      { args: [24, 24], expected: [8, 6] },
      { args: [12, 3], expected: [5, 3] },
      { args: [20, 16], expected: [6, 6] },
      { args: [5000, 999000], expected: [2000, 502] },
      { args: [BROWN, YELLOW], expected: [14, 8] },
    ],
    // 카펫(가로 3~20, 세로 3~가로)에서 brown과 yellow를 만든다
    random: (rand) => {
      const w = 3 + Math.floor(rand() * 18);
      const h = 3 + Math.floor(rand() * (w - 2));
      return [2 * (w + h) - 4, (w - 2) * (h - 2)];
    },
  },
};

export default problem;
