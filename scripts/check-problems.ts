// 문제 데이터 점검: node scripts/check-problems.ts
import assert from 'node:assert/strict';
import { PROBLEMS } from '../src/problems/index.ts';

const CASES: Record<string, { args: unknown[]; expected: unknown }[]> = {
  'game-map': [
    { args: [[[1, 0, 1, 1, 1], [1, 0, 1, 0, 1], [1, 0, 1, 1, 1], [1, 1, 1, 0, 1], [0, 0, 0, 0, 1]]], expected: 11 },
    { args: [[[1, 0, 1, 1, 1], [1, 0, 1, 0, 1], [1, 0, 1, 1, 1], [1, 1, 1, 0, 0], [0, 0, 0, 0, 1]]], expected: -1 },
  ],
  immigration: [{ args: [6, [7, 10]], expected: 28 }],
  'feature-development': [
    { args: [[93, 30, 55], [1, 30, 5]], expected: [2, 1] },
    { args: [[95, 90, 99, 99, 80, 99], [1, 1, 1, 1, 1, 1]], expected: [1, 3, 2] },
  ],
  'integer-triangle': [{ args: [[[7], [3, 8], [8, 1, 0], [2, 7, 4, 4], [4, 5, 2, 6, 5]]], expected: 30 }],
};

const load = (code: string) => new Function(`${code}\nreturn solution;`)() as (...args: unknown[]) => unknown;

for (const problem of PROBLEMS) {
  const steps = problem.generateSteps();
  assert.ok(steps.length > 1, `${problem.id}: 단계가 없습니다`);
  assert.ok(steps.at(-1)?.isKeyframe, `${problem.id}: 마지막 단계가 결과 단계가 아닙니다`);

  for (const step of steps) {
    for (const lang of ['python', 'javascript'] as const) {
      const lineCount = problem.code[lang].split('\n').length;
      assert.ok(step.codeHighlights[lang].length > 0, `${problem.id} "${step.title}": ${lang} 하이라이트 없음`);
      for (const line of step.codeHighlights[lang]) {
        assert.ok(line >= 1 && line <= lineCount, `${problem.id} "${step.title}": ${lang} ${line}번 줄 없음`);
      }
    }
  }

  const last = steps.at(-1)!.visualState;
  const shown =
    last.type === 'grid'
      ? last.data.path.length
      : last.type === 'parametric'
        ? last.data.answer
        : last.type === 'queue'
          ? last.data.log.map((entry) => entry.count)
          : last.data.dp[0][0];
  assert.deepEqual(shown, CASES[problem.id][0].expected, `${problem.id}: 시각화 결과가 예제 답과 다릅니다`);

  for (const approach of problem.approaches) {
    const solution = load(approach.code.javascript);
    for (const { args, expected } of CASES[problem.id]) {
      assert.deepEqual(solution(...structuredClone(args)), expected, `${approach.id}: ${JSON.stringify(args)}`);
    }
  }
}

// 기능개발 함정 풀이 설명대로 남은 날 [5, 3, 4]에서 정석은 [3], 함정은 [2, 1]이어야 합니다.
const feature = PROBLEMS.find((p) => p.id === 'feature-development')!;
const trapArgs = [[95, 97, 96], [1, 1, 1]];
assert.deepEqual(load(feature.approaches[0].code.javascript)(...structuredClone(trapArgs)), [3]);
assert.deepEqual(load(feature.approaches[2].code.javascript)(...structuredClone(trapArgs)), [2, 1]);

console.log(`문제 ${PROBLEMS.length}개 점검 통과`);
