import{n as e,t}from"./index-Cf02qAUa.js";import{c as n,i as r,l as i,r as a}from"./shared-CL29HWIp.js";var o=1,s=10,c=8,l=e=>Number(String(o).repeat(e)),u={python:`def solution(N, number):
    dp = [set() for _ in range(9)]  # dp[k] = N을 정확히 k번 써서 만들 수 있는 수

    for k in range(1, 9):
        dp[k].add(int(str(N) * k))  # N, NN, NNN … 이어 붙인 수
        for i in range(1, k):
            for a in dp[i]:
                for b in dp[k - i]:
                    dp[k].add(a + b)
                    dp[k].add(a * b)
                    if a - b > 0:
                        dp[k].add(a - b)
                    if a // b > 0:
                        dp[k].add(a // b)
        if number in dp[k]:
            return k

    return -1`,javascript:`function solution(N, number) {
  const dp = Array.from({ length: 9 }, () => new Set()); // dp[k] = N을 정확히 k번 써서 만들 수 있는 수

  for (let k = 1; k <= 8; k++) {
    dp[k].add(Number(String(N).repeat(k))); // N, NN, NNN … 이어 붙인 수
    for (let i = 1; i < k; i++) {
      for (const a of dp[i]) {
        for (const b of dp[k - i]) {
          dp[k].add(a + b);
          dp[k].add(a * b);
          if (a - b > 0) dp[k].add(a - b);
          if (Math.floor(a / b) > 0) dp[k].add(Math.floor(a / b));
        }
      }
    }
    if (dp[k].has(number)) return k;
  }

  return -1;
}`},d=e=>(t,n)=>r(e,[`dp[k].add(a + b)`,`dp[k].add(a * b)`,`if a - b > 0`,...t?[`dp[k].add(a - b)`]:[],`if a // b > 0`,...n?[`dp[k].add(a // b)`]:[]],[`dp[k].add(a + b)`,`dp[k].add(a * b)`,`if (a - b > 0)`,`if (Math.floor(a / b) > 0)`]),f={start:r(u,[`dp = [set()`],[`const dp = Array.from`]),concat:r(u,[`for k in range(1, 9)`,`dp[k].add(int(str(N) * k))`],[`for (let k = 1`,`dp[k].add(Number(String(N)`]),pick:r(u,[`for i in range(1, k)`,`for a in dp[i]`,`for b in dp[k - i]`],[`for (let i = 1`,`for (const a of dp[i])`,`for (const b of dp[k - i])`]),calc:d(u),check:r(u,[`if number in dp[k]`],[`if (dp[k].has(number))`]),done:r(u,[`return k`],[`return k`])},p={python:`def solution(N, number):
    cost = {N: 1}      # 값 → 그 값을 만든 가장 적은 사용 횟수
    fresh = [[], [N]]  # fresh[k] = 사용 횟수 k로 처음 만든 값들

    def put(v, k):
        if v > 0 and v not in cost:  # 이미 더 적게 써서 만든 값은 건너뜁니다
            cost[v] = k
            fresh[k].append(v)

    for k in range(1, 9):
        if k > 1:
            fresh.append([])
            put(int(str(N) * k), k)  # N, NN, NNN … 이어 붙인 수
            for i in range(1, k):
                for a in fresh[i]:
                    for b in fresh[k - i]:
                        put(a + b, k)
                        put(a * b, k)
                        put(a - b, k)
                        put(a // b, k)
        if number in cost:
            return cost[number]

    return -1`,javascript:`function solution(N, number) {
  const cost = new Map([[N, 1]]); // 값 → 그 값을 만든 가장 적은 사용 횟수
  const fresh = [[], [N]]; // fresh[k] = 사용 횟수 k로 처음 만든 값들

  const put = (v, k) => {
    if (v > 0 && !cost.has(v)) { // 이미 더 적게 써서 만든 값은 건너뜁니다
      cost.set(v, k);
      fresh[k].push(v);
    }
  };

  for (let k = 1; k <= 8; k++) {
    if (k > 1) {
      fresh.push([]);
      put(Number(String(N).repeat(k)), k); // N, NN, NNN … 이어 붙인 수
      for (let i = 1; i < k; i++) {
        for (const a of fresh[i]) {
          for (const b of fresh[k - i]) {
            put(a + b, k);
            put(a * b, k);
            put(a - b, k);
            put(Math.floor(a / b), k);
          }
        }
      }
    }
    if (cost.has(number)) return cost.get(number);
  }

  return -1;
}`},m={start:r(p,[`cost = {N: 1}`,`fresh = [[], [N]]`],[`const cost = new Map`,`const fresh = [[], [N]]`]),one:r(p,[`for k in range(1, 9)`,`if k > 1`],[`for (let k = 1`,`if (k > 1)`]),concat:e=>r(p,[`for k in range(1, 9)`,`if k > 1`,`fresh.append([])`,`put(int(str(N) * k), k)`,`if v > 0 and v not in cost`,...e?[`cost[v] = k`,`fresh[k].append(v)`]:[]],[`for (let k = 1`,`if (k > 1)`,`fresh.push([])`,`put(Number(String(N)`,`if (v > 0 && !cost.has(v))`,...e?[`cost.set(v, k)`,`fresh[k].push(v)`]:[]]),pick:r(p,[`for i in range(1, k)`,`for a in fresh[i]`,`for b in fresh[k - i]`],[`for (let i = 1`,`for (const a of fresh[i])`,`for (const b of fresh[k - i])`]),calc:e=>r(p,[`put(a + b, k)`,`put(a * b, k)`,`put(a - b, k)`,`put(a // b, k)`,`if v > 0 and v not in cost`,...e?[`cost[v] = k`,`fresh[k].append(v)`]:[]],[`put(a + b, k)`,`put(a * b, k)`,`put(a - b, k)`,`put(Math.floor(a / b), k)`,`if (v > 0 && !cost.has(v))`,...e?[`cost.set(v, k)`,`fresh[k].push(v)`]:[]]),check:r(p,[`if number in cost`],[`if (cost.has(number))`]),done:r(p,[`return cost[number]`],[`return cost.get(number)`])},h={python:`# 주의: 뺄셈과 나눗셈은 순서가 중요한데 짝을 절반만 보는 풀이입니다
def solution(N, number):
    dp = [set() for _ in range(9)]

    for k in range(1, 9):
        dp[k].add(int(str(N) * k))
        for i in range(1, k // 2 + 1):  # 덧셈·곱셈은 순서가 같으니 짝을 절반만?
            for a in dp[i]:
                for b in dp[k - i]:
                    dp[k].add(a + b)
                    dp[k].add(a * b)
                    if a - b > 0:
                        dp[k].add(a - b)
                    if a // b > 0:
                        dp[k].add(a // b)
        if number in dp[k]:
            return k

    return -1`,javascript:`// 주의: 뺄셈과 나눗셈은 순서가 중요한데 짝을 절반만 보는 풀이입니다
function solution(N, number) {
  const dp = Array.from({ length: 9 }, () => new Set());

  for (let k = 1; k <= 8; k++) {
    dp[k].add(Number(String(N).repeat(k)));
    for (let i = 1; i <= Math.floor(k / 2); i++) { // 덧셈·곱셈은 순서가 같으니 짝을 절반만?
      for (const a of dp[i]) {
        for (const b of dp[k - i]) {
          dp[k].add(a + b);
          dp[k].add(a * b);
          if (a - b > 0) dp[k].add(a - b);
          if (Math.floor(a / b) > 0) dp[k].add(Math.floor(a / b));
        }
      }
    }
    if (dp[k].has(number)) return k;
  }

  return -1;
}`},g={start:r(h,[`dp = [set()`],[`const dp = Array.from`]),concat:r(h,[`for k in range(1, 9)`,`dp[k].add(int(str(N) * k))`],[`for (let k = 1`,`dp[k].add(Number(String(N)`]),pick:r(h,[`for i in range(1, k // 2 + 1)`,`for a in dp[i]`,`for b in dp[k - i]`],[`for (let i = 1`,`for (const a of dp[i])`,`for (const b of dp[k - i])`]),calc:d(h),skip:r(h,[`for i in range(1, k // 2 + 1)`],[`for (let i = 1`]),check:r(h,[`if number in dp[k]`],[`if (dp[k].has(number))`]),done:r(h,[`return k`],[`return k`])};function _(e){let t=[[],[]],n=new Set,r=[],i;for(let a=1;a<=c;a++){let o=[];t[a]=o;let c=t=>t<=0||(e===`dict`?n.has(t):o.includes(t))?!1:(o.push(t),n.add(t),!0),u={k:a,concatFresh:c(l(a)),pairs:[],row:o,found:!1};for(let n=1;n<=(e===`half`?Math.floor(a/2):a-1);n++)for(let e of t[n])for(let r of t[a-n]){let t=[{sym:`+`,value:e+r},{sym:`×`,value:e*r},{sym:`−`,value:e-r},{sym:`÷`,value:Math.floor(e/r)}],o=t.filter(t=>{let o=c(t.value);return o&&t.value===s&&!i&&(i={k:a,i:n,a:e,b:r,sym:t.sym}),o}).map(e=>e.value);u.pairs.push({i:n,a:e,b:r,calcs:t,fresh:o})}if(u.found=o.includes(s),r.push(u),u.found)return{blocks:r,answer:a,made:i}}return{blocks:r,answer:-1}}var v=54,y=8,b=60,x=548,S=44,C=30,w=68,T=40;function E(e){let t=[],n=S;for(let r of e.blocks)t[r.k]=n,n+=Math.max(1,Math.ceil(r.row.length/y))*w-14+C;return{count:e.blocks.length,tops:t,calcY:n-C+22}}var D=(e,t,n)=>({x:b+n%y*62,y:e.tops[t]+Math.floor(n/y)*w,w:v,h:v}),O=(e,t)=>`cell:${e}:${t}`;function k(e,t){let n=[{id:`n`,kind:`token`,rect:{x:b,y:0,w:84,h:28},tone:`plain`,text:`N = ${o}`},{id:`goal`,kind:`token`,rect:{x:444,y:0,w:104,h:28},tone:`plain`,text:`목표 ${s}`}];for(let t=1;t<=e.count;t++)n.push({id:`label:${t}`,kind:`text`,rect:{x:0,y:e.tops[t],w:54,h:v},tone:`muted`,text:`${t}번`});return n.push({id:`calc`,kind:`text`,rect:{x:0,y:e.calcY,w:x,h:28},text:``}),{width:x,height:e.calcY+28+(t?T:0),items:n}}var A=e=>({type:`wait`,ms:e}),j=(e,t)=>({type:`set`,id:e,patch:{tone:t}}),M=e=>({type:`set`,id:`calc`,patch:{text:e}}),N=e=>({type:`focus`,ids:e}),P=()=>n([{type:`clearMarks`},{type:`unfocus`}]),F=e=>`dp[${e}]`,I=e=>e.join(`, `),L=e=>e>0?String(e):`${String(e).replace(`-`,`−`)} ✗`,R=20,z=2e3,B=e=>Math.max(0,...e.actions.map(t=>t.start+t.duration-e.start)),V=n=>{for(let r of n.steps){let{phases:n}=e(r);n.forEach((e,i)=>{let a=i<n.length-1?140:r.isKeyframe?t:320,o=[...r.phases[i].caption].length*R-a;e.end-e.start<o&&r.phases[i].actions.push(A(Math.ceil(o-B(e))))});let i=e(r),a=i.phases.at(-1),o=z-i.total;o>0&&r.phases.at(-1).actions.push(A(a.end-a.start+o-B(a)))}return n},H={full:{mode:`full`,at:{...f,concat:()=>f.concat,calc:(e,t,n)=>f.calc(t,n)},rowKey:`dp[k]`,rowName:F,intro:`dp[k]는 ${a(o,`을`,`를`)} 정확히 k번 써서 만들 수 있는 수의 집합입니다.`,introCalc:`dp[k] = N을 이어 붙인 수 + 짝마다 a + b, a × b, a − b, a ÷ b`,calcNew:(e,t)=>`네 계산 중 0보다 큰 새 값 ${a(I(t),`을`,`를`)} ${F(e)}에 넣습니다.`,calcNone:e=>`네 계산이 모두 0 이하이거나 이미 ${F(e)}에 있어 새 값이 없습니다.`,checkNo:e=>`${F(e)}에 ${a(s,`이`,`가`)} 없습니다. 한 번 더 써 봅니다.`},dict:{mode:`dict`,at:{...m},oneLines:m.one,rowKey:`fresh[k]`,rowName:e=>`fresh[${e}]`,intro:`값마다 처음 만든 사용 횟수만 기억하고, 이미 만든 값은 다시 넣지 않습니다.`,introCalc:`이미 만든 값 · 0 이하는 건너뜀`,calcNew:(e,t)=>`0보다 크고 처음 만든 값 ${I(t)}만 fresh[${e}]에 넣습니다.`,calcNone:()=>`새 값이 없습니다. 모두 0 이하이거나 이미 만든 값입니다.`,checkNo:()=>`지금까지 만든 값에 ${a(s,`이`,`가`)} 없습니다. 한 번 더 써 봅니다.`},half:{mode:`half`,at:{...g,concat:()=>g.concat,calc:(e,t,n)=>g.calc(t,n)},rowKey:`dp[k]`,rowName:F,intro:`i는 k // 2까지만 돌아, dp[i]와 dp[k − i]의 짝을 절반만 봅니다.`,introCalc:`짝 (i, k − i)는 i ≤ k − i인 것만`,calcNew:(e,t)=>`네 계산 중 0보다 큰 새 값 ${a(I(t),`을`,`를`)} ${F(e)}에 넣습니다.`,calcNone:e=>`네 계산이 모두 0 이하이거나 이미 ${F(e)}에 있어 새 값이 없습니다.`,checkNo:e=>`${F(e)}에 ${a(s,`이`,`가`)} 없습니다. 한 번 더 써 봅니다.`,groupFrom:4}};function U(e,t){let n=[];if(t&&e.k>=t){for(let t of e.pairs){let e=n.at(-1);e&&e.pairs[0].i===t.i?e.pairs.push(t):n.push({pairs:[t],kind:`group`})}return n}return e.pairs.forEach((t,r)=>{let i=e.pairs.slice(r),a=n.at(-1);a?.kind===`rest`&&a.pairs[0].i===t.i?a.pairs.push(t):i.length>=2&&i.every(e=>e.i===t.i&&!e.fresh.length)?n.push({pairs:[t],kind:`rest`}):n.push({pairs:[t],kind:`one`})}),n}function W(e){let t=_(e.mode),r=E(t),c=e.mode===`half`,u=new i(k(r,c)),d=[],f=[],p=0,m={k:0,i:`-`,a:`-`,b:`-`,row:[]},h=()=>({work:p,variables:{k:m.k||`-`,i:m.i,a:m.a,b:m.b,[e.rowKey]:m.k?`{${I(m.row)}}`:`-`}}),g=()=>{let e=f.map(e=>j(e,`visited`));return f=[],e},v=e=>(d[e]??[]).map(t=>O(e,t)),y=(e,t,n)=>{(d[e]??=[]).push(t);let i=O(e,t);return f.push(i),{type:`add`,item:{id:i,kind:`cell`,rect:D(r,e,d[e].length-1),tone:`current`,text:String(t)},...n?{from:n}:{}}};u.step({title:`${a(s,`을`,`를`)} 만드는 최소 횟수 구하기`,codeHighlights:e.at.start,...h()}),u.phase(`시작`,`${a(o,`과`,`와`)} 사칙연산만으로 ${a(s,`을`,`를`)} 만들 때, ${a(o,`을`,`를`)} 가장 적게 쓰는 횟수를 구합니다.`),u.do({type:`set`,id:`goal`,patch:{tone:`chosen`},pop:!0}),u.phase(`규칙`,e.intro),u.do(M(e.introCalc));for(let r of t.blocks){let{k:t}=r,i=e.rowName(t),_=l(t),b=U(r,e.groupFrom),x=[];if(c)for(let e=Math.floor(t/2)+1;e<t;e++)x.push(e);let S=r.found?O(t,s):void 0,C=()=>{u.phase(`목표 찾기`,r.found?`${i}에서 ${a(s,`을`,`를`)} 찾았습니다! ${a(o,`을`,`를`)} ${t}번 쓰면 됩니다.`:e.checkNo(t),e.at.check),u.do(...n([N(v(t)),M(`${s} ${r.found?`∈`:`∉`} ${i}`)])),S&&u.do({type:`arrow`,from:`goal`,to:S,verdict:`good`,label:`찾음!`},{...j(`goal`,`good`),together:!0}),u.do(A(300),...P())},w=t===1?e.oneLines??e.at.concat(!0):e.at.concat(r.concatFresh);if(p++,m.k=t,m.i=m.a=m.b=`-`,m.row=[...d[t]??[],...r.concatFresh?[_]:[]],u.step({title:t===1?`${F(1)} = {${o}}`:r.concatFresh?`${i}에 ${_} 넣기`:`${a(_,`은`,`는`)} 이미 있어 건너뜀`,codeHighlights:w,...h()}),u.phase(`이어 붙이기`,t===1?`${a(o,`을`,`를`)} 1번 쓰면 ${o} 하나뿐입니다.`:`${a(o,`을`,`를`)} ${t}번 이어 붙이면 ${_}입니다.`,w),u.do(...n([...g(),M(`${a(o,`을`,`를`)} ${t}번 이어 붙인 수 = ${_}`)])),u.phase(`넣기`,r.concatFresh?`${i}에 ${a(_,`을`,`를`)} 넣습니다.`:`${a(_,`은`,`는`)} 이미 있어 넣지 않습니다.`,w),u.do(...r.concatFresh?[y(t,_)]:[A(300)]),!b.length&&!x.length&&C(),b.forEach((r,o)=>{let{pairs:s}=r,c=s[0],l=c.i,_=s.flatMap(e=>e.fresh),v=r.kind===`one`,S=s.some(e=>e.calcs[2].value>0),w=s.some(e=>e.calcs[3].value>0);p+=s.length*4,m.i=l,[m.a,m.b]=v?[c.a,c.b]:[s.at(-1).a,s.at(-1).b],m.row=[...d[t]??[],..._],u.step({title:v?`${i}: a = ${c.a}, b = ${c.b} → ${_.length?`새 값 ${I(_)}`:`새 값 없음`}`:r.kind===`group`?`${i}: ${a(e.rowName(l),`과`,`와`)} ${e.rowName(t-l)}의 짝 ${s.length}쌍 → ${_.length?`새 값 ${_.length}개`:`새 값 없음`}`:`${i}: 남은 ${s.length}쌍도 계산 → ${_.length?`새 값 ${I(_)}`:`새 값 없음`}`,codeHighlights:e.at.calc(_.length>0,S,w),...h()});let T=[...new Set(s.flatMap(e=>[O(e.i,e.a),O(t-e.i,e.b)]))];u.phase(`짝 고르기`,v?`${e.rowName(l)}에서 a = ${c.a}, ${e.rowName(t-l)}에서 b = ${a(c.b,`을`,`를`)} 고릅니다.`:r.kind===`group`?`${a(e.rowName(l),`과`,`와`)} ${e.rowName(t-l)}의 모든 짝 ${s.length}쌍을 한꺼번에 고릅니다.`:`나머지 ${s.length}쌍도 같은 방식으로 고릅니다.`,e.at.pick),u.do(...n([...g(),...T.map(e=>j(e,`chosen`)),N(T),M(v?`a = ${c.a}, b = ${c.b}`:`${s.length}쌍 × 4 = ${s.length*4}번 계산`)])),f.push(...T),u.phase(`계산하기`,_.length?e.calcNew(t,_):e.calcNone(t),e.at.calc(_.length>0,S,w)),u.do(...n([{type:`unfocus`},M(v?c.calcs.map(e=>`${c.a}${e.sym}${c.b}=${L(e.value)}`).join(` · `):`${s.length}쌍 계산 → ${_.length?`새 값 ${I(_)}`:`새 값 없음`}`)])),_.length&&u.do(...n(_.map(e=>y(t,e,O(l,c.a))))),o===b.length-1&&!x.length&&C()}),x.length){let[r]=x;m.i=m.a=m.b=`-`,m.row=d[t]??[],u.step({title:`${a(F(r),`과`,`와`)} ${F(t-r)}의 짝은 건너뜀`,codeHighlights:e.at.skip,...h()}),u.phase(`짝 건너뛰기`,`i는 k // 2 = ${Math.floor(t/2)}까지만 돌아서 ${a(F(r),`과`,`와`)} ${F(t-r)}의 짝은 계산하지 않습니다.`,e.at.skip),u.do(...n([...g(),N([...v(r),...v(t-r)]),M(`i = ${a(r,`은`,`는`)} k // 2 = ${a(Math.floor(t/2),`을`,`를`)} 넘어 건너뜀`)])),u.do({type:`arrow`,from:O(r,d[r][0]),to:O(t-r,d[t-r][0]),verdict:`bad`,label:`짝 건너뜀`},A(300),...P()),C()}}let{answer:x,made:S}=t,C=O(x,s);if(m.row=d[x]??[],c){let t=_(`full`),i=t.made,[c,l]=[O(i.i,i.a),O(i.k-i.i,i.b)],d=r.calcY+T-6;m.i=m.a=m.b=`-`,u.step({title:`오답 확인: ${x}번, 정답은 ${t.answer}번`,codeHighlights:e.at.done,...h(),answer:x,isKeyframe:!0}),u.phase(`오답 확인`,`${F(x)}에서 ${a(s,`을`,`를`)} 찾아 답이 ${x}번이 됩니다. 하지만 정답은 ${t.answer}번입니다.`),u.do(...n([...g(),j(C,`bad`)])),u.do({type:`add`,item:{id:`mine`,kind:`token`,rect:{x:b,y:d,w:110,h:28},tone:`bad`,text:`내 답 ${x}번`}}),u.phase(`놓친 짝`,`${F(i.i)}의 ${a(i.a,`과`,`와`)} ${F(i.k-i.i)}의 ${i.b}로 ${i.a} ${i.sym} ${i.b} = ${a(s,`을`,`를`)} 만들 수 있었습니다. 건너뛴 짝입니다.`),u.do(...n([N([c,l]),M(`${i.a} ${i.sym} ${i.b} = ${s}  →  ${a(o,`을`,`를`)} ${t.answer}번 사용`)])),u.do({type:`arrow`,from:c,to:l,verdict:`good`,label:`${i.a}${i.sym}${i.b}=${s}`}),u.do({type:`add`,item:{id:`truth`,kind:`token`,rect:{x:182,y:d,w:110,h:28},tone:`good`,text:`정답 ${t.answer}번`}},A(300))}else{let t=S&&O(S.i,S.a),r=S&&O(S.k-S.i,S.b);m.i=S?.i??`-`,m.a=S?.a??`-`,m.b=S?.b??`-`,u.step({title:`정답 ${x}번${S?`: ${s} = ${S.a} ${S.sym} ${S.b}`:``}`,codeHighlights:e.at.done,...h(),answer:x,isKeyframe:!0}),u.phase(`정답`,S?`${a(s,`은`,`는`)} ${S.a} ${S.sym} ${S.b}입니다. ${a(S.a,`은`,`는`)} ${a(o,`을`,`를`)} ${S.i}번, ${a(S.b,`은`,`는`)} ${S.k-S.i}번 써서 모두 ${x}번입니다.`:`${a(o,`을`,`를`)} ${x}번 이어 붙인 수라서 답은 ${x}번입니다.`),u.do(...n([...g(),...[C,t,r].filter(e=>!!e).map(e=>j(e,`path`)),M(S?`${s} = ${S.a} ${S.sym} ${S.b}  →  ${a(o,`을`,`를`)} ${x}번 사용`:`${s} = ${a(o,`을`,`를`)} ${x}번 이어 붙인 수`)]))}return V(u.finish())}var G={id:`express-with-n`,title:`N으로 표현`,level:3,category:`dp`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42895`,description:{summary:`숫자 N과 괄호, 사칙연산(+, −, ×, ÷)만 써서 number를 만들 때, N을 쓴 횟수의 최솟값을 구합니다. 나눗셈의 나머지는 버리고, 최솟값이 8보다 크면 -1을 돌려줍니다.`,rules:[`N은 1 이상 9 이하의 자연수`,`number는 1 이상 32,000 이하의 자연수`,`수식에는 괄호와 사칙연산만 쓸 수 있고, 나눗셈의 나머지는 무시`,`최솟값이 8보다 크면 -1을 return`],examples:[{input:`N = 5, number = 12`,output:`4`},{input:`N = 2, number = 11`,output:`3`}]},keyIntuitions:[`N을 8번까지만 쓰므로, N을 정확히 k번 써서 만들 수 있는 수의 집합 dp[k]를 k = 1부터 차례로 만들면 됩니다.`,`dp[k]는 N을 k번 이어 붙인 수(5, 55, 555 …)와, dp[i]의 수 a와 dp[k − i]의 수 b로 만든 a + b, a × b, a − b, a ÷ b를 모두 모은 것입니다. 괄호로 묶는 모든 경우가 이 짝 (i, k − i)로 나뉩니다.`,`뺄셈과 나눗셈은 순서가 중요하니 a, b를 바꿔 b − a, b ÷ a도 만들어야 합니다. dp[k]에 number가 처음 나오는 k가 답이고, 8번까지 없으면 -1입니다.`],demo:{input:[o,s],label:`N = 1, number = 10`},workUnit:`계산한 식의 수`,approaches:[{id:`express-sets`,name:`사용 횟수별 집합 만들기`,rank:`BEST`,timeComplexity:`O(Σ |dp[i]| × |dp[k − i]|)`,spaceComplexity:`O(Σ |dp[k]|)`,verdict:`N을 k번 써서 만들 수 있는 수의 집합을 k = 1, 2, 3 … 차례로 만들어 number가 처음 나오는 k를 찾는 풀이입니다.`,pros:[`괄호로 묶는 모든 경우를 짝 (i, k − i)로 나누는 것만으로 빠짐없이 만듭니다.`,`집합이라 같은 값을 한 번만 보관해 k = 8까지 가도 수천 개로 끝납니다.`,`number가 처음 나오는 k가 바로 최솟값이라 따로 비교할 것이 없습니다.`],cons:[`뺄셈과 나눗셈은 순서가 달라서 짝을 (i, k − i)와 (k − i, i) 양쪽 순서로 모두 봐야 합니다.`,`0 이하의 값은 버리므로, 나눗셈이 0이 되거나 0으로 나누는 경우를 코드에서 챙겨야 합니다.`],whyThisRank:`N을 8번까지만 쓰는 제한이 작아서 만들 수 있는 수를 집합으로 모두 만들어 보는 것이 가장 단순하고 확실합니다. 집합의 크기가 k = 8에서도 5천 개 안팎이라 계산이 순식간에 끝납니다.`,code:u,visualize:()=>W(H.full)},{id:`express-first-cost`,name:`값마다 처음 만든 횟수만 기억하기`,rank:`ALTERNATIVE`,timeComplexity:`O(Σ |fresh[i]| × |fresh[k − i]|)`,spaceComplexity:`O(만든 값의 수)`,verdict:`이미 더 적게 써서 만든 값은 다시 넣지 않아 집합이 작아지지만, 줄의 뜻과 코드가 더 복잡해지는 풀이입니다.`,pros:[`같은 값을 다시 만들지 않아 줄이 짧아지고 계산 횟수가 줄어듭니다.`,`값마다 가장 적게 쓴 횟수를 사전으로 바로 알 수 있습니다.`],cons:[`줄이 "정확히 k번으로 만든 수"가 아니라 "k번으로 처음 만든 수"라서 뜻을 따로 기억해야 합니다.`,`사전(cost), 줄(fresh), 넣는 함수(put)까지 필요해 정석보다 코드가 길고 실수할 곳이 많습니다.`],whyThisRank:`결과는 정석과 같고 계산도 조금 줄지만, N을 8번까지만 쓰는 이 문제에서는 얻는 것이 작습니다. 줄의 뜻이 흐려지는 대가가 커서 짧고 뜻이 분명한 정석이 더 안전합니다.`,code:p,visualize:()=>W(H.dict)},{id:`express-half-pairs`,name:`짝을 절반만 보는 집합 만들기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(Σ |dp[i]| × |dp[k − i]|)`,spaceComplexity:`O(Σ |dp[k]|)`,verdict:`덧셈·곱셈은 순서가 같다고 짝을 절반만 보다가, 순서가 중요한 뺄셈·나눗셈을 놓쳐 오답이 나옵니다.`,pros:[`정석과 코드가 거의 같고 반복이 절반이라 빨라 보입니다.`,`number가 덧셈·곱셈만으로 만들어지는 경우에는 정답이 나옵니다.`],cons:[`dp[i]의 a와 dp[k − i]의 b로 a − b와 a ÷ b만 계산해 b − a, b ÷ a를 놓칩니다.`,`1로 10을 만들 때 11 − 1 = 10은 dp[2]의 11과 dp[1]의 1이라 짝 (2, 1)이 필요한데, i를 1까지만 돌아 건너뛰고 3번이 아니라 4번이라고 답합니다.`,`원문 예제 2(N = 2, number = 11)에서도 22 ÷ 2 = 11의 짝을 건너뛰어 3이 아니라 5라고 답합니다.`],whyThisRank:`뺄셈과 나눗셈은 교환법칙이 성립하지 않아 a, b를 정하는 순서마다 따로 계산해야 합니다. 반복을 줄이려다 정확성을 잃은 경우입니다. 짝을 (i, k − i)와 (k − i, i) 모두 보면 정답입니다.`,code:h,visualize:()=>W(H.half)}],checks:{cases:[{args:[5,12],expected:4},{args:[2,11],expected:3},{args:[o,s],expected:3},{args:[5,5],expected:1},{args:[7,1],expected:2},{args:[3,5],expected:4},{args:[1,41],expected:8},{args:[1,70],expected:-1},{args:[9,32e3],expected:-1}],random:e=>[1+Math.floor(e()*9),1+Math.floor(e()*120)]}};export{G as default};