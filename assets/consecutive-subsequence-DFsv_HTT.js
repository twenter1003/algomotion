import{n as e,t}from"./index-Cf02qAUa.js";import{i as n}from"./layout-DFaYBMY_.js";import{a as r,c as i,i as a,l as o,r as s}from"./shared-CL29HWIp.js";var c=[1,2,2,2,3,5],l=5,u=c.length,d=[0,...c.map((e,t)=>c.slice(0,t+1).reduce((e,t)=>e+t,0))],f={python:`def solution(sequence, k):
    n = len(sequence)
    left = 0
    total = sequence[0]
    best = [0, n - 1]
    right = 0
    while left < n:
        if total == k and right - left < best[1] - best[0]:
            best = [left, right]          # 더 짧은 구간이면 갱신
        if total < k and right + 1 < n:
            right += 1                    # 합이 부족하면 오른쪽을 늘린다
            total += sequence[right]
        else:
            total -= sequence[left]       # 합이 k 이상이거나 끝이면 왼쪽을 줄인다
            left += 1
    return best`,javascript:`function solution(sequence, k) {
  const n = sequence.length;
  let left = 0;
  let total = sequence[0];
  let best = [0, n - 1];
  let right = 0;
  while (left < n) {
    if (total === k && right - left < best[1] - best[0]) {
      best = [left, right]; // 더 짧은 구간이면 갱신
    }
    if (total < k && right + 1 < n) {
      right += 1; // 합이 부족하면 오른쪽을 늘린다
      total += sequence[right];
    } else {
      total -= sequence[left]; // 합이 k 이상이거나 끝이면 왼쪽을 줄인다
      left += 1;
    }
  }
  return best;
}`},p={init:a(f,[`left = 0`,`total = sequence[0]`,`best = [0, n - 1]`],[`let left = 0`,`let total = sequence[0]`,`let best = [0, n - 1]`]),check:a(f,[`while left < n`,`if total == k and right - left < best[1] - best[0]`],[`while (left < n)`,`if (total === k && right - left < best[1] - best[0])`]),record:a(f,[`best = [left, right]`],[`best = [left, right]`]),expand:a(f,[`if total < k and right + 1 < n`,`right += 1`,`total += sequence[right]`],[`if (total < k && right + 1 < n)`,`right += 1`,`total += sequence[right]`]),shrink:a(f,[`total -= sequence[left]`,`left += 1`],[`total -= sequence[left]`,`left += 1`]),done:a(f,[`return best`],[`return best`])},m={python:`from bisect import bisect_left

def solution(sequence, k):
    n = len(sequence)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + sequence[i]
    best = [0, n - 1]
    for left in range(n):
        target = prefix[left] + k         # prefix[right + 1]이 되어야 할 값
        idx = bisect_left(prefix, target, left + 1, n + 1)
        if idx <= n and prefix[idx] == target:
            right = idx - 1
            if right - left < best[1] - best[0]:
                best = [left, right]
    return best`,javascript:`function solution(sequence, k) {
  const n = sequence.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + sequence[i];
  let best = [0, n - 1];
  for (let left = 0; left < n; left++) {
    const target = prefix[left] + k; // prefix[right + 1]이 되어야 할 값
    let lo = left + 1, hi = n + 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (prefix[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    if (lo <= n && prefix[lo] === target && lo - 1 - left < best[1] - best[0]) {
      best = [left, lo - 1];
    }
  }
  return best;
}`},h={init:a(m,[`prefix = [0] * (n + 1)`,`prefix[i + 1] = prefix[i] + sequence[i]`],[`const prefix = new Array(n + 1)`,`for (let i = 0; i < n; i++) prefix[i + 1]`]),pickLeft:a(m,[`for left in range(n)`,`target = prefix[left] + k`],[`for (let left = 0; left < n; left++)`,`const target = prefix[left] + k`]),search:a(m,[`idx = bisect_left(prefix, target, left + 1, n + 1)`],[`while (lo < hi)`,`if (prefix[mid] < target) lo = mid + 1`]),update:a(m,[`if idx <= n and prefix[idx] == target`,`best = [left, right]`],[`if (lo <= n && prefix[lo] === target`,`best = [left, lo - 1]`]),done:a(m,[`return best`],[`return best`])},g={python:`# 주의: 처음 찾은 합 k 구간을 바로 반환하면 뒤에 있는 더 짧은 구간을 놓칩니다
def solution(sequence, k):
    n = len(sequence)
    left = 0
    total = sequence[0]
    right = 0
    while left < n:
        if total == k:
            return [left, right]          # 첫 구간에서 바로 종료 (오답!)
        if total < k and right + 1 < n:
            right += 1
            total += sequence[right]
        else:
            total -= sequence[left]
            left += 1
    return [0, n - 1]`,javascript:`// 주의: 처음 찾은 합 k 구간을 바로 반환하면 뒤에 있는 더 짧은 구간을 놓칩니다
function solution(sequence, k) {
  const n = sequence.length;
  let left = 0;
  let total = sequence[0];
  let right = 0;
  while (left < n) {
    if (total === k) {
      return [left, right]; // 첫 구간에서 바로 종료 (오답!)
    }
    if (total < k && right + 1 < n) {
      right += 1;
      total += sequence[right];
    } else {
      total -= sequence[left];
      left += 1;
    }
  }
  return [0, n - 1];
}`},_={init:a(g,[`left = 0`,`total = sequence[0]`,`right = 0`],[`let left = 0`,`let total = sequence[0]`,`let right = 0`]),check:a(g,[`while left < n`,`if total == k`],[`while (left < n)`,`if (total === k)`]),earlyReturn:a(g,[`return [left, right]`],[`return [left, right]`]),expand:a(g,[`if total < k and right + 1 < n`,`right += 1`,`total += sequence[right]`],[`if (total < k && right + 1 < n)`,`right += 1`,`total += sequence[right]`])},v=560,y=248,b=n({x:76,y:36,rows:1,cols:u,cell:54,gap:10}),x=e=>`c:${e}`,S=(e,t)=>({x:b(0,Math.min(Math.max(t,0),u-1)).x+5,y:e===0?102:130,w:44,h:22}),C=(e,t)=>{let n=b(0,Math.min(e,t)),r=b(0,Math.max(e,t));return{x:n.x-4,y:n.y-4,w:r.x+r.w-n.x+8,h:n.h+8}},w=[{x:76,y:168,w:136,h:32},{x:222,y:168,w:146,h:32},{x:378,y:168,w:166,h:32}],T=e=>({type:`wait`,ms:e}),E=()=>i([{type:`unfocus`},{type:`clearMarks`}]),D=e=>({type:`set`,id:`calc`,patch:{text:e}}),O=20,k=2e3,A=e=>Math.max(0,...e.actions.map(t=>t.start+t.duration-e.start)),j=n=>{for(let r of n.steps){let{phases:n}=e(r);n.forEach((e,i)=>{let a=i<n.length-1?140:r.isKeyframe?t:320,o=[...r.phases[i].caption].length*O-a;e.end-e.start<o&&r.phases[i].actions.push(T(Math.ceil(o-A(e))))});let i=e(r),a=i.phases.at(-1),o=k-i.total;o>0&&r.phases.at(-1).actions.push(T(a.end-a.start+o-A(a)))}return n};function M(e,t){let n=[{id:`lab:seq`,kind:`text`,rect:{x:0,y:36,w:68,h:54},tone:`muted`,text:`수열`},{id:`lab:p0`,kind:`text`,rect:{x:0,y:102,w:68,h:22},tone:`muted`,text:e},{id:`lab:p1`,kind:`text`,rect:{x:0,y:130,w:68,h:22},tone:`muted`,text:t},{id:`win`,kind:`zone`,rect:C(0,0),tone:`explored`},{id:`tok:k`,kind:`token`,rect:w[0],tone:`plain`,text:`목표 합 k = ${l}`},{id:`tok:sum`,kind:`token`,rect:w[1],tone:`chosen`,text:`구간 합 ${c[0]}`},{id:`tok:best`,kind:`token`,rect:w[2],tone:`plain`,text:`최단 구간 없음`},{id:`calc`,kind:`text`,rect:{x:76,y:210,w:468,h:28},text:``}];return c.forEach((e,t)=>n.push({id:x(t),kind:`cell`,rect:b(0,t),tone:`plain`,text:String(e),sub:`[${t}]`})),{width:v,height:y,items:n}}var N=(e,t,n,r,i)=>{let a=S(n,r),o=`ptr:${t}`;return e.has(o)?{type:`set`,id:o,patch:{rect:a,text:i}}:{type:`add`,item:{id:o,kind:`token`,rect:a,tone:`chosen`,text:i}}},P=(e,t,n)=>c.map((r,i)=>({type:`set`,id:x(i),patch:{tone:i>=e&&i<=t?n:i<e?`visited`:`plain`}}));function F(){let e=new o(M(`left`,`right`)),[t,n,a,d]=[0,0,c[0],0],f=[0,u-1],m=!1,h=()=>m?`[${f[0]}, ${f[1]}]`:`[0, ${u-1}]`,g=()=>({work:d,variables:{left:t,right:n,total:a,best:h()}});for(e.step({title:`초기화: left = 0, right = 0, 합 = ${c[0]}`,codeHighlights:p.init,...g()}),e.phase(`시작`,`포인터 두 개를 0번 칸에 두고 시작합니다. 구간 [0, 0]의 합은 ${c[0]}이고 목표 합 k는 ${l}입니다.`,p.init),e.do(...i([N(e,`l`,0,0,`L=0`),N(e,`r`,1,0,`R=0`),...P(0,0,`current`),D(`구간 [0, 0] 합 = ${c[0]}`)]));t<u;){let[o,h,_]=[t,n,a],v=_===l,y=v&&(!m||h-o<f[1]-f[0]);y&&(f=[o,h],m=!0);let b=_<l&&h+1<u;b?(n+=1,a+=c[n]):(a-=c[t],t+=1),d+=1;let S=h-o+1;if(e.step({title:`[${o}, ${h}] 합 ${_}: ${v?`k=${l} 찾음(길이 ${S}) → left+1`:b?`부족 → right+1`:`초과 → left+1`}`,codeHighlights:b?p.expand:p.shrink,...g()}),e.phase(`합 비교`,v?`구간 [${o}, ${h}]의 합이 ${r(_)} 목표 ${s(l,`과`,`와`)} 같습니다! 길이는 ${S}칸이라 최단 구간을 [${o}, ${h}]로 갱신합니다.`:_<l?`구간 [${o}, ${h}]의 합은 ${_}이라 목표 ${l}보다 작습니다.`:`구간 [${o}, ${h}]의 합은 ${_}이라 목표 ${l}보다 큽니다.`,y?p.record:p.check),e.do(...i([{type:`focus`,ids:Array.from({length:S},(e,t)=>x(o+t))},{type:`arrow`,from:x(o),to:x(h),verdict:v?`good`:_<l?`new`:`bad`,label:`합 ${_} ${v?`=`:_<l?`<`:`>`} ${l}`},...y?[{type:`set`,id:`tok:best`,patch:{text:`최단 [${o}, ${h}] (길이 ${S})`,tone:`good`},pop:!0}]:[]])),b)e.phase(`구간 늘리기`,`right를 ${r(n)} 한 칸 늘려 ${c[n]}번 값을 더합니다. 구간 합이 ${r(a)} 됩니다.`,p.expand),e.do(...E()),e.do(...i([N(e,`r`,1,n,`R=${n}`),{type:`set`,id:`win`,patch:{rect:C(t,n)}},...P(t,n,`current`),{type:`set`,id:`tok:sum`,patch:{text:`구간 합 ${a}`},pop:!0},D(`구간 [${t}, ${n}] 합 = ${a}`)]));else{e.phase(`구간 줄이기`,t<u?`left 칸(${c[o]})을 빼고 left를 ${r(t)} 옮깁니다. 남은 구간 합은 ${a}입니다.`:`마지막 칸까지 확인하고 left가 배열 끝에 닿아 탐색을 마칩니다.`,p.shrink),e.do(...E());let s=Math.min(t,u-1),l=Math.max(s,n);e.do(...i([N(e,`l`,0,s,`L=${t}`),{type:`set`,id:`win`,patch:{rect:C(s,l)}},...P(t,n,`current`),{type:`set`,id:`tok:sum`,patch:{text:`구간 합 ${a}`},pop:!0},D(t<u?`구간 [${t}, ${n}] 합 = ${a}`:`탐색 완료`)]))}}return e.step({title:`정답: 가장 짧은 구간 [${f[0]}, ${f[1]}]`,codeHighlights:p.done,...g(),answer:f,isKeyframe:!0}),e.phase(`정답`,`합이 ${l}인 구간 [0, 2](길이 3), [3, 4](길이 2), [5, 5](길이 1) 중 가장 짧은 구간은 [${f[0]}, ${f[1]}]입니다.`,p.done),e.do(...i([{type:`set`,id:`win`,patch:{rect:C(f[0],f[1]),tone:`path`}},...c.map((e,t)=>({type:`set`,id:x(t),patch:{tone:t>=f[0]&&t<=f[1]?`path`:`visited`}})),{type:`set`,id:`tok:best`,patch:{text:`정답 [${f[0]}, ${f[1]}]`,tone:`path`},pop:!0},D(`최단 구간 [${f[0]}, ${f[1]}] (길이 ${f[1]-f[0]+1})`)])),j(e.finish())}function I(){let e=new o(M(`left`,`탐색 끝점`)),t=0,n=[0,u-1],a=!1,f=`-`,p=`-`,m=()=>`[${n[0]}, ${n[1]}]`,g=()=>({work:t,variables:{left:f,target:p,best:m()}});e.step({title:`누적합 배열 만들기: [${d.join(`, `)}]`,codeHighlights:h.init,...g()}),e.phase(`누적합 준비`,`앞에서부터 더한 누적합 P = [${d.join(`, `)}]를 만듭니다. 구간 [left, right]의 합은 P[right+1] − P[left]입니다.`,h.init),e.do(...i([...c.map((e,t)=>({type:`set`,id:x(t),patch:{sub:`P=${d[t+1]}`},pop:!0})),D(`P = [${d.join(`, `)}]`)]));for(let o=0;o<u;o++){let c=d[o]+l;f=o,p=c;let m=o+1,_=u+1,v=[];for(;m<_;){let e=m+_>>1;v.push(e-1),t+=1,d[e]<c?m=e+1:_=e}let y=m<=u&&d[m]===c,b=y?m-1:Math.min(m-1,u-1),S=y&&(!a||b-o<n[1]-n[0]);S&&(n=[o,b],a=!0);let w=d[b+1]-d[o];e.step({title:`left = ${o}: P[right+1] = ${c} 이분 탐색 (${v.length}번 비교)`,codeHighlights:y?h.update:h.search,...g()}),e.phase(`시작점 고정`,`left = ${r(o)} 고정하면 P[left] = ${d[o]}이므로, P[right+1] = ${d[o]} + ${l} = ${s(c,`이`,`가`)} 되는 끝점을 이분 탐색합니다.`,h.pickLeft),e.do(...i([N(e,`l`,0,o,`L=${o}`),N(e,`r`,1,b,`R=${b}`),{type:`set`,id:`win`,patch:{rect:C(o,b)}},...P(o,b,`current`),D(`left=${o}, 찾을 누적합 target = ${c}`)])),e.phase(`이분 탐색`,y?`${v.length}번 비교해 P[${b+1}] = ${c}인 right = ${s(b,`을`,`를`)} 찾았습니다.${S?` 길이 ${b-o+1}칸으로 최단 구간을 [${o}, ${b}]로 갱신합니다.`:``}`:`${v.length}번 비교했지만 누적합이 정확히 ${c}인 끝점이 없습니다.`,y?h.update:h.search),e.do(...i([{type:`focus`,ids:[x(o),x(b)]},{type:`arrow`,from:x(o),to:x(b),verdict:y?`good`:`bad`,label:`합 ${w} ${y?`=`:`≠`} ${l}`},{type:`set`,id:`tok:sum`,patch:{text:`구간 합 ${w}`},pop:!0},...S?[{type:`set`,id:`tok:best`,patch:{text:`최단 [${o}, ${b}] (길이 ${b-o+1})`,tone:`good`},pop:!0}]:[]]),T(120),...E())}return e.step({title:`정답: [${n[0]}, ${n[1]}] (비교 ${t}번)`,codeHighlights:h.done,...g(),answer:n,isKeyframe:!0}),e.phase(`정답`,`정석과 같이 [${n[0]}, ${n[1]}]을 찾았지만, 누적합 배열 O(N) 메모리를 추가로 쓰고 이분 탐색 비교를 ${t}번(정석은 11번) 수행했습니다.`,h.done),e.do(...i([{type:`set`,id:`win`,patch:{rect:C(n[0],n[1]),tone:`path`}},...c.map((e,t)=>({type:`set`,id:x(t),patch:{tone:t>=n[0]&&t<=n[1]?`path`:`visited`}})),{type:`set`,id:`tok:best`,patch:{text:`정답 [${n[0]}, ${n[1]}]`,tone:`path`},pop:!0},D(`최단 구간 [${n[0]}, ${n[1]}] (이분 탐색 총 ${t}번 비교)`)])),j(e.finish())}function L(){let e=new o(M(`left`,`right`)),[t,n,a,s]=[0,0,c[0],0],d=()=>({work:s,variables:{left:t,right:n,total:a}});for(e.step({title:`초기화: left = 0, right = 0, 합 = ${c[0]}`,codeHighlights:_.init,...d()}),e.phase(`시작`,`투 포인터로 구간을 넓히다가 합이 k가 되는 첫 순간 바로 반환하면 어떻게 될지 확인합니다.`,_.init),e.do(...i([N(e,`l`,0,0,`L=0`),N(e,`r`,1,0,`R=0`),...P(0,0,`current`),D(`구간 [0, 0] 합 = ${c[0]}`)]));a<l&&n+1<u;){let[o,u,f]=[t,n,a];n+=1,a+=c[n],s+=1,e.step({title:`[${o}, ${u}] 합 ${f} < ${l} → right = ${n}로 확장`,codeHighlights:_.expand,...d()}),e.phase(`합 비교`,`구간 [${o}, ${u}]의 합은 ${f}이라 목표 ${l}보다 작습니다.`,_.check),e.do({type:`focus`,ids:Array.from({length:u-o+1},(e,t)=>x(o+t))},{type:`arrow`,from:x(o),to:x(u),verdict:`new`,label:`합 ${f} < ${l}`}),e.phase(`구간 늘리기`,`right를 ${r(n)} 늘려 ${c[n]}을 더하면 구간 [0, ${n}]의 합이 ${r(a)} 됩니다.`,_.expand),e.do(...E()),e.do(...i([N(e,`r`,1,n,`R=${n}`),{type:`set`,id:`win`,patch:{rect:C(t,n)}},...P(t,n,`current`),{type:`set`,id:`tok:sum`,patch:{text:`구간 합 ${a}`},pop:!0},D(`구간 [${t}, ${n}] 합 = ${a}`)]))}s+=1;let f=[t,n];return e.step({title:`오답: 첫 구간 [${t}, ${n}](길이 3)에서 멈춤 — 정답은 [5, 5](길이 1)`,codeHighlights:_.earlyReturn,...d(),answer:f,isKeyframe:!0}),e.phase(`성급한 종료`,`구간 [0, 2]의 합이 ${l}가 되자마자 바로 [0, 2](길이 3)를 반환해 버렸습니다.`,_.earlyReturn),e.do(...i([{type:`set`,id:`win`,patch:{rect:C(0,2),tone:`bad`}},...c.map((e,t)=>({type:`set`,id:x(t),patch:{tone:t<=2?`bad`:t===5?`good`:`plain`}})),{type:`set`,id:`tok:best`,patch:{text:`오답 [0, 2] vs 정답 [5, 5]`,tone:`bad`},pop:!0}])),e.phase(`오답 확인`,`수열이 비내림차순이므로 뒤쪽에 더 큰 수(5)로 이루어진 길이 1짜리 구간 [5, 5]가 있습니다. 끝까지 탐색하며 최단 길이를 비교해야 합니다.`,_.earlyReturn),e.do({type:`focus`,ids:[x(0),x(1),x(2),x(5)]},{type:`arrow`,from:x(2),to:x(5),verdict:`good`,label:`뒤에 길이 1인 [5, 5] 존재!`},D(`오답 [0, 2](길이 3) ≠ 정답 [5, 5](길이 1)`)),j(e.finish())}var R={id:`consecutive-subsequence`,title:`연속된 부분 수열의 합`,level:2,category:`two-pointer`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/178870`,description:{summary:`비내림차순으로 정렬된 양의 정수 수열 sequence에서 연속된 부분 수열의 합이 k인 구간 [시작 인덱스, 끝 인덱스]를 구합니다. 합이 k인 구간이 여러 개면 길이가 가장 짧은 구간을, 길이도 같으면 앞쪽에 나오는 구간을 고릅니다.`,rules:[`5 ≤ sequence의 길이 ≤ 1,000,000`,`1 ≤ sequence의 원소 ≤ 1,000 (비내림차순 정렬)`,`5 ≤ k ≤ 1,000,000,000 (항상 부분 수열로 만들 수 있는 k만 주어짐)`,`길이가 가장 짧은 구간을 반환하되, 여러 개면 시작 인덱스가 가장 작은 구간을 반환`],examples:[{input:`sequence = [1, 2, 3, 4, 5], k = 7`,output:`[2, 3]`},{input:`sequence = [1, 1, 1, 2, 3, 4, 5], k = 5`,output:`[6, 6]`},{input:`sequence = [2, 2, 2, 2, 2], k = 6`,output:`[0, 2]`}]},keyIntuitions:[`원소가 모두 양수이므로 오른쪽 끝(right)을 늘리면 구간 합이 늘어나고, 왼쪽 끝(left)을 늘리면 구간 합이 줄어듭니다.`,`이 단조성 덕분에 left와 right 두 포인터를 모두 왼쪽에서 오른쪽으로만 이동시키며 O(N)에 모든 후보 구간을 확인할 수 있습니다.`,`수열이 비내림차순이므로 뒤쪽으로 갈수록 원소가 커져 더 짧은 구간이 나올 수 있습니다. 첫 구간을 찾았다고 멈추지 말고 끝까지 탐색해야 합니다.`],demo:{input:[c,l],label:`sequence = [${c.join(`, `)}], k = ${l}`},workUnit:`구간 합을 비교한 횟수`,approaches:[{id:`consecutive-subsequence-two-pointer`,name:`구간 늘리고 줄이기 (투 포인터)`,rank:`BEST`,timeComplexity:`O(N)`,spaceComplexity:`O(1)`,verdict:`합이 부족하면 오른쪽을 늘리고, 합이 k 이상이면 왼쪽을 줄이며 한 번에 훑는 정석 풀이입니다.`,pros:[`각 원소가 구간에 최대 한 번 들어가고 한 번 빠지므로 최대 2N번 이동으로 끝납니다.`,`추가 배열 없이 포인터와 합 변수만으로 O(1) 메모리에 동작합니다.`,"앞에서부터 순서대로 찾으므로 길이가 같을 때 `<` 조건만 쓰면 앞쪽 구간이 자연스럽게 유지됩니다."],cons:[`합이 k와 같을 때도 다음 후보를 보려면 왼쪽 포인터를 줄여 주어야 무한 루프에 빠지지 않습니다.`],whyThisRank:`양수 수열의 구간 합 단조성을 그대로 활용해 시간 O(N), 공간 O(1)로 가장 빠르고 간결하게 풀 수 있습니다.`,code:f,visualize:F},{id:`consecutive-subsequence-binary-search`,name:`누적합 + 끝점 이분 탐색`,rank:`ALTERNATIVE`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`누적합 배열을 만든 뒤 시작점마다 끝점을 이분 탐색하는 풀이로, 맞지만 O(N) 메모리와 log N 배의 탐색이 더 듭니다.`,pros:[`누적합이 단조증가한다는 성질을 이용해 이분 탐색으로 끝점을 바로 찾을 수 있습니다.`,`포인터 이동 조건이 헷갈릴 때 반복문 구조가 단순합니다.`],cons:[`길이 N + 1의 누적합 배열이 필요해 O(N) 메모리를 추가로 씁니다.`,`시작점마다 이분 탐색을 하므로 O(N log N) 시간이 걸려 투 포인터보다 비교 횟수가 많습니다.`],whyThisRank:`정답은 정확히 구하지만, 끝점 역시 단조증가하므로 매번 이분 탐색할 필요 없이 포인터만 이어서 밀면 O(N)과 O(1) 공간으로 줄일 수 있습니다.`,code:m,visualize:I},{id:`consecutive-subsequence-first-match`,name:`첫 번째 합 k 구간에서 바로 멈추기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(1)`,verdict:`합이 k인 첫 구간을 찾자마자 반환하면 뒤쪽에 있는 더 짧은 구간을 놓쳐 오답이 됩니다.`,pros:[`앞쪽에 가장 짧은 구간이 있는 예제([2, 2, 2, 2, 2], k = 6)는 통과합니다.`],cons:[`비내림차순 수열에서는 뒤쪽 원소가 더 크므로 뒤로 갈수록 같은 합 k를 더 적은 칸으로 만들 수 있습니다.`,`sequence = [1, 2, 2, 2, 3, 5], k = 5에서 정답 [5, 5](길이 1) 대신 [0, 2](길이 3)를 반환합니다.`],whyThisRank:`"앞쪽에 나오는 수열을 찾는다"는 조건만 보고 첫 매칭에서 멈추기 쉽지만, 우선순위는 "길이가 짧은 수열"이 먼저이므로 끝까지 탐색해야 합니다.`,code:g,visualize:L}],checks:{cases:[{args:[[1,2,3,4,5],7],expected:[2,3]},{args:[[1,1,1,2,3,4,5],5],expected:[6,6]},{args:[[2,2,2,2,2],6],expected:[0,2]},{args:[c,l],expected:[5,5]},{args:[[1,1,1,1,1],5],expected:[0,4]},{args:[[1,2,3,6,6],6],expected:[3,3]}],random:e=>{let t=5+Math.floor(e()*8),n=Array.from({length:t},()=>1+Math.floor(e()*9)).sort((e,t)=>e-t),r=Math.floor(e()*t),i=r+Math.floor(e()*(t-r));return[n,n.slice(r,i+1).reduce((e,t)=>e+t,0)]}}};export{R as default};