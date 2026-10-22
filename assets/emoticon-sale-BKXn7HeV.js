import{c as e,i as t,l as n,r}from"./shared-CL29HWIp.js";import{c as i,n as a,o,r as s}from"./common-aiDxOJCw.js";var c=[[40,1e4],[25,1e4]],l=[7e3,9e3],u=[10,20,30,40],d=l.length,f=e=>String(e),p=(e,t)=>`[${e}, ${t}]`,m=e=>{let t=c.map(([t,n])=>{let r=e.map(e=>e>=t),i=l.reduce((t,n,i)=>t+(r[i]?n*(100-e[i])/100:0),0);return{buys:r,spent:i,plus:i>=n}});return{rates:e,buys:t,plus:t.filter(e=>e.plus).length,sales:t.reduce((e,t)=>e+(t.plus?0:t.spent),0)}},h=u.flatMap(e=>u.map(t=>m([e,t]))),g=(e,t)=>e.plus>t.plus||e.plus===t.plus&&e.sales>t.sales,_=[],v={plus:0,sales:0};h.forEach((e,t)=>{(t===0||g(e,v))&&(_.push(t),v=e)});var y=h.indexOf(v),b=h[h.length-1],x=c.length*d,S={python:`def solution(users, emoticons):
    best = [0, 0]  # [가입자 수, 판매액]
    rates = [0] * len(emoticons)

    def dfs(i):
        if i == len(emoticons):
            plus, sales = 0, 0
            for want, limit in users:
                spent = 0
                for price, rate in zip(emoticons, rates):
                    if rate >= want:  # 원하는 할인율 이상이면 삽니다
                        spent += price * (100 - rate) // 100
                if spent >= limit:
                    plus += 1  # 한도를 넘으면 모두 취소하고 가입합니다
                else:
                    sales += spent
            if [plus, sales] > best:  # 가입자가 먼저, 같으면 판매액
                best[:] = [plus, sales]
            return
        for rate in (10, 20, 30, 40):  # i번째 이모티콘의 할인율을 하나씩 정합니다
            rates[i] = rate
            dfs(i + 1)

    dfs(0)
    return best`,javascript:`function solution(users, emoticons) {
  let best = [0, 0]; // [가입자 수, 판매액]
  const rates = Array(emoticons.length).fill(0);

  const dfs = (i) => {
    if (i === emoticons.length) {
      let plus = 0, sales = 0;
      for (const [want, limit] of users) {
        let spent = 0;
        emoticons.forEach((price, k) => {
          if (rates[k] >= want) spent += price * (100 - rates[k]) / 100; // 원하는 할인율 이상이면 삽니다
        });
        if (spent >= limit) plus++; // 한도를 넘으면 모두 취소하고 가입합니다
        else sales += spent;
      }
      if (plus > best[0] || (plus === best[0] && sales > best[1])) best = [plus, sales]; // 가입자가 먼저, 같으면 판매액
      return;
    }
    for (const rate of [10, 20, 30, 40]) { // i번째 이모티콘의 할인율을 하나씩 정합니다
      rates[i] = rate;
      dfs(i + 1);
    }
  };

  dfs(0);
  return best;
}`},C={start:t(S,[`best = [0, 0]`,`dfs(0)`],[`let best = [0, 0]`,`dfs(0)`]),pick:t(S,[`for rate in (10, 20, 30, 40)`,`rates[i] = rate`,`dfs(i + 1)`],[`for (const rate of [10, 20, 30, 40])`,`rates[i] = rate`,`dfs(i + 1)`]),buy:t(S,[`for want, limit in users:`,`if rate >= want:`,`spent += price * (100 - rate) // 100`],[`for (const [want, limit] of users)`,`if (rates[k] >= want)`,`spent += price * (100 - rates[k]) / 100`]),join:t(S,[`if spent >= limit:`,`plus += 1`,`sales += spent`],[`if (spent >= limit)`,`plus++`,`sales += spent`]),compare:t(S,[`if [plus, sales] > best:`,`best[:] = [plus, sales]`],[`if (plus > best[0]`,`best = [plus, sales]`]),done:t(S,[`dfs(0)`,`return best`],[`dfs(0)`,`return best`])},w={python:`from itertools import product

def solution(users, emoticons):
    best = [0, 0]  # [가입자 수, 판매액]
    # 할인율 조합을 모두 만들어 두고
    for rates in product((10, 20, 30, 40), repeat=len(emoticons)):
        # 조합마다 처음부터 평가합니다
        plus, sales = 0, 0
        for want, limit in users:
            spent = 0
            for price, rate in zip(emoticons, rates):
                if rate >= want:  # 원하는 할인율 이상이면 삽니다
                    spent += price * (100 - rate) // 100
            if spent >= limit:
                plus += 1  # 한도를 넘으면 모두 취소하고 가입합니다
            else:
                sales += spent
        if [plus, sales] > best:  # 가입자가 먼저, 같으면 판매액
            best = [plus, sales]
    return best`,javascript:`function solution(users, emoticons) {
  // 할인율 조합을 모두 만들어 두고
  let combos = [[]];
  for (let i = 0; i < emoticons.length; i++) {
    combos = combos.flatMap((c) => [10, 20, 30, 40].map((rate) => [...c, rate]));
  }

  let best = [0, 0]; // [가입자 수, 판매액]
  for (const rates of combos) { // 조합마다 처음부터 평가합니다
    let plus = 0, sales = 0;
    for (const [want, limit] of users) {
      let spent = 0;
      emoticons.forEach((price, k) => {
        if (rates[k] >= want) spent += price * (100 - rates[k]) / 100; // 원하는 할인율 이상이면 삽니다
      });
      if (spent >= limit) plus++; // 한도를 넘으면 모두 취소하고 가입합니다
      else sales += spent;
    }
    if (plus > best[0] || (plus === best[0] && sales > best[1])) best = [plus, sales]; // 가입자가 먼저, 같으면 판매액
  }
  return best;
}`},T={make:t(w,[`for rates in product(`,`best = [0, 0]`],[`let combos = [[]]`,`combos = combos.flatMap`]),buy:t(w,[`for want, limit in users:`,`if rate >= want:`,`spent += price * (100 - rate) // 100`],[`for (const [want, limit] of users)`,`if (rates[k] >= want)`,`spent += price * (100 - rates[k]) / 100`]),join:t(w,[`if spent >= limit:`,`plus += 1`,`sales += spent`],[`if (spent >= limit)`,`plus++`,`sales += spent`]),compare:t(w,[`if [plus, sales] > best:`,`best = [plus, sales]`],[`if (plus > best[0]`,`best = [plus, sales]`]),rows:t(w,[`for rates in product(`,`if [plus, sales] > best:`],[`for (const rates of combos)`,`if (plus > best[0]`]),done:t(w,[`return best`],[`return best`])},E={python:`# 주의: 모든 이모티콘을 40% 할인하면 가장 좋다고 짐작하는 오답 풀이입니다
def solution(users, emoticons):
    rates = [40] * len(emoticons)  # 전부 40% 할인
    plus, sales = 0, 0
    for want, limit in users:
        spent = 0
        for price, rate in zip(emoticons, rates):
            if rate >= want:  # 원하는 할인율 이상이면 삽니다
                spent += price * (100 - rate) // 100
        if spent >= limit:
            plus += 1  # 한도를 넘으면 모두 취소하고 가입합니다
        else:
            sales += spent
    return [plus, sales]`,javascript:`// 주의: 모든 이모티콘을 40% 할인하면 가장 좋다고 짐작하는 오답 풀이입니다
function solution(users, emoticons) {
  const rates = Array(emoticons.length).fill(40); // 전부 40% 할인
  let plus = 0, sales = 0;
  for (const [want, limit] of users) {
    let spent = 0;
    emoticons.forEach((price, k) => {
      if (rates[k] >= want) spent += price * (100 - rates[k]) / 100; // 원하는 할인율 이상이면 삽니다
    });
    if (spent >= limit) plus++; // 한도를 넘으면 모두 취소하고 가입합니다
    else sales += spent;
  }
  return [plus, sales];
}`},D={start:t(E,[`rates = [40] * len(emoticons)`,`plus, sales = 0, 0`],[`const rates = Array(emoticons.length).fill(40)`,`let plus = 0, sales = 0`]),buy:t(E,[`for want, limit in users:`,`if rate >= want:`,`spent += price * (100 - rate) // 100`],[`for (const [want, limit] of users)`,`if (rates[k] >= want)`,`spent += price * (100 - rates[k]) / 100`]),join:t(E,[`if spent >= limit:`,`plus += 1`,`sales += spent`],[`if (spent >= limit)`,`plus++`,`sales += spent`]),done:t(E,[`return [plus, sales]`],[`return [plus, sales]`])},O=420,k=392,A=(e,t)=>({x:204+t*52,y:42+e*36,w:48,h:32}),j=(e,t)=>`g:${e}:${t}`,M=e=>[Math.floor(e/u.length),e%u.length],N=(e,t)=>({x:[12,96,168,240][t],y:224+e*46,w:[80,68,68,64][t],h:40}),P=(e,t)=>`u:${e}:${t}`,F=(e,t,n,r,i)=>({id:e,kind:`token`,rect:{x:t,y:322,w:n,h:30},tone:i,text:r});function I(e){let t=[{id:`title`,kind:`text`,rect:{x:8,y:0,w:404,h:16},tone:`muted`,text:e}];return l.forEach((e,n)=>{t.push({id:`e:${n}`,kind:`cell`,rect:{x:12+n*68,y:22,w:60,h:44},tone:`plain`,text:f(e),tag:`이모티콘 ${n+1}`},{id:`r:${n}`,kind:`cell`,rect:{x:12+n*68,y:72,w:60,h:34},tone:`plain`,text:``})}),u.forEach((e,n)=>{t.push({id:`hc:${n}`,kind:`text`,rect:{x:204+n*52,y:24,w:48,h:16},tone:`muted`,text:`${e}%`},{id:`hr:${n}`,kind:`text`,rect:{x:158,y:42+n*36,w:42,h:32},tone:`muted`,text:`${e}%`});for(let e=0;e<u.length;e++)t.push({id:j(n,e),kind:`cell`,rect:A(n,e),tone:`plain`,text:``})}),[`원하는 할인율`,`한도`,`쓴 돈`,`결과`].forEach((e,n)=>{t.push({id:`uh:${n}`,kind:`text`,rect:{x:N(0,n).x,y:190,w:N(0,n).w,h:30},tone:`muted`,text:e})}),c.forEach(([e,n],r)=>{t.push({id:P(r,`want`),kind:`cell`,rect:N(r,0),tone:`plain`,text:`${e}%`,tag:`사용자 ${r+1}`},{id:P(r,`limit`),kind:`cell`,rect:N(r,1),tone:`plain`,text:f(n)},{id:P(r,`spent`),kind:`cell`,rect:N(r,2),tone:`plain`,text:``},{id:P(r,`res`),kind:`cell`,rect:N(r,3),tone:`plain`,text:``})}),t.push(F(`t:plus`,12,110,`가입자 0`,`plain`),F(`t:sales`,128,130,`판매액 0`,`plain`),F(`t:best`,264,148,`최고 없음`,`chosen`),{id:`calc`,kind:`text`,rect:{x:8,y:358,w:404,h:26},text:``}),{width:O,height:k,items:t}}var L=e=>o(`calc`,{text:e}),R=(e,t=`queued`)=>e.map((e,n)=>o(`r:${n}`,{text:`${e}%`,tone:t},!0)),z=()=>c.flatMap((e,t)=>[o(P(t,`spent`),{text:``,tone:`plain`}),o(P(t,`res`),{text:``,tone:`plain`})]),B=e=>e.buys.flatMap((e,t)=>[o(P(t,`spent`),{text:f(e.spent),tone:e.plus?`good`:`visited`},!0),o(P(t,`res`),{text:e.plus?`가입!`:e.spent?`구매`:`안 삼`,tone:e.plus?`good`:`plain`},!0)]),V=(e,t,n)=>{let[r,i]=M(e);return o(j(r,i),{text:String(t.plus),tag:f(t.sales),tone:n},!0)},H=(e,t,n,i)=>r(p(e,t),n,i),U=e=>e.buys.map((e,t)=>{let n=l.flatMap((t,n)=>e.buys[n]?[n+1]:[]),i=n.length?`이모티콘 ${n.join(`, `)}${r(n.at(-1),`을`,`를`).slice(String(n.at(-1)).length)} 사서 ${e.spent}원`:``;return`사용자 ${r(t+1,`은`,`는`)} ${n.length?`${i}을 ${e.plus?`쓰고 한도 ${c[t][1]}원 이상이라 모두 취소하고 가입합니다`:`씁니다`}`:`살 이모티콘이 없습니다`}.`}).join(` `);function W(){let t=new n(I(`한 칸 = 조합 하나 · 큰 글자 가입자, 작은 글씨 판매액`)),c,f=-1,m=0,_,b=()=>({work:m,variables:{rates:_?`[${_.rates.join(`, `)}]`:`[0, 0]`,plus:_?.plus??`-`,sales:_?.sales??`-`,best:c?p(c.plus,c.sales):`[0, 0]`}});t.step({title:`dfs(0)에서 시작`,codeHighlights:C.start,...b()}),t.phase(`시작`,`이모티콘 ${d}개의 할인율을 10, 20, 30, 40% 중에서 하나씩 정하는 경우는 모두 ${u.length}^${d} = ${h.length}가지입니다. 하나씩 정하고, 사용자들이 얼마를 쓰는지 계산해 가입자가 가장 많고 판매액이 큰 경우를 찾습니다.`,C.start),t.do(i(300)),h.forEach((n,s)=>{let[u,d]=M(s),v=!c||g(n,c),y=f;if(_=n,m+=x,t.step({title:`할인율 ${n.rates.map(e=>`${e}%`).join(`, `)} → 가입자 ${n.plus}, 판매액 ${n.sales}${v?` (새 최고)`:``}`,codeHighlights:C.compare,...b()}),t.phase(`할인율 정하기`,`${l.map((e,t)=>`이모티콘 ${r(t+1,`은`,`는`)} ${n.rates[t]}%`).join(`, `)}로 정합니다.`,C.pick),t.do(...e([...R(n.rates),...z(),o(j(u,d),{tone:`queued`,text:`?`}),L(`${s+1} / ${h.length}번째 조합`)])),t.phase(`구매 계산`,U(n),C.buy),t.do(...e(B(n))),t.do(...e([o(`t:plus`,{text:`가입자 ${n.plus}`},!0),o(`t:sales`,{text:`판매액 ${n.sales}`},!0)]),L(`가입자 ${n.plus}명, 판매액 ${n.sales}원`)),t.phase(`비교하기`,c?v?`${H(n.plus,n.sales,`은`,`는`)} 최고 ${p(c.plus,c.sales)}보다 ${n.plus>c.plus?`가입자가 많아`:`가입자가 같고 판매액이 커서`} 새 최고입니다.`:`${H(n.plus,n.sales,`은`,`는`)} 최고 ${p(c.plus,c.sales)}보다 ${n.plus<c.plus?`가입자가 적어`:`가입자가 같고 판매액이 작거나 같아`} 그대로 둡니다.`:`처음 만든 결과라 ${H(n.plus,n.sales,`을`,`를`)} 최고로 삼습니다.`,C.compare),y>=0){let[e,n]=M(y);t.do({type:`focus`,ids:[j(u,d),j(e,n)]}),t.do({type:`arrow`,from:j(u,d),to:j(e,n),verdict:v?`good`:`bad`,label:v?`새 최고`:`못 넘음`},i(100))}t.do(...e([...y>=0?a():[],V(s,n,v?`good`:`visited`),...v&&y>=0?[(()=>{let[e,t]=M(y);return o(j(e,t),{tone:`visited`})})()]:[],...v?[o(`t:best`,{text:`최고 ${p(n.plus,n.sales)}`},!0)]:[]])),v&&(c={plus:n.plus,sales:n.sales},f=s)}),t.step({title:`최고 ${p(v.plus,v.sales)}`,codeHighlights:C.done,...b(),answer:[v.plus,v.sales],isKeyframe:!0});let[S,w]=M(y);return t.phase(`결과`,`${h.length}가지를 모두 따져 가입자가 가장 많고 판매액이 큰 ${r(p(v.plus,v.sales),`을`,`를`)} 찾았습니다. 이모티콘 1은 ${h[y].rates[0]}%, 이모티콘 2는 ${h[y].rates[1]}% 할인하는 경우입니다.`,C.done),t.do(...e([o(j(S,w),{tone:`path`},!0),o(`t:best`,{tone:`path`},!0),...R(h[y].rates,`path`),L(`답 ${p(v.plus,v.sales)}`)])),s(t.finish())}function G(){let t=new n(I(`먼저 모두 만든 뒤 평가 · 큰 글자 가입자, 작은 글씨 판매액`)),i,a=-1,c=0,l,f=()=>({work:c,variables:{rates:l?`[${l.rates.join(`, `)}]`:`-`,plus:l?.plus??`-`,sales:l?.sales??`-`,best:i?p(i.plus,i.sales):`[0, 0]`}}),m=e=>{let t=h[e],n=!i||g(t,i);return n&&(i={plus:t.plus,sales:t.sales},a=e),c+=x,l=t,n};t.step({title:`할인율 조합 ${h.length}가지 만들기`,codeHighlights:T.make,...f()}),t.phase(`조합 만들기`,`이모티콘 ${d}개의 할인율 조합 ${u.length}^${d} = ${h.length}가지를 먼저 모두 만들어 목록에 담아 둡니다. 결과 표의 칸 하나가 조합 하나입니다.`,T.make),t.do(...e(h.map((e,t)=>o(j(...M(t)),{tone:`queued`,text:`?`}))));for(let n=0;n<2;n++){let r=h[n],[i,a]=M(n),s=m(n);t.step({title:`조합 ${n+1} ${r.rates.map(e=>`${e}%`).join(`, `)} → 가입자 ${r.plus}, 판매액 ${r.sales}`,codeHighlights:T.compare,...f()}),t.phase(`구매 계산`,`${r.rates.map((e,t)=>`이모티콘 ${t+1} ${e}%`).join(`, `)} 조합입니다. ${U(r)}`,T.buy),t.do(...e([...R(r.rates),...z(),o(j(i,a),{tone:`current`})])),t.do(...e(B(r))),t.phase(`비교하기`,s?`${n?`${H(r.plus,r.sales,`이`,`가`)} 최고보다 커서 새 최고입니다.`:`${H(r.plus,r.sales,`을`,`를`)} 처음 만든 결과라 최고로 삼습니다.`}`:`${H(r.plus,r.sales,`은`,`는`)} 최고를 넘지 못합니다.`,T.compare),t.do(...e([V(n,r,s?`good`:`visited`),o(`t:plus`,{text:`가입자 ${r.plus}`},!0),o(`t:sales`,{text:`판매액 ${r.sales}`},!0),...s?[o(`t:best`,{text:`최고 ${p(r.plus,r.sales)}`},!0)]:[]]))}for(let n of[[2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]]){let s=a,c=[];for(let e of n)m(e)&&e===a&&c.push(e);if(t.step({title:`조합 ${n[0]+1}~${n.at(-1)+1} 빨리 감기`,codeHighlights:T.rows,...f()}),t.phase(`빨리 감기`,`조합 ${n[0]+1}번부터 ${n.at(-1)+1}번까지 ${n.length}가지를 같은 방식으로 평가합니다. ${c.length?`${c.map(e=>`${e+1}번 조합 ${p(h[e].plus,h[e].sales)}`).join(`, `)}${r(p(h[c.at(-1)].plus,h[c.at(-1)].sales),`이`,`가`).slice(p(h[c.at(-1)].plus,h[c.at(-1)].sales).length)} 새 최고가 됩니다.`:`최고를 넘는 조합은 없습니다.`}`,T.rows),t.do(...e([...n.map(e=>V(e,h[e],`visited`)),...c.length?[o(`t:best`,{text:`최고 ${p(i.plus,i.sales)}`},!0)]:[],L(`조합 ${n[0]+1}~${n.at(-1)+1}번 평가: 가입자와 판매액을 표에 적음`)])),c.length){let[n,r]=M(a);t.do(...e([o(j(n,r),{tone:`good`},!0),...s>=0&&s!==a?[(()=>{let[e,t]=M(s);return o(j(e,t),{tone:`visited`})})()]:[]]))}}t.step({title:`최고 ${p(v.plus,v.sales)}`,codeHighlights:T.done,...f(),answer:[v.plus,v.sales],isKeyframe:!0});let[_,b]=M(y);return t.phase(`결과`,`조합 ${h.length}가지를 모두 평가해 ${r(p(v.plus,v.sales),`을`,`를`)} 찾았습니다. 정석과 같은 횟수를 따져 보지만, 조합을 한꺼번에 목록으로 들고 있어야 해서 메모리를 더 씁니다. 이모티콘이 7개면 목록이 16,384개입니다.`,T.done),t.do(...e([o(j(_,b),{tone:`path`},!0),o(`t:best`,{tone:`path`},!0),...R(h[y].rates,`path`),L(`답 ${p(v.plus,v.sales)}`)])),s(t.finish())}function K(){let t=new n(I(`모든 이모티콘을 40% 할인합니다`)),i=!1,a=()=>({work:i?x:0,variables:{plus:i?b.plus:0,sales:i?b.sales:0}});return t.step({title:`모두 40% 할인하기`,codeHighlights:D.start,...a()}),t.phase(`할인율 정하기`,`할인이 클수록 더 많이 사고 판매액도 클 것 같습니다. 이모티콘을 모두 가장 큰 40% 할인으로 정합니다.`,D.start),t.do(...e(R(b.rates))),i=!0,t.step({title:`가입자 ${b.plus}, 판매액 ${b.sales}`,codeHighlights:D.join,...a()}),t.phase(`구매 계산`,U(b),D.buy),t.do(...e(B(b))),t.do(...e([o(`t:plus`,{text:`가입자 ${b.plus}`},!0),o(`t:sales`,{text:`판매액 ${b.sales}`},!0)])),t.step({title:`${p(b.plus,b.sales)} — 정답은 ${p(v.plus,v.sales)}`,codeHighlights:D.done,...a(),answer:[b.plus,b.sales],isKeyframe:!0}),t.phase(`비교하기`,`${r(p(b.plus,b.sales),`을`,`를`)} 돌려줍니다. 판매액은 크지만 가입자가 ${b.plus}명입니다. 가입자 수가 판매액보다 우선인데, 이모티콘 1을 ${h[y].rates[0]}%만 깎으면 사용자 2가 한도를 넘어 가입해 ${r(p(v.plus,v.sales),`이`,`가`)} 됩니다. 40%가 늘 최선은 아닙니다.`,D.done),t.do(...e([o(`t:plus`,{tone:`bad`},!0),o(`t:sales`,{tone:`bad`},!0),L(`내 답 ${p(b.plus,b.sales)} ≠ 정답 ${p(v.plus,v.sales)}`)])),t.do(...e([o(`t:best`,{text:`정답 ${p(v.plus,v.sales)}`,tone:`good`},!0)])),s(t.finish())}var q={id:`emoticon-sale`,title:`이모티콘 할인행사`,level:2,category:`brute-force`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/150368`,description:{summary:`이모티콘 플러스 가입자를 늘리고 판매액도 높이려는 할인 행사입니다. 이모티콘마다 할인율을 10%, 20%, 30%, 40% 중 하나로 정하면, 사용자는 자기가 원하는 할인율 이상인 이모티콘을 모두 삽니다. 그렇게 산 금액이 사용자의 한도 이상이면 구매를 모두 취소하고 이모티콘 플러스에 가입합니다. 가입자 수를 가장 많이 하고, 그 안에서 판매액이 가장 큰 결과를 [가입자 수, 판매액] 순서로 구합니다.`,rules:[`users는 [원하는 할인율(1~40), 한도(100 이상 1,000,000 이하, 100의 배수)] 쌍이 n개 (1 ≤ n ≤ 100)`,`emoticons는 이모티콘 정가(100 이상 1,000,000 이하, 100의 배수)가 m개 (1 ≤ m ≤ 7)`,`가입자 수를 먼저 최대로 하고, 같으면 판매액을 최대로 함. 가입한 사용자의 구매액은 판매액에 넣지 않음`],examples:[{input:`users = [[40,10000],[25,10000]], emoticons = [7000,9000]`,output:`[1,5400]`},{input:`users = [[40,2900],[23,10000],[11,5200],[5,5900],[40,3100],[27,9200],[32,6900]], emoticons = [1300,1500,1600,4900]`,output:`[4,13860]`}]},keyIntuitions:[`이모티콘이 최대 7개이고 할인율은 10, 20, 30, 40% 네 가지뿐이라 모든 경우는 4^7 = 16,384가지입니다. 할인율의 중복순열을 모두 만들어 평가해도 충분합니다.`,`조합마다 사용자 n명이 이모티콘 m개를 살지 따져 한도를 넘으면 가입시키고, 아니면 판매액에 더합니다. 최대 100 × 7번이라 전체로도 1,100만 번 안팎입니다.`,`결과는 [가입자 수, 판매액]을 사전 순으로 비교합니다. 판매액이 아니라 가입자 수가 먼저이고, 모든 이모티콘을 40% 할인하는 것이 늘 좋은 것은 아닙니다.`],demo:{input:[c,l],label:`users = [[40,10000],[25,10000]], emoticons = [7000,9000]`},workUnit:`살 이모티콘을 따져 본 횟수`,approaches:[{id:`emoticon-dfs`,name:`할인율 중복순열 DFS로 만들며 평가`,rank:`BEST`,timeComplexity:`O(4^m × n × m)`,spaceComplexity:`O(m)`,verdict:`이모티콘마다 10, 20, 30, 40% 중 하나씩 정하는 재귀로 모든 조합을 만들고, 끝까지 정한 조합마다 사용자 구매를 계산해 최고 결과를 고릅니다.`,pros:[`조합을 목록으로 만들지 않고 재귀로 만들며 바로 평가해 메모리가 작습니다.`,`조합을 하나도 빠뜨리지 않고, 비교 규칙([가입자, 판매액] 사전 순)이 코드 한 줄입니다.`,`m이 7이어도 16,384 × 100 × 7번이면 끝납니다.`],cons:[`재귀에서 rates를 덮어쓰며 내려가는 방식이라 되돌리는 코드를 따로 두지 않아도 되지만 처음엔 헷갈립니다.`,`조합마다 모든 사용자를 처음부터 다시 계산합니다.`],whyThisRank:`경우의 수가 4^m이라 모두 따져도 충분히 빠릅니다. 재귀로 만들며 평가해 가장 단순하고 메모리도 적게 듭니다.`,code:S,visualize:W},{id:`emoticon-product`,name:`할인율 조합을 먼저 모두 만든 뒤 평가`,rank:`ALTERNATIVE`,timeComplexity:`O(4^m × n × m)`,spaceComplexity:`O(4^m × m)`,verdict:`할인율 조합을 목록으로 모두 만들어 둔 뒤, 하나씩 꺼내 사용자 구매를 계산해 최고 결과를 고릅니다.`,pros:[`만들기와 평가를 나눠서 각 부분을 따로 이해하기 쉽습니다.`,`파이썬에서는 itertools.product 한 줄로 조합을 만들 수 있습니다.`],cons:[`조합을 모두 들고 있어 이모티콘이 7개면 목록이 16,384개(7칸씩)가 되어 메모리를 더 씁니다.`,`평가 횟수는 정석과 같아서 빨라지는 것은 없습니다.`],whyThisRank:`따져 보는 횟수는 정석과 같고 메모리만 더 듭니다. 이 문제처럼 조합이 많아질 수 있는 입력에서는 재귀로 만들며 바로 평가하는 쪽이 낫습니다.`,code:w,visualize:G},{id:`emoticon-all-forty`,name:`모든 이모티콘을 40% 할인`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(n × m)`,spaceComplexity:`O(m)`,verdict:`할인이 클수록 좋다고 짐작해 모두 40%로만 계산하는 풀이로, 가입자 수를 놓쳐 오답이 나옵니다.`,pros:[`조합을 만들 필요가 없어 가장 빠릅니다.`,`사용자가 모두 한도를 넘지 않는 입력에서는 판매액만 큰 쪽이 맞습니다.`],cons:[`시각화 입력에서 모두 40%면 ${p(b.plus,b.sales)}이 나오지만, 가입자 수가 우선이라 정답 ${p(v.plus,v.sales)}과 다릅니다.`,`할인이 커지면 사용자가 한도를 넘지 않아 오히려 가입자가 줄 수 있습니다.`],whyThisRank:`가입자 수가 판매액보다 먼저이고, 가입은 사용자가 한도를 넘어야 일어납니다. 할인율마다 가입자 수와 판매액이 달라지므로 가능한 조합을 모두 따져 봐야 합니다.`,code:E,visualize:K}],checks:{cases:[{args:[[[40,1e4],[25,1e4]],[7e3,9e3]],expected:[1,5400]},{args:[[[40,2900],[23,1e4],[11,5200],[5,5900],[40,3100],[27,9200],[32,6900]],[1300,1500,1600,4900]],expected:[4,13860]},{args:[[[1,100]],[100]],expected:[0,90]},{args:[[[40,1e6]],[100]],expected:[0,60]},{args:[[[10,100],[10,100]],[200]],expected:[2,0]},{args:[c,l],expected:[1,5400]}],random:e=>[Array.from({length:1+Math.floor(e()*5)},()=>[1+Math.floor(e()*40),(1+Math.floor(e()*60))*100]),Array.from({length:1+Math.floor(e()*4)},()=>(1+Math.floor(e()*40))*100)]}};export{q as default};