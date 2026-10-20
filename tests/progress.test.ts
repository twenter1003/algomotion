import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createProgress } from '../src/progress.ts';

const memory = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
test('봤음과 이어 보기를 저장하고 읽음', () => {
  const p = createProgress(memory());
  p.markSeen('game-map'); p.markSeen('game-map'); p.setLast('immigration');
  assert.deepEqual([...p.seen()], ['game-map']);
  assert.equal(p.last(), 'immigration');
});
test('저장소가 예외를 던져도 앱은 계속 (Review Focus 3)', () => {
  const p = createProgress({ getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } });
  assert.doesNotThrow(() => { p.markSeen('a'); p.setLast('a'); });
  assert.equal(p.seen().size, 0);
  assert.equal(p.last(), null);
});
test('저장소가 없거나 값이 깨져도 빈 값', () => {
  assert.equal(createProgress(null).seen().size, 0);
  const bad = memory(); bad.setItem('algomotion:seen', '{깨짐');
  assert.equal(createProgress(bad).seen().size, 0);
});
test('배열이 아닌 값이나 문자열이 아닌 항목은 버림', () => {
  const odd = memory(); odd.setItem('algomotion:seen', '{"a":1}');
  assert.equal(createProgress(odd).seen().size, 0);
  odd.setItem('algomotion:seen', '["game-map", 3, null]');
  assert.deepEqual([...createProgress(odd).seen()], ['game-map']);
});
