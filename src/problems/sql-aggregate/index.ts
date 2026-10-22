import type { Problem } from '../../engine/model.ts';

export const loaders: Record<string, () => Promise<Problem>> = {
  'most-expensive-food': () => import('./most-expensive-food.ts').then((m) => m.default),
  'biggest-fish-per-type': () => import('./biggest-fish-per-type.ts').then((m) => m.default),
};
