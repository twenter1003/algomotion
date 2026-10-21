import type { Problem } from '../../engine/model.ts';

// 이 유형의 문제 id → 문제 파일. 이 유형을 맡은 작업자만 고친다.
export const loaders: Record<string, () => Promise<Problem>> = {
  delivery: () => import('./delivery.ts').then((m) => m.default),
  'farthest-node': () => import('./farthest-node.ts').then((m) => m.default),
  'connect-islands': () => import('./connect-islands.ts').then((m) => m.default),
  'shared-taxi': () => import('./shared-taxi.ts').then((m) => m.default),
};
