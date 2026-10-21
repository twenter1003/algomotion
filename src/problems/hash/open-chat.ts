// 오픈채팅방: 정석 첫 순회로 마지막 닉네임 사전을 만들고 두 번째 순회로 메시지 출력하기, 대안 닉네임이 바뀔 때마다 앞선 메시지를 모두 고치기, 함정 당시 닉네임으로 바로 문장 만들기를 같은 장면에서 움직인다.
// 장면은 왼쪽에 기록(record) 5줄, 오른쪽 위에 유저 아이디 → 닉네임 사전 표, 오른쪽 아래에 출력 메시지 상자다.
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { lines, together } from '../shared.ts';

type Lines = Record<Language, number[]>;

// 원문 예제. uid1234는 Muzi → Prodo, uid4567은 Prodo → Ryan으로 바뀐다.
const RECORD = [
  'Enter uid1234 Muzi',
  'Enter uid4567 Prodo',
  'Leave uid1234',
  'Enter uid1234 Prodo',
  'Change uid4567 Ryan',
];
const N = RECORD.length;
const UIDS = ['uid1234', 'uid4567'];
const RIGHT = [
  'Prodo님이 들어왔습니다.',
  'Ryan님이 들어왔습니다.',
  'Prodo님이 나갔습니다.',
  'Prodo님이 들어왔습니다.',
];
const dictText = (m: Map<string, string>) =>
  `{${[...m].map(([k, v]) => `${k}: "${v}"`).join(', ')}}`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const TWO_PASS = {
  python: `def solution(record):
    nick = {}
    for line in record:                         # 1차 순회: 마지막 닉네임만 사전에 기록
        parts = line.split()
        if parts[0] != "Leave":                 # Enter와 Change일 때 닉네임 갱신
            nick[parts[1]] = parts[2]

    answer = []
    for line in record:                         # 2차 순회: 확정된 닉네임으로 문장 생성
        parts = line.split()
        if parts[0] == "Enter":
            answer.append(f"{nick[parts[1]]}님이 들어왔습니다.")
        elif parts[0] == "Leave":
            answer.append(f"{nick[parts[1]]}님이 나갔습니다.")
    return answer`,
  javascript: `function solution(record) {
  const nick = new Map();
  for (const line of record) { // 1차 순회: 마지막 닉네임만 사전에 기록
    const [cmd, uid, name] = line.split(' ');
    if (cmd !== 'Leave') nick.set(uid, name); // Enter와 Change일 때 닉네임 갱신
  }

  const answer = [];
  for (const line of record) { // 2차 순회: 확정된 닉네임으로 문장 생성
    const [cmd, uid] = line.split(' ');
    if (cmd === 'Enter') answer.push(\`\${nick.get(uid)}님이 들어왔습니다.\`);
    else if (cmd === 'Leave') answer.push(\`\${nick.get(uid)}님이 나갔습니다.\`);
  }
  return answer;
}`,
};
const TWO_PASS_AT = {
  pass1Loop: lines(TWO_PASS, ['for line in record:                         # 1차 순회', 'parts = line.split()'],
    ['for (const line of record) { // 1차 순회', 'const [cmd, uid, name] = line.split']),
  pass1Save: lines(TWO_PASS, ['if parts[0] != "Leave":', 'nick[parts[1]] = parts[2]'],
    ["if (cmd !== 'Leave') nick.set(uid, name)"]),
  pass2Enter: lines(TWO_PASS, ['for line in record:                         # 2차 순회', 'if parts[0] == "Enter":', '님이 들어왔습니다.'],
    ['for (const line of record) { // 2차 순회', "if (cmd === 'Enter') answer.push"]),
  pass2Leave: lines(TWO_PASS, ['for line in record:                         # 2차 순회', 'elif parts[0] == "Leave":', '님이 나갔습니다.'],
    ['for (const line of record) { // 2차 순회', "else if (cmd === 'Leave') answer.push"]),
  done: lines(TWO_PASS, ['return answer'], ['return answer']),
};

