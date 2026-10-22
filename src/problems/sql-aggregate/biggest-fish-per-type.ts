// 물고기 종류 별 대어 찾기: 정석 종류별 MAX 서브쿼리 + JOIN, 대안 상관 서브쿼리로 행마다 다시 최댓값 구하기, 함정 종류 안 나누고 전체 최대 길이만 비교를 같은 장면에서 움직인다.
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

type FishRow = [id: number, type: number, length: number];
type NameMap = Record<number, string>;

const NAMES: NameMap = { 0: 'BASS', 1: 'SNAPPER', 2: 'ANCHOVY' };
const FISHES: FishRow[] = [
  [0, 0, 30],
  [1, 0, 50], // BASS max
  [2, 0, 40],
  [3, 1, 20],
  [4, 1, 60], // SNAPPER max
  [5, 2, 73], // ANCHOVY max
];
const TRUTH = [
  [1, 'BASS', 50],
  [4, 'SNAPPER', 60],
  [5, 'ANCHOVY', 73],
];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  sql: `SELECT I.ID, N.FISH_NAME, I.LENGTH
FROM FISH_INFO I
JOIN FISH_NAME_INFO N ON I.FISH_TYPE = N.FISH_TYPE
WHERE (I.FISH_TYPE, I.LENGTH) IN (
    SELECT FISH_TYPE, MAX(LENGTH)
    FROM FISH_INFO
    GROUP BY FISH_TYPE
)
ORDER BY I.ID ASC;`,
  python: `def solution(fishes, names):
    # 서브쿼리: 종류별 최대 길이 계산
    max_len = {}
    for f_id, f_type, length in fishes:
        max_len[f_type] = max(max_len.get(f_type, 0), length)
    # 본 쿼리: (종류, 최대 길이) 일치하는 행 선택 + 이름 조인
    result = []
    for f_id, f_type, length in fishes:
        if length == max_len[f_type]:
            name = names.get(f_type) or names.get(str(f_type))
            result.append([f_id, name, length])
    return sorted(result, key=lambda r: r[0])`,
  javascript: `function solution(fishes, names) {
  // 서브쿼리: 종류별 최대 길이 계산
  const maxLen = new Map();
  for (const [, type, len] of fishes) {
    maxLen.set(type, Math.max(maxLen.get(type) ?? 0, len));
  }
  // 본 쿼리: (종류, 최대 길이) 일치하는 행 선택 + 이름 조인
  const result = [];
  for (const [id, type, len] of fishes) {
    if (len === maxLen.get(type)) {
      result.push([id, names[type], len]);
    }
  }
  return result.sort((a, b) => a[0] - b[0]);
}`,
};
const BEST_AT = {
  subquery: sqlLines(BEST_CODE, ['SELECT FISH_TYPE, MAX(LENGTH)', 'GROUP BY FISH_TYPE'], ['for f_id, f_type, length in fishes:', 'max_len[f_type] = max(max_len.get(f_type, 0), length)'], ['for (const [, type, len] of fishes)', 'maxLen.set(type, Math.max(maxLen.get(type) ?? 0, len))']),
  join: sqlLines(BEST_CODE, ['JOIN FISH_NAME_INFO N ON I.FISH_TYPE = N.FISH_TYPE', 'WHERE (I.FISH_TYPE, I.LENGTH) IN ('], ['for f_id, f_type, length in fishes:', 'if length == max_len[f_type]:'], ['for (const [id, type, len] of fishes)', 'if (len === maxLen.get(type))']),
  order: sqlLines(BEST_CODE, ['ORDER BY I.ID ASC;'], ['return sorted(result, key=lambda r: r[0])'], ['return result.sort((a, b) => a[0] - b[0]);']),
};

