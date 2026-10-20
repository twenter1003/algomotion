import type { Action, AlgorithmStep, Item, Point, Rect, Scene } from './model.ts';
import { DUR, planStep } from './timeline.ts';

// DOM 무대. 장면의 물체마다 data-id를 단 절대 위치 요소를 하나씩 두고,
// render는 장면을 그대로, tween은 CSS 전환으로 이어서, play는 한 단계를 timeline의 시각표대로 연출한다.
// 덧그림(화살표, 판정 표시)은 .stage-mark, 날아가는 토큰은 .is-flying, 사라지는 중인 물체는 .is-leaving을 단다.

type Of<T extends Action['type']> = Extract<Action, { type: T }>;
interface Node { item: Item; el: HTMLElement | SVGSVGElement }

const SVG_NS = 'http://www.w3.org/2000/svg';
const FLY = 'cubic-bezier(.45,0,.25,1)'; // 포물선으로 날기, 선 긋기
const SLIDE = 'cubic-bezier(.3,.7,.2,1)'; // 줄에서 밀리기, 테두리 옮기기
const LAND = 'cubic-bezier(.2,.8,.2,1)'; // 테두리가 내려앉기
const TWEEN_MS = 450;

const px = (n: number) => `${n}px`;
const shift = (x: number, y: number, extra = '') => `translate(${x}px, ${y}px)${extra}`;
const middle = (r: Rect): Point => [r.x + r.w / 2, r.y + r.h / 2];
const pointsAttr = (ps: Point[] = []) => ps.map((p) => p.join(',')).join(' ');
const lengthOf = (ps: Point[]) => ps.reduce((sum, p, i) => (i ? sum + Math.hypot(p[0] - ps[i - 1][0], p[1] - ps[i - 1][1]) : 0), 0);
const svg = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};
const span = (className: string) => Object.assign(document.createElement('span'), { className });

export class Stage {
  private readonly host: HTMLElement;
  private readonly motion: boolean; // 움직임 줄이기면 날기·밀리기 없이 짧게 나타나고 사라지기만 한다
  private readonly marks: SVGSVGElement;
  private readonly nodes = new Map<string, Node>();
  private timers: number[] = [];
  private finish?: (done: boolean) => void;

  constructor(host: HTMLElement, scene: Scene, opts: { reducedMotion?: boolean } = {}) {
    this.host = host;
    this.motion = !opts.reducedMotion;
    this.marks = svg('svg', { class: 'stage-marks' });
    host.classList.add('stage-board');
    host.append(this.marks);
    this.render(scene);
  }

  // 진행 중 연출을 취소하고 장면을 그대로 그린다
  render(scene: Scene): void {
    this.cancel();
    const { host } = this;
    host.classList.add('is-still');
    host.classList.remove('is-focus', 'is-tween');
    this.sync(scene, false);
    for (const { el } of this.nodes.values()) el.classList.remove('in-focus');
    host.getBoundingClientRect(); // 전환 없이 그린 모습을 확정한 뒤 전환을 다시 켠다
    host.classList.remove('is-still');
  }

  // 같은 id끼리 위치·색·채움을 CSS 전환으로 잇는다. 새 물체는 나타나고 없어진 물체는 사라진다
  tween(scene: Scene): void {
    this.cancel();
    const { host } = this;
    host.classList.remove('is-focus', 'is-still');
    host.classList.add('is-tween');
    for (const { el } of this.nodes.values()) el.classList.remove('in-focus');
    const fresh = this.sync(scene, true);
    fresh.forEach((el) => el.classList.add('is-entering'));
    host.getBoundingClientRect();
    fresh.forEach((el) => el.classList.remove('is-entering'));
  }

