import React from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

interface PlayerControlsProps {
  currentStep: number; // -1이면 시작 전
  totalSteps: number;
  isPlaying: boolean;
  isAnimating: boolean; // 연출 중이면 막대가 flowMs 동안 다음 단계 끝까지 흐른다
  flowMs: number;
  speed: number;
  onPlayPause: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSeek: (stepIndex: number) => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

const SPEEDS = [0.5, 1, 1.5, 2];

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  isAnimating,
  flowMs,
  speed,
  onPlayPause,
  onPrevStep,
  onNextStep,
  onSeek,
  onSpeedChange,
  onReset,
}) => {
  const progress = ((currentStep + 1 + (isAnimating ? 1 : 0)) / totalSteps) * 100;

  return (
    <div className="controls">
      <input
        type="range"
        className={isAnimating ? 'timeline is-flowing' : 'timeline'}
        min={-1}
        max={totalSteps - 1}
        value={currentStep}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="단계 이동"
        aria-valuetext={currentStep < 0 ? '시작 전' : `${totalSteps}단계 중 ${currentStep + 1}단계`}
        style={{ '--progress': `${progress}%`, '--flow': `${flowMs}ms` } as React.CSSProperties}
      />

      <div className="controls-row">
        <div className="transport">
          <button type="button" className="icon-btn is-ghost" onClick={onReset} aria-label="처음으로 (R)" title="처음으로 (R)">
            <RotateCcw size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onPrevStep}
            disabled={currentStep < 0 && !isAnimating}
            aria-label="이전 단계 (←)"
            title="이전 단계 (←)"
          >
            <SkipBack size={18} aria-hidden="true" />
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
            className="icon-btn"
            onClick={onNextStep}
            disabled={currentStep >= totalSteps - 1}
            aria-label="다음 단계 (→)"
            title="다음 단계 (→)"
          >
            <SkipForward size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="playback-options">
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
