import{n as e,t}from"./index-DQku_aTs.js";import{i as n,r}from"./layout-DFaYBMY_.js";import{a as i,c as a,i as o,n as s,r as c,s as l}from"./shared-e6uNbDLo.js";var u=1000000007,d=5,f=3,p=[[2,2]],m=[1,1],h=[d,f],g=([e,t])=>`${e},${t}`,_=(e,t)=>g(e)===g(t),v=e=>p.some(t=>_(t,e)),y=e=>`cell:${g(e)}`,b={python:`def solution(m, n, puddles):
    MOD = 1_000_000_007
    blocked = {(x, y) for x, y in puddles}  # 웅덩이 좌표는 [열, 행] 순서

    dp = [[0] * (m + 1) for _ in range(n + 1)]  # 0번 줄과 0번 열은 표 바깥(길 0가지)
    dp[1][1] = 1

    for y in range(1, n + 1):
        for x in range(1, m + 1):
            if (x, y) == (1, 1):
                continue
            if (x, y) in blocked:
                dp[y][x] = 0  # 웅덩이로 오는 길은 없습니다
            else:
                dp[y][x] = (dp[y - 1][x] + dp[y][x - 1]) % MOD  # 위 + 왼쪽

    return dp[n][m]`,javascript:`function solution(m, n, puddles) {
  const MOD = 1_000_000_007;
  const blocked = new Set(puddles.map(([x, y]) => x + ',' + y)); // 웅덩이 좌표는 [열, 행] 순서

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0)); // 0번 줄과 0번 열은 표 바깥(길 0가지)
  dp[1][1] = 1;

  for (let y = 1; y <= n; y++) {
    for (let x = 1; x <= m; x++) {
      if (x === 1 && y === 1) continue;
      if (blocked.has(x + ',' + y)) {
        dp[y][x] = 0; // 웅덩이로 오는 길은 없습니다
      } else {
        dp[y][x] = (dp[y - 1][x] + dp[y][x - 1]) % MOD; // 위 + 왼쪽
      }
    }
  }

  return dp[n][m];
}`},x={python:[`for y in range`,`for x in range`],javascript:[`for (let y = 1`,`for (let x = 1`]},S={start:o(b,[`dp = [[0]`,`dp[1][1] = 1`],[`const dp = Array.from`,`dp[1][1] = 1`]),look:o(b,[...x.python,`dp[y][x] = (dp[y - 1][x]`],[...x.javascript,`dp[y][x] = (dp[y - 1][x]`]),add:o(b,[`dp[y][x] = (dp[y - 1][x]`],[`dp[y][x] = (dp[y - 1][x]`]),check:o(b,[...x.python,`if (x, y) in blocked`],[...x.javascript,`if (blocked.has`]),zero:o(b,[`dp[y][x] = 0`],[`dp[y][x] = 0`]),done:o(b,[`return dp[n][m]`],[`return dp[n][m]`])},C={python:`def solution(m, n, puddles):
    MOD = 1_000_000_007
    blocked = {(x, y) for x, y in puddles}  # 웅덩이 좌표는 [열, 행] 순서

    dp = [[0] * (m + 1) for _ in range(n + 1)]
    dp[1][1] = 1

    for y in range(1, n + 1):
        for x in range(1, m + 1):
            if (x, y) in blocked:
                continue  # 웅덩이는 받지도 보내지도 않습니다
            # 이 칸으로 오는 길은 이미 다 모였으니 오른쪽과 아래로 나눠 줍니다
            if x < m and (x + 1, y) not in blocked:
                dp[y][x + 1] = (dp[y][x + 1] + dp[y][x]) % MOD
            if y < n and (x, y + 1) not in blocked:
                dp[y + 1][x] = (dp[y + 1][x] + dp[y][x]) % MOD

    return dp[n][m]`,javascript:`function solution(m, n, puddles) {
  const MOD = 1_000_000_007;
  const blocked = new Set(puddles.map(([x, y]) => x + ',' + y)); // 웅덩이 좌표는 [열, 행] 순서

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  dp[1][1] = 1;

  for (let y = 1; y <= n; y++) {
    for (let x = 1; x <= m; x++) {
      if (blocked.has(x + ',' + y)) continue; // 웅덩이는 받지도 보내지도 않습니다
      // 이 칸으로 오는 길은 이미 다 모였으니 오른쪽과 아래로 나눠 줍니다
      if (x < m && !blocked.has(x + 1 + ',' + y)) {
        dp[y][x + 1] = (dp[y][x + 1] + dp[y][x]) % MOD;
      }
      if (y < n && !blocked.has(x + ',' + (y + 1))) {
        dp[y + 1][x] = (dp[y + 1][x] + dp[y][x]) % MOD;
      }
    }
  }

  return dp[n][m];
}`},w={start:o(C,[`dp = [[0]`,`dp[1][1] = 1`],[`const dp = Array.from`,`dp[1][1] = 1`]),check:o(C,[...x.python,`if (x, y) in blocked`],[...x.javascript,`if (blocked.has`]),skip:o(C,[...x.python,`if (x, y) in blocked`,`continue`],[...x.javascript,`if (blocked.has`]),rightNo:o(C,[`if x < m and`],[`if (x < m &&`]),right:o(C,[`if x < m and`,`dp[y][x + 1] = `],[`if (x < m &&`,`dp[y][x + 1] = `]),downNo:o(C,[`if y < n and`],[`if (y < n &&`]),down:o(C,[`if y < n and`,`dp[y + 1][x] = `],[`if (y < n &&`,`dp[y + 1][x] = `]),done:o(C,[`return dp[n][m]`],[`return dp[n][m]`])},T={python:`# 주의: 100 x 100이면 호출이 10^58번이 넘어 끝나지 않는 풀이입니다
def solution(m, n, puddles):
    MOD = 1_000_000_007
    blocked = {(x, y) for x, y in puddles}

    def paths(x, y):
        if (x, y) in blocked:
            return 0
        if x == 1 and y == 1:
            return 1
        # 메모 없이 왼쪽 칸과 위쪽 칸을 매번 다시 계산 → 지수 시간
        total = 0
        if x > 1:
            total += paths(x - 1, y)
        if y > 1:
            total += paths(x, y - 1)
        return total % MOD

    return paths(m, n)`,javascript:`// 주의: 100 x 100이면 호출이 10^58번이 넘어 끝나지 않는 풀이입니다
function solution(m, n, puddles) {
  const MOD = 1_000_000_007;
  const blocked = new Set(puddles.map(([x, y]) => x + ',' + y));

  const paths = (x, y) => {
    if (blocked.has(x + ',' + y)) return 0;
    if (x === 1 && y === 1) return 1;
    // 메모 없이 왼쪽 칸과 위쪽 칸을 매번 다시 계산 → 지수 시간
    let total = 0;
    if (x > 1) total += paths(x - 1, y);
    if (y > 1) total += paths(x, y - 1);
    return total % MOD;
  };

  return paths(m, n);
}`},E={start:o(T,[`def paths(x, y)`],[`const paths = (x, y)`]),first:o(T,[`return paths(m, n)`,`if (x, y) in blocked`,`total += paths(x - 1, y)`],[`return paths(m, n)`,`if (blocked.has`,`total += paths(x - 1, y)`]),down:o(T,[`if (x, y) in blocked`,`total += paths(x - 1, y)`,`total += paths(x, y - 1)`],[`if (blocked.has`,`total += paths(x - 1, y)`,`total += paths(x, y - 1)`]),home:o(T,[`if x == 1 and y == 1`,`return 1`],[`if (x === 1 && y === 1)`]),puddle:o(T,[`if (x, y) in blocked`,`return 0`],[`if (blocked.has`]),done:o(T,[`return paths(m, n)`],[`return paths(m, n)`])},D=n({x:36,y:30,rows:f,cols:d,cell:54,gap:10}),O=([e,t])=>D(t-1,e-1),k=e=>r(O(e)),A=350,j=222,M=252,N={x:0,y:0,w:A,h:M},P={x:0,y:j,w:A,h:28};function F(e,...t){let n=[];for(let e=1;e<=d;e++)n.push({id:`col:${e}`,kind:`text`,rect:{x:O([e,1]).x,y:0,w:54,h:16},tone:`muted`,text:`x=${e}`});for(let e=1;e<=f;e++)n.push({id:`row:${e}`,kind:`text`,rect:{x:0,y:O([1,e]).y,w:32,h:54},tone:`muted`,text:`y=${e}`});for(let e=1;e<=f;e++)for(let t=1;t<=d;t++){let r=[t,e],i=_(r,m)?`집`:_(r,h)?`학교`:void 0;n.push({id:y(r),kind:`cell`,rect:O(r),tone:v(r)?`wall`:`plain`,...i?{tag:i}:{}})}return n.push({id:`calc`,kind:`text`,rect:e,text:``},...t),{width:A,height:M,items:n}}var I=e=>({type:`wait`,ms:e}),L=(e,t,n=!1)=>({type:`set`,id:y(e),patch:t,...n?{pop:n}:{}}),R=(e,t)=>L(e,{tone:t}),z=e=>({type:`set`,id:`calc`,patch:{text:e}}),B=(...e)=>({type:`focus`,ids:e.map(y)}),V=()=>l([{type:`clearMarks`},{type:`unfocus`}]),H=(e,t,n,r)=>({type:`arrow`,from:y(e),to:y(t),verdict:n,label:r}),U=e=>`${e}가지`,W=(e,t)=>v(e)?[`wall`,`웅덩이`]:t?[`good`,U(t)]:[`seen`,U(0)],G=20,K=2e3,q=e=>Math.max(0,...e.actions.map(t=>t.start+t.duration-e.start)),J=n=>{for(let r of n.steps){let{phases:n}=e(r);n.forEach((e,i)=>{let a=i<n.length-1?140:r.isKeyframe?t:320,o=[...r.phases[i].caption].length*G-a;e.end-e.start<o&&r.phases[i].actions.push(I(Math.ceil(o-q(e))))});let i=e(r),a=i.phases.at(-1),o=K-i.total;o>0&&r.phases.at(-1).actions.push(I(a.end-a.start+o-q(a)))}return n};function Y(){let e=new a(F(P)),t=Array.from({length:4},()=>[,,,,,,].fill(0));t[1][1]=1;let n,r,o=1,p=()=>({work:o,variables:{x:n?n.cell[0]:`-`,y:n?n.cell[1]:`-`,"dp[y - 1][x]":n?.up??`-`,"dp[y][x - 1]":n?.left??`-`,"dp[y][x]":n?.total??`-`}}),g=()=>r?[R(r,`visited`)]:[];e.step({title:`집 칸 dp[1][1] = 1로 시작`,codeHighlights:S.start,...p()}),e.phase(`시작`,`집 ${c(s(m),`은`,`는`)} 가만히 있어도 길이 1가지입니다.`),e.do(L(m,{text:`1`,tone:`visited`},!0)),e.phase(`규칙`,`나머지 칸은 위와 왼쪽의 길 수를 더해 채웁니다.`),e.do(z(`dp[y][x] = 위 + 왼쪽`));for(let a=1;a<=f;a++)for(let f=1;f<=d;f++){let d=[f,a];if(_(d,m))continue;let h=s(d);if(o++,v(d)){let o=g();r=void 0,t[a][f]=0,n={cell:d,up:`-`,left:`-`,total:0},e.step({title:`dp[${a}][${f}] = 0 (웅덩이)`,codeHighlights:S.zero,...p()}),e.phase(`웅덩이 확인`,`${c(h,`은`,`는`)} 웅덩이입니다. 이 칸으로 오는 길은 없습니다.`,S.check),e.do(...l([...o,B(d),z(`웅덩이 → 0`)])),e.phase(`0 채우기`,`${i(0)} 채우고 넘어갑니다.`,S.zero),e.do(L(d,{text:`0`},!0),{type:`unfocus`});continue}let y=[f,a-1],b=[f-1,a],x=[...a>1?[y]:[],...f>1?[b]:[]],C=t[a-1][f],w=t[a][f-1],T=(C+w)%u,E=g();t[a][f]=T,n={cell:d,up:C,left:w,total:T},r=d;let D=`위 ${C} + 왼쪽 ${w}`;e.step({title:`dp[${a}][${f}] = ${C} + ${w} = ${T}`,codeHighlights:S.add,...p()}),e.phase(`이웃 보기`,a===1?`${c(h,`은`,`는`)} 맨 윗줄이라 위쪽이 없습니다. 왼쪽에서 ${U(w)}가 옵니다.`:f===1?`${c(h,`은`,`는`)} 맨 왼쪽 줄이라 왼쪽이 없습니다. 위에서 ${U(C)}가 옵니다.`:`${h}에 오는 길은 위에서 ${U(C)}, 왼쪽에서 ${U(w)}입니다.`,S.look),e.do(...l([...E,R(d,`current`),B(d,...x),z(D)]));for(let t of x)e.do(H(d,t,...W(t,t===y?C:w)));e.phase(`더하기`,a===1?`왼쪽에서 오는 ${U(w)}가 그대로 길 수입니다.`:f===1?`위에서 오는 ${U(C)}가 그대로 길 수입니다.`:`더하면 ${C} + ${w} = ${U(T)}입니다.`,S.add),e.do(...l([L(d,{text:String(T)},!0),z(`${D} = ${T}`)]),I(300),...V())}let y=t[f][d],b=g();return e.step({title:`학교 칸 dp[${f}][${d}] = ${y}`,codeHighlights:S.done,...p(),answer:y,isKeyframe:!0}),e.phase(`답`,`학교 ${s(h)}에 모인 ${U(y)}가 답입니다. 칸 15개를 한 번씩만 계산했습니다.`),e.do(...l([...b,R(h,`path`),z(`답 = dp[${f}][${d}] = ${y}`)])),J(e.finish())}function X(){let e=new a(F(P)),t=Array.from({length:4},()=>[,,,,,,].fill(0));t[1][1]=1;let n,r,i=0,o=(e=!0)=>{let[r,a]=n??[0,0],o=(r,i,a)=>n&&e&&a?t[i][r]:`-`;return{work:i,variables:{x:n?r:`-`,y:n?a:`-`,"dp[y][x]":n?t[a][r]:`-`,"dp[y][x + 1]":o(r+1,a,r<d),"dp[y + 1][x]":o(r,a+1,a<f)}}},p=()=>r?[R(r,`visited`)]:[],g=e=>({...L(e,{text:String(t[e[1]][e[0]]),tone:`queued`},!0),together:!0}),y=[{label:`오른쪽으로 보내기`,where:`오른쪽`,outside:`오른쪽은`,at:w.right,no:w.rightNo},{label:`아래로 보내기`,where:`아래`,outside:`아래는`,at:w.down,no:w.downNo}],b=[];for(let e=1;e<=f;e++)for(let t=1;t<=d;t++)b.push([t,e]);e.step({title:`표를 0으로 채우고 집 칸에 1`,codeHighlights:w.start,...o()}),e.phase(`시작`,`표를 모두 0으로 두고 집 ${s(m)}에만 1을 적습니다.`),e.do(...l(b.map(e=>L(e,{text:_(e,m)?`1`:`0`},_(e,m))))),e.phase(`규칙`,`각 칸은 자기 길 수를 오른쪽과 아래 칸에 더해 줍니다.`),e.do(z(`이 칸의 값을 오른쪽·아래에 더한다`));for(let a of b){let[m,b]=a;i++;let x=s(a),S=p(),C=t[b][m];if(n=a,_(a,h))break;if(v(a)){r=void 0,e.step({title:`${c(x,`은`,`는`)} 웅덩이라 건너뜀`,codeHighlights:w.skip,...o(!1)}),e.phase(`웅덩이 건너뛰기`,`${c(x,`은`,`는`)} 웅덩이라 받지도 보내지도 않습니다.`,w.skip),e.do(...l([...S,B(a),z(`웅덩이 → 건너뜀`)]),I(300),{type:`unfocus`});continue}let T=[[m+1,b],[m,b+1]].map(e=>({t:e,outside:e[0]>d||e[1]>f})),E=T.map(({t:e,outside:t})=>!t&&!v(e)),D=T.filter((e,t)=>E[t]);for(let{t:e}of D)t[e[1]][e[0]]=(t[e[1]][e[0]]+C)%u;r=a;let O=D.length===2?`오른쪽·아래로`:m<d&&E[0]?`오른쪽으로`:`아래로`;e.step({title:D.length?`${x}의 ${U(C)}를 ${O} 보내기`:`${x}에서 보낼 곳 없음`,codeHighlights:w.down,...o()}),e.phase(`값 확인`,`${x}에 오는 길은 ${U(C)}로 다 모였습니다.`,w.check),e.do(...l([...S,R(a,`current`),B(a,...D.map(({t:e})=>e)),z(`dp[${b}][${m}] = ${C}`)])),y.forEach((n,r)=>{let{t:i,outside:o}=T[r];e.phase(n.label,o?`${n.outside} 표 바깥이라 보낼 곳이 없습니다.`:v(i)?`${n.where} ${c(s(i),`은`,`는`)} 웅덩이라 보내지 않습니다.`:`${n.where} ${s(i)}에 ${U(C)}를 더합니다.`,E[r]?n.at:n.no),o?e.do(I(300)):v(i)?e.do(H(a,i,`wall`,`웅덩이`),I(300)):e.do(H(a,i,`good`,`${C} 더함`),g(i),I(300),z(`${s(i)} = ${t[i[1]][i[0]]}`))}),e.do(...V())}let x=t[f][d],S=p();return n=h,e.step({title:`학교 칸 dp[${f}][${d}] = ${x}`,codeHighlights:w.done,...o(),answer:x,isKeyframe:!0}),e.phase(`답`,`길이 모두 학교 ${s(h)}에 모였습니다. 답은 ${U(x)}입니다.`),e.do(...l([...S,R(h,`path`),z(`답 = dp[${f}][${d}] = ${x}`)])),J(e.finish())}var Z={id:`ways`,kind:`token`,rect:{x:244,y:j,w:106,h:28},tone:`chosen`,text:`찾은 길 0개`},Q={x:0,y:j,w:236,h:28};function $(){let e=new a(F(Q,{id:`trail`,kind:`line`,rect:N,tone:`trail`,points:[]})),t=[],n=e=>{let[r,i]=e.at(-1);v([r,i])||r===1&&i===1?t.push(e):(r>1&&n([...e,[r-1,i]]),i>1&&n([...e,[r,i-1]]))};n([h]);let r=new Map,o=e=>r.get(g(e))??0,c=0,u=0,p=[],y=(e=p.at(-1))=>({work:c,variables:{"(x, y)":e?s(e):`-`,"부른 횟수":c,"찾은 길":u}}),b=e=>v(e)?`wall`:`explored`;e.step({title:`재귀 함수 paths(x, y) 정의`,codeHighlights:E.start,...y()}),e.phase(`시작`,`paths(x, y)는 집에서 (x, y)까지 오는 길의 수입니다.`),e.do(z(`paths(x, y) = 왼쪽 + 위`)),e.phase(`횟수 세기`,`메모가 없으니 칸마다 부른 횟수와, 찾은 길 수를 셉니다.`),e.do({type:`add`,item:Z}),t.forEach((n,a)=>{let m=a?n.findIndex((e,n)=>!_(e,t[a-1][n])):0,h=n.slice(m),x=p.slice(m),S=n[m-1];for(let e of h)r.set(g(e),o(e)+1);c+=h.length;let C=n.at(-1),w=!v(C);w&&u++,p=n;let T=h.reduce((e,t)=>o(t)>o(e)?t:e),D=o(T),O=D>1?`${s(T)} 칸은 벌써 ${D}번째 호출입니다.`:h.length>1?`모두 처음 부르는 칸입니다.`:`처음 부르는 칸입니다.`;e.step({title:`길 ${a+1}: ${w?`집에 닿음 → 1`:`웅덩이에 막힘 → 0`}`,codeHighlights:w?E.home:E.puddle,...y()}),e.phase(`내려가기`,a?`${i(s(S))} 돌아와 위쪽 칸을 부릅니다. ${O}`:`paths(${d}, ${f})부터 왼쪽 칸을 먼저 부르며 끝까지 내려갑니다. 칸 ${h.length}개를 처음 부릅니다.`,a?E.down:E.first),x.length&&e.do(...l([...x.map(e=>R(e,b(e))),R(S,`current`),{type:`set`,id:`trail`,patch:{points:n.slice(0,m).map(k)}},z(``)])),h.forEach((t,r)=>{let i=m+r;e.do(...l([...i?[R(n[i-1],`trail`)]:[],L(t,{tone:`current`,text:`${o(t)}번`},!0),{type:`set`,id:`trail`,patch:{points:n.slice(0,i+1).map(k)}}]))}),e.phase(`값 돌려주기`,w?`집에 닿았습니다. 1을 돌려주고 찾은 길은 ${u}개가 됩니다.`:`웅덩이에 막혔습니다. 0을 돌려줍니다.`,w?E.home:E.puddle),e.do(...l([R(C,w?`good`:`bad`),z(`paths(${C[0]}, ${C[1]}) → ${+!!w}`),...w?[{type:`set`,id:`ways`,patch:{text:`찾은 길 ${u}개`},pop:!0}]:[]]))});let x=p;p=[];let S=o(m),C=u;return e.step({title:`길 ${C}개 확정`,codeHighlights:E.done,...y(h),answer:C,isKeyframe:!0}),e.phase(`답 확인`,`paths를 ${c}번 불러서야 답 ${U(C)}가 나왔습니다. 집 ${s(m)}만 ${S}번이나 계산했습니다.`),e.do(...l([...x.map(e=>R(e,b(e))),{type:`set`,id:`trail`,patch:{points:[]}},R(m,`path`),{type:`set`,id:`ways`,patch:{tone:`path`}},z(`paths(${d}, ${f}) = ${C}`)])),e.phase(`최대 입력`,`100 × 100이면 호출이 10^58번이 넘어 끝나지 않습니다. 정석은 칸 15개면 충분합니다.`),e.do(I(300)),J(e.finish())}var ee={id:`way-to-school`,title:`등굣길`,level:3,category:`dp`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42898`,description:{summary:`집(왼쪽 위)에서 학교(오른쪽 아래)까지 오른쪽과 아래로만 움직이는 가장 짧은 길이 모두 몇 가지인지 구합니다. 비로 물이 찬 웅덩이 칸은 지나갈 수 없고, 답이 커질 수 있어 1,000,000,007로 나눈 나머지를 구합니다.`,rules:[`격자의 가로 칸 수 m과 세로 칸 수 n은 1 이상 100 이하의 자연수 (둘 다 1인 경우는 주어지지 않음)`,`웅덩이는 0개 이상 10개 이하이며, [x, y]는 x번째 열, y번째 행 (집은 (1, 1), 학교는 (m, n))`,`집과 학교는 웅덩이가 아님`,`오른쪽 또는 아래로만 이동 가능`],examples:[{input:`m = 4, n = 3, puddles = [[2, 2]]`,output:`4`}]},keyIntuitions:[`오른쪽과 아래로만 가면 어떤 길이든 최단 경로이므로, 가장 짧은 길을 찾는 것이 아니라 길의 가짓수만 세면 됩니다.`,`어떤 칸에 오는 길은 바로 위 칸에서 오는 길과 바로 왼쪽 칸에서 오는 길을 더한 것입니다. 웅덩이 칸은 0으로 둡니다.`,`왼쪽 위부터 차례로 표를 채우면 칸마다 한 번만 계산하고, 값이 커지므로 더할 때마다 1,000,000,007로 나눕니다.`],demo:{input:[d,f,p],label:`m = 5, n = 3, puddles = [[2, 2]]`},workUnit:`계산한 칸 수`,approaches:[{id:`school-pull`,name:`위·왼쪽을 더하는 표 채우기`,rank:`BEST`,timeComplexity:`O(m × n)`,spaceComplexity:`O(m × n)`,verdict:`칸마다 위와 왼쪽 값을 한 번 더해 m × n칸으로 끝나는 풀이입니다.`,pros:[`칸마다 한 번씩만 계산해 100 × 100이어도 1만 칸이면 끝납니다.`,`"위 + 왼쪽" 한 줄이 곧 점화식이라 코드가 짧습니다.`,`표 바깥 줄을 0으로 채워 두면 맨 윗줄과 맨 왼쪽 줄도 같은 식으로 처리됩니다.`],cons:[`웅덩이 칸을 0으로 되돌려 놓는 것을 잊으면 웅덩이를 지나는 길까지 세게 됩니다.`,`웅덩이 좌표는 [열, 행] 순서인데 표는 dp[행][열]로 쓰므로 순서를 뒤집어 쓰는 데 주의해야 합니다.`],whyThisRank:`왼쪽 위부터 채우면 필요한 값이 항상 먼저 계산되어 있습니다. 웅덩이는 0 하나로 처리되고 계산 횟수도 칸 수와 같아 가장 단순하고 안전합니다.`,code:b,visualize:Y},{id:`school-push`,name:`오른쪽·아래로 보내 주는 표 채우기`,rank:`ALTERNATIVE`,timeComplexity:`O(m × n)`,spaceComplexity:`O(m × n)`,verdict:`각 칸이 자기 길 수를 오른쪽과 아래 칸에 나눠 주는 풀이로, 비용은 같지만 확인할 조건이 더 많습니다.`,pros:[`"이 칸에서 갈 수 있는 곳"을 생각하는 방식이라 길을 따라가는 감각과 닮았습니다.`,`웅덩이로는 값을 보내지 않으면 되어 웅덩이 칸이 저절로 0으로 남습니다.`],cons:[`보낼 때마다 표 바깥인지, 받는 칸이 웅덩이인지 확인하는 조건이 두 번씩 필요합니다.`,`한 칸이 값을 두 번에 나눠 받아 계속 더해 가므로 표가 0으로 시작해야 하고, 빠뜨리기 쉽습니다.`],whyThisRank:`복잡도는 같지만 보내는 쪽에서 범위와 웅덩이를 일일이 검사해야 합니다. 받는 쪽에서 위와 왼쪽을 더하는 정석이 더 짧고 실수할 곳이 적습니다.`,code:C,visualize:X},{id:`school-recursion`,name:`메모 없는 재귀로 길 세기`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(2^(m + n))`,spaceComplexity:`O(m + n) 재귀 깊이`,verdict:`점화식을 메모 없이 재귀로 옮기면 같은 칸을 수없이 다시 계산해 100 × 100에서는 끝나지 않습니다.`,pros:[`점화식을 그대로 옮겨 이해하기 쉽습니다.`,`칸이 몇 개 안 되는 작은 격자에서는 정확한 답을 냅니다.`],cons:[`paths를 부르는 횟수가 길의 수에 비례해 늘어, 100 × 100이면 10^58번이 넘어 사실상 끝나지 않습니다.`,`같은 칸까지의 길 수를 부를 때마다 처음부터 다시 구합니다.`],whyThisRank:`같은 부분 문제가 반복된다는 DP의 신호입니다. 이 재귀에 메모(@lru_cache 등)만 붙여도 칸마다 한 번씩만 계산해 정석과 같은 O(m × n)이 됩니다.`,code:T,visualize:$}],checks:{cases:[{args:[4,3,[[2,2]]],expected:4},{args:[d,f,p],expected:7},{args:[1,5,[]],expected:1},{args:[5,1,[[3,1]]],expected:0},{args:[3,3,[]],expected:6},{args:[2,2,[[2,1],[1,2]]],expected:0},{args:[100,100,[]],expected:690285631}],random:e=>{let t=1+Math.floor(e()*6),n=1+Math.floor(e()*6),r=[];for(let e=1;e<=n;e++)for(let i=1;i<=t;i++)(i!==1||e!==1)&&(i!==t||e!==n)&&r.push([i,e]);let i=[];for(let t=Math.floor(e()*4);t>0&&r.length;t--)i.push(...r.splice(Math.floor(e()*r.length),1));return[t,n,i]}}};export{ee as default};