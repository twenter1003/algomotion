// 파일명 정렬: 정석 HEAD·NUMBER를 파일마다 한 번씩 추출해 안정 정렬, 대안 비교할 때마다 파일명을 다시 훑어 추출하며 인접 교환 정렬, 함정 NUMBER를 정수로 바꾸지 않고 문자열로 비교를 같은 장면에서 움직인다.
// 장면은 위에 파일 6개 칸(정렬하면 미끄러져 자리를 바꿈), 가운데에 추출한 (HEAD, NUMBER) 키 표시 줄, 아래에 비교 판과 결과 표시다.
import { slots } from '../../engine/layout.ts';
import type { Action, AlgorithmStep, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { lines, together } from '../shared.ts';

const MS_PER_CHAR = 20;
class PacedRecorder extends StepRecorder {
  private caption = '';
  private acts: Action[] = [];
  private keyframe = false;
  override step(meta: Omit<AlgorithmStep, 'phases' | 'scene'>): void {
    this.settle(false);
    this.keyframe = !!meta.isKeyframe;
    super.step(meta);
  }
  override phase(label: string, caption: string, codeHighlights?: Record<Language, number[]>): void {
    this.settle(true);
    super.phase(label, caption, codeHighlights);
    this.caption = caption;
    this.acts = [];
  }
  override do(...actions: Action[]): void {
    super.do(...actions);
    this.acts.push(...actions);
  }
  override finish() {
    this.settle(false);
    return super.finish();
  }
  private settle(more: boolean): void {
    if (!this.caption) return;
    const hold = more ? PHASE_GAP : this.keyframe ? KEYFRAME_TAIL : STEP_TAIL;
    const plan = planStep({ phases: [{ label: '', caption: '', actions: this.acts }] } as unknown as AlgorithmStep).phases[0];
    const busy = Math.max(0, ...plan.actions.map((a) => a.start + a.duration));
    const need = MS_PER_CHAR * [...this.caption].length - hold - busy;
    this.caption = '';
    if (need > 0 && busy + need > plan.end) super.do({ type: 'wait', ms: Math.ceil(need) });
  }
}

// 시각화 입력. 정석과 대안은 ["img1.png", "IMG01.GIF", "img02.png", "img2.JPG", "img10.png", "img12.png"],
// 숫자를 문자열 그대로 비교하는 함정은 ["IMG01.GIF", "img02.png", "img1.png", "img10.png", "img12.png", "img2.JPG"]가 나온다.
const FILES = ['img12.png', 'img10.png', 'img02.png', 'img1.png', 'IMG01.GIF', 'img2.JPG'];
const N = FILES.length;
const PARSED = FILES.map((f, idx) => {
  const m = f.match(/^([^\d]+)(\d{1,5})/)!;
  return { idx, file: f, head: m[1].toLowerCase(), numStr: m[2], num: Number(m[2]) };
});
const BEST_ORDER = [...PARSED]
  .sort((a, b) => a.head.localeCompare(b.head) || a.num - b.num || a.idx - b.idx)
  .map((p) => p.idx);
const TRUTH = BEST_ORDER.map((i) => FILES[i]);
const TRAP_ORDER = [...PARSED]
  .sort((a, b) => a.head.localeCompare(b.head) || (a.numStr < b.numStr ? -1 : a.numStr > b.numStr ? 1 : a.idx - b.idx))
  .map((p) => p.idx);
const TRAP_ANS = TRAP_ORDER.map((i) => FILES[i]);

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const KEY_SORT = {
  python: `import re

def solution(files):
    def sort_key(file):
        m = re.match(r'([^\\d]+)(\\d{1,5})', file)
        head, number = m.group(1), m.group(2)
        return (head.lower(), int(number))   # 소문자 HEAD, 정수 NUMBER

    # Python의 sort/sorted는 안정 정렬이라 동률이면 입력 순서가 유지된다
    return sorted(files, key=sort_key)`,
  javascript: `function solution(files) {
  const parsed = files.map((file, idx) => {
    const [, head, number] = file.match(/^([^\\d]+)(\\d{1,5})/);
    return { file, head: head.toLowerCase(), num: Number(number), idx };
  });
  parsed.sort((a, b) => {
    if (a.head !== b.head) return a.head < b.head ? -1 : 1;
    if (a.num !== b.num) return a.num - b.num;
    return a.idx - b.idx; // 원래 입력 순서 유지
  });
  return parsed.map((p) => p.file);
}`,
};
const KEY_AT = {
  parse: lines(KEY_SORT, ['def sort_key(file):', 'm = re.match', 'return (head.lower(), int(number))'], ['const parsed = files.map', 'const [, head, number] = file.match', 'return { file, head: head.toLowerCase()']),
  sort: lines(KEY_SORT, ['return sorted(files, key=sort_key)'], ['parsed.sort((a, b) => {', 'if (a.head !== b.head)', 'if (a.num !== b.num)']),
  tie: lines(KEY_SORT, ['return sorted(files, key=sort_key)'], ['return a.idx - b.idx;']),
  done: lines(KEY_SORT, ['return sorted(files, key=sort_key)'], ['return parsed.map((p) => p.file)']),
};

const REPARSE_SORT = {
  python: `def parse(file):
    i = 0
    while i < len(file) and not file[i].isdigit():
        i += 1
    j = i
    while j < len(file) and file[j].isdigit() and j - i < 5:
        j += 1
    return file[:i].lower(), int(file[i:j])

def solution(files):
    res = list(files)
    # 이웃한 두 파일을 비교할 때마다 매번 글자를 훑어 HEAD·NUMBER를 다시 뽑는다
    for i in range(len(res)):
        for j in range(len(res) - 1 - i):
            if parse(res[j]) > parse(res[j + 1]):
                res[j], res[j + 1] = res[j + 1], res[j]
    return res`,
  javascript: `function parse(file) {
  let i = 0;
  while (i < file.length && (file[i] < '0' || file[i] > '9')) i++;
  let j = i;
  while (j < file.length && file[j] >= '0' && file[j] <= '9' && j - i < 5) j++;
  return [file.slice(0, i).toLowerCase(), Number(file.slice(i, j))];
}

function solution(files) {
  const res = [...files];
  // 이웃한 두 파일을 비교할 때마다 매번 글자를 훑어 HEAD·NUMBER를 다시 뽑습니다
  for (let i = 0; i < res.length; i++) {
    for (let j = 0; j < res.length - 1 - i; j++) {
      const [ha, na] = parse(res[j]);
      const [hb, nb] = parse(res[j + 1]);
      if (ha > hb || (ha === hb && na > nb)) {
        [res[j], res[j + 1]] = [res[j + 1], res[j]];
      }
    }
  }
  return res;
}`,
};
const REPARSE_AT = {
  init: lines(REPARSE_SORT, ['res = list(files)'], ['const res = [...files]']),
  loop: lines(REPARSE_SORT, ['for i in range(len(res)):', 'for j in range(len(res) - 1 - i):', 'if parse(res[j]) > parse(res[j + 1]):'], ['for (let i = 0; i < res.length; i++)', 'for (let j = 0; j < res.length - 1 - i; j++)', 'const [ha, na] = parse(res[j])']),
  swap: lines(REPARSE_SORT, ['res[j], res[j + 1] = res[j + 1], res[j]'], ['[res[j], res[j + 1]] = [res[j + 1], res[j]]']),
  done: lines(REPARSE_SORT, ['return res'], ['return res']),
};

const STRING_NUM_TRAP = {
  python: `import re

def solution(files):
    def trap_key(file):
        m = re.match(r'([^\\d]+)(\\d{1,5})', file)
        # 함정: NUMBER에 int()를 씌우지 않고 문자열 그대로 비교한다
        return (m.group(1).lower(), m.group(2))

    return sorted(files, key=trap_key)`,
  javascript: `function solution(files) {
  const parsed = files.map((file, idx) => {
    const [, head, number] = file.match(/^([^\\d]+)(\\d{1,5})/);
    // 함정: NUMBER를 Number()로 바꾸지 않고 문자열 그대로 비교합니다
    return { file, head: head.toLowerCase(), numStr: number, idx };
  });
  parsed.sort((a, b) => {
    if (a.head !== b.head) return a.head < b.head ? -1 : 1;
    if (a.numStr !== b.numStr) return a.numStr < b.numStr ? -1 : 1;
    return a.idx - b.idx;
  });
  return parsed.map((p) => p.file);
}`,
};
const TRAP_AT = {
  parse: lines(STRING_NUM_TRAP, ['def trap_key(file):', 'return (m.group(1).lower(), m.group(2))'], ['const parsed = files.map', 'return { file, head: head.toLowerCase(), numStr: number']),
  sort: lines(STRING_NUM_TRAP, ['return sorted(files, key=trap_key)'], ['parsed.sort((a, b) => {', 'if (a.numStr !== b.numStr)']),
};

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const W = 640;
const H = 228;
const fileSlot = slots({ x: 76, y: 34, w: 86, h: 52, gap: 6 });
const keySlot = slots({ x: 76, y: 98, w: 86, h: 28, gap: 6 });
const fileId = (k: number) => `f:${k}`;
const keyId = (k: number) => `k:${k}`;
const STAT_RECT: Rect = { x: 76, y: 140, w: 260, h: 32 };
const ANS_RECT: Rect = { x: 76, y: 182, w: 260, h: 32 };
const TRUTH_RECT: Rect = { x: 348, y: 182, w: 268, h: 32 };

const wait = (ms: number): Action => ({ type: 'wait', ms });
const clear = (...extra: Action[]): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }, ...extra]);
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

