import React from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

interface PlayerControlsProps {
  currentTick: number; // -1이면 시작 전
  totalTicks: number;
  currentStep: number; // -1이면 시작 전
  totalSteps: number;
  isPlaying: boolean;
  isAnimating: boolean; // 연출 중이면 막대가 flowMs 동안 다음 틱 끝까지 흐른다
  flowMs: number;
  speed: number;
  tickPause: boolean; // true면 한 틱마다 자동으로 멈춘다(틱 단위 끊어 보기)
  onPlayPause: () => void;
  onPrevTick: () => void;
  onNextTick: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSeekTick: (tickIndex: number) => void;
  onSpeedChange: (speed: number) => void;
  onToggleTickPause: () => void;
  onReset: () => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.5, 2];

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentTick,
  totalTicks,
  currentStep,
  totalSteps,
  isPlaying,
  isAnimating,
  flowMs,
  speed,
  tickPause,
  onPlayPause,
  onPrevTick,
  onNextTick,
  onPrevStep,
  onNextStep,
  onSeekTick,
  onSpeedChange,
  onToggleTickPause,
  onReset,
}) => {
  const progress = totalTicks > 0 ? ((currentTick + 1 + (isAnimating ? 1 : 0)) / totalTicks) * 100 : 0;

  return (
    <div className="controls">
      <input
        type="range"
        className={isAnimating ? 'timeline is-flowing' : 'timeline'}
        min={-1}
        max={totalTicks - 1}
        value={currentTick}
        onChange={(e) => onSeekTick(Number(e.target.value))}
        aria-label="프레임(틱) 이동"
        aria-valuetext={
          currentTick < 0
            ? '시작 전'
            : `${totalSteps}단계 중 ${currentStep + 1}단계 · 전체 ${totalTicks}틱 중 ${currentTick + 1}틱`
        }
        style={{ '--progress': `${progress}%`, '--flow': `${flowMs}ms` } as React.CSSProperties}
      />

      <div className="controls-row">
        <div className="transport">
          <button
            type="button"
            className="icon-btn is-ghost"
            onClick={onReset}
            aria-label="처음으로 (R)"
            title="처음으로 (R)"
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onPrevStep}
            disabled={currentTick < 0 && !isAnimating}
            aria-label="이전 단계 (Shift+←)"
            title="이전 단계 (Shift+←)"
          >
            <SkipBack size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn tick-btn"
            onClick={onPrevTick}
            disabled={currentTick < 0 && !isAnimating}
            aria-label="이전 틱 (←)"
            title="한 틱(프레임) 뒤로 (←)"
          >
            <ChevronLeft size={19} aria-hidden="true" />
            <span className="tick-btn-label">틱</span>
          </button>
          <button
            type="button"
            className="play-btn"
            onClick={onPlayPause}
            aria-label={isPlaying ? '일시정지 (Space)' : '재생 (Space)'}
            title={isPlaying ? '일시정지 (Space)' : '재생 (Space)'}
          >
            {isPlaying ? (
              <Pause size={22} fill="currentColor" aria-hidden="true" />
            ) : (
              <Play size={22} fill="currentColor" className="play-icon" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className="icon-btn tick-btn"
            onClick={onNextTick}
            disabled={currentTick >= totalTicks - 1}
            aria-label="다음 틱 (→)"
            title="한 틱(프레임) 앞으로 (→)"
          >
            <span className="tick-btn-label">틱</span>
            <ChevronRight size={19} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onNextStep}
            disabled={currentTick >= totalTicks - 1}
            aria-label="다음 단계 (Shift+→)"
            title="다음 단계 (Shift+→)"
          >
            <SkipForward size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="playback-options">
          <div className="segmented mode-switch" role="group" aria-label="재생 단위">
            <button
              type="button"
              className="segmented-btn"
              aria-pressed={!tickPause}
              onClick={() => {
                if (tickPause) onToggleTickPause();
              }}
              title="틱마다 멈추지 않고 이어서 재생합니다"
            >
              연속
            </button>
            <button
              type="button"
              className="segmented-btn"
              aria-pressed={tickPause}
              onClick={() => {
                if (!tickPause) onToggleTickPause();
              }}
              title="한 틱(프레임)씩 재생하고 자동으로 멈춥니다"
            >
              1틱씩 끊기
            </button>
          </div>

          <div className="segmented speed-switch" role="group" aria-label="재생 속도">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                className="segmented-btn"
                aria-pressed={speed === s}
                onClick={() => onSpeedChange(s)}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
