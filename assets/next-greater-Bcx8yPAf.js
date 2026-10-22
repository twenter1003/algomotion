import{o as e}from"./layout-DFaYBMY_.js";import{c as t,i as n,l as r,r as i}from"./shared-CL29HWIp.js";import{t as a}from"./lane-BzDhdR3X.js";var o=[9,6,3,2,5,4,1],s=o.length,c=[-1,-1,5,5,-1,-1,-1],l=e=>`[${e.join(`, `)}]`,u=e=>`${e}번(${o[e]})`,d={python:`def solution(numbers):
    answer = [-1] * len(numbers)
    stack = []  # 아직 뒷 큰수를 못 찾은 인덱스 (자동으로 내림차순 유지)

    for i, num in enumerate(numbers):
        while stack and numbers[stack[-1]] < num:
            answer[stack.pop()] = num  # 현재 수가 가장 가까운 뒷 큰수
        stack.append(i)

    return answer`,javascript:`function solution(numbers) {
  const answer = new Array(numbers.length).fill(-1);
  const stack = []; // 아직 뒷 큰수를 못 찾은 인덱스 (자동으로 내림차순 유지)

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    while (stack.length > 0 && numbers[stack[stack.length - 1]] < num) {
      answer[stack.pop()] = num; // 현재 수가 가장 가까운 뒷 큰수
    }
    stack.push(i);
  }

  return answer;
}`},f={init:n(d,[`answer = [-1] * len(numbers)`,`stack = []`],[`const answer = new Array(numbers.length).fill(-1)`,`const stack = []`]),check:n(d,[`for i, num in enumerate(numbers):`,`while stack and numbers[stack[-1]] < num:`],[`for (let i = 0; i < numbers.length; i++)`,`while (stack.length > 0 && numbers[stack[stack.length - 1]] < num)`]),pop:n(d,[`answer[stack.pop()] = num`],[`answer[stack.pop()] = num`]),push:n(d,[`stack.append(i)`],[`stack.push(i)`]),done:n(d,[`return answer`],[`return answer;`])},p={python:`import heapq

def solution(numbers):
    answer = [-1] * len(numbers)
    heap = []  # (값, 인덱스) 최소 힙

    for i, num in enumerate(numbers):
        while heap and heap[0][0] < num:
            _, idx = heapq.heappop(heap)
            answer[idx] = num
        heapq.heappush(heap, (num, i))

    return answer`,javascript:`function solution(numbers) {
  const answer = new Array(numbers.length).fill(-1);
  const heap = []; // [값, 인덱스] 최소 힙

  const push = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      while (i * 2 + 1 < heap.length) {
        let c = i * 2 + 1;
        if (c + 1 < heap.length && heap[c + 1][0] < heap[c][0]) c++;
        if (heap[i][0] <= heap[c][0]) break;
        [heap[i], heap[c]] = [heap[c], heap[i]];
        i = c;
      }
    }
    return top;
  };

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    while (heap.length > 0 && heap[0][0] < num) {
      const [, idx] = pop();
      answer[idx] = num;
    }
    push([num, i]);
  }
  return answer;
}`},m={init:n(p,[`answer = [-1] * len(numbers)`,`heap = []`],[`const answer = new Array(numbers.length).fill(-1)`,`const heap = []`]),pop:n(p,[`while heap and heap[0][0] < num:`,`_, idx = heapq.heappop(heap)`,`answer[idx] = num`],[`while (heap.length > 0 && heap[0][0] < num)`,`const [, idx] = pop()`,`answer[idx] = num`]),push:n(p,[`heapq.heappush(heap, (num, i))`],[`push([num, i])`]),done:n(p,[`return answer`],[`return answer;`])},h={python:`def solution(numbers):
    n = len(numbers)
    answer = [-1] * n

    # 함정: 매 원소마다 오른쪽을 끝까지 훑어 O(N²) 시간 초과
    for i in range(n):
        for j in range(i + 1, n):
            if numbers[j] > numbers[i]:
                answer[i] = numbers[j]
                break

    return answer`,javascript:`function solution(numbers) {
  const n = numbers.length;
  const answer = new Array(n).fill(-1);

  // 함정: 매 원소마다 오른쪽을 끝까지 훑어 O(N²) 시간 초과
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (numbers[j] > numbers[i]) {
        answer[i] = numbers[j];
        break;
      }
    }
  }

  return answer;
}`},g={init:n(h,[`answer = [-1] * n`],[`const answer = new Array(n).fill(-1)`]),scan:n(h,[`for i in range(n):`,`for j in range(i + 1, n):`,`if numbers[j] > numbers[i]:`],[`for (let i = 0; i < n; i++)`,`for (let j = i + 1; j < n; j++)`,`if (numbers[j] > numbers[i])`]),found:n(h,[`answer[i] = numbers[j]`,`break`],[`answer[i] = numbers[j];`,`break;`]),done:n(h,[`return answer`],[`return answer;`])},_=84,v=64,y=8,b=e({x:_,y:0,w:v,h:48,gap:y}),x=78,S=e({x:_,y:x,w:v,h:48,gap:y}),C=156,w=s*72-y+8,T=_+w+150,E=212,D={id:`wait`,x:_,y:160,slotW:v,slotH:44,gap:y,max:s},O=e=>`num:${e}`,k=e=>`ans:${e}`,A=e=>`wt:${e}`,j=(e,t,n,r)=>({id:e,kind:`text`,rect:{x:0,y:n,w:76,h:r},text:t});function M(e){let t=[j(`row:num`,`numbers`,0,48),j(`row:ans`,`뒷 큰수`,x,48),j(`row:wait`,e,C,52),{id:`wait:bg`,kind:`zone`,rect:{x:80,y:C,w,h:52}}];for(let e=0;e<s;e++)t.push({id:O(e),kind:`cell`,rect:b(e),tone:`plain`,text:String(o[e]),tag:String(e)},{id:k(e),kind:`cell`,rect:S(e),tone:`plain`,text:`-1`,tag:String(e)});return{width:T,height:E,items:t}}var N=e=>({type:`wait`,ms:e}),P=()=>t([{type:`unfocus`},{type:`clearMarks`}]),F=(e,t,n)=>({type:`set`,id:e,patch:{tone:t,...n===void 0?{}:{text:n}}});function I(){let e=new r(M(`단조 스택`)),n=new a(e,D),c=Array(s).fill(-1),d=[],p=0,m=`-`,h=()=>({work:p,variables:{i:m,stack:l(d.map(u)),answer:l(c)}});e.step({title:`answer를 모두 -1로 초기화하고 빈 스택 준비`,codeHighlights:f.init,...h()}),e.phase(`초기화`,`뒷 큰수가 없는 원소는 -1이므로 처음부터 모두 -1로 채워 둡니다. 스택에는 아직 뒷 큰수를 만나지 못한 인덱스를 넣습니다.`),e.do(N(500));for(let r=0;r<s;r++){let a=o[r];for(m=r;d.length>0&&o[d.at(-1)]<a;){let s=d.pop(),l=o[s];p++,c[s]=a,e.step({title:`${r}번(${a}): 스택 맨 위 ${s}번(${l}) < ${a} → 뒷 큰수 ${a} 확정`,codeHighlights:f.pop,...h()}),e.phase(`비교하기`,`현재 ${r}번 값 ${i(a,`이`,`가`)} 스택 맨 위 ${s}번(${l})보다 큽니다.`,f.check),e.do({type:`focus`,ids:[O(r),O(s),A(s),k(s)]},F(O(r),`current`),{type:`arrow`,from:O(r),to:O(s),verdict:`good`,label:`${l} < ${a}`},N(240)),e.phase(`꺼내서 확정`,`${s}번을 스택에서 꺼내고 answer[${s}] = ${a}로 확정합니다.`,f.pop),n.pop(k(s)),e.do(...t([{type:`set`,id:k(s),patch:{text:String(a),tone:`visited`},pop:!0},F(O(s),`visited`),...P()],!0),N(240))}let s=d.at(-1);s!==void 0&&p++,d.push(r),e.step({title:s===void 0?`${r}번(${a}): 빈 스택에 넣기`:`${r}번(${a}): 맨 위 ${s}번(${o[s]}) ≥ ${a} → 스택에 넣기`,codeHighlights:f.push,...h()}),s!==void 0&&(e.phase(`비교 멈춤`,`스택 맨 위 ${s}번(${o[s]})이 ${a} 이상이면 그 아래에 깔린 값들은 더 크므로 볼 필요 없이 멈춥니다.`,f.check),e.do({type:`focus`,ids:[O(s),O(r),A(s)]},F(O(r),`current`),{type:`arrow`,from:O(s),to:O(r),verdict:`bad`,label:`${o[s]} ≥ ${a}`},N(240))),e.phase(`스택에 넣기`,`${r}번(${a})을 스택에 넣어 자기보다 큰 뒤쪽 수를 기다립니다.`,f.push),n.push({id:A(r),text:u(r),tone:`queued`},O(r)),e.do(...t([F(O(r),`queued`),...P()],!0),N(240))}return e.step({title:`스택에 남은 5개는 뒷 큰수 없음(-1) — 정답 ${l(c)}`,codeHighlights:f.done,...h(),answer:[...c],isKeyframe:!0}),e.phase(`마무리`,`끝까지 스택에 남은 [9, 6, 5, 4, 1]은 뒤에 더 큰 수가 없으므로 처음 채워 둔 -1이 그대로 남습니다. 총 비교 횟수는 ${p}번입니다.`,f.done),e.do(...t([...Array.from({length:s},(e,t)=>F(k(t),`path`)),...Array.from({length:s},(e,t)=>F(O(t),`visited`)),...n.ids.map(e=>F(e,`muted`))]),N(400)),e.finish()}function L(){let e=new r(M(`최소 힙`)),n=new a(e,D),i=Array(s).fill(-1),c=[],d=0,f=`-`,p=()=>({work:d,variables:{i:f,heap:l(c.map(u)),answer:l(i)}});e.step({title:`answer를 -1로 두고 (값, 인덱스) 최소 힙 준비`,codeHighlights:m.init,...p()}),e.phase(`초기화`,`가장 작은 대기 원소부터 꺼내려고 최소 힙을 쓰는 풀이입니다. 넣거나 꺼낼 때마다 힙 순서를 맞추는 추가 비교가 듭니다.`),e.do(N(500));for(let t=0;t<s;t++){let r=o[t];f=t;let a=[];for(;c.length>0&&(d++,o[c[0]]<r);){let e=c.shift();a.push(e),i[e]=r,c.length>1&&d++}let s=c.length===0?0:1;if(d+=s,c.push(t),c.sort((e,t)=>o[e]-o[t]),e.step({title:a.length>0?`${t}번(${r}): 힙에서 ${a.map(u).join(`, `)} 꺼내 ${r} 확정 후 삽입`:`${t}번(${r}): 힙 최솟값 확인 후 힙에 넣어 정렬 유지`,codeHighlights:a.length>0?m.pop:m.push,...p()}),a.length>0){e.phase(`최솟값 꺼내기`,`힙 맨 앞의 ${a.map(u).join(`, `)}이 ${r}보다 작아 차례로 꺼내고 뒷 큰수를 ${r}로 적습니다.`,m.pop);for(let t of a)n.shift(k(t)),e.do({type:`set`,id:k(t),patch:{text:String(r),tone:`visited`},pop:!0},F(O(t),`visited`))}e.phase(`힙에 넣기`,`힙에 ${u(t)}을 넣고 최솟값이 맨 앞에 오도록 자리를 맞춥니다. 단조 스택과 달리 넣을 때도 정렬 비교가 추가됩니다.`,m.push),n.push({id:A(t),text:u(t),tone:`queued`},O(t)),n.reorder(c.map(A)),e.do(F(O(t),`queued`),N(260))}return e.step({title:`모든 원소 확인 완료 (총 ${d}번 비교) — 정답 ${l(i)}`,codeHighlights:m.done,...p(),answer:[...i],isKeyframe:!0}),e.phase(`마무리`,`정답은 ${l(i)}로 같지만, 스택이면 자동으로 맞춰질 순서를 힙으로 유지하느라 정석(8번)보다 많은 ${d}번 비교했습니다.`,m.done),e.do(...t([...Array.from({length:s},(e,t)=>F(k(t),`path`)),...Array.from({length:s},(e,t)=>F(O(t),`visited`)),...n.ids.map(e=>F(e,`muted`))]),N(400)),e.finish()}function R(){let e=new r(M(`시간 초과`)),n=Array(s).fill(-1),i=0,a=`-`,c=()=>({work:i,variables:{i:a,answer:l(n)}});e.step({title:`answer를 -1로 두고 0번부터 차례대로 오른쪽 끝까지 훑기`,codeHighlights:g.init,...c()}),e.phase(`초기화`,`원소 i마다 오른쪽 원소 j를 하나씩 비교해 첫 큰 수를 찾는 이중 반복문 풀이입니다.`),e.do(N(500));for(let r=0;r<s-1;r++){a=r;let l=[],u;for(let e=r+1;e<s;e++)if(l.push(e),i++,o[e]>o[r]){n[r]=o[e],u=e;break}e.step({title:u===void 0?`${r}번(${o[r]}): 오른쪽 ${l.length}개 전부 비교 → 큰 수 없음(-1)`:`${r}번(${o[r]}): ${l.length}번 비교 끝에 ${u}번(${o[u]}) 발견`,codeHighlights:u===void 0?g.scan:g.found,...c()}),e.phase(`오른쪽 훑기`,u===void 0?`${r}번(${o[r]})보다 큰 수가 없어서 오른쪽 끝까지 ${l.length}개를 전부 비교하고도 -1로 끝납니다.`:`${r}번(${o[r]}) 오른쪽을 차례로 비교해 ${u}번에서 더 큰 수 ${o[u]}를 찾았습니다.`,u===void 0?g.scan:g.found),e.do({type:`focus`,ids:[O(r),k(r),...l.map(O)]},F(O(r),`current`));for(let t of l){let n=o[t]>o[r];e.do({type:`arrow`,from:O(r),to:O(t),verdict:n?`good`:`bad`,label:n?`${o[t]} > ${o[r]}`:`${o[t]} ≤ ${o[r]}`})}e.do({type:`set`,id:k(r),patch:{text:String(n[r]),tone:u===void 0?`bad`:`visited`},pop:!0},N(240),...t([F(O(r),`visited`),...P()]))}a=s-1,e.step({title:`비교 횟수 폭발: 7개에서 ${i}번 (N = 1,000,000이면 약 5,000억 번)`,codeHighlights:g.done,...c(),answer:[...n],isKeyframe:!0}),e.phase(`시간 초과 확인`,`내림차순에 가까운 구간마다 매번 오른쪽 끝까지 다시 훑어 7개만으로도 ${i}번 비교했습니다. 최대 입력 N = 1,000,000에서는 약 5,000억 번 비교해 시간 초과가 납니다.`,g.done);let u=_+w+8;return e.do(...t([{type:`add`,item:{id:`slow`,kind:`token`,rect:{x:u,y:C,w:138,h:24},tone:`bad`,text:`이중 루프: ${i}번`}},{type:`add`,item:{id:`fast`,kind:`token`,rect:{x:u,y:184,w:138,h:24},tone:`good`,text:`단조 스택: 8번`}}]),N(500)),e.finish()}var z={id:`next-greater`,title:`뒤에 있는 큰 수 찾기`,level:2,category:`stack-queue`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/154539`,description:{summary:`정수 배열 numbers의 각 원소마다 자신보다 뒤에 있는 숫자 가운데 자신보다 크면서 가장 가까이 있는 수(뒷 큰수)를 구합니다. 뒷 큰수가 존재하지 않는 원소는 -1을 담습니다.`,rules:[`numbers의 길이는 4 이상 1,000,000 이하`,`numbers의 각 원소는 1 이상 1,000,000 이하인 정수`],examples:[{input:`numbers = [2, 3, 3, 5]`,output:`[3, 5, 5, -1]`},{input:`numbers = [9, 1, 5, 3, 6, 2]`,output:`[-1, 5, 6, 6, -1, -1]`}]},keyIntuitions:[`아직 뒷 큰수를 찾지 못한 원소들의 인덱스를 스택에 담아 두면, 새로운 수 num이 들어올 때 스택 맨 위보다 크면 그 수가 바로 가장 가까운 뒷 큰수입니다.`,`새 수를 넣기 전에 자신보다 작은 값들을 모두 꺼내므로, 스택 안의 값들은 바닥에서 위로 갈수록 항상 작거나 같은 단조 감소 순서를 유지합니다.`,`따라서 스택 맨 위가 num 이상이면 그 아래에 있는 원소들은 볼 필요도 없이 모두 num 이상이므로 바로 비교를 멈출 수 있습니다.`],demo:{input:[o],label:`numbers = [9, 6, 3, 2, 5, 4, 1]`},workUnit:`숫자 비교 횟수`,approaches:[{id:`next-greater-monotonic-stack`,name:`단조 스택`,rank:`BEST`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`아직 답을 못 찾은 인덱스를 스택에 쌓아 두고, 더 큰 수가 나오면 연쇄로 꺼내 확정하는 O(N) 정석 풀이입니다.`,pros:[`각 원소가 스택에 한 번 들어가고 최대 한 번 나오므로 N = 1,000,000에서도 200만 번 안팎의 연산으로 끝납니다.`,`스택이 자연스럽게 내림차순으로 유지되어 맨 위 원소 하나만 보면 됩니다.`],cons:[`스택에 값이 아니라 인덱스를 저장해야 어느 자리의 답인지 바로 적을 수 있습니다.`],whyThisRank:`정렬이나 힙 없이 스택 하나로 대기 원소의 최솟값을 O(1)에 확인하므로 시간과 코드 길이가 모두 최적입니다.`,code:d,visualize:I},{id:`next-greater-min-heap`,name:`최소 힙 (우선순위 큐)`,rank:`ALTERNATIVE`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`대기 중인 원소를 (값, 인덱스) 최소 힙에 담아 작은 것부터 꺼내는 풀이로, 정답은 같지만 불필요한 힙 정렬 비용이 듭니다.`,pros:[`"아직 답을 못 찾은 수 가운데 가장 작은 것부터 비교한다"는 발상을 우선순위 큐로 곧장 옮길 수 있습니다.`],cons:[`넣고 꺼낼 때마다 O(log N)번의 힙 비교가 추가로 들어 단조 스택보다 느립니다.`,`JavaScript에서는 내장 힙이 없어 직접 구현해야 하는 부담도 있습니다.`],whyThisRank:`스택에 쌓기만 해도 작은 수가 그때그때 빠져나가 맨 위가 자동으로 최솟값이 되는데, 이를 깨닫지 못해 힙으로 O(N log N) 비용을 치르기 때문에 대안입니다.`,code:p,visualize:L},{id:`next-greater-nested-loop`,name:`이중 반복문으로 매번 오른쪽 훑기`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`원소마다 오른쪽을 끝까지 훑어, 내림차순 구간에서 똑같은 원소들을 되풀이해 비교하다 시간 초과가 나는 풀이입니다.`,pros:[`코드가 직관적이고 작은 예제에서는 답이 맞습니다.`],cons:[`numbers가 내림차순이면 매 원소마다 끝까지 다 확인해야 해서 N(N-1)/2번 비교합니다.`,`N이 최대 1,000,000이므로 최악 약 5,000억 번 연산해 반드시 시간 초과가 납니다.`],whyThisRank:`N ≤ 1,000,000 제한에서는 O(N²) 풀이가 절대 통과할 수 없습니다. 이미 확인한 작은 수들을 스택으로 한 번에 처리해야 합니다.`,code:h,visualize:R}],checks:{cases:[{args:[[2,3,3,5]],expected:[3,5,5,-1]},{args:[[9,1,5,3,6,2]],expected:[-1,5,6,6,-1,-1]},{args:[[5,4,3,2]],expected:[-1,-1,-1,-1]},{args:[[1,2,3,4]],expected:[2,3,4,-1]},{args:[[4,4,4,4]],expected:[-1,-1,-1,-1]},{args:[o],expected:c}],random:e=>{let t=4+Math.floor(e()*5);return[Array.from({length:t},()=>1+Math.floor(e()*9))]}}};export{z as default};