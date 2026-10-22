// 동명 동물 수 찾기: 정석 WHERE IS NOT NULL + GROUP BY + HAVING, 대안 NULL 포함 전체 그룹화 후 서브쿼리 필터, 함정 WHERE IS NOT NULL 누락 + COUNT(*)(NULL 그룹이 결과에 섞임)을 같은 장면에서 움직인다.
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

type AnimalRow = [id: string, species: string, name: string | null];

// 시각화 입력: 8마리의 동물 보호 기록.
// Lucy 3마리, Raven 2마리, Sam 1마리, 이름 없음(null) 2마리.
// 정석 정답: [['Lucy', 3], ['Raven', 2]]. WHERE IS NOT NULL 없이 COUNT(*)를 쓰면 [null, 2]까지 섞인다.
const ANIMALS: AnimalRow[] = [
  ['A101', 'Dog', 'Raven'],
  ['A102', 'Dog', 'Lucy'],
  ['A103', 'Cat', null],
  ['A104', 'Dog', 'Lucy'],
  ['A105', 'Dog', 'Sam'],
  ['A106', 'Cat', null],
  ['A107', 'Cat', 'Raven'],
  ['A108', 'Dog', 'Lucy'],
];
const TRUTH: [string, number][] = [
  ['Lucy', 3],
  ['Raven', 2],
];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  sql: `SELECT NAME, COUNT(NAME) AS COUNT
FROM ANIMAL_INS
WHERE NAME IS NOT NULL
GROUP BY NAME
HAVING COUNT(NAME) >= 2
ORDER BY NAME ASC;`,
  python: `def solution(animals):
    # WHERE NAME IS NOT NULL + GROUP BY NAME
    counts = {}
    for animal_id, species, name in animals:
        if name is not None:
            counts[name] = counts.get(name, 0) + 1
    # HAVING COUNT(NAME) >= 2 + ORDER BY NAME ASC
    result = [[name, cnt] for name, cnt in counts.items() if cnt >= 2]
    result.sort(key=lambda r: r[0])
    return result`,
  javascript: `function solution(animals) {
  // WHERE NAME IS NOT NULL + GROUP BY NAME
  const counts = new Map();
  for (const [, , name] of animals) {
    if (name !== null) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  // HAVING COUNT(NAME) >= 2 + ORDER BY NAME ASC
  const result = [];
  for (const [name, cnt] of counts) {
    if (cnt >= 2) result.push([name, cnt]);
  }
  return result.sort((a, b) => a[0].localeCompare(b[0]));
}`,
};
const BEST_AT = {
  where: sqlLines(
    BEST_CODE,
    ['FROM ANIMAL_INS', 'WHERE NAME IS NOT NULL'],
    ['for animal_id, species, name in animals:', 'if name is not None:'],
    ['for (const [, , name] of animals)', 'if (name !== null)'],
  ),
  group: sqlLines(
    BEST_CODE,
    ['GROUP BY NAME'],
    ['counts[name] = counts.get(name, 0) + 1'],
    ['counts.set(name, (counts.get(name) ?? 0) + 1)'],
  ),
  having: sqlLines(
    BEST_CODE,
    ['HAVING COUNT(NAME) >= 2'],
    ['result = [[name, cnt] for name, cnt in counts.items() if cnt >= 2]'],
    ['if (cnt >= 2) result.push([name, cnt]);'],
  ),
  order: sqlLines(
    BEST_CODE,
    ['SELECT NAME, COUNT(NAME) AS COUNT', 'ORDER BY NAME ASC;'],
    ['result.sort(key=lambda r: r[0])', 'return result'],
    ['return result.sort((a, b) => a[0].localeCompare(b[0]));'],
  ),
};

