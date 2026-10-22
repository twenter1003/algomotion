// 가격이 제일 비싼 식품의 정보 출력하기: 정석 ORDER BY PRICE DESC LIMIT 1(1회 스캔·상위 1건), 대안 WHERE PRICE = (SELECT MAX(PRICE))(테이블 2회 스캔), 함정 SELECT 일반컬럼, MAX(PRICE)(첫 행 정보에 최고가만 잘못 결합)를 같은 장면에서 움직인다.
import type { Action, AlgorithmStep, CodeHighlights, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
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

type FoodRow = [id: string, name: string, code: string, category: string, price: number];

// 시각화 입력: 6개의 식품 행. 첫 행은 P0018(6,100원)이고 최고가 식품은 4번째 행 P0051(맛있는배추김치, 19,000원)이다.
const FOODS: FoodRow[] = [
  ['P0018', '맛있는고추기름', 'CD_OL00008', '식용유', 6100],
  ['P0019', '맛있는카놀라유', 'CD_OL00009', '식용유', 5100],
  ['P0020', '맛있는산초유', 'CD_OL00010', '식용유', 6500],
  ['P0051', '맛있는배추김치', 'CD_KC00001', '김치', 19000],
  ['P0021', '맛있는케첩', 'CD_SC00001', '소스', 4500],
  ['P0022', '맛있는마요네즈', 'CD_SC00002', '소스', 4700],
];
const TRUTH: FoodRow[] = [['P0051', '맛있는배추김치', 'CD_KC00001', '김치', 19000]];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  sql: `SELECT PRODUCT_ID, PRODUCT_NAME, PRODUCT_CD, CATEGORY, PRICE
FROM FOOD_PRODUCT
ORDER BY PRICE DESC
LIMIT 1;`,
  python: `def solution(foods):
    # ORDER BY PRICE DESC LIMIT 1
    if not foods:
        return []
    ordered = sorted(foods, key=lambda r: r[4], reverse=True)
    return [list(ordered[0])]`,
  javascript: `function solution(foods) {
  // ORDER BY PRICE DESC LIMIT 1
  if (foods.length === 0) return [];
  const ordered = [...foods].sort((a, b) => b[4] - a[4]);
  return [[...ordered[0]]];
}`,
};
const BEST_AT = {
  from: sqlLines(BEST_CODE, ['FROM FOOD_PRODUCT'], ['def solution(foods):'], ['function solution(foods)']),
  order: sqlLines(BEST_CODE, ['ORDER BY PRICE DESC'], ['ordered = sorted(foods, key=lambda r: r[4], reverse=True)'], ['const ordered = [...foods].sort((a, b) => b[4] - a[4]);']),
  limit: sqlLines(BEST_CODE, ['SELECT PRODUCT_ID, PRODUCT_NAME, PRODUCT_CD, CATEGORY, PRICE', 'LIMIT 1;'], ['return [list(ordered[0])]'], ['return [[...ordered[0]]];']),
};

const ALT_CODE = {
  sql: `SELECT PRODUCT_ID, PRODUCT_NAME, PRODUCT_CD, CATEGORY, PRICE
FROM FOOD_PRODUCT
WHERE PRICE = (
  SELECT MAX(PRICE)
  FROM FOOD_PRODUCT
);`,
  python: `def solution(foods):
    # 1단계: 서브쿼리로 MAX(PRICE) 계산
    if not foods:
        return []
    max_price = max(r[4] for r in foods)
    # 2단계: WHERE PRICE = max_price 로 다시 스캔
    return [list(r) for r in foods if r[4] == max_price]`,
  javascript: `function solution(foods) {
  // 1단계: 서브쿼리로 MAX(PRICE) 계산
  if (foods.length === 0) return [];
  const maxPrice = Math.max(...foods.map((r) => r[4]));
  // 2단계: WHERE PRICE = maxPrice 로 다시 스캔
  return foods.filter((r) => r[4] === maxPrice).map((r) => [...r]);
}`,
};
const ALT_AT = {
  subquery: sqlLines(ALT_CODE, ['SELECT MAX(PRICE)', 'FROM FOOD_PRODUCT'], ['max_price = max(r[4] for r in foods)'], ['const maxPrice = Math.max(...foods.map((r) => r[4]));']),
  where: sqlLines(ALT_CODE, ['WHERE PRICE = ('], ['return [list(r) for r in foods if r[4] == max_price]'], ['return foods.filter((r) => r[4] === maxPrice).map((r) => [...r]);']),
  select: sqlLines(ALT_CODE, ['SELECT PRODUCT_ID, PRODUCT_NAME, PRODUCT_CD, CATEGORY, PRICE'], ['return [list(r) for r in foods if r[4] == max_price]'], ['return foods.filter((r) => r[4] === maxPrice).map((r) => [...r]);']),
};

