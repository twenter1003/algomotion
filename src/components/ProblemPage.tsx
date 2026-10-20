import React, { useEffect, useMemo, useState } from 'react';
import type { Problem } from '../engine/model';
import { LOADERS } from '../problems/registry';
import { Player } from './Player';

// 이번 판은 정석 풀이의 Player만 보인다. 풀이 탭, 코드 칸, 비교는 Task 6에서 붙는다.
export const ProblemPage: React.FC<{ id: string }> = ({ id }) => {
  const [problem, setProblem] = useState<Problem>();
  const load = LOADERS[id];

  useEffect(() => {
    let alive = true;
    load?.().then((p) => {
      if (alive) setProblem(p);
    });
    return () => {
      alive = false;
    };
  }, [load]);

  const viz = useMemo(() => problem?.approaches[0].visualize(), [problem]);

  if (!load) {
    return (
      <main className="solo-page">
        <p>문제를 찾을 수 없습니다.</p>
        <a href="#/">목록으로</a>
      </main>
    );
  }
  if (!problem || !viz) {
    return (
      <main className="solo-page">
        <p>불러오는 중</p>
      </main>
    );
  }
  return (
    <main className="solo-page">
      <header className="solo-head">
        <a href="#/">← 목록</a>
        <h1 className="problem-title">{problem.title}</h1>
      </header>
      <Player viz={viz} demoLabel={problem.demo.label} workUnit={problem.workUnit} />
    </main>
  );
};
