// 3월에 태어난 여성 회원 목록 출력하기: 정석 WHERE 3월·여성·IS NOT NULL 필터 후 정렬, 대안 전체 행 먼저 정렬 후 바깥에서 필터, 함정 TLNO != 'NULL' 문자열 비교(NULL 행 누락 실패)를 같은 장면에서 움직인다.
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

type MemberRow = [id: string, name: string, gender: string, birth: string, tlno: string | null];

// 시각화 입력: 6명의 회원. 3월생 여성 중 TLNO가 있는 회원은 M02, M05 2명이고 M03은 TLNO가 null이다.
const MEMBERS: MemberRow[] = [
  ['M05', '김민서', 'W', '1993-03-12', '010-1111-2222'],
  ['M01', '이준호', 'M', '1992-03-05', '010-2222-3333'],
  ['M03', '박서연', 'W', '1995-03-21', null],
  ['M02', '최지우', 'W', '1994-03-08', '010-4444-5555'],
  ['M04', '정하은', 'W', '1996-07-19', '010-5555-6666'],
  ['M06', '한소희', 'W', '1991-11-30', '010-6666-7777'],
];
const R = MEMBERS.length;
const TRUTH = [
  ['M02', '최지우', 'W', '1994-03-08'],
  ['M05', '김민서', 'W', '1993-03-12'],
];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  sql: `SELECT MEMBER_ID, MEMBER_NAME, GENDER,
       DATE_FORMAT(DATE_OF_BIRTH, '%Y-%m-%d') AS DATE_OF_BIRTH
FROM MEMBER_PROFILE
WHERE MONTH(DATE_OF_BIRTH) = 3
  AND GENDER = 'W'
  AND TLNO IS NOT NULL
ORDER BY MEMBER_ID ASC;`,
  python: `def solution(members):
    # WHERE: 3월생 + 여성('W') + 전화번호 IS NOT NULL
    filtered = [
        [m_id, name, gender, birth[:10]]
        for m_id, name, gender, birth, tlno in members
        if int(birth[5:7]) == 3 and gender == 'W' and tlno is not None
    ]
    # ORDER BY MEMBER_ID ASC
    filtered.sort(key=lambda r: r[0])
    return filtered`,
  javascript: `function solution(members) {
  // WHERE: 3월생 + 여성('W') + 전화번호 IS NOT NULL
  const filtered = members
    .filter(([id, name, gender, birth, tlno]) =>
      Number(birth.slice(5, 7)) === 3 && gender === 'W' && tlno !== null)
    .map(([id, name, gender, birth]) => [id, name, gender, birth.slice(0, 10)]);
  // ORDER BY MEMBER_ID ASC
  return filtered.sort((a, b) => a[0].localeCompare(b[0]));
}`,
};
const BEST_AT = {
  from: sqlLines(BEST_CODE, ['FROM MEMBER_PROFILE'], ['for m_id, name, gender, birth, tlno in members'], ['const filtered = members']),
  where: sqlLines(BEST_CODE, ['WHERE MONTH(DATE_OF_BIRTH) = 3', "AND GENDER = 'W'", 'AND TLNO IS NOT NULL'], ['if int(birth[5:7]) == 3 and gender == \'W\' and tlno is not None'], ['Number(birth.slice(5, 7)) === 3 && gender === \'W\' && tlno !== null']),
  order: sqlLines(BEST_CODE, ['ORDER BY MEMBER_ID ASC;'], ['filtered.sort(key=lambda r: r[0])'], ['return filtered.sort((a, b) => a[0].localeCompare(b[0]))']),
  select: sqlLines(BEST_CODE, ['SELECT MEMBER_ID, MEMBER_NAME, GENDER,'], ['return filtered'], ['return filtered.sort((a, b) => a[0].localeCompare(b[0]))']),
};

