import React, { useRef } from 'react';
import type { Problem, Visualization } from '../engine/model';
import { useLayoutSizes } from '../layoutStore';
import { ApproachLabel } from './ApproachLabel';
import { ResizeHandle } from './ResizeHandle';

interface CompareBarsProps {
  problem: Problem;
  vizs: Visualization[];
  active: number;
}

// 세 풀이가 마지막 단계까지 한 일의 양. 막대 길이는 셋 중 가장 많이 한 풀이 기준이고, 답은 정석과 견준다
export const CompareBars: React.FC<CompareBarsProps> = ({ problem, vizs, active }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const sizes = useLayoutSizes();
  const customH = sizes.heights.bars;
  const lasts = vizs.map((v) => v.steps[v.steps.length - 1]);
  const most = Math.max(1, ...lasts.map((s) => s.work));
  const best = JSON.stringify(lasts[0].answer);

  return (
    <section className="panel compare-bars-card" aria-labelledby="compare-bars-title">
      <div
        ref={bodyRef}
        className="compare-bars"
        style={customH !== undefined ? { height: customH, overflowY: 'auto' } : undefined}
      >
        <h2 id="compare-bars-title" className="section-title">
          한눈에 비교: {problem.workUnit}
        </h2>
        <ul className="bar-list">
          {problem.approaches.map((approach, i) => {
            const { work, workNote, answer } = lasts[i];
            const got = JSON.stringify(answer);
            return (
              <li key={approach.id} className={i === active ? 'bar-row is-active' : 'bar-row'}>
                <span className="bar-name">
                  <ApproachLabel approach={approach} />
                </span>
                <span className="bar-track">
                  <span className={`bar-fill rank-${approach.rank.toLowerCase()}`} style={{ width: `${(work / most) * 100}%` }} />
                  <span className="bar-value">
                    {work}번{workNote ? ` · ${workNote}` : ''}
                  </span>
                </span>
                <span className={got === best ? 'result-chip is-right' : 'result-chip is-wrong'}>
                  {got === best ? '정답' : `오답 ${got}`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <ResizeHandle id="bars" targetRef={bodyRef} label="한눈에 비교" min={90} max={600} />
    </section>
  );
};
