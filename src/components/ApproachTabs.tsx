import React from 'react';
import type { Approach } from '../engine/model';
import { ApproachLabel } from './ApproachLabel';

interface ApproachTabsProps {
  approaches: Approach[];
  active: number;
  onSelect: (i: number) => void;
  comparing: boolean;
  onToggleCompare: () => void;
}

// 풀이 탭과 '나란히 비교' 켜기. ←·→는 재생 단축키라 탭 사이 이동에 쓰지 않는다(탭은 Tab 키로 옮겨 다님)
export const ApproachTabs: React.FC<ApproachTabsProps> = ({ approaches, active, onSelect, comparing, onToggleCompare }) => (
  <div className="approach-bar">
    <div className="approach-tabs" role="tablist" aria-label="풀이 선택">
      {approaches.map((approach, i) => (
        <button
          key={approach.id}
          type="button"
          role="tab"
          className="approach-tab"
          aria-selected={i === active}
          onClick={() => onSelect(i)}
        >
          <ApproachLabel approach={approach} />
        </button>
      ))}
    </div>
    <button type="button" className="btn-outline" aria-pressed={comparing} onClick={onToggleCompare}>
      나란히 비교
    </button>
  </div>
);