  // 한 단계를 연출한다. 끝까지 가면 step.scene으로 맞추고 true, 도중에 취소되면 false
  play(step: AlgorithmStep, speed: number, onPhase: (i: number) => void): Promise<boolean> {
    this.cancel();
    const { host } = this;
    host.classList.remove('is-tween');
    const k = 1 / speed;
    host.style.setProperty('--t-set', `${DUR.set * k}ms`);
    host.style.setProperty('--t-fade', `${DUR.focus * k}ms`);
    const plan = planStep(step, { reducedMotion: !this.motion });
    return new Promise((resolve) => {
      this.finish = resolve;
      // 같은 시각의 일은 기록된 차례대로 한 타이머에서 한다(together 동작끼리도 순서가 있다)
      const cues = new Map<number, (() => void)[]>();
      const cue = (ms: number, fn: () => void) => cues.set(ms, [...(cues.get(ms) ?? []), fn]);
      plan.phases.forEach((phase, i) => {
        cue(phase.start, () => onPhase(i));
        for (const { action, start, duration } of phase.actions) cue(start, () => this.apply(action, duration * k));
      });
      cue(plan.total, () => {
        this.finish = undefined;
        this.render(step.scene);
        resolve(true);
      });
      for (const [ms, fns] of cues) this.timers.push(window.setTimeout(() => fns.forEach((fn) => fn()), ms * k));
    });
  }

  // 연출을 멈추고 덧그림(화살표, 판정 표시)과 날아가던 토큰을 지운다. 장면은 render로 맞춘다
  cancel(): void {
    this.timers.forEach((id) => window.clearTimeout(id));
    this.timers = [];
    this.host.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    this.host.querySelectorAll('.stage-mark, .is-leaving').forEach((el) => el.remove());
    this.host.querySelectorAll('.is-flying').forEach((el) => el.classList.remove('is-flying'));
    const finish = this.finish;
    this.finish = undefined;
    finish?.(false);
  }

  destroy(): void {
    this.cancel();
    this.nodes.clear();
    this.host.replaceChildren();
    this.host.classList.remove('stage-board', 'is-still', 'is-focus', 'is-tween');
  }

  /* ---------------------------------------------------------------- */
  /* 장면 맞추기                                                         */
  /* ---------------------------------------------------------------- */

  // 장면과 같은 물체가 되도록 요소를 만들고 고치고 지운다. 새로 만든 요소를 돌려준다
  private sync(scene: Scene, fade: boolean): Element[] {
    Object.assign(this.host.style, { width: px(scene.width), height: px(scene.height) });
    const keep = new Set(scene.items.map((i) => i.id));
    for (const [id, { el }] of this.nodes) {
      if (keep.has(id)) continue;
      this.nodes.delete(id);
      if (fade) this.leave(el, TWEEN_MS);
      else el.remove();
    }
    const fresh: Element[] = [];
    for (const item of scene.items) {
      const node = this.nodes.get(item.id);
      if (node && node.item.kind === item.kind) {
        node.item = structuredClone(item);
        this.draw(node);
      } else {
        node?.el.remove();
        fresh.push(this.create(structuredClone(item)).el);
      }
    }
    return fresh;
  }

  private create(item: Item): Node {
    let el: HTMLElement | SVGSVGElement;
    if (item.kind === 'line') {
      el = svg('svg');
      el.append(svg('polyline'));
    } else {
      el = document.createElement('div');
      if (item.kind === 'bar') el.append(span('it-fill'));
      el.append(span('it-label'), span('it-tag'), span('it-sub'));
    }
    el.dataset.id = item.id;
    this.host.insertBefore(el, this.marks);
    const node = { item, el };
    this.nodes.set(item.id, node);
    this.draw(node);
    return node;
  }

  // 물체 정보대로 요소를 고친다. 상태 클래스(in-focus, is-flying …)는 건드리지 않는다
  private draw({ item, el }: Node): void {
    el.classList.remove(...[...el.classList].filter((c) => c.startsWith('tone-')));
    el.classList.add('it', `it-${item.kind}`, `tone-${item.tone ?? 'plain'}`);
    const { x, y, w, h } = item.rect;
    Object.assign(el.style, { left: px(x), top: px(y), width: px(w), height: px(h) });
    if (item.kind === 'line') {
      el.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
      const line = el.firstElementChild as SVGPolylineElement;
      line.setAttribute('points', pointsAttr(item.points));
      line.style.strokeDasharray = '';
      return;
    }
    const part = (name: string) => el.querySelector<HTMLElement>(`.it-${name}`)!;
    part('label').textContent = item.text ?? '';
    part('tag').textContent = item.tag ?? '';
    part('sub').textContent = item.sub ?? '';
    if (item.kind === 'bar') part('fill').style.width = `${(item.fill ?? 0) * 100}%`;
  }

