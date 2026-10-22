// 이름에 el이 들어가는 강아지 찾기: 정석 WHERE ANIMAL_TYPE = 'Dog' AND LOWER(NAME) LIKE '%el%' 후 이름순 정렬, 대안 모든 동물의 이름을 먼저 소문자 변환·패턴 검사한 뒤 강아지만 추리기, 함정 LOWER 없이 대소문자 구분 LIKE '%el%'로 'Elijah'·'Ella'를 놓치는 오답을 같은 장면에서 움직인다.
import type { Action, AlgorithmStep, CodeHighlights, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, sqlLines, together } from '../shared.ts';

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

type AnimalRow = [id: string, type: string, name: string];

// 시각화 입력: 6마리의 보호 동물.
// 강아지 중 이름(대소문자 무관)에 'el'이 들어가는 동물은 Elijah, Ella, Maxwell 2 총 3마리다.
// Clementine, Michael은 'el'이 들어가지만 고양이(Cat)이고, Elijah·Ella는 대문자 'El'로 시작한다.
const ANIMALS: AnimalRow[] = [
  ['A382192', 'Dog', 'Maxwell 2'],
  ['A352898', 'Cat', 'Clementine'],
  ['A355753', 'Dog', 'Elijah'],
  ['A390222', 'Dog', 'Rogan'],
  ['A373219', 'Dog', 'Ella'],
  ['A399421', 'Cat', 'Michael'],
];
const TRUTH = [
  ['A355753', 'Elijah'],
  ['A373219', 'Ella'],
  ['A382192', 'Maxwell 2'],
];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  sql: `SELECT ANIMAL_ID, NAME
FROM ANIMAL_INS
WHERE ANIMAL_TYPE = 'Dog'
  AND LOWER(NAME) LIKE '%el%'
ORDER BY NAME ASC;`,
  python: `def solution(animals):
    # WHERE ANIMAL_TYPE = 'Dog' AND LOWER(NAME) LIKE '%el%'
    matched = [
        [animal_id, name]
        for animal_id, animal_type, name in animals
        if animal_type == 'Dog' and 'el' in name.lower()
    ]
    # ORDER BY NAME ASC
    matched.sort(key=lambda r: (r[1], r[0]))
    return matched`,
  javascript: `function solution(animals) {
  // WHERE ANIMAL_TYPE = 'Dog' AND LOWER(NAME) LIKE '%el%'
  const matched = animals
    .filter(([, type, name]) => type === 'Dog' && name.toLowerCase().includes('el'))
    .map(([id, , name]) => [id, name]);
  // ORDER BY NAME ASC
  return matched.sort((a, b) =>
    a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : a[0] < b[0] ? -1 : 0);
}`,
};
const BEST_AT = {
  from: sqlLines(
    BEST_CODE,
    ['FROM ANIMAL_INS'],
    ['for animal_id, animal_type, name in animals'],
    ['const matched = animals'],
  ),
  where: sqlLines(
    BEST_CODE,
    ["WHERE ANIMAL_TYPE = 'Dog'", "AND LOWER(NAME) LIKE '%el%'"],
    ["if animal_type == 'Dog' and 'el' in name.lower()"],
    ["filter(([, type, name]) => type === 'Dog' && name.toLowerCase().includes('el'))"],
  ),
  order: sqlLines(
    BEST_CODE,
    ['ORDER BY NAME ASC;'],
    ['matched.sort(key=lambda r: (r[1], r[0]))'],
    ['return matched.sort((a, b) =>'],
  ),
  select: sqlLines(
    BEST_CODE,
    ['SELECT ANIMAL_ID, NAME'],
    ['return matched'],
    ['a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : a[0] < b[0] ? -1 : 0);'],
  ),
};

