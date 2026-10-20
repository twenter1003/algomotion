import type { Visualization } from '../../engine/model.ts';
import { KEYFRAME_TAIL, MIN_PHASE, PHASE_GAP, planStep, STEP_TAIL } from '../../engine/timeline.ts';

// 자막은 글자당 20ms 이상 보여야 한다. 마디가 그보다 일찍 끝나면 마디 끝에 wait을 덧붙여 채운다.
// 마디가 열려 있는 시간 + 다음 마디까지의 틈(마지막 마디는 단계 꼬리)이 자막이 보이는 시간이다.
export function fit(viz: Visualization): Visualization {
  for (const step of viz.steps) {
    step.phases.forEach((phase, i) => {
      const planned = planStep(step).phases[i];
      const busy = Math.max(0, ...planned.actions.map((a) => a.start + a.duration - planned.start)); // 마디 안에서 동작이 모두 끝나는 때
      const tail = i + 1 < step.phases.length ? PHASE_GAP : step.isKeyframe ? KEYFRAME_TAIL : STEP_TAIL;
      const open = phase.caption.length * 20 - tail; // 마디가 이만큼은 열려 있어야 한다
      if (open > Math.max(MIN_PHASE, busy)) phase.actions.push({ type: 'wait', ms: open - busy });
    });
  }
  return viz;
}
