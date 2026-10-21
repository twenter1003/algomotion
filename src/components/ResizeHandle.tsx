import React, { useRef } from 'react';
import { LAYOUT_DEFAULTS, layoutStore, type PanelId, useLayoutSizes } from '../layoutStore';

interface ResizeHandleProps {
  id: PanelId;
  targetRef: React.RefObject<HTMLElement | null>;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

// 컴포넌트 하단에 붙어 드래그나 버튼·키보드로 높이를 조절하는 손잡이
export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  id,
  targetRef,
  label,
  min = 100,
  max = 1200,
  step = 36,
}) => {
  const sizes = useLayoutSizes();
  const customH = sizes.heights[id];
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  const measureCurrent = () => targetRef.current?.getBoundingClientRect().height ?? customH ?? 240;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startH: measureCurrent() };
    document.body.classList.add('is-resizing-row');
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const nextH = dragRef.current.startH + (e.clientY - dragRef.current.startY);
    layoutStore.setHeight(id, nextH, min, max);
  };

  const endDrag = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    document.body.classList.remove('is-resizing-row');
  };

  const nudge = (delta: number) => {
    layoutStore.setHeight(id, measureCurrent() + delta, min, max);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nudge(step);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nudge(-step);
    } else if (e.key === 'Home' || e.key === '0') {
      e.preventDefault();
      layoutStore.setHeight(id, undefined);
    }
  };

  return (
    <div
      className={customH !== undefined ? 'resize-handle is-custom' : 'resize-handle'}
      role="separator"
      aria-orientation="horizontal"
      aria-label={`${label} 높이 조절 (드래그 또는 위·아래 화살표, 더블클릭 초기화)`}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => layoutStore.setHeight(id, undefined)}
      onKeyDown={onKeyDown}
      title={`${label} 크기 조절: 위아래로 드래그하거나 버튼을 누르세요 (더블클릭: 자동 크기)`}
    >
      <span className="resize-grip" aria-hidden="true" />
      <div className="resize-actions">
        <button
          type="button"
          className="resize-mini-btn"
          onClick={() => nudge(-step)}
          aria-label={`${label} 높이 줄이기`}
          title={`${label} 높이 줄이기`}
        >
          −
        </button>
        <button
          type="button"
          className="resize-mini-btn"
          onClick={() => nudge(step)}
          aria-label={`${label} 높이 늘리기`}
          title={`${label} 높이 늘리기`}
        >
          +
        </button>
        {customH !== undefined && (
          <button
            type="button"
            className="resize-mini-btn is-reset"
            onClick={() => layoutStore.setHeight(id, undefined)}
            aria-label={`${label} 크기 자동 맞춤으로 초기화`}
            title="자동 크기로 초기화"
          >
            {customH}px ↺
          </button>
        )}
      </div>
    </div>
  );
};

interface ColResizerProps {
  kind: 'sidebar' | 'code';
  label: string;
}

// 좌우 칸(문제 목록 폭, 코드 칸 폭) 사이에서 드래그로 폭을 조절하는 세로 분할선
export const ColResizer: React.FC<ColResizerProps> = ({ kind, label }) => {
  const sizes = useLayoutSizes();
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);
  const currentW = kind === 'sidebar' ? sizes.sidebarW : sizes.codeW;
  const setW = kind === 'sidebar' ? layoutStore.setSidebarW : layoutStore.setCodeW;
  const defaultW = kind === 'sidebar' ? LAYOUT_DEFAULTS.sidebarW : LAYOUT_DEFAULTS.codeW;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startW: currentW };
    document.body.classList.add('is-resizing-col');
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    setW(dragRef.current.startW + (kind === 'sidebar' ? dx : -dx));
  };

  const endDrag = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    document.body.classList.remove('is-resizing-col');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const dir = kind === 'sidebar' ? 1 : -1;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setW(currentW + 24 * dir);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setW(currentW - 24 * dir);
    } else if (e.key === 'Home' || e.key === '0') {
      e.preventDefault();
      setW(defaultW);
    }
  };

  return (
    <div
      className={`col-resizer is-${kind}${currentW !== defaultW ? ' is-custom' : ''}`}
      role="separator"
      aria-orientation="vertical"
      aria-label={`${label} 폭 조절 (드래그 또는 좌우 화살표, 더블클릭 초기화)`}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => setW(defaultW)}
      onKeyDown={onKeyDown}
      title={`${label} 폭 조절 (드래그, 더블클릭 시 ${defaultW}px로 초기화)`}
    >
      <span className="col-resizer-line" aria-hidden="true" />
    </div>
  );
};
