import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseHash, problemHref } from '../src/route.ts';

// Review Focus 4
test('parseHash', () => {
  for (const h of ['', '#', '#/', '#/p/', '#/x', '#/p']) assert.deepEqual(parseHash(h), { page: 'home' }, h);
  assert.deepEqual(parseHash('#/p/game-map'), { page: 'problem', id: 'game-map' });
  assert.deepEqual(parseHash('#/p/%EA%B0%80'), { page: 'problem', id: '가' });
  assert.equal(problemHref('game-map'), '#/p/game-map');
});
test('깨진 퍼센트 인코딩은 그대로 문제 id로 둠(없는 문제로 안내)', () => {
  assert.deepEqual(parseHash('#/p/%E0%A4%A'), { page: 'problem', id: '%E0%A4%A' });
});
