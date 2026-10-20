import React, { useEffect, useState } from 'react';
import { ProblemPage } from './components/ProblemPage';
import { LOADERS } from './problems/registry';

// 주소가 #/p/<id>이면 문제 화면, 아니면 문제 id 목록(Task 10에서 홈으로 바꾼다)
const problemId = () => /^#\/p\/([^/?#]+)$/.exec(window.location.hash)?.[1];

export const App: React.FC = () => {
  const [id, setId] = useState(problemId);

  useEffect(() => {
    const onHashChange = () => setId(problemId());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (id) return <ProblemPage key={id} id={id} />;
  return (
    <main className="solo-page">
      <h1 className="problem-title">AlgoMotion</h1>
      <ul className="solo-list">
        {Object.keys(LOADERS).map((pid) => (
          <li key={pid}>
            <a href={`#/p/${pid}`}>{pid}</a>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default App;
