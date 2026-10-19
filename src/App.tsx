import React, { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { PROBLEMS } from './problems';
import type { AlgorithmStep, Language, Problem } from './types';
import { Header } from './components/Header';
import type { ViewMode } from './components/Header';
import { ProblemPanel } from './components/ProblemPanel';
import { MotionViewport } from './components/MotionViewport';
import { CodePanel } from './components/CodePanel';
import { ApproachComparisonView } from './components/ApproachComparisonView';
import { GuideModal } from './components/GuideModal';

export const App: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<Problem>(PROBLEMS[0]);
  const [steps, setSteps] = useState<AlgorithmStep[]>(() => PROBLEMS[0].generateSteps());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [language, setLanguage] = useState<Language>('python');
  const [viewMode, setViewMode] = useState<ViewMode>('motion');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setSteps(problem.generateSteps());
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const changeView = (mode: ViewMode) => {
    setViewMode(mode);
    setIsPlaying(false);
  };

  const handlePlayPause = useCallback(() => {
    if (!isPlaying && currentStepIndex >= steps.length - 1) setCurrentStepIndex(0);
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentStepIndex, steps.length]);

  const handlePrevStep = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextStep = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  const handleSeek = (stepIdx: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(Math.min(steps.length - 1, Math.max(0, stepIdx)));
  };

  // 단축키는 모션 화면에서만. 글자 입력 중이거나 조합키(⌘R 새로고침 등)는 건드리지 않습니다.
  useEffect(() => {
    if (viewMode !== 'motion' || isGuideOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName ?? '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevStep();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, isGuideOpen, handlePlayPause, handlePrevStep, handleNextStep, handleReset]);

  // 자동 재생: 결과 단계는 조금 더 오래 보여 줍니다.
  useEffect(() => {
    if (!isPlaying || viewMode !== 'motion') return;

    const duration = (steps[currentStepIndex]?.isKeyframe ? 2400 : 1300) / speed;
    const timer = window.setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        const nextIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextIdx);
        if (nextIdx === steps.length - 1) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFE45E', '#FFBCD6', '#C4E2FF', '#2350D8'],
            disableForReducedMotion: true,
          });
        }
      } else if (isLooping) {
        setCurrentStepIndex(0);
      } else {
        setIsPlaying(false);
      }
    }, duration);

    return () => window.clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps, speed, isLooping, viewMode]);

  const activeStep = steps[currentStepIndex] ?? steps[0];

  return (
    <div className={`app-root is-${viewMode}`}>
      <Header
        problems={PROBLEMS}
        currentProblem={selectedProblem}
        viewMode={viewMode}
        onSelectProblem={handleSelectProblem}
        onToggleViewMode={changeView}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {viewMode === 'motion' ? (
        <div className="dashboard">
          <ProblemPanel problem={selectedProblem} onCompare={() => changeView('approaches')} />
          <MotionViewport
            step={activeStep}
            currentStep={currentStepIndex}
            totalSteps={steps.length}
            isPlaying={isPlaying}
            speed={speed}
            isLooping={isLooping}
            onPlayPause={handlePlayPause}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onSeek={handleSeek}
            onSpeedChange={setSpeed}
            onReset={handleReset}
            onToggleLoop={() => setIsLooping((prev) => !prev)}
          />
          <CodePanel
            problem={selectedProblem}
            step={activeStep}
            prevVariables={steps[currentStepIndex - 1]?.variables}
            language={language}
            onLanguageChange={setLanguage}
          />
        </div>
      ) : (
        <ApproachComparisonView
          key={selectedProblem.id}
          problem={selectedProblem}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default App;
