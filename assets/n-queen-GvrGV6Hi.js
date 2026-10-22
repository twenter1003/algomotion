import{t as e}from"./layout-DFaYBMY_.js";import{c as t,i as n,r,s as i}from"./shared-e6uNbDLo.js";import{a,c as o,n as s,o as c,r as l,s as u}from"./common-DSYBffMW.js";var d=4,f=e=>`{${e.join(`, `)}}`,p=e=>`[${e.join(`, `)}]`,m=(e,t,n)=>{for(let r=0;r<Math.min(e.length,t);r++){if(e[r]===n)return{row:r,kind:`열`};if(Math.abs(e[r]-n)===t-r)return{row:r,kind:`대각`}}return null},h=[],g=[],_=0;{let e=[],t=0,n=e=>{h.push({...e,carry:t,solved:!1}),_+=t+e.skips.length+ +(e.kind===`place`),t=0},r=i=>{if(i===d){h.at(-1).solved=!0,g.push([...e]);return}let a=[],o=!1;for(let t=0;t<d;t++){let s=m(e,i,t);s?a.push({col:t,by:s}):(o=!0,n({kind:`place`,row:i,before:[...e],col:t,skips:a}),a=[],e.push(t),r(i+1),e.pop())}o?t+=a.length:n({kind:`dead`,row:i,before:[...e],col:-1,skips:a})};r(0),_+=t}var v=e=>e.kind===`place`?[...e.before,e.col]:e.before,y=_-h.reduce((e,t)=>e+t.carry+t.skips.length+ +(t.kind===`place`),0),b=[];{let e=t=>{if(t.length===d)b.push(t);else for(let n=0;n<d;n++)t.includes(n)||e([...t,n])};e([])}var x=(e,t)=>{let n=0;for(let r=0;r<d;r++)for(let i=r+1;i<d;i++){n++;let a=e[i]-e[r];if(t?a===i-r:Math.abs(a)===i-r)return{pair:[r,i],compares:n}}return{compares:n}},S=b.map(e=>!x(e,!1).pair),C=b.map(e=>!x(e,!0).pair),w=S.filter(Boolean).length,T=C.filter(Boolean).length,E=b.reduce((e,t)=>e+x(t,!1).compares,0),D={python:`def solution(n):
    count = 0
    cols, diag1, diag2 = set(), set(), set()  # 퀸이 차지한 열, ↘ 대각선(줄 - 열), ↙ 대각선(줄 + 열)

    def place(row):
        nonlocal count
        if row == n:
            count += 1  # n줄을 모두 채웠으니 방법 하나를 찾았습니다
            return
        for col in range(n):
            if col in cols or row - col in diag1 or row + col in diag2:
                continue  # 열이나 대각선이 겹치면 이 칸은 건너뜁니다
            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            place(row + 1)
            cols.remove(col)  # 되돌아와서 같은 줄의 다음 열을 시도합니다
            diag1.remove(row - col)
            diag2.remove(row + col)

    place(0)
    return count`,javascript:`function solution(n) {
  let count = 0;
  const cols = new Set(), diag1 = new Set(), diag2 = new Set(); // 퀸이 차지한 열, ↘ 대각선(줄 - 열), ↙ 대각선(줄 + 열)

  const place = (row) => {
    if (row === n) {
      count++; // n줄을 모두 채웠으니 방법 하나를 찾았습니다
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue; // 열이나 대각선이 겹치면 이 칸은 건너뜁니다
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);
      place(row + 1);
      cols.delete(col); // 되돌아와서 같은 줄의 다음 열을 시도합니다
      diag1.delete(row - col);
      diag2.delete(row + col);
    }
  };

  place(0);
  return count;
}`},O={start:n(D,[`count = 0`,`cols, diag1, diag2 = set()`,`place(0)`],[`let count = 0`,`const cols = new Set()`,`place(0)`]),check:n(D,[`for col in range(n):`,`if col in cols or row - col in diag1`],[`for (let col = 0; col < n; col++)`,`if (cols.has(col) || diag1.has(row - col)`]),skip:n(D,[`for col in range(n):`,`if col in cols or row - col in diag1`,`continue`],[`for (let col = 0; col < n; col++)`,`if (cols.has(col) || diag1.has(row - col)`]),put:n(D,[`cols.add(col)`,`diag1.add(row - col)`,`diag2.add(row + col)`,`place(row + 1)`],[`cols.add(col)`,`diag1.add(row - col)`,`diag2.add(row + col)`,`place(row + 1)`]),found:n(D,[`cols.add(col)`,`place(row + 1)`,`if row == n:`,`count += 1`],[`cols.add(col)`,`place(row + 1)`,`if (row === n)`,`count++`]),dead:n(D,[`for col in range(n):`,`continue`],[`for (let col = 0; col < n; col++)`,`continue`]),back:n(D,[`cols.remove(col)`,`diag1.remove(row - col)`,`diag2.remove(row + col)`],[`cols.delete(col)`,`diag1.delete(row - col)`,`diag2.delete(row + col)`]),done:n(D,[`place(0)`,`return count`],[`place(0)`,`return count`])},k={python:`from itertools import permutations

def solution(n):
    count = 0
    for cols in permutations(range(n)):  # 줄마다 퀸 하나, 열은 겹치지 않는 모든 배치
        # 다 놓은 뒤에야 줄 i, j의 퀸이 대각선에 놓였는지 검사합니다
        if all(abs(cols[i] - cols[j]) != j - i for i in range(n) for j in range(i + 1, n)):
            count += 1
    return count`,javascript:`function solution(n) {
  let count = 0;
  // 줄마다 퀸 하나, 열은 겹치지 않는 모든 배치를 만듭니다
  const build = (cols) => {
    if (cols.length === n) {
      // 다 놓은 뒤에야 줄 i, j의 퀸이 대각선에 놓였는지 검사합니다
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(cols[i] - cols[j]) === j - i) return;
        }
      }
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (!cols.includes(c)) build([...cols, c]);
    }
  };

  build([]);
  return count;
}`},A={start:n(k,[`count = 0`,`for cols in permutations(range(n))`],[`let count = 0`,`build([])`]),make:n(k,[`for cols in permutations(range(n))`],[`const build = (cols) => {`,`if (!cols.includes(c)) build([...cols, c])`]),test:n(k,[`if all(abs(cols[i] - cols[j]) != j - i`],[`for (let i = 0; i < n; i++)`,`if (Math.abs(cols[i] - cols[j]) === j - i) return`]),hit:n(k,[`if all(abs(cols[i] - cols[j]) != j - i`],[`if (Math.abs(cols[i] - cols[j]) === j - i) return`]),pass:n(k,[`if all(abs(cols[i] - cols[j]) != j - i`,`count += 1`],[`if (Math.abs(cols[i] - cols[j]) === j - i) return`,`count++`]),done:n(k,[`return count`],[`build([])`,`return count`])},j={python:`from itertools import permutations

# 주의: ↘ 대각선만 검사하고 ↙ 대각선을 빠뜨린 오답 풀이입니다
def solution(n):
    count = 0
    for cols in permutations(range(n)):  # 줄마다 퀸 하나, 열은 겹치지 않는 모든 배치
        if all(cols[j] - cols[i] != j - i for i in range(n) for j in range(i + 1, n)):  # ↘ 방향만 봅니다
            count += 1
    return count`,javascript:`// 주의: ↘ 대각선만 검사하고 ↙ 대각선을 빠뜨린 오답 풀이입니다
function solution(n) {
  let count = 0;
  // 줄마다 퀸 하나, 열은 겹치지 않는 모든 배치를 만듭니다
  const build = (cols) => {
    if (cols.length === n) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (cols[j] - cols[i] === j - i) return; // ↘ 방향만 봅니다
        }
      }
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (!cols.includes(c)) build([...cols, c]);
    }
  };

  build([]);
  return count;
}`},M={start:n(j,[`count = 0`,`for cols in permutations(range(n))`],[`let count = 0`,`build([])`]),make:n(j,[`for cols in permutations(range(n))`],[`const build = (cols) => {`,`if (!cols.includes(c)) build([...cols, c])`]),test:n(j,[`if all(cols[j] - cols[i] != j - i`],[`for (let i = 0; i < n; i++)`,`if (cols[j] - cols[i] === j - i) return`]),hit:n(j,[`if all(cols[j] - cols[i] != j - i`],[`if (cols[j] - cols[i] === j - i) return`]),pass:n(j,[`if all(cols[j] - cols[i] != j - i`,`count += 1`],[`if (cols[j] - cols[i] === j - i) return`,`count++`]),done:n(j,[`return count`],[`build([])`,`return count`])},N=420,P=316,F=(e,t)=>`b:${e}:${t}`,I=(e,t)=>({x:34+t*60,y:36+e*60,w:54,h:54}),L=t=>e({x:34,y:36+t*60,w:234,h:54},4),R=(e,t,n,r)=>({id:e,kind:`token`,rect:{x:282,y:t,w:128,h:30},tone:r,text:n}),z=e=>({x:282,y:164+e*24,w:128,h:22});function B(e,t){let n=[{id:`title`,kind:`text`,rect:{x:12,y:0,w:396,h:16},tone:`muted`,text:e}];for(let e=0;e<d;e++){n.push({id:`cl:${e}`,kind:`text`,rect:{x:34+e*60,y:19,w:54,h:14},tone:`muted`,text:`열 ${e}`}),n.push({id:`rl:${e}`,kind:`text`,rect:{x:2,y:36+e*60,w:30,h:54},tone:`muted`,text:`${e}줄`});for(let t=0;t<d;t++)n.push({id:F(e,t),kind:`cell`,rect:I(e,t),tone:`plain`,text:``})}return n.push(R(`t:count`,40,t,`chosen`),R(`t:state`,80,`시작 전`,`plain`),R(`t:tries`,120,`확인 0번`,`plain`),{id:`calc`,kind:`text`,rect:{x:12,y:280,w:396,h:26},text:``}),{width:N,height:P,items:n}}var V=e=>c(`calc`,{text:e}),H=(e,t,n,r)=>r&&r[0]===t&&r[1]===n?{tone:`queued`,text:`?`}:t<e.length?e[t]===n?{tone:`visited`,text:`♛`}:{tone:`plain`,text:``}:m(e,t,n)?{tone:`wall`,text:``}:{tone:`plain`,text:``},U=(e,t,n,r)=>[...Array(d).keys()].flatMap(i=>[...Array(d).keys()].flatMap(a=>{let o=H(t,i,a,n),s=e.get(F(i,a));return s.tone===o.tone&&(s.text??``)===o.text?[]:[c(F(i,a),o,!!r&&r[0]===i&&r[1]===a)]})),W=(e,t)=>({id:`sol:${e}`,kind:`text`,rect:z(e),text:`방법 ${e+1}: ${t.join(` `)}`});function G(){let e=new t(B(`${d} × ${d} 판에 퀸 ${d}개 · 빗금 칸은 퀸이 공격하는 칸`,`찾은 방법 0개`)),n=[],u=0,p=0,m=()=>({work:p,variables:{row:n.length,cols:f(n),diag1:f(n.map((e,t)=>t-e)),diag2:f(n.map((e,t)=>t+e)),count:u}});e.step({title:`place(0)에서 시작`,codeHighlights:O.start,...m()}),e.phase(`시작`,`${d} × ${d} 판에 퀸 ${d}개를 서로 공격하지 못하게 놓는 방법을 셉니다. 윗줄부터 한 줄에 하나씩 놓고, 같은 열이나 대각선에 퀸이 있는 칸은 건너뜁니다. 놓을 칸이 없으면 윗줄 퀸을 옮깁니다.`,O.start),e.do(a(e,L(0)),c(`t:state`,{text:`0줄 놓는 중`},!0)),h.forEach((t,l)=>{let f=(l?v(h[l-1]):[]).length-t.before.length,g=v(t),_=t.kind===`place`,y=t.row;p+=t.carry+t.skips.length+ +!!_,n=g,t.solved&&u++,e.step({title:_?`${y}줄 ${t.col}열에 퀸${t.solved?` · ${u}번째 방법`:``}`:`${y}줄: 놓을 칸 없음 (막다른 길)`,codeHighlights:_?t.solved?O.found:O.put:O.dead,...m()}),f>0&&(e.phase(`되돌아가기`,`퀸 ${f}개를 지우고 ${y}줄로 돌아갑니다. 지운 퀸의 열과 대각선 기록도 함께 지우고, 같은 줄의 다음 열을 봅니다.`,O.back),e.do(...i([...U(e,t.before),a(e,L(y)),c(`t:state`,{text:`${y}줄 놓는 중`,tone:`plain`}),c(`t:tries`,{text:`확인 ${p-t.skips.length-+!!_}번`})])));let b=t.skips.map(e=>`${e.col}열은 ${e.by.kind===`열`?`같은 열`:`대각선`}`).join(`, `),x=_?[y,t.col]:void 0;e.phase(`확인하기`,_?t.skips.length?`${y}줄: ${b}이라 건너뛰고, ${t.col}열은 안전합니다.`:y?`${y}줄: ${t.col}열은 앞의 퀸과 열도 대각선도 겹치지 않아 안전합니다.`:`0줄: 아직 놓은 퀸이 없어 ${t.col}열이 안전합니다.`:`${y}줄: ${b}이라 건너뜁니다. ${d}칸이 모두 막혔습니다.`,t.skips.length?O.skip:O.check);let S=[...new Set(t.skips.map(e=>F(e.by.row,t.before[e.by.row])))];e.do({type:`focus`,ids:[...t.skips.map(e=>F(y,e.col)),...x?[F(y,t.col)]:[],...S]}),t.skips.length&&e.do(...i(t.skips.map(e=>({type:`arrow`,from:F(e.by.row,t.before[e.by.row]),to:F(y,e.col),verdict:`bad`,label:e.by.kind})))),x&&e.do(c(F(y,t.col),{tone:`queued`,text:`?`})),e.do(o(150)),_?(e.phase(`놓기`,`${y}줄 ${t.col}열에 퀸을 놓고, 열 ${r(t.col,`과`,`와`)} 대각선 ${y-t.col}, ${r(y+t.col,`을`,`를`)} 기록합니다. ${t.solved?`${d}줄을 모두 채웠습니다! ${u}번째 방법을 찾았습니다.`:`${g.length}줄로 내려갑니다.`}`,t.solved?O.found:O.put),e.do(...s()),e.do(...i([...U(e,g,void 0,[y,t.col]),...t.solved?[]:[a(e,L(g.length))],V(`열 ${t.col} · ↘ ${y-t.col} · ↙ ${y+t.col}`)])),e.do(...i([c(`t:tries`,{text:`확인 ${p}번`},!0),c(`t:state`,{text:t.solved?`방법 찾음!`:`${g.length}줄 놓는 중`,tone:t.solved?`good`:`plain`},!0),...t.solved?[c(`t:count`,{text:`찾은 방법 ${u}개`},!0),{type:`add`,item:W(u-1,g)}]:[]]))):(e.phase(`쳐내기`,`놓을 칸이 없는 막다른 길입니다. 이 가지는 여기서 쳐내고, 윗줄 퀸을 다른 열로 옮기러 돌아갑니다.`,O.dead),e.do(...s()),e.do(...i([c(`t:state`,{text:`막다른 길`,tone:`bad`},!0),c(`t:tries`,{text:`확인 ${p}번`},!0),V(`${y}줄은 놓을 칸이 없음`)])))});let g=(h.length?v(h.at(-1)):[]).length;return p+=y,n=[],e.step({title:`방법 ${u}개`,codeHighlights:O.done,...m(),answer:u,isKeyframe:!0}),e.phase(`결과`,`퀸 ${g}개를 지우고 처음으로 돌아와 모든 경우를 살폈습니다. 놓는 방법은 모두 ${u}개이고, 막다른 길을 일찍 쳐내서 칸을 ${p}번만 확인했습니다.`,O.done),e.do(...i([...U(e,[]),{type:`remove`,id:`ring`},c(`t:count`,{tone:`path`},!0),c(`t:tries`,{text:`확인 ${p}번`},!0),c(`t:state`,{text:`끝`,tone:`plain`}),V(`답: ${u}`)])),l(e.finish())}function K(e){let n=e?C:S,r=e?M:A,a=b.findIndex((e,t)=>n[t]&&!!x(e,!1).pair),f=new Set([0,...b.flatMap((t,r)=>n[r]&&(!e||a<0||r<=a)?[r]:[])]),m=new t(B(e?`↘ 대각선만 검사합니다 (↙ 대각선은 보지 않음)`:`열이 겹치지 않는 배치를 모두 만든 뒤 대각선을 검사합니다`,e?`해로 센 배치 0개`:`찾은 방법 0개`)),h,g=0,v=0,y=0,T=()=>({work:y,variables:{cols:h?p(h):`-`,count:v}}),E=t=>e?`해로 센 배치 ${t}개`:`찾은 방법 ${t}개`;m.step({title:`열 배치 ${b.length}가지 만들기`,codeHighlights:r.start,...T()}),m.phase(`시작`,e?`줄마다 퀸 하나를 놓는 열 배치는 ${d}! = ${b.length}가지입니다. 이번에는 ↘ 대각선(줄 − 열이 같은 쪽)만 검사하고 ↙ 대각선은 빠뜨립니다.`:`줄마다 퀸 하나를 놓는 열 배치는 ${d}! = ${b.length}가지입니다. 이 배치를 모두 만들어 하나씩 대각선이 겹치는지 검사합니다.`,r.make),m.do(c(`t:state`,{text:`배치 0 / ${b.length}`},!0),o(300));let D=0;for(;D<b.length;){if(f.has(D)){let t=b[D],a=x(t,e),l=x(t,!1),f=n[D],_=f&&!!l.pair;h=t,g=D+1,y+=a.compares,f&&v++,m.step({title:`${p(t)}: ${f?_?`통과 (잘못!)`:e?`통과, 해로 셈`:`통과, 방법`:`겹침, 탈락`}`,codeHighlights:f?r.pass:r.hit,...T()}),m.phase(`배치하기`,`${D+1}번째 배치 ${p(t)}: ${t.map((e,t)=>`${t}줄 ${e}열`).join(`, `)}에 퀸을 놓습니다.`,r.make),m.do(...i([...(e=>[...Array(d).keys()].flatMap(n=>[...Array(d).keys()].map(r=>c(F(n,r),t[n]===r?{tone:e,text:`♛`}:{tone:`plain`,text:``},t[n]===r))))(`queued`),c(`t:state`,{text:`배치 ${g} / ${b.length}`},!0),V(`열 배치 ${p(t)}`)]));let S=e=>F(e,t[e]);if(a.pair){let[e,n]=a.pair;m.phase(`검사하기`,`줄 ${e}와 줄 ${n}를 비교하면 열 차이 |${t[e]} − ${t[n]}|가 줄 차이 ${n-e}와 같아 대각선에서 만납니다. 겹쳐서 탈락합니다.`,r.hit),m.do({type:`focus`,ids:[S(e),S(n)]}),m.do({type:`arrow`,from:S(e),to:S(n),verdict:`bad`,label:`대각`},o(200)),m.do(...i([...s(),...t.map((t,r)=>u(S(r),r===e||r===n?`bad`:`explored`)),c(`t:tries`,{text:`비교 ${y}번`},!0)]))}else{let e=l.pair;m.phase(`검사하기`,e?`↘ 대각선 비교를 끝까지 해도 겹치지 않아 통과시킵니다. 하지만 줄 ${e[0]}와 줄 ${e[1]}의 퀸은 ↙ 대각선에서 서로 공격합니다. 코드는 이를 보지 못합니다.`:`모든 줄 쌍을 비교해도 대각선이 겹치지 않습니다. 통과해서 방법으로 셉니다. (${a.compares}번 비교)`,r.pass),m.do({type:`focus`,ids:[0,1,2,3].map(S)}),m.do(e?{type:`arrow`,from:S(e[0]),to:S(e[1]),verdict:`bad`,label:`놓침`}:{type:`arrow`,from:S(0),to:S(3),verdict:`good`,label:`충돌 없음`},o(200)),m.do(...i([...s(),...t.map((t,n)=>u(S(n),e?.includes(n)?`bad`:`visited`)),c(`t:count`,{text:E(v)},!0),c(`t:tries`,{text:`비교 ${y}번`},!0)]))}D++;continue}let t=D;for(;t+1<b.length&&!f.has(t+1);)t++;let a=b.slice(D,t+1),l=n.slice(D,t+1).filter(Boolean).length,_=a.reduce((t,n)=>t+x(n,e).compares,0);h=b[t],g=t+1,y+=_,v+=l,m.step({title:`배치 ${D+1}~${t+1}번째 빨리 감기`,codeHighlights:r.test,...T()}),m.phase(`빨리 감기`,`배치 ${D+1}번째부터 ${t+1}번째까지 ${a.length}가지도 같은 방식으로 검사합니다. ${l?`${a.length}가지 중 ${l}가지가 통과해 ${e?`해로 셉니다`:`방법이 늘어납니다`}.`:`모두 대각선이 겹쳐 탈락합니다.`} 비교는 ${_}번입니다.`,r.test),m.do(...i([...[...Array(d).keys()].flatMap(e=>[...Array(d).keys()].map(t=>c(F(e,t),{tone:`plain`,text:``}))),c(`t:state`,{text:`배치 ${g} / ${b.length}`},!0),c(`t:count`,{text:E(v)},!0),c(`t:tries`,{text:`비교 ${y}번`},!0),V(`배치 ${D+1}~${t+1}번째: ${a.length}가지 중 ${l}가지 통과`)])),D=t+1}return h=void 0,m.step({title:e?`${v}개로 셈 — 정답은 ${w}개`:`방법 ${v}개`,codeHighlights:r.done,...T(),answer:v,isKeyframe:!0}),m.phase(e?`비교하기`:`결과`,e?`${v}개라고 답하지만 정답은 ${w}개입니다. ↙ 대각선으로 서로 공격하는 배치를 ${v-w}개 더 통과시켰습니다. 대각선은 (줄 − 열)과 (줄 + 열) 두 방향 모두 검사해야 합니다.`:`배치 ${b.length}가지를 모두 검사해 방법은 ${v}개입니다. 정답은 같지만 앞 두 줄부터 겹쳐도 끝까지 놓은 뒤에 검사해서 비교를 ${y}번이나 했습니다. 정석은 ${_}번이면 됩니다.`,r.done),m.do(...i([...[...Array(d).keys()].flatMap(e=>[...Array(d).keys()].map(t=>c(F(e,t),{tone:`plain`,text:``}))),c(`t:count`,{tone:e?`bad`:`path`},!0),c(`calc`,{text:e?`내 답 ${v}개 ≠ 정답 ${w}개`:`답: ${v}`})])),e&&m.do({type:`add`,item:{id:`t:truth`,kind:`token`,rect:{x:282,y:160,w:128,h:30},tone:`good`,text:`정답 ${w}개`}}),l(m.finish())}var q={id:`n-queen`,title:`N-Queen`,level:2,category:`brute-force`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/12952`,description:{summary:`가로, 세로 길이가 n인 정사각형 체스판에 퀸 n개를 놓으려고 합니다. 퀸은 가로, 세로, 대각선으로 움직일 수 있어서, 어느 두 퀸도 서로 공격하지 못하게 놓아야 합니다. n이 주어질 때 퀸을 놓는 방법이 모두 몇 가지인지 구합니다.`,rules:[`퀸은 가로, 세로, 대각선으로 이동할 수 있음`,`n은 12 이하의 자연수`],examples:[{input:`n = 4`,output:`2`}]},keyIntuitions:[`줄마다 퀸이 정확히 하나씩 있어야 하니, 윗줄부터 한 줄에 하나씩 놓습니다. 놓을 칸은 앞서 놓은 퀸과 같은 열이나 같은 대각선이 아니어야 합니다.`,`대각선은 숫자 두 개로 구분합니다. ↘ 방향은 (줄 − 열)이 같고, ↙ 방향은 (줄 + 열)이 같습니다. 열과 두 대각선을 집합에 적어 두면 겹침을 한 번에 확인합니다.`,`놓을 칸이 없는 막다른 길을 만나면 윗줄 퀸을 지우고 다른 열을 시도합니다(백트래킹). 모든 배치를 만든 뒤 검사하는 것보다 확인할 칸이 훨씬 적습니다.`],demo:{input:[d],label:`n = 4`},workUnit:`충돌을 확인한 횟수`,approaches:[{id:`queen-backtracking`,name:`줄마다 퀸을 놓는 백트래킹`,rank:`BEST`,timeComplexity:`O(n!)`,spaceComplexity:`O(n)`,verdict:`윗줄부터 한 줄에 퀸 하나씩 놓고, 열이나 대각선이 겹치면 그 칸을 건너뛰며, 막다른 길에서는 윗줄 퀸을 옮깁니다.`,pros:[`겹치는 칸은 놓기 전에 걸러서 쓸모없는 배치를 아예 만들지 않습니다.`,`열과 두 대각선을 집합에 적어 두면 겹침 검사가 한 번에 끝납니다.`,`n = 12도 모든 방법을 세는 데 충분히 빠릅니다.`],cons:[`놓고 지우는 코드(add와 remove)를 빠뜨리면 이전 배치가 남아 틀립니다.`,`대각선을 (줄 − 열), (줄 + 열)로 나타내는 요령을 알아야 합니다.`],whyThisRank:`막다른 길을 일찍 버려서 확인할 칸이 가장 적고 코드도 짧습니다. 백트래킹을 배우는 대표 문제이기도 합니다.`,code:D,visualize:G},{id:`queen-permutations`,name:`열 순열을 모두 만든 뒤 대각선 검사`,rank:`ALTERNATIVE`,timeComplexity:`O(n² × n!)`,spaceComplexity:`O(n)`,verdict:`줄마다 열이 겹치지 않는 배치(순열)를 전부 만든 뒤, 하나씩 대각선이 겹치는지 검사해 세는 풀이입니다.`,pros:[`줄과 열 겹침은 순열이라 저절로 피하고, 대각선만 검사하면 되어 개념이 단순합니다.`,`파이썬에서는 itertools.permutations로 짧게 쓸 수 있습니다.`],cons:[`앞 두 줄부터 대각선이 겹쳐도 끝까지 놓은 뒤에야 검사합니다.`,`n이 12면 479,001,600가지를 검사해야 해서 시간 초과가 날 수 있습니다.`],whyThisRank:`답은 정석과 같지만 가지치기가 없습니다. n = 4에서 정석은 ${_}번 확인하면 되는데 이 풀이는 배치 ${b.length}가지를 모두 검사해 ${E}번 비교합니다. n이 커질수록 차이가 폭발합니다.`,code:k,visualize:()=>K(!1)},{id:`queen-one-diagonal`,name:`대각선을 한 방향만 검사`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(n² × n!)`,spaceComplexity:`O(n)`,verdict:`↘ 대각선만 검사하고 ↙ 대각선을 빠뜨려, 서로 공격하는 배치까지 해로 세는 오답 풀이입니다.`,pros:[`코드 모양이 대안과 거의 같아 그럴듯해 보입니다.`],cons:[`n = 4에서 해를 ${T}개로 세지만 정답은 ${w}개입니다. 퀸이 ↙ 방향으로 마주 보는 배치를 통과시킵니다.`,`n = 1처럼 대각선이 아예 없는 입력은 맞아서 틀린 줄 알아채기 어렵습니다.`],whyThisRank:`대각선은 두 방향입니다. (줄 − 열)이 같은 ↘ 방향만 보면 (줄 + 열)이 같은 ↙ 방향으로 공격하는 퀸을 놓칩니다. 두 방향을 모두 검사해야 합니다.`,code:j,visualize:()=>K(!0)}],checks:{cases:[{args:[4],expected:2},{args:[1],expected:1},{args:[2],expected:0},{args:[3],expected:0},{args:[5],expected:10},{args:[6],expected:4},{args:[7],expected:40},{args:[8],expected:92}],random:e=>[1+Math.floor(e()*6)]}};export{q as default};