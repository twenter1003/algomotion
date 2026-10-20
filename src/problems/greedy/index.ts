import type { Problem } from '../../engine/model.ts';

// 이 유형의 문제 id → 문제 파일. 이 유형을 맡은 작업자만 고친다.
export const loaders: Record<string, () => Promise<Problem>> = {
  joystick: () => import('./joystick.ts').then((m) => m.default),
  'make-big-number': () => import('./make-big-number.ts').then((m) => m.default),
  lifeboat: () => import('./lifeboat.ts').then((m) => m.default),
  'speed-camera': () => import('./speed-camera.ts').then((m) => m.default),
};
