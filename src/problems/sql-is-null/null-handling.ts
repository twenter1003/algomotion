// NULL 처리하기: 정석 COALESCE(NAME, 'No name') 단일 스캔, 대안 IS NOT NULL과 IS NULL 두 번 스캔해 UNION ALL, 함정 CASE WHEN NAME = NULL 비교(UNKNOWN이 되어 NULL 그대로 출력)를 같은 장면에서 움직인다.
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

type AnimalRow = [id: string, type: string, name: string | null, sex: string];

// 시각화 입력: 6마리 동물. A368930과 A434523은 이름이 NULL이다.
const ANIMALS: AnimalRow[] = [
  ['A350276', 'Cat', 'Jewel', 'Spayed Female'],
  ['A368930', 'Dog', null, 'Spayed Female'],
  ['A350375', 'Cat', 'Meo', 'Neutered Male'],
  ['A434523', 'Cat', null, 'Spayed Female'],
  ['A382192', 'Dog', 'Maxwell 2', 'Intact Male'],
  ['A390555', 'Dog', 'Lucy', 'Spayed Female'],
];
const R = ANIMALS.length;
const TRUTH = [
  ['Cat', 'Jewel', 'Spayed Female'],
  ['Cat', 'Meo', 'Neutered Male'],
  ['Dog', 'No name', 'Spayed Female'],
  ['Dog', 'Maxwell 2', 'Intact Male'],
  ['Dog', 'Lucy', 'Spayed Female'],
  ['Cat', 'No name', 'Spayed Female'],
];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  sql: `SELECT ANIMAL_TYPE,
       COALESCE(NAME, 'No name') AS NAME,
       SEX_UPON_INTAKE
FROM ANIMAL_INS
ORDER BY ANIMAL_ID ASC;`,
  python: `def solution(animals):
    # ORDER BY ANIMAL_ID ASC + COALESCE(NAME, 'No name')
    sorted_rows = sorted(animals, key=lambda r: r[0])
    return [
        [a_type, name if name is not None else 'No name', sex]
        for _, a_type, name, sex in sorted_rows
    ]`,
  javascript: `function solution(animals) {
  // ORDER BY ANIMAL_ID ASC + COALESCE(NAME, 'No name')
  return [...animals]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, type, name, sex]) => [type, name ?? 'No name', sex]);
}`,
};
const BEST_AT = {
  from: sqlLines(BEST_CODE, ['FROM ANIMAL_INS'], ['sorted_rows = sorted(animals, key=lambda r: r[0])'], ['return [...animals]']),
  coalesce: sqlLines(BEST_CODE, ["COALESCE(NAME, 'No name') AS NAME,"], ["[a_type, name if name is not None else 'No name', sex]"], [".map(([, type, name, sex]) => [type, name ?? 'No name', sex]);"]),
  order: sqlLines(BEST_CODE, ['ORDER BY ANIMAL_ID ASC;'], ['sorted_rows = sorted(animals, key=lambda r: r[0])'], ['.sort((a, b) => a[0].localeCompare(b[0]))']),
  select: sqlLines(BEST_CODE, ['SELECT ANIMAL_TYPE,', 'SEX_UPON_INTAKE'], ['return ['], ['.map(([, type, name, sex]) => [type, name ?? \'No name\', sex]);']),
};

