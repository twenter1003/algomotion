// 오랜 기간 보호한 동물(2): 정석 조인 + DATEDIFF 내림차순 LIMIT 2, 대안 서브쿼리 윈도우 순위 부여 후 RN <= 2, 함정 보호 기간 대신 입소일(DATETIME ASC) 순 정렬을 같은 장면에서 움직인다.
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

type AnimalInRow = [id: string, name: string, inDate: string];
type AnimalOutRow = [id: string, outDate: string];

const INS: AnimalInRow[] = [
  ['A1', 'Lucy', '2016-01-01'],
  ['A2', 'Raven', '2016-02-01'],
  ['A3', 'Bella', '2016-03-01'],
  ['A4', 'Coco', '2016-04-01'],
  ['A5', 'Max', '2016-05-01'],
];
const OUTS: AnimalOutRow[] = [
  ['A1', '2016-01-05'], // 4일 보호
  ['A2', '2016-07-01'], // 151일 보호 (2위)
  ['A3', '2017-03-01'], // 365일 보호 (1위)
  ['A4', '2016-05-01'], // 30일 보호
  // A5는 미입양
];
const TRUTH = [
  ['A3', 'Bella'],
  ['A2', 'Raven'],
];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  sql: `SELECT I.ANIMAL_ID, I.NAME
FROM ANIMAL_INS I
JOIN ANIMAL_OUTS O ON I.ANIMAL_ID = O.ANIMAL_ID
ORDER BY DATEDIFF(O.DATETIME, I.DATETIME) DESC
LIMIT 2;`,
  python: `def solution(ins, outs):
    out_map = {id: date for id, date in outs}
    # 입양 간 동물만 조인하여 보호 기간(일수) 계산
    diffs = []
    for id, name, in_date in ins:
        if id in out_map:
            from datetime import date
            d_in = date.fromisoformat(in_date)
            d_out = date.fromisoformat(out_map[id])
            days = (d_out - d_in).days
            diffs.append((id, name, days))
    # 보호 기간 긴 순(내림차순) 상위 2마리 선택
    diffs.sort(key=lambda r: -r[2])
    return [[id, name] for id, name, _ in diffs[:2]]`,
  javascript: `function solution(ins, outs) {
  const outMap = new Map(outs);
  const diffs = [];
  for (const [id, name, inDate] of ins) {
    if (outMap.has(id)) {
      const ms = new Date(outMap.get(id)).getTime() - new Date(inDate).getTime();
      const days = Math.round(ms / (1000 * 60 * 60 * 24));
      diffs.push({ id, name, days });
    }
  }
  diffs.sort((a, b) => b.days - a.days);
  return diffs.slice(0, 2).map(({ id, name }) => [id, name]);
}`,
};
const BEST_AT = {
  join: sqlLines(BEST_CODE, ['FROM ANIMAL_INS I', 'JOIN ANIMAL_OUTS O ON I.ANIMAL_ID = O.ANIMAL_ID'], ['out_map = {id: date for id, date in outs}'], ['const outMap = new Map(outs);']),
  diff: sqlLines(BEST_CODE, ['ORDER BY DATEDIFF(O.DATETIME, I.DATETIME) DESC'], ['days = (d_out - d_in).days', 'diffs.sort(key=lambda r: -r[2])'], ['const days = Math.round(ms / (1000 * 60 * 60 * 24));', 'diffs.sort((a, b) => b.days - a.days);']),
  limit: sqlLines(BEST_CODE, ['SELECT I.ANIMAL_ID, I.NAME', 'LIMIT 2;'], ['return [[id, name] for id, name, _ in diffs[:2]]'], ['return diffs.slice(0, 2).map(({ id, name }) => [id, name]);']),
};

