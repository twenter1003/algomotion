import type { Problem } from '../../engine/model.ts';

export const loaders: Record<string, () => Promise<Problem>> = {
  'null-handling': () => import('./null-handling.ts').then((m) => m.default),
  'unupgradable-items': () => import('./unupgradable-items.ts').then((m) => m.default),
};