const REWRITE = {
  python: `def solution(record):
    nick = {}
    events = []                                 # (유저 아이디, 동작 문구)
    answer = []

    for line in record:
        parts = line.split()
        cmd, uid = parts[0], parts[1]
        if cmd != "Leave":
            nick[uid] = parts[2]
        if cmd == "Enter":
            events.append((uid, "님이 들어왔습니다."))
        elif cmd == "Leave":
            events.append((uid, "님이 나갔습니다."))
        # 기록 하나를 처리할 때마다 지금까지의 메시지 전체를 다시 만든다
        answer = [nick[u] + suffix for u, suffix in events]
    return answer`,
  javascript: `function solution(record) {
  const nick = new Map();
  const events = []; // [유저 아이디, 동작 문구]
  let answer = [];

  for (const line of record) {
    const [cmd, uid, name] = line.split(' ');
    if (cmd !== 'Leave') nick.set(uid, name);
    if (cmd === 'Enter') events.push([uid, '님이 들어왔습니다.']);
    else if (cmd === 'Leave') events.push([uid, '님이 나갔습니다.']);
    // 기록 하나를 처리할 때마다 지금까지의 메시지 전체를 다시 만든다
    answer = events.map(([u, suffix]) => nick.get(u) + suffix);
  }
  return answer;
}`,
};
const REWRITE_AT = {
  step: lines(REWRITE, ['for line in record:', 'if cmd != "Leave":', 'nick[uid] = parts[2]'],
    ['for (const line of record)', "if (cmd !== 'Leave') nick.set(uid, name)"]),
  rebuild: lines(REWRITE, ['answer = [nick[u] + suffix for u, suffix in events]'],
    ['answer = events.map(([u, suffix]) => nick.get(u) + suffix)']),
  done: lines(REWRITE, ['return answer'], ['return answer']),
};

const IMMEDIATE = {
  python: `# 주의: 당시 닉네임으로 바로 문장을 만들고 이후 변경을 반영하지 않아 틀리는 풀이입니다
def solution(record):
    nick = {}
    answer = []
    for line in record:
        parts = line.split()
        cmd, uid = parts[0], parts[1]
        if cmd == "Enter":
            nick[uid] = parts[2]
            answer.append(f"{nick[uid]}님이 들어왔습니다.")  # 당시 닉네임으로 바로 고정!
        elif cmd == "Leave":
            answer.append(f"{nick[uid]}님이 나갔습니다.")
        elif cmd == "Change":
            nick[uid] = parts[2]                            # 이전 문장은 바뀌지 않음
    return answer`,
  javascript: `// 주의: 당시 닉네임으로 바로 문장을 만들고 이후 변경을 반영하지 않아 틀리는 풀이입니다
function solution(record) {
  const nick = new Map();
  const answer = [];
  for (const line of record) {
    const [cmd, uid, name] = line.split(' ');
    if (cmd === 'Enter') {
      nick.set(uid, name);
      answer.push(\`\${nick.get(uid)}님이 들어왔습니다.\`); // 당시 닉네임으로 바로 고정!
    } else if (cmd === 'Leave') {
      answer.push(\`\${nick.get(uid)}님이 나갔습니다.\`);
    } else if (cmd === 'Change') {
      nick.set(uid, name); // 이전 문장은 바뀌지 않음
    }
  }
  return answer;
}`,
};
const IMMEDIATE_AT = {
  enter: lines(IMMEDIATE, ['if cmd == "Enter":', 'nick[uid] = parts[2]', '님이 들어왔습니다.'],
    ["if (cmd === 'Enter')", 'nick.set(uid, name)', '님이 들어왔습니다.']),
  leave: lines(IMMEDIATE, ['elif cmd == "Leave":', '님이 나갔습니다.'],
    ["} else if (cmd === 'Leave')", '님이 나갔습니다.']),
  change: lines(IMMEDIATE, ['elif cmd == "Change":', 'nick[uid] = parts[2]'],
    ["} else if (cmd === 'Change')", 'nick.set(uid, name)']),
  done: lines(IMMEDIATE, ['return answer'], ['return answer']),
};

