import React, { useRef } from 'react';
import type { Approach } from '../engine/model';
import { useLayoutSizes } from '../layoutStore';
import { ResizeHandle } from './ResizeHandle';

// 고른 풀이의 한 줄 평, 복잡도, 평가 이유, 좋은 점과 아쉬운 점
export const ApproachNotes: React.FC<{ approach: Approach }> = ({ approach }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const sizes = useLayoutSizes();
  const customH = sizes.heights.notes;

  return (
    <section className="panel approach-notes-card" aria-label="풀이 평가">
      <div
        ref={bodyRef}
        className="approach-notes"
        style={customH !== undefined ? { height: customH, overflowY: 'auto' } : undefined}
      >
        <div className="notes-head">
          <p className="notes-verdict">{approach.verdict}</p>
          <div className="metric-chips">
            <span className="metric-chip">
              시간 <code>{approach.timeComplexity}</code>
            </span>
            <span className="metric-chip">
              공간 <code>{approach.spaceComplexity}</code>
            </span>
          </div>
        </div>

        <p className={`why-box rank-${approach.rank.toLowerCase()}`}>
          <strong>이렇게 평가한 이유</strong>
          {approach.whyThisRank}
        </p>

        <div className="pros-cons">
          <div>
            <h2 className="pros-cons-title">좋은 점</h2>
            <ul className="pros-cons-list">
              {approach.pros.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="pros-cons-title">아쉬운 점</h2>
            <ul className="pros-cons-list">
              {approach.cons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <ResizeHandle id="notes" targetRef={bodyRef} label="풀이 평가" min={100} max={800} />
    </section>
  );
};
