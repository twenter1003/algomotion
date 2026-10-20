import type { Problem } from '../engine/model.ts';
import { loaders as dfsBfs } from './dfs-bfs/index.ts';
import { loaders as bruteForce } from './brute-force/index.ts';
import { loaders as dp } from './dp/index.ts';
import { loaders as greedy } from './greedy/index.ts';
import { loaders as hash } from './hash/index.ts';
import { loaders as stackQueue } from './stack-queue/index.ts';
import { loaders as binarySearch } from './binary-search/index.ts';
import { loaders as sort } from './sort/index.ts';
import { loaders as heap } from './heap/index.ts';
import { loaders as graph } from './graph/index.ts';
import { loaders as twoPointer } from './two-pointer/index.ts';

// 문제 id → 문제 파일(목록의 유형 순서). 문제 파일은 열 때 불러와 첫 화면을 가볍게 둔다.
// 새 문제는 유형 폴더의 index.ts에만 등록하므로, 여러 작업자가 이 파일을 함께 고칠 일이 없다.
export const LOADERS: Record<string, () => Promise<Problem>> = {
  ...dfsBfs, ...bruteForce, ...dp, ...greedy, ...hash, ...stackQueue,
  ...binarySearch, ...sort, ...heap, ...graph, ...twoPointer,
};
