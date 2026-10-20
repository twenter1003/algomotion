import type { Problem } from '../engine/model.ts';

// 문제 id → 문제 파일. 문제 파일은 열 때 불러와 첫 화면을 가볍게 둔다.
export const LOADERS: Record<string, () => Promise<Problem>> = {
  'game-map': () => import('./dfs-bfs/game-map.ts').then((m) => m.default),
  immigration: () => import('./binary-search/immigration.ts').then((m) => m.default),
  'feature-development': () => import('./stack-queue/feature-development.ts').then((m) => m.default),
};
