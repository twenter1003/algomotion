import{i as e}from"./layout-DFaYBMY_.js";import{a as t,c as n,i as r,l as i,r as a}from"./shared-CL29HWIp.js";import{t as o}from"./lane-BzDhdR3X.js";var s=`(()(())))(`,c=10,l=(()=>{let e=0;for(let t=0;t<c;t++)if(e+=s[t]===`(`?1:-1,e<0)return t;throw Error(`시각화 입력은 중간에 0 아래로 내려가야 합니다`)})(),u=e=>[...s.slice(0,e+1)].filter(e=>e===`(`).length,d={python:`def solution(s):
    count = 0  # 아직 닫히지 않은 여는 괄호 수

    for ch in s:
        if ch == '(':
            count += 1
        else:
            count -= 1
            if count < 0:  # 짝이 없는 닫는 괄호
                return False

    return count == 0  # 모두 짝이 맞아야 올바른 괄호`,javascript:`function solution(s) {
  let count = 0; // 아직 닫히지 않은 여는 괄호 수

  for (const ch of s) {
    if (ch === '(') {
      count++;
    } else {
      count--;
      if (count < 0) return false; // 짝이 없는 닫는 괄호
    }
  }

  return count === 0; // 모두 짝이 맞아야 올바른 괄호
}`},f={start:r(d,[`count = 0`],[`let count = 0`]),read:r(d,[`for ch in s`,`if ch == '('`],[`for (const ch of s)`,`if (ch === '(')`]),open:r(d,[`if ch == '('`,`count += 1`],[`if (ch === '(')`,`count++`]),close:r(d,[`else:`,`count -= 1`],[`} else {`,`count--`]),check:r(d,[`if count < 0`],[`if (count < 0)`]),fail:r(d,[`if count < 0`,`return False`],[`if (count < 0) return false`])},p={python:`def solution(s):
    stack = []

    for ch in s:
        if ch == '(':
            stack.append(ch)  # 여는 괄호는 쌓아 두고
        else:
            if not stack:  # 짝지을 '('가 없는 닫는 괄호
                return False
            stack.pop()  # 가장 가까운 '('와 짝짓기

    return not stack  # 남은 '('가 없어야 올바른 괄호`,javascript:`function solution(s) {
  const stack = [];

  for (const ch of s) {
    if (ch === '(') {
      stack.push(ch); // 여는 괄호는 쌓아 두고
    } else {
      if (stack.length === 0) return false; // 짝지을 '('가 없는 닫는 괄호
      stack.pop(); // 가장 가까운 '('와 짝짓기
    }
  }

  return stack.length === 0; // 남은 '('가 없어야 올바른 괄호
}`},m={start:r(p,[`stack = []`],[`const stack = []`]),read:r(p,[`for ch in s`,`if ch == '('`],[`for (const ch of s)`,`if (ch === '(')`]),push:r(p,[`stack.append(ch)`],[`stack.push(ch)`]),check:r(p,[`else:`,`if not stack`],[`} else {`,`if (stack.length === 0)`]),fail:r(p,[`if not stack`,`return False`],[`if (stack.length === 0) return false`]),pop:r(p,[`stack.pop()`],[`stack.pop()`])},h={python:`def solution(s):
    opens = closes = 0

    for ch in s:
        if ch == '(':
            opens += 1
        else:
            closes += 1

    return opens == closes  # 개수만 같으면 올바르다고 착각 (")("도 True)`,javascript:`function solution(s) {
  let opens = 0;
  let closes = 0;

  for (const ch of s) {
    if (ch === '(') opens++;
    else closes++;
  }

  return opens === closes; // 개수만 같으면 올바르다고 착각 (")("도 true)
}`},g={start:r(h,[`opens = closes = 0`],[`let opens = 0`,`let closes = 0`]),read:r(h,[`for ch in s`,`if ch == '('`],[`for (const ch of s)`,`if (ch === '(')`]),open:r(h,[`if ch == '('`,`opens += 1`],[`if (ch === '(')`,`opens++`]),close:r(h,[`else:`,`closes += 1`],[`else closes++`]),result:r(h,[`return opens == closes`],[`return opens === closes`])},_=54,v=72,y=e({x:v,y:0,rows:1,cols:c,cell:_,gap:8}),b=698,x=116,S=198,C=560,w=e=>({x:e-_/2,y:x,w:_,h:_}),T=w(316),E=w(440),D=w(278),O=w(478),k=e=>`ch:${e}`,A=e=>`tok:${e}`,j={id:`stack`,x:v,y:120,slotW:_,slotH:46,gap:8,max:6},M=(e,t,n)=>({id:e,kind:`text`,rect:{x:t.x-20,y:t.y+t.h+4,w:t.w+40,h:20},text:n}),N=(e,t,n,r)=>({id:e,kind:`cell`,rect:t,tone:r,text:n}),P=(e,t,n,r,i=34)=>({id:e,kind:`token`,rect:{x:C,y:t,w:130,h:i},tone:r,text:n});function F(){let e=[{id:`row:s`,kind:`text`,rect:{x:0,y:0,w:64,h:_},text:`문자열`}];return[...s].forEach((t,n)=>e.push({id:k(n),kind:`cell`,rect:y(0,n),tone:`plain`,text:t,tag:String(n+1)})),{width:b,height:S,items:e}}var I=e=>({type:`wait`,ms:e}),L=(e,t,n={})=>({type:`set`,id:e,patch:{tone:t,...n}}),R=()=>n([{type:`unfocus`},{type:`clearMarks`}]),z=e=>e===`(`?`여는`:`닫는`,B=e=>`[${e.map(()=>`'('`).join(`, `)}]`,V=(e,t=[])=>n([{type:`focus`,ids:[k(e),...t]},L(k(e),`current`)]);function H(){let e=new i(F()),t=0,r=0,o=`-`,c=()=>({work:r,workNote:`기억하는 것: 숫자 1개`,variables:{ch:o,count:t}}),u=e=>e<0?`bad`:e===0?`visited`:`queued`;e.step({title:`count를 0으로 시작하기`,codeHighlights:f.start,...c()}),e.phase(`시작`,`열린 괄호를 세는 count를 0으로 두고 문자열을 앞에서부터 한 글자씩 읽습니다. count가 0 아래로 내려가면 바로 틀린 괄호입니다.`),e.do(...n([{type:`add`,item:N(`count`,T,`0`,`visited`)},{type:`add`,item:N(`floor`,E,`0`,`plain`)},{type:`add`,item:M(`count:label`,T,`count`)},{type:`add`,item:M(`floor:label`,E,`기준`)}]),I(900));for(let i=0;i<=l;i++){let d=s[i],p=d===`(`;t+=p?1:-1,r++,o=`'${d}'`;let m=i===l;e.step({title:`${i+1}번째 '${d}' → count ${t}${m?`, false`:``}`,codeHighlights:m?f.fail:p?f.open:f.check,...c(),...m?{answer:!1,isKeyframe:!0}:{}}),e.phase(`읽기`,`${i+1}번째 글자는 ${z(d)} 괄호 '${d}'입니다.`,f.read),e.do(...V(i,[`count`]),I(300)),e.phase(`세기`,p?`닫아야 할 괄호가 하나 늘었으니 count를 1 올립니다. count = ${t}.`:`괄호 하나가 닫혔으니 count를 1 내립니다. count = ${t}.`,p?f.open:f.close),e.do({type:`arrow`,from:k(i),to:`count`,verdict:p?`new`:`good`,label:p?`+1`:`-1`}),e.do({...L(`count`,u(t),{text:String(t)}),pop:!0},I(250)),p?e.do(...n([L(k(i),`visited`),...R()])):(e.phase(`확인`,m?`count가 ${t}${a(t,`이`,`가`).slice(String(t).length)} 되어 0 아래로 내려갔습니다. 짝이 없는 ')'가 나왔으니 바로 false를 돌려줍니다.`:`count = ${a(t,`은`,`는`)} 0 이상이라 아직 짝이 맞습니다.`,m?f.fail:f.check),e.do({type:`focus`,ids:[`count`,`floor`]}),e.do({type:`arrow`,from:`count`,to:`floor`,verdict:m?`bad`:`good`,label:`${t} ${m?`<`:`≥`} 0`},I(250)),m?(e.do(...n([L(k(i),`bad`),{type:`add`,item:P(`result`,126,`정답 false`,`path`)}]),I(300)),e.do(...R())):e.do(...n([L(k(i),`visited`),...R()])))}return e.finish()}function U(){let e=new i(F()),t=new o(e,j),r=[],a=0,c=`-`,u=0,d=()=>({work:a,workNote:`기억하는 것: '(' 최대 ${u}개`,variables:{ch:c,stack:B(r)}});e.step({title:`빈 스택으로 시작하기`,codeHighlights:m.start,...d()}),e.phase(`시작`,`빈 스택을 준비하고 한 글자씩 읽습니다. '('는 쌓아 두고 ')'가 나오면 맨 위 '('와 짝지어 꺼냅니다.`),e.do(...n([{type:`add`,item:{id:`stack:label`,kind:`text`,rect:{x:0,y:x,w:64,h:_},text:`스택`}},{type:`add`,item:{id:`stack:bg`,kind:`zone`,rect:{x:68,y:x,w:372,h:_}}}]),I(900));for(let i=0;i<=l;i++){let o=s[i],f=o===`(`;a++,c=`'${o}'`;let p=i===l,h=r.at(-1);if(f)r.push(i),u=Math.max(u,r.length),e.step({title:`${i+1}번째 '(' → 스택에 쌓기`,codeHighlights:m.push,...d()}),e.phase(`읽기`,`${i+1}번째 글자는 여는 괄호 '('입니다.`,m.read),e.do(...V(i),I(300)),e.phase(`넣기`,`여는 괄호는 짝을 기다려야 하니 스택에 쌓습니다. 스택 크기 = ${r.length}.`,m.push),t.push({id:A(i),text:`(`},k(i)),e.do(...n([L(k(i),`queued`),...R()],!0),I(300));else{if(h!==void 0&&r.pop(),e.step({title:h===void 0?`${i+1}번째 ')' → 스택이 비어 false`:`${i+1}번째 ')' → 맨 위 '('와 짝짓기`,codeHighlights:h===void 0?m.fail:m.pop,...d(),...p?{answer:!1,isKeyframe:!0}:{}}),e.phase(`읽기`,`${i+1}번째 글자는 닫는 괄호 ')'입니다.`,m.read),e.do(...V(i,h===void 0?[]:[k(h)]),I(300)),e.phase(`확인`,h===void 0?`스택이 비어 있어 이 ')'와 짝지을 '('가 없습니다. 바로 false를 돌려줍니다.`:`스택 맨 위에 ${h+1}번째 '('가 있어 이 ')'와 짝지을 수 있습니다.`,h===void 0?m.fail:m.check),h===void 0){e.do({type:`arrow`,from:k(i),to:`stack:bg`,verdict:`bad`,label:`비어 있음`},I(250)),e.do(...n([L(k(i),`bad`),{type:`add`,item:P(`result`,122,`정답 false`,`path`)}]),I(300)),e.do(...R());break}e.do({type:`arrow`,from:k(i),to:A(h),verdict:`good`,label:`짝 있음`},I(250)),e.phase(`꺼내기`,`맨 위 '('를 꺼내 이 ')'와 짝짓습니다. 스택 크기 = ${r.length}.`,m.pop),t.pop(k(i)),e.do(...n([L(k(h),`visited`),L(k(i),`visited`),...R()],!0),I(250))}}return e.finish()}function W(){let e=new i(F()),r=0,a=0,o=0,d=`-`,f=()=>({work:o,variables:{ch:d,opens:r,closes:a}});e.step({title:`opens와 closes를 0으로 시작하기`,codeHighlights:g.start,...f()}),e.phase(`시작`,`'('를 세는 opens와 ')'를 세는 closes를 0으로 두고, 순서는 보지 않고 개수만 셉니다.`),e.do(...n([{type:`add`,item:N(`opens`,D,`0`,`plain`)},{type:`add`,item:N(`closes`,O,`0`,`plain`)},{type:`add`,item:M(`opens:label`,D,`opens`)},{type:`add`,item:M(`closes:label`,O,`closes`)}]),I(900));for(let t=0;t<c;t++){let i=s[t],c=i===`(`;c?r++:a++,o++,d=`'${i}'`;let[l,u]=c?[`opens`,r]:[`closes`,a];e.step({title:`${t+1}번째 '${i}' → ${l} ${u}`,codeHighlights:c?g.open:g.close,...f()}),e.phase(`읽기`,`${t+1}번째 글자는 ${z(i)} 괄호 '${i}'입니다.`,g.read),e.do(...V(t,[l]),I(300)),e.phase(`세기`,`${z(i)} 괄호라 ${l}를 1 올립니다. ${l} = ${u}.`,c?g.open:g.close),e.do({type:`arrow`,from:k(t),to:l,verdict:`new`,label:`+1`}),e.do({...L(l,`queued`,{text:String(u)}),pop:!0},I(250)),e.do(...n([L(k(t),`visited`),...R()]))}let p=r===a,m=u(l);return e.step({title:`개수 ${r} = ${a} → ${p} (정답은 ${!p})`,codeHighlights:g.result,...f(),answer:p,isKeyframe:!0}),e.phase(`비교하기`,`opens = ${r}, closes = ${t(a)} 개수가 같으니 true를 돌려줍니다.`),e.do({type:`focus`,ids:[`opens`,`closes`]}),e.do({type:`arrow`,from:`opens`,to:`closes`,verdict:`good`,label:`${r} = ${a}`},I(250)),e.do(...n([{type:`add`,item:P(`result`,x,`이 풀이 true`,`chosen`,26)},...R()]),I(300)),e.phase(`오답 확인`,`하지만 ${l+1}번째 글자까지 읽었을 때 ')'가 ${l+1-m}개, '('가 ${m}개라 닫을 짝이 없었습니다. 정답은 false입니다.`),e.do(...n([L(k(l),`bad`,{sub:`짝 없음`}),L(`result`,`bad`),{type:`add`,item:P(`truth`,144,`정답 false`,`good`,26)}])),e.finish()}var G={id:`valid-parentheses`,title:`올바른 괄호`,level:2,category:`stack-queue`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/12909`,description:{summary:`'('와 ')'로만 이루어진 문자열이 주어집니다. '('로 열었으면 그 뒤에 짝이 되는 ')'로 닫혀야 올바른 괄호입니다. 문자열이 올바른 괄호이면 true, 아니면 false를 돌려줍니다.`,rules:[`문자열 s의 길이는 100,000 이하의 자연수`,`s는 '(' 또는 ')' 로만 이루어져 있음`,`()()나 (())()는 올바른 괄호이고, )()(나 (()(는 올바르지 않은 괄호`],examples:[{input:`s = "()()"`,output:`true`},{input:`s = "(())()"`,output:`true`},{input:`s = ")()("`,output:`false`},{input:`s = "(()("`,output:`false`}]},keyIntuitions:[`'('는 +1, ')'는 -1로 보고 앞에서부터 더해 가면, 괄호가 짝이 맞는지를 숫자 하나로 따라갈 수 있습니다.`,`중간에 합이 0 아래로 내려가면 짝 없는 ')'가 나온 것이라 그 자리에서 바로 틀린 괄호입니다. 개수가 같다고 올바른 괄호는 아닙니다(예: ')(').`,`끝까지 읽었을 때 합이 정확히 0이어야 열린 괄호가 모두 닫힌 것입니다. 괄호 종류가 하나뿐이라 스택에 쌓을 것 없이 개수만 세면 됩니다.`],demo:{input:[s],label:`s = "${s}"`},workUnit:`글자를 읽은 횟수`,approaches:[{id:`parentheses-counter`,name:`여는 괄호 개수 세기`,rank:`BEST`,timeComplexity:`O(N)`,spaceComplexity:`O(1)`,verdict:`괄호 종류가 하나뿐이라 숫자 하나만 들고 한 번 훑으면 끝나는 가장 가벼운 풀이입니다.`,pros:[`문자열을 한 번만 읽으므로 O(N)입니다.`,`변수 하나(count)만 써서 추가 메모리가 필요 없습니다.`,`count가 0 아래로 내려가는 순간 바로 false를 돌려주고 멈출 수 있습니다.`],cons:[`괄호 종류가 여러 개(), {}, []로 늘면 어느 괄호가 열려 있는지 알아야 해서 스택이 필요합니다.`],whyThisRank:`괄호가 한 종류뿐이면 스택에 쌓아 둘 정보가 없고 "몇 개가 열려 있나"만 알면 됩니다. 시간은 스택과 같지만 메모리까지 아끼는 가장 단순한 풀이입니다.`,code:d,visualize:H},{id:`parentheses-stack`,name:`스택에 쌓고 짝짓기`,rank:`ALTERNATIVE`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`답과 시간은 같지만 '('를 하나하나 쌓아 두느라 메모리를 최대 N개나 쓰는 풀이입니다. 정석은 숫자 하나면 됩니다.`,pros:[`괄호 종류가 늘어나도(소괄호, 중괄호, 대괄호) 그대로 쓸 수 있는 일반적인 방법입니다.`,`어떤 '('와 어떤 ')'가 짝지어지는지가 눈에 보입니다.`],cons:[`'('가 길게 이어지면 스택에 최대 N개를 쌓습니다. 정석은 count 숫자 하나로 같은 일을 합니다.`,`이 문제는 괄호가 한 종류라 쌓인 것이 모두 같은 '('입니다. 저장할 정보가 없는데도 칸을 차지합니다.`],whyThisRank:`시간은 정석과 같지만 같은 일을 더 많은 메모리로 합니다. 한 종류의 괄호에서는 스택에 쌓은 내용이 늘 같아서 숫자 하나로 줄어들기 때문입니다. (괄호 종류가 여러 개라면 스택이 정석입니다.)`,code:p,visualize:U},{id:`parentheses-count-compare`,name:`'('와 ')' 개수만 비교하기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(1)`,verdict:`개수만 같으면 올바르다고 착각하는 풀이로, 순서가 틀린 괄호도 통과시킵니다.`,pros:[`코드가 짧고 한 번만 훑습니다.`],cons:[`")("처럼 개수는 같지만 짝이 맞지 않는 문자열에도 true를 돌려줍니다. 예제 ")()("도 이 풀이로는 틀립니다.`,`괄호는 닫는 괄호가 여는 괄호보다 먼저 나오면 안 된다는 순서를 전혀 보지 못합니다.`],whyThisRank:`올바른 괄호는 '개수가 같다'와 '어느 자리에서도 닫는 괄호가 여는 괄호보다 많지 않다'를 모두 만족해야 합니다. 이 풀이는 앞의 조건만 보므로 오답입니다.`,code:h,visualize:W}],checks:{cases:[{args:[`()()`],expected:!0},{args:[`(())()`],expected:!0},{args:[`)()(`],expected:!1},{args:[`(()(`],expected:!1},{args:[`()`],expected:!0},{args:[`(`],expected:!1},{args:[`)`],expected:!1},{args:[`((()))(()())`],expected:!0},{args:[s],expected:!1}],random:e=>{let t=1+Math.floor(e()*6),[n,r,i]=[0,0,``];for(;r<t;)n<t&&(n===r||e()<.5)?[n,i]=[n+1,`${i}(`]:[r,i]=[r+1,`${i})`];if(e()<.5){let t=Math.floor(e()*i.length);i=e()<.5?i.slice(0,t)+(i[t]===`(`?`)`:`(`)+i.slice(t+1):i.slice(0,t)+i.slice(t+1)}return[i||`(`]}}};export{G as default};