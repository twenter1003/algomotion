// N-Queen: 정석 줄마다 퀸을 놓는 백트래킹, 대안 열 순열을 모두 만든 뒤 대각선 검사, 함정 대각선을 한 방향만 검사.
// 세 풀이는 4 × 4 체스판(칸 = 판의 칸, ♛ = 퀸, 빗금 칸 = 퀸이 공격하는 칸)과 오른쪽 계수기를 함께 쓴다.
import { around } from '../../engine/layout.ts';
import type { Action, Item, Problem, Rect, Scene, Tone, Verdict, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { josa, lines, together } from '../shared.ts';
import { clear, holdCaptions, ringTo, set, tone, wait } from './common.ts';

// 시각화 입력이자 점검 사례: 원문 예제 n = 4 (해 2개).
const N = 4;
interface Meta { work: number; variables: Record<string, string | number> }
const setText = (xs: number[]) => `{${xs.join(', ')}}`;
const listText = (cols: number[]) => `[${cols.join(', ')}]`;

// 줄 row에 열 col을 놓을 때 앞선 퀸 가운데 공격하는 퀸(같은 열 우선). 없으면 null
const attacker = (queens: number[], row: number, col: number): { row: number; kind: '열' | '대각' } | null => {
  for (let r = 0; r < Math.min(queens.length, row); r++) {
    if (queens[r] === col) return { row: r, kind: '열' };
    if (Math.abs(queens[r] - col) === row - r) return { row: r, kind: '대각' };
  }
  return null;
};

// 정석(백트래킹)이 일어나는 차례. 놓은 퀸마다, 놓을 칸이 없는 막다른 길마다 하나씩이고, 그 앞에서 건너뛴 칸을 함께 담는다.
interface Skip { col: number; by: { row: number; kind: '열' | '대각' } }
interface Ev { kind: 'place' | 'dead'; row: number; before: number[]; col: number; skips: Skip[]; carry: number; solved: boolean }
const EVENTS: Ev[] = [];
const SOLUTIONS: number[][] = [];
let TOTAL_CHECKS = 0;
{
  const queens: number[] = [];
  let carry = 0; // 줄의 반복을 마치며 한 확인(되돌아갈 때 함께 센다)
  const push = (ev: Omit<Ev, 'carry' | 'solved'>) => {
    EVENTS.push({ ...ev, carry, solved: false });
    TOTAL_CHECKS += carry + ev.skips.length + (ev.kind === 'place' ? 1 : 0);
    carry = 0;
  };
  const place = (row: number) => {
    if (row === N) {
      EVENTS.at(-1)!.solved = true;
      SOLUTIONS.push([...queens]);
      return;
    }
    let skips: Skip[] = [];
    let placed = false;
    for (let col = 0; col < N; col++) {
      const by = attacker(queens, row, col);
      if (by) {
        skips.push({ col, by });
        continue;
      }
      placed = true;
      push({ kind: 'place', row, before: [...queens], col, skips });
      skips = [];
      queens.push(col);
      place(row + 1);
      queens.pop();
    }
    if (!placed) push({ kind: 'dead', row, before: [...queens], col: -1, skips });
    else carry += skips.length;
  };
  place(0);
  TOTAL_CHECKS += carry;
}
const endOf = (ev: Ev) => (ev.kind === 'place' ? [...ev.before, ev.col] : ev.before);
const FINAL_CARRY = TOTAL_CHECKS - EVENTS.reduce((s, e) => s + e.carry + e.skips.length + (e.kind === 'place' ? 1 : 0), 0);

// 열 순열(줄마다 퀸 하나, 열은 겹치지 않음)을 사전 순서로. 대안과 함정이 쓴다.
const PERMS: number[][] = [];
{
  const build = (p: number[]) => {
    if (p.length === N) PERMS.push(p);
    else for (let c = 0; c < N; c++) if (!p.includes(c)) build([...p, c]);
  };
  build([]);
}
// 순서대로 줄 쌍(i, j)을 비교해 처음 겹치는 쌍을 찾는다. buggy면 ↘ 방향(cols[j] - cols[i] == j - i)만 본다.
interface Probe { pair?: [number, number]; compares: number }
const probe = (p: number[], buggy: boolean): Probe => {
  let compares = 0;
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      compares++;
      const d = p[j] - p[i];
      if (buggy ? d === j - i : Math.abs(d) === j - i) return { pair: [i, j], compares };
    }
  }
  return { compares };
};
const FULL_OK = PERMS.map((p) => !probe(p, false).pair);
const BUGGY_OK = PERMS.map((p) => !probe(p, true).pair);
const FULL_COUNT = FULL_OK.filter(Boolean).length;
const BUGGY_COUNT = BUGGY_OK.filter(Boolean).length;
const FULL_COMPARES = PERMS.reduce((s, p) => s + probe(p, false).compares, 0);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const BEST = {
  python: `def solution(n):
    count = 0
    cols, diag1, diag2 = set(), set(), set()  # 퀸이 차지한 열, ↘ 대각선(줄 - 열), ↙ 대각선(줄 + 열)

    def place(row):
        nonlocal count
        if row == n:
            count += 1  # n줄을 모두 채웠으니 방법 하나를 찾았습니다
            return
        for col in range(n):
            if col in cols or row - col in diag1 or row + col in diag2:
                continue  # 열이나 대각선이 겹치면 이 칸은 건너뜁니다
            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            place(row + 1)
            cols.remove(col)  # 되돌아와서 같은 줄의 다음 열을 시도합니다
            diag1.remove(row - col)
            diag2.remove(row + col)

    place(0)
    return count`,
  javascript: `function solution(n) {
  let count = 0;
  const cols = new Set(), diag1 = new Set(), diag2 = new Set(); // 퀸이 차지한 열, ↘ 대각선(줄 - 열), ↙ 대각선(줄 + 열)

  const place = (row) => {
    if (row === n) {
      count++; // n줄을 모두 채웠으니 방법 하나를 찾았습니다
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue; // 열이나 대각선이 겹치면 이 칸은 건너뜁니다
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);
      place(row + 1);
      cols.delete(col); // 되돌아와서 같은 줄의 다음 열을 시도합니다
      diag1.delete(row - col);
      diag2.delete(row + col);
    }
  };

  place(0);
  return count;
}`,
};
const BT = {
  start: lines(BEST, ['count = 0', 'cols, diag1, diag2 = set()', 'place(0)'], ['let count = 0', 'const cols = new Set()', 'place(0)']),
  check: lines(BEST, ['for col in range(n):', 'if col in cols or row - col in diag1'], ['for (let col = 0; col < n; col++)', 'if (cols.has(col) || diag1.has(row - col)']),
  skip: lines(BEST, ['for col in range(n):', 'if col in cols or row - col in diag1', 'continue'], ['for (let col = 0; col < n; col++)', 'if (cols.has(col) || diag1.has(row - col)']),
  put: lines(BEST, ['cols.add(col)', 'diag1.add(row - col)', 'diag2.add(row + col)', 'place(row + 1)'], ['cols.add(col)', 'diag1.add(row - col)', 'diag2.add(row + col)', 'place(row + 1)']),
  found: lines(BEST, ['cols.add(col)', 'place(row + 1)', 'if row == n:', 'count += 1'], ['cols.add(col)', 'place(row + 1)', 'if (row === n)', 'count++']),
  dead: lines(BEST, ['for col in range(n):', 'continue'], ['for (let col = 0; col < n; col++)', 'continue']),
  back: lines(BEST, ['cols.remove(col)', 'diag1.remove(row - col)', 'diag2.remove(row + col)'], ['cols.delete(col)', 'diag1.delete(row - col)', 'diag2.delete(row + col)']),
  done: lines(BEST, ['place(0)', 'return count'], ['place(0)', 'return count']),
};

