import{n as e,t}from"./index-DQku_aTs.js";import{a as n,c as r,i,r as a,s as o}from"./shared-e6uNbDLo.js";var s=1000000007,c=5,l=[1,2,5],u=l.join(`, `);function d(e){let t=[,,,,,,].fill(0);t[0]=1;let n=[],r=(e,r,i)=>{let a=t[r];t[r]=(t[r]+t[r-e])%s,n.push({coin:e,x:r,before:a,add:t[r-e],after:t[r],firstOfGroup:i})};if(e)for(let e of l)for(let t=e;t<=c;t++)r(e,t,t===e);else for(let e=1;e<=c;e++)for(let t of l)e>=t&&r(t,e,t===l.find(t=>t<=e));return{list:n,dp:t}}var f=d(!0),p=d(!1),m=f.dp[c],h=e=>e<=1?1:e*h(e-1);function g(){let e={text:``,orders:0},t=(n,r,i)=>{if(n===l.length){if(r)return;let t=i.reduce((e,t)=>e+t,0),n=i.reduce((e,t)=>e/h(t),h(t));n>e.orders&&(e={text:i.flatMap((e,t)=>Array(e).fill(l[t])).join(` + `),orders:n})}else for(let e=0;e*l[n]<=r;e++)t(n+1,r-e*l[n],[...i,e])};return t(0,c,[]),e}var _=g(),v=(e,t)=>{let n=Array(e+1).fill(0);n[0]=1;for(let r of t)for(let t=r;t<=e;t++)n[t]=(n[t]+n[t-r])%s;return n[e]},y=[1e5,[1,2,5,10,20,50,100,200,500]],b={python:`def solution(n, money):
    MOD = 1_000_000_007
    dp = [0] * (n + 1)  # dp[x] = x원을 만드는 방법의 수
    dp[0] = 1  # 0원은 아무것도 내지 않는 1가지

    for coin in money:  # 동전을 바깥에서 하나씩 돌아야 같은 조합을 한 번만 셉니다
        for x in range(coin, n + 1):
            dp[x] = (dp[x] + dp[x - coin]) % MOD  # coin 하나를 더 쓰는 경우를 더합니다

    return dp[n]`,javascript:`function solution(n, money) {
  const MOD = 1_000_000_007;
  const dp = Array(n + 1).fill(0); // dp[x] = x원을 만드는 방법의 수
  dp[0] = 1; // 0원은 아무것도 내지 않는 1가지

  for (const coin of money) { // 동전을 바깥에서 하나씩 돌아야 같은 조합을 한 번만 셉니다
    for (let x = coin; x <= n; x++) {
      dp[x] = (dp[x] + dp[x - coin]) % MOD; // coin 하나를 더 쓰는 경우를 더합니다
    }
  }

  return dp[n];
}`},x={start:i(b,[`dp = [0] * (n + 1)`,`dp[0] = 1`],[`const dp = Array(n + 1)`,`dp[0] = 1`]),coin:i(b,[`for coin in money`],[`for (const coin of money)`]),look:i(b,[`for coin in money`,`for x in range(coin`,`dp[x] = (dp[x] + dp[x - coin])`],[`for (const coin of money)`,`for (let x = coin`,`dp[x] = (dp[x] + dp[x - coin])`]),add:i(b,[`dp[x] = (dp[x] + dp[x - coin])`],[`dp[x] = (dp[x] + dp[x - coin])`]),done:i(b,[`return dp[n]`],[`return dp[n]`])},S={python:`def solution(n, money):
    MOD = 1_000_000_007
    k = len(money)
    dp = [[0] * (n + 1) for _ in range(k + 1)]  # dp[i][x] = 앞의 i가지 동전으로 x원을 만드는 방법의 수
    for i in range(k + 1):
        dp[i][0] = 1  # 0원은 아무것도 내지 않는 1가지

    for i in range(1, k + 1):
        coin = money[i - 1]
        for x in range(1, n + 1):
            dp[i][x] = dp[i - 1][x]  # 이 동전을 안 쓰는 경우
            if x >= coin:
                dp[i][x] = (dp[i][x] + dp[i][x - coin]) % MOD  # 이 동전을 하나 더 쓰는 경우

    return dp[k][n]`,javascript:`function solution(n, money) {
  const MOD = 1_000_000_007;
  const k = money.length;
  const dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(0)); // dp[i][x] = 앞의 i가지 동전으로 x원을 만드는 방법의 수
  for (let i = 0; i <= k; i++) dp[i][0] = 1; // 0원은 아무것도 내지 않는 1가지

  for (let i = 1; i <= k; i++) {
    const coin = money[i - 1];
    for (let x = 1; x <= n; x++) {
      dp[i][x] = dp[i - 1][x]; // 이 동전을 안 쓰는 경우
      if (x >= coin) {
        dp[i][x] = (dp[i][x] + dp[i][x - coin]) % MOD; // 이 동전을 하나 더 쓰는 경우
      }
    }
  }

  return dp[k][n];
}`},C={start:i(S,[`k = len(money)`,`dp = [[0]`,`dp[i][0] = 1`],[`const k = money.length`,`const dp = Array.from`,`dp[i][0] = 1`]),small:i(S,[`for i in range(1, k + 1)`,`coin = money[i - 1]`,`for x in range(1, n + 1)`,`dp[i][x] = dp[i - 1][x]`,`if x >= coin`],[`for (let i = 1`,`const coin = money[i - 1]`,`for (let x = 1`,`dp[i][x] = dp[i - 1][x]`,`if (x >= coin)`]),big:i(S,[`for i in range(1, k + 1)`,`coin = money[i - 1]`,`for x in range(1, n + 1)`,`dp[i][x] = dp[i - 1][x]`,`if x >= coin`,`dp[i][x] = (dp[i][x] + dp[i][x - coin])`],[`for (let i = 1`,`const coin = money[i - 1]`,`for (let x = 1`,`dp[i][x] = dp[i - 1][x]`,`if (x >= coin)`,`dp[i][x] = (dp[i][x] + dp[i][x - coin])`]),addSmall:i(S,[`dp[i][x] = dp[i - 1][x]`],[`dp[i][x] = dp[i - 1][x]`]),addBig:i(S,[`dp[i][x] = dp[i - 1][x]`,`dp[i][x] = (dp[i][x] + dp[i][x - coin])`],[`dp[i][x] = dp[i - 1][x]`,`dp[i][x] = (dp[i][x] + dp[i][x - coin])`]),done:i(S,[`return dp[k][n]`],[`return dp[k][n]`])},w={python:`# 주의: 금액을 바깥에서 돌면 같은 조합을 순서만 바꿔 여러 번 셉니다
def solution(n, money):
    MOD = 1_000_000_007
    dp = [0] * (n + 1)
    dp[0] = 1

    for x in range(1, n + 1):
        for coin in money:  # 동전이 안쪽이면 (1, 2)와 (2, 1)을 다른 방법으로 셉니다
            if x >= coin:
                dp[x] = (dp[x] + dp[x - coin]) % MOD

    return dp[n]`,javascript:`// 주의: 금액을 바깥에서 돌면 같은 조합을 순서만 바꿔 여러 번 셉니다
function solution(n, money) {
  const MOD = 1_000_000_007;
  const dp = Array(n + 1).fill(0);
  dp[0] = 1;

  for (let x = 1; x <= n; x++) {
    for (const coin of money) { // 동전이 안쪽이면 (1, 2)와 (2, 1)을 다른 방법으로 셉니다
      if (x >= coin) {
        dp[x] = (dp[x] + dp[x - coin]) % MOD;
      }
    }
  }

  return dp[n];
}`},T={start:i(w,[`dp = [0] * (n + 1)`,`dp[0] = 1`],[`const dp = Array(n + 1)`,`dp[0] = 1`]),amount:i(w,[`for x in range(1, n + 1)`],[`for (let x = 1`]),look:i(w,[`for x in range(1`,`for coin in money`,`if x >= coin`,`dp[x] = (dp[x] + dp[x - coin])`],[`for (let x = 1`,`for (const coin of money)`,`if (x >= coin)`,`dp[x] = (dp[x] + dp[x - coin])`]),add:i(w,[`dp[x] = (dp[x] + dp[x - coin])`],[`dp[x] = (dp[x] + dp[x - coin])`]),done:i(w,[`return dp[n]`],[`return dp[n]`])},E=e=>({type:`wait`,ms:e}),D=()=>o([{type:`clearMarks`},{type:`unfocus`}]),O=e=>({type:`set`,id:`calc`,patch:{text:e}}),k=20,A=2e3,j=e=>Math.max(0,...e.actions.map(t=>t.start+t.duration-e.start)),M=n=>{for(let r of n.steps){let{phases:n}=e(r);n.forEach((e,i)=>{let a=i<n.length-1?140:r.isKeyframe?t:320,o=[...r.phases[i].caption].length*k-a;e.end-e.start<o&&r.phases[i].actions.push(E(Math.ceil(o-j(e))))});let i=e(r),a=i.phases.at(-1),o=A-i.total;o>0&&r.phases.at(-1).actions.push(E(a.end-a.start+o-j(a)))}return n},N=62,P=364,F=44,I=126,L=154,R=e=>`cell:${e}`,z=e=>({x:e*N,y:F,w:54,h:54});function B(e){let{run:t,trap:i,at:s}=e,l=[{id:`coin`,kind:`token`,rect:{x:0,y:0,w:130,h:28},tone:`chosen`,text:`동전 -`}];for(let e=0;e<=c;e++)l.push({id:R(e),kind:`cell`,rect:z(e),tone:e?`plain`:`visited`,text:e?`0`:`1`}),l.push({id:`label:${e}`,kind:`text`,rect:{x:e*N,y:102,w:54,h:16},tone:`muted`,text:`${e}원`});l.push({id:`calc`,kind:`text`,rect:{x:0,y:I,w:P,h:28},text:``});let d=new r({width:P,height:L+(i?40:0),items:l}),f=(e,t)=>({type:`set`,id:R(e),patch:{tone:t}}),p,h=0,g,v=()=>({work:h,variables:{coin:g?.coin??`-`,x:g?.x??`-`,"dp[x - coin]":g?.add??`-`,"dp[x]":g?.after??`-`}}),y=()=>p===void 0?[]:[f(p,`visited`)];d.step({title:`표 만들기: dp[0] = 1`,codeHighlights:s.start,...v()}),d.phase(`시작`,`거스름돈 ${c}원을 동전 ${u}원으로 만드는 방법의 수를 구합니다. dp[x]는 x원을 만드는 방법의 수입니다.`),d.do(O(`dp[x] = x원을 만드는 방법의 수`)),d.phase(`규칙`,i?`0원은 아무것도 내지 않는 1가지입니다. 금액을 하나씩 정해 놓고, 모든 동전을 마지막에 내 보며 더합니다.`:`0원은 아무것도 내지 않는 1가지입니다. 동전을 하나씩 정해 놓고, 그 동전을 하나 더 쓰는 경우를 더해 갑니다.`),d.do(O(`dp[x] += dp[x − 동전]`));for(let e of t.list){let t=y();g=e,p=e.x,h++;let r=`dp[${e.x}] += dp[${e.x-e.coin}]`;d.step({title:`${r} → ${e.after}`,codeHighlights:s.add,...v()}),e.firstOfGroup&&(d.phase(i?`금액 고르기`:`동전 고르기`,i?`${e.x}원을 만드는 방법을 셉니다. 동전을 하나씩 마지막으로 내 봅니다.`:`${e.coin}원짜리 동전을 쓰는 경우를 더합니다. ${e.coin}원 이상인 칸을 왼쪽부터 차례로 고칩니다.`,s.group),d.do(...o([...t,{type:`set`,id:`coin`,patch:{text:`동전 ${e.coin}원`},pop:!0},O(i?`${e.x}원 만들기`:`${e.coin}원 동전 쓰기`)]))),d.phase(`값 가져오기`,`${e.x}원에서 ${e.coin}원 동전 하나를 빼면 ${e.x-e.coin}원입니다. ${e.x-e.coin}원을 만드는 방법은 ${e.add}가지입니다.`,s.look),d.do(...o([...e.firstOfGroup?[]:[...t,{type:`set`,id:`coin`,patch:{text:`동전 ${e.coin}원`},pop:!0}],{type:`focus`,ids:[R(e.x),R(e.x-e.coin)]},f(e.x,`current`),O(`${r} = ${e.before} + ${e.add}`)])),d.do({type:`arrow`,from:R(e.x),to:R(e.x-e.coin),verdict:`good`,label:`${e.add}가지`},E(300)),d.phase(`더하기`,`${e.before} + ${e.add} = ${e.after}. ${a(`dp[${e.x}]`,`을`,`를`)} ${n(e.after)} 고칩니다.`,s.add),d.do(...o([{type:`set`,id:R(e.x),patch:{text:String(e.after)},pop:!0},O(`${r} = ${e.after}`)]),E(300),...D())}let b=t.dp[c],x=y();return g=t.list.at(-1),d.step({title:`답 dp[${c}] = ${b}`,codeHighlights:s.done,...v(),answer:b,isKeyframe:!0}),i?(d.phase(`오답 확인`,`dp[${c}] = ${b}가지라고 답합니다. 하지만 정답은 ${m}가지입니다.`),d.do(...o([...x,f(c,`bad`),O(`내 답 = dp[${c}] = ${b}`)])),d.do({type:`add`,item:{id:`mine`,kind:`token`,rect:{x:0,y:162,w:110,h:28},tone:`bad`,text:`내 답 ${b}`}}),d.phase(`순서까지 센 이유`,`${a(_.text,`은`,`는`)} 동전 묶음이 하나인데 순서를 바꿔 ${_.orders}번 셌습니다. 같은 동전 묶음은 한 번만 세어야 합니다.`),d.do(O(`${_.text}: 순서만 바꿔 ${_.orders}번`)),d.do({type:`add`,item:{id:`truth`,kind:`token`,rect:{x:122,y:162,w:110,h:28},tone:`good`,text:`정답 ${m}`}},E(300))):(d.phase(`답`,`${c}원을 만드는 방법은 dp[${c}] = ${b}가지입니다. 동전을 바깥에서 돌아서 같은 동전 묶음을 한 번씩만 셌습니다.`),d.do(...o([...x,f(c,`path`),O(`dp[${c}] = ${b}가지`)]))),M(d.finish())}var V=66,H=66,U=30,W=(e,t)=>({x:H+t*V,y:U+e*V,w:54,h:54}),G=458,K=U+(l.length+1)*V-12+16,q=([e,t])=>`cell:${e},${t}`,J=e=>e?`${l[e-1]}원`:`동전 없음`;function Y(){let e=Array.from({length:l.length+1},()=>[,,,,,,].fill(0)),t=[];for(let e=0;e<=c;e++)t.push({id:`col:${e}`,kind:`text`,rect:{x:W(0,e).x,y:0,w:54,h:16},tone:`muted`,text:`${e}원`});for(let e=0;e<=l.length;e++){t.push({id:`row:${e}`,kind:`text`,rect:{x:0,y:W(e,0).y,w:60,h:54},tone:`muted`,text:J(e)});for(let n=0;n<=c;n++)t.push({id:q([e,n]),kind:`cell`,rect:W(e,n),tone:`plain`,text:`0`})}t.push({id:`calc`,kind:`text`,rect:{x:0,y:K,w:G,h:28},text:``});let n=new r({width:G,height:K+28,items:t}),i=(e,t,n=!1)=>({type:`set`,id:q(e),patch:t,...n?{pop:n}:{}}),d,f=0,p,m=()=>({work:f,variables:{i:p?.i??`-`,coin:p?.coin??`-`,x:p?.x??`-`,"dp[i - 1][x]":p?.up??`-`,"dp[i][x - coin]":p?.left??`-`,"dp[i][x]":p?.value??`-`}}),h=()=>d?[i(d,{tone:`visited`})]:[];for(let t=0;t<=l.length;t++)e[t][0]=1;n.step({title:`0원 열은 1로 시작`,codeHighlights:C.start,...m()}),n.phase(`시작`,`동전 ${u}원으로 ${c}원을 만드는 방법의 수를 구합니다. dp[i][x]는 앞의 i가지 동전으로 x원을 만드는 방법의 수입니다.`),n.do(O(`줄 = 쓸 수 있는 동전, 칸 = 금액`)),n.phase(`규칙`,`0원은 아무것도 내지 않는 1가지라서 0원 열은 모두 1입니다. 동전 없이는 1원 이상을 만들 수 없어 0입니다.`),n.do(...o([...Array.from({length:l.length+1},(e,t)=>i([t,0],{text:`1`,tone:`visited`})),...Array.from({length:c},(e,t)=>i([0,t+1],{tone:`visited`})),O(`dp[i][x] = 안 쓰는 경우 + 하나 더 쓰는 경우`)]));for(let t=1;t<=l.length;t++){let r=l[t-1];for(let l=1;l<=c;l++){let c=[t,l],u=l>=r,g=e[t-1][l],_=u?e[t][l-r]:0,v=u?(g+_)%s:g;e[t][l]=v;let y=h();p={i:t,x:l,coin:r,up:g,left:u?_:`-`,value:v},d=c,f++;let b=u?[[t-1,l],[t,l-r]]:[[t-1,l]],x=u?`${g} + ${_}`:`${g}`;n.step({title:u?`dp[${t}][${l}] = ${x} = ${v}`:`dp[${t}][${l}] = ${g} (위 칸 그대로)`,codeHighlights:u?C.addBig:C.addSmall,...m()}),n.phase(`두 칸 보기`,u?`${l}원은 ${r}원 동전을 안 쓰는 경우(위 칸) ${g}가지와, 하나 더 쓰는 경우(${r}칸 왼쪽) ${_}가지를 더합니다.`:`${l}원은 ${r}원보다 작아 이 동전을 쓸 수 없습니다. 위 칸의 ${g}가지를 그대로 씁니다.`,u?C.big:C.small),n.do(...o([...y,i(c,{tone:`current`}),{type:`focus`,ids:[q(c),...b.map(q)]},O(u?`안 씀 ${g} + 하나 더 ${_}`:`위 칸 ${g}`)])),n.do(...b.map((e,t)=>({type:`arrow`,from:q(c),to:q(e),verdict:`good`,label:`${t?_:g}가지`})),E(300)),n.phase(`더하기`,u?`${g} + ${_} = ${v}가지를 dp[${t}][${l}]에 적습니다.`:`${a(`dp[${t}][${l}]`,`은`,`는`)} 위 칸과 같은 ${v}가지입니다.`,u?C.addBig:C.addSmall),n.do(...o([i(c,{text:String(v)},!0),O(`dp[${t}][${l}] = ${v}`)]),E(300),...D())}}let g=l.length,_=h();return n.step({title:`답 dp[${g}][${c}] = ${e[g][c]}`,codeHighlights:C.done,...m(),answer:e[g][c],isKeyframe:!0}),n.phase(`답`,`모든 동전을 쓴 마지막 줄의 ${c}원 칸이 답입니다. ${c}원을 만드는 방법은 ${e[g][c]}가지입니다.`),n.do(...o([..._,i([g,c],{tone:`path`}),O(`dp[${g}][${c}] = ${e[g][c]}가지`)])),M(n.finish())}var X={id:`coin-change`,title:`거스름돈`,level:3,category:`dp`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/12907`,description:{summary:`편의점 직원이 손님에게 n원을 거슬러 주려고 합니다. 가진 동전의 종류가 주어질 때, 그 동전들로 n원을 만드는 방법이 모두 몇 가지인지 구합니다. 동전은 종류마다 얼마든지 쓸 수 있고, 답이 커질 수 있어 1,000,000,007로 나눈 나머지를 돌려줍니다.`,rules:[`n은 100,000 이하의 자연수`,`동전의 종류는 100개 이하이고, 종류마다 무제한으로 쓸 수 있음`,`같은 동전 묶음이면 순서가 달라도 한 가지 (예: 1원 + 2원과 2원 + 1원은 같음)`,`방법의 수를 1,000,000,007로 나눈 나머지를 return`],examples:[{input:`n = 5, money = [1, 2, 5]`,output:`4`}]},keyIntuitions:[`x원을 만드는 방법의 수 dp[x]를 0원부터 n원까지 표로 채웁니다. 0원은 아무것도 내지 않는 1가지입니다.`,`동전을 하나씩 바깥에서 정하고, 그 동전을 하나 더 쓰는 경우 dp[x] += dp[x − 동전]을 더합니다. 동전 순서가 고정되므로 같은 조합이 한 번만 세어집니다.`,`금액을 바깥에서 돌고 동전을 안쪽에서 돌리면 (1, 2)와 (2, 1)을 따로 세어 순서까지 다른 방법으로 셉니다. 반복문 순서가 조합과 순열을 가릅니다.`],demo:{input:[c,l],label:`n = ${c}, money = [${u}]`},workUnit:`표 칸을 계산한 횟수`,approaches:[{id:`coin-outer-loop`,name:`동전을 바깥에서 도는 한 줄 표`,rank:`BEST`,timeComplexity:`O(n × 동전 수)`,spaceComplexity:`O(n)`,verdict:`동전을 하나씩 정해 놓고 그 동전을 더 쓰는 경우를 한 줄 표에 더해 가며 조합의 수를 세는 풀이입니다.`,pros:[`길이 n + 1의 표 하나로 끝나 메모리가 적고 코드가 짧습니다.`,`동전을 바깥에서 돌리기만 하면 같은 동전 묶음이 한 번씩만 세어집니다.`,`n = 100,000, 동전 100종이어도 천만 번 남짓한 계산이면 끝납니다.`],cons:[`반복문의 안팎 순서를 바꾸면 조합이 아니라 순열을 세는 오답이 됩니다.`,`동전을 쓰는 순서를 정해 놓고 세는 방식이라 처음에는 왜 맞는지 헷갈립니다.`],whyThisRank:`2차원 표의 한 줄만 남겨 같은 값을 덮어쓰는 형태라 가장 짧고 메모리도 적습니다. 반복문 순서가 곧 조합 세기의 열쇠라서 핵심만 남은 풀이입니다.`,code:b,visualize:()=>B({run:f,trap:!1,at:{start:x.start,group:x.coin,look:x.look,add:x.add,done:x.done}})},{id:`coin-2d-table`,name:`동전마다 한 줄씩 쓰는 2차원 표`,rank:`ALTERNATIVE`,timeComplexity:`O(n × 동전 수)`,spaceComplexity:`O(n × 동전 수)`,verdict:`"앞의 i가지 동전으로 x원"을 줄마다 따로 적어 이해하기는 쉽지만, 동전 수만큼 메모리가 더 드는 풀이입니다.`,pros:[`동전을 안 쓰는 경우(위 칸)와 하나 더 쓰는 경우(왼쪽 칸)가 눈에 보여 왜 조합이 세어지는지 이해하기 좋습니다.`,`줄마다 값이 남아 어떤 동전까지 썼을 때의 방법 수인지 되짚어 볼 수 있습니다.`],cons:[`n = 100,000, 동전 100종이면 천만 칸이라 메모리를 한 줄 표보다 100배 가까이 씁니다.`,`0원 열 채우기, 동전 번호(i − 1)처럼 인덱스를 챙길 것이 늘어납니다.`],whyThisRank:`시간은 정석과 같지만 표가 동전 수만큼 커집니다. 한 줄만 남겨도 되는 값을 전부 들고 있어서, 정석이 같은 계산을 더 적은 메모리로 합니다.`,code:S,visualize:Y},{id:`coin-amount-outer`,name:`금액을 바깥에서 도는 한 줄 표`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(n × 동전 수)`,spaceComplexity:`O(n)`,verdict:`정석과 코드가 거의 같지만 반복문 안팎이 바뀌어, 같은 동전 묶음을 순서만 바꿔 여러 번 세는 오답이 나옵니다.`,pros:[`정석과 한 줄 표, 점화식이 같아 맞는 풀이처럼 보입니다.`,`동전을 몇 번 내는지(순서 있는 방법의 수)를 세는 다른 문제에서는 이 코드가 정답입니다.`],cons:[`원문 입출력 예(n = 5, money = [1, 2, 5])에서 4가 아니라 9를 답합니다.`,`1원, 1원, 1원, 2원처럼 같은 묶음을 순서만 바꿔 4번 세는 식으로 중복이 생깁니다.`],whyThisRank:`금액마다 "마지막에 낸 동전"을 모든 종류로 따지면 낸 순서가 구분되어 순열을 세게 됩니다. 조합을 세려면 동전을 바깥, 금액을 안쪽에 두어 동전 순서를 고정해야 합니다.`,code:w,visualize:()=>B({run:p,trap:!0,at:{start:T.start,group:T.amount,look:T.look,add:T.add,done:T.done}})}],checks:{cases:[{args:[5,[1,2,5]],expected:4},{args:[c,l],expected:m},{args:[1,[2]],expected:0},{args:[10,[1]],expected:1},{args:[3,[1,2]],expected:2},{args:[4,[2,1]],expected:3},{args:y,expected:v(...y)}],random:e=>{let t=[1,2,3,4,5,6],n=[];for(let r=1+Math.floor(e()*3);r>0;r--)n.push(...t.splice(Math.floor(e()*t.length),1));return[1+Math.floor(e()*12),n]}}};export{X as default};