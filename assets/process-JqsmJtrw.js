import{o as e}from"./layout-DFaYBMY_.js";import{a as t,c as n,i as r,l as i,r as a}from"./shared-CL29HWIp.js";import{t as o}from"./lane-BzDhdR3X.js";var s=[2,1,2,3,2],c=2,l=s.length,u=[`A`,`B`,`C`,`D`,`E`],d=[...s].sort((e,t)=>t-e),f=e=>`${u[e]}${e===c?`★`:``}(${s[e]})`,p=e=>`[${e.join(`, `)}]`,m={python:`from collections import deque

def solution(priorities, location):
    queue = deque(enumerate(priorities))      # (처음 위치, 중요도)
    order = sorted(priorities, reverse=True)  # 실행될 중요도 순서
    executed = 0

    while queue:
        idx, p = queue.popleft()
        if p < order[executed]:               # 더 높은 중요도가 남아 있으면
            queue.append((idx, p))            # 큐 맨 뒤로 보냄
        else:
            executed += 1                     # 지금 가장 높은 중요도라 실행
            if idx == location:
                return executed
    return executed`,javascript:`function solution(priorities, location) {
  const queue = priorities.map((p, idx) => [idx, p]); // [처음 위치, 중요도]
  const order = [...priorities].sort((a, b) => b - a); // 실행될 중요도 순서
  let head = 0; // shift() 대신 머리 인덱스로 큐를 꺼냅니다
  let executed = 0;

  while (head < queue.length) {
    const [idx, p] = queue[head++];
    if (p < order[executed]) { // 더 높은 중요도가 남아 있으면
      queue.push([idx, p]); // 큐 맨 뒤로 보냄
    } else {
      executed++; // 지금 가장 높은 중요도라 실행
      if (idx === location) return executed;
    }
  }
  return executed;
}`},h={start:r(m,[`queue = deque(`,`order = sorted(`,`executed = 0`],[`const queue =`,`const order =`,`let executed = 0`]),pop:r(m,[`while queue:`,`idx, p = queue.popleft()`,`if p < order[executed]:`],[`while (head < queue.length)`,`const [idx, p] = queue[head++]`,`if (p < order[executed])`]),requeue:r(m,[`if p < order[executed]:`,`queue.append((idx, p))`],[`if (p < order[executed])`,`queue.push([idx, p])`]),exec:r(m,[`else:`,`executed += 1`,`if idx == location:`],[`} else {`,`executed++;`,`if (idx === location)`]),done:r(m,[`executed += 1`,`if idx == location:`,`return executed`],[`executed++;`,`if (idx === location) return executed`])},g={python:`from collections import deque

def solution(priorities, location):
    queue = deque(enumerate(priorities))
    executed = 0

    while queue:
        idx, p = queue.popleft()
        # 남은 큐를 훑어 더 높은 중요도가 있는지 매번 확인
        if any(p < other for _, other in queue):
            queue.append((idx, p))
        else:
            executed += 1
            if idx == location:
                return executed
    return executed`,javascript:`function solution(priorities, location) {
  const queue = priorities.map((p, idx) => [idx, p]);
  let head = 0;
  let executed = 0;

  while (head < queue.length) {
    const [idx, p] = queue[head++];
    // 남은 큐를 훑어 더 높은 중요도가 있는지 매번 확인
    let hasHigher = false;
    for (let i = head; i < queue.length; i++) {
      if (p < queue[i][1]) {
        hasHigher = true;
        break;
      }
    }
    if (hasHigher) {
      queue.push([idx, p]);
    } else {
      executed++;
      if (idx === location) return executed;
    }
  }
  return executed;
}`},_={start:r(g,[`queue = deque(`,`executed = 0`],[`const queue =`,`let executed = 0`]),pop:r(g,[`while queue:`,`idx, p = queue.popleft()`],[`while (head < queue.length)`,`const [idx, p] = queue[head++]`]),scan:r(g,[`if any(p < other for _, other in queue):`],[`for (let i = head; i < queue.length; i++)`,`if (p < queue[i][1])`]),requeue:r(g,[`queue.append((idx, p))`],[`if (hasHigher)`,`queue.push([idx, p])`]),exec:r(g,[`else:`,`executed += 1`,`if idx == location:`],[`} else {`,`executed++;`,`if (idx === location)`]),done:r(g,[`executed += 1`,`if idx == location:`,`return executed`],[`executed++;`,`if (idx === location) return executed`])},v={python:`def solution(priorities, location):
    # 함정: 큐 회전을 무시하고 중요도 내림차순으로만 줄 세움
    ranked = sorted(enumerate(priorities), key=lambda x: -x[1])

    for turn, (idx, _) in enumerate(ranked, start=1):
        if idx == location:
            return turn
    return len(priorities)`,javascript:`function solution(priorities, location) {
  // 함정: 큐 회전을 무시하고 중요도 내림차순으로만 줄 세움
  const ranked = priorities
    .map((p, idx) => [idx, p])
    .sort((a, b) => b[1] - a[1]);

  for (let i = 0; i < ranked.length; i++) {
    if (ranked[i][0] === location) return i + 1;
  }
  return priorities.length;
}`},y={sort:r(v,[`ranked = sorted(`],[`const ranked = priorities`,`.sort((a, b) => b[1] - a[1])`]),check:r(v,[`for turn, (idx, _) in enumerate(ranked, start=1):`,`if idx == location:`],[`for (let i = 0; i < ranked.length; i++)`,`if (ranked[i][0] === location)`]),done:r(v,[`if idx == location:`,`return turn`],[`if (ranked[i][0] === location) return i + 1`])},b=80,x=62,S=8,C=e({x:b,y:0,w:x,h:48,gap:S}),w=86,T=160,E=234,D=l*70-S+8,O=b+D+150,k=290,A={id:`queue`,x:b,y:90,slotW:x,slotH:44,gap:S,max:l},j={id:`done`,x:b,y:238,slotW:x,slotH:44,gap:S,max:l},M={x:b,y:T,w:x,h:48},N=e=>`top:${e}`,P=e=>`q:${e}`,F=e=>`done:${e}`,I=(e,t,n,r)=>({id:e,kind:`text`,rect:{x:0,y:n,w:72,h:r},text:t});function L(e){let t=[I(`row:top`,e,0,48),I(`row:queue`,`대기 큐`,w,52),{id:`queue:bg`,kind:`zone`,rect:{x:76,y:w,w:D,h:52}},I(`row:cur`,`꺼낸 것`,T,48),{id:`cur:bg`,kind:`zone`,rect:{x:76,y:158,w:70,h:52}},{id:`cur`,kind:`cell`,rect:M,tone:`plain`,text:`-`},I(`row:done`,`실행 순서`,E,52),{id:`done:bg`,kind:`zone`,rect:{x:76,y:E,w:D,h:52}}];for(let e=0;e<l;e++)t.push({id:N(e),kind:`cell`,rect:C(e),tone:`plain`,text:``,tag:String(e+1)});return{width:O,height:k,items:t}}var R=e=>({type:`wait`,ms:e}),z=()=>n([{type:`unfocus`},{type:`clearMarks`}]),B=(e,t,n,r)=>({type:`set`,id:e,patch:{tone:t,...n===void 0?{}:{text:n},...r===void 0?{}:{sub:r}}});function V(){let e=new i(L(`기준 순서`)),t=new o(e,A),r=new o(e,j),u=[0,1,2,3,4],m=0,g=0,_=`-`,v=()=>({work:g,variables:{queue:p(u.map(f)),"order[executed]":d[m]??`-`,cur:_,executed:m}});e.step({title:`큐와 중요도 내림차순 기준 ${p(d)} 준비`,codeHighlights:h.start,...v()}),e.phase(`준비`,`중요도를 내림차순으로 정렬한 order = ${p(d)}를 준비하고, 대기 큐에 A~E를 차례대로 넣습니다. 목표는 ${f(c)}입니다.`);for(let e=0;e<l;e++)t.push({id:P(e),text:f(e),tone:e===c?`chosen`:`queued`});for(e.do(...n(d.map((e,t)=>({type:`set`,id:N(t),patch:{text:String(e),tone:t===0?`current`:`plain`},pop:!0}))),R(600));u.length>0;){let i=u.shift(),o=s[i],p=d[m],y=f(i);_=y,g++;let b=o<p;b?u.push(i):m++;let x=!b&&i===c;if(e.step({title:b?`${y} 꺼내기: ${o} < ${p} → 큐 맨 뒤로`:`${y} 꺼내기: ${o} = ${p} → ${m}번째 실행${x?` (정답 ${m})`:``}`,codeHighlights:x?h.done:b?h.requeue:h.exec,...v(),...x?{answer:m,isKeyframe:!0}:{}}),e.phase(`꺼내기`,`대기 큐 맨 앞에서 ${a(y,`을`,`를`)} 꺼내 기준 중요도 ${p}과 비교합니다.`,h.pop),t.shift(`cur`),e.do(B(`cur`,i===c?`chosen`:`current`,y),{type:`focus`,ids:[`cur`,N(b?m:m-1)]},{type:`arrow`,from:`cur`,to:N(b?m:m-1),verdict:b?`bad`:`good`,label:b?`${o} < ${p}`:`${o} = ${p}`},R(300)),b)e.phase(`뒤로 보내기`,`중요도 ${a(o,`이`,`가`)} 기준 ${p}보다 작으므로 ${a(y,`을`,`를`)} 다시 대기 큐 맨 뒤에 넣습니다.`,h.requeue),t.push({id:P(i),text:y,tone:i===c?`chosen`:`queued`},`cur`),e.do(...n([B(`cur`,`plain`,`-`),...z()],!0),R(250));else{e.phase(`실행하기`,x?`중요도 ${a(o,`이`,`가`)} 기준과 같아 ${m}번째로 실행합니다. 찾던 ${y}이므로 정답은 ${m}입니다.`:`중요도 ${a(o,`이`,`가`)} 지금 가장 높은 기준과 같으므로 ${m}번째로 실행합니다.`,x?h.done:h.exec),r.push({id:F(i),text:y,tone:x?`path`:`visited`},`cur`);let t=[B(`cur`,`plain`,`-`),B(N(m-1),`visited`),...m<l?[B(N(m),`current`)]:[],...z()];if(e.do(...n(t,!0),R(300)),x)break}}return e.finish()}function H(){let e=new i(L(`처음 중요도`)),t=new o(e,A),r=new o(e,j),u=[0,1,2,3,4],d=0,m=0,h=`-`,g=()=>({work:m,variables:{queue:p(u.map(f)),cur:h,executed:d}});e.step({title:`대기 큐에 프로세스 넣기 (정렬 기준 없음)`,codeHighlights:_.start,...g()}),e.phase(`준비`,`정렬된 기준 없이 대기 큐에 A~E를 그대로 넣습니다. 꺼낼 때마다 남은 큐를 직접 훑어 더 높은 중요도가 있는지 찾습니다.`);for(let e=0;e<l;e++)t.push({id:P(e),text:f(e),tone:e===c?`chosen`:`queued`});for(e.do(...n(s.map((e,t)=>({type:`set`,id:N(t),patch:{text:f(t),tone:t===c?`chosen`:`plain`},pop:!0}))),R(600));u.length>0;){let i=u.shift(),o=s[i],l=f(i);h=l;let p=[],v;for(let e of u)if(p.push(e),m++,o<s[e]){v=e;break}let y=v!==void 0;y?u.push(i):d++;let b=!y&&i===c;if(e.step({title:y?`${l}: 큐를 ${p.length}번 비교해 ${f(v)} 발견 → 뒤로`:`${l}: 큐 ${p.length}개 모두 확인 → ${d}번째 실행${b?` (정답 ${d})`:``}`,codeHighlights:b?_.done:y?_.requeue:_.exec,...g(),...b?{answer:d,isKeyframe:!0}:{}}),e.phase(`꺼내기`,`대기 큐 맨 앞에서 ${a(l,`을`,`를`)} 꺼냅니다.`,_.pop),t.shift(`cur`),e.do(B(`cur`,i===c?`chosen`:`current`,l),R(240)),e.phase(`큐 훑기`,p.length===0?`남은 대기 큐가 비어 있어 비교할 대상이 없습니다.`:y?`남은 큐를 앞에서부터 비교하다가 ${f(v)}에서 더 큰 중요도를 찾았습니다 (${p.length}번 비교).`:`남은 큐 ${p.length}개를 끝까지 비교해 더 큰 중요도가 없음을 확인했습니다.`,_.scan),p.length>0){e.do({type:`focus`,ids:[`cur`,...p.map(P)]});for(let t of p){let n=o<s[t];e.do({type:`arrow`,from:`cur`,to:P(t),verdict:n?`bad`:`good`,label:n?`${o} < ${s[t]}`:`${o} ≥ ${s[t]}`})}e.do(R(200))}else e.do(R(300));if(y)e.phase(`뒤로 보내기`,`더 높은 중요도가 있으므로 ${a(l,`을`,`를`)} 다시 큐 맨 뒤에 넣습니다.`,_.requeue),t.push({id:P(i),text:l,tone:i===c?`chosen`:`queued`},`cur`),e.do(...n([B(`cur`,`plain`,`-`),...z()],!0),R(250));else if(e.phase(`실행하기`,b?`남은 큐에 더 높은 중요도가 없어 ${d}번째로 실행합니다. 목표 ${l}이므로 정답은 ${d}입니다.`:`남은 큐에 더 높은 중요도가 없어 ${d}번째로 실행합니다.`,b?_.done:_.exec),r.push({id:F(i),text:l,tone:b?`path`:`visited`},`cur`),e.do(...n([B(`cur`,`plain`,`-`),B(N(i),`visited`),...z()],!0),R(300)),b)break}return e.finish()}function U(){let e=new i(L(`정렬 결과`)),r=new o(e,j),l=s.map((e,t)=>({idx:t,p:e})).sort((e,t)=>t.p-e.p),u=0,d=0,m=()=>({work:u,variables:{ranked:p(l.map(e=>f(e.idx))),location:c,turn:d||`-`}});e.step({title:`중요도 내림차순으로만 줄 세우기 (큐 회전 무시)`,codeHighlights:y.sort,...m()}),e.phase(`정렬하기`,`중요도가 큰 순서대로 정렬하면 ${p(l.map(e=>f(e.idx)))}가 됩니다. 같은 중요도끼리는 처음 번호 순서(A → C★ → E)가 그대로 남습니다.`),e.do(...n(l.map((e,t)=>({type:`set`,id:N(t),patch:{text:f(e.idx),tone:e.idx===c?`chosen`:`queued`},pop:!0}))),R(700));for(let i=0;i<l.length;i++){let{idx:o}=l[i],s=f(o);if(u++,d=i+1,o!==c)e.step({title:`${d}번째 ${s} 확인 → 목표(${f(c)}) 아님`,codeHighlights:y.check,...m()}),e.phase(`순서 확인`,`정렬된 줄의 ${d}번째인 ${a(s,`을`,`를`)} 확인합니다. 처음 위치 ${o} ≠ ${c}이므로 넘어갑니다.`,y.check),e.do({type:`focus`,ids:[N(i)]},B(N(i),`current`)),r.push({id:F(o),text:s,tone:`visited`},N(i)),e.do(...n([B(N(i),`visited`),...z()],!0),R(300));else{e.step({title:`오답 확인: 정렬 순서는 ${d}번째, 실제 정답은 4번째`,codeHighlights:y.done,...m(),answer:d,isKeyframe:!0}),e.phase(`오답 반환`,`정렬된 줄의 ${d}번째에서 ${a(s,`을`,`를`)} 만나 ${d}을 돌려줍니다.`,y.done),e.do({type:`focus`,ids:[N(i)]}),r.push({id:F(o),text:s,tone:`bad`},N(i)),e.do(...n([B(N(i),`bad`),...z()],!0),R(300)),e.phase(`오답 확인`,`실제로는 D(3)가 나오기 전에 A(2)와 C★(2)가 모두 큐 뒤로 밀려나서, D(3) 바로 뒤에 있던 E(2)가 먼저 실행됩니다. 정답은 ${t(4)} ${d}이 아닙니다.`);let c=b+D+8;e.do(...n([{type:`add`,item:{id:`wrong`,kind:`token`,rect:{x:c,y:E,w:134,h:24},tone:`bad`,text:`이 풀이: ${d}번째`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:c,y:262,w:134,h:24},tone:`good`,text:`정답: 4번째`}}]),R(500));break}}return e.finish()}var W={id:`process`,title:`프로세스`,level:2,category:`stack-queue`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42587`,description:{summary:`대기 큐 맨 앞에서 프로세스를 꺼냈을 때 큐에 중요도가 더 높은 프로세스가 하나라도 있으면 다시 큐 맨 뒤에 넣고, 없으면 바로 실행합니다. 각 프로세스의 중요도와 알고 싶은 프로세스의 처음 위치가 주어질 때 몇 번째로 실행되는지 구합니다.`,rules:[`priorities의 길이는 1 이상 100 이하이고, 원소는 1 이상 9 이하의 정수(클수록 중요도가 높음)`,`location은 0 이상 (대기 큐 길이 - 1) 이하이며 맨 앞이 0번째`],examples:[{input:`priorities = [2, 1, 3, 2], location = 2`,output:`1`},{input:`priorities = [1, 1, 9, 1, 1, 1], location = 0`,output:`5`}]},keyIntuitions:[`중요도가 같은 프로세스라도 더 높은 중요도 프로세스를 기다리며 큐 뒤로 밀려나면 실행 순서가 바뀝니다.`,`실행되는 중요도의 순서는 처음 배열을 내림차순 정렬한 결과와 항상 같습니다.`,`따라서 중요도를 미리 내림차순 정렬해 두고, 큐에서 꺼낸 값이 지금 차례의 최댓값과 같은지만 비교하면 매번 큐를 다 훑지 않아도 됩니다.`],demo:{input:[s,c],label:`priorities = [2, 1, 2, 3, 2], location = 2 (C★)`},workUnit:`우선순위 비교 횟수`,approaches:[{id:`process-queue-sorted`,name:`큐 + 정렬된 우선순위 기준`,rank:`BEST`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`실행될 중요도 순서를 미리 정렬해 두어, 큐에서 꺼낼 때마다 값 하나로만 비교하는 정석 풀이입니다.`,pros:[`꺼낸 프로세스를 실행할지 판단할 때 order[executed] 하나와만 비교하면 됩니다.`,`큐가 회전하면서 같은 중요도끼리 순서가 바뀌는 현상을 정확히 처리합니다.`],cons:[`최악의 경우 큐가 한 바퀴씩 돌아 꺼내는 횟수 자체는 O(N²)까지 늘 수 있습니다.`],whyThisRank:`큐 시뮬레이션을 그대로 따르면서도 매번 남은 큐의 최댓값을 다시 찾는 낭비를 없애 비교 횟수가 가장 적습니다.`,code:m,visualize:V},{id:`process-queue-scan`,name:`꺼낼 때마다 큐 전체 훑기`,rank:`ALTERNATIVE`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`문제 설명을 그대로 코드로 옮겨 이해하기 쉽지만, 꺼낼 때마다 남은 큐를 다시 훑어 비교 횟수가 늘어나는 풀이입니다.`,pros:[`문제의 규칙("남은 큐에 더 높은 중요도가 있으면 뒤로")이 코드 한 줄로 그대로 읽힙니다.`,`따로 정렬 배열을 만들지 않아도 됩니다.`],cons:[`프로세스를 하나 꺼낼 때마다 남은 큐를 앞에서부터 다시 훑어야 해서 우선순위 비교 횟수가 불필요하게 많습니다.`],whyThisRank:`정답은 같지만 매번 큐를 훑느라 정석보다 우선순위 비교를 훨씬 많이 합니다. N ≤ 100이라 통과하지만 비교 비용에서 손해를 봅니다.`,code:g,visualize:H},{id:`process-sort-only`,name:`중요도 내림차순 정렬만으로 세기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`중요도가 높은 것부터 실행된다는 점만 보고 정렬로 끝내려다, 큐가 돌며 같은 중요도의 순서가 바뀌는 것을 놓치는 오답입니다.`,pros:[`정렬 한 번으로 끝나 코드가 매우 짧습니다.`],cons:[`중요도 3이 맨 뒤쪽에 있으면 앞의 중요도 2들이 큐 뒤로 밀려나면서, 3 뒤에 있던 중요도 2가 먼저 실행됩니다.`,`정렬만 하면 같은 중요도끼리 늘 처음 번호 순서대로 실행된다고 가정해 오답이 됩니다.`],whyThisRank:`가장 높은 중요도가 빠져나가는 순간 큐의 시작 위치가 달라집니다. 이 회전을 시뮬레이션하지 않으면 같은 중요도 사이의 순서를 맞힐 수 없습니다.`,code:v,visualize:U}],checks:{cases:[{args:[[2,1,3,2],2],expected:1},{args:[[1,1,9,1,1,1],0],expected:5},{args:[[2,1,3,2],0],expected:3},{args:[[5],0],expected:1},{args:[[1,2,3,4],0],expected:4},{args:[s,c],expected:4}],random:e=>{let t=1+Math.floor(e()*7);return[Array.from({length:t},()=>1+Math.floor(e()*9)),Math.floor(e()*t)]}}};export{W as default};