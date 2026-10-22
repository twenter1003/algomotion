import type { Category, CategoryId, ProblemMeta } from './engine/model.ts';
import { LOADERS } from './problems/registry.ts';

// 빈도 단계, 유형, 문제 목록. 홈과 옆 메뉴는 이 가벼운 정보만으로 그리고, 문제 본문은 열 때 load로 불러온다.
// 유형 이름과 핵심 발상은 catalog.html 시안, 문제(제목, 레벨, 문제 번호, 정석 풀이)는 설계서 4.4 표를 따른다.
export const TIER_NAMES: Record<1 | 2 | 3 | 4, string> = {
  1: '아주 자주 나와요',
  2: '자주 나와요',
  3: '가끔 나와요',
  4: 'SQL 고득점 Kit',
};

type Row = [id: string, title: string, level: 2 | 3, lesson: number, bestName: string];

// load가 없으면 준비 중인 문제다
const category = (id: CategoryId, name: string, tier: 1 | 2 | 3 | 4, idea: string, rows: Row[]): Category => ({
  id, name, tier, idea,
  problems: rows.map(([pid, title, level, lesson, bestName]) => ({
    id: pid, title, level, bestName,
    sourceUrl: `https://school.programmers.co.kr/learn/courses/30/lessons/${lesson}`,
    load: LOADERS[pid],
  })),
});

