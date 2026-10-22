import{i as e,r as t,t as n}from"./layout-DFaYBMY_.js";import{a as r,c as i,i as a,l as o,n as s,r as c}from"./shared-CL29HWIp.js";import{t as l}from"./lane-BzDhdR3X.js";var u=[[1,0,1,1,1],[1,0,1,0,1],[1,0,1,1,1],[1,1,1,0,1],[0,0,0,0,1]],d=u.length,f=u[0].length,p=[0,0],m=[d-1,f-1],h=[[-1,0],[1,0],[0,-1],[0,1]],g={python:`from collections import deque

def solution(maps):
    n, m = len(maps), len(maps[0])
    dx = [-1, 1, 0, 0]  # 상, 하, 좌, 우
    dy = [0, 0, -1, 1]

    queue = deque([(0, 0)])
    dist = [[-1] * m for _ in range(n)]
    dist[0][0] = 1  # 출발 칸도 1칸으로 셉니다

    while queue:
        x, y = queue.popleft()
        if x == n - 1 and y == m - 1:
            return dist[x][y]  # 도착 칸을 처음 꺼낸 순간이 최단 거리

        for i in range(4):
            nx, ny = x + dx[i], y + dy[i]
            if 0 <= nx < n and 0 <= ny < m:
                if maps[nx][ny] == 1 and dist[nx][ny] == -1:
                    dist[nx][ny] = dist[x][y] + 1
                    queue.append((nx, ny))

    return -1`,javascript:`function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const dx = [-1, 1, 0, 0]; // 상, 하, 좌, 우
  const dy = [0, 0, -1, 1];

  const queue = [[0, 0]];
  const dist = Array.from({ length: n }, () => Array(m).fill(-1));
  dist[0][0] = 1; // 출발 칸도 1칸으로 셉니다

  let head = 0; // shift() 대신 인덱스로 꺼내 O(1)을 유지합니다
  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x === n - 1 && y === m - 1) {
      return dist[x][y]; // 도착 칸을 처음 꺼낸 순간이 최단 거리
    }

    for (let i = 0; i < 4; i++) {
      const nx = x + dx[i];
      const ny = y + dy[i];
      if (nx >= 0 && nx < n && ny >= 0 && ny < m) {
        if (maps[nx][ny] === 1 && dist[nx][ny] === -1) {
          dist[nx][ny] = dist[x][y] + 1;
          queue.push([nx, ny]);
        }
      }
    }
  }

  return -1;
}`},_={start:a(g,[`queue = deque`,`dist = [[-1]`,`dist[0][0] = 1`],[`const queue = [[0, 0]]`,`const dist = Array`,`dist[0][0] = 1`]),pop:a(g,[`x, y = queue.popleft()`],[`const [x, y] = queue[head++]`]),look:a(g,[`for i in range(4)`,`if maps[nx][ny] == 1`],[`for (let i = 0; i < 4; i++)`,`if (maps[nx][ny] === 1`]),mark:a(g,[`for i in range(4)`,`if maps[nx][ny] == 1`,`dist[nx][ny] = dist[x][y] + 1`],[`for (let i = 0; i < 4; i++)`,`if (maps[nx][ny] === 1`,`dist[nx][ny] = dist[x][y] + 1`]),push:a(g,[`queue.append((nx, ny))`],[`queue.push([nx, ny])`]),next:a(g,[`while queue:`],[`while (head < queue.length)`]),goal:a(g,[`if x == n - 1 and y == m - 1`,`return dist[x][y]`],[`if (x === n - 1 && y === m - 1)`,`return dist[x][y]`])},v={python:`import heapq

def solution(maps):
    n, m = len(maps), len(maps[0])
    dist = [[float('inf')] * m for _ in range(n)]
    dist[0][0] = 1
    pq = [(1, 0, 0)]  # (비용, x, y)

    while pq:
        cost, x, y = heapq.heappop(pq)
        if cost > dist[x][y]:
            continue  # 이미 더 짧게 온 적이 있는 칸
        if x == n - 1 and y == m - 1:
            return cost
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] == 1:
                if cost + 1 < dist[nx][ny]:
                    dist[nx][ny] = cost + 1
                    heapq.heappush(pq, (cost + 1, nx, ny))
    return -1`,javascript:`function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const dist = Array.from({ length: n }, () => Array(m).fill(Infinity));
  const pq = [[1, 0, 0]]; // [비용, x, y]를 담는 최소 힙
  dist[0][0] = 1;

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
    if (x === n - 1 && y === m - 1) return cost;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] === 1 && cost + 1 < dist[nx][ny]) {
        dist[nx][ny] = cost + 1;
        push([cost + 1, nx, ny]);
      }
    }
  }
  return -1;
}`},y={start:a(v,[`dist[0][0] = 1`,`pq = [(1, 0, 0)]`],[`const pq = [[1, 0, 0]]`,`dist[0][0] = 1`]),pop:a(v,[`cost, x, y = heapq.heappop(pq)`],[`const [cost, x, y] = pop()`]),look:a(v,[`for dx, dy in`,`if 0 <= nx < n`,`if cost + 1 < dist[nx][ny]`],[`for (const [dx, dy] of`,`cost + 1 < dist[nx][ny]`]),mark:a(v,[`for dx, dy in`,`if 0 <= nx < n`,`if cost + 1 < dist[nx][ny]`,`dist[nx][ny] = cost + 1`],[`for (const [dx, dy] of`,`cost + 1 < dist[nx][ny]`,`dist[nx][ny] = cost + 1`]),push:a(v,[`heapq.heappush(pq, (cost + 1, nx, ny))`],[`push([cost + 1, nx, ny])`,`for (let i = pq.length - 1; i > 0; )`]),next:a(v,[`while pq:`],[`while (pq.length > 0)`]),goal:a(v,[`if x == n - 1 and y == m - 1`,`return cost`],[`if (x === n - 1 && y === m - 1) return cost`])},b={python:`# 주의: 효율성 테스트에서 시간 초과가 나는 풀이입니다
def solution(maps):
    n, m = len(maps), len(maps[0])
    visited = [[False] * m for _ in range(n)]
    best = float('inf')

    def dfs(x, y, count):
        nonlocal best
        if x == n - 1 and y == m - 1:
            best = min(best, count)
            return
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and maps[nx][ny] == 1 and not visited[nx][ny]:
                visited[nx][ny] = True
                dfs(nx, ny, count + 1)
                visited[nx][ny] = False  # 되돌리기 → 모든 경로를 다시 탐색

    visited[0][0] = True
    dfs(0, 0, 1)
    return best if best != float('inf') else -1`,javascript:`// 주의: 효율성 테스트에서 시간 초과가 나는 풀이입니다
function solution(maps) {
  const n = maps.length;
  const m = maps[0].length;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  let best = Infinity;

  const dfs = (x, y, count) => {
    if (x === n - 1 && y === m - 1) {
      best = Math.min(best, count);
      return;
    }
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < m && maps[nx][ny] === 1 && !visited[nx][ny]) {
        visited[nx][ny] = true;
        dfs(nx, ny, count + 1);
        visited[nx][ny] = false; // 되돌리기 → 모든 경로를 다시 탐색
      }
    }
  };

  visited[0][0] = true;
  dfs(0, 0, 1);
  return best === Infinity ? -1 : best;
}`},x={start:a(b,[`visited[0][0] = True`,`dfs(0, 0, 1)`],[`visited[0][0] = true`,`dfs(0, 0, 1)`]),enter:a(b,[`visited[nx][ny] = True`,`dfs(nx, ny, count + 1)`],[`visited[nx][ny] = true`,`dfs(nx, ny, count + 1)`]),found:a(b,[`if x == n - 1 and y == m - 1`,`best = min(best, count)`],[`if (x === n - 1 && y === m - 1)`,`best = Math.min(best, count)`]),back:a(b,[`visited[nx][ny] = False`],[`visited[nx][ny] = false`]),result:a(b,[`return best if best`],[`return best === Infinity`])},S=330,C=372,w={x:0,y:0,w:S,h:C},T={id:`lane`,x:40,y:5,slotW:64,slotH:30,gap:6,max:4},E=e({x:14,y:58,rows:d,cols:f,cell:54,gap:8}),D=([e,t])=>`${e},${t}`,O=(e,t)=>D(e)===D(t),k=e=>`cell:${D(e)}`,A=([e,n])=>t(E(e,n)),j=e=>({id:`tok:${D(e)}`,text:s(e)}),M=([e,t])=>h.map(([n,r])=>[e+n,t+r]).filter(([e,t])=>e>=0&&e<d&&t>=0&&t<f);function N(e,...t){let n=[{id:`lane:label`,kind:`text`,rect:{x:0,y:0,w:34,h:40},text:e},{id:`lane:bg`,kind:`zone`,rect:{x:34,y:0,w:296,h:40}}];return u.forEach((e,t)=>e.forEach((e,r)=>{let i=O([t,r],p)?`출발`:O([t,r],m)?`도착`:void 0;n.push({id:k([t,r]),kind:`cell`,rect:E(t,r),tone:e?`plain`:`wall`,...i?{tag:i}:{}})})),n.push({id:`path`,kind:`line`,rect:w,tone:`path`,points:[]},...t),{width:S,height:C,items:n}}var P=(e,t)=>({type:`set`,id:k(e),patch:t}),F=(e,t)=>{let r=n(E(...t),5);return e.has(`ring`)?{type:`set`,id:`ring`,patch:{rect:r}}:{type:`add`,item:{id:`ring`,kind:`ring`,rect:r}}},I=(e,t)=>{e.do(...i(t.map((e,t)=>P(e,{tone:`path`,text:String(t+1)})))),e.do({type:`trace`,id:`path`,points:t.map(A)})},L={heap:!1,at:_,start:`출발 칸도 한 칸으로 세므로 (0, 0)에 거리 1을 적고 큐에 넣습니다.`,pop:(e,t)=>`큐 맨 앞에서 ${c(s(e),`을`,`를`)} 꺼냅니다. 이 칸까지의 거리는 ${t}입니다.`,look:e=>`상하좌우 칸을 하나씩 확인합니다. 벽이나 이미 방문한 칸은 ${e?`건너뛰고, 새 칸에는 거리 ${c(e,`을`,`를`)} 적습니다.`:`건너뜁니다.`}`,push:e=>`새로 찾은 ${c(e.map(s).join(`, `),`을`,`를`)} 큐 뒤에 넣습니다.`,goal:`큐 맨 앞에서 도착 칸 ${c(s(m),`을`,`를`)} 꺼냈습니다.`,arrive:({d:e,pops:t})=>`도착 칸을 처음 꺼낸 순간의 거리 ${c(e,`이`,`가`)} 최단 거리입니다. 칸을 ${t}번 밟았습니다.`},R={heap:!0,at:y,start:`출발 칸 (0, 0)에 비용 1을 적고 힙에 넣습니다.`,pop:(e,t)=>`힙에서 비용이 가장 작은 ${c(s(e),`을`,`를`)} 꺼냅니다. 이 칸까지의 비용은 ${t}입니다.`,look:e=>`상하좌우 칸을 하나씩 확인합니다. 벽이나 이미 적힌 비용이 같거나 더 작은 칸은 ${e?`건너뛰고, 새 칸에는 비용 ${c(e,`을`,`를`)} 적습니다.`:`건너뜁니다.`}`,push:e=>`새로 찾은 ${c(e.map(s).join(`, `),`을`,`를`)} 힙에 넣고 비용순으로 정렬합니다. 가중치가 모두 1이라 순서는 그대로입니다.`,goal:`힙에서 비용이 가장 작은 도착 칸 ${c(s(m),`을`,`를`)} 꺼냈습니다.`,arrive:({d:e,sorts:t})=>`도착 칸을 꺼낸 순간의 비용 ${c(e,`이`,`가`)} 최단 거리입니다. 답은 BFS와 같지만, 힙에 넣고 꺼내느라 정렬을 ${t}번 더 했습니다.`},z={wall:`벽`,seen:`방문함`,new:`새 칸`};function B(e){let t=new o(N(e.heap?`힙`:`큐`)),n=new l(t,T),r=u.map(e=>e.map(()=>0)),a=new Map,c=[p],d=0,f=1,h,g=([e,t])=>r[e][t],_=(t,n=[])=>({work:d,...e.heap?{workNote:`힙 정렬 ${f}번`}:{},variables:{"(x, y)":t?s(t):`-`,[e.heap?`cost`:`dist[x][y]`]:t?g(t):`-`,"새로 넣은 칸":n.length?n.map(s).join(`, `):`없음`,[e.heap?`pq`:`queue`]:`[${c.map(t=>e.heap?`(${g(t)}, ${t[0]}, ${t[1]})`:s(t)).join(`, `)}]`}}),v=e=>{n.shift(k(e)),t.do(...i([P(e,{tone:`current`}),F(t,e),...h?[P(h,{tone:`visited`})]:[]]))};for(r[0][0]=1,t.step({title:`출발 칸 (0, 0)을 ${e.heap?`힙`:`큐`}에 넣기`,codeHighlights:e.at.start,..._(void 0,[p])}),t.phase(`시작`,e.start),t.do({...P(p,{tone:`queued`,text:`1`}),pop:!0}),n.push(j(p),k(p));c.length;){let i=c.shift();if(d++,e.heap&&f++,O(i,m)){t.step({title:`도착 칸 ${s(i)} 꺼내기 — 최단 거리 ${g(i)}`,codeHighlights:e.at.goal,..._(i),answer:g(i),isKeyframe:!0}),t.phase(`꺼내기`,e.goal,e.at.pop),v(i),t.phase(`도착`,e.arrive({d:g(i),pops:d,sorts:f}));let n=[i];for(let e=a.get(D(i));e;e=a.get(D(e)))n.unshift(e);I(t,n);break}let o=M(i).map(e=>({n:e,verdict:u[e[0]][e[1]]?g(e)?`seen`:`new`:`wall`})),l=o.filter(e=>e.verdict===`new`).map(e=>e.n);for(let[e,t]of l)r[e][t]=g(i)+1,a.set(D([e,t]),i),c.push([e,t]);e.heap&&(f+=l.length,c.sort((e,t)=>g(e)-g(t)||e[0]-t[0]||e[1]-t[1])),t.step({title:l.length?`${s(i)} 꺼내고 ${l.length}칸 넣기`:`${s(i)} 꺼내기 — 넣을 칸 없음`,codeHighlights:l.length?e.at.push:e.at.next,..._(i,l)}),t.phase(`꺼내기`,e.pop(i,g(i)),e.at.pop),v(i),t.phase(`살피기`,e.look(l.length?g(i)+1:void 0),l.length?e.at.mark:e.at.look),t.do({type:`focus`,ids:[k(i),`ring`,...o.map(e=>k(e.n))]});for(let{n:e,verdict:n}of o)t.do({type:`arrow`,from:k(i),to:k(e),verdict:n,label:z[n]}),n===`new`&&t.do({...P(e,{tone:`queued`,text:String(g(e))}),pop:!0,together:!0});t.phase(e.heap?`넣고 정렬`:`넣기`,l.length?e.push(l):`새로 넣을 칸이 없어 그대로 넘어갑니다.`),t.do({type:`unfocus`},{type:`clearMarks`,together:!0});for(let e of l)n.push(j(e),k(e));e.heap&&l.length&&n.reorder(c.map(e=>j(e).id)),h=i}return t.finish()}function V(){let e=new o(N(`스택`,{id:`trail`,kind:`line`,rect:w,tone:`trail`,points:[]})),t=new l(e,{...T,foldable:!0}),n=u.map(e=>e.map(()=>!1)),a=u.map(e=>e.map(()=>0)),d=[],f=[],h=0,g=1/0,_=[],v=(e=d)=>{let t=e.at(-1);return{work:h,variables:{"(x, y)":t?s(t):`-`,count:t?e.length:`-`,best:g===1/0?`∞`:g}}},y=n=>{let[r,o]=n,s=d.at(-2);e.do(...i([...s?[P(s,{tone:`trail`})]:[],P(n,{tone:`current`,text:String(d.length),...a[r][o]>1?{sub:`${a[r][o]}번`}:{}}),F(e,n),{type:`set`,id:`trail`,patch:{points:d.map(A)}}])),t.push(j(n),k(n))},b=()=>{if(!f.length)return;let n=f.length,r=d.at(-1),a=O(f[0],m)?`다른 경로를 찾으러`:`${c(s(f[0]),`은`,`는`)} 막다른 곳이라`,o=r?`${a} 안 가 본 방향이 남은 ${s(r)}까지 ${n}칸 되돌아갑니다.`:`${a} 되돌아가지만 남은 방향이 없어 ${n}칸을 모두 빠져나옵니다.`,l=[...d,...f.toReversed()];for(let a=0;a<n;){let c=f.slice(a,a+3),u=a===0;a+=c.length;let d=n-a;e.step({title:`${r?`${s(r)}까지 되돌아가기`:`모두 되돌아 나오기`} ${a}/${n}칸`,codeHighlights:x.back,...v(l.slice(0,l.length-c.length))}),e.phase(`되돌아가기`,d?`${u?o:`계속 되돌아갑니다.`} ${r?`${s(r)}까지 `:``}${d}칸 남았습니다.`:u?o:`계속 되돌아가 ${r?`${s(r)}에 닿았습니다.`:`출발 칸까지 모두 빠져나왔습니다.`}`);for(let n of c){l.pop();let r=l.at(-1);t.pop(k(n)),e.do(...i([P(n,{tone:`explored`,text:``}),{type:`set`,id:`trail`,patch:{points:l.map(A)}},r?F(e,r):{type:`remove`,id:`ring`}],!0))}e.do(...i(l.flatMap((t,n)=>{let r=n===l.length-1?`current`:`trail`;return e.get(k(t)).tone===r?[]:[P(t,{tone:r})]})))}f=[]},S=t=>{b(),h++;let o=++a[t[0]][t[1]];d.push(t);let c=d.length,l=o>1?` 이 칸은 이번이 ${o}번째입니다.`:``;if(O(t,m)){let n=g;c<g&&([g,_]=[c,[...d]]),e.step({title:`도착 — ${c}칸 경로 찾음`,codeHighlights:x.found,...v()}),e.phase(`들어가기`,`도착 칸 ${r(s(t))} 들어갑니다.${l}`,x.enter),y(t),e.phase(`경로 찾음`,`${n===1/0?`도착! 처음 찾은 경로라 지금까지의 최단은 ${c}칸입니다.`:`도착! 이번 경로는 ${c}칸으로 지금까지의 최단 ${n}칸보다 ${c<n?`짧습니다`:`짧지 않습니다`}.`} 더 짧은 경로가 있을 수 있어 나머지도 끝까지 확인합니다.`),e.do(...i(d.map(e=>P(e,{tone:`path`}))))}else{let i=c===1;e.step({title:i?`출발 칸 (0, 0)에서 시작`:`${r(s(t))} 들어가기`,codeHighlights:i?x.start:x.enter,...v()}),e.phase(`들어가기`,i?`출발 칸 (0, 0)에 방문 표시를 하고 들어갑니다. 지금 경로는 1칸째입니다.`:`${r(s(t))} 들어갑니다. 지금 경로는 ${c}칸째입니다.${l}`),y(t);for(let[e,r]of M(t))u[e][r]&&!n[e][r]&&(n[e][r]=!0,S([e,r]),n[e][r]=!1)}d.pop(),f.push(t)};return n[0][0]=!0,S(p),b(),e.step({title:`최단 ${g}칸 확정`,codeHighlights:x.result,...v(),answer:g,isKeyframe:!0}),e.phase(`최단 확정`,`모든 경로를 다 본 뒤에야 최단 ${g}칸을 확정합니다. 벽이 없는 6×6 맵만 돼도 칸을 1,847만 번 밟아야 해서(BFS는 36번) 100×100 맵에서는 시간 초과가 납니다.`),I(e,_),e.finish()}var H={id:`game-map`,title:`게임 맵 최단거리`,level:2,category:`dfs-bfs`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/1844`,description:{summary:`0은 벽, 1은 길인 n×m 맵에서 왼쪽 위 칸에서 출발해 오른쪽 아래 상대 진영까지 가는 최소 칸 수를 구합니다. 출발 칸과 도착 칸도 셉니다. 도착할 수 없으면 -1을 돌려줍니다.`,rules:[`n, m은 1 이상 100 이하 (둘 다 1인 경우는 없음)`,`0은 벽, 1은 지나갈 수 있는 길`,`상하좌우로 한 칸씩만 이동하고 맵 밖으로는 나갈 수 없음`,`상대 진영에 도착할 수 없으면 -1 반환`],examples:[{input:`maps = [[1,0,1,1,1],[1,0,1,0,1],[1,0,1,1,1],[1,1,1,0,1],[0,0,0,0,1]]`,output:`11`},{input:`maps = [[1,0,1,1,1],[1,0,1,0,1],[1,0,1,1,1],[1,1,1,0,0],[0,0,0,0,1]]`,output:`-1`}]},keyIntuitions:[`가중치 없는 격자의 최단 거리는 BFS로 구합니다. 가까운 칸부터 한 겹씩 넓혀 가므로 도착 칸을 처음 꺼내는 순간이 곧 최단 거리입니다.`,`DFS는 먼저 찾은 경로가 최단이라는 보장이 없어 모든 경로를 살펴야 하고, 효율성 테스트에서 시간 초과가 납니다.`,`큐에 넣는 순간 거리를 적어 방문 표시를 겸하면 같은 칸이 큐에 두 번 들어가지 않습니다.`],demo:{input:[u],label:`maps = 예제 1 (5×5)`},workUnit:`칸을 밟은 횟수`,approaches:[{id:`game-map-bfs`,name:`너비 우선 탐색 (BFS)`,rank:`BEST`,timeComplexity:`O(N × M)`,spaceComplexity:`O(N × M)`,verdict:`가중치가 모두 1인 격자 최단 거리의 표준 풀이입니다.`,pros:[`거리 1, 2, 3 순서로 퍼져 나가므로 도착 칸을 처음 꺼낸 순간의 거리가 최단 거리입니다.`,`각 칸을 한 번만 큐에 넣어 100×100 맵도 1만 번 안팎의 연산으로 끝납니다.`,`재귀 없이 큐로 돌아가 재귀 한도를 걱정할 필요가 없습니다.`],cons:[`큐와 거리 배열에 맵 크기만큼 메모리가 필요합니다.`],whyThisRank:`가중치 없는 그래프의 최단 경로는 BFS가 가장 단순하고 빠릅니다. 도착 칸을 꺼내는 즉시 반환하므로 필요 없는 칸은 보지 않습니다.`,code:g,visualize:()=>B(L)},{id:`game-map-dijkstra`,name:`다익스트라 (우선순위 큐)`,rank:`ALTERNATIVE`,timeComplexity:`O(NM log NM)`,spaceComplexity:`O(N × M)`,verdict:`정답은 나오지만 가중치가 모두 1이라 힙 연산만큼 손해입니다.`,pros:[`칸마다 이동 비용이 다른 문제로 그대로 확장할 수 있습니다.`,`힙에서 꺼낸 순간의 비용이 최단 거리라는 성질은 BFS와 같습니다.`],cons:[`넣고 꺼낼 때마다 O(log N)의 힙 정렬 비용이 붙습니다.`,`JavaScript에는 내장 힙이 없어 직접 구현해야 하므로 코드가 세 배 가까이 길어집니다.`],whyThisRank:`가중치가 모두 같으면 일반 큐가 이미 거리 순서로 정렬되어 있습니다. 힙은 이 문제에서 필요 이상의 도구입니다.`,code:v,visualize:()=>B(R)},{id:`game-map-dfs`,name:`깊이 우선 탐색 (백트래킹)`,rank:`TRAP`,trap:`slow`,timeComplexity:`지수 시간`,spaceComplexity:`O(N × M) 재귀 스택`,verdict:`작은 맵은 통과하지만 효율성 테스트에서 시간 초과가 납니다.`,pros:[`재귀로 짧게 쓸 수 있습니다.`],cons:[`한 경로를 끝까지 간 뒤 되돌아와 다른 경로를 찾으므로, 모든 경로를 다 봐야 최솟값을 확정할 수 있습니다.`,`맵이 커지면 가능한 경로 수가 폭발적으로 늘어 시간 초과가 납니다.`,`경로가 길어지면 Python 기본 재귀 한도(1,000)를 넘겨 RecursionError가 날 수 있습니다.`],whyThisRank:`최단 거리는 "처음 도착한 순간"을 이용해야 빨리 끝납니다. DFS는 깊이 먼저 들어가므로 처음 도착한 경로가 가장 짧다는 보장이 없습니다.`,code:b,visualize:V}],checks:{cases:[{args:[u],expected:11},{args:[[[1,0,1,1,1],[1,0,1,0,1],[1,0,1,1,1],[1,1,1,0,0],[0,0,0,0,1]]],expected:-1},{args:[[[1,1],[1,1]]],expected:3},{args:[[[1,0],[1,1]]],expected:3},{args:[[[1,1,1,1]]],expected:4}],random:e=>{let t=()=>1+Math.floor(e()*4),[n,r]=[t(),t()];for(;n===1&&r===1;)[n,r]=[t(),t()];return[Array.from({length:n},(t,i)=>Array.from({length:r},(t,a)=>+(i===0&&a===0||i===n-1&&a===r-1||e()<.7)))]}}};export{H as default};