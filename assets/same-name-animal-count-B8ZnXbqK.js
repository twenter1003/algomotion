import{n as e,t}from"./index-Cf02qAUa.js";import{c as n,l as r,o as i}from"./shared-CL29HWIp.js";var a=20,o=class extends r{caption=``;acts=[];keyframe=!1;step(e){this.settle(!1),this.keyframe=!!e.isKeyframe,super.step(e)}phase(e,t,n){this.settle(!0),super.phase(e,t,n),this.caption=t,this.acts=[]}do(...e){super.do(...e),this.acts.push(...e)}finish(){return this.settle(!1),super.finish()}settle(n){if(!this.caption)return;let r=n?140:this.keyframe?t:320,i=e({phases:[{label:``,caption:``,actions:this.acts}]}).phases[0],o=Math.max(0,...i.actions.map(e=>e.start+e.duration)),s=a*[...this.caption].length-r-o;this.caption=``,s>0&&o+s>i.end&&super.do({type:`wait`,ms:Math.ceil(s)})}},s=[[`A101`,`Dog`,`Raven`],[`A102`,`Dog`,`Lucy`],[`A103`,`Cat`,null],[`A104`,`Dog`,`Lucy`],[`A105`,`Dog`,`Sam`],[`A106`,`Cat`,null],[`A107`,`Cat`,`Raven`],[`A108`,`Dog`,`Lucy`]],c=[[`Lucy`,3],[`Raven`,2]],l={sql:`SELECT NAME, COUNT(NAME) AS COUNT
FROM ANIMAL_INS
WHERE NAME IS NOT NULL
GROUP BY NAME
HAVING COUNT(NAME) >= 2
ORDER BY NAME ASC;`,python:`def solution(animals):
    # WHERE NAME IS NOT NULL + GROUP BY NAME
    counts = {}
    for animal_id, species, name in animals:
        if name is not None:
            counts[name] = counts.get(name, 0) + 1
    # HAVING COUNT(NAME) >= 2 + ORDER BY NAME ASC
    result = [[name, cnt] for name, cnt in counts.items() if cnt >= 2]
    result.sort(key=lambda r: r[0])
    return result`,javascript:`function solution(animals) {
  // WHERE NAME IS NOT NULL + GROUP BY NAME
  const counts = new Map();
  for (const [, , name] of animals) {
    if (name !== null) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  // HAVING COUNT(NAME) >= 2 + ORDER BY NAME ASC
  const result = [];
  for (const [name, cnt] of counts) {
    if (cnt >= 2) result.push([name, cnt]);
  }
  return result.sort((a, b) => a[0].localeCompare(b[0]));
}`},u={where:i(l,[`FROM ANIMAL_INS`,`WHERE NAME IS NOT NULL`],[`for animal_id, species, name in animals:`,`if name is not None:`],[`for (const [, , name] of animals)`,`if (name !== null)`]),group:i(l,[`GROUP BY NAME`],[`counts[name] = counts.get(name, 0) + 1`],[`counts.set(name, (counts.get(name) ?? 0) + 1)`]),having:i(l,[`HAVING COUNT(NAME) >= 2`],[`result = [[name, cnt] for name, cnt in counts.items() if cnt >= 2]`],[`if (cnt >= 2) result.push([name, cnt]);`]),order:i(l,[`SELECT NAME, COUNT(NAME) AS COUNT`,`ORDER BY NAME ASC;`],[`result.sort(key=lambda r: r[0])`,`return result`],[`return result.sort((a, b) => a[0].localeCompare(b[0]));`])},d={sql:`SELECT NAME, COUNT
FROM (
  SELECT NAME, COUNT(*) AS COUNT
  FROM ANIMAL_INS
  GROUP BY NAME
) G
WHERE NAME IS NOT NULL
  AND COUNT >= 2
ORDER BY NAME ASC;`,python:`def solution(animals):
    # 서브쿼리에서 NULL까지 포함해 먼저 전체 행을 그룹화
    grouped = {}
    for animal_id, species, name in animals:
        grouped[name] = grouped.get(name, 0) + 1
    # 바깥 WHERE에서 NAME IS NOT NULL AND COUNT >= 2 필터
    result = [
        [name, cnt]
        for name, cnt in grouped.items()
        if name is not None and cnt >= 2
    ]
    result.sort(key=lambda r: r[0])
    return result`,javascript:`function solution(animals) {
  // 서브쿼리에서 NULL까지 포함해 먼저 전체 행을 그룹화합니다
  const grouped = new Map();
  for (const [, , name] of animals) {
    grouped.set(name, (grouped.get(name) ?? 0) + 1);
  }
  // 바깥 WHERE에서 NAME IS NOT NULL AND COUNT >= 2 필터
  const result = [];
  for (const [name, cnt] of grouped) {
    if (name !== null && cnt >= 2) result.push([name, cnt]);
  }
  return result.sort((a, b) => a[0].localeCompare(b[0]));
}`},f={groupAll:i(d,[`SELECT NAME, COUNT(*) AS COUNT`,`FROM ANIMAL_INS`,`GROUP BY NAME`],[`for animal_id, species, name in animals:`,`grouped[name] = grouped.get(name, 0) + 1`],[`for (const [, , name] of animals)`,`grouped.set(name, (grouped.get(name) ?? 0) + 1)`]),outerWhere:i(d,[`WHERE NAME IS NOT NULL`,`AND COUNT >= 2`],[`if name is not None and cnt >= 2`],[`if (name !== null && cnt >= 2) result.push([name, cnt]);`]),order:i(d,[`SELECT NAME, COUNT`,`ORDER BY NAME ASC;`],[`result.sort(key=lambda r: r[0])`,`return result`],[`return result.sort((a, b) => a[0].localeCompare(b[0]));`])},p={sql:`-- 함정: WHERE NAME IS NOT NULL 없이 COUNT(*)로 집계
SELECT NAME, COUNT(*) AS COUNT
FROM ANIMAL_INS
GROUP BY NAME
HAVING COUNT(*) >= 2
ORDER BY NAME ASC;`,python:`def solution(animals):
    # 함정: None을 거르지 않고 COUNT(*)로 세어 [None, 2] 그룹이 포함됨
    counts = {}
    for animal_id, species, name in animals:
        counts[name] = counts.get(name, 0) + 1
    result = [[name, cnt] for name, cnt in counts.items() if cnt >= 2]
    result.sort(key=lambda r: (r[0] is not None, r[0] or ''))
    return result`,javascript:`function solution(animals) {
  // 함정: null을 거르지 않고 COUNT(*)로 세어 [null, 2] 그룹이 포함됩니다
  const counts = new Map();
  for (const [, , name] of animals) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const result = [];
  for (const [name, cnt] of counts) {
    if (cnt >= 2) result.push([name, cnt]);
  }
  return result.sort((a, b) => {
    if (a[0] === b[0]) return 0;
    if (a[0] === null) return -1;
    if (b[0] === null) return 1;
    return a[0].localeCompare(b[0]);
  });
}`},m={group:i(p,[`FROM ANIMAL_INS`,`GROUP BY NAME`],[`for animal_id, species, name in animals:`,`counts[name] = counts.get(name, 0) + 1`],[`for (const [, , name] of animals)`,`counts.set(name, (counts.get(name) ?? 0) + 1)`]),having:i(p,[`SELECT NAME, COUNT(*) AS COUNT`,`HAVING COUNT(*) >= 2`,`ORDER BY NAME ASC;`],[`result = [[name, cnt] for name, cnt in counts.items() if cnt >= 2]`,`return result`],[`if (cnt >= 2) result.push([name, cnt]);`,`return result.sort`])},h=600,g=376,_=14,v=36,y=248,b=30,x=35,S=286,C=298,w=e=>({x:_,y:v+e*x,w:y,h:b}),T=e=>({x:S,y:v+e*48,w:C,h:38}),E=e=>`in:${e}`,D=e=>`grp:${e}`,O=([e,t,n])=>`${e} · ${t} · ${n??`NULL`}`;function k(){let e=[{id:`hdr:in`,kind:`text`,rect:{x:_,y:8,w:y,h:22},tone:`muted`,text:`ANIMAL_INS (8행)`},{id:`hdr:grp`,kind:`text`,rect:{x:S,y:8,w:C,h:22},tone:`chosen`,text:`이름별 그룹 집계 / 결과`},{id:`status`,kind:`token`,rect:{x:_,y:328,w:570,h:32},tone:`plain`,text:`쿼리 실행 대기`}];return s.forEach((t,n)=>{e.push({id:E(n),kind:`token`,rect:w(n),tone:`plain`,text:O(t)})}),{width:h,height:g,items:e}}var A=e=>({type:`wait`,ms:e}),j=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function M(){let e=new o(k()),t=0,r=new Map,i=(e,n=`-`)=>({work:t,variables:{절:e,이름:n,그룹수:r.size}});return s.forEach(([a,,o],s)=>{if(t+=1,o===null){e.step({title:`WHERE 검사: ${a} (NAME=NULL) → 그룹화 전에 제외`,codeHighlights:u.where,...i(`WHERE`,`NULL`)}),e.phase(`NULL 제외`,`${a} 행은 NAME이 NULL이므로 WHERE NAME IS NOT NULL에서 바로 걸러져 그룹 버킷조차 만들지 않습니다.`,u.where),e.do(...n([j(E(s),`muted`),{type:`set`,id:`status`,patch:{text:`${a}: NAME IS NULL → 그룹화 제외`,tone:`muted`},pop:!0}]),A(150));return}let c=r.get(o),l=c?c.slot:r.size,d=(c?.count??0)+1;r.set(o,{slot:l,count:d}),e.step({title:`GROUP BY: ${a} (${o}) → ${o} 그룹 ${d}마리`,codeHighlights:u.group,...i(`GROUP BY`,o)}),e.phase(`이름별 집계`,`이름이 있는 ${a}(${o}) 행을 '${o}' 그룹에 넣고 COUNT(NAME)을 ${d}로 갱신합니다.`,u.group),c?e.do(...n([j(E(s),`visited`),{type:`set`,id:D(l),patch:{text:`${o} → COUNT = ${d}`,tone:d>=2?`good`:`plain`},pop:!0}]),A(160)):e.do(...n([j(E(s),`visited`),{type:`add`,item:{id:D(l),kind:`token`,rect:T(l),tone:`plain`,text:`${o} → COUNT = 1`},from:E(s)}]),A(160))}),t+=r.size,e.step({title:`HAVING COUNT(NAME) >= 2: Sam(1마리) 제외, 2개 그룹 통과`,codeHighlights:u.having,...i(`HAVING`,`Lucy, Raven`)}),e.phase(`HAVING 필터`,`그룹화된 3개 이름 중 COUNT가 1인 Sam은 버리고 2마리 이상인 Raven(2)과 Lucy(3)만 남깁니다.`,u.having),e.do(...n([j(D(0),`good`),j(D(1),`good`),j(D(2),`muted`),{type:`set`,id:`status`,patch:{text:`HAVING COUNT(NAME) >= 2 → Raven(2), Lucy(3) 통과`,tone:`chosen`},pop:!0}]),A(200)),e.step({title:`ORDER BY NAME ASC → [[Lucy, 3], [Raven, 2]]`,codeHighlights:u.order,...i(`ORDER BY`,`완료`),answer:c,isKeyframe:!0}),e.phase(`이름순 정렬`,`이름 오름차순(Lucy → Raven)으로 정렬해 최종 결과를 반환합니다.`,u.order),e.do(...n([{type:`set`,id:D(0),patch:{text:`1행: [Lucy, 3]`,tone:`path`},pop:!0},{type:`set`,id:D(1),patch:{text:`2행: [Raven, 2]`,tone:`path`},pop:!0},{type:`remove`,id:D(2)},{type:`set`,id:`status`,patch:{text:`정답: [['Lucy', 3], ['Raven', 2]] (연산 ${t}회)`,tone:`path`},pop:!0}])),e.finish()}function N(){let e=new o(k()),t=0,r=new Map,i=(e,n=`-`)=>({work:t,variables:{절:e,이름:n,그룹수:r.size}});return s.forEach(([a,,o],s)=>{t+=1;let c=r.get(o),l=c?c.slot:r.size,u=(c?.count??0)+1;r.set(o,{slot:l,count:u});let d=o??`NULL`;e.step({title:`서브쿼리 GROUP BY: ${a} (${d}) → ${d} 버킷 ${u}건`,codeHighlights:f.groupAll,...i(`서브쿼리 GROUP BY`,d)}),e.phase(`전체 그룹화`,`WHERE 없이 먼저 묶으므로 ${a}의 ${d}도 그룹 버킷에 넣어 집계합니다.`,f.groupAll),c?e.do(...n([j(E(s),`visited`),{type:`set`,id:D(l),patch:{text:`${d} → COUNT = ${u}`,tone:`chosen`},pop:!0}]),A(150)):e.do(...n([j(E(s),`visited`),{type:`add`,item:{id:D(l),kind:`token`,rect:T(l),tone:`chosen`,text:`${d} → COUNT = 1`},from:E(s)}]),A(150))}),t+=r.size+2,e.step({title:`바깥 WHERE: 만들어진 4개 그룹에서 NULL 그룹과 Sam 제외`,codeHighlights:f.outerWhere,...i(`바깥 WHERE`,`NULL, Sam 제외`)}),e.phase(`뒤늦은 필터`,`이미 만든 NULL(2건) 그룹과 Sam(1건) 그룹을 바깥 쿼리 WHERE에서 뒤늦게 버립니다.`,f.outerWhere),e.do(...n([j(D(0),`good`),j(D(1),`good`),j(D(2),`muted`),j(D(3),`muted`),{type:`set`,id:`status`,patch:{text:`불필요하게 만든 NULL 그룹을 뒤늦게 제거`,tone:`chosen`},pop:!0}]),A(200)),e.step({title:`ORDER BY 완료: 정답 동일, 연산 ${t}회 (정석은 11회)`,codeHighlights:f.order,...i(`ORDER BY`,`완료`),answer:c,isKeyframe:!0}),e.phase(`마무리`,`결과는 같지만 NULL 행까지 그룹 해시 테이블에 넣고 다시 거르느라 총 ${t}번 연산했습니다.`,f.order),e.do(...n([{type:`set`,id:D(0),patch:{text:`1행: [Lucy, 3]`,tone:`path`},pop:!0},{type:`set`,id:D(1),patch:{text:`2행: [Raven, 2]`,tone:`path`},pop:!0},{type:`remove`,id:D(2)},{type:`remove`,id:D(3)},{type:`set`,id:`status`,patch:{text:`정답 동일: [['Lucy', 3], ['Raven', 2]] (연산 ${t}회)`,tone:`path`},pop:!0}])),e.finish()}function P(){let e=new o(k()),t=0,r=new Map,i=(e,n=`-`)=>({work:t,variables:{절:e,이름:n,그룹수:r.size}});s.forEach(([a,,o],s)=>{t+=1;let c=r.get(o),l=c?c.slot:r.size,u=(c?.count??0)+1;r.set(o,{slot:l,count:u});let d=o??`NULL`,f=o===null&&u>=2;e.step({title:`GROUP BY: ${a} (${d}) → COUNT(*) = ${u}${f?` (함정!)`:``}`,codeHighlights:m.group,...i(`GROUP BY`,d)}),e.phase(`NULL까지 묶기`,f?`GROUP BY는 NULL끼리도 한 그룹으로 묶고, COUNT(*)는 NULL 행도 세므로 [NULL, 2] 그룹이 2건 이상이 되어 버립니다!`:`WHERE NAME IS NOT NULL 없이 ${a}(${d}) 행을 그대로 그룹에 합칩니다.`,m.group),c?e.do(...n([j(E(s),o===null?`bad`:`visited`),{type:`set`,id:D(l),patch:{text:`${d} → COUNT(*) = ${u}`,tone:o===null?`bad`:u>=2?`chosen`:`plain`},pop:!0}]),A(150)):e.do(...n([j(E(s),o===null?`bad`:`visited`),{type:`add`,item:{id:D(l),kind:`token`,rect:T(l),tone:o===null?`bad`:`plain`,text:`${d} → COUNT(*) = 1`},from:E(s)}]),A(150))});let a=[[null,2],[`Lucy`,3],[`Raven`,2]];return t+=r.size,e.step({title:`오답: 이름 없는 동물 그룹 [null, 2]가 결과에 포함됨`,codeHighlights:m.having,...i(`HAVING`,`오답`),answer:a,isKeyframe:!0}),e.phase(`오답 확인`,`이름 없는 동물은 제외하라는 조건을 빠뜨리고 COUNT(*)를 써서 [null, 2] 행이 함께 출력되었습니다.`,m.having),e.do(...n([j(D(0),`chosen`),j(D(1),`chosen`),j(D(2),`bad`),j(D(3),`muted`),{type:`set`,id:`status`,patch:{text:`오답: [[null, 2], [Lucy, 3], [Raven, 2]] · NULL 그룹 혼입!`,tone:`bad`},pop:!0}])),e.finish()}var F={id:`same-name-animal-count`,title:`동명 동물 수 찾기`,level:2,category:`sql-group-by`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/59041`,description:{summary:`ANIMAL_INS 테이블에 들어온 동물 이름 중 두 번 이상 쓰인 이름과 해당 이름이 쓰인 횟수를 조회합니다. 이때 이름이 없는 동물은 집계에서 제외하며, 결과는 이름 순으로 오름차순 정렬합니다.`,rules:[`이름이 없는(NAME IS NULL) 동물은 집계에서 제외함`,`두 번 이상 쓰인 이름(COUNT >= 2)만 출력함`,`결과는 이름(NAME) 오름차순으로 정렬함`],examples:[{input:`ANIMAL_INS = [["A101","Dog","Raven"],["A102","Dog","Lucy"],["A103","Cat",null],["A104","Dog","Lucy"],["A105","Dog","Sam"],["A106","Cat",null],["A107","Cat","Raven"],["A108","Dog","Lucy"]]`,output:`[["Lucy", 3], ["Raven", 2]]`}]},keyIntuitions:[`그룹화하기 전에 걸러낼 수 있는 조건(NAME IS NOT NULL)은 WHERE 절에 적어 일찍 제외해야 불필요한 NULL 그룹이 생기지 않습니다.`,`GROUP BY는 NULL 값들도 하나의 같은 그룹으로 묶고, COUNT(*)는 NULL 행까지 개수로 세므로 주의해야 합니다.`,`그룹별 개수가 2 이상인지 검사하는 조건은 집계 이후에 판단하므로 HAVING COUNT(NAME) >= 2에 적습니다.`],demo:{input:[s],label:`ANIMAL_INS 8행 (Lucy 3마리, Raven 2마리, Sam 1마리, NULL 2마리)`},workUnit:`처리한 행 및 그룹 수`,approaches:[{id:`same-name-where-having`,name:`WHERE IS NOT NULL + HAVING`,rank:`BEST`,timeComplexity:`O(N + G log G)`,spaceComplexity:`O(G)`,verdict:`WHERE NAME IS NOT NULL로 이름 없는 동물을 먼저 제외한 뒤 GROUP BY와 HAVING으로 2마리 이상인 이름만 추리는 정석 풀이입니다.`,pros:[`그룹 해시 테이블에 NULL 키가 아예 들어가지 않아 메모리와 집계 비용을 아낍니다.`,`WHERE(그룹화 전 행 필터)와 HAVING(그룹화 후 집계 필터)의 역할을 정확히 나눕니다.`],cons:[`WHERE와 HAVING의 실행 순서를 헷갈리지 않아야 합니다.`],whyThisRank:`가장 적은 수의 행만 그룹화하고 표준 SQL 실행 순서에 맞게 조건을 배치한 정석 쿼리입니다.`,code:l,visualize:M},{id:`same-name-subquery-filter`,name:`전체 그룹화 후 바깥 WHERE 필터`,rank:`ALTERNATIVE`,timeComplexity:`O(N + G log G)`,spaceComplexity:`O(G)`,verdict:`NULL까지 포함해 전체 행을 먼저 그룹화한 뒤 바깥 쿼리의 WHERE에서 NULL 그룹과 1마리 그룹을 거르는 풀이입니다.`,pros:[`집계 결과를 일반 테이블처럼 바깥 WHERE 한 곳에서 조건으로 다룰 수 있습니다.`],cons:[`버려질 NULL 행들까지 그룹화하고 세는 불필요한 작업이 추가됩니다.`],whyThisRank:`정답은 같지만 그룹화 전에 제외할 수 있는 NULL 행까지 모두 집계에 포함시켜 작업량이 더 많습니다.`,code:d,visualize:N},{id:`same-name-null-group-trap`,name:`WHERE 누락 + COUNT(*) >= 2`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N + G log G)`,spaceComplexity:`O(G)`,verdict:`WHERE NAME IS NOT NULL 없이 GROUP BY NAME HAVING COUNT(*) >= 2를 써서 이름 없는 동물 2마리가 [null, 2] 그룹으로 출력되는 함정입니다.`,pros:[`쿼리가 짧아 보여 초보자가 가장 흔히 먼저 작성하는 형태입니다.`],cons:[`SQL의 GROUP BY는 NULL끼리도 한 그룹으로 묶기 때문에 이름 없는 동물이 2마리 이상이면 [null, 2] 행이 결과에 섞입니다.`],whyThisRank:`GROUP BY가 NULL을 하나의 그룹으로 묶는다는 성질을 놓쳐 틀리는 대표적인 함정입니다.`,code:p,visualize:P}],checks:{cases:[{args:[s],expected:c},{args:[[[`A1`,`Dog`,`Max`],[`A2`,`Cat`,null],[`A3`,`Dog`,`Max`],[`A4`,`Cat`,`Leo`]]],expected:[[`Max`,2]]},{args:[[[`B1`,`Dog`,`Coco`],[`B2`,`Cat`,null],[`B3`,`Dog`,null]]],expected:[]}],random:e=>{let t=[`Lucy`,`Raven`,`Sam`,`Max`,`Coco`,null],n=4+Math.floor(e()*6);return[Array.from({length:n},(n,r)=>[`A${100+r}`,e()<.5?`Dog`:`Cat`,t[Math.floor(e()*t.length)]])]}}};export{F as default};