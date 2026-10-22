import{o as e}from"./layout-DFaYBMY_.js";import{a as t,c as n,i as r,r as i,s as a,t as o}from"./shared-e6uNbDLo.js";import{t as s}from"./lane-BzDhdR3X.js";var c=[95,97,96,98,94,99,93],l=[1,1,1,1,1,1,1],u=c.map((e,t)=>Math.ceil((100-e)/l[t])),d=u.length,f=e=>`[${e.join(`, `)}]`,p=e=>`기능 ${e+1}`,m=[];for(let e=0;e<d;e++){let t=m.at(-1);t&&u[e]<=u[t[0]]?t.push(e):m.push([e])}var h={python:`import math

def solution(progresses, speeds):
    # 기능마다 배포까지 남은 날: 올림((100 - 진도) / 속도)
    days = [math.ceil((100 - p) / s) for p, s in zip(progresses, speeds)]

    answer = []
    deploy_day = days[0]  # 지금 묶음이 배포되는 날
    count = 1

    for day in days[1:]:
        if day <= deploy_day:
            count += 1            # 이미 끝나 있으니 함께 배포
        else:
            answer.append(count)  # 지금 묶음을 내보내고
            deploy_day = day      # 새 묶음 시작
            count = 1

    answer.append(count)          # 마지막 묶음
    return answer`,javascript:`function solution(progresses, speeds) {
  // 기능마다 배포까지 남은 날: 올림((100 - 진도) / 속도)
  const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));

  const answer = [];
  let deployDay = days[0]; // 지금 묶음이 배포되는 날
  let count = 1;

  for (let i = 1; i < days.length; i++) {
    if (days[i] <= deployDay) {
      count++; // 이미 끝나 있으니 함께 배포
    } else {
      answer.push(count); // 지금 묶음을 내보내고
      deployDay = days[i]; // 새 묶음 시작
      count = 1;
    }
  }

  answer.push(count); // 마지막 묶음
  return answer;
}`},g={days:r(h,[`days = [math.ceil`],[`const days = progresses.map`]),first:r(h,[`deploy_day = days[0]`,`count = 1`],[`let deployDay = days[0]`,`let count = 1`]),compare:r(h,[`for day in days[1:]`,`if day <= deploy_day`],[`for (let i = 1; i < days.length; i++)`,`if (days[i] <= deployDay)`]),join:r(h,[`if day <= deploy_day`,`count += 1`],[`if (days[i] <= deployDay)`,`count++`]),ship:r(h,[`else:`,`# 지금 묶음을 내보내고`,`# 새 묶음 시작`,`            count = 1`],[`} else {`,`// 지금 묶음을 내보내고`,`// 새 묶음 시작`,`      count = 1;`]),last:r(h,[`# 마지막 묶음`,`return answer`],[`// 마지막 묶음`,`return answer`])},_={python:`from collections import deque
import math

def solution(progresses, speeds):
    queue = deque(math.ceil((100 - p) / s) for p, s in zip(progresses, speeds))
    answer = []

    while queue:
        first = queue.popleft()  # 맨 앞 기능이 배포되는 날
        count = 1
        while queue and queue[0] <= first:
            queue.popleft()      # 이미 끝난 뒤 기능을 함께 꺼냄
            count += 1
        answer.append(count)
    return answer`,javascript:`function solution(progresses, speeds) {
  const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));
  const answer = [];
  let head = 0; // shift() 대신 머리 인덱스로 큐를 꺼냅니다

  while (head < days.length) {
    const first = days[head++]; // 맨 앞 기능이 배포되는 날
    let count = 1;
    while (head < days.length && days[head] <= first) {
      head++; // 이미 끝난 뒤 기능을 함께 꺼냄
      count++;
    }
    answer.push(count);
  }
  return answer;
}`},v={start:r(_,[`queue = deque(`],[`const days = progresses.map`,`let head = 0`]),first:r(_,[`while queue:`,`first = queue.popleft()`,`count = 1`],[`while (head < days.length) {`,`const first = days[head++]`,`let count = 1`]),more:r(_,[`while queue and queue[0] <= first`,`# 이미 끝난 뒤 기능을 함께 꺼냄`,`count += 1`],[`while (head < days.length && days[head] <= first)`,`// 이미 끝난 뒤 기능을 함께 꺼냄`,`count++`]),ship:r(_,[`answer.append(count)`],[`answer.push(count)`]),done:r(_,[`answer.append(count)`,`return answer`],[`answer.push(count)`,`return answer`])},y={python:`import math

def solution(progresses, speeds):
    days = [math.ceil((100 - p) / s) for p, s in zip(progresses, speeds)]
    answer = []
    count = 1

    for i in range(1, len(days)):
        if days[i] <= days[i - 1]:  # 잘못된 기준: 직전 기능과만 비교
            count += 1
        else:
            answer.append(count)
            count = 1
    answer.append(count)
    return answer  # days = [5, 3, 4] → [2, 1] (정답은 [3])`,javascript:`function solution(progresses, speeds) {
  const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));
  const answer = [];
  let count = 1;

  for (let i = 1; i < days.length; i++) {
    if (days[i] <= days[i - 1]) { // 잘못된 기준: 직전 기능과만 비교
      count++;
    } else {
      answer.push(count);
      count = 1;
    }
  }
  answer.push(count);
  return answer; // days = [5, 3, 4] → [2, 1] (정답은 [3])
}`},b=e=>[o(e,`return answer`)[0]-1,o(e,`return answer`)[0]],x={days:r(y,[`days = [math.ceil`],[`const days = progresses.map`]),first:r(y,[`count = 1`],[`let count = 1`]),compare:r(y,[`for i in range(1, len(days))`,`if days[i] <= days[i - 1]`],[`for (let i = 1; i < days.length; i++)`,`if (days[i] <= days[i - 1])`]),join:r(y,[`if days[i] <= days[i - 1]`,`count += 1`],[`if (days[i] <= days[i - 1])`,`count++`]),ship:r(y,[`else:`,`answer.append(count)`,`            count = 1`],[`} else {`,`answer.push(count)`,`      count = 1;`]),last:{python:b(y.python),javascript:b(y.javascript)}},S=e({x:72,y:62,w:76,h:120,gap:8}),C=26,w=70,T=126,E=152,D=196,O=S(d-1).x+76+18,k=236,A={id:`log`,x:76,y:200,slotW:96,slotH:32,gap:8,max:4},j={x:A.x-4,y:D,w:A.max*(A.slotW+A.gap),h:40},M=e=>`day:${e}`,N=(e,t,n,r)=>({id:e,kind:`text`,rect:{x:0,y:n,w:64,h:r},text:t});function P(e){let t=[...e?[N(`row:mark`,e,C,28)]:[],N(`row:day`,`남은 날`,w,48),N(`row:bar`,`진도`,T,20),N(`row:state`,`상태`,E,22),N(`log:label`,`배포 기록`,D,40),{id:`log:bg`,kind:`zone`,rect:j}];return c.forEach((e,n)=>{let{x:r}=S(n);t.push({id:`name:${n}`,kind:`text`,rect:{x:r,y:0,w:76,h:20},text:p(n)},{id:`card:${n}`,kind:`zone`,rect:S(n)},{id:M(n),kind:`cell`,rect:{x:r+6,y:w,w:64,h:48},tone:`plain`,text:``},{id:`bar:${n}`,kind:`bar`,rect:{x:r+6,y:T,w:64,h:20},tone:`muted`,fill:e/100,text:`${e}%`},{id:`state:${n}`,kind:`text`,rect:{x:r,y:E,w:76,h:22},text:`대기`})}),{width:O,height:k,items:t}}var F=e=>({type:`wait`,ms:e}),I=(e,t)=>({type:`set`,id:M(e),patch:{tone:t}}),L=(e,t)=>({type:`set`,id:`state:${e}`,patch:{text:t}}),R=()=>a([{type:`unfocus`},{type:`clearMarks`}]),z=()=>a(u.map((e,t)=>({type:`set`,id:M(t),patch:{text:String(e)},pop:!0}))),B=e=>[I(e,`queued`),L(e,`이번 묶음`)],V=e=>[I(e,`visited`),{type:`set`,id:`bar:${e}`,patch:{tone:`visited`,fill:1,text:`100%`}},L(e,`배포 완료`)],H=(e,t,n)=>{let r={rect:{x:S(t).x+12,y:C,w:52,h:28},text:String(n)};return e.has(`mark`)?{type:`set`,id:`mark`,patch:r}:{type:`add`,item:{id:`mark`,kind:`token`,tone:`chosen`,...r}}},U=(e,t,n,r,i)=>{t.push({id:`log:${t.ids.length}`,text:r,tone:`visited`},i),e.do(...a(n.flatMap(V),!0))},W=(e,t)=>a(e.map(e=>({type:`set`,id:e,patch:{tone:t}}))),G=`기능마다 ⌈(100 − 진도) ÷ 속도⌉로 배포까지 남은 날을 구합니다. 속도가 모두 1이라 남은 진도가 곧 남은 날입니다.`;function K(){let e=new n(P(`배포일`)),r=new s(e,A),o=[],c=0,l=0,m=0,h=0,_=[],v=()=>({work:h,variables:{days:f(u),deploy_day:c||`-`,day:l||`-`,count:m||`-`,answer:f(o)}});e.step({title:`배포까지 남은 날 구하기: ${f(u)}`,codeHighlights:g.days,...v()}),e.phase(`남은 날 계산`,G),e.do(...z(),F(1100)),[c,m,h,_]=[u[0],1,1,[0]],e.step({title:`${t(p(0))} 첫 묶음 시작: 배포일 ${c}일`,codeHighlights:g.first,...v()}),e.phase(`첫 묶음`,`맨 앞 ${i(p(0),`이`,`가`)} 끝나는 ${c}일째가 첫 배포일입니다. 이 날이 묶음의 기준이고 count = 1입니다.`),e.do(...a([H(e,0,c),...B(0)]),F(500));for(let t=1;t<d;t++){let[n,s,d]=[c,m,_];l=u[t],h++;let f=l<=n;f?(m=s+1,_=[...d,t]):(o.push(s),[c,m,_]=[l,1,[t]]),e.step({title:f?`${p(t)}: ${l}일 ≤ ${n}일 → 함께 배포`:`${p(t)}: ${l}일 > ${n}일 → ${n}일째 ${s}개 배포`,codeHighlights:f?g.join:g.ship,...v()}),e.phase(`비교하기`,`${p(t)}의 남은 날 ${l}일을 지금 묶음의 배포일 ${n}일과 비교합니다.`,g.compare),e.do(...a([{type:`focus`,ids:[M(t),`mark`]},I(t,`current`)])),e.do({type:`arrow`,from:`mark`,to:M(t),verdict:f?`good`:`bad`,label:`${l}일 ${f?`≤`:`>`} ${n}일`},F(200)),f?(e.phase(`묶기`,`${l}일 ≤ ${n}일이라 ${i(p(t),`은`,`는`)} ${n}일째에 이미 끝나 있습니다. 함께 배포하므로 count = ${m}입니다.`,g.join),e.do(...a(B(t)),F(450),...R())):(e.phase(`배포하기`,`${l}일 > ${n}일이라 ${i(p(t),`은`,`는`)} ${n}일째에 나갈 수 없습니다. 지금 묶음 ${s}개를 배포하고 ${l}일을 새 배포일로 잡습니다.`,g.ship),e.do({type:`unfocus`}),U(e,r,d,`${n}일째 ${s}개`,`mark`),e.do(...a([{type:`clearMarks`},H(e,t,l),...B(t)])))}return o.push(m),e.step({title:`${c}일째 마지막 ${m}개 배포 — 정답 ${f(o)}`,codeHighlights:g.last,...v(),answer:[...o],isKeyframe:!0}),e.phase(`마지막 배포`,`모든 기능을 확인했습니다. 남은 묶음 ${m}개를 ${c}일째에 배포하면 answer = ${f(o)}입니다.`),U(e,r,_,`${c}일째 ${m}개`,`mark`),e.do(...W(r.ids,`path`)),e.finish()}function q(){let e=new n(P(`first`)),t=new s(e,A),r=[],o=u,c=0,l=0,d=0,h=()=>({work:d,variables:{queue:f(o),first:c||`-`,count:l||`-`,answer:f(r)}});return e.step({title:`남은 날을 큐에 넣기: ${f(u)}`,codeHighlights:v.start,...h()}),e.phase(`큐에 넣기`,`기능마다 배포까지 남은 날을 구해 앞에서부터 큐에 넣습니다. 속도가 모두 1이라 남은 진도가 곧 남은 날입니다.`),e.do(...z(),F(1100)),m.forEach((n,s)=>{let[g,..._]=n,y=m.at(s+1)?.[0],b=y===void 0;c=u[g],l=n.length,d+=n.length,o=u.slice(d),r.push(l);let x=_.length?`${p(g)}~${n.at(-1)+1}`:p(g);e.step({title:`${x} 꺼내기 → ${c}일째 ${l}개 배포${b?` — 정답 ${f(r)}`:``}`,codeHighlights:b?v.done:v.ship,...h(),...b?{answer:[...r],isKeyframe:!0}:{}}),e.phase(`맨 앞 꺼내기`,`큐 맨 앞에서 ${i(p(g),`을`,`를`)} 꺼냅니다. first = ${c}, count = 1입니다.`,v.first),e.do(...a([H(e,g,c),...B(g)]),F(400));let S=y===void 0?_:[..._,y],C=_.length?`${_.map(e=>`${u[e]}일`).join(`, `)}을 꺼내고 `:``,w=y===void 0?`큐가 비었습니다.`:`${u[y]}일 > ${c}일에서 멈춥니다.`;e.phase(`함께 꺼내기`,S.length?`큐 맨 앞이 ${c}일 이하인 동안 함께 꺼냅니다. ${C}${w}`:`큐가 비어 함께 꺼낼 기능이 없습니다.`,v.more),S.length&&e.do({type:`focus`,ids:[...S.map(M),`mark`]});for(let t of _)e.do({type:`arrow`,from:`mark`,to:M(t),verdict:`good`,label:`${u[t]}일 ≤ ${c}일`},...a(B(t),!0));y!==void 0&&e.do({type:`arrow`,from:`mark`,to:M(y),verdict:`bad`,label:`${u[y]}일 > ${c}일`}),S.length&&e.do(F(100)),e.phase(`배포`,b?`마지막 ${l}개를 ${c}일째에 배포하면 큐가 비어 반복을 마칩니다. 답은 ${f(r)}입니다.`:`꺼낸 ${l}개를 ${c}일째에 함께 배포합니다. answer = ${f(r)}입니다.`,b?v.done:v.ship),U(e,t,n,`${c}일째 ${l}개`,`mark`),S.length&&e.do(...a(R(),!0)),b&&e.do(...W(t.ids,`path`))}),e.finish()}function J(){let e=new n(P()),r=new s(e,A),o=[],c=0,l=0,h=0,g=[],_=()=>({work:h,variables:{days:f(u),"days[i - 1]":c?u[c-1]:`-`,"days[i]":c?u[c]:`-`,count:l||`-`,answer:f(o)}}),v=t=>U(e,r,t,`${t.length}개`,M(t[0]));e.step({title:`배포까지 남은 날 구하기: ${f(u)}`,codeHighlights:x.days,..._()}),e.phase(`남은 날 계산`,G),e.do(...z(),F(1100)),[l,h,g]=[1,1,[0]],e.step({title:`${t(p(0))} 첫 묶음 시작`,codeHighlights:x.first,..._()}),e.phase(`첫 묶음`,`맨 앞 ${t(p(0))} 첫 묶음을 시작합니다. count = 1입니다.`),e.do(...a(B(0)),F(400));for(let n=1;n<d;n++){let[r,s,d,f]=[u[n-1],u[n],l,g],m=s<=r;c=n,h++,m?(l=d+1,g=[...f,n]):(o.push(d),[l,g]=[1,[n]]);let y=`${s}일 ${m?`≤`:`>`} ${r}일 → ${m?`같은`:`새`} 묶음`;e.step({title:`${p(n)}: ${y}`,codeHighlights:m?x.join:x.ship,..._()}),e.phase(`직전과 비교하기`,`${p(n)}의 남은 날 ${s}일을 직전 ${p(n-1)}의 ${r}일과 비교합니다.`,x.compare),e.do(...a([{type:`focus`,ids:[M(n-1),M(n)]},I(n,`current`)])),e.do({type:`arrow`,from:M(n-1),to:M(n),verdict:m?`good`:`bad`,label:y},F(200)),m?(e.phase(`묶기`,`${s}일 ≤ ${r}일이라 ${i(p(n),`을`,`를`)} 지금 묶음에 넣습니다. count = ${l}입니다.`,x.join),e.do(...a(B(n)),F(300),...R())):(e.phase(`배포하기`,`${s}일 > ${r}일이라 새 묶음을 시작합니다. 지금 묶음 ${d}개를 배포 기록에 넣고 count = ${t(1)} 되돌립니다.`,x.ship),e.do({type:`unfocus`}),v(f),e.do(...a([{type:`clearMarks`},...B(n)]),F(200)))}o.push(l);let y=m.map(e=>e.length);e.step({title:`오답 확인: ${f(o)}, 정답은 ${f(y)}`,codeHighlights:x.last,..._(),answer:[...o],isKeyframe:!0}),e.phase(`마지막 배포`,`반복이 끝났습니다. 남은 ${l}개까지 넣으면 answer = ${f(o)}입니다.`),v(g),e.do(F(400)),e.phase(`오답 확인`,`기준은 직전 기능이 아니라 지금 묶음의 배포일이어야 합니다.`),e.do(...W(r.ids,`bad`));let b={x:j.x+j.w+12,y:A.y,w:140,h:A.slotH};return e.do({type:`add`,item:{id:`truth`,kind:`token`,rect:b,tone:`good`,text:`정답은 ${f(y)}`}}),e.finish()}var Y={id:`feature-development`,title:`기능개발`,level:2,category:`stack-queue`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42586`,description:{summary:`기능은 진도가 100%가 되어야 배포할 수 있고, 뒤 기능이 먼저 끝나도 앞 기능이 배포될 때 함께 배포됩니다. 작업 진도와 하루 개발 속도가 주어질 때 배포마다 몇 개의 기능이 나가는지 구합니다.`,rules:[`작업 개수(progresses, speeds의 길이)는 100개 이하`,`작업 진도는 100 미만, 작업 속도는 100 이하의 자연수`,`배포는 하루에 한 번, 하루의 끝에 이루어짐`,`진도 95%, 속도 4%라면 2일 뒤에 배포됨`],examples:[{input:`progresses = [93, 30, 55], speeds = [1, 30, 5]`,output:`[2, 1]`},{input:`progresses = [95, 90, 99, 99, 80, 99], speeds = [1, 1, 1, 1, 1, 1]`,output:`[1, 3, 2]`}]},keyIntuitions:[`기능마다 배포까지 걸리는 날을 먼저 구합니다: ⌈(100 − 진도) ÷ 속도⌉. 첫 예제는 [7, 3, 9]일입니다.`,`뒤 기능이 먼저 끝나도 앞 기능이 나갈 때까지 기다립니다. 그래서 묶음의 기준은 그 묶음 맨 앞 기능의 완료일입니다.`,`기준일보다 늦게 끝나는 기능을 만나면 지금 묶음을 배포하고, 그 기능의 완료일로 새 묶음을 시작합니다.`],demo:{input:[c,l],label:`progresses = [95, 97, 96, 98, 94, 99, 93], speeds = 모두 1`},workUnit:`살펴본 기능 수`,approaches:[{id:`feature-single-pass`,name:`배포일 기준으로 한 번 훑기`,rank:`BEST`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`남은 날을 미리 구한 뒤 반복문 한 번으로 묶음을 세는 가장 간결한 풀이입니다.`,pros:[`배열을 한 번만 훑으므로 O(N)입니다.`,`변수 두 개(배포일, 개수)만으로 상태를 관리합니다.`,`날짜를 하루씩 흘려보낼 필요가 없습니다.`],cons:[`올림 나눗셈 ⌈(100 − p) ÷ s⌉을 정확히 써야 합니다. Python에서는 -((p - 100) // s)로도 쓸 수 있습니다.`],whyThisRank:`남은 날만 알면 시뮬레이션 없이 "기준일 이하면 같은 묶음"이라는 비교 하나로 끝납니다. 코드가 짧아 실수할 곳이 적습니다.`,code:h,visualize:K},{id:`feature-queue`,name:`큐에서 앞부터 꺼내기`,rank:`ALTERNATIVE`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`큐의 FIFO 동작을 그대로 옮긴 풀이로, 정석과 결과와 복잡도가 같습니다.`,pros:[`맨 앞 기능을 꺼낼 때 이미 끝난 뒤 기능을 함께 꺼내는 구조가 문제 설명과 그대로 맞습니다.`,`"스택/큐" 유형을 연습하기에 좋습니다.`],cons:[`JavaScript에는 덱이 없어 shift()를 쓰면 꺼낼 때마다 O(N)이 듭니다. 이 문제는 N ≤ 100이라 괜찮지만, 머리 인덱스로 꺼내는 습관이 안전합니다.`],whyThisRank:`동작과 복잡도는 정석과 같습니다. 다만 같은 일을 하는 코드가 조금 더 길어 대안으로 둡니다.`,code:_,visualize:q},{id:`feature-compare-previous`,name:`직전 기능하고만 비교하기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`복잡도는 같지만 묶음 기준을 잘못 잡아 오답이 나옵니다.`,pros:[`코드 모양이 정석 풀이와 거의 같습니다.`],cons:[`남은 날이 [5, 3, 4]이면 4를 직전 값 3과 비교해 새 묶음으로 나눕니다. 실제로는 5일째에 셋이 함께 나가므로 정답 [3]이 아니라 [2, 1]이 나옵니다.`,`문제의 두 예제는 우연히 통과해서 실수를 알아채기 어렵습니다.`],whyThisRank:`뒤 기능은 앞 기능이 배포될 때까지 기다리므로, 비교 기준은 직전 기능이 아니라 지금 묶음의 배포일(맨 앞 기능의 완료일)이어야 합니다.`,code:y,visualize:J}],checks:{cases:[{args:[[93,30,55],[1,30,5]],expected:[2,1]},{args:[[95,90,99,99,80,99],[1,1,1,1,1,1]],expected:[1,3,2]},{args:[[95,97,96],[1,1,1]],expected:[3]},{args:[[99],[1]],expected:[1]},{args:[c,l],expected:[4,2,1]}],random:e=>{let t=1+Math.floor(e()*6);return[Array.from({length:t},()=>1+Math.floor(e()*99)),Array.from({length:t},()=>1+Math.floor(e()*30))]}}};export{Y as default};