  /* ---------------------------------------------------------------- */
  /* 동작                                                               */
  /* ---------------------------------------------------------------- */

  private apply(a: Action, ms: number): void {
    switch (a.type) {
      case 'focus':
        this.host.classList.add('is-focus');
        for (const [id, { el }] of this.nodes) el.classList.toggle('in-focus', a.ids.includes(id));
        break;
      case 'unfocus':
        this.host.classList.remove('is-focus');
        for (const { el } of this.nodes.values()) el.classList.remove('in-focus');
        break;
      case 'set':
        this.set(a, ms);
        break;
      case 'add':
        this.add(a, ms);
        break;
      case 'remove':
        this.remove(a, ms);
        break;
      case 'arrow':
        this.arrow(a, ms);
        break;
      case 'clearMarks':
        this.host.querySelectorAll('.stage-mark').forEach((el) => this.leave(el, ms));
        break;
      case 'trace':
        this.trace(a, ms);
        break;
      case 'wait':
        break;
    }
  }

  // 색과 글은 CSS 전환으로 바뀌고, 자리가 바뀌면 미끄러지고, pop이면 글씨가 0.3 → 1.2 → 1배로 튄다
  private set(a: Of<'set'>, ms: number): void {
    const node = this.nodes.get(a.id);
    if (!node) return;
    const { item, el } = node;
    const was = { rect: item.rect, points: item.points ?? [] };
    Object.assign(item, structuredClone(a.patch));
    this.draw(node);
    const dx = was.rect.x - item.rect.x;
    const dy = was.rect.y - item.rect.y;
    if (this.motion && (dx || dy)) el.animate([{ transform: shift(dx, dy) }, { transform: 'none' }], { duration: ms, easing: SLIDE });
    if (a.pop) {
      el.querySelector('.it-label')?.animate(this.motion
        ? [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.2)', opacity: 1, offset: 0.6 }, { transform: 'scale(1)' }]
        : [{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'ease-out' });
    }
    // 길 선이 한 칸 늘어나면 늘어난 만큼만 그어 나간다
    const points = item.points ?? [];
    const grows = points.length > was.points.length && was.points.every((p, i) => p[0] === points[i][0] && p[1] === points[i][1]);
    if (item.kind === 'line' && a.patch.points && grows && this.motion) this.stroke(el, lengthOf(was.points), lengthOf(points), ms, SLIDE);
  }

  // from 물체 자리에서 포물선으로 날아오고, from이 없으면 그 자리에 나타난다(테두리는 내려앉는다)
  private add(a: Of<'add'>, ms: number): void {
    this.nodes.get(a.item.id)?.el.remove();
    const { item, el } = this.create(structuredClone(a.item));
    const from = a.from === undefined ? undefined : this.nodes.get(a.from);
    if (from && this.motion) {
      const [cx, cy] = middle(from.item.rect);
      this.fly(el, [cx - item.rect.w / 2 - item.rect.x, cy - item.rect.h / 2 - item.rect.y], [0, 0], ms, false);
    } else if (item.kind === 'ring' && this.motion) {
      el.animate([{ transform: 'scale(1.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: ms, easing: LAND });
    } else {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'ease-out' });
    }
  }

  // into 물체 쪽으로 날아가 줄어들며 사라지고, into가 없으면 그 자리에서 사라진다
  private remove(a: Of<'remove'>, ms: number): void {
    const node = this.nodes.get(a.id);
    if (!node) return;
    this.nodes.delete(a.id);
    const { item, el } = node;
    const into = a.into === undefined ? undefined : this.nodes.get(a.into);
    if (into && this.motion) {
      const [cx, cy] = middle(into.item.rect);
      el.classList.add('is-leaving');
      this.fly(el, [0, 0], [cx - item.rect.w / 2 - item.rect.x, cy - item.rect.h / 2 - item.rect.y], ms, true);
    } else {
      this.leave(el, ms);
    }
  }

  // 시작 칸 중심에서 12px 나가 끝 칸 중심 20px 앞까지 선을 긋고, 화살촉은 판정 색. 판정 표시는 끝 칸 위 가운데
  private arrow(a: Of<'arrow'>, ms: number): void {
    const from = this.nodes.get(a.from);
    const to = this.nodes.get(a.to);
    if (!from || !to) return;
    const [x1, y1] = middle(from.item.rect);
    const [x2, y2] = middle(to.item.rect);
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
    const [sx, sy, ex, ey] = [x1 + ux * 12, y1 + uy * 12, x2 - ux * 20, y2 - uy * 20];
    // 화살촉: 끝점을 가운데에 둔 16px 삼각형(시안의 marker와 같은 크기)
    const head: Point[] = [[ex + ux * 8, ey + uy * 8], [ex - ux * 8 - uy * 8, ey - uy * 8 + ux * 8], [ex - ux * 8 + uy * 8, ey - uy * 8 - ux * 8]];
    const g = svg('g', { class: `stage-mark arrow is-${a.verdict}` });
    g.append(svg('line', { x1: sx, y1: sy, x2: ex, y2: ey }), svg('polygon', { points: pointsAttr(head) }));
    this.marks.append(g);
    const badge = span(`stage-mark badge is-${a.verdict}`);
    badge.textContent = a.label;
    Object.assign(badge.style, { left: px(x2), top: px(to.item.rect.y - 11) });
    this.host.append(badge);
    if (!this.motion) {
      for (const el of [g, badge]) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms });
      return;
    }
    g.style.transformOrigin = `${sx}px ${sy}px`;
    g.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: ms * 0.6, easing: 'ease-out' });
    badge.animate([{ opacity: 0, transform: 'translate(-50%, 5px) scale(.7)' }, { opacity: 1, transform: 'translate(-50%, 0) scale(1)' }],
      { duration: ms * 0.5, delay: ms * 0.5, easing: 'ease-out', fill: 'backwards' });
  }

  // line 물체를 처음부터 끝까지 그어 나간다
  private trace(a: Of<'trace'>, ms: number): void {
    const node = this.nodes.get(a.id);
    if (!node) return;
    node.item.points = structuredClone(a.points);
    this.draw(node);
    this.stroke(node.el, 0, lengthOf(a.points), ms, FLY);
  }

  /* ---------------------------------------------------------------- */
  /* 움직임 조각                                                         */
  /* ---------------------------------------------------------------- */

  // 선의 from~to 길이 구간을 stroke-dashoffset으로 그어 나간다
  private stroke(el: Element, from: number, to: number, ms: number, easing: string): void {
    const line = el.querySelector('polyline');
    if (!line || to <= from) return;
    line.style.strokeDasharray = `${to}`;
    line.animate([{ strokeDashoffset: to - from }, { strokeDashoffset: 0 }], { duration: ms, easing }).onfinish = () => {
      line.style.strokeDasharray = '';
    };
  }

  // 지금 자리 기준 (x1, y1) → (x2, y2)로 위로 떠올랐다 내려앉는 포물선. leave면 끝에서 줄어들며 사라지고 요소를 지운다
  private fly(el: HTMLElement | SVGSVGElement, [x1, y1]: Point, [x2, y2]: Point, ms: number, leave: boolean): void {
    const top = shift((x1 + x2) / 2, Math.min(y1, y2) - 22, ' scale(1.08)');
    el.classList.add('is-flying');
    const frames: Keyframe[] = leave
      ? [{ transform: shift(x1, y1) }, { transform: top, offset: 0.4 }, { transform: shift(x2, y2), opacity: 1, offset: 0.8 },
        { transform: shift(x2, y2, ' scale(.6)'), opacity: 0 }]
      : [{ transform: shift(x1, y1) }, { transform: top, offset: 0.5 }, { transform: shift(x2, y2) }];
    el.animate(frames, { duration: ms, easing: FLY, fill: leave ? 'forwards' : 'none' }).onfinish = () => {
      if (leave) el.remove();
      else el.classList.remove('is-flying');
    };
  }

  // 그 자리에서 흐려지며 사라지고 요소를 지운다
  private leave(el: Element, ms: number): void {
    el.classList.add('is-leaving');
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: 'ease-in', fill: 'forwards' }).onfinish = () => el.remove();
  }
}
