import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { ChevronRight, ExternalLink } from 'lucide-react';
import type { CategoryId, Language, Problem } from '../engine/model';
import { LOADERS } from '../problems/registry';
import { ApproachNotes } from './ApproachNotes';
import { ApproachTabs } from './ApproachTabs';
import { CodePanel } from './CodePanel';
import { CompareBars } from './CompareBars';
import { Player } from './Player';
import { RaceView } from './RaceView';

type Variables = Record<string, string | number>;

// 유형 이름(catalog.html 시안). Task 10에서 catalog의 유형 목록으로 바꾼다
const CATEGORY_NAMES: Record<CategoryId, string> = {
  'dfs-bfs': 'DFS/BFS', 'brute-force': '완전탐색', dp: 'DP', greedy: '그리디', hash: '해시', 'stack-queue': '스택/큐',
  'binary-search': '이분 탐색', sort: '정렬', heap: '힙', graph: '그래프', 'two-pointer': '투 포인터',
};
const NO_VARIABLES: Variables = {};

// 정석 풀이를 끝까지 보면 색종이를 뿌린다. 색은 index.css 맨 위 토큰에서 읽는다
const celebrate = () => {
  const css = getComputedStyle(document.documentElement);
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['--hl-yellow', '--hl-pink', '--hl-blue', '--pen'].map((token) => css.getPropertyValue(token).trim()),
    disableForReducedMotion: true,
  });
};

// 문제 화면: 가운데(문제 머리 → 풀이 탭 → 재생 또는 나란히 비교 → 평가 → 비교 막대)와 오른쪽 코드 칸
export const ProblemPage: React.FC<{ id: string }> = ({ id }) => {
  const [problem, setProblem] = useState<Problem>();
  const [active, setActive] = useState(0); // 고른 풀이 번호
  const [comparing, setComparing] = useState(false);
  const [language, setLanguage] = useState<Language>('python');
  const [lines, setLines] = useState<Record<Language, number[]> | null>(null);
  const [vars, setVars] = useState<{ now: Variables; prev?: Variables }>({ now: NO_VARIABLES });
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

  // 세 풀이의 시각화는 한 번만 만든다(탭, 나란히 비교, 비교 막대가 같이 씀)
  const vizs = useMemo(() => problem?.approaches.map((a) => a.visualize()), [problem]);

  if (!load) {
    return (
      <main className="solo-page">
        <p>문제를 찾을 수 없습니다.</p>
        <a href="#/">목록으로</a>
      </main>
    );
  }
  if (!problem || !vizs) {
    return (
      <main className="solo-page">
        <p>불러오는 중</p>
      </main>
    );
  }

  const approach = problem.approaches[active];
  const { description } = problem;
  // Player가 보이는 변수를 바꿀 때마다 앞서 보이던 값을 함께 둔다(코드 칸의 '바뀜' 표시)
  const showVariables = (now: Variables) => setVars((v) => (v.now === now ? v : { now, prev: v.now }));

  return (
    <main className="problem-page">
      <div className="problem-main">
        <header className="problem-head">
          <div className="problem-head-row">
            <a className="back-link" href="#/">
              ← 목록
            </a>
            <h1 className="problem-title">{problem.title}</h1>
            <span className={`level-chip lv-${problem.level}`}>Lv.{problem.level}</span>
            <span className="tag-chip">{CATEGORY_NAMES[problem.category]}</span>
            <a className="source-link" href={problem.sourceUrl} target="_blank" rel="noreferrer">
              프로그래머스에서 원문 보기
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>

          <details className="problem-details">
            <summary>
              <ChevronRight size={16} className="details-chevron" aria-hidden="true" />
              문제 보기
            </summary>
            <div className="panel problem-details-body">
              <p className="problem-summary">{description.summary}</p>
              <section className="panel-section">
                <h2 className="section-title">제한 사항</h2>
                <ul className="rule-list">
                  {description.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </section>
              <section className="panel-section">
                <h2 className="section-title">입출력 예</h2>
                <table className="io-table">
                  <thead>
                    <tr>
                      <th scope="col">입력</th>
                      <th scope="col">출력</th>
                    </tr>
                  </thead>
                  <tbody>
                    {description.examples.map((example) => (
                      <tr key={example.input}>
                        <td>
                          <code>{example.input}</code>
                        </td>
                        <td>
                          <code className="io-output">{example.output}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section className="panel-section">
                <h2 className="section-title">핵심 발상</h2>
                <ol className="insight-list">
                  {problem.keyIntuitions.map((text, i) => (
                    <li key={text} className="insight-item">
                      <span className="insight-num" aria-hidden="true">
                        {i + 1}
                      </span>
                      <p>{text}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </details>
        </header>

        <ApproachTabs
          approaches={problem.approaches}
          active={active}
          onSelect={setActive}
          comparing={comparing}
          onToggleCompare={() => setComparing((on) => !on)}
        />

        {comparing ? (
          <RaceView problem={problem} vizs={vizs} />
        ) : (
          // 탭을 바꾸면 새 Player가 시작 전(-1)부터 다시 시작한다
          <Player
            key={approach.id}
            viz={vizs[active]}
            demoLabel={problem.demo.label}
            workUnit={problem.workUnit}
            onFinish={approach.rank === 'BEST' ? celebrate : undefined}
            onLinesChange={setLines}
            onVariablesChange={showVariables}
          />
        )}

        <ApproachNotes approach={approach} />
        <CompareBars problem={problem} vizs={vizs} active={active} />
      </div>

      {/* 나란히 비교 중에는 고른 탭의 코드만 하이라이트 없이 보인다 */}
      <CodePanel
        code={approach.code}
        activeLines={comparing ? null : lines}
        variables={comparing ? NO_VARIABLES : vars.now}
        prevVariables={comparing ? undefined : vars.prev}
        complexity={{ time: approach.timeComplexity, space: approach.spaceComplexity }}
        language={language}
        onLanguageChange={setLanguage}
      />
    </main>
  );
};
