import{n as e,t}from"./index-D3a9ZpZK.js";import{c as n,l as r,o as i}from"./shared-CL29HWIp.js";var a=20,o=class extends r{caption=``;acts=[];keyframe=!1;step(e){this.settle(!1),this.keyframe=!!e.isKeyframe,super.step(e)}phase(e,t,n){this.settle(!0),super.phase(e,t,n),this.caption=t,this.acts=[]}do(...e){super.do(...e),this.acts.push(...e)}finish(){return this.settle(!1),super.finish()}settle(n){if(!this.caption)return;let r=n?140:this.keyframe?t:320,i=e({phases:[{label:``,caption:``,actions:this.acts}]}).phases[0],o=Math.max(0,...i.actions.map(e=>e.start+e.duration)),s=a*[...this.caption].length-r-o;this.caption=``,s>0&&o+s>i.end&&super.do({type:`wait`,ms:Math.ceil(s)})}},s=[[`A350`,`Sugar`],[`A352`,`Jewel`],[`A354`,`Romy`],[`A358`,`Nabi`]],c=[[`A355`,`Allie`],[`A350`,`Sugar`],[`A349`,`Bambi`],[`A352`,`Jewel`],[`A358`,`Nabi`],[`A351`,`Coco`]],l=[[`A349`,`Bambi`],[`A351`,`Coco`],[`A355`,`Allie`]],u={sql:`SELECT O.ANIMAL_ID, O.NAME
FROM ANIMAL_OUTS O
LEFT JOIN ANIMAL_INS I
  ON O.ANIMAL_ID = I.ANIMAL_ID
WHERE I.ANIMAL_ID IS NULL
ORDER BY O.ANIMAL_ID ASC;`,python:`def solution(ins, outs):
    # ANIMAL_INS의 ANIMAL_ID 집합(인덱스) 준비
    in_ids = {animal_id for animal_id, _ in ins}
    # ANIMAL_OUTS LEFT JOIN ANIMAL_INS + WHERE I.ANIMAL_ID IS NULL
    missing = [
        [animal_id, name]
        for animal_id, name in outs
        if animal_id not in in_ids
    ]
    # ORDER BY O.ANIMAL_ID ASC
    missing.sort(key=lambda r: r[0])
    return missing`,javascript:`function solution(ins, outs) {
  // ANIMAL_INS의 ANIMAL_ID 집합(인덱스) 준비
  const inIds = new Set(ins.map(([id]) => id));
  // ANIMAL_OUTS LEFT JOIN ANIMAL_INS + WHERE I.ANIMAL_ID IS NULL
  const missing = outs
    .filter(([id]) => !inIds.has(id))
    .map(([id, name]) => [id, name]);
  // ORDER BY O.ANIMAL_ID ASC
  return missing.sort((a, b) => a[0].localeCompare(b[0]));
}`},d={index:i(u,[`FROM ANIMAL_OUTS O`,`LEFT JOIN ANIMAL_INS I`],[`in_ids = {animal_id for animal_id, _ in ins}`],[`const inIds = new Set(ins.map(([id]) => id));`]),joinWhere:i(u,[`LEFT JOIN ANIMAL_INS I`,`ON O.ANIMAL_ID = I.ANIMAL_ID`,`WHERE I.ANIMAL_ID IS NULL`],[`for animal_id, name in outs`,`if animal_id not in in_ids`],[`.filter(([id]) => !inIds.has(id))`]),order:i(u,[`ORDER BY O.ANIMAL_ID ASC;`],[`missing.sort(key=lambda r: r[0])`],[`return missing.sort((a, b) => a[0].localeCompare(b[0]));`]),select:i(u,[`SELECT O.ANIMAL_ID, O.NAME`],[`return missing`],[`return missing.sort((a, b) => a[0].localeCompare(b[0]));`])},f={sql:`SELECT O.ANIMAL_ID, O.NAME
FROM ANIMAL_OUTS O
WHERE NOT EXISTS (
  SELECT 1
  FROM ANIMAL_INS I
  WHERE I.ANIMAL_ID = O.ANIMAL_ID
)
ORDER BY O.ANIMAL_ID ASC;`,python:`def solution(ins, outs):
    # ANIMAL_OUTS 각 행마다 ANIMAL_INS 전체를 처음부터 끝까지 훑어 대조
    missing = []
    for out_id, name in outs:
        found = False
        for in_id, _ in ins:
            if out_id == in_id:
                found = True
        if not found:
            missing.append([out_id, name])
    missing.sort(key=lambda r: r[0])
    return missing`,javascript:`function solution(ins, outs) {
  // ANIMAL_OUTS 각 행마다 ANIMAL_INS 전체를 처음부터 끝까지 훑어 대조합니다
  const missing = [];
  for (const [outId, name] of outs) {
    let found = false;
    for (const [inId] of ins) {
      if (outId === inId) found = true;
    }
    if (!found) missing.push([outId, name]);
  }
  return missing.sort((a, b) => a[0].localeCompare(b[0]));
}`},p={scan:i(f,[`FROM ANIMAL_OUTS O`,`WHERE NOT EXISTS (`,`FROM ANIMAL_INS I`,`WHERE I.ANIMAL_ID = O.ANIMAL_ID`],[`for out_id, name in outs:`,`for in_id, _ in ins:`,`if not found:`],[`for (const [outId, name] of outs)`,`for (const [inId] of ins)`,`if (!found) missing.push([outId, name]);`]),done:i(f,[`SELECT O.ANIMAL_ID, O.NAME`,`ORDER BY O.ANIMAL_ID ASC;`],[`missing.sort(key=lambda r: r[0])`,`return missing`],[`return missing.sort((a, b) => a[0].localeCompare(b[0]));`])},m={sql:`-- 함정: 테이블 순서를 반대로 써서 ANIMAL_INS를 왼쪽에 둠
SELECT I.ANIMAL_ID, I.NAME
FROM ANIMAL_INS I
LEFT JOIN ANIMAL_OUTS O
  ON I.ANIMAL_ID = O.ANIMAL_ID
WHERE O.ANIMAL_ID IS NULL
ORDER BY I.ANIMAL_ID ASC;`,python:`def solution(ins, outs):
    # 함정: ANIMAL_INS를 기준으로 잡고 ANIMAL_OUTS에 없는(미입양) 동물을 찾음
    out_ids = {animal_id for animal_id, _ in outs}
    wrong = [
        [animal_id, name]
        for animal_id, name in ins
        if animal_id not in out_ids
    ]
    wrong.sort(key=lambda r: r[0])
    return wrong`,javascript:`function solution(ins, outs) {
  // 함정: ANIMAL_INS를 기준으로 잡고 ANIMAL_OUTS에 없는(미입양) 동물을 찾습니다
  const outIds = new Set(outs.map(([id]) => id));
  const wrong = ins
    .filter(([id]) => !outIds.has(id))
    .map(([id, name]) => [id, name]);
  return wrong.sort((a, b) => a[0].localeCompare(b[0]));
}`},h={join:i(m,[`FROM ANIMAL_INS I`,`LEFT JOIN ANIMAL_OUTS O`,`WHERE O.ANIMAL_ID IS NULL`],[`for animal_id, name in ins`,`if animal_id not in out_ids`],[`const wrong = ins`,`.filter(([id]) => !outIds.has(id))`]),done:i(m,[`SELECT I.ANIMAL_ID, I.NAME`,`ORDER BY I.ANIMAL_ID ASC;`],[`wrong.sort(key=lambda r: r[0])`,`return wrong`],[`return wrong.sort((a, b) => a[0].localeCompare(b[0]));`])},g=600,_=360,v=12,y=204,b=396,x=36,S=32,C=38,w=180,T=180,E=192,D=e=>({x:v,y:x+e*C,w,h:S}),O=e=>({x:y,y:x+e*C,w:T,h:S}),k=e=>({x:b,y:x+e*42,w:E,h:34}),A=e=>`outs:${e}`,j=e=>`ins:${e}`,M=e=>`res:${e}`;function N(){let e=[{id:`hdr:outs`,kind:`text`,rect:{x:v,y:8,w,h:22},tone:`chosen`,text:`ANIMAL_OUTS (입양 6건)`},{id:`hdr:ins`,kind:`text`,rect:{x:y,y:8,w:T,h:22},tone:`muted`,text:`ANIMAL_INS (보호 4건)`},{id:`hdr:res`,kind:`text`,rect:{x:b,y:8,w:E,h:22},tone:`chosen`,text:`유실된 기록 (IS NULL)`},{id:`status`,kind:`token`,rect:{x:v,y:314,w:576,h:32},tone:`plain`,text:`LEFT JOIN 대기`}];return c.forEach(([t,n],r)=>{e.push({id:A(r),kind:`token`,rect:D(r),tone:`plain`,text:`${t} · ${n}`})}),s.forEach(([t,n],r)=>{e.push({id:j(r),kind:`token`,rect:O(r),tone:`plain`,text:`${t} · ${n}`})}),{width:g,height:_,items:e}}var P=e=>({type:`wait`,ms:e}),F=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function I(){let e=new o(N()),t=0,r=new Map(s.map(([e],t)=>[e,t])),i=[],a=(e,n=`-`)=>({work:t,variables:{절:e,대상동물:n,유실기록수:i.length}});return t+=s.length,e.step({title:`LEFT JOIN 준비: ANIMAL_OUTS를 왼쪽 기준, ANIMAL_INS 키 색인 생성`,codeHighlights:d.index,...a(`LEFT JOIN 준비`)}),e.phase(`기준 테이블 설정`,`입양 기록(ANIMAL_OUTS)은 있는데 보호 시작 기록(ANIMAL_INS)이 없는 동물을 찾아야 하므로 ANIMAL_OUTS를 LEFT JOIN의 왼쪽에 둡니다.`,d.index),e.do(...n([...s.map((e,t)=>F(j(t),`visited`)),{type:`set`,id:`status`,patch:{text:`ANIMAL_OUTS O LEFT JOIN ANIMAL_INS I ON O.ANIMAL_ID = I.ANIMAL_ID`,tone:`chosen`},pop:!0}]),P(180)),c.forEach(([o,s],c)=>{let l=r.get(o),u=l===void 0;if(t+=1,u&&i.push([o,s]),e.step({title:`O.${o}(${s}) 조인 → I.ANIMAL_ID = ${u?`NULL (유실 기록!)`:o}`,codeHighlights:d.joinWhere,...a(`LEFT JOIN + WHERE`,`${o}(${s})`)}),e.phase(`LEFT JOIN & IS NULL 검사`,u?`입양 간 ${o}(${s})는 ANIMAL_INS에 짝이 없어 I.ANIMAL_ID가 NULL이 됩니다. 유실된 기록이므로 선택합니다!`:`입양 간 ${o}(${s})는 ANIMAL_INS #${l+1} 행과 매칭되어 I.ANIMAL_ID가 NULL이 아니므로 제외합니다.`,d.joinWhere),u){let t=i.length-1;e.do(...n([{type:`focus`,ids:[A(c)]},F(A(c),`good`),{type:`add`,item:{id:M(t),kind:`token`,rect:k(t),tone:`chosen`,text:`${o} · ${s} (I=NULL)`},from:A(c)}]),P(180),{type:`unfocus`})}else e.do(...n([{type:`focus`,ids:[A(c),j(l)]},F(A(c),`muted`),F(j(l),`explored`)]),P(160),{type:`unfocus`})}),t+=i.length,e.step({title:`ORDER BY O.ANIMAL_ID ASC: 유실 기록 ${i.length}건을 ID 오름차순 정렬`,codeHighlights:d.order,...a(`ORDER BY`,`A349, A351, A355`)}),e.phase(`ID 오름차순 정렬`,`추려낸 3건(A355, A349, A351)을 ANIMAL_ID 오름차순(A349 → A351 → A355)으로 정렬합니다.`,d.order),e.do(...n([...l.map(([e,t],n)=>({type:`set`,id:M(n),patch:{text:`${e} · ${t}`,tone:`current`},pop:!0})),{type:`set`,id:`status`,patch:{text:`ORDER BY O.ANIMAL_ID ASC → A349, A351, A355`,tone:`chosen`},pop:!0}]),P(180)),e.step({title:`SELECT 완료: 유실 기록 ${l.length}건 출력 (연산 ${t}회)`,codeHighlights:d.select,...a(`SELECT`,`완료`),answer:l,isKeyframe:!0}),e.phase(`마무리`,`LEFT JOIN과 WHERE I.ANIMAL_ID IS NULL로 보호 기록이 유실된 3마리를 총 ${t}번의 연산으로 찾았습니다.`,d.select),e.do(...n([...l.map((e,t)=>F(M(t),`path`)),{type:`set`,id:`status`,patch:{text:`정답: [[A349, Bambi], [A351, Coco], [A355, Allie]]`,tone:`path`},pop:!0}])),e.finish()}function L(){let e=new o(N()),t=0,r=[],i=e=>({work:t,variables:{방식:`중첩 루프 대조`,단계:e,유실기록수:r.length}});return c.forEach(([a,o],c)=>{t+=s.length;let l=s.findIndex(([e])=>e===a)<0;if(l&&r.push([a,o]),e.step({title:`O.${a}(${o}) ↔ ANIMAL_INS ${s.length}건 전체 스캔 (누적 ${t}회)`,codeHighlights:p.scan,...i(`${a} 대조`)}),e.phase(`전체 행 순차 비교`,l?`${a}(${o})를 찾기 위해 ANIMAL_INS ${s.length}건을 끝까지 다 훑어 없는 것을 확인합니다.`:`${a}(${o})가 있는지 ANIMAL_INS ${s.length}건을 매번 처음부터 끝까지 대조합니다.`,p.scan),l){let t=r.length-1;e.do(...n([F(A(c),`good`),{type:`add`,item:{id:M(t),kind:`token`,rect:k(t),tone:`chosen`,text:`${a} · ${o}`},from:A(c)}]),P(150))}else e.do(F(A(c),`muted`),P(140))}),t+=r.length,e.step({title:`정렬 및 반환: 정답은 같지만 비교 연산 ${t}회`,codeHighlights:p.done,...i(`완료`),answer:l,isKeyframe:!0}),e.phase(`마무리`,`결과는 같지만 해시/인덱스 조인(13회) 대신 매 행마다 ANIMAL_INS 전체를 훑어 총 ${t}번 연산했습니다.`,p.done),e.do(...n([...l.map(([e,t],n)=>({type:`set`,id:M(n),patch:{text:`${e} · ${t}`,tone:`path`},pop:!0})),{type:`set`,id:`status`,patch:{text:`정답 동일 · 중첩 대조로 총 ${t}회 연산`,tone:`path`},pop:!0}])),e.finish()}function R(){let e=new o(N()),t=0,r=new Set(c.map(([e])=>e)),i=[],a=(e,n=`-`)=>({work:t,variables:{절:e,대상:n,기준테이블:`ANIMAL_INS(역방향!)`,선택수:i.length}});return s.forEach(([o,s],c)=>{let l=r.has(o);if(t+=1,l||i.push([o,s]),e.step({title:`함정 스캔: I.${o}(${s}) → O.ANIMAL_ID ${l?`존재`:`NULL (미입양 동물!)`}`,codeHighlights:h.join,...a(`역방향 LEFT JOIN`,`${o}(${s})`)}),e.phase(`반대 방향 LEFT JOIN`,l?`ANIMAL_INS를 왼쪽에 두었기 때문에 보호 기록이 있는 ${o}(${s})만 검사하고, 아예 INS에 없는 유실 기록(A349, A351, A355)은 보지도 못합니다.`:`${o}(${s})는 보호소에는 들어왔지만 아직 입양을 안 간 동물인데, O.ANIMAL_ID IS NULL 조건에 걸려 잘못 선택됩니다!`,h.join),l)e.do(F(j(c),`visited`),P(150));else{let t=i.length-1;e.do(...n([F(j(c),`bad`),{type:`add`,item:{id:M(t),kind:`token`,rect:k(t),tone:`bad`,text:`${o} · ${s} (미입양)`},from:j(c)}]),P(180))}}),e.step({title:`오답: 유실된 입양 기록 대신 아직 입양 못 간 A354(Romy) 반환`,codeHighlights:h.done,...a(`SELECT`,`오답`),answer:i,isKeyframe:!0}),e.phase(`오답 확인`,`LEFT JOIN에서 어느 테이블을 왼쪽(FROM)에 둘지 거꾸로 쓰면 완전히 다른 질문(아직 입양 못 간 동물 찾기)의 답이 나옵니다.`,h.done),e.do({type:`set`,id:`status`,patch:{text:`오답 [[A354, Romy]] 반환 · 정답은 [[A349, Bambi], [A351, Coco], [A355, Allie]]`,tone:`bad`},pop:!0}),e.finish()}var z={id:`missing-records`,title:`없어진 기록 찾기`,level:3,category:`sql-join`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/59042`,description:{summary:`천재지변으로 인해 일부 데이터가 유실되었습니다. 입양을 간 기록(ANIMAL_OUTS)은 있는데, 보호소에 들어온 기록(ANIMAL_INS)은 없는 동물의 ID와 이름을 ID 순으로 조회하는 SQL 문을 작성합니다.`,rules:[`ANIMAL_INS는 동물 보호소에 들어온 동물의 정보를 담은 테이블이며, ANIMAL_OUTS는 입양 보낸 동물의 정보를 담은 테이블임`,`입양을 간 기록은 있고 보호소에 들어온 기록은 없는 동물의 ANIMAL_ID와 NAME을 조회`,`결과는 ANIMAL_ID 오름차순으로 정렬`],examples:[{input:`ANIMAL_INS = [["A350","Sugar"],["A352","Jewel"],["A354","Romy"],["A358","Nabi"]], ANIMAL_OUTS = [["A355","Allie"],["A350","Sugar"],["A349","Bambi"],["A352","Jewel"],["A358","Nabi"],["A351","Coco"]]`,output:`[["A349","Bambi"],["A351","Coco"],["A355","Allie"]]`}]},keyIntuitions:[`"A에는 있는데 B에는 없는 행"을 찾을 때는 A를 FROM(왼쪽)에 두고 B를 LEFT JOIN한 뒤 WHERE B.KEY IS NULL로 거릅니다.`,`이 문제는 입양 기록(ANIMAL_OUTS)이 기준이므로 FROM ANIMAL_OUTS O LEFT JOIN ANIMAL_INS I 순서를 지켜야 합니다.`,`테이블 순서를 반대로 쓰면 "보호소에 들어왔는데 아직 입양을 못 간 동물(오랜 기간 보호한 동물)"을 조회하게 됩니다.`],demo:{input:[s,c],label:`ANIMAL_OUTS 6건 중 ANIMAL_INS(4건)에 없는 유실 기록 3건 찾기`},workUnit:`조인·비교한 행 수`,approaches:[{id:`missing-records-left-join-is-null`,name:`LEFT JOIN + IS NULL`,rank:`BEST`,timeComplexity:`O(N + M + K log K)`,spaceComplexity:`O(N + K)`,verdict:`ANIMAL_OUTS를 왼쪽에 두고 ANIMAL_INS를 LEFT JOIN한 뒤 I.ANIMAL_ID IS NULL인 행만 추리는 정석 안티 조인(Anti-Join) 쿼리입니다.`,pros:[`인덱스/해시 조인으로 두 테이블을 한 번씩만 훑어 빠르고 직관적입니다.`,`LEFT JOIN + IS NULL 패턴은 차집합(OUTS − INS)을 구하는 표준 SQL 관용구입니다.`],cons:[`WHERE 절에서 O.ANIMAL_ID가 아니라 반드시 오른쪽 테이블의 기본키(I.ANIMAL_ID)가 NULL인지 검사해야 합니다.`],whyThisRank:`SQL 옵티마이저가 Anti-Join으로 바로 최적화하며, 의도가 가장 선명하게 드러납니다.`,code:u,visualize:I},{id:`missing-records-nested-scan`,name:`매 행마다 ANIMAL_INS 전체 대조`,rank:`ALTERNATIVE`,timeComplexity:`O(N × M)`,spaceComplexity:`O(K)`,verdict:`ANIMAL_OUTS의 각 동물마다 ANIMAL_INS 전체를 처음부터 끝까지 훑으며 일치하는 ID가 없는지 확인하는 풀이입니다.`,pros:[`조인 문법 없이 중첩 반복이나 상관 서브쿼리 사고방식 그대로 이해할 수 있습니다.`],cons:[`입양 기록마다 보호 기록 테이블을 반복 스캔하므로 데이터가 커지면 비교 횟수가 급증합니다.`],whyThisRank:`정답은 같지만 인덱스/해시 기반 LEFT JOIN보다 비교 연산이 훨씬 많습니다.`,code:f,visualize:L},{id:`missing-records-reversed-table-trap`,name:`테이블 순서 반대 (INS LEFT JOIN OUTS)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N + M)`,spaceComplexity:`O(K)`,verdict:`FROM ANIMAL_INS LEFT JOIN ANIMAL_OUTS로 테이블 순서를 거꾸로 써서 유실된 입양 기록 대신 미입양 동물을 뽑는 함정입니다.`,pros:[`쿼리 구조가 거의 똑같아 보여 실수하기 매우 쉽습니다.`],cons:[`ANIMAL_INS에 아예 없는 유실 동물(A349, A351, A355)은 왼쪽 테이블에조차 없으므로 절대 결과에 나올 수 없습니다.`,`대신 보호소에만 있고 입양을 못 간 동물(A354)이 출력되어 오답이 됩니다.`],whyThisRank:`LEFT JOIN에서는 "살려야 하는 쪽(데이터가 남아 있는 ANIMAL_OUTS)"이 반드시 왼쪽에 와야 합니다.`,code:m,visualize:R}],checks:{cases:[{args:[s,c],expected:l},{args:[[[`A100`,`Max`],[`A200`,`Bella`]],[[`A300`,`Charlie`],[`A100`,`Max`],[`A050`,`Lucy`]]],expected:[[`A050`,`Lucy`],[`A300`,`Charlie`]]},{args:[[[`A101`,`Leo`],[`A102`,`Milo`]],[[`A101`,`Leo`]]],expected:[]}],random:e=>{let t=Array.from({length:8},(e,t)=>[`A30${t+1}`,`Pet${t+1}`]),n=[],r=[];for(let i of t)e()<.55&&n.push(i),e()<.65&&r.push(i);return r.sort(()=>e()-.5),[n,r]}}};export{z as default};