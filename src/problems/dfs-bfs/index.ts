import type { Problem } from '../../engine/model.ts';

// 이 유형의 문제 id → 문제 파일. 이 유형을 맡은 작업자만 고친다.
export const loaders: Record<string, () => Promise<Problem>> = {
  'game-map': () => import('./game-map.ts').then((m) => m.default),
  'target-number': () => import('./target-number.ts').then((m) => m.default),
  network: () => import('./network.ts').then((m) => m.default),
  'word-conversion': () => import('./word-conversion.ts').then((m) => m.default),
  'travel-route': () => import('./travel-route.ts').then((m) => m.default),
  'item-pickup': () => import('./item-pickup.ts').then((m) => m.default),
  'island-trip': () => import('./island-trip.ts').then((m) => m.default),
};
