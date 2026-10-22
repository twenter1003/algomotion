import{a as e,c as t,i as n,l as r,r as i}from"./shared-CL29HWIp.js";import{c as a,i as o,o as s,r as c,s as l,t as u}from"./common-T-bldLC7.js";var d=`100-200*300-500+20`,f=d.split(/([-+*])/),p=[`+`,`-`,`*`].filter(e=>d.includes(e)),m=e=>e===`*`?`×`:e===`-`?`−`:`+`,h=e=>e.map(e=>e.length===1&&`+-*`.includes(e)?m(e):e.replace(`-`,`−`)).join(``),g=(e,t,n)=>t===`+`?e+n:t===`-`?e-n:e*n,_=e=>String(e).replace(`-`,`−`),v=e=>{let t=[...f],n=[],r=0;for(let i of e){let e=[],a=[];for(let n=0;n<t.length;n++)if(t[n]===i){let o=Number(e.pop()),s=Number(t[n+1]),c=g(o,i,s);a.push(`${_(o)} ${m(i)} ${_(s)} = ${_(c)}`),e.push(String(c)),n++,r++}else e.push(t[n]);t=e,n.push({op:i,calcs:a,line:h(t)})}return{order:e,passes:n,value:Number(t[0]),ops:r}},y=[];{let e=t=>{if(t.length===p.length)y.push(t);else for(let n of p)t.includes(n)||e([...t,n])};e([])}var b=y.map(v),x=b.reduce((e,t)=>Math.abs(t.value)>Math.abs(e.value)?t:e),S=Math.abs(x.value),C=(e,t,n)=>{if(n===t.length)return h(e);let r=[[]];for(let i of e)i===t[n]?r.push([]):r.at(-1).push(i);return r.length===1?C(e,t,n+1):r.map(e=>`(${C(e,t,n+1)})`).join(m(t[n]))},w=(()=>{let e=v([`*`]),t=e.passes[0].line,n=t.replace(/−/g,`-`).replace(/×/g,`*`).split(/([-+*])/),r=Number(n[0]),i=[];for(let e=1;e<n.length;e+=2){let t=g(r,n[e],Number(n[e+1]));i.push(`${_(r)} ${m(n[e])} ${_(Number(n[e+1]))} = ${_(t)}`),r=t}return{times:e,rest:t,steps:i,value:r,ops:e.ops+i.length}})(),T=`import re
from itertools import permutations

def calc(a, op, b):
    return a + b if op == "+" else a - b if op == "-" else a * b
`,E={python:`${T}
def solution(expression):
    tokens = re.split(r"([-+*])", expression)  # 숫자와 연산자로 나눕니다
    ops = [op for op in "+-*" if op in expression]  # 식에 들어 있는 연산자만
    best = 0
    for order in permutations(ops):  # 우선순위를 정하는 모든 순서(앞이 높음)
        work = tokens[:]
        for op in order:  # 우선순위가 높은 연산자부터 한 종류씩
            stack = []
            i = 0
            while i < len(work):
                if work[i] == op:  # 이 연산자를 만나면 앞의 값과 뒤의 값을 계산해 합칩니다
                    stack.append(calc(int(stack.pop()), op, int(work[i + 1])))
                    i += 2
                else:
                    stack.append(work[i])
                    i += 1
            work = stack
        best = max(best, abs(int(work[0])))  # 절댓값이 가장 큰 결과
    return best`,javascript:`const calc = (a, op, b) => (op === "+" ? a + b : op === "-" ? a - b : a * b);

function solution(expression) {
  const tokens = expression.split(/([-+*])/); // 숫자와 연산자로 나눕니다
  const ops = ["+", "-", "*"].filter((op) => expression.includes(op)); // 식에 들어 있는 연산자만
  const orders = [];
  const perm = (p) => {
    if (p.length === ops.length) orders.push(p);
    else for (const op of ops) if (!p.includes(op)) perm([...p, op]);
  };
  perm([]); // 우선순위를 정하는 모든 순서(앞이 높음)

  let best = 0;
  for (const order of orders) {
    let work = [...tokens];
    for (const op of order) { // 우선순위가 높은 연산자부터 한 종류씩
      const stack = [];
      for (let i = 0; i < work.length; i++) {
        if (work[i] === op) { // 이 연산자를 만나면 앞의 값과 뒤의 값을 계산해 합칩니다
          stack.push(calc(Number(stack.pop()), op, Number(work[i + 1])));
          i++;
        } else stack.push(work[i]);
      }
      work = stack;
    }
    best = Math.max(best, Math.abs(Number(work[0]))); // 절댓값이 가장 큰 결과
  }
  return best;
}`},D={start:n(E,[`tokens = re.split`,`best = 0`],[`const tokens = expression.split`,`let best = 0`]),order:n(E,[`for order in permutations(ops):`,`work = tokens[:]`],[`for (const order of orders)`,`let work = [...tokens]`]),pass:n(E,[`for op in order:`,`if work[i] == op:`,`stack.append(calc(int(stack.pop())`,`work = stack`],[`for (const op of order)`,`if (work[i] === op)`,`stack.push(calc(Number(stack.pop())`,`work = stack`]),compare:n(E,[`best = max(best, abs(int(work[0])))`],[`best = Math.max(best, Math.abs(Number(work[0])))`]),done:n(E,[`return best`],[`return best`])},O={python:`${T}
def solution(expression):
    tokens = re.split(r"([-+*])", expression)  # 숫자와 연산자로 나눕니다
    ops = [op for op in "+-*" if op in expression]
    best = 0

    def evaluate(part, low_first):
        # part에 우선순위가 가장 낮은 연산자가 있으면 거기서 쪼개 각 조각을 먼저 계산합니다
        if len(part) == 1:
            return int(part[0])
        op, rest = low_first[0], low_first[1:]
        pieces = [[]]
        for token in part:
            if token == op:
                pieces.append([])
            else:
                pieces[-1].append(token)
        values = [evaluate(piece, rest) for piece in pieces]
        # 조각의 값들을 왼쪽부터 op로 합칩니다
        result = values[0]
        for value in values[1:]:
            result = calc(result, op, value)
        return result

    for order in permutations(ops):  # 우선순위를 정하는 모든 순서(앞이 높음)
        low_first = list(reversed(order))  # 쪼갤 때는 우선순위가 낮은 연산자부터
        best = max(best, abs(evaluate(tokens, low_first)))
    return best`,javascript:`const calc = (a, op, b) => (op === "+" ? a + b : op === "-" ? a - b : a * b);

function solution(expression) {
  const tokens = expression.split(/([-+*])/); // 숫자와 연산자로 나눕니다
  const ops = ["+", "-", "*"].filter((op) => expression.includes(op));
  const orders = [];
  const perm = (p) => {
    if (p.length === ops.length) orders.push(p);
    else for (const op of ops) if (!p.includes(op)) perm([...p, op]);
  };
  perm([]);

  // part에 우선순위가 가장 낮은 연산자가 있으면 거기서 쪼개 각 조각을 먼저 계산합니다
  const evaluate = (part, lowFirst) => {
    if (part.length === 1) return Number(part[0]);
    const [op, ...rest] = lowFirst;
    const pieces = [[]];
    for (const token of part) {
      if (token === op) pieces.push([]);
      else pieces.at(-1).push(token);
    }
    const values = pieces.map((piece) => evaluate(piece, rest));
    // 조각의 값들을 왼쪽부터 op로 합칩니다
    return values.reduce((result, value) => calc(result, op, value));
  };

  let best = 0;
  for (const order of orders) { // 우선순위를 정하는 모든 순서(앞이 높음)
    const lowFirst = [...order].reverse(); // 쪼갤 때는 우선순위가 낮은 연산자부터
    best = Math.max(best, Math.abs(evaluate(tokens, lowFirst)));
  }
  return best;
}`},k={start:n(O,[`tokens = re.split`,`best = 0`],[`const tokens = expression.split`,`let best = 0`]),order:n(O,[`for order in permutations(ops):`,`low_first = list(reversed(order))`],[`for (const order of orders)`,`const lowFirst = [...order].reverse()`]),split:n(O,[`op, rest = low_first[0], low_first[1:]`,`if token == op:`,`pieces.append([])`],[`const [op, ...rest] = lowFirst`,`if (token === op) pieces.push([])`]),merge:n(O,[`values = [evaluate(piece, rest) for piece in pieces]`,`result = calc(result, op, value)`],[`const values = pieces.map`,`values.reduce((result, value) => calc(result, op, value))`]),compare:n(O,[`best = max(best, abs(evaluate(tokens, low_first)))`],[`best = Math.max(best, Math.abs(evaluate(tokens, lowFirst)))`]),done:n(O,[`return best`],[`return best`])},A={python:`import re

# 주의: 연산자 우선순위를 수학에서 쓰는 한 가지(곱셈 먼저)로 고정하는 오답 풀이입니다
def solution(expression):
    tokens = re.split(r"([-+*])", expression)
    stack = []
    i = 0
    while i < len(tokens):  # 곱셈을 먼저 계산해 합칩니다
        if tokens[i] == "*":
            stack.append(int(stack.pop()) * int(tokens[i + 1]))
            i += 2
        else:
            stack.append(tokens[i])
            i += 1
    result = int(stack[0])
    for k in range(1, len(stack), 2):  # 덧셈과 뺄셈은 왼쪽부터
        value = int(stack[k + 1])
        result = result + value if stack[k] == "+" else result - value
    return abs(result)`,javascript:`// 주의: 연산자 우선순위를 수학에서 쓰는 한 가지(곱셈 먼저)로 고정하는 오답 풀이입니다
function solution(expression) {
  const tokens = expression.split(/([-+*])/);
  const stack = [];
  for (let i = 0; i < tokens.length; i++) { // 곱셈을 먼저 계산해 합칩니다
    if (tokens[i] === "*") {
      stack.push(Number(stack.pop()) * Number(tokens[i + 1]));
      i++;
    } else stack.push(tokens[i]);
  }
  let result = Number(stack[0]);
  for (let k = 1; k < stack.length; k += 2) { // 덧셈과 뺄셈은 왼쪽부터
    const value = Number(stack[k + 1]);
    result = stack[k] === "+" ? result + value : result - value;
  }
  return Math.abs(result);
}`},j={start:n(A,[`tokens = re.split`,`stack = []`],[`const tokens = expression.split`,`const stack = []`]),times:n(A,[`while i < len(tokens):`,`if tokens[i] == "*":`,`stack.append(int(stack.pop()) * int(tokens[i + 1])`],[`for (let i = 0; i < tokens.length; i++)`,`if (tokens[i] === "*")`,`stack.push(Number(stack.pop()) * Number(tokens[i + 1]))`]),rest:n(A,[`result = int(stack[0])`,`for k in range(1, len(stack), 2):`,`result = result + value if stack[k]`],[`let result = Number(stack[0])`,`for (let k = 1; k < stack.length; k += 2)`,`result = stack[k] === "+"`]),done:n(A,[`return abs(result)`],[`return Math.abs(result)`])},M=420,N=404,P={x:0,y:0,w:M,h:N},F={x:12,y:26,w:54,h:40,gapX:10,gapY:18},I=e=>`n:${e.join(``)}`,L={id:I([]),kids:[]};{let e=new Map([[L.id,L]]);for(let t of y)for(let n=1;n<=t.length;n++){let r=t.slice(0,n);if(e.has(I(r)))continue;let i={id:I(r),kids:[]};e.get(I(r.slice(0,-1))).kids.push(i),e.set(i.id,i)}}var R=o(L,F),z=e=>R.get(I(e)),B=e=>({x:12,y:272+e*20,w:396,h:20}),V=(e,t,n,r,i)=>({id:e,kind:`token`,rect:{x:t,y:366,w:n,h:30},tone:i,text:r}),H=e=>[0,1,2,3].map(t=>({id:`ln:${t}`,kind:`text`,rect:B(t),tone:t?void 0:`muted`,text:t?``:e}));function U(e){return{width:M,height:N,items:[{id:`title`,kind:`text`,rect:{x:12,y:0,w:396,h:16},tone:`muted`,text:e},{id:I([]),kind:`cell`,rect:z([]),tone:`visited`,text:`시작`},...H(h(f)),V(`t:val`,12,170,`이번 결과 -`,`plain`),V(`t:best`,190,218,`절댓값의 최댓값 0`,`chosen`)]}}var W=e=>e.map(m).join(` > `),G=e=>s(`t:val`,{text:`이번 결과 ${_(e)}`},!0),K=(e,t)=>t.flatMap((n,r)=>{let i=t.slice(0,r+1);if(e.has(I(i)))return[];let a=i.slice(0,-1);return[{type:`add`,item:{id:I(i),kind:`cell`,rect:z(i),tone:`visited`,text:m(n),tag:`${r+1}순위`},from:I(a)},{type:`add`,item:{id:`e:${I(i)}`,kind:`line`,rect:P,tone:`trail`,points:u(z(a),z(i))}}]});function q(e){let n=new r(U(e?`우선순위 순열마다 식을 쪼개 계산합니다`:`우선순위 순열마다 높은 연산자부터 합쳐 계산합니다`)),o=e?k:D,u=0,d=-1,g=0,v,S=()=>({work:g,variables:{order:v?`(${v.order.map(m).join(`, `)})`:`-`,...v?{"work[0]":v.value}:{},best:u}});return n.step({title:`연산자 ${p.length}개의 우선순위 ${y.length}가지`,codeHighlights:o.start,...S()}),n.phase(`시작`,`식에 ${p.map(m).join(`, `)} 세 연산자가 있어 우선순위를 정하는 방법은 ${p.length}! = ${y.length}가지입니다. 방법마다 계산해서 결과의 절댓값이 가장 큰 것을 고릅니다.`,o.start),n.do(a(300)),b.forEach((r,a)=>{let c=Math.abs(r.value),p=c>u,[y]=[u];if(v=r,g+=r.ops,p&&(u=c),n.step({title:`우선순위 ${W(r.order)} → ${_(r.value)}${p?` (새 최댓값)`:``}`,codeHighlights:o.compare,...S()}),n.phase(`우선순위 정하기`,`우선순위를 ${W(r.order)} 순서로 정합니다(앞이 높음).`,o.order),n.do(...t([...K(n,r.order),...[1,2,3].map(e=>s(`ln:${e}`,{text:``})),s(`ln:0`,{text:h(f)}),s(`t:val`,{text:`이번 결과 -`})])),e){let e=[...r.order].reverse();n.phase(`쪼개기`,`낮은 ${e.map(m).join(`, `)} 순서로 식을 쪼개 괄호로 묶습니다.`,k.split),n.do(s(`ln:1`,{text:C(f,e,0)})),n.phase(`합치기`,`안쪽 조각부터 합치면 ${_(r.value)}입니다. 연산은 ${r.ops}번입니다.`,k.merge),n.do(...t([s(`ln:2`,{text:`안쪽부터 계산 → ${_(r.value)}`}),G(r.value)]))}else r.passes.forEach((e,t)=>{n.phase(`계산하기`,`${m(e.op)} 계산: ${e.calcs.join(`, `)}`,D.pass),n.do(s(`ln:${t+1}`,{text:e.line}))}),n.do(G(r.value));n.phase(`비교하기`,p?`결과 ${_(r.value)}의 절댓값 ${i(c,`이`,`가`)} 지금까지의 최댓값 ${y}보다 커서 새 최댓값입니다.`:`결과 ${_(r.value)}의 절댓값 ${i(c,`은`,`는`)} 최댓값 ${i(y,`을`,`를`)} 넘지 못합니다.`,o.compare);let x=I(r.order);n.do(...t([{type:`add`,item:{id:`r:${a}`,kind:`text`,rect:{x:z(r.order).x,y:z(r.order).y+F.h+4,w:F.w,h:16},text:_(r.value)}},...p?[s(`t:best`,{text:`절댓값의 최댓값 ${u}`},!0),l(x,`good`,!0),...d>=0?[l(I(b[d].order),`visited`)]:[]]:[l(x,`explored`)]])),p&&(d=a)}),v=x,n.step({title:`최댓값 ${u}`,codeHighlights:o.done,...S(),answer:u,isKeyframe:!0}),n.phase(`결과`,`우선순위 ${y.length}가지를 모두 계산해 절댓값이 가장 큰 ${i(u,`을`,`를`)} 찾았습니다. ${W(x.order)} 순서일 때이고, 수학에서 쓰는 곱셈 먼저의 ${Math.abs(w.value)}보다 큽니다.`,o.done),n.do(...t([l(I(x.order),`path`,!0),s(`t:best`,{tone:`path`},!0),s(`ln:3`,{text:`답 ${u}`})])),c(n.finish())}function J(){let e=new r({width:M,height:250,items:[{id:`title`,kind:`text`,rect:{x:12,y:0,w:396,h:16},tone:`muted`,text:`우선순위를 수학처럼 곱셈 먼저로 고정합니다`},...H(h(f)).map((e,t)=>({...e,rect:{...e.rect,y:30+t*28,h:24}})),{id:`t:val`,kind:`token`,rect:{x:12,y:150,w:170,h:30},tone:`plain`,text:`이번 결과 -`},{id:`t:best`,kind:`token`,rect:{x:190,y:150,w:218,h:30},tone:`chosen`,text:`내 답 -`}]}),n=0,a,o=()=>({work:n,variables:{result:a??`-`}});e.step({title:`곱셈 먼저 계산`,codeHighlights:j.times,...o()}),n=w.times.ops,e.phase(`계산하기`,`곱셈을 먼저 계산합니다. ${w.times.passes[0].calcs.join(`, `)}`,j.times),e.do(s(`ln:1`,{text:w.rest})),n=w.ops,a=w.value,e.step({title:`덧셈·뺄셈은 왼쪽부터 → ${_(w.value)}`,codeHighlights:j.rest,...o()}),e.phase(`계산하기`,`덧셈·뺄셈은 같은 순위라 왼쪽부터: ${w.steps.join(`, `)}`,j.rest),e.do(s(`ln:2`,{text:`왼쪽부터 → ${_(w.value)}`}),s(`t:val`,{text:`이번 결과 ${_(w.value)}`},!0));let l=Math.abs(w.value);return e.step({title:`${l} — 정답은 ${S}`,codeHighlights:j.done,...o(),answer:l,isKeyframe:!0}),e.phase(`비교하기`,`절댓값 ${i(l,`을`,`를`)} 돌려줍니다. 하지만 ${W(x.order)} 순서로 계산하면 ${_(x.value)}이고 절댓값은 ${S}입니다. 곱셈이 늘 먼저가 아니라, 우선순위를 바꿔 모두 계산해 봐야 합니다.`,j.done),e.do(...t([s(`t:best`,{text:`내 답 ${l}`,tone:`bad`},!0),s(`t:val`,{tone:`bad`}),s(`ln:3`,{text:`정답 ${S} (${W(x.order)})`})])),c(e.finish())}var Y={id:`maximize-expression`,title:`수식 최대화`,level:2,category:`brute-force`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/67257`,description:{summary:`숫자와 연산자 +, -, *로만 이루어진 수식이 주어집니다. 연산자의 우선순위를 마음대로 정할 수 있고, 연산자마다 우선순위는 모두 달라야 합니다(같은 연산자끼리는 왼쪽이 먼저). 우선순위를 정해 수식을 계산했을 때 나오는 결과의 절댓값이 가장 커지는 경우를 찾아 그 값을 구합니다.`,rules:[`expression은 길이 3 이상 100 이하의 문자열이고, 공백과 괄호는 없음`,`피연산자는 0 이상 999 이하의 정수이고, 연산자는 +, -, * 가운데 하나 이상 포함`,`어떤 우선순위로 계산해도 중간 결과와 최종 결과의 절댓값은 2^63 − 1 이하`],examples:[{input:`expression = "100-200*300-500+20"`,output:`60420`},{input:`expression = "50*6-3*2"`,output:`300`}]},keyIntuitions:[`연산자 종류는 최대 3개라 우선순위를 정하는 방법은 3! = 6가지뿐입니다. 모든 순서를 정해 계산해 보는 완전탐색이 가능합니다.`,`우선순위가 높은 연산자부터 한 종류씩, 식에서 왼쪽부터 만나는 대로 앞뒤 값을 계산해 하나로 합쳐 가면 됩니다. 같은 연산자끼리는 왼쪽이 먼저입니다.`,`식에 없는 연산자는 순열에 넣을 필요가 없고, 결과는 음수일 수 있으니 절댓값으로 비교합니다. 곱셈을 먼저 하는 수학 규칙이 늘 최선은 아닙니다.`],demo:{input:[d],label:`expression = "100-200*300-500+20"`},workUnit:`연산을 계산한 횟수`,approaches:[{id:`expression-permutations`,name:`우선순위 순열마다 높은 연산자부터 합쳐 계산`,rank:`BEST`,timeComplexity:`O(3! × L)`,spaceComplexity:`O(L)`,verdict:`식의 연산자로 만들 수 있는 우선순위 순서를 모두 정하고, 순서마다 높은 연산자부터 앞뒤 값을 합쳐 계산해 절댓값이 가장 큰 결과를 고릅니다.`,pros:[`우선순위가 정해지면 한 종류씩 왼쪽에서 오른쪽으로 합치기만 하면 되어 계산이 단순합니다.`,`식에 들어 있는 연산자만 순열로 만들어 쓸데없는 순서를 피합니다.`,`순서가 6가지뿐이라 식 길이가 100이어도 아주 빠릅니다.`],cons:[`문자열을 숫자와 연산자로 정확히 나누는 부분(정규식 split)에서 실수하기 쉽습니다.`,`같은 연산자끼리는 왼쪽부터 계산하는 규칙과 음수 결과의 절댓값을 놓치면 틀립니다.`],whyThisRank:`우선순위 순열 6가지를 모두 계산하는 가장 직관적인 풀이입니다. 계산이 반복문 하나로 끝나 코드가 짧고 실수할 곳이 적습니다.`,code:E,visualize:()=>q(!1)},{id:`expression-split`,name:`우선순위 순열마다 식을 쪼개 재귀로 계산`,rank:`ALTERNATIVE`,timeComplexity:`O(3! × L)`,spaceComplexity:`O(L)`,verdict:`같은 우선순위 순열에서, 우선순위가 가장 낮은 연산자로 식을 쪼개 조각마다 재귀로 계산한 뒤 왼쪽부터 합칩니다.`,pros:[`식을 쪼개는 방식이라 괄호를 친 것처럼 계산 구조가 눈에 보입니다.`,`연산자가 더 늘어나도 같은 재귀로 처리됩니다.`],cons:[`재귀와 조각 리스트를 함께 다뤄야 해서 정석보다 읽기 어렵습니다.`,`계산 횟수는 정석과 같아서 빨라지는 것은 없습니다.`],whyThisRank:`연산 횟수는 정석과 같고 재귀 구조만 더 복잡합니다. 같은 순열 완전탐색이지만 시험장에서는 한 종류씩 합치는 쪽이 쓰기 쉽습니다.`,code:O,visualize:()=>q(!0)},{id:`expression-math-order`,name:`수학 우선순위(곱셈 먼저) 하나로 계산`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(L)`,spaceComplexity:`O(L)`,verdict:`곱셈을 먼저 하고 덧셈·뺄셈은 왼쪽부터 계산하는 한 가지 방법만 써서, 더 큰 결과를 놓치는 오답 풀이입니다.`,pros:[`순서를 정할 필요 없이 한 번만 계산해 가장 빠릅니다.`,`연산자가 한 종류뿐인 입력에서는 맞습니다.`],cons:[`시각화 입력에서 곱셈 먼저는 ${Math.abs(w.value)}이지만, ${W(x.order)} 순서로 계산하면 ${e(S)} 더 큽니다.`,`연산자가 한 종류뿐이라 우선순위를 고를 필요가 없는 입력(예: "2*3*4")은 맞아서, 직접 예제로 확인하기 전까지 틀린 줄 모를 수 있습니다.`],whyThisRank:`문제는 우선순위를 마음대로 정할 수 있다고 했습니다. 곱셈 먼저는 가능한 6가지 중 하나일 뿐이라, 모든 순서를 계산해 절댓값이 가장 큰 것을 골라야 합니다.`,code:A,visualize:J}],checks:{cases:[{args:[`100-200*300-500+20`],expected:60420},{args:[`50*6-3*2`],expected:300},{args:[`1+1`],expected:2},{args:[`10-5`],expected:5},{args:[`1-2-3`],expected:4},{args:[`2*3+4`],expected:14},{args:[`9*9-9`],expected:72},{args:[`999*999*999`],expected:997002999},{args:[d],expected:60420}],random:e=>{let t=2+Math.floor(e()*4),n=String(Math.floor(e()*100));for(let r=1;r<t;r++)n+=`+-*`[Math.floor(e()*3)]+Math.floor(e()*100);return[n]}}};export{Y as default};