// 5월 식품들의 총매출 조회하기: 정석 5월 주문 필터 후 조인 및 SUM 집계, 대안 모든 달 주문 먼저 조인·곱셈 후 필터, 함정 SUM 누락으로 다건 주문 식품의 총매출 과소 계산을 같은 장면에서 움직인다.
import type { Action, AlgorithmStep, CodeHighlights, Item, Problem, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { sqlLines, together } from '../shared.ts';

const MS_PER_CHAR = 20;
class PacedRecorder extends StepRecorder {
  private caption = '';
  private acts: Action[] = [];
  private keyframe = false;
  override step(meta: Omit<AlgorithmStep, 'phases' | 'scene'>): void {
    this.settle(false);
    this.keyframe = !!meta.isKeyframe;
    super.step(meta);
  }
  override phase(label: string, caption: string, codeHighlights?: CodeHighlights): void {
    this.settle(true);
    super.phase(label, caption, codeHighlights);
    this.caption = caption;
    this.acts = [];
  }
  override do(...actions: Action[]): void {
    super.do(...actions);
    this.acts.push(...actions);
  }
  override finish() {
    this.settle(false);
    return super.finish();
  }
  private settle(more: boolean): void {
    if (!this.caption) return;
    const hold = more ? PHASE_GAP : this.keyframe ? KEYFRAME_TAIL : STEP_TAIL;
    const plan = planStep({ phases: [{ label: '', caption: '', actions: this.acts }] } as unknown as AlgorithmStep).phases[0];
    const busy = Math.max(0, ...plan.actions.map((a) => a.start + a.duration));
    const need = MS_PER_CHAR * [...this.caption].length - hold - busy;
    this.caption = '';
    if (need > 0 && busy + need > plan.end) super.do({ type: 'wait', ms: Math.ceil(need) });
  }
}

type ProductRow = [id: string, name: string, price: number];
type OrderRow = [orderId: number, productId: string, amount: number, date: string];

const PRODUCTS: ProductRow[] = [
  ['P001', '맛있는스낵', 2000],
  ['P002', '맛있는김치', 10000],
  ['P003', '맛있는라면', 1500],
  ['P004', '맛있는콜라', 1200],
];
const ORDERS: OrderRow[] = [
  [1, 'P001', 50, '2022-05-01'],
  [2, 'P001', 30, '2022-05-15'],
  [3, 'P002', 20, '2022-05-10'],
  [4, 'P003', 100, '2022-05-20'],
  [5, 'P004', 80, '2022-04-25'], // 4월 제외
  [6, 'P004', 50, '2022-06-02'], // 6월 제외
];
const TRUTH = [
  ['P002', '맛있는김치', 200000],
  ['P001', '맛있는스낵', 160000],
  ['P003', '맛있는라면', 150000],
];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  sql: `SELECT P.PRODUCT_ID, P.PRODUCT_NAME,
       SUM(P.PRICE * O.AMOUNT) AS TOTAL_SALES
FROM FOOD_PRODUCT P
JOIN FOOD_ORDER O ON P.PRODUCT_ID = O.PRODUCT_ID
WHERE O.PRODUCE_DATE LIKE '2022-05%'
GROUP BY P.PRODUCT_ID, P.PRODUCT_NAME
ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;`,
  python: `def solution(products, orders):
    p_map = {p_id: (name, price) for p_id, name, price in products}
    sales = {}
    for o_id, p_id, amount, date in orders:
        if date.startswith('2022-05') and p_id in p_map:
            name, price = p_map[p_id]
            sales[p_id] = sales.get(p_id, 0) + price * amount
    result = [[p_id, p_map[p_id][0], tot] for p_id, tot in sales.items()]
    return sorted(result, key=lambda r: (-r[2], r[0]))`,
  javascript: `function solution(products, orders) {
  const pMap = new Map(products.map(([id, name, price]) => [id, { name, price }]));
  const sales = new Map();
  for (const [, pId, amount, date] of orders) {
    if (date.startsWith('2022-05') && pMap.has(pId)) {
      const { price } = pMap.get(pId);
      sales.set(pId, (sales.get(pId) ?? 0) + price * amount);
    }
  }
  const result = [];
  for (const [pId, tot] of sales) {
    result.push([pId, pMap.get(pId).name, tot]);
  }
  return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
}`,
};
const BEST_AT = {
  join: sqlLines(BEST_CODE, ['FROM FOOD_PRODUCT P', 'JOIN FOOD_ORDER O ON P.PRODUCT_ID = O.PRODUCT_ID'], ['p_map = {p_id: (name, price) for p_id, name, price in products}'], ['const pMap = new Map(products.map']),
  where: sqlLines(BEST_CODE, ["WHERE O.PRODUCE_DATE LIKE '2022-05%'", 'GROUP BY P.PRODUCT_ID, P.PRODUCT_NAME', 'SUM(P.PRICE * O.AMOUNT) AS TOTAL_SALES'], ['if date.startswith(\'2022-05\') and p_id in p_map:', 'sales[p_id] = sales.get(p_id, 0) + price * amount'], ['if (date.startsWith(\'2022-05\') && pMap.has(pId))', 'sales.set(pId, (sales.get(pId) ?? 0) + price * amount);']),
  order: sqlLines(BEST_CODE, ['ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;'], ['return sorted(result, key=lambda r: (-r[2], r[0]))'], ['return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));']),
};

