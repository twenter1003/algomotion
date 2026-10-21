// 이모티콘 할인행사: 정석 할인율 중복순열을 DFS로 만들며 바로 평가, 대안 조합을 먼저 모두 만든 뒤 하나씩 평가, 함정 모두 40% 할인.
// 세 풀이는 같은 판(이모티콘 · 사용자 표 · 조합 결과 표)을 쓴다. 결과 표의 한 칸이 할인율 조합 하나이고, 칸을 채우는 차례가 DFS의 잎 차례다.
import type { Action, Item, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';
import { clear, holdCaptions, set, wait } from './common.ts';

// 원문 예제 1. 세 풀이의 시각화 입력이자 점검 사례다. 모두 40% 할인하면 [0, 19200], 정답은 [1, 5400]이다.
const USERS: [number, number][] = [[40, 10000], [25, 10000]];
const EMOTICONS = [7000, 9000];
const RATES = [10, 20, 30, 40];
const M = EMOTICONS.length;
const money = (n: number) => String(n);
const pairText = (plus: number, sales: number) => `[${plus}, ${sales}]`;
interface Meta { work: number; variables: Record<string, string | number> }

// 할인율 조합 하나의 결과. 사용자마다 사는 이모티콘, 쓴 돈, 한도를 넘어 가입하는지
interface Buy { buys: boolean[]; spent: number; plus: boolean }
interface Leaf { rates: number[]; buys: Buy[]; plus: number; sales: number }
const evaluate = (rates: number[]): Leaf => {
  const buys = USERS.map(([want, limit]): Buy => {
    const flags = rates.map((r) => r >= want);
    const spent = EMOTICONS.reduce((s, price, i) => s + (flags[i] ? (price * (100 - rates[i])) / 100 : 0), 0);
    return { buys: flags, spent, plus: spent >= limit };
  });
  return { rates, buys, plus: buys.filter((b) => b.plus).length, sales: buys.reduce((s, b) => s + (b.plus ? 0 : b.spent), 0) };
};
// 첫 이모티콘의 할인율이 바깥, 마지막 이모티콘의 할인율이 안쪽인 DFS 차례(결과 표의 가로줄 차례)
const LEAVES: Leaf[] = RATES.flatMap((a) => RATES.map((b) => evaluate([a, b])));
const betterThan = (x: { plus: number; sales: number }, y: { plus: number; sales: number }) => x.plus > y.plus || (x.plus === y.plus && x.sales > y.sales);
// 새 최고가 나오는 잎의 번호들(첫 잎 포함)
const BEST_AT: number[] = [];
let TRUTH = { plus: 0, sales: 0 };
LEAVES.forEach((l, i) => {
  if (i === 0 || betterThan(l, TRUTH)) {
    BEST_AT.push(i);
    TRUTH = l;
  }
});
const BEST_LEAF = LEAVES.indexOf(TRUTH as Leaf);
const ALL40 = LEAVES[LEAVES.length - 1];
const CHECKS_PER_LEAF = USERS.length * M;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST = {
  python: `def solution(users, emoticons):
    best = [0, 0]  # [가입자 수, 판매액]
    rates = [0] * len(emoticons)

    def dfs(i):
        if i == len(emoticons):
            plus, sales = 0, 0
            for want, limit in users:
                spent = 0
                for price, rate in zip(emoticons, rates):
                    if rate >= want:  # 원하는 할인율 이상이면 삽니다
                        spent += price * (100 - rate) // 100
                if spent >= limit:
                    plus += 1  # 한도를 넘으면 모두 취소하고 가입합니다
                else:
                    sales += spent
            if [plus, sales] > best:  # 가입자가 먼저, 같으면 판매액
                best[:] = [plus, sales]
            return
        for rate in (10, 20, 30, 40):  # i번째 이모티콘의 할인율을 하나씩 정합니다
            rates[i] = rate
            dfs(i + 1)

    dfs(0)
    return best`,
  javascript: `function solution(users, emoticons) {
  let best = [0, 0]; // [가입자 수, 판매액]
  const rates = Array(emoticons.length).fill(0);

  const dfs = (i) => {
    if (i === emoticons.length) {
      let plus = 0, sales = 0;
      for (const [want, limit] of users) {
        let spent = 0;
        emoticons.forEach((price, k) => {
          if (rates[k] >= want) spent += price * (100 - rates[k]) / 100; // 원하는 할인율 이상이면 삽니다
        });
        if (spent >= limit) plus++; // 한도를 넘으면 모두 취소하고 가입합니다
        else sales += spent;
      }
      if (plus > best[0] || (plus === best[0] && sales > best[1])) best = [plus, sales]; // 가입자가 먼저, 같으면 판매액
      return;
    }
    for (const rate of [10, 20, 30, 40]) { // i번째 이모티콘의 할인율을 하나씩 정합니다
      rates[i] = rate;
      dfs(i + 1);
    }
  };

  dfs(0);
  return best;
}`,
};
const DFS_AT = {
  start: lines(BEST, ['best = [0, 0]', 'dfs(0)'], ['let best = [0, 0]', 'dfs(0)']),
  pick: lines(BEST, ['for rate in (10, 20, 30, 40)', 'rates[i] = rate', 'dfs(i + 1)'], ['for (const rate of [10, 20, 30, 40])', 'rates[i] = rate', 'dfs(i + 1)']),
  buy: lines(BEST, ['for want, limit in users:', 'if rate >= want:', 'spent += price * (100 - rate) // 100'], ['for (const [want, limit] of users)', 'if (rates[k] >= want)', 'spent += price * (100 - rates[k]) / 100']),
  join: lines(BEST, ['if spent >= limit:', 'plus += 1', 'sales += spent'], ['if (spent >= limit)', 'plus++', 'sales += spent']),
  compare: lines(BEST, ['if [plus, sales] > best:', "best[:] = [plus, sales]"], ['if (plus > best[0]', 'best = [plus, sales]']),
  done: lines(BEST, ['dfs(0)', 'return best'], ['dfs(0)', 'return best']),
};

const LIST = {
  python: `from itertools import product

def solution(users, emoticons):
    best = [0, 0]  # [가입자 수, 판매액]
    # 할인율 조합을 모두 만들어 두고
    for rates in product((10, 20, 30, 40), repeat=len(emoticons)):
        # 조합마다 처음부터 평가합니다
        plus, sales = 0, 0
        for want, limit in users:
            spent = 0
            for price, rate in zip(emoticons, rates):
                if rate >= want:  # 원하는 할인율 이상이면 삽니다
                    spent += price * (100 - rate) // 100
            if spent >= limit:
                plus += 1  # 한도를 넘으면 모두 취소하고 가입합니다
            else:
                sales += spent
        if [plus, sales] > best:  # 가입자가 먼저, 같으면 판매액
            best = [plus, sales]
    return best`,
  javascript: `function solution(users, emoticons) {
  // 할인율 조합을 모두 만들어 두고
  let combos = [[]];
  for (let i = 0; i < emoticons.length; i++) {
    combos = combos.flatMap((c) => [10, 20, 30, 40].map((rate) => [...c, rate]));
  }

  let best = [0, 0]; // [가입자 수, 판매액]
  for (const rates of combos) { // 조합마다 처음부터 평가합니다
    let plus = 0, sales = 0;
    for (const [want, limit] of users) {
      let spent = 0;
      emoticons.forEach((price, k) => {
        if (rates[k] >= want) spent += price * (100 - rates[k]) / 100; // 원하는 할인율 이상이면 삽니다
      });
      if (spent >= limit) plus++; // 한도를 넘으면 모두 취소하고 가입합니다
      else sales += spent;
    }
    if (plus > best[0] || (plus === best[0] && sales > best[1])) best = [plus, sales]; // 가입자가 먼저, 같으면 판매액
  }
  return best;
}`,
};
const LS_AT = {
  make: lines(LIST, ['for rates in product(', 'best = [0, 0]'], ['let combos = [[]]', 'combos = combos.flatMap']),
  buy: lines(LIST, ['for want, limit in users:', 'if rate >= want:', 'spent += price * (100 - rate) // 100'], ['for (const [want, limit] of users)', 'if (rates[k] >= want)', 'spent += price * (100 - rates[k]) / 100']),
  join: lines(LIST, ['if spent >= limit:', 'plus += 1', 'sales += spent'], ['if (spent >= limit)', 'plus++', 'sales += spent']),
  compare: lines(LIST, ['if [plus, sales] > best:', 'best = [plus, sales]'], ['if (plus > best[0]', 'best = [plus, sales]']),
  rows: lines(LIST, ['for rates in product(', 'if [plus, sales] > best:'], ['for (const rates of combos)', 'if (plus > best[0]']),
  done: lines(LIST, ['return best'], ['return best']),
};

const ALL_40 = {
  python: `# 주의: 모든 이모티콘을 40% 할인하면 가장 좋다고 짐작하는 오답 풀이입니다
def solution(users, emoticons):
    rates = [40] * len(emoticons)  # 전부 40% 할인
    plus, sales = 0, 0
    for want, limit in users:
        spent = 0
        for price, rate in zip(emoticons, rates):
            if rate >= want:  # 원하는 할인율 이상이면 삽니다
                spent += price * (100 - rate) // 100
        if spent >= limit:
            plus += 1  # 한도를 넘으면 모두 취소하고 가입합니다
        else:
            sales += spent
    return [plus, sales]`,
  javascript: `// 주의: 모든 이모티콘을 40% 할인하면 가장 좋다고 짐작하는 오답 풀이입니다
function solution(users, emoticons) {
  const rates = Array(emoticons.length).fill(40); // 전부 40% 할인
  let plus = 0, sales = 0;
  for (const [want, limit] of users) {
    let spent = 0;
    emoticons.forEach((price, k) => {
      if (rates[k] >= want) spent += price * (100 - rates[k]) / 100; // 원하는 할인율 이상이면 삽니다
    });
    if (spent >= limit) plus++; // 한도를 넘으면 모두 취소하고 가입합니다
    else sales += spent;
  }
  return [plus, sales];
}`,
};
const A40_AT = {
  start: lines(ALL_40, ['rates = [40] * len(emoticons)', 'plus, sales = 0, 0'], ['const rates = Array(emoticons.length).fill(40)', 'let plus = 0, sales = 0']),
  buy: lines(ALL_40, ['for want, limit in users:', 'if rate >= want:', 'spent += price * (100 - rate) // 100'], ['for (const [want, limit] of users)', 'if (rates[k] >= want)', 'spent += price * (100 - rates[k]) / 100']),
  join: lines(ALL_40, ['if spent >= limit:', 'plus += 1', 'sales += spent'], ['if (spent >= limit)', 'plus++', 'sales += spent']),
  done: lines(ALL_40, ['return [plus, sales]'], ['return [plus, sales]']),
};

/* ------------------------------------------------------------------ */
/* 장면: 이모티콘 · 사용자 표 · 조합 결과 표(4 × 4)                          */
/* ------------------------------------------------------------------ */

// 가로: 이모티콘 12~140, 결과 표 칸 48px 넷이 204~404, 사용자 표 12~280. 세로: 안내 글 0~16, 이모티콘 22~106, 결과 표 42~182,
// 사용자 표 머리 190~220, 줄 224~264과 270~310, 계수기 322~352, 계산 글 358~384.
const W = 420;
const H = 392;
const gridRect = (r: number, c: number): Rect => ({ x: 204 + c * 52, y: 42 + r * 36, w: 48, h: 32 });
const gid = (r: number, c: number) => `g:${r}:${c}`;
const gridOf = (leaf: number): [number, number] => [Math.floor(leaf / RATES.length), leaf % RATES.length];
const uRect = (j: number, col: number): Rect => {
  const xs = [12, 96, 168, 240];
  const ws = [80, 68, 68, 64];
  return { x: xs[col], y: 224 + j * 46, w: ws[col], h: 40 };
};
const uid = (j: number, name: string) => `u:${j}:${name}`;
const tokenAt = (id: string, x: number, w: number, text: string, t: Tone): Item => ({ id, kind: 'token', rect: { x, y: 322, w, h: 30 }, tone: t, text });

function board(title: string): Scene {
  const items: Item[] = [{ id: 'title', kind: 'text', rect: { x: 8, y: 0, w: 404, h: 16 }, tone: 'muted', text: title }];
  EMOTICONS.forEach((price, i) => {
    items.push(
      { id: `e:${i}`, kind: 'cell', rect: { x: 12 + i * 68, y: 22, w: 60, h: 44 }, tone: 'plain', text: money(price), tag: `이모티콘 ${i + 1}` },
      { id: `r:${i}`, kind: 'cell', rect: { x: 12 + i * 68, y: 72, w: 60, h: 34 }, tone: 'plain', text: '' },
    );
  });
  RATES.forEach((rate, k) => {
    items.push(
      { id: `hc:${k}`, kind: 'text', rect: { x: 204 + k * 52, y: 24, w: 48, h: 16 }, tone: 'muted', text: `${rate}%` },
      { id: `hr:${k}`, kind: 'text', rect: { x: 158, y: 42 + k * 36, w: 42, h: 32 }, tone: 'muted', text: `${rate}%` },
    );
    for (let c = 0; c < RATES.length; c++) items.push({ id: gid(k, c), kind: 'cell', rect: gridRect(k, c), tone: 'plain', text: '' });
  });
  ['원하는 할인율', '한도', '쓴 돈', '결과'].forEach((label, col) => {
    items.push({ id: `uh:${col}`, kind: 'text', rect: { x: uRect(0, col).x, y: 190, w: uRect(0, col).w, h: 30 }, tone: 'muted', text: label });
  });
  USERS.forEach(([want, limit], j) => {
    items.push(
      { id: uid(j, 'want'), kind: 'cell', rect: uRect(j, 0), tone: 'plain', text: `${want}%`, tag: `사용자 ${j + 1}` },
      { id: uid(j, 'limit'), kind: 'cell', rect: uRect(j, 1), tone: 'plain', text: money(limit) },
      { id: uid(j, 'spent'), kind: 'cell', rect: uRect(j, 2), tone: 'plain', text: '' },
      { id: uid(j, 'res'), kind: 'cell', rect: uRect(j, 3), tone: 'plain', text: '' },
    );
  });
  items.push(
    tokenAt('t:plus', 12, 110, '가입자 0', 'plain'),
    tokenAt('t:sales', 128, 130, '판매액 0', 'plain'),
    tokenAt('t:best', 264, 148, '최고 없음', 'chosen'),
    { id: 'calc', kind: 'text', rect: { x: 8, y: 358, w: 404, h: 26 }, text: '' },
  );
  return { width: W, height: H, items };
}
const calcTo = (text: string) => set('calc', { text });
const ratesTo = (rates: number[], t: Tone = 'queued'): Action[] => rates.map((r, i) => set(`r:${i}`, { text: `${r}%`, tone: t }, true));
const clearUsers = (): Action[] => USERS.flatMap((_, j) => [set(uid(j, 'spent'), { text: '', tone: 'plain' }), set(uid(j, 'res'), { text: '', tone: 'plain' })]);
// 사용자마다 쓴 돈과 결과(가입하면 초록, 사면 하늘색)
const usersTo = (leaf: Leaf): Action[] =>
  leaf.buys.flatMap((b, j): Action[] => [
    set(uid(j, 'spent'), { text: money(b.spent), tone: b.plus ? 'good' : 'visited' }, true),
    set(uid(j, 'res'), { text: b.plus ? '가입!' : b.spent ? '구매' : '안 삼', tone: b.plus ? 'good' : 'plain' }, true),
  ]);
const resultCell = (i: number, leaf: Leaf, t: Tone): Action => {
  const [r, c] = gridOf(i);
  return set(gid(r, c), { text: String(leaf.plus), tag: money(leaf.sales), tone: t }, true);
};
const pJosa = (plus: number, sales: number, batchim: string, plain: string) => josa(pairText(plus, sales), batchim, plain);
const buyCaption = (leaf: Leaf) =>
  leaf.buys.map((b, j) => {
    const bought = EMOTICONS.flatMap((_, i) => (b.buys[i] ? [i + 1] : []));
    const what = bought.length ? `이모티콘 ${bought.join(', ')}${josa(bought.at(-1)!, '을', '를').slice(String(bought.at(-1)).length)} 사서 ${b.spent}원` : '';
    return `사용자 ${josa(j + 1, '은', '는')} ${bought.length ? `${what}을 ${b.plus ? `쓰고 한도 ${USERS[j][1]}원 이상이라 모두 취소하고 가입합니다` : '씁니다'}` : '살 이모티콘이 없습니다'}.`;
  }).join(' ');

/* ------------------------------------------------------------------ */
/* 정석: 할인율 정하기 → 구매 계산 → 비교하기                              */
/* ------------------------------------------------------------------ */

function dfsEmoticons(): Visualization {
  const rec = new StepRecorder(board('한 칸 = 조합 하나 · 큰 글자 가입자, 작은 글씨 판매액'));
  let best: { plus: number; sales: number } | undefined;
  let bestCell = -1;
  let work = 0;
  let cur: Leaf | undefined;
  const meta = (): Meta => ({
    work,
    variables: { rates: cur ? `[${cur.rates.join(', ')}]` : '[0, 0]', plus: cur?.plus ?? '-', sales: cur?.sales ?? '-', best: best ? pairText(best.plus, best.sales) : '[0, 0]' },
  });

  rec.step({ title: 'dfs(0)에서 시작', codeHighlights: DFS_AT.start, ...meta() });
  rec.phase('시작', `이모티콘 ${M}개의 할인율을 10, 20, 30, 40% 중에서 하나씩 정하는 경우는 모두 ${RATES.length}^${M} = ${LEAVES.length}가지입니다. 하나씩 정하고, 사용자들이 얼마를 쓰는지 계산해 가입자가 가장 많고 판매액이 큰 경우를 찾습니다.`, DFS_AT.start);
  rec.do(wait(300));

  LEAVES.forEach((leaf, i) => {
    const [gr, gc] = gridOf(i);
    const better = !best || betterThan(leaf, best);
    const prevCell = bestCell;
    cur = leaf;
    work += CHECKS_PER_LEAF;
    rec.step({
      title: `할인율 ${leaf.rates.map((r) => `${r}%`).join(', ')} → 가입자 ${leaf.plus}, 판매액 ${leaf.sales}${better ? ' (새 최고)' : ''}`,
      codeHighlights: DFS_AT.compare,
      ...meta(),
    });
    rec.phase('할인율 정하기', `${EMOTICONS.map((_, k) => `이모티콘 ${josa(k + 1, '은', '는')} ${leaf.rates[k]}%`).join(', ')}로 정합니다.`, DFS_AT.pick);
    rec.do(...together([...ratesTo(leaf.rates), ...clearUsers(), set(gid(gr, gc), { tone: 'queued', text: '?' }), calcTo(`${i + 1} / ${LEAVES.length}번째 조합`)]));

    rec.phase('구매 계산', buyCaption(leaf), DFS_AT.buy);
    rec.do(...together(usersTo(leaf)));
    rec.do(...together([set('t:plus', { text: `가입자 ${leaf.plus}` }, true), set('t:sales', { text: `판매액 ${leaf.sales}` }, true)]), calcTo(`가입자 ${leaf.plus}명, 판매액 ${leaf.sales}원`));

    rec.phase('비교하기', !best
      ? `처음 만든 결과라 ${pJosa(leaf.plus, leaf.sales, '을', '를')} 최고로 삼습니다.`
      : better
        ? `${pJosa(leaf.plus, leaf.sales, '은', '는')} 최고 ${pairText(best.plus, best.sales)}보다 ${leaf.plus > best.plus ? '가입자가 많아' : '가입자가 같고 판매액이 커서'} 새 최고입니다.`
        : `${pJosa(leaf.plus, leaf.sales, '은', '는')} 최고 ${pairText(best.plus, best.sales)}보다 ${leaf.plus < best.plus ? '가입자가 적어' : '가입자가 같고 판매액이 작거나 같아'} 그대로 둡니다.`, DFS_AT.compare);
    if (prevCell >= 0) {
      const [pr, pc] = gridOf(prevCell);
      rec.do({ type: 'focus', ids: [gid(gr, gc), gid(pr, pc)] });
      rec.do({ type: 'arrow', from: gid(gr, gc), to: gid(pr, pc), verdict: (better ? 'good' : 'bad') as Verdict, label: better ? '새 최고' : '못 넘음' }, wait(100));
    }
    rec.do(...together([
      ...(prevCell >= 0 ? clear() : []),
      resultCell(i, leaf, better ? 'good' : 'visited'),
      ...(better && prevCell >= 0 ? [(() => { const [pr, pc] = gridOf(prevCell); return set(gid(pr, pc), { tone: 'visited' }); })()] : []),
      ...(better ? [set('t:best', { text: `최고 ${pairText(leaf.plus, leaf.sales)}` }, true)] : []),
    ]));
    if (better) {
      best = { plus: leaf.plus, sales: leaf.sales };
      bestCell = i;
    }
  });

  rec.step({ title: `최고 ${pairText(TRUTH.plus, TRUTH.sales)}`, codeHighlights: DFS_AT.done, ...meta(), answer: [TRUTH.plus, TRUTH.sales], isKeyframe: true });
  const [br, bc] = gridOf(BEST_LEAF);
  rec.phase('결과', `${LEAVES.length}가지를 모두 따져 가입자가 가장 많고 판매액이 큰 ${josa(pairText(TRUTH.plus, TRUTH.sales), '을', '를')} 찾았습니다. 이모티콘 1은 ${LEAVES[BEST_LEAF].rates[0]}%, 이모티콘 2는 ${LEAVES[BEST_LEAF].rates[1]}% 할인하는 경우입니다.`, DFS_AT.done);
  rec.do(...together([set(gid(br, bc), { tone: 'path' }, true), set('t:best', { tone: 'path' }, true), ...ratesTo(LEAVES[BEST_LEAF].rates, 'path'), calcTo(`답 ${pairText(TRUTH.plus, TRUTH.sales)}`)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 조합 만들기 → (처음 두 조합은 하나씩) → 가로줄마다 빨리 감기              */
/* ------------------------------------------------------------------ */

function listFirst(): Visualization {
  const rec = new StepRecorder(board('먼저 모두 만든 뒤 평가 · 큰 글자 가입자, 작은 글씨 판매액'));
  let best: { plus: number; sales: number } | undefined;
  let bestCell = -1;
  let work = 0;
  let cur: Leaf | undefined;
  const meta = (): Meta => ({
    work,
    variables: { rates: cur ? `[${cur.rates.join(', ')}]` : '-', plus: cur?.plus ?? '-', sales: cur?.sales ?? '-', best: best ? pairText(best.plus, best.sales) : '[0, 0]' },
  });
  const advance = (i: number) => {
    const leaf = LEAVES[i];
    const better = !best || betterThan(leaf, best);
    if (better) {
      best = { plus: leaf.plus, sales: leaf.sales };
      bestCell = i;
    }
    work += CHECKS_PER_LEAF;
    cur = leaf;
    return better;
  };

  rec.step({ title: `할인율 조합 ${LEAVES.length}가지 만들기`, codeHighlights: LS_AT.make, ...meta() });
  rec.phase('조합 만들기', `이모티콘 ${M}개의 할인율 조합 ${RATES.length}^${M} = ${LEAVES.length}가지를 먼저 모두 만들어 목록에 담아 둡니다. 결과 표의 칸 하나가 조합 하나입니다.`, LS_AT.make);
  rec.do(...together(LEAVES.map((_, i): Action => set(gid(...gridOf(i)), { tone: 'queued', text: '?' }))));

  // 처음 두 조합은 하나씩 보인다
  for (let i = 0; i < 2; i++) {
    const leaf = LEAVES[i];
    const [gr, gc] = gridOf(i);
    const better = advance(i);
    rec.step({ title: `조합 ${i + 1} ${leaf.rates.map((r) => `${r}%`).join(', ')} → 가입자 ${leaf.plus}, 판매액 ${leaf.sales}`, codeHighlights: LS_AT.compare, ...meta() });
    rec.phase('구매 계산', `${leaf.rates.map((r, k) => `이모티콘 ${k + 1} ${r}%`).join(', ')} 조합입니다. ${buyCaption(leaf)}`, LS_AT.buy);
    rec.do(...together([...ratesTo(leaf.rates), ...clearUsers(), set(gid(gr, gc), { tone: 'current' })]));
    rec.do(...together(usersTo(leaf)));
    rec.phase('비교하기', better ? `${i ? `${pJosa(leaf.plus, leaf.sales, '이', '가')} 최고보다 커서 새 최고입니다.` : `${pJosa(leaf.plus, leaf.sales, '을', '를')} 처음 만든 결과라 최고로 삼습니다.`}` : `${pJosa(leaf.plus, leaf.sales, '은', '는')} 최고를 넘지 못합니다.`, LS_AT.compare);
    rec.do(...together([resultCell(i, leaf, better ? 'good' : 'visited'), set('t:plus', { text: `가입자 ${leaf.plus}` }, true), set('t:sales', { text: `판매액 ${leaf.sales}` }, true), ...(better ? [set('t:best', { text: `최고 ${pairText(leaf.plus, leaf.sales)}` }, true)] : [])]));
  }

  // 나머지는 가로줄(첫 이모티콘의 할인율이 같은 4가지)씩 빨리 감는다
  const rowsLeft = [[2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]];
  for (const row of rowsLeft) {
    const prevBestCell = bestCell;
    const improved: number[] = [];
    for (const i of row) if (advance(i) && i === bestCell) improved.push(i);
    rec.step({ title: `조합 ${row[0] + 1}~${row.at(-1)! + 1} 빨리 감기`, codeHighlights: LS_AT.rows, ...meta() });
    rec.phase('빨리 감기', `조합 ${row[0] + 1}번부터 ${row.at(-1)! + 1}번까지 ${row.length}가지를 같은 방식으로 평가합니다. ${improved.length ? `${improved.map((i) => `${i + 1}번 조합 ${pairText(LEAVES[i].plus, LEAVES[i].sales)}`).join(', ')}${josa(pairText(LEAVES[improved.at(-1)!].plus, LEAVES[improved.at(-1)!].sales), '이', '가').slice(pairText(LEAVES[improved.at(-1)!].plus, LEAVES[improved.at(-1)!].sales).length)} 새 최고가 됩니다.` : '최고를 넘는 조합은 없습니다.'}`, LS_AT.rows);
    rec.do(...together([
      ...row.map((i) => resultCell(i, LEAVES[i], 'visited')),
      ...(improved.length ? [set('t:best', { text: `최고 ${pairText(best!.plus, best!.sales)}` }, true)] : []),
      calcTo(`조합 ${row[0] + 1}~${row.at(-1)! + 1}번 평가: 가입자와 판매액을 표에 적음`),
    ]));
    if (improved.length) {
      const [br, bc] = gridOf(bestCell);
      rec.do(...together([set(gid(br, bc), { tone: 'good' }, true), ...(prevBestCell >= 0 && prevBestCell !== bestCell ? [(() => { const [pr, pc] = gridOf(prevBestCell); return set(gid(pr, pc), { tone: 'visited' }); })()] : [])]));
    }
  }

  rec.step({ title: `최고 ${pairText(TRUTH.plus, TRUTH.sales)}`, codeHighlights: LS_AT.done, ...meta(), answer: [TRUTH.plus, TRUTH.sales], isKeyframe: true });
  const [br, bc] = gridOf(BEST_LEAF);
  rec.phase('결과', `조합 ${LEAVES.length}가지를 모두 평가해 ${josa(pairText(TRUTH.plus, TRUTH.sales), '을', '를')} 찾았습니다. 정석과 같은 횟수를 따져 보지만, 조합을 한꺼번에 목록으로 들고 있어야 해서 메모리를 더 씁니다. 이모티콘이 7개면 목록이 16,384개입니다.`, LS_AT.done);
  rec.do(...together([set(gid(br, bc), { tone: 'path' }, true), set('t:best', { tone: 'path' }, true), ...ratesTo(LEAVES[BEST_LEAF].rates, 'path'), calcTo(`답 ${pairText(TRUTH.plus, TRUTH.sales)}`)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: 모두 40% → 구매 계산 → 비교하기                                  */
/* ------------------------------------------------------------------ */

function allForty(): Visualization {
  const rec = new StepRecorder(board('모든 이모티콘을 40% 할인합니다'));
  let done = false;
  const meta = (): Meta => ({ work: done ? CHECKS_PER_LEAF : 0, variables: { plus: done ? ALL40.plus : 0, sales: done ? ALL40.sales : 0 } });

  rec.step({ title: '모두 40% 할인하기', codeHighlights: A40_AT.start, ...meta() });
  rec.phase('할인율 정하기', '할인이 클수록 더 많이 사고 판매액도 클 것 같습니다. 이모티콘을 모두 가장 큰 40% 할인으로 정합니다.', A40_AT.start);
  rec.do(...together(ratesTo(ALL40.rates)));

  done = true;
  rec.step({ title: `가입자 ${ALL40.plus}, 판매액 ${ALL40.sales}`, codeHighlights: A40_AT.join, ...meta() });
  rec.phase('구매 계산', buyCaption(ALL40), A40_AT.buy);
  rec.do(...together(usersTo(ALL40)));
  rec.do(...together([set('t:plus', { text: `가입자 ${ALL40.plus}` }, true), set('t:sales', { text: `판매액 ${ALL40.sales}` }, true)]));

  rec.step({ title: `${pairText(ALL40.plus, ALL40.sales)} — 정답은 ${pairText(TRUTH.plus, TRUTH.sales)}`, codeHighlights: A40_AT.done, ...meta(), answer: [ALL40.plus, ALL40.sales], isKeyframe: true });
  rec.phase('비교하기', `${josa(pairText(ALL40.plus, ALL40.sales), '을', '를')} 돌려줍니다. 판매액은 크지만 가입자가 ${ALL40.plus}명입니다. 가입자 수가 판매액보다 우선인데, 이모티콘 1을 ${LEAVES[BEST_LEAF].rates[0]}%만 깎으면 사용자 2가 한도를 넘어 가입해 ${josa(pairText(TRUTH.plus, TRUTH.sales), '이', '가')} 됩니다. 40%가 늘 최선은 아닙니다.`, A40_AT.done);
  rec.do(...together([set('t:plus', { tone: 'bad' }, true), set('t:sales', { tone: 'bad' }, true), calcTo(`내 답 ${pairText(ALL40.plus, ALL40.sales)} ≠ 정답 ${pairText(TRUTH.plus, TRUTH.sales)}`)]));
  rec.do(...together([set('t:best', { text: `정답 ${pairText(TRUTH.plus, TRUTH.sales)}`, tone: 'good' }, true)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'emoticon-sale',
  title: '이모티콘 할인행사',
  level: 2,
  category: 'brute-force',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/150368',
  description: {
    summary:
      '이모티콘 플러스 가입자를 늘리고 판매액도 높이려는 할인 행사입니다. 이모티콘마다 할인율을 10%, 20%, 30%, 40% 중 하나로 정하면, 사용자는 자기가 원하는 할인율 이상인 이모티콘을 모두 삽니다. 그렇게 산 금액이 사용자의 한도 이상이면 구매를 모두 취소하고 이모티콘 플러스에 가입합니다. 가입자 수를 가장 많이 하고, 그 안에서 판매액이 가장 큰 결과를 [가입자 수, 판매액] 순서로 구합니다.',
    rules: [
      'users는 [원하는 할인율(1~40), 한도(100 이상 1,000,000 이하, 100의 배수)] 쌍이 n개 (1 ≤ n ≤ 100)',
      'emoticons는 이모티콘 정가(100 이상 1,000,000 이하, 100의 배수)가 m개 (1 ≤ m ≤ 7)',
      '가입자 수를 먼저 최대로 하고, 같으면 판매액을 최대로 함. 가입한 사용자의 구매액은 판매액에 넣지 않음',
    ],
    examples: [
      { input: 'users = [[40,10000],[25,10000]], emoticons = [7000,9000]', output: '[1,5400]' },
      { input: 'users = [[40,2900],[23,10000],[11,5200],[5,5900],[40,3100],[27,9200],[32,6900]], emoticons = [1300,1500,1600,4900]', output: '[4,13860]' },
    ],
  },
  keyIntuitions: [
    '이모티콘이 최대 7개이고 할인율은 10, 20, 30, 40% 네 가지뿐이라 모든 경우는 4^7 = 16,384가지입니다. 할인율의 중복순열을 모두 만들어 평가해도 충분합니다.',
    '조합마다 사용자 n명이 이모티콘 m개를 살지 따져 한도를 넘으면 가입시키고, 아니면 판매액에 더합니다. 최대 100 × 7번이라 전체로도 1,100만 번 안팎입니다.',
    '결과는 [가입자 수, 판매액]을 사전 순으로 비교합니다. 판매액이 아니라 가입자 수가 먼저이고, 모든 이모티콘을 40% 할인하는 것이 늘 좋은 것은 아닙니다.',
  ],
  demo: { input: [USERS, EMOTICONS], label: 'users = [[40,10000],[25,10000]], emoticons = [7000,9000]' },
  workUnit: '살 이모티콘을 따져 본 횟수',
  approaches: [
    {
      id: 'emoticon-dfs',
      name: '할인율 중복순열 DFS로 만들며 평가',
      rank: 'BEST',
      timeComplexity: 'O(4^m × n × m)',
      spaceComplexity: 'O(m)',
      verdict: '이모티콘마다 10, 20, 30, 40% 중 하나씩 정하는 재귀로 모든 조합을 만들고, 끝까지 정한 조합마다 사용자 구매를 계산해 최고 결과를 고릅니다.',
      pros: [
        '조합을 목록으로 만들지 않고 재귀로 만들며 바로 평가해 메모리가 작습니다.',
        '조합을 하나도 빠뜨리지 않고, 비교 규칙([가입자, 판매액] 사전 순)이 코드 한 줄입니다.',
        'm이 7이어도 16,384 × 100 × 7번이면 끝납니다.',
      ],
      cons: [
        '재귀에서 rates를 덮어쓰며 내려가는 방식이라 되돌리는 코드를 따로 두지 않아도 되지만 처음엔 헷갈립니다.',
        '조합마다 모든 사용자를 처음부터 다시 계산합니다.',
      ],
      whyThisRank: '경우의 수가 4^m이라 모두 따져도 충분히 빠릅니다. 재귀로 만들며 평가해 가장 단순하고 메모리도 적게 듭니다.',
      code: BEST,
      visualize: dfsEmoticons,
    },
    {
      id: 'emoticon-product',
      name: '할인율 조합을 먼저 모두 만든 뒤 평가',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(4^m × n × m)',
      spaceComplexity: 'O(4^m × m)',
      verdict: '할인율 조합을 목록으로 모두 만들어 둔 뒤, 하나씩 꺼내 사용자 구매를 계산해 최고 결과를 고릅니다.',
      pros: ['만들기와 평가를 나눠서 각 부분을 따로 이해하기 쉽습니다.', '파이썬에서는 itertools.product 한 줄로 조합을 만들 수 있습니다.'],
      cons: [
        '조합을 모두 들고 있어 이모티콘이 7개면 목록이 16,384개(7칸씩)가 되어 메모리를 더 씁니다.',
        '평가 횟수는 정석과 같아서 빨라지는 것은 없습니다.',
      ],
      whyThisRank: '따져 보는 횟수는 정석과 같고 메모리만 더 듭니다. 이 문제처럼 조합이 많아질 수 있는 입력에서는 재귀로 만들며 바로 평가하는 쪽이 낫습니다.',
      code: LIST,
      visualize: listFirst,
    },
    {
      id: 'emoticon-all-forty',
      name: '모든 이모티콘을 40% 할인',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(n × m)',
      spaceComplexity: 'O(m)',
      verdict: '할인이 클수록 좋다고 짐작해 모두 40%로만 계산하는 풀이로, 가입자 수를 놓쳐 오답이 나옵니다.',
      pros: ['조합을 만들 필요가 없어 가장 빠릅니다.', '사용자가 모두 한도를 넘지 않는 입력에서는 판매액만 큰 쪽이 맞습니다.'],
      cons: [
        `시각화 입력에서 모두 40%면 ${pairText(ALL40.plus, ALL40.sales)}이 나오지만, 가입자 수가 우선이라 정답 ${pairText(TRUTH.plus, TRUTH.sales)}과 다릅니다.`,
        '할인이 커지면 사용자가 한도를 넘지 않아 오히려 가입자가 줄 수 있습니다.',
      ],
      whyThisRank: '가입자 수가 판매액보다 먼저이고, 가입은 사용자가 한도를 넘어야 일어납니다. 할인율마다 가입자 수와 판매액이 달라지므로 가능한 조합을 모두 따져 봐야 합니다.',
      code: ALL_40,
      visualize: allForty,
    },
  ],
  checks: {
    cases: [
      { args: [[[40, 10000], [25, 10000]], [7000, 9000]], expected: [1, 5400] },
      { args: [[[40, 2900], [23, 10000], [11, 5200], [5, 5900], [40, 3100], [27, 9200], [32, 6900]], [1300, 1500, 1600, 4900]], expected: [4, 13860] },
      { args: [[[1, 100]], [100]], expected: [0, 90] },
      { args: [[[40, 1000000]], [100]], expected: [0, 60] },
      { args: [[[10, 100], [10, 100]], [200]], expected: [2, 0] },
      { args: [USERS, EMOTICONS], expected: [1, 5400] },
    ],
    // 사용자 1~5명, 이모티콘 1~4개
    random: (rand) => {
      const users = Array.from({ length: 1 + Math.floor(rand() * 5) }, () => [1 + Math.floor(rand() * 40), (1 + Math.floor(rand() * 60)) * 100]);
      const emoticons = Array.from({ length: 1 + Math.floor(rand() * 4) }, () => (1 + Math.floor(rand() * 40)) * 100);
      return [users, emoticons];
    },
  },
};

export default problem;
