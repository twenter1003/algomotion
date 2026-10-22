import{n as e,t}from"./index-Cf02qAUa.js";import{c as n,i as r,l as i,r as a}from"./shared-CL29HWIp.js";var o=[[9,5,2,7],[9,3,5,7],[1,2,3,9]],s=o.length,c=4,l=o.map(e=>[...e]);for(let e=1;e<s;e++)for(let t=0;t<c;t++)l[e][t]+=Math.max(...l[e-1].filter((e,n)=>n!==t));var u=Math.max(...l[s-1]),d=[];for(let e=s-1,t=l[e].indexOf(u);e>=0;e--)d.unshift([e,t]),e&&(t=l[e-1].map((e,n)=>n===t?-1:e).reduce((e,t,n,r)=>t>r[e]?n:e,0));var f=[];for(let e=0,t=-1;e<s;e++){let n=-1;o[e].forEach((r,i)=>{i!==t&&(n<0||r>o[e][n])&&(n=i)}),f.push([e,n]),t=n}var p={python:`def solution(land):
    n = len(land)
    dp = [row[:] for row in land]  # dp[i][j] = i행 j열을 밟았을 때까지의 최대 점수 (원본을 지키려고 복사)

    for i in range(1, n):
        for j in range(4):
            # 같은 열을 뺀 윗줄 세 칸 중 가장 큰 값을 더합니다
            dp[i][j] += max(dp[i - 1][k] for k in range(4) if k != j)

    return max(dp[-1])`,javascript:`function solution(land) {
  const n = land.length;
  const dp = land.map((row) => [...row]); // dp[i][j] = i행 j열을 밟았을 때까지의 최대 점수 (원본을 지키려고 복사)

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < 4; j++) {
      // 같은 열을 뺀 윗줄 세 칸 중 가장 큰 값을 더합니다
      let best = 0;
      for (let k = 0; k < 4; k++) {
        if (k !== j) best = Math.max(best, dp[i - 1][k]);
      }
      dp[i][j] += best;
    }
  }

  return Math.max(...dp[n - 1]);
}`},m={start:r(p,[`n = len(land)`,`dp = [row[:]`],[`const n = land.length`,`const dp = land.map`]),look:r(p,[`for i in range(1, n)`,`for j in range(4)`,`dp[i][j] += max(`],[`for (let i = 1`,`for (let j = 0`,`let best = 0`,`for (let k = 0`,`if (k !== j)`]),add:r(p,[`dp[i][j] += max(`],[`dp[i][j] += best`]),done:r(p,[`return max(dp[-1])`],[`return Math.max(...dp[n - 1])`])},h={python:`def solution(land):
    n = len(land)
    dp = [row[:] for row in land]

    for i in range(1, n):
        prev = dp[i - 1]
        first = max(range(4), key=lambda c: prev[c])  # 윗줄에서 가장 큰 칸의 열
        second = max((c for c in range(4) if c != first), key=lambda c: prev[c])  # 두 번째로 큰 칸의 열
        for j in range(4):
            # 같은 열이 1등이면 2등을, 아니면 1등을 더합니다
            dp[i][j] += prev[second] if j == first else prev[first]

    return max(dp[-1])`,javascript:`function solution(land) {
  const n = land.length;
  const dp = land.map((row) => [...row]);

  for (let i = 1; i < n; i++) {
    const prev = dp[i - 1];
    let first = 0; // 윗줄에서 가장 큰 칸의 열
    for (let c = 1; c < 4; c++) if (prev[c] > prev[first]) first = c;
    let second = first === 0 ? 1 : 0; // 두 번째로 큰 칸의 열
    for (let c = 0; c < 4; c++) if (c !== first && prev[c] > prev[second]) second = c;
    for (let j = 0; j < 4; j++) {
      // 같은 열이 1등이면 2등을, 아니면 1등을 더합니다
      dp[i][j] += j === first ? prev[second] : prev[first];
    }
  }

  return Math.max(...dp[n - 1]);
}`},g={start:r(h,[`n = len(land)`,`dp = [row[:]`],[`const n = land.length`,`const dp = land.map`]),rank:r(h,[`for i in range(1, n)`,`prev = dp[i - 1]`,`first = max(range(4)`,`second = max((c for c`],[`for (let i = 1`,`const prev = dp[i - 1]`,`let first = 0`,`for (let c = 1`,`let second`,`for (let c = 0`]),pick:r(h,[`for j in range(4)`,`dp[i][j] += prev[second]`],[`for (let j = 0`,`dp[i][j] += j === first`]),add:r(h,[`dp[i][j] += prev[second]`],[`dp[i][j] += j === first`]),done:r(h,[`return max(dp[-1])`],[`return Math.max(...dp[n - 1])`])},_={python:`# 주의: 줄마다 가장 큰 칸만 고르는 풀이는 오답이 나옵니다
def solution(land):
    total = 0
    prev = -1  # 바로 윗줄에서 밟은 열 (처음에는 없음)

    for row in land:
        # 밟았던 열을 뺀 칸 중 가장 큰 칸을 고릅니다
        j = max((c for c in range(4) if c != prev), key=lambda c: row[c])
        total += row[j]
        prev = j

    return total`,javascript:`// 주의: 줄마다 가장 큰 칸만 고르는 풀이는 오답이 나옵니다
function solution(land) {
  let total = 0;
  let prev = -1; // 바로 윗줄에서 밟은 열 (처음에는 없음)

  for (const row of land) {
    // 밟았던 열을 뺀 칸 중 가장 큰 칸을 고릅니다
    let j = -1;
    for (let c = 0; c < 4; c++) {
      if (c !== prev && (j < 0 || row[c] > row[j])) j = c;
    }
    total += row[j];
    prev = j;
  }

  return total;
}`},v={start:r(_,[`total = 0`,`prev = -1`],[`let total = 0`,`let prev = -1`]),pick:r(_,[`for row in land`,`j = max((c for c`],[`for (const row of land)`,`let j = -1`,`for (let c = 0`,`if (c !== prev`]),step:r(_,[`total += row[j]`,`prev = j`],[`total += row[j]`,`prev = j`]),done:r(_,[`return total`],[`return total`])},y=46,b=32,x=66,S=(e,t)=>({x:y+t*x,y:b+e*x,w:54,h:54}),C=298,w=b+s*x-12+14,T=([e,t])=>`cell:${e},${t}`,E=e=>({type:`wait`,ms:e}),D=(e,t,n=!1)=>({type:`set`,id:T(e),patch:t,...n?{pop:n}:{}}),O=(e,t)=>D(e,{tone:t}),k=e=>({type:`set`,id:`calc`,patch:{text:e}}),A=(...e)=>({type:`focus`,ids:e.map(T)}),j=()=>n([{type:`clearMarks`},{type:`unfocus`}]),M=(e,t,n,r)=>({type:`arrow`,from:T(e),to:T(t),verdict:n,label:r}),N=e=>Array.from({length:c},(t,n)=>[e,n]),P=(e,t)=>N(e).filter(([,e])=>e!==t),F=20,I=2e3,L=e=>Math.max(0,...e.actions.map(t=>t.start+t.duration-e.start)),R=n=>{for(let r of n.steps){let{phases:n}=e(r);n.forEach((e,i)=>{let a=i<n.length-1?140:r.isKeyframe?t:320,o=[...r.phases[i].caption].length*F-a;e.end-e.start<o&&r.phases[i].actions.push(E(Math.ceil(o-L(e))))});let i=e(r),a=i.phases.at(-1),o=I-i.total;o>0&&r.phases.at(-1).actions.push(E(a.end-a.start+o-L(a)))}return n};function z(e,t,...n){let r=[];for(let e=0;e<c;e++)r.push({id:`col:${e}`,kind:`text`,rect:{x:S(0,e).x,y:0,w:54,h:16},tone:`muted`,text:`${e}열`});for(let e=0;e<s;e++){r.push({id:`row:${e}`,kind:`text`,rect:{x:0,y:S(e,0).y,w:40,h:54},tone:`muted`,text:`${e}행`});for(let t=0;t<c;t++)r.push({id:T([e,t]),kind:`cell`,rect:S(e,t),tone:`plain`,text:String(o[e][t])})}return r.push({id:`calc`,kind:`text`,rect:e,text:``},...n),{width:C,height:t,items:r}}var B={x:0,y:w,w:C,h:28},V=w+28,H=(e,t,n,[r,i])=>`원래 점수 ${e}에 ${a(t,`을`,`를`)} 더해 dp[${r}][${i}] = ${n}입니다.`,U=e=>({i:e?e.cell[0]:`-`,j:e?e.cell[1]:`-`,"land[i][j]":e?.orig??`-`,"윗줄 최댓값":e?.add??`-`,"dp[i][j]":e?.total??`-`}),W=`${d.map(([e,t])=>o[e][t]).join(` + `)} = ${u}`;function G(){let e=new i(z(B,V)),t=o.map(e=>[...e]),r,l,f=c,p=()=>({work:f,variables:U(r)}),h=()=>l?[O(l,`visited`)]:[];e.step({title:`0행은 점수 그대로`,codeHighlights:m.start,...p()}),e.phase(`시작`,`땅은 ${s}행 ${c}열입니다. 줄마다 한 칸씩 밟고, 바로 윗줄과 같은 열은 밟을 수 없습니다.`),e.do(k(`행·열 번호는 코드처럼 0부터`)),e.phase(`규칙`,`dp[i][j]는 i행 j열을 밟았을 때까지의 최대 점수입니다. 첫 줄은 점수가 곧 dp 값입니다.`),e.do(...n([...N(0).map(e=>O(e,`visited`)),k(`dp[i][j] = 점수 + 윗줄 다른 열의 최댓값`)]));for(let i=1;i<s;i++)for(let a=0;a<c;a++){let s=[i,a],c=P(i-1,a),u=c.map(([e,n])=>t[e][n]),d=Math.max(...u),g=h();r={cell:s,orig:o[i][a],add:d,total:o[i][a]+d},t[i][a]=r.total,l=s,f++;let _=`${r.orig} + max(${u.join(`, `)})`;e.step({title:`dp[${i}][${a}] = ${_} = ${r.total}`,codeHighlights:m.add,...p()}),e.phase(`윗줄 보기`,`${i}행 ${a}열의 윗줄에서 같은 열을 뺀 세 칸은 ${u.join(`, `)}입니다. 가장 큰 값은 ${d}입니다.`,m.look),e.do(...n([...g,O(s,`current`),A(s,...c),k(_)])),e.do(...c.map((e,t)=>M(s,e,u[t]===d?`good`:`seen`,String(u[t]))),E(300)),e.phase(`더하기`,H(r.orig,d,r.total,s),m.add),e.do(...n([D(s,{text:String(r.total),sub:`원래 ${r.orig}`},!0),k(`${_} = ${r.total}`)]),E(300),...j())}let g=h(),[_,v]=d.at(-1);return e.step({title:`답: 마지막 줄 최댓값 ${u}`,codeHighlights:m.done,...p(),answer:u,isKeyframe:!0}),e.phase(`답`,`마지막 줄에서 가장 큰 dp[${_}][${v}] = ${a(u,`이`,`가`)} 답입니다. 칸 ${f}개를 한 번씩만 계산했습니다.`),e.do(...n([...g,...d.map(e=>O(e,`path`)),k(W)])),R(e.finish())}function K(){let e=new i(z(B,V)),t=o.map(e=>[...e]),r,l=`-`,f=`-`,p=`-`,m,h=c,_=()=>({work:h,variables:{...U(r),i:r?r.cell[0]:l,first:f,second:p}}),v=()=>m?[O(m,`visited`)]:[],y=[],b=()=>y.map(e=>D(e,{tag:``,tone:`visited`}));e.step({title:`0행은 점수 그대로`,codeHighlights:g.start,..._()}),e.phase(`시작`,`땅은 ${s}행 ${c}열입니다. 줄마다 한 칸씩 밟고, 바로 윗줄과 같은 열은 밟을 수 없습니다.`),e.do(k(`행·열 번호는 코드처럼 0부터`)),e.phase(`규칙`,`같은 열만 못 밟으니, 윗줄에서 가장 큰 칸과 두 번째로 큰 칸만 알면 충분합니다.`),e.do(...n([...N(0).map(e=>O(e,`visited`)),k(`윗줄의 1등·2등만 기억`)]));for(let i=1;i<s;i++){let s=t[i-1],u=0;for(let e=1;e<c;e++)s[e]>s[u]&&(u=e);let d=+(u===0);for(let e=0;e<c;e++)e!==u&&s[e]>s[d]&&(d=e);let[x,S]=[[i-1,u],[i-1,d]],C=v();m=void 0,r=void 0,l=i,f=u,p=d,e.step({title:`${i-1}행의 1등 ${s[u]}, 2등 ${s[d]}`,codeHighlights:g.rank,..._()}),e.phase(`1·2등 찾기`,`${i-1}행(${s.join(`, `)})에서 가장 큰 두 칸을 찾습니다.`,g.rank),e.do(...n([...C,...b(),A(...N(i-1)),k(`${i-1}행: ${s.join(`, `)}`)])),y=[x,S],e.phase(`기억하기`,`1등은 ${u}열의 ${s[u]}, 2등은 ${d}열의 ${s[d]}입니다. 이 둘만 기억합니다.`,g.rank),e.do(...n([D(x,{tag:`1등`,tone:`chosen`}),D(S,{tag:`2등`,tone:`queued`}),k(`1등 ${s[u]} · 2등 ${s[d]}`)]),E(300),{type:`unfocus`});for(let l=0;l<c;l++){let c=[i,l],f=l!==u,p=f?x:S,y=f?s[u]:s[d],b=v();r={cell:c,orig:o[i][l],add:y,total:o[i][l]+y},t[i][l]=r.total,m=c,h++;let C=`${r.orig} + ${y}`;e.step({title:`dp[${i}][${l}] = ${C} = ${r.total}`,codeHighlights:g.add,..._()}),e.phase(`윗줄 고르기`,f?`${l}열은 1등의 열(${u})과 달라서 1등 ${a(y,`을`,`를`)} 씁니다.`:`${l}열은 1등과 같은 열이라 밟을 수 없어서 2등 ${a(y,`을`,`를`)} 씁니다.`,g.pick),e.do(...n([...b,O(c,`current`),A(c,p),k(C)])),e.do(M(c,p,`good`,f?`1등`:`2등`),E(300)),e.phase(`더하기`,H(r.orig,y,r.total,c),g.add),e.do(...n([D(c,{text:String(r.total),sub:`원래 ${r.orig}`},!0),k(`${C} = ${r.total}`)]),E(300),...j())}}let x=[...v(),...b()],[S,C]=d.at(-1);return e.step({title:`답: 마지막 줄 최댓값 ${u}`,codeHighlights:g.done,..._(),answer:u,isKeyframe:!0}),e.phase(`답`,`마지막 줄에서 가장 큰 dp[${S}][${C}] = ${a(u,`이`,`가`)} 답입니다. 칸마다 1등·2등만 보고 계산했습니다.`),e.do(...n([...x,...d.map(e=>O(e,`path`)),k(W)])),R(e.finish())}var q={id:`sum`,kind:`token`,rect:{x:178,y:w,w:120,h:28},tone:`chosen`,text:`합 0`},J=w+28+8,Y={x:0,y:w,w:170,h:28};function X(){let e=new i(z(Y,J+28,q)),t=0,r,c,l=()=>({work:r?r[0]+1:0,variables:{i:r?r[0]:`-`,"prev (밟은 열)":r?r[1]:-1,total:t}});e.step({title:`줄마다 가장 큰 칸 고르기`,codeHighlights:v.start,...l()}),e.phase(`시작`,`줄마다 밟을 수 있는 칸 중 가장 큰 칸을 고르면 답이 될까요? 이 방법으로 내려가 봅니다.`),e.do(k(`가장 큰 칸을 고른다`)),e.phase(`규칙`,`윗줄에서 밟은 열만 빼고, 줄마다 가장 큰 칸을 하나씩 고릅니다.`),e.do(k(`가장 큰 칸 · 다른 열`));for(let i=0;i<s;i++){let[,s]=f[i],u=i?f[i-1]:void 0,d=N(i).filter(([,e])=>e!==u?.[1]),p=o[i][s],m=c?[O(c,`chosen`)]:[];r=f[i],c=r,t+=p;let h=u?`${a(o[u[0]][u[1]],`을`,`를`)} 밟았으니 ${u[1]}열은 빼고, `:``;e.step({title:`${i}행: ${s}열의 ${p} 고르기`,codeHighlights:v.step,...l()}),e.phase(`고르기`,`${h}${i}행에서 가장 큰 칸은 ${s}열의 ${p}입니다.`,v.pick),e.do(...n([...m,A(...u?[u,[i,u[1]]]:[],...d),k(`max(${d.map(([e,t])=>o[e][t]).join(`, `)}) = ${p}`)])),u?e.do(M(u,[i,u[1]],`wall`,`같은 열`),...d.map(e=>M(u,e,e[1]===s?`good`:`seen`,String(o[e[0]][e[1]])))):e.do(E(500)),e.phase(`밟기`,`${s}열의 ${a(p,`을`,`를`)} 밟습니다. 점수 합은 ${a(t,`이`,`가`)} 됩니다.`,v.step),e.do(...n([O(r,`current`),{type:`set`,id:`sum`,patch:{text:`합 ${t}`},pop:!0},k(f.slice(0,i+1).map(([e,t])=>o[e][t]).join(` + `)+` = ${t}`)]),E(300),...j())}let p=c?[O(c,`chosen`)]:[];return e.step({title:`오답 확인: ${t}, 정답은 ${u}`,codeHighlights:v.done,...l(),answer:t,isKeyframe:!0}),e.phase(`오답 확인`,`가장 큰 칸만 따라가면 합은 ${t}입니다. 하지만 정답은 ${u}입니다.`),e.do(...n([...p,...f.map(e=>O(e,`bad`)),k(`내 답 = ${f.map(([e,t])=>o[e][t]).join(` + `)} = ${t}`)])),e.do({type:`add`,item:{id:`mine`,kind:`token`,rect:{x:y,y:J,w:110,h:28},tone:`bad`,text:`내 답 ${t}`}}),e.phase(`놓친 길`,`처음에 가장 큰 ${Math.max(...o[0])} 대신 ${a(o[d[0][0]][d[0][1]],`을`,`를`)} 밟고 내려가면 합 ${a(u,`을`,`를`)} 얻습니다.`),e.do(...n([...d.map(e=>O(e,`good`)),k(`정답 = ${W}`)])),e.do({type:`add`,item:{id:`truth`,kind:`token`,rect:{x:168,y:J,w:110,h:28},tone:`good`,text:`정답 ${u}`}},E(300)),R(e.finish())}var Z={id:`land-grab`,title:`땅따먹기`,level:2,category:`dp`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/12913`,description:{summary:`N행 4열의 땅이 있고 칸마다 점수가 적혀 있습니다. 첫 줄부터 마지막 줄까지 줄마다 한 칸씩 밟고 내려가되, 바로 윗줄에서 밟은 열은 밟을 수 없습니다. 얻을 수 있는 점수 합의 최댓값을 구합니다.`,rules:[`행의 수 N은 100,000 이하의 자연수이고 열은 항상 4개`,`칸의 점수는 100 이하의 자연수`,`줄마다 정확히 한 칸을 밟고, 같은 열을 연속된 두 줄에서 밟을 수 없음`],examples:[{input:`land = [[1, 2, 3, 5], [5, 6, 7, 8], [4, 3, 2, 1]]`,output:`16`}]},keyIntuitions:[`줄마다 가장 큰 칸만 고르면 다음 줄의 큰 칸을 놓칠 수 있습니다. 지금 큰 값이 끝까지 가장 큰 합으로 이어진다는 보장이 없습니다.`,`i행 j열을 밟았을 때까지의 최대 점수 dp[i][j]는 점수 + (윗줄에서 같은 열을 뺀 세 칸의 dp 최댓값)입니다. 윗줄의 dp만 알면 됩니다.`,`0행부터 마지막 줄까지 4칸씩 채우면 칸 수가 N × 4로 끝나고, 마지막 줄의 최댓값이 답입니다.`],demo:{input:[o],label:`land = [${o.map(e=>`[${e.join(`, `)}]`).join(`, `)}]`},workUnit:`점수를 정한 칸 수`,approaches:[{id:`land-row-max`,name:`윗줄 다른 열의 최댓값을 더하기`,rank:`BEST`,timeComplexity:`O(N × 4 × 3) = O(N)`,spaceComplexity:`O(N × 4), 원본에 누적하면 추가 O(1)`,verdict:`줄마다 칸의 최대 점수를 윗줄의 다른 열 세 칸에서 가장 큰 값으로 이어 붙여 내려가는 풀이입니다.`,pros:[`"같은 열만 빼고 최댓값"이라는 규칙이 코드 한 줄과 같아 틀리기 어렵습니다.`,`칸마다 한 번씩만 계산해 N = 100,000이어도 40만 칸이면 끝납니다.`,`열이 4개뿐이라 윗줄 세 칸을 매번 훑어도 부담이 없습니다.`],cons:[`원본 land를 그대로 쓰면 값이 바뀌므로 복사해서 쓰거나 바뀌어도 되는지 확인해야 합니다.`],whyThisRank:`윗줄의 dp 값만 있으면 다음 줄이 정해져서 상태가 단순합니다. 같은 열만 빼는 조건을 그대로 코드로 옮겨 가장 읽기 쉽고 안전합니다.`,code:p,visualize:G},{id:`land-top-two`,name:`윗줄의 1등·2등만 기억하기`,rank:`ALTERNATIVE`,timeComplexity:`O(N)`,spaceComplexity:`O(N × 4), 원본에 누적하면 추가 O(1)`,verdict:`윗줄에서 가장 큰 칸과 두 번째로 큰 칸만 찾아 두고 칸마다 골라 쓰지만, 코드가 길어지고 이 문제의 규칙에만 맞는 풀이입니다.`,pros:[`줄마다 윗줄을 한 번만 훑어 1등·2등을 구하면 칸마다 비교할 것이 없습니다.`,`열이 아주 많아지는 비슷한 문제로 넓히면 계산 횟수가 줄어듭니다.`],cons:[`"같은 열 하나만 못 밟는다"는 규칙에서만 맞습니다. 못 밟는 열이 둘로 늘면 3등까지 필요합니다.`,`1등과 2등의 열을 따로 기억하고 값이 같을 때(동점)도 챙겨야 해서 실수하기 쉽습니다.`],whyThisRank:`열이 4개뿐이라 줄여서 얻는 이득이 거의 없습니다. 코드는 길어지고 규칙이 바뀌면 쓸 수 없어서, 세 칸을 그대로 훑는 정석이 더 안전합니다.`,code:h,visualize:K},{id:`land-greedy`,name:`줄마다 가장 큰 칸만 고르기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(1)`,verdict:`줄마다 밟을 수 있는 가장 큰 칸을 고르면 빠르지만, 지금의 큰 값 때문에 다음 줄의 더 큰 값을 놓쳐 오답이 나옵니다.`,pros:[`코드가 짧고 빠르며 가장 먼저 떠오르는 방법입니다.`,`원문 입출력 예처럼 우연히 정답이 되는 경우도 있습니다.`],cons:[`시각화 입력에서 9, 7, 3을 밟아 19점이지만, 7, 9, 9를 밟으면 25점입니다.`,`지금 고른 칸이 다음 줄에서 막을 칸을 계산하지 않아, 앞선 선택을 되돌릴 방법이 없습니다.`],whyThisRank:`윗줄의 선택이 아랫줄에서 못 밟을 열을 정하므로 지금의 최선이 전체의 최선이 아닙니다. 줄마다 "각 열에서 끝나는 최대 점수"를 기억하는 DP가 정답입니다.`,code:_,visualize:X}],checks:{cases:[{args:[[[1,2,3,5],[5,6,7,8],[4,3,2,1]]],expected:16},{args:[o],expected:u},{args:[[[1,2,3,4]]],expected:4},{args:[[[4,1,1,1],[4,1,1,1]]],expected:5},{args:[[[1,1,1,1],[1,1,1,1],[1,1,1,1]]],expected:3},{args:[Array.from({length:1e5},()=>[100,100,100,100])],expected:1e7}],random:e=>[Array.from({length:1+Math.floor(e()*6)},()=>Array.from({length:4},()=>1+Math.floor(e()*9)))]}};export{Z as default};