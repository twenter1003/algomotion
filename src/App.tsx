import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { findProblem } from './catalog';
import { HomePage } from './components/HomePage';
import { ProblemPage } from './components/ProblemPage';
import { parseHash } from './route';

// 주소(해시)를 구독한다. 홈은 #/, 문제는 #/p/<문제 id>. 뒤로 가기와 링크 공유가 그대로 된다
const watchHash = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};
const readHash = () => window.location.hash;

export const App: React.FC = () => {
  const hash = useSyncExternalStore(watchHash, readHash);
  const route = parseHash(hash);
  const [tools, setTools] = useState<HTMLDivElement | null>(null); // 화면마다 머리줄에 다는 도구 자리(문제 화면의 목록 버튼, 경로, 이전/다음)
  const title = route.page === 'problem' ? findProblem(route.id)?.meta.title : undefined;

  useEffect(() => {
    document.title = title ? `${title} · AlgoMotion` : 'AlgoMotion';
  }, [title]);

  // 다른 화면으로 가면 맨 위부터 보인다(1280px 미만은 창 전체가 스크롤한다)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hash]);

  return (
    <div className={`app is-${route.page}`}>
      <header className="app-bar">
        <a className="app-brand" href="#/">
          <svg className="brand-mark" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
            <rect className="brand-bg" width="28" height="28" rx="7" />
            <rect className="brand-bar" x="7" y="15" width="3.5" height="6" rx="1" />
            <rect className="brand-bar" x="12.25" y="11" width="3.5" height="10" rx="1" />
            <rect className="brand-hl" x="17.5" y="7" width="3.5" height="14" rx="1" />
          </svg>
          AlgoMotion
        </a>
        <div className="app-tools" ref={setTools} />
      </header>
      {/* 문제 화면은 문제가 바뀌어도 그대로 두어 옆 메뉴의 검색, 펼침, 스크롤이 남는다(본문은 ProblemPage 안에서 새로 시작) */}
      {route.page === 'home' ? <HomePage /> : <ProblemPage id={route.id} tools={tools} />}
    </div>
  );
};

export default App;
