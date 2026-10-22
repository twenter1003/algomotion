import{i as e,r as t}from"./layout-DFaYBMY_.js";import{c as n,i as r,l as i,n as a,r as o}from"./shared-CL29HWIp.js";import{t as s}from"./lane-BzDhdR3X.js";import{t as c}from"./pacing-CRi5IfsT.js";var l=[[1,1,3,4],[2,2,4,3]],u=[3,1],d=[3,3],f=1,p=4,m=([e,t])=>`${e},${t}`,h=(e,t)=>e[0]===t[0]&&e[1]===t[1],g=([e,t],n)=>[e*n,t*n],_=e=>`cell:${m(e)}`,v=[[0,1,`위쪽`],[0,-1,`아래쪽`],[-1,0,`왼쪽`],[1,0,`오른쪽`]],y=(e,t)=>[e[0]+v[t][0],e[1]+v[t][1]];function b(e,t,[n,r,i,a]){let o=[];for(let s=t*n;s<=t*i;s++)for(let c=t*r;c<=t*a;c++)o.push([s,c]),e[s][c]!==2&&(e[s][c]=s===t*n||s===t*i||c===t*r||c===t*a?1:2);return o}var x=(e,t=p)=>Array.from({length:e*t+2},()=>Array(e*t+2).fill(0));function S(e,t=l,n=p){let r=x(e,n);for(let n of t)b(r,e,n);return r}var C=(e,t)=>e.flat().filter(e=>e===t).length,w=S(2);function T(){let[e,t]=[g(u,2),g(d,2)],n=new Set([m(e)]),r=[e],i=[],a=0,o=e=>{if(a++,h(e,t))i.push([...r]);else for(let t=0;t<4;t++){let i=y(e,t);w[i[0]][i[1]]===1&&!n.has(m(i))&&(n.add(m(i)),r.push(i),o(i),r.pop(),n.delete(m(i)))}};return o(e),{paths:i,calls:a}}var{paths:E,calls:D}=T(),O=(E.reduce((e,t)=>t.length<e.length?t:e).length-1)/2;function k(e,t){let n=[],[r,i]=[void 0,t];do{n.push(i);let t=[0,1,2,3].map(e=>y(i,e)).find(t=>e[t[0]][t[1]]===1&&!(r&&h(t,r)));[r,i]=[i,t]}while(!h(i,t));return n}var A={python:`from collections import deque

def solution(rectangle, characterX, characterY, itemX, itemY):
    board = [[0] * 102 for _ in range(102)]  # 좌표를 두 배로 늘린 판: 0 바깥, 1 테두리(길), 2 안쪽
    for x1, y1, x2, y2 in rectangle:
        for x in range(2 * x1, 2 * x2 + 1):
            for y in range(2 * y1, 2 * y2 + 1):
                if board[x][y] == 2:
                    continue  # 이미 다른 직사각형의 안쪽이면 그대로 둡니다
                board[x][y] = 1 if x in (2 * x1, 2 * x2) or y in (2 * y1, 2 * y2) else 2

    start = (2 * characterX, 2 * characterY)
    goal = (2 * itemX, 2 * itemY)
    dist = {start: 0}
    queue = deque([start])
    while queue:
        x, y = queue.popleft()
        if (x, y) == goal:
            return dist[(x, y)] // 2  # 두 배로 늘렸으니 거리를 반으로
        for dx, dy in ((0, 1), (0, -1), (-1, 0), (1, 0)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy
            if board[nx][ny] == 1 and (nx, ny) not in dist:
                dist[(nx, ny)] = dist[(x, y)] + 1
                queue.append((nx, ny))`,javascript:`function solution(rectangle, characterX, characterY, itemX, itemY) {
  const board = Array.from({ length: 102 }, () => Array(102).fill(0)); // 좌표를 두 배로 늘린 판: 0 바깥, 1 테두리(길), 2 안쪽
  for (const [x1, y1, x2, y2] of rectangle) {
    for (let x = 2 * x1; x <= 2 * x2; x++) {
      for (let y = 2 * y1; y <= 2 * y2; y++) {
        if (board[x][y] === 2) continue; // 이미 다른 직사각형의 안쪽이면 그대로 둡니다
        board[x][y] = x === 2 * x1 || x === 2 * x2 || y === 2 * y1 || y === 2 * y2 ? 1 : 2;
      }
    }
  }

  const start = [2 * characterX, 2 * characterY];
  const goal = [2 * itemX, 2 * itemY];
  const dist = Array.from({ length: 102 }, () => Array(102).fill(-1));
  dist[start[0]][start[1]] = 0;
  const queue = [start];
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x === goal[0] && y === goal[1]) return dist[x][y] / 2; // 두 배로 늘렸으니 거리를 반으로
    for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) { // 상, 하, 좌, 우
      const nx = x + dx;
      const ny = y + dy;
      if (board[nx][ny] === 1 && dist[nx][ny] === -1) {
        dist[nx][ny] = dist[x][y] + 1;
        queue.push([nx, ny]);
      }
    }
  }
}`},j={draw:r(A,[`for x1, y1, x2, y2 in rectangle`,`if board[x][y] == 2`,`board[x][y] = 1 if`],[`for (const [x1, y1, x2, y2] of rectangle)`,`if (board[x][y] === 2) continue`,`board[x][y] = x === 2 * x1`]),start:r(A,[`start = (2 * characterX`,`goal = (2 * itemX`,`dist = {start: 0}`,`queue = deque([start])`],[`const start = [2 * characterX`,`const goal = [2 * itemX`,`dist[start[0]][start[1]] = 0`,`const queue = [start]`]),pop:r(A,[`x, y = queue.popleft()`],[`const [x, y] = queue[head++]`]),look:r(A,[`for dx, dy in`,`if board[nx][ny] == 1`],[`for (const [dx, dy] of`,`if (board[nx][ny] === 1`]),mark:r(A,[`for dx, dy in`,`if board[nx][ny] == 1`,`dist[(nx, ny)] = dist[(x, y)] + 1`],[`for (const [dx, dy] of`,`if (board[nx][ny] === 1`,`dist[nx][ny] = dist[x][y] + 1`]),push:r(A,[`queue.append((nx, ny))`],[`queue.push([nx, ny])`]),next:r(A,[`while queue:`],[`while (head < queue.length)`]),goal:r(A,[`if (x, y) == goal`,`return dist[(x, y)] // 2`],[`if (x === goal[0] && y === goal[1])`])},M={python:`def solution(rectangle, characterX, characterY, itemX, itemY):
    board = [[0] * 102 for _ in range(102)]  # 좌표를 두 배로 늘린 판: 0 바깥, 1 테두리(길), 2 안쪽
    for x1, y1, x2, y2 in rectangle:
        for x in range(2 * x1, 2 * x2 + 1):
            for y in range(2 * y1, 2 * y2 + 1):
                if board[x][y] == 2:
                    continue  # 이미 다른 직사각형의 안쪽이면 그대로 둡니다
                board[x][y] = 1 if x in (2 * x1, 2 * x2) or y in (2 * y1, 2 * y2) else 2

    goal = (2 * itemX, 2 * itemY)
    visited = {(2 * characterX, 2 * characterY)}
    best = float("inf")

    def dfs(x, y, count):
        nonlocal best
        if (x, y) == goal:
            best = min(best, count)  # 더 짧은 길이 있을 수 있어 멈추지 않습니다
            return
        for dx, dy in ((0, 1), (0, -1), (-1, 0), (1, 0)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy
            if board[nx][ny] == 1 and (nx, ny) not in visited:
                visited.add((nx, ny))
                dfs(nx, ny, count + 1)
                visited.remove((nx, ny))  # 되돌리기 → 다른 길도 모두 확인

    dfs(2 * characterX, 2 * characterY, 0)
    return best // 2`,javascript:`function solution(rectangle, characterX, characterY, itemX, itemY) {
  const board = Array.from({ length: 102 }, () => Array(102).fill(0)); // 좌표를 두 배로 늘린 판: 0 바깥, 1 테두리(길), 2 안쪽
  for (const [x1, y1, x2, y2] of rectangle) {
    for (let x = 2 * x1; x <= 2 * x2; x++) {
      for (let y = 2 * y1; y <= 2 * y2; y++) {
        if (board[x][y] === 2) continue; // 이미 다른 직사각형의 안쪽이면 그대로 둡니다
        board[x][y] = x === 2 * x1 || x === 2 * x2 || y === 2 * y1 || y === 2 * y2 ? 1 : 2;
      }
    }
  }

  const goal = [2 * itemX, 2 * itemY];
  const visited = Array.from({ length: 102 }, () => Array(102).fill(false));
  visited[2 * characterX][2 * characterY] = true;
  let best = Infinity;

  const dfs = (x, y, count) => {
    if (x === goal[0] && y === goal[1]) {
      best = Math.min(best, count); // 더 짧은 길이 있을 수 있어 멈추지 않습니다
      return;
    }
    for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) { // 상, 하, 좌, 우
      const nx = x + dx;
      const ny = y + dy;
      if (board[nx][ny] === 1 && !visited[nx][ny]) {
        visited[nx][ny] = true;
        dfs(nx, ny, count + 1);
        visited[nx][ny] = false; // 되돌리기 → 다른 길도 모두 확인
      }
    }
  };

  dfs(2 * characterX, 2 * characterY, 0);
  return best / 2;
}`},N={draw:r(M,[`for x1, y1, x2, y2 in rectangle`,`if board[x][y] == 2`,`board[x][y] = 1 if`],[`for (const [x1, y1, x2, y2] of rectangle)`,`if (board[x][y] === 2) continue`,`board[x][y] = x === 2 * x1`]),start:r(M,[`goal = (2 * itemX`,`visited = {(2 * characterX`,`best = float("inf")`,`dfs(2 * characterX, 2 * characterY, 0)`],[`const goal = [2 * itemX`,`visited[2 * characterX][2 * characterY] = true`,`let best = Infinity`,`dfs(2 * characterX, 2 * characterY, 0)`]),enter:r(M,[`visited.add((nx, ny))`,`dfs(nx, ny, count + 1)`],[`visited[nx][ny] = true`,`dfs(nx, ny, count + 1)`]),look:r(M,[`for dx, dy in`,`if board[nx][ny] == 1 and (nx, ny) not in visited`],[`for (const [dx, dy] of`,`if (board[nx][ny] === 1 && !visited[nx][ny])`]),found:r(M,[`if (x, y) == goal`,`best = min(best, count)`],[`if (x === goal[0] && y === goal[1])`,`best = Math.min(best, count)`]),back:r(M,[`visited.remove((nx, ny))`],[`visited[nx][ny] = false`]),fast:r(M,[`for dx, dy in`,`dfs(nx, ny, count + 1)`,`visited.remove((nx, ny))`],[`for (const [dx, dy] of`,`dfs(nx, ny, count + 1)`,`visited[nx][ny] = false`]),done:r(M,[`dfs(2 * characterX, 2 * characterY, 0)`,`return best // 2`],[`dfs(2 * characterX, 2 * characterY, 0)`,`return best / 2`])},P={python:`# 주의: 오답이 나오는 풀이입니다 (좌표를 두 배로 늘리지 않습니다)
from collections import deque

def solution(rectangle, characterX, characterY, itemX, itemY):
    board = [[0] * 52 for _ in range(52)]  # 원래 좌표 그대로: 0 바깥, 1 테두리(길), 2 안쪽
    for x1, y1, x2, y2 in rectangle:
        for x in range(x1, x2 + 1):
            for y in range(y1, y2 + 1):
                if board[x][y] == 2:
                    continue  # 이미 다른 직사각형의 안쪽이면 그대로 둡니다
                board[x][y] = 1 if x in (x1, x2) or y in (y1, y2) else 2

    start = (characterX, characterY)
    goal = (itemX, itemY)
    dist = {start: 0}
    queue = deque([start])
    while queue:
        x, y = queue.popleft()
        if (x, y) == goal:
            return dist[(x, y)]
        for dx, dy in ((0, 1), (0, -1), (-1, 0), (1, 0)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy
            if board[nx][ny] == 1 and (nx, ny) not in dist:
                dist[(nx, ny)] = dist[(x, y)] + 1
                queue.append((nx, ny))`,javascript:`// 주의: 오답이 나오는 풀이입니다 (좌표를 두 배로 늘리지 않습니다)
function solution(rectangle, characterX, characterY, itemX, itemY) {
  const board = Array.from({ length: 52 }, () => Array(52).fill(0)); // 원래 좌표 그대로: 0 바깥, 1 테두리(길), 2 안쪽
  for (const [x1, y1, x2, y2] of rectangle) {
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        if (board[x][y] === 2) continue; // 이미 다른 직사각형의 안쪽이면 그대로 둡니다
        board[x][y] = x === x1 || x === x2 || y === y1 || y === y2 ? 1 : 2;
      }
    }
  }

  const start = [characterX, characterY];
  const dist = Array.from({ length: 52 }, () => Array(52).fill(-1));
  dist[start[0]][start[1]] = 0;
  const queue = [start];
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x === itemX && y === itemY) return dist[x][y];
    for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) { // 상, 하, 좌, 우
      const nx = x + dx;
      const ny = y + dy;
      if (board[nx][ny] === 1 && dist[nx][ny] === -1) {
        dist[nx][ny] = dist[x][y] + 1;
        queue.push([nx, ny]);
      }
    }
  }
}`},F={draw:r(P,[`for x1, y1, x2, y2 in rectangle`,`if board[x][y] == 2`,`board[x][y] = 1 if`],[`for (const [x1, y1, x2, y2] of rectangle)`,`if (board[x][y] === 2) continue`,`board[x][y] = x === x1`]),start:r(P,[`start = (characterX, characterY)`,`goal = (itemX, itemY)`,`dist = {start: 0}`,`queue = deque([start])`],[`const start = [characterX, characterY]`,`dist[start[0]][start[1]] = 0`,`const queue = [start]`]),pop:r(P,[`x, y = queue.popleft()`],[`const [x, y] = queue[head++]`]),look:r(P,[`for dx, dy in`,`if board[nx][ny] == 1`],[`for (const [dx, dy] of`,`if (board[nx][ny] === 1`]),mark:r(P,[`for dx, dy in`,`if board[nx][ny] == 1`,`dist[(nx, ny)] = dist[(x, y)] + 1`],[`for (const [dx, dy] of`,`if (board[nx][ny] === 1`,`dist[nx][ny] = dist[x][y] + 1`]),push:r(P,[`queue.append((nx, ny))`],[`queue.push([nx, ny])`]),next:r(P,[`while queue:`],[`while (head < queue.length)`]),goal:r(P,[`if (x, y) == goal`,`return dist[(x, y)]`],[`if (x === itemX && y === itemY) return dist[x][y]`])};function I(t){let[n,r]=t===2?[40,4]:[54,6],i=t*f-1,a=t*p+1,o=a-i+1,s=e({x:26,y:54,rows:o,cols:o,cell:n,gap:r});return{k:t,lo:i,hi:a,width:26+o*(n+r)-r+12,bottom:54+o*(n+r)-r,cellRect:([e,t])=>s(a-t,e-i)}}var L={id:`lane`,x:40,y:5,slotW:58,slotH:30,gap:6,max:5},R={wall:`길 아님`,seen:`방문함`,new:`새 칸`},z=[`wall`,`plain`,`explored`],B=(e,t,n,r=0)=>({x:r,y:e.bottom+28+t*34,w:n,h:30}),V=(e,n)=>t(e.cellRect(n));function H(e,t,n,r,i=[]){let a=e.bottom+28+(n?n*34-4:0),o={x:0,y:0,w:e.width,h:a},s=[{id:`lane:label`,kind:`text`,rect:{x:0,y:0,w:34,h:40},text:t},{id:`lane:bg`,kind:`zone`,rect:{x:34,y:0,w:e.width-34,h:40}}],c=e.cellRect([e.lo,e.lo]).w;for(let t=e.lo;t<=e.hi;t++)for(let n=e.hi;n>=e.lo;n--){let r=h([t,n],g(u,e.k))?`캐릭터`:h([t,n],g(d,e.k))?`아이템`:void 0;s.push({id:_([t,n]),kind:`cell`,rect:e.cellRect([t,n]),tone:`wall`,...r?{tag:r}:{}})}for(let t=f;t<=p;t++){let[n,r]=[e.cellRect([e.k*t,e.lo]),e.cellRect([e.lo,e.k*t])];s.push({id:`axis:x:${t}`,kind:`text`,rect:{x:n.x,y:e.bottom+4,w:c,h:18},text:String(t)},{id:`axis:y:${t}`,kind:`text`,rect:{x:0,y:r.y+(c-18)/2,w:22,h:18},text:String(t)})}for(let e of r)s.push({id:e.id,kind:`line`,rect:o,...e.tone?{tone:e.tone}:{},points:[]});return s.push(...i),{width:e.width,height:a,items:s}}var U=(e,t)=>({type:`set`,id:_(e),patch:t}),W=e=>({type:`wait`,ms:e}),G=e=>({id:`tok:${m(e)}`,text:a(e)}),K=()=>[{type:`unfocus`},{type:`clearMarks`}];function q(e,t,r,i){let a=x(t.k);e.step({title:`직사각형 ${l.length}개를 ${t.k===2?`두 배로 `:``}그리기`,codeHighlights:r.draw,work:0,variables:{"길(1)인 칸":`${C(i,1)}칸`,"안쪽(2)인 칸":`${C(i,2)}칸`}}),l.forEach((i,s)=>{let c=b(a,t.k,i),l=c.filter(t=>e.get(_(t)).tone!==z[a[t[0]][t[1]]]),u=`[${i.join(`, `)}]`,d=`${s+1}번째 직사각형 ${t.k===2?`${u}의 좌표를 두 배로 늘려`:o(u,`을`,`를`)}`;e.phase(`그리기`,s===0?`${d} 칠합니다. 테두리는 1(길, 흰색), 안쪽은 2(못 가는 곳, 회색)입니다.`:`${d} 칠합니다. 겹친 곳은 안쪽(2)이 우선이라 가운데에 든 선이 지워지고 바깥 테두리만 남습니다.`,r.draw),e.do({type:`focus`,ids:c.map(_)},...n(l.map(e=>U(e,{tone:z[a[e[0]][e[1]]]})),!0),W(150),{type:`unfocus`})})}function J(e,t,n,r=()=>[]){e.do({type:`focus`,ids:[_(t),...n.map(e=>_(e.to))]});for(let i of n)if(e.do({type:`arrow`,from:_(t),to:_(i.to),verdict:i.verdict,label:R[i.verdict]}),i.verdict===`new`)for(let t of r(i))e.do({...t,together:!0})}function Y(e){let t=I(e),r=e===2?j:F,l=S(e),f=new i(H(t,`큐`,e===1?2:0,[{id:`path`,tone:`path`},...e===1?[{id:`outline`}]:[]])),p=new s(f,L),[b,x]=[g(u,e),g(d,e)],C=new Map([[m(b),0]]),T=new Map,E=[b],D=0,A,M=e=>C.get(m(e)),N=(e,t=[])=>({work:D,variables:{"(x, y)":e?a(e):`-`,dist:e?M(e):`-`,"새로 넣은 칸":t.length?t.map(a).join(`, `):`없음`,queue:`[${E.map(a).join(`, `)}]`}}),P=e=>{p.shift(_(e)),f.do(...n([U(e,{tone:`current`}),...A?[U(A,{tone:`visited`})]:[]],!0))};for(q(f,t,r,l),f.step({title:`캐릭터 ${o(a(b),`을`,`를`)} 큐에 넣기`,codeHighlights:r.start,...N(void 0,[b])}),f.phase(`시작`,e===2?`캐릭터 ${o(a(u),`은`,`는`)} 두 배로 늘린 판의 ${a(b)} 칸입니다. 거리 0을 적고 큐에 넣습니다.`:`좌표를 그대로 써서 캐릭터 ${a(b)}에 거리 0을 적고 큐에 넣습니다.`),f.do({...U(b,{tone:`queued`,text:`0`}),pop:!0}),p.push(G(b),_(b));E.length;){let i=E.shift();if(D++,h(i,x)){let s=[i];for(let e=T.get(m(i));e;e=T.get(m(e)))s.unshift(e);if(f.step({title:`도착 칸 ${a(i)} 꺼내기 — 거리 ${M(i)}`,codeHighlights:r.goal,...N(i),answer:e===2?M(i)/2:M(i),isKeyframe:!0}),f.phase(`꺼내기`,`큐 맨 앞에서 도착 칸 ${o(a(i),`을`,`를`)} 꺼냈습니다.`,r.pop),P(i),e===2)f.phase(`도착`,`거리 ${o(M(i),`을`,`를`)} 반으로 나눈 ${o(M(i)/2,`이`,`가`)} 실제 최단 거리입니다. 칸을 ${D}번 밟았습니다.`),f.do(...n(s.map(e=>U(e,{tone:`path`})))),f.do({type:`trace`,id:`path`,points:s.map(e=>V(t,e))});else{let e=s.slice(1).flatMap((e,t)=>w[s[t][0]+e[0]][s[t][1]+e[1]]===1?[]:[s[t],e]),r=k(w,g(u,2)),[c,l]=e;f.phase(`테두리 확인`,`진짜 테두리는 이렇게 생겼습니다. ${a(c)}에서 ${o(a(l),`으로`,`로`)} 곧장 가는 길은 테두리가 아니라 안쪽을 가로지르는 선입니다.`),f.do({type:`trace`,id:`outline`,points:[...r,r[0]].map(([e,n])=>V(t,[e/2,n/2]))}),f.phase(`오답 확인`,`좌표를 두 배로 늘리지 않아 두 칸이 이웃이 되었고, 막혀 있어야 할 곳을 건너 거리 ${M(i)}가 나왔습니다. 정답은 ${O}입니다.`),f.do(...n([...s.map(t=>U(t,{tone:e.some(e=>h(e,t))?`bad`:`path`})),{type:`trace`,id:`path`,points:s.map(e=>V(t,e))},{type:`add`,item:{id:`mine`,kind:`token`,rect:B(t,0,110),tone:`bad`,text:`내 답 ${M(i)}`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:B(t,1,110),tone:`good`,text:`정답 ${O}`}}]))}break}let s=[0,1,2,3].map(e=>{let t=y(i,e);return{to:t,name:v[e][2],verdict:l[t[0]][t[1]]===1?C.has(m(t))?`seen`:`new`:`wall`}}),c=s.filter(e=>e.verdict===`new`).map(e=>e.to);for(let e of c)C.set(m(e),M(i)+1),T.set(m(e),i),E.push(e);f.step({title:c.length?`${a(i)} 꺼내고 ${c.length}칸 넣기`:`${a(i)} 꺼내기 — 넣을 칸 없음`,codeHighlights:c.length?r.push:r.next,...N(i,c)}),f.phase(`꺼내기`,`큐 맨 앞에서 ${o(a(i),`을`,`를`)} 꺼냅니다. 이 칸까지의 거리는 ${M(i)}입니다.`,r.pop),P(i),f.phase(`살피기`,`상하좌우 칸을 하나씩 확인합니다. 길이 아니거나 이미 방문한 칸은 건너뛰고${c.length?`, 새 칸에는 거리 ${o(M(i)+1,`을`,`를`)} 적습니다.`:` 넘어갑니다.`}`,c.length?r.mark:r.look),J(f,i,s,e=>[{...U(e.to,{tone:`queued`,text:String(M(i)+1)}),pop:!0}]),f.phase(`넣기`,c.length?`새로 찾은 ${o(c.map(a).join(`, `),`을`,`를`)} 큐 뒤에 넣습니다.`:`새로 넣을 칸이 없어 그대로 넘어갑니다.`,c.length?r.push:r.next),c.length?c.forEach((e,t)=>{p.push(G(e),_(e)),t||f.do(...n(K(),!0))}):f.do(...n(K())),A=i}return c(f.finish())}function X(){let e=I(2),t=N,[r,l]=E,d=r[0],f=r.at(-1),p=new i(H(e,`스택`,1,[{id:`trail`,tone:`trail`},{id:`walked`,tone:`trail`},{id:`path`,tone:`path`}],[{id:`best`,kind:`token`,rect:B(e,0,110),tone:`plain`,text:`best ∞`}])),m=new s(p,{...L,foldable:!0}),g=[],b=[],x=0,S=1/0,C=!0,T=()=>{let e=g.at(-1);return{work:x,variables:{"(x, y)":C&&e?a(e):`-`,count:C&&e?g.length-1:`-`,best:S===1/0?`∞`:S}}},O=t=>({type:`set`,id:`trail`,patch:{points:t.map(t=>V(e,t))}}),k=(e,t)=>[0,1,2,3].find(n=>h(y(e,n),t)),A=(e,t)=>{let n=[];for(let r=t;r<4;r++){let t=y(e,r),i=w[t[0]][t[1]]===1?g.some(e=>h(e,t))?`seen`:`new`:`wall`;if(n.push({to:t,name:v[r][2],verdict:i}),i===`new`)break}return n},j=e=>`${e.map((t,n)=>{let r=n===e.length-1;return t.verdict===`wall`?`${t.name}은 길이 아니${r?`라 건너뜁니다`:`고`}`:t.verdict===`seen`?`${t.name}은 이미 지난 칸${r?`이라 건너뜁니다`:`이고`}`:`${t.name} ${o(a(t.to),`은`,`는`)} 아직 안 간 길이라 들어갑니다`}).join(`, `)}.`,M=(e,n,r=!1)=>{p.phase(`살피기`,`${a(e)}에서 ${r?`아직 안 본 방향을 이어서`:`상하좌우를 차례로`} 봅니다. ${j(n)}`,t.look),J(p,e,n)},P=e=>{let t=b.at(-1);b.push(e),m.push(G(e),_(e)),p.do(...n([...t?[U(t,{tone:`trail`})]:[],U(e,{tone:`current`,text:String(b.length-1)}),O(b)],!0))};q(p,e,t,w),g.push(d),x++,p.step({title:`캐릭터 ${a(d)}에서 시작`,codeHighlights:t.look,...T()}),p.phase(`들어가기`,`캐릭터 ${o(a(u),`은`,`는`)} 두 배로 늘린 판의 ${a(d)} 칸입니다. 방문 표시를 하고 dfs를 시작합니다.`,t.start),P(d),M(d,A(d,0));let F=[];r.slice(1).forEach((e,t)=>{let n=k(r[t],e);F.at(-1)?.dir===n&&F.at(-1).cells.length<3?F.at(-1).cells.push(e):F.push({dir:n,cells:[e]})}),F.forEach(({dir:e,cells:r},i)=>{let o=i===F.length-1;g.push(...r),x+=r.length,o&&(S=g.length-1),p.step({title:o?`도착 — ${S}칸 길 찾음`:`${v[e][2]}으로 ${r.length}칸 들어가기`,codeHighlights:o?t.found:t.look,...T()}),p.phase(`들어가기`,`${v[e][2]}으로 ${r.length}칸, ${r.map(a).join(`, `)}에 차례로 들어갑니다.`,t.enter),r.forEach(P),o?(p.phase(`도착`,`도착 칸에 닿았습니다. 지나온 칸은 ${S}개라 best = ${S}입니다. 더 짧은 길이 있을 수 있어 멈추지 않고 되돌아갑니다.`,t.found),p.do(...n([U(f,{tone:`good`}),{type:`set`,id:`best`,patch:{text:`best ${S}`},pop:!0}]))):M(r.at(-1),A(r.at(-1),0))});let R=r.slice(1).reverse();for(let e=0;e<R.length;){let i=R.slice(e,e+3),o=e===0;e+=i.length;let s=R.length-e;g.length=r.length-e,p.step({title:`${s?`${a(g.at(-1))}까지`:`출발 칸까지`} 되돌아가기 ${e}/${R.length}칸`,codeHighlights:t.back,...T()}),p.phase(`되돌아가기`,s?`${o?`도착해도 멈추지 않고, 방문 표시를 지우며 되돌아갑니다.`:`계속 되돌아갑니다.`} ${s}칸 남았습니다.`:`${o?`도착해도 멈추지 않고, 방문 표시를 지우며 되돌아갑니다.`:`계속 되돌아가`} 출발 칸에 닿았습니다.`,t.back);for(let e of i)b.pop(),m.pop(_(e)),p.do(...n([U(e,{tone:`explored`,text:``}),O(b),U(b.at(-1),{tone:`current`})],!0));s||M(d,A(d,k(d,r[1])+1),!0)}let z=l.length-1;if(x+=z,p.step({title:`반대 방향도 끝까지 — ${z}칸 더 밟기`,codeHighlights:t.fast,...T()}),p.phase(`빨리 감기`,`왼쪽 길로도 끝까지 걸어 도착 칸에 닿습니다. 그 길은 ${z}칸이라 best ${S}보다 길어 best는 그대로이고, 출발 칸까지 되돌아옵니다.`,t.fast),p.do(...n([{type:`trace`,id:`walked`,points:l.map(t=>V(e,t))},...l.slice(1).map(e=>U(e,{tone:`explored`}))])),C=!1,g.length=0,x!==D)throw Error(`그림이 센 dfs 호출 수 ${x}가 코드를 돌린 수 ${D}와 다릅니다`);return p.step({title:`최단 ${S}칸 확정`,codeHighlights:t.done,...T(),answer:S/2,isKeyframe:!0}),p.phase(`결과 확인`,`dfs가 끝났습니다. 가장 짧은 길 ${o(S,`을`,`를`)} 반으로 나눈 ${o(S/2,`이`,`가`)} 실제 최단 거리입니다.`,t.done),p.do({type:`trace`,id:`path`,points:r.map(t=>V(e,t))},...n([...r.map((e,t)=>U(e,{tone:`path`,text:String(t)})),{type:`set`,id:`trail`,patch:{points:[]}},{type:`set`,id:`best`,patch:{tone:`good`}},...m.ids.map(e=>({type:`remove`,id:e,into:_(d)}))],!0)),c(p.finish())}var Z={id:`item-pickup`,title:`아이템 줍기`,level:3,category:`dfs-bfs`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/87694`,description:{summary:`직사각형 여러 개가 겹쳐 하나의 다각형 땅을 이룹니다. 캐릭터는 이 땅의 가장 바깥 테두리를 따라서만 걸을 수 있습니다. 테두리 위의 캐릭터 위치에서 아이템 위치까지 가는 가장 짧은 거리를 구합니다. 겹쳐서 땅 안쪽에 들어간 선은 걸을 수 없습니다.`,rules:[`직사각형은 1개 이상 4개 이하`,`직사각형은 [왼쪽 아래 x, 왼쪽 아래 y, 오른쪽 위 x, 오른쪽 위 y]이고 모든 좌표는 1 이상 50 이하의 자연수`,`서로 다른 두 직사각형이 x 좌표나 y 좌표를 같게 갖는 경우는 없음`,`캐릭터와 아이템은 다각형 테두리 위의 서로 다른 점`,`좌표 한 칸을 가는 거리가 1`],examples:[{input:`rectangle = [[1,1,7,4],[3,2,5,5],[4,3,6,9],[2,6,8,8]], characterX = 1, characterY = 3, itemX = 7, itemY = 8`,output:`17`},{input:`rectangle = [[1,1,8,4],[2,2,4,9],[3,6,9,8],[6,3,7,7]], characterX = 9, characterY = 7, itemX = 6, itemY = 1`,output:`11`},{input:`rectangle = [[1,1,5,7]], characterX = 1, characterY = 1, itemX = 4, itemY = 7`,output:`9`},{input:`rectangle = [[2,1,7,5],[6,4,10,10]], characterX = 3, characterY = 1, itemX = 7, itemY = 10`,output:`15`},{input:`rectangle = [[2,2,5,5],[1,3,6,4],[3,1,4,6]], characterX = 1, characterY = 4, itemX = 6, itemY = 3`,output:`10`}]},keyIntuitions:[`테두리만 걸을 수 있으니 테두리 칸을 길(1), 안쪽을 못 가는 곳(2)으로 칠한 판에서 BFS로 가장 짧은 거리를 구합니다.`,`좌표를 그대로 쓰면 안쪽으로 지워진 선을 사이에 둔 두 테두리 칸이 바로 이웃이 되어 잘못 건널 수 있습니다. 모든 좌표를 두 배로 늘리면 그 사이에 칸이 하나 생겨 지워진 선이 제대로 막습니다.`,`두 배로 늘린 판에서 한 칸은 원래 거리의 절반이므로, 구한 거리를 2로 나눈 값이 답입니다.`],demo:{input:[l,u[0],u[1],d[0],d[1]],label:`rectangle = [[1,1,3,4],[2,2,4,3]], 캐릭터 (3, 1), 아이템 (3, 3)`},workUnit:`칸을 밟은 횟수`,approaches:[{id:`pickup-bfs`,name:`너비 우선 탐색 (BFS, 좌표 두 배)`,rank:`BEST`,timeComplexity:`O(C²) (C: 두 배로 늘린 좌표 범위, 최대 100)`,spaceComplexity:`O(C²)`,verdict:`좌표를 두 배로 늘려 안쪽 선을 막고, BFS로 가까운 칸부터 찾는 표준 풀이입니다.`,pros:[`좌표를 두 배로 늘려 두 직사각형의 테두리가 바로 이웃하는 일이 없어, 지워진 안쪽 선을 잘못 건너지 않습니다.`,`도착 칸을 처음 꺼내는 순간이 최단 거리라 길이 갈라져도 반대 방향까지 다 걸어 볼 필요가 없습니다.`,`판 크기가 102 × 102뿐이라 칸마다 한 번씩만 큐에 넣어 충분히 빠릅니다.`],cons:[`판이 네 배 커지고, 답을 낼 때 거리를 2로 나누는 것을 잊기 쉽습니다.`],whyThisRank:`이 문제의 핵심은 "좌표 두 배"로 테두리만 길이 되게 만드는 것이고, 그 위에서 최단 거리는 BFS가 가장 단순합니다. 길이 갈라져도 한 번 훑으면 끝납니다.`,code:A,visualize:()=>Y(2)},{id:`pickup-dfs`,name:`깊이 우선 탐색 (두 방향 모두 걸어 보기)`,rank:`ALTERNATIVE`,timeComplexity:`O(C²) (길마다 끝까지 확인)`,spaceComplexity:`O(둘레) 재귀 깊이`,verdict:`정답은 나오지만 도착해도 멈추지 못하고 반대 방향까지 끝까지 걸어야 합니다.`,pros:[`테두리가 고리 하나라 길이 둘뿐이어서, 두 방향을 모두 걸어 보고 짧은 쪽을 고르면 정답입니다.`,`큐 없이 재귀와 되돌리기만으로 짧게 쓸 수 있습니다.`],cons:[`먼저 닿은 길이 짧다는 보장이 없어 반대 방향까지 끝까지 걸어야 합니다. 시각화 입력에서는 칸을 25번 밟는데 BFS는 16번이면 끝납니다.`,`둘레가 길어지면 재귀가 깊어져 Python 기본 재귀 한도(1,000)를 넘길 수 있습니다.`,`길이 여러 갈래로 갈라지는 문제로 바뀌면 시도할 길이 지수적으로 늘어납니다.`],whyThisRank:`맞게는 풀지만 BFS가 가까운 칸부터 한 번씩만 보며 끝내는 일을, 길 하나를 끝까지 가고 되돌아와 다시 가는 방식으로 합니다. 최단 거리는 BFS가 더 알맞습니다.`,code:M,visualize:X},{id:`pickup-wrong`,name:`좌표를 두 배로 늘리지 않은 BFS`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(C²)`,spaceComplexity:`O(C²)`,verdict:`코드는 정석과 거의 같지만 지워진 안쪽 선을 건너 더 짧은 오답이 나옵니다.`,pros:[`판이 절반 크기라 코드가 조금 더 짧고 거리를 나눌 필요도 없습니다.`],cons:[`안쪽으로 지워진 선 양쪽의 테두리 칸이 바로 이웃이 되어 갈 수 없는 길을 건넙니다. 시각화 입력에서는 (3, 2)에서 (3, 3)으로 건너 4번 가야 할 길을 2번에 갑니다.`,`직사각형 폭이 1인 부분처럼 선끼리 가까운 입력에서만 틀려서, 예제만 통과하고 채점에서 떨어지기 쉽습니다.`],whyThisRank:`좌표를 그대로 쓰면 두 테두리 사이에 칸이 없어 "지워진 선"이 길을 막지 못합니다. 이 문제에서 BFS만큼 중요한 것이 좌표를 두 배로 늘리는 일입니다.`,code:P,visualize:()=>Y(1)}],checks:{cases:[{args:[[[1,1,7,4],[3,2,5,5],[4,3,6,9],[2,6,8,8]],1,3,7,8],expected:17},{args:[[[1,1,8,4],[2,2,4,9],[3,6,9,8],[6,3,7,7]],9,7,6,1],expected:11},{args:[[[1,1,5,7]],1,1,4,7],expected:9},{args:[[[2,1,7,5],[6,4,10,10]],3,1,7,10],expected:15},{args:[[[2,2,5,5],[1,3,6,4],[3,1,4,6]],1,4,6,3],expected:10},{args:[[[1,1,2,2]],1,1,2,2],expected:2},{args:[[[1,1,3,3]],1,1,1,2],expected:1},{args:[l,u[0],u[1],d[0],d[1]],expected:O}],random:e=>{let t=(e,t)=>{let n=e.flatMap((e,n)=>e.flatMap((e,r)=>e===t?[[n,r]]:[])),r=new Set([m(n[0])]),i=[n[0]];for(let n=0;n<i.length;n++)for(let a=0;a<4;a++){let o=y(i[n],a);e[o[0]]?.[o[1]]===t&&!r.has(m(o))&&(r.add(m(o)),i.push(o))}return r.size===n.length},n=t=>{let n=[1,2,3,4,5,6];return Array.from({length:t},()=>n.splice(Math.floor(e()*n.length),1)[0]).sort((e,t)=>e-t)};for(;;){let r=1+Math.floor(e()*3),[i,a]=[n(2*r),n(2*r)],o=t=>t.map((e,t)=>[e,t]).sort(()=>e()-.5).map(([e])=>e),[s,c]=[o(i),o(a)],l=Array.from({length:r},(e,t)=>[Math.min(s[2*t],s[2*t+1]),Math.min(c[2*t],c[2*t+1]),Math.max(s[2*t],s[2*t+1]),Math.max(c[2*t],c[2*t+1])]),u=S(2,l,6);if(!t(u,2)||!t(u,0))continue;let d=u.flatMap((e,t)=>e.flatMap((e,n)=>e===1&&t%2==0&&n%2==0?[[t/2,n/2]]:[])),[f,p]=[d.splice(Math.floor(e()*d.length),1)[0],d[Math.floor(e()*d.length)]];return[l,f[0],f[1],p[0],p[1]]}}}};export{Z as default};