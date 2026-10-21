// 튜플: 정석 집합을 길이순으로 정렬 + Set으로 새 원소 찾기, 대안 길이순 정렬 + 배열을 처음부터 훑어 중복 확인, 함정 길이순 정렬 없이 등장 순서대로 담기를 같은 장면에서 움직인다.
// 장면은 위에 집합 카드 5개(길이순으로 미끄러져 자리를 바꿈), 아래에 완성되어 가는 튜플 줄(Lane)과 결과 표시다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { slots } from '../../engine/layout.ts';
import type { Action, AlgorithmStep, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

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
  override phase(label: string, caption: string, codeHighlights?: Record<Language, number[]>): void {
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

// 시각화 입력. 정석과 대안은 [3, 2, 4, 1, 5], 길이순 정렬 없이 앞에서부터 담는 함정은 [4, 2, 3, 1, 5]가 나온다.
const S = '{{4,2,3},{3},{2,3,4,1},{2,3},{2,3,4,1,5}}';
const GROUPS: number[][] = S.slice(2, -2).split('},{').map((g) => g.split(',').map(Number));
const N = GROUPS.length;
const ORDER = GROUPS.map((_, i) => i).sort((a, b) => GROUPS[a].length - GROUPS[b].length);
const SORTED_GROUPS = ORDER.map((i) => GROUPS[i]);
const TRUTH = [3, 2, 4, 1, 5];
const TRAP_ANS = [4, 2, 3, 1, 5];
const fmtSet = (xs: number[]) => `{${xs.join(',')}}`;
const list = (xs: number[]) => `[${xs.join(', ')}]`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const LENGTH_SET = {
  python: `def solution(s):
    groups = [list(map(int, g.split(','))) for g in s[2:-2].split('},{')]
    groups.sort(key=len)             # 원소 개수가 적은 집합부터 길이순 정렬
    seen = set()
    answer = []
    for g in groups:
        for x in g:
            if x not in seen:        # 해시 집합으로 O(1)에 새 원소 확인
                seen.add(x)
                answer.append(x)
                break
    return answer`,
  javascript: `function solution(s) {
  const groups = s.slice(2, -2).split('},{').map((g) => g.split(',').map(Number));
  groups.sort((a, b) => a.length - b.length); // 원소 개수가 적은 집합부터 길이순 정렬
  const seen = new Set();
  const answer = [];
  for (const g of groups) {
    for (const x of g) {
      if (!seen.has(x)) { // 해시 집합으로 O(1)에 새 원소 확인
        seen.add(x);
        answer.push(x);
        break;
      }
    }
  }
  return answer;
}`,
};
const SET_AT = {
  parse: lines(LENGTH_SET, ["groups = [list(map(int, g.split(',')))"], ["const groups = s.slice(2, -2).split('},{')"]),
  sort: lines(LENGTH_SET, ['groups.sort(key=len)', 'seen = set()', 'answer = []'], ['groups.sort((a, b) => a.length - b.length)', 'const seen = new Set()', 'const answer = []']),
  scan: lines(LENGTH_SET, ['for g in groups:', 'for x in g:', 'if x not in seen:'], ['for (const g of groups)', 'for (const x of g)', 'if (!seen.has(x))']),
  add: lines(LENGTH_SET, ['seen.add(x)', 'answer.append(x)', 'break'], ['seen.add(x)', 'answer.push(x)', 'break']),
  done: lines(LENGTH_SET, ['return answer'], ['return answer']),
};

const LENGTH_LIST_SCAN = {
  python: `def solution(s):
    groups = [list(map(int, g.split(','))) for g in s[2:-2].split('},{')]
    groups.sort(key=len)
    answer = []
    for g in groups:
        for x in g:
            # Set 없이 매번 answer 배열을 처음부터 끝까지 훑어 중복을 확인한다
            if x not in answer:
                answer.append(x)
    return answer`,
  javascript: `function solution(s) {
  const groups = s.slice(2, -2).split('},{').map((g) => g.split(',').map(Number));
  groups.sort((a, b) => a.length - b.length);
  const answer = [];
  for (const g of groups) {
    for (const x of g) {
      // Set 없이 매번 answer 배열을 처음부터 끝까지 훑어 중복을 확인합니다
      if (!answer.includes(x)) {
        answer.push(x);
      }
    }
  }
  return answer;
}`,
};
const LIST_AT = {
  parse: lines(LENGTH_LIST_SCAN, ["groups = [list(map(int, g.split(',')))"], ["const groups = s.slice(2, -2).split('},{')"]),
  sort: lines(LENGTH_LIST_SCAN, ['groups.sort(key=len)', 'answer = []'], ['groups.sort((a, b) => a.length - b.length)', 'const answer = []']),
  scan: lines(LENGTH_LIST_SCAN, ['for g in groups:', 'for x in g:', 'if x not in answer:'], ['for (const g of groups)', 'for (const x of g)', 'if (!answer.includes(x))']),
  add: lines(LENGTH_LIST_SCAN, ['answer.append(x)'], ['answer.push(x)']),
  done: lines(LENGTH_LIST_SCAN, ['return answer'], ['return answer']),
};

const NO_SORT_TRAP = {
  python: `def solution(s):
    groups = [list(map(int, g.split(','))) for g in s[2:-2].split('},{')]
    # 함정: 집합들을 길이순으로 정렬하지 않고 문자열에 적힌 순서대로 본다
    answer = []
    for g in groups:
        for x in g:
            if x not in answer:
                answer.append(x)
    return answer`,
  javascript: `function solution(s) {
  const groups = s.slice(2, -2).split('},{').map((g) => g.split(',').map(Number));
  // 함정: 집합들을 길이순으로 정렬하지 않고 문자열에 적힌 순서대로 봅니다
  const answer = [];
  for (const g of groups) {
    for (const x of g) {
      if (!answer.includes(x)) answer.push(x);
    }
  }
  return answer;
}`,
};
const TRAP_AT = {
  parse: lines(NO_SORT_TRAP, ["groups = [list(map(int, g.split(',')))"], ["const groups = s.slice(2, -2).split('},{')"]),
  scan: lines(NO_SORT_TRAP, ['for g in groups:', 'for x in g:', 'if x not in answer:'], ['for (const g of groups)', 'for (const x of g)', 'if (!answer.includes(x))']),
  add: lines(NO_SORT_TRAP, ['answer.append(x)'], ['answer.push(x)']),
  done: lines(NO_SORT_TRAP, ['return answer'], ['return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 620;
const H = 236;
const groupSlot = slots({ x: 76, y: 36, w: 100, h: 52, gap: 6 });
const LANE: LaneOptions = { id: 'tup', x: 76, y: 120, slotW: 62, slotH: 40, gap: 8, max: N };
const grpId = (k: number) => `g:${k}`;
const sGrp = (s: number) => grpId(ORDER[s]);
const ANS_RECT: Rect = { x: 76, y: 184, w: 230, h: 32 };
const TRUTH_RECT: Rect = { x: 318, y: 184, w: 230, h: 32 };

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

function board(): Scene {
  const items: Item[] = [
    { id: 'lab:grp', kind: 'text', rect: { x: 6, y: 36, w: 64, h: 52 }, text: '집합들' },
    { id: 'lab:tup', kind: 'text', rect: { x: 6, y: 120, w: 64, h: 40 }, text: '튜플' },
    { id: 'tup:bg', kind: 'zone', rect: { x: 70, y: 114, w: N * 70 + 4, h: 52 } },
    { id: 'lab:ans', kind: 'text', rect: { x: 6, y: 184, w: 64, h: 32 }, text: '결과' },
    { id: 'tok:ans', kind: 'token', rect: ANS_RECT, tone: 'plain', text: '추출 전' },
  ];
  GROUPS.forEach((g, k) => items.push({ id: grpId(k), kind: 'cell', rect: groupSlot(k), tone: 'plain', text: fmtSet(g), sub: `길이 ${g.length}` }));
  return { width: W, height: H, items };
}

/* ------------------------------------------------------------------ */
/* 정석 길이순 정렬 + Set으로 새 원소 찾기                               */
/* ------------------------------------------------------------------ */

function lengthSetViz(): Visualization {
  const rec = new PacedRecorder(board());
  const lane = new Lane(rec, LANE);
  const answer: number[] = [];
  let work = 0;
  const meta = (group = '-', added: number | '-' = '-') => ({
    work,
    variables: { group, added, answer: list(answer) },
  });

  rec.step({ title: `문자열에서 집합 ${N}개 파싱`, codeHighlights: SET_AT.parse, ...meta() });
  rec.phase('파싱하기', `바깥 중괄호를 떼고 "},{"로 나누어 ${N}개의 집합으로 분리합니다.`, SET_AT.parse);
  rec.do(...together(GROUPS.map((_, k): Action => paint(grpId(k), 'chosen'))), wait(200));

  rec.step({ title: '집합을 원소 개수(길이) 오름차순으로 정렬', codeHighlights: SET_AT.sort, ...meta() });
  rec.phase('정렬하기', '길이가 1인 집합부터 차례로 오도록 길이순으로 정렬합니다. 길이가 k인 집합에는 k번째 원소가 새로 추가되어 있습니다.', SET_AT.sort);
  rec.do(...together(ORDER.map((k, s): Action => ({ type: 'set', id: grpId(k), patch: { rect: groupSlot(s), tone: 'plain' } }))), wait(250));

  const seen = new Set<number>();
  SORTED_GROUPS.forEach((g, s) => {
    let added = 0;
    for (const x of g) {
      work++;
      if (!seen.has(x)) {
        seen.add(x);
        answer.push(x);
        added = x;
        break;
      }
    }
    rec.step({
      title: `길이 ${g.length} 집합 ${fmtSet(g)}: 새 원소 ${added} 추가`,
      codeHighlights: SET_AT.add,
      ...meta(fmtSet(g), added),
    });
    rec.phase('새 원소 찾기', `${fmtSet(g)}의 원소를 Set에서 조회해 아직 없던 원소 ${josa(added, '을', '를')} 바로 찾습니다.`, SET_AT.scan);
    rec.do(...together([{ type: 'focus', ids: [sGrp(s)] }, paint(sGrp(s), 'current')]), wait(180));

    rec.phase('튜플에 넣기', `${josa(added, '을', '를')} 튜플의 ${s + 1}번째 원소로 확정하고 break로 넘어갑니다.`, SET_AT.add);
    rec.do(...clear(paint(sGrp(s), 'visited')));
    lane.push({ id: `t:${s}`, text: String(added), tone: 'chosen' }, sGrp(s));
    rec.do({ type: 'set', id: 'tok:ans', patch: { text: list(answer), tone: 'chosen' }, pop: true });
  });

  rec.step({ title: `튜플 완성: ${list(TRUTH)}`, codeHighlights: SET_AT.done, ...meta('완료', '-'), answer: TRUTH, isKeyframe: true });
  rec.phase('정답', `길이 1부터 ${N}까지 새 원소를 하나씩 뽑아 원본 튜플 ${list(TRUTH)}를 복원했습니다.`, SET_AT.done);
  rec.do(...together([
    ...lane.ids.map((id): Action => paint(id, 'path')),
    { type: 'set', id: 'tok:ans', patch: { text: `정답 ${list(TRUTH)}`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 길이순 정렬 + 배열을 처음부터 훑어 중복 확인                      */
/* ------------------------------------------------------------------ */

function lengthListScanViz(): Visualization {
  const rec = new PacedRecorder(board());
  const lane = new Lane(rec, LANE);
  const answer: number[] = [];
  let work = 0;
  const meta = (group = '-', added: number | '-' = '-') => ({
    work,
    variables: { group, added, answer: list(answer) },
  });

  rec.step({ title: `문자열에서 집합 ${N}개 파싱`, codeHighlights: LIST_AT.parse, ...meta() });
  rec.phase('파싱하기', `문자열을 파싱해 ${N}개의 집합으로 분리합니다.`, LIST_AT.parse);
  rec.do(...together(GROUPS.map((_, k): Action => paint(grpId(k), 'chosen'))), wait(200));

  rec.step({ title: '집합을 길이순으로 정렬', codeHighlights: LIST_AT.sort, ...meta() });
  rec.phase('정렬하기', '원소 개수가 적은 집합부터 오름차순으로 정렬합니다.', LIST_AT.sort);
  rec.do(...together(ORDER.map((k, s): Action => ({ type: 'set', id: grpId(k), patch: { rect: groupSlot(s), tone: 'plain' } }))), wait(250));

  SORTED_GROUPS.forEach((g, s) => {
    let added = 0;
    let stepChecks = 0;
    for (const x of g) {
      // answer 배열을 처음부터 훑어 x가 있는지 비교하는 횟수(비어 있으면 1회 확인)
      const idx = answer.indexOf(x);
      const checks = idx >= 0 ? idx + 1 : Math.max(1, answer.length);
      work += checks;
      stepChecks += checks;
      if (idx < 0) {
        answer.push(x);
        added = x;
      }
    }
    rec.step({
      title: `길이 ${g.length} 집합 ${fmtSet(g)}: 배열 스캔 ${stepChecks}회 → ${added} 추가`,
      codeHighlights: LIST_AT.add,
      ...meta(fmtSet(g), added),
    });
    rec.phase('배열 처음부터 비교', `Set 없이 ${fmtSet(g)}의 모든 원소마다 answer 배열을 처음부터 훑어 중복을 확인하느라 ${stepChecks}번 비교했습니다.`, LIST_AT.scan);
    rec.do(...together([{ type: 'focus', ids: [sGrp(s), ...lane.ids] }, paint(sGrp(s), 'current')]), wait(200));

    rec.phase('튜플에 넣기', `중복이 아닌 ${josa(added, '을', '를')} answer 끝에 넣습니다.`, LIST_AT.add);
    rec.do(...clear(paint(sGrp(s), 'visited')));
    lane.push({ id: `t:${s}`, text: String(added), tone: 'chosen' }, sGrp(s));
    rec.do({ type: 'set', id: 'tok:ans', patch: { text: list(answer), tone: 'chosen' }, pop: true });
  });

  rec.step({ title: `튜플 완성: ${list(TRUTH)} (비교 ${work}회)`, codeHighlights: LIST_AT.done, ...meta('완료', '-'), answer: TRUTH, isKeyframe: true });
  rec.phase('정답', `답은 ${list(TRUTH)}로 같지만, 매번 answer 배열을 선형 탐색하고 break도 하지 않아 ${work}번 비교했습니다(정석은 12번).`, LIST_AT.done);
  rec.do(...together([
    ...lane.ids.map((id): Action => paint(id, 'path')),
    { type: 'set', id: 'tok:ans', patch: { text: `정답 ${list(TRUTH)}`, tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 길이순 정렬 없이 등장 순서대로 담기                               */
/* ------------------------------------------------------------------ */

function noSortTrapViz(): Visualization {
  const rec = new PacedRecorder(board());
  const lane = new Lane(rec, LANE);
  const answer: number[] = [];
  let work = 0;
  const meta = (group = '-', added = '-') => ({
    work,
    variables: { group, added, answer: list(answer) },
  });

  rec.step({ title: '집합 파싱 후 정렬 없이 그대로 진행', codeHighlights: TRAP_AT.parse, ...meta() });
  rec.phase('정렬 생략', '집합들의 순서가 뒤섞여 있다는 점을 잊고, 길이순 정렬 없이 첫 번째 집합 {4,2,3}부터 차례로 훑습니다.', TRAP_AT.parse);
  rec.do(...together(GROUPS.map((_, k): Action => paint(grpId(k), 'chosen'))), wait(200));

  GROUPS.forEach((g, k) => {
    const newlyAdded: number[] = [];
    for (const x of g) {
      work++;
      if (!answer.includes(x)) {
        answer.push(x);
        newlyAdded.push(x);
      }
    }
    const addedText = newlyAdded.length ? newlyAdded.join(', ') : '없음';
    rec.step({
      title: `${k + 1}번째 집합 ${fmtSet(g)}: [${addedText}] 추가`,
      codeHighlights: newlyAdded.length ? TRAP_AT.add : TRAP_AT.scan,
      ...meta(fmtSet(g), addedText),
    });
    rec.phase('그대로 훑기', k === 0
      ? `첫 집합이 길이 3인 ${fmtSet(g)}인데 그대로 넣어서 4, 2, 3 순서로 한꺼번에 들어가 버립니다!`
      : `${fmtSet(g)}에서 아직 안 나온 원소 [${addedText}]를 확인합니다.`, TRAP_AT.scan);
    rec.do(...together([{ type: 'focus', ids: [grpId(k)] }, paint(grpId(k), k === 0 ? 'bad' : 'current')]), wait(200));

    rec.phase('기록하기', newlyAdded.length
      ? `[${addedText}]를 결과 배열에 추가해 ${list(answer)}가 됩니다.`
      : `모든 원소가 이미 들어 있어 넘어갑니다.`, newlyAdded.length ? TRAP_AT.add : TRAP_AT.scan);
    rec.do(...clear(paint(grpId(k), k === 0 ? 'bad' : 'visited')));
    for (const x of newlyAdded) {
      lane.push({ id: `t:${lane.ids.length}`, text: String(x), tone: k === 0 ? 'bad' : 'chosen' }, grpId(k));
    }
    rec.do({ type: 'set', id: 'tok:ans', patch: { text: list(answer), tone: 'bad' }, pop: true });
  });

  rec.step({ title: `이 방법 ${list(TRAP_ANS)}, 정답은 ${list(TRUTH)}`, codeHighlights: TRAP_AT.done, ...meta('완료', '-'), answer: TRAP_ANS, isKeyframe: true });
  rec.phase('오답 확인', `집합을 길이순으로 정렬하지 않으면 첫 집합 {4,2,3}의 순서에 끌려가 ${list(TRAP_ANS)}가 나옵니다. 진짜 첫 원소는 {3}에 있던 ${ro(3)}, 정답은 ${list(TRUTH)}입니다.`, TRAP_AT.done);
  rec.do(...together([
    ...lane.ids.map((id): Action => paint(id, 'bad')),
    { type: 'set', id: 'tok:ans', patch: { text: `이 방법 ${list(TRAP_ANS)}`, tone: 'bad' }, pop: true },
    { type: 'add', item: { id: 'tok:truth', kind: 'token', rect: TRUTH_RECT, tone: 'good', text: `정답 ${list(TRUTH)}` } },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'tuple',
  title: '튜플',
  level: 2,
  category: 'sort',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/64065',
  description: {
    summary:
      '중복되는 원소가 없는 튜플 (a1, a2, ..., an)을 집합 기호 "{{a1}, {a1, a2}, ...}" 형태로 표현한 문자열 s가 주어집니다. 집합들의 순서와 각 집합 내부 원소의 순서는 뒤바뀔 수 있을 때, s가 표현하는 원래 튜플을 배열에 담아 반환합니다.',
    rules: [
      's의 길이는 5 이상 1,000,000 이하',
      's는 숫자와 "{", "}", ","로만 이루어져 있음',
      '숫자가 0으로 시작하는 경우는 없으며, 원소는 1 이상 100,000 이하의 자연수',
      '중복되는 원소가 없는 올바른 튜플만 입력으로 주어지며, 반환 배열 길이는 1 이상 500 이하',
    ],
    examples: [
      { input: 's = "{{2},{2,1},{2,1,3},{2,1,3,4}}"', output: '[2, 1, 3, 4]' },
      { input: 's = "{{1,2,3},{2,1},{1,2,4,3},{2}}"', output: '[2, 1, 3, 4]' },
      { input: 's = "{{20,111},{111}}"', output: '[111, 20]' },
      { input: 's = "{{123}}"', output: '[123]' },
      { input: 's = "{{4,2,3},{3},{2,3,4,1},{2,3}}"', output: '[3, 2, 4, 1]' },
    ],
  },
  keyIntuitions: [
    '원소 개수가 1개인 집합에는 튜플의 첫 번째 원소만 들어 있고, 원소 개수가 k개인 집합에는 직전(k - 1개) 집합에 없던 k번째 원소가 딱 하나 새로 추가됩니다.',
    '따라서 집합들을 원소 개수(길이) 오름차순으로 정렬한 뒤, 앞에서부터 처음 등장하는 원소를 하나씩 챙기면 원래 튜플 순서가 복원됩니다.',
    '새 원소인지 확인할 때 해시 집합(Set)을 쓰면 각 원소를 O(1)에 조회할 수 있습니다.',
  ],
  demo: { input: [S], label: 's = "{{4,2,3},{3},{2,3,4,1},{2,3},{2,3,4,1,5}}"' },
  workUnit: '원소를 확인·비교한 횟수',
  approaches: [
    {
      id: 'tuple-length-set',
      name: '길이순 정렬 + 해시 집합(Set)으로 새 원소 찾기',
      rank: 'BEST',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N²)',
      verdict: '집합들을 길이 오름차순으로 정렬한 뒤, 해시 집합(Set)으로 이전에 없던 새 원소를 O(1)에 찾아내는 정석 풀이입니다.',
      pros: [
        '길이순 정렬 한 번으로 튜플의 각 자리 원소가 어떤 집합에서 나오는지 바로 정해집니다.',
        'Set 조회는 O(1)이고 새 원소를 찾자마자 break하므로 원소 확인 횟수가 최소입니다.',
      ],
      cons: ['바깥 중괄호 두 겹("{{", "}}")을 먼저 벗겨 내는 문자열 파싱 실수를 주의해야 합니다.'],
      whyThisRank:
        '집합의 길이 총합이 O(N²)이므로 모든 원소를 한 번씩 읽는 것만으로 하한에 도달하며, Set을 써서 중복 검사 비용을 O(1)로 줄입니다.',
      code: LENGTH_SET,
      visualize: lengthSetViz,
    },
    {
      id: 'tuple-length-list-scan',
      name: '길이순 정렬 + 배열 선형 탐색으로 중복 확인',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N³)',
      spaceComplexity: 'O(N²)',
      verdict: '길이순 정렬은 같지만, Set 대신 결과 배열을 매번 처음부터 끝까지 훑어(in / includes) 중복을 검사하는 느린 풀이입니다.',
      pros: [
        '별도의 Set 자료구조 없이 결과 배열 하나만으로 구현할 수 있습니다.',
        '정석과 똑같은 정답을 냅니다.',
      ],
      cons: [
        '집합이N개일 때 원소 총합 O(N²)개마다 길이 O(N)인 answer 배열을 처음부터 훑어 전체 시간이 O(N³)으로 늘어납니다.',
      ],
      whyThisRank:
        '정렬 아이디어는 맞지만, O(1) 해시 집합 대신 O(N) 배열 탐색을 반복해 원소 비교 횟수가 불필요하게 커집니다.',
      code: LENGTH_LIST_SCAN,
      visualize: lengthListScanViz,
    },
    {
      id: 'tuple-no-sort-trap',
      name: '길이순 정렬 없이 등장 순서대로 중복 제거',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N³)',
      spaceComplexity: 'O(N²)',
      verdict: '집합들이 이미 짧은 순서대로 주어졌다고 착각해, 길이순 정렬을 빼먹고 앞에서부터 중복을 제거하는 함정입니다.',
      pros: ['첫 번째 예제 "{{2},{2,1},{2,1,3},{2,1,3,4}}"는 우연히 길이순으로 적혀 있어 통과합니다.'],
      cons: [
        '집합 순서가 섞여 있는 예제("{{4,2,3},{3},...}")에서는 첫 집합의 원소 순서대로 들어가 오답을 냅니다.',
      ],
      whyThisRank:
        '문제에서 집합들의 순서가 바뀔 수 있다고 명시했으므로, 길이순 정렬 없이는 튜플의 몇 번째 원소인지 알 수 없습니다.',
      code: NO_SORT_TRAP,
      visualize: noSortTrapViz,
    },
  ],
  checks: {
    cases: [
      { args: ['{{2},{2,1},{2,1,3},{2,1,3,4}}'], expected: [2, 1, 3, 4] },
      { args: ['{{1,2,3},{2,1},{1,2,4,3},{2}}'], expected: [2, 1, 3, 4] },
      { args: ['{{20,111},{111}}'], expected: [111, 20] },
      { args: ['{{123}}'], expected: [123] },
      { args: ['{{4,2,3},{3},{2,3,4,1},{2,3}}'], expected: [3, 2, 4, 1] },
      { args: [S], expected: TRUTH },
    ],
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 6);
      const pool: number[] = [];
      while (pool.length < n) {
        const v = 1 + Math.floor(rand() * 50);
        if (!pool.includes(v)) pool.push(v);
      }
      const prefixes = pool.map((_, i) => {
        const sub = pool.slice(0, i + 1);
        for (let k = sub.length - 1; k > 0; k--) {
          const j = Math.floor(rand() * (k + 1));
          [sub[k], sub[j]] = [sub[j], sub[k]];
        }
        return sub.join(',');
      });
      for (let k = prefixes.length - 1; k > 0; k--) {
        const j = Math.floor(rand() * (k + 1));
        [prefixes[k], prefixes[j]] = [prefixes[j], prefixes[k]];
      }
      return [`{{${prefixes.join('},{')}}}`];
    },
  },
};

export default problem;
