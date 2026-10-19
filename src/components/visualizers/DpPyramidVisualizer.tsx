import React from 'react';
import type { DpData } from '../../types';

export const DpPyramidVisualizer: React.FC<{ data: DpData; note: React.ReactNode }> = ({ data, note }) => {
  const { triangle, dp, active, children, chosen, path } = data;
  const height = triangle.length;
  const keyOf = (r: number, c: number) => `${r},${c}`;
  const onPath = new Set(path.map(([r, c]) => keyOf(r, c)));
  const childKeys = new Set(children.map(([r, c]) => keyOf(r, c)));
  const chosenKey = chosen ? keyOf(chosen[0], chosen[1]) : '';
  // 이미 최종 값이 정해진 칸: 계산 중인 칸보다 아래이거나, 같은 줄의 왼쪽
  const isDone = (r: number, c: number) =>
    active ? r > active[0] || (r === active[0] && c < active[1]) : path.length > 0 || r === height - 1;
  const pathValues = path.map(([r, c]) => triangle[r][c]);

  return (
    <div className="viz">
      <div className="viz-head">
        {note}
        <code className="info-pill">dp[i][j] = 값 + max(아래 두 칸)</code>
      </div>

      <div className="pyramid" aria-hidden="true">
        {triangle.map((row, r) => (
          <div key={r} className="pyramid-row">
            <span className="row-label">{r}층</span>
            <div className="row-nodes">
              {row.map((orig, c) => {
                const k = keyOf(r, c);
                let state = '';
                if (onPath.has(k)) state = 'path';
                else if (active && active[0] === r && active[1] === c) state = 'active';
                else if (k === chosenKey) state = 'chosen';
                else if (childKeys.has(k)) state = 'child';
                else if (isDone(r, c)) state = 'done';

                return (
                  <div key={c} className={`node${state ? ` is-${state}` : ''}`}>
                    <span className="node-value">{dp[r][c]}</span>
                    {dp[r][c] !== orig && <span className="node-orig">원래 {orig}</span>}
                    {state === 'chosen' && <span className="node-badge">큰 값</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="dp-footer">
        {active ? (
          <div className="calc-line">
            <span className="calc-chip">{triangle[active[0]][active[1]]}</span>
            <span className="calc-op">+</span>
            <span className="calc-chip is-chosen">max({children.map(([r, c]) => dp[r][c]).join(', ')})</span>
            <span className="calc-op">=</span>
            <span className="calc-chip is-result">{dp[active[0]][active[1]]}</span>
          </div>
        ) : path.length > 0 ? (
          <p className="dp-result">
            <span>
              최댓값 <strong>{dp[0][0]}</strong>
            </span>
            <span>경로 {pathValues.join(' → ')}</span>
          </p>
        ) : (
          <p className="dp-hint">맨 아래 줄은 더 내려갈 곳이 없어 자기 값이 곧 최댓값입니다.</p>
        )}
      </div>
    </div>
  );
};
