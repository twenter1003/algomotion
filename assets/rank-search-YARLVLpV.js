import{o as e,t}from"./layout-DFaYBMY_.js";import{a as n,c as r,i,l as a,r as o}from"./shared-CL29HWIp.js";var s=[`java backend junior pizza 150`,`python frontend senior chicken 210`,`python frontend senior chicken 150`,`cpp backend senior pizza 260`,`java backend junior chicken 80`,`python backend senior chicken 50`],c=[`java and backend and junior and pizza 100`,`python and frontend and senior and chicken 200`,`cpp and - and senior and pizza 250`,`- and backend and senior and - 150`,`- and - and - and chicken 100`,`- and - and - and - 150`],l={cpp:`C++`,java:`Java`,python:`Py`,backend:`백`,frontend:`프`,junior:`주`,senior:`시`,chicken:`치킨`,pizza:`피자`},u=s.map(e=>{let[t,n,r,i,a]=e.split(` `);return{words:[t,n,r,i],score:Number(a),short:`${l[t]}·${l[n]}·${l[r]}·${l[i]}`}}),d=c.map(e=>{let[t,n,r,i]=e.split(` and `),[a,o]=i.split(` `),s=[t,n,r,a];return{conds:s,target:Number(o),key:s.join(` `),label:`${s.map(e=>l[e]??`-`).join(` · `)} ≥ ${o}점`}}),f=new Map;for(let e of u)for(let t=0;t<16;t++){let n=e.words.map((e,n)=>t&1<<n?`-`:e).join(` `),r=f.get(n)??[];r.push(e.score),f.set(n,r)}for(let e of f.values())e.sort((e,t)=>e-t);var p=new Map;for(let e of u){let t=e.words.join(` `),n=p.get(t)??[];n.push(e.score),p.set(t,n)}for(let e of p.values())e.sort((e,t)=>e-t);var m=[[`cpp`,`java`,`python`],[`backend`,`frontend`],[`junior`,`senior`],[`chicken`,`pizza`]];function h(e){let t=[``];return e.forEach((e,n)=>{let r=e===`-`?m[n]:[e];t=t.flatMap(e=>r.map(t=>e?`${e} ${t}`:t))}),t}var g={python:`from collections import defaultdict
from bisect import bisect_left

def solution(info, query):
    db = defaultdict(list)
    for row in info:
        *words, score = row.split()
        score = int(score)
        # 4가지 조건마다 '그대로' 또는 '-'로 바꾼 16가지 조합에 점수 저장
        for mask in range(16):
            key = ' '.join('-' if mask & (1 << i) else words[i] for i in range(4))
            db[key].append(score)

    for scores in db.values():
        scores.sort()

    answer = []
    for q in query:
        a, b, c, rest = q.split(' and ')
        d, target = rest.split()
        scores = db[f'{a} {b} {c} {d}']
        # target 이상이 처음 나오는 위치(하한)를 이분 탐색
        idx = bisect_left(scores, int(target))
        answer.append(len(scores) - idx)
    return answer`,javascript:`function solution(info, query) {
  const db = new Map();
  for (const row of info) {
    const parts = row.split(' ');
    const score = Number(parts.pop());
    // 4가지 조건마다 '그대로' 또는 '-'로 바꾼 16가지 조합에 점수 저장
    for (let mask = 0; mask < 16; mask++) {
      const key = parts.map((w, i) => (mask & (1 << i) ? '-' : w)).join(' ');
      if (!db.has(key)) db.set(key, []);
      db.get(key).push(score);
    }
  }
  for (const scores of db.values()) scores.sort((a, b) => a - b);

  return query.map((q) => {
    const [a, b, c, rest] = q.split(' and ');
    const [d, targetStr] = rest.split(' ');
    const scores = db.get(\`\${a} \${b} \${c} \${d}\`) ?? [];
    const target = Number(targetStr);
    // target 이상이 처음 나오는 위치(하한)를 이분 탐색
    let left = 0, right = scores.length;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (scores[mid] >= target) right = mid;
      else left = mid + 1;
    }
    return scores.length - left;
  });
}`},_={build:i(g,[`db = defaultdict(list)`,`for mask in range(16)`,`db[key].append(score)`,`scores.sort()`],[`const db = new Map()`,`for (let mask = 0; mask < 16; mask++)`,`db.get(key).push(score)`,`scores.sort((a, b) => a - b)`]),lookup:i(g,[`for q in query:`,`scores = db[`],[`return query.map((q) =>`,`const scores = db.get(`]),search:i(g,[`idx = bisect_left(scores, int(target))`],[`let left = 0, right = scores.length`,`while (left < right)`,`const mid = (left + right) >> 1`,`if (scores[mid] >= target)`]),append:i(g,[`answer.append(len(scores) - idx)`],[`return scores.length - left`]),done:i(g,[`return answer`],[`return scores.length - left`])},v={python:`from collections import defaultdict
from bisect import bisect_left

OPTIONS = [['cpp', 'java', 'python'], ['backend', 'frontend'], ['junior', 'senior'], ['chicken', 'pizza']]

def solution(info, query):
    db = defaultdict(list)
    for row in info:
        *words, score = row.split()
        db[' '.join(words)].append(int(score))  # 원래 조건 1개에만 저장
    for scores in db.values():
        scores.sort()

    answer = []
    for q in query:
        a, b, c, rest = q.split(' and ')
        d, target = rest.split()
        conds, target = [a, b, c, d], int(target)
        # '-' 자리에 가능한 선택지를 모두 펼쳐 각 묶음에서 하한 탐색
        keys = ['']
        for i, cond in enumerate(conds):
            choices = OPTIONS[i] if cond == '-' else [cond]
            keys = [f'{p} {ch}'.strip() for p in keys for ch in choices]
        total = sum(len(db[k]) - bisect_left(db[k], target) for k in keys if k in db)
        answer.append(total)
    return answer`,javascript:`const OPTIONS = [['cpp', 'java', 'python'], ['backend', 'frontend'], ['junior', 'senior'], ['chicken', 'pizza']];

function solution(info, query) {
  const db = new Map();
  for (const row of info) {
    const parts = row.split(' ');
    const score = Number(parts.pop());
    const key = parts.join(' '); // 원래 조건 1개에만 저장
    if (!db.has(key)) db.set(key, []);
    db.get(key).push(score);
  }
  for (const scores of db.values()) scores.sort((a, b) => a - b);

  return query.map((q) => {
    const [a, b, c, rest] = q.split(' and ');
    const [d, targetStr] = rest.split(' ');
    const conds = [a, b, c, d];
    const target = Number(targetStr);
    // '-' 자리에 가능한 선택지를 모두 펼쳐 각 묶음에서 하한 탐색
    let keys = [''];
    conds.forEach((cond, i) => {
      const choices = cond === '-' ? OPTIONS[i] : [cond];
      keys = keys.flatMap((p) => choices.map((ch) => (p ? \`\${p} \${ch}\` : ch)));
    });
    let total = 0;
    for (const k of keys) {
      const scores = db.get(k);
      if (!scores) continue;
      let left = 0, right = scores.length;
      while (left < right) {
        const mid = (left + right) >> 1;
        if (scores[mid] >= target) right = mid;
        else left = mid + 1;
      }
      total += scores.length - left;
    }
    return total;
  });
}`},y={build:i(v,[`db = defaultdict(list)`,`db[' '.join(words)].append`,`scores.sort()`],[`const db = new Map()`,`const key = parts.join`,`scores.sort((a, b) => a - b)`]),expand:i(v,[`for q in query:`,`choices = OPTIONS[i]`,`keys = [`],[`return query.map((q) =>`,`const choices = cond ===`,`keys = keys.flatMap`]),search:i(v,[`total = sum(len(db[k]) - bisect_left`],[`for (const k of keys)`,`while (left < right)`,`total += scores.length - left`]),append:i(v,[`answer.append(total)`],[`return total;`]),done:i(v,[`return answer`],[`return total;`])},b={python:`def solution(info, query):
    parsed = []
    for row in info:
        *words, score = row.split()
        parsed.append((words, int(score)))

    answer = []
    for q in query:  # 문의마다 지원자 전체를 처음부터 끝까지 확인
        a, b, c, rest = q.split(' and ')
        d, target = rest.split()
        conds, target = [a, b, c, d], int(target)
        count = 0
        for words, score in parsed:
            if score >= target and all(c == '-' or c == w for c, w in zip(conds, words)):
                count += 1
        answer.append(count)
    return answer`,javascript:`function solution(info, query) {
  const parsed = info.map((row) => {
    const parts = row.split(' ');
    const score = Number(parts.pop());
    return { words: parts, score };
  });

  return query.map((q) => { // 문의마다 지원자 전체를 처음부터 끝까지 확인
    const [a, b, c, rest] = q.split(' and ');
    const [d, targetStr] = rest.split(' ');
    const conds = [a, b, c, d];
    const target = Number(targetStr);
    let count = 0;
    for (const { words, score } of parsed) {
      if (score >= target && conds.every((c, i) => c === '-' || c === words[i])) {
        count++;
      }
    }
    return count;
  });
}`},x={start:i(b,[`parsed = []`,`parsed.append((words, int(score)))`],[`const parsed = info.map`,`return { words: parts, score }`]),scan:i(b,[`for q in query:`,`for words, score in parsed:`,`if score >= target and all(`],[`return query.map((q) =>`,`for (const { words, score } of parsed)`,`if (score >= target && conds.every`]),append:i(b,[`answer.append(count)`],[`return count;`]),done:i(b,[`return answer`],[`return count;`])},S=620,C=336,w=e({x:22,y:88,w:90,h:54,gap:8}),T=e({x:88,y:214,w:68,h:52,gap:10}),E=e({x:320,y:12,w:44,h:42,gap:6}),D=e({x:88,y:180,w:68,h:26,gap:10}),O=e=>`app:${e}`,k=e=>`ans:${e}`,A=e=>`score:${e}`;function j(){let e=[{id:`q:title`,kind:`text`,rect:{x:22,y:10,w:72,h:20},tone:`muted`,text:`현재 문의`},{id:`q:box`,kind:`token`,rect:{x:22,y:30,w:280,h:28},tone:`plain`,text:`대기 중`},{id:`ans:title`,kind:`text`,rect:{x:320,y:0,w:120,h:12},tone:`muted`,text:`문의별 정답`},{id:`app:title`,kind:`text`,rect:{x:22,y:66,w:220,h:18},tone:`muted`,text:`지원자 6명 (조건 · 점수)`},{id:`score:title`,kind:`text`,rect:{x:22,y:154,w:576,h:20},tone:`muted`,text:`조건 묶음의 정렬된 점수 배열`},{id:`score:zone`,kind:`zone`,rect:{x:76,y:206,w:482,h:68}}];return d.forEach((t,n)=>{e.push({id:k(n),kind:`cell`,rect:E(n),tone:`plain`,text:`?`})}),u.forEach((t,n)=>{e.push({id:O(n),kind:`cell`,rect:w(n),tone:`plain`,text:String(t.score),sub:t.short})}),{width:S,height:C,items:e}}var M=(e,{id:t,kind:n,...r})=>e.has(t)?{type:`set`,id:t,patch:r}:{type:`add`,item:{id:t,kind:n,...r}};function N(e,t,n){let r=[{type:`set`,id:`score:title`,patch:{text:n}}];for(let n=0;n<6;n++){let i=A(n);n<t.length?r.push(M(e,{id:i,kind:`cell`,rect:T(n),tone:`plain`,text:String(t[n]),tag:`[${n}]`})):e.has(i)&&r.push({type:`remove`,id:i})}return r}function P(e){return[`ptr:left`,`ptr:mid`,`ptr:right`,`bound:ring`].filter(t=>e.has(t)).map(e=>({type:`remove`,id:e}))}function F(){let e=new a(j()),i=[],s=0;return e.step({title:`지원자 6명을 16가지 조합 사전에 넣고 점수순 정렬`,codeHighlights:_.build,work:s,variables:{"지원자 수":u.length,"사전 키 수":f.size,answer:`[]`}}),e.phase(`사전 만들기`,`지원자마다 4가지 조건을 그대로 두거나 "-"로 바꾼 16가지 키에 점수를 넣고, 키마다 오름차순으로 정렬해 둡니다.`,_.build),e.do(...r([...u.map((e,t)=>({type:`set`,id:O(t),patch:{tone:`visited`}})),...N(e,f.get(`- - - -`),`예: "- - - -" 묶음의 정렬된 점수 [50, 80, 150, 150, 210, 260]`)])),d.forEach((a,c)=>{let l=f.get(a.key)??[],u=0,d=l.length,p=[];for(;u<d;){let e=u+d>>1,t=l[e]>=a.target;p.push({l:u,r:d,mid:e,val:l[e],ge:t}),t?d=e:u=e+1}let m=l.length-u,h=p[0];if(s+=1,e.step({title:`문의 ${c+1}: "${a.label}" 묶음 조회`,codeHighlights:_.lookup,work:s,variables:{문의:`${c+1}번`,key:a.key,scores:`[${l.join(`, `)}]`,target:a.target}}),e.phase(`묶음 찾기`,`사전에서 "${a.key}" 묶음을 바로 꺼내면 정렬된 점수 [${l.join(`, `)}]가 나옵니다.`,_.lookup),e.do(...r([...P(e),{type:`set`,id:`q:box`,patch:{text:`Q${c+1}. ${a.label}`,tone:`current`}},...N(e,l,`"${a.key}" 묶음 (${l.length}명) — ${a.target}점 이상 하한 찾기`)])),e.phase(`하한 탐색`,`left = 0, right = ${l.length}에서 mid = ${h.mid}번 칸(${h.val}점)을 확인합니다. ${h.val} ${h.ge?`≥`:`<`} ${a.target}이므로 ${h.ge?`right = ${h.mid}`:`left = ${h.mid+1}`}로 줄입니다.`,_.search),e.do(...r([M(e,{id:`ptr:mid`,kind:`token`,rect:D(h.mid),tone:`current`,text:`mid ${h.mid}`}),{type:`set`,id:A(h.mid),patch:{tone:h.ge?`good`:`bad`}}])),s+=p.length-1,i.push(m),e.step({title:`문의 ${c+1} 하한 확정 → idx = ${u}, ${m}명`,codeHighlights:_.append,work:s,variables:{문의:`${c+1}번`,lowerBound:u,"통과 인원":`${m}명`,answer:`[${i.join(`, `)}]`}}),p.length>1){let t=p.slice(1),i=t.map(e=>`mid=${e.mid}(${e.val}점 ${e.ge?`≥`:`<`} ${a.target})`).join(` → `),o=t.at(-1);e.phase(`가운데 좁히기`,`${i} 순서로 범위를 좁혀 하한 위치 idx = ${n(u)} 찾았습니다.`,_.search),e.do(...r([M(e,{id:`ptr:mid`,kind:`token`,rect:D(o.mid),tone:`current`,text:`mid ${o.mid}`}),...l.map((e,t)=>({type:`set`,id:A(t),patch:{tone:e>=a.target?`good`:`muted`}}))]))}else e.phase(`하한 확정`,`원소가 1개뿐이어서 하한 위치가 idx = ${n(u)} 바로 정해집니다.`,_.search),e.do(...r(l.map((e,t)=>({type:`set`,id:A(t),patch:{tone:e>=a.target?`good`:`muted`}}))));let g=[];if(m>0){let n=T(u),r=T(l.length-1);g.push(M(e,{id:`bound:ring`,kind:`ring`,rect:t({x:n.x,y:n.y,w:r.x+r.w-n.x,h:n.h},4),tone:`good`}))}e.phase(`개수 세기`,`전체 ${l.length}명에서 하한 인덱스 ${o(u,`을`,`를`)} 빼면 ${l.length} - ${u} = ${m}명입니다.`,_.append),e.do(...r([...g,{type:`set`,id:k(c),patch:{text:String(m),tone:`path`},pop:!0}]))}),e.step({title:`모든 문의 완료 → [${i.join(`, `)}]`,codeHighlights:_.done,work:s,variables:{"총 탐색 횟수":s,answer:`[${i.join(`, `)}]`},answer:i,isKeyframe:!0}),e.phase(`정답`,`문의 6개를 모두 조건 묶음 1번 조회와 이분 탐색으로 처리해 총 ${s}번의 점수 확인으로 [${i.join(`, `)}]을 구했습니다.`,_.done),e.do(...r([...P(e),{type:`set`,id:`q:box`,patch:{text:`완료`,tone:`path`}}])),e.finish()}function I(){let e=new a(j()),t=[],n=0;return e.step({title:`지원자 6명을 원래 조건 키 1개에만 저장하고 정렬`,codeHighlights:y.build,work:n,variables:{"지원자 수":u.length,"사전 키 수":p.size,answer:`[]`}}),e.phase(`사전 만들기`,`지원자를 넣을 때는 "-" 없이 원래 조건 키 1개에만 점수를 넣습니다. 저장은 간단하지만 문의에 "-"가 있으면 여러 묶음을 뒤져야 합니다.`,y.build),e.do(...r(u.map((e,t)=>({type:`set`,id:O(t),patch:{tone:`visited`}})))),d.forEach((i,a)=>{let o=h(i.conds),s=0,c=0,l=[];for(let e of o){let t=p.get(e);if(!t)continue;c+=1;let n=0,r=t.length;for(;n<r;){let e=n+r>>1;c+=1,t[e]>=i.target?r=e:n=e+1}s+=t.length-n,l.push(...t)}n+=c,t.push(s),e.step({title:`문의 ${a+1}: 후보 키 ${o.length}개 펼치기 → ${s}명`,codeHighlights:y.search,work:n,variables:{문의:`${a+1}번`,"펼친 키 수":o.length,"이번 확인 횟수":c,"통과 인원":`${s}명`,answer:`[${t.join(`, `)}]`}}),e.phase(`조건 펼치기`,`"${i.label}"의 "-" 자리에 가능한 선택지를 모두 펼치면 후보 키가 ${o.length}개 됩니다.`,y.expand),e.do(...r([...P(e),{type:`set`,id:`q:box`,patch:{text:`Q${a+1}. ${i.label}`,tone:`current`}},...N(e,l,`펼친 키 ${o.length}개에서 찾은 점수들 (${l.length}명)`)])),e.phase(`묶음마다 하한 탐색`,`후보 키 ${o.length}개를 돌며 각 묶음에서 ${i.target}점 이상을 이분 탐색해 모두 더하면 ${s}명입니다 (확인 ${c}회).`,y.search),e.do(...r([...l.map((e,t)=>({type:`set`,id:A(t),patch:{tone:e>=i.target?`good`:`muted`}})),{type:`set`,id:k(a),patch:{text:String(s),tone:`path`},pop:!0}]))}),e.step({title:`모든 문의 완료 → [${t.join(`, `)}]`,codeHighlights:y.done,work:n,variables:{"총 확인 횟수":n,answer:`[${t.join(`, `)}]`},answer:t,isKeyframe:!0}),e.phase(`정답`,`답은 [${t.join(`, `)}]로 같지만, "-"가 섞인 문의마다 최대 24개 묶음을 따로 확인해 정석보다 훨씬 많은 ${n}번을 확인했습니다.`,y.done),e.do({type:`set`,id:`q:box`,patch:{text:`완료`,tone:`path`}}),e.finish()}function L(){let e=new a(j()),t=[],n=0;return e.step({title:`지원자 6명을 정렬 없이 그대로 배열에 보관`,codeHighlights:x.start,work:n,variables:{"지원자 수":u.length,"문의 수":d.length,answer:`[]`}}),e.phase(`준비`,`사전이나 정렬을 만들지 않고 지원자 6명을 순서대로 배열에 넣어 둡니다.`,x.start),e.do({type:`set`,id:`score:title`,patch:{text:`정렬된 점수 배열을 쓰지 않고 위의 지원자 6명을 매번 처음부터 훑습니다`}}),d.forEach((i,a)=>{let o=u.map(e=>e.score>=i.target&&i.conds.every((t,n)=>t===`-`||t===e.words[n])),s=o.filter(Boolean).length;n+=u.length,t.push(s),e.step({title:`문의 ${a+1}: 지원자 6명 전수 조사 → ${s}명`,codeHighlights:x.scan,work:n,variables:{문의:`${a+1}번`,"확인한 지원자":`${u.length}명`,"통과 인원":`${s}명`,answer:`[${t.join(`, `)}]`}}),e.phase(`전수 조사`,`문의 "${i.label}"에 맞는지 지원자 6명을 처음부터 끝까지 모두 확인합니다.`,x.scan),e.do(...r([{type:`set`,id:`q:box`,patch:{text:`Q${a+1}. ${i.label}`,tone:`current`}},{type:`focus`,ids:u.map((e,t)=>O(t))},...u.map((e,t)=>({type:`set`,id:O(t),patch:{tone:o[t]?`good`:`bad`}}))])),e.phase(`개수 기록`,`6명 중 조건과 점수를 모두 만족하는 지원자는 ${s}명입니다.`,x.append),e.do(...r([{type:`unfocus`},{type:`set`,id:k(a),patch:{text:String(s),tone:`path`},pop:!0}]))}),e.step({title:`전수 조사 완료 → [${t.join(`, `)}] (지원자×문의 시간 초과)`,codeHighlights:x.done,work:n,variables:{"총 확인 횟수":n,"최악 연산 수":`50,000 × 100,000 = 50억`,answer:`[${t.join(`, `)}]`},answer:t,isKeyframe:!0}),e.phase(`정답`,`답은 [${t.join(`, `)}]로 같지만 6×6 = ${n}번을 확인했습니다. 지원자 5만 명, 문의 10만 개이면 50억 번 비교해 시간 초과가 납니다.`,x.done),e.do(...r([{type:`set`,id:`q:box`,patch:{text:`시간 초과 위험`,tone:`bad`}},...u.map((e,t)=>({type:`set`,id:O(t),patch:{tone:`plain`}}))])),e.finish()}var R={id:`rank-search`,title:`순위 검색`,level:2,category:`binary-search`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/72412`,description:{summary:`지원서마다 개발 언어, 직군, 경력, 소울푸드 4가지 조건과 코딩테스트 점수가 적혀 있습니다. 개발팀의 문의마다 조건(상관없음 "-" 포함)을 만족하면서 기준 점수 이상을 받은 지원자가 몇 명인지 구합니다.`,rules:[`info 배열의 크기는 1 이상 50,000 이하입니다.`,`각 지원서는 "언어 직군 경력 소울푸드 점수" 형식이며 점수는 1 이상 100,000 이하입니다.`,`query 배열의 크기는 1 이상 100,000 이하입니다.`,`문의 조건에서 "-"는 해당 항목을 고려하지 않겠다는 뜻입니다.`],examples:[{input:`info = ["java backend junior pizza 150", ...6명], query = ["java and backend and junior and pizza 100", ...6개]`,output:`[1, 1, 1, 1, 2, 4]`}]},keyIntuitions:[`문의가 최대 10만 개, 지원자가 최대 5만 명이라 문의마다 지원자를 훑으면 50억 번 비교로 시간 초과가 납니다.`,`지원자 한 명이 속할 수 있는 조건 조합(각 항목을 그대로 두거나 "-"로 바꾼 경우)은 2⁴ = 16가지뿐이므로 미리 사전에 모아 둘 수 있습니다.`,`각 조건 묶음의 점수 배열을 오름차순으로 정렬해 두면, 기준 점수 이상이 처음 나오는 위치(하한, lower bound)를 이분 탐색으로 한 번에 찾습니다.`],demo:{input:[s,c],label:`지원자 6명, 문의 6개 (원문 예제)`},workUnit:`점수·지원자 확인 횟수`,approaches:[{id:`rank-search-lower-bound`,name:`점수 하한 찾기 (16가지 조합 사전 + 이분 탐색)`,rank:`BEST`,timeComplexity:`O(N log N + Q log N)`,spaceComplexity:`O(N)`,verdict:`지원자마다 16가지 조합 키에 점수를 넣고 정렬해 두어, 문의마다 단 한 번의 하한 이분 탐색으로 답을 구합니다.`,pros:[`문의에 "-"가 몇 개 들어 있든 사전에서 키 하나만 찾으면 바로 정렬된 점수 배열이 나옵니다.`,`문의당 이분 탐색 한 번(최대 16번 비교)으로 끝나 문의 10만 개도 순식간에 처리합니다.`],cons:[`지원자 한 명당 16개 키에 점수를 넣으므로 메모리를 16배(최대 80만 개 정수) 씁니다.`,`정렬을 문의 처리 전에 한 번에 해 두어야지, 넣을 때마다 정렬하면 시간 초과가 납니다.`],whyThisRank:`조건 항목이 4개뿐이라 와일드카드 조합이 16가지로 고정됩니다. 전처리에서 16가지 키에 미리 넣어 두면 문의마다 하한 이분 탐색 한 번으로 끝납니다.`,code:g,visualize:F},{id:`rank-search-exact-buckets`,name:`와일드카드 없는 묶음 순회 + 점수 하한 찾기`,rank:`ALTERNATIVE`,timeComplexity:`O(N log N + 24 Q log N)`,spaceComplexity:`O(N)`,verdict:`지원자는 원래 조건 키 1개에만 저장하고, 문의할 때 "-"를 모든 선택지로 펼쳐 각 묶음에서 하한을 찾습니다.`,pros:[`지원자 한 명당 점수를 딱 한 번만 저장해 메모리를 아낍니다.`,`전처리 단계가 단순하고 빠릅니다.`],cons:[`"- and - and - and -" 문의가 들어오면 3×2×2×2 = 24개 묶음을 일일이 돌며 이분 탐색을 최대 24번 반복합니다.`,`문의 수가 10만 개로 커서 정석보다 탐색 연산이 수십 배 더 듭니다.`],whyThisRank:`이분 탐색으로 통과는 하지만, 지원자 수(5만)보다 문의 수(10만)가 더 많은 문제 특성상 문의할 때마다 키를 펼치면 정석보다 손해를 봅니다.`,code:v,visualize:I},{id:`rank-search-linear`,name:`문의마다 지원자 전체를 처음부터 훑기`,rank:`TRAP`,trap:`slow`,timeComplexity:`O(Q × N)`,spaceComplexity:`O(N)`,verdict:`문의가 들어올 때마다 지원자 배열 전체를 처음부터 끝까지 돌며 조건과 점수를 비교합니다.`,pros:[`사전이나 이분 탐색 없이 조건문 하나로 바로 작성할 수 있습니다.`],cons:[`지원자 5만 명 × 문의 10만 개 = 최대 50억 번 확인해야 해서 효율성 테스트를 하나도 통과하지 못합니다.`,`똑같은 조건 조합의 문의를 여러 번 물어도 매번 처음부터 다시 셉니다.`],whyThisRank:`정확성 테스트는 통과하지만 효율성 테스트에서 시간 초과가 나는 대표적인 함정입니다. 조건별 묶음과 점수 정렬을 해 두어야 이분 탐색을 쓸 수 있습니다.`,code:b,visualize:L}],checks:{cases:[{args:[s,c],expected:[1,1,1,1,2,4]},{args:[[`cpp backend junior pizza 100`],[`cpp and backend and junior and pizza 100`,`cpp and backend and junior and pizza 101`,`- and - and - and - 50`]],expected:[1,0,1]},{args:[[`java frontend senior chicken 200`,`java frontend senior chicken 200`,`java frontend senior chicken 199`],[`java and frontend and senior and chicken 200`,`- and - and - and - 300`]],expected:[2,0]}],random:e=>{let t=2+Math.floor(e()*6),n=2+Math.floor(e()*5),r=t=>t[Math.floor(e()*t.length)];return[Array.from({length:t},()=>{let t=m.map(r),n=10*(1+Math.floor(e()*30));return`${t.join(` `)} ${n}`}),Array.from({length:n},()=>{let t=m.map(t=>e()<.4?`-`:r(t)),n=10*(1+Math.floor(e()*30));return`${t[0]} and ${t[1]} and ${t[2]} and ${t[3]} ${n}`})]}}};export{R as default};