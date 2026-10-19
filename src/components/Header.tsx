import React from 'react';
import { Keyboard } from 'lucide-react';
import type { Problem } from '../types';

export type ViewMode = 'motion' | 'approaches';

interface HeaderProps {
  problems: Problem[];
  currentProblem: Problem;
  viewMode: ViewMode;
  onSelectProblem: (problem: Problem) => void;
  onToggleViewMode: (mode: ViewMode) => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  problems,
  currentProblem,
  viewMode,
  onSelectProblem,
  onToggleViewMode,
  onOpenGuide,
}) => (
  <header className="app-header">
    <div className="brand">
      <svg className="brand-mark" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill="#17213A" />
        <rect x="7" y="15" width="3.5" height="6" rx="1" fill="#FFFFFF" />
        <rect x="12.25" y="11" width="3.5" height="10" rx="1" fill="#FFFFFF" />
        <rect x="17.5" y="7" width="3.5" height="14" rx="1" fill="#FFE45E" />
      </svg>
      <span className="brand-name">AlgoMotion</span>
    </div>

    <nav className="problem-tabs" aria-label="문제 선택">
      {problems.map((p) => {
        const isActive = p.id === currentProblem.id;
        return (
          <button
            key={p.id}
            type="button"
            className={`problem-tab${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onSelectProblem(p)}
          >
            <span className={`level-chip lv-${p.level}`}>Lv.{p.level}</span>
            <span className="problem-tab-title">{p.title}</span>
          </button>
        );
      })}
    </nav>

    <div className="segmented view-switch" role="group" aria-label="보기 방식">
      <button
        type="button"
        className="segmented-btn"
        aria-pressed={viewMode === 'motion'}
        onClick={() => onToggleViewMode('motion')}
      >
        모션 학습
      </button>
      <button
        type="button"
        className="segmented-btn"
        aria-pressed={viewMode === 'approaches'}
        onClick={() => onToggleViewMode('approaches')}
      >
        풀이 비교
      </button>
    </div>

    <button type="button" className="btn-outline guide-btn" onClick={onOpenGuide}>
      <Keyboard size={16} aria-hidden="true" />
      <span className="guide-label">사용법</span>
    </button>
  </header>
);
