// 완전탐색 문제들이 함께 쓰는 작은 도구: 나무 배치와 자막 시간 맞추기.
import type { Action, ItemPatch, Point, Rect, Tone, Visualization } from '../../engine/model.ts';
import type { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';
import { together } from '../shared.ts';

export interface Shape { id: string; kids?: Shape[] }

// 나무 배치: 잎마다 가로 칸을 하나씩 차례로 주고, 부모는 첫 자식과 마지막 자식의 가운데에 둔다. 깊이마다 한 줄이다.
export function layoutTree(root: Shape, o: { x: number; y: number; w: number; h: number; gapX: number; gapY: number }): Map<string, Rect> {
  const rects = new Map<string, Rect>();
  let leaf = 0;
  const place = (node: Shape, depth: number): number => {
    const kids = node.kids ?? [];
    const centers = kids.map((kid) => place(kid, depth + 1));
    const cx = centers.length ? (centers[0] + centers[centers.length - 1]) / 2 : o.x + o.w / 2 + leaf++ * (o.w + o.gapX);
    rects.set(node.id, { x: cx - o.w / 2, y: o.y + depth * (o.h + o.gapY), w: o.w, h: o.h });
    return cx;
  };
  place(root, 0);
  return rects;
}

// 가지: 부모 칸 아래 가운데에서 자식 칸 위 가운데까지
export const branch = (parent: Rect, child: Rect): Point[] =>
  [[parent.x + parent.w / 2, parent.y + parent.h], [child.x + child.w / 2, child.y]];

// 자막은 글자당 20ms 이상 보여야 한다. 마디가 그보다 짧게 끝나면 마디 끝에 wait을 덧붙인다(장면은 바뀌지 않는다).
export function holdCaptions(viz: Visualization): Visualization {
  for (const step of viz.steps) {
    const plan = planStep(step);
    step.phases.forEach((phase, i) => {
      const p = plan.phases[i];
      const tail = i < step.phases.length - 1 ? PHASE_GAP : step.isKeyframe ? KEYFRAME_TAIL : STEP_TAIL;
      const need = 20 * [...phase.caption].length;
      if (p.end - p.start + tail >= need) return;
      const actionsEnd = Math.max(p.start, ...p.actions.map((a) => a.start + a.duration)) - p.start;
      phase.actions.push({ type: 'wait', ms: Math.ceil(need - tail - actionsEnd) });
    });
  }
  return viz;
}

// 동작을 짧게 쓰는 도구들(문제 파일마다 같은 모양이라 여기 둔다)
export const wait = (ms: number): Action => ({ type: 'wait', ms });
export const set = (id: string, patch: ItemPatch, pop = false): Action => ({ type: 'set', id, patch, ...(pop ? { pop } : {}) });
export const tone = (id: string, t: Tone, pop = false): Action => set(id, { tone: t }, pop);
// 살피기를 마치며 흐림과 화살표를 걷는다
export const clear = (): Action[] => together([{ type: 'unfocus' }, { type: 'clearMarks' }]);
// 지금 서 있는 자리를 가리키는 고리: 없으면 만들고, 있으면 미끄러뜨린다(rect는 around()로 넓힌 것)
export const ringTo = (rec: StepRecorder, rect: Rect, id = 'ring'): Action =>
  rec.has(id) ? set(id, { rect }) : { type: 'add', item: { id, kind: 'ring', rect } };