function board(): Scene {
  const items: Item[] = [
    { id: 'lab:file', kind: 'text', rect: { x: 6, y: 34, w: 64, h: 52 }, text: '파일명' },
    { id: 'lab:key', kind: 'text', rect: { x: 6, y: 98, w: 64, h: 28 }, tone: 'muted', text: '정렬 키' },
    { id: 'lab:stat', kind: 'text', rect: { x: 6, y: 140, w: 64, h: 32 }, tone: 'muted', text: '상태' },
    { id: 'lab:ans', kind: 'text', rect: { x: 6, y: 182, w: 64, h: 32 }, text: '결과' },
    { id: 'tok:stat', kind: 'token', rect: STAT_RECT, tone: 'plain', text: '파싱 대기' },
    { id: 'tok:ans', kind: 'token', rect: ANS_RECT, tone: 'plain', text: '정렬 전' },
  ];
  FILES.forEach((f, k) => {
    items.push({ id: fileId(k), kind: 'cell', rect: fileSlot(k), tone: 'plain', text: f });
    items.push({ id: keyId(k), kind: 'token', rect: keySlot(k), tone: 'muted', text: '-' });
  });
  return { width: W, height: H, items };
}

/* ------------------------------------------------------------------ */
/* 정석 HEAD·NUMBER 한 번씩 추출 후 안정 정렬                             */
/* ------------------------------------------------------------------ */

function keySortViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const meta = (curFile = '-', key = '-') => ({
    work,
    variables: { file: curFile, key, parsedCount: work },
  });

  for (let k = 0; k < N; k++) {
    const p = PARSED[k];
    work++;
    const keyText = `("${p.head}", ${p.num})`;
    rec.step({ title: `${k + 1}번째 파일 키 추출: ${p.file} → ${keyText}`, codeHighlights: KEY_AT.parse, ...meta(p.file, keyText) });
    rec.phase('추출하기', `"${p.file}"에서 숫자 앞부분 HEAD "${p.head}"와 연속된 숫자 NUMBER ${p.num}(문자열 "${p.numStr}")을 뽑습니다.`, KEY_AT.parse);
    rec.do(...together([
      { type: 'focus', ids: [fileId(k), keyId(k)] },
      paint(fileId(k), 'current'),
      { type: 'set', id: keyId(k), patch: { text: `${p.head} | ${p.num}`, tone: 'chosen' }, pop: true },
      { type: 'set', id: 'tok:stat', patch: { text: `${p.file} → (${p.head}, ${p.num})`, tone: 'chosen' }, pop: true },
    ]), wait(180));
    rec.phase('저장하기', `${k + 1}번째 파일의 정렬 키 ${keyText}와 원래 순서(${k})를 저장합니다.`, KEY_AT.parse);
    rec.do(...clear(paint(fileId(k), 'visited')));
  }

  rec.step({ title: 'HEAD 사전 순 → NUMBER 정수 순으로 정렬', codeHighlights: KEY_AT.sort, ...meta('전체', '비교') });
  rec.phase('정렬하기', '모든 파일의 HEAD가 "img"로 같으므로 NUMBER 정수 값(1 = 1 < 2 = 2 < 10 < 12) 순서로 자리를 옮깁니다.', KEY_AT.sort);
  rec.do(...together([
    ...BEST_ORDER.map((k, slot): Action => ({ type: 'set', id: fileId(k), patch: { rect: fileSlot(slot), tone: 'chosen' } })),
    ...BEST_ORDER.map((k, slot): Action => ({ type: 'set', id: keyId(k), patch: { rect: keySlot(slot), tone: 'chosen' } })),
    { type: 'set', id: 'tok:stat', patch: { text: 'NUMBER: 1, 1, 2, 2, 10, 12', tone: 'good' }, pop: true },
  ]), wait(250));

  rec.step({ title: '동률 파일은 원래 입력 순서 유지 (안정 정렬)', codeHighlights: KEY_AT.tie, ...meta('동률 확인', 'idx 유지') });
  rec.phase('동률 확인', '"img1.png"와 "IMG01.GIF"는 둘 다 ("img", 1)이라 먼저 들어온 "img1.png"가 앞섭니다. "img02.png"와 "img2.JPG"도 마찬가지입니다.', KEY_AT.tie);
  rec.do(...together([
    { type: 'focus', ids: [fileId(3), fileId(4), fileId(2), fileId(5)] },
    paint(fileId(3), 'good'),
    paint(fileId(4), 'good'),
    paint(fileId(2), 'good'),
    paint(fileId(5), 'good'),
  ]));
  rec.do({ type: 'arrow', from: fileId(3), to: fileId(4), verdict: 'good', label: '동률 → 입력 순' }, wait(200));

  rec.step({ title: `정렬 완료 (키 추출 ${work}회)`, codeHighlights: KEY_AT.done, ...meta('완료', '완료'), answer: TRUTH, isKeyframe: true });
  rec.phase('정답', `파일마다 딱 한 번씩만(총 ${work}회) HEAD·NUMBER를 추출해 안정 정렬로 올바른 순서를 구했습니다.`, KEY_AT.done);
  rec.do(...clear(
    ...BEST_ORDER.map((k): Action => paint(fileId(k), 'path')),
    { type: 'set', id: 'tok:ans', patch: { text: 'img1 → IMG01 → img02 → img2…', tone: 'path' }, pop: true },
  ));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 비교할 때마다 다시 파싱하며 인접 교환 정렬                        */
