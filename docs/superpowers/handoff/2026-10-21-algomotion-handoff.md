# AlgoMotion 인수인계 (2026-10-21)

이 문서만 읽고 이어서 일할 수 있게 썼습니다. 이전 세션이 사용량 한도로 멈춘 시점의 상태입니다. 새 세션은 이 문서를 처음부터 끝까지 읽은 뒤 "5. 바로 할 일"부터 진행합니다.

## 1. 무엇을 만들고 있나

- **앱:** AlgoMotion (React 19 + TypeScript + Vite, 한국어 UI). 프로그래머스 Lv 2~3 코딩테스트 문제를 정석·대안·함정 세 풀이로, 단계마다 마디(꺼내기 → 살피기 → 넣기 같은)로 나눠 움직이는 그림 + 코드 줄 + 변수로 보여 준다.
- **목표:** 76문제를 출제 빈도 3단계·11유형(아주 자주 10문제씩: DFS/BFS·완전탐색·DP·그리디 / 자주 6문제씩: 해시·스택/큐·이분 탐색·정렬 / 가끔 4문제씩: 힙·그래프·투 포인터)으로 채운다.
- **사용자가 정한 것(바꾸지 말 것):** 움직임은 시안 ① 수정안(크게, 마디별로 차례로, 살필 때 스포트라이트, 화살표 + 판정 표시, 자잘한 효과 금지). 세 풀이는 탭이 기본, '나란히 비교' 버튼으로 경주. 문제 고르기는 홈 목록 + 문제 화면 옆 메뉴. 사용자는 속도를 가장 중시한다("빨리 만들래", "서브에이전트 돌려서 속도 좀 올리자"). 사용자는 원격(Remote Control)으로 보는 경우가 많아 localhost를 못 본다. 보여 줄 것은 비공개 claude.ai 페이지로 올린다.
- **기준 문서:**
  - 설계서(최상위 기준): `docs/superpowers/specs/2026-10-20-algomotion-problem-bank-design.md`
  - 1단계 계획(완료): `docs/superpowers/plans/2026-10-20-algomotion-phase1-engine-and-screens.md`
  - 남은 72문제 계획(진행 중): `docs/superpowers/plans/2026-10-21-algomotion-remaining-72-problems.md`
  - 문제 작성 지침(작업자에게 주는 공통 지침): `.superpowers/sdd/2026-10-21-algomotion-remaining-72-problems/W-brief.md`
  - 작업 기록(ledger, 결정 Ruling 포함):
    - `.superpowers/sdd/2026-10-20-algomotion-phase1-engine-and-screens/progress.md` (1단계, Ruling R1~R25)
    - `.superpowers/sdd/2026-10-21-algomotion-remaining-72-problems/progress.md` (남은 72문제, Ruling R26~R28)
  - 시안(비공개 페이지): 움직임 https://claude.ai/artifact/Rt5q5nUHAFYeT9vYPthbuh, 세 풀이 보기 https://claude.ai/artifact/27ebBS75QvLgPpqT1gDPNo, 문제 고르기 https://claude.ai/artifact/4Zywn4W3dPswo4JRHASK7P. 원본 HTML은 `.superpowers/brainstorm/26616-1792446844/content/`.
  - 사용자용 미리보기(비공개 페이지): https://claude.ai/artifact/E5JwbhZKFmLXzbWxiEEkNy (Task 10 시점 빌드, 다시 올려야 함 — 7장)

## 2. 저장소 상태

- git 저장소: `/Users/kimtaewoo/poker`. `main` = 처음 앱(4cfc229). 작업 브랜치 = **`phase1-engine`** (지금 9eced85). main에 합치는 것은 사용자에게 물어본 뒤에만.
- `phase1-engine`에 이미 들어간 것: 새 엔진(`src/engine/`: model, recorder, layout, lane, timeline, player, stage), 화면(홈, 옆 메뉴, 해시 주소, 봤음/이어 보기, 풀이 탭, 나란히 비교, 비교 막대, 코드 칸), 4문제(게임 맵 최단거리, 입국심사, 기능개발, 정수 삼각형), 점검(`npm run check` = `node --test 'tests/**/*.test.ts'`, 99개 통과: JS·Python 풀이, 무작위 입력 30개, 하이라이트, 장면 안/겹침, 목록 일치), 유형별 등록 파일(`src/problems/<유형>/index.ts`의 `loaders`, `registry.ts`가 모두 펼침), 남은 72문제 계획.
- `.claude/worktrees/`는 `.git/info/exclude`에 넣어 두었다(메인 체크아웃의 `git add -A`가 작업 공간을 잡지 않게).

