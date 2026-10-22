import{o as e}from"./layout-DFaYBMY_.js";import{c as t,i as n,r,s as i}from"./shared-e6uNbDLo.js";var a=[1,2,3,4,5,8],o=15,s=a.length,c={python:`import heapq

def solution(scoville, K):
    heap = list(scoville)
    heapq.heapify(heap)  # 최소 힙으로 만들기
    answer = 0

    while heap[0] < K:
        if len(heap) < 2:
            return -1
        first = heapq.heappop(heap)
        second = heapq.heappop(heap)
        mixed = first + second * 2
        heapq.heappush(heap, mixed)
        answer += 1

    return answer`,javascript:`function solution(scoville, K) {
  const heap = [...scoville];
  const siftDown = (i) => {
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      let m = i;
      if (l < heap.length && heap[l] < heap[m]) m = l;
      if (r < heap.length && heap[r] < heap[m]) m = r;
      if (m === i) return;
      [heap[i], heap[m]] = [heap[m], heap[i]];
      i = m;
    }
  };
  for (let i = heap.length >> 1; i >= 0; i--) siftDown(i); // 최소 힙으로 만들기
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) { heap[0] = last; siftDown(0); }
    return top;
  };
  const push = (v) => {
    heap.push(v);
    for (let i = heap.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };

  let answer = 0;
  while (heap[0] < K) {
    if (heap.length < 2) return -1;
    const first = pop();
    const second = pop();
    const mixed = first + second * 2;
    push(mixed);
    answer++;
  }
  return answer;
}`},l={init:n(c,[`heap = list(scoville)`,`heapq.heapify(heap)`,`answer = 0`],[`const heap = [...scoville]`,`for (let i = heap.length >> 1`,`let answer = 0`]),check:n(c,[`while heap[0] < K`],[`while (heap[0] < K)`]),pop:n(c,[`first = heapq.heappop(heap)`,`second = heapq.heappop(heap)`],[`const first = pop()`,`const second = pop()`]),mix:n(c,[`mixed = first + second * 2`],[`const mixed = first + second * 2`]),push:n(c,[`heapq.heappush(heap, mixed)`,`answer += 1`],[`push(mixed)`,`answer++`]),done:n(c,[`while heap[0] < K`,`return answer`],[`while (heap[0] < K)`,`return answer`])},u={python:`def solution(scoville, K):
    arr = sorted(scoville)
    answer = 0

    while arr[0] < K:
        if len(arr) < 2:
            return -1
        first = arr.pop(0)
        second = arr.pop(0)
        arr.append(first + second * 2)
        arr.sort()  # 섞을 때마다 배열 전체를 다시 정렬
        answer += 1

    return answer`,javascript:`function solution(scoville, K) {
  const arr = [...scoville].sort((a, b) => a - b);
  let answer = 0;

  while (arr[0] < K) {
    if (arr.length < 2) return -1;
    const first = arr.shift();
    const second = arr.shift();
    arr.push(first + second * 2);
    arr.sort((a, b) => a - b); // 섞을 때마다 배열 전체를 다시 정렬
    answer++;
  }
  return answer;
}`},d={init:n(u,[`arr = sorted(scoville)`,`answer = 0`],[`const arr = [...scoville].sort`,`let answer = 0`]),pop:n(u,[`while arr[0] < K`,`first = arr.pop(0)`,`second = arr.pop(0)`],[`while (arr[0] < K)`,`const first = arr.shift()`,`const second = arr.shift()`]),sort:n(u,[`arr.append(first + second * 2)`,`arr.sort()`,`answer += 1`],[`arr.push(first + second * 2)`,`arr.sort((a, b) => a - b)`,`answer++`]),done:n(u,[`while arr[0] < K`,`return answer`],[`while (arr[0] < K)`,`return answer`])},f={python:`def solution(scoville, K):
    arr = sorted(scoville)  # 처음 한 번만 정렬
    cur = arr[0]
    answer = 0

    for i in range(1, len(arr)):
        if cur >= K:
            return answer
        # 새로 섞은 cur가 다음 원소보다 클 수 있는데도 그대로 앞에서부터 섞는다
        cur = cur + arr[i] * 2
        answer += 1

    return answer if cur >= K else -1`,javascript:`function solution(scoville, K) {
  const arr = [...scoville].sort((a, b) => a - b); // 처음 한 번만 정렬
  let cur = arr[0];
  let answer = 0;

  for (let i = 1; i < arr.length; i++) {
    if (cur >= K) return answer;
    // 새로 섞은 cur가 다음 원소보다 클 수 있는데도 그대로 앞에서부터 섞는다
    cur = cur + arr[i] * 2;
    answer++;
  }
  return cur >= K ? answer : -1;
}`},p={init:n(f,[`arr = sorted(scoville)`,`cur = arr[0]`,`answer = 0`],[`const arr = [...scoville].sort`,`let cur = arr[0]`,`let answer = 0`]),check:n(f,[`for i in range(1, len(arr))`,`if cur >= K`],[`for (let i = 1; i < arr.length; i++)`,`if (cur >= K)`]),mix:n(f,[`cur = cur + arr[i] * 2`,`answer += 1`],[`cur = cur + arr[i] * 2`,`answer++`]),done:n(f,[`if cur >= K`,`return answer`],[`if (cur >= K) return answer`])},m=540,h=280,g=e({x:88,y:24,w:62,h:48,gap:10}),_={x:112,y:120,w:80,h:48},v={x:224,y:120,w:80,h:48},y={x:364,y:120,w:96,h:48},b={x:88,y:214,w:128,h:40},x={x:232,y:214,w:136,h:40},S={x:384,y:214,w:120,h:40};function C(e){return{width:m,height:h,items:[{id:`lab:row`,kind:`text`,rect:{x:0,y:24,w:80,h:48},text:e},{id:`row:zone`,kind:`zone`,rect:{x:82,y:18,w:444,h:60}},{id:`lab:mix`,kind:`text`,rect:{x:0,y:120,w:80,h:48},text:`섞기 작업대`},{id:`slot:a`,kind:`zone`,rect:_,tag:`가장 안 매움`},{id:`plus`,kind:`text`,rect:{x:194,y:120,w:28,h:48},text:`+`},{id:`slot:b`,kind:`zone`,rect:v,tag:`둘째 × 2`},{id:`eq`,kind:`text`,rect:{x:308,y:120,w:52,h:48},text:`→`},{id:`slot:out`,kind:`zone`,rect:y,tag:`새 음식`},{id:`goal`,kind:`token`,rect:b,tone:`plain`,text:`K = ${o}`,tag:`목표 지수`},{id:`min:tok`,kind:`token`,rect:x,tone:`plain`,text:`최솟값 ${a[0]}`,tag:`맨 앞`},{id:`ans:tok`,kind:`token`,rect:S,tone:`plain`,text:`0번 섞음`,tag:`answer`}]}}var w=e=>e>=o?`good`:`queued`,T=e=>e.map((e,t)=>({type:`set`,id:e.id,patch:{rect:g(t),tone:w(e.val),text:String(e.val)}}));function E(){let e=new t(C(`최소 힙`)),n=a.map((e,t)=>({id:`f:${t}`,val:e})),c=0,u=0,d=s,f=(e={})=>({work:u,variables:{heap:`[${n.map(e=>e.val).join(`, `)}]`,K:o,answer:c,...e}});for(u=s,e.step({title:`음식 ${s}개를 최소 힙에 넣기`,codeHighlights:l.init,...f()}),e.phase(`힙 만들기`,`초기 음식 ${s}개를 최소 힙으로 만듭니다. 맨 앞(루트)에는 항상 가장 덜 매운 음식이 옵니다.`,l.init),e.do(...i(n.map((e,t)=>({type:`add`,item:{id:e.id,kind:`cell`,rect:g(t),tone:w(e.val),text:String(e.val)}}))));n[0].val<o;){let t=n.shift(),a=n.shift(),s=t.val+a.val*2,p={id:`f:${d++}`,val:s};c++,u+=2,e.step({title:`${c}번째 꺼내기: ${t.val}, ${a.val} → ${s}`,codeHighlights:l.mix,...f({first:t.val,second:a.val,mixed:s})}),e.phase(`최솟값 확인`,`맨 앞 음식의 지수가 ${t.val} < ${o}이므로 가장 덜 매운 두 음식 ${t.val}, ${r(a.val,`을`,`를`)} 꺼냅니다.`,l.pop),e.do({type:`focus`,ids:[t.id,a.id]}),e.do({type:`arrow`,from:`min:tok`,to:`goal`,verdict:`bad`,label:`${t.val} < ${o}`}),e.do(...i([{type:`unfocus`},{type:`clearMarks`},{type:`set`,id:t.id,patch:{rect:_,tone:`current`}},{type:`set`,id:a.id,patch:{rect:v,tone:`current`}},...T(n)])),e.phase(`섞기`,`${t.val} + ${a.val} × 2 = ${s}인 새 음식을 만듭니다.`,l.mix),e.do(...i([{type:`remove`,id:t.id,into:`slot:out`},{type:`remove`,id:a.id,into:`slot:out`},{type:`add`,item:{id:p.id,kind:`cell`,rect:y,tone:w(s),text:String(s)},from:`slot:b`}])),n.push(p),n.sort((e,t)=>e.val-t.val);let m=n.indexOf(p);u+=1,e.step({title:`${c}번째 넣기: ${r(s,`을`,`를`)} 힙에 넣고 최솟값 ${n[0].val} 확인`,codeHighlights:l.push,...f({first:t.val,second:a.val,mixed:s})}),e.phase(`힙에 넣기`,`새 음식 ${r(s,`을`,`를`)} 힙에 넣으면 부모·자식만 비교해 제자리(${m+1}번째)로 들어갑니다.`,l.push),e.do(...i([...T(n),{type:`set`,id:`min:tok`,patch:{text:`최솟값 ${n[0].val}`,tone:n[0].val>=o?`good`:`plain`},pop:!0},{type:`set`,id:`ans:tok`,patch:{text:`${c}번 섞음`,tone:`chosen`},pop:!0}])),e.phase(`조건 확인`,n[0].val>=o?`이제 맨 앞 최솟값이 ${n[0].val} ≥ ${o}이므로 모든 음식이 ${o} 이상입니다.`:`맨 앞 최솟값이 ${n[0].val} < ${o}이므로 한 번 더 섞어야 합니다.`,l.check),e.do({type:`focus`,ids:[n[0].id]}),e.do({type:`unfocus`})}return e.step({title:`모두 ${o} 이상 달성 → ${c}번`,codeHighlights:l.done,...f(),answer:c,isKeyframe:!0}),e.phase(`정답`,`맨 앞 최솟값이 ${n[0].val} ≥ ${o}이므로 모든 음식이 ${o} 이상입니다. 최소 ${c}번 섞었습니다.`,l.done),e.do({type:`arrow`,from:`min:tok`,to:`goal`,verdict:`good`,label:`${n[0].val} ≥ ${o}`}),e.do(...i([...n.map(e=>({type:`set`,id:e.id,patch:{tone:`path`}})),{type:`set`,id:`ans:tok`,patch:{tone:`path`},pop:!0}])),e.do({type:`clearMarks`}),e.finish()}function D(){let e=new t(C(`정렬 배열`)),n=a.map((e,t)=>({id:`f:${t}`,val:e})),c=0,l=s,u=s,f=(e={})=>({work:l,variables:{arr:`[${n.map(e=>e.val).join(`, `)}]`,K:o,answer:c,...e}});for(e.step({title:`음식 ${s}개를 오름차순 정렬하기`,codeHighlights:d.init,...f()}),e.phase(`정렬하기`,`처음 음식 ${s}개를 오름차순으로 정렬합니다.`,d.init),e.do(...i(n.map((e,t)=>({type:`add`,item:{id:e.id,kind:`cell`,rect:g(t),tone:w(e.val),text:String(e.val)}}))));n[0].val<o;){let t=n.shift(),a=n.shift(),s=t.val+a.val*2,p={id:`f:${u++}`,val:s};n.push(p),n.sort((e,t)=>e.val-t.val),c++,l+=n.length*2,e.step({title:`${c}번째 섞기 후 배열 전체 다시 정렬`,codeHighlights:d.sort,...f({first:t.val,second:a.val,mixed:s})}),e.phase(`꺼내어 섞기`,`맨 앞 두 음식 ${t.val}, ${r(a.val,`을`,`를`)} 꺼내 ${t.val} + ${a.val} × 2 = ${s}로 섞습니다.`,d.pop),e.do(...i([{type:`set`,id:t.id,patch:{rect:_,tone:`current`}},{type:`set`,id:a.id,patch:{rect:v,tone:`current`}},...T(n.filter(e=>e.id!==p.id))])),e.do(...i([{type:`remove`,id:t.id,into:`slot:out`},{type:`remove`,id:a.id,into:`slot:out`},{type:`add`,item:{id:p.id,kind:`cell`,rect:y,tone:w(s),text:String(s)},from:`slot:b`}])),e.phase(`다시 정렬`,`새 음식 ${r(s,`을`,`를`)} 넣고 남은 ${n.length}개를 처음부터 다시 정렬합니다.`,d.sort),e.do(...i([...T(n),{type:`set`,id:`min:tok`,patch:{text:`최솟값 ${n[0].val}`,tone:n[0].val>=o?`good`:`plain`},pop:!0},{type:`set`,id:`ans:tok`,patch:{text:`${c}번 섞음`,tone:`chosen`},pop:!0}]))}return e.step({title:`모두 ${o} 이상 달성 → ${c}번 (매번 재정렬)`,codeHighlights:d.done,...f(),answer:c,isKeyframe:!0}),e.phase(`정답`,`답은 ${c}번으로 같지만 섞을 때마다 배열을 밀고 다시 정렬해 연산이 ${l}번 들었습니다. N이 100만이면 시간 초과입니다.`,d.done),e.do(...i([...n.map(e=>({type:`set`,id:e.id,patch:{tone:`path`}})),{type:`set`,id:`ans:tok`,patch:{tone:`path`},pop:!0}])),e.finish()}function O(){let e=new t(C(`초기 정렬 줄`)),n=a.map((e,t)=>({id:`f:${t}`,val:e})),c=n[0],l=0,u=s,d=s,f=()=>[c,...n.slice(l+1)],m=(e={})=>({work:u,variables:{cur:c.val,next:n[l+1]?.val??`-`,K:o,answer:l,...e}});e.step({title:`처음 한 번만 정렬하기`,codeHighlights:p.init,...m()}),e.phase(`정렬하기`,`처음 한 번만 오름차순으로 정렬하고 cur = ${c.val}에서 시작합니다.`,p.init),e.do(...i(n.map((e,t)=>({type:`add`,item:{id:e.id,kind:`cell`,rect:g(t),tone:w(e.val),text:String(e.val)}}))));for(let t=1;t<n.length&&!(c.val>=o);t++){let a=c,o=n[t],s=a.val+o.val*2;c={id:`f:${d++}`,val:s},l++,u+=2;let h=f(),y=h.length>1&&h[0].val>h[1].val;e.step({title:`${l}번째: cur(${a.val}) + arr[${t}](${o.val}) × 2 = ${s}`,codeHighlights:p.mix,...m()}),e.phase(`앞에서 꺼내기`,`재정렬 없이 바로 앞의 cur(${a.val})와 arr[${t}](${o.val})를 골라 섞습니다.`,p.check),e.do(...i([{type:`set`,id:a.id,patch:{rect:_,tone:`current`}},{type:`set`,id:o.id,patch:{rect:v,tone:`current`}}])),e.phase(`그대로 맨 앞에 두기`,y?`새로 만든 ${r(s,`이`,`가`)} 뒤의 ${h[1].val}보다 커졌는데도 다시 정렬하지 않고 맨 앞(cur)에 그대로 둡니다.`:`새로 만든 ${r(s,`을`,`를`)} cur에 저장합니다.`,p.mix),e.do(...i([{type:`remove`,id:a.id,into:`slot:out`},{type:`remove`,id:o.id,into:`slot:out`},{type:`add`,item:{id:c.id,kind:`cell`,rect:g(0),tone:y?`bad`:w(s),text:String(s)},from:`slot:b`},...h.slice(1).map((e,t)=>({type:`set`,id:e.id,patch:{rect:g(t+1)}})),{type:`set`,id:`min:tok`,patch:{text:`cur = ${c.val}`,tone:y?`bad`:`plain`},pop:!0},{type:`set`,id:`ans:tok`,patch:{text:`${l}번 섞음`,tone:`chosen`},pop:!0}]))}let h=f().slice(1).filter(e=>e.val<o);return e.step({title:`오답: ${h.map(e=>e.val).join(`, `)}이 남았는데 ${l}번으로 종료`,codeHighlights:p.done,...m(),answer:l,isKeyframe:!0}),e.phase(`오답 확인`,`cur = ${r(c.val,`이`,`가`)} ${o} 이상이라 멈췄지만, 뒤에 아직 ${o} 미만인 음식(${h.map(e=>e.val).join(`, `)})이 남아 있습니다. 섞은 음식이 기존 음식보다 커질 수 있으므로 매번 최소 힙에서 꺼내야 합니다.`,p.done),e.do({type:`focus`,ids:[c.id,...h.map(e=>e.id)]}),e.do(...i(h.map(e=>({type:`set`,id:e.id,patch:{tone:`bad`}})))),e.do({type:`arrow`,from:c.id,to:h[0].id,verdict:`bad`,label:`${h[0].val} < ${o} 남음`}),e.do({type:`set`,id:`ans:tok`,patch:{text:`오답 ${l} (정답 4)`,tone:`bad`},pop:!0}),e.finish()}var k={id:`spicier`,title:`더 맵게`,level:2,category:`heap`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42626`,description:{summary:`모든 음식의 스코빌 지수를 K 이상으로 만들고 싶습니다. 가장 덜 매운 음식과 두 번째로 덜 매운 음식을 골라 (가장 덜 매운 지수 + 두 번째 지수 × 2)로 섞는 일을 반복할 때, 최소 몇 번 섞어야 하는지 구합니다. 끝까지 K 이상으로 만들 수 없으면 -1을 돌려줍니다.`,rules:[`scoville의 길이는 2 이상 1,000,000 이하입니다.`,`K는 0 이상 1,000,000,000 이하입니다.`,`scoville의 원소는 각각 0 이상 1,000,000 이하입니다.`,`모든 음식의 스코빌 지수를 K 이상으로 만들 수 없는 경우에는 -1을 return 합니다.`],examples:[{input:`scoville = [1, 2, 3, 9, 10, 12], K = 7`,output:`2`}]},keyIntuitions:[`새로 섞은 음식의 스코빌 지수는 원래 있던 다른 음식보다 커질 수 있어서 순서가 계속 바뀝니다.`,`매번 "지금 남은 음식 중 가장 작은 두 개"를 꺼내고 새 음식을 다시 넣어야 하므로 최소 힙이 딱 맞습니다.`,`힙의 최솟값(heap[0])이 K 이상이 되는 순간, 나머지 음식도 모두 K 이상이므로 바로 멈출 수 있습니다.`],demo:{input:[a,o],label:`scoville = [${a.join(`, `)}], K = ${o}`},workUnit:`힙·배열 정리 연산 수`,approaches:[{id:`spicier-min-heap`,name:`최소 힙`,rank:`BEST`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`최소 힙에서 가장 작은 두 음식을 꺼내 섞고 다시 넣기를 반복하는 정석 풀이입니다.`,pros:[`가장 작은 두 값 꺼내기와 새 값 넣기가 모두 O(log N)이라 100만 개도 빠르게 처리합니다.`,`heap[0] >= K 조건 하나로 모든 음식이 K 이상인지 O(1)에 확인합니다.`],cons:[`JavaScript에는 내장 힙이 없어 간단한 최소 힙 함수를 직접 작성해야 합니다.`],whyThisRank:`원소를 꺼내고 새 원소를 넣으면서 최솟값을 최대 N번 찾아야 하므로 O(log N)에 갱신하는 최소 힙이 정석입니다.`,code:c,visualize:E},{id:`spicier-resort`,name:`섞을 때마다 다시 정렬하기`,rank:`ALTERNATIVE`,timeComplexity:`O(N² log N)`,spaceComplexity:`O(N)`,verdict:`배열에서 앞의 두 개를 꺼내 섞은 뒤 매번 배열 전체를 다시 정렬하는 풀이입니다.`,pros:[`힙 자료구조 없이 기본 정렬 함수만으로 구현할 수 있습니다.`],cons:[`섞을 때마다 O(N log N) 정렬을 반복해 전체 시간이 O(N² log N)으로 늘어납니다.`,`음식 수가 100만 개까지 커지면 효율성 테스트에서 시간 초과가 납니다.`],whyThisRank:`정확한 답은 내지만 새 원소 하나 때문에 이미 정렬된 나머지 원소까지 매번 다시 정렬하는 비용이 큽니다.`,code:u,visualize:D},{id:`spicier-sort-once`,name:`처음 한 번만 정렬하고 앞에서부터 섞기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`처음에만 정렬해 두고 새로 섞은 음식을 재정렬 없이 다음 음식과 바로 섞는 오답 풀이입니다.`,pros:[`정렬을 한 번만 해 빨라 보입니다.`],cons:[`섞어서 커진 음식이 뒤에 있던 음식보다 더 매워질 수 있는데도 순서를 고치지 않습니다.`,`가장 덜 매운 두 음식이 아닌 큰 음식을 먼저 섞어 버려 섞는 횟수가 틀립니다.`],whyThisRank:`1과 2를 섞어 5가 되면 뒤에 있던 3, 4보다 커집니다. 새로 만든 값의 자리가 바뀐다는 점을 놓치기 쉬운 대표적인 함정입니다.`,code:f,visualize:O}],checks:{cases:[{args:[[1,2,3,9,10,12],7],expected:2},{args:[a,o],expected:4},{args:[[1,2,3],100],expected:-1},{args:[[10,12],7],expected:0},{args:[[0,0,1],2],expected:2}],random:e=>{let t=2+Math.floor(e()*7);return[Array.from({length:t},()=>Math.floor(e()*15)),1+Math.floor(e()*35)]}}};export{k as default};