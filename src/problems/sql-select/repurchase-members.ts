// 재구매가 일어난 상품과 회원 리스트 구하기: 정석 GROUP BY (USER_ID, PRODUCT_ID) + HAVING COUNT >= 2, 대안 셀프 조인으로 다른 판매 ID 짝 찾기, 함정 GROUP BY USER_ID만 묶기(서로 다른 상품 구매도 재구매로 오판)를 같은 장면에서 움직인다.
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

type SaleRow = [saleId: number, userId: number, productId: number];

// 시각화 입력: 7건의 판매 기록.
// (1, 10) 2번, (1, 20) 2번, (2, 10) 1번, (2, 30) 1번(회원 2는 총 2번 샀지만 서로 다른 상품!), (3, 20) 1번.
// 정석 정답: [[1, 20], [1, 10]]. 회원만 묶는 함정은 회원 2까지 포함해 오답을 낸다.
const SALES: SaleRow[] = [
  [1, 1, 10],
  [2, 2, 10],
  [3, 1, 20],
  [4, 1, 10],
  [5, 2, 30],
  [6, 1, 20],
  [7, 3, 20],
];
const R = SALES.length;
const TRUTH = [
  [1, 20],
  [1, 10],
];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  sql: `SELECT USER_ID, PRODUCT_ID
FROM ONLINE_SALE
GROUP BY USER_ID, PRODUCT_ID
HAVING COUNT(*) >= 2
ORDER BY USER_ID ASC, PRODUCT_ID DESC;`,
  python: `def solution(sales):
    # GROUP BY USER_ID, PRODUCT_ID
    counts = {}
    for sale_id, user_id, product_id in sales:
        key = (user_id, product_id)
        counts[key] = counts.get(key, 0) + 1
    # HAVING COUNT(*) >= 2 + ORDER BY USER_ID ASC, PRODUCT_ID DESC
    pairs = [[u, p] for (u, p), c in counts.items() if c >= 2]
    pairs.sort(key=lambda r: (r[0], -r[1]))
    return pairs`,
  javascript: `function solution(sales) {
  // GROUP BY USER_ID, PRODUCT_ID
  const counts = new Map();
  for (const [, userId, productId] of sales) {
    const key = \`\${userId}:\${productId}\`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  // HAVING COUNT(*) >= 2 + ORDER BY USER_ID ASC, PRODUCT_ID DESC
  const pairs = [];
  for (const [key, c] of counts) {
    if (c >= 2) pairs.push(key.split(':').map(Number));
  }
  return pairs.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
}`,
};
const BEST_AT = {
  group: sqlLines(BEST_CODE, ['FROM ONLINE_SALE', 'GROUP BY USER_ID, PRODUCT_ID'], ['for sale_id, user_id, product_id in sales:', 'counts[key] = counts.get(key, 0) + 1'], ['for (const [, userId, productId] of sales)', 'counts.set(key, (counts.get(key) ?? 0) + 1)']),
  having: sqlLines(BEST_CODE, ['HAVING COUNT(*) >= 2'], ['pairs = [[u, p] for (u, p), c in counts.items() if c >= 2]'], ['if (c >= 2) pairs.push(key.split(\':\').map(Number))']),
  order: sqlLines(BEST_CODE, ['SELECT USER_ID, PRODUCT_ID', 'ORDER BY USER_ID ASC, PRODUCT_ID DESC;'], ['pairs.sort(key=lambda r: (r[0], -r[1]))', 'return pairs'], ['return pairs.sort((a, b) => a[0] - b[0] || b[1] - a[1]);']),
};

