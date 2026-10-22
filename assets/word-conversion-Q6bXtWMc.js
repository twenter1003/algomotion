import{c as e,i as t,l as n,r}from"./shared-CL29HWIp.js";import{t as i}from"./lane-BzDhdR3X.js";import{t as a}from"./pacing-CRi5IfsT.js";var o=`hit`,s=`cog`,c=[`hot`,`dot`,`dog`,`lot`,`log`,`cog`],l=[o,...c],u=(e,t)=>[...e].filter((e,n)=>e!==t[n]).length===1,d=e=>c.filter(t=>u(e,t)),f=l.flatMap((e,t)=>l.slice(t+1).filter(t=>u(e,t)).map(t=>[e,t])),p=e=>`{${[...e].join(`, `)}}`,m={python:`from collections import deque

def solution(begin, target, words):
    if target not in words:
        return 0

    def diff_one(a, b):  # 한 글자만 다르면 True
        return sum(x != y for x, y in zip(a, b)) == 1

    queue = deque([(begin, 0)])  # (단어, 바꾼 횟수)
    visited = {begin}
    while queue:
        now, count = queue.popleft()
        if now == target:
            return count  # 목표를 처음 꺼낸 순간의 횟수가 최소
        for word in words:
            if word not in visited and diff_one(now, word):
                visited.add(word)
                queue.append((word, count + 1))
    return 0`,javascript:`function solution(begin, target, words) {
  if (!words.includes(target)) return 0;

  const diffOne = (a, b) => { // 한 글자만 다르면 true
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff === 1;
  };

  const queue = [[begin, 0]]; // [단어, 바꾼 횟수]
  const visited = new Set([begin]);
  let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
  while (head < queue.length) {
    const [now, count] = queue[head++];
    if (now === target) return count; // 목표를 처음 꺼낸 순간의 횟수가 최소
    for (const word of words) {
      if (!visited.has(word) && diffOne(now, word)) {
        visited.add(word);
        queue.push([word, count + 1]);
      }
    }
  }
  return 0;
}`},h={start:t(m,[`queue = deque([(begin, 0)])`,`visited = {begin}`],[`const queue = [[begin, 0]]`,`const visited = new Set([begin])`]),pop:t(m,[`while queue:`,`now, count = queue.popleft()`],[`while (head < queue.length)`,`const [now, count] = queue[head++]`]),look:t(m,[`for word in words`,`if word not in visited and diff_one(now, word)`],[`for (const word of words)`,`if (!visited.has(word) && diffOne(now, word))`]),mark:t(m,[`for word in words`,`if word not in visited and diff_one(now, word)`,`visited.add(word)`],[`for (const word of words)`,`if (!visited.has(word) && diffOne(now, word))`,`visited.add(word)`]),push:t(m,[`queue.append((word, count + 1))`],[`queue.push([word, count + 1])`]),next:t(m,[`while queue:`],[`while (head < queue.length)`]),goal:t(m,[`if now == target`,`return count`],[`if (now === target) return count`])},g={python:`def solution(begin, target, words):
    if target not in words:
        return 0

    def diff_one(a, b):  # 한 글자만 다르면 True
        return sum(x != y for x, y in zip(a, b)) == 1

    visited = [False] * len(words)
    best = float('inf')

    def dfs(now, count):
        nonlocal best
        if now == target:
            best = min(best, count)  # 더 짧은 길이 있을 수 있어 멈추지 않고 계속
            return
        for i, word in enumerate(words):
            if not visited[i] and diff_one(now, word):
                visited[i] = True
                dfs(word, count + 1)
                visited[i] = False  # 되돌리기 → 다른 길도 모두 시도

    dfs(begin, 0)
    return 0 if best == float('inf') else best`,javascript:`function solution(begin, target, words) {
  if (!words.includes(target)) return 0;

  const diffOne = (a, b) => { // 한 글자만 다르면 true
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff === 1;
  };

  const visited = Array(words.length).fill(false);
  let best = Infinity;

  const dfs = (now, count) => {
    if (now === target) {
      best = Math.min(best, count); // 더 짧은 길이 있을 수 있어 멈추지 않고 계속
      return;
    }
    for (let i = 0; i < words.length; i++) {
      if (!visited[i] && diffOne(now, words[i])) {
        visited[i] = true;
        dfs(words[i], count + 1);
        visited[i] = false; // 되돌리기 → 다른 길도 모두 시도
      }
    }
  };

  dfs(begin, 0);
  return best === Infinity ? 0 : best;
}`},_={start:t(g,[`visited = [False] * len(words)`,`best = float('inf')`,`dfs(begin, 0)`],[`const visited = Array(words.length)`,`let best = Infinity`,`dfs(begin, 0)`]),enter:t(g,[`visited[i] = True`,`dfs(word, count + 1)`],[`visited[i] = true`,`dfs(words[i], count + 1)`]),look:t(g,[`for i, word in enumerate(words)`,`if not visited[i] and diff_one(now, word)`],[`for (let i = 0; i < words.length; i++)`,`if (!visited[i] && diffOne(now, words[i]))`]),found:t(g,[`if now == target`,`best = min(best, count)`],[`if (now === target)`,`best = Math.min(best, count)`]),back:t(g,[`visited[i] = False`],[`visited[i] = false`]),done:t(g,[`dfs(begin, 0)`,`return 0 if best == float('inf') else best`],[`dfs(begin, 0)`,`return best === Infinity ? 0 : best`])},v={python:`# 주의: 오답이 나오는 풀이입니다 (처음 도착한 길을 최단이라고 믿습니다)
def solution(begin, target, words):
    if target not in words:
        return 0

    def diff_one(a, b):  # 한 글자만 다르면 True
        return sum(x != y for x, y in zip(a, b)) == 1

    visited = [False] * len(words)

    def dfs(now, count):
        if now == target:
            return count  # 처음 도착한 길의 횟수를 바로 돌려줌
        for i, word in enumerate(words):
            if not visited[i] and diff_one(now, word):
                visited[i] = True
                found = dfs(word, count + 1)
                if found:
                    return found
                visited[i] = False
        return 0

    return dfs(begin, 0)`,javascript:`// 주의: 오답이 나오는 풀이입니다 (처음 도착한 길을 최단이라고 믿습니다)
function solution(begin, target, words) {
  if (!words.includes(target)) return 0;

  const diffOne = (a, b) => { // 한 글자만 다르면 true
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff === 1;
  };

  const visited = Array(words.length).fill(false);

  const dfs = (now, count) => {
    if (now === target) return count; // 처음 도착한 길의 횟수를 바로 돌려줌
    for (let i = 0; i < words.length; i++) {
      if (!visited[i] && diffOne(now, words[i])) {
        visited[i] = true;
        const found = dfs(words[i], count + 1);
        if (found) return found;
        visited[i] = false;
      }
    }
    return 0;
  };

  return dfs(begin, 0);
}`},y={start:t(v,[`visited = [False] * len(words)`,`return dfs(begin, 0)`],[`const visited = Array(words.length)`,`return dfs(begin, 0)`]),enter:t(v,[`visited[i] = True`,`found = dfs(word, count + 1)`],[`visited[i] = true`,`const found = dfs(words[i], count + 1)`]),look:t(v,[`for i, word in enumerate(words)`,`if not visited[i] and diff_one(now, word)`],[`for (let i = 0; i < words.length; i++)`,`if (!visited[i] && diffOne(now, words[i]))`]),found:t(v,[`if now == target`,`return count`],[`if (now === target) return count`]),back:t(v,[`if found`,`visited[i] = False`],[`if (found) return found`,`visited[i] = false`]),done:t(v,[`if found`,`return found`],[`if (found) return found`])},b=54,x=548,S=360,C={x:0,y:0,w:x,h:S},w={hit:[40,190],hot:[150,190],dot:[270,110],lot:[270,270],dog:[390,110],log:[390,270],cog:[506,190]},T={id:`lane`,x:40,y:5,slotW:56,slotH:30,gap:6,max:7},E=e=>({x:w[e][0]-b/2,y:w[e][1]-b/2,w:b,h:b}),D=e=>`w:${e}`,O=(e,t)=>`edge:${[e,t].sort().join(`-`)}`,k=e=>`dist:${e}`,A=326,j={seen:`방문함`,new:`새 단어`};function M(e,t){let[[n,r],[i,a]]=[w[e],w[t]],o=Math.hypot(i-n,a-r),[s,c]=[(i-n)/o,(a-r)/o],l=b/2/Math.max(Math.abs(s),Math.abs(c))+3;return[[n+s*l,r+c*l],[i-s*l,a-c*l]]}function N(e,...t){let n=[{id:`lane:label`,kind:`text`,rect:{x:0,y:0,w:34,h:40},text:e},{id:`lane:bg`,kind:`zone`,rect:{x:34,y:0,w:514,h:40}}];for(let[e,t]of f)n.push({id:O(e,t),kind:`line`,rect:C,tone:`trail`,points:M(e,t)});for(let e of l){let t=e===o?`begin`:e===s?`target`:void 0;n.push({id:D(e),kind:`cell`,rect:E(e),tone:`plain`,text:e,...t?{tag:t}:{}})}return n.push(...t),{width:x,height:S,items:n}}var P=(e,t,n=!1)=>({type:`set`,id:D(e),patch:t,...n?{pop:n}:{}}),F=(e,t,n)=>({type:`set`,id:O(e,t),patch:{tone:n}}),I=e=>({type:`wait`,ms:e}),L=()=>[{type:`unfocus`},{type:`clearMarks`}],R=(e,t)=>({type:`add`,item:{id:k(e),kind:`token`,rect:{x:w[e][0]-13,y:w[e][1]+b/2+3,w:26,h:20},tone:`plain`,text:String(t)},from:D(e)});function z(t,n,r,i=()=>[]){t.do({type:`focus`,ids:[D(n),...r.map(e=>D(e.w))]});for(let e of r){t.do({type:`arrow`,from:D(n),to:D(e.w),verdict:e.verdict,label:j[e.verdict]});for(let n of i(e))t.do({...n,together:!0})}t.do(I(120),...e(L()))}var B=e=>`${e.map((t,n)=>n===e.length-1?t.end:t.mid).join(`, `)}.`,V=(e,t)=>{let n=[];for(let t of e)n.at(-1)?.verdict===t.verdict?n.at(-1).ws.push(t.w):n.push({verdict:t.verdict,ws:[t.w]});return B(n.map(({verdict:e,ws:n})=>e===`seen`?{mid:`${n.join(`, `)}은 이미 썼고`,end:`${n.join(`, `)}은 이미 썼습니다`}:t(n.join(`, `))))};function H(){let t=new n(N(`큐`)),c=new i(t,T),l=new Map([[o,0]]),u=new Map,m=[o],g=0,_=`-`,v,y=()=>({work:g,variables:{now:_,count:_===`-`?`-`:l.get(_),queue:`[${m.map(e=>`(${e}, ${l.get(e)})`).join(`, `)}]`,visited:p(l.keys())}}),b=e=>({id:`tok:${e}`,text:e});for(t.step({title:`${o}을 큐에 넣고 시작`,codeHighlights:h.start,...y()}),t.phase(`시작`,`begin ${o}을 바꾼 횟수 0으로 큐에 넣고 방문 표시를 합니다.`),t.do(...e([P(o,{tone:`queued`},!0),R(o,0)])),c.push(b(o),D(o));m.length;){let n=m.shift();g++,_=n;let i=l.get(n),a=()=>{c.shift(D(n)),t.do(...e([P(n,{tone:`current`}),...v===void 0?[]:[P(v,{tone:`visited`})]],!0)),v=n};if(n===s){let o=[n];for(;u.has(o[0]);)o.unshift(u.get(o[0]));t.step({title:`목표 ${n} 꺼내기 — 최소 ${i}번`,codeHighlights:h.goal,...y(),answer:i,isKeyframe:!0}),t.phase(`꺼내기`,`큐 맨 앞에서 목표 단어 ${n}을 꺼냈습니다.`,h.pop),a(),t.phase(`도착`,`${n}을 처음 꺼낸 순간의 횟수 ${r(i,`이`,`가`)} 답입니다. ${o.join(` → `)} 순서로 ${i}번 바꾸면 됩니다.`);let s=new Set(o),c=o.slice(1).map((e,t)=>[o[t],e]),l=(e,t)=>c.some(([n,r])=>n===e&&r===t||n===t&&r===e);t.do(...e([...[...s].map(e=>P(e,{tone:`path`})),...f.map(([e,t])=>F(e,t,l(e,t)?`path`:`trail`))]));break}let o=d(n).map(e=>({w:e,verdict:l.has(e)?`seen`:`new`})),p=o.filter(e=>e.verdict===`new`).map(e=>e.w);for(let e of p)l.set(e,i+1),u.set(e,n),m.push(e);t.step({title:p.length?`${n} 꺼내고 ${p.join(`, `)} 넣기`:`${n} 꺼내기 — 넣을 단어 없음`,codeHighlights:p.length?h.push:h.next,...y()}),t.phase(`꺼내기`,`큐 맨 앞에서 ${n}을 꺼냅니다. 바꾼 횟수는 ${i}입니다.`,h.pop),a(),t.phase(`살피기`,o.length?`한 글자만 다른 단어를 찾습니다. ${V(o,e=>({mid:`${e}은 처음이라 방문 표시를 하고`,end:`${e}은 처음이라 방문 표시를 합니다`}))}`:`한 글자만 다른 단어가 없습니다.`,p.length?h.mark:h.look),o.length?z(t,n,o,e=>e.verdict===`new`?[P(e.w,{tone:`queued`},!0),F(n,e.w,`path`)]:[]):t.do(I(300)),t.phase(`넣기`,p.length?`새로 찾은 ${p.join(`, `)}을 바꾼 횟수 ${r(i+1,`과`,`와`)} 함께 큐 뒤에 넣습니다.`:`새로 넣을 단어가 없어 그대로 넘어갑니다.`,p.length?h.push:h.next);for(let e of p)c.push(b(e),D(e)),t.do({...R(e,i+1),together:!0})}return a(t.finish())}function U(e){let t=new Set,n=[],r=0,i=1/0,a=!1,c,l=(e,t,a,o)=>{c={kind:e,node:t,parent:a,looks:[],count:o,calls:r,best:i},n.push(c)},u=(n,o,f)=>{if(r++,n===s&&(i=Math.min(i,o)),l(`enter`,n,f,o),n===s)e&&(a=!0);else for(let e of d(n))if(t.has(e))c.looks.push({w:e,verdict:`seen`});else{if(c.looks.push({w:e,verdict:`new`}),t.add(e),u(e,o+1,n),a)return;t.delete(e),l(`return`,e,n,o+1)}};return u(o,0),{events:n,calls:r,best:i}}function W(t){let o=t?y:_,{events:u,calls:d,best:m}=U(t),h=new n(N(`스택`,...t?[]:[{id:`best`,kind:`token`,rect:{x:0,y:A,w:100,h:30},tone:`plain`,text:`best ∞`}])),g=new i(h,T),v=new Set,b=[],x=0,S=1/0,C=`-`,w=()=>({work:x,variables:{now:b.at(-1)??`-`,count:b.length?b.length-1:`-`,...t?{"돌려줄 값":C}:{best:S===1/0?`∞`:S},visited:p(c.filter(e=>v.has(e)))}}),E=e=>({id:`frame:${e}`,text:e}),O=t?u.length:u.findIndex(e=>e.kind===`enter`&&e.node===s&&e.best===m)+1,j=u.slice(0,O),M=[];for(let e of j){let t=M.at(-1)?.at(-1);e.kind===`return`&&t?.kind===`return`&&!t.looks.length?M.at(-1).push(e):M.push([e])}M.forEach((n,r)=>{let[i]=n;if(i.kind===`enter`){let{node:n,parent:a,looks:c,count:l}=i,d=r===0;x=i.calls,b.push(n),a!==void 0&&v.add(n);let f=n===s;if(f&&(S=Math.min(S,l),t&&(C=l)),h.step({title:d?`${n}에서 시작`:f?`${n} 도착 — ${l}번`:`${n} 들어가기`,codeHighlights:f?o.found:c.length?o.look:o.enter,...w(),...t&&f?{answer:l,isKeyframe:!0}:{}}),h.phase(`들어가기`,d?`begin ${n}에서 dfs를 시작합니다. 바꾼 횟수는 0입니다.`:`${n}으로 들어갑니다. 지금까지 ${l}번 바꿨습니다.`,d?o.start:o.enter),h.do(...e([P(n,{tone:`current`},!0),...a===void 0?[]:[P(a,{tone:`trail`}),F(a,n,`path`)],R(n,l)])),g.push(E(n),D(n)),f){let r=u[u.indexOf(i)-1]?.best??1/0;h.phase(`도착`,t?`목표 단어 ${n}에 처음 도착했습니다! 바꾼 횟수 ${l}번을 그대로 돌려주고 끝냅니다.`:r===1/0?`목표 단어 ${n}에 도착했습니다. ${l}번 바꾼 첫 길이라 best = ${l}입니다. 더 짧은 길이 있을 수 있어 멈추지 않습니다.`:`목표 단어 ${n}에 도착했습니다. ${l}번으로 지금까지의 best ${r}보다 ${l<r?`짧아 best를 바꿉니다`:`짧지 않아 그대로입니다`}.`,o.found),h.do(...e([P(n,{tone:`good`}),...t?[]:[{type:`set`,id:`best`,patch:{text:`best ${S}`},pop:!0}]]),I(400))}else c.length&&(h.phase(`살피기`,`한 글자만 다른 단어를 words 순서로 봅니다. ${V(c,e=>({mid:`${e}은 아직 안 썼으니 들어가고`,end:`${e}은 아직 안 썼으니 들어갑니다`}))}`,o.look),z(h,n,c))}else{let t=n.at(-1),r=n.map(e=>e.node);n.forEach(e=>{b.pop(),v.delete(e.node)}),h.step({title:`${r.join(`, `)} 끝, ${t.parent}으로 돌아가기`,codeHighlights:t.looks.length?o.look:o.back,...w()});let i=n[0].node!==s;h.phase(`돌아가기`,`${r.join(`, `)}에서 ${i?`갈 곳이 없어`:`목표 처리를 마치고`} ${t.parent}으로 돌아가며 방문 표시를 되돌립니다.`,o.back);for(let t of n)g.pop(D(t.node)),h.do(...e([P(t.node,{tone:`plain`}),F(t.node,t.parent,`trail`),P(t.parent,{tone:`current`}),{type:`remove`,id:k(t.node)}],!0));h.do(I(150)),t.looks.length&&(h.phase(`살피기`,`${t.parent}이 이어서 한 글자만 다른 단어를 봅니다. ${V(t.looks,e=>({mid:`${e}은 아직 안 썼으니 들어가고`,end:`${e}은 아직 안 썼으니 들어갑니다`}))}`,o.look),z(h,t.parent,t.looks))}});let L=()=>h.do(...e(g.ids.map(e=>({type:`remove`,id:e,into:D(e.slice(6))})))),B=[`hit`,`hot`,`dot`,`dog`,`cog`],H=(e,t)=>B.some((n,r)=>r&&(B[r-1]===e&&n===t||B[r-1]===t&&n===e)),W=t=>e([...l.filter(e=>h.get(D(e)).tone!==`plain`||B.includes(e)).map(e=>P(e,{tone:B.includes(e)?`path`:t})),...f.map(([e,t])=>F(e,t,H(e,t)?`path`:`trail`))]);if(t){let e=b.slice();return b.length=0,h.step({title:`내 답 ${C}, 정답은 4`,codeHighlights:o.done,...w(),answer:C,isKeyframe:!0}),h.phase(`돌아가기`,`목표에서 받은 ${r(C,`을`,`를`)} 모든 호출이 그대로 위로 돌려주며 dfs가 끝납니다.`,o.done),L(),h.phase(`오답 확인`,`처음 닿은 길은 ${e.join(` → `)}(${C}번)입니다. 그런데 dog에서 cog으로 바로 가면 4번이라, 길이를 비교하지 않은 이 답은 틀렸습니다.`),h.do(...W(`bad`)),h.do({type:`add`,item:{id:`mine`,kind:`token`,rect:{x:0,y:A,w:100,h:30},tone:`bad`,text:`내 답 ${C}`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:110,y:A,w:100,h:30},tone:`good`,text:`정답 4`},together:!0}),a(h.finish())}let G=d-x;return x=d,b.length=0,v.clear(),S=m,h.step({title:`나머지 길 확인 — 최소 ${S}번`,codeHighlights:o.done,...w(),answer:S,isKeyframe:!0}),h.phase(`빨리 감기`,`나머지 길도 모두 확인하려고 dfs를 ${G}번 더 부릅니다. 더 짧은 길은 없어 best는 ${S}번 그대로입니다.`,o.look),L(),h.phase(`결과 확인`,`dfs는 모두 ${d}번 불렸고(BFS는 7번), best = ${r(S,`을`,`를`)} 돌려줍니다.`,o.done),h.do(...W(`plain`)),a(h.finish())}var G={id:`word-conversion`,title:`단어 변환`,level:3,category:`dfs-bfs`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/43163`,description:{summary:`시작 단어 begin을 목표 단어 target으로 바꾸려 합니다. 한 번에 알파벳 한 글자만 바꿀 수 있고, 바꾼 단어는 반드시 words 안에 있어야 합니다. 가장 적게 바꾸는 횟수를 구하고, 바꿀 수 없으면 0을 돌려줍니다.`,rules:[`모든 단어는 알파벳 소문자이고 길이가 3 이상 10 이하로 같음`,`words는 3개 이상 50개 이하이고 같은 단어가 없음`,`begin과 target은 서로 다름`,`변환할 수 없으면 0 반환`],examples:[{input:`begin = "hit", target = "cog", words = ["hot", "dot", "dog", "lot", "log", "cog"]`,output:`4`},{input:`begin = "hit", target = "cog", words = ["hot", "dot", "dog", "lot", "log"]`,output:`0`}]},keyIntuitions:[`단어를 점, 한 글자만 다른 단어끼리를 선으로 보면 "최소 횟수"는 가중치 없는 그래프의 최단 거리이고, 이는 BFS가 가장 잘 푸는 문제입니다.`,`BFS는 가까운 단어부터 거리 1, 2, 3 순서로 퍼지므로 목표 단어를 처음 꺼낸 순간의 거리가 곧 최소 횟수입니다.`,`DFS는 한 길을 끝까지 파고들어서 먼저 닿은 길이 가장 짧다는 보장이 없습니다. 모든 길을 다 보고 최솟값을 고르거나, 처음 길에서 멈추면 오답이 됩니다.`],demo:{input:[o,s,c],label:`begin = "hit", target = "cog", words = 예제 1`},workUnit:`단어를 방문한 횟수`,approaches:[{id:`word-bfs`,name:`너비 우선 탐색 (BFS)`,rank:`BEST`,timeComplexity:`O(N² × L)`,spaceComplexity:`O(N)`,verdict:`가까운 단어부터 한 겹씩 퍼져 나가 목표를 처음 꺼내는 순간이 최소 횟수인 정석 풀이입니다.`,pros:[`거리 1, 2, 3 순서로 퍼지므로 목표 단어를 처음 꺼낸 순간의 횟수가 곧 최소입니다.`,`단어마다 한 번만 큐에 넣어 모든 길을 다시 보지 않습니다.`,`목표를 꺼내는 즉시 끝내서 멀리 있는 단어는 확인하지 않습니다.`],cons:[`큐와 방문 집합이 필요하고, 단어 쌍마다 한 글자 차이를 비교하므로 단어가 많아지면 비교 횟수가 늘어납니다.`],whyThisRank:`가중치 없는 그래프의 최단 거리는 BFS가 가장 단순하고 확실합니다. N ≤ 50, 길이 ≤ 10이라 비교가 몇만 번에 그쳐 충분히 빠릅니다.`,code:m,visualize:H},{id:`word-dfs-all`,name:`DFS로 모든 길 확인 (백트래킹)`,rank:`ALTERNATIVE`,timeComplexity:`최악 지수 시간`,spaceComplexity:`O(N) 재귀 깊이`,verdict:`정답은 나오지만 닿은 뒤에도 모든 길을 끝까지 확인해야 해서 BFS보다 훨씬 많이 돕니다.`,pros:[`재귀와 되돌리기만으로 짧게 쓸 수 있습니다.`,`길을 모두 보고 최솟값을 고르므로 정답이 보장됩니다.`],cons:[`목표에 닿아도 더 짧은 길이 있을 수 있어 멈추지 못하고, 방문 표시를 되돌려 가며 가능한 길을 모두 봅니다. 예제 1만 해도 dfs를 24번 부르는데 BFS는 7번이면 끝납니다.`,`단어가 많아지면 길의 수가 폭발적으로 늘어나 시간 초과가 날 수 있습니다.`],whyThisRank:`맞게는 풀지만 BFS가 한 번씩만 보는 단어를 여러 번 다시 봅니다. 최단 거리는 "처음 닿는 순간"을 쓰는 BFS로 푸는 것이 정석입니다.`,code:g,visualize:()=>W(!1)},{id:`word-dfs-first`,name:`DFS로 처음 찾은 길 반환`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N × L)`,spaceComplexity:`O(N) 재귀 깊이`,verdict:`빨리 끝나서 그럴듯하지만 처음 닿은 길이 가장 짧다는 보장이 없어 오답이 나옵니다.`,pros:[`목표를 만나는 즉시 끝내서 호출 수가 적습니다.`],cons:[`DFS는 깊이 먼저 들어가서 처음 닿은 길이 돌아가는 길일 수 있습니다. 예제 1에서는 dog에서 cog으로 바로 가지 않고 log을 먼저 골라 5를 돌려줍니다(정답은 4).`,`단어 순서에 따라 답이 달라져서 우연히 맞는 입력이 있으면 실수를 알아채기 어렵습니다.`],whyThisRank:`최소 횟수를 구하려면 가까운 단어부터 보는 BFS이거나, 모든 길을 다 보고 비교해야 합니다. 처음 찾은 길에서 멈추는 DFS는 어느 쪽도 아닙니다.`,code:v,visualize:()=>W(!0)}],checks:{cases:[{args:[`hit`,`cog`,[`hot`,`dot`,`dog`,`lot`,`log`,`cog`]],expected:4},{args:[`hit`,`cog`,[`hot`,`dot`,`dog`,`lot`,`log`]],expected:0},{args:[`aaa`,`aab`,[`aab`,`abb`,`bbb`]],expected:1},{args:[`abc`,`xyz`,[`xyz`,`xya`,`xaa`]],expected:0},{args:[`aaa`,`ccc`,[`aab`,`abb`,`bbb`,`bbc`,`bcc`,`ccc`]],expected:6},{args:[o,s,c],expected:4}],random:e=>{let t=Array.from({length:27},(e,t)=>[Math.floor(t/9),Math.floor(t/3)%3,t%3].map(e=>`abc`[e]).join(``)),n=()=>t.splice(Math.floor(e()*t.length),1)[0],r=n(),i=Array.from({length:3+Math.floor(e()*5)},n);return[r,e()<.85?i[Math.floor(e()*i.length)]:t[Math.floor(e()*t.length)],i]}}};export{G as default};