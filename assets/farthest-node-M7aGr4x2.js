import{n as e,t}from"./index-DQku_aTs.js";import{a as n,c as r,i,s as a}from"./shared-e6uNbDLo.js";import{t as o}from"./lane-BzDhdR3X.js";var s=6,c=[[3,6],[4,3],[3,2],[1,3],[1,2],[2,4],[5,2]],l=Array.from({length:7},()=>[]);c.forEach(([e,t])=>{l[e].push(t),l[t].push(e)});var u=(e,t)=>`${Math.min(e,t)}-${Math.max(e,t)}`,d=new Map(c.map(([e,t],n)=>[u(e,t),n])),f=(e,t)=>d.get(u(e,t)),p=e=>`[${e.slice(1).map(e=>e<0||e>=99?`-`:String(e)).join(`, `)}]`;function m(n){for(let r of n.steps){let n=e(r);r.phases.forEach((e,i)=>{let a=n.phases[i],o=i<r.phases.length-1?140:r.isKeyframe?t:320,s=20*[...e.caption].length;if(a.end-a.start+o>=s)return;let c=Math.max(a.start,...a.actions.map(e=>e.start+e.duration))-a.start;e.actions.push({type:`wait`,ms:Math.ceil(s-o-c)})})}return n}var h={python:`from collections import deque

def solution(n, edge):
    graph = [[] for _ in range(n + 1)]
    for a, b in edge:
        graph[a].append(b)
        graph[b].append(a)

    dist = [-1] * (n + 1)
    dist[1] = 0
    queue = deque([1])

    while queue:
        now = queue.popleft()
        for nxt in graph[now]:
            if dist[nxt] == -1:  # 처음 닿는 순간이 곧 최단 거리입니다
                dist[nxt] = dist[now] + 1
                queue.append(nxt)

    farthest = max(dist)
    return dist.count(farthest)`,javascript:`function solution(n, edge) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edge) {
    graph[a].push(b);
    graph[b].push(a);
  }

  const dist = Array(n + 1).fill(-1);
  dist[1] = 0;
  const queue = [1];
  let head = 0; // shift() 대신 머리 인덱스를 씁니다

  while (head < queue.length) {
    const now = queue[head++];
    for (const nxt of graph[now]) {
      if (dist[nxt] === -1) { // 처음 닿는 순간이 곧 최단 거리입니다
        dist[nxt] = dist[now] + 1;
        queue.push(nxt);
      }
    }
  }

  const farthest = Math.max(...dist);
  return dist.filter((d) => d === farthest).length;
}`},g={start:i(h,[`dist = [-1] * (n + 1)`,`dist[1] = 0`,`queue = deque([1])`],[`const dist = Array(n + 1).fill(-1)`,`dist[1] = 0`,`const queue = [1]`]),pop:i(h,[`while queue:`,`now = queue.popleft()`],[`while (head < queue.length)`,`const now = queue[head++]`]),look:i(h,[`for nxt in graph[now]:`,`if dist[nxt] == -1:`],[`for (const nxt of graph[now])`,`if (dist[nxt] === -1)`]),push:i(h,[`dist[nxt] = dist[now] + 1`,`queue.append(nxt)`],[`dist[nxt] = dist[now] + 1`,`queue.push(nxt)`]),max:i(h,[`farthest = max(dist)`],[`const farthest = Math.max(...dist)`]),done:i(h,[`farthest = max(dist)`,`return dist.count(farthest)`],[`const farthest = Math.max(...dist)`,`return dist.filter((d) => d === farthest).length`])},_={python:`def solution(n, edge):
    INF = n + 1
    dist = [INF] * (n + 1)
    dist[1] = 0

    for _ in range(n - 1):  # 매 라운드 모든 간선을 훑으며 거리를 1씩 넓힙니다
        updated = False
        for a, b in edge:
            if dist[a] + 1 < dist[b]:
                dist[b] = dist[a] + 1
                updated = True
            if dist[b] + 1 < dist[a]:
                dist[a] = dist[b] + 1
                updated = True
        if not updated:
            break

    farthest = max(dist[1:])
    return dist[1:].count(farthest)`,javascript:`function solution(n, edge) {
  const INF = n + 1;
  const dist = Array(n + 1).fill(INF);
  dist[1] = 0;

  for (let round = 0; round < n - 1; round++) { // 매 라운드 모든 간선을 훑으며 거리를 1씩 넓힙니다
    let updated = false;
    for (const [a, b] of edge) {
      if (dist[a] + 1 < dist[b]) {
        dist[b] = dist[a] + 1;
        updated = true;
      }
      if (dist[b] + 1 < dist[a]) {
        dist[a] = dist[b] + 1;
        updated = true;
      }
    }
    if (!updated) break;
  }

  const slice = dist.slice(1);
  const farthest = Math.max(...slice);
  return slice.filter((d) => d === farthest).length;
}`},v={start:i(_,[`dist = [INF] * (n + 1)`,`dist[1] = 0`],[`const dist = Array(n + 1).fill(INF)`,`dist[1] = 0`]),round:i(_,[`for _ in range(n - 1):`,`for a, b in edge:`,`if dist[a] + 1 < dist[b]:`],[`for (let round = 0`,`for (const [a, b] of edge)`,`if (dist[a] + 1 < dist[b])`]),stop:i(_,[`if not updated:`,`break`],[`if (!updated) break`]),done:i(_,[`farthest = max(dist[1:])`,`return dist[1:].count(farthest)`],[`const farthest = Math.max(...slice)`,`return slice.filter((d) => d === farthest).length`])},y={python:`# 주의: DFS 방문 깊이를 최단 거리로 착각하는 오답 풀이입니다
import sys
sys.setrecursionlimit(30000)

def solution(n, edge):
    graph = [[] for _ in range(n + 1)]
    for a, b in edge:
        graph[a].append(b)
        graph[b].append(a)

    dist = [-1] * (n + 1)

    def dfs(now, d):
        dist[now] = d  # 처음 들어온 경로의 깊이를 그대로 거리로 적습니다
        for nxt in graph[now]:
            if dist[nxt] == -1:
                dfs(nxt, d + 1)

    dfs(1, 0)
    farthest = max(dist)
    return dist.count(farthest)`,javascript:`// 주의: DFS 방문 깊이를 최단 거리로 착각하는 오답 풀이입니다
function solution(n, edge) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edge) {
    graph[a].push(b);
    graph[b].push(a);
  }

  const dist = Array(n + 1).fill(-1);

  const dfs = (now, d) => {
    dist[now] = d; // 처음 들어온 경로의 깊이를 그대로 거리로 적습니다
    for (const nxt of graph[now]) {
      if (dist[nxt] === -1) dfs(nxt, d + 1);
    }
  };

  dfs(1, 0);
  const farthest = Math.max(...dist);
  return dist.filter((d) => d === farthest).length;
}`},b={start:i(y,[`dist = [-1] * (n + 1)`,`dfs(1, 0)`],[`const dist = Array(n + 1).fill(-1)`,`dfs(1, 0)`]),enter:i(y,[`def dfs(now, d):`,`dist[now] = d`],[`const dfs = (now, d) =>`,`dist[now] = d`]),look:i(y,[`for nxt in graph[now]:`,`if dist[nxt] == -1:`,`dfs(nxt, d + 1)`],[`for (const nxt of graph[now])`,`if (dist[nxt] === -1) dfs(nxt, d + 1)`]),done:i(y,[`farthest = max(dist)`,`return dist.count(farthest)`],[`const farthest = Math.max(...dist)`,`return dist.filter((d) => d === farthest).length`])},x=54,S=500,C=350,w={x:0,y:0,w:S,h:C},T={1:[70,178],2:[205,110],3:[205,246],4:[340,178],5:[440,96],6:[440,260]},E={id:`lane`,x:42,y:6,slotW:66,slotH:30,gap:6,max:6},D=e=>({x:T[e][0]-x/2,y:T[e][1]-x/2,w:x,h:x}),O=e=>`v:${e}`,k=e=>`e:${e}`;function A(e,t){let[[n,r],[i,a]]=[T[e],T[t]],o=Math.hypot(i-n,a-r),[s,c]=[(i-n)/o,(a-r)/o],l=x/2/Math.max(Math.abs(s),Math.abs(c))+3;return[[n+s*l,r+c*l],[i-s*l,a-c*l]]}function j(e){let t=[];e?t.push({id:`lane:label`,kind:`text`,rect:{x:4,y:6,w:34,h:30},text:e},{id:`lane:bg`,kind:`zone`,rect:{x:38,y:4,w:458,h:34}}):t.push({id:`top:info`,kind:`text`,rect:{x:12,y:8,w:476,h:24},tone:`muted`,text:`간선 목록을 반복 순회하며 1번에서의 거리를 구합니다`}),c.forEach(([e,n],r)=>{t.push({id:k(r),kind:`line`,rect:w,tone:`trail`,points:A(e,n)})});for(let e=1;e<=s;e++)t.push({id:O(e),kind:`cell`,rect:D(e),tone:e===1?`current`:`plain`,text:`${e}번`,sub:e===1?`거리 0`:`-`});return t.push({id:`count`,kind:`token`,rect:{x:8,y:312,w:164,h:30},tone:`plain`,text:`가장 먼 노드: -`}),{width:S,height:C,items:t}}var M=(e,t,n=!1)=>({type:`set`,id:O(e),patch:t,...n?{pop:n}:{}}),N=(e,t)=>({type:`set`,id:k(e),patch:{tone:t}}),P=e=>({type:`wait`,ms:e}),F=()=>a([{type:`unfocus`},{type:`clearMarks`}]),I=(e,t=`plain`)=>({type:`set`,id:`count`,patch:{text:e,tone:t},pop:!0});function L(){let e=new r(j(`큐`)),t=new o(e,E),i=Array(7).fill(-1);i[1]=0;let s=[1],c=0,u=`-`,d=`-`,h=()=>({work:c,variables:{now:u,farthest:d,dist:p(i),queue:`[${s.join(`, `)}]`}});for(e.step({title:`1번 노드에서 출발 (거리 0)`,codeHighlights:g.start,...h()}),e.phase(`시작`,`1번 노드의 거리를 0, 나머지를 -1(미방문)로 두고 큐에 1번을 넣습니다.`,g.start),t.push({id:`q:1`,text:`1번(0)`},O(1)),e.do(P(400));s.length>0;){let r=s.shift();u=r;let o=[];for(let e of l[r]){c++;let t=i[e]===-1;t&&(i[e]=i[r]+1,s.push(e)),o.push({to:e,isNew:t,d:i[e],eIdx:f(r,e)})}let p=o.filter(e=>e.isNew),m=Math.max(...i.slice(1));d=m,e.step({title:p.length?`${r}번(거리 ${i[r]}) 꺼내기 → ${p.map(e=>`${e.to}번(거리 ${e.d})`).join(`, `)} 발견`:`${r}번(거리 ${i[r]}) 꺼내기 — 새 이웃 없음`,codeHighlights:p.length?g.push:g.look,...h()}),e.phase(`꺼내기`,`큐 맨 앞에서 ${r}번(거리 ${i[r]})을 꺼냅니다.`,g.pop),t.shift(O(r)),e.do(M(r,{tone:`current`},!0));let _=o.map(e=>e.isNew?`${e.to}번은 처음이라 거리 ${n(e.d)} 기록`:`${e.to}번은 이미 거리 ${e.d}`).join(`, `);e.phase(`살피기`,`${r}번과 이어진 노드를 확인합니다: ${_}.`,p.length?g.push:g.look),e.do({type:`focus`,ids:[O(r),...o.map(e=>O(e.to))]});for(let t of o)e.do({type:`arrow`,from:O(r),to:O(t.to),verdict:t.isNew?`new`:`seen`,label:t.isNew?`거리 ${t.d}`:`방문함`}),t.isNew&&e.do(...a([M(t.to,{tone:`queued`,sub:`거리 ${t.d}`},!0),N(t.eIdx,`path`)],!0));if(e.do(P(120),...F()),p.length){e.phase(`넣기`,`새로 거리를 기록한 ${p.map(e=>`${e.to}번`).join(`, `)}을 큐 뒤에 넣습니다.`,g.push);for(let e of p)t.push({id:`q:${e.to}`,text:`${e.to}번(${e.d})`},O(e.to))}let v=i.slice(1).filter(e=>e===m).length;e.do(...a([M(r,{tone:`visited`}),I(`최대 거리 ${m} (${v}개)`)]))}u=`-`;let _=Math.max(...i.slice(1));d=_;let v=[1,2,3,4,5,6].filter(e=>i[e]===_),y=v.length;return e.step({title:`최대 거리 ${_} 찾기`,codeHighlights:g.max,...h()}),e.phase(`최댓값 찾기`,`모든 노드의 최단 거리가 구해졌습니다. 가장 먼 거리는 ${_}입니다.`,g.max),e.do(...a(v.map(e=>M(e,{tone:`chosen`},!0)))),e.step({title:`가장 먼 노드(거리 ${_}): ${v.map(e=>`${e}번`).join(`, `)} → ${y}개`,codeHighlights:g.done,...h(),answer:y,isKeyframe:!0}),e.phase(`결과 확인`,`거리가 ${_}인 노드는 ${v.map(e=>`${e}번`).join(`, `)}으로 모두 ${y}개입니다.`,g.done),e.do(...a([...v.map(e=>M(e,{tone:`path`},!0)),I(`가장 먼 노드: ${y}개`,`good`)])),m(e.finish())}function R(){let e=new r(j()),t=Array(7).fill(7);t[1]=0;let i=0,o=`-`,s=!1,l=()=>({work:i,variables:{round:o,updated:s?`True`:`False`,dist:p(t)}});e.step({title:`1번 노드 거리 0으로 초기화`,codeHighlights:v.start,...l()}),e.phase(`시작`,`큐 없이 거리 배열만 두고, 매 라운드 모든 간선을 훑으며 거리를 줄입니다.`,v.start),e.do(P(500));for(let r=1;r<=5;r++){o=r,s=!1;let u=[];if(c.forEach(([e,n],r)=>{i+=2,t[e]+1<t[n]&&(t[n]=t[e]+1,s=!0,u.push({from:e,to:n,nd:t[n],eIdx:r})),t[n]+1<t[e]&&(t[e]=t[n]+1,s=!0,u.push({from:n,to:e,nd:t[e],eIdx:r}))}),u.length>0){e.step({title:`${r}라운드: 간선 ${c.length}개 확인 → ${u.map(e=>`${e.to}번(거리 ${e.nd})`).join(`, `)} 갱신`,codeHighlights:v.round,...l()}),e.phase(`간선 훑기`,`${r}라운드에서 간선 ${c.length}개를 양방향(${c.length*2}번) 확인해 ${u.map(e=>`${e.to}번을 거리 ${n(e.nd)}`).join(`, `)} 갱신합니다.`,v.round);for(let t of u)e.do({type:`focus`,ids:[O(t.from),O(t.to)]}),e.do({type:`arrow`,from:O(t.from),to:O(t.to),verdict:`good`,label:`거리 ${t.nd}`}),e.do(...a([M(t.to,{tone:`visited`,sub:`거리 ${t.nd}`},!0),N(t.eIdx,`path`)],!0));e.do(P(120),...F())}else{e.step({title:`${r}라운드: 더 바뀌는 거리 없음 → 종료`,codeHighlights:v.stop,...l()}),e.phase(`간선 훑기`,`${r}라운드에서 모든 간선을 다시 확인했지만 더 줄어드는 거리가 없어 멈춥니다.`,v.stop),e.do(P(500));break}}o=`-`;let u=Math.max(...t.slice(1)),d=[1,2,3,4,5,6].filter(e=>t[e]===u),f=d.length;return e.step({title:`가장 먼 노드(거리 ${u}): ${f}개`,codeHighlights:v.done,...l(),answer:f,isKeyframe:!0}),e.phase(`결과 확인`,`최대 거리는 ${u}이고 4, 5, 6번 ${f}개입니다. 간선 확인 횟수는 ${i}번으로 BFS(14번)보다 많습니다.`,v.done),e.do(...a([...d.map(e=>M(e,{tone:`path`},!0)),I(`가장 먼 노드: ${f}개`,`good`)])),m(e.finish())}function z(){let e=new r(j(`스택`)),t=new o(e,E),i=Array(7).fill(-1),s=[],c=0,u=`-`,d=()=>({work:c,variables:{now:u,dist:p(i),stack:`[${s.join(`, `)}]`}});e.step({title:`1번 노드에서 DFS 시작`,codeHighlights:b.start,...d()}),e.phase(`시작`,`DFS로 한 길을 끝까지 파고들며 처음 닿았을 때의 깊이를 거리로 적습니다.`,b.start),e.do(P(500));let h=(r,o,p)=>{i[r]=o,s.push(r),u=r;let m=[];for(let e of l[r]){c++;let t=i[e]===-1;if(m.push({to:e,isNew:t,eIdx:f(r,e)}),t)break}let g=m.find(e=>e.isNew)?.to;if(e.step({title:p?`${p}번 → ${r}번 진입 (깊이 ${o} 기록)`:`1번 진입 (깊이 0 기록)`,codeHighlights:b.enter,...d()}),e.phase(`들어가기`,p?`${p}번에서 ${r}번으로 들어가 거리를 ${n(o)} 기록합니다.`:`1번에서 출발해 거리를 0으로 기록합니다.`,b.enter),t.push({id:`s:${r}`,text:`${r}번(${o})`},O(r)),e.do(...a([M(r,{tone:`current`,sub:`거리 ${o}`},!0),...p?[M(p,{tone:`trail`}),N(f(p,r),`path`)]:[]])),g!==void 0){e.phase(`살피기`,`${r}번의 이웃을 보다가 아직 방문 전인 ${g}번으로 바로 파고듭니다.`,b.look),e.do({type:`focus`,ids:[O(r),...m.map(e=>O(e.to))]});for(let t of m)e.do({type:`arrow`,from:O(r),to:O(t.to),verdict:t.isNew?`new`:`seen`,label:t.isNew?`깊이 ${o+1} 진입`:`방문함`});e.do(P(120),...F())}for(let e=0;e<l[r].length;e++){let t=l[r][e];e>=m.length&&c++,i[t]===-1&&h(t,o+1,r)}s.pop(),t.pop(O(r)),e.do(M(r,{tone:`visited`}))};h(1,0),u=`-`;let g=Math.max(...i.slice(1)),_=i.slice(1).filter(e=>e===g).length;return e.step({title:`내 답 ${_}개(5번 거리 ${g}), 정답은 3개`,codeHighlights:b.done,...d(),answer:_,isKeyframe:!0}),e.phase(`오답 확인`,`1→2 직통(거리 1)을 두고 1→3→4→2(거리 3)로 돌아가 기록하는 바람에, 2번(3)과 5번(4)의 거리가 부풀려져 최대 거리 노드가 5번 ${_}개만 나왔습니다. 정답은 4, 5, 6번 3개입니다.`,b.done),e.do(...a([M(2,{tone:`bad`,tag:`실제 1`},!0),M(5,{tone:`bad`,tag:`실제 2`},!0),I(`내 답: ${_}개`,`bad`),{type:`add`,item:{id:`mine`,kind:`token`,rect:{x:200,y:312,w:96,h:30},tone:`bad`,text:`내 답 ${_}개`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:304,y:312,w:96,h:30},tone:`good`,text:`정답 3개`}}])),m(e.finish())}var B={id:`farthest-node`,title:`가장 먼 노드`,level:3,category:`graph`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/49189`,description:{summary:`1번부터 n번까지 번호가 붙은 노드가 양방향 간선으로 이어져 있습니다. 1번 노드에서 각 노드로 최단 경로로 이동했을 때, 거치는 간선의 개수가 가장 많은 노드가 모두 몇 개인지 구합니다.`,rules:[`노드의 개수 n은 2 이상 20,000 이하`,`간선은 양방향이며 1개 이상 50,000개 이하`,`edge 배열의 각 원소 [a, b]는 a번 노드와 b번 노드 사이에 간선이 있다는 뜻`],examples:[{input:`n = 6, vertex = [[3, 6], [4, 3], [3, 2], [1, 3], [1, 2], [2, 4], [5, 2]]`,output:`3`}]},keyIntuitions:[`모든 간선의 가중치가 1(간선 개수)이므로, 1번에서 시작하는 너비 우선 탐색(BFS)으로 처음 도달하는 순간의 깊이가 곧 최단 거리입니다.`,`dist 배열을 -1로 초기화해 두고 미방문 확인과 거리 기록을 한 번에 처리하면 O(N + E)로 끝납니다.`,`사이클이 있는 그래프에서 DFS를 쓰면 돌아서 들어간 길의 깊이가 먼저 기록되어 최단 거리가 깨집니다.`],demo:{input:[s,c],label:`n = 6, vertex = [[3,6],[4,3],[3,2],[1,3],[1,2],[2,4],[5,2]]`},workUnit:`간선을 따라 이웃을 확인한 횟수`,approaches:[{id:`farthest-bfs`,name:`너비 우선 탐색 (BFS 거리 배열)`,rank:`BEST`,timeComplexity:`O(N + E)`,spaceComplexity:`O(N + E)`,verdict:`1번 노드에서 가까운 순서대로 한 겹씩 넓혀 가며 각 노드의 최단 거리를 한 번에 확정하는 정석 풀이입니다.`,pros:[`가중치가 없는 그래프에서 처음 방문하는 순간이 항상 최단 거리임이 보장됩니다.`,`모든 노드와 간선을 딱 한 번씩만 확인해 O(N + E)로 가장 빠릅니다.`,`dist 배열 하나로 방문 여부(-1인지)와 최단 거리를 동시에 관리할 수 있습니다.`],cons:[`JavaScript에서는 배열의 shift()가 O(N)이므로 머리 인덱스(head)를 두고 꺼내야 합니다.`],whyThisRank:`간선 가중치가 모두 같은 최단 거리 문제의 표준 해법으로, 시간·공간 복잡도와 구현 간결성 모두 최고입니다.`,code:h,visualize:L},{id:`farthest-bellman`,name:`벨만-포드 (간선 반복 완화)`,rank:`ALTERNATIVE`,timeComplexity:`O(N × E)`,spaceComplexity:`O(N)`,verdict:`큐와 인접 리스트 없이 간선 배열만 반복 순회해 답은 맞히지만, 같은 간선을 여러 라운드 다시 확인해 느립니다.`,pros:[`인접 리스트나 큐를 만들지 않고 주어진 edge 배열을 그대로 순회해 코드가 단순합니다.`,`더 이상 갱신이 일어나지 않는 라운드에서 바로 멈춰 불필요한 뒷 라운드를 줄입니다.`],cons:[`매 라운드 모든 간선을 처음부터 다시 확인하므로 BFS보다 간선 확인 횟수가 배수로 늘어납니다.`,`최악의 경우(일렬 그래프에서 역순 간선) O(N × E) 시간이 걸려 큰 입력에서는 느립니다.`],whyThisRank:`최단 거리를 정확히 구하지만, 큐를 쓰는 BFS가 간선을 한 번씩만 보는 데 비해 매 라운드 간선 전체를 다시 훑는 손해가 있어 대안으로 둡니다.`,code:_,visualize:R},{id:`farthest-dfs-trap`,name:`깊이 우선 탐색 (DFS 깊이 기록)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N + E)`,spaceComplexity:`O(N + E)`,verdict:`한 경로를 끝까지 파고들며 처음 닿은 깊이를 거리로 적으면, 돌아서 간 먼 길이 기록되어 오답이 나옵니다.`,pros:[`재귀 함수 몇 줄로 작성할 수 있어 겉보기에는 간단합니다.`],cons:[`1번과 직접 이어진 2번(실제 거리 1)을 1→3→4→2 순서로 먼저 방문해 거리 3으로 잘못 기록합니다.`,`2번에 연결된 5번의 거리도 4로 부풀려져 가장 먼 노드의 개수가 틀립니다.`],whyThisRank:`트리가 아닌 일반 그래프에는 여러 경로가 있어 DFS의 첫 방문 깊이가 최단 거리가 아닙니다. 최단 간선 수는 반드시 BFS로 구해야 합니다.`,code:y,visualize:z}],checks:{cases:[{args:[6,[[3,6],[4,3],[3,2],[1,3],[1,2],[2,4],[5,2]]],expected:3},{args:[2,[[1,2]]],expected:1},{args:[4,[[1,2],[1,3],[1,4]]],expected:3},{args:[5,[[1,2],[2,3],[3,4],[4,5]]],expected:1},{args:[5,[[1,2],[1,3],[2,4],[3,4],[4,5]]],expected:1}],random:e=>{let t=2+Math.floor(e()*7),n=new Set,r=[],i=(e,t)=>{if(e===t)return;let i=u(e,t);n.has(i)||(n.add(i),r.push([e,t]))};for(let n=2;n<=t;n++)i(n,1+Math.floor(e()*(n-1)));let a=Math.floor(e()*t);for(let n=0;n<a;n++)i(1+Math.floor(e()*t),1+Math.floor(e()*t));return[t,r]}}};export{B as default};