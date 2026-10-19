import { slots } from './layout.ts';
import type { Action, Item, Rect, Tone } from './model.ts';
import type { StepRecorder } from './recorder.ts';

export interface LaneOptions { id: string; x: number; y: number; slotW: number; slotH: number; gap: number; max: number; foldable?: boolean }

const add = (item: Item, from?: string): Action => (from === undefined ? { type: 'add', item } : { type: 'add', item, from });
const remove = (id: string, into?: string): Action => (into === undefined ? { type: 'remove', id } : { type: 'remove', id, into });
const same = (a: Rect, b: Rect) => a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

// 큐·힙·스택 토큰 줄. 토큰만 맡고, 줄 이름표와 바탕은 문제 파일이 따로 만든다.
// 논리 순서에서 보일 모습을 계산해 지금 장면과 비교하고, 달라진 것만 기록기에 남긴다.
export class Lane {
  private readonly rec: StepRecorder;
  private readonly o: LaneOptions;
  private readonly more: string;                      // 접힌 개수를 보이는 0번 칸 토큰
  private readonly slot: (i: number) => Rect;
  private readonly stash = new Map<string, Item>();   // 줄에는 있지만 장면에는 없는 토큰
  private list: readonly string[] = [];

  constructor(rec: StepRecorder, o: LaneOptions) {
    this.rec = rec;
    this.o = o;
    this.more = `${o.id}:more`;
    this.slot = slots({ x: o.x, y: o.y, w: o.slotW, h: o.slotH, gap: o.gap });
  }

  // 논리 순서(앞 → 뒤), 접힌 것 포함
  get ids(): readonly string[] {
    return this.list;
  }

  push(token: { id: string; text: string; tone?: Tone }, from?: string): void {
    const { o, list } = this;
    if (list.includes(token.id)) throw new Error(`${o.id}: 이미 줄에 있는 토큰입니다: ${token.id}`);
    if (!o.foldable && list.length >= o.max) throw new Error(`${o.id}: 칸이 ${o.max}개뿐이라 더 넣을 수 없습니다`);
    // 자리는 sync가 정한다
    this.stash.set(token.id, { id: token.id, kind: 'token', rect: this.slot(0), text: token.text, tone: token.tone ?? 'queued' });
    this.sync([...list, token.id], { from });
  }

  // 앞에서 꺼낸다(큐). 나머지는 together로 한 칸씩 당긴다.
  shift(into?: string): string {
    const id = this.list.at(0);
    if (id === undefined) throw new Error(`${this.o.id}: 빈 줄에서는 꺼낼 수 없습니다`);
    if (this.list.length > this.o.max) throw new Error(`${this.o.id}: 접힌 토큰이 있는 줄은 앞에서 꺼낼 수 없습니다`);
    this.sync(this.list.slice(1), { into });
    return id;
  }

  // 뒤에서 꺼낸다(스택).
  pop(into?: string): string {
    const id = this.list.at(-1);
    if (id === undefined) throw new Error(`${this.o.id}: 빈 줄에서는 꺼낼 수 없습니다`);
    this.sync(this.list.slice(0, -1), { into });
    return id;
  }

  reorder(ids: string[]): void {
    if (JSON.stringify([...ids].sort()) !== JSON.stringify([...this.list].sort())) {
      throw new Error(`${this.o.id}: reorder에는 지금 토큰을 모두 한 번씩 넣어야 합니다`);
    }
    this.sync([...ids]);
  }

  // next대로 보일 모습(넘치면 0번 칸에 more, 그 뒤에 최근 max - 1개)을 장면과 비교해 한 묶음으로 기록한다.
  // 첫 동작(꺼내기·넣기)이 앞서고, 나머지는 together로 같이 움직인다.
  private sync(next: readonly string[], ends: { from?: string; into?: string } = {}): void {
    const { rec, o, more, stash, list: was } = this;
    const hidden = next.length > o.max ? next.length - o.max + 1 : 0;
    const shown = next.slice(hidden);
    const rectOf = (id: string) => this.slot(shown.indexOf(id) + (hidden ? 1 : 0));
    const text = `+${hidden}`;
    const acts: Action[] = [];
    // 줄을 떠나는 토큰
    for (const id of was) if (!next.includes(id) && rec.has(id)) acts.push(remove(id, ends.into));
    // 새로 들어오는 토큰은 from에서, 접혔다가 다시 보이는 토큰은 more에서
    for (const id of shown) {
      if (!was.includes(id)) acts.push(add({ ...stash.get(id)!, rect: rectOf(id) }, ends.from));
      else if (!rec.has(id)) acts.push(add({ ...stash.get(id)!, rect: rectOf(id) }, more));
    }
    if (hidden && !rec.has(more)) acts.push(add({ id: more, kind: 'token', rect: this.slot(0), text, tone: 'muted' }));
    // 접히는 토큰은 지금 모습을 기억해 두고 more로
    for (const id of next) {
      if (shown.includes(id) || !rec.has(id)) continue;
      stash.set(id, rec.get(id));
      acts.push(remove(id, more));
    }
    // 자리만 옮기는 토큰
    for (const id of shown) {
      if (was.includes(id) && rec.has(id) && !same(rec.get(id).rect, rectOf(id))) acts.push({ type: 'set', id, patch: { rect: rectOf(id) } });
    }
    if (hidden && rec.has(more) && rec.get(more).text !== text) acts.push({ type: 'set', id: more, patch: { text } });
    if (!hidden && rec.has(more)) acts.push(remove(more));

    rec.do(...acts.map((a, i) => (i ? { ...a, together: true } : a)));
    for (const id of was) if (!next.includes(id)) stash.delete(id);
    for (const id of shown) stash.delete(id);
    this.list = next;
  }
}
