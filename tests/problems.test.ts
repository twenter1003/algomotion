import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { LOADERS } from '../src/problems/registry.ts';

// 모든 문제에 같은 점검을 돌리고, 기대값 표는 있는 문제만 확인한다.
const load = (code: string) => new Function(`${code}\nreturn solution;`)() as (...a: unknown[]) => unknown;
const json = (v: unknown) => JSON.parse(JSON.stringify(v));
const EXPECT: Record<string, { work: [number, number, number]; answer: unknown }> = {
  'game-map': { work: [16, 16, 25], answer: 11 },
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
        for (const lang of ['python', 'javascript'] as const) {
          const lines = a.code[lang].split('\n').length;
          for (const h of [s.codeHighlights, ...s.phases.map((p) => p.codeHighlights).filter(Boolean)])
            for (const n of h![lang]) assert.ok(n >= 1 && n <= lines, `${a.id} ${s.title} ${lang} ${n}`);
        }
      }));
    });
    test('work는 줄지 않고, 마지막 단계는 결과 단계이며 answer가 같은 풀이 코드의 결과와 같음', () => {
      problem.approaches.forEach((a, i) => {
        const steps = vizs[i].steps;
        steps.forEach((s, k) => k && assert.ok(s.work >= steps[k - 1].work, `${a.id} ${s.title}`));
        const last = steps.at(-1)!;
        assert.ok(last.isKeyframe);
        assert.deepEqual(json(last.answer), json(load(a.code.javascript)(...structuredClone(problem.demo.input))));
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
  });
}
