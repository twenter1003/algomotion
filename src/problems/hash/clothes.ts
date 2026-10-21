// 의상: 정석 종류별로 세어 (개수 + 1)을 곱하기, 대안 종류 목록을 만들고 종류마다 의상을 다시 세기, 함정 개수를 그냥 곱하기(안 입는 경우를 빼먹음)를 같은 장면에서 움직인다.
// 장면은 왼쪽에 의상 목록(토큰), 오른쪽에 종류 → 개수 표(위 줄 종류 칸, 아래 줄 개수 칸), 표 아래 곱 토큰이다.
// 표 위쪽에는 지금 살피는 의상을 든 토큰이 하나 내려온다.
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';

// 시각화 입력. 종류는 headgear 3벌, eyewear 2벌, face 2벌이라 정석은 4 × 3 × 3 − 1 = 35, 함정은 3 × 2 × 2 = 12가 나온다.
const CLOTHES: [string, string][] = [
  ['cap', 'headgear'], ['glasses', 'eyewear'], ['hat', 'headgear'], ['mask', 'face'],
  ['beanie', 'headgear'], ['goggles', 'eyewear'], ['makeup', 'face'],
];
const N = CLOTHES.length;
const KINDS = [...new Set(CLOTHES.map(([, kind]) => kind))]; // 처음 나온 차례
const COUNTS = KINDS.map((kind) => CLOTHES.filter(([, k]) => k === kind).length);
const RIGHT = COUNTS.reduce((a, c) => a * (c + 1), 1) - 1;
const dictText = (m: Map<string, number>) => `{${[...m].map(([k, c]) => `${k}: ${c}`).join(', ')}}`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const COUNT = {
  python: `def solution(clothes):
    count = {}
    for name, kind in clothes:
        count[kind] = count.get(kind, 0) + 1   # 종류별 의상 개수

    answer = 1
    for c in count.values():
        answer *= c + 1                          # 안 입는 경우까지 c + 1가지
    return answer - 1                            # 아무것도 안 입는 경우는 빼기`,
  javascript: `function solution(clothes) {
  const count = new Map();
  for (const [name, kind] of clothes) {
    count.set(kind, (count.get(kind) ?? 0) + 1); // 종류별 의상 개수
  }

  let answer = 1;
  for (const c of count.values()) {
    answer *= c + 1; // 안 입는 경우까지 c + 1가지
  }
  return answer - 1; // 아무것도 안 입는 경우는 빼기
}`,
};
const COUNT_AT = {
  pick: lines(COUNT, ['for name, kind in clothes:'], ['for (const [name, kind] of clothes)']),
  update: lines(COUNT, ['count[kind] = count.get(kind, 0) + 1'], ['count.set(kind, (count.get(kind) ?? 0) + 1)']),
  init: lines(COUNT, ['answer = 1', 'for c in count.values():'], ['let answer = 1', 'for (const c of count.values())']),
  loop: lines(COUNT, ['for c in count.values():'], ['for (const c of count.values())']),
  multiply: lines(COUNT, ['answer *= c + 1'], ['answer *= c + 1']),
  done: lines(COUNT, ['return answer - 1'], ['return answer - 1']),
};

const RECOUNT = {
  python: `def solution(clothes):
    kinds = []
    for name, kind in clothes:
        if kind not in kinds:                  # 처음 보는 종류만 목록에 넣기
            kinds.append(kind)

    answer = 1
    for kind in kinds:
        # 종류마다 의상 전체를 처음부터 다시 훑어 센다
        count = sum(1 for name, k in clothes if k == kind)
        answer *= count + 1
    return answer - 1`,
  javascript: `function solution(clothes) {
  const kinds = [];
  for (const [name, kind] of clothes) {
    if (!kinds.includes(kind)) kinds.push(kind); // 처음 보는 종류만 목록에 넣기
  }

  let answer = 1;
  for (const kind of kinds) {
    // 종류마다 의상 전체를 처음부터 다시 훑어 센다
    const count = clothes.filter(([name, k]) => k === kind).length;
    answer *= count + 1;
  }
  return answer - 1;
}`,
};
const RECOUNT_AT = {
  collect: lines(RECOUNT, ['kinds = []', 'for name, kind in clothes:', 'if kind not in kinds', 'kinds.append(kind)'],
    ['const kinds = []', 'for (const [name, kind] of clothes)', 'if (!kinds.includes(kind))']),
  pick: lines(RECOUNT, ['answer = 1', 'for kind in kinds:'], ['let answer = 1', 'for (const kind of kinds)']),
  loop: lines(RECOUNT, ['for kind in kinds:'], ['for (const kind of kinds)']),
  scan: lines(RECOUNT, ['count = sum(1 for name, k in clothes if k == kind)'], ['const count = clothes.filter']),
  multiply: lines(RECOUNT, ['answer *= count + 1'], ['answer *= count + 1']),
  done: lines(RECOUNT, ['return answer - 1'], ['return answer - 1']),
};

