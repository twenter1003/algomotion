import React from 'react';
import type { ParametricData } from '../../types';

export const ParametricVisualizer: React.FC<{ data: ParametricData; note: React.ReactNode }> = ({ data, note }) => {
  const { left, right, mid, n, times, counts, total, answer, maxTime, phase } = data;
  const pct = (t: number) => ((Math.min(Math.max(t, 1), maxTime) - 1) / (maxTime - 1)) * 100;
  const ticks = [1, ...[0.25, 0.5, 0.75].map((f) => Math.round(maxTime * f)), maxTime];
  const hasRange = left <= right;
  const shown = total ?? 0;

  const verdict =
    phase === 'pass'
      ? '충분 → 더 짧게'
      : phase === 'fail'
        ? '부족 → 더 길게'
        : phase === 'done'
          ? '정답 확정'
          : phase === 'check'
            ? `${shown}명 ${shown >= n ? '≥' : '<'} ${n}명`
            : 'mid를 정해 검사합니다';

  return (
    <div className="viz">
      <div className="viz-head">
        {note}
        <span className="info-pill">
          answer = <strong>{answer ?? '-'}</strong>분
        </span>
      </div>

      <div className="number-line" aria-hidden="true">
        <div className="number-line-head">
          <span className="number-line-label">탐색 구간</span>
          <span className="number-line-range">{hasRange ? `[${left}, ${right}]` : `끝 (left ${left} > right ${right})`}</span>
        </div>
        <div className="track">
          {hasRange && (
            <>
              <div
                className="track-range"
                style={{ left: `${pct(left)}%`, width: `max(6px, ${pct(right) - pct(left)}%)` }}
              />
              <span className="track-label is-left" style={{ left: `${pct(left)}%` }}>
                left {left}
              </span>
              <span className="track-label is-right" style={{ left: `${pct(right)}%` }}>
                right {right}
              </span>
            </>
          )}
          {answer !== null && <span className="track-answer" style={{ left: `${pct(answer)}%` }} />}
          {mid !== null && (
            <span className="track-mid" style={{ left: `${pct(mid)}%` }}>
              <span className="track-mid-label">mid {mid}</span>
            </span>
          )}
        </div>
        <div className="track-ticks">
          {ticks.map((t) => (
            <span key={t} style={{ left: `${pct(t)}%` }}>
              {t}분
            </span>
          ))}
        </div>
      </div>

      <ul className="officer-list">
        {times.map((t, idx) => (
          <li key={idx} className="officer">
            <div className="officer-meta">
              <span className="officer-name">심사관 {idx + 1}</span>
              <span className="officer-speed">{t}분에 1명</span>
            </div>
            <div className="officer-calc">
              {mid === null ? (
                '아직 mid가 없습니다'
              ) : (
                <>
                  ⌊{mid} ÷ {t}⌋ = <strong>{counts[idx]}명</strong>
                </>
              )}
            </div>
            <div className="tokens" aria-hidden="true">
              {Array.from({ length: counts[idx] }, (_, k) => (
                <span key={k} className="token" />
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className={`tally is-${phase}`}>
        <div className="tally-numbers">
          <span className="tally-total">{shown}명</span>
          <span className="tally-target">/ 목표 {n}명</span>
        </div>
        <div className="tally-bar" aria-hidden="true">
          <div className="tally-fill" style={{ width: `${Math.min(100, (shown / n) * 100)}%` }} />
        </div>
        <span className="tally-verdict">{verdict}</span>
      </div>
    </div>
  );
};
