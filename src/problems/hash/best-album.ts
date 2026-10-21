// 베스트앨범: 정석 장르별로 묶어 합계와 상위 2곡 고르기, 대안 장르마다 전체 곡을 다시 훑기, 함정 최다 재생 1곡으로 장르 순서 정하기를 같은 장면에서 움직인다.
// 장면은 위에 곡 목록 칸 한 줄, 가운데에 장르별 합계 칸과 곡 목록 상자, 아래에 앨범 수록 순서 줄이다.
import { slots } from '../../engine/layout.ts';
import type { Action, Item, Language, Problem, Rect, Scene, Tone, Visualization } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { lines, ro, together } from '../shared.ts';

type Lines = Record<Language, number[]>;

// 시각화 입력. pop(3100) > classic(1450) > jazz(900) 순이지만, 한 곡 최고 기록은 jazz(900) > classic(800)이라 함정이 드러난다.
const GENRES = ['classic', 'pop', 'classic', 'classic', 'pop', 'jazz'];
const PLAYS = [500, 600, 150, 800, 2500, 900];
const N = GENRES.length;
const KINDS = ['classic', 'pop', 'jazz'];
const RIGHT = [4, 1, 3, 0, 5];
const list = (xs: number[]) => `[${xs.join(', ')}]`;
const dictText = (m: Map<string, number>) => `{${[...m].map(([k, v]) => `${k}: ${v}`).join(', ')}}`;

/* ------------------------------------------------------------------ */
/* 풀이 코드와 마디마다 비출 줄                                          */
/* ------------------------------------------------------------------ */

const GROUP = {
  python: `def solution(genres, plays):
    total = {}
    by_genre = {}
    for i, (g, p) in enumerate(zip(genres, plays)):
        total[g] = total.get(g, 0) + p          # 장르별 총 재생 수
        by_genre.setdefault(g, []).append((p, i))

    order = sorted(total, key=lambda g: -total[g])  # 총 재생 수 내림차순
    answer = []
    for g in order:
        songs = sorted(by_genre[g], key=lambda x: (-x[0], x[1]))
        answer.extend(i for _, i in songs[:2])  # 장르마다 상위 2곡까지
    return answer`,
  javascript: `function solution(genres, plays) {
  const total = new Map();
  const byGenre = new Map();
  for (let i = 0; i < genres.length; i++) {
    const [g, p] = [genres[i], plays[i]];
    total.set(g, (total.get(g) ?? 0) + p); // 장르별 총 재생 수
    if (!byGenre.has(g)) byGenre.set(g, []);
    byGenre.get(g).push([p, i]);
  }

  const order = [...total.keys()].sort((a, b) => total.get(b) - total.get(a));
  const answer = [];
  for (const g of order) {
    const songs = byGenre.get(g).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (const [, i] of songs.slice(0, 2)) answer.push(i); // 장르마다 상위 2곡까지
  }
  return answer;
}`,
};
const GROUP_AT = {
  loop: lines(GROUP, ['for i, (g, p) in enumerate'], ['for (let i = 0; i < genres.length; i++)', 'const [g, p] =']),
  add: lines(GROUP, ['total[g] = total.get(g, 0) + p', 'by_genre.setdefault(g, []).append((p, i))'],
    ['total.set(g, (total.get(g) ?? 0) + p)', 'if (!byGenre.has(g))', 'byGenre.get(g).push([p, i])']),
  order: lines(GROUP, ['order = sorted(total, key=lambda g: -total[g])', 'answer = []'],
    ['const order = [...total.keys()].sort', 'const answer = []']),
  pickGenre: lines(GROUP, ['for g in order:'], ['for (const g of order)']),
  pickSongs: lines(GROUP, ['songs = sorted(by_genre[g]', 'answer.extend(i for _, i in songs[:2])'],
    ['const songs = byGenre.get(g).sort', 'for (const [, i] of songs.slice(0, 2))']),
  done: lines(GROUP, ['return answer'], ['return answer']),
};

