// 모음사전: 정석 DFS로 사전 순서대로 세기, 대안 자릿수 가중치로 바로 계산, 함정 5진법으로 읽기.
// 정석은 단어를 한 글자씩 이어 붙이는 나무(칸 = 글자, 선 = 가지), 대안과 함정은 글자 칸을 자리별로 늘어놓은 표로 그린다.
// 사전의 단어는 모두 모음으로 끝나 읽을 때 받침이 없으므로, 단어 뒤 조사는 는·를·와·가로 쓴다.
import { around } from '../../engine/layout.ts';
import type { Action, Item, Point, Problem, Rect, Scene, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, ro, together } from '../shared.ts';
import { clear, holdCaptions, layoutTree, ringTo, set, tone, wait, type Shape } from './common.ts';

// 원문 예제 2. 세 풀이의 시각화 입력이자 점검 사례다. 정석은 10번째, 5진법으로 읽으면 2번째라 하는 오답이다.
const WORD = 'AAAE';
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const MAX = 5;
const q = (s: string) => `"${s}"`;
const idxOf = (ch: string) => VOWELS.indexOf(ch);
const WEIGHTS = [781, 156, 31, 6, 1]; // 자리 하나에서 글자 하나가 차지하는 단어 수: 1 + 5 × (아래 자리 값)
const RANK = [...WORD].reduce((s, ch, i) => s + idxOf(ch) * WEIGHTS[i] + 1, 0);
interface Meta { work: number; variables: Record<string, string | number> }

// 정석이 사전 순서대로 세는 단어들: 찾을 때까지. after는 이 단어를 센 뒤 dfs가 서 있을 자리(단어)다.
interface Visit { word: string; rank: number; found: boolean; after: string }
const VISITS: Visit[] = [];
{
  let count = 0;
  const dfs = (current: string): boolean => {
    if (current) {
      count++;
      VISITS.push({ word: current, rank: count, found: current === WORD, after: '' });
      if (current === WORD) return true;
    }
    if (current.length === MAX) return false;
    for (const v of VOWELS) if (dfs(current + v)) return true;
    return false;
  };
  dfs('');
  VISITS.forEach((v, k) => {
    v.after = VISITS[k + 1] ? VISITS[k + 1].word.slice(0, -1) : v.word;
  });
}

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST = {
  python: `def solution(word):
    count = 0

    def dfs(current):
        nonlocal count
        if current:
            count += 1  # 사전에 실린 순서대로 하나씩 셉니다
            if current == word:
                return True  # 찾았습니다
        if len(current) == 5:
            return False  # 5글자 단어는 더 이을 수 없습니다
        for vowel in "AEIOU":
            if dfs(current + vowel):  # A, E, I, O, U 순서로 한 글자씩 이어 붙입니다
                return True
        return False

    dfs("")
    return count`,
  javascript: `function solution(word) {
  let count = 0;

  const dfs = (current) => {
    if (current) {
      count++; // 사전에 실린 순서대로 하나씩 셉니다
      if (current === word) return true; // 찾았습니다
    }
    if (current.length === 5) return false; // 5글자 단어는 더 이을 수 없습니다
    for (const vowel of "AEIOU") {
      if (dfs(current + vowel)) return true; // A, E, I, O, U 순서로 한 글자씩 이어 붙입니다
    }
    return false;
  };

  dfs("");
  return count;
}`,
};
const DFS_AT = {
  start: lines(BEST, ['count = 0', 'dfs("")'], ['let count = 0', 'dfs("")']),
  extend: lines(BEST, ['for vowel in "AEIOU":', 'if dfs(current + vowel):'], ['for (const vowel of "AEIOU")', 'if (dfs(current + vowel)) return true']),
  count: lines(BEST, ['if current:', 'count += 1'], ['if (current) {', 'count++']),
  compare: lines(BEST, ['if current == word:'], ['if (current === word) return true']),
  found: lines(BEST, ['if current == word:', 'return True'], ['if (current === word) return true']),
  back: lines(BEST, ['if len(current) == 5:', 'return False'], ['if (current.length === 5) return false']),
  done: lines(BEST, ['dfs("")', 'return count'], ['dfs("")', 'return count']),
};

