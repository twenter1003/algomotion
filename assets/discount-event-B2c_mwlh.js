import{o as e}from"./layout-DFaYBMY_.js";import{a as t,c as n,i as r,r as i,s as a}from"./shared-e6uNbDLo.js";var o=[`banana`,`apple`,`rice`,`pork`,`pot`],s=[3,2,2,2,1],c=[`chicken`,`apple`,`apple`,`banana`,`rice`,`apple`,`pork`,`banana`,`pork`,`rice`,`pot`,`banana`,`apple`,`banana`],l=c.length,u=10,d=l-u+1,f=3,p=[`banana`,`apple`,`rice`,`pork`,`pot`,`chicken`],m={banana:`바나나`,apple:`사과`,rice:`쌀`,pork:`돼지`,pot:`냄비`,chicken:`치킨`},h=new Map(o.map((e,t)=>[e,s[t]])),g=e=>`{${[...e].filter(([,e])=>e>0).map(([e,t])=>`${e}:${t}`).join(`, `)}}`,_={python:`def solution(want, number, discount):
    target = dict(zip(want, number))            # 원하는 품목 → 목표 수량
    window = {}
    for item in discount[:10]:                  # 첫 10일 창 세기
        window[item] = window.get(item, 0) + 1

    answer = 1 if window == target else 0
    for i in range(1, len(discount) - 9):       # 창을 하루씩 오른쪽으로 밀기
        out_item = discount[i - 1]              # 창에서 빠지는 날
        window[out_item] -= 1
        if window[out_item] == 0:
            del window[out_item]
        in_item = discount[i + 9]               # 창에 새로 들어오는 날
        window[in_item] = window.get(in_item, 0) + 1
        if window == target:
            answer += 1
    return answer`,javascript:`function solution(want, number, discount) {
  const target = new Map(want.map((w, i) => [w, number[i]]));
  const window = new Map();
  for (let i = 0; i < 10; i++) { // 첫 10일 창 세기
    window.set(discount[i], (window.get(discount[i]) ?? 0) + 1);
  }

  const same = () => target.size === window.size
    && [...target].every(([k, v]) => window.get(k) === v);
  let answer = same() ? 1 : 0;

  for (let i = 1; i <= discount.length - 10; i++) { // 창을 하루씩 오른쪽으로 밀기
    const outItem = discount[i - 1]; // 창에서 빠지는 날
    if (window.get(outItem) === 1) window.delete(outItem);
    else window.set(outItem, window.get(outItem) - 1);

    const inItem = discount[i + 9]; // 창에 새로 들어오는 날
    window.set(inItem, (window.get(inItem) ?? 0) + 1);
    if (same()) answer++;
  }
  return answer;
}`},v={target:r(_,[`target = dict(zip(want, number))`],[`const target = new Map(`]),firstWin:r(_,[`window = {}`,`for item in discount[:10]:`,`window[item] = window.get(item, 0) + 1`],[`const window = new Map()`,`for (let i = 0; i < 10; i++)`,`window.set(discount[i]`]),firstCheck:r(_,[`answer = 1 if window == target else 0`],[`const same = () =>`,`let answer = same() ? 1 : 0`]),slide:r(_,[`for i in range(1, len(discount) - 9):`,`out_item = discount[i - 1]`,`in_item = discount[i + 9]`],[`for (let i = 1; i <= discount.length - 10; i++)`,`const outItem = discount[i - 1]`,`const inItem = discount[i + 9]`]),check:r(_,[`if window == target:`,`answer += 1`],[`if (same()) answer++`]),done:r(_,[`return answer`],[`return answer`])},y={python:`from collections import Counter

def solution(want, number, discount):
    target = dict(zip(want, number))
    answer = 0

    for i in range(len(discount) - 9):
        # 시작일마다 10일치를 처음부터 다시 센다
        window = Counter(discount[i:i + 10])
        if window == target:
            answer += 1
    return answer`,javascript:`function solution(want, number, discount) {
  const target = new Map(want.map((w, i) => [w, number[i]]));
  let answer = 0;

  for (let i = 0; i <= discount.length - 10; i++) {
    // 시작일마다 10일치를 처음부터 다시 센다
    const window = new Map();
    for (let j = i; j < i + 10; j++) {
      window.set(discount[j], (window.get(discount[j]) ?? 0) + 1);
    }
    const ok = target.size === window.size
      && [...target].every(([k, v]) => window.get(k) === v);
    if (ok) answer++;
  }
  return answer;
}`},b={target:r(y,[`target = dict(zip(want, number))`,`answer = 0`],[`const target = new Map(`,`let answer = 0`]),loop:r(y,[`for i in range(len(discount) - 9):`,`window = Counter(discount[i:i + 10])`],[`for (let i = 0; i <= discount.length - 10; i++)`,`const window = new Map()`,`for (let j = i; j < i + 10; j++)`]),check:r(y,[`if window == target:`,`answer += 1`],[`const ok = target.size === window.size`,`if (ok) answer++`]),done:r(y,[`return answer`],[`return answer`])},x={python:`# 주의: 창을 밀 때 지나간 날의 품목을 빼지 않아 틀리는 풀이입니다
def solution(want, number, discount):
    target = dict(zip(want, number))
    window = {}
    for item in discount[:10]:
        window[item] = window.get(item, 0) + 1

    answer = 1 if window == target else 0
    for i in range(1, len(discount) - 9):
        in_item = discount[i + 9]               # 새로 들어오는 날만 더하고 빠지는 날을 안 뺌!
        window[in_item] = window.get(in_item, 0) + 1
        if window == target:
            answer += 1
    return answer`,javascript:`// 주의: 창을 밀 때 지나간 날의 품목을 빼지 않아 틀리는 풀이입니다
function solution(want, number, discount) {
  const target = new Map(want.map((w, i) => [w, number[i]]));
  const window = new Map();
  for (let i = 0; i < 10; i++) {
    window.set(discount[i], (window.get(discount[i]) ?? 0) + 1);
  }

  const same = () => target.size === window.size
    && [...target].every(([k, v]) => window.get(k) === v);
  let answer = same() ? 1 : 0;

  for (let i = 1; i <= discount.length - 10; i++) {
    const inItem = discount[i + 9]; // 새로 들어오는 날만 더하고 빠지는 날을 안 뺌!
    window.set(inItem, (window.get(inItem) ?? 0) + 1);
    if (same()) answer++;
  }
  return answer;
}`},S={init:r(x,[`target = dict(zip(want, number))`,`for item in discount[:10]:`,`answer = 1 if window == target else 0`],[`const target = new Map(`,`for (let i = 0; i < 10; i++)`,`let answer = same() ? 1 : 0`]),slide:r(x,[`for i in range(1, len(discount) - 9):`,`in_item = discount[i + 9]`,`window[in_item] = window.get(in_item, 0) + 1`],[`for (let i = 1; i <= discount.length - 10; i++)`,`const inItem = discount[i + 9]`,`window.set(inItem`]),check:r(x,[`if window == target:`,`answer += 1`],[`if (same()) answer++`]),done:r(x,[`return answer`],[`return answer`])},C=(...e)=>({python:[...new Set(e.flatMap(e=>e.python))].sort((e,t)=>e-t),javascript:[...new Set(e.flatMap(e=>e.javascript))].sort((e,t)=>e-t)}),w=26,T=108,E=170,D=248,O=670,k=300,A=e({x:60,y:w,w:40,h:48,gap:3}),j=e({x:68,y:T,w:88,h:50,gap:8}),M=e({x:68,y:E,w:88,h:50,gap:8}),N=e({x:68,y:D,w:82,h:34,gap:8}),P={x:526,y:D,w:132,h:34},F=e=>({x:A(e).x-2,y:22,w:431,h:56}),I=e=>`day:${e}`,L=e=>`target:${e}`,R=e=>`cur:${e}`,z=e=>`start:${e}`;function B(){let e=[{id:`row:day`,kind:`text`,rect:{x:0,y:w,w:56,h:48},text:`할인 일정`},{id:`row:target`,kind:`text`,rect:{x:0,y:T,w:62,h:50},text:`목표 수량`},{id:`row:cur`,kind:`text`,rect:{x:0,y:E,w:62,h:50},text:`창 안 개수`},{id:`row:start`,kind:`text`,rect:{x:0,y:D,w:62,h:34},text:`시작일 판정`}];c.forEach((t,n)=>{e.push({id:I(n),kind:`cell`,rect:A(n),tone:`plain`,text:m[t],tag:`${n+1}일`})}),p.forEach((t,n)=>{let r=h.get(t)??0;e.push({id:L(n),kind:`cell`,rect:j(n),tone:r>0?`chosen`:`muted`,text:String(r),tag:m[t]},{id:R(n),kind:`cell`,rect:M(n),tone:`plain`,text:`0`,tag:t})});for(let t=0;t<d;t++)e.push({id:z(t),kind:`token`,rect:N(t),tone:`plain`,text:`${t+1}일째: 대기`});return e.push({id:`ans`,kind:`token`,rect:P,tone:`chosen`,text:`가능 0일`}),{width:O,height:k,items:e}}var V=e=>({type:`wait`,ms:e}),H=(e,t)=>({type:`set`,id:e,patch:{tone:t}}),U=e=>a(p.map((t,n)=>{let r=e.get(t)??0,i=h.get(t)??0;return{type:`set`,id:R(n),patch:{text:String(r),tone:r===i?`good`:`bad`},pop:!0}})),W=e=>a(c.map((t,n)=>H(I(n),n>=e&&n<e+u?`chosen`:`plain`))),G=e=>p.every(t=>(e.get(t)??0)===(h.get(t)??0));function K(){let e=new n(B()),r=new Map,o=0,s=0,l=`-`,f=`-`,h=`-`,_=()=>({work:o,variables:{시작일:l,빠짐:f,들어옴:h,window:g(r),answer:s}});e.step({title:`원하는 품목과 목표 수량 사전 만들기`,codeHighlights:v.target,..._()}),e.phase(`목표 사전`,`정현이가 원하는 품목 5가지의 목표 수량(합계 10개)을 사전에 기록합니다. 치킨은 목표가 0개입니다.`,v.target),e.do(...a(p.map((e,t)=>({type:`focus`,ids:[L(t)]}))),V(400),{type:`unfocus`});for(let e=0;e<5;e++)r.set(c[e],(r.get(c[e])??0)+1);o+=5,l=`1일째(준비)`,e.step({title:`첫 10일 창 세기 (1/2): 1일~5일 품목 담기`,codeHighlights:v.firstWin,..._()}),e.phase(`앞 5일 세기`,`먼저 1일째부터 5일째까지 할인 품목 5개를 창에 담아 개수를 셉니다.`,v.firstWin),e.do({type:`add`,item:{id:`win`,kind:`zone`,rect:F(0),tone:`chosen`}},...a(Array.from({length:5},(e,t)=>H(I(t),`current`))),...U(r),V(300));for(let e=5;e<10;e++)r.set(c[e],(r.get(c[e])??0)+1);o+=5,e.step({title:`첫 10일 창 세기 (2/2): 6일~10일 품목 담기`,codeHighlights:v.firstWin,..._()}),e.phase(`뒤 5일 세기`,`6일째부터 10일째까지 마저 담아 첫 10일 창(1일~10일)의 개수 세기를 마칩니다.`,v.firstWin),e.do(...W(0),...U(r),V(300)),l=`1일째(1~10일)`,e.step({title:`1일째(1~10일) 판정: 치킨 1개·사과 3개라 불일치`,codeHighlights:v.firstCheck,..._()}),e.phase(`1일째 판정`,`1일~10일 창에는 치킨이 1개 끼어 있고 바나나(2<3)와 냄비(0<1)가 부족해 가입할 수 없습니다.`,v.firstCheck),e.do({type:`set`,id:z(0),patch:{text:`1일째: 불가`,tone:`bad`},pop:!0},V(350));for(let n=1;n<d;n++){let d=c[n-1],g=c[n+u-1];r.set(d,(r.get(d)??0)-1),(r.get(d)??0)<=0&&r.delete(d),r.set(g,(r.get(g)??0)+1),o+=2,l=`${n+1}일째(${n+1}~${n+u}일)`,f=`${n}일(${m[d]})`,h=`${n+u}일(${m[g]})`;let y=G(r);y&&s++,e.step({title:`${n+1}일째: ${m[d]} 빠지고 ${m[g]} 들어옴 → ${y?`일치! (${s}일째 가능)`:`불일치`}`,codeHighlights:C(v.slide,v.check),..._()}),e.phase(`창 한 칸 밀기`,`창을 오른쪽으로 한 칸 밀어 ${n}일째 ${i(m[d],`은`,`는`)} 1 빼고, ${n+u}일째 ${i(m[g],`은`,`는`)} 1 더합니다. 가운데 9일은 다시 세지 않습니다.`,v.slide),e.do(...a([{type:`set`,id:`win`,patch:{rect:F(n),tone:y?`good`:`chosen`}},...W(n),H(I(n-1),`muted`),H(I(n+u-1),`current`)]),{type:`arrow`,from:I(n-1),to:R(p.indexOf(d)),verdict:`bad`,label:`-1`},{type:`arrow`,from:I(n+u-1),to:R(p.indexOf(g)),verdict:`good`,label:`+1`,together:!0},...U(r)),e.phase(`목표와 비교`,y?`모든 품목 수량이 목표와 정확히 일치합니다! 가능한 날짜가 ${t(s)} 늘어납니다.`:`아직 목표 수량과 다른 품목이 있어 이 날은 가입하지 않습니다.`,v.check),e.do(...a([{type:`clearMarks`},H(I(n+u-1),`chosen`),{type:`set`,id:z(n),patch:{text:`${n+1}일째: ${y?`가능!`:`불가`}`,tone:y?`good`:`bad`},pop:!0},{type:`set`,id:`ans`,patch:{text:`가능 ${s}일`,tone:s>0?`good`:`chosen`},pop:y}]))}return e.step({title:`총 ${s}일(3일·4일·5일째) 등록 가능 — 품목 갱신 ${o}번`,codeHighlights:v.done,..._(),answer:s,isKeyframe:!0}),e.phase(`정답`,`3일째, 4일째, 5일째에 등록하면 10일 동안 원하는 품목을 모두 할인받습니다. 양 끝만 갱신해 ${o}번만 세고 끝났습니다.`,v.done),e.do(...a([H(z(2),`path`),H(z(3),`path`),H(z(4),`path`),{type:`set`,id:`ans`,patch:{text:`정답 ${s}일`,tone:`path`},pop:!0}]),V(500)),e.finish()}function q(){let e=new n(B()),t=0,r=0,i=`-`,o=`-`,s=()=>({work:t,variables:{시작일:i,window:o,answer:r}});e.step({title:`목표 수량 사전 준비하기`,codeHighlights:b.target,...s()}),e.phase(`목표 사전`,`원하는 품목과 목표 수량을 사전에 저장하고 시작일마다 10일 구간을 검사합니다.`,b.target),e.do({type:`add`,item:{id:`win`,kind:`zone`,rect:F(0),tone:`chosen`}},V(350));for(let n=0;n<d;n++){let l=new Map;for(let e=n;e<n+u;e++)l.set(c[e],(l.get(c[e])??0)+1);t+=u,i=`${n+1}일째(${n+1}~${n+u}일)`,o=g(l);let d=G(l);d&&r++,e.step({title:`${n+1}일째: ${n+1}~${n+u}일 10개를 처음부터 다시 세기 → ${d?`일치!`:`불일치`}`,codeHighlights:C(b.loop,b.check),...s()}),e.phase(`10일 다시 세기`,`${n+1}일째부터 ${n+u}일째까지 10칸을 처음부터 모두 다시 셉니다 (누적 ${t}번).`,b.loop),e.do(...a([{type:`set`,id:`win`,patch:{rect:F(n),tone:d?`good`:`chosen`}},...W(n),...U(l)]),V(250)),e.phase(`판정`,d?`목표 수량과 모두 같으므로 answer를 1 늘립니다.`:`목표 수량과 다른 품목이 있어 넘어갑니다.`,b.check),e.do(...a([{type:`set`,id:z(n),patch:{text:`${n+1}일째: ${d?`가능!`:`불가`}`,tone:d?`good`:`bad`},pop:!0},{type:`set`,id:`ans`,patch:{text:`가능 ${r}일`,tone:r>0?`good`:`chosen`},pop:d}]))}return e.step({title:`총 ${r}일 가능 — 품목 세기 ${t}번 (정석은 18번)`,codeHighlights:b.done,...s(),answer:r,isKeyframe:!0}),e.phase(`정답`,`답은 ${r}일로 같지만, 겹치는 9일을 매번 다시 세어 품목을 ${t}번(정석은 18번) 확인했습니다.`,b.done),e.do(...a([H(z(2),`path`),H(z(3),`path`),H(z(4),`path`),{type:`set`,id:`ans`,patch:{text:`정답 ${r}일`,tone:`path`},pop:!0}]),V(500)),e.finish()}function J(){let e=new n(B()),t=new Map,r=0,o=0,s=`-`,l=`-`,h=()=>({work:r,variables:{시작일:s,들어옴:l,window:g(t),answer:o}});for(let e=0;e<u;e++)t.set(c[e],(t.get(c[e])??0)+1);r+=u,s=`1일째(1~10일)`,e.step({title:`1일째(1~10일) 세기: 여기까지는 정석과 같음 (불일치)`,codeHighlights:S.init,...h()}),e.phase(`첫 10일 세기`,`첫 10일(1~10일)을 세어 비교합니다. 치킨이 끼어 있고 냄비가 없어 1일째는 불가입니다.`,S.init),e.do({type:`add`,item:{id:`win`,kind:`zone`,rect:F(0),tone:`bad`}},...W(0),...U(t),{type:`set`,id:z(0),patch:{text:`1일째: 불가`,tone:`bad`},pop:!0});for(let n=1;n<d;n++){let d=c[n+u-1];t.set(d,(t.get(d)??0)+1),r+=1,s=`${n+1}일째`,l=`${n+u}일(${m[d]})`,G(t)&&o++,e.step({title:`${n+1}일째: ${m[d]}만 더하고 ${n}일째 ${m[c[n-1]]}을 안 뺌 → 총합 ${10+n}개`,codeHighlights:C(S.slide,S.check),...h()}),e.phase(`빠지는 날 누락`,`새로 들어온 ${n+u}일째 ${i(m[d],`은`,`는`)} 더했지만, 창에서 빠진 ${n}일째 ${i(m[c[n-1]],`을`,`를`)} 빼지 않아 창 안 개수 합이 ${10+n}개로 부풀었습니다.`,S.slide),e.do(...a([{type:`set`,id:`win`,patch:{rect:{x:A(0).x-2,y:22,w:(u+n)*43-3+4,h:56},tone:`bad`}},H(I(n+u-1),`current`),...U(t)]),{type:`arrow`,from:I(n+u-1),to:R(p.indexOf(d)),verdict:`bad`,label:`+1 (안 뺌!)`}),e.phase(`판정 실패`,`지나간 날의 품목이 그대로 남아 있어 목표 수량(합계 10개)과 절대 같아질 수 없습니다.`,S.check),e.do({type:`clearMarks`},{type:`set`,id:z(n),patch:{text:`${n+1}일째: 불가`,tone:`bad`},pop:!0})}return e.step({title:`오답 ${o}일 — 정답은 ${f}일`,codeHighlights:S.done,...h(),answer:o,isKeyframe:!0}),e.phase(`오답 확인`,`창을 오른쪽으로 밀 때는 새로 들어오는 날(+1)뿐 아니라 창에서 빠지는 날(-1, 0이 되면 키 삭제)도 함께 처리해야 정답 ${f}일이 나옵니다.`,S.done),e.do({type:`set`,id:`ans`,patch:{text:`오답 ${o}일`,tone:`bad`},pop:!0},{type:`add`,item:{id:`right`,kind:`token`,rect:{x:526,y:212,w:132,h:30},tone:`good`,text:`정답은 ${f}일`}},V(600)),e.finish()}var Y={id:`discount-event`,title:`할인 행사`,level:2,category:`hash`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/131127`,description:{summary:`마트에서 매일 한 가지 제품을 할인하고 회원은 하루에 하나씩만 살 수 있습니다. 원하는 제품(want)과 수량(number, 합계 10개)이 회원 자격 기간인 연속 10일 동안의 할인 제품 구성과 정확히 일치하는 회원등록 시작일이 모두 며칠인지 구합니다.`,rules:[`1 ≤ want의 길이 = number의 길이 ≤ 10`,`1 ≤ number의 원소 ≤ 10이며, number 원소의 합은 10`,`10 ≤ discount의 길이 ≤ 100,000`,`가능한 날이 없으면 0을 반환`],examples:[{input:`want = ["banana", "apple", "rice", "pork", "pot"], number = [3, 2, 2, 2, 1], discount = ["chicken", "apple", "apple", "banana", "rice", "apple", "pork", "banana", "pork", "rice", "pot", "banana", "apple", "banana"]`,output:`3`},{input:`want = ["apple"], number = [10], discount = ["banana", "banana", "banana", "banana", "banana", "banana", "banana", "banana", "banana", "banana"]`,output:`0`}]},keyIntuitions:[`원하는 품목과 수량의 합이 항상 10이므로, 연속 10일 구간 안의 품목별 개수 사전이 목표 수량 사전과 같은지 비교하는 문제입니다.`,`시작일이 하루 뒤로 밀릴 때 가운데 9일은 그대로이고 맨 앞 하루만 빠지고 맨 뒤 하루만 새로 들어옵니다.`,`슬라이딩 윈도우로 빠지는 품목(-1)과 들어오는 품목(+1)만 갱신하면 구간 길이가 길어져도 하루에 두 번만 사전을 고치면 됩니다.`],demo:{input:[o,s,c],label:`want = ["banana", "apple", "rice", "pork", "pot"], number = [3, 2, 2, 2, 1], discount = 14일치`},workUnit:`할인 품목을 세어 본 횟수`,approaches:[{id:`discount-event-sliding`,name:`10일 창 밀며 양 끝만 갱신하기 (슬라이딩 윈도우)`,rank:`BEST`,timeComplexity:`O(N)`,spaceComplexity:`O(1)`,verdict:`첫 10일만 세고, 이후에는 빠지는 날과 들어오는 날 두 개만 갱신하는 풀이입니다.`,pros:[`겹치는 9일치 품목을 다시 세지 않아 할인 배열을 한 번만 훑습니다.`,`창의 크기가 10일이 아니라 수천 일로 늘어나는 변형 문제에서도 그대로 O(N)에 동작합니다.`],cons:[`빠지는 품목의 개수가 0이 되었을 때 사전에서 키를 지워야(del / delete) 사전 동등 비교가 어긋나지 않습니다.`],whyThisRank:`"연속된 고정 길이 구간의 빈도표"를 다루는 가장 정석적인 해시 + 슬라이딩 윈도우 결합입니다.`,code:_,visualize:K},{id:`discount-event-recount`,name:`시작일마다 10일 구간을 처음부터 다시 세기`,rank:`ALTERNATIVE`,timeComplexity:`O(10 × N)`,spaceComplexity:`O(1)`,verdict:`시작일마다 길이 10짜리 부분 배열의 개수를 새로 세는 풀이로, 코드는 짧지만 매번 10개씩 다시 셉니다.`,pros:[`Python의 Counter(discount[i:i+10]) == target처럼 몇 줄로 간단히 구현할 수 있습니다.`,`개수가 0이 된 키를 지우는 관리를 신경 쓰지 않아도 됩니다.`],cons:[`시작일마다 10개씩 다시 세므로 품목 확인 횟수가 10 × (N − 9)번(이 예에서 50번 vs 정석 18번)으로 늘어납니다.`,`만약 회원 자격 기간이 10일이 아니라 K일로 커지는 일반화된 문제라면 O(N × K)가 되어 시간 초과가 납니다.`],whyThisRank:`"창 길이가 10으로 고정"이라는 이 문제의 특수한 조건 덕분에 통과하지만, 불필요한 중복 세기를 하고 일반성이 떨어져 대안으로 둡니다.`,code:y,visualize:q},{id:`discount-event-forget-out`,name:`창을 밀 때 빠지는 날을 빼지 않기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(1)`,verdict:`새로 들어오는 날만 더하고 10일 창 밖으로 밀려난 날의 품목을 빼지 않아 틀리는 풀이입니다.`,pros:[`첫 10일 구간(1일째)에서 일치하는 경우는 그대로 찾을 수 있습니다.`],cons:[`2일째부터는 창 안 개수 합이 11, 12, 13…으로 늘어나 목표 수량(합계 10)과 절대 일치할 수 없습니다.`],whyThisRank:`슬라이딩 윈도우에서 가장 흔한 실수는 들어오는 값만 반영하고 나가는 값을 되돌리지 않는 것입니다.`,code:x,visualize:J}],checks:{cases:[{args:[[`banana`,`apple`,`rice`,`pork`,`pot`],[3,2,2,2,1],[`chicken`,`apple`,`apple`,`banana`,`rice`,`apple`,`pork`,`banana`,`pork`,`rice`,`pot`,`banana`,`apple`,`banana`]],expected:3},{args:[[`apple`],[10],[`banana`,`banana`,`banana`,`banana`,`banana`,`banana`,`banana`,`banana`,`banana`,`banana`]],expected:0},{args:[[`apple`],[10],[`apple`,`apple`,`apple`,`apple`,`apple`,`apple`,`apple`,`apple`,`apple`,`apple`]],expected:1},{args:[[`a`,`b`],[5,5],[`c`,`a`,`b`,`a`,`b`,`a`,`b`,`a`,`b`,`a`,`b`,`a`]],expected:2}],random:e=>{let t=1+Math.floor(e()*8),n=10-t,r=[`a`,`b`],i=[t,n],a=[`a`,`b`,`c`],o=10+Math.floor(e()*6);return[r,i,Array.from({length:o},()=>a[Math.floor(e()*(e()<.7?2:3))])]}}};export{Y as default};