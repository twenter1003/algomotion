import{c as e,i as t,l as n,r}from"./shared-CL29HWIp.js";import{t as i}from"./lane-BzDhdR3X.js";var a=3,o=10,s=[7,4,5,4,6],c=s.length,l=e=>`T${e+1}(${s[e]})`,u=e=>`[${e.join(`, `)}]`,d={python:`from collections import deque

def solution(bridge_length, weight, truck_weights):
    bridge = deque()  # (트럭 무게, 다리를 다 건너는 시각)
    cur_weight = 0
    time = 0

    for truck in truck_weights:
        time += 1
        if bridge and bridge[0][1] == time:
            cur_weight -= bridge.popleft()[0]

        while cur_weight + truck > weight:  # 무게가 넘치면 맨 앞 트럭이 내릴 시각으로 점프
            w, time = bridge.popleft()
            cur_weight -= w

        bridge.append((truck, time + bridge_length))
        cur_weight += truck

    return bridge[-1][1]  # 마지막 트럭이 다리를 빠져나가는 시각`,javascript:`function solution(bridge_length, weight, truck_weights) {
  const bridge = []; // [트럭 무게, 다리를 다 건너는 시각]
  let head = 0; // shift() 대신 머리 인덱스로 큐를 꺼냅니다
  let curWeight = 0;
  let time = 0;

  for (const truck of truck_weights) {
    time += 1;
    if (head < bridge.length && bridge[head][1] === time) {
      curWeight -= bridge[head++][0];
    }

    while (curWeight + truck > weight) { // 무게가 넘치면 맨 앞 트럭이 내릴 시각으로 점프
      const [w, exitTime] = bridge[head++];
      curWeight -= w;
      time = exitTime;
    }

    bridge.push([truck, time + bridge_length]);
    curWeight += truck;
  }

  return bridge[bridge.length - 1][1]; // 마지막 트럭이 다리를 빠져나가는 시각
}`},f={start:t(d,[`bridge = deque()`,`cur_weight = 0`,`time = 0`],[`const bridge = []`,`let curWeight = 0`,`let time = 0`]),stepTime:t(d,[`for truck in truck_weights:`,`time += 1`,`if bridge and bridge[0][1] == time:`],[`for (const truck of truck_weights)`,`time += 1;`,`if (head < bridge.length && bridge[head][1] === time)`]),jump:t(d,[`while cur_weight + truck > weight:`,`w, time = bridge.popleft()`,`cur_weight -= w`],[`while (curWeight + truck > weight)`,`const [w, exitTime] = bridge[head++]`,`time = exitTime;`]),enter:t(d,[`bridge.append((truck, time + bridge_length))`,`cur_weight += truck`],[`bridge.push([truck, time + bridge_length])`,`curWeight += truck;`]),done:t(d,[`return bridge[-1][1]`],[`return bridge[bridge.length - 1][1]`])},p={python:`from collections import deque

def solution(bridge_length, weight, truck_weights):
    bridge = deque([0] * bridge_length)  # 다리 칸마다 무게 기록 (빈칸은 0)
    trucks = deque(truck_weights)
    cur_weight = 0
    time = 0

    while trucks or cur_weight > 0:
        time += 1
        cur_weight -= bridge.popleft()   # 1초마다 맨 앞 칸이 다리를 빠져나감
        if trucks and cur_weight + trucks[0] <= weight:
            w = trucks.popleft()
            bridge.append(w)
            cur_weight += w
        else:
            bridge.append(0)             # 못 올라가면 빈칸(0)을 채워 밀기

    return time`,javascript:`function solution(bridge_length, weight, truck_weights) {
  const bridge = new Array(bridge_length).fill(0); // 다리 칸마다 무게 기록 (빈칸은 0)
  let bHead = 0;
  let tHead = 0;
  let curWeight = 0;
  let time = 0;

  while (tHead < truck_weights.length || curWeight > 0) {
    time += 1;
    curWeight -= bridge[bHead++]; // 1초마다 맨 앞 칸이 다리를 빠져나감
    if (tHead < truck_weights.length && curWeight + truck_weights[tHead] <= weight) {
      const w = truck_weights[tHead++];
      bridge.push(w);
      curWeight += w;
    } else {
      bridge.push(0); // 못 올라가면 빈칸(0)을 채워 밀기
    }
  }

  return time;
}`},m={start:t(p,[`bridge = deque([0] * bridge_length)`,`trucks = deque(truck_weights)`],[`const bridge = new Array(bridge_length).fill(0)`,`let curWeight = 0`]),tick:t(p,[`while trucks or cur_weight > 0:`,`time += 1`,`cur_weight -= bridge.popleft()`],[`while (tHead < truck_weights.length || curWeight > 0)`,`time += 1;`,`curWeight -= bridge[bHead++]`]),enter:t(p,[`if trucks and cur_weight + trucks[0] <= weight:`,`bridge.append(w)`,`cur_weight += w`],[`if (tHead < truck_weights.length && curWeight + truck_weights[tHead] <= weight)`,`bridge.push(w);`,`curWeight += w;`]),pushZero:t(p,[`else:`,`bridge.append(0)`],[`} else {`,`bridge.push(0);`]),done:t(p,[`return time`],[`return time;`])},h={python:`def solution(bridge_length, weight, truck_weights):
    time = 0
    cur_weight = 0

    for w in truck_weights:
        if cur_weight + w <= weight:
            time += 1
            cur_weight += w
        else:
            # 함정: 무게가 넘치면 다리 길이만큼 더하고 다리가 통째로 빈다고 착각
            time += bridge_length
            cur_weight = w

    return time + bridge_length`,javascript:`function solution(bridge_length, weight, truck_weights) {
  let time = 0;
  let curWeight = 0;

  for (const w of truck_weights) {
    if (curWeight + w <= weight) {
      time += 1;
      curWeight += w;
    } else {
      // 함정: 무게가 넘치면 다리 길이만큼 더하고 다리가 통째로 빈다고 착각
      time += bridge_length;
      curWeight = w;
    }
  }

  return time + bridge_length;
}`},g={start:t(h,[`time = 0`,`cur_weight = 0`],[`let time = 0`,`let curWeight = 0`]),fit:t(h,[`if cur_weight + w <= weight:`,`time += 1`,`cur_weight += w`],[`if (curWeight + w <= weight)`,`time += 1;`,`curWeight += w;`]),reset:t(h,[`else:`,`time += bridge_length`,`cur_weight = w`],[`} else {`,`time += bridge_length;`,`curWeight = w;`]),done:t(h,[`return time + bridge_length`],[`return time + bridge_length;`])},_=84,v=74,y=152,b=230,x=616,S=286,C={id:`bridge`,x:_,y:78,slotW:96,slotH:46,gap:8,max:a},w={id:`wait`,x:_,y:156,slotW:72,slotH:46,gap:8,max:c},T={id:`done`,x:_,y:234,slotW:72,slotH:44,gap:8,max:c},E=e=>`wt:${e}`,D=e=>`br:${e}`,O=e=>`dn:${e}`,k=(e,t,n,r)=>({id:e,kind:`text`,rect:{x:0,y:n,w:76,h:r},text:t});function A(){return{width:x,height:S,items:[k(`row:stat`,`상태`,0,52),{id:`cell:time`,kind:`cell`,rect:{x:_,y:0,w:78,h:52},tone:`plain`,text:`0초`,tag:`시각`},{id:`cell:weight`,kind:`cell`,rect:{x:172,y:0,w:78,h:52},tone:`plain`,text:`0`,tag:`다리 무게`},{id:`cell:limit`,kind:`cell`,rect:{x:260,y:0,w:78,h:52},tone:`plain`,text:String(o),tag:`한도`},k(`row:bridge`,`다리(${a})`,v,54),{id:`bridge:bg`,kind:`zone`,rect:{x:80,y:v,w:312,h:54}},k(`row:wait`,`대기 큐`,y,54),{id:`wait:bg`,kind:`zone`,rect:{x:80,y,w:c*80,h:54}},k(`row:done`,`건넌 트럭`,b,52),{id:`done:bg`,kind:`zone`,rect:{x:80,y:b,w:c*80,h:52}}]}}var j=e=>({type:`wait`,ms:e}),M=()=>e([{type:`unfocus`},{type:`clearMarks`}]),N=(t,n,r=`queued`)=>e([{type:`set`,id:`cell:time`,patch:{text:`${t}초`,tone:`current`},pop:!0},{type:`set`,id:`cell:weight`,patch:{text:String(n),tone:n===0?`plain`:r},pop:!0}]);function P(){let t=new n(A()),r=new i(t,C),d=new i(t,w),p=new i(t,T),m=[],h=0,g=0,_=0,v=()=>({work:_,variables:{time:`${g}초`,cur_weight:h,bridge:u(m.map(e=>`${l(e.idx)}→${e.exit}초`))}});t.step({title:`대기 트럭 ${u(s)} 준비 (다리 길이 ${a}, 한도 ${o})`,codeHighlights:f.start,...v()}),t.phase(`준비`,`다리에는 최대 ${a}대, 무게 합 ${o}까지 올라갈 수 있습니다. 다리 큐에는 (트럭, 나가는 시각)만 기록합니다.`);for(let e=0;e<c;e++)d.push({id:E(e),text:l(e),tone:`queued`});return t.do(j(600)),g=1,h=7,_++,m.push({idx:0,w:7,exit:4}),t.step({title:`1초: T1(7) 다리 진입 (4초 하차 예정)`,codeHighlights:f.enter,...v()}),t.phase(`진입`,`1초에 T1(7)이 다리에 올라갑니다. 다리 길이가 3이므로 1 + 3 = 4초에 다리를 빠져나갑니다.`,f.enter),d.shift(`bridge:bg`),r.push({id:D(0),text:`T1(7)·4초`,tone:`current`}),t.do(...N(g,h),j(400)),g=2,_++,t.step({title:`2초: T2(4) 대기 — 7 + 4 > 10이라 진입 불가`,codeHighlights:f.stepTime,...v()}),t.phase(`무게 확인`,`2초에 T2(4)가 올라가려 하지만 다리 무게 7 + 4 = 11 > 10이라 올라갈 수 없습니다.`,f.stepTime),t.do(...N(g,h),{type:`focus`,ids:[E(1),`cell:weight`,`cell:limit`]},{type:`arrow`,from:E(1),to:`cell:limit`,verdict:`bad`,label:`7 + 4 > 10`},j(350),...M()),g=4,m.shift(),m.push({idx:1,w:4,exit:7}),h=4,_++,t.step({title:`4초로 점프: T1(7) 하차 후 T2(4) 진입 (7초 하차 예정)`,codeHighlights:f.jump,...v()}),t.phase(`시각 점프`,`빈 초를 일일이 세지 않고 맨 앞 T1(7)이 내리는 4초로 바로 건너뛰어 T1을 내보냅니다.`,f.jump),r.shift(`done:bg`),p.push({id:O(0),text:l(0),tone:`visited`}),t.do(...N(g,0),j(250)),t.phase(`진입`,`4초에 다리가 비었으므로 T2(4)가 올라갑니다. 4 + 3 = 7초에 하차합니다.`,f.enter),d.shift(`bridge:bg`),r.push({id:D(1),text:`T2(4)·7초`,tone:`current`}),t.do(...N(g,h),j(300)),g=5,m.push({idx:2,w:5,exit:8}),h=9,_++,t.step({title:`5초: 4 + 5 ≤ 10 → T3(5) 이어서 진입 (8초 하차 예정)`,codeHighlights:f.enter,...v()}),t.phase(`무게 확인`,`5초에 다리 무게 4 + T3(5) = 9 ≤ 10이므로 기다리지 않고 바로 올라갑니다.`,f.stepTime),t.do({type:`focus`,ids:[E(2),`cell:weight`,`cell:limit`]},{type:`arrow`,from:E(2),to:`cell:limit`,verdict:`good`,label:`4 + 5 ≤ 10`},j(250)),t.phase(`진입`,`T3(5)가 다리에 올라 5 + 3 = 8초에 하차합니다. 다리 위에는 T2(4), T3(5) 두 대가 있습니다.`,f.enter),d.shift(`bridge:bg`),r.push({id:D(2),text:`T3(5)·8초`,tone:`current`}),t.do(...e([...N(g,h),...M()],!0),j(300)),g=6,_++,t.step({title:`6초: T4(4) 대기 — 9 + 4 > 10이라 진입 불가`,codeHighlights:f.stepTime,...v()}),t.phase(`무게 확인`,`6초에 T4(4)가 올라가려 하지만 9 + 4 = 13 > 10이라 맨 앞 T2(4)가 내릴 때까지 기다려야 합니다.`,f.stepTime),t.do(...N(g,h),{type:`focus`,ids:[E(3),`cell:weight`,`cell:limit`]},{type:`arrow`,from:E(3),to:`cell:limit`,verdict:`bad`,label:`9 + 4 > 10`},j(350),...M()),g=7,m.shift(),m.push({idx:3,w:4,exit:10}),h=9,_++,t.step({title:`7초로 점프: T2(4)만 하차 후 T4(4) 즉시 진입 (10초 하차)`,codeHighlights:f.jump,...v()}),t.phase(`시각 점프`,`맨 앞 T2(4)가 내리는 7초로 건너뜁니다. T3(5)는 아직 다리 위에 남아 무게가 5가 됩니다.`,f.jump),r.shift(`done:bg`),p.push({id:O(1),text:l(1),tone:`visited`}),t.do(...N(g,5),j(250)),t.phase(`진입`,`남은 무게 5 + T4(4) = 9 ≤ 10이므로 T3(5)가 내려가길 기다리지 않고 7초에 바로 T4(4)가 진입합니다.`,f.enter),d.shift(`bridge:bg`),r.push({id:D(3),text:`T4(4)·10초`,tone:`current`}),t.do(...N(g,h),j(300)),g=8,m.shift(),m.push({idx:4,w:6,exit:11}),h=10,_++,t.step({title:`8초: T3(5) 하차 후 마지막 T5(6) 진입 (11초 하차)`,codeHighlights:f.enter,...v()}),t.phase(`하차 후 진입`,`8초에 T3(5)가 내려가면 다리 무게가 4가 되고, 4 + T5(6) = 10 ≤ 10이라 T5(6)가 바로 진입합니다.`,f.stepTime),r.shift(`done:bg`),p.push({id:O(2),text:l(2),tone:`visited`}),d.shift(`bridge:bg`),r.push({id:D(4),text:`T5(6)·11초`,tone:`current`}),t.do(...N(g,h),j(350)),g=11,m.length=0,h=0,_++,t.step({title:`11초: 마지막 T5(6) 하차 완료 — 정답 11초`,codeHighlights:f.done,...v(),answer:11,isKeyframe:!0}),t.phase(`완주`,`대기 트럭이 모두 올라갔으므로 마지막 트럭 T5(6)의 하차 시각인 bridge[-1][1] = 11초가 그대로 정답입니다.`,f.done),r.shift(`done:bg`),p.push({id:O(3),text:l(3),tone:`path`}),r.shift(`done:bg`),p.push({id:O(4),text:l(4),tone:`path`}),t.do(...e([...N(g,0),...p.ids.map(e=>({type:`set`,id:e,patch:{tone:`path`}}))],!0),j(400)),t.finish()}function F(){let t=new n(A()),d=new i(t,C),f=new i(t,w),p=new i(t,T),h=[0,0,0],g=0,_=0,v=0,y=3,b=()=>({work:_,variables:{time:`${_}초`,cur_weight:g,bridge:u(h),trucks:u(s.slice(v))}});t.step({title:`길이 ${a}짜리 다리 큐를 [0, 0, 0]으로 채워 시작`,codeHighlights:m.start,...b()}),t.phase(`준비`,`다리 칸마다 토큰을 두어 빈칸은 0으로 채웁니다. 1초마다 맨 앞을 꺼내고 뒤에서 새 트럭이나 0을 밀어 넣습니다.`);for(let e=0;e<a;e++)d.push({id:`z:${e}`,text:`0`,tone:`muted`});for(let e=0;e<c;e++)f.push({id:E(e),text:l(e),tone:`queued`});t.do(j(600));let x=[];for(let e=1;e<=8;e++){_=e;let n=h.shift();g-=n;let i=v<c?s[v]:void 0,a=i!==void 0&&g+i<=o,u;if(a?(u=v++,h.push(i),g+=i):h.push(0),t.step({title:a?`${e}초: 앞 칸(${n}) 빠지고 ${l(u)} 진입`:`${e}초: ${g} + ${i} > 10 → 빈칸(0) 밀어 넣기`,codeHighlights:a?m.enter:m.pushZero,...b()}),t.phase(`1초 진행`,n>0?`${e}초가 되어 맨 앞 트럭(${n})이 다리를 빠져나가고 다리 무게가 ${g-(a?i:0)}이 됩니다.`:`${e}초가 되어 다리 맨 앞 빈칸(0)이 빠집니다.`,m.tick),d.shift(n>0?`done:bg`:void 0),n>0){let e=x.length;x.push(e),p.push({id:O(e),text:l(e),tone:`visited`})}a?(t.phase(`트럭 진입`,`다리 무게가 ${g} ≤ ${o}이므로 ${r(l(u),`을`,`를`)} 다리 끝에 올립니다.`,m.enter),f.shift(`bridge:bg`),d.push({id:D(u),text:l(u),tone:`current`})):(t.phase(`0 채우기`,`다음 트럭(${i})이 올라가면 한도 ${o}을 넘으므로 빈칸(0)을 넣어 한 칸만 전진시킵니다.`,m.pushZero),d.push({id:`z:${y++}`,text:`0`,tone:`muted`})),t.do(...N(_,g),j(250))}_=11,g=0,h.splice(0,3,0,0,0),t.step({title:`9~11초(빨리 감기): 남은 트럭 2대 하차 — 정답 11초`,codeHighlights:m.done,...b(),answer:11,isKeyframe:!0}),t.phase(`남은 구간 진행`,`대기 트럭이 모두 올라갔으니 9초, 10초, 11초까지 0을 밀어 넣어 T4(4)와 T5(6)가 모두 건너면 총 11초입니다.`,m.done);for(let e=0;e<3;e++)d.shift(`done:bg`),d.push({id:`z:${y++}`,text:`0`,tone:`muted`});return p.push({id:O(3),text:l(3),tone:`path`}),p.push({id:O(4),text:l(4),tone:`path`}),t.do(...e([...N(_,0),...p.ids.map(e=>({type:`set`,id:e,patch:{tone:`path`}}))],!0),j(400)),t.finish()}function I(){let t=new n(A()),r=new i(t,w),u=new i(t,T),d=0,f=0,p=0,m=()=>({work:p,variables:{time:`${d}초`,cur_weight:f,bridge_length:a}});t.step({title:`큐 없이 time과 cur_weight 변수만으로 계산 시작`,codeHighlights:g.start,...m()}),t.phase(`준비`,`각 트럭이 언제 내려가는지 큐에 기록하지 않고, 무게 합이 넘치면 무조건 bridge_length(3초)를 더하는 함정 풀이입니다.`);for(let e=0;e<c;e++)r.push({id:E(e),text:l(e),tone:`queued`});t.do(j(500));for(let e=0;e<c;e++){let n=s[e],i=f+n<=o,c=f;p++,i?(d+=1,f+=n):(d+=a,f=n),t.step({title:i?`${l(e)}: ${c} + ${n} ≤ 10 → time +1 (${d}초)`:`${l(e)}: ${c} + ${n} > 10 → time +${a} (${d}초), 무게 초기화`,codeHighlights:i?g.fit:g.reset,...m()}),t.phase(i?`이어서 진입`:`다리 비우기 착각`,i?`${c} + ${n} ≤ ${o}이므로 1초 뒤인 ${d}초에 바로 올라탄다고 계산합니다.`:e===3?`9 + 4 > 10이라 ${a}초를 통째로 더해 ${d}초로 잡고 다리 무게를 4로 덮어씁니다. 실제로는 7초에 앞의 T2(4)만 먼저 내려가 T3(5)와 T4(4)가 함께 다리에 있을 수 있습니다!`:`${c} + ${n} > ${o}이므로 ${a}초를 더해 ${d}초로 잡고 다리가 완전히 비었다고 가정합니다.`,i?g.fit:g.reset),r.shift(`done:bg`),u.push({id:O(e),text:l(e),tone:!i&&e===3?`bad`:`visited`}),t.do(...N(d,f,!i&&e===3?`bad`:`queued`),j(350))}return d+=a,t.step({title:`오답 확인: 이 풀이는 ${d}초, 실제 정답은 11초`,codeHighlights:g.done,...m(),answer:d,isKeyframe:!0}),t.phase(`오답 확인`,`마지막 트럭이 건너는 ${a}초를 더해 ${d}초를 돌려주지만 오답입니다. 7초에 T2(4)가 먼저 내려가 T4(4)가 1초 일찍 진입하고, T3(5)도 여전히 다리 위에 남아 있기 때문입니다.`,g.done),t.do(...e([...N(d,f,`bad`),{type:`add`,item:{id:`wrong`,kind:`token`,rect:{x:350,y:4,w:120,h:44},tone:`bad`,text:`이 풀이: ${d}초`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:478,y:4,w:120,h:44},tone:`good`,text:`정답: 11초`}}]),j(500)),t.finish()}var L={id:`bridge-truck`,title:`다리를 지나는 트럭`,level:2,category:`stack-queue`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42583`,description:{summary:`트럭 여러 대가 정해진 순서로 일차선 다리를 건넙니다. 다리에는 최대 bridge_length대까지 올라갈 수 있고, 다리 위 트럭들의 무게 합은 weight 이하여야 합니다. 모든 트럭이 다리를 건너는 데 걸리는 최소 시간을 구합니다.`,rules:[`bridge_length는 1 이상 10,000 이하`,`weight는 1 이상 10,000 이하`,`truck_weights의 길이는 1 이상 10,000 이하이고, 각 트럭 무게는 1 이상 weight 이하`,`다리에 완전히 오르지 않은 트럭의 무게는 포함하지 않음`],examples:[{input:`bridge_length = 2, weight = 10, truck_weights = [7, 4, 5, 6]`,output:`8`},{input:`bridge_length = 100, weight = 100, truck_weights = [10]`,output:`101`},{input:`bridge_length = 100, weight = 100, truck_weights = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]`,output:`110`}]},keyIntuitions:[`트럭이 다리에 머무는 시간은 늘 bridge_length초로 일정하므로, 진입 시각이 t이면 정확히 t + bridge_length초에 다리에서 내려갑니다.`,`다음 트럭이 무게 때문에 못 올라가면 1초씩 흘려보낼 필요 없이 다리 맨 앞 트럭이 내려가는 시각으로 바로 점프하면 됩니다.`,`앞 트럭 한 대가 내려가면서 생긴 여유 무게로 새 트럭이 올라타면, 아직 다리 위에 남은 다른 트럭과 함께 건너게 됩니다.`],demo:{input:[a,o,s],label:`bridge_length = 3, weight = 10, truck_weights = [7, 4, 5, 4, 6]`},workUnit:`시뮬레이션한 시각 단계 수`,approaches:[{id:`bridge-event-queue`,name:`시간별 큐 (하차 시각 기록 + 점프)`,rank:`BEST`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`다리 큐에 (무게, 나가는 시각)을 넣고 막힐 때는 맨 앞 트럭의 하차 시각으로 바로 점프하는 O(N) 풀이입니다.`,pros:[`다리 길이(최대 10,000)가 아무리 길어도 트럭이 오르내리는 시각으로만 이동하므로 트럭 수 N에 비례하는 시간에 끝납니다.`,`다리 위에 실제로 올라간 트럭만 큐에 담아 메모리를 아낍니다.`],cons:[`점프할 때와 1초 뒤 바로 진입할 때 양쪽에서 하차 처리를 빠뜨리지 않게 주의해야 합니다.`],whyThisRank:`트럭마다 큐에 한 번 들어가고 한 번 나오므로 다리 길이와 무관하게 O(N)에 풀립니다.`,code:d,visualize:P},{id:`bridge-zero-padding`,name:`0을 채운 다리 큐를 1초씩 밀기`,rank:`ALTERNATIVE`,timeComplexity:`O(N × bridge_length)`,spaceComplexity:`O(bridge_length)`,verdict:`다리를 길이 bridge_length짜리 큐로 만들고 매초 0이나 트럭을 밀어 넣는 직관적인 풀이이지만, 빈 초도 일일이 세어 느립니다.`,pros:[`다리를 벨트 컨베이어처럼 다루어 구현이 단순합니다.`,`매초 똑같은 규칙으로 돌아가 경계 조건 실수가 적습니다.`],cons:[`트럭이 못 올라가는 동안에도 1초씩 0을 밀어 넣어야 해서, 다리 길이와 트럭 수가 모두 10,000이면 최대 1억 번 가까이 반복할 수 있습니다.`,`다리 길이만큼의 배열을 늘 메모리에 들고 있어야 합니다.`],whyThisRank:`이 문제의 제한에서는 통과하지만, 정석이 한 번의 점프로 넘기는 빈 시간 구간을 1초씩 전부 실행하느라 시간과 메모리를 더 씁니다.`,code:p,visualize:F},{id:`bridge-batch-reset`,name:`무게 초과 시 다리 길이만큼 더하고 초기화`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(1)`,verdict:`무게가 넘칠 때 무조건 bridge_length초를 더하고 다리가 완전히 빈다고 가정해, 트럭이 한 대씩 교대하는 경우를 놓치는 오답입니다.`,pros:[`큐 없이 변수 두 개만으로 짜서 문제의 기본 예제 3개를 모두 통과합니다.`],cons:[`다리 위에 [4, 5]가 있을 때 맨 앞 4만 내려가도 다음 트럭 4가 올라갈 수 있는데, 다리가 통째로 비어야 한다고 계산해 시간이 어긋납니다.`,`교대로 올라탄 뒤 아직 다리 위에 남아 있는 앞 트럭(5)의 무게도 잃어버립니다.`],whyThisRank:`예제 3개를 모두 맞혀서 가장 속기 쉬운 함정입니다. 다리 위 트럭들은 각자 다른 시각에 내려가므로 개별 하차 시각을 큐로 관리해야 합니다.`,code:h,visualize:I}],checks:{cases:[{args:[2,10,[7,4,5,6]],expected:8},{args:[100,100,[10]],expected:101},{args:[100,100,[10,10,10,10,10,10,10,10,10,10]],expected:110},{args:[3,10,[4,5,6]],expected:8},{args:[1,5,[2,3,5]],expected:4},{args:[a,o,s],expected:11}],random:e=>{let t=1+Math.floor(e()*5),n=5+Math.floor(e()*15),r=1+Math.floor(e()*6);return[t,n,Array.from({length:r},()=>1+Math.floor(e()*n))]}}};export{L as default};