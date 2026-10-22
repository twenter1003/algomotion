import type { Action, AlgorithmStep, CodeHighlights, Scene, Visualization } from './model.ts';

// 1× 기준 동작 길이(ms). 무대는 이 시각표대로 움직이고, 재생기는 진행 막대를 이 길이에 맞춰 흘린다.
export const DUR = { focus: 200, unfocus: 200, set: 260, setMove: 420, add: 460, remove: 460, arrow: 300, clearMarks: 180, trace: 1200 } as const;
export const PHASE_GAP = 140;
export const STEP_TAIL = 320;
export const KEYFRAME_TAIL = 1200;
export const MIN_PHASE = 500; // 자막을 읽을 틈. 움직임 줄이기에서도 지킨다
const REDUCED_MAX = 120;

// 틱(프레임) 단위 재생 기준 길이(ms). 각 동작이 여유 있게 보이고 끝난 뒤 눈으로 확인할 틈을 둔다.
export const TICK_DUR = {
  focus: 260,
  unfocus: 260,
  set: 380,
  setMove: 560,
  add: 600,
  remove: 600,
  arrow: 460,
  clearMarks: 240,
  trace: 1400,
} as const;
export const TICK_HOLD = 560;
export const PHASE_HEAD_HOLD = 760;
export const STEP_END_HOLD = 380;
export const KEYFRAME_END_HOLD = 1200;

export type ArrowMark = Extract<Action, { type: 'arrow' }>;
export interface PlannedAction { action: Action; start: number; duration: number }
export interface PlannedPhase { label: string; caption: string; start: number; end: number; actions: PlannedAction[] }
export interface StepPlan { phases: PlannedPhase[]; total: number } // 1× 기준 ms, 시각은 모두 단계 시작부터

export interface Tick {
  index: number;
  stepIndex: number;
  phaseIndex: number;
  tickInStep: number;
  ticksInStep: number;
  tickInPhase: number;
  ticksInPhase: number;
  stepTitle: string;
  label: string;
  caption: string;
  codeHighlights: CodeHighlights;
  variables: Record<string, string | number>;
  work: number;
  workNote?: string;
  isKeyframe?: boolean;
  actions: PlannedAction[];
  beforeScene: Scene;
  scene: Scene;
  beforeFocus: string[] | null;
  focus: string[] | null;
  beforeMarks: ArrowMark[];
  marks: ArrowMark[];
  duration: number;
}

const lengthOf = (a: Action): number => {
  switch (a.type) {
    case 'wait': return a.ms;
    case 'set': return a.patch.rect ? DUR.setMove : DUR.set;
    default: return DUR[a.type];
  }
};

