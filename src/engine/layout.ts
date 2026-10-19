import type { Point, Rect } from './model.ts';

// 격자의 (r, c) 칸
export const grid = (o: { x: number; y: number; rows: number; cols: number; cell: number; gap: number }) =>
  (r: number, c: number): Rect => ({ x: o.x + c * (o.cell + o.gap), y: o.y + r * (o.cell + o.gap), w: o.cell, h: o.cell });

// 가로로 늘어선 칸 줄의 i번 칸
export const slots = (o: { x: number; y: number; w: number; h: number; gap: number }) =>
  (i: number): Rect => ({ x: o.x + i * (o.w + o.gap), y: o.y, w: o.w, h: o.h });

// 삼각형: r번 줄에는 r + 1칸이 있고, 줄마다 width 안에서 가운데 정렬한다
export const pyramid = (o: { x: number; y: number; width: number; rows: number; cell: number; gap: number }) =>
  (r: number, c: number): Rect => {
    const rowWidth = (r + 1) * o.cell + r * o.gap;
    return { x: o.x + (o.width - rowWidth) / 2 + c * (o.cell + o.gap), y: o.y + r * (o.cell + o.gap), w: o.cell, h: o.cell };
  };

// 수직선: min은 x, max는 x + w에 놓인다
export const axis = (o: { x: number; w: number; min: number; max: number }) =>
  (v: number): number => o.x + ((v - o.min) / (o.max - o.min)) * o.w;

export const around = (r: Rect, pad: number): Rect => ({ x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 });
export const center = (r: Rect): Point => [r.x + r.w / 2, r.y + r.h / 2];