const PRODUCT = {
  python: `# 주의: 안 입는 경우를 빼먹어서 종류가 둘 이상이면 틀린 답이 나옵니다
def solution(clothes):
    count = {}
    for name, kind in clothes:
        count[kind] = count.get(kind, 0) + 1

    answer = 1
    for c in count.values():
        answer *= c                              # 종류마다 의상 하나를 고르는 경우만 곱함
    return answer                                # 안 입는 경우가 빠져 있음`,
  javascript: `// 주의: 안 입는 경우를 빼먹어서 종류가 둘 이상이면 틀린 답이 나옵니다
function solution(clothes) {
  const count = new Map();
  for (const [name, kind] of clothes) {
    count.set(kind, (count.get(kind) ?? 0) + 1);
  }

  let answer = 1;
  for (const c of count.values()) {
    answer *= c; // 종류마다 의상 하나를 고르는 경우만 곱함
  }
  return answer; // 안 입는 경우가 빠져 있음
}`,
};
const PRODUCT_AT = {
  count: lines(PRODUCT, ['for name, kind in clothes:', 'count[kind] = count.get(kind, 0) + 1'], ['for (const [name, kind] of clothes)', 'count.set(kind, (count.get(kind) ?? 0) + 1)']),
  init: lines(PRODUCT, ['answer = 1', 'for c in count.values():'], ['let answer = 1', 'for (const c of count.values())']),
  loop: lines(PRODUCT, ['for c in count.values():'], ['for (const c of count.values())']),
  multiply: lines(PRODUCT, ['answer *= c  '], ['answer *= c;']),
  done: lines(PRODUCT, ['return answer  '], ['return answer;']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 의상 토큰 0~164, 표는 x 190부터 칸 106px에 10px 간격(3종류), 오른쪽 28px은 판정 표시 여백.
// 세로: 의상 목록 머리글 6~28, 토큰은 34부터 40px 간격(판정 표시가 앞 토큰을 덮지 않게), 지금 의상 토큰 34~62,
// 종류 칸 128~182, 개수 칸 192~246, 곱 토큰 300~328. 지금 의상 토큰과 곱 토큰이 표에서 멀리 떨어져 있어서,
// 화살표가 가파르게 들어가 칸 글자를 덜 덮는다.
const ITEM_W = 164;
const ITEM_Y = 34;
const ITEM_PITCH = 40;
const COL_X = 190;
const COL_PITCH = 116;
const CELL_W = 106;
const KEY_Y = 128;
const VAL_Y = 192;
const W = 556;
const TABLE_MID = COL_X + (2 * COL_PITCH + CELL_W) / 2; // 표 가운데 x
const itemRect = (i: number): Rect => ({ x: 0, y: ITEM_Y + i * ITEM_PITCH, w: ITEM_W, h: 28 });
const keyRect = (t: number): Rect => ({ x: COL_X + t * COL_PITCH, y: KEY_Y, w: CELL_W, h: 54 });
const valRect = (t: number): Rect => ({ x: COL_X + t * COL_PITCH, y: VAL_Y, w: CELL_W, h: 54 });
const SLOT: Rect = { x: TABLE_MID - 86, y: ITEM_Y, w: 172, h: 28 };
const PRODUCT_RECT: Rect = { x: TABLE_MID - 80, y: 300, w: 160, h: 28 };
const H = PRODUCT_RECT.y + 28 + 16;
const itemId = (i: number) => `item:${i}`;
const keyId = (t: number) => `key:${t}`;
const valId = (t: number) => `val:${t}`;
const itemText = (i: number) => `${CLOTHES[i][0]} · ${CLOTHES[i][1]}`;

// 세 풀이가 같이 쓰는 장면: 의상 목록 토큰 7개
function board(): Scene {
  const items: Item[] = [{ id: 'list:head', kind: 'text', rect: { x: 0, y: 6, w: ITEM_W, h: 22 }, text: '의상 목록' }];
  CLOTHES.forEach((_, i) => items.push({ id: itemId(i), kind: 'token', rect: itemRect(i), tone: 'plain', text: itemText(i) }));
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });
const keyCell = (t: number): Item => ({ id: keyId(t), kind: 'cell', rect: keyRect(t), tone: 'chosen', text: KINDS[t], tag: '종류' });
const valCell = (t: number, text: string): Item => ({ id: valId(t), kind: 'cell', rect: valRect(t), tone: 'plain', text, tag: '개수' });
const productToken = (text: string, tone: Tone = 'chosen'): Item => ({ id: 'product', kind: 'token', rect: PRODUCT_RECT, tone, text });
const slotToken = (i: number): Item => ({ id: 'slot', kind: 'token', rect: SLOT, tone: 'current', text: itemText(i) });

/* ------------------------------------------------------------------ */
/* 정석 종류별 곱: 고르기 → 살피기 → 반영하기 (의상마다, 종류마다)             */
/* ------------------------------------------------------------------ */

function countThenMultiply(): Visualization {
  const rec = new StepRecorder(board());
  const count = new Map<string, number>();
  let looked = 0;
  let name = '-';
  let kind = '-';
  let c: number | string = '-';
  let answer: number | string = '-';
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({ work: looked, variables: { name, kind, count: dictText(count), c, answer } });

  for (let i = 0; i < N; i++) {
    [name, kind] = CLOTHES[i];
    const t = KINDS.indexOf(kind);
    const fresh = !count.has(kind);
    count.set(kind, (count.get(kind) ?? 0) + 1);
    const now = count.get(kind)!;
    looked++;

    rec.step({ title: `${name}: ${fresh ? `새 종류 ${kind}` : `${kind} ${now}벌째`}`, codeHighlights: COUNT_AT.update, ...meta() });
    rec.phase('고르기', `${name} 의상을 꺼냅니다. 종류는 ${kind}입니다.`, COUNT_AT.pick);
    rec.do(...together([{ type: 'add', item: slotToken(i), from: itemId(i) }, paint(itemId(i), 'current')]), wait(200));

    if (fresh) {
      rec.phase('살피기', `표에 ${kind} 칸이 없어 새로 만듭니다. 개수는 0에서 시작합니다.`, COUNT_AT.update);
      rec.do(...together([{ type: 'add', item: keyCell(t), from: 'slot' }, { type: 'add', item: valCell(t, '0'), from: 'slot' }]));
      rec.do({ type: 'arrow', from: 'slot', to: keyId(t), verdict: 'new', label: '새 종류' });
    } else {
      rec.phase('살피기', `표에 ${kind} 칸이 이미 있습니다. 지금 개수는 ${now - 1}입니다.`, COUNT_AT.update);
      rec.do({ type: 'focus', ids: [keyId(t), valId(t)] }, { type: 'arrow', from: 'slot', to: keyId(t), verdict: 'seen', label: '있는 종류' }, wait(100));
    }

    rec.phase('반영하기', `${kind} 칸의 개수를 1 늘려 ${now}벌이 됩니다.`, COUNT_AT.update);
    rec.do({ type: 'set', id: valId(t), patch: { text: String(now), tone: 'current' }, pop: true });
    rec.do(...together([
      { type: 'unfocus' }, { type: 'clearMarks' }, { type: 'remove', id: 'slot', into: valId(t) },
      paint(itemId(i), 'visited'), paint(valId(t), 'plain'),
    ]));
  }

  [name, kind] = ['-', '-']; // 반복이 끝난 뒤에는 의미 없는 값
  let product = 1;
  KINDS.forEach((k, t) => {
    const f = count.get(k)! + 1;
    const next = product * f;
    c = count.get(k)!;
    answer = next;

    rec.step({ title: `${k} ${c}벌 → ${c} + 1 = ${f}가지, 곱 ${product} × ${f} = ${next}`, codeHighlights: COUNT_AT.multiply, ...meta() });
    rec.phase('고르기', `${k} 칸을 고릅니다. 이 종류는 ${c}벌입니다.`, t === 0 ? COUNT_AT.init : COUNT_AT.loop);
    if (t === 0) rec.do({ type: 'add', item: productToken('곱 = 1') });
    rec.do(...together([paint(keyId(t), 'current'), paint(valId(t), 'current'), { type: 'focus', ids: [keyId(t), valId(t)] }]), wait(300));

    rec.phase('살피기', `${c}벌 중 하나를 입거나 안 입어서 ${c} + 1 = ${f}가지입니다.`, COUNT_AT.multiply);
    rec.do({ type: 'arrow', from: valId(t), to: 'product', verdict: 'good', label: `${c} + 1 = ${f}` }, wait(300));

    rec.phase('반영하기', `지금까지의 곱 ${product}에 ${josa(f, '을', '를')} 곱해 ${josa(next, '이', '가')} 됩니다.`, COUNT_AT.multiply);
    rec.do({ type: 'set', id: 'product', patch: { text: `${product} × ${f} = ${next}` }, pop: true });
    rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }, paint(keyId(t), 'chosen'), paint(valId(t), 'plain')]));
    product = next;
  });

  rec.step({ title: `곱 ${product}에서 1을 빼면 ${RIGHT}`, codeHighlights: COUNT_AT.done, ...meta(), answer: RIGHT, isKeyframe: true });
  rec.phase('마무리', `곱 ${product}에는 아무것도 안 입는 경우 1가지가 들어 있습니다. 그것을 빼면 ${RIGHT}가지입니다.`, COUNT_AT.done);
  rec.do({ type: 'set', id: 'product', patch: { text: `${product} − 1 = ${RIGHT}`, tone: 'path' }, pop: true });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 다시 세기: 목록 만들기, (종류 고르기 → 다시 훑기 → 반영하기) 종류마다  */
