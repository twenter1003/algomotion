import{n as e,o as t}from"./layout-DFaYBMY_.js";import{a as n,c as r,i,o as a,s as o}from"./shared-e6uNbDLo.js";var s=[1,328,467,209,54],c=[2,7,1,4,3],l=1723,u=s.length,d=Math.max(...s),f=(e,t)=>{if(s[e]<=t)return c[e];let n=e>0?c[e-1]:0;return(s[e]-t)*(c[e]+n)+c[e]},p=e=>s.map((t,n)=>f(n,e)),m={python:`def solution(diffs, times, limit):
    def can_clear(level):
        total = 0
        for i in range(len(diffs)):
            if diffs[i] <= level:
                total += times[i]
            else:
                mistakes = diffs[i] - level
                total += mistakes * (times[i] + times[i - 1]) + times[i]
            if total > limit:  # 제한 시간을 넘으면 바로 중단
                return False
        return True

    left, right = 1, max(diffs)
    answer = right
    while left <= right:
        mid = (left + right) // 2
        if can_clear(mid):     # 제한 시간 안에 통과 → 숙련도를 더 낮춰 본다
            answer = mid
            right = mid - 1
        else:                  # 시간 초과 → 숙련도를 높인다
            left = mid + 1
    return answer`,javascript:`function solution(diffs, times, limit) {
  const canClear = (level) => {
    let total = 0;
    for (let i = 0; i < diffs.length; i++) {
      if (diffs[i] <= level) {
        total += times[i];
      } else {
        const mistakes = diffs[i] - level;
        total += mistakes * (times[i] + times[i - 1]) + times[i];
      }
      if (total > limit) return false; // 제한 시간을 넘으면 바로 중단
    }
    return true;
  };

  let left = 1;
  let right = diffs.reduce((a, b) => Math.max(a, b), 1);
  let answer = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (canClear(mid)) { // 제한 시간 안에 통과 → 숙련도를 더 낮춰 본다
      answer = mid;
      right = mid - 1;
    } else { // 시간 초과 → 숙련도를 높인다
      left = mid + 1;
    }
  }
  return answer;
}`},h={start:i(m,[`left, right = 1, max(diffs)`,`answer = right`],[`let left = 1`,`let right = diffs.reduce`,`let answer = right`]),mid:i(m,[`while left <= right`,`mid = (left + right) // 2`],[`while (left <= right)`,`const mid = Math.floor`]),calc:e=>i(m,[`for i in range(len(diffs))`,`if diffs[i] <= level`,`mistakes = diffs[i] - level`,e?`return False`:`return True`],[`for (let i = 0; i < diffs.length; i++)`,`if (diffs[i] <= level)`,`const mistakes = diffs[i] - level`,e?`if (total > limit) return false`:`return true`]),pass:i(m,[`if can_clear(mid)`,`answer = mid`,`right = mid - 1`],[`if (canClear(mid))`,`answer = mid`,`right = mid - 1`]),fail:i(m,[`if can_clear(mid)`,`else:`,`left = mid + 1`],[`if (canClear(mid))`,`} else {`,`left = mid + 1`]),done:i(m,[`while left <= right`,`return answer`],[`while (left <= right)`,`return answer`])},g={python:`def solution(diffs, times, limit):
    left, right = 1, max(diffs)
    answer = right
    while left <= right:
        mid = (left + right) // 2
        # 검사마다 퍼즐별 소요 시간 배열을 새로 만들어 합산
        spent = [
            times[i] if diffs[i] <= mid
            else (diffs[i] - mid) * (times[i] + times[i - 1]) + times[i]
            for i in range(len(diffs))
        ]
        if sum(spent) <= limit:
            answer = mid
            right = mid - 1
        else:
            left = mid + 1
    return answer`,javascript:`function solution(diffs, times, limit) {
  let left = 1;
  let right = diffs.reduce((a, b) => Math.max(a, b), 1);
  let answer = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // 검사마다 퍼즐별 소요 시간 배열을 새로 만들어 합산
    const spent = diffs.map((d, i) =>
      d <= mid ? times[i] : (d - mid) * (times[i] + times[i - 1]) + times[i],
    );
    const total = spent.reduce((a, b) => a + b, 0);
    if (total <= limit) {
      answer = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return answer;
}`},_={start:i(g,[`left, right = 1, max(diffs)`,`answer = right`],[`let left = 1`,`let right = diffs.reduce`,`let answer = right`]),mid:i(g,[`while left <= right`,`mid = (left + right) // 2`],[`while (left <= right)`,`const mid = Math.floor`]),build:i(g,[`spent = [`,`times[i] if diffs[i] <= mid`],[`const spent = diffs.map`,`d <= mid ? times[i]`]),sum:i(g,[`if sum(spent) <= limit:`],[`const total = spent.reduce`,`if (total <= limit)`]),pass:i(g,[`if sum(spent) <= limit:`,`answer = mid`,`right = mid - 1`],[`if (total <= limit)`,`answer = mid`,`right = mid - 1`]),fail:i(g,[`if sum(spent) <= limit:`,`else:`,`left = mid + 1`],[`if (total <= limit)`,`} else {`,`left = mid + 1`]),done:i(g,[`while left <= right`,`return answer`],[`while (left <= right)`,`return answer`])},v={python:`def solution(diffs, times, limit):
    level = 1
    while True:
        total = 0
        for i in range(len(diffs)):
            if diffs[i] <= level:
                total += times[i]
            else:
                total += (diffs[i] - level) * (times[i] + times[i - 1]) + times[i]
        if total <= limit:
            return level
        level += 1  # 숙련도가 최대 10만이면 10만 번 반복`,javascript:`function solution(diffs, times, limit) {
  let level = 1;
  while (true) {
    let total = 0;
    for (let i = 0; i < diffs.length; i++) {
      if (diffs[i] <= level) {
        total += times[i];
      } else {
        total += (diffs[i] - level) * (times[i] + times[i - 1]) + times[i];
      }
    }
    if (total <= limit) return level;
    level++; // 숙련도가 최대 10만이면 10만 번 반복
  }
}`},y={start:i(v,[`level = 1`],[`let level = 1`]),calc:i(v,[`for i in range(len(diffs))`,`if diffs[i] <= level`,`if total <= limit`],[`for (let i = 0; i < diffs.length; i++)`,`if (diffs[i] <= level)`,`if (total <= limit)`]),next:i(v,[`level += 1`],[`level++`]),loop:i(v,[`while True:`,`for i in range(len(diffs))`,`level += 1`],[`while (true)`,`for (let i = 0; i < diffs.length; i++)`,`level++`]),done:i(v,[`if total <= limit:`,`return level`],[`if (total <= limit) return level`])},b=620,x=326,S={x:0,y:0,w:b,h:x},C=e({x:88,w:444,min:1,max:d}),w=t({x:38,y:146,w:102,h:56,gap:14}),T=t({x:38,y:208,w:102,h:24,gap:14}),E=262,D=e=>`puzzle:${e}`,O=e=>`cost:${e}`;function k(){let e=[{id:`track`,kind:`line`,rect:S,tone:`trail`,points:[[C(1),104],[C(d),104]]}];return s.forEach((t,n)=>{e.push({id:D(n),kind:`cell`,rect:w(n),tone:`plain`,text:`난이도 ${t}`,sub:`시간 ${c[n]}`,tag:`#${n+1}`},{id:O(n),kind:`text`,rect:T(n),tone:`muted`,text:`-`})}),e.push({id:`sum:label`,kind:`text`,rect:{x:24,y:E,w:68,h:36},text:`총 시간`},{id:`tally`,kind:`bar`,rect:{x:96,y:E,w:340,h:36},fill:0,text:`0`},{id:`goal`,kind:`token`,rect:{x:448,y:E,w:132,h:36},tone:`plain`,text:`limit ${l}`,tag:`제한`}),{width:b,height:x,items:e}}var A=(e,{id:t,kind:n,...r})=>e.has(t)?{type:`set`,id:t,patch:r}:{type:`add`,item:{id:t,kind:n,...r}},j=(e,t)=>[{id:`range`,kind:`zone`,rect:{x:C(e-.5),y:92,w:C(t+.5)-C(e-.5),h:24}},{id:`left`,kind:`token`,rect:{x:C(e-.5)-78,y:30,w:78,h:24},tone:`plain`,text:`left ${e}`},{id:`right`,kind:`token`,rect:{x:C(t+.5),y:30,w:82,h:24},tone:`plain`,text:`right ${t}`}],M=e=>({id:`answer`,kind:`token`,rect:{x:C(e)-46,y:0,w:92,h:24},tone:`path`,text:`answer ${e}`}),N=(e,t,n,r)=>[A(e,{id:`probe`,kind:`token`,rect:{x:C(t)-2,y:88,w:4,h:32},tone:r}),A(e,{id:`probe:label`,kind:`token`,rect:{x:C(t)-46,y:60,w:92,h:26},tone:r,text:n})];function P(e,t=u){let n=p(e),r=a(n.slice(0,t)),i=r<=l;return[...s.map((n,r)=>({type:`set`,id:D(r),patch:{tone:r>=t?`muted`:n<=e?`visited`:`bad`}})),...n.map((n,r)=>({type:`set`,id:O(r),patch:{text:r>=t?`생략`:s[r]<=e?`${n}`:`틀림 ${s[r]-e}회→${n}`,tone:r>=t?`muted`:s[r]<=e?`good`:`bad`}})),{type:`set`,id:`tally`,patch:{fill:Math.min(1,r/l),text:`${r}`,tone:i?`good`:`bad`}}]}function F(){let e=new r(k()),[t,i]=[1,d],s=i,c=0,m=0;for(e.step({title:`숙련도 탐색 구간 1 ~ ${d} 정하기`,codeHighlights:h.start,work:m,variables:{left:t,right:i,answer:s,limit:l}}),e.phase(`시작`,`숙련도가 가장 어려운 퍼즐 난이도(${d}) 이상이면 한 번도 틀리지 않으므로 탐색 구간을 1 ~ ${n(d)} 잡습니다.`,h.start),e.do(...o([...j(t,i).map(t=>A(e,t)),A(e,M(s))]));t<=i;){let[r,a]=[t,i];c=Math.floor((t+i)/2);let d=0,p=0;for(let e=0;e<u&&(d+=f(e,c),p++,!(d>l));e++);m+=p;let g=d<=l;g?[s,i]=[c,c-1]:t=c+1;let _=g?h.pass:h.fail;e.step({title:`mid = ${c} → 시간 ${d} (${g?`통과, 더 낮게`:`초과, 더 높게`})`,codeHighlights:_,work:m,variables:{left:t,right:i,mid:c,"확인 퍼즐":`${p}개`,total:d,answer:s}}),e.phase(`가운데 고르기`,`mid = ⌊(${r} + ${a}) ÷ 2⌋ = ${c}입니다. 숙련도 ${c}로 제한 시간 ${l} 안에 풀 수 있는지 확인합니다.`,h.mid),e.do(...o(N(e,c,`mid ${c}`,`current`))),e.phase(`시간 세기`,g?`퍼즐 5개의 소요 시간을 더하면 ${d} ≤ ${l}이라 제한 시간 안에 모두 해결합니다.`:`${p}번째 퍼즐까지 더했을 때 이미 ${d} > ${l}이 되어 뒤 퍼즐은 보지 않고 멈춥니다.`,h.calc(!g)),e.do(...o(P(c,p))),e.phase(`범위 줄이기`,g?`제한 시간 안에 풀었으므로 answer = ${n(c)} 저장하고 더 낮은 숙련도를 보려고 right = ${n(i)} 줄입니다.`:`시간이 초과되므로 숙련도를 높여야 합니다. left = ${n(t)} 올립니다.`,_);let[v,y,b]=j(t,i);e.do({type:`arrow`,from:`tally`,to:`goal`,verdict:g?`good`:`bad`,label:g?`통과`:`초과`}),e.do(...o([A(e,v),A(e,g?b:y),...g?[A(e,M(s))]:[]])),e.do({type:`clearMarks`})}let g=a(p(s));return e.step({title:`최소 숙련도 ${s} 확정 (소요 시간 ${g})`,codeHighlights:h.done,work:m,variables:{answer:s,"총 소요 시간":g,limit:l,"확인 횟수":m},answer:s,isKeyframe:!0}),e.phase(`정답`,`이분 탐색 9번(퍼즐 확인 ${m}회) 만에 최소 숙련도 ${s}을 찾았습니다. 숙련도 ${s}일 때 총 소요 시간은 ${g} ≤ ${l}입니다.`,h.done),e.do(...o([{type:`remove`,id:`answer`},...N(e,s,`answer ${s}`,`path`),{type:`remove`,id:`range`},{type:`set`,id:`left`,patch:{tone:`muted`}},{type:`set`,id:`right`,patch:{tone:`muted`}},...P(s,u)])),e.finish()}function I(){let e=new r(k()),[t,i]=[1,d],s=i,c=0,f=0;for(e.step({title:`숙련도 탐색 구간 1 ~ ${d} 정하기 (배열 생성 방식)`,codeHighlights:_.start,work:f,variables:{left:t,right:i,answer:s,limit:l}}),e.phase(`시작`,`정석과 같은 이분 탐색이지만, 검사마다 퍼즐별 시간 배열 spent를 새로 만들고 합산합니다.`,_.start),e.do(...o([...j(t,i).map(t=>A(e,t)),A(e,M(s))]));t<=i;){let[r,d]=[t,i];c=Math.floor((t+i)/2);let m=p(c),h=a(m);f+=u*2;let g=h<=l;g?[s,i]=[c,c-1]:t=c+1;let v=g?_.pass:_.fail;e.step({title:`mid = ${c} → spent 배열 합 ${h}`,codeHighlights:v,work:f,variables:{left:t,right:i,mid:c,spent:`[${m.join(`, `)}]`,total:h,answer:s}}),e.phase(`가운데 고르기`,`mid = ⌊(${r} + ${d}) ÷ 2⌋ = ${c}입니다.`,_.mid),e.do(...o(N(e,c,`mid ${c}`,`current`))),e.phase(`배열 생성·합산`,`조기 중단 없이 5개 퍼즐의 소요 시간 배열 [${m.join(`, `)}]을 끝까지 만들고 다시 더합니다 (합계 ${h}).`,_.build),e.do(...o(P(c,u))),e.phase(`범위 줄이기`,g?`${h} ≤ ${l}이므로 answer = ${n(c)} 갱신하고 right = ${n(i)} 줄입니다.`:`${h} > ${l}이므로 left = ${n(t)} 높입니다.`,v);let[y,b,x]=j(t,i);e.do(...o([A(e,y),A(e,g?x:b),...g?[A(e,M(s))]:[]]))}let m=a(p(s));return e.step({title:`최소 숙련도 ${s} (정석보다 배열 생성·합산 비용 추가)`,codeHighlights:_.done,work:f,variables:{answer:s,"총 소요 시간":m,"확인 횟수":f},answer:s,isKeyframe:!0}),e.phase(`정답`,`답은 ${s}로 같지만, 매번 길이 N 배열을 새로 만들고 끝까지 합산해 정석보다 많은 ${f}번의 연산과 O(N) 메모리를 씁니다.`,_.done),e.do(...o([{type:`remove`,id:`answer`},...N(e,s,`answer ${s}`,`path`),{type:`remove`,id:`range`},...P(s,u)])),e.finish()}var L=4;function R(){let e=new r(k()),t=1;for(;a(p(t))>l;)t++;let n=t-1,i=0;e.step({title:`숙련도 1부터 1씩 높여 가며 확인 시작`,codeHighlights:y.start,work:i,variables:{level:1,limit:l}}),e.phase(`시작`,`숙련도를 1부터 1씩 올려 가며, 총 소요 시간이 ${l} 이하가 되는 첫 순간을 찾습니다.`,y.start),e.do(...o(N(e,1,`level 1`,`current`)));for(let t=1;t<=L;t++){let n=a(p(t));i+=u,e.step({title:`level = ${t} → 시간 ${n} (초과)`,codeHighlights:y.calc,work:i,variables:{level:t,total:n,limit:l}}),e.phase(`1씩 올리기`,t===1?`level = 1일 때를 확인합니다.`:`숙련도를 1 올려 level = ${t}을 확인합니다.`,t===1?y.start:y.next),e.do(...o(N(e,t,`level ${t}`,`current`))),e.phase(`시간 세기`,`퍼즐 5개를 푸는 데 총 ${n}이 걸려 제한 시간 ${l}을 넘깁니다.`,y.calc),e.do(...o(P(t,u)))}i=n*u;let s=a(p(n));e.step({title:`level = 5 ~ ${n} 빨리 감기`,codeHighlights:y.loop,work:i,variables:{level:n,total:s,"누적 확인":i}}),e.phase(`빨리 감기`,`숙련도 5부터 ${n}까지 ${n-L}번을 1씩 올리며 똑같이 계산합니다. level = ${n}에서도 ${s} > ${l}이라 부족합니다.`,y.loop),e.do(...o([...N(e,n,`level ${n}`,`current`),...P(n,u)])),i=t*u;let c=a(p(t));return e.step({title:`level = ${t} → 시간 ${c} ≤ ${l}, 정답`,codeHighlights:y.done,work:i,variables:{level:t,total:c,"누적 확인":i},answer:t,isKeyframe:!0}),e.phase(`1씩 올리기`,`숙련도를 1 더 올려 level = ${t}을 확인합니다.`,y.next),e.do(...o(N(e,t,`level ${t}`,`current`))),e.phase(`정답`,`총 시간이 ${c} ≤ ${l}이 되어 멈춥니다. 답은 맞지만 퍼즐을 ${i}번이나 계산했습니다. 난이도가 10만, 퍼즐이 30만 개면 3×10¹⁰번 반복해 시간 초과입니다.`,y.done),e.do(...o([...N(e,t,`level ${t}`,`path`),...P(t,u)])),e.finish()}var z={id:`puzzle-challenge`,title:`퍼즐 게임 챌린지`,level:2,category:`binary-search`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/340212`,description:{summary:`n개의 퍼즐을 순서대로 풀 때, 퍼즐 난이도가 내 숙련도(level)보다 높으면 차이(diffs[i] - level)만큼 틀리며 매번 현재 퍼즐과 이전 퍼즐을 다시 풀어야 합니다. 전체 제한 시간(limit) 안에 모든 퍼즐을 풀기 위한 최소 숙련도를 구합니다.`,rules:[`diffs와 times의 길이는 1 이상 300,000 이하이며 diffs[0] = 1입니다.`,`diffs[i]는 1 이상 100,000 이하, times[i]는 1 이상 10,000 이하의 자연수입니다.`,`diffs[i] > level이면 (diffs[i] - level) × (times[i] + times[i - 1]) + times[i]만큼 시간이 걸립니다.`,`제한 시간 limit은 1 이상 10^15 이하이며, 항상 해결 가능한 입력만 주어집니다.`],examples:[{input:`diffs = [1, 5, 3], times = [2, 4, 7], limit = 30`,output:`3`},{input:`diffs = [1, 4, 4, 2], times = [6, 3, 8, 2], limit = 59`,output:`2`},{input:`diffs = [1, 328, 467, 209, 54], times = [2, 7, 1, 4, 3], limit = 1723`,output:`294`}]},keyIntuitions:[`숙련도(level)가 높아질수록 각 퍼즐에서 틀리는 횟수가 줄어들어 총 소요 시간이 단조 감소합니다.`,`숙련도가 정해지면 전체 소요 시간은 한 번의 순회 O(N)으로 바로 계산할 수 있습니다.`,`최소 숙련도는 1, 최대 숙련도는 max(diffs)(최대 100,000)이므로 이분 탐색을 쓰면 최대 17번의 검사로 답을 찾습니다.`],demo:{input:[s,c,l],label:`diffs = [1, 328, 467, 209, 54], times = [2, 7, 1, 4, 3], limit = 1723`},workUnit:`퍼즐 소요 시간 계산 횟수`,approaches:[{id:`puzzle-binary`,name:`숙련도를 이분 탐색`,rank:`BEST`,timeComplexity:`O(N log(maxDiff))`,spaceComplexity:`O(1)`,verdict:`숙련도 구간 [1, max(diffs)]를 반씩 좁히며, 누적 시간이 limit을 넘는 순간 조기 중단해 빠르게 판정합니다.`,pros:[`난이도가 최대 100,000이므로 log₂(100,000) ≈ 17번 안팎의 검사로 끝납니다.`,`배열을 새로 만들지 않고 변수 하나로 합산하며 limit 초과 시 바로 멈춰 불필요한 계산을 줄입니다.`],cons:[`탐색 왼쪽 끝을 0으로 잡으면 문제 조건(양의 정수 숙련도)을 어겨 오답이 나올 수 있으니 left = 1로 시작해야 합니다.`],whyThisRank:`숙련도가 높을수록 소요 시간이 줄어드는 단조성이 뚜렷하고, 판정 함수를 O(1) 추가 메모리와 조기 중단으로 가장 가볍게 구현할 수 있습니다.`,code:m,visualize:F},{id:`puzzle-array-binary`,name:`퍼즐별 소요 시간 배열을 만들어 합산하는 이분 탐색`,rank:`ALTERNATIVE`,timeComplexity:`O(N log(maxDiff))`,spaceComplexity:`O(N)`,verdict:`같은 이분 탐색이지만 검사마다 퍼즐별 시간 배열을 통째로 만든 뒤 합산해 시간과 메모리를 더 씁니다.`,pros:[`퍼즐마다 걸리는 시간을 배열로 만든 뒤 sum()으로 더하므로 식이 한눈에 보입니다.`],cons:[`검사마다 길이 30만짜리 배열을 새로 할당해 O(N) 메모리를 쓰고, 앞에서 이미 limit을 넘어도 끝까지 계산한 뒤 다시 합산합니다.`],whyThisRank:`시간 복잡도 차수는 같지만, 매 검사마다 배열 생성과 전체 합산으로 두 번씩 훑어 정석보다 상수 시간과 메모리를 손해 봅니다.`,code:g,visualize:I},{id:`puzzle-linear`,name:`숙련도를 1부터 1씩 높여 보기`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(maxDiff × N)`,spaceComplexity:`O(1)`,verdict:`숙련도를 1, 2, 3… 하나씩 올리며 제한 시간 안에 들어오는지 매번 처음부터 계산합니다.`,pros:[`이분 탐색 없이 단순 반복문만으로 작성할 수 있습니다.`],cons:[`답이 100,000 근처이고 퍼즐이 30만 개면 최대 3 × 10¹⁰번 계산해야 해서 시간 초과가 납니다.`],whyThisRank:`소요 시간이 숙련도에 따라 단조 감소한다는 성질을 버리고 1씩 확인하는 풀이입니다. 같은 판정 식을 이분 탐색으로 감싸면 정석이 됩니다.`,code:v,visualize:R}],checks:{cases:[{args:[[1,5,3],[2,4,7],30],expected:3},{args:[[1,4,4,2],[6,3,8,2],59],expected:2},{args:[s,c,l],expected:294},{args:[[1],[10],10],expected:1},{args:[[1,10],[2,3],5],expected:10}],random:e=>{let t=2+Math.floor(e()*5),n=[1,...Array.from({length:t-1},()=>1+Math.floor(e()*25))],r=Array.from({length:t},()=>1+Math.floor(e()*8)),i=1+Math.floor(e()*25);return[n,r,n.reduce((e,t,n)=>e+(t<=i?r[n]:(t-i)*(r[n]+r[n-1])+r[n]),0)]}}};export{z as default};