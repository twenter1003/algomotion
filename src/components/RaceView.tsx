import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import type { Approach, Problem, Visualization } from '../engine/model';
import type { Stage } from '../engine/stage';
import { planTicks, type Tick } from '../engine/timeline';
import { ApproachLabel } from './ApproachLabel';
import { StageView } from './StageView';

const BASE_BEAT = 860; // 1× 기준 1틱당 860ms (여유 있게 비교할 수 있는 박자)
const SPEEDS = [0.5, 0.75, 1, 1.5, 2];

// 세 판을 나란히 두려면 가장 넓은 장면도 이 배율 이상으로 그려져야 한다. 아니면 위아래로 쌓는다
const MIN_SIDE_SCALE = 0.35;
const BOARD_GAP = 12;
const BOARD_FRAME = 22;

interface RaceBoardProps {
  approach: Approach;
  viz: Visualization;
  ticks: Tick[];
  tick: number;
  workUnit: string;
}

// 작은 판 하나: 틱마다 다음 프레임 장면으로 부드럽게 넘어가고, 마지막 틱에 닿으면 머리에 '끝!' 도장
const RaceBoard: React.FC<RaceBoardProps> = ({ approach, viz, ticks, tick, workUnit }) => {
  const stageRef = useRef<Stage | null>(null);
  const last = ticks.length - 1;
  const index = Math.min(tick, last);
  const curTick = index >= 0 ? ticks[index] : null;

  useEffect(() => {
    if (index < 0) stageRef.current?.renderTick(null, viz.initial);
    else stageRef.current?.tweenTick(ticks[index], viz.initial);
  }, [viz, ticks, index]);

  return (
    <article className="race-card">
      <div className="race-head">
        <h2 className="race-title">
          <ApproachLabel approach={approach} />
        </h2>
        <span className={index === last && last >= 0 ? 'race-stamp is-done' : 'race-stamp'}>끝!</span>
      </div>
      <div className="race-visual">
        <StageView scene={viz.initial} stageRef={stageRef} maxScale={1} />
      </div>
      <p className="race-foot">
        <span>
          {workUnit} {curTick?.work ?? 0}번
        </span>
        <span className="race-tick-info">
          {curTick ? `${curTick.stepIndex + 1}단계 · ${index + 1}/${ticks.length}틱` : `0/${ticks.length}틱`}
        </span>
        {curTick?.workNote && <span>{curTick.workNote}</span>}
      </p>
    </article>
  );
};

// 나란히 비교: 세 풀이를 세분화된 틱 박자로 동시에 돌린다. 일시정지, 한 틱 이동, 속도 조절 지원
export const RaceView: React.FC<{
  problem: Problem;
  vizs: Visualization[];
  codeShown?: boolean;
  onToggleCode?: () => void;
}> = ({ problem, vizs, codeShown, onToggleCode }) => {
  const allTicks = useMemo(() => vizs.map((v) => planTicks(v)), [vizs]);
  const end = Math.max(...allTicks.map((t) => t.length)) - 1;
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const boardsRef = useRef<HTMLDivElement>(null);
  const [boardsWidth, setBoardsWidth] = useState(0);
  const activePlaying = playing && tick < end;

  useEffect(() => {
    if (!activePlaying) return;
    const timer = window.setTimeout(() => setTick((t) => t + 1), BASE_BEAT / speed);
    return () => window.clearTimeout(timer);
  }, [activePlaying, tick, speed]);

  useLayoutEffect(() => {
    const boards = boardsRef.current!;
    const measure = () => setBoardsWidth(boards.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(boards);
    return () => observer.disconnect();
  }, []);

  const widest = Math.max(...vizs.map((v) => v.initial.width));
  const stacked = (boardsWidth - 2 * BOARD_GAP) / 3 - BOARD_FRAME < MIN_SIDE_SCALE * widest;
  const progress = end > 0 ? ((tick + 1) / (end + 1)) * 100 : 0;

  return (
    <section className="panel race" aria-label="나란히 비교">
      <div className="race-bar">
        <span className="race-input">{problem.demo.label}</span>
        <div className="race-bar-actions">
          {onToggleCode && (
            <button
              type="button"
              className="btn-outline head-btn list-toggle"
              aria-expanded={codeShown}
              onClick={onToggleCode}
            >
              <span aria-hidden="true">&lt;/&gt;</span> {codeShown ? '코드 접기' : '코드 펼치기'}
            </button>
          )}
          <button
            type="button"
            className="btn-outline head-btn"
            onClick={() => {
              setTick(-1);
              setPlaying(true);
            }}
          >
            <span aria-hidden="true">↺</span> 다시 경주
          </button>
        </div>
      </div>

      <div ref={boardsRef} className={stacked ? 'race-boards is-stacked' : 'race-boards'}>
        {boardsWidth > 0 &&
          problem.approaches.map((approach, i) => (
            <RaceBoard
              key={approach.id}
              approach={approach}
              viz={vizs[i]}
              ticks={allTicks[i]}
              tick={tick}
              workUnit={problem.workUnit}
            />
          ))}
      </div>

      <div className="controls race-controls">
        <input
          type="range"
          className="timeline"
          min={-1}
          max={end}
          value={tick}
          onChange={(e) => {
            setPlaying(false);
            setTick(Number(e.target.value));
          }}
          aria-label="경주 틱 이동"
          style={{ '--progress': `${progress}%` } as React.CSSProperties}
        />
        <div className="controls-row">
          <div className="transport">
            <button
              type="button"
              className="icon-btn is-ghost"
              onClick={() => {
                setPlaying(false);
                setTick(-1);
              }}
              aria-label="처음으로"
              title="처음으로"
            >
              <RotateCcw size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-btn tick-btn"
              disabled={tick < 0}
              onClick={() => {
                setPlaying(false);
                setTick((t) => Math.max(-1, t - 1));
              }}
              aria-label="이전 틱"
              title="이전 틱"
            >
              <ChevronLeft size={19} aria-hidden="true" />
              <span className="tick-btn-label">틱</span>
            </button>
            <button
              type="button"
              className="play-btn"
              onClick={() => {
                if (tick >= end) {
                  setTick(-1);
                  setPlaying(true);
                } else {
                  setPlaying((p) => !p);
                }
              }}
              aria-label={activePlaying ? '일시정지' : '재생'}
              title={activePlaying ? '일시정지' : '재생'}
            >
              {activePlaying ? (
                <Pause size={22} fill="currentColor" aria-hidden="true" />
              ) : (
                <Play size={22} fill="currentColor" className="play-icon" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="icon-btn tick-btn"
              disabled={tick >= end}
              onClick={() => {
                setPlaying(false);
                setTick((t) => Math.min(end, t + 1));
              }}
              aria-label="다음 틱"
              title="다음 틱"
            >
              <span className="tick-btn-label">틱</span>
              <ChevronRight size={19} aria-hidden="true" />
            </button>
          </div>

          <div className="playback-options">
            <div className="segmented speed-switch" role="group" aria-label="경주 속도">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="segmented-btn"
                  aria-pressed={speed === s}
                  onClick={() => setSpeed(s)}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
