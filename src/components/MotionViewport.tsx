import React from 'react';
import { Maximize2, Minimize2, PenLine } from 'lucide-react';
import type { AlgorithmStep } from '../types';
import { GridVisualizer } from './visualizers/GridVisualizer';
import { ParametricVisualizer } from './visualizers/ParametricVisualizer';
import { QueueVisualizer } from './visualizers/QueueVisualizer';
import { DpPyramidVisualizer } from './visualizers/DpPyramidVisualizer';
import { PlayerControls } from './PlayerControls';

interface MotionViewportProps {
  step: AlgorithmStep;
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

export const MotionViewport: React.FC<MotionViewportProps> = ({ step, currentStep, totalSteps, ...controls }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const containerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else containerRef.current?.requestFullscreen().catch(() => {});
  };

  const visual = step.visualState;
  // key가 바뀔 때마다 손글씨 메모가 새로 써지는 애니메이션이 다시 돕니다.
  const note = visual.actionLabel ? (
    <p key={currentStep} className="stage-note">
      {visual.actionLabel}
    </p>
  ) : null;

  return (
    <main ref={containerRef} className={`panel player${isFullscreen ? ' is-fullscreen' : ''}`} aria-label="알고리즘 재생">
      <div className="player-top">
        <span className="step-counter">
          {currentStep + 1} / {totalSteps}
        </span>
        <h2 className="step-title">{step.title}</h2>
        {document.fullscreenEnabled && (
          <button
            type="button"
            className="icon-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? '전체화면 끝내기' : '전체화면으로 보기'}
            title={isFullscreen ? '전체화면 끝내기' : '전체화면으로 보기'}
          >
            {isFullscreen ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
          </button>
        )}
      </div>

      <div className="stage">
        {visual.type === 'grid' && <GridVisualizer data={visual.data} note={note} />}
        {visual.type === 'parametric' && <ParametricVisualizer data={visual.data} note={note} />}
        {visual.type === 'queue' && <QueueVisualizer data={visual.data} note={note} />}
        {visual.type === 'dp-pyramid' && <DpPyramidVisualizer data={visual.data} note={note} />}
      </div>

      <div className="narration" aria-live="polite">
        <PenLine size={18} className="narration-icon" aria-hidden="true" />
        <p>{step.narration}</p>
      </div>

      <PlayerControls currentStep={currentStep} totalSteps={totalSteps} {...controls} />
    </main>
  );
};
