import{a as e,c as t,i as n,l as r,r as i}from"./shared-CL29HWIp.js";import{t as a}from"./lane-BzDhdR3X.js";var o=6,s=[[1,1,0,0,0,0],[1,1,1,1,0,0],[0,1,1,0,0,0],[0,1,0,1,0,0],[0,0,0,0,1,1],[0,0,0,0,1,1]],c=s.flatMap((e,t)=>e.flatMap((e,n)=>e===1&&t<n?[[t,n]]:[])),l=e=>s[e].flatMap((t,n)=>t===1&&n!==e?[n]:[]),u=e=>`[${e.map(e=>e?`T`:`F`).join(`, `)}]`,d={python:`def solution(n, computers):
    visited = [False] * n

    def dfs(now):
        visited[now] = True
        for nxt in range(n):
            if computers[now][nxt] == 1 and not visited[nxt]:
                dfs(nxt)  # 이어진 새 컴퓨터로 파고듭니다

    answer = 0
    for i in range(n):
        if not visited[i]:  # 아직 어느 네트워크에도 속하지 않은 컴퓨터
            dfs(i)
            answer += 1
    return answer`,javascript:`function solution(n, computers) {
  const visited = Array(n).fill(false);

  const dfs = (now) => {
    visited[now] = true;
    for (let next = 0; next < n; next++) {
      if (computers[now][next] === 1 && !visited[next]) dfs(next); // 이어진 새 컴퓨터로 파고듭니다
    }
  };

  let answer = 0;
  for (let i = 0; i < n; i++) {
    if (!visited[i]) { // 아직 어느 네트워크에도 속하지 않은 컴퓨터
      dfs(i);
      answer++;
    }
  }
  return answer;
}`},f={start:n(d,[`visited = [False] * n`,`answer = 0`],[`const visited = Array(n)`,`let answer = 0`]),enterRoot:n(d,[`if not visited[i]`,`dfs(i)`,`visited[now] = True`],[`if (!visited[i])`,`dfs(i)`,`visited[now] = true`]),enter:n(d,[`dfs(nxt)`,`visited[now] = True`],[`dfs(next)`,`visited[now] = true`]),look:n(d,[`for nxt in range(n)`,`if computers[now][nxt] == 1 and not visited[nxt]`],[`for (let next = 0; next < n; next++)`,`if (computers[now][next] === 1 && !visited[next]) dfs(next)`]),back:n(d,[`for nxt in range(n)`],[`for (let next = 0; next < n; next++)`]),count:n(d,[`dfs(i)`,`answer += 1`],[`dfs(i)`,`answer++`]),done:n(d,[`for i in range(n)`,`return answer`],[`for (let i = 0; i < n; i++)`,`return answer`])},p={python:`from collections import deque

def solution(n, computers):
    visited = [False] * n
    answer = 0

    for start in range(n):
        if visited[start]:
            continue
        answer += 1  # 새 네트워크를 찾았습니다
        visited[start] = True
        queue = deque([start])
        while queue:
            now = queue.popleft()
            for nxt in range(n):
                if computers[now][nxt] == 1 and not visited[nxt]:
                    visited[nxt] = True
                    queue.append(nxt)
    return answer`,javascript:`function solution(n, computers) {
  const visited = Array(n).fill(false);
  let answer = 0;

  for (let start = 0; start < n; start++) {
    if (visited[start]) continue;
    answer++; // 새 네트워크를 찾았습니다
    visited[start] = true;
    const queue = [start];
    let head = 0; // shift() 대신 머리 인덱스로 꺼냅니다
    while (head < queue.length) {
      const now = queue[head++];
      for (let next = 0; next < n; next++) {
        if (computers[now][next] === 1 && !visited[next]) {
          visited[next] = true;
          queue.push(next);
        }
      }
    }
  }
  return answer;
}`},m={start:n(p,[`visited = [False] * n`,`answer = 0`],[`const visited = Array(n)`,`let answer = 0`]),found:n(p,[`for start in range(n)`,`if visited[start]`,`answer += 1`,`visited[start] = True`,`queue = deque([start])`],[`for (let start = 0; start < n; start++)`,`if (visited[start]) continue`,`answer++`,`visited[start] = true`,`const queue = [start]`]),pop:n(p,[`while queue:`,`now = queue.popleft()`],[`while (head < queue.length)`,`const now = queue[head++]`]),look:n(p,[`for nxt in range(n)`,`if computers[now][nxt] == 1 and not visited[nxt]`],[`for (let next = 0; next < n; next++)`,`if (computers[now][next] === 1 && !visited[next])`]),mark:n(p,[`if computers[now][nxt] == 1 and not visited[nxt]`,`visited[nxt] = True`],[`if (computers[now][next] === 1 && !visited[next])`,`visited[next] = true`]),push:n(p,[`queue.append(nxt)`],[`queue.push(next)`]),next:n(p,[`while queue:`],[`while (head < queue.length)`]),done:n(p,[`for start in range(n)`,`return answer`],[`for (let start = 0; start < n; start++)`,`return answer`])},h={python:`# 주의: 오답이 나오는 풀이입니다 (직접 연결된 컴퓨터까지만 묶습니다)
def solution(n, computers):
    visited = [False] * n
    answer = 0
    for i in range(n):
        if not visited[i]:
            for j in range(n):
                if computers[i][j] == 1:
                    visited[j] = True  # i와 직접 이어진 컴퓨터만 표시, 그 이웃의 이웃은 놓칩니다
            answer += 1
    return answer`,javascript:`// 주의: 오답이 나오는 풀이입니다 (직접 연결된 컴퓨터까지만 묶습니다)
function solution(n, computers) {
  const visited = Array(n).fill(false);
  let answer = 0;
  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      for (let j = 0; j < n; j++) {
        if (computers[i][j] === 1) visited[j] = true; // i와 직접 이어진 컴퓨터만 표시, 그 이웃의 이웃은 놓칩니다
      }
      answer++;
    }
  }
  return answer;
}`},g={start:n(h,[`visited = [False] * n`,`answer = 0`],[`const visited = Array(n)`,`let answer = 0`]),check:n(h,[`for i in range(n)`,`if not visited[i]`],[`for (let i = 0; i < n; i++)`,`if (!visited[i])`]),mark:n(h,[`for j in range(n)`,`if computers[i][j] == 1`,`visited[j] = True`],[`for (let j = 0; j < n; j++)`,`if (computers[i][j] === 1) visited[j] = true`]),count:n(h,[`answer += 1`],[`answer++`]),done:n(h,[`for i in range(n)`,`return answer`],[`for (let i = 0; i < n; i++)`,`return answer`])},_=54,v=500,y=350,b={x:0,y:0,w:v,h:y},x=[[62,190],[190,190],[320,110],[320,270],[446,130],[446,250]],S={id:`lane`,x:40,y:5,slotW:62,slotH:30,gap:6,max:6},C=e=>({x:x[e][0]-_/2,y:x[e][1]-_/2,w:_,h:_}),w=e=>`pc:${e}`,T=(e,t)=>`edge:${Math.min(e,t)}-${Math.max(e,t)}`,E={x:0,y:312,w:104,h:30},D={seen:`방문함`,new:`새 컴퓨터`};function O(e,t){let[[n,r],[i,a]]=[x[e],x[t]],o=Math.hypot(i-n,a-r),[s,c]=[(i-n)/o,(a-r)/o],l=_/2/Math.max(Math.abs(s),Math.abs(c))+3;return[[n+s*l,r+c*l],[i-s*l,a-c*l]]}function k(e){let t=[];e&&t.push({id:`lane:label`,kind:`text`,rect:{x:0,y:0,w:34,h:40},text:e},{id:`lane:bg`,kind:`zone`,rect:{x:34,y:0,w:466,h:40}});for(let[e,n]of c)t.push({id:T(e,n),kind:`line`,rect:b,tone:`trail`,points:O(e,n)});for(let e=0;e<o;e++)t.push({id:w(e),kind:`cell`,rect:C(e),tone:`plain`,text:String(e)});return t.push({id:`count`,kind:`token`,rect:E,tone:`plain`,text:`네트워크 0개`}),{width:v,height:y,items:t}}var A=(e,t,n=!1)=>({type:`set`,id:w(e),patch:t,...n?{pop:n}:{}}),j=(e,t,n)=>({type:`set`,id:T(e,t),patch:{tone:n}}),M=e=>({type:`wait`,ms:e}),N=()=>[{type:`unfocus`},{type:`clearMarks`}],P=e=>({type:`set`,id:`count`,patch:{text:`네트워크 ${e}개`},pop:!0}),F=e=>`dfs(${e})`;function I(e,n,r,i=()=>[]){e.do({type:`focus`,ids:[w(n),...r.map(e=>w(e.j))]});for(let t of r){e.do({type:`arrow`,from:w(n),to:w(t.j),verdict:t.verdict,label:D[t.verdict]});for(let n of i(t))e.do({...n,together:!0})}e.do(M(120),...t(N()))}var L=e=>`${e.map((t,n)=>n===e.length-1?t.end:t.mid).join(`, `)}.`,R=(e,t)=>L(e.map(e=>e.verdict===`seen`?{mid:`${e.j}번은 이미 방문했고`,end:`${e.j}번은 이미 방문했습니다`}:t(e.j))),z=t=>({mid:`${t}번은 처음이라 ${e(F(t))} 들어가고`,end:`${t}번은 처음이라 ${e(F(t))} 들어갑니다`}),B=e=>({mid:`${e}번은 처음이라 표시하고`,end:`${e}번은 처음이라 표시합니다`});function V(){let e=Array(o).fill(!1),t=[],n,r=(i,a)=>{e[i]=!0,n={kind:`enter`,node:i,parent:a,looks:[]},t.push(n);for(let a of l(i))e[a]?n.looks.push({j:a,verdict:`seen`}):(n.looks.push({j:a,verdict:`new`}),r(a,i),n={kind:`return`,node:a,parent:i,looks:[]},t.push(n))};for(let n=0;n<o;n++)e[n]||(r(n),t.push({kind:`return`,node:n,looks:[]}));return t}function H(){let n=new r(k(`스택`)),s=new a(n,S),c=Array(o).fill(!1),l=[],d=0,p=0,m=`-`,h=()=>({work:p,variables:{i:m,now:l.at(-1)??`-`,answer:d,visited:u(c)}}),g=e=>({id:`frame:${e}`,text:F(e)});n.step({title:`아직 방문한 컴퓨터가 없음`,codeHighlights:f.start,...h()}),n.phase(`시작`,`visited를 모두 False로, answer를 0으로 두고 0번 컴퓨터부터 차례로 살핍니다.`),n.do(M(1e3));let _=[];for(let e of V()){let t=_.at(-1)?.at(-1);e.kind===`return`&&t?.kind===`return`&&!t.looks.length&&t.parent!==void 0?_.at(-1).push(e):_.push([e])}for(let r of _){let[a]=r;if(a.kind===`enter`){let{node:r,parent:i,looks:o}=a,u=i===void 0;c[r]=!0,p++,l.push(r),u&&(m=r),n.step({title:u?`${r}번에서 새 네트워크 시작`:`${r}번 들어가기`,codeHighlights:o.length?f.look:u?f.enterRoot:f.enter,...h()}),n.phase(`들어가기`,u?`${r}번은 아직 방문 전이라 새 네트워크입니다. ${e(F(r))} 들어갑니다.`:`${e(F(r))} 들어가 ${r}번에 방문 표시를 합니다.`,u?f.enterRoot:f.enter),n.do(...t([A(r,{tone:`current`},!0),...i===void 0?[]:[A(i,{tone:`trail`}),j(i,r,`path`)]])),s.push(g(r),w(r)),o.length&&(n.phase(`이웃 찾기`,R(o,z),f.look),I(n,r,o))}else{let e=r.at(-1),a=e.parent===void 0,o=r.map(e=>e.node);r.forEach(()=>l.pop()),a&&d++;let u=c.indexOf(!1);n.step({title:`${o.map(e=>`${e}번`).join(`, `)} 끝${a?` — 네트워크 ${d}개째 완성`:`, ${e.parent}번으로 돌아가기`}`,codeHighlights:a?f.count:e.looks.length?f.look:f.back,...h()});let p=o.map(F),m=`${[...p.slice(0,-1),i(p.at(-1),`이`,`가`)].join(`, `)}${p.length>1?` 차례로`:``}`;n.phase(`돌아가기`,`더 갈 곳이 없어 ${m} 끝납니다. ${a?`이어진 컴퓨터를 모두 찾았습니다.`:`${e.parent}번으로 돌아갑니다.`}`,f.back);for(let e of r)s.pop(w(e.node)),n.do(...t([A(e.node,{tone:`visited`}),...e.parent===void 0?[]:[A(e.parent,{tone:`current`})]],!0));n.do(M(150)),e.looks.length&&(n.phase(`이웃 찾기`,`${e.parent}번이 이어서 살핍니다. ${R(e.looks,z)}`,f.look),I(n,e.parent,e.looks)),a&&(n.phase(`네트워크 세기`,`answer += 1로 네트워크는 ${d}개입니다. ${u>=0?`이어서 i를 올리며 아직 방문 전인 ${u}번을 찾습니다.`:`이제 모든 컴퓨터를 방문했습니다.`}`,f.count),n.do(P(d),M(600)))}}return m=`-`,n.step({title:`모든 컴퓨터 확인 — 네트워크 ${d}개`,codeHighlights:f.done,...h(),answer:d,isKeyframe:!0}),n.phase(`결과 확인`,`방문 전인 컴퓨터가 더 없습니다. 네트워크는 ${d}개이고, answer = ${i(d,`을`,`를`)} 돌려줍니다.`),n.do(...t([...Array.from({length:o},(e,t)=>A(t,{tone:`path`})),{type:`set`,id:`count`,patch:{tone:`good`}}])),n.finish()}function U(){let e=new r(k(`큐`)),n=new a(e,S),s=Array(o).fill(!1),c=[],d=0,f=0,p=`-`,h=`-`,g,_=()=>({work:f,variables:{start:p,now:h,answer:d,visited:u(s),queue:`[${c.join(`, `)}]`}}),v=e=>({id:`tok:${e}`,text:`${e}번`});e.step({title:`아직 방문한 컴퓨터가 없음`,codeHighlights:m.start,..._()}),e.phase(`시작`,`visited를 모두 False로, answer를 0으로 두고 0번 컴퓨터부터 차례로 살핍니다.`),e.do(M(1e3));let y=r=>{s[r]=!0,f++,d++,p=r,h=`-`,c.push(r);let a=g;for(g=void 0,e.step({title:`${r}번에서 새 네트워크 시작`,codeHighlights:m.found,..._()}),e.phase(`새 네트워크`,`${r}번은 아직 방문 전이라 새 네트워크입니다. answer가 ${i(d,`이`,`가`)} 되고 ${r}번을 큐에 넣습니다.`,m.found),e.do(...t([A(r,{tone:`queued`},!0),P(d),...a===void 0?[]:[A(a,{tone:`visited`})]])),n.push(v(r),w(r));c.length;){let r=c.shift(),i=l(r).map(e=>({j:e,verdict:s[e]?`seen`:`new`})),a=i.filter(e=>e.verdict===`new`).map(e=>e.j);for(let e of a)s[e]=!0,f++,c.push(e);h=r,e.step({title:a.length?`${r}번 꺼내고 ${a.map(e=>`${e}번`).join(`, `)} 넣기`:`${r}번 꺼내기 — 넣을 컴퓨터 없음`,codeHighlights:a.length?m.push:m.next,..._()}),e.phase(`꺼내기`,`큐 맨 앞에서 ${r}번을 꺼냅니다.`,m.pop),n.shift(w(r)),e.do(...t([A(r,{tone:`current`}),...g===void 0?[]:[A(g,{tone:`visited`})]],!0)),g=r,e.phase(`이웃 찾기`,i.length?`${r}번과 이어진 컴퓨터를 살핍니다. ${R(i,B)}`:`${r}번과 이어진 다른 컴퓨터가 없습니다.`,a.length?m.mark:m.look),i.length?I(e,r,i,e=>e.verdict===`new`?[A(e.j,{tone:`queued`},!0),j(r,e.j,`path`)]:[]):e.do(M(300)),e.phase(`넣기`,a.length?`새로 표시한 ${a.map(e=>`${e}번`).join(`, `)}을 큐 뒤에 넣습니다.`:`새로 넣을 컴퓨터가 없어 그대로 넘어갑니다.`,a.length?m.push:m.next);for(let e of a)n.push(v(e),w(e))}};for(let e=0;e<o;e++)s[e]||y(e);return p=`-`,h=`-`,e.step({title:`모든 컴퓨터 확인 — 네트워크 ${d}개`,codeHighlights:m.done,..._(),answer:d,isKeyframe:!0}),e.phase(`결과 확인`,`방문 전인 컴퓨터가 더 없습니다. 네트워크는 ${d}개이고, answer = ${i(d,`을`,`를`)} 돌려줍니다.`),e.do(...t([...Array.from({length:o},(e,t)=>A(t,{tone:`path`})),{type:`set`,id:`count`,patch:{tone:`good`}}])),e.finish()}function W(){let e=new r(k()),n=Array(o).fill(!1),a=0,s=0,c=`-`,d=()=>({work:s,variables:{i:c,answer:a,visited:u(n)}}),f=[];e.step({title:`아직 방문한 컴퓨터가 없음`,codeHighlights:g.start,...d()}),e.phase(`시작`,`visited를 모두 False로, answer를 0으로 둡니다. 방문 전인 컴퓨터마다 직접 이어진 것만 표시하며 네트워크를 셉니다.`),e.do(M(1200));for(let r=0;r<o;r++){if(c=r,n[r]){e.step({title:`${r}번: 이미 방문함 → 건너뜀`,codeHighlights:g.check,...d()}),e.phase(`확인하기`,`${r}번은 앞에서 이미 표시되어 있어 건너뜁니다.`,g.check),e.do({type:`focus`,ids:[w(r)]},M(500),{type:`unfocus`});continue}let i=l(r),o=[r,...i],u=i.filter(e=>!n[e]);o.forEach(e=>n[e]=!0),s+=o.length,a++,f.push(r),e.step({title:`${r}번: 새 네트워크로 셈 (answer ${a})`,codeHighlights:g.count,...d()}),e.phase(`확인하기`,`${r}번은 아직 방문 전이라 새 네트워크로 셉니다.`,g.check),e.do(...t([A(r,{tone:`current`},!0),{type:`focus`,ids:[w(r)]}]),M(200),{type:`unfocus`}),i.length?(e.phase(`이웃 표시`,`${r}번과 직접 이어진 ${i.map(e=>`${e}번`).join(`, `)}만 표시합니다. 그 이웃의 이웃은 보지 않습니다.`,g.mark),I(e,r,i.map(e=>({j:e,verdict:u.includes(e)?`new`:`seen`})),e=>e.verdict===`new`?[A(e.j,{tone:`visited`},!0),j(r,e.j,`path`)]:[j(r,e.j,`path`)])):(e.phase(`이웃 표시`,`${r}번과 이어진 다른 컴퓨터가 없습니다.`,g.mark),e.do(M(300))),e.phase(`네트워크 세기`,`answer += 1로 네트워크는 ${a}개입니다.`,g.count),e.do(...t([A(r,{tone:`visited`}),P(a)]),M(400))}return c=`-`,e.step({title:`내 답 ${a}, 정답은 2`,codeHighlights:g.done,...d(),answer:a,isKeyframe:!0}),e.phase(`오답 확인`,`0, 1, 2, 3번은 서로 이어진 네트워크 하나인데 ${f.filter(e=>e<4).length}번이나 세어서 답이 ${i(a,`이`,`가`)} 되었습니다. 정답은 2입니다.`),e.do(...t([0,1,2,3].map(e=>A(e,{tone:`bad`})))),e.do({type:`add`,item:{id:`mine`,kind:`token`,rect:{x:210,y:312,w:90,h:30},tone:`bad`,text:`내 답 ${a}`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:310,y:312,w:90,h:30},tone:`good`,text:`정답 2`},together:!0}),e.finish()}var G={id:`network`,title:`네트워크`,level:3,category:`dfs-bfs`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/43162`,description:{summary:`컴퓨터 n대 중 일부가 직접 연결되어 있습니다. 다른 컴퓨터를 거쳐 간접적으로라도 이어진 컴퓨터는 같은 네트워크입니다. 연결 정보가 담긴 n × n 표가 주어질 때, 네트워크가 모두 몇 개인지 구합니다.`,rules:[`컴퓨터는 1대 이상 200대 이하이고, 번호는 0부터 n − 1까지`,`i번과 j번이 직접 연결되어 있으면 computers[i][j]가 1`,`computers[i][i]는 항상 1`],examples:[{input:`n = 3, computers = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]`,output:`2`},{input:`n = 3, computers = [[1, 1, 0], [1, 1, 1], [0, 1, 1]]`,output:`1`}]},keyIntuitions:[`"이어진 묶음의 개수"는 DFS나 BFS로 한 컴퓨터에서 갈 수 있는 곳을 모두 방문 표시한 횟수와 같습니다. 새로 시작할 때마다 네트워크가 하나 늘어납니다.`,`직접 연결된 컴퓨터만 보면 안 됩니다. 0-1-2처럼 한 다리 건너 이어진 컴퓨터도 같은 네트워크라, 이웃의 이웃까지 끝까지 따라가야 합니다.`,`방문 표시가 없는 컴퓨터를 만날 때만 새 탐색을 시작하므로, 한 컴퓨터는 딱 한 번만 방문합니다.`],demo:{input:[o,s],label:`n = 6, 연결: 0-1, 1-2, 1-3, 4-5`},workUnit:`방문 표시를 한 횟수`,approaches:[{id:`network-dfs`,name:`깊이 우선 탐색 (DFS 연결 요소)`,rank:`BEST`,timeComplexity:`O(n²)`,spaceComplexity:`O(n) 재귀 깊이`,verdict:`방문 전 컴퓨터에서 이어진 곳을 끝까지 파고들며 시작 횟수를 세는 정석 풀이입니다.`,pros:[`재귀 함수 몇 줄로 "이어진 곳을 모두 방문 표시"를 끝냅니다.`,`컴퓨터마다 한 번만 방문하고 표를 한 줄씩 읽어 O(n²)로 끝납니다.`,`탐색을 새로 시작한 횟수가 곧 정답이라 따로 묶음을 관리할 필요가 없습니다.`],cons:[`컴퓨터가 많아 한 줄로 길게 이어지면 재귀가 깊어집니다(이 문제는 n ≤ 200이라 괜찮습니다).`],whyThisRank:`연결 요소의 개수를 세는 가장 짧고 대표적인 풀이입니다. n이 작아 재귀 깊이 걱정이 없고, BFS와 시간 복잡도도 같습니다.`,code:d,visualize:H},{id:`network-bfs`,name:`너비 우선 탐색 (BFS)`,rank:`ALTERNATIVE`,timeComplexity:`O(n²)`,spaceComplexity:`O(n) 큐`,verdict:`답과 복잡도는 같지만 큐 코드가 조금 더 길어지는 풀이입니다.`,pros:[`재귀를 쓰지 않아 재귀 한도를 걱정하지 않아도 됩니다.`,`가까운 컴퓨터부터 한 겹씩 넓혀 가는 모습이 눈에 잘 들어옵니다.`],cons:[`큐를 만들고 꺼내고 넣는 코드가 DFS 재귀보다 깁니다. JavaScript에는 덱이 없어 머리 인덱스도 따로 관리해야 합니다.`,`이 문제는 거리를 묻지 않아 BFS의 장점(최단 거리)을 쓸 일이 없습니다.`],whyThisRank:`묶음의 개수만 세는 문제라 DFS와 BFS는 결과가 같습니다. 코드가 더 짧은 DFS가 시험에서 더 쓰기 좋아 대안으로 둡니다.`,code:p,visualize:U},{id:`network-direct`,name:`직접 연결된 컴퓨터만 묶기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(n²)`,spaceComplexity:`O(n)`,verdict:`빠르고 간단해 보이지만 한 다리 건너 이어진 컴퓨터를 놓쳐 오답이 나옵니다.`,pros:[`반복문 두 겹이면 끝나는 가장 짧은 코드입니다.`],cons:[`시작한 컴퓨터와 직접 이어진 컴퓨터까지만 방문 표시를 해서, 그 이웃의 이웃은 방문 전으로 남습니다.`,`0-1, 1-2, 1-3으로 이어진 네트워크 하나를 0번, 2번, 3번에서 세 번 세어 오답이 됩니다. 연결이 한 겹뿐인 예제는 우연히 맞아 실수를 알아채기 어렵습니다.`],whyThisRank:`문제는 간접적으로 이어진 컴퓨터도 같은 네트워크로 본다고 합니다. 이웃의 이웃까지 끝까지 따라가려면 DFS나 BFS로 방문을 이어 가야 합니다.`,code:h,visualize:W}],checks:{cases:[{args:[3,[[1,1,0],[1,1,0],[0,0,1]]],expected:2},{args:[3,[[1,1,0],[1,1,1],[0,1,1]]],expected:1},{args:[1,[[1]]],expected:1},{args:[3,[[1,0,0],[0,1,0],[0,0,1]]],expected:3},{args:[4,[[1,1,0,0],[1,1,1,0],[0,1,1,1],[0,0,1,1]]],expected:1},{args:[o,s],expected:2}],random:e=>{let t=1+Math.floor(e()*7),n=Array.from({length:t},(e,n)=>Array.from({length:t},(e,t)=>+(n===t)));for(let r=0;r<t;r++)for(let i=r+1;i<t;i++)e()<.25&&(n[r][i]=n[i][r]=1);return[t,n]}}};export{G as default};