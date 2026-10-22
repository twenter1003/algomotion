import{i as e}from"./layout-DFaYBMY_.js";import{a as t,i as n,r,s as i}from"./shared-e6uNbDLo.js";import{t as a}from"./lane-BzDhdR3X.js";import{t as o}from"./paced-DMEp_Mu1.js";var s=[60,40,90,50,60,40,80,50,60,40],c=100,l=s.length,u=s.map((e,t)=>t).sort((e,t)=>s[e]-s[t]||e-t),d=u.map(e=>s[e]),f=e=>`[${e.join(`, `)}]`,p={python:`def solution(people, limit):
    people.sort()                    # 가벼운 순서로 정렬
    i, j = 0, len(people) - 1        # i: 가장 가벼운 사람, j: 가장 무거운 사람
    boats = 0
    while i <= j:
        if people[i] + people[j] <= limit:
            i += 1                   # 가장 가벼운 사람이 함께 탄다
        j -= 1                       # 가장 무거운 사람은 늘 탄다
        boats += 1
    return boats`,javascript:`function solution(people, limit) {
  people.sort((a, b) => a - b); // 가벼운 순서로 정렬
  let i = 0; // 가장 가벼운 사람
  let j = people.length - 1; // 가장 무거운 사람
  let boats = 0;
  while (i <= j) {
    if (people[i] + people[j] <= limit) i++; // 가장 가벼운 사람이 함께 탄다
    j--; // 가장 무거운 사람은 늘 탄다
    boats++;
  }
  return boats;
}`},m={sort:n(p,[`people.sort()`],[`people.sort((a, b)`]),init:n(p,[`i, j = 0, len(people) - 1`,`boats = 0`],[`let i = 0`,`let j = people.length - 1`,`let boats = 0`]),look:n(p,[`while i <= j`,`if people[i] + people[j] <= limit`],[`while (i <= j)`,`if (people[i] + people[j] <= limit)`]),pair:n(p,[`i += 1`,`j -= 1`,`boats += 1`],[`i++`,`j--`,`boats++`]),solo:n(p,[`j -= 1`,`boats += 1`],[`j--`,`boats++`]),done:n(p,[`while i <= j`,`return boats`],[`while (i <= j)`,`return boats`])},h={python:`def solution(people, limit):
    people.sort()
    boats = 0
    while people:
        heavy = people.pop()                       # 가장 무거운 사람부터 태운다
        # 남은 사람 중 같이 탈 수 있는 가장 무거운 사람을 뒤에서부터 찾는다
        for i in range(len(people) - 1, -1, -1):
            if people[i] + heavy <= limit:
                people.pop(i)
                break
        boats += 1
    return boats`,javascript:`function solution(people, limit) {
  people.sort((a, b) => a - b);
  let boats = 0;
  while (people.length > 0) {
    const heavy = people.pop(); // 가장 무거운 사람부터 태웁니다
    // 남은 사람 중 같이 탈 수 있는 가장 무거운 사람을 뒤에서부터 찾습니다
    for (let i = people.length - 1; i >= 0; i--) {
      if (people[i] + heavy <= limit) {
        people.splice(i, 1);
        break;
      }
    }
    boats++;
  }
  return boats;
}`},g={sort:n(h,[`people.sort()`],[`people.sort((a, b)`]),init:n(h,[`boats = 0`],[`let boats = 0`]),take:n(h,[`while people`,`heavy = people.pop()`],[`while (people.length > 0)`,`const heavy = people.pop()`]),scan:n(h,[`for i in range(len(people) - 1`,`if people[i] + heavy <= limit`],[`for (let i = people.length - 1`,`if (people[i] + heavy <= limit)`]),pair:n(h,[`people.pop(i)`,`break`,`boats += 1`],[`people.splice(i, 1)`,`break`,`boats++`]),solo:n(h,[`boats += 1`],[`boats++`]),done:n(h,[`while people`,`return boats`],[`while (people.length > 0)`,`return boats`])},_={python:`def solution(people, limit):
    people.sort()
    boats = 0
    i = 0
    while i < len(people):
        # 가장 가벼운 사람 둘을 같이 태울 수 있으면 태운다
        if i + 1 < len(people) and people[i] + people[i + 1] <= limit:
            i += 2
        else:
            i += 1
        boats += 1
    return boats  # [40, 40, 100, 100], 제한 140이면 3척 (정답은 2척)`,javascript:`function solution(people, limit) {
  people.sort((a, b) => a - b);
  let boats = 0;
  let i = 0;
  while (i < people.length) {
    // 가장 가벼운 사람 둘을 같이 태울 수 있으면 태웁니다
    if (i + 1 < people.length && people[i] + people[i + 1] <= limit) {
      i += 2;
    } else {
      i += 1;
    }
    boats++;
  }
  return boats; // [40, 40, 100, 100], 제한 140이면 3척 (정답은 2척)
}`},v={sort:n(_,[`people.sort()`],[`people.sort((a, b)`]),init:n(_,[`boats = 0`,`i = 0`],[`let boats = 0`,`let i = 0`]),look:n(_,[`while i < len(people)`,`if i + 1 < len(people) and people[i] + people[i + 1] <= limit`],[`while (i < people.length)`,`if (i + 1 < people.length && people[i] + people[i + 1] <= limit)`]),pair:n(_,[`i += 2`,`boats += 1`],[`i += 2`,`boats++`]),solo:n(_,[`else:`,`i += 1`,`boats += 1`],[`} else {`,`i += 1`,`boats++`]),done:n(_,[`while i < len(people)`,`return boats`],[`while (i < people.length)`,`return boats`])},y=(...e)=>({python:[...new Set(e.flatMap(e=>e.python))].sort((e,t)=>e-t),javascript:[...new Set(e.flatMap(e=>e.javascript))].sort((e,t)=>e-t)}),b=e({x:64,y:34,rows:1,cols:l,cell:50,gap:4}),x=608,S=246,C={id:`boat`,x:64,y:156,slotW:58,slotH:36,gap:6,max:8},w=e=>`p:${e}`,T=e=>w(u[e]),E=(e,t)=>({x:b(0,t).x+7,y:e?120:92,w:36,h:22}),D=e=>({type:`wait`,ms:e}),O=()=>i([{type:`unfocus`},{type:`clearMarks`}]),k=(e,t)=>({type:`set`,id:T(e),patch:{tone:t}}),A=[{x:64,y:208,w:150,h:32},{x:222,y:208,w:150,h:32},{x:380,y:208,w:150,h:32}];function j(e){let t=[{id:`lab:people`,kind:`text`,rect:{x:0,y:34,w:58,h:50},text:`몸무게`},{id:`lab:boat`,kind:`text`,rect:{x:0,y:156,w:58,h:36},text:`보트`},{id:`boat:bg`,kind:`zone`,rect:{x:60,y:152,w:C.max*64-6+8,h:44}},{id:`tok:limit`,kind:`token`,rect:A[0],tone:`plain`,text:`무게 제한 ${c}`}];return e.forEach((e,n)=>e&&t.push({id:`lab:ptr${n}`,kind:`text`,rect:{x:0,y:n?120:92,w:58,h:22},tone:`muted`,text:e})),s.forEach((e,n)=>t.push({id:w(n),kind:`cell`,rect:b(0,n),tone:`plain`,text:String(e)})),{width:x,height:S,items:t}}var M=(e,t,n,r,i)=>e.has(t)?{type:`set`,id:t,patch:{text:r,tone:i},pop:!0}:{type:`add`,item:{id:t,kind:`token`,rect:A[n],tone:i,text:r}},N=(e,t,n)=>{let r=E(t===`i`?0:1,Math.min(Math.max(n,0),l-1));return e.has(`ptr:${t}`)?{type:`set`,id:`ptr:${t}`,patch:{rect:r}}:{type:`add`,item:{id:`ptr:${t}`,kind:`token`,rect:r,tone:`chosen`,text:t}}},P=e=>e.join(`+`);function F(e,t,n){e.step({title:`몸무게순으로 정렬: ${f(d)}`,codeHighlights:t,...n}),e.phase(`정렬하기`,`가벼운 사람이 왼쪽에 오도록 몸무게순으로 정렬합니다.`),e.do(...i(u.map((e,t)=>({type:`set`,id:w(e),patch:{rect:b(0,t)}}))))}function I(){let e=new o(j([`가벼운 쪽`,`무거운 쪽`])),t=new a(e,C),[n,s,u,f]=[0,l-1,0,0],p=!1,h=()=>({work:f,variables:{i:p?n:`-`,j:p?s:`-`,boats:u}});for(F(e,m.sort,h()),p=!0,e.step({title:`양 끝에 포인터 놓기: i = 0, j = ${l-1}`,codeHighlights:m.init,...h()}),e.phase(`시작`,`가장 가벼운 사람(i = 0)과 가장 무거운 사람(j = ${l-1})에서 시작합니다. 보트는 0척입니다.`),e.do(...i([N(e,`i`,0),N(e,`j`,l-1)]));n<=s;){let[a,o]=[d[n],d[s]],l=a+o,p=l<=c&&n!==s,[g,_]=[n,s];p&&n++,s--,u++,f++;let v=p?P([a,o]):String(o);e.step({title:`${u}번째 보트: ${p?`${r(a,`과`,`와`)} ${o}`:`${o} 혼자`}`,codeHighlights:p?m.pair:m.solo,...h()}),e.phase(`비교하기`,`가장 가벼운 ${r(a,`과`,`와`)} 가장 무거운 ${o}의 합은 ${l}입니다. 무게 제한 ${c}${p?` 이하라 함께 탈 수 있습니다.`:`을 넘어서 ${r(o,`은`,`는`)} 혼자 탑니다.`}`,m.look),e.do({type:`focus`,ids:[T(g),T(_)]}),e.do({type:`arrow`,from:T(_),to:T(g),verdict:p?`good`:`bad`,label:`${a} + ${o} = ${l} ${p?`≤`:`>`} ${c}`},D(100)),e.phase(`태우기`,p?`${r(a,`과`,`와`)} ${r(o,`을`,`를`)} 보트 한 척에 태웁니다. 보트는 ${u}척입니다.`:`${r(o,`만`,`만`)} 보트에 태웁니다. ${r(a,`은`,`는`)} 다음 차례를 기다립니다. 보트는 ${u}척입니다.`,p?m.pair:m.solo),e.do(...O()),t.push({id:`b:${u}`,text:v,tone:`chosen`},T(_)),e.do(...i([k(_,`visited`),...p?[k(g,`visited`)]:[],N(e,`j`,s),...p?[N(e,`i`,n)]:[]],!0))}return e.step({title:`i > j: 모두 태워 보트 ${u}척`,codeHighlights:m.done,...h(),answer:u,isKeyframe:!0}),e.phase(`정답`,`i = ${r(n,`이`,`가`)} j = ${s}보다 커져 모두 태웠습니다. 보트는 ${u}척입니다. 가장 무거운 사람이 가장 가벼운 사람과도 못 타면 누구와도 못 타므로, 이 짝짓기가 가장 알뜰합니다.`),e.do(...i(t.ids.map(e=>({type:`set`,id:e,patch:{tone:`path`}})))),e.do(M(e,`tok:ans`,1,`보트 ${u}척`,`path`)),e.finish()}function L(){let e=new o(j([``])),n=new a(e,C),s=[...Array(l).keys()],[u,p]=[0,0],m=0,h=()=>({work:p,variables:{heavy:m||`-`,boats:u,people:f(s.map(e=>d[e]))}});for(F(e,g.sort,h());s.length;){let a=s.pop(),o=[],l;for(let e=s.length-1;e>=0;e--)if(o.push(s[e]),p++,d[s[e]]+d[a]<=c){l=s[e],s.splice(e,1);break}m=d[a],u++;let f=l===void 0?void 0:d[l],_=o.at(-1),v=d[_]+m,b=f===void 0?String(m):P([f,m]);e.step({title:`${u}번째 보트: ${f===void 0?`${m} 혼자`:`${r(m,`과`,`와`)} ${f}`}`,codeHighlights:f===void 0?g.solo:g.pair,...h()}),e.phase(`짝 찾기`,o.length?`가장 무거운 ${r(m,`을`,`를`)} 꺼내고, 남은 사람을 무거운 쪽부터 ${o.length}명 비교합니다. ${f===void 0?`가장 가벼운 ${r(d[_],`과`,`와`)} 합해도 ${t(v)}, 제한 ${c}을 넘어 짝이 없습니다.`:`${r(d[_],`과`,`와`)} 합하면 ${t(v)}, 제한 ${c} 이하라 짝이 됩니다.`}`:`가장 무거운 ${r(m,`을`,`를`)} 꺼냈지만 남은 사람이 없어 혼자 탑니다.`,y(g.take,g.scan)),e.do(...i([{type:`focus`,ids:[T(a),...o.map(T)]},k(a,`current`)])),o.length&&e.do({type:`arrow`,from:T(a),to:T(_),verdict:f===void 0?`bad`:`good`,label:`${d[_]} + ${m} = ${v} ${f===void 0?`>`:`≤`} ${c}`},D(100)),e.phase(`태우기`,f===void 0?`${m}만 보트에 태웁니다. 보트는 ${u}척입니다.`:`${r(m,`과`,`와`)} ${r(f,`을`,`를`)} 보트 한 척에 태웁니다. 보트는 ${u}척입니다.`,f===void 0?g.solo:g.pair),e.do(...O()),n.push({id:`b:${u}`,text:b,tone:`chosen`},T(a)),e.do(...i([k(a,`visited`),...l===void 0?[]:[k(l,`visited`)]],!0))}return m=0,e.step({title:`남은 사람이 없어 보트 ${u}척`,codeHighlights:g.done,...h(),answer:u,isKeyframe:!0}),e.phase(`정답`,`남은 사람이 없어 보트는 ${u}척입니다. 정석과 같은 답이지만, 짝을 찾으려고 남은 사람을 ${p}번 비교했습니다. 정석은 ${u}번이면 됩니다.`),e.do(...i(n.ids.map(e=>({type:`set`,id:e,patch:{tone:`path`}})))),e.do(M(e,`tok:ans`,1,`보트 ${u}척`,`path`)),e.finish()}function R(){let e=new o(j([`가벼운 쪽`])),t=new a(e,C),[n,s,u]=[0,0,0],f=!1,p=()=>({work:u,variables:{i:f?n:`-`,boats:s}});for(F(e,v.sort,p()),f=!0,e.step({title:`가장 가벼운 사람에서 시작: i = 0`,codeHighlights:v.init,...p()}),e.phase(`시작`,`가장 가벼운 사람(i = 0)부터, 이웃한 두 사람을 짝지어 봅니다. 가벼운 사람끼리 타면 한 척에 두 명이 타서 알뜰해 보입니다.`),e.do(N(e,`i`,0));n<l;){let a=d[n],o=n+1<l?d[n+1]:void 0,f=o!==void 0&&a+o<=c,m=n;o!==void 0&&u++,n+=f?2:1,s++;let h=f?P([a,o]):String(a);e.step({title:`${s}번째 보트: ${f?`${r(a,`과`,`와`)} ${o}`:`${a} 혼자`}`,codeHighlights:f?v.pair:v.solo,...p()}),o===void 0?(e.phase(`비교하기`,`마지막 한 명이 남았습니다. 짝지을 이웃이 없어 ${r(a,`은`,`는`)} 혼자 탑니다.`,v.look),e.do(...i([{type:`focus`,ids:[T(m)]},k(m,`current`)]),D(300))):(e.phase(`비교하기`,`가장 가벼운 ${r(a,`과`,`와`)} 바로 다음 ${o}의 합은 ${a+o}입니다. 무게 제한 ${c}${f?` 이하라 함께 탑니다.`:`을 넘어서 ${r(a,`은`,`는`)} 혼자 탑니다.`}`,v.look),e.do({type:`focus`,ids:[T(m),T(m+1)]}),e.do({type:`arrow`,from:T(m+1),to:T(m),verdict:f?`good`:`bad`,label:`${a} + ${o} = ${a+o} ${f?`≤`:`>`} ${c}`},D(100))),e.phase(`태우기`,f?`${r(a,`과`,`와`)} ${r(o,`을`,`를`)} 보트 한 척에 태웁니다. 보트는 ${s}척입니다.`:`${r(a,`만`,`만`)} 보트에 태웁니다. 보트는 ${s}척입니다.`,f?v.pair:v.solo),e.do(...O()),t.push({id:`b:${s}`,text:h,tone:`chosen`},T(m)),e.do(...i([k(m,`visited`),...f?[k(m+1,`visited`)]:[],N(e,`i`,n)],!0))}return e.step({title:`이 방법 ${s}척, 정답은 6척`,codeHighlights:v.done,...p(),answer:s,isKeyframe:!0}),e.phase(`오답 확인`,`이 방법은 ${s}척이지만 정답은 6척입니다. 가벼운 사람끼리 타 버려서, 무거운 사람들이 같이 탈 가벼운 사람이 남지 않아 모두 혼자 탔습니다.`),e.do(...i(t.ids.map(e=>({type:`set`,id:e,patch:{tone:`bad`}})))),e.do(M(e,`tok:ans`,1,`이 방법 ${s}척`,`bad`)),e.do(M(e,`tok:truth`,2,`정답 6척`,`good`)),e.finish()}var z={id:`lifeboat`,title:`구명보트`,level:2,category:`greedy`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42885`,description:{summary:`섬에 갇힌 사람들을 구명보트로 구출합니다. 보트 한 척에는 한 번에 최대 2명까지 탈 수 있고, 탄 사람들의 몸무게 합이 보트의 무게 제한을 넘으면 안 됩니다. 모든 사람을 구출하는 데 필요한 보트의 최소 수를 구합니다.`,rules:[`사람은 1명 이상 50,000명 이하`,`몸무게는 40kg 이상 240kg 이하`,`무게 제한은 40kg 이상 240kg 이하이고, 늘 사람들 몸무게의 최댓값보다 큼(구출하지 못하는 사람은 없음)`,`보트 한 척에는 최대 2명, 두 사람의 몸무게 합이 무게 제한 이하여야 함`],examples:[{input:`people = [70, 50, 80, 50], limit = 100`,output:`3`},{input:`people = [70, 80, 50], limit = 100`,output:`3`}]},keyIntuitions:[`보트에는 최대 2명만 타므로, 가장 무거운 사람의 짝만 정하면 됩니다. 가장 무거운 사람이 가장 가벼운 사람과도 못 타면 누구와도 못 탑니다.`,`무게순으로 정렬한 뒤 가장 무거운 사람과 가장 가벼운 사람을 짝지어 봅니다. 합이 제한 이하이면 둘을 함께, 아니면 무거운 사람만 먼저 태웁니다.`,`양 끝에서 안쪽으로 포인터 두 개를 움직이면 한 번 훑는 것으로 끝납니다. 가벼운 사람끼리 짝지으면 무거운 사람들이 짝을 잃어 보트가 더 필요합니다.`],demo:{input:[s,c],label:`people = [60, 40, 90, 50, 60, 40, 80, 50, 60, 40], limit = 100`},workUnit:`몸무게 합을 비교한 횟수`,approaches:[{id:`lifeboat-two-ends`,name:`정렬 + 양 끝 짝짓기 (투 포인터)`,rank:`BEST`,timeComplexity:`O(N log N)`,spaceComplexity:`O(1)`,verdict:`무게순으로 정렬한 뒤 가장 가벼운 사람과 가장 무거운 사람을 짝지어 한 번 훑는 풀이입니다.`,pros:[`정렬한 뒤에는 포인터 두 개로 한 번만 훑으므로 O(N)입니다.`,`가장 무거운 사람은 늘 보트를 타므로 매번 보트 한 척이 확정됩니다.`,`정렬 말고는 따로 자료구조가 필요 없습니다.`],cons:[`i ≤ j 조건과 한 명만 남는 경우(i = j)를 놓치기 쉽습니다.`],whyThisRank:`가장 무거운 사람이 가장 가벼운 사람과도 탈 수 없다면 누구와도 탈 수 없습니다. 그래서 무거운 사람의 짝으로는 가장 가벼운 사람을 시도하는 것이 안전한 선택입니다.`,code:p,visualize:I},{id:`lifeboat-heavy-first`,name:`무거운 사람부터 짝 찾기`,rank:`ALTERNATIVE`,timeComplexity:`O(N²)`,spaceComplexity:`O(1)`,verdict:`가장 무거운 사람부터 같이 탈 수 있는 가장 무거운 사람을 찾아 태우는, 맞지만 짝을 찾느라 남은 사람을 다시 훑는 풀이입니다.`,pros:[`보트를 최대한 꽉 채운다는 생각이 직관적입니다.`,`정석과 같은 답을 냅니다.`],cons:[`짝을 찾을 때마다 남은 사람을 훑고, 목록 중간을 지우는 pop(i)도 O(N)이라 N = 50,000이면 효율성 테스트에서 시간 초과가 날 수 있습니다.`,`짝이 없는 무거운 사람이 많으면 매번 끝까지 훑습니다.`],whyThisRank:`양 끝만 보면 되는 문제인데, 짝을 찾는 탐색과 목록 중간 삭제가 더해져 일이 늘어납니다. 정렬된 목록에서는 가장 가벼운 사람 하나만 확인해도 짝이 있는지 알 수 있습니다.`,code:h,visualize:L},{id:`lifeboat-neighbors`,name:`가벼운 사람끼리 짝짓기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N log N)`,spaceComplexity:`O(1)`,verdict:`정렬한 뒤 이웃한 두 사람을 짝지어 보는 풀이로, 무거운 사람들이 짝을 잃어 보트가 더 필요합니다.`,pros:[`코드가 짧고, 공식 예제 두 개는 우연히 통과합니다.`],cons:[`가벼운 사람끼리 타 버리면 무거운 사람이 같이 탈 가벼운 사람이 남지 않습니다.`,`people = [40, 40, 100, 100], limit = 140이면 정답은 2척인데 3척이 나옵니다.`],whyThisRank:`무거운 사람이 가장 짝을 찾기 어려우므로, 가벼운 사람은 무거운 사람을 위해 남겨 둬야 합니다. 이웃끼리 묶으면 가벼운 사람을 가장 비효율적으로 쓰게 됩니다.`,code:_,visualize:R}],checks:{cases:[{args:[[70,50,80,50],100],expected:3},{args:[[70,80,50],100],expected:3},{args:[[40],50],expected:1},{args:[[40,40],100],expected:1},{args:[[60,60,60],100],expected:3},{args:[[40,40,100,100],140],expected:2},{args:[s,c],expected:6}],random:e=>{let t=41+Math.floor(e()*100);return[Array.from({length:1+Math.floor(e()*8)},()=>40+Math.floor(e()*(t-40))),t]}}};export{z as default};