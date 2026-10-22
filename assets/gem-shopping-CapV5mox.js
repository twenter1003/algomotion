import{n as e,t}from"./index-D3a9ZpZK.js";import{i as n,o as r}from"./layout-DFaYBMY_.js";import{a as i,c as a,i as o,l as s}from"./shared-CL29HWIp.js";var c=[`DIA`,`RUBY`,`RUBY`,`DIA`,`DIA`,`EMERALD`,`SAPPHIRE`,`DIA`],l=c.length,u=[`DIA`,`RUBY`,`EMERALD`,`SAPPHIRE`],d=u.length,f={DIA:`DIA`,RUBY:`RUBY`,EMERALD:`EMER`,SAPPHIRE:`SAPP`},p={python:`def solution(gems):
    kind_count = len(set(gems))
    counts = {}
    best = [1, len(gems)]
    left = 0
    for right, gem in enumerate(gems):
        counts[gem] = counts.get(gem, 0) + 1      # 오른쪽 보석을 구간에 추가
        while len(counts) == kind_count:          # 모든 종류가 모인 동안 왼쪽을 줄인다
            if right - left < best[1] - best[0]:
                best = [left + 1, right + 1]
            left_gem = gems[left]
            counts[left_gem] -= 1
            if counts[left_gem] == 0:
                del counts[left_gem]
            left += 1
    return best`,javascript:`function solution(gems) {
  const kindCount = new Set(gems).size;
  const counts = new Map();
  let best = [1, gems.length];
  let left = 0;
  for (let right = 0; right < gems.length; right++) {
    const gem = gems[right];
    counts.set(gem, (counts.get(gem) ?? 0) + 1); // 오른쪽 보석을 구간에 추가
    while (counts.size === kindCount) {          // 모든 종류가 모인 동안 왼쪽을 줄인다
      if (right - left < best[1] - best[0]) {
        best = [left + 1, right + 1];
      }
      const leftGem = gems[left];
      if (counts.get(leftGem) === 1) counts.delete(leftGem);
      else counts.set(leftGem, counts.get(leftGem) - 1);
      left += 1;
    }
  }
  return best;
}`},m={init:o(p,[`kind_count = len(set(gems))`,`counts = {}`,`best = [1, len(gems)]`],[`const kindCount = new Set(gems).size`,`const counts = new Map()`,`let best = [1, gems.length]`]),addRight:o(p,[`for right, gem in enumerate(gems)`,`counts[gem] = counts.get(gem, 0) + 1`],[`for (let right = 0; right < gems.length; right++)`,`counts.set(gem, (counts.get(gem) ?? 0) + 1)`]),checkFull:o(p,[`while len(counts) == kind_count`,`if right - left < best[1] - best[0]`,`best = [left + 1, right + 1]`],[`while (counts.size === kindCount)`,`if (right - left < best[1] - best[0])`,`best = [left + 1, right + 1]`]),shrinkLeft:o(p,[`counts[left_gem] -= 1`,`if counts[left_gem] == 0`,`left += 1`],[`if (counts.get(leftGem) === 1) counts.delete(leftGem)`,`left += 1`]),done:o(p,[`return best`],[`return best`])},h={python:`def solution(gems):
    n = len(gems)
    kind_count = len(set(gems))
    def find_window(length):
        counts = {}
        for i in range(n):
            counts[gems[i]] = counts.get(gems[i], 0) + 1
            if i >= length:
                old = gems[i - length]
                if counts[old] == 1:
                    del counts[old]
                else:
                    counts[old] -= 1
            if i >= length - 1 and len(counts) == kind_count:
                return [i - length + 2, i + 1]
        return None
    lo, hi = kind_count, n
    best = [1, n]
    while lo <= hi:
        mid = (lo + hi) // 2
        found = find_window(mid)
        if found:
            best = found
            hi = mid - 1
        else:
            lo = mid + 1
    return best`,javascript:`function solution(gems) {
  const n = gems.length;
  const kindCount = new Set(gems).size;
  const findWindow = (len) => {
    const counts = new Map();
    for (let i = 0; i < n; i++) {
      counts.set(gems[i], (counts.get(gems[i]) ?? 0) + 1);
      if (i >= len) {
        const old = gems[i - len];
        if (counts.get(old) === 1) counts.delete(old);
        else counts.set(old, counts.get(old) - 1);
      }
      if (i >= len - 1 && counts.size === kindCount) return [i - len + 2, i + 1];
    }
    return null;
  };
  let lo = kindCount, hi = n, best = [1, n];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const found = findWindow(mid);
    if (found) { best = found; hi = mid - 1; }
    else lo = mid + 1;
  }
  return best;
}`},g={init:o(h,[`kind_count = len(set(gems))`,`lo, hi = kind_count, n`],[`const kindCount = new Set(gems).size`,`let lo = kindCount, hi = n`]),pickMid:o(h,[`while lo <= hi`,`mid = (lo + hi) // 2`,`found = find_window(mid)`],[`while (lo <= hi)`,`const mid = (lo + hi) >> 1`,`const found = findWindow(mid)`]),slide:o(h,[`for i in range(n)`,`if i >= length - 1 and len(counts) == kind_count`],[`for (let i = 0; i < n; i++)`,`if (i >= len - 1 && counts.size === kindCount)`]),hit:o(h,[`if found:`,`best = found`,`hi = mid - 1`],[`if (found) { best = found; hi = mid - 1; }`]),miss:o(h,[`lo = mid + 1`],[`else lo = mid + 1`]),done:o(h,[`return best`],[`return best`])},_={python:`# 주의: 시작점마다 끝점을 늘리며 매번 세면 N = 100,000에서 시간 초과가 납니다
def solution(gems):
    n = len(gems)
    kind_count = len(set(gems))
    best = [1, n]
    for start in range(n):
        seen = set()
        for end in range(start, n):
            seen.add(gems[end])
            if len(seen) == kind_count:
                if end - start < best[1] - best[0]:
                    best = [start + 1, end + 1]
                break
    return best`,javascript:`// 주의: 시작점마다 끝점을 늘리며 매번 세면 N = 100,000에서 시간 초과가 납니다
function solution(gems) {
  const n = gems.length;
  const kindCount = new Set(gems).size;
  let best = [1, n];
  for (let start = 0; start < n; start++) {
    const seen = new Set();
    for (let end = start; end < n; end++) {
      seen.add(gems[end]);
      if (seen.size === kindCount) {
        if (end - start < best[1] - best[0]) best = [start + 1, end + 1];
        break;
      }
    }
  }
  return best;
}`},v={init:o(_,[`kind_count = len(set(gems))`,`best = [1, n]`],[`const kindCount = new Set(gems).size`,`let best = [1, n]`]),startLoop:o(_,[`for start in range(n)`,`seen = set()`],[`for (let start = 0; start < n; start++)`,`const seen = new Set()`]),innerLoop:o(_,[`for end in range(start, n)`,`seen.add(gems[end])`,`if len(seen) == kind_count`],[`for (let end = start; end < n; end++)`,`seen.add(gems[end])`,`if (seen.size === kindCount)`]),update:o(_,[`if end - start < best[1] - best[0]`,`best = [start + 1, end + 1]`],[`if (end - start < best[1] - best[0]) best = [start + 1, end + 1]`]),done:o(_,[`return best`],[`return best`])},y=560,b=248,x=n({x:68,y:32,rows:1,cols:l,cell:54,gap:6}),S=r({x:68,y:158,w:78,h:42,gap:8}),C=e=>`g:${e}`,w=e=>`k:${e}`,T=(e,t)=>({x:x(0,Math.min(Math.max(t,0),l-1)).x+5,y:e===0?96:122,w:44,h:22}),E=(e,t)=>{let n=x(0,Math.min(e,t)),r=x(0,Math.max(e,t));return{x:n.x-3,y:n.y-3,w:r.x+r.w-n.x+6,h:n.h+6}},D=e=>({type:`wait`,ms:e}),O=()=>a([{type:`unfocus`},{type:`clearMarks`}]),k=e=>({type:`set`,id:`calc`,patch:{text:e}}),A=20,j=2e3,M=e=>Math.max(0,...e.actions.map(t=>t.start+t.duration-e.start)),N=n=>{for(let r of n.steps){let{phases:n}=e(r);n.forEach((e,i)=>{let a=i<n.length-1?140:r.isKeyframe?t:320,o=[...r.phases[i].caption].length*A-a;e.end-e.start<o&&r.phases[i].actions.push(D(Math.ceil(o-M(e))))});let i=e(r),a=i.phases.at(-1),o=j-i.total;o>0&&r.phases.at(-1).actions.push(D(a.end-a.start+o-M(a)))}return n};function P(e,t){let n=[{id:`lab:gems`,kind:`text`,rect:{x:0,y:32,w:62,h:54},tone:`muted`,text:`진열대`},{id:`lab:p0`,kind:`text`,rect:{x:0,y:96,w:62,h:22},tone:`muted`,text:e},{id:`lab:p1`,kind:`text`,rect:{x:0,y:122,w:62,h:22},tone:`muted`,text:t},{id:`lab:kinds`,kind:`text`,rect:{x:0,y:158,w:62,h:42},tone:`muted`,text:`보석 수`},{id:`win`,kind:`zone`,rect:E(0,0),tone:`explored`},{id:`tok:best`,kind:`token`,rect:{x:412,y:158,w:132,h:42},tone:`plain`,text:`최단 [1, ${l}]`},{id:`calc`,kind:`text`,rect:{x:68,y:210,w:476,h:28},text:``}];return c.forEach((e,t)=>n.push({id:C(t),kind:`cell`,rect:x(0,t),tone:`plain`,text:f[e],sub:`${t+1}번`})),u.forEach((e,t)=>n.push({id:w(e),kind:`cell`,rect:S(t),tone:`plain`,text:`${f[e]} 0`})),{width:y,height:b,items:n}}var F=(e,t,n,r,i)=>{let a=T(n,r),o=`ptr:${t}`;return e.has(o)?{type:`set`,id:o,patch:{rect:a,text:i}}:{type:`add`,item:{id:o,kind:`token`,rect:a,tone:`chosen`,text:i}}},I=e=>u.map(t=>{let n=e.get(t)??0;return{type:`set`,id:w(t),patch:{text:`${f[t]} ${n}`,tone:n>0?`chosen`:`plain`}}}),L=(e,t,n)=>c.map((r,i)=>({type:`set`,id:C(i),patch:{tone:i>=e&&i<=t?n:i<e?`visited`:`plain`}}));function R(){let e=new s(P(`left`,`right`)),t=new Map,n=0,r=[1,l],i=0,o=e=>({work:i,variables:{left:n+1,right:typeof e==`number`?e+1:e,kinds:`${t.size}/${d}`,best:`[${r[0]}, ${r[1]}]`}});e.step({title:`전체 보석 종류: ${d}종류 (DIA, RUBY, EMER, SAPP)`,codeHighlights:m.init,...o(`-`)}),e.phase(`종류 세기`,`진열대 전체에 있는 보석 종류는 모두 ${d}가지입니다. ${d}종류를 모두 포함하는 가장 짧은 구간을 찾습니다.`,m.init),e.do(...a([F(e,`l`,0,0,`L=1`),F(e,`r`,1,0,`R=1`),k(`목표: ${d}종류 보석을 모두 담는 가장 짧은 구간`)]));for(let s=0;s<l;s++){let l=c[s];t.set(l,(t.get(l)??0)+1),i+=1;let u=t.size===d;for(e.step({title:`right = ${s+1}번(${f[l]}) 담기 → ${t.size}/${d}종류`,codeHighlights:u?m.checkFull:m.addRight,...o(s)}),e.phase(`오른쪽 늘리기`,`${s+1}번 진열대의 ${f[l]} 보석을 구간에 추가합니다. 현재 ${t.size}종류가 모였습니다.`,m.addRight),e.do(...a([F(e,`r`,1,s,`R=${s+1}`),{type:`set`,id:`win`,patch:{rect:E(n,s)}},...L(n,s,u?`good`:`current`),...I(t),k(`구간 [${n+1}, ${s+1}]: ${t.size}/${d}종류`)])),e.do({type:`focus`,ids:[C(s),w(l)]},{type:`arrow`,from:C(s),to:w(l),verdict:u?`good`:`new`,label:`${f[l]} +1 (${t.size}/${d}종류)`},D(100),...O());t.size===d;){let l=n,u=c[l],p=t.get(u),h=s-l<r[1]-r[0];h&&(r=[l+1,s+1]),p===1?t.delete(u):t.set(u,p-1),n+=1,i+=1;let g=t.size===d;e.step({title:`[${l+1}, ${s+1}] 모든 종류 포함! left = ${l+1}번(${f[u]}) 빼기`,codeHighlights:m.shrinkLeft,...o(s)}),e.phase(`최소 구간 확인`,h?`구간 [${l+1}, ${s+1}](길이 ${s-l+1})에 ${d}종류가 모두 들어 있어 최단 구간을 [${r[0]}, ${r[1]}]로 갱신합니다.`:`구간 [${l+1}, ${s+1}]에 ${d}종류가 모두 들어 있습니다.`,m.checkFull),h?e.do({type:`set`,id:`tok:best`,patch:{text:`최단 [${r[0]}, ${r[1]}]`,tone:`good`},pop:!0}):e.do(D(240)),e.phase(`왼쪽 줄이기`,g?`${l+1}번의 ${f[u]}는 구간에 ${p}개 있으므로 하나 빼도 여전히 ${d}종류가 유지됩니다!`:`${l+1}번의 ${f[u]}가 마지막 1개여서 빼고 나면 ${t.size}종류가 됩니다. 다시 오른쪽을 늘립니다.`,m.shrinkLeft),e.do({type:`focus`,ids:[C(l),w(u)]},{type:`arrow`,from:C(l),to:w(u),verdict:g?`good`:`bad`,label:`${f[u]} ${p}→${p-1}`},D(100),...O()),e.do(...a([F(e,`l`,0,n,`L=${n+1}`),{type:`set`,id:`win`,patch:{rect:E(n,s)}},...L(n,s,g?`good`:`current`),...I(t),k(`구간 [${n+1}, ${s+1}]: ${t.size}/${d}종류`)]))}}return e.step({title:`정답: 가장 짧은 구간 [${r[0]}, ${r[1]}]`,codeHighlights:m.done,...o(l-1),answer:r,isKeyframe:!0}),e.phase(`정답`,`진열대를 한 번만 훑어(확인 ${i}번) ${d}종류 보석을 모두 담은 최단 구간 [${r[0]}, ${r[1]}]을 찾았습니다.`,m.done),e.do(...a([F(e,`l`,0,r[0]-1,`L=${r[0]}`),F(e,`r`,1,r[1]-1,`R=${r[1]}`),{type:`set`,id:`win`,patch:{rect:E(r[0]-1,r[1]-1),tone:`path`}},...c.map((e,t)=>({type:`set`,id:C(t),patch:{tone:t>=r[0]-1&&t<=r[1]-1?`path`:`visited`}})),{type:`set`,id:`tok:best`,patch:{text:`정답 [${r[0]}, ${r[1]}]`,tone:`path`},pop:!0},k(`정답 구간 [${r[0]}, ${r[1]}] (길이 ${r[1]-r[0]+1})`)])),N(e.finish())}function z(){let e=new s(P(`창 시작`,`창 끝`)),[t,n]=[d,l],r=[1,l],o=0,u=`-`,f=()=>({work:o,variables:{lo:t,hi:n,mid:u,best:`[${r[0]}, ${r[1]}]`}});for(e.step({title:`구간 길이 범위 설정: lo = ${d}, hi = ${l}`,codeHighlights:g.init,...f()}),e.phase(`범위 설정`,`${d}종류를 모두 담으려면 최소 길이 ${d} 이상이어야 하므로, 길이 범위를 [${d}, ${l}]으로 두고 이분 탐색합니다.`,g.init),e.do(...a([F(e,`l`,0,0,`L=1`),F(e,`r`,1,d-1,`R=${d}`),k(`길이 이분 탐색 범위: ${d} ~ ${l}`)]));t<=n;){let s=t+n>>1;u=s;let p=new Map,m=null,h=s-1;for(let e=0;e<l;e++){if(p.set(c[e],(p.get(c[e])??0)+1),o+=1,e>=s){let t=c[e-s];p.get(t)===1?p.delete(t):p.set(t,p.get(t)-1)}if(e>=s-1&&(h=e,p.size===d)){m=[e-s+2,e+1];break}}let _=h-s+1,v=h;m?(r=m,n=s-1):t=s+1,e.step({title:`길이 mid = ${s} 검사 → ${m?`[${m[0]}, ${m[1]}] 가능 (hi=${n})`:`불가능 (lo=${t})`}`,codeHighlights:m?g.hit:g.miss,...f()}),e.phase(`창 밀어 보기`,`길이 ${s}짜리 창을 왼쪽부터 밀면서 ${d}종류가 모두 들어가는 구간이 있는지 확인합니다.`,g.pickMid),e.do(...a([F(e,`l`,0,_,`L=${_+1}`),F(e,`r`,1,v,`R=${v+1}`),{type:`set`,id:`win`,patch:{rect:E(_,v)}},...L(_,v,m?`good`:`current`),...I(p),k(`길이 ${s} 검사: 구간 [${_+1}, ${v+1}] (${p.size}/${d}종류)`)])),e.phase(`범위 줄이기`,m?`길이 ${s}인 구간 [${m[0]}, ${m[1]}]에 모든 종류가 담깁니다! 더 짧은 길이도 가능한지 hi를 ${i(n)} 줄입니다.`:`길이 ${s}로는 어느 구간도 ${d}종류를 모두 담지 못합니다. lo를 ${i(t)} 늘립니다.`,m?g.hit:g.miss),e.do({type:`focus`,ids:[C(_),C(v)]},{type:`arrow`,from:C(_),to:C(v),verdict:m?`good`:`bad`,label:m?`길이 ${s} 성공!`:`길이 ${s} 실패`},...m?[{type:`set`,id:`tok:best`,patch:{text:`최단 [${r[0]}, ${r[1]}]`,tone:`good`},pop:!0}]:[],D(100),...O())}return e.step({title:`정답: [${r[0]}, ${r[1]}] (보석 확인 ${o}번)`,codeHighlights:g.done,...f(),answer:r,isKeyframe:!0}),e.phase(`정답`,`정석과 같은 [${r[0]}, ${r[1]}]을 찾았지만, 길이마다 처음부터 창을 다시 밀어 보석을 ${o}번(정석은 11번) 확인했습니다.`,g.done),e.do(...a([{type:`set`,id:`win`,patch:{rect:E(r[0]-1,r[1]-1),tone:`path`}},...c.map((e,t)=>({type:`set`,id:C(t),patch:{tone:t>=r[0]-1&&t<=r[1]-1?`path`:`visited`}})),{type:`set`,id:`tok:best`,patch:{text:`정답 [${r[0]}, ${r[1]}]`,tone:`path`},pop:!0},k(`정답 [${r[0]}, ${r[1]}] (O(N log N), 총 ${o}번 확인)`)])),N(e.finish())}function B(){let e=new s(P(`start`,`end`)),t=[1,l],n=0,r=`-`,i=`-`,o=()=>({work:n,variables:{start:r,end:i,best:`[${t[0]}, ${t[1]}]`}});e.step({title:`초기화: 시작점 1번~${l}번마다 끝점 탐색`,codeHighlights:v.init,...o()}),e.phase(`시작`,`모든 시작 진열대에서 출발해 ${d}종류가 다 모일 때까지 오른쪽으로 하나씩 세어 보면 얼마나 많은 작업이 드는지 확인합니다.`,v.init),e.do(...a([F(e,`l`,0,0,`S=1`),F(e,`r`,1,0,`E=1`),k(`시작점마다 처음부터 집합(Set)으로 다시 세기`)]));for(let s=0;s<l;s++){let u=new Map,f=s;for(let e=s;e<l&&(f=e,u.set(c[e],(u.get(c[e])??0)+1),n+=1,u.size!==d);e++);let p=u.size===d,m=p&&f-s<t[1]-t[0];m&&(t=[s+1,f+1]),r=s+1,i=f+1;let h=f-s+1;e.step({title:`시작 ${s+1}번: ${f+1}번까지 ${h}개 확인 → ${p?`[${s+1}, ${f+1}] 완성`:`미완성`}`,codeHighlights:m?v.update:v.innerLoop,...o()}),e.phase(`시작점 정하기`,`${s+1}번 진열대에서 새로 집합을 비우고 오른쪽으로 하나씩 보석을 담습니다.`,v.startLoop),e.do(...a([F(e,`l`,0,s,`S=${s+1}`),F(e,`r`,1,f,`E=${f+1}`),{type:`set`,id:`win`,patch:{rect:E(s,f)}},...L(s,f,p?`good`:`current`),...I(u),k(`시작 ${s+1}번 → ${f+1}번까지 ${h}칸 다시 확인 (누적 ${n}번)`)])),e.phase(`끝점까지 세기`,p?`${f+1}번까지 ${h}칸을 확인해 ${d}종류를 모았습니다.${m?` 최단 구간을 [${t[0]}, ${t[1]}]로 갱신합니다.`:` 이미 본 보석들을 또 처음부터 다시 셌습니다.`}`:`끝(${l}번)까지 ${h}칸을 다 보았지만 ${u.size}종류뿐입니다.`,m?v.update:v.innerLoop),e.do({type:`focus`,ids:[C(s),C(f)]},{type:`arrow`,from:C(s),to:C(f),verdict:p?`good`:`bad`,label:`${h}개 확인 (${u.size}/${d}종류)`},...m?[{type:`set`,id:`tok:best`,patch:{text:`최단 [${t[0]}, ${t[1]}]`,tone:`good`},pop:!0}]:[],D(100),...O())}return e.step({title:`시간 초과 위험: 보석 ${n}번 확인 (정석은 11번)`,codeHighlights:v.done,...o(),answer:t,isKeyframe:!0}),e.phase(`작업량 비교`,`답은 [${t[0]}, ${t[1]}]로 같지만, 같은 구간을 반복해서 세느라 진열대를 ${n}번 확인했습니다(정석은 11번).`,v.done),e.do(...a([{type:`set`,id:`win`,patch:{rect:E(t[0]-1,t[1]-1),tone:`bad`}},{type:`set`,id:`tok:best`,patch:{text:`확인 ${n}번 vs 11번`,tone:`bad`},pop:!0},k(`N = 100,000이면 최대 약 5 × 10^9번 확인 → 효율성 시간 초과!`)])),N(e.finish())}var V={id:`gem-shopping`,title:`보석 쇼핑`,level:3,category:`two-pointer`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/67258`,description:{summary:`진열대에 나열된 보석 배열 gems에서 모든 종류의 보석을 적어도 1개 이상 포함하는 가장 짧은 연속 구간 [시작 번호, 끝 번호]를 구합니다. 가장 짧은 구간이 여러 개면 시작 진열대 번호가 가장 작은 구간을 반환합니다.`,rules:[`gems 배열의 크기는 1 이상 100,000 이하`,`각 원소는 길이 1 이상 10 이하의 알파벳 대문자 문자열`,`진열대 번호는 1번부터 시작하며 [시작 번호, 끝 번호] 형태로 반환`,`가장 짧은 구간이 여러 개이면 시작 번호가 가장 작은 구간을 반환`],examples:[{input:`gems = ["DIA", "RUBY", "RUBY", "DIA", "DIA", "EMERALD", "SAPPHIRE", "DIA"]`,output:`[3, 7]`},{input:`gems = ["AA", "AB", "AC", "AA", "AC"]`,output:`[1, 3]`},{input:`gems = ["XYZ", "XYZ", "XYZ"]`,output:`[1, 1]`},{input:`gems = ["ZZZ", "YYY", "NNNN", "YYY", "BBB"]`,output:`[1, 5]`}]},keyIntuitions:[`먼저 전체 보석 종류 수 K를 구한 뒤, 현재 구간 안에 들어 있는 보석별 개수를 해시 맵(사전)으로 관리합니다.`,`사전의 키 개수가 K가 될 때까지 오른쪽 포인터를 늘리고, K개가 모인 동안에는 왼쪽 포인터를 줄이며 불필요한 중복 보석을 덜어냅니다.`,`왼쪽과 오른쪽 포인터가 모두 앞으로만 전진하므로 진열대를 최대 두 번(2N번)만 훑고 O(N) 시간에 최단 구간을 찾습니다.`],demo:{input:[c],label:`gems = ["DIA", "RUBY", "RUBY", "DIA", "DIA", "EMERALD", "SAPPHIRE", "DIA"]`},workUnit:`진열대 보석을 확인한 횟수`,approaches:[{id:`gem-shopping-two-pointer`,name:`모든 종류를 담는 최소 구간 (투 포인터 + 해시 맵)`,rank:`BEST`,timeComplexity:`O(N)`,spaceComplexity:`O(K)`,verdict:`오른쪽으로 종류를 채우고 왼쪽으로 중복을 덜어내며 한 번에 최단 구간을 찾는 정석 풀이입니다.`,pros:[`각 보석이 사전에 한 번 들어가고 최대 한 번 빠지므로 O(N) 시간에 끝납니다.`,"보석 종류의 개수가 0이 될 때 사전에서 키를 지우면 `len(counts) == kind_count`를 O(1)에 판정할 수 있습니다."],cons:[`진열대 번호가 1번부터 시작하므로 반환할 때 인덱스에 +1을 해 주는 것을 잊지 말아야 합니다.`],whyThisRank:`이전 구간의 보석 개수 정보를 그대로 이어받아 포인터만 밀기 때문에 N = 100,000인 효율성 테스트도 여유 있게 통과합니다.`,code:p,visualize:R},{id:`gem-shopping-binary-window`,name:`길이 이분 탐색 + 슬라이딩 윈도우`,rank:`ALTERNATIVE`,timeComplexity:`O(N log N)`,spaceComplexity:`O(K)`,verdict:`구간 길이를 이분 탐색하며 고정 길이 슬라이딩 윈도우로 확인하는 풀이로, 맞지만 진열대를 log N번 반복해서 훑습니다.`,pros:[`길이 L로 모든 종류를 담을 수 있으면 L+1로도 담을 수 있다는 단조성을 활용해 이분 탐색으로 접근할 수 있습니다.`,`고정 길이 윈도우만 구현하면 되어 가변 구간 포인터 제어가 낯설 때 떠올리기 좋습니다.`],cons:[`길이 후보마다 배열 전체를 처음부터 다시 훑으므로 O(N log N) 시간이 걸려 투 포인터보다 느립니다.`,`슬라이딩 윈도우 함수와 이분 탐색 루프를 함께 작성해야 해서 코드가 길어집니다.`],whyThisRank:`정답은 구할 수 있지만, 가변 길이 투 포인터를 쓰면 이분 탐색 없이 단 한 번의 순회(O(N))로 바로 최소 길이를 찾을 수 있습니다.`,code:h,visualize:z},{id:`gem-shopping-brute-force`,name:`모든 시작점에서 끝점까지 다시 세기`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(N²)`,spaceComplexity:`O(K)`,verdict:`시작 진열대마다 집합을 새로 만들어 끝점을 늘려 가면 겹치는 구간을 매번 다시 세어 효율성 테스트에서 시간 초과가 납니다.`,pros:[`구현이 가장 단순하고 작은 예제에서는 올바른 답을 냅니다.`],cons:[`start가 한 칸 옮겨갈 때마다 이미 확인한 뒤쪽 보석들을 처음부터 다시 셉니다.`,`N = 100,000일 때 최악 약 50억 번의 연산이 필요해 시간 제한 안에 끝나지 않습니다.`],whyThisRank:`start를 한 칸 오른쪽으로 옮길 때 앞 보석 하나만 빼면 나머지 구간의 보석 개수는 그대로 재활용할 수 있다는 투 포인터의 핵심을 놓친 풀이입니다.`,code:_,visualize:B}],checks:{cases:[{args:[[`DIA`,`RUBY`,`RUBY`,`DIA`,`DIA`,`EMERALD`,`SAPPHIRE`,`DIA`]],expected:[3,7]},{args:[[`AA`,`AB`,`AC`,`AA`,`AC`]],expected:[1,3]},{args:[[`XYZ`,`XYZ`,`XYZ`]],expected:[1,1]},{args:[[`ZZZ`,`YYY`,`NNNN`,`YYY`,`BBB`]],expected:[1,5]},{args:[[`A`]],expected:[1,1]},{args:[[`A`,`B`,`B`,`A`,`C`]],expected:[3,5]}],random:e=>{let t=[`A`,`B`,`C`,`D`],n=1+Math.floor(e()*4),r=n+Math.floor(e()*7);return[Array.from({length:r},()=>t[Math.floor(e()*n)])]}}};export{V as default};