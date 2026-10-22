import type { Action, AlgorithmStep, CodeHighlights, Item, Phase, Scene, Visualization } from './model.ts';

// 동작을 장면에 적용하면서 단계와 마디를 기록한다.
// 받은 값과 찍어 둔 장면은 모두 깊은 복사본이라, 기록한 뒤에 바깥에서 고쳐도 기록이 바뀌지 않는다.
export class StepRecorder {
  private readonly initial: Scene;
  private readonly scene: Scene;
  private readonly steps: AlgorithmStep[] = [];
  private open?: Omit<AlgorithmStep, 'scene'>;

  constructor(initial: Scene) {
    this.initial = structuredClone(initial);
    this.scene = structuredClone(initial);
  }

  get(id: string): Item {
    return structuredClone(this.find(id));
  }

  has(id: string): boolean {
    return this.scene.items.some((item) => item.id === id);
  }

  // 새 단계를 연다. 열려 있던 단계는 지금 장면을 찍어 닫는다.
  step(meta: Omit<AlgorithmStep, 'phases' | 'scene'>): void {
    this.close();
    this.open = { ...structuredClone(meta), phases: [] };
  }

  phase(label: string, caption: string, codeHighlights?: CodeHighlights): void {
    if (!this.open) throw new Error(`단계를 열기 전에는 마디를 열 수 없습니다: ${label}`);
    const phase: Phase = { label, caption, actions: [] };
    this.open.phases.push(codeHighlights ? { ...phase, codeHighlights: structuredClone(codeHighlights) } : phase);
  }

  do(...actions: Action[]): void {
    const phase = this.open?.phases.at(-1);
    if (!phase) throw new Error('마디를 열기 전에는 동작을 기록할 수 없습니다');
    for (const action of actions) {
      // 장면과 기록이 같은 객체를 나눠 갖지 않도록 각자 복사본을 받는다
      this.apply(structuredClone(action));
      phase.actions.push(structuredClone(action));
    }
  }

  finish(): Visualization {
    this.close();
    if (!this.steps.length) throw new Error('기록한 단계가 없습니다');
    return { initial: this.initial, steps: this.steps };
  }

  private close(): void {
    if (!this.open) return;
    if (!this.open.phases.length) throw new Error(`단계 '${this.open.title}'에 마디가 없습니다`);
    this.steps.push({ ...this.open, scene: structuredClone(this.scene) });
    this.open = undefined;
  }

  private find(id: string): Item {
    const item = this.scene.items.find((i) => i.id === id);
    if (!item) throw new Error(`장면에 없는 물체입니다: ${id}`);
    return item;
  }

  private apply(a: Action): void {
    const { items } = this.scene;
    switch (a.type) {
      case 'set':
        Object.assign(this.find(a.id), a.patch);
        break;
      case 'add':
        if (this.has(a.item.id)) throw new Error(`이미 장면에 있는 물체입니다: ${a.item.id}`);
        if (a.from !== undefined) this.find(a.from);
        items.push(a.item);
        break;
      case 'remove': {
        const i = items.indexOf(this.find(a.id));
        if (a.into !== undefined) this.find(a.into);
        items.splice(i, 1);
        break;
      }
      case 'trace': {
        const line = this.find(a.id);
        if (line.kind !== 'line') throw new Error(`line이 아닌 물체는 trace할 수 없습니다: ${a.id}`);
        line.points = a.points;
        break;
      }
      case 'focus':
        a.ids.forEach((id) => this.find(id));
        break;
      case 'arrow':
        this.find(a.from);
        this.find(a.to);
        break;
      // unfocus, clearMarks, wait은 장면을 바꾸지 않는다
    }
  }
}
