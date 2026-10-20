// 양궁대회: 정석 점수마다 이길지 포기할지 정하는 백트래킹, 대안 이길 점수 10개를 고르는 모든 경우(비트마스크), 함정 높은 점수부터 이기기.
// 세 풀이는 같은 판(점수 10~0 열 11개, 어피치 · 라이언 · 얻은 점수 · 최고 기록 줄)과 계수기를 쓴다.
// 정석의 첫 배분(높은 점수부터 이기기)이 곧 함정의 답이라, 함정은 정석의 앞부분만 따라가다 멈춘다.
import type { Action, Item, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';
import { clear, holdCaptions, set, wait } from './common.ts';

// 원문 예제 1. 세 풀이의 시각화 입력이자 점검 사례다. 높은 점수부터 이기면 차이 4, 정답은 차이 6이다.
const N = 5;
const INFO = [2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const COLS = 11;
const scoreOf = (k: number) => 10 - k;
const listText = (xs: number[]) => `[${xs.join(', ')}]`;
interface Meta { work: number; variables: Record<string, string | number> }

// 배분 ryan의 결과: 점수(10-k)를 라이언이 얻는지(R), 어피치가 얻는지(A), 아무도 못 얻는지(-)
const resultOf = (ryan: number[]) => {
  const owner = ryan.map((r, k): 'R' | 'A' | '-' => (r > INFO[k] ? 'R' : INFO[k] > 0 ? 'A' : '-'));
  const sum = (who: 'R' | 'A') => owner.reduce((s, o, k) => s + (o === who ? scoreOf(k) : 0), 0);
  return { owner, ryan: sum('R'), apeach: sum('A'), gap: sum('R') - sum('A') };
};
// 낮은 점수(뒤쪽)부터 비교해 화살이 더 많은 쪽이 낫다
const lowerIsBetter = (a: number[], b: number[]) => {
  for (let k = 10; k >= 0; k--) if (a[k] !== b[k]) return a[k] > b[k];
  return false;
};
const improves = (ryan: number[], best: number, answer: number[]) => {
  const gap = resultOf(ryan).gap;
  return gap > best || (gap === best && gap > 0 && lowerIsBetter(ryan, answer));
};

// 정석(DFS)이 끝까지 가 본 배분들: 점수 10부터 이길 수 있으면 먼저 이겨 보고, 그다음 포기한다
const LEAVES: number[][] = [];
{
  const ryan = Array<number>(COLS).fill(0);
  const dfs = (k: number, left: number) => {
    if (k === 10) {
      ryan[10] = left;
      LEAVES.push([...ryan]);
      ryan[10] = 0;
      return;
    }
    if (left > INFO[k]) {
      ryan[k] = INFO[k] + 1;
      dfs(k + 1, left - ryan[k]);
      ryan[k] = 0;
    }
    dfs(k + 1, left);
  };
  dfs(0, N);
}
// 대안(비트마스크)이 차례로 보는 배분들: 화살이 모자라면 null
const MASKS: (number[] | null)[] = Array.from({ length: 1 << 10 }, (_, mask) => {
  const ryan = Array<number>(COLS).fill(0);
  for (let k = 0; k < 10; k++) if ((mask >> k) & 1) ryan[k] = INFO[k] + 1;
  const need = ryan.reduce((s, x) => s + x, 0);
  if (need > N) return null;
  ryan[10] = N - need;
  return ryan;
});
// 새 최고 기록이 나오는 순서(배분 번호)
const improvementsOf = (seq: (number[] | null)[]) => {
  let best = 0;
  let answer: number[] = [-1];
  const at: number[] = [];
  seq.forEach((r, i) => {
    if (!r || !improves(r, best, answer)) return;
    best = resultOf(r).gap;
    answer = r;
    at.push(i);
  });
  return { at, best, answer };
};
const DFS_BEST = improvementsOf(LEAVES);
const MASK_BEST = improvementsOf(MASKS);
const TRUTH = DFS_BEST.answer;
const GREEDY = LEAVES[0];

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const HELP_PY = `def score_gap(ryan, info):
    # 라이언이 얻은 점수 - 어피치가 얻은 점수
    gap = 0
    for k in range(11):
        if ryan[k] > info[k]:
            gap += 10 - k  # 라이언이 이긴 점수
        elif info[k] > 0:
            gap -= 10 - k  # 어피치가 가져간 점수
    return gap

def lower_is_better(a, b):
    # 낮은 점수(뒤쪽)부터 비교해 화살이 더 많은 쪽이 낫습니다
    for k in range(10, -1, -1):
        if a[k] != b[k]:
            return a[k] > b[k]
    return False
`;
const HELP_JS = `// 라이언이 얻은 점수 - 어피치가 얻은 점수
function scoreGap(ryan, info) {
  let gap = 0;
  for (let k = 0; k < 11; k++) {
    if (ryan[k] > info[k]) gap += 10 - k; // 라이언이 이긴 점수
    else if (info[k] > 0) gap -= 10 - k; // 어피치가 가져간 점수
  }
  return gap;
}

// 낮은 점수(뒤쪽)부터 비교해 화살이 더 많은 쪽이 낫습니다
function lowerIsBetter(a, b) {
  for (let k = 10; k >= 0; k--) {
    if (a[k] !== b[k]) return a[k] > b[k];
  }
  return false;
}
`;

const BEST = {
  python: `${HELP_PY}
def solution(n, info):
    best = 0  # 지금까지의 가장 큰 점수 차이
    answer = [-1]
    ryan = [0] * 11

    def dfs(k, left):
        nonlocal best, answer
        if k == 10:
            ryan[10] = left  # 남은 화살은 모두 0점에
            gap = score_gap(ryan, info)
            if gap > best or (gap == best and gap > 0 and lower_is_better(ryan, answer)):
                best = gap
                answer = ryan[:]
            ryan[10] = 0
            return
        if left > info[k]:  # 어피치보다 한 발 더 쏠 수 있으면 이겨 봅니다
            ryan[k] = info[k] + 1
            dfs(k + 1, left - ryan[k])
            ryan[k] = 0
        dfs(k + 1, left)  # 이 점수는 포기합니다

    dfs(0, n)
    return answer`,
  javascript: `${HELP_JS}
function solution(n, info) {
  let best = 0; // 지금까지의 가장 큰 점수 차이
  let answer = [-1];
  const ryan = Array(11).fill(0);

  const dfs = (k, left) => {
    if (k === 10) {
      ryan[10] = left; // 남은 화살은 모두 0점에
      const gap = scoreGap(ryan, info);
      if (gap > best || (gap === best && gap > 0 && lowerIsBetter(ryan, answer))) {
        best = gap;
        answer = [...ryan];
      }
      ryan[10] = 0;
      return;
    }
    if (left > info[k]) { // 어피치보다 한 발 더 쏠 수 있으면 이겨 봅니다
      ryan[k] = info[k] + 1;
      dfs(k + 1, left - ryan[k]);
      ryan[k] = 0;
    }
    dfs(k + 1, left); // 이 점수는 포기합니다
  };

  dfs(0, n);
  return answer;
}`,
};
const BT = {
  start: lines(BEST, ['best = 0', 'dfs(0, n)'], ['let best = 0', 'dfs(0, n)']),
  look: lines(BEST, ['if left > info[k]:'], ['if (left > info[k])']),
  win: lines(BEST, ['if left > info[k]:', 'ryan[k] = info[k] + 1', 'dfs(k + 1, left - ryan[k])'], ['if (left > info[k])', 'ryan[k] = info[k] + 1', 'dfs(k + 1, left - ryan[k])']),
  skip: lines(BEST, ['if left > info[k]:', 'dfs(k + 1, left)  #'], ['if (left > info[k])', 'dfs(k + 1, left); //']),
  leaf: lines(BEST, ['if k == 10:', 'ryan[10] = left', 'gap = score_gap(ryan, info)'], ['if (k === 10)', 'ryan[10] = left', 'const gap = scoreGap(ryan, info)']),
  compare: lines(BEST, ['if gap > best or', 'best = gap', 'answer = ryan[:]'], ['if (gap > best ||', 'best = gap', 'answer = [...ryan]']),
  back: lines(BEST, ['ryan[k] = 0', 'dfs(k + 1, left)  #'], ['ryan[k] = 0', 'dfs(k + 1, left); //']),
  done: lines(BEST, ['dfs(0, n)', 'return answer'], ['dfs(0, n)', 'return answer']),
};

const MASK = {
  python: `${HELP_PY}
def solution(n, info):
    best = 0
    answer = [-1]
    for mask in range(1 << 10):  # 10점~1점을 이길지 말지 고르는 모든 경우(2^10가지)
        ryan = [0] * 11
        for k in range(10):
            if mask >> k & 1:
                ryan[k] = info[k] + 1  # 이기려면 어피치보다 한 발 더
        need = sum(ryan)
        if need > n:
            continue  # 화살이 모자란 경우는 건너뜁니다
        ryan[10] = n - need  # 남은 화살은 모두 0점에
        gap = score_gap(ryan, info)
        if gap > best or (gap == best and gap > 0 and lower_is_better(ryan, answer)):
            best = gap
            answer = ryan
    return answer`,
  javascript: `${HELP_JS}
function solution(n, info) {
  let best = 0;
  let answer = [-1];
  for (let mask = 0; mask < 1 << 10; mask++) { // 10점~1점을 이길지 말지 고르는 모든 경우(2^10가지)
    const ryan = Array(11).fill(0);
    for (let k = 0; k < 10; k++) {
      if ((mask >> k) & 1) ryan[k] = info[k] + 1; // 이기려면 어피치보다 한 발 더
    }
    const need = ryan.reduce((s, x) => s + x, 0);
    if (need > n) continue; // 화살이 모자란 경우는 건너뜁니다
    ryan[10] = n - need; // 남은 화살은 모두 0점에
    const gap = scoreGap(ryan, info);
    if (gap > best || (gap === best && gap > 0 && lowerIsBetter(ryan, answer))) {
      best = gap;
      answer = ryan;
    }
  }
  return answer;
}`,
};
const MK = {
  start: lines(MASK, ['best = 0', 'for mask in range(1 << 10)'], ['let best = 0', 'for (let mask = 0']),
  make: lines(MASK, ['for mask in range(1 << 10)', 'ryan[k] = info[k] + 1', 'need = sum(ryan)'], ['for (let mask = 0', 'ryan[k] = info[k] + 1', 'const need = ryan.reduce']),
  short: lines(MASK, ['need = sum(ryan)', 'if need > n:', 'continue'], ['const need = ryan.reduce', 'if (need > n) continue']),
  score: lines(MASK, ['ryan[10] = n - need', 'gap = score_gap(ryan, info)'], ['ryan[10] = n - need', 'const gap = scoreGap(ryan, info)']),
  compare: lines(MASK, ['if gap > best or', 'best = gap', 'answer = ryan'], ['if (gap > best ||', 'best = gap', 'answer = ryan']),
  done: lines(MASK, ['return answer'], ['return answer']),
};

const HIGH = {
  python: `${HELP_PY}
# 주의: 높은 점수부터 이길 수 있으면 무조건 이기는 오답 풀이입니다
def solution(n, info):
    ryan = [0] * 11
    left = n
    for k in range(10):  # 10점부터 1점까지
        if left > info[k]:
            ryan[k] = info[k] + 1  # 이길 수 있으면 이깁니다
            left -= ryan[k]
    ryan[10] = left  # 남은 화살은 0점에
    return ryan if score_gap(ryan, info) > 0 else [-1]`,
  javascript: `${HELP_JS}
// 주의: 높은 점수부터 이길 수 있으면 무조건 이기는 오답 풀이입니다
function solution(n, info) {
  const ryan = Array(11).fill(0);
  let left = n;
  for (let k = 0; k < 10; k++) { // 10점부터 1점까지
    if (left > info[k]) {
      ryan[k] = info[k] + 1; // 이길 수 있으면 이깁니다
      left -= ryan[k];
    }
  }
  ryan[10] = left; // 남은 화살은 0점에
  return scoreGap(ryan, info) > 0 ? ryan : [-1];
}`,
};
const HG = {
  start: lines(HIGH, ['ryan = [0] * 11', 'left = n'], ['const ryan = Array(11)', 'let left = n']),
  look: lines(HIGH, ['for k in range(10):', 'if left > info[k]:'], ['for (let k = 0; k < 10; k++)', 'if (left > info[k])']),
  win: lines(HIGH, ['if left > info[k]:', 'ryan[k] = info[k] + 1', 'left -= ryan[k]'], ['if (left > info[k])', 'ryan[k] = info[k] + 1', 'left -= ryan[k]']),
  skip: lines(HIGH, ['for k in range(10):', 'if left > info[k]:'], ['for (let k = 0; k < 10; k++)', 'if (left > info[k])']),
  rest: lines(HIGH, ['ryan[10] = left'], ['ryan[10] = left']),
  done: lines(HIGH, ['return ryan if score_gap(ryan, info) > 0 else [-1]'], ['return scoreGap(ryan, info) > 0 ? ryan : [-1]']),
};

/* ------------------------------------------------------------------ */
/* 장면: 점수 열 11개 × (어피치, 라이언, 얻은 점수, 최고 기록) 줄                 */
/* ------------------------------------------------------------------ */

// 가로: 줄 이름 2~60, 칸 30px에 간격 2px로 열 11개가 62~412. 세로: 안내 글 0~16, 점수 20~36, 어피치 40~78, 라이언 86~124, 얻은 점수 132~170,
// 계수기 180~210, 최고 기록 222~260, 계산 글 268~294.
const W = 420;
const H = 300;
const ROW_Y = { a: 40, r: 86, d: 132, b: 222 };
const colX = (k: number) => 62 + k * 32;
const slot = (row: keyof typeof ROW_Y, k: number): Rect => ({ x: colX(k), y: ROW_Y[row], w: 30, h: 38 });
const id = (row: string, k: number) => `${row}:${k}`;
const labelItem = (key: string, y: number, text: string): Item => ({ id: `lab:${key}`, kind: 'text', rect: { x: 2, y, w: 58, h: 38 }, tone: 'muted', text });
const tokenAt = (key: string, x: number, w: number, text: string, t: Tone): Item => ({ id: `t:${key}`, kind: 'token', rect: { x, y: 180, w, h: 30 }, tone: t, text });
const calcTo = (text: string) => set('calc', { text });

function board(title: string, bestLabel: string): Scene {
  const items: Item[] = [{ id: 'title', kind: 'text', rect: { x: 2, y: 0, w: 412, h: 16 }, tone: 'muted', text: title }];
  items.push(
    { id: 'lab:s', kind: 'text', rect: { x: 2, y: 20, w: 58, h: 16 }, tone: 'muted', text: '점수' },
    labelItem('a', 40, '어피치'), labelItem('r', 86, '라이언'), labelItem('d', 132, '얻은 점수'), labelItem('b', 222, bestLabel),
  );
  for (let k = 0; k < COLS; k++) {
    items.push(
      { id: id('h', k), kind: 'text', rect: { x: colX(k), y: 20, w: 30, h: 16 }, text: String(scoreOf(k)) },
      { id: id('a', k), kind: 'cell', rect: slot('a', k), tone: INFO[k] ? 'plain' : 'explored', text: String(INFO[k]) },
      { id: id('r', k), kind: 'cell', rect: slot('r', k), tone: 'plain', text: '' },
      { id: id('d', k), kind: 'cell', rect: slot('d', k), tone: 'plain', text: '' },
      { id: id('b', k), kind: 'cell', rect: slot('b', k), tone: 'plain', text: '' },
    );
  }
  items.push(
    tokenAt('left', 8, 104, `남은 화살 ${N}`, 'chosen'),
    tokenAt('ryan', 118, 96, '라이언 0', 'plain'),
    tokenAt('apeach', 220, 96, `어피치 ${resultOf(Array(COLS).fill(0)).apeach}`, 'plain'),
    tokenAt('gap', 322, 90, '차이 0', 'plain'),
    { id: 'calc', kind: 'text', rect: { x: 8, y: 268, w: 404, h: 26 }, text: '' },
  );
  return { width: W, height: H, items };
}
// 한 줄의 칸들을 값과 상태로 맞추는 동작(같은 뜻이라 한 묶음)
const rowTo = (row: string, values: (number | string)[], tones: Tone[], pop = false): Action[] =>
  values.map((v, k) => set(id(row, k), { text: String(v), tone: tones[k] }, pop));
const blankRow = (row: string): Action[] => rowTo(row, Array(COLS).fill(''), Array(COLS).fill('plain'));
const allocTones = (ryan: number[], t: Tone): Tone[] => ryan.map((r) => (r > 0 ? t : 'explored'));
// 얻은 점수 줄: 라이언이 얻으면 초록, 어피치가 얻으면 주황, 아무도 못 얻으면 비움
const gainRow = (ryan: number[]): Action[] => {
  const { owner } = resultOf(ryan);
  return rowTo('d', owner.map((o, k) => (o === '-' ? '' : scoreOf(k))), owner.map((o): Tone => (o === 'R' ? 'visited' : o === 'A' ? 'bad' : 'plain')), true);
};
const totalsTo = (ryan: number[]): Action[] => {
  const r = resultOf(ryan);
  return [set('t:ryan', { text: `라이언 ${r.ryan}` }, true), set('t:apeach', { text: `어피치 ${r.apeach}` }, true), set('t:gap', { text: `차이 ${r.gap > 0 ? '+' : ''}${r.gap}`, tone: r.gap > 0 ? 'good' : 'bad' }, true)];
};
const gapText = (g: number) => `${g > 0 ? '+' : ''}${g}`;
const gapJosa = (g: number, batchim: string, plain: string) => josa(gapText(g), batchim, plain);
const pointsText = (xs: number[]) => xs.map((x) => `${x}점`).join(', ');
const winCaption = (k: number, left: number) =>
  `${scoreOf(k)}점: 어피치가 ${INFO[k]}발이라 ${INFO[k] + 1}발을 쏘면 이깁니다. 남은 화살 ${left}발로 쏠 수 있습니다.`;

/* ------------------------------------------------------------------ */
/* 정석: (살피기 → 쏘기)로 내려가고, 배분 하나마다 점수 계산 → 비교하기          */
/* ------------------------------------------------------------------ */

// 이기는 점수 k를 살펴 이기기로 정한다(첫 배분을 만드는 내려가기). 점수 계산은 evaluate가 한다.
function descend(rec: StepRecorder, k: number, left: number, codeLook: Record<'python' | 'javascript', number[]>, codeWin: Record<'python' | 'javascript', number[]>) {
  rec.phase('살피기', winCaption(k, left), codeLook);
  rec.do({ type: 'focus', ids: [id('a', k), id('r', k)] });
  rec.do({ type: 'arrow', from: id('a', k), to: id('r', k), verdict: 'good' as Verdict, label: `${INFO[k] + 1}발이면 이김` }, wait(200));
  rec.phase('쏘기', `${INFO[k] + 1}발을 쏘아 ${scoreOf(k)}점을 가져옵니다. 남은 화살은 ${left} − ${INFO[k] + 1} = ${left - INFO[k] - 1}발입니다.`, codeWin);
  rec.do(...clear());
  rec.do(...together([set(id('r', k), { tone: 'visited', text: String(INFO[k] + 1) }, true), set('t:left', { text: `남은 화살 ${left - INFO[k] - 1}` }, true)]), wait(450));
}

function backtracking(): Visualization {
  const rec = new StepRecorder(board(`점수마다 이길지 포기할지 정합니다 · 화살 ${N}발`, '최고 기록'));
  let work = 0; // 끝까지 가 본 배분 수
  let best = 0;
  let k = 0;
  let left = N;
  let cur: number[] = Array(COLS).fill(0);
  const meta = (): Meta => ({ work, variables: { k, left, ryan: listText(cur), best } });
  const first = LEAVES[0];

  rec.step({ title: 'dfs(0, 5)에서 시작', codeHighlights: BT.start, ...meta() });
  rec.phase('시작', `어피치가 이미 쏜 화살(${listText(INFO)})을 보고, 라이언은 점수마다 이길지 포기할지 정합니다. 이기려면 어피치보다 한 발 더 쏴야 하고, 남은 화살은 모두 0점에 놓습니다. 먼저 높은 점수부터 이겨 봅니다.`, BT.start);
  rec.do(wait(300));

  // 첫 내려가기: 이길 수 있는 점수는 이기고(10점, 9점), 화살이 떨어진 뒤는 모두 포기
  for (let s = 0; s < 10 && left > INFO[s]; s++) {
    const cost = INFO[s] + 1;
    const l0 = left;
    left -= cost;
    cur = cur.map((x, i) => (i === s ? cost : x));
    k = s + 1;
    rec.step({ title: `${scoreOf(s)}점: ${cost}발로 이김, 남은 화살 ${left}`, codeHighlights: BT.win, ...meta() });
    descend(rec, s, l0, BT.look, BT.win);
  }
  let lastWin = 0;
  first.forEach((x, i) => { if (i < 10 && x > 0) lastWin = i; });
  const hasteFrom = lastWin + 1;
  k = 10;
  rec.step({ title: `${scoreOf(hasteFrom)}점~1점: 화살이 없어 포기`, codeHighlights: BT.skip, ...meta() });
  rec.phase('빨리 감기', `${scoreOf(hasteFrom)}점부터 1점까지는 남은 화살이 ${left}발이라 어피치보다 한 발 더 쏠 수 없습니다. 모두 포기하고 맨 끝(0점)에 이릅니다.`, BT.skip);
  rec.do(...together(Array.from({ length: 10 - hasteFrom }, (_, i) => set(id('r', hasteFrom + i), { text: '0', tone: 'explored' }))));

  const evaluate = (ryan: number[], prev: number, newBest: boolean, isFirst: boolean) => {
    const res = resultOf(ryan);
    rec.phase('점수 계산', `점수마다 비교합니다. 라이언이 이긴 점수는 ${pointsText(res.owner.flatMap((o, i) => (o === 'R' ? [scoreOf(i)] : [])))}, 어피치가 가져간 점수는 ${pointsText(res.owner.flatMap((o, i) => (o === 'A' ? [scoreOf(i)] : [])))}입니다. 라이언 ${res.ryan}점, 어피치 ${res.apeach}점으로 차이는 ${gapText(res.gap)}입니다.`, BT.leaf);
    rec.do(...together(gainRow(ryan)));
    rec.do(...together(totalsTo(ryan)));
    rec.phase('비교하기', newBest
      ? (isFirst ? `지금까지 이긴 배분이 없으니 차이 ${gapJosa(res.gap, '이', '가')} 새 최고 기록입니다.` : `차이 ${gapJosa(res.gap, '이', '가')} 지금까지의 최고 ${gapText(prev)}보다 커서 새 최고 기록입니다.`)
      : `차이 ${gapJosa(res.gap, '은', '는')} 최고 기록을 넘지 못합니다.`, BT.compare);
    if (newBest) rec.do(...together([...rowTo('b', ryan, ryan.map((x): Tone => (x > 0 ? 'good' : 'plain')), true), calcTo(`최고 기록: 차이 ${gapText(res.gap)} ${listText(ryan)}`)]));
  };

  // 첫 배분: 높은 점수부터 이긴 배분
  work = 1;
  cur = [...first];
  left = 0;
  best = resultOf(first).gap;
  rec.step({ title: `첫 배분 ${listText(first)} → 차이 ${gapText(best)}`, codeHighlights: BT.compare, ...meta() });
  rec.phase('배분하기', `맨 끝(0점)에 남은 화살 ${first[10]}발을 놓아 첫 배분이 끝났습니다. 이제 점수를 계산합니다.`, BT.leaf);
  rec.do(...together([set(id('r', 10), { text: String(first[10]), tone: first[10] ? 'visited' : 'explored' }, true), set('t:left', { text: '남은 화살 0' }, true)]));
  evaluate(first, 0, true, true);

  // 새 최고 기록이 나오는 배분과 그 사이를 빨리 감는 단계
  let from = 1;
  let prevBest = best;
  const shownAt = DFS_BEST.at.slice(1);
  for (const at of [...shownAt, LEAVES.length]) {
    const skipCount = at - from;
    if (skipCount > 0) {
      work += skipCount;
      rec.step({ title: `배분 ${from + 1}~${at}번째 빨리 감기`, codeHighlights: BT.back, ...meta() });
      rec.phase('빨리 감기', `되돌아가며 이겼던 점수를 포기로 바꿔 배분 ${skipCount}가지를 더 살펴봅니다. 모두 차이가 ${gapText(prevBest)} 이하이고, 같은 차이일 때도 낮은 점수에 화살이 더 많은 쪽이 아니라서 최고 기록은 그대로입니다.`, BT.back);
      rec.do(...together([...blankRow('r'), ...blankRow('d'), set('t:left', { text: '남은 화살 -' }), calcTo(`배분 ${from + 1}~${at}번째: ${skipCount}가지 모두 탈락`)]));
    }
    if (at === LEAVES.length) break;
    const ryan = LEAVES[at];
    const res = resultOf(ryan);
    work += 1;
    cur = [...ryan];
    best = res.gap;
    rec.step({ title: `배분 ${at + 1}번째 ${listText(ryan)} → 차이 ${gapText(res.gap)}`, codeHighlights: BT.compare, ...meta() });
    rec.phase('배분하기', `${ryan.flatMap((x, i) => (x > 0 && i < 10 ? [`${scoreOf(i)}점 ${x}발`] : [])).join(', ')}${ryan[10] ? `, 0점 ${ryan[10]}발` : ''}로 쏘는 배분입니다. 화살 ${ryan.reduce((a, b) => a + b, 0)}발을 모두 씁니다.`, BT.win);
    rec.do(...together([...rowTo('r', ryan, allocTones(ryan, 'visited'), true), ...blankRow('d'), set('t:left', { text: '남은 화살 0' }, true)]));
    evaluate(ryan, prevBest, true, false);
    prevBest = res.gap;
    from = at + 1;
  }

  cur = DFS_BEST.answer;
  k = 0;
  rec.step({ title: `차이 ${gapText(best)}: ${listText(DFS_BEST.answer)}`, codeHighlights: BT.done, ...meta(), answer: DFS_BEST.answer, isKeyframe: true });
  rec.phase('결과', `배분 ${LEAVES.length}가지를 모두 살펴 가장 큰 차이 ${gapText(best)}인 ${josa(listText(DFS_BEST.answer), '을', '를')} 찾았습니다. 높은 점수부터 이기는 첫 배분(차이 ${gapText(resultOf(first).gap)})보다 9점, 8점, 6점을 이기는 쪽이 낫습니다.`, BT.done);
  rec.do(...together([...rowTo('b', DFS_BEST.answer, DFS_BEST.answer.map((x): Tone => (x > 0 ? 'path' : 'plain')), true), ...blankRow('r'), ...blankRow('d'), calcTo(`답 ${listText(DFS_BEST.answer)}`)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 마스크마다 (배분 만들기 → 점수 계산 → 비교하기), 나머지는 빨리 감기      */
/* ------------------------------------------------------------------ */

function everyMask(): Visualization {
  const rec = new StepRecorder(board('이길 점수를 10점~1점 중에서 고르는 모든 경우 (마스크 0 ~ 1023)', '최고 기록'));
  let work = 0;
  let best = 0;
  let mask = 0;
  let cur: number[] = Array(COLS).fill(0);
  const meta = (): Meta => ({ work, variables: { mask, ryan: listText(cur), best } });
  const bitsText = (m: number) => m.toString(2).padStart(10, '0');

  rec.step({ title: '마스크 1024가지 만들기', codeHighlights: MK.start, ...meta() });
  rec.phase('시작', `10점부터 1점까지 점수마다 이길지(1) 포기할지(0)를 비트 하나로 놓으면 모두 2^10 = 1024가지입니다. 마스크 0부터 1023까지 하나씩 배분을 만들어 점수 차이를 견줍니다.`, MK.start);
  rec.do(wait(300));

  const shown = [0, ...MASK_BEST.at.filter((i) => i > 0)];
  let from = 0;
  let prevBest = 0;
  let answer: number[] = [-1];
  for (const at of [...shown, MASKS.length]) {
    if (at > from) {
      const seg = MASKS.slice(from, at);
      const short = seg.filter((r) => !r).length;
      work += seg.length;
      mask = at - 1;
      rec.step({ title: `마스크 ${from}~${at - 1} 빨리 감기`, codeHighlights: MK.short, ...meta() });
      rec.phase('빨리 감기', `마스크 ${from}번부터 ${at - 1}번까지 ${seg.length}가지를 살핍니다. ${short ? `${short}가지는 화살이 모자라 건너뛰고` : ''}${short && seg.length > short ? ', ' : ''}${seg.length > short ? `${short ? '나머지는' : '모두'} 점수 차이가 최고 기록 ${gapJosa(prevBest, '을', '를')} 넘지 못합니다` : ''}.`, MK.short);
      rec.do(...together([...blankRow('r'), ...blankRow('d'), calcTo(`마스크 ${from}~${at - 1}: ${seg.length}가지 확인`)]));
    }
    if (at === MASKS.length) break;
    const ryan = MASKS[at]!;
    const res = resultOf(ryan);
    const up = improves(ryan, prevBest, answer);
    work += 1;
    mask = at;
    cur = [...ryan];
    if (up) best = res.gap;
    rec.step({ title: `마스크 ${at}: ${listText(ryan)} → 차이 ${gapText(res.gap)}${up ? ', 새 최고' : ''}`, codeHighlights: up ? MK.compare : MK.score, ...meta() });
    const winners = ryan.flatMap((x, i) => (x > INFO[i] ? [scoreOf(i)] : []));
    rec.phase('배분하기', `마스크 ${josa(at, '은', '는')} 이진수 ${bitsText(at)}입니다. ${winners.length ? `1인 자리의 점수(${pointsText(winners)})를 이기도록 쏘면 화살 ${ryan.reduce((a, b) => a + b, 0) - ryan[10]}발이 들고` : '1인 자리가 없어 이기는 점수가 없고'}, 남은 ${ryan[10]}발은 0점에 놓습니다.`, MK.make);
    rec.do(...together([...rowTo('r', ryan, allocTones(ryan, 'visited'), true), ...blankRow('d'), set('t:left', { text: `남은 화살 ${ryan[10]}` }, true)]));
    rec.phase('점수 계산', `점수마다 비교해 라이언 ${res.ryan}점, 어피치 ${res.apeach}점으로 차이는 ${gapText(res.gap)}입니다.`, MK.score);
    rec.do(...together(gainRow(ryan)));
    rec.do(...together(totalsTo(ryan)));
    rec.phase('비교하기', up
      ? `차이 ${gapJosa(res.gap, '이', '가')} 지금까지의 최고 ${gapText(prevBest)}보다 커서 새 최고 기록입니다.`
      : `차이 ${gapJosa(res.gap, '은', '는')} 이기지 못하는 배분이라 최고 기록으로 삼지 않습니다.`, MK.compare);
    if (up) {
      rec.do(...together([...rowTo('b', ryan, ryan.map((x): Tone => (x > 0 ? 'good' : 'plain')), true), calcTo(`최고 기록: 차이 ${gapText(res.gap)} ${listText(ryan)}`)]));
      prevBest = res.gap;
      answer = ryan;
    }
    from = at + 1;
  }

  cur = answer;
  rec.step({ title: `차이 ${gapText(best)}: ${listText(answer)}`, codeHighlights: MK.done, ...meta(), answer, isKeyframe: true });
  rec.phase('결과', `마스크 1024가지를 모두 살펴 가장 큰 차이 ${gapText(best)}인 ${josa(listText(answer), '을', '를')} 찾았습니다. 정답은 정석과 같지만, 화살이 모자란 ${MASKS.filter((r) => !r).length}가지도 배분을 만들고 확인해야 했습니다.`, MK.done);
  rec.do(...together([...rowTo('b', answer, answer.map((x): Tone => (x > 0 ? 'path' : 'plain')), true), ...blankRow('r'), ...blankRow('d'), calcTo(`답 ${listText(answer)}`)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: (살피기 → 쏘기)로 높은 점수부터 이기다 멈춤                          */
/* ------------------------------------------------------------------ */

function highFirst(): Visualization {
  const rec = new StepRecorder(board('높은 점수부터 이길 수 있으면 무조건 이깁니다', '정답'));
  let work = 0;
  let k = 0;
  let left = N;
  let cur: number[] = Array(COLS).fill(0);
  const meta = (): Meta => ({ work, variables: { k, left, ryan: listText(cur) } });

  rec.step({ title: '10점부터 이길 수 있으면 이기기', codeHighlights: HG.start, ...meta() });
  rec.phase('시작', `점수가 높을수록 좋으니 10점부터 차례로, 어피치보다 한 발 더 쏠 수 있으면 무조건 이기기로 합니다. 화살이 ${N}발 있습니다.`, HG.start);
  rec.do(wait(300));

  let s = 0;
  for (; s < 10 && left > INFO[s]; s++) {
    const cost = INFO[s] + 1;
    const l0 = left;
    left -= cost;
    cur = cur.map((x, i) => (i === s ? cost : x));
    k = s;
    rec.step({ title: `${scoreOf(s)}점: ${cost}발로 이김, 남은 화살 ${left}`, codeHighlights: HG.win, ...meta() });
    descend(rec, s, l0, HG.look, HG.win);
  }
  k = 9;
  work = 1;
  rec.step({ title: `${scoreOf(s)}점~1점: 화살이 없어 건너뜀`, codeHighlights: HG.skip, ...meta() });
  rec.phase('빨리 감기', `${scoreOf(s)}점부터 1점까지는 남은 화살이 ${left}발이라 어피치보다 한 발 더 쏠 수 없어 건너뜁니다. 남은 화살 ${left}발은 0점에 놓습니다.`, HG.skip);
  rec.do(...together([...Array.from({ length: 10 - s }, (_, i) => set(id('r', s + i), { text: '0', tone: 'explored' })), set(id('r', 10), { text: String(left), tone: 'explored' })]));

  const res = resultOf(GREEDY);
  const truth = resultOf(TRUTH);
  rec.step({ title: `차이 ${gapText(res.gap)} — 정답은 ${gapText(truth.gap)}`, codeHighlights: HG.done, ...meta(), answer: GREEDY, isKeyframe: true });
  rec.phase('비교하기', `${listText(GREEDY)}을 돌려줍니다. 점수는 라이언 ${res.ryan}점, 어피치 ${res.apeach}점으로 차이 ${gapText(res.gap)}입니다. 하지만 9점, 8점, 6점을 이기면 라이언 ${truth.ryan}점, 어피치 ${truth.apeach}점으로 차이 ${gapText(truth.gap)}입니다. 화살이 적게 드는 점수를 여러 개 이기는 편이 나을 수 있습니다.`.replace(`${listText(GREEDY)}을`, josa(listText(GREEDY), '을', '를')), HG.done);
  rec.do(...together([...gainRow(GREEDY), ...totalsTo(GREEDY)]));
  rec.do(...together([...rowTo('b', TRUTH, TRUTH.map((x): Tone => (x > 0 ? 'good' : 'plain')), true), calcTo(`내 답 차이 ${gapText(res.gap)} < 정답 차이 ${gapText(truth.gap)}`)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'archery',
  title: '양궁대회',
  level: 2,
  category: 'brute-force',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/92342',
  description: {
    summary:
      '어피치와 라이언이 양궁으로 겨룹니다. 어피치가 화살 n발을 먼저 쏘고, 라이언이 n발을 쏩니다. 10점부터 1점까지 점수마다 화살을 더 많이 맞힌 쪽이 그 점수를 가져가고(같으면 어피치), 아무도 맞히지 않은 점수는 아무도 못 가져갑니다. 한 점수에 여러 발을 맞혀도 그 점수 한 번만 얻습니다. 라이언이 어피치를 가장 큰 점수 차이로 이기게 쏘는 방법을 구하고, 이길 수 없으면 [-1]을 돌려줍니다. 차이가 같은 방법이 여러 개면 가장 낮은 점수를 더 많이 맞힌 쪽을 고릅니다.',
    rules: [
      'n은 1 이상 10 이하의 자연수',
      'info는 길이 11인 배열이고, i번째 값은 어피치가 (10 − i)점을 맞힌 화살 수 (합은 n)',
      '라이언이 이길 수 있으면 길이 11인 배열(합 n)로, 이길 수 없으면 [-1]을 반환',
      '라이언이 이길 수 있는 방법이 여러 개면, 가장 낮은 점수를 더 많이 맞힌 방법을 반환',
    ],
    examples: [
      { input: 'n = 5, info = [2,1,1,1,0,0,0,0,0,0,0]', output: '[0,2,2,0,1,0,0,0,0,0,0]' },
      { input: 'n = 1, info = [1,0,0,0,0,0,0,0,0,0,0]', output: '[-1]' },
      { input: 'n = 9, info = [0,0,1,2,0,1,1,1,1,1,1]', output: '[1,1,2,0,1,2,2,0,0,0,0]' },
      { input: 'n = 10, info = [0,0,0,0,0,0,0,0,3,4,3]', output: '[1,1,1,1,1,1,1,1,0,0,2]' },
    ],
  },
  keyIntuitions: [
    '라이언은 점수마다 "어피치보다 한 발 더 쏴서 이길지, 한 발도 안 쏘고 포기할지" 둘 중 하나만 정하면 됩니다. 이기려고 어중간하게 쏘는 것은 화살만 낭비합니다. 10점~1점이면 경우가 2^10 = 1024가지뿐이라 모두 살펴볼 수 있습니다.',
    '이길 점수를 정하고 남은 화살은 모두 0점에 놓으면 배분이 정해집니다. 라이언이 이긴 점수는 라이언이 얻고, 어피치가 맞혔는데 못 이긴 점수는 어피치가 얻습니다. 화살이 모자라면 그 가지는 더 내려가지 않고 포기만 합니다.',
    '높은 점수부터 이기는 그리디는 틀립니다. 10점을 이기는 데 화살이 많이 들면, 그 화살로 9점과 8점 둘을 이기는 편이 점수 차이가 더 큽니다. 차이가 같을 때는 낮은 점수를 더 많이 맞힌 배분을 고르는 규칙도 챙겨야 합니다.',
  ],
  demo: { input: [N, INFO], label: 'n = 5, info = [2,1,1,1,0,0,0,0,0,0,0]' },
  workUnit: '살펴본 배분 수',
  approaches: [
    {
      id: 'archery-backtracking',
      name: '점수마다 이길지 포기할지 정하는 백트래킹',
      rank: 'BEST',
      timeComplexity: 'O(2^10 × 11)',
      spaceComplexity: 'O(11)',
      verdict: '10점부터 점수마다 이기거나 포기하는 경우를 재귀로 내려가며, 화살이 모자라면 그 가지는 포기만 하고, 끝까지 간 배분의 점수 차이를 견줍니다.',
      pros: [
        '경우가 점수마다 둘뿐이라 가능한 배분을 빠짐없이 만들 수 있습니다.',
        '남은 화살이 모자라면 이기는 가지를 만들지 않아 쓸모없는 배분을 줄입니다.',
        '차이가 같을 때 낮은 점수를 더 많이 맞힌 쪽을 고르는 규칙을 한곳에서 처리합니다.',
      ],
      cons: [
        '재귀에서 값을 넣고 되돌리는(ryan[k] = 0) 줄을 빠뜨리기 쉽습니다.',
        '"남은 화살은 0점에"와 "같은 차이면 낮은 점수 우선"을 놓치면 오답이 납니다.',
      ],
      whyThisRank: `점수마다 이기거나 포기하는 두 갈래만 보면 되고, 화살이 없는 가지를 일찍 닫아 배분 ${LEAVES.length}가지만 살펴봅니다. 정답 규칙도 코드에 그대로 드러납니다.`,
      code: BEST,
      visualize: backtracking,
    },
    {
      id: 'archery-bitmask',
      name: '이길 점수를 고르는 모든 경우 (비트마스크)',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(2^10 × 11)',
      spaceComplexity: 'O(11)',
      verdict: '10점~1점 중 이길 점수를 고르는 1024가지를 마스크로 하나씩 만들어, 화살이 모자란 경우를 건너뛰고 점수 차이를 견줍니다.',
      pros: ['재귀 없이 반복문 하나로 모든 경우를 만들어 이해하기 쉽습니다.', '정석과 같은 답을 같은 규칙으로 구합니다.'],
      cons: [
        `화살이 모자란 경우도 일단 배분을 만들어 봐야 해서 마스크 ${MASKS.length}가지를 모두 확인합니다(정석은 ${LEAVES.length}가지).`,
        '비트 연산(mask >> k & 1)이 낯설면 읽기 어렵습니다.',
      ],
      whyThisRank: '정답은 같지만 화살이 모자란 경우를 미리 닫지 못해 낭비가 있습니다. 비트 연산도 재귀보다 읽기 어려워, 시험장에서는 백트래킹이 더 쓰기 쉽습니다.',
      code: MASK,
      visualize: everyMask,
    },
    {
      id: 'archery-high-first',
      name: '높은 점수부터 이기기 (그리디)',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(11)',
      spaceComplexity: 'O(11)',
      verdict: '10점부터 이길 수 있으면 무조건 이기는 풀이로, 화살이 적게 드는 점수를 놓쳐 오답이 나옵니다.',
      pros: ['점수 열한 칸을 한 번씩 훑을 뿐이라 가장 빠릅니다.', '어피치가 낮은 점수에 몰려 있는 입력에서는 우연히 맞습니다.'],
      cons: [
        `시각화 입력에서 10점(3발)과 9점(2발)을 이겨 ${listText(GREEDY)}이 되지만 차이는 ${gapText(resultOf(GREEDY).gap)}에 그칩니다. 정답 ${listText(TRUTH)}의 차이는 ${gapText(resultOf(TRUTH).gap)}입니다.`,
        '이길 수 있어도 화살을 많이 쓰는 점수가 오히려 손해일 수 있습니다.',
      ],
      whyThisRank: '점수가 높아도 이기는 데 화살이 많이 들면, 그 화살로 더 낮은 점수를 여러 개 이기는 쪽이 차이가 큽니다. 어떤 점수를 이길지는 가능한 경우를 모두 견주어 정해야 합니다.',
      code: HIGH,
      visualize: highFirst,
    },
  ],
  checks: {
    cases: [
      { args: [5, [2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]], expected: [0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0] },
      { args: [1, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], expected: [-1] },
      { args: [9, [0, 0, 1, 2, 0, 1, 1, 1, 1, 1, 1]], expected: [1, 1, 2, 0, 1, 2, 2, 0, 0, 0, 0] },
      { args: [10, [0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 3]], expected: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2] },
      { args: [1, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]], expected: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { args: [2, [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]], expected: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { args: [N, INFO], expected: [0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0] },
    ],
    // 화살 1~7발을 어피치가 11개 점수에 무작위로 나눠 쏜 입력
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 7);
      const info = Array<number>(11).fill(0);
      for (let i = 0; i < n; i++) info[Math.floor(rand() * 11)]++;
      return [n, info];
    },
  },
};

export default problem;
