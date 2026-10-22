import{c as e,i as t,r as n,s as r}from"./shared-e6uNbDLo.js";import{c as i,n as a,o,r as s,s as c}from"./common-DSYBffMW.js";var l=[`XYZ`,`XWY`,`WXA`],u=[2,3,4],d=e=>`"${e}"`,f=e=>`[${e.map(d).join(`, `)}]`,p=(e,t)=>t>e.length?[]:t===0?[``]:[...e].flatMap((n,r)=>p(e.slice(r+1),t-1).map(e=>n+e)),m=e=>[...e].sort().join(``),h=e=>{let t=Math.max(0,...e.values());return{top:t,menus:t>=2?[...e].filter(([,e])=>e===t).map(([e])=>e):[]}};function g(e){let t=new Map(u.map(e=>[e,new Map])),n=l.map(n=>{let r=e?m(n):n,i=[];for(let e of u)for(let n of p(r,e)){let r=t.get(e);r.set(n,(r.get(n)??0)+1),i.push({key:n,count:r.get(n)})}return{text:r,combos:i}}),r=u.map(e=>({size:e,...h(t.get(e))}));return{runs:n,picks:r,answer:r.flatMap(e=>e.menus).sort(),counters:t}}var _=g(!0),v=g(!1),y=e=>e.runs.reduce((e,t)=>e+t.combos.length,0),b=[...new Set(l.join(``))].sort(),x=u.map(e=>({size:e,counts:new Map(p(b.join(``),e).map(e=>[e,l.filter(t=>[...e].every(e=>t.includes(e))).length]))})),S=(e,t=``)=>`from collections import Counter
from itertools import combinations

${t}def solution(orders, course):
    counters = {size: Counter() for size in course}  # 코스 크기마다 조합별 주문 횟수
    for order in orders:
        ${e}
        for size in course:
            for combo in combinations(menus, size):
                counters[size]["".join(combo)] += 1  # 이 조합을 한 번 더 주문했습니다
    answer = []
    for size in course:
        counter = counters[size]
        top = max(counter.values(), default=0)
        if top >= 2:  # 2명 이상이 주문한 조합만 코스가 됩니다
            answer += [menu for menu, count in counter.items() if count == top]
    return sorted(answer)`,C=(e,t=``)=>`${t}function solution(orders, course) {
  const counters = new Map(course.map((size) => [size, new Map()])); // 코스 크기마다 조합별 주문 횟수

  const pick = (menus, size, start, current, visit) => {
    if (current.length === size) {
      visit(current.join(""));
      return;
    }
    for (let i = start; i < menus.length; i++) pick(menus, size, i + 1, [...current, menus[i]], visit);
  };

  for (const order of orders) {
    ${e}
    for (const size of course) {
      pick(menus, size, 0, [], (combo) => {
        const counter = counters.get(size);
        counter.set(combo, (counter.get(combo) ?? 0) + 1); // 이 조합을 한 번 더 주문했습니다
      });
    }
  }

  const answer = [];
  for (const size of course) {
    const counter = counters.get(size);
    const top = Math.max(0, ...counter.values());
    if (top >= 2) { // 2명 이상이 주문한 조합만 코스가 됩니다
      for (const [menu, count] of counter) if (count === top) answer.push(menu);
    }
  }
  return answer.sort();
}`,w={python:S(`menus = sorted(order)  # 정렬해야 "XW"와 "WX"가 같은 조합이 됩니다`),javascript:C(`const menus = [...order].sort(); // 정렬해야 "XW"와 "WX"가 같은 조합이 됩니다`)},T={start:t(w,[`counters = {size: Counter()`],[`const counters = new Map`]),sort:t(w,[`for order in orders:`,`menus = sorted(order)`],[`for (const order of orders)`,`const menus = [...order].sort()`]),count:t(w,[`for combo in combinations(menus, size):`,`counters[size]["".join(combo)] += 1`],[`pick(menus, size, 0, [], (combo) => {`,`counter.set(combo,`]),pick:t(w,[`top = max(counter.values(), default=0)`,`if top >= 2:`,`answer += [menu for menu`],[`const top = Math.max`,`if (top >= 2)`,`answer.push(menu)`]),done:t(w,[`return sorted(answer)`],[`return answer.sort()`])},E={python:`from itertools import combinations

def solution(orders, course):
    menus = sorted(set("".join(orders)))  # 주문에 나온 모든 메뉴
    answer = []
    for size in course:
        counts = {}
        for combo in combinations(menus, size):  # 후보 조합을 먼저 모두 만들고
            # 주문마다 이 조합의 메뉴가 모두 들어 있는지 확인합니다
            counts["".join(combo)] = sum(1 for order in orders if all(m in order for m in combo))
        top = max(counts.values(), default=0)
        if top >= 2:  # 2명 이상이 주문한 조합만 코스가 됩니다
            answer += [menu for menu, count in counts.items() if count == top]
    return sorted(answer)`,javascript:`function solution(orders, course) {
  const menus = [...new Set(orders.join(""))].sort(); // 주문에 나온 모든 메뉴

  const pick = (size, start, current, visit) => {
    if (current.length === size) {
      visit(current);
      return;
    }
    for (let i = start; i < menus.length; i++) pick(size, i + 1, [...current, menus[i]], visit);
  };

  const answer = [];
  for (const size of course) {
    const counts = new Map();
    pick(size, 0, [], (combo) => { // 후보 조합을 먼저 모두 만들고
      // 주문마다 이 조합의 메뉴가 모두 들어 있는지 확인합니다
      counts.set(combo.join(""), orders.filter((order) => combo.every((m) => order.includes(m))).length);
    });
    const top = Math.max(0, ...counts.values());
    if (top >= 2) { // 2명 이상이 주문한 조합만 코스가 됩니다
      for (const [menu, count] of counts) if (count === top) answer.push(menu);
    }
  }
  return answer.sort();
}`},D={start:t(E,[`menus = sorted(set("".join(orders)))`],[`const menus = [...new Set(orders.join(""))].sort()`]),make:t(E,[`for size in course:`,`for combo in combinations(menus, size):`],[`for (const size of course)`,`pick(size, 0, [], (combo) => {`]),count:t(E,[`counts["".join(combo)] = sum(1 for order in orders`],[`counts.set(combo.join(""), orders.filter`]),pick:t(E,[`top = max(counts.values(), default=0)`,`if top >= 2:`,`answer += [menu for menu`],[`const top = Math.max`,`if (top >= 2)`,`answer.push(menu)`]),done:t(E,[`return sorted(answer)`],[`return answer.sort()`])},O={python:S(`menus = order  # 주의: 정렬하지 않고 주문한 순서 그대로 조합을 만듭니다`,`# 주의: 메뉴를 정렬하지 않고 조합을 세는 오답 풀이입니다
`),javascript:C(`const menus = [...order]; // 주의: 정렬하지 않고 주문한 순서 그대로 조합을 만듭니다`,`// 주의: 메뉴를 정렬하지 않고 조합을 세는 오답 풀이입니다
`)},k={start:t(O,[`counters = {size: Counter()`],[`const counters = new Map`]),sort:t(O,[`for order in orders:`,`menus = order`],[`for (const order of orders)`,`const menus = [...order]`]),count:t(O,[`for combo in combinations(menus, size):`,`counters[size]["".join(combo)] += 1`],[`pick(menus, size, 0, [], (combo) => {`,`counter.set(combo,`]),pick:t(O,[`top = max(counter.values(), default=0)`,`if top >= 2:`,`answer += [menu for menu`],[`const top = Math.max`,`if (top >= 2)`,`answer.push(menu)`]),done:t(O,[`return sorted(answer)`],[`return answer.sort()`])},A=420,j=356,M=(e,t)=>({x:50+t*40,y:28+e*44,w:36,h:36}),N=(e,t)=>`o:${e}:${t}`,P=e=>({x:176,y:28+e*26,w:190,h:22}),F=e=>`b:${e}`,I=(e,t,n,r)=>({id:e,kind:`token`,rect:{x:4,y:t,w:166,h:30},tone:r,text:n}),L=e=>{let t=new Map;e.runs.forEach(e=>e.combos.forEach(({key:e})=>!t.has(e)&&t.set(e,t.size)));let n=[...t.keys()].sort((e,n)=>e.length-n.length||t.get(e)-t.get(n));return new Map(n.map((e,t)=>[e,t]))};function R(e,t){let n=[{id:`title`,kind:`text`,rect:{x:4,y:0,w:412,h:16},tone:`muted`,text:e}];return t.forEach((e,t)=>{n.push({id:`ol:${t}`,kind:`text`,rect:{x:4,y:28+t*44,w:44,h:36},tone:`muted`,text:`주문 ${t+1}`}),[...e].forEach((e,r)=>n.push({id:N(t,r),kind:`cell`,rect:M(t,r),tone:`plain`,text:e}))}),n.push(I(`t:k`,176,`코스 크기 -`,`plain`),I(`t:max`,214,`가장 많은 주문 -`,`plain`),I(`t:res`,252,`코스 []`,`chosen`),{id:`calc`,kind:`text`,rect:{x:4,y:292,w:166,h:56},text:``}),{width:A,height:j,items:n}}var z=e=>o(`calc`,{text:e}),B=(e,t,n,r=`plain`)=>({id:F(e),kind:`bar`,rect:P(t),tone:r,text:`${e} ${n}회`,fill:n/l.length}),V=(e,t,n)=>o(F(e),{text:`${e} ${t}회`,fill:t/l.length,...n?{tone:n}:{}},!0);function H(t){let p=t?_:v,m=t?T:k,h=L(p),g=new e(R(t?`주문마다 메뉴를 정렬해 조합을 세어 봅니다`:`메뉴를 정렬하지 않고 조합을 세어 봅니다`,l)),b=0,x=[],S=-1,C,w=()=>({work:b,variables:{order:S>=0?d(l[S]):`-`,...C===void 0?{}:{size:C},answer:f(x)}}),E=new Map;g.step({title:`주문 ${l.length}개, 코스 크기 ${u.join(`, `)}`,codeHighlights:m.start,...w()}),g.phase(`시작`,`주문마다 메뉴를 골라 만들 수 있는 조합을 모두 만들어, 코스 크기(${u.join(`, `)})별로 몇 번 주문되었는지 셉니다. 2명 이상이 주문한 조합 중 가장 많은 것이 코스가 됩니다.`,m.start),g.do(i(300)),p.runs.forEach((e,n)=>{let s=l[n];if(S=n,b+=e.combos.length,g.step({title:`주문 ${n+1} ${d(s)}: 조합 ${e.combos.length}개 세기`,codeHighlights:m.count,...w()}),t){let t=e.text!==s;g.phase(`정렬하기`,t?`${d(s)}의 메뉴를 정렬해 ${d(e.text)}로 만듭니다. 순서가 달라도 같은 조합이 같은 이름이 됩니다.`:`${d(s)}는 이미 알파벳순입니다. 정렬해도 그대로입니다.`,m.sort),g.do(...r([...[...e.text].map((e,t)=>o(N(n,t),{text:e,tone:`queued`})),z(`주문 ${n+1} → ${d(e.text)}`)]))}else g.phase(`그대로 두기`,`${d(s)}를 정렬하지 않고 주문한 순서 그대로 조합을 만듭니다.`,m.sort),g.do(...r([...[...s].map((e,t)=>o(N(n,t),{tone:`queued`})),z(`주문 ${n+1} → ${d(s)} 그대로`)]));let u=e.combos.filter(e=>e.count===1),f=N(n,s.length-1);g.phase(`조합 세기`,`조합 ${e.combos.length}가지를 세어 막대에 더합니다. ${u.length?`새 조합 ${u.length}개`:``}${u.length&&e.combos.length>u.length?`, `:``}${e.combos.length>u.length?`이미 있던 조합 ${e.combos.length-u.length}개는 한 번 더 셉니다`:``}.`,m.count),g.do(...r(u.map(e=>({type:`add`,item:B(e.key,h.get(e.key),0),from:f})))),g.do({type:`focus`,ids:[...[...s].map((e,t)=>N(n,t))]}),g.do(...r(e.combos.map(e=>({type:`arrow`,from:f,to:F(e.key),verdict:e.count===1?`new`:`good`,label:e.count===1?`새 조합`:`${e.count}번째`}))),i(150)),g.do(...r([...a(),...e.combos.map(e=>V(e.key,e.count,e.count>=2?`chosen`:`plain`)),...[...s].map((e,t)=>c(N(n,t),`visited`))])),e.combos.forEach(e=>E.set(e.key,e.count))}),S=-1,p.picks.forEach(e=>{C=e.size,x=[...x,...e.menus];let t=[...p.counters.get(e.size)];g.step({title:e.menus.length?`크기 ${e.size}: 최다 ${e.top}회 → ${e.menus.join(`, `)}`:`크기 ${e.size}: 코스 없음`,codeHighlights:m.pick,...w()}),g.phase(`최다 고르기`,t.length===0?`크기 ${e.size}로 만들 수 있는 조합이 하나도 없습니다(주문한 메뉴가 모두 ${e.size-1}개 이하). 이 크기의 코스는 없습니다.`:e.menus.length?`크기 ${e.size} 조합 가운데 가장 많이 주문된 것은 ${e.top}회이고, 2회 이상이라 ${e.menus.map(d).join(`, `)}를 코스로 정합니다.${e.menus.length>1?` 같은 횟수는 모두 넣습니다.`:``}`:`크기 ${e.size} 조합은 가장 많아야 ${e.top}회라 2명 이상이 주문한 조합이 없습니다. 이 크기의 코스는 없습니다.`,m.pick),g.do(...r([o(`t:k`,{text:`코스 크기 ${e.size}`},!0),o(`t:max`,{text:`가장 많은 주문 ${e.top}회`},!0),...t.filter(([t])=>e.menus.includes(t)).map(([e])=>c(F(e),`good`))])),g.do(...r([o(`t:res`,{text:`코스 ${x.join(`, `)}`},!0),z(e.menus.length?`크기 ${e.size}: ${e.menus.join(`, `)}`:`크기 ${e.size}: 없음`)]))}),C=void 0;let D=p.answer;if(g.step({title:t?`${f(D)}`:`${f(D)} — 정답은 ${f(_.answer)}`,codeHighlights:m.done,...w(),answer:D,isKeyframe:!0}),t)g.phase(`결과`,`크기별로 고른 조합을 사전 순으로 정렬해 ${n(f(D),`을`,`를`)} 돌려줍니다. 조합 ${y(p)}개를 세는 것으로 끝났습니다.`,m.done),g.do(...r([o(`t:res`,{text:`코스 ${D.join(`, `)}`,tone:`path`},!0),z(`답 ${D.join(`, `)}`)]));else{let e=_.answer.filter(e=>!D.includes(e));g.phase(`비교하기`,`${n(f(D),`을`,`를`)} 돌려줍니다. 하지만 정답은 ${f(_.answer)}입니다. 주문 2는 "XWY", 주문 3은 "WXA"라 "WX"가 "XW"와 "WX"로 갈라져 각각 1번으로 세어졌고, ${e.map(d).join(`, `)}가 빠졌습니다. 메뉴를 정렬해야 합니다.`,m.done),g.do(...r([o(`t:res`,{text:`코스 ${D.join(`, `)}`,tone:`bad`},!0),z(`내 답 ${D.join(`, `)} · 정답 ${_.answer.join(`, `)}`)]))}return s(g.finish())}function U(){let t=new e(R(`주문에 나온 메뉴 ${b.join(`, `)}로 후보를 먼저 모두 만듭니다`,l)),a=0,u=[],p,m=()=>({work:a,variables:{...p===void 0?{}:{size:p},answer:f(u)}});return t.step({title:`후보에 쓸 메뉴 ${b.length}개`,codeHighlights:D.start,...m()}),t.phase(`시작`,`주문에 나온 메뉴는 ${b.join(`, `)} ${b.length}가지입니다. 코스 크기마다 이 메뉴로 만들 수 있는 조합을 먼저 모두 만들고, 각 조합을 주문마다 일일이 맞춰 몇 번 주문되었는지 셉니다.`,D.start),t.do(i(300)),x.forEach(({size:e,counts:n})=>{p=e;let i=[...n.keys()],s=i.length*l.length;a+=s;let{top:f,menus:g}=h(n);t.step({title:`크기 ${e}: 후보 ${i.length}개 × 주문 ${l.length}개 확인${g.length?` → ${g.join(`, `)}`:``}`,codeHighlights:D.pick,...m()}),t.phase(`후보 만들기`,i.length?`크기 ${e} 조합을 ${b.length}가지 메뉴로 모두 만들면 ${i.length}개입니다.`:`크기 ${e}로 만들 수 있는 조합이 없습니다.`,D.make),t.do(...r([o(`t:k`,{text:`코스 크기 ${e}`},!0),o(`t:max`,{text:`가장 많은 주문 -`}),z(`후보 ${i.length}개`)])),t.do(...r(i.map((t,n)=>({type:`add`,item:{id:`cand:${e}:${n}`,kind:`bar`,rect:P(n),tone:`plain`,text:`${t} 0회`,fill:0}})))),t.phase(`주문마다 세기`,`후보 ${i.length}개를 주문 ${l.length}개에 일일이 맞춰 ${s}번 확인합니다. 조합의 메뉴가 주문에 모두 들어 있으면 한 번으로 셉니다.`,D.count),t.do(...r(i.map((t,r)=>o(`cand:${e}:${r}`,{text:`${t} ${n.get(t)}회`,fill:n.get(t)/l.length,tone:n.get(t)>=2?`chosen`:`plain`},!0)))),u=[...u,...g],t.phase(`최다 고르기`,g.length?`가장 많이 주문된 조합은 ${f}회이고 2회 이상이라 ${g.map(d).join(`, `)}를 코스로 정합니다.`:`가장 많아야 ${f}회라 2명 이상이 주문한 조합이 없습니다. 이 크기의 코스는 없습니다.`,D.pick),t.do(...r([...i.map((t,r)=>c(`cand:${e}:${r}`,g.includes(t)?`good`:n.get(t)>=2?`chosen`:`plain`)),o(`t:max`,{text:`가장 많은 주문 ${f}회`},!0),o(`t:res`,{text:`코스 ${u.join(`, `)}`},!0)])),t.do(...r(i.map((t,n)=>({type:`remove`,id:`cand:${e}:${n}`}))))}),p=void 0,t.step({title:`${f(_.answer)}`,codeHighlights:D.done,...m(),answer:_.answer,isKeyframe:!0}),t.phase(`결과`,`크기별로 고른 조합을 사전 순으로 정렬해 ${n(f(_.answer),`을`,`를`)} 돌려줍니다. 답은 정석과 같지만 후보를 모두 만들어 ${a}번 확인했습니다. 정석은 조합 ${y(_)}개만 세었습니다.`,D.done),t.do(...r([o(`t:res`,{text:`코스 ${_.answer.join(`, `)}`,tone:`path`},!0),z(`답 ${_.answer.join(`, `)}`)])),s(t.finish())}var W={id:`menu-renewal`,title:`메뉴 리뉴얼`,level:2,category:`brute-force`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/72411`,description:{summary:`레스토랑에서 손님들이 단품 메뉴를 어떻게 묶어 주문했는지(orders)와 만들고 싶은 코스 요리의 메뉴 개수(course)가 주어집니다. 코스 요리는 단품 메뉴를 2개 이상 묶어 만들고, 코스 크기마다 2명 이상이 함께 주문한 조합 가운데 가장 많이 주문된 조합을 코스로 정합니다. 가장 많은 조합이 여러 개면 모두 넣고, 결과는 사전 순으로 정렬합니다.`,rules:[`orders는 길이 2 이상 20 이하이고, 각 원소는 길이 2 이상 10 이하의 대문자 문자열(같은 알파벳이 두 번 나오지 않음)`,`course는 길이 1 이상 10 이하이고, 각 원소는 2 이상 10 이하이며 오름차순이고 중복 없음`,`최소 2명 이상이 주문한 조합만 코스가 될 수 있고, 결과는 사전 순으로 정렬한 문자열 배열(각 메뉴 문자열 안의 알파벳도 오름차순)`],examples:[{input:`orders = ["ABCFG", "AC", "CDE", "ACDE", "BCFG", "ACDEH"], course = [2, 3, 4]`,output:`["AC", "ACDE", "BCFG", "CDE"]`},{input:`orders = ["ABCDE", "AB", "CD", "ADE", "XYZ", "XYZ", "ACD"], course = [2, 3, 5]`,output:`["ACD", "AD", "ADE", "CD", "XYZ"]`},{input:`orders = ["XYZ", "XWY", "WXA"], course = [2, 3, 4]`,output:`["WX", "XY"]`}]},keyIntuitions:[`주문마다 메뉴가 최대 10개라 한 주문에서 만들 수 있는 조합은 많아야 2^10 = 1,024개입니다. 주문 20개여도 모든 조합을 만들어 세는 완전탐색이 충분히 빠릅니다.`,`같은 메뉴 조합이 순서만 달라 다른 이름("XW"와 "WX")이 되지 않게, 주문마다 메뉴를 알파벳순으로 정렬한 뒤 조합을 만들어야 합니다.`,`코스 크기마다 조합별 주문 횟수를 세어, 가장 많은 횟수가 2회 이상이면 그 횟수의 조합을 모두 고릅니다. 횟수가 같은 조합은 전부 넣습니다.`],demo:{input:[l,u],label:`orders = ["XYZ", "XWY", "WXA"], course = [2, 3, 4]`},workUnit:`조합을 세거나 확인한 횟수`,approaches:[{id:`menu-combinations`,name:`주문마다 정렬해 조합을 만들고 개수 세기`,rank:`BEST`,timeComplexity:`O(주문 수 × 2^메뉴 수)`,spaceComplexity:`O(조합 수)`,verdict:`주문마다 메뉴를 정렬하고, 코스 크기별로 만들 수 있는 조합을 모두 만들어 몇 번 주문되었는지 센 뒤 가장 많은 것을 고릅니다.`,pros:[`실제로 주문에 나온 조합만 만들어 세기 때문에 쓸데없는 조합을 만들지 않습니다.`,`메뉴를 정렬해 두어 순서가 달라도 같은 조합이 같은 이름이 됩니다.`,`횟수가 같은 조합을 모두 고르는 규칙이 코드에 그대로 나옵니다.`],cons:[`정렬을 빠뜨리면 같은 조합이 갈라져 답이 틀립니다.`,`코스 크기마다 따로 세어야 해서 사전을 크기별로 나눠 둬야 합니다.`],whyThisRank:`주문에 나온 조합만 세므로 작업이 가장 적습니다. 시각화 입력에서는 조합 ${y(_)}개만 세면 끝납니다.`,code:w,visualize:()=>H(!0)},{id:`menu-candidates`,name:`후보 조합을 먼저 모두 만들고 주문마다 확인`,rank:`ALTERNATIVE`,timeComplexity:`O(C(메뉴 종류, k) × 주문 수)`,spaceComplexity:`O(조합 수)`,verdict:`주문에 나온 모든 메뉴로 코스 크기별 후보 조합을 먼저 만들고, 후보마다 모든 주문에 들어 있는지 일일이 확인해 셉니다.`,pros:[`주문 안의 메뉴 순서나 정렬을 신경 쓰지 않아도 됩니다.`,`조합이 주문에 몇 번 들어 있는지를 정의 그대로 구해 이해하기 쉽습니다.`],cons:[`주문한 적 없는 조합까지 후보로 만들어 확인합니다. 시각화 입력에서는 ${x.reduce((e,t)=>e+t.counts.size,0)*l.length}번이나 확인합니다.`,`메뉴가 26가지면 후보가 수만 개로 늘어 시간이 오래 걸립니다.`],whyThisRank:`답은 같지만 후보가 주문에 나온 조합보다 훨씬 많아질 수 있습니다. 이 입력에서 정석은 ${y(_)}번이면 되는데 이 풀이는 ${x.reduce((e,t)=>e+t.counts.size,0)*l.length}번 확인합니다.`,code:E,visualize:U},{id:`menu-unsorted`,name:`메뉴를 정렬하지 않고 조합 세기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(주문 수 × 2^메뉴 수)`,spaceComplexity:`O(조합 수)`,verdict:`주문한 순서 그대로 조합을 만들어 세다가, 순서만 다른 같은 조합을 서로 다른 것으로 세어 답을 놓치는 오답 풀이입니다.`,pros:[`정석에서 정렬 한 줄만 빠진 모양이라 쓰기 쉽습니다.`,`주문마다 메뉴가 이미 알파벳순으로 들어오는 입력에서는 맞습니다.`],cons:[`시각화 입력에서 주문 "XWY"와 "WXA"의 "XW"와 "WX"가 다른 조합으로 세어져 "WX"가 1번씩만 나옵니다. ${f(v.answer)}만 돌려주고 정답 ${f(_.answer)}과 다릅니다.`,`원문 예제 중 주문이 모두 정렬된 입력은 통과해서 틀린 줄 알아채기 어렵습니다.`],whyThisRank:`조합은 메뉴의 집합이라 순서가 달라도 같아야 합니다. 주문마다 메뉴를 정렬해서 조합의 이름을 하나로 맞춰야 정확히 셀 수 있습니다.`,code:O,visualize:()=>H(!1)}],checks:{cases:[{args:[[`ABCFG`,`AC`,`CDE`,`ACDE`,`BCFG`,`ACDEH`],[2,3,4]],expected:[`AC`,`ACDE`,`BCFG`,`CDE`]},{args:[[`ABCDE`,`AB`,`CD`,`ADE`,`XYZ`,`XYZ`,`ACD`],[2,3,5]],expected:[`ACD`,`AD`,`ADE`,`CD`,`XYZ`]},{args:[[`XYZ`,`XWY`,`WXA`],[2,3,4]],expected:[`WX`,`XY`]},{args:[[`AB`,`BA`],[2]],expected:[`AB`]},{args:[[`AB`,`CD`],[2]],expected:[]},{args:[[`ABC`,`ABC`,`ABC`],[2,3]],expected:[`AB`,`ABC`,`AC`,`BC`]},{args:[[`AB`,`AB`],[3]],expected:[]},{args:[l,u],expected:[`WX`,`XY`]}],random:e=>{let t=Array.from({length:2+Math.floor(e()*4)},()=>{let t=[...`ABCDEF`];for(let n=t.length-1;n>0;n--){let r=Math.floor(e()*(n+1));[t[n],t[r]]=[t[r],t[n]]}return t.slice(0,2+Math.floor(e()*4)).join(``)}),n=[2,3,4,5].filter(()=>e()<.6);return[t,n.length?n:[2]]}}};export{W as default};