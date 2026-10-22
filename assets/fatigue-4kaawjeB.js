import{t as e}from"./layout-DFaYBMY_.js";import{a as t,c as n,i as r,l as i,r as a}from"./shared-CL29HWIp.js";import{a as o,c as s,i as c,n as l,o as u,r as d,s as f,t as p}from"./common-T-bldLC7.js";var m=80,h=[[80,20],[50,40],[30,10]],g=h.length,_=e=>`${e+1}번`,v=e=>`[${h[e][0]}, ${h[e][1]}]`,y=e=>e.map(_).join(` → `),b=e=>m-e.reduce((e,t)=>e+h[t][1],0),x=e=>e.length?`${y(e)} 자리`:`맨 처음 자리`,S=e=>e?`≥`:`<`,C=[];{let e=0,t=n=>{e=Math.max(e,n.length);for(let r=0;r<g;r++){if(n.includes(r))continue;let i=b(n),a=i>=h[r][0];C.push({parent:n,i:r,before:i,ok:a,after:a?i-h[r][1]:i,best:a?Math.max(e,n.length+1):e}),a&&t([...n,r])}};t([])}var w=C.at(-1).best,T=(()=>{let e=C.find(e=>e.ok&&e.parent.length+1===w);return[...e.parent,e.i]})(),E=[];{let e=t=>{if(t.length===g){let e=m,n=0,r=[];for(let i of t){let t=e>=h[i][0];if(r.push({i,before:e,ok:t,after:t?e-h[i][1]:e}),!t)break;e-=h[i][1],n++}E.push({order:t,trials:r,count:n,end:e})}else for(let n=0;n<g;n++)t.includes(n)||e([...t,n])};e([])}var D=E.reduce((e,t)=>e+t.trials.length,0),O={python:`def solution(k, dungeons):
    visited = [False] * len(dungeons)  # 이미 다녀온 던전
    best = 0

    def dfs(fatigue, count):
        nonlocal best
        best = max(best, count)  # 지금까지 클리어한 개수의 최댓값
        for i, (need, cost) in enumerate(dungeons):
            if visited[i] or fatigue < need:
                continue  # 이미 갔거나 피로도가 모자라면 이 가지는 쳐냅니다
            visited[i] = True
            dfs(fatigue - cost, count + 1)
            visited[i] = False  # 되돌아와서 다른 순서도 해 봅니다

    dfs(k, 0)
    return best`,javascript:`function solution(k, dungeons) {
  const visited = Array(dungeons.length).fill(false); // 이미 다녀온 던전
  let best = 0;

  const dfs = (fatigue, count) => {
    best = Math.max(best, count); // 지금까지 클리어한 개수의 최댓값
    for (let i = 0; i < dungeons.length; i++) {
      const [need, cost] = dungeons[i];
      if (visited[i] || fatigue < need) continue; // 이미 갔거나 피로도가 모자라면 이 가지는 쳐냅니다
      visited[i] = true;
      dfs(fatigue - cost, count + 1);
      visited[i] = false; // 되돌아와서 다른 순서도 해 봅니다
    }
  };

  dfs(k, 0);
  return best;
}`},k={start:r(O,[`visited = [False]`,`best = 0`,`dfs(k, 0)`],[`const visited`,`let best = 0`,`dfs(k, 0)`]),pick:r(O,[`for i, (need, cost) in enumerate(dungeons)`],[`for (let i = 0; i < dungeons.length; i++)`]),check:r(O,[`if visited[i] or fatigue < need:`],[`if (visited[i] || fatigue < need) continue`]),enter:r(O,[`visited[i] = True`,`dfs(fatigue - cost, count + 1)`,`best = max(best, count)`],[`visited[i] = true`,`dfs(fatigue - cost, count + 1)`,`best = Math.max(best, count)`]),prune:r(O,[`if visited[i] or fatigue < need:`,`continue`],[`if (visited[i] || fatigue < need) continue`]),back:r(O,[`visited[i] = False`],[`visited[i] = false`]),done:r(O,[`dfs(k, 0)`,`return best`],[`dfs(k, 0)`,`return best`])},A={python:`from itertools import permutations

def solution(k, dungeons):
    best = 0
    for order in permutations(dungeons):  # 던전 순서를 모두 만듭니다
        fatigue, count = k, 0
        for need, cost in order:  # 순서마다 처음부터 시뮬레이션합니다
            if fatigue < need:
                break  # 못 들어가는 던전을 만나면 그 순서는 거기서 끝
            fatigue -= cost
            count += 1
        best = max(best, count)
    return best`,javascript:`function solution(k, dungeons) {
  // 던전 순서를 모두 만듭니다
  const orders = [];
  const build = (order, rest) => {
    if (rest.length === 0) {
      orders.push(order);
      return;
    }
    for (let i = 0; i < rest.length; i++) {
      build([...order, rest[i]], [...rest.slice(0, i), ...rest.slice(i + 1)]);
    }
  };
  build([], dungeons);

  let best = 0;
  for (const order of orders) {
    let fatigue = k;
    let count = 0;
    for (const [need, cost] of order) { // 순서마다 처음부터 시뮬레이션합니다
      if (fatigue < need) break; // 못 들어가는 던전을 만나면 그 순서는 거기서 끝
      fatigue -= cost;
      count++;
    }
    best = Math.max(best, count);
  }
  return best;
}`},j={make:r(A,[`for order in permutations(dungeons)`],[`const orders = []`,`build([], dungeons)`]),start:r(A,[`for order in permutations(dungeons)`,`fatigue, count = k, 0`],[`for (const order of orders)`,`let fatigue = k`,`let count = 0`]),enter:r(A,[`for need, cost in order:`,`if fatigue < need:`,`fatigue -= cost`,`count += 1`],[`for (const [need, cost] of order)`,`if (fatigue < need) break`,`fatigue -= cost`,`count++`]),stop:r(A,[`for need, cost in order:`,`if fatigue < need:`,`break`],[`for (const [need, cost] of order)`,`if (fatigue < need) break`]),record:r(A,[`best = max(best, count)`],[`best = Math.max(best, count)`]),done:r(A,[`best = max(best, count)`,`return best`],[`best = Math.max(best, count)`,`return best`])},M={python:`# 주의: 소모 피로도가 적은 던전부터 가는 오답 풀이입니다
def solution(k, dungeons):
    count = 0
    for need, cost in sorted(dungeons, key=lambda d: d[1]):  # 소모 피로도가 적은 순
        if k >= need:
            k -= cost
            count += 1
    return count`,javascript:`// 주의: 소모 피로도가 적은 던전부터 가는 오답 풀이입니다
function solution(k, dungeons) {
  let count = 0;
  for (const [need, cost] of [...dungeons].sort((a, b) => a[1] - b[1])) { // 소모 피로도가 적은 순
    if (k >= need) {
      k -= cost;
      count++;
    }
  }
  return count;
}`},N={sort:r(M,[`count = 0`,`sorted(dungeons`],[`let count = 0`,`.sort((a, b) => a[1] - b[1])`]),check:r(M,[`for need, cost in sorted(dungeons`,`if k >= need:`],[`for (const [need, cost] of`,`if (k >= need)`]),enter:r(M,[`if k >= need:`,`k -= cost`,`count += 1`],[`if (k >= need)`,`k -= cost`,`count++`]),skip:r(M,[`for need, cost in sorted(dungeons`],[`for (const [need, cost] of`]),done:r(M,[`return count`],[`return count`])},P=420,F=e=>`d:${e}`,I=e=>({x:18+e*128,y:28,w:118,h:46}),L=e=>[{id:`title`,kind:`text`,rect:{x:18,y:0,w:384,h:16},tone:`muted`,text:e},...h.map((e,t)=>({id:F(t),kind:`cell`,rect:I(t),tone:`plain`,text:v(t),tag:`${_(t)} 던전`}))],R=`던전 [필요, 소모] · 처음 피로도 k = ${m}`,z=(e,t,n=-1)=>h.flatMap((r,i)=>{let a=i===n?`current`:t.includes(i)?`visited`:`plain`;return e.get(F(i)).tone===a?[]:[f(F(i),a)]}),B=(e,t,n,r,i,a)=>({id:e,kind:`token`,rect:{x:t,y:n,w:r,h:30},tone:a,text:i}),ee={x:18,y:92,w:54,h:44,gapX:10,gapY:20},V=410,H={x:0,y:0,w:P,h:V},U=e=>`n:${e.map(e=>e+1).join(``)}`,W={id:U([]),kids:[]};{let e=new Map([[W.id,W]]);for(let t of C){let n={id:U([...t.parent,t.i]),kids:[]};e.get(U(t.parent)).kids.push(n),e.set(n.id,n)}}var G=c(W,ee),K=e=>G.get(U(e));function q(){return{width:P,height:V,items:[...L(R),{id:U([]),kind:`cell`,rect:K([]),tone:`visited`,text:`시작`,tag:`남은 ${m}`},{id:`calc`,kind:`text`,rect:{x:18,y:338,w:384,h:28},text:``},B(`t:now`,18,372,116,`클리어 0개`,`plain`),B(`t:best`,142,372,116,`최대 0개`,`chosen`)]}}function J(){let r=new i(q()),c=[],w=0,E=0,D=()=>({work:E,variables:{fatigue:b(c),count:c.length,best:w,"다녀온 던전":c.length?c.map(_).join(`, `):`-`}});return r.step({title:`dfs(k = ${m}, 0)에서 시작`,codeHighlights:k.start,...D()}),r.phase(`시작`,`던전 ${g}개를 가는 순서를 정해 가장 많이 클리어하려 합니다. 처음 피로도 ${m}에서 시작해, 아직 안 간 던전을 하나씩 골라 들어갈 수 있는지 살핍니다. 못 들어가는 던전을 고르면 그 가지는 바로 쳐냅니다.`,k.start),r.do(o(r,e(K([]),5)),s(300)),C.forEach((i,d)=>{let m=[...i.parent,i.i],[g,b]=h[i.i],[T,O,A]=[U(m),U(i.parent),`e:${m.map(e=>e+1).join(``)}`],j=C[d+1]?.parent??[],M=d===C.length-1,N=i.ok?m:i.parent,P=w;E++,w=i.best,c=j,r.step({title:i.ok?`${y(m)}: 들어감, 남은 ${i.after}`:`${y(m)}: 못 들어감 (${i.before} < ${g})`,codeHighlights:i.ok?k.enter:k.prune,...D()}),r.phase(`고르기`,`${x(i.parent)}에서 아직 안 간 ${_(i.i)} 던전 ${a(v(i.i),`을`,`를`)} 골라 봅니다.`,k.pick),r.do(...n([f(F(i.i),`current`),u(`calc`,{text:`${_(i.i)}: 필요 ${g}, 소모 ${b}`}),{type:`add`,item:{id:T,kind:`cell`,rect:K(m),tone:`queued`,text:_(i.i),tag:`필요 ${g}`},from:O},{type:`add`,item:{id:A,kind:`line`,rect:H,tone:`trail`,points:p(K(i.parent),K(m))}}])),r.phase(`확인하기`,i.ok?`남은 피로도 ${a(i.before,`이`,`가`)} 필요 피로도 ${g} 이상이라 들어갈 수 있습니다.`:`남은 피로도 ${t(i.before)}는 필요 피로도 ${g}에 모자랍니다. 들어갈 수 없습니다.`,k.check),r.do({type:`focus`,ids:[O,T,F(i.i)]}),r.do({type:`arrow`,from:O,to:T,verdict:i.ok?`good`:`bad`,label:`${i.before} ${S(i.ok)} ${g}`},s(250)),i.ok?(r.phase(`들어가기`,`${_(i.i)}에 들어갑니다. 남은 피로도는 ${i.before} − ${b} = ${i.after}입니다.${i.best>P?` 클리어 ${m.length}개로 최대 기록을 올립니다.`:``}`,k.enter),r.do(...l()),r.do(...n([u(T,{tone:`visited`,tag:`남은 ${i.after}`},!0),f(F(i.i),`visited`),o(r,e(K(m),5)),u(`calc`,{text:`${i.before} − ${b} = ${i.after}`})])),r.do(...n([u(`t:now`,{text:`클리어 ${m.length}개`},!0),...i.best>P?[u(`t:best`,{text:`최대 ${i.best}개`},!0)]:[]]))):(r.phase(`쳐내기`,`${_(i.i)}은 못 들어가니 이 가지는 여기서 쳐냅니다. 아래로는 내려가지 않습니다.`,k.prune),r.do(...l()),r.do(...n([f(T,`explored`),f(F(i.i),`plain`)]))),N.length>j.length&&(r.phase(`되돌아가기`,M?`더 고를 던전도, 다시 고를 갈래도 없어 맨 처음 자리로 돌아옵니다. 모든 순서를 살펴봤습니다.`:`더 고를 던전이 없어 ${x(j)}로 돌아갑니다.`,k.back),r.do(...n([o(r,e(K(j),5)),...z(r,j)])))}),r.step({title:`최대 ${w}개`,codeHighlights:k.done,...D(),answer:w,isKeyframe:!0}),r.phase(`결과`,`모든 순서를 살펴 최대 ${w}개를 찾았습니다. ${y(T)} 순서로 가면 ${w}개를 모두 클리어합니다. 던전에 들어갈 수 있는지 ${E}번만 확인했고, 쳐낸 가지 아래는 보지 않았습니다.`,k.done),r.do(...n([{type:`remove`,id:`ring`},...[[],...T.map((e,t)=>T.slice(0,t+1))].map(e=>f(U(e),`path`)),u(`calc`,{text:`${y(T)} → ${w}개 클리어`}),f(`t:best`,`path`,!0)])),d(r.finish())}var Y=426,X=e=>92+e*50,te=e=>({x:18,y:X(e),w:54,h:42}),ne=(e,t)=>({x:84+t*64,y:X(e),w:54,h:42}),Z=e=>({x:282,y:X(e)+6,w:110,h:30}),Q=(e,t)=>`c:${e}:${t}`;function re(){return{width:P,height:Y,items:[...L(R),{id:`calc`,kind:`text`,rect:{x:18,y:392,w:270,h:26},text:``},B(`t:best`,296,390,106,`최대 0개`,`chosen`)]}}function ie(){let e=new i(re()),t=0,r=0,o,c=()=>({work:r,variables:o?{order:o.order.map(e=>e+1).join(`, `),fatigue:o.fatigue,count:o.count,best:t}:{"순서 수":E.length,best:t}});e.step({title:`순서 ${E.length}가지 만들기`,codeHighlights:j.make,...c()}),e.phase(`순서 만들기`,`던전 ${g}개를 가는 순서는 ${g}! = ${E.length}가지입니다. 먼저 순서를 전부 만들어 한 줄씩 놓습니다. 줄마다 처음 피로도 ${m}에서 시작합니다.`,j.make),e.do(...n(E.flatMap(({order:e},t)=>[{type:`add`,item:{id:`s:${t}`,kind:`token`,rect:te(t),tone:`plain`,text:`k ${m}`}},...e.map((e,n)=>({type:`add`,item:{id:Q(t,n),kind:`cell`,rect:ne(t,n),tone:`plain`,text:_(e)}}))]))),r=0,E.forEach((i,d)=>{let p=t;i.trials.forEach((m,g)=>{let[v,b]=h[m.i],[x,C]=[Q(d,g),g?Q(d,g-1):`s:${d}`],w=g===i.trials.length-1;r++,w&&(t=Math.max(t,i.count)),o={order:i.order,fatigue:m.after,count:m.ok?g+1:g},e.step({title:`${d+1}번째 경우 · ${_(m.i)}: ${m.ok?`들어감, 남은 ${m.after}`:`못 들어감 (${m.before} < ${v})`}${w?` → ${i.count}개`:``}`,codeHighlights:m.ok?j.enter:j.stop,...c()});let T=`${_(m.i)}은 필요 ${v}, 남은 ${a(m.before,`이라`,`라`)} ${m.ok?`들어갈 수 있습니다.`:`들어갈 수 없습니다.`}`;e.phase(`확인하기`,g?`이어서 ${T}`:`${d+1}번째 경우, ${y(i.order)} 순서로 처음부터 가 봅니다. ${T}`,m.ok?j.enter:j.stop),e.do({type:`focus`,ids:[C,x,F(m.i)]}),e.do({type:`arrow`,from:C,to:x,verdict:m.ok?`good`:`bad`,label:`${m.before} ${S(m.ok)} ${v}`},s(150)),m.ok?(e.phase(`들어가기`,`${_(m.i)}에 들어가 소모 피로도 ${a(b,`을`,`를`)} 쓰니 남은 피로도는 ${m.before} − ${b} = ${m.after}입니다.`,j.enter),e.do(...n([...l(),u(x,{tone:`visited`,tag:`남은 ${m.after}`},!0),u(`calc`,{text:`${m.before} − ${b} = ${m.after}`})]))):(e.phase(`멈추기`,`${_(m.i)}은 못 들어가니 이 경우는 여기서 끝납니다. ${i.count}개를 클리어했습니다.`,j.stop),e.do(...n([...l(),u(x,{tone:`bad`,tag:`필요 ${v}`},!0),u(`calc`,{text:`${m.before} < ${v}: 이 경우는 여기서 끝`})]))),w&&(e.phase(`기록하기`,`이 경우는 ${i.count}개로 끝났습니다. ${ae(i.count,p)}`,j.record),e.do(...n([{type:`add`,item:B(`res:${d}`,Z(d).x,Z(d).y,110,`${i.count}개 클리어`,i.count>p?`good`:`plain`)},...i.order.slice(i.trials.length).map((e,t)=>f(Q(d,i.trials.length+t),`explored`))])),i.count>p&&e.do(u(`t:best`,{text:`최대 ${t}개`},!0)))})});let p=E.findIndex(e=>e.count===t);return o=void 0,e.step({title:`최대 ${t}개`,codeHighlights:j.done,...c(),answer:t,isKeyframe:!0}),e.phase(`결과`,`${E.length}가지 경우를 모두 따라가 최대 ${t}개를 찾았습니다. ${y(E[p].order)} 순서입니다. 앞부분이 같은 경우도 처음부터 다시 확인해 ${r}번을 확인했습니다. 가지치기를 쓰는 정석은 ${C.length}번이면 됩니다.`,j.done),e.do(...n([...E[p].order.map((e,t)=>f(Q(p,t),`path`)),f(`t:best`,`path`,!0),u(`calc`,{text:`${y(E[p].order)} → ${t}개 클리어`})])),d(e.finish())}var ae=(e,t)=>e>t?`지금까지의 최대 ${t}개보다 많아 ${e}개로 올립니다.`:`지금까지의 최대 ${t}개를 넘지 못합니다.`,oe=228,$=[...h.keys()].sort((e,t)=>h[e][1]-h[t][1]);function se(){let e=new i({width:P,height:oe,items:[...L(R),{id:`calc`,kind:`text`,rect:{x:18,y:144,w:384,h:28},text:``},{id:`t:k`,kind:`token`,rect:{x:18,y:104,w:150,h:34},tone:`chosen`,text:`남은 피로도 ${m}`},B(`t:count`,176,104,110,`클리어 0개`,`plain`)]}),t=m,r=0,o=0,c,p=()=>({work:o,variables:{k:t,count:r,need:c===void 0?`-`:h[c][0],cost:c===void 0?`-`:h[c][1]}});return e.step({title:`소모 피로도 순으로 정렬`,codeHighlights:N.sort,...p()}),e.phase(`정렬하기`,`소모 피로도가 적은 던전부터 가면 피로도를 아껴 더 많이 갈 수 있을 것 같습니다. 소모 피로도 ${$.map(e=>h[e][1]).join(`, `)} 순으로 ${$.map(_).join(`, `)}을 늘어놓습니다.`,N.sort),e.do(...n([...$.map((e,t)=>u(F(e),{rect:I(t)})),u(`title`,{text:`소모 피로도가 적은 순 · 처음 피로도 k = ${m}`})])),$.forEach((i,d)=>{let[m,g]=h[i],v=t>=m,y=t;o++,c=i,v&&(t-=g,r++),e.step({title:v?`${_(i)}: 들어감, 남은 ${t}`:`${_(i)}: 못 들어가 건너뜀 (${y} < ${m})`,codeHighlights:v?N.enter:N.skip,...p()}),e.phase(`확인하기`,v?`${d+1}번째로 ${_(i)}을 봅니다. 필요 피로도 ${m}, 남은 피로도 ${a(y,`이라`,`라`)} 들어갈 수 있습니다.`:`${d+1}번째로 ${_(i)}을 봅니다. 필요 피로도는 ${m}인데 남은 피로도는 ${y}뿐이라 들어갈 수 없습니다.`,N.check),e.do({type:`focus`,ids:[F(i)]}),e.do({type:`arrow`,from:`t:k`,to:F(i),verdict:v?`good`:`bad`,label:`${y} ${S(v)} ${m}`},s(250)),v?(e.phase(`들어가기`,`${_(i)}에 들어가 소모 피로도 ${a(g,`을`,`를`)} 쓰니 남은 피로도는 ${y} − ${g} = ${t}입니다. 클리어한 던전은 ${r}개입니다.`,N.enter),e.do(...l()),e.do(...n([f(F(i),`visited`),u(`t:k`,{text:`남은 피로도 ${t}`},!0),u(`calc`,{text:`${y} − ${g} = ${t}`})])),e.do(u(`t:count`,{text:`클리어 ${r}개`},!0))):(e.phase(`건너뛰기`,`${_(i)}은 못 들어가니 건너뛰고 다음 던전으로 갑니다. 이미 지나쳤기 때문에 나중에 돌아와 다시 시도하지 않습니다.`,N.skip),e.do(...l()),e.do(...n([f(F(i),`explored`),u(`calc`,{text:`${y} < ${m}: 건너뜀`})])))}),c=void 0,e.step({title:`${r}개 — 정답은 ${w}개`,codeHighlights:N.done,...p(),answer:r,isKeyframe:!0}),e.phase(`비교하기`,`${r}개를 돌려줍니다. 하지만 ${y(T)} 순서로 가면 ${w}개를 모두 클리어할 수 있습니다. 소모가 적은 ${_($[0])}을 먼저 가면 남은 피로도가 ${a(b([$[0]]),`이`,`가`)} 되어 필요 ${h[0][0]}인 ${_(0)}에 못 들어갑니다. 필요 피로도가 큰 던전은 피로도가 많을 때 먼저 가야 합니다.`,N.done),e.do(...n([f(`t:count`,`bad`,!0),u(`calc`,{text:`내 답 ${r}개 ≠ 정답 ${w}개`})])),e.do({type:`add`,item:B(`t:mine`,18,186,110,`내 답 ${r}개`,`bad`)}),e.do({type:`add`,item:B(`t:truth`,136,186,266,`정답 ${w}개 (${y(T)})`,`good`)}),d(e.finish())}var ce={id:`fatigue`,title:`피로도`,level:2,category:`brute-force`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/87946`,description:{summary:`하루에 던전을 여러 곳 돌 수 있는 게임입니다. 던전마다 들어가려면 지금 피로도가 "최소 필요 피로도" 이상이어야 하고, 한 번 클리어할 때마다 "소모 피로도"만큼 피로도가 줄어듭니다. 처음 피로도 k가 주어질 때, 던전을 도는 순서를 잘 골라 하루에 클리어할 수 있는 던전의 최대 개수를 구합니다. 같은 던전은 한 번만 돌 수 있습니다.`,rules:[`k는 1 이상 5,000 이하의 자연수`,`던전은 1개 이상 8개 이하이고, 각 던전은 [최소 필요 피로도, 소모 피로도]로 주어짐`,`최소 필요 피로도는 소모 피로도보다 크거나 같고, 둘 다 1 이상 1,000 이하의 자연수`,`[최소 필요 피로도, 소모 피로도]가 같은 던전이 여러 개 있을 수 있음`],examples:[{input:`k = 80, dungeons = [[80,20],[50,40],[30,10]]`,output:`3`}]},keyIntuitions:[`던전이 최대 8개라 가는 순서는 8! = 40,320가지뿐입니다. 순서를 전부 살펴도 충분히 빠르니 완전탐색 문제입니다.`,`같은 던전을 두 번 돌 수 없으니 순열입니다. 던전을 하나 고를 때마다 피로도가 줄어드는데, 못 들어가는 던전을 고른 순간 그 뒤로 이어질 순서는 볼 필요가 없습니다(가지치기).`,`소모가 적은 순이나 필요가 큰 순처럼 한 가지 기준으로 정렬해 가면 안 됩니다. 순서에 따라 들어갈 수 있는 던전이 달라지므로 모든 순서를 시도해야 합니다.`],demo:{input:[m,h],label:`k = 80, dungeons = [[80,20],[50,40],[30,10]]`},workUnit:`던전에 들어갈 수 있는지 확인한 횟수`,approaches:[{id:`fatigue-backtracking`,name:`순열 백트래킹 (DFS + 가지치기)`,rank:`BEST`,timeComplexity:`O(N × N!)`,spaceComplexity:`O(N)`,verdict:`던전을 하나씩 골라 들어가 보고, 못 들어가는 던전을 고르면 그 가지를 바로 쳐내며 가장 많이 도는 순서를 찾습니다.`,pros:[`못 들어가는 던전에서 바로 되돌아가 필요 없는 순서를 만들지 않습니다.`,`순서를 따로 저장하지 않고 재귀 하나로 전부 훑어 코드가 짧습니다.`,`던전이 8개여도 가능한 순서가 40,320가지라 충분히 빠릅니다.`],cons:[`visited 표시를 하고 되돌려 놓는 줄을 빠뜨리기 쉽습니다.`,`모든 던전에 들어갈 수 있는 입력이면 쳐낼 가지가 없어 순서 전부를 보게 됩니다.`],whyThisRank:`순서가 결과를 바꾸고 던전이 8개 이하라, 순서를 모두 살피되 막힌 가지는 일찍 버리는 백트래킹이 가장 자연스럽습니다. 같은 앞부분을 다시 계산하지도 않습니다.`,code:O,visualize:J},{id:`fatigue-permutations`,name:`모든 순서를 만든 뒤 하나씩 시뮬레이션`,rank:`ALTERNATIVE`,timeComplexity:`O(N × N!)`,spaceComplexity:`O(N × N!)`,verdict:`던전 순서를 전부 만들어 두고, 순서마다 처음부터 피로도를 깎아 가며 몇 개를 도는지 셉니다.`,pros:[`순서 만들기와 확인을 나눠서 코드를 이해하기 쉽습니다.`,`파이썬에서는 itertools.permutations 한 줄로 순서를 만들 수 있습니다.`],cons:[`못 들어가는 던전이 앞에 있어도 그 뒤 순서까지 전부 만들고 따라갑니다.`,`앞부분이 같은 순서를 처음부터 다시 시뮬레이션해 같은 계산을 되풀이합니다.`,`JavaScript로는 순서를 배열에 모두 담아야 해서 메모리를 더 씁니다.`],whyThisRank:`답은 정석과 같지만 쳐낼 수 있는 가지를 끝까지 따라갑니다. 이 입력에서 정석은 ${C.length}번이면 되는데 이 풀이는 ${D}번을 확인합니다. 던전이 많아질수록 차이가 벌어집니다.`,code:A,visualize:ie},{id:`fatigue-cheapest-first`,name:`소모 피로도가 적은 던전부터 가기 (그리디)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`소모가 적은 던전부터 가면 많이 돌 것 같지만, 필요 피로도를 놓쳐 더 적게 돌게 되는 오답 풀이입니다.`,pros:[`정렬 한 번에 끝나서 코드가 짧고 빠릅니다.`,`던전의 필요 피로도와 소모 피로도가 거의 같은 입력에서는 우연히 맞습니다.`],cons:[`예제에서 3번(소모 10)을 먼저 가면 남은 피로도가 70이 되어 필요 피로도 80인 1번에 못 들어가고, 2개에 그칩니다. 정답은 3개입니다.`,`순서가 결과를 바꾸는 문제라서 한 가지 기준의 정렬로는 최선을 보장하지 못합니다.`],whyThisRank:`던전을 도는 순서에 따라 들어갈 수 있는 던전이 달라집니다. 필요 피로도가 큰 던전은 피로도가 많이 남았을 때 먼저 가야 하는데, 소모만 보면 이를 놓칩니다. 가능한 순서를 모두 살펴야 합니다.`,code:M,visualize:se}],checks:{cases:[{args:[80,[[80,20],[50,40],[30,10]]],expected:3},{args:[1,[[2,1]]],expected:0},{args:[10,[[5,5],[5,5]]],expected:2},{args:[10,[[10,10],[10,1]]],expected:1},{args:[30,[[30,30],[20,5],[20,5]]],expected:2},{args:[500,Array.from({length:8},()=>[100,10])],expected:8},{args:[m,h],expected:3}],random:e=>{let t=1+Math.floor(e()*6),n=Array.from({length:t},()=>{let t=1+Math.floor(e()*40);return[t,1+Math.floor(e()*t)]});return[1+Math.floor(e()*100),n]}}};export{ce as default};