import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ItemPatch, Scene } from '../src/engine/model.ts';
import { StepRecorder } from '../src/engine/recorder.ts';

const base = (): Scene => ({ width: 100, height: 100, items: [
  { id: 'a', kind: 'cell', rect: { x: 0, y: 0, w: 10, h: 10 }, tone: 'plain' } ] });
const meta = { title: '1', codeHighlights: { python: [1], javascript: [1] }, variables: {}, work: 0 };
const rect = { x: 0, y: 0, w: 10, h: 10 };

test('set·add·remove가 장면에 반영되고 단계마다 깊은 복사로 찍힌다', () => {
  const rec = new StepRecorder(base());
  rec.step({ title: '1', codeHighlights: { python: [1], javascript: [1] }, variables: {}, work: 1 });
  rec.phase('칠하기', '노랗게');
  rec.do({ type: 'set', id: 'a', patch: { tone: 'current' } });
  rec.step({ title: '2', codeHighlights: { python: [1], javascript: [1] }, variables: {}, work: 2 });
  rec.phase('더하기', '하나 더');
  rec.do({ type: 'add', item: { id: 'b', kind: 'token', rect: { x: 20, y: 0, w: 10, h: 10 } }, from: 'a' },
         { type: 'remove', id: 'a', into: 'b', together: true });
  const { initial, steps } = rec.finish();
  assert.equal(initial.items[0].tone, 'plain');
  assert.equal(steps[0].scene.items.find((i) => i.id === 'a')?.tone, 'current');
  assert.deepEqual(steps[1].scene.items.map((i) => i.id), ['b']);
  assert.equal(steps[1].phases[0].actions.length, 2);
});

test('없는 id, 겹치는 id, 순서 위반은 오류', () => {
  const rec = new StepRecorder(base());
  assert.throws(() => rec.phase('x', 'y'));                         // step 전
  rec.step({ title: '1', codeHighlights: { python: [1], javascript: [1] }, variables: {}, work: 0 });
  assert.throws(() => rec.do({ type: 'unfocus' }));                 // phase 전
  rec.phase('x', 'y');
  assert.throws(() => rec.do({ type: 'set', id: 'nope', patch: {} }), /nope/);
  assert.throws(() => rec.do({ type: 'add', item: base().items[0] }), /a/);
  assert.throws(() => rec.do({ type: 'arrow', from: 'a', to: 'zz', verdict: 'new', label: '새 칸' }), /zz/);
});

test('마디 없는 단계를 닫거나 단계 없이 끝내면 오류', () => {
  assert.throws(() => new StepRecorder(base()).finish());
  const rec = new StepRecorder(base());
  rec.step({ ...meta, title: '빈 단계' });
  assert.throws(() => rec.step(meta), /빈 단계/);
  assert.throws(() => rec.finish(), /빈 단계/);
});

test('focus·add from·remove into·trace도 가리키는 물체를 확인한다', () => {
  const rec = new StepRecorder(base());
  rec.step(meta);
  rec.phase('x', 'y');
  assert.throws(() => rec.do({ type: 'focus', ids: ['a', 'q'] }), /q/);
  assert.throws(() => rec.do({ type: 'add', item: { id: 'b', kind: 'token', rect }, from: 'q' }), /q/);
  assert.throws(() => rec.do({ type: 'remove', id: 'a', into: 'q' }), /q/);
  assert.throws(() => rec.do({ type: 'trace', id: 'a', points: [] }), /line/);
  assert.equal(rec.has('b'), false);                                // 실패한 동작은 장면에 남지 않는다
  rec.do({ type: 'add', item: { id: 'l', kind: 'line', rect, points: [] } },
         { type: 'trace', id: 'l', points: [[0, 0], [5, 5]] }, { type: 'set', id: 'l', patch: { tone: 'path' } });
  assert.deepEqual(rec.get('l').points, [[0, 0], [5, 5]]);
  // 뒤의 trace·set이 이미 기록한 add를 바꾸지 않는다
  assert.deepEqual(rec.finish().steps[0].phases[0].actions[0], { type: 'add', item: { id: 'l', kind: 'line', rect, points: [] } });
});

test('넘긴 장면·변수·동작을 나중에 고쳐도 기록은 그대로', () => {
  const scene = base();
  const variables: Record<string, string | number> = { n: 1 };
  const patch: ItemPatch = { tone: 'current' };
  const rec = new StepRecorder(scene);
  rec.step({ ...meta, variables });
  rec.phase('x', 'y');
  rec.do({ type: 'set', id: 'a', patch });
  scene.items[0].tone = 'bad';
  variables.n = 2;
  patch.tone = 'bad';
  const { initial, steps } = rec.finish();
  assert.equal(initial.items[0].tone, 'plain');
  assert.equal(steps[0].variables.n, 1);
  assert.deepEqual(steps[0].phases[0].actions[0], { type: 'set', id: 'a', patch: { tone: 'current' } });
});

test('get은 복사본을 돌려주고, 없는 id면 오류', () => {
  const rec = new StepRecorder(base());
  rec.get('a').rect.x = 99;
  assert.equal(rec.get('a').rect.x, 0);
  assert.throws(() => rec.get('zz'), /zz/);
});