const RESCAN = {
  python: `def solution(genres, plays):
    total = {}
    for g, p in zip(genres, plays):
        total[g] = total.get(g, 0) + p

    order = sorted(total, key=lambda g: -total[g])
    answer = []
    for g in order:
        # 장르마다 전체 곡을 처음부터 다시 훑어 골라낸다
        songs = [(plays[i], i) for i in range(len(genres)) if genres[i] == g]
        songs.sort(key=lambda x: (-x[0], x[1]))
        answer.extend(i for _, i in songs[:2])
    return answer`,
  javascript: `function solution(genres, plays) {
  const total = new Map();
  for (let i = 0; i < genres.length; i++) {
    total.set(genres[i], (total.get(genres[i]) ?? 0) + plays[i]);
  }

  const order = [...total.keys()].sort((a, b) => total.get(b) - total.get(a));
  const answer = [];
  for (const g of order) {
    // 장르마다 전체 곡을 처음부터 다시 훑어 골라낸다
    const songs = [];
    for (let i = 0; i < genres.length; i++) {
      if (genres[i] === g) songs.push([plays[i], i]);
    }
    songs.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (const [, i] of songs.slice(0, 2)) answer.push(i);
  }
  return answer;
}`,
};
const RESCAN_AT = {
  total: lines(RESCAN, ['total = {}', 'for g, p in zip(genres, plays):', 'total[g] = total.get(g, 0) + p'],
    ['const total = new Map()', 'for (let i = 0; i < genres.length; i++)', 'total.set(genres[i]']),
  order: lines(RESCAN, ['order = sorted(total, key=lambda g: -total[g])', 'answer = []'],
    ['const order = [...total.keys()].sort', 'const answer = []']),
  pickGenre: lines(RESCAN, ['for g in order:'], ['for (const g of order)']),
  scan: lines(RESCAN, ['songs = [(plays[i], i) for i in range(len(genres)) if genres[i] == g]'],
    ['const songs = []', 'for (let i = 0; i < genres.length; i++) {', 'if (genres[i] === g)']),
  take: lines(RESCAN, ['songs.sort(key=lambda x: (-x[0], x[1]))', 'answer.extend(i for _, i in songs[:2])'],
    ['songs.sort((a, b) => b[0] - a[0]', 'for (const [, i] of songs.slice(0, 2))']),
  done: lines(RESCAN, ['return answer'], ['return answer']),
};

const MAX_SONG = {
  python: `# 주의: 장르 총합이 아니라 최다 재생 1곡으로 장르 순서를 정해 틀리는 풀이입니다
def solution(genres, plays):
    best = {}
    by_genre = {}
    for i, (g, p) in enumerate(zip(genres, plays)):
        best[g] = max(best.get(g, 0), p)        # 잘못된 기준: 장르 내 최고 재생 수만 기록
        by_genre.setdefault(g, []).append((p, i))

    order = sorted(best, key=lambda g: -best[g])
    answer = []
    for g in order:
        songs = sorted(by_genre[g], key=lambda x: (-x[0], x[1]))
        answer.extend(i for _, i in songs[:2])
    return answer`,
  javascript: `// 주의: 장르 총합이 아니라 최다 재생 1곡으로 장르 순서를 정해 틀리는 풀이입니다
function solution(genres, plays) {
  const best = new Map();
  const byGenre = new Map();
  for (let i = 0; i < genres.length; i++) {
    const [g, p] = [genres[i], plays[i]];
    best.set(g, Math.max(best.get(g) ?? 0, p)); // 잘못된 기준: 장르 내 최고 재생 수만 기록
    if (!byGenre.has(g)) byGenre.set(g, []);
    byGenre.get(g).push([p, i]);
  }

  const order = [...best.keys()].sort((a, b) => best.get(b) - best.get(a));
  const answer = [];
  for (const g of order) {
    const songs = byGenre.get(g).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (const [, i] of songs.slice(0, 2)) answer.push(i);
  }
  return answer;
}`,
};
const MAX_AT = {
  collect: lines(MAX_SONG, ['for i, (g, p) in enumerate', 'best[g] = max(best.get(g, 0), p)', 'by_genre.setdefault(g, []).append((p, i))'],
    ['for (let i = 0; i < genres.length; i++)', 'best.set(g, Math.max', 'byGenre.get(g).push([p, i])']),
  order: lines(MAX_SONG, ['order = sorted(best, key=lambda g: -best[g])', 'answer = []'],
    ['const order = [...best.keys()].sort', 'const answer = []']),
  pickGenre: lines(MAX_SONG, ['for g in order:'], ['for (const g of order)']),
  pickSongs: lines(MAX_SONG, ['songs = sorted(by_genre[g]', 'answer.extend(i for _, i in songs[:2])'],
    ['const songs = byGenre.get(g).sort', 'for (const [, i] of songs.slice(0, 2))']),
  done: lines(MAX_SONG, ['return answer'], ['return answer']),
};

