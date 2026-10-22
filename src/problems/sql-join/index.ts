import type { Problem } from '../../engine/model.ts';

export const loaders: Record<string, () => Promise<Problem>> = {
  'missing-records': () => import('./missing-records.ts').then((m) => m.default),
  'may-food-total-sales': () => import('./may-food-total-sales.ts').then((m) => m.default),
};