const TRAP_CODE = {
  sql: `-- 함정: GROUP BY 없이 일반 컬럼과 MAX(PRICE)를 함께 조회
SELECT PRODUCT_ID, PRODUCT_NAME, PRODUCT_CD, CATEGORY, MAX(PRICE) AS PRICE
FROM FOOD_PRODUCT;`,
  python: `def solution(foods):
    # 함정: 첫 번째 행의 식품 정보에 전체 MAX(PRICE)만 잘못 붙임
    if not foods:
        return []
    first = foods[0]
    max_price = max(r[4] for r in foods)
    return [[first[0], first[1], first[2], first[3], max_price]]`,
  javascript: `function solution(foods) {
  // 함정: 첫 번째 행의 식품 정보에 전체 MAX(PRICE)만 잘못 붙입니다
  if (foods.length === 0) return [];
  const first = foods[0];
  const maxPrice = Math.max(...foods.map((r) => r[4]));
  return [[first[0], first[1], first[2], first[3], maxPrice]];
}`,
};
const TRAP_AT = {
  scan: sqlLines(TRAP_CODE, ['FROM FOOD_PRODUCT;'], ['first = foods[0]', 'max_price = max(r[4] for r in foods)'], ['const first = foods[0];', 'const maxPrice = Math.max(...foods.map((r) => r[4]));']),
  wrong: sqlLines(TRAP_CODE, ['SELECT PRODUCT_ID, PRODUCT_NAME, PRODUCT_CD, CATEGORY, MAX(PRICE) AS PRICE'], ['return [[first[0], first[1], first[2], first[3], max_price]]'], ['return [[first[0], first[1], first[2], first[3], maxPrice]];']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 600;
const H = 340;
const ROW_X = 14;
const ROW_Y = 38;
const ROW_H = 34;
const ROW_PITCH = 40;
const ROW_W = 328;
const OUT_X = 360;
const OUT_W = 226;

const rowRect = (r: number): Rect => ({ x: ROW_X, y: ROW_Y + r * ROW_PITCH, w: ROW_W, h: ROW_H });
const rowId = (r: number) => `row:${r}`;
const rowText = (f: FoodRow) => `${f[0]} · ${f[1]} · ${f[3]} · ${f[4].toLocaleString()}원`;
const outText = (f: FoodRow) => `${f[0]} ${f[1]} (${f[4].toLocaleString()}원)`;

const TOP_RECT: Rect = { x: OUT_X, y: 42, w: OUT_W, h: 42 };
const RES_RECT: Rect = { x: OUT_X, y: 120, w: OUT_W, h: 46 };

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:in', kind: 'text', rect: { x: ROW_X, y: 10, w: ROW_W, h: 22 }, tone: 'muted', text: 'FOOD_PRODUCT 테이블 (6행)' },
    { id: 'hdr:out', kind: 'text', rect: { x: OUT_X, y: 10, w: OUT_W, h: 22 }, tone: 'chosen', text: '최고가 추적 / 결과' },
    { id: 'top', kind: 'token', rect: TOP_RECT, tone: 'plain', text: '최고가 후보: 대기 중' },
    { id: 'status', kind: 'token', rect: { x: ROW_X, y: 292, w: 572, h: 32 }, tone: 'plain', text: '쿼리 실행 대기' },
  ];
  FOODS.forEach((f, r) => {
    items.push({ id: rowId(r), kind: 'token', rect: rowRect(r), tone: 'plain', text: rowText(f) });
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석: ORDER BY PRICE DESC LIMIT 1 (1회 스캔으로 최고가 행 선택)      */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  let best: FoodRow | null = null;
  let bestIdx = -1;
  const meta = (clause: string, cur = '-') => ({
    work,
    variables: { 절: clause, 현재식품: cur, 최고가: best ? `${best[0]}(${best[4]}원)` : '-' },
  });

  rec.step({ title: 'FROM FOOD_PRODUCT: 6개 식품 행 스캔 시작', codeHighlights: BEST_AT.from, ...meta('FROM') });
  rec.phase('테이블 읽기', 'FOOD_PRODUCT 테이블을 한 번 읽으며 가격(PRICE) 내림차순 1위 행을 찾습니다.', BEST_AT.from);
  rec.do({ type: 'set', id: 'status', patch: { text: 'ORDER BY PRICE DESC LIMIT 1 (상위 1건 탐색 시작)', tone: 'chosen' }, pop: true }, wait(180));

  FOODS.forEach((f, r) => {
    const [id, name, , , price] = f;
    work += 1;
    const isNewBest = !best || price > best[4];
    const prevIdx = bestIdx;
    if (isNewBest) {
      best = f;
      bestIdx = r;
    }

    rec.step({
      title: `가격 비교: ${id} ${name} (${price.toLocaleString()}원) → ${isNewBest ? '1위 갱신!' : '유지'}`,
      codeHighlights: BEST_AT.order,
      ...meta('ORDER BY PRICE DESC', `${id}(${price}원)`),
    });
    rec.phase(
      'ORDER BY 비교',
      isNewBest
        ? `${id} ${name}의 가격 ${price.toLocaleString()}원이 현재 최고가보다 높아 1위 후보를 이 행 통째로 바꿉니다.`
        : `${id} ${name}(${price.toLocaleString()}원)은 현재 1위 ${best![0]}(${best![4].toLocaleString()}원)보다 저렴합니다.`,
      BEST_AT.order,
    );
    const acts: Action[] = [
      { type: 'focus', ids: [rowId(r)] },
      paint(rowId(r), isNewBest ? 'good' : 'visited'),
    ];
    if (isNewBest && prevIdx >= 0) acts.push(paint(rowId(prevIdx), 'visited'));
    if (isNewBest) {
      acts.push({ type: 'set', id: 'top', patch: { text: `1위: ${id} ${name} (${price.toLocaleString()}원)`, tone: 'good' }, pop: true });
    }
    rec.do(...together(acts), wait(160), { type: 'unfocus' });
  });

  work += 1;
  rec.step({
    title: `ORDER BY PRICE DESC: 가격순 정렬 확정 (1위 ${best![0]})`,
    codeHighlights: BEST_AT.order,
    ...meta('ORDER BY', best![0]),
  });
  rec.phase('내림차순 정렬', '가격 내림차순으로 정렬하면 19,000원인 P0051(맛있는배추김치) 행이 맨 위에 옵니다.', BEST_AT.order);
  rec.do(
    ...together([
      paint(rowId(bestIdx), 'chosen'),
      { type: 'set', id: 'status', patch: { text: 'ORDER BY PRICE DESC → 1위 P0051(19,000원)', tone: 'chosen' }, pop: true },
    ]),
    wait(180),
  );

  rec.step({
    title: `LIMIT 1 완료: P0051 맛있는배추김치 19,000원 (연산 ${work}회)`,
    codeHighlights: BEST_AT.limit,
    ...meta('LIMIT 1', '완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('LIMIT 1 출력', '맨 위 1건의 모든 컬럼(ID, 이름, 코드, 분류, 가격)을 그대로 출력합니다.', BEST_AT.limit);
  rec.do(
    ...together([
      { type: 'add', item: { id: 'out:0', kind: 'token', rect: RES_RECT, tone: 'path', text: outText(best!) }, from: rowId(bestIdx) },
      paint(rowId(bestIdx), 'path'),
      { type: 'set', id: 'status', patch: { text: `정답: P0051 맛있는배추김치 19,000원 (1회 스캔, 연산 ${work}회)`, tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: WHERE PRICE = (SELECT MAX(PRICE) FROM FOOD_PRODUCT) (2회 스캔) */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  let maxPrice = 0;
  const meta = (clause: string, stepInfo = '-') => ({
    work,
    variables: { 절: clause, 단계: stepInfo, MAX_PRICE: maxPrice ? `${maxPrice}원` : '-' },
  });

  FOODS.forEach(([id, name, , , price], r) => {
    work += 1;
    if (price > maxPrice) maxPrice = price;
    rec.step({
      title: `[1차 스캔·서브쿼리] ${id} ${name}: 가격 ${price.toLocaleString()}원 → MAX=${maxPrice.toLocaleString()}원`,
      codeHighlights: ALT_AT.subquery,
      ...meta('서브쿼리 MAX(PRICE)', `${id}(${price}원)`),
    });
    rec.phase('1차 스캔 (MAX)', `서브쿼리가 ${id} 행의 가격(${price.toLocaleString()}원)만 읽어 MAX(PRICE) = ${maxPrice.toLocaleString()}원을 갱신합니다.`, ALT_AT.subquery);
    rec.do(
      ...together([
        paint(rowId(r), 'visited'),
        { type: 'set', id: 'top', patch: { text: `서브쿼리 MAX(PRICE) = ${maxPrice.toLocaleString()}원`, tone: 'chosen' }, pop: true },
      ]),
      wait(140),
    );
  });

  FOODS.forEach((f, r) => {
    const [id, name, , , price] = f;
    work += 1;
    const matched = price === maxPrice;
    rec.step({
      title: `[2차 스캔·본 쿼리] ${id} (${price.toLocaleString()}원) = ${maxPrice.toLocaleString()}원? → ${matched ? '일치!' : '불일치'}`,
      codeHighlights: ALT_AT.where,
      ...meta('WHERE PRICE = MAX', `${id}`),
    });
    rec.phase(
      '2차 스캔 (WHERE)',
      matched
        ? `${id} ${name}의 가격이 서브쿼리 결과(${maxPrice.toLocaleString()}원)와 일치하므로 결과에 담습니다.`
        : `본 쿼리가 다시 처음부터 테이블을 훑으며 ${id}(${price.toLocaleString()}원)를 비교합니다.`,
      ALT_AT.where,
    );
    if (matched) {
      rec.do(
        ...together([
          paint(rowId(r), 'good'),
          { type: 'add', item: { id: 'out:0', kind: 'token', rect: RES_RECT, tone: 'chosen', text: outText(f) }, from: rowId(r) },
        ]),
        wait(160),
      );
    } else {
      rec.do(paint(rowId(r), 'muted'), wait(130));
    }
  });

  rec.step({
    title: `SELECT 완료: 정답은 같지만 테이블 2회 스캔 (연산 ${work}회)`,
    codeHighlights: ALT_AT.select,
    ...meta('SELECT', '완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('마무리', `서브쿼리에서 6행, 본 쿼리에서 6행을 읽어 총 ${work}번(정석의 약 2배) 행을 스캔했습니다.`, ALT_AT.select);
  rec.do(
    ...together([
      paint('out:0', 'path'),
      { type: 'set', id: 'status', patch: { text: `정답 동일 (서브쿼리+본쿼리 2회 스캔, 연산 ${work}회)`, tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: SELECT 일반컬럼, MAX(PRICE) (첫 행 정보 + 최고가 잘못 결합)     */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  let maxPrice = 0;
  const first = FOODS[0];
  const meta = (clause: string, info = '-') => ({
    work,
    variables: { 절: clause, 이름컬럼: `${first[0]}(${first[1]})`, 'MAX(PRICE)': maxPrice ? `${maxPrice}원` : info },
  });

  rec.step({
    title: '함정 쿼리: GROUP BY 없이 일반 컬럼과 MAX(PRICE) 동시 조회',
    codeHighlights: TRAP_AT.scan,
    ...meta('FROM', '대기'),
  });
  rec.phase(
    '함정 시작',
    'SELECT 절에 집계 함수 MAX(PRICE)와 일반 컬럼(PRODUCT_ID, PRODUCT_NAME 등)을 그냥 나열하면, 일반 컬럼은 첫 번째 행(P0018)에 고정됩니다!',
    TRAP_AT.scan,
  );
  rec.do(
    ...together([
      paint(rowId(0), 'bad'),
      { type: 'set', id: 'top', patch: { text: `일반 컬럼 고정: ${first[0]} ${first[1]}`, tone: 'bad' }, pop: true },
      { type: 'set', id: 'status', patch: { text: '주의: 일반 컬럼은 첫 행(P0018)이고 가격만 MAX로 따로 집계됨!', tone: 'bad' }, pop: true },
    ]),
    wait(200),
  );

  FOODS.forEach(([id, , , , price], r) => {
    work += 1;
    if (price > maxPrice) maxPrice = price;
    rec.step({
      title: `MAX(PRICE)만 갱신: ${id}(${price.toLocaleString()}원) → MAX=${maxPrice.toLocaleString()}원 (이름은 여전히 ${first[1]})`,
      codeHighlights: TRAP_AT.scan,
      ...meta('MAX(PRICE)', `${maxPrice}원`),
    });
    rec.phase(
      '따로 노는 집계',
      price === 19000
        ? `P0051 배추김치에서 최고가 19,000원을 찾았지만, PRODUCT_NAME은 바뀌지 않고 첫 행(${first[1]}) 그대로입니다!`
        : `${id} 행에서 가격만 비교해 MAX(PRICE) = ${maxPrice.toLocaleString()}원을 유지합니다.`,
      TRAP_AT.scan,
    );
    rec.do(
      ...together([
        paint(rowId(r), r === 0 ? 'bad' : 'visited'),
        { type: 'set', id: 'top', patch: { text: `${first[0]} ${first[1]} + MAX=${maxPrice.toLocaleString()}원`, tone: 'bad' }, pop: true },
      ]),
      wait(150),
    );
  });

  const wrongRow: FoodRow = [first[0], first[1], first[2], first[3], maxPrice];
  const wrongAns: FoodRow[] = [wrongRow];

  rec.step({
    title: `오답: ${first[0]}(${first[1]})에 가격만 19,000원이 붙은 가짜 행 반환`,
    codeHighlights: TRAP_AT.wrong,
    ...meta('SELECT 오답', `${maxPrice}원`),
    answer: wrongAns,
    isKeyframe: true,
  });
  rec.phase(
    '오답 확인',
    '맛있는고추기름(원래 6,100원)에 배추김치 가격(19,000원)이 합쳐진 엉뚱한 행이 출력됩니다. 최고가 행 전체를 가져오려면 ORDER BY PRICE DESC LIMIT 1이나 서브쿼리를 써야 합니다.',
    TRAP_AT.wrong,
  );
  rec.do(
    ...together([
      { type: 'add', item: { id: 'out:0', kind: 'token', rect: RES_RECT, tone: 'bad', text: `${wrongRow[0]} ${wrongRow[1]} (${wrongRow[4].toLocaleString()}원) [오답]` }, from: rowId(0) },
      { type: 'set', id: 'status', patch: { text: '오답: P0018 맛있는고추기름 19,000원 · 정답은 P0051 맛있는배추김치', tone: 'bad' }, pop: true },
    ]),
  );
  return rec.finish();
}

const problem: Problem = {
  id: 'most-expensive-food',
  title: '가격이 제일 비싼 식품의 정보 출력하기',
  level: 2,
  category: 'sql-aggregate',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/131115',
  description: {
    summary:
      'FOOD_PRODUCT 테이블에서 가격이 제일 비싼 식품의 식품 ID, 식품 이름, 식품 코드, 식품분류, 식품 가격을 조회합니다.',
    rules: [
      '출력 컬럼: PRODUCT_ID, PRODUCT_NAME, PRODUCT_CD, CATEGORY, PRICE',
      '가장 비싼 가격(MAX(PRICE))만 구하는 것이 아니라 그 가격을 가진 식품 행 전체를 출력해야 함',
      'SELECT 절에 MAX(PRICE)와 일반 컬럼을 그냥 함께 쓰면 첫 번째 행의 정보에 최고가만 붙으므로 오답',
    ],
    examples: [
      {
        input: 'FOOD_PRODUCT = [["P0018","맛있는고추기름","CD_OL00008","식용유",6100], ["P0051","맛있는배추김치","CD_KC00001","김치",19000]]',
        output: '[["P0051","맛있는배추김치","CD_KC00001","김치",19000]]',
      },
    ],
  },
  keyIntuitions: [
    'MAX(PRICE)는 가장 큰 가격 숫자 하나만 돌려줄 뿐, 그 가격이 어느 행에서 나왔는지는 자동으로 따라오지 않습니다.',
    '최고가 식품이 1건일 때는 ORDER BY PRICE DESC LIMIT 1로 정렬 후 맨 위 1행 전체를 가져오는 것이 가장 간결하고 빠릅니다.',
    '서브쿼리 WHERE PRICE = (SELECT MAX(PRICE) FROM FOOD_PRODUCT)를 쓰면 공동 1위가 있을 때도 안전하지만 테이블을 두 번 읽게 됩니다.',
  ],
  demo: {
    input: [FOODS],
    label: 'FOOD_PRODUCT 6행 (첫 행 P0018 6,100원, 최고가 P0051 배추김치 19,000원)',
  },
  workUnit: '스캔·비교한 테이블 행 수',
  approaches: [
    {
      id: 'most-expensive-order-limit',
      name: 'ORDER BY DESC + LIMIT 1',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: '가격 내림차순 정렬과 LIMIT 1을 조합해 한 번의 스캔(Top-1 선택)으로 최고가 식품 행 전체를 바로 조회하는 정석 풀이입니다.',
      pros: [
        '서브쿼리 없이 테이블을 한 번만 읽어 최고가 행의 모든 컬럼을 온전히 가져옵니다.',
        'PRICE에 인덱스가 있으면 정렬조차 없이 인덱스 끝에서 1건만 즉시 읽습니다.',
      ],
      cons: ['최고가 동률 식품이 여러 개일 때는 그중 1건만 반환합니다.'],
      whyThisRank: '단일 최고가 행을 찾을 때 가장 짧고 실행 비용이 적은 SQL 패턴입니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'most-expensive-max-subquery',
      name: 'WHERE PRICE = (SELECT MAX(PRICE))',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(2N)',
      spaceComplexity: 'O(1)',
      verdict: '서브쿼리로 최고가 숫자를 먼저 구한 뒤, 본 쿼리에서 다시 전체 행을 훑어 가격이 같은 행을 찾는 풀이입니다.',
      pros: ['최고가 식품이 여러 개(공동 1위)여도 빠짐없이 모두 조회할 수 있습니다.'],
      cons: ['인덱스가 없으면 서브쿼리에서 한 번, 본 쿼리에서 한 번 총 두 번 전체 테이블을 스캔합니다.'],
      whyThisRank: '정석과 같은 답을 내며 공동 1위에도 안전하지만, 테이블 스캔 횟수가 2배입니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'most-expensive-bare-max-trap',
      name: 'SELECT 일반컬럼, MAX(PRICE) 혼용',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: 'GROUP BY 없이 일반 컬럼들과 MAX(PRICE)를 함께 SELECT해 첫 번째 행의 식품 이름에 최고가만 잘못 붙이는 함정입니다.',
      pros: ['언뜻 보기에 최고가와 식품 정보를 함께 달라는 뜻처럼 보여 작성하기 쉽습니다.'],
      cons: [
        '표준 SQL 및 ONLY_FULL_GROUP_BY 모드에서는 문법 오류가 발생하고, 허용하는 환경에서도 엉뚱한 첫 행의 이름과 최고가가 섞여 오답이 됩니다.',
      ],
      whyThisRank: 'SQL 집계 함수를 처음 배울 때 가장 많이 틀리는 대표 오답 패턴입니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [FOODS], expected: TRUTH },
      {
        args: [[
          ['P0001', '참기름', 'CD_01', '식용유', 8000],
          ['P0002', '들기름', 'CD_02', '식용유', 12000],
          ['P0003', '간장', 'CD_03', '소스', 5000],
        ]],
        expected: [['P0002', '들기름', 'CD_02', '식용유', 12000]],
      },
      {
        args: [[
          ['P0010', '고추장', 'CD_10', '장류', 15000],
          ['P0011', '된장', 'CD_11', '장류', 9000],
        ]],
        expected: [['P0010', '고추장', 'CD_10', '장류', 15000]],
      },
    ],
    random: (rand) => {
      const n = 3 + Math.floor(rand() * 5);
      const cats = ['식용유', '김치', '소스', '국', '면'];
      const rows: FoodRow[] = Array.from({ length: n }, (_, i) => [
        `P00${10 + i}`,
        `식품${i + 1}`,
        `CD_0${i + 1}`,
        cats[i % cats.length],
        // 고유한 가격을 부여해 LIMIT 1과 WHERE PRICE = MAX(PRICE) 결과가 항상 일치하도록 함
        (1 + Math.floor(rand() * 30)) * 1000 + i * 100,
      ]);
      return [rows];
    },
  },
};

export default problem;
