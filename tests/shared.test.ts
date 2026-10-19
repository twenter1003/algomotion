import assert from 'node:assert/strict';
import { test } from 'node:test';
import { at, fmt, josa, ro, sum } from '../src/problems/shared.ts';

test('josa: 2·4·5·9로 끝나면 받침 없는 조사', () => {
  assert.equal(josa(2, '을', '를'), '2를');
  assert.equal(josa('(2, 4)', '을', '를'), '(2, 4)를');
});
test('josa: 그 밖의 숫자는 받침 있는 조사', () => {
  assert.equal(josa(11, '이', '가'), '11이');
  assert.equal(josa('(1, 0)', '을', '를'), '(1, 0)을');
});
test('ro: 0·3·6은 으로, 나머지는 로', () => {
  assert.equal(ro(30), '30으로');
  assert.equal(ro(28), '28로');
  assert.equal(ro(1), '1로');
  assert.equal(ro('(0, 3)'), '(0, 3)으로');
});
test('at: 조각이 든 첫 줄 번호, 없으면 오류', () => {
  assert.deepEqual(at('a\nb\nab', 'b', 'ab'), [2, 3]);
  assert.throws(() => at('a', 'zz'), /zz/);
});
test('fmt, sum', () => {
  assert.equal(fmt([2, 3]), '(2, 3)');
  assert.equal(sum([1, 2, 3]), 6);
});
