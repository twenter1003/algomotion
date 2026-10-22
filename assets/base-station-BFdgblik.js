import{c as e,i as t,r as n}from"./shared-CL29HWIp.js";import{t as r}from"./paced-9NdEH4wB.js";var i=24,a=[3,10,14,18,21],o=1,s=3,c=(e,t)=>Array.from({length:Math.max(0,t-e+1)},(t,n)=>e+n),l=e=>c(Math.max(1,e-o),Math.min(i,e+o)),u=new Set(a.flatMap(l)),d=e=>e<0?`-`:e,f=(e,t)=>Number((e/t).toFixed(2)),p={python:`def solution(n, stations, w):
    answer = 0
    span = 2 * w + 1                       # 기지국 하나가 덮는 아파트 수
    start = 1                              # 아직 확인하지 않은 가장 왼쪽 아파트
    for s in stations:
        gap = s - w - start                # 이 기지국 범위(s - w ~ s + w) 앞의 빈 아파트 수
        if gap > 0:
            answer += (gap + span - 1) // span   # 빈 구간을 span칸씩 덮는 데 필요한 기지국 수(올림)
        start = s + w + 1                  # 이 기지국 범위 다음부터 다시 센다
    tail = n - start + 1                   # 마지막 기지국 뒤에 남은 빈 아파트 수
    if tail > 0:
        answer += (tail + span - 1) // span
    return answer`,javascript:`function solution(n, stations, w) {
  let answer = 0;
  const span = 2 * w + 1; // 기지국 하나가 덮는 아파트 수
  let start = 1; // 아직 확인하지 않은 가장 왼쪽 아파트
  for (const s of stations) {
    const gap = s - w - start; // 이 기지국 범위(s - w ~ s + w) 앞의 빈 아파트 수
    if (gap > 0) {
      answer += Math.ceil(gap / span); // 빈 구간을 span칸씩 덮는 데 필요한 기지국 수(올림)
    }
    start = s + w + 1; // 이 기지국 범위 다음부터 다시 센다
  }
  const tail = n - start + 1; // 마지막 기지국 뒤에 남은 빈 아파트 수
  if (tail > 0) {
    answer += Math.ceil(tail / span);
  }
  return answer;
}`},m={init:t(p,[`answer = 0`,`span = 2 * w + 1`,`start = 1`],[`let answer = 0`,`const span = 2 * w + 1`,`let start = 1`]),look:t(p,[`for s in stations`,`gap = s - w - start`,`if gap > 0`],[`for (const s of stations)`,`const gap = s - w - start`,`if (gap > 0)`]),place:t(p,[`answer += (gap + span - 1) // span`],[`answer += Math.ceil(gap / span)`]),skip:t(p,[`start = s + w + 1`],[`start = s + w + 1`]),tail:t(p,[`tail = n - start + 1`,`if tail > 0`],[`const tail = n - start + 1`,`if (tail > 0)`]),tailPlace:t(p,[`answer += (tail + span - 1) // span`],[`answer += Math.ceil(tail / span)`]),done:t(p,[`return answer`],[`return answer`])},h={python:`def solution(n, stations, w):
    answer = 0
    span = 2 * w + 1                       # 기지국 하나가 덮는 아파트 수
    pos = 1                                # 아직 덮이지 않은 가장 왼쪽 아파트
    i = 0                                  # 다음에 만날 기존 기지국
    while pos <= n:
        if i < len(stations) and stations[i] - w <= pos:   # pos가 기존 기지국 범위에 닿는다
            pos = stations[i] + w + 1                      # 그 범위 끝까지 건너뛴다
            i += 1
        else:                                              # 덮이지 않은 아파트 → 새 기지국을 놓는다
            answer += 1
            pos += span                                    # 새 기지국이 span칸을 덮는다
    return answer`,javascript:`function solution(n, stations, w) {
  let answer = 0;
  const span = 2 * w + 1; // 기지국 하나가 덮는 아파트 수
  let pos = 1; // 아직 덮이지 않은 가장 왼쪽 아파트
  let i = 0; // 다음에 만날 기존 기지국
  while (pos <= n) {
    if (i < stations.length && stations[i] - w <= pos) { // pos가 기존 기지국 범위에 닿는다
      pos = stations[i] + w + 1; // 그 범위 끝까지 건너뛴다
      i++;
    } else { // 덮이지 않은 아파트 → 새 기지국을 놓는다
      answer++;
      pos += span; // 새 기지국이 span칸을 덮는다
    }
  }
  return answer;
}`},g={init:t(h,[`answer = 0`,`span = 2 * w + 1`,`pos = 1`,`i = 0`],[`let answer = 0`,`const span = 2 * w + 1`,`let pos = 1`,`let i = 0`]),look:t(h,[`while pos <= n`,`if i < len(stations) and stations[i] - w <= pos`],[`while (pos <= n)`,`if (i < stations.length && stations[i] - w <= pos)`]),jump:t(h,[`pos = stations[i] + w + 1`,`i += 1`],[`pos = stations[i] + w + 1`,`i++`]),place:t(h,[`else:`,`answer += 1`,`pos += span`],[`} else {`,`answer++`,`pos += span`]),done:t(h,[`while pos <= n`,`return answer`],[`while (pos <= n)`,`return answer`])},_={python:`def solution(n, stations, w):
    covered = [False] * (n + 2)            # 아파트마다 칸 하나 → N이 2억이면 2억 칸
    for s in stations:
        for k in range(max(1, s - w), min(n, s + w) + 1):
            covered[k] = True              # 기존 기지국이 덮는 아파트를 하나씩 표시
    answer = 0
    span = 2 * w + 1                       # 기지국 하나가 덮는 아파트 수
    i = 1
    while i <= n:                          # 아파트를 하나씩 확인 → 최대 2억 번
        if covered[i]:
            i += 1                         # 이미 덮여 있다
        else:
            answer += 1                    # i를 덮도록 i + w에 새 기지국을 놓는다
            i += span
    return answer`,javascript:`function solution(n, stations, w) {
  const covered = new Array(n + 2).fill(false); // 아파트마다 칸 하나 → N이 2억이면 2억 칸
  for (const s of stations) {
    for (let k = Math.max(1, s - w); k <= Math.min(n, s + w); k++) {
      covered[k] = true; // 기존 기지국이 덮는 아파트를 하나씩 표시
    }
  }
  let answer = 0;
  const span = 2 * w + 1; // 기지국 하나가 덮는 아파트 수
  let i = 1;
  while (i <= n) { // 아파트를 하나씩 확인 → 최대 2억 번
    if (covered[i]) {
      i++; // 이미 덮여 있다
    } else {
      answer++; // i를 덮도록 i + w에 새 기지국을 놓는다
      i += span;
    }
  }
  return answer;
}`},v={alloc:t(_,[`covered = [False] * (n + 2)`],[`const covered = new Array(n + 2).fill(false)`]),mark:t(_,[`for s in stations`,`for k in range(max(1, s - w)`,`covered[k] = True`],[`for (const s of stations)`,`for (let k = Math.max(1, s - w)`,`covered[k] = true`]),init:t(_,[`answer = 0`,`span = 2 * w + 1`,`i = 1`],[`let answer = 0`,`const span = 2 * w + 1`,`let i = 1`]),look:t(_,[`while i <= n`,`if covered[i]`],[`while (i <= n)`,`if (covered[i])`]),skip:t(_,[`i += 1`],[`i++`]),place:t(_,[`else:`,`answer += 1`,`i += span`],[`} else {`,`answer++`,`i += span`]),done:t(_,[`while i <= n`,`return answer`],[`while (i <= n)`,`return answer`])},y=20,b=22,x=70,S=e=>x+(e-1)*b,C=e=>S(e)+y/2,w=0,T=28,E=84,D=36,O=126,k=148,A=184,j=638,M=218,N={x,y:A,w:150,h:28},P={x:230,y:A,w:150,h:28},F=e=>`cell:${e}`,I=e=>({type:`wait`,ms:e}),L=(...t)=>e([{type:`unfocus`},{type:`clearMarks`},...t]),R=(e,t)=>e.map(e=>({type:`set`,id:F(e),patch:{tone:t}})),z=e=>({type:`set`,id:`tok:count`,patch:{text:`새 기지국 ${e}개`,tone:`chosen`},pop:!0}),B=e=>({x:C(Math.min(e,25))-24,y:T,w:48,h:22}),V=(e,t,n)=>e.has(`ptr`)?{type:`set`,id:`ptr`,patch:{rect:B(n)}}:{type:`add`,item:{id:`ptr`,kind:`token`,rect:B(n),tone:`chosen`,text:t}},H=(e,t)=>({id:`new:${e}`,kind:`token`,rect:{x:C(t)-15,y:k,w:30,h:24},tone:`chosen`,text:String(t)}),U=e=>l(e).filter(e=>!u.has(e)),W=(t,n,r)=>e([{type:`add`,item:H(t,n),from:F(n)},...R(U(n),`chosen`),z(r)]);function G(){let e=a.map((e,t)=>{let[n,r]=[Math.max(1,e-o),Math.min(i,e+o)];return{id:`zone:${t}`,kind:`zone`,rect:{x:S(n)-3,y:80,w:(r-n+1)*b-2+6,h:44}}});e.push({id:`lab:ex`,kind:`text`,rect:{x:0,y:w,w:64,h:22},text:`기존`},{id:`lab:cell`,kind:`text`,rect:{x:0,y:E,w:64,h:D},text:`아파트`},{id:`lab:new`,kind:`text`,rect:{x:0,y:k,w:64,h:24},text:`새로 설치`},{id:`tok:count`,kind:`token`,rect:N,tone:`plain`,text:`새 기지국 0개`}),a.forEach((t,n)=>e.push({id:`ex:${n}`,kind:`token`,rect:{x:C(t)-15,y:w,w:30,h:22},tone:`muted`,text:String(t)}));for(let t=1;t<=i;t++)e.push({id:F(t),kind:`cell`,rect:{x:S(t),y:E,w:y,h:D},tone:`plain`},{id:`tick:${t}`,kind:`text`,rect:{x:S(t)-1,y:O,w:b,h:16},tone:`muted`,text:String(t)});return{width:j,height:M,items:e}}var K=e=>Array.from({length:20},(e,t)=>`new:${t}`).filter(t=>e.has(t));function q(){let t=new r(G()),[u,p,h,g]=[1,0,0,0],[_,v,y]=[-1,-1,-1],b=()=>({work:h,variables:{s:d(_),gap:_<0?`-`:v,start:u,tail:d(y),answer:p,span:s}});t.step({title:`start = 1, answer = 0`,codeHighlights:m.init,...b()}),t.phase(`시작`,`기지국 하나는 양옆 ${o}칸씩 모두 ${s}칸(span)을 덮습니다. 1번 아파트에서 시작하고, 새 기지국은 0개입니다.`),t.do(...e([V(t,`start`,1),z(0)]));let x=(e,t)=>Array.from({length:Math.ceil((t-e+1)/s)},(n,r)=>Math.min(e+r*s+o,t));a.forEach(r=>{let[i,a,d]=[u,r-o,r+o],y=a-i,S=y>0?c(i,a-1):[],C=y>0?x(i,a-1):[];[_,v]=[r,y],h++,u=d+1,p+=C.length,t.step({title:y>0?`기지국 ${r}: 앞 빈 구간 ${i}~${a-1}번 → ${C.length}개`:`기지국 ${r}: 앞에 빈 구간 없음`,codeHighlights:C.length?m.place:m.skip,...b()}),t.phase(`빈 구간 찾기`,y>0?`기지국 ${r}번은 ${a}~${d}번을 덮습니다. 그 앞의 빈 구간은 ${i}~${a-1}번, ${y}칸입니다.`:`기지국 ${r}번은 ${a}~${d}번을 덮습니다. 바로 앞까지 이어져 있어 빈 구간이 없습니다.`,m.look),y>0?(t.do(...e([{type:`focus`,ids:S.map(F)},...R(S,`current`)])),t.do({type:`arrow`,from:`ptr`,to:F(a-1),verdict:`new`,label:`빈 구간 ${y}칸`},I(400))):t.do({type:`focus`,ids:l(r).map(F)},I(500)),C.length&&(t.phase(`기지국 놓기`,`${y} ÷ ${s} = ${n(f(y,s),`이라`,`라`)} 올림해서 기지국 ${C.length}개를 놓습니다.`,m.place),t.do(...L()),C.forEach((e,n)=>{t.do(...W(g,e,p-C.length+n+1)),g++})),t.phase(`건너뛰기`,`기지국 ${r}번의 범위 ${a}~${d}번은 이미 덮여 있으니 건너뜁니다. start = ${u}입니다.`,m.skip),t.do(...L(...R(l(r),`visited`),V(t,`start`,u)))});let S=i-u+1,C=S>0?x(u,i):[];if(y=S,h++,p+=C.length,t.step({title:S>0?`마지막 빈 구간 ${u}~${i}번 → ${C.length}개`:`마지막 기지국 뒤에 빈 구간 없음`,codeHighlights:C.length?m.tailPlace:m.tail,...b()}),t.phase(`빈 구간 찾기`,S>0?`마지막 기지국 뒤에 ${u}~${i}번, ${S}칸이 비어 있습니다.`:`마지막 기지국 뒤에는 빈 아파트가 없습니다.`,m.tail),S>0){let r=c(u,i);t.do(...e([{type:`focus`,ids:r.map(F)},...R(r,`current`)])),t.do({type:`arrow`,from:`ptr`,to:F(i),verdict:`new`,label:`빈 구간 ${S}칸`},I(400)),t.phase(`기지국 놓기`,`${S} ÷ ${s} = ${n(f(S,s),`이라`,`라`)} 올림해서 기지국 ${C.length}개를 놓습니다.`,m.tailPlace),t.do(...L()),C.forEach((e,n)=>{t.do(...W(g,e,p-C.length+n+1)),g++})}else t.do(I(500));return t.step({title:`새 기지국 ${p}개`,codeHighlights:m.done,...b(),answer:p,isKeyframe:!0}),t.phase(`정답`,`빈 구간마다 올림 나눗셈으로 센 기지국을 더하면 ${p}개입니다. 반복은 ${h}번뿐이라, N이 2억이어도 기지국 수만큼만 돕니다.`),t.do(...e([...K(t).map(e=>({type:`set`,id:e,patch:{tone:`path`}})),{type:`set`,id:`tok:count`,patch:{tone:`path`},pop:!0}])),t.finish()}function J(){let t=new r(G()),[l,u,d,f,p]=[1,0,0,0,0],m=()=>({work:f,variables:{pos:l,i:u,answer:d,span:s}});for(t.step({title:`pos = 1, i = 0, answer = 0`,codeHighlights:g.init,...m()}),t.phase(`시작`,`1번 아파트부터 덮이지 않은 곳을 찾아 나갑니다. 다음에 만날 기존 기지국은 i = 0번째이고, 새 기지국은 0개입니다.`),t.do(...e([V(t,`pos`,1),z(0)]));l<=i;){let n=l,r=u<a.length?a[u]:void 0,h=r!==void 0&&r-o<=n;if(f++,h?(l=r+o+1,u++):(d++,l+=s),t.step({title:h?`pos ${n}: 기존 기지국 ${r}의 범위 → pos ${l}`:`pos ${n}: 덮이지 않음 → 새 기지국 → pos ${l}`,codeHighlights:h?g.jump:g.place,...m()}),r===void 0?(t.phase(`확인하기`,`더 만날 기존 기지국이 없습니다. ${n}번 아파트는 덮이지 않았습니다.`,g.look),t.do(...e([{type:`focus`,ids:[F(n)]},...R([n],`current`)]),I(500))):(t.phase(`확인하기`,h?`다음 기존 기지국 ${r}번은 ${r-o}~${r+o}번을 덮습니다. ${n}번 아파트는 그 범위 안이라 이미 덮여 있습니다.`:`다음 기존 기지국 ${r}번의 범위는 ${r-o}번부터라, ${n}번 아파트는 덮여 있지 않습니다.`,g.look),t.do(...e([{type:`focus`,ids:[F(n),F(r-o)]},...R([n],`current`)])),t.do({type:`arrow`,from:`ptr`,to:F(r-o),verdict:h?`good`:`new`,label:h?`${r-o} ≤ ${n} 덮임`:`${r-o} > ${n} 비어 있음`},I(450))),h){let e=c(n,Math.min(i,r+o));t.phase(`건너뛰기`,`그 범위 끝까지 건너뜁니다. pos = ${l}, 다음 기존 기지국은 ${u}번째입니다.`,g.jump),t.do(...L(...R(e,`visited`),V(t,`pos`,l)))}else{let e=Math.min(n+o,i);t.phase(`기지국 놓기`,`${n}번을 덮도록 ${n+o<=i?`${n+o}번`:`끝 아파트 ${i}번`}에 새 기지국을 놓습니다. ${s}칸을 건너뛰어 pos = ${l}입니다.`,g.place),t.do(...L()),t.do(...W(p,e,d),{type:`set`,id:`ptr`,patch:{rect:B(l)},together:!0}),p++}}return t.step({title:`새 기지국 ${d}개`,codeHighlights:g.done,...m(),answer:d,isKeyframe:!0}),t.phase(`정답`,`pos = ${n(l,`이`,`가`)} N = ${n(i,`을`,`를`)} 넘어 끝났습니다. 새 기지국은 ${d}개입니다. 답은 정석과 같지만 ${f}번 반복했고, 새 기지국마다 한 번씩 더 돕니다.`),t.do(...e([...K(t).map(e=>({type:`set`,id:e,patch:{tone:`path`}})),{type:`set`,id:`tok:count`,patch:{tone:`path`},pop:!0}])),t.finish()}var Y=[];{let e=1;for(;e<=i;)if(u.has(e)){let t=Y.at(-1);t?.covered&&t.at+t.len===e?t.len++:Y.push({at:e,len:1,covered:!0}),e++}else Y.push({at:e,len:1,covered:!1}),e+=s}var X=a.length+1;function Z(){let t=new r(G()),[n,c,u,d]=[0,0,0,0],f=()=>({work:u,variables:{i:n||`-`,answer:c,span:s}});return t.step({title:`covered 배열 ${i}칸 만들기`,codeHighlights:v.alloc,...f()}),t.phase(`배열 만들기`,`아파트마다 칸 하나씩, 아파트 수 ${i}만큼 covered 배열을 만듭니다. N이 2억이면 2억 칸입니다.`),t.do({type:`add`,item:{id:`tok:mem`,kind:`token`,rect:P,tone:`muted`,text:`covered ${i}칸`}}),a.forEach(n=>{let r=l(n);u+=r.length,t.step({title:`기지국 ${n}의 범위 ${r[0]}~${r.at(-1)}번 표시`,codeHighlights:v.mark,...f()}),t.phase(`표시하기`,`기지국 ${n}번이 덮는 ${r[0]}~${r.at(-1)}번, ${r.length}칸을 하나씩 True로 표시합니다.`,v.mark),t.do(...e([{type:`focus`,ids:r.map(F)},...R(r,`visited`)])),t.do(...L(),I(150))}),n=1,t.step({title:`i = 1부터 하나씩 확인`,codeHighlights:v.init,...f()}),t.phase(`시작`,`이제 1번 아파트부터 covered 값을 하나씩 확인하며, 덮이지 않은 곳마다 새 기지국을 놓습니다.`),t.do(...e([V(t,`i`,1),z(0)])),Y.forEach(r=>{let a=r.at;u+=r.len,r.covered?n=a+r.len:(c++,n=a+s);let l=Math.min(a+o,i),p=a+r.len-1;r.covered&&r.len>1?(t.step({title:`i = ${a}~${p} 빨리 감기: 모두 덮여 있음`,codeHighlights:v.skip,...f()}),t.phase(`빨리 감기`,`covered[${a}]부터 covered[${p}]까지 ${r.len}칸이 모두 True라, 하나씩 확인하며 i를 ${r.len}번 올립니다. i = ${n}입니다.`,v.skip),t.do(V(t,`i`,n))):(t.step({title:r.covered?`i = ${a}: 덮여 있음 → i = ${n}`:`i = ${a}: 덮이지 않음 → 새 기지국 → i = ${n}`,codeHighlights:r.covered?v.skip:v.place,...f()}),t.phase(`확인하기`,`covered[${a}] = ${r.covered?`True라서 이미 덮여 있습니다.`:`False라서 덮여 있지 않습니다.`}`,v.look),t.do(...e([{type:`focus`,ids:[F(a)]},...R([a],`current`)])),t.do({type:`arrow`,from:`ptr`,to:F(a),verdict:r.covered?`seen`:`new`,label:r.covered?`덮임`:`비어 있음`},I(450)),r.covered?(t.phase(`건너뛰기`,`다음 아파트로 넘어갑니다. i = ${n}입니다.`,v.skip),t.do(...L(...R([a],`visited`),V(t,`i`,n)))):(t.phase(`기지국 놓기`,`${a}번을 덮도록 ${a+o<=i?`${a+o}번`:`끝 아파트 ${i}번`}에 새 기지국을 놓고 ${s}칸을 건너뜁니다. i = ${n}입니다.`,v.place),t.do(...L()),t.do(...W(d,l,c),{type:`set`,id:`ptr`,patch:{rect:B(n)},together:!0}),d++))}),t.step({title:`새 기지국 ${c}개, 반복 ${u}번`,codeHighlights:v.done,...f(),answer:c,isKeyframe:!0}),t.phase(`정답`,`답은 ${c}개로 맞지만 칸 ${i}개를 만들고 ${u}번 반복했습니다. N이 2억이면 2억 칸에 2억 번 가까운 반복이라 시간 초과입니다. 정석은 ${X}번이면 됩니다.`),t.do(...e([...K(t).map(e=>({type:`set`,id:e,patch:{tone:`path`}})),{type:`set`,id:`tok:count`,patch:{tone:`path`},pop:!0}])),t.finish()}var Q={id:`base-station`,title:`기지국 설치`,level:3,category:`greedy`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/12979`,description:{summary:`N개의 아파트가 일렬로 서 있고, 일부 아파트에는 기지국이 있습니다. 기지국은 자기 자리에서 양옆 W칸까지, 모두 2W + 1칸의 아파트에 전파를 보냅니다. 모든 아파트에 전파가 닿으려면 새 기지국을 최소 몇 개 더 세워야 하는지 구합니다.`,rules:[`N은 2억 이하의 자연수`,`stations는 길이 1만 이하이고, N 이하의 자연수가 오름차순으로 들어 있음`,`W는 1만 이하의 자연수`,`기지국 하나는 자기 자리와 양옆 W칸씩, 모두 2W + 1칸의 아파트를 덮음`],examples:[{input:`N = 11, stations = [4, 11], W = 1`,output:`3`},{input:`N = 16, stations = [9], W = 2`,output:`3`}]},keyIntuitions:[`기존 기지국이 덮는 구간을 빼면 남는 빈 구간들은 서로 영향을 주지 않습니다. 구간마다 따로 필요한 기지국 수를 세어 더하면 됩니다.`,`새 기지국 하나는 2W + 1칸을 덮으므로, 길이가 g인 빈 구간에는 ⌈g ÷ (2W + 1)⌉개가 듭니다. 아파트를 하나씩 보지 않고 구간 길이만 계산합니다.`,`stations가 정렬되어 있으니 왼쪽부터 기지국마다 앞의 빈 구간을 계산하고, 마지막 기지국 뒤의 빈 구간도 빼먹지 않습니다. N이 2억이라 아파트를 하나씩 보는 풀이는 시간 초과입니다.`],demo:{input:[i,a,o],label:`N = 24, stations = [3, 10, 14, 18, 21], W = 1`},workUnit:`반복한 횟수`,approaches:[{id:`base-station-gap-split`,name:`빈 구간 나누기 (올림 나눗셈)`,rank:`BEST`,timeComplexity:`O(K) (K = 기지국 수)`,spaceComplexity:`O(1)`,verdict:`기존 기지국 사이의 빈 구간 길이만 구해, 구간마다 ⌈길이 ÷ (2W + 1)⌉개씩 더하는 풀이입니다.`,pros:[`기지국 수 K(최대 1만)만큼만 반복하므로 N이 2억이어도 순식간에 끝납니다.`,`추가 메모리가 필요 없습니다.`,`구간끼리 서로 독립이라 계산이 단순합니다.`],cons:[`마지막 기지국 뒤의 빈 구간을 빼먹기 쉽습니다.`,`올림을 정수로 쓰려면 (gap + span − 1) // span처럼 써야 합니다.`,`기존 기지국 범위가 서로 겹치면 gap이 음수가 되므로 gap > 0일 때만 더합니다.`],whyThisRank:`빈 구간은 서로 영향을 주지 않고, 구간 하나에는 길이를 기지국 범위(2W + 1)로 나눈 값의 올림만큼 놓으면 됩니다. 아파트를 하나씩 볼 필요가 없어서 입력 크기 N이 아니라 기지국 수만큼만 일합니다.`,code:p,visualize:q},{id:`base-station-jump`,name:`왼쪽부터 건너뛰며 기지국 놓기`,rank:`ALTERNATIVE`,timeComplexity:`O(K + 새 기지국 수)`,spaceComplexity:`O(1)`,verdict:`왼쪽부터 덮이지 않은 첫 아파트에 기지국을 놓고 2W + 1칸을 건너뛰는, 맞지만 새 기지국 수만큼 반복하는 풀이입니다.`,pros:[`생각한 순서대로 코드가 되어 직관적입니다.`,`기존 기지국 범위는 한 번에 건너뛰므로 아파트를 하나씩 보는 풀이보다 훨씬 빠릅니다.`],cons:[`새 기지국 수만큼 반복합니다. 기지국이 하나도 없고 W = 1이면 약 6,700만 번이라 Python에서는 느립니다.`,`pos와 i 두 값을 함께 움직이므로 범위의 끝과 마지막 기지국 경계를 한 칸씩 틀리기 쉽습니다.`],whyThisRank:`왼쪽부터 놓는다는 생각은 정석과 같지만, 빈 구간 하나를 나눗셈 한 번이 아니라 기지국 하나씩 반복해서 처리합니다. 빈 구간이 길수록 정석과의 차이가 벌어집니다.`,code:h,visualize:J},{id:`base-station-array`,name:`아파트마다 칸을 만들어 하나씩 확인`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`covered 배열을 만들어 아파트를 하나씩 확인하는 풀이로, 답은 맞지만 N이 2억이면 시간과 메모리가 모자랍니다.`,pros:[`생각하기 가장 쉽고, 작은 입력에서는 답이 맞습니다.`],cons:[`N이 최대 2억이라 covered 배열만 2억 칸이고, 확인도 2억 번 가까이 합니다.`,`기지국이 몇 개인지와 상관없이 늘 아파트 수만큼 일합니다.`],whyThisRank:`이 문제에서 큰 것은 기지국 수(최대 1만)가 아니라 아파트 수 N(최대 2억)입니다. 아파트를 하나씩 보는 순간 일의 양이 N에 비례하므로, 구간 길이만 계산하는 풀이가 필요합니다.`,code:_,visualize:Z}],checks:{cases:[{args:[11,[4,11],1],expected:3},{args:[16,[9],2],expected:3},{args:[1,[1],1],expected:0},{args:[10,[1],1],expected:3},{args:[10,[10],2],expected:2},{args:[5,[3],5],expected:0},{args:[9,[2,5,8],1],expected:0},{args:[24,[5,6],2],expected:5},{args:[i,a,o],expected:6}],random:e=>{let t=1+Math.floor(e()*25),n=1+Math.floor(e()*3),r=Array.from({length:t},(e,t)=>t+1),i=[];for(let n=1+Math.floor(e()*Math.min(5,t));n>0;n--)i.push(r.splice(Math.floor(e()*r.length),1)[0]);return[t,i.sort((e,t)=>e-t),n]}}};export{Q as default};