const ALT_CODE = {
  sql: `SELECT DISTINCT A.USER_ID, A.PRODUCT_ID
FROM ONLINE_SALE A
JOIN ONLINE_SALE B
  ON A.USER_ID = B.USER_ID
 AND A.PRODUCT_ID = B.PRODUCT_ID
 AND A.ONLINE_SALE_ID <> B.ONLINE_SALE_ID
ORDER BY A.USER_ID ASC, A.PRODUCT_ID DESC;`,
  python: `def solution(sales):
    # 셀프 조인으로 같은 회원·같은 상품의 다른 판매 기록이 있는지 대조
    found = set()
    for id1, u1, p1 in sales:
        for id2, u2, p2 in sales:
            if id1 != id2 and u1 == u2 and p1 == p2:
                found.add((u1, p1))
    pairs = [[u, p] for u, p in found]
    pairs.sort(key=lambda r: (r[0], -r[1]))
    return pairs`,
  javascript: `function solution(sales) {
  // 셀프 조인으로 같은 회원·같은 상품의 다른 판매 기록이 있는지 대조합니다
  const found = new Map();
  for (const [id1, u1, p1] of sales) {
    for (const [id2, u2, p2] of sales) {
      if (id1 !== id2 && u1 === u2 && p1 === p2) {
        found.set(\`\${u1}:\${p1}\`, [u1, p1]);
      }
    }
  }
  return [...found.values()].sort((a, b) => a[0] - b[0] || b[1] - a[1]);
}`,
};
const ALT_AT = {
  join: sqlLines(ALT_CODE, ['FROM ONLINE_SALE A', 'JOIN ONLINE_SALE B', 'ON A.USER_ID = B.USER_ID', 'AND A.PRODUCT_ID = B.PRODUCT_ID'], ['for id1, u1, p1 in sales:', 'for id2, u2, p2 in sales:', 'if id1 != id2 and u1 == u2 and p1 == p2:'], ['for (const [id1, u1, p1] of sales)', 'for (const [id2, u2, p2] of sales)', 'if (id1 !== id2 && u1 === u2 && p1 === p2)']),
  order: sqlLines(ALT_CODE, ['SELECT DISTINCT A.USER_ID, A.PRODUCT_ID', 'ORDER BY A.USER_ID ASC, A.PRODUCT_ID DESC;'], ['pairs.sort(key=lambda r: (r[0], -r[1]))', 'return pairs'], ['return [...found.values()].sort((a, b) => a[0] - b[0] || b[1] - a[1]);']),
};

