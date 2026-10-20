import React, { useEffect, useRef, useState } from 'react';
import type { Approach, Problem, Visualization } from '../engine/model';
import type { Stage } from '../engine/stage';
import { ApproachLabel } from './ApproachLabel';
import { StageView } from './StageView';

const BEAT = 600; // 1단계 600ms (시안 ②의 경주 박자)

interface RaceBoardProps {
  approach: Approach;
  viz: Visualization;
  tick: number;
  workUnit: string;
}

// 작은 판 하나: 박자마다 다음 단계의 끝난 장면으로 부드럽게 넘어가고, 마지막 단계에 닿으면 '끝!' 도장
const RaceBoard: React.FC<RaceBoardProps> = ({ approach, viz, tick, workUnit }) => {
  const stageRef = useRef<Stage | null>(null);
  const last = viz.steps.length - 1;
  const index = Math.min(tick, last);
  const step = index >= 0 ? viz.steps[index] : undefined;

  // 다시 경주(-1)는 처음 장면을 바로 그리고, 앞으로 갈 때만 tween으로 잇는다
  useEffect(() => {
    if (index < 0) stageRef.current?.render(viz.initial);
    else stageRef.current?.tween(viz.steps[index].scene);
  }, [viz, index]);

  return (
    <article className="race-card">
      <h2 className="race-head">
        <ApproachLabel approach={approach} />
      </h2>
      <div className="race-visual">
        <StageView scene={viz.initial} stageRef={stageRef} maxScale={1} />
        {index === last && <span className="race-stamp">끝!</span>}
      </div>
      <p className="race-foot">
        <span>
          {workUnit} {step?.work ?? 0}번
        </span>
        {step?.workNote && <span>{step.workNote}</span>}
      </p>
    </article>
  );
};

// 나란히 비교: 세 풀이를 같은 박자로 동시에 돌린다. 단계가 많은 풀이는 계속 돌고, 다 끝나면 멈춘다
export const RaceView: React.FC<{ problem: Problem; vizs: Visualization[] }> = ({ problem, vizs }) => {
  const [tick, setTick] = useState(-1); // -1은 시작 전, k는 판마다 k단계(끝난 판은 마지막 단계)
  const end = Math.max(...vizs.map((v) => v.steps.length)) - 1;

  useEffect(() => {
    if (tick >= end) return;
    const timer = window.setTimeout(() => setTick(tick + 1), BEAT);
    return () => window.clearTimeout(timer);
  }, [tick, end]);

  return (
    <section className="panel race" aria-label="나란히 비교">
      <div className="race-bar">
        <span className="race-input">{problem.demo.label}</span>
        <button type="button" className="btn-outline" onClick={() => setTick(-1)}>
          <span aria-hidden="true">↺</span> 다시 경주
        </button>
      </div>
      <div className="race-boards">
        {problem.approaches.map((approach, i) => (
          <RaceBoard key={approach.id} approach={approach} viz={vizs[i]} tick={tick} workUnit={problem.workUnit} />
        ))}
      </div>
    </section>
  );
};
