import assert from 'node:assert/strict';
import { test } from 'node:test';
import { at, fmt, josa, lines, ro, sum, together } from '../src/problems/shared.ts';

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
test('lines: 두 언어 코드에서 조각이 든 줄 번호', () => {
  assert.deepEqual(lines({ python: 'a\nb', javascript: 'x\ny' }, ['b'], ['y', 'x']), { python: [2], javascript: [2, 1] });
});
test('together: 첫 동작만 앞 묶음 뒤에, join이면 첫 동작도 같이', () => {
  const wait = { type: 'wait', ms: 1 } as const;
  assert.deepEqual(together([wait, wait]).map((a) => a.together), [undefined, true]);
  assert.deepEqual(together([wait], true).map((a) => a.together), [true]);
});