/* ------------------------------------------------------------------ */

function recountPerKind(): Visualization {
  const rec = new StepRecorder(board());
  let looked = 0;
  let kind = '-';
  let c: number | string = '-';
  let answer: number | string = '-';
  const shown: string[] = []; // 목록에 든 종류
  const meta = () => ({ work: looked, variables: { kinds: `[${shown.join(', ')}]`, kind, count: c, answer } });

  looked += N;
  shown.push(...KINDS);
  rec.step({ title: `의상 ${N}벌을 훑어 종류 ${KINDS.length}개 목록 만들기`, codeHighlights: RECOUNT_AT.collect, ...meta() });
  rec.phase('목록 만들기', `의상 ${N}벌을 처음부터 훑으며 처음 보는 종류 ${KINDS.length}개를 목록에 넣습니다.`);
  rec.do(...together(KINDS.map((k, t): Action => ({ type: 'add', item: keyCell(t), from: itemId(CLOTHES.findIndex(([, kk]) => kk === k)) }))), wait(500));

  let product = 1;
  KINDS.forEach((k, t) => {
    const f = COUNTS[t] + 1;
    const next = product * f;
    const same = CLOTHES.flatMap(([, kk], i) => (kk === k ? [i] : []));
    kind = k;
    c = COUNTS[t];
    answer = next;
    looked += N;

    rec.step({ title: `${k}: 의상 ${N}벌을 다시 훑어 ${c}벌, 곱 ${product} × ${f} = ${next}`, codeHighlights: RECOUNT_AT.scan, ...meta() });
    rec.phase('종류 고르기', `${k} 칸을 고릅니다. 의상 ${N}벌을 처음부터 다시 훑습니다.`, t === 0 ? RECOUNT_AT.pick : RECOUNT_AT.loop);
    rec.do(...together([paint(keyId(t), 'current'), { type: 'focus', ids: [keyId(t)] }]), wait(300));

    rec.phase('다시 훑기', `의상 ${N}벌을 모두 훑어 ${k} 종류 ${c}벌을 찾습니다. 종류마다 다시 훑습니다.`, RECOUNT_AT.scan);
    rec.do(...together(same.map((i) => paint(itemId(i), 'chosen'))));
    rec.do({ type: 'add', item: valCell(t, String(c)), from: keyId(t) }, { type: 'arrow', from: keyId(t), to: valId(t), verdict: 'good', label: `${c}벌 찾음`, together: true });

    rec.phase('반영하기', `개수 ${c}에 1을 더한 ${f}를 곱해, 곱이 ${product} × ${f} = ${josa(next, '이', '가')} 됩니다.`, RECOUNT_AT.multiply);
    rec.do(t === 0 ? { type: 'add', item: productToken(`${product} × ${f} = ${next}`), from: valId(t) } : { type: 'set', id: 'product', patch: { text: `${product} × ${f} = ${next}` }, pop: true });
    rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }, paint(keyId(t), 'chosen'), ...same.map((i) => paint(itemId(i), 'plain'))]));
    product = next;
  });

  rec.step({ title: `곱 ${product}에서 1을 빼면 ${RIGHT}`, codeHighlights: RECOUNT_AT.done, ...meta(), answer: RIGHT, isKeyframe: true });
  rec.phase('마무리', `곱 ${product}에서 아무것도 안 입는 경우 1가지를 빼면 ${RIGHT}가지입니다. 의상을 ${looked}번 살펴본 끝에 얻은 답입니다.`, RECOUNT_AT.done);
  rec.do({ type: 'set', id: 'product', patch: { text: `${product} − 1 = ${RIGHT}`, tone: 'path' }, pop: true });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 그냥 곱하기: 세기(빨리 감기), 고르기 → 살피기 → 반영하기, 틀린 답 확인   */
