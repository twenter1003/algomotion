import type { Problem } from '../../engine/model.ts';

export const loaders: Record<string, () => Promise<Problem>> = {
  'march-female-members': () => import('./march-female-members.ts').then((m) => m.default),
  'repurchase-members': () => import('./repurchase-members.ts').then((m) => m.default),
};
