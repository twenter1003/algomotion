// 장면, 동작, 단계, 풀이, 문제, 유형 타입. 이후 모든 작업이 기대는 계약이다.
export type Language = 'python' | 'javascript';
export type Rank = 'BEST' | 'ALTERNATIVE' | 'TRAP';
export type Point = [number, number];
export interface Rect { x: number; y: number; w: number; h: number }
export type Tone = 'plain' | 'wall' | 'current' | 'queued' | 'visited' | 'path' | 'trail'
  | 'explored' | 'chosen' | 'good' | 'bad' | 'muted';
export type ItemKind = 'cell' | 'token' | 'text' | 'bar' | 'zone' | 'ring' | 'line';
export interface Item {
  id: string; kind: ItemKind; rect: Rect;   // line은 rect 대신 points로 그린다
  tone?: Tone; text?: string; sub?: string; tag?: string;
  fill?: number;                            // bar: 0~1
  points?: Point[];                         // line
}
export type ItemPatch = Partial<Omit<Item, 'id' | 'kind'>>;
export interface Scene { width: number; height: number; items: Item[] }
export type Verdict = 'new' | 'seen' | 'wall' | 'good' | 'bad';
export type Action = (
  | { type: 'focus'; ids: string[] }                    // 이 물체들만 밝게, 나머지 흐리게
  | { type: 'unfocus' }
  | { type: 'set'; id: string; patch: ItemPatch; pop?: boolean } // rect가 바뀌면 미끄러지고, pop이면 글씨가 톡 튐
  | { type: 'add'; item: Item; from?: string }          // from 물체 자리에서 날아와 제자리에
  | { type: 'remove'; id: string; into?: string }       // into 물체 쪽으로 날아가 사라짐
  | { type: 'arrow'; from: string; to: string; verdict: Verdict; label: string } // 화살표 + to 위에 판정 표시
  | { type: 'clearMarks' }                              // 화살표와 판정 표시 지우기
  | { type: 'trace'; id: string; points: Point[] }      // line 물체를 처음부터 끝까지 그어 나감
  | { type: 'wait'; ms: number }
) & { together?: boolean };                             // 바로 앞 동작과 동시에 시작
export interface Phase { label: string; caption: string; actions: Action[]; codeHighlights?: Record<Language, number[]> }
export interface AlgorithmStep {
  title: string; phases: Phase[]; scene: Scene;
  codeHighlights: Record<Language, number[]>; variables: Record<string, string | number>;
  work: number; workNote?: string; answer?: unknown; isKeyframe?: boolean;
}
export interface Visualization { initial: Scene; steps: AlgorithmStep[] }
export interface Approach {
  id: string; name: string; rank: Rank; trap?: 'wrong' | 'slow';   // rank가 TRAP이면 trap 필수
  timeComplexity: string; spaceComplexity: string;
  verdict: string; pros: string[]; cons: string[]; whyThisRank: string;
  code: Record<Language, string>;
  visualize: () => Visualization;                                  // 문제의 demo.input으로 돌린다
}
export type CategoryId = 'dfs-bfs' | 'brute-force' | 'dp' | 'greedy' | 'hash' | 'stack-queue'
  | 'binary-search' | 'sort' | 'heap' | 'graph' | 'two-pointer';
export interface Problem {
  id: string; title: string; level: 2 | 3; category: CategoryId; sourceUrl: string;
  description: { summary: string; rules: string[]; examples: { input: string; output: string }[] };
  keyIntuitions: string[];
  demo: { input: unknown[]; label: string };
  workUnit: string;
  approaches: [Approach, Approach, Approach];                       // BEST, ALTERNATIVE, TRAP 순서
  checks: { cases: { args: unknown[]; expected: unknown }[]; random: (rand: () => number) => unknown[] };
}
export interface ProblemMeta { id: string; title: string; level: 2 | 3; sourceUrl: string; bestName: string; load?: () => Promise<Problem> }
export interface Category { id: CategoryId; name: string; tier: 1 | 2 | 3; idea: string; problems: ProblemMeta[] }
