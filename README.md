# AlgoMotion

프로그래머스 Lv 2~3 대표 문제의 풀이를 한 단계씩 움직이는 그림, 실행 중인 코드 줄, 변수 값으로 함께 보여 주는 학습 앱입니다.

| 문제 | 유형 | 시각화 |
| --- | --- | --- |
| [게임 맵 최단거리](https://school.programmers.co.kr/learn/courses/30/lessons/1844) (Lv 2) | BFS | 격자 위 큐와 거리, 최단 경로 |
| [입국심사](https://school.programmers.co.kr/learn/courses/30/lessons/43238) (Lv 3) | 이분 탐색 | 탐색 구간 수직선과 심사관별 처리 인원 |
| [기능개발](https://school.programmers.co.kr/learn/courses/30/lessons/42586) (Lv 2) | 스택/큐 | 기능 큐와 배포 묶음 |
| [정수 삼각형](https://school.programmers.co.kr/learn/courses/30/lessons/43105) (Lv 3) | DP | 아래에서 위로 쌓이는 삼각형 |

문제마다 정석·대안·함정 풀이 세 가지를 Python과 JavaScript 코드로 비교합니다.

## 실행

```bash
npm install
npm run dev
```

## 점검

```bash
npm run check
```

모든 단계의 코드 하이라이트 줄이 실제로 있는지, 시각화의 마지막 답이 예제 정답과 같은지, 각 풀이의 JavaScript 코드가 예제를 맞히는지 확인합니다.

## 문제 추가

`src/problems/index.ts`에 `Problem`을 하나 더 만들고 `generateSteps()`가 단계 배열을 돌려주면 화면이 자동으로 연결됩니다. 하이라이트 줄은 `at(code, '코드 일부')`로 지정하면 코드를 고쳐도 줄 번호가 어긋나지 않습니다.

## 디자인

모눈 연습장 위에 형광펜으로 알고리즘 상태를 칠하고(노랑: 지금, 파랑: 대기, 초록: 끝남, 분홍: 정답), 빨간펜 ○△✕로 풀이를 채점합니다. 색 토큰은 `src/styles/index.css` 맨 위에 있습니다.
