import{o as e}from"./layout-DFaYBMY_.js";import{c as t,i as n,l as r,r as i}from"./shared-CL29HWIp.js";import{t as a}from"./lane-BzDhdR3X.js";var o=[2,4,3,5,2,4],s=o.length,c=[5,1,2,1,1,0],l=e=>`[${e.join(`, `)}]`,u=e=>`${e}초(${o[e]})`,d={python:`def solution(prices):
    n = len(prices)
    # 끝까지 가격이 안 떨어졌을 때의 기간으로 초기화
    answer = [n - 1 - i for i in range(n)]
    stack = []  # 아직 가격이 떨어지지 않은 시점(인덱스)

    for i, price in enumerate(prices):
        while stack and prices[stack[-1]] > price:
            top = stack.pop()
            answer[top] = i - top  # 가격이 떨어진 시점까지의 초
        stack.append(i)

    return answer`,javascript:`function solution(prices) {
  const n = prices.length;
  // 끝까지 가격이 안 떨어졌을 때의 기간으로 초기화
  const answer = prices.map((_, i) => n - 1 - i);
  const stack = []; // 아직 가격이 떨어지지 않은 시점(인덱스)

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && prices[stack[stack.length - 1]] > prices[i]) {
      const top = stack.pop();
      answer[top] = i - top; // 가격이 떨어진 시점까지의 초
    }
    stack.push(i);
  }

  return answer;
}`},f={init:n(d,[`answer = [n - 1 - i`,`stack = []`],[`const answer = prices.map`,`const stack = []`]),check:n(d,[`for i, price in enumerate(prices):`,`while stack and prices[stack[-1]] > price:`],[`for (let i = 0; i < n; i++)`,`while (stack.length > 0 && prices[stack[stack.length - 1]] > prices[i])`]),pop:n(d,[`top = stack.pop()`,`answer[top] = i - top`],[`const top = stack.pop()`,`answer[top] = i - top`]),push:n(d,[`stack.append(i)`],[`stack.push(i)`]),done:n(d,[`return answer`],[`return answer;`])},p={python:`def solution(prices):
    n = len(prices)
    answer = [0] * n

    for i in range(n):
        for j in range(i + 1, n):
            answer[i] += 1            # 다음 초까지 1초 경과
            if prices[j] < prices[i]: # 가격이 떨어지면 즉시 멈춤
                break

    return answer`,javascript:`function solution(prices) {
  const n = prices.length;
  const answer = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      answer[i] += 1; // 다음 초까지 1초 경과
      if (prices[j] < prices[i]) break; // 가격이 떨어지면 즉시 멈춤
    }
  }

  return answer;
}`},m={init:n(p,[`answer = [0] * n`],[`const answer = new Array(n).fill(0)`]),scan:n(p,[`for i in range(n):`,`for j in range(i + 1, n):`,`answer[i] += 1`],[`for (let i = 0; i < n; i++)`,`for (let j = i + 1; j < n; j++)`,`answer[i] += 1`]),drop:n(p,[`if prices[j] < prices[i]:`,`break`],[`if (prices[j] < prices[i]) break`]),done:n(p,[`return answer`],[`return answer;`])},h={python:`def solution(prices):
    n = len(prices)
    answer = [0] * n

    for i in range(n):
        for j in range(i + 1, n):
            # 함정: 가격이 이상일 때만 +1을 해서 떨어지는 그 1초를 빼먹음
            if prices[j] >= prices[i]:
                answer[i] += 1
            else:
                break

    return answer`,javascript:`function solution(prices) {
  const n = prices.length;
  const answer = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // 함정: 가격이 이상일 때만 +1을 해서 떨어지는 그 1초를 빼먹음
      if (prices[j] >= prices[i]) {
        answer[i] += 1;
      } else {
        break;
      }
    }
  }

  return answer;
}`},g={init:n(h,[`answer = [0] * n`],[`const answer = new Array(n).fill(0)`]),keep:n(h,[`if prices[j] >= prices[i]:`,`answer[i] += 1`],[`if (prices[j] >= prices[i])`,`answer[i] += 1`]),drop:n(h,[`else:`,`break`],[`} else {`,`break;`]),done:n(h,[`return answer`],[`return answer;`])},_=84,v=66,y=8,b=e({x:_,y:0,w:v,h:48,gap:y}),x=78,S=e({x:_,y:x,w:v,h:48,gap:y}),C=156,w=s*74-y+8,T=_+w+152,E=212,D={id:`stack`,x:_,y:160,slotW:v,slotH:44,gap:y,max:s},O=e=>`p:${e}`,k=e=>`ans:${e}`,A=e=>`stk:${e}`,j=(e,t,n,r)=>({id:e,kind:`text`,rect:{x:0,y:n,w:76,h:r},text:t});function M(e){let t=[j(`row:p`,`가격`,0,48),j(`row:ans`,`유지 초`,x,48),j(`row:stk`,e,C,52),{id:`stk:bg`,kind:`zone`,rect:{x:80,y:C,w,h:52}}];for(let e=0;e<s;e++)t.push({id:O(e),kind:`cell`,rect:b(e),tone:`plain`,text:String(o[e]),tag:`${e}초`},{id:k(e),kind:`cell`,rect:S(e),tone:`plain`,text:`-`,tag:`${e}초`});return{width:T,height:E,items:t}}var N=e=>({type:`wait`,ms:e}),P=()=>t([{type:`unfocus`},{type:`clearMarks`}]),F=(e,t,n)=>({type:`set`,id:e,patch:{tone:t,...n===void 0?{}:{text:n}}});function I(){let e=new r(M(`단조 스택`)),n=new a(e,D),c=o.map((e,t)=>s-1-t),d=[],p=0,m=`-`,h=()=>({work:p,variables:{i:m,stack:l(d.map(u)),answer:l(c)}});e.step({title:`끝까지 유지될 때의 기간 ${l(c)}으로 초기화`,codeHighlights:f.init,...h()}),e.phase(`초기화`,`끝까지 가격이 안 떨어지면 유지 기간은 (마지막 초 - 현재 초)입니다. 먼저 ${l(c)}로 채워 두고, 가격이 떨어지는 시점만 스택에서 꺼내 고칩니다.`),e.do(...t(c.map((e,t)=>({type:`set`,id:k(t),patch:{text:`${e}초`,tone:`queued`},pop:!0}))),N(600));for(let r=0;r<s;r++){let a=o[r];for(m=r;d.length>0&&o[d.at(-1)]>a;){let s=d.pop(),l=o[s];p++,c[s]=r-s,e.step({title:`${r}초(가격 ${a}): 스택 맨 위 ${s}초(${l}) 하락 → ${r-s}초 확정`,codeHighlights:f.pop,...h()}),e.phase(`하락 비교`,`현재 ${r}초 가격 ${i(a,`이`,`가`)} 스택 맨 위 ${s}초의 가격 ${l}보다 작아 가격이 떨어졌습니다.`,f.check),e.do({type:`focus`,ids:[O(r),O(s),A(s),k(s)]},F(O(r),`current`),{type:`arrow`,from:O(r),to:O(s),verdict:`bad`,label:`${a} < ${l}`},N(260)),e.phase(`꺼내서 확정`,`${s}초를 스택에서 꺼내고 유지 기간을 ${r} - ${s} = ${r-s}초로 확정합니다.`,f.pop),n.pop(k(s)),e.do(...t([{type:`set`,id:k(s),patch:{text:`${r-s}초`,tone:`visited`},pop:!0},F(O(s),`visited`),...P()],!0),N(260))}let s=d.at(-1);s!==void 0&&p++,d.push(r),e.step({title:s===void 0?`${r}초(가격 ${a}): 빈 스택에 넣기`:`${r}초(가격 ${a}): ${s}초(${o[s]}) ≤ ${a} 유지 → 스택에 넣기`,codeHighlights:f.push,...h()}),s!==void 0&&(e.phase(`유지 확인`,`스택 맨 위 ${s}초(${o[s]}) ≤ 현재 ${r}초(${a})이므로 가격이 떨어지지 않았습니다.`,f.check),e.do({type:`focus`,ids:[O(s),O(r),A(s)]},F(O(r),`current`),{type:`arrow`,from:O(s),to:O(r),verdict:`good`,label:`${o[s]} ≤ ${a}`},N(250))),e.phase(`스택에 넣기`,`${r}초(${a})를 스택에 넣고 다음 초로 넘어갑니다.`,f.push),n.push({id:A(r),text:u(r),tone:`queued`},O(r)),e.do(...t([F(O(r),`queued`),...P()],!0),N(240))}return e.step({title:`스택에 남은 ${l(d.map(e=>`${e}초`))}는 끝까지 유지 — 정답 ${l(c)}`,codeHighlights:f.done,...h(),answer:[...c],isKeyframe:!0}),e.phase(`마무리`,`스택에 남아 있는 0초, 4초, 5초는 끝까지 가격이 떨어지지 않았으므로 처음 적어 둔 기간이 그대로 정답 ${l(c)}입니다.`,f.done),e.do(...t([...Array.from({length:s},(e,t)=>F(k(t),`path`)),...Array.from({length:s},(e,t)=>F(O(t),`visited`)),...n.ids.map(e=>F(e,`path`))]),N(400)),e.finish()}function L(){let e=new r(M(`비교 메모`)),n=Array(s).fill(0),i=0,a=`-`,c=()=>({work:i,variables:{i:a,answer:l(n)}});e.step({title:`answer를 모두 0으로 두고 0초부터 차례대로 뒤쪽 훑기`,codeHighlights:m.init,...c()}),e.phase(`초기화`,`스택 없이 시점 i마다 뒤쪽 시점 j를 하나씩 비교해 떨어지는 순간 멈추는 이중 반복문 풀이입니다.`),e.do(...t(n.map((e,t)=>({type:`set`,id:k(t),patch:{text:`0초`},pop:!0}))),N(500));for(let r=0;r<s;r++){a=r;let u=[],d;for(let e=r+1;e<s;e++)if(u.push(e),i++,n[r]++,o[e]<o[r]){d=e;break}let f=r===s-1;if(e.step({title:f?`5초(가격 4): 뒤쪽 시점 없음 → 0초 — 정답 ${l(n)}`:d===void 0?`${r}초(가격 ${o[r]}): 끝까지 안 떨어짐 (${u.length}번 비교) → ${n[r]}초`:`${r}초(가격 ${o[r]}): ${d}초(${o[d]})에서 하락 → ${n[r]}초`,codeHighlights:f?m.done:d===void 0?m.scan:m.drop,...c(),...f?{answer:[...n],isKeyframe:!0}:{}}),e.phase(`뒤쪽 훑기`,f?`마지막 5초는 뒤에 남은 시점이 없어 유지 기간이 0초입니다. 전체 정답은 ${l(n)}입니다.`:d===void 0?`${r}초(${o[r]}) 뒤의 ${u.length}개 시점을 끝까지 다 비교해 ${n[r]}초를 기록합니다.`:`${r}초(${o[r]}) 뒤를 훑다가 ${d}초(${o[d]})에서 가격이 떨어져 멈춥니다. 거기까지 걸린 ${n[r]}초를 기록합니다.`,f?m.done:d===void 0?m.scan:m.drop),u.length>0){e.do({type:`focus`,ids:[O(r),k(r),...u.map(O)]},F(O(r),`current`));for(let t of u){let n=o[t]<o[r];e.do({type:`arrow`,from:O(r),to:O(t),verdict:n?`bad`:`good`,label:n?`${o[t]} < ${o[r]} 멈춤`:`${o[t]} ≥ ${o[r]}`})}e.do({type:`set`,id:k(r),patch:{text:`${n[r]}초`,tone:`visited`},pop:!0},N(260),...t([F(O(r),`visited`),...P()]))}else e.do(...t([...Array.from({length:s},(e,t)=>F(k(t),`path`,`${n[t]}초`)),F(O(r),`visited`)]),N(400))}return e.finish()}function R(){let e=new r(M(`오답 원인`)),n=Array(s).fill(0),i=0,a=`-`,u=()=>({work:i,variables:{i:a,answer:l(n)}});e.step({title:`answer를 0으로 두고 prices[j] >= prices[i]일 때만 +1 세기`,codeHighlights:g.init,...u()}),e.phase(`초기화`,`가격이 떨어지지 않은 기간이라는 말만 보고 prices[j] >= prices[i]일 때만 +1을 하고, 작아지면 더하지 않고 바로 break하는 흔한 실수입니다.`),e.do(...t(n.map((e,t)=>({type:`set`,id:k(t),patch:{text:`0초`},pop:!0}))),N(500));for(let r=0;r<s-1;r++){a=r;let l=[],d;for(let e=r+1;e<s;e++)if(l.push(e),i++,o[e]>=o[r])n[r]++;else{d=e;break}let f=n[r]!==c[r];e.step({title:f?`${r}초(가격 ${o[r]}): ${d}초까지 1초를 빼먹어 ${n[r]}초 기록 (정답은 ${c[r]}초)`:`${r}초(가격 ${o[r]}): 끝까지 안 떨어져 ${n[r]}초 기록`,codeHighlights:d===void 0?g.keep:g.drop,...u()}),e.phase(f?`1초 누락`:`유지 확인`,f?`${d}초(${o[d]})에서 가격이 떨어지자 +1을 하지 않고 바로 break해서, 떨어지기까지 걸린 1초가 빠진 ${n[r]}초가 됩니다.`:`뒤쪽 시점이 모두 ${o[r]} 이상이라 ${n[r]}초가 그대로 맞습니다.`,d===void 0?g.keep:g.drop),e.do({type:`focus`,ids:[O(r),k(r),...l.map(O)]},F(O(r),`current`));for(let t of l){let n=o[t]<o[r];e.do({type:`arrow`,from:O(r),to:O(t),verdict:n?`bad`:`good`,label:n?`${o[t]} < ${o[r]} (+0)`:`${o[t]} ≥ ${o[r]} (+1)`})}e.do({type:`set`,id:k(r),patch:{text:`${n[r]}초`,tone:f?`bad`:`visited`},pop:!0},N(260),...t([F(O(r),`visited`),...P()]))}a=s-1,e.step({title:`오답 확인: 이 풀이는 ${l(n)}, 정답은 ${l(c)}`,codeHighlights:g.done,...u(),answer:[...n],isKeyframe:!0}),e.phase(`오답 확인`,`바로 다음 초에 가격이 떨어져도 그 1초 동안은 가격이 유지된 것으로 세어야 합니다. 1·2·3초에서 1초씩 빠져 오답 ${l(n)}이 나왔습니다.`,g.done);let d=_+w+8;return e.do(...t([{type:`add`,item:{id:`wrong`,kind:`token`,rect:{x:d,y:C,w:140,h:24},tone:`bad`,text:`오답 ${l(n)}`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:d,y:184,w:140,h:24},tone:`good`,text:`정답 ${l(c)}`}}]),N(500)),e.finish()}var z={id:`stock-price`,title:`주식가격`,level:2,category:`stack-queue`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42584`,description:{summary:`초 단위로 기록된 주식가격 배열 prices가 주어질 때, 각 시점의 가격이 떨어지지 않고 유지된 기간이 몇 초인지 구합니다. 바로 다음 초에 가격이 떨어져도 1초 동안은 유지된 것으로 셉니다.`,rules:[`prices의 각 가격은 1 이상 10,000 이하인 자연수`,`prices의 길이는 2 이상 100,000 이하`],examples:[{input:`prices = [1, 2, 3, 2, 3]`,output:`[4, 3, 1, 1, 0]`}]},keyIntuitions:[`바로 다음 초에 가격이 떨어져도 그 시점까지 흐른 1초를 포함하므로, 시점 top의 가격이 시점 i에서 처음 떨어졌다면 유지 기간은 정확히 i - top초입니다.`,`아직 가격이 떨어지지 않은 시점들을 스택에 모아 두면 스택 안의 가격은 자연스럽게 오름차순(비내림차순)을 이룹니다.`,`새 가격이 들어왔을 때 스택 맨 위보다 작으면 떨어졌다는 뜻이므로, 작지 않을 때까지 꺼내며 i - top으로 답을 한꺼번에 확정합니다.`],demo:{input:[o],label:`prices = [2, 4, 3, 5, 2, 4]`},workUnit:`가격 비교 횟수`,approaches:[{id:`stock-monotonic-stack`,name:`단조 스택`,rank:`BEST`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`아직 떨어지지 않은 시점을 스택에 모아 두었다가, 더 작은 가격이 나올 때만 꺼내어 i - top으로 확정하는 O(N) 풀이입니다.`,pros:[`모든 시점이 스택에 한 번 들어가고 최대 한 번 나오므로 전체 비교 횟수가 O(N)입니다.`,`prices 길이가 100,000이어도 순식간에 끝납니다.`],cons:[`스택에 가격 자체가 아니라 시점(인덱스)을 넣어야 기간 i - top을 바로 구할 수 있습니다.`],whyThisRank:`중복 비교 없이 한 번의 순회로 모든 시점의 첫 하락 위치를 찾아내어 시간 복잡도가 가장 낮습니다.`,code:d,visualize:I},{id:`stock-nested-loop`,name:`이중 반복문 (첫 하락에서 break)`,rank:`ALTERNATIVE`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`시점마다 뒤쪽을 차례로 보며 1초씩 더하다가 가격이 떨어지면 멈추는 풀이로, 직관적이지만 가격이 안 떨어지는 구간을 매번 다시 훑습니다.`,pros:[`스택 없이 이중 반복문과 break만으로 구현할 수 있어 코드가 단순합니다.`,`초반에 가격이 빨리 떨어지는 입력에서는 일찍 멈춥니다.`],cons:[`가격이 계속 오르거나 유지되면 매 시점마다 끝까지 다 훑어야 해서 최대 N(N-1)/2번(약 50억 번) 비교합니다.`],whyThisRank:`정답은 같지만 이미 확인한 오름차순 구간을 시점마다 되풀이해 비교하므로 정석(단조 스택)보다 비교 횟수가 훨씬 많습니다.`,code:p,visualize:L},{id:`stock-miss-drop-second`,name:`유지될 때만 +1 하고 하락 시 바로 break`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`prices[j] >= prices[i]일 때만 +1을 해서, 가격이 떨어지기까지 걸린 마지막 1초를 빼먹는 가장 흔한 오답입니다.`,pros:[`"가격이 떨어지지 않은 기간"이라는 문장을 그대로 조건문으로 옮긴 형태라 처음 떠올리기 쉽습니다.`],cons:[`예를 들어 3에서 바로 다음 초에 2로 떨어지면 1초 동안은 유지된 것인데 0초라고 답합니다.`,`중간에 가격이 한 번이라도 떨어지는 모든 시점에서 답이 1초씩 모자랍니다.`],whyThisRank:`다음 초 j를 확인하는 순간 이미 1초가 흐른 것이므로, 먼저 1초를 더한 뒤 하락 여부를 검사하거나 i - top으로 계산해야 합니다.`,code:h,visualize:R}],checks:{cases:[{args:[[1,2,3,2,3]],expected:[4,3,1,1,0]},{args:[[5,4,3,2,1]],expected:[1,1,1,1,0]},{args:[[1,2,3,4,5]],expected:[4,3,2,1,0]},{args:[[3,3,3]],expected:[2,1,0]},{args:[o],expected:c}],random:e=>{let t=2+Math.floor(e()*7);return[Array.from({length:t},()=>1+Math.floor(e()*9))]}}};export{z as default};