/* ------------------------------------------------------------------ */

function reparseSortViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const order = [...Array(N).keys()];
  const meta = (pass: number | '-', swaps: number | '-') => ({
    work,
    variables: { pass, swaps, parseCalls: work },
  });

  rec.step({ title: '키를 미리 뽑지 않고 인접 비교 시작', codeHighlights: REPARSE_AT.init, ...meta('-', '-') });
  rec.phase('초기화', '정렬 키를 미리 저장하지 않고, 이웃한 두 파일을 비교할 때마다 글자를 처음부터 훑어 HEAD·NUMBER를 다시 파싱합니다.', REPARSE_AT.init);
  rec.do({ type: 'set', id: 'tok:stat', patch: { text: '매 비교마다 parse() 2번 호출', tone: 'chosen' }, pop: true });

  for (let i = 0; i < N - 1; i++) {
    let swaps = 0;
    for (let j = 0; j < N - 1 - i; j++) {
      work += 2;
      const a = PARSED[order[j]];
      const b = PARSED[order[j + 1]];
      if (a.head > b.head || (a.head === b.head && a.num > b.num)) {
        [order[j], order[j + 1]] = [order[j + 1], order[j]];
        swaps++;
      }
    }
    const settledOrig = order[N - 1 - i];
    const settledParsed = PARSED[settledOrig];

    rec.step({
      title: `${i + 1}회전: 비교 ${N - 1 - i}쌍 (파싱 +${(N - 1 - i) * 2}회, 교환 ${swaps}회)`,
      codeHighlights: swaps ? REPARSE_AT.swap : REPARSE_AT.loop,
      ...meta(i + 1, swaps),
    });
    rec.phase('비교 및 재파싱', `${i + 1}회전에서 이웃 ${N - 1 - i}쌍을 비교하며 parse()를 ${(N - 1 - i) * 2}번 호출했습니다(누적 ${work}회).`, REPARSE_AT.loop);
    rec.do(...together([
      ...order.map((k, slot): Action => ({ type: 'set', id: fileId(k), patch: { rect: fileSlot(slot), tone: slot >= N - 1 - i ? 'visited' : 'current' } })),
      ...order.map((k, slot): Action => ({ type: 'set', id: keyId(k), patch: { rect: keySlot(slot), text: `${PARSED[k].head}|${PARSED[k].num}`, tone: 'chosen' } })),
      { type: 'set', id: 'tok:stat', patch: { text: `누적 파싱 ${work}회 (정석은 6회)`, tone: 'chosen' }, pop: true },
    ]), wait(220));

    rec.phase('자리 이동', `이번 회전 끝에 "${settledParsed.file}"의 자리가 확정되었습니다.`, swaps ? REPARSE_AT.swap : REPARSE_AT.loop);
    rec.do(...together(order.map((k, slot): Action => paint(fileId(k), slot >= N - 1 - i ? 'visited' : 'plain'))));
  }

  rec.step({ title: `정렬 완료 (파싱 총 ${work}회)`, codeHighlights: REPARSE_AT.done, ...meta(N, 0), answer: TRUTH, isKeyframe: true });
  rec.phase('정답', `답은 정석과 같지만, 키를 미리 만들어 두지 않아 파일 파싱을 ${work}번이나 반복했습니다(정석은 ${N}번).`, REPARSE_AT.done);
  rec.do(...together([
    ...order.map((k): Action => paint(fileId(k), 'path')),
    { type: 'set', id: 'tok:ans', patch: { text: 'img1 → IMG01 → img02 → img2…', tone: 'path' }, pop: true },
  ]));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 NUMBER를 정수로 바꾸지 않고 문자열 그대로 비교                    */