### 작업 공간(git worktree) — 중단된 작업이 그대로 남아 있음

| 묶음 | 브랜치 / 경로 (`.claude/worktrees/` 아래) | 커밋된 문제 | 커밋 안 된 진행 중 파일 | 남은 문제(진행 중 포함) |
| --- | --- | --- | --- | --- |
| W1 dfs-bfs | `worktree-agent-a1e1023dd033aad70` | target-number(152d502), network(75d217b) | `src/problems/dfs-bfs/word-conversion.ts` | word-conversion, travel-route, item-pickup, island-trip, maze-escape, ricochet-robot, oil-drilling (7) |
| W2 brute-force | `worktree-agent-a1962af0b01877c59` | prime-finder(1e3faa0) | `src/problems/brute-force/carpet.ts`, `index.ts` 수정 | carpet, fatigue, split-power-grid, vowel-dictionary, n-queen, archery, emoticon-sale, maximize-expression, menu-renewal (9) |
| W3 dp | `worktree-agent-a6ae05cf201e9dcad` | way-to-school(13c5257) | `src/problems/dp/express-with-n.ts` | express-with-n, long-jump, tiling-2xn, land-grab, largest-square, coin-change, pulse-subarray, number-transform (8) |
| W4 greedy | `worktree-agent-a01e0c3798532685c` | joystick(e3b6826), make-big-number(261b306) | `src/problems/greedy/lifeboat.ts` (데모 `[60,40,90,50,60,40,80,50,60,40]`, limit 100) | lifeboat, speed-camera, base-station, tangerine, delivery-pickup, interception, number-game, magic-elevator (8) |
| 11b 화면 마무리 | `worktree-agent-a20d3f26176d7efca` (기준 3715088) | 4커밋 eac34bb..0793517 (옛 CSS 정리, 판 높이 다시 재기, 창 뒤 단축키, 옆 메뉴/서랍 상태, 오류 경계, 경주 판 쌓기·'끝!' 도장, 막대 색, README) | 없음 | 검토만 남음 (검토가 사용량 한도로 끊김) |

- 이미 합쳐서 지워도 되는 작업 공간: `worktree-agent-a02ba601126910c8e`(Task 10), `worktree-agent-a57c4993fe54fe7a0`(Task 11a).
- 아직 시작 안 한 묶음: W5 hash 6, W6 stack-queue 5, W7 binary-search 5, W8 sort 6, W9 heap 4, W10 graph 4, W11 two-pointer 4 (문제 id는 `src/catalog.ts`).
- 진행 중 문제 파일은 커밋되지 않았으므로, 이어받는 작업자는 그 파일을 끝까지 쓰거나(점검 통과 후 커밋) 버리고 새로 쓴다.

## 3. 일하는 방식 (지금까지 효과가 있던 것)