const ALT_CODE = {
  sql: `SELECT P.PRODUCT_ID, P.PRODUCT_NAME,
       SUM(P.PRICE * O.AMOUNT) AS TOTAL_SALES
FROM FOOD_PRODUCT P
JOIN FOOD_ORDER O ON P.PRODUCT_ID = O.PRODUCT_ID
GROUP BY P.PRODUCT_ID, P.PRODUCT_NAME, O.PRODUCE_DATE
HAVING O.PRODUCE_DATE LIKE '2022-05%'
ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;`,
  python: `def solution(products, orders):
    # 날짜 조건 없이 모든 달 주문을 먼저 조인·곱셈한 뒤 5월만 합산
    p_map = {p_id: (name, price) for p_id, name, price in products}
    all_joined = []
    for o_id, p_id, amount, date in orders:
        if p_id in p_map:
            name, price = p_map[p_id]
            all_joined.append((p_id, name, price * amount, date))
    sales = {}
    for p_id, name, cost, date in all_joined:
        if date.startswith('2022-05'):
            sales[p_id] = sales.get(p_id, 0) + cost
    result = [[p_id, p_map[p_id][0], tot] for p_id, tot in sales.items()]
    return sorted(result, key=lambda r: (-r[2], r[0]))`,
  javascript: `function solution(products, orders) {
  // 날짜 조건 없이 모든 달 주문을 먼저 조인·곱셈한 뒤 5월만 합산합니다
  const pMap = new Map(products.map(([id, name, price]) => [id, { name, price }]));
  const allJoined = [];
  for (const [, pId, amount, date] of orders) {
    if (pMap.has(pId)) {
      const { name, price } = pMap.get(pId);
      allJoined.push({ pId, name, cost: price * amount, date });
    }
  }
  const sales = new Map();
  for (const { pId, cost, date } of allJoined) {
    if (date.startsWith('2022-05')) {
      sales.set(pId, (sales.get(pId) ?? 0) + cost);
    }
  }
  const result = [];
  for (const [pId, tot] of sales) {
    result.push([pId, pMap.get(pId).name, tot]);
  }
  return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
}`,
};
const ALT_AT = {
  join: sqlLines(ALT_CODE, ['JOIN FOOD_ORDER O ON P.PRODUCT_ID = O.PRODUCT_ID'], ['all_joined.append((p_id, name, price * amount, date))'], ['allJoined.push({ pId, name, cost: price * amount, date });']),
  order: sqlLines(ALT_CODE, ["HAVING O.PRODUCE_DATE LIKE '2022-05%'", 'ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;'], ['return sorted(result, key=lambda r: (-r[2], r[0]))'], ['return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));']),
};

