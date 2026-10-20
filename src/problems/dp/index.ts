import type { Problem } from '../../engine/model.ts';

// 이 유형의 문제 id → 문제 파일. 이 유형을 맡은 작업자만 고친다.
export const loaders: Record<string, () => Promise<Problem>> = {
  'integer-triangle': () => import('./integer-triangle.ts').then((m) => m.default),
  'way-to-school': () => import('./way-to-school.ts').then((m) => m.default),
  'express-with-n': () => import('./express-with-n.ts').then((m) => m.default),
  'long-jump': () => import('./long-jump.ts').then((m) => m.default),
  'tiling-2xn': () => import('./tiling-2xn.ts').then((m) => m.default),
  'land-grab': () => import('./land-grab.ts').then((m) => m.default),
  'largest-square': () => import('./largest-square.ts').then((m) => m.default),
  'coin-change': () => import('./coin-change.ts').then((m) => m.default),
  'pulse-subarray': () => import('./pulse-subarray.ts').then((m) => m.default),
};
