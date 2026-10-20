import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Approach, Problem, Visualization } from '../engine/model';
import type { Stage } from '../engine/stage';
import { ApproachLabel } from './ApproachLabel';
import { StageView } from './StageView';

const BEAT = 600; // 1단계 600ms (시안 ②의 경주 박자)

// 세 판을 나란히 두려면 가장 넓은 장면도 이 배율 이상으로 그려져야 한다. 아니면 위아래로 쌓는다
const MIN_SIDE_SCALE = 0.5;
// 나란히 둘 때 한 판의 폭 = (칸 폭 − 칸 사이 둘) / 3 − 판 둘레. index.css의 .race-boards gap(12px)과
// .race-card 테두리(1px × 2) + .race-visual 안쪽 여백(10px × 2)
const BOARD_GAP = 12;
const BOARD_FRAME = 22;

interface RaceBoardProps {
  approach: Approach;
  viz: Visualization;
  tick: number;
  workUnit: string;
}

// 작은 판 하나: 박자마다 다음 단계의 끝난 장면으로 부드럽게 넘어가고, 마지막 단계에 닿으면 머리에 '끝!' 도장(판을 가리지 않게)
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
      <div className="race-head">
        <h2 className="race-title">
          <ApproachLabel approach={approach} />
        </h2>
        {/* 자리는 늘 잡아 두어 도장이 찍힐 때 머리 줄이 바뀌거나 판이 밀리지 않게 */}
        <span className={index === last ? 'race-stamp is-done' : 'race-stamp'}>끝!</span>
      </div>
      <div className="race-visual">
        <StageView scene={viz.initial} stageRef={stageRef} maxScale={1} />
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
  const boardsRef = useRef<HTMLDivElement>(null);
  const [boardsWidth, setBoardsWidth] = useState(0);
  const end = Math.max(...vizs.map((v) => v.steps.length)) - 1;

  useEffect(() => {
    if (tick >= end) return;
    const timer = window.setTimeout(() => setTick(tick + 1), BEAT);
    return () => window.clearTimeout(timer);
  }, [tick, end]);

  // 판 칸의 폭은 나란히 두든 쌓든 같아서(둘 다 칸을 꽉 채운다) 이 폭으로 정해도 두 배치를 오락가락하지 않는다
  useLayoutEffect(() => {
    const boards = boardsRef.current!;
    const measure = () => setBoardsWidth(boards.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(boards);
    return () => observer.disconnect();
  }, []);

  // 가장 넓은 장면의 판이 나란히 둘 때 MIN_SIDE_SCALE보다 작게 그려지면 쌓는다
  const widest = Math.max(...vizs.map((v) => v.initial.width));
  const stacked = (boardsWidth - 2 * BOARD_GAP) / 3 - BOARD_FRAME < MIN_SIDE_SCALE * widest;

  return (
    <section className="panel race" aria-label="나란히 비교">
      <div className="race-bar">
        <span className="race-input">{problem.demo.label}</span>
        <button type="button" className="btn-outline" onClick={() => setTick(-1)}>
          <span aria-hidden="true">↺</span> 다시 경주
        </button>
      </div>
      <div ref={boardsRef} className={stacked ? 'race-boards is-stacked' : 'race-boards'}>
        {/* 폭을 잰 뒤에 판을 놓아, 판이 처음부터 제 배치에서 배율을 잰다 */}
        {boardsWidth > 0 &&
          problem.approaches.map((approach, i) => (
            <RaceBoard key={approach.id} approach={approach} viz={vizs[i]} tick={tick} workUnit={problem.workUnit} />
          ))}
      </div>
    </section>
  );
};
