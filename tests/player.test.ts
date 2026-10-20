import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initialPlayer, playerReducer, type PlayerState } from '../src/engine/player.ts';

const s = (o: Partial<PlayerState>): PlayerState => ({ ...initialPlayer(10), ...o });

test('재생: 시작 전에서 첫 단계를 연출', () => assert.deepEqual(playerReducer(s({}), { type: 'play' }), s({ playing: true, animating: true })));
test('연출이 끝나면 다음 단계도 이어서', () => assert.deepEqual(playerReducer(s({ index: 2, playing: true, animating: true }), { type: 'stepDone' }), s({ index: 3, playing: true, animating: true })));
test('마지막 단계에 닿으면 멈춤', () => assert.deepEqual(playerReducer(s({ index: 8, playing: true, animating: true }), { type: 'stepDone' }), s({ index: 9 })));
test('연출 중 다음 → 그 단계 끝난 모습으로 바로', () => assert.deepEqual(playerReducer(s({ index: 3, playing: true, animating: true }), { type: 'next' }), s({ index: 4 })));
test('연출 중 이전 → 연출 전 모습으로', () => assert.deepEqual(playerReducer(s({ index: 3, animating: true }), { type: 'prev' }), s({ index: 3 })));
test('멈춰 있을 때 다음 → 한 단계만 연출', () => assert.deepEqual(playerReducer(s({ index: 3 }), { type: 'next' }), s({ index: 3, animating: true })));
test('끝에서 재생 → 처음부터', () => assert.deepEqual(playerReducer(s({ index: 9 }), { type: 'play' }), s({ index: -1, playing: true, animating: true })));
test('seek는 -1~9로 자르고 멈춤', () => {
  assert.equal(playerReducer(s({}), { type: 'seek', index: 99 }).index, 9);
  assert.equal(playerReducer(s({ playing: true, animating: true }), { type: 'seek', index: -5 }).index, -1);
});
test('멈춤 → 지금 연출은 마치고 이어 가지 않음', () => assert.deepEqual(playerReducer(s({ index: 3, playing: true, animating: true }), { type: 'pause' }), s({ index: 3, animating: true })));

test('멈춰 있을 때 이전은 한 단계 앞 끝난 모습, 처음으로는 속도를 남김, 한 단계 연출이 끝나면 멈춘 채로', () => {
  assert.deepEqual(playerReducer(s({ index: 3, playing: true }), { type: 'prev' }), s({ index: 2 }));
  assert.deepEqual(playerReducer(s({ index: -1 }), { type: 'prev' }), s({ index: -1 }));
  assert.deepEqual(playerReducer(s({ index: 5, playing: true, animating: true, speed: 2 }), { type: 'reset' }), s({ speed: 2 }));
  assert.deepEqual(playerReducer(s({ index: 3, animating: true }), { type: 'stepDone' }), s({ index: 4 }));
  assert.deepEqual(playerReducer(s({ index: 3 }), { type: 'stepDone' }), s({ index: 3 }));
});
