import{a as e,i as t,r as n,s as r}from"./shared-e6uNbDLo.js";import{t as i}from"./paced-DMEp_Mu1.js";var a=3,o=[2,0,1,3,0,1,4],s=[0,2,3,0,5,0,1],c=o.length,l={python:`def solution(cap, n, deliveries, pickups):
    answer = 0
    d = p = 0                        # 아직 처리하지 못한 배달·수거 상자 수 (음수면 트럭에 여유가 남음)
    for i in range(n, 0, -1):        # i번 집: 먼 집부터
        d += deliveries[i - 1]
        p += pickups[i - 1]
        while d > 0 or p > 0:        # 이 집까지 가야 하는 상자가 남았다
            d -= cap                 # 한 번 왕복에 배달 cap개
            p -= cap                 # 수거도 cap개
            answer += i * 2          # i번 집까지 갔다 오는 거리
    return answer`,javascript:`function solution(cap, n, deliveries, pickups) {
  let answer = 0;
  let d = 0; // 아직 처리하지 못한 배달 상자 수 (음수면 트럭에 여유가 남음)
  let p = 0; // 아직 처리하지 못한 수거 상자 수
  for (let i = n; i > 0; i--) { // i번 집: 먼 집부터
    d += deliveries[i - 1];
    p += pickups[i - 1];
    while (d > 0 || p > 0) { // 이 집까지 가야 하는 상자가 남았다
      d -= cap; // 한 번 왕복에 배달 cap개
      p -= cap; // 수거도 cap개
      answer += i * 2; // i번 집까지 갔다 오는 거리
    }
  }
  return answer;
}`},u={init:t(l,[`answer = 0`,`d = p = 0`],[`let answer = 0`,`let d = 0`,`let p = 0`]),add:t(l,[`for i in range(n, 0, -1)`,`d += deliveries[i - 1]`,`p += pickups[i - 1]`],[`for (let i = n; i > 0; i--)`,`d += deliveries[i - 1]`,`p += pickups[i - 1]`]),check:t(l,[`while d > 0 or p > 0`],[`while (d > 0 || p > 0)`]),trip:t(l,[`while d > 0 or p > 0`,`d -= cap`,`p -= cap`,`answer += i * 2`],[`while (d > 0 || p > 0)`,`d -= cap`,`p -= cap`,`answer += i * 2`]),done:t(l,[`for i in range(n, 0, -1)`,`return answer`],[`for (let i = n; i > 0; i--)`,`return answer`])},d={python:`def solution(cap, n, deliveries, pickups):
    answer = 0
    d = p = n                                   # 배달·수거가 남은 가장 먼 집 (1번부터 센다)
    while True:
        while d > 0 and deliveries[d - 1] == 0:   # 남은 배달이 있는 가장 먼 집으로
            d -= 1
        while p > 0 and pickups[p - 1] == 0:      # 남은 수거가 있는 가장 먼 집으로
            p -= 1
        if d == 0 and p == 0:                     # 더 할 일이 없다
            break
        answer += max(d, p) * 2                   # 더 먼 쪽 집까지 갔다 온다
        load = cap
        while load > 0 and d > 0:                 # 먼 집부터 cap개를 배달한다
            take = min(load, deliveries[d - 1])
            deliveries[d - 1] -= take
            load -= take
            if deliveries[d - 1] == 0:
                d -= 1
        load = cap
        while load > 0 and p > 0:                 # 먼 집부터 cap개를 수거한다
            take = min(load, pickups[p - 1])
            pickups[p - 1] -= take
            load -= take
            if pickups[p - 1] == 0:
                p -= 1
    return answer`,javascript:`function solution(cap, n, deliveries, pickups) {
  let answer = 0;
  let d = n; // 배달·수거가 남은 가장 먼 집 (1번부터 센다)
  let p = n;
  while (true) {
    while (d > 0 && deliveries[d - 1] === 0) d--; // 남은 배달이 있는 가장 먼 집으로
    while (p > 0 && pickups[p - 1] === 0) p--; // 남은 수거가 있는 가장 먼 집으로
    if (d === 0 && p === 0) break; // 더 할 일이 없다
    answer += Math.max(d, p) * 2; // 더 먼 쪽 집까지 갔다 온다
    let load = cap;
    while (load > 0 && d > 0) { // 먼 집부터 cap개를 배달한다
      const take = Math.min(load, deliveries[d - 1]);
      deliveries[d - 1] -= take;
      load -= take;
      if (deliveries[d - 1] === 0) d--;
    }
    load = cap;
    while (load > 0 && p > 0) { // 먼 집부터 cap개를 수거한다
      const take = Math.min(load, pickups[p - 1]);
      pickups[p - 1] -= take;
      load -= take;
      if (pickups[p - 1] === 0) p--;
    }
  }
  return answer;
}`},f={init:t(d,[`answer = 0`,`d = p = n`],[`let answer = 0`,`let d = n`,`let p = n`]),find:t(d,[`while d > 0 and deliveries[d - 1] == 0`,`while p > 0 and pickups[p - 1] == 0`,`if d == 0 and p == 0`],[`while (d > 0 && deliveries[d - 1] === 0)`,`while (p > 0 && pickups[p - 1] === 0)`,`if (d === 0 && p === 0)`]),trip:t(d,[`answer += max(d, p) * 2`],[`answer += Math.max(d, p) * 2`]),move:t(d,[`load = cap`,`while load > 0 and d > 0`,`take = min(load, deliveries[d - 1])`,`while load > 0 and p > 0`,`take = min(load, pickups[p - 1])`],[`let load = cap`,`while (load > 0 && d > 0)`,`const take = Math.min(load, deliveries[d - 1])`,`while (load > 0 && p > 0)`,`const take = Math.min(load, pickups[p - 1])`]),done:t(d,[`if d == 0 and p == 0`,`return answer`],[`if (d === 0 && p === 0)`,`return answer`])},p={python:`def solution(cap, n, deliveries, pickups):
    answer = 0
    while True:
        far = n                                           # 가장 먼 집을 매번 끝에서부터 다시 찾는다
        while far > 0 and deliveries[far - 1] == 0 and pickups[far - 1] == 0:
            far -= 1
        if far == 0:                                      # 더 할 일이 없다
            break
        answer += far * 2
        load = cap
        for i in range(far, 0, -1):                       # 먼 집부터 cap개를 배달한다 (다 실어도 끝까지 훑는다)
            take = min(load, deliveries[i - 1])
            deliveries[i - 1] -= take
            load -= take
        load = cap
        for i in range(far, 0, -1):                       # 먼 집부터 cap개를 수거한다
            take = min(load, pickups[i - 1])
            pickups[i - 1] -= take
            load -= take
    return answer`,javascript:`function solution(cap, n, deliveries, pickups) {
  let answer = 0;
  while (true) {
    let far = n; // 가장 먼 집을 매번 끝에서부터 다시 찾는다
    while (far > 0 && deliveries[far - 1] === 0 && pickups[far - 1] === 0) far--;
    if (far === 0) break; // 더 할 일이 없다
    answer += far * 2;
    let load = cap;
    for (let i = far; i > 0; i--) { // 먼 집부터 cap개를 배달한다 (다 실어도 끝까지 훑는다)
      const take = Math.min(load, deliveries[i - 1]);
      deliveries[i - 1] -= take;
      load -= take;
    }
    load = cap;
    for (let i = far; i > 0; i--) { // 먼 집부터 cap개를 수거한다
      const take = Math.min(load, pickups[i - 1]);
      pickups[i - 1] -= take;
      load -= take;
    }
  }
  return answer;
}`},m={init:t(p,[`answer = 0`],[`let answer = 0`]),find:t(p,[`far = n`,`while far > 0 and deliveries[far - 1] == 0`,`if far == 0`],[`let far = n`,`while (far > 0 && deliveries[far - 1] === 0`,`if (far === 0)`]),trip:t(p,[`answer += far * 2`],[`answer += far * 2`]),move:t(p,[`load = cap`,`for i in range(far, 0, -1)`,`take = min(load, deliveries[i - 1])`,`take = min(load, pickups[i - 1])`],[`let load = cap`,`for (let i = far; i > 0; i--)`,`const take = Math.min(load, deliveries[i - 1])`,`const take = Math.min(load, pickups[i - 1])`]),done:t(p,[`far = n`,`if far == 0`,`return answer`],[`let far = n`,`if (far === 0)`,`return answer`])},h=84,g=52,_=46,v=e=>h+(e-1)*g,y=48,b=96,x=176,S=214,C=h+c*g+40,w=332,T=e=>`dv:${e}`,E=e=>`pk:${e}`,D=e=>({type:`wait`,ms:e}),O=(...e)=>r([{type:`unfocus`},{type:`clearMarks`},...e]),k=(e,t,n=!1)=>({type:`set`,id:e,patch:t,pop:n}),A=(e,t)=>({x:t>0?v(t)+3:34,y:e===`p`?142:22,w:40,h:20}),j=(e,t,n,r)=>{let i=`ptr:${t}`;return e.has(i)?{type:`set`,id:i,patch:{rect:A(t,n)}}:{type:`add`,item:{id:i,kind:`token`,rect:A(t,n),tone:`chosen`,text:r}}},M=e=>({type:`set`,id:`tok:ans`,patch:{text:`거리 ${e}`,tone:`chosen`},pop:!0}),N=(e,t)=>({id:`trip:${e}`,kind:`bar`,rect:{x:78,y:S+e*28,w:t*g,h:22},tone:`path`,fill:1,text:`왕복 ${t*2}`});function P(e=[]){let t=[{id:`lab:dv`,kind:`text`,rect:{x:0,y,w:78,h:40},text:`배달`},{id:`lab:pk`,kind:`text`,rect:{x:0,y:b,w:78,h:40},text:`수거`},{id:`lab:trip`,kind:`text`,rect:{x:0,y:S,w:78,h:22},tone:`muted`,text:`왕복 기록`},{id:`tok:ans`,kind:`token`,rect:{x:364,y:x,w:96,h:28},tone:`plain`,text:`거리 0`},...e];return o.forEach((e,n)=>t.push({id:`hd:${n+1}`,kind:`text`,rect:{x:v(n+1),y:0,w:_,h:16},tone:`muted`,text:`${n+1}번 집`},{id:T(n+1),kind:`cell`,rect:{x:v(n+1),y,w:_,h:40},tone:e?`plain`:`explored`,text:String(e)},{id:E(n+1),kind:`cell`,rect:{x:v(n+1),y:b,w:_,h:40},tone:s[n]?`plain`:`explored`,text:String(s[n])})),{width:C,height:w,items:t}}function F(){let e=new i(P([{id:`tok:d`,kind:`token`,rect:{x:h,y:x,w:130,h:28},tone:`plain`,text:`배달 d = 0`},{id:`tok:p`,kind:`token`,rect:{x:224,y:x,w:130,h:28},tone:`plain`,text:`수거 p = 0`}])),[t,l,d,f,p,m]=[0,0,0,0,0,0],g=()=>({work:f,variables:{i:m||`-`,d:t,p:l,answer:d}}),_=()=>[{type:`set`,id:`tok:d`,patch:{text:`배달 d = ${t}`,tone:`chosen`},pop:!0},{type:`set`,id:`tok:p`,patch:{text:`수거 p = ${l}`,tone:`chosen`},pop:!0}];for(e.step({title:`answer = 0, d = p = 0`,codeHighlights:u.init,...g()}),e.phase(`시작`,`멀리 있는 집부터 보며 처리하지 못한 배달 d개와 수거 p개를 들고 갑니다. 처음엔 0개입니다.`),e.do(...r(_())),m=c;m>0;m--){let[i,c]=[o[m-1],s[m-1]],[h,_]=[t,l];t+=i,l+=c,f++;let v=[k(T(m),{tone:`visited`}),k(E(m),{tone:`visited`})],y=Math.max(0,Math.ceil(Math.max(t,l)/a)),b=m*2,[x,S]=[t-y*a,l-y*a],[C,w]=[t,l];t=x,l=S,d+=y*b,e.step({title:`${m}번 집: 배달 ${i}, 수거 ${c} → ${y?`왕복 ${y}번`:`왕복 없음`}`,codeHighlights:y?u.trip:u.check,...g()}),e.phase(`쌓기`,`${m}번 집 배달 ${i}, 수거 ${n(c,`을`,`를`)} 더합니다. d = ${h} + ${i} = ${C}, p = ${_} + ${c} = ${w}`,u.add),e.do(...r([{type:`focus`,ids:[T(m),E(m)]},k(T(m),{tone:`current`}),k(E(m),{tone:`current`}),{type:`set`,id:`tok:d`,patch:{text:`배달 d = ${C}`,tone:`chosen`},pop:!0},{type:`set`,id:`tok:p`,patch:{text:`수거 p = ${w}`,tone:`chosen`},pop:!0}]));let[A,j]=[C,w];for(let t=0;t<y;t++)[A,j]=[A-a,j-a],p++,e.phase(`왕복`,`${b}만큼 왕복: ${a}개씩 덜어 d = ${A}, p = ${j}`,u.trip),e.do(...O()),e.do(...r([{type:`add`,item:N(p-1,m),from:T(m)},{type:`set`,id:`tok:d`,patch:{text:`배달 d = ${A}`},pop:!0},{type:`set`,id:`tok:p`,patch:{text:`수거 p = ${j}`},pop:!0},M(d-(y-1-t)*b)]));e.phase(`확인하기`,`d = ${A}, p = ${j}, 둘 다 0 이하라 ${m>1?`다음 집으로 갑니다.`:`모든 집을 봤습니다.`}`,u.check),e.do(...O(...v)),e.do({type:`arrow`,from:`tok:d`,to:`tok:p`,verdict:`good`,label:m>1?`d, p ≤ 0 → 다음 집`:`d, p ≤ 0 → 끝`},D(300))}return m=0,e.step({title:`거리 합 ${d}`,codeHighlights:u.done,...g(),answer:d,isKeyframe:!0}),e.phase(`정답`,`집을 한 번씩만 보고 왕복 ${p}번에 거리 합 ${d}입니다. 밀린 양이 음수인 만큼은 가까운 집에서 쓰입니다.`),e.do(...r([...Array.from({length:p},(e,t)=>({type:`set`,id:`trip:${t}`,patch:{tone:`good`}})),{type:`set`,id:`tok:ans`,patch:{tone:`path`},pop:!0}])),e.finish()}function I(){let[e,t]=[[...o],[...s]],[n,r]=[c,c],i=[];for(;;){let o=0;for(;n>0&&(o++,e[n-1]===0);)n--;for(;r>0&&(o++,t[r-1]===0);)r--;if(n===0&&r===0)return{trips:i,tail:o};let[s,c]=[n,r],[l,u]=[[],[]],d=a;for(;d>0&&n>0;){o++;let t=Math.min(d,e[n-1]);e[n-1]-=t,d-=t,l.push([n,t]),e[n-1]===0&&n--}for(d=a;d>0&&r>0;){o++;let e=Math.min(d,t[r-1]);t[r-1]-=e,d-=e,u.push([r,e]),t[r-1]===0&&r--}i.push({far:Math.max(s,c),dFar:s,pFar:c,delivered:l,picked:u,reads:o,dEnd:n,pEnd:r})}}function L(){let[e,t]=[[...o],[...s]],n=[];for(;;){let r=0,i=c;for(;i>0&&(r++,e[i-1]===0&&t[i-1]===0);)i--;if(i===0)return{trips:n,tail:r};let[o,s]=[[],[]],l=a;for(let t=i;t>0;t--){r++;let n=Math.min(l,e[t-1]);e[t-1]-=n,l-=n,n&&o.push([t,n])}l=a;for(let e=i;e>0;e--){r++;let n=Math.min(l,t[e-1]);t[e-1]-=n,l-=n,n&&s.push([e,n])}n.push({far:i,dFar:i,pFar:i,delivered:o,picked:s,reads:r,dEnd:0,pEnd:0})}}var R=e=>e.some(([,e])=>e)?e.filter(([,e])=>e).map(([e,t])=>`${e}번 집 ${t}개`).join(`, `):`없음`;function z(t){let l=t===`pointers`,u=l?I():L(),d=l?f:m,p=new i(P()),[h,g]=[[...o],[...s]],[_,v,y]=[0,0,0],[b,x]=[c,c],S=()=>({work:v,variables:l?{d:b,p:x,answer:_}:{far:y||`-`,answer:_}});return p.step({title:l?`d = p = n에서 시작`:`왕복마다 처음부터 다시 훑기`,codeHighlights:d.init,...S()}),p.phase(`시작`,l?`배달·수거가 남은 가장 먼 집을 가리키는 포인터 d, p를 ${c}번 집에 두고 시작합니다.`:`왕복할 때마다 가장 먼 집을 맨 끝(7번 집)에서부터 다시 찾고, 집을 끝까지 훑습니다.`),p.do(...r(l?[j(p,`d`,c,`d`),j(p,`p`,c,`p`)]:[j(p,`s`,c,`far`)])),u.trips.forEach((e,t)=>{v+=e.reads,_+=e.far*2,y=e.far,e.delivered.forEach(([e,t])=>h[e-1]-=t),e.picked.forEach(([e,t])=>g[e-1]-=t),[b,x]=[e.dEnd,e.pEnd];let i=()=>[...e.delivered.filter(([,e])=>e).map(([e])=>k(T(e),{text:String(h[e-1]),tone:h[e-1]?`plain`:`visited`},!0)),...e.picked.filter(([,e])=>e).map(([e])=>k(E(e),{text:String(g[e-1]),tone:g[e-1]?`plain`:`visited`},!0))];p.step({title:`${t+1}번째 왕복: ${e.far}번 집까지 (거리 ${e.far*2})`,codeHighlights:d.move,...S()}),p.phase(l?`먼 집 찾기`:`훑기`,l?`배달은 ${e.dFar?`${e.dFar}번`:`끝`}, 수거는 ${e.pFar?`${e.pFar}번`:`끝`} 집까지 남았으니 ${e.far}번 집까지 갑니다.`:`${c}번 집부터 거꾸로 확인해 가장 먼 집 ${e.far}번을 찾습니다. 집을 ${c-e.far+1}번 확인했습니다.`,d.find);let o=l?[...e.dFar?[T(e.dFar)]:[],...e.pFar?[E(e.pFar)]:[]]:[T(e.far),E(e.far)];p.do(...r([{type:`focus`,ids:o},...l?[j(p,`d`,e.dFar,`d`),j(p,`p`,e.pFar,`p`)]:[j(p,`s`,e.far,`far`)]])),p.phase(`왕복`,`${e.far}번 집까지 왕복해 거리 ${n(e.far*2,`을`,`를`)} 더합니다. 합계 ${_}입니다.`,d.trip),p.do(...O()),p.do(...r([{type:`add`,item:N(t,e.far),from:T(e.far)},M(_)])),p.phase(`상자 옮기기`,l?`먼 집부터 ${a}개씩 옮깁니다. 배달: ${R(e.delivered)}, 수거: ${R(e.picked)}.`:`집 ${e.far}채를 두 번 끝까지 훑으며 옮깁니다. 배달: ${R(e.delivered)}, 수거: ${R(e.picked)}.`,d.move),p.do(...r([...i(),...l?[j(p,`d`,b,`d`),j(p,`p`,x,`p`)]:[]]))}),v+=u.tail,y=0,p.step({title:`거리 합 ${_}`,codeHighlights:d.done,...S(),answer:_,isKeyframe:!0}),p.phase(`정답`,l?`남은 상자가 없어 거리 합 ${_}입니다. 정석과 같은 답이지만 집을 ${v}번 확인했고, 정석은 ${c}번이면 됩니다.`:`답은 ${e(_)} 맞지만 집을 ${v}번 확인했습니다. 왕복마다 집을 처음부터 훑어 왕복 수 × n이 되므로, n = 10만이면 시간 초과입니다.`),p.do(...r([...Array.from({length:u.trips.length},(e,t)=>({type:`set`,id:`trip:${t}`,patch:{tone:`good`}})),{type:`set`,id:`tok:ans`,patch:{tone:`path`},pop:!0}])),p.finish()}var B={id:`delivery-pickup`,title:`택배 배달과 수거하기`,level:2,category:`greedy`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/150369`,description:{summary:`창고에서 일직선으로 늘어선 n개의 집으로 택배를 배달하고, 집에 쌓인 빈 상자를 수거해 창고로 가져옵니다. i번 집은 창고에서 i만큼 떨어져 있고, 트럭에는 상자를 한 번에 최대 cap개 실을 수 있습니다. 모든 배달과 수거를 마치고 창고로 돌아오는 최소 이동 거리를 구합니다.`,rules:[`1 ≤ cap ≤ 50`,`1 ≤ n ≤ 100,000`,`deliveries와 pickups의 길이는 n이고, 각 원소는 0 이상 50 이하`,`빈 상자는 창고로 가져와야 하므로, 수거한 상자를 실을 자리도 트럭에 남아 있어야 함`],examples:[{input:`cap = 4, n = 5, deliveries = [1, 0, 3, 1, 2], pickups = [0, 3, 0, 4, 0]`,output:`16`},{input:`cap = 2, n = 7, deliveries = [1, 0, 2, 0, 1, 0, 2], pickups = [0, 2, 0, 1, 0, 2, 0]`,output:`30`}]},keyIntuitions:[`가장 먼 집까지 가는 왕복은 어차피 필요하니, 먼 집부터 처리해야 가까운 집은 그 왕복에 덤으로 끼워 넣을 수 있습니다.`,`배달은 갈 때 내려놓고 수거는 올 때 싣습니다. 그래서 배달과 수거는 서로 영향을 주지 않고, 왕복 한 번에 각각 cap개씩 처리됩니다.`,`먼 집부터 처리하지 못한 배달 d개와 수거 p개를 들고 가면서, d나 p가 0보다 크면 그 집까지 왕복을 한 번 더 합니다. 음수는 트럭에 여유가 남았다는 뜻입니다.`],demo:{input:[a,c,o,s],label:`cap = 3, n = 7, deliveries = [2, 0, 1, 3, 0, 1, 4], pickups = [0, 2, 3, 0, 5, 0, 1]`},workUnit:`집을 확인한 횟수`,approaches:[{id:`delivery-pickup-carry`,name:`먼 집부터 밀린 양을 들고 가기`,rank:`BEST`,timeComplexity:`O(n + 왕복 수)`,spaceComplexity:`O(1)`,verdict:`먼 집부터 처리하지 못한 배달·수거 상자 수를 들고 가며, 0보다 크면 그 집까지 왕복을 더하는 풀이입니다.`,pros:[`집을 한 번씩만 보고, 배열을 고치지 않아 코드가 짧습니다.`,`음수로 트럭의 남은 자리까지 한 변수에 담아, 가까운 집을 덤으로 처리하는 일을 따로 계산하지 않습니다.`,`n이 10만이어도 순식간에 끝납니다.`],cons:[`d와 p가 "처리하지 못한 양"이면서 음수일 땐 "여유"라는 이중 의미를 이해해야 합니다.`,`배달과 수거를 합쳐 왕복 거리를 하나로 세는 이유(더 먼 쪽 기준)가 코드에 드러나지 않습니다.`],whyThisRank:`가장 먼 집까지의 왕복은 반드시 필요하고, 그 왕복에 cap개씩 배달·수거를 모두 끼워 넣는 것이 가장 알뜰합니다. 먼 집부터 처리하면 이 선택이 매번 안전합니다.`,code:l,visualize:F},{id:`delivery-pickup-pointers`,name:`포인터 두 개로 왕복 따라 하기`,rank:`ALTERNATIVE`,timeComplexity:`O(n + 왕복 수)`,spaceComplexity:`O(1)`,verdict:`배달·수거가 남은 가장 먼 집을 포인터 둘로 가리키며, 왕복마다 상자를 실제로 덜어 내는 맞지만 손이 많이 가는 풀이입니다.`,pros:[`왕복을 눈으로 따라 하는 방식이라 직관적입니다.`,`포인터를 되감지 않아 집을 처음부터 다시 훑지 않습니다.`],cons:[`포인터 두 개와 상자를 덜어 내는 반복문이 있어 코드가 길고 경계를 틀리기 쉽습니다.`,`deliveries와 pickups 배열을 직접 고칩니다.`],whyThisRank:`아이디어는 정석과 같지만 상자 하나하나를 덜어 내며 배열을 고쳐야 합니다. 정석은 같은 일을 "밀린 양" 두 개로 압축합니다.`,code:d,visualize:()=>z(`pointers`)},{id:`delivery-pickup-rescan`,name:`왕복마다 집을 처음부터 다시 훑기`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(왕복 수 × n)`,spaceComplexity:`O(1)`,verdict:`왕복할 때마다 가장 먼 집을 끝에서부터 다시 찾고 집을 끝까지 훑는 풀이로, 답은 맞지만 왕복이 많으면 시간 초과입니다.`,pros:[`생각한 대로 그대로 따라 하면 되어 가장 쉽습니다.`,`작은 입력에서는 답이 맞습니다.`],cons:[`cap = 1이고 상자가 많으면 왕복이 수백만 번인데, 왕복마다 집 10만 채를 다시 훑습니다.`,`트럭이 이미 가득 차도 반복문이 끝까지 돌아 낭비가 큽니다.`],whyThisRank:`이미 확인한 집을 왕복마다 다시 확인합니다. 먼 집부터 한 번만 훑으며 밀린 양을 들고 가면, 왕복 수와 n을 곱할 필요가 없습니다.`,code:p,visualize:()=>z(`rescan`)}],checks:{cases:[{args:[4,5,[1,0,3,1,2],[0,3,0,4,0]],expected:16},{args:[2,7,[1,0,2,0,1,0,2],[0,2,0,1,0,2,0]],expected:30},{args:[1,1,[1],[0]],expected:2},{args:[3,2,[0,0],[0,0]],expected:0},{args:[50,3,[1,1,1],[1,1,1]],expected:6},{args:[1,2,[0,1],[1,0]],expected:4},{args:[2,4,[0,0,0,5],[0,0,0,0]],expected:24},{args:[a,c,o,s],expected:40}],random:e=>{let t=1+Math.floor(e()*7),n=()=>Array.from({length:t},()=>Math.floor(e()*5));return[1+Math.floor(e()*4),t,n(),n()]}}};export{B as default};