const union = (...hs: Lines[]): Lines => ({
  python: [...new Set(hs.flatMap((h) => h.python))].sort((a, b) => a - b),
  javascript: [...new Set(hs.flatMap((h) => h.javascript))].sort((a, b) => a - b),
});

/* ------------------------------------------------------------------ */
/* 장면과 자주 쓰는 동작                                                 */
/* ------------------------------------------------------------------ */

const SONG_Y = 24;
const GENRE_Y = 110;
const ZONE_Y = 172;
const ALBUM_Y = 292;
const W = 620;
const H = 350;

const songRect = slots({ x: 72, y: SONG_Y, w: 72, h: 54, gap: 8 });
const genreRect = (t: number): Rect => ({ x: 72 + t * 160, y: GENRE_Y, w: 144, h: 54 });
const zoneRect = (t: number): Rect => ({ x: 72 + t * 160, y: ZONE_Y, w: 144, h: 100 });
const gsongRect = (t: number, s: number): Rect => ({ x: 78 + t * 160, y: ZONE_Y + 6 + s * 30, w: 132, h: 26 });
const pickRect = slots({ x: 76, y: ALBUM_Y + 6, w: 64, h: 36, gap: 8 });

const songId = (i: number) => `song:${i}`;
const genreId = (t: number) => `genre:${t}`;
const gsongId = (t: number, s: number) => `gsong:${t}:${s}`;
const pickId = (k: number) => `pick:${k}`;

function board(midLabel: string): Scene {
  const items: Item[] = [
    { id: 'row:song', kind: 'text', rect: { x: 0, y: SONG_Y, w: 64, h: 54 }, text: '곡 목록' },
    { id: 'row:genre', kind: 'text', rect: { x: 0, y: GENRE_Y, w: 64, h: 54 }, text: midLabel },
    { id: 'row:list', kind: 'text', rect: { x: 0, y: ZONE_Y, w: 64, h: 100 }, text: '장르별 곡' },
    { id: 'row:album', kind: 'text', rect: { x: 0, y: ALBUM_Y, w: 64, h: 48 }, text: '수록 순서' },
    { id: 'album:bg', kind: 'zone', rect: { x: 70, y: ALBUM_Y, w: 364, h: 48 } },
  ];
  for (let i = 0; i < N; i++) {
    items.push({ id: songId(i), kind: 'cell', rect: songRect(i), tone: 'plain', text: String(PLAYS[i]), sub: GENRES[i], tag: `#${i}` });
  }
  KINDS.forEach((k, t) => {
    items.push(
      { id: genreId(t), kind: 'cell', rect: genreRect(t), tone: 'plain', text: '0', tag: k },
      { id: `zone:${t}`, kind: 'zone', rect: zoneRect(t) },
    );
  });
  return { width: W, height: H, items };
}

const wait = (ms: number): Action => ({ type: 'wait', ms });
const paint = (id: string, tone: Tone): Action => ({ type: 'set', id, patch: { tone } });

/* ------------------------------------------------------------------ */
/* 정석 장르별 묶기: 곡 묶기 → 장르 정렬 → 장르마다 상위 2곡 수록            */
/* ------------------------------------------------------------------ */

