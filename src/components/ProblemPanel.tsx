import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { Problem } from '../types';

interface ProblemPanelProps {
  problem: Problem;
  onCompare: () => void;
}

export const ProblemPanel: React.FC<ProblemPanelProps> = ({ problem, onCompare }) => (
  <aside className="panel problem-panel" aria-label="문제">
    <div className="problem-intro">
      <div className="chip-row">
        <span className={`level-chip lv-${problem.level}`}>Lv.{problem.level}</span>
        <span className="tag-chip">{problem.category}</span>
      </div>
      <h1 className="problem-title">{problem.title}</h1>
      <p className="problem-summary">{problem.description.summary}</p>
      <a className="source-link" href={problem.sourceUrl} target="_blank" rel="noreferrer">
        프로그래머스에서 원문 보기
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </div>

    <section className="panel-section">
      <h2 className="section-title">핵심 발상</h2>
      <ol className="insight-list">
        {problem.keyIntuitions.map((text, idx) => (
          <li key={text} className="insight-item">
            <span className="insight-num" aria-hidden="true">
              {idx + 1}
            </span>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>

    <section className="panel-section">
      <h2 className="section-title">제한 사항</h2>
      <ul className="rule-list">
        {problem.description.rules.map((rule) => (
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
          {problem.description.examples.map((example) => (
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

    <button type="button" className="btn-outline btn-block" onClick={onCompare}>
      풀이 {problem.approaches.length}가지 비교하기
    </button>
  </aside>
);
