import type { Problem } from '../../engine/model.ts';

export const loaders: Record<string, () => Promise<Problem>> = {
  'same-name-animal-count': () => import('./same-name-animal-count.ts').then((m) => m.default),
  'most-expensive-food-by-category': () => import('./most-expensive-food-by-category.ts').then((m) => m.default),
};