const union = (...hs: Lines[]): Lines => ({
  python: [...new Set(hs.flatMap((h) => h.python))].sort((a, b) => a - b),
  javascript: [...new Set(hs.flatMap((h) => h.javascript))].sort((a, b) => a - b),
});

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 620;
const H = 316;
const recRect = (i: number): Rect => ({ x: 0, y: 34 + i * 52, w: 216, h: 42 });
const userRect = (u: number): Rect => ({ x: 236 + u * 188, y: 34, w: 176, h: 54 });
const msgRect = (m: number): Rect => ({ x: 240, y: 136 + m * 40, w: 360, h: 32 });

const recId = (i: number) => `rec:${i}`;
const userId = (u: number) => `user:${u}`;
const msgId = (m: number) => `msg:${m}`;

function board(): Scene {
  const items: Item[] = [
    { id: 'rec:head', kind: 'text', rect: { x: 0, y: 6, w: 216, h: 22 }, text: '기록 (record)' },
    { id: 'dict:head', kind: 'text', rect: { x: 236, y: 6, w: 364, h: 22 }, text: '닉네임 사전 (nick)' },
    { id: 'msg:head', kind: 'text', rect: { x: 236, y: 102, w: 364, h: 22 }, text: '출력 메시지 (answer)' },
    { id: 'msg:bg', kind: 'zone', rect: { x: 232, y: 128, w: 376, h: 176 } },
  ];
  RECORD.forEach((line, i) => {
    items.push({ id: recId(i), kind: 'token', rect: recRect(i), tone: 'plain', text: line });
  });
  UIDS.forEach((uid, u) => {
    items.push({ id: userId(u), kind: 'cell', rect: userRect(u), tone: 'plain', text: '-', tag: uid });
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석 2차 순회: 1차 순회로 마지막 닉네임 확정 → 2차 순회로 문장 조립        */
/* ------------------------------------------------------------------ */

function twoPassDict(): Visualization {
  const rec = new StepRecorder(board());
  const nick = new Map<string, string>();
  const answer: string[] = [];
  let checked = 0;
  let phaseName = '1차(닉네임)';
  let lineVar = '-';
  const meta = () => ({
    work: checked,
    variables: { 단계: phaseName, line: lineVar, nick: dictText(nick), '메시지 수': answer.length },
  });

  for (let i = 0; i < N; i++) {
    const line = RECORD[i];
    const [cmd, uid, name] = line.split(' ');
    const u = UIDS.indexOf(uid);
    const prev = nick.get(uid);
    if (cmd !== 'Leave') nick.set(uid, name);
    checked += 1;
    lineVar = line;

    rec.step({
      title: `1차 순회 #${i + 1}: ${cmd === 'Leave' ? `${uid} 퇴장 — 닉네임 그대로` : `${uid} → "${name}"${prev ? ` (${prev} 덮어쓰기)` : ''}`}`,
      codeHighlights: cmd === 'Leave' ? TWO_PASS_AT.pass1Loop : union(TWO_PASS_AT.pass1Loop, TWO_PASS_AT.pass1Save),
      ...meta(),
    });
    rec.phase('기록 읽기', `1차 순회: "${line}" 기록을 읽습니다.`, TWO_PASS_AT.pass1Loop);
    rec.do(paint(recId(i), 'current'), wait(200));

    if (cmd === 'Leave') {
      rec.phase('건너뛰기', 'Leave에는 새 닉네임이 없으므로 사전을 바꾸지 않고 넘어갑니다.', TWO_PASS_AT.pass1Loop);
      rec.do(paint(recId(i), 'visited'), wait(200));
    } else {
      rec.phase(
        '닉네임 갱신',
        prev
          ? `${uid}의 닉네임을 "${prev}"에서 "${name}"으로 덮어씁니다.`
          : `${uid}의 닉네임 "${name}"을 사전에 기록합니다.`,
        TWO_PASS_AT.pass1Save,
      );
      rec.do(
        { type: 'focus', ids: [recId(i), userId(u)] },
        { type: 'arrow', from: recId(i), to: userId(u), verdict: prev ? 'good' : 'new', label: prev ? `${prev}→${name}` : name },
        { type: 'set', id: userId(u), patch: { text: name, tone: 'chosen' }, pop: true },
      );
      rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }, paint(recId(i), 'visited')]));
    }
  }

  phaseName = '2차(메시지)';
  let mIdx = 0;
  for (let i = 0; i < N; i++) {
    const line = RECORD[i];
    const [cmd, uid] = line.split(' ');
    if (cmd === 'Change') continue;
    const u = UIDS.indexOf(uid);
    const finalName = nick.get(uid)!;
    const msg = `${finalName}님이 ${cmd === 'Enter' ? '들어왔습니다.' : '나갔습니다.'}`;
    const slot = mIdx++;
    answer.push(msg);
    checked += 1;
    lineVar = line;

    rec.step({
      title: `2차 순회: ${cmd} ${uid} → "${msg}"`,
      codeHighlights: cmd === 'Enter' ? TWO_PASS_AT.pass2Enter : TWO_PASS_AT.pass2Leave,
      ...meta(),
    });
    rec.phase(
      '문장 만들기',
      `사전에서 ${uid}의 최종 닉네임 "${finalName}"을 꺼내 "${msg}"를 추가합니다.`,
      cmd === 'Enter' ? TWO_PASS_AT.pass2Enter : TWO_PASS_AT.pass2Leave,
    );
    rec.do(
      paint(recId(i), 'current'),
      { type: 'focus', ids: [recId(i), userId(u)] },
      { type: 'arrow', from: userId(u), to: recId(i), verdict: 'good', label: finalName },
      { type: 'add', item: { id: msgId(slot), kind: 'token', rect: msgRect(slot), tone: 'good', text: msg }, from: userId(u) },
    );
    rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }, paint(recId(i), 'chosen')]));
  }

  rec.step({
    title: `메시지 ${answer.length}개 완성 (총 ${checked}번 확인)`,
    codeHighlights: TWO_PASS_AT.done,
    ...meta(),
    answer: [...answer],
    isKeyframe: true,
  });
  rec.phase('정답', `1차 순회로 마지막 닉네임을 확정하고 2차 순회로 문장을 만들어 총 ${checked}번의 확인으로 끝났습니다.`, TWO_PASS_AT.done);
  rec.do(...together(answer.map((_, m) => paint(msgId(m), 'path'))), wait(500));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 매번 앞선 메시지 고치기: 기록마다 지금까지의 메시지 전체 다시 생성    */
