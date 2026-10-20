// 기능개발: 정석 배포일 기준 한 번 훑기, 대안 큐에서 앞부터 꺼내기, 함정 직전 기능하고만 비교하기를 같은 장면에서 움직인다.
// 장면은 왼쪽에 줄 이름, 위에서부터 기능 이름 · 배포일 표시 · 기능 카드(남은 날 칸, 진도 막대, 상태 글) · 배포 기록 줄이다.
import { Lane, type LaneOptions } from '../../engine/lane.ts';
import { slots } from '../../engine/layout.ts';
import type { Action, Item, Problem, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { at, josa, lines, ro, together } from '../shared.ts';

// 시각화 입력. 남은 날이 [5, 3, 4, 2, 6, 1, 7]이라 정석은 [4, 2, 1], 함정은 [2, 2, 2, 1]이 나온다.
const PROGRESSES = [95, 97, 96, 98, 94, 99, 93];
const SPEEDS = [1, 1, 1, 1, 1, 1, 1];
const DAYS = PROGRESSES.map((p, i) => Math.ceil((100 - p) / SPEEDS[i]));
const N = DAYS.length;
const list = (xs: number[]) => `[${xs.join(', ')}]`;
const name = (i: number) => `기능 ${i + 1}`;

// 정답의 묶음(기능 번호): 묶음 맨 앞 기능의 남은 날 안에 끝나는 뒤 기능은 같은 묶음이다. 대안의 단계와 함정의 정답 표시에 쓴다
const BATCHES: number[][] = [];
for (let i = 0; i < N; i++) {
  const batch = BATCHES.at(-1);
  if (batch && DAYS[i] <= DAYS[batch[0]]) batch.push(i);
  else BATCHES.push([i]);
}

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const SINGLE = {
  python: `import math

def solution(progresses, speeds):
    # 기능마다 배포까지 남은 날: 올림((100 - 진도) / 속도)
    days = [math.ceil((100 - p) / s) for p, s in zip(progresses, speeds)]

    answer = []
    deploy_day = days[0]  # 지금 묶음이 배포되는 날
    count = 1

    for day in days[1:]:
        if day <= deploy_day:
            count += 1            # 이미 끝나 있으니 함께 배포
        else:
            answer.append(count)  # 지금 묶음을 내보내고
            deploy_day = day      # 새 묶음 시작
            count = 1

    answer.append(count)          # 마지막 묶음
    return answer`,
  javascript: `function solution(progresses, speeds) {
  // 기능마다 배포까지 남은 날: 올림((100 - 진도) / 속도)
  const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));

  const answer = [];
  let deployDay = days[0]; // 지금 묶음이 배포되는 날
  let count = 1;

  for (let i = 1; i < days.length; i++) {
    if (days[i] <= deployDay) {
      count++; // 이미 끝나 있으니 함께 배포
    } else {
      answer.push(count); // 지금 묶음을 내보내고
      deployDay = days[i]; // 새 묶음 시작
      count = 1;
    }
  }

  answer.push(count); // 마지막 묶음
  return answer;
}`,
};
// else 안의 count = 1은 들여쓰기까지 넣어야 위쪽 첫 count = 1과 갈린다
const SINGLE_AT = {
  days: lines(SINGLE, ['days = [math.ceil'], ['const days = progresses.map']),
  first: lines(SINGLE, ['deploy_day = days[0]', 'count = 1'], ['let deployDay = days[0]', 'let count = 1']),
  compare: lines(SINGLE, ['for day in days[1:]', 'if day <= deploy_day'], ['for (let i = 1; i < days.length; i++)', 'if (days[i] <= deployDay)']),
  join: lines(SINGLE, ['if day <= deploy_day', 'count += 1'], ['if (days[i] <= deployDay)', 'count++']),
  ship: lines(SINGLE, ['else:', '# 지금 묶음을 내보내고', '# 새 묶음 시작', '            count = 1'],
    ['} else {', '// 지금 묶음을 내보내고', '// 새 묶음 시작', '      count = 1;']),
  last: lines(SINGLE, ['# 마지막 묶음', 'return answer'], ['// 마지막 묶음', 'return answer']),
};

const QUEUE = {
  python: `from collections import deque
import math

def solution(progresses, speeds):
    queue = deque(math.ceil((100 - p) / s) for p, s in zip(progresses, speeds))
    answer = []

    while queue:
        first = queue.popleft()  # 맨 앞 기능이 배포되는 날
        count = 1
        while queue and queue[0] <= first:
            queue.popleft()      # 이미 끝난 뒤 기능을 함께 꺼냄
            count += 1
        answer.append(count)
    return answer`,
  javascript: `function solution(progresses, speeds) {
  const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));
  const answer = [];
  let head = 0; // shift() 대신 머리 인덱스로 큐를 꺼냅니다

  while (head < days.length) {
    const first = days[head++]; // 맨 앞 기능이 배포되는 날
    let count = 1;
    while (head < days.length && days[head] <= first) {
      head++; // 이미 끝난 뒤 기능을 함께 꺼냄
      count++;
    }
    answer.push(count);
  }
  return answer;
}`,
};
const QUEUE_AT = {
  start: lines(QUEUE, ['queue = deque('], ['const days = progresses.map', 'let head = 0']),
  first: lines(QUEUE, ['while queue:', 'first = queue.popleft()', 'count = 1'], ['while (head < days.length) {', 'const first = days[head++]', 'let count = 1']),
  more: lines(QUEUE, ['while queue and queue[0] <= first', '# 이미 끝난 뒤 기능을 함께 꺼냄', 'count += 1'],
    ['while (head < days.length && days[head] <= first)', '// 이미 끝난 뒤 기능을 함께 꺼냄', 'count++']),
  ship: lines(QUEUE, ['answer.append(count)'], ['answer.push(count)']),
  done: lines(QUEUE, ['answer.append(count)', 'return answer'], ['answer.push(count)', 'return answer']),
};

const PREVIOUS = {
  python: `import math

def solution(progresses, speeds):
    days = [math.ceil((100 - p) / s) for p, s in zip(progresses, speeds)]
    answer = []
    count = 1

    for i in range(1, len(days)):
        if days[i] <= days[i - 1]:  # 잘못된 기준: 직전 기능과만 비교
            count += 1
        else:
            answer.append(count)
            count = 1
    answer.append(count)
    return answer  # days = [5, 3, 4] → [2, 1] (정답은 [3])`,
  javascript: `function solution(progresses, speeds) {
  const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));
  const answer = [];
  let count = 1;

  for (let i = 1; i < days.length; i++) {
    if (days[i] <= days[i - 1]) { // 잘못된 기준: 직전 기능과만 비교
      count++;
    } else {
      answer.push(count);
      count = 1;
    }
  }
  answer.push(count);
  return answer; // days = [5, 3, 4] → [2, 1] (정답은 [3])
}`,
};
// 반복 뒤의 append는 안쪽 append와 글자가 같아(at은 첫 줄을 찾는다) return 바로 윗줄로 짚는다
const lastPush = (code: string) => [at(code, 'return answer')[0] - 1, at(code, 'return answer')[0]];
const PREVIOUS_AT = {
  days: lines(PREVIOUS, ['days = [math.ceil'], ['const days = progresses.map']),
  first: lines(PREVIOUS, ['count = 1'], ['let count = 1']),
  compare: lines(PREVIOUS, ['for i in range(1, len(days))', 'if days[i] <= days[i - 1]'],
    ['for (let i = 1; i < days.length; i++)', 'if (days[i] <= days[i - 1])']),
  join: lines(PREVIOUS, ['if days[i] <= days[i - 1]', 'count += 1'], ['if (days[i] <= days[i - 1])', 'count++']),
  ship: lines(PREVIOUS, ['else:', 'answer.append(count)', '            count = 1'], ['} else {', 'answer.push(count)', '      count = 1;']),
  last: { python: lastPush(PREVIOUS.python), javascript: lastPush(PREVIOUS.javascript) },
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

// 가로: 왼쪽 64px은 줄 이름, 카드는 x 72부터 76px씩 8px 간격. 세로 띠: 이름 0~20, 배포일 표시 26~54,
// 카드 62~182(남은 날 칸 70~118, 진도 막대 126~146, 상태 글 152~174), 배포 기록 196~236.
// 배포일 표시는 이름과 카드 사이에 있어서, 표시에서 카드로 긋는 화살표가 이름 글을 지나지 않는다.
// 배포일 표시와 남은 날 칸에는 숫자만 적고 단위는 줄 이름이 맡는다. 글이 좁아야 비스듬한 화살표의 꼬리와 촉이 글자에 닿지 않는다.
// 오른쪽 18px은 마지막 카드 위 판정 표시('7일 > 1일 → 새 묶음', 112px)가 판 안에 들도록 둔 여백이다.
const card = slots({ x: 72, y: 62, w: 76, h: 120, gap: 8 });
const MARK_Y = 26;
const DAY_Y = 70;
const BAR_Y = 126;
const STATE_Y = 152;
const LOG_Y = 196;
const W = card(N - 1).x + 76 + 18; // 670
const H = LOG_Y + 40;
const LOG: LaneOptions = { id: 'log', x: 76, y: LOG_Y + 4, slotW: 96, slotH: 32, gap: 8, max: 4 }; // 함정은 4번 배포한다
const LOG_BG = { x: LOG.x - 4, y: LOG_Y, w: LOG.max * (LOG.slotW + LOG.gap), h: 40 }; // 토큰 칸 4개와 양쪽 4px 여백
const dayId = (i: number) => `day:${i}`;

const rowLabel = (id: string, text: string, y: number, h: number): Item => ({ id, kind: 'text', rect: { x: 0, y, w: 64, h }, text });

// 세 풀이가 같이 쓰는 장면: 줄 이름, 기능 카드 7개, 배포 기록 줄의 바탕. mark는 배포일 표시 줄의 이름(정석 '배포일', 대안 'first')
function board(mark?: string): Scene {
  const items: Item[] = [
    ...(mark ? [rowLabel('row:mark', mark, MARK_Y, 28)] : []),
    rowLabel('row:day', '남은 날', DAY_Y, 48),
    rowLabel('row:bar', '진도', BAR_Y, 20),
    rowLabel('row:state', '상태', STATE_Y, 22),
    rowLabel('log:label', '배포 기록', LOG_Y, 40),
    { id: 'log:bg', kind: 'zone', rect: LOG_BG },
  ];
  PROGRESSES.forEach((p, i) => {
    const { x } = card(i);
    items.push(
      { id: `name:${i}`, kind: 'text', rect: { x, y: 0, w: 76, h: 20 }, text: name(i) },
      { id: `card:${i}`, kind: 'zone', rect: card(i) },
      { id: dayId(i), kind: 'cell', rect: { x: x + 6, y: DAY_Y, w: 64, h: 48 }, tone: 'plain', text: '' },
      { id: `bar:${i}`, kind: 'bar', rect: { x: x + 6, y: BAR_Y, w: 64, h: 20 }, tone: 'muted', fill: p / 100, text: `${p}%` },
      { id: `state:${i}`, kind: 'text', rect: { x, y: STATE_Y, w: 76, h: 22 }, text: '대기' },
    );
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (i: number, tone: Tone): Action => ({ type: 'set', id: dayId(i), patch: { tone } });
const status = (i: number, text: string): Action => ({ type: 'set', id: `state:${i}`, patch: { text } });
const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
// 남은 날을 모든 칸에 한꺼번에 적는다
const writeDays = (): Action[] => together(DAYS.map((d, i): Action => ({ type: 'set', id: dayId(i), patch: { text: String(d) }, pop: true })));
// 지금 묶음에 들기(파란 칸)와 배포 완료(초록 칸, 진도 100%)
const join = (i: number): Action[] => [paint(i, 'queued'), status(i, '이번 묶음')];
const shipped = (i: number): Action[] => [
  paint(i, 'visited'),
  { type: 'set', id: `bar:${i}`, patch: { tone: 'visited', fill: 1, text: '100%' } },
  status(i, '배포 완료'),
];
// 배포일 표시: i번 카드 위에 처음이면 나타나고, 그 뒤로는 미끄러져 옮겨 간다
const markTo = (rec: StepRecorder, i: number, day: number): Action => {
  const patch = { rect: { x: card(i).x + 12, y: MARK_Y, w: 52, h: 28 }, text: String(day) };
  return rec.has('mark') ? { type: 'set', id: 'mark', patch } : { type: 'add', item: { id: 'mark', kind: 'token', tone: 'chosen', ...patch } };
};
// 배포: 기록 토큰이 from에서 배포 기록 줄로 날아가는 동안 묶음의 카드가 배포 완료로 바뀐다
const ship = (rec: StepRecorder, log: Lane, batch: number[], text: string, from: string) => {
  log.push({ id: `log:${log.ids.length}`, text, tone: 'visited' }, from);
  rec.do(...together(batch.flatMap(shipped), true));
};
const toneAll = (ids: readonly string[], tone: Tone): Action[] => together(ids.map((id): Action => ({ type: 'set', id, patch: { tone } })));

const DAYS_CAPTION = '기능마다 ⌈(100 − 진도) ÷ 속도⌉로 배포까지 남은 날을 구합니다. 속도가 모두 1이라 남은 진도가 곧 남은 날입니다.';

/* ------------------------------------------------------------------ */
/* 정석 한 번 훑기: 비교하기 → 묶기 또는 배포하기                        */
/* ------------------------------------------------------------------ */

function singlePass(): Visualization {
  const rec = new StepRecorder(board('배포일'));
  const log = new Lane(rec, LOG);
  const answer: number[] = [];
  let deployDay = 0; // 0이면 아직 정하지 않음(day, count도 같다)
  let day = 0;
  let count = 0;
  let seen = 0; // 살펴본 기능 수
  let batch: number[] = []; // 지금 묶음의 기능 번호
  // 변수와 일의 양은 단계가 끝났을 때의 값이다
  const meta = () => ({
    work: seen,
    variables: { days: list(DAYS), deploy_day: deployDay || '-', day: day || '-', count: count || '-', answer: list(answer) },
  });

  rec.step({ title: `배포까지 남은 날 구하기: ${list(DAYS)}`, codeHighlights: SINGLE_AT.days, ...meta() });
  rec.phase('남은 날 계산', DAYS_CAPTION);
  rec.do(...writeDays(), wait(1100));

  [deployDay, count, seen, batch] = [DAYS[0], 1, 1, [0]];
  rec.step({ title: `${ro(name(0))} 첫 묶음 시작: 배포일 ${deployDay}일`, codeHighlights: SINGLE_AT.first, ...meta() });
  rec.phase('첫 묶음', `맨 앞 ${josa(name(0), '이', '가')} 끝나는 ${deployDay}일째가 첫 배포일입니다. 이 날이 묶음의 기준이고 count = 1입니다.`);
  rec.do(...together([markTo(rec, 0, deployDay), ...join(0)]), wait(500));

  for (let i = 1; i < N; i++) {
    const [base, size, group] = [deployDay, count, batch]; // 비교하는 묶음의 배포일, 개수, 기능 번호
    day = DAYS[i];
    seen++;
    const fits = day <= base;
    if (fits) {
      count = size + 1;
      batch = [...group, i];
    } else {
      answer.push(size);
      [deployDay, count, batch] = [day, 1, [i]];
    }

    rec.step({
      title: fits ? `${name(i)}: ${day}일 ≤ ${base}일 → 함께 배포` : `${name(i)}: ${day}일 > ${base}일 → ${base}일째 ${size}개 배포`,
      codeHighlights: fits ? SINGLE_AT.join : SINGLE_AT.ship,
      ...meta(),
    });
    rec.phase('비교하기', `${name(i)}의 남은 날 ${day}일을 지금 묶음의 배포일 ${base}일과 비교합니다.`, SINGLE_AT.compare);
    rec.do(...together([{ type: 'focus', ids: [dayId(i), 'mark'] }, paint(i, 'current')]));
    rec.do({ type: 'arrow', from: 'mark', to: dayId(i), verdict: fits ? 'good' : 'bad', label: `${day}일 ${fits ? '≤' : '>'} ${base}일` }, wait(200));
    if (fits) {
      rec.phase('묶기', `${day}일 ≤ ${base}일이라 ${josa(name(i), '은', '는')} ${base}일째에 이미 끝나 있습니다. 함께 배포하므로 count = ${count}입니다.`, SINGLE_AT.join);
      rec.do(...together(join(i)), wait(450), ...clear());
    } else {
      rec.phase('배포하기', `${day}일 > ${base}일이라 ${josa(name(i), '은', '는')} ${base}일째에 나갈 수 없습니다. 지금 묶음 ${size}개를 배포하고 ${day}일을 새 배포일로 잡습니다.`, SINGLE_AT.ship);
      rec.do({ type: 'unfocus' });
      ship(rec, log, group, `${base}일째 ${size}개`, 'mark');
      rec.do(...together([{ type: 'clearMarks' }, markTo(rec, i, day), ...join(i)]));
    }
  }

  answer.push(count);
  rec.step({ title: `${deployDay}일째 마지막 ${count}개 배포 — 정답 ${list(answer)}`, codeHighlights: SINGLE_AT.last, ...meta(), answer: [...answer], isKeyframe: true });
  rec.phase('마지막 배포', `모든 기능을 확인했습니다. 남은 묶음 ${count}개를 ${deployDay}일째에 배포하면 answer = ${list(answer)}입니다.`);
  ship(rec, log, batch, `${deployDay}일째 ${count}개`, 'mark');
  rec.do(...toneAll(log.ids, 'path'));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 큐: 맨 앞 꺼내기 → 함께 꺼내기 → 배포 (묶음마다 한 단계)          */
/* ------------------------------------------------------------------ */

function queueScan(): Visualization {
  const rec = new StepRecorder(board('first'));
  const log = new Lane(rec, LOG);
  const answer: number[] = [];
  let queue = DAYS; // 큐에 남은 기능들의 남은 날
  let first = 0; // 0이면 아직 꺼내지 않음(count도 같다)
  let count = 0;
  let taken = 0; // 큐에서 꺼낸 기능 수
  const meta = () => ({ work: taken, variables: { queue: list(queue), first: first || '-', count: count || '-', answer: list(answer) } });

  rec.step({ title: `남은 날을 큐에 넣기: ${list(DAYS)}`, codeHighlights: QUEUE_AT.start, ...meta() });
  rec.phase('큐에 넣기', '기능마다 배포까지 남은 날을 구해 앞에서부터 큐에 넣습니다. 속도가 모두 1이라 남은 진도가 곧 남은 날입니다.');
  rec.do(...writeDays(), wait(1100));

  BATCHES.forEach((batch, k) => {
    const [head, ...more] = batch;
    const stop = BATCHES.at(k + 1)?.[0]; // 함께 꺼내기를 멈추게 한 기능(없으면 큐가 빈 것)
    const last = stop === undefined;
    first = DAYS[head];
    count = batch.length;
    taken += batch.length;
    queue = DAYS.slice(taken);
    answer.push(count);
    const names = more.length ? `${name(head)}~${batch.at(-1)! + 1}` : name(head);

    rec.step({
      title: `${names} 꺼내기 → ${first}일째 ${count}개 배포${last ? ` — 정답 ${list(answer)}` : ''}`,
      codeHighlights: last ? QUEUE_AT.done : QUEUE_AT.ship,
      ...meta(),
      ...(last ? { answer: [...answer], isKeyframe: true } : {}),
    });
    rec.phase('맨 앞 꺼내기', `큐 맨 앞에서 ${josa(name(head), '을', '를')} 꺼냅니다. first = ${first}, count = 1입니다.`, QUEUE_AT.first);
    rec.do(...together([markTo(rec, head, first), ...join(head)]), wait(400));

    // 살펴보는 기능: 함께 꺼내는 기능들과, 멈추게 한 기능
    const looked = stop === undefined ? more : [...more, stop];
    const took = more.length ? `${more.map((j) => `${DAYS[j]}일`).join(', ')}을 꺼내고 ` : '';
    const end = stop === undefined ? '큐가 비었습니다.' : `${DAYS[stop]}일 > ${first}일에서 멈춥니다.`;
    rec.phase('함께 꺼내기', looked.length
      ? `큐 맨 앞이 ${first}일 이하인 동안 함께 꺼냅니다. ${took}${end}`
      : '큐가 비어 함께 꺼낼 기능이 없습니다.', QUEUE_AT.more);
    if (looked.length) rec.do({ type: 'focus', ids: [...looked.map(dayId), 'mark'] });
    for (const j of more) rec.do({ type: 'arrow', from: 'mark', to: dayId(j), verdict: 'good', label: `${DAYS[j]}일 ≤ ${first}일` }, ...together(join(j), true));
    if (stop !== undefined) rec.do({ type: 'arrow', from: 'mark', to: dayId(stop), verdict: 'bad', label: `${DAYS[stop]}일 > ${first}일` });
    if (looked.length) rec.do(wait(100));

    rec.phase('배포', last
      ? `마지막 ${count}개를 ${first}일째에 배포하면 큐가 비어 반복을 마칩니다. 답은 ${list(answer)}입니다.`
      : `꺼낸 ${count}개를 ${first}일째에 함께 배포합니다. answer = ${list(answer)}입니다.`, last ? QUEUE_AT.done : QUEUE_AT.ship);
    ship(rec, log, batch, `${first}일째 ${count}개`, 'mark');
    if (looked.length) rec.do(...together(clear(), true)); // 화살표는 기록 토큰이 날아가는 동안 사라진다
    if (last) rec.do(...toneAll(log.ids, 'path'));
  });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 직전과 비교: 직전과 비교하기 → 묶기 또는 배포하기, 오답 확인       */
/* ------------------------------------------------------------------ */

function comparePrevious(): Visualization {
  const rec = new StepRecorder(board());
  const log = new Lane(rec, LOG);
  const answer: number[] = [];
  let cur = 0; // 반복의 i. 0이면 아직 반복 전(count도 같다)
  let count = 0;
  let seen = 0;
  let batch: number[] = [];
  const meta = () => ({
    work: seen,
    variables: { days: list(DAYS), 'days[i - 1]': cur ? DAYS[cur - 1] : '-', 'days[i]': cur ? DAYS[cur] : '-', count: count || '-', answer: list(answer) },
  });
  // 함정에는 배포일이 없어서 배포 기록 토큰은 묶음 맨 앞 카드에서 날아간다
  const shipBatch = (group: number[]) => ship(rec, log, group, `${group.length}개`, dayId(group[0]));

  rec.step({ title: `배포까지 남은 날 구하기: ${list(DAYS)}`, codeHighlights: PREVIOUS_AT.days, ...meta() });
  rec.phase('남은 날 계산', DAYS_CAPTION);
  rec.do(...writeDays(), wait(1100));

  [count, seen, batch] = [1, 1, [0]];
  rec.step({ title: `${ro(name(0))} 첫 묶음 시작`, codeHighlights: PREVIOUS_AT.first, ...meta() });
  rec.phase('첫 묶음', `맨 앞 ${ro(name(0))} 첫 묶음을 시작합니다. count = 1입니다.`);
  rec.do(...together(join(0)), wait(400));

  for (let i = 1; i < N; i++) {
    const [prev, day, size, group] = [DAYS[i - 1], DAYS[i], count, batch];
    const fits = day <= prev;
    cur = i;
    seen++;
    if (fits) {
      count = size + 1;
      batch = [...group, i];
    } else {
      answer.push(size);
      [count, batch] = [1, [i]];
    }
    const label = `${day}일 ${fits ? '≤' : '>'} ${prev}일 → ${fits ? '같은' : '새'} 묶음`;

    rec.step({ title: `${name(i)}: ${label}`, codeHighlights: fits ? PREVIOUS_AT.join : PREVIOUS_AT.ship, ...meta() });
    rec.phase('직전과 비교하기', `${name(i)}의 남은 날 ${day}일을 직전 ${name(i - 1)}의 ${prev}일과 비교합니다.`, PREVIOUS_AT.compare);
    rec.do(...together([{ type: 'focus', ids: [dayId(i - 1), dayId(i)] }, paint(i, 'current')]));
    rec.do({ type: 'arrow', from: dayId(i - 1), to: dayId(i), verdict: fits ? 'good' : 'bad', label }, wait(200));
    if (fits) {
      rec.phase('묶기', `${day}일 ≤ ${prev}일이라 ${josa(name(i), '을', '를')} 지금 묶음에 넣습니다. count = ${count}입니다.`, PREVIOUS_AT.join);
      rec.do(...together(join(i)), wait(300), ...clear());
    } else {
      rec.phase('배포하기', `${day}일 > ${prev}일이라 새 묶음을 시작합니다. 지금 묶음 ${size}개를 배포 기록에 넣고 count = ${ro(1)} 되돌립니다.`, PREVIOUS_AT.ship);
      rec.do({ type: 'unfocus' });
      shipBatch(group);
      rec.do(...together([{ type: 'clearMarks' }, ...join(i)]), wait(200));
    }
  }

  answer.push(count);
  const truth = BATCHES.map((b) => b.length);
  rec.step({ title: `오답 확인: ${list(answer)}, 정답은 ${list(truth)}`, codeHighlights: PREVIOUS_AT.last, ...meta(), answer: [...answer], isKeyframe: true });
  rec.phase('마지막 배포', `반복이 끝났습니다. 남은 ${count}개까지 넣으면 answer = ${list(answer)}입니다.`);
  shipBatch(batch);
  rec.do(wait(400));
  rec.phase('오답 확인', '기준은 직전 기능이 아니라 지금 묶음의 배포일이어야 합니다.');
  rec.do(...toneAll(log.ids, 'bad'));
  const right = { x: LOG_BG.x + LOG_BG.w + 12, y: LOG.y, w: 140, h: LOG.slotH }; // 배포 기록 줄 바로 오른쪽
  rec.do({ type: 'add', item: { id: 'truth', kind: 'token', rect: right, tone: 'good', text: `정답은 ${list(truth)}` } });
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'feature-development',
  title: '기능개발',
  level: 2,
  category: 'stack-queue',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42586',
  description: {
    summary:
      '기능은 진도가 100%가 되어야 배포할 수 있고, 뒤 기능이 먼저 끝나도 앞 기능이 배포될 때 함께 배포됩니다. 작업 진도와 하루 개발 속도가 주어질 때 배포마다 몇 개의 기능이 나가는지 구합니다.',
    rules: [
      '작업 개수(progresses, speeds의 길이)는 100개 이하',
      '작업 진도는 100 미만, 작업 속도는 100 이하의 자연수',
      '배포는 하루에 한 번, 하루의 끝에 이루어짐',
      '진도 95%, 속도 4%라면 2일 뒤에 배포됨',
    ],
    examples: [
      { input: 'progresses = [93, 30, 55], speeds = [1, 30, 5]', output: '[2, 1]' },
      { input: 'progresses = [95, 90, 99, 99, 80, 99], speeds = [1, 1, 1, 1, 1, 1]', output: '[1, 3, 2]' },
    ],
  },
  keyIntuitions: [
    '기능마다 배포까지 걸리는 날을 먼저 구합니다: ⌈(100 − 진도) ÷ 속도⌉. 첫 예제는 [7, 3, 9]일입니다.',
    '뒤 기능이 먼저 끝나도 앞 기능이 나갈 때까지 기다립니다. 그래서 묶음의 기준은 그 묶음 맨 앞 기능의 완료일입니다.',
    '기준일보다 늦게 끝나는 기능을 만나면 지금 묶음을 배포하고, 그 기능의 완료일로 새 묶음을 시작합니다.',
  ],
  demo: { input: [PROGRESSES, SPEEDS], label: 'progresses = [95, 97, 96, 98, 94, 99, 93], speeds = 모두 1' },
  workUnit: '살펴본 기능 수',
  approaches: [
    {
      id: 'feature-single-pass',
      name: '배포일 기준으로 한 번 훑기',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '남은 날을 미리 구한 뒤 반복문 한 번으로 묶음을 세는 가장 간결한 풀이입니다.',
      pros: [
        '배열을 한 번만 훑으므로 O(N)입니다.',
        '변수 두 개(배포일, 개수)만으로 상태를 관리합니다.',
        '날짜를 하루씩 흘려보낼 필요가 없습니다.',
      ],
      cons: ['올림 나눗셈 ⌈(100 − p) ÷ s⌉을 정확히 써야 합니다. Python에서는 -((p - 100) // s)로도 쓸 수 있습니다.'],
      whyThisRank:
        '남은 날만 알면 시뮬레이션 없이 "기준일 이하면 같은 묶음"이라는 비교 하나로 끝납니다. 코드가 짧아 실수할 곳이 적습니다.',
      code: SINGLE,
      visualize: singlePass,
    },
    {
      id: 'feature-queue',
      name: '큐에서 앞부터 꺼내기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '큐의 FIFO 동작을 그대로 옮긴 풀이로, 정석과 결과와 복잡도가 같습니다.',
      pros: [
        '맨 앞 기능을 꺼낼 때 이미 끝난 뒤 기능을 함께 꺼내는 구조가 문제 설명과 그대로 맞습니다.',
        '"스택/큐" 유형을 연습하기에 좋습니다.',
      ],
      cons: [
        'JavaScript에는 덱이 없어 shift()를 쓰면 꺼낼 때마다 O(N)이 듭니다. 이 문제는 N ≤ 100이라 괜찮지만, 머리 인덱스로 꺼내는 습관이 안전합니다.',
      ],
      whyThisRank: '동작과 복잡도는 정석과 같습니다. 다만 같은 일을 하는 코드가 조금 더 길어 대안으로 둡니다.',
      code: QUEUE,
      visualize: queueScan,
    },
    {
      id: 'feature-compare-previous',
      name: '직전 기능하고만 비교하기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '복잡도는 같지만 묶음 기준을 잘못 잡아 오답이 나옵니다.',
      pros: ['코드 모양이 정석 풀이와 거의 같습니다.'],
      cons: [
        '남은 날이 [5, 3, 4]이면 4를 직전 값 3과 비교해 새 묶음으로 나눕니다. 실제로는 5일째에 셋이 함께 나가므로 정답 [3]이 아니라 [2, 1]이 나옵니다.',
        '문제의 두 예제는 우연히 통과해서 실수를 알아채기 어렵습니다.',
      ],
      whyThisRank:
        '뒤 기능은 앞 기능이 배포될 때까지 기다리므로, 비교 기준은 직전 기능이 아니라 지금 묶음의 배포일(맨 앞 기능의 완료일)이어야 합니다.',
      code: PREVIOUS,
      visualize: comparePrevious,
    },
  ],
  checks: {
    cases: [
      { args: [[93, 30, 55], [1, 30, 5]], expected: [2, 1] },
      { args: [[95, 90, 99, 99, 80, 99], [1, 1, 1, 1, 1, 1]], expected: [1, 3, 2] },
      { args: [[95, 97, 96], [1, 1, 1]], expected: [3] },
      { args: [[99], [1]], expected: [1] },
      { args: [PROGRESSES, SPEEDS], expected: [4, 2, 1] },
    ],
    // 길이 1~6, progresses 1~99, speeds 1~30
    random: (rand) => {
      const n = 1 + Math.floor(rand() * 6);
      const progresses = Array.from({ length: n }, () => 1 + Math.floor(rand() * 99));
      const speeds = Array.from({ length: n }, () => 1 + Math.floor(rand() * 30));
      return [progresses, speeds];
    },
  },
};

export default problem;
