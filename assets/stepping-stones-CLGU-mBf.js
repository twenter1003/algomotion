import{n as e,t}from"./layout-DFaYBMY_.js";import{a as n,c as r,i,l as a}from"./shared-CL29HWIp.js";var o=[91,88,27,33,41,16,23,70,83,32],s=3,c=o.length,l=Math.max(...o),u=e=>`[${e.join(`, `)}]`,d=Array.from({length:c-s+1},(e,t)=>t).reduce((e,t)=>Math.max(...o.slice(t,t+s))<Math.max(...o.slice(e,e+s))?t:e,0),f={python:`def solution(stones, k):
    def can_cross(people):
        # people번째 사람이 건널 때는 앞사람 people - 1명이 밟은 뒤라,
        # 적힌 수가 people보다 작은 돌은 이미 0입니다
        run = 0  # 연속으로 밟을 수 없는 돌 수
        for s in stones:
            if s < people:
                run += 1
                if run >= k:  # k칸을 뛰어넘을 수 없다
                    return False
            else:
                run = 0
        return True

    left, right = 1, max(stones)
    answer = 0
    while left <= right:
        mid = (left + right) // 2
        if can_cross(mid):  # mid명이 건넌다 → 더 많이
            answer = mid
            left = mid + 1
        else:               # 막힌다 → 더 적게
            right = mid - 1
    return answer`,javascript:`function solution(stones, k) {
  const canCross = (people) => {
    // people번째 사람이 건널 때는 앞사람 people - 1명이 밟은 뒤라,
    // 적힌 수가 people보다 작은 돌은 이미 0입니다
    let run = 0; // 연속으로 밟을 수 없는 돌 수
    for (const s of stones) {
      if (s < people) {
        run++;
        if (run >= k) return false; // k칸을 뛰어넘을 수 없다
      } else {
        run = 0;
      }
    }
    return true;
  };

  let left = 1;
  let right = stones.reduce((a, b) => Math.max(a, b), 0);
  let answer = 0;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (canCross(mid)) { // mid명이 건넌다 → 더 많이
      answer = mid;
      left = mid + 1;
    } else { // 막힌다 → 더 적게
      right = mid - 1;
    }
  }
  return answer;
}`},p=(e,t)=>i(f,[`run = 0  #`,`for s in stones`,`if s < people`,`run += 1`,`if run >= k`,...t?[`                run = 0`]:[],e?`return False`:`return True`],[`let run = 0`,`for (const s of stones)`,`if (s < people)`,`run++`,`if (run >= k)`,...t?[`        run = 0;`]:[],e?`return false`:`return true`]),m={start:i(f,[`left, right = 1, max(stones)`,`answer = 0`],[`let left = 1`,`let right = stones.reduce`,`let answer = 0`]),mid:i(f,[`while left <= right`,`mid = (left + right) // 2`],[`while (left <= right)`,`const mid = Math.floor`]),pass:i(f,[`if can_cross(mid)`,`answer = mid`,`left = mid + 1`],[`if (canCross(mid))`,`answer = mid`,`left = mid + 1`]),fail:i(f,[`if can_cross(mid)`,`else:  `,`right = mid - 1`],[`if (canCross(mid))`,`} else { //`,`right = mid - 1`]),done:i(f,[`while left <= right`,`return answer`],[`while (left <= right)`,`return answer`])},h={python:`def solution(stones, k):
    left, right = 1, max(stones)
    answer = 0
    while left <= right:
        mid = (left + right) // 2
        # mid - 1명이 건넌 뒤 돌에 남은 수 (0이 되면 밟을 수 없다)
        after = [max(0, s - (mid - 1)) for s in stones]

        run, ok = 0, True
        for s in after:
            run = run + 1 if s == 0 else 0
            if run >= k:  # 0인 돌이 k칸 연속이면 못 건넌다
                ok = False
                break

        if ok:   # mid명이 건넌다 → 더 많이
            answer = mid
            left = mid + 1
        else:    # 막힌다 → 더 적게
            right = mid - 1
    return answer`,javascript:`function solution(stones, k) {
  let left = 1;
  let right = stones.reduce((a, b) => Math.max(a, b), 0);
  let answer = 0;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // mid - 1명이 건넌 뒤 돌에 남은 수 (0이 되면 밟을 수 없다)
    const after = stones.map((s) => Math.max(0, s - (mid - 1)));

    let run = 0;
    let ok = true;
    for (const s of after) {
      run = s === 0 ? run + 1 : 0;
      if (run >= k) { // 0인 돌이 k칸 연속이면 못 건넌다
        ok = false;
        break;
      }
    }

    if (ok) { // mid명이 건넌다 → 더 많이
      answer = mid;
      left = mid + 1;
    } else { // 막힌다 → 더 적게
      right = mid - 1;
    }
  }
  return answer;
}`},g={start:i(h,[`left, right = 1, max(stones)`,`answer = 0`],[`let left = 1`,`let right = stones.reduce`,`let answer = 0`]),mid:i(h,[`while left <= right`,`mid = (left + right) // 2`],[`while (left <= right)`,`const mid = Math.floor`]),shave:i(h,[`after = [max(0`],[`const after = stones.map`]),scan:e=>i(h,[`run, ok = 0, True`,`for s in after`,`run = run + 1 if s == 0`,`if run >= k`,...e?[`ok = False`,`break`]:[]],[`let run = 0`,`let ok = true`,`for (const s of after)`,`run = s === 0`,`if (run >= k)`,...e?[`ok = false`,`break`]:[]]),pass:i(h,[`if ok:`,`answer = mid`,`left = mid + 1`],[`if (ok)`,`answer = mid`,`left = mid + 1`]),fail:i(h,[`if ok:`,`else:`,`right = mid - 1`],[`if (ok)`,`} else {`,`right = mid - 1`]),done:i(h,[`while left <= right`,`return answer`],[`while (left <= right)`,`return answer`])},_={python:`def solution(stones, k):
    now = stones[:]  # 원본을 지키려고 복사
    people = 0
    while True:
        run = 0  # 연속으로 0인 돌 수
        for s in now:
            run = run + 1 if s == 0 else 0
            if run >= k:  # 0인 돌이 k칸 연속이면 이 사람은 못 건넌다
                return people
        now = [max(0, s - 1) for s in now]  # 건너며 돌을 한 번씩 밟는다
        people += 1  # 돌이 2억이면 2억 번 반복`,javascript:`function solution(stones, k) {
  let now = [...stones]; // 원본을 지키려고 복사
  let people = 0;
  while (true) {
    let run = 0; // 연속으로 0인 돌 수
    for (const s of now) {
      run = s === 0 ? run + 1 : 0;
      if (run >= k) return people; // 0인 돌이 k칸 연속이면 이 사람은 못 건넌다
    }
    now = now.map((s) => Math.max(0, s - 1)); // 건너며 돌을 한 번씩 밟는다
    people++; // 돌이 2억이면 2억 번 반복
  }
}`},v={start:i(_,[`now = stones[:]`,`people = 0`],[`let now = [...stones]`,`let people = 0`]),scan:e=>i(_,[`while True`,`run = 0  #`,`for s in now`,`run = run + 1 if s == 0`,`if run >= k`,...e?[`return people`]:[]],[`while (true)`,`let run = 0`,`for (const s of now)`,`run = s === 0`,`if (run >= k)`,...e?[`return people`]:[]]),step:i(_,[`now = [max(0, s - 1)`,`people += 1`],[`now = now.map`,`people++`]),loop:i(_,[`while True`,`run = 0  #`,`for s in now`,`now = [max(0, s - 1)`,`people += 1`],[`while (true)`,`let run = 0`,`for (const s of now)`,`now = now.map`,`people++`])},y=642,b=e({x:88,w:470,min:1,max:l}),x=80,S=e=>({x:24+e*60,y:176,w:54,h:54}),C=e=>({x:24+e*60,y:296,w:54,h:54}),w=e=>`stone:${e}`,T=e=>`after:${e}`,E=Array.from({length:c},(e,t)=>w(t)),D=Array.from({length:c},(e,t)=>T(t));function O(e){let t=e?366:262,n=[{id:`track`,kind:`line`,rect:{x:0,y:0,w:y,h:t},tone:`trail`,points:[[b(1),106],[b(l),106]]},{id:`k`,kind:`token`,rect:{x:24,y:130,w:72,h:24},tone:`plain`,text:`k = ${s}`}];return o.forEach((e,t)=>n.push({id:w(t),kind:`cell`,rect:S(t),tone:`plain`,text:String(e)},{id:`no:${t}`,kind:`text`,rect:{x:24+t*60,y:236,w:54,h:18},tone:`muted`,text:`${t+1}번`})),e&&n.push({id:`after:label`,kind:`text`,rect:{x:24,y:266,w:594,h:22},text:``}),{width:y,height:t,items:n}}var k=e=>({type:`wait`,ms:e}),A=(e,t,n=!1)=>({type:`set`,id:e,patch:{text:t},...n?{pop:n}:{}}),j=(e,t)=>({type:`set`,id:e,patch:{tone:t}}),M=(e,{id:t,kind:n,...r})=>e.has(t)?{type:`set`,id:t,patch:r}:{type:`add`,item:{id:t,kind:n,...r}},N=(e,t)=>[{id:`range`,kind:`zone`,rect:{x:b(e-.5),y:94,w:b(t+.5)-b(e-.5),h:24}},{id:`left`,kind:`token`,rect:{x:b(e-.5)-x,y:30,w:x,h:24},tone:`plain`,text:`left ${e}`},{id:`right`,kind:`token`,rect:{x:b(t+.5),y:30,w:x,h:24},tone:`plain`,text:`right ${t}`}],P=e=>({id:`answer`,kind:`token`,rect:{x:b(e)-44,y:0,w:88,h:24},tone:`path`,text:`answer ${e}`}),F=(e,t,n,r)=>[M(e,{id:`probe`,kind:`token`,rect:{x:b(t)-2,y:88,w:4,h:30},tone:r}),M(e,{id:`probe:label`,kind:`token`,rect:{x:b(t)-44,y:62,w:88,h:26},tone:r,text:n})];function I(e){let t=0,n={start:0,len:0};for(let r=0;r<e.length;r++)if(t=e[r]?t+1:0,t>n.len&&(n={start:r-t+1,len:t}),t>=s)return{looked:r+1,...n,blocked:!0};return{looked:e.length,...n,blocked:!1}}var L=(e,n,r)=>{let[i,a]=[e(n),e(n+r-1)];return t({x:i.x,y:i.y,w:a.x+a.w-i.x,h:i.h},5)},R=(e,t,n,i,a,o)=>{let c=t.slice(0,a.looked);e.do(...r([{type:`focus`,ids:c},...c.map((e,t)=>j(e,i[t]?`bad`:`visited`)),...a.len?[{type:`add`,item:{id:`run`,kind:`ring`,rect:L(n,a.start,a.len)}}]:[]]));let l=a.blocked?`연속 ${s}칸 · 막힘`:a.len?`연속 ${a.len}칸 · 통과`:`막힘 없음`;e.do({type:`arrow`,from:o,to:a.len?`run`:`k`,verdict:a.blocked?`bad`:`good`,label:l})},z=(e,t,n,i=()=>`plain`)=>r([{type:`unfocus`},{type:`clearMarks`},...e.has(`run`)?[{type:`remove`,id:`run`}]:[],...t.slice(0,n.looked).map((e,t)=>j(e,i(t)))]),B=(e,t,r,i)=>e?`${t}명은 건널 수 있습니다. answer를 ${n(t)} 저장하고 left를 ${n(r)} 올립니다.`:`${t}명은 막힙니다. right를 ${n(i)} 줄여 더 적은 인원을 봅니다.${r>i?` 이제 left가 right보다 큽니다.`:``}`,V=(e,t,n,i,a)=>{let[o,s,c]=N(n,i);e.do(...r([M(e,o),M(e,t?s:c),...t?[M(e,P(a))]:[]]))},H=e=>{e.do(...r([{type:`remove`,id:`range`},{type:`set`,id:`left`,patch:{tone:`muted`}},{type:`set`,id:`right`,patch:{tone:`muted`}},...Array.from({length:s},(e,t)=>j(w(d+t),`path`))])),e.do({type:`add`,item:{id:`run`,kind:`ring`,rect:L(S,d,s)}})},U=o.slice(d,d+s).join(`, `);function W(){let e=new a(O(!1)),[t,n]=[1,l],i=0,s=0,c=`-`,u=0,d=()=>({work:u,variables:{left:t,right:n,mid:s||`-`,"건널 수 있나":c,answer:i}});for(e.step({title:`인원 수의 범위 1명 ~ ${l}명 정하기`,codeHighlights:m.start,...d()}),e.phase(`시작`,`건널 수 있는 사람은 1명에서 ${l}명 사이입니다. 가장 튼튼한 돌이 ${l}이기 때문입니다.`),e.do(...r(N(t,n).map(t=>M(e,t))),k(500));t<=n;){let[a,l]=[t,n];s=Math.floor((t+n)/2);let f=o.map(e=>e<s),h=I(f);u+=h.looked;let g=!h.blocked;c=g?`예`:`아니오`,g?[i,t]=[s,s+1]:n=s-1;let _=o.slice(h.start,h.start+h.len).join(`, `);e.step({title:`mid ${s}명 → ${g?`건넘, 더 많이`:`막힘, 더 적게`}`,codeHighlights:g?m.pass:m.fail,...d()}),e.phase(`가운데 고르기`,`mid = ⌊(${a} + ${l}) ÷ 2⌋ = ${s}명입니다.`,m.mid),e.do(...r(F(e,s,`mid ${s}`,`current`))),e.phase(`돌 살피기`,h.blocked?`${s}보다 작은 돌은 이미 0입니다. 왼쪽부터 훑으니 ${_} 세 칸이 연속으로 막힙니다.`:h.len?`${s}보다 작은 돌은 이미 0입니다. 막히는 돌은 연속 ${h.len}칸(${_})이 가장 깁니다.`:`${s}보다 작은 돌이 없어 막히는 곳이 없습니다.`,p(h.blocked,f.slice(0,h.looked).includes(!1))),R(e,E,S,f,h,`probe:label`),e.phase(`범위 줄이기`,B(g,s,t,n),g?m.pass:m.fail),V(e,g,t,n,i),e.do(...z(e,E,h))}return e.step({title:`건널 수 있는 최대 ${i}명`,codeHighlights:m.done,...d(),answer:i,isKeyframe:!0}),e.phase(`정답`,`${U} 세 칸은 ${i}명이 건너면 모두 0이 됩니다. 그래서 ${i+1}번째 사람은 막히고 답은 ${i}입니다.`),H(e),e.finish()}function G(){let e=new a(O(!0)),[t,n]=[1,l],i=0,s=0,d=`-`,f=[],p=0,m=()=>({work:p,variables:{left:t,right:n,mid:s||`-`,after:f.length?u(f):`-`,ok:d,answer:i}});for(e.step({title:`인원 수의 범위 1명 ~ ${l}명 정하기`,codeHighlights:g.start,...m()}),e.phase(`시작`,`정석과 같은 범위에서 시작합니다. 다만 검사마다 ‘깎은 뒤’의 돌 배열을 새로 만들어 확인합니다.`),e.do(...r(N(t,n).map(t=>M(e,t))),k(500));t<=n;){let[a,l]=[t,n];s=Math.floor((t+n)/2),f=o.map(e=>Math.max(0,e-(s-1)));let u=f.map(e=>e===0),h=I(u);p+=c+h.looked;let _=!h.blocked;d=_?`True`:`False`,_?[i,t]=[s,s+1]:n=s-1,e.step({title:`mid ${s}명 → ${_?`건넘, 더 많이`:`막힘, 더 적게`}`,codeHighlights:_?g.pass:g.fail,...m()}),e.phase(`가운데 고르기`,`mid = ⌊(${a} + ${l}) ÷ 2⌋ = ${s}명입니다.`,g.mid),e.do(...r(F(e,s,`mid ${s}`,`current`))),e.phase(`돌 깎기`,`${s-1}명이 건넌 뒤 돌에 남은 수를 새 배열에 적습니다.`,g.shave),e.do(...r([A(`after:label`,`${s-1}명이 건넌 뒤 돌에 남은 수`),...f.map((t,n)=>e.has(T(n))?{type:`set`,id:T(n),patch:{text:String(t)},pop:!0}:{type:`add`,item:{id:T(n),kind:`cell`,rect:C(n),tone:`plain`,text:String(t)},from:w(n)})])),e.phase(`돌 살피기`,h.blocked?`깎은 돌을 왼쪽부터 훑으니 0이 세 칸 연속이라 막힙니다.`:h.len?`깎은 돌에서 0은 연속 ${h.len}칸이 가장 깁니다.`:`깎은 돌에 0이 없어 막히는 곳이 없습니다.`,g.scan(h.blocked)),R(e,D,C,u,h,`probe:label`),e.phase(`범위 줄이기`,B(_,s,t,n),_?g.pass:g.fail),V(e,_,t,n,i),e.do(...z(e,D,h))}return e.step({title:`건널 수 있는 최대 ${i}명`,codeHighlights:g.done,...m(),answer:i,isKeyframe:!0}),e.phase(`정답`,`${U} 세 칸은 ${i}명이 건너면 모두 0이 됩니다. 그래서 ${i+1}번째 사람은 막히고 답은 ${i}입니다.`),H(e),e.finish()}var K=2;function q(){let e=new a(O(!1)),t=[...o],n=0,i=0,c=e=>e.map(e=>Math.max(0,e-1)),l=()=>({work:i,variables:{people:n,now:u(t)}}),d=e=>t=>e[t]===0?`muted`:`plain`,f=(e,t,n)=>t.map((r,i)=>({type:`set`,id:w(i),patch:{text:String(r),tone:d(t)(i)},...n&&r!==e[i]?{pop:n}:{}})),p=(t,n)=>r(F(e,t,`${t}번째`,n)),m=0;for(let e=[...o];!I(e.map(e=>e===0)).blocked;e=c(e))m++;e.step({title:`한 명씩 건너 보기 시작`,codeHighlights:v.start,...l()}),e.phase(`시작`,`사람을 한 명씩 실제로 건너게 합니다. 건널 때마다 밟은 돌의 수가 1씩 줄고, 0인 돌이 ${s}칸 연속이면 멈춥니다.`),e.do(...r(F(e,0,`0명`,`plain`)),k(500));let h=a=>{let o=t,u=o.map(e=>e===0),d=I(u);i+=d.looked,n=a,t=c(o),e.step({title:`${a}번째 사람 건넘`,codeHighlights:v.loop,...l()}),e.phase(`다음 사람`,`${a}번째 사람이 건너려고 합니다.`),e.do(...p(a,`current`)),e.phase(`돌 살피기`,d.len?`0인 돌은 연속 ${d.len}칸이 가장 길어 ${s}칸에 못 미칩니다. 건널 수 있습니다.`:`0인 돌이 없어 막히는 곳이 없습니다. 건널 수 있습니다.`,v.scan(!1)),R(e,E,S,u,d,`probe:label`),e.phase(`돌 밟기`,`건너며 돌을 한 번씩 밟아, 0이 아닌 돌이 모두 1씩 줄어듭니다.`,v.step),e.do(...r([{type:`unfocus`},{type:`clearMarks`},...e.has(`run`)?[{type:`remove`,id:`run`}]:[],...f(o,t,!0)]))};for(let e=1;e<=K;e++)h(e);let[g,_]=[3,m-1],y=t;for(let e=g;e<=_;e++)i+=I(t.map(e=>e===0)).looked,t=c(t);n=_,e.step({title:`${g}~${_}번째 사람 빨리 감기`,codeHighlights:v.loop,...l()}),e.phase(`빨리 감기`,`${g}번째부터 ${_}번째까지 ${_-g+1}명도 같은 일을 되풀이해, 돌마다 ${_}번 밟힙니다.`),e.do(...r([...p(_,`current`),...f(y,t,!1)]),k(130)),h(m);let b=t.map(e=>e===0),x=I(b);i+=x.looked;let C=m+1;return e.step({title:`${C}번째 사람은 막힘 — ${m}명`,codeHighlights:v.scan(!0),...l(),answer:m,isKeyframe:!0}),e.phase(`다음 사람`,`${C}번째 사람이 건너려고 합니다.`),e.do(...p(C,`bad`)),e.phase(`돌 살피기`,`0인 돌이 세 칸 연속이라 막힙니다. ${m}명까지만 건넌 것입니다.`,v.scan(!0)),R(e,E,S,b,x,`probe:label`),e.phase(`정답`,`답은 ${m}명으로 정석과 같지만 돌을 ${i}번 확인했습니다. 돌이 20만 개, 값이 2억이면 4 × 10¹³번이 넘습니다.`),e.do(...r([M(e,P(m)),...z(e,E,x,d(t))])),e.finish()}var J={id:`stepping-stones`,title:`징검다리 건너기`,level:3,category:`binary-search`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/64062`,description:{summary:`일렬로 놓인 징검다리 돌마다 밟을 수 있는 횟수가 적혀 있고, 친구들이 한 명씩 건너며 밟은 돌의 수를 1씩 줄입니다. 수가 0인 돌은 밟을 수 없지만, 한 번에 최대 k칸까지는 건너뛸 수 있습니다. 징검다리를 끝까지 건널 수 있는 친구가 최대 몇 명인지 구합니다.`,rules:[`stones의 길이는 1 이상 200,000 이하`,`stones의 원소는 1 이상 200,000,000 이하의 자연수`,`k는 1 이상 stones의 길이 이하의 자연수`,`건너는 친구 수에는 제한이 없고, 건너뛸 돌이 여럿이면 가장 가까운 돌로 뜁니다`],examples:[{input:`stones = [2, 4, 5, 3, 2, 1, 4, 2, 5, 1], k = 3`,output:`3`}]},keyIntuitions:[`친구를 한 명씩 건너게 하면 최대 2억 명이 돌 20만 개를 훑어야 해서 시간 초과입니다.`,`질문을 뒤집어 "m명이 건널 수 있나?"를 묻습니다. m번째 사람 앞에서는 적힌 수가 m보다 작은 돌이 이미 0이라, 그런 돌이 k칸 연속이면 막힙니다.`,`m이 커질수록 건너기 어려워지는 한쪽 방향이라서, 건널 수 있는 가장 큰 m을 이분 탐색으로 찾습니다.`],demo:{input:[o,s],label:`stones = [91, 88, 27, 33, 41, 16, 23, 70, 83, 32], k = 3`},workUnit:`돌을 확인한 횟수`,approaches:[{id:`stones-binary`,name:`건널 수 있는 인원 수를 이분 탐색`,rank:`BEST`,timeComplexity:`O(N log M)`,spaceComplexity:`O(1)`,verdict:`인원 수를 정해 놓고 한 번 훑어 판정하는 풀이로, 검사는 28번 안팎이면 끝납니다.`,pros:[`판정이 "m보다 작은 돌이 k칸 연속인가?" 한 번의 훑기라 코드가 짧고 틀릴 곳이 적습니다.`,`검사 횟수가 log₂(2억) ≈ 28번이라 돌 20만 개도 금방 끝납니다.`,`돌 배열을 건드리지 않고 비교만 해서 추가 메모리가 필요 없습니다.`],cons:[`"m번째 사람 앞에서는 m보다 작은 돌이 이미 0"이라는 관계를 떠올려야 합니다.`,`right를 max(stones)로 잡아야 반복이 줄어듭니다(2억으로 잡아도 맞지만 더 돕니다).`],whyThisRank:`인원이 늘수록 건너기 어려워지는 단조성이 있어 답을 이분 탐색할 수 있습니다. 배열을 새로 만들지 않고 s < m으로 바로 비교하므로 가장 단순하고 안전합니다.`,code:f,visualize:W},{id:`stones-shave`,name:`돌을 깎아 본 뒤 확인하는 이분 탐색`,rank:`ALTERNATIVE`,timeComplexity:`O(N log M)`,spaceComplexity:`O(N)`,verdict:`같은 이분 탐색이지만 검사마다 m − 1명이 건넌 뒤의 돌 배열을 새로 만들어, 정석보다 시간도 메모리도 더 씁니다.`,pros:[`"사람이 건너면 돌이 닳는다"는 문제 설명을 그대로 옮겨 이해하기 쉽습니다.`,`깎은 값이 0인 돌만 세면 되어 판정 조건이 단순합니다.`],cons:[`검사마다 돌 배열을 통째로 새로 만들어 추가 메모리 O(N)과 돌을 한 번 더 훑는 시간이 듭니다(돌 20만 개를 28번 복사).`,`깎은 값에서 mid와 mid − 1을 헷갈리기 쉽습니다.`],whyThisRank:`답은 정석과 같지만, 정석은 s < m으로 바로 비교해 복사본이 필요 없습니다. 검사마다 배열을 만드는 만큼 일과 메모리를 더 써서 대안입니다.`,code:h,visualize:G},{id:`stones-simulate`,name:`친구를 한 명씩 건너 보게 하기`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(M × N)`,spaceComplexity:`O(N)`,verdict:`친구를 실제로 한 명씩 건너게 하다 처음 막히는 순간 멈춥니다. 답은 맞지만 돌 값이 2억이면 끝나지 않습니다.`,pros:[`문제 설명을 그대로 옮긴 가장 직관적인 풀이입니다.`,`작은 입력에서는 정석과 같은 답을 냅니다.`],cons:[`건널 수 있는 사람이 최대 2억 명이고 사람마다 돌 20만 개를 훑어, 최악에는 4 × 10¹³번이 넘게 확인합니다.`,`효율성 테스트에서 시간 초과가 납니다.`],whyThisRank:`"m명이 건널 수 있나?"를 한 명씩 쌓아 가며 알아냅니다. 같은 질문을 m을 정해 놓고 한 번에 판정하면 28번의 검사로 끝납니다.`,code:_,visualize:q}],checks:{cases:[{args:[[2,4,5,3,2,1,4,2,5,1],3],expected:3},{args:[[1],1],expected:1},{args:[[5,5,5],3],expected:5},{args:[[3,1,2],1],expected:1},{args:[[4,1,9],3],expected:9},{args:[o,s],expected:41}],random:e=>{let t=1+Math.floor(e()*8);return[Array.from({length:t},()=>1+Math.floor(e()*12)),1+Math.floor(e()*t)]}}};export{J as default};