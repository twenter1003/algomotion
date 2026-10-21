// 금과 은 운반하기: 정석 세 부등식(금·은·합계) 이분 탐색, 대안 항목별 배열을 따로 만들어 합산하는 이분 탐색, 함정 금부터 먼저 채우는 그리디 이분 탐색(오답).
// 장면은 위에 시간 수직선(탐색 구간, mid·answer 표시), 가운데 3개 도시의 보유량과 트럭 정보·운반 가능량, 아래에 금·은·합계 3개의 달성 막대다.
import { axis, slots } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { lines, ro, together } from '../shared.ts';

// 시각화 입력: 0번 도시는 금·은이 모두 풍부하고, 1번은 금만, 2번은 은만 있다.
// 15시간이면 0번 도시가 금 20 + 은 10을 나눠 실어 총 금 30, 은 30을 맞출 수 있지만, 금부터 욕심내어 채우면 21시간이 걸린다고 잘못 판정한다.
const A = 30;
const B = 30;
const G = [30, 30, 0];
const S = [30, 0, 20];
const W_ARR = [10, 10, 10];
const T_ARR = [3, 7, 4];
const N = G.length;
const MAX_T = (Math.floor((A + B) / Math.min(...W_ARR)) + 1) * 2 * Math.max(...T_ARR); // 98시간

const movesAt = (i: number, time: number) => Math.floor((time + T_ARR[i]) / (2 * T_ARR[i]));
const capAt = (i: number, time: number) => movesAt(i, time) * W_ARR[i];

function evalTime(time: number) {
  let gold = 0;
  let silver = 0;
  let both = 0;
  const caps = G.map((_, i) => {
    const cap = capAt(i, time);
    gold += Math.min(G[i], cap);
    silver += Math.min(S[i], cap);
    both += Math.min(G[i] + S[i], cap);
    return cap;
  });
  const ok = gold >= A && silver >= B && both >= A + B;
  return { caps, gold, silver, both, ok };
}

function evalGreedy(time: number) {
  let gold = 0;
  let silver = 0;
  const caps = G.map((_, i) => {
    const cap = capAt(i, time);
    const takeG = Math.min(G[i], cap);
    const takeS = Math.min(S[i], cap - takeG);
    gold += takeG;
    silver += takeS;
    return cap;
  });
  const ok = gold >= A && silver >= B;
  return { caps, gold, silver, ok };
}

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BINARY = {
  python: `def solution(a, b, g, s, w, t):
    def can_deliver(time):
        gold = silver = both = 0
        for gi, si, wi, ti in zip(g, s, w, t):
            moves = (time + ti) // (2 * ti)  # 왕복 횟수 + 편도 1회 가능 여부
            cap = moves * wi
            gold += min(gi, cap)             # 금만 최대한 실을 때
            silver += min(si, cap)           # 은만 최대한 실을 때
            both += min(gi + si, cap)        # 금+은 합쳐 최대한 실을 때
        return gold >= a and silver >= b and both >= a + b

    left = 0
    right = ((a + b) // min(w) + 1) * 2 * max(t)
    answer = right
    while left <= right:
        mid = (left + right) // 2
        if can_deliver(mid):
            answer = mid
            right = mid - 1
        else:
            left = mid + 1
    return answer`,
  javascript: `function solution(a, b, g, s, w, t) {
  const canDeliver = (time) => {
    let gold = 0, silver = 0, both = 0;
    for (let i = 0; i < g.length; i++) {
      // BigInt 없이도 정밀도 안에서 동작하도록 Math.floor 나눗셈 사용
      const moves = Math.floor((time + t[i]) / (2 * t[i]));
      const cap = moves * w[i];
      gold += Math.min(g[i], cap);
      silver += Math.min(s[i], cap);
      both += Math.min(g[i] + s[i], cap);
    }
    return gold >= a && silver >= b && both >= a + b;
  };

  let left = 0;
  let right = (Math.floor((a + b) / Math.min(...w)) + 1) * 2 * Math.max(...t);
  let answer = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (canDeliver(mid)) {
      answer = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return answer;
}`,
};
const BINARY_AT = {
  start: lines(BINARY,
    ['left = 0', 'right = ((a + b) // min(w) + 1) * 2 * max(t)', 'answer = right'],
    ['let left = 0', 'let right = (Math.floor', 'let answer = right']),
  mid: lines(BINARY,
    ['while left <= right', 'mid = (left + right) // 2'],
    ['while (left <= right)', 'const mid = Math.floor']),
  check: lines(BINARY,
    ['moves = (time + ti) // (2 * ti)', 'gold += min(gi, cap)', 'silver += min(si, cap)', 'both += min(gi + si, cap)', 'return gold >= a and silver >= b and both >= a + b'],
    ['const moves = Math.floor', 'gold += Math.min(g[i], cap)', 'silver += Math.min(s[i], cap)', 'both += Math.min(g[i] + s[i], cap)', 'return gold >= a && silver >= b && both >= a + b']),
  pass: lines(BINARY,
    ['if can_deliver(mid):', 'answer = mid', 'right = mid - 1'],
    ['if (canDeliver(mid))', 'answer = mid', 'right = mid - 1']),
  fail: lines(BINARY,
    ['if can_deliver(mid):', 'else:', 'left = mid + 1'],
    ['if (canDeliver(mid))', '} else {', 'left = mid + 1']),
  done: lines(BINARY, ['while left <= right', 'return answer'], ['while (left <= right)', 'return answer']),
};

