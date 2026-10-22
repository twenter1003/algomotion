// 없어진 기록 찾기: 정석 ANIMAL_OUTS LEFT JOIN ANIMAL_INS + I.ANIMAL_ID IS NULL, 대안 중첩 루프 전체 대조, 함정 테이블 순서를 뒤집어 ANIMAL_INS LEFT JOIN ANIMAL_OUTS로 작성(미입양 동물을 뽑는 오답)을 같은 장면에서 움직인다.
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

type AnimalRow = [animalId: string, name: string];

// 보호 시작 기록(INS 4건)과 입양 보낸 기록(OUTS 6건).
// OUTS에는 있지만 INS에 없는 동물은 A349(Bambi), A351(Coco), A355(Allie) 3마리다.
// 반대로 INS에만 있는 A354(Romy)는 아직 입양을 가지 않은 동물로, 테이블 순서를 뒤집는 함정에 걸린다.
const INS: AnimalRow[] = [
  ['A350', 'Sugar'],
  ['A352', 'Jewel'],
  ['A354', 'Romy'],
  ['A358', 'Nabi'],
];
const OUTS: AnimalRow[] = [
  ['A355', 'Allie'],
  ['A350', 'Sugar'],
  ['A349', 'Bambi'],
  ['A352', 'Jewel'],
  ['A358', 'Nabi'],
  ['A351', 'Coco'],
];
const TRUTH: AnimalRow[] = [
  ['A349', 'Bambi'],
  ['A351', 'Coco'],
  ['A355', 'Allie'],
];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  sql: `SELECT O.ANIMAL_ID, O.NAME
FROM ANIMAL_OUTS O
LEFT JOIN ANIMAL_INS I
  ON O.ANIMAL_ID = I.ANIMAL_ID
WHERE I.ANIMAL_ID IS NULL
ORDER BY O.ANIMAL_ID ASC;`,
  python: `def solution(ins, outs):
    # ANIMAL_INS의 ANIMAL_ID 집합(인덱스) 준비
    in_ids = {animal_id for animal_id, _ in ins}
    # ANIMAL_OUTS LEFT JOIN ANIMAL_INS + WHERE I.ANIMAL_ID IS NULL
    missing = [
        [animal_id, name]
        for animal_id, name in outs
        if animal_id not in in_ids
    ]
    # ORDER BY O.ANIMAL_ID ASC
    missing.sort(key=lambda r: r[0])
    return missing`,
  javascript: `function solution(ins, outs) {
  // ANIMAL_INS의 ANIMAL_ID 집합(인덱스) 준비
  const inIds = new Set(ins.map(([id]) => id));
  // ANIMAL_OUTS LEFT JOIN ANIMAL_INS + WHERE I.ANIMAL_ID IS NULL
  const missing = outs
    .filter(([id]) => !inIds.has(id))
    .map(([id, name]) => [id, name]);
  // ORDER BY O.ANIMAL_ID ASC
  return missing.sort((a, b) => a[0].localeCompare(b[0]));
}`,
};
const BEST_AT = {
  index: sqlLines(BEST_CODE, ['FROM ANIMAL_OUTS O', 'LEFT JOIN ANIMAL_INS I'], ['in_ids = {animal_id for animal_id, _ in ins}'], ['const inIds = new Set(ins.map(([id]) => id));']),
  joinWhere: sqlLines(BEST_CODE, ['LEFT JOIN ANIMAL_INS I', 'ON O.ANIMAL_ID = I.ANIMAL_ID', 'WHERE I.ANIMAL_ID IS NULL'], ['for animal_id, name in outs', 'if animal_id not in in_ids'], ['.filter(([id]) => !inIds.has(id))']),
  order: sqlLines(BEST_CODE, ['ORDER BY O.ANIMAL_ID ASC;'], ['missing.sort(key=lambda r: r[0])'], ['return missing.sort((a, b) => a[0].localeCompare(b[0]));']),
  select: sqlLines(BEST_CODE, ['SELECT O.ANIMAL_ID, O.NAME'], ['return missing'], ['return missing.sort((a, b) => a[0].localeCompare(b[0]));']),
};