const ALT_CODE = {
  sql: `SELECT MEMBER_ID, MEMBER_NAME, GENDER,
       DATE_FORMAT(DATE_OF_BIRTH, '%Y-%m-%d') AS DATE_OF_BIRTH
FROM (
  SELECT * FROM MEMBER_PROFILE
  ORDER BY MEMBER_ID ASC
) S
WHERE MONTH(DATE_OF_BIRTH) = 3
  AND GENDER = 'W'
  AND TLNO IS NOT NULL;`,
  python: `def solution(members):
    # 서브쿼리에서 전체 회원을 먼저 정렬한 뒤 조건으로 거른다
    sorted_all = sorted(members, key=lambda r: r[0])
    result = []
    for m_id, name, gender, birth, tlno in sorted_all:
        if int(birth[5:7]) == 3 and gender == 'W' and tlno is not None:
            result.append([m_id, name, gender, birth[:10]])
    return result`,
  javascript: `function solution(members) {
  // 서브쿼리에서 전체 회원을 먼저 정렬한 뒤 조건으로 거릅니다
  const sortedAll = [...members].sort((a, b) => a[0].localeCompare(b[0]));
  const result = [];
  for (const [id, name, gender, birth, tlno] of sortedAll) {
    if (Number(birth.slice(5, 7)) === 3 && gender === 'W' && tlno !== null) {
      result.push([id, name, gender, birth.slice(0, 10)]);
    }
  }
  return result;
}`,
};
const ALT_AT = {
  sortAll: sqlLines(ALT_CODE, ['SELECT * FROM MEMBER_PROFILE', 'ORDER BY MEMBER_ID ASC'], ['sorted_all = sorted(members, key=lambda r: r[0])'], ['const sortedAll = [...members].sort']),
  where: sqlLines(ALT_CODE, ['WHERE MONTH(DATE_OF_BIRTH) = 3', "AND GENDER = 'W'", 'AND TLNO IS NOT NULL;'], ['for m_id, name, gender, birth, tlno in sorted_all:', "if int(birth[5:7]) == 3 and gender == 'W' and tlno is not None:"], ['for (const [id, name, gender, birth, tlno] of sortedAll)', "if (Number(birth.slice(5, 7)) === 3 && gender === 'W' && tlno !== null)"]),
  done: sqlLines(ALT_CODE, ['SELECT MEMBER_ID, MEMBER_NAME, GENDER,'], ['return result'], ['return result;']),
};

