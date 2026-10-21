// 숫자 게임: 정석 정렬 후 약한 B부터 이기는 짝(두 포인터), 대안 A마다 이길 수 있는 가장 약한 B를 훑어 찾기, 함정 정렬 후 같은 순위끼리 비교를 같은 장면에서 움직인다.
// 장면은 위에 A팀 카드 한 줄, 아래에 B팀 카드 한 줄(정렬하면 카드가 미끄러져 자리를 바꿈), 위아래에 포인터와 승점 표시다.
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { josa, lines, ro, together } from '../shared.ts';
import { PacedRecorder } from './paced.ts';

// 시각화 입력. 정석은 7점, 정렬한 뒤 같은 순위끼리만 겨루면 5점(오답)이 나온다.
const A = [7, 3, 10, 5, 8, 4, 9, 6];
const B = [9, 4, 11, 2, 7, 10, 5, 8];
const N = A.length;
const order = (xs: number[]) => xs.map((_, i) => i).sort((p, q) => xs[p] - xs[q] || p - q); // 작은 순서의 입력 번호
const A_ORDER = order(A);
const B_ORDER = order(B);
const AS = A_ORDER.map((i) => A[i]); // 정렬한 A
const BS = B_ORDER.map((i) => B[i]);
const TRUTH = (() => {
  let [a, n] = [0, 0];
  for (const b of BS) if (b > AS[a]) [a, n] = [a + 1, n + 1];
  return n;
})();

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TWO_POINTERS = {
  python: `def solution(A, B):
    A.sort()                           # 약한 A부터
    B.sort()                           # 약한 B부터
    answer = 0
    a = 0                              # 아직 못 이긴 가장 약한 A
    for b in B:                        # B를 약한 순서로 낸다
        if b > A[a]:                   # 가장 약한 A를 이길 수 있으면 이긴다
            answer += 1
            a += 1
    return answer`,
  javascript: `function solution(A, B) {
  A.sort((x, y) => x - y); // 약한 A부터
  B.sort((x, y) => x - y); // 약한 B부터
  let answer = 0;
  let a = 0; // 아직 못 이긴 가장 약한 A
  for (const b of B) { // B를 약한 순서로 낸다
    if (b > A[a]) { // 가장 약한 A를 이길 수 있으면 이긴다
      answer++;
      a++;
    }
  }
  return answer;
}`,
};
const TWO_AT = {
  sort: lines(TWO_POINTERS, ['A.sort()', 'B.sort()'], ['A.sort(', 'B.sort(']),
  init: lines(TWO_POINTERS, ['answer = 0', 'a = 0'], ['let answer = 0', 'let a = 0']),
  look: lines(TWO_POINTERS, ['for b in B', 'if b > A[a]'], ['for (const b of B)', 'if (b > A[a])']),
  win: lines(TWO_POINTERS, ['answer += 1', 'a += 1'], ['answer++', 'a++']),
  done: lines(TWO_POINTERS, ['for b in B', 'return answer'], ['for (const b of B)', 'return answer']),
};

const SCAN = {
  python: `def solution(A, B):
    A.sort()                           # 약한 A부터
    B.sort()
    used = [False] * len(B)            # 이미 낸 B
    answer = 0
    for a in A:
        for i in range(len(B)):        # 약한 B부터 훑으며 a를 이길 수 있는 첫 B를 찾는다
            if not used[i] and B[i] > a:
                used[i] = True
                answer += 1
                break
    return answer`,
  javascript: `function solution(A, B) {
  A.sort((x, y) => x - y); // 약한 A부터
  B.sort((x, y) => x - y);
  const used = new Array(B.length).fill(false); // 이미 낸 B
  let answer = 0;
  for (const a of A) {
    for (let i = 0; i < B.length; i++) { // 약한 B부터 훑으며 a를 이길 수 있는 첫 B를 찾는다
      if (!used[i] && B[i] > a) {
        used[i] = true;
        answer++;
        break;
      }
    }
  }
  return answer;
}`,
};
const SCAN_AT = {
  sort: lines(SCAN, ['A.sort()', 'B.sort()'], ['A.sort(', 'B.sort(']),
  init: lines(SCAN, ['used = [False] * len(B)', 'answer = 0'], ['const used = new Array(B.length)', 'let answer = 0']),
  look: lines(SCAN, ['for a in A', 'for i in range(len(B))', 'if not used[i] and B[i] > a'], ['for (const a of A)', 'for (let i = 0; i < B.length; i++)', 'if (!used[i] && B[i] > a)']),
  win: lines(SCAN, ['used[i] = True', 'answer += 1', 'break'], ['used[i] = true', 'answer++', 'break']),
  done: lines(SCAN, ['for a in A', 'return answer'], ['for (const a of A)', 'return answer']),
};