const PERM_CODE = {
  python: `from itertools import permutations

def solution(n):
    count = 0
    for cols in permutations(range(n)):  # 줄마다 퀸 하나, 열은 겹치지 않는 모든 배치
        # 다 놓은 뒤에야 줄 i, j의 퀸이 대각선에 놓였는지 검사합니다
        if all(abs(cols[i] - cols[j]) != j - i for i in range(n) for j in range(i + 1, n)):
            count += 1
    return count`,
  javascript: `function solution(n) {
  let count = 0;
  // 줄마다 퀸 하나, 열은 겹치지 않는 모든 배치를 만듭니다
  const build = (cols) => {
    if (cols.length === n) {
      // 다 놓은 뒤에야 줄 i, j의 퀸이 대각선에 놓였는지 검사합니다
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(cols[i] - cols[j]) === j - i) return;
        }
      }
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (!cols.includes(c)) build([...cols, c]);
    }
  };

  build([]);
  return count;
}`,
};
const PM_AT = {
  start: lines(PERM_CODE, ['count = 0', 'for cols in permutations(range(n))'], ['let count = 0', 'build([])']),
  make: lines(PERM_CODE, ['for cols in permutations(range(n))'], ['const build = (cols) => {', 'if (!cols.includes(c)) build([...cols, c])']),
  test: lines(PERM_CODE, ['if all(abs(cols[i] - cols[j]) != j - i'], ['for (let i = 0; i < n; i++)', 'if (Math.abs(cols[i] - cols[j]) === j - i) return']),
  hit: lines(PERM_CODE, ['if all(abs(cols[i] - cols[j]) != j - i'], ['if (Math.abs(cols[i] - cols[j]) === j - i) return']),
  pass: lines(PERM_CODE, ['if all(abs(cols[i] - cols[j]) != j - i', 'count += 1'], ['if (Math.abs(cols[i] - cols[j]) === j - i) return', 'count++']),
  done: lines(PERM_CODE, ['return count'], ['build([])', 'return count']),
};

