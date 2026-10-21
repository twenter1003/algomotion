import type { Problem } from '../../engine/model.ts';

// 이 유형의 문제 id → 문제 파일. 이 유형을 맡은 작업자만 고친다.
export const loaders: Record<string, () => Promise<Problem>> = {
  'prime-finder': () => import('./prime-finder.ts').then((m) => m.default),
  'carpet': () => import('./carpet.ts').then((m) => m.default),
  'fatigue': () => import('./fatigue.ts').then((m) => m.default),
  'split-power-grid': () => import('./split-power-grid.ts').then((m) => m.default),
  'vowel-dictionary': () => import('./vowel-dictionary.ts').then((m) => m.default),
  'n-queen': () => import('./n-queen.ts').then((m) => m.default),
  'archery': () => import('./archery.ts').then((m) => m.default),
  'emoticon-sale': () => import('./emoticon-sale.ts').then((m) => m.default),
  'maximize-expression': () => import('./maximize-expression.ts').then((m) => m.default),
  'menu-renewal': () => import('./menu-renewal.ts').then((m) => m.default),
};