const ALT_CODE = {
  sql: `SELECT ANIMAL_TYPE, NAME, SEX_UPON_INTAKE
FROM (
  SELECT ANIMAL_ID, ANIMAL_TYPE, NAME, SEX_UPON_INTAKE
  FROM ANIMAL_INS WHERE NAME IS NOT NULL
  UNION ALL
  SELECT ANIMAL_ID, ANIMAL_TYPE, 'No name' AS NAME, SEX_UPON_INTAKE
  FROM ANIMAL_INS WHERE NAME IS NULL
) U
ORDER BY ANIMAL_ID ASC;`,
  python: `def solution(animals):
    # 1차 스캔: NAME IS NOT NULL / 2차 스캔: NAME IS NULL → 'No name'
    named = [[a_id, t, name, sex] for a_id, t, name, sex in animals if name is not None]
    unnamed = [[a_id, t, 'No name', sex] for a_id, t, name, sex in animals if name is None]
    merged = sorted(named + unnamed, key=lambda r: r[0])
    return [[t, name, sex] for _, t, name, sex in merged]`,
  javascript: `function solution(animals) {
  // 1차 스캔: NAME IS NOT NULL / 2차 스캔: NAME IS NULL → 'No name'
  const named = animals
    .filter(([, , name]) => name !== null)
    .map(([id, type, name, sex]) => [id, type, name, sex]);
  const unnamed = animals
    .filter(([, , name]) => name === null)
    .map(([id, type, , sex]) => [id, type, 'No name', sex]);
  return [...named, ...unnamed]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, type, name, sex]) => [type, name, sex]);
}`,
};
const ALT_AT = {
  notNull: sqlLines(ALT_CODE, ['SELECT ANIMAL_ID, ANIMAL_TYPE, NAME, SEX_UPON_INTAKE', 'FROM ANIMAL_INS WHERE NAME IS NOT NULL'], ['named = [[a_id, t, name, sex] for a_id, t, name, sex in animals if name is not None]'], ['.filter(([, , name]) => name !== null)']),
  isNull: sqlLines(ALT_CODE, ['UNION ALL', "SELECT ANIMAL_ID, ANIMAL_TYPE, 'No name' AS NAME, SEX_UPON_INTAKE", 'FROM ANIMAL_INS WHERE NAME IS NULL'], ["unnamed = [[a_id, t, 'No name', sex] for a_id, t, name, sex in animals if name is None]"], ['.filter(([, , name]) => name === null)', ".map(([id, type, , sex]) => [id, type, 'No name', sex]);"]),
  order: sqlLines(ALT_CODE, ['SELECT ANIMAL_TYPE, NAME, SEX_UPON_INTAKE', 'ORDER BY ANIMAL_ID ASC;'], ['merged = sorted(named + unnamed, key=lambda r: r[0])', 'return [[t, name, sex] for _, t, name, sex in merged]'], ['.sort((a, b) => a[0].localeCompare(b[0]))', '.map(([, type, name, sex]) => [type, name, sex]);']),
};

