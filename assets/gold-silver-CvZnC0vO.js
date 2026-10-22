import{n as e,o as t}from"./layout-DFaYBMY_.js";import{a as n,c as r,i,s as a}from"./shared-e6uNbDLo.js";var o=30,s=30,c=[30,30,0],l=[30,0,20],u=[10,10,10],d=[3,7,4],f=c.length,p=(Math.floor(60/Math.min(...u))+1)*2*Math.max(...d),m=(e,t)=>Math.floor((t+d[e])/(2*d[e])),h=(e,t)=>m(e,t)*u[e];function g(e){let t=0,n=0,r=0;return{caps:c.map((i,a)=>{let o=h(a,e);return t+=Math.min(c[a],o),n+=Math.min(l[a],o),r+=Math.min(c[a]+l[a],o),o}),gold:t,silver:n,both:r,ok:t>=o&&n>=s&&r>=60}}function _(e){let t=0,n=0;return{caps:c.map((r,i)=>{let a=h(i,e),o=Math.min(c[i],a),s=Math.min(l[i],a-o);return t+=o,n+=s,a}),gold:t,silver:n,ok:t>=o&&n>=s}}var v={python:`def solution(a, b, g, s, w, t):
    def can_deliver(time):
        gold = silver = both = 0
        for gi, si, wi, ti in zip(g, s, w, t):
            moves = (time + ti) // (2 * ti)  # 왕복 횟수 + 편도 1회 가능 여부
            cap = moves * wi
            gold += min(gi, cap)             # 금만 최대한 실을 때
            silver += min(si, cap)           # 은만 최대한 실을 때
            both += min(gi + si, cap)        # 금+은 합쳐 최대한 실을 때
        return gold >= a and silver >= b and both >= a + b

    left = 0
    right = ((a + b) // min(w) + 1) * 2 * max(t)
    answer = right
    while left <= right:
        mid = (left + right) // 2
        if can_deliver(mid):
            answer = mid
            right = mid - 1
        else:
            left = mid + 1
    return answer`,javascript:`function solution(a, b, g, s, w, t) {
  const canDeliver = (time) => {
    let gold = 0, silver = 0, both = 0;
    for (let i = 0; i < g.length; i++) {
      // BigInt 없이도 정밀도 안에서 동작하도록 Math.floor 나눗셈 사용
      const moves = Math.floor((time + t[i]) / (2 * t[i]));
      const cap = moves * w[i];
      gold += Math.min(g[i], cap);
      silver += Math.min(s[i], cap);
      both += Math.min(g[i] + s[i], cap);
    }
    return gold >= a && silver >= b && both >= a + b;
  };

  let left = 0;
  let right = (Math.floor((a + b) / Math.min(...w)) + 1) * 2 * Math.max(...t);
  let answer = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (canDeliver(mid)) {
      answer = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return answer;
}`},y={start:i(v,[`left = 0`,`right = ((a + b) // min(w) + 1) * 2 * max(t)`,`answer = right`],[`let left = 0`,`let right = (Math.floor`,`let answer = right`]),mid:i(v,[`while left <= right`,`mid = (left + right) // 2`],[`while (left <= right)`,`const mid = Math.floor`]),check:i(v,[`moves = (time + ti) // (2 * ti)`,`gold += min(gi, cap)`,`silver += min(si, cap)`,`both += min(gi + si, cap)`,`return gold >= a and silver >= b and both >= a + b`],[`const moves = Math.floor`,`gold += Math.min(g[i], cap)`,`silver += Math.min(s[i], cap)`,`both += Math.min(g[i] + s[i], cap)`,`return gold >= a && silver >= b && both >= a + b`]),pass:i(v,[`if can_deliver(mid):`,`answer = mid`,`right = mid - 1`],[`if (canDeliver(mid))`,`answer = mid`,`right = mid - 1`]),fail:i(v,[`if can_deliver(mid):`,`else:`,`left = mid + 1`],[`if (canDeliver(mid))`,`} else {`,`left = mid + 1`]),done:i(v,[`while left <= right`,`return answer`],[`while (left <= right)`,`return answer`])},b={python:`def solution(a, b, g, s, w, t):
    left = 0
    right = ((a + b) // min(w) + 1) * 2 * max(t)
    answer = right
    while left <= right:
        mid = (left + right) // 2
        # 도시별 최대 운반량 배열과 금·은·합계 배열을 각각 따로 생성
        caps = [((mid + ti) // (2 * ti)) * wi for wi, ti in zip(w, t)]
        gold_arr = [min(gi, c) for gi, c in zip(g, caps)]
        silver_arr = [min(si, c) for si, c in zip(s, caps)]
        both_arr = [min(gi + si, c) for gi, si, c in zip(g, s, caps)]

        if sum(gold_arr) >= a and sum(silver_arr) >= b and sum(both_arr) >= a + b:
            answer = mid
            right = mid - 1
        else:
            left = mid + 1
    return answer`,javascript:`function solution(a, b, g, s, w, t) {
  let left = 0;
  let right = (Math.floor((a + b) / Math.min(...w)) + 1) * 2 * Math.max(...t);
  let answer = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // 도시별 최대 운반량 배열과 금·은·합계 배열을 각각 따로 생성
    const caps = t.map((ti, i) => Math.floor((mid + ti) / (2 * ti)) * w[i]);
    const goldArr = g.map((gi, i) => Math.min(gi, caps[i]));
    const silverArr = s.map((si, i) => Math.min(si, caps[i]));
    const bothArr = g.map((gi, i) => Math.min(gi + s[i], caps[i]));

    const gold = goldArr.reduce((acc, v) => acc + v, 0);
    const silver = silverArr.reduce((acc, v) => acc + v, 0);
    const both = bothArr.reduce((acc, v) => acc + v, 0);
    if (gold >= a && silver >= b && both >= a + b) {
      answer = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return answer;
}`},x={start:i(b,[`left = 0`,`right = ((a + b) // min(w) + 1) * 2 * max(t)`,`answer = right`],[`let left = 0`,`let right = (Math.floor`,`let answer = right`]),mid:i(b,[`while left <= right`,`mid = (left + right) // 2`],[`while (left <= right)`,`const mid = Math.floor`]),arrays:i(b,[`caps = [`,`gold_arr = [`,`silver_arr = [`,`both_arr = [`],[`const caps = t.map`,`const goldArr = g.map`,`const silverArr = s.map`,`const bothArr = g.map`]),pass:i(b,[`if sum(gold_arr) >= a`,`answer = mid`,`right = mid - 1`],[`if (gold >= a && silver >= b`,`answer = mid`,`right = mid - 1`]),fail:i(b,[`if sum(gold_arr) >= a`,`else:`,`left = mid + 1`],[`if (gold >= a && silver >= b`,`} else {`,`left = mid + 1`]),done:i(b,[`while left <= right`,`return answer`],[`while (left <= right)`,`return answer`])},S={python:`def solution(a, b, g, s, w, t):
    def can_deliver_greedy(time):
        gold = silver = 0
        for gi, si, wi, ti in zip(g, s, w, t):
            cap = ((time + ti) // (2 * ti)) * wi
            take_g = min(gi, cap)            # 함정: 무조건 금을 먼저 채운다
            take_s = min(si, cap - take_g)   # 남은 용량으로만 은을 채운다
            gold += take_g
            silver += take_s
        return gold >= a and silver >= b

    left = 0
    right = ((a + b) // min(w) + 1) * 2 * max(t)
    answer = right
    while left <= right:
        mid = (left + right) // 2
        if can_deliver_greedy(mid):
            answer = mid
            right = mid - 1
        else:
            left = mid + 1
    return answer`,javascript:`function solution(a, b, g, s, w, t) {
  const canDeliverGreedy = (time) => {
    let gold = 0, silver = 0;
    for (let i = 0; i < g.length; i++) {
      const cap = Math.floor((time + t[i]) / (2 * t[i])) * w[i];
      const takeG = Math.min(g[i], cap); // 함정: 무조건 금을 먼저 채운다
      const takeS = Math.min(s[i], cap - takeG); // 남은 용량으로만 은을 채운다
      gold += takeG;
      silver += takeS;
    }
    return gold >= a && silver >= b;
  };

  let left = 0;
  let right = (Math.floor((a + b) / Math.min(...w)) + 1) * 2 * Math.max(...t);
  let answer = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (canDeliverGreedy(mid)) {
      answer = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return answer;
}`},C={start:i(S,[`left = 0`,`right = ((a + b) // min(w) + 1) * 2 * max(t)`,`answer = right`],[`let left = 0`,`let right = (Math.floor`,`let answer = right`]),mid:i(S,[`while left <= right`,`mid = (left + right) // 2`],[`while (left <= right)`,`const mid = Math.floor`]),greedy:i(S,[`take_g = min(gi, cap)`,`take_s = min(si, cap - take_g)`,`return gold >= a and silver >= b`],[`const takeG = Math.min(g[i], cap)`,`const takeS = Math.min(s[i], cap - takeG)`,`return gold >= a && silver >= b`]),pass:i(S,[`if can_deliver_greedy(mid):`,`answer = mid`,`right = mid - 1`],[`if (canDeliverGreedy(mid))`,`answer = mid`,`right = mid - 1`]),fail:i(S,[`if can_deliver_greedy(mid):`,`else:`,`left = mid + 1`],[`if (canDeliverGreedy(mid))`,`} else {`,`left = mid + 1`]),done:i(S,[`while left <= right`,`return answer`],[`while (left <= right)`,`return answer`])},w=620,T=356,E={x:0,y:0,w,h:T},D=e({x:88,w:444,min:0,max:p}),O=t({x:36,y:136,w:172,h:58,gap:16}),k=t({x:36,y:198,w:172,h:22,gap:16}),A=e=>`city:${e}`,j=e=>`cap:${e}`;function M(){let e=[{id:`track`,kind:`line`,rect:E,tone:`trail`,points:[[D(0),102],[D(p),102]]}];c.forEach((t,n)=>{e.push({id:A(n),kind:`cell`,rect:O(n),tone:`plain`,text:`금 ${t} · 은 ${l[n]}`,sub:`w=${u[n]}, 편도 ${d[n]}시간`,tag:`도시 ${n}`},{id:j(n),kind:`text`,rect:k(n),tone:`muted`,text:`운반 한도 -`})});let t=e=>232+e*38;return e.push({id:`lbl:g`,kind:`text`,rect:{x:24,y:t(0),w:80,h:30},text:`금 최대합`},{id:`bar:g`,kind:`bar`,rect:{x:108,y:t(0),w:340,h:30},fill:0,text:`0`},{id:`goal:g`,kind:`token`,rect:{x:460,y:t(0),w:124,h:30},tone:`plain`,text:`목표 ${o}`},{id:`lbl:s`,kind:`text`,rect:{x:24,y:t(1),w:80,h:30},text:`은 최대합`},{id:`bar:s`,kind:`bar`,rect:{x:108,y:t(1),w:340,h:30},fill:0,text:`0`},{id:`goal:s`,kind:`token`,rect:{x:460,y:t(1),w:124,h:30},tone:`plain`,text:`목표 ${s}`},{id:`lbl:m`,kind:`text`,rect:{x:24,y:t(2),w:80,h:30},text:`합계 최대`},{id:`bar:m`,kind:`bar`,rect:{x:108,y:t(2),w:340,h:30},fill:0,text:`0`},{id:`goal:m`,kind:`token`,rect:{x:460,y:t(2),w:124,h:30},tone:`plain`,text:`목표 60`}),{width:w,height:T,items:e}}var N=(e,{id:t,kind:n,...r})=>e.has(t)?{type:`set`,id:t,patch:r}:{type:`add`,item:{id:t,kind:n,...r}},P=(e,t)=>[{id:`range`,kind:`zone`,rect:{x:D(e-.5),y:90,w:D(t+.5)-D(e-.5),h:24}},{id:`left`,kind:`token`,rect:{x:D(e-.5)-76,y:30,w:76,h:24},tone:`plain`,text:`left ${e}`},{id:`right`,kind:`token`,rect:{x:D(t+.5),y:30,w:80,h:24},tone:`plain`,text:`right ${t}`}],F=e=>({id:`answer`,kind:`token`,rect:{x:D(e)-46,y:0,w:92,h:24},tone:`path`,text:`answer ${e}`}),I=(e,t,n,r)=>[N(e,{id:`probe`,kind:`token`,rect:{x:D(t)-2,y:86,w:4,h:32},tone:r}),N(e,{id:`probe:label`,kind:`token`,rect:{x:D(t)-46,y:58,w:92,h:26},tone:r,text:n})];function L(e){let{caps:t,gold:n,silver:r,both:i}=g(e);return[...t.map((e,t)=>({type:`set`,id:A(t),patch:{tone:e>0?`visited`:`muted`}})),...t.map((t,n)=>({type:`set`,id:j(n),patch:{text:`${m(n,e)}회 → 최대 ${t}`,tone:t>0?`good`:`muted`}})),{type:`set`,id:`bar:g`,patch:{fill:Math.min(1,n/o),text:`${n}`,tone:n>=o?`good`:`bad`}},{type:`set`,id:`bar:s`,patch:{fill:Math.min(1,r/s),text:`${r}`,tone:r>=s?`good`:`bad`}},{type:`set`,id:`bar:m`,patch:{fill:Math.min(1,i/60),text:`${i}`,tone:i>=60?`good`:`bad`}}]}function R(){let e=new r(M()),[t,i]=[0,p],c=i,l=0;for(e.step({title:`탐색 구간 0 ~ ${p}시간 설정`,codeHighlights:y.start,work:l,variables:{left:t,right:i,answer:c,"필요 금":o,"필요 은":s}}),e.phase(`시작`,`금 ${o}, 은 ${s}(합계 60)를 모두 나르는 시간의 상한을 ${p}시간으로 잡고 이분 탐색을 시작합니다.`,y.start),e.do(...a([...P(t,i).map(t=>N(e,t)),N(e,F(c))]));t<=i;){let[r,u]=[t,i],d=Math.floor((t+i)/2),{caps:p,gold:m,silver:h,both:_,ok:v}=g(d);l+=f,v?[c,i]=[d,d-1]:t=d+1;let b=v?y.pass:y.fail;e.step({title:`mid = ${d}시간 → 금 ${m}, 은 ${h}, 합계 ${_} (${v?`가능`:`부족`})`,codeHighlights:b,work:l,variables:{left:t,right:i,mid:d,gold:m,silver:h,both:_,answer:c}}),e.phase(`가운데 고르기`,`mid = ⌊(${r} + ${u}) ÷ 2⌋ = ${d}시간일 때 각 도시의 운반 한도를 계산합니다.`,y.mid),e.do(...a(I(e,d,`mid ${d}`,`current`))),e.phase(`세 조건 확인`,`운반 한도는 [${p.join(`, `)}]입니다. 금 최대합 ${m}(≥${o}), 은 최대합 ${h}(≥${s}), 합계 최대 ${_}(≥60)를 확인합니다.`,y.check),e.do(...a(L(d))),e.phase(`범위 줄이기`,v?`세 조건을 모두 만족하므로 answer = ${n(d)} 저장하고 right = ${n(i)} 줄입니다.`:`조건을 만족하지 못하므로 시간을 늘려 left = ${n(t)} 올립니다.`,b);let[x,S,C]=P(t,i);e.do(...a([N(e,x),N(e,v?C:S),...v?[N(e,F(c))]:[]]))}let u=g(c);return e.step({title:`최소 시간 ${c}시간 확정`,codeHighlights:y.done,work:l,variables:{answer:c,gold:u.gold,silver:u.silver,both:u.both,"확인 횟수":l},answer:c,isKeyframe:!0}),e.phase(`정답`,`${c}시간이면 도시 1에서 금 10, 도시 2에서 은 20, 도시 0에서 금 20 + 은 10을 실어 금 ${o}, 은 ${s}을 정확히 채웁니다.`,y.done),e.do(...a([{type:`remove`,id:`answer`},...I(e,c,`answer ${c}`,`path`),{type:`remove`,id:`range`},...L(c)])),e.finish()}function z(){let e=new r(M()),[t,i]=[0,p],o=i,s=0;for(e.step({title:`탐색 구간 0 ~ ${p}시간 설정 (배열 4개 분리 생성)`,codeHighlights:x.start,work:s,variables:{left:t,right:i,answer:o}}),e.phase(`시작`,`검사할 때마다 caps, goldArr, silverArr, bothArr 네 배열을 따로 만들고 각각 합산합니다.`,x.start),e.do(...a([...P(t,i).map(t=>N(e,t)),N(e,F(o))]));t<=i;){let[r,c]=[t,i],l=Math.floor((t+i)/2),{caps:u,gold:d,silver:p,both:m,ok:h}=g(l);s+=f*3,h?[o,i]=[l,l-1]:t=l+1;let _=h?x.pass:x.fail;e.step({title:`mid = ${l}시간 → 배열 4개 생성·합산 (${h?`가능`:`부족`})`,codeHighlights:_,work:s,variables:{left:t,right:i,mid:l,caps:`[${u.join(`, `)}]`,gold:d,silver:p,both:m,answer:o}}),e.phase(`가운데 고르기`,`mid = ⌊(${r} + ${c}) ÷ 2⌋ = ${l}시간을 검사합니다.`,x.mid),e.do(...a(I(e,l,`mid ${l}`,`current`))),e.phase(`배열 생성·합산`,`도시 배열을 여러 번 순회해 금(${d}), 은(${p}), 합계(${m}) 배열을 따로 만들고 합산합니다.`,x.arrays),e.do(...a(L(l))),e.phase(`범위 줄이기`,h?`세 합계가 모두 목표 이상이므로 answer = ${n(l)} 갱신하고 right = ${n(i)} 줄입니다.`:`부족하므로 left = ${n(t)} 올립니다.`,_);let[v,y,b]=P(t,i);e.do(...a([N(e,v),N(e,h?b:y),...h?[N(e,F(o))]:[]]))}return e.step({title:`최소 시간 ${o}시간 (정석보다 3배 순회 + O(N) 메모리)`,codeHighlights:x.done,work:s,variables:{answer:o,"확인 횟수":s},answer:o,isKeyframe:!0}),e.phase(`정답`,`답은 ${o}시간으로 같지만, 매 검사마다 길이 10만짜리 배열 4개를 새로 만들고 따로 합산해 시간과 메모리를 더 씁니다.`,x.done),e.do(...a([{type:`remove`,id:`answer`},...I(e,o,`answer ${o}`,`path`),{type:`remove`,id:`range`},...L(o)])),e.finish()}function B(){let e=new r(M()),[t,i]=[0,p],u=i,d=0;for(e.step({title:`함정: 도시마다 무조건 금을 먼저 채우는 그리디 판정`,codeHighlights:C.start,work:d,variables:{left:t,right:i,answer:u}}),e.phase(`시작`,`합계 부등식을 쓰는 대신, 각 도시에서 금을 먼저 최대한 싣고 남은 용량으로만 은을 싣는 그리디 판정을 시도합니다.`,C.start),e.do(...a([...P(t,i).map(t=>N(e,t)),N(e,F(u)),{type:`set`,id:`lbl:m`,patch:{text:`합계 미사용`,tone:`muted`}}]));t<=i;){let[r,p]=[t,i],m=Math.floor((t+i)/2),{caps:h,gold:g,silver:v,ok:y}=_(m);d+=f,y?[u,i]=[m,m-1]:t=m+1;let b=y?C.pass:C.fail;e.step({title:`mid = ${m}시간 → 그리디 금 ${g}, 은 ${v} (${y?`통과`:`실패`})`,codeHighlights:b,work:d,variables:{left:t,right:i,mid:m,"그리디 금":g,"그리디 은":v,answer:u}}),e.phase(`가운데 고르기`,`mid = ⌊(${r} + ${p}) ÷ 2⌋ = ${m}시간을 확인합니다.`,C.mid),e.do(...a(I(e,m,`mid ${m}`,`current`))),e.phase(`그리디 배분`,m===15?`15시간에 도시 0(한도 30)이 금 30을 먼저 다 실어 버려 은을 0밖에 못 싣습니다! 그 바람에 은 합계가 ${v} < ${s}이 되어 가능한 15시간을 불가능하다고 잘못 판정합니다.`:`금을 먼저 채우니 금 합계는 ${g}, 남은 용량으로 채운 은 합계는 ${v}입니다.`,C.greedy),e.do(...a([...h.map((e,t)=>({type:`set`,id:j(t),patch:{text:`금 ${Math.min(c[t],e)} · 은 ${Math.min(l[t],e-Math.min(c[t],e))}`,tone:`bad`}})),{type:`set`,id:`bar:g`,patch:{fill:Math.min(1,g/o),text:`${g}`,tone:g>=o?`good`:`bad`}},{type:`set`,id:`bar:s`,patch:{fill:Math.min(1,v/s),text:`${v}`,tone:v>=s?`good`:`bad`}}])),e.phase(`범위 줄이기`,y?`그리디 판정을 통과해 answer = ${n(m)} 줄입니다.`:`은이 부족하다고 착각해 left = ${n(t)} 올려 버립니다.`,b);let[x,S,w]=P(t,i);e.do(...a([N(e,x),N(e,y?w:S),...y?[N(e,F(u))]:[]]))}return e.step({title:`오답 ${u}시간 반환 (실제 최소 시간은 15시간)`,codeHighlights:C.done,work:d,variables:{"함정 답":u,"실제 정답":15},answer:u,isKeyframe:!0}),e.phase(`오답 확인`,`도시 0에서 금과 은의 비율을 조절하면 15시간에 끝낼 수 있는데, 금부터 무조건 채운 탓에 ${u}시간이라는 오답을 냈습니다.`,C.done),e.do(...a([{type:`set`,id:`answer`,patch:{text:`오답 ${u}`,tone:`bad`}},...I(e,15,`정답 15`,`path`),{type:`remove`,id:`range`}])),e.finish()}var V={id:`gold-silver`,title:`금과 은 운반하기`,level:3,category:`binary-search`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/86053`,description:{summary:`새 도시를 짓기 위해 금 a kg과 은 b kg이 필요합니다. 각 도시마다 보유한 금·은의 양과 전용 트럭의 적재 한도 w[i], 편도 이동 시간 t[i]가 주어질 때, 금 a kg과 은 b kg을 모두 운반할 수 있는 가장 빠른 시간을 구합니다.`,rules:[`a, b는 0 이상 10^9 이하의 정수입니다.`,`도시의 수(g, s, w, t의 길이)는 1 이상 100,000 이하입니다.`,`w[i]는 1 이상 100 이하, t[i]는 1 이상 100,000 이하의 자연수입니다.`,`트럭은 새 도시로 갈 때는 편도 t[i]시간, 돌아올 때도 t[i]시간이 걸리며 금과 은을 동시에 실을 수 있습니다.`],examples:[{input:`a = 10, b = 10, g = [100], s = [100], w = [7], t = [10]`,output:`50`},{input:`a = 90, b = 500, g = [70, 70, 0], s = [0, 0, 500], w = [100, 100, 2], t = [4, 8, 1]`,output:`499`}]},keyIntuitions:[`시간 T가 정해지면 i번 트럭의 편도 운반 횟수는 ⌊(T + t[i]) ÷ (2 × t[i])⌋회이고, 최대 운반 무게는 cap = 횟수 × w[i]입니다.`,`각 도시에서 금과 은을 어떤 비율로 섞어 실을지 일일이 정할 필요 없이, "금 최대합 ≥ a", "은 최대합 ≥ b", "금+은 합계 최대합 ≥ a + b" 세 부등식이 동시에 성립하는지만 확인하면 됩니다.`,`시간이 늘어날수록 세 최대합이 모두 단조 증가하므로, 세 부등식을 모두 만족하는 최소 시간을 이분 탐색으로 찾습니다.`],demo:{input:[o,s,c,l,u,d],label:`a = 30, b = 30, g = [30, 30, 0], s = [30, 0, 20], w = [10, 10, 10], t = [3, 7, 4]`},workUnit:`도시별 운반량 계산 횟수`,approaches:[{id:`gold-silver-binary`,name:`시간을 이분 탐색`,rank:`BEST`,timeComplexity:`O(N log(maxT))`,spaceComplexity:`O(1)`,verdict:`시간 T를 정해 두고 금 최대합·은 최대합·합계 최대합 세 부등식을 한 번의 순회로 판정하는 정석 풀이입니다.`,pros:[`도시마다 금과 은을 몇 kg씩 나눌지 배분하지 않고도 세 부등식만으로 가능 여부를 완벽히 판정합니다.`,`변수 3개만 누적하므로 추가 메모리가 O(1)이고, 약 50번 안팎의 이분 탐색으로 끝납니다.`],cons:[`세 부등식(금, 은, 금+은 합계)이 왜 필요충분조건인지 떠올려야 합니다.`,`최악의 경우 답이 약 4 × 10¹⁴까지 커질 수 있어 상한을 충분히 크게 잡아야 합니다.`],whyThisRank:`트럭마다 금·은 적재 비율이 연속적으로 조절 가능하므로(정수 단위도 동일), 구간 합 조건(할의 결혼 정리·네트워크 플로우 조건)으로 바꾸면 O(N) 판정과 이분 탐색으로 풀립니다.`,code:v,visualize:R},{id:`gold-silver-array-binary`,name:`항목별 운반 배열을 따로 만들어 합산하는 이분 탐색`,rank:`ALTERNATIVE`,timeComplexity:`O(N log(maxT))`,spaceComplexity:`O(N)`,verdict:`같은 세 부등식 이분 탐색이지만 검사마다 도시별 한도·금·은·합계 배열을 따로 만들고 합산해 시간과 메모리를 더 씁니다.`,pros:[`각 배열의 의미(도시별 운반 한도, 금 최대량, 은 최대량, 합계 최대량)가 분리되어 있어 디버깅하기 쉽습니다.`],cons:[`도시가 최대 10만 개이므로 이분 탐색 단계마다 길이 10만짜리 배열 4개를 새로 만들고 여러 번 순회합니다.`],whyThisRank:`정답은 정확히 구하지만, 한 번의 루프와 변수 3개로 끝낼 수 있는 계산을 배열 4개 생성과 반복 합산으로 나누어 상수 시간과 메모리에서 손해를 봅니다.`,code:b,visualize:z},{id:`gold-silver-greedy-wrong`,name:`금을 먼저 채우고 남은 용량으로 은을 채우는 그리디`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N log(maxT))`,spaceComplexity:`O(1)`,verdict:`각 도시에서 무조건 금부터 최대한 싣고 남는 트럭 용량으로만 은을 싣는 그리디 판정으로, 오답을 냅니다.`,pros:[`합계 부등식을 생각하지 않고 직관적으로 작성하기 쉽습니다.`],cons:[`금만 있는 도시에서 금을 가져오면 되는데도, 금·은이 모두 있는 도시의 트럭 용량을 금에 다 써 버려 은이 부족하다고 잘못 판정합니다.`],whyThisRank:`가장 흔히 빠지는 오답 함정입니다. 어느 도시가 금을 맡고 어느 도시가 은을 맡을지는 고정된 우선순위로 정할 수 없으므로 반드시 세 부등식(금, 은, 합계)으로 판정해야 합니다.`,code:S,visualize:B}],checks:{cases:[{args:[10,10,[100],[100],[7],[10]],expected:50},{args:[90,500,[70,70,0],[0,0,500],[100,100,2],[4,8,1]],expected:499},{args:[o,s,c,l,u,d],expected:15},{args:[0,0,[10],[10],[5],[3]],expected:0}],random:e=>{let t=2+Math.floor(e()*3),n=Array.from({length:t},()=>Math.floor(e()*30)),r=Array.from({length:t},()=>Math.floor(e()*30)),i=Array.from({length:t},()=>1+Math.floor(e()*10)),a=Array.from({length:t},()=>1+Math.floor(e()*10)),o=n.reduce((e,t)=>e+t,0),s=r.reduce((e,t)=>e+t,0);return[Math.floor(e()*(o+1)),Math.floor(e()*(s+1)),n,r,i,a]}}};export{V as default};