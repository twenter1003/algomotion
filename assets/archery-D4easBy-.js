import{c as e,i as t,l as n,r}from"./shared-CL29HWIp.js";import{c as i,n as a,o,r as s}from"./common-T-bldLC7.js";var c=5,l=[2,1,1,1,0,0,0,0,0,0,0],u=11,d=e=>10-e,f=e=>`[${e.join(`, `)}]`,p=e=>{let t=e.map((e,t)=>e>l[t]?`R`:l[t]>0?`A`:`-`),n=e=>t.reduce((t,n,r)=>t+(n===e?d(r):0),0);return{owner:t,ryan:n(`R`),apeach:n(`A`),gap:n(`R`)-n(`A`)}},m=(e,t)=>{for(let n=10;n>=0;n--)if(e[n]!==t[n])return e[n]>t[n];return!1},h=(e,t,n)=>{let r=p(e).gap;return r>t||r===t&&r>0&&m(e,n)},g=[];{let e=Array(u).fill(0),t=(n,r)=>{n===10?(e[10]=r,g.push([...e]),e[10]=0):(r>l[n]&&(e[n]=l[n]+1,t(n+1,r-e[n]),e[n]=0),t(n+1,r))};t(0,c)}var _=Array.from({length:1024},(e,t)=>{let n=Array(u).fill(0);for(let e=0;e<10;e++)t>>e&1&&(n[e]=l[e]+1);let r=n.reduce((e,t)=>e+t,0);return r>c?null:(n[10]=c-r,n)}),v=e=>{let t=0,n=[-1],r=[];return e.forEach((e,i)=>{e&&h(e,t,n)&&(t=p(e).gap,n=e,r.push(i))}),{at:r,best:t,answer:n}},y=v(g),b=v(_),x=y.answer,S=g[0],C=`def score_gap(ryan, info):
    # 라이언이 얻은 점수 - 어피치가 얻은 점수
    gap = 0
    for k in range(11):
        if ryan[k] > info[k]:
            gap += 10 - k  # 라이언이 이긴 점수
        elif info[k] > 0:
            gap -= 10 - k  # 어피치가 가져간 점수
    return gap

def lower_is_better(a, b):
    # 낮은 점수(뒤쪽)부터 비교해 화살이 더 많은 쪽이 낫습니다
    for k in range(10, -1, -1):
        if a[k] != b[k]:
            return a[k] > b[k]
    return False
`,w=`// 라이언이 얻은 점수 - 어피치가 얻은 점수
function scoreGap(ryan, info) {
  let gap = 0;
  for (let k = 0; k < 11; k++) {
    if (ryan[k] > info[k]) gap += 10 - k; // 라이언이 이긴 점수
    else if (info[k] > 0) gap -= 10 - k; // 어피치가 가져간 점수
  }
  return gap;
}

// 낮은 점수(뒤쪽)부터 비교해 화살이 더 많은 쪽이 낫습니다
function lowerIsBetter(a, b) {
  for (let k = 10; k >= 0; k--) {
    if (a[k] !== b[k]) return a[k] > b[k];
  }
  return false;
}
`,T={python:`${C}
def solution(n, info):
    best = 0  # 지금까지의 가장 큰 점수 차이
    answer = [-1]
    ryan = [0] * 11

    def dfs(k, left):
        nonlocal best, answer
        if k == 10:
            ryan[10] = left  # 남은 화살은 모두 0점에
            gap = score_gap(ryan, info)
            if gap > best or (gap == best and gap > 0 and lower_is_better(ryan, answer)):
                best = gap
                answer = ryan[:]
            ryan[10] = 0
            return
        if left > info[k]:  # 어피치보다 한 발 더 쏠 수 있으면 이겨 봅니다
            ryan[k] = info[k] + 1
            dfs(k + 1, left - ryan[k])
            ryan[k] = 0
        dfs(k + 1, left)  # 이 점수는 포기합니다

    dfs(0, n)
    return answer`,javascript:`${w}
function solution(n, info) {
  let best = 0; // 지금까지의 가장 큰 점수 차이
  let answer = [-1];
  const ryan = Array(11).fill(0);

  const dfs = (k, left) => {
    if (k === 10) {
      ryan[10] = left; // 남은 화살은 모두 0점에
      const gap = scoreGap(ryan, info);
      if (gap > best || (gap === best && gap > 0 && lowerIsBetter(ryan, answer))) {
        best = gap;
        answer = [...ryan];
      }
      ryan[10] = 0;
      return;
    }
    if (left > info[k]) { // 어피치보다 한 발 더 쏠 수 있으면 이겨 봅니다
      ryan[k] = info[k] + 1;
      dfs(k + 1, left - ryan[k]);
      ryan[k] = 0;
    }
    dfs(k + 1, left); // 이 점수는 포기합니다
  };

  dfs(0, n);
  return answer;
}`},E={start:t(T,[`best = 0`,`dfs(0, n)`],[`let best = 0`,`dfs(0, n)`]),look:t(T,[`if left > info[k]:`],[`if (left > info[k])`]),win:t(T,[`if left > info[k]:`,`ryan[k] = info[k] + 1`,`dfs(k + 1, left - ryan[k])`],[`if (left > info[k])`,`ryan[k] = info[k] + 1`,`dfs(k + 1, left - ryan[k])`]),skip:t(T,[`if left > info[k]:`,`dfs(k + 1, left)  #`],[`if (left > info[k])`,`dfs(k + 1, left); //`]),leaf:t(T,[`if k == 10:`,`ryan[10] = left`,`gap = score_gap(ryan, info)`],[`if (k === 10)`,`ryan[10] = left`,`const gap = scoreGap(ryan, info)`]),compare:t(T,[`if gap > best or`,`best = gap`,`answer = ryan[:]`],[`if (gap > best ||`,`best = gap`,`answer = [...ryan]`]),back:t(T,[`ryan[k] = 0`,`dfs(k + 1, left)  #`],[`ryan[k] = 0`,`dfs(k + 1, left); //`]),done:t(T,[`dfs(0, n)`,`return answer`],[`dfs(0, n)`,`return answer`])},D={python:`${C}
def solution(n, info):
    best = 0
    answer = [-1]
    for mask in range(1 << 10):  # 10점~1점을 이길지 말지 고르는 모든 경우(2^10가지)
        ryan = [0] * 11
        for k in range(10):
            if mask >> k & 1:
                ryan[k] = info[k] + 1  # 이기려면 어피치보다 한 발 더
        need = sum(ryan)
        if need > n:
            continue  # 화살이 모자란 경우는 건너뜁니다
        ryan[10] = n - need  # 남은 화살은 모두 0점에
        gap = score_gap(ryan, info)
        if gap > best or (gap == best and gap > 0 and lower_is_better(ryan, answer)):
            best = gap
            answer = ryan
    return answer`,javascript:`${w}
function solution(n, info) {
  let best = 0;
  let answer = [-1];
  for (let mask = 0; mask < 1 << 10; mask++) { // 10점~1점을 이길지 말지 고르는 모든 경우(2^10가지)
    const ryan = Array(11).fill(0);
    for (let k = 0; k < 10; k++) {
      if ((mask >> k) & 1) ryan[k] = info[k] + 1; // 이기려면 어피치보다 한 발 더
    }
    const need = ryan.reduce((s, x) => s + x, 0);
    if (need > n) continue; // 화살이 모자란 경우는 건너뜁니다
    ryan[10] = n - need; // 남은 화살은 모두 0점에
    const gap = scoreGap(ryan, info);
    if (gap > best || (gap === best && gap > 0 && lowerIsBetter(ryan, answer))) {
      best = gap;
      answer = ryan;
    }
  }
  return answer;
}`},O={start:t(D,[`best = 0`,`for mask in range(1 << 10)`],[`let best = 0`,`for (let mask = 0`]),make:t(D,[`for mask in range(1 << 10)`,`ryan[k] = info[k] + 1`,`need = sum(ryan)`],[`for (let mask = 0`,`ryan[k] = info[k] + 1`,`const need = ryan.reduce`]),short:t(D,[`need = sum(ryan)`,`if need > n:`,`continue`],[`const need = ryan.reduce`,`if (need > n) continue`]),score:t(D,[`ryan[10] = n - need`,`gap = score_gap(ryan, info)`],[`ryan[10] = n - need`,`const gap = scoreGap(ryan, info)`]),compare:t(D,[`if gap > best or`,`best = gap`,`answer = ryan`],[`if (gap > best ||`,`best = gap`,`answer = ryan`]),done:t(D,[`return answer`],[`return answer`])},k={python:`${C}
# 주의: 높은 점수부터 이길 수 있으면 무조건 이기는 오답 풀이입니다
def solution(n, info):
    ryan = [0] * 11
    left = n
    for k in range(10):  # 10점부터 1점까지
        if left > info[k]:
            ryan[k] = info[k] + 1  # 이길 수 있으면 이깁니다
            left -= ryan[k]
    ryan[10] = left  # 남은 화살은 0점에
    return ryan if score_gap(ryan, info) > 0 else [-1]`,javascript:`${w}
// 주의: 높은 점수부터 이길 수 있으면 무조건 이기는 오답 풀이입니다
function solution(n, info) {
  const ryan = Array(11).fill(0);
  let left = n;
  for (let k = 0; k < 10; k++) { // 10점부터 1점까지
    if (left > info[k]) {
      ryan[k] = info[k] + 1; // 이길 수 있으면 이깁니다
      left -= ryan[k];
    }
  }
  ryan[10] = left; // 남은 화살은 0점에
  return scoreGap(ryan, info) > 0 ? ryan : [-1];
}`},A={start:t(k,[`ryan = [0] * 11`,`left = n`],[`const ryan = Array(11)`,`let left = n`]),look:t(k,[`for k in range(10):`,`if left > info[k]:`],[`for (let k = 0; k < 10; k++)`,`if (left > info[k])`]),win:t(k,[`if left > info[k]:`,`ryan[k] = info[k] + 1`,`left -= ryan[k]`],[`if (left > info[k])`,`ryan[k] = info[k] + 1`,`left -= ryan[k]`]),skip:t(k,[`for k in range(10):`,`if left > info[k]:`],[`for (let k = 0; k < 10; k++)`,`if (left > info[k])`]),rest:t(k,[`ryan[10] = left`],[`ryan[10] = left`]),done:t(k,[`return ryan if score_gap(ryan, info) > 0 else [-1]`],[`return scoreGap(ryan, info) > 0 ? ryan : [-1]`])},j=420,M=300,N={a:40,r:86,d:132,b:222},P=e=>62+e*32,F=(e,t)=>({x:P(t),y:N[e],w:30,h:38}),I=(e,t)=>`${e}:${t}`,L=(e,t,n)=>({id:`lab:${e}`,kind:`text`,rect:{x:2,y:t,w:58,h:38},tone:`muted`,text:n}),R=(e,t,n,r,i)=>({id:`t:${e}`,kind:`token`,rect:{x:t,y:180,w:n,h:30},tone:i,text:r}),z=e=>o(`calc`,{text:e});function B(e,t){let n=[{id:`title`,kind:`text`,rect:{x:2,y:0,w:412,h:16},tone:`muted`,text:e}];n.push({id:`lab:s`,kind:`text`,rect:{x:2,y:20,w:58,h:16},tone:`muted`,text:`점수`},L(`a`,40,`어피치`),L(`r`,86,`라이언`),L(`d`,132,`얻은 점수`),L(`b`,222,t));for(let e=0;e<u;e++)n.push({id:I(`h`,e),kind:`text`,rect:{x:P(e),y:20,w:30,h:16},text:String(d(e))},{id:I(`a`,e),kind:`cell`,rect:F(`a`,e),tone:l[e]?`plain`:`explored`,text:String(l[e])},{id:I(`r`,e),kind:`cell`,rect:F(`r`,e),tone:`plain`,text:``},{id:I(`d`,e),kind:`cell`,rect:F(`d`,e),tone:`plain`,text:``},{id:I(`b`,e),kind:`cell`,rect:F(`b`,e),tone:`plain`,text:``});return n.push(R(`left`,8,104,`남은 화살 ${c}`,`chosen`),R(`ryan`,118,96,`라이언 0`,`plain`),R(`apeach`,220,96,`어피치 ${p(Array(u).fill(0)).apeach}`,`plain`),R(`gap`,322,90,`차이 0`,`plain`),{id:`calc`,kind:`text`,rect:{x:8,y:268,w:404,h:26},text:``}),{width:j,height:M,items:n}}var V=(e,t,n,r=!1)=>t.map((t,i)=>o(I(e,i),{text:String(t),tone:n[i]},r)),H=e=>V(e,Array(u).fill(``),Array(u).fill(`plain`)),U=(e,t)=>e.map(e=>e>0?t:`explored`),W=e=>{let{owner:t}=p(e);return V(`d`,t.map((e,t)=>e===`-`?``:d(t)),t.map(e=>e===`R`?`visited`:e===`A`?`bad`:`plain`),!0)},G=e=>{let t=p(e);return[o(`t:ryan`,{text:`라이언 ${t.ryan}`},!0),o(`t:apeach`,{text:`어피치 ${t.apeach}`},!0),o(`t:gap`,{text:`차이 ${t.gap>0?`+`:``}${t.gap}`,tone:t.gap>0?`good`:`bad`},!0)]},K=e=>`${e>0?`+`:``}${e}`,q=(e,t,n)=>r(K(e),t,n),J=e=>e.map(e=>`${e}점`).join(`, `),Y=(e,t)=>`${d(e)}점: 어피치가 ${l[e]}발이라 ${l[e]+1}발을 쏘면 이깁니다. 남은 화살 ${t}발로 쏠 수 있습니다.`;function X(t,n,r,s,c){t.phase(`살피기`,Y(n,r),s),t.do({type:`focus`,ids:[I(`a`,n),I(`r`,n)]}),t.do({type:`arrow`,from:I(`a`,n),to:I(`r`,n),verdict:`good`,label:`${l[n]+1}발이면 이김`},i(200)),t.phase(`쏘기`,`${l[n]+1}발을 쏘아 ${d(n)}점을 가져옵니다. 남은 화살은 ${r} − ${l[n]+1} = ${r-l[n]-1}발입니다.`,c),t.do(...a()),t.do(...e([o(I(`r`,n),{tone:`visited`,text:String(l[n]+1)},!0),o(`t:left`,{text:`남은 화살 ${r-l[n]-1}`},!0)]),i(450))}function Z(){let t=new n(B(`점수마다 이길지 포기할지 정합니다 · 화살 ${c}발`,`최고 기록`)),a=0,m=0,h=0,_=c,v=Array(u).fill(0),b=()=>({work:a,variables:{k:h,left:_,ryan:f(v),best:m}}),x=g[0];t.step({title:`dfs(0, 5)에서 시작`,codeHighlights:E.start,...b()}),t.phase(`시작`,`어피치가 이미 쏜 화살(${f(l)})을 보고, 라이언은 점수마다 이길지 포기할지 정합니다. 이기려면 어피치보다 한 발 더 쏴야 하고, 남은 화살은 모두 0점에 놓습니다. 먼저 높은 점수부터 이겨 봅니다.`,E.start),t.do(i(300));for(let e=0;e<10&&_>l[e];e++){let n=l[e]+1,r=_;_-=n,v=v.map((t,r)=>r===e?n:t),h=e+1,t.step({title:`${d(e)}점: ${n}발로 이김, 남은 화살 ${_}`,codeHighlights:E.win,...b()}),X(t,e,r,E.look,E.win)}let S=0;x.forEach((e,t)=>{t<10&&e>0&&(S=t)});let C=S+1;h=10,t.step({title:`${d(C)}점~1점: 화살이 없어 포기`,codeHighlights:E.skip,...b()}),t.phase(`빨리 감기`,`${d(C)}점부터 1점까지는 남은 화살이 ${_}발이라 어피치보다 한 발 더 쏠 수 없습니다. 모두 포기하고 맨 끝(0점)에 이릅니다.`,E.skip),t.do(...e(Array.from({length:10-C},(e,t)=>o(I(`r`,C+t),{text:`0`,tone:`explored`}))));let w=(n,r,i,a)=>{let o=p(n);t.phase(`점수 계산`,`점수마다 비교합니다. 라이언이 이긴 점수는 ${J(o.owner.flatMap((e,t)=>e===`R`?[d(t)]:[]))}, 어피치가 가져간 점수는 ${J(o.owner.flatMap((e,t)=>e===`A`?[d(t)]:[]))}입니다. 라이언 ${o.ryan}점, 어피치 ${o.apeach}점으로 차이는 ${K(o.gap)}입니다.`,E.leaf),t.do(...e(W(n))),t.do(...e(G(n))),t.phase(`비교하기`,i?a?`지금까지 이긴 배분이 없으니 차이 ${q(o.gap,`이`,`가`)} 새 최고 기록입니다.`:`차이 ${q(o.gap,`이`,`가`)} 지금까지의 최고 ${K(r)}보다 커서 새 최고 기록입니다.`:`차이 ${q(o.gap,`은`,`는`)} 최고 기록을 넘지 못합니다.`,E.compare),i&&t.do(...e([...V(`b`,n,n.map(e=>e>0?`good`:`plain`),!0),z(`최고 기록: 차이 ${K(o.gap)} ${f(n)}`)]))};a=1,v=[...x],_=0,m=p(x).gap,t.step({title:`첫 배분 ${f(x)} → 차이 ${K(m)}`,codeHighlights:E.compare,...b()}),t.phase(`배분하기`,`맨 끝(0점)에 남은 화살 ${x[10]}발을 놓아 첫 배분이 끝났습니다. 이제 점수를 계산합니다.`,E.leaf),t.do(...e([o(I(`r`,10),{text:String(x[10]),tone:x[10]?`visited`:`explored`},!0),o(`t:left`,{text:`남은 화살 0`},!0)])),w(x,0,!0,!0);let T=1,D=m,O=y.at.slice(1);for(let n of[...O,g.length]){let r=n-T;if(r>0&&(a+=r,t.step({title:`배분 ${T+1}~${n}번째 빨리 감기`,codeHighlights:E.back,...b()}),t.phase(`빨리 감기`,`되돌아가며 이겼던 점수를 포기로 바꿔 배분 ${r}가지를 더 살펴봅니다. 모두 차이가 ${K(D)} 이하이고, 같은 차이일 때도 낮은 점수에 화살이 더 많은 쪽이 아니라서 최고 기록은 그대로입니다.`,E.back),t.do(...e([...H(`r`),...H(`d`),o(`t:left`,{text:`남은 화살 -`}),z(`배분 ${T+1}~${n}번째: ${r}가지 모두 탈락`)]))),n===g.length)break;let i=g[n],s=p(i);a+=1,v=[...i],m=s.gap,t.step({title:`배분 ${n+1}번째 ${f(i)} → 차이 ${K(s.gap)}`,codeHighlights:E.compare,...b()}),t.phase(`배분하기`,`${i.flatMap((e,t)=>e>0&&t<10?[`${d(t)}점 ${e}발`]:[]).join(`, `)}${i[10]?`, 0점 ${i[10]}발`:``}로 쏘는 배분입니다. 화살 ${i.reduce((e,t)=>e+t,0)}발을 모두 씁니다.`,E.win),t.do(...e([...V(`r`,i,U(i,`visited`),!0),...H(`d`),o(`t:left`,{text:`남은 화살 0`},!0)])),w(i,D,!0,!1),D=s.gap,T=n+1}return v=y.answer,h=0,t.step({title:`차이 ${K(m)}: ${f(y.answer)}`,codeHighlights:E.done,...b(),answer:y.answer,isKeyframe:!0}),t.phase(`결과`,`배분 ${g.length}가지를 모두 살펴 가장 큰 차이 ${K(m)}인 ${r(f(y.answer),`을`,`를`)} 찾았습니다. 높은 점수부터 이기는 첫 배분(차이 ${K(p(x).gap)})보다 9점, 8점, 6점을 이기는 쪽이 낫습니다.`,E.done),t.do(...e([...V(`b`,y.answer,y.answer.map(e=>e>0?`path`:`plain`),!0),...H(`r`),...H(`d`),z(`답 ${f(y.answer)}`)])),s(t.finish())}function Q(){let t=new n(B(`이길 점수를 10점~1점 중에서 고르는 모든 경우 (마스크 0 ~ 1023)`,`최고 기록`)),a=0,c=0,m=0,g=Array(u).fill(0),v=()=>({work:a,variables:{mask:m,ryan:f(g),best:c}}),y=e=>e.toString(2).padStart(10,`0`);t.step({title:`마스크 1024가지 만들기`,codeHighlights:O.start,...v()}),t.phase(`시작`,`10점부터 1점까지 점수마다 이길지(1) 포기할지(0)를 비트 하나로 놓으면 모두 2^10 = 1024가지입니다. 마스크 0부터 1023까지 하나씩 배분을 만들어 점수 차이를 견줍니다.`,O.start),t.do(i(300));let x=[0,...b.at.filter(e=>e>0)],S=0,C=0,w=[-1];for(let n of[...x,_.length]){if(n>S){let r=_.slice(S,n),i=r.filter(e=>!e).length;a+=r.length,m=n-1,t.step({title:`마스크 ${S}~${n-1} 빨리 감기`,codeHighlights:O.short,...v()}),t.phase(`빨리 감기`,`마스크 ${S}번부터 ${n-1}번까지 ${r.length}가지를 살핍니다. ${i?`${i}가지는 화살이 모자라 건너뛰고`:``}${i&&r.length>i?`, `:``}${r.length>i?`${i?`나머지는`:`모두`} 점수 차이가 최고 기록 ${q(C,`을`,`를`)} 넘지 못합니다`:``}.`,O.short),t.do(...e([...H(`r`),...H(`d`),z(`마스크 ${S}~${n-1}: ${r.length}가지 확인`)]))}if(n===_.length)break;let i=_[n],s=p(i),u=h(i,C,w);a+=1,m=n,g=[...i],u&&(c=s.gap),t.step({title:`마스크 ${n}: ${f(i)} → 차이 ${K(s.gap)}${u?`, 새 최고`:``}`,codeHighlights:u?O.compare:O.score,...v()});let b=i.flatMap((e,t)=>e>l[t]?[d(t)]:[]);t.phase(`배분하기`,`마스크 ${r(n,`은`,`는`)} 이진수 ${y(n)}입니다. ${b.length?`1인 자리의 점수(${J(b)})를 이기도록 쏘면 화살 ${i.reduce((e,t)=>e+t,0)-i[10]}발이 들고`:`1인 자리가 없어 이기는 점수가 없고`}, 남은 ${i[10]}발은 0점에 놓습니다.`,O.make),t.do(...e([...V(`r`,i,U(i,`visited`),!0),...H(`d`),o(`t:left`,{text:`남은 화살 ${i[10]}`},!0)])),t.phase(`점수 계산`,`점수마다 비교해 라이언 ${s.ryan}점, 어피치 ${s.apeach}점으로 차이는 ${K(s.gap)}입니다.`,O.score),t.do(...e(W(i))),t.do(...e(G(i))),t.phase(`비교하기`,u?`차이 ${q(s.gap,`이`,`가`)} 지금까지의 최고 ${K(C)}보다 커서 새 최고 기록입니다.`:`차이 ${q(s.gap,`은`,`는`)} 이기지 못하는 배분이라 최고 기록으로 삼지 않습니다.`,O.compare),u&&(t.do(...e([...V(`b`,i,i.map(e=>e>0?`good`:`plain`),!0),z(`최고 기록: 차이 ${K(s.gap)} ${f(i)}`)])),C=s.gap,w=i),S=n+1}return g=w,t.step({title:`차이 ${K(c)}: ${f(w)}`,codeHighlights:O.done,...v(),answer:w,isKeyframe:!0}),t.phase(`결과`,`마스크 1024가지를 모두 살펴 가장 큰 차이 ${K(c)}인 ${r(f(w),`을`,`를`)} 찾았습니다. 정답은 정석과 같지만, 화살이 모자란 ${_.filter(e=>!e).length}가지도 배분을 만들고 확인해야 했습니다.`,O.done),t.do(...e([...V(`b`,w,w.map(e=>e>0?`path`:`plain`),!0),...H(`r`),...H(`d`),z(`답 ${f(w)}`)])),s(t.finish())}function $(){let t=new n(B(`높은 점수부터 이길 수 있으면 무조건 이깁니다`,`정답`)),a=0,m=0,h=c,g=Array(u).fill(0),_=()=>({work:a,variables:{k:m,left:h,ryan:f(g)}});t.step({title:`10점부터 이길 수 있으면 이기기`,codeHighlights:A.start,..._()}),t.phase(`시작`,`점수가 높을수록 좋으니 10점부터 차례로, 어피치보다 한 발 더 쏠 수 있으면 무조건 이기기로 합니다. 화살이 ${c}발 있습니다.`,A.start),t.do(i(300));let v=0;for(;v<10&&h>l[v];v++){let e=l[v]+1,n=h;h-=e,g=g.map((t,n)=>n===v?e:t),m=v,t.step({title:`${d(v)}점: ${e}발로 이김, 남은 화살 ${h}`,codeHighlights:A.win,..._()}),X(t,v,n,A.look,A.win)}m=9,a=1,t.step({title:`${d(v)}점~1점: 화살이 없어 건너뜀`,codeHighlights:A.skip,..._()}),t.phase(`빨리 감기`,`${d(v)}점부터 1점까지는 남은 화살이 ${h}발이라 어피치보다 한 발 더 쏠 수 없어 건너뜁니다. 남은 화살 ${h}발은 0점에 놓습니다.`,A.skip),t.do(...e([...Array.from({length:10-v},(e,t)=>o(I(`r`,v+t),{text:`0`,tone:`explored`})),o(I(`r`,10),{text:String(h),tone:`explored`})]));let y=p(S),b=p(x);return t.step({title:`차이 ${K(y.gap)} — 정답은 ${K(b.gap)}`,codeHighlights:A.done,..._(),answer:S,isKeyframe:!0}),t.phase(`비교하기`,`${f(S)}을 돌려줍니다. 점수는 라이언 ${y.ryan}점, 어피치 ${y.apeach}점으로 차이 ${K(y.gap)}입니다. 하지만 9점, 8점, 6점을 이기면 라이언 ${b.ryan}점, 어피치 ${b.apeach}점으로 차이 ${K(b.gap)}입니다. 화살이 적게 드는 점수를 여러 개 이기는 편이 나을 수 있습니다.`.replace(`${f(S)}을`,r(f(S),`을`,`를`)),A.done),t.do(...e([...W(S),...G(S)])),t.do(...e([...V(`b`,x,x.map(e=>e>0?`good`:`plain`),!0),z(`내 답 차이 ${K(y.gap)} < 정답 차이 ${K(b.gap)}`)])),s(t.finish())}var ee={id:`archery`,title:`양궁대회`,level:2,category:`brute-force`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/92342`,description:{summary:`어피치와 라이언이 양궁으로 겨룹니다. 어피치가 화살 n발을 먼저 쏘고, 라이언이 n발을 쏩니다. 10점부터 1점까지 점수마다 화살을 더 많이 맞힌 쪽이 그 점수를 가져가고(같으면 어피치), 아무도 맞히지 않은 점수는 아무도 못 가져갑니다. 한 점수에 여러 발을 맞혀도 그 점수 한 번만 얻습니다. 라이언이 어피치를 가장 큰 점수 차이로 이기게 쏘는 방법을 구하고, 이길 수 없으면 [-1]을 돌려줍니다. 차이가 같은 방법이 여러 개면 가장 낮은 점수를 더 많이 맞힌 쪽을 고릅니다.`,rules:[`n은 1 이상 10 이하의 자연수`,`info는 길이 11인 배열이고, i번째 값은 어피치가 (10 − i)점을 맞힌 화살 수 (합은 n)`,`라이언이 이길 수 있으면 길이 11인 배열(합 n)로, 이길 수 없으면 [-1]을 반환`,`라이언이 이길 수 있는 방법이 여러 개면, 가장 낮은 점수를 더 많이 맞힌 방법을 반환`],examples:[{input:`n = 5, info = [2,1,1,1,0,0,0,0,0,0,0]`,output:`[0,2,2,0,1,0,0,0,0,0,0]`},{input:`n = 1, info = [1,0,0,0,0,0,0,0,0,0,0]`,output:`[-1]`},{input:`n = 9, info = [0,0,1,2,0,1,1,1,1,1,1]`,output:`[1,1,2,0,1,2,2,0,0,0,0]`},{input:`n = 10, info = [0,0,0,0,0,0,0,0,3,4,3]`,output:`[1,1,1,1,1,1,1,1,0,0,2]`}]},keyIntuitions:[`라이언은 점수마다 "어피치보다 한 발 더 쏴서 이길지, 한 발도 안 쏘고 포기할지" 둘 중 하나만 정하면 됩니다. 이기려고 어중간하게 쏘는 것은 화살만 낭비합니다. 10점~1점이면 경우가 2^10 = 1024가지뿐이라 모두 살펴볼 수 있습니다.`,`이길 점수를 정하고 남은 화살은 모두 0점에 놓으면 배분이 정해집니다. 라이언이 이긴 점수는 라이언이 얻고, 어피치가 맞혔는데 못 이긴 점수는 어피치가 얻습니다. 화살이 모자라면 그 가지는 더 내려가지 않고 포기만 합니다.`,`높은 점수부터 이기는 그리디는 틀립니다. 10점을 이기는 데 화살이 많이 들면, 그 화살로 9점과 8점 둘을 이기는 편이 점수 차이가 더 큽니다. 차이가 같을 때는 낮은 점수를 더 많이 맞힌 배분을 고르는 규칙도 챙겨야 합니다.`],demo:{input:[c,l],label:`n = 5, info = [2,1,1,1,0,0,0,0,0,0,0]`},workUnit:`살펴본 배분 수`,approaches:[{id:`archery-backtracking`,name:`점수마다 이길지 포기할지 정하는 백트래킹`,rank:`BEST`,timeComplexity:`O(2^10 × 11)`,spaceComplexity:`O(11)`,verdict:`10점부터 점수마다 이기거나 포기하는 경우를 재귀로 내려가며, 화살이 모자라면 그 가지는 포기만 하고, 끝까지 간 배분의 점수 차이를 견줍니다.`,pros:[`경우가 점수마다 둘뿐이라 가능한 배분을 빠짐없이 만들 수 있습니다.`,`남은 화살이 모자라면 이기는 가지를 만들지 않아 쓸모없는 배분을 줄입니다.`,`차이가 같을 때 낮은 점수를 더 많이 맞힌 쪽을 고르는 규칙을 한곳에서 처리합니다.`],cons:[`재귀에서 값을 넣고 되돌리는(ryan[k] = 0) 줄을 빠뜨리기 쉽습니다.`,`"남은 화살은 0점에"와 "같은 차이면 낮은 점수 우선"을 놓치면 오답이 납니다.`],whyThisRank:`점수마다 이기거나 포기하는 두 갈래만 보면 되고, 화살이 없는 가지를 일찍 닫아 배분 ${g.length}가지만 살펴봅니다. 정답 규칙도 코드에 그대로 드러납니다.`,code:T,visualize:Z},{id:`archery-bitmask`,name:`이길 점수를 고르는 모든 경우 (비트마스크)`,rank:`ALTERNATIVE`,timeComplexity:`O(2^10 × 11)`,spaceComplexity:`O(11)`,verdict:`10점~1점 중 이길 점수를 고르는 1024가지를 마스크로 하나씩 만들어, 화살이 모자란 경우를 건너뛰고 점수 차이를 견줍니다.`,pros:[`재귀 없이 반복문 하나로 모든 경우를 만들어 이해하기 쉽습니다.`,`정석과 같은 답을 같은 규칙으로 구합니다.`],cons:[`화살이 모자란 경우도 일단 배분을 만들어 봐야 해서 마스크 ${_.length}가지를 모두 확인합니다(정석은 ${g.length}가지).`,`비트 연산(mask >> k & 1)이 낯설면 읽기 어렵습니다.`],whyThisRank:`정답은 같지만 화살이 모자란 경우를 미리 닫지 못해 낭비가 있습니다. 비트 연산도 재귀보다 읽기 어려워, 시험장에서는 백트래킹이 더 쓰기 쉽습니다.`,code:D,visualize:Q},{id:`archery-high-first`,name:`높은 점수부터 이기기 (그리디)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(11)`,spaceComplexity:`O(11)`,verdict:`10점부터 이길 수 있으면 무조건 이기는 풀이로, 화살이 적게 드는 점수를 놓쳐 오답이 나옵니다.`,pros:[`점수 열한 칸을 한 번씩 훑을 뿐이라 가장 빠릅니다.`,`어피치가 낮은 점수에 몰려 있는 입력에서는 우연히 맞습니다.`],cons:[`시각화 입력에서 10점(3발)과 9점(2발)을 이겨 ${f(S)}이 되지만 차이는 ${K(p(S).gap)}에 그칩니다. 정답 ${f(x)}의 차이는 ${K(p(x).gap)}입니다.`,`이길 수 있어도 화살을 많이 쓰는 점수가 오히려 손해일 수 있습니다.`],whyThisRank:`점수가 높아도 이기는 데 화살이 많이 들면, 그 화살로 더 낮은 점수를 여러 개 이기는 쪽이 차이가 큽니다. 어떤 점수를 이길지는 가능한 경우를 모두 견주어 정해야 합니다.`,code:k,visualize:$}],checks:{cases:[{args:[5,[2,1,1,1,0,0,0,0,0,0,0]],expected:[0,2,2,0,1,0,0,0,0,0,0]},{args:[1,[1,0,0,0,0,0,0,0,0,0,0]],expected:[-1]},{args:[9,[0,0,1,2,0,1,1,1,1,1,1]],expected:[1,1,2,0,1,2,2,0,0,0,0]},{args:[10,[0,0,0,0,0,0,0,0,3,4,3]],expected:[1,1,1,1,1,1,1,1,0,0,2]},{args:[1,[0,0,0,0,0,0,0,0,0,0,1]],expected:[1,0,0,0,0,0,0,0,0,0,0]},{args:[2,[1,1,0,0,0,0,0,0,0,0,0]],expected:[2,0,0,0,0,0,0,0,0,0,0]},{args:[c,l],expected:[0,2,2,0,1,0,0,0,0,0,0]}],random:e=>{let t=1+Math.floor(e()*7),n=Array(11).fill(0);for(let r=0;r<t;r++)n[Math.floor(e()*11)]++;return[t,n]}}};export{ee as default};