const ALT_CODE = {
  sql: `SELECT O.ANIMAL_ID, O.NAME
FROM ANIMAL_OUTS O
WHERE NOT EXISTS (
  SELECT 1
  FROM ANIMAL_INS I
  WHERE I.ANIMAL_ID = O.ANIMAL_ID
)
ORDER BY O.ANIMAL_ID ASC;`,
  python: `def solution(ins, outs):
    # ANIMAL_OUTS 각 행마다 ANIMAL_INS 전체를 처음부터 끝까지 훑어 대조
    missing = []
    for out_id, name in outs:
        found = False
        for in_id, _ in ins:
            if out_id == in_id:
                found = True
        if not found:
            missing.append([out_id, name])
    missing.sort(key=lambda r: r[0])
    return missing`,
  javascript: `function solution(ins, outs) {
  // ANIMAL_OUTS 각 행마다 ANIMAL_INS 전체를 처음부터 끝까지 훑어 대조합니다
  const missing = [];
  for (const [outId, name] of outs) {
    let found = false;
    for (const [inId] of ins) {
      if (outId === inId) found = true;
    }
    if (!found) missing.push([outId, name]);
  }
  return missing.sort((a, b) => a[0].localeCompare(b[0]));
}`,
};
const ALT_AT = {
  scan: sqlLines(ALT_CODE, ['FROM ANIMAL_OUTS O', 'WHERE NOT EXISTS (', 'FROM ANIMAL_INS I', 'WHERE I.ANIMAL_ID = O.ANIMAL_ID'], ['for out_id, name in outs:', 'for in_id, _ in ins:', 'if not found:'], ['for (const [outId, name] of outs)', 'for (const [inId] of ins)', 'if (!found) missing.push([outId, name]);']),
  done: sqlLines(ALT_CODE, ['SELECT O.ANIMAL_ID, O.NAME', 'ORDER BY O.ANIMAL_ID ASC;'], ['missing.sort(key=lambda r: r[0])', 'return missing'], ['return missing.sort((a, b) => a[0].localeCompare(b[0]));']),
};