/* ------------------------------------------------------------------ */

function plainProduct(): Visualization {
  const rec = new StepRecorder(board());
  const count = new Map<string, number>();
  let looked = 0;
  let c: number | string = '-';
  let answer: number | string = '-';
  const meta = () => ({ work: looked, variables: { count: dictText(count), c, answer } });

  looked = N;
  KINDS.forEach((k, kt) => count.set(k, COUNTS[kt]));
  rec.step({ title: `의상 ${N}벌을 종류별로 세기`, codeHighlights: PRODUCT_AT.count, ...meta() });
  rec.phase('세기', `의상 ${N}벌을 종류별로 셉니다. 여기까지는 정석과 같아서 ${KINDS.map((k, t) => `${k} ${COUNTS[t]}벌`).join(', ')}이 나옵니다.`);
  rec.do(...together(KINDS.map((k, t): Action => ({ type: 'add', item: keyCell(t), from: itemId(CLOTHES.findIndex(([, kk]) => kk === k)) }))));
  rec.do(...together(KINDS.map((_, t): Action => ({ type: 'add', item: valCell(t, String(COUNTS[t])), from: keyId(t) }))));
  rec.do(...together(CLOTHES.map((_, i) => paint(itemId(i), 'visited'))));

  let product = 1;
  KINDS.forEach((k, t) => {
    const next = product * COUNTS[t];
    c = COUNTS[t];
    answer = next;

    rec.step({ title: `${k} ${c}벌 → ${c}을 그대로 곱함, ${product} × ${c} = ${next}`, codeHighlights: PRODUCT_AT.multiply, ...meta() });
    rec.phase('고르기', `${k} 칸을 고릅니다. 이 종류는 ${c}벌입니다.`, t === 0 ? PRODUCT_AT.init : PRODUCT_AT.loop);
    if (t === 0) rec.do({ type: 'add', item: productToken('곱 = 1', 'bad') });
    rec.do(...together([paint(keyId(t), 'current'), paint(valId(t), 'current'), { type: 'focus', ids: [keyId(t), valId(t)] }]), wait(300));

    rec.phase('살피기', `${c}벌 중 하나를 입는 경우만 보고 ${c}을 그대로 곱합니다.`.replace(`${c}을`, josa(c, '을', '를')), PRODUCT_AT.multiply);
    rec.do({ type: 'arrow', from: valId(t), to: 'product', verdict: 'bad', label: `× ${c}` }, wait(300));

    rec.phase('반영하기', `지금까지의 곱 ${product}에 ${josa(c, '을', '를')} 곱해 ${josa(next, '이', '가')} 됩니다.`, PRODUCT_AT.multiply);
    rec.do({ type: 'set', id: 'product', patch: { text: `${product} × ${c} = ${next}` }, pop: true });
    rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }, paint(keyId(t), 'chosen'), paint(valId(t), 'plain')]));
    product = next;
  });

  rec.step({ title: `틀린 답 ${product}, 정답은 ${RIGHT}`, codeHighlights: PRODUCT_AT.done, ...meta(), answer: product, isKeyframe: true });
  rec.phase('틀린 답', `안 입는 경우를 빼먹어서 ${josa(product, '이', '가')} 나왔습니다. 종류마다 (개수 + 1)을 곱하고 1을 빼야 ${RIGHT}입니다. 종류가 하나뿐인 예제 2는 우연히 맞습니다.`);
  rec.do(
    { type: 'add', item: { id: 'right', kind: 'token', rect: { x: PRODUCT_RECT.x + PRODUCT_RECT.w + 8, y: PRODUCT_RECT.y, w: 100, h: 28 }, tone: 'good', text: `정답은 ${RIGHT}` } },
    wait(900),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'clothes',
  title: '의상',
  level: 2,
  category: 'hash',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42578',
  description: {
    summary:
      '코니가 가진 의상이 [이름, 종류]로 주어집니다. 같은 종류의 의상은 하루에 하나만 입을 수 있고 적어도 한 벌은 입어야 할 때, 서로 다른 의상 조합이 모두 몇 가지인지 구합니다.',
    rules: [
      '의상의 수는 1개 이상 30개 이하',
      '같은 이름을 가진 의상은 없음',
      '모든 문자열의 길이는 1 이상 20 이하이고 알파벳 소문자 또는 _로만 이루어짐',
      '같은 종류는 한 번에 하나만 입고, 하루에 적어도 한 벌은 입음',
    ],
    examples: [
      { input: 'clothes = [["yellow_hat", "headgear"], ["blue_sunglasses", "eyewear"], ["green_turban", "headgear"]]', output: '5' },
      { input: 'clothes = [["crow_mask", "face"], ["blue_sunglasses", "face"], ["smoky_makeup", "face"]]', output: '3' },
    ],
  },
  keyIntuitions: [
    '의상 한 벌씩 따지지 않고 종류별로 생각합니다. 한 종류에서는 입을 의상 하나를 고르거나 아무것도 안 입는 경우를 고를 수 있어서 (개수 + 1)가지입니다.',
    '종류마다 고르는 경우를 곱하면 모든 조합이 나옵니다. 곱에는 모든 종류에서 안 입는 경우도 한 번 들어 있으니 마지막에 1을 뺍니다.',
    '종류별 개수는 딕셔너리(해시)로 한 번 훑으며 셉니다. 종류를 키로 쓰면 의상을 하나씩 만날 때마다 그 종류의 개수를 바로 찾아 올릴 수 있습니다.',
  ],
  demo: { input: [CLOTHES], label: `clothes = 의상 ${N}벌 (${KINDS.map((k, t) => `${k} ${COUNTS[t]}벌`).join(', ')})` },
  workUnit: '의상을 살펴본 횟수',
  approaches: [
    {
      id: 'clothes-count-product',
      name: '종류별로 세어 (개수 + 1)을 곱하기',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(K)',
      verdict: '의상을 한 번 훑어 종류별 개수를 세고, 종류마다 (개수 + 1)을 곱한 뒤 1을 빼는 풀이입니다.',
      pros: [
        '의상을 한 번만 훑고 종류 수만큼만 곱하므로 O(N)입니다.',
        '조합을 하나씩 만들지 않아서 의상이 더 늘어도 같은 방식으로 풉니다.',
        '(개수 + 1)에 "안 입는 경우"가 들어 있어 식이 짧고 이유가 분명합니다.',
      ],
      cons: [
        '"안 입는 경우를 더하고, 마지막에 모두 안 입는 경우를 뺀다"는 두 번의 보정을 빼먹기 쉽습니다.',
        '곱이 커질 수 있습니다. 이 문제는 의상이 30벌 이하라 JavaScript 숫자로 충분하지만, 더 커지면 정수 범위를 살펴야 합니다.',
      ],
      whyThisRank:
        '종류가 서로 영향을 주지 않는다는 점을 곱셈으로 바로 옮긴 풀이입니다. 의상을 다시 훑을 일이 없고, 코드가 가장 짧습니다.',
      code: COUNT,
      visualize: countThenMultiply,
    },
    {
      id: 'clothes-recount',
      name: '종류 목록을 만들고 종류마다 의상을 다시 세기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × K)',
      spaceComplexity: 'O(K)',
      verdict: '맞는 풀이지만 종류마다 의상 전체를 처음부터 다시 훑어서, 종류가 많을수록 일이 늘어납니다.',
      pros: [
        '딕셔너리 없이 리스트와 반복문만으로 짤 수 있습니다.',
        '곱셈 식은 정석과 같아서 답이 같습니다.',
      ],
      cons: [
        `종류 수 K만큼 의상 N벌을 처음부터 다시 훑어 O(N × K)입니다. 이 예에서는 의상을 ${N + COUNTS.length * N}번(처음 훑기 ${N}번 + 종류 ${COUNTS.length}개 × ${N}벌) 살펴서, 정석의 ${N}번보다 ${COUNTS.length + 1}배 많습니다.`,
        '종류를 리스트에서 찾으니(`kind not in kinds`) 그 비용도 따로 붙습니다.',
        '목록을 만드는 일과 세는 일이 나뉘어서 코드가 길고, 둘 사이를 맞추는 실수가 생기기 쉽습니다.',
      ],
      whyThisRank:
        '이 문제는 의상이 30벌 이하라서 이 정도 낭비로도 통과합니다. 하지만 종류별로 한 번에 세는 방법이 있는데 같은 의상을 종류마다 다시 보므로, 같은 답에 더 많은 일을 하는 풀이입니다.',
      code: RECOUNT,
      visualize: recountPerKind,
    },
    {
      id: 'clothes-plain-product',
      name: '종류별 개수를 그냥 곱하기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(K)',
      verdict: '종류마다 의상 하나를 고르는 경우만 곱해서, 안 입는 경우가 빠진 틀린 답이 나옵니다.',
      pros: ['코드 모양이 정석과 거의 같습니다.', '종류가 하나뿐인 예제 2는 우연히 맞아서 잘못을 알아채기 어렵습니다.'],
      cons: [
        '종류가 둘 이상이면 틀립니다. 예제 1(headgear 2벌, eyewear 1벌)은 정답 5가 아니라 2 × 1 = 2가 나옵니다.',
        '한 종류만 입고 나머지는 안 입는 조합이 모두 빠집니다.',
      ],
      whyThisRank:
        '"종류마다 하나씩 고른다"고만 읽고 "그 종류를 안 입을 수도 있다"를 놓친 풀이입니다. 종류마다 (개수 + 1)을 곱하고 마지막에 1을 빼면 정석이 됩니다.',
      code: PRODUCT,
      visualize: plainProduct,
    },
  ],
  checks: {
    cases: [
      { args: [[['yellow_hat', 'headgear'], ['blue_sunglasses', 'eyewear'], ['green_turban', 'headgear']]], expected: 5 },
      { args: [[['crow_mask', 'face'], ['blue_sunglasses', 'face'], ['smoky_makeup', 'face']]], expected: 3 },
      { args: [[['hat', 'head']]], expected: 1 },
      { args: [[['hat', 'head'], ['shoes', 'foot']]], expected: 3 },
      { args: [Array.from({ length: 30 }, (_, i) => [`item_${i}`, `kind_${i}`])], expected: 2 ** 30 - 1 }, // 종류 30개
      { args: [Array.from({ length: 30 }, (_, i) => [`item_${i}`, 'same'])], expected: 30 }, // 종류 하나
      { args: [CLOTHES], expected: RIGHT },
    ],
    // 의상 1~8벌, 종류는 4개 중 하나, 이름은 서로 다르게
    random: (rand) => [Array.from({ length: 1 + Math.floor(rand() * 8) }, (_, i) => [`n${i}`, `k${Math.floor(rand() * 4)}`])],
  },
};

export default problem;
