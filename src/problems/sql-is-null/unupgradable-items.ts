// 업그레이드 할 수 없는 아이템 구하기: 정석 LEFT JOIN 부모키 + IS NULL, 대안 상관 NOT EXISTS 서브쿼리, 함정 NOT IN에 NULL이 포함되어 0건이 되는 함정을 같은 장면에서 움직인다.
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

type ItemRow = [id: number, name: string, rarity: string];
type TreeRow = [id: number, parentId: number | null];

const ITEMS: ItemRow[] = [
  [0, 'ITEM_A', 'RARE'],
  [1, 'ITEM_B', 'RARE'],
  [2, 'ITEM_C', 'LEGEND'],
  [3, 'ITEM_D', 'RARE'],
  [4, 'ITEM_E', 'RARE'],
];
const TREE: TreeRow[] = [
  [0, null],
  [1, 0],
  [2, 0],
  [3, 1],
  [4, 1],
];
const TRUTH = [
  [4, 'ITEM_E', 'RARE'],
  [3, 'ITEM_D', 'RARE'],
  [2, 'ITEM_C', 'LEGEND'],
];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  sql: `SELECT I.ITEM_ID, I.ITEM_NAME, I.RARITY
FROM ITEM_INFO I
LEFT JOIN ITEM_TREE T ON I.ITEM_ID = T.PARENT_ITEM_ID
WHERE T.PARENT_ITEM_ID IS NULL
ORDER BY I.ITEM_ID DESC;`,
  python: `def solution(items, tree):
    # 부모 아이템으로 등장한 ID 집합 (자식이 있는 아이템들)
    parent_ids = {p for _, p in tree if p is not None}
    # 부모 ID에 속하지 않는 아이템만 선택 (리프 노드)
    result = [
        [item_id, name, rarity]
        for item_id, name, rarity in items
        if item_id not in parent_ids
    ]
    return sorted(result, key=lambda r: -r[0])`,
  javascript: `function solution(items, tree) {
  // 부모 아이템으로 등장한 ID 집합 (자식이 있는 아이템들)
  const parentIds = new Set(tree.map(([, p]) => p).filter((p) => p !== null));
  // 부모 ID에 속하지 않는 아이템만 선택 (리프 노드)
  const result = items
    .filter(([id]) => !parentIds.has(id))
    .map(([id, name, rarity]) => [id, name, rarity]);
  return result.sort((a, b) => b[0] - a[0]);
}`,
};
const BEST_AT = {
  join: sqlLines(BEST_CODE, ['FROM ITEM_INFO I', 'LEFT JOIN ITEM_TREE T ON I.ITEM_ID = T.PARENT_ITEM_ID'], ['parent_ids = {p for _, p in tree if p is not None}'], ['const parentIds = new Set(tree.map']),
  where: sqlLines(BEST_CODE, ['WHERE T.PARENT_ITEM_ID IS NULL'], ['if item_id not in parent_ids'], ['.filter(([id]) => !parentIds.has(id))']),
  order: sqlLines(BEST_CODE, ['SELECT I.ITEM_ID, I.ITEM_NAME, I.RARITY', 'ORDER BY I.ITEM_ID DESC;'], ['return sorted(result, key=lambda r: -r[0])'], ['return result.sort((a, b) => b[0] - a[0]);']),
};