const TRAP_CODE = {
  sql: `-- 함정: SUM(AMOUNT) 누락으로 다건 주문 식품의 총매출 과소 계산
SELECT P.PRODUCT_ID, P.PRODUCT_NAME,
       P.PRICE * O.AMOUNT AS TOTAL_SALES
FROM FOOD_PRODUCT P
JOIN FOOD_ORDER O ON P.PRODUCT_ID = O.PRODUCT_ID
WHERE O.PRODUCE_DATE LIKE '2022-05%'
GROUP BY P.PRODUCT_ID, P.PRODUCT_NAME
ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;`,
  python: `def solution(products, orders):
    # 함정: SUM 없이 첫 번째 주문 수량만 단가에 곱함
    p_map = {p_id: (name, price) for p_id, name, price in products}
    sales = {}
    for o_id, p_id, amount, date in orders:
        if date.startswith('2022-05') and p_id in p_map:
            if p_id not in sales:  # 첫 주문만 반영!
                name, price = p_map[p_id]
                sales[p_id] = price * amount
    result = [[p_id, p_map[p_id][0], tot] for p_id, tot in sales.items()]
    return sorted(result, key=lambda r: (-r[2], r[0]))`,
  javascript: `function solution(products, orders) {
  // 함정: SUM 없이 첫 번째 주문 수량만 단가에 곱합니다
  const pMap = new Map(products.map(([id, name, price]) => [id, { name, price }]));
  const sales = new Map();
  for (const [, pId, amount, date] of orders) {
    if (date.startsWith('2022-05') && pMap.has(pId)) {
      if (!sales.has(pId)) {
        sales.set(pId, pMap.get(pId).price * amount);
      }
    }
  }
  const result = [];
  for (const [pId, tot] of sales) {
    result.push([pId, pMap.get(pId).name, tot]);
  }
  return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
}`,
};
const TRAP_AT = {
  trapSum: sqlLines(TRAP_CODE, ['P.PRICE * O.AMOUNT AS TOTAL_SALES'], ['if p_id not in sales:  # 첫 주문만 반영!'], ['if (!sales.has(pId)) {']),
  done: sqlLines(TRAP_CODE, ['ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;'], ['return sorted(result, key=lambda r: (-r[2], r[0]))'], ['return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));']),
};

/* ------------------------------------------------------------------ */
/* 장면과 배치                                                          */
/* ------------------------------------------------------------------ */

const W = 600;
const H = 360;
const P_X = 14;
const P_Y = 36;
const P_W = 190;
const P_H = 34;
const O_X = 216;
const O_W = 210;
const RES_X = 438;
const RES_W = 148;