const ALT_CODE = {
  sql: `SELECT NAME, COUNT
FROM (
  SELECT NAME, COUNT(*) AS COUNT
  FROM ANIMAL_INS
  GROUP BY NAME
) G
WHERE NAME IS NOT NULL
  AND COUNT >= 2
ORDER BY NAME ASC;`,
  python: `def solution(animals):
    # 서브쿼리에서 NULL까지 포함해 먼저 전체 행을 그룹화
    grouped = {}
    for animal_id, species, name in animals:
        grouped[name] = grouped.get(name, 0) + 1
    # 바깥 WHERE에서 NAME IS NOT NULL AND COUNT >= 2 필터
    result = [
        [name, cnt]
        for name, cnt in grouped.items()
        if name is not None and cnt >= 2
    ]
    result.sort(key=lambda r: r[0])
    return result`,
  javascript: `function solution(animals) {
  // 서브쿼리에서 NULL까지 포함해 먼저 전체 행을 그룹화합니다
  const grouped = new Map();
  for (const [, , name] of animals) {
    grouped.set(name, (grouped.get(name) ?? 0) + 1);
  }
  // 바깥 WHERE에서 NAME IS NOT NULL AND COUNT >= 2 필터
  const result = [];
  for (const [name, cnt] of grouped) {
    if (name !== null && cnt >= 2) result.push([name, cnt]);
  }
  return result.sort((a, b) => a[0].localeCompare(b[0]));
}`,
};
const ALT_AT = {
  groupAll: sqlLines(
    ALT_CODE,
    ['SELECT NAME, COUNT(*) AS COUNT', 'FROM ANIMAL_INS', 'GROUP BY NAME'],
    ['for animal_id, species, name in animals:', 'grouped[name] = grouped.get(name, 0) + 1'],
    ['for (const [, , name] of animals)', 'grouped.set(name, (grouped.get(name) ?? 0) + 1)'],
  ),
  outerWhere: sqlLines(
    ALT_CODE,
    ['WHERE NAME IS NOT NULL', 'AND COUNT >= 2'],
    ['if name is not None and cnt >= 2'],
    ['if (name !== null && cnt >= 2) result.push([name, cnt]);'],
  ),
  order: sqlLines(
    ALT_CODE,
    ['SELECT NAME, COUNT', 'ORDER BY NAME ASC;'],
    ['result.sort(key=lambda r: r[0])', 'return result'],
    ['return result.sort((a, b) => a[0].localeCompare(b[0]));'],
  ),
};

