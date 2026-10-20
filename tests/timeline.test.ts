import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AlgorithmStep, Phase } from '../src/engine/model.ts';
import { cycleLabels, planStep } from '../src/engine/timeline.ts';
import { LOADERS } from '../src/problems/registry.ts';

const step = (phases: Phase[], isKeyframe = false): AlgorithmStep => ({ title: 't', phases, scene: { width: 1, height: 1, items: [] },
  codeHighlights: { python: [1], javascript: [1] }, variables: {}, work: 0, isKeyframe });

test('동작은 차례로, together는 같이', () => {
  const p = planStep(step([{ label: 'a', caption: 'c', actions: [
    { type: 'set', id: 'x', patch: { tone: 'current' } },
    { type: 'add', item: { id: 'y', kind: 'token', rect: { x: 0, y: 0, w: 1, h: 1 } } },
    { type: 'set', id: 'z', patch: { rect: { x: 1, y: 0, w: 1, h: 1 } }, together: true } ] }]));
  assert.deepEqual(p.phases[0].actions.map((a) => [a.start, a.duration]), [[0, 260], [260, 460], [260, 420]]);
  assert.equal(p.phases[0].end, 720);
  assert.equal(p.total, 720 + 320);
});

test('다음 마디는 PHASE_GAP 뒤, 결과 단계는 KEYFRAME_TAIL', () => {
  const p = planStep(step([{ label: 'a', caption: 'c', actions: [] }, { label: 'b', caption: 'd', actions: [{ type: 'unfocus' }] }], true));
  assert.deepEqual([p.phases[1].start, p.phases[1].end, p.total], [640, 1140, 2340]);
  assert.equal(p.phases[1].actions[0].start, 640); // 동작 시각도 단계 시작부터 센 값(무대는 이 시각에 일을 건다)
});

test('움직임 줄이기는 120ms 상한', () => {
  const p = planStep(step([{ label: 'a', caption: 'c', actions: [{ type: 'trace', id: 'l', points: [] }] }]), { reducedMotion: true });
  assert.equal(p.phases[0].actions[0].duration, 120);
});

test('움직임 줄이기에서도 마디는 MIN_PHASE 이상', () => {
  const p = planStep(step([{ label: 'a', caption: 'c', actions: [{ type: 'focus', ids: ['x'] }] }]), { reducedMotion: true });
  assert.equal(p.phases[0].end, 500);
});

test('다음 동작은 앞 묶음(together 포함)이 다 끝난 뒤', () => {
  const p = planStep(step([{ label: 'a', caption: 'c', actions: [
    { type: 'arrow', from: 'x', to: 'y', verdict: 'new', label: '새 칸' },
    { type: 'set', id: 'y', patch: { tone: 'queued' }, together: true },
    { type: 'arrow', from: 'x', to: 'z', verdict: 'wall', label: '벽' } ] }]));
  assert.deepEqual(p.phases[0].actions.map((a) => a.start), [0, 0, 300]);
  assert.equal(p.phases[0].end, 600);
});

test('cycleLabels: 게임 맵 정석은 꺼내기, 살피기, 넣기', async () => {
  const viz = (await LOADERS['game-map']()).approaches[0].visualize();
  assert.deepEqual(cycleLabels(viz), ['꺼내기', '살피기', '넣기']);
});
