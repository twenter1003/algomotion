import{c as e,i as t,s as n}from"./shared-e6uNbDLo.js";import{t as r}from"./lane-BzDhdR3X.js";import{t as i}from"./pacing-cs_sia8j.js";var a=`ICN`,o=[[`ICN`,`HND`],[`ICN`,`SFO`],[`SFO`,`ICN`],[`ICN`,`JFK`],[`JFK`,`ATL`],[`ATL`,`ICN`]],s=[`ICN`,`HND`,`SFO`,`JFK`,`ATL`],c=(e,t)=>e.join()<t.join()?-1:+(e.join()>t.join()),l=[...o].sort(c),u=o.length+1,d=([e,t])=>`ticket:${e}-${t}`,f=([e,t])=>`${e}→${t}`,p=e=>`[${e.join(`, `)}]`,m=(e,t=`→`)=>e.join(t),h={python:`def solution(tickets):
    tickets = sorted(tickets)  # 같은 곳에서 떠나면 도착 공항이 사전순으로 앞서는 항공권부터 써 봅니다
    used = [False] * len(tickets)
    route = ["ICN"]

    def dfs(now):
        if len(route) == len(tickets) + 1:  # 항공권을 모두 썼으면 완성
            return True
        for i, (start, end) in enumerate(tickets):
            if not used[i] and start == now:
                used[i] = True
                route.append(end)
                if dfs(end):
                    return True  # 가장 먼저 완성한 경로가 사전순으로 가장 앞섭니다
                route.pop()  # 막다른 길이면 항공권을 되돌려 놓고 다음 항공권을 써 봅니다
                used[i] = False
        return False

    dfs("ICN")
    return route`,javascript:`function solution(tickets) {
  const sorted = [...tickets].sort(); // 같은 곳에서 떠나면 도착 공항이 사전순으로 앞서는 항공권부터 써 봅니다
  const used = Array(sorted.length).fill(false);
  const route = ['ICN'];

  const dfs = (now) => {
    if (route.length === sorted.length + 1) return true; // 항공권을 모두 썼으면 완성
    for (let i = 0; i < sorted.length; i++) {
      const [start, end] = sorted[i];
      if (!used[i] && start === now) {
        used[i] = true;
        route.push(end);
        if (dfs(end)) return true; // 가장 먼저 완성한 경로가 사전순으로 가장 앞섭니다
        route.pop(); // 막다른 길이면 항공권을 되돌려 놓고 다음 항공권을 써 봅니다
        used[i] = false;
      }
    }
    return false;
  };

  dfs('ICN');
  return route;
}`},g={start:t(h,[`tickets = sorted(tickets)`,`used = [False] * len(tickets)`,`route = ["ICN"]`,`dfs("ICN")`],[`const sorted = [...tickets].sort()`,`const used = Array(sorted.length)`,`const route = ['ICN']`,`dfs('ICN')`]),enter:t(h,[`used[i] = True`,`route.append(end)`,`if dfs(end):`],[`used[i] = true`,`route.push(end)`,`if (dfs(end)) return true`]),look:t(h,[`for i, (start, end) in enumerate(tickets)`,`if not used[i] and start == now`],[`for (let i = 0; i < sorted.length; i++)`,`if (!used[i] && start === now)`]),stuck:t(h,[`for i, (start, end) in enumerate(tickets)`,`return False`],[`for (let i = 0; i < sorted.length; i++)`,`return false;`]),back:t(h,[`route.pop()`,`used[i] = False`],[`route.pop()`,`used[i] = false`]),done:t(h,[`if len(route) == len(tickets) + 1`,`return True`],[`if (route.length === sorted.length + 1) return true`])},_={python:`def solution(tickets):
    used = [False] * len(tickets)
    routes = []  # 완성된 경로를 모두 모읍니다

    def dfs(now, route):
        if len(route) == len(tickets) + 1:
            routes.append(route[:])  # 완성해도 멈추지 않고 다른 경로도 찾습니다
            return
        for i, (start, end) in enumerate(tickets):
            if not used[i] and start == now:
                used[i] = True
                route.append(end)
                dfs(end, route)
                route.pop()
                used[i] = False

    dfs("ICN", ["ICN"])
    return min(routes)  # 리스트는 앞에서부터 비교하므로 사전순으로 가장 앞선 경로`,javascript:`function solution(tickets) {
  const used = Array(tickets.length).fill(false);
  const routes = []; // 완성된 경로를 모두 모읍니다

  const dfs = (now, route) => {
    if (route.length === tickets.length + 1) {
      routes.push([...route]); // 완성해도 멈추지 않고 다른 경로도 찾습니다
      return;
    }
    for (let i = 0; i < tickets.length; i++) {
      const [start, end] = tickets[i];
      if (!used[i] && start === now) {
        used[i] = true;
        route.push(end);
        dfs(end, route);
        route.pop();
        used[i] = false;
      }
    }
  };

  dfs('ICN', ['ICN']);
  // 앞에서부터 비교해 사전순으로 가장 앞선 경로
  return routes.sort((p, q) => (p.join() < q.join() ? -1 : 1))[0];
}`},v={start:t(_,[`used = [False] * len(tickets)`,`routes = []`,`dfs("ICN", ["ICN"])`],[`const used = Array(tickets.length)`,`const routes = []`,`dfs('ICN', ['ICN'])`]),enter:t(_,[`used[i] = True`,`route.append(end)`,`dfs(end, route)`],[`used[i] = true`,`route.push(end)`,`dfs(end, route)`]),look:t(_,[`for i, (start, end) in enumerate(tickets)`,`if not used[i] and start == now`],[`for (let i = 0; i < tickets.length; i++)`,`if (!used[i] && start === now)`]),stuck:t(_,[`if len(route) == len(tickets) + 1`,`for i, (start, end) in enumerate(tickets)`],[`if (route.length === tickets.length + 1)`,`for (let i = 0; i < tickets.length; i++)`]),back:t(_,[`route.pop()`,`used[i] = False`],[`route.pop()`,`used[i] = false`]),done:t(_,[`if len(route) == len(tickets) + 1`,`routes.append(route[:])`],[`if (route.length === tickets.length + 1)`,`routes.push([...route])`]),fast:t(_,[`for i, (start, end) in enumerate(tickets)`,`dfs(end, route)`],[`for (let i = 0; i < tickets.length; i++)`,`dfs(end, route)`]),min:t(_,[`return min(routes)`],[`return routes.sort`])},y={python:`# 주의: 오답이 나오는 풀이입니다 (막다른 길에서 되돌아오지 않습니다)
def solution(tickets):
    left = sorted(tickets)
    route = ["ICN"]
    while True:
        # 지금 공항에서 떠나는 항공권 중 도착 공항이 사전순으로 가장 앞선 것을 씁니다
        options = [t for t in left if t[0] == route[-1]]
        if not options:
            return route  # 쓸 항공권이 없으면 남은 항공권이 있어도 거기서 끝냅니다
        left.remove(options[0])
        route.append(options[0][1])`,javascript:`// 주의: 오답이 나오는 풀이입니다 (막다른 길에서 되돌아오지 않습니다)
function solution(tickets) {
  const left = [...tickets].sort();
  const route = ['ICN'];
  while (true) {
    // 지금 공항에서 떠나는 항공권 중 도착 공항이 사전순으로 가장 앞선 것을 씁니다
    const i = left.findIndex(([start]) => start === route.at(-1));
    if (i === -1) return route; // 쓸 항공권이 없으면 남은 항공권이 있어도 거기서 끝냅니다
    route.push(left.splice(i, 1)[0][1]);
  }
}`},b={start:t(y,[`left = sorted(tickets)`,`route = ["ICN"]`],[`const left = [...tickets].sort()`,`const route = ['ICN']`]),look:t(y,[`while True`,`options = [t for t in left`,`if not options`],[`while (true)`,`const i = left.findIndex`,`if (i === -1) return route`]),move:t(y,[`left.remove(options[0])`,`route.append(options[0][1])`],[`route.push(left.splice(i, 1)[0][1])`]),stuck:t(y,[`options = [t for t in left`,`if not options`,`return route`],[`const i = left.findIndex`,`if (i === -1) return route`]),done:t(y,[`return route`],[`if (i === -1) return route`])},x=54,S=520,C={ICN:[250,190],HND:[70,105],SFO:[70,275],JFK:[440,105],ATL:[440,275]},w={id:`lane`,x:40,y:5,slotW:56,slotH:30,gap:6,max:u},T=326,E=36,D=e=>e?T+e*E-6:318,O=e=>({x:C[e][0]-x/2,y:C[e][1]-x/2,w:x,h:x}),k=e=>`ap:${e}`,A={new:`쓸 수 있음`,seen:`이미 씀`};function j([e,t]){let[[n,r],[i,a]]=[C[e],C[t]],s=Math.hypot(i-n,a-r),[c,l]=[(i-n)/s,(a-r)/s],u=o.some(([n,r])=>n===t&&r===e)?7:0,[d,f]=[-l*u,c*u],p=(e,t)=>Math.min(...[[e,d],[t,f]].filter(([e])=>e!==0).map(([e,t])=>(x/2*Math.sign(e)-t)/e)),m=[n+d+c*(p(c,l)+3),r+f+l*(p(c,l)+3)],h=[i+d-c*(p(-c,-l)+4),a+f-l*(p(-c,-l)+4)],g=e=>[h[0]-c*11+-l*6*e,h[1]-l*11+c*6*e];return[m,h,g(1),h,g(-1)]}function M(e,t){let n=D(e),r={x:0,y:0,w:S,h:n},i=[{id:`lane:label`,kind:`text`,rect:{x:0,y:0,w:34,h:40},text:`경로`},{id:`lane:bg`,kind:`zone`,rect:{x:34,y:0,w:486,h:40}}];for(let e of o)i.push({id:d(e),kind:`line`,rect:r,tone:`trail`,points:j(e)});for(let e of s)i.push({id:k(e),kind:`cell`,rect:O(e),tone:`plain`,text:e,...e===a?{tag:`출발`}:{}});return t&&i.push({id:`rows:heading`,kind:`text`,rect:{x:0,y:T,w:84,h:30},text:t}),{width:S,height:n,items:i}}var N=e=>({type:`wait`,ms:e}),P=()=>[{type:`unfocus`},{type:`clearMarks`}],F=(e,t)=>({x:90,y:T+e*E,w:t,h:30});function I(e,t,n,r={}){let i=[],a=t.at(-1);for(let n of s){let o=t.filter(e=>e===n).length,s=r.all?o?`path`:`plain`:n===a?r.stuck?`bad`:`current`:o?`trail`:`plain`,c=n===a&&r.stuck?`막힘`:o>1?`${o}번`:``,l=e.get(k(n));(l.tone!==s||(l.sub??``)!==c)&&i.push({type:`set`,id:k(n),patch:{tone:s,sub:c},...s===`current`&&l.tone!==`current`?{pop:!0}:{}})}for(let t of o){let r=n.some(e=>d(e)===d(t))?`path`:`trail`;e.get(d(t)).tone!==r&&i.push({type:`set`,id:d(t),patch:{tone:r}})}return i}function L(e,t,r){e.do({type:`focus`,ids:[k(t),...r.map(e=>k(e.to))]});for(let n of r)e.do({type:`arrow`,from:k(t),to:k(n.to),verdict:n.verdict,label:n.label});e.do(N(120),...n(P()))}function R(e){let t=[];for(let n of e)t.at(-1)?.verdict===n.verdict?t.at(-1).to.push(n.to):t.push({verdict:n.verdict,to:[n.to]});let n=({verdict:e,to:t},n)=>{let r=t.map(e=>`${e}행`).join(`, `);return e===`new`?`${r}은 아직 안 썼으니 씁니다`:`${r}은 이미 썼${n?`습니다`:`고`}`};return`${t.map((e,r)=>n(e,r===t.length-1)).join(`, `)}.`}function z(e,t){let n=e.map(()=>!1),r=[a],i=[],o=[],s=0,c=(e,t,i,a)=>({kind:e,to:t,from:i,ticket:a,looks:[],route:[...r],used:n.flatMap((e,t)=>e?[t]:[]),enters:s}),l=c(`enter`,a);o.push(l);let d=a=>{if(r.length===u)return l.done=!0,i.push([...r]),t;for(let i=0;i<e.length;i++){let[u,f]=e[i];if(u===a){if(n[i])l.looks.push({to:f,verdict:`seen`,i});else{if(l.looks.push({to:f,verdict:`new`,i}),n[i]=!0,r.push(f),s++,o.push(l=c(`enter`,f,a,i)),d(f)&&t)return!0;r.pop(),n[i]=!1,o.push(l=c(`back`,a,f,i))}}}return!1};return d(a),{events:o,routes:i}}function B(t){let s=t?l:o,c=t?g:v,{events:u,routes:d}=z(s,t),h=new e(M(t?0:2,t?void 0:`모은 경로`)),_=new r(h,w),y=u[0],b=!1,x=0,S=e=>e.used.map(e=>s[e]),C=()=>({work:y.enters,variables:{now:b?`-`:y.route.at(-1),route:b?`-`:p(y.route),used:`{${S(y).map(f).join(`, `)}}`,...t?{}:{routes:`${x}개`}}}),T=e=>s.length-e.used.length,E=e=>e.map(e=>({to:e.to,verdict:e.verdict,label:A[e.verdict]})),D=t?u.length:u.findIndex(e=>e.done)+1,O=[];for(let e of u.slice(0,D)){let t=O.at(-1)?.at(-1);e.kind===`back`&&t?.kind===`back`&&!t.looks.some(e=>e.verdict===`new`)?O.at(-1).push(e):O.push([e])}if(O.forEach((e,r)=>{let[i]=e;if(i.kind===`enter`){y=i;let{to:e,from:s,route:l,looks:u,done:d}=i,p=!d&&!u.some(e=>e.verdict===`new`);d&&!t&&x++;let g=d?c.done:p?c.stuck:c.look;h.step({title:r===0?`${a}에서 출발`:`${f([s,e])} 항공권 쓰기${d?` — 경로 완성`:p?` — 막다른 길`:``}`,codeHighlights:g,...C(),...d&&t?{answer:l,isKeyframe:!0}:{}}),h.phase(`이동하기`,r===0?t?`항공권을 사전순으로 정렬하고 ${a}에서 출발합니다.`:`정렬하지 않고, 주어진 순서대로 항공권을 보며 ${a}에서 출발합니다.`:`${s}에서 ${e}까지 가는 항공권을 씁니다. 지금 경로에 쓴 항공권은 ${l.length-1}장입니다.`,r===0?c.start:c.enter),h.do(...n(I(h,l,S(i)))),_.push({id:`r:${l.length-1}`,text:e},k(e)),d?(h.phase(t?`완성`:`경로 모으기`,t?`항공권 ${o.length}장을 모두 썼습니다. 사전순으로 처음 완성한 경로라 True가 위로 전해지고 탐색이 바로 끝납니다.`:`항공권 ${o.length}장을 모두 썼습니다. 경로를 routes에 모으고, 멈추지 않고 되돌아가 다른 경로도 찾습니다.`,g),h.do(...n(I(h,l,S(i),{all:!0}))),t||h.do({type:`add`,item:{id:`routes:0`,kind:`token`,rect:F(0,300),tone:`plain`,text:m(l)},from:k(e)})):p?(h.phase(`살피기`,`${e}에서 쓸 수 있는 항공권이 없는데 아직 ${T(i)}장이 남았으니 막다른 길입니다.`,g),h.do({type:`focus`,ids:[k(e)]},...n(I(h,l,S(i),{stuck:!0}),!0),N(200),{type:`unfocus`})):(h.phase(`살피기`,`${e}에서 떠나는 항공권을 ${t?`사전순으로`:`주어진 순서대로`} 봅니다. ${R(u)}`,g),L(h,e,E(u)))}else{let t=e.at(-1);y=t;let r=e.map(e=>s[e.ticket]);h.step({title:e.length===1?`${f(r[0])} 되돌리기`:`항공권 ${e.length}장 되돌리기`,codeHighlights:t.looks.length?c.look:c.back,...C()}),h.phase(`되돌아가기`,e.length===1?`막다른 길이라 ${f(r[0])} 항공권을 되돌려 놓고 route의 마지막 공항을 뺍니다.`:`막다른 길이라 항공권 ${e.length}장을 되돌려 놓고 route의 마지막 공항을 하나씩 뺍니다. ${t.to}까지 돌아왔습니다.`,c.back);for(let t of e)_.pop(k(t.from)),h.do(...n(I(h,t.route,S(t)),!0));t.looks.length&&(h.phase(`살피기`,`${t.to}에서 이어서 항공권을 봅니다. ${R(t.looks)}`,c.look),L(h,t.to,E(t.looks)))}}),!t){let e=u[D-1].route,t=[...d].sort((e,t)=>e.join()<t.join()?-1:1)[0],r=d.find(e=>e!==t),i=t.findIndex((e,t)=>e!==r[t]),a=u[D-1].enters;y={...u.at(-1),route:[],used:[]},b=!0,x=d.length,h.step({title:`나머지 경로 확인 — 경로 ${d.length}개`,codeHighlights:v.min,...C(),answer:t,isKeyframe:!0}),h.phase(`빨리 감기`,`나머지 길도 끝까지 확인하느라 항공권을 ${y.enters-a}번 더 씁니다. 경로가 ${d.length-1}개 더 완성됩니다.`,v.fast),h.do(...n([..._.ids.map((t,n)=>({type:`remove`,id:t,into:k(e[n])})),...I(h,[],[])])),h.do(...d.slice(1).map((e,t)=>({type:`add`,item:{id:`routes:${t+1}`,kind:`token`,rect:F(t+1,300),tone:`plain`,text:m(e)},from:`routes:0`}))),h.phase(`최소 고르기`,`routes의 경로를 앞에서부터 비교하면 ${i+1}번째 공항에서 갈립니다. 사전순으로 앞서는 쪽은 ${t[i]}입니다. min(routes)는 ${m(t,` → `)}입니다.`,v.min),h.do(...n(d.map((e,n)=>({type:`set`,id:`routes:${n}`,patch:{tone:e===t?`good`:`muted`}})))),h.do(...n(I(h,t,t.slice(1).map((e,n)=>[t[n],e]),{all:!0}),!0))}return i(h.finish())}function V(){let t=new e(M(2)),o=new r(t,w),c=[...l],u=[a],d=[],h=`-`,g=[`ICN`,`JFK`,`ATL`,`ICN`,`SFO`,`ICN`,`HND`],_=()=>({work:d.length,variables:{route:p(u),left:`${c.length}장`,"돌려줄 값":h===`-`?`-`:p(h)}});for(;;){let e=u.at(-1),r=c.filter(([t])=>t===e),i=u.length===1;if(t.step({title:i?`${a}에서 출발`:`${f([u.at(-2),e])} 항공권 쓰기${r.length?``:` — 막다른 길`}`,codeHighlights:r.length?b.look:b.stuck,..._()}),t.phase(`이동하기`,i?`항공권을 사전순으로 정렬하고 ${a}에서 출발합니다.`:`${u.at(-2)}에서 ${e}까지 가는 항공권을 씁니다. 지금 경로에 쓴 항공권은 ${u.length-1}장입니다.`,i?b.start:b.move),t.do(...n(I(t,u,d))),o.push({id:`r:${u.length-1}`,text:e},k(e)),!r.length){t.phase(`살피기`,`${e}에서 쓸 수 있는 항공권이 없습니다. 아직 ${c.length}장이 남았지만 되돌아가지 않고 여기서 끝냅니다.`,b.stuck),t.do({type:`focus`,ids:[k(e)]},...n(I(t,u,d,{stuck:!0}),!0),N(200),{type:`unfocus`});break}t.phase(`살피기`,`${e}에서 떠나는 항공권은 ${r.map(([,e])=>`${e}행`).join(`, `)}입니다. 사전순으로 가장 앞선 ${r[0][1]}행을 바로 씁니다.`,b.look),L(t,e,r.map(([,e],t)=>({to:e,verdict:t?`seen`:`good`,label:t?`쓰지 않음`:`가장 앞섬`}))),c.splice(c.indexOf(r[0]),1),d.push(r[0]),u.push(r[0][1])}return h=[...u],t.step({title:`내 답 ${m(h)}, 정답은 ${m(g)}`,codeHighlights:b.done,..._(),answer:h,isKeyframe:!0}),t.phase(`오답 확인`,`${m(h,` → `)}에서 막혀 항공권 ${c.length}장이 남았습니다. 정답은 ${m(g,` → `)}입니다.`),t.do(...n(s.filter(e=>!u.includes(e)).map(e=>({type:`set`,id:k(e),patch:{tone:`bad`}})))),t.do({type:`add`,item:{id:`mine`,kind:`token`,rect:F(0,300),tone:`bad`,text:`내 답 ${m(h)}`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:F(1,300),tone:`good`,text:`정답 ${m(g)}`},together:!0}),i(t.finish())}var H={id:`travel-route`,title:`여행경로`,level:3,category:`dfs-bfs`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/43164`,description:{summary:`항공권 [출발 공항, 도착 공항]이 여러 장 주어집니다. ICN 공항에서 출발해 항공권을 한 장도 남기지 않고 한 번씩만 써서 여행하는 경로를 구합니다. 가능한 경로가 여럿이면 알파벳 순서로 가장 앞선 경로를 돌려줍니다.`,rules:[`공항 이름은 알파벳 대문자 3글자`,`공항은 3개 이상 10,000개 이하`,`tickets의 [a, b]는 a 공항에서 b 공항으로 가는 항공권 한 장`,`주어진 항공권은 모두 써야 함`,`가능한 경로가 둘 이상이면 알파벳 순서가 앞서는 경로를 return`,`모든 항공권을 쓸 수 없는 경우는 주어지지 않음`],examples:[{input:`tickets = [["ICN", "JFK"], ["HND", "IAD"], ["JFK", "HND"]]`,output:`["ICN", "JFK", "HND", "IAD"]`},{input:`tickets = [["ICN", "SFO"], ["ICN", "ATL"], ["SFO", "ATL"], ["ATL", "ICN"], ["ATL","SFO"]]`,output:`["ICN", "ATL", "ICN", "SFO", "ATL", "SFO"]`}]},keyIntuitions:[`공항은 여러 번 지날 수 있지만 항공권은 한 장씩만 씁니다. 그래서 "방문한 공항"이 아니라 "쓴 항공권"에 표시를 해야 합니다.`,`항공권을 도착 공항 사전순으로 정렬해 두고 앞선 것부터 써 보면, 항공권을 모두 쓰는 경로를 처음 완성한 순간이 곧 사전순으로 가장 앞선 경로라서 거기서 멈춥니다.`,`사전순으로 앞선 항공권이 막다른 길일 수 있습니다. 그때는 항공권을 되돌려 놓고(백트래킹) 다음 항공권을 써 봐야 하며, 앞선 것만 계속 쓰는 그리디는 오답입니다.`],demo:{input:[o],label:`tickets = [["ICN","HND"],["ICN","SFO"],["SFO","ICN"],["ICN","JFK"],["JFK","ATL"],["ATL","ICN"]]`},workUnit:`항공권을 쓴 횟수`,approaches:[{id:`travel-dfs`,name:`깊이 우선 탐색 (DFS 백트래킹)`,rank:`BEST`,timeComplexity:`최악 지수 시간, 보통은 훨씬 적음`,spaceComplexity:`O(N) 재귀 깊이`,verdict:`항공권을 사전순으로 써 보다가 막다른 길이면 되돌리는, 문제 그대로의 풀이입니다.`,pros:[`정렬해 두면 "가장 먼저 완성한 경로 = 사전순으로 가장 앞선 경로"라서 완성하는 즉시 멈출 수 있습니다.`,`쓴 항공권과 경로를 함께 되돌리는 백트래킹 틀이라 경로를 만드는 다른 문제에도 그대로 씁니다.`,`공항이 아니라 항공권에 사용 표시를 해서, 같은 공항을 여러 번 지나는 경로도 자연스럽게 다룹니다.`],cons:[`막다른 길을 만날 때마다 되돌아가므로 최악에는 시도하는 경우가 지수적으로 늘어납니다.`,`dfs를 부를 때마다 항공권 전체를 훑어 출발 공항이 같은 것을 찾습니다(공항별 목록을 만들어 두면 줄일 수 있습니다).`],whyThisRank:`이 문제의 핵심은 사전순 정렬과 막다른 길에서 되돌아오는 백트래킹이고, 둘을 모두 갖춘 가장 짧고 확실한 풀이입니다. 항상 경로가 있다는 조건 덕분에 처음 완성한 경로에서 멈추면 됩니다.`,code:h,visualize:()=>B(!0)},{id:`travel-all`,name:`DFS로 모든 경로를 모은 뒤 최소 고르기`,rank:`ALTERNATIVE`,timeComplexity:`지수 시간 (모든 경로 확인)`,spaceComplexity:`O(경로 수 × N)`,verdict:`정답은 나오지만 정렬 없이 모든 경로를 끝까지 찾아서 훨씬 많이 돕니다.`,pros:[`정렬 순서에 기대지 않고 가능한 경로를 전부 모아 min으로 고르니 정답이 보장됩니다.`,`백트래킹 틀은 정석과 같아 코드도 거의 같습니다.`],cons:[`경로를 하나 완성해도 멈추지 못하고 나머지 경우를 모두 확인합니다. 시각화 입력에서는 항공권을 쓰는 횟수가 정석의 8번보다 많은 15번입니다.`,`완성한 경로를 모두 저장하고 비교해야 해서 메모리와 시간이 더 듭니다.`],whyThisRank:`틀리지는 않지만 정석이 정렬 한 번으로 피하는 일을 모든 경로를 모아 비교하는 방식으로 처리해 손해를 봅니다. 항공권이 많아지면 경로 수가 폭발해 시간 초과가 날 수 있습니다.`,code:_,visualize:()=>B(!1)},{id:`travel-greedy`,name:`그리디 (사전순 항공권만 계속 쓰기)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`빠르고 그럴듯하지만 막다른 길에서 되돌아오지 않아 오답이 나옵니다.`,pros:[`정렬 한 번과 반복문 하나로 끝나 가장 짧고 빠릅니다.`],cons:[`사전순으로 가장 앞선 항공권이 막다른 길이면 거기서 끝나 버리고, 쓰지 못한 항공권이 남습니다. 시각화 입력에서는 ICN → HND만 쓰고 5장을 남깁니다.`,`항공권을 모두 써야 한다는 조건을 한 번도 확인하지 않습니다.`],whyThisRank:`이 문제는 항공권을 모두 쓰는 경로 중 사전순으로 가장 앞선 것을 구합니다. 앞서 보이는 선택이 막다른 길이면 되돌아가 다른 항공권을 써 봐야 하므로, 한 길만 따라가는 그리디로는 풀 수 없습니다.`,code:y,visualize:V}],checks:{cases:[{args:[[[`ICN`,`JFK`],[`HND`,`IAD`],[`JFK`,`HND`]]],expected:[`ICN`,`JFK`,`HND`,`IAD`]},{args:[[[`ICN`,`SFO`],[`ICN`,`ATL`],[`SFO`,`ATL`],[`ATL`,`ICN`],[`ATL`,`SFO`]]],expected:[`ICN`,`ATL`,`ICN`,`SFO`,`ATL`,`SFO`]},{args:[[[`ICN`,`AAA`],[`ICN`,`BBB`],[`BBB`,`ICN`]]],expected:[`ICN`,`BBB`,`ICN`,`AAA`]},{args:[[[`ICN`,`ATL`],[`ATL`,`ICN`],[`ICN`,`ATL`]]],expected:[`ICN`,`ATL`,`ICN`,`ATL`]},{args:[[[`ICN`,`ATL`],[`ATL`,`ICN`]]],expected:[`ICN`,`ATL`,`ICN`]},{args:[o],expected:[`ICN`,`JFK`,`ATL`,`ICN`,`SFO`,`ICN`,`HND`]}],random:e=>{let t=[`ICN`,`ATL`,`JFK`,`SFO`],n=[],r=`ICN`;for(let i=3+Math.floor(e()*5);i>0;i--){let i=t.filter(e=>e!==r)[Math.floor(e()*3)];n.push([r,i]),r=i}for(let t=n.length-1;t>0;t--){let r=Math.floor(e()*(t+1));[n[t],n[r]]=[n[r],n[t]]}return[n]}}};export{H as default};