const FORMULA = {
  python: `def solution(word):
    # 자리 하나에서 글자 하나가 차지하는 단어 수(자기 자신 + 아래에 이어지는 모든 단어)
    # 마지막 자리 1, 그 앞은 5 × 1 + 1 = 6, 5 × 6 + 1 = 31, 5 × 31 + 1 = 156, 5 × 156 + 1 = 781
    weights = [781, 156, 31, 6, 1]
    answer = 0
    for i, ch in enumerate(word):
        # ch보다 앞선 모음 수만큼 통째로 건너뛰고, 자기 자신(+1)을 더합니다
        answer += "AEIOU".index(ch) * weights[i] + 1
    return answer`,
  javascript: `function solution(word) {
  // 자리 하나에서 글자 하나가 차지하는 단어 수(자기 자신 + 아래에 이어지는 모든 단어)
  // 마지막 자리 1, 그 앞은 5 × 1 + 1 = 6, 5 × 6 + 1 = 31, 5 × 31 + 1 = 156, 5 × 156 + 1 = 781
  const weights = [781, 156, 31, 6, 1];
  let answer = 0;
  for (let i = 0; i < word.length; i++) {
    // word[i]보다 앞선 모음 수만큼 통째로 건너뛰고, 자기 자신(+1)을 더합니다
    answer += "AEIOU".indexOf(word[i]) * weights[i] + 1;
  }
  return answer;
}`,
};
const FM_AT = {
  weights: lines(FORMULA, ['weights = [781, 156, 31, 6, 1]'], ['const weights = [781, 156, 31, 6, 1]']),
  skip: lines(FORMULA, ['for i, ch in enumerate(word):', 'answer += "AEIOU".index(ch)'], ['for (let i = 0; i < word.length; i++)', 'answer += "AEIOU".indexOf(word[i])']),
  add: lines(FORMULA, ['answer += "AEIOU".index(ch) * weights[i] + 1'], ['answer += "AEIOU".indexOf(word[i]) * weights[i] + 1']),
  done: lines(FORMULA, ['return answer'], ['return answer']),
};

const BASE5 = {
  python: `# 주의: 알파벳을 5진법 숫자(A=0, E=1, I=2, O=3, U=4)처럼 읽는 오답 풀이입니다
def solution(word):
    answer = 0
    for ch in word:
        answer = answer * 5 + "AEIOU".index(ch)
    return answer + 1`,
  javascript: `// 주의: 알파벳을 5진법 숫자(A=0, E=1, I=2, O=3, U=4)처럼 읽는 오답 풀이입니다
function solution(word) {
  let answer = 0;
  for (const ch of word) {
    answer = answer * 5 + "AEIOU".indexOf(ch);
  }
  return answer + 1;
}`,
};
const B5_AT = {
  start: lines(BASE5, ['answer = 0'], ['let answer = 0']),
  digit: lines(BASE5, ['for ch in word:', '"AEIOU".index(ch)'], ['for (const ch of word)', '"AEIOU".indexOf(ch)']),
  mul: lines(BASE5, ['answer = answer * 5 + "AEIOU".index(ch)'], ['answer = answer * 5 + "AEIOU".indexOf(ch)']),
  done: lines(BASE5, ['return answer + 1'], ['return answer + 1']),
};

/* ------------------------------------------------------------------ */
/* 정석: 이어 붙이기 → 세기 → 비교하기 → 되돌아가기                         */
/* ------------------------------------------------------------------ */

// 나무: 단어마다 칸 하나(글자 하나), 가지 끝(단어)마다 가로 칸을 하나씩 받는다. 칸 위 왼쪽 작은 글씨는 사전에서 몇 번째인지다.
// 세로: 안내 글 0~16, 나무 30~360(칸 54×40, 깊이마다 58px), 계수기와 계산 글 376~406. 가로: 가지 끝 여섯이 12~386.
const W = 420;
const H_TREE = 418;
const FULL: Rect = { x: 0, y: 0, w: W, h: H_TREE }; // line은 rect 대신 points로 그린다
const TREE = { x: 12, y: 30, w: 54, h: 40, gapX: 10, gapY: 18 };
const keyOf = (word: string) => `n:${word}`;
const ROOT: Shape = { id: keyOf(''), kids: [] };
{
  const byKey = new Map<string, Shape>([[ROOT.id, ROOT]]);
  for (const v of VISITS) {
    const shape: Shape = { id: keyOf(v.word), kids: [] };
    byKey.get(keyOf(v.word.slice(0, -1)))!.kids!.push(shape);
    byKey.set(shape.id, shape);
  }
}
const RECTS = layoutTree(ROOT, TREE);
const nodeRect = (word: string) => RECTS.get(keyOf(word))!;
// 가지: 부모 칸 아래 가운데에서 내려가 옆으로 가고 자식 칸 위 가운데로 내려간다(형제 가지가 한 가로선을 나눠 쓴다)
const elbow = (p: Rect, c: Rect): Point[] => {
  const [px, cx, pb, ct] = [p.x + p.w / 2, c.x + c.w / 2, p.y + p.h, c.y];
  const mid = (pb + ct) / 2;
  return px === cx ? [[px, pb], [cx, ct]] : [[px, pb], [px, mid], [cx, mid], [cx, ct]];
};