const ALT_CODE = {
  sql: `SELECT ANIMAL_ID, NAME
FROM (
    SELECT I.ANIMAL_ID, I.NAME,
           ROW_NUMBER() OVER (ORDER BY DATEDIFF(O.DATETIME, I.DATETIME) DESC) AS RN
    FROM ANIMAL_INS I
    JOIN ANIMAL_OUTS O ON I.ANIMAL_ID = O.ANIMAL_ID
) S
WHERE RN <= 2
ORDER BY RN ASC;`,
  python: `def solution(ins, outs):
    # 서브쿼리에서 전체 순위를 매긴 뒤 RN <= 2 필터
    out_map = {id: date for id, date in outs}
    from datetime import date
    ranked = []
    for id, name, in_date in ins:
        if id in out_map:
            days = (date.fromisoformat(out_map[id]) - date.fromisoformat(in_date)).days
            ranked.append((id, name, days))
    ranked.sort(key=lambda r: -r[2])
    # 모든 순위를 매긴 뒤 상위 2건 추출
    return [[id, name] for id, name, _ in ranked if True][:2]`,
  javascript: `function solution(ins, outs) {
  // 서브쿼리에서 전체 순위를 매긴 뒤 RN <= 2 필터합니다
  const outMap = new Map(outs);
  const ranked = [];
  for (const [id, name, inDate] of ins) {
    if (outMap.has(id)) {
      const days = Math.round((new Date(outMap.get(id)).getTime() - new Date(inDate).getTime()) / (1000 * 60 * 60 * 24));
      ranked.push({ id, name, days });
    }
  }
  ranked.sort((a, b) => b.days - a.days);
  return ranked.slice(0, 2).map(({ id, name }) => [id, name]);
}`,
};
const ALT_AT = {
  window: sqlLines(ALT_CODE, ['ROW_NUMBER() OVER (ORDER BY DATEDIFF(O.DATETIME, I.DATETIME) DESC) AS RN'], ['ranked.sort(key=lambda r: -r[2])'], ['ranked.sort((a, b) => b.days - a.days);']),
  limit: sqlLines(ALT_CODE, ['WHERE RN <= 2', 'ORDER BY RN ASC;'], ['return [[id, name] for id, name, _ in ranked if True][:2]'], ['return ranked.slice(0, 2).map(({ id, name }) => [id, name]);']),
};

const TRAP_CODE = {
  sql: `-- 함정: 보호 기간(DATEDIFF) 대신 입소일(I.DATETIME ASC) 순 정렬
SELECT I.ANIMAL_ID, I.NAME
FROM ANIMAL_INS I
JOIN ANIMAL_OUTS O ON I.ANIMAL_ID = O.ANIMAL_ID
ORDER BY I.DATETIME ASC
LIMIT 2;`,
  python: `def solution(ins, outs):
    # 함정: 보호 기간이 아니라 입소일이 빠른 순으로 정렬해 일찍 입양 간 동물이 뽑힘
    out_ids = {id for id, _ in outs}
    adopted = [r for r in ins if r[0] in out_ids]
    adopted.sort(key=lambda r: r[2])  # in_date ASC
    return [[id, name] for id, name, _ in adopted[:2]]`,
  javascript: `function solution(ins, outs) {
  // 함정: 보호 기간이 아니라 입소일이 빠른 순으로 정렬해 일찍 입양 간 동물이 뽑힙니다
  const outIds = new Set(outs.map(([id]) => id));
  const adopted = ins.filter(([id]) => outIds.has(id));
  adopted.sort((a, b) => a[2].localeCompare(b[2])); // inDate ASC
  return adopted.slice(0, 2).map(([id, name]) => [id, name]);
}`,
};
const TRAP_AT = {
  trapOrder: sqlLines(TRAP_CODE, ['ORDER BY I.DATETIME ASC', 'LIMIT 2;'], ['adopted.sort(key=lambda r: r[2])  # in_date ASC'], ['adopted.sort((a, b) => a[2].localeCompare(b[2])); // inDate ASC']),
  done: sqlLines(TRAP_CODE, ['SELECT I.ANIMAL_ID, I.NAME'], ['return [[id, name] for id, name, _ in adopted[:2]]'], ['return adopted.slice(0, 2).map(([id, name]) => [id, name]);']),
};

/* ------------------------------------------------------------------ */
/* 장면과 배치                                                          */
/* ------------------------------------------------------------------ */

const W = 600;
const H = 350;
const IN_X = 14;
const IN_Y = 36;
const IN_W = 210;
const IN_H = 34;
const OUT_X = 236;
const OUT_W = 160;
const RES_X = 410;
const RES_W = 176;

