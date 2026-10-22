import type { Action, CodeHighlights, Language, Point } from '../engine/model.ts';

/** 코드에서 needle이 들어 있는 첫 줄의 번호(1부터)를 찾습니다. 코드를 고쳐도 하이라이트가 어긋나지 않습니다. */
export const at = (code: string, ...needles: string[]): number[] => {
  const rows = code.split('\n');
  return needles.map((needle) => {
    const index = rows.findIndex((row) => row.includes(needle));
    if (index < 0) throw new Error(`코드에서 "${needle}" 줄을 찾지 못했습니다`);
    return index + 1;
  });
};

// 풀이 코드에서 조각이 든 줄 번호: Python 조각들, JavaScript 조각들
export const lines = (code: Record<Language, string>, python: string[], javascript: string[]): Record<Language, number[]> =>
  ({ python: at(code.python, ...python), javascript: at(code.javascript, ...javascript) });

// SQL 문제용: SQL·Python·JavaScript 세 언어 코드에서 조각이 든 줄 번호
export const sqlLines = (
  code: { sql: string; python: string; javascript: string },
  sql: string[],
  python: string[],
  javascript: string[],
): CodeHighlights => ({
  sql: at(code.sql, ...sql),
  python: at(code.python, ...python),
  javascript: at(code.javascript, ...javascript),
});

// 한 묶음: 첫 동작은 앞 동작이 끝난 뒤, 나머지는 첫 동작과 같이 시작한다. join이면 첫 동작도 앞 동작과 같이 시작한다.
export const together = (actions: Action[], join = false): Action[] =>
  actions.map((a, i) => (i || join ? { ...a, together: true } : a));

// 숫자로 끝나는 말 뒤 조사: 2·4·5·9(이·사·오·구)로 끝나면 받침이 없고, '로'는 ㄹ 받침(1·7·8)에도 씁니다.
const lastDigit = (word: string | number) => String(word).replace(/\D/g, '').slice(-1);
export const josa = (word: string | number, batchim: string, plain: string) =>
  `${word}${'2459'.includes(lastDigit(word)) ? plain : batchim}`;
export const ro = (word: string | number) => `${word}${'036'.includes(lastDigit(word)) ? '으로' : '로'}`;

export const fmt = ([r, c]: Point) => `(${r}, ${c})`;
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
