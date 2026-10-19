import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Lane, type LaneOptions } from '../src/engine/lane.ts';
import { slots } from '../src/engine/layout.ts';
import { StepRecorder } from '../src/engine/recorder.ts';

const slot = slots({ x: 40, y: 5, w: 64, h: 30, gap: 6 });
const xs = (rec: StepRecorder, ids: string[]) => ids.map((id) => rec.get(id).rect.x);
const slotXs = (...at: number[]) => at.map((i) => slot(i).x);

// 칸 하나가 있는 장면에 단계와 마디를 열고 줄을 만든다
const open = (o: Partial<LaneOptions> = {}) => {
  const rec = new StepRecorder({ width: 330, height: 120, items: [
    { id: 'cell:0,0', kind: 'cell', rect: { x: 14, y: 58, w: 54, h: 54 } } ] });
  rec.step({ title: '1', codeHighlights: { python: [1], javascript: [1] }, variables: {}, work: 0 });
  rec.phase('넣기', '토큰을 넣습니다');
  return { rec, lane: new Lane(rec, { id: 'lane', x: 40, y: 5, slotW: 64, slotH: 30, gap: 6, max: 4, ...o }) };
};
const fill = (lane: Lane, n: number) => {
  for (let i = 1; i <= n; i++) lane.push({ id: `t${i}`, text: `${i}` });
};

test('push 세 번이면 토큰이 0, 1, 2번 칸에 차례로 놓인다', () => {
  const { rec, lane } = open();
  lane.push({ id: 't1', text: '1' }, 'cell:0,0');
  lane.push({ id: 't2', text: '2' });
  lane.push({ id: 't3', text: '3', tone: 'current' });
  assert.deepEqual(xs(rec, ['t1', 't2', 't3']), slotXs(0, 1, 2));
  assert.deepEqual(lane.ids, ['t1', 't2', 't3']);
  assert.equal(rec.get('t3').tone, 'current');
  assert.throws(() => lane.push({ id: 't1', text: '1' }), /t1/);
  const { actions } = rec.finish().steps[0].phases[0];
  assert.deepEqual(actions[0], { type: 'add', item: { id: 't1', kind: 'token', rect: slot(0), text: '1', tone: 'queued' }, from: 'cell:0,0' });
  assert.deepEqual(actions.map((a) => a.together), [undefined, undefined, undefined]);   // push마다 따로 움직인다
});

test('shift는 앞 토큰을 꺼내고 나머지를 together로 한 칸씩 당긴다', () => {
  const { rec, lane } = open();
  assert.throws(() => lane.shift(), /lane/);                        // 빈 줄
  fill(lane, 3);
  rec.phase('꺼내기', '앞에서 꺼냅니다');
  assert.equal(lane.shift('cell:0,0'), 't1');
  assert.deepEqual(lane.ids, ['t2', 't3']);
  assert.equal(rec.has('t1'), false);
  assert.deepEqual(xs(rec, ['t2', 't3']), slotXs(0, 1));
  assert.deepEqual(rec.finish().steps[0].phases[1].actions, [
    { type: 'remove', id: 't1', into: 'cell:0,0' },
    { type: 'set', id: 't2', patch: { rect: slot(0) }, together: true },
    { type: 'set', id: 't3', patch: { rect: slot(1) }, together: true },
  ]);
});

test('접는 줄: max 4에 6개면 +3과 최근 3개, pop하면 +2와 다시 보이는 토큰, 4개 이하면 모두 보임', () => {
  const { rec, lane } = open({ foldable: true });
  fill(lane, 5);
  rec.do({ type: 'set', id: 't3', patch: { tone: 'current' } });  // 접혔다 돌아와도 이 모습 그대로
  lane.push({ id: 't6', text: '6' });
  assert.deepEqual(lane.ids, ['t1', 't2', 't3', 't4', 't5', 't6']);
  const more = rec.get('lane:more');
  assert.deepEqual([more.text, more.tone, more.rect.x], ['+3', 'muted', slot(0).x]);
  assert.deepEqual(xs(rec, ['t4', 't5', 't6']), slotXs(1, 2, 3));
  assert.deepEqual(['t1', 't2', 't3'].map((id) => rec.has(id)), [false, false, false]);
  assert.throws(() => lane.shift(), /lane/);                        // 접힌 줄은 앞에서 꺼낼 수 없다

  rec.phase('꺼내기', '위에서 꺼냅니다');
  assert.equal(lane.pop('cell:0,0'), 't6');
  assert.equal(rec.get('lane:more').text, '+2');
  assert.deepEqual(xs(rec, ['t3', 't4', 't5']), slotXs(1, 2, 3));
  assert.deepEqual([rec.has('t2'), rec.has('t6')], [false, false]);

  rec.phase('꺼내기', '하나 더 꺼냅니다');
  assert.equal(lane.pop(), 't5');
  assert.equal(rec.has('lane:more'), false);
  assert.deepEqual(xs(rec, ['t1', 't2', 't3', 't4']), slotXs(0, 1, 2, 3));

  const [, firstPop, secondPop] = rec.finish().steps[0].phases;
  assert.deepEqual(firstPop.actions, [
    { type: 'remove', id: 't6', into: 'cell:0,0' },
    { type: 'add', item: { id: 't3', kind: 'token', rect: slot(1), text: '3', tone: 'current' }, from: 'lane:more', together: true },
    { type: 'set', id: 't4', patch: { rect: slot(2) }, together: true },
    { type: 'set', id: 't5', patch: { rect: slot(3) }, together: true },
    { type: 'set', id: 'lane:more', patch: { text: '+2' }, together: true },
  ]);
  assert.deepEqual(secondPop.actions, [
    { type: 'remove', id: 't5' },
    { type: 'add', item: { id: 't1', kind: 'token', rect: slot(0), text: '1', tone: 'queued' }, from: 'lane:more', together: true },
    { type: 'add', item: { id: 't2', kind: 'token', rect: slot(1), text: '2', tone: 'queued' }, from: 'lane:more', together: true },
    { type: 'set', id: 't3', patch: { rect: slot(2) }, together: true },
    { type: 'set', id: 't4', patch: { rect: slot(3) }, together: true },
    { type: 'remove', id: 'lane:more', together: true },
  ]);
});

test('접지 않는 줄이 max를 넘으면 오류', () => {
  const { rec, lane } = open({ max: 2 });
  fill(lane, 2);
  assert.throws(() => lane.push({ id: 't3', text: '3' }), /lane/);
  assert.deepEqual(lane.ids, ['t1', 't2']);
  assert.equal(rec.has('t3'), false);
});

test('reorder는 두 토큰의 자리를 바꾸고, 움직인 토큰만 together로 set한다', () => {
  const { rec, lane } = open();
  fill(lane, 3);
  rec.phase('정렬', '비용순으로 세웁니다');
  lane.reorder(['t2', 't1', 't3']);
  assert.deepEqual(lane.ids, ['t2', 't1', 't3']);
  assert.deepEqual(xs(rec, ['t1', 't2', 't3']), slotXs(1, 0, 2));
  assert.throws(() => lane.reorder(['t2', 't1']), /lane/);          // 지금 토큰의 순열이 아님
  assert.deepEqual(rec.finish().steps[0].phases[1].actions, [
    { type: 'set', id: 't2', patch: { rect: slot(0) } },
    { type: 'set', id: 't1', patch: { rect: slot(1) }, together: true },
  ]);
});