const SAME_RANK = {
  python: `def solution(A, B):
    A.sort()
    B.sort()
    answer = 0
    for i in range(len(A)):            # 같은 순위끼리 겨룬다 (i번째로 약한 B와 A)
        if B[i] > A[i]:
            answer += 1
    return answer  # A = [2, 10], B = [1, 5]는 0점 (정답은 1점)`,
  javascript: `function solution(A, B) {
  A.sort((x, y) => x - y);
  B.sort((x, y) => x - y);
  let answer = 0;
  for (let i = 0; i < A.length; i++) { // 같은 순위끼리 겨룬다 (i번째로 약한 B와 A)
    if (B[i] > A[i]) answer++;
  }
  return answer; // A = [2, 10], B = [1, 5]는 0점 (정답은 1점)
}`,
};
const RANK_AT = {
  sort: lines(SAME_RANK, ['A.sort()', 'B.sort()'], ['A.sort(', 'B.sort(']),
  init: lines(SAME_RANK, ['answer = 0'], ['let answer = 0']),
  look: lines(SAME_RANK, ['for i in range(len(A))', 'if B[i] > A[i]'], ['for (let i = 0; i < A.length; i++)', 'if (B[i] > A[i])']),
  win: lines(SAME_RANK, ['answer += 1'], ['answer++']),
  done: lines(SAME_RANK, ['for i in range(len(A))', 'return answer'], ['for (let i = 0; i < A.length; i++)', 'return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 64px은 팀 이름, 카드는 x 70부터 56px씩(카드 50px). 오른쪽 60px은 맨 끝 포인터가 장면 안에 들도록 둔 여백이다.
// 세로 띠: A 포인터 0~18, A 카드 40~88(판정 표시가 카드 위 11px에 붙는다), B 카드 136~184, B 포인터 192~212, 승점 표시 226~254.
const X0 = 70;
const PITCH = 56;
const CARD = 50;
const A_Y = 40;
const B_Y = 136;
const cardX = (s: number) => X0 + s * PITCH;
const cardRect = (row: 'a' | 'b', slot: number): Rect => ({ x: cardX(slot), y: row === 'a' ? A_Y : B_Y, w: CARD, h: 48 });
const ptrRect = (row: 'a' | 'b', slot: number): Rect => ({ x: cardX(Math.min(slot, N)) + 7, y: row === 'a' ? 0 : 192, w: 36, h: row === 'a' ? 18 : 20 });
const aId = (i: number) => `a:${i}`;
const bId = (i: number) => `b:${i}`;
const sA = (s: number) => aId(A_ORDER[s]); // 정렬한 s번째 A 카드
const sB = (s: number) => bId(B_ORDER[s]);
const SCORE_AT: Rect = { x: X0, y: 226, w: 120, h: 28 };
const TRUTH_AT: Rect = { x: X0 + 130, y: 226, w: 140, h: 28 };

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const paint = (ids: string[], tone: Tone): Action[] => ids.map((id): Action => ({ type: 'set', id, patch: { tone } }));
const score = (n: number, tone: Tone = 'chosen', text = `승점 ${n}`): Action => ({ type: 'set', id: 'tok:score', patch: { text, tone }, pop: true });
const ptrTo = (rec: PacedRecorder, row: 'a' | 'b', slot: number, name: string): Action => {
  const id = `ptr:${row}`;
  return rec.has(id) ? { type: 'set', id, patch: { rect: ptrRect(row, slot) } } : { type: 'add', item: { id, kind: 'token', rect: ptrRect(row, slot), tone: 'chosen', text: name } };
};

// 세 풀이가 같이 쓰는 장면: A팀과 B팀 카드(입력 순서), 팀 이름, 승점 표시
function board(): Scene {
  const items: Item[] = [
    { id: 'lab:a', kind: 'text', rect: { x: 0, y: A_Y, w: 64, h: 48 }, text: 'A팀' },
    { id: 'lab:b', kind: 'text', rect: { x: 0, y: B_Y, w: 64, h: 48 }, text: 'B팀' },
    { id: 'tok:score', kind: 'token', rect: SCORE_AT, tone: 'plain', text: '승점 0' },
  ];
  A.forEach((v, i) => items.push({ id: aId(i), kind: 'cell', rect: cardRect('a', i), tone: 'plain', text: String(v) }));
  B.forEach((v, i) => items.push({ id: bId(i), kind: 'cell', rect: cardRect('b', i), tone: 'plain', text: String(v) }));
  return { width: X0 + N * PITCH + 60, height: 262, items };
}

// 정렬 단계(세 풀이가 같다): 두 팀의 카드가 약한 순서로 미끄러져 자리를 바꾼다
function sortStep(rec: PacedRecorder, codeHighlights: Record<Language, number[]>, meta: { work: number; variables: Record<string, string | number> }) {
  rec.step({ title: '두 팀을 약한 순서로 정렬하기', codeHighlights, ...meta });
  rec.phase('정렬하기', '두 팀의 숫자를 약한 순서로 정렬합니다. 왼쪽일수록 약합니다.');
  rec.do(...together([
    ...A_ORDER.map((i, s): Action => ({ type: 'set', id: aId(i), patch: { rect: cardRect('a', s) } })),
    ...B_ORDER.map((i, s): Action => ({ type: 'set', id: bId(i), patch: { rect: cardRect('b', s) } })),
  ]), wait(600));
}

/* ------------------------------------------------------------------ */
/* 정석 약한 B부터 이기는 짝: 겨루기 → 정하기 (B 카드 하나가 한 단계)        */
/* ------------------------------------------------------------------ */

function twoPointers(): Visualization {
  const rec = new PacedRecorder(board());
  let [a, answer, work] = [0, 0, 0];
  let b = 0;
  const meta = () => ({ work, variables: { b: b || '-', a, answer } });

  sortStep(rec, TWO_AT.sort, meta());
  rec.step({ title: 'answer = 0, a = 0', codeHighlights: TWO_AT.init, ...meta() });
  rec.phase('시작', '가장 약한 B부터 내면서, 아직 못 이긴 가장 약한 A와 겨룹니다. 이길 때만 다음 A로 넘어갑니다.');
  rec.do(...together([ptrTo(rec, 'a', 0, 'a'), ptrTo(rec, 'b', 0, 'b'), score(0)]));

  BS.forEach((bv, k) => {
    const [aWas, av] = [a, AS[a]];
    const win = bv > av;
    b = bv;
    work++;
    if (win) {
      answer++;
      a++;
    }
    rec.step({ title: `B ${bv} vs A ${av}: ${win ? '이김' : '짐'}`, codeHighlights: win ? TWO_AT.win : TWO_AT.look, ...meta() });
    rec.phase('겨루기', `B의 ${josa(bv, '이', '가')} 아직 못 이긴 가장 약한 A의 ${josa(av, '과', '와')} 겨룹니다.`, TWO_AT.look);
    rec.do(...together([{ type: 'focus', ids: [sB(k), sA(aWas)] }, ...paint([sB(k), sA(aWas)], 'current')]));
    rec.do({ type: 'arrow', from: sB(k), to: sA(aWas), verdict: win ? 'good' : 'bad', label: win ? `${bv} > ${av} 승` : `${bv} ≤ ${av} 패` }, wait(450));

    if (win) {
      rec.phase('정하기', `${bv} > ${josa(av, '이라', '라')} 이겼습니다. 이긴 A는 더 보지 않고 다음으로 약한 A로 넘어갑니다. 승점 ${answer}점.`, TWO_AT.win);
      rec.do(...clear(...paint([sB(k), sA(aWas)], 'visited'), ptrTo(rec, 'a', a, 'a'), ptrTo(rec, 'b', k + 1, 'b'), score(answer)));
    } else {
      rec.phase('정하기', `${bv} ≤ ${josa(av, '이라', '라')} 가장 약한 A도 못 이깁니다. ${josa(bv, '은', '는')} 쓸모가 없으니 다음 B로 넘어갑니다.`, TWO_AT.look);
      rec.do(...clear(...paint([sB(k)], 'explored'), ...paint([sA(aWas)], 'plain'), ptrTo(rec, 'b', k + 1, 'b')));
    }
  });

  b = 0;
  rec.step({ title: `승점 ${answer}`, codeHighlights: TWO_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `B를 모두 냈습니다. 이길 수 있는 가장 약한 A만 골라 이기고, 못 이기는 B는 버렸으니 승점은 ${answer}점입니다.`);
  rec.do(...together([...paint([...Array(N).keys()].flatMap((s) => [sA(s), sB(s)]).filter((id) => rec.get(id).tone === 'visited'), 'path'), score(answer, 'path')]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 A마다 약한 B부터 훑기: 훑기 → 정하기 (A 카드 하나가 한 단계)          */
/* ------------------------------------------------------------------ */

function scanB(): Visualization {
  const rec = new PacedRecorder(board());
  const used: boolean[] = Array(N).fill(false); // 정렬한 B 자리 기준
  let [answer, work] = [0, 0];
  let a = 0;
  const meta = () => ({ work, variables: { a: a || '-', answer } });

  sortStep(rec, SCAN_AT.sort, meta());
  rec.step({ title: 'used = 전부 False, answer = 0', codeHighlights: SCAN_AT.init, ...meta() });
  rec.phase('시작', '약한 A부터 하나씩 보며, 약한 B부터 훑어 그 A를 이길 수 있고 아직 내지 않은 첫 B를 찾습니다.');
  rec.do(score(0));

  AS.forEach((av, s) => {
    const seen: number[] = []; // 훑은 B(정렬한 자리)
    let found: number | undefined;
    for (let i = 0; i < N && found === undefined; i++) {
      seen.push(i);
      if (!used[i] && BS[i] > av) found = i;
    }
    work += seen.length;
    a = av;
    if (found !== undefined) {
      used[found] = true;
      answer++;
    }
    const verdictOf = (i: number): { verdict: 'good' | 'bad' | 'seen'; label: string } =>
      i === found ? { verdict: 'good', label: '승' } : used[i] && BS[i] > av ? { verdict: 'seen', label: '사용됨' } : { verdict: 'bad', label: '패' };

    rec.step({ title: found === undefined ? `A ${av}: 이길 B가 없음` : `A ${av}: B ${ro(BS[found])} 이김`, codeHighlights: found === undefined ? SCAN_AT.look : SCAN_AT.win, ...meta() });
    rec.phase('훑기', found === undefined
      ? `A의 ${josa(av, '을', '를')} 이길 B를 약한 쪽부터 ${seen.length}개 모두 확인했지만 없습니다.`
      : `A의 ${josa(av, '을', '를')} 이길 B를 약한 쪽부터 ${seen.length}개 확인해, B의 ${BS[found]}에서 멈춥니다.`, SCAN_AT.look);
    rec.do(...together([{ type: 'focus', ids: [sA(s), ...seen.map(sB)] }, ...paint([sA(s)], 'current'), ptrTo(rec, 'a', s, 'a')]));
    rec.do(...together(seen.map((i): Action => ({ type: 'arrow', from: sA(s), to: sB(i), ...verdictOf(i) }))), wait(500));

    if (found !== undefined) {
      rec.phase('정하기', `A의 ${josa(av, '을', '를')} B의 ${ro(BS[found])} 이깁니다. 이 B는 이제 쓰였습니다. 승점 ${answer}점.`, SCAN_AT.win);
      rec.do(...clear(...paint([sA(s), sB(found)], 'visited'), score(answer)));
    } else {
      rec.phase('정하기', `이길 B가 없으니 A의 ${josa(av, '은', '는')} 그대로 둡니다. 승점은 ${answer}점입니다.`, SCAN_AT.look);
      rec.do(...clear(...paint([sA(s)], 'explored')));
    }
  });

  a = 0;
  rec.step({ title: `승점 ${answer}`, codeHighlights: SCAN_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('정답', `A를 모두 봤습니다. 정석과 같은 승점 ${answer}점이지만 B 카드를 ${work}번 확인했습니다. 정석은 ${N}번이면 됩니다.`);
  rec.do(...together([...paint([...Array(N).keys()].flatMap((i) => [sA(i), sB(i)]).filter((id) => rec.get(id).tone === 'visited'), 'path'), score(answer, 'path')]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 같은 순위끼리: 겨루기 → 정하기, 오답 확인                          */
/* ------------------------------------------------------------------ */

function sameRank(): Visualization {
  const rec = new PacedRecorder(board());
  let [answer, work] = [0, 0];
  let i = -1;
  const meta = () => ({ work, variables: { i: i < 0 ? '-' : i, answer } });

  sortStep(rec, RANK_AT.sort, meta());
  rec.step({ title: 'answer = 0', codeHighlights: RANK_AT.init, ...meta() });
  rec.phase('시작', 'i번째로 약한 B와 i번째로 약한 A를 겨루게 합니다. 순위가 같은 카드끼리만 겨룹니다.');
  rec.do(...together([ptrTo(rec, 'a', 0, 'i'), ptrTo(rec, 'b', 0, 'i'), score(0)]));

  BS.forEach((bv, k) => {
    const av = AS[k];
    const win = bv > av;
    i = k;
    work++;
    if (win) answer++;
    rec.step({ title: `${k + 1}번째: B ${bv} vs A ${av}: ${win ? '이김' : '짐'}`, codeHighlights: win ? RANK_AT.win : RANK_AT.look, ...meta() });
    rec.phase('겨루기', `${k + 1}번째로 약한 B의 ${josa(bv, '이', '가')} ${k + 1}번째로 약한 A의 ${josa(av, '과', '와')} 겨룹니다.`, RANK_AT.look);
    rec.do(...together([{ type: 'focus', ids: [sB(k), sA(k)] }, ...paint([sB(k), sA(k)], 'current')]));
    rec.do({ type: 'arrow', from: sB(k), to: sA(k), verdict: win ? 'good' : 'bad', label: win ? `${bv} > ${av} 승` : `${bv} ≤ ${av} 패` }, wait(450));
    rec.phase('정하기', win ? `${bv} > ${josa(av, '이라', '라')} 이겼습니다. 승점 ${answer}점.` : `${bv} ≤ ${josa(av, '이라', '라')} 졌습니다. 같은 순위끼리만 겨루니 다른 A는 보지 않습니다.`, win ? RANK_AT.win : RANK_AT.look);
    rec.do(...clear(...paint([sB(k), sA(k)], win ? 'visited' : 'explored'), ptrTo(rec, 'a', k + 1, 'i'), ptrTo(rec, 'b', k + 1, 'i'), ...(win ? [score(answer)] : [])));
  });

  i = -1;
  rec.step({ title: `이 방법 ${answer}점, 정답은 ${TRUTH}점`, codeHighlights: RANK_AT.done, ...meta(), answer, isKeyframe: true });
  rec.phase('오답 확인', `같은 순위끼리만 겨루면 ${answer}점이지만, B의 4와 5는 한 칸 아래 A의 3과 4를 이길 수 있어 정답은 ${TRUTH}점입니다.`);
  rec.do(...together([score(answer, 'bad', `이 방법 ${answer}점`), { type: 'add', item: { id: 'tok:truth', kind: 'token', rect: TRUTH_AT, tone: 'good', text: `정답 ${TRUTH}점` } }]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'number-game',
  title: '숫자 게임',
  level: 3,
  category: 'greedy',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12987',
  description: {
    summary:
      'A팀과 B팀이 N명씩 있고, 모든 사원은 자연수 하나를 받습니다. 사원들은 상대 팀 사원과 한 번씩 일대일로 겨루고, 숫자가 큰 쪽이 1점을 얻으며 같으면 아무도 점수를 얻지 못합니다. A팀의 출전 순서가 먼저 공개되고, B팀은 그 순서를 보고 자기 팀의 출전 순서를 정합니다. B팀이 얻을 수 있는 최대 승점을 구합니다.',
    rules: [
      'A와 B의 길이는 같고, 1 이상 100,000 이하',
      'A와 B의 원소는 1 이상 1,000,000,000 이하의 자연수',
      'B팀은 A팀의 출전 순서를 보고 자기 출전 순서를 자유롭게 정할 수 있음',
      '숫자가 같으면 승점 없음',
    ],
    examples: [
      { input: 'A = [5, 1, 3, 7], B = [2, 2, 6, 8]', output: '3' },
      { input: 'A = [2, 2, 2, 2], B = [1, 1, 1, 1]', output: '0' },
    ],
  },
  keyIntuitions: [
    'B팀이 순서를 마음대로 정할 수 있으니 A의 순서는 상관없고, 어떤 B가 어떤 A와 짝이 될지만 정하면 됩니다.',
    'B의 숫자 하나는 이길 수 있는 A 중 가장 약한 것을 이기는 데 쓰는 것이 가장 알뜰합니다. 두 팀을 약한 순서로 정렬해, 약한 B부터 아직 못 이긴 가장 약한 A를 이기면 짝을 짓고, 못 이기면 그 B는 버립니다.',
    '같은 순위끼리만 겨루게 하면 한 칸 아래 A를 이길 수 있는 B를 놓칩니다. 이 방법은 공식 예제를 통과해서 더 위험합니다.',
  ],
  demo: { input: [A, B], label: 'A = [7, 3, 10, 5, 8, 4, 9, 6], B = [9, 4, 11, 2, 7, 10, 5, 8]' },
  workUnit: '숫자를 비교한 횟수',
  approaches: [
    {
      id: 'number-game-two-pointers',
      name: '정렬 + 약한 B부터 이기는 짝짓기',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '두 팀을 약한 순서로 정렬하고, 약한 B부터 아직 못 이긴 가장 약한 A를 이기면 짝을 짓는 풀이입니다.',
      pros: [
        '정렬한 뒤에는 포인터 하나로 한 번만 훑으면 되어 O(N)입니다.',
        'B 하나가 이길 수 있는 가장 약한 A만 쓰므로 B를 낭비하지 않습니다.',
        '코드가 짧고 분기가 하나입니다.',
      ],
      cons: [
        '"약한 B는 가장 약한 A만 노린다"는 생각을 떠올려야 합니다.',
        '숫자가 같으면 이기지 못하므로 비교에 등호를 넣으면 안 됩니다.',
      ],
      whyThisRank:
        '이길 수 있는 B는 어떤 A든 이길 수 있는 것 중 가장 약한 A를 상대하는 것이 최선입니다. 그래야 더 강한 A를 이길 강한 B가 남기 때문입니다. 약한 B부터 가장 약한 A를 노리는 한 번의 훑기로 최대 승점이 나옵니다.',
      code: TWO_POINTERS,
      visualize: twoPointers,
    },
    {
      id: 'number-game-scan',
      name: 'A마다 이길 B를 훑어 찾기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '약한 A부터 하나씩 보며, 약한 B부터 훑어 그 A를 이길 수 있고 아직 내지 않은 첫 B를 찾는 맞지만 느린 풀이입니다.',
      pros: [
        '"이길 수 있는 가장 약한 B를 쓴다"는 생각이 그대로 코드가 됩니다.',
        '정석과 같은 답을 냅니다.',
      ],
      cons: [
        'A마다 B를 처음부터 훑어 N이 10만이면 최대 약 100억 번입니다.',
        '이미 낸 B를 표시할 used 배열이 따로 필요합니다.',
      ],
      whyThisRank:
        '이길 B를 찾는 생각은 정석과 같지만, 매번 B를 처음부터 훑으면서 이미 쓴 B와 못 이기는 B도 다시 봅니다. 포인터를 앞으로만 움직이면 그 훑기가 사라집니다.',
      code: SCAN,
      visualize: scanB,
    },
    {
      id: 'number-game-same-rank',
      name: '정렬 후 같은 순위끼리 비교',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(1)',
      verdict: '두 팀을 정렬해 i번째로 약한 B와 i번째로 약한 A를 겨루게 하는 풀이로, 한 칸 아래 A를 이길 수 있는 B를 놓칩니다.',
      pros: ['코드가 가장 짧고, 공식 예제 두 개는 우연히 통과합니다.'],
      cons: [
        'B의 숫자가 같은 순위 A보다 작아도 더 약한 A는 이길 수 있는데, 그 짝짓기를 보지 않습니다.',
        'A = [2, 10], B = [1, 5]이면 정답은 1점인데 0점이 나옵니다.',
      ],
      whyThisRank:
        '순서를 마음대로 정할 수 있다는 점을 쓰지 않고 같은 순위로 고정해 버립니다. B가 이길 수 있는 A는 같은 순위 A만이 아니라 더 약한 A 전부입니다.',
      code: SAME_RANK,
      visualize: sameRank,
    },
  ],
  checks: {
    cases: [
      { args: [[5, 1, 3, 7], [2, 2, 6, 8]], expected: 3 },
      { args: [[2, 2, 2, 2], [1, 1, 1, 1]], expected: 0 },
      { args: [[1], [1]], expected: 0 },
      { args: [[1], [2]], expected: 1 },
      { args: [[2, 10], [1, 5]], expected: 1 },
      { args: [[1, 2, 3], [2, 3, 4]], expected: 3 },
      { args: [[5, 5, 5], [5, 5, 5]], expected: 0 },
      { args: [[3, 3, 5], [4, 4, 4]], expected: 2 },
      { args: [A, B], expected: 7 },
    ],
    // 두 팀 1~8명, 숫자 1~10(같은 숫자가 자주 나온다)
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 8);
      const row = () => Array.from({ length: n }, () => 1 + Math.floor(rand() * 10));
      return [row(), row()];
    },
  },
};

export default problem;
