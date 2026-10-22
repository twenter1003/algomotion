import{o as e,t}from"./layout-DFaYBMY_.js";import{a as n,c as r,i,l as a,r as o}from"./shared-CL29HWIp.js";import{t as s}from"./lane-BzDhdR3X.js";import{i as c,r as l,t as u}from"./common-T-bldLC7.js";var d=`011`,f=3,p=e=>`"${e}"`,m=e=>e.map(e=>d[e]).join(``),h=e=>[...d].filter((t,n)=>!e.includes(n)).join(``),g=[],_=e=>{e.length&&g.push({path:e,text:m(e),value:Number(m(e))});for(let t=0;t<f;t++)e.includes(t)||_([...e,t])};_([]);var v=e=>{if(e<2)return{prime:!1,tries:0,divisor:0,root:0};let t=0,n=Math.floor(Math.sqrt(e));for(let r=2;r*r<=e;r++)if(t++,e%r===0)return{prime:!1,tries:t,divisor:r,root:n};return{prime:!0,tries:t,divisor:0,root:n}},y=e=>v(e).prime?`prime`:e<2?`small`:`composite`,b=(e,t)=>`${o(e,`과`,`와`)} ${t}`,x=(e,t,n)=>[...e.slice(0,-1),o(e.at(-1),t,n)].join(`, `),S=`def is_prime(n):
    if n < 2:
        return False
    for d in range(2, int(n ** 0.5) + 1):  # 제곱근까지만 나눠 봅니다
        if n % d == 0:
            return False
    return True
`,C=`function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) { // 제곱근까지만 나눠 봅니다
    if (n % d === 0) return false;
  }
  return true;
}
`,w={python:`${S}
def solution(numbers):
    found = set()  # 같은 수는 한 번만 세려고 집합에 담습니다

    def build(current, rest):
        if current:
            found.add(int(current))  # "011"도 정수 11이 됩니다
        for i in range(len(rest)):
            # 안 쓴 종이 하나를 더 붙입니다
            build(current + rest[i], rest[:i] + rest[i + 1:])

    build("", numbers)
    return sum(is_prime(x) for x in found)`,javascript:`${C}
function solution(numbers) {
  const found = new Set(); // 같은 수는 한 번만 세려고 집합에 담습니다

  const build = (current, rest) => {
    if (current) found.add(Number(current)); // "011"도 정수 11이 됩니다
    for (let i = 0; i < rest.length; i++) {
      // 안 쓴 종이 하나를 더 붙입니다
      build(current + rest[i], rest.slice(0, i) + rest.slice(i + 1));
    }
  };

  build("", numbers);
  let count = 0;
  for (const x of found) if (isPrime(x)) count++;
  return count;
}`},T=(e,t)=>({small:i(e,[t[0],`if n < 2:`,`        return False`],[t[1],`if (n < 2) return false`]),composite:i(e,[t[0],`for d in range(2`,`if n % d == 0:`,`            return False`],[t[1],`for (let d = 2`,`if (n % d === 0) return false`]),prime:i(e,[t[0],`for d in range(2`,`if n % d == 0:`,`return True`],[t[1],`for (let d = 2`,`if (n % d === 0) return false`,`return true`])}),E={start:i(w,[`found = set()`,`build("", numbers)`],[`const found = new Set()`,`build("", numbers)`]),pick:i(w,[`for i in range(len(rest))`,`build(current + rest[i]`],[`for (let i = 0; i < rest.length; i++)`,`build(current + rest[i]`]),add:i(w,[`if current:`,`found.add(int(current))`],[`if (current) found.add(Number(current))`]),back:i(w,[`for i in range(len(rest))`],[`for (let i = 0; i < rest.length; i++)`]),test:T(w,[`return sum(is_prime(x) for x in found)`,`for (const x of found)`]),done:i(w,[`return sum(is_prime(x) for x in found)`],[`for (const x of found) if (isPrime(x)) count++`,`return count`])},D={python:`def solution(numbers):
    # 만들 수 있는 가장 큰 수까지 에라토스테네스의 체로 소수표를 먼저 만듭니다
    limit = int("".join(sorted(numbers, reverse=True)))
    is_prime = [True] * (limit + 1)
    is_prime[0] = False
    if limit >= 1:
        is_prime[1] = False
    for p in range(2, int(limit ** 0.5) + 1):
        if is_prime[p]:
            for multiple in range(p * p, limit + 1, p):
                is_prime[multiple] = False  # p의 배수를 지웁니다

    found = set()

    def build(current, rest):
        if current:
            found.add(int(current))
        for i in range(len(rest)):
            build(current + rest[i], rest[:i] + rest[i + 1:])

    build("", numbers)
    return sum(is_prime[x] for x in found)  # 표를 조회만 합니다`,javascript:`function solution(numbers) {
  // 만들 수 있는 가장 큰 수까지 에라토스테네스의 체로 소수표를 먼저 만듭니다
  const limit = Number([...numbers].sort().reverse().join(""));
  const isPrime = Array(limit + 1).fill(true);
  isPrime[0] = false;
  if (limit >= 1) isPrime[1] = false;
  for (let p = 2; p * p <= limit; p++) {
    if (!isPrime[p]) continue;
    for (let multiple = p * p; multiple <= limit; multiple += p) {
      isPrime[multiple] = false; // p의 배수를 지웁니다
    }
  }

  const found = new Set();
  const build = (current, rest) => {
    if (current) found.add(Number(current));
    for (let i = 0; i < rest.length; i++) {
      build(current + rest[i], rest.slice(0, i) + rest.slice(i + 1));
    }
  };

  build("", numbers);
  let count = 0;
  for (const x of found) if (isPrime[x]) count++; // 표를 조회만 합니다
  return count;
}`},O={table:i(D,[`limit = int(`,`is_prime = [True] * (limit + 1)`,`is_prime[0] = False`,`is_prime[1] = False`],[`const limit = Number(`,`const isPrime = Array(limit + 1)`,`isPrime[0] = false`,`if (limit >= 1) isPrime[1] = false`]),round:i(D,[`for p in range(2, int(limit ** 0.5) + 1)`,`if is_prime[p]:`,`for multiple in range(p * p`,`is_prime[multiple] = False`],[`for (let p = 2; p * p <= limit; p++)`,`if (!isPrime[p]) continue`,`for (let multiple = p * p`,`isPrime[multiple] = false`]),finish:i(D,[`for p in range(2, int(limit ** 0.5) + 1)`,`if is_prime[p]:`],[`for (let p = 2; p * p <= limit; p++)`,`if (!isPrime[p]) continue`]),collect:i(D,[`found = set()`,`build("", numbers)`],[`const found = new Set()`,`build("", numbers)`]),look:i(D,[`return sum(is_prime[x] for x in found)`],[`for (const x of found) if (isPrime[x]) count++`]),done:i(D,[`return sum(is_prime[x] for x in found)`],[`for (const x of found) if (isPrime[x]) count++`,`return count`])},k={python:`${S}
# 주의: 같은 수가 여러 번 만들어져도 그대로 세는 오답 풀이입니다
def solution(numbers):
    count = 0

    def build(current, rest):
        nonlocal count
        if current and is_prime(int(current)):
            count += 1  # 집합에 담지 않아 같은 수가 또 나와도 셉니다
        for i in range(len(rest)):
            build(current + rest[i], rest[:i] + rest[i + 1:])

    build("", numbers)
    return count`,javascript:`${C}
// 주의: 같은 수가 여러 번 만들어져도 그대로 세는 오답 풀이입니다
function solution(numbers) {
  let count = 0;

  const build = (current, rest) => {
    if (current && isPrime(Number(current))) {
      count++; // 집합에 담지 않아 같은 수가 또 나와도 셉니다
    }
    for (let i = 0; i < rest.length; i++) {
      build(current + rest[i], rest.slice(0, i) + rest.slice(i + 1));
    }
  };

  build("", numbers);
  return count;
}`},A={start:i(k,[`count = 0`,`build("", numbers)`],[`let count = 0`,`build("", numbers)`]),pick:i(k,[`for i in range(len(rest))`,`build(current + rest[i]`],[`for (let i = 0; i < rest.length; i++)`,`build(current + rest[i]`]),test:T(k,[`if current and is_prime(int(current))`,`if (current && isPrime(Number(current)))`]),count:i(k,[`if current and is_prime(int(current))`,`for d in range(2`,`if n % d == 0:`,`return True`,`count += 1`],[`if (current && isPrime(Number(current)))`,`for (let d = 2`,`if (n % d === 0) return false`,`return true`,`count++`]),back:i(k,[`for i in range(len(rest))`],[`for (let i = 0; i < rest.length; i++)`]),done:i(k,[`return count`],[`return count`])},j=420,M=404,ee={x:0,y:0,w:j,h:M},N={x:18,y:70,w:54,h:44,gapX:10,gapY:20},P=e=>`n:${e.join(``)}`,F=e=>({id:P(e),kids:[...Array(f).keys()].filter(t=>!e.includes(t)).map(t=>F([...e,t]))}),te=c(F([]),N),I=e=>te.get(P(e)),L={id:`lane`,x:76,y:330,slotW:48,slotH:34,gap:6,max:6},R=372;function z(e,t,n){let r=[];[...d].forEach((e,t)=>r.push({id:`paper:${t}`,kind:`cell`,rect:{x:18+t*64,y:0,w:54,h:54},tone:`plain`,text:e,tag:`${t+1}번`}));let i=I([]);return r.push({id:P([]),kind:`cell`,rect:i,tone:`plain`,text:`""`},{id:`root:label`,kind:`text`,rect:{x:i.x+i.w+8,y:i.y,w:64,h:i.h},tone:`muted`,text:`빈 숫자`}),r.push({id:`lane:label`,kind:`text`,rect:{x:18,y:L.y,w:54,h:L.slotH},text:e},{id:`lane:bg`,kind:`zone`,rect:{x:L.x-4,y:L.y-3,w:L.max*(L.slotW+L.gap)+2,h:L.slotH+6}},{id:`calc`,kind:`text`,rect:{x:18,y:R,w:t,h:28},text:``},{id:`tally`,kind:`token`,rect:{x:n,y:R,w:84,h:28},tone:`chosen`,text:`소수 0개`}),{width:j,height:M,items:r}}var B=e=>({type:`wait`,ms:e}),V=(e,t,n=!1)=>({type:`set`,id:e,patch:t,...n?{pop:n}:{}}),H=(e,t,n=!1)=>V(e,{tone:t},n),U=e=>V(`calc`,{text:e}),W=(e,t=`chosen`)=>V(`tally`,{text:`소수 ${e}개`,tone:t},!0),G=()=>r([{type:`unfocus`},{type:`clearMarks`}]),K=(e,n)=>{let r=t(I(n),5);return e.has(`ring`)?V(`ring`,{rect:r}):{type:`add`,item:{id:`ring`,kind:`ring`,rect:r}}},q=(e,t,n=-1)=>[...d].flatMap((r,i)=>{let a=i===n?`current`:t.includes(i)?`visited`:`plain`;return e.get(`paper:${i}`).tone===a?[]:[H(`paper:${i}`,a)]}),J=e=>{let t=e.slice(0,-1);return`${t.length?p(m(t)):`빈 숫자`}에 ${e.at(-1)+1}번 종이 ${o(p(d[e.at(-1)]),`을`,`를`)} 붙여 ${o(p(m(e)),`을`,`를`)} 만듭니다.`},Y=e=>g[e+1]?.path.slice(0,-1)??[],ne=(e,t)=>t?`종이를 다 썼고 더 고를 갈래도 남지 않았습니다. 만들 수 있는 수 ${g.length}개를 모두 만들었습니다.`:`종이를 다 써서 더 붙일 수 없습니다. ${e.length?`${p(m(e))} 자리`:`맨 처음 자리`}로 돌아가 안 쓴 종이를 다시 고릅니다.`,re=(e,t,n)=>e.do(...r([...q(e,t),n?{type:`remove`,id:`ring`}:K(e,t)])),ie=(e,t,n)=>{let i=t.slice(0,-1),[a,o]=[I(i),I(t)];return r([{type:`add`,item:{id:P(t),kind:`cell`,rect:o,tone:`current`,text:n},from:P(i)},{type:`add`,item:{id:`e:${t.join(``)}`,kind:`line`,rect:ee,tone:`trail`,points:u(a,o)}},K(e,t)])};function X(e){let t=new a(z(e?`센 소수`:`모음`,e?214:290,e?238:316)),i=new s(t,L),c=[],u=new Map,_=[],x=!0,S=0,C=0,w=0,T,D=()=>({work:w,variables:e?{current:p(m(_)),rest:p(h(_)),count:S}:x?{current:p(m(_)),rest:p(h(_)),found:`{${c.join(`, `)}}`}:{found:`{${c.join(`, `)}}`,x:T??`-`,"소수 개수":C}});if(t.step({title:`빈 숫자에서 시작`,codeHighlights:e?A.start:E.start,...D()}),t.phase(`시작`,e?`종이 조각 ${n([...d].map(p).join(`, `))} 만들 수 있는 수를 모두 만들어 소수를 셉니다. 먼저 빈 숫자에서 시작합니다.`:`종이 조각 ${n([...d].map(p).join(`, `))} 만들 수 있는 수를 모두 만들어 봅니다. 먼저 빈 숫자에서 시작하고, 만든 수는 모음(집합)에 담습니다.`),t.do(K(t,[]),B(500)),g.forEach(({path:a,text:s,value:l},d)=>{let m=P(a),h=a.length===f,b=d===g.length-1,x=h?Y(d):void 0,C=!c.includes(l),T=v(l);!e&&C&&c.push(l),e&&(w+=T.tries,T.prime&&S++),_=x??a;let O=s===String(l)?`${o(p(s),`은`,`는`)} 정수 ${l}입니다.`:`${o(p(s),`은`,`는`)} 정수로 바꾸면 ${l}입니다.`;if(t.step({title:e?`${p(s)} → ${l}: ${T.prime?`소수, 센다`:`소수 아님`}`:`${p(s)} → ${l} (${C?`새 수`:`이미 있음`})`,codeHighlights:e?A.test[y(l)]:E.add,...D()}),t.phase(`이어 붙이기`,J(a),(e?A:E).pick),t.do(...q(t,a,a.at(-1))),t.do(...ie(t,a,s)),e){let e=T.prime?`${o(l,`은`,`는`)} 2부터 ${T.root}까지 나눠 봐도 나누어떨어지지 않아 소수입니다.`:l<2?`${o(l,`은`,`는`)} 2보다 작아 소수가 아닙니다.`:`${o(l,`은`,`는`)} ${n(T.divisor)} 나누어떨어져 소수가 아닙니다.`;t.phase(`소수 판정`,T.prime?`${e} 센 적이 있는 수인지는 따지지 않고 그냥 셉니다(소수 ${S}개).`:e,A.test[y(l)]);let s=T.prime?`${l} ÷ 2~${T.root}: 나누어떨어짐 없음`:l<2?`${l} < 2`:`${l} ÷ ${T.divisor} = ${l/T.divisor}`;t.do(...r([{type:`focus`,ids:[m]},U(s)])),T.prime?(i.push({id:`hit:${S}`,text:String(l),tone:`path`},m),t.do(...r([H(m,`path`,!0),W(S),...q(t,a)],!0))):t.do(...r([H(m,`explored`),...q(t,a)])),t.do({type:`unfocus`})}else if(t.phase(`모음에 넣기`,`${O} ${C?`모음에 없는 수라 넣습니다.`:`모음에 이미 있어 넣지 않습니다.`}`,E.add),C){let e=`val:${l}`;u.set(l,e),i.push({id:e,text:String(l),tone:`plain`},m),t.do(...r([H(m,`visited`),...q(t,a)],!0))}else t.do(...r([{type:`focus`,ids:[m]},H(m,`visited`)])),t.do({type:`arrow`,from:m,to:u.get(l),verdict:`seen`,label:`이미 있음`},B(200)),t.do(...G(),...q(t,a).map(e=>({...e,together:!0})));x&&(t.phase(`되돌리기`,ne(x,b),(e?A:E).back),re(t,x,b))}),e)return t.step({title:`${S}개로 셈 — 정답은 2개`,codeHighlights:A.done,...D(),answer:S,isKeyframe:!0}),t.phase(`비교`,`같은 수 11을 4번, 101을 2번 세어 ${S}개가 되었습니다. 서로 다른 소수는 11과 101 두 개뿐이라 정답은 2입니다. 만든 수를 집합에 담아 중복을 없애야 합니다.`),t.do(...r([W(S,`bad`),U(`서로 다른 소수: 11, 101`)])),t.do({type:`add`,item:{id:`truth`,kind:`token`,rect:{x:330,y:R,w:72,h:28},tone:`good`,text:`정답 2개`}}),l(t.finish());x=!1;let O=[];for(let e of c)e<2&&(O.at(-1)?.[0]??2)<2?O.at(-1).push(e):O.push([e]);for(let e of O){let[i]=e,a=v(i),s=e.map(e=>u.get(e)),c=y(i);T=i,w+=a.tries,a.prime&&C++;let l=i<2?`${e.join(`, `)} < 2`:a.prime?`${i} ÷ 2~${a.root}: 나누어떨어짐 없음`:`${i} ÷ ${a.divisor} = ${i/a.divisor}`,d=i<2?`${e.length>1?`${b(e[0],e[1])}은`:o(i,`은`,`는`)} 2보다 작아 나눠 볼 것도 없이 소수가 아닙니다.`:a.prime?`${o(i,`을`,`를`)} 2부터 ${a.root}까지 ${a.tries}번 나눠 봅니다. 나머지가 모두 0이 아니라 나누어떨어지는 수가 없습니다.`:`${o(i,`을`,`를`)} ${n(a.divisor)} 나누면 ${i/a.divisor}, 나머지 0입니다. 나누어떨어집니다.`;t.step({title:e.length>1?`${e.join(`, `)} → 소수 아님`:`${i} → ${a.prime?`소수 (나눗셈 ${a.tries}번)`:`소수 아님`}`,codeHighlights:E.test[c],...D()}),t.phase(`나눠 보기`,d,E.test[c]),t.do(...r([...s.map(e=>H(e,`current`)),{type:`focus`,ids:[]},U(l)])),t.phase(`판정하기`,a.prime?`${o(i,`은`,`는`)} 소수입니다. 지금까지 소수 ${C}개.`:`${e.length>1?`둘 다`:o(i,`은`,`는`)} 소수가 아닙니다. 지금까지 소수 ${C}개.`,E.test[c]),t.do(...r([...s.map(e=>H(e,a.prime?`path`:`explored`,!0)),W(C)]),{type:`unfocus`})}T=void 0;let k=c.filter(e=>v(e).prime);return t.step({title:`소수 ${C}개`,codeHighlights:E.done,...D(),answer:C,isKeyframe:!0}),t.phase(`세기`,`모음 ${c.length}개 중 소수는 ${k.length===2?b(k[0],k[1]):k.join(`, `)}, 모두 ${C}개입니다. 서로 다른 수만 판정해 나눗셈은 ${w}번이면 됩니다.`),t.do(...r([W(C,`path`),U(`소수 ${k.join(`, `)}`)])),l(t.finish())}var Z=Number([...d].sort().reverse().join(``)),ae=432,oe=406,Q=e=>`s:${e}`,se=e=>({x:8+e%12*35,y:16+Math.floor(e/12)*29,w:32,h:26}),$=322,ce=e({x:66,y:$,w:48,h:34,gap:6});function le(){return{width:ae,height:oe,items:[{id:`lane:label`,kind:`text`,rect:{x:8,y:$,w:54,h:34},text:`모음`},{id:`lane:bg`,kind:`zone`,rect:{x:62,y:319,w:326,h:40}},{id:`calc`,kind:`text`,rect:{x:8,y:370,w:310,h:28},text:``},{id:`tally`,kind:`token`,rect:{x:340,y:370,w:84,h:28},tone:`chosen`,text:`소수 0개`}]}}function ue(){let e=new a(le()),t=new Set([0,1]),n=new Set([0,1]),i=[],s=0,c=0,u=0,d,f=()=>({work:s,variables:{limit:Z,p:c||`-`,found:i.length?`{${i.join(`, `)}}`:`-`,x:d??`-`,"지운 횟수":s}}),p=(e,t)=>({id:Q(e),kind:`token`,rect:se(e),tone:t,text:String(e)});e.step({title:`0~${Z} 소수표 만들기`,codeHighlights:O.table,...f()}),e.phase(`표 만들기`,`종이를 큰 숫자부터 이어 붙이면 만들 수 있는 가장 큰 수 ${Z}이 됩니다. 0부터 ${Z}까지 소수 후보로 두고, 0과 1은 소수가 아니라 바로 지웁니다.`,O.table),e.do(...r(Array.from({length:Z+1},(e,t)=>({type:`add`,item:p(t,t<2?`explored`:`plain`)}))));let m=[],h=Math.floor(Math.sqrt(Z));for(let i=2;i<=h;i++){if(t.has(i)){m.push(i);continue}let a=[];for(let e=i*i;e<=Z;e+=i)a.push(e);let l=a.filter(e=>t.has(e)).length;a.forEach(e=>t.add(e)),c=i,s+=a.length,e.step({title:`p = ${i}: ${i}의 배수 ${a.length}번 지우기`,codeHighlights:O.round,...f()}),e.phase(`표 만들기`,`${m.length?`${x(m,`은`,`는`)} 이미 지워져 건너뜁니다. `:``}${o(i,`은`,`는`)} 지워지지 않았으니 소수입니다. ${i} × ${i} = ${i*i}부터 ${a.slice(0,3).join(`, `)}, … 를 ${a.length}번 지웁니다.${l?` 이 중 ${l}칸은 이미 지워져 있습니다.`:``}`,O.round),m.length=0,e.do(H(Q(i),`current`)),e.do(...r(a.map(e=>H(Q(e),`explored`)))),e.do(H(Q(i),`visited`)),n.add(i)}let _=Array.from({length:Z+1},(e,t)=>t).filter(e=>!t.has(e));e.step({title:`표 완성: ${Z} 이하 소수 ${_.length}개`,codeHighlights:O.finish,...f()}),e.phase(`표 만들기`,`${m.length?`${m.join(`, `)}도 이미 지워진 수라 건너뜁니다. `:``}${h+1} × ${h+1} = ${o((h+1)**2,`이`,`가`)} ${Z}보다 커서 더 지울 것이 없습니다. 남은 ${_.length}개가 ${Z} 이하의 소수입니다.`,O.finish),e.do(...r(_.filter(e=>!n.has(e)).map(e=>H(Q(e),`visited`)))),e.do(U(`${Z} 이하 소수 ${_.length}개`));for(let{value:e}of g)i.includes(e)||i.push(e);c=0,e.step({title:`순열로 만든 수 ${g.length}개 → 서로 다른 수 ${i.length}개`,codeHighlights:O.collect,...f()}),e.phase(`수 모으기`,`정석과 똑같이 종이를 이어 붙여 만든 수 ${g.length}개를 집합에 담습니다. 앞의 0이 떨어지고 같은 수가 합쳐져 ${i.join(`, `)} 여섯 개가 남습니다.`,O.collect),e.do(...r(i.map((e,t)=>({type:`add`,item:{id:`val:${e}`,kind:`token`,rect:ce(t),tone:`plain`,text:String(e)}}))));for(let t of i){let n=v(t);d=t,n.prime&&u++,e.step({title:`표[${t}] → ${n.prime?`소수`:`소수 아님`}`,codeHighlights:O.look,...f()}),e.phase(`표 조회`,`소수표에서 ${t}번 칸을 찾아봅니다. ${t}번 칸은 ${n.prime?`지워지지 않고 남아 있어 소수입니다.`:`지워져 있어 소수가 아닙니다.`}`,O.look),e.do(H(`val:${t}`,`current`)),e.do({type:`arrow`,from:`val:${t}`,to:Q(t),verdict:n.prime?`good`:`bad`,label:n.prime?`소수`:`지워짐`},B(300)),e.do(...r([H(`val:${t}`,n.prime?`path`:`explored`,!0),W(u),{type:`clearMarks`}]))}d=void 0;let y=i.filter(e=>v(e).prime);return e.step({title:`소수 ${u}개`,codeHighlights:O.done,...f(),answer:u,isKeyframe:!0}),e.phase(`세기`,`모음 ${i.length}개 중 소수는 ${y.length===2?b(y[0],y[1]):y.join(`, `)}, 모두 ${u}개입니다. 정답은 정석과 같지만 표를 만드느라 ${s}번을 지웠습니다.`),e.do(...r([W(u,`path`),U(`소수 ${y.join(`, `)}`)])),l(e.finish())}var de={id:`prime-finder`,title:`소수 찾기`,level:2,category:`brute-force`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42839`,description:{summary:`한 자리 숫자가 하나씩 적힌 종이 조각들이 있습니다. 조각을 이어 붙여 만들 수 있는 수 가운데 소수가 몇 개인지 구합니다. 앞에 0이 붙은 수는 0을 뗀 수와 같은 수로 보고, 같은 수는 한 번만 셉니다.`,rules:[`numbers는 길이 1 이상 7 이하의 문자열`,`numbers는 0부터 9까지의 숫자로만 이루어짐`,`"013"은 0, 1, 3이 적힌 종이 조각이 흩어져 있다는 뜻`,`11과 011은 같은 숫자로 취급`],examples:[{input:`numbers = "17"`,output:`3`},{input:`numbers = "011"`,output:`2`}]},keyIntuitions:[`종이가 최대 7장이라 만들 수 있는 수는 모두 합쳐 13,699개(7 + 42 + 210 + 840 + 2,520 + 5,040 + 5,040)뿐입니다. 전부 만들어 보는 완전탐색이 가능합니다.`,`"011"과 "11"처럼 앞의 0이 붙어도, 같은 숫자 종이를 바꿔 붙여도 같은 수가 나옵니다. 정수로 바꿔 집합에 담으면 한 번씩만 판정합니다.`,`소수 판정은 2부터 √n까지만 나눠 보면 됩니다. n이 합성수라면 √n 이하의 약수가 반드시 하나는 있기 때문입니다.`],demo:{input:[d],label:`numbers = "011"`},workUnit:`나누거나 지운 횟수`,approaches:[{id:`prime-permutation`,name:`순열로 수를 모두 만들고 소수 판정`,rank:`BEST`,timeComplexity:`O(P × √M)`,spaceComplexity:`O(P)`,verdict:`종이로 만들 수 있는 수를 빠짐없이 만든 뒤, 집합으로 중복을 없애고 제곱근까지만 나눠 소수를 가립니다.`,pros:[`종이가 7장이어도 만드는 수가 1만 4천 개 이하(P)라 모두 만들어 봐도 충분합니다.`,`정수로 바꿔 집합에 담아 같은 수를 한 번만 판정합니다.`,`제곱근까지만 나누므로 수 하나를 판정하는 데 최대 3,000번 남짓이면 끝납니다.`],cons:[`순열 만들기와 소수 판정을 따로 짜야 해서 코드가 두 덩어리입니다.`,`앞에 0이 붙은 수("011" → 11)처럼 같은 수가 여러 번 만들어지는 점을 챙겨야 합니다.`],whyThisRank:`입력이 7자리 이하라 완전탐색이 가능합니다. 집합과 제곱근 판정, 이 두 가지만 챙기면 가장 단순하고 확실한 풀이입니다.`,code:w,visualize:()=>X(!1)},{id:`prime-sieve`,name:`체로 소수표를 먼저 만들고 조회`,rank:`ALTERNATIVE`,timeComplexity:`O(M log log M + P)`,spaceComplexity:`O(M)`,verdict:`만들 수 있는 가장 큰 수까지 소수표를 미리 만들어 두고, 만든 수마다 표를 조회합니다.`,pros:[`소수 판정이 표 조회 한 번(O(1))이라 판정할 수가 많아도 빠릅니다.`,`소수표를 한 번 만들면 다른 수에도 그대로 다시 쓸 수 있습니다.`],cons:[`7자리면 천만 칸이 넘는 표를 만들어야 해서 메모리를 많이 씁니다.`,`만든 수가 몇 개 안 될 때에도 표 전체를 채우는 비용이 먼저 듭니다.`],whyThisRank:`판정할 수는 많아야 1만 4천 개인데 표는 천만 칸입니다. 판정을 몇 번 하지 않는 이 문제에서는 정석의 제곱근 판정이 더 가볍습니다.`,code:D,visualize:ue},{id:`prime-duplicates`,name:`중복을 거르지 않고 소수를 센다`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(P × √M)`,spaceComplexity:`O(N) 재귀 스택`,verdict:`같은 수가 여러 번 만들어지는데 그대로 세어서 답이 부풀려지는 오답 풀이입니다.`,pros:[`정석과 코드 모양이 거의 같고, 집합이 없어 조금 더 짧습니다.`],cons:[`"011"에서는 11이 네 번, 101이 두 번 만들어져 6개로 세어 정답 2와 다릅니다.`,`같은 수를 매번 다시 판정하느라 나눗셈도 더 합니다.`,`예제 "17"처럼 숫자가 모두 달라 중복이 없는 입력은 통과해서 실수를 알아채기 어렵습니다.`],whyThisRank:`종이가 다르면 순열은 다른 경우지만, 만든 수가 같으면 한 번만 세어야 합니다. 정수로 바꾼 값을 집합에 담아 중복을 없애면 정석이 됩니다.`,code:k,visualize:()=>X(!0)}],checks:{cases:[{args:[`17`],expected:3},{args:[`011`],expected:2},{args:[`1`],expected:0},{args:[`7`],expected:1},{args:[`000`],expected:0},{args:[`2`],expected:1},{args:[`013`],expected:4},{args:[`1231`],expected:18}],random:e=>{let t=1+Math.floor(e()*5),n=e()<.5?5:10;return[Array.from({length:t},()=>String(Math.floor(e()*n))).join(``)]}}};export{de as default};