import{i as e,r as t}from"./layout-DFaYBMY_.js";import{c as n,i as r,l as i,n as a,r as o}from"./shared-CL29HWIp.js";import{t as s}from"./lane-BzDhdR3X.js";import{t as c}from"./pacing-CRi5IfsT.js";var l=[`OOOXL`,`OXXOO`,`OXOOX`,`XOOXS`,`OXEOO`],u=l.length,d=l[0].length,f=[[-1,0],[1,0],[0,-1],[0,1]],p=([e,t])=>`${e},${t}`,m=(e,t)=>p(e)===p(t),h=([e,t])=>e>=0&&e<u&&t>=0&&t<d,g=([e,t])=>l[e][t],_=e=>f.map(([t,n])=>[e[0]+t,e[1]+n]).filter(h),v=e=>`cell:${p(e)}`,y=e=>{let t=l.findIndex(t=>t.includes(e));return[t,l[t].indexOf(e)]},[b,x,S]=[y(`S`),y(`L`),y(`E`)],C={S:`시작`,L:`레버`,E:`출구`};function w(e,t,n=!1){let r=new Map([[p(e),0]]),i=[e];for(let e=0;e<i.length;e++){let a=i[e];if(m(a,t))return r.get(p(a));for(let e of _(a))g(e)===`X`||n&&g(e)===`E`||r.has(p(e))||(r.set(p(e),r.get(p(a))+1),i.push(e))}return-1}var T=w(b,x)+w(x,S),E=`    n, m = len(maps), len(maps[0])
    for i in range(n):
        for j in range(m):
            if maps[i][j] == 'S':
                start = (i, j)
            elif maps[i][j] == 'L':
                lever = (i, j)
            elif maps[i][j] == 'E':
                door = (i, j)
`,D=`  const n = maps.length;
  const m = maps[0].length;
  let start, lever, door;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (maps[i][j] === 'S') start = [i, j];
      else if (maps[i][j] === 'L') lever = [i, j];
      else if (maps[i][j] === 'E') door = [i, j];
    }
  }
`,O={python:`from collections import deque

def solution(maps):
${E}
    def bfs(src, dst):  # src에서 dst까지 가는 가장 짧은 거리, 못 가면 -1
        dist = [[-1] * m for _ in range(n)]
        dist[src[0]][src[1]] = 0
        queue = deque([src])
        while queue:
            x, y = queue.popleft()
            if (x, y) == dst:
                return dist[x][y]
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                nx, ny = x + dx, y + dy
                if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and dist[nx][ny] == -1:
                    dist[nx][ny] = dist[x][y] + 1
                    queue.append((nx, ny))
        return -1

    a = bfs(start, lever)  # 시작 → 레버
    if a == -1:
        return -1
    b = bfs(lever, door)  # 레버 → 출구 (출구는 레버를 당기기 전에도 지나갈 수 있습니다)
    return a + b if b != -1 else -1`,javascript:`function solution(maps) {
${D}
  const bfs = (src, dst) => { // src에서 dst까지 가는 가장 짧은 거리, 못 가면 -1
    const dist = Array.from({ length: n }, () => Array(m).fill(-1));
    dist[src[0]][src[1]] = 0;
    const queue = [src];
    let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
    while (head < queue.length) {
      const [x, y] = queue[head++];
      if (x === dst[0] && y === dst[1]) return dist[x][y];
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && dist[nx][ny] === -1) {
          dist[nx][ny] = dist[x][y] + 1;
          queue.push([nx, ny]);
        }
      }
    }
    return -1;
  };

  const a = bfs(start, lever); // 시작 → 레버
  if (a === -1) return -1;
  const b = bfs(lever, door); // 레버 → 출구 (출구는 레버를 당기기 전에도 지나갈 수 있습니다)
  return b === -1 ? -1 : a + b;
}`},k={find:r(O,[`if maps[i][j] == 'S'`,`elif maps[i][j] == 'L'`,`elif maps[i][j] == 'E'`],[`if (maps[i][j] === 'S')`,`else if (maps[i][j] === 'L')`,`else if (maps[i][j] === 'E')`]),first:r(O,[`a = bfs(start, lever)`,`dist = [[-1] * m`,`dist[src[0]][src[1]] = 0`,`queue = deque([src])`],[`const a = bfs(start, lever)`,`const dist = Array.from`,`dist[src[0]][src[1]] = 0`,`const queue = [src]`]),second:r(O,[`b = bfs(lever, door)`,`dist = [[-1] * m`,`dist[src[0]][src[1]] = 0`,`queue = deque([src])`],[`const b = bfs(lever, door)`,`const dist = Array.from`,`dist[src[0]][src[1]] = 0`,`const queue = [src]`]),pop:r(O,[`x, y = queue.popleft()`],[`const [x, y] = queue[head++]`]),look:r(O,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m`]),mark:r(O,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m`,`dist[nx][ny] = dist[x][y] + 1`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m`,`dist[nx][ny] = dist[x][y] + 1`]),push:r(O,[`queue.append((nx, ny))`],[`queue.push([nx, ny])`]),next:r(O,[`while queue:`],[`while (head < queue.length)`]),goal:r(O,[`if (x, y) == dst`,`return dist[x][y]`],[`if (x === dst[0] && y === dst[1])`]),firstDone:r(O,[`if (x, y) == dst`,`return dist[x][y]`,`a = bfs(start, lever)`],[`if (x === dst[0] && y === dst[1])`,`const a = bfs(start, lever)`]),answer:r(O,[`return a + b if b != -1 else -1`],[`return b === -1 ? -1 : a + b`])},A={python:`from collections import deque

def solution(maps):
${E}
    # 이동은 왔던 길로 되돌아갈 수 있으니, 레버에서 한 번만 BFS를 해도
    # 레버 → 출구 거리와 레버 → 시작 거리(= 시작 → 레버 거리)를 한꺼번에 얻습니다
    dist = [[-1] * m for _ in range(n)]
    dist[lever[0]][lever[1]] = 0
    queue = deque([lever])
    while queue:
        x, y = queue.popleft()
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and dist[nx][ny] == -1:
                dist[nx][ny] = dist[x][y] + 1
                queue.append((nx, ny))

    a = dist[start[0]][start[1]]
    b = dist[door[0]][door[1]]
    return a + b if a != -1 and b != -1 else -1`,javascript:`function solution(maps) {
${D}
  // 이동은 왔던 길로 되돌아갈 수 있으니, 레버에서 한 번만 BFS를 해도
  // 레버 → 출구 거리와 레버 → 시작 거리(= 시작 → 레버 거리)를 한꺼번에 얻습니다
  const dist = Array.from({ length: n }, () => Array(m).fill(-1));
  dist[lever[0]][lever[1]] = 0;
  const queue = [lever];
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && dist[nx][ny] === -1) {
        dist[nx][ny] = dist[x][y] + 1;
        queue.push([nx, ny]);
      }
    }
  }

  const a = dist[start[0]][start[1]];
  const b = dist[door[0]][door[1]];
  return a !== -1 && b !== -1 ? a + b : -1;
}`},j={find:r(A,[`if maps[i][j] == 'S'`,`elif maps[i][j] == 'L'`,`elif maps[i][j] == 'E'`],[`if (maps[i][j] === 'S')`,`else if (maps[i][j] === 'L')`,`else if (maps[i][j] === 'E')`]),start:r(A,[`dist = [[-1] * m`,`dist[lever[0]][lever[1]] = 0`,`queue = deque([lever])`],[`const dist = Array.from`,`dist[lever[0]][lever[1]] = 0`,`const queue = [lever]`]),pop:r(A,[`x, y = queue.popleft()`],[`const [x, y] = queue[head++]`]),look:r(A,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m`]),mark:r(A,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m`,`dist[nx][ny] = dist[x][y] + 1`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m`,`dist[nx][ny] = dist[x][y] + 1`]),push:r(A,[`queue.append((nx, ny))`],[`queue.push([nx, ny])`]),next:r(A,[`while queue:`],[`while (head < queue.length)`]),answer:r(A,[`a = dist[start[0]][start[1]]`,`b = dist[door[0]][door[1]]`,`return a + b if a != -1`],[`const a = dist[start[0]][start[1]]`,`const b = dist[door[0]][door[1]]`,`return a !== -1 && b !== -1`])},M={python:`# 주의: 오답이 나오는 풀이입니다 (레버를 당기기 전에는 출구를 벽처럼 막아 둡니다)
from collections import deque

def solution(maps):
${E}
    def bfs(src, dst, door_open):  # src에서 dst까지 가는 가장 짧은 거리, 못 가면 -1
        dist = [[-1] * m for _ in range(n)]
        dist[src[0]][src[1]] = 0
        queue = deque([src])
        while queue:
            x, y = queue.popleft()
            if (x, y) == dst:
                return dist[x][y]
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상, 하, 좌, 우
                nx, ny = x + dx, y + dy
                if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] != 'X' and dist[nx][ny] == -1:
                    if maps[nx][ny] == 'E' and not door_open:
                        continue  # 출구는 레버를 당겨야 열린다고 생각해 막아 버립니다
                    dist[nx][ny] = dist[x][y] + 1
                    queue.append((nx, ny))
        return -1

    a = bfs(start, lever, False)  # 시작 → 레버 (출구 막힘)
    if a == -1:
        return -1
    b = bfs(lever, door, True)  # 레버 → 출구
    return a + b if b != -1 else -1`,javascript:`// 주의: 오답이 나오는 풀이입니다 (레버를 당기기 전에는 출구를 벽처럼 막아 둡니다)
function solution(maps) {
${D}
  const bfs = (src, dst, doorOpen) => { // src에서 dst까지 가는 가장 짧은 거리, 못 가면 -1
    const dist = Array.from({ length: n }, () => Array(m).fill(-1));
    dist[src[0]][src[1]] = 0;
    const queue = [src];
    let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
    while (head < queue.length) {
      const [x, y] = queue[head++];
      if (x === dst[0] && y === dst[1]) return dist[x][y];
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // 상, 하, 좌, 우
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] !== 'X' && dist[nx][ny] === -1) {
          if (maps[nx][ny] === 'E' && !doorOpen) continue; // 출구는 레버를 당겨야 열린다고 생각해 막아 버립니다
          dist[nx][ny] = dist[x][y] + 1;
          queue.push([nx, ny]);
        }
      }
    }
    return -1;
  };

  const a = bfs(start, lever, false); // 시작 → 레버 (출구 막힘)
  if (a === -1) return -1;
  const b = bfs(lever, door, true); // 레버 → 출구
  return b === -1 ? -1 : a + b;
}`},N={find:r(M,[`if maps[i][j] == 'S'`,`elif maps[i][j] == 'L'`,`elif maps[i][j] == 'E'`],[`if (maps[i][j] === 'S')`,`else if (maps[i][j] === 'L')`,`else if (maps[i][j] === 'E')`]),first:r(M,[`a = bfs(start, lever, False)`,`dist = [[-1] * m`,`dist[src[0]][src[1]] = 0`,`queue = deque([src])`],[`const a = bfs(start, lever, false)`,`const dist = Array.from`,`dist[src[0]][src[1]] = 0`,`const queue = [src]`]),pop:r(M,[`x, y = queue.popleft()`],[`const [x, y] = queue[head++]`]),look:r(M,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m`]),mark:r(M,[`for dx, dy in`,`if 0 <= nx < n and 0 <= ny < m`,`dist[nx][ny] = dist[x][y] + 1`],[`for (const [dx, dy] of`,`if (nx >= 0 && nx < n && ny >= 0 && ny < m`,`dist[nx][ny] = dist[x][y] + 1`]),block:r(M,[`if maps[nx][ny] == 'E' and not door_open`,`continue`],[`if (maps[nx][ny] === 'E' && !doorOpen) continue`]),push:r(M,[`queue.append((nx, ny))`],[`queue.push([nx, ny])`]),next:r(M,[`while queue:`],[`while (head < queue.length)`]),fail:r(M,[`return -1`,`if a == -1`],[`return -1;`,`if (a === -1) return -1`])},P=330,F=410,I={x:0,y:0,w:P,h:F},L={id:`lane`,x:40,y:5,slotW:64,slotH:30,gap:6,max:4},R=e({x:14,y:58,rows:u,cols:d,cell:54,gap:8}),z=e=>t(R(e[0],e[1])),B=e=>({x:e*108,y:372,w:100,h:30}),V={wall:`벽`,door:`출구 막음`,seen:`방문함`,new:`새 칸`};function H(){let e=[{id:`lane:label`,kind:`text`,rect:{x:0,y:0,w:34,h:40},text:`큐`},{id:`lane:bg`,kind:`zone`,rect:{x:34,y:0,w:296,h:40}}];return l.forEach((t,n)=>[...t].forEach((t,r)=>{e.push({id:v([n,r]),kind:`cell`,rect:R(n,r),tone:t===`X`?`wall`:`plain`,...C[t]?{tag:C[t]}:{}})})),e.push({id:`path`,kind:`line`,rect:I,tone:`path`,points:[]}),{width:P,height:F,items:e}}var U=(e,t)=>({type:`set`,id:v(e),patch:t}),W=(e,t,n,r=`plain`)=>({type:`add`,item:{id:e,kind:`token`,rect:B(t),tone:r,text:n}});function G(e){let t={best:k,alt:j,trap:N}[e],r=new i(H()),u=new s(r,L),d=0,f=0,h=`-`,y=`-`,C=new Map,w=new Map,E=[],D,O=[],A=e=>C.get(p(e)),M=e=>{let t=[e];for(let n=w.get(p(e));n;n=w.get(p(n)))t.unshift(n);return t},P=(e,t=[])=>({work:d,variables:{"(x, y)":e?a(e):`-`,dist:e?A(e):`-`,"새로 넣은 칸":t.length?t.map(a).join(`, `):`없음`,queue:`[${E.map(a).join(`, `)}]`,a:h,b:y}}),F=e=>{u.shift(v(e)),r.do(...n([U(e,{tone:`current`}),...D?[U(D,{tone:`visited`})]:[]],!0))},I=i=>{C=new Map([[p(i.from),0]]),w=new Map,E=[i.from],D=void 0,r.step({title:`${a(i.from)}에서 BFS 시작`,codeHighlights:i.startAt,...P(void 0,[i.from])}),r.phase(i.label,i.text,i.startAt);let s=i.wipe?l.flatMap((e,t)=>[...e].flatMap((e,n)=>{let a=r.get(v([t,n]));return e===`X`||m([t,n],i.from)||a.tone===`plain`&&!a.text?[]:[U([t,n],{tone:`plain`,text:``})]})):[];for(r.do(...n([...s,{...U(i.from,{tone:`queued`,text:`0`}),pop:!0}])),u.push({id:`tok:${p(i.from)}:${++f}`,text:a(i.from)},v(i.from));E.length;){let s=E.shift();if(d++,i.to&&m(s,i.to)){let t=M(s),c=e!==`best`||m(i.to,x);c?h=A(s):y=A(s);let l=h!==`-`&&y!==`-`?h+y:void 0;r.step({title:`${c?`레버`:`출구`} ${a(s)} 꺼내기 — 거리 ${A(s)}`,codeHighlights:c?k.firstDone:k.answer,...P(s),...l===void 0?{}:{answer:l,isKeyframe:!0}}),r.phase(`꺼내기`,`큐 맨 앞에서 ${c?`레버`:`출구`} 칸 ${o(a(s),`을`,`를`)} 꺼냈습니다.`,k.pop),F(s),r.phase(c?`레버 도착`:`출구 도착`,c?`시작에서 레버까지의 거리 ${o(A(s),`이`,`가`)} a에 담깁니다. 지나온 길을 분홍으로 표시합니다.`:`레버에서 출구까지의 거리 ${o(A(s),`이`,`가`)} b에 담깁니다. a + b = ${h} + ${y}이니 답은 ${l}입니다.`,k.goal);let u=t.map(z);return O=c?u:[...O,...u.slice(1)],r.do(c?{type:`trace`,id:`path`,points:u}:{type:`set`,id:`path`,patch:{points:O}},...n([...t.map(e=>U(e,{tone:`path`})),W(c?`leg1`:`leg2`,+!c,c?`S→L ${A(s)}`:`L→E ${A(s)}`),...l===void 0?[]:[W(`sum`,2,`합 ${l}`,`good`)]],!0)),A(s)}let c=_(s).map(e=>({to:e,verdict:g(e)===`X`?`wall`:i.blocked&&g(e)===`E`?`door`:C.has(p(e))?`seen`:`new`})),l=c.filter(e=>e.verdict===`new`).map(e=>e.to);for(let e of l)C.set(p(e),A(s)+1),w.set(p(e),s),E.push(e);let b=c.some(e=>e.verdict===`door`);r.step({title:l.length?`${a(s)} 꺼내고 ${l.length}칸 넣기`:`${a(s)} 꺼내기 — 넣을 칸 없음`,codeHighlights:l.length?t.push:t.next,...P(s,l)}),r.phase(`꺼내기`,`큐 맨 앞에서 ${o(a(s),`을`,`를`)} 꺼냅니다. 이 칸까지의 거리는 ${A(s)}입니다.${e===`best`&&m(s,S)?` 출구 칸이어도 레버 전에 지날 수 있어 그냥 지납니다.`:``}`,t.pop),F(s),r.phase(`살피기`,b?`상하좌우 칸을 하나씩 확인합니다. 출구는 레버를 당기기 전이라 막힌 곳으로 보고 건너뜁니다.`:`상하좌우 칸을 하나씩 확인합니다. 벽이나 이미 방문한 칸은 건너뛰고${l.length?`, 새 칸에는 거리 ${o(A(s)+1,`을`,`를`)} 적습니다.`:` 넘어갑니다.`}`,b?N.block:l.length?t.mark:t.look),r.do({type:`focus`,ids:[v(s),...c.map(e=>v(e.to))]});for(let e of c)r.do({type:`arrow`,from:v(s),to:v(e.to),verdict:e.verdict===`door`?`wall`:e.verdict,label:V[e.verdict]}),e.verdict===`new`&&r.do({...U(e.to,{tone:`queued`,text:String(A(e.to))}),pop:!0,together:!0});r.phase(`넣기`,l.length?`새로 찾은 ${o(l.map(a).join(`, `),`을`,`를`)} 큐 뒤에 넣습니다.`:`새로 넣을 칸이 없어 그대로 넘어갑니다.`,l.length?t.push:t.next);let T=[{type:`unfocus`},{type:`clearMarks`}];l.length?l.forEach((e,t)=>{u.push({id:`tok:${p(e)}:${++f}`,text:a(e)},v(e)),t||r.do(...n(T,!0))}):r.do(...n(T)),D=s}return-1};if(e===`best`)I({from:b,to:x,label:`1번째 BFS`,startAt:k.first,text:`시작 칸 ${a(b)}에서 레버까지 가는 거리를 구하는 BFS를 합니다. 거리 0을 적고 큐에 넣습니다.`}),I({from:x,to:S,label:`2번째 BFS`,startAt:k.second,wipe:!0,text:`이번에는 레버 칸 ${a(x)}에서 출구까지 가는 거리를 구합니다. 방문 표시를 새로 만들고 레버 칸을 큐에 넣습니다.`});else if(e===`trap`)I({from:b,to:x,blocked:!0,label:`1번째 BFS`,startAt:N.first,text:`출구는 레버를 당겨야 열린다고 생각해 출구를 막아 두고, 시작 칸 ${a(b)}에서 레버까지 BFS를 합니다.`}),h=-1,r.step({title:`큐가 비었습니다 — 레버에 못 닿음`,codeHighlights:N.fail,...P(),answer:-1,isKeyframe:!0}),r.phase(`레버에 못 닿음`,`큐가 비었는데 레버에 닿지 못해 a는 -1이고, -1을 돌려줍니다. 정답은 ${T}입니다.`,N.fail),r.do(W(`mine`,0,`내 답 -1`,`bad`),{...W(`truth`,1,`정답 ${T}`,`good`),together:!0});else{I({from:x,label:`레버에서 시작`,startAt:j.start,text:`레버 칸 ${a(x)}에서 BFS를 한 번만 합니다. 거리 0을 적고 큐에 넣습니다.`}),h=A(b),y=A(S);let e=M(b).reverse(),t=M(S);r.step({title:`거리 합 ${h} + ${y}`,codeHighlights:j.answer,...P(),answer:h+y,isKeyframe:!0}),r.phase(`거리 더하기`,`레버에서 시작 칸까지 ${h}, 출구까지 ${y}입니다. 길은 되돌아갈 수 있어서 시작 → 레버 거리도 ${h}이고, 더한 ${o(h+y,`이`,`가`)} 답입니다.`,j.answer),r.do({type:`trace`,id:`path`,points:[...e,...t.slice(1)].map(z)},...n([U(b,{tone:`path`}),U(S,{tone:`path`}),W(`leg1`,0,`S→L ${h}`),W(`leg2`,1,`L→E ${y}`),W(`sum`,2,`합 ${h+y}`,`good`)],!0))}return c(r.finish())}var K={id:`maze-escape`,title:`미로 탈출`,level:2,category:`dfs-bfs`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/159993`,description:{summary:`격자 미로에서 시작 지점 S에서 출발해 레버 L을 당긴 뒤 출구 E로 나가야 합니다. 한 칸 움직이는 데 1초가 걸리고, 통로 O만 지날 수 있으며 벽 X는 못 지납니다. 출구는 레버를 당기기 전에도 지나갈 수 있고, 같은 칸을 여러 번 지나도 됩니다. 탈출하는 가장 짧은 시간을 구하고, 못 나가면 -1을 돌려줍니다.`,rules:[`maps의 가로·세로 길이는 5 이상 100 이하`,`maps의 글자는 S(시작), E(출구), L(레버), O(통로), X(벽)`,`시작 지점, 출구, 레버는 서로 다른 곳에 한 개씩만 있음`,`출구는 레버를 당기기 전에도 지나갈 수 있고, 모든 칸은 여러 번 지나도 됨`],examples:[{input:`maps = ["SOOOL","XXXXO","OOOOO","OXXXX","OOOOE"]`,output:`16`},{input:`maps = ["LOOXS","OOOOX","OOOOO","OOOOO","EOOOO"]`,output:`-1`}]},keyIntuitions:[`"레버를 먼저 당긴 뒤 출구"라는 순서는 시작 → 레버, 레버 → 출구 두 구간으로 나뉩니다. 각 구간의 최단 거리를 BFS로 구해 더하면 됩니다. BFS를 두 번 하는 것입니다.`,`출구는 레버를 당기기 전에도 지나갈 수 있습니다. 출구를 벽처럼 막아 두면 레버로 가는 길이 끊겨 -1이 나올 수 있습니다.`,`둘 중 한 구간이라도 못 가면 -1입니다. 첫 BFS에서 레버에 못 닿으면 두 번째는 해 볼 필요가 없습니다.`],demo:{input:[l],label:`maps = ["OOOXL","OXXOO","OXOOX","XOOXS","OXEOO"]`},workUnit:`칸을 꺼낸 횟수`,approaches:[{id:`maze-bfs-twice`,name:`너비 우선 탐색 두 번 (시작 → 레버 → 출구)`,rank:`BEST`,timeComplexity:`O(N × M)`,spaceComplexity:`O(N × M)`,verdict:`시작 → 레버, 레버 → 출구를 각각 BFS로 구해 더하는 표준 풀이입니다.`,pros:[`문제의 순서(레버를 먼저 당기고 출구)를 그대로 두 구간으로 옮겨 이해하기 쉽습니다.`,`구간마다 목표 칸을 꺼내는 즉시 끝내서 필요 없는 칸은 보지 않습니다.`,`한 구간이라도 막히면 바로 -1을 돌려줘 나머지를 계산하지 않습니다.`],cons:[`BFS 함수를 두 번 부르므로 거리표와 큐를 구간마다 새로 만듭니다.`],whyThisRank:`목표를 거치는 순서가 정해진 최단 거리는 "목표까지 BFS를 구간마다 한 번씩" 하는 것이 정석입니다. 코드가 문제와 같은 모양이라 규칙이 바뀌어도 그대로 고칠 수 있습니다.`,code:O,visualize:()=>G(`best`)},{id:`maze-bfs-lever`,name:`레버에서 한 번만 BFS`,rank:`ALTERNATIVE`,timeComplexity:`O(N × M)`,spaceComplexity:`O(N × M)`,verdict:`일은 더 적게 하지만 왔던 길로 되돌아갈 수 있다는 성질에 기댄 덜 일반적인 풀이입니다.`,pros:[`길은 되돌아갈 수 있어서 시작 → 레버 거리와 레버 → 시작 거리가 같으니, 레버에서 한 번만 퍼져 나가면 시작과 출구까지의 거리를 함께 얻습니다.`,`BFS를 한 번만 써서 코드와 거리표가 하나입니다.`],cons:[`일방통행이나 "레버를 당기기 전에는 못 지나는 칸"처럼 오갈 때 규칙이 달라지면 틀립니다.`,`목표를 찾아도 멈추지 않고 큐가 빌 때까지 퍼져서, 미로가 넓으면 필요 없는 칸까지 모두 봅니다.`],whyThisRank:`이 문제에서는 맞고 일의 양도 적지만, 이동 규칙의 대칭성이라는 숨은 조건에 기대고 있습니다. 규칙이 바뀌어도 통하는 구간별 BFS가 더 믿을 만한 정석입니다.`,code:A,visualize:()=>G(`alt`)},{id:`maze-block-door`,name:`출구를 막고 BFS (레버 전에는 출구를 벽 취급)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N × M)`,spaceComplexity:`O(N × M)`,verdict:`"출구는 레버를 당겨야 열린다"를 벽으로 옮겨서 레버로 가는 길을 끊어 오답이 나옵니다.`,pros:[`레버를 당기기 전에는 출구로 못 나가는 규칙을 코드에 그대로 옮긴 듯 보입니다.`],cons:[`출구는 레버를 당기기 전에도 지나갈 수 있는데 벽처럼 막으면, 출구를 거쳐야 레버에 닿는 미로에서 레버를 못 찾아 -1이 나옵니다. 시각화 입력의 정답은 15인데 -1을 돌려줍니다.`,`출구가 길목에 있지 않은 미로에서는 우연히 맞아서 예제만 통과하기 쉽습니다.`],whyThisRank:`탈출은 레버를 당긴 뒤에만 되지만, 출구 칸을 지나가는 것은 언제든 됩니다. 두 규칙을 섞어 출구를 벽으로 막은 것이 오답의 원인입니다.`,code:M,visualize:()=>G(`trap`)}],checks:{cases:[{args:[[`SOOOL`,`XXXXO`,`OOOOO`,`OXXXX`,`OOOOE`]],expected:16},{args:[[`LOOXS`,`OOOOX`,`OOOOO`,`OOOOO`,`EOOOO`]],expected:-1},{args:[[`SLOOE`,`OOOOO`,`OOOOO`,`OOOOO`,`OOOOO`]],expected:4},{args:[[`SOOOE`,`XXXXX`,`LOOOO`,`OOOOO`,`OOOOO`]],expected:-1},{args:[[`SEOOL`,`OOOOO`,`OOOOO`,`OOOOO`,`OOOOO`]],expected:7},{args:[l],expected:T}],random:e=>{let[t,n]=[5+Math.floor(e()*2),5+Math.floor(e()*2)],r=Array.from({length:t},()=>Array.from({length:n},()=>e()<.25?`X`:`O`)),i=Array.from({length:t*n},(e,t)=>t);for(let t of[`S`,`L`,`E`]){let a=i.splice(Math.floor(e()*i.length),1)[0];r[Math.floor(a/n)][a%n]=t}return[r.map(e=>e.join(``))]}}};export{K as default};