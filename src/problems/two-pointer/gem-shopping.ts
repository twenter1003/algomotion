// 보석 쇼핑: 정석 모든 종류를 담는 최소 구간(투 포인터 + 해시 맵), 대안 길이 이분 탐색 + 슬라이딩 윈도우, 함정 시작점마다 끝점까지 다시 세기를 비교한다.
import { grid, slots } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { lines, ro, together } from '../shared.ts';

// 공식 예제 1과 같은 입력
const GEMS = ['DIA', 'RUBY', 'RUBY', 'DIA', 'DIA', 'EMERALD', 'SAPPHIRE', 'DIA'];
const N = GEMS.length;
const KINDS = ['DIA', 'RUBY', 'EMERALD', 'SAPPHIRE'] as const;
const K = KINDS.length;
const SHORT: Record<string, string> = { DIA: 'DIA', RUBY: 'RUBY', EMERALD: 'EMER', SAPPHIRE: 'SAPP' };

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TWO_POINTER = {
  python: `def solution(gems):
    kind_count = len(set(gems))
    counts = {}
    best = [1, len(gems)]
    left = 0
    for right, gem in enumerate(gems):
        counts[gem] = counts.get(gem, 0) + 1      # 오른쪽 보석을 구간에 추가
        while len(counts) == kind_count:          # 모든 종류가 모인 동안 왼쪽을 줄인다
            if right - left < best[1] - best[0]:
                best = [left + 1, right + 1]
            left_gem = gems[left]
            counts[left_gem] -= 1
            if counts[left_gem] == 0:
                del counts[left_gem]
            left += 1
    return best`,
  javascript: `function solution(gems) {
  const kindCount = new Set(gems).size;
  const counts = new Map();
  let best = [1, gems.length];
  let left = 0;
  for (let right = 0; right < gems.length; right++) {
    const gem = gems[right];
    counts.set(gem, (counts.get(gem) ?? 0) + 1); // 오른쪽 보석을 구간에 추가
    while (counts.size === kindCount) {          // 모든 종류가 모인 동안 왼쪽을 줄인다
      if (right - left < best[1] - best[0]) {
        best = [left + 1, right + 1];
      }
      const leftGem = gems[left];
      if (counts.get(leftGem) === 1) counts.delete(leftGem);
      else counts.set(leftGem, counts.get(leftGem) - 1);
      left += 1;
    }
  }
  return best;
}`,
};
const TP_AT = {
  init: lines(TWO_POINTER, ['kind_count = len(set(gems))', 'counts = {}', 'best = [1, len(gems)]'], ['const kindCount = new Set(gems).size', 'const counts = new Map()', 'let best = [1, gems.length]']),
  addRight: lines(TWO_POINTER, ['for right, gem in enumerate(gems)', 'counts[gem] = counts.get(gem, 0) + 1'], ['for (let right = 0; right < gems.length; right++)', 'counts.set(gem, (counts.get(gem) ?? 0) + 1)']),
  checkFull: lines(TWO_POINTER, ['while len(counts) == kind_count', 'if right - left < best[1] - best[0]', 'best = [left + 1, right + 1]'], ['while (counts.size === kindCount)', 'if (right - left < best[1] - best[0])', 'best = [left + 1, right + 1]']),
  shrinkLeft: lines(TWO_POINTER, ['counts[left_gem] -= 1', 'if counts[left_gem] == 0', 'left += 1'], ['if (counts.get(leftGem) === 1) counts.delete(leftGem)', 'left += 1']),
  done: lines(TWO_POINTER, ['return best'], ['return best']),
};

