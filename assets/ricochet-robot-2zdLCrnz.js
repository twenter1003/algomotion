import{i as e,r as t}from"./layout-DFaYBMY_.js";import{c as n,i as r,n as i,r as a,s as o}from"./shared-e6uNbDLo.js";import{t as s}from"./lane-BzDhdR3X.js";import{t as c}from"./pacing-cs_sia8j.js";var l=[`...D..R`,`.D.G...`,`....D.D`,`D....D.`,`..D....`],u=l.length,d=l[0].length,f=[[-1,0],[1,0],[0,-1],[0,1]],p=([e,t])=>`${e},${t}`,m=(e,t)=>e[0]===t[0]&&e[1]===t[1],h=([e,t])=>e>=0&&e<u&&t>=0&&t<d,g=e=>h(e)&&l[e[0]][e[1]]!==`D`,_=e=>`cell:${p(e)}`,v=e=>{let t=l.findIndex(t=>t.includes(e));return[t,l[t].indexOf(e)]},[y,b]=[v(`R`),v(`G`)],x=(e,[t,n])=>{let r=e;for(;g([r[0]+t,r[1]+n]);)r=[r[0]+t,r[1]+n];return r},{TRUTH:S,MAX_QUEUE:C}=(()=>{let e=new Map([[p(y),0]]),t=[y],n=1;for(let r=0;r<t.length;r++){let i=t[r];if(m(i,b))return{TRUTH:e.get(p(i)),MAX_QUEUE:n};for(let n of f){let r=x(i,n);e.has(p(r))||(e.set(p(r),e.get(p(i))+1),t.push(r))}n=Math.max(n,t.length-r-1)}return{TRUTH:-1,MAX_QUEUE:n}})(),w=`    n, m = len(board), len(board[0])
    for i in range(n):
        for j in range(m):
            if board[i][j] == 'R':
                start = (i, j)
            elif board[i][j] == 'G':
                goal = (i, j)
`,T=`  const n = board.length;
  const m = board[0].length;
  let start, goal;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (board[i][j] === 'R') start = [i, j];
      else if (board[i][j] === 'G') goal = [i, j];
    }
  }
`,E=`    def slide(x, y, dx, dy):  # 벽이나 장애물 바로 앞까지 미끄러집니다
        while 0 <= x + dx < n and 0 <= y + dy < m and board[x + dx][y + dy] != 'D':
            x, y = x + dx, y + dy
        return x, y
`,D=`  const slide = (x, y, dx, dy) => { // 벽이나 장애물 바로 앞까지 미끄러집니다
    while (x + dx >= 0 && x + dx < n && y + dy >= 0 && y + dy < m && board[x + dx][y + dy] !== 'D') {
      x += dx;
      y += dy;
    }
    return [x, y];
  };
`,O={python:`from collections import deque

def solution(board):
${w}
${E}
    dist = {start: 0}
    queue = deque([start])
    while queue:
        x, y = queue.popleft()
        if (x, y) == goal:
            return dist[(x, y)]  # 목표에서 멈춘 순간의 미끄러진 횟수
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
            nx, ny = slide(x, y, dx, dy)
            if (nx, ny) not in dist:
                dist[(nx, ny)] = dist[(x, y)] + 1
                queue.append((nx, ny))
    return -1`,javascript:`function solution(board) {
${T}
${D}
  const dist = Array.from({ length: n }, () => Array(m).fill(-1));
  dist[start[0]][start[1]] = 0;
  const queue = [start];
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x === goal[0] && y === goal[1]) return dist[x][y]; // 목표에서 멈춘 순간의 미끄러진 횟수
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
      const [nx, ny] = slide(x, y, dx, dy);
      if (dist[nx][ny] === -1) {
        dist[nx][ny] = dist[x][y] + 1;
        queue.push([nx, ny]);
      }
    }
  }
  return -1;
}`},k={find:r(O,[`if board[i][j] == 'R'`,`elif board[i][j] == 'G'`],[`if (board[i][j] === 'R')`,`else if (board[i][j] === 'G')`]),start:r(O,[`dist = {start: 0}`,`queue = deque([start])`],[`dist[start[0]][start[1]] = 0`,`const queue = [start]`]),pop:r(O,[`x, y = queue.popleft()`],[`const [x, y] = queue[head++]`]),look:r(O,[`for dx, dy in`,`nx, ny = slide(x, y, dx, dy)`,`if (nx, ny) not in dist`],[`for (const [dx, dy] of`,`const [nx, ny] = slide(x, y, dx, dy)`,`if (dist[nx][ny] === -1)`]),mark:r(O,[`for dx, dy in`,`nx, ny = slide(x, y, dx, dy)`,`dist[(nx, ny)] = dist[(x, y)] + 1`],[`for (const [dx, dy] of`,`const [nx, ny] = slide(x, y, dx, dy)`,`dist[nx][ny] = dist[x][y] + 1`]),push:r(O,[`queue.append((nx, ny))`],[`queue.push([nx, ny])`]),next:r(O,[`while queue:`],[`while (head < queue.length)`]),goal:r(O,[`if (x, y) == goal`,`return dist[(x, y)]`],[`if (x === goal[0] && y === goal[1])`])},A={python:`import heapq

def solution(board):
${w}
${E}
    dist = {start: 0}
    heap = [(0, start[0], start[1])]  # (비용, x, y)
    while heap:
        cost, x, y = heapq.heappop(heap)
        if cost > dist[(x, y)]:
            continue  # 이미 더 짧게 온 적이 있는 칸
        if (x, y) == goal:
            return cost
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
            nx, ny = slide(x, y, dx, dy)
            if cost + 1 < dist.get((nx, ny), float('inf')):
                dist[(nx, ny)] = cost + 1
                heapq.heappush(heap, (cost + 1, nx, ny))
    return -1`,javascript:`function solution(board) {
${T}
${D}
  const dist = Array.from({ length: n }, () => Array(m).fill(Infinity));
  dist[start[0]][start[1]] = 0;
  const pq = [[0, start[0], start[1]]]; // [비용, x, y]를 담는 최소 힙

  // [비용, x, y]를 앞에서부터 비교합니다(Python의 튜플 비교와 같은 순서)
  const less = (a, b) => (a[0] - b[0] || a[1] - b[1] || a[2] - b[2]) < 0;
  const push = (item) => {
    pq.push(item);
    for (let i = pq.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (!less(pq[i], pq[p])) break;
      [pq[p], pq[i]] = [pq[i], pq[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = pq[0];
    const last = pq.pop();
    if (pq.length > 0) {
      pq[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1;
        const r = l + 1;
        let min = i;
        if (l < pq.length && less(pq[l], pq[min])) min = l;
        if (r < pq.length && less(pq[r], pq[min])) min = r;
        if (min === i) break;
        [pq[min], pq[i]] = [pq[i], pq[min]];
        i = min;
      }
    }
    return top;
  };

  while (pq.length > 0) {
    const [cost, x, y] = pop();
    if (cost > dist[x][y]) continue; // 이미 더 짧게 온 적이 있는 칸
    if (x === goal[0] && y === goal[1]) return cost;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
      const [nx, ny] = slide(x, y, dx, dy);
      if (cost + 1 < dist[nx][ny]) {
        dist[nx][ny] = cost + 1;
        push([cost + 1, nx, ny]);
      }
    }
  }
  return -1;
}`},j={start:r(A,[`dist = {start: 0}`,`heap = [(0, start[0], start[1])]`],[`dist[start[0]][start[1]] = 0`,`const pq = [[0, start[0], start[1]]]`]),pop:r(A,[`cost, x, y = heapq.heappop(heap)`],[`const [cost, x, y] = pop()`]),look:r(A,[`for dx, dy in`,`nx, ny = slide(x, y, dx, dy)`,`if cost + 1 < dist.get((nx, ny)`],[`for (const [dx, dy] of`,`const [nx, ny] = slide(x, y, dx, dy)`,`if (cost + 1 < dist[nx][ny])`]),mark:r(A,[`for dx, dy in`,`nx, ny = slide(x, y, dx, dy)`,`dist[(nx, ny)] = cost + 1`],[`for (const [dx, dy] of`,`const [nx, ny] = slide(x, y, dx, dy)`,`dist[nx][ny] = cost + 1`]),push:r(A,[`heapq.heappush(heap, (cost + 1, nx, ny))`],[`push([cost + 1, nx, ny])`,`for (let i = pq.length - 1; i > 0; )`]),next:r(A,[`while heap:`],[`while (pq.length > 0)`]),goal:r(A,[`if (x, y) == goal`,`return cost`],[`if (x === goal[0] && y === goal[1]) return cost`])},M={python:`# 주의: 오답이 나오는 풀이입니다 (미끄러지지 않고 한 칸씩 걷는다고 생각합니다)
from collections import deque

def solution(board):
${w}
    dist = {start: 0}
    queue = deque([start])
    while queue:
        x, y = queue.popleft()
        if (x, y) == goal:
            return dist[(x, y)]
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy  # 한 칸만 움직입니다
            if 0 <= nx < n and 0 <= ny < m and board[nx][ny] != 'D' and (nx, ny) not in dist:
                dist[(nx, ny)] = dist[(x, y)] + 1
                queue.append((nx, ny))
    return -1`,javascript:`// 주의: 오답이 나오는 풀이입니다 (미끄러지지 않고 한 칸씩 걷는다고 생각합니다)
function solution(board) {
${T}
  const dist = Array.from({ length: n }, () => Array(m).fill(-1));
  dist[start[0]][start[1]] = 0;
  const queue = [start];
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x === goal[0] && y === goal[1]) return dist[x][y];
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
      const nx = x + dx; // 한 칸만 움직입니다
      const ny = y + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < m && board[nx][ny] !== 'D' && dist[nx][ny] === -1) {
        dist[nx][ny] = dist[x][y] + 1;
        queue.push([nx, ny]);
      }
    }
  }
  return -1;
}`},N={start:r(M,[`dist = {start: 0}`,`queue = deque([start])`],[`dist[start[0]][start[1]] = 0`,`const queue = [start]`]),pop:r(M,[`x, y = queue.popleft()`],[`const [x, y] = queue[head++]`]),look:r(M,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m and board[nx][ny] != 'D'`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m && board[nx][ny] !== 'D'`]),mark:r(M,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m and board[nx][ny] != 'D'`,`dist[(nx, ny)] = dist[(x, y)] + 1`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m && board[nx][ny] !== 'D'`,`dist[nx][ny] = dist[x][y] + 1`]),push:r(M,[`queue.append((nx, ny))`],[`queue.push([nx, ny])`]),next:r(M,[`while queue:`],[`while (head < queue.length)`]),goal:r(M,[`if (x, y) == goal`,`return dist[(x, y)]`],[`if (x === goal[0] && y === goal[1]) return dist[x][y]`])},P=454,F=e({x:14,y:58,rows:u,cols:d,cell:54,gap:8}),I=e=>F(e[0],e[1]),L=e=>t(I(e)),R={id:`lane`,x:40,y:5,slotW:56,slotH:30,gap:6,max:Math.max(6,C)},z={R:`로봇`,G:`목표`},B={wall:`장애물`,seen:`방문함`,new:`새 칸`};function V(e,t){let n=t?410:372,r={x:0,y:0,w:P,h:n},i=[{id:`lane:label`,kind:`text`,rect:{x:0,y:0,w:34,h:40},text:e},{id:`lane:bg`,kind:`zone`,rect:{x:34,y:0,w:420,h:40}}];return l.forEach((e,t)=>[...e].forEach((e,n)=>{i.push({id:_([t,n]),kind:`cell`,rect:I([t,n]),tone:e===`D`?`wall`:`plain`,...z[e]?{tag:z[e]}:{}})})),i.push({id:`path`,kind:`line`,rect:r,tone:`path`,points:[]}),{width:P,height:n,items:i}}var H=(e,t)=>({type:`set`,id:_(e),patch:t}),U=e=>({id:`tok:${p(e)}`,text:i(e)});function W(e){let t=e===`heap`,r=e===`plain`,l=r?N:t?{...j}:k,u=new n(V(t?`힙`:`큐`,r)),d=new s(u,R),v=new Map([[p(y),0]]),C=new Map,w=[y],T=0,E=1,D,O=e=>v.get(p(e)),A=t?`cost`:`dist`,M=(e,n=[])=>({work:T,...t?{workNote:`힙 정렬 ${E}번`}:{},variables:{"(x, y)":e?i(e):`-`,[A]:e?O(e):`-`,"새로 넣은 칸":n.length?n.map(i).join(`, `):`없음`,[t?`heap`:`queue`]:`[${w.map(e=>t?`(${O(e)}, ${e[0]}, ${e[1]})`:i(e)).join(`, `)}]`}}),P=e=>{d.shift(_(e)),u.do(...o([H(e,{tone:`current`}),...D?[H(D,{tone:`visited`})]:[]],!0))};for(u.step({title:`로봇 ${i(y)}을 ${t?`힙`:`큐`}에 넣기`,codeHighlights:l.start,...M(void 0,[y])}),u.phase(`시작`,`로봇이 있는 ${i(y)}에 ${t?`비용`:`거리`} 0을 적고 ${t?`힙`:`큐`}에 넣습니다.`),u.do({...H(y,{tone:`queued`,text:`0`}),pop:!0}),d.push(U(y),_(y));w.length;){let e=w.shift();if(T++,t&&E++,m(e,b)){let n=[e];for(let t=C.get(p(e));t;t=C.get(p(t)))n.unshift(t);u.step({title:`목표 칸 ${i(e)} 꺼내기 — ${r?`거리`:`미끄러진 횟수`} ${O(e)}`,codeHighlights:l.goal,...M(e),answer:O(e),isKeyframe:!0}),u.phase(`꺼내기`,`${t?`힙에서 비용이 가장 작은`:`큐 맨 앞에서`} 목표 칸 ${a(i(e),`을`,`를`)} 꺼냈습니다.`,l.pop),P(e),r?(u.phase(`오답 확인`,`한 칸씩 걸어 목표 칸을 지나가기만 해도 도착으로 쳐서 ${a(O(e),`이`,`가`)} 나왔습니다. 로봇은 미끄러져 멈추는 칸만 갈 수 있어서 정답은 ${S}입니다.`),u.do(...o([...n.map(e=>H(e,{tone:`bad`})),{type:`trace`,id:`path`,points:n.map(L)},{type:`add`,item:{id:`mine`,kind:`token`,rect:{x:0,y:372,w:110,h:30},tone:`bad`,text:`내 답 ${O(e)}`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:118,y:372,w:110,h:30},tone:`good`,text:`정답 ${S}`}}]))):(u.phase(`도착`,`목표 칸에서 멈춘 순간의 ${t?`비용`:`횟수`} ${a(O(e),`이`,`가`)} 최소 미끄러진 횟수입니다. 멈춘 칸을 ${T}번 꺼냈습니다.`),u.do(...o(n.map(e=>H(e,{tone:`path`})))),u.do({type:`trace`,id:`path`,points:n.map(L)}));break}let n=f.flatMap(t=>{let n=r?[e[0]+t[0],e[1]+t[1]]:x(e,t);return(r?!h(n):m(n,e))?[]:[{to:n,verdict:r&&!g(n)?`wall`:v.has(p(n))?`seen`:`new`}]}),s=n.filter(e=>e.verdict===`new`).map(e=>e.to);for(let t of s)v.set(p(t),O(e)+1),C.set(p(t),e),w.push(t);t&&(E+=s.length,w.sort((e,t)=>O(e)-O(t)||e[0]-t[0]||e[1]-t[1])),u.step({title:s.length?`${i(e)} 꺼내고 ${s.length}칸 넣기`:`${i(e)} 꺼내기 — 넣을 칸 없음`,codeHighlights:s.length?l.push:l.next,...M(e,s)}),u.phase(`꺼내기`,`${t?`힙에서 비용이 가장 작은`:`큐 맨 앞에서`} ${a(i(e),`을`,`를`)} 꺼냅니다. ${r?`이 칸까지의 거리는`:t?`이 칸까지의 비용은`:`이 칸까지 미끄러진 횟수는`} ${O(e)}입니다.`,l.pop),P(e),u.phase(r?`살피기`:`미끄러지기`,r?`상하좌우 한 칸씩 확인합니다. 장애물이나 이미 방문한 칸은 건너뛰고${s.length?`, 새 칸에는 거리 ${a(O(e)+1,`을`,`를`)} 적습니다.`:` 넘어갑니다.`}`:`상하좌우로 미끄러져 멈추는 칸을 봅니다. 못 움직이거나 이미 방문한 칸은 건너뛰고${s.length?`, 새로 멈춘 칸에는 ${t?`비용`:`횟수`} ${a(O(e)+1,`을`,`를`)} 적습니다.`:` 넘어갑니다.`}`,s.length?l.mark:l.look),u.do({type:`focus`,ids:[_(e),...n.map(e=>_(e.to))]});for(let t of n)u.do({type:`arrow`,from:_(e),to:_(t.to),verdict:t.verdict,label:B[t.verdict]}),t.verdict===`new`&&u.do({...H(t.to,{tone:`queued`,text:String(O(t.to))}),pop:!0,together:!0});u.phase(t?`넣고 정렬`:`넣기`,s.length?`새로 찾은 ${a(s.map(i).join(`, `),`을`,`를`)} ${t?`힙에 넣고 비용순으로 정렬합니다. 순서는 큐와 같습니다.`:`큐 뒤에 넣습니다.`}`:`새로 넣을 칸이 없어 그대로 넘어갑니다.`,s.length?l.push:l.next);let c=[{type:`unfocus`},{type:`clearMarks`}];s.length?s.forEach((e,t)=>{d.push(U(e),_(e)),t||u.do(...o(c,!0))}):u.do(...o(c)),t&&s.length&&d.reorder(w.map(e=>U(e).id)),D=e}return c(u.finish())}var G={id:`ricochet-robot`,title:`리코쳇 로봇`,level:2,category:`dfs-bfs`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/169199`,description:{summary:`격자판에 빈칸(.), 장애물(D), 로봇(R), 목표(G)가 있습니다. 로봇은 상하좌우 중 한 방향을 골라 장애물이나 판의 끝에 부딪힐 때까지 쭉 미끄러지고, 그곳에서 멈춥니다. 로봇이 목표 칸에서 멈추려면 최소 몇 번 미끄러져야 하는지 구하고, 멈출 수 없으면 -1을 돌려줍니다.`,rules:[`board의 가로·세로 길이는 3 이상 100 이하`,`글자는 . (빈칸), D (장애물), R (로봇 처음 위치), G (목표 위치)`,`R과 G는 각각 한 번씩만 나옴`,`로봇은 한 번 미끄러지기 시작하면 장애물이나 판 끝까지 멈추지 못함`],examples:[{input:`board = ["...D..R", ".D.G...", "....D.D", "D....D.", "..D...."]`,output:`7`},{input:`board = [".D.R", "....", ".G..", "...D"]`,output:`-1`}]},keyIntuitions:[`한 번 움직이면 끝까지 미끄러지므로 "멈추는 칸"만 노드로 보고, 한 번 미끄러지는 것을 간선 하나(비용 1)로 봅니다. 그러면 가중치가 모두 1인 그래프의 최단 거리라 BFS로 풉니다.`,`지나가기만 하는 칸은 노드가 아닙니다. 목표 칸을 지나가도 멈추지 못하면 도착이 아니고, 목표 칸에서 멈추는 순간만 정답입니다.`,`한 칸씩 걷는 BFS는 미끄러지는 규칙을 무시해서 목표를 지나가기만 해도 도착으로 칩니다. 이동 한 번의 뜻이 "한 칸"이 아니라 "한 방향으로 끝까지"라는 점을 놓치면 안 됩니다.`],demo:{input:[l],label:`board = 예제 1 (5×7)`},workUnit:`칸을 꺼낸 횟수`,approaches:[{id:`ricochet-bfs`,name:`너비 우선 탐색 (멈춘 칸을 노드로)`,rank:`BEST`,timeComplexity:`O(N × M × (N + M))`,spaceComplexity:`O(N × M)`,verdict:`미끄러지는 한 번을 간선 하나로 보고, 멈추는 칸을 BFS로 퍼뜨리는 표준 풀이입니다.`,pros:[`미끄러지는 규칙을 slide 함수 하나로 묶어, 나머지는 평범한 BFS 틀 그대로입니다.`,`멈추는 칸을 한 번만 큐에 넣고, 목표에서 멈춘 칸을 처음 꺼낸 순간이 최소 횟수입니다.`,`모든 칸을 노드로 쓰지 않고 멈추는 칸만 보아 훨씬 적게 확인합니다.`],cons:[`칸을 꺼낼 때마다 네 방향으로 끝까지 미끄러져 보므로 한 노드의 비용이 판 크기에 비례합니다.`],whyThisRank:`이동 한 번의 비용이 모두 같은 최단 거리라 BFS가 가장 단순합니다. 달라진 것은 한 칸이 아니라 한 방향 끝까지 움직이는 간선을 만드는 slide 하나뿐입니다.`,code:O,visualize:()=>W(`stop`)},{id:`ricochet-dijkstra`,name:`다익스트라 (우선순위 큐)`,rank:`ALTERNATIVE`,timeComplexity:`O(N × M × (N + M) + NM log NM)`,spaceComplexity:`O(N × M)`,verdict:`정답은 나오지만 간선 비용이 모두 1이라 힙 연산만큼 손해입니다.`,pros:[`미끄러진 거리에 따라 비용이 달라지는 문제로 그대로 확장할 수 있습니다.`,`힙에서 꺼낸 순간의 비용이 최단 거리라는 성질은 BFS와 같습니다.`],cons:[`넣고 꺼낼 때마다 힙 정렬 비용이 붙습니다. 시각화 입력에서는 힙 정렬이 정석 큐보다 수십 번 많습니다.`,`JavaScript에는 내장 힙이 없어 직접 구현해야 해서 코드가 훨씬 길어집니다.`],whyThisRank:`간선 비용이 모두 같으면 일반 큐가 이미 거리 순서입니다. 힙은 이 문제에 필요 이상의 도구라 정석인 BFS보다 한 단계 낮습니다.`,code:A,visualize:()=>W(`heap`)},{id:`ricochet-plain`,name:`한 칸씩 걷는 BFS`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N × M)`,spaceComplexity:`O(N × M)`,verdict:`평범한 격자 BFS 틀을 그대로 쓰지만 미끄러지는 규칙을 무시해 오답이 나옵니다.`,pros:[`최단 거리 BFS 틀을 그대로 쓰는 가장 짧은 코드입니다.`],cons:[`로봇은 한 방향으로 끝까지 미끄러지는데 한 칸씩 걸어서 목표 칸을 지나가기만 해도 도착으로 칩니다. 시각화 입력에서는 4칸 만에 닿았다고 하지만 정답은 7번입니다.`,`목표 칸이 막다른 곳이 아니면 멈출 수 없는 경우도 많아서, -1이어야 할 판에서도 숫자가 나옵니다.`],whyThisRank:`이 문제의 이동은 "한 칸"이 아니라 "한 방향 끝까지"입니다. 이동의 뜻을 바꾸지 않고 BFS 틀만 쓰면 목표를 지나치는 것도 도착이 되어 틀립니다.`,code:M,visualize:()=>W(`plain`)}],checks:{cases:[{args:[[`...D..R`,`.D.G...`,`....D.D`,`D....D.`,`..D....`]],expected:7},{args:[[`.D.R`,`....`,`.G..`,`...D`]],expected:-1},{args:[[`RGD`,`...`,`...`]],expected:1},{args:[[`R..`,`.G.`,`...`]],expected:-1},{args:[[`R.D`,`...`,`..G`]],expected:2},{args:[l],expected:S}],random:e=>{let[t,n]=[3+Math.floor(e()*4),3+Math.floor(e()*4)],r=Array.from({length:t*n},(e,t)=>t),i=Array.from({length:t},()=>Array.from({length:n},()=>e()<.25?`D`:`.`));for(let t of[`R`,`G`]){let a=r.splice(Math.floor(e()*r.length),1)[0];i[Math.floor(a/n)][a%n]=t}return[i.map(e=>e.join(``))]}}};export{G as default};