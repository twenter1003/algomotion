import type { Problem } from '../../engine/model.ts';

// 이 유형의 문제 id → 문제 파일. 이 유형을 맡은 작업자만 고친다.
export const loaders: Record<string, () => Promise<Problem>> = {
  'phone-book': () => import('./phone-book.ts').then((m) => m.default),
};
