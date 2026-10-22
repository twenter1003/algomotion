import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { Item, Point, Rect, Scene, Visualization } from '../src/engine/model.ts';
import { LOADERS } from '../src/problems/registry.ts';
import { PYTHON, runPython } from './python.ts';
import { mulberry32 } from './rng.ts';

// 장면 점검 도구. 0.5px까지는 오차로 보고, 가장자리만 맞닿은 것은 겹침이 아니다.
const TOL = 0.5;
// 물체가 차지하는 두 모서리(line은 rect 대신 모든 점)
const corners = (item: Item): Point[] =>
  item.kind === 'line' ? item.points ?? [] : [[item.rect.x, item.rect.y], [item.rect.x + item.rect.w, item.rect.y + item.rect.h]];
// 안에 든다는 식을 뒤집어 쓴 것은 NaN 같은 깨진 좌표도 밖으로 치기 위해서다
const outside = (item: Item, { width, height }: Scene) =>
  corners(item).some(([x, y]) => !(x >= -TOL && x <= width + TOL && y >= -TOL && y <= height + TOL));
const overlap = (a: Rect, b: Rect) =>
  Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > TOL && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > TOL;
// 처음 장면과 단계마다의 장면: [이름, 장면]
const scenesOf = (viz: Visualization): [string, Scene][] =>
  [['initial', viz.initial], ...viz.steps.map((s): [string, Scene] => [s.title, s.scene])];

