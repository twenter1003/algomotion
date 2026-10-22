import{n as e,t}from"./index-Cf02qAUa.js";import{a as n,c as r,i,l as a,r as o}from"./shared-CL29HWIp.js";import{t as s}from"./lane-BzDhdR3X.js";var c=1,l=10,u=6,d=1/0,f=e=>e===d?`∞`:String(e),p=e=>[...e-u>=c?[{kind:`add`,from:e-u}]:[],...e%2==0&&e/2>=c?[{kind:`two`,from:e/2}]:[],...e%3==0&&e/3>=c?[{kind:`three`,from:e/3}]:[]],m=Array(11).fill(d);m[c]=0;for(let e=2;e<=l;e++)m[e]=Math.min(d,...p(e).map(e=>m[e.from]))+1;var h=m[l]===d?-1:m[l],g=[l];for(let e=l;e!==c;)e=p(e).find(t=>m[t.from]===m[e]-1).from,g.push(e);var _={python:`def solution(x, y, n):
    INF = float('inf')
    dp = [INF] * (y + 1)  # dp[v] = x를 v로 만드는 최소 연산 횟수 (못 만들면 INF)
    dp[x] = 0

    for v in range(x + 1, y + 1):
        best = INF
        if v - n >= x:
            best = min(best, dp[v - n])  # n을 더해서 왔다
        if v % 2 == 0 and v // 2 >= x:
            best = min(best, dp[v // 2])  # 2를 곱해서 왔다
        if v % 3 == 0 and v // 3 >= x:
            best = min(best, dp[v // 3])  # 3을 곱해서 왔다
        dp[v] = best + 1

    return dp[y] if dp[y] != INF else -1`,javascript:`function solution(x, y, n) {
  const dp = Array(y + 1).fill(Infinity); // dp[v] = x를 v로 만드는 최소 연산 횟수 (못 만들면 Infinity)
  dp[x] = 0;

  for (let v = x + 1; v <= y; v++) {
    let best = Infinity;
    if (v - n >= x) {
      best = Math.min(best, dp[v - n]); // n을 더해서 왔다
    }
    if (v % 2 === 0 && v / 2 >= x) {
      best = Math.min(best, dp[v / 2]); // 2를 곱해서 왔다
    }
    if (v % 3 === 0 && v / 3 >= x) {
      best = Math.min(best, dp[v / 3]); // 3을 곱해서 왔다
    }
    dp[v] = best + 1;
  }

  return dp[y] === Infinity ? -1 : dp[y];
}`},v={start:i(_,[`dp = [INF] * (y + 1)`,`dp[x] = 0`],[`const dp = Array(y + 1)`,`dp[x] = 0`]),look:(e,t,n)=>i(_,[`for v in range(x + 1, y + 1)`,`best = INF`,`if v - n >= x`,...e?[`best = min(best, dp[v - n])`]:[],`if v % 2 == 0`,...t?[`best = min(best, dp[v // 2])`]:[],`if v % 3 == 0`,...n?[`best = min(best, dp[v // 3])`]:[]],[`for (let v = x + 1`,`let best = Infinity`,`if (v - n >= x)`,...e?[`best = Math.min(best, dp[v - n])`]:[],`if (v % 2 === 0`,...t?[`best = Math.min(best, dp[v / 2])`]:[],`if (v % 3 === 0`,...n?[`best = Math.min(best, dp[v / 3])`]:[]]),add:i(_,[`dp[v] = best + 1`],[`dp[v] = best + 1`]),done:i(_,[`return dp[y] if`],[`return dp[y] === Infinity`])},y={python:`from collections import deque

def solution(x, y, n):
    if x == y:
        return 0
    dist = {x: 0}  # 숫자 → x에서 그 숫자까지의 최소 연산 횟수 (처음 만난 횟수가 최소)
    queue = deque([x])
    while queue:
        v = queue.popleft()
        for nxt in (v + n, v * 2, v * 3):
            if nxt == y:
                return dist[v] + 1
            if nxt < y and nxt not in dist:
                dist[nxt] = dist[v] + 1
                queue.append(nxt)
    return -1`,javascript:`function solution(x, y, n) {
  if (x === y) return 0;
  const dist = new Map([[x, 0]]); // 숫자 → x에서 그 숫자까지의 최소 연산 횟수 (처음 만난 횟수가 최소)
  const queue = [x];
  let head = 0; // shift() 대신 머리 인덱스
  while (head < queue.length) {
    const v = queue[head++];
    for (const next of [v + n, v * 2, v * 3]) {
      if (next === y) {
        return dist.get(v) + 1;
      }
      if (next < y && !dist.has(next)) {
        dist.set(next, dist.get(v) + 1);
        queue.push(next);
      }
    }
  }
  return -1;
}`},b={start:i(y,[`dist = {x: 0}`,`queue = deque([x])`],[`const dist = new Map`,`const queue = [x]`]),pop:i(y,[`while queue`,`v = queue.popleft()`],[`while (head < queue.length)`,`const v = queue[head++]`]),look:i(y,[`for nxt in (v + n`,`if nxt == y`,`if nxt < y and nxt not in dist`],[`for (const next of`,`if (next === y)`,`if (next < y && !dist.has(next))`]),push:i(y,[`dist[nxt] = dist[v] + 1`,`queue.append(nxt)`],[`dist.set(next`,`queue.push(next)`]),found:i(y,[`for nxt in (v + n`,`if nxt == y`,`return dist[v] + 1`],[`for (const next of`,`if (next === y)`,`return dist.get(v) + 1`])},x={python:`# 주의: 가능하면 큰 수로 먼저 나누며 거꾸로 가는 풀이는 막다른 길에 들어가 오답이 나옵니다
def solution(x, y, n):
    count = 0
    while y > x:
        if y % 3 == 0 and y // 3 >= x:
            y //= 3  # 3으로 나눌 수 있으면 먼저
        elif y % 2 == 0 and y // 2 >= x:
            y //= 2  # 안 되면 2로
        elif y - n >= x:
            y -= n  # 안 되면 n을 빼기
        else:
            return -1  # 어느 쪽도 안 되면 막힙니다
        count += 1
    return count`,javascript:`// 주의: 가능하면 큰 수로 먼저 나누며 거꾸로 가는 풀이는 막다른 길에 들어가 오답이 나옵니다
function solution(x, y, n) {
  let count = 0;
  while (y > x) {
    if (y % 3 === 0 && y / 3 >= x) {
      y /= 3; // 3으로 나눌 수 있으면 먼저
    } else if (y % 2 === 0 && y / 2 >= x) {
      y /= 2; // 안 되면 2로
    } else if (y - n >= x) {
      y -= n; // 안 되면 n을 빼기
    } else {
      return -1; // 어느 쪽도 안 되면 막힙니다
    }
    count++;
  }
  return count;
}`},S={start:i(x,[`count = 0`],[`let count = 0`]),look:i(x,[`while y > x`,`if y % 3 == 0`],[`while (y > x)`,`if (y % 3 === 0`]),three:i(x,[`if y % 3 == 0`,`y //= 3`],[`if (y % 3 === 0`,`y /= 3`]),two:i(x,[`if y % 3 == 0`,`elif y % 2 == 0`,`y //= 2`],[`if (y % 3 === 0`,`else if (y % 2 === 0`,`y /= 2`]),sub:i(x,[`if y % 3 == 0`,`elif y % 2 == 0`,`elif y - n >= x`,`y -= n`],[`if (y % 3 === 0`,`else if (y % 2 === 0`,`else if (y - n >= x)`,`y -= n`]),stuck:i(x,[`if y % 3 == 0`,`elif y % 2 == 0`,`elif y - n >= x`,`return -1`],[`if (y % 3 === 0`,`else if (y % 2 === 0`,`else if (y - n >= x)`,`return -1`]),count:i(x,[`count += 1`],[`count++`]),done:i(x,[`return -1`],[`return -1`])},C=5,w=62,T=14,E=98,D=302,O=e=>({x:(e-c)%C*w,y:T+Math.floor((e-c)/C)*E,w:54,h:54}),k=198,A=e=>`cell:${e}`,j=e=>({type:`wait`,ms:e}),M=(e,t,n=!1)=>({type:`set`,id:A(e),patch:t,...n?{pop:n}:{}}),N=(e,t)=>M(e,{tone:t}),P=e=>({type:`set`,id:`calc`,patch:{text:e}}),F=(...e)=>({type:`focus`,ids:e.map(A)}),I=()=>r([{type:`clearMarks`},{type:`unfocus`}]),L=(e,t,n,r)=>({type:`arrow`,from:A(e),to:A(t),verdict:n,label:r}),R=Array.from({length:10},(e,t)=>c+t),z=20,B=2e3,V=e=>Math.max(0,...e.actions.map(t=>t.start+t.duration-e.start)),H=n=>{for(let r of n.steps){let{phases:n}=e(r);n.forEach((e,i)=>{let a=i<n.length-1?140:r.isKeyframe?t:320,o=[...r.phases[i].caption].length*z-a;e.end-e.start<o&&r.phases[i].actions.push(j(Math.ceil(o-V(e))))});let i=e(r),a=i.phases.at(-1),o=B-i.total;o>0&&r.phases.at(-1).actions.push(j(a.end-a.start+o-V(a)))}return n};function U(e,t,n,r=[]){let i=R.flatMap(t=>[{id:A(t),kind:`cell`,rect:O(t),...e(t)},{id:`label:${t}`,kind:`text`,rect:{x:O(t).x,y:O(t).y+58,w:54,h:16},tone:`muted`,text:String(t)}]);return i.push({id:`calc`,kind:`text`,rect:{x:0,y:k,w:t,h:28},text:``},...r),{width:D,height:n,items:i}}var W=226,G=o(u,`을`,`를`),K={add:`${G} 더해서`,two:`2를 곱해서`,three:`3을 곱해서`};function q(){let e=new a(U(e=>e===c?{text:`0`,tone:`visited`}:{text:`∞`,tone:`plain`},D,W)),t,i=0,s={v:`-`,add:`-`,two:`-`,three:`-`,best:`-`,dp:`-`},_=()=>({work:i,variables:{v:s.v,"dp[v - n]":s.add,"dp[v // 2]":s.two,"dp[v // 3]":s.three,best:s.best,"dp[v]":s.dp}}),y=()=>t===void 0?[]:[N(t,m[t]===d?`wall`:`visited`)];e.step({title:`dp[${c}] = 0으로 시작`,codeHighlights:v.start,..._()}),e.phase(`시작`,`${c}에 ${G} 더하거나 2나 3을 곱해 ${l}을 만드는 최소 연산 횟수를 구합니다. dp[v]는 ${o(c,`을`,`를`)} v로 만드는 최소 횟수입니다.`),e.do(P(`못 만드는 숫자는 ∞`)),e.phase(`규칙`,`${c}은 연산 0번이고 나머지는 ∞로 시작합니다. v는 v − ${u}, v ÷ 2, v ÷ 3 중 이어질 수 있는 숫자의 최솟값에 1을 더해 정합니다.`),e.do(P(`dp[v] = min(앞 숫자들) + 1`));for(let n=2;n<=l;n++){let a=p(n),l=a.map(e=>m[e.from]),u=Math.min(d,...l),h=y();i++,t=n;let g=e=>{let t=a.find(t=>t.kind===e);return t?f(m[t.from]):`-`};Object.assign(s,{v:n,add:g(`add`),two:g(`two`),three:g(`three`),best:f(u),dp:f(m[n])});let b=a.length?a.length===1?`${f(l[0])} + 1`:`min(${l.map(f).join(`, `)}) + 1`:`이어질 숫자 없음`,x=[...new Set(a.map(e=>e.from))],S=x.find(e=>m[e]===u),C=v.look(a.some(e=>e.kind===`add`),a.some(e=>e.kind===`two`),a.some(e=>e.kind===`three`));e.step({title:`dp[${n}] = ${a.length?`${b} = ${f(m[n])}`:`∞ (만들 수 없음)`}`,codeHighlights:v.add,..._()}),a.length?(e.phase(`앞 숫자 보기`,`${o(n,`은`,`는`)} ${x.map(e=>`${e}에서 ${a.filter(t=>t.from===e).map(e=>K[e.kind]).join(` 또는 `)}`).join(`, `)} 올 수 있습니다. 이어질 숫자의 최솟값은 ${f(u)}입니다.`,C),e.do(...r([...h,N(n,`current`),F(n,...x),P(b)])),e.do(...x.map(e=>L(n,e,e===S?`good`:`seen`,f(m[e]))),j(300)),e.phase(`정하기`,u===d?`이어질 숫자가 모두 ∞라 ${o(`dp[${n}]`,`도`,`도`)} ∞입니다.`:`${f(u)} + 1 = ${m[n]}이므로 ${o(`dp[${n}]`,`은`,`는`)} ${m[n]}입니다.`,v.add),e.do(...r([M(n,{text:f(m[n])},!0),P(`${b} = ${f(m[n])}`)]),j(300),...I())):(e.phase(`앞 숫자 보기`,`${n}에서 ${G} 빼면 ${c}보다 작고, 2나 3으로 나누어떨어지지도 않아 이어질 숫자가 없습니다.`,C),e.do(...r([...h,N(n,`current`),F(n),P(b)])),e.phase(`정하기`,`만들 수 없어 ${o(`dp[${n}]`,`은`,`는`)} ∞ 그대로입니다.`,v.add),e.do(...r([N(n,`wall`),P(`dp[${n}] = ∞`)]),j(300),{type:`unfocus`}))}let b=y();return e.step({title:`답 dp[${l}] = ${h}`,codeHighlights:v.done,..._(),answer:h,isKeyframe:!0}),e.phase(`답`,`dp[${l}] = ${h}이라 ${o(c,`을`,`를`)} ${n(l)} 바꾸는 최소 연산은 ${h}번입니다. ${n(g.slice().reverse().join(` → `))} 이어집니다.`),e.do(...r([...b,...g.map(e=>N(e,`path`)),P(`${g.slice().reverse().join(` → `)}: ${h}번`)])),H(e.finish())}var J=238,Y=[{id:`queue-label`,kind:`text`,rect:{x:0,y:J,w:44,h:28},tone:`muted`,text:`큐`}],X=e=>`q:${e}`;function Z(){let e=new a(U(()=>({text:``,tone:`plain`}),D,270,Y)),t=new s(e,{id:`queue`,x:52,y:J,slotW:44,slotH:28,gap:6,max:5,foldable:!0}),n=new Map([[c,0]]),i=[],d=0,f,p={v:`-`,d:`-`},m=()=>({work:d,variables:{v:p.v,"dist[v]":p.d,queue:`[${i.join(`, `)}]`}}),h=()=>f===void 0?[]:[N(f,`visited`)];e.step({title:`큐에 ${c} 넣고 시작`,codeHighlights:b.start,...m()}),e.phase(`시작`,`${c}에서 넓혀 가며 ${l}에 처음 닿는 연산 횟수를 찾습니다. 숫자마다 처음 만난 횟수가 최소라서 먼저 만난 숫자부터 꺼냅니다.`),e.do(P(`연산: +${u}, ×2, ×3 · ${l} 넘으면 건너뜀`)),e.phase(`넣기`,`${o(c,`을`,`를`)} 큐에 넣고 연산 횟수 0으로 적습니다.`,b.start),i.push(c),e.do(M(c,{text:`0`,tone:`queued`},!0)),t.push({id:X(c),text:String(c)},A(c));let _;for(;i.length&&!_;){let a=i.shift(),s=n.get(a),g=[...new Set([a+u,a*2,a*3])],v=h();d++,p.v=a,p.d=s,f=a;let y=[],x=[];for(let e of g){if(e===l){_={v:a,d:s},x.push({n:e,verdict:`good`,label:`도착!`});break}e>l||(n.has(e)||y.includes(e)?x.push({n:e,verdict:`seen`,label:`방문함`}):(y.push(e),x.push({n:e,verdict:`new`,label:`${s+1}번`})))}for(let e of y)n.set(e,s+1),i.push(e);e.step({title:_?`${a}에서 ${l}에 도착`:`${o(a,`을`,`를`)} 꺼내 ${y.length?`${y.join(`, `)} 넣기`:`넣을 숫자 없음`}`,codeHighlights:_?b.found:y.length?b.push:b.look,...m()}),e.phase(`꺼내기`,a===c?`큐 맨 앞의 ${o(a,`을`,`를`)} 꺼냅니다. 출발 숫자라 연산 0번입니다.`:`큐 맨 앞의 ${o(a,`을`,`를`)} 꺼냅니다. ${c}에서 ${a}까지는 ${s}번입니다.`,b.pop),e.do(...v),t.shift(A(a)),e.do(...r([N(a,`current`),P(`${a}: ${s}번`)],!0));let S=_?`${l}에 닿았습니다!`:g.some(e=>e>l)&&x.some(e=>e.verdict===`seen`)?`${l}보다 큰 숫자와 이미 있는 숫자는 건너뜁니다.`:g.some(e=>e>l)?`${l}보다 큰 숫자는 건너뜁니다.`:x.some(e=>e.verdict===`seen`)?`이미 있는 숫자는 건너뜁니다.`:`모두 새 숫자입니다.`;if(e.phase(`살피기`,`${a}에서 만들 수 있는 숫자는 ${g.join(`, `)}입니다. ${S}`,_?b.found:b.look),x.length?(e.do(F(a,...x.map(e=>e.n))),e.do(...x.map(e=>L(a,e.n,e.verdict,e.label)))):e.do(j(400)),e.do(...I()),!_&&y.length){e.phase(`넣기`,`새 숫자 ${y.join(`, `)}에 ${s+1}번을 적고 큐 뒤에 넣습니다.`,b.push);for(let n of y)t.push({id:X(n),text:String(n)},A(a)),e.do({...M(n,{text:String(s+1),tone:`queued`},!0),together:!0})}}let v=_?_.d+1:-1,y=h();return e.step({title:`답 ${v}번`,codeHighlights:b.found,...m(),answer:v,isKeyframe:!0}),e.phase(`답`,`${_.v}에서 ${G} 더하면 ${l}입니다. 큐를 먼저 만난 순서로 꺼내서 처음 닿았으니 최소 ${v}번입니다.`),e.do(...r([...y,...g.map(e=>N(e,`path`)),M(l,{text:String(v)}),P(`${g.slice().reverse().join(` → `)}: ${v}번`)])),H(e.finish())}var Q=234;function ee(){let e=new a(U(()=>({text:``,tone:`plain`}),D,266)),t=0,i=0,s=l,d=()=>({work:t,variables:{y:s,count:i}});e.step({title:`${l}에서 거꾸로 가기`,codeHighlights:S.start,...d()}),e.phase(`시작`,`${l}에서 거꾸로, 3으로 나누어지면 3으로, 아니면 2로, 아니면 ${G} 빼며 ${o(c,`을`,`를`)} 찾아갑니다.`),e.do(...r([N(l,`current`),P(`${l}에서 ${c}까지 거꾸로`)])),e.phase(`규칙`,`큰 수로 나누는 쪽이 연산 횟수가 가장 적을 것 같아, 가능하면 큰 수로 먼저 나눕니다.`,S.look),e.do(P(`3으로 → 2로 → 빼기 순서`));for(let a=l;a>c;){let l=a%3==0&&a/3>=c,f=!l&&a%2==0&&a/2>=c,p=!l&&!f&&a-u>=c,m=l?a/3:f?a/2:a-u,h=l?`÷3`:f?`÷2`:`−${u}`;if(t++,(l||f||p)&&i++,s=l||f||p?m:a,e.step({title:l||f||p?`${a} ${h} → ${m}`:`${a}에서 막힘`,codeHighlights:l?S.three:f?S.two:p?S.sub:S.stuck,...d()}),!(l||f||p)){e.phase(`살펴보기`,`${o(a,`은`,`는`)} 3으로도 2로도 나누어지지 않고, ${G} 빼면 ${c}보다 작아집니다.`,S.stuck),e.do(...r([F(a),P(`${a}: 갈 곳 없음`)])),e.phase(`막힘`,`갈 곳이 없어 막혔습니다. ${o(`−1`,`을`,`를`)} 돌려줍니다.`,S.stuck),e.do(...r([N(a,`bad`),P(`막힘 → −1`)]),j(300),{type:`unfocus`});break}let g=l?`3으로 나누어떨어집니다`:f?`3으로는 안 되고 2로 나누어떨어집니다`:`3으로도 2로도 안 되어 ${G} 뺍니다`;e.phase(`살펴보기`,`${o(a,`은`,`는`)} ${g}.`,l?S.three:f?S.two:S.sub),e.do(...r([F(a,m),P(`${a} ${h} = ${m}`)])),e.do(L(a,m,`good`,h),j(300)),e.phase(`이동`,`${n(m)} 이동합니다. 연산은 ${i}번입니다.`,S.count),e.do(...r([N(a,`bad`),N(m,`current`),P(`연산 ${i}번`)]),j(300),...I()),a=m}let f=g.slice().reverse();return e.step({title:`오답 확인: −1, 정답은 ${h}`,codeHighlights:S.done,...d(),answer:-1,isKeyframe:!0}),e.phase(`오답 확인`,`이 풀이는 −1이라고 답합니다. 하지만 ${c}에서 ${l}까지는 ${h}번에 만들 수 있습니다.`),e.do(P(`내 답 = −1`)),e.do({type:`add`,item:{id:`mine`,kind:`token`,rect:{x:0,y:Q,w:110,h:28},tone:`bad`,text:`내 답 −1`}}),e.phase(`놓친 길`,`${l}에서 2로 나누는 대신 ${G} 빼면 ${o(f.at(-2),`이`,`가`)} 되고, ${n(f.join(` → `))} 이어져 ${h}번에 만들 수 있었습니다.`),e.do(...r([...f.map((e,t)=>M(e,{text:String(t),tone:`good`})),P(`정답 = ${f.join(` → `)}: ${h}번`)])),e.do({type:`add`,item:{id:`truth`,kind:`token`,rect:{x:122,y:Q,w:110,h:28},tone:`good`,text:`정답 ${h}`}},j(300)),H(e.finish())}var $=(e,t,n)=>{let r=Array(t+1).fill(1/0);r[e]=0;for(let i=e+1;i<=t;i++)i-n>=e&&(r[i]=Math.min(r[i],r[i-n]+1)),i%2==0&&i/2>=e&&(r[i]=Math.min(r[i],r[i/2]+1)),i%3==0&&i/3>=e&&(r[i]=Math.min(r[i],r[i/3]+1));return r[t]===1/0?-1:r[t]},te={id:`number-transform`,title:`숫자 변환하기`,level:2,category:`dp`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/154538`,description:{summary:`자연수 x를 y로 바꾸려고 합니다. x에 n을 더하거나, 2를 곱하거나, 3을 곱하는 세 가지 연산만 쓸 수 있고, x를 y로 만드는 데 필요한 연산 횟수의 최솟값을 구합니다. 만들 수 없으면 -1을 돌려줍니다.`,rules:[`1 ≤ x ≤ y ≤ 1,000,000`,`1 ≤ n < y`,`쓸 수 있는 연산은 n 더하기, 2 곱하기, 3 곱하기`,`x를 y로 만들 수 없으면 -1을 return`],examples:[{input:`x = 10, y = 40, n = 5`,output:`2`},{input:`x = 10, y = 40, n = 30`,output:`1`},{input:`x = 2, y = 5, n = 4`,output:`-1`}]},keyIntuitions:[`x에서 v까지의 최소 연산 횟수를 dp[v]로 두면, v는 v − n에서 n을 더해서, v / 2에서 2를 곱해서, v / 3에서 3을 곱해서 올 수 있습니다.`,`dp[v] = min(dp[v − n], dp[v / 2], dp[v / 3]) + 1이고, 이어질 숫자가 없거나 모두 만들 수 없으면 v도 만들 수 없습니다(무한대).`,`작은 숫자부터 x ≤ v ≤ y 순서로 채우면 필요한 값이 이미 계산되어 있습니다. 가장 큰 연산으로 먼저 줄여 가는 탐욕은 막다른 길에 빠질 수 있어 정답이 아닙니다.`],demo:{input:[c,l,u],label:`x = ${c}, y = ${l}, n = ${u}`},workUnit:`확인한 숫자의 수`,approaches:[{id:`transform-table`,name:`숫자별 최소 연산 횟수 표`,rank:`BEST`,timeComplexity:`O(y − x)`,spaceComplexity:`O(y)`,verdict:`x부터 y까지 숫자마다 v − n, v ÷ 2, v ÷ 3에서 온 경우의 최솟값에 1을 더해 표를 채우는 풀이입니다.`,pros:[`숫자마다 세 칸만 보면 되어 y = 1,000,000이어도 100만 칸으로 끝납니다.`,`못 만드는 숫자를 무한대로 두면 이어지는 숫자도 자연스럽게 만들 수 없게 됩니다.`,`표가 남아 있어 y뿐 아니라 중간 숫자의 최소 횟수도 바로 알 수 있습니다.`],cons:[`나누어떨어지는지와 x보다 작아지지 않는지를 숫자마다 확인해야 합니다.`,`무한대 값에 1을 더해도 무한대로 남는다는 점을 -1로 바꾸는 마지막 처리까지 챙겨야 합니다.`],whyThisRank:`"어디서 왔는가"만 따지면 되는 가장 단순한 DP입니다. 작은 숫자부터 채워 가면 필요한 값이 이미 계산되어 있어 큐도 방문 표시도 따로 필요 없습니다.`,code:_,visualize:q},{id:`transform-bfs`,name:`x에서 넓혀 가는 BFS`,rank:`ALTERNATIVE`,timeComplexity:`O(y)`,spaceComplexity:`O(y)`,verdict:`x에서 연산을 하나씩 적용해 가며 처음 y에 닿는 횟수를 찾는 풀이로, 맞지만 큐와 방문 기록이 더 필요합니다.`,pros:[`"가장 적은 연산 횟수"를 최단 거리로 보는 가장 직관적인 풀이입니다.`,`y에 처음 닿는 순간 멈출 수 있어 못 가는 숫자가 많으면 빨리 끝나기도 합니다.`],cons:[`큐와 방문 기록(dist)을 따로 관리해야 하고, y를 넘는 숫자를 걸러 내는 조건을 챙겨야 합니다.`,`최악에는 y 이하의 거의 모든 숫자를 큐에 넣어 표 채우기와 같은 크기의 메모리를 씁니다.`],whyThisRank:`맞는 풀이이지만 표를 채우는 DP가 같은 결과를 큐 없이 얻습니다. 시험에서는 코드가 더 짧고 실수할 곳이 적은 DP가 안전합니다.`,code:y,visualize:Z},{id:`transform-greedy`,name:`거꾸로 큰 수로 먼저 나누기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(log y)`,spaceComplexity:`O(1)`,verdict:`y에서 거꾸로 가며 가능하면 3으로, 아니면 2로, 아니면 n을 빼는 탐욕은 막다른 길에 들어가 오답이 나옵니다.`,pros:[`코드가 짧고 아주 빠릅니다.`,`원문 입출력 예처럼 큰 수로 나누는 쪽이 맞는 경우도 있습니다.`],cons:[`시각화 입력(x = 1, y = 10, n = 6)에서 10을 2로 나누어 5로 갔다가 막혀 -1을 답하지만, 6을 빼서 4로 가면 3번에 만들 수 있습니다.`,`지금의 선택이 앞으로 만들 수 있는 길을 막을 수 있는데, 한 번 고른 길은 되돌릴 방법이 없습니다.`],whyThisRank:`어느 연산이 최소 횟수로 이어질지는 끝까지 가 봐야 압니다. 숫자마다 가능한 모든 앞 숫자의 최솟값을 기억하는 DP(또는 BFS)가 필요합니다.`,code:x,visualize:ee}],checks:{cases:[{args:[10,40,5],expected:2},{args:[10,40,30],expected:1},{args:[2,5,4],expected:-1},{args:[c,l,u],expected:h},{args:[5,5,3],expected:0},{args:[1,2,1],expected:1},{args:[1,1e6,1],expected:$(1,1e6,1)},{args:[2,1e6,999999],expected:$(2,1e6,999999)},{args:[3,999999,7],expected:$(3,999999,7)}],random:e=>{let t=1+Math.floor(e()*6),n=Math.max(2,t+Math.floor(e()*25));return[t,n,1+Math.floor(e()*(n-1))]}}};export{te as default};