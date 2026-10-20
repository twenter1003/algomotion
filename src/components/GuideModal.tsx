import React from 'react';
import { Film, LayoutGrid, ListOrdered, Scale, X } from 'lucide-react';

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
            <ListOrdered size={20} aria-hidden="true" />
            <div>
              <h3>마디</h3>
              <p>한 단계는 꺼내기 → 살피기 → 넣기처럼 몇 마디로 나뉘어 차례로 움직입니다. 그림 위쪽에 지금 마디가 표시되고, 코드에서는 그 마디의 줄이 칠해집니다.</p>
            </div>
          </li>
          <li>
            <Film size={20} aria-hidden="true" />
            <div>
              <h3>풀이 탭</h3>
              <p>정석, 대안, 함정 탭을 눌러 풀이를 바꿔 봅니다. 풀이마다 그림이 따로 움직이고, 코드와 평가도 그 풀이 것으로 바뀝니다.</p>
            </div>
          </li>
          <li>
            <Scale size={20} aria-hidden="true" />
            <div>
              <h3>나란히 비교</h3>
              <p>&lsquo;나란히 비교&rsquo;를 누르면 세 풀이가 같은 박자로 동시에 돌아갑니다. 판마다 한 일의 양이 올라가서 어느 풀이가 더 많이 일하는지 바로 보입니다.</p>
            </div>
          </li>
          <li>
            <LayoutGrid size={20} aria-hidden="true" />
            <div>
              <h3>문제 고르기</h3>
              <p>홈에서는 유형 카드로, 문제 화면에서는 왼쪽 옆 메뉴로 문제를 고릅니다. 좁은 화면에서는 &lsquo;문제 목록&rsquo; 버튼으로 옆 메뉴를 엽니다.</p>
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