// 모든 문제에 같은 점검을 돌리고, 기대값 표는 있는 문제만 확인한다.
const load = (code: string) => new Function(`${code}\nreturn solution;`)() as (...a: unknown[]) => unknown;
const json = (v: unknown) => JSON.parse(JSON.stringify(v));
const EXPECT: Record<string, { work: [number, number, number]; answer: unknown }> = {
  'game-map': { work: [16, 16, 25], answer: 11 },
  immigration: { work: [6, 6, 28], answer: 28 },
  'feature-development': { work: [7, 7, 7], answer: [4, 2, 1] },
  'integer-triangle': { work: [10, 14, 31], answer: 30 },
};
for (const [id, loader] of Object.entries(LOADERS)) {
  const problem = await loader();
  const vizs = problem.approaches.map((a) => a.visualize());
  describe(id, () => {
    test('세 풀이가 정석, 대안, 함정 순서이고 함정은 trap 종류가 있음', () => {
      assert.deepEqual(problem.approaches.map((a) => a.rank), ['BEST', 'ALTERNATIVE', 'TRAP']);
      assert.ok(problem.approaches[2].trap);
    });
    test('정석과 대안의 JS 코드가 모든 사례를 맞힘', () => {
      for (const a of problem.approaches.slice(0, 2))
        for (const c of problem.checks.cases)
          assert.deepEqual(json(load(a.code.javascript)(...structuredClone(c.args))), c.expected, `${a.id} ${JSON.stringify(c.args)}`);
    });
    test('단계마다 마디가 있고 자막이 있고 하이라이트 줄이 코드 안에 있음', () => {
      problem.approaches.forEach((a, i) => vizs[i].steps.forEach((s) => {
        assert.ok(s.phases.length > 0 && s.phases.every((p) => p.caption.trim()), `${a.id} ${s.title}`);
        const langs = a.code.sql !== undefined ? (['sql', 'python', 'javascript'] as const) : (['python', 'javascript'] as const);
        for (const lang of langs) {
          const lines = a.code[lang]!.split('\n').length;
          for (const h of [s.codeHighlights, ...s.phases.map((p) => p.codeHighlights).filter(Boolean)])
            for (const n of h![lang] ?? []) assert.ok(n >= 1 && n <= lines, `${a.id} ${s.title} ${lang} ${n}`);
        }
      }));
    });
    test('하이라이트가 비어 있지 않음', () => {
      problem.approaches.forEach((a, i) => vizs[i].steps.forEach((s) => {
        const langs = a.code.sql !== undefined ? (['sql', 'python', 'javascript'] as const) : (['python', 'javascript'] as const);
        for (const lang of langs)
          for (const h of [s.codeHighlights, ...s.phases.map((p) => p.codeHighlights).filter(Boolean)])
            assert.ok((h![lang] ?? []).length > 0, `${a.id} ${s.title} ${lang}`);
      }));
    });
    test('물체가 장면 안에 있음', () => {
      problem.approaches.forEach((a, i) => scenesOf(vizs[i]).forEach(([where, scene]) => {
        for (const item of scene.items)
          if (outside(item, scene)) assert.fail(`${a.id} ${where} ${item.id} ${JSON.stringify(corners(item))} (장면 ${scene.width}×${scene.height})`);
      }));
    });
    test('칸끼리, 토큰끼리 겹치지 않음', () => {
      problem.approaches.forEach((a, i) => scenesOf(vizs[i]).forEach(([where, scene]) => {
        for (const kind of ['cell', 'token']) {
          const items = scene.items.filter((item) => item.kind === kind);
          items.forEach((p, k) => items.slice(k + 1).forEach((q) => {
            if (overlap(p.rect, q.rect)) assert.fail(`${a.id} ${where} ${p.id} ↔ ${q.id}`);
          }));
        }
      }));
    });
    test('work는 줄지 않고, 마지막 단계는 결과 단계이며 answer가 같은 풀이 코드의 결과와 같음', () => {
      problem.approaches.forEach((a, i) => {
        const steps = vizs[i].steps;
        steps.forEach((s, k) => k && assert.ok(s.work >= steps[k - 1].work, `${a.id} ${s.title}`));
        const last = steps.at(-1)!;
        assert.ok(last.isKeyframe, `${a.id} 마지막 단계(${last.title})가 결과 단계가 아님`);
        assert.deepEqual(json(last.answer), json(load(a.code.javascript)(...structuredClone(problem.demo.input))), `${a.id} answer`);
      });
    });
    test('함정이 드러남', () => {
      const [best, , trap] = vizs.map((v) => v.steps.at(-1)!);
      if (problem.approaches[2].trap === 'wrong') assert.notDeepEqual(json(trap.answer), json(best.answer));
      else assert.ok(trap.work > best.work);
    });
    test('단계 수: 정석 8~25, 함정 40 이하', () => {
      assert.ok(vizs[0].steps.length >= 8 && vizs[0].steps.length <= 25);
      assert.ok(vizs[2].steps.length <= 40);
    });
    if (EXPECT[id]) test('기대값', () => {
      assert.deepEqual(vizs.map((v) => v.steps.at(-1)!.work), EXPECT[id].work);
      assert.deepEqual(json(vizs[0].steps.at(-1)!.answer), EXPECT[id].answer);
    });
    test('정석과 대안의 Python 코드가 모든 사례를 맞힘', { skip: !PYTHON && 'python3 없음' }, () => {
      for (const a of problem.approaches.slice(0, 2))
        assert.deepEqual(runPython(a.code.python, problem.checks.cases.map((c) => c.args)), problem.checks.cases.map((c) => json(c.expected)), a.id);
    });
    test('무작위 입력 30개에서 정석·대안(과 느린 함정)의 JS·Python 답이 모두 같음', () => {
      const rand = mulberry32(20261020);
      const inputs = Array.from({ length: 30 }, () => problem.checks.random(rand));
      const same = problem.approaches.filter((a) => a.rank !== 'TRAP' || a.trap === 'slow');
      const expected = inputs.map((args) => json(load(same[0].code.javascript)(...structuredClone(args))));
      for (const a of same) {
        assert.deepEqual(inputs.map((args) => json(load(a.code.javascript)(...structuredClone(args)))), expected, `${a.id} JS`);
        if (PYTHON) assert.deepEqual(runPython(a.code.python, inputs), expected, `${a.id} Python`);
      }
    });
  });
}
