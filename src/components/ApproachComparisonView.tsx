import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { ApproachRank, Language, Problem } from '../types';
import { highlight, LANGUAGES } from './highlight';

interface ApproachComparisonViewProps {
  problem: Problem;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const RANK_LABEL: Record<ApproachRank, string> = { BEST: '정석', ALTERNATIVE: '대안', TRAP: '함정' };

/** 빨간펜 채점 표시: 정석 ○, 대안 △, 함정 ✕ */
const GradeMark: React.FC<{ rank: ApproachRank }> = ({ rank }) => (
  <svg
    className="grade-mark"
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {rank === 'BEST' && <path d="M21 4.5c8.6.2 15 6.6 14.6 15.4-.4 8.8-7.2 15.6-16 15.2C10.8 34.7 4.6 28 5 19.6 5.4 11 12.2 4.8 20.8 5" />}
    {rank === 'ALTERNATIVE' && <path d="M20.5 5.5 35 33.5c-9.8.6-19.6.4-29.6-.3L20 6.8" />}
    {rank === 'TRAP' && (
      <>
        <path d="M8 7.5c8 8.4 16.2 16.8 24.5 25" />
        <path d="M32 7c-8.6 8-16.6 16.4-24.4 25.5" />
      </>
    )}
  </svg>
);

export const ApproachComparisonView: React.FC<ApproachComparisonViewProps> = ({ problem, language, onLanguageChange }) => {
  const [activeId, setActiveId] = useState(problem.approaches[0].id);
  const [copied, setCopied] = useState(false);
  const active = problem.approaches.find((a) => a.id === activeId) ?? problem.approaches[0];
  const code = active.code[language];
  const rankClass = (rank: ApproachRank) => `rank-${rank.toLowerCase()}`;

  const select = (id: string) => {
    setActiveId(id);
    setCopied(false);
  };

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
    <div className="compare-page">
      <div className="compare-intro">
        <h1 className="compare-title">
          {problem.title}, 풀이 {problem.approaches.length}가지
        </h1>
        <p className="compare-lead">
          같은 문제라도 입력 크기와 조건에 따라 통과 여부가 갈립니다. 시험에서 쓸 정석 풀이, 동작은 하지만 손해를 보는 대안,
          오답이나 시간 초과로 이어지는 함정을 나란히 놓고 봅니다.
        </p>
      </div>

      <div className="compare-layout">
        <div className="approach-list" role="group" aria-label="풀이 선택">
          {problem.approaches.map((approach) => (
            <button
              key={approach.id}
              type="button"
              className={`approach-card ${rankClass(approach.rank)}`}
              aria-pressed={approach.id === active.id}
              onClick={() => select(approach.id)}
            >
              <GradeMark rank={approach.rank} />
              <span className="approach-card-body">
                <span className={`rank-label ${rankClass(approach.rank)}`}>{RANK_LABEL[approach.rank]}</span>
                <span className="approach-name">{approach.name}</span>
                <span className="approach-verdict">{approach.verdict}</span>
                <span className="approach-complexity">{approach.timeComplexity}</span>
              </span>
            </button>
          ))}
        </div>

        <section className="panel approach-detail" aria-labelledby="approach-detail-title">
          <div className="detail-head">
            <div className="detail-heading">
              <span className={`rank-label ${rankClass(active.rank)}`}>{RANK_LABEL[active.rank]}</span>
              <h2 id="approach-detail-title" className="detail-title">
                {active.name}
              </h2>
            </div>
            <div className="metric-chips">
              <span className="metric-chip">
                시간 <code>{active.timeComplexity}</code>
              </span>
              <span className="metric-chip">
                공간 <code>{active.spaceComplexity}</code>
              </span>
            </div>
          </div>

          <p className={`why-box ${rankClass(active.rank)}`}>
            <strong>이렇게 평가한 이유</strong>
            {active.whyThisRank}
          </p>

          <div className="pros-cons">
            <div>
              <h3 className="pros-cons-title">좋은 점</h3>
              <ul className="pros-cons-list">
                {active.pros.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="pros-cons-title">아쉬운 점</h3>
              <ul className="pros-cons-list">
                {active.cons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="code-block">
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
            <pre className="code-view is-static">
              <code>
                {code.split('\n').map((line, idx) => (
                  <span key={idx} className="code-line">
                    <span className="line-text">{line ? highlight(line, language) : ' '}</span>
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </section>
      </div>

      <section className="panel summary-card" aria-labelledby="summary-title">
        <h2 id="summary-title" className="section-title">
          한눈에 비교
        </h2>
        <div className="table-scroll">
          <table className="summary-table">
            <thead>
              <tr>
                <th scope="col">풀이</th>
                <th scope="col">평가</th>
                <th scope="col">시간</th>
                <th scope="col">공간</th>
                <th scope="col">한 줄 평</th>
              </tr>
            </thead>
            <tbody>
              {problem.approaches.map((approach) => (
                <tr key={approach.id} className={approach.id === active.id ? 'is-active' : undefined}>
                  <th scope="row">
                    <button type="button" className="row-btn" onClick={() => select(approach.id)}>
                      {approach.name}
                    </button>
                  </th>
                  <td>
                    <span className={`rank-label ${rankClass(approach.rank)}`}>{RANK_LABEL[approach.rank]}</span>
                  </td>
                  <td>
                    <code>{approach.timeComplexity}</code>
                  </td>
                  <td>
                    <code>{approach.spaceComplexity}</code>
                  </td>
                  <td>{approach.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