const TRAP_CODE = {
  sql: `-- 함정: PRODUCT_ID를 빼고 USER_ID만으로 GROUP BY
SELECT USER_ID, MAX(PRODUCT_ID) AS PRODUCT_ID
FROM ONLINE_SALE
GROUP BY USER_ID
HAVING COUNT(*) >= 2
ORDER BY USER_ID ASC, PRODUCT_ID DESC;`,
  python: `def solution(sales):
    # 함정: 회원(user_id)만으로 묶어 서로 다른 상품을 산 것도 재구매로 침
    by_user = {}
    for sale_id, user_id, product_id in sales:
        by_user.setdefault(user_id, []).append(product_id)
    pairs = [[u, max(ps)] for u, ps in by_user.items() if len(ps) >= 2]
    pairs.sort(key=lambda r: (r[0], -r[1]))
    return pairs`,
  javascript: `function solution(sales) {
  // 함정: 회원(userId)만으로 묶어 서로 다른 상품을 산 것도 재구매로 칩니다
  const byUser = new Map();
  for (const [, userId, productId] of sales) {
    if (!byUser.has(userId)) byUser.set(userId, []);
    byUser.get(userId).push(productId);
  }
  const pairs = [];
  for (const [u, ps] of byUser) {
    if (ps.length >= 2) pairs.push([u, Math.max(...ps)]);
  }
  return pairs.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
}`,
};
const TRAP_AT = {
  group: sqlLines(TRAP_CODE, ['GROUP BY USER_ID', 'HAVING COUNT(*) >= 2'], ['for sale_id, user_id, product_id in sales:', 'by_user.setdefault(user_id, []).append(product_id)'], ['for (const [, userId, productId] of sales)', 'byUser.get(userId).push(productId)']),
  done: sqlLines(TRAP_CODE, ['SELECT USER_ID, MAX(PRODUCT_ID) AS PRODUCT_ID', 'ORDER BY USER_ID ASC, PRODUCT_ID DESC;'], ['pairs = [[u, max(ps)] for u, ps in by_user.items() if len(ps) >= 2]', 'return pairs'], ['if (ps.length >= 2) pairs.push([u, Math.max(...ps)]);', 'return pairs.sort']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 600;
const H = 368;
const IN_X = 14;
const IN_Y = 36;
const IN_W = 240;
const IN_H = 32;
const IN_PITCH = 38;
const GRP_X = 286;
const GRP_W = 298;

const inRect = (r: number): Rect => ({ x: IN_X, y: IN_Y + r * IN_PITCH, w: IN_W, h: IN_H });
const grpRect = (slot: number): Rect => ({ x: GRP_X, y: IN_Y + slot * 46, w: GRP_W, h: 36 });
const inId = (r: number) => `in:${r}`;
const grpId = (slot: number) => `grp:${slot}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:in', kind: 'text', rect: { x: IN_X, y: 8, w: IN_W, h: 22 }, tone: 'muted', text: 'ONLINE_SALE (판매 7건)' },
    { id: 'hdr:grp', kind: 'text', rect: { x: GRP_X, y: 8, w: GRP_W, h: 22 }, tone: 'chosen', text: '그룹 집계 / 결과' },
    { id: 'status', kind: 'token', rect: { x: IN_X, y: 320, w: 570, h: 32 }, tone: 'plain', text: 'GROUP BY 준비' },
  ];
  SALES.forEach(([sid, uid, pid], r) => {
    items.push({ id: inId(r), kind: 'token', rect: inRect(r), tone: 'plain', text: `#${sid} · 회원 ${uid} · 상품 ${pid}` });
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석: GROUP BY (USER_ID, PRODUCT_ID) + HAVING COUNT >= 2            */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const groups = new Map<string, { slot: number; u: number; p: number; count: number }>();
  const meta = (clause: string, pair = '-') => ({
    work,
    variables: { 절: clause, 조합: pair, 그룹수: groups.size },
  });

  SALES.forEach(([sid, uid, pid], r) => {
    const key = `(${uid}, ${pid})`;
    const prev = groups.get(key);
    const slot = prev ? prev.slot : groups.size;
    const count = (prev?.count ?? 0) + 1;
    groups.set(key, { slot, u: uid, p: pid, count });
    work += 1;

    rec.step({
      title: `판매 #${sid}: (회원 ${uid}, 상품 ${pid}) → ${count}회`,
      codeHighlights: BEST_AT.group,
      ...meta('GROUP BY', key),
    });
    rec.phase('그룹 묶기', `판매 #${sid}을 (USER_ID=${uid}, PRODUCT_ID=${pid}) 버킷에 모아 건수를 ${count}로 올립니다.`, BEST_AT.group);
    if (!prev) {
      rec.do(
        ...together([
          paint(inId(r), 'visited'),
          { type: 'add', item: { id: grpId(slot), kind: 'token', rect: grpRect(slot), tone: 'plain', text: `(회원 ${uid}, 상품 ${pid}) → COUNT = 1` }, from: inId(r) },
        ]),
        wait(160),
      );
    } else {
      rec.do(
        ...together([
          paint(inId(r), 'visited'),
          { type: 'set', id: grpId(slot), patch: { text: `(회원 ${uid}, 상품 ${pid}) → COUNT = ${count}`, tone: count >= 2 ? 'good' : 'plain' }, pop: true },
        ]),
        wait(160),
      );
    }
  });

  rec.step({ title: 'HAVING COUNT(*) >= 2: 2회 이상 재구매한 2개 쌍만 선택', codeHighlights: BEST_AT.having, ...meta('HAVING', '(1,10), (1,20)') });
  rec.phase('HAVING 필터', 'COUNT가 1인 세 그룹((2,10), (2,30), (3,20))은 버리고 COUNT = 2인 (1,10)과 (1,20)만 남깁니다.', BEST_AT.having);
  rec.do(
    ...together([
      paint(grpId(0), 'good'),
      paint(grpId(1), 'muted'),
      paint(grpId(2), 'good'),
      paint(grpId(3), 'muted'),
      paint(grpId(4), 'muted'),
      { type: 'set', id: 'status', patch: { text: 'HAVING COUNT(*) >= 2 → (1, 10), (1, 20) 2개 그룹 통과', tone: 'chosen' }, pop: true },
    ]),
    wait(200),
  );

  rec.step({
    title: 'ORDER BY USER_ID ASC, PRODUCT_ID DESC → [[1, 20], [1, 10]]',
    codeHighlights: BEST_AT.order,
    ...meta('ORDER BY', '완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('정렬 및 출력', '회원 ID 오름차순, 같으면 상품 ID 내림차순이므로 (1, 20)이 먼저, (1, 10)이 다음에 출력됩니다.', BEST_AT.order);
  rec.do(
    ...together([
      { type: 'set', id: grpId(0), patch: { text: '1위: [회원 1, 상품 20] (2회)', tone: 'path' }, pop: true },
      { type: 'set', id: grpId(2), patch: { rect: grpRect(1), text: '2위: [회원 1, 상품 10] (2회)', tone: 'path' }, pop: true },
      { type: 'remove', id: grpId(1) },
      { type: 'remove', id: grpId(3) },
      { type: 'remove', id: grpId(4) },
      { type: 'set', id: 'status', patch: { text: '정답: [[1, 20], [1, 10]] (행 스캔 7회)', tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 셀프 조인으로 7×7 대조                                          */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  let slot = 0;
  const seen = new Set<string>();
  const meta = (stepDesc: string) => ({
    work,
    variables: { 방식: 'SELF JOIN', 단계: stepDesc, 찾은쌍: seen.size },
  });

  SALES.forEach(([sid, uid, pid], r) => {
    work += R;
    const match = SALES.find(([sid2, u2, p2]) => sid2 !== sid && u2 === uid && p2 === pid);
    const key = `${uid}:${pid}`;
    const isNew = !!match && !seen.has(key);
    if (isNew) seen.add(key);

    rec.step({
      title: `A.#${sid}(회원 ${uid}, 상품 ${pid}) ↔ B 전체 ${R}건 대조`,
      codeHighlights: ALT_AT.join,
      ...meta(`#${sid} 대조`),
    });
    rec.phase(
      '셀프 조인 대조',
      match
        ? `판매 #${sid}과 회원·상품이 같고 판매 ID만 다른 #${match[0]}을 찾았습니다(비교 ${R}회 누적 ${work}회).`
        : `판매 #${sid}은 전체 ${R}건과 대조했지만 같은 회원·상품의 다른 판매 기록이 없습니다.`,
      ALT_AT.join,
    );
    if (isNew) {
      const curSlot = slot++;
      rec.do(
        ...together([
          paint(inId(r), 'good'),
          { type: 'add', item: { id: grpId(curSlot), kind: 'token', rect: grpRect(curSlot), tone: 'chosen', text: `재구매 확인: (회원 ${uid}, 상품 ${pid})` }, from: inId(r) },
        ]),
        wait(160),
      );
    } else {
      rec.do(paint(inId(r), match ? 'visited' : 'muted'), wait(150));
    }
  });

  rec.step({
    title: `DISTINCT + 정렬 완료: 정답 동일, 비교 ${work}회`,
    codeHighlights: ALT_AT.order,
    ...meta('완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('마무리', `정답은 같지만 GROUP BY 한 번(7회) 대신 7×7 = ${work}번 행을 대조했습니다.`, ALT_AT.order);
  rec.do(
    ...together([
      { type: 'set', id: grpId(0), patch: { text: '1위: [회원 1, 상품 20]', tone: 'path' }, pop: true },
      { type: 'set', id: grpId(1), patch: { text: '2위: [회원 1, 상품 10]', tone: 'path' }, pop: true },
      { type: 'set', id: 'status', patch: { text: `정답 [[1, 20], [1, 10]] (셀프 조인 비교 ${work}회)`, tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: GROUP BY USER_ID만으로 묶기                                     */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const byUser = new Map<number, { slot: number; products: number[] }>();
  const meta = (clause: string, user = '-') => ({
    work,
    variables: { 절: clause, 회원: user, 회원그룹수: byUser.size },
  });

  SALES.forEach(([sid, uid, pid], r) => {
    const prev = byUser.get(uid);
    const slot = prev ? prev.slot : byUser.size;
    const products = [...(prev?.products ?? []), pid];
    byUser.set(uid, { slot, products });
    work += 1;

    rec.step({
      title: `판매 #${sid}: 회원 ${uid} 그룹에 상품 ${pid} 추가 (총 ${products.length}건)`,
      codeHighlights: TRAP_AT.group,
      ...meta('GROUP BY USER_ID', `회원 ${uid}`),
    });
    rec.phase(
      '회원만 묶기',
      uid === 2 && products.length === 2
        ? '회원 2는 상품 10과 상품 30을 각각 1번씩 샀는데, USER_ID로만 묶어서 구매 횟수가 2회가 되어 버립니다!'
        : `PRODUCT_ID를 빼먹고 USER_ID=${uid}로만 묶어 구매 기록([${products.join(', ')}])을 합칩니다.`,
      TRAP_AT.group,
    );
    if (!prev) {
      rec.do(
        ...together([
          paint(inId(r), 'visited'),
          { type: 'add', item: { id: grpId(slot), kind: 'token', rect: grpRect(slot), tone: 'plain', text: `회원 ${uid}: 상품 [${products.join(', ')}]` }, from: inId(r) },
        ]),
        wait(160),
      );
    } else {
      rec.do(
        ...together([
          paint(inId(r), uid === 2 ? 'bad' : 'visited'),
          { type: 'set', id: grpId(slot), patch: { text: `회원 ${uid}: 상품 [${products.join(', ')}] (${products.length}건)`, tone: uid === 2 ? 'bad' : 'chosen' }, pop: true },
        ]),
        wait(160),
      );
    }
  });

  const wrongAns = [
    [1, 20],
    [2, 30],
  ];
  rec.step({
    title: '오답: 회원 1의 상품 10이 누락되고 회원 2가 잘못 포함됨',
    codeHighlights: TRAP_AT.done,
    ...meta('HAVING + SELECT', '오답'),
    answer: wrongAns,
    isKeyframe: true,
  });
  rec.phase(
    '오답 확인',
    'GROUP BY USER_ID만 쓰면 회원 1이 재구매한 두 상품(10, 20)이 하나로 합쳐지고, 서로 다른 상품을 산 회원 2까지 재구매자로 잘못 뽑힙니다.',
    TRAP_AT.done,
  );
  rec.do(
    ...together([
      paint(grpId(0), 'bad'),
      paint(grpId(1), 'bad'),
      paint(grpId(2), 'muted'),
      { type: 'set', id: 'status', patch: { text: '오답 [[1, 20], [2, 30]] · 정답은 [[1, 20], [1, 10]]', tone: 'bad' }, pop: true },
    ]),
  );
  return rec.finish();
}

const problem: Problem = {
  id: 'repurchase-members',
  title: '재구매가 일어난 상품과 회원 리스트 구하기',
  level: 2,
  category: 'sql-select',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/131536',
  description: {
    summary:
      'ONLINE_SALE 테이블에서 동일한 회원이 동일한 상품을 재구매한 데이터를 구하여, 재구매한 회원 ID와 재구매한 상품 ID를 출력합니다. 결과는 회원 ID를 기준으로 오름차순 정렬하고, 회원 ID가 같다면 상품 ID를 기준으로 내림차순 정렬합니다.',
    rules: [
      '동일한 날짜, 회원 ID, 상품 ID 조합에 대해서는 하나의 판매 데이터만 존재함',
      '재구매란 같은 회원(USER_ID)이 같은 상품(PRODUCT_ID)을 2번 이상 구매한 경우를 뜻함',
      '결과는 USER_ID 오름차순, 같으면 PRODUCT_ID 내림차순 정렬',
    ],
    examples: [
      {
        input: 'ONLINE_SALE = [[1,1,10],[2,2,10],[3,1,20],[4,1,10],[5,2,30],[6,1,20],[7,3,20]]',
        output: '[[1, 20], [1, 10]]',
      },
    ],
  },
  keyIntuitions: [
    '"같은 회원이 같은 상품을 재구매"했다는 것은 (USER_ID, PRODUCT_ID) 두 컬럼을 함께 GROUP BY로 묶었을 때 행의 개수 COUNT(*)가 2 이상이라는 뜻입니다.',
    '그룹화한 뒤의 집계 결과(COUNT(*) >= 2)를 거를 때는 WHERE가 아니라 HAVING 절을 사용해야 합니다.',
    '정렬 기준이 두 개일 때는 ORDER BY USER_ID ASC, PRODUCT_ID DESC처럼 방향을 각각 명시합니다.',
  ],
  demo: {
    input: [SALES],
    label: 'ONLINE_SALE 7건: 회원 1은 상품 10·20 각 2회 구매, 회원 2는 상품 10·30 각 1회 구매',
  },
  workUnit: '살펴본 판매 기록 수',
  approaches: [
    {
      id: 'repurchase-group-by-two-cols',
      name: 'GROUP BY 두 열 + HAVING',
      rank: 'BEST',
      timeComplexity: 'O(N + K log K)',
      spaceComplexity: 'O(K)',
      verdict: 'GROUP BY USER_ID, PRODUCT_ID로 복합 그룹을 만들고 HAVING COUNT(*) >= 2로 재구매 쌍만 추리는 정석 풀이입니다.',
      pros: [
        '테이블을 한 번만 훑어(O(N)) 회원-상품 쌍별 구매 횟수를 정확히 집계합니다.',
        'DISTINCT 없이도 그룹 키 자체가 유일한 (USER_ID, PRODUCT_ID) 쌍이 됩니다.',
      ],
      cons: ['GROUP BY에 두 컬럼을 모두 적어야 한다는 점을 놓치면 안 됩니다.'],
      whyThisRank: '복합 키 그룹화와 HAVING 조건의 역할을 가장 깔끔하게 보여주는 표준 SQL 풀이입니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'repurchase-self-join',
      name: '셀프 조인(SELF JOIN) + DISTINCT',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(K)',
      verdict: '같은 테이블을 조인해 회원과 상품은 같고 판매 ID만 다른 짝이 존재하는지 찾는 풀이입니다.',
      pros: ['GROUP BY나 HAVING 없이 JOIN과 DISTINCT만으로도 같은 답을 낼 수 있습니다.'],
      cons: ['3번 이상 구매한 경우 중복 행이 여러 개 생겨 DISTINCT로 다시 걸러야 하고, 조인 비교 비용이 큽니다.'],
      whyThisRank: '정답은 같지만 한 번의 그룹 집계로 끝날 일을 테이블 자기 조인과 중복 제거로 돌아갑니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'repurchase-user-only-trap',
      name: 'USER_ID 하나로만 GROUP BY',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(U)',
      verdict: 'PRODUCT_ID를 빼고 USER_ID로만 묶어서, 서로 다른 상품을 1번씩 산 회원까지 재구매자로 잘못 뽑는 함정입니다.',
      pros: ['단일 컬럼 GROUP BY에 익숙할 때 무심코 작성하기 쉽습니다.'],
      cons: [
        '회원 2처럼 상품 10과 상품 30을 각각 1번씩 산 회원도 COUNT(*) = 2가 되어 잘못 포함됩니다.',
        '한 회원이 여러 상품을 재구매했을 때 상품별로 나뉘지 않고 한 줄로 뭉개집니다.',
      ],
      whyThisRank: '"누가 무엇을" 재구매했는지 묻는 문제이므로 반드시 두 컬럼을 함께 묶어야 합니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [SALES], expected: TRUTH },
      {
        args: [[[1, 2, 15], [2, 1, 10], [3, 2, 15], [4, 1, 20]]],
        expected: [[2, 15]],
      },
      {
        args: [[[1, 5, 100], [2, 5, 200], [3, 6, 100]]],
        expected: [],
      },
    ],
    random: (rand) => {
      const n = 4 + Math.floor(rand() * 6);
      const rows: SaleRow[] = Array.from({ length: n }, (_, i) => [
        i + 1,
        1 + Math.floor(rand() * 3),
        10 * (1 + Math.floor(rand() * 3)),
      ]);
      return [rows];
    },
  },
};

export default problem;