- superpowers:subagent-driven-development 방식. 컨트롤러(새 세션)는 직접 코드를 쓰지 않고 작업자 에이전트를 보내고, 끝나면 검토 에이전트를 보내고, 고칠 것이 있으면 같은 작업자에게 돌려보낸 뒤 범위를 좁힌 재검토를 한다. 모든 결정은 ledger에 `Ruling: 무엇 — 왜 — 틀리면 비용` 형식으로 적는다.
- **동시 실행:** 서로 다른 유형 폴더만 건드리는 작업자는 각자 git worktree에서 동시에 돌린다(Agent 도구 `isolation: "worktree"`, `run_in_background: true`). 사용량 한도 때문에 동시에 4개 안팎으로 유지한다. 모델: 문제 작업자 sonnet(R26), 검토자 sonnet, 마지막 전체 검토 opus.
- **작업자에게 주는 지시:** `W-brief.md`를 읽게 하고 유형 id, 남은 문제 목록, 보고서 경로를 준다. 이어받는 경우 "이 worktree에 이미 커밋된 문제는 건너뛰고, 커밋 안 된 진행 중 파일부터 이어서" 라고 쓴다. 기존 worktree를 이어 쓰게 하려면 새 에이전트를 isolation 없이 보내고 "작업 디렉터리는 `/Users/kimtaewoo/poker/.claude/worktrees/<이름>`, 그 안에서만 일하라"고 지시한다(같은 worktree를 두 에이전트가 동시에 쓰지 않게).
- **worktree 함정:**
  - worktree에는 node_modules가 없으므로 첫 단계에서 `ln -s /Users/kimtaewoo/poker/node_modules node_modules`.
  - worktree 작업자는 메인 체크아웃의 `.superpowers/...` 경로에 파일을 못 쓰는 경우가 많다(격리 가드). 보고서는 worktree 안 `.superpowers/`에 쓰게 하고, 컨트롤러가 메인 작업 기록 폴더로 복사한다.
  - 작업자의 커밋 메시지 끝 Co-Authored-By 줄은 그 작업자 하네스가 정한 것을 쓴다(R5).