const ONE_SIDE = {
  python: `from itertools import permutations

# 주의: ↘ 대각선만 검사하고 ↙ 대각선을 빠뜨린 오답 풀이입니다
def solution(n):
    count = 0
    for cols in permutations(range(n)):  # 줄마다 퀸 하나, 열은 겹치지 않는 모든 배치
        if all(cols[j] - cols[i] != j - i for i in range(n) for j in range(i + 1, n)):  # ↘ 방향만 봅니다
            count += 1
    return count`,
  javascript: `// 주의: ↘ 대각선만 검사하고 ↙ 대각선을 빠뜨린 오답 풀이입니다
function solution(n) {
  let count = 0;
  // 줄마다 퀸 하나, 열은 겹치지 않는 모든 배치를 만듭니다
  const build = (cols) => {
    if (cols.length === n) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (cols[j] - cols[i] === j - i) return; // ↘ 방향만 봅니다
        }
      }
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (!cols.includes(c)) build([...cols, c]);
    }
  };

  build([]);
  return count;
}`,
};
const OS_AT = {
  start: lines(ONE_SIDE, ['count = 0', 'for cols in permutations(range(n))'], ['let count = 0', 'build([])']),
  make: lines(ONE_SIDE, ['for cols in permutations(range(n))'], ['const build = (cols) => {', 'if (!cols.includes(c)) build([...cols, c])']),
  test: lines(ONE_SIDE, ['if all(cols[j] - cols[i] != j - i'], ['for (let i = 0; i < n; i++)', 'if (cols[j] - cols[i] === j - i) return']),
  hit: lines(ONE_SIDE, ['if all(cols[j] - cols[i] != j - i'], ['if (cols[j] - cols[i] === j - i) return']),
  pass: lines(ONE_SIDE, ['if all(cols[j] - cols[i] != j - i', 'count += 1'], ['if (cols[j] - cols[i] === j - i) return', 'count++']),
  done: lines(ONE_SIDE, ['return count'], ['build([])', 'return count']),
};

/* ------------------------------------------------------------------ */
/* 장면: 왼쪽 체스판, 오른쪽 계수기와 찾은 해, 아래 계산 글                    */
/* ------------------------------------------------------------------ */

// 가로: 줄 이름 2~30, 판 34~268(칸 54px, 간격 6px), 계수기 282~410. 세로: 안내 글 0~16, 열 이름 19~33, 판 36~270, 계산 글 280~306.
const W = 420;
const H = 316;
const cellId = (r: number, c: number) => `b:${r}:${c}`;
const cellRect = (r: number, c: number): Rect => ({ x: 34 + c * 60, y: 36 + r * 60, w: 54, h: 54 });
const rowRing = (r: number): Rect => around({ x: 34, y: 36 + r * 60, w: 234, h: 54 }, 4);
const tokenAt = (id: string, y: number, text: string, t: Tone): Item => ({ id, kind: 'token', rect: { x: 282, y, w: 128, h: 30 }, tone: t, text });
const solRect = (k: number): Rect => ({ x: 282, y: 164 + k * 24, w: 128, h: 22 });