function groupByGenre(): Visualization {
  const rec = new StepRecorder(board('장르 합계'));
  const total = new Map<string, number>();
  const byGenre = new Map<string, [number, number][]>();
  const answer: number[] = [];
  let checked = 0;
  let iVar: number | string = '-';
  let gVar = '-';
  let orderText = '-';
  const meta = () => ({
    work: checked,
    variables: { i: iVar, g: gVar, total: dictText(total), order: orderText, answer: list(answer) },
  });

  for (let i = 0; i < N; i++) {
    const [g, p] = [GENRES[i], PLAYS[i]];
    const t = KINDS.indexOf(g);
    const prev = total.get(g) ?? 0;
    const next = prev + p;
    total.set(g, next);
    if (!byGenre.has(g)) byGenre.set(g, []);
    const bucket = byGenre.get(g)!;
    const s = bucket.length;
    bucket.push([p, i]);
    checked++;
    iVar = i;
    gVar = g;

    rec.step({
      title: `#${i} (${g}, ${p}회) → ${g} 합계 ${next}`,
      codeHighlights: union(GROUP_AT.loop, GROUP_AT.add),
      ...meta(),
    });
    rec.phase('곡 꺼내기', `${i}번 곡(${g}, ${p}회)을 확인합니다.`, GROUP_AT.loop);
    rec.do(...together([paint(songId(i), 'current'), { type: 'focus', ids: [songId(i), genreId(t)] }]), wait(250));

    rec.phase('장르에 묶기', `${g} 총 재생 수를 ${prev} + ${p} = ${ro(next)} 올리고, ${g} 목록에 (#${i}, ${p}회)를 넣습니다.`, GROUP_AT.add);
    rec.do(
      { type: 'arrow', from: songId(i), to: genreId(t), verdict: 'good', label: `+${p}` },
      { type: 'set', id: genreId(t), patch: { text: String(next), tone: 'chosen' }, pop: true },
      { type: 'add', item: { id: gsongId(t, s), kind: 'token', rect: gsongRect(t, s), tone: 'plain', text: `#${i} · ${p}회` }, from: songId(i) },
    );
    rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }, paint(songId(i), 'visited')]));
  }

  const order = [...total.keys()].sort((a, b) => total.get(b)! - total.get(a)!);
  orderText = `[${order.join(', ')}]`;
  iVar = '-';
  gVar = '-';
  rec.step({
    title: `장르 합계순 정렬: ${order.map((g) => `${g}(${total.get(g)})`).join(' > ')}`,
    codeHighlights: GROUP_AT.order,
    ...meta(),
  });
  rec.phase('장르 순서 정하기', `총 재생 수가 큰 순서대로 장르를 정렬하면 ${order.map((g) => `${g}(${total.get(g)}회)`).join(' → ')}입니다.`, GROUP_AT.order);
  rec.do(...together(order.map((g, rank): Action => {
    const t = KINDS.indexOf(g);
    return { type: 'set', id: genreId(t), patch: { sub: `${rank + 1}순위`, tone: 'chosen' }, pop: true };
  })), wait(450));

  for (const g of order) {
    const t = KINDS.indexOf(g);
    const raw = byGenre.get(g)!;
    const sorted = [...raw].sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    const picked = sorted.slice(0, 2);
    checked += raw.length;
    gVar = g;
    for (const [, idx] of picked) answer.push(idx);

    rec.step({
      title: `${g}: 상위 ${picked.length}곡 ${picked.map(([, idx]) => `#${idx}`).join(', ')} 수록`,
      codeHighlights: union(GROUP_AT.pickGenre, GROUP_AT.pickSongs),
      ...meta(),
    });
    rec.phase('장르 고르기', `${g} 장르의 곡 ${raw.length}개를 재생 수 내림차순으로 정렬합니다.`, GROUP_AT.pickGenre);
    rec.do(
      paint(genreId(t), 'current'),
      ...together(sorted.map(([p, idx], s): Action => ({
        type: 'set',
        id: gsongId(t, s),
        patch: { text: `#${idx} · ${p}회`, tone: s < 2 ? 'good' : 'muted' },
        pop: true,
      }))),
      wait(250),
    );

    rec.phase('상위 2곡 수록', `${g}에서 가장 많이 재생된 ${picked.map(([p, idx]) => `#${idx}(${p}회)`).join(', ')}을 앨범에 넣습니다.`, GROUP_AT.pickSongs);
    picked.forEach(([p, idx], offset) => {
      const slotIndex = answer.length - picked.length + offset;
      rec.do({
        type: 'add',
        item: { id: pickId(slotIndex), kind: 'token', rect: pickRect(slotIndex), tone: 'good', text: `#${idx}(${p})` },
        from: gsongId(t, offset),
      });
    });
    rec.do(paint(genreId(t), 'visited'));
  }

  rec.step({
    title: `수록 완료: ${list(answer)}`,
    codeHighlights: GROUP_AT.done,
    ...meta(),
    answer: [...answer],
    isKeyframe: true,
  });
  rec.phase('정답', `장르별로 한 번에 묶어 두었기 때문에 곡을 모두 ${checked}번만 확인하고 ${list(answer)}을 얻었습니다.`, GROUP_AT.done);
  rec.do(...together(answer.map((_, k) => paint(pickId(k), 'path'))), wait(500));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 대안 다시 훑기: 합계 구하기 → 장르 정렬 → 장르마다 전체 곡 다시 훑기      */
/* ------------------------------------------------------------------ */

function rescanPerGenre(): Visualization {
  const rec = new StepRecorder(board('장르 합계'));
  const total = new Map<string, number>();
  const answer: number[] = [];
  let checked = 0;
  let gVar = '-';
  let orderText = '-';
  const meta = () => ({
    work: checked,
    variables: { g: gVar, total: dictText(total), order: orderText, answer: list(answer) },
  });

  for (let i = 0; i < N; i++) total.set(GENRES[i], (total.get(GENRES[i]) ?? 0) + PLAYS[i]);
  checked += N;
  rec.step({
    title: `곡 ${N}개를 훑어 장르별 합계 구하기`,
    codeHighlights: RESCAN_AT.total,
    ...meta(),
  });
  rec.phase('합계 세기', `곡 ${N}개를 한 번 훑어 장르별 총 재생 수를 구합니다. 하지만 곡 목록은 묶어 두지 않았습니다.`, RESCAN_AT.total);
  rec.do(...together(KINDS.map((k, t): Action => ({
    type: 'set', id: genreId(t), patch: { text: String(total.get(k)!), tone: 'chosen' }, pop: true,
  }))), wait(500));

  const order = [...total.keys()].sort((a, b) => total.get(b)! - total.get(a)!);
  orderText = `[${order.join(', ')}]`;
  rec.step({
    title: `장르 순서 정하기: ${order.join(' → ')}`,
    codeHighlights: RESCAN_AT.order,
    ...meta(),
  });
  rec.phase('장르 정렬', `합계가 큰 순서대로 ${order.map((g) => `${g}(${total.get(g)})`).join(' → ')} 순서를 정합니다.`, RESCAN_AT.order);
  rec.do(...together(order.map((g, rank): Action => ({
    type: 'set', id: genreId(KINDS.indexOf(g)), patch: { sub: `${rank + 1}순위` }, pop: true,
  }))), wait(450));

  for (const g of order) {
    const t = KINDS.indexOf(g);
    const matched = GENRES.flatMap((gg, i) => (gg === g ? [[PLAYS[i], i] as [number, number]] : []));
    const sorted = [...matched].sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    const picked = sorted.slice(0, 2);
    checked += N;
    gVar = g;
    for (const [, idx] of picked) answer.push(idx);

    rec.step({
      title: `${g}: 전체 ${N}곡을 다시 훑어 ${picked.map(([, idx]) => `#${idx}`).join(', ')} 수록`,
      codeHighlights: union(RESCAN_AT.pickGenre, RESCAN_AT.scan, RESCAN_AT.take),
      ...meta(),
    });
    rec.phase('전체 다시 훑기', `${g} 곡을 찾으려고 곡 ${N}개를 처음부터 다시 훑습니다.`, RESCAN_AT.scan);
    rec.do(
      paint(genreId(t), 'current'),
      ...together(GENRES.map((gg, i) => paint(songId(i), gg === g ? 'chosen' : 'muted'))),
    );
    matched.forEach(([p, idx], s) => {
      rec.do({
        type: 'add',
        item: { id: gsongId(t, s), kind: 'token', rect: gsongRect(t, s), tone: 'chosen', text: `#${idx} · ${p}회` },
        from: songId(idx),
      });
    });

    rec.phase('정렬 후 수록', `찾아낸 ${matched.length}곡을 정렬해 상위 ${picked.length}곡을 앨범에 넣습니다.`, RESCAN_AT.take);
    rec.do(...together(sorted.map(([p, idx], s): Action => ({
      type: 'set', id: gsongId(t, s), patch: { text: `#${idx} · ${p}회`, tone: s < 2 ? 'good' : 'muted' }, pop: true,
    }))));
    picked.forEach(([p, idx], offset) => {
      const slotIndex = answer.length - picked.length + offset;
      rec.do({
        type: 'add',
        item: { id: pickId(slotIndex), kind: 'token', rect: pickRect(slotIndex), tone: 'good', text: `#${idx}(${p})` },
        from: gsongId(t, offset),
      });
    });
    rec.do(...together([paint(genreId(t), 'visited'), ...GENRES.map((_, i) => paint(songId(i), 'plain'))]));
  }

  rec.step({
    title: `수록 완료: ${list(answer)} (곡 확인 ${checked}번)`,
    codeHighlights: RESCAN_AT.done,
    ...meta(),
    answer: [...answer],
    isKeyframe: true,
  });
  rec.phase('정답', `답은 ${list(answer)}로 같지만, 장르마다 전체 곡을 다시 훑어서 곡을 ${checked}번(정석은 ${2 * N}번) 확인했습니다.`, RESCAN_AT.done);
  rec.do(...together(answer.map((_, k) => paint(pickId(k), 'path'))), wait(500));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 함정 최고 재생 1곡 기준: 묶기 → 잘못된 장르 순서 → 틀린 답 확인            */
/* ------------------------------------------------------------------ */

function sortByMaxSong(): Visualization {
  const rec = new StepRecorder(board('최고 1곡'));
  const best = new Map<string, number>();
  const byGenre = new Map<string, [number, number][]>();
  const answer: number[] = [];
  let checked = 0;
  let gVar = '-';
  let orderText = '-';
  const meta = () => ({
    work: checked,
    variables: { g: gVar, best: dictText(best), order: orderText, answer: list(answer) },
  });

  for (let i = 0; i < N; i++) {
    const [g, p] = [GENRES[i], PLAYS[i]];
    best.set(g, Math.max(best.get(g) ?? 0, p));
    if (!byGenre.has(g)) byGenre.set(g, []);
    byGenre.get(g)!.push([p, i]);
  }
  checked += N;

  rec.step({
    title: `곡 ${N}개를 묶되 장르 합계 대신 최고 재생 수만 기록`,
    codeHighlights: MAX_AT.collect,
    ...meta(),
  });
  rec.phase('최고 기록 저장', '장르별 곡을 묶으면서 총합이 아니라 가장 많이 재생된 1곡의 재생 수만 기록합니다.', MAX_AT.collect);
  KINDS.forEach((k, t) => {
    rec.do({ type: 'set', id: genreId(t), patch: { text: String(best.get(k)!), tone: 'bad' }, pop: true });
    byGenre.get(k)!.forEach(([p, idx], s) => {
      rec.do({
        type: 'add',
        item: { id: gsongId(t, s), kind: 'token', rect: gsongRect(t, s), tone: 'plain', text: `#${idx} · ${p}회` },
        from: songId(idx),
      });
    });
  });

  const order = [...best.keys()].sort((a, b) => best.get(b)! - best.get(a)!);
  orderText = `[${order.join(', ')}]`;
  rec.step({
    title: `잘못된 장르 순서: jazz(900)가 classic(800, 총합 1450) 앞선다`,
    codeHighlights: MAX_AT.order,
    ...meta(),
  });
  rec.phase('잘못된 정렬', `1곡 최고 기록만 비교해 jazz(900회)가 classic(최고 800회, 하지만 3곡 합계는 1450회)보다 먼저 옵니다.`, MAX_AT.order);
  rec.do(
    { type: 'focus', ids: [genreId(0), genreId(2)] },
    { type: 'arrow', from: genreId(2), to: genreId(0), verdict: 'bad', label: '900 > 800 (총합은 900 < 1450)' },
    ...together(order.map((g, rank): Action => ({
      type: 'set', id: genreId(KINDS.indexOf(g)), patch: { sub: `${rank + 1}순위` }, pop: true,
    }))),
  );
  rec.do(...together([{ type: 'unfocus' }, { type: 'clearMarks' }]));

  for (const g of order) {
    const t = KINDS.indexOf(g);
    const raw = byGenre.get(g)!;
    const sorted = [...raw].sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    const picked = sorted.slice(0, 2);
    checked += raw.length;
    gVar = g;
    for (const [, idx] of picked) answer.push(idx);

    rec.step({
      title: `${g} 수록 → ${picked.map(([, idx]) => `#${idx}`).join(', ')}`,
      codeHighlights: union(MAX_AT.pickGenre, MAX_AT.pickSongs),
      ...meta(),
    });
    rec.phase('장르 고르기', `잘못된 순서에 따라 ${g} 장르를 먼저 처리합니다.`, MAX_AT.pickGenre);
    rec.do(
      paint(genreId(t), 'current'),
      ...together(sorted.map(([p, idx], s): Action => ({
        type: 'set', id: gsongId(t, s), patch: { text: `#${idx} · ${p}회`, tone: s < 2 ? 'bad' : 'muted' }, pop: true,
      }))),
    );

    rec.phase('곡 수록', `${g} 상위 곡 ${picked.map(([, idx]) => `#${idx}`).join(', ')}을 앨범에 넣습니다.`, MAX_AT.pickSongs);
    picked.forEach(([p, idx], offset) => {
      const slotIndex = answer.length - picked.length + offset;
      rec.do({
        type: 'add',
        item: { id: pickId(slotIndex), kind: 'token', rect: pickRect(slotIndex), tone: 'bad', text: `#${idx}(${p})` },
        from: gsongId(t, offset),
      });
    });
    rec.do(paint(genreId(t), 'visited'));
  }

  rec.step({
    title: `오답 ${list(answer)} — 정답은 ${list(RIGHT)}`,
    codeHighlights: MAX_AT.done,
    ...meta(),
    answer: [...answer],
    isKeyframe: true,
  });
  rec.phase('오답 확인', `classic은 세 곡 합계가 1450회라 jazz(900회)보다 먼저 수록되어야 합니다. 장르 순서는 최고 1곡이 아니라 장르 총합으로 정해야 합니다.`, MAX_AT.done);
  rec.do({
    type: 'add',
    item: { id: 'right', kind: 'token', rect: { x: 442, y: ALBUM_Y + 6, w: 170, h: 36 }, tone: 'good', text: `정답 ${list(RIGHT)}` },
  }, wait(600));
  return rec.finish();
}

/* ------------------------------------------------------------------ */
/* 문제                                                                 */
/* ------------------------------------------------------------------ */

const problem: Problem = {
  id: 'best-album',
  title: '베스트앨범',
  level: 3,
  category: 'hash',
  sourceUrl: 'https://school.programmers.co.kr/learn/courses/30/lessons/42579',
  description: {
    summary:
      '장르별로 가장 많이 재생된 노래를 최대 두 개씩 모아 베스트앨범을 만듭니다. 속한 노래의 총 재생 수가 많은 장르를 먼저 수록하고, 장르 안에서는 재생 수가 많은 노래부터, 재생 수가 같으면 고유 번호가 낮은 노래부터 수록합니다.',
    rules: [
      'genres[i]는 고유번호 i인 노래의 장르, plays[i]는 재생 횟수',
      'genres와 plays의 길이는 같으며 1 이상 10,000 이하',
      '장르 종류는 100개 미만이며, 장르에 속한 곡이 하나면 하나만 선택',
      '모든 장르는 총 재생된 횟수가 서로 다름',
    ],
    examples: [
      {
        input: 'genres = ["classic", "pop", "classic", "classic", "pop"], plays = [500, 600, 150, 800, 2500]',
        output: '[4, 1, 3, 0]',
      },
    ],
  },
  keyIntuitions: [
    '장르 이름을 키로 하는 두 개의 사전(해시)을 함께 만듭니다: 장르별 총 재생 수 사전과 장르별 (재생 수, 고유 번호) 목록 사전입니다.',
    '장르 순서는 장르에 속한 모든 곡의 재생 수 합계로 정하고, 각 장르 안에서는 (-재생 수, 고유 번호) 기준으로 정렬해 앞의 2곡만 꺼냅니다.',
    '곡을 처음 한 번만 훑어 장르별로 묶어 두면, 장르마다 전체 배열을 다시 뒤질 필요가 없습니다.',
  ],
  demo: {
    input: [GENRES, PLAYS],
    label: 'genres = ["classic", "pop", "classic", "classic", "pop", "jazz"], plays = [500, 600, 150, 800, 2500, 900]',
  },
  workUnit: '곡을 확인한 횟수',
  approaches: [
    {
      id: 'best-album-group',
      name: '장르별 묶기 (합계 + 곡 목록 사전)',
      rank: 'BEST',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '한 번 훑으며 장르별 총합과 곡 목록을 사전에 모아 두고 정렬하는 정석 풀이입니다.',
      pros: [
        '곡 목록을 처음 한 번만 훑어 장르별로 분류하므로 장르 수만큼 다시 훑지 않습니다.',
        '(-재생 수, 고유 번호) 정렬 키 하나로 재생 수 내림차순과 동점 시 낮은 번호 우선 규칙을 한꺼번에 처리합니다.',
        '[:2] 또는 slice(0, 2)를 쓰면 곡이 1개뿐인 장르도 별도 분기 없이 깔끔하게 처리됩니다.',
      ],
      cons: [
        '장르별 합계 사전과 곡 목록 사전을 둘 다 관리해야 합니다.',
      ],
      whyThisRank:
        '"장르 순서(합계)"와 "장르 내 순서(재생 수, 번호)"라는 두 단계 기준을 두 개의 사전으로 그대로 옮겨 시간과 코드 모두 가장 깔끔합니다.',
      code: GROUP,
      visualize: groupByGenre,
    },
    {
      id: 'best-album-rescan',
      name: '장르마다 전체 곡을 다시 훑어 고르기',
      rank: 'ALTERNATIVE',
      timeComplexity: 'O(N × G + N log N)',
      spaceComplexity: 'O(N)',
      verdict: '합계 사전만 만들고 장르마다 전체 곡 배열을 다시 훑어 골라내는 풀이로, 장르 수만큼 반복 탐색이 늘어납니다.',
      pros: [
        '사전 하나(장르별 합계)만 쓰므로 자료구조가 단순합니다.',
        '장르 종류가 100개 미만이라 이 문제의 제한 안에서는 통과합니다.',
      ],
      cons: [
        `장르 G개마다 길이 N인 배열을 처음부터 다시 훑어 O(N × G) 일이 추가됩니다. 이 예에서도 곡을 ${4 * N}번 확인해 정석(${2 * N}번)의 두 배입니다.`,
        '장르 수가 많아지면 불필요한 선형 탐색 비용이 크게 불어납니다.',
      ],
      whyThisRank:
        '정답은 같지만 처음 훑을 때 곡을 장르별 리스트에 담아 두기만 해도 장르마다 배열 전체를 다시 훑는 일을 없앨 수 있습니다.',
      code: RESCAN,
      visualize: rescanPerGenre,
    },
    {
      id: 'best-album-max-song',
      name: '최다 재생 1곡으로 장르 순서 정하기',
      rank: 'TRAP',
      trap: 'wrong',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      verdict: '장르의 모든 곡 합계가 아니라 가장 많이 재생된 한 곡으로 장르 순서를 정해 틀리는 풀이입니다.',
      pros: [
        '원문 예제는 최다 재생 곡을 가진 장르와 총합이 가장 큰 장르가 우연히 같아서 통과합니다.',
      ],
      cons: [
        '여러 곡이 고르게 재생된 장르(classic: 500 + 150 + 800 = 1450)가 한 곡만 반짝 큰 장르(jazz: 900)에 밀려 순서가 뒤집힙니다.',
      ],
      whyThisRank:
        '"속한 노래가 많이 재생된 장르를 먼저 수록한다"는 조건은 장르에 속한 모든 곡의 재생 수 합계를 뜻합니다. 최댓값이 아니라 합계(sum)로 장르 순서를 정해야 합니다.',
      code: MAX_SONG,
      visualize: sortByMaxSong,
    },
  ],
  checks: {
    cases: [
      {
        args: [['classic', 'pop', 'classic', 'classic', 'pop'], [500, 600, 150, 800, 2500]],
        expected: [4, 1, 3, 0],
      },
      {
        args: [['classic', 'pop', 'classic', 'classic'], [500, 2500, 500, 500]],
        expected: [1, 0, 2], // 동점일 때 고유번호 낮은 곡 먼저
      },
      {
        args: [['solo'], [100]],
        expected: [0],
      },
      {
        args: [GENRES, PLAYS],
        expected: RIGHT,
      },
    ],
    // 곡 2~7개, 장르 1~3개, 장르별 총합이 서로 다르게 재생 수 생성
    random: (rand) => {
      const pool = ['classic', 'pop', 'jazz'];
      for (;;) {
        const n = 2 + Math.floor(rand() * 6);
        const genres = Array.from({ length: n }, () => pool[Math.floor(rand() * 3)]);
        const plays = Array.from({ length: n }, () => (1 + Math.floor(rand() * 20)) * 50);
        const totals = new Map<string, number>();
        genres.forEach((g, i) => totals.set(g, (totals.get(g) ?? 0) + plays[i]));
        if (new Set(totals.values()).size === totals.size) return [genres, plays];
      }
    },
  },
};

export default problem;
