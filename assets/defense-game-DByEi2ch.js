import{o as e}from"./layout-DFaYBMY_.js";import{c as t,i as n,l as r}from"./shared-CL29HWIp.js";var i=8,a=2,o=[6,2,2,2,2,5,4],s=o.length,c={python:`import heapq

def solution(n, k, enemy):
    heap = []  # 무적권으로 막은 라운드들 (최소 힙, 최대 k개)

    for i, e in enumerate(enemy):
        heapq.heappush(heap, e)
        if len(heap) > k:
            # 무적권이 k개를 넘으면 그중 가장 적이 적은 라운드를 병사로 막는다
            n -= heapq.heappop(heap)
        if n < 0:
            return i

    return len(enemy)`,javascript:`function solution(n, k, enemy) {
  const heap = []; // 무적권으로 막은 라운드들 (최소 힙, 최대 k개)
  const push = (v) => {
    heap.push(v);
    for (let i = heap.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (let i = 0;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l] < heap[m]) m = l;
        if (r < heap.length && heap[r] < heap[m]) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  };

  for (let i = 0; i < enemy.length; i++) {
    push(enemy[i]);
    if (heap.length > k) {
      // 무적권이 k개를 넘으면 그중 가장 적이 적은 라운드를 병사로 막는다
      n -= pop();
    }
    if (n < 0) return i;
  }
  return enemy.length;
}`},l={init:n(c,[`heap = []`],[`const heap = []`]),push:n(c,[`for i, e in enumerate(enemy):`,`heapq.heappush(heap, e)`],[`for (let i = 0; i < enemy.length; i++)`,`push(enemy[i])`]),pop:n(c,[`if len(heap) > k:`,`n -= heapq.heappop(heap)`],[`if (heap.length > k)`,`n -= pop()`]),fail:n(c,[`if n < 0:`,`return i`],[`if (n < 0) return i`]),done:n(c,[`return i`,`return len(enemy)`],[`if (n < 0) return i`,`return enemy.length`])},u={python:`def solution(n, k, enemy):
    seen = []
    for i, e in enumerate(enemy):
        seen.append(e)
        seen.sort()  # 매 라운드마다 지금까지 본 적의 수를 다시 정렬
        # 가장 큰 k개를 뺀 나머지(작은 라운드들)의 합이 병사 수 n을 넘는지 확인
        need = sum(seen[:max(0, len(seen) - k)])
        if need > n:
            return i
    return len(enemy)`,javascript:`function solution(n, k, enemy) {
  const seen = [];
  for (let i = 0; i < enemy.length; i++) {
    seen.push(enemy[i]);
    seen.sort((a, b) => a - b); // 매 라운드마다 지금까지 본 적의 수를 다시 정렬
    // 가장 큰 k개를 뺀 나머지(작은 라운드들)의 합이 병사 수 n을 넘는지 확인
    let need = 0;
    for (let j = 0; j < seen.length - k; j++) need += seen[j];
    if (need > n) return i;
  }
  return enemy.length;
}`},d={init:n(u,[`seen = []`],[`const seen = []`]),sort:n(u,[`seen.append(e)`,`seen.sort()`],[`seen.push(enemy[i])`,`seen.sort((a, b) => a - b)`]),check:n(u,[`need = sum(seen[:max(0, len(seen) - k)])`,`if need > n:`],[`let need = 0`,`for (let j = 0; j < seen.length - k; j++)`,`if (need > n) return i`]),done:n(u,[`return i`,`return len(enemy)`],[`if (need > n) return i`,`return enemy.length`])},f={python:`def solution(n, k, enemy):
    for i, e in enumerate(enemy):
        if n >= e:       # 병사가 충분하면 무조건 병사부터 소모
            n -= e
        elif k > 0:      # 병사가 부족할 때만 무적권 사용
            k -= 1
        else:
            return i
    return len(enemy)`,javascript:`function solution(n, k, enemy) {
  for (let i = 0; i < enemy.length; i++) {
    const e = enemy[i];
    if (n >= e) {      // 병사가 충분하면 무조건 병사부터 소모
      n -= e;
    } else if (k > 0) { // 병사가 부족할 때만 무적권 사용
      k--;
    } else {
      return i;
    }
  }
  return enemy.length;
}`},p={spend:n(f,[`if n >= e:`,`n -= e`],[`if (n >= e)`,`n -= e`]),shield:n(f,[`elif k > 0:`,`k -= 1`],[`} else if (k > 0)`,`k--`]),fail:n(f,[`else:`,`return i`],[`} else {`,`return i`])},m=560,h=290,g=e({x:88,y:18,w:58,h:48,gap:8}),_=e({x:96,y:112,w:96,h:44,gap:10}),v={x:88,y:210,w:144,h:44},y={x:248,y:210,w:136,h:44},b={x:400,y:210,w:144,h:44};function x(e){return{width:m,height:h,items:[{id:`lab:enemy`,kind:`text`,rect:{x:0,y:18,w:84,h:48},text:`라운드 적`},...o.map((e,t)=>({id:`e:${t}`,kind:`cell`,rect:g(t),tone:`plain`,text:String(e),sub:`${t+1}R`})),{id:`lab:heap`,kind:`text`,rect:{x:0,y:112,w:90,h:44},text:e},{id:`zone:heap`,kind:`zone`,rect:{x:90,y:106,w:332,h:56}},{id:`n:tok`,kind:`token`,rect:v,tone:`good`,text:`병사 n = ${i}`,tag:`남은 병사`},{id:`k:tok`,kind:`token`,rect:y,tone:`queued`,text:`무적권 k = ${a}`,tag:`한도`},{id:`ans:tok`,kind:`token`,rect:b,tone:`plain`,text:`0라운드 통과`,tag:`answer`}]}}var S=e=>`h:${e}`;function C(){let e=new r(x(`무적권 최소 힙`)),n=[],c=i,u=0,d=0,f=()=>n.map((e,t)=>({type:`set`,id:S(e.i),patch:{rect:_(t),tone:`queued`,text:`${e.i+1}R(${e.e})`}})),p=(e=`-`)=>({work:u,variables:{라운드:e,n:c,heap:`[${n.map(e=>e.e).join(`, `)}]`,통과:`${d}R`}});e.step({title:`병사 ${i}명, 무적권 ${a}개로 시작`,codeHighlights:l.init,...p()}),e.phase(`초기화`,`무적권으로 막을 라운드(최대 ${a}개)를 담는 최소 힙을 준비합니다. 힙이 ${a}개를 넘으면 가장 적이 적은 라운드를 꺼내 병사로 막습니다.`,l.init),e.do({type:`focus`,ids:[`n:tok`,`k:tok`]}),e.do({type:`unfocus`});for(let r=0;r<s;r++){let i=o[r],s={i:r,e:i};if(n.push(s),n.sort((e,t)=>e.e-t.e||e.i-t.i),u++,n.length<=a){d=r+1,e.step({title:`${r+1}라운드(적 ${i}명): 무적권 힙에 추가 (${n.length}/${a})`,codeHighlights:l.push,...p(`${r+1}R (${i}명)`)}),e.phase(`힙에 넣기`,`아직 무적권 힙에 자리가 있으므로 ${r+1}라운드(적 ${i}명)를 최소 힙에 넣습니다.`,l.push),e.do(...t([{type:`set`,id:`e:${r}`,patch:{tone:`queued`}},{type:`add`,item:{id:S(r),kind:`token`,rect:_(n.indexOf(s)),tone:`queued`,text:`${r+1}R(${i})`},from:`e:${r}`},...f(),{type:`set`,id:`ans:tok`,patch:{text:`${d}라운드 통과`,tone:`chosen`},pop:!0}]));continue}let m=n.shift(),h=c;if(c-=m.e,u++,c>=0)d=r+1,e.step({title:`${r+1}라운드(적 ${i}명): 최솟값 ${m.i+1}R(${m.e}명)을 병사로 막기 → n = ${c}`,codeHighlights:l.pop,...p(`${r+1}R (${i}명)`)}),e.phase(`힙에 넣고 최솟값 꺼내기`,`${r+1}라운드(${i}명)를 힙에 넣으면 3개가 됩니다. 그중 적이 가장 적은 ${m.i+1}라운드(${m.e}명)를 꺼내 병사로 막고(${h} − ${m.e} = ${c}), 큰 라운드 ${a}개에 무적권을 유지합니다.`,l.pop),e.do(...t([{type:`add`,item:{id:S(r),kind:`token`,rect:_(a),tone:`queued`,text:`${r+1}R(${i})`},from:`e:${r}`},{type:`set`,id:`e:${r}`,patch:{tone:`queued`}}])),e.do(...t([{type:`remove`,id:S(m.i),into:`n:tok`},{type:`set`,id:`e:${m.i}`,patch:{tone:`visited`}},...f(),{type:`set`,id:`n:tok`,patch:{text:`병사 n = ${c}`,tone:`chosen`},pop:!0},{type:`set`,id:`ans:tok`,patch:{text:`${d}라운드 통과`,tone:`chosen`},pop:!0}]));else{e.step({title:`${r+1}라운드(적 ${i}명): 최솟값 ${m.e}명도 막을 병사 부족 (n = ${c})`,codeHighlights:l.fail,...p(`${r+1}R (${i}명)`)}),e.phase(`병사 부족`,`${r+1}라운드(${i}명)를 넣고 가장 작은 ${m.i+1}라운드(${m.e}명)를 병사로 막으려 했지만, 남은 병사가 ${h}명뿐이라 n = ${c} < 0이 됩니다.`,l.fail),e.do(...t([{type:`add`,item:{id:S(r),kind:`token`,rect:_(a),tone:`queued`,text:`${r+1}R(${i})`},from:`e:${r}`},{type:`remove`,id:S(m.i),into:`n:tok`},{type:`set`,id:`e:${r}`,patch:{tone:`bad`}},...f(),{type:`set`,id:`n:tok`,patch:{text:`병사 부족 (${c})`,tone:`bad`},pop:!0}]));break}}return e.step({title:`최대 ${d}라운드 통과`,codeHighlights:l.done,...p(`종료`),answer:d,isKeyframe:!0}),e.phase(`정답`,`가장 적이 많았던 1라운드(6명)와 6라운드(5명)를 무적권으로 막고, 나머지 2·3·4·5라운드(각 2명, 합 8명)를 병사로 막아 총 ${d}라운드를 통과했습니다.`,l.done),e.do(...t([...Array.from({length:d},(e,t)=>({type:`set`,id:`e:${t}`,patch:{tone:`path`}})),{type:`set`,id:`ans:tok`,patch:{text:`${d}라운드 통과`,tone:`path`},pop:!0}])),e.finish()}function w(){let e=new r(x(`매번 정렬`)),n=[],c=0,l=0,u=0,f=(e=`-`)=>({work:c,variables:{라운드:e,seen:`[${n.join(`, `)}]`,필요병사:u,한도n:i}});e.step({title:`빈 배열 seen으로 시작`,codeHighlights:d.init,...f()}),e.phase(`초기화`,`라운드가 끝날 때마다 지금까지 만난 적의 수를 배열에 넣고 매번 오름차순으로 정렬합니다.`,d.init),e.do({type:`add`,item:{id:`need:tok`,kind:`token`,rect:_(0),tone:`plain`,text:`필요 병사 0명`}});for(let r=0;r<s;r++)if(n.push(o[r]),n.sort((e,t)=>e-t),c+=n.length*2,u=n.slice(0,Math.max(0,n.length-a)).reduce((e,t)=>e+t,0),u<=i)l=r+1,e.step({title:`${r+1}라운드 정렬 후 작은 ${Math.max(0,n.length-a)}개 합 = ${u} ≤ ${i}`,codeHighlights:d.check,...f(`${r+1}R`)}),e.phase(`정렬 및 합산`,`지금까지의 ${n.length}개 라운드를 전체 정렬해 큰 ${Math.min(a,n.length)}개를 뺀 나머지 합(${u}명)이 ${i}명 이하인지 확인합니다.`,d.sort),e.do(...t([{type:`set`,id:`e:${r}`,patch:{tone:`visited`}},{type:`set`,id:`need:tok`,patch:{text:`필요 ${u}명 ≤ ${i}`},pop:!0},{type:`set`,id:`ans:tok`,patch:{text:`${l}라운드 통과`,tone:`chosen`},pop:!0}]));else{e.step({title:`${r+1}라운드 정렬 후 작은 쪽 합 = ${u} > ${i} (중단)`,codeHighlights:d.check,...f(`${r+1}R`)}),e.phase(`병사 초과`,`가장 큰 ${a}개를 무적권으로 막아도 나머지 합이 ${u}명 > ${i}명이라 ${r+1}라운드는 통과할 수 없습니다.`,d.check),e.do(...t([{type:`set`,id:`e:${r}`,patch:{tone:`bad`}},{type:`set`,id:`need:tok`,patch:{text:`필요 ${u}명 > ${i}`,tone:`bad`},pop:!0}]));break}return e.step({title:`최대 ${l}라운드 통과 (연산 ${c}번)`,codeHighlights:d.done,...f(`종료`),answer:l,isKeyframe:!0}),e.phase(`정답`,`답은 ${l}라운드로 같지만, 매 라운드마다 처음부터 다시 정렬하고 더해 연산이 ${c}번 들었습니다. 라운드가 100만 개면 O(M² log M)으로 시간 초과가 납니다.`,d.done),e.do(...t([...Array.from({length:l},(e,t)=>({type:`set`,id:`e:${t}`,patch:{tone:`path`}})),{type:`set`,id:`ans:tok`,patch:{text:`${l}라운드 통과`,tone:`path`},pop:!0}])),e.finish()}function T(){let e=new r(x(`사용한 무적권`)),n=i,c=a,l=0,u=0,d=0,f=(e=`-`)=>({work:l,variables:{라운드:e,n,k:c,통과:`${u}R`}});e.step({title:`병사가 남으면 무조건 병사부터 소모하기`,codeHighlights:p.spend,...f()}),e.phase(`초기화`,`앞으로 나올 라운드를 고려하지 않고, 현재 병사로 막을 수 있으면 무조건 병사를 쓰고 부족할 때만 무적권을 씁니다.`,p.spend),e.do({type:`focus`,ids:[`n:tok`,`k:tok`]}),e.do({type:`unfocus`});for(let r=0;r<s;r++){let a=o[r];if(l++,n>=a)n-=a,u=r+1,e.step({title:`${r+1}라운드(적 ${a}명): 병사 ${a}명 소모 → 남은 병사 ${n}명`,codeHighlights:p.spend,...f(`${r+1}R (${a}명)`)}),e.phase(`병사 소모`,r===0?`1라운드 적이 ${a}명으로 매우 많지만, 현재 병사(${i}명)로 막을 수 있다는 이유로 병사 ${a}명을 그대로 써 버립니다.`:`병사 ${a}명을 소모해 ${r+1}라운드를 막습니다.`,p.spend),e.do(...t([{type:`set`,id:`e:${r}`,patch:{tone:r===0?`bad`:`visited`}},{type:`set`,id:`n:tok`,patch:{text:`병사 n = ${n}`,tone:`chosen`},pop:!0},{type:`set`,id:`ans:tok`,patch:{text:`${u}라운드 통과`,tone:`chosen`},pop:!0}]));else if(c>0){c--,u=r+1;let i=d++;e.step({title:`${r+1}라운드(적 ${a}명): 병사 부족 → 작은 적 ${a}명에 무적권 낭비`,codeHighlights:p.shield,...f(`${r+1}R (${a}명)`)}),e.phase(`무적권 사용`,`남은 병사가 ${n}명이라 적 ${a}명에게 무적권을 씁니다. 1라운드(6명) 대신 ${a}명짜리 작은 라운드에 무적권이 쓰였습니다.`,p.shield),e.do(...t([{type:`set`,id:`e:${r}`,patch:{tone:`queued`}},{type:`add`,item:{id:S(r),kind:`token`,rect:_(i),tone:`bad`,text:`${r+1}R(${a}) 무적권`},from:`e:${r}`},{type:`set`,id:`k:tok`,patch:{text:`무적권 k = ${c}`},pop:!0},{type:`set`,id:`ans:tok`,patch:{text:`${u}라운드 통과`,tone:`chosen`},pop:!0}]))}else{e.step({title:`${r+1}라운드(적 ${a}명): 병사도 무적권도 없어 실패`,codeHighlights:p.fail,...f(`${r+1}R (${a}명)`)}),e.phase(`실패`,`5라운드(적 ${a}명)에서 병사(${n}명)도 무적권(${c}개)도 남아 있지 않아 일찍 멈춥니다.`,p.fail),e.do({type:`set`,id:`e:${r}`,patch:{tone:`bad`}});break}}return e.step({title:`오답: ${u}라운드 종료 (정답 6라운드)`,codeHighlights:p.fail,...f(`종료`),answer:u,isKeyframe:!0}),e.phase(`오답 확인`,`1라운드의 큰 적(6명)에 병사를 써 버리는 바람에 정작 무적권 2개를 적 2명짜리 라운드에 낭비해 ${u}라운드(정답 6라운드)밖에 가지 못했습니다. 지나온 라운드 중 가장 큰 곳을 무적권으로 바꿀 수 있도록 최소 힙을 써야 합니다.`,p.fail),e.do({type:`arrow`,from:`e:0`,to:`ans:tok`,verdict:`bad`,label:`1R(6명)에 병사 낭비`}),e.do({type:`set`,id:`ans:tok`,patch:{text:`오답 ${u}R (정답 6R)`,tone:`bad`},pop:!0}),e.finish()}var E={id:`defense-game`,title:`디펜스 게임`,level:2,category:`heap`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/142085`,description:{summary:`보유한 병사 n명으로 매 라운드 몰려오는 enemy[i]명의 적을 순서대로 막습니다. 병사를 enemy[i]명 소모하거나, 병사 소모 없이 한 라운드를 통째로 넘기는 무적권을 최대 k번 사용할 수 있을 때, 최대 몇 라운드까지 막을 수 있는지 구합니다.`,rules:[`1 ≤ n ≤ 1,000,000,000`,`1 ≤ k ≤ 500,000`,`1 ≤ enemy의 길이 ≤ 1,000,000`,`1 ≤ enemy[i] ≤ 1,000,000`,`모든 라운드를 막을 수 있는 경우에는 enemy의 길이를 return 합니다.`],examples:[{input:`n = 7, k = 3, enemy = [4, 2, 4, 5, 3, 3, 1]`,output:`5`},{input:`n = 2, k = 4, enemy = [3, 3, 3, 3]`,output:`4`}]},keyIntuitions:[`무적권 k개는 지금까지 진행한 라운드 가운데 "적이 가장 많았던 상위 k개 라운드"에 썼을 때 남은 병사를 가장 많이 아낄 수 있습니다.`,`무적권으로 막은 라운드들을 크기 k인 최소 힙에 담아 두고, 새 라운드가 들어와 k + 1개가 되면 그중 가장 적이 적은 라운드(heap[0])를 꺼내 병사로 막습니다.`,`꺼낸 최솟값을 병사로 막다가 남은 병사 n이 0보다 작아지는 순간이 더 이상 진행할 수 없는 첫 라운드입니다.`],demo:{input:[i,a,o],label:`n = ${i}, k = ${a}, enemy = [${o.join(`, `)}]`},workUnit:`힙·정렬 연산 수`,approaches:[{id:`defense-game-min-heap`,name:`막은 라운드 최소 힙`,rank:`BEST`,timeComplexity:`O(M log k) (M = 라운드 수)`,spaceComplexity:`O(k)`,verdict:`무적권으로 막은 상위 k개 라운드를 최소 힙에 유지하고, k개를 넘을 때마다 최솟값을 꺼내 병사로 막는 정석 풀이입니다.`,pros:[`힙의 크기가 최대 k + 1로 유지되므로 라운드마다 O(log k)에 처리됩니다.`,`나중에 더 작은 적을 만나면 과거의 큰 적에게 무적권을 양보하는 효과가 자동으로 일어납니다.`],cons:[`최소 힙에 무엇을 남기고(무적권 라운드) 무엇을 꺼내는지(병사로 막을 라운드) 역할을 명확히 기억해야 합니다.`],whyThisRank:`100만 라운드를 한 번만 훑으면서 매 순간 상위 k개 라운드를 무적권으로 유지할 수 있는 가장 빠른 방법입니다.`,code:c,visualize:C},{id:`defense-game-sort-each`,name:`매 라운드마다 지금까지의 적을 정렬해 확인하기`,rank:`ALTERNATIVE`,timeComplexity:`O(M² log M)`,spaceComplexity:`O(M)`,verdict:`라운드마다 지금까지 등장한 적을 배열에 넣고 정렬해 가장 큰 k개를 제외한 합을 구하는 풀이입니다.`,pros:[`힙 없이 정렬과 배열 슬라이싱만으로 상위 k개를 바로 구할 수 있습니다.`],cons:[`매 라운드마다 전체 정렬과 합산을 반복하므로 라운드 수가 많으면 O(M² log M)으로 시간 초과가 납니다.`],whyThisRank:`상위 k개에 무적권을 쓴다는 논리는 같지만, 매 라운드 정렬을 다시 수행해 불필요한 중복 연산이 발생합니다.`,code:u,visualize:w},{id:`defense-game-naive-greedy`,name:`병사가 부족할 때만 그때그때 무적권 쓰기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(M)`,spaceComplexity:`O(1)`,verdict:`병사가 남아 있으면 큰 적에게도 무조건 병사를 쓰고, 병사가 바닥난 뒤에야 작은 적에게 무적권을 쓰는 오답 풀이입니다.`,pros:[`반복문 하나로 끝나 코드가 아주 단순합니다.`],cons:[`초반에 큰 적이 나왔을 때 병사를 다 써 버리고, 정작 후반의 작은 적들에게 무적권을 낭비합니다.`],whyThisRank:`무적권은 "병사가 떨어진 시점"이 아니라 "지나온 라운드 중 적이 가장 많았던 시점"에 써야 최대로 버틸 수 있습니다.`,code:f,visualize:T}],checks:{cases:[{args:[7,3,[4,2,4,5,3,3,1]],expected:5},{args:[2,4,[3,3,3,3]],expected:4},{args:[i,a,o],expected:6},{args:[10,1,[12,5,5,5]],expected:3},{args:[5,2,[1,1,1,10,10]],expected:5}],random:e=>{let t=2+Math.floor(e()*8);return[1+Math.floor(e()*20),1+Math.floor(e()*4),Array.from({length:t},()=>1+Math.floor(e()*9))]}}};export{E as default};