function board(title: string, countText: string): Scene {
  const items: Item[] = [{ id: 'title', kind: 'text', rect: { x: 12, y: 0, w: 396, h: 16 }, tone: 'muted', text: title }];
  for (let k = 0; k < N; k++) {
    items.push({ id: `cl:${k}`, kind: 'text', rect: { x: 34 + k * 60, y: 19, w: 54, h: 14 }, tone: 'muted', text: `열 ${k}` });
    items.push({ id: `rl:${k}`, kind: 'text', rect: { x: 2, y: 36 + k * 60, w: 30, h: 54 }, tone: 'muted', text: `${k}줄` });
    for (let c = 0; c < N; c++) items.push({ id: cellId(k, c), kind: 'cell', rect: cellRect(k, c), tone: 'plain', text: '' });
  }
  items.push(
    tokenAt('t:count', 40, countText, 'chosen'),
    tokenAt('t:state', 80, '시작 전', 'plain'),
    tokenAt('t:tries', 120, '확인 0번', 'plain'),
    { id: 'calc', kind: 'text', rect: { x: 12, y: 280, w: 396, h: 26 }, text: '' },
  );
  return { width: W, height: H, items };
}
const calcTo = (text: string) => set('calc', { text });
// 판의 칸이 있어야 할 모습: 놓인 퀸(초록 ♛), 아랫줄에서 퀸이 공격하는 칸(빗금), 후보 칸(파란 점선 ?)
const cellState = (queens: number[], r: number, c: number, cand?: [number, number]): { tone: Tone; text: string } => {
  if (cand && cand[0] === r && cand[1] === c) return { tone: 'queued', text: '?' };
  if (r < queens.length) return queens[r] === c ? { tone: 'visited', text: '♛' } : { tone: 'plain', text: '' };
  return attacker(queens, r, c) ? { tone: 'wall', text: '' } : { tone: 'plain', text: '' };
};
// 장면의 칸을 queens 모습으로 맞추는 동작(달라진 칸만). pop은 막 놓은 퀸
const boardTo = (rec: StepRecorder, queens: number[], cand?: [number, number], pop?: [number, number]): Action[] =>
  [...Array(N).keys()].flatMap((r) => [...Array(N).keys()].flatMap((c) => {
    const want = cellState(queens, r, c, cand);
    const have = rec.get(cellId(r, c));
    if (have.tone === want.tone && (have.text ?? '') === want.text) return [];
    return [set(cellId(r, c), want, !!pop && pop[0] === r && pop[1] === c)];
  }));
const solText = (k: number, cols: number[]): Item => ({ id: `sol:${k}`, kind: 'text', rect: solRect(k), text: `방법 ${k + 1}: ${cols.join(' ')}` });

/* ------------------------------------------------------------------ */
/* 정석: (되돌아가기) → 확인하기 → 놓기(또는 쳐내기)                          */
/* ------------------------------------------------------------------ */

