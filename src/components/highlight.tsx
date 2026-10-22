import type { ReactNode } from 'react';
import type { CodeLanguage, Language } from '../engine/model';

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
];

export const CODE_LANGUAGES: { id: CodeLanguage; label: string }[] = [
  { id: 'sql', label: 'SQL' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
];

const KEYWORDS: Record<CodeLanguage, Set<string>> = {
  sql: new Set([
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'GROUP', 'BY',
    'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'DISTINCT', 'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS',
    'IS', 'NULL', 'LIKE', 'BETWEEN', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'WITH', 'UNION', 'ALL',
    'OVER', 'PARTITION',
  ]),
  python: new Set([
    'and', 'as', 'break', 'continue', 'def', 'elif', 'else', 'for', 'from', 'if', 'import', 'in',
    'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'return', 'while', 'with', 'True', 'False', 'None',
  ]),
  javascript: new Set([
    'break', 'const', 'continue', 'else', 'for', 'function', 'if', 'in', 'let', 'new', 'of', 'return',
    'while', 'true', 'false', 'null', 'undefined', 'typeof',
  ]),
};

const BUILTINS = new Set([
  'len', 'range', 'max', 'min', 'sum', 'zip', 'float', 'deque', 'heapq', 'math', 'Math', 'Array', 'Infinity',
  'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'COALESCE', 'IFNULL', 'IF', 'LOWER', 'UPPER', 'DATE_FORMAT',
  'DATEDIFF', 'TIMESTAMPDIFF', 'YEAR', 'MONTH', 'DAY', 'SUBSTR', 'SUBSTRING', 'CONCAT', 'ROUND',
  'RANK', 'ROW_NUMBER', 'DENSE_RANK',
]);

// 주석 | 문자열 | 숫자 | 단어. Python의 //는 나눗셈이라 주석 규칙이 언어마다 다릅니다.
const TOKENS: Record<CodeLanguage, RegExp> = {
  sql: /(--.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g,
  python: /(#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g,
  javascript: /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g,
};

/** 코드 한 줄에 구문 색을 입힙니다. 여러 줄에 걸친 문자열·주석은 다루지 않습니다. */
export function highlight(line: string, lang: CodeLanguage): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of line.matchAll(TOKENS[lang])) {
    const [token, comment, str, num, word] = match;
    const lookupWord = lang === 'sql' && word ? word.toUpperCase() : word;
    const kind = comment
      ? 'comment'
      : str
        ? 'string'
        : num
          ? 'number'
          : KEYWORDS[lang].has(lookupWord)
            ? 'keyword'
            : BUILTINS.has(lookupWord)
              ? 'builtin'
              : null;
    if (!kind) continue;
    out.push(
      line.slice(last, match.index),
      <span key={match.index} className={`tok-${kind}`}>
        {token}
      </span>,
    );
    last = match.index + token.length;
  }
  out.push(line.slice(last));
  return out;
}
