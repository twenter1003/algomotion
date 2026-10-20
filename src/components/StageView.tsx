import React, { useLayoutEffect, useRef, useState } from 'react';
import type { Scene } from '../engine/model';
import { Stage } from '../engine/stage';

interface StageViewProps {
  scene: Scene; // 처음 그릴 장면. 무대의 논리 크기도 여기서 정한다
  stageRef: React.RefObject<Stage | null>;
  maxScale: number;
}

// Stage를 React에 붙이는 껍데기. 무대 안 DOM은 Stage가 맡고, 여기서는 칸 폭에 맞춰 배율만 정한다.
export const StageView: React.FC<StageViewProps> = ({ scene, stageRef, maxScale }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);

  // 첫 장면으로 만들고, 그 뒤 장면은 stageRef로 바꾼다(첫 그림이 비지 않도록 그리기 전에 만든다)
  useLayoutEffect(() => {
    const stage = new Stage(hostRef.current!, scene, {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    stageRef.current = stage;
    return () => {
      stage.destroy();
      stageRef.current = null;
    };
  }, [scene, stageRef]);

  useLayoutEffect(() => {
    const box = boxRef.current!;
    const measure = () => setBoxWidth(box.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const scale = boxWidth ? Math.min(maxScale, boxWidth / scene.width) : 1;
  return (
    <div className="stage-view" ref={boxRef}>
      <div className="stage-frame" style={{ width: scene.width * scale, height: scene.height * scale }}>
        <div ref={hostRef} style={{ transform: `scale(${scale})` }} aria-hidden="true" />
      </div>
    </div>
  );
};