const pIdStr = (r: number) => `prod:${r}`;
const oIdStr = (r: number) => `ord:${r}`;
const resIdStr = (slot: number) => `res:${slot}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:p', kind: 'text', rect: { x: P_X, y: 8, w: P_W, h: 22 }, tone: 'muted', text: 'FOOD_PRODUCT (식품 4종)' },
    { id: 'hdr:o', kind: 'text', rect: { x: O_X, y: 8, w: O_W, h: 22 }, tone: 'chosen', text: 'FOOD_ORDER (주문 6건)' },
    { id: 'hdr:r', kind: 'text', rect: { x: RES_X, y: 8, w: RES_W, h: 22 }, tone: 'good', text: '5월 총매출 합산' },
    { id: 'status', kind: 'token', rect: { x: P_X, y: 312, w: 572, h: 32 }, tone: 'plain', text: '주문 조인 및 매출 집계 대기' },
  ];
  PRODUCTS.forEach(([id, name, price], r) => {
    items.push({ id: pIdStr(r), kind: 'token', rect: { x: P_X, y: P_Y + r * 44, w: P_W, h: P_H }, tone: 'plain', text: `${id} · ${name} (${price}원)` });
  });
  ORDERS.forEach(([oid, pid, amount, date], r) => {
    items.push({ id: oIdStr(r), kind: 'token', rect: { x: O_X, y: P_Y + r * 44, w: O_W, h: P_H }, tone: 'plain', text: `#${oid} [${pid}] ${amount}개 (${date.slice(5)})` });
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석: 5월 주문 필터 후 조인 + SUM(PRICE * AMOUNT) 집계                */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const pMap = new Map(PRODUCTS.map(([id, name, price]) => [id, { name, price }]));
  const sumMap = new Map<string, number>();

  rec.step({ title: 'FROM FOOD_PRODUCT P: 4개 식품 마스터 로드', codeHighlights: BEST_AT.join, work, variables: { 절: 'FROM', 식품수: 4 } });
  rec.phase('식품 테이블 읽기', 'FOOD_PRODUCT 테이블에서 식품 마스터 정보(ID, 이름, 단가) 4건을 로드합니다.', BEST_AT.join);
  rec.do({ type: 'set', id: 'status', patch: { text: 'FROM FOOD_PRODUCT → 4개 식품 단가 확인', tone: 'chosen' }, pop: true }, wait(180));

  rec.step({ title: 'JOIN FOOD_ORDER O: P.PRODUCT_ID = O.PRODUCT_ID 연결', codeHighlights: BEST_AT.join, work, variables: { 절: 'JOIN', 총주문수: 6 } });
  rec.phase('주문 테이블 연결', 'FOOD_ORDER 테이블의 주문 내역을 식품 ID 기준으로 조인할 준비를 합니다.', BEST_AT.join);
  rec.do({ type: 'set', id: 'status', patch: { text: 'JOIN FOOD_ORDER → 5월 주문 필터링 대기', tone: 'chosen' }, pop: true }, wait(180));

  rec.step({ title: 'WHERE 5월 필터: PRODUCE_DATE LIKE "2022-05%" 시작', codeHighlights: BEST_AT.where, work, variables: { 절: 'WHERE 필터', 대상: '5월 주문만' } });
  rec.phase('5월 주문 선별', '2022년 5월에 생산된 주문(#1, #2, #3, #4) 4건을 먼저 선별하고, 4월·6월 주문은 제외합니다.', BEST_AT.where);
  rec.do(
    ...together([
      paint(oIdStr(0), 'chosen'),
      paint(oIdStr(1), 'chosen'),
      paint(oIdStr(2), 'chosen'),
      paint(oIdStr(3), 'chosen'),
      paint(oIdStr(4), 'muted'),
      paint(oIdStr(5), 'muted'),
      { type: 'set', id: 'status', patch: { text: '5월 주문 4건 통과, 타 월 주문 2건 제외', tone: 'chosen' }, pop: true },
    ]),
    wait(200),
  );

  // 주문 4건 누적 집계
  const stepMeta: [number, string, number, number][] = [
    [1, 'P001', 50, 100000],
    [2, 'P001', 30, 160000], // 추가 누적!
    [3, 'P002', 20, 200000],
    [4, 'P003', 100, 150000],
  ];

  stepMeta.forEach(([oid, pid, amount, tot]) => {
    work += 1;
    const isAccum = sumMap.has(pid);
    sumMap.set(pid, tot);
    const prod = pMap.get(pid)!;

    rec.step({
      title: `주문 #${oid} [${pid}]: ${amount}개 × ${prod.price}원 → 누적 ${tot.toLocaleString()}원`,
      codeHighlights: BEST_AT.where,
      work,
      variables: { 절: 'SUM 집계', 주문: `#${oid} [${pid}]`, 식품누적매출: `${tot}원` },
    });
    rec.phase(
      '매출 합산',
      isAccum
        ? `주문 #${oid}은 스낵(P001)의 5월 두 번째 주문입니다! 이전 10만원에 6만원(30개)을 더해 총 16만원으로 합산됩니다.`
        : `주문 #${oid}의 ${prod.name} ${amount}개에 단가 ${prod.price}원을 곱해 ${tot.toLocaleString()}원을 적립합니다.`,
      BEST_AT.where,
    );
    if (!isAccum) {
      const slot = sumMap.size - 1;
      rec.do(
        ...together([
          paint(oIdStr(oid - 1), 'good'),
          { type: 'add', item: { id: resIdStr(slot), kind: 'token', rect: { x: RES_X, y: P_Y + slot * 48, w: RES_W, h: 38 }, tone: 'good', text: `${prod.name}: ${tot.toLocaleString()}원` }, from: oIdStr(oid - 1) },
        ]),
        wait(180),
      );
    } else {
      rec.do(
        ...together([
          paint(oIdStr(oid - 1), 'good'),
          { type: 'set', id: resIdStr(0), patch: { text: `${prod.name}: ${tot.toLocaleString()}원`, tone: 'good' }, pop: true },
        ]),
        wait(180),
      );
    }
  });

  rec.step({
    title: 'ORDER BY TOTAL_SALES DESC: 김치(20만) → 스낵(16만) → 라면(15만)',
    codeHighlights: BEST_AT.order,
    work: work + 3,
    variables: { 절: 'ORDER BY', 최종출력수: 3 },
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('결과 확인', '총매출 내림차순으로 김치(20만), 스낵(16만), 라면(15만) 순서로 정렬하여 출력을 완료합니다.', BEST_AT.order);
  rec.do(
    ...together([
      { type: 'set', id: resIdStr(1), patch: { rect: { x: RES_X, y: P_Y, w: RES_W, h: 38 }, text: '1위: 김치 (20만원)', tone: 'path' }, pop: true },
      { type: 'set', id: resIdStr(0), patch: { rect: { x: RES_X, y: P_Y + 48, w: RES_W, h: 38 }, text: '2위: 스낵 (16만원)', tone: 'path' }, pop: true },
      { type: 'set', id: resIdStr(2), patch: { rect: { x: RES_X, y: P_Y + 96, w: RES_W, h: 38 }, text: '3위: 라면 (15만원)', tone: 'path' }, pop: true },
      { type: 'set', id: 'status', patch: { text: '정답: [김치 20만, 스낵 16만, 라면 15만] 3개 식품 출력 완료', tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 모든 달 주문 먼저 조인·곱셈 후 필터                              */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 6; // 6건 전부 조인 및 단가 곱셈

  rec.step({ title: '전체 조인: 4월·6월 주문까지 포함해 6건 모두 단가 곱셈', codeHighlights: ALT_AT.join, work, variables: { 절: '전체 조인', 계산주문수: 6 } });
  rec.phase('전체 조인 및 곱셈', '날짜 조건을 나중에 적용하여 4월(#5, 80개)과 6월(#6, 50개) 주문까지 모두 식품 테이블과 조인·곱셈합니다.', ALT_AT.join);
  rec.do(
    ...together([
      ...ORDERS.map((_, r): Action => paint(oIdStr(r), 'chosen')),
      { type: 'set', id: 'status', patch: { text: '6개 주문 전체 조인 및 매출 곱셈 완료 (타 월 2건 낭비)', tone: 'chosen' }, pop: true },
    ]),
    wait(220),
  );

  rec.step({
    title: 'HAVING 5월 필터 + 합산: 정답 동일, 하지만 불필요한 계산 2건 발생',
    codeHighlights: ALT_AT.order,
    work: work + 4,
    variables: { 절: 'HAVING 필터', 결과수: 3 },
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('뒤늦은 필터', '뒤늦게 5월 주문만 남겨 합산합니다. 결과는 같지만 버려질 주문까지 조인·곱셈하느라 더 많은 일을 했습니다.', ALT_AT.order);
  rec.do(
    ...together([
      { type: 'add', item: { id: resIdStr(0), kind: 'token', rect: { x: RES_X, y: P_Y, w: RES_W, h: 38 }, tone: 'path', text: '1위: 김치 (20만원)' } },
      { type: 'add', item: { id: resIdStr(1), kind: 'token', rect: { x: RES_X, y: P_Y + 48, w: RES_W, h: 38 }, tone: 'path', text: '2위: 스낵 (16만원)' } },
      { type: 'add', item: { id: resIdStr(2), kind: 'token', rect: { x: RES_X, y: P_Y + 96, w: RES_W, h: 38 }, tone: 'path', text: '3위: 라면 (15만원)' } },
      { type: 'set', id: 'status', patch: { text: '정답 3건 동일 (전체 조인 연산 10회)', tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: SUM(AMOUNT) 누락으로 스낵의 총매출이 10만원으로 과소 계산됨          */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 4;

  rec.step({
    title: '함정 쿼리: SUM(AMOUNT) 대신 첫 번째 주문(#1)만 단가에 곱함',
    codeHighlights: TRAP_AT.trapSum,
    work,
    variables: { 절: 'SUM 누락', 스낵반영수량: 50 },
  });
  rec.phase(
    '합산 누락',
    'GROUP BY를 하면서 SUM(AMOUNT)으로 묶지 않아 스낵(P001)의 두 번째 주문(#2, 30개)이 증발하고 첫 주문(#1, 50개)만 반영됩니다!',
    TRAP_AT.trapSum,
  );
  rec.do(
    ...together([
      paint(oIdStr(0), 'good'),
      paint(oIdStr(1), 'bad'), // 누락!
      paint(oIdStr(2), 'good'),
      paint(oIdStr(3), 'good'),
      { type: 'add', item: { id: resIdStr(0), kind: 'token', rect: { x: RES_X, y: P_Y, w: RES_W, h: 38 }, tone: 'chosen', text: '김치: 200,000원' } },
      { type: 'add', item: { id: resIdStr(1), kind: 'token', rect: { x: RES_X, y: P_Y + 48, w: RES_W, h: 38 }, tone: 'bad', text: '스낵: 100,000원(누락!)' } },
      { type: 'add', item: { id: resIdStr(2), kind: 'token', rect: { x: RES_X, y: P_Y + 96, w: RES_W, h: 38 }, tone: 'chosen', text: '라면: 150,000원' } },
      { type: 'set', id: 'status', patch: { text: '함정: 스낵 2번째 주문(30개) 누락 → 16만 아닌 10만 계산', tone: 'bad' }, pop: true },
    ]),
    wait(200),
  );

  const wrongAns = [
    ['P002', '맛있는김치', 200000],
    ['P003', '맛있는라면', 150000],
    ['P001', '맛있는스낵', 100000], // 스낵이 3위로 떨어짐!
  ];
  rec.step({
    title: '오답: 스낵이 라면보다 낮은 10만원으로 계산되어 순위가 뒤바뀜',
    codeHighlights: TRAP_AT.done,
    work: work + 3,
    variables: { 절: '결과', 스낵매출: '10만원(오답)', 라면매출: '15만원' },
    answer: wrongAns,
    isKeyframe: true,
  });
  rec.phase('오답 확인', '스낵 총매출이 16만원이 아닌 10만원으로 왜곡되어 라면(15만원)보다 아래 순위로 밀려났습니다. 반드시 SUM()으로 주문 수량을 합산해야 합니다.', TRAP_AT.done);
  rec.do({ type: 'set', id: 'status', patch: { text: '오답: 스낵 순위 2위→3위 왜곡 (SUM 누락으로 10만원 계산)', tone: 'bad' }, pop: true });
  return rec.finish();
}

const problem: Problem = {
  id: 'may-food-total-sales',
  title: '5월 식품들의 총매출 조회하기',
  level: 3,
  category: 'sql-join',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/131117',
  description: {
    summary:
      'FOOD_PRODUCT 테이블과 FOOD_ORDER 테이블에서 생산일자가 2022년 5월인 식품의 식품 ID, 식품 이름, 총매출을 조회합니다. 결과는 총매출을 기준으로 내림차순 정렬하고 총매출이 같다면 식품 ID를 기준으로 오름차순 정렬합니다.',
    rules: [
      "생산일자(PRODUCE_DATE)가 2022년 5월인 주문만 대상으로 함 (PRODUCE_DATE LIKE '2022-05%')",
      '총매출 = SUM(P.PRICE * O.AMOUNT)',
      '결과는 총매출(TOTAL_SALES) 내림차순, 식품 ID(PRODUCT_ID) 오름차순 정렬',
    ],
    examples: [
      {
        input: 'FOOD_PRODUCT = [["P001","맛있는스낵",2000],["P002","맛있는김치",10000],["P003","맛있는라면",1500]], FOOD_ORDER = [[1,"P001",50,"2022-05-01"],[2,"P001",30,"2022-05-15"],[3,"P002",20,"2022-05-10"],[4,"P003",100,"2022-05-20"]]',
        output: '[["P002","맛있는김치",200000],["P001","맛있는스낵",160000],["P003","맛있는라면",150000]]',
      },
    ],
  },
  keyIntuitions: [
    '2022년 5월 주문만 먼저 WHERE PRODUCE_DATE LIKE "2022-05%"로 좁혀 둔 뒤 조인하면 다른 달의 주문을 계산하는 낭비를 없앨 수 있습니다.',
    '같은 식품이 5월에 여러 번 주문될 수 있으므로, 반드시 GROUP BY P.PRODUCT_ID, P.PRODUCT_NAME과 함께 SUM(P.PRICE * O.AMOUNT)으로 수량을 모두 누적해야 합니다.',
    '정렬 조건은 ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC입니다.',
  ],
  demo: {
    input: [PRODUCTS, ORDERS],
    label: 'FOOD_PRODUCT 4종, FOOD_ORDER 6건 (스낵은 5월에 50개+30개 2회 주문되어 16만원)',
  },
  workUnit: '주문 및 식품 처리 건수',
  approaches: [
    {
      id: 'may-sales-join-sum',
      name: '5월 필터 + JOIN + GROUP BY',
      rank: 'BEST',
      timeComplexity: 'O(N + M + K log K)',
      spaceComplexity: 'O(K)',
      verdict: 'WHERE로 5월 주문만 거른 뒤 식품 테이블과 조인해 SUM(PRICE * AMOUNT)으로 총매출을 정확히 집계하는 정석 쿼리입니다.',
      pros: [
        '5월이 아닌 주문을 조인 단계 전에 차단해 연산량이 최소화됩니다.',
        '식품별 다건 주문을 SUM 집계 함수로 누락 없이 정확하게 합산합니다.',
      ],
      cons: ['GROUP BY 컬럼에 PRODUCT_ID와 PRODUCT_NAME을 모두 명시해야 표준 SQL에 부합합니다.'],
      whyThisRank: '조인 전 필터링과 그룹 집계를 가장 전형적이고 최적으로 구사한 풀이입니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'may-sales-join-all-first',
      name: '전체 주문 조인 후 HAVING 필터',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × M)',
      spaceComplexity: 'O(N + M)',
      verdict: '날짜 필터 없이 모든 달의 주문을 먼저 조인하고 단가를 곱한 뒤 마지막에 5월만 추리는 풀이입니다.',
      pros: ['조인 조건을 먼저 생각하고 필터 조건을 나중에 붙이는 순서로 작성하기 쉽습니다.'],
      cons: ['4월·6월 등 대상이 아닌 대량의 주문까지 전부 조인·곱셈 연산을 수행하므로 비효율적입니다.'],
      whyThisRank: '정답은 같지만 필터를 뒤로 미뤄 조인 비용이 커집니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'may-sales-sum-missing-trap',
      name: 'SUM 집계 누락 (다건 주문 과소 계산)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N + M)',
      spaceComplexity: 'O(K)',
      verdict: 'SUM(AMOUNT) 대신 첫 번째 주문 수량만 단가에 곱해, 한 달 동안 여러 번 팔린 식품의 매출이 깎여 순위가 왜곡되는 함정입니다.',
      pros: ['식품당 주문이 1건뿐인 단순 테스트 케이스에서는 우연히 통과할 수 있습니다.'],
      cons: ['스낵처럼 2회 주문된 상품의 매출이 16만원이 아닌 10만원으로 계산되어 오답이 됩니다.'],
      whyThisRank: 'GROUP BY에서 집계 함수(SUM)의 역할을 잊었을 때 발생하는 실무 단골 데이터 오류입니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [PRODUCTS, ORDERS], expected: TRUTH },
      {
        args: [
          [['A1', '사과', 1000]],
          [[1, 'A1', 10, '2022-05-02']],
        ],
        expected: [['A1', '사과', 10000]],
      },
    ],
    random: (rand) => {
      const prods: ProductRow[] = [
        ['P1', '식품1', 1000 + Math.floor(rand() * 2000)],
        ['P2', '식품2', 3000 + Math.floor(rand() * 2000)],
      ];
      const ords: OrderRow[] = [
        [1, 'P1', 10 + Math.floor(rand() * 20), '2022-05-01'],
        [2, 'P1', 5 + Math.floor(rand() * 10), '2022-05-15'],
        [3, 'P2', 15 + Math.floor(rand() * 20), '2022-05-10'],
      ];
      return [prods, ords];
    },
  },
};

export default problem;