const ALT_CODE = {
  sql: `SELECT I.ITEM_ID, I.ITEM_NAME, I.RARITY
FROM ITEM_INFO I
WHERE NOT EXISTS (
    SELECT 1
    FROM ITEM_TREE T
    WHERE T.PARENT_ITEM_ID = I.ITEM_ID
)
ORDER BY I.ITEM_ID DESC;`,
  python: `def solution(items, tree):
    # 아이템마다 TREE를 처음부터 훑어 자식 존재 여부 검사 (중첩 루프)
    result = []
    for item_id, name, rarity in items:
        has_child = any(p == item_id for _, p in tree)
        if not has_child:
            result.append([item_id, name, rarity])
    return sorted(result, key=lambda r: -r[0])`,
  javascript: `function solution(items, tree) {
  // 아이템마다 TREE를 처음부터 훑어 자식 존재 여부 검사합니다
  const result = [];
  for (const [id, name, rarity] of items) {
    const hasChild = tree.some(([, p]) => p === id);
    if (!hasChild) {
      result.push([id, name, rarity]);
    }
  }
  return result.sort((a, b) => b[0] - a[0]);
}`,
};
const ALT_AT = {
  notExists: sqlLines(ALT_CODE, ['WHERE NOT EXISTS (', 'WHERE T.PARENT_ITEM_ID = I.ITEM_ID'], ['has_child = any(p == item_id for _, p in tree)'], ['const hasChild = tree.some(([, p]) => p === id);']),
  order: sqlLines(ALT_CODE, ['ORDER BY I.ITEM_ID DESC;'], ['return sorted(result, key=lambda r: -r[0])'], ['return result.sort((a, b) => b[0] - a[0]);']),
};

const TRAP_CODE = {
  sql: `-- 함정: PARENT_ITEM_ID에 NULL이 있어서 NOT IN (NULL, 0, 1)이 UNKNOWN이 됨
SELECT ITEM_ID, ITEM_NAME, RARITY
FROM ITEM_INFO
WHERE ITEM_ID NOT IN (
    SELECT PARENT_ITEM_ID
    FROM ITEM_TREE
)
ORDER BY ITEM_ID DESC;`,
  python: `def solution(items, tree):
    # 함정: NOT IN 목록에 None(NULL)이 포함되어 모든 비교가 False가 됨
    parent_list = [p for _, p in tree]  # [None, 0, 0, 1, 1]
    # SQL에서 x NOT IN (NULL, ...)은 UNKNOWN이 되어 빈 결과가 나옴
    if any(p is None for p in parent_list):
        return []
    return [list(r) for r in items if r[0] not in parent_list]`,
  javascript: `function solution(items, tree) {
  // 함정: NOT IN 목록에 null(NULL)이 포함되어 모든 비교가 UNKNOWN이 됩니다
  const parentList = tree.map(([, p]) => p); // [null, 0, 0, 1, 1]
  if (parentList.includes(null)) {
    return []; // SQL NOT IN (..., NULL) 함정: 결과 0건
  }
  return items.filter(([id]) => !parentList.includes(id));
}`,
};
const TRAP_AT = {
  trapSubquery: sqlLines(TRAP_CODE, ['WHERE ITEM_ID NOT IN (', 'SELECT PARENT_ITEM_ID'], ['parent_list = [p for _, p in tree]', 'if any(p is None for p in parent_list):'], ['const parentList = tree.map', 'if (parentList.includes(null))']),
  done: sqlLines(TRAP_CODE, ['ORDER BY ITEM_ID DESC;'], ['return []'], ['return [];']),
};

/* ------------------------------------------------------------------ */
/* 장면과 배치                                                          */
/* ------------------------------------------------------------------ */

const W = 600;
const H = 350;
const ITEM_X = 14;
const ITEM_Y = 36;
const ITEM_W = 210;
const ITEM_H = 34;
const ITEM_PITCH = 40;
const TREE_X = 240;
const TREE_W = 160;
const OUT_X = 420;
const OUT_W = 166;

