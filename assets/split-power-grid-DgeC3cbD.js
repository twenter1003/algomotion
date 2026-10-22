import{a as e,c as t,i as n,l as r,r as i}from"./shared-CL29HWIp.js";import{c as a,n as o,o as s,r as c,s as l}from"./common-T-bldLC7.js";var u=8,d=[[1,2],[1,3],[1,4],[4,5],[5,6],[6,7],[7,8]],f=e=>`[${d[e][0]}, ${d[e][1]}]`,p=(e,t,n)=>i(f(e),t,n),m=(e,t)=>d.flatMap(([n,r],i)=>i===t?[]:n===e?[r]:r===e?[n]:[]),h=e=>{let t=[d[e][0]];for(let n=0;n<t.length;n++)for(let r of m(t[n],e))t.includes(r)||t.push(r);return t},g=e=>Math.abs(u-2*e),_=d.map((e,t)=>({i:t,side:h(t),diff:g(h(t).length)})),v=Math.min(..._.map(e=>e.diff)),y=_.find(e=>e.diff===v),b=e=>d.filter(t=>t.includes(e)).length,x=[...Array(9).keys()].reduce((e,t)=>b(t)>b(e)?t:e,0),S=[];{let e=(t,n)=>{let r=[],i=1;for(let a of m(t,-1))a!==n&&(r.push(a),i+=e(a,t));return S.push({v:t,parent:n,kids:r,size:i}),i};e(1,0)}var C=(e,t)=>d.findIndex(n=>n.includes(e)&&n.includes(t)),w=`from collections import deque

def side_size(n, wires, cut):
    # 전선 cut을 빼고 이어, 그 전선의 한쪽 끝에서 닿는 송전탑 수를 셉니다
    graph = [[] for _ in range(n + 1)]
    for i, (a, b) in enumerate(wires):
        if i != cut:  # 끊은 전선은 잇지 않습니다
            graph[a].append(b)
            graph[b].append(a)
    start = wires[cut][0]
    seen = [False] * (n + 1)
    seen[start] = True
    queue = deque([start])
    count = 0
    while queue:
        v = queue.popleft()
        count += 1
        for w in graph[v]:
            if not seen[w]:
                seen[w] = True
                queue.append(w)
    return count
`,T=`function sideSize(n, wires, cut) {
  // 전선 cut을 빼고 이어, 그 전선의 한쪽 끝에서 닿는 송전탑 수를 셉니다
  const graph = Array.from({ length: n + 1 }, () => []);
  wires.forEach(([a, b], i) => {
    if (i === cut) return; // 끊은 전선은 잇지 않습니다
    graph[a].push(b);
    graph[b].push(a);
  });
  const start = wires[cut][0];
  const seen = Array(n + 1).fill(false);
  seen[start] = true;
  const queue = [start];
  let head = 0; // 큐는 shift() 대신 머리 인덱스를 씁니다
  while (head < queue.length) {
    const v = queue[head++];
    for (const w of graph[v]) {
      if (!seen[w]) {
        seen[w] = true;
        queue.push(w);
      }
    }
  }
  return queue.length;
}
`,E={python:`${w}
def solution(n, wires):
    best = n  # 두 덩어리의 차이는 n보다 클 수 없습니다
    for cut in range(len(wires)):  # 끊을 전선을 하나씩 정합니다
        count = side_size(n, wires, cut)
        best = min(best, abs(n - 2 * count))  # (n - count)와 count의 차이
    return best`,javascript:`${T}
function solution(n, wires) {
  let best = n; // 두 덩어리의 차이는 n보다 클 수 없습니다
  for (let cut = 0; cut < wires.length; cut++) { // 끊을 전선을 하나씩 정합니다
    const count = sideSize(n, wires, cut);
    best = Math.min(best, Math.abs(n - 2 * count)); // (n - count)와 count의 차이
  }
  return best;
}`},D={start:n(E,[`best = n`,`for cut in range(len(wires))`],[`let best = n`,`for (let cut = 0`]),cut:n(E,[`for cut in range(len(wires))`,`if i != cut:`,`graph[a].append(b)`],[`for (let cut = 0`,`if (i === cut) return`,`graph[a].push(b)`]),count:n(E,[`start = wires[cut][0]`,`while queue:`,`count += 1`,`return count`],[`const start = wires[cut][0]`,`while (head < queue.length)`,`return queue.length`]),compare:n(E,[`count = side_size(n, wires, cut)`,`best = min(best, abs(n - 2 * count))`],[`const count = sideSize(n, wires, cut)`,`best = Math.min(best, Math.abs(n - 2 * count))`]),done:n(E,[`return best`],[`return best`])},O={python:`def solution(n, wires):
    graph = [[] for _ in range(n + 1)]
    for a, b in wires:
        graph[a].append(b)
        graph[b].append(a)

    best = n

    def size(v, parent):
        nonlocal best
        total = 1  # 자기 자신
        for w in graph[v]:
            if w != parent:
                total += size(w, v)  # 아래 송전탑 수를 더합니다
        # v와 부모 사이 전선을 끊으면 v 쪽이 total개, 반대쪽이 n - total개
        best = min(best, abs(n - 2 * total))
        return total

    size(1, 0)
    return best`,javascript:`function solution(n, wires) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of wires) {
    graph[a].push(b);
    graph[b].push(a);
  }

  let best = n;

  const size = (v, parent) => {
    let total = 1; // 자기 자신
    for (const w of graph[v]) {
      if (w !== parent) total += size(w, v); // 아래 송전탑 수를 더합니다
    }
    // v와 부모 사이 전선을 끊으면 v 쪽이 total개, 반대쪽이 n - total개
    best = Math.min(best, Math.abs(n - 2 * total));
    return total;
  };

  size(1, 0);
  return best;
}`},k={start:n(O,[`best = n`,`size(1, 0)`],[`let best = n`,`size(1, 0)`]),size:n(O,[`total = 1`,`total += size(w, v)`],[`let total = 1`,`total += size(w, v)`]),leaf:n(O,[`total = 1`,`for w in graph[v]:`],[`let total = 1`,`for (const w of graph[v])`]),compare:n(O,[`best = min(best, abs(n - 2 * total))`,`return total`],[`best = Math.min(best, Math.abs(n - 2 * total))`,`return total`]),done:n(O,[`size(1, 0)`,`return best`],[`size(1, 0)`,`return best`])},A={python:`# 주의: 전선이 가장 많이 모인 송전탑에 붙은 전선만 끊어 보는 오답 풀이입니다
${w}
def solution(n, wires):
    degree = [0] * (n + 1)
    for a, b in wires:
        degree[a] += 1
        degree[b] += 1
    hub = degree.index(max(degree))  # 전선이 가장 많이 모인 송전탑

    best = n
    for cut in range(len(wires)):
        if hub not in wires[cut]:
            continue  # 허브에 붙지 않은 전선은 끊어 보지 않습니다
        count = side_size(n, wires, cut)
        best = min(best, abs(n - 2 * count))
    return best`,javascript:`// 주의: 전선이 가장 많이 모인 송전탑에 붙은 전선만 끊어 보는 오답 풀이입니다
${T}
function solution(n, wires) {
  const degree = Array(n + 1).fill(0);
  for (const [a, b] of wires) {
    degree[a]++;
    degree[b]++;
  }
  const hub = degree.indexOf(Math.max(...degree)); // 전선이 가장 많이 모인 송전탑

  let best = n;
  for (let cut = 0; cut < wires.length; cut++) {
    if (!wires[cut].includes(hub)) continue; // 허브에 붙지 않은 전선은 끊어 보지 않습니다
    const count = sideSize(n, wires, cut);
    best = Math.min(best, Math.abs(n - 2 * count));
  }
  return best;
}`},j={hub:n(A,[`degree = [0] * (n + 1)`,`degree[a] += 1`,`hub = degree.index(max(degree))`],[`const degree = Array(n + 1)`,`degree[a]++`,`const hub = degree.indexOf`]),skip:n(A,[`for cut in range(len(wires)):`,`if hub not in wires[cut]:`,`continue`],[`for (let cut = 0; cut < wires.length; cut++)`,`if (!wires[cut].includes(hub)) continue`]),cut:n(A,[`for cut in range(len(wires)):`,`if hub not in wires[cut]:`,`if i != cut:`,`graph[a].append(b)`],[`for (let cut = 0; cut < wires.length; cut++)`,`if (!wires[cut].includes(hub)) continue`,`if (i === cut) return`,`graph[a].push(b)`]),count:n(A,[`start = wires[cut][0]`,`while queue:`,`count += 1`,`return count`],[`const start = wires[cut][0]`,`while (head < queue.length)`,`return queue.length`]),compare:n(A,[`count = side_size(n, wires, cut)`,`best = min(best, abs(n - 2 * count))`],[`const count = sideSize(n, wires, cut)`,`best = Math.min(best, Math.abs(n - 2 * count))`]),done:n(A,[`return best`],[`return best`])},M=420,N=340,P={x:0,y:0,w:M,h:N},F=46,I=(e,t)=>({x:e,y:t,w:F,h:F}),L={1:I(12,140),2:I(12,70),3:I(12,210),4:I(82,140),5:I(152,140),6:I(222,140),7:I(292,140),8:I(362,140)},R=e=>`v:${e}`,z=e=>`w:${e}`,B=e=>`e:${e}`,V=e=>({x:10+e*58,y:22,w:52,h:34}),H=([e,t])=>{let[n,r]=[L[e],L[t]];if(n.y===r.y){let[e,t]=n.x<r.x?[n,r]:[r,n];return[[e.x+F,e.y+F/2],[t.x,t.y+F/2]]}let[i,a]=n.y<r.y?[n,r]:[r,n];return[[i.x+F/2,i.y+F],[a.x+F/2,a.y]]},U=e=>({id:B(e),kind:`line`,rect:P,tone:`trail`,points:H(d[e])});function W(e,t){let n=[{id:`title`,kind:`text`,rect:{x:12,y:0,w:396,h:16},tone:`muted`,text:e}];t&&d.forEach(([e,t],r)=>n.push({id:z(r),kind:`cell`,rect:V(r),tone:`plain`,text:`${e}-${t}`}));for(let e=1;e<=u;e++)n.push({id:R(e),kind:`cell`,rect:L[e],tone:`plain`,text:String(e)});return d.forEach((e,t)=>n.push(U(t))),n.push({id:`calc`,kind:`text`,rect:{x:12,y:272,w:396,h:26},text:``},{id:`t:best`,kind:`token`,rect:{x:12,y:304,w:130,h:30},tone:`chosen`,text:`최소 차이 ${u}`}),{width:M,height:N,items:n}}var G=e=>s(`calc`,{text:e}),K=(e,t=`chosen`)=>s(`t:best`,{text:`최소 차이 ${e}`,tone:t},!0),q=e=>[...Array(u).keys()].map(t=>l(R(t+1),e.includes(t+1)?`visited`:`queued`)),J=()=>[...Array(u).keys()].map(e=>l(R(e+1),`plain`));function Y(n){let i=new r(W(n?`전선이 가장 많이 모인 송전탑의 전선만 끊어 봅니다`:`전선을 하나씩 끊어 봅니다`,!0)),o=n?j:D,m=_.filter(e=>!n||d[e.i].includes(x)),h=u,g=-1,S=0,C,w,T=()=>({work:S,variables:{...n?{hub:x}:{},cut:C??`-`,count:w??`-`,best:h}});i.step({title:n?`허브: ${x}번 (전선 ${b(x)}개)`:`전선을 하나씩 끊어 보기`,codeHighlights:n?j.hub:D.start,...T()}),n?(i.phase(`허브 찾기`,`송전탑마다 이어진 전선 수를 세어 보니 ${x}번이 ${b(x)}개로 가장 많습니다. 가운데일 것 같은 ${x}번에 붙은 전선만 끊어 보기로 합니다.`,j.hub),i.do(...t([...Array(u).keys()].map(e=>s(R(e+1),{tag:`전선 ${b(e+1)}`})))),i.do(...t([l(R(x),`current`,!0),...d.map((e,t)=>l(z(t),e.includes(x)?`queued`:`muted`))]))):(i.phase(`시작`,`송전탑 ${u}개가 전선 ${d.length}개로 이어진 트리입니다. 전선을 하나씩 끊어 보고, 갈라진 두 덩어리의 송전탑 수 차이가 가장 작은 경우를 찾습니다. 최솟값은 ${u}에서 시작합니다.`,D.start),i.do(a(300)));for(let n of m){let[r,a]=d[n.i],s=n.side.length,c=u-s,m=h,_=n.diff<h;C=n.i,w=s,S+=s,h=Math.min(h,n.diff),i.step({title:`전선 ${f(n.i)} 끊기: ${s}개와 ${c}개, 차이 ${n.diff}`,codeHighlights:o.compare,...T()}),i.phase(`끊기`,`${n.i+1}번째 전선 ${p(n.i,`을`,`를`)} 끊습니다. 이 전선을 뺀 나머지 전선만 이어서 생각합니다.`,o.cut),i.do({type:`focus`,ids:[z(n.i),R(r),R(a)]}),i.do(...t([l(z(n.i),`bad`),{type:`remove`,id:B(n.i)},G(`전선 ${f(n.i)} 끊김`)])),i.phase(`세어 보기`,`${r}번에서 닿는 송전탑은 ${s}개이고, 반대쪽은 ${u} − ${s} = ${c}개입니다.`,o.count),i.do(...t([{type:`unfocus`},...q(n.side)])),i.do(G(`${r}번 쪽 ${s}개 · 반대쪽 ${c}개`)),i.phase(`비교하기`,_?`차이는 |${s} − ${c}| = ${e(n.diff)}, 지금까지의 최솟값 ${m}보다 작아 최솟값을 ${e(n.diff)} 바꿉니다. 전선은 다시 잇습니다.`:`차이는 |${s} − ${c}| = ${e(n.diff)}, 최솟값 ${m}보다 작지 않아 그대로 둡니다. 전선은 다시 잇습니다.`,o.compare),i.do(...t([G(`|${s} − ${c}| = ${n.diff}`),..._?[K(h)]:[]])),i.do(...t([{type:`add`,item:U(n.i)},...J(),..._&&g>=0?[l(z(g),`explored`)]:[],l(z(n.i),_?`good`:`explored`)])),_&&(g=n.i)}if(C=void 0,w=void 0,n){let e=y;return i.step({title:`최솟값 ${h} — 정답은 ${v}`,codeHighlights:j.done,...T(),answer:h,isKeyframe:!0}),i.phase(`비교하기`,`허브에 붙은 전선만 끊어 보니 최솟값은 ${h}입니다. 하지만 ${p(e.i,`을`,`를`)} 끊으면 ${e.side.length}개와 ${u-e.side.length}개로 갈라져 차이가 ${v}입니다. 허브에서 먼 전선도 모두 확인해야 합니다.`,j.done),i.do(...t([...q(e.side),{type:`remove`,id:B(e.i)},l(z(e.i),`good`,!0),K(h,`bad`),G(`내 답 ${h} ≠ 정답 ${v}: ${p(e.i,`을`,`를`)} 끊으면 ${e.side.length}개 · ${u-e.side.length}개`)])),c(i.finish())}let E=y;return i.step({title:`최솟값 ${h}`,codeHighlights:D.done,...T(),answer:h,isKeyframe:!0}),i.phase(`결과`,`전선을 모두 끊어 보니 ${p(E.i,`을`,`를`)} 끊을 때 ${E.side.length}개와 ${u-E.side.length}개로 갈라져 차이가 ${e(h)} 가장 작습니다. 송전탑을 센 횟수는 모두 ${S}번입니다.`,D.done),i.do(...t([...q(E.side),{type:`remove`,id:B(E.i)},l(z(E.i),`path`,!0),K(h,`path`),G(`${p(E.i,`을`,`를`)} 끊으면 ${E.side.length}개 · ${u-E.side.length}개 → 차이 ${h}`)])),c(i.finish())}function X(){let n=new r(W(`1번을 뿌리로 잡고 아래부터 크기를 셉니다`,!1)),i=u,d=0,f,m=()=>({work:d,variables:{v:f?.v??`-`,total:f?.size??`-`,best:i}});n.step({title:`1번을 뿌리로 잡고 시작`,codeHighlights:k.start,...m()}),n.phase(`시작`,`1번을 뿌리로 잡고 아래로 내려갔다가 올라오며, 송전탑마다 자기 아래(자기 포함)의 송전탑 수인 크기를 셉니다. 크기가 s인 송전탑 위의 전선을 끊으면 s개와 ${u} − s개로 갈라집니다.`,k.start),n.do(l(R(1),`current`,!0),a(200));let h=0,_=u;S.filter(e=>e.v!==1).forEach(r=>{let c=g(r.size),l=c<i,p=i;if(c<_&&(_=c,h=r.v),f=r,d++,i=Math.min(i,c),n.step({title:`${r.v}번의 크기 ${r.size}: 위 전선을 끊으면 ${r.size}개와 ${u-r.size}개, 차이 ${c}`,codeHighlights:k.compare,...m()}),r.kids.length){let e=r.kids[0];n.phase(`크기 구하기`,`${r.v}번의 크기는 자기 1 + 아래 ${e}번의 크기 ${S.find(t=>t.v===e).size} = ${r.size}입니다.`,k.size),n.do({type:`focus`,ids:[R(e),R(r.v)]}),n.do({type:`arrow`,from:R(e),to:R(r.v),verdict:`new`,label:`+${S.find(t=>t.v===e).size}`},a(150)),n.do(...t([...o(),s(R(r.v),{tone:`visited`,tag:`크기 ${r.size}`},!0),G(`1 + ${S.find(t=>t.v===e).size} = ${r.size}`)]))}else n.phase(`크기 구하기`,`${r.v}번은 아래에 송전탑이 없어 크기가 1입니다.`,k.leaf),n.do(...t([s(R(r.v),{tone:`visited`,tag:`크기 ${r.size}`},!0),G(`크기 ${r.size}`)]));n.phase(`비교하기`,l?`${r.v}번 위의 전선을 끊으면 ${r.size}개와 ${u-r.size}개, 차이는 ${c}입니다. 최솟값 ${p}보다 작아 ${e(c)} 바꿉니다.`:`${r.v}번 위의 전선을 끊으면 ${r.size}개와 ${u-r.size}개, 차이는 ${c}입니다. 최솟값 ${p}보다 작지 않아 그대로 둡니다.`,k.compare),n.do({type:`focus`,ids:[R(r.parent),R(r.v)]}),n.do({type:`arrow`,from:R(r.parent),to:R(r.v),verdict:l?`good`:`seen`,label:`차이 ${c}`},a(150)),n.do(...t([...o(),G(`|${u} − 2 × ${r.size}| = ${c}`),...l?[K(i)]:[]]))}),f=S.at(-1),d++;let v=C(S.find(e=>e.v===h).parent,h);return n.step({title:`최솟값 ${i}`,codeHighlights:k.done,...m(),answer:i,isKeyframe:!0}),n.phase(`결과`,`뿌리 1번의 크기는 ${e(u)}, 송전탑을 한 번씩만 거쳐 모든 전선의 차이를 구했습니다. ${p(v,`을`,`를`)} 끊을 때 ${S.find(e=>e.v===h).size}개와 ${u-S.find(e=>e.v===h).size}개로 차이가 ${e(i)} 가장 작습니다. 송전탑을 센 횟수는 ${d}번뿐입니다.`,k.done),n.do(...t([s(R(1),{tone:`visited`,tag:`크기 ${u}`},!0),G(`크기 ${u} = 송전탑 전체`)])),n.do(...t([s(B(v),{tone:`path`}),K(i,`path`),G(`${p(v,`을`,`를`)} 끊으면 차이 ${i}`)])),c(n.finish())}var Z={id:`split-power-grid`,title:`전력망을 둘로 나누기`,level:2,category:`brute-force`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/86971`,description:{summary:`n개의 송전탑이 전선 n − 1개로 이어진, 하나의 트리 모양 전력망이 있습니다. 전선 하나를 끊어 송전탑을 두 전력망으로 나눌 때, 두 전력망이 가진 송전탑 수의 차이(절댓값)가 가장 작아지도록 합니다. 그때의 차이를 구합니다.`,rules:[`n은 2 이상 100 이하의 자연수`,`wires는 길이 n − 1인 2차원 배열이고, 각 원소 [v1, v2]는 v1번과 v2번 송전탑이 전선으로 이어져 있다는 뜻 (1 ≤ v1 < v2 ≤ n)`,`전력망은 항상 하나의 트리 모양으로만 주어짐`],examples:[{input:`n = 9, wires = [[1,3],[2,3],[3,4],[4,5],[4,6],[4,7],[7,8],[7,9]]`,output:`3`},{input:`n = 4, wires = [[1,2],[2,3],[3,4]]`,output:`0`},{input:`n = 7, wires = [[1,2],[2,7],[3,7],[3,4],[4,5],[6,7]]`,output:`1`}]},keyIntuitions:[`n이 100 이하라 전선(최대 99개)을 하나씩 끊어 보는 완전탐색으로 충분합니다. 전선마다 송전탑을 한 번 훑어도 100 × 100 정도입니다.`,`트리에서 전선 하나를 끊으면 항상 정확히 두 덩어리가 됩니다. 한쪽 송전탑 수를 세면 다른 쪽은 n에서 빼면 되니, 차이는 |n − 2 × (한쪽 수)|입니다.`,`"전선이 가장 많이 모인 송전탑 근처가 한가운데겠지" 같은 짐작은 틀릴 수 있습니다. 균형은 끊었을 때 갈라지는 덩어리 크기로 정해지므로, 모든 전선을 끊어 봐야 안전합니다.`],demo:{input:[u,d],label:`n = 8, wires = [[1,2],[1,3],[1,4],[4,5],[5,6],[6,7],[7,8]]`},workUnit:`송전탑을 센 횟수`,approaches:[{id:`grid-cut-each`,name:`전선을 하나씩 끊고 한쪽 송전탑 세기`,rank:`BEST`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`전선을 하나씩 끊어 보며, 끊은 전선의 한쪽 끝에서 닿는 송전탑 수를 세어 두 덩어리의 차이를 견줍니다.`,pros:[`생각이 단순해서 맞게 짜기 쉽습니다.`,`트리의 성질을 몰라도, 이어진 송전탑을 세는 BFS만 알면 풀 수 있습니다.`,`n이 100 이하라 전선마다 한 번씩 세어도 1만 번 안팎이면 끝납니다.`],cons:[`전선을 끊을 때마다 그래프를 새로 만들고 처음부터 세어 같은 계산이 겹칩니다.`,`n이 수만 개로 커지면 시간 초과가 날 수 있습니다.`],whyThisRank:`송전탑이 100개 이하라 전선을 모두 끊어 봐도 충분히 빠르고, 가정이 거의 없어 틀리기 어렵습니다. "하나씩 모두 시도한다"는 완전탐색의 정석이 그대로 통합니다.`,code:E,visualize:()=>Y(!1)},{id:`grid-subtree-size`,name:`한 번의 DFS로 서브트리 크기 구하기`,rank:`ALTERNATIVE`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`1번을 뿌리로 잡고 한 번만 훑으며 송전탑마다 아래 크기를 구해, 위 전선을 끊을 때의 차이를 한꺼번에 계산합니다.`,pros:[`훑는 것이 한 번뿐이라 송전탑 수에 비례해 빠릅니다.`,`n이 아주 커져도 쓸 수 있습니다.`],cons:[`"크기 = 1 + 아래 크기의 합"과 "끊으면 s개와 n − s개"라는 두 발상을 함께 떠올려야 합니다.`,`재귀 깊이가 n까지 갈 수 있어, 입력이 아주 크면 스택 한계에 걸립니다.`,`트리가 아닌 그래프에는 쓸 수 없습니다.`],whyThisRank:`더 빠르지만 n이 100 이하라 정석으로도 충분하고, 서브트리 크기라는 한 단계 더 나아간 발상이 필요합니다. 정석을 확실히 익힌 뒤 갈아타는 풀이로 둡니다.`,code:O,visualize:X},{id:`grid-hub-only`,name:`전선이 가장 많이 모인 송전탑의 전선만 끊기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N × 허브의 전선 수)`,spaceComplexity:`O(N)`,verdict:`가운데일 것 같은 송전탑 주변만 끊어 보다가 더 좋은 전선을 놓쳐 오답이 나옵니다.`,pros:[`끊어 볼 전선이 줄어 계산이 빠릅니다.`,`원문 예제 세 개를 모두 통과해서 틀린 줄 알아채기 어렵습니다.`],cons:[`전선이 가장 많이 모인 송전탑이 송전탑 수로 한가운데라는 보장이 없습니다.`,`시각화 입력에서 1번의 전선만 끊으면 차이가 2에 그치지만, 허브에서 먼 [4, 5]를 끊으면 4개와 4개로 갈라져 0입니다.`],whyThisRank:`송전탑 수의 균형은 전선이 몇 개 모였는지가 아니라 끊었을 때 갈라지는 덩어리 크기로 정해집니다. 후보를 짐작으로 줄이지 말고 모든 전선을 확인해야 합니다.`,code:A,visualize:()=>Y(!0)}],checks:{cases:[{args:[9,[[1,3],[2,3],[3,4],[4,5],[4,6],[4,7],[7,8],[7,9]]],expected:3},{args:[4,[[1,2],[2,3],[3,4]]],expected:0},{args:[7,[[1,2],[2,7],[3,7],[3,4],[4,5],[6,7]]],expected:1},{args:[2,[[1,2]]],expected:0},{args:[3,[[1,2],[2,3]]],expected:1},{args:[5,[[1,2],[1,3],[1,4],[1,5]]],expected:3},{args:[100,Array.from({length:99},(e,t)=>[t+1,t+2])],expected:0},{args:[100,Array.from({length:99},(e,t)=>[1,t+2])],expected:98},{args:[u,d],expected:0}],random:e=>{let t=2+Math.floor(e()*11),n=Array.from({length:t},(e,t)=>t+1);for(let r=t-1;r>0;r--){let t=Math.floor(e()*(r+1));[n[r],n[t]]=[n[t],n[r]]}let r=Array.from({length:t-1},(t,r)=>{let[i,a]=[n[r+1],n[Math.floor(e()*(r+1))]];return[Math.min(i,a),Math.max(i,a)]});for(let t=r.length-1;t>0;t--){let n=Math.floor(e()*(t+1));[r[t],r[n]]=[r[n],r[t]]}return[t,r]}}};export{Z as default};