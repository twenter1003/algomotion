import type { Problem } from '../../engine/model.ts';

// 이 유형의 문제 id → 문제 파일. 이 유형을 맡은 작업자만 고친다.
export const loaders: Record<string, () => Promise<Problem>> = {
  'feature-development': () => import('./feature-development.ts').then((m) => m.default),
  'valid-parentheses': () => import('./valid-parentheses.ts').then((m) => m.default),
  process: () => import('./process.ts').then((m) => m.default),
  'bridge-truck': () => import('./bridge-truck.ts').then((m) => m.default),
  'stock-price': () => import('./stock-price.ts').then((m) => m.default),
  'next-greater': () => import('./next-greater.ts').then((m) => m.default),
};
