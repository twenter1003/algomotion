import{o as e}from"./layout-DFaYBMY_.js";import{c as t,i as n,r,s as i}from"./shared-e6uNbDLo.js";var a=[1,2,1,3,1,4,1,2],o=a.length,s=[1,2,3,4],c=e=>`{${[...e].filter(([,e])=>e>0).map(([e,t])=>`${e}:${t}`).join(`, `)}}`,l=e=>`{${[...e].join(`, `)}}`,u={python:`from collections import Counter

def solution(topping):
    right = Counter(topping)                    # 오른쪽 조각의 토핑별 남은 개수
    left = set()                                # 왼쪽 조각에 담긴 토핑 종류
    answer = 0

    for t in topping[:-1]:                      # 토핑을 하나씩 왼쪽으로 옮기며 자르기
        left.add(t)
        right[t] -= 1
        if right[t] == 0:
            del right[t]                        # 0개가 된 토핑은 사전에서 제거
        if len(left) == len(right):
            answer += 1
    return answer`,javascript:`function solution(topping) {
  const right = new Map(); // 오른쪽 조각의 토핑별 남은 개수
  for (const t of topping) right.set(t, (right.get(t) ?? 0) + 1);
  const left = new Set(); // 왼쪽 조각에 담긴 토핑 종류
  let answer = 0;

  for (let i = 0; i < topping.length - 1; i++) { // 토핑을 하나씩 왼쪽으로 옮기며 자르기
    const t = topping[i];
    left.add(t);
    if (right.get(t) === 1) right.delete(t); // 0개가 된 토핑은 사전에서 제거
    else right.set(t, right.get(t) - 1);

    if (left.size === right.size) answer++;
  }
  return answer;
}`},d={init:n(u,[`right = Counter(topping)`,`left = set()`,`answer = 0`],[`const right = new Map()`,`for (const t of topping)`,`const left = new Set()`]),move:n(u,[`for t in topping[:-1]:`,`left.add(t)`,`right[t] -= 1`,`if right[t] == 0:`,`del right[t]`],[`for (let i = 0; i < topping.length - 1; i++)`,`left.add(t)`,`if (right.get(t) === 1) right.delete(t)`,`else right.set(t`]),check:n(u,[`if len(left) == len(right):`,`answer += 1`],[`if (left.size === right.size) answer++`]),done:n(u,[`return answer`],[`return answer`])},f={python:`def solution(topping):
    n = len(topping)
    left_kinds = [0] * n
    right_kinds = [0] * n

    seen = set()
    for i in range(n):                          # 앞에서부터 누적 종류 수 기록
        seen.add(topping[i])
        left_kinds[i] = len(seen)

    seen.clear()
    for i in range(n - 1, -1, -1):              # 뒤에서부터 누적 종류 수 기록
        seen.add(topping[i])
        right_kinds[i] = len(seen)

    return sum(1 for i in range(n - 1) if left_kinds[i] == right_kinds[i + 1])`,javascript:`function solution(topping) {
  const n = topping.length;
  const leftKinds = new Array(n);
  const rightKinds = new Array(n);

  const seen = new Set();
  for (let i = 0; i < n; i++) { // 앞에서부터 누적 종류 수 기록
    seen.add(topping[i]);
    leftKinds[i] = seen.size;
  }

  seen.clear();
  for (let i = n - 1; i >= 0; i--) { // 뒤에서부터 누적 종류 수 기록
    seen.add(topping[i]);
    rightKinds[i] = seen.size;
  }

  let answer = 0;
  for (let i = 0; i < n - 1; i++) {
    if (leftKinds[i] === rightKinds[i + 1]) answer++;
  }
  return answer;
}`},p={leftPass:n(f,[`seen = set()`,`for i in range(n):`,`left_kinds[i] = len(seen)`],[`const seen = new Set()`,`for (let i = 0; i < n; i++)`,`leftKinds[i] = seen.size`]),rightPass:n(f,[`seen.clear()`,`for i in range(n - 1, -1, -1):`,`right_kinds[i] = len(seen)`],[`seen.clear()`,`for (let i = n - 1; i >= 0; i--)`,`rightKinds[i] = seen.size`]),compare:n(f,[`return sum(1 for i in range(n - 1) if left_kinds[i] == right_kinds[i + 1])`],[`for (let i = 0; i < n - 1; i++)`,`if (leftKinds[i] === rightKinds[i + 1]) answer++`]),done:n(f,[`return sum(1 for i in range(n - 1)`],[`return answer`])},m={python:`# 주의: 자르는 위치마다 배열을 잘라 집합을 만들면 O(N²)이라 시간 초과가 납니다
def solution(topping):
    answer = 0
    for i in range(1, len(topping)):
        if len(set(topping[:i])) == len(set(topping[i:])):
            answer += 1
    return answer`,javascript:`// 주의: 자르는 위치마다 배열을 잘라 집합을 만들면 O(N²)이라 시간 초과가 납니다
function solution(topping) {
  let answer = 0;
  for (let i = 1; i < topping.length; i++) {
    const left = new Set(topping.slice(0, i));
    const right = new Set(topping.slice(i));
    if (left.size === right.size) answer++;
  }
  return answer;
}`},h={cut:n(m,[`for i in range(1, len(topping)):`,`if len(set(topping[:i])) == len(set(topping[i:])):`],[`for (let i = 1; i < topping.length; i++)`,`const left = new Set(topping.slice(0, i))`,`const right = new Set(topping.slice(i))`]),match:n(m,[`if len(set(topping[:i])) == len(set(topping[i:])):`,`answer += 1`],[`if (left.size === right.size) answer++`]),done:n(m,[`return answer`],[`return answer`])},g=(...e)=>({python:[...new Set(e.flatMap(e=>e.python))].sort((e,t)=>e-t),javascript:[...new Set(e.flatMap(e=>e.javascript))].sort((e,t)=>e-t)}),_=26,v=108,y=146,b=248,x=620,S=300,C={x:0,y:0,w:x,h:S},w=e({x:72,y:_,w:56,h:52,gap:8}),T=e({x:82,y,w:50,h:64,gap:8}),E=e({x:342,y,w:50,h:64,gap:8}),D=e({x:72,y:b,w:66,h:36,gap:8}),O=e=>`top:${e}`,k=e=>`left:${e}`,A=e=>`right:${e}`,j=e=>`cut:${e}`,M=e=>w(e).x+56+4;function N(e,t){let n=[{id:`row:top`,kind:`text`,rect:{x:0,y:_,w:66,h:52},text:`롤케이크`},{id:`left:bg`,kind:`zone`,rect:{x:72,y:v,w:244,h:114}},{id:`left:head`,kind:`text`,rect:{x:80,y:114,w:228,h:22},text:e},{id:`right:bg`,kind:`zone`,rect:{x:332,y:v,w:244,h:114}},{id:`right:head`,kind:`text`,rect:{x:340,y:114,w:228,h:22},text:t},{id:`row:cut`,kind:`text`,rect:{x:0,y:b,w:66,h:36},text:`자르기 위치`}];a.forEach((e,t)=>{n.push({id:O(t),kind:`cell`,rect:w(t),tone:`plain`,text:String(e),tag:`#${t}`})}),s.forEach((e,t)=>{n.push({id:k(t),kind:`cell`,rect:T(t),tone:`muted`,text:`-`,tag:`토핑 ${e}`},{id:A(t),kind:`cell`,rect:E(t),tone:`muted`,text:`0`,tag:`토핑 ${e}`})});for(let e=0;e<o-1;e++)n.push({id:j(e),kind:`token`,rect:D(e),tone:`plain`,text:`${e+1}|${o-1-e}`});return{width:x,height:S,items:n}}var P=e=>({type:`wait`,ms:e}),F=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function I(){let e=new t(N(`왼쪽 집합 (종류 0)`,`오른쪽 사전 (종류 0)`)),n=new Map,u=new Set,f=0,p=0,m=`-`,h=()=>({work:f,variables:{자른위치:m,left:l(u),right:c(n),"양쪽 종류":`${u.size} vs ${n.size}`,answer:p}});for(let e of a)n.set(e,(n.get(e)??0)+1);f+=o,e.step({title:`토핑 ${o}개를 모두 오른쪽 사전에 담기 (4종류)`,codeHighlights:d.init,...h()}),e.phase(`오른쪽 사전 준비`,`처음에는 롤케이크 전체를 오른쪽 조각으로 보고 토핑별 개수를 셉니다. 오른쪽은 4종류, 왼쪽은 0종류입니다.`,d.init),e.do(...i(a.map((e,t)=>F(O(t),`queued`))),...i(s.map((e,t)=>({type:`set`,id:A(t),patch:{text:`${n.get(e)}개`,tone:`queued`},pop:!0}))),{type:`set`,id:`right:head`,patch:{text:`오른쪽 사전 (종류 ${n.size})`}},P(400));for(let t=0;t<o-1;t++){let c=a[t],l=s.indexOf(c);u.add(c);let _=(n.get(c)??0)-1;_<=0?n.delete(c):n.set(c,_),f+=1,m=`${t+1}|${o-1-t}`;let v=u.size===n.size;v&&p++;let y=M(t),b=e.has(`knife`)?{type:`trace`,id:`knife`,points:[[y,18],[y,86]]}:{type:`add`,item:{id:`knife`,kind:`line`,rect:C,tone:`current`,points:[[y,18],[y,86]]}};e.step({title:`${t+1}번째 뒤 자르기: 토핑 ${c} 이동 → ${u.size}종류 vs ${n.size}종류${v?` (공평!)`:``}`,codeHighlights:g(d.move,d.check),...h()}),e.phase(`한 칸 옮기기`,`${t}번 칸의 토핑 ${r(c,`을`,`를`)} 왼쪽으로 옮깁니다. 왼쪽 집합에 ${r(c,`을`,`를`)} 넣고 오른쪽 사전에서 1을 뺍니다${_===0?` (0개가 되어 오른쪽에서 토핑 ${c} 소멸!)`:``}.`,d.move),e.do(b,F(O(t),`chosen`),{type:`arrow`,from:O(t),to:k(l),verdict:`good`,label:`왼쪽 추가`},{type:`arrow`,from:O(t),to:A(l),verdict:_===0?`bad`:`seen`,label:_===0?`0개 삭제!`:`-1`,together:!0},...i([{type:`set`,id:k(l),patch:{text:`있음`,tone:`chosen`},pop:!0},{type:`set`,id:A(l),patch:{text:`${_}개`,tone:_>0?`queued`:`muted`},pop:!0},{type:`set`,id:`left:head`,patch:{text:`왼쪽 집합 (종류 ${u.size})`}},{type:`set`,id:`right:head`,patch:{text:`오른쪽 사전 (종류 ${n.size})`}}])),e.phase(`종류 수 비교`,v?`왼쪽 ${u.size}종류 = 오른쪽 ${n.size}종류로 똑같습니다! 공평한 자르기(${p}번째)입니다.`:`왼쪽 ${u.size}종류 ≠ 오른쪽 ${n.size}종류라 공평하지 않습니다.`,d.check),e.do({type:`clearMarks`},{type:`set`,id:j(t),patch:{text:`${u.size}:${n.size}${v?` ✓`:``}`,tone:v?`good`:`visited`},pop:!0},P(200))}return e.step({title:`공평하게 자르는 방법 ${p}가지 (토핑 확인 ${f}번)`,codeHighlights:d.done,...h(),answer:p,isKeyframe:!0}),e.phase(`정답`,`칼날을 한 칸씩 옮기며 토핑 1개만 갱신해 총 ${f}번의 확인만으로 ${p}가지(4|4, 5|3)를 찾았습니다.`,d.done),e.do(...i([F(j(3),`path`),F(j(4),`path`)]),P(500)),e.finish()}function L(){let e=new t(N(`앞에서 누적 (left_kinds)`,`뒤에서 누적 (right_kinds)`)),n=Array(o).fill(0),r=Array(o).fill(0),c=0,l=0,u=()=>({work:c,variables:{left_kinds:`[${n.map(e=>e||`-`).join(`,`)}]`,right_kinds:`[${r.map(e=>e||`-`).join(`,`)}]`,answer:l}}),d=new Set;for(let e=0;e<o;e++)d.add(a[e]),n[e]=d.size;c+=o,e.step({title:`왼쪽→오른쪽 훑기: left_kinds = [${n.join(`, `)}]`,codeHighlights:p.leftPass,...u()}),e.phase(`앞에서 누적`,`0번부터 끝까지 집합에 넣으며 i번까지 자른 왼쪽 조각의 종류 수를 배열에 적어 둡니다.`,p.leftPass),e.do(...i(a.map((e,t)=>({type:`set`,id:O(t),patch:{sub:`L:${n[t]}`,tone:`chosen`},pop:!0}))),...i(s.map((e,t)=>({type:`set`,id:k(t),patch:{text:`기록됨`,tone:`chosen`}}))),P(400));let f=new Set;for(let e=o-1;e>=0;e--)f.add(a[e]),r[e]=f.size;c+=o,e.step({title:`오른쪽→왼쪽 훑기: right_kinds = [${r.join(`, `)}]`,codeHighlights:p.rightPass,...u()}),e.phase(`뒤에서 누적`,`맨 뒤에서부터 거꾸로 집합에 넣으며 i번부터 끝까지 오른쪽 조각의 종류 수를 두 번째 배열에 적어 둡니다.`,p.rightPass),e.do(...i(a.map((e,t)=>({type:`set`,id:O(t),patch:{sub:`L${n[t]}·R${r[t]}`,tone:`queued`},pop:!0}))),...i(s.map((e,t)=>({type:`set`,id:A(t),patch:{text:`기록됨`,tone:`queued`}}))),P(400));for(let t=0;t<o-1;t++){c+=1;let a=n[t],o=r[t+1],s=a===o;s&&l++,e.step({title:`${t+1}번째 뒤 비교: left_kinds[${t}](${a}) vs right_kinds[${t+1}](${o})${s?` → 같음!`:``}`,codeHighlights:p.compare,...u()}),e.phase(`배열 값 비교`,`${t}번까지의 왼쪽 종류 수(${a})와 ${t+1}번부터의 오른쪽 종류 수(${o})를 비교합니다.`,p.compare),e.do({type:`focus`,ids:[O(t),O(t+1)]},{type:`arrow`,from:O(t),to:O(t+1),verdict:s?`good`:`seen`,label:`${a} vs ${o}`},{type:`set`,id:j(t),patch:{text:`${a}:${o}${s?` ✓`:``}`,tone:s?`good`:`visited`},pop:!0}),e.do(...i([{type:`unfocus`},{type:`clearMarks`}]))}return e.step({title:`정답 ${l}가지 — 3번 훑어 총 ${c}번 확인 (정석은 15번)`,codeHighlights:p.done,...u(),answer:l,isKeyframe:!0}),e.phase(`정답`,`답은 ${l}가지로 같지만, 길이 N짜리 배열 두 개를 추가로 만들고 세 번 훑어 ${c}번(정석은 15번) 확인했습니다.`,p.done),e.do(...i([F(j(3),`path`),F(j(4),`path`)]),P(500)),e.finish()}function R(){let e=new t(N(`매번 set(topping[:i])`,`매번 set(topping[i:])`)),n=0,r=0,c=`-`,l=`-`,u=`-`,d=()=>({work:n,variables:{자른위치:c,"len(left)":l,"len(right)":u,answer:r}});for(let t=1;t<o;t++){let f=new Set(a.slice(0,t)),p=new Set(a.slice(t));n+=o,c=`${t}|${o-t}`,l=f.size,u=p.size;let m=f.size===p.size;m&&r++;let _=M(t-1),v=e.has(`knife`)?{type:`trace`,id:`knife`,points:[[_,18],[_,86]]}:{type:`add`,item:{id:`knife`,kind:`line`,rect:C,tone:`bad`,points:[[_,18],[_,86]]}};e.step({title:`${t}|${o-t} 자르기: ${o}개를 처음부터 다시 잘라 집합 생성 (누적 ${n}번)`,codeHighlights:m?g(h.cut,h.match):h.cut,...d()}),e.phase(`처음부터 다시 세기`,`앞 ${t}개와 뒤 ${o-t}개를 잘라 두 집합을 처음부터 새로 만듭니다. 토핑 ${o}개를 통째로 다시 읽습니다.`,h.cut),e.do(v,...i(a.map((e,n)=>F(O(n),n<t?`chosen`:`queued`))),...i(s.map((e,t)=>({type:`set`,id:k(t),patch:{text:f.has(e)?`있음`:`-`,tone:f.has(e)?`chosen`:`muted`}}))),...i(s.map((e,t)=>({type:`set`,id:A(t),patch:{text:p.has(e)?`있음`:`-`,tone:p.has(e)?`queued`:`muted`}}))),{type:`set`,id:j(t-1),patch:{text:`${f.size}:${p.size}${m?` ✓`:``}`,tone:m?`good`:`bad`},pop:!0},P(250))}return e.step({title:`확인 ${n}번 끝에 ${r}가지 — N=100만이면 약 1조 번으로 시간 초과`,codeHighlights:h.done,...d(),answer:r,isKeyframe:!0}),e.phase(`시간 초과`,`8개에서도 ${n}번(정석은 15번) 확인했습니다. 토핑이 100만 개면 자르는 위치마다 100만 개를 다시 세어 약 1조 번이 걸려 시간 초과입니다.`,h.done),e.do(...i(Array.from({length:o-1},(e,t)=>F(j(t),`bad`))),P(600)),e.finish()}var z={id:`roll-cake`,title:`롤케이크 자르기`,level:2,category:`hash`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/132265`,description:{summary:`일렬로 놓인 롤케이크를 한 번 잘라 철수와 동생이 왼쪽·오른쪽 조각을 나눠 갖습니다. 조각의 크기와 상관없이 두 조각에 올라간 서로 다른 토핑의 종류 수가 같을 때 공평하다고 할 때, 공평하게 자르는 방법의 수를 구합니다.`,rules:[`1 ≤ topping의 길이 ≤ 1,000,000`,`1 ≤ topping의 원소 ≤ 10,000`,`공평하게 나누는 방법이 없으면 0을 반환`],examples:[{input:`topping = [1, 2, 1, 3, 1, 4, 1, 2]`,output:`2`},{input:`topping = [1, 2, 3, 1, 4]`,output:`0`}]},keyIntuitions:[`칼날이 오른쪽으로 한 칸 움직일 때 바뀌는 것은 그 칸의 토핑 하나뿐입니다: 오른쪽 조각에서 1개 줄고 왼쪽 조각에 1개 들어갑니다.`,`왼쪽은 들어오기만 하니 집합(Set)으로 종류 수를 관리하고, 오른쪽은 빠질 때 아직 같은 토핑이 남았는지 알아야 하므로 개수 사전(Map/Counter)으로 관리합니다.`,`오른쪽 사전에서 어떤 토핑의 개수가 0이 되는 순간 그 키를 지우면, 사전의 크기(len / size)가 곧 오른쪽에 남은 토핑 종류 수입니다.`],demo:{input:[a],label:`topping = [1, 2, 1, 3, 1, 4, 1, 2]`},workUnit:`토핑을 확인한 횟수`,approaches:[{id:`roll-cake-counter`,name:`오른쪽 개수 사전 + 왼쪽 집합으로 한 칸씩 옮기기`,rank:`BEST`,timeComplexity:`O(N)`,spaceComplexity:`O(K)`,verdict:`오른쪽은 개수 사전, 왼쪽은 집합으로 두고 토핑을 하나씩 옮기며 크기만 비교하는 풀이입니다.`,pros:[`자르는 위치를 옮길 때마다 연산이 O(1)이라 토핑이 100만 개여도 금방 끝납니다.`,`길이가 N인 추가 배열 없이 토핑 종류 수(최대 10,000)만큼의 사전과 집합만 씁니다.`],cons:[`오른쪽 사전에서 개수가 0이 된 토핑 키를 반드시 삭제해야 size/len이 실제 종류 수와 맞습니다.`],whyThisRank:`"추가만 일어나는 왼쪽은 집합, 삭제가 일어나는 오른쪽은 빈도 사전"이라는 해시 자료구조의 역할을 가장 잘 보여주는 정석 풀이입니다.`,code:u,visualize:I},{id:`roll-cake-prefix-suffix`,name:`앞뒤 누적 종류 수 배열 두 개 만들기`,rank:`ALTERNATIVE`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`앞에서부터 센 종류 수 배열과 뒤에서부터 센 종류 수 배열을 미리 만들어 비교하는 풀이입니다.`,pros:[`개수를 1씩 줄이다 0이 되면 키를 삭제하는 로직 없이 집합(Set)만으로 구현할 수 있습니다.`,`앞에서 한 번, 뒤에서 한 번 훑는 대칭 구조라 이해하기 쉽습니다.`],cons:[`길이 N(최대 100만)짜리 배열 두 개를 추가로 만들어야 해서 메모리를 더 씁니다.`,`배열 전체를 세 번(앞→뒤, 뒤→앞, 비교) 훑으므로 정석보다 확인 횟수와 메모리가 모두 늘어납니다.`],whyThisRank:`시간 복잡도는 O(N)으로 통과하지만, 빈도 사전을 쓰면 누적 배열 두 개와 세 번째 순회를 아낄 수 있어 대안으로 둡니다.`,code:f,visualize:L},{id:`roll-cake-slice-set`,name:`자르는 위치마다 양쪽을 잘라 집합 만들기`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`매 위치마다 배열을 슬라이싱해 집합 크기를 비교하므로 N이 100만이면 시간 초과가 납니다.`,pros:[`문제 설명 그대로 코드로 옮겨 두세 줄이면 작성할 수 있습니다.`],cons:[`자르는 위치 N − 1곳마다 길이 N인 배열을 잘라 집합을 새로 만드므로 약 N²번 동작합니다.`,`N = 1,000,000이면 연산 횟수가 약 1조 번에 달해 시간 초과가 납니다.`],whyThisRank:`칼날이 한 칸 이동할 때 토핑 하나만 바뀐다는 성질을 쓰지 않고 매번 전체를 다시 세는 전형적인 O(N²) 시간 초과 함정입니다.`,code:m,visualize:R}],checks:{cases:[{args:[[1,2,1,3,1,4,1,2]],expected:2},{args:[[1,2,3,1,4]],expected:0},{args:[[1]],expected:0},{args:[[1,1]],expected:1},{args:[[1,2,1,2]],expected:1},{args:[[1,1,1,1]],expected:3}],random:e=>{let t=2+Math.floor(e()*8);return[Array.from({length:t},()=>1+Math.floor(e()*4))]}}};export{z as default};