const ALT_CODE = {
  python: `def solution(a, b, g, s, w, t):
    left = 0
    right = ((a + b) // min(w) + 1) * 2 * max(t)
    answer = right
    while left <= right:
        mid = (left + right) // 2
        # 도시별 최대 운반량 배열과 금·은·합계 배열을 각각 따로 생성
        caps = [((mid + ti) // (2 * ti)) * wi for wi, ti in zip(w, t)]
        gold_arr = [min(gi, c) for gi, c in zip(g, caps)]
        silver_arr = [min(si, c) for si, c in zip(s, caps)]
        both_arr = [min(gi + si, c) for gi, si, c in zip(g, s, caps)]

        if sum(gold_arr) >= a and sum(silver_arr) >= b and sum(both_arr) >= a + b:
            answer = mid
            right = mid - 1
        else:
            left = mid + 1
    return answer`,
  javascript: `function solution(a, b, g, s, w, t) {
  let left = 0;
  let right = (Math.floor((a + b) / Math.min(...w)) + 1) * 2 * Math.max(...t);
  let answer = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // 도시별 최대 운반량 배열과 금·은·합계 배열을 각각 따로 생성
    const caps = t.map((ti, i) => Math.floor((mid + ti) / (2 * ti)) * w[i]);
    const goldArr = g.map((gi, i) => Math.min(gi, caps[i]));
    const silverArr = s.map((si, i) => Math.min(si, caps[i]));
    const bothArr = g.map((gi, i) => Math.min(gi + s[i], caps[i]));

    const gold = goldArr.reduce((acc, v) => acc + v, 0);
    const silver = silverArr.reduce((acc, v) => acc + v, 0);
    const both = bothArr.reduce((acc, v) => acc + v, 0);
    if (gold >= a && silver >= b && both >= a + b) {
      answer = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return answer;
}`,
};
const ALT_AT = {
  start: lines(ALT_CODE,
    ['left = 0', 'right = ((a + b) // min(w) + 1) * 2 * max(t)', 'answer = right'],
    ['let left = 0', 'let right = (Math.floor', 'let answer = right']),
  mid: lines(ALT_CODE,
    ['while left <= right', 'mid = (left + right) // 2'],
    ['while (left <= right)', 'const mid = Math.floor']),
  arrays: lines(ALT_CODE,
    ['caps = [', 'gold_arr = [', 'silver_arr = [', 'both_arr = ['],
    ['const caps = t.map', 'const goldArr = g.map', 'const silverArr = s.map', 'const bothArr = g.map']),
  pass: lines(ALT_CODE,
    ['if sum(gold_arr) >= a', 'answer = mid', 'right = mid - 1'],
    ['if (gold >= a && silver >= b', 'answer = mid', 'right = mid - 1']),
  fail: lines(ALT_CODE,
    ['if sum(gold_arr) >= a', 'else:', 'left = mid + 1'],
    ['if (gold >= a && silver >= b', '} else {', 'left = mid + 1']),
  done: lines(ALT_CODE, ['while left <= right', 'return answer'], ['while (left <= right)', 'return answer']),
};

