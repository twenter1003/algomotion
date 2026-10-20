// 파이썬 풀이를 python3 하위 프로세스 하나로 돌려 사례마다 답을 받는다. python3가 없으면 PYTHON은 null이다.
import { spawnSync } from 'node:child_process';

export const PYTHON: string | null = spawnSync('python3', ['--version'], { encoding: 'utf8' }).status === 0 ? 'python3' : null;

// 표준 입력의 {code, cases}를 받아 사례마다 solution을 부르고, 답들을 JSON 배열 한 줄로 낸다.
const HARNESS = `import json, sys
data = json.load(sys.stdin)
ns = {}
exec(data['code'], ns)
print(json.dumps([ns['solution'](*args) for args in data['cases']]))`;

export function runPython(code: string, argsList: unknown[][]): unknown[] {
  const r = spawnSync('python3', ['-c', HARNESS], { encoding: 'utf8', input: JSON.stringify({ code, cases: argsList }) });
  if (r.status !== 0) throw new Error(`Python 실행 실패\n${r.stderr}`);
  return JSON.parse(r.stdout);
}
