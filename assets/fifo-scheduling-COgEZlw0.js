import{n as e}from"./layout-DFaYBMY_.js";import{a as t,c as n,i as r,l as i,s as a}from"./shared-CL29HWIp.js";var o=15,s=[4,6,10],c=s.length,l=Math.max(...s)*Math.ceil(o/c),u=e=>s.map(t=>1+Math.floor(e/t)),d=e=>e<0?0:a(u(e)),f={python:`import math

def solution(n, cores):
    if n <= len(cores):
        return n

    left = 0
    right = max(cores) * math.ceil(n / len(cores))
    time = right
    while left <= right:
        mid = (left + right) // 2
        # mid초까지 시작된 총 작업 수 (0초에 시작하는 len(cores)개 포함)
        started = len(cores) + sum(mid // c for c in cores)
        if started >= n:
            time = mid
            right = mid - 1
        else:
            left = mid + 1

    # time - 1초까지 시작된 작업 수를 빼고, time초에 비는 코어를 앞에서부터 확인
    done_before = len(cores) + sum((time - 1) // c for c in cores)
    remain = n - done_before
    for i, c in enumerate(cores):
        if time % c == 0:
            remain -= 1
            if remain == 0:
                return i + 1`,javascript:`function solution(n, cores) {
  if (n <= cores.length) return n;

  let left = 0;
  let right = Math.max(...cores) * Math.ceil(n / cores.length);
  let time = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // mid초까지 시작된 총 작업 수 (0초에 시작하는 cores.length개 포함)
    let started = cores.length;
    for (const c of cores) started += Math.floor(mid / c);
    if (started >= n) {
      time = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  // time - 1초까지 시작된 작업 수를 빼고, time초에 비는 코어를 앞에서부터 확인
  let doneBefore = cores.length;
  for (const c of cores) doneBefore += Math.floor((time - 1) / c);
  let remain = n - doneBefore;
  for (let i = 0; i < cores.length; i++) {
    if (time % cores[i] === 0) {
      remain--;
      if (remain === 0) return i + 1;
    }
  }
  return -1;
}`},p={start:r(f,[`left = 0`,`right = max(cores) * math.ceil(n / len(cores))`,`time = right`],[`let left = 0`,`let right = Math.max(...cores)`,`let time = right`]),mid:r(f,[`while left <= right:`,`mid = (left + right) // 2`,`started = len(cores) + sum(mid // c`],[`while (left <= right)`,`const mid = Math.floor`,`for (const c of cores) started +=`]),pass:r(f,[`if started >= n:`,`time = mid`,`right = mid - 1`],[`if (started >= n)`,`time = mid`,`right = mid - 1`]),fail:r(f,[`if started >= n:`,`else:`,`left = mid + 1`],[`if (started >= n)`,`} else {`,`left = mid + 1`]),remain:r(f,[`done_before = len(cores) + sum((time - 1) // c`,`remain = n - done_before`],[`let doneBefore = cores.length`,`let remain = n - doneBefore`]),pick:r(f,[`for i, c in enumerate(cores):`,`if time % c == 0:`,`if remain == 0:`,`return i + 1`],[`for (let i = 0; i < cores.length; i++)`,`if (time % cores[i] === 0)`,`if (remain === 0) return i + 1`])},m={python:`import heapq

def solution(n, cores):
    if n <= len(cores):
        return n
    # (다음에 비는 시각, 코어 번호) 최소 힙
    heap = [(0, i + 1) for i in range(len(cores))]
    heapq.heapify(heap)

    last_core = 1
    for _ in range(n):
        avail, idx = heapq.heappop(heap)
        last_core = idx
        heapq.heappush(heap, (avail + cores[idx - 1], idx))
    return last_core`,javascript:`function solution(n, cores) {
  if (n <= cores.length) return n;
  // [다음에 비는 시각, 코어 번호] 최소 힙
  const heap = cores.map((_, i) => [0, i + 1]);
  const less = (a, b) => (a[0] !== b[0] ? a[0] < b[0] : a[1] < b[1]);
  const siftDown = (i) => {
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      let best = i;
      if (l < heap.length && less(heap[l], heap[best])) best = l;
      if (r < heap.length && less(heap[r], heap[best])) best = r;
      if (best === i) return;
      [heap[i], heap[best]] = [heap[best], heap[i]];
      i = best;
    }
  };

  let lastCore = 1;
  for (let k = 0; k < n; k++) {
    const [avail, idx] = heap[0];
    lastCore = idx;
    heap[0] = [avail + cores[idx - 1], idx];
    siftDown(0);
  }
  return lastCore;
}`},h={start:r(m,[`heap = [(0, i + 1) for i in range(len(cores))]`,`heapq.heapify(heap)`],[`const heap = cores.map((_, i) => [0, i + 1])`]),step:r(m,[`for _ in range(n):`,`avail, idx = heapq.heappop(heap)`,`heapq.heappush(heap`],[`for (let k = 0; k < n; k++)`,`const [avail, idx] = heap[0]`,`siftDown(0)`]),done:r(m,[`return last_core`],[`return lastCore`])},g={python:`def solution(n, cores):
    t = 0
    remain = n
    while True:
        # 매초 모든 코어를 돌며 t초에 비는 코어에 작업을 배정
        for i, c in enumerate(cores):
            if t % c == 0:
                remain -= 1
                if remain == 0:
                    return i + 1
        t += 1`,javascript:`function solution(n, cores) {
  let t = 0;
  let remain = n;
  while (true) {
    // 매초 모든 코어를 돌며 t초에 비는 코어에 작업을 배정
    for (let i = 0; i < cores.length; i++) {
      if (t % cores[i] === 0) {
        remain--;
        if (remain === 0) return i + 1;
      }
    }
    t++;
  }
}`},_={start:r(g,[`t = 0`,`remain = n`],[`let t = 0`,`let remain = n`]),loop:r(g,[`while True:`,`for i, c in enumerate(cores):`,`if t % c == 0:`,`t += 1`],[`while (true)`,`for (let i = 0; i < cores.length; i++)`,`if (t % cores[i] === 0)`,`t++`]),done:r(g,[`if remain == 0:`,`return i + 1`],[`if (remain === 0) return i + 1`])},v=620,y=338,b={x:0,y:0,w:v,h:y},x=e({x:96,w:380,min:0,max:l}),S=e=>({x:96,y:126+e*50,w:380,h:40}),C=286,w=e=>`core:${e}`,T=e=>`calc:${e}`;function E(){let e=[{id:`track`,kind:`line`,rect:b,tone:`trail`,points:[[x(0),100],[x(l),100]]}];return s.forEach((t,n)=>{let r=S(n);e.push({id:w(n),kind:`token`,rect:{x:12,y:r.y+4,w:78,h:32},tone:`plain`,text:`${n+1}번 (${t}초)`},{id:`row:${n}`,kind:`zone`,rect:r},{id:T(n),kind:`text`,rect:{x:484,y:r.y+6,w:124,h:28},text:`-`})}),e.push({id:`sum:label`,kind:`text`,rect:{x:12,y:C,w:78,h:34},text:`투입 작업`},{id:`tally`,kind:`bar`,rect:{x:96,y:C,w:310,h:34},fill:0,text:`0개`},{id:`goal`,kind:`token`,rect:{x:416,y:C,w:96,h:34},tone:`plain`,text:`n = ${o}개`,tag:`목표`}),{width:v,height:y,items:e}}var D=(e,{id:t,kind:n,...r})=>e.has(t)?{type:`set`,id:t,patch:r}:{type:`add`,item:{id:t,kind:n,...r}},O=(e,t)=>[{id:`range`,kind:`zone`,rect:{x:x(e-.5),y:88,w:x(t+.5)-x(e-.5),h:24}},{id:`left`,kind:`token`,rect:{x:x(e-.5)-74,y:28,w:74,h:24},tone:`plain`,text:`left ${e}`},{id:`right`,kind:`token`,rect:{x:x(t+.5),y:28,w:78,h:24},tone:`plain`,text:`right ${t}`}],k=e=>({id:`time:ans`,kind:`token`,rect:{x:x(e)-44,y:0,w:88,h:24},tone:`path`,text:`time ${e}초`}),A=(e,t,n,r)=>[D(e,{id:`probe`,kind:`token`,rect:{x:x(t)-2,y:84,w:4,h:186},tone:r}),D(e,{id:`probe:label`,kind:`token`,rect:{x:x(t)-44,y:56,w:88,h:26},tone:r,text:n})];function j(e){let t=u(e),n=a(t);return[...t.map((t,n)=>({type:`set`,id:T(n),patch:{text:`1+⌊${e}/${s[n]}⌋ = ${t}개`,tone:`visited`}})),{type:`set`,id:`tally`,patch:{fill:Math.min(1,n/o),text:`${n}개`,tone:n>=o?`good`:`bad`}}]}function M(){let e=new i(E()),[r,f]=[0,l],m=f,h=0;for(e.step({title:`탐색 구간 0 ~ ${l}초 정하기`,codeHighlights:p.start,work:h,variables:{left:r,right:f,time:m,n:o}}),e.phase(`시작`,`0초에는 코어 ${c}개가 동시에 작업을 시작하고, T초까지 시작된 총 작업 수는 M + Σ⌊T ÷ c⌋개입니다.`,p.start),e.do(...n([...O(r,f).map(t=>D(e,t)),D(e,k(m))]));r<=f;){let[i,s]=[r,f],l=Math.floor((r+f)/2),d=u(l),g=a(d);h+=c;let _=g>=o;_?[m,f]=[l,l-1]:r=l+1;let v=_?p.pass:p.fail;e.step({title:`mid = ${l}초 → 투입 ${g}개 (${_?`충분, 더 이르게`:`부족, 더 늦게`})`,codeHighlights:v,work:h,variables:{left:r,right:f,mid:l,started:g,time:m}}),e.phase(`가운데 고르기`,`mid = ⌊(${i} + ${s}) ÷ 2⌋ = ${l}초까지 투입된 작업 수를 셉니다.`,p.mid),e.do(...n([...A(e,l,`mid ${l}초`,`current`),...j(l)])),e.phase(`범위 줄이기`,_?`${g}개 ≥ ${o}개이므로 time = ${t(l)} 저장하고 right = ${t(f)} 줄입니다.`:`${g}개 < ${o}개이므로 시간을 늘려 left = ${t(r)} 올립니다.`,v);let[y,b,x]=O(r,f);e.do(...n([D(e,y),D(e,_?x:b),..._?[D(e,k(m))]:[]]))}let g=d(m-1),_=o-g;h+=c,e.step({title:`${m-1}초까지 ${g}개 투입 → ${m}초에 남은 ${_}개 배정`,codeHighlights:p.remain,work:h,variables:{time:m,doneBefore:g,remain:_}}),e.phase(`직전 시각 확인`,`마지막 작업이 시작되는 시각은 ${m}초입니다. 바로 직전인 ${m-1}초까지 이미 ${g}개가 투입되었으므로 ${m}초에 ${_}번째로 비는 코어를 찾으면 됩니다.`,p.remain),e.do(...n([{type:`remove`,id:`range`},...A(e,m-1,`${m-1}초 (${g}개)`,`visited`),...j(m-1)]));let v=1;for(let e=0;e<c;e++)if(h++,m%s[e]===0&&(_--,_===0)){v=e+1;break}return e.step({title:`${m}초에 비는 코어 확인 → ${v}번 코어 정답`,codeHighlights:p.pick,work:h,variables:{time:m,"14번째 작업":`1번 코어`,"15번째 작업":`${v}번 코어`,answer:v},answer:v,isKeyframe:!0}),e.phase(`정답`,`${m}초에 1번 코어(24 % 4 == 0)가 14번째 작업을 맡고, 이어서 2번 코어(24 % 6 == 0)가 15번째 작업을 맡으므로 정답은 ${v}번 코어입니다.`,p.pick),e.do(...n([...A(e,m,`${m}초`,`path`),...j(m),{type:`set`,id:w(0),patch:{tone:`visited`}},{type:`set`,id:w(v-1),patch:{tone:`path`}}])),e.finish()}function N(){let e=new i(E()),t=0;e.step({title:`0초에 비어 있는 코어 3개를 최소 힙에 넣기`,codeHighlights:h.start,work:t,variables:{"남은 작업":o,heap:`[(0,1), (0,2), (0,3)]`}}),e.phase(`시작`,`(다음에 비는 시각, 코어 번호)를 최소 힙에 넣고, 작업 15개를 순서대로 하나씩 꺼내 배정합니다.`,h.start),e.do(...n(A(e,0,`0초`,`current`)));let r=s.map((e,t)=>[0,t+1]),a=[0,0,0],l=1,u=0;for(let e=1;e<=3;e++){r.sort((e,t)=>e[0]-t[0]||e[1]-t[1]);let[e,n]=r.shift();a[n-1]++,l=n,u=e,r.push([e+s[n-1],n]),t+=c}e.step({title:`1~3번째 작업 → 0초에 1, 2, 3번 코어 배정`,codeHighlights:h.step,work:t,variables:{"투입 작업":3,lastCore:l,heap:JSON.stringify(r)}}),e.phase(`초기 배정`,`0초에 비어 있는 1, 2, 3번 코어가 작업 1, 2, 3을 맡고 다음 완료 시각 (4,1), (6,2), (10,3)으로 힙에 들어갑니다.`,h.step),e.do(...n([...a.map((e,t)=>({type:`set`,id:T(t),patch:{text:`${e}개 맡음`}})),{type:`set`,id:`tally`,patch:{fill:3/o,text:`3개`,tone:`chosen`}}]));for(let e=4;e<=13;e++){r.sort((e,t)=>e[0]-t[0]||e[1]-t[1]);let[e,n]=r.shift();a[n-1]++,l=n,u=e,r.push([e+s[n-1],n]),t+=c}e.step({title:`4~13번째 작업 빨리 감기 (힙에서 하나씩 꺼내 배정)`,codeHighlights:h.step,work:t,variables:{"투입 작업":13,시각:`${u}초`,lastCore:l}}),e.phase(`빨리 감기`,`작업마다 힙에서 가장 먼저 비는 코어를 꺼내고 다시 넣기를 반복해 ${u}초까지 13개를 배정했습니다.`,h.step),e.do(...n([...A(e,u,`${u}초`,`current`),...a.map((e,t)=>({type:`set`,id:T(t),patch:{text:`${e}개 맡음`}})),{type:`set`,id:`tally`,patch:{fill:13/o,text:`13개`,tone:`chosen`}}]));for(let e=14;e<=o;e++){r.sort((e,t)=>e[0]-t[0]||e[1]-t[1]);let[e,n]=r.shift();a[n-1]++,l=n,u=e,r.push([e+s[n-1],n]),t+=c}return e.step({title:`${o}번째 작업 → ${u}초에 ${l}번 코어 배정, 정답`,codeHighlights:h.done,work:t,variables:{"투입 작업":o,시각:`${u}초`,answer:l,"비교 횟수":t},answer:l,isKeyframe:!0}),e.phase(`정답`,`${u}초에 1번 코어가 14번째, ${l}번 코어가 15번째 작업을 맡아 정답은 ${l}번입니다. 작업마다 힙 연산을 하므로 이분 탐색보다 연산이 더 듭니다.`,h.done),e.do(...n([...A(e,u,`${u}초`,`path`),...a.map((e,t)=>({type:`set`,id:T(t),patch:{text:`${e}개 맡음`,tone:`good`}})),{type:`set`,id:`tally`,patch:{fill:1,text:`${o}개`,tone:`good`}},{type:`set`,id:w(l-1),patch:{tone:`path`}}])),e.finish()}function P(){let e=new i(E()),t=0;e.step({title:`0초부터 1초씩 늘려 가며 매초 모든 코어 확인`,codeHighlights:_.start,work:t,variables:{t:0,remain:o}}),e.phase(`시작`,`시간 t를 0초부터 1초씩 흘려보내며, 매초마다 모든 코어를 돌아 t % c == 0인지 확인합니다.`,_.start),e.do(...n(A(e,0,`t 0초`,`current`)));let r=o,a=[0,0,0];for(let i=0;i<=2;i++){for(let e=0;e<c;e++)t++,i%s[e]===0&&(a[e]++,r--);e.step({title:`t = ${i}초 → 남은 작업 ${r}개`,codeHighlights:_.loop,work:t,variables:{t:i,remain:r,"코어 확인":t}}),e.phase(`1초 진행`,i===0?`0초에는 3개 코어가 모두 비어 있어 작업을 하나씩 시작합니다.`:`t = ${i}초에는 새로 끝나는 코어가 없는데도 코어 3개를 모두 확인하고 넘어갑니다.`,_.loop),e.do(...n([...A(e,i,`t ${i}초`,`current`),...a.map((e,t)=>({type:`set`,id:T(t),patch:{text:`${e}개 맡음`}})),{type:`set`,id:`tally`,patch:{fill:(o-r)/o,text:`${o-r}개`,tone:`bad`}}]))}for(let e=3;e<=23;e++)for(let n=0;n<c;n++)t++,e%s[n]===0&&(a[n]++,r--);e.step({title:`t = 3 ~ 23초 빨리 감기 (매초 코어 3개 전부 확인)`,codeHighlights:_.loop,work:t,variables:{t:23,remain:r,"코어 확인":t}}),e.phase(`빨리 감기`,`3초부터 23초까지 아무 일도 일어나지 않는 초에도 매번 코어 전체를 확인하며 ${t}번이나 돌았습니다.`,_.loop),e.do(...n([...A(e,23,`t 23초`,`current`),...a.map((e,t)=>({type:`set`,id:T(t),patch:{text:`${e}개 맡음`}})),{type:`set`,id:`tally`,patch:{fill:(o-r)/o,text:`${o-r}개`,tone:`bad`}}]));let l=1;for(let e=0;e<c;e++)if(t++,24%s[e]==0&&(a[e]++,r--,r===0)){l=e+1;break}return e.step({title:`t = 24초 → ${l}번 코어에서 마지막 작업 시작`,codeHighlights:_.done,work:t,variables:{t:24,remain:0,answer:l,"총 코어 확인":t},answer:l,isKeyframe:!0}),e.phase(`정답`,`24초에 ${l}번 코어를 찾았지만 코어를 총 ${t}번 확인했습니다. 코어 1만 개, 작업 시간 1만 초, 작업 5만 개이면 수억 번 이상 반복해 시간 초과입니다.`,_.done),e.do(...n([...A(e,24,`t 24초`,`path`),{type:`set`,id:`tally`,patch:{fill:1,text:`${o}개`,tone:`good`}},{type:`set`,id:w(l-1),patch:{tone:`path`}}])),e.finish()}var F={id:`fifo-scheduling`,title:`선입 선출 스케줄링`,level:3,category:`binary-search`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/12920`,description:{summary:`동일한 작업 n개를 여러 CPU 코어가 선입선출로 처리합니다. 코어마다 작업 1개를 처리하는 시간이 다르고, 동시에 여러 코어가 비면 앞 번호 코어부터 작업을 맡을 때, 마지막(n번째) 작업을 처리하는 코어의 번호를 구합니다.`,rules:[`코어의 수(cores의 길이)는 2 이상 10,000 이하입니다.`,`코어별 처리 시간 cores[i]는 10,000 이하의 자연수입니다.`,`처리해야 할 작업 수 n은 50,000 이하의 자연수입니다.`,`코어 번호는 1번부터 시작합니다.`],examples:[{input:`n = 6, cores = [1, 2, 3]`,output:`2`}]},keyIntuitions:[`0초에 모든 코어가 작업 1개씩을 바로 시작하므로, 시각 T초까지 투입된 총 작업 수는 len(cores) + Σ⌊T ÷ cores[i]⌋개입니다.`,`투입된 작업 수가 n개 이상이 되는 가장 이른 시각 T를 이분 탐색으로 찾으면, 그 T초가 바로 마지막 작업이 시작되는 시각입니다.`,`T - 1초까지 이미 투입된 작업 수를 뺀 뒤, T초에 딱 나누어떨어지는(T % cores[i] == 0) 코어를 앞 번호부터 세면 마지막 코어를 정확히 찾습니다.`],demo:{input:[o,s],label:`n = 15, cores = [4, 6, 10]`},workUnit:`코어 확인·비교 횟수`,approaches:[{id:`fifo-binary`,name:`시간을 이분 탐색`,rank:`BEST`,timeComplexity:`O(M log(n × maxC))`,spaceComplexity:`O(1)`,verdict:`n번째 작업이 투입되는 시각 T를 이분 탐색으로 찾고, T - 1초까지의 작업 수를 빼 마지막 코어를 바로 구합니다.`,pros:[`시각 T가 정해지면 나눗셈 합산 한 번 O(M)으로 그때까지 투입된 총 작업 수를 구합니다.`,`이분 탐색 횟수가 20번 안팎이라 코어 1만 개, 작업 5만 개도 순식간에 끝납니다.`],cons:[`T초에 여러 코어가 동시에 비므로, 반드시 T - 1초까지의 작업 수를 먼저 뺀 뒤 앞에서부터 남은 개수를 세어야 합니다.`,`n이 코어 수 이하일 때(0초에 바로 끝날 때) 예외 처리를 챙겨야 합니다.`],whyThisRank:`작업 하나씩 시뮬레이션하지 않고도 "T초까지 시작된 작업 수" 공식으로 시간을 건너뛸 수 있어 가장 빠르고 메모리를 쓰지 않습니다.`,code:f,visualize:M},{id:`fifo-heap`,name:`최소 힙으로 작업을 하나씩 배정`,rank:`ALTERNATIVE`,timeComplexity:`O(n log M)`,spaceComplexity:`O(M)`,verdict:`(다음에 비는 시각, 코어 번호) 최소 힙에서 작업을 하나씩 배정하는 풀이로, 이분 탐색보다 연산과 메모리가 더 듭니다.`,pros:[`문제의 스케줄링 규칙(가장 먼저 비는 코어, 동률이면 앞 번호 코어)을 그대로 옮겨 직관적입니다.`],cons:[`작업 n개마다 힙 연산을 반복하고 크기 M짜리 힙을 유지해야 해서 정석보다 느리고, n이 더 커지면 시간 초과가 납니다.`],whyThisRank:`작은 입력이나 n = 50,000 수준에서는 동작하지만, 같은 코어들의 주기적인 반복을 한 번의 나눗셈으로 줄이지 못해 정석보다 손해를 봅니다.`,code:m,visualize:N},{id:`fifo-tick-linear`,name:`0초부터 1초씩 늘려 가며 매초 모든 코어 확인`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(T × M)`,spaceComplexity:`O(1)`,verdict:`시간을 1초씩 흘려보내며 매초 모든 코어가 비었는지 확인하는 풀이로, 효율성 테스트에서 시간 초과가 납니다.`,pros:[`코드가 매우 짧고 단순합니다.`],cons:[`아무 코어도 끝나지 않는 초에도 코어 1만 개를 매번 확인해 최악에는 수억 번 이상 반복합니다.`],whyThisRank:`시간을 1초씩 전진시키는 전형적인 시간 초과 함정입니다. 시간에 따라 투입 작업 수가 단조 증가하므로 이분 탐색으로 바로 점프해야 합니다.`,code:g,visualize:P}],checks:{cases:[{args:[6,[1,2,3]],expected:2},{args:[o,s],expected:2},{args:[2,[5,10,15]],expected:2},{args:[5,[2,2]],expected:1}],random:e=>{let t=2+Math.floor(e()*4),n=Array.from({length:t},()=>1+Math.floor(e()*8));return[1+Math.floor(e()*25),n]}}};export{F as default};