/* ------------------------------------------------------------------ */

function stringNumTrapViz(): Visualization {
  const rec = new PacedRecorder(board());
  let work = 0;
  const meta = (detail: string) => ({
    work,
    variables: { detail, parsedCount: work },
  });

  for (let k = 0; k < N; k++) {
    const p = PARSED[k];
    work++;
    rec.step({ title: `${k + 1}번째 파일: NUMBER를 문자열 "${p.numStr}" 그대로 저장`, codeHighlights: TRAP_AT.parse, ...meta(`${p.file} → "${p.numStr}"`) });
    rec.phase('문자열 키 추출', `"${p.file}"에서 NUMBER를 정수로 바꾸지 않고 문자열 "${p.numStr}" 그대로 키에 넣습니다.`, TRAP_AT.parse);
    rec.do(...together([
      { type: 'focus', ids: [fileId(k), keyId(k)] },
      paint(fileId(k), 'current'),
      { type: 'set', id: keyId(k), patch: { text: `${p.head}|"${p.numStr}"`, tone: 'bad' }, pop: true },
      { type: 'set', id: 'tok:stat', patch: { text: `문자열 NUMBER: "${p.numStr}"`, tone: 'bad' }, pop: true },
    ]), wait(180));
    rec.phase('키 기록', `정수 ${p.num} 대신 문자열 "${p.numStr}"가 저장되었습니다.`, TRAP_AT.parse);
    rec.do(...clear(paint(fileId(k), 'plain')));
  }

  rec.step({ title: '문자열 NUMBER 사전 순 비교: "01" < "1", "10" < "2"', codeHighlights: TRAP_AT.sort, ...meta('"01" < "10" < "2"') });
  rec.phase('사전 순 왜곡', '문자열로 비교하면 앞자리 0 때문에 "01" < "1"이 되어 IMG01.GIF가 img1.png 앞으로 가고, 첫 글자 "1" < "2" 때문에 img10.png가 img2.JPG 앞으로 갑니다!', TRAP_AT.sort);
  rec.do(...together([
    ...TRAP_ORDER.map((k, slot): Action => ({ type: 'set', id: fileId(k), patch: { rect: fileSlot(slot), tone: 'bad' } })),
    ...TRAP_ORDER.map((k, slot): Action => ({ type: 'set', id: keyId(k), patch: { rect: keySlot(slot), tone: 'bad' } })),
  ]));
  rec.do({ type: 'arrow', from: fileId(1), to: fileId(5), verdict: 'bad', label: '"10" < "2" 오판' }, wait(220));

  rec.step({ title: '오답: IMG01.GIF가 맨 앞, img2.JPG가 맨 뒤', codeHighlights: TRAP_AT.sort, ...meta('오답'), answer: TRAP_ANS, isKeyframe: true });
  rec.phase('오답 확인', 'NUMBER를 정수로 변환하지 않으면 앞자리 0("01" vs "1")과 자릿수 차이("10" vs "2")에서 모두 순서가 뒤집힙니다.', TRAP_AT.sort);
  rec.do(...clear(
    { type: 'set', id: 'tok:ans', patch: { text: '이 방법: IMG01 → img02 → img1…', tone: 'bad' }, pop: true },
    { type: 'add', item: { id: 'tok:truth', kind: 'token', rect: TRUTH_RECT, tone: 'good', text: '정답: img1 → IMG01 → img02…' } },
  ));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'file-name-sort',
  title: '파일명 정렬',
  level: 2,
  category: 'sort',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/17686',
  description: {
    summary:
      '파일명에 포함된 숫자를 반영해 파일명을 정렬합니다. 파일명은 숫자가 아닌 문자로 시작하는 HEAD, 최대 다섯 글자의 연속된 숫자인 NUMBER, 그 뒤의 TAIL 세 부분으로 나뉩니다. HEAD 사전 순(대소문자 구분 없음) → NUMBER의 숫자 값 순 → 원래 입력 순서 유지를 기준으로 정렬합니다.',
    rules: [
      'files는 1,000개 이하의 배열이며, 파일명은 100글자 이하',
      'HEAD는 숫자가 아닌 문자로 1글자 이상이며 대소문자 구분 없이 비교',
      'NUMBER는 1~5글자의 연속된 숫자로, 앞의 0을 무시한 정수 값으로 비교(012와 12는 같음)',
      'HEAD와 NUMBER의 숫자 값까지 같으면 TAIL은 보지 않고 원래 입력 순서를 유지',
    ],
    examples: [
      {
        input: 'files = ["img12.png", "img10.png", "img02.png", "img1.png", "IMG01.GIF", "img2.JPG"]',
        output: '["img1.png", "IMG01.GIF", "img02.png", "img2.JPG", "img10.png", "img12.png"]',
      },
      {
        input: 'files = ["F-5 Freedom Fighter", "B-50 Superfortress", "A-10 Thunderbolt II", "F-14 Tomcat"]',
        output: '["A-10 Thunderbolt II", "B-50 Superfortress", "F-5 Freedom Fighter", "F-14 Tomcat"]',
      },
    ],
  },
  keyIntuitions: [
    '정렬 기준은 오직 (HEAD 소문자, NUMBER 정수 값) 두 가지뿐이고, TAIL은 정렬에 전혀 영향을 주지 않습니다.',
    '"01"과 "1"이 같은 값으로 취급되려면 NUMBER를 반드시 정수(int / Number)로 변환해 비교해야 합니다.',
    'HEAD와 NUMBER가 모두 같을 때 원래 순서를 유지해야 하므로 안정 정렬(또는 원래 인덱스 포함)을 써야 합니다.',
  ],
  demo: {
    input: [FILES],
    label: 'files = ["img12.png", "img10.png", "img02.png", "img1.png", "IMG01.GIF", "img2.JPG"]',
  },
  workUnit: '파일명에서 HEAD·NUMBER를 추출한 횟수',
  approaches: [
    {
      id: 'file-name-head-number',
      name: 'HEAD·NUMBER 한 번 추출 후 안정 정렬',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '파일마다 정규식으로 (소문자 HEAD, 정수 NUMBER) 키를 한 번만 뽑아 두고 안정 정렬하는 정석 풀이입니다.',
      pros: [
        '각 파일에서 문자열 파싱을 딱 한 번씩만(N회) 수행해 가장 빠릅니다.',
        'Python의 기본 정렬과 최신 JS의 Array.prototype.sort(또는 idx 보조 키)로 원래 순서가 깔끔하게 유지됩니다.',
      ],
      cons: ['NUMBER가 최대 5자리라는 조건(\\d{1,5})을 놓치면 숫자가 6자리 이상 이어진 파일에서 다를 수 있습니다.'],
      whyThisRank:
        '정렬 키 생성(O(N·L))과 키 비교(O(N log N))를 분리해 불필요한 문자열 재파싱을 없앤 가장 효율적인 방법입니다.',
      code: KEY_SORT,
      visualize: keySortViz,
    },
    {
      id: 'file-name-reparse-bubble',
      name: '비교할 때마다 글자를 훑어 재파싱 + 인접 교환 정렬',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N² · L)',
      spaceComplexity: 'O(N)',
      verdict: '정렬 키를 미리 저장하지 않고, 두 파일을 비교할 때마다 매번 문자열을 다시 파싱하며 인접 교환 정렬하는 느린 풀이입니다.',
      pros: [
        '정규식 없이 반복문만으로 HEAD와 NUMBER 구간을 끊는 과정을 직접 볼 수 있습니다.',
        '이웃한 원소끼리만 자리를 바꾸므로 동률일 때 입력 순서가 자연스럽게 유지됩니다.',
      ],
      cons: [
        '같은 파일명을 비교할 때마다 반복해서 파싱하므로 파싱 횟수가 O(N²)으로 늘어납니다.',
      ],
      whyThisRank:
        '정답은 같지만, 파일당 한 번이면 끝날 HEAD·NUMBER 추출을 비교할 때마다 되풀이해 문자열 처리 비용이 크게 늘어납니다.',
      code: REPARSE_SORT,
      visualize: reparseSortViz,
    },
    {
      id: 'file-name-string-num-trap',
      name: 'NUMBER를 정수로 바꾸지 않고 문자열로 비교',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: 'HEAD와 NUMBER를 나누었지만 NUMBER에 정수 변환을 하지 않아 "10" < "2", "01" < "1"로 정렬되는 함정입니다.',
      pros: ['HEAD와 NUMBER를 분리하는 정규식까지는 정석과 거의 비슷해 보입니다.'],
      cons: [
        '문자열 비교에서는 "10"이 "2"보다 앞이고, "01"이 "1"과 다른 값으로 취급되어 동률 순서도 깨집니다.',
      ],
      whyThisRank:
        '파일명 정렬을 하는 이유 자체가 문자열 사전 순("img10" < "img2") 대신 숫자 값 크기(2 < 10)와 앞자리 0 무시를 적용하기 위함이므로, 정수 변환을 빼먹으면 틀립니다.',
      code: STRING_NUM_TRAP,
      visualize: stringNumTrapViz,
    },
  ],
  checks: {
    cases: [
      {
        args: [['img12.png', 'img10.png', 'img02.png', 'img1.png', 'IMG01.GIF', 'img2.JPG']],
        expected: ['img1.png', 'IMG01.GIF', 'img02.png', 'img2.JPG', 'img10.png', 'img12.png'],
      },
      {
        args: [['F-5 Freedom Fighter', 'B-50 Superfortress', 'A-10 Thunderbolt II', 'F-14 Tomcat']],
        expected: ['A-10 Thunderbolt II', 'B-50 Superfortress', 'F-5 Freedom Fighter', 'F-14 Tomcat'],
      },
      {
        args: [['a0001.txt', 'A1.png', 'a01.doc']],
        expected: ['a0001.txt', 'A1.png', 'a01.doc'],
      },
      {
        args: [['foo010bar020.zip', 'foo9.txt', 'FOO009.zip']],
        expected: ['foo9.txt', 'FOO009.zip', 'foo010bar020.zip'],
      },
      {
        args: [['muzi123456.png', 'muzi12345.png']],
        expected: ['muzi123456.png', 'muzi12345.png'],
      },
    ],
    random: (rand) => {
      const heads = ['img', 'IMG', 'File-', 'file-', 'doc ', 'DOC '];
      const tails = ['.png', '.JPG', '.gif', '2026.txt', ''];
      const len = 2 + Math.floor(rand() * 6);
      const files = Array.from({ length: len }, () => {
        const h = heads[Math.floor(rand() * heads.length)];
        const num = Math.floor(rand() * 25);
        const pad = '0'.repeat(Math.floor(rand() * 3));
        const t = tails[Math.floor(rand() * tails.length)];
        return `${h}${pad}${num}${t}`;
      });
      return [files];
    },
  },
};

export default problem;
