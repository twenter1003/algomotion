import React from 'react';
import type { FeatureState, QueueData } from '../../types';

const STATUS_LABEL: Record<FeatureState['status'], string> = {
  waiting: '대기',
  bundled: '이번 묶음',
  deployed: '배포 완료',
};

export const QueueVisualizer: React.FC<{ data: QueueData; note: React.ReactNode }> = ({ data, note }) => {
  const { day, deployDay, features, focus, log } = data;

  return (
    <div className="viz">
      <div className="viz-head">
        {note}
        <div className="info-pills">
          <span className="info-pill">{day === 0 ? '0일째 (시작)' : `${day}일째 진도`}</span>
          {deployDay !== null && (
            <span className="info-pill">
              배포일 <strong>{deployDay}일째</strong>
            </span>
          )}
        </div>
      </div>

      <div className="feature-queue">
        <span className="queue-front" aria-hidden="true">
          앞
        </span>
        <ol className="feature-list" aria-label="기능 큐, 앞에서부터">
          {features.map((feature, idx) => (
            <li key={feature.name} className={`feature is-${feature.status}${focus === idx ? ' is-focus' : ''}`}>
              <div className="feature-top">
                <span className="feature-name">{feature.name}</span>
                <span className="feature-status">{STATUS_LABEL[feature.status]}</span>
              </div>
              <div className="feature-bar" aria-hidden="true">
                <div className="feature-fill" style={{ width: `${feature.progressNow}%` }} />
              </div>
              <div className="feature-meta">
                <span>진도 {feature.progressNow}%</span>
                <span>하루 +{feature.speed}%</span>
              </div>
              <div className="feature-calc">
                ⌈(100 − {feature.progress}) ÷ {feature.speed}⌉ = <strong>{feature.days}일</strong>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="deploy-log">
        <span className="strip-label">배포 기록</span>
        {log.length === 0 ? (
          <span className="strip-empty">아직 없음</span>
        ) : (
          <ol className="deploy-items">
            {log.map((entry, idx) => (
              <li key={entry.day} className="deploy-item">
                {idx + 1}차 {entry.day}일째 <strong>{entry.count}개</strong>
              </li>
            ))}
          </ol>
        )}
        <code className="deploy-answer">answer = [{log.map((entry) => entry.count).join(', ')}]</code>
      </div>
    </div>
  );
};