const inIdStr = (r: number) => `in:${r}`;
const outIdStr = (r: number) => `out:${r}`;
const resIdStr = (slot: number) => `res:${slot}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:i', kind: 'text', rect: { x: IN_X, y: 8, w: IN_W, h: 22 }, tone: 'muted', text: 'ANIMAL_INS (입소 5마리)' },
    { id: 'hdr:o', kind: 'text', rect: { x: OUT_X, y: 8, w: OUT_W, h: 22 }, tone: 'chosen', text: 'ANIMAL_OUTS (입양 4마리)' },
    { id: 'hdr:r', kind: 'text', rect: { x: RES_X, y: 8, w: RES_W, h: 22 }, tone: 'good', text: '보호 기간 순위' },
    { id: 'status', kind: 'token', rect: { x: IN_X, y: 304, w: 572, h: 32 }, tone: 'plain', text: '조인 및 보호 기간 계산 대기' },
  ];
  INS.forEach(([id, name, date], r) => {
    items.push({ id: inIdStr(r), kind: 'token', rect: { x: IN_X, y: IN_Y + r * 44, w: IN_W, h: IN_H }, tone: 'plain', text: `${id} · ${name} (${date})` });
  });
  OUTS.forEach(([id, date], r) => {
    items.push({ id: outIdStr(r), kind: 'token', rect: { x: OUT_X, y: IN_Y + r * 44, w: OUT_W, h: IN_H }, tone: 'plain', text: `${id} 입양 (${date})` });
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석: JOIN + DATEDIFF 내림차순 LIMIT 2                                */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;

  rec.step({ title: 'FROM ANIMAL_INS I: 입소 동물 5마리 확인', codeHighlights: BEST_AT.join, work, variables: { 절: 'FROM', 입소동물수: INS.length } });
  rec.phase('입소 동물 읽기', 'ANIMAL_INS 테이블에서 입소한 동물 5마리의 입소일을 읽습니다.', BEST_AT.join);
  rec.do({ type: 'set', id: 'status', patch: { text: 'FROM ANIMAL_INS → 입소 동물 5마리 로드', tone: 'chosen' }, pop: true }, wait(180));

  rec.step({ title: 'JOIN ANIMAL_OUTS O: 입양 동물 4마리와 조인', codeHighlights: BEST_AT.join, work, variables: { 절: 'JOIN', 입양동물수: OUTS.length } });
  rec.phase('입양 기록 연결', 'ANIMAL_OUTS와 조인해 입양 간 동물 4마리를 매칭합니다. 미입양 동물(Max)은 제외됩니다.', BEST_AT.join);
  rec.do(
    ...together([
      paint(inIdStr(0), 'chosen'),
      paint(inIdStr(1), 'chosen'),
      paint(inIdStr(2), 'chosen'),
      paint(inIdStr(3), 'chosen'),
      paint(inIdStr(4), 'muted'),
      { type: 'set', id: 'status', patch: { text: '입양 동물 4마리 조인 매칭 (A5 Max 미입양 제외)', tone: 'chosen' }, pop: true },
    ]),
    wait(200),
  );

  const matched = [
    { id: 'A1', name: 'Lucy', inD: '2016-01-01', outD: '2016-01-05', days: 4, r: 0 },
    { id: 'A2', name: 'Raven', inD: '2016-02-01', outD: '2016-07-01', days: 151, r: 1 },
    { id: 'A3', name: 'Bella', inD: '2016-03-01', outD: '2017-03-01', days: 365, r: 2 },
    { id: 'A4', name: 'Coco', inD: '2016-04-01', outD: '2016-05-01', days: 30, r: 3 },
  ];

  matched.forEach((m, slot) => {
    work += 1;
    rec.step({
      title: `DATEDIFF: ${m.name}(${m.id}) → 보호 기간 ${m.days}일 계산`,
      codeHighlights: BEST_AT.diff,
      work,
      variables: { 절: 'DATEDIFF', 동물: m.name, 보호일수: `${m.days}일` },
    });
    rec.phase('보호 기간 계산', `${m.name}: 입양일(${m.outD}) - 입소일(${m.inD}) = ${m.days}일간 보호되었습니다.`, BEST_AT.diff);
    rec.do(
      ...together([
        paint(inIdStr(m.r), 'good'),
        paint(outIdStr(m.r), 'good'),
        { type: 'add', item: { id: resIdStr(slot), kind: 'token', rect: { x: RES_X, y: IN_Y + slot * 48, w: RES_W, h: 38 }, tone: 'good', text: `${m.name}: ${m.days}일` }, from: inIdStr(m.r) },
      ]),
      wait(180),
    );
  });

  rec.step({
    title: 'ORDER BY DATEDIFF DESC: 보호 기간 긴 순서로 정렬',
    codeHighlights: BEST_AT.diff,
    work: work + 4,
    variables: { 절: 'ORDER BY DESC', 정렬대상: '입양 4마리' },
  });
  rec.phase('정렬하기', '보호 기간을 기준으로 Bella(365일) 1위, Raven(151일) 2위, Coco(30일) 3위, Lucy(4일) 4위로 정렬합니다.', BEST_AT.diff);
  rec.do(
    ...together([
      { type: 'set', id: resIdStr(2), patch: { rect: { x: RES_X, y: IN_Y, w: RES_W, h: 38 }, text: '1위: Bella (365일)', tone: 'good' }, pop: true },
      { type: 'set', id: resIdStr(1), patch: { rect: { x: RES_X, y: IN_Y + 48, w: RES_W, h: 38 }, text: '2위: Raven (151일)', tone: 'good' }, pop: true },
      { type: 'set', id: resIdStr(3), patch: { rect: { x: RES_X, y: IN_Y + 96, w: RES_W, h: 38 }, text: '3위: Coco (30일)', tone: 'muted' }, pop: true },
      { type: 'set', id: resIdStr(0), patch: { rect: { x: RES_X, y: IN_Y + 144, w: RES_W, h: 38 }, text: '4위: Lucy (4일)', tone: 'muted' }, pop: true },
    ]),
    wait(200),
  );

  rec.step({
    title: 'LIMIT 2: 상위 2마리 Bella, Raven 최종 추출',
    codeHighlights: BEST_AT.limit,
    work: work + 4,
    variables: { 절: 'LIMIT 2', '1위': 'Bella(365일)', '2위': 'Raven(151일)' },
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('상위 2마리 추출', 'LIMIT 2에 따라 상위 2마리(1위 Bella, 2위 Raven)만 남기고 나머지는 제외합니다.', BEST_AT.limit);
  rec.do(
    ...together([
      paint(resIdStr(2), 'path'),
      paint(resIdStr(1), 'path'),
      { type: 'remove', id: resIdStr(0) },
      { type: 'remove', id: resIdStr(3) },
      { type: 'set', id: 'status', patch: { text: '정답: [A3 Bella, A2 Raven] 2마리 출력 완료', tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 서브쿼리 윈도우 순위 부여 후 필터                                   */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 4; // 4건 전체 날짜 계산 및 정렬 순위 부여

  rec.step({ title: '윈도우 함수: 전체 입양 동물 4마리 순위(RN) 부여', codeHighlights: ALT_AT.window, work, variables: { 절: 'ROW_NUMBER()', 정렬대상: 4 } });
  rec.phase('전체 순위 계산', 'ROW_NUMBER() OVER (ORDER BY DATEDIFF DESC)로 4마리 동물 전체의 보호 기간 순위를 1위부터 4위까지 모두 매깁니다.', ALT_AT.window);
  rec.do(
    ...together([
      { type: 'add', item: { id: resIdStr(0), kind: 'token', rect: { x: RES_X, y: IN_Y, w: RES_W, h: 38 }, tone: 'chosen', text: 'RN=1: Bella (365일)' } },
      { type: 'add', item: { id: resIdStr(1), kind: 'token', rect: { x: RES_X, y: IN_Y + 48, w: RES_W, h: 38 }, tone: 'chosen', text: 'RN=2: Raven (151일)' } },
      { type: 'add', item: { id: resIdStr(2), kind: 'token', rect: { x: RES_X, y: IN_Y + 96, w: RES_W, h: 38 }, tone: 'muted', text: 'RN=3: Coco (30일)' } },
      { type: 'add', item: { id: resIdStr(3), kind: 'token', rect: { x: RES_X, y: IN_Y + 144, w: RES_W, h: 38 }, tone: 'muted', text: 'RN=4: Lucy (4일)' } },
      { type: 'set', id: 'status', patch: { text: '전체 동물 4마리 순위(RN=1..4) 매김 완료', tone: 'chosen' }, pop: true },
    ]),
    wait(220),
  );

  rec.step({
    title: 'WHERE RN <= 2: 상위 2마리 필터링 완료',
    codeHighlights: ALT_AT.limit,
    work: work + 2,
    variables: { 절: 'RN <= 2', 최종출력수: 2 },
    answer: TRUTH,
    isKeyframe: true,
  });
  rec.phase('필터링', '정답은 같지만 상위 2마리만 찾는 대신 모든 동물의 순위를 매긴 뒤 잘라냈습니다.', ALT_AT.limit);
  rec.do(
    ...together([
      paint(resIdStr(0), 'path'),
      paint(resIdStr(1), 'path'),
      { type: 'remove', id: resIdStr(2) },
      { type: 'remove', id: resIdStr(3) },
      { type: 'set', id: 'status', patch: { text: '정답 2마리 동일 (서브쿼리 순위 부여 연산 6회)', tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: DATEDIFF 대신 입소일(I.DATETIME ASC) 순으로 정렬                    */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 4;

  rec.step({
    title: '함정 쿼리: 보호 기간 대신 입소일(I.DATETIME ASC) 빠른 순 정렬',
    codeHighlights: TRAP_AT.trapOrder,
    work,
    variables: { 절: 'ORDER BY', 정렬기준: '입소일 ASC (오답!)' },
  });
  rec.phase(
    '정렬 기준 왜곡',
    '보호 기간(DATEDIFF)을 계산하지 않고 가장 먼저 입소한 동물 순서대로 2마리를 뽑아 버립니다!',
    TRAP_AT.trapOrder,
  );
  rec.do(
    ...together([
      paint(inIdStr(0), 'bad'), // Lucy (1월 입소, 4일만에 입양)
      paint(inIdStr(1), 'good'), // Raven (2월 입소)
      paint(inIdStr(2), 'muted'), // Bella (3월 입소라 탈락!)
      { type: 'add', item: { id: resIdStr(0), kind: 'token', rect: { x: RES_X, y: IN_Y, w: RES_W, h: 38 }, tone: 'bad', text: '1위: Lucy (4일 보호)' } },
      { type: 'add', item: { id: resIdStr(1), kind: 'token', rect: { x: RES_X, y: IN_Y + 48, w: RES_W, h: 38 }, tone: 'chosen', text: '2위: Raven (151일 보호)' } },
      { type: 'set', id: 'status', patch: { text: '함정: 일찍 입소해 4일만에 나간 Lucy(A1)가 1위로 뽑힘!', tone: 'bad' }, pop: true },
    ]),
    wait(200),
  );

  const wrongAns = [
    ['A1', 'Lucy'],
    ['A2', 'Raven'],
  ];
  rec.step({
    title: '오답: 365일 보호받은 Bella가 빠지고 4일 보호받은 Lucy가 1위로 출력',
    codeHighlights: TRAP_AT.done,
    work: work + 2,
    variables: { 절: '결과', '1위': 'Lucy (오답)', 정답1위: 'Bella' },
    answer: wrongAns,
    isKeyframe: true,
  });
  rec.phase('오답 확인', '가장 오래 보호된 Bella(A3, 365일)가 누락되고 4일 만에 입양 간 Lucy(A1)가 잘못 출력되었습니다. 반드시 DATEDIFF(O.DATETIME, I.DATETIME) 내림차순이어야 합니다.', TRAP_AT.done);
  rec.do({ type: 'set', id: 'status', patch: { text: '오답: [A1 Lucy, A2 Raven] · 진짜 1위 Bella(A3, 365일) 누락', tone: 'bad' }, pop: true });
  return rec.finish();
}

const problem: Problem = {
  id: 'long-term-protected-animals-2',
  title: '오랜 기간 보호한 동물(2)',
  level: 3,
  category: 'sql-string-date',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/59411',
  description: {
    summary:
      '입양을 간 동물 중, 보호 기간이 가장 길었던 동물 두 마리의 아이디와 이름을 조회합니다. 이때 결과는 보호 기간이 긴 순(내림차순)으로 조회해야 합니다.',
    rules: [
      '입양을 간 동물만을 대상으로 함 (ANIMAL_INS와 ANIMAL_OUTS 조인)',
      '보호 기간 = 입양일(OUTS.DATETIME) - 보호시작일(INS.DATETIME)',
      '보호 기간이 긴 순(내림차순)으로 상위 2마리만 출력 (LIMIT 2)',
    ],
    examples: [
      {
        input: 'ANIMAL_INS = [["A1","Lucy","2016-01-01"],["A2","Raven","2016-02-01"],["A3","Bella","2016-03-01"]], ANIMAL_OUTS = [["A1","2016-01-05"],["A2","2016-07-01"],["A3","2017-03-01"]]',
        output: '[["A3", "Bella"], ["A2", "Raven"]]',
      },
    ],
  },
  keyIntuitions: [
    '"입양을 간 동물"이어야 하므로 ANIMAL_INS와 ANIMAL_OUTS를 ANIMAL_ID 기준으로 내부 조인(INNER JOIN)합니다.',
    '보호 기간은 DATEDIFF(O.DATETIME, I.DATETIME) 또는 O.DATETIME - I.DATETIME으로 계산합니다.',
    '가장 오래 보호된 상위 2마리를 뽑아야 하므로 ORDER BY DATEDIFF(...) DESC LIMIT 2로 정렬 및 제한합니다.',
    '입소일이 빠른 순(I.DATETIME ASC)으로 잘못 정렬하면 일찍 들어와서 금방 입양 간 동물이 잘못 뽑히므로 주의해야 합니다.',
  ],
  demo: {
    input: [INS, OUTS],
    label: 'ANIMAL_INS 5마리, ANIMAL_OUTS 4마리 (Bella 365일 1위, Raven 151일 2위, Lucy 4일)',
  },
  workUnit: '동물 날짜 대조 횟수',
  approaches: [
    {
      id: 'long-term-datediff-limit',
      name: 'JOIN + DATEDIFF 내림차순 LIMIT 2',
      rank: 'BEST',
      timeComplexity: 'O(N + M + K log K)',
      spaceComplexity: 'O(K)',
      verdict: 'INNER JOIN으로 입양 동물만 연결한 뒤 DATEDIFF 내림차순으로 상위 2마리를 추출하는 정석 쿼리입니다.',
      pros: [
        'DATEDIFF 함수로 보호 기간 일수를 정확히 계산합니다.',
        'LIMIT 2를 통해 최상위 2개 행만 빠르게 반환합니다.',
      ],
      cons: ['MySQL의 DATEDIFF(종료일, 시작일) 인자 순서를 반대로 쓰지 않도록 주의해야 합니다.'],
      whyThisRank: '날짜 연산과 조인, 정렬 제한을 가장 직관적이고 표준적으로 작성한 정석 풀이입니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'long-term-window-rn',
      name: '서브쿼리 윈도우 순위 부여 후 필터',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: 'ROW_NUMBER()로 전체 동물의 순위를 다 매긴 뒤 바깥에서 RN <= 2를 거르는 풀이입니다.',
      pros: ['동률 순위 처리 정책(DENSE_RANK 등) 변경 시 유연하게 수정할 수 있습니다.'],
      cons: ['LIMIT 2로 끝낼 수 있는 작업을 전체 순위 번호 부여로 돌아가므로 계산 비용이 큽니다.'],
      whyThisRank: '결과는 같지만 굳이 서브쿼리와 윈도우 함수를 거쳐야 하므로 정석보다 복잡합니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'long-term-intake-asc-trap',
      name: '보호 기간 대신 입소일(I.DATETIME ASC) 순 정렬',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N + M + K log K)',
      spaceComplexity: 'O(K)',
      verdict: '보호 기간 계산을 빠뜨리고 가장 먼저 입소한 순서대로 정렬해, 일찍 입양 간 동물이 잘못 뽑히는 함정입니다.',
      pros: ['DATEDIFF 계산 없이 작성하기 쉬워 오해하기 쉽습니다.'],
      cons: ['1월 1일에 와서 1월 5일에 입양 간 Lucy(4일 보호)가 1위로 뽑히고 진짜 1위 Bella(365일)가 탈락합니다.'],
      whyThisRank: '"오랜 기간 보호한"이라는 문제 핵심 조건을 "가장 일찍 입소한"으로 잘못 해석한 전형적인 오답입니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [INS, OUTS], expected: TRUTH },
      {
        args: [
          [
            ['B1', '개1', '2020-01-01'],
            ['B2', '개2', '2020-02-01'],
          ],
          [
            ['B1', '2020-01-10'], // 9일
            ['B2', '2020-03-01'], // 29일
          ],
        ],
        expected: [
          ['B2', '개2'],
          ['B1', '개1'],
        ],
      },
    ],
    random: (rand) => {
      const ins: AnimalInRow[] = [
        ['D1', '동물1', '2021-01-01'],
        ['D2', '동물2', '2021-02-01'],
        ['D3', '동물3', '2021-03-01'],
      ];
      const outs: AnimalOutRow[] = [
        ['D1', `2021-01-${String(10 + Math.floor(rand() * 10)).padStart(2, '0')}`],
        ['D2', `2021-08-${String(10 + Math.floor(rand() * 10)).padStart(2, '0')}`],
        ['D3', `2022-01-${String(10 + Math.floor(rand() * 10)).padStart(2, '0')}`],
      ];
      return [ins, outs];
    },
  },
};

export default problem;
