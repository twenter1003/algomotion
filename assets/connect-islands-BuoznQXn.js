import{n as e,t}from"./index-D3a9ZpZK.js";import{a as n,c as r,i,l as a,r as o}from"./shared-CL29HWIp.js";var s=5,c=[[0,2,3],[0,1,1],[1,2,2],[3,4,3],[2,3,4],[1,3,5],[2,4,6]],l=[...c].sort((e,t)=>e[2]-t[2]||e[0]-t[0]||e[1]-t[1]),u=(e,t)=>`${Math.min(e,t)}-${Math.max(e,t)}`,d=new Map(c.map(([e,t],n)=>[u(e,t),n])),f=(e,t)=>d.get(u(e,t));function p(n){for(let r of n.steps){let n=e(r);r.phases.forEach((e,i)=>{let a=n.phases[i],o=i<r.phases.length-1?140:r.isKeyframe?t:320,s=20*[...e.caption].length;if(a.end-a.start+o>=s)return;let c=Math.max(a.start,...a.actions.map(e=>e.start+e.duration))-a.start;e.actions.push({type:`wait`,ms:Math.ceil(s-o-c)})})}return n}var m={python:`def solution(n, costs):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total = 0
    for a, b, cost in sorted(costs, key=lambda e: e[2]):
        ra, rb = find(a), find(b)
        if ra != rb:  # 서로 다른 묶음일 때만 다리를 놓습니다
            parent[rb] = ra
            total += cost
    return total`,javascript:`function solution(n, costs) {
  const parent = Array.from({ length: n }, (_, i) => i);

  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  let total = 0;
  const sorted = [...costs].sort((a, b) => a[2] - b[2]);
  for (const [a, b, cost] of sorted) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) { // 서로 다른 묶음일 때만 다리를 놓습니다
      parent[rb] = ra;
      total += cost;
    }
  }
  return total;
}`},h={start:i(m,[`parent = list(range(n))`,`for a, b, cost in sorted`],[`const parent = Array.from`,`const sorted = [...costs].sort`]),check:i(m,[`for a, b, cost in sorted`,`ra, rb = find(a), find(b)`,`if ra != rb:`],[`for (const [a, b, cost] of sorted)`,`const ra = find(a)`,`if (ra !== rb)`]),union:i(m,[`parent[rb] = ra`,`total += cost`],[`parent[rb] = ra`,`total += cost`]),done:i(m,[`return total`],[`return total`])},g={python:`def solution(n, costs):
    connected = [False] * n
    connected[0] = True  # 0번 섬에서 시작합니다
    total = 0

    for _ in range(n - 1):
        best_cost = float('inf')
        best_next = -1
        for a, b, cost in costs:  # 매번 모든 다리를 훑어 가장 싼 다리를 찾습니다
            if connected[a] != connected[b] and cost < best_cost:
                best_cost = cost
                best_next = b if connected[a] else a
        connected[best_next] = True
        total += best_cost

    return total`,javascript:`function solution(n, costs) {
  const connected = Array(n).fill(false);
  connected[0] = true; // 0번 섬에서 시작합니다
  let total = 0;

  for (let step = 0; step < n - 1; step++) {
    let bestCost = Infinity;
    let bestNext = -1;
    for (const [a, b, cost] of costs) { // 매번 모든 다리를 훑어 가장 싼 다리를 찾습니다
      if (connected[a] !== connected[b] && cost < bestCost) {
        bestCost = cost;
        bestNext = connected[a] ? b : a;
      }
    }
    connected[bestNext] = true;
    total += bestCost;
  }

  return total;
}`},_={start:i(g,[`connected = [False] * n`,`connected[0] = True`],[`const connected = Array(n).fill(false)`,`connected[0] = true`]),scan:i(g,[`for a, b, cost in costs:`,`if connected[a] != connected[b] and cost < best_cost:`],[`for (const [a, b, cost] of costs)`,`if (connected[a] !== connected[b] && cost < bestCost)`]),pick:i(g,[`connected[best_next] = True`,`total += best_cost`],[`connected[bestNext] = true`,`total += bestCost`]),done:i(g,[`return total`],[`return total`])},v={python:`# 주의: 대표 번호(Union-Find) 대신 단순 visited 배열만 쓰는 오답 풀이입니다
def solution(n, costs):
    visited = [False] * n
    total = 0

    for a, b, cost in sorted(costs, key=lambda e: e[2]):
        # 두 섬 모두 방문 기록이 있으면 이미 이어졌다고 착각합니다
        if visited[a] and visited[b]:
            continue
        visited[a] = True
        visited[b] = True
        total += cost

    return total`,javascript:`// 주의: 대표 번호(Union-Find) 대신 단순 visited 배열만 쓰는 오답 풀이입니다
function solution(n, costs) {
  const visited = Array(n).fill(false);
  let total = 0;

  const sorted = [...costs].sort((a, b) => a[2] - b[2]);
  for (const [a, b, cost] of sorted) {
    // 두 섬 모두 방문 기록이 있으면 이미 이어졌다고 착각합니다
    if (visited[a] && visited[b]) continue;
    visited[a] = true;
    visited[b] = true;
    total += cost;
  }

  return total;
}`},y={start:i(v,[`visited = [False] * n`,`for a, b, cost in sorted`],[`const visited = Array(n).fill(false)`,`const sorted = [...costs].sort`]),skip:i(v,[`if visited[a] and visited[b]:`,`continue`],[`if (visited[a] && visited[b]) continue`]),pick:i(v,[`visited[a] = True`,`visited[b] = True`,`total += cost`],[`visited[a] = true`,`visited[b] = true`,`total += cost`]),done:i(v,[`return total`],[`return total`])},b=54,x=500,S=350,C={x:0,y:0,w:x,h:S},w={0:[68,122],1:[68,250],2:[236,186],3:[364,250],4:[436,122]},T=[[144,126],[36,176],[144,226],[292,198],[208,262],[324,126],[412,186]],E=e=>({x:w[e][0]-b/2,y:w[e][1]-b/2,w:b,h:b}),D=e=>({x:8+e*70,y:6,w:64,h:34}),O=e=>`v:${e}`,k=e=>`e:${e}`,A=e=>`w:${e}`,j=e=>`c:${e}`;function M(e,t){let[[n,r],[i,a]]=[w[e],w[t]],o=Math.hypot(i-n,a-r),[s,c]=[(i-n)/o,(a-r)/o],l=b/2/Math.max(Math.abs(s),Math.abs(c))+3;return[[n+s*l,r+c*l],[i-s*l,a-c*l]]}function N(e,t){let n=[];e.forEach(([e,t,r],i)=>{n.push({id:j(i),kind:`token`,rect:D(i),tone:`plain`,text:`${e}-${t}(${r})`})}),c.forEach(([e,t,r],i)=>{n.push({id:k(i),kind:`line`,rect:C,tone:`trail`,points:M(e,t)}),n.push({id:A(i),kind:`text`,rect:{x:T[i][0],y:T[i][1],w:26,h:20},tone:`muted`,text:String(r)})});for(let e=0;e<s;e++)n.push({id:O(e),kind:`cell`,rect:E(e),tone:`plain`,text:`${e}번`,sub:t(e)});return n.push({id:`total`,kind:`token`,rect:{x:8,y:312,w:156,h:30},tone:`plain`,text:`총 비용 0 (0/4개)`}),{width:x,height:S,items:n}}var P=(e,t,n=!1)=>({type:`set`,id:O(e),patch:t,...n?{pop:n}:{}}),F=(e,t,n=!1)=>({type:`set`,id:j(e),patch:t,...n?{pop:n}:{}}),I=(e,t)=>({type:`set`,id:k(e),patch:{tone:t}}),L=e=>({type:`wait`,ms:e}),R=()=>r([{type:`unfocus`},{type:`clearMarks`}]),z=(e,t,n=`plain`)=>({type:`set`,id:`total`,patch:{text:`총 비용 ${e} (${t}/4개)`,tone:n},pop:!0});function B(){let e=new a(N(l,e=>`대표 ${e}`)),t=Array.from({length:s},(e,t)=>t),i=e=>{for(;t[e]!==e;)e=t[e];return e},o=0,c=0,u=0,d=`-`,m=()=>({work:u,variables:{bridge:d,picked:`${c}/4`,total:o,parent:`[${t.map((e,t)=>i(t)).join(`, `)}]`}});e.step({title:`다리를 비용 오름차순으로 정렬하고 대표 번호 초기화`,codeHighlights:h.start,...m()}),e.phase(`정렬·초기화`,`다리 7개를 비용이 싼 순서로 정렬하고, 각 섬의 대표 번호(parent)를 자기 자신으로 초기화합니다.`,h.start),e.do(L(500));for(let a=0;a<l.length;a++){let[p,g,_]=l[a],v=i(p),y=i(g),b=v!==y;u++,d=`${p}-${g}(비용 ${_})`,b&&(t[y]=v,o+=_,c++);let x=f(p,g);if(e.step({title:b?`다리 ${p}-${g}(비용 ${_}) 선택 — 묶음 ${v}와 ${y} 합치기 (총 비용 ${o})`:`다리 ${p}-${g}(비용 ${_}) 건너뜀 — 둘 다 대표 ${v} (사이클)`,codeHighlights:b?h.union:h.check,...m()}),e.phase(`대표 확인`,b?`${p}번의 대표는 ${v}, ${g}번의 대표는 ${n(y)} 서로 다른 묶음입니다.`:`${p}번과 ${g}번의 대표가 둘 다 ${n(v)} 이미 같은 묶음입니다.`,h.check),e.do({type:`focus`,ids:[j(a),O(p),O(g)]}),e.do({type:`arrow`,from:O(p),to:O(g),verdict:b?`good`:`bad`,label:b?`대표 ${v} ≠ ${y}`:`대표 ${v} = ${y}`}),b){e.phase(`다리 놓기`,`다리 ${p}-${g}(비용 ${_})를 건설하고 대표를 ${n(v)} 합칩니다. 총 비용은 ${o}입니다.`,h.union);let t=Array.from({length:s},(e,t)=>t).filter(e=>i(e)===v);e.do(...r([...R(),F(a,{tone:`good`},!0),I(x,`path`),...t.map(e=>P(e,{tone:`visited`,sub:`대표 ${i(e)}`},e===p||e===g)),z(o,c)]))}else e.phase(`건너뛰기`,`다리를 놓으면 사이클이 생기므로 건너뜁니다.`,h.check),e.do(...r([...R(),F(a,{tone:`muted`})]))}return d=`-`,e.step({title:`모든 섬 연결 완료 — 최소 비용 ${o}`,codeHighlights:h.done,...m(),answer:o,isKeyframe:!0}),e.phase(`결과 확인`,`다리 4개로 5개 섬이 모두 하나의 묶음(대표 0)으로 이어졌습니다. 최소 비용은 ${o}입니다.`,h.done),e.do(...r([...Array.from({length:s},(e,t)=>P(t,{tone:`path`},!0)),z(o,c,`good`)])),p(e.finish())}function V(){let e=new a(N(c,e=>e===0?`연결됨`:`대기`)),t=Array(s).fill(!1);t[0]=!0;let i=0,l=0,u=0,d=`-`,f=()=>`[${t.map((e,t)=>e?t:null).filter(e=>e!==null).join(`, `)}]`,m=()=>({work:u,variables:{round:d,picked:`${l}/4`,total:i,connected:f()}});e.step({title:`0번 섬에서 시작`,codeHighlights:_.start,...m()}),e.phase(`시작`,`0번 섬만 연결된 상태로 시작해, 매 단계마다 모든 다리를 훑어 새 섬으로 가는 가장 싼 다리를 고릅니다.`,_.start),e.do(P(0,{tone:`visited`,sub:`연결됨`},!0),L(400));for(let n=1;n<=4;n++){d=n;let a=1/0,s=-1,f=-1,p=-1,h=[];c.forEach(([e,n,r],i)=>{if(u++,t[e]!==t[n]){let o=t[e]?e:n,c=t[e]?n:e;h.push({idx:i,from:o,to:c,cost:r}),r<a&&(a=r,s=c,f=o,p=i)}}),t[s]=!0,i+=a,l++,e.step({title:`${n}단계: 다리 ${c.length}개 모두 확인 → ${f}-${s}(비용 ${a}) 선택`,codeHighlights:_.pick,...m()});let g=h.map(e=>`${e.from}-${e.to}(${e.cost})`).join(`, `);e.phase(`후보 찾기`,`모든 다리 ${c.length}개를 훑어 연결된 섬에서 밖으로 나가는 후보(${g}) 중 가장 싼 ${f}-${s}(비용 ${a})를 찾습니다.`,_.scan),e.do({type:`focus`,ids:[O(f),O(s),j(p)]}),e.do({type:`arrow`,from:O(f),to:O(s),verdict:`good`,label:`최소 비용 ${a}`}),e.phase(`다리 놓기`,`${s}번 섬을 연결하고 비용 ${o(a,`을`,`를`)} 더해 총 비용이 ${o(i,`이`,`가`)} 됩니다.`,_.pick),e.do(...r([...R(),F(p,{tone:`good`},!0),I(p,`path`),P(s,{tone:`visited`,sub:`연결됨`},!0),z(i,l)]))}return d=`-`,e.step({title:`모든 섬 연결 완료 — 최소 비용 ${i}`,codeHighlights:_.done,...m(),answer:i,isKeyframe:!0}),e.phase(`결과 확인`,`최소 비용은 ${n(i)} 같지만, 정렬 없이 매 단계 다리 ${c.length}개를 처음부터 다시 훑어 총 ${u}번 확인했습니다(크루스칼은 7번).`,_.done),e.do(...r([...Array.from({length:s},(e,t)=>P(t,{tone:`path`},!0)),z(i,l,`good`)])),p(e.finish())}function H(){let e=new a(N(l,()=>`미방문`)),t=Array(s).fill(!1),n=0,i=0,o=0,c=`-`,u=()=>({work:o,variables:{bridge:c,picked:`${i}/4`,total:n,visited:`[${t.map(e=>e?`T`:`F`).join(`, `)}]`}});e.step({title:`다리를 비용순 정렬하고 visited를 모두 False로 초기화`,codeHighlights:y.start,...u()}),e.phase(`시작`,`대표 번호 없이 단순 visited 배열만 두고, 두 섬 모두 visited가 True이면 건너뛰기로 합니다.`,y.start),e.do(L(500));for(let a=0;a<l.length;a++){let[s,d,p]=l[a];o++,c=`${s}-${d}(비용 ${p})`;let m=t[s]&&t[d],h=f(s,d);if(!m)t[s]=!0,t[d]=!0,n+=p,i++,e.step({title:`다리 ${s}-${d}(비용 ${p}) 선택 — visited[${s}], visited[${d}] = True`,codeHighlights:y.pick,...u()}),e.phase(`다리 놓기`,`${s}번과 ${d}번 중 아직 미방문인 섬이 있어 다리를 놓고 둘 다 방문 표시합니다.`,y.pick),e.do({type:`focus`,ids:[j(a),O(s),O(d)]}),e.do({type:`arrow`,from:O(s),to:O(d),verdict:`new`,label:`비용 +${p}`}),e.do(...r([...R(),F(a,{tone:`good`},!0),I(h,`path`),P(s,{tone:`visited`,sub:`방문함`},!0),P(d,{tone:`visited`,sub:`방문함`},!0),z(n,i)]));else{let t=s===2&&d===3;e.step({title:t?`다리 2-3(비용 4) 건너뜀! — {0,1,2}와 {3,4}가 끊어진 채 방치됨`:`다리 ${s}-${d}(비용 ${p}) 건너뜀 — 둘 다 visited = True`,codeHighlights:y.skip,...u()}),e.phase(`잘못된 건너뛰기`,t?`2번은 {0,1,2} 묶음, 3번은 {3,4} 묶음으로 서로 떨어져 있는데도 둘 다 visited가 True라는 이유만으로 다리 2-3을 건너뛰어 버립니다!`:`${s}번과 ${d}번 모두 visited가 True라며 건너뜁니다.`,y.skip),e.do({type:`focus`,ids:[j(a),O(s),O(d)]}),e.do({type:`arrow`,from:O(s),to:O(d),verdict:`bad`,label:t?`다른 묶음인데 무시!`:`둘 다 True`}),e.do(...r([...R(),F(a,{tone:t?`bad`:`muted`},t)]))}}return c=`-`,e.step({title:`내 답 ${n} (섬이 두 덩어리로 끊어짐), 정답은 10`,codeHighlights:y.done,...u(),answer:n,isKeyframe:!0}),e.phase(`오답 확인`,`{0, 1, 2}와 {3, 4} 두 묶음을 잇는 다리 2-3(비용 4)을 건너뛰어 다리를 ${i}개밖에 놓지 못했습니다. 내 답은 ${n}이지만 모든 섬을 잇는 정답은 10입니다.`,y.done),e.do(...r([P(0,{tone:`bad`,tag:`묶음 A`},!0),P(1,{tone:`bad`,tag:`묶음 A`},!0),P(2,{tone:`bad`,tag:`묶음 A`},!0),P(3,{tone:`explored`,tag:`묶음 B`}),P(4,{tone:`explored`,tag:`묶음 B`}),z(n,i,`bad`),{type:`add`,item:{id:`mine`,kind:`token`,rect:{x:200,y:312,w:92,h:30},tone:`bad`,text:`내 답 ${n}`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:300,y:312,w:92,h:30},tone:`good`,text:`정답 10`}}])),p(e.finish())}var U={id:`connect-islands`,title:`섬 연결하기`,level:3,category:`graph`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42861`,description:{summary:`n개의 섬 사이에 다리를 건설하는 비용(costs)이 주어질 때, 모든 섬이 서로 통행 가능하도록 다리를 놓는 데 필요한 최소 비용을 구합니다. 다리를 여러 번 건너 도달할 수만 있어도 통행 가능한 것으로 봅니다.`,rules:[`섬의 개수 n은 1 이상 100 이하`,`costs의 길이는 ((n − 1) × n) / 2 이하이고, 각 원소 [a, b, c]는 a번 섬과 b번 섬을 잇는 다리 비용이 c라는 뜻`,`같은 두 섬을 잇는 다리 정보는 중복해서 주어지지 않음`,`연결할 수 없는 섬은 주어지지 않음`],examples:[{input:`n = 4, costs = [[0,1,1],[0,2,2],[1,2,5],[1,3,1],[2,3,8]]`,output:`4`}]},keyIntuitions:[`모든 섬을 최소 비용으로 잇는 최소 신장 트리(MST) 문제입니다. 섬이 n개이면 사이클 없이 정확히 n − 1개의 다리만 고르면 됩니다.`,`크루스칼 알고리즘은 가장 싼 다리부터 차례로 보면서, 두 섬이 아직 다른 묶음일 때만 다리를 놓고 두 묶음을 하나로 합칩니다.`,`"이미 다리가 놓인 적이 있는 섬인지(visited)"가 아니라 "두 섬이 같은 묶음에 속하는지(유니온 파인드의 대표 번호)"를 확인해야 떨어진 두 묶음을 제대로 이을 수 있습니다.`],demo:{input:[s,c],label:`n = 5, costs = [[0,2,3],[0,1,1],[1,2,2],[3,4,3],[2,3,4],[1,3,5],[2,4,6]]`},workUnit:`다리 후보를 확인한 횟수`,approaches:[{id:`islands-kruskal`,name:`크루스칼 + 유니온 파인드`,rank:`BEST`,timeComplexity:`O(E log E)`,spaceComplexity:`O(N)`,verdict:`다리를 비용 오름차순으로 정렬한 뒤, 유니온 파인드로 서로 다른 묶음만 이어 나가는 정석 풀이입니다.`,pros:[`정렬한 뒤에는 다리를 앞에서부터 한 번씩만 확인하고, n − 1개를 고르는 즉시 멈출 수 있습니다.`,`유니온 파인드(경로 압축)로 두 섬이 같은 묶음인지 거의 O(1)에 판정합니다.`,`코드가 짧고 직관적이어서 최소 신장 트리 문제에서 가장 널리 쓰입니다.`],cons:[`대표 번호를 찾고 합치는 find/union 함수를 함께 작성해야 합니다.`],whyThisRank:`간선 목록이 바로 주어지는 문제에서 정렬 한 번과 유니온 파인드로 가장 빠르고 깔끔하게 풀 수 있는 표준 해법입니다.`,code:m,visualize:B},{id:`islands-prim-scan`,name:`프림 (매 단계 최소 다리 탐색)`,rank:`ALTERNATIVE`,timeComplexity:`O(N × E)`,spaceComplexity:`O(N)`,verdict:`유니온 파인드 없이 연결된 섬 집합을 하나씩 넓혀 가지만, 매 단계 모든 다리를 다시 훑어 확인 횟수가 많습니다.`,pros:[`항상 하나의 연결된 덩어리를 유지하며 넓혀 가므로 별도의 대표 번호(Union-Find) 자료구조가 필요 없습니다.`,`connected[a] != connected[b] 조건 하나로 사이클 없이 새 섬으로 가는 다리만 골라냅니다.`],cons:[`섬을 하나 추가할 때마다 costs 배열 전체를 처음부터 끝까지 다시 확인하므로 다리 확인 횟수가 O(N × E)로 늘어납니다.`,`힙을 쓰지 않으면 섬과 다리 수가 많을 때 크루스칼보다 느립니다.`],whyThisRank:`유니온 파인드를 잊었을 때 떠올리기 좋은 올바른 풀이지만, 크루스칼이 다리를 한 번씩만 보는 데 비해 매 단계 전체 다리를 반복 순회하는 손해가 있어 대안으로 둡니다.`,code:g,visualize:V},{id:`islands-visited-trap`,name:`visited 배열만으로 사이클 판정하기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(E log E)`,spaceComplexity:`O(N)`,verdict:`두 섬의 visited가 모두 True라고 건너뛰면, 서로 떨어져 만들어진 두 묶음을 영영 잇지 못해 오답이 나옵니다.`,pros:[`유니온 파인드 대신 불리언 배열 하나만 써서 코드가 아주 짧아 보입니다.`],cons:[`[0,1,1]과 [2,3,1]을 먼저 고르면 {0,1} 묶음과 {2,3} 묶음이 따로 생기는데, 1번과 2번 모두 visited가 True가 됩니다.`,`그 뒤 두 묶음을 이어 줄 [1,2,2] 다리를 만났을 때 둘 다 방문했다며 건너뛰어 섬이 두 덩어리로 끊어진 채 끝납니다.`],whyThisRank:`방문 여부(visited)는 "어느 한 다리라도 걸쳤는가"만 알려 줄 뿐 "어느 묶음에 속하는가"를 구분하지 못합니다. 묶음 판정에는 반드시 유니온 파인드를 써야 합니다.`,code:v,visualize:H}],checks:{cases:[{args:[4,[[0,1,1],[0,2,2],[1,2,5],[1,3,1],[2,3,8]]],expected:4},{args:[1,[]],expected:0},{args:[3,[[0,1,5],[1,2,3],[0,2,4]]],expected:7},{args:[4,[[0,1,1],[2,3,1],[1,2,10],[0,3,4]]],expected:6},{args:[s,c],expected:10}],random:e=>{let t=2+Math.floor(e()*6),n=new Set,r=[],i=(e,t,i)=>{if(e===t)return;let a=u(e,t);n.has(a)||(n.add(a),r.push([e,t,i]))};for(let n=1;n<t;n++)i(n,Math.floor(e()*n),1+Math.floor(e()*15));let a=Math.floor(e()*t);for(let n=0;n<a;n++)i(Math.floor(e()*t),Math.floor(e()*t),1+Math.floor(e()*15));return[t,r]}}};export{U as default};