- **검토 → 합치기:**
  - 묶음 하나가 끝나면 `bash <skill>/scripts/review-package <plan> <기준 커밋> <브랜치>`로 diff 파일을 만들고 검토자에게 준다. `<skill>` = `/Users/kimtaewoo/.claude/plugins/cache/claude-plugins-official/superpowers/7.0.0/skills/subagent-driven-development`.
  - 통과하면 `phase1-engine`에서 `git merge --no-ff <브랜치> -m "merge: … " + Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. 합친 뒤 `npm run check`, `npx tsc -b`를 돌린다. 유형 폴더끼리 겹치지 않으므로 충돌이 없어야 한다.
- **검토자가 꼭 보는 것:**
  - 그림·자막·하이라이트 줄·변수 칸이 매 단계 맞는지(변수는 단계가 끝났을 때 값).
  - 아무것도 실행하지 않는 마디는 실제로 도는 줄만 하이라이트하는지.
  - 원문과 맞는지(문제 정보 = `src/catalog.ts` 줄, 입출력 예는 원문 그대로).
  - 함정이 정말 드러나는지.
  - 우리말 조사(숫자 뒤만 `josa`/`ro`).
  - 속도(마디 0.5~1초, 살피기 ≤1.5초, 단계 2~3.5초, 자막은 글자당 20ms 이상).
  - 글자가 칸을 넘지 않는지.
  - `line` 물체의 rect가 장면 전체(FULL)인지(R28. 아니면 선이 안 보임).

## 4. 미뤄 둔 작은 지적 (마지막 전체 검토에서 처리 여부를 정한다)

- 두 ledger의 `minor (deferred)` / `minor (carried …)` 줄이 전부다. 대표적으로:
  - 경주 판이 넓은 장면(기능개발 670px 등)에서 0.3배로 작아짐 → 장면 폭에 따라 쌓기 기준을 정하기(11b 보고 걱정 1).
  - 함정 '빨리 감기' 단계 체류 시간.
  - 다익스트라 외 몇 문제의 자잘한 문구.
  - 테스트 실패 메시지에 마디/단계 번호 추가.
  - 장면 점검은 끝난 장면만 봄.
- 11b가 고친 것(판 높이 다시 재기, 창 뒤 단축키, 옆 메뉴 다시 펼치기, 서랍 상태, 오류 경계, 검색 결과 알림, 막대 색, 경주 '끝!' 도장, README)은 합친 뒤 브라우저에서 한 번 확인한다(특히 판 높이 다시 재기).

## 5. 바로 할 일 (순서대로)

1. **11b 검토:** `review-package` 기준 3715088, 브랜치 `worktree-agent-a20d3f26176d7efca`. 보고서: `.superpowers/sdd/2026-10-20-algomotion-phase1-engine-and-screens/task-11b-report.txt`. 지시 범위(A 옛 CSS 정리, B 반응형, C 작은 고침 7개, D README)는 그 보고서와 1단계 ledger의 Task 10 minor 줄(M1~M9)에 있다. 통과하면 phase1-engine에 합친다(겹치는 파일 없음: P0는 registry/tests/문제 폴더, 11b는 components/styles/README/public). 경주 판 크기 걱정은 여기서 Ruling으로 정한다(추천: 셋을 나란히 놓으면 판 배율이 0.5보다 작아질 때 위아래로 쌓기).
2. **W1~W4 이어서:** 새 작업자 4개를 각 worktree에서 이어 쓰게 보낸다(2장 표의 '남은 문제'). 유형별 메모:
   - W1: 그래프는 cell(점) + line(선). 아이템 줍기는 좌표 두 배 격자.
   - W2: 결정/재귀 나무는 cell + line. 가지치기는 bad 판정 화살표. N-Queen은 n=4.
   - W3: 1차원 DP는 cell 한 줄, 2차원은 grid. 나머지 연산(1234567, 1,000,000,007)은 코드와 점검에 유지.
   - W4: 구간은 axis 위 zone/bar. 정렬된 줄은 cell이나 Lane. 큰 수 만들기는 스택 Lane.
3. **묶음이 끝나는 대로** 검토 → 고침 → 합치기. 하나가 끝날 때마다 W5부터 차례로 새 작업자를 isolation worktree로 보낸다(기준은 그때의 phase1-engine 최신 커밋). W5~W11 메모: 해시는 키 → 값 표, 힙은 Lane(정렬된 줄)이나 나무, 그래프는 cell + line + 가중치 text, 투 포인터는 cell 줄 + 포인터 ring.
4. **모두 합친 뒤:**
   - 미뤄 둔 지적을 정리하는 작업자 1회.
   - opus로 전체 브랜치 검토(diff 기준 `git merge-base main phase1-engine`, 두 ledger의 deferred 목록을 같이 줌). 고칠 것은 작업자 한 명에게 한 번에.
5. **미리보기 다시 올리기:** 7장.
6. **마무리:** superpowers:finishing-a-development-branch. phase1-engine을 main에 합칠지 사용자에게 묻는다. 두 ledger의 Ruling 목록을 사용자에게 보여 준다.

## 6. 점검 명령

```bash
npm run check
```

```bash
npx tsc -b
```

```bash
npx oxlint
```

```bash
npm run build
```

개발 서버는 `.claude/launch.json`의 `algomotion`(preview_start).

## 7. 미리보기 다시 올리는 법 (같은 링크 유지)

1. `npm run build` (vite `base: './'`가 이미 설정돼 있어 dist의 경로가 상대 경로).
2. 올릴 페이지 파일을 만든다(scratchpad 안). `dist/index.html`에서 doctype/html/head/body 태그를 걷어 내고 아래만 남긴다.
   - `<title>AlgoMotion 미리보기</title>`, description meta, 폰트 link, 아이콘 link
   - `<link rel="stylesheet" crossorigin href="./assets/index-*.css">`
   - `<div id="root"></div>`
   - `<script type="module" crossorigin src="./assets/index-*.js"></script>`
3. Artifact 도구로 올린다.
   - 다른 대화에서 같은 페이지를 고치는 것이므로 먼저 `action: "read"`, `url: https://claude.ai/artifact/E5JwbhZKFmLXzbWxiEEkNy`로 읽는다.
   - 그다음 `url`을 넣고 publish한다. `files`에는 `dist/assets/*` 전부(js 조각마다 하나, css)를 `assets/<파일명>` 경로로 넣는다.
   - 올린 페이지는 컨트롤러의 내장 브라우저로는 claude.ai 로그인이 없어 확인할 수 없다. 사용자에게 빈 화면이면 알려 달라고 한다.

## 8. 사용자 쪽 메모

- 한국어로 짧게, 결과 위주로 보고한다. 사용자는 "ㄱㄱ"처럼 짧게 승인하는 편이다.
- 사용량 한도에 자주 걸린다. 걸리면 진행 상황을 ledger에 적어 두고 멈춘다. 한도가 풀리면 중단된 작업 공간부터 이어서 한다.
