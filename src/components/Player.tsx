import React, { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { Language, Visualization } from '../engine/model';
import { initialPlayer, playerReducer } from '../engine/player';
import type { Stage } from '../engine/stage';
import { cycleLabels, planStep } from '../engine/timeline';
import { PlayerControls } from './PlayerControls';
import { StageView } from './StageView';

interface PlayerProps {
  viz: Visualization;
  demoLabel: string;
  workUnit: string;
  onFinish?: () => void;
  onLinesChange?: (lines: Record<Language, number[]> | null) => void;
  onVariablesChange?: (variables: Record<string, string | number>) => void;
}

const NO_VARIABLES: Record<string, string | number> = {};
const IDLE = { step: -1, phase: 0 }; // 연출하는 단계가 없음

// 판이 쓸 수 있는 높이(px). Player가 따로 스크롤하는 칸 안에 있으면(넓은 화면), 칸을 맨 위로 올렸을 때
// Player 위의 것(문제 머리, 풀이 탭)과 Player의 판 아닌 부분(마디 표시줄, 자막, 조작부)을 빼고 남는 높이다.
// 칸이 따로 스크롤하지 않으면(좁은 화면) 없음. 펼친 '문제 보기'는 접힌 높이로 센다(읽는 동안 판이 줄지 않게).
function fitHeightOf(section: HTMLElement): number | undefined {
  let column = section.parentElement;
  while (column && !/auto|scroll/.test(getComputedStyle(column).overflowY)) column = column.parentElement;
  const frame = section.querySelector('.stage-frame');
  if (!column || !frame) return undefined;
  const style = getComputedStyle(column);
  const contentTop = column.getBoundingClientRect().top + column.clientTop + parseFloat(style.paddingTop) - column.scrollTop;
  const opened = [...column.querySelectorAll('details[open]')]
    .filter((d) => d.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING)
    .reduce((sum, d) => sum + d.getBoundingClientRect().height - (d.querySelector('summary')?.getBoundingClientRect().height ?? 0), 0);
  const rect = section.getBoundingClientRect();
  const above = rect.top - contentTop - opened;
  const own = rect.height - frame.getBoundingClientRect().height;
  return column.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - above - own;
}

// 마디 표시줄, 무대, 자막, 흐르는 진행 막대, 조작부와 단축키
export const Player: React.FC<PlayerProps> = ({ viz, demoLabel, workUnit, onFinish, onLinesChange, onVariablesChange }) => {
  const total = viz.steps.length;
  const [s, dispatch] = useReducer(playerReducer, total, initialPlayer);
  const stageRef = useRef<Stage | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [fitHeight, setFitHeight] = useState<number>();
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [live, setLive] = useState(IDLE); // 연출 중인 단계와 그 마디
  const cycle = useMemo(() => cycleLabels(viz), [viz]);

  // 연출을 시작할 때 읽는 값: 속도는 다음 단계부터 적용하고, 알림 함수는 늘 최신 것을 쓴다
  const latest = useRef({ speed: s.speed, onFinish, onLinesChange, onVariablesChange });
  useEffect(() => {
    latest.current = { speed: s.speed, onFinish, onLinesChange, onVariablesChange };
  });

  // 멈춰 있으면 끝난 장면을 그리고, 연출 중이면 앞 단계의 끝난 장면에서 다음 단계를 연출한다.
  // 정리할 때 연출을 취소하므로 StrictMode가 두 번 돌려도 한 번만 이어 간다(취소된 연출은 stepDone을 보내지 않음).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.render(s.index < 0 ? viz.initial : viz.steps[s.index].scene);
    if (!s.animating) return;
    const step = s.index + 1;
    let alive = true;
    stage
      .play(viz.steps[step], latest.current.speed, (phase) => {
        if (alive) setLive({ step, phase });
      })
      .then((done) => {
        if (done && alive) dispatch({ type: 'stepDone' });
      });
    return () => {
      alive = false;
      stage.cancel();
      setLive(IDLE); // 같은 단계를 다시 연출할 때(← 뒤 →) 지난 연출의 마디·자막·코드 줄이 잠깐 보이지 않게
    };
  }, [viz, s.index, s.animating]);

  // 화면이 보여 주는 단계: 연출 중이면 연출하는 단계, 멈춰 있으면 끝난 단계(-1이면 시작 전)
  const shown = s.animating ? s.index + 1 : s.index;
  const step = shown >= 0 ? viz.steps[shown] : undefined;
  const phaseIndex = !step ? -1 : !s.animating ? step.phases.length - 1 : live.step === shown ? live.phase : 0;
  const phase = step?.phases[phaseIndex];
  const lines = step ? (phase?.codeHighlights ?? step.codeHighlights) : null;
  const variables = step?.variables ?? NO_VARIABLES;
  const caption = phase?.caption ?? '재생을 누르면 시작합니다.';
  const done = new Set(step?.phases.slice(0, phaseIndex).map((p) => p.label));
  const chip = phase && !cycle.includes(phase.label) ? phase.label : undefined;
  const flowMs = useMemo(
    () => (s.animating ? planStep(viz.steps[s.index + 1], { reducedMotion }).total / s.speed : 0),
    [viz, s.index, s.animating, s.speed, reducedMotion],
  );

  useEffect(() => {
    latest.current.onLinesChange?.(lines);
  }, [lines]);
  useEffect(() => {
    latest.current.onVariablesChange?.(variables);
  }, [variables]);
  useEffect(() => {
    if (s.index === total - 1) latest.current.onFinish?.();
  }, [s.index, total]);

  // 넓은 화면에서는 문제 머리·탭과 판, 자막, 조작부가 한 화면에 들어가게 판 높이를 맞춘다.
  // 처음, 글꼴을 받은 뒤, Player를 담은 칸의 크기가 바뀔 때(창 크기, 옆 메뉴 접기·펴기, 1280px 넘나들기) 잰다.
  // Player 자신은 지켜보지 않는다. 재생 중 자막이나 마디 표시줄 높이가 바뀔 때마다 판이 줄었다 늘었다 하지 않게
  useLayoutEffect(() => {
    const section = sectionRef.current!;
    const measure = () => setFitHeight(fitHeightOf(section));
    measure();
    document.fonts.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(section.parentElement!);
    return () => observer.disconnect();
  }, []);

  // 단축키. 글자 입력 중이거나 조합키(⌘R 새로고침 등)는 건드리지 않고, 창(서랍, 사용법)이 열려 있으면 뒤 화면을 움직이지 않는다.
  // Space는 초점이 있는 버튼·링크·탭·펼치기를 누르는 데 두고(제 동작이 먼저), ←·→·R은 어디서나 듣는다
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector('dialog[open]')) return;
      const target = e.target as HTMLElement | null;
      if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return;
      if (e.code === 'Space') {
        if (target instanceof Element && target.closest('button, a[href], summary, [role="tab"]')) return;
        e.preventDefault();
        dispatch({ type: s.playing ? 'pause' : 'play' });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        dispatch({ type: 'prev' });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        dispatch({ type: 'next' });
      } else if (e.key === 'r' || e.key === 'R') {
        dispatch({ type: 'reset' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [s.playing]);

  return (
    <section className="player panel" aria-label="풀이 재생" ref={sectionRef}>
      <div className="phase-bar">
        <ol className="phase-list" aria-label="한 단계의 순서">
          {cycle.map((label, i) => (
            <li
              key={label}
              className={label === phase?.label ? 'is-active' : done.has(label) ? 'is-done' : undefined}
              aria-current={label === phase?.label ? 'step' : undefined}
            >
              <span className="phase-num" aria-hidden="true">
                {i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
        {chip && (
          <span key={`${shown}:${chip}`} className="phase-chip">
            {chip}
          </span>
        )}
      </div>

      <div className="stage">
        <StageView scene={viz.initial} stageRef={stageRef} maxScale={1.35} maxHeight={fitHeight} />
      </div>

      <div className="readout">
        <div className="readout-meta">
          <span className="step-count">
            {shown + 1}/{total}단계
          </span>
          <span className="work-count">
            {workUnit} {step?.work ?? 0}번{step?.workNote ? ` · ${step.workNote}` : ''}
          </span>
          <span className="demo-label">{demoLabel}</span>
        </div>
        <p className="caption" aria-live="polite">
          <span key={caption} className="caption-text">
            {caption}
          </span>
        </p>
      </div>

      <PlayerControls
        currentStep={s.index}
        totalSteps={total}
        isPlaying={s.playing}
        isAnimating={s.animating}
        flowMs={flowMs}
        speed={s.speed}
        onPlayPause={() => dispatch({ type: s.playing ? 'pause' : 'play' })}
        onPrevStep={() => dispatch({ type: 'prev' })}
        onNextStep={() => dispatch({ type: 'next' })}
        onSeek={(index) => dispatch({ type: 'seek', index })}
        onSpeedChange={(speed) => dispatch({ type: 'speed', speed })}
        onReset={() => dispatch({ type: 'reset' })}
      />
    </section>
  );
};
