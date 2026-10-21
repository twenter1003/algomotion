// 메뉴 리뉴얼: 정석 주문마다 메뉴를 정렬해 조합을 만들고 개수 세기, 대안 후보 조합을 먼저 모두 만들고 주문마다 확인하기, 함정 정렬하지 않고 세기.
// 왼쪽에 주문(글자 칸)과 계수기, 오른쪽에 조합별 주문 횟수(막대)를 놓는다. 막대 한 줄이 조합 하나이고 막대 길이는 주문한 사람 수다.
import type { Action, Item, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';
import { clear, holdCaptions, set, tone, wait } from './common.ts';

// 원문 예제 3. 세 풀이의 시각화 입력이자 점검 사례다. 정렬하지 않으면 "XW"와 "WX"를 따로 세어 "WX"를 놓친다.
const ORDERS = ['XYZ', 'XWY', 'WXA'];
const COURSE = [2, 3, 4];
const q = (s: string) => `"${s}"`;
const listText = (xs: string[]) => `[${xs.map(q).join(', ')}]`;
interface Meta { work: number; variables: Record<string, string | number> }

const combos = (menus: string, size: number): string[] =>
  size > menus.length ? [] : size === 0 ? [''] : [...menus].flatMap((c, i) => combos(menus.slice(i + 1), size - 1).map((rest) => c + rest));
const sortedOf = (s: string) => [...s].sort().join('');
const pickTop = (counts: Map<string, number>) => {
  const top = Math.max(0, ...counts.values());
  return { top, menus: top >= 2 ? [...counts].filter(([, c]) => c === top).map(([m]) => m) : [] };
};

// 정석과 함정이 주문마다 세는 과정(정렬 여부만 다르다): 주문별 조합과 셈의 변화, 코스 크기별 결과
interface Seen { key: string; count: number }
interface OrderRun { text: string; combos: Seen[] }
function simulate(sortFirst: boolean) {
  const counters = new Map<number, Map<string, number>>(COURSE.map((k) => [k, new Map()]));
  const runs: OrderRun[] = ORDERS.map((order) => {
    const text = sortFirst ? sortedOf(order) : order;
    const seen: Seen[] = [];
    for (const size of COURSE) {
      for (const key of combos(text, size)) {
        const counter = counters.get(size)!;
        counter.set(key, (counter.get(key) ?? 0) + 1);
        seen.push({ key, count: counter.get(key)! });
      }
    }
    return { text, combos: seen };
  });
  const picks = COURSE.map((size) => ({ size, ...pickTop(counters.get(size)!) }));
  return { runs, picks, answer: picks.flatMap((p) => p.menus).sort(), counters };
}
const SORTED = simulate(true);
const UNSORTED = simulate(false);
const checksOf = (sim: ReturnType<typeof simulate>) => sim.runs.reduce((s, r) => s + r.combos.length, 0);
// 후보 조합을 먼저 만드는 대안이 확인하는 횟수와 결과
const MENUS = [...new Set(ORDERS.join(''))].sort();
const CANDIDATES = COURSE.map((size) => ({
  size,
  counts: new Map(combos(MENUS.join(''), size).map((key): [string, number] => [key, ORDERS.filter((o) => [...key].every((c) => o.includes(c))).length])),
}));

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const COUNT_PY = (sortLine: string, note = '') => `from collections import Counter
from itertools import combinations

${note}def solution(orders, course):
    counters = {size: Counter() for size in course}  # 코스 크기마다 조합별 주문 횟수
    for order in orders:
        ${sortLine}
        for size in course:
            for combo in combinations(menus, size):
                counters[size]["".join(combo)] += 1  # 이 조합을 한 번 더 주문했습니다
    answer = []
    for size in course:
        counter = counters[size]
        top = max(counter.values(), default=0)
        if top >= 2:  # 2명 이상이 주문한 조합만 코스가 됩니다
            answer += [menu for menu, count in counter.items() if count == top]
    return sorted(answer)`;
const COUNT_JS = (sortLine: string, note = '') => `${note}function solution(orders, course) {
  const counters = new Map(course.map((size) => [size, new Map()])); // 코스 크기마다 조합별 주문 횟수

  const pick = (menus, size, start, current, visit) => {
    if (current.length === size) {
      visit(current.join(""));
      return;
    }
    for (let i = start; i < menus.length; i++) pick(menus, size, i + 1, [...current, menus[i]], visit);
  };

  for (const order of orders) {
    ${sortLine}
    for (const size of course) {
      pick(menus, size, 0, [], (combo) => {
        const counter = counters.get(size);
        counter.set(combo, (counter.get(combo) ?? 0) + 1); // 이 조합을 한 번 더 주문했습니다
      });
    }
  }

  const answer = [];
  for (const size of course) {
    const counter = counters.get(size);
    const top = Math.max(0, ...counter.values());
    if (top >= 2) { // 2명 이상이 주문한 조합만 코스가 됩니다
      for (const [menu, count] of counter) if (count === top) answer.push(menu);
    }
  }
  return answer.sort();
}`;
const BEST = {
  python: COUNT_PY('menus = sorted(order)  # 정렬해야 "XW"와 "WX"가 같은 조합이 됩니다'),
  javascript: COUNT_JS('const menus = [...order].sort(); // 정렬해야 "XW"와 "WX"가 같은 조합이 됩니다'),
};
const BS_AT = {
  start: lines(BEST, ['counters = {size: Counter()'], ['const counters = new Map']),
  sort: lines(BEST, ['for order in orders:', 'menus = sorted(order)'], ['for (const order of orders)', 'const menus = [...order].sort()']),
  count: lines(BEST, ['for combo in combinations(menus, size):', 'counters[size]["".join(combo)] += 1'], ['pick(menus, size, 0, [], (combo) => {', 'counter.set(combo,']),
  pick: lines(BEST, ['top = max(counter.values(), default=0)', 'if top >= 2:', 'answer += [menu for menu'], ['const top = Math.max', 'if (top >= 2)', 'answer.push(menu)']),
  done: lines(BEST, ['return sorted(answer)'], ['return answer.sort()']),
};

const CAND = {
  python: `from itertools import combinations

def solution(orders, course):
    menus = sorted(set("".join(orders)))  # 주문에 나온 모든 메뉴
    answer = []
    for size in course:
        counts = {}
        for combo in combinations(menus, size):  # 후보 조합을 먼저 모두 만들고
            # 주문마다 이 조합의 메뉴가 모두 들어 있는지 확인합니다
            counts["".join(combo)] = sum(1 for order in orders if all(m in order for m in combo))
        top = max(counts.values(), default=0)
        if top >= 2:  # 2명 이상이 주문한 조합만 코스가 됩니다
            answer += [menu for menu, count in counts.items() if count == top]
    return sorted(answer)`,
  javascript: `function solution(orders, course) {
  const menus = [...new Set(orders.join(""))].sort(); // 주문에 나온 모든 메뉴

  const pick = (size, start, current, visit) => {
    if (current.length === size) {
      visit(current);
      return;
    }
    for (let i = start; i < menus.length; i++) pick(size, i + 1, [...current, menus[i]], visit);
  };

  const answer = [];
  for (const size of course) {
    const counts = new Map();
    pick(size, 0, [], (combo) => { // 후보 조합을 먼저 모두 만들고
      // 주문마다 이 조합의 메뉴가 모두 들어 있는지 확인합니다
      counts.set(combo.join(""), orders.filter((order) => combo.every((m) => order.includes(m))).length);
    });
    const top = Math.max(0, ...counts.values());
    if (top >= 2) { // 2명 이상이 주문한 조합만 코스가 됩니다
      for (const [menu, count] of counts) if (count === top) answer.push(menu);
    }
  }
  return answer.sort();
}`,
};
const CD_AT = {
  start: lines(CAND, ['menus = sorted(set("".join(orders)))'], ['const menus = [...new Set(orders.join(""))].sort()']),
  make: lines(CAND, ['for size in course:', 'for combo in combinations(menus, size):'], ['for (const size of course)', 'pick(size, 0, [], (combo) => {']),
  count: lines(CAND, ['counts["".join(combo)] = sum(1 for order in orders'], ['counts.set(combo.join(""), orders.filter']),
  pick: lines(CAND, ['top = max(counts.values(), default=0)', 'if top >= 2:', 'answer += [menu for menu'], ['const top = Math.max', 'if (top >= 2)', 'answer.push(menu)']),
  done: lines(CAND, ['return sorted(answer)'], ['return answer.sort()']),
};

const RAW = {
  python: COUNT_PY('menus = order  # 주의: 정렬하지 않고 주문한 순서 그대로 조합을 만듭니다', '# 주의: 메뉴를 정렬하지 않고 조합을 세는 오답 풀이입니다\n'),
  javascript: COUNT_JS('const menus = [...order]; // 주의: 정렬하지 않고 주문한 순서 그대로 조합을 만듭니다', '// 주의: 메뉴를 정렬하지 않고 조합을 세는 오답 풀이입니다\n'),
};
const RW_AT = {
  start: lines(RAW, ['counters = {size: Counter()'], ['const counters = new Map']),
  sort: lines(RAW, ['for order in orders:', 'menus = order'], ['for (const order of orders)', 'const menus = [...order]']),
  count: lines(RAW, ['for combo in combinations(menus, size):', 'counters[size]["".join(combo)] += 1'], ['pick(menus, size, 0, [], (combo) => {', 'counter.set(combo,']),
  pick: lines(RAW, ['top = max(counter.values(), default=0)', 'if top >= 2:', 'answer += [menu for menu'], ['const top = Math.max', 'if (top >= 2)', 'answer.push(menu)']),
  done: lines(RAW, ['return sorted(answer)'], ['return answer.sort()']),
};

/* ------------------------------------------------------------------ */
/* 장면: 왼쪽 주문 · 계수기, 오른쪽 조합별 주문 횟수 막대                       */
/* ------------------------------------------------------------------ */

// 가로: 줄 이름 4~46, 글자 칸 36px에 간격 4px로 셋이 50~166, 막대 176~366. 세로: 안내 글 0~16, 주문 28~64 · 72~108 · 116~152, 계수기 176~282,
// 막대 28~(줄마다 26px, 열두 줄까지). 판정 표시가 막대 위로 11px 올라오니 막대 줄 사이를 4px 비운다.
const W = 420;
const H = 356;
const orderCell = (i: number, c: number): Rect => ({ x: 50 + c * 40, y: 28 + i * 44, w: 36, h: 36 });
const oid = (i: number, c: number) => `o:${i}:${c}`;
const barRect = (row: number): Rect => ({ x: 176, y: 28 + row * 26, w: 190, h: 22 });
const bid = (key: string) => `b:${key}`;
const tokenAt = (id: string, y: number, text: string, t: Tone): Item => ({ id, kind: 'token', rect: { x: 4, y, w: 166, h: 30 }, tone: t, text });
// 막대 줄: 크기가 작은 조합부터, 같은 크기는 처음 나온 차례(모든 시간에 같은 자리)
const rowsOf = (sim: ReturnType<typeof simulate>): Map<string, number> => {
  const first = new Map<string, number>();
  sim.runs.forEach((r) => r.combos.forEach(({ key }) => !first.has(key) && first.set(key, first.size)));
  const keys = [...first.keys()].sort((a, b) => a.length - b.length || first.get(a)! - first.get(b)!);
  return new Map(keys.map((k, i) => [k, i]));
};

function board(title: string, orders: string[]): Scene {
  const items: Item[] = [{ id: 'title', kind: 'text', rect: { x: 4, y: 0, w: 412, h: 16 }, tone: 'muted', text: title }];
  orders.forEach((text, i) => {
    items.push({ id: `ol:${i}`, kind: 'text', rect: { x: 4, y: 28 + i * 44, w: 44, h: 36 }, tone: 'muted', text: `주문 ${i + 1}` });
    [...text].forEach((ch, c) => items.push({ id: oid(i, c), kind: 'cell', rect: orderCell(i, c), tone: 'plain', text: ch }));
  });
  items.push(
    tokenAt('t:k', 176, '코스 크기 -', 'plain'),
    tokenAt('t:max', 214, '가장 많은 주문 -', 'plain'),
    tokenAt('t:res', 252, '코스 []', 'chosen'),
    { id: 'calc', kind: 'text', rect: { x: 4, y: 292, w: 166, h: 56 }, text: '' },
  );
  return { width: W, height: H, items };
}
const calcTo = (text: string) => set('calc', { text });
const barItem = (key: string, row: number, count: number, t: Tone = 'plain'): Item =>
  ({ id: bid(key), kind: 'bar', rect: barRect(row), tone: t, text: `${key} ${count}회`, fill: count / ORDERS.length });
const barTo = (key: string, count: number, t?: Tone): Action => set(bid(key), { text: `${key} ${count}회`, fill: count / ORDERS.length, ...(t ? { tone: t } : {}) }, true);

/* ------------------------------------------------------------------ */
/* 정석 · 함정: (정렬하기) → 조합 세기, 코스 크기마다 최다 고르기              */
/* ------------------------------------------------------------------ */

function counting(sortFirst: boolean): Visualization {
  const sim = sortFirst ? SORTED : UNSORTED;
  const AT = sortFirst ? BS_AT : RW_AT;
  const rows = rowsOf(sim);
  const rec = new StepRecorder(board(sortFirst ? '주문마다 메뉴를 정렬해 조합을 세어 봅니다' : '메뉴를 정렬하지 않고 조합을 세어 봅니다', ORDERS));
  let work = 0;
  let result: string[] = [];
  let cur = -1;
  let size: number | undefined;
  const meta = (): Meta => ({
    work,
    variables: { order: cur >= 0 ? q(ORDERS[cur]) : '-', ...(size === undefined ? {} : { size }), answer: listText(result) },
  });
  const counts = new Map<string, number>();

  rec.step({ title: `주문 ${ORDERS.length}개, 코스 크기 ${COURSE.join(', ')}`, codeHighlights: AT.start, ...meta() });
  rec.phase('시작', `주문마다 메뉴를 골라 만들 수 있는 조합을 모두 만들어, 코스 크기(${COURSE.join(', ')})별로 몇 번 주문되었는지 셉니다. 2명 이상이 주문한 조합 중 가장 많은 것이 코스가 됩니다.`, AT.start);
  rec.do(wait(300));

  sim.runs.forEach((run, i) => {
    const order = ORDERS[i];
    cur = i;
    work += run.combos.length;
    rec.step({ title: `주문 ${i + 1} ${q(order)}: 조합 ${run.combos.length}개 세기`, codeHighlights: AT.count, ...meta() });

    if (sortFirst) {
      const changed = run.text !== order;
      rec.phase('정렬하기', changed
        ? `${q(order)}의 메뉴를 정렬해 ${q(run.text)}로 만듭니다. 순서가 달라도 같은 조합이 같은 이름이 됩니다.`
        : `${q(order)}는 이미 알파벳순입니다. 정렬해도 그대로입니다.`, AT.sort);
      rec.do(...together([...[...run.text].map((ch, c) => set(oid(i, c), { text: ch, tone: 'queued' })), calcTo(`주문 ${i + 1} → ${q(run.text)}`)]));
    } else {
      rec.phase('그대로 두기', `${q(order)}를 정렬하지 않고 주문한 순서 그대로 조합을 만듭니다.`, AT.sort);
      rec.do(...together([...[...order].map((_, c) => set(oid(i, c), { tone: 'queued' })), calcTo(`주문 ${i + 1} → ${q(order)} 그대로`)]));
    }

    const fresh = run.combos.filter((s) => s.count === 1);
    const last = oid(i, order.length - 1);
    rec.phase('조합 세기', `조합 ${run.combos.length}가지를 세어 막대에 더합니다. ${fresh.length ? `새 조합 ${fresh.length}개` : ''}${fresh.length && run.combos.length > fresh.length ? ', ' : ''}${run.combos.length > fresh.length ? `이미 있던 조합 ${run.combos.length - fresh.length}개는 한 번 더 셉니다` : ''}.`, AT.count);
    rec.do(...together(fresh.map((s) => ({ type: 'add', item: barItem(s.key, rows.get(s.key)!, 0), from: last }) as Action)));
    rec.do({ type: 'focus', ids: [...[...order].map((_, c) => oid(i, c))] });
    rec.do(...together(run.combos.map((s): Action => ({ type: 'arrow', from: last, to: bid(s.key), verdict: (s.count === 1 ? 'new' : 'good') as Verdict, label: s.count === 1 ? '새 조합' : `${s.count}번째` }))), wait(150));
    rec.do(...together([...clear(), ...run.combos.map((s) => barTo(s.key, s.count, s.count >= 2 ? 'chosen' : 'plain')), ...[...order].map((_, c) => tone(oid(i, c), 'visited'))]));
    run.combos.forEach((s) => counts.set(s.key, s.count));
  });

  cur = -1;
  sim.picks.forEach((p) => {
    size = p.size;
    result = [...result, ...p.menus];
    const group = [...sim.counters.get(p.size)!];
    rec.step({ title: p.menus.length ? `크기 ${p.size}: 최다 ${p.top}회 → ${p.menus.join(', ')}` : `크기 ${p.size}: 코스 없음`, codeHighlights: AT.pick, ...meta() });
    rec.phase('최다 고르기', group.length === 0
      ? `크기 ${p.size}로 만들 수 있는 조합이 하나도 없습니다(주문한 메뉴가 모두 ${p.size - 1}개 이하). 이 크기의 코스는 없습니다.`
      : p.menus.length
        ? `크기 ${p.size} 조합 가운데 가장 많이 주문된 것은 ${p.top}회이고, 2회 이상이라 ${p.menus.map(q).join(', ')}를 코스로 정합니다.${p.menus.length > 1 ? ' 같은 횟수는 모두 넣습니다.' : ''}`
        : `크기 ${p.size} 조합은 가장 많아야 ${p.top}회라 2명 이상이 주문한 조합이 없습니다. 이 크기의 코스는 없습니다.`, AT.pick);
    rec.do(...together([
      set('t:k', { text: `코스 크기 ${p.size}` }, true),
      set('t:max', { text: `가장 많은 주문 ${p.top}회` }, true),
      ...group.filter(([key]) => p.menus.includes(key)).map(([key]) => tone(bid(key), 'good')),
    ]));
    rec.do(...together([set('t:res', { text: `코스 ${result.join(', ')}` }, true), calcTo(p.menus.length ? `크기 ${p.size}: ${p.menus.join(', ')}` : `크기 ${p.size}: 없음`)]));
  });

  size = undefined;
  const answer = sim.answer;
  rec.step({ title: sortFirst ? `${listText(answer)}` : `${listText(answer)} — 정답은 ${listText(SORTED.answer)}`, codeHighlights: AT.done, ...meta(), answer, isKeyframe: true });
  if (sortFirst) {
    rec.phase('결과', `크기별로 고른 조합을 사전 순으로 정렬해 ${josa(listText(answer), '을', '를')} 돌려줍니다. 조합 ${checksOf(sim)}개를 세는 것으로 끝났습니다.`, AT.done);
    rec.do(...together([set('t:res', { text: `코스 ${answer.join(', ')}`, tone: 'path' }, true), calcTo(`답 ${answer.join(', ')}`)]));
  } else {
    const missing = SORTED.answer.filter((m) => !answer.includes(m));
    rec.phase('비교하기', `${josa(listText(answer), '을', '를')} 돌려줍니다. 하지만 정답은 ${listText(SORTED.answer)}입니다. 주문 2는 "XWY", 주문 3은 "WXA"라 "WX"가 "XW"와 "WX"로 갈라져 각각 1번으로 세어졌고, ${missing.map(q).join(', ')}가 빠졌습니다. 메뉴를 정렬해야 합니다.`, AT.done);
    rec.do(...together([set('t:res', { text: `코스 ${answer.join(', ')}`, tone: 'bad' }, true), calcTo(`내 답 ${answer.join(', ')} · 정답 ${SORTED.answer.join(', ')}`)]));
  }
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 후보 만들기 → 주문마다 세기 → 최다 고르기 (코스 크기마다)              */
/* ------------------------------------------------------------------ */

function candidateFirst(): Visualization {
  const rec = new StepRecorder(board(`주문에 나온 메뉴 ${MENUS.join(', ')}로 후보를 먼저 모두 만듭니다`, ORDERS));
  let work = 0;
  let result: string[] = [];
  let size: number | undefined;
  const meta = (): Meta => ({ work, variables: { ...(size === undefined ? {} : { size }), answer: listText(result) } });

  rec.step({ title: `후보에 쓸 메뉴 ${MENUS.length}개`, codeHighlights: CD_AT.start, ...meta() });
  rec.phase('시작', `주문에 나온 메뉴는 ${MENUS.join(', ')} ${MENUS.length}가지입니다. 코스 크기마다 이 메뉴로 만들 수 있는 조합을 먼저 모두 만들고, 각 조합을 주문마다 일일이 맞춰 몇 번 주문되었는지 셉니다.`, CD_AT.start);
  rec.do(wait(300));

  CANDIDATES.forEach(({ size: k, counts }) => {
    size = k;
    const keys = [...counts.keys()];
    const checks = keys.length * ORDERS.length;
    work += checks;
    const { top, menus } = pickTop(counts);
    rec.step({ title: `크기 ${k}: 후보 ${keys.length}개 × 주문 ${ORDERS.length}개 확인${menus.length ? ` → ${menus.join(', ')}` : ''}`, codeHighlights: CD_AT.pick, ...meta() });
    rec.phase('후보 만들기', keys.length ? `크기 ${k} 조합을 ${MENUS.length}가지 메뉴로 모두 만들면 ${keys.length}개입니다.` : `크기 ${k}로 만들 수 있는 조합이 없습니다.`, CD_AT.make);
    rec.do(...together([set('t:k', { text: `코스 크기 ${k}` }, true), set('t:max', { text: '가장 많은 주문 -' }), calcTo(`후보 ${keys.length}개`)]));
    rec.do(...together(keys.map((key, r): Action => ({ type: 'add', item: { id: `cand:${k}:${r}`, kind: 'bar', rect: barRect(r), tone: 'plain', text: `${key} 0회`, fill: 0 } }))));

    rec.phase('주문마다 세기', `후보 ${keys.length}개를 주문 ${ORDERS.length}개에 일일이 맞춰 ${checks}번 확인합니다. 조합의 메뉴가 주문에 모두 들어 있으면 한 번으로 셉니다.`, CD_AT.count);
    rec.do(...together(keys.map((key, r): Action => set(`cand:${k}:${r}`, { text: `${key} ${counts.get(key)}회`, fill: counts.get(key)! / ORDERS.length, tone: counts.get(key)! >= 2 ? 'chosen' : 'plain' }, true))));

    result = [...result, ...menus];
    rec.phase('최다 고르기', menus.length
      ? `가장 많이 주문된 조합은 ${top}회이고 2회 이상이라 ${menus.map(q).join(', ')}를 코스로 정합니다.`
      : `가장 많아야 ${top}회라 2명 이상이 주문한 조합이 없습니다. 이 크기의 코스는 없습니다.`, CD_AT.pick);
    rec.do(...together([
      ...keys.map((key, r) => tone(`cand:${k}:${r}`, menus.includes(key) ? 'good' : counts.get(key)! >= 2 ? 'chosen' : 'plain')),
      set('t:max', { text: `가장 많은 주문 ${top}회` }, true),
      set('t:res', { text: `코스 ${result.join(', ')}` }, true),
    ]));
    rec.do(...together(keys.map((_, r): Action => ({ type: 'remove', id: `cand:${k}:${r}` }))));
  });

  size = undefined;
  rec.step({ title: `${listText(SORTED.answer)}`, codeHighlights: CD_AT.done, ...meta(), answer: SORTED.answer, isKeyframe: true });
  rec.phase('결과', `크기별로 고른 조합을 사전 순으로 정렬해 ${josa(listText(SORTED.answer), '을', '를')} 돌려줍니다. 답은 정석과 같지만 후보를 모두 만들어 ${work}번 확인했습니다. 정석은 조합 ${checksOf(SORTED)}개만 세었습니다.`, CD_AT.done);
  rec.do(...together([set('t:res', { text: `코스 ${SORTED.answer.join(', ')}`, tone: 'path' }, true), calcTo(`답 ${SORTED.answer.join(', ')}`)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'menu-renewal',
  title: '메뉴 리뉴얼',
  level: 2,
  category: 'brute-force',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/72411',
  description: {
    summary:
      '레스토랑에서 손님들이 단품 메뉴를 어떻게 묶어 주문했는지(orders)와 만들고 싶은 코스 요리의 메뉴 개수(course)가 주어집니다. 코스 요리는 단품 메뉴를 2개 이상 묶어 만들고, 코스 크기마다 2명 이상이 함께 주문한 조합 가운데 가장 많이 주문된 조합을 코스로 정합니다. 가장 많은 조합이 여러 개면 모두 넣고, 결과는 사전 순으로 정렬합니다.',
    rules: [
      'orders는 길이 2 이상 20 이하이고, 각 원소는 길이 2 이상 10 이하의 대문자 문자열(같은 알파벳이 두 번 나오지 않음)',
      'course는 길이 1 이상 10 이하이고, 각 원소는 2 이상 10 이하이며 오름차순이고 중복 없음',
      '최소 2명 이상이 주문한 조합만 코스가 될 수 있고, 결과는 사전 순으로 정렬한 문자열 배열(각 메뉴 문자열 안의 알파벳도 오름차순)',
    ],
    examples: [
      { input: 'orders = ["ABCFG", "AC", "CDE", "ACDE", "BCFG", "ACDEH"], course = [2, 3, 4]', output: '["AC", "ACDE", "BCFG", "CDE"]' },
      { input: 'orders = ["ABCDE", "AB", "CD", "ADE", "XYZ", "XYZ", "ACD"], course = [2, 3, 5]', output: '["ACD", "AD", "ADE", "CD", "XYZ"]' },
      { input: 'orders = ["XYZ", "XWY", "WXA"], course = [2, 3, 4]', output: '["WX", "XY"]' },
    ],
  },
  keyIntuitions: [
    '주문마다 메뉴가 최대 10개라 한 주문에서 만들 수 있는 조합은 많아야 2^10 = 1,024개입니다. 주문 20개여도 모든 조합을 만들어 세는 완전탐색이 충분히 빠릅니다.',
    '같은 메뉴 조합이 순서만 달라 다른 이름("XW"와 "WX")이 되지 않게, 주문마다 메뉴를 알파벳순으로 정렬한 뒤 조합을 만들어야 합니다.',
    '코스 크기마다 조합별 주문 횟수를 세어, 가장 많은 횟수가 2회 이상이면 그 횟수의 조합을 모두 고릅니다. 횟수가 같은 조합은 전부 넣습니다.',
  ],
  demo: { input: [ORDERS, COURSE], label: 'orders = ["XYZ", "XWY", "WXA"], course = [2, 3, 4]' },
  workUnit: '조합을 세거나 확인한 횟수',
  approaches: [
    {
      id: 'menu-combinations',
      name: '주문마다 정렬해 조합을 만들고 개수 세기',
      rank: 'BEST',
      timeComplexity: 'O(주문 수 × 2^메뉴 수)',
      spaceComplexity: 'O(조합 수)',
      verdict: '주문마다 메뉴를 정렬하고, 코스 크기별로 만들 수 있는 조합을 모두 만들어 몇 번 주문되었는지 센 뒤 가장 많은 것을 고릅니다.',
      pros: [
        '실제로 주문에 나온 조합만 만들어 세기 때문에 쓸데없는 조합을 만들지 않습니다.',
        '메뉴를 정렬해 두어 순서가 달라도 같은 조합이 같은 이름이 됩니다.',
        '횟수가 같은 조합을 모두 고르는 규칙이 코드에 그대로 나옵니다.',
      ],
      cons: [
        '정렬을 빠뜨리면 같은 조합이 갈라져 답이 틀립니다.',
        '코스 크기마다 따로 세어야 해서 사전을 크기별로 나눠 둬야 합니다.',
      ],
      whyThisRank: `주문에 나온 조합만 세므로 작업이 가장 적습니다. 시각화 입력에서는 조합 ${checksOf(SORTED)}개만 세면 끝납니다.`,
      code: BEST,
      visualize: () => counting(true),
    },
    {
      id: 'menu-candidates',
      name: '후보 조합을 먼저 모두 만들고 주문마다 확인',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(C(메뉴 종류, k) × 주문 수)',
      spaceComplexity: 'O(조합 수)',
      verdict: '주문에 나온 모든 메뉴로 코스 크기별 후보 조합을 먼저 만들고, 후보마다 모든 주문에 들어 있는지 일일이 확인해 셉니다.',
      pros: ['주문 안의 메뉴 순서나 정렬을 신경 쓰지 않아도 됩니다.', '조합이 주문에 몇 번 들어 있는지를 정의 그대로 구해 이해하기 쉽습니다.'],
      cons: [
        `주문한 적 없는 조합까지 후보로 만들어 확인합니다. 시각화 입력에서는 ${CANDIDATES.reduce((s, c) => s + c.counts.size, 0) * ORDERS.length}번이나 확인합니다.`,
        '메뉴가 26가지면 후보가 수만 개로 늘어 시간이 오래 걸립니다.',
      ],
      whyThisRank: `답은 같지만 후보가 주문에 나온 조합보다 훨씬 많아질 수 있습니다. 이 입력에서 정석은 ${checksOf(SORTED)}번이면 되는데 이 풀이는 ${CANDIDATES.reduce((s, c) => s + c.counts.size, 0) * ORDERS.length}번 확인합니다.`,
      code: CAND,
      visualize: candidateFirst,
    },
    {
      id: 'menu-unsorted',
      name: '메뉴를 정렬하지 않고 조합 세기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(주문 수 × 2^메뉴 수)',
      spaceComplexity: 'O(조합 수)',
      verdict: '주문한 순서 그대로 조합을 만들어 세다가, 순서만 다른 같은 조합을 서로 다른 것으로 세어 답을 놓치는 오답 풀이입니다.',
      pros: ['정석에서 정렬 한 줄만 빠진 모양이라 쓰기 쉽습니다.', '주문마다 메뉴가 이미 알파벳순으로 들어오는 입력에서는 맞습니다.'],
      cons: [
        `시각화 입력에서 주문 "XWY"와 "WXA"의 "XW"와 "WX"가 다른 조합으로 세어져 "WX"가 1번씩만 나옵니다. ${listText(UNSORTED.answer)}만 돌려주고 정답 ${listText(SORTED.answer)}과 다릅니다.`,
        '원문 예제 중 주문이 모두 정렬된 입력은 통과해서 틀린 줄 알아채기 어렵습니다.',
      ],
      whyThisRank: '조합은 메뉴의 집합이라 순서가 달라도 같아야 합니다. 주문마다 메뉴를 정렬해서 조합의 이름을 하나로 맞춰야 정확히 셀 수 있습니다.',
      code: RAW,
      visualize: () => counting(false),
    },
  ],
  checks: {
    cases: [
      { args: [['ABCFG', 'AC', 'CDE', 'ACDE', 'BCFG', 'ACDEH'], [2, 3, 4]], expected: ['AC', 'ACDE', 'BCFG', 'CDE'] },
      { args: [['ABCDE', 'AB', 'CD', 'ADE', 'XYZ', 'XYZ', 'ACD'], [2, 3, 5]], expected: ['ACD', 'AD', 'ADE', 'CD', 'XYZ'] },
      { args: [['XYZ', 'XWY', 'WXA'], [2, 3, 4]], expected: ['WX', 'XY'] },
      { args: [['AB', 'BA'], [2]], expected: ['AB'] },
      { args: [['AB', 'CD'], [2]], expected: [] },
      { args: [['ABC', 'ABC', 'ABC'], [2, 3]], expected: ['AB', 'ABC', 'AC', 'BC'] },
      { args: [['AB', 'AB'], [3]], expected: [] },
      { args: [ORDERS, COURSE], expected: ['WX', 'XY'] },
    ],
    // 주문 2~5개(메뉴 2~5개, 알파벳 A~F를 무작위 순서로)와 코스 크기 1~3개
    random: (rand) => {
      const letters = 'ABCDEF';
      const orders = Array.from({ length: 2 + Math.floor(rand() * 4) }, () => {
        const pool = [...letters];
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool.slice(0, 2 + Math.floor(rand() * 4)).join('');
      });
      const sizes = [2, 3, 4, 5].filter(() => rand() < 0.6);
      return [orders, sizes.length ? sizes : [2]];
    },
  },
};

export default problem;
