import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import './styles/stage.css';
import App from './App.tsx';

// 새 버전 배포 등으로 이전 해시의 청크를 찾지 못할 때 페이지를 최신으로 새로고침한다
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
