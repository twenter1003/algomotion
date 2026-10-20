// 2 x n 타일링: 정석 앞의 두 가로 길이를 더하는 표 채우기, 대안 변수 두 개 굴리기, 함정 타일을 놓아 보며 모든 방법 세기를 움직인다.
// 정석·대안은 칸 줄(가로 길이 i의 방법 수), 정석은 그 아래에 '맨 끝을 덮는 두 경우' 그림이 더해진다. 함정은 2 × 6 바닥에 타일이 놓이고 되돌려진다.
import type { Action, Item, ItemPatch, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { josa, lines, ro, together } from '../shared.ts';

const MOD = 1_000_000_007;
const N = 6; // 시각화 입력: 가로 6 → 13가지. 정석은 칸 6개를 한 번씩, 함정은 place를 33번 부른다
const WAYS = [1, 1]; // WAYS[i] = 가로 길이 i인 바닥을 채우는 방법 수 (가로 0은 빈 바닥 1가지)
for (let i = 2; i <= N; i++) WAYS.push((WAYS[i - 1] + WAYS[i - 2]) % MOD);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TABLE = {
  python: `def solution(n):
    MOD = 1_000_000_007
    dp = [0] * (n + 3)  # dp[i] = 가로 길이 i인 바닥을 채우는 방법의 수 (n이 1이어도 dp[2]를 쓸 수 있게 여유 칸)
    dp[1], dp[2] = 1, 2  # 가로 1은 세로 타일 1개, 가로 2는 세로 2개 또는 가로 2개

    for i in range(3, n + 1):
        # 맨 끝을 세로 타일 1개로 덮거나(dp[i - 1]), 가로 타일 2개로 덮거나(dp[i - 2])
        dp[i] = (dp[i - 1] + dp[i - 2]) % MOD

    return dp[n]`,
  javascript: `function solution(n) {
  const MOD = 1_000_000_007;
  const dp = Array(n + 3).fill(0); // dp[i] = 가로 길이 i인 바닥을 채우는 방법의 수 (n이 1이어도 dp[2]를 쓸 수 있게 여유 칸)
  dp[1] = 1; // 가로 1은 세로 타일 1개
  dp[2] = 2; // 가로 2는 세로 2개 또는 가로 2개

  for (let i = 3; i <= n; i++) {
    // 맨 끝을 세로 타일 1개로 덮거나(dp[i - 1]), 가로 타일 2개로 덮거나(dp[i - 2])
    dp[i] = (dp[i - 1] + dp[i - 2]) % MOD;
  }

  return dp[n];
}`,
};
const TABLE_AT = {
  start: lines(TABLE, ['dp = [0]'], ['const dp = Array(']),
  one: lines(TABLE, ['dp[1], dp[2] = 1, 2'], ['dp[1] = 1']),
  two: lines(TABLE, ['dp[1], dp[2] = 1, 2'], ['dp[2] = 2']),
  look: lines(TABLE, ['for i in range(3', 'dp[i] = (dp[i - 1]'], ['for (let i = 3', 'dp[i] = (dp[i - 1]']),
  add: lines(TABLE, ['dp[i] = (dp[i - 1]'], ['dp[i] = (dp[i - 1]']),
  done: lines(TABLE, ['return dp[n]'], ['return dp[n]']),
};

const ROLL = {
  python: `def solution(n):
    MOD = 1_000_000_007
    a, b = 1, 1  # a = 가로 0(빈 바닥), b = 가로 1의 방법 수

    for _ in range(n - 1):
        a, b = b, (a + b) % MOD  # 한 칸씩 밀면서 새 값을 b에 둡니다

    return b`,
  javascript: `function solution(n) {
  const MOD = 1_000_000_007;
  let a = 1; // 가로 0(빈 바닥)의 방법 수
  let b = 1; // 가로 1의 방법 수

  for (let i = 2; i <= n; i++) {
    [a, b] = [b, (a + b) % MOD]; // 한 칸씩 밀면서 새 값을 b에 둡니다
  }

  return b;
}`,
};
const ROLL_AT = {
  start: lines(ROLL, ['a, b = 1, 1'], ['let a = 1', 'let b = 1']),
  look: lines(ROLL, ['for _ in range(n - 1)', 'a, b = b, (a + b)'], ['for (let i = 2', '[a, b] = [b, (a + b)']),
  add: lines(ROLL, ['a, b = b, (a + b)'], ['[a, b] = [b, (a + b)']),
  done: lines(ROLL, ['return b'], ['return b']),
};

const PLACE = {
  python: `# 주의: n = 60000이면 방법이 10^12000가지가 넘어 하나씩 세다가는 끝나지 않는 풀이입니다
def solution(n):
    MOD = 1_000_000_007

    def place(col):  # col열부터 끝까지 타일을 놓아 바닥을 채우는 방법의 수
        if col == n:
            return 1  # 바닥을 다 채웠습니다
        total = place(col + 1)  # 세로 타일 1개를 놓고
        if col + 2 <= n:
            total += place(col + 2)  # 안 되면 가로 타일 2개를 포개 놓고
        return total % MOD

    return place(0)`,
  javascript: `// 주의: n = 60000이면 방법이 10^12000가지가 넘어 하나씩 세다가는 끝나지 않는 풀이입니다
function solution(n) {
  const MOD = 1_000_000_007;

  const place = (col) => {
    // col열부터 끝까지 타일을 놓아 바닥을 채우는 방법의 수
    if (col === n) {
      return 1; // 바닥을 다 채웠습니다
    }
    let total = place(col + 1); // 세로 타일 1개를 놓고
    if (col + 2 <= n) {
      total += place(col + 2); // 안 되면 가로 타일 2개를 포개 놓고
    }
    return total % MOD;
  };

  return place(0);
}`,
};
const PLACE_AT = {
  start: lines(PLACE, ['def place(col)', 'return place(0)'], ['const place = (col)', 'return place(0)']),
  back: lines(PLACE, ['return total % MOD'], ['return total % MOD']),
  full: lines(PLACE, ['if col == n', 'return 1'], ['if (col === n)', 'return 1;']),
  // 놓기: 세로 타일은 total = place(col + 1), 가로 타일 2개는 조건 뒤 total += place(col + 2) 줄이 돈다
  put: (vertical: boolean, horizontal: boolean) => lines(
    PLACE,
    ['if col == n', ...(vertical ? ['total = place(col + 1)'] : []), ...(horizontal ? ['if col + 2 <= n', 'total += place(col + 2)'] : [])],
    ['if (col === n)', ...(vertical ? ['let total = place(col + 1)'] : []), ...(horizontal ? ['if (col + 2 <= n)', 'total += place(col + 2)'] : [])],
  ),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const PITCH = 62; // 칸 54 + 사이 8
const CELL_Y = 16; // 위 16px: 칸 위에 붙는 판정 표시(11px)가 장면 안에 들게 둔 여백
const TILE = 116; // 타일의 긴 변: 칸 54 + 사이 8 + 칸 54
const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (): Action[] => together([{ type: 'clearMarks' }, { type: 'unfocus' }]);
const calcTo = (text: string): Action => ({ type: 'set', id: 'calc', patch: { text } });
const look = (from: string, to: string, label: string): Action => ({ type: 'arrow', from, to, verdict: 'good', label });

// 자막이 글자당 20ms 이상 보이도록(마디가 끝난 뒤 다음 자막이 뜰 때까지 포함), 한 단계가 2초 이상 가도록 마디 끝에 기다림을 더한다
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

// 정석·대안이 같이 쓰는 칸 줄: first부터 N까지 칸(글은 방법 수)과 아래 이름표, 계산 글. extra는 그림이나 a·b 표시
function row(first: number, calcY: number, extra: Item[] = []): Scene {
  const cells = Array.from({ length: N - first + 1 }, (_, k) => first + k);
  const width = cells.length * PITCH - 8;
  const items: Item[] = cells.flatMap((i): Item[] => [
    { id: `cell:${i}`, kind: 'cell', rect: { x: (i - first) * PITCH, y: CELL_Y, w: 54, h: 54 }, tone: 'plain', text: '' },
    { id: `label:${i}`, kind: 'text', rect: { x: (i - first) * PITCH, y: CELL_Y + 58, w: 54, h: 16 }, tone: 'muted', text: `가로 ${i}` },
  ]);
  items.push({ id: 'calc', kind: 'text', rect: { x: 0, y: calcY, w: width, h: 28 }, text: '' }, ...extra);
  return { width, height: calcY + 28, items };
}
const cellId = (i: number) => `cell:${i}`;
const setCell = (i: number, patch: ItemPatch, pop = false): Action => ({ type: 'set', id: cellId(i), patch, ...(pop ? { pop } : {}) });
const paint = (i: number, tone: Tone) => setCell(i, { tone });

/* ------------------------------------------------------------------ */
/* 정석 표 채우기: 경우 나누기 → 값 보기 → 더하기                          */
/* ------------------------------------------------------------------ */

// 맨 끝을 덮는 두 경우 그림: A는 남은 가로 i − 1 바닥 + 세로 타일 1개, B는 남은 가로 i − 2 바닥 + 가로 타일 2개(포개서)
const A0 = 100;
const B0 = A0 + TILE + 12;
const TABLE_CALC = B0 + TILE + 12;
const pictures = (i: number): Item[] => {
  const [a, b] = [i - 1, i - 2];
  const zoneA: Rect = { x: 0, y: A0, w: a * PITCH - 8, h: TILE };
  const zoneB: Rect = { x: 0, y: B0, w: b * PITCH - 8, h: TILE };
  return [
    { id: 'A:zone', kind: 'zone', rect: zoneA, tag: `dp[${a}]` },
    { id: 'A:num', kind: 'text', rect: zoneA, text: `${WAYS[a]}가지` },
    { id: 'B:zone', kind: 'zone', rect: zoneB, tag: `dp[${b}]` },
    { id: 'B:num', kind: 'text', rect: zoneB, text: `${WAYS[b]}가지` },
    { id: 'A:tile', kind: 'cell', rect: { x: a * PITCH, y: A0, w: 54, h: TILE }, tone: 'chosen', text: '세로' },
    { id: 'B:tile1', kind: 'cell', rect: { x: b * PITCH, y: B0, w: TILE, h: 54 }, tone: 'visited', text: '가로' },
    { id: 'B:tile2', kind: 'cell', rect: { x: b * PITCH, y: B0 + 62, w: TILE, h: 54 }, tone: 'visited', text: '가로' },
  ];
};
// 처음에는 그림을 나타내고, 그 뒤에는 같은 물체의 자리와 글만 바꾼다
const draw = (i: number, first: boolean): Action[] => together(pictures(i).map((item): Action => first
  ? { type: 'add', item }
  : { type: 'set', id: item.id, patch: { rect: item.rect, ...(item.text === undefined ? {} : { text: item.text }), ...(item.tag ? { tag: item.tag } : {}) } }));

function table(): Visualization {
  const rec = new StepRecorder(row(1, TABLE_CALC));
  let lit: number | undefined; // 노란 칸(바로 전에 채운 칸)
  let done = 0;
  const now = { i: '-' as number | string, one: '-' as number | string, two: '-' as number | string, v: '-' as number | string };
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({ work: done, variables: { i: now.i, 'dp[i - 1]': now.one, 'dp[i - 2]': now.two, 'dp[i]': now.v } });
  const settle = (): Action[] => (lit ? [paint(lit, 'visited')] : []);
  const fill = (i: number): Action => setCell(i, { text: String(WAYS[i]), tone: 'current' }, true);

  rec.step({ title: '표 만들기', codeHighlights: TABLE_AT.start, ...meta() });
  rec.phase('시작', `2 × 1 타일로 2 × ${N} 바닥을 채우는 방법의 수를 구합니다. 가로 길이 i인 바닥의 방법 수를 dp[i]에 적습니다.`);
  rec.do(calcTo('가로 길이 i의 방법 수 = dp[i]'));
  rec.phase('규칙', '맨 오른쪽 끝을 덮는 방법은 두 가지뿐이라, dp[i] = dp[i − 1] + dp[i − 2]입니다.');
  rec.do(calcTo('dp[i] = dp[i − 1] + dp[i − 2]'));

  const bases = [
    { i: 1, why: '가로 1은 세로 타일 1개로 덮는 한 가지뿐입니다.', show: '가로 1: 세로 1개', put: 'dp[1]에 1을 적습니다.', at: TABLE_AT.one },
    { i: 2, why: '가로 2는 세로 타일 2개, 또는 가로 타일 2개를 포개어 두 가지입니다.', show: '가로 2: 세로 2개 · 가로 2개', put: 'dp[2]에 2를 적습니다.', at: TABLE_AT.two },
  ];
  for (const b of bases) {
    done++;
    now.i = b.i;
    now.one = now.two = '-';
    now.v = WAYS[b.i];
    rec.step({ title: `dp[${b.i}] = ${WAYS[b.i]}`, codeHighlights: b.at, ...meta() });
    rec.phase('기본값', b.why, b.at);
    rec.do(...together([...settle(), paint(b.i, 'chosen'), calcTo(b.show)]));
    rec.phase('적기', b.put, b.at);
    rec.do(fill(b.i), calcTo(`dp[${b.i}] = ${WAYS[b.i]}`));
    lit = b.i;
  }

  for (let i = 3; i <= N; i++) {
    const [one, two] = [WAYS[i - 1], WAYS[i - 2]];
    done++;
    now.i = i;
    now.one = one;
    now.two = two;
    now.v = WAYS[i];
    const formula = `dp[${i - 1}] + dp[${i - 2}] = ${one} + ${two}`;
    rec.step({ title: `dp[${i}] = ${one} + ${two} = ${WAYS[i]}`, codeHighlights: TABLE_AT.add, ...meta() });
    rec.phase('경우 나누기', `가로 ${i} 바닥의 오른쪽 끝은 세로 타일 1개로 덮거나, 가로 타일 2개를 포개어 덮습니다.`, TABLE_AT.look);
    rec.do(...together([...settle(), paint(i, 'current'), calcTo(`가로 ${i}의 끝: 세로 1개 / 가로 2개`)]));
    rec.do(...draw(i, i === 3));
    rec.phase('값 보기', `세로로 끝나면 남은 가로 ${josa(i - 1, '을', '를')} ${one}가지, 가로로 끝나면 남은 가로 ${josa(i - 2, '을', '를')} ${two}가지로 채웁니다.`, TABLE_AT.look);
    rec.do(...together([{ type: 'focus', ids: [cellId(i), cellId(i - 1), cellId(i - 2), 'A:tile', 'B:tile1', 'B:tile2'] }, calcTo(formula)]));
    rec.do(look(cellId(i), cellId(i - 1), `${one}가지`), look(cellId(i), cellId(i - 2), `${two}가지`), wait(300));
    rec.phase('더하기', `두 경우는 겹치지 않아 ${one} + ${two} = ${WAYS[i]}가지입니다.`, TABLE_AT.add);
    rec.do(...together([fill(i), calcTo(`${formula} = ${WAYS[i]}`)]), wait(300), ...clear());
    lit = i;
  }

  now.i = N;
  now.one = WAYS[N - 1];
  now.two = WAYS[N - 2];
  rec.step({ title: `답 dp[${N}] = ${WAYS[N]}`, codeHighlights: TABLE_AT.done, ...meta(), answer: WAYS[N], isKeyframe: true });
  rec.phase('답', `가로 ${N}인 바닥을 채우는 방법은 ${WAYS[N]}가지입니다. 값이 커지면 더할 때마다 1,000,000,007로 나눈 나머지를 적습니다.`);
  rec.do(...together([...settle(), paint(N, 'path'), calcTo(`dp[${N}] = ${WAYS[N]}가지`)]));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 대안 변수 두 개 굴리기: 두 값 보기 → 더하기 → 밀기                      */
/* ------------------------------------------------------------------ */

const TOKEN_Y = CELL_Y + 58 + 16 + 6; // 이름표 아래 a, b 표시 줄
const markerRect = (at: number): Rect => ({ x: at * PITCH, y: TOKEN_Y, w: 54, h: 28 });
const marker = (id: 'a' | 'b', at: number, value: number): Item => ({ id, kind: 'token', rect: markerRect(at), tone: 'chosen', text: `${id}=${value}` });

function roll(): Visualization {
  const rec = new StepRecorder(row(0, TOKEN_Y + 28 + 8, [marker('a', 0, 1), marker('b', 1, 1)]));
  let done = 1; // 가로 1의 방법 수는 처음부터 알고 있다
  const now = { i: '-' as number | string, a: 1, b: 1 };
  const meta = () => ({ work: done, variables: { i: now.i, a: now.a, b: now.b } });
  const keep = (i: number): Action => setCell(i, { text: String(WAYS[i]), tone: 'visited' });

  rec.step({ title: 'a = 1, b = 1로 시작', codeHighlights: ROLL_AT.start, ...meta() });
  rec.phase('시작', '표 없이 변수 a, b 두 개만 씁니다. a는 가로 0(빈 바닥), b는 가로 1의 방법 수입니다.');
  rec.do(calcTo('a = 가로 0, b = 가로 1의 방법 수'));
  rec.phase('규칙', '빈 바닥은 아무것도 놓지 않는 1가지로 칩니다. 새 값은 a + b이고 한 칸씩 밀어 갑니다.');
  rec.do(...together([keep(0), keep(1)]), calcTo('새 값 = a + b, 그 뒤 a ← b, b ← 새 값'));

  for (let i = 2; i <= N; i++) {
    const [a, b] = [WAYS[i - 2], WAYS[i - 1]];
    done++;
    now.i = i;
    [now.a, now.b] = [b, WAYS[i]];
    rec.step({ title: `새 값 ${a} + ${b} = ${WAYS[i]}, 한 칸 밀기`, codeHighlights: ROLL_AT.add, ...meta() });
    rec.phase('두 값 보기', `가로 ${josa(i, '은', '는')} 가로 ${i - 1}의 b = ${b}가지와 가로 ${i - 2}의 a = ${a}가지가 모입니다.`, ROLL_AT.look);
    rec.do(...together([paint(i, 'current'), { type: 'focus', ids: [cellId(i), cellId(i - 1), cellId(i - 2)] }, calcTo(`a + b = ${a} + ${b}`)]));
    rec.do(look(cellId(i), cellId(i - 1), `b=${b}`), look(cellId(i), cellId(i - 2), `a=${a}`), wait(300));
    rec.phase('더하기', `${a} + ${b} = ${WAYS[i]}가지를 가로 ${i}에 적습니다.`, ROLL_AT.add);
    rec.do(...together([setCell(i, { text: String(WAYS[i]) }, true), calcTo(`${a} + ${b} = ${WAYS[i]}`)]), wait(300), ...clear());
    rec.phase('밀기', `a는 ${ro(b)}, b는 ${ro(WAYS[i])} 바꾸고 가로 ${i - 2}의 값은 더 쓰지 않아 지웁니다.`, ROLL_AT.add);
    rec.do(...together([
      setCell(i - 2, { text: '', tone: 'muted' }),
      { type: 'set', id: 'a', patch: { rect: markerRect(i - 1), text: `a=${b}` } },
      { type: 'set', id: 'b', patch: { rect: markerRect(i), text: `b=${WAYS[i]}` } },
      paint(i, 'visited'),
      calcTo(`a = ${b}, b = ${WAYS[i]}`),
    ]));
  }

  rec.step({ title: `답 b = ${WAYS[N]}`, codeHighlights: ROLL_AT.done, ...meta(), answer: WAYS[N], isKeyframe: true });
  rec.phase('답', `가로 ${N}인 바닥을 채우는 방법은 b = ${WAYS[N]}가지입니다. 남은 값은 두 개뿐이라 메모리를 거의 쓰지 않았습니다.`);
  rec.do(...together([paint(N, 'path'), calcTo(`b = ${WAYS[N]}가지`)]));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 함정 모두 놓아 보기: 되돌리기 → 놓기 → 세기 (완성된 방법마다)             */
/* ------------------------------------------------------------------ */

type Kind = 'V' | 'H'; // V: 세로 타일 1개(열 1개), H: 가로 타일 2개를 포갠 것(열 2개)
// 함정 코드와 같은 차례(세로를 먼저)로 완성되는 방법들
const tilings: Kind[][] = [];
const fillFrom = (seq: Kind[], col: number): void => {
  if (col === N) tilings.push(seq);
  else {
    fillFrom([...seq, 'V'], col + 1);
    if (col + 2 <= N) fillFrom([...seq, 'H'], col + 2);
  }
};
fillFrom([], 0);

const FLOOR_Y = CELL_Y;
const FLOOR_W = N * PITCH - 8;
const PLACE_CALC = FLOOR_Y + TILE + 16;
const TONE_OF: Record<Kind, Tone> = { V: 'chosen', H: 'visited' };
const NAME_OF: Record<Kind, string> = { V: '세로', H: '가로' };
const tileIds = (index: number, kind: Kind) => (kind === 'V' ? [`tile:${index}`] : [`tile:${index}a`, `tile:${index}b`]);
const colOf = (seq: Kind[], index: number) => seq.slice(0, index).reduce((c, k) => c + (k === 'V' ? 1 : 2), 0);
const tileItems = (seq: Kind[], index: number): Item[] => {
  const x = colOf(seq, index) * PITCH;
  const kind = seq[index];
  const mine = { kind: 'cell', tone: TONE_OF[kind], text: NAME_OF[kind] } as const;
  return kind === 'V'
    ? [{ ...mine, id: `tile:${index}`, rect: { x, y: FLOOR_Y, w: 54, h: TILE } }]
    : [{ ...mine, id: `tile:${index}a`, rect: { x, y: FLOOR_Y, w: TILE, h: 54 } }, { ...mine, id: `tile:${index}b`, rect: { x, y: FLOOR_Y + 62, w: TILE, h: 54 } }];
};
// 같은 종류가 이어지면 '세로×4'처럼 줄여 쓴다
const nameOf = (seq: Kind[]): string => {
  const runs: string[] = [];
  for (let i = 0; i < seq.length; ) {
    let j = i;
    while (j < seq.length && seq[j] === seq[i]) j++;
    runs.push(`${NAME_OF[seq[i]]}${j - i > 1 ? `×${j - i}` : ''}`);
    i = j;
  }
  return runs.join('·');
};

function placeAll(): Visualization {
  const floor: Item[] = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < N; c++) floor.push({ id: `zone:${r},${c}`, kind: 'zone', rect: { x: c * PITCH, y: FLOOR_Y + r * 62, w: 54, h: 54 } });
  const rec = new StepRecorder({
    width: FLOOR_W,
    height: PLACE_CALC + 28,
    items: [
      ...floor,
      { id: 'calc', kind: 'text', rect: { x: 0, y: PLACE_CALC, w: FLOOR_W - 128, h: 28 }, text: '' },
      { id: 'count', kind: 'token', rect: { x: FLOOR_W - 120, y: PLACE_CALC, w: 120, h: 28 }, tone: 'chosen', text: '완성 0가지' },
    ],
  });
  let calls = 0; // 지금까지 부른 place 수
  let found = 0; // 지금까지 센 완성된 방법
  let col: number | string = '-';
  const meta = () => ({ work: calls, variables: { '채운 열 (col)': col, '호출 수': calls, '완성한 방법': found } });
  const paint = (seq: Kind[]): Action[] => seq.flatMap((k, i) => tileIds(i, k).map((id): Action => ({ type: 'set', id, patch: { tone: 'path' } })));
  const repaint = (seq: Kind[]): Action[] => seq.flatMap((k, i) => tileIds(i, k).map((id): Action => ({ type: 'set', id, patch: { tone: TONE_OF[k] } })));

  calls = 1; // place(0)
  rec.step({ title: 'place(0) 부르기', codeHighlights: PLACE_AT.start, ...meta() });
  rec.phase('시작', 'place(col)은 col열부터 끝까지 타일을 놓아 바닥을 채우는 방법의 수입니다. 왼쪽부터 놓아 봅니다.');
  rec.do(calcTo('col열부터 채우는 방법의 수'));
  rec.phase('호출', 'place(0)을 부르면 세로 타일을 놓고 place(1)을, 가로 타일 2개를 놓고 place(2)를 또 부릅니다.', PLACE_AT.start);
  rec.do(calcTo('place(0) 호출'));

  const common = (a: Kind[], b: Kind[]) => {
    let n = 0;
    while (n < a.length && n < b.length && a[n] === b[n]) n++;
    return n;
  };
  tilings.forEach((seq, k) => {
    const keep = common(k ? tilings[k - 1] : [], seq); // 이번 방법에서 새로 놓기 시작하는 자리
    const back = tilings[k + 1] ? common(seq, tilings[k + 1]) : seq.length; // 센 뒤 다음 방법을 위해 되돌아갈 자리(마지막은 그대로)
    const placed = seq.slice(keep);
    const removed = seq.slice(back);
    calls += placed.length;
    found++;
    col = colOf(seq, back);
    const hasV = placed.includes('V');
    const hasH = placed.includes('H');

    rec.step({ title: `방법 ${found} 완성: ${nameOf(seq)}`, codeHighlights: PLACE_AT.full, ...meta() });
    rec.phase('놓기', k === 0
      ? `세로 타일만 끝까지 ${placed.length}개 놓아 봅니다. 먼저 이렇게 한 가지가 완성됩니다.`
      : placed.length > 3
        ? `타일 ${placed.length}번을 한꺼번에 놓아 끝까지 채웁니다. (${nameOf(placed)})`
        : `${placed.map((kind) => (kind === 'V' ? '세로 타일 1개' : '가로 타일 2개')).join(', ')}를 놓아 바닥을 끝까지 채웁니다.`, PLACE_AT.put(hasV, hasH));
    const adds = placed.map((_, d) => together(tileItems(seq, keep + d).map((item): Action => ({ type: 'add', item }))));
    if (placed.length > 3) rec.do(...together([...adds.flat(), calcTo(`타일 ${placed.length}개 놓음`)]));
    else adds.forEach((acts, d) => rec.do(...(d ? acts : together([...acts, calcTo(`${NAME_OF[placed[0]]} 타일 놓음`)]))));
    rec.phase('세기', `바닥이 가득 찼습니다. ${found}번째 방법을 셉니다.`, PLACE_AT.full);
    rec.do(...together([...paint(seq), { type: 'set', id: 'count', patch: { text: `완성 ${found}가지` }, pop: true }, calcTo(`완성! ${nameOf(seq)}`)]));
    if (removed.length) {
      rec.phase('되돌리기', `마지막 ${removed.length}번 놓은 타일을 치우고 돌아가 다른 타일을 놓아 봅니다.`, PLACE_AT.back);
      rec.do(...together([...repaint(seq.slice(0, back)), ...removed.flatMap((kind, d) => tileIds(back + d, kind).map((id): Action => ({ type: 'remove', id }))), calcTo('되돌아가기')]));
    }
  });

  // 모두 돌아와 place(0)이 답을 낸다
  const answer = tilings.length;
  col = 0;
  rec.step({ title: `place(0) = ${answer}`, codeHighlights: PLACE_AT.start, ...meta(), answer, isKeyframe: true });
  rec.phase('답 확인', `${answer}가지를 하나씩 세어서야 답이 나왔습니다. place를 ${calls}번 불렀습니다.`);
  rec.do(...together([{ type: 'set', id: 'count', patch: { tone: 'path' } }, calcTo(`place(0) = ${answer}`)]));
  rec.phase('최대 입력', `n = 60000이면 방법이 10^12000가지가 넘어 끝나지 않습니다. 정석은 칸 6만 개면 충분합니다.`);
  rec.do(calcTo('n = 60000 → 10^12000가지 이상'));
  return paced(rec.finish());
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'tiling-2xn',
  title: '2 x n 타일링',
  level: 2,
  category: 'dp',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/12900',
  description: {
    summary:
      '가로 길이가 n, 세로 길이가 2인 바닥을 2 × 1 크기 타일로 빈틈없이 채우는 방법이 모두 몇 가지인지 구합니다. 타일은 가로로도 세로로도 놓을 수 있고, 답이 커질 수 있어 1,000,000,007로 나눈 나머지를 돌려줍니다.',
    rules: [
      '가로 길이 n은 60,000 이하의 자연수',
      '타일은 2 × 1 크기이고 가로로도 세로로도 놓을 수 있음',
      '겹치지 않게 바닥을 빈틈없이 채우는 방법의 수를 센다',
      '방법의 수를 1,000,000,007로 나눈 나머지를 return',
    ],
    examples: [{ input: 'n = 4', output: '5' }],
  },
  keyIntuitions: [
    '맨 오른쪽 끝을 덮는 방법은 두 가지뿐입니다. 세로 타일 1개를 놓으면 남는 바닥은 가로 n − 1이고, 가로 타일 2개를 포개 놓으면 남는 바닥은 가로 n − 2입니다.',
    '그래서 dp[n] = dp[n − 1] + dp[n − 2]이고, dp[1] = 1, dp[2] = 2에서 시작하는 피보나치 수열입니다.',
    'n이 60,000이면 방법의 수가 10^12000가지가 넘어 타일을 놓아 보며 하나씩 세는 것은 불가능합니다. 표에 적으며 더할 때마다 1,000,000,007로 나눕니다.',
  ],
  demo: { input: [N], label: `n = ${N}` },
  workUnit: '방법 수를 구한 횟수',
  approaches: [
    {
      id: 'tiling-table',
      name: '앞의 두 가로 길이를 더하는 표 채우기',
      rank: 'BEST',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      verdict: '가로 길이별 방법 수를 표에 적고, 맨 끝을 세로 타일 하나 또는 가로 타일 둘로 덮는 두 경우를 더해 나가는 풀이입니다.',
      pros: [
        '끝을 덮는 방법이 두 가지뿐이라는 관찰이 곧 점화식이라 틀리기 어렵습니다.',
        'n = 60000이어도 칸을 6만 번 채우면 끝납니다.',
        '표가 남아 있어 중간 값을 확인하기 쉽습니다.',
      ],
      cons: [
        '값이 빨리 커지므로 더할 때마다 1,000,000,007로 나누는 것을 잊으면 안 됩니다.',
        'dp[1]과 dp[2]를 따로 정해 두어야 하고, n이 1일 때도 dp[2]를 쓸 수 있게 표를 여유 있게 만들어야 합니다.',
      ],
      whyThisRank:
        '멀리 뛰기와 같은 피보나치형입니다. 맨 끝을 덮는 두 경우를 더한다는 생각이 가장 단순하고, 반복문이 짧아 실수할 곳이 적습니다.',
      code: TABLE,
      visualize: table,
    },
    {
      id: 'tiling-two-variables',
      name: '변수 두 개만 굴리기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      verdict: '표 없이 변수 두 개를 한 칸씩 밀며 구해 메모리는 아끼지만, 중간 값이 남지 않는 풀이입니다.',
      pros: ['메모리가 O(1)이라 n이 아주 커도 부담이 없습니다.', '코드가 짧습니다.'],
      cons: [
        '앞서 계산한 값이 남지 않아 중간 값을 확인하거나 점화식을 바꿔 보기 어렵습니다.',
        'a와 b를 한꺼번에 바꿔 쓰지 않으면 값이 꼬이고, 반복 횟수(n − 1)를 헷갈리기 쉽습니다.',
      ],
      whyThisRank:
        'n이 6만까지라 표 하나의 메모리는 부담이 되지 않습니다. 아낄 것이 없는데 뜻이 덜 드러나서, 표를 채우는 정석이 더 안전합니다.',
      code: ROLL,
      visualize: roll,
    },
    {
      id: 'tiling-place-all',
      name: '타일을 놓아 보며 모든 방법 세기',
      rank: 'TRAP',
      trap: 'slow',
      timeComplexity: 'O(1.6^n)',
      spaceComplexity: 'O(n) 재귀 깊이',
      verdict: '타일을 하나씩 놓아 보며 완성된 방법을 하나씩 세면 방법의 수만큼 걸려 n이 조금만 커져도 끝나지 않습니다.',
      pros: ['"놓아 보고, 안 되면 되돌린다"는 가장 먼저 떠오르는 생각이라 이해하기 쉽습니다.', 'n이 작을 때는 정확한 답을 냅니다.'],
      cons: [
        '방법의 수가 피보나치 수열처럼 늘어 n = 60000이면 10^12000가지가 넘어, 하나씩 세는 것은 불가능합니다.',
        '같은 남은 바닥(가로 k)을 몇 번이고 처음부터 다시 셉니다.',
      ],
      whyThisRank:
        '남은 바닥의 모양은 가로 길이 하나로 정해지므로 같은 부분 문제가 반복됩니다. 메모를 붙이거나 표로 바꾸면 가로 길이마다 한 번씩만 계산해 O(n)이 됩니다.',
      code: PLACE,
      visualize: placeAll,
    },
  ],
  checks: {
    cases: [
      { args: [4], expected: 5 },
      { args: [1], expected: 1 },
      { args: [2], expected: 2 },
      { args: [3], expected: 3 },
      { args: [N], expected: 13 },
      { args: [45], expected: 836311896 },
      { args: [1000], expected: 107579939 },
      { args: [60000], expected: 804299274 },
    ],
    // 가로 1~14: 함정이 호출을 수백 번 해도 순식간이다
    random: (rand) => [1 + Math.floor(rand() * 14)],
  },
};

export default problem;