const ALT_CODE = {
  sql: `SELECT I.ID, N.FISH_NAME, I.LENGTH
FROM FISH_INFO I
JOIN FISH_NAME_INFO N ON I.FISH_TYPE = N.FISH_TYPE
WHERE I.LENGTH = (
    SELECT MAX(I2.LENGTH)
    FROM FISH_INFO I2
    WHERE I2.FISH_TYPE = I.FISH_TYPE
)
ORDER BY I.ID ASC;`,
  python: `def solution(fishes, names):
    # 상관 서브쿼리: 각 물고기마다 전체를 다시 훑어 같은 종류의 최댓값 계산
    result = []
    for f_id, f_type, length in fishes:
        same_type_max = max(l for _, t, l in fishes if t == f_type)
        if length == same_type_max:
            name = names.get(f_type) or names.get(str(f_type))
            result.append([f_id, name, length])
    return sorted(result, key=lambda r: r[0])`,
  javascript: `function solution(fishes, names) {
  // 상관 서브쿼리: 각 물고기마다 전체를 다시 훑어 같은 종류의 최댓값 계산합니다
  const result = [];
  for (const [id, type, len] of fishes) {
    const sameTypeMax = Math.max(...fishes.filter(([, t]) => t === type).map(([, , l]) => l));
    if (len === sameTypeMax) {
      result.push([id, names[type], len]);
    }
  }
  return result.sort((a, b) => a[0] - b[0]);
}`,
};
const ALT_AT = {
  correlate: sqlLines(ALT_CODE, ['WHERE I.LENGTH = (', 'SELECT MAX(I2.LENGTH)', 'WHERE I2.FISH_TYPE = I.FISH_TYPE'], ['same_type_max = max(l for _, t, l in fishes if t == f_type)'], ['const sameTypeMax = Math.max(...fishes.filter']),
  order: sqlLines(ALT_CODE, ['ORDER BY I.ID ASC;'], ['return sorted(result, key=lambda r: r[0])'], ['return result.sort((a, b) => a[0] - b[0]);']),
};

const TRAP_CODE = {
  sql: `-- 함정: 종류별 GROUP BY 없이 전체 MAX(LENGTH) 하나만 비교
SELECT I.ID, N.FISH_NAME, I.LENGTH
FROM FISH_INFO I
JOIN FISH_NAME_INFO N ON I.FISH_TYPE = N.FISH_TYPE
WHERE I.LENGTH = (
    SELECT MAX(LENGTH)
    FROM FISH_INFO
)
ORDER BY I.ID ASC;`,
  python: `def solution(fishes, names):
    # 함정: 종류 구분 없이 전체에서 가장 긴 물고기 하나만 찾음
    overall_max = max(length for _, _, length in fishes)
    result = [
        [f_id, names.get(f_type) or names.get(str(f_type)), length]
        for f_id, f_type, length in fishes
        if length == overall_max
    ]
    return sorted(result, key=lambda r: r[0])`,
  javascript: `function solution(fishes, names) {
  // 함정: 종류 구분 없이 전체에서 가장 긴 물고기 하나만 찾습니다
  const overallMax = Math.max(...fishes.map(([, , len]) => len));
  const result = [];
  for (const [id, type, len] of fishes) {
    if (len === overallMax) {
      result.push([id, names[type], len]);
    }
  }
  return result.sort((a, b) => a[0] - b[0]);
}`,
};
const TRAP_AT = {
  trapMax: sqlLines(TRAP_CODE, ['SELECT MAX(LENGTH)', 'FROM FISH_INFO'], ['overall_max = max(length for _, _, length in fishes)'], ['const overallMax = Math.max(...fishes.map']),
  done: sqlLines(TRAP_CODE, ['ORDER BY I.ID ASC;'], ['return sorted(result, key=lambda r: r[0])'], ['return result.sort((a, b) => a[0] - b[0]);']),
};

/* ------------------------------------------------------------------ */
/* 장면과 배치                                                          */
/* ------------------------------------------------------------------ */

const W = 600;
const H = 360;
const IN_X = 14;
const IN_Y = 36;
const IN_W = 250;
const IN_H = 34;
const IN_PITCH = 40;
const SUB_X = 280;
const SUB_W = 140;
const OUT_X = 436;
const OUT_W = 150;

