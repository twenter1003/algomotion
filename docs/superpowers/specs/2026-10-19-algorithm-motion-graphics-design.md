# 알고리즘 모션 그래픽 학습 플랫폼 설계서 (AlgoMotion)

## 1. 개요 및 목적
- **목적**: 프로그래머스 레벨 2~3 수준의 핵심 코딩테스트 문제와 알고리즘 풀이를 누구나 쉽게 이해할 수 있도록, 브라우저 기반 고화질 모션 그래픽과 시각화 애니메이션으로 설명하는 전문 인터랙티브 학습 플랫폼.
- **핵심 가치**:
  - 지루한 줄글이나 정적인 코드 대신, 데이터의 흐름과 알고리즘의 동작 원리를 생생한 모션 그래픽과 자막으로 전달.
  - 별도 비디오 인코딩 파일 의존 없이 웹 기술(Canvas/SVG/WAAPI)로 직접 구동되는 60fps 고화질 인터랙티브 모션 플레이어.
  - Python과 JavaScript의 실제 코딩테스트 풀이 코드와 실시간 라인 동기화.

---

## 2. 화면 구성 및 사용자 경험 (UX)
### 3단 스플릿 대시보드 레이아웃
1. **좌측 패널 (Problem & Concept Insight)**:
   - 문제 제목, 프로그래머스 난이도 뱃지 (Lv 2, Lv 3), 알고리즘 태그 (BFS, 이진탐색, DP, 스택/큐).
   - 문제 요약, 제한사항, 입출력 예시.
   - **"핵심 발상 & 모션 가이드"**: 복잡한 수식을 배제하고 그림과 직관으로 알고리즘의 핵심 아이디어를 3줄 요약.
2. **중앙 패널 (Interactive Motion Graphic Canvas & Player)**:
   - **대형 모션 그래픽 뷰포트**: 
     - 2D 그리드, 그래프 노드/엣지, 배열 포인터, 스택/큐 컨테이너 등 유형별 벡터 그래픽 렌더링.
     - 활성 노드 발광(Glow), 포인터 슬라이딩(Tweening), 최단 경로 물결(Ripple) 애니메이션.
   - **자막 & 나레이션 바 (Subtitle Bar)**:
     - 현재 스텝에서 무슨 일이 일어나고 있는지 왜 그렇게 하는지 친절한 설명 텍스트 실시간 노출.
   - **영상 플레이어 컨트롤러 (Player Controls)**:
     - 재생 / 일시정지 (스페이스바 단축키 지원)
     - 타임라인 스크러버 (프로그레스 바 드래그 및 클릭으로 원하는 스텝 점프)
     - 이전 스텝 / 다음 스텝 버튼
     - 배속 조절 (0.5x, 1.0x, 1.5x, 2.0x, 3.0x)
     - 처음으로 리셋
3. **우측 패널 (Code Synchronization & State Inspector)**:
   - **언어 선택 탭**: `Python 3` / `JavaScript (Node.js)` 즉각 전환.
   - **코드 뷰어**: 구문 강조(Syntax Highlighting) 및 현재 스텝에 해당하는 코드 라인 실시간 펄스 하이라이트.
   - **메모리 & 변수 상태창 (State Inspector)**:
     - 현재 활성화된 변수값 (`queue`, `visited`, `left/right/mid`, `dp table` 등) 실시간 수치 표기.
     - 시간 복잡도(Time Complexity) 및 공간 복잡도(Space Complexity) 요약 카드.

---

## 3. 기술 아키텍처 및 모션 엔진 설계

### 3.1 기술 스택
- **프론트엔드**: React 18, TypeScript, Vite
- **디자인/스타일링**: Vanilla CSS, Modern CSS Tokens, Lucide React Icons
- **모션 & 렌더링**: Canvas 2D API + SVG Vector + CSS Keyframes / Web Animations
- **코드 뷰어**: PrismJS 기반 커스텀 하이라이터

### 3.2 핵심 데이터 모델 (`AlgorithmStep`)
```typescript
export type VisualizerType = 'grid' | 'array-pointer' | 'stack-queue' | 'dp-pyramid';

export interface AlgorithmStep {
  stepIndex: number;
  title: string;
  narration: string;
  visualState: {
    type: VisualizerType;
    data: any;
    focusElements?: string[];
  };
  codeHighlights: {
    python: number[];
    javascript: number[];
  };
  variables: Record<string, string | number | boolean | any[]>;
}
```

### 3.3 초기 런칭 프로그래머스 Lv 2~3 대표 4대 문제
1. **[Lv 2] 게임 맵 최단거리 (BFS)**:
   - 2D 그리드 미로에서 (0,0)에서 상대 팀 진영(n, m)까지의 최단거리 탐색.
   - 큐에 좌표가 들어가고 나오는 과정, 상하좌우 탐색, 거리값 갱신, 최종 최단경로 골드 발광 연출.
2. **[Lv 3] 입국심사 (이진 탐색 / Parametric Search)**:
   - n명을 심사하는 데 걸리는 최소 시간을 구하는 이분탐색 알고리즘.
   - `left`, `right`, `mid` 시간 축과, 해당 `mid` 시간 동안 각 심사관이 처리할 수 있는 인원수의 총합 계산 과정을 직관적 게이지 바로 시각화.
3. **[Lv 2] 기능개발 (스택 / 큐)**:
   - 각 기능의 진도와 개발 속도에 따라 작업이 완료되는 일수를 계산하고, 앞의 기능이 배포될 때 함께 배포되는 큐의 동작을 컨베이어 벨트 모션으로 표현.
4. **[Lv 3] 정수 삼각형 (동적계획법 DP)**:
   - 피라미드 형태의 삼각형을 위에서 아래로 내려오며 최댓값을 찾는 누적 합 과정.
   - 위층에서 아래층으로 값이 흘러내리는 캐스케이딩 애니메이션과 DP 테이블 갱신 모션.

---

## 4. 확장성 및 검증 전략
- **문제 확장성**: 새 문제를 추가할 때 `src/problems/` 디렉토리에 문제 명세와 `generateSteps()` 함수만 작성하면 3단 대시보드와 모션 플레이어가 자동 연동.
- **반응형 대응**: 대형 모니터, 노트북, 태블릿 화면 크기에 맞춰 패널 비율 자동 조정 및 스크롤 영역 격리.
- **성능 최적화**: 60fps 유지를 위해 불필요한 전체 리렌더링을 차단하고, 캔버스/SVG 요소를 가상 돔과 효율적으로 바인딩.
