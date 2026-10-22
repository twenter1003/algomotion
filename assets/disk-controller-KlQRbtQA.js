import{n as e,o as t}from"./layout-DFaYBMY_.js";import{c as n,i as r,r as i,s as a}from"./shared-e6uNbDLo.js";var o=[[0,3],[1,9],[2,6],[4,2]],s=o.length,c=20,l={python:`import heapq

def solution(jobs):
    # (요청 시각, 소요 시간, 원래 번호) 순으로 정렬
    tasks = sorted((req, dur, i) for i, (req, dur) in enumerate(jobs))
    heap = []
    now, idx, total, done = 0, 0, 0, 0
    n = len(tasks)

    while done < n:
        while idx < n and tasks[idx][0] <= now:
            req, dur, i = tasks[idx]
            heapq.heappush(heap, (dur, req, i))  # 소요 시간 최소 힙
            idx += 1

        if not heap:
            now = tasks[idx][0]  # 대기 작업이 없으면 다음 요청 시각으로 이동
            continue

        dur, req, i = heapq.heappop(heap)
        now += dur
        total += now - req
        done += 1

    return total // n`,javascript:`function solution(jobs) {
  const tasks = jobs.map(([req, dur], i) => [req, dur, i])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  const heap = [];
  const less = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
  const push = (v) => {
    heap.push(v);
    for (let i = heap.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (less(heap[p], heap[i]) <= 0) break;
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
        if (l < heap.length && less(heap[l], heap[m]) < 0) m = l;
        if (r < heap.length && less(heap[r], heap[m]) < 0) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  };

  let now = 0, idx = 0, total = 0, done = 0;
  while (done < tasks.length) {
    while (idx < tasks.length && tasks[idx][0] <= now) {
      const [req, dur, i] = tasks[idx++];
      push([dur, req, i]); // 소요 시간 최소 힙
    }
    if (!heap.length) {
      now = tasks[idx][0]; // 대기 작업이 없으면 다음 요청 시각으로 이동
      continue;
    }
    const [dur, req] = pop();
    now += dur;
    total += now - req;
    done++;
  }
  return Math.floor(total / tasks.length);
}`},u={init:r(l,[`tasks = sorted`,`now, idx, total, done = 0`],[`const tasks = jobs.map`,`let now = 0, idx = 0`]),arrive:r(l,[`while idx < n and tasks[idx][0] <= now`,`heapq.heappush(heap, (dur, req, i))`],[`while (idx < tasks.length && tasks[idx][0] <= now)`,`push([dur, req, i])`]),pop:r(l,[`dur, req, i = heapq.heappop(heap)`],[`const [dur, req] = pop()`]),run:r(l,[`now += dur`,`total += now - req`,`done += 1`],[`now += dur`,`total += now - req`,`done++`]),done:r(l,[`return total // n`],[`return Math.floor(total / tasks.length)`])},d={python:`def solution(jobs):
    n = len(jobs)
    used = [False] * n
    now, total, done = 0, 0, 0

    while done < n:
        best = -1
        for i, (req, dur) in enumerate(jobs):  # 매번 전체 작업을 다 훑는다
            if used[i] or req > now:
                continue
            if best < 0 or (dur, req, i) < (jobs[best][1], jobs[best][0], best):
                best = i

        if best < 0:
            now = min(jobs[i][0] for i in range(n) if not used[i])
            continue

        used[best] = True
        now += jobs[best][1]
        total += now - jobs[best][0]
        done += 1

    return total // n`,javascript:`function solution(jobs) {
  const n = jobs.length;
  const used = Array(n).fill(false);
  let now = 0, total = 0, done = 0;

  while (done < n) {
    let best = -1;
    for (let i = 0; i < n; i++) { // 매번 전체 작업을 다 훑는다
      if (used[i] || jobs[i][0] > now) continue;
      if (
        best < 0 ||
        jobs[i][1] - jobs[best][1] ||
        jobs[i][0] - jobs[best][0] ||
        i - best < 0
      ) {
        if (
          best < 0 ||
          jobs[i][1] < jobs[best][1] ||
          (jobs[i][1] === jobs[best][1] && (jobs[i][0] < jobs[best][0] || (jobs[i][0] === jobs[best][0] && i < best)))
        ) best = i;
      }
    }
    if (best < 0) {
      let nextReq = Infinity;
      for (let i = 0; i < n; i++) if (!used[i] && jobs[i][0] < nextReq) nextReq = jobs[i][0];
      now = nextReq;
      continue;
    }
    used[best] = true;
    now += jobs[best][1];
    total += now - jobs[best][0];
    done++;
  }
  return Math.floor(total / n);
}`},f={init:r(d,[`used = [False] * n`,`now, total, done = 0, 0, 0`],[`const used = Array(n).fill(false)`,`let now = 0, total = 0, done = 0`]),scan:r(d,[`for i, (req, dur) in enumerate(jobs)`,`if best < 0 or (dur, req, i)`],[`for (let i = 0; i < n; i++)`,`if (used[i] || jobs[i][0] > now)`]),run:r(d,[`used[best] = True`,`now += jobs[best][1]`,`total += now - jobs[best][0]`],[`used[best] = true`,`now += jobs[best][1]`,`total += now - jobs[best][0]`]),done:r(d,[`return total // n`],[`return Math.floor(total / n)`])},p={python:`def solution(jobs):
    # 요청 시각 순으로만 정렬해 차례대로 실행 (대기 중 짧은 작업 우선 규칙 무시)
    tasks = sorted(jobs, key=lambda x: (x[0], x[1]))
    now, total = 0, 0

    for req, dur in tasks:
        if now < req:
            now = req
        now += dur
        total += now - req

    return total // len(tasks)`,javascript:`function solution(jobs) {
  // 요청 시각 순으로만 정렬해 차례대로 실행 (대기 중 짧은 작업 우선 규칙 무시)
  const tasks = [...jobs].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let now = 0, total = 0;

  for (const [req, dur] of tasks) {
    if (now < req) now = req;
    now += dur;
    total += now - req;
  }
  return Math.floor(total / tasks.length);
}`},m={init:r(p,[`tasks = sorted(jobs`,`now, total = 0, 0`],[`const tasks = [...jobs].sort`,`let now = 0, total = 0`]),pick:r(p,[`for req, dur in tasks`,`if now < req`],[`for (const [req, dur] of tasks)`,`if (now < req)`]),run:r(p,[`now += dur`,`total += now - req`],[`now += dur`,`total += now - req`]),done:r(p,[`return total // len(tasks)`],[`return Math.floor(total / tasks.length)`])},h=560,g=320,_={x:0,y:0,w:h,h:g},v=e({x:96,w:340,min:0,max:c}),y=t({x:96,y:14,w:98,h:32,gap:8}),b=e=>78+e*42,x=e=>({x:94,y:b(e),w:344,h:34}),S=264;function C(e){let t=[{id:`q:label`,kind:`text`,rect:{x:0,y:14,w:90,h:32},text:e},{id:`q:zone`,kind:`zone`,rect:{x:92,y:10,w:452,h:40}},{id:`axis:line`,kind:`line`,rect:_,tone:`trail`,points:[[v(0),64],[v(c),64]]}];return o.forEach(([e,n],r)=>{let i=b(r);t.push({id:`jname:${r}`,kind:`text`,rect:{x:0,y:i,w:90,h:18},text:`작업 ${r+1}`},{id:`jspec:${r}`,kind:`text`,rect:{x:0,y:i+16,w:90,h:18},tone:`muted`,text:`${e}ms·${n}ms`},{id:`jrow:${r}`,kind:`zone`,rect:x(r)},{id:`jreq:${r}`,kind:`token`,rect:{x:v(e)-3,y:i+2,w:6,h:30},tone:`queued`},{id:`jcalc:${r}`,kind:`text`,rect:{x:444,y:i,w:112,h:34},text:`${e}ms 요청`})}),t.push({id:`now:tok`,kind:`token`,rect:{x:96,y:S,w:116,h:38},tone:`current`,text:`now = 0ms`,tag:`현재 시각`},{id:`sum:tok`,kind:`token`,rect:{x:224,y:S,w:152,h:38},tone:`plain`,text:`총 0ms`,tag:`반환 시간 합`},{id:`avg:tok`,kind:`token`,rect:{x:388,y:S,w:156,h:38},tone:`plain`,text:`평균 -`,tag:`answer`}),{width:h,height:g,items:t}}var w=(e,t)=>e.dur-t.dur||e.req-t.req||e.i-t.i,T=e=>`q:${e}`,E=e=>`bar:${e}`,D=(e,t,n,r)=>({id:E(e),kind:`cell`,rect:{x:v(t)+1,y:b(e)+3,w:v(n)-v(t)-2,h:28},tone:r,text:`${n-t}ms`});function O(){let e=new n(C(`최소 힙`)),t=o.map(([e,t],n)=>({i:n,req:e,dur:t})),r=[],i=0,c=0,l=0,d=0,f=0,p=(e={})=>({work:f,variables:{now:`${i}ms`,heap:`[${r.map(e=>`(${e.dur}ms,작업${e.i+1})`).join(`, `)}]`,total:`${l}ms`,done:`${d}/${s}`,...e}});for(f=s,e.step({title:`요청 시각 순으로 작업 정렬하기`,codeHighlights:u.init,...p()}),e.phase(`정렬하기`,`작업 ${s}개를 요청 시각 순으로 정렬해 두고 now = 0ms에서 시작합니다.`,u.init),e.do({type:`focus`,ids:t.map(e=>`jreq:${e.i}`)}),e.do({type:`unfocus`});d<s;){let n=[];for(;c<s&&t[c].req<=i;)n.push(t[c]),r.push(t[c]),c++,f++;r.sort(w),e.step({title:`now = ${i}ms: 도착한 작업 ${n.length?n.map(e=>`작업 ${e.i+1}(${e.dur}ms)`).join(`, `):`없음`} → 힙 정렬`,codeHighlights:u.arrive,...p()}),e.phase(`힙에 넣기`,n.length?`now = ${i}ms까지 도착한 ${n.map(e=>`작업 ${e.i+1}(소요 ${e.dur}ms)`).join(`, `)}을 최소 힙에 넣습니다. 맨 앞은 가장 짧은 작업 ${r[0].i+1}(${r[0].dur}ms)입니다.`:`새로 도착한 작업이 없어 기존 힙에서 가장 짧은 작업 ${r[0].i+1}(${r[0].dur}ms)이 맨 앞에 있습니다.`,u.arrive),e.do(...a([...n.map(e=>({type:`add`,item:{id:T(e.i),kind:`token`,rect:y(r.indexOf(e)),tone:`queued`,text:`작업${e.i+1}·${e.dur}ms`},from:`jname:${e.i}`})),...r.filter(e=>!n.includes(e)).map(e=>({type:`set`,id:T(e.i),patch:{rect:y(r.indexOf(e))}}))]));let o=r.shift(),m=i;i+=o.dur;let h=i-o.req;l+=h,d++,f++,e.step({title:`작업 ${o.i+1}(${o.dur}ms) 실행: ${m}~${i}ms (반환 ${h}ms)`,codeHighlights:u.run,...p({실행작업:`작업 ${o.i+1}`,반환시간:`${h}ms`})}),e.phase(`꺼내기`,`힙 맨 앞에서 소요 시간이 가장 짧은 작업 ${o.i+1}(${o.dur}ms)을 꺼냅니다.`,u.pop),e.do(...a([{type:`remove`,id:T(o.i),into:`jname:${o.i}`},...r.map((e,t)=>({type:`set`,id:T(e.i),patch:{rect:y(t)}}))])),e.phase(`실행하기`,`${m}ms부터 ${i}ms까지 실행합니다. 요청(${o.req}ms)부터 종료(${i}ms)까지 ${i} − ${o.req} = ${h}ms가 걸렸습니다.`,u.run),e.do(...a([{type:`add`,item:D(o.i,m,i,`chosen`),from:`jname:${o.i}`},{type:`set`,id:`jcalc:${o.i}`,patch:{text:`${i}−${o.req} = ${h}ms`}},{type:`set`,id:`now:tok`,patch:{text:`now = ${i}ms`},pop:!0},{type:`set`,id:`sum:tok`,patch:{text:`총 ${l}ms`,tone:`chosen`},pop:!0}]))}let m=Math.floor(l/s);return e.step({title:`평균 반환 시간 ⌊${l} ÷ ${s}⌋ = ${m}ms`,codeHighlights:u.done,...p(),answer:m,isKeyframe:!0}),e.phase(`정답`,`네 작업의 반환 시간 합은 3 + 7 + 7 + 19 = ${l}ms이고, 평균의 정수 부분은 ⌊${l} ÷ ${s}⌋ = ${m}ms입니다.`,u.done),e.do(...a([...o.map((e,t)=>({type:`set`,id:E(t),patch:{tone:`path`}})),{type:`set`,id:`avg:tok`,patch:{text:`평균 ${m}ms`,tone:`path`},pop:!0}])),e.finish()}function k(){let e=new n(C(`전체 훑기`)),t=Array(s).fill(!1),r=0,i=0,c=0,l=0,u=(e={})=>({work:l,variables:{now:`${r}ms`,total:`${i}ms`,done:`${c}/${s}`,...e}});for(e.step({title:`대기 힙 없이 시작하기`,codeHighlights:f.init,...u()}),e.phase(`시작`,`별도의 힙을 두지 않고 매번 작업 ${s}개를 처음부터 끝까지 훑어 실행할 작업을 고릅니다.`,f.init),e.do(...a(o.map(([e,t],n)=>({type:`add`,item:{id:T(n),kind:`token`,rect:y(n),tone:`plain`,text:`작업${n+1}:${e}·${t}`}}))));c<s;){let n=-1;for(let e=0;e<s;e++)t[e]||o[e][0]>r||(n<0||w({i:e,req:o[e][0],dur:o[e][1]},{i:n,req:o[n][0],dur:o[n][1]})<0)&&(n=e);let d=r,[p,m]=o[n];t[n]=!0,r+=m;let h=r-p;i+=h,c++,l+=s,e.step({title:`${s}개 전체 확인 → 작업 ${n+1}(${m}ms) 실행`,codeHighlights:f.run,...u({best:`작업 ${n+1}`,반환시간:`${h}ms`})}),e.phase(`전체 훑기`,`now = ${d}ms에서 작업 ${s}개를 모두 확인해, 도착했고 아직 안 끝난 작업 중 가장 짧은 작업 ${n+1}(${m}ms)을 찾습니다.`,f.scan),e.do({type:`focus`,ids:o.map((e,t)=>T(t))}),e.do({type:`set`,id:T(n),patch:{tone:`current`}}),e.phase(`실행하기`,`작업 ${n+1}을 ${d}~${r}ms 동안 실행합니다. 반환 시간은 ${h}ms입니다.`,f.run),e.do(...a([{type:`unfocus`},{type:`set`,id:T(n),patch:{tone:`muted`}},{type:`add`,item:D(n,d,r,`chosen`),from:`jname:${n}`},{type:`set`,id:`jcalc:${n}`,patch:{text:`${r}−${p} = ${h}ms`}},{type:`set`,id:`now:tok`,patch:{text:`now = ${r}ms`},pop:!0},{type:`set`,id:`sum:tok`,patch:{text:`총 ${i}ms`,tone:`chosen`},pop:!0}]))}let d=Math.floor(i/s);return e.step({title:`평균 반환 시간 ${d}ms (확인 ${l}번)`,codeHighlights:f.done,...u(),answer:d,isKeyframe:!0}),e.phase(`정답`,`답은 ${d}ms로 같지만 매번 전체 작업을 다시 훑어 ${l}번 확인했습니다. 작업이 500개면 최대 25만 번 확인합니다.`,f.done),e.do(...a([...o.map((e,t)=>({type:`set`,id:E(t),patch:{tone:`path`}})),{type:`set`,id:`avg:tok`,patch:{text:`평균 ${d}ms`,tone:`path`},pop:!0}])),e.finish()}function A(){let e=new n(C(`요청순 큐`)),t=0,r=0,c=s,l=(e={})=>({work:c,variables:{now:`${t}ms`,total:`${r}ms`,...e}});e.step({title:`요청 시각 순으로 줄 세우기`,codeHighlights:m.init,...l()}),e.phase(`줄 세우기`,`요청 시각 순서대로만 줄을 세우고, 대기 중인 작업의 소요 시간은 비교하지 않습니다.`,m.init),e.do(...a(o.map(([,e],t)=>({type:`add`,item:{id:T(t),kind:`token`,rect:y(t),tone:`queued`,text:`작업${t+1}·${e}ms`}})))),o.forEach(([n,i],o)=>{let s=Math.max(t,n);t=s+i;let u=t-n;r+=u,c++;let d=o===1;e.step({title:`작업 ${o+1}(${i}ms) 요청순 실행: ${s}~${t}ms (반환 ${u}ms)`,codeHighlights:m.run,...l({실행작업:`작업 ${o+1}`,반환시간:`${u}ms`})}),e.phase(`순서대로 꺼내기`,d?`3ms 시점에 더 짧은 작업 3(6ms)도 도착해 있지만, 요청 시각이 1ms로 앞선다는 이유로 긴 작업 2(9ms)를 먼저 실행합니다.`:`요청 순서에 따라 작업 ${o+1}(${i}ms)을 꺼내 실행합니다.`,m.pick),e.do(...a([{type:`remove`,id:T(o),into:`jname:${o}`},{type:`add`,item:D(o,s,t,o>=1?`bad`:`chosen`),from:`jname:${o}`},{type:`set`,id:`jcalc:${o}`,patch:{text:`${t}−${n} = ${u}ms`}},{type:`set`,id:`now:tok`,patch:{text:`now = ${t}ms`},pop:!0},{type:`set`,id:`sum:tok`,patch:{text:`총 ${r}ms`,tone:o>=1?`bad`:`chosen`},pop:!0}]))});let u=Math.floor(r/s);return e.step({title:`오답: 평균 ${u}ms (정답 9ms)`,codeHighlights:m.done,...l(),answer:u,isKeyframe:!0}),e.phase(`오답 확인`,`긴 작업 2(9ms)가 먼저 실행되는 바람에 뒤의 짧은 작업 3(6ms), 작업 4(2ms)가 모두 9ms씩 더 기다렸습니다. 총합이 ${i(r,`이`,`가`)} 되어 평균이 ${u}ms(정답 9ms)로 커집니다.`,m.done),e.do({type:`arrow`,from:E(1),to:E(3),verdict:`bad`,label:`긴 작업 때문에 대기 증가`}),e.do({type:`set`,id:`avg:tok`,patch:{text:`오답 ${u}ms (정답 9)`,tone:`bad`},pop:!0}),e.finish()}var j={id:`disk-controller`,title:`디스크 컨트롤러`,level:3,category:`heap`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42627`,description:{summary:`하드디스크는 한 번에 하나의 작업만 수행합니다. 각 작업의 [요청 시각, 소요 시간]이 주어질 때, 현재 도착해 대기 중인 작업들 가운데 소요 시간이 가장 짧은 작업부터 처리하여 모든 작업의 요청부터 종료까지 걸린 시간(반환 시간)의 평균을 최소화하고, 그 평균의 정수 부분을 구합니다.`,rules:[`jobs의 길이는 1 이상 500 이하입니다.`,`jobs의 각 행은 [작업이 요청되는 시점, 작업의 소요시간] 입니다.`,`각 작업에 대해 작업이 요청되는 시간은 0 이상 1,000 이하입니다.`,`각 작업에 대해 작업의 소요시간은 1 이상 1,000 이하입니다.`,`대기 큐가 비어 있을 때는 아직 남아 있는 작업 중 가장 먼저 요청되는 작업부터 처리합니다.`,`평균 반환 시간의 소수점 이하를 버린 정수 부분을 return 합니다.`],examples:[{input:`jobs = [[0, 3], [1, 9], [2, 6]]`,output:`9`},{input:`jobs = [[0, 3], [1, 9], [3, 5]]`,output:`8`}]},keyIntuitions:[`뒤에 기다리는 작업이 k개 있을 때 지금 고른 작업의 소요 시간 dur는 k개 작업 모두의 대기 시간에 더해집니다. 따라서 지금 도착해 있는 작업 중 소요 시간이 가장 짧은 것(SJF)을 먼저 끝내야 총 대기 시간이 가장 작습니다.`,`현재 시각 now 이하에 요청된 작업들을 최소 힙(기준: 소요 시간 → 요청 시각 → 작업 번호)에 넣고, 가장 짧은 작업을 하나씩 꺼내 실행합니다.`,`힙이 비어 있는데 아직 남은 작업이 있다면 현재 시각 now를 다음 작업의 요청 시각으로 바로 점프시킵니다.`],demo:{input:[o],label:`jobs = [[0, 3], [1, 9], [2, 6], [4, 2]]`},workUnit:`작업 비교·힙 연산 수`,approaches:[{id:`disk-controller-min-heap`,name:`작업 시간 최소 힙`,rank:`BEST`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`요청 시각 순으로 정렬한 뒤, 현재 시각까지 도착한 작업을 소요 시간 최소 힙에 넣어 하나씩 꺼내는 정석 풀이입니다.`,pros:[`각 작업이 힙에 딱 한 번 들어가고 한 번 나오므로 전체 O(N log N)에 끝납니다.`,`대기 중인 작업이 없을 때 다음 요청 시각으로 점프하는 처리도 깔끔합니다.`],cons:[`정렬 기준(요청 시각)과 힙 기준(소요 시간 우선)이 서로 달라 튜플 순서를 헷갈리지 않아야 합니다.`],whyThisRank:`시간이 흐르면서 대기열에 새 작업이 계속 추가되고 그중 최소 소요 시간을 바로 꺼내야 하므로 최소 힙이 가장 알맞습니다.`,code:l,visualize:O},{id:`disk-controller-scan`,name:`매번 전체 작업을 훑어 짧은 작업 찾기`,rank:`ALTERNATIVE`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`힙을 쓰지 않고 작업이 하나 끝날 때마다 전체 작업 배열을 처음부터 훑어 다음 작업을 고르는 풀이입니다.`,pros:[`힙을 구현할 필요가 없어 배열과 반복문만으로 작성할 수 있습니다.`],cons:[`작업 하나를 고를 때마다 N개를 모두 확인하므로 O(N²) 시간이 걸립니다.`,`작업 수가 수만 개로 늘어나는 변형 문제에서는 시간 초과가 납니다.`],whyThisRank:`N ≤ 500에서는 통과하지만, 이미 도착한 작업과 아직 도착하지 않은 작업을 매번 처음부터 다시 확인하는 중복 연산이 발생합니다.`,code:d,visualize:k},{id:`disk-controller-fifo`,name:`요청 순서대로 바로 처리하기 (선입선출)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`대기 중인 작업의 소요 시간을 비교하지 않고 요청된 순서대로 처리하는 오답 풀이입니다.`,pros:[`정렬 한 번과 단순 합산만 있어 코드가 매우 짧습니다.`],cons:[`소요 시간이 긴 작업이 먼저 실행되면 그사이에 도착한 짧은 작업들이 모두 긴 시간 동안 묶여 평균 반환 시간이 크게 늘어납니다.`],whyThisRank:`요청 시각 순으로만 처리하면 대기열에 짧은 작업이 여러 개 쌓여 있을 때 평균 대기 시간을 줄일 수 없습니다.`,code:p,visualize:A}],checks:{cases:[{args:[[[0,3],[1,9],[2,6]]],expected:9},{args:[[[0,3],[1,9],[3,5]]],expected:8},{args:[o],expected:9},{args:[[[5,4]]],expected:4},{args:[[[0,10],[2,3],[2,2],[15,4]]],expected:9}],random:e=>{let t=1+Math.floor(e()*6);return[Array.from({length:t},()=>[Math.floor(e()*12),1+Math.floor(e()*9)])]}}};export{j as default};