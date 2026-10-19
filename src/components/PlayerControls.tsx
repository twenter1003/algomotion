import React from 'react';
import { Pause, Play, Repeat, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

interface PlayerControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  isLooping: boolean;
  onPlayPause: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSeek: (stepIndex: number) => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
  onToggleLoop: () => void;
}

const SPEEDS = [0.5, 1, 1.5, 2];

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  isLooping,
  onPlayPause,
  onPrevStep,
  onNextStep,
  onSeek,
  onSpeedChange,
  onReset,
  onToggleLoop,
}) => {
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="controls">
      <input
        type="range"
        className="timeline"
        min={0}
        max={totalSteps - 1}
        value={currentStep}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="단계 이동"
        aria-valuetext={`${totalSteps}단계 중 ${currentStep + 1}단계`}
        style={{ '--progress': `${progress}%` } as React.CSSProperties}
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
            disabled={currentStep <= 0}
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
          <button type="button" className="btn-outline loop-btn" aria-pressed={isLooping} onClick={onToggleLoop}>
            <Repeat size={16} aria-hidden="true" />
            반복
          </button>
        </div>
      </div>
    </div>
  );
};