const TRAP_CODE = {
  sql: `-- 함정: 테이블 순서를 반대로 써서 ANIMAL_INS를 왼쪽에 둠
SELECT I.ANIMAL_ID, I.NAME
FROM ANIMAL_INS I
LEFT JOIN ANIMAL_OUTS O
  ON I.ANIMAL_ID = O.ANIMAL_ID
WHERE O.ANIMAL_ID IS NULL
ORDER BY I.ANIMAL_ID ASC;`,
  python: `def solution(ins, outs):
    # 함정: ANIMAL_INS를 기준으로 잡고 ANIMAL_OUTS에 없는(미입양) 동물을 찾음
    out_ids = {animal_id for animal_id, _ in outs}
    wrong = [
        [animal_id, name]
        for animal_id, name in ins
        if animal_id not in out_ids
    ]
    wrong.sort(key=lambda r: r[0])
    return wrong`,
  javascript: `function solution(ins, outs) {
  // 함정: ANIMAL_INS를 기준으로 잡고 ANIMAL_OUTS에 없는(미입양) 동물을 찾습니다
  const outIds = new Set(outs.map(([id]) => id));
  const wrong = ins
    .filter(([id]) => !outIds.has(id))
    .map(([id, name]) => [id, name]);
  return wrong.sort((a, b) => a[0].localeCompare(b[0]));
}`,
};
const TRAP_AT = {
  join: sqlLines(TRAP_CODE, ['FROM ANIMAL_INS I', 'LEFT JOIN ANIMAL_OUTS O', 'WHERE O.ANIMAL_ID IS NULL'], ['for animal_id, name in ins', 'if animal_id not in out_ids'], ['const wrong = ins', '.filter(([id]) => !outIds.has(id))']),
  done: sqlLines(TRAP_CODE, ['SELECT I.ANIMAL_ID, I.NAME', 'ORDER BY I.ANIMAL_ID ASC;'], ['wrong.sort(key=lambda r: r[0])', 'return wrong'], ['return wrong.sort((a, b) => a[0].localeCompare(b[0]));']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 600;
const H = 360;
const OUT_X = 12;
const INS_X = 204;
const RES_X = 396;
const COL_Y = 36;
const ROW_H = 32;
const ROW_PITCH = 38;
const OUT_W = 180;
const INS_W = 180;
const RES_W = 192;

const outsRect = (r: number): Rect => ({ x: OUT_X, y: COL_Y + r * ROW_PITCH, w: OUT_W, h: ROW_H });
const insRect = (r: number): Rect => ({ x: INS_X, y: COL_Y + r * ROW_PITCH, w: INS_W, h: ROW_H });
const resRect = (slot: number): Rect => ({ x: RES_X, y: COL_Y + slot * 42, w: RES_W, h: 34 });
const outsId = (r: number) => `outs:${r}`;
const insId = (r: number) => `ins:${r}`;
const resId = (slot: number) => `res:${slot}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:outs', kind: 'text', rect: { x: OUT_X, y: 8, w: OUT_W, h: 22 }, tone: 'chosen', text: 'ANIMAL_OUTS (입양 6건)' },
    { id: 'hdr:ins', kind: 'text', rect: { x: INS_X, y: 8, w: INS_W, h: 22 }, tone: 'muted', text: 'ANIMAL_INS (보호 4건)' },
    { id: 'hdr:res', kind: 'text', rect: { x: RES_X, y: 8, w: RES_W, h: 22 }, tone: 'chosen', text: '유실된 기록 (IS NULL)' },
    { id: 'status', kind: 'token', rect: { x: OUT_X, y: 314, w: 576, h: 32 }, tone: 'plain', text: 'LEFT JOIN 대기' },
  ];
  OUTS.forEach(([id, name], r) => {
    items.push({ id: outsId(r), kind: 'token', rect: outsRect(r), tone: 'plain', text: `${id} · ${name}` });
  });
  INS.forEach(([id, name], r) => {
    items.push({ id: insId(r), kind: 'token', rect: insRect(r), tone: 'plain', text: `${id} · ${name}` });
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석: ANIMAL_OUTS LEFT JOIN ANIMAL_INS + WHERE I.ANIMAL_ID IS NULL */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const inIndex = new Map<string, number>(INS.map(([id], idx) => [id, idx]));
  const kept: AnimalRow[] = [];
  const meta = (clause: string, target = '-') => ({
    work,
    variables: { 절: clause, 대상동물: target, 유실기록수: kept.length },
  });

  work += INS.length;
  rec.step({ title: 'LEFT JOIN 준비: ANIMAL_OUTS를 왼쪽 기준, ANIMAL_INS 키 색인 생성', codeHighlights: BEST_AT.index, ...meta('LEFT JOIN 준비') });
  rec.phase('기준 테이블 설정', '입양 기록(ANIMAL_OUTS)은 있는데 보호 시작 기록(ANIMAL_INS)이 없는 동물을 찾아야 하므로 ANIMAL_OUTS를 LEFT JOIN의 왼쪽에 둡니다.', BEST_AT.index);
  rec.do(
    ...together([
      ...INS.map((_, i) => paint(insId(i), 'visited')),
      { type: 'set', id: 'status', patch: { text: 'ANIMAL_OUTS O LEFT JOIN ANIMAL_INS I ON O.ANIMAL_ID = I.ANIMAL_ID', tone: 'chosen' }, pop: true },
    ]),
    wait(180),
  );

  OUTS.forEach(([id, name], r) => {
    const matchIdx = inIndex.get(id);
    const isMissing = matchIdx === undefined;
    work += 1;
    if (isMissing) kept.push([id, name]);

    rec.step({
      title: `O.${id}(${name}) 조인 → I.ANIMAL_ID = ${isMissing ? 'NULL (유실 기록!)' : id}`,
      codeHighlights: BEST_AT.joinWhere,
      ...meta('LEFT JOIN + WHERE', `${id}(${name})`),
    });
    rec.phase(
      'LEFT JOIN & IS NULL 검사',
      isMissing
        ? `입양 간 ${id}(${name})는 ANIMAL_INS에 짝이 없어 I.ANIMAL_ID가 NULL이 됩니다. 유실된 기록이므로 선택합니다!`
        : `입양 간 ${id}(${name})는 ANIMAL_INS #${matchIdx + 1} 행과 매칭되어 I.ANIMAL_ID가 NULL이 아니므로 제외합니다.`,
      BEST_AT.joinWhere,
    );

    if (isMissing) {
      const slot = kept.length - 1;
      rec.do(
        ...together([
          { type: 'focus', ids: [outsId(r)] },
          paint(outsId(r), 'good'),
          { type: 'add', item: { id: resId(slot), kind: 'token', rect: resRect(slot), tone: 'chosen', text: `${id} · ${name} (I=NULL)` }, from: outsId(r) },
        ]),
        wait(180),
        { type: 'unfocus' },
      );
    } else {
      rec.do(
        ...together([
          { type: 'focus', ids: [outsId(r), insId(matchIdx)] },
          paint(outsId(r), 'muted'),
          paint(insId(matchIdx), 'explored'),
        ]),
        wait(160),
        { type: 'unfocus' },
      );
    }
  });

  work += kept.length;
  rec.step({
    title: `ORDER BY O.ANIMAL_ID ASC: 유실 기록 ${kept.length}건을 ID 오름차순 정렬`,
    codeHighlights: BEST_AT.order,
    ...meta('ORDER BY', 'A349, A351, A355'),
  });
  rec.phase('ID 오름차순 정렬', '추려낸 3건(A355, A349, A351)을 ANIMAL_ID 오름차순(A349 → A351 → A355)으로 정렬합니다.', BEST_AT.order);
  rec.do(
    ...together([
      ...TRUTH.map(([id, name], slot): Action => ({
        type: 'set',
        id: resId(slot),
        patch: { text: `${id} · ${name}`, tone: 'current' },
        pop: true,
      })),
      { type: 'set', id: 'status', patch: { text: 'ORDER BY O.ANIMAL_ID ASC → A349, A351, A355', tone: 'chosen' }, pop: true },
    ]),
    wait(180),
  );

  rec.step({
    title: `SELECT 완료: 유실 기록 ${TRUTH.length}건 출력 (연산 ${work}회)`,
    codeHighlights: BEST_AT.select,
    ...meta('SELECT', '완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('마무리', `LEFT JOIN과 WHERE I.ANIMAL_ID IS NULL로 보호 기록이 유실된 3마리를 총 ${work}번의 연산으로 찾았습니다.`, BEST_AT.select);
  rec.do(
    ...together([
      ...TRUTH.map((_, slot) => paint(resId(slot), 'path')),
      { type: 'set', id: 'status', patch: { text: '정답: [[A349, Bambi], [A351, Coco], [A355, Allie]]', tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 매 행마다 ANIMAL_INS 전체를 처음부터 끝까지 대조               */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const kept: AnimalRow[] = [];
  const meta = (stepDesc: string) => ({
    work,
    variables: { 방식: '중첩 루프 대조', 단계: stepDesc, 유실기록수: kept.length },
  });

  OUTS.forEach(([id, name], r) => {
    work += INS.length;
    const matchIdx = INS.findIndex(([inId]) => inId === id);
    const isMissing = matchIdx < 0;
    if (isMissing) kept.push([id, name]);

    rec.step({
      title: `O.${id}(${name}) ↔ ANIMAL_INS ${INS.length}건 전체 스캔 (누적 ${work}회)`,
      codeHighlights: ALT_AT.scan,
      ...meta(`${id} 대조`),
    });
    rec.phase(
      '전체 행 순차 비교',
      isMissing
        ? `${id}(${name})를 찾기 위해 ANIMAL_INS ${INS.length}건을 끝까지 다 훑어 없는 것을 확인합니다.`
        : `${id}(${name})가 있는지 ANIMAL_INS ${INS.length}건을 매번 처음부터 끝까지 대조합니다.`,
      ALT_AT.scan,
    );
    if (isMissing) {
      const slot = kept.length - 1;
      rec.do(
        ...together([
          paint(outsId(r), 'good'),
          { type: 'add', item: { id: resId(slot), kind: 'token', rect: resRect(slot), tone: 'chosen', text: `${id} · ${name}` }, from: outsId(r) },
        ]),
        wait(150),
      );
    } else {
      rec.do(paint(outsId(r), 'muted'), wait(140));
    }
  });

  work += kept.length;
  rec.step({
    title: `정렬 및 반환: 정답은 같지만 비교 연산 ${work}회`,
    codeHighlights: ALT_AT.done,
    ...meta('완료'),
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('마무리', `결과는 같지만 해시/인덱스 조인(13회) 대신 매 행마다 ANIMAL_INS 전체를 훑어 총 ${work}번 연산했습니다.`, ALT_AT.done);
  rec.do(
    ...together([
      ...TRUTH.map(([id, name], slot): Action => ({
        type: 'set',
        id: resId(slot),
        patch: { text: `${id} · ${name}`, tone: 'path' },
        pop: true,
      })),
      { type: 'set', id: 'status', patch: { text: `정답 동일 · 중첩 대조로 총 ${work}회 연산`, tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: 테이블 순서를 뒤집어 ANIMAL_INS LEFT JOIN ANIMAL_OUTS로 작성    */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const outIds = new Set(OUTS.map(([id]) => id));
  const wrongKept: AnimalRow[] = [];
  const meta = (clause: string, target = '-') => ({
    work,
    variables: { 절: clause, 대상: target, 기준테이블: 'ANIMAL_INS(역방향!)', 선택수: wrongKept.length },
  });

  INS.forEach(([id, name], r) => {
    const inOuts = outIds.has(id);
    work += 1;
    if (!inOuts) wrongKept.push([id, name]);

    rec.step({
      title: `함정 스캔: I.${id}(${name}) → O.ANIMAL_ID ${inOuts ? '존재' : 'NULL (미입양 동물!)'}`,
      codeHighlights: TRAP_AT.join,
      ...meta('역방향 LEFT JOIN', `${id}(${name})`),
    });
    rec.phase(
      '반대 방향 LEFT JOIN',
      inOuts
        ? `ANIMAL_INS를 왼쪽에 두었기 때문에 보호 기록이 있는 ${id}(${name})만 검사하고, 아예 INS에 없는 유실 기록(A349, A351, A355)은 보지도 못합니다.`
        : `${id}(${name})는 보호소에는 들어왔지만 아직 입양을 안 간 동물인데, O.ANIMAL_ID IS NULL 조건에 걸려 잘못 선택됩니다!`,
      TRAP_AT.join,
    );
    if (!inOuts) {
      const slot = wrongKept.length - 1;
      rec.do(
        ...together([
          paint(insId(r), 'bad'),
          { type: 'add', item: { id: resId(slot), kind: 'token', rect: resRect(slot), tone: 'bad', text: `${id} · ${name} (미입양)` }, from: insId(r) },
        ]),
        wait(180),
      );
    } else {
      rec.do(paint(insId(r), 'visited'), wait(150));
    }
  });

  rec.step({
    title: '오답: 유실된 입양 기록 대신 아직 입양 못 간 A354(Romy) 반환',
    codeHighlights: TRAP_AT.done,
    ...meta('SELECT', '오답'),
    answer: wrongKept,
    isKeyframe: true,
  });
  rec.phase('오답 확인', 'LEFT JOIN에서 어느 테이블을 왼쪽(FROM)에 둘지 거꾸로 쓰면 완전히 다른 질문(아직 입양 못 간 동물 찾기)의 답이 나옵니다.', TRAP_AT.done);
  rec.do({
    type: 'set',
    id: 'status',
    patch: { text: '오답 [[A354, Romy]] 반환 · 정답은 [[A349, Bambi], [A351, Coco], [A355, Allie]]', tone: 'bad' },
    pop: true,
  });
  return rec.finish();
}

const problem: Problem = {
  id: 'missing-records',
  title: '없어진 기록 찾기',
  level: 3,
  category: 'sql-join',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/59042',
  description: {
    summary:
      '천재지변으로 인해 일부 데이터가 유실되었습니다. 입양을 간 기록(ANIMAL_OUTS)은 있는데, 보호소에 들어온 기록(ANIMAL_INS)은 없는 동물의 ID와 이름을 ID 순으로 조회하는 SQL 문을 작성합니다.',
    rules: [
      'ANIMAL_INS는 동물 보호소에 들어온 동물의 정보를 담은 테이블이며, ANIMAL_OUTS는 입양 보낸 동물의 정보를 담은 테이블임',
      '입양을 간 기록은 있고 보호소에 들어온 기록은 없는 동물의 ANIMAL_ID와 NAME을 조회',
      '결과는 ANIMAL_ID 오름차순으로 정렬',
    ],
    examples: [
      {
        input: 'ANIMAL_INS = [["A350","Sugar"],["A352","Jewel"],["A354","Romy"],["A358","Nabi"]], ANIMAL_OUTS = [["A355","Allie"],["A350","Sugar"],["A349","Bambi"],["A352","Jewel"],["A358","Nabi"],["A351","Coco"]]',
        output: '[["A349","Bambi"],["A351","Coco"],["A355","Allie"]]',
      },
    ],
  },
  keyIntuitions: [
    '"A에는 있는데 B에는 없는 행"을 찾을 때는 A를 FROM(왼쪽)에 두고 B를 LEFT JOIN한 뒤 WHERE B.KEY IS NULL로 거릅니다.',
    '이 문제는 입양 기록(ANIMAL_OUTS)이 기준이므로 FROM ANIMAL_OUTS O LEFT JOIN ANIMAL_INS I 순서를 지켜야 합니다.',
    '테이블 순서를 반대로 쓰면 "보호소에 들어왔는데 아직 입양을 못 간 동물(오랜 기간 보호한 동물)"을 조회하게 됩니다.',
  ],
  demo: {
    input: [INS, OUTS],
    label: 'ANIMAL_OUTS 6건 중 ANIMAL_INS(4건)에 없는 유실 기록 3건 찾기',
  },
  workUnit: '조인·비교한 행 수',
  approaches: [
    {
      id: 'missing-records-left-join-is-null',
      name: 'LEFT JOIN + IS NULL',
      rank: 'BEST',
      timeComplexity: 'O(N + M + K log K)',
      spaceComplexity: 'O(N + K)',
      verdict: 'ANIMAL_OUTS를 왼쪽에 두고 ANIMAL_INS를 LEFT JOIN한 뒤 I.ANIMAL_ID IS NULL인 행만 추리는 정석 안티 조인(Anti-Join) 쿼리입니다.',
      pros: [
        '인덱스/해시 조인으로 두 테이블을 한 번씩만 훑어 빠르고 직관적입니다.',
        'LEFT JOIN + IS NULL 패턴은 차집합(OUTS − INS)을 구하는 표준 SQL 관용구입니다.',
      ],
      cons: ['WHERE 절에서 O.ANIMAL_ID가 아니라 반드시 오른쪽 테이블의 기본키(I.ANIMAL_ID)가 NULL인지 검사해야 합니다.'],
      whyThisRank: 'SQL 옵티마이저가 Anti-Join으로 바로 최적화하며, 의도가 가장 선명하게 드러납니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'missing-records-nested-scan',
      name: '매 행마다 ANIMAL_INS 전체 대조',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × M)',
      spaceComplexity: 'O(K)',
      verdict: 'ANIMAL_OUTS의 각 동물마다 ANIMAL_INS 전체를 처음부터 끝까지 훑으며 일치하는 ID가 없는지 확인하는 풀이입니다.',
      pros: ['조인 문법 없이 중첩 반복이나 상관 서브쿼리 사고방식 그대로 이해할 수 있습니다.'],
      cons: ['입양 기록마다 보호 기록 테이블을 반복 스캔하므로 데이터가 커지면 비교 횟수가 급증합니다.'],
      whyThisRank: '정답은 같지만 인덱스/해시 기반 LEFT JOIN보다 비교 연산이 훨씬 많습니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'missing-records-reversed-table-trap',
      name: '테이블 순서 반대 (INS LEFT JOIN OUTS)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N + M)',
      spaceComplexity: 'O(K)',
      verdict: 'FROM ANIMAL_INS LEFT JOIN ANIMAL_OUTS로 테이블 순서를 거꾸로 써서 유실된 입양 기록 대신 미입양 동물을 뽑는 함정입니다.',
      pros: ['쿼리 구조가 거의 똑같아 보여 실수하기 매우 쉽습니다.'],
      cons: [
        'ANIMAL_INS에 아예 없는 유실 동물(A349, A351, A355)은 왼쪽 테이블에조차 없으므로 절대 결과에 나올 수 없습니다.',
        '대신 보호소에만 있고 입양을 못 간 동물(A354)이 출력되어 오답이 됩니다.',
      ],
      whyThisRank: 'LEFT JOIN에서는 "살려야 하는 쪽(데이터가 남아 있는 ANIMAL_OUTS)"이 반드시 왼쪽에 와야 합니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [INS, OUTS], expected: TRUTH },
      {
        args: [
          [['A100', 'Max'], ['A200', 'Bella']],
          [['A300', 'Charlie'], ['A100', 'Max'], ['A050', 'Lucy']],
        ],
        expected: [
          ['A050', 'Lucy'],
          ['A300', 'Charlie'],
        ],
      },
      {
        args: [
          [['A101', 'Leo'], ['A102', 'Milo']],
          [['A101', 'Leo']],
        ],
        expected: [],
      },
    ],
    random: (rand) => {
      const pool: AnimalRow[] = Array.from({ length: 8 }, (_, i) => [`A30${i + 1}`, `Pet${i + 1}`]);
      const ins: AnimalRow[] = [];
      const outs: AnimalRow[] = [];
      for (const row of pool) {
        if (rand() < 0.55) ins.push(row);
        if (rand() < 0.65) outs.push(row);
      }
      // 순서를 섞어 ORDER BY 검증
      outs.sort(() => rand() - 0.5);
      return [ins, outs];
    },
  },
};

export default problem;
