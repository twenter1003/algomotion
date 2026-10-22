import{n as e,t}from"./index-Cf02qAUa.js";import{t as n}from"./layout-DFaYBMY_.js";import{c as r,i,l as a,r as o}from"./shared-CL29HWIp.js";var s=[[1,1,1,1],[1,0,1,1],[1,1,1,1],[1,1,1,1]],c=s.length,l=s[0].length,u=e=>{let t=s.map(e=>[...e]);for(let n=1;n<c;n++)for(let r=1;r<l;r++)t[n][r]===1&&(t[n][r]=Math.min(t[n-1][r],t[n][r-1],...e?[t[n-1][r-1]]:[])+1);return t},d=u(!0),f=u(!1),p=e=>e.flat().reduce((e,t)=>Math.max(e,t),0),m=e=>{let t=p(e);for(let n=0;n<c;n++)for(let r=0;r<l;r++)if(e[n][r]===t)return[n,r];return[0,0]},h={python:`def solution(board):
    rows, cols = len(board), len(board[0])
    dp = [row[:] for row in board]  # dp[i][j] = (i, j)를 오른쪽 아래 모서리로 하는 가장 큰 정사각형의 한 변
    best = max(max(row) for row in dp)  # 1이 하나라도 있으면 한 변 1

    for i in range(1, rows):
        for j in range(1, cols):
            if dp[i][j] == 1:
                # 위, 왼쪽, 왼쪽 위 중 가장 작은 정사각형에 1을 더합니다
                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
                best = max(best, dp[i][j])

    return best * best`,javascript:`function solution(board) {
  const rows = board.length;
  const cols = board[0].length;
  const dp = board.map((row) => [...row]); // dp[i][j] = (i, j)를 오른쪽 아래 모서리로 하는 가장 큰 정사각형의 한 변
  let best = 0;
  for (const row of dp) for (const v of row) best = Math.max(best, v); // 1이 하나라도 있으면 한 변 1

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (dp[i][j] === 1) {
        // 위, 왼쪽, 왼쪽 위 중 가장 작은 정사각형에 1을 더합니다
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
        best = Math.max(best, dp[i][j]);
      }
    }
  }

  return best * best;
}`},g={start:i(h,[`rows, cols = len(board)`,`dp = [row[:]`,`best = max(max(row)`],[`const rows`,`const cols`,`const dp = board.map`,`let best = 0`,`for (const row of dp)`]),look:i(h,[`for i in range(1, rows)`,`for j in range(1, cols)`,`if dp[i][j] == 1`,`dp[i][j] = min(`],[`for (let i = 1`,`for (let j = 1`,`if (dp[i][j] === 1)`,`dp[i][j] = Math.min(`]),add:i(h,[`dp[i][j] = min(`,`best = max(best, dp[i][j])`],[`dp[i][j] = Math.min(`,`best = Math.max(best, dp[i][j])`]),zero:i(h,[`for i in range(1, rows)`,`for j in range(1, cols)`,`if dp[i][j] == 1`],[`for (let i = 1`,`for (let j = 1`,`if (dp[i][j] === 1)`]),done:i(h,[`return best * best`],[`return best * best`])},_={python:`def solution(board):
    rows, cols = len(board), len(board[0])
    prev = board[0][:]  # 바로 윗줄의 dp 값 (두 줄만 기억합니다)
    best = max(max(row) for row in board)  # 1이 하나라도 있으면 한 변 1

    for i in range(1, rows):
        cur = board[i][:]  # 이번 줄의 dp 값
        for j in range(1, cols):
            if cur[j] == 1:
                cur[j] = min(prev[j], cur[j - 1], prev[j - 1]) + 1
                best = max(best, cur[j])
        prev = cur  # 지난 줄은 버립니다

    return best * best`,javascript:`function solution(board) {
  const rows = board.length;
  const cols = board[0].length;
  let prev = [...board[0]]; // 바로 윗줄의 dp 값 (두 줄만 기억합니다)
  let best = 0;
  for (const row of board) for (const v of row) best = Math.max(best, v); // 1이 하나라도 있으면 한 변 1

  for (let i = 1; i < rows; i++) {
    const cur = [...board[i]]; // 이번 줄의 dp 값
    for (let j = 1; j < cols; j++) {
      if (cur[j] === 1) {
        cur[j] = Math.min(prev[j], cur[j - 1], prev[j - 1]) + 1;
        best = Math.max(best, cur[j]);
      }
    }
    prev = cur; // 지난 줄은 버립니다
  }

  return best * best;
}`},v={start:i(_,[`rows, cols = len(board)`,`prev = board[0][:]`,`best = max(max(row)`],[`const rows`,`const cols`,`let prev = [...board[0]]`,`let best = 0`,`for (const row of board)`]),look:i(_,[`for i in range(1, rows)`,`cur = board[i][:]`,`for j in range(1, cols)`,`if cur[j] == 1`,`cur[j] = min(`],[`for (let i = 1`,`const cur = [...board[i]]`,`for (let j = 1`,`if (cur[j] === 1)`,`cur[j] = Math.min(`]),add:i(_,[`cur[j] = min(`,`best = max(best, cur[j])`],[`cur[j] = Math.min(`,`best = Math.max(best, cur[j])`]),zero:i(_,[`for i in range(1, rows)`,`cur = board[i][:]`,`for j in range(1, cols)`,`if cur[j] == 1`],[`for (let i = 1`,`const cur = [...board[i]]`,`for (let j = 1`,`if (cur[j] === 1)`]),drop:i(_,[`prev = cur`],[`prev = cur`]),done:i(_,[`return best * best`],[`return best * best`])},y={python:`# 주의: 왼쪽 위(대각선)를 빼먹어 구멍 난 정사각형도 인정하는 풀이입니다
def solution(board):
    rows, cols = len(board), len(board[0])
    dp = [row[:] for row in board]
    best = max(max(row) for row in dp)

    for i in range(1, rows):
        for j in range(1, cols):
            if dp[i][j] == 1:
                # 위와 왼쪽만 보고 대각선은 안 봅니다 → 구멍을 놓칩니다
                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + 1
                best = max(best, dp[i][j])

    return best * best`,javascript:`// 주의: 왼쪽 위(대각선)를 빼먹어 구멍 난 정사각형도 인정하는 풀이입니다
function solution(board) {
  const rows = board.length;
  const cols = board[0].length;
  const dp = board.map((row) => [...row]);
  let best = 0;
  for (const row of dp) for (const v of row) best = Math.max(best, v);

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (dp[i][j] === 1) {
        // 위와 왼쪽만 보고 대각선은 안 봅니다 → 구멍을 놓칩니다
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + 1;
        best = Math.max(best, dp[i][j]);
      }
    }
  }

  return best * best;
}`},b={start:i(y,[`rows, cols = len(board)`,`dp = [row[:]`,`best = max(max(row)`],[`const rows`,`const cols`,`const dp = board.map`,`let best = 0`,`for (const row of dp)`]),look:i(y,[`for i in range(1, rows)`,`for j in range(1, cols)`,`if dp[i][j] == 1`,`dp[i][j] = min(`],[`for (let i = 1`,`for (let j = 1`,`if (dp[i][j] === 1)`,`dp[i][j] = Math.min(`]),add:i(y,[`dp[i][j] = min(`,`best = max(best, dp[i][j])`],[`dp[i][j] = Math.min(`,`best = Math.max(best, dp[i][j])`]),zero:i(y,[`for i in range(1, rows)`,`for j in range(1, cols)`,`if dp[i][j] == 1`],[`for (let i = 1`,`for (let j = 1`,`if (dp[i][j] === 1)`]),done:i(y,[`return best * best`],[`return best * best`])},x=40,S=28,C=66,w=(e,t)=>({x:x+t*C,y:S+e*C,w:54,h:54}),T=x+l*C-12+8,E=S+c*C-12+16,D=E+28,O=([e,t])=>`cell:${e},${t}`,k=e=>({type:`wait`,ms:e}),A=(e,t,n=!1)=>({type:`set`,id:O(e),patch:t,...n?{pop:n}:{}}),j=(e,t)=>A(e,{tone:t}),M=e=>({type:`set`,id:`calc`,patch:{text:e}}),N=e=>({type:`set`,id:`best`,patch:{text:`가장 큰 변 ${e}`},pop:!0}),P=(...e)=>({type:`focus`,ids:e.map(O)}),F=()=>r([{type:`clearMarks`},{type:`unfocus`}]),I=(e,t,n,r)=>({type:`arrow`,from:O(e),to:O(t),verdict:n,label:r}),L=([e,t],r)=>{let[i,a]=[w(e-r+1,t-r+1),w(e,t)];return{id:`ring`,kind:`ring`,rect:n({x:i.x,y:i.y,w:a.x+a.w-i.x,h:a.y+a.h-i.y},5)}},R=([e,t],n)=>Array.from({length:n*n},(r,i)=>[e-n+1+Math.floor(i/n),t-n+1+i%n]),z=20,B=2e3,V=e=>Math.max(0,...e.actions.map(t=>t.start+t.duration-e.start)),H=n=>{for(let r of n.steps){let{phases:n}=e(r);n.forEach((e,i)=>{let a=i<n.length-1?140:r.isKeyframe?t:320,o=[...r.phases[i].caption].length*z-a;e.end-e.start<o&&r.phases[i].actions.push(k(Math.ceil(o-V(e))))});let i=e(r),a=i.phases.at(-1),o=B-i.total;o>0&&r.phases.at(-1).actions.push(k(a.end-a.start+o-V(a)))}return n},U={id:`best`,kind:`token`,rect:{x:T-128,y:E,w:120,h:28},tone:`chosen`,text:`가장 큰 변 1`};function W(e,...t){let n=[];for(let e=0;e<l;e++)n.push({id:`col:${e}`,kind:`text`,rect:{x:w(0,e).x,y:0,w:54,h:16},tone:`muted`,text:`${e}열`});for(let e=0;e<c;e++){n.push({id:`row:${e}`,kind:`text`,rect:{x:0,y:w(e,0).y,w:34,h:54},tone:`muted`,text:`${e}행`});for(let t=0;t<l;t++)n.push({id:O([e,t]),kind:`cell`,rect:w(e,t),tone:s[e][t]?`plain`:`wall`,text:String(s[e][t])})}return n.push({id:`calc`,kind:`text`,rect:{x:0,y:E,w:T-136,h:28},text:``},U,...t),{width:T,height:e,items:n}}var G=`첫 줄과 첫 열은 칸 값 그대로입니다.`,K=()=>Array.from({length:(c-1)*(l-1)},(e,t)=>[1+Math.floor(t/(l-1)),1+t%(l-1)]);function q(e){let t=e.dp===f,n=new a(W(t?D+36:D)),i=D+4,u=s.map(e=>[...e]),h,g,_=1,v=0,y=new Set,b=()=>({work:v,variables:{i:h?h.cell[0]:`-`,j:h?h.cell[1]:`-`,[e.names.up]:h?.up??`-`,[e.names.left]:h?.left??`-`,...e.diagonal?{[e.names.diag]:h?.diag??`-`}:{},[e.names.value]:h?.value??`-`,best:_}}),S=()=>g?[j(g,y.has(O(g))?`bad`:`visited`)]:[],C=e=>Array.from({length:l},(t,n)=>[e,n]);n.step({title:`첫 줄과 첫 열은 그대로`,codeHighlights:e.at.start,...b()}),n.phase(`시작`,`0과 1로 된 ${c} × ${l} 표에서 1로만 이루어진 가장 큰 정사각형의 넓이를 구합니다.`),n.do(M(`1로만 된 가장 큰 정사각형`)),n.phase(`규칙`,e.intro),n.do(...r([...C(0).map(e=>j(e,s[0][e[1]]?`visited`:`wall`)),...Array.from({length:c-1},(e,t)=>[t+1,0]).map(e=>j(e,s[e[0]][0]?`visited`:`wall`)),M(e.introCalc)]));for(let t of K()){let[i,a]=t,c=S(),d=`(${i}, ${a})`,f=a===l-1;if(!s[i][a]){g=void 0,h={cell:t,up:u[i-1][a],left:u[i][a-1],diag:e.diagonal?u[i-1][a-1]:`-`,value:0},v++,n.step({title:`dp[${i}][${a}] = 0 (칸이 0)`,codeHighlights:e.at.zero,...b()}),n.phase(`칸 확인`,`${o(d,`은`,`는`)} 0이라 정사각형의 모서리가 될 수 없습니다.`,e.at.zero),n.do(...r([...c,P(t),M(`${d} = 0`)])),n.phase(`그대로 두기`,`${o(`dp[${i}][${a}]`,`은`,`는`)} 0 그대로입니다.`,e.at.zero),n.do(k(300),{type:`unfocus`}),e.rows===`drop`&&f&&w(i);continue}let p=u[i-1][a],m=u[i][a-1],x=u[i-1][a-1],C=e.diagonal?[p,m,x]:[p,m],T=Math.min(...C),E=e.dp[i][a],D=Math.min(p,m,x)+1,L=_;u[i][a]=E,h={cell:t,up:p,left:m,diag:e.diagonal?x:`-`,value:E},g=t,v++,_=Math.max(_,E);let R=E!==D;R&&y.add(O(t));let z=e.diagonal?[[i-1,a],[i,a-1],[i-1,a-1]]:[[i-1,a],[i,a-1]],B=`min(${C.join(`, `)})`;n.step({title:`dp[${i}][${a}] = ${B} + 1 = ${E}`,codeHighlights:e.at.add,...b()}),n.phase(e.diagonal?`세 칸 보기`:`두 칸 보기`,e.diagonal?`${d}의 위는 ${p}, 왼쪽은 ${m}, 왼쪽 위는 ${x}입니다. 가장 작은 값은 ${T}입니다.`:`${d}의 위는 ${p}, 왼쪽은 ${m}입니다. 두 값 중 작은 값은 ${T}입니다.`,e.at.look),n.do(...r([...c,j(t,`current`),P(t,...z),M(B)])),n.do(...z.map((e,n)=>I(t,e,C[n]===T?`good`:`seen`,String(C[n]))),k(300)),n.phase(`더하기`,`가장 작은 값 ${T}에 1을 더해 dp[${i}][${a}] = ${E}입니다.`,e.at.add),n.do(...r([A(t,{text:String(E)},!0),..._>L?[N(_)]:[],M(`${B} + 1 = ${E}`)]),k(300),...F()),R&&(n.phase(`놓친 칸`,`왼쪽 위 (${i-1}, ${a-1})의 ${o(x,`을`,`를`)} 안 봐서 ${o(E,`이`,`가`)} 됐습니다. 대각선까지 보면 ${D}입니다.`,e.at.add),n.do(I(t,[i-1,a-1],`bad`,`안 봄 ${x}`),...r([j(t,`bad`)],!0),k(300),...F())),e.rows===`drop`&&f&&w(i)}function w(t){t<1||!e.dropAt||(n.phase(`지난 줄 버리기`,`${t}행을 다 계산했으니 ${t-1}행의 값은 더 쓰지 않아 버립니다. 이제 ${t}행만 기억합니다.`,e.dropAt),n.do(...r([...C(t-1).map(e=>A(e,{text:``,tone:`muted`})),M(`${t-1}행은 버림`)])))}let[T,E]=m(u),z=p(u),B=S();if(n.step({title:`답: 변 ${z} → 넓이 ${z*z}`,codeHighlights:e.at.done,...b(),answer:z*z,isKeyframe:!0}),n.phase(`답`,e.answerCaption(z)),t){let e=p(d),[t,a]=m(d);n.do(...r([...B,{type:`add`,item:L([T,E],z)},M(`내 답 = ${z} × ${z} = ${z*z}`)])),n.do({type:`add`,item:{id:`mine`,kind:`token`,rect:{x,y:i,w:110,h:28},tone:`bad`,text:`내 답 ${z*z}`}}),n.phase(`놓친 구멍`,`이 정사각형 안에 0이 있습니다. 진짜로 1만 있는 가장 큰 정사각형은 ${e} × ${e} = ${e*e}입니다.`),n.do(...r([...R([t,a],e).map(e=>j(e,`good`)),M(`정답 = ${e} × ${e} = ${e*e}`)])),n.do({type:`add`,item:{id:`truth`,kind:`token`,rect:{x:162,y:i,w:110,h:28},tone:`good`,text:`정답 ${e*e}`}},k(300))}else e.rows===`keep`?n.do(...r([...B,...R([T,E],z).map(e=>j(e,`path`)),{type:`add`,item:L([T,E],z)},M(`${z} × ${z} = ${z*z}`)])):n.do(...r([...B,{type:`set`,id:`best`,patch:{tone:`path`}},M(`${z} × ${z} = ${z*z}`)]));return H(n.finish())}var J={id:`largest-square`,title:`가장 큰 정사각형 찾기`,level:2,category:`dp`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/12905`,description:{summary:`0과 1로만 이루어진 표에서 1로만 채워진 가장 큰 정사각형을 찾아 그 넓이를 구합니다. 정사각형의 변은 표의 가로, 세로와 나란해야 합니다.`,rules:[`표의 행과 열의 크기는 각각 1,000 이하의 자연수`,`표의 값은 0 또는 1`,`1로만 이루어진 정사각형 중 가장 큰 것의 넓이를 return`],examples:[{input:`board = [[0, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [0, 0, 1, 0]]`,output:`9`},{input:`board = [[0, 0, 1, 1], [1, 1, 1, 1]]`,output:`4`}]},keyIntuitions:[`칸마다 "이 칸을 오른쪽 아래 모서리로 하는 가장 큰 정사각형의 한 변"을 dp[i][j]로 두면, 모든 정사각형을 직접 확인하지 않아도 됩니다.`,`칸이 1이면 dp[i][j] = min(위, 왼쪽, 왼쪽 위) + 1입니다. 세 방향의 정사각형이 모두 자라야 이 칸까지 한 칸 더 큰 정사각형이 되므로 가장 작은 값을 고릅니다.`,`왼쪽 위(대각선)까지 봐야 합니다. 위와 왼쪽만 보면 대각선에 있는 0 하나가 만드는 구멍을 놓쳐 정사각형이 실제보다 크게 나옵니다.`],demo:{input:[s],label:`board = [${s.map(e=>`[${e.join(`, `)}]`).join(`, `)}]`},workUnit:`계산한 칸 수`,approaches:[{id:`square-min-plus-one`,name:`위·왼쪽·왼쪽 위의 최솟값 + 1`,rank:`BEST`,timeComplexity:`O(행 × 열)`,spaceComplexity:`O(행 × 열), 원본에 덮어쓰면 추가 O(1)`,verdict:`칸마다 위, 왼쪽, 왼쪽 위 세 칸 중 가장 작은 값에 1을 더하는 한 줄로 가장 큰 정사각형의 변을 구하는 풀이입니다.`,pros:[`모든 정사각형을 확인하지 않고 칸마다 세 칸만 보므로 1,000 × 1,000도 100만 칸이면 끝납니다.`,`"가장 작은 값 + 1"이라는 식 하나가 곧 점화식이라 코드가 짧습니다.`,`지나간 칸만 쓰므로 왼쪽 위부터 차례로 채우면 필요한 값이 이미 계산되어 있습니다.`],cons:[`왼쪽 위(대각선)를 빼먹으면 구멍이 있는 정사각형을 인정하는 오답이 나옵니다.`,`첫 줄과 첫 열은 윗줄·왼쪽이 없어 따로 두거나 한 칸 더 큰 표를 써야 합니다.`],whyThisRank:`세 방향 중 가장 작은 값이 이 칸까지 이어질 수 있는 정사각형의 크기를 정하기 때문에 식이 간단하고 틀리기 어렵습니다. 모든 칸을 한 번씩만 보므로 효율도 충분합니다.`,code:h,visualize:()=>q({names:{up:`dp[i - 1][j]`,left:`dp[i][j - 1]`,diag:`dp[i - 1][j - 1]`,value:`dp[i][j]`},at:g,dp:d,diagonal:!0,rows:`keep`,intro:`dp[i][j]는 (i, j)를 오른쪽 아래 모서리로 하는 가장 큰 정사각형의 한 변입니다. ${G}`,introCalc:`min(세 칸) + 1`,answerCaption:e=>`가장 큰 dp 값은 ${e}이므로 변이 ${e}인 정사각형, 넓이는 ${e} × ${e} = ${e*e}입니다.`})},{id:`square-two-rows`,name:`윗줄과 이번 줄, 두 줄만 기억하는 표 채우기`,rank:`ALTERNATIVE`,timeComplexity:`O(행 × 열)`,spaceComplexity:`O(열)`,verdict:`같은 식을 쓰되 바로 윗줄과 이번 줄만 남겨 메모리를 줄이지만, 줄을 바꿔 쓰는 코드가 늘어나는 풀이입니다.`,pros:[`표 전체 대신 두 줄만 기억해 메모리가 O(열)로 줄어듭니다.`,`가장 큰 변을 best 하나로 따로 기억하므로 지난 줄이 없어도 답을 구할 수 있습니다.`],cons:[`줄이 끝날 때 prev = cur로 바꿔 끼우는 것을 잊거나 같은 배열을 가리키게 하면 값이 꼬입니다.`,`지난 줄을 버리므로 어떤 정사각형이었는지 되짚어 볼 수 없고 중간 값을 확인하기 어렵습니다.`],whyThisRank:`1,000 × 1,000 표도 100만 칸 정도라 표 전체를 두는 메모리가 문제되지 않습니다. 아낄 것이 거의 없는데 코드가 복잡해져서, 표 전체에 쓰는 정석이 더 안전합니다.`,code:_,visualize:()=>q({names:{up:`prev[j]`,left:`cur[j - 1]`,diag:`prev[j - 1]`,value:`cur[j]`},at:{...v},dp:d,diagonal:!0,rows:`drop`,dropAt:v.drop,intro:`윗줄 prev와 이번 줄 cur, 두 줄만 기억합니다. ${G}`,introCalc:`min(세 칸) + 1`,answerCaption:e=>`가장 큰 변은 best로 따로 기억해 둔 ${e}입니다. 넓이는 ${e} × ${e} = ${e*e}입니다.`})},{id:`square-no-diagonal`,name:`위와 왼쪽만 보는 min + 1`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(행 × 열)`,spaceComplexity:`O(행 × 열)`,verdict:`위와 왼쪽만 보고 왼쪽 위(대각선)를 빼먹으면 대각선의 0이 만드는 구멍을 놓쳐 정사각형이 실제보다 크게 나옵니다.`,pros:[`정석과 코드가 거의 같고 가장 작은 값을 고른다는 발상도 같아 맞아 보입니다.`,`구멍이 없는 표(예: 원문 입출력 예)에서는 정답이 나오기도 합니다.`],cons:[`시각화 입력은 (1, 1) 하나만 0인 4 × 4인데, 대각선을 안 봐서 정사각형의 변을 4로 보고 16이라고 답합니다(정답은 4).`,`위와 왼쪽의 정사각형이 아무리 커도, 대각선 쪽에 0이 있으면 그 칸을 모서리로 하는 정사각형은 자랄 수 없습니다.`],whyThisRank:`정사각형이 한 칸 커지려면 위, 왼쪽, 왼쪽 위의 정사각형이 모두 이전 크기 이상이어야 하는데, 한 방향을 빼서 조건 하나를 잃었습니다. 세 값의 최솟값을 쓰면 정답입니다.`,code:y,visualize:()=>q({names:{up:`dp[i - 1][j]`,left:`dp[i][j - 1]`,diag:`dp[i - 1][j - 1]`,value:`dp[i][j]`},at:b,dp:f,diagonal:!1,rows:`keep`,intro:`이 풀이는 위와 왼쪽만 봅니다. ${G}`,introCalc:`min(위, 왼쪽) + 1`,answerCaption:e=>`가장 큰 dp 값은 ${e}이므로 변이 ${e}인 정사각형, 넓이는 ${e} × ${e} = ${e*e}이라고 답합니다.`})}],checks:{cases:[{args:[[[0,1,1,1],[1,1,1,1],[1,1,1,1],[0,0,1,0]]],expected:9},{args:[[[0,0,1,1],[1,1,1,1]]],expected:4},{args:[s],expected:4},{args:[[[0]]],expected:0},{args:[[[1]]],expected:1},{args:[[[1,1,1]]],expected:1},{args:[[[0,0],[0,0]]],expected:0},{args:[[[1,1,1],[1,1,1],[1,1,1]]],expected:9},{args:[[[1,1,1],[1,0,1],[1,1,1]]],expected:1},{args:[Array.from({length:1e3},()=>Array(1e3).fill(1))],expected:1e6}],random:e=>{let[t,n]=[1+Math.floor(e()*6),1+Math.floor(e()*6)];return[Array.from({length:t},()=>Array.from({length:n},()=>+(e()<.7)))]}}};export{J as default};