const TRAP_CODE = {
  sql: `-- 함정: IS NOT NULL을 빼먹거나 TLNO != 'NULL'로 잘못 비교
SELECT MEMBER_ID, MEMBER_NAME, GENDER,
       DATE_FORMAT(DATE_OF_BIRTH, '%Y-%m-%d') AS DATE_OF_BIRTH
FROM MEMBER_PROFILE
WHERE MONTH(DATE_OF_BIRTH) = 3
  AND GENDER = 'W'
  AND TLNO != 'NULL'
ORDER BY MEMBER_ID ASC;`,
  python: `def solution(members):
    # 함정: tlno is not None 대신 문자열 'NULL'과만 비교해 None이 그대로 통과함
    filtered = [
        [m_id, name, gender, birth[:10]]
        for m_id, name, gender, birth, tlno in members
        if int(birth[5:7]) == 3 and gender == 'W' and tlno != 'NULL'
    ]
    filtered.sort(key=lambda r: r[0])
    return filtered`,
  javascript: `function solution(members) {
  // 함정: tlno !== null 대신 문자열 'NULL'과만 비교해 null이 그대로 통과합니다
  const filtered = members
    .filter(([id, name, gender, birth, tlno]) =>
      Number(birth.slice(5, 7)) === 3 && gender === 'W' && tlno !== 'NULL')
    .map(([id, name, gender, birth]) => [id, name, gender, birth.slice(0, 10)]);
  return filtered.sort((a, b) => a[0].localeCompare(b[0]));
}`,
};
const TRAP_AT = {
  from: sqlLines(TRAP_CODE, ['FROM MEMBER_PROFILE'], ['for m_id, name, gender, birth, tlno in members'], ['const filtered = members']),
  where: sqlLines(TRAP_CODE, ['WHERE MONTH(DATE_OF_BIRTH) = 3', "AND GENDER = 'W'", "AND TLNO != 'NULL'"], ["if int(birth[5:7]) == 3 and gender == 'W' and tlno != 'NULL'"], ["Number(birth.slice(5, 7)) === 3 && gender === 'W' && tlno !== 'NULL'"]),
  done: sqlLines(TRAP_CODE, ['ORDER BY MEMBER_ID ASC;'], ['filtered.sort(key=lambda r: r[0])', 'return filtered'], ['return filtered.sort((a, b) => a[0].localeCompare(b[0]));']),
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
const ROW_W = 330;
const OUT_X = 368;
const OUT_W = 218;

const rowRect = (r: number): Rect => ({ x: ROW_X, y: ROW_Y + r * ROW_PITCH, w: ROW_W, h: ROW_H });
const outRect = (slot: number): Rect => ({ x: OUT_X, y: ROW_Y + slot * ROW_PITCH, w: OUT_W, h: ROW_H });
const rowId = (r: number) => `row:${r}`;
const outId = (slot: number) => `out:${slot}`;
const rowText = (m: MemberRow) => `${m[0]} · ${m[1]} · ${m[2]} · ${m[3].slice(5, 7)}월 · ${m[4] ? '전화O' : 'NULL'}`;
const outText = (m: MemberRow) => `${m[0]} · ${m[1]} (${m[3]})`;

function board(): Scene {
  const items: Item[] = [
    { id: 'hdr:in', kind: 'text', rect: { x: ROW_X, y: 10, w: ROW_W, h: 22 }, tone: 'muted', text: 'MEMBER_PROFILE 테이블 (6행)' },
    { id: 'hdr:out', kind: 'text', rect: { x: OUT_X, y: 10, w: OUT_W, h: 22 }, tone: 'chosen', text: 'SELECT 결과 행' },
    { id: 'status', kind: 'token', rect: { x: ROW_X, y: 292, w: 572, h: 32 }, tone: 'plain', text: '쿼리 실행 대기' },
  ];
  MEMBERS.forEach((m, r) => {
    items.push({ id: rowId(r), kind: 'token', rect: rowRect(r), tone: 'plain', text: rowText(m) });
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석: WHERE 3조건 필터 후 살아남은 행만 정렬                            */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const kept: MemberRow[] = [];
  const meta = (clause: string, member = '-') => ({
    work,
    variables: { 절: clause, 회원: member, 통과수: kept.length },
  });

  rec.step({ title: 'FROM MEMBER_PROFILE: 6개 회원 행 스캔 시작', codeHighlights: BEST_AT.from, ...meta('FROM') });
  rec.phase('테이블 읽기', 'FROM 절이 MEMBER_PROFILE 테이블의 6개 행을 차례대로 읽으며 WHERE 조건을 검사합니다.', BEST_AT.from);
  rec.do({ type: 'set', id: 'status', patch: { text: 'FROM MEMBER_PROFILE → WHERE 조건 검사 시작', tone: 'chosen' }, pop: true }, wait(200));

  MEMBERS.forEach((m, r) => {
    const [id, name, gender, birth, tlno] = m;
    const month = Number(birth.slice(5, 7));
    const ok = month === 3 && gender === 'W' && tlno !== null;
    work += 1;
    const reason = month !== 3 ? `${month}월생 제외` : gender !== 'W' ? '남성(M) 제외' : tlno === null ? 'TLNO IS NULL 제외' : '3월·여성·전화번호 있음';
    if (ok) kept.push(m);

    rec.step({ title: `WHERE 검사: ${id} ${name} → ${ok ? '통과' : reason}`, codeHighlights: BEST_AT.where, ...meta('WHERE', `${id}(${name})`) });
    rec.phase('WHERE 검사', `${id} ${name} 행을 살핍니다: ${birth.slice(0, 7)}, 성별 ${gender}, 전화번호 ${tlno ?? 'NULL'} → ${reason}.`, BEST_AT.where);
    rec.do(...together([{ type: 'focus', ids: [rowId(r)] }, paint(rowId(r), ok ? 'good' : 'explored')]), wait(180));

    if (ok) {
      const slot = kept.length - 1;
      rec.phase('결과 후보 추가', `세 조건을 모두 만족하므로 ${id}(${name}) 행을 결과 후보 목록에 담습니다.`, BEST_AT.where);
      rec.do(
        { type: 'add', item: { id: outId(slot), kind: 'token', rect: outRect(slot), tone: 'chosen', text: outText(m) }, from: rowId(r) },
        { type: 'unfocus' },
        paint(rowId(r), 'visited'),
      );
    } else {
      rec.phase('행 제외', `조건에 맞지 않는 ${id} 행은 정렬 단계로 넘기지 않고 바로 버립니다.`, BEST_AT.where);
      rec.do({ type: 'unfocus' }, paint(rowId(r), 'muted'));
    }
  });

  work += kept.length;
  rec.step({ title: `ORDER BY MEMBER_ID ASC: 살아남은 ${kept.length}행만 정렬`, codeHighlights: BEST_AT.order, ...meta('ORDER BY', 'M02, M05') });
  rec.phase('정렬하기', `WHERE에서 살아남은 ${kept.length}건(M05, M02)만 MEMBER_ID 오름차순(M02 → M05)으로 자리를 바꿉니다.`, BEST_AT.order);
  rec.do(
    ...together([
      { type: 'set', id: outId(0), patch: { text: outText(MEMBERS[3]), tone: 'current' }, pop: true },
      { type: 'set', id: outId(1), patch: { text: outText(MEMBERS[0]), tone: 'current' }, pop: true },
      { type: 'set', id: 'status', patch: { text: 'ORDER BY MEMBER_ID ASC → M02, M05 순서 확정', tone: 'chosen' }, pop: true },
    ]),
    wait(200),
  );

  rec.step({ title: `SELECT 완료: ${josa(TRUTH.length, '건', '건')} 출력 (행 연산 ${work}회)`, codeHighlights: BEST_AT.select, ...meta('SELECT', '완료'), answer: TRUTH, isKeyframe: true });
  rec.phase('마무리', `먼저 WHERE로 6행을 2행으로 줄인 뒤 정렬해 총 ${work}번의 행 처리로 정답 2건을 얻었습니다.`, BEST_AT.select);
  rec.do(
    ...together([
      paint(outId(0), 'path'),
      paint(outId(1), 'path'),
      { type: 'set', id: 'status', patch: { text: '정답: [M02 최지우, M05 김민서] (2건)', tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 전체 6행을 먼저 정렬한 뒤 WHERE 필터                             */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const sorted = [...MEMBERS].sort((a, b) => a[0].localeCompare(b[0]));
  const kept: MemberRow[] = [];
  const meta = (clause: string, member = '-') => ({
    work,
    variables: { 절: clause, 회원: member, 통과수: kept.length },
  });

  work += R;
  rec.step({ title: `서브쿼리 ORDER BY: 전체 ${R}행을 먼저 ID 순으로 정렬`, codeHighlights: ALT_AT.sortAll, ...meta('서브쿼리 ORDER BY') });
  rec.phase('전체 정렬', `조건으로 거르기 전에 버려질 행까지 포함한 ${R}행 전체를 먼저 MEMBER_ID 오름차순으로 정렬합니다.`, ALT_AT.sortAll);
  rec.do(
    ...together([
      ...sorted.map((m, r): Action => ({ type: 'set', id: rowId(r), patch: { text: rowText(m), tone: 'chosen' }, pop: true })),
      { type: 'set', id: 'status', patch: { text: `전체 ${R}행 정렬 완료 (불필요한 4행까지 정렬 비용 발생)`, tone: 'chosen' }, pop: true },
    ]),
    wait(220),
  );

  sorted.forEach((m, r) => {
    const [id, name, gender, birth, tlno] = m;
    const month = Number(birth.slice(5, 7));
    const ok = month === 3 && gender === 'W' && tlno !== null;
    work += 1;
    if (ok) kept.push(m);

    rec.step({ title: `바깥 WHERE 검사: ${id} ${name} → ${ok ? '통과' : '제외'}`, codeHighlights: ALT_AT.where, ...meta('WHERE', `${id}(${name})`) });
    rec.phase('뒤늦은 필터', `이미 정렬된 ${id}(${name}) 행이 3월생 여성이고 전화번호가 있는지 확인합니다.`, ALT_AT.where);
    if (ok) {
      const slot = kept.length - 1;
      rec.do(
        ...together([
          paint(rowId(r), 'visited'),
          { type: 'add', item: { id: outId(slot), kind: 'token', rect: outRect(slot), tone: 'chosen', text: outText(m) }, from: rowId(r) },
        ]),
        wait(160),
      );
    } else {
      rec.do(paint(rowId(r), 'muted'), wait(160));
    }
  });

  rec.step({ title: `SELECT 완료: 정답은 같지만 행 처리 ${work}회`, codeHighlights: ALT_AT.done, ...meta('SELECT', '완료'), answer: TRUTH, isKeyframe: true });
  rec.phase('마무리', `결과는 같지만 걸러질 4행까지 미리 정렬하느라 총 ${work}번(정석은 8번) 행을 다뤘습니다.`, ALT_AT.done);
  rec.do(
    ...together([
      paint(outId(0), 'path'),
      paint(outId(1), 'path'),
      { type: 'set', id: 'status', patch: { text: `정답 2건 동일 (전체 정렬로 행 연산 ${work}회)`, tone: 'path' }, pop: true },
    ]),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: TLNO != 'NULL' 문자열 비교로 NULL 행이 섞임                      */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const kept: MemberRow[] = [];
  const meta = (clause: string, member = '-') => ({
    work,
    variables: { 절: clause, 회원: member, 통과수: kept.length },
  });

  rec.step({ title: "함정 쿼리: TLNO IS NOT NULL 대신 TLNO != 'NULL' 사용", codeHighlights: TRAP_AT.from, ...meta('FROM') });
  rec.phase('함정 시작', "SQL에서 NULL은 값이 없음을 뜻하므로 IS NOT NULL로만 걸러야 합니다. 문자열 'NULL'과 비교하거나 조건을 빠뜨린 경우를 봅니다.", TRAP_AT.from);
  rec.do({ type: 'set', id: 'status', patch: { text: "WHERE TLNO != 'NULL' 잘못된 비교 시작", tone: 'bad' }, pop: true }, wait(200));

  MEMBERS.forEach((m, r) => {
    const [id, name, gender, birth, tlno] = m;
    const month = Number(birth.slice(5, 7));
    const ok = month === 3 && gender === 'W' && tlno !== 'NULL';
    work += 1;
    if (ok) kept.push(m);

    rec.step({
      title: `WHERE 검사: ${id} ${name} → ${tlno === null && ok ? 'NULL인데 통과(함정!)' : ok ? '통과' : '제외'}`,
      codeHighlights: TRAP_AT.where,
      ...meta('WHERE', `${id}(${name})`),
    });
    rec.phase(
      '조건 확인',
      tlno === null && ok
        ? `${id} ${name}은 전화번호가 NULL인데, IS NOT NULL로 거르지 않아 결과에 잘못 포함됩니다!`
        : `${id} ${name} 행의 생월(${month}월)과 성별(${gender})을 확인합니다.`,
      TRAP_AT.where,
    );
    if (ok) {
      const slot = kept.length - 1;
      rec.do(
        ...together([
          paint(rowId(r), tlno === null ? 'bad' : 'visited'),
          { type: 'add', item: { id: outId(slot), kind: 'token', rect: outRect(slot), tone: tlno === null ? 'bad' : 'chosen', text: `${outText(m)}${tlno === null ? ' [NULL]' : ''}` }, from: rowId(r) },
        ]),
        wait(180),
      );
    } else {
      rec.do(paint(rowId(r), 'muted'), wait(160));
    }
  });

  const wrongAns = [...kept]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([id, name, gender, birth]) => [id, name, gender, birth.slice(0, 10)]);
  work += kept.length;

  rec.step({
    title: `오답: 전화번호 NULL인 M03 포함 ${wrongAns.length}건 반환 (정답은 2건)`,
    codeHighlights: TRAP_AT.done,
    ...meta('ORDER BY', '오답'),
    answer: wrongAns,
    isKeyframe: true,
  });
  rec.phase('오답 확인', '전화번호가 NULL인 박서연(M03)이 걸러지지 않아 3건이 출력되었습니다. 반드시 TLNO IS NOT NULL을 써야 합니다.', TRAP_AT.done);
  rec.do({ type: 'set', id: 'status', patch: { text: '오답: M03(박서연, TLNO=NULL) 포함 3건 반환 · 정답은 M02, M05 2건', tone: 'bad' }, pop: true });
  return rec.finish();
}

const problem: Problem = {
  id: 'march-female-members',
  title: '3월에 태어난 여성 회원 목록 출력하기',
  level: 2,
  category: 'sql-select',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/131120',
  description: {
    summary:
      'MEMBER_PROFILE 테이블에서 생일이 3월인 여성 회원의 ID, 이름, 성별, 생년월일(YYYY-MM-DD)을 조회합니다. 이때 전화번호(TLNO)가 NULL인 회원은 출력 대상에서 제외하고, 회원 ID를 기준으로 오름차순 정렬합니다.',
    rules: [
      'DATE_OF_BIRTH의 데이트 포맷이 예시(YYYY-MM-DD)와 동일해야 정답 처리됨',
      '전화번호(TLNO)가 NULL인 경우는 출력 대상에서 제외(IS NOT NULL)',
      '성별(GENDER)은 여성인 W만 조회하며 결과는 MEMBER_ID 오름차순 정렬',
    ],
    examples: [
      {
        input: 'MEMBER_PROFILE = [["M05","김민서","W","1993-03-12","010-1111-2222"], ["M03","박서연","W","1995-03-21",null], ["M02","최지우","W","1994-03-08","010-4444-5555"]]',
        output: '[["M02","최지우","W","1994-03-08"], ["M05","김민서","W","1993-03-12"]]',
      },
    ],
  },
  keyIntuitions: [
    'SQL 쿼리의 논리적 실행 순서는 FROM → WHERE → SELECT → ORDER BY입니다. WHERE에서 먼저 행을 줄여 두면 정렬할 행 수가 확 줄어듭니다.',
    '날짜에서 월만 뽑을 때는 MONTH(DATE_OF_BIRTH) = 3을 쓰고, 출력 형식은 DATE_FORMAT(DATE_OF_BIRTH, "%Y-%m-%d")로 시간 부분을 잘라냅니다.',
    'NULL 여부는 등호(=, !=)로 비교할 수 없고 반드시 IS NOT NULL로 검사해야 합니다.',
  ],
  demo: {
    input: [MEMBERS],
    label: 'MEMBER_PROFILE 6행 (3월 여성 유선 2명, 3월 여성 NULL 1명, 그 외 3명)',
  },
  workUnit: '처리한 테이블 행 수',
  approaches: [
    {
      id: 'march-female-where-first',
      name: 'WHERE 3월·여성·IS NOT NULL',
      rank: 'BEST',
      timeComplexity: 'O(N + K log K)',
      spaceComplexity: 'O(K)',
      verdict: 'WHERE 절에서 3월생·여성·전화번호 존재 여부를 한 번에 걸러 살아남은 K건만 정렬하는 정석 쿼리입니다.',
      pros: [
        '6행 중 조건을 통과한 2행만 정렬하므로 ORDER BY 비용이 최소화됩니다.',
        'MONTH(), IS NOT NULL, DATE_FORMAT() 표준 구문을 직관적으로 조합합니다.',
      ],
      cons: ['DATE_OF_BIRTH를 그대로 출력하면 시:분:초가 붙어 틀릴 수 있으므로 포맷 지정이 필요합니다.'],
      whyThisRank: 'SQL 엔진이 가장 효율적으로 최적화하는 WHERE 필터 후 ORDER BY 구조입니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'march-female-sort-subquery',
      name: '서브쿼리로 전체 정렬 후 WHERE 필터',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '인라인 뷰에서 전체 회원을 먼저 ID 순으로 정렬한 뒤 바깥에서 조건으로 거르는 풀이입니다.',
      pros: ['정렬된 상태를 먼저 눈으로 확인하며 단계별로 생각하기 쉽습니다.'],
      cons: ['조건에 맞지 않아 버려질 행까지 모두 정렬에 참여하므로 불필요한 정렬 비용이 듭니다.'],
      whyThisRank: '결과는 같지만 걸러낸 뒤 정렬하는 정석보다 다루는 행 수가 많습니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'march-female-null-string-trap',
      name: "TLNO != 'NULL' 비교 또는 NULL 조건 누락",
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N + K log K)',
      spaceComplexity: 'O(K)',
      verdict: "IS NOT NULL 대신 문자열 'NULL'과 비교하거나 조건을 빼먹어 전화번호가 없는 회원이 출력되는 함정입니다.",
      pros: ['문법 오류가 나지 않아 실행 자체는 됩니다.'],
      cons: ['전화번호가 NULL인 3월생 여성 회원(M03)이 걸러지지 않아 오답이 됩니다.'],
      whyThisRank: 'SQL 입문에서 가장 흔한 실수가 NULL을 일반 문자열이나 값처럼 비교하는 것입니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [MEMBERS], expected: TRUTH },
      {
        args: [[['A2', '김하나', 'W', '2000-03-01', '010-1234-5678'], ['A1', '이둘', 'W', '2000-03-15', null]]],
        expected: [['A2', '김하나', 'W', '2000-03-01']],
      },
      {
        args: [[['B1', '박셋', 'M', '1999-03-10', '010-9999-0000']]],
        expected: [],
      },
    ],
    random: (rand) => {
      const n = 3 + Math.floor(rand() * 5);
      const rows: MemberRow[] = Array.from({ length: n }, (_, i) => {
        const id = `M0${n - i}`;
        const name = `회원${i + 1}`;
        const gender = rand() < 0.65 ? 'W' : 'M';
        const month = rand() < 0.6 ? '03' : '07';
        const tlno = rand() < 0.7 ? `010-0000-000${i}` : null;
        return [id, name, gender, `199${i % 9}-${month}-15`, tlno];
      });
      return [rows];
    },
  },
};

export default problem;
