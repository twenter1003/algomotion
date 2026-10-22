import{n as e,t}from"./index-DQku_aTs.js";import{a as n,c as r,i,r as a,s as o}from"./shared-e6uNbDLo.js";import{t as s}from"./lane-BzDhdR3X.js";var c=5,l=3,u=[[1,2,1],[1,3,4],[2,3,1],[2,4,3],[3,4,1],[4,5,2]],d=99,f=Array.from({length:6},()=>[]);u.forEach(([e,t,n],r)=>{f[e].push({to:t,w:n,edgeIdx:r}),f[t].push({to:e,w:n,edgeIdx:r})});var p=e=>`[${e.slice(1).map(e=>e>=d?`∞`:String(e)).join(`, `)}]`;function m(n){for(let r of n.steps){let n=e(r);r.phases.forEach((e,i)=>{let a=n.phases[i],o=i<r.phases.length-1?140:r.isKeyframe?t:320,s=20*[...e.caption].length;if(a.end-a.start+o>=s)return;let c=Math.max(a.start,...a.actions.map(e=>e.start+e.duration))-a.start;e.actions.push({type:`wait`,ms:Math.ceil(s-o-c)})})}return n}var h={python:`import heapq

def solution(N, road, K):
    graph = [[] for _ in range(N + 1)]
    for a, b, c in road:
        graph[a].append((b, c))
        graph[b].append((a, c))

    dist = [float('inf')] * (N + 1)
    dist[1] = 0
    heap = [(0, 1)]  # (거리, 마을) 최소 힙

    while heap:
        d, now = heapq.heappop(heap)
        if d > dist[now]:
            continue  # 이미 더 짧은 길을 찾았으면 건너뜁니다
        for nxt, w in graph[now]:
            nd = d + w
            if nd < dist[nxt]:  # 더 짧은 길을 찾으면 갱신합니다
                dist[nxt] = nd
                heapq.heappush(heap, (nd, nxt))

    return sum(1 for d in dist[1:] if d <= K)`,javascript:`function solution(N, road, K) {
  const graph = Array.from({ length: N + 1 }, () => []);
  for (const [a, b, c] of road) {
    graph[a].push([b, c]);
    graph[b].push([a, c]);
  }

  const dist = Array(N + 1).fill(Infinity);
  dist[1] = 0;
  const heap = [[0, 1]]; // [거리, 마을] — 가장 짧은 것부터 꺼냅니다

  while (heap.length > 0) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const [d, now] = heap.shift();
    if (d > dist[now]) continue; // 이미 더 짧은 길을 찾았으면 건너뜁니다
    for (const [nxt, w] of graph[now]) {
      const nd = d + w;
      if (nd < dist[nxt]) { // 더 짧은 길을 찾으면 갱신합니다
        dist[nxt] = nd;
        heap.push([nd, nxt]);
      }
    }
  }

  return dist.slice(1).filter((d) => d <= K).length;
}`},g={start:i(h,[`dist = [float`,`dist[1] = 0`,`heap = [(0, 1)]`],[`const dist = Array`,`dist[1] = 0`,`const heap = [[0, 1]]`]),pop:i(h,[`while heap:`,`d, now = heapq.heappop(heap)`],[`while (heap.length > 0)`,`const [d, now] = heap.shift()`]),skip:i(h,[`if d > dist[now]:`,`continue`],[`if (d > dist[now]) continue`]),relax:i(h,[`for nxt, w in graph[now]:`,`nd = d + w`,`if nd < dist[nxt]:`],[`for (const [nxt, w] of graph[now])`,`const nd = d + w`,`if (nd < dist[nxt])`]),push:i(h,[`dist[nxt] = nd`,`heapq.heappush(heap, (nd, nxt))`],[`dist[nxt] = nd`,`heap.push([nd, nxt])`]),done:i(h,[`return sum(1 for d in dist[1:] if d <= K)`],[`return dist.slice(1).filter((d) => d <= K).length`])},_={python:`def solution(N, road, K):
    dist = [float('inf')] * (N + 1)
    dist[1] = 0

    for _ in range(N - 1):  # 최대 N - 1번 모든 도로를 살핍니다
        updated = False
        for a, b, c in road:
            if dist[a] + c < dist[b]:
                dist[b] = dist[a] + c
                updated = True
            if dist[b] + c < dist[a]:
                dist[a] = dist[b] + c
                updated = True
        if not updated:
            break  # 더 줄어든 거리가 없으면 일찍 마칩니다

    return sum(1 for d in dist[1:] if d <= K)`,javascript:`function solution(N, road, K) {
  const dist = Array(N + 1).fill(Infinity);
  dist[1] = 0;

  for (let round = 0; round < N - 1; round++) { // 최대 N - 1번 모든 도로를 살핍니다
    let updated = false;
    for (const [a, b, c] of road) {
      if (dist[a] + c < dist[b]) {
        dist[b] = dist[a] + c;
        updated = true;
      }
      if (dist[b] + c < dist[a]) {
        dist[a] = dist[b] + c;
        updated = true;
      }
    }
    if (!updated) break; // 더 줄어든 거리가 없으면 일찍 마칩니다
  }

  return dist.slice(1).filter((d) => d <= K).length;
}`},v={start:i(_,[`dist = [float`,`dist[1] = 0`],[`const dist = Array`,`dist[1] = 0`]),round:i(_,[`for _ in range(N - 1):`,`for a, b, c in road:`,`if dist[a] + c < dist[b]:`],[`for (let round = 0`,`for (const [a, b, c] of road)`,`if (dist[a] + c < dist[b])`]),stop:i(_,[`if not updated:`,`break`],[`if (!updated) break`]),done:i(_,[`return sum(1 for d in dist[1:] if d <= K)`],[`return dist.slice(1).filter((d) => d <= K).length`])},y={python:`# 주의: 처음 방문할 때 거리를 확정해 버리는 오답 풀이입니다
from collections import deque

def solution(N, road, K):
    graph = [[] for _ in range(N + 1)]
    for a, b, c in road:
        graph[a].append((b, c))
        graph[b].append((a, c))

    dist = [float('inf')] * (N + 1)
    visited = [False] * (N + 1)
    dist[1] = 0
    visited[1] = True
    queue = deque([1])

    while queue:
        now = queue.popleft()
        for nxt, w in graph[now]:
            if not visited[nxt]:  # 첫 방문에서 바로 확정해 돌아가는 빠른 길을 놓칩니다
                visited[nxt] = True
                dist[nxt] = dist[now] + w
                queue.append(nxt)

    return sum(1 for d in dist[1:] if d <= K)`,javascript:`// 주의: 처음 방문할 때 거리를 확정해 버리는 오답 풀이입니다
function solution(N, road, K) {
  const graph = Array.from({ length: N + 1 }, () => []);
  for (const [a, b, c] of road) {
    graph[a].push([b, c]);
    graph[b].push([a, c]);
  }

  const dist = Array(N + 1).fill(Infinity);
  const visited = Array(N + 1).fill(false);
  dist[1] = 0;
  visited[1] = true;
  const queue = [1];
  let head = 0;

  while (head < queue.length) {
    const now = queue[head++];
    for (const [nxt, w] of graph[now]) {
      if (!visited[nxt]) { // 첫 방문에서 바로 확정해 돌아가는 빠른 길을 놓칩니다
        visited[nxt] = true;
        dist[nxt] = dist[now] + w;
        queue.push(nxt);
      }
    }
  }

  return dist.slice(1).filter((d) => d <= K).length;
}`},b={start:i(y,[`dist[1] = 0`,`visited[1] = True`,`queue = deque([1])`],[`dist[1] = 0`,`visited[1] = true`,`const queue = [1]`]),pop:i(y,[`while queue:`,`now = queue.popleft()`],[`while (head < queue.length)`,`const now = queue[head++]`]),look:i(y,[`for nxt, w in graph[now]:`,`if not visited[nxt]:`],[`for (const [nxt, w] of graph[now])`,`if (!visited[nxt])`]),mark:i(y,[`visited[nxt] = True`,`dist[nxt] = dist[now] + w`,`queue.append(nxt)`],[`visited[nxt] = true`,`dist[nxt] = dist[now] + w`,`queue.push(nxt)`]),done:i(y,[`return sum(1 for d in dist[1:] if d <= K)`],[`return dist.slice(1).filter((d) => d <= K).length`])},x=54,S=500,C=350,w={x:0,y:0,w:S,h:C},T={1:[66,178],2:[200,102],3:[200,254],4:[336,178],5:[448,178]},E=[[118,114],[118,224],[208,168],[272,114],[272,224],[380,150]],D={id:`lane`,x:42,y:6,slotW:78,slotH:30,gap:6,max:5,foldable:!0},O=e=>({x:T[e][0]-x/2,y:T[e][1]-x/2,w:x,h:x}),k=e=>`v:${e}`,A=e=>`e:${e}`,j=e=>`w:${e}`;function M(e,t){let[[n,r],[i,a]]=[T[e],T[t]],o=Math.hypot(i-n,a-r),[s,c]=[(i-n)/o,(a-r)/o],l=x/2/Math.max(Math.abs(s),Math.abs(c))+3;return[[n+s*l,r+c*l],[i-s*l,a-c*l]]}function N(e){let t=[];e?t.push({id:`lane:label`,kind:`text`,rect:{x:4,y:6,w:34,h:30},text:e},{id:`lane:bg`,kind:`zone`,rect:{x:38,y:4,w:458,h:34}}):t.push({id:`top:info`,kind:`text`,rect:{x:12,y:8,w:476,h:24},tone:`muted`,text:`모든 도로를 반복 확인해 최단 시간을 줄입니다`}),u.forEach(([e,n,r],i)=>{t.push({id:A(i),kind:`line`,rect:w,tone:`trail`,points:M(e,n)}),t.push({id:j(i),kind:`text`,rect:{x:E[i][0],y:E[i][1],w:28,h:20},tone:`muted`,text:String(r)})});for(let e=1;e<=c;e++)t.push({id:k(e),kind:`cell`,rect:O(e),tone:e===1?`current`:`plain`,text:`${e}번`,sub:e===1?`0`:`∞`});return t.push({id:`count`,kind:`token`,rect:{x:8,y:312,w:148,h:30},tone:`plain`,text:`K ≤ ${l} 배달: 1곳`}),{width:S,height:C,items:t}}var P=(e,t,n=!1)=>({type:`set`,id:k(e),patch:t,...n?{pop:n}:{}}),F=(e,t)=>({type:`set`,id:A(e),patch:{tone:t}}),I=e=>({type:`wait`,ms:e}),L=()=>o([{type:`unfocus`},{type:`clearMarks`}]),R=(e,t=`plain`)=>({type:`set`,id:`count`,patch:{text:`K ≤ ${l} 배달: ${e}곳`,tone:t},pop:!0});function z(){let e=new r(N(`힙`)),t=new s(e,D),i=[d,0,d,d,d,d],c=[,,,,,,].fill(-1),u=[],h=0,_=0,v=`-`,y=`-`,b=()=>`[${u.map(e=>`(${e.d},${e.v}번)`).join(`, `)}]`,x=()=>i.slice(1).filter(e=>e<=l).length,S=()=>({work:_,variables:{now:v,d:y,K:l,dist:p(i),heap:b()}}),C=`h:${++h}`;for(u.push({id:C,d:0,v:1}),e.step({title:`1번 마을에서 출발 (거리 0)`,codeHighlights:g.start,...S()}),e.phase(`시작`,`1번 마을의 최단 시간을 0, 나머지를 ∞로 두고 최소 힙에 1번(0)을 넣습니다.`,g.start),t.push({id:C,text:`1번(0)`},k(1)),e.do(I(400));u.length>0;){let r=u.shift();if(v=r.v,y=r.d,r.d>i[r.v]){e.step({title:`${r.v}번(${r.d}) 꺼내기 — 이미 더 짧은 시간 ${i[r.v]} 있음`,codeHighlights:g.skip,...S()}),e.phase(`꺼내기`,`힙에서 ${r.v}번(시간 ${r.d})을 꺼냅니다.`,g.pop),t.shift(k(r.v)),e.phase(`건너뛰기`,`${r.v}번은 이미 최단 시간 ${a(i[r.v],`으로`,`로`)} 확정되어 있어 건너뜁니다.`,g.skip),e.do({type:`focus`,ids:[k(r.v)]},I(350),...L());continue}let s=[];for(let e of f[r.v]){_++;let t=r.d+e.w,n=i[e.to],a=t<n;a&&(i[e.to]=t),s.push({to:e.to,w:e.w,edgeIdx:e.edgeIdx,nd:t,old:n,improved:a})}let p=s.filter(e=>e.improved),m=[];for(let e of p){let t=`h:${++h}`;u.push({id:t,d:e.nd,v:e.to}),m.push({id:t,d:e.nd,v:e.to,edgeIdx:e.edgeIdx})}u.sort((e,t)=>e.d-t.d||e.v-t.v),e.step({title:p.length?`${r.v}번(시간 ${r.d}) 확정 → ${p.map(e=>`${e.to}번(${e.nd})`).join(`, `)} 갱신`:`${r.v}번(시간 ${r.d}) 확정 — 더 줄어드는 이웃 없음`,codeHighlights:p.length?g.push:g.relax,...S()}),e.phase(`꺼내기`,`힙에서 가장 시간이 짧은 ${r.v}번(시간 ${r.d})을 꺼내 최단 시간을 확정합니다.`,g.pop),t.shift(k(r.v)),e.do(P(r.v,{tone:`current`},!0));let b=s.map(e=>e.improved?`${e.to}번은 ${r.d}+${e.w}=${n(e.nd)} (${e.old>=d?`∞`:e.old}보다 짧음)`:`${e.to}번은 ${r.d}+${e.w}=${e.nd} (기존 ${e.old} 유지)`).join(`, `);e.phase(`살피기`,`${r.v}번과 이어진 도로를 확인합니다: ${b}.`,g.relax),e.do({type:`focus`,ids:[k(r.v),...s.map(e=>k(e.to))]});for(let t of s)if(e.do({type:`arrow`,from:k(r.v),to:k(t.to),verdict:t.improved?`good`:`seen`,label:t.improved?`${t.nd} 단축!`:`${t.nd} ≥ ${t.old}`}),t.improved){let n=[P(t.to,{tone:`queued`,sub:String(t.nd)},!0),F(t.edgeIdx,`path`)];c[t.to]>=0&&c[t.to]!==t.edgeIdx&&n.push(F(c[t.to],`trail`)),c[t.to]=t.edgeIdx,e.do(...o(n,!0))}if(e.do(I(120),...L()),m.length){e.phase(`넣기`,`시간이 줄어든 ${m.map(e=>`${e.v}번(${e.d})`).join(`, `)}을 최소 힙에 넣습니다.`,g.push);for(let e of m)t.push({id:e.id,text:`${e.v}번(${e.d})`},k(e.v));t.reorder(u.map(e=>e.id))}e.do(...o([P(r.v,{tone:r.d<=l?`visited`:`muted`}),R(x())]))}let w=x();return v=`-`,y=`-`,e.step({title:`K = ${l} 이하 배달 가능 마을: ${w}곳`,codeHighlights:g.done,...S(),answer:w,isKeyframe:!0}),e.phase(`결과 확인`,`최단 시간이 ${l} 이하인 마을은 1번(0), 2번(1), 3번(2), 4번(3)으로 모두 ${w}곳입니다.`,g.done),e.do(...o([...[1,2,3,4].map(e=>P(e,{tone:`path`},!0)),P(5,{tone:`muted`}),R(w,`good`)])),m(e.finish())}function B(){let e=new r(N()),t=[d,0,d,d,d,d],n=0,i=`-`,a=!1,s=()=>t.slice(1).filter(e=>e<=l).length,c=()=>({work:n,variables:{round:i,updated:a?`True`:`False`,K:l,dist:p(t)}});e.step({title:`1번 마을 시간 0으로 시작`,codeHighlights:v.start,...c()}),e.phase(`시작`,`힙 없이 배열만 두고, 매 라운드 모든 도로를 차례로 확인해 최단 시간을 줄입니다.`,v.start),e.do(I(600));for(let r=1;r<=4;r++){i=r,a=!1;let d=[];if(u.forEach(([e,r,i],o)=>{n+=2,t[e]+i<t[r]&&(t[r]=t[e]+i,a=!0,d.push({from:e,to:r,nd:t[r],edgeIdx:o})),t[r]+i<t[e]&&(t[e]=t[r]+i,a=!0,d.push({from:r,to:e,nd:t[e],edgeIdx:o}))}),d.length>0){e.step({title:`${r}라운드: 도로 ${u.length}개 모두 확인 → ${d.map(e=>`${e.to}번(${e.nd})`).join(`, `)} 갱신`,codeHighlights:v.round,...c()}),e.phase(`도로 훑기`,`${r}라운드에서 모든 도로를 양방향(${u.length*2}번) 비교해 ${d.map(e=>`${e.from}→${e.to}(${e.nd})`).join(`, `)}로 줄입니다.`,v.round);for(let t of d)e.do({type:`focus`,ids:[k(t.from),k(t.to)]}),e.do({type:`arrow`,from:k(t.from),to:k(t.to),verdict:`good`,label:`${t.nd} 단축`}),e.do(...o([P(t.to,{tone:t.nd<=l?`visited`:`explored`,sub:String(t.nd)},!0),F(t.edgeIdx,`path`)],!0));e.do(I(120),...L(),R(s()))}else{e.step({title:`${r}라운드: 더 줄어든 거리 없음 → 조기 종료`,codeHighlights:v.stop,...c()}),e.phase(`도로 훑기`,`${r}라운드에서 모든 도로를 다시 확인했지만 더 줄어드는 마을이 없어 반복을 마칩니다.`,v.stop),e.do(I(600));break}}let f=s();return i=`-`,e.step({title:`K = ${l} 이하 배달 가능 마을: ${f}곳`,codeHighlights:v.done,...c(),answer:f,isKeyframe:!0}),e.phase(`결과 확인`,`최단 시간이 ${l} 이하인 마을은 1, 2, 3, 4번으로 ${f}곳입니다. 힙 없이 풀었지만 도로 확인은 ${n}번으로 다익스트라(12번)보다 많습니다.`,v.done),e.do(...o([...[1,2,3,4].map(e=>P(e,{tone:`path`},!0)),P(5,{tone:`muted`}),R(f,`good`)])),m(e.finish())}function V(){let e=new r(N(`큐`)),t=new s(e,D),i=[d,0,d,d,d,d],a=[!1,!0,!1,!1,!1,!1],c=[1],u=0,h=`-`,g=()=>i.slice(1).filter(e=>e<=l).length,_=()=>({work:u,variables:{now:h,K:l,dist:p(i),queue:`[${c.join(`, `)}]`}});for(e.step({title:`1번 마을에서 BFS 시작`,codeHighlights:b.start,..._()}),e.phase(`시작`,`1번 마을을 방문 확정하고 큐에 넣습니다. 가중치를 고려하지 않고 처음 닿을 때 바로 거리를 확정합니다.`,b.start),t.push({id:`q:1`,text:`1번`},k(1)),e.do(I(400));c.length>0;){let r=c.shift();h=r;let s=[];for(let e of f[r]){u++;let t=i[r]+e.w,n=!a[e.to],o=!n&&t<i[e.to];n&&(a[e.to]=!0,i[e.to]=t,c.push(e.to)),s.push({to:e.to,w:e.w,edgeIdx:e.edgeIdx,nd:t,isNew:n,missedBetter:o})}let d=s.filter(e=>e.isNew),p=s.filter(e=>e.missedBetter);e.step({title:d.length?`${r}번 꺼내기 → ${d.map(e=>`${e.to}번(${e.nd})`).join(`, `)} 첫 방문 확정`:`${r}번 꺼내기 — 새로 방문할 마을 없음`,codeHighlights:d.length?b.mark:b.look,..._()}),e.phase(`꺼내기`,`큐에서 ${r}번(기록된 시간 ${i[r]})을 꺼냅니다.`,b.pop),t.shift(k(r)),e.do(P(r,{tone:`current`},!0));let m=s.map(e=>e.isNew?`${e.to}번은 첫 방문이라 시간 ${n(e.nd)} 확정`:e.missedBetter?`${e.to}번은 ${e.nd}로 더 빠르지만 이미 방문해 무시`:`${e.to}번은 이미 방문함`).join(`, `);e.phase(`살피기`,`${r}번의 이웃을 확인합니다: ${m}.`,d.length?b.mark:b.look),e.do({type:`focus`,ids:[k(r),...s.map(e=>k(e.to))]});for(let t of s){let n=t.isNew?`new`:t.missedBetter?`bad`:`seen`,a=t.isNew?`첫 방문 ${t.nd}`:t.missedBetter?`${t.nd} < ${i[t.to]} 무시!`:`방문함`;e.do({type:`arrow`,from:k(r),to:k(t.to),verdict:n,label:a}),t.isNew&&e.do(...o([P(t.to,{tone:`queued`,sub:String(t.nd)},!0),F(t.edgeIdx,`path`)],!0))}if(e.do(I(120),...L()),d.length){e.phase(`넣기`,`처음 방문한 ${d.map(e=>`${e.to}번`).join(`, `)}을 큐에 넣습니다.`,b.mark);for(let e of d)t.push({id:`q:${e.to}`,text:`${e.to}번`},k(e.to))}e.do(...o([P(r,{tone:i[r]<=l?`visited`:`bad`}),R(g())])),p.length&&e.do(I(150))}let v=g();return h=`-`,e.step({title:`내 답 ${v}곳, 정답은 4곳`,codeHighlights:b.done,..._(),answer:v,isKeyframe:!0}),e.phase(`오답 확인`,`1→3 직통(4)과 1→2→4(4)를 첫 방문에서 확정하는 바람에, 1→2→3(2)과 1→2→3→4(3)이라는 더 빠른 길을 놓쳤습니다. 내 답은 ${v}곳이지만 정답은 4곳입니다.`,b.done),e.do(...o([P(3,{tone:`bad`,tag:`실제 2`},!0),P(4,{tone:`bad`,tag:`실제 3`},!0),R(v,`bad`),{type:`add`,item:{id:`mine`,kind:`token`,rect:{x:210,y:312,w:96,h:30},tone:`bad`,text:`내 답 ${v}곳`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:314,y:312,w:96,h:30},tone:`good`,text:`정답 4곳`}}])),m(e.finish())}var H={id:`delivery`,title:`배달`,level:2,category:`graph`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/12978`,description:{summary:`1번부터 N번까지 번호가 붙은 마을들이 양방향 도로로 이어져 있고, 도로마다 지나는 데 걸리는 시간이 다릅니다. 1번 마을에 있는 음식점에서 출발해 K시간 이하로 배달할 수 있는 마을이 모두 몇 곳인지(1번 마을 포함) 구합니다.`,rules:[`마을의 개수 N은 1 이상 50 이하의 자연수`,`road의 길이는 1 이상 2,000 이하이고, 각 원소 [a, b, c]는 a번과 b번 마을을 잇는 도로의 소요 시간이 c라는 뜻 (1 ≤ c ≤ 10,000)`,`두 마을을 잇는 도로가 여러 개 있을 수 있음`,`배달 가능 시간 K는 1 이상 500,000 이하의 자연수`],examples:[{input:`N = 5, road = [[1,2,1],[2,3,3],[5,2,2],[1,4,2],[5,3,1],[5,4,2]], K = 3`,output:`4`},{input:`N = 6, road = [[1,2,1],[1,3,2],[2,3,2],[3,4,3],[3,5,2],[3,5,3],[5,6,1]], K = 4`,output:`4`}]},keyIntuitions:[`도로마다 걸리는 시간이 다르므로, 거쳐 간 도로 수가 적다고 해서 더 빨리 도착하는 것이 아닙니다. 1번 마을에서 모든 마을까지의 가중치 최단 시간을 구해야 합니다.`,`다익스트라 알고리즘은 최소 힙에서 지금까지 가장 짧은 시간의 마을을 꺼내 확정하고, 그 마을을 거쳐 이웃으로 가는 시간이 기존보다 짧아질 때만 갱신합니다.`,`두 마을 사이에 도로가 여러 개 있어도 "기존 최단 시간보다 짧을 때만 갱신"하는 규칙 하나면 가장 빠른 도로만 자연스럽게 반영됩니다.`],demo:{input:[c,u,l],label:`N = 5, road = [[1,2,1],[1,3,4],[2,3,1],[2,4,3],[3,4,1],[4,5,2]], K = 3`},workUnit:`이웃 도로를 살핀 횟수`,approaches:[{id:`delivery-dijkstra`,name:`다익스트라 (최소 힙)`,rank:`BEST`,timeComplexity:`O((N + E) log N)`,spaceComplexity:`O(N + E)`,verdict:`최소 힙으로 가장 가까운 마을부터 최단 시간을 확정해 나가며, 도로를 필요한 만큼만 살피는 정석 풀이입니다.`,pros:[`가장 짧은 시간의 마을부터 확정하므로 한 번 확정된 마을의 이웃 도로는 딱 한 번만 살핍니다.`,`두 마을 사이에 여러 도로가 있어도 별도 전처리 없이 더 짧은 시간만 남깁니다.`,`마을과 도로가 훨씬 많아져도 O((N + E) log N)으로 빠르게 동작합니다.`],cons:["최소 힙에 옛 기록이 남을 수 있어 꺼낼 때 `d > dist[now]`인지 한 줄 확인해야 합니다."],whyThisRank:`양수 가중치 그래프에서 한 출발점의 최단 거리를 구하는 가장 빠르고 표준적인 풀이입니다.`,code:h,visualize:z},{id:`delivery-bellman-ford`,name:`벨만-포드 (모든 도로 반복 완화)`,rank:`ALTERNATIVE`,timeComplexity:`O(N × E)`,spaceComplexity:`O(N)`,verdict:`힙 없이 이중 반복문만으로 짤 수 있지만, 이미 확정된 도로까지 매 라운드 다시 확인해 연산이 더 많습니다.`,pros:[`우선순위 큐(힙) 자료구조 없이 배열과 반복문만으로 간단하게 구현할 수 있습니다.`,`더 이상 줄어드는 거리가 없을 때 일찍 멈추면 실제 라운드 수를 줄일 수 있습니다.`],cons:[`매 라운드 모든 도로를 처음부터 끝까지 다시 살피므로 다익스트라보다 도로 확인 횟수가 훨씬 많습니다.`,`정점과 간선이 많은 문제에서는 시간 초과가 나기 쉽습니다(이 문제는 N ≤ 50이라 통과합니다).`],whyThisRank:`정답은 같고 코드가 짧지만, 다익스트라가 도로를 한 번씩만 살피는 데 비해 같은 도로를 여러 라운드 반복 확인하는 손해가 있어 대안으로 둡니다.`,code:_,visualize:B},{id:`delivery-first-visit-bfs`,name:`첫 방문에서 거리를 확정하는 BFS`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N + E)`,spaceComplexity:`O(N + E)`,verdict:`처음 닿았을 때 바로 방문 표시를 해 버리면, 여러 마을을 거쳐 더 빠르게 돌아가는 길을 무시해 오답이 나옵니다.`,pros:[`가중치 없는 BFS 코드를 거의 그대로 써서 구현이 익숙합니다.`],cons:[`1→3 직통 도로(시간 4)를 먼저 보았다는 이유만으로 3번을 확정해 버려, 1→2→3 우회 도로(시간 2)를 무시합니다.`,`그 여파로 3번을 거쳐 가는 4번 마을의 시간도 3이 아닌 4로 잘못 계산되어 배달 가능 마을에서 빠집니다.`],whyThisRank:"도로마다 시간이 다른 그래프에서는 먼저 발견한 길이 최단 경로라는 보장이 없습니다. 방문 여부(`visited`)로 막지 말고, 더 짧은 시간이 나올 때마다 갱신해야 합니다.",code:y,visualize:V}],checks:{cases:[{args:[5,[[1,2,1],[2,3,3],[5,2,2],[1,4,2],[5,3,1],[5,4,2]],3],expected:4},{args:[6,[[1,2,1],[1,3,2],[2,3,2],[3,4,3],[3,5,2],[3,5,3],[5,6,1]],4],expected:4},{args:[1,[[1,1,1]],1],expected:1},{args:[3,[[1,2,5],[1,2,2],[2,3,1]],3],expected:3},{args:[4,[[1,2,10],[2,3,10],[3,4,10]],5],expected:1},{args:[c,u,l],expected:4}],random:e=>{let t=2+Math.floor(e()*6),n=[];for(let r=2;r<=t;r++){let t=1+Math.floor(e()*(r-1));n.push([t,r,1+Math.floor(e()*10)])}let r=Math.floor(e()*t);for(let i=0;i<r;i++){let r=1+Math.floor(e()*t),i=1+Math.floor(e()*t);r!==i&&n.push([r,i,1+Math.floor(e()*10)])}return[t,n,1+Math.floor(e()*15)]}}};export{H as default};