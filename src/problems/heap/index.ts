import type { Problem } from '../../engine/model.ts';

// 이 유형의 문제 id → 문제 파일. 이 유형을 맡은 작업자만 고친다.
export const loaders: Record<string, () => Promise<Problem>> = {
  spicier: () => import('./spicier.ts').then((m) => m.default),
  'disk-controller': () => import('./disk-controller.ts').then((m) => m.default),
  'double-priority-queue': () => import('./double-priority-queue.ts').then((m) => m.default),
  'defense-game': () => import('./defense-game.ts').then((m) => m.default),
};
