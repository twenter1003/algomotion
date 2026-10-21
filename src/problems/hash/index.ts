import type { Problem } from '../../engine/model.ts';

// 이 유형의 문제 id → 문제 파일. 이 유형을 맡은 작업자만 고친다.
export const loaders: Record<string, () => Promise<Problem>> = {
  'phone-book': () => import('./phone-book.ts').then((m) => m.default),
  clothes: () => import('./clothes.ts').then((m) => m.default),
  'best-album': () => import('./best-album.ts').then((m) => m.default),
  'discount-event': () => import('./discount-event.ts').then((m) => m.default),
  'roll-cake': () => import('./roll-cake.ts').then((m) => m.default),
  'open-chat': () => import('./open-chat.ts').then((m) => m.default),
};
