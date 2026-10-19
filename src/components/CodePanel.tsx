import React from 'react';
import { Check, Copy } from 'lucide-react';
import type { AlgorithmStep, Language, Problem } from '../types';
import { highlight, LANGUAGES } from './highlight';

interface CodePanelProps {
  problem: Problem;
  step: AlgorithmStep;
  prevVariables?: AlgorithmStep['variables'];
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const CodePanel: React.FC<CodePanelProps> = ({ problem, step, prevVariables, language, onLanguageChange }) => {
  const [copied, setCopied] = React.useState(false);
  const codeRef = React.useRef<HTMLPreElement>(null);
  const activeLines = step.codeHighlights[language];
  const code = problem.code[language];

  // 실행 중인 줄 묶음이 코드 상자 밖에 있으면 상자 안에서만 스크롤합니다(페이지는 움직이지 않음).
  React.useEffect(() => {
    const box = codeRef.current;
    const first = box?.querySelector<HTMLElement>(`[data-line="${Math.min(...activeLines)}"]`);
    const last = box?.querySelector<HTMLElement>(`[data-line="${Math.max(...activeLines)}"]`);
    if (!box || !first || !last) return;
    const top = first.offsetTop;
    const bottom = last.offsetTop + last.offsetHeight;
    if (top < box.scrollTop || bottom > box.scrollTop + box.clientHeight) {
      // 묶음 전체가 들어가면 가운데에, 안 들어가면 마지막 줄(실제 동작)이 보이게 둡니다.
      const target = bottom - top < box.clientHeight ? (top + bottom - box.clientHeight) / 2 : bottom - box.clientHeight + 8;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      box.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [activeLines]);

  const copyCode = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <aside className="code-panel" aria-label="코드와 변수">
      <div className="panel code-card">
        <div className="code-toolbar">
          <div className="lang-tabs" role="group" aria-label="코드 언어">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                className="lang-tab"
                aria-pressed={language === lang.id}
                onClick={() => onLanguageChange(lang.id)}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <button type="button" className="text-btn" onClick={copyCode}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            <span>{copied ? '복사했습니다' : '코드 복사'}</span>
          </button>
        </div>

        <pre className="code-view" ref={codeRef}>
          <code>
            {code.split('\n').map((text, idx) => {
              const lineNo = idx + 1;
              return (
                <span
                  key={lineNo}
                  data-line={lineNo}
                  className={`code-line${activeLines.includes(lineNo) ? ' is-active' : ''}`}
                >
                  <span className="line-no" aria-hidden="true">
                    {lineNo}
                  </span>
                  <span className="line-text">{highlight(text, language)}</span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>

      <section className="panel vars-card" aria-label="변수">
        <h2 className="section-title">변수</h2>
        <dl className="var-list">
          {Object.entries(step.variables).map(([name, value]) => {
            const changed = prevVariables !== undefined && String(prevVariables[name]) !== String(value);
            return (
              <div key={name} className={`var-row${changed ? ' is-changed' : ''}`}>
                <dt>{name}</dt>
                <dd>
                  <span className="var-value">{String(value)}</span>
                  {changed && <span className="var-flag">바뀜</span>}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="panel complexity-card" aria-label="복잡도">
        <div className="metric">
          <span className="metric-label">시간 복잡도</span>
          <span className="metric-value">{problem.timeComplexity}</span>
        </div>
        <div className="metric">
          <span className="metric-label">공간 복잡도</span>
          <span className="metric-value">{problem.spaceComplexity}</span>
        </div>
      </section>
    </aside>
  );
};
