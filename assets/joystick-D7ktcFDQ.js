import{i as e,t}from"./layout-DFaYBMY_.js";import{a as n,i as r,o as i,r as a,s as o}from"./shared-e6uNbDLo.js";import{t as s}from"./paced-DMEp_Mu1.js";var c=`JEANAAAAAZA`,l=11,u=e=>Math.min(e.charCodeAt(0)-65,91-e.charCodeAt(0)),d=[...c].map(u),f=i(d),p=[...c].flatMap((e,t)=>t>0&&e!==`A`?[t]:[]),m=e=>`[${e.join(`, `)}]`,h={python:`def solution(name):
    n = len(name)
    # 위아래: 글자마다 따로, A에서 올리거나 Z에서 내리는 쪽 중 짧은 쪽
    updown = sum(min(ord(c) - 65, 91 - ord(c)) for c in name)

    move = n - 1                  # 기준: 오른쪽으로 끝까지 가는 경로
    for i in range(n):            # i번 칸까지 갔다가 돌아섭니다
        nxt = i + 1
        while nxt < n and name[nxt] == 'A':
            nxt += 1              # 이어지는 A 구간은 건너뜁니다
        # 오른쪽 먼저 갔다 오기 / 왼쪽(뒤쪽) 먼저 갔다 오기 중 짧은 쪽
        move = min(move, 2 * i + n - nxt, 2 * (n - nxt) + i)
    return updown + move`,javascript:`function solution(name) {
  const n = name.length;
  // 위아래: 글자마다 따로, A에서 올리거나 Z에서 내리는 쪽 중 짧은 쪽
  let updown = 0;
  for (const c of name) updown += Math.min(c.charCodeAt(0) - 65, 91 - c.charCodeAt(0));

  let move = n - 1; // 기준: 오른쪽으로 끝까지 가는 경로
  for (let i = 0; i < n; i++) { // i번 칸까지 갔다가 돌아섭니다
    let nxt = i + 1;
    while (nxt < n && name[nxt] === 'A') nxt++; // 이어지는 A 구간은 건너뜁니다
    // 오른쪽 먼저 갔다 오기 / 왼쪽(뒤쪽) 먼저 갔다 오기 중 짧은 쪽
    move = Math.min(move, 2 * i + n - nxt, 2 * (n - nxt) + i);
  }
  return updown + move;
}`},g={costs:r(h,[`updown = sum(`],[`let updown = 0`,`for (const c of name)`]),base:r(h,[`move = n - 1`],[`let move = n - 1`]),skip:r(h,[`for i in range(n)`,`nxt = i + 1`,`while nxt < n`,`nxt += 1`],[`for (let i = 0`,`let nxt = i + 1`,`while (nxt < n`]),pick:r(h,[`move = min(move, 2 * i`],[`move = Math.min(move, 2 * i`]),done:r(h,[`return updown + move`],[`return updown + move`])},_={python:`def solution(name):
    n = len(name)
    updown = sum(min(ord(c) - 65, 91 - ord(c)) for c in name)

    best = float('inf')

    def dfs(pos, todo, move):       # todo: 아직 바꾸지 않은 글자 칸들
        nonlocal best
        if not todo:
            best = min(best, move)  # 모든 글자를 만났다 → 경로 하나 완성
            return
        right = min((t - pos) % n for t in todo)  # 오른쪽으로 가장 가까운 글자까지
        left = min((pos - t) % n for t in todo)   # 왼쪽으로 가장 가까운 글자까지
        dfs((pos + right) % n, todo - {(pos + right) % n}, move + right)  # 오른쪽 갈래
        dfs((pos - left) % n, todo - {(pos - left) % n}, move + left)     # 왼쪽 갈래

    dfs(0, frozenset(i for i in range(1, n) if name[i] != 'A'), 0)
    return updown + best`,javascript:`function solution(name) {
  const n = name.length;
  let updown = 0;
  for (const c of name) updown += Math.min(c.charCodeAt(0) - 65, 91 - c.charCodeAt(0));

  let best = Infinity;
  const dfs = (pos, todo, move) => { // todo: 아직 바꾸지 않은 글자 칸들
    if (todo.length === 0) {
      best = Math.min(best, move); // 모든 글자를 만났다 → 경로 하나 완성
      return;
    }
    let right = n;
    let left = n;
    for (const t of todo) {
      right = Math.min(right, (t - pos + n) % n); // 오른쪽으로 가장 가까운 글자까지
      left = Math.min(left, (pos - t + n) % n); // 왼쪽으로 가장 가까운 글자까지
    }
    const goRight = (pos + right) % n;
    const goLeft = (pos - left + n) % n;
    dfs(goRight, todo.filter((t) => t !== goRight), move + right); // 오른쪽 갈래
    dfs(goLeft, todo.filter((t) => t !== goLeft), move + left); // 왼쪽 갈래
  };

  dfs(0, [...Array(n).keys()].filter((i) => i > 0 && name[i] !== 'A'), 0);
  return updown + best;
}`},v={costs:r(_,[`updown = sum(`],[`let updown = 0`,`for (const c of name)`]),start:r(_,[`best = float`,`dfs(0, frozenset(`],[`let best = Infinity`,`dfs(0, [...Array(n)`]),leaf:r(_,[`if not todo`,`best = min(best, move)`],[`if (todo.length === 0)`,`best = Math.min(best, move)`]),right:r(_,[`right = min(`,`dfs((pos + right) % n`],[`right = Math.min(right`,`dfs(goRight`]),left:r(_,[`left = min(`,`dfs((pos - left) % n`],[`left = Math.min(left`,`dfs(goLeft`]),back:r(_,[`dfs((pos + right) % n`,`dfs((pos - left) % n`],[`dfs(goRight`,`dfs(goLeft`]),done:r(_,[`return updown + best`],[`return updown + best`])},y={python:`def solution(name):
    n = len(name)
    updown = sum(min(ord(c) - 65, 91 - ord(c)) for c in name)

    todo = {i for i in range(1, n) if name[i] != 'A'}  # 아직 바꾸지 않은 글자 칸 (0번 칸에서 시작)
    pos, move = 0, 0
    while todo:
        right = min((t - pos) % n for t in todo)  # 오른쪽으로 가장 가까운 글자까지
        left = min((pos - t) % n for t in todo)   # 왼쪽으로 가장 가까운 글자까지
        if right <= left:  # 더 가까운 쪽으로 간다 (같으면 오른쪽)
            pos, move = (pos + right) % n, move + right
        else:
            pos, move = (pos - left) % n, move + left
        todo.remove(pos)
    return updown + move  # 가까운 글자부터 가면 멀리 돌아오게 될 수 있다`,javascript:`function solution(name) {
  const n = name.length;
  let updown = 0;
  for (const c of name) updown += Math.min(c.charCodeAt(0) - 65, 91 - c.charCodeAt(0));

  const todo = new Set(); // 아직 바꾸지 않은 글자 칸 (0번 칸에서 시작)
  for (let i = 1; i < n; i++) if (name[i] !== 'A') todo.add(i);
  let pos = 0;
  let move = 0;
  while (todo.size > 0) {
    let right = n;
    let left = n;
    for (const t of todo) {
      right = Math.min(right, (t - pos + n) % n); // 오른쪽으로 가장 가까운 글자까지
      left = Math.min(left, (pos - t + n) % n); // 왼쪽으로 가장 가까운 글자까지
    }
    if (right <= left) { // 더 가까운 쪽으로 간다 (같으면 오른쪽)
      pos = (pos + right) % n;
      move += right;
    } else {
      pos = (pos - left + n) % n;
      move += left;
    }
    todo.delete(pos);
  }
  return updown + move; // 가까운 글자부터 가면 멀리 돌아오게 될 수 있다
}`},b={costs:r(y,[`updown = sum(`],[`let updown = 0`,`for (const c of name)`]),start:r(y,[`todo = {i for i`,`pos, move = 0, 0`],[`const todo = new Set()`,`let pos = 0`,`let move = 0`]),look:r(y,[`while todo`,`right = min(`,`left = min(`],[`while (todo.size > 0)`,`right = Math.min(right`,`left = Math.min(left`]),right:r(y,[`if right <= left`,`pos, move = (pos + right) % n`,`todo.remove(pos)`],[`if (right <= left)`,`pos = (pos + right) % n`,`move += right`,`todo.delete(pos)`]),left:r(y,[`if right <= left`,`else:`,`pos, move = (pos - left) % n`,`todo.remove(pos)`],[`if (right <= left)`,`} else {`,`pos = (pos - left + n) % n`,`move += left`,`todo.delete(pos)`]),done:r(y,[`return updown + move`],[`return updown + move`])},x=(...e)=>({python:[...new Set(e.flatMap(e=>e.python))].sort((e,t)=>e-t),javascript:[...new Set(e.flatMap(e=>e.javascript))].sort((e,t)=>e-t)}),S=e({x:64,y:28,rows:1,cols:l,cell:48,gap:4}),C=640,w=204,T=e=>`cell:${e}`,E=e=>({type:`wait`,ms:e}),D=()=>o([{type:`unfocus`},{type:`clearMarks`}]),O=e=>e===`R`?`오른쪽`:`왼쪽`;function k(){let e=[{id:`lab:cell`,kind:`text`,rect:{x:0,y:28,w:58,h:48},text:`글자`},{id:`lab:idx`,kind:`text`,rect:{x:0,y:80,w:58,h:18},tone:`muted`,text:`칸 번호`},{id:`lab:cost`,kind:`text`,rect:{x:0,y:100,w:58,h:20},text:`위아래`}];return[...c].forEach((t,n)=>{let r=S(0,n);e.push({id:T(n),kind:`cell`,rect:r,tone:`plain`,text:t},{id:`idx:${n}`,kind:`text`,rect:{x:r.x,y:80,w:r.w,h:18},tone:`muted`,text:String(n)},{id:`cost:${n}`,kind:`text`,rect:{x:r.x,y:100,w:r.w,h:20},text:``})}),e.push({id:`calc`,kind:`text`,rect:{x:64,y:130,w:568,h:24},text:``}),{width:C,height:w,items:e}}var A=[64,208,352,496].map(e=>({x:e,y:166,w:136,h:30})),j=(e,t,n,r,i)=>e.has(t)?{type:`set`,id:t,patch:{text:r,tone:i},pop:!0}:{type:`add`,item:{id:t,kind:`token`,rect:A[n],tone:i,text:r}},M=e=>({type:`set`,id:`calc`,patch:{text:e}}),N=(e,t)=>({type:`set`,id:T(e),patch:t}),P=()=>o(d.map((e,t)=>({type:`set`,id:`cost:${t}`,patch:{text:String(e),tone:e?`plain`:`muted`},pop:!0}))),F=(e,t,n={})=>t.flatMap((t,r)=>{let i=e.get(T(r)),a=n[r]??``;return i.tone===t&&(i.tag??``)===a?[]:[N(r,{tone:t,tag:a})]}),I=(e,n)=>{let r=t(S(0,n),5);return e.has(`ring`)?{type:`set`,id:`ring`,patch:{rect:r}}:{type:`add`,item:{id:`ring`,kind:`ring`,rect:r}}};function L(e,t,n,r){e.step({title:t,codeHighlights:n,...r}),e.phase(`위아래 세기`,`알파벳은 A와 Z가 이어진 고리라서, 글자마다 위로 올리는 쪽과 아래로 내리는 쪽 중 짧은 쪽을 고릅니다. J는 위로 9번, Z는 아래로 1번입니다.`),e.do(...P()),e.phase(`합하기`,`위아래 횟수는 커서 이동과 상관없이 정해지므로 모두 더해 둡니다. ${d.filter(Boolean).join(` + `)} = ${f}번입니다.`),e.do(j(e,`tok:updown`,0,`위아래 합 ${f}`,`chosen`))}var R=e=>{let t=e+1;for(;t<l&&c[t]===`A`;)t++;let n=2*e+l-t,r=2*(l-t)+e;return{i:e,nxt:t,right:n,left:r,cost:Math.min(n,r)}},[z,B]=[10,10];for(let e=0;e<l;e++){let{cost:t}=R(e);t<z&&([z,B]=[t,e])}var V=f+z,H=[];for(let e=0;e<l;e++){if(c[e]!==`A`)continue;let t=e;for(;t+1<l&&c[t+1]===`A`;)t++;t-e>=2&&H.push([e,t]),e=t}var U=(e,t)=>Array.from({length:l},(n,r)=>r<=e?`chosen`:r<t?`explored`:`current`);function W(){let e=new s(k()),t=0,n=-1,r=-1,i=0,c=()=>({work:i,variables:{updown:f,i:n<0?`-`:n,nxt:r<0?`-`:r,move:t||`-`}});L(e,`글자마다 위아래 횟수 구하기: 합 ${f}`,g.costs,c()),t=10,e.step({title:`기준 경로: 오른쪽으로 끝까지 ${t}칸`,codeHighlights:g.base,...c()}),e.phase(`기준 정하기`,`이제 커서 이동입니다. 가장 단순한 경로는 오른쪽으로 끝까지 가는 것이고 n − 1 = ${t}칸입니다. 이 값을 기준으로 삼습니다.`),e.do(...o([...F(e,Array(l).fill(`chosen`)),M(`오른쪽으로만 끝까지 n − 1 = ${t}칸`)])),e.do(j(e,`tok:move`,1,`최소 이동 ${t}칸`,`chosen`));let u=e=>{let a=R(e),o=t;return[n,r]=[e,a.nxt],i++,a.cost<t&&(t=a.cost),{...a,gap:a.nxt-e-1,was:o,improved:a.cost<o}},d=n=>{let r=u(n);e.step({title:`i = ${n}에서 돌아서기 → ${r.cost}칸${r.improved?`, 최소 갱신`:``}`,codeHighlights:g.pick,...c()}),e.phase(`구간 정하기`,r.nxt>=l?`${n}번 칸에서 돌아섭니다. 오른쪽에 글자가 더 없어 nxt = ${l}이고, 왼쪽으로 갈 구간은 없습니다.`:r.gap?`${n}번 칸에서 돌아섭니다. 이어지는 A ${r.gap}칸을 건너뛰면 다음 글자는 ${r.nxt}번 칸입니다.`:`${n}번 칸에서 돌아섭니다. 바로 옆 ${r.nxt}번 칸이 A가 아니라 건너뛸 칸이 없습니다.`,g.skip),e.do(...o([...F(e,U(n,r.nxt),{[n]:`i`,...r.nxt<l?{[r.nxt]:`nxt`}:{}}),M(``)])),r.nxt<l&&(e.do({type:`focus`,ids:Array.from({length:r.nxt-n+1},(e,t)=>T(n+t))}),e.do({type:`arrow`,from:T(n),to:T(r.nxt),verdict:`good`,label:r.gap?`A ${r.gap}칸 건너뜀`:`바로 옆`},E(100)),e.do(...D()));let i=r.improved?`지금까지 최소 ${r.was}칸보다 짧아 ${r.cost}칸으로 줄입니다.`:r.cost===r.was?`지금까지 최소와 같은 ${r.was}칸이라 그대로 둡니다.`:`지금까지 최소 ${r.was}칸보다 길어 그대로 둡니다.`;e.phase(`최소 이동 고르기`,`오른쪽 먼저면 ${r.right}칸, 왼쪽 먼저면 ${r.left}칸이라 후보는 ${r.cost}칸입니다. ${i}`,g.pick),e.do(M(`오른쪽 먼저 2×${n} + ${l-r.nxt} = ${r.right}칸 · 왼쪽 먼저 2×${l-r.nxt} + ${n} = ${r.left}칸`)),r.improved&&e.do(j(e,`tok:move`,1,`최소 이동 ${t}칸`,`good`))};for(let n=0;n<l;){let i=H.find(([e])=>e===n);if(!i){d(n),n++;continue}let[s,l]=i,f=Array.from({length:l-s+1},(e,t)=>{let n=u(s+t);if(n.improved)throw Error(`빨리 감기 구간에서 최소가 바뀌면 단계를 나눠야 합니다`);return n.cost});e.step({title:`i = ${s}~${l} 빨리 감기: ${f.join(`, `)}칸`,codeHighlights:g.skip,...c()}),e.phase(`빨리 감기`,`i = ${a(`${s}~${l}`,`은`,`는`)} 모두 A 위에서 돌아서는 경우입니다. 오른쪽 구간만 길어져 ${f.join(`, `)}칸으로 늘기만 하고, ${t}칸보다 짧은 값은 없습니다.`),e.do(...o([...F(e,U(l,r),{[l]:`i`,[r]:`nxt`}),M(`i = ${s}~${l}: ${f.join(`, `)}칸 (모두 ${t}칸보다 큼)`)])),n=l+1}let p=R(B);return e.step({title:`위아래 ${f} + 이동 ${t} = ${V}번`,codeHighlights:g.done,...c(),answer:V,isKeyframe:!0}),e.phase(`정답`,`모든 돌아서는 칸을 확인했습니다. ${B}번 칸에서 돌아서는 경로가 ${t}칸으로 가장 짧습니다. 위아래 ${f}번과 더해 ${V}번이 답입니다.`),e.do(...o([...F(e,U(B,p.nxt).map(e=>e===`explored`?`explored`:`path`),{[B]:`i`,[p.nxt]:`nxt`}),M(`위아래 ${f} + 이동 ${t} = ${V}번`)])),e.do(j(e,`tok:total`,2,`합계 ${V}번`,`path`)),e.finish()}var G=[];{let e=0,t=(n,r,i)=>{if(e++,!r.length){G.push({legs:i,calls:e});return}let a=Math.min(...r.map(e=>(e-n+l)%l)),o=Math.min(...r.map(e=>(n-e+l)%l)),[s,c]=[(n+a)%l,(n-o+l)%l];t(s,r.filter(e=>e!==s),[...i,{dir:`R`,to:s,dist:a}]),t(c,r.filter(e=>e!==c),[...i,{dir:`L`,to:c,dist:o}])};t(0,p,[])}var K=(e,t)=>t?e[t-1].to:0,q=(e,t)=>e.slice(0,t).map(e=>e.dist),J=e=>i(e.map(e=>e.dist)),Y=e=>Array.from({length:l},(t,n)=>e.includes(n)?`visited`:p.includes(n)?`queued`:`plain`);function X(){let e=new s(k()),t=!1,r=0,[a,c,u]=[0,0,0],d=()=>({work:u,variables:{updown:f,pos:t?a:`-`,move:t?c:`-`,best:r||`-`}});L(e,`글자마다 위아래 횟수 구하기: 합 ${f}`,v.costs,d()),t=!0,u=1,e.step({title:`0번 칸에서 시작: 바꿀 글자 ${m(p)}`,codeHighlights:v.start,...d()}),e.phase(`시작`,`커서는 0번 칸에서 시작하고, 이동으로 만나야 할 글자는 ${p.join(`, `)}번 칸입니다. dfs는 지금 칸에서 오른쪽·왼쪽으로 가장 가까운 글자로 가는 두 갈래를 모두 따라갑니다.`),e.do(...o([I(e,0),...F(e,Y([]))]));let h;G.forEach((t,s)=>{let{legs:l}=t,f=J(l),p=h?l.findIndex((e,t)=>e.dir!==h.legs[t].dir||e.to!==h.legs[t].to):0,m=!r||f<r,g=r;if([a,c,u]=[l.at(-1).to,f,t.calls],m&&(r=f),e.step({title:`경로 ${s+1}: ${l.map(e=>O(e.dir)).join(` → `)} = ${f}칸`,codeHighlights:v.leaf,...d()}),h){let t=K(l,p);e.phase(`되돌아가기`,p?`앞 경로와 ${p}번째 갈래까지 같습니다. ${t}번 칸으로 되돌아가 다른 갈래를 따라갑니다.`:`처음 칸으로 되돌아가 첫 갈래부터 다시 따라갑니다.`,v.back),e.do(...o([I(e,t),...F(e,Y(l.slice(0,p).map(e=>e.to))),M(p?`${q(l,p).join(` + `)} = ${i(q(l,p))}칸`:``)]))}let _=h?p:0,y=l.slice(_);e.phase(`갈래 따라가기`,`${y.map(e=>`${e.to}번 칸(${O(e.dir)} ${e.dist}칸)`).join(` → `)}으로 갑니다.`,x(...y.map(e=>e.dir===`R`?v.right:v.left))),y.forEach((t,n)=>{let r=_+n+1;e.do(...o([I(e,t.to),N(t.to,{tone:`visited`}),M(`${q(l,r).join(` + `)} = ${i(q(l,r))}칸`)]))}),e.phase(`기록하기`,`모든 글자를 만났습니다. 이 경로는 ${f}칸입니다. ${m?g?`지금까지 최소 ${g}칸보다 짧아 best를 ${n(f)} 줄입니다.`:`첫 경로라 best = ${f}입니다.`:g===f?`지금까지 최소와 같은 ${g}칸이라 best는 그대로입니다.`:`지금까지 최소 ${g}칸보다 길어 best는 그대로입니다.`}`,v.leaf),e.do(j(e,`tok:move`,1,`최소 이동 ${r}칸`,m?`good`:`chosen`)),h=t});let g=G.find(e=>J(e.legs)===r);return a=g.legs.at(-1).to,c=r,e.step({title:`위아래 ${f} + 최소 이동 ${r} = ${f+r}번`,codeHighlights:v.done,...d(),answer:f+r,isKeyframe:!0}),e.phase(`정답`,`갈래 ${G.length}가지를 모두 따라가 보았습니다(dfs ${u}번 호출). 가장 짧은 경로는 ${g.legs.map(e=>`${O(e.dir)} ${e.dist}칸`).join(` → `)}의 ${r}칸이고, 위아래 ${f}번과 더해 ${f+r}번입니다.`),e.do(...o([I(e,a),...F(e,Array.from({length:l},(e,t)=>g.legs.some(e=>e.to===t)?`path`:`plain`)),M(`위아래 ${f} + 이동 ${r} = ${f+r}번`)])),e.do(j(e,`tok:total`,2,`합계 ${f+r}번`,`path`)),e.finish()}function Z(){let e=new s(k()),t=new Set(p),n=!1,[r,i,a]=[0,0,0],c=()=>({work:a,variables:{updown:f,pos:n?r:`-`,move:n?i:`-`,todo:n?`{${[...t].join(`, `)}}`:`-`}});for(L(e,`글자마다 위아래 횟수 구하기: 합 ${f}`,b.costs,c()),n=!0,e.step({title:`0번 칸에서 시작: 바꿀 글자 ${m(p)}`,codeHighlights:b.start,...c()}),e.phase(`시작`,`커서는 0번 칸에서 시작하고, 이동으로 만나야 할 글자는 ${p.join(`, `)}번 칸입니다. 매번 가장 가까운 글자로 가 보겠습니다.`),e.do(...o([I(e,0),...F(e,Y([]))]));t.size;){let n=(e,t)=>(t-e+l)%l,s=[...t].reduce((e,t)=>n(r,t)<n(r,e)?t:e),u=[...t].reduce((e,t)=>n(t,r)<n(e,r)?t:e),[d,f]=[n(r,s),n(u,r)],p=d<=f,[m,h]=p?[s,d]:[u,f],g=r;a++,t.delete(m),[r,i]=[m,i+h];let _=O(p?`R`:`L`);e.step({title:`${g}번 칸에서 ${_} ${m}번 칸으로 ${h}칸`,codeHighlights:p?b.right:b.left,...c()}),e.phase(`가까운 글자 찾기`,s===u?`남은 글자는 ${m}번 칸뿐입니다. 오른쪽으로 ${d}칸, 왼쪽으로 ${f}칸이라 ${_}이 더 가깝습니다.`:`${g}번 칸에서 오른쪽으로 가장 가까운 글자는 ${d}칸, 왼쪽은 ${f}칸 거리입니다. ${d===f?`같으면 오른쪽으로 갑니다.`:`${_}이 더 가깝습니다.`}`,b.look),e.do({type:`focus`,ids:[T(g),...new Set([T(s),T(u)])]}),s===u?e.do({type:`arrow`,from:T(g),to:T(m),verdict:`good`,label:`${_} ${h}칸`},E(100)):(e.do({type:`arrow`,from:T(g),to:T(s),verdict:p?`good`:`seen`,label:`오른쪽 ${d}칸`}),e.do({type:`arrow`,from:T(g),to:T(u),verdict:p?`seen`:`good`,label:`왼쪽 ${f}칸`},E(100))),e.phase(`가까운 쪽으로 가기`,`${_}으로 ${h}칸 가서 ${m}번 칸에 닿습니다. 지금까지 이동은 ${i}칸입니다.`,p?b.right:b.left),e.do(...D()),e.do(...o([I(e,m),N(m,{tone:`visited`}),M(`이동 ${i}칸`)])),e.do(j(e,`tok:move`,1,`이동 ${i}칸`,`chosen`))}let u=f+i,d=p.at(-1);return e.step({title:`위아래 ${f} + 이동 ${i} = ${u}번, 정답은 ${V}번`,codeHighlights:b.done,...c(),answer:u,isKeyframe:!0}),e.phase(`오답 확인`,`이 방법의 답은 ${f} + ${i} = ${u}번이지만 정답은 ${V}번입니다. 가까운 글자를 차례로 가는 동안 ${d}번 칸이 점점 멀어졌습니다. 처음에 왼쪽으로 ${d}번 칸을 먼저 들렀다 오면 이동이 ${z}칸으로 줄어듭니다.`),e.do(j(e,`tok:total`,2,`이 방법 ${u}번`,`bad`)),e.do(j(e,`tok:truth`,3,`정답 ${V}번`,`good`)),e.finish()}var Q={id:`joystick`,title:`조이스틱`,level:2,category:`greedy`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42860`,description:{summary:`처음에는 모든 칸이 A인 이름을 조이스틱으로 목표 이름으로 바꿉니다. 위·아래로 현재 칸의 알파벳을 다음·이전 글자로 바꾸고, 왼쪽·오른쪽으로 커서를 옮길 수 있습니다. 알파벳은 A와 Z가 이어져 있고, 커서도 맨 앞에서 왼쪽으로 가면 맨 뒤 칸으로 갑니다. 이름을 만드는 조작 횟수의 최솟값을 구합니다.`,rules:[`name은 알파벳 대문자로만 이루어져 있고, 길이는 1 이상 20 이하`,`커서는 처음에 맨 앞 칸(0번)에 있음`,`위·아래: 현재 칸의 글자를 다음·이전 알파벳으로 바꿈(A에서 아래로 가면 Z, Z에서 위로 가면 A)`,`왼쪽·오른쪽: 커서를 한 칸 옮김(맨 앞에서 왼쪽이면 맨 뒤 칸, 맨 뒤에서 오른쪽이면 맨 앞 칸)`],examples:[{input:`name = "JEROEN"`,output:`56`},{input:`name = "JAN"`,output:`23`}]},keyIntuitions:[`위아래 조작은 글자마다 독립입니다. 글자 하나를 바꾸는 최소 횟수는 min(글자 − A, Z − 글자 + 1)이고, 전체 합은 커서를 어떻게 움직이든 같습니다.`,`남는 문제는 A가 아닌 글자를 모두 만나는 가장 짧은 커서 경로입니다. 경로는 "오른쪽으로 i칸 갔다 돌아와 왼쪽으로 가기" 또는 그 반대 순서의 꼴로 줄어듭니다.`,`돌아서는 칸 i마다 이어지는 A를 건너뛴 다음 글자(nxt)를 찾아 두 순서의 이동 횟수를 비교합니다. 가까운 글자부터 가는 방법은 가까운 쪽을 먼저 갔다가 멀리 돌아와야 해서 최단이 아닐 수 있습니다.`],demo:{input:[c],label:`name = "JEANAAAAAZA"`},workUnit:`따져 본 경우의 수`,approaches:[{id:`joystick-turn`,name:`위아래 합 + 돌아서는 칸마다 좌우 이동 최소`,rank:`BEST`,timeComplexity:`O(N²)`,spaceComplexity:`O(1)`,verdict:`위아래는 글자마다 따로 더하고, 좌우는 돌아서는 칸마다 짧은 경로를 골라 반복문 하나로 끝내는 풀이입니다.`,pros:[`글자의 위아래 횟수와 커서 이동이 서로 영향을 주지 않는다는 점을 써서 두 문제로 나눕니다.`,`A 구간을 통째로 건너뛰는 식 하나로 모든 경로를 빠짐없이 확인합니다.`,`N이 20 이하라 계산이 순식간에 끝납니다.`],cons:[`"오른쪽으로 갔다 돌아오기"와 "왼쪽 먼저"를 둘 다 비교해야 하고, 식 2i + n − nxt가 낯설어 실수하기 쉽습니다.`],whyThisRank:`이동 경로는 돌아서는 칸 하나로 정해지므로 후보가 N개뿐입니다. 후보마다 두 순서의 이동 횟수를 식으로 바로 구해, 경로를 직접 따라가 볼 필요가 없습니다.`,code:h,visualize:W},{id:`joystick-branch`,name:`왼쪽·오른쪽 두 갈래 재귀 (완전탐색)`,rank:`ALTERNATIVE`,timeComplexity:`O(2^K × K)`,spaceComplexity:`O(K)`,verdict:`다음에 만날 글자를 왼쪽·오른쪽 두 갈래로 모두 따라가 가장 짧은 경로를 찾는, 맞지만 갈래가 두 배씩 늘어나는 풀이입니다.`,pros:[`모든 갈래를 따라가 보므로 경로 모양에 대한 가정이 필요 없어 확실하게 맞습니다.`,`이동 비용이 칸마다 다른 문제로 바꿔도 그대로 쓸 수 있습니다.`],cons:[`A가 아닌 글자가 K개이면 갈래가 2^K가지입니다. K가 19면 50만 가지가 넘어 Python은 눈에 띄게 느려집니다.`,`재귀와 집합 연산이 들어가 코드가 정석보다 깁니다.`],whyThisRank:`정석이 N번의 계산으로 끝내는 일을 2^K가지 경로로 확인합니다. 글자가 적을 때는 충분하지만 최대 길이에서는 필요 이상으로 많은 경로를 봅니다.`,code:_,visualize:X},{id:`joystick-nearest`,name:`가장 가까운 글자부터 가기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(K²)`,spaceComplexity:`O(K)`,verdict:`지금 커서에서 가장 가까운 글자로 계속 가는 그리디인데, 어떤 이름에서는 정답보다 길게 돌게 됩니다.`,pros:[`코드가 직관적이고, 예제 두 개는 우연히 통과합니다.`],cons:[`가까운 글자를 먼저 가면 반대쪽에 남은 글자까지 돌아오는 길이 길어질 수 있어, 정답보다 큰 값이 나옵니다.`,`왼쪽과 오른쪽이 똑같이 가까울 때 어느 쪽을 고르든 틀리는 입력도 있습니다.`],whyThisRank:`지금 한 걸음이 가장 짧다고 전체 경로가 가장 짧지는 않습니다. 이 문제의 안전한 선택은 "돌아서는 칸"을 정한 뒤 양쪽 구간을 한꺼번에 계산하는 것입니다.`,code:y,visualize:Z}],checks:{cases:[{args:[`JEROEN`],expected:56},{args:[`JAN`],expected:23},{args:[`A`],expected:0},{args:[`AAAAZ`],expected:2},{args:[`BBBBAAAABA`],expected:12},{args:[c],expected:34}],random:e=>{let t=1+Math.floor(e()*8);return[Array.from({length:t},()=>e()<.5?`A`:String.fromCharCode(65+Math.floor(e()*26))).join(``)]}}};export{Q as default};