export const CATEGORIES: Category[] = [
  category('dfs-bfs', 'DFS/BFS', 1, '가까운 곳부터 넓히거나(BFS) 끝까지 파고들며(DFS) 이어진 곳을 모두 찾습니다.', [
    ['game-map', '게임 맵 최단거리', 2, 1844, 'BFS'],
    ['target-number', '타겟 넘버', 2, 43165, 'DFS'],
    ['network', '네트워크', 3, 43162, 'DFS 연결 요소'],
    ['word-conversion', '단어 변환', 3, 43163, 'BFS'],
    ['travel-route', '여행경로', 3, 43164, 'DFS 백트래킹'],
    ['item-pickup', '아이템 줍기', 3, 87694, 'BFS·좌표 두 배'],
    ['island-trip', '무인도 여행', 2, 154540, 'BFS 영역 나누기'],
    ['maze-escape', '미로 탈출', 2, 159993, 'BFS 두 번'],
    ['ricochet-robot', '리코쳇 로봇', 2, 169199, 'BFS 미끄러지기'],
    ['oil-drilling', '석유 시추', 2, 250136, 'BFS 영역 + 열 합산'],
  ]),
  category('brute-force', '완전탐색', 1, '가능한 경우를 빠짐없이 만들어 보고, 안 되는 가지는 일찍 쳐냅니다.', [
    ['prime-finder', '소수 찾기', 2, 42839, '순열 + 소수 판정'],
    ['carpet', '카펫', 2, 42842, '약수 쌍'],
    ['fatigue', '피로도', 2, 87946, '순열 백트래킹'],
    ['split-power-grid', '전력망을 둘로 나누기', 2, 86971, '간선 하나씩 끊기'],
    ['vowel-dictionary', '모음사전', 2, 84512, 'DFS 사전 순'],
    ['n-queen', 'N-Queen', 2, 12952, '백트래킹'],
    ['archery', '양궁대회', 2, 92342, '화살 배분 백트래킹'],
    ['emoticon-sale', '이모티콘 할인행사', 2, 150368, '할인율 중복순열'],
    ['maximize-expression', '수식 최대화', 2, 67257, '연산자 순열'],
    ['menu-renewal', '메뉴 리뉴얼', 2, 72411, '조합 + 개수 세기'],
  ]),
  category('dp', 'DP', 1, '작은 문제의 답을 표에 적어 두고 큰 문제에서 다시 씁니다.', [
    ['integer-triangle', '정수 삼각형', 3, 43105, '아래에서 위로'],
    ['way-to-school', '등굣길', 3, 42898, '격자 경로 수'],
    ['express-with-n', 'N으로 표현', 3, 42895, '사용 횟수별 집합'],
    ['long-jump', '멀리 뛰기', 2, 12914, '피보나치형'],
    ['tiling-2xn', '2 x n 타일링', 2, 12900, '피보나치형'],
    ['land-grab', '땅따먹기', 2, 12913, '행별 최댓값'],
    ['largest-square', '가장 큰 정사각형 찾기', 2, 12905, 'min + 1'],
    ['coin-change', '거스름돈', 3, 12907, '동전 조합 수'],
    ['pulse-subarray', '연속 펄스 부분 수열의 합', 3, 161988, '최대 부분합'],
    ['number-transform', '숫자 변환하기', 2, 154538, '최소 연산 표'],
  ]),
  category('greedy', '그리디', 1, '매 순간 가장 좋아 보이는 선택을 하고, 그게 전체 최적인 이유를 확인합니다.', [
    ['joystick', '조이스틱', 2, 42860, '좌우 이동 최소'],
    ['make-big-number', '큰 수 만들기', 2, 42883, '스택으로 작은 수 버리기'],
    ['lifeboat', '구명보트', 2, 42885, '정렬 + 양 끝 짝짓기'],
    ['speed-camera', '단속카메라', 3, 42884, '끝점 정렬'],
    ['base-station', '기지국 설치', 3, 12979, '빈 구간 나누기'],
    ['tangerine', '귤 고르기', 2, 138476, '많은 크기부터'],
    ['delivery-pickup', '택배 배달과 수거하기', 2, 150369, '먼 집부터'],
    ['interception', '요격 시스템', 2, 181188, '끝점 정렬'],
    ['number-game', '숫자 게임', 3, 12987, '정렬 후 이기는 짝'],
    ['magic-elevator', '마법의 엘리베이터', 2, 148653, '자릿수 반올림'],
  ]),
  category('hash', '해시', 2, '키로 값을 바로 찾는 사전으로 세기와 찾기를 한 번에 합니다.', [
    ['phone-book', '전화번호 목록', 2, 42577, '접두어 집합'],
    ['clothes', '의상', 2, 42578, '종류별 곱'],
    ['best-album', '베스트앨범', 3, 42579, '장르별 묶기'],
    ['discount-event', '할인 행사', 2, 131127, '10일 창 세기'],
    ['roll-cake', '롤케이크 자르기', 2, 132265, '양쪽 종류 수'],
    ['open-chat', '오픈채팅방', 2, 42888, '마지막 닉네임 사전'],
  ]),
  category('stack-queue', '스택/큐', 2, '넣은 순서대로(큐) 또는 거꾸로(스택) 꺼내며 순서 문제를 풉니다.', [
    ['feature-development', '기능개발', 2, 42586, '배포일로 묶기'],
    ['valid-parentheses', '올바른 괄호', 2, 12909, '여는 괄호 개수'],
    ['process', '프로세스', 2, 42587, '큐 + 우선순위'],
    ['bridge-truck', '다리를 지나는 트럭', 2, 42583, '시간별 큐'],
    ['stock-price', '주식가격', 2, 42584, '단조 스택'],
    ['next-greater', '뒤에 있는 큰 수 찾기', 2, 154539, '단조 스택'],
  ]),
  category('binary-search', '이분 탐색', 2, '답의 범위를 반씩 줄여 가며 조건을 만족하는 경계를 찾습니다.', [
    ['immigration', '입국심사', 3, 43238, '시간을 이분 탐색'],
    ['stepping-stones', '징검다리 건너기', 3, 64062, '인원 수를 이분 탐색'],
    ['rank-search', '순위 검색', 2, 72412, '점수 하한 찾기'],
    ['puzzle-challenge', '퍼즐 게임 챌린지', 2, 340212, '숙련도를 이분 탐색'],
    ['gold-silver', '금과 은 운반하기', 3, 86053, '시간을 이분 탐색'],
    ['fifo-scheduling', '선입 선출 스케줄링', 3, 12920, '시간을 이분 탐색'],
  ]),
  category('sort', '정렬', 2, '순서를 맞춰 두면 보이지 않던 규칙이 보입니다.', [
    ['largest-number', '가장 큰 수', 2, 42746, '이어 붙여 비교'],
    ['h-index', 'H-Index', 2, 42747, '내림차순'],
    ['file-name-sort', '파일명 정렬', 2, 17686, 'HEAD·NUMBER 기준'],
    ['tuple', '튜플', 2, 64065, '길이순'],
    ['min-sum', '최솟값 만들기', 2, 12941, '오름·내림 짝짓기'],
    ['table-hash', '테이블 해시 함수', 2, 147354, '여러 기준 정렬'],
  ]),
  category('heap', '힙', 3, '가장 작은 값이나 큰 값을 계속 꺼내야 할 때 씁니다.', [
    ['spicier', '더 맵게', 2, 42626, '최소 힙'],
    ['disk-controller', '디스크 컨트롤러', 3, 42627, '작업 시간 최소 힙'],
    ['double-priority-queue', '이중우선순위큐', 3, 42628, '힙 두 개'],
    ['defense-game', '디펜스 게임', 2, 142085, '막은 라운드 최소 힙'],
  ]),
  category('graph', '그래프', 3, '가중치 있는 최단 경로와, 이어진 묶음을 다룹니다.', [
    ['delivery', '배달', 2, 12978, '다익스트라'],
    ['farthest-node', '가장 먼 노드', 3, 49189, 'BFS 거리'],
    ['connect-islands', '섬 연결하기', 3, 42861, '크루스칼 + 유니온 파인드'],
    ['shared-taxi', '합승 택시 요금', 3, 72413, '플로이드 와셜'],
  ]),
  category('two-pointer', '투 포인터', 3, '두 손가락을 옮기며 구간의 합이나 범위를 한 번에 훑습니다.', [
    ['consecutive-subsequence', '연속된 부분 수열의 합', 2, 178870, '구간 늘리고 줄이기'],
    ['gem-shopping', '보석 쇼핑', 3, 67258, '모든 종류를 담는 최소 구간'],
    ['equal-queues', '두 큐 합 같게 만들기', 2, 118667, '큰 쪽에서 옮기기'],
    ['number-expression', '숫자의 표현', 2, 12924, '연속 합 구간'],
  ]),
  category('sql-select', 'SQL · SELECT', 4, '조건(WHERE)에 맞는 행을 고르고 원하는 기준(ORDER BY)으로 정렬해 출력합니다.', [
    ['march-female-members', '3월에 태어난 여성 회원 목록 출력하기', 2, 131120, 'WHERE 3월·여성·IS NOT NULL'],
    ['repurchase-members', '재구매가 일어난 상품과 회원 리스트 구하기', 2, 131536, 'GROUP BY 두 열 + HAVING'],
  ]),
  category('sql-aggregate', 'SQL · SUM, MAX, MIN', 4, '최댓값·최솟값·합계를 구하고, 집계값과 원본 행을 서브쿼리로 연결합니다.', [
    ['most-expensive-food', '가격이 제일 비싼 식품의 정보 출력하기', 2, 131115, 'ORDER BY DESC + LIMIT 1'],
    ['biggest-fish-per-type', '물고기 종류 별 대어 찾기', 3, 293261, '종류별 MAX 서브쿼리 + JOIN'],
  ]),
  category('sql-group-by', 'SQL · GROUP BY', 4, '기준 열로 행을 묶어 집계하고, 묶기 전 조건(WHERE)과 묶은 뒤 조건(HAVING)을 구분합니다.', [
    ['same-name-animal-count', '동명 동물 수 찾기', 2, 59041, 'WHERE IS NOT NULL + HAVING'],
    ['most-expensive-food-by-category', '식품분류별 가장 비싼 식품의 정보 조회하기', 3, 131116, '(분류, 가격) IN 서브쿼리'],
  ]),
  category('sql-is-null', 'SQL · IS NULL', 4, '비어 있는 값(NULL)을 기본값으로 바꾸거나(COALESCE), NULL 여부를 조건으로 판별합니다.', [
    ['null-handling', 'NULL 처리하기', 2, 59410, 'COALESCE / IFNULL'],
    ['unupgradable-items', '업그레이드 할 수 없는 아이템 구하기', 3, 273712, 'LEFT JOIN 부모키 + IS NULL'],
  ]),
  category('sql-join', 'SQL · JOIN', 4, '두 테이블을 외래키로 연결해 한쪽에만 있는 행(LEFT JOIN)이나 양쪽 모두 있는 행(INNER JOIN)을 찾습니다.', [
    ['missing-records', '없어진 기록 찾기', 3, 59042, 'LEFT JOIN + IS NULL'],
    ['may-food-total-sales', '5월 식품들의 총매출 조회하기', 3, 131117, '5월 필터 + JOIN + GROUP BY'],
  ]),
  category('sql-string-date', 'SQL · String, Date', 4, '문자열 패턴(LIKE·LOWER)과 날짜 차이(DATEDIFF)를 계산해 원하는 행을 추립니다.', [
    ['find-el-in-dog', '이름에 el이 들어가는 강아지 찾기', 2, 59047, 'WHERE Dog + LOWER LIKE'],
    ['long-term-protected-animals-2', '오랜 기간 보호한 동물(2)', 3, 59411, 'JOIN + DATEDIFF 내림차순 LIMIT 2'],
  ]),
];

// 주소의 id로 찾는다. Map이라 'constructor' 같은 Object 속성 이름도 없는 문제로 나온다
const INDEX = new Map(CATEGORIES.flatMap((c) => c.problems.map((meta, index) => [meta.id, { category: c, meta, index }] as const)));
export function findProblem(id: string): { category: Category; meta: ProblemMeta; index: number } | null {
  return INDEX.get(id) ?? null;
}

// 제목, 유형 이름, 정석 풀이 이름에 검색어가 든 문제만 남긴다(대소문자, 띄어쓰기 무시). 남는 문제가 없는 유형은 뺀다
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');
export function searchCatalog(query: string): { category: Category; problems: ProblemMeta[] }[] {
  const q = norm(query);
  return CATEGORIES.map((c) => ({
    category: c,
    problems: c.problems.filter((p) => [p.title, c.name, p.bestName].some((s) => norm(s).includes(q))),
  })).filter((g) => g.problems.length > 0);
}