function backtracking(): Visualization {
  const rec = new StepRecorder(board(`${N} × ${N} 판에 퀸 ${N}개 · 빗금 칸은 퀸이 공격하는 칸`, '찾은 방법 0개'));
  let queens: number[] = [];
  let count = 0;
  let checks = 0;
  const meta = (): Meta => ({
    work: checks,
    variables: {
      row: queens.length,
      cols: setText(queens),
      diag1: setText(queens.map((c, r) => r - c)),
      diag2: setText(queens.map((c, r) => r + c)),
      count,
    },
  });

  rec.step({ title: 'place(0)에서 시작', codeHighlights: BT.start, ...meta() });
  rec.phase('시작', `${N} × ${N} 판에 퀸 ${N}개를 서로 공격하지 못하게 놓는 방법을 셉니다. 윗줄부터 한 줄에 하나씩 놓고, 같은 열이나 대각선에 퀸이 있는 칸은 건너뜁니다. 놓을 칸이 없으면 윗줄 퀸을 옮깁니다.`, BT.start);
  rec.do(ringTo(rec, rowRing(0)), set('t:state', { text: '0줄 놓는 중' }, true));

  EVENTS.forEach((ev, k) => {
    const prevEnd = k ? endOf(EVENTS[k - 1]) : [];
    const undone = prevEnd.length - ev.before.length;
    const end = endOf(ev);
    const place = ev.kind === 'place';
    const row = ev.row;
    checks += ev.carry + ev.skips.length + (place ? 1 : 0);
    queens = end;
    if (ev.solved) count++;

    rec.step({
      title: place ? `${row}줄 ${ev.col}열에 퀸${ev.solved ? ` · ${count}번째 방법` : ''}` : `${row}줄: 놓을 칸 없음 (막다른 길)`,
      codeHighlights: place ? (ev.solved ? BT.found : BT.put) : BT.dead,
      ...meta(),
    });
    if (undone > 0) {
      rec.phase('되돌아가기', `퀸 ${undone}개를 지우고 ${row}줄로 돌아갑니다. 지운 퀸의 열과 대각선 기록도 함께 지우고, 같은 줄의 다음 열을 봅니다.`, BT.back);
      rec.do(...together([...boardTo(rec, ev.before), ringTo(rec, rowRing(row)), set('t:state', { text: `${row}줄 놓는 중`, tone: 'plain' }), set('t:tries', { text: `확인 ${checks - ev.skips.length - (place ? 1 : 0)}번` })]));
    }

    const why = ev.skips.map((s) => `${s.col}열은 ${s.by.kind === '열' ? '같은 열' : '대각선'}`).join(', ');
    const target = place ? [row, ev.col] as [number, number] : undefined;
    rec.phase('확인하기', place
      ? (ev.skips.length ? `${row}줄: ${why}이라 건너뛰고, ${ev.col}열은 안전합니다.` : row ? `${row}줄: ${ev.col}열은 앞의 퀸과 열도 대각선도 겹치지 않아 안전합니다.` : `0줄: 아직 놓은 퀸이 없어 ${ev.col}열이 안전합니다.`)
      : `${row}줄: ${why}이라 건너뜁니다. ${N}칸이 모두 막혔습니다.`, ev.skips.length ? BT.skip : BT.check);
    const attackers = [...new Set(ev.skips.map((s) => cellId(s.by.row, ev.before[s.by.row])))];
    rec.do({ type: 'focus', ids: [...ev.skips.map((s) => cellId(row, s.col)), ...(target ? [cellId(row, ev.col)] : []), ...attackers] });
    if (ev.skips.length) {
      rec.do(...together(ev.skips.map((s): Action => ({ type: 'arrow', from: cellId(s.by.row, ev.before[s.by.row]), to: cellId(row, s.col), verdict: 'bad' as Verdict, label: s.by.kind }))));
    }
    if (target) rec.do(set(cellId(row, ev.col), { tone: 'queued', text: '?' }));
    rec.do(wait(150));

    if (place) {
      rec.phase('놓기', `${row}줄 ${ev.col}열에 퀸을 놓고, 열 ${josa(ev.col, '과', '와')} 대각선 ${row - ev.col}, ${josa(row + ev.col, '을', '를')} 기록합니다. ${ev.solved ? `${N}줄을 모두 채웠습니다! ${count}번째 방법을 찾았습니다.` : `${end.length}줄로 내려갑니다.`}`, ev.solved ? BT.found : BT.put);
      rec.do(...clear());
      rec.do(...together([
        ...boardTo(rec, end, undefined, [row, ev.col]),
        ...(ev.solved ? [] : [ringTo(rec, rowRing(end.length))]),
        calcTo(`열 ${ev.col} · ↘ ${row - ev.col} · ↙ ${row + ev.col}`),
      ]));
      rec.do(...together([
        set('t:tries', { text: `확인 ${checks}번` }, true),
        set('t:state', { text: ev.solved ? '방법 찾음!' : `${end.length}줄 놓는 중`, tone: ev.solved ? 'good' : 'plain' }, true),
        ...(ev.solved ? [set('t:count', { text: `찾은 방법 ${count}개` }, true), { type: 'add', item: solText(count - 1, end) } as Action] : []),
      ]));
    } else {
      rec.phase('쳐내기', '놓을 칸이 없는 막다른 길입니다. 이 가지는 여기서 쳐내고, 윗줄 퀸을 다른 열로 옮기러 돌아갑니다.', BT.dead);
      rec.do(...clear());
      rec.do(...together([set('t:state', { text: '막다른 길', tone: 'bad' }, true), set('t:tries', { text: `확인 ${checks}번` }, true), calcTo(`${row}줄은 놓을 칸이 없음`)]));
    }
  });

  const undoneAll = (EVENTS.length ? endOf(EVENTS.at(-1)!) : []).length;
  checks += FINAL_CARRY;
  queens = [];
  rec.step({ title: `방법 ${count}개`, codeHighlights: BT.done, ...meta(), answer: count, isKeyframe: true });
  rec.phase('결과', `퀸 ${undoneAll}개를 지우고 처음으로 돌아와 모든 경우를 살폈습니다. 놓는 방법은 모두 ${count}개이고, 막다른 길을 일찍 쳐내서 칸을 ${checks}번만 확인했습니다.`, BT.done);
  rec.do(...together([...boardTo(rec, []), { type: 'remove', id: 'ring' } as Action, set('t:count', { tone: 'path' }, true), set('t:tries', { text: `확인 ${checks}번` }, true), set('t:state', { text: '끝', tone: 'plain' }), calcTo(`답: ${count}`)]));
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 · 함정: 배치하기 → 검사하기, 비슷한 배치는 빨리 감기                    */
/* ------------------------------------------------------------------ */

function permutations(buggy: boolean): Visualization {
  const OK = buggy ? BUGGY_OK : FULL_OK;
  const AT = buggy ? OS_AT : PM_AT;
  const falseAt = PERMS.findIndex((p, i) => OK[i] && !!probe(p, false).pair); // 처음으로 잘못 통과하는 배치(함정만)
  // 하나씩 보여 줄 배치: 맨 처음, 통과하는 배치(함정은 처음 잘못 통과하는 배치까지). 나머지는 묶어서 빨리 감는다
  const shown = new Set<number>([0, ...PERMS.flatMap((_, i) => (OK[i] && (!buggy || falseAt < 0 || i <= falseAt) ? [i] : []))]);
  const rec = new StepRecorder(board(buggy ? '↘ 대각선만 검사합니다 (↙ 대각선은 보지 않음)' : '열이 겹치지 않는 배치를 모두 만든 뒤 대각선을 검사합니다', buggy ? '해로 센 배치 0개' : '찾은 방법 0개'));
  let cur: number[] | undefined;
  let done = 0; // 지금까지 검사한 배치 수
  let found = 0;
  let compares = 0;
  const meta = (): Meta => ({ work: compares, variables: { cols: cur ? listText(cur) : '-', count: found } });
  const countText = (n: number) => (buggy ? `해로 센 배치 ${n}개` : `찾은 방법 ${n}개`);

  rec.step({ title: `열 배치 ${PERMS.length}가지 만들기`, codeHighlights: AT.start, ...meta() });
  rec.phase('시작', buggy
    ? `줄마다 퀸 하나를 놓는 열 배치는 ${N}! = ${PERMS.length}가지입니다. 이번에는 ↘ 대각선(줄 − 열이 같은 쪽)만 검사하고 ↙ 대각선은 빠뜨립니다.`
    : `줄마다 퀸 하나를 놓는 열 배치는 ${N}! = ${PERMS.length}가지입니다. 이 배치를 모두 만들어 하나씩 대각선이 겹치는지 검사합니다.`, AT.make);
  rec.do(set('t:state', { text: `배치 0 / ${PERMS.length}` }, true), wait(300));

  let i = 0;
  while (i < PERMS.length) {
    if (shown.has(i)) {
      const p = PERMS[i];
      const pr = probe(p, buggy);
      const real = probe(p, false);
      const ok = OK[i];
      const falsePass = ok && !!real.pair;
      cur = p;
      done = i + 1;
      compares += pr.compares;
      if (ok) found++;
      rec.step({
        title: `${listText(p)}: ${ok ? (falsePass ? '통과 (잘못!)' : buggy ? '통과, 해로 셈' : '통과, 방법') : '겹침, 탈락'}`,
        codeHighlights: ok ? AT.pass : AT.hit,
        ...meta(),
      });
      rec.phase('배치하기', `${i + 1}번째 배치 ${listText(p)}: ${p.map((c, r) => `${r}줄 ${c}열`).join(', ')}에 퀸을 놓습니다.`, AT.make);
      const queens = (t: Tone): Action[] => [...Array(N).keys()].flatMap((r) => [...Array(N).keys()].map((c): Action => set(cellId(r, c), p[r] === c ? { tone: t, text: '♛' } : { tone: 'plain', text: '' }, p[r] === c)));
      rec.do(...together([...queens('queued'), set('t:state', { text: `배치 ${done} / ${PERMS.length}` }, true), calcTo(`열 배치 ${listText(p)}`)]));

      const qid = (r: number) => cellId(r, p[r]);
      if (pr.pair) {
        const [a, b] = pr.pair;
        rec.phase('검사하기', `줄 ${a}와 줄 ${b}를 비교하면 열 차이 |${p[a]} − ${p[b]}|가 줄 차이 ${b - a}와 같아 대각선에서 만납니다. 겹쳐서 탈락합니다.`, AT.hit);
        rec.do({ type: 'focus', ids: [qid(a), qid(b)] });
        rec.do({ type: 'arrow', from: qid(a), to: qid(b), verdict: 'bad', label: '대각' }, wait(200));
        rec.do(...together([...clear(), ...p.map((_, r) => tone(qid(r), r === a || r === b ? 'bad' : 'explored')), set('t:tries', { text: `비교 ${compares}번` }, true)]));
      } else {
        const hidden = real.pair; // 함정이 놓친 겹침
        rec.phase('검사하기', hidden
          ? `↘ 대각선 비교를 끝까지 해도 겹치지 않아 통과시킵니다. 하지만 줄 ${hidden[0]}와 줄 ${hidden[1]}의 퀸은 ↙ 대각선에서 서로 공격합니다. 코드는 이를 보지 못합니다.`
          : `모든 줄 쌍을 비교해도 대각선이 겹치지 않습니다. 통과해서 방법으로 셉니다. (${pr.compares}번 비교)`, AT.pass);
        rec.do({ type: 'focus', ids: [0, 1, 2, 3].map(qid) });
        rec.do(hidden
          ? { type: 'arrow', from: qid(hidden[0]), to: qid(hidden[1]), verdict: 'bad', label: '놓침' }
          : { type: 'arrow', from: qid(0), to: qid(N - 1), verdict: 'good', label: '충돌 없음' }, wait(200));
        rec.do(...together([
          ...clear(),
          ...p.map((_, r) => tone(qid(r), hidden?.includes(r) ? 'bad' : 'visited')),
          set('t:count', { text: countText(found) }, true),
          set('t:tries', { text: `비교 ${compares}번` }, true),
        ]));
      }
      i++;
      continue;
    }
    // 빨리 감기: 다음 보여 줄 배치 앞까지 한 단계로 묶는다
    let to = i;
    while (to + 1 < PERMS.length && !shown.has(to + 1)) to++;
    const seg = PERMS.slice(i, to + 1);
    const segOk = OK.slice(i, to + 1).filter(Boolean).length;
    const segCompares = seg.reduce((s, p) => s + probe(p, buggy).compares, 0);
    cur = PERMS[to];
    done = to + 1;
    compares += segCompares;
    found += segOk;
    rec.step({ title: `배치 ${i + 1}~${to + 1}번째 빨리 감기`, codeHighlights: AT.test, ...meta() });
    rec.phase('빨리 감기', `배치 ${i + 1}번째부터 ${to + 1}번째까지 ${seg.length}가지도 같은 방식으로 검사합니다. ${segOk ? `${seg.length}가지 중 ${segOk}가지가 통과해 ${buggy ? '해로 셉니다' : '방법이 늘어납니다'}.` : `모두 대각선이 겹쳐 탈락합니다.`} 비교는 ${segCompares}번입니다.`, AT.test);
    rec.do(...together([
      ...[...Array(N).keys()].flatMap((r) => [...Array(N).keys()].map((c) => set(cellId(r, c), { tone: 'plain', text: '' }))),
      set('t:state', { text: `배치 ${done} / ${PERMS.length}` }, true),
      set('t:count', { text: countText(found) }, true),
      set('t:tries', { text: `비교 ${compares}번` }, true),
      calcTo(`배치 ${i + 1}~${to + 1}번째: ${seg.length}가지 중 ${segOk}가지 통과`),
    ]));
    i = to + 1;
  }

  cur = undefined;
  rec.step({
    title: buggy ? `${found}개로 셈 — 정답은 ${FULL_COUNT}개` : `방법 ${found}개`,
    codeHighlights: AT.done,
    ...meta(),
    answer: found,
    isKeyframe: true,
  });
  rec.phase(buggy ? '비교하기' : '결과', buggy
    ? `${found}개라고 답하지만 정답은 ${FULL_COUNT}개입니다. ↙ 대각선으로 서로 공격하는 배치를 ${found - FULL_COUNT}개 더 통과시켰습니다. 대각선은 (줄 − 열)과 (줄 + 열) 두 방향 모두 검사해야 합니다.`
    : `배치 ${PERMS.length}가지를 모두 검사해 방법은 ${found}개입니다. 정답은 같지만 앞 두 줄부터 겹쳐도 끝까지 놓은 뒤에 검사해서 비교를 ${compares}번이나 했습니다. 정석은 ${TOTAL_CHECKS}번이면 됩니다.`, AT.done);
  rec.do(...together([
    ...[...Array(N).keys()].flatMap((r) => [...Array(N).keys()].map((c) => set(cellId(r, c), { tone: 'plain', text: '' }))),
    set('t:count', { tone: buggy ? 'bad' : 'path' }, true),
    set('calc', { text: buggy ? `내 답 ${found}개 ≠ 정답 ${FULL_COUNT}개` : `답: ${found}` }),
  ]));
  if (buggy) rec.do({ type: 'add', item: { id: 't:truth', kind: 'token', rect: { x: 282, y: 160, w: 128, h: 30 }, tone: 'good', text: `정답 ${FULL_COUNT}개` } });
  return holdCaptions(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'n-queen',
  title: 'N-Queen',
  level: 2,
  category: 'brute-force',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12952',
  description: {
    summary:
      '가로, 세로 길이가 n인 정사각형 체스판에 퀸 n개를 놓으려고 합니다. 퀸은 가로, 세로, 대각선으로 움직일 수 있어서, 어느 두 퀸도 서로 공격하지 못하게 놓아야 합니다. n이 주어질 때 퀸을 놓는 방법이 모두 몇 가지인지 구합니다.',
    rules: ['퀸은 가로, 세로, 대각선으로 이동할 수 있음', 'n은 12 이하의 자연수'],
    examples: [{ input: 'n = 4', output: '2' }],
  },
  keyIntuitions: [
    '줄마다 퀸이 정확히 하나씩 있어야 하니, 윗줄부터 한 줄에 하나씩 놓습니다. 놓을 칸은 앞서 놓은 퀸과 같은 열이나 같은 대각선이 아니어야 합니다.',
    '대각선은 숫자 두 개로 구분합니다. ↘ 방향은 (줄 − 열)이 같고, ↙ 방향은 (줄 + 열)이 같습니다. 열과 두 대각선을 집합에 적어 두면 겹침을 한 번에 확인합니다.',
    '놓을 칸이 없는 막다른 길을 만나면 윗줄 퀸을 지우고 다른 열을 시도합니다(백트래킹). 모든 배치를 만든 뒤 검사하는 것보다 확인할 칸이 훨씬 적습니다.',
  ],
  demo: { input: [N], label: 'n = 4' },
  workUnit: '충돌을 확인한 횟수',
  approaches: [
    {
      id: 'queen-backtracking',
      name: '줄마다 퀸을 놓는 백트래킹',
      rank: 'BEST',
      timeComplexity: 'O(n!)',
      spaceComplexity: 'O(n)',
      verdict: '윗줄부터 한 줄에 퀸 하나씩 놓고, 열이나 대각선이 겹치면 그 칸을 건너뛰며, 막다른 길에서는 윗줄 퀸을 옮깁니다.',
      pros: [
        '겹치는 칸은 놓기 전에 걸러서 쓸모없는 배치를 아예 만들지 않습니다.',
        '열과 두 대각선을 집합에 적어 두면 겹침 검사가 한 번에 끝납니다.',
        'n = 12도 모든 방법을 세는 데 충분히 빠릅니다.',
      ],
      cons: [
        '놓고 지우는 코드(add와 remove)를 빠뜨리면 이전 배치가 남아 틀립니다.',
        '대각선을 (줄 − 열), (줄 + 열)로 나타내는 요령을 알아야 합니다.',
      ],
      whyThisRank: '막다른 길을 일찍 버려서 확인할 칸이 가장 적고 코드도 짧습니다. 백트래킹을 배우는 대표 문제이기도 합니다.',
      code: BEST,
      visualize: backtracking,
    },
    {
      id: 'queen-permutations',
      name: '열 순열을 모두 만든 뒤 대각선 검사',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(n² × n!)',
      spaceComplexity: 'O(n)',
      verdict: '줄마다 열이 겹치지 않는 배치(순열)를 전부 만든 뒤, 하나씩 대각선이 겹치는지 검사해 세는 풀이입니다.',
      pros: [
        '줄과 열 겹침은 순열이라 저절로 피하고, 대각선만 검사하면 되어 개념이 단순합니다.',
        '파이썬에서는 itertools.permutations로 짧게 쓸 수 있습니다.',
      ],
      cons: [
        '앞 두 줄부터 대각선이 겹쳐도 끝까지 놓은 뒤에야 검사합니다.',
        'n이 12면 479,001,600가지를 검사해야 해서 시간 초과가 날 수 있습니다.',
      ],
      whyThisRank: `답은 정석과 같지만 가지치기가 없습니다. n = 4에서 정석은 ${TOTAL_CHECKS}번 확인하면 되는데 이 풀이는 배치 ${PERMS.length}가지를 모두 검사해 ${FULL_COMPARES}번 비교합니다. n이 커질수록 차이가 폭발합니다.`,
      code: PERM_CODE,
      visualize: () => permutations(false),
    },
    {
      id: 'queen-one-diagonal',
      name: '대각선을 한 방향만 검사',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(n² × n!)',
      spaceComplexity: 'O(n)',
      verdict: '↘ 대각선만 검사하고 ↙ 대각선을 빠뜨려, 서로 공격하는 배치까지 해로 세는 오답 풀이입니다.',
      pros: ['코드 모양이 대안과 거의 같아 그럴듯해 보입니다.'],
      cons: [
        `n = 4에서 해를 ${BUGGY_COUNT}개로 세지만 정답은 ${FULL_COUNT}개입니다. 퀸이 ↙ 방향으로 마주 보는 배치를 통과시킵니다.`,
        'n = 1처럼 대각선이 아예 없는 입력은 맞아서 틀린 줄 알아채기 어렵습니다.',
      ],
      whyThisRank: '대각선은 두 방향입니다. (줄 − 열)이 같은 ↘ 방향만 보면 (줄 + 열)이 같은 ↙ 방향으로 공격하는 퀸을 놓칩니다. 두 방향을 모두 검사해야 합니다.',
      code: ONE_SIDE,
      visualize: () => permutations(true),
    },
  ],
  checks: {
    cases: [
      { args: [4], expected: 2 },
      { args: [1], expected: 1 },
      { args: [2], expected: 0 },
      { args: [3], expected: 0 },
      { args: [5], expected: 10 },
      { args: [6], expected: 4 },
      { args: [7], expected: 40 },
      { args: [8], expected: 92 },
    ],
    // n은 1~6
    random: (rand) => [1 + Math.floor(rand() * 6)],
  },
};

export default problem;
