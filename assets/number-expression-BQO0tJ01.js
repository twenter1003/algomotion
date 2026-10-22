import{n as e,t}from"./index-Cf02qAUa.js";import{i as n}from"./layout-DFaYBMY_.js";import{a as r,c as i,i as a,l as o,r as s}from"./shared-CL29HWIp.js";var c=9,l=Math.floor(c/2),u=Array.from({length:c},(e,t)=>t+1),d=[0,...u.map((e,t)=>(t+1)*(t+2)/2)],f={python:`def solution(n):
    count = 1                             # 자기 자신(n = n) 1가지는 미리 센다
    left = 1
    right = 1
    total = 1
    while left <= n // 2:                 # 시작점이 n // 2를 넘으면 2개 이상 합이 항상 n보다 크다
        if total == n:
            count += 1
        if total < n:
            right += 1
            total += right                # 합이 부족하면 오른쪽 수를 더한다
        else:
            total -= left                 # 합이 n 이상이면 왼쪽 수를 뺀다
            left += 1
    return count`,javascript:`function solution(n) {
  let count = 1; // 자기 자신(n = n) 1가지는 미리 센다
  let left = 1;
  let right = 1;
  let total = 1;
  while (left <= Math.floor(n / 2)) { // 시작점이 n // 2를 넘으면 2개 이상 합이 항상 n보다 크다
    if (total === n) {
      count += 1;
    }
    if (total < n) {
      right += 1;
      total += right; // 합이 부족하면 오른쪽 수를 더한다
    } else {
      total -= left; // 합이 n 이상이면 왼쪽 수를 뺀다
      left += 1;
    }
  }
  return count;
}`},p={init:a(f,[`count = 1`,`left = 1`,`total = 1`],[`let count = 1`,`let left = 1`,`let total = 1`]),check:a(f,[`while left <= n // 2`,`if total == n`],[`while (left <= Math.floor(n / 2))`,`if (total === n)`]),hit:a(f,[`if total == n:`,`count += 1`],[`if (total === n)`,`count += 1`]),expand:a(f,[`if total < n:`,`right += 1`,`total += right`],[`if (total < n)`,`right += 1`,`total += right`]),shrink:a(f,[`total -= left`,`left += 1`],[`total -= left`,`left += 1`]),done:a(f,[`return count`],[`return count`])},m={python:`from bisect import bisect_left

def solution(n):
    prefix = [0] * (n + 1)
    for i in range(1, n + 1):
        prefix[i] = prefix[i - 1] + i
    count = 0
    for left in range(1, n + 1):
        want = prefix[left - 1] + n       # prefix[right]가 되어야 할 값
        right = bisect_left(prefix, want, left, n + 1)
        if right <= n and prefix[right] == want:
            count += 1
    return count`,javascript:`function solution(n) {
  const prefix = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) prefix[i] = prefix[i - 1] + i;
  let count = 0;
  for (let left = 1; left <= n; left++) {
    const want = prefix[left - 1] + n; // prefix[right]가 되어야 할 값
    let lo = left, hi = n + 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (prefix[mid] < want) lo = mid + 1;
      else hi = mid;
    }
    if (lo <= n && prefix[lo] === want) count += 1;
  }
  return count;
}`},h={init:a(m,[`prefix = [0] * (n + 1)`,`prefix[i] = prefix[i - 1] + i`],[`const prefix = new Array(n + 1)`,`for (let i = 1; i <= n; i++) prefix[i]`]),search:a(m,[`for left in range(1, n + 1)`,`right = bisect_left(prefix, want`],[`for (let left = 1; left <= n; left++)`,`while (lo < hi)`]),hit:a(m,[`if right <= n and prefix[right] == want`,`count += 1`],[`if (lo <= n && prefix[lo] === want) count += 1`]),done:a(m,[`return count`],[`return count`])},g={python:`# 주의: 합이 n을 넘어도 멈추지 않고 끝까지 더하면 O(n²)으로 효율성 테스트에서 시간 초과가 납니다
def solution(n):
    count = 0
    for start in range(1, n + 1):
        total = 0
        for end in range(start, n + 1):
            total += end
            if total == n:
                count += 1
    return count`,javascript:`// 주의: 합이 n을 넘어도 멈추지 않고 끝까지 더하면 O(n²)으로 효율성 테스트에서 시간 초과가 납니다
function solution(n) {
  let count = 0;
  for (let start = 1; start <= n; start++) {
    let total = 0;
    for (let end = start; end <= n; end++) {
      total += end;
      if (total === n) count += 1;
    }
  }
  return count;
}`},_={init:a(g,[`count = 0`],[`let count = 0`]),startLoop:a(g,[`for start in range(1, n + 1)`,`total = 0`],[`for (let start = 1; start <= n; start++)`,`let total = 0`]),innerLoop:a(g,[`for end in range(start, n + 1)`,`total += end`],[`for (let end = start; end <= n; end++)`,`total += end`]),hit:a(g,[`if total == n:`,`count += 1`],[`if (total === n) count += 1`]),done:a(g,[`return count`],[`return count`])},v=584,y=248,b=n({x:68,y:34,rows:1,cols:c,cell:50,gap:6}),x=e=>`n:${e}`,S=(e,t)=>({x:b(0,Math.min(Math.max(t-1,0),8)).x+4,y:e===0?94:120,w:42,h:22}),C=(e,t)=>{let n=b(0,Math.min(Math.max(e-1,0),8)),r=b(0,Math.min(Math.max(t-1,0),8));return{x:Math.min(n.x,r.x)-3,y:n.y-3,w:Math.abs(r.x-n.x)+n.w+6,h:n.h+6}},w=[{x:68,y:158,w:148,h:36},{x:226,y:158,w:156,h:36},{x:392,y:158,w:174,h:36}],T=e=>({type:`wait`,ms:e}),E=()=>i([{type:`unfocus`},{type:`clearMarks`}]),D=e=>({type:`set`,id:`calc`,patch:{text:e}}),O=20,k=2e3,A=e=>Math.max(0,...e.actions.map(t=>t.start+t.duration-e.start)),j=n=>{for(let r of n.steps){let{phases:n}=e(r);n.forEach((e,i)=>{let a=i<n.length-1?140:r.isKeyframe?t:320,o=[...r.phases[i].caption].length*O-a;e.end-e.start<o&&r.phases[i].actions.push(T(Math.ceil(o-A(e))))});let i=e(r),a=i.phases.at(-1),o=k-i.total;o>0&&r.phases.at(-1).actions.push(T(a.end-a.start+o-A(a)))}return n};function M(e,t){let n=[{id:`lab:nums`,kind:`text`,rect:{x:0,y:34,w:62,h:50},tone:`muted`,text:`자연수`},{id:`lab:p0`,kind:`text`,rect:{x:0,y:94,w:62,h:22},tone:`muted`,text:e},{id:`lab:p1`,kind:`text`,rect:{x:0,y:120,w:62,h:22},tone:`muted`,text:t},{id:`win`,kind:`zone`,rect:C(1,1),tone:`explored`},{id:`tok:target`,kind:`token`,rect:w[0],tone:`plain`,text:`목표 n = ${c}`},{id:`tok:sum`,kind:`token`,rect:w[1],tone:`chosen`,text:`구간 합 1`},{id:`tok:cnt`,kind:`token`,rect:w[2],tone:`plain`,text:`찾은 표현 0가지`},{id:`calc`,kind:`text`,rect:{x:68,y:206,w:498,h:28},text:``}];return u.forEach(e=>n.push({id:x(e),kind:`cell`,rect:b(0,e-1),tone:`plain`,text:String(e)})),{width:v,height:y,items:n}}var N=(e,t,n,r,i)=>{let a=S(n,r),o=`ptr:${t}`;return e.has(o)?{type:`set`,id:o,patch:{rect:a,text:i}}:{type:`add`,item:{id:o,kind:`token`,rect:a,tone:`chosen`,text:i}}},P=(e,t,n,r=!1)=>u.map(i=>({type:`set`,id:x(i),patch:{tone:i>=e&&i<=t?n:r&&i===c?`good`:i<e?`visited`:`plain`}}));function F(){let e=new o(M(`left`,`right`)),[t,n,a,d,f]=[1,1,1,1,0],m=()=>({work:f,variables:{left:t,right:n,total:a,count:d}});for(e.step({title:`초기화: 자기 자신(${c} = ${c}) 1가지 미리 포함`,codeHighlights:p.init,...m()}),e.phase(`시작`,`자기 자신 하나로 표현하는 ${c} = ${c}을 먼저 세어 count = 1로 시작합니다. 길이 2 이상인 구간은 left ≤ ${l}까지만 확인하면 됩니다.`,p.init),e.do(...i([N(e,`l`,0,1,`L=1`),N(e,`r`,1,1,`R=1`),...P(1,1,`current`,!0),{type:`set`,id:`tok:cnt`,patch:{text:`찾은 표현 1가지 (9)`,tone:`good`},pop:!0},D(`초기: ${c} = ${c} (1가지), 구간 [1..1] 합 = 1`)]));t<=l;){let[o,u,h]=[t,n,a],g=h===c;g&&(d+=1);let _=h<c;_?(n+=1,a+=n):(a-=t,t+=1),f+=1;let v=Array.from({length:u-o+1},(e,t)=>o+t).join(`+`);e.step({title:`[${o}..${u}] 합 ${h}: ${g?`${v}=${c} 찾음! (${d}가지)`:_?`부족 → right=${n}`:`초과 → left=${t}`}`,codeHighlights:g?p.hit:_?p.expand:p.shrink,...m()}),e.phase(`구간 합 비교`,g?`${v} = ${c}입니다! 표현 가짓수가 ${r(d)} 늘어납니다.`:_?`${v} = ${h}이라 ${c}보다 작습니다.`:`${v} = ${h}이라 ${c}보다 큽니다.`,g?p.hit:p.check),e.do(...i([{type:`focus`,ids:Array.from({length:u-o+1},(e,t)=>x(o+t))},{type:`arrow`,from:x(o),to:x(u),verdict:g?`good`:_?`new`:`bad`,label:`합 ${h} ${g?`=`:_?`<`:`>`} ${c}`},...g?[{type:`set`,id:`tok:cnt`,patch:{text:`찾은 표현 ${d}가지`,tone:`good`},pop:!0}]:[]])),e.phase(_?`오른쪽 늘리기`:`왼쪽 줄이기`,_?`right를 ${r(n)} 늘려 ${n}을 더하면 합이 ${r(a)} 됩니다.`:t<=l?`왼쪽 끝 ${s(o,`을`,`를`)} 빼고 left를 ${r(t)} 옮기면 합이 ${r(a)} 됩니다.`:`left가 ${r(t)} 되어 상한 ${l}을 넘었으므로 탐색을 마칩니다(5+6 = 11 > 9).`,_?p.expand:p.shrink),e.do(...E());let y=Math.min(t,n);e.do(...i([N(e,`l`,0,y,`L=${t}`),N(e,`r`,1,n,`R=${n}`),{type:`set`,id:`win`,patch:{rect:C(y,n)}},...P(y,n,`current`,!0),{type:`set`,id:`tok:sum`,patch:{text:`구간 합 ${a}`},pop:!0},D(t<=l?`구간 [${t}..${n}] 합 = ${a}`:`left = ${t} > ${l}: 탐색 종료`)]))}return e.step({title:`정답: 총 ${d}가지 (2+3+4, 4+5, 9)`,codeHighlights:p.done,...m(),answer:d,isKeyframe:!0}),e.phase(`정답`,`투 포인터로 ${f}번만 비교해 2+3+4 = 9, 4+5 = 9, 9 = 9의 총 ${d}가지 표현을 찾았습니다.`,p.done),e.do(...i([{type:`set`,id:`win`,patch:{rect:C(4,5),tone:`path`}},...u.map(e=>({type:`set`,id:x(e),patch:{tone:e>=2&&e<=5||e===9?`path`:`visited`}})),{type:`set`,id:`tok:cnt`,patch:{text:`정답 ${d}가지`,tone:`path`},pop:!0},D(`정답 ${d}가지: (2+3+4), (4+5), (9)`)])),j(e.finish())}function I(){let e=new o(M(`시작 left`,`끝 right`)),[t,n]=[0,0],r=`-`,a=`-`,l=()=>({work:n,variables:{left:r,right:a,count:t}});e.step({title:`누적합 배열 준비: P[i] = 1부터 i까지의 합`,codeHighlights:h.init,...l()}),e.phase(`누적합 준비`,`1부터 i까지의 합 P = [${d.join(`, `)}]를 배열로 만듭니다. 구간 [left..right]의 합은 P[right] − P[left−1]입니다.`,h.init),e.do(...i([...u.map(e=>({type:`set`,id:x(e),patch:{sub:`P=${d[e]}`}})),D(`P = [${d.join(`, `)}]`)]));for(let o=1;o<=c;o++){let u=d[o-1]+c,f=o,p=10,m=0;for(;f<p;){let e=f+p>>1;m+=1,n+=1,d[e]<u?f=e+1:p=e}let g=f<=c&&d[f]===u,_=g?f:Math.min(f,c);g&&(t+=1),r=o,a=_;let v=d[_]-d[o-1];e.step({title:`시작 ${o}: 이분 탐색 ${m}번 비교 → ${g?`[${o}..${_}] 합 ${c} 찾음!`:`없음`}`,codeHighlights:g?h.hit:h.search,...l()}),e.phase(`이분 탐색`,`left = ${o}에서 P[right] = ${d[o-1]} + ${c} = ${s(u,`이`,`가`)} 되는 끝점 right를 이분 탐색합니다(${m}번 비교).`,h.search),e.do(...i([N(e,`l`,0,o,`L=${o}`),N(e,`r`,1,_,`R=${_}`),{type:`set`,id:`win`,patch:{rect:C(o,_)}},...P(o,_,g?`good`:`current`),{type:`set`,id:`tok:sum`,patch:{text:`구간 합 ${v}`},pop:!0},D(`left=${o}, 찾을 P[right] = ${u} → 구간 [${o}..${_}] 합 = ${v}`)])),e.phase(`결과 확인`,g?`P[${_}] = ${u}이어서 [${o}..${_}] 구간의 합이 ${c}입니다! 찾은 표현은 ${t}가지입니다.`:`누적합이 정확히 ${u}인 끝점이 없습니다.`,g?h.hit:h.search),e.do({type:`focus`,ids:[x(o),x(_)]},{type:`arrow`,from:x(o),to:x(_),verdict:g?`good`:`bad`,label:g?`합 ${c}!`:`합 ${v} ≠ ${c}`},...g?[{type:`set`,id:`tok:cnt`,patch:{text:`찾은 표현 ${t}가지`,tone:`good`},pop:!0}]:[],T(100),...E())}return e.step({title:`정답: ${t}가지 (이분 탐색 비교 ${n}번)`,codeHighlights:h.done,...l(),answer:t,isKeyframe:!0}),e.phase(`정답`,`정석과 같이 ${t}가지를 찾았지만, O(n) 누적합 배열을 만들고 비교를 ${n}번(정석은 8번) 수행했습니다.`,h.done),e.do(...i([{type:`set`,id:`win`,patch:{rect:C(9,9),tone:`path`}},{type:`set`,id:`tok:cnt`,patch:{text:`정답 ${t}가지`,tone:`path`},pop:!0},D(`정답 ${t}가지 (비교 ${n}번 vs 정석 8번)`)])),j(e.finish())}function L(){let e=new o(M(`start`,`end`)),[t,n]=[0,0],r=`-`,a=`-`,s=()=>({work:n,variables:{start:r,end:a,count:t}});e.step({title:`초기화: 시작점 1~${c}마다 끝점 ${c}까지 모두 더하기`,codeHighlights:_.init,...s()}),e.phase(`시작`,`시작점마다 끝점을 ${c}까지 늘리며 합이 ${c}를 넘어도 멈추지(break) 않고 끝까지 더하면 비교 횟수가 어떻게 불어나는지 봅니다.`,_.init),e.do(...i([N(e,`l`,0,1,`S=1`),N(e,`r`,1,1,`E=1`),D(`모든 [start..end] 구간 합을 끝까지 계산`)]));for(let o=1;o<=c;o++){let l=0,u=null;for(let e=o;e<=c;e++)l+=e,n+=1,l===c&&(t+=1,u=e);let d=c-o+1;r=o,a=c,e.step({title:`시작 ${o}: ${c}까지 ${d}번 덧셈 (최종 합 ${l})${u?` → [${o}..${u}] 찾음`:``}`,codeHighlights:u?_.hit:_.innerLoop,...s()}),e.phase(`끝까지 더하기`,`${o}부터 ${c}까지 ${d}개 수를 차례로 다 더합니다. 중간에 합이 ${c}를 넘어도 멈추지 않아 최종 합이 ${l}까지 커졌습니다.`,_.innerLoop),e.do(...i([N(e,`l`,0,o,`S=${o}`),N(e,`r`,1,c,`E=${c}`),{type:`set`,id:`win`,patch:{rect:C(o,c)}},...P(o,c,u?`good`:`current`),{type:`set`,id:`tok:sum`,patch:{text:`끝까지 합 ${l}`},pop:!0},D(`시작 ${o}: ${d}번 비교 (누적 ${n}번)`)])),e.phase(`판정`,u?`도중에 [${o}..${u}]에서 합 ${c}을 찾았지만(${t}가지), 이후 ${u+1}~${c}도 불필요하게 계속 더했습니다.`:`합이 ${c}을 훌쩍 넘었는데도 ${c}번 칸까지 끝까지 더했습니다.`,u?_.hit:_.startLoop),e.do({type:`focus`,ids:[x(o),x(c)]},{type:`arrow`,from:x(o),to:x(c),verdict:u?`good`:`bad`,label:`${d}번 덧셈 (합 ${l})`},...u?[{type:`set`,id:`tok:cnt`,patch:{text:`찾은 표현 ${t}가지`,tone:`good`},pop:!0}]:[],T(100),...E())}return e.step({title:`시간 초과 위험: 총 ${n}번 비교 (정석은 8번)`,codeHighlights:_.done,...s(),answer:t,isKeyframe:!0}),e.phase(`작업량 비교`,`답은 ${t}가지로 같지만 n = ${c}에서 ${n}번(정석은 8번) 비교했습니다. n = 10,000이면 약 5,000만 번 반복해 효율성 테스트에서 시간 초과가 납니다.`,_.done),e.do(...i([{type:`set`,id:`win`,patch:{rect:C(1,c),tone:`bad`}},{type:`set`,id:`tok:cnt`,patch:{text:`비교 ${n}번 vs 8번`,tone:`bad`},pop:!0},D(`n = 10,000일 때 n(n+1)/2 ≈ 50,005,000번 → 효율성 시간 초과!`)])),j(e.finish())}var R={id:`number-expression`,title:`숫자의 표현`,level:2,category:`two-pointer`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/12924`,description:{summary:`자연수 n이 주어질 때, n을 연속한 자연수들의 합으로 표현하는 방법의 수를 구합니다. 자기 자신 하나로 표현하는 경우(n = n)도 한 가지로 셉니다.`,rules:[`n은 10,000 이하의 자연수`,`연속된 자연수들의 합이 정확히 n이 되는 경우의 수를 반환`,`자기 자신(길이 1인 구간)도 유효한 표현에 포함`],examples:[{input:`n = 15`,output:`4`}]},keyIntuitions:[`연속한 자연수 구간 [left..right]의 합이 n보다 작으면 right를 1 늘려 더하고, n 이상이면 left를 1 늘려 빼면 O(n)에 모든 구간을 훑을 수 있습니다.`,`2개 이상의 연속한 자연수 합은 시작점 left가 n // 2를 넘으면 (n // 2 + 1) + (n // 2 + 2) > n이 되어 절대 n이 될 수 없으므로, 자기 자신(n = n) 1가지를 미리 세고 left ≤ n // 2까지만 보면 절반으로 줄어듭니다.`,`시작점마다 끝까지 다 더해 보는 O(n²) 이중 반복문은 불필요한 덧셈을 반복해 효율성 테스트에서 시간 초과가 납니다.`],demo:{input:[c],label:`n = ${c}`},workUnit:`구간 합을 비교한 횟수`,approaches:[{id:`number-expression-two-pointer`,name:`연속 합 구간 (투 포인터)`,rank:`BEST`,timeComplexity:`O(n)`,spaceComplexity:`O(1)`,verdict:`자기 자신을 미리 세고 left ≤ n // 2 범위에서 두 포인터로 구간 합을 늘리고 줄이는 정석 풀이입니다.`,pros:[`이전 구간의 합에서 양 끝 자연수만 더하고 빼므로 중복 덧셈이 전혀 없습니다.`,`시작점을 n // 2까지만 확인하므로 최대 n번 안팎의 포인터 이동으로 빠르게 끝납니다.`,`변수 몇 개만 사용해 공간 복잡도가 O(1)입니다.`],cons:[`합이 정확히 n일 때도 다음 구간을 찾으려면 left를 한 칸 줄이거나 right를 한 칸 늘려야 합니다.`],whyThisRank:`연속된 양수 구간 합이라는 문제 구조에 가장 직접적으로 들어맞는 O(n) 시간, O(1) 공간 풀이입니다.`,code:f,visualize:F},{id:`number-expression-binary-search`,name:`누적합 + 끝점 이분 탐색`,rank:`ALTERNATIVE`,timeComplexity:`O(n log n)`,spaceComplexity:`O(n)`,verdict:`1부터 i까지의 누적합 배열에서 시작점마다 끝점을 이분 탐색으로 찾는 풀이로, 맞지만 O(n) 메모리와 log n배의 비교가 더 듭니다.`,pros:[`누적합의 차 P[right] − P[left−1] = n을 만족하는 right를 이분 탐색으로 바로 찾을 수 있습니다.`],cons:[`길이 n + 1의 누적합 배열을 만들어야 해서 O(n) 메모리를 추가로 사용합니다.`,`시작점마다 이분 탐색을 수행해 O(n log n) 시간이 걸리므로 투 포인터보다 비교 횟수가 많습니다.`],whyThisRank:`정답은 정확히 구하지만, 연속한 자연수의 합은 양 끝만 옮기면 O(1)에 갱신되므로 배열과 이분 탐색을 쓸 이유가 없습니다.`,code:m,visualize:I},{id:`number-expression-brute-force`,name:`모든 시작점에서 끝까지 더하기 (이중 반복문)`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(n²)`,spaceComplexity:`O(1)`,verdict:`시작점마다 n까지 모든 끝점을 더해 보면 합이 이미 n을 넘은 뒤에도 계속 더하느라 효율성 테스트에서 시간 초과가 납니다.`,pros:[`이중 for문만으로 가장 단순하게 작성할 수 있습니다.`],cons:[`합이 이미 n을 넘어 더 이상 답이 될 수 없는데도 n까지 끝까지 더합니다.`,`시작점이 바뀔 때마다 이전 구간에서 이미 더했던 수들을 처음부터 다시 더합니다.`],whyThisRank:`자연수는 더할수록 커진다는 단조성을 무시하고 모든 구간을 다 확인하는 풀이로, 투 포인터를 쓰면 겹치는 구간 합을 그대로 재활용할 수 있습니다.`,code:g,visualize:L}],checks:{cases:[{args:[15],expected:4},{args:[c],expected:3},{args:[1],expected:1},{args:[2],expected:1},{args:[3],expected:2},{args:[6],expected:2},{args:[10],expected:2}],random:e=>[1+Math.floor(e()*60)]}};export{R as default};