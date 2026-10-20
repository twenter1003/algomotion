import React from 'react';
import type { Rank } from '../engine/model';

/** 빨간펜 채점 표시: 정석 ○, 대안 △, 함정 ✕ */
export const GradeMark: React.FC<{ rank: Rank }> = ({ rank }) => (
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
