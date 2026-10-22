import{n as e}from"./layout-DFaYBMY_.js";import{a as t,c as n,i as r,o as i,s as a}from"./shared-e6uNbDLo.js";import{t as o}from"./lane-BzDhdR3X.js";var s=6,c=[7,10],l=Math.max(...c)*s,u=e=>c.map(t=>Math.floor(e/t)),d={python:`def solution(n, times):
    left, right = 1, max(times) * n  # 가장 느린 심사관 혼자 n명을 맡는 시간
    answer = right

    while left <= right:
        mid = (left + right) // 2
        # mid분 동안 심사관 전원이 처리할 수 있는 인원
        total = sum(mid // t for t in times)

        if total >= n:     # 충분하다 → 답 후보로 저장하고 더 짧게
            answer = mid
            right = mid - 1
        else:              # 부족하다 → 시간을 늘린다
            left = mid + 1

    return answer`,javascript:`function solution(n, times) {
  let left = 1;
  let right = Math.max(...times) * n; // 가장 느린 심사관 혼자 n명을 맡는 시간
  let answer = right;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // mid분 동안 심사관 전원이 처리할 수 있는 인원
    let total = 0;
    for (const t of times) total += Math.floor(mid / t);

    if (total >= n) { // 충분하다 → 답 후보로 저장하고 더 짧게
      answer = mid;
      right = mid - 1;
    } else { // 부족하다 → 시간을 늘린다
      left = mid + 1;
    }
  }

  return answer;
}`},f={start:r(d,[`left, right = 1`,`answer = right`],[`let left = 1`,`let right = Math.max`,`let answer = right`]),mid:r(d,[`while left <= right`,`mid = (left + right) // 2`],[`while (left <= right)`,`const mid = Math.floor`]),count:r(d,[`total = sum(`],[`let total = 0`,`for (const t of times)`]),pass:r(d,[`if total >= n`,`answer = mid`,`right = mid - 1`],[`if (total >= n)`,`answer = mid`,`right = mid - 1`]),fail:r(d,[`if total >= n`,`else:`,`left = mid + 1`],[`if (total >= n)`,`} else {`,`left = mid + 1`]),done:r(d,[`while left <= right`,`return answer`],[`while (left <= right)`,`return answer`])},p={python:`import heapq

def solution(n, times):
    # (다음 심사가 끝나는 시각, 심사 시간)
    heap = [(t, t) for t in times]
    heapq.heapify(heap)

    finish = 0
    for _ in range(n):  # 사람마다 힙 연산 → n이 10억이면 시간 초과
        end, t = heapq.heappop(heap)
        finish = end
        heapq.heappush(heap, (end + t, t))
    return finish`,javascript:`function solution(n, times) {
  // [다음 심사가 끝나는 시각, 심사 시간]을 담는 최소 힙 (정렬된 배열은 이미 힙입니다)
  const heap = times.map((t) => [t, t]).sort((a, b) => a[0] - b[0]);
  const siftDown = (i) => {
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let min = i;
      if (l < heap.length && heap[l][0] < heap[min][0]) min = l;
      if (r < heap.length && heap[r][0] < heap[min][0]) min = r;
      if (min === i) return;
      [heap[min], heap[i]] = [heap[i], heap[min]];
      i = min;
    }
  };

  let finish = 0;
  for (let k = 0; k < n; k++) { // 사람마다 힙 연산 → n이 10억이면 시간 초과
    const [end, t] = heap[0];
    finish = end;
    heap[0] = [end + t, t]; // 루트 값만 커지므로 아래로 내리면 됩니다
    siftDown(0);
  }
  return finish;
}`},m={start:r(p,[`heap = [(t, t) for t in times]`,`heapq.heapify(heap)`],[`const heap = times.map`]),pop:r(p,[`for _ in range(n)`,`end, t = heapq.heappop(heap)`],[`for (let k = 0; k < n; k++)`,`const [end, t] = heap[0]`]),assign:r(p,[`finish = end`],[`finish = end`]),push:r(p,[`heapq.heappush(heap, (end + t, t))`],[`heap[0] = [end + t, t]`,`siftDown(0)`]),done:r(p,[`return finish`],[`return finish`])},h={python:`def solution(n, times):
    t = 1
    while sum(t // time for time in times) < n:
        t += 1  # 답이 10^18이면 10^18번 반복
    return t`,javascript:`function solution(n, times) {
  let t = 1;
  while (times.reduce((acc, time) => acc + Math.floor(t / time), 0) < n) {
    t++; // 답이 10^18이면 10^18번 반복
  }
  return t;
}`},g={start:r(h,[`t = 1`],[`let t = 1`]),check:r(h,[`while sum(`],[`while (times.reduce(`]),next:r(h,[`t += 1`],[`t++`]),loop:r(h,[`while sum(`,`t += 1`],[`while (times.reduce(`,`t++`]),done:r(h,[`return t`],[`return t`])},_=e({x:96,w:360,min:0,max:l}),v=108,y=e=>({x:92,y:132+e*54,w:368,h:44}),b=y(c.length-1).y+44,x=b+22,S=540,C=x+44,w={x:0,y:0,w:S,h:C},T=(e,t)=>`person:${e}:${t}`,E=(e,t,n)=>{let[r,i]=[_(t*c[e]),_((t+1)*c[e])];return{id:T(e,t),kind:`cell`,rect:{x:r+2,y:y(e).y+4,w:i-r-4,h:36},tone:`visited`,text:n}},D=(e,t)=>{let n=[];for(let r=0;e.has(T(t,r));r++)n.push(T(t,r));return n},O=(e,t)=>[{id:`range`,kind:`zone`,rect:{x:_(e-.5),y:96,w:_(t+.5)-_(e-.5),h:24}},{id:`left`,kind:`token`,rect:{x:_(e-.5)-76,y:30,w:76,h:24},tone:`plain`,text:`left ${e}`},{id:`right`,kind:`token`,rect:{x:_(t+.5),y:30,w:76,h:24},tone:`plain`,text:`right ${t}`}],k=e=>({id:`answer`,kind:`token`,rect:{x:_(e)-42,y:0,w:84,h:24},tone:`path`,text:`answer ${e}`});function A(...e){let t=[{id:`track`,kind:`line`,rect:w,tone:`trail`,points:[[_(0),v],[_(l),v]]}];return c.forEach((e,n)=>{let r=y(n);t.push({id:`name:${n}`,kind:`text`,rect:{x:0,y:r.y,w:88,h:22},text:`${n+1}번 심사관`},{id:`speed:${n}`,kind:`text`,rect:{x:0,y:r.y+22,w:88,h:22},tone:`muted`,text:`${e}분에 1명`},{id:`row:${n}`,kind:`zone`,rect:r},{id:`calc:${n}`,kind:`text`,rect:{x:324,y:r.y,w:128,h:44},text:``})}),t.push({id:`sum`,kind:`text`,rect:{x:0,y:x,w:88,h:36},text:`합계`},{id:`tally`,kind:`bar`,rect:{x:96,y:x,w:240,h:36},fill:0,text:`0명`},{id:`goal`,kind:`token`,rect:{x:344,y:x,w:72,h:36},tone:`plain`,text:`${s}명`,tag:`목표`},...e),{width:S,height:C,items:t}}var j=(e,{id:t,kind:n,...r})=>e.has(t)?{type:`set`,id:t,patch:r}:{type:`add`,item:{id:t,kind:n,...r}},M=(e,t,n,r)=>[j(e,{id:`probe`,kind:`token`,rect:{x:_(t)-2,y:90,w:4,h:b-90},tone:r}),j(e,{id:`probe:label`,kind:`token`,rect:{x:_(t)-42,y:64,w:84,h:26},tone:r,text:n})],N=(e,t)=>({type:`set`,id:e,patch:{text:t}}),P=(e,t)=>N(`calc:${e}`,`⌊${t} ÷ ${c[e]}⌋ = ${u(t)[e]}명`),F=(e,t)=>({type:`set`,id:`tally`,patch:{fill:Math.min(1,e/s),text:`${e}명`,tone:t}}),I=e=>({type:`arrow`,from:`tally`,to:`goal`,verdict:e?`good`:`bad`,label:e?`충분`:`부족`}),L=e=>`${c.map(t=>`⌊${e} ÷ ${t}⌋`).join(` + `)} = ${u(e).join(` + `)} = ${i(u(e))}명`,R=(e,t,n)=>{let r=[];for(let i=0;i<n||e.has(T(t,i));i++)i>=n?r.push({type:`remove`,id:T(t,i)}):e.has(T(t,i))||r.push({type:`add`,item:E(t,i,String(i+1))});return r},z=(e,t)=>{u(t).forEach((n,r)=>e.do(...a([...R(e,r,n),P(r,t),{type:`focus`,ids:Array.from({length:n},(e,t)=>T(r,t))}])));let n=i(u(t));e.do(...a([{type:`unfocus`},F(n,n>=s?`good`:`bad`)]))},B=e=>c.flatMap((t,n)=>D(e,n)).map(e=>({type:`set`,id:e,patch:{tone:`path`}}));function V(){let e=new n(A()),[r,o]=[1,l],d=o,p=0,m=0,h=()=>({work:m,variables:{left:r,right:o,mid:p||`-`,total:p?i(u(p)):`-`,answer:d}});for(e.step({title:`탐색 구간 1분 ~ ${l}분 정하기`,codeHighlights:f.start,...h()}),e.phase(`시작`,`답은 1분과 ${l}분 사이에 있습니다. ${l}분은 가장 느린 심사관 혼자 ${s}명을 모두 맡는 시간이라 늘 되므로 answer = ${l}에서 시작합니다.`),e.do(...a(O(r,o).map(t=>j(e,t)))),e.do(j(e,k(d)));r<=o;){let[n,l]=[r,o];p=Math.floor((r+o)/2),m++;let g=i(u(p)),_=g>=s;_?[d,o]=[p,p-1]:r=p+1;let v=_?f.pass:f.fail;e.step({title:`mid ${p}분 → ${g}명, ${_?`더 짧게`:`더 길게`}`,codeHighlights:v,...h()}),e.phase(`가운데 고르기`,`mid = ⌊(${n} + ${l}) ÷ 2⌋ = ${p}분입니다. ${p}분이면 ${s}명을 모두 심사할 수 있을까요?`,f.mid),e.do(...a(M(e,p,`mid ${p}`,`current`)));let y=u(p);e.phase(`세어 보기`,`${c.map((e,t)=>`${t+1}번 심사관은 ⌊${p} ÷ ${e}⌋ = ${y[t]}명`).join(`, `)}, 모두 ${g}명을 심사합니다.`,f.count),z(e,p),e.phase(`범위 줄이기`,_?`${g}명 ≥ ${s}명이라 ${p}분이면 충분합니다. answer = ${t(p)} 저장하고, 더 짧은 시간을 보려고 right = ${t(o)} 줄입니다.`:`${g}명 < ${s}명이라 ${p}분으로는 부족합니다. 시간을 늘려야 하므로 left = ${t(r)} 올립니다.${r>o?` 이제 left가 right보다 큽니다.`:``}`,v);let[b,x,S]=O(r,o);e.do(I(_)),e.do(...a([j(e,b),j(e,_?S:x),..._?[j(e,k(d))]:[]])),e.do({type:`clearMarks`})}let g=u(d);return e.step({title:`최소 시간 ${d}분`,codeHighlights:f.done,...h(),answer:d,isKeyframe:!0}),e.phase(`정답`,`반복 ${m}번 만에 left가 right보다 커져(${r} > ${o}) 끝났습니다. 답은 ${d}분입니다. ${d}분이면 ${c.map((e,t)=>`${t+1}번 심사관이 ${g[t]}명`).join(`, `)}을 맡아 ${s}명을 모두 심사합니다.`),e.do(...a([{type:`remove`,id:`answer`},...M(e,d,`answer ${d}`,`path`),{type:`remove`,id:`range`},{type:`set`,id:`left`,patch:{tone:`muted`}},{type:`set`,id:`right`,patch:{tone:`muted`}}])),e.do(...a([...g.flatMap((t,n)=>[...R(e,n,t),P(n,d)]),F(i(g),`good`)])),e.do(...a(B(e))),e.finish()}var H=(e,t)=>e.end-t.end||c[e.i]-c[t.i];function U(){let e=new n(A({id:`heap:label`,kind:`text`,rect:{x:0,y:14,w:88,h:34},text:`힙`},{id:`heap:bg`,kind:`zone`,rect:{x:92,y:14,w:208,h:34}})),t=new o(e,{id:`heap`,x:96,y:17,slotW:96,slotH:28,gap:8,max:c.length}),r=c.map((e,t)=>({end:e,i:t})).sort(H),i=c.map(()=>0),l=0,u=0,d,f=({end:e,i:t})=>({id:`heap:${e}:${t}`,text:`${e}분 · ${t+1}번`}),p=({end:e,i:t})=>`(${e}, ${c[t]})`,h=()=>({work:l,variables:{"배정한 사람":`${l}명`,"(end, t)":d?p(d):`-`,finish:u,heap:`[${r.map(p).join(`, `)}]`}}),g=r[0];e.step({title:`심사관마다 첫 사람이 끝나는 시각을 힙에 넣기`,codeHighlights:m.start,...h()}),e.phase(`시작`,`심사관마다 '다음 사람을 맡으면 끝나는 시각'을 힙에 넣습니다. ${f(g).text}은 ${g.i+1}번 심사관에게 가면 ${g.end}분에 끝난다는 뜻입니다.`);for(let e of r)t.push(f(e),`name:${e.i}`);for(;l<s;){let n=r.shift(),{end:o,i:p}=n,g=i[p]++,_={end:o+c[p],i:p};r.push(_),r.sort(H);let v=r[r.indexOf(_)+1];l++,u=o,d=n,e.step({title:`${l}번째 사람 → ${p+1}번 심사관, ${o}분에 끝`,codeHighlights:m.push,...h()}),e.phase(`꺼내기`,`힙에서 가장 빨리 끝나는 ${f(n).text}을 꺼냅니다.`,m.pop),t.shift(`name:${p}`),e.phase(`배정하기`,`${l}번째 사람을 ${p+1}번 심사관에게 맡깁니다. ${o-c[p]}분에 시작해 ${o}분에 끝나므로 finish = ${o}입니다.`,m.assign),e.do(...a([{type:`add`,item:E(p,g,String(l)),from:`name:${p}`},N(`calc:${p}`,`${i[p]}명 맡음`),F(l,l>=s?`good`:`chosen`)])),e.do(...a(M(e,o,`finish ${o}`,`path`))),e.phase(`다시 넣기`,`${p+1}번 심사관이 다음 사람을 맡으면 ${_.end}분에 끝나므로 ${f(_).text}을 힙에 다시 넣습니다.${v?` ${_.end}분이 ${v.end}분보다 빨라 앞으로 갑니다.`:``}`,m.push),t.push(f(_),T(p,g)),t.reorder(r.map(e=>f(e).id))}return e.step({title:`마지막 사람이 끝나는 ${u}분`,codeHighlights:m.done,...h(),answer:u,isKeyframe:!0}),e.phase(`정답`,`${s}명을 모두 맡겼고 마지막 사람이 ${u}분에 끝나므로 답은 ${u}분입니다. 사람마다 한 번씩 반복하므로 n이 10억이면 10억 번 반복합니다.`),e.do(...a(B(e))),e.finish()}var W=5;function G(){let e=new n(A()),t=1;for(;i(u(t))<s;)t++;let r=t-1,o=e=>({work:e,variables:{t:e||`-`,"처리 인원":e?i(u(e)):`-`}}),l=t=>{e.phase(`1분 늘리기`,t===1?`t = 1분부터 확인합니다.`:`t를 1분 늘려 ${t}분을 확인합니다.`,t===1?g.start:g.next),e.do(...a(M(e,t,`t ${t}`,`current`))),e.phase(`세어 보기`,`${L(t)}이라 ${i(u(t))>=s?`드디어 ${s}명이 됩니다.`:`${s}명에 못 미칩니다.`}`,g.check),z(e,t)};e.step({title:`1분부터 하나씩 확인하기`,codeHighlights:g.check,...o(0)}),e.phase(`시작`,`t를 1분부터 1분씩 늘려 가며, t분 동안 심사할 수 있는 인원이 ${s}명이 되는지 봅니다.`),e.do(...a(c.map((e,t)=>N(`calc:${t}`,`⌊t ÷ ${e}⌋명`))));for(let t=1;t<=W;t++)e.step({title:`t = ${t}분 → ${i(u(t))}명`,codeHighlights:g.check,...o(t)}),l(t);return e.step({title:`t = 6~${r}분 빨리 감기`,codeHighlights:g.loop,...o(r)}),e.phase(`빨리 감기`,`6분부터 ${r}분까지 ${r-W}번을 더 확인합니다. ${r}분에도 ${L(r)}이라 아직 부족합니다.`),e.do(...a([...M(e,r,`t ${r}`,`current`),...u(r).flatMap((t,n)=>R(e,n,t))])),e.do(...a([...c.map((e,t)=>P(t,r)),F(i(u(r)),`bad`)])),e.step({title:`t = ${t}분 → ${s}명, 정답`,codeHighlights:g.done,...o(t),answer:t,isKeyframe:!0}),l(t),e.phase(`정답`,`${t}분에 처음으로 ${s}명이 되어 반복을 멈춥니다. 답은 맞지만 1분씩 ${t}번 확인했습니다. 답이 10¹⁸분이면 10¹⁸번 반복합니다.`,g.done),e.do(I(!0)),e.do(...a([...M(e,t,`t ${t}`,`path`),...B(e)])),e.do({type:`clearMarks`}),e.finish()}var K={id:`immigration`,title:`입국심사`,level:3,category:`binary-search`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/43238`,description:{summary:`n명이 입국심사를 기다립니다. 심사관마다 한 명을 심사하는 데 걸리는 시간이 다를 때, 모든 사람이 심사를 받는 데 걸리는 시간의 최솟값을 구합니다. 빈 심사대가 있어도 더 빨리 끝나는 심사대를 기다렸다 갈 수 있습니다.`,rules:[`n은 1 이상 1,000,000,000 이하`,`심사 시간 times[i]는 1분 이상 1,000,000,000분 이하`,`심사관 수(times의 길이)는 1명 이상 100,000명 이하`],examples:[{input:`n = 6, times = [7, 10]`,output:`28`}]},keyIntuitions:[`n이 최대 10억이라 사람을 한 명씩 심사대에 배정하면 시간 초과입니다.`,`질문을 뒤집어 "T분이 주어지면 몇 명을 심사할 수 있나?"를 묻습니다. 답은 심사관마다 ⌊T ÷ times[i]⌋명을 더한 값입니다.`,`T가 늘면 처리 인원은 줄지 않으므로, n명 이상이 되는 가장 작은 T를 이분 탐색으로 찾습니다.`],demo:{input:[s,c],label:`n = 6, times = [7, 10]`},workUnit:`반복 횟수`,approaches:[{id:`immigration-binary`,name:`답을 이분 탐색 (매개변수 탐색)`,rank:`BEST`,timeComplexity:`O(M log(n × maxT))`,spaceComplexity:`O(1)`,verdict:`답(시간)의 범위를 반씩 줄여 60번 안팎의 검사로 끝나는 풀이입니다.`,pros:[`검사 한 번이 O(M)이고 검사 횟수는 log₂(10¹⁸) ≈ 60번이라 최악의 입력도 금방 끝납니다.`,`추가 메모리가 거의 필요 없습니다.`,`"T분 동안 처리 인원 = Σ⌊T ÷ times[i]⌋" 한 줄로 판정합니다.`],cons:[`"시간을 이분 탐색한다"는 발상을 떠올려야 합니다.`,`JavaScript는 답이 2⁵³을 넘으면 Number 정밀도가 깨질 수 있어, 극단 입력까지 대비하려면 BigInt를 씁니다.`],whyThisRank:`n이 최대 10억이므로 사람 단위로 처리하는 풀이는 모두 탈락합니다. 시간이 늘면 처리 인원도 줄지 않는다는 단조성 덕분에 답 자체를 이분 탐색할 수 있습니다.`,code:d,visualize:V},{id:`immigration-heap`,name:`최소 힙 시뮬레이션`,rank:`ALTERNATIVE`,timeComplexity:`O(n log M)`,spaceComplexity:`O(M)`,verdict:`한 명씩 가장 빨리 끝나는 심사대에 배정하는 직관적인 풀이지만 n이 크면 시간 초과입니다.`,pros:[`실제 줄서기와 똑같이 동작해 이해하기 쉽습니다.`,`n이 작다면 정확한 답을 냅니다.`],cons:[`사람마다 힙 연산(log M)을 하므로 n = 10억이면 수백억 번의 연산이 필요합니다.`,`작은 예제만 통과하고 큰 테스트에서 시간 초과가 납니다.`],whyThisRank:`n이 작다면 좋은 시뮬레이션이지만 이 문제의 n은 최대 10억입니다. 풀이를 고르기 전에 입력 크기부터 확인해야 하는 이유입니다.`,code:p,visualize:U},{id:`immigration-linear`,name:`1분씩 늘려 보는 선형 탐색`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(답 × M)`,spaceComplexity:`O(1)`,verdict:`1분, 2분, 3분… 하나씩 늘려 가며 n명이 되는지 확인합니다.`,pros:[`코드가 가장 짧습니다.`],cons:[`답이 최대 10¹⁸분이라 그만큼 반복할 수 있어 사실상 끝나지 않습니다.`,`시간을 1분 늘릴 때마다 심사관 전원(최대 10만 명)을 다시 더합니다.`],whyThisRank:`처리 인원이 시간에 따라 늘어난다는 성질을 쓰지 않고 답을 하나씩 확인합니다. 같은 판정 식을 이분 탐색으로 감싸기만 하면 정석 풀이가 됩니다.`,code:h,visualize:G}],checks:{cases:[{args:[s,c],expected:28},{args:[1,[1]],expected:1},{args:[3,[1,1]],expected:2},{args:[10,[6,8,10]],expected:30}],random:e=>[1+Math.floor(e()*20),Array.from({length:1+Math.floor(e()*4)},()=>1+Math.floor(e()*10))]}};export{K as default};