import React, { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { Language, Visualization } from '../engine/model';
import { initialPlayer, playerReducer } from '../engine/player';
import type { Stage } from '../engine/stage';
import { cycleLabels, planTicks } from '../engine/timeline';
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

// 판이 쓸 수 있는 높이(px). Player가 따로 스크롤하는 칸 안에 있으면(900px 이상), 칸을 맨 위로 올렸을 때
// Player 위의 것(문제 머리, 풀이 탭)과 Player의 판 아닌 부분(마디 표시줄, 자막, 조작부)을 빼고 남는 높이다.
// 칸이 따로 스크롤하지 않으면(900px 미만) 없음. 펼친 '문제 보기'는 접힌 높이로 센다(읽는 동안 판이 줄지 않게).
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

// 마디 표시줄, 무대, 자막, 흐르는 진행 막대, 틱/단계 조작부와 단축키
export const Player: React.FC<PlayerProps> = ({ viz, demoLabel, workUnit, onFinish, onLinesChange, onVariablesChange }) => {
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const ticks = useMemo(() => planTicks(viz, { reducedMotion }), [viz, reducedMotion]);
  const totalTicks = ticks.length;
  const totalSteps = viz.steps.length;
  const [s, dispatch] = useReducer(playerReducer, totalTicks, initialPlayer);
  const [tickPause, setTickPause] = useState(false); // true면 1틱마다 자동으로 일시정지
  const stageRef = useRef<Stage | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [fitHeight, setFitHeight] = useState<number>();
  const cycle = useMemo(() => cycleLabels(viz), [viz]);

  // 연출을 시작할 때 읽는 값: 속도는 다음 틱부터 적용하고, 알림 함수는 늘 최신 것을 쓴다
  const latest = useRef({ speed: s.speed, tickPause, onFinish, onLinesChange, onVariablesChange });
  useEffect(() => {
    latest.current = { speed: s.speed, tickPause, onFinish, onLinesChange, onVariablesChange };
  });

  // 멈춰 있으면 지금 틱의 끝난 장면을 그리고, 연출 중이면 다음 틱을 연출한다.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (!s.animating) {
      stage.renderTick(s.index < 0 ? null : ticks[s.index], viz.initial);
      return;
    }
    const nextIdx = s.index + 1;
    const nextTick = ticks[nextIdx];
    if (!nextTick) return;
    let alive = true;
    stage.playTick(nextTick, latest.current.speed).then((done) => {
      if (done && alive) {
        if (latest.current.tickPause) dispatch({ type: 'pause' });
        dispatch({ type: 'stepDone' });
      }
    });
    return () => {
      alive = false;
      stage.cancel();
    };
  }, [viz, ticks, s.index, s.animating]);

  // 화면이 보여 주는 틱: 연출 중이면 연출하는 틱, 멈춰 있으면 끝난 틱(-1이면 시작 전)
  const shownTickIdx = s.animating ? s.index + 1 : s.index;
  const tick = shownTickIdx >= 0 ? ticks[shownTickIdx] : undefined;
  const stepIndex = tick ? tick.stepIndex : -1;
  const step = stepIndex >= 0 ? viz.steps[stepIndex] : undefined;
  const lines = tick ? tick.codeHighlights : null;
  const variables = tick ? tick.variables : NO_VARIABLES;
  const caption = tick?.caption ?? '재생(Space) 또는 다음 틱(→)을 누르면 시작합니다.';
  const done = new Set(step?.phases.slice(0, tick?.phaseIndex ?? 0).map((p) => p.label));
  const chip = tick && !cycle.includes(tick.label) ? tick.label : undefined;
  const flowMs = s.animating && ticks[s.index + 1] ? ticks[s.index + 1].duration / s.speed : 0;

  // 단계 단위 이동: 이전 단계의 마지막 틱 또는 다음 단계의 마지막 틱으로 이동
  const prevStep = () => {
    if (shownTickIdx < 0) return;
    const targetStep = (tick?.stepIndex ?? 0) - 1;
    if (targetStep < 0) {
      dispatch({ type: 'seek', index: -1 });
      return;
    }
    let idx = -1;
    for (let i = 0; i < ticks.length; i++) {
      if (ticks[i].stepIndex === targetStep) idx = i;
    }
    dispatch({ type: 'seek', index: idx });
  };

  const nextStep = () => {
    const curStep = tick ? (tick.tickInStep < tick.ticksInStep - 1 ? tick.stepIndex : tick.stepIndex + 1) : 0;
    const targetStep = Math.min(totalSteps - 1, curStep);
    let idx = ticks.length - 1;
    for (let i = 0; i < ticks.length; i++) {
      if (ticks[i].stepIndex === targetStep) idx = i;
    }
    dispatch({ type: 'seek', index: idx });
  };

  useEffect(() => {
    latest.current.onLinesChange?.(lines);
  }, [lines]);
  useEffect(() => {
    latest.current.onVariablesChange?.(variables);
  }, [variables]);
  useEffect(() => {
    if (s.index === totalTicks - 1 && totalTicks > 0) latest.current.onFinish?.();
  }, [s.index, totalTicks]);

  useLayoutEffect(() => {
    const section = sectionRef.current!;
    const measure = () => setFitHeight(fitHeightOf(section));
    measure();
    document.fonts.ready.then(measure);
    const observer = new ResizeObserver(measure);
    if (section.parentElement) observer.observe(section.parentElement);
    return () => observer.disconnect();
  }, []);

  // 단축키: Space(재생/일시정지), ←/→(이전/다음 틱), Shift+←/→(이전/다음 단계), R(처음으로)
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
        if (e.shiftKey) prevStep();
        else dispatch({ type: 'prev' });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) nextStep();
        else dispatch({ type: 'next' });
      } else if (e.key === 'r' || e.key === 'R') {
        dispatch({ type: 'reset' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <section className="player panel" aria-label="풀이 재생" ref={sectionRef}>
      <div className="phase-bar">
        <ol className="phase-list" aria-label="한 단계의 순서">
          {cycle.map((label, i) => (
            <li
              key={label}
              className={label === tick?.label ? 'is-active' : done.has(label) ? 'is-done' : undefined}
              aria-current={label === tick?.label ? 'step' : undefined}
            >
              <span className="phase-num" aria-hidden="true">
                {i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
        {chip && (
          <span key={`${stepIndex}:${chip}`} className="phase-chip">
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
            {stepIndex + 1}/{totalSteps}단계
          </span>
          <span className="tick-count" title="현재 단계 안의 세부 틱(프레임)과 전체 프레임 위치">
            틱 {tick ? `${tick.tickInStep + 1}/${tick.ticksInStep}` : `0/${ticks[0]?.ticksInStep ?? 1}`} (전체 {shownTickIdx + 1}/{totalTicks})
          </span>
          <span className="work-count">
            {workUnit} {tick?.work ?? 0}번{tick?.workNote ? ` · ${tick.workNote}` : ''}
          </span>
          <span className="demo-label">{demoLabel}</span>
        </div>
        <p className="caption" aria-live="polite">
          <span key={`${shownTickIdx}:${caption}`} className="caption-text">
            {caption}
          </span>
        </p>
      </div>

      <PlayerControls
        currentTick={s.index}
        totalTicks={totalTicks}
        currentStep={stepIndex}
        totalSteps={totalSteps}
        isPlaying={s.playing}
        isAnimating={s.animating}
        flowMs={flowMs}
        speed={s.speed}
        tickPause={tickPause}
        onPlayPause={() => dispatch({ type: s.playing ? 'pause' : 'play' })}
        onPrevTick={() => dispatch({ type: 'prev' })}
        onNextTick={() => dispatch({ type: 'next' })}
        onPrevStep={prevStep}
        onNextStep={nextStep}
        onSeekTick={(index) => dispatch({ type: 'seek', index })}
        onSpeedChange={(speed) => dispatch({ type: 'speed', speed })}
        onToggleTickPause={() => setTickPause((p) => !p)}
        onReset={() => dispatch({ type: 'reset' })}
      />
    </section>
  );
};
