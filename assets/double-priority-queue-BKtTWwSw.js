import{o as e}from"./layout-DFaYBMY_.js";import{c as t,i as n,l as r,r as i}from"./shared-CL29HWIp.js";var a=[`I 10`,`I 20`,`I 30`,`D 1`,`D -1`,`I 5`,`D 1`],o={python:`import heapq

def solution(operations):
    min_h, max_h = [], []
    alive = [False] * len(operations)

    for i, op in enumerate(operations):
        cmd, val = op.split()
        num = int(val)
        if cmd == 'I':
            heapq.heappush(min_h, (num, i))
            heapq.heappush(max_h, (-num, i))
            alive[i] = True
        elif num == 1:  # 최댓값 삭제
            while max_h and not alive[max_h[0][1]]:
                heapq.heappop(max_h)
            if max_h:
                alive[heapq.heappop(max_h)[1]] = False
        else:           # 최솟값 삭제
            while min_h and not alive[min_h[0][1]]:
                heapq.heappop(min_h)
            if min_h:
                alive[heapq.heappop(min_h)[1]] = False

    while max_h and not alive[max_h[0][1]]:
        heapq.heappop(max_h)
    while min_h and not alive[min_h[0][1]]:
        heapq.heappop(min_h)

    return [-max_h[0][0], min_h[0][0]] if max_h and min_h else [0, 0]`,javascript:`function solution(operations) {
  const makeHeap = (cmp) => {
    const h = [];
    const push = (v) => {
      h.push(v);
      for (let i = h.length - 1; i > 0;) {
        const p = (i - 1) >> 1;
        if (cmp(h[p], h[i]) <= 0) break;
        [h[p], h[i]] = [h[i], h[p]];
        i = p;
      }
    };
    const pop = () => {
      const top = h[0], last = h.pop();
      if (h.length) {
        h[0] = last;
        for (let i = 0;;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < h.length && cmp(h[l], h[m]) < 0) m = l;
          if (r < h.length && cmp(h[r], h[m]) < 0) m = r;
          if (m === i) break;
          [h[i], h[m]] = [h[m], h[i]];
          i = m;
        }
      }
      return top;
    };
    return { h, push, pop };
  };

  const minH = makeHeap((a, b) => a[0] - b[0]);
  const maxH = makeHeap((a, b) => b[0] - a[0]);
  const alive = Array(operations.length).fill(false);
  const clean = (heap) => { while (heap.h.length && !alive[heap.h[0][1]]) heap.pop(); };

  operations.forEach((op, i) => {
    const [cmd, raw] = op.split(' ');
    const num = Number(raw);
    if (cmd === 'I') {
      minH.push([num, i]);
      maxH.push([num, i]);
      alive[i] = true;
    } else if (num === 1) {
      clean(maxH);
      if (maxH.h.length) alive[maxH.pop()[1]] = false;
    } else {
      clean(minH);
      if (minH.h.length) alive[minH.pop()[1]] = false;
    }
  });

  clean(maxH);
  clean(minH);
  return maxH.h.length && minH.h.length ? [maxH.h[0][0], minH.h[0][0]] : [0, 0];
}`},s={init:n(o,[`min_h, max_h = [], []`,`alive = [False]`],[`const minH = makeHeap`,`const maxH = makeHeap`,`const alive = Array`]),insert:n(o,[`if cmd == 'I':`,`heapq.heappush(min_h`,`heapq.heappush(max_h`,`alive[i] = True`],[`if (cmd === 'I')`,`minH.push([num, i])`,`maxH.push([num, i])`,`alive[i] = true`]),delMax:n(o,[`elif num == 1:`,`while max_h and not alive`,`alive[heapq.heappop(max_h)[1]] = False`],[`} else if (num === 1)`,`clean(maxH)`,`if (maxH.h.length) alive[maxH.pop()[1]] = false`]),delMin:n(o,[`else:`,`while min_h and not alive`,`alive[heapq.heappop(min_h)[1]] = False`],[`clean(minH)`,`if (minH.h.length) alive[minH.pop()[1]] = false`]),finalClean:n(o,[`while max_h and not alive[max_h[0][1]]:`,`return [-max_h[0][0], min_h[0][0]]`],[`clean(maxH)`,`clean(minH)`,`return maxH.h.length`])},c={python:`def solution(operations):
    arr = []
    for op in operations:
        cmd, val = op.split()
        num = int(val)
        if cmd == 'I':
            arr.append(num)
        elif arr:
            # 삭제할 때마다 배열 전체를 훑어 최댓값/최솟값을 찾는다
            target = max(arr) if num == 1 else min(arr)
            arr.remove(target)

    return [max(arr), min(arr)] if arr else [0, 0]`,javascript:`function solution(operations) {
  const arr = [];
  for (const op of operations) {
    const [cmd, raw] = op.split(' ');
    const num = Number(raw);
    if (cmd === 'I') {
      arr.push(num);
    } else if (arr.length) {
      // 삭제할 때마다 배열 전체를 훑어 최댓값/최솟값 위치를 찾는다
      let best = 0;
      for (let i = 1; i < arr.length; i++) {
        if (num === 1 ? arr[i] > arr[best] : arr[i] < arr[best]) best = i;
      }
      arr.splice(best, 1);
    }
  }
  return arr.length ? [Math.max(...arr), Math.min(...arr)] : [0, 0];
}`},l={init:n(c,[`arr = []`],[`const arr = []`]),insert:n(c,[`if cmd == 'I':`,`arr.append(num)`],[`if (cmd === 'I')`,`arr.push(num)`]),remove:n(c,[`target = max(arr) if num == 1 else min(arr)`,`arr.remove(target)`],[`let best = 0`,`for (let i = 1; i < arr.length; i++)`,`arr.splice(best, 1)`]),done:n(c,[`return [max(arr), min(arr)]`],[`return arr.length ? [Math.max(...arr)`])},u={python:`import heapq

def solution(operations):
    min_h, max_h = [], []
    count = 0

    for op in operations:
        cmd, val = op.split()
        num = int(val)
        if cmd == 'I':
            heapq.heappush(min_h, num)
            heapq.heappush(max_h, -num)
            count += 1
        elif count > 0:
            if num == 1:
                heapq.heappop(max_h)  # min_h에는 이 값이 그대로 남는다
            else:
                heapq.heappop(min_h)  # max_h에는 이 값이 그대로 남는다
            count -= 1
            if count == 0:            # 완전히 비었을 때만 두 힙을 비운다
                min_h.clear()
                max_h.clear()

    return [-max_h[0], min_h[0]] if count > 0 else [0, 0]`,javascript:`function solution(operations) {
  const minH = [], maxH = [];
  let count = 0;

  for (const op of operations) {
    const [cmd, raw] = op.split(' ');
    const num = Number(raw);
    if (cmd === 'I') {
      minH.push(num); minH.sort((a, b) => a - b);
      maxH.push(num); maxH.sort((a, b) => b - a);
      count++;
    } else if (count > 0) {
      if (num === 1) maxH.shift(); // minH에는 이 값이 그대로 남는다
      else minH.shift();           // maxH에는 이 값이 그대로 남는다
      count--;
      if (count === 0) {           // 완전히 비었을 때만 두 힙을 비운다
        minH.length = 0;
        maxH.length = 0;
      }
    }
  }
  return count > 0 ? [maxH[0], minH[0]] : [0, 0];
}`},d={init:n(u,[`min_h, max_h = [], []`,`count = 0`],[`const minH = [], maxH = []`,`let count = 0`]),insert:n(u,[`if cmd == 'I':`,`heapq.heappush(min_h, num)`,`count += 1`],[`if (cmd === 'I')`,`minH.push(num)`,`count++`]),del:n(u,[`elif count > 0:`,`heapq.heappop(max_h)`,`heapq.heappop(min_h)`,`count -= 1`],[`} else if (count > 0)`,`if (num === 1) maxH.shift()`,`else minH.shift()`,`count--`]),done:n(u,[`return [-max_h[0], min_h[0]]`],[`return count > 0 ? [maxH[0], minH[0]]`])},f=560,p=310,m=e({x:88,y:12,w:60,h:34,gap:6}),h=e({x:96,y:68,w:82,h:36,gap:8}),g=e({x:96,y:124,w:82,h:36,gap:8}),_=e({x:96,y:184,w:82,h:38,gap:8}),v={x:96,y:248,w:240,h:42};function y(e,t,n){return{width:f,height:p,items:[{id:`lab:ops`,kind:`text`,rect:{x:0,y:12,w:84,h:34},text:`연산 목록`},...a.map((e,t)=>({id:`op:${t}`,kind:`cell`,rect:m(t),tone:`plain`,text:e})),{id:`lab:max`,kind:`text`,rect:{x:0,y:68,w:90,h:36},text:e},{id:`zone:max`,kind:`zone`,rect:{x:92,y:64,w:456,h:44}},{id:`lab:min`,kind:`text`,rect:{x:0,y:124,w:90,h:36},text:t},{id:`zone:min`,kind:`zone`,rect:{x:92,y:120,w:456,h:44}},{id:`lab:alive`,kind:`text`,rect:{x:0,y:184,w:90,h:38},text:n},{id:`zone:alive`,kind:`zone`,rect:{x:92,y:180,w:456,h:46}},{id:`ans:tok`,kind:`token`,rect:v,tone:`plain`,text:`[최댓값, 최솟값] = -`,tag:`결과`}]}}function b(){let e=new r(y(`최대 힙`,`최소 힙`,`생존(alive)`)),n=[],o=[],c=[],l=new Map,u=0,d=e=>`max:${e}`,f=e=>`min:${e}`,p=e=>`alv:${e}`,m=()=>[...n.map((e,t)=>({type:`set`,id:d(e.id),patch:{rect:h(t),tone:l.get(e.id)?`queued`:`muted`}})),...o.map((e,t)=>({type:`set`,id:f(e.id),patch:{rect:g(t),tone:l.get(e.id)?`queued`:`muted`}}))],v=(e=`-`)=>({work:u,variables:{op:e,maxH:`[${n.map(e=>l.get(e.id)?e.val:`${e.val}(삭제됨)`).join(`, `)}]`,minH:`[${o.map(e=>l.get(e.id)?e.val:`${e.val}(삭제됨)`).join(`, `)}]`,alive:`[${c.filter(e=>l.get(e.id)).map(e=>e.val).join(`, `)}]`}});e.step({title:`최대 힙·최소 힙과 alive 배열 준비`,codeHighlights:s.init,...v()}),e.phase(`초기화`,`최댓값용 최대 힙, 최솟값용 최소 힙, 그리고 각 원소가 아직 살아 있는지 기록할 alive 배열을 준비합니다.`,s.init),e.do({type:`focus`,ids:a.map((e,t)=>`op:${t}`)}),e.do({type:`unfocus`}),a.forEach((r,a)=>{let[y,b]=r.split(` `),x=Number(b);if(u++,y===`I`){let u={id:a,val:x},y=c.length;c.push(u),l.set(a,!0),n.push(u),n.sort((e,t)=>t.val-e.val),o.push(u),o.sort((e,t)=>e.val-t.val),e.step({title:`${r}: 두 힙에 ${x} 넣고 alive = True`,codeHighlights:s.insert,...v(r)}),e.phase(`삽입하기`,`${i(x,`을`,`를`)} 최대 힙과 최소 힙에 모두 넣고, alive[${a}] = True로 표시합니다.`,s.insert),e.do(...t([{type:`set`,id:`op:${a}`,patch:{tone:`current`}},{type:`add`,item:{id:d(a),kind:`token`,rect:h(n.indexOf(u)),tone:`queued`,text:String(x)},from:`op:${a}`},{type:`add`,item:{id:f(a),kind:`token`,rect:g(o.indexOf(u)),tone:`queued`,text:String(x)},from:`op:${a}`},{type:`add`,item:{id:p(a),kind:`token`,rect:_(y),tone:`good`,text:`${x}: 생존`},from:`op:${a}`},...m()])),e.do({type:`set`,id:`op:${a}`,patch:{tone:`visited`}})}else if(x===1){let o=[];for(;n.length&&!l.get(n[0].id);)o.push(n.shift()),u++;let c=n.shift();l.set(c.id,!1),e.step({title:`${r}: 최대 힙에서 최댓값 ${c.val} 삭제`,codeHighlights:s.delMax,...v(r)}),e.phase(`최댓값 삭제`,`최대 힙 맨 앞의 ${i(c.val,`을`,`를`)} 꺼내고 alive를 False로 바꿉니다. 최소 힙에 남아 있는 ${c.val}은 나중에 맨 앞에 오면 버립니다.`,s.delMax),e.do(...t([{type:`set`,id:`op:${a}`,patch:{tone:`current`}},...o.map(e=>({type:`remove`,id:d(e.id)})),{type:`remove`,id:d(c.id),into:p(c.id)},{type:`set`,id:p(c.id),patch:{tone:`muted`,text:`${c.val}: 삭제됨`}},...m()])),e.do({type:`set`,id:`op:${a}`,patch:{tone:`visited`}})}else{let n=[];for(;o.length&&!l.get(o[0].id);)n.push(o.shift()),u++;let c=o.shift();l.set(c.id,!1),e.step({title:`${r}: 최소 힙에서 최솟값 ${c.val} 삭제`,codeHighlights:s.delMin,...v(r)}),e.phase(`최솟값 삭제`,`최소 힙 맨 앞의 ${i(c.val,`을`,`를`)} 꺼내고 alive를 False로 바꿉니다. 최대 힙에 있는 ${c.val}도 삭제됨(회색)으로 표시됩니다.`,s.delMin),e.do(...t([{type:`set`,id:`op:${a}`,patch:{tone:`current`}},...n.map(e=>({type:`remove`,id:f(e.id)})),{type:`remove`,id:f(c.id),into:p(c.id)},{type:`set`,id:p(c.id),patch:{tone:`muted`,text:`${c.val}: 삭제됨`}},...m()])),e.do({type:`set`,id:`op:${a}`,patch:{tone:`visited`}})}});let b=[];for(;n.length&&!l.get(n[0].id);)b.push(n.shift()),u++;let x=[];for(;o.length&&!l.get(o[0].id);)x.push(o.shift()),u++;let S=[n[0].val,o[0].val];return e.step({title:`죽은 원소 정리 후 정답 [${S[0]}, ${S[1]}]`,codeHighlights:s.finalClean,...v(`종료 정리`),answer:S,isKeyframe:!0}),e.phase(`유령 원소 정리 및 정답`,`마지막에 최대 힙 꼭대기에 남아 있던 이미 삭제된 원소(${b.map(e=>e.val).join(`, `)})와 최소 힙의 이미 삭제된 원소를 걷어내면 살아 있는 최댓값 ${S[0]}, 최솟값 ${i(S[1],`이`,`가`)} 남습니다.`,s.finalClean),e.do(...t([...b.map(e=>({type:`remove`,id:d(e.id)})),...x.map(e=>({type:`remove`,id:f(e.id)})),...m(),{type:`set`,id:d(n[0].id),patch:{tone:`path`}},{type:`set`,id:f(o[0].id),patch:{tone:`path`}},{type:`set`,id:`ans:tok`,patch:{text:`[최댓값, 최솟값] = [${S[0]}, ${S[1]}]`,tone:`path`},pop:!0}])),e.finish()}function x(){let e=new r(y(`배열(arr)`,`(미사용)`,`탐색 상태`)),n=[],o=0,s=e=>`arr:${e}`,c=()=>n.map((e,t)=>({type:`set`,id:s(e.id),patch:{rect:h(t),tone:`queued`}})),u=(e=`-`)=>({work:o,variables:{op:e,arr:`[${n.map(e=>e.val).join(`, `)}]`}});e.step({title:`빈 배열 하나로 시작하기`,codeHighlights:l.init,...u()}),e.phase(`초기화`,`힙 대신 배열 하나에 원소를 담고, 삭제할 때마다 배열 전체를 훑어 최댓값이나 최솟값을 찾습니다.`,l.init),e.do({type:`focus`,ids:a.map((e,t)=>`op:${t}`)}),e.do({type:`unfocus`}),a.forEach((r,a)=>{let[d,f]=r.split(` `),p=Number(f);if(d===`I`){let c={id:a,val:p};n.push(c),o++,e.step({title:`${r}: 배열 끝에 ${p} 추가`,codeHighlights:l.insert,...u(r)}),e.phase(`추가하기`,`배열 맨 뒤에 ${i(p,`을`,`를`)} 넣습니다.`,l.insert),e.do(...t([{type:`set`,id:`op:${a}`,patch:{tone:`current`}},{type:`add`,item:{id:s(a),kind:`token`,rect:h(n.length-1),tone:`queued`,text:String(p)},from:`op:${a}`}])),e.do({type:`set`,id:`op:${a}`,patch:{tone:`visited`}})}else{o+=n.length*2;let d=0;for(let e=1;e<n.length;e++)(p===1?n[e].val>n[d].val:n[e].val<n[d].val)&&(d=e);let[f]=n.splice(d,1);e.step({title:`${r}: 배열 전체를 훑어 ${f.val} 삭제`,codeHighlights:l.remove,...u(r)}),e.phase(`훑어서 지우기`,`배열의 모든 원소를 비교해 ${p===1?`최댓값`:`최솟값`} ${i(f.val,`을`,`를`)} 찾아 지우고 뒷부분을 당깁니다.`,l.remove),e.do({type:`focus`,ids:[s(f.id)]}),e.do(...t([{type:`unfocus`},{type:`set`,id:`op:${a}`,patch:{tone:`visited`}},{type:`remove`,id:s(f.id)},...c()]))}}),o+=n.length*2;let d=[n[0].val,n[0].val];return e.step({title:`정답 [${d[0]}, ${d[1]}] (매번 선형 탐색)`,codeHighlights:l.done,...u(`완료`),answer:d,isKeyframe:!0}),e.phase(`정답`,`남은 원소에서 최댓값과 최솟값을 구해 [${d[0]}, ${d[1]}]을 얻습니다. 삭제할 때마다 배열 전체를 훑어 연산이 ${o}번 들었고, 연산이 100만 개면 O(N²)으로 시간 초과가 납니다.`,l.done),e.do(...t([{type:`set`,id:s(n[0].id),patch:{tone:`path`}},{type:`set`,id:`ans:tok`,patch:{text:`[최댓값, 최솟값] = [${d[0]}, ${d[1]}]`,tone:`path`},pop:!0}])),e.finish()}function S(){let e=new r(y(`최대 힙`,`최소 힙`,`개수(count)`)),n=[],o=[],s=0,c=0,l=e=>`max:${e}`,u=e=>`min:${e}`,f=()=>[...n.map((e,t)=>({type:`set`,id:l(e.id),patch:{rect:h(t)}})),...o.map((e,t)=>({type:`set`,id:u(e.id),patch:{rect:g(t)}}))],p=(e=`-`)=>({work:c,variables:{op:e,count:s,maxH:`[${n.map(e=>e.val).join(`, `)}]`,minH:`[${o.map(e=>e.val).join(`, `)}]`}});e.step({title:`alive 없이 count만 세기`,codeHighlights:d.init,...p()}),e.phase(`초기화`,`개별 원소의 삭제 여부를 기록하지 않고 전체 개수 count만 세어 봅니다.`,d.init),e.do({type:`add`,item:{id:`cnt:tok`,kind:`token`,rect:_(0),tone:`plain`,text:`count = 0`}}),a.forEach((r,a)=>{let[m,_]=r.split(` `),v=Number(_);if(c++,m===`I`){let c={id:a,val:v};n.push(c),n.sort((e,t)=>t.val-e.val),o.push(c),o.sort((e,t)=>e.val-t.val),s++,e.step({title:`${r}: 두 힙에 ${v} 넣고 count = ${s}`,codeHighlights:d.insert,...p(r)}),e.phase(`삽입하기`,`두 힙에 ${i(v,`을`,`를`)} 넣고 count를 ${s}로 늘립니다.`,d.insert),e.do(...t([{type:`set`,id:`op:${a}`,patch:{tone:`visited`}},{type:`add`,item:{id:l(a),kind:`token`,rect:h(n.indexOf(c)),tone:`queued`,text:String(v)},from:`op:${a}`},{type:`add`,item:{id:u(a),kind:`token`,rect:g(o.indexOf(c)),tone:`queued`,text:String(v)},from:`op:${a}`},{type:`set`,id:`cnt:tok`,patch:{text:`count = ${s}`,tone:`chosen`},pop:!0},...f()]))}else if(v===1){let o=n.shift();s--,e.step({title:`${r}: 최대 힙에서만 ${o.val} 제거 (최소 힙엔 남음)`,codeHighlights:d.del,...p(r)}),e.phase(`한쪽만 꺼내기`,`최대 힙에서만 ${i(o.val,`을`,`를`)} 꺼내고, 최소 힙에 남아 있는 ${o.val}은 그대로 둡니다.`,d.del),e.do(...t([{type:`set`,id:`op:${a}`,patch:{tone:`visited`}},{type:`remove`,id:l(o.id)},{type:`set`,id:u(o.id),patch:{tone:`bad`,text:`${o.val}(유령)`}},{type:`set`,id:`cnt:tok`,patch:{text:`count = ${s}`},pop:!0},...f()]))}else{let n=o.shift();s--,e.step({title:`${r}: 최소 힙에서만 ${n.val} 제거 (최대 힙엔 남음)`,codeHighlights:d.del,...p(r)}),e.phase(`한쪽만 꺼내기`,`최소 힙에서만 ${i(n.val,`을`,`를`)} 꺼내고, 최대 힙에 남아 있는 ${n.val}은 그대로 둡니다.`,d.del),e.do(...t([{type:`set`,id:`op:${a}`,patch:{tone:`visited`}},{type:`remove`,id:u(n.id)},{type:`set`,id:l(n.id),patch:{tone:`bad`,text:`${n.val}(유령)`}},{type:`set`,id:`cnt:tok`,patch:{text:`count = ${s}`},pop:!0},...f()]))}});let m=[n[0].val,o[0].val];return e.step({title:`오답: 이미 지운 10이 최대 힙 맨 앞에 남아 [${m[0]}, ${m[1]}]`,codeHighlights:d.done,...p(`종료`),answer:m,isKeyframe:!0}),e.phase(`오답 확인`,`count가 중간에 0이 된 적이 없어 두 힙을 비우지 못했습니다. D -1로 이미 삭제된 10이 최대 힙 꼭대기에 남아 [${m[0]}, ${m[1]}](정답 [5, 5])이라는 오답이 나옵니다.`,d.done),e.do({type:`arrow`,from:l(n[0].id),to:`ans:tok`,verdict:`bad`,label:`이미 삭제된 10`}),e.do({type:`set`,id:`ans:tok`,patch:{text:`오답 [${m[0]}, ${m[1]}] (정답 [5, 5])`,tone:`bad`},pop:!0}),e.finish()}var C={id:`double-priority-queue`,title:`이중우선순위큐`,level:3,category:`heap`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42628`,description:{summary:`숫자를 삽입하는 "I 숫자", 최댓값을 지우는 "D 1", 최솟값을 지우는 "D -1" 연산을 차례대로 처리하는 이중 우선순위 큐를 구현합니다. 모든 연산을 끝낸 뒤 큐가 비어 있으면 [0, 0]을, 비어 있지 않으면 [최댓값, 최솟값]을 돌려줍니다.`,rules:[`operations는 길이가 1 이상 1,000,000 이하인 문자열 배열입니다.`,`"I 숫자"는 큐에 주어진 숫자를 삽입합니다.`,`"D 1"은 큐에서 최댓값을 삭제하고, "D -1"은 큐에서 최솟값을 삭제합니다.`,`빈 큐에 데이터를 삭제하라는 연산이 주어질 경우, 해당 연산은 무시합니다.`,`최댓값/최솟값이 둘 이상인 경우, 하나만 삭제합니다.`],examples:[{input:`operations = ["I 16", "I -5643", "D -1", "D 1", "D 1", "I 123", "D -1"]`,output:`[0, 0]`},{input:`operations = ["I -45", "I 653", "D 1", "I -642", "I 45", "I 97", "D 1", "D -1", "I 333"]`,output:`[333, -45]`}]},keyIntuitions:[`최솟값과 최댓값을 모두 빠르게 꺼내려면 최소 힙과 최대 힙 두 개를 함께 두어야 합니다.`,`한쪽 힙에서 지운 원소를 다른 쪽 힙에서 즉시 찾아 지우면 O(N)이 걸리므로, 원소마다 고유 번호(id)와 생존 여부(alive)만 기록해 두고 나중에 반대편 힙 꼭대기에 올라왔을 때 버립니다(지연 삭제).`,`모든 연산이 끝난 뒤에도 두 힙 꼭대기에 이미 삭제된 원소가 남아 있을 수 있으므로 마지막에 한 번 더 청소해야 합니다.`],demo:{input:[a],label:`operations = [${a.map(e=>`"${e}"`).join(`, `)}]`},workUnit:`힙·배열 연산 수`,approaches:[{id:`double-pq-two-heaps`,name:`힙 두 개 + 생존 표시 (지연 삭제)`,rank:`BEST`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`최소 힙과 최대 힙 두 개를 두고, 반대편 힙에서 삭제된 원소는 alive 배열로 걸러 내는 정석 풀이입니다.`,pros:[`각 원소가 두 힙에 최대 한 번씩 들어가고 한 번씩 나오므로 100만 개 연산도 O(N log N)에 끝납니다.`,`중복된 숫자가 들어와도 연산 인덱스 i를 고유 번호로 함께 넣으면 정확히 하나만 지울 수 있습니다.`],cons:[`연산 루프가 끝난 뒤 두 힙의 꼭대기를 한 번 더 청소하는 단계를 잊기 쉽습니다.`],whyThisRank:`최댓값과 최솟값 삭제를 모두 O(log N)에 처리하면서 두 힙의 상태를 어긋나지 않게 맞추는 표준 기법입니다.`,code:o,visualize:b},{id:`double-pq-array-scan`,name:`배열 하나에서 매번 최댓값·최솟값 찾아 지우기`,rank:`ALTERNATIVE`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`배열 하나에 값을 모아 두고 삭제할 때마다 전체 배열을 훑어 최댓값이나 최솟값을 지우는 풀이입니다.`,pros:[`힙 동기화를 신경 쓸 필요가 없어 구현이 매우 단순합니다.`],cons:[`삭제 연산마다 배열 전체를 탐색하고 당겨야 해서 최악 시간 복잡도가 O(N²)입니다.`,`연산 수가 최대 100만 개이므로 큰 입력에서는 시간 초과가 납니다.`],whyThisRank:`작은 테스트에서는 정확한 답을 내지만 삭제할 때마다 O(N)이 걸려 힙을 쓰는 정석보다 훨씬 많은 원소를 확인합니다.`,code:c,visualize:x},{id:`double-pq-unsynced`,name:`개수(count)만 세고 개별 삭제 여부를 기록하지 않기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`count가 0일 때만 두 힙을 비우고, 중간에 반대편 힙에서 삭제된 원소를 걸러 내지 않는 오답 풀이입니다.`,pros:[`alive 배열 없이 변수 하나로 해결하려 해 코드가 짧아 보입니다.`],cons:[`큐가 완전히 비지 않은 채 삭제와 삽입이 섞이면, 최소 힙에서 이미 지운 원소가 최대 힙 꼭대기에 그대로 남습니다.`],whyThisRank:`count > 0인 동안에는 반대편 힙에서 지워진 유령 원소를 구분할 방법이 없어 잘못된 최댓값·최솟값을 반환합니다.`,code:u,visualize:S}],checks:{cases:[{args:[[`I 16`,`I -5643`,`D -1`,`D 1`,`D 1`,`I 123`,`D -1`]],expected:[0,0]},{args:[[`I -45`,`I 653`,`D 1`,`I -642`,`I 45`,`I 97`,`D 1`,`D -1`,`I 333`]],expected:[333,-45]},{args:[a],expected:[5,5]},{args:[[`D 1`,`D -1`,`I 7`,`I 7`,`D 1`]],expected:[7,7]},{args:[[`I 1`,`I 2`,`I 3`,`D -1`,`D 1`]],expected:[2,2]}],random:e=>{let t=3+Math.floor(e()*10);return[Array.from({length:t},()=>{let t=e();return t<.55?`I ${Math.floor(e()*41)-20}`:t<.78?`D 1`:`D -1`})]}}};export{C as default};