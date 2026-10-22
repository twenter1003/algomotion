import{c as e,i as t,r as n}from"./shared-CL29HWIp.js";import{t as r}from"./paced-B_ytx4sn.js";var i=24566525,a=[...String(i)].reverse().map(Number),o=a.length,s=o+1,c=[`일`,`십`,`백`,`천`,`만`,`십만`,`백만`,`천만`,`억`],l=e=>10**e,u=e=>e.toLocaleString(`en-US`),d=e=>e===1/0?`∞`:String(e),f={python:`def solution(storey):
    answer = 0
    while storey > 0:
        digit = storey % 10                  # 일의 자리 숫자
        storey //= 10                        # 한 자리 위로 올라간다
        if digit > 5 or (digit == 5 and storey % 10 >= 5):   # 5는 한 자리 위를 보고 정한다
            answer += 10 - digit             # 올림: +버튼을 (10 - 숫자)번
            storey += 1                      # 윗자리에 1을 넘긴다
        else:
            answer += digit                  # 내림: -버튼을 숫자만큼
    return answer`,javascript:`function solution(storey) {
  let answer = 0;
  while (storey > 0) {
    const digit = storey % 10; // 일의 자리 숫자
    storey = Math.floor(storey / 10); // 한 자리 위로 올라간다
    if (digit > 5 || (digit === 5 && storey % 10 >= 5)) { // 5는 한 자리 위를 보고 정한다
      answer += 10 - digit; // 올림: +버튼을 (10 - 숫자)번
      storey += 1; // 윗자리에 1을 넘긴다
    } else {
      answer += digit; // 내림: -버튼을 숫자만큼
    }
  }
  return answer;
}`},p={init:t(f,[`answer = 0`],[`let answer = 0`]),look:t(f,[`while storey > 0`,`digit = storey % 10`,`storey //= 10`,`if digit > 5 or (digit == 5`],[`while (storey > 0)`,`const digit = storey % 10`,`storey = Math.floor(storey / 10)`,`if (digit > 5 || (digit === 5`]),up:t(f,[`answer += 10 - digit`,`storey += 1`],[`answer += 10 - digit`,`storey += 1`]),down:t(f,[`else:`,`answer += digit`],[`} else {`,`answer += digit`]),done:t(f,[`while storey > 0`,`return answer`],[`while (storey > 0)`,`return answer`])},m={python:`def solution(storey):
    down, up = 0, float('inf')           # 아래 자리에서 올림이 없을 때 / 올라왔을 때의 최소 누른 횟수
    for ch in reversed(str(storey)):     # 일의 자리부터
        d = int(ch)
        new_down = min(down + d, up + d + 1)             # 내림: 올림이 올라왔으면 이 자리 값은 d + 1
        new_up = min(down + 10 - d, up + 10 - (d + 1))   # 올림: 윗자리에 1을 넘긴다
        down, up = new_down, new_up
    return min(down, up + 1)             # 맨 위에 올림이 남았으면 + 1층 버튼 한 번`,javascript:`function solution(storey) {
  let down = 0; // 아래 자리에서 올림이 없을 때의 최소 누른 횟수
  let up = Infinity; // 올림이 올라왔을 때의 최소 누른 횟수
  for (const ch of [...String(storey)].reverse()) { // 일의 자리부터
    const d = Number(ch);
    const newDown = Math.min(down + d, up + d + 1); // 내림: 올림이 올라왔으면 이 자리 값은 d + 1
    const newUp = Math.min(down + 10 - d, up + 10 - (d + 1)); // 올림: 윗자리에 1을 넘긴다
    down = newDown;
    up = newUp;
  }
  return Math.min(down, up + 1); // 맨 위에 올림이 남았으면 + 1층 버튼 한 번
}`},h={init:t(m,[`down, up = 0, float('inf')`],[`let down = 0`,`let up = Infinity`]),calc:t(m,[`for ch in reversed(str(storey))`,`d = int(ch)`,`new_down = min`,`new_up = min`],[`for (const ch of [...String(storey)].reverse())`,`const d = Number(ch)`,`const newDown = Math.min`,`const newUp = Math.min`]),write:t(m,[`down, up = new_down, new_up`],[`down = newDown`,`up = newUp`]),done:t(m,[`return min(down, up + 1)`],[`return Math.min(down, up + 1)`])},g={python:`def solution(storey):
    answer = 0
    while storey > 0:
        digit = storey % 10
        storey //= 10
        if digit >= 5:                       # 5도 무조건 올린다 (한 자리 위를 보지 않는다)
            answer += 10 - digit
            storey += 1
        else:
            answer += digit
    return answer  # 25는 7번 (정답) 대신 8번`,javascript:`function solution(storey) {
  let answer = 0;
  while (storey > 0) {
    const digit = storey % 10;
    storey = Math.floor(storey / 10);
    if (digit >= 5) { // 5도 무조건 올린다 (한 자리 위를 보지 않는다)
      answer += 10 - digit;
      storey += 1;
    } else {
      answer += digit;
    }
  }
  return answer; // 25는 7번 (정답) 대신 8번
}`},_={init:t(g,[`answer = 0`],[`let answer = 0`]),look:t(g,[`while storey > 0`,`digit = storey % 10`,`storey //= 10`,`if digit >= 5`],[`while (storey > 0)`,`const digit = storey % 10`,`storey = Math.floor(storey / 10)`,`if (digit >= 5)`]),up:t(g,[`answer += 10 - digit`,`storey += 1`],[`answer += 10 - digit`,`storey += 1`]),down:t(g,[`else:`,`answer += digit`],[`} else {`,`answer += digit`]),done:t(g,[`while storey > 0`,`return answer`],[`while (storey > 0)`,`return answer`])},v=70,y=54,b=48,x=e=>v+(s-1-e)*y,S=30,C=v+s*y+50,w=e=>`d:${e}`,T=e=>({type:`wait`,ms:e}),E=(...t)=>e([{type:`unfocus`},{type:`clearMarks`},...t]),D=e=>({x:v,y:e===`dp`?224:172,w:160,h:28}),O=()=>({x:240,y:172,w:160,h:28}),k=(e,t=`chosen`,n=`누른 횟수 ${e}`)=>({type:`set`,id:`tok:ans`,patch:{text:n,tone:t},pop:!0}),A=(e,t,n=[])=>Array.from({length:s},(r,i)=>{if(i<e)return{type:`set`,id:w(i),patch:{text:`0`,tone:`visited`}};let a=Math.floor(t/l(i-e)),o=a===0;return{type:`set`,id:w(i),patch:{text:o?``:String(a%10),tone:o?`explored`:n.includes(i)?`current`:`plain`}}});function j(e){let t=[{id:`lab:floor`,kind:`text`,rect:{x:0,y:S,w:64,h:b},text:`층`}];if(e===`lane`)t.push({id:`lab:btn`,kind:`text`,rect:{x:0,y:122,w:64,h:28},text:`누른 횟수`});else{t.push({id:`lab:down`,kind:`text`,rect:{x:0,y:118,w:64,h:40},text:`올림 없음`},{id:`lab:up`,kind:`text`,rect:{x:0,y:166,w:64,h:40},text:`올림 있음`});for(let e=0;e<o;e++)t.push({id:`dn:${e}`,kind:`cell`,rect:{x:x(e),y:118,w:b,h:40},tone:`explored`,text:``},{id:`upc:${e}`,kind:`cell`,rect:{x:x(e),y:166,w:b,h:40},tone:`explored`,text:``})}t.push({id:`tok:ans`,kind:`token`,rect:D(e),tone:`plain`,text:e===`dp`?`최소 횟수 -`:`누른 횟수 0`});for(let e=0;e<s;e++){let n=e<o?String(a[e]):``;t.push({id:w(e),kind:`cell`,rect:{x:x(e),y:S,w:b,h:b},tone:e<o?`plain`:`explored`,text:n},{id:`pl:${e}`,kind:`text`,rect:{x:x(e),y:84,w:b,h:16},tone:`muted`,text:c[e]})}return{width:C,height:e===`dp`?262:208,items:t}}function M(t){let a=new r(j(`lane`)),o=t?p:_,[s,d,f,m]=[i,0,0,0],h=0,g=[],v=()=>({work:f,variables:{digit:h||`-`,storey:s,answer:d}});a.step({title:`answer = 0`,codeHighlights:o.init,...v()}),a.phase(`시작`,t?`일의 자리부터 한 자리씩 0으로 만듭니다. 숫자가 작으면 −버튼을 숫자만큼, 크면 +버튼을 (10 − 숫자)번 눌러 윗자리에 1을 넘깁니다.`:`일의 자리부터 한 자리씩 0으로 만듭니다. 숫자가 5 이상이면 +버튼으로 올리고, 아니면 −버튼으로 내립니다.`),a.do(k(0));for(let r=0;s>0;r++){let i=s%10,p=Math.floor(s/10),_=p%10,y=i===5,b=t?i>5||y&&_>=5:i>=5,S=b?10-i:i,C=u(s*l(r));[h,s,m]=[i,b?p+1:p,r+1],d+=S,f++;let D=`${b?`+`:`-`}${u(l(r))}`,O=u(s*l(r+1));a.step({title:`${c[r]}의 자리 ${i}: ${b?`올림`:`내림`}, ${S}번`,codeHighlights:b?o.up:o.down,...v()}),a.phase(`살피기`,t?y?`${c[r]}의 자리 ${i}는 딱 5입니다. 한 자리 위의 ${n(_,`이`,`가`)} ${_>=5?`5 이상이라 올리는 쪽이 이득입니다`:`5보다 작아 내리는 쪽이 이득입니다`}.`:`${c[r]}의 자리 ${n(i,`은`,`는`)} 5보다 ${i>5?`커서 올립니다`:`작아서 내립니다`}.`:`${c[r]}의 자리 ${n(i,`은`,`는`)} 5 ${i>=5?`이상이라 올립니다`:`미만이라 내립니다`}.${y?` 한 자리 위는 보지 않습니다.`:``}`,o.look),a.do(...e([{type:`focus`,ids:y&&t?[w(r),w(r+1)]:[w(r)]},{type:`set`,id:w(r),patch:{tone:`current`}}])),y&&t?a.do({type:`arrow`,from:w(r),to:w(r+1),verdict:_>=5?`good`:`bad`,label:_>=5?`${_} ≥ 5 올림`:`${_} < 5 내림`},T(450)):a.do(T(450)),a.phase(`누르기`,`${D}층 버튼을 ${S}번 눌러 ${c[r]}의 자리를 0으로 만들${b?`고 윗자리에 1을 넘깁니다`:`니다`}. 층은 ${C}에서 ${n(O,`이`,`가`)} 됩니다.`.replace(`만들니다`,`만듭니다`),b?o.up:o.down),a.do(...E()),S?(g.push(`p:${r}`),a.do(...e([{type:`add`,item:{id:`p:${r}`,kind:`token`,rect:{x:x(r)+4,y:122,w:40,h:28},tone:b?`chosen`:`visited`,text:`${b?`+`:`-`}${S}`},from:w(r)},...A(m,s),k(d)]))):a.do(...e([...A(m,s),k(d)]))}return h=0,a.step({title:`누른 횟수 ${d}번`,codeHighlights:o.done,...v(),answer:d,isKeyframe:!0}),t?(a.phase(`정답`,`층이 0이 됐습니다. 버튼을 모두 ${d}번 눌렀고 자릿수만큼만 반복했습니다. 딱 5인 자리는 한 자리 위를 보고 더 적게 누르는 쪽을 골랐습니다.`),a.do(...e([...g.map(e=>({type:`set`,id:e,patch:{tone:`path`}})),k(d,`path`)]))):(a.phase(`오답 확인`,`5를 무조건 올렸더니 ${d}번입니다. 한 자리 위가 5보다 작은 5는 내리는 쪽이 더 적게 누르므로 정답은 ${N}번입니다.`),a.do(...e([k(d,`bad`,`이 방법 ${d}번`),{type:`add`,item:{id:`tok:truth`,kind:`token`,rect:O(),tone:`good`,text:`정답 ${N}번`}}]))),a.finish()}var N=(()=>{let[e,t]=[i,0];for(;e>0;){let n=e%10;e=Math.floor(e/10),n>5||n===5&&e%10>=5?[t,e]=[t+10-n,e+1]:t+=n}return t})();function P(){let t=new r(j(`dp`)),[n,i,s]=[0,1/0,0],l=0,u=()=>({work:s,variables:{d:l||`-`,down:d(n),up:d(i)}});t.step({title:`down = 0, up = ∞`,codeHighlights:h.init,...u()}),t.phase(`시작`,`올림이 없을 때(down)와 올림이 올라왔을 때(up)의 최소 횟수를 자리마다 구합니다. 처음엔 down = 0, up = ∞입니다.`),t.do(k(0,`plain`,`최소 횟수 -`)),a.forEach((r,a)=>{let[o,f]=[n,i],p=Math.min(o+r,f+r+1),m=Math.min(o+10-r,f+10-(r+1));l=r,s+=4,[n,i]=[p,m],t.step({title:`${c[a]}의 자리 ${r}: down ${d(p)}, up ${d(m)}`,codeHighlights:h.write,...u()}),t.phase(`후보 계산`,`내림 min(${d(o)} + ${r}, ${d(f)} + ${r+1}) = ${d(p)}, 올림 min(${d(o)} + ${10-r}, ${d(f)} + ${9-r}) = ${d(m)}.`,h.calc);let g=a?[`dn:${a-1}`,`upc:${a-1}`]:[];t.do(...e([{type:`focus`,ids:[w(a),...g]},{type:`set`,id:w(a),patch:{tone:`current`}}]),T(500)),t.phase(`표에 쓰기`,`${c[a]}의 자리 칸에 down = ${d(p)}, up = ${d(m)}를 적습니다.`,h.write),t.do(...E({type:`set`,id:`dn:${a}`,patch:{text:d(p),tone:`visited`},pop:!0},{type:`set`,id:`upc:${a}`,patch:{text:d(m),tone:`chosen`},pop:!0},{type:`set`,id:w(a),patch:{tone:`visited`}}))}),l=0;let f=Math.min(n,i+1);return t.step({title:`최소 ${f}번`,codeHighlights:h.done,...u(),answer:f,isKeyframe:!0}),t.phase(`정답`,`맨 위에 올림이 남았다면 +1층 버튼을 한 번 더 눌러야 하니 min(${n}, ${d(i)} + 1) = ${f}번입니다. 자릿수마다 두 값만 갱신하므로 계산은 ${s}번입니다.`),t.do(...e([{type:`set`,id:`dn:${o-1}`,patch:{tone:`path`}},k(f,`path`,`최소 횟수 ${f}`)])),t.finish()}var F={id:`magic-elevator`,title:`마법의 엘리베이터`,level:2,category:`greedy`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/148653`,description:{summary:`마법의 엘리베이터에는 절댓값이 10의 거듭제곱(1, 10, 100, …)인 정수가 적힌 버튼이 있고, 누를 때마다 그 값만큼 층이 바뀝니다. 0층보다 낮아지는 버튼은 눌러도 움직이지 않습니다. 버튼을 한 번 누를 때마다 마법의 돌이 1개 듭니다. storey층에서 0층으로 가는 데 필요한 돌의 최소 개수를 구합니다.`,rules:[`1 ≤ storey ≤ 100,000,000`,`버튼의 값은 ±1, ±10, ±100, … (10의 거듭제곱)`,`0층보다 낮은 층으로는 갈 수 없음`],examples:[{input:`storey = 16`,output:`6`},{input:`storey = 2554`,output:`16`}]},keyIntuitions:[`큰 버튼 하나로 여러 자리를 한꺼번에 움직일 수 없으니, 자리마다 따로 0으로 만들어야 합니다. 일의 자리부터 보면 윗자리와 겹치지 않습니다.`,`한 자리 숫자 d는 −버튼을 d번(내림) 누르거나, +버튼을 (10 − d)번 누르고 윗자리에 1을 넘기는(올림) 두 방법뿐입니다. 5보다 크면 올림, 작으면 내림이 이득입니다.`,`딱 5일 때는 올림과 내림이 이 자리에서는 같지만, 올림은 윗자리를 1 키웁니다. 윗자리가 5 이상이면 올려서 이어서 올림이 되고, 5보다 작으면 내리는 편이 이득이라 한 자리 위를 보고 정해야 합니다.`],demo:{input:[i],label:`storey = 24566525`},workUnit:`자리에서 값을 계산한 횟수`,approaches:[{id:`magic-elevator-round`,name:`자릿수 반올림 (5는 윗자리를 보고)`,rank:`BEST`,timeComplexity:`O(log storey)`,spaceComplexity:`O(1)`,verdict:`일의 자리부터 한 자리씩 올림이나 내림 중 적게 누르는 쪽을 고르고, 5일 때만 한 자리 위를 보는 풀이입니다.`,pros:[`자릿수(최대 9번)만큼만 반복하므로 storey가 1억이어도 순식간입니다.`,`추가 메모리가 필요 없고 코드가 짧습니다.`,`자리마다 "올릴까 내릴까"만 정하면 되어 이해하기 쉽습니다.`],cons:[`딱 5일 때 한 자리 위를 봐야 한다는 점을 놓치기 쉽습니다.`,`올림으로 윗자리가 9에서 10이 되는 경우처럼 올림이 연달아 올라오는 것도 storey += 1로 한 번에 처리됩니다. 눈으로 확인하기 어려운 부분입니다.`],whyThisRank:`한 자리를 0으로 만드는 방법은 내림(d번)과 올림(10 − d번)뿐이고, 윗자리에 주는 영향은 올림이 +1입니다. 5를 넘으면 올림이 거의 항상 이득이고, 딱 5일 때만 윗자리가 올림을 더 이어 갈지가 결과를 가릅니다.`,code:f,visualize:()=>M(!0)},{id:`magic-elevator-dp`,name:`자릿수 DP (올림 여부를 상태로)`,rank:`ALTERNATIVE`,timeComplexity:`O(log storey)`,spaceComplexity:`O(1)`,verdict:`자리마다 "아래에서 올림이 올라왔는지"를 상태로 두고, 두 상태의 최소 횟수를 갱신하는 맞지만 더 무거운 풀이입니다.`,pros:[`5일 때 윗자리를 보는 예외 규칙 없이 모든 경우를 따져 봅니다.`,`자릿수만큼만 반복하므로 느리지 않습니다.`],cons:[`자리마다 후보를 네 개 계산해, 정석의 한 번보다 계산이 많고 식도 길어집니다.`,`올림이 올라오면 이 자리 값이 d + 1이 되는 것을 식마다 챙겨야 합니다.`],whyThisRank:`정석의 "5는 윗자리를 본다"는 규칙은 사실 이 DP가 매번 하는 비교를 줄여 쓴 것입니다. 규칙을 모를 때 안전하게 쓸 수 있지만, 알고 나면 정석이 더 짧고 빠릅니다.`,code:m,visualize:P},{id:`magic-elevator-half-up`,name:`5 이상은 무조건 올림`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(log storey)`,spaceComplexity:`O(1)`,verdict:`자리 숫자가 5 이상이면 올리고 아니면 내리는 풀이로, 딱 5일 때 한 자리 위를 보지 않아 틀립니다.`,pros:[`코드가 가장 짧고 반올림 규칙 그대로여서 자연스럽습니다.`,`공식 예제 두 개는 우연히 통과합니다.`],cons:[`딱 5인 자리의 윗자리가 5보다 작을 때는 내리는 쪽이 더 적게 누르는데, 그것을 놓칩니다.`,`storey = 25이면 정답은 7번(5번 내리고 2번 내림)인데 8번이 나옵니다.`],whyThisRank:`올림은 윗자리를 1 키우므로 딱 5일 때는 윗자리가 어떤지에 따라 이득이 달라집니다. 일의 자리만 보고 올리면 윗자리 비용이 늘어 전체가 손해가 될 수 있습니다.`,code:g,visualize:()=>M(!1)}],checks:{cases:[{args:[16],expected:6},{args:[2554],expected:16},{args:[1],expected:1},{args:[5],expected:5},{args:[6],expected:5},{args:[25],expected:7},{args:[55],expected:10},{args:[95],expected:6},{args:[1e8],expected:1},{args:[99999999],expected:2},{args:[i],expected:29}],random:e=>{let t=1+Math.floor(e()*5);return[Number(Array.from({length:t},(t,n)=>n===0?1+Math.floor(e()*9):Math.floor(e()*10)).join(``))]}}};export{F as default};