const TRAP_CODE = {
  sql: `-- 함정: WHERE NAME IS NOT NULL 없이 COUNT(*)로 집계
SELECT NAME, COUNT(*) AS COUNT
FROM ANIMAL_INS
GROUP BY NAME
HAVING COUNT(*) >= 2
ORDER BY NAME ASC;`,
  python: `def solution(animals):
    # 함정: None을 거르지 않고 COUNT(*)로 세어 [None, 2] 그룹이 포함됨
    counts = {}
    for animal_id, species, name in animals:
        counts[name] = counts.get(name, 0) + 1
    result = [[name, cnt] for name, cnt in counts.items() if cnt >= 2]
    result.sort(key=lambda r: (r[0] is not None, r[0] or ''))
    return result`,
  javascript: `function solution(animals) {
  // 함정: null을 거르지 않고 COUNT(*)로 세어 [null, 2] 그룹이 포함됩니다
  const counts = new Map();
  for (const [, , name] of animals) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const result = [];
  for (const [name, cnt] of counts) {
    if (cnt >= 2) result.push([name, cnt]);
  }
  return result.sort((a, b) => {
    if (a[0] === b[0]) return 0;
    if (a[0] === null) return -1;
    if (b[0] === null) return 1;
    return a[0].localeCompare(b[0]);
  });
}`,
};
const TRAP_AT = {
  group: sqlLines(
    TRAP_CODE,
    ['FROM ANIMAL_INS', 'GROUP BY NAME'],
    ['for animal_id, species, name in animals:', 'counts[name] = counts.get(name, 0) + 1'],
    ['for (const [, , name] of animals)', 'counts.set(name, (counts.get(name) ?? 0) + 1)'],
  ),
  having: sqlLines(
    TRAP_CODE,
    ['SELECT NAME, COUNT(*) AS COUNT', 'HAVING COUNT(*) >= 2', 'ORDER BY NAME ASC;'],
    ['result = [[name, cnt] for name, cnt in counts.items() if cnt >= 2]', 'return result'],
    ['if (cnt >= 2) result.push([name, cnt]);', 'return result.sort'],
  ),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 600;
const H = 376;
const IN_X = 14;
const IN_Y = 36;
const IN_W = 248;
const IN_H = 30;
const IN_PITCH = 35;
const GRP_X = 286;
const GRP_W = 298;

const inRect = (r: number): Rect => ({ x: IN_X, y: IN_Y + r * IN_PITCH, w: IN_W, h: IN_H });
const grpRect = (slot: number): Rect => ({ x: GRP_X, y: IN_Y + slot * 48, w: GRP_W, h: 38 });
const inId = (r: number) => `in:${r}`;
const grpId = (slot: number) => `grp:${slot}`;
const rowLabel = ([id, species, name]: AnimalRow) => `${id} · ${species} · ${name ?? 'NULL'}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:in', kind: 'text', rect: { x: IN_X, y: 8, w: IN_W, h: 22 }, tone: 'muted', text: 'ANIMAL_INS (8행)' },
    { id: 'hdr:grp', kind: 'text', rect: { x: GRP_X, y: 8, w: GRP_W, h: 22 }, tone: 'chosen', text: '이름별 그룹 집계 / 결과' },
    { id: 'status', kind: 'token', rect: { x: IN_X, y: 328, w: 570, h: 32 }, tone: 'plain', text: '쿼리 실행 대기' },
  ];
  ANIMALS.forEach((a, r) => {
    items.push({ id: inId(r), kind: 'token', rect: inRect(r), tone: 'plain', text: rowLabel(a) });
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석: WHERE NAME IS NOT NULL → GROUP BY NAME → HAVING COUNT >= 2    */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const groups = new Map<string, { slot: number; count: number }>();
  const meta = (clause: string, target = '-') => ({
    work,
    variables: { 절: clause, 이름: target, 그룹수: groups.size },
  });

  ANIMALS.forEach(([id, , name], r) => {
    work += 1;
    if (name === null) {
      rec.step({
        title: `WHERE 검사: ${id} (NAME=NULL) → 그룹화 전에 제외`,
        codeHighlights: BEST_AT.where,
        ...meta('WHERE', 'NULL'),
      });
      rec.phase('NULL 제외', `${id} 행은 NAME이 NULL이므로 WHERE NAME IS NOT NULL에서 바로 걸러져 그룹 버킷조차 만들지 않습니다.`, BEST_AT.where);
      rec.do(
        ...together([
          paint(inId(r), 'muted'),
          { type: 'set', id: 'status', patch: { text: `${id}: NAME IS NULL → 그룹화 제외`, tone: 'muted' }, pop: true },
        ]),
        wait(150),
      );
      return;
    }

    const prev = groups.get(name);
    const slot = prev ? prev.slot : groups.size;
    const count = (prev?.count ?? 0) + 1;
    groups.set(name, { slot, count });

    rec.step({
      title: `GROUP BY: ${id} (${name}) → ${name} 그룹 ${count}마리`,
      codeHighlights: BEST_AT.group,
      ...meta('GROUP BY', name),
    });
    rec.phase('이름별 집계', `이름이 있는 ${id}(${name}) 행을 '${name}' 그룹에 넣고 COUNT(NAME)을 ${count}로 갱신합니다.`, BEST_AT.group);
    if (!prev) {
      rec.do(
        ...together([
          paint(inId(r), 'visited'),
          { type: 'add', item: { id: grpId(slot), kind: 'token', rect: grpRect(slot), tone: 'plain', text: `${name} → COUNT = 1` }, from: inId(r) },
        ]),
        wait(160),
      );
    } else {
      rec.do(
        ...together([
          paint(inId(r), 'visited'),
          { type: 'set', id: grpId(slot), patch: { text: `${name} → COUNT = ${count}`, tone: count >= 2 ? 'good' : 'plain' }, pop: true },
        ]),
        wait(160),
      );
    }
  });

  work += groups.size;
  rec.step({
    title: 'HAVING COUNT(NAME) >= 2: Sam(1마리) 제외, 2개 그룹 통과',
    codeHighlights: BEST_AT.having,
    ...meta('HAVING', 'Lucy, Raven'),
  });
  rec.phase('HAVING 필터', '그룹화된 3개 이름 중 COUNT가 1인 Sam은 버리고 2마리 이상인 Raven(2)과 Lucy(3)만 남깁니다.', BEST_AT.having);
  rec.do(
    ...together([
      paint(grpId(0), 'good'),
      paint(grpId(1), 'good'),
      paint(grpId(2), 'muted'),
      { type: 'set', id: 'status', patch: { text: 'HAVING COUNT(NAME) >= 2 → Raven(2), Lucy(3) 통과', tone: 'chosen' }, pop: true },
    ]),
    wait(200),
  );

  rec.step({
    title: 'ORDER BY NAME ASC → [[Lucy, 3], [Raven, 2]]',
    codeHighlights: BEST_AT.order,
    ...meta('ORDER BY', '완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('이름순 정렬', '이름 오름차순(Lucy → Raven)으로 정렬해 최종 결과를 반환합니다.', BEST_AT.order);
  rec.do(
    ...together([
      { type: 'set', id: grpId(0), patch: { text: '1행: [Lucy, 3]', tone: 'path' }, pop: true },
      { type: 'set', id: grpId(1), patch: { text: '2행: [Raven, 2]', tone: 'path' }, pop: true },
      { type: 'remove', id: grpId(2) },
      { type: 'set', id: 'status', patch: { text: `정답: [['Lucy', 3], ['Raven', 2]] (연산 ${work}회)`, tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: NULL까지 먼저 그룹화한 뒤 바깥 WHERE에서 필터                     */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const groups = new Map<string | null, { slot: number; count: number }>();
  const meta = (clause: string, target = '-') => ({
    work,
    variables: { 절: clause, 이름: target, 그룹수: groups.size },
  });

  ANIMALS.forEach(([id, , name], r) => {
    work += 1;
    const prev = groups.get(name);
    const slot = prev ? prev.slot : groups.size;
    const count = (prev?.count ?? 0) + 1;
    groups.set(name, { slot, count });
    const label = name ?? 'NULL';

    rec.step({
      title: `서브쿼리 GROUP BY: ${id} (${label}) → ${label} 버킷 ${count}건`,
      codeHighlights: ALT_AT.groupAll,
      ...meta('서브쿼리 GROUP BY', label),
    });
    rec.phase('전체 그룹화', `WHERE 없이 먼저 묶으므로 ${id}의 ${label}도 그룹 버킷에 넣어 집계합니다.`, ALT_AT.groupAll);
    if (!prev) {
      rec.do(
        ...together([
          paint(inId(r), 'visited'),
          { type: 'add', item: { id: grpId(slot), kind: 'token', rect: grpRect(slot), tone: 'chosen', text: `${label} → COUNT = 1` }, from: inId(r) },
        ]),
        wait(150),
      );
    } else {
      rec.do(
        ...together([
          paint(inId(r), 'visited'),
          { type: 'set', id: grpId(slot), patch: { text: `${label} → COUNT = ${count}`, tone: 'chosen' }, pop: true },
        ]),
        wait(150),
      );
    }
  });

  // 불필요하게 만들어진 NULL 그룹까지 포함해 4개 그룹을 다시 스캔·필터
  work += groups.size + 2;
  rec.step({
    title: '바깥 WHERE: 만들어진 4개 그룹에서 NULL 그룹과 Sam 제외',
    codeHighlights: ALT_AT.outerWhere,
    ...meta('바깥 WHERE', 'NULL, Sam 제외'),
  });
  rec.phase('뒤늦은 필터', '이미 만든 NULL(2건) 그룹과 Sam(1건) 그룹을 바깥 쿼리 WHERE에서 뒤늦게 버립니다.', ALT_AT.outerWhere);
  rec.do(
    ...together([
      paint(grpId(0), 'good'),
      paint(grpId(1), 'good'),
      paint(grpId(2), 'muted'),
      paint(grpId(3), 'muted'),
      { type: 'set', id: 'status', patch: { text: '불필요하게 만든 NULL 그룹을 뒤늦게 제거', tone: 'chosen' }, pop: true },
    ]),
    wait(200),
  );

  rec.step({
    title: `ORDER BY 완료: 정답 동일, 연산 ${work}회 (정석은 11회)`,
    codeHighlights: ALT_AT.order,
    ...meta('ORDER BY', '완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('마무리', `결과는 같지만 NULL 행까지 그룹 해시 테이블에 넣고 다시 거르느라 총 ${work}번 연산했습니다.`, ALT_AT.order);
  rec.do(
    ...together([
      { type: 'set', id: grpId(0), patch: { text: '1행: [Lucy, 3]', tone: 'path' }, pop: true },
      { type: 'set', id: grpId(1), patch: { text: '2행: [Raven, 2]', tone: 'path' }, pop: true },
      { type: 'remove', id: grpId(2) },
      { type: 'remove', id: grpId(3) },
      { type: 'set', id: 'status', patch: { text: `정답 동일: [['Lucy', 3], ['Raven', 2]] (연산 ${work}회)`, tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: WHERE NAME IS NOT NULL 없이 COUNT(*) >= 2                      */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const groups = new Map<string | null, { slot: number; count: number }>();
  const meta = (clause: string, target = '-') => ({
    work,
    variables: { 절: clause, 이름: target, 그룹수: groups.size },
  });

  ANIMALS.forEach(([id, , name], r) => {
    work += 1;
    const prev = groups.get(name);
    const slot = prev ? prev.slot : groups.size;
    const count = (prev?.count ?? 0) + 1;
    groups.set(name, { slot, count });
    const label = name ?? 'NULL';
    const isNullTrap = name === null && count >= 2;

    rec.step({
      title: `GROUP BY: ${id} (${label}) → COUNT(*) = ${count}${isNullTrap ? ' (함정!)' : ''}`,
      codeHighlights: TRAP_AT.group,
      ...meta('GROUP BY', label),
    });
    rec.phase(
      'NULL까지 묶기',
      isNullTrap
        ? 'GROUP BY는 NULL끼리도 한 그룹으로 묶고, COUNT(*)는 NULL 행도 세므로 [NULL, 2] 그룹이 2건 이상이 되어 버립니다!'
        : `WHERE NAME IS NOT NULL 없이 ${id}(${label}) 행을 그대로 그룹에 합칩니다.`,
      TRAP_AT.group,
    );
    if (!prev) {
      rec.do(
        ...together([
          paint(inId(r), name === null ? 'bad' : 'visited'),
          { type: 'add', item: { id: grpId(slot), kind: 'token', rect: grpRect(slot), tone: name === null ? 'bad' : 'plain', text: `${label} → COUNT(*) = 1` }, from: inId(r) },
        ]),
        wait(150),
      );
    } else {
      rec.do(
        ...together([
          paint(inId(r), name === null ? 'bad' : 'visited'),
          { type: 'set', id: grpId(slot), patch: { text: `${label} → COUNT(*) = ${count}`, tone: name === null ? 'bad' : count >= 2 ? 'chosen' : 'plain' }, pop: true },
        ]),
        wait(150),
      );
    }
  });

  const wrongAns: [string | null, number][] = [
    [null, 2],
    ['Lucy', 3],
    ['Raven', 2],
  ];
  work += groups.size;

  rec.step({
    title: '오답: 이름 없는 동물 그룹 [null, 2]가 결과에 포함됨',
    codeHighlights: TRAP_AT.having,
    ...meta('HAVING', '오답'),
    answer: wrongAns,
    isKeyframe: true,
  });
  rec.phase(
    '오답 확인',
    '이름 없는 동물은 제외하라는 조건을 빠뜨리고 COUNT(*)를 써서 [null, 2] 행이 함께 출력되었습니다.',
    TRAP_AT.having,
  );
  rec.do(
    ...together([
      paint(grpId(0), 'chosen'),
      paint(grpId(1), 'chosen'),
      paint(grpId(2), 'bad'),
      paint(grpId(3), 'muted'),
      { type: 'set', id: 'status', patch: { text: '오답: [[null, 2], [Lucy, 3], [Raven, 2]] · NULL 그룹 혼입!', tone: 'bad' }, pop: true },
    ]),
  );
  return rec.finish();
}

const problem: Problem = {
  id: 'same-name-animal-count',
  title: '동명 동물 수 찾기',
  level: 2,
  category: 'sql-group-by',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/59041',
  description: {
    summary:
      'ANIMAL_INS 테이블에 들어온 동물 이름 중 두 번 이상 쓰인 이름과 해당 이름이 쓰인 횟수를 조회합니다. 이때 이름이 없는 동물은 집계에서 제외하며, 결과는 이름 순으로 오름차순 정렬합니다.',
    rules: [
      '이름이 없는(NAME IS NULL) 동물은 집계에서 제외함',
      '두 번 이상 쓰인 이름(COUNT >= 2)만 출력함',
      '결과는 이름(NAME) 오름차순으로 정렬함',
    ],
    examples: [
      {
        input: 'ANIMAL_INS = [["A101","Dog","Raven"],["A102","Dog","Lucy"],["A103","Cat",null],["A104","Dog","Lucy"],["A105","Dog","Sam"],["A106","Cat",null],["A107","Cat","Raven"],["A108","Dog","Lucy"]]',
        output: '[["Lucy", 3], ["Raven", 2]]',
      },
    ],
  },
  keyIntuitions: [
    '그룹화하기 전에 걸러낼 수 있는 조건(NAME IS NOT NULL)은 WHERE 절에 적어 일찍 제외해야 불필요한 NULL 그룹이 생기지 않습니다.',
    'GROUP BY는 NULL 값들도 하나의 같은 그룹으로 묶고, COUNT(*)는 NULL 행까지 개수로 세므로 주의해야 합니다.',
    '그룹별 개수가 2 이상인지 검사하는 조건은 집계 이후에 판단하므로 HAVING COUNT(NAME) >= 2에 적습니다.',
  ],
  demo: {
    input: [ANIMALS],
    label: 'ANIMAL_INS 8행 (Lucy 3마리, Raven 2마리, Sam 1마리, NULL 2마리)',
  },
  workUnit: '처리한 행 및 그룹 수',
  approaches: [
    {
      id: 'same-name-where-having',
      name: 'WHERE IS NOT NULL + HAVING',
      rank: 'BEST',
      timeComplexity: 'O(N + G log G)',
      spaceComplexity: 'O(G)',
      verdict: 'WHERE NAME IS NOT NULL로 이름 없는 동물을 먼저 제외한 뒤 GROUP BY와 HAVING으로 2마리 이상인 이름만 추리는 정석 풀이입니다.',
      pros: [
        '그룹 해시 테이블에 NULL 키가 아예 들어가지 않아 메모리와 집계 비용을 아낍니다.',
        'WHERE(그룹화 전 행 필터)와 HAVING(그룹화 후 집계 필터)의 역할을 정확히 나눕니다.',
      ],
      cons: ['WHERE와 HAVING의 실행 순서를 헷갈리지 않아야 합니다.'],
      whyThisRank: '가장 적은 수의 행만 그룹화하고 표준 SQL 실행 순서에 맞게 조건을 배치한 정석 쿼리입니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'same-name-subquery-filter',
      name: '전체 그룹화 후 바깥 WHERE 필터',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N + G log G)',
      spaceComplexity: 'O(G)',
      verdict: 'NULL까지 포함해 전체 행을 먼저 그룹화한 뒤 바깥 쿼리의 WHERE에서 NULL 그룹과 1마리 그룹을 거르는 풀이입니다.',
      pros: ['집계 결과를 일반 테이블처럼 바깥 WHERE 한 곳에서 조건으로 다룰 수 있습니다.'],
      cons: ['버려질 NULL 행들까지 그룹화하고 세는 불필요한 작업이 추가됩니다.'],
      whyThisRank: '정답은 같지만 그룹화 전에 제외할 수 있는 NULL 행까지 모두 집계에 포함시켜 작업량이 더 많습니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'same-name-null-group-trap',
      name: 'WHERE 누락 + COUNT(*) >= 2',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N + G log G)',
      spaceComplexity: 'O(G)',
      verdict: 'WHERE NAME IS NOT NULL 없이 GROUP BY NAME HAVING COUNT(*) >= 2를 써서 이름 없는 동물 2마리가 [null, 2] 그룹으로 출력되는 함정입니다.',
      pros: ['쿼리가 짧아 보여 초보자가 가장 흔히 먼저 작성하는 형태입니다.'],
      cons: [
        'SQL의 GROUP BY는 NULL끼리도 한 그룹으로 묶기 때문에 이름 없는 동물이 2마리 이상이면 [null, 2] 행이 결과에 섞입니다.',
      ],
      whyThisRank: 'GROUP BY가 NULL을 하나의 그룹으로 묶는다는 성질을 놓쳐 틀리는 대표적인 함정입니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [ANIMALS], expected: TRUTH },
      {
        args: [[['A1', 'Dog', 'Max'], ['A2', 'Cat', null], ['A3', 'Dog', 'Max'], ['A4', 'Cat', 'Leo']]],
        expected: [['Max', 2]],
      },
      {
        args: [[['B1', 'Dog', 'Coco'], ['B2', 'Cat', null], ['B3', 'Dog', null]]],
        expected: [],
      },
    ],
    random: (rand) => {
      const pool: (string | null)[] = ['Lucy', 'Raven', 'Sam', 'Max', 'Coco', null];
      const n = 4 + Math.floor(rand() * 6);
      const rows: AnimalRow[] = Array.from({ length: n }, (_, i) => [
        `A${100 + i}`,
        rand() < 0.5 ? 'Dog' : 'Cat',
        pool[Math.floor(rand() * pool.length)],
      ]);
      return [rows];
    },
  },
};

export default problem;
