// 순위 검색: 정석 16가지 조합 사전 + 점수 하한 이분 탐색, 대안 정확한 조건 묶음 순회 + 이분 탐색, 함정 문의마다 전체 지원자 선형 탐색.
// 장면은 맨 위에 현재 문의와 정답 배열 6칸, 가운데 지원자 6명 칸, 아래에 조건 묶음의 정렬된 점수 배열과 이분 탐색 포인터(left, mid, right)를 둔다.
import { around, slots } from '../../engine/layout.ts';
import type { Action, Item, Problem, Scene, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';

const INFO = [
  'java backend junior pizza 150',
  'python frontend senior chicken 210',
  'python frontend senior chicken 150',
  'cpp backend senior pizza 260',
  'java backend junior chicken 80',
  'python backend senior chicken 50',
];
const QUERY = [
  'java and backend and junior and pizza 100',
  'python and frontend and senior and chicken 200',
  'cpp and - and senior and pizza 250',
  '- and backend and senior and - 150',
  '- and - and - and chicken 100',
  '- and - and - and - 150',
];

interface Applicant {
  words: [string, string, string, string];
  score: number;
  short: string;
}

const SHORT: Record<string, string> = {
  cpp: 'C++', java: 'Java', python: 'Py',
  backend: '백', frontend: '프',
  junior: '주', senior: '시',
  chicken: '치킨', pizza: '피자',
};

const APPS: Applicant[] = INFO.map((row) => {
  const [a, b, c, d, s] = row.split(' ');
  return {
    words: [a, b, c, d],
    score: Number(s),
    short: `${SHORT[a]}·${SHORT[b]}·${SHORT[c]}·${SHORT[d]}`,
  };
});

interface ParsedQuery {
  conds: [string, string, string, string];
  target: number;
  key: string;
  label: string;
}

const QUERIES: ParsedQuery[] = QUERY.map((q) => {
  const [a, b, c, rest] = q.split(' and ');
  const [d, s] = rest.split(' ');
  const conds: [string, string, string, string] = [a, b, c, d];
  return {
    conds,
    target: Number(s),
    key: conds.join(' '),
    label: `${conds.map((w) => SHORT[w] ?? '-').join(' · ')} ≥ ${s}점`,
  };
});

// 정석 사전: 지원자마다 16가지 조합 키에 점수를 넣고 오름차순 정렬
const FULL_DB = new Map<string, number[]>();
for (const app of APPS) {
  for (let mask = 0; mask < 16; mask++) {
    const key = app.words.map((w, bit) => (mask & (1 << bit) ? '-' : w)).join(' ');
    const arr = FULL_DB.get(key) ?? [];
    arr.push(app.score);
    FULL_DB.set(key, arr);
  }
}
for (const arr of FULL_DB.values()) arr.sort((a, b) => a - b);

// 대안 사전: 와일드카드 없이 지원자의 원래 조건 키 1개에만 점수를 넣고 정렬
const EXACT_DB = new Map<string, number[]>();
for (const app of APPS) {
  const key = app.words.join(' ');
  const arr = EXACT_DB.get(key) ?? [];
  arr.push(app.score);
  EXACT_DB.set(key, arr);
}
for (const arr of EXACT_DB.values()) arr.sort((a, b) => a - b);

const OPTIONS = [
  ['cpp', 'java', 'python'],
  ['backend', 'frontend'],
  ['junior', 'senior'],
  ['chicken', 'pizza'],
];

function expandKeys(conds: [string, string, string, string]): string[] {
  let keys = [''];
  conds.forEach((c, idx) => {
    const choices = c === '-' ? OPTIONS[idx] : [c];
    keys = keys.flatMap((prefix) => choices.map((ch) => (prefix ? `${prefix} ${ch}` : ch)));
  });
  return keys;
}

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST_CODE = {
  python: `from collections import defaultdict
from bisect import bisect_left

def solution(info, query):
    db = defaultdict(list)
    for row in info:
        *words, score = row.split()
        score = int(score)
        # 4가지 조건마다 '그대로' 또는 '-'로 바꾼 16가지 조합에 점수 저장
        for mask in range(16):
            key = ' '.join('-' if mask & (1 << i) else words[i] for i in range(4))
            db[key].append(score)

    for scores in db.values():
        scores.sort()

    answer = []
    for q in query:
        a, b, c, rest = q.split(' and ')
        d, target = rest.split()
        scores = db[f'{a} {b} {c} {d}']
        # target 이상이 처음 나오는 위치(하한)를 이분 탐색
        idx = bisect_left(scores, int(target))
        answer.append(len(scores) - idx)
    return answer`,
  javascript: `function solution(info, query) {
  const db = new Map();
  for (const row of info) {
    const parts = row.split(' ');
    const score = Number(parts.pop());
    // 4가지 조건마다 '그대로' 또는 '-'로 바꾼 16가지 조합에 점수 저장
    for (let mask = 0; mask < 16; mask++) {
      const key = parts.map((w, i) => (mask & (1 << i) ? '-' : w)).join(' ');
      if (!db.has(key)) db.set(key, []);
      db.get(key).push(score);
    }
  }
  for (const scores of db.values()) scores.sort((a, b) => a - b);

  return query.map((q) => {
    const [a, b, c, rest] = q.split(' and ');
    const [d, targetStr] = rest.split(' ');
    const scores = db.get(\`\${a} \${b} \${c} \${d}\`) ?? [];
    const target = Number(targetStr);
    // target 이상이 처음 나오는 위치(하한)를 이분 탐색
    let left = 0, right = scores.length;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (scores[mid] >= target) right = mid;
      else left = mid + 1;
    }
    return scores.length - left;
  });
}`,
};
const BEST_AT = {
  build: lines(BEST_CODE,
    ['db = defaultdict(list)', 'for mask in range(16)', 'db[key].append(score)', 'scores.sort()'],
    ['const db = new Map()', 'for (let mask = 0; mask < 16; mask++)', 'db.get(key).push(score)', 'scores.sort((a, b) => a - b)']),
  lookup: lines(BEST_CODE,
    ['for q in query:', 'scores = db['],
    ['return query.map((q) =>', 'const scores = db.get(']),
  search: lines(BEST_CODE,
    ['idx = bisect_left(scores, int(target))'],
    ['let left = 0, right = scores.length', 'while (left < right)', 'const mid = (left + right) >> 1', 'if (scores[mid] >= target)']),
  append: lines(BEST_CODE,
    ['answer.append(len(scores) - idx)'],
    ['return scores.length - left']),
  done: lines(BEST_CODE, ['return answer'], ['return scores.length - left']),
};

const ALT_CODE = {
  python: `from collections import defaultdict
from bisect import bisect_left

OPTIONS = [['cpp', 'java', 'python'], ['backend', 'frontend'], ['junior', 'senior'], ['chicken', 'pizza']]

def solution(info, query):
    db = defaultdict(list)
    for row in info:
        *words, score = row.split()
        db[' '.join(words)].append(int(score))  # 원래 조건 1개에만 저장
    for scores in db.values():
        scores.sort()

    answer = []
    for q in query:
        a, b, c, rest = q.split(' and ')
        d, target = rest.split()
        conds, target = [a, b, c, d], int(target)
        # '-' 자리에 가능한 선택지를 모두 펼쳐 각 묶음에서 하한 탐색
        keys = ['']
        for i, cond in enumerate(conds):
            choices = OPTIONS[i] if cond == '-' else [cond]
            keys = [f'{p} {ch}'.strip() for p in keys for ch in choices]
        total = sum(len(db[k]) - bisect_left(db[k], target) for k in keys if k in db)
        answer.append(total)
    return answer`,
  javascript: `const OPTIONS = [['cpp', 'java', 'python'], ['backend', 'frontend'], ['junior', 'senior'], ['chicken', 'pizza']];

function solution(info, query) {
  const db = new Map();
  for (const row of info) {
    const parts = row.split(' ');
    const score = Number(parts.pop());
    const key = parts.join(' '); // 원래 조건 1개에만 저장
    if (!db.has(key)) db.set(key, []);
    db.get(key).push(score);
  }
  for (const scores of db.values()) scores.sort((a, b) => a - b);

  return query.map((q) => {
    const [a, b, c, rest] = q.split(' and ');
    const [d, targetStr] = rest.split(' ');
    const conds = [a, b, c, d];
    const target = Number(targetStr);
    // '-' 자리에 가능한 선택지를 모두 펼쳐 각 묶음에서 하한 탐색
    let keys = [''];
    conds.forEach((cond, i) => {
      const choices = cond === '-' ? OPTIONS[i] : [cond];
      keys = keys.flatMap((p) => choices.map((ch) => (p ? \`\${p} \${ch}\` : ch)));
    });
    let total = 0;
    for (const k of keys) {
      const scores = db.get(k);
      if (!scores) continue;
      let left = 0, right = scores.length;
      while (left < right) {
        const mid = (left + right) >> 1;
        if (scores[mid] >= target) right = mid;
        else left = mid + 1;
      }
      total += scores.length - left;
    }
    return total;
  });
}`,
};
const ALT_AT = {
  build: lines(ALT_CODE,
    ['db = defaultdict(list)', "db[' '.join(words)].append", 'scores.sort()'],
    ['const db = new Map()', 'const key = parts.join', 'scores.sort((a, b) => a - b)']),
  expand: lines(ALT_CODE,
    ['for q in query:', 'choices = OPTIONS[i]', 'keys = ['],
    ['return query.map((q) =>', 'const choices = cond ===', 'keys = keys.flatMap']),
  search: lines(ALT_CODE,
    ['total = sum(len(db[k]) - bisect_left'],
    ['for (const k of keys)', 'while (left < right)', 'total += scores.length - left']),
  append: lines(ALT_CODE,
    ['answer.append(total)'],
    ['return total;']),
  done: lines(ALT_CODE, ['return answer'], ['return total;']),
};

const TRAP_CODE = {
  python: `def solution(info, query):
    parsed = []
    for row in info:
        *words, score = row.split()
        parsed.append((words, int(score)))

    answer = []
    for q in query:  # 문의마다 지원자 전체를 처음부터 끝까지 확인
        a, b, c, rest = q.split(' and ')
        d, target = rest.split()
        conds, target = [a, b, c, d], int(target)
        count = 0
        for words, score in parsed:
            if score >= target and all(c == '-' or c == w for c, w in zip(conds, words)):
                count += 1
        answer.append(count)
    return answer`,
  javascript: `function solution(info, query) {
  const parsed = info.map((row) => {
    const parts = row.split(' ');
    const score = Number(parts.pop());
    return { words: parts, score };
  });

  return query.map((q) => { // 문의마다 지원자 전체를 처음부터 끝까지 확인
    const [a, b, c, rest] = q.split(' and ');
    const [d, targetStr] = rest.split(' ');
    const conds = [a, b, c, d];
    const target = Number(targetStr);
    let count = 0;
    for (const { words, score } of parsed) {
      if (score >= target && conds.every((c, i) => c === '-' || c === words[i])) {
        count++;
      }
    }
    return count;
  });
}`,
};
const TRAP_AT = {
  start: lines(TRAP_CODE,
    ['parsed = []', 'parsed.append((words, int(score)))'],
    ['const parsed = info.map', 'return { words: parts, score }']),
  scan: lines(TRAP_CODE,
    ['for q in query:', 'for words, score in parsed:', 'if score >= target and all('],
    ['return query.map((q) =>', 'for (const { words, score } of parsed)', 'if (score >= target && conds.every']),
  append: lines(TRAP_CODE,
    ['answer.append(count)'],
    ['return count;']),
  done: lines(TRAP_CODE, ['return answer'], ['return count;']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 620;
const H = 336;
const appSlot = slots({ x: 22, y: 88, w: 90, h: 54, gap: 8 });
const scoreSlot = slots({ x: 88, y: 214, w: 68, h: 52, gap: 10 });
const ansSlot = slots({ x: 320, y: 12, w: 44, h: 42, gap: 6 });
const ptrSlot = slots({ x: 88, y: 180, w: 68, h: 26, gap: 10 });

const appId = (i: number) => `app:${i}`;
const ansId = (i: number) => `ans:${i}`;
const scoreId = (i: number) => `score:${i}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'q:title', kind: 'text', rect: { x: 22, y: 10, w: 72, h: 20 }, tone: 'muted', text: '현재 문의' },
    { id: 'q:box', kind: 'token', rect: { x: 22, y: 30, w: 280, h: 28 }, tone: 'plain', text: '대기 중' },
    { id: 'ans:title', kind: 'text', rect: { x: 320, y: 0, w: 120, h: 12 }, tone: 'muted', text: '문의별 정답' },
    { id: 'app:title', kind: 'text', rect: { x: 22, y: 66, w: 220, h: 18 }, tone: 'muted', text: '지원자 6명 (조건 · 점수)' },
    { id: 'score:title', kind: 'text', rect: { x: 22, y: 154, w: 576, h: 20 }, tone: 'muted', text: '조건 묶음의 정렬된 점수 배열' },
    { id: 'score:zone', kind: 'zone', rect: { x: 76, y: 206, w: 482, h: 68 } },
  ];
  QUERIES.forEach((_, i) => {
    items.push({ id: ansId(i), kind: 'cell', rect: ansSlot(i), tone: 'plain', text: '?' });
  });
  APPS.forEach((app, i) => {
    items.push({ id: appId(i), kind: 'cell', rect: appSlot(i), tone: 'plain', text: String(app.score), sub: app.short });
  });
  return { width: W, height: H, items };
}

const put = (rec: StepRecorder, { id, kind, ...patch }: Item): Action =>
  rec.has(id) ? { type: 'set', id, patch } : { type: 'add', item: { id, kind, ...patch } };

function setScores(rec: StepRecorder, scores: number[], label: string): Action[] {
  const acts: Action[] = [{ type: 'set', id: 'score:title', patch: { text: label } }];
  for (let i = 0; i < 6; i++) {
    const id = scoreId(i);
    if (i < scores.length) {
      acts.push(put(rec, { id, kind: 'cell', rect: scoreSlot(i), tone: 'plain', text: String(scores[i]), tag: `[${i}]` }));
    } else if (rec.has(id)) {
      acts.push({ type: 'remove', id });
    }
  }
  return acts;
}

function clearPointers(rec: StepRecorder): Action[] {
  return ['ptr:left', 'ptr:mid', 'ptr:right', 'bound:ring']
    .filter((id) => rec.has(id))
    .map((id): Action => ({ type: 'remove', id }));
}

/* ------------------------------------------------------------------ */
/* 정석: 16가지 조합 사전 + 점수 하한 찾기                                */
/* ------------------------------------------------------------------ */

function bestViz(): Visualization {
  const rec = new StepRecorder(board());
  const answer: number[] = [];
  let work = 0;

  rec.step({
    title: '지원자 6명을 16가지 조합 사전에 넣고 점수순 정렬',
    codeHighlights: BEST_AT.build,
    work,
    variables: { '지원자 수': APPS.length, '사전 키 수': FULL_DB.size, answer: '[]' },
  });
  rec.phase('사전 만들기', '지원자마다 4가지 조건을 그대로 두거나 "-"로 바꾼 16가지 키에 점수를 넣고, 키마다 오름차순으로 정렬해 둡니다.', BEST_AT.build);
  rec.do(...together([
    ...APPS.map((_, i): Action => ({ type: 'set', id: appId(i), patch: { tone: 'visited' } })),
    ...setScores(rec, FULL_DB.get('- - - -')!, '예: "- - - -" 묶음의 정렬된 점수 [50, 80, 150, 150, 210, 260]'),
  ]));

  QUERIES.forEach((q, qi) => {
    const scores = FULL_DB.get(q.key) ?? [];
    let left = 0;
    let right = scores.length;
    const history: { l: number; r: number; mid: number; val: number; ge: boolean }[] = [];
    while (left < right) {
      const mid = (left + right) >> 1;
      const ge = scores[mid] >= q.target;
      history.push({ l: left, r: right, mid, val: scores[mid], ge });
      if (ge) right = mid;
      else left = mid + 1;
    }
    const count = scores.length - left;

    // 1단계: 조건 묶음 꺼내기 + 첫 가운데 비교
    const first = history[0];
    work += 1;
    rec.step({
      title: `문의 ${qi + 1}: "${q.label}" 묶음 조회`,
      codeHighlights: BEST_AT.lookup,
      work,
      variables: { 문의: `${qi + 1}번`, key: q.key, scores: `[${scores.join(', ')}]`, target: q.target },
    });
    rec.phase('묶음 찾기', `사전에서 "${q.key}" 묶음을 바로 꺼내면 정렬된 점수 [${scores.join(', ')}]가 나옵니다.`, BEST_AT.lookup);
    rec.do(...together([
      ...clearPointers(rec),
      { type: 'set', id: 'q:box', patch: { text: `Q${qi + 1}. ${q.label}`, tone: 'current' } },
      ...setScores(rec, scores, `"${q.key}" 묶음 (${scores.length}명) — ${q.target}점 이상 하한 찾기`),
    ]));

    rec.phase('하한 탐색', `left = 0, right = ${scores.length}에서 mid = ${first.mid}번 칸(${first.val}점)을 확인합니다. ${first.val} ${first.ge ? '≥' : '<'} ${q.target}이므로 ${first.ge ? `right = ${first.mid}` : `left = ${first.mid + 1}`}로 줄입니다.`, BEST_AT.search);
    rec.do(...together([
      put(rec, { id: 'ptr:mid', kind: 'token', rect: ptrSlot(first.mid), tone: 'current', text: `mid ${first.mid}` }),
      { type: 'set', id: scoreId(first.mid), patch: { tone: first.ge ? 'good' : 'bad' } },
    ]));

    // 남은 이분 탐색 단계가 있으면 이어서 보여 주고 하한 확정
    work += history.length - 1;
    answer.push(count);
    rec.step({
      title: `문의 ${qi + 1} 하한 확정 → idx = ${left}, ${count}명`,
      codeHighlights: BEST_AT.append,
      work,
      variables: { 문의: `${qi + 1}번`, lowerBound: left, '통과 인원': `${count}명`, answer: `[${answer.join(', ')}]` },
    });
    if (history.length > 1) {
      const rest = history.slice(1);
      const summary = rest.map((h) => `mid=${h.mid}(${h.val}점 ${h.ge ? '≥' : '<'} ${q.target})`).join(' → ');
      const lastH = rest.at(-1)!;
      rec.phase('가운데 좁히기', `${summary} 순서로 범위를 좁혀 하한 위치 idx = ${ro(left)} 찾았습니다.`, BEST_AT.search);
      rec.do(...together([
        put(rec, { id: 'ptr:mid', kind: 'token', rect: ptrSlot(lastH.mid), tone: 'current', text: `mid ${lastH.mid}` }),
        ...scores.map((v, idx): Action => ({
          type: 'set',
          id: scoreId(idx),
          patch: { tone: v >= q.target ? 'good' : 'muted' },
        })),
      ]));
    } else {
      rec.phase('하한 확정', `원소가 1개뿐이어서 하한 위치가 idx = ${ro(left)} 바로 정해집니다.`, BEST_AT.search);
      rec.do(...together(scores.map((v, idx): Action => ({
        type: 'set',
        id: scoreId(idx),
        patch: { tone: v >= q.target ? 'good' : 'muted' },
      }))));
    }

    const ringActions: Action[] = [];
    if (count > 0) {
      const a = scoreSlot(left);
      const b = scoreSlot(scores.length - 1);
      ringActions.push(put(rec, {
        id: 'bound:ring',
        kind: 'ring',
        rect: around({ x: a.x, y: a.y, w: b.x + b.w - a.x, h: a.h }, 4),
        tone: 'good',
      }));
    }
    rec.phase('개수 세기', `전체 ${scores.length}명에서 하한 인덱스 ${josa(left, '을', '를')} 빼면 ${scores.length} - ${left} = ${count}명입니다.`, BEST_AT.append);
    rec.do(...together([
      ...ringActions,
      { type: 'set', id: ansId(qi), patch: { text: String(count), tone: 'path' }, pop: true },
    ]));
  });

  rec.step({
    title: `모든 문의 완료 → [${answer.join(', ')}]`,
    codeHighlights: BEST_AT.done,
    work,
    variables: { '총 탐색 횟수': work, answer: `[${answer.join(', ')}]` },
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `문의 6개를 모두 조건 묶음 1번 조회와 이분 탐색으로 처리해 총 ${work}번의 점수 확인으로 [${answer.join(', ')}]을 구했습니다.`, BEST_AT.done);
  rec.do(...together([
    ...clearPointers(rec),
    { type: 'set', id: 'q:box', patch: { text: '완료', tone: 'path' } },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 와일드카드 없는 묶음 순회 + 점수 하한 찾기                       */
/* ------------------------------------------------------------------ */

function altViz(): Visualization {
  const rec = new StepRecorder(board());
  const answer: number[] = [];
  let work = 0;

  rec.step({
    title: '지원자 6명을 원래 조건 키 1개에만 저장하고 정렬',
    codeHighlights: ALT_AT.build,
    work,
    variables: { '지원자 수': APPS.length, '사전 키 수': EXACT_DB.size, answer: '[]' },
  });
  rec.phase('사전 만들기', '지원자를 넣을 때는 "-" 없이 원래 조건 키 1개에만 점수를 넣습니다. 저장은 간단하지만 문의에 "-"가 있으면 여러 묶음을 뒤져야 합니다.', ALT_AT.build);
  rec.do(...together(APPS.map((_, i): Action => ({ type: 'set', id: appId(i), patch: { tone: 'visited' } }))));

  QUERIES.forEach((q, qi) => {
    const keys = expandKeys(q.conds);
    let total = 0;
    let checks = 0;
    const hitScores: number[] = [];
    for (const k of keys) {
      const scores = EXACT_DB.get(k);
      if (!scores) continue;
      checks += 1; // 실제 지원자가 있는 묶음 조회
      let l = 0;
      let r = scores.length;
      while (l < r) {
        const m = (l + r) >> 1;
        checks += 1;
        if (scores[m] >= q.target) r = m;
        else l = m + 1;
      }
      total += scores.length - l;
      hitScores.push(...scores);
    }
    work += checks;
    answer.push(total);

    rec.step({
      title: `문의 ${qi + 1}: 후보 키 ${keys.length}개 펼치기 → ${total}명`,
      codeHighlights: ALT_AT.search,
      work,
      variables: { 문의: `${qi + 1}번`, '펼친 키 수': keys.length, '이번 확인 횟수': checks, '통과 인원': `${total}명`, answer: `[${answer.join(', ')}]` },
    });
    rec.phase('조건 펼치기', `"${q.label}"의 "-" 자리에 가능한 선택지를 모두 펼치면 후보 키가 ${keys.length}개 됩니다.`, ALT_AT.expand);
    rec.do(...together([
      ...clearPointers(rec),
      { type: 'set', id: 'q:box', patch: { text: `Q${qi + 1}. ${q.label}`, tone: 'current' } },
      ...setScores(rec, hitScores, `펼친 키 ${keys.length}개에서 찾은 점수들 (${hitScores.length}명)`),
    ]));

    rec.phase('묶음마다 하한 탐색', `후보 키 ${keys.length}개를 돌며 각 묶음에서 ${q.target}점 이상을 이분 탐색해 모두 더하면 ${total}명입니다 (확인 ${checks}회).`, ALT_AT.search);
    rec.do(...together([
      ...hitScores.map((v, idx): Action => ({
        type: 'set',
        id: scoreId(idx),
        patch: { tone: v >= q.target ? 'good' : 'muted' },
      })),
      { type: 'set', id: ansId(qi), patch: { text: String(total), tone: 'path' }, pop: true },
    ]));
  });

  rec.step({
    title: `모든 문의 완료 → [${answer.join(', ')}]`,
    codeHighlights: ALT_AT.done,
    work,
    variables: { '총 확인 횟수': work, answer: `[${answer.join(', ')}]` },
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `답은 [${answer.join(', ')}]로 같지만, "-"가 섞인 문의마다 최대 24개 묶음을 따로 확인해 정석보다 훨씬 많은 ${work}번을 확인했습니다.`, ALT_AT.done);
  rec.do({ type: 'set', id: 'q:box', patch: { text: '완료', tone: 'path' } });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: 문의마다 지원자 전체를 처음부터 훑기                            */
/* ------------------------------------------------------------------ */

function trapViz(): Visualization {
  const rec = new StepRecorder(board());
  const answer: number[] = [];
  let work = 0;

  rec.step({
    title: '지원자 6명을 정렬 없이 그대로 배열에 보관',
    codeHighlights: TRAP_AT.start,
    work,
    variables: { '지원자 수': APPS.length, '문의 수': QUERIES.length, answer: '[]' },
  });
  rec.phase('준비', '사전이나 정렬을 만들지 않고 지원자 6명을 순서대로 배열에 넣어 둡니다.', TRAP_AT.start);
  rec.do({ type: 'set', id: 'score:title', patch: { text: '정렬된 점수 배열을 쓰지 않고 위의 지원자 6명을 매번 처음부터 훑습니다' } });

  QUERIES.forEach((q, qi) => {
    const matches = APPS.map((app) =>
      app.score >= q.target && q.conds.every((c, idx) => c === '-' || c === app.words[idx]),
    );
    const count = matches.filter(Boolean).length;
    work += APPS.length;
    answer.push(count);

    rec.step({
      title: `문의 ${qi + 1}: 지원자 6명 전수 조사 → ${count}명`,
      codeHighlights: TRAP_AT.scan,
      work,
      variables: { 문의: `${qi + 1}번`, '확인한 지원자': `${APPS.length}명`, '통과 인원': `${count}명`, answer: `[${answer.join(', ')}]` },
    });
    rec.phase('전수 조사', `문의 "${q.label}"에 맞는지 지원자 6명을 처음부터 끝까지 모두 확인합니다.`, TRAP_AT.scan);
    rec.do(...together([
      { type: 'set', id: 'q:box', patch: { text: `Q${qi + 1}. ${q.label}`, tone: 'current' } },
      { type: 'focus', ids: APPS.map((_, i) => appId(i)) },
      ...APPS.map((_, i): Action => ({
        type: 'set',
        id: appId(i),
        patch: { tone: matches[i] ? 'good' : 'bad' },
      })),
    ]));

    rec.phase('개수 기록', `6명 중 조건과 점수를 모두 만족하는 지원자는 ${count}명입니다.`, TRAP_AT.append);
    rec.do(...together([
      { type: 'unfocus' },
      { type: 'set', id: ansId(qi), patch: { text: String(count), tone: 'path' }, pop: true },
    ]));
  });

  rec.step({
    title: `전수 조사 완료 → [${answer.join(', ')}] (지원자×문의 시간 초과)`,
    codeHighlights: TRAP_AT.done,
    work,
    variables: { '총 확인 횟수': work, '최악 연산 수': '50,000 × 100,000 = 50억', answer: `[${answer.join(', ')}]` },
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `답은 [${answer.join(', ')}]로 같지만 6×6 = ${work}번을 확인했습니다. 지원자 5만 명, 문의 10만 개이면 50억 번 비교해 시간 초과가 납니다.`, TRAP_AT.done);
  rec.do(...together([
    { type: 'set', id: 'q:box', patch: { text: '시간 초과 위험', tone: 'bad' } },
    ...APPS.map((_, i): Action => ({ type: 'set', id: appId(i), patch: { tone: 'plain' } })),
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'rank-search',
  title: '순위 검색',
  level: 2,
  category: 'binary-search',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/72412',
  description: {
    summary:
      '지원서마다 개발 언어, 직군, 경력, 소울푸드 4가지 조건과 코딩테스트 점수가 적혀 있습니다. 개발팀의 문의마다 조건(상관없음 "-" 포함)을 만족하면서 기준 점수 이상을 받은 지원자가 몇 명인지 구합니다.',
    rules: [
      'info 배열의 크기는 1 이상 50,000 이하입니다.',
      '각 지원서는 "언어 직군 경력 소울푸드 점수" 형식이며 점수는 1 이상 100,000 이하입니다.',
      'query 배열의 크기는 1 이상 100,000 이하입니다.',
      '문의 조건에서 "-"는 해당 항목을 고려하지 않겠다는 뜻입니다.',
    ],
    examples: [
      {
        input: 'info = ["java backend junior pizza 150", ...6명], query = ["java and backend and junior and pizza 100", ...6개]',
        output: '[1, 1, 1, 1, 2, 4]',
      },
    ],
  },
  keyIntuitions: [
    '문의가 최대 10만 개, 지원자가 최대 5만 명이라 문의마다 지원자를 훑으면 50억 번 비교로 시간 초과가 납니다.',
    '지원자 한 명이 속할 수 있는 조건 조합(각 항목을 그대로 두거나 "-"로 바꾼 경우)은 2⁴ = 16가지뿐이므로 미리 사전에 모아 둘 수 있습니다.',
    '각 조건 묶음의 점수 배열을 오름차순으로 정렬해 두면, 기준 점수 이상이 처음 나오는 위치(하한, lower bound)를 이분 탐색으로 한 번에 찾습니다.',
  ],
  demo: {
    input: [INFO, QUERY],
    label: '지원자 6명, 문의 6개 (원문 예제)',
  },
  workUnit: '점수·지원자 확인 횟수',
  approaches: [
    {
      id: 'rank-search-lower-bound',
      name: '점수 하한 찾기 (16가지 조합 사전 + 이분 탐색)',
      rank: 'BEST',
      timeComplexity: 'O(N log N + Q log N)',
      spaceComplexity: 'O(N)',
      verdict: '지원자마다 16가지 조합 키에 점수를 넣고 정렬해 두어, 문의마다 단 한 번의 하한 이분 탐색으로 답을 구합니다.',
      pros: [
        '문의에 "-"가 몇 개 들어 있든 사전에서 키 하나만 찾으면 바로 정렬된 점수 배열이 나옵니다.',
        '문의당 이분 탐색 한 번(최대 16번 비교)으로 끝나 문의 10만 개도 순식간에 처리합니다.',
      ],
      cons: [
        '지원자 한 명당 16개 키에 점수를 넣으므로 메모리를 16배(최대 80만 개 정수) 씁니다.',
        '정렬을 문의 처리 전에 한 번에 해 두어야지, 넣을 때마다 정렬하면 시간 초과가 납니다.',
      ],
      whyThisRank:
        '조건 항목이 4개뿐이라 와일드카드 조합이 16가지로 고정됩니다. 전처리에서 16가지 키에 미리 넣어 두면 문의마다 하한 이분 탐색 한 번으로 끝납니다.',
      code: BEST_CODE,
      visualize: bestViz,
    },
    {
      id: 'rank-search-exact-buckets',
      name: '와일드카드 없는 묶음 순회 + 점수 하한 찾기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log N + 24 Q log N)',
      spaceComplexity: 'O(N)',
      verdict: '지원자는 원래 조건 키 1개에만 저장하고, 문의할 때 "-"를 모든 선택지로 펼쳐 각 묶음에서 하한을 찾습니다.',
      pros: [
        '지원자 한 명당 점수를 딱 한 번만 저장해 메모리를 아낍니다.',
        '전처리 단계가 단순하고 빠릅니다.',
      ],
      cons: [
        '"- and - and - and -" 문의가 들어오면 3×2×2×2 = 24개 묶음을 일일이 돌며 이분 탐색을 최대 24번 반복합니다.',
        '문의 수가 10만 개로 커서 정석보다 탐색 연산이 수십 배 더 듭니다.',
      ],
      whyThisRank:
        '이분 탐색으로 통과는 하지만, 지원자 수(5만)보다 문의 수(10만)가 더 많은 문제 특성상 문의할 때마다 키를 펼치면 정석보다 손해를 봅니다.',
      code: ALT_CODE,
      visualize: altViz,
    },
    {
      id: 'rank-search-linear',
      name: '문의마다 지원자 전체를 처음부터 훑기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(Q × N)',
      spaceComplexity: 'O(N)',
      verdict: '문의가 들어올 때마다 지원자 배열 전체를 처음부터 끝까지 돌며 조건과 점수를 비교합니다.',
      pros: ['사전이나 이분 탐색 없이 조건문 하나로 바로 작성할 수 있습니다.'],
      cons: [
        '지원자 5만 명 × 문의 10만 개 = 최대 50억 번 확인해야 해서 효율성 테스트를 하나도 통과하지 못합니다.',
        '똑같은 조건 조합의 문의를 여러 번 물어도 매번 처음부터 다시 셉니다.',
      ],
      whyThisRank:
        '정확성 테스트는 통과하지만 효율성 테스트에서 시간 초과가 나는 대표적인 함정입니다. 조건별 묶음과 점수 정렬을 해 두어야 이분 탐색을 쓸 수 있습니다.',
      code: TRAP_CODE,
      visualize: trapViz,
    },
  ],
  checks: {
    cases: [
      { args: [INFO, QUERY], expected: [1, 1, 1, 1, 2, 4] },
      {
        args: [
          ['cpp backend junior pizza 100'],
          ['cpp and backend and junior and pizza 100', 'cpp and backend and junior and pizza 101', '- and - and - and - 50'],
        ],
        expected: [1, 0, 1],
      },
      {
        args: [
          ['java frontend senior chicken 200', 'java frontend senior chicken 200', 'java frontend senior chicken 199'],
          ['java and frontend and senior and chicken 200', '- and - and - and - 300'],
        ],
        expected: [2, 0],
      },
    ],
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 6);
      const qCount = 2 + Math.floor(rand() * 5);
      const pick = (arr: string[]) => arr[Math.floor(rand() * arr.length)];
      const info = Array.from({ length: n }, () => {
        const w = OPTIONS.map(pick);
        const s = 10 * (1 + Math.floor(rand() * 30));
        return `${w.join(' ')} ${s}`;
      });
      const query = Array.from({ length: qCount }, () => {
        const w = OPTIONS.map((opts) => (rand() < 0.4 ? '-' : pick(opts)));
        const s = 10 * (1 + Math.floor(rand() * 30));
        return `${w[0]} and ${w[1]} and ${w[2]} and ${w[3]} ${s}`;
      });
      return [info, query];
    },
  },
};

export default problem;
