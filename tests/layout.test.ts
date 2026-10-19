import assert from 'node:assert/strict';
import { test } from 'node:test';
import { around, axis, center, grid, pyramid, slots } from '../src/engine/layout.ts';

test('grid', () => assert.deepEqual(grid({ x: 10, y: 50, rows: 5, cols: 5, cell: 54, gap: 8 })(1, 2), { x: 134, y: 112, w: 54, h: 54 }));
test('slots', () => assert.deepEqual(slots({ x: 40, y: 5, w: 64, h: 30, gap: 6 })(3), { x: 250, y: 5, w: 64, h: 30 }));
test('pyramid: 줄마다 가운데', () => {
  const at = pyramid({ x: 0, y: 0, width: 290, rows: 5, cell: 50, gap: 10 });
  assert.equal(at(0, 0).x, 120);
  assert.equal(at(4, 0).x, 0);
  assert.equal(at(4, 0).y, 240);
});
test('axis', () => { const x = axis({ x: 20, w: 200, min: 1, max: 101 }); assert.equal(x(1), 20); assert.equal(x(101), 220); assert.equal(x(51), 120); });
test('around, center', () => {
  assert.deepEqual(around({ x: 10, y: 10, w: 54, h: 54 }, 5), { x: 5, y: 5, w: 64, h: 64 });
  assert.deepEqual(center({ x: 0, y: 0, w: 10, h: 20 }), [5, 10]);
});