const TRAP_CODE = {
  python: `def solution(a, b, g, s, w, t):
    def can_deliver_greedy(time):
        gold = silver = 0
        for gi, si, wi, ti in zip(g, s, w, t):
            cap = ((time + ti) // (2 * ti)) * wi
            take_g = min(gi, cap)            # 함정: 무조건 금을 먼저 채운다
            take_s = min(si, cap - take_g)   # 남은 용량으로만 은을 채운다
            gold += take_g
            silver += take_s
        return gold >= a and silver >= b

    left = 0
    right = ((a + b) // min(w) + 1) * 2 * max(t)
    answer = right
    while left <= right:
        mid = (left + right) // 2
        if can_deliver_greedy(mid):
            answer = mid
            right = mid - 1
        else:
            left = mid + 1
    return answer`,
  javascript: `function solution(a, b, g, s, w, t) {
  const canDeliverGreedy = (time) => {
    let gold = 0, silver = 0;
    for (let i = 0; i < g.length; i++) {
      const cap = Math.floor((time + t[i]) / (2 * t[i])) * w[i];
      const takeG = Math.min(g[i], cap); // 함정: 무조건 금을 먼저 채운다
      const takeS = Math.min(s[i], cap - takeG); // 남은 용량으로만 은을 채운다
      gold += takeG;
      silver += takeS;
    }
    return gold >= a && silver >= b;
  };

  let left = 0;
  let right = (Math.floor((a + b) / Math.min(...w)) + 1) * 2 * Math.max(...t);
  let answer = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (canDeliverGreedy(mid)) {
      answer = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return answer;
}`,
};
const TRAP_AT = {
  start: lines(TRAP_CODE,
    ['left = 0', 'right = ((a + b) // min(w) + 1) * 2 * max(t)', 'answer = right'],
    ['let left = 0', 'let right = (Math.floor', 'let answer = right']),
  mid: lines(TRAP_CODE,
    ['while left <= right', 'mid = (left + right) // 2'],
    ['while (left <= right)', 'const mid = Math.floor']),
  greedy: lines(TRAP_CODE,
    ['take_g = min(gi, cap)', 'take_s = min(si, cap - take_g)', 'return gold >= a and silver >= b'],
    ['const takeG = Math.min(g[i], cap)', 'const takeS = Math.min(s[i], cap - takeG)', 'return gold >= a && silver >= b']),
  pass: lines(TRAP_CODE,
    ['if can_deliver_greedy(mid):', 'answer = mid', 'right = mid - 1'],
    ['if (canDeliverGreedy(mid))', 'answer = mid', 'right = mid - 1']),
  fail: lines(TRAP_CODE,
    ['if can_deliver_greedy(mid):', 'else:', 'left = mid + 1'],
    ['if (canDeliverGreedy(mid))', '} else {', 'left = mid + 1']),
  done: lines(TRAP_CODE, ['while left <= right', 'return answer'], ['while (left <= right)', 'return answer']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 620;
const H = 356;
const FULL: Rect = { x: 0, y: 0, w: W, h: H };
const tx = axis({ x: 88, w: 444, min: 0, max: MAX_T });
const citySlot = slots({ x: 36, y: 136, w: 172, h: 58, gap: 16 });
const capSlot = slots({ x: 36, y: 198, w: 172, h: 22, gap: 16 });

const cityId = (i: number) => `city:${i}`;
const capId = (i: number) => `cap:${i}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'track', kind: 'line', rect: FULL, tone: 'trail', points: [[tx(0), 102], [tx(MAX_T), 102]] },
  ];
  G.forEach((gi, i) => {
    items.push(
      {
        id: cityId(i),
        kind: 'cell',
        rect: citySlot(i),
        tone: 'plain',
        text: `금 ${gi} · 은 ${S[i]}`,
        sub: `w=${W_ARR[i]}, 편도 ${T_ARR[i]}시간`,
        tag: `도시 ${i}`,
      },
      { id: capId(i), kind: 'text', rect: capSlot(i), tone: 'muted', text: '운반 한도 -' },
    );
  });
  const barY = (r: number) => 232 + r * 38;
  items.push(
    { id: 'lbl:g', kind: 'text', rect: { x: 24, y: barY(0), w: 80, h: 30 }, text: '금 최대합' },
    { id: 'bar:g', kind: 'bar', rect: { x: 108, y: barY(0), w: 340, h: 30 }, fill: 0, text: '0' },
    { id: 'goal:g', kind: 'token', rect: { x: 460, y: barY(0), w: 124, h: 30 }, tone: 'plain', text: `목표 ${A}` },

    { id: 'lbl:s', kind: 'text', rect: { x: 24, y: barY(1), w: 80, h: 30 }, text: '은 최대합' },
    { id: 'bar:s', kind: 'bar', rect: { x: 108, y: barY(1), w: 340, h: 30 }, fill: 0, text: '0' },
    { id: 'goal:s', kind: 'token', rect: { x: 460, y: barY(1), w: 124, h: 30 }, tone: 'plain', text: `목표 ${B}` },

    { id: 'lbl:m', kind: 'text', rect: { x: 24, y: barY(2), w: 80, h: 30 }, text: '합계 최대' },
    { id: 'bar:m', kind: 'bar', rect: { x: 108, y: barY(2), w: 340, h: 30 }, fill: 0, text: '0' },
    { id: 'goal:m', kind: 'token', rect: { x: 460, y: barY(2), w: 124, h: 30 }, tone: 'plain', text: `목표 ${A + B}` },
  );
  return { width: W, height: H, items };
}

const put = (rec: StepRecorder, { id, kind, ...patch }: Item): Action =>
  rec.has(id) ? { type: 'set', id, patch } : { type: 'add', item: { id, kind, ...patch } };

const range = (l: number, r: number): Item[] => [
  { id: 'range', kind: 'zone', rect: { x: tx(l - 0.5), y: 90, w: tx(r + 0.5) - tx(l - 0.5), h: 24 } },
  { id: 'left', kind: 'token', rect: { x: tx(l - 0.5) - 76, y: 30, w: 76, h: 24 }, tone: 'plain', text: `left ${l}` },
  { id: 'right', kind: 'token', rect: { x: tx(r + 0.5), y: 30, w: 80, h: 24 }, tone: 'plain', text: `right ${r}` },
];

const answerLabel = (v: number): Item =>
  ({ id: 'answer', kind: 'token', rect: { x: tx(v) - 46, y: 0, w: 92, h: 24 }, tone: 'path', text: `answer ${v}` });

const probeTo = (rec: StepRecorder, v: number, text: string, tone: Tone): Action[] => [
  put(rec, { id: 'probe', kind: 'token', rect: { x: tx(v) - 2, y: 86, w: 4, h: 32 }, tone }),
  put(rec, { id: 'probe:label', kind: 'token', rect: { x: tx(v) - 46, y: 58, w: 92, h: 26 }, tone, text }),
];

function updateBars(time: number): Action[] {
  const { caps, gold, silver, both } = evalTime(time);
  return [
    ...caps.map((c, i): Action => ({
      type: 'set',
      id: cityId(i),
      patch: { tone: c > 0 ? 'visited' : 'muted' },
    })),
    ...caps.map((c, i): Action => ({
      type: 'set',
      id: capId(i),
      patch: { text: `${movesAt(i, time)}회 → 최대 ${c}`, tone: c > 0 ? 'good' : 'muted' },
    })),
    { type: 'set', id: 'bar:g', patch: { fill: Math.min(1, gold / A), text: `${gold}`, tone: gold >= A ? 'good' : 'bad' } },
    { type: 'set', id: 'bar:s', patch: { fill: Math.min(1, silver / B), text: `${silver}`, tone: silver >= B ? 'good' : 'bad' } },
    { type: 'set', id: 'bar:m', patch: { fill: Math.min(1, both / (A + B)), text: `${both}`, tone: both >= A + B ? 'good' : 'bad' } },
  ];
}

/* ------------------------------------------------------------------ */
/* 정석: 시간을 이분 탐색 (금·은·합계 세 부등식 판정)                    */
/* ------------------------------------------------------------------ */

function binarySearch(): Visualization {
  const rec = new StepRecorder(board());
  let [left, right] = [0, MAX_T];
  let answer = right;
  let work = 0;

  rec.step({
    title: `탐색 구간 0 ~ ${MAX_T}시간 설정`,
    codeHighlights: BINARY_AT.start,
    work,
    variables: { left, right, answer, '필요 금': A, '필요 은': B },
  });
  rec.phase('시작', `금 ${A}, 은 ${B}(합계 ${A + B})를 모두 나르는 시간의 상한을 ${MAX_T}시간으로 잡고 이분 탐색을 시작합니다.`, BINARY_AT.start);
  rec.do(...together([...range(left, right).map((it) => put(rec, it)), put(rec, answerLabel(answer))]));

  while (left <= right) {
    const [l, r] = [left, right];
    const mid = Math.floor((left + right) / 2);
    const { caps, gold, silver, both, ok } = evalTime(mid);
    work += N;
    if (ok) [answer, right] = [mid, mid - 1];
    else left = mid + 1;
    const decide = ok ? BINARY_AT.pass : BINARY_AT.fail;

    rec.step({
      title: `mid = ${mid}시간 → 금 ${gold}, 은 ${silver}, 합계 ${both} (${ok ? '가능' : '부족'})`,
      codeHighlights: decide,
      work,
      variables: { left, right, mid, gold, silver, both, answer },
    });
    rec.phase('가운데 고르기', `mid = ⌊(${l} + ${r}) ÷ 2⌋ = ${mid}시간일 때 각 도시의 운반 한도를 계산합니다.`, BINARY_AT.mid);
    rec.do(...together(probeTo(rec, mid, `mid ${mid}`, 'current')));

    rec.phase('세 조건 확인', `운반 한도는 [${caps.join(', ')}]입니다. 금 최대합 ${gold}(≥${A}), 은 최대합 ${silver}(≥${B}), 합계 최대 ${both}(≥${A + B})를 확인합니다.`, BINARY_AT.check);
    rec.do(...together(updateBars(mid)));

    rec.phase('범위 줄이기', ok
      ? `세 조건을 모두 만족하므로 answer = ${ro(mid)} 저장하고 right = ${ro(right)} 줄입니다.`
      : `조건을 만족하지 못하므로 시간을 늘려 left = ${ro(left)} 올립니다.`,
    decide);
    const [zone, leftMark, rightMark] = range(left, right);
    rec.do(...together([put(rec, zone), put(rec, ok ? rightMark : leftMark), ...(ok ? [put(rec, answerLabel(answer))] : [])]));
  }

  const finalEval = evalTime(answer);
  rec.step({
    title: `최소 시간 ${answer}시간 확정`,
    codeHighlights: BINARY_AT.done,
    work,
    variables: { answer, gold: finalEval.gold, silver: finalEval.silver, both: finalEval.both, '확인 횟수': work },
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `${answer}시간이면 도시 1에서 금 10, 도시 2에서 은 20, 도시 0에서 금 20 + 은 10을 실어 금 ${A}, 은 ${B}을 정확히 채웁니다.`, BINARY_AT.done);
  rec.do(...together([
    { type: 'remove', id: 'answer' },
    ...probeTo(rec, answer, `answer ${answer}`, 'path'),
    { type: 'remove', id: 'range' },
    ...updateBars(answer),
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안: 항목별 배열을 따로 만들어 합산하는 이분 탐색                    */
/* ------------------------------------------------------------------ */

function altBinarySearch(): Visualization {
  const rec = new StepRecorder(board());
  let [left, right] = [0, MAX_T];
  let answer = right;
  let work = 0;

  rec.step({
    title: `탐색 구간 0 ~ ${MAX_T}시간 설정 (배열 4개 분리 생성)`,
    codeHighlights: ALT_AT.start,
    work,
    variables: { left, right, answer },
  });
  rec.phase('시작', '검사할 때마다 caps, goldArr, silverArr, bothArr 네 배열을 따로 만들고 각각 합산합니다.', ALT_AT.start);
  rec.do(...together([...range(left, right).map((it) => put(rec, it)), put(rec, answerLabel(answer))]));

  while (left <= right) {
    const [l, r] = [left, right];
    const mid = Math.floor((left + right) / 2);
    const { caps, gold, silver, both, ok } = evalTime(mid);
    work += N * 3; // 금 배열, 은 배열, 합계 배열을 각각 따로 순회
    if (ok) [answer, right] = [mid, mid - 1];
    else left = mid + 1;
    const decide = ok ? ALT_AT.pass : ALT_AT.fail;

    rec.step({
      title: `mid = ${mid}시간 → 배열 4개 생성·합산 (${ok ? '가능' : '부족'})`,
      codeHighlights: decide,
      work,
      variables: { left, right, mid, caps: `[${caps.join(', ')}]`, gold, silver, both, answer },
    });
    rec.phase('가운데 고르기', `mid = ⌊(${l} + ${r}) ÷ 2⌋ = ${mid}시간을 검사합니다.`, ALT_AT.mid);
    rec.do(...together(probeTo(rec, mid, `mid ${mid}`, 'current')));

    rec.phase('배열 생성·합산', `도시 배열을 여러 번 순회해 금(${gold}), 은(${silver}), 합계(${both}) 배열을 따로 만들고 합산합니다.`, ALT_AT.arrays);
    rec.do(...together(updateBars(mid)));

    rec.phase('범위 줄이기', ok
      ? `세 합계가 모두 목표 이상이므로 answer = ${ro(mid)} 갱신하고 right = ${ro(right)} 줄입니다.`
      : `부족하므로 left = ${ro(left)} 올립니다.`,
    decide);
    const [zone, leftMark, rightMark] = range(left, right);
    rec.do(...together([put(rec, zone), put(rec, ok ? rightMark : leftMark), ...(ok ? [put(rec, answerLabel(answer))] : [])]));
  }

  rec.step({
    title: `최소 시간 ${answer}시간 (정석보다 3배 순회 + O(N) 메모리)`,
    codeHighlights: ALT_AT.done,
    work,
    variables: { answer, '확인 횟수': work },
    answer,
    isKeyframe: true,
  });
  rec.phase('정답', `답은 ${answer}시간으로 같지만, 매 검사마다 길이 10만짜리 배열 4개를 새로 만들고 따로 합산해 시간과 메모리를 더 씁니다.`, ALT_AT.done);
  rec.do(...together([
    { type: 'remove', id: 'answer' },
    ...probeTo(rec, answer, `answer ${answer}`, 'path'),
    { type: 'remove', id: 'range' },
    ...updateBars(answer),
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정: 금부터 먼저 채우고 남은 용량으로 은을 채우는 그리디 (오답)       */
/* ------------------------------------------------------------------ */

function trapGreedySearch(): Visualization {
  const rec = new StepRecorder(board());
  let [left, right] = [0, MAX_T];
  let answer = right;
  let work = 0;

  rec.step({
    title: '함정: 도시마다 무조건 금을 먼저 채우는 그리디 판정',
    codeHighlights: TRAP_AT.start,
    work,
    variables: { left, right, answer },
  });
  rec.phase('시작', '합계 부등식을 쓰는 대신, 각 도시에서 금을 먼저 최대한 싣고 남은 용량으로만 은을 싣는 그리디 판정을 시도합니다.', TRAP_AT.start);
  rec.do(...together([
    ...range(left, right).map((it) => put(rec, it)),
    put(rec, answerLabel(answer)),
    { type: 'set', id: 'lbl:m', patch: { text: '합계 미사용', tone: 'muted' } },
  ]));

  while (left <= right) {
    const [l, r] = [left, right];
    const mid = Math.floor((left + right) / 2);
    const { caps, gold, silver, ok } = evalGreedy(mid);
    work += N;
    if (ok) [answer, right] = [mid, mid - 1];
    else left = mid + 1;
    const decide = ok ? TRAP_AT.pass : TRAP_AT.fail;

    rec.step({
      title: `mid = ${mid}시간 → 그리디 금 ${gold}, 은 ${silver} (${ok ? '통과' : '실패'})`,
      codeHighlights: decide,
      work,
      variables: { left, right, mid, '그리디 금': gold, '그리디 은': silver, answer },
    });
    rec.phase('가운데 고르기', `mid = ⌊(${l} + ${r}) ÷ 2⌋ = ${mid}시간을 확인합니다.`, TRAP_AT.mid);
    rec.do(...together(probeTo(rec, mid, `mid ${mid}`, 'current')));

    rec.phase('그리디 배분', mid === 15
      ? `15시간에 도시 0(한도 30)이 금 30을 먼저 다 실어 버려 은을 0밖에 못 싣습니다! 그 바람에 은 합계가 ${silver} < ${B}이 되어 가능한 15시간을 불가능하다고 잘못 판정합니다.`
      : `금을 먼저 채우니 금 합계는 ${gold}, 남은 용량으로 채운 은 합계는 ${silver}입니다.`,
    TRAP_AT.greedy);
    rec.do(...together([
      ...caps.map((c, i): Action => ({
        type: 'set',
        id: capId(i),
        patch: { text: `금 ${Math.min(G[i], c)} · 은 ${Math.min(S[i], c - Math.min(G[i], c))}`, tone: 'bad' },
      })),
      { type: 'set', id: 'bar:g', patch: { fill: Math.min(1, gold / A), text: `${gold}`, tone: gold >= A ? 'good' : 'bad' } },
      { type: 'set', id: 'bar:s', patch: { fill: Math.min(1, silver / B), text: `${silver}`, tone: silver >= B ? 'good' : 'bad' } },
    ]));

    rec.phase('범위 줄이기', ok
      ? `그리디 판정을 통과해 answer = ${ro(mid)} 줄입니다.`
      : `은이 부족하다고 착각해 left = ${ro(left)} 올려 버립니다.`,
    decide);
    const [zone, leftMark, rightMark] = range(left, right);
    rec.do(...together([put(rec, zone), put(rec, ok ? rightMark : leftMark), ...(ok ? [put(rec, answerLabel(answer))] : [])]));
  }

  rec.step({
    title: `오답 ${answer}시간 반환 (실제 최소 시간은 15시간)`,
    codeHighlights: TRAP_AT.done,
    work,
    variables: { '함정 답': answer, '실제 정답': 15 },
    answer,
    isKeyframe: true,
  });
  rec.phase('오답 확인', `도시 0에서 금과 은의 비율을 조절하면 15시간에 끝낼 수 있는데, 금부터 무조건 채운 탓에 ${answer}시간이라는 오답을 냈습니다.`, TRAP_AT.done);
  rec.do(...together([
    { type: 'set', id: 'answer', patch: { text: `오답 ${answer}`, tone: 'bad' } },
    ...probeTo(rec, 15, '정답 15', 'path'),
    { type: 'remove', id: 'range' },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'gold-silver',
  title: '금과 은 운반하기',
  level: 3,
  category: 'binary-search',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/86053',
  description: {
    summary:
      '새 도시를 짓기 위해 금 a kg과 은 b kg이 필요합니다. 각 도시마다 보유한 금·은의 양과 전용 트럭의 적재 한도 w[i], 편도 이동 시간 t[i]가 주어질 때, 금 a kg과 은 b kg을 모두 운반할 수 있는 가장 빠른 시간을 구합니다.',
    rules: [
      'a, b는 0 이상 10^9 이하의 정수입니다.',
      '도시의 수(g, s, w, t의 길이)는 1 이상 100,000 이하입니다.',
      'w[i]는 1 이상 100 이하, t[i]는 1 이상 100,000 이하의 자연수입니다.',
      '트럭은 새 도시로 갈 때는 편도 t[i]시간, 돌아올 때도 t[i]시간이 걸리며 금과 은을 동시에 실을 수 있습니다.',
    ],
    examples: [
      { input: 'a = 10, b = 10, g = [100], s = [100], w = [7], t = [10]', output: '50' },
      { input: 'a = 90, b = 500, g = [70, 70, 0], s = [0, 0, 500], w = [100, 100, 2], t = [4, 8, 1]', output: '499' },
    ],
  },
  keyIntuitions: [
    '시간 T가 정해지면 i번 트럭의 편도 운반 횟수는 ⌊(T + t[i]) ÷ (2 × t[i])⌋회이고, 최대 운반 무게는 cap = 횟수 × w[i]입니다.',
    '각 도시에서 금과 은을 어떤 비율로 섞어 실을지 일일이 정할 필요 없이, "금 최대합 ≥ a", "은 최대합 ≥ b", "금+은 합계 최대합 ≥ a + b" 세 부등식이 동시에 성립하는지만 확인하면 됩니다.',
    '시간이 늘어날수록 세 최대합이 모두 단조 증가하므로, 세 부등식을 모두 만족하는 최소 시간을 이분 탐색으로 찾습니다.',
  ],
  demo: {
    input: [A, B, G, S, W_ARR, T_ARR],
    label: 'a = 30, b = 30, g = [30, 30, 0], s = [30, 0, 20], w = [10, 10, 10], t = [3, 7, 4]',
  },
  workUnit: '도시별 운반량 계산 횟수',
  approaches: [
    {
      id: 'gold-silver-binary',
      name: '시간을 이분 탐색',
      rank: 'BEST',
      timeComplexity: 'O(N log(maxT))',
      spaceComplexity: 'O(1)',
      verdict: '시간 T를 정해 두고 금 최대합·은 최대합·합계 최대합 세 부등식을 한 번의 순회로 판정하는 정석 풀이입니다.',
      pros: [
        '도시마다 금과 은을 몇 kg씩 나눌지 배분하지 않고도 세 부등식만으로 가능 여부를 완벽히 판정합니다.',
        '변수 3개만 누적하므로 추가 메모리가 O(1)이고, 약 50번 안팎의 이분 탐색으로 끝납니다.',
      ],
      cons: [
        '세 부등식(금, 은, 금+은 합계)이 왜 필요충분조건인지 떠올려야 합니다.',
        '최악의 경우 답이 약 4 × 10¹⁴까지 커질 수 있어 상한을 충분히 크게 잡아야 합니다.',
      ],
      whyThisRank:
        '트럭마다 금·은 적재 비율이 연속적으로 조절 가능하므로(정수 단위도 동일), 구간 합 조건(할의 결혼 정리·네트워크 플로우 조건)으로 바꾸면 O(N) 판정과 이분 탐색으로 풀립니다.',
      code: BINARY,
      visualize: binarySearch,
    },
    {
      id: 'gold-silver-array-binary',
      name: '항목별 운반 배열을 따로 만들어 합산하는 이분 탐색',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log(maxT))',
      spaceComplexity: 'O(N)',
      verdict: '같은 세 부등식 이분 탐색이지만 검사마다 도시별 한도·금·은·합계 배열을 따로 만들고 합산해 시간과 메모리를 더 씁니다.',
      pros: [
        '각 배열의 의미(도시별 운반 한도, 금 최대량, 은 최대량, 합계 최대량)가 분리되어 있어 디버깅하기 쉽습니다.',
      ],
      cons: [
        '도시가 최대 10만 개이므로 이분 탐색 단계마다 길이 10만짜리 배열 4개를 새로 만들고 여러 번 순회합니다.',
      ],
      whyThisRank:
        '정답은 정확히 구하지만, 한 번의 루프와 변수 3개로 끝낼 수 있는 계산을 배열 4개 생성과 반복 합산으로 나누어 상수 시간과 메모리에서 손해를 봅니다.',
      code: ALT_CODE,
      visualize: altBinarySearch,
    },
    {
      id: 'gold-silver-greedy-wrong',
      name: '금을 먼저 채우고 남은 용량으로 은을 채우는 그리디',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log(maxT))',
      spaceComplexity: 'O(1)',
      verdict: '각 도시에서 무조건 금부터 최대한 싣고 남는 트럭 용량으로만 은을 싣는 그리디 판정으로, 오답을 냅니다.',
      pros: ['합계 부등식을 생각하지 않고 직관적으로 작성하기 쉽습니다.'],
      cons: [
        '금만 있는 도시에서 금을 가져오면 되는데도, 금·은이 모두 있는 도시의 트럭 용량을 금에 다 써 버려 은이 부족하다고 잘못 판정합니다.',
      ],
      whyThisRank:
        '가장 흔히 빠지는 오답 함정입니다. 어느 도시가 금을 맡고 어느 도시가 은을 맡을지는 고정된 우선순위로 정할 수 없으므로 반드시 세 부등식(금, 은, 합계)으로 판정해야 합니다.',
      code: TRAP_CODE,
      visualize: trapGreedySearch,
    },
  ],
  checks: {
    cases: [
      { args: [10, 10, [100], [100], [7], [10]], expected: 50 },
      { args: [90, 500, [70, 70, 0], [0, 0, 500], [100, 100, 2], [4, 8, 1]], expected: 499 },
      { args: [A, B, G, S, W_ARR, T_ARR], expected: 15 },
      { args: [0, 0, [10], [10], [5], [3]], expected: 0 },
    ],
    random: (rand) => {
      const n = 2 + Math.floor(rand() * 3);
      const g = Array.from({ length: n }, () => Math.floor(rand() * 30));
      const s = Array.from({ length: n }, () => Math.floor(rand() * 30));
      const w = Array.from({ length: n }, () => 1 + Math.floor(rand() * 10));
      const t = Array.from({ length: n }, () => 1 + Math.floor(rand() * 10));
      const totalG = g.reduce((acc, v) => acc + v, 0);
      const totalS = s.reduce((acc, v) => acc + v, 0);
      const a = Math.floor(rand() * (totalG + 1));
      const b = Math.floor(rand() * (totalS + 1));
      return [a, b, g, s, w, t];
    },
  },
};

export default problem;