const BIN_WINDOW = {
  python: `def solution(gems):
    n = len(gems)
    kind_count = len(set(gems))
    def find_window(length):
        counts = {}
        for i in range(n):
            counts[gems[i]] = counts.get(gems[i], 0) + 1
            if i >= length:
                old = gems[i - length]
                if counts[old] == 1:
                    del counts[old]
                else:
                    counts[old] -= 1
            if i >= length - 1 and len(counts) == kind_count:
                return [i - length + 2, i + 1]
        return None
    lo, hi = kind_count, n
    best = [1, n]
    while lo <= hi:
        mid = (lo + hi) // 2
        found = find_window(mid)
        if found:
            best = found
            hi = mid - 1
        else:
            lo = mid + 1
    return best`,
  javascript: `function solution(gems) {
  const n = gems.length;
  const kindCount = new Set(gems).size;
  const findWindow = (len) => {
    const counts = new Map();
    for (let i = 0; i < n; i++) {
      counts.set(gems[i], (counts.get(gems[i]) ?? 0) + 1);
      if (i >= len) {
        const old = gems[i - len];
        if (counts.get(old) === 1) counts.delete(old);
        else counts.set(old, counts.get(old) - 1);
      }
      if (i >= len - 1 && counts.size === kindCount) return [i - len + 2, i + 1];
    }
    return null;
  };
  let lo = kindCount, hi = n, best = [1, n];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const found = findWindow(mid);
    if (found) { best = found; hi = mid - 1; }
    else lo = mid + 1;
  }
  return best;
}`,
};
const BW_AT = {
  init: lines(BIN_WINDOW, ['kind_count = len(set(gems))', 'lo, hi = kind_count, n'], ['const kindCount = new Set(gems).size', 'let lo = kindCount, hi = n']),
  pickMid: lines(BIN_WINDOW, ['while lo <= hi', 'mid = (lo + hi) // 2', 'found = find_window(mid)'], ['while (lo <= hi)', 'const mid = (lo + hi) >> 1', 'const found = findWindow(mid)']),
  slide: lines(BIN_WINDOW, ['for i in range(n)', 'if i >= length - 1 and len(counts) == kind_count'], ['for (let i = 0; i < n; i++)', 'if (i >= len - 1 && counts.size === kindCount)']),
  hit: lines(BIN_WINDOW, ['if found:', 'best = found', 'hi = mid - 1'], ['if (found) { best = found; hi = mid - 1; }']),
  miss: lines(BIN_WINDOW, ['lo = mid + 1'], ['else lo = mid + 1']),
  done: lines(BIN_WINDOW, ['return best'], ['return best']),
};

const BRUTE = {
  python: `# 주의: 시작점마다 끝점을 늘리며 매번 세면 N = 100,000에서 시간 초과가 납니다
def solution(gems):
    n = len(gems)
    kind_count = len(set(gems))
    best = [1, n]
    for start in range(n):
        seen = set()
        for end in range(start, n):
            seen.add(gems[end])
            if len(seen) == kind_count:
                if end - start < best[1] - best[0]:
                    best = [start + 1, end + 1]
                break
    return best`,
  javascript: `// 주의: 시작점마다 끝점을 늘리며 매번 세면 N = 100,000에서 시간 초과가 납니다
function solution(gems) {
  const n = gems.length;
  const kindCount = new Set(gems).size;
  let best = [1, n];
  for (let start = 0; start < n; start++) {
    const seen = new Set();
    for (let end = start; end < n; end++) {
      seen.add(gems[end]);
      if (seen.size === kindCount) {
        if (end - start < best[1] - best[0]) best = [start + 1, end + 1];
        break;
      }
    }
  }
  return best;
}`,
};
const BRUTE_AT = {
  init: lines(BRUTE, ['kind_count = len(set(gems))', 'best = [1, n]'], ['const kindCount = new Set(gems).size', 'let best = [1, n]']),
  startLoop: lines(BRUTE, ['for start in range(n)', 'seen = set()'], ['for (let start = 0; start < n; start++)', 'const seen = new Set()']),
  innerLoop: lines(BRUTE, ['for end in range(start, n)', 'seen.add(gems[end])', 'if len(seen) == kind_count'], ['for (let end = start; end < n; end++)', 'seen.add(gems[end])', 'if (seen.size === kindCount)']),
  update: lines(BRUTE, ['if end - start < best[1] - best[0]', 'best = [start + 1, end + 1]'], ['if (end - start < best[1] - best[0]) best = [start + 1, end + 1]']),
  done: lines(BRUTE, ['return best'], ['return best']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 560;
const H = 248;
const gemAt = grid({ x: 68, y: 32, rows: 1, cols: N, cell: 54, gap: 6 });
const kindSlot = slots({ x: 68, y: 158, w: 78, h: 42, gap: 8 });
const gId = (i: number) => `g:${i}`;
const kId = (k: string) => `k:${k}`;
const ptrRect = (row: 0 | 1, idx: number): Rect => ({
  x: gemAt(0, Math.min(Math.max(idx, 0), N - 1)).x + 5,
  y: row === 0 ? 96 : 122,
  w: 44,
  h: 22,
});
const winRect = (l: number, r: number): Rect => {
  const a = gemAt(0, Math.min(l, r));
  const b = gemAt(0, Math.max(l, r));
  return { x: a.x - 3, y: a.y - 3, w: b.x + b.w - a.x + 6, h: a.h + 6 };
};
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });

const MS_PER_CHAR = 20;
const MIN_STEP = 2000;
const busy = (p: { start: number; actions: { start: number; duration: number }[] }) =>
  Math.max(0, ...p.actions.map((a) => a.start + a.duration - p.start));
const paced = (viz: Visualization): Visualization => {
  for (const step of viz.steps) {
    const { phases } = planStep(step);
    phases.forEach((p, i) => {
      const tail = i < phases.length - 1 ? PHASE_GAP : step.isKeyframe ? KEYFRAME_TAIL : STEP_TAIL;
      const want = [...step.phases[i].caption].length * MS_PER_CHAR - tail;
      if (p.end - p.start < want) step.phases[i].actions.push(wait(Math.ceil(want - busy(p))));
    });
    const plan = planStep(step);
    const last = plan.phases.at(-1)!;
    const short = MIN_STEP - plan.total;
    if (short > 0) step.phases.at(-1)!.actions.push(wait(last.end - last.start + short - busy(last)));
  }
  return viz;
};

function board(row0: string, row1: string): Scene {
  const items: Item[] = [
    { id: 'lab:gems', kind: 'text', rect: { x: 0, y: 32, w: 62, h: 54 }, tone: 'muted', text: '진열대' },
    { id: 'lab:p0', kind: 'text', rect: { x: 0, y: 96, w: 62, h: 22 }, tone: 'muted', text: row0 },
    { id: 'lab:p1', kind: 'text', rect: { x: 0, y: 122, w: 62, h: 22 }, tone: 'muted', text: row1 },
    { id: 'lab:kinds', kind: 'text', rect: { x: 0, y: 158, w: 62, h: 42 }, tone: 'muted', text: '보석 수' },
    { id: 'win', kind: 'zone', rect: winRect(0, 0), tone: 'explored' },
    { id: 'tok:best', kind: 'token', rect: { x: 412, y: 158, w: 132, h: 42 }, tone: 'plain', text: `최단 [1, ${N}]` },
    { id: 'calc', kind: 'text', rect: { x: 68, y: 210, w: 476, h: 28 }, text: '' },
  ];
  GEMS.forEach((g, i) => items.push({ id: gId(i), kind: 'cell', rect: gemAt(0, i), tone: 'plain', text: SHORT[g], sub: `${i + 1}번` }));
  KINDS.forEach((k, idx) => items.push({ id: kId(k), kind: 'cell', rect: kindSlot(idx), tone: 'plain', text: `${SHORT[k]} 0` }));
  return { width: W, height: H, items };
}

const movePtr = (rec: StepRecorder, id: 'l' | 'r', row: 0 | 1, idx: number, text: string): Action => {
  const rect = ptrRect(row, idx);
  const fullId = `ptr:${id}`;
  return rec.has(fullId)
    ? { type: 'set', id: fullId, patch: { rect, text } }
    : { type: 'add', item: { id: fullId, kind: 'token', rect, tone: 'chosen', text } };
};

const syncKinds = (counts: Map<string, number>): Action[] =>
  KINDS.map((k): Action => {
    const c = counts.get(k) ?? 0;
    return { type: 'set', id: kId(k), patch: { text: `${SHORT[k]} ${c}`, tone: c > 0 ? 'chosen' : 'plain' } };
  });

const paintGems = (l: number, r: number, activeTone: Tone): Action[] =>
  GEMS.map((_, i): Action => ({
    type: 'set',
    id: gId(i),
    patch: { tone: i >= l && i <= r ? activeTone : i < l ? 'visited' : 'plain' },
  }));

/* ------------------------------------------------------------------ */
/* 정석: 모든 종류를 담는 최소 구간 (투 포인터 + 해시 맵)                   */
/* ------------------------------------------------------------------ */

