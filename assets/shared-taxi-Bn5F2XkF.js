import{n as e,t}from"./index-DQku_aTs.js";import{a as n,c as r,i,s as a}from"./shared-e6uNbDLo.js";var o=5,s=1,c=4,l=5,u=[[1,2,3],[2,3,3],[1,4,10],[1,5,11],[3,4,2],[3,5,2]],d=999,f=(e,t)=>`${Math.min(e,t)}-${Math.max(e,t)}`,p=new Map(u.map(([e,t],n)=>[f(e,t),n])),m=(e,t)=>p.get(f(e,t));function h(){let e=Array.from({length:6},(e,t)=>Array.from({length:6},(e,n)=>t===n?0:d));for(let[t,n,r]of u)e[t][n]=r,e[n][t]=r;for(let t=1;t<=o;t++)for(let n=1;n<=o;n++)for(let r=1;r<=o;r++)e[n][t]+e[t][r]<e[n][r]&&(e[n][r]=e[n][t]+e[t][r]);return e}var g=h();function _(n){for(let r of n.steps){let n=e(r);r.phases.forEach((e,i)=>{let a=n.phases[i],o=i<r.phases.length-1?140:r.isKeyframe?t:320,s=20*[...e.caption].length;if(a.end-a.start+o>=s)return;let c=Math.max(a.start,...a.actions.map(e=>e.start+e.duration))-a.start;e.actions.push({type:`wait`,ms:Math.ceil(s-o-c)})})}return n}var v={python:`def solution(n, s, a, b, fares):
    INF = float('inf')
    dist = [[0 if i == j else INF for j in range(n + 1)] for i in range(n + 1)]
    for u, v, f in fares:
        dist[u][v] = dist[v][u] = f

    for k in range(1, n + 1):  # k번 지점을 거쳐 가는 요금으로 갱신합니다
        for i in range(1, n + 1):
            if dist[i][k] == INF:
                continue
            for j in range(i + 1, n + 1):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]

    # 합승을 마치는 분기점 m(1~n)을 모두 확인합니다
    return min(dist[s][m] + dist[m][a] + dist[m][b] for m in range(1, n + 1))`,javascript:`function solution(n, s, a, b, fares) {
  const dist = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === j ? 0 : Infinity)),
  );
  for (const [u, v, f] of fares) {
    dist[u][v] = dist[v][u] = f;
  }

  for (let k = 1; k <= n; k++) { // k번 지점을 거쳐 가는 요금으로 갱신합니다
    for (let i = 1; i <= n; i++) {
      if (dist[i][k] === Infinity) continue;
      for (let j = i + 1; j <= n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  let best = Infinity; // 합승을 마치는 분기점 m(1~n)을 모두 확인합니다
  for (let m = 1; m <= n; m++) {
    best = Math.min(best, dist[s][m] + dist[m][a] + dist[m][b]);
  }
  return best;
}`},y={init:i(v,[`dist = [[0 if i == j`,`for u, v, f in fares:`,`dist[u][v] = dist[v][u] = f`],[`const dist = Array.from`,`for (const [u, v, f] of fares)`,`dist[u][v] = dist[v][u] = f`]),via:i(v,[`for k in range(1, n + 1):`,`if dist[i][k] + dist[k][j] < dist[i][j]:`,`dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]`],[`for (let k = 1; k <= n; k++)`,`if (dist[i][k] + dist[k][j] < dist[i][j])`,`dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]`]),split:i(v,[`return min(dist[s][m] + dist[m][a] + dist[m][b] for m in range(1, n + 1))`],[`for (let m = 1; m <= n; m++)`,`best = Math.min(best, dist[s][m] + dist[m][a] + dist[m][b])`]),done:i(v,[`return min(dist[s][m] + dist[m][a] + dist[m][b] for m in range(1, n + 1))`],[`return best`])},b={python:`def solution(n, s, a, b, fares):
    def from_start(start):
        dist = [float('inf')] * (n + 1)
        dist[start] = 0
        for _ in range(n - 1):
            updated = False
            for u, v, f in fares:
                if dist[u] + f < dist[v]:
                    dist[v] = dist[u] + f
                    updated = True
                if dist[v] + f < dist[u]:
                    dist[u] = dist[v] + f
                    updated = True
            if not updated:
                break
        return dist

    ds, da, db = from_start(s), from_start(a), from_start(b)
    return min(ds[m] + da[m] + db[m] for m in range(1, n + 1))`,javascript:`function solution(n, s, a, b, fares) {
  const fromStart = (start) => {
    const dist = Array(n + 1).fill(Infinity);
    dist[start] = 0;
    for (let r = 0; r < n - 1; r++) {
      let updated = false;
      for (const [u, v, f] of fares) {
        if (dist[u] + f < dist[v]) {
          dist[v] = dist[u] + f;
          updated = true;
        }
        if (dist[v] + f < dist[u]) {
          dist[u] = dist[v] + f;
          updated = true;
        }
      }
      if (!updated) break;
    }
    return dist;
  };

  const ds = fromStart(s);
  const da = fromStart(a);
  const db = fromStart(b);
  let best = Infinity;
  for (let m = 1; m <= n; m++) {
    best = Math.min(best, ds[m] + da[m] + db[m]);
  }
  return best;
}`},x={run:i(b,[`def from_start(start):`,`for u, v, f in fares:`,`ds, da, db = from_start(s), from_start(a), from_start(b)`],[`const fromStart = (start) =>`,`for (const [u, v, f] of fares)`,`const ds = fromStart(s)`]),split:i(b,[`return min(ds[m] + da[m] + db[m] for m in range(1, n + 1))`],[`for (let m = 1; m <= n; m++)`,`best = Math.min(best, ds[m] + da[m] + db[m])`]),done:i(b,[`return min(ds[m] + da[m] + db[m] for m in range(1, n + 1))`],[`return best`])},S={python:`# 주의: 출발지(s)와 두 도착지(a, b) 세 곳만 분기점으로 확인하는 오답 풀이입니다
def solution(n, s, a, b, fares):
    INF = float('inf')
    dist = [[0 if i == j else INF for j in range(n + 1)] for i in range(n + 1)]
    for u, v, f in fares:
        dist[u][v] = dist[v][u] = f

    for k in range(1, n + 1):
        for i in range(1, n + 1):
            if dist[i][k] == INF:
                continue
            for j in range(i + 1, n + 1):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]

    # 합승 안 함(s), A 집까지 합승(a), B 집까지 합승(b)만 보고 제3의 분기점을 놓칩니다
    return min(dist[s][m] + dist[m][a] + dist[m][b] for m in (s, a, b))`,javascript:`// 주의: 출발지(s)와 두 도착지(a, b) 세 곳만 분기점으로 확인하는 오답 풀이입니다
function solution(n, s, a, b, fares) {
  const dist = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === j ? 0 : Infinity)),
  );
  for (const [u, v, f] of fares) {
    dist[u][v] = dist[v][u] = f;
  }

  for (let k = 1; k <= n; k++) {
    for (let i = 1; i <= n; i++) {
      if (dist[i][k] === Infinity) continue;
      for (let j = i + 1; j <= n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  // 합승 안 함(s), A 집까지 합승(a), B 집까지 합승(b)만 보고 제3의 분기점을 놓칩니다
  let best = Infinity;
  for (const m of [s, a, b]) {
    best = Math.min(best, dist[s][m] + dist[m][a] + dist[m][b]);
  }
  return best;
}`},C={init:i(S,[`dist = [[0 if i == j`,`dist[u][v] = dist[v][u] = f`],[`const dist = Array.from`,`dist[u][v] = dist[v][u] = f`]),via:i(S,[`for k in range(1, n + 1):`,`dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]`],[`for (let k = 1; k <= n; k++)`,`dist[i][j] = dist[j][i] = dist[i][k] + dist[k][j]`]),split:i(S,[`return min(dist[s][m] + dist[m][a] + dist[m][b] for m in (s, a, b))`],[`for (const m of [s, a, b])`,`best = Math.min(best, dist[s][m] + dist[m][a] + dist[m][b])`]),done:i(S,[`return min(dist[s][m] + dist[m][a] + dist[m][b] for m in (s, a, b))`],[`return best`])},w=54,T=500,E=350,D={x:0,y:0,w:T,h:E},O={1:[64,178],2:[192,178],3:[316,178],4:[434,96],5:[434,260]},k=[[116,150],[242,150],[210,74],[210,266],[368,112],[368,224]],A=e=>({x:O[e][0]-w/2,y:O[e][1]-w/2,w,h:w}),j=e=>({x:8+(e-1)*98,y:6,w:92,h:34}),M=e=>`v:${e}`,N=e=>`e:${e}`,P=e=>`w:${e}`,F=e=>`m:${e}`;function I(e,t){let[[n,r],[i,a]]=[O[e],O[t]],o=Math.hypot(i-n,a-r),[s,c]=[(i-n)/o,(a-r)/o],l=w/2/Math.max(Math.abs(s),Math.abs(c))+3;return[[n+s*l,r+c*l],[i-s*l,a-c*l]]}var L=e=>e===s?`출발 S`:e===c?`A 도착`:e===l?`B 도착`:`경유지`;function R(){let e=[];for(let t=1;t<=o;t++)e.push({id:F(t),kind:`token`,rect:j(t),tone:`plain`,text:`분기 ${t}: -`});u.forEach(([t,n,r],i)=>{e.push({id:N(i),kind:`line`,rect:D,tone:`trail`,points:I(t,n)}),e.push({id:P(i),kind:`text`,rect:{x:k[i][0],y:k[i][1],w:30,h:20},tone:`muted`,text:String(r)})});for(let t=1;t<=o;t++)e.push({id:M(t),kind:`cell`,rect:A(t),tone:t===s?`current`:t===c||t===l?`queued`:`plain`,text:`${t}번`,sub:L(t)});return e.push({id:`calc`,kind:`text`,rect:{x:180,y:314,w:310,h:26},text:`최단 요금 계산 전`},{id:`best`,kind:`token`,rect:{x:8,y:312,w:160,h:30},tone:`plain`,text:`최저 요금: ∞`}),{width:T,height:E,items:e}}var z=(e,t,n=!1)=>({type:`set`,id:M(e),patch:t,...n?{pop:n}:{}}),B=(e,t,n=!1)=>({type:`set`,id:F(e),patch:t,...n?{pop:n}:{}}),V=(e,t)=>({type:`set`,id:N(e),patch:{tone:t}}),H=e=>({type:`set`,id:`calc`,patch:{text:e}}),U=(e,t=`chosen`)=>({type:`set`,id:`best`,patch:{text:`최저 요금: ${e}`,tone:t},pop:!0}),W=e=>({type:`wait`,ms:e}),G=()=>a([{type:`unfocus`},{type:`clearMarks`}]),K=(e,t)=>`[${e[t].slice(1).map(e=>e>=d?`∞`:String(e)).join(`, `)}]`;function q(){let e=new r(R()),t=Array.from({length:6},(e,t)=>Array.from({length:6},(e,n)=>t===n?0:d));for(let[e,n,r]of u)t[e][n]=r,t[n][e]=r;let i=0,f=`-`,p=`-`,h=`∞`,g=()=>({work:i,variables:{k:f,m:p,best:h,"dist[1]":K(t,1),"dist[3]":K(t,3)}});e.step({title:`직접 이어진 도로 요금으로 dist 표 초기화`,codeHighlights:y.init,...g()}),e.phase(`초기화`,`자기 자신으로 가는 요금은 0, 직접 이어진 도로는 주어진 요금, 나머지는 ∞로 최단 거리 표를 초기화합니다.`,y.init),e.do(H(`1→4 직통 10원, 1→5 직통 11원`),W(400));for(let r=1;r<=o;r++){f=r;let s=[];for(let e=1;e<=o;e++)if(!(t[e][r]>=d)){for(let n=e+1;n<=o;n++)if(i++,t[e][r]+t[r][n]<t[e][n]){let i=t[e][n],a=t[e][r]+t[r][n];t[e][n]=a,t[n][e]=a,s.push({i:e,j:n,oldVal:i,newVal:a})}}if(e.step({title:s.length?`경유지 k = ${r}번: ${s.map(e=>`${e.i}↔${e.j}(${e.newVal}원)`).join(`, `)} 단축`:`경유지 k = ${r}번: 더 줄어드는 쌍 없음`,codeHighlights:y.via,...g()}),s.length){let i=s.map(e=>`${e.i}↔${e.j}가 ${e.oldVal>=d?`∞`:e.oldVal}→${n(e.newVal)}`).join(`, `);e.phase(`경유 갱신`,`${r}번 지점을 거쳐 가면 ${i} 줄어듭니다.`,y.via);let o=s[0];e.do({type:`focus`,ids:[M(r),M(o.i),M(o.j)]}),e.do({type:`arrow`,from:M(o.i),to:M(r),verdict:`good`,label:`${t[o.i][r]}원`},{type:`arrow`,from:M(r),to:M(o.j),verdict:`good`,label:`합 ${o.newVal}원`}),e.do(...a([...G(),H(`${r}번 경유: ${i}`)]))}else e.phase(`경유 갱신`,`${r}번 지점을 거쳐 가도 기존 요금보다 싸지는 구간이 없습니다.`,y.via),e.do({type:`focus`,ids:[M(r)]},W(300),...G())}f=`-`;let v=d;for(let r=1;r<=o;r++){p=r,i++;let o=t[s][r],u=t[r][c],d=t[r][l],f=o+u+d,m=f<v;m&&(v=f),h=v,e.step({title:`분기점 m = ${r}번: 합승 ${o} + A ${u} + B ${d} = ${f}원`,codeHighlights:y.split,...g()}),e.phase(`분기점 비교`,`${r}번까지 합승(${o}원)한 뒤 A(${u}원)와 B(${d}원)가 갈라지면 총 ${f}원입니다.${m?` 최저 요금을 ${n(f)} 갱신합니다.`:``}`,y.split),e.do({type:`focus`,ids:[M(s),M(r),M(c),M(l),F(r)]}),r!==c&&e.do({type:`arrow`,from:M(r),to:M(c),verdict:m?`good`:`seen`,label:`A ${u}원`}),r!==l&&e.do({type:`arrow`,from:M(r),to:M(l),verdict:m?`good`:`seen`,label:`B ${d}원`,together:r!==c}),e.do(...a([...G(),B(r,{text:`분기 ${r}: ${f}`,tone:m?`good`:`explored`},!0),H(`m=${r}: ${o} + ${u} + ${d} = ${f}원`),...m?[U(v)]:[]]))}return p=`-`,e.step({title:`최저 택시 요금: ${v}원 (3번 지점까지 합승)`,codeHighlights:y.done,...g(),answer:v,isKeyframe:!0}),e.phase(`결과 확인`,`1→2→3까지 합승(6원)하고 3→4(2원), 3→5(2원)로 갈라지는 3번 분기점이 총 ${v}원으로 가장 저렴합니다.`,y.done),e.do(...a([V(m(1,2),`path`),V(m(2,3),`path`),V(m(3,4),`path`),V(m(3,5),`path`),z(3,{tone:`path`,tag:`최적 분기점`},!0),B(3,{tone:`path`},!0),U(v,`good`),H(`1→2→3 합승(6) + 3→4(2) + 3→5(2) = 10원`)])),_(e.finish())}function J(){let e=new r(R()),t=0,n=`-`,i=`-`,f=`∞`,p=e=>{let n=[,,,,,,].fill(d);n[e]=0;for(let e=0;e<4;e++){let e=!1;for(let[r,i,a]of u)t+=2,n[r]+a<n[i]&&(n[i]=n[r]+a,e=!0),n[i]+a<n[r]&&(n[r]=n[i]+a,e=!0);if(!e)break}return n},m=[,,,,,,].fill(d),h=[,,,,,,].fill(d),g=[,,,,,,].fill(d),v=e=>`[${e.slice(1).map(e=>e>=d?`∞`:String(e)).join(`, `)}]`,y=()=>({work:t,variables:{origin:n,m:i,best:f,ds:v(m),da:v(h),db:v(g)}});n=`S=${s}`,m=p(s),e.step({title:`출발지 S(${s}번)에서 벨만-포드로 모든 지점까지 거리 계산`,codeHighlights:x.run,...y()}),e.phase(`기준점 탐색`,`S(${s}번)에서 모든 도로를 반복 완화해 ds = ${v(m)}를 구합니다.`,x.run),e.do({type:`focus`,ids:[M(s)]},H(`ds = ${v(m)}`),W(350),...G()),n=`A=${c}`,h=p(c),e.step({title:`도착지 A(${c}번)에서 벨만-포드로 모든 지점까지 거리 계산`,codeHighlights:x.run,...y()}),e.phase(`기준점 탐색`,`양방향 도로이므로 m→A 거리 대신 A(${c}번)에서 출발하는 벨만-포드로 da = ${v(h)}를 구합니다.`,x.run),e.do({type:`focus`,ids:[M(c)]},H(`da = ${v(h)}`),W(350),...G()),n=`B=${l}`,g=p(l),e.step({title:`도착지 B(${l}번)에서 벨만-포드로 모든 지점까지 거리 계산`,codeHighlights:x.run,...y()}),e.phase(`기준점 탐색`,`B(${l}번)에서 출발하는 벨만-포드로 db = ${v(g)}를 구합니다.`,x.run),e.do({type:`focus`,ids:[M(l)]},H(`db = ${v(g)}`),W(350),...G()),n=`-`;let b=d;for(let n=1;n<=o;n++){i=n,t++;let r=m[n]+h[n]+g[n],o=r<b;o&&(b=r),f=b,e.step({title:`분기점 m = ${n}번: ds[${n}](${m[n]}) + da[${n}](${h[n]}) + db[${n}](${g[n]}) = ${r}원`,codeHighlights:x.split,...y()}),e.phase(`분기점 비교`,`분기점 ${n}번의 합산 요금은 ${m[n]} + ${h[n]} + ${g[n]} = ${r}원입니다.`,x.split),e.do(...a([B(n,{text:`분기 ${n}: ${r}`,tone:o?`good`:`explored`},!0),H(`m=${n}: ${m[n]} + ${h[n]} + ${g[n]} = ${r}원`),...o?[U(b)]:[]]))}return i=`-`,e.step({title:`최저 택시 요금: ${b}원`,codeHighlights:x.done,...y(),answer:b,isKeyframe:!0}),e.phase(`결과 확인`,`3번 분기점에서 최저 요금 ${b}원을 찾았습니다. 세 기준점에서 벨만-포드를 따로 돌려 비교 횟수는 ${t}번으로 플로이드 와셜(53번)보다 많습니다.`,x.done),e.do(...a([z(3,{tone:`path`,tag:`최적 분기점`},!0),B(3,{tone:`path`},!0),U(b,`good`)])),_(e.finish())}function Y(){let e=new r(R()),t=g,n=48,i=`-`,o=`∞`,u=()=>({work:n,variables:{candidates:`[${s}, ${c}, ${l}]`,m:i,best:o,"dist[1]":K(t,1),"dist[3]":K(t,3)}});e.step({title:`최단 거리 표 계산 완료 → 분기점 후보를 [s, a, b] 세 곳만 준비`,codeHighlights:C.via,...u()}),e.phase(`최단 거리 계산`,`플로이드 와셜로 모든 지점 사이의 최단 요금을 구했습니다. 이제 합승 분기점으로 s(1), a(4), b(5) 세 곳만 확인합니다.`,C.via),e.do(...a([B(2,{text:`분기 2: 건너뜀`,tone:`muted`}),B(3,{text:`분기 3: 건너뜀`,tone:`muted`}),H(`중간 지점 2번·3번은 분기점 후보에서 제외됨`)]));let f=d;for(let r of[s,c,l]){i=r,n++;let d=t[s][r],p=t[r][c],m=t[r][l],h=d+p+m,g=h<f;g&&(f=h),o=f;let _=r===s?`합승 안 함(1번)`:r===c?`A 도착지(4번)까지 합승`:`B 도착지(5번)까지 합승`;e.step({title:`${_}: ${d} + ${p} + ${m} = ${h}원`,codeHighlights:C.split,...u()}),e.phase(`세 후보만 비교`,`${_}일 때 총 요금은 ${d} + ${p} + ${m} = ${h}원입니다.`,C.split),e.do({type:`focus`,ids:[M(r),F(r)]}),e.do(...a([...G(),B(r,{text:`분기 ${r}: ${h}`,tone:g?`good`:`explored`},!0),H(`m=${r}: ${d} + ${p} + ${m} = ${h}원`),...g?[U(f)]:[]]))}return i=`-`,e.step({title:`내 답 ${f}원, 정답은 10원 (3번 분기점 누락)`,codeHighlights:C.done,...u(),answer:f,isKeyframe:!0}),e.phase(`오답 확인`,`중간 지점인 3번에서 함께 내려 각자 이동하면 6 + 2 + 2 = 10원인데, (s, a, b) 세 곳만 확인해 ${f}원이라는 오답이 나왔습니다.`,C.done),e.do({type:`focus`,ids:[M(3),F(3)]}),e.do({type:`arrow`,from:M(1),to:M(3),verdict:`bad`,label:`놓친 분기점 10원!`}),e.do(...a([...G(),z(3,{tone:`bad`,tag:`놓친 10원`},!0),B(3,{text:`분기 3: 10!`,tone:`bad`},!0),U(f,`bad`),H(`내 답 ${f}원 ≠ 정답 10원 (3번 분기점)`),{type:`add`,item:{id:`mine`,kind:`token`,rect:{x:180,y:312,w:96,h:30},tone:`bad`,text:`내 답 ${f}원`}},{type:`add`,item:{id:`truth`,kind:`token`,rect:{x:284,y:312,w:96,h:30},tone:`good`,text:`정답 10원`}}])),_(e.finish())}var X={id:`shared-taxi`,title:`합승 택시 요금`,level:3,category:`graph`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/72413`,description:{summary:`지점 n개와 택시 요금(fares)이 주어집니다. A와 B 두 사람이 출발 지점 s에서 택시를 타고 각자의 도착 지점 a, b까지 이동할 때, 어느 지점까지 함께 타고 갈지(합승하지 않는 경우 포함)를 잘 골라 두 사람의 택시 요금 합이 최소가 되도록 합니다.`,rules:[`지점의 개수 n은 3 이상 200 이하의 자연수`,`출발지 s와 두 도착지 a, b는 1 이상 n 이하의 서로 다른 자연수`,`fares의 각 원소 [c, d, f]는 c번과 d번 지점 사이 양방향 요금이 f원이라는 뜻 (1 ≤ f ≤ 100,000)`,`합승하지 않고 처음부터 각자 이동하는 것이 더 싸다면 합승하지 않아도 됨`],examples:[{input:`n = 6, s = 4, a = 6, b = 2, fares = [[4,1,10],[3,5,24],[5,6,2],[3,1,41],[5,1,24],[4,6,50],[2,4,66],[2,3,22],[1,6,25]]`,output:`82`},{input:`n = 7, s = 3, a = 4, b = 1, fares = [[5,7,9],[4,6,4],[3,6,1],[3,2,3],[2,1,6]]`,output:`14`},{input:`n = 6, s = 4, a = 5, b = 6, fares = [[2,6,6],[6,3,7],[4,6,7],[6,5,11],[2,5,12],[5,3,20],[2,4,4],[2,1,7],[4,1,7]]`,output:`18`}]},keyIntuitions:['"어디까지 함께 타고 어디서 갈라질까?"를 분기점 m(1 ≤ m ≤ n) 하나로 모델링하면, 총 요금은 `dist(s, m) + dist(m, a) + dist(m, b)`가 됩니다.',"m이 출발지 s이면 처음부터 따로 타는 경우(`dist(s, s) = 0`)이고, m이 a나 b이면 한 사람의 집까지 같이 가는 경우까지 하나의 식으로 모두 포함됩니다.",`n ≤ 200이므로 플로이드 와셜로 모든 지점 쌍의 최단 요금을 한 번에 구해 두면, 모든 분기점 m을 O(n)에 비교해 바로 답을 얻습니다.`],demo:{input:[o,s,c,l,u],label:`n = 5, s = 1, a = 4, b = 5, fares = [[1,2,3],[2,3,3],[1,4,10],[1,5,11],[3,4,2],[3,5,2]]`},workUnit:`경유·완화 조건을 비교한 횟수`,approaches:[{id:`taxi-floyd`,name:`플로이드 와셜 (모든 쌍 최단 거리)`,rank:`BEST`,timeComplexity:`O(N³)`,spaceComplexity:`O(N²)`,verdict:`플로이드 와셜로 모든 지점 사이의 최단 요금 표를 채운 뒤, 1번부터 n번까지 모든 분기점 m을 비교하는 정석 풀이입니다.`,pros:[`3중 반복문 몇 줄로 모든 지점 쌍의 최단 요금을 한꺼번에 구할 수 있어 구현이 매우 간결합니다.`,"양방향 대칭(`i < j`)과 도달 불가능한 경유지 건너뛰기(`dist[i][k] == INF`)를 적용하면 실제 연산량이 크게 줄어듭니다.","최단 거리 표가 완성되면 분기점 비교는 `min(dist[s][m] + dist[m][a] + dist[m][b])` 한 줄로 끝납니다."],cons:[`지점 수 n이 수천 개 이상으로 커지면 O(N³) 시간과 O(N²) 공간이 부담됩니다(이 문제는 n ≤ 200이라 충분합니다).`],whyThisRank:`n ≤ 200 조건에서 코드가 가장 짧고 실수할 여지가 적으며, 모든 분기점의 합산 요금을 즉시 조회할 수 있는 표준 풀이입니다.`,code:v,visualize:q},{id:`taxi-three-bellman`,name:`세 기준점(s, a, b)에서 벨만-포드 탐색`,rank:`ALTERNATIVE`,timeComplexity:`O(N × E)`,spaceComplexity:`O(N)`,verdict:`도로가 양방향임을 이용해 s, a, b 세 곳에서 각각 최단 거리를 구하지만, 매번 간선을 반복 순회해 확인 횟수가 더 많습니다.`,pros:["`dist(m, a) = dist(a, m)` 대칭 성질 덕분에 s, a, b 세 정점에서만 단일 출발점 최단 거리를 구해도 충분합니다.","2차원 행렬 대신 1차원 배열 세 개(`ds, da, db`)만 써서 메모리를 적게 씁니다."],cons:[`단일 출발점 최단 거리 함수를 따로 작성해 세 번 호출해야 하므로 플로이드 와셜보다 코드가 깁니다.`,`벨만-포드로 세 번 반복 완화하면 작은 그래프에서도 유효 쌍만 보는 플로이드 와셜보다 비교 횟수가 많습니다.`],whyThisRank:"`m → a`를 `a → m`으로 뒤집는 발상은 좋지만, n ≤ 200에서는 플로이드 와셜이 코드도 훨씬 짧고 대칭 최적화 시 연산도 적어 대안으로 둡니다.",code:b,visualize:J},{id:`taxi-endpoints-only-trap`,name:`출발지와 도착지(s, a, b)만 분기점으로 확인`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N³)`,spaceComplexity:`O(N²)`,verdict:`"따로 가기"와 "한 사람 집까지 같이 가기"만 비교하고 제3의 중간 지점에서 헤어지는 경우를 빼먹어 오답이 나옵니다.`,pros:[`분기점 후보를 s, a, b 세 곳만 보므로 얼핏 그럴듯해 보입니다.`],cons:[`두 사람이 출발지도 도착지도 아닌 중간 지점(예: 3번)까지 함께 타고 거기서 각자 집으로 갈라지는 최적 경로를 전혀 확인하지 않습니다.`,`원문 입출력 예 1번과 시각화 입력 모두에서 중간 지점 하차가 더 저렴해 오답을 냅니다.`],whyThisRank:`합승이 끝나는 지점 m은 s, a, b뿐 아니라 1번부터 n번까지 어느 지점이든 될 수 있습니다. 반드시 모든 지점 m을 후보로 확인해야 합니다.`,code:S,visualize:Y}],checks:{cases:[{args:[6,4,6,2,[[4,1,10],[3,5,24],[5,6,2],[3,1,41],[5,1,24],[4,6,50],[2,4,66],[2,3,22],[1,6,25]]],expected:82},{args:[7,3,4,1,[[5,7,9],[4,6,4],[3,6,1],[3,2,3],[2,1,6]]],expected:14},{args:[6,4,5,6,[[2,6,6],[6,3,7],[4,6,7],[6,5,11],[2,5,12],[5,3,20],[2,4,4],[2,1,7],[4,1,7]]],expected:18},{args:[3,1,2,3,[[1,2,5],[1,3,5],[2,3,1]]],expected:6},{args:[4,1,3,4,[[1,2,10],[2,3,10],[1,4,5]]],expected:25},{args:[o,s,c,l,u],expected:10}],random:e=>{let t=3+Math.floor(e()*5),n=Array.from({length:t},(e,t)=>t+1);for(let r=t-1;r>0;r--){let t=Math.floor(e()*(r+1));[n[r],n[t]]=[n[t],n[r]]}let[r,i,a]=[n[0],n[1],n[2]],o=new Set,s=[],c=(e,t,n)=>{if(e===t)return;let r=f(e,t);o.has(r)||(o.add(r),s.push([e,t,n]))};for(let n=2;n<=t;n++)c(n,1+Math.floor(e()*(n-1)),1+Math.floor(e()*20));let l=1+Math.floor(e()*t);for(let n=0;n<l;n++)c(1+Math.floor(e()*t),1+Math.floor(e()*t),1+Math.floor(e()*20));return[t,r,i,a,s]}}};export{X as default};