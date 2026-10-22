import{i as e}from"./layout-DFaYBMY_.js";import{a as t,c as n,i as r,l as i,n as a,r as o}from"./shared-CL29HWIp.js";import{t as s}from"./lane-BzDhdR3X.js";import{t as c}from"./pacing-CRi5IfsT.js";var l=[[0,0,0,1,1,1,0,0],[0,0,0,0,1,1,0,0],[1,1,0,0,0,1,1,0],[1,1,1,0,0,0,0,0],[1,1,1,0,0,0,1,1]],u=l.length,d=l[0].length,f=[[-1,0],[1,0],[0,-1],[0,1]],p=([e,t])=>`${e},${t}`,m=([e,t])=>e>=0&&e<u&&t>=0&&t<d,h=([e,t])=>l[e][t]===1,g=e=>f.map(([t,n])=>[e[0]+t,e[1]+n]).filter(m),_=e=>`cell:${p(e)}`,v=e=>`[${e.join(`, `)}]`,y=[];{let e=new Set;l.forEach((t,n)=>t.forEach((t,r)=>{if(!t||e.has(p([n,r])))return;let i=[[n,r]];e.add(p([n,r]));for(let t=0;t<i.length;t++)for(let n of g(i[t]))h(n)&&!e.has(p(n))&&(e.add(p(n)),i.push(n));y.push({start:[n,r],cells:i,cols:[...new Set(i.map(e=>e[1]))].sort((e,t)=>e-t)})}))}var b=Array.from({length:d},(e,t)=>y.filter(e=>e.cols.includes(t)).reduce((e,t)=>e+t.cells.length,0)),x=Array.from({length:d},(e,t)=>y.reduce((e,n)=>e+n.cells.length*n.cells.filter(e=>e[1]===t).length,0)),S=Math.max(...b),C=Math.max(...x),w={python:`from collections import deque

def solution(land):
    n, m = len(land), len(land[0])
    visited = [[False] * m for _ in range(n)]
    total = [0] * m  # 열마다 뽑을 수 있는 석유량

    for i in range(n):
        for j in range(m):
            if land[i][j] == 0 or visited[i][j]:
                continue  # 석유가 없거나 이미 센 덩어리
            size = 0
            cols = set()  # 이 덩어리가 걸친 열
            visited[i][j] = True
            queue = deque([(i, j)])
            while queue:
                x, y = queue.popleft()
                size += 1
                cols.add(y)
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < m and land[nx][ny] == 1 and not visited[nx][ny]:
                        visited[nx][ny] = True
                        queue.append((nx, ny))
            for y in cols:
                total[y] += size  # 덩어리 크기를 걸친 열마다 한 번씩만 더합니다

    return max(total)`,javascript:`function solution(land) {
  const n = land.length;
  const m = land[0].length;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const total = Array(m).fill(0); // 열마다 뽑을 수 있는 석유량

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (land[i][j] === 0 || visited[i][j]) continue; // 석유가 없거나 이미 센 덩어리
      let size = 0;
      const cols = new Set(); // 이 덩어리가 걸친 열
      visited[i][j] = true;
      const queue = [[i, j]];
      let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
      while (head < queue.length) {
        const [x, y] = queue[head++];
        size++;
        cols.add(y);
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < m && land[nx][ny] === 1 && !visited[nx][ny]) {
            visited[nx][ny] = true;
            queue.push([nx, ny]);
          }
        }
      }
      for (const y of cols) total[y] += size; // 덩어리 크기를 걸친 열마다 한 번씩만 더합니다
    }
  }

  return Math.max(...total);
}`},T={found:r(w,[`if land[i][j] == 0 or visited[i][j]`,`size = 0`,`cols = set()`,`visited[i][j] = True`,`queue = deque([(i, j)])`],[`if (land[i][j] === 0 || visited[i][j]) continue`,`let size = 0`,`const cols = new Set()`,`visited[i][j] = true`,`const queue = [[i, j]]`]),pop:r(w,[`x, y = queue.popleft()`,`size += 1`,`cols.add(y)`],[`const [x, y] = queue[head++]`,`size++`,`cols.add(y)`]),look:r(w,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m and land[nx][ny] == 1`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m && land[nx][ny] === 1`]),mark:r(w,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m and land[nx][ny] == 1`,`visited[nx][ny] = True`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m && land[nx][ny] === 1`,`visited[nx][ny] = true`]),push:r(w,[`queue.append((nx, ny))`],[`queue.push([nx, ny])`]),next:r(w,[`while queue:`],[`while (head < queue.length)`]),add:r(w,[`for y in cols`,`total[y] += size`],[`for (const y of cols) total[y] += size`]),done:r(w,[`return max(total)`],[`return Math.max(...total)`])},E={python:`from collections import deque

def solution(land):
    n, m = len(land), len(land[0])
    best = 0

    for col in range(m):  # 시추관을 꽂을 열을 하나씩 해 봅니다
        visited = [[False] * m for _ in range(n)]  # 열마다 방문 표시를 새로 만듭니다
        oil = 0
        for row in range(n):
            if land[row][col] == 0 or visited[row][col]:
                continue  # 석유가 없거나 이미 센 덩어리
            visited[row][col] = True
            queue = deque([(row, col)])
            while queue:  # 이 열에 닿은 덩어리의 크기를 BFS로 셉니다
                x, y = queue.popleft()
                oil += 1
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < m and land[nx][ny] == 1 and not visited[nx][ny]:
                        visited[nx][ny] = True
                        queue.append((nx, ny))
        best = max(best, oil)

    return best`,javascript:`function solution(land) {
  const n = land.length;
  const m = land[0].length;
  let best = 0;

  for (let col = 0; col < m; col++) { // 시추관을 꽂을 열을 하나씩 해 봅니다
    const visited = Array.from({ length: n }, () => Array(m).fill(false)); // 열마다 방문 표시를 새로 만듭니다
    let oil = 0;
    for (let row = 0; row < n; row++) {
      if (land[row][col] === 0 || visited[row][col]) continue; // 석유가 없거나 이미 센 덩어리
      visited[row][col] = true;
      const queue = [[row, col]];
      let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
      while (head < queue.length) { // 이 열에 닿은 덩어리의 크기를 BFS로 셉니다
        const [x, y] = queue[head++];
        oil++;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < m && land[nx][ny] === 1 && !visited[nx][ny]) {
            visited[nx][ny] = true;
            queue.push([nx, ny]);
          }
        }
      }
    }
    best = Math.max(best, oil);
  }

  return best;
}`},D={drill:r(E,[`for col in range(m)`,`visited = [[False] * m for _ in range(n)]`,`oil = 0`],[`for (let col = 0; col < m; col++)`,`const visited = Array.from`,`let oil = 0`]),count:r(E,[`for row in range(n)`,`if land[row][col] == 0 or visited[row][col]`,`while queue:`,`oil += 1`],[`for (let row = 0; row < n; row++)`,`if (land[row][col] === 0 || visited[row][col]) continue`,`while (head < queue.length)`,`oil++`]),best:r(E,[`best = max(best, oil)`],[`best = Math.max(best, oil)`]),done:r(E,[`return best`],[`return best`])},O={python:`# 주의: 오답이 나오는 풀이입니다 (한 열에서 같은 덩어리를 칸마다 여러 번 더합니다)
from collections import deque

def solution(land):
    n, m = len(land), len(land[0])
    comp = [[-1] * m for _ in range(n)]  # 칸이 속한 덩어리 번호
    sizes = []  # 덩어리마다 크기

    for i in range(n):
        for j in range(m):
            if land[i][j] == 0 or comp[i][j] != -1:
                continue  # 석유가 없거나 이미 번호를 붙인 덩어리
            comp[i][j] = len(sizes)
            queue = deque([(i, j)])
            size = 0
            while queue:
                x, y = queue.popleft()
                size += 1
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < m and land[nx][ny] == 1 and comp[nx][ny] == -1:
                        comp[nx][ny] = len(sizes)
                        queue.append((nx, ny))
            sizes.append(size)

    best = 0
    for col in range(m):
        oil = 0
        for row in range(n):
            if land[row][col] == 1:
                oil += sizes[comp[row][col]]  # 같은 덩어리를 칸마다 더해 버립니다
        best = max(best, oil)
    return best`,javascript:`// 주의: 오답이 나오는 풀이입니다 (한 열에서 같은 덩어리를 칸마다 여러 번 더합니다)
function solution(land) {
  const n = land.length;
  const m = land[0].length;
  const comp = Array.from({ length: n }, () => Array(m).fill(-1)); // 칸이 속한 덩어리 번호
  const sizes = []; // 덩어리마다 크기

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (land[i][j] === 0 || comp[i][j] !== -1) continue; // 석유가 없거나 이미 번호를 붙인 덩어리
      comp[i][j] = sizes.length;
      const queue = [[i, j]];
      let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
      let size = 0;
      while (head < queue.length) {
        const [x, y] = queue[head++];
        size++;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < m && land[nx][ny] === 1 && comp[nx][ny] === -1) {
            comp[nx][ny] = sizes.length;
            queue.push([nx, ny]);
          }
        }
      }
      sizes.push(size);
    }
  }

  let best = 0;
  for (let col = 0; col < m; col++) {
    let oil = 0;
    for (let row = 0; row < n; row++) {
      if (land[row][col] === 1) oil += sizes[comp[row][col]]; // 같은 덩어리를 칸마다 더해 버립니다
    }
    best = Math.max(best, oil);
  }
  return best;
}`},k={label:r(O,[`comp[i][j] = len(sizes)`,`queue = deque([(i, j)])`,`sizes.append(size)`],[`comp[i][j] = sizes.length`,`const queue = [[i, j]]`,`sizes.push(size)`]),column:r(O,[`for col in range(m)`,`if land[row][col] == 1`,`oil += sizes[comp[row][col]]`],[`for (let col = 0; col < m; col++)`,`if (land[row][col] === 1) oil += sizes[comp[row][col]]`]),best:r(O,[`best = max(best, oil)`],[`best = Math.max(best, oil)`]),done:r(O,[`return best`],[`return best`])},A=546,j=410,M=e({x:44,y:58,rows:u,cols:d,cell:54,gap:8}),N=e=>M(0,e).x,P={id:`lane`,x:50,y:5,slotW:64,slotH:30,gap:6,max:6},F={wall:`빈 땅`,seen:`방문함`,new:`새 칸`},I=e=>({x:N(e)-4,y:50,w:62,h:318}),L=(e,t,n=!1)=>({type:`set`,id:_(e),patch:t,...n?{pop:n}:{}}),R=(e,t)=>({type:`set`,id:`col:${e}`,patch:{text:String(t)},pop:!0}),z=e=>({type:`wait`,ms:e});function B(e){let t=[];e.lane&&t.push({id:`lane:label`,kind:`text`,rect:{x:0,y:0,w:34,h:40},text:`큐`},{id:`lane:bg`,kind:`zone`,rect:{x:34,y:0,w:512,h:40}}),e.drill&&t.push({id:`drill`,kind:`zone`,rect:I(0)}),l.forEach((e,n)=>e.forEach((e,r)=>t.push({id:_([n,r]),kind:`cell`,rect:M(n,r),tone:e?`plain`:`muted`}))),t.push({id:`total:label`,kind:`text`,rect:{x:0,y:372,w:40,h:30},text:`열 합`});for(let e=0;e<d;e++)t.push({id:`col:${e}`,kind:`token`,rect:{x:N(e),y:372,w:54,h:30},tone:`plain`,text:`0`});return e.best&&t.push({id:`best`,kind:`token`,rect:{x:50,y:5,w:90,h:30},tone:`plain`,text:`best 0`}),{width:A,height:j,items:t}}var V=e=>e.map(a).join(`, `);function H(){let e=new i(B({lane:!0})),r=new s(e,P),u=l.map(e=>e.map(()=>!1)),f=[],m=Array(d).fill(0),b=0,x=[],C,w=0,E,D=e=>({work:w,variables:{"(i, j)":C?a(C):`-`,"(x, y)":e?a(e):`-`,size:b,cols:`{${x.join(`, `)}}`,queue:`[${f.map(a).join(`, `)}]`,total:v(m)}}),O=e=>({id:`tok:${p(e)}`,text:a(e)});y.forEach(({start:i},s)=>{for(C=i,b=0,x=[],u[i[0]][i[1]]=!0,f.push(i),E=void 0,e.step({title:`${a(i)}에서 새 덩어리 발견`,codeHighlights:T.found,...D()}),e.phase(`찾기`,`${s===0?`땅을 왼쪽 위부터 훑다가`:`이어서 훑다가`} ${a(i)}에서 아직 안 센 석유를 만났습니다. 새 덩어리라 size를 0으로 하고 큐에 넣습니다.`,T.found),e.do({type:`focus`,ids:[_(i)]},{...L(i,{tone:`queued`},!0),together:!0},{type:`unfocus`}),r.push(O(i),_(i));f.length;){let i=f.shift();w++,b++,x.includes(i[1])||(x=[...x,i[1]].sort((e,t)=>e-t));let s=g(i).map(e=>({to:e,verdict:h(e)?u[e[0]][e[1]]?`seen`:`new`:`wall`})),c=s.filter(e=>e.verdict===`new`).map(e=>e.to);for(let e of c)u[e[0]][e[1]]=!0,f.push(e);let l=f.length===0;if(l)for(let e of x)m[e]+=b;e.step({title:c.length?`${a(i)} 꺼내고 ${c.length}칸 넣기`:`${a(i)} 꺼내기 — 넣을 칸 없음`,codeHighlights:l?T.add:c.length?T.push:T.next,...D(i)}),e.phase(`꺼내기`,`큐 맨 앞에서 ${o(a(i),`을`,`를`)} 꺼내 size를 ${t(b)} 늘리고, ${i[1]}열을 cols에 담습니다.`,T.pop),r.shift(_(i)),e.do(...n([L(i,{tone:`current`,text:String(b)},!0),...E?[L(E,{tone:`visited`})]:[]],!0)),e.phase(`살피기`,`상하좌우 칸을 하나씩 확인합니다. 석유가 없거나 이미 방문한 칸은 건너뛰고${c.length?`, 새 석유 칸에는 방문 표시를 합니다.`:` 넘어갑니다.`}`,c.length?T.mark:T.look),e.do({type:`focus`,ids:[_(i),...s.map(e=>_(e.to))]});for(let t of s)e.do({type:`arrow`,from:_(i),to:_(t.to),verdict:t.verdict,label:F[t.verdict]}),t.verdict===`new`&&e.do({...L(t.to,{tone:`queued`},!0),together:!0});e.phase(`넣기`,c.length?`새로 찾은 ${o(V(c),`을`,`를`)} 큐 뒤에 넣습니다.`:`새로 넣을 칸이 없어 그대로 넘어갑니다.`,c.length?T.push:T.next);let d=[{type:`unfocus`},{type:`clearMarks`}];c.length?c.forEach((t,i)=>{r.push(O(t),_(t)),i||e.do(...n(d,!0))}):e.do(...n(d)),E=i,l&&(e.phase(`열에 더하기`,`큐가 비어 덩어리가 끝났습니다. 크기 ${o(b,`을`,`를`)} 걸친 열 ${x.join(`, `)}에 한 번씩만 더합니다.`,T.add),e.do(...n([L(i,{tone:`visited`}),...x.map(e=>R(e,m[e]))])),C=void 0)}});let k=m.indexOf(S);return e.step({title:`가장 큰 열 ${k} — ${S}`,codeHighlights:T.done,...D(),answer:S,isKeyframe:!0}),e.phase(`최댓값 고르기`,`열마다의 석유량 ${v(m)}에서 가장 큰 값은 ${k}열의 ${S}입니다.`,T.done),e.do({type:`set`,id:`col:${k}`,patch:{tone:`good`},pop:!0}),c(e.finish())}function U(){let e=new i(B({drill:!0,best:!0})),t=0,r=0,a=[],s=(e,n)=>({work:t,variables:{col:e,oil:n,best:r}});for(let i=0;i<d;i++){let c=y.filter(e=>e.cols.includes(i)),l=c.reduce((e,t)=>e+t.cells.length,0);t+=l;let u=r;r=Math.max(r,l),e.step({title:`${i}열에 시추 — ${l}`,codeHighlights:D.best,...s(i,l)}),e.phase(`시추하기`,`${i}열에 시추관을 꽂습니다. 방문 표시를 새로 만들고 oil을 0으로 합니다.`,D.drill),e.do(...n([{type:`set`,id:`drill`,patch:{rect:I(i)}},...a.map(e=>L(e,{tone:`plain`,text:``}))])),a=c.flatMap(e=>e.cells),e.phase(`덩어리 세기`,c.length===0?`이 열에는 석유가 없어 oil은 0입니다.`:c.length===1?`이 열에 닿은 덩어리는 하나입니다. BFS로 ${l}칸을 세어 oil이 ${l}입니다.`:`이 열에 닿은 덩어리 ${c.length}개를 BFS로 차례로 세어 ${c.map(e=>e.cells.length).join(` + `)} = ${l}입니다.`,D.count),e.do(...n(a.map(e=>L(e,{tone:`queued`},!0)))),e.phase(`best 갱신`,l>u?`oil ${o(l,`이`,`가`)} 지금까지의 best ${u}보다 커서 best를 ${r}로 바꿉니다.`:`oil ${o(l,`은`,`는`)} best ${r}보다 크지 않아 그대로입니다.`,D.best),e.do(...n([R(i,l),{type:`set`,id:`best`,patch:{text:`best ${r}`},pop:!0}]))}let l=b.indexOf(S);return e.step({title:`가장 큰 열 ${l} — ${S}`,codeHighlights:D.done,...s(`-`,`-`),answer:r,isKeyframe:!0}),e.phase(`결과 확인`,`모든 열을 해 본 뒤 가장 큰 값 ${r}를 돌려줍니다. 칸을 ${t}번 훑었는데, 정석은 석유 ${y.reduce((e,t)=>e+t.cells.length,0)}칸을 한 번씩만 훑습니다.`,D.done),e.do(...n([{type:`set`,id:`col:${l}`,patch:{tone:`good`},pop:!0},{type:`set`,id:`best`,patch:{tone:`good`}}])),c(e.finish())}function W(){let e=new i(B({drill:!0})),t=0,r=0,s=[],l=new Map,u=new Map,f=[],m=(e,n)=>({work:t,variables:{col:e,oil:n,best:r,sizes:v(s)}});y.forEach(({start:r,cells:i},c)=>{t+=i.length,s.push(i.length);for(let e of i)l.set(p(e),i.length),u.set(p(e),c);e.step({title:`덩어리 ${c} — 크기 ${i.length}`,codeHighlights:k.label,...m(`-`,`-`)}),e.phase(`번호 붙이기`,`${a(r)}에서 BFS로 이어진 석유 ${i.length}칸에 덩어리 번호 ${o(c,`을`,`를`)} 붙이고 sizes에 크기 ${o(i.length,`을`,`를`)} 담습니다.`,k.label),e.do({type:`focus`,ids:i.map(_)},...n(i.map(e=>L(e,{tone:`visited`,text:String(i.length)},!0)),!0),z(150),{type:`unfocus`})});for(let t=0;t<d;t++){let i=y.flatMap(e=>e.cells.filter(e=>e[1]===t)).sort((e,t)=>e[0]-t[0]),a=i.reduce((e,t)=>e+l.get(p(t)),0);r=Math.max(r,a),e.step({title:`${t}열 훑기 — ${a}`,codeHighlights:k.column,...m(t,a)});let o=i.map(e=>l.get(p(e))),s=i.length>new Set(i.map(e=>u.get(p(e)))).size;e.phase(`열 훑기`,i.length===0?`${t}열에는 석유가 없어 oil은 0입니다.`:`${t}열을 위에서 아래로 훑으며 석유 칸을 만날 때마다 그 칸 덩어리의 크기를 더합니다. ${i.length===1?`oil은 ${a}`:`${o.join(` + `)} = ${a}`}입니다.${s?` 같은 덩어리를 여러 번 더했습니다.`:``}`,k.column),e.do({type:`set`,id:`drill`,patch:{rect:I(t)}},...n([...f.map(e=>L(e,{tone:`visited`})),...i.map(e=>L(e,{tone:`bad`})),R(t,a)],!0)),f=i}let h=x.indexOf(C);return e.step({title:`내 답 ${r}, 정답은 ${S}`,codeHighlights:k.done,...m(`-`,`-`),answer:r,isKeyframe:!0}),e.phase(`오답 확인`,`가장 큰 열은 ${h}열의 ${r}입니다. 하지만 한 덩어리는 한 열에서 한 번만 세어야 해서 정답은 ${S}입니다.`,k.done),e.do(...n([{type:`set`,id:`col:${h}`,patch:{tone:`bad`},pop:!0}])),e.do({type:`add`,item:{id:`mine`,kind:`token`,rect:{x:50,y:5,w:110,h:30},tone:`bad`,text:`내 답 ${r}`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:168,y:5,w:110,h:30},tone:`good`,text:`정답 ${S}`},together:!0}),c(e.finish())}var G={id:`oil-drilling`,title:`석유 시추`,level:2,category:`dfs-bfs`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/250136`,description:{summary:`땅 속 석유가 격자로 주어집니다(1은 석유, 0은 빈 땅). 상하좌우로 이어진 석유는 하나의 덩어리입니다. 시추관을 세로로 한 열에만 꽂을 수 있고, 그 열이 지나는 덩어리의 석유를 모두 얻습니다. 얻을 수 있는 가장 많은 석유의 양을 구합니다.`,rules:[`land는 n × m 격자이고 n, m은 1 이상 500 이하(정확성 테스트는 100 이하)`,`각 칸은 0(빈 땅) 또는 1(석유)`,`상하좌우로 이어진 석유가 하나의 덩어리이고, 덩어리의 석유는 모두 뽑힘`,`시추관은 세로로 한 열에만 꽂을 수 있음`],examples:[{input:`land = [[0,0,0,1,1,1,0,0],[0,0,0,0,1,1,0,0],[1,1,0,0,0,1,1,0],[1,1,1,0,0,0,0,0],[1,1,1,0,0,0,1,1]]`,output:`9`},{input:`land = [[1,0,1,0,1,1],[1,0,1,0,0,0],[1,0,1,0,0,1],[1,0,0,1,0,0],[1,0,0,1,0,1],[1,0,0,0,0,0],[1,1,1,1,1,1]]`,output:`16`}]},keyIntuitions:[`열마다 BFS를 새로 하면 같은 덩어리를 걸친 열의 수만큼 다시 셉니다. 덩어리를 BFS로 한 번만 찾아 "크기와 걸친 열"을 적어 두면 땅 전체를 한 번만 훑으면 됩니다.`,`덩어리의 크기는 걸친 열마다 한 번씩만 더합니다. 한 열에서 같은 덩어리의 칸이 여러 개여도 덩어리는 하나라서, 걸친 열을 set으로 모읍니다.`,`모든 덩어리를 열에 더한 뒤 열별 합의 최댓값이 답입니다. 500 × 500 효율성 테스트에서는 열마다 BFS(최대 약 1억 2,500만 번)가 시간 초과가 납니다.`],demo:{input:[l],label:`land = 예제 1 (5×8)`},workUnit:`칸을 훑은 횟수`,approaches:[{id:`oil-bfs`,name:`너비 우선 탐색 (덩어리 나누기 + 열 합산)`,rank:`BEST`,timeComplexity:`O(N × M)`,spaceComplexity:`O(N × M)`,verdict:`덩어리를 BFS로 한 번만 찾아 크기를 걸친 열에 더하고 열별 최댓값을 고르는 표준 풀이입니다.`,pros:[`석유 칸을 한 번씩만 훑어서 500 × 500 효율성 테스트도 충분히 빠릅니다.`,`덩어리마다 걸친 열을 set으로 모아 한 열에 한 번씩만 더하므로 같은 덩어리를 두 번 세지 않습니다.`,`재귀가 없어 땅이 커도 재귀 한도를 걱정할 필요가 없습니다.`],cons:[`열마다 석유량을 담는 배열과 방문 표시 배열이 따로 필요합니다.`],whyThisRank:`"덩어리마다 한 번 구하고 열에 나눠 더한다"가 이 문제의 핵심입니다. 열마다 처음부터 세는 것보다 훨씬 적게 일하고, 방문 표시 한 겹으로 모든 것이 끝납니다.`,code:w,visualize:H},{id:`oil-columns`,name:`열마다 BFS (완전 탐색)`,rank:`ALTERNATIVE`,timeComplexity:`O(N × M²)`,spaceComplexity:`O(N × M)`,verdict:`정답은 나오지만 열마다 덩어리를 처음부터 다시 세어 효율성 테스트에서 시간 초과가 납니다.`,pros:[`문제를 읽은 그대로 옮긴 가장 직관적인 풀이라 틀리기 어렵습니다.`,`땅이 작은 정확성 테스트(100 × 100)는 통과합니다.`],cons:[`같은 덩어리를 걸친 열마다 다시 세서, 시각화 입력에서는 칸을 56번 훑는데 정석은 17번이면 끝납니다.`,`500 × 500 효율성 테스트에서는 열마다 최대 25만 칸을 훑어 약 1억 2,500만 번이라 시간 초과가 납니다.`],whyThisRank:`맞게는 풀지만 덩어리를 열마다 다시 센다는 점이 정석과의 차이입니다. 같은 덩어리의 크기는 한 번만 구하면 되므로 땅이 커지면 이 풀이는 시간 안에 끝나지 않습니다.`,code:E,visualize:U},{id:`oil-cells`,name:`열을 훑으며 칸마다 덩어리 크기 더하기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N × M)`,spaceComplexity:`O(N × M)`,verdict:`덩어리 크기를 구해 두는 것까지는 같지만 한 열에서 같은 덩어리를 칸마다 더해 오답이 나옵니다.`,pros:[`덩어리마다 크기를 한 번만 구하는 점은 정석과 같아 시간도 빠릅니다.`],cons:[`열을 훑으며 석유 칸마다 그 칸 덩어리의 크기를 더해, 한 덩어리가 한 열에서 여러 칸이면 크기를 여러 번 더합니다. 시각화 입력의 0열은 크기 8인 덩어리가 3칸이라 8을 세 번 더해 24가 나옵니다(정답은 9).`,`덩어리가 한 열에서 한 칸씩만 지나는 입력에서는 우연히 맞아 예제 일부를 통과합니다.`],whyThisRank:`시추관은 덩어리를 한 번에 통째로 뽑습니다. 그래서 한 열에서 같은 덩어리는 한 번만 세어야 하고, 이를 위해 덩어리가 걸친 열을 set으로 모아 크기를 한 번씩만 더해야 합니다.`,code:O,visualize:W}],checks:{cases:[{args:[[[0,0,0,1,1,1,0,0],[0,0,0,0,1,1,0,0],[1,1,0,0,0,1,1,0],[1,1,1,0,0,0,0,0],[1,1,1,0,0,0,1,1]]],expected:9},{args:[[[1,0,1,0,1,1],[1,0,1,0,0,0],[1,0,1,0,0,1],[1,0,0,1,0,0],[1,0,0,1,0,1],[1,0,0,0,0,0],[1,1,1,1,1,1]]],expected:16},{args:[[[0]]],expected:0},{args:[[[1]]],expected:1},{args:[[[1],[1],[1]]],expected:3},{args:[[[1,1,1]]],expected:3},{args:[[[1,0,1],[0,0,0],[1,0,1]]],expected:2},{args:[l],expected:S}],random:e=>{let[t,n]=[1+Math.floor(e()*6),1+Math.floor(e()*6)];return[Array.from({length:t},()=>Array.from({length:n},()=>+(e()<.45)))]}}};export{G as default};