const ALT_CODE = {
  sql: `SELECT ANIMAL_ID, NAME
FROM (
  SELECT ANIMAL_ID, ANIMAL_TYPE, NAME
  FROM ANIMAL_INS
  WHERE LOWER(NAME) LIKE '%el%'
) E
WHERE ANIMAL_TYPE = 'Dog'
ORDER BY NAME ASC;`,
  python: `def solution(animals):
    # 모든 동물의 이름을 먼저 소문자 변환·부분 문자열 검사한 뒤 강아지만 추린다
    el_animals = [
        [animal_id, animal_type, name]
        for animal_id, animal_type, name in animals
        if 'el' in name.lower()
    ]
    dogs = [[animal_id, name] for animal_id, animal_type, name in el_animals if animal_type == 'Dog']
    dogs.sort(key=lambda r: (r[1], r[0]))
    return dogs`,
  javascript: `function solution(animals) {
  // 모든 동물의 이름을 먼저 소문자 변환·부분 문자열 검사한 뒤 강아지만 추립니다
  const elAnimals = animals.filter(([, , name]) =>
    name.toLowerCase().includes('el'));
  const dogs = elAnimals
    .filter(([, type]) => type === 'Dog')
    .map(([id, , name]) => [id, name]);
  return dogs.sort((a, b) =>
    a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : a[0] < b[0] ? -1 : 0);
}`,
};
const ALT_AT = {
  likeAll: sqlLines(
    ALT_CODE,
    ['FROM ANIMAL_INS', "WHERE LOWER(NAME) LIKE '%el%'"],
    ['for animal_id, animal_type, name in animals', "if 'el' in name.lower()"],
    ['const elAnimals = animals.filter(([, , name]) =>', "name.toLowerCase().includes('el'));"],
  ),
  dogFilter: sqlLines(
    ALT_CODE,
    ["WHERE ANIMAL_TYPE = 'Dog'"],
    ["dogs = [[animal_id, name] for animal_id, animal_type, name in el_animals if animal_type == 'Dog']"],
    [".filter(([, type]) => type === 'Dog')"],
  ),
  done: sqlLines(
    ALT_CODE,
    ['SELECT ANIMAL_ID, NAME', 'ORDER BY NAME ASC;'],
    ['dogs.sort(key=lambda r: (r[1], r[0]))', 'return dogs'],
    ['return dogs.sort((a, b) =>'],
  ),
};

