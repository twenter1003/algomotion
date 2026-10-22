import type { Problem } from '../../engine/model.ts';

export const loaders: Record<string, () => Promise<Problem>> = {
  'find-el-in-dog': () => import('./find-el-in-dog.ts').then((m) => m.default),
  'long-term-protected-animals-2': () => import('./long-term-protected-animals-2.ts').then((m) => m.default),
};
