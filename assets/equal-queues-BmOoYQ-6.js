import{n as e,t}from"./index-DQku_aTs.js";import{i as n}from"./layout-DFaYBMY_.js";import{a as r,c as i,i as a,r as o,s}from"./shared-e6uNbDLo.js";var c=[1,1,1,1],l=[1,1,7,1],u=c.length,d=[...c,...l],f=d.length,p=d.reduce((e,t)=>e+t,0),m=p/2,h=[0,...d.map((e,t)=>d.slice(0,t+1).reduce((e,t)=>e+t,0))],g={python:`def solution(queue1, queue2):
    total = sum(queue1) + sum(queue2)
    if total % 2 != 0:
        return -1
    target = total // 2
    n = len(queue1)
    arr = queue1 + queue2
    i, j = 0, n
    sum1 = sum(queue1)
    for moves in range(3 * n):                # 최대 3N번 안에 반드시 판정 가능
        if sum1 == target:
            return moves
        if sum1 < target:
            sum1 += arr[j % (2 * n)]          # 큐2에서 꺼내 큐1에 추가
            j += 1
        else:
            sum1 -= arr[i % (2 * n)]          # 큐1에서 꺼내 큐2에 추가
            i += 1
    return -1`,javascript:`function solution(queue1, queue2) {
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  const total = sum(queue1) + sum(queue2);
  if (total % 2 !== 0) return -1;
  const target = total / 2;
  const n = queue1.length;
  const arr = [...queue1, ...queue2];
  let i = 0, j = n, sum1 = sum(queue1);
  for (let moves = 0; moves < 3 * n; moves++) { // 최대 3N번 안에 반드시 판정 가능
    if (sum1 === target) return moves;
    if (sum1 < target) {
      sum1 += arr[j % (2 * n)]; // 큐2에서 꺼내 큐1에 추가
      j += 1;
    } else {
      sum1 -= arr[i % (2 * n)]; // 큐1에서 꺼내 큐2에 추가
      i += 1;
    }
  }
  return -1;
}`},_={init:a(g,[`target = total // 2`,`arr = queue1 + queue2`,`i, j = 0, n`],[`const target = total / 2`,`const arr = [...queue1, ...queue2]`,`let i = 0, j = n`]),check:a(g,[`for moves in range(3 * n)`,`if sum1 == target`],[`for (let moves = 0; moves < 3 * n; moves++)`,`if (sum1 === target) return moves`]),fromQ2:a(g,[`if sum1 < target:`,`sum1 += arr[j % (2 * n)]`,`j += 1`],[`if (sum1 < target)`,`sum1 += arr[j % (2 * n)]`,`j += 1`]),fromQ1:a(g,[`sum1 -= arr[i % (2 * n)]`,`i += 1`],[`sum1 -= arr[i % (2 * n)]`,`i += 1`]),done:a(g,[`if sum1 == target:`,`return moves`],[`if (sum1 === target) return moves`])},v={python:`from bisect import bisect_left

def solution(queue1, queue2):
    total = sum(queue1) + sum(queue2)
    if total % 2 != 0:
        return -1
    target = total // 2
    n = len(queue1)
    arr = queue1 + queue2
    prefix = [0] * (2 * n + 1)
    for k in range(2 * n):
        prefix[k + 1] = prefix[k] + arr[k]
    best = None
    for l in range(2 * n):
        idx = bisect_left(prefix, prefix[l] + target, l + 1, 2 * n + 1)
        if idx <= 2 * n and prefix[idx] == prefix[l] + target:
            r = idx - 1
            if r < n - 1:
                moves = l + (r + 1) + n
            elif r == n - 1:
                moves = l
            elif r == 2 * n - 1 and l >= n:
                moves = l - n
            else:
                moves = l + (r + 1 - n)
            if best is None or moves < best:
                best = moves
    return -1 if best is None else best`,javascript:`function solution(queue1, queue2) {
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  const total = sum(queue1) + sum(queue2);
  if (total % 2 !== 0) return -1;
  const target = total / 2;
  const n = queue1.length;
  const arr = [...queue1, ...queue2];
  const prefix = new Array(2 * n + 1).fill(0);
  for (let k = 0; k < 2 * n; k++) prefix[k + 1] = prefix[k] + arr[k];
  let best = Infinity;
  for (let l = 0; l < 2 * n; l++) {
    const want = prefix[l] + target;
    let lo = l + 1, hi = 2 * n + 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (prefix[mid] < want) lo = mid + 1;
      else hi = mid;
    }
    if (lo <= 2 * n && prefix[lo] === want) {
      const r = lo - 1;
      let moves;
      if (r < n - 1) moves = l + (r + 1) + n;
      else if (r === n - 1) moves = l;
      else if (r === 2 * n - 1 && l >= n) moves = l - n;
      else moves = l + (r + 1 - n);
      if (moves < best) best = moves;
    }
  }
  return best === Infinity ? -1 : best;
}`},y={init:a(v,[`prefix = [0] * (2 * n + 1)`,`prefix[k + 1] = prefix[k] + arr[k]`],[`const prefix = new Array(2 * n + 1)`,`for (let k = 0; k < 2 * n; k++) prefix[k + 1]`]),search:a(v,[`for l in range(2 * n)`,`idx = bisect_left(prefix, prefix[l] + target`],[`for (let l = 0; l < 2 * n; l++)`,`while (lo < hi)`]),hit:a(v,[`if idx <= 2 * n and prefix[idx] == prefix[l] + target`,`if best is None or moves < best`,`best = moves`],[`if (lo <= 2 * n && prefix[lo] === want)`,`if (moves < best) best = moves`]),done:a(v,[`return -1 if best is None else best`],[`return best === Infinity ? -1 : best`])},b={python:`# 주의: 상한을 2 * n으로 잡으면 한쪽 큐의 끝 원소만 남기는 경우(최대 3n - 3회)를 놓칩니다
def solution(queue1, queue2):
    total = sum(queue1) + sum(queue2)
    if total % 2 != 0:
        return -1
    target = total // 2
    n = len(queue1)
    arr = queue1 + queue2
    i, j = 0, n
    sum1 = sum(queue1)
    for moves in range(2 * n):                # 2 * n번까지만 확인 (너무 일찍 포기!)
        if sum1 == target:
            return moves
        if sum1 < target:
            sum1 += arr[j % (2 * n)]
            j += 1
        else:
            sum1 -= arr[i % (2 * n)]
            i += 1
    return -1`,javascript:`// 주의: 상한을 2 * n으로 잡으면 한쪽 큐의 끝 원소만 남기는 경우(최대 3n - 3회)를 놓칩니다
function solution(queue1, queue2) {
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  const total = sum(queue1) + sum(queue2);
  if (total % 2 !== 0) return -1;
  const target = total / 2;
  const n = queue1.length;
  const arr = [...queue1, ...queue2];
  let i = 0, j = n, sum1 = sum(queue1);
  for (let moves = 0; moves < 2 * n; moves++) { // 2 * n번까지만 확인 (너무 일찍 포기!)
    if (sum1 === target) return moves;
    if (sum1 < target) {
      sum1 += arr[j % (2 * n)];
      j += 1;
    } else {
      sum1 -= arr[i % (2 * n)];
      i += 1;
    }
  }
  return -1;
}`},x={init:a(b,[`target = total // 2`,`i, j = 0, n`,`sum1 = sum(queue1)`],[`const target = total / 2`,`let i = 0, j = n, sum1 = sum(queue1)`]),loop:a(b,[`for moves in range(2 * n)`,`if sum1 == target`],[`for (let moves = 0; moves < 2 * n; moves++)`,`if (sum1 === target) return moves`]),fromQ2:a(b,[`if sum1 < target:`,`sum1 += arr[j % (2 * n)]`,`j += 1`],[`if (sum1 < target)`,`sum1 += arr[j % (2 * n)]`,`j += 1`]),fromQ1:a(b,[`sum1 -= arr[i % (2 * n)]`,`i += 1`],[`sum1 -= arr[i % (2 * n)]`,`i += 1`]),fail:a(b,[`return -1`],[`return -1`])},S=560,C=248,w=n({x:68,y:34,rows:1,cols:f,cell:54,gap:6}),T=e=>`c:${e}`,E=(e,t)=>({x:w(0,t%f).x+5,y:e===0?98:124,w:44,h:22}),D=(e,t)=>{let n=w(0,Math.min(Math.max(e,0),f-1)),r=w(0,Math.min(Math.max(t,0),f-1)),i=Math.min(n.x,r.x),a=Math.max(n.x+n.w,r.x+r.w);return{x:i-3,y:n.y-3,w:a-i+6,h:n.h+6}},O=[{x:68,y:160,w:146,h:36},{x:224,y:160,w:146,h:36},{x:380,y:160,w:162,h:36}],k=e=>({type:`wait`,ms:e}),A=()=>s([{type:`unfocus`},{type:`clearMarks`}]),j=e=>({type:`set`,id:`calc`,patch:{text:e}}),M=20,N=2e3,P=e=>Math.max(0,...e.actions.map(t=>t.start+t.duration-e.start)),F=n=>{for(let r of n.steps){let{phases:n}=e(r);n.forEach((e,i)=>{let a=i<n.length-1?140:r.isKeyframe?t:320,o=[...r.phases[i].caption].length*M-a;e.end-e.start<o&&r.phases[i].actions.push(k(Math.ceil(o-P(e))))});let i=e(r),a=i.phases.at(-1),o=N-i.total;o>0&&r.phases.at(-1).actions.push(k(a.end-a.start+o-P(a)))}return n};function I(e,t){let n=[{id:`lab:arr`,kind:`text`,rect:{x:0,y:34,w:62,h:54},tone:`muted`,text:`Q1+Q2`},{id:`lab:p0`,kind:`text`,rect:{x:0,y:98,w:62,h:22},tone:`muted`,text:e},{id:`lab:p1`,kind:`text`,rect:{x:0,y:124,w:62,h:22},tone:`muted`,text:t},{id:`win`,kind:`zone`,rect:D(0,u-1),tone:`explored`},{id:`tok:q1`,kind:`token`,rect:O[0],tone:`chosen`,text:`큐1 합 4`},{id:`tok:q2`,kind:`token`,rect:O[1],tone:`plain`,text:`큐2 합 10`},{id:`tok:ans`,kind:`token`,rect:O[2],tone:`plain`,text:`목표 합 ${m}`},{id:`calc`,kind:`text`,rect:{x:68,y:208,w:474,h:28},text:``}];return d.forEach((e,t)=>n.push({id:T(t),kind:`cell`,rect:w(0,t),tone:t<u?`current`:`plain`,text:String(e),sub:t<u?`Q1[${t}]`:`Q2[${t-u}]`})),{width:S,height:C,items:n}}var L=(e,t,n,r,i)=>{let a=E(n,r),o=`ptr:${t}`;return e.has(o)?{type:`set`,id:o,patch:{rect:a,text:i}}:{type:`add`,item:{id:o,kind:`token`,rect:a,tone:`chosen`,text:i}}},R=(e,t,n)=>d.map((r,i)=>({type:`set`,id:T(i),patch:{tone:i>=e&&i<t?n:i<e?`visited`:`plain`}}));function z(){let e=new i(I(`i (큐1 앞)`,`j (큐2 앞)`)),[t,n,a,c,l]=[0,u,4,0,0],h=()=>({work:l,variables:{i:t,j:n,sum1:a,sum2:p-a,moves:c}});for(e.step({title:`초기화: Q1 합 = 4, Q2 합 = 10, 목표 합 = ${m}`,codeHighlights:_.init,...h()}),e.phase(`이어 붙이기`,`Q1과 Q2를 이어 붙인 배열 arr에서 큐1은 구간 [i=${t}, j=${n})에 해당합니다. 전체 합은 ${p}이므로 목표 합은 ${m}입니다.`,_.init),e.do(...s([L(e,`i`,0,t,`i=${t}`),L(e,`j`,1,n,`j=${n}`),j(`초기 Q1 합 = 4, Q2 합 = 10 (목표 ${m})`)]));a!==m&&c<3*u;){let[i,u,g]=[t,n,a],v=g<m,y=(v?u:i)%f,b=d[y];v?(a+=b,n+=1):(a-=b,t+=1),c+=1,l+=1;let x=p-a,S=a===m;e.step({title:`${c}회: ${v?`Q2→Q1 (${b})`:`Q1→Q2 (${b})`} → Q1 합 ${a}`,codeHighlights:v?_.fromQ2:_.fromQ1,...h()}),e.phase(`합 비교`,v?`큐1의 합(${g})이 목표(${m})보다 작으므로 합이 더 큰 큐2에서 원소 ${o(b,`을`,`를`)} 가져옵니다.`:`큐1의 합(${g})이 목표(${m})보다 크므로 큐1의 맨 앞 원소 ${o(b,`을`,`를`)} 큐2로 보냅니다.`,_.check),e.do({type:`focus`,ids:[T(y)]},{type:`arrow`,from:T(y),to:v?`tok:q1`:`tok:q2`,verdict:S?`good`:`new`,label:v?`+${b} (Q2→Q1)`:`-${b} (Q1→Q2)`}),e.phase(`포인터 이동`,S?`${v?`j를 ${r(n)}`:`i를 ${r(t)}`} 옮기자 큐1 합 = ${a}, 큐2 합 = ${x}로 같아졌습니다!`:`${v?`j를 ${r(n)}`:`i를 ${r(t)}`} 옮겨 큐1 구간이 [${t}, ${n})가 되었습니다 (합 ${a}).`,v?_.fromQ2:_.fromQ1),e.do(...A()),e.do(...s([L(e,`i`,0,t,`i=${t}`),L(e,`j`,1,n,`j=${n}`),{type:`set`,id:`win`,patch:{rect:D(t,n-1),tone:S?`path`:`explored`}},...R(t,n,S?`path`:`current`),{type:`set`,id:`tok:q1`,patch:{text:`큐1 합 ${a}`,tone:S?`good`:`chosen`},pop:!0},{type:`set`,id:`tok:q2`,patch:{text:`큐2 합 ${x}`,tone:S?`good`:`plain`},pop:!0},{type:`set`,id:`tok:ans`,patch:{text:`이동 ${c}회`,tone:S?`good`:`plain`},pop:!0},j(`구간 [${t}, ${n}): Q1 합 = ${a}, Q2 합 = ${x}`)]))}return e.step({title:`정답: 최소 ${c}회 이동으로 두 큐 합이 ${m}`,codeHighlights:_.done,...h(),answer:c,isKeyframe:!0}),e.phase(`정답`,`Q2에 있던 7 하나만 Q1에 남기고 나머지 원소를 모두 Q2로 보내어 총 ${c}번 만에 두 큐의 합을 ${r(m)} 맞췄습니다.`,_.done),e.do(...s([{type:`set`,id:`tok:ans`,patch:{text:`정답 ${c}회`,tone:`path`},pop:!0},j(`최소 작업 횟수 = ${c}회 (2N = 8보다 1회 더 필요)`)])),F(e.finish())}function B(){let e=new i(I(`구간 시작 l`,`구간 끝 r`)),t=0,n=1/0,r=`-`,a=`-`,c=()=>n===1/0?`-`:n,l=()=>({work:t,variables:{l:r,r:a,target:m,best:c()}});e.step({title:`누적합 배열 준비: P = [${h.join(`, `)}]`,codeHighlights:y.init,...l()}),e.phase(`누적합 계산`,`연결 배열 arr의 누적합 P를 구합니다. 합이 ${m}인 연속 구간 [l, r]을 이분 탐색으로 찾아 최소 이동 횟수를 계산합니다.`,y.init),e.do(...s([...d.map((e,t)=>({type:`set`,id:T(t),patch:{sub:`P=${h[t+1]}`}})),j(`P = [${h.join(`, `)}]`)]));for(let i=0;i<f;i++){let c=h[i]+m,d=i+1,p=f+1,g=0;for(;d<p;){let e=d+p>>1;g+=1,t+=1,h[e]<c?d=e+1:p=e}let _=d<=f&&h[d]===c,v=_?d-1:Math.min(d-1,f-1),b=-1;_&&(b=v<u-1?i+(v+1)+u:v===u-1?i:v===f-1&&i>=u?i-u:i+(v+1-u),b<n&&(n=b)),r=i,a=v;let x=h[v+1]-h[i];e.step({title:`시작 l = ${i}: 이분 탐색 ${g}번 비교 → ${_?`구간 [${i}, ${v}] (${b}회)`:`합 7 없음`}`,codeHighlights:_?y.hit:y.search,...l()}),e.phase(`이분 탐색`,`l = ${i}에서 P[r+1] = ${h[i]} + ${m} = ${o(c,`을`,`를`)} 이분 탐색으로 찾습니다(${g}번 비교).`,y.search),e.do(...s([L(e,`i`,0,i,`l=${i}`),L(e,`j`,1,v,`r=${v}`),{type:`set`,id:`win`,patch:{rect:D(i,v)}},...R(i,v+1,_?`good`:`current`),{type:`set`,id:`tok:q1`,patch:{text:`구간 합 ${x}`,tone:_?`good`:`chosen`},pop:!0},j(`l = ${i}에서 끝점 이분 탐색 → r = ${v} (구간 합 ${x})`)])),e.phase(`이동 횟수 계산`,_?`구간 [${i}, ${v}]의 합이 ${m}입니다! 이 구간만 남기는 이동 횟수는 ${b}회이며 최솟값은 ${n}회입니다.`:`합이 정확히 ${m}이 되는 끝점이 없어 다음 시작점으로 넘어갑니다.`,_?y.hit:y.search),e.do({type:`focus`,ids:[T(i),T(v)]},{type:`arrow`,from:T(i),to:T(v),verdict:_?`good`:`bad`,label:_?`합 ${m} (${b}회)`:`합 ${x} ≠ ${m}`},..._?[{type:`set`,id:`tok:ans`,patch:{text:`최소 ${n}회`,tone:`good`},pop:!0}]:[],k(100),...A())}return e.step({title:`정답: ${n}회 (이분 탐색 비교 ${t}번)`,codeHighlights:y.done,...l(),answer:n,isKeyframe:!0}),e.phase(`정답`,`정석과 같이 ${n}회를 구했지만, 이분 탐색으로 ${t}번(정석은 9번) 비교했고 구간 위치별 이동 횟수 공식을 따로 나누어 계산해야 합니다.`,y.done),e.do(...s([{type:`set`,id:`win`,patch:{rect:D(6,6),tone:`path`}},...R(6,7,`path`),{type:`set`,id:`tok:ans`,patch:{text:`정답 ${n}회`,tone:`path`},pop:!0},j(`정답 ${n}회 (비교 ${t}번 vs 정석 9번)`)])),F(e.finish())}function V(){let e=new i(I(`i (큐1 앞)`,`j (큐2 앞)`)),[t,n,r,a,c]=[0,u,4,0,0],l=2*u,h=()=>({work:c,variables:{i:t,j:n,sum1:r,moves:a,limit:l}});for(e.step({title:`초기화: 반복 상한을 2N = ${l}회로 설정`,codeHighlights:x.init,...h()}),e.phase(`시작`,`두 큐의 길이가 각각 N = ${u}이니 2N = ${l}번만 옮겨 보면 충분하다고 생각하기 쉽습니다. 상한을 ${l}번으로 두고 실행해 봅니다.`,x.init),e.do(...s([L(e,`i`,0,t,`i=${t}`),L(e,`j`,1,n,`j=${n}`),{type:`set`,id:`tok:ans`,patch:{text:`상한 2N = ${l}회`}},j(`상한 2N = ${l}회까지 탐색`)]));a<l;){let[i,u,g]=[t,n,r],_=g<m,v=(_?u:i)%f,y=d[v];_?(r+=y,n+=1):(r-=y,t+=1),a+=1,c+=1;let b=p-r;e.step({title:`${a}/${l}회: ${_?`Q2→Q1 (${y})`:`Q1→Q2 (${y})`} → Q1 합 ${r}`,codeHighlights:_?x.fromQ2:x.fromQ1,...h()}),e.phase(`합 비교`,_?`큐1 합(${g}) < ${m}이므로 큐2에서 ${o(y,`을`,`를`)} 가져옵니다.`:`큐1 합(${g}) > ${m}이므로 큐1에서 ${o(y,`을`,`를`)} 빼냅니다.`,x.loop),e.do({type:`focus`,ids:[T(v)]},{type:`arrow`,from:T(v),to:_?`tok:q1`:`tok:q2`,verdict:`new`,label:_?`+${y}`:`-${y}`}),e.phase(`포인터 이동`,`${a}회 이동 후 큐1 합은 ${r}, 큐2 합은 ${b}입니다.`,_?x.fromQ2:x.fromQ1),e.do(...A()),e.do(...s([L(e,`i`,0,t,`i=${t}`),L(e,`j`,1,n,`j=${n}`),{type:`set`,id:`win`,patch:{rect:D(t,n-1)}},...R(t,n,`current`),{type:`set`,id:`tok:q1`,patch:{text:`큐1 합 ${r}`},pop:!0},{type:`set`,id:`tok:q2`,patch:{text:`큐2 합 ${b}`},pop:!0},{type:`set`,id:`tok:ans`,patch:{text:`${a}/${l}회 진행`},pop:!0},j(`구간 [${t}, ${n}): Q1 합 = ${r} (목표 ${m}까지 1회 남음)`)]))}return e.step({title:`오답: ${l}회에서 포기해 -1 반환 — 실제로는 1회만 더 하면 정답 9회!`,codeHighlights:x.fail,...h(),answer:-1,isKeyframe:!0}),e.phase(`오답 확인`,`2N = ${l}회가 끝나 루프가 종료되어 -1을 반환했습니다! 하지만 바로 다음 9회째에 i=5의 1만 빼면 큐1에 [7]만 남아 합이 ${m}이 됩니다.`,x.fail),e.do(...s([{type:`set`,id:`win`,patch:{rect:D(t,n-1),tone:`bad`}},{type:`set`,id:T(5),patch:{tone:`bad`}},{type:`set`,id:T(6),patch:{tone:`good`}},{type:`set`,id:`tok:ans`,patch:{text:`오답 -1 (정답 9회)`,tone:`bad`},pop:!0},j(`한쪽 큐의 뒤쪽 원소 하나만 남기려면 최대 3N − 3회(9회)가 필요합니다!`)])),F(e.finish())}var H={id:`equal-queues`,title:`두 큐 합 같게 만들기`,level:2,category:`two-pointer`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/118667`,description:{summary:`길이가 같은 두 개의 큐 queue1, queue2에서 한 번에 한 원소를 꺼내(pop) 다른 큐의 뒤에 넣는(insert) 작업을 반복해 두 큐의 원소 합을 같게 만듭니다. 필요한 최소 작업 횟수를 구하고, 불가능하면 -1을 반환합니다.`,rules:[`1 ≤ queue1의 길이 = queue2의 길이 ≤ 300,000`,`1 ≤ 각 원소 ≤ 10^9`,`pop 한 번과 insert 한 번을 합쳐 작업 1회로 침`,`어떤 방법으로도 두 큐의 합을 같게 만들 수 없으면 -1을 반환`],examples:[{input:`queue1 = [3, 2, 7, 2], queue2 = [4, 6, 5, 1]`,output:`2`},{input:`queue1 = [1, 2, 1, 2], queue2 = [1, 10, 1, 2]`,output:`7`},{input:`queue1 = [1, 1], queue2 = [1, 5]`,output:`-1`}]},keyIntuitions:[`두 큐의 입출력이 서로 연결되어 있으므로 queue1과 queue2를 이어 붙인 원형 배열에서 queue1이 차지하는 연속 구간 [i, j)의 양 끝 포인터를 옮기는 문제와 같습니다.`,`모든 원소가 양수이므로 합이 부족하면 오른쪽 포인터 j를 늘리고(큐2→큐1), 합이 넘치면 왼쪽 포인터 i를 늘리는(큐1→큐2) 그리디 선택이 유일한 최단 경로입니다.`,`한쪽 큐의 끝부분 원소 하나만 남기려면 다른 큐에 보냈다가 원래 큐의 원소들까지 모두 빼내야 하므로 최대 3N − 3번까지 이동할 수 있습니다. 따라서 반복 상한은 2N이 아니라 3N 이상으로 잡아야 합니다.`],demo:{input:[c,l],label:`queue1 = [${c.join(`, `)}], queue2 = [${l.join(`, `)}]`},workUnit:`구간 합을 비교한 횟수`,approaches:[{id:`equal-queues-two-pointer`,name:`큰 쪽에서 옮기기 (연결 배열 + 투 포인터)`,rank:`BEST`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`두 큐를 이어 붙인 배열에서 합이 큰 쪽의 앞 포인터를 전진시키며 최대 3N번 안에 판정하는 정석 풀이입니다.`,pros:[`실제 큐에서 원소를 빼고 넣는 대신 인덱스 i, j만 1씩 늘리므로 매 이동이 O(1)입니다.`,`최대 3N번만 반복하므로 N = 300,000에서도 90만 번 이하의 연산으로 빠르게 끝납니다.`],cons:[`불가능한 입력에서 무한 루프에 빠지지 않도록 반복 상한(3N 이상)을 정확히 설정해야 합니다.`],whyThisRank:`큐 두 개의 이동을 연결 배열 위의 투 포인터로 바꾸어 시간과 구현 복잡도를 모두 최소화한 풀이입니다.`,code:g,visualize:z},{id:`equal-queues-binary-search`,name:`누적합 + 끝점 이분 탐색`,rank:`ALTERNATIVE`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`연결 배열의 누적합에서 합이 절반인 구간을 이분 탐색으로 찾고 이동 횟수 공식을 적용하는 풀이로, 맞지만 O(N log N) 시간과 복잡한 분기가 필요합니다.`,pros:[`반복 상한을 몇 번으로 잡을지 고민할 필요 없이 모든 시작점 l만 확인하면 됩니다.`,`구간 합 문제를 누적합 이분 탐색으로 일관되게 풀 수 있습니다.`],cons:[`시작점마다 이분 탐색을 수행해 O(N log N) 시간이 걸립니다.`,`구간 [l, r]이 원래 큐 경계에 걸쳐 있는지, 한쪽 큐 내부에 있는지에 따라 이동 횟수 공식을 네 가지로 나누어야 해서 실수하기 쉽습니다.`],whyThisRank:`정답은 항상 일치하지만, 큰 쪽에서 작은 쪽으로 옮기는 방향이 매 순간 하나로 정해지므로 투 포인터로 시뮬레이션하는 편이 훨씬 직관적이고 빠릅니다.`,code:v,visualize:B},{id:`equal-queues-limit-2n`,name:`탐색 상한을 2N으로 잡기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`반복 상한을 2N으로 잡으면 한쪽 큐의 뒤쪽 원소 하나만 남겨야 하는 경우(최대 3N − 3회)를 찾지 못해 오답(-1)을 냅니다.`,pros:[`공식 예제 세 개는 모두 2N회 이하에서 끝나므로 예제 테스트는 통과합니다.`],cons:[`queue2의 뒤쪽 원소 하나만 queue1에 남기려면 queue2에서 N−1개를 가져오고 queue1의 원래 N개와 앞쪽 N−2개를 모두 빼내야 해서 최대 3N − 3회가 필요합니다.`,`queue1 = [1, 1, 1, 1], queue2 = [1, 1, 7, 1](N = 4)에서 정답은 9회인데 2N = 8회에서 멈춰 -1을 반환합니다.`],whyThisRank:`이 문제에서 가장 많이 틀리는 실수로, 두 큐의 원소가 한 바퀴 도는 상한을 계산할 때 양쪽 포인터가 각각 이동할 수 있는 최대 거리를 따져 3N 이상으로 잡아야 합니다.`,code:b,visualize:V}],checks:{cases:[{args:[[3,2,7,2],[4,6,5,1]],expected:2},{args:[[1,2,1,2],[1,10,1,2]],expected:7},{args:[[1,1],[1,5]],expected:-1},{args:[c,l],expected:9},{args:[[2,2],[2,2]],expected:0},{args:[[2,2,2],[2,8,2]],expected:-1}],random:e=>{let t=2+Math.floor(e()*4);return[Array.from({length:t},()=>1+Math.floor(e()*6)),Array.from({length:t},()=>1+Math.floor(e()*6))]}}};export{H as default};