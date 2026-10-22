import{i as e}from"./layout-DFaYBMY_.js";import{a as t,c as n,i as r,r as i,s as a}from"./shared-e6uNbDLo.js";import{t as o}from"./lane-BzDhdR3X.js";import{t as s}from"./pacing-cs_sia8j.js";var c=[`X591X`,`X1X5X`,`X231X`,`1XXX1`],l=c.length,u=c[0].length,d=[[-1,0],[1,0],[0,-1],[0,1]],f=([e,t])=>`${e},${t}`,p=(e,t)=>e[0]===t[0]&&e[1]===t[1],m=([e,t])=>e>=0&&e<l&&t>=0&&t<u,h=([e,t])=>c[e][t]!==`X`,g=([e,t])=>Number(c[e][t]),_=e=>d.map(([t,n])=>[e[0]+t,e[1]+n]).filter(m),v=e=>`cell:${f(e)}`,y=([e,t])=>`(${e}, ${t})`,b=e=>`[${e.join(`, `)}]`,x=e=>e.map((e,t)=>[e,t]).sort((e,t)=>e[0]-t[0]||e[1]-t[1]).map(([,e])=>e),S=c.flatMap((e,t)=>[...e].flatMap((e,n)=>e===`X`?[]:[[t,n]])),C=[],w=[];{let e=new Set;for(let t of S){if(e.has(f(t)))continue;let n=[t];e.add(f(t));for(let t=0;t<n.length;t++)for(let r of _(n[t]))h(r)&&!e.has(f(r))&&(e.add(f(r)),n.push(r));w.push(t),C.push(n.reduce((e,t)=>e+g(t),0))}}var T=[...C].sort((e,t)=>e-t),E={python:`from collections import deque

def solution(maps):
    n, m = len(maps), len(maps[0])
    visited = [[False] * m for _ in range(n)]
    answer = []

    for i in range(n):
        for j in range(m):
            if maps[i][j] == 'X' or visited[i][j]:
                continue  # 바다이거나 이미 센 섬의 땅
            total = 0
            visited[i][j] = True
            queue = deque([(i, j)])
            while queue:
                x, y = queue.popleft()
                total += int(maps[x][y])
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and not visited[nx][ny]:
                        visited[nx][ny] = True  # 큐에 넣을 때 방문 표시
                        queue.append((nx, ny))
            answer.append(total)

    return sorted(answer) if answer else [-1]`,javascript:`function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const answer = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (maps[i][j] === 'X' || visited[i][j]) continue; // 바다이거나 이미 센 섬의 땅
      let total = 0;
      visited[i][j] = true;
      const queue = [[i, j]];
      let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
      while (head < queue.length) {
        const [x, y] = queue[head++];
        total += Number(maps[x][y]);
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && !visited[nx][ny]) {
            visited[nx][ny] = true; // 큐에 넣을 때 방문 표시
            queue.push([nx, ny]);
          }
        }
      }
      answer.push(total);
    }
  }

  return answer.length ? answer.sort((a, b) => a - b) : [-1];
}`},D={found:r(E,[`if maps[i][j] == 'X' or visited[i][j]`,`total = 0`,`visited[i][j] = True`,`queue = deque([(i, j)])`],[`if (maps[i][j] === 'X' || visited[i][j]) continue`,`let total = 0`,`visited[i][j] = true`,`const queue = [[i, j]]`]),pop:r(E,[`x, y = queue.popleft()`,`total += int(maps[x][y])`],[`const [x, y] = queue[head++]`,`total += Number(maps[x][y])`]),look:r(E,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m`]),enqueue:r(E,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m`,`visited[nx][ny] = True`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m`,`visited[nx][ny] = true`]),push:r(E,[`queue.append((nx, ny))`],[`queue.push([nx, ny])`]),next:r(E,[`while queue:`],[`while (head < queue.length)`]),record:r(E,[`answer.append(total)`],[`answer.push(total)`]),done:r(E,[`return sorted(answer) if answer else [-1]`],[`return answer.length ? answer.sort`])},O={python:`def solution(maps):
    n, m = len(maps), len(maps[0])
    visited = [[False] * m for _ in range(n)]
    answer = []
    total = 0

    def dfs(x, y):
        nonlocal total
        visited[x][y] = True
        total += int(maps[x][y])
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and not visited[nx][ny]:
                dfs(nx, ny)  # 이어진 땅으로 파고듭니다

    for i in range(n):
        for j in range(m):
            if maps[i][j] != 'X' and not visited[i][j]:
                total = 0
                dfs(i, j)
                answer.append(total)

    return sorted(answer) if answer else [-1]`,javascript:`function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const answer = [];
  let total = 0;

  const dfs = (x, y) => {
    visited[x][y] = true;
    total += Number(maps[x][y]);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && !visited[nx][ny]) {
        dfs(nx, ny); // 이어진 땅으로 파고듭니다
      }
    }
  };

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (maps[i][j] !== 'X' && !visited[i][j]) {
        total = 0;
        dfs(i, j);
        answer.push(total);
      }
    }
  }

  return answer.length ? answer.sort((a, b) => a - b) : [-1];
}`},k={found:r(O,[`if maps[i][j] != 'X' and not visited[i][j]`,`                total = 0`,`dfs(i, j)`],[`if (maps[i][j] !== 'X' && !visited[i][j])`,`        total = 0;`,`dfs(i, j)`]),enter:r(O,[`visited[x][y] = True`,`total += int(maps[x][y])`],[`visited[x][y] = true`,`total += Number(maps[x][y])`]),look:r(O,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m`]),back:r(O,[`for dx, dy in`],[`for (const [dx, dy] of`]),record:r(O,[`answer.append(total)`],[`answer.push(total)`]),done:r(O,[`return sorted(answer) if answer else [-1]`],[`return answer.length ? answer.sort`])},A={python:`# 주의: 오답이 나오는 풀이입니다 (큐에서 꺼낼 때 방문 표시를 해서 같은 칸이 큐에 두 번 들어갈 수 있습니다)
from collections import deque

def solution(maps):
    n, m = len(maps), len(maps[0])
    visited = [[False] * m for _ in range(n)]
    answer = []

    for i in range(n):
        for j in range(m):
            if maps[i][j] == 'X' or visited[i][j]:
                continue  # 바다이거나 이미 센 섬의 땅
            total = 0
            queue = deque([(i, j)])
            while queue:
                x, y = queue.popleft()
                visited[x][y] = True  # 꺼낼 때 방문 표시: 그 전에 같은 칸이 또 큐에 들어올 수 있습니다
                total += int(maps[x][y])
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and not visited[nx][ny]:
                        queue.append((nx, ny))
            answer.append(total)

    return sorted(answer) if answer else [-1]`,javascript:`// 주의: 오답이 나오는 풀이입니다 (큐에서 꺼낼 때 방문 표시를 해서 같은 칸이 큐에 두 번 들어갈 수 있습니다)
function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const answer = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (maps[i][j] === 'X' || visited[i][j]) continue; // 바다이거나 이미 센 섬의 땅
      let total = 0;
      const queue = [[i, j]];
      let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
      while (head < queue.length) {
        const [x, y] = queue[head++];
        visited[x][y] = true; // 꺼낼 때 방문 표시: 그 전에 같은 칸이 또 큐에 들어올 수 있습니다
        total += Number(maps[x][y]);
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && !visited[nx][ny]) {
            queue.push([nx, ny]);
          }
        }
      }
      answer.push(total);
    }
  }

  return answer.length ? answer.sort((a, b) => a - b) : [-1];
}`},j={found:r(A,[`if maps[i][j] == 'X' or visited[i][j]`,`total = 0`,`queue = deque([(i, j)])`],[`if (maps[i][j] === 'X' || visited[i][j]) continue`,`let total = 0`,`const queue = [[i, j]]`]),pop:r(A,[`x, y = queue.popleft()`,`visited[x][y] = True`,`total += int(maps[x][y])`],[`const [x, y] = queue[head++]`,`visited[x][y] = true`,`total += Number(maps[x][y])`]),look:r(A,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m`]),enqueue:r(A,[`for dx, dy in`,`queue.append((nx, ny))`],[`for (const [dx, dy] of`,`queue.push([nx, ny])`]),push:r(A,[`queue.append((nx, ny))`],[`queue.push([nx, ny])`]),next:r(A,[`while queue:`],[`while (head < queue.length)`]),record:r(A,[`answer.append(total)`],[`answer.push(total)`]),done:r(A,[`return sorted(answer) if answer else [-1]`],[`return answer.length ? answer.sort`])},M=330,N=392,P=e({x:14,y:58,rows:l,cols:u,cell:54,gap:8}),F=e=>P(e[0],e[1]),I={id:`lane`,x:40,y:5,slotW:64,slotH:30,gap:6,max:4},L={id:`ans`,x:40,y:351,slotW:50,slotH:30,gap:6,max:4},R={x:0,y:310,w:84,h:30},z={wall:`바다`,seen:`방문함`,new:`새 땅`,bad:`큐에 또 넣음`,good:``};function B(e){let t=[{id:`lane:label`,kind:`text`,rect:{x:0,y:0,w:34,h:40},text:e},{id:`lane:bg`,kind:`zone`,rect:{x:34,y:0,w:296,h:40}}];return c.forEach((e,n)=>[...e].forEach((e,r)=>{t.push({id:v([n,r]),kind:`cell`,rect:F([n,r]),tone:e===`X`?`wall`:`plain`,...e===`X`?{}:{text:e}})})),t.push({id:`total`,kind:`token`,rect:R,tone:`plain`,text:`섬 합 0`},{id:`ans:label`,kind:`text`,rect:{x:0,y:346,w:34,h:40},text:`답`},{id:`ans:bg`,kind:`zone`,rect:{x:34,y:346,w:296,h:40}}),{width:M,height:N,items:t}}var V=(e,t,n=!1)=>({type:`set`,id:v(e),patch:t,...n?{pop:n}:{}}),H=()=>[{type:`unfocus`},{type:`clearMarks`}],U=e=>({type:`set`,id:`total`,patch:{text:`섬 합 ${e}`},pop:!0});function W(e,t,n,r=()=>[]){e.do({type:`focus`,ids:[v(t),...n.map(e=>v(e.to))]});for(let i of n)if(e.do({type:`arrow`,from:v(t),to:v(i.to),verdict:i.verdict,label:z[i.verdict]}),i.verdict===`new`)for(let t of r(i))e.do({...t,together:!0})}var G=(e,t)=>`${t?`지도를 왼쪽 위부터 훑다가 `:`이어서 훑다가 `}${y(e)}에서 아직 안 센 땅을 만났습니다. 새 섬이라 total을 0으로 하고`,K=e=>`ans:${e}`,q=(e,t)=>({...e,variables:{...e.variables,"돌려줄 값":b(t)}});function J(e){let t=e?j:D,r=new n(B(`큐`)),l=new o(r,I),u=new o(r,L),d=c.map(e=>[...e].map(()=>!1)),m=new Set,S=[],C=[],E=0,O,k=0,A=0,M,N=e=>({work:k,variables:{"(i, j)":O?y(O):`-`,"(x, y)":e?y(e):`-`,total:E,queue:`[${S.map(e=>y(e.cell)).join(`, `)}]`,answer:b(C)}}),P=e=>({cell:e,id:`tok:${f(e)}:${++A}`}),F=e=>S.filter(t=>p(t.cell,e)).length;w.forEach((n,o)=>{O=n,E=0;let s=P(n);for(S.push(s),e||(d[n[0]][n[1]]=!0),r.step({title:`${y(n)}에서 새 섬 발견`,codeHighlights:t.found,...N()}),r.phase(`찾기`,`${G(n,o===0)} 큐에 넣습니다.`,t.found),r.do({type:`focus`,ids:[v(n)]},...a([V(n,{tone:`queued`},!0),...o?[U(0)]:[]],!0),{type:`unfocus`}),l.push({id:s.id,text:y(n)},v(n));S.length;){let{cell:n}=S.shift();k++;let o=m.has(f(n));m.add(f(n)),e&&(d[n[0]][n[1]]=!0),E+=g(n);let s=_(n).map(t=>({to:t,verdict:h(t)?d[t[0]][t[1]]?`seen`:e&&F(t)?`bad`:`new`:`wall`})),c=s.filter(e=>e.verdict===`new`||e.verdict===`bad`).map(e=>e.to),b=c.map(P);for(let t of b)e||(d[t.cell[0]][t.cell[1]]=!0);S.push(...b);let x=S.length===0;x&&C.push(E),r.step({title:o?`${y(n)} 또 꺼내기 — 합 ${E}`:c.length?`${y(n)} 꺼내고 ${c.length}칸 넣기`:`${y(n)} 꺼내기 — 넣을 칸 없음`,codeHighlights:x?t.record:c.length?t.push:t.next,...N(n)}),r.phase(`꺼내기`,o?`큐 맨 앞에서 ${i(y(n),`을`,`를`)} 또 꺼냅니다. 이미 센 칸인데 날짜 ${i(g(n),`을`,`를`)} 다시 더해, 합이 ${E}이 됩니다.`:`큐 맨 앞에서 ${i(y(n),`을`,`를`)} 꺼내${e?` 방문 표시를 하고`:``} 날짜 ${i(g(n),`을`,`를`)} 더합니다. 합은 ${E}입니다.`,t.pop),l.shift(v(n)),r.do(...a([V(n,{tone:`current`,sub:``}),U(E),...M&&!p(M,n)?[V(M,{tone:`visited`})]:[]],!0));let w=s.filter(e=>e.verdict===`bad`).map(e=>y(e.to));r.phase(`살피기`,w.length?`상하좌우 칸을 하나씩 확인합니다. ${i(w.join(`, `),`은`,`는`)} 이미 큐에 있지만 방문 표시가 없어서 또 넣을 칸이 됩니다.`:`상하좌우 칸을 하나씩 확인합니다. 바다이거나 이미 방문한 칸은 건너뛰고${c.length?e?`, 방문 표시가 없는 땅은 모두 큐에 넣습니다.`:`, 새 땅에는 방문 표시를 합니다.`:` 넘어갑니다.`}`,c.length?t.enqueue:t.look),W(r,n,s,e=>[V(e.to,{tone:`queued`},!0)]);for(let e of s.filter(e=>e.verdict===`bad`))r.do({...V(e.to,{sub:`${F(e.to)}번`},!0),together:!0});r.phase(`넣기`,c.length?`${w.length?`중복이어도 `:e?`방문 표시가 아직 없어서 `:`새로 찾은 `}${i(c.map(y).join(`, `),`을`,`를`)} 큐 뒤에 넣습니다.`:`새로 넣을 칸이 없어 그대로 넘어갑니다.`,c.length?t.push:t.next),b.length?b.forEach((e,t)=>{l.push({id:e.id,text:y(e.cell)},v(e.cell)),t||r.do(...a(H(),!0))}):r.do(...a(H())),M=n,x&&(r.phase(`기록하기`,`큐가 비어 이 섬이 끝났습니다. 합 ${i(E,`을`,`를`)} answer에 담습니다.`,t.record),r.do(V(n,{tone:`visited`})),u.push({id:K(C.length-1),text:String(E)},`total`),O=void 0)}});let R=x(C),z=R.map(e=>C[e]);return r.step({title:`답 정렬 — ${b(z)}`,codeHighlights:t.done,...q(N(),z),answer:z,isKeyframe:!0}),r.phase(`정렬하기`,`answer를 오름차순으로 정렬하면 ${i(b(z),`이`,`가`)} 됩니다.`,t.done),u.reorder(R.map(K)),e&&(r.phase(`오답 확인`,`정답은 ${b(T)}인데 ${i(b(z),`이`,`가`)} 나왔습니다. 큐에 든 칸을 또 넣어 날짜를 두 번 더했기 때문입니다.`),r.do({type:`add`,item:{id:`mine`,kind:`token`,rect:{x:92,y:310,w:114,h:30},tone:`bad`,text:`내 답 ${z.join(`,`)}`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:212,y:310,w:114,h:30},tone:`good`,text:`정답 ${T.join(`,`)}`},together:!0})),s(r.finish())}function Y(){let e=c.map(e=>[...e].map(()=>!1)),t=[],n=0,r,i=(a,o)=>{e[a[0]][a[1]]=!0,n+=g(a),r={kind:`enter`,cell:a,parent:o,looks:[],total:n},t.push(r);for(let o of _(a))h(o)?e[o[0]][o[1]]?r.looks.push({to:o,verdict:`seen`}):(r.looks.push({to:o,verdict:`new`}),i(o,a),r={kind:`return`,cell:o,parent:a,looks:[],total:n},t.push(r)):r.looks.push({to:o,verdict:`wall`})};for(let r of S)e[r[0]][r[1]]||(n=0,i(r),t.push({kind:`return`,cell:r,looks:[],total:n}));return t}function X(){let e=new n(B(`스택`)),r=new o(e,{...I,foldable:!0}),c=new o(e,L),l=[],u=[],d=0,p=0,m=0,h,_=()=>({work:p,workNote:`재귀 깊이 최대 ${m}`,variables:{"(i, j)":h?y(h):`-`,"(x, y)":l.length?y(l.at(-1)):`-`,total:d,answer:b(u)}}),S=e=>({id:`frame:${f(e)}`,text:y(e)}),C=e=>`${e.map((t,n)=>{let r=n===e.length-1,a=(e,n,r)=>i(y(t.to),n,r)+e;return t.verdict===`wall`?a(r?` 바다라 건너뜁니다`:` 바다이고`,`은`,`는`):t.verdict===`seen`?a(r?` 이미 방문해 건너뜁니다`:` 이미 방문했고`,`은`,`는`):a(` 아직 안 간 땅이라 들어갑니다`,`은`,`는`)}).join(`, `)}.`,w=Y(),T=[];for(let e of w){let t=T.at(-1)?.at(-1);e.kind===`return`&&t?.kind===`return`&&t.parent!==void 0&&!t.looks.some(e=>e.verdict===`new`)&&T.at(-1).length<3?T.at(-1).push(e):T.push([e])}T.forEach(n=>{let[o]=n;if(o.kind===`enter`){let{cell:t,parent:n,looks:s}=o,c=n===void 0;l.push(t),p++,m=Math.max(m,l.length),d=o.total,c&&(h=t),e.step({title:c?`${y(t)}에서 새 섬 발견`:`${y(t)} 들어가기`,codeHighlights:s.length?k.look:k.enter,..._()}),c&&(e.phase(`찾기`,`${G(t,u.length===0)} dfs로 들어갑니다.`,k.found),e.do({type:`focus`,ids:[v(t)]},...u.length?[{...U(0),together:!0}]:[],{type:`unfocus`})),e.phase(`들어가기`,c?`방문 표시를 하고 날짜 ${i(g(t),`을`,`를`)} 더합니다. 합은 ${d}입니다.`:`${y(n)}에서 이어진 ${y(t)}에 들어갑니다. 방문 표시를 하고 날짜 ${i(g(t),`을`,`를`)} 더해 합은 ${d}입니다.`,k.enter),e.do(...a([V(t,{tone:`current`},!0),U(d),...n?[V(n,{tone:`trail`})]:[]])),r.push(S(t),v(t)),s.length&&(e.phase(`살피기`,`상하좌우 칸을 차례로 봅니다. ${C(s)}`,k.look),W(e,t,s))}else{let o=n.at(-1),s=o.parent===void 0,f=o.looks.some(e=>e.verdict===`new`);n.forEach(()=>l.pop()),s&&u.push(d),e.step({title:s?`${y(o.cell)} 끝 — 섬 합 ${d}`:`${n.map(e=>y(e.cell)).join(`, `)} 끝, ${t(y(o.parent))} 돌아가기`,codeHighlights:s?k.record:f?k.look:k.back,..._()}),e.phase(`돌아가기`,s?`${y(o.cell)}까지 모두 돌아와 이 섬을 끝냅니다.`:`더 갈 땅이 없어 ${n.map(e=>y(e.cell)).join(`, `)}에서 ${t(y(o.parent))} 돌아갑니다.`,k.back);for(let t of n)r.pop(v(t.cell)),e.do(...a([V(t.cell,{tone:`visited`}),...t.parent?[V(t.parent,{tone:`current`})]:[]],!0));f&&(e.phase(`살피기`,`${y(o.parent)}에서 이어서 봅니다. ${C(o.looks)}`,k.look),W(e,o.parent,o.looks)),s&&(e.phase(`기록하기`,`맨 위 호출이 끝났으니 합 ${i(d,`을`,`를`)} answer에 담습니다.`,k.record),c.push({id:K(u.length-1),text:String(d)},`total`),h=void 0)}});let E=x(u),D=E.map(e=>u[e]);return e.step({title:`답 정렬 — ${b(D)}`,codeHighlights:k.done,...q(_(),D),answer:D,isKeyframe:!0}),e.phase(`정렬하기`,`answer를 오름차순으로 정렬하면 ${i(b(D),`이`,`가`)} 됩니다.`,k.done),c.reorder(E.map(K)),s(e.finish())}var Z={id:`island-trip`,title:`무인도 여행`,level:2,category:`dfs-bfs`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/154540`,description:{summary:`지도에서 X는 바다이고 숫자 1~9는 땅입니다. 상하좌우로 이어진 땅이 한 섬이고, 숫자는 그 칸에서 머물 수 있는 날짜입니다. 섬마다 머물 수 있는 날짜의 합을 구해 오름차순으로 돌려주고, 섬이 하나도 없으면 [-1]을 돌려줍니다.`,rules:[`maps의 가로·세로 길이는 3 이상 100 이하`,`maps[i]는 X 또는 1~9의 숫자로 이루어진 문자열`,`지도는 직사각형 모양`,`섬이 없으면 [-1] 반환`],examples:[{input:`maps = ["X591X","X1X5X","X231X", "1XXX1"]`,output:`[1, 1, 27]`},{input:`maps = ["XXX","XXX","XXX"]`,output:`[-1]`}]},keyIntuitions:[`"이어진 땅 덩어리마다 합을 구하라"는 문제는 땅 칸을 하나씩 훑다가 아직 안 센 땅을 만나면 BFS나 DFS로 그 섬 전체를 한 번에 센다는 뜻입니다.`,`방문 표시를 큐에 넣을 때 해야 같은 칸이 큐에 두 번 들어가지 않습니다. 꺼낼 때 하면 큐에 든 칸을 또 넣어 날짜를 두 번 더할 수 있습니다.`,`섬을 찾는 순서는 지도를 훑는 순서라서 합이 작은 순서가 아닙니다. 마지막에 오름차순으로 정렬하고, 섬이 없을 때만 [-1]을 돌려줍니다.`],demo:{input:[c],label:`maps = 예제 1 ["X591X","X1X5X","X231X","1XXX1"]`},workUnit:`칸을 방문한 횟수`,approaches:[{id:`island-bfs`,name:`너비 우선 탐색 (BFS 영역 나누기)`,rank:`BEST`,timeComplexity:`O(N × M + K log K)`,spaceComplexity:`O(N × M)`,verdict:`아직 안 센 땅에서 BFS로 섬 하나를 통째로 세는 영역 나누기의 표준 풀이입니다.`,pros:[`큐에 넣을 때 방문 표시를 해 땅 칸을 정확히 한 번씩만 방문합니다.`,`재귀가 없어 100 × 100 지도에서도 재귀 한도를 걱정할 필요가 없습니다.`,`지도를 한 번 훑는 반복문과 BFS 한 개로 영역 나누기가 끝납니다.`],cons:[`섬이 K개면 합을 정렬하는 일이 따로 필요합니다.`,`큐와 방문 표시 배열에 지도 크기만큼 메모리가 필요합니다.`],whyThisRank:`이어진 땅을 한 덩어리씩 묶는 문제에는 BFS가 가장 안전합니다. 칸마다 한 번만 보고, 지도가 커져도 재귀 걱정이 없습니다.`,code:E,visualize:()=>J(!1)},{id:`island-dfs`,name:`깊이 우선 탐색 (DFS 영역 나누기)`,rank:`ALTERNATIVE`,timeComplexity:`O(N × M + K log K)`,spaceComplexity:`O(N × M) 재귀 깊이`,verdict:`답과 방문 횟수는 같지만 재귀가 깊어질 수 있는 풀이입니다.`,pros:[`재귀로 "이어진 땅으로 파고들기"를 짧게 쓸 수 있습니다.`,`땅 칸마다 한 번씩만 방문해 BFS와 일의 양이 같습니다.`],cons:[`섬이 길게 이어지면 재귀가 깊어집니다. 100 × 100 지도에서 한 섬이 지도 전체를 구불구불 채우면 깊이가 최대 10,000이라 Python 기본 재귀 한도(1,000)를 넘어 RecursionError가 납니다.`,`합을 바깥 변수 total에 더하는 방식이라 섬마다 0으로 되돌리는 것을 잊기 쉽습니다.`],whyThisRank:`맞게 풀고 일의 양도 같지만, 지도가 커지면 재귀 깊이가 위험해 BFS가 더 안전합니다. 시험에서 재귀 한도를 따로 올려야 하는 부담이 생깁니다.`,code:O,visualize:X},{id:`island-wrong`,name:`BFS (꺼낼 때 방문 표시)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N × M + K log K)`,spaceComplexity:`O(N × M)`,verdict:`정석과 한 줄만 다른데, 같은 칸을 두 번 세어 합이 틀립니다.`,pros:[`방문 표시를 꺼낼 때 하니 코드가 자연스러워 보입니다.`],cons:[`꺼낼 때까지 방문 표시가 없어서, 큐에 든 칸을 다른 이웃이 또 큐에 넣을 수 있습니다. 시각화 입력에서는 (2, 3)이 큐에 두 번 들어가 1을 두 번 더하고 27 대신 28이 나옵니다.`,`틀리는 칸이 섬 모양에 따라 달라서, 예제는 통과하고 채점에서 떨어지기 쉽습니다.`],whyThisRank:`BFS에서 방문 표시는 큐에 넣는 순간 해야 합니다. 꺼낼 때 하면 큐에 중복이 생기고, 칸마다 값을 더하는 이 문제에서는 합이 틀립니다.`,code:A,visualize:()=>J(!0)}],checks:{cases:[{args:[[`X591X`,`X1X5X`,`X231X`,`1XXX1`]],expected:[1,1,27]},{args:[[`XXX`,`XXX`,`XXX`]],expected:[-1]},{args:[[`XXX`,`X5X`,`XXX`]],expected:[5]},{args:[[`X1X`,`1X1`,`X1X`]],expected:[1,1,1,1]},{args:[[`999`,`999`,`999`]],expected:[81]},{args:[c],expected:T}],random:e=>{let[t,n]=[3+Math.floor(e()*4),3+Math.floor(e()*4)];return[Array.from({length:t},()=>Array.from({length:n},()=>e()<.45?`X`:String(1+Math.floor(e()*9))).join(``))]}}};export{Z as default};