function treeBoard(): Scene {
  return {
    width: W,
    height: H_TREE,
    items: [
      { id: 'title', kind: 'text', rect: { x: 12, y: 0, w: 396, h: 16 }, tone: 'muted', text: `찾는 단어 ${q(WORD)} · A, E, I, O, U 순서로 깊이 우선 탐색` },
      { id: keyOf(''), kind: 'cell', rect: nodeRect(''), tone: 'visited', text: '""', tag: '빈 단어' },
      { id: 't:count', kind: 'token', rect: { x: 12, y: 376, w: 130, h: 30 }, tone: 'chosen', text: '센 단어 0개' },
      { id: 'calc', kind: 'text', rect: { x: 150, y: 376, w: 258, h: 30 }, text: '' },
    ],
  };
}

function dfsOrder(): Visualization {
  const rec = new StepRecorder(treeBoard());
  let frame = ''; // 지금 dfs가 서 있는 자리(단어)
  let count = 0;
  const meta = (): Meta => ({ work: count, variables: { current: q(frame), count } });

  rec.step({ title: 'dfs("")에서 시작', codeHighlights: DFS_AT.start, ...meta() });
  rec.phase('시작', `사전의 단어는 모두 빈 단어에 A, E, I, O, U를 한 글자씩 이어 붙여 만들어집니다. 이 순서대로 깊이 우선으로 훑으며 단어를 하나씩 세다가 ${q(WORD)}를 만나면 멈춥니다.`, DFS_AT.start);
  rec.do(ringTo(rec, around(nodeRect(''), 4)), wait(300));

  VISITS.forEach((v) => {
    const parent = v.word.slice(0, -1);
    const letter = v.word.at(-1)!;
    const [id, pid] = [keyOf(v.word), keyOf(parent)];
    const levels = v.word.length - v.after.length; // 되돌아갈 칸 수
    count = v.rank;
    frame = v.after;

    rec.step({ title: `${q(v.word)} → ${v.rank}번째${v.found ? ', 찾음' : ''}`, codeHighlights: v.found ? DFS_AT.found : DFS_AT.count, ...meta() });
    rec.phase('이어 붙이기', `${parent ? q(parent) : '빈 단어'} 뒤에 ${letter}를 붙여 ${q(v.word)}를 만듭니다.`, DFS_AT.extend);
    rec.do(...together([
      { type: 'add', item: { id, kind: 'cell', rect: nodeRect(v.word), tone: 'queued', text: letter }, from: pid },
      { type: 'add', item: { id: `e:${v.word}`, kind: 'line', rect: FULL, tone: 'trail', points: elbow(nodeRect(parent), nodeRect(v.word)) } },
      ringTo(rec, around(nodeRect(v.word), 4)),
      set('calc', { text: `${parent ? q(parent) : '""'} + ${letter} = ${q(v.word)}` }),
    ]));

    rec.phase('세기', `사전에 실린 순서대로 세어 ${v.rank}번째 단어입니다.`, DFS_AT.count);
    rec.do(...together([set(id, { tone: 'visited', tag: `${v.rank}번째` }, true), set('t:count', { text: `센 단어 ${v.rank}개` }, true)]));

    rec.phase('비교하기', v.found
      ? `${q(v.word)}는 찾는 단어 ${q(WORD)}와 같습니다! 사전에서 ${v.rank}번째이니 답은 ${v.rank}이고, 바로 멈춥니다.`
      : `${q(v.word)}는 찾는 단어 ${q(WORD)}와 다릅니다. 계속 찾습니다.`, v.found ? DFS_AT.found : DFS_AT.compare);
    rec.do({ type: 'focus', ids: [pid, id] });
    rec.do({ type: 'arrow', from: pid, to: id, verdict: (v.found ? 'good' : 'bad') as Verdict, label: v.found ? '같음!' : '다름' }, wait(200));
    rec.do(...together([...clear(), set('calc', { text: `${q(v.word)} ${v.found ? '=' : '≠'} ${q(WORD)}` })]));

    if (levels > 0) {
      const exhausted = levels > 1;
      rec.phase('되돌아가기', exhausted
        ? `${q(parent)}에 이을 모음을 모두 써서 ${v.after ? `${q(v.after)} 자리` : '맨 처음 자리'}까지 돌아갑니다.`
        : `${v.word.length === MAX ? '5글자라 더 이을 수 없어' : '더 이을 수 없어'} ${v.after ? `${q(v.after)} 자리` : '맨 처음 자리'}로 돌아가 다음 모음을 붙여 봅니다.`, DFS_AT.back);
      rec.do(ringTo(rec, around(nodeRect(v.after), 4)));
    }
  });

  const path = [...WORD].map((_, i) => WORD.slice(0, i + 1));
  rec.step({ title: `${RANK}번째`, codeHighlights: DFS_AT.done, ...meta(), answer: count, isKeyframe: true });
  rec.phase('결과', `${q(WORD)}를 사전의 ${count}번째 단어로 찾았습니다. 단어 3,905개를 모두 만들지 않고 ${count}개만 세고 멈췄습니다.`, DFS_AT.done);
  rec.do(...together([
    { type: 'remove', id: 'ring' },
    ...['', ...path].map((w) => tone(keyOf(w), 'path')),
    tone('t:count', 'path', true),
    set('calc', { text: `${q(WORD)} → ${count}번째` }),
  ]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 가중치 구하기 → (앞선 모음 세기 → 더하기) → 결과                    */
/* ------------------------------------------------------------------ */

// 표: 다섯 자리를 열로, 단어 수(가중치) · 글자 · 더한 값을 줄로 놓는다. 세로: 안내 글 0~16, 가중치 40~84, 글자 118~162, 더한 값 196~240, 합계 262~292, 계산 글 300~326.
const H_TABLE = 336;
const colX = (i: number) => 60 + i * 70;
const rowRect = (i: number, y: number): Rect => ({ x: colX(i), y, w: 60, h: 44 });
const labelItem = (id: string, y: number, text: string): Item => ({ id, kind: 'text', rect: { x: 4, y, w: 52, h: 44 }, tone: 'muted', text });
const calcItem = (y: number): Item => ({ id: 'calc', kind: 'text', rect: { x: 12, y, w: 396, h: 26 }, text: '' });
const letterCells = (y: number): Item[] =>
  [...WORD].map((ch, i): Item => ({ id: `l:${i}`, kind: 'cell', rect: rowRect(i, y), tone: 'plain', text: ch }));

function formula(): Visualization {
  const rec = new StepRecorder({
    width: W,
    height: H_TABLE,
    items: [
      { id: 'title', kind: 'text', rect: { x: 12, y: 0, w: 396, h: 16 }, tone: 'muted', text: `${q(WORD)}의 순서 = 자리마다 (앞선 모음 수 × 단어 수 + 1)을 더한 값` },
      labelItem('lab:w', 40, '단어 수'),
      labelItem('lab:l', 118, '글자'),
      labelItem('lab:c', 196, '더한 값'),
      ...letterCells(118),
      { id: 't:ans', kind: 'token', rect: { x: 60, y: 262, w: 160, h: 30 }, tone: 'chosen', text: '순서 0' },
      calcItem(300),
    ],
  });
  let total = 0;
  let done = 0; // 더한 글자 수
  let at: number | undefined;
  const meta = (): Meta => ({
    work: done,
    variables: { i: at ?? '-', answer: total },
  });

  rec.step({ title: '자리마다 단어 수 구하기', codeHighlights: FM_AT.weights, ...meta() });
  rec.phase('가중치 구하기', '마지막 자리는 1, 그 앞은 5 × 1 + 1 = 6, 5 × 6 + 1 = 31, 5 × 31 + 1 = 156, 5 × 156 + 1 = 781입니다. 자리 하나에서 글자 하나가 차지하는 단어 수(자기 자신과 아래에 이어지는 모든 단어)입니다.', FM_AT.weights);
  rec.do(...together(WEIGHTS.map((w, i): Action => ({ type: 'add', item: { id: `w:${i}`, kind: 'cell', rect: rowRect(i, 40), tone: 'plain', text: String(w), tag: `자리 ${i + 1}` } }))));

  [...WORD].forEach((ch, i) => {
    const idx = idxOf(ch);
    const add = idx * WEIGHTS[i] + 1;
    at = i;
    total += add;
    done++;
    rec.step({ title: `${i + 1}번째 글자 ${ch}: ${idx} × ${WEIGHTS[i]} + 1 = ${add}`, codeHighlights: FM_AT.add, ...meta() });
    rec.phase('앞선 모음 세기', `${ch} 앞에는 모음이 ${idx}개 있고, 모음 하나마다 단어 ${WEIGHTS[i]}개를 통째로 건너뜁니다.`, FM_AT.skip);
    rec.do({ type: 'focus', ids: [`l:${i}`, `w:${i}`] });
    rec.do({ type: 'arrow', from: `l:${i}`, to: `w:${i}`, verdict: 'new', label: `앞 ${idx}개 × ${WEIGHTS[i]}` }, wait(150));
    rec.phase('더하기', `${idx} × ${WEIGHTS[i]} + 1 = ${josa(add, '을', '를')} 더해 순서는 ${josa(total, '이', '가')} 됩니다.`, FM_AT.add);
    rec.do(...together([
      ...clear(),
      { type: 'add', item: { id: `c:${i}`, kind: 'cell', rect: rowRect(i, 196), tone: 'visited', text: String(add), tag: `${idx}×${WEIGHTS[i]}+1` }, from: `l:${i}` },
      set('t:ans', { text: `순서 ${total}` }, true),
      set('calc', { text: `${[...WORD].slice(0, i + 1).map((c, k) => idxOf(c) * WEIGHTS[k] + 1).join(' + ')} = ${total}` }),
    ]), wait(350));
  });

  at = undefined;
  rec.step({ title: `${total}번째`, codeHighlights: FM_AT.done, ...meta(), answer: total, isKeyframe: true });
  rec.phase('결과', `${q(WORD)}는 사전의 ${total}번째 단어입니다. 단어를 하나도 만들지 않고 글자 ${WORD.length}개만 계산했습니다.`, FM_AT.done);
  rec.do(...together([...[...WORD].map((_, i) => tone(`c:${i}`, 'path')), tone('t:ans', 'path', true), set('calc', { text: `${q(WORD)} → ${total}번째` })]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: 숫자로 바꾸기 → 5배 하고 더하기 → 비교하기                         */
/* ------------------------------------------------------------------ */

const H_BASE = 340;
const REAL = VISITS.map((v) => v.word).join(', '); // 실제 사전에서 word까지의 단어들

function base5(): Visualization {
  const rec = new StepRecorder({
    width: W,
    height: H_BASE,
    items: [
      { id: 'title', kind: 'text', rect: { x: 12, y: 0, w: 396, h: 16 }, tone: 'muted', text: 'A=0, E=1, I=2, O=3, U=4로 놓고 5진법 수처럼 읽습니다' },
      labelItem('lab:l', 40, '글자'),
      labelItem('lab:d', 118, '숫자'),
      ...letterCells(40),
      { id: 't:val', kind: 'token', rect: { x: 60, y: 196, w: 200, h: 30 }, tone: 'chosen', text: '값(answer) 0' },
      { id: 'calc', kind: 'text', rect: { x: 12, y: 234, w: 396, h: 26 }, text: '' },
    ],
  });
  let answer = 0;
  let done = 0;
  let ch: string | undefined;
  const meta = (): Meta => ({ work: done, variables: { ch: ch ?? '-', answer } });

  rec.step({ title: '5진법으로 읽어 보기', codeHighlights: B5_AT.start, ...meta() });
  rec.phase('시작', '모음이 5개라서 사전 순서가 5진법 수처럼 늘어설 것 같습니다. A=0, E=1, I=2, O=3, U=4로 놓고 왼쪽 글자부터 읽어 갑니다.', B5_AT.start);
  rec.do(wait(300));

  [...WORD].forEach((c, i) => {
    const idx = idxOf(c);
    const prev = answer;
    answer = answer * 5 + idx;
    done++;
    ch = c;
    rec.step({ title: `${c} → ${idx}: ${prev} × 5 + ${idx} = ${answer}`, codeHighlights: B5_AT.mul, ...meta() });
    rec.phase('숫자로 바꾸기', `${c}는 ${VOWELS.join(', ')} 중 ${idx + 1}번째라 숫자 ${ro(idx)} 읽습니다.`, B5_AT.digit);
    rec.do({ type: 'focus', ids: [`l:${i}`] });
    rec.do({ type: 'add', item: { id: `d:${i}`, kind: 'cell', rect: rowRect(i, 118), tone: 'queued', text: String(idx) }, from: `l:${i}` });
    rec.do({ type: 'arrow', from: `l:${i}`, to: `d:${i}`, verdict: 'new', label: `${c} = ${idx}` }, wait(150));
    rec.phase('5배 하고 더하기', `지금까지의 값 ${prev}에 5를 곱하고 ${josa(idx, '을', '를')} 더해 ${answer}입니다.`, B5_AT.mul);
    rec.do(...together([...clear(), tone(`d:${i}`, 'visited'), set('t:val', { text: `값(answer) ${answer}` }, true), set('calc', { text: `${prev} × 5 + ${idx} = ${answer}` })]));
  });

  ch = undefined;
  rec.step({ title: `${answer + 1}번째 — 정답은 ${RANK}번째`, codeHighlights: B5_AT.done, ...meta(), answer: answer + 1, isKeyframe: true });
  rec.phase('비교하기', `${answer}에 1을 더해 ${answer + 1}번째라고 답합니다. 하지만 실제 사전에는 ${q(WORD)}보다 앞에 ${RANK - 1}개의 단어가 있어 ${RANK}번째입니다. A, AA, AAA처럼 짧은 단어가 먼저 나오는 순서라 5진법과 다릅니다.`, B5_AT.done);
  rec.do(...together([tone('t:val', 'bad', true), set('calc', { text: `내 답 ${answer + 1}번째 ≠ 정답 ${RANK}번째` })]));
  rec.do({ type: 'add', item: { id: 'real', kind: 'text', rect: { x: 12, y: 268, w: 396, h: 36 }, text: `실제 사전: ${REAL}` } });
  rec.do({ type: 'add', item: { id: 't:mine', kind: 'token', rect: { x: 12, y: 306, w: 130, h: 30 }, tone: 'bad', text: `내 답 ${answer + 1}번째` } });
  rec.do({ type: 'add', item: { id: 't:truth', kind: 'token', rect: { x: 150, y: 306, w: 130, h: 30 }, tone: 'good', text: `정답 ${RANK}번째` } });
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'vowel-dictionary',
  title: '모음사전',
  level: 2,
  category: 'brute-force',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/84512',
  description: {
    summary:
      '알파벳 모음 A, E, I, O, U만으로 만들 수 있는, 길이가 5 이하인 모든 단어가 사전 순서로 실려 있는 사전이 있습니다. 첫 단어는 A이고, 그다음은 AA, AAA, AAAA, AAAAA, AAAAE …처럼 이어집니다. 단어 word가 주어질 때, 이 사전에서 word가 몇 번째 단어인지 구합니다.',
    rules: ['word의 길이는 1 이상 5 이하', "word는 알파벳 대문자 'A', 'E', 'I', 'O', 'U'로만 이루어짐"],
    examples: [
      { input: 'word = "AAAAE"', output: '6' },
      { input: 'word = "AAAE"', output: '10' },
      { input: 'word = "I"', output: '1563' },
      { input: 'word = "EIO"', output: '1189' },
    ],
  },
  keyIntuitions: [
    '사전의 단어는 빈 단어에 A, E, I, O, U를 한 글자씩 이어 붙여 만든 나무의 마디입니다. 이 나무를 A, E, I, O, U 순서로 깊이 우선으로 훑으면 단어가 사전 순서대로 나옵니다.',
    '단어는 모두 5 + 25 + 125 + 625 + 3,125 = 3,905개뿐이라, 처음부터 세다가 word를 만나면 멈춰도 충분합니다.',
    '더 나아가면 자리마다 글자 하나가 차지하는 단어 수(781, 156, 31, 6, 1)로 곧바로 계산할 수 있습니다. 하지만 5진법 수처럼 읽으면 짧은 단어(접두어)가 먼저 나오는 사전 순서와 맞지 않아 틀립니다.',
  ],
  demo: { input: [WORD], label: 'word = "AAAE"' },
  workUnit: '세거나 더한 횟수',
  approaches: [
    {
      id: 'vowel-dfs',
      name: 'DFS로 사전 순서대로 세기',
      rank: 'BEST',
      timeComplexity: 'O(5^L)',
      spaceComplexity: 'O(L)',
      verdict: '빈 단어에 A, E, I, O, U를 차례로 이어 붙이며 깊이 우선으로 훑고, 단어를 만날 때마다 세다가 word를 만나면 멈춥니다.',
      pros: [
        '사전이 만들어지는 과정을 그대로 따라가서 이해하기 쉽습니다.',
        '단어가 3,905개뿐이라 처음부터 세어도 충분히 빠릅니다.',
        '모음 수나 최대 길이가 바뀌어도 코드를 거의 고치지 않습니다.',
      ],
      cons: [
        '앞쪽 단어는 금방 찾지만 UUUUU 근처면 3,905개를 모두 셉니다.',
        '5글자에서 멈추는 종료 조건과, 찾았을 때 바로 멈추기를 챙겨야 합니다.',
      ],
      whyThisRank: '사전 순서는 곧 깊이 우선 탐색의 방문 순서입니다. 단어가 3,905개뿐이라 모두 세어도 되고, 규칙을 외울 필요 없이 코드가 문제 설명 그대로입니다.',
      code: BEST,
      visualize: dfsOrder,
    },
    {
      id: 'vowel-weights',
      name: '자릿수 가중치로 바로 계산',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(L)',
      spaceComplexity: 'O(1)',
      verdict: '자리마다 글자 하나가 차지하는 단어 수(781, 156, 31, 6, 1)를 알아 두고, 앞선 모음 수를 곱해 더해 순서를 바로 구합니다.',
      pros: ['반복이 글자 수(최대 5)뿐이라 가장 빠릅니다.', '단어를 하나도 만들지 않아 메모리도 거의 쓰지 않습니다.'],
      cons: [
        '781, 156, 31, 6, 1이 어디서 나오는지 모르면 외워서 쓰게 됩니다.',
        '모음 수나 최대 길이가 바뀌면 가중치를 다시 계산해야 해서, 규칙이 바뀌는 문제에는 약합니다.',
      ],
      whyThisRank: '더 빠르지만 단어가 3,905개뿐이라 정석으로도 충분합니다. 규칙을 먼저 알아채야 해서, 틀릴 위험이 적은 쪽은 사전을 그대로 세는 정석입니다.',
      code: FORMULA,
      visualize: formula,
    },
    {
      id: 'vowel-base5',
      name: '5진법으로 읽기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(L)',
      spaceComplexity: 'O(1)',
      verdict: '모음이 다섯 개라 5진법 수처럼 읽으려다, 짧은 단어가 먼저 나오는 사전 순서를 놓쳐 오답이 나옵니다.',
      pros: ['코드가 몇 줄뿐이고 아주 빠릅니다.', '길이가 같은 단어끼리의 순서는 맞습니다.'],
      cons: [
        '"AAAE"를 5진수 0001로 읽어 2번째라고 답하지만, 실제로는 A, AA, AAA … 9개가 먼저 나와 10번째입니다.',
        '짧은 단어(접두어)가 긴 단어보다 먼저 실려 있다는 점을 놓칩니다.',
      ],
      whyThisRank: '이 사전은 "A"가 "AA"보다 앞서듯 접두어가 먼저 나오는 구조라, 숫자 크기 순서와 다릅니다. 글자 앞에서 건너뛰는 단어 수에 자기 자신까지 함께 세어야 합니다.',
      code: BASE5,
      visualize: base5,
    },
  ],
  checks: {
    cases: [
      { args: ['AAAAE'], expected: 6 },
      { args: ['AAAE'], expected: 10 },
      { args: ['I'], expected: 1563 },
      { args: ['EIO'], expected: 1189 },
      { args: ['A'], expected: 1 },
      { args: ['AAAAA'], expected: 5 },
      { args: ['E'], expected: 782 },
      { args: ['AEIOU'], expected: 245 },
      { args: ['UUUUU'], expected: 3905 },
      { args: [WORD], expected: 10 },
    ],
    // 길이 1~5의 무작위 단어
    random: (rand) => [Array.from({ length: 1 + Math.floor(rand() * 5) }, () => VOWELS[Math.floor(rand() * 5)]).join('')],
  },
};

export default problem;
