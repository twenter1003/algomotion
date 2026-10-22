import{o as e}from"./layout-DFaYBMY_.js";import{a as t,c as n,i as r,s as i}from"./shared-e6uNbDLo.js";var a=[`classic`,`pop`,`classic`,`classic`,`pop`,`jazz`],o=[500,600,150,800,2500,900],s=a.length,c=[`classic`,`pop`,`jazz`],l=[4,1,3,0,5],u=e=>`[${e.join(`, `)}]`,d=e=>`{${[...e].map(([e,t])=>`${e}: ${t}`).join(`, `)}}`,f={python:`def solution(genres, plays):
    total = {}
    by_genre = {}
    for i, (g, p) in enumerate(zip(genres, plays)):
        total[g] = total.get(g, 0) + p          # 장르별 총 재생 수
        by_genre.setdefault(g, []).append((p, i))

    order = sorted(total, key=lambda g: -total[g])  # 총 재생 수 내림차순
    answer = []
    for g in order:
        songs = sorted(by_genre[g], key=lambda x: (-x[0], x[1]))
        answer.extend(i for _, i in songs[:2])  # 장르마다 상위 2곡까지
    return answer`,javascript:`function solution(genres, plays) {
  const total = new Map();
  const byGenre = new Map();
  for (let i = 0; i < genres.length; i++) {
    const [g, p] = [genres[i], plays[i]];
    total.set(g, (total.get(g) ?? 0) + p); // 장르별 총 재생 수
    if (!byGenre.has(g)) byGenre.set(g, []);
    byGenre.get(g).push([p, i]);
  }

  const order = [...total.keys()].sort((a, b) => total.get(b) - total.get(a));
  const answer = [];
  for (const g of order) {
    const songs = byGenre.get(g).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (const [, i] of songs.slice(0, 2)) answer.push(i); // 장르마다 상위 2곡까지
  }
  return answer;
}`},p={loop:r(f,[`for i, (g, p) in enumerate`],[`for (let i = 0; i < genres.length; i++)`,`const [g, p] =`]),add:r(f,[`total[g] = total.get(g, 0) + p`,`by_genre.setdefault(g, []).append((p, i))`],[`total.set(g, (total.get(g) ?? 0) + p)`,`if (!byGenre.has(g))`,`byGenre.get(g).push([p, i])`]),order:r(f,[`order = sorted(total, key=lambda g: -total[g])`,`answer = []`],[`const order = [...total.keys()].sort`,`const answer = []`]),pickGenre:r(f,[`for g in order:`],[`for (const g of order)`]),pickSongs:r(f,[`songs = sorted(by_genre[g]`,`answer.extend(i for _, i in songs[:2])`],[`const songs = byGenre.get(g).sort`,`for (const [, i] of songs.slice(0, 2))`]),done:r(f,[`return answer`],[`return answer`])},m={python:`def solution(genres, plays):
    total = {}
    for g, p in zip(genres, plays):
        total[g] = total.get(g, 0) + p

    order = sorted(total, key=lambda g: -total[g])
    answer = []
    for g in order:
        # 장르마다 전체 곡을 처음부터 다시 훑어 골라낸다
        songs = [(plays[i], i) for i in range(len(genres)) if genres[i] == g]
        songs.sort(key=lambda x: (-x[0], x[1]))
        answer.extend(i for _, i in songs[:2])
    return answer`,javascript:`function solution(genres, plays) {
  const total = new Map();
  for (let i = 0; i < genres.length; i++) {
    total.set(genres[i], (total.get(genres[i]) ?? 0) + plays[i]);
  }

  const order = [...total.keys()].sort((a, b) => total.get(b) - total.get(a));
  const answer = [];
  for (const g of order) {
    // 장르마다 전체 곡을 처음부터 다시 훑어 골라낸다
    const songs = [];
    for (let i = 0; i < genres.length; i++) {
      if (genres[i] === g) songs.push([plays[i], i]);
    }
    songs.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (const [, i] of songs.slice(0, 2)) answer.push(i);
  }
  return answer;
}`},h={total:r(m,[`total = {}`,`for g, p in zip(genres, plays):`,`total[g] = total.get(g, 0) + p`],[`const total = new Map()`,`for (let i = 0; i < genres.length; i++)`,`total.set(genres[i]`]),order:r(m,[`order = sorted(total, key=lambda g: -total[g])`,`answer = []`],[`const order = [...total.keys()].sort`,`const answer = []`]),pickGenre:r(m,[`for g in order:`],[`for (const g of order)`]),scan:r(m,[`songs = [(plays[i], i) for i in range(len(genres)) if genres[i] == g]`],[`const songs = []`,`for (let i = 0; i < genres.length; i++) {`,`if (genres[i] === g)`]),take:r(m,[`songs.sort(key=lambda x: (-x[0], x[1]))`,`answer.extend(i for _, i in songs[:2])`],[`songs.sort((a, b) => b[0] - a[0]`,`for (const [, i] of songs.slice(0, 2))`]),done:r(m,[`return answer`],[`return answer`])},g={python:`# 주의: 장르 총합이 아니라 최다 재생 1곡으로 장르 순서를 정해 틀리는 풀이입니다
def solution(genres, plays):
    best = {}
    by_genre = {}
    for i, (g, p) in enumerate(zip(genres, plays)):
        best[g] = max(best.get(g, 0), p)        # 잘못된 기준: 장르 내 최고 재생 수만 기록
        by_genre.setdefault(g, []).append((p, i))

    order = sorted(best, key=lambda g: -best[g])
    answer = []
    for g in order:
        songs = sorted(by_genre[g], key=lambda x: (-x[0], x[1]))
        answer.extend(i for _, i in songs[:2])
    return answer`,javascript:`// 주의: 장르 총합이 아니라 최다 재생 1곡으로 장르 순서를 정해 틀리는 풀이입니다
function solution(genres, plays) {
  const best = new Map();
  const byGenre = new Map();
  for (let i = 0; i < genres.length; i++) {
    const [g, p] = [genres[i], plays[i]];
    best.set(g, Math.max(best.get(g) ?? 0, p)); // 잘못된 기준: 장르 내 최고 재생 수만 기록
    if (!byGenre.has(g)) byGenre.set(g, []);
    byGenre.get(g).push([p, i]);
  }

  const order = [...best.keys()].sort((a, b) => best.get(b) - best.get(a));
  const answer = [];
  for (const g of order) {
    const songs = byGenre.get(g).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (const [, i] of songs.slice(0, 2)) answer.push(i);
  }
  return answer;
}`},_={collect:r(g,[`for i, (g, p) in enumerate`,`best[g] = max(best.get(g, 0), p)`,`by_genre.setdefault(g, []).append((p, i))`],[`for (let i = 0; i < genres.length; i++)`,`best.set(g, Math.max`,`byGenre.get(g).push([p, i])`]),order:r(g,[`order = sorted(best, key=lambda g: -best[g])`,`answer = []`],[`const order = [...best.keys()].sort`,`const answer = []`]),pickGenre:r(g,[`for g in order:`],[`for (const g of order)`]),pickSongs:r(g,[`songs = sorted(by_genre[g]`,`answer.extend(i for _, i in songs[:2])`],[`const songs = byGenre.get(g).sort`,`for (const [, i] of songs.slice(0, 2))`]),done:r(g,[`return answer`],[`return answer`])},v=(...e)=>({python:[...new Set(e.flatMap(e=>e.python))].sort((e,t)=>e-t),javascript:[...new Set(e.flatMap(e=>e.javascript))].sort((e,t)=>e-t)}),y=24,b=110,x=172,S=292,C=620,w=350,T=e({x:72,y,w:72,h:54,gap:8}),E=e=>({x:72+e*160,y:b,w:144,h:54}),D=e=>({x:72+e*160,y:x,w:144,h:100}),O=(e,t)=>({x:78+e*160,y:178+t*30,w:132,h:26}),k=e({x:76,y:298,w:64,h:36,gap:8}),A=e=>`song:${e}`,j=e=>`genre:${e}`,M=(e,t)=>`gsong:${e}:${t}`,N=e=>`pick:${e}`;function P(e){let t=[{id:`row:song`,kind:`text`,rect:{x:0,y,w:64,h:54},text:`곡 목록`},{id:`row:genre`,kind:`text`,rect:{x:0,y:b,w:64,h:54},text:e},{id:`row:list`,kind:`text`,rect:{x:0,y:x,w:64,h:100},text:`장르별 곡`},{id:`row:album`,kind:`text`,rect:{x:0,y:S,w:64,h:48},text:`수록 순서`},{id:`album:bg`,kind:`zone`,rect:{x:70,y:S,w:364,h:48}}];for(let e=0;e<s;e++)t.push({id:A(e),kind:`cell`,rect:T(e),tone:`plain`,text:String(o[e]),sub:a[e],tag:`#${e}`});return c.forEach((e,n)=>{t.push({id:j(n),kind:`cell`,rect:E(n),tone:`plain`,text:`0`,tag:e},{id:`zone:${n}`,kind:`zone`,rect:D(n)})}),{width:C,height:w,items:t}}var F=e=>({type:`wait`,ms:e}),I=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function L(){let e=new n(P(`장르 합계`)),r=new Map,l=new Map,f=[],m=0,h=`-`,g=`-`,_=`-`,y=()=>({work:m,variables:{i:h,g,total:d(r),order:_,answer:u(f)}});for(let n=0;n<s;n++){let[s,u]=[a[n],o[n]],d=c.indexOf(s),f=r.get(s)??0,_=f+u;r.set(s,_),l.has(s)||l.set(s,[]);let b=l.get(s),x=b.length;b.push([u,n]),m++,h=n,g=s,e.step({title:`#${n} (${s}, ${u}회) → ${s} 합계 ${_}`,codeHighlights:v(p.loop,p.add),...y()}),e.phase(`곡 꺼내기`,`${n}번 곡(${s}, ${u}회)을 확인합니다.`,p.loop),e.do(...i([I(A(n),`current`),{type:`focus`,ids:[A(n),j(d)]}]),F(250)),e.phase(`장르에 묶기`,`${s} 총 재생 수를 ${f} + ${u} = ${t(_)} 올리고, ${s} 목록에 (#${n}, ${u}회)를 넣습니다.`,p.add),e.do({type:`arrow`,from:A(n),to:j(d),verdict:`good`,label:`+${u}`},{type:`set`,id:j(d),patch:{text:String(_),tone:`chosen`},pop:!0},{type:`add`,item:{id:M(d,x),kind:`token`,rect:O(d,x),tone:`plain`,text:`#${n} · ${u}회`},from:A(n)}),e.do(...i([{type:`unfocus`},{type:`clearMarks`},I(A(n),`visited`)]))}let b=[...r.keys()].sort((e,t)=>r.get(t)-r.get(e));_=`[${b.join(`, `)}]`,h=`-`,g=`-`,e.step({title:`장르 합계순 정렬: ${b.map(e=>`${e}(${r.get(e)})`).join(` > `)}`,codeHighlights:p.order,...y()}),e.phase(`장르 순서 정하기`,`총 재생 수가 큰 순서대로 장르를 정렬하면 ${b.map(e=>`${e}(${r.get(e)}회)`).join(` → `)}입니다.`,p.order),e.do(...i(b.map((e,t)=>({type:`set`,id:j(c.indexOf(e)),patch:{sub:`${t+1}순위`,tone:`chosen`},pop:!0}))),F(450));for(let t of b){let n=c.indexOf(t),r=l.get(t),a=[...r].sort((e,t)=>t[0]-e[0]||e[1]-t[1]),o=a.slice(0,2);m+=r.length,g=t;for(let[,e]of o)f.push(e);e.step({title:`${t}: 상위 ${o.length}곡 ${o.map(([,e])=>`#${e}`).join(`, `)} 수록`,codeHighlights:v(p.pickGenre,p.pickSongs),...y()}),e.phase(`장르 고르기`,`${t} 장르의 곡 ${r.length}개를 재생 수 내림차순으로 정렬합니다.`,p.pickGenre),e.do(I(j(n),`current`),...i(a.map(([e,t],r)=>({type:`set`,id:M(n,r),patch:{text:`#${t} · ${e}회`,tone:r<2?`good`:`muted`},pop:!0}))),F(250)),e.phase(`상위 2곡 수록`,`${t}에서 가장 많이 재생된 ${o.map(([e,t])=>`#${t}(${e}회)`).join(`, `)}을 앨범에 넣습니다.`,p.pickSongs),o.forEach(([t,r],i)=>{let a=f.length-o.length+i;e.do({type:`add`,item:{id:N(a),kind:`token`,rect:k(a),tone:`good`,text:`#${r}(${t})`},from:M(n,i)})}),e.do(I(j(n),`visited`))}return e.step({title:`수록 완료: ${u(f)}`,codeHighlights:p.done,...y(),answer:[...f],isKeyframe:!0}),e.phase(`정답`,`장르별로 한 번에 묶어 두었기 때문에 곡을 모두 ${m}번만 확인하고 ${u(f)}을 얻었습니다.`,p.done),e.do(...i(f.map((e,t)=>I(N(t),`path`))),F(500)),e.finish()}function R(){let e=new n(P(`장르 합계`)),t=new Map,r=[],l=0,f=`-`,p=`-`,m=()=>({work:l,variables:{g:f,total:d(t),order:p,answer:u(r)}});for(let e=0;e<s;e++)t.set(a[e],(t.get(a[e])??0)+o[e]);l+=s,e.step({title:`곡 ${s}개를 훑어 장르별 합계 구하기`,codeHighlights:h.total,...m()}),e.phase(`합계 세기`,`곡 ${s}개를 한 번 훑어 장르별 총 재생 수를 구합니다. 하지만 곡 목록은 묶어 두지 않았습니다.`,h.total),e.do(...i(c.map((e,n)=>({type:`set`,id:j(n),patch:{text:String(t.get(e)),tone:`chosen`},pop:!0}))),F(500));let g=[...t.keys()].sort((e,n)=>t.get(n)-t.get(e));p=`[${g.join(`, `)}]`,e.step({title:`장르 순서 정하기: ${g.join(` → `)}`,codeHighlights:h.order,...m()}),e.phase(`장르 정렬`,`합계가 큰 순서대로 ${g.map(e=>`${e}(${t.get(e)})`).join(` → `)} 순서를 정합니다.`,h.order),e.do(...i(g.map((e,t)=>({type:`set`,id:j(c.indexOf(e)),patch:{sub:`${t+1}순위`},pop:!0}))),F(450));for(let t of g){let n=c.indexOf(t),u=a.flatMap((e,n)=>e===t?[[o[n],n]]:[]),d=[...u].sort((e,t)=>t[0]-e[0]||e[1]-t[1]),p=d.slice(0,2);l+=s,f=t;for(let[,e]of p)r.push(e);e.step({title:`${t}: 전체 ${s}곡을 다시 훑어 ${p.map(([,e])=>`#${e}`).join(`, `)} 수록`,codeHighlights:v(h.pickGenre,h.scan,h.take),...m()}),e.phase(`전체 다시 훑기`,`${t} 곡을 찾으려고 곡 ${s}개를 처음부터 다시 훑습니다.`,h.scan),e.do(I(j(n),`current`),...i(a.map((e,n)=>I(A(n),e===t?`chosen`:`muted`)))),u.forEach(([t,r],i)=>{e.do({type:`add`,item:{id:M(n,i),kind:`token`,rect:O(n,i),tone:`chosen`,text:`#${r} · ${t}회`},from:A(r)})}),e.phase(`정렬 후 수록`,`찾아낸 ${u.length}곡을 정렬해 상위 ${p.length}곡을 앨범에 넣습니다.`,h.take),e.do(...i(d.map(([e,t],r)=>({type:`set`,id:M(n,r),patch:{text:`#${t} · ${e}회`,tone:r<2?`good`:`muted`},pop:!0})))),p.forEach(([t,i],a)=>{let o=r.length-p.length+a;e.do({type:`add`,item:{id:N(o),kind:`token`,rect:k(o),tone:`good`,text:`#${i}(${t})`},from:M(n,a)})}),e.do(...i([I(j(n),`visited`),...a.map((e,t)=>I(A(t),`plain`))]))}return e.step({title:`수록 완료: ${u(r)} (곡 확인 ${l}번)`,codeHighlights:h.done,...m(),answer:[...r],isKeyframe:!0}),e.phase(`정답`,`답은 ${u(r)}로 같지만, 장르마다 전체 곡을 다시 훑어서 곡을 ${l}번(정석은 ${2*s}번) 확인했습니다.`,h.done),e.do(...i(r.map((e,t)=>I(N(t),`path`))),F(500)),e.finish()}function z(){let e=new n(P(`최고 1곡`)),t=new Map,r=new Map,f=[],p=0,m=`-`,h=`-`,g=()=>({work:p,variables:{g:m,best:d(t),order:h,answer:u(f)}});for(let e=0;e<s;e++){let[n,i]=[a[e],o[e]];t.set(n,Math.max(t.get(n)??0,i)),r.has(n)||r.set(n,[]),r.get(n).push([i,e])}p+=s,e.step({title:`곡 ${s}개를 묶되 장르 합계 대신 최고 재생 수만 기록`,codeHighlights:_.collect,...g()}),e.phase(`최고 기록 저장`,`장르별 곡을 묶으면서 총합이 아니라 가장 많이 재생된 1곡의 재생 수만 기록합니다.`,_.collect),c.forEach((n,i)=>{e.do({type:`set`,id:j(i),patch:{text:String(t.get(n)),tone:`bad`},pop:!0}),r.get(n).forEach(([t,n],r)=>{e.do({type:`add`,item:{id:M(i,r),kind:`token`,rect:O(i,r),tone:`plain`,text:`#${n} · ${t}회`},from:A(n)})})});let y=[...t.keys()].sort((e,n)=>t.get(n)-t.get(e));h=`[${y.join(`, `)}]`,e.step({title:`잘못된 장르 순서: jazz(900)가 classic(800, 총합 1450) 앞선다`,codeHighlights:_.order,...g()}),e.phase(`잘못된 정렬`,`1곡 최고 기록만 비교해 jazz(900회)가 classic(최고 800회, 하지만 3곡 합계는 1450회)보다 먼저 옵니다.`,_.order),e.do({type:`focus`,ids:[j(0),j(2)]},{type:`arrow`,from:j(2),to:j(0),verdict:`bad`,label:`900 > 800 (총합은 900 < 1450)`},...i(y.map((e,t)=>({type:`set`,id:j(c.indexOf(e)),patch:{sub:`${t+1}순위`},pop:!0})))),e.do(...i([{type:`unfocus`},{type:`clearMarks`}]));for(let t of y){let n=c.indexOf(t),a=r.get(t),o=[...a].sort((e,t)=>t[0]-e[0]||e[1]-t[1]),s=o.slice(0,2);p+=a.length,m=t;for(let[,e]of s)f.push(e);e.step({title:`${t} 수록 → ${s.map(([,e])=>`#${e}`).join(`, `)}`,codeHighlights:v(_.pickGenre,_.pickSongs),...g()}),e.phase(`장르 고르기`,`잘못된 순서에 따라 ${t} 장르를 먼저 처리합니다.`,_.pickGenre),e.do(I(j(n),`current`),...i(o.map(([e,t],r)=>({type:`set`,id:M(n,r),patch:{text:`#${t} · ${e}회`,tone:r<2?`bad`:`muted`},pop:!0})))),e.phase(`곡 수록`,`${t} 상위 곡 ${s.map(([,e])=>`#${e}`).join(`, `)}을 앨범에 넣습니다.`,_.pickSongs),s.forEach(([t,r],i)=>{let a=f.length-s.length+i;e.do({type:`add`,item:{id:N(a),kind:`token`,rect:k(a),tone:`bad`,text:`#${r}(${t})`},from:M(n,i)})}),e.do(I(j(n),`visited`))}return e.step({title:`오답 ${u(f)} — 정답은 ${u(l)}`,codeHighlights:_.done,...g(),answer:[...f],isKeyframe:!0}),e.phase(`오답 확인`,`classic은 세 곡 합계가 1450회라 jazz(900회)보다 먼저 수록되어야 합니다. 장르 순서는 최고 1곡이 아니라 장르 총합으로 정해야 합니다.`,_.done),e.do({type:`add`,item:{id:`right`,kind:`token`,rect:{x:442,y:298,w:170,h:36},tone:`good`,text:`정답 ${u(l)}`}},F(600)),e.finish()}var B={id:`best-album`,title:`베스트앨범`,level:3,category:`hash`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42579`,description:{summary:`장르별로 가장 많이 재생된 노래를 최대 두 개씩 모아 베스트앨범을 만듭니다. 속한 노래의 총 재생 수가 많은 장르를 먼저 수록하고, 장르 안에서는 재생 수가 많은 노래부터, 재생 수가 같으면 고유 번호가 낮은 노래부터 수록합니다.`,rules:[`genres[i]는 고유번호 i인 노래의 장르, plays[i]는 재생 횟수`,`genres와 plays의 길이는 같으며 1 이상 10,000 이하`,`장르 종류는 100개 미만이며, 장르에 속한 곡이 하나면 하나만 선택`,`모든 장르는 총 재생된 횟수가 서로 다름`],examples:[{input:`genres = ["classic", "pop", "classic", "classic", "pop"], plays = [500, 600, 150, 800, 2500]`,output:`[4, 1, 3, 0]`}]},keyIntuitions:[`장르 이름을 키로 하는 두 개의 사전(해시)을 함께 만듭니다: 장르별 총 재생 수 사전과 장르별 (재생 수, 고유 번호) 목록 사전입니다.`,`장르 순서는 장르에 속한 모든 곡의 재생 수 합계로 정하고, 각 장르 안에서는 (-재생 수, 고유 번호) 기준으로 정렬해 앞의 2곡만 꺼냅니다.`,`곡을 처음 한 번만 훑어 장르별로 묶어 두면, 장르마다 전체 배열을 다시 뒤질 필요가 없습니다.`],demo:{input:[a,o],label:`genres = ["classic", "pop", "classic", "classic", "pop", "jazz"], plays = [500, 600, 150, 800, 2500, 900]`},workUnit:`곡을 확인한 횟수`,approaches:[{id:`best-album-group`,name:`장르별 묶기 (합계 + 곡 목록 사전)`,rank:`BEST`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`한 번 훑으며 장르별 총합과 곡 목록을 사전에 모아 두고 정렬하는 정석 풀이입니다.`,pros:[`곡 목록을 처음 한 번만 훑어 장르별로 분류하므로 장르 수만큼 다시 훑지 않습니다.`,`(-재생 수, 고유 번호) 정렬 키 하나로 재생 수 내림차순과 동점 시 낮은 번호 우선 규칙을 한꺼번에 처리합니다.`,`[:2] 또는 slice(0, 2)를 쓰면 곡이 1개뿐인 장르도 별도 분기 없이 깔끔하게 처리됩니다.`],cons:[`장르별 합계 사전과 곡 목록 사전을 둘 다 관리해야 합니다.`],whyThisRank:`"장르 순서(합계)"와 "장르 내 순서(재생 수, 번호)"라는 두 단계 기준을 두 개의 사전으로 그대로 옮겨 시간과 코드 모두 가장 깔끔합니다.`,code:f,visualize:L},{id:`best-album-rescan`,name:`장르마다 전체 곡을 다시 훑어 고르기`,rank:`ALTERNATIVE`,timeComplexity:`O(N × G + N log N)`,spaceComplexity:`O(N)`,verdict:`합계 사전만 만들고 장르마다 전체 곡 배열을 다시 훑어 골라내는 풀이로, 장르 수만큼 반복 탐색이 늘어납니다.`,pros:[`사전 하나(장르별 합계)만 쓰므로 자료구조가 단순합니다.`,`장르 종류가 100개 미만이라 이 문제의 제한 안에서는 통과합니다.`],cons:[`장르 G개마다 길이 N인 배열을 처음부터 다시 훑어 O(N × G) 일이 추가됩니다. 이 예에서도 곡을 ${4*s}번 확인해 정석(${2*s}번)의 두 배입니다.`,`장르 수가 많아지면 불필요한 선형 탐색 비용이 크게 불어납니다.`],whyThisRank:`정답은 같지만 처음 훑을 때 곡을 장르별 리스트에 담아 두기만 해도 장르마다 배열 전체를 다시 훑는 일을 없앨 수 있습니다.`,code:m,visualize:R},{id:`best-album-max-song`,name:`최다 재생 1곡으로 장르 순서 정하기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`장르의 모든 곡 합계가 아니라 가장 많이 재생된 한 곡으로 장르 순서를 정해 틀리는 풀이입니다.`,pros:[`원문 예제는 최다 재생 곡을 가진 장르와 총합이 가장 큰 장르가 우연히 같아서 통과합니다.`],cons:[`여러 곡이 고르게 재생된 장르(classic: 500 + 150 + 800 = 1450)가 한 곡만 반짝 큰 장르(jazz: 900)에 밀려 순서가 뒤집힙니다.`],whyThisRank:`"속한 노래가 많이 재생된 장르를 먼저 수록한다"는 조건은 장르에 속한 모든 곡의 재생 수 합계를 뜻합니다. 최댓값이 아니라 합계(sum)로 장르 순서를 정해야 합니다.`,code:g,visualize:z}],checks:{cases:[{args:[[`classic`,`pop`,`classic`,`classic`,`pop`],[500,600,150,800,2500]],expected:[4,1,3,0]},{args:[[`classic`,`pop`,`classic`,`classic`],[500,2500,500,500]],expected:[1,0,2]},{args:[[`solo`],[100]],expected:[0]},{args:[a,o],expected:l}],random:e=>{let t=[`classic`,`pop`,`jazz`];for(;;){let n=2+Math.floor(e()*6),r=Array.from({length:n},()=>t[Math.floor(e()*3)]),i=Array.from({length:n},()=>(1+Math.floor(e()*20))*50),a=new Map;if(r.forEach((e,t)=>a.set(e,(a.get(e)??0)+i[t])),new Set(a.values()).size===a.size)return[r,i]}}}};export{B as default};