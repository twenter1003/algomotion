import React from 'react';
import type { Cell, GridData } from '../../types';

const keyOf = ([r, c]: Cell) => `${r},${c}`;

export const GridVisualizer: React.FC<{ data: GridData; note: React.ReactNode }> = ({ data, note }) => {
  const { grid, dist, current, queue, added, path } = data;
  const rows = grid.length;
  const cols = grid[0].length;
  const onPath = new Set(path.map(keyOf));
  const queueOrder = new Map(queue.map((cell, idx) => [keyOf(cell), idx + 1]));
  const justAdded = new Set(added.map(keyOf));
  const currentKey = current ? keyOf(current) : '';

  return (
    <div className="viz">
      <div className="viz-head">
        {note}
        <div className="queue-strip">
          <span className="strip-label">큐</span>
          {queue.length === 0 ? (
            <span className="strip-empty">비어 있음</span>
          ) : (
            <>
              <span className="strip-end">앞</span>
              <ol className="queue-items" aria-label="큐, 앞에서부터">
                {queue.map((cell) => (
                  <li key={keyOf(cell)} className="queue-item">
                    ({cell[0]}, {cell[1]})
                  </li>
                ))}
              </ol>
              <span className="strip-end">뒤</span>
            </>
          )}
        </div>
      </div>

      <div className="grid-board" style={{ gridTemplateColumns: `repeat(${cols}, var(--cell))` }} aria-hidden="true">
        {grid.flatMap((row, r) =>
          row.map((open, c) => {
            const k = `${r},${c}`;
            let state = 'open';
            if (!open) state = 'wall';
            else if (onPath.has(k)) state = 'path';
            else if (k === currentKey) state = 'current';
            else if (queueOrder.has(k)) state = 'queued';
            else if (dist[r][c] > 0) state = 'visited';
            const isStart = r === 0 && c === 0;
            const isGoal = r === rows - 1 && c === cols - 1;

            return (
              <div key={k} className={`cell is-${state}${justAdded.has(k) ? ' is-new' : ''}`}>
                {open === 1 && (isStart || isGoal) && <span className="cell-tag">{isStart ? '출발' : '도착'}</span>}
                {state === 'queued' && <span className="cell-badge">큐 {queueOrder.get(k)}</span>}
                {open === 1 && dist[r][c] > 0 && <span className="cell-dist">{dist[r][c]}</span>}
                {open === 1 && (
                  <span className="cell-coord">
                    {r},{c}
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>

      <ul className="legend">
        <li>
          <span className="swatch is-current" />
          지금 꺼낸 칸
        </li>
        <li>
          <span className="swatch is-queued" />
          큐에서 대기
        </li>
        <li>
          <span className="swatch is-visited" />
          방문함 (숫자는 거리)
        </li>
        <li>
          <span className="swatch is-wall" />벽
        </li>
        <li>
          <span className="swatch is-path" />
          최단 경로
        </li>
      </ul>
    </div>
  );
};
