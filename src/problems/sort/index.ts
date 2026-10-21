import type { Problem } from '../../engine/model.ts';

// 이 유형의 문제 id → 문제 파일. 이 유형을 맡은 작업자만 고친다.
export const loaders: Record<string, () => Promise<Problem>> = {
  'largest-number': () => import('./largest-number.ts').then((m) => m.default),
  'h-index': () => import('./h-index.ts').then((m) => m.default),
  'file-name-sort': () => import('./file-name-sort.ts').then((m) => m.default),
  tuple: () => import('./tuple.ts').then((m) => m.default),
  'min-sum': () => import('./min-sum.ts').then((m) => m.default),
  'table-hash': () => import('./table-hash.ts').then((m) => m.default),
};