function twoPointer(): Visualization {
  const rec = new StepRecorder(board('left', 'right'));
  const counts = new Map<string, number>();
  let left = 0;
  let best: [number, number] = [1, N];
  let work = 0;
  const meta = (r: number | string) => ({
    work,
    variables: { left: left + 1, right: typeof r === 'number' ? r + 1 : r, kinds: `${counts.size}/${K}`, best: `[${best[0]}, ${best[1]}]` },
  });

  rec.step({ title: `전체 보석 종류: ${K}종류 (DIA, RUBY, EMER, SAPP)`, codeHighlights: TP_AT.init, ...meta('-') });
  rec.phase('종류 세기', `진열대 전체에 있는 보석 종류는 모두 ${K}가지입니다. ${K}종류를 모두 포함하는 가장 짧은 구간을 찾습니다.`, TP_AT.init);
  rec.do(...together([
    movePtr(rec, 'l', 0, 0, 'L=1'),
    movePtr(rec, 'r', 1, 0, 'R=1'),
    calcTo(`목표: ${K}종류 보석을 모두 담는 가장 짧은 구간`),
  ]));

  for (let right = 0; right < N; right++) {
    const gem = GEMS[right];
    counts.set(gem, (counts.get(gem) ?? 0) + 1);
    work += 1;
    const fullNow = counts.size === K;

    rec.step({
      title: `right = ${right + 1}번(${SHORT[gem]}) 담기 → ${counts.size}/${K}종류`,
      codeHighlights: fullNow ? TP_AT.checkFull : TP_AT.addRight,
      ...meta(right),
    });
    rec.phase(
      '오른쪽 늘리기',
      `${right + 1}번 진열대의 ${SHORT[gem]} 보석을 구간에 추가합니다. 현재 ${counts.size}종류가 모였습니다.`,
      TP_AT.addRight,
    );
    rec.do(...together([
      movePtr(rec, 'r', 1, right, `R=${right + 1}`),
      { type: 'set', id: 'win', patch: { rect: winRect(left, right) } },
      ...paintGems(left, right, fullNow ? 'good' : 'current'),
      ...syncKinds(counts),
      calcTo(`구간 [${left + 1}, ${right + 1}]: ${counts.size}/${K}종류`),
    ]));
    rec.do(
      { type: 'focus', ids: [gId(right), kId(gem)] },
      { type: 'arrow', from: gId(right), to: kId(gem), verdict: fullNow ? 'good' : 'new', label: `${SHORT[gem]} +1 (${counts.size}/${K}종류)` },
      wait(100),
      ...clear(),
    );

    while (counts.size === K) {
      const curL = left;
      const curGem = GEMS[curL];
      const curCount = counts.get(curGem)!;
      const shorter = right - curL < best[1] - best[0];
      if (shorter) best = [curL + 1, right + 1];

      if (curCount === 1) counts.delete(curGem);
      else counts.set(curGem, curCount - 1);
      left += 1;
      work += 1;
      const stillFull = counts.size === K;

      rec.step({
        title: `[${curL + 1}, ${right + 1}] 모든 종류 포함! left = ${curL + 1}번(${SHORT[curGem]}) 빼기`,
        codeHighlights: TP_AT.shrinkLeft,
        ...meta(right),
      });
      rec.phase(
        '최소 구간 확인',
        shorter
          ? `구간 [${curL + 1}, ${right + 1}](길이 ${right - curL + 1})에 ${K}종류가 모두 들어 있어 최단 구간을 [${best[0]}, ${best[1]}]로 갱신합니다.`
          : `구간 [${curL + 1}, ${right + 1}]에 ${K}종류가 모두 들어 있습니다.`,
        TP_AT.checkFull,
      );
      if (shorter) {
        rec.do({ type: 'set', id: 'tok:best', patch: { text: `최단 [${best[0]}, ${best[1]}]`, tone: 'good' }, pop: true });
      } else {
        rec.do(wait(240));
      }

      rec.phase(
        '왼쪽 줄이기',
        stillFull
          ? `${curL + 1}번의 ${SHORT[curGem]}는 구간에 ${curCount}개 있으므로 하나 빼도 여전히 ${K}종류가 유지됩니다!`
          : `${curL + 1}번의 ${SHORT[curGem]}가 마지막 1개여서 빼고 나면 ${counts.size}종류가 됩니다. 다시 오른쪽을 늘립니다.`,
        TP_AT.shrinkLeft,
      );
      rec.do(
        { type: 'focus', ids: [gId(curL), kId(curGem)] },
        { type: 'arrow', from: gId(curL), to: kId(curGem), verdict: stillFull ? 'good' : 'bad', label: `${SHORT[curGem]} ${curCount}→${curCount - 1}` },
        wait(100),
        ...clear(),
      );
      rec.do(...together([
        movePtr(rec, 'l', 0, left, `L=${left + 1}`),
        { type: 'set', id: 'win', patch: { rect: winRect(left, right) } },
        ...paintGems(left, right, stillFull ? 'good' : 'current'),
        ...syncKinds(counts),
        calcTo(`구간 [${left + 1}, ${right + 1}]: ${counts.size}/${K}종류`),
      ]));
    }
  }

  rec.step({
    title: `정답: 가장 짧은 구간 [${best[0]}, ${best[1]}]`,
    codeHighlights: TP_AT.done,
    ...meta(N - 1),
    answer: best,
    isKeyframe: true,
  });
  rec.phase(
    '정답',
    `진열대를 한 번만 훑어(확인 ${work}번) ${K}종류 보석을 모두 담은 최단 구간 [${best[0]}, ${best[1]}]을 찾았습니다.`,
    TP_AT.done,
  );
  rec.do(...together([
    movePtr(rec, 'l', 0, best[0] - 1, `L=${best[0]}`),
    movePtr(rec, 'r', 1, best[1] - 1, `R=${best[1]}`),
    { type: 'set', id: 'win', patch: { rect: winRect(best[0] - 1, best[1] - 1), tone: 'path' } },
    ...GEMS.map((_, i): Action => ({
      type: 'set',
      id: gId(i),
      patch: { tone: i >= best[0] - 1 && i <= best[1] - 1 ? 'path' : 'visited' },
    })),
    { type: 'set', id: 'tok:best', patch: { text: `정답 [${best[0]}, ${best[1]}]`, tone: 'path' }, pop: true },
    calcTo(`정답 구간 [${best[0]}, ${best[1]}] (길이 ${best[1] - best[0] + 1})`),
  ]));

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안: 길이 이분 탐색 + 슬라이딩 윈도우                                  */
/* ------------------------------------------------------------------ */

function binaryWindow(): Visualization {
  const rec = new StepRecorder(board('창 시작', '창 끝'));
  let [lo, hi] = [K, N];
  let best: [number, number] = [1, N];
  let work = 0;
  let midVal: number | string = '-';
  const meta = () => ({ work, variables: { lo, hi, mid: midVal, best: `[${best[0]}, ${best[1]}]` } });

  rec.step({ title: `구간 길이 범위 설정: lo = ${K}, hi = ${N}`, codeHighlights: BW_AT.init, ...meta() });
  rec.phase('범위 설정', `${K}종류를 모두 담으려면 최소 길이 ${K} 이상이어야 하므로, 길이 범위를 [${K}, ${N}]으로 두고 이분 탐색합니다.`, BW_AT.init);
  rec.do(...together([
    movePtr(rec, 'l', 0, 0, 'L=1'),
    movePtr(rec, 'r', 1, K - 1, `R=${K}`),
    calcTo(`길이 이분 탐색 범위: ${K} ~ ${N}`),
  ]));

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    midVal = mid;
    const counts = new Map<string, number>();
    let found: [number, number] | null = null;
    let lastEnd = mid - 1;
    for (let i = 0; i < N; i++) {
      counts.set(GEMS[i], (counts.get(GEMS[i]) ?? 0) + 1);
      work += 1;
      if (i >= mid) {
        const old = GEMS[i - mid];
        if (counts.get(old) === 1) counts.delete(old);
        else counts.set(old, counts.get(old)! - 1);
      }
      if (i >= mid - 1) {
        lastEnd = i;
        if (counts.size === K) {
          found = [i - mid + 2, i + 1];
          break;
        }
      }
    }
    const winL = lastEnd - mid + 1;
    const winR = lastEnd;
    if (found) {
      best = found;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }

    rec.step({
      title: `길이 mid = ${mid} 검사 → ${found ? `[${found[0]}, ${found[1]}] 가능 (hi=${hi})` : `불가능 (lo=${lo})`}`,
      codeHighlights: found ? BW_AT.hit : BW_AT.miss,
      ...meta(),
    });
    rec.phase(
      '창 밀어 보기',
      `길이 ${mid}짜리 창을 왼쪽부터 밀면서 ${K}종류가 모두 들어가는 구간이 있는지 확인합니다.`,
      BW_AT.pickMid,
    );
    rec.do(...together([
      movePtr(rec, 'l', 0, winL, `L=${winL + 1}`),
      movePtr(rec, 'r', 1, winR, `R=${winR + 1}`),
      { type: 'set', id: 'win', patch: { rect: winRect(winL, winR) } },
      ...paintGems(winL, winR, found ? 'good' : 'current'),
      ...syncKinds(counts),
      calcTo(`길이 ${mid} 검사: 구간 [${winL + 1}, ${winR + 1}] (${counts.size}/${K}종류)`),
    ]));

    rec.phase(
      '범위 줄이기',
      found
        ? `길이 ${mid}인 구간 [${found[0]}, ${found[1]}]에 모든 종류가 담깁니다! 더 짧은 길이도 가능한지 hi를 ${ro(hi)} 줄입니다.`
        : `길이 ${mid}로는 어느 구간도 ${K}종류를 모두 담지 못합니다. lo를 ${ro(lo)} 늘립니다.`,
      found ? BW_AT.hit : BW_AT.miss,
    );
    rec.do(
      { type: 'focus', ids: [gId(winL), gId(winR)] },
      { type: 'arrow', from: gId(winL), to: gId(winR), verdict: found ? 'good' : 'bad', label: found ? `길이 ${mid} 성공!` : `길이 ${mid} 실패` },
      ...(found ? [{ type: 'set', id: 'tok:best', patch: { text: `최단 [${best[0]}, ${best[1]}]`, tone: 'good' }, pop: true } as Action] : []),
      wait(100),
      ...clear(),
    );
  }

  rec.step({
    title: `정답: [${best[0]}, ${best[1]}] (보석 확인 ${work}번)`,
    codeHighlights: BW_AT.done,
    ...meta(),
    answer: best,
    isKeyframe: true,
  });
  rec.phase(
    '정답',
    `정석과 같은 [${best[0]}, ${best[1]}]을 찾았지만, 길이마다 처음부터 창을 다시 밀어 보석을 ${work}번(정석은 11번) 확인했습니다.`,
    BW_AT.done,
  );
  rec.do(...together([
    { type: 'set', id: 'win', patch: { rect: winRect(best[0] - 1, best[1] - 1), tone: 'path' } },
    ...GEMS.map((_, i): Action => ({
      type: 'set',
      id: gId(i),
      patch: { tone: i >= best[0] - 1 && i <= best[1] - 1 ? 'path' : 'visited' },
    })),
    { type: 'set', id: 'tok:best', patch: { text: `정답 [${best[0]}, ${best[1]}]`, tone: 'path' }, pop: true },
    calcTo(`정답 [${best[0]}, ${best[1]}] (O(N log N), 총 ${work}번 확인)`),
  ]));

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정: 시작점마다 끝점까지 다시 세기 (시간 초과)                          */
/* ------------------------------------------------------------------ */

function bruteForce(): Visualization {
  const rec = new StepRecorder(board('start', 'end'));
  let best: [number, number] = [1, N];
  let work = 0;
  let curStart: number | string = '-';
  let curEnd: number | string = '-';
  const meta = () => ({ work, variables: { start: curStart, end: curEnd, best: `[${best[0]}, ${best[1]}]` } });

  rec.step({ title: `초기화: 시작점 1번~${N}번마다 끝점 탐색`, codeHighlights: BRUTE_AT.init, ...meta() });
  rec.phase('시작', `모든 시작 진열대에서 출발해 ${K}종류가 다 모일 때까지 오른쪽으로 하나씩 세어 보면 얼마나 많은 작업이 드는지 확인합니다.`, BRUTE_AT.init);
  rec.do(...together([
    movePtr(rec, 'l', 0, 0, 'S=1'),
    movePtr(rec, 'r', 1, 0, 'E=1'),
    calcTo('시작점마다 처음부터 집합(Set)으로 다시 세기'),
  ]));

  for (let start = 0; start < N; start++) {
    const seen = new Map<string, number>();
    let end = start;
    for (let e = start; e < N; e++) {
      end = e;
      seen.set(GEMS[e], (seen.get(GEMS[e]) ?? 0) + 1);
      work += 1;
      if (seen.size === K) break;
    }
    const full = seen.size === K;
    const shorter = full && end - start < best[1] - best[0];
    if (shorter) best = [start + 1, end + 1];
    curStart = start + 1;
    curEnd = end + 1;
    const scanned = end - start + 1;

    rec.step({
      title: `시작 ${start + 1}번: ${end + 1}번까지 ${scanned}개 확인 → ${full ? `[${start + 1}, ${end + 1}] 완성` : '미완성'}`,
      codeHighlights: shorter ? BRUTE_AT.update : BRUTE_AT.innerLoop,
      ...meta(),
    });
    rec.phase(
      '시작점 정하기',
      `${start + 1}번 진열대에서 새로 집합을 비우고 오른쪽으로 하나씩 보석을 담습니다.`,
      BRUTE_AT.startLoop,
    );
    rec.do(...together([
      movePtr(rec, 'l', 0, start, `S=${start + 1}`),
      movePtr(rec, 'r', 1, end, `E=${end + 1}`),
      { type: 'set', id: 'win', patch: { rect: winRect(start, end) } },
      ...paintGems(start, end, full ? 'good' : 'current'),
      ...syncKinds(seen),
      calcTo(`시작 ${start + 1}번 → ${end + 1}번까지 ${scanned}칸 다시 확인 (누적 ${work}번)`),
    ]));

    rec.phase(
      '끝점까지 세기',
      full
        ? `${end + 1}번까지 ${scanned}칸을 확인해 ${K}종류를 모았습니다.${shorter ? ` 최단 구간을 [${best[0]}, ${best[1]}]로 갱신합니다.` : ' 이미 본 보석들을 또 처음부터 다시 셌습니다.'}`
        : `끝(${N}번)까지 ${scanned}칸을 다 보았지만 ${seen.size}종류뿐입니다.`,
      shorter ? BRUTE_AT.update : BRUTE_AT.innerLoop,
    );
    rec.do(
      { type: 'focus', ids: [gId(start), gId(end)] },
      { type: 'arrow', from: gId(start), to: gId(end), verdict: full ? 'good' : 'bad', label: `${scanned}개 확인 (${seen.size}/${K}종류)` },
      ...(shorter ? [{ type: 'set', id: 'tok:best', patch: { text: `최단 [${best[0]}, ${best[1]}]`, tone: 'good' }, pop: true } as Action] : []),
      wait(100),
      ...clear(),
    );
  }

  rec.step({
    title: `시간 초과 위험: 보석 ${work}번 확인 (정석은 11번)`,
    codeHighlights: BRUTE_AT.done,
    ...meta(),
    answer: best,
    isKeyframe: true,
  });
  rec.phase(
    '작업량 비교',
    `답은 [${best[0]}, ${best[1]}]로 같지만, 같은 구간을 반복해서 세느라 진열대를 ${work}번 확인했습니다(정석은 11번).`,
    BRUTE_AT.done,
  );
  rec.do(...together([
    { type: 'set', id: 'win', patch: { rect: winRect(best[0] - 1, best[1] - 1), tone: 'bad' } },
    { type: 'set', id: 'tok:best', patch: { text: `확인 ${work}번 vs 11번`, tone: 'bad' }, pop: true },
    calcTo(`N = 100,000이면 최대 약 5 × 10^9번 확인 → 효율성 시간 초과!`),
  ]));

  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제 정의                                                            */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'gem-shopping',
  title: '보석 쇼핑',
  level: 3,
  category: 'two-pointer',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/67258',
  description: {
    summary:
      '진열대에 나열된 보석 배열 gems에서 모든 종류의 보석을 적어도 1개 이상 포함하는 가장 짧은 연속 구간 [시작 번호, 끝 번호]를 구합니다. 가장 짧은 구간이 여러 개면 시작 진열대 번호가 가장 작은 구간을 반환합니다.',
    rules: [
      'gems 배열의 크기는 1 이상 100,000 이하',
      '각 원소는 길이 1 이상 10 이하의 알파벳 대문자 문자열',
      '진열대 번호는 1번부터 시작하며 [시작 번호, 끝 번호] 형태로 반환',
      '가장 짧은 구간이 여러 개이면 시작 번호가 가장 작은 구간을 반환',
    ],
    examples: [
      { input: 'gems = ["DIA", "RUBY", "RUBY", "DIA", "DIA", "EMERALD", "SAPPHIRE", "DIA"]', output: '[3, 7]' },
      { input: 'gems = ["AA", "AB", "AC", "AA", "AC"]', output: '[1, 3]' },
      { input: 'gems = ["XYZ", "XYZ", "XYZ"]', output: '[1, 1]' },
      { input: 'gems = ["ZZZ", "YYY", "NNNN", "YYY", "BBB"]', output: '[1, 5]' },
    ],
  },
  keyIntuitions: [
    '먼저 전체 보석 종류 수 K를 구한 뒤, 현재 구간 안에 들어 있는 보석별 개수를 해시 맵(사전)으로 관리합니다.',
    '사전의 키 개수가 K가 될 때까지 오른쪽 포인터를 늘리고, K개가 모인 동안에는 왼쪽 포인터를 줄이며 불필요한 중복 보석을 덜어냅니다.',
    '왼쪽과 오른쪽 포인터가 모두 앞으로만 전진하므로 진열대를 최대 두 번(2N번)만 훑고 O(N) 시간에 최단 구간을 찾습니다.',
  ],
  demo: {
    input: [GEMS],
    label: 'gems = ["DIA", "RUBY", "RUBY", "DIA", "DIA", "EMERALD", "SAPPHIRE", "DIA"]',
  },
  workUnit: '진열대 보석을 확인한 횟수',
  approaches: [
    {
      id: 'gem-shopping-two-pointer',
      name: '모든 종류를 담는 최소 구간 (투 포인터 + 해시 맵)',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(K)',
      verdict: '오른쪽으로 종류를 채우고 왼쪽으로 중복을 덜어내며 한 번에 최단 구간을 찾는 정석 풀이입니다.',
      pros: [
        '각 보석이 사전에 한 번 들어가고 최대 한 번 빠지므로 O(N) 시간에 끝납니다.',
        '보석 종류의 개수가 0이 될 때 사전에서 키를 지우면 `len(counts) == kind_count`를 O(1)에 판정할 수 있습니다.',
      ],
      cons: ['진열대 번호가 1번부터 시작하므로 반환할 때 인덱스에 +1을 해 주는 것을 잊지 말아야 합니다.'],
      whyThisRank:
        '이전 구간의 보석 개수 정보를 그대로 이어받아 포인터만 밀기 때문에 N = 100,000인 효율성 테스트도 여유 있게 통과합니다.',
      code: TWO_POINTER,
      visualize: twoPointer,
    },
    {
      id: 'gem-shopping-binary-window',
      name: '길이 이분 탐색 + 슬라이딩 윈도우',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(K)',
      verdict: '구간 길이를 이분 탐색하며 고정 길이 슬라이딩 윈도우로 확인하는 풀이로, 맞지만 진열대를 log N번 반복해서 훑습니다.',
      pros: [
        '길이 L로 모든 종류를 담을 수 있으면 L+1로도 담을 수 있다는 단조성을 활용해 이분 탐색으로 접근할 수 있습니다.',
        '고정 길이 윈도우만 구현하면 되어 가변 구간 포인터 제어가 낯설 때 떠올리기 좋습니다.',
      ],
      cons: [
        '길이 후보마다 배열 전체를 처음부터 다시 훑으므로 O(N log N) 시간이 걸려 투 포인터보다 느립니다.',
        '슬라이딩 윈도우 함수와 이분 탐색 루프를 함께 작성해야 해서 코드가 길어집니다.',
      ],
      whyThisRank:
        '정답은 구할 수 있지만, 가변 길이 투 포인터를 쓰면 이분 탐색 없이 단 한 번의 순회(O(N))로 바로 최소 길이를 찾을 수 있습니다.',
      code: BIN_WINDOW,
      visualize: binaryWindow,
    },
    {
      id: 'gem-shopping-brute-force',
      name: '모든 시작점에서 끝점까지 다시 세기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(K)',
      verdict: '시작 진열대마다 집합을 새로 만들어 끝점을 늘려 가면 겹치는 구간을 매번 다시 세어 효율성 테스트에서 시간 초과가 납니다.',
      pros: ['구현이 가장 단순하고 작은 예제에서는 올바른 답을 냅니다.'],
      cons: [
        'start가 한 칸 옮겨갈 때마다 이미 확인한 뒤쪽 보석들을 처음부터 다시 셉니다.',
        'N = 100,000일 때 최악 약 50억 번의 연산이 필요해 시간 제한 안에 끝나지 않습니다.',
      ],
      whyThisRank:
        'start를 한 칸 오른쪽으로 옮길 때 앞 보석 하나만 빼면 나머지 구간의 보석 개수는 그대로 재활용할 수 있다는 투 포인터의 핵심을 놓친 풀이입니다.',
      code: BRUTE,
      visualize: bruteForce,
    },
  ],
  checks: {
    cases: [
      { args: [['DIA', 'RUBY', 'RUBY', 'DIA', 'DIA', 'EMERALD', 'SAPPHIRE', 'DIA']], expected: [3, 7] },
      { args: [['AA', 'AB', 'AC', 'AA', 'AC']], expected: [1, 3] },
      { args: [['XYZ', 'XYZ', 'XYZ']], expected: [1, 1] },
      { args: [['ZZZ', 'YYY', 'NNNN', 'YYY', 'BBB']], expected: [1, 5] },
      { args: [['A']], expected: [1, 1] },
      { args: [['A', 'B', 'B', 'A', 'C']], expected: [3, 5] },
    ],
    random: (rand) => {
      const pool = ['A', 'B', 'C', 'D'];
      const k = 1 + Math.floor(rand() * 4);
      const len = k + Math.floor(rand() * 7);
      const gems = Array.from({ length: len }, () => pool[Math.floor(rand() * k)]);
      return [gems];
    },
  },
};

export default problem;
