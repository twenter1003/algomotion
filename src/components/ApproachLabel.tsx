import React from 'react';
import type { Approach, Rank } from '../engine/model';
import { GradeMark } from './GradeMark';

const RANK_LABEL: Record<Rank, string> = { BEST: '정석', ALTERNATIVE: '대안', TRAP: '함정' };

// 빨간펜 채점 표시 + '정석 · 풀이 이름'. 풀이 탭, 경주 판 머리, 비교 막대가 같이 쓴다
export const ApproachLabel: React.FC<{ approach: Approach }> = ({ approach }) => (
  <span className="approach-label">
    <GradeMark rank={approach.rank} />
    <span className={`rank-label rank-${approach.rank.toLowerCase()}`}>{RANK_LABEL[approach.rank]}</span>
    <span> · {approach.name}</span>
  </span>
);