const inRect = (r: number): Rect => ({ x: IN_X, y: IN_Y + r * IN_PITCH, w: IN_W, h: IN_H });
const subRect = (slot: number): Rect => ({ x: SUB_X, y: IN_Y + slot * 48, w: SUB_W, h: 38 });
const outRect = (slot: number): Rect => ({ x: OUT_X, y: IN_Y + slot * 48, w: OUT_W, h: 38 });
const inId = (r: number) => `in:${r}`;
const subId = (slot: number) => `sub:${slot}`;
const outId = (slot: number) => `out:${slot}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:in', kind: 'text', rect: { x: IN_X, y: 8, w: IN_W, h: 22 }, tone: 'muted', text: 'FISH_INFO 테이블 (6마리)' },
    { id: 'hdr:sub', kind: 'text', rect: { x: SUB_X, y: 8, w: SUB_W, h: 22 }, tone: 'chosen', text: '종류별 MAX 길이' },
    { id: 'hdr:out', kind: 'text', rect: { x: OUT_X, y: 8, w: OUT_W, h: 22 }, tone: 'good', text: '선택된 대어 (결과)' },
    { id: 'status', kind: 'token', rect: { x: IN_X, y: 312, w: 572, h: 32 }, tone: 'plain', text: '쿼리 실행 준비' },
  ];
  FISHES.forEach(([id, type, len], r) => {
    items.push({ id: inId(r), kind: 'token', rect: inRect(r), tone: 'plain', text: `#${id} · ${NAMES[type]} · ${len}cm` });
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석: 종류별 MAX 서브쿼리 한 번 + 일치하는 행 조인                     */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const maxMap = new Map<number, number>();
  const meta = (clause: string, item = '-') => ({
    work,
    variables: { 절: clause, 물고기: item, 집계수: maxMap.size },
  });

  // 서브쿼리: 종류별 MAX 집계
  const types = [0, 1, 2];
  types.forEach((t) => {
    const lens = FISHES.filter(([, ty]) => ty === t).map(([, , l]) => l);
    const m = Math.max(...lens);
    maxMap.set(t, m);
    work += lens.length;
  });

  rec.step({ title: '서브쿼리: GROUP BY FISH_TYPE으로 종류별 MAX 계산', codeHighlights: BEST_AT.subquery, ...meta('서브쿼리 MAX') });
  rec.phase('종류별 최대 길이 계산', '서브쿼리가 테이블을 한 번 훑어 BASS 50cm, SNAPPER 60cm, ANCHOVY 73cm를 구합니다.', BEST_AT.subquery);
  rec.do(
    ...together([
      { type: 'add', item: { id: subId(0), kind: 'token', rect: subRect(0), tone: 'chosen', text: 'BASS MAX: 50cm' } },
      { type: 'add', item: { id: subId(1), kind: 'token', rect: subRect(1), tone: 'chosen', text: 'SNAPPER MAX: 60cm' } },
      { type: 'add', item: { id: subId(2), kind: 'token', rect: subRect(2), tone: 'chosen', text: 'ANCHOVY MAX: 73cm' } },
      { type: 'set', id: 'status', patch: { text: '종류별 최대 길이 3개 확정 (BASS: 50, SNAPPER: 60, ANCHOVY: 73)', tone: 'chosen' }, pop: true },
    ]),
    wait(220),
  );

  let outSlot = 0;
  FISHES.forEach(([id, type, len], r) => {
    const isMax = len === maxMap.get(type);
    work += 1;

    rec.step({
      title: `본 쿼리 WHERE: #${id} ${NAMES[type]} ${len}cm ↔ MAX(${maxMap.get(type)}cm)`,
      codeHighlights: BEST_AT.join,
      ...meta('WHERE 대조', `#${id}`),
    });
    rec.phase(
      '대어 여부 검사',
      isMax
        ? `#${id} 물고기는 길이가 ${len}cm로 ${NAMES[type]} 종류의 최댓값과 일치합니다! 이름 테이블과 조인해 선택합니다.`
        : `#${id} 물고기(${len}cm)는 ${NAMES[type]} 최대 길이(${maxMap.get(type)}cm)보다 작으므로 제외합니다.`,
      BEST_AT.join,
    );
    if (isMax) {
      const curSlot = outSlot++;
      rec.do(
        ...together([
          paint(inId(r), 'good'),
          { type: 'add', item: { id: outId(curSlot), kind: 'token', rect: outRect(curSlot), tone: 'good', text: `#${id} ${NAMES[type]} (${len}cm)` }, from: inId(r) },
        ]),
        wait(180),
      );
    } else {
      rec.do(paint(inId(r), 'muted'), wait(150));
    }
  });

  rec.step({
    title: 'ORDER BY ID ASC → 3마리 대어 출력 완료',
    codeHighlights: BEST_AT.order,
    ...meta('ORDER BY', '완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('결과 확인', '모든 종류별 대어(BASS 1번, SNAPPER 4번, ANCHOVY 5번)를 ID 오름차순으로 완벽히 추출했습니다.', BEST_AT.order);
  rec.do({ type: 'set', id: 'status', patch: { text: '정답: ID [1, 4, 5] 3마리 대어 조회 완료', tone: 'path' }, pop: true });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 상관 서브쿼리로 물고기마다 전체 행을 다시 훑음                     */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  let outSlot = 0;
  const meta = (clause: string, item = '-') => ({
    work,
    variables: { 절: clause, 물고기: item, 누적비교: work },
  });

  FISHES.forEach(([id, type, len], r) => {
    const same = FISHES.filter(([, ty]) => ty === type);
    work += same.length;
    const sameMax = Math.max(...same.map(([, , l]) => l));
    const isMax = len === sameMax;

    rec.step({
      title: `상관 서브쿼리: #${id} ${NAMES[type]} 위해 같은 종류 ${same.length}마리 재스캔`,
      codeHighlights: ALT_AT.correlate,
      ...meta('상관 서브쿼리', `#${id}`),
    });
    rec.phase(
      '행마다 재집계',
      `#${id} 물고기마다 WHERE 서브쿼리가 실행되어 같은 ${NAMES[type]} ${same.length}마리를 처음부터 다시 훑어 최댓값(${sameMax}cm)을 구합니다.`,
      ALT_AT.correlate,
    );
    if (isMax) {
      const curSlot = outSlot++;
      rec.do(
        ...together([
          paint(inId(r), 'good'),
          { type: 'add', item: { id: outId(curSlot), kind: 'token', rect: outRect(curSlot), tone: 'good', text: `#${id} ${NAMES[type]} (${len}cm)` }, from: inId(r) },
        ]),
        wait(170),
      );
    } else {
      rec.do(paint(inId(r), 'muted'), wait(150));
    }
  });

  rec.step({
    title: `정답 동일, 하지만 행 비교 ${work}회 (정석은 12회)`,
    codeHighlights: ALT_AT.order,
    ...meta('ORDER BY', '완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('결과 확인', `답은 같지만 행마다 서브쿼리를 반복 실행하느라 총 ${work}번 비교했습니다.`, ALT_AT.order);
  rec.do({ type: 'set', id: 'status', patch: { text: `정답 3마리 동일 (상관 서브쿼리 연산 ${work}회)`, tone: 'path' }, pop: true });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: 종류 구분 없이 전체 최댓값 하나만 비교                            */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 6;
  const overallMax = Math.max(...FISHES.map(([, , l]) => l)); // 73

  rec.step({ title: '함정 서브쿼리: GROUP BY 없이 전체 MAX(LENGTH) = 73 계산', codeHighlights: TRAP_AT.trapMax, work, variables: { 절: '전체 MAX', 최대길이: overallMax } });
  rec.phase('종류 누락', `종류별로 묶지 않고 전체 6마리 중 가장 긴 물고기 길이 하나(${overallMax}cm)만 구합니다.`, TRAP_AT.trapMax);
  rec.do(
    ...together([
      { type: 'add', item: { id: subId(0), kind: 'token', rect: subRect(0), tone: 'bad', text: `전체 MAX: ${overallMax}cm` } },
      { type: 'set', id: 'status', patch: { text: '종류 구분 없이 전체 최댓값(73cm) 하나만 적용', tone: 'bad' }, pop: true },
    ]),
    wait(200),
  );

  FISHES.forEach(([id, type, len], r) => {
    const isOverall = len === overallMax;
    work += 1;

    rec.step({
      title: `WHERE 검사: #${id} ${NAMES[type]} ${len}cm ↔ 전체MAX(${overallMax}cm)`,
      codeHighlights: TRAP_AT.done,
      work,
      variables: { 절: 'WHERE 비교', 물고기: `#${id}`, 통과: isOverall ? 'O' : 'X' },
    });
    rec.phase(
      '비교',
      isOverall
        ? `#${id} ANCHOVY(73cm)만 전체 최댓값과 일치해 선택됩니다.`
        : `#${id} ${NAMES[type]}(${len}cm)는 BASS/SNAPPER의 대어인데도 전체 최댓값(73cm)보다 작아서 탈락합니다!`,
      TRAP_AT.done,
    );
    if (isOverall) {
      rec.do(
        ...together([
          paint(inId(r), 'good'),
          { type: 'add', item: { id: outId(0), kind: 'token', rect: outRect(0), tone: 'bad', text: `#${id} ${NAMES[type]} (${len}cm)` }, from: inId(r) },
        ]),
        wait(180),
      );
    } else {
      rec.do(paint(inId(r), 'muted'), wait(150));
    }
  });

  const wrongAns = [[5, 'ANCHOVY', 73]];
  rec.step({
    title: '오답: BASS와 SNAPPER 대어가 모두 빠지고 ANCHOVY 1마리만 반환',
    codeHighlights: TRAP_AT.done,
    work,
    variables: { 절: '결과', 출력수: 1, 정답수: 3 },
    answer: wrongAns,
    isKeyframe: true,
  });
  rec.phase('오답 확인', '종류별 대어가 아니라 전체 중 1등만 뽑혀서 정답 3건 중 2건이 누락되었습니다.', TRAP_AT.done);
  rec.do({ type: 'set', id: 'status', patch: { text: '오답: [5번 ANCHOVY] 1마리만 출력 · BASS, SNAPPER 대어 누락', tone: 'bad' }, pop: true });
  return rec.finish();
}

const problem: Problem = {
  id: 'biggest-fish-per-type',
  title: '물고기 종류 별 대어 찾기',
  level: 3,
  category: 'sql-aggregate',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/293261',
  description: {
    summary:
      'FISH_INFO 테이블과 FISH_NAME_INFO 테이블에서 물고기 종류(FISH_TYPE)별로 가장 큰 물고기의 ID, 물고기 이름(FISH_NAME), 길이(LENGTH)를 출력합니다. 결과는 물고기의 ID에 대해 오름차순 정렬합니다. 물고기 종류별 가장 큰 물고기는 1마리만 존재합니다.',
    rules: [
      '물고기 종류별로 가장 큰 물고기를 찾아야 함',
      '물고기 ID에 대해 오름차순 정렬',
      '물고기 종류별 가장 큰 물고기는 1마리만 주어지며 10cm 이하인 경우는 없음',
    ],
    examples: [
      {
        input: 'FISH_INFO = [[0,0,30],[1,0,50],[2,0,40],[3,1,20],[4,1,60],[5,2,73]], FISH_NAME_INFO = {0:"BASS", 1:"SNAPPER", 2:"ANCHOVY"}',
        output: '[[1, "BASS", 50], [4, "SNAPPER", 60], [5, "ANCHOVY", 73]]',
      },
    ],
  },
  keyIntuitions: [
    '집계 함수(MAX)와 그 최댓값을 가진 원본 행의 다른 컬럼(ID)을 함께 조회하려면, 서브쿼리에서 (FISH_TYPE, MAX(LENGTH)) 쌍을 구한 뒤 본 쿼리에서 (FISH_TYPE, LENGTH) IN (...)으로 일치시켜야 합니다.',
    '물고기 이름(FISH_NAME)은 FISH_NAME_INFO 테이블에 있으므로 FISH_TYPE을 외래키로 조인(JOIN)해야 합니다.',
    'GROUP BY 없이 MAX(LENGTH)만 쓰면 전체 중 최고 길이 하나만 비교하게 되므로 반드시 종류별 GROUP BY를 포함해야 합니다.',
  ],
  demo: {
    input: [FISHES, NAMES],
    label: 'FISH_INFO 6마리 (BASS 3마리 중 50cm, SNAPPER 2마리 중 60cm, ANCHOVY 1마리 73cm)',
  },
  workUnit: '물고기 행 비교 횟수',
  approaches: [
    {
      id: 'biggest-fish-group-subquery',
      name: '종류별 MAX 서브쿼리 + JOIN',
      rank: 'BEST',
      timeComplexity: 'O(N + K log K)',
      spaceComplexity: 'O(K)',
      verdict: '서브쿼리에서 종류별 MAX(LENGTH)를 한 번에 집계하고 (FISH_TYPE, LENGTH) IN으로 대어 행만 골라내는 정석 쿼리입니다.',
      pros: [
        '테이블을 2번만 훑어(서브쿼리 1회 + 본 쿼리 1회) 모든 종류의 대어를 효율적으로 찾습니다.',
        '튜플 비교 (I.FISH_TYPE, I.LENGTH) IN (...) 구문이 매우 직관적이고 표준적입니다.',
      ],
      cons: ['MySQL 등 일부 RDBMS에서는 서브쿼리 인덱스 최적화가 필요할 수 있습니다.'],
      whyThisRank: '종류별 집계와 행 선택을 가장 깔끔하고 의도가 분명하게 분리한 표준 SQL 패턴입니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'biggest-fish-correlated-subquery',
      name: '상관 서브쿼리로 행마다 재집계',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(1)',
      verdict: '본 쿼리의 물고기 행마다 서브쿼리를 실행해 같은 종류 물고기들의 최댓값을 매번 다시 구하는 풀이입니다.',
      pros: ['튜플 비교 문법 없이 단일 컬럼 비교로 작성할 수 있습니다.'],
      cons: ['물고기 수 N만큼 서브쿼리가 반복 실행되어 행 수가 많을수록 심각하게 느려집니다.'],
      whyThisRank: '정답은 같지만 한 번의 GROUP BY 집계로 끝날 일을 행마다 반복해 계산 낭비가 큽니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'biggest-fish-overall-max-trap',
      name: '종류 구분 없이 전체 MAX(LENGTH)만 비교',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      verdict: '종류별(GROUP BY) 분리를 빠뜨리고 전체 테이블에서 가장 긴 물고기 하나만 비교해 다른 종류의 대어를 모두 놓치는 함정입니다.',
      pros: ['GROUP BY를 잊었을 때 자주 실수하는 형태입니다.'],
      cons: ['BASS나 SNAPPER의 대어(50cm, 60cm)가 73cm보다 작아 전부 누락되고 ANCHOVY만 출력됩니다.'],
      whyThisRank: '"종류별 대어"라는 핵심 요구사항을 전체 최댓값으로 축소해 버린 전형적인 오답입니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [FISHES, NAMES], expected: TRUTH },
      {
        args: [
          [[1, 0, 45], [2, 0, 52], [3, 1, 30]],
          { 0: 'BASS', 1: 'SNAPPER' },
        ],
        expected: [[2, 'BASS', 52], [3, 'SNAPPER', 30]],
      },
    ],
    random: (rand) => {
      const rows: FishRow[] = [
        [1, 0, 20 + Math.floor(rand() * 20)],
        [2, 0, 45 + Math.floor(rand() * 20)],
        [3, 1, 30 + Math.floor(rand() * 20)],
        [4, 1, 55 + Math.floor(rand() * 20)],
      ];
      return [rows, { 0: 'BASS', 1: 'SNAPPER' }];
    },
  },
};

export default problem;