/* ------------------------------------------------------------------ */

function rewriteEveryTime(): Visualization {
  const rec = new StepRecorder(board());
  const nick = new Map<string, string>();
  const events: [string, string][] = [];
  let answer: string[] = [];
  let checked = 0;
  let lineVar = '-';
  const meta = () => ({
    work: checked,
    variables: { line: lineVar, nick: dictText(nick), '다시 쓴 메시지': events.length },
  });

  for (let i = 0; i < N; i++) {
    const line = RECORD[i];
    const [cmd, uid, name] = line.split(' ');
    const u = UIDS.indexOf(uid);
    if (cmd !== 'Leave') nick.set(uid, name);
    const added = cmd === 'Enter' || cmd === 'Leave';
    if (cmd === 'Enter') events.push([uid, '님이 들어왔습니다.']);
    else if (cmd === 'Leave') events.push([uid, '님이 나갔습니다.']);
    answer = events.map(([eu, suffix]) => `${nick.get(eu)!}${suffix}`);
    checked += 1 + events.length;
    lineVar = line;

    rec.step({
      title: `#${i + 1} (${line}) 처리 후 메시지 ${events.length}개 전체 다시 생성`,
      codeHighlights: union(REWRITE_AT.step, REWRITE_AT.rebuild),
      ...meta(),
    });
    rec.phase('기록 반영', `"${line}"을 처리하고 지금까지 쌓인 메시지 ${events.length}개를 처음부터 다시 만듭니다.`, union(REWRITE_AT.step, REWRITE_AT.rebuild));
    const acts: Action[] = [paint(recId(i), 'current')];
    if (cmd !== 'Leave') {
      acts.push({ type: 'set', id: userId(u), patch: { text: name, tone: 'chosen' }, pop: true });
    }
    answer.forEach((msg, m) => {
      if (added && m === answer.length - 1 && !rec.has(msgId(m))) {
        acts.push({ type: 'add', item: { id: msgId(m), kind: 'token', rect: msgRect(m), tone: 'chosen', text: msg }, from: recId(i) });
      } else {
        acts.push({ type: 'set', id: msgId(m), patch: { text: msg, tone: 'chosen' }, pop: true });
      }
    });
    rec.do(...together(acts), wait(300), paint(recId(i), 'visited'));
  }

  rec.step({
    title: `완성 (총 ${checked}번 확인 — 정석은 9번)`,
    codeHighlights: REWRITE_AT.done,
    ...meta(),
    answer: [...answer],
    isKeyframe: true,
  });
  rec.phase('정답', `답은 같지만, 기록마다 지금까지의 메시지 배열 전체를 다시 만들어 ${checked}번(정석은 9번) 확인했습니다.`, REWRITE_AT.done);
  rec.do(...together(answer.map((_, m) => paint(msgId(m), 'path'))), wait(500));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 당시 닉네임으로 고정: 한 번에 문장을 만들어 이후 변경이 누락됨        */
/* ------------------------------------------------------------------ */

function immediateFormat(): Visualization {
  const rec = new StepRecorder(board());
  const nick = new Map<string, string>();
  const answer: string[] = [];
  let checked = 0;
  let lineVar = '-';
  const meta = () => ({
    work: checked,
    variables: { line: lineVar, nick: dictText(nick), '메시지 수': answer.length },
  });

  let mIdx = 0;
  for (let i = 0; i < N; i++) {
    const line = RECORD[i];
    const [cmd, uid, name] = line.split(' ');
    const u = UIDS.indexOf(uid);
    checked += 1;
    lineVar = line;

    if (cmd === 'Enter') {
      nick.set(uid, name);
      const msg = `${name}님이 들어왔습니다.`;
      const slot = mIdx++;
      answer.push(msg);

      rec.step({
        title: `#${i + 1} Enter: "${msg}"를 바로 문자열로 고정`,
        codeHighlights: IMMEDIATE_AT.enter,
        ...meta(),
      });
      rec.phase('즉시 문장 생성', `${uid}의 당시 닉네임 "${name}"으로 문장을 바로 만들어 넣습니다. 이전에 만든 문장은 고치지 않습니다.`, IMMEDIATE_AT.enter);
      rec.do(
        paint(recId(i), 'current'),
        { type: 'set', id: userId(u), patch: { text: name, tone: 'bad' }, pop: true },
        { type: 'add', item: { id: msgId(slot), kind: 'token', rect: msgRect(slot), tone: i === 0 ? 'bad' : 'chosen', text: msg }, from: recId(i) },
        wait(250),
        paint(recId(i), 'visited'),
      );
    } else if (cmd === 'Leave') {
      const curName = nick.get(uid)!;
      const msg = `${curName}님이 나갔습니다.`;
      const slot = mIdx++;
      answer.push(msg);

      rec.step({
        title: `#${i + 1} Leave: 당시 닉네임 "${curName}"으로 퇴장 문장 고정`,
        codeHighlights: IMMEDIATE_AT.leave,
        ...meta(),
      });
      rec.phase('즉시 문장 생성', `${uid}의 현재 닉네임 "${curName}"으로 퇴장 문장을 바로 만듭니다.`, IMMEDIATE_AT.leave);
      rec.do(
        paint(recId(i), 'current'),
        { type: 'add', item: { id: msgId(slot), kind: 'token', rect: msgRect(slot), tone: 'bad', text: msg }, from: recId(i) },
        wait(250),
        paint(recId(i), 'visited'),
      );
    } else {
      nick.set(uid, name);
      rec.step({
        title: `#${i + 1} Change: 사전만 "${name}"으로 바뀌고 2번째 문장은 "Prodo" 그대로 남음!`,
        codeHighlights: IMMEDIATE_AT.change,
        ...meta(),
      });
      rec.phase('이전 문장 미반영', `사전의 ${uid}는 "${name}"으로 바뀌었지만, 이미 문자열로 만들어 둔 앞선 문장들은 바뀌지 않습니다.`, IMMEDIATE_AT.change);
      rec.do(
        paint(recId(i), 'current'),
        { type: 'set', id: userId(u), patch: { text: name, tone: 'bad' }, pop: true },
        paint(msgId(1), 'bad'),
        wait(250),
        paint(recId(i), 'visited'),
      );
    }
  }

  rec.step({
    title: '오답 확인: 앞선 3개 문장에 옛 닉네임(Muzi, Prodo)이 그대로 남음',
    codeHighlights: IMMEDIATE_AT.done,
    ...meta(),
    answer: [...answer],
    isKeyframe: true,
  });
  rec.phase(
    '오답 확인',
    `1~3번째 문장이 옛 닉네임("Muzi", "Prodo")으로 남아 오답입니다. 정답은 첫 문장부터 "${RIGHT[0]}", "${RIGHT[1]}", "${RIGHT[2]}"여야 합니다.`,
    IMMEDIATE_AT.done,
  );
  rec.do(
    ...together([paint(msgId(0), 'bad'), paint(msgId(1), 'bad'), paint(msgId(2), 'bad')]),
    wait(600),
  );
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'open-chat',
  title: '오픈채팅방',
  level: 2,
  category: 'hash',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42888',
  description: {
    summary:
      '오픈채팅방에서 유저가 들어오고(Enter) 나가거나(Leave) 닉네임을 바꾸면(Change), 이전에 출력된 메시지의 닉네임까지 모두 마지막 닉네임으로 바뀝니다. 기록 배열 record가 주어질 때 최종적으로 화면에 보이는 메시지 배열을 구합니다.',
    rules: [
      'record의 길이는 1 이상 100,000 이하',
      '각 원소는 "Enter [유저 아이디] [닉네임]", "Leave [유저 아이디]", "Change [유저 아이디] [닉네임]" 중 하나',
      '유저 아이디와 닉네임은 알파벳 대소문자와 숫자로 이루어진 길이 1~10 문자열',
    ],
    examples: [
      {
        input: 'record = ["Enter uid1234 Muzi", "Enter uid4567 Prodo", "Leave uid1234", "Enter uid1234 Prodo", "Change uid4567 Ryan"]',
        output: '["Prodo님이 들어왔습니다.", "Ryan님이 들어왔습니다.", "Prodo님이 나갔습니다.", "Prodo님이 들어왔습니다."]',
      },
    ],
  },
  keyIntuitions: [
    '중간에 닉네임이 몇 번 바뀌든 최종 화면에 찍히는 이름은 유저마다 "맨 마지막 닉네임" 하나뿐입니다.',
    '따라서 문장을 바로 만들지 말고, 1차 순회에서 {유저 아이디 → 마지막 닉네임} 사전을 완성한 뒤 2차 순회에서 문장을 조립하면 앞선 문장을 고칠 일이 없습니다.',
    'Leave 기록에는 닉네임이 들어 있지 않으므로 1차 순회에서 건너뛰고, Change 기록은 화면에 문장을 남기지 않으므로 2차 순회에서 건너뜁니다.',
  ],
  demo: {
    input: [RECORD],
    label: 'record = ["Enter uid1234 Muzi", "Enter uid4567 Prodo", "Leave uid1234", "Enter uid1234 Prodo", "Change uid4567 Ryan"]',
  },
  workUnit: '기록이나 메시지를 확인한 횟수',
  approaches: [
    {
      id: 'open-chat-two-pass',
      name: '마지막 닉네임 사전 만든 뒤 두 번째 순회로 출력',
      rank: 'BEST',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '1차 순회로 유저별 최종 닉네임을 사전에 확정하고, 2차 순회로 메시지를 한 번에 만드는 풀이입니다.',
      pros: [
        '기록 배열을 두 번만 훑으므로 기록이 10만 개여도 O(N)에 끝납니다.',
        '이미 만든 문자열을 다시 찾아 바꾸는 복잡한 처리가 전혀 필요 없습니다.',
      ],
      cons: [
        'Enter/Leave/Change 세 명령어가 1차 순회와 2차 순회에서 각각 어떻게 쓰이는지 구분해야 합니다.',
      ],
      whyThisRank:
        '"변하는 이름(닉네임)"과 "변하지 않는 식별자(유저 아이디)"를 분리해 해시 사전으로 연결하는 가장 정석적인 2-pass 풀이입니다.',
      code: TWO_PASS,
      visualize: twoPassDict,
    },
    {
      id: 'open-chat-rewrite',
      name: '기록마다 지금까지의 메시지 전체를 다시 만들기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(N)',
      verdict: '기록을 한 줄 처리할 때마다 지금까지 쌓인 메시지 배열 전체를 새로 만드는 풀이로, 중복 작업이 많습니다.',
      pros: [
        '어느 시점에 멈춰도 그 시점까지의 채팅방 화면 상태를 바로 볼 수 있습니다.',
      ],
      cons: [
        '기록이 N개면 1 + 2 + … + N번 메시지를 다시 만들어 O(N²) 시간이 걸립니다. N = 100,000이면 시간 초과가 납니다.',
        '결국 마지막 닉네임만 쓰이는데 중간 상태의 문자열을 계속 만들었다 버리는 낭비가 있습니다.',
      ],
      whyThisRank:
        '문제에서 요구하는 것은 중간 화면이 아니라 모든 기록이 끝난 뒤의 최종 화면뿐이므로, 마지막에 한 번만 문장을 조립하는 정석이 훨씬 효율적입니다.',
      code: REWRITE,
      visualize: rewriteEveryTime,
    },
    {
      id: 'open-chat-immediate',
      name: '들어오고 나갈 때 당시 닉네임으로 바로 문장 만들기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      verdict: '입장·퇴장 시점의 닉네임으로 문자열을 바로 고정해 버려서, 나중에 바뀐 닉네임이 이전 메시지에 반영되지 않는 오답 풀이입니다.',
      pros: [
        '닉네임이 한 번도 바뀌지 않는 입력에서는 우연히 맞습니다.',
      ],
      cons: [
        '재입장(Enter)이나 변경(Change)으로 닉네임이 바뀌면 이전에 출력된 메시지가 옛 닉네임 그대로 남습니다.',
      ],
      whyThisRank:
        '"기존에 채팅방에 출력되어 있던 메시지의 닉네임도 전부 변경된다"는 핵심 규칙을 놓치고 한 번의 순회로 문자열까지 완성하려 한 실수입니다.',
      code: IMMEDIATE,
      visualize: immediateFormat,
    },
  ],
  checks: {
    cases: [
      {
        args: [['Enter uid1234 Muzi', 'Enter uid4567 Prodo', 'Leave uid1234', 'Enter uid1234 Prodo', 'Change uid4567 Ryan']],
        expected: [
          'Prodo님이 들어왔습니다.',
          'Ryan님이 들어왔습니다.',
          'Prodo님이 나갔습니다.',
          'Prodo님이 들어왔습니다.',
        ],
      },
      {
        args: [['Enter u1 Alice', 'Change u1 Bob', 'Leave u1']],
        expected: ['Bob님이 들어왔습니다.', 'Bob님이 나갔습니다.'],
      },
      {
        args: [['Enter u1 A', 'Leave u1', 'Enter u1 B']],
        expected: ['B님이 들어왔습니다.', 'B님이 나갔습니다.', 'B님이 들어왔습니다.'],
      },
      {
        args: [['Enter u1 Solo']],
        expected: ['Solo님이 들어왔습니다.'],
      },
    ],
    // 유저 2~3명, 기록 2~7줄(유효한 입퇴장 순서 보장)
    random: (rand) => {
      const uids = ['u1', 'u2', 'u3'];
      const names = ['Kim', 'Lee', 'Park', 'Choi', 'Jung'];
      const inside = new Set<string>();
      const records: string[] = [];
      const len = 2 + Math.floor(rand() * 6);
      while (records.length < len) {
        const u = uids[Math.floor(rand() * uids.length)];
        const name = names[Math.floor(rand() * names.length)];
        if (!inside.has(u)) {
          inside.add(u);
          records.push(`Enter ${u} ${name}`);
        } else if (rand() < 0.5) {
          inside.delete(u);
          records.push(`Leave ${u}`);
        } else {
          records.push(`Change ${u} ${name}`);
        }
      }
      if (!records.some((r) => !r.startsWith('Change'))) {
        records.push('Enter u1 Kim');
      }
      return [records];
    },
  },
};

export default problem;
