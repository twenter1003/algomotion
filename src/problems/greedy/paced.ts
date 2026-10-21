// 그리디 문제들이 함께 쓰는 기록기: 마디 자막이 글자당 20ms 이상 보이도록, 마디가 끝날 때 모자란 만큼 wait을 덧붙인다.
// 자막은 마디가 끝난 뒤 다음 마디가 시작할 때까지(마디 사이 PHASE_GAP, 단계의 마지막 마디는 꼬리 시간) 계속 보인다.
import type { Action, AlgorithmStep, Language } from '../../engine/model.ts';
import { StepRecorder } from '../../engine/recorder.ts';
import { KEYFRAME_TAIL, PHASE_GAP, STEP_TAIL, planStep } from '../../engine/timeline.ts';

const MS_PER_CHAR = 20;

export class PacedRecorder extends StepRecorder {
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

  // 지금 마디의 자막이 보일 시간이 모자라면 마디 끝에 wait을 더한다
  private settle(more: boolean): void {
    if (!this.caption) return;
    const hold = more ? PHASE_GAP : this.keyframe ? KEYFRAME_TAIL : STEP_TAIL;
    const plan = planStep({ phases: [{ label: '', caption: '', actions: this.acts }] } as unknown as AlgorithmStep).phases[0];
    const busy = Math.max(0, ...plan.actions.map((a) => a.start + a.duration)); // MIN_PHASE를 빼고 동작만 센 끝 시각
    const need = MS_PER_CHAR * [...this.caption].length - hold - busy;
    this.caption = '';
    if (need > 0 && busy + need > plan.end) super.do({ type: 'wait', ms: Math.ceil(need) });
  }
}