const TRAP_CODE = {
  sql: `-- 함정: LOWER(NAME) 없이 소문자 'el'만 대소문자 구분 검색
SELECT ANIMAL_ID, NAME
FROM ANIMAL_INS
WHERE ANIMAL_TYPE = 'Dog'
  AND NAME LIKE BINARY '%el%'
ORDER BY NAME ASC;`,
  python: `def solution(animals):
    # 함정: name.lower()를 쓰지 않아 대문자 'El'로 시작하는 강아지를 놓침
    matched = [
        [animal_id, name]
        for animal_id, animal_type, name in animals
        if animal_type == 'Dog' and 'el' in name
    ]
    matched.sort(key=lambda r: (r[1], r[0]))
    return matched`,
  javascript: `function solution(animals) {
  // 함정: toLowerCase()를 쓰지 않아 대문자 'El'로 시작하는 강아지를 놓칩니다
  const matched = animals
    .filter(([, type, name]) => type === 'Dog' && name.includes('el'))
    .map(([id, , name]) => [id, name]);
  return matched.sort((a, b) =>
    a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : a[0] < b[0] ? -1 : 0);
}`,
};
const TRAP_AT = {
  from: sqlLines(
    TRAP_CODE,
    ['FROM ANIMAL_INS'],
    ['for animal_id, animal_type, name in animals'],
    ['const matched = animals'],
  ),
  where: sqlLines(
    TRAP_CODE,
    ["WHERE ANIMAL_TYPE = 'Dog'", "AND NAME LIKE BINARY '%el%'"],
    ["if animal_type == 'Dog' and 'el' in name"],
    [".filter(([, type, name]) => type === 'Dog' && name.includes('el'))"],
  ),
  done: sqlLines(
    TRAP_CODE,
    ['ORDER BY NAME ASC;'],
    ['matched.sort(key=lambda r: (r[1], r[0]))', 'return matched'],
    ['return matched.sort((a, b) =>'],
  ),
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
const ROW_W = 324;
const OUT_X = 360;
const OUT_W = 226;

const rowRect = (r: number): Rect => ({ x: ROW_X, y: ROW_Y + r * ROW_PITCH, w: ROW_W, h: ROW_H });
const outRect = (slot: number): Rect => ({ x: OUT_X, y: ROW_Y + slot * ROW_PITCH, w: OUT_W, h: ROW_H });
const rowId = (r: number) => `row:${r}`;
const outId = (slot: number) => `out:${slot}`;
const rowText = ([id, type, name]: AnimalRow) => `${id} · ${type} · "${name}"`;
const outText = ([id, , name]: AnimalRow) => `${id} · ${name}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:in', kind: 'text', rect: { x: ROW_X, y: 10, w: ROW_W, h: 22 }, tone: 'muted', text: 'ANIMAL_INS 테이블 (6행)' },
    { id: 'hdr:out', kind: 'text', rect: { x: OUT_X, y: 10, w: OUT_W, h: 22 }, tone: 'chosen', text: '후보 / SELECT 결과' },
    { id: 'status', kind: 'token', rect: { x: ROW_X, y: 292, w: 572, h: 32 }, tone: 'plain', text: '쿼리 실행 대기' },
  ];
  ANIMALS.forEach((a, r) => {
    items.push({ id: rowId(r), kind: 'token', rect: rowRect(r), tone: 'plain', text: rowText(a) });
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석: Dog 먼저 확인 후 LOWER(NAME) LIKE '%el%' + 이름순 정렬          */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const kept: AnimalRow[] = [];
  const meta = (clause: string, animal = '-') => ({
    work,
    variables: { 절: clause, 동물: animal, 통과수: kept.length },
  });

  rec.step({ title: 'FROM ANIMAL_INS: 6마리 동물 행 스캔 시작', codeHighlights: BEST_AT.from, ...meta('FROM') });
  rec.phase('테이블 스캔', 'ANIMAL_INS 테이블의 6개 행을 읽으며 강아지(Dog) 여부와 이름의 "el" 포함 여부를 차례로 검사합니다.', BEST_AT.from);
  rec.do({ type: 'set', id: 'status', patch: { text: "FROM ANIMAL_INS → WHERE Dog + LOWER(NAME) LIKE '%el%'", tone: 'chosen' }, pop: true }, wait(200));

  ANIMALS.forEach((a, r) => {
    const [id, type, name] = a;
    const isDog = type === 'Dog';
    const lower = name.toLowerCase();
    const hasEl = isDog && lower.includes('el');
    work += 1;
    if (hasEl) kept.push(a);

    const verdict = !isDog
      ? `Cat이므로 문자열 검사 생략`
      : hasEl
        ? `LOWER("${name}") = "${lower}" → 'el' 포함`
        : `LOWER("${name}") = "${lower}" → 'el' 없음`;

    rec.step({
      title: `WHERE 검사: ${id} ${name}(${type}) → ${hasEl ? '통과' : '제외'}`,
      codeHighlights: BEST_AT.where,
      ...meta('WHERE', `${name}(${type})`),
    });
    rec.phase('조건 판별', `${id} ${name}: ${verdict}.`, BEST_AT.where);
    rec.do(...together([{ type: 'focus', ids: [rowId(r)] }, paint(rowId(r), hasEl ? 'good' : 'explored')]), wait(170));

    if (hasEl) {
      const slot = kept.length - 1;
      rec.phase('후보 추가', `강아지이면서 이름에 'el'이 들어가는 ${name}(${id})을 결과 후보에 추가합니다.`, BEST_AT.where);
      rec.do(
        { type: 'add', item: { id: outId(slot), kind: 'token', rect: outRect(slot), tone: 'chosen', text: outText(a) }, from: rowId(r) },
        { type: 'unfocus' },
        paint(rowId(r), 'visited'),
      );
    } else {
      rec.phase('행 제외', `${name}(${type}) 행은 조건에 맞지 않으므로 바로 건너뜁니다.`, BEST_AT.where);
      rec.do({ type: 'unfocus' }, paint(rowId(r), 'muted'));
    }
  });

  const sorted = [...kept].sort((a, b) => (a[2] < b[2] ? -1 : a[2] > b[2] ? 1 : a[0] < b[0] ? -1 : 0));
  work += sorted.length;

  rec.step({
    title: `ORDER BY NAME ASC: 살아남은 ${sorted.length}마리를 이름순 정렬`,
    codeHighlights: BEST_AT.order,
    ...meta('ORDER BY', 'Elijah → Ella → Maxwell 2'),
  });
  rec.phase('이름순 정렬', `추려진 강아지 3마리를 NAME 오름차순(Elijah → Ella → Maxwell 2)으로 정렬합니다.`, BEST_AT.order);
  rec.do(
    ...together([
      ...sorted.map((a, i): Action => ({ type: 'set', id: outId(i), patch: { text: outText(a), tone: 'current' }, pop: true })),
      { type: 'set', id: 'status', patch: { text: 'ORDER BY NAME ASC → Elijah, Ella, Maxwell 2', tone: 'chosen' }, pop: true },
    ]),
    wait(200),
  );

  rec.step({
    title: `SELECT 완료: ${josa(TRUTH.length, '마리', '마리')} 출력 (연산 ${work}회)`,
    codeHighlights: BEST_AT.select,
    ...meta('SELECT', '완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('마무리', `고양이 행은 일찍 건너뛰고 강아지 3마리만 정렬해 총 ${work}회의 행 연산으로 정답을 구했습니다.`, BEST_AT.select);
  rec.do(
    ...together([
      paint(outId(0), 'path'),
      paint(outId(1), 'path'),
      paint(outId(2), 'path'),
      { type: 'set', id: 'status', patch: { text: '정답: [A355753 Elijah, A373219 Ella, A382192 Maxwell 2]', tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 모든 동물에 LOWER(NAME) LIKE '%el%' 먼저 수행 후 Dog 필터        */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const elList: { animal: AnimalRow; slot: number }[] = [];
  const meta = (clause: string, animal = '-') => ({
    work,
    variables: { 절: clause, 동물: animal, el통과수: elList.length },
  });

  ANIMALS.forEach((a, r) => {
    const [id, type, name] = a;
    const lower = name.toLowerCase();
    const hasEl = lower.includes('el');
    work += 1;

    rec.step({
      title: `1단계 LOWER+LIKE: ${name}(${type}) → "${lower}" (${hasEl ? '통과' : '제외'})`,
      codeHighlights: ALT_AT.likeAll,
      ...meta("LOWER LIKE '%el%'", `${name}(${type})`),
    });
    rec.phase(
      '전체 이름 검사',
      `동물 종류를 가리지 않고 ${name}(${type})의 이름을 소문자로 바꿔 'el'이 들어 있는지 검사합니다.`,
      ALT_AT.likeAll,
    );
    if (hasEl) {
      const slot = elList.length;
      elList.push({ animal: a, slot });
      rec.do(
        ...together([
          paint(rowId(r), 'visited'),
          { type: 'add', item: { id: outId(slot), kind: 'token', rect: outRect(slot), tone: 'chosen', text: `${id} · ${type} · ${name}` }, from: rowId(r) },
        ]),
        wait(150),
      );
    } else {
      rec.do(paint(rowId(r), 'muted'), wait(150));
    }
  });

  work += elList.length;
  rec.step({
    title: `2단계 WHERE ANIMAL_TYPE = 'Dog': ${elList.length}건 중 고양이 2마리 뒤늦게 제외`,
    codeHighlights: ALT_AT.dogFilter,
    ...meta("WHERE 'Dog'", 'Cat 2건 제거'),
  });
  rec.phase(
    '뒤늦은 Dog 필터',
    `이름 검사를 통과한 ${elList.length}마리 중 고양이(Clementine, Michael) 2마리를 뒤늦게 걸러냅니다.`,
    ALT_AT.dogFilter,
  );
  rec.do(
    ...together([
      ...elList.map(({ animal, slot }): Action => paint(outId(slot), animal[1] === 'Dog' ? 'good' : 'muted')),
      { type: 'set', id: 'status', patch: { text: '고양이(Clementine, Michael) 뒤늦게 제외 → 강아지 3마리 남음', tone: 'chosen' }, pop: true },
    ]),
    wait(200),
  );

  const sorted = elList
    .filter(({ animal }) => animal[1] === 'Dog')
    .map(({ animal }) => animal)
    .sort((a, b) => (a[2] < b[2] ? -1 : a[2] > b[2] ? 1 : a[0] < b[0] ? -1 : 0));
  work += sorted.length;

  rec.step({
    title: `ORDER BY + SELECT 완료: 정답 동일, 총 연산 ${work}회`,
    codeHighlights: ALT_AT.done,
    ...meta('ORDER BY', '완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase(
    '마무리',
    `정답은 같지만 고양이까지 문자열 변환·검사를 수행하고 다시 걸러내느라 총 ${work}회(정석 9회) 연산했습니다.`,
    ALT_AT.done,
  );
  rec.do(
    ...together([
      ...sorted.map((a, i): Action => ({
        type: 'set',
        id: outId(i),
        patch: { rect: outRect(i), text: outText(a), tone: 'path' },
        pop: true,
      })),
      ...elList.slice(sorted.length).map(({ slot }): Action => ({ type: 'remove', id: outId(slot) })),
      { type: 'set', id: 'status', patch: { text: `정답 3마리 동일 (불필요한 중간 행 처리로 총 ${work}회)`, tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: LOWER 없이 소문자 'el'만 대소문자 구분 검색                      */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const kept: AnimalRow[] = [];
  const meta = (clause: string, animal = '-') => ({
    work,
    variables: { 절: clause, 동물: animal, 통과수: kept.length },
  });

  rec.step({ title: "함정 쿼리: LOWER(NAME) 없이 대소문자 구분 '%el%' 검색", codeHighlights: TRAP_AT.from, ...meta('FROM') });
  rec.phase('함정 시작', "이름 첫 글자가 대문자 'El'인 강아지가 있는데도 LOWER(NAME) 없이 소문자 'el'만 찾는 경우를 살펴봅니다.", TRAP_AT.from);
  rec.do({ type: 'set', id: 'status', patch: { text: "LOWER(NAME) 누락 → 대문자 'El'로 시작하는 이름 누락 위험", tone: 'bad' }, pop: true }, wait(200));

  ANIMALS.forEach((a, r) => {
    const [, type, name] = a;
    const isDog = type === 'Dog';
    const exactEl = isDog && name.includes('el');
    const missedCapital = isDog && !exactEl && name.toLowerCase().includes('el');
    work += 1;
    if (exactEl) kept.push(a);

    rec.step({
      title: `WHERE 검사: ${name}(${type}) → ${missedCapital ? "'El' 대문자라 누락(함정!)" : exactEl ? '통과' : '제외'}`,
      codeHighlights: TRAP_AT.where,
      ...meta('WHERE', `${name}(${type})`),
    });
    rec.phase(
      '대소문자 함정',
      missedCapital
        ? `${name}은 강아지이고 'El'로 시작하지만, 소문자 'el'만 찾아서 결과에서 빠져 버립니다!`
        : `${name}(${type}) 행에 대해 ANIMAL_TYPE = 'Dog'와 소문자 'el' 포함 여부를 확인합니다.`,
      TRAP_AT.where,
    );
    if (exactEl) {
      const slot = kept.length - 1;
      rec.do(
        ...together([
          paint(rowId(r), 'visited'),
          { type: 'add', item: { id: outId(slot), kind: 'token', rect: outRect(slot), tone: 'chosen', text: outText(a) }, from: rowId(r) },
        ]),
        wait(170),
      );
    } else {
      rec.do(paint(rowId(r), missedCapital ? 'bad' : 'muted'), wait(160));
    }
  });

  const wrongAns = kept.map(([id, , name]) => [id, name]);
  work += wrongAns.length;

  rec.step({
    title: `오답: Elijah·Ella가 빠져 ${wrongAns.length}마리만 반환 (정답은 3마리)`,
    codeHighlights: TRAP_AT.done,
    ...meta('ORDER BY', '오답'),
    answer: wrongAns,
    isKeyframe: true,
  });
  rec.phase(
    '오답 확인',
    "대문자 'El'로 시작하는 Elijah와 Ella가 누락되어 Maxwell 2 한 마리만 출력되었습니다. 반드시 LOWER(NAME) LIKE '%el%'처럼 대소문자를 통일해야 합니다.",
    TRAP_AT.done,
  );
  rec.do(
    ...together([
      paint(outId(0), 'bad'),
      { type: 'set', id: 'status', patch: { text: '오답: [A382192 Maxwell 2] 1건 · Elijah, Ella 누락!', tone: 'bad' }, pop: true },
    ]),
  );
  return rec.finish();
}

const problem: Problem = {
  id: 'find-el-in-dog',
  title: '이름에 el이 들어가는 강아지 찾기',
  level: 2,
  category: 'sql-string-date',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/59047',
  description: {
    summary:
      'ANIMAL_INS 테이블에 들어온 동물 중, 이름에 "el"이 들어가는 강아지(Dog)의 아이디와 이름을 조회합니다. 이때 이름의 대소문자는 구분하지 않으며, 결과는 이름 순으로 오름차순 정렬합니다.',
    rules: [
      'ANIMAL_TYPE이 "Dog"인 강아지만 조회해야 함 (고양이 등 다른 동물은 제외)',
      '이름에 "el"이 들어가는지 판별할 때 대소문자를 구분하지 않음 (Elijah, Ella, Maxwell 2 모두 해당)',
      '결과는 이름(NAME) 기준 오름차순(ASC)으로 정렬',
    ],
    examples: [
      {
        input:
          'ANIMAL_INS = [["A382192","Dog","Maxwell 2"], ["A352898","Cat","Clementine"], ["A355753","Dog","Elijah"], ["A373219","Dog","Ella"]]',
        output: '[["A355753","Elijah"], ["A373219","Ella"], ["A382192","Maxwell 2"]]',
      },
    ],
  },
  keyIntuitions: [
    '부분 문자열이 포함되어 있는지 확인할 때는 LIKE "%el%"처럼 양쪽에 와일드카드(%)를 붙입니다.',
    'DBMS나 콜레이션(Collation)에 따라 LIKE가 대소문자를 구분할 수 있으므로 LOWER(NAME) LIKE "%el%" 또는 UPPER(NAME) LIKE "%EL%"로 통일하는 것이 안전합니다.',
    'WHERE 절에 ANIMAL_TYPE = "Dog" 조건을 함께 적어 강아지가 아닌 동물을 일찍 걸러낸 뒤 ORDER BY NAME ASC로 정렬합니다.',
  ],
  demo: {
    input: [ANIMALS],
    label: 'ANIMAL_INS 6마리 (Dog 중 el 포함 3마리, Dog 미포함 1마리, Cat 중 el 포함 2마리)',
  },
  workUnit: '처리한 동물 행 수',
  approaches: [
    {
      id: 'find-el-where-dog-lower-like',
      name: 'WHERE Dog + LOWER LIKE',
      rank: 'BEST',
      timeComplexity: 'O(N + K log K)',
      spaceComplexity: 'O(K)',
      verdict: "WHERE 절에서 ANIMAL_TYPE = 'Dog'와 LOWER(NAME) LIKE '%el%'을 함께 검사한 뒤 살아남은 K마리만 이름순 정렬하는 정석 풀이입니다.",
      pros: [
        '강아지가 아닌 행은 문자열 소문자 변환이나 패턴 매칭 없이 바로 건너뛸 수 있습니다.',
        'LOWER(NAME)을 사용해 대문자 "El"로 시작하는 이름(Elijah, Ella)까지 빠짐없이 찾습니다.',
      ],
      cons: ['앞쪽에 %가 붙은 LIKE "%el%" 패턴은 일반 B-Tree 인덱스를 타지 못해 강아지 행들은 스캔해야 합니다.'],
      whyThisRank: '조건 필터링과 대소문자 무시 패턴 검색을 한 번의 WHERE 절로 가장 깔끔하고 안전하게 처리합니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'find-el-subquery-all-animals',
      name: '전체 동물 문자열 검사 후 Dog 필터',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N + M + K log K)',
      spaceComplexity: 'O(M)',
      verdict: '인라인 뷰에서 모든 동물의 이름을 먼저 소문자 변환·부분 문자열 검사한 뒤 바깥에서 강아지만 추리는 풀이입니다.',
      pros: ['이름 조건과 동물 종류 조건을 단계별로 나누어 볼 수 있습니다.'],
      cons: ['고양이(Cat) 등 다른 동물 행에 대해서도 불필요한 LOWER·LIKE 연산과 중간 결과를 만듭니다.'],
      whyThisRank: '정답은 같지만 값싼 ANIMAL_TYPE = "Dog" 필터를 먼저 적용하지 않아 불필요한 문자열 연산이 늘어납니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'find-el-case-sensitive-trap',
      name: '대소문자 변환 누락 (소문자 el만 검색)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N + K log K)',
      spaceComplexity: 'O(K)',
      verdict: "LOWER(NAME) 없이 대소문자를 구분하여 소문자 'el'만 찾아서 'Elijah'나 'Ella'처럼 대문자 'El'로 시작하는 강아지를 놓치는 함정입니다.",
      pros: ['쿼리가 짧아 보여 무심코 작성하기 쉽습니다.'],
      cons: ['이름 맨 앞이 대문자인 "Elijah", "Ella" 같은 행이 결과에서 통째로 누락되어 오답이 됩니다.'],
      whyThisRank: '"대소문자를 구분하지 않는다"는 문제 조건을 코드에 명시(LOWER/UPPER)하지 않아 틀리는 대표적인 실수입니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [ANIMALS], expected: TRUTH },
      {
        args: [[['A1', 'Dog', 'Bell'], ['A2', 'Cat', 'Belly'], ['A3', 'Dog', 'ELMO']]],
        expected: [['A1', 'Bell'], ['A3', 'ELMO']],
      },
      {
        args: [[['B1', 'Dog', 'Max'], ['B2', 'Cat', 'Elena']]],
        expected: [],
      },
    ],
    random: (rand) => {
      const pool = ['Elijah', 'Ella', 'Maxwell 2', 'Bell', 'ELMO', 'Rogan', ' Coco', 'Melon', 'Rex', 'nelly'];
      const n = 4 + Math.floor(rand() * 5);
      const rows: AnimalRow[] = Array.from({ length: n }, (_, i) => [
        `A30000${i + 1}`,
        rand() < 0.65 ? 'Dog' : 'Cat',
        pool[Math.floor(rand() * pool.length)] + (i % 3 === 0 ? ` ${i}` : ''),
      ]);
      return [rows];
    },
  },
};

export default problem;
