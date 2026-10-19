export type Language = 'python' | 'javascript';

export type ApproachRank = 'BEST' | 'ALTERNATIVE' | 'TRAP';

export type Cell = [number, number];

export interface GridData {
  grid: number[][];
  dist: number[][];
  current: Cell | null;
  queue: Cell[];
  added: Cell[];
  path: Cell[];
}

export interface ParametricData {
  left: number;
  right: number;
  mid: number | null;
  n: number;
  times: number[];
  counts: number[];
  total: number | null;
  answer: number | null;
  maxTime: number;
  phase: 'init' | 'check' | 'pass' | 'fail' | 'done';
}

export interface FeatureState {
  name: string;
  progress: number;
  speed: number;
  days: number;
  progressNow: number;
  status: 'waiting' | 'bundled' | 'deployed';
}

export interface QueueData {
  day: number;
  deployDay: number | null;
  features: FeatureState[];
  focus: number | null;
  log: { day: number; count: number }[];
}

export interface DpData {
  triangle: number[][];
  dp: number[][];
  active: Cell | null;
  children: Cell[];
  chosen: Cell | null;
  path: Cell[];
}

export type VisualState = { actionLabel?: string } & (
  | { type: 'grid'; data: GridData }
  | { type: 'parametric'; data: ParametricData }
  | { type: 'queue'; data: QueueData }
  | { type: 'dp-pyramid'; data: DpData }
);

export interface AlgorithmStep {
  title: string;
  narration: string;
  visualState: VisualState;
  codeHighlights: Record<Language, number[]>;
  variables: Record<string, string | number>;
  isKeyframe?: boolean;
}

export interface ProblemApproach {
  id: string;
  name: string;
  rank: ApproachRank;
  timeComplexity: string;
  spaceComplexity: string;
  verdict: string;
  pros: string[];
  cons: string[];
  whyThisRank: string;
  code: Record<Language, string>;
}

export interface Problem {
  id: string;
  title: string;
  level: 2 | 3;
  category: string;
  sourceUrl: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: {
    summary: string;
    rules: string[];
    examples: { input: string; output: string }[];
  };
  keyIntuitions: string[];
  approaches: ProblemApproach[];
  code: Record<Language, string>;
  generateSteps: () => AlgorithmStep[];
}
