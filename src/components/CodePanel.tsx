import React from 'react';
import { Check, Copy } from 'lucide-react';
import type { Language } from '../engine/model';
import { highlight, LANGUAGES } from './highlight';

type Variables = Record<string, string | number>;

interface CodePanelProps {
  code: Record<Language, string>;
  activeLines: Record<Language, number[]> | null; // null이면 하이라이트 없음
  variables: Variables;
  prevVariables?: Variables; // 앞서 보인 값. 값이 달라진 변수에 '바뀜'을 단다
  complexity: { time: string; space: string };
  language: Language;
  onLanguageChange: (l: Language) => void;
}

const NO_LINES: number[] = [];

export const CodePanel: React.FC<CodePanelProps> = ({ code, activeLines, variables, prevVariables, complexity, language, onLanguageChange }) => {
  const [copied, setCopied] = React.useState(false);
  const codeRef = React.useRef<HTMLPreElement>(null);
  const lines = activeLines?.[language] ?? NO_LINES;
  const text = code[language];
  const entries = Object.entries(variables);

  // 다른 풀이나 언어의 코드로 바뀌면 맨 위부터 보입니다.
  React.useLayoutEffect(() => {
    codeRef.current?.scrollTo({ top: 0 });
  }, [text]);

  // 실행 중인 줄 묶음이 코드 상자 밖에 있으면 상자 안에서만 스크롤합니다(페이지는 움직이지 않음).
  React.useEffect(() => {
    const box = codeRef.current;
    if (!box || !lines.length) return;
    const first = box.querySelector<HTMLElement>(`[data-line="${Math.min(...lines)}"]`);
    const last = box.querySelector<HTMLElement>(`[data-line="${Math.max(...lines)}"]`);
    if (!first || !last) return;
    const top = first.offsetTop;
    const bottom = last.offsetTop + last.offsetHeight;
    if (top < box.scrollTop || bottom > box.scrollTop + box.clientHeight) {
      // 묶음 전체가 들어가면 가운데에, 안 들어가면 마지막 줄(실제 동작)이 보이게 둡니다.
      const target = bottom - top < box.clientHeight ? (top + bottom - box.clientHeight) / 2 : bottom - box.clientHeight + 8;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      box.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [lines]);

  const copyCode = () => {
    navigator.clipboard
      .writeText(text)
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
            {text.split('\n').map((line, idx) => {
              const lineNo = idx + 1;
              return (
                <span key={lineNo} data-line={lineNo} className={`code-line${lines.includes(lineNo) ? ' is-active' : ''}`}>
                  <span className="line-no" aria-hidden="true">
                    {lineNo}
                  </span>
                  <span className="line-text">{highlight(line, language)}</span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>

      <section className="panel vars-card" aria-label="변수">
        <h2 className="section-title">변수</h2>
        {entries.length ? (
          <dl className="var-list">
            {entries.map(([name, value]) => {
              // 앞서 보이지 않던 변수는 '바뀜'이 아니다(시작 전이나 다른 풀이에서 넘어온 첫 단계)
              const changed = prevVariables !== undefined && name in prevVariables && String(prevVariables[name]) !== String(value);
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
        ) : (
          <p className="vars-empty">재생 화면에서 단계를 진행하면 변수 값이 보입니다.</p>
        )}
      </section>

      <section className="panel complexity-card" aria-label="복잡도">
        <div className="metric">
          <span className="metric-label">시간 복잡도</span>
          <span className="metric-value">{complexity.time}</span>
        </div>
        <div className="metric">
          <span className="metric-label">공간 복잡도</span>
          <span className="metric-value">{complexity.space}</span>
        </div>
      </section>
    </aside>
  );
};