const tickLengthOf = (a: Action): number => {
  switch (a.type) {
    case 'wait': return a.ms;
    case 'set': return a.patch.rect ? TICK_DUR.setMove : TICK_DUR.set;
    default: return TICK_DUR[a.type];
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

const isMeta = (a: Action) => a.type === 'focus' || a.type === 'unfocus' || a.type === 'clearMarks';
const isMetaGroup = (acts: Action[]) => acts.length > 0 && acts.every(isMeta);

function applyToState(scene: Scene, focus: string[] | null, marks: ArrowMark[], a: Action): { focus: string[] | null; marks: ArrowMark[] } {
  const { items } = scene;
  switch (a.type) {
    case 'set': {
      const item = items.find((i) => i.id === a.id);
      if (item) Object.assign(item, structuredClone(a.patch));
      return { focus, marks };
    }
    case 'add': {
      const idx = items.findIndex((i) => i.id === a.item.id);
      if (idx >= 0) items[idx] = structuredClone(a.item);
      else items.push(structuredClone(a.item));
      return { focus, marks };
    }
    case 'remove': {
      const idx = items.findIndex((i) => i.id === a.id);
      if (idx >= 0) items.splice(idx, 1);
      return { focus, marks };
    }
    case 'trace': {
      const item = items.find((i) => i.id === a.id);
      if (item) item.points = structuredClone(a.points);
      return { focus, marks };
    }
    case 'focus':
      return { focus: [...a.ids], marks };
    case 'unfocus':
      return { focus: null, marks };
    case 'arrow':
      return { focus, marks: [...marks, structuredClone(a)] };
    case 'clearMarks':
      return { focus, marks: [] };
    case 'wait':
      return { focus, marks };
  }
}

// 시각화의 단계(Step)와 마디(Phase) 안 동작 묶음을 세분화된 틱(프레임) 단위로 나눈다.
// 화살표 판정 하나, 토큰 이동 하나, 칸 갱신 하나가 각각 독립된 틱이 되어 천천히 재생하거나 한 틱씩 끊어 볼 수 있다.
export function planTicks(viz: Visualization, opts: { reducedMotion?: boolean } = {}): Tick[] {
  const ticks: Tick[] = [];
  let scene = structuredClone(viz.initial);
  let focus: string[] | null = null;
  let marks: ArrowMark[] = [];
  let deferredMeta: Action[] = [];

  for (let stepIndex = 0; stepIndex < viz.steps.length; stepIndex++) {
    const step = viz.steps[stepIndex];
    const isLastStep = stepIndex === viz.steps.length - 1;
    const stepStartIdx = ticks.length;

    for (let phaseIndex = 0; phaseIndex < step.phases.length; phaseIndex++) {
      const phase = step.phases[phaseIndex];
      const isVeryLastPhase = isLastStep && phaseIndex === step.phases.length - 1;

      const raw: Action[][] = [];
      for (const a of phase.actions) {
        if (!a.together || raw.length === 0) raw.push([structuredClone(a)]);
        else raw.at(-1)!.push(structuredClone(a));
      }

      const groups: { acts: Action[]; waitMs: number }[] = [];
      let pendingWait = 0;
      for (const g of raw) {
        const waitMs = g.filter((a) => a.type === 'wait').reduce((s, a) => s + a.ms, 0);
        const acts = g.filter((a) => a.type !== 'wait');
        if (acts.length === 0) {
          if (groups.length > 0) groups.at(-1)!.waitMs += waitMs;
          else pendingWait += waitMs;
        } else {
          groups.push({ acts, waitMs: pendingWait + waitMs });
          pendingWait = 0;
        }
      }

      const bundles: { leadMeta: Action[]; visual: Action[]; trailMeta: Action[]; waitMs: number }[] = [];
      let prefixActs: Action[] = [...deferredMeta];
      deferredMeta = [];
      let prefixWait = 0;

      for (const g of groups) {
        if (isMetaGroup(g.acts)) {
          prefixActs.push(...g.acts);
          prefixWait += g.waitMs;
        } else {
          const inlineMeta = g.acts.filter(isMeta);
          const visual = g.acts.filter((a) => !isMeta(a));
          bundles.push({
            leadMeta: [...prefixActs, ...inlineMeta],
            visual,
            trailMeta: [],
            waitMs: prefixWait + g.waitMs,
          });
          prefixActs = [];
          prefixWait = 0;
        }
      }

      if (bundles.length === 0) {
        bundles.push({
          leadMeta: prefixActs,
          visual: [],
          trailMeta: [],
          waitMs: pendingWait + prefixWait,
        });
      } else if (prefixActs.length > 0) {
        if (isVeryLastPhase) {
          bundles.at(-1)!.trailMeta.push(...prefixActs);
          bundles.at(-1)!.waitMs += prefixWait;
        } else {
          deferredMeta = prefixActs;
        }
      }

      const ticksInPhase = bundles.length;
      const captionHold = Math.ceil((phase.caption.length * 24) / ticksInPhase);

      for (let tickInPhase = 0; tickInPhase < ticksInPhase; tickInPhase++) {
        const b = bundles[tickInPhase];
        const beforeScene = structuredClone(scene);
        const beforeFocus = focus ? [...focus] : null;
        const beforeMarks = structuredClone(marks);

        const planned: PlannedAction[] = [];
        let mainEnd = 0;
        for (const a of [...b.leadMeta, ...b.visual]) {
          const len = tickLengthOf(a);
          const dur = opts.reducedMotion ? Math.min(len, REDUCED_MAX) : len;
          planned.push({ action: a, start: 0, duration: dur });
          mainEnd = Math.max(mainEnd, dur);
          ({ focus, marks } = applyToState(scene, focus, marks, a));
        }

        let totalAnimEnd = mainEnd;
        for (const a of b.trailMeta) {
          const len = tickLengthOf(a);
          const dur = opts.reducedMotion ? Math.min(len, REDUCED_MAX) : len;
          planned.push({ action: a, start: mainEnd, duration: dur });
          totalAnimEnd = Math.max(totalAnimEnd, mainEnd + dur);
          ({ focus, marks } = applyToState(scene, focus, marks, a));
        }

        const baseHold = Math.max(tickInPhase === 0 ? PHASE_HEAD_HOLD : TICK_HOLD, captionHold, b.waitMs);
        const isLastInStep = phaseIndex === step.phases.length - 1 && tickInPhase === ticksInPhase - 1;
        const stepTail = isLastInStep ? (step.isKeyframe ? KEYFRAME_END_HOLD : STEP_END_HOLD) : 0;
        const duration = opts.reducedMotion
          ? Math.max(MIN_PHASE, totalAnimEnd + 240)
          : Math.max(MIN_PHASE, totalAnimEnd + baseHold + stepTail);

        ticks.push({
          index: ticks.length,
          stepIndex,
          phaseIndex,
          tickInStep: ticks.length - stepStartIdx,
          ticksInStep: 0, // 아래에서 채움
          tickInPhase,
          ticksInPhase,
          stepTitle: step.title,
          label: phase.label,
          caption: phase.caption,
          codeHighlights: phase.codeHighlights ?? step.codeHighlights,
          variables: step.variables,
          work: step.work,
          ...(step.workNote ? { workNote: step.workNote } : {}),
          ...(step.isKeyframe ? { isKeyframe: true } : {}),
          actions: planned,
          beforeScene,
          scene: structuredClone(scene),
          beforeFocus,
          focus: focus ? [...focus] : null,
          beforeMarks,
          marks: structuredClone(marks),
          duration,
        });
      }
    }

    const stepTickCount = ticks.length - stepStartIdx;
    for (let i = stepStartIdx; i < ticks.length; i++) {
      ticks[i].ticksInStep = stepTickCount;
    }
    scene = structuredClone(step.scene);
  }

  return ticks;
}

// 마디 표시줄에 늘 보일 이름: 두 단계 이상에 나오는 마디 이름, 처음 나온 순서
export function cycleLabels(viz: Visualization): string[] {
  const steps = new Map<string, number>();
  for (const step of viz.steps) {
    for (const label of new Set(step.phases.map((p) => p.label))) steps.set(label, (steps.get(label) ?? 0) + 1);
  }
  return [...steps].filter(([, n]) => n > 1).map(([label]) => label);
}
