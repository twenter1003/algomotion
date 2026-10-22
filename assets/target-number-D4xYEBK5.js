import{a as e,c as t,i as n,l as r,r as i}from"./shared-CL29HWIp.js";import{t as a}from"./lane-BzDhdR3X.js";var o=[1,1,3],s=3,c=o.length,l=2**c,u={d:0,k:0},d=e=>`${e.d}:${e.k}`,f=e=>`node:${d(e)}`,p=e=>`edge:${d(e)}`,m=e=>`sign:${d(e)}`,h=e=>e.k%2==1,g=e=>({d:e.d-1,k:e.k>>1}),_=e=>[{d:e.d+1,k:e.k*2},{d:e.d+1,k:e.k*2+1}],v=e=>Array.from({length:e.d+1},(t,n)=>({d:n,k:e.k>>e.d-n})),y=e=>(h(e)?-1:1)*o[e.d-1],b=e=>v(e).slice(1).reduce((e,t)=>e+y(t),0),x=Array.from({length:l},(e,t)=>({d:c,k:t})),S=x.filter(e=>b(e)===s),C=e=>`${e<0?`−`:`+`}${Math.abs(e)}`,w=e=>v(e).slice(1).map(e=>C(y(e))).join(` `),T=e=>`(${e.d}, ${b(e)})`,E=e=>`dfs(${e.d}, ${b(e)})`,D={python:`def solution(numbers, target):
    count = 0

    def dfs(i, total):
        nonlocal count
        if i == len(numbers):  # 숫자를 모두 썼으면 합을 확인
            if total == target:
                count += 1
            return
        dfs(i + 1, total + numbers[i])  # 더하는 가지
        dfs(i + 1, total - numbers[i])  # 빼는 가지

    dfs(0, 0)
    return count`,javascript:`function solution(numbers, target) {
  let count = 0;

  const dfs = (i, total) => {
    if (i === numbers.length) { // 숫자를 모두 썼으면 합을 확인
      if (total === target) count++;
      return;
    }
    dfs(i + 1, total + numbers[i]); // 더하는 가지
    dfs(i + 1, total - numbers[i]); // 빼는 가지
  };

  dfs(0, 0);
  return count;
}`},O={start:n(D,[`count = 0`,`dfs(0, 0)`],[`let count = 0`,`dfs(0, 0)`]),plus:n(D,[`dfs(i + 1, total + numbers[i])`],[`dfs(i + 1, total + numbers[i])`]),minus:n(D,[`dfs(i + 1, total - numbers[i])`],[`dfs(i + 1, total - numbers[i])`]),check:n(D,[`if i == len(numbers)`,`if total == target`],[`if (i === numbers.length)`,`if (total === target)`]),hit:n(D,[`if i == len(numbers)`,`if total == target`,`count += 1`],[`if (i === numbers.length)`,`if (total === target) count++`]),back:n(D,[`return`],[`return;`]),done:n(D,[`dfs(0, 0)`,`return count`],[`dfs(0, 0)`,`return count`])},k={python:`from collections import deque

def solution(numbers, target):
    queue = deque([(0, 0)])  # (쓴 숫자 수, 지금까지의 합)
    count = 0

    while queue:
        i, total = queue.popleft()
        if i == len(numbers):  # 숫자를 모두 썼으면 합을 확인
            if total == target:
                count += 1
        else:
            queue.append((i + 1, total + numbers[i]))  # 더하는 가지
            queue.append((i + 1, total - numbers[i]))  # 빼는 가지

    return count`,javascript:`function solution(numbers, target) {
  const queue = [[0, 0]]; // [쓴 숫자 수, 지금까지의 합]
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  let count = 0;

  while (head < queue.length) {
    const [i, total] = queue[head++];
    if (i === numbers.length) { // 숫자를 모두 썼으면 합을 확인
      if (total === target) count++;
    } else {
      queue.push([i + 1, total + numbers[i]]); // 더하는 가지
      queue.push([i + 1, total - numbers[i]]); // 빼는 가지
    }
  }

  return count;
}`},A={start:n(k,[`queue = deque([(0, 0)])`,`count = 0`],[`const queue = [[0, 0]]`,`let head = 0`,`let count = 0`]),pop:n(k,[`while queue:`,`i, total = queue.popleft()`],[`while (head < queue.length)`,`const [i, total] = queue[head++]`]),spread:n(k,[`else:`,`queue.append((i + 1, total + numbers[i]))`,`queue.append((i + 1, total - numbers[i]))`],[`} else {`,`queue.push([i + 1, total + numbers[i]])`,`queue.push([i + 1, total - numbers[i]])`]),push:n(k,[`queue.append((i + 1, total + numbers[i]))`,`queue.append((i + 1, total - numbers[i]))`],[`queue.push([i + 1, total + numbers[i]])`,`queue.push([i + 1, total - numbers[i]])`]),check:n(k,[`if i == len(numbers)`,`if total == target`],[`if (i === numbers.length)`,`if (total === target)`]),hit:n(k,[`if i == len(numbers)`,`if total == target`,`count += 1`],[`if (i === numbers.length)`,`if (total === target) count++`]),done:n(k,[`while queue:`,`return count`],[`while (head < queue.length)`,`return count`])},j={python:`# 주의: 오답이 나오는 풀이입니다 (한 가지 길만 따라갑니다)
def solution(numbers, target):
    total = 0
    for x in numbers:
        # target에 더 가까워지는 쪽 부호를 고릅니다
        if abs(total + x - target) <= abs(total - x - target):
            total += x
        else:
            total -= x
    return 1 if total == target else 0`,javascript:`// 주의: 오답이 나오는 풀이입니다 (한 가지 길만 따라갑니다)
function solution(numbers, target) {
  let total = 0;
  for (const x of numbers) {
    // target에 더 가까워지는 쪽 부호를 고릅니다
    if (Math.abs(total + x - target) <= Math.abs(total - x - target)) {
      total += x;
    } else {
      total -= x;
    }
  }
  return total === target ? 1 : 0;
}`},M={start:n(j,[`total = 0`],[`let total = 0`]),look:n(j,[`for x in numbers`,`if abs(total + x - target)`],[`for (const x of numbers)`,`if (Math.abs(total + x - target)`]),plus:n(j,[`if abs(total + x - target)`,`total += x`],[`if (Math.abs(total + x - target)`,`total += x`]),minus:n(j,[`if abs(total + x - target)`,`else:`,`total -= x`],[`if (Math.abs(total + x - target)`,`} else {`,`total -= x`]),done:n(j,[`return 1 if total == target else 0`],[`return total === target ? 1 : 0`])},N=(...e)=>({python:[...new Set(e.flatMap(e=>e.python))],javascript:[...new Set(e.flatMap(e=>e.javascript))]}),P=54,F=62,I=90,L=72,R=L+(l-1)*F+P+8,z={id:`lane`,x:40,y:5,slotW:56,slotH:30,gap:6,max:l};function B(e){let t=e?52:4,n=({d:e,k:n})=>{let r=2**(c-e);return{x:L+F*(n*r+(r-1)/2),y:t+e*I,w:P,h:P}},r=t+c*I+P+34;return{top:t,rect:n,bottom:r,H:r+30,FULL:{x:0,y:0,w:R,h:r+30}}}var V=B(!1),H=B(!0),U=(e,t)=>({x:e.rect(t).x,y:e.bottom,w:P,h:30});function W(e,t){let n=[];t.lane&&n.push({id:`lane:label`,kind:`text`,rect:{x:0,y:0,w:34,h:40},text:`큐`},{id:`lane:bg`,kind:`zone`,rect:{x:34,y:0,w:R-34,h:40}});for(let t=0;t<=c;t++)n.push({id:`row:${t}`,kind:`text`,rect:{x:0,y:e.top+t*I,w:64,h:P},text:t?`${t}번째 ±${o[t-1]}`:`시작`});for(let t=1;t<=c;t++)for(let r=0;r<2**t;r++){let i={d:t,k:r},a=e.rect(g(i)),o=e.rect(i),s=[a.x+P/2,a.y+P],c=[o.x+P/2,o.y];n.push({id:p(i),kind:`line`,rect:e.FULL,tone:`trail`,points:[s,c]},{id:m(i),kind:`token`,rect:{x:(s[0]+c[0])/2-13,y:(s[1]+c[1])/2-10,w:26,h:20},tone:`plain`,text:C(y(i))})}for(let t=0;t<=c;t++)for(let r=0;r<2**t;r++)n.push({id:f({d:t,k:r}),kind:`cell`,rect:e.rect({d:t,k:r}),tone:`plain`,text:``});return t.count&&n.push({id:`count`,kind:`token`,rect:{x:0,y:e.bottom,w:70,h:30},tone:`plain`,text:`count 0`}),n.push({id:`target`,kind:`token`,rect:U(e,x[0]),tone:`chosen`,text:`목표 ${s}`}),{width:R,height:e.H,items:n}}var G=(e,t,n=!1)=>({type:`set`,id:f(e),patch:t,...n?{pop:n}:{}}),K=(e,t)=>({type:`set`,id:p(e),patch:{tone:t}}),q=e=>({type:`wait`,ms:e}),J=()=>[{type:`unfocus`},{type:`clearMarks`}];function Y(e,n,r,i){let a=b(r),o=a===s;e.do(...t([{type:`focus`,ids:[f(r),`target`]},{type:`set`,id:`target`,patch:{rect:U(n,r)}}])),e.do({type:`arrow`,from:f(r),to:`target`,verdict:o?`good`:`bad`,label:`${a} ${o?`=`:`≠`} ${s}`},q(150)),e.do(...t([G(r,{tone:o?`good`:i.miss??`explored`}),...o&&i.count!==void 0?[{type:`set`,id:`count`,patch:{text:`count ${i.count}`},pop:!0}]:[],...J()]))}var X=(e,t)=>e===s?`숫자를 모두 썼습니다. 합 ${i(e,`이`,`가`)} target ${s}과 같으니 ${t}`:`숫자를 모두 썼습니다. 합 ${i(e,`은`,`는`)} target ${s}과 달라서 ${t}`,Z=()=>S.map(w).join(`, `),Q=[...new Map(S.flatMap(e=>v(e)).map(e=>[d(e),e])).values()],$=()=>Q.flatMap(e=>[G(e,{tone:`path`}),...e.d?[K(e,`path`)]:[]]);function ee(){let n=V,a=new r(W(n,{count:!0})),c=0,l=1,f=[u],p=()=>{let e=f.at(-1);return{work:l,variables:{i:e.d,total:b(e),count:c}}};return a.step({title:`합 0에서 시작`,codeHighlights:O.start,...p()}),a.phase(`시작`,`숫자 ${i(`[${o.join(`, `)}]`,`을`,`를`)} 차례로 +나 −로 쓰는 모든 경우가 이 나무의 가지입니다. dfs(0, 0)이 합 0에서 시작합니다.`),a.do(G(u,{tone:`current`,text:`0`},!0),q(1300)),x.forEach((r,o)=>{let u=v(r),m=f.length-1,g=u.slice(m+1),_=x[o+1],S=0;if(_)for(;d(u[S+1])===d(v(_)[S+1]);)S++;let T=u.slice(S+1),D=u[S],k=b(r),A=k===s;l+=g.length,A&&c++,f=u.slice(0,S+1),a.step({title:`${w(r)} = ${k} → ${A?`같음`:`다름`}`,codeHighlights:O.back,...p()});let j=g.map(e=>C(y(e))),M=i(j.pop(),`을`,`를`);a.phase(`내려가기`,`${[...j,M].join(`, `)}${j.length?` 차례로 써서`:` 써서`} 내려갑니다.`,N(...g.map(e=>h(e)?O.minus:O.plus))),g.forEach((e,n)=>{a.do(...t([G(u[m+n],{tone:`trail`}),G(e,{tone:`current`,text:String(b(e))},!0),K(e,`path`)]))}),a.phase(`합 확인`,X(k,A?`count가 ${i(c,`이`,`가`)} 됩니다.`:`세지 않습니다.`),A?O.hit:O.check),Y(a,n,r,{count:c}),a.phase(`되돌아가기`,_?`맨 아래라 ${e(E(D))} 돌아옵니다. 빼는 가지가 남았습니다.`:`마지막 가지라 ${E(D)}까지 모두 올라옵니다.`,O.back),a.do(...t([...T.slice(0,-1).map(e=>G(e,{tone:`explored`})),...T.map(e=>K(e,`trail`)),G(D,{tone:`current`})]))}),a.step({title:`모든 가지 확인 — 정답 ${c}`,codeHighlights:O.done,...p(),answer:c,isKeyframe:!0}),a.phase(`정답 확인`,`합이 ${s}인 방법은 ${Z()}, 모두 ${c}가지라서 count = ${c}를 돌려줍니다.`),a.do(...t([...$(),{type:`set`,id:`count`,patch:{tone:`good`}}])),a.finish()}function te(){let e=H,n=new r(W(e,{lane:!0,count:!0})),l=new a(n,z),p=[u],m=0,h=1,g,v,x=()=>({work:h,variables:{i:g?g.d:`-`,total:g?b(g):`-`,queue:`[${p.map(T).join(`, `)}]`,count:m}}),S=e=>({id:`tok:${d(e)}`,text:String(b(e))});for(n.step({title:`${i(T(u),`을`,`를`)} 큐에 넣고 시작`,codeHighlights:A.start,...x()}),n.phase(`시작`,`숫자를 0개 썼고 합이 0인 ${i(T(u),`을`,`를`)} 큐에 넣고 시작합니다.`),n.do(G(u,{tone:`queued`,text:`0`},!0)),l.push(S(u),f(u)),n.do(q(500));p.length;){let r=p.shift(),a=r.d<c?_(r):[],u=b(r),d=r.d===c&&u===s,w=v;g=r,p.push(...a),h+=a.length,d&&m++,v=r;let E=()=>{n.phase(`꺼내기`,`큐 맨 앞에서 ${i(T(r),`을`,`를`)} 꺼냅니다. 합은 ${u}입니다.`,A.pop),l.shift(f(r)),n.do(...t([G(r,{tone:`current`}),...w&&w.d<c?[G(w,{tone:`explored`})]:[]],!0))};if(a.length){let e=o[r.d];n.step({title:`${T(r)} 꺼내고 ${a.map(T).join(`, `)} 넣기`,codeHighlights:A.push,...x()}),E(),n.phase(`뻗기`,`다음 숫자 ${i(e,`을`,`를`)} 더하거나 빼면 합이 ${b(a[0])} 또는 ${i(b(a[1]),`이`,`가`)} 됩니다.`,A.spread),n.do({type:`focus`,ids:[f(r),...a.map(f)]});for(let e of a)n.do({type:`arrow`,from:f(r),to:f(e),verdict:`new`,label:`${C(y(e))} → ${b(e)}`}),n.do({...G(e,{tone:`queued`,text:String(b(e))},!0),together:!0});n.phase(`넣기`,`새로 생긴 ${i(T(a[0]),`과`,`와`)} ${i(T(a[1]),`을`,`를`)} 큐 뒤에 넣습니다.`,A.push),n.do(...t(J()));for(let e of a)l.push(S(e),f(e))}else n.step({title:`${T(r)} 꺼내기 → ${d?`같음`:`다름`}`,codeHighlights:d?A.hit:A.check,...x()}),E(),n.phase(`합 확인`,X(u,d?`count가 ${i(m,`이`,`가`)} 됩니다.`:`세지 않습니다.`),d?A.hit:A.check),Y(n,e,r,{count:m})}return g=void 0,n.step({title:`큐가 비었습니다 — 정답 ${m}`,codeHighlights:A.done,...x(),answer:m,isKeyframe:!0}),n.phase(`정답 확인`,`큐가 비었습니다. 합이 ${s}인 방법은 ${Z()}, 모두 ${m}가지라서 count = ${m}를 돌려줍니다.`),n.do(...t([...$(),{type:`set`,id:`count`,patch:{tone:`good`}}])),n.finish()}function ne(){let e=V,n=new r(W(e,{})),a=u,l=1,p=`-`,m=!1,h=()=>({work:l,variables:{x:m?o[a.d-1]:`-`,total:b(a),"돌려줄 값":p}});for(n.step({title:`합 0에서 시작`,codeHighlights:M.start,...h()}),n.phase(`시작`,`숫자를 쓸 때마다 target ${s}에 더 가까워지는 쪽만 고르고, 한 번 고르면 되돌아오지 않습니다.`),n.do(G(u,{tone:`current`,text:`0`},!0),q(900));a.d<c;){let e=o[a.d],[r,c]=_(a),[u,d]=[b(r),b(c)],[p,g]=[Math.abs(u-s),Math.abs(d-s)],v=p<=g,[y,x]=v?[r,c]:[c,r];l+=2;let S=a;a=y,m=!0,n.step({title:`${i(e,`을`,`를`)} ${v?`더하기`:`빼기`} (${b(S)} → ${b(y)})`,codeHighlights:v?M.plus:M.minus,...h()}),n.phase(`두 가지 보기`,`${i(e,`을`,`를`)} 더하면 합이 ${u}(거리 ${p}), 빼면 ${d}(거리 ${g})입니다.`,M.look),n.do({type:`focus`,ids:[f(S),f(r),f(c)]});for(let[e,t,i]of[[r,p,v],[c,g,!v]]){let r=i?`good`:`seen`;n.do({type:`arrow`,from:f(S),to:f(e),verdict:r,label:`거리 ${t}`}),n.do({...G(e,{tone:`queued`,text:String(b(e))},!0),together:!0})}n.phase(`고르기`,p===g?`거리가 같으면 더하는 쪽을 고릅니다. 합은 ${b(y)}입니다.`:`거리가 더 짧은 ${v?`더하는`:`빼는`} 쪽을 고릅니다. 합은 ${i(b(y),`이`,`가`)} 됩니다.`,v?M.plus:M.minus),n.do(...t([...J(),G(S,{tone:`trail`}),G(y,{tone:`current`}),G(x,{tone:`explored`}),K(y,`path`)]))}let g=b(a);p=+(g===s),m=!1,n.step({title:`합 ${g} ≠ ${s} → ${p} 반환`,codeHighlights:M.done,...h()}),n.phase(`합 확인`,X(g,`${p}을 돌려줍니다.`),M.done),Y(n,e,a,{miss:`bad`}),n.step({title:`내 답 ${p}, 정답은 ${S.length}`,codeHighlights:M.done,...h(),answer:p,isKeyframe:!0}),n.phase(`정답과 비교`,`합이 ${s}인 방법은 ${Z()}, 두 가지나 있습니다. 한 길만 따라가서는 하나도 찾지 못했습니다.`);let y=Q.filter(e=>n.get(f(e)).text===``),x=new Set(Q.map(d)),C=v(a).filter(e=>!x.has(d(e)));return n.do(...t([...$(),...y.map(e=>G(e,{text:String(b(e))},!0)),...C.map(e=>K(e,`trail`)),...C.filter(e=>e.d<c).map(e=>G(e,{tone:`explored`}))])),n.do({type:`add`,item:{id:`mine`,kind:`token`,rect:{x:300,y:e.bottom,w:90,h:30},tone:`bad`,text:`내 답 ${p}`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:400,y:e.bottom,w:90,h:30},tone:`good`,text:`정답 ${S.length}`},together:!0}),n.finish()}var re={id:`target-number`,title:`타겟 넘버`,level:2,category:`dfs-bfs`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/43165`,description:{summary:`자연수 몇 개가 차례로 주어집니다. 순서는 그대로 두고 각 수 앞에 + 또는 −를 붙여 모두 더하거나 뺄 때, 그 합이 target과 같아지는 방법이 몇 가지인지 구합니다.`,rules:[`숫자는 2개 이상 20개 이하, 각 숫자는 1 이상 50 이하의 자연수`,`target은 1 이상 1,000 이하의 자연수`,`숫자의 순서는 바꿀 수 없고, 모든 숫자에 + 또는 −를 하나씩 붙임`],examples:[{input:`numbers = [1, 1, 1, 1, 1], target = 3`,output:`5`},{input:`numbers = [4, 1, 2, 1], target = 4`,output:`2`}]},keyIntuitions:[`숫자마다 +와 −, 두 갈래로 나뉘므로 방법은 모두 2^n가지입니다. n이 최대 20이라 약 100만 가지를 전부 따져 봐도 시간 안에 끝납니다.`,`DFS는 한 갈래를 맨 아래까지 내려가 숫자를 모두 쓴 순간 합을 확인하고, 되돌아와 다음 갈래로 갑니다. 합이 target과 같은 가지를 셀 때마다 count를 올립니다.`,`"target에 가까운 쪽"만 고르는 그리디는 지금은 멀어지는 길로 가야 닿는 가지를 놓치고, 방법의 개수도 셀 수 없습니다.`],demo:{input:[o,s],label:`numbers = [1, 1, 3], target = 3`},workUnit:`합을 만든 횟수`,approaches:[{id:`target-dfs`,name:`깊이 우선 탐색 (DFS)`,rank:`BEST`,timeComplexity:`O(2^N)`,spaceComplexity:`O(N) 재귀 깊이`,verdict:`숫자마다 더하기와 빼기 두 갈래로 끝까지 내려가며 세는, 문제 그대로의 풀이입니다.`,pros:[`"더할까, 뺄까"를 재귀 호출 두 줄로 그대로 옮겨 코드가 가장 짧습니다.`,`재귀 깊이가 숫자 개수(최대 20)뿐이라 메모리를 거의 쓰지 않습니다.`,`N ≤ 20이면 가지가 2^20 ≈ 100만 개라 모두 따져 봐도 시간 안에 끝납니다.`],cons:[`숫자가 30개만 돼도 가지가 10억 개를 넘어 쓸 수 없습니다.`,`같은 (자리, 합)이 여러 번 나와도 매번 다시 따집니다.`],whyThisRank:`갈래가 둘뿐이고 깊이가 낮아 모든 경우를 따지는 것이 곧 정답입니다. 코드가 짧고 메모리도 가장 적게 들어 시험에서 가장 먼저 떠올릴 풀이입니다.`,code:D,visualize:ee},{id:`target-bfs`,name:`너비 우선 탐색 (BFS)`,rank:`ALTERNATIVE`,timeComplexity:`O(2^N)`,spaceComplexity:`O(2^N) 큐`,verdict:`답은 같지만 큐에 한 줄의 가지를 한꺼번에 쌓아 메모리를 훨씬 더 씁니다.`,pros:[`재귀 없이 반복문 하나로 풀 수 있어 재귀 한도를 걱정하지 않아도 됩니다.`,`숫자를 하나 쓸 때마다 가능한 합이 어떻게 두 배로 늘어나는지 줄 단위로 볼 수 있습니다.`],cons:[`맨 아래 줄에서 큐에 2^N개가 한꺼번에 쌓여, N = 20이면 (쓴 숫자 수, 합) 쌍 100만 개를 담아야 합니다.`,`DFS는 한 갈래만 들고 있어 같은 시간에 메모리를 훨씬 적게 씁니다.`],whyThisRank:`시간은 DFS와 같습니다. 그런데 큐가 가지 수만큼 자라는 만큼 메모리를 더 쓰므로, 이 문제에서는 깊이 우선이 더 가볍습니다.`,code:k,visualize:te},{id:`target-greedy`,name:`그리디 (target에 가까운 쪽 고르기)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(1)`,verdict:`빠르고 그럴듯하지만 한 길만 가 보고 끝나서 오답이 나옵니다.`,pros:[`숫자를 한 번만 훑어 O(N)으로 끝납니다.`],cons:[`매번 target에 가까운 쪽만 고르므로 지금은 멀어져도 나중에 target에 닿는 가지를 놓칩니다. numbers = [1, 1, 3], target = 3이면 +1 +1 +3 = 5로 끝나 0을 돌려주지만 정답은 2입니다.`,`한 가지 길만 따라가므로 방법이 여러 개여도 많아야 1만 돌려줄 수 있습니다.`],whyThisRank:`이 문제는 합이 target이 되는 방법이 모두 몇 가지인지 묻습니다. 가지를 하나도 놓치지 않으려면 DFS로 모든 가지를 살펴야 합니다.`,code:j,visualize:ne}],checks:{cases:[{args:[[1,1,1,1,1],3],expected:5},{args:[[4,1,2,1],4],expected:2},{args:[[1,1],2],expected:1},{args:[[1,1],3],expected:0},{args:[[1,2],1],expected:1},{args:[Array(10).fill(1),4],expected:120},{args:[o,s],expected:2}],random:e=>{let t=2+Math.floor(e()*6);return[Array.from({length:t},()=>1+Math.floor(e()*10)),1+Math.floor(e()*25)]}}};export{re as default};