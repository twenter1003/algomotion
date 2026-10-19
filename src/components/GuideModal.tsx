import React from 'react';
import { Code, Film, Scale, X } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 네이티브 <dialog>가 포커스 가두기, Esc 닫기, 배경 처리를 맡습니다.
export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="guide-dialog"
      aria-labelledby="guide-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="guide-sheet">
        <div className="guide-head">
          <h2 id="guide-title">사용법</h2>
          <button type="button" className="icon-btn is-ghost" onClick={onClose} aria-label="닫기">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <ul className="guide-list">
          <li>
            <Film size={20} aria-hidden="true" />
            <div>
              <h3>단계별 그림</h3>
              <p>재생하면 알고리즘이 한 단계씩 움직입니다. 그림 위 손글씨 메모가 방금 일어난 일을 한 줄로 요약하고, 아래 설명이 이유를 풀어 줍니다.</p>
            </div>
          </li>
          <li>
            <Code size={20} aria-hidden="true" />
            <div>
              <h3>코드와 변수</h3>
              <p>오른쪽 코드에서 지금 실행 중인 줄이 형광펜으로 칠해지고, 방금 값이 바뀐 변수에는 &lsquo;바뀜&rsquo; 표시가 붙습니다.</p>
            </div>
          </li>
          <li>
            <Scale size={20} aria-hidden="true" />
            <div>
              <h3>풀이 비교</h3>
              <p>위쪽 &lsquo;풀이 비교&rsquo;에서 정석, 대안, 함정 풀이를 복잡도와 코드로 나란히 봅니다.</p>
            </div>
          </li>
        </ul>

        <h3 className="guide-sub">키보드</h3>
        <dl className="shortcut-list">
          <div>
            <dt>
              <kbd>Space</kbd>
            </dt>
            <dd>재생, 일시정지</dd>
          </div>
          <div>
            <dt>
              <kbd>←</kbd> <kbd>→</kbd>
            </dt>
            <dd>이전, 다음 단계</dd>
          </div>
          <div>
            <dt>
              <kbd>R</kbd>
            </dt>
            <dd>처음으로</dd>
          </div>
          <div>
            <dt>
              <kbd>Esc</kbd>
            </dt>
            <dd>이 창 닫기</dd>
          </div>
        </dl>

        <button type="button" className="btn-primary btn-block" onClick={onClose}>
          시작하기
        </button>
      </div>
    </dialog>
  );
};
