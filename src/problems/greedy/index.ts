import type { Problem } from '../../engine/model.ts';

// 이 유형의 문제 id → 문제 파일. 이 유형을 맡은 작업자만 고친다.
export const loaders: Record<string, () => Promise<Problem>> = {
  joystick: () => import('./joystick.ts').then((m) => m.default),
  'make-big-number': () => import('./make-big-number.ts').then((m) => m.default),
  lifeboat: () => import('./lifeboat.ts').then((m) => m.default),
  'speed-camera': () => import('./speed-camera.ts').then((m) => m.default),
  'base-station': () => import('./base-station.ts').then((m) => m.default),
  tangerine: () => import('./tangerine.ts').then((m) => m.default),
  'delivery-pickup': () => import('./delivery-pickup.ts').then((m) => m.default),
  interception: () => import('./interception.ts').then((m) => m.default),
  'number-game': () => import('./number-game.ts').then((m) => m.default),
};
