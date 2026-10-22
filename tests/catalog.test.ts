import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATEGORIES, findProblem, searchCatalog } from '../src/catalog.ts';
import { LOADERS } from '../src/problems/registry.ts';

test('유형 17개, 단계별 문제 수 10/6/4/2, 모두 88문제, id 중복 없음', () => {
  assert.equal(CATEGORIES.length, 17);
  for (const c of CATEGORIES) assert.equal(c.problems.length, { 1: 10, 2: 6, 3: 4, 4: 2 }[c.tier], c.id);
  const ids = CATEGORIES.flatMap((c) => c.problems.map((p) => p.id));
  assert.equal(ids.length, 88);
  assert.equal(new Set(ids).size, 88);
});
test('LOADERS의 문제는 목록에 있고 load가 붙어 있음', () => {
  for (const id of Object.keys(LOADERS)) assert.ok(findProblem(id)?.meta.load, id);
  for (const c of CATEGORIES) for (const p of c.problems) assert.equal(!!p.load, p.id in LOADERS, p.id);
});
test('불러온 문제의 제목, 레벨, 유형, 주소가 목록과 같음', async () => {
  for (const c of CATEGORIES) for (const p of c.problems.filter((m) => m.load)) {
    const problem = await p.load!();
    assert.deepEqual([problem.id, problem.title, problem.level, problem.category, problem.sourceUrl], [p.id, p.title, p.level, c.id, p.sourceUrl]);
  }
});
test('주소 모양', () => {
  for (const c of CATEGORIES) for (const p of c.problems) assert.match(p.sourceUrl, /^https:\/\/school\.programmers\.co\.kr\/learn\/courses\/30\/lessons\/\d+$/);
});
test('없는 id와 Object 속성 이름은 찾지 못하고, 있는 id는 유형과 순서를 줌 (Review Focus 4)', () => {
  for (const id of ['nope', 'constructor', 'toString', '__proto__', '']) assert.equal(findProblem(id), null, id);
  const found = findProblem('immigration');
  assert.deepEqual([found?.category.id, found?.index, found?.meta.title], ['binary-search', 0, '입국심사']);
});
test('검색: 제목, 유형 이름, 정석 이름으로 거르고 대소문자와 띄어쓰기는 가리지 않음', () => {
  const ids = (q: string) => searchCatalog(q).map((g) => [g.category.id, g.problems.length]);
  assert.equal(searchCatalog('').length, 17);
  assert.deepEqual(ids('이분'), [['binary-search', 6]]);
  assert.deepEqual(ids('bfs'), [['dfs-bfs', 10], ['graph', 1]]);
  assert.deepEqual(ids(' 게임맵 '), [['dfs-bfs', 1]]);
  assert.deepEqual(ids('없는 문제'), []);
});