const itemId = (r: number) => `item:${r}`;
const treeId = (r: number) => `tree:${r}`;
const outId = (slot: number) => `out:${slot}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:i', kind: 'text', rect: { x: ITEM_X, y: 8, w: ITEM_W, h: 22 }, tone: 'muted', text: 'ITEM_INFO (5개)' },
    { id: 'hdr:t', kind: 'text', rect: { x: TREE_X, y: 8, w: TREE_W, h: 22 }, tone: 'chosen', text: 'ITEM_TREE (트리 관계)' },
    { id: 'hdr:o', kind: 'text', rect: { x: OUT_X, y: 8, w: OUT_W, h: 22 }, tone: 'good', text: '업그레이드 불가 아이템' },
    { id: 'status', kind: 'token', rect: { x: ITEM_X, y: 304, w: 572, h: 32 }, tone: 'plain', text: '조인 및 검사 대기' },
  ];
  ITEMS.forEach(([id, name, rarity], r) => {
    items.push({ id: itemId(r), kind: 'token', rect: { x: ITEM_X, y: ITEM_Y + r * ITEM_PITCH, w: ITEM_W, h: ITEM_H }, tone: 'plain', text: `#${id} · ${name} (${rarity})` });
  });
  TREE.forEach(([id, pId], r) => {
    items.push({ id: treeId(r), kind: 'token', rect: { x: TREE_X, y: ITEM_Y + r * ITEM_PITCH, w: TREE_W, h: ITEM_H }, tone: 'plain', text: `아이템 ${id} → 부모 ${pId ?? 'NULL'}` });
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석: LEFT JOIN 부모키 + IS NULL로 리프 아이템만 선택                     */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const parentIds = new Set([0, 1]);
  let outSlot = 0;
  const kept: ItemRow[] = [];

  rec.step({ title: 'FROM ITEM_INFO: 5개 아이템 행 스캔 시작', codeHighlights: BEST_AT.join, work, variables: { 절: 'FROM ITEM_INFO', 아이템수: ITEMS.length } });
  rec.phase('아이템 테이블 읽기', 'ITEM_INFO 테이블의 5개 아이템 행을 읽으며 부모 연결 상태를 확인할 준비를 합니다.', BEST_AT.join);
  rec.do({ type: 'set', id: 'status', patch: { text: 'FROM ITEM_INFO → LEFT JOIN ITEM_TREE 대기', tone: 'chosen' }, pop: true }, wait(180));

  rec.step({ title: 'LEFT JOIN: I.ITEM_ID = T.PARENT_ITEM_ID 매칭 준비', codeHighlights: BEST_AT.join, work, variables: { 절: 'LEFT JOIN', 부모ID수: parentIds.size } });
  rec.phase('조인 조건 확인', '어떤 아이템이 누군가의 PARENT_ITEM_ID로 쓰이는지 LEFT JOIN으로 연결합니다.', BEST_AT.join);
  rec.do(
    ...together([
      paint(treeId(1), 'chosen'),
      paint(treeId(2), 'chosen'),
      paint(treeId(3), 'chosen'),
      paint(treeId(4), 'chosen'),
      { type: 'set', id: 'status', patch: { text: '부모로 쓰인 ID: 0 (ITEM_B,C의 부모), 1 (ITEM_D,E의 부모)', tone: 'chosen' }, pop: true },
    ]),
    wait(200),
  );

  ITEMS.forEach(([id, name, rarity], r) => {
    const isParent = parentIds.has(id);
    work += 1;

    rec.step({
      title: `WHERE T.PARENT_ITEM_ID IS NULL: #${id} ${name} → ${!isParent ? '자식 없음(선택!)' : '부모로 쓰임(제외)'}`,
      codeHighlights: BEST_AT.where,
      work,
      variables: { 절: 'IS NULL 검사', 아이템: `#${id} ${name}`, 리프여부: !isParent ? 'O' : 'X' },
    });
    rec.phase(
      '리프 판별',
      !isParent
        ? `#${id} ${name}은 아무 아이템의 부모도 아닙니다(T.PARENT_ITEM_ID IS NULL). 더 이상 업그레이드할 수 없으므로 선택!`
        : `#${id} ${name}은 다른 아이템의 부모(0 또는 1)로 연결되므로 업그레이드가 가능해 제외합니다.`,
      BEST_AT.where,
    );
    if (!isParent) {
      kept.push([id, name, rarity]);
      const curSlot = outSlot++;
      rec.do(
        ...together([
          paint(itemId(r), 'good'),
          { type: 'add', item: { id: outId(curSlot), kind: 'token', rect: { x: OUT_X, y: ITEM_Y + curSlot * 48, w: OUT_W, h: 38 }, tone: 'good', text: `#${id} ${name} (${rarity})` }, from: itemId(r) },
        ]),
        wait(180),
      );
    } else {
      rec.do(paint(itemId(r), 'muted'), wait(150));
    }
  });

  rec.step({
    title: 'ORDER BY ITEM_ID DESC → #4(ITEM_E) → #3(ITEM_D) → #2(ITEM_C)',
    codeHighlights: BEST_AT.order,
    work: work + 3,
    variables: { 절: 'ORDER BY DESC', 출력수: 3 },
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('결과 확인', '부모가 아닌 리프 아이템(C, D, E) 3개가 ITEM_ID 내림차순(4 → 3 → 2)으로 정렬 출력되었습니다.', BEST_AT.order);
  rec.do(
    ...together([
      { type: 'set', id: outId(0), patch: { text: '#4 ITEM_E (RARE)', tone: 'path' }, pop: true },
      { type: 'set', id: outId(1), patch: { text: '#3 ITEM_D (RARE)', tone: 'path' }, pop: true },
      { type: 'set', id: outId(2), patch: { text: '#2 ITEM_C (LEGEND)', tone: 'path' }, pop: true },
      { type: 'set', id: 'status', patch: { text: '정답: ID [4, 3, 2] 3개 아이템 출력 완료', tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: NOT EXISTS 상관 서브쿼리로 아이템마다 트리 전체 훑기               */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  let outSlot = 0;

  ITEMS.forEach(([id, name, rarity], r) => {
    work += TREE.length;
    const isLeaf = id >= 2;

    rec.step({
      title: `상관 서브쿼리: #${id} ${name} 위해 TREE 5행 전부 재스캔`,
      codeHighlights: ALT_AT.notExists,
      work,
      variables: { 절: 'NOT EXISTS', 아이템: `#${id}`, 누적비교: work },
    });
    rec.phase(
      '재스캔',
      isLeaf
        ? `TREE 5행을 다 훑었지만 PARENT_ITEM_ID=${id}인 행이 없습니다(NOT EXISTS 참). 리프로 판정!`
        : `TREE를 훑는 도중 PARENT_ITEM_ID=${id}인 자식 행을 발견하여 제외합니다.`,
      ALT_AT.notExists,
    );
    if (isLeaf) {
      const curSlot = outSlot++;
      rec.do(
        ...together([
          paint(itemId(r), 'good'),
          { type: 'add', item: { id: outId(curSlot), kind: 'token', rect: { x: OUT_X, y: ITEM_Y + curSlot * 48, w: OUT_W, h: 38 }, tone: 'good', text: `#${id} ${name} (${rarity})` }, from: itemId(r) },
        ]),
        wait(170),
      );
    } else {
      rec.do(paint(itemId(r), 'muted'), wait(150));
    }
  });

  rec.step({
    title: `정답 동일, 하지만 행 비교 ${work}회 (정석은 5회)`,
    codeHighlights: ALT_AT.order,
    work,
    variables: { 절: '완료', 최종출력수: 3 },
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('결과 확인', `답은 같지만 아이템마다 TREE를 반복 탐색하느라 ${work}번 비교했습니다.`, ALT_AT.order);
  rec.do({ type: 'set', id: 'status', patch: { text: `정답 3개 동일 (상관 서브쿼리 탐색 ${work}회)`, tone: 'path' }, pop: true });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: NOT IN (NULL, 0, 1)이 되어 결과 0건(빈 배열) 반환                  */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 5;

  rec.step({
    title: '함정 서브쿼리: PARENT_ITEM_ID에 루트의 NULL이 포함됨!',
    codeHighlights: TRAP_AT.trapSubquery,
    work,
    variables: { 절: '서브쿼리', 부모목록: '[NULL, 0, 0, 1, 1]' },
  });
  rec.phase(
    'NULL 전파 함정',
    '서브쿼리 (SELECT PARENT_ITEM_ID FROM ITEM_TREE)의 결과에 루트 아이템의 NULL이 들어있습니다!',
    TRAP_AT.trapSubquery,
  );
  rec.do(
    ...together([
      paint(treeId(0), 'bad'),
      { type: 'set', id: 'status', patch: { text: '서브쿼리 결과에 NULL 포함: (NULL, 0, 0, 1, 1)', tone: 'bad' }, pop: true },
    ]),
    wait(200),
  );

  ITEMS.forEach(([id, name], r) => {
    work += 1;
    rec.step({
      title: `WHERE #${id} NOT IN (NULL, 0, 1) → UNKNOWN(거짓 처리)!`,
      codeHighlights: TRAP_AT.trapSubquery,
      work,
      variables: { 절: 'NOT IN 비교', 아이템: `#${id} ${name}`, 판정: 'UNKNOWN' },
    });
    rec.phase(
      '모든 행 탈락',
      `SQL에서 x NOT IN (NULL, 0, 1)은 (x!=NULL AND x!=0 AND x!=1)로 풀리는데, x!=NULL이 UNKNOWN이라 전체가 UNKNOWN(거짓)이 됩니다! #${id} 탈락.`,
      TRAP_AT.trapSubquery,
    );
    rec.do(paint(itemId(r), 'bad'), wait(160));
  });

  rec.step({
    title: '오답: NOT IN (NULL) 때문에 결과가 0건(빈 테이블)이 됨!',
    codeHighlights: TRAP_AT.done,
    work,
    variables: { 절: '결과', 출력수: 0, 정답수: 3 },
    answer: [],
    isKeyframe: true,
  });
  rec.phase(
    '오답 확인',
    '리프 아이템(C, D, E)이 분명히 존재하는데도 단 1건도 출력되지 않는 치명적 오답입니다. 서브쿼리에 NULL이 들어갈 수 있을 때는 절대 NOT IN을 쓰면 안 됩니다!',
    TRAP_AT.done,
  );
  rec.do({ type: 'set', id: 'status', patch: { text: '오답: 0건 반환 (빈 결과) · SQL의 대표적인 NOT IN NULL 함정', tone: 'bad' }, pop: true });
  return rec.finish();
}

const problem: Problem = {
  id: 'unupgradable-items',
  title: '업그레이드 할 수 없는 아이템 구하기',
  level: 3,
  category: 'sql-is-null',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/273712',
  description: {
    summary:
      'ITEM_INFO 테이블과 ITEM_TREE 테이블에서 더 이상 업그레이드할 수 없는 아이템의 아이템 ID(ITEM_ID), 아이템 명(ITEM_NAME), 아이템의 희귀도(RARITY)를 출력합니다. 결과는 아이템 ID를 기준으로 내림차순 정렬합니다.',
    rules: [
      '더 이상 업그레이드할 수 없는 아이템 = 어떤 아이템의 PARENT_ITEM_ID로도 등장하지 않는 리프 노드',
      '아이템 ID를 기준으로 내림차순 정렬',
      'ITEM_TREE의 ROOT 아이템의 PARENT_ITEM_ID는 NULL임',
    ],
    examples: [
      {
        input: 'ITEM_INFO = [[0,"ITEM_A","RARE"],[1,"ITEM_B","RARE"],[2,"ITEM_C","LEGEND"],[3,"ITEM_D","RARE"],[4,"ITEM_E","RARE"]], ITEM_TREE = [[0,null],[1,0],[2,0],[3,1],[4,1]]',
        output: '[[4, "ITEM_E", "RARE"], [3, "ITEM_D", "RARE"], [2, "ITEM_C", "LEGEND"]]',
      },
    ],
  },
  keyIntuitions: [
    '"업그레이드할 수 없다"는 것은 다른 아이템의 부모(PARENT_ITEM_ID)로 한 번도 사용되지 않았다는 뜻입니다.',
    'ITEM_INFO와 ITEM_TREE를 I.ITEM_ID = T.PARENT_ITEM_ID로 LEFT JOIN한 뒤, T.PARENT_ITEM_ID IS NULL인 행을 찾으면 자식이 없는 리프 아이템만 남습니다.',
    '주의: NOT IN (SELECT PARENT_ITEM_ID FROM ITEM_TREE)를 쓰면 루트의 NULL 때문에 전체 조건이 UNKNOWN이 되어 아무것도 반환되지 않는 SQL 최대의 함정에 빠집니다. NOT IN을 쓸 거라면 서브쿼리에 WHERE PARENT_ITEM_ID IS NOT NULL을 반드시 넣어야 합니다.',
  ],
  demo: {
    input: [ITEMS, TREE],
    label: 'ITEM_INFO 5개 (0, 1은 부모로 사용됨, 2, 3, 4는 자식 없음)',
  },
  workUnit: '아이템 대조 횟수',
  approaches: [
    {
      id: 'unupgradable-left-join-null',
      name: 'LEFT JOIN 부모키 + IS NULL',
      rank: 'BEST',
      timeComplexity: 'O(N + M + K log K)',
      spaceComplexity: 'O(K)',
      verdict: 'I.ITEM_ID = T.PARENT_ITEM_ID로 LEFT JOIN 후 부모키가 NULL인 행만 골라내는 정석 쿼리입니다.',
      pros: [
        '해시 조인이나 인덱스를 통해 O(N + M)으로 매우 빠릅니다.',
        'NULL이 포함되어 있어도 전혀 오작동하지 않고 안전합니다.',
      ],
      cons: ['ON 절의 조인 키가 ITEM_ID = PARENT_ITEM_ID라는 점을 헷갈리지 않아야 합니다.'],
      whyThisRank: '안티 조인(Anti-Join)을 표현하는 가장 안전하고 표준적인 SQL 패턴입니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'unupgradable-not-exists',
      name: '상관 NOT EXISTS 서브쿼리',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × M)',
      spaceComplexity: 'O(1)',
      verdict: '아이템마다 서브쿼리로 자식 행이 존재하는지 대조(NOT EXISTS)하는 풀이입니다.',
      pros: ['NOT IN과 달리 서브쿼리 결과에 NULL이 있어도 논리적으로 안전합니다.'],
      cons: ['아이템 수만큼 서브쿼리가 반복 스캔되어 데이터가 커질수록 조인보다 느립니다.'],
      whyThisRank: '정답은 맞지만 반복 탐색 비용이 듭니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'unupgradable-not-in-null-trap',
      name: 'NOT IN 서브쿼리 (NULL 전파 함정)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N + M)',
      spaceComplexity: 'O(M)',
      verdict: 'NOT IN 목록에 루트의 PARENT_ITEM_ID인 NULL이 들어가면서 3가 논리(Three-Valued Logic)에 의해 결과가 0건이 되는 치명적 함정입니다.',
      pros: ['문법적으로 올바르고 직관적으로 떠오르기 쉬워 실무에서도 많이 실수합니다.'],
      cons: ['리프 아이템이 3개나 있는데도 결과가 빈 배열([])로 나와 완벽한 오답이 됩니다.'],
      whyThisRank: 'SQL 3가 논리(NULL 비교 시 UNKNOWN 반환)의 위험성을 보여주는 가장 대표적인 함정 사례입니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [ITEMS, TREE], expected: TRUTH },
      {
        args: [
          [
            [1, '칼', 'COMMON'],
            [2, '방패', 'RARE'],
          ],
          [
            [1, null],
            [2, 1],
          ],
        ],
        expected: [[2, '방패', 'RARE']],
      },
    ],
    random: (rand) => {
      const items: ItemRow[] = [
        [0, 'I0', 'RARE'],
        [1, 'I1', 'RARE'],
        [2, 'I2', 'LEGEND'],
      ];
      const tree: TreeRow[] = [
        [0, null],
        [1, 0],
        [2, rand() < 0.5 ? 0 : 1],
      ];
      return [items, tree];
    },
  },
};

export default problem;
