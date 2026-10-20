import type { Action, AlgorithmStep, Visualization } from './model.ts';

// 1× 기준 동작 길이(ms). 무대는 이 시각표대로 움직이고, 재생기는 진행 막대를 이 길이에 맞춰 흘린다.
export const DUR = { focus: 200, unfocus: 200, set: 260, setMove: 420, add: 460, remove: 460, arrow: 300, clearMarks: 180, trace: 1200 } as const;
export const PHASE_GAP = 140;
export const STEP_TAIL = 320;
export const KEYFRAME_TAIL = 1200;
export const MIN_PHASE = 500; // 자막을 읽을 틈. 움직임 줄이기에서도 지킨다
const REDUCED_MAX = 120;

export interface PlannedAction { action: Action; start: number; duration: number }
export interface PlannedPhase { label: string; caption: string; start: number; end: number; actions: PlannedAction[] }
export interface StepPlan { phases: PlannedPhase[]; total: number } // 1× 기준 ms, 시각은 모두 단계 시작부터

const lengthOf = (a: Action): number => {
  switch (a.type) {
    case 'wait': return a.ms;
    case 'set': return a.patch.rect ? DUR.setMove : DUR.set;
    default: return DUR[a.type];
  }
};

// 동작은 앞 묶음(together가 아닌 동작과 그 뒤 together 동작들)이 모두 끝나면 시작하고,
// together 동작은 자기 묶음과 같이 시작한다.
export function planStep(step: AlgorithmStep, opts: { reducedMotion?: boolean } = {}): StepPlan {
  const phases: PlannedPhase[] = [];
  let at = 0;
  for (const { label, caption, actions } of step.phases) {
    const start = at;
    let groupStart = start;
    let groupEnd = start;
    const planned = actions.map((action): PlannedAction => {
      const length = lengthOf(action);
      const duration = opts.reducedMotion && action.type !== 'wait' ? Math.min(length, REDUCED_MAX) : length;
      if (!action.together) groupStart = groupEnd;
      groupEnd = Math.max(groupEnd, groupStart + duration);
      return { action, start: groupStart, duration };
    });
    const end = Math.max(start + MIN_PHASE, ...planned.map((p) => p.start + p.duration));
    phases.push({ label, caption, start, end, actions: planned });
    at = end + PHASE_GAP;
  }
  const last = phases.at(-1)?.end ?? 0;
  return { phases, total: last + (step.isKeyframe ? KEYFRAME_TAIL : STEP_TAIL) };
}

// 마디 표시줄에 늘 보일 이름: 두 단계 이상에 나오는 마디 이름, 처음 나온 순서
export function cycleLabels(viz: Visualization): string[] {
  const steps = new Map<string, number>();
  for (const step of viz.steps) {
    for (const label of new Set(step.phases.map((p) => p.label))) steps.set(label, (steps.get(label) ?? 0) + 1);
  }
  return [...steps].filter(([, n]) => n > 1).map(([label]) => label);
}