const TRAP_CODE = {
  sql: `-- 함정: IS NULL 대신 = NULL로 비교 (SQL에서 = NULL은 늘 UNKNOWN)
SELECT ANIMAL_TYPE,
       CASE WHEN NAME = NULL THEN 'No name' ELSE NAME END AS NAME,
       SEX_UPON_INTAKE
FROM ANIMAL_INS
ORDER BY ANIMAL_ID ASC;`,
  python: `def solution(animals):
    # 함정: SQL의 'NAME = NULL'은 항상 UNKNOWN(거짓)이라 ELSE NAME(None)으로 빠짐
    sql_eq_null = lambda _v: False
    sorted_rows = sorted(animals, key=lambda r: r[0])
    return [
        [a_type, 'No name' if sql_eq_null(name) else name, sex]
        for _, a_type, name, sex in sorted_rows
    ]`,
  javascript: `function solution(animals) {
  // 함정: SQL의 'NAME = NULL'은 항상 UNKNOWN(거짓)이라 ELSE NAME(null)으로 빠집니다
  const sqlEqNull = () => false;
  return [...animals]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, type, name, sex]) => [type, sqlEqNull(name) ? 'No name' : name, sex]);
}`,
};
const TRAP_AT = {
  from: sqlLines(TRAP_CODE, ['FROM ANIMAL_INS'], ['sorted_rows = sorted(animals, key=lambda r: r[0])'], ['return [...animals]']),
  caseEq: sqlLines(TRAP_CODE, ["CASE WHEN NAME = NULL THEN 'No name' ELSE NAME END AS NAME,"], ["sql_eq_null = lambda _v: False", "[a_type, 'No name' if sql_eq_null(name) else name, sex]"], ['const sqlEqNull = () => false;', ".map(([, type, name, sex]) => [type, sqlEqNull(name) ? 'No name' : name, sex]);"]),
  done: sqlLines(TRAP_CODE, ['ORDER BY ANIMAL_ID ASC;'], ['return ['], ['.sort((a, b) => a[0].localeCompare(b[0]))']),
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
const ROW_W = 292;
const OUT_X = 324;
const OUT_W = 262;

const rowRect = (r: number): Rect => ({ x: ROW_X, y: ROW_Y + r * ROW_PITCH, w: ROW_W, h: ROW_H });
const outRect = (slot: number): Rect => ({ x: OUT_X, y: ROW_Y + slot * ROW_PITCH, w: OUT_W, h: ROW_H });
const rowId = (r: number) => `row:${r}`;
const outId = (slot: number) => `out:${slot}`;
const rowText = ([id, type, name, sex]: AnimalRow) => `${id} · ${type} · ${name ?? 'NULL'} · ${sex.split(' ')[0]}`;
const outText = ([id, type, name, sex]: [string, string, string | null, string]) =>
  `${id} · ${type} · ${name ?? 'NULL'} · ${sex.split(' ')[0]}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:in', kind: 'text', rect: { x: ROW_X, y: 10, w: ROW_W, h: 22 }, tone: 'muted', text: 'ANIMAL_INS 테이블 (6행)' },
    { id: 'hdr:out', kind: 'text', rect: { x: OUT_X, y: 10, w: OUT_W, h: 22 }, tone: 'chosen', text: 'SELECT 결과 행' },
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
/* 정석: COALESCE(NAME, 'No name')으로 한 번에 치환 후 정렬              */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  let replaced = 0;
  const converted: [string, string, string, string][] = [];
  const meta = (clause: string, animal = '-') => ({
    work,
    variables: { 절: clause, 동물: animal, 치환수: replaced },
  });

  rec.step({ title: 'FROM ANIMAL_INS: 6개 동물 행 스캔 시작', codeHighlights: BEST_AT.from, ...meta('FROM') });
  rec.phase('테이블 읽기', "FROM 절이 ANIMAL_INS 테이블의 6개 행을 한 번만 읽으며 COALESCE(NAME, 'No name')을 적용합니다.", BEST_AT.from);
  rec.do({ type: 'set', id: 'status', patch: { text: "FROM ANIMAL_INS → COALESCE(NAME, 'No name') 치환 시작", tone: 'chosen' }, pop: true }, wait(200));

  ANIMALS.forEach((a, r) => {
    const [id, type, name, sex] = a;
    const isNull = name === null;
    const finalName = name ?? 'No name';
    work += 1;
    if (isNull) replaced += 1;
    const rowOut: [string, string, string, string] = [id, type, finalName, sex];
    converted.push(rowOut);

    rec.step({
      title: `COALESCE(${id}): ${name ?? 'NULL'} → '${finalName}'`,
      codeHighlights: BEST_AT.coalesce,
      ...meta('COALESCE', id),
    });
    rec.phase(
      'NULL 치환',
      isNull
        ? `${id}(${type})의 NAME이 NULL이므로 두 번째 인자인 'No name'으로 즉시 바꿉니다.`
        : `${id}(${type})의 NAME은 '${name}'이 있으므로 원래 이름을 그대로 씁니다.`,
      BEST_AT.coalesce,
    );
    rec.do(
      ...together([
        { type: 'focus', ids: [rowId(r)] },
        paint(rowId(r), isNull ? 'current' : 'visited'),
        { type: 'add', item: { id: outId(r), kind: 'token', rect: outRect(r), tone: isNull ? 'good' : 'chosen', text: outText(rowOut) }, from: rowId(r) },
      ]),
      wait(170),
      { type: 'unfocus' },
    );
  });

  const sorted = [...converted].sort((a, b) => a[0].localeCompare(b[0]));
  work += sorted.length;
  rec.step({
    title: 'ORDER BY ANIMAL_ID ASC: 동물 ID 오름차순 정렬',
    codeHighlights: BEST_AT.order,
    ...meta('ORDER BY', 'A350276..A434523'),
  });
  rec.phase('ID 오름차순 정렬', '치환이 끝난 6개 행을 ANIMAL_ID 오름차순(A350276 → A350375 → A368930 → …)으로 정렬합니다.', BEST_AT.order);
  rec.do(
    ...together([
      ...sorted.map((rowOut, slot): Action => ({
        type: 'set',
        id: outId(slot),
        patch: { text: outText(rowOut), tone: rowOut[2] === 'No name' ? 'good' : 'chosen' },
        pop: true,
      })),
      { type: 'set', id: 'status', patch: { text: 'ORDER BY ANIMAL_ID ASC 정렬 완료', tone: 'chosen' }, pop: true },
    ]),
    wait(200),
  );

  rec.step({
    title: `SELECT 완료: ${josa(TRUTH.length, '건', '건')} 출력 (NULL ${replaced}건 'No name' 치환)`,
    codeHighlights: BEST_AT.select,
    ...meta('SELECT', '완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('마무리', `테이블을 한 번만 스캔해 NULL 이름 2건을 'No name'으로 바꾸고 정렬하여 정답 6건을 완성했습니다.`, BEST_AT.select);
  rec.do(
    ...together([
      ...sorted.map((_, slot): Action => paint(outId(slot), 'path')),
      { type: 'set', id: 'status', patch: { text: `정답 6건 출력 완료 (NULL 2건 → 'No name', 행 처리 ${work}회)`, tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: IS NOT NULL 스캔 + IS NULL 스캔 후 UNION ALL                  */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  let slot = 0;
  const collected: [string, string, string, string][] = [];
  const meta = (clause: string, count = collected.length) => ({
    work,
    variables: { 절: clause, 누적행수: count },
  });

  work += R;
  const named = ANIMALS.filter(([, , name]) => name !== null).map(([id, t, name, sex]): [string, string, string, string] => [id, t, name!, sex]);
  rec.step({
    title: `1차 스캔 (WHERE NAME IS NOT NULL): 이름 있는 ${named.length}행 추출`,
    codeHighlights: ALT_AT.notNull,
    ...meta('1차 스캔', named.length),
  });
  rec.phase('1차 테이블 스캔', `먼저 ANIMAL_INS 전체 ${R}행을 훑어 이름이 NULL이 아닌 ${named.length}마리를 결과 목록에 담습니다.`, ALT_AT.notNull);
  const pass1Acts: Action[] = [];
  ANIMALS.forEach((a, r) => {
    if (a[2] !== null) {
      const rowOut: [string, string, string, string] = [a[0], a[1], a[2], a[3]];
      collected.push(rowOut);
      const curSlot = slot++;
      pass1Acts.push(paint(rowId(r), 'visited'));
      pass1Acts.push({ type: 'add', item: { id: outId(curSlot), kind: 'token', rect: outRect(curSlot), tone: 'chosen', text: outText(rowOut) }, from: rowId(r) });
    } else {
      pass1Acts.push(paint(rowId(r), 'muted'));
    }
  });
  pass1Acts.push({ type: 'set', id: 'status', patch: { text: `1차 스캔 완료: NAME IS NOT NULL ${named.length}건 (스캔 ${work}회)`, tone: 'chosen' }, pop: true });
  rec.do(...together(pass1Acts), wait(220));

  work += R;
  const unnamed = ANIMALS.filter(([, , name]) => name === null).map(([id, t, , sex]): [string, string, string, string] => [id, t, 'No name', sex]);
  rec.step({
    title: `2차 스캔 (WHERE NAME IS NULL) + UNION ALL: ${unnamed.length}행에 'No name' 부여`,
    codeHighlights: ALT_AT.isNull,
    ...meta('2차 스캔 + UNION ALL', named.length + unnamed.length),
  });
  rec.phase('2차 테이블 스캔', `테이블 ${R}행을 처음부터 한 번 더 훑어 NAME IS NULL인 ${unnamed.length}마리에 'No name'을 붙여 이어 붙입니다.`, ALT_AT.isNull);
  const pass2Acts: Action[] = [];
  ANIMALS.forEach((a, r) => {
    if (a[2] === null) {
      const rowOut: [string, string, string, string] = [a[0], a[1], 'No name', a[3]];
      collected.push(rowOut);
      const curSlot = slot++;
      pass2Acts.push(paint(rowId(r), 'good'));
      pass2Acts.push({ type: 'add', item: { id: outId(curSlot), kind: 'token', rect: outRect(curSlot), tone: 'good', text: outText(rowOut) }, from: rowId(r) });
    }
  });
  pass2Acts.push({ type: 'set', id: 'status', patch: { text: `2차 스캔 완료: 테이블 2번 스캔으로 누적 ${work}회`, tone: 'chosen' }, pop: true });
  rec.do(...together(pass2Acts), wait(220));

  const sorted = [...collected].sort((a, b) => a[0].localeCompare(b[0]));
  work += sorted.length;
  rec.step({
    title: `ORDER BY ANIMAL_ID ASC 완료: 정답 동일, 행 처리 ${work}회`,
    codeHighlights: ALT_AT.order,
    ...meta('ORDER BY', sorted.length),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('정렬 및 마무리', `결과는 같지만 COALESCE 한 번(12회)으로 끝날 일을 두 번 풀 스캔해 총 ${work}번 행을 다뤘습니다.`, ALT_AT.order);
  rec.do(
    ...together([
      ...sorted.map((rowOut, idx): Action => ({
        type: 'set',
        id: outId(idx),
        patch: { text: outText(rowOut), tone: 'path' },
        pop: true,
      })),
      { type: 'set', id: 'status', patch: { text: `정답 6건 동일 (UNION ALL 두 번 스캔으로 행 처리 ${work}회)`, tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: CASE WHEN NAME = NULL 비교로 NULL이 바뀌지 않음                 */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const kept: [string, string, string | null, string][] = [];
  const meta = (clause: string, animal = '-') => ({
    work,
    variables: { 절: clause, 동물: animal, 조건결과: 'UNKNOWN' },
  });

  rec.step({ title: '함정 쿼리: IS NULL 대신 CASE WHEN NAME = NULL 사용', codeHighlights: TRAP_AT.from, ...meta('FROM') });
  rec.phase('함정 시작', 'SQL의 3값 논리(TRUE / FALSE / UNKNOWN)에서 어떤 값을 = NULL로 비교하면 결과는 늘 UNKNOWN이 됩니다.', TRAP_AT.from);
  rec.do({ type: 'set', id: 'status', patch: { text: 'CASE WHEN NAME = NULL 평가 시작 (주의: = NULL은 늘 UNKNOWN)', tone: 'bad' }, pop: true }, wait(200));

  ANIMALS.forEach((a, r) => {
    const [id, type, name, sex] = a;
    const isNull = name === null;
    work += 1;
    const rowOut: [string, string, string | null, string] = [id, type, name, sex];
    kept.push(rowOut);

    rec.step({
      title: `NAME = NULL 검사(${id}): ${isNull ? 'NULL = NULL도 UNKNOWN → NULL 그대로 남음!' : `'${name}' 유지`}`,
      codeHighlights: TRAP_AT.caseEq,
      ...meta('CASE WHEN', id),
    });
    rec.phase(
      '잘못된 비교',
      isNull
        ? `${id}의 NAME은 NULL이지만, SQL에서 NULL = NULL은 TRUE가 아니라 UNKNOWN이므로 THEN 'No name'으로 가지 못하고 ELSE NAME(NULL)이 반환됩니다!`
        : `${id}의 NAME('${name}')도 = NULL 결과가 UNKNOWN이라 ELSE 절을 타서 '${name}'이 됩니다.`,
      TRAP_AT.caseEq,
    );
    rec.do(
      ...together([
        paint(rowId(r), isNull ? 'bad' : 'visited'),
        { type: 'add', item: { id: outId(r), kind: 'token', rect: outRect(r), tone: isNull ? 'bad' : 'chosen', text: outText(rowOut) }, from: rowId(r) },
      ]),
      wait(170),
    );
  });

  const sorted = [...kept].sort((a, b) => a[0].localeCompare(b[0]));
  const wrongAns = sorted.map(([, type, name, sex]) => [type, name, sex]);
  work += sorted.length;

  rec.step({
    title: "오답: NULL 이름이 'No name'으로 바뀌지 않고 null로 출력됨",
    codeHighlights: TRAP_AT.done,
    ...meta('ORDER BY', '오답'),
    answer: wrongAns,
    isKeyframe: true,
  });
  rec.phase('오답 확인', "A368930과 A434523의 이름이 'No name' 대신 NULL 그대로 남았습니다. 반드시 COALESCE(NAME, 'No name')이나 WHEN NAME IS NULL을 써야 합니다.", TRAP_AT.done);
  rec.do(
    ...together([
      ...sorted.map((rowOut, idx): Action => ({
        type: 'set',
        id: outId(idx),
        patch: { text: outText(rowOut), tone: rowOut[2] === null ? 'bad' : 'muted' },
        pop: true,
      })),
      { type: 'set', id: 'status', patch: { text: "오답: NULL이 'No name'으로 치환되지 않음 (= NULL 비교 함정)", tone: 'bad' }, pop: true },
    ]),
  );
  return rec.finish();
}

const problem: Problem = {
  id: 'null-handling',
  title: 'NULL 처리하기',
  level: 2,
  category: 'sql-is-null',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/59410',
  description: {
    summary:
      "ANIMAL_INS 테이블에 등록된 모든 동물의 생물 종(ANIMAL_TYPE), 이름(NAME), 성별 및 중성화 여부(SEX_UPON_INTAKE)를 ANIMAL_ID 오름차순으로 조회합니다. 이때 이름이 없는 동물의 이름은 'No name'으로 표시합니다.",
    rules: [
      '결과는 ANIMAL_ID 오름차순으로 정렬하여 출력함',
      "이름(NAME)이 NULL인 경우 'No name'으로 대체하여 출력함",
      '출력 컬럼 순서는 ANIMAL_TYPE, NAME, SEX_UPON_INTAKE 순임',
    ],
    examples: [
      {
        input: 'ANIMAL_INS = [["A350276","Cat","Jewel","Spayed Female"], ["A368930","Dog",null,"Spayed Female"]]',
        output: '[["Cat","Jewel","Spayed Female"], ["Dog","No name","Spayed Female"]]',
      },
    ],
  },
  keyIntuitions: [
    "COALESCE(NAME, 'No name')은 왼쪽부터 차례로 보며 NULL이 아닌 첫 번째 값을 돌려줍니다(MySQL에서는 IFNULL(NAME, 'No name')도 동일하게 동작합니다).",
    'CASE 식을 쓸 때는 반드시 CASE WHEN NAME IS NULL THEN ...처럼 IS NULL로 검사해야 합니다.',
    'SQL의 3값 논리에서 NULL = NULL의 결과는 TRUE가 아니라 UNKNOWN이므로, 등호(=)로는 NULL을 절대 잡아낼 수 없습니다.',
  ],
  demo: {
    input: [ANIMALS],
    label: 'ANIMAL_INS 6마리 (이름 있는 동물 4마리, 이름이 NULL인 동물 2마리)',
  },
  workUnit: '처리한 테이블 행 수',
  approaches: [
    {
      id: 'null-handling-coalesce',
      name: 'COALESCE / IFNULL',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: "SELECT 절에서 COALESCE(NAME, 'No name')으로 NULL만 즉시 기본값으로 바꾸고 ANIMAL_ID 순으로 정렬하는 정석 풀이입니다.",
      pros: [
        '테이블을 단 한 번만 스캔하면서 NULL 치환과 컬럼 선택을 동시에 끝냅니다.',
        '표준 SQL 함수인 COALESCE를 사용해 어떤 DBMS에서도 동일하게 동작합니다.',
      ],
      cons: ["대소문자와 띄어쓰기('No name')를 문제 조건과 정확히 맞춰 적어야 합니다."],
      whyThisRank: 'SELECT 절 스칼라 함수 하나로 가장 간결하고 빠르게 NULL 기본값 치환을 처리합니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'null-handling-union-all',
      name: 'IS NOT NULL / IS NULL 분리 후 UNION ALL',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: "이름이 있는 행과 이름이 NULL인 행을 두 번 조회해 UNION ALL로 합친 뒤 정렬하는 풀이입니다.",
      pros: ['WHERE 조건에서 IS NOT NULL과 IS NULL이 어떻게 행을 나누는지 직관적으로 볼 수 있습니다.'],
      cons: ['같은 테이블을 두 번 풀 스캔해야 하므로 불필요한 I/O 비용이 두 배로 듭니다.'],
      whyThisRank: '결과는 같지만 한 번 스캔으로 충분한 작업을 두 개의 쿼리로 쪼개어 실행합니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'null-handling-eq-null-trap',
      name: 'CASE WHEN NAME = NULL 등호 비교',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: "IS NULL 대신 = NULL로 비교해 조건이 항상 UNKNOWN이 되어 NULL 이름이 'No name'으로 바뀌지 않는 함정입니다.",
      pros: ['일반 프로그래밍 언어의 == null 습관대로 작성하기 쉽습니다.'],
      cons: ["SQL에서 = NULL은 늘 UNKNOWN이므로 모든 행이 ELSE NAME으로 빠져 NULL이 그대로 출력됩니다."],
      whyThisRank: 'SQL에서 NULL을 다룰 때 가장 빈번하게 틀리는 등호(=) 비교 실수입니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [ANIMALS], expected: TRUTH },
      {
        args: [[['A100', 'Dog', null, 'Intact Male'], ['A050', 'Cat', 'Nabi', 'Spayed Female']]],
        expected: [['Cat', 'Nabi', 'Spayed Female'], ['Dog', 'No name', 'Intact Male']],
      },
      {
        args: [[['A001', 'Cat', null, 'Neutered Male']]],
        expected: [['Cat', 'No name', 'Neutered Male']],
      },
    ],
    random: (rand) => {
      const types = ['Cat', 'Dog'];
      const sexes = ['Spayed Female', 'Neutered Male', 'Intact Male', 'Intact Female'];
      const n = 3 + Math.floor(rand() * 5);
      const rows: AnimalRow[] = Array.from({ length: n }, (_, i) => {
        const id = `A3${Math.floor(rand() * 9)}${1000 + i}`;
        const type = types[Math.floor(rand() * types.length)];
        const name = rand() < 0.45 ? null : `Pet${i + 1}`;
        const sex = sexes[Math.floor(rand() * sexes.length)];
        return [id, type, name, sex];
      });
      return [rows];
    },
  },
};

export default problem;
