import{n as e,t}from"./index-Cf02qAUa.js";import{c as n,l as r,o as i}from"./shared-CL29HWIp.js";var a=20,o=class extends r{caption=``;acts=[];keyframe=!1;step(e){this.settle(!1),this.keyframe=!!e.isKeyframe,super.step(e)}phase(e,t,n){this.settle(!0),super.phase(e,t,n),this.caption=t,this.acts=[]}do(...e){super.do(...e),this.acts.push(...e)}finish(){return this.settle(!1),super.finish()}settle(n){if(!this.caption)return;let r=n?140:this.keyframe?t:320,i=e({phases:[{label:``,caption:``,actions:this.acts}]}).phases[0],o=Math.max(0,...i.actions.map(e=>e.start+e.duration)),s=a*[...this.caption].length-r-o;this.caption=``,s>0&&o+s>i.end&&super.do({type:`wait`,ms:Math.ceil(s)})}},s=[[0,`ITEM_A`,`RARE`],[1,`ITEM_B`,`RARE`],[2,`ITEM_C`,`LEGEND`],[3,`ITEM_D`,`RARE`],[4,`ITEM_E`,`RARE`]],c=[[0,null],[1,0],[2,0],[3,1],[4,1]],l=[[4,`ITEM_E`,`RARE`],[3,`ITEM_D`,`RARE`],[2,`ITEM_C`,`LEGEND`]],u={sql:`SELECT I.ITEM_ID, I.ITEM_NAME, I.RARITY
FROM ITEM_INFO I
LEFT JOIN ITEM_TREE T ON I.ITEM_ID = T.PARENT_ITEM_ID
WHERE T.PARENT_ITEM_ID IS NULL
ORDER BY I.ITEM_ID DESC;`,python:`def solution(items, tree):
    # 부모 아이템으로 등장한 ID 집합 (자식이 있는 아이템들)
    parent_ids = {p for _, p in tree if p is not None}
    # 부모 ID에 속하지 않는 아이템만 선택 (리프 노드)
    result = [
        [item_id, name, rarity]
        for item_id, name, rarity in items
        if item_id not in parent_ids
    ]
    return sorted(result, key=lambda r: -r[0])`,javascript:`function solution(items, tree) {
  // 부모 아이템으로 등장한 ID 집합 (자식이 있는 아이템들)
  const parentIds = new Set(tree.map(([, p]) => p).filter((p) => p !== null));
  // 부모 ID에 속하지 않는 아이템만 선택 (리프 노드)
  const result = items
    .filter(([id]) => !parentIds.has(id))
    .map(([id, name, rarity]) => [id, name, rarity]);
  return result.sort((a, b) => b[0] - a[0]);
}`},d={join:i(u,[`FROM ITEM_INFO I`,`LEFT JOIN ITEM_TREE T ON I.ITEM_ID = T.PARENT_ITEM_ID`],[`parent_ids = {p for _, p in tree if p is not None}`],[`const parentIds = new Set(tree.map`]),where:i(u,[`WHERE T.PARENT_ITEM_ID IS NULL`],[`if item_id not in parent_ids`],[`.filter(([id]) => !parentIds.has(id))`]),order:i(u,[`SELECT I.ITEM_ID, I.ITEM_NAME, I.RARITY`,`ORDER BY I.ITEM_ID DESC;`],[`return sorted(result, key=lambda r: -r[0])`],[`return result.sort((a, b) => b[0] - a[0]);`])},f={sql:`SELECT I.ITEM_ID, I.ITEM_NAME, I.RARITY
FROM ITEM_INFO I
WHERE NOT EXISTS (
    SELECT 1
    FROM ITEM_TREE T
    WHERE T.PARENT_ITEM_ID = I.ITEM_ID
)
ORDER BY I.ITEM_ID DESC;`,python:`def solution(items, tree):
    # 아이템마다 TREE를 처음부터 훑어 자식 존재 여부 검사 (중첩 루프)
    result = []
    for item_id, name, rarity in items:
        has_child = any(p == item_id for _, p in tree)
        if not has_child:
            result.append([item_id, name, rarity])
    return sorted(result, key=lambda r: -r[0])`,javascript:`function solution(items, tree) {
  // 아이템마다 TREE를 처음부터 훑어 자식 존재 여부 검사합니다
  const result = [];
  for (const [id, name, rarity] of items) {
    const hasChild = tree.some(([, p]) => p === id);
    if (!hasChild) {
      result.push([id, name, rarity]);
    }
  }
  return result.sort((a, b) => b[0] - a[0]);
}`},p={notExists:i(f,[`WHERE NOT EXISTS (`,`WHERE T.PARENT_ITEM_ID = I.ITEM_ID`],[`has_child = any(p == item_id for _, p in tree)`],[`const hasChild = tree.some(([, p]) => p === id);`]),order:i(f,[`ORDER BY I.ITEM_ID DESC;`],[`return sorted(result, key=lambda r: -r[0])`],[`return result.sort((a, b) => b[0] - a[0]);`])},m={sql:`-- 함정: PARENT_ITEM_ID에 NULL이 있어서 NOT IN (NULL, 0, 1)이 UNKNOWN이 됨
SELECT ITEM_ID, ITEM_NAME, RARITY
FROM ITEM_INFO
WHERE ITEM_ID NOT IN (
    SELECT PARENT_ITEM_ID
    FROM ITEM_TREE
)
ORDER BY ITEM_ID DESC;`,python:`def solution(items, tree):
    # 함정: NOT IN 목록에 None(NULL)이 포함되어 모든 비교가 False가 됨
    parent_list = [p for _, p in tree]  # [None, 0, 0, 1, 1]
    # SQL에서 x NOT IN (NULL, ...)은 UNKNOWN이 되어 빈 결과가 나옴
    if any(p is None for p in parent_list):
        return []
    return [list(r) for r in items if r[0] not in parent_list]`,javascript:`function solution(items, tree) {
  // 함정: NOT IN 목록에 null(NULL)이 포함되어 모든 비교가 UNKNOWN이 됩니다
  const parentList = tree.map(([, p]) => p); // [null, 0, 0, 1, 1]
  if (parentList.includes(null)) {
    return []; // SQL NOT IN (..., NULL) 함정: 결과 0건
  }
  return items.filter(([id]) => !parentList.includes(id));
}`},h={trapSubquery:i(m,[`WHERE ITEM_ID NOT IN (`,`SELECT PARENT_ITEM_ID`],[`parent_list = [p for _, p in tree]`,`if any(p is None for p in parent_list):`],[`const parentList = tree.map`,`if (parentList.includes(null))`]),done:i(m,[`ORDER BY ITEM_ID DESC;`],[`return []`],[`return [];`])},g=600,_=350,v=14,y=36,b=210,x=34,S=40,C=240,w=160,T=420,E=166,D=e=>`item:${e}`,O=e=>`tree:${e}`,k=e=>`out:${e}`;function A(){let e=[{id:`hdr:i`,kind:`text`,rect:{x:v,y:8,w:b,h:22},tone:`muted`,text:`ITEM_INFO (5개)`},{id:`hdr:t`,kind:`text`,rect:{x:C,y:8,w,h:22},tone:`chosen`,text:`ITEM_TREE (트리 관계)`},{id:`hdr:o`,kind:`text`,rect:{x:T,y:8,w:E,h:22},tone:`good`,text:`업그레이드 불가 아이템`},{id:`status`,kind:`token`,rect:{x:v,y:304,w:572,h:32},tone:`plain`,text:`조인 및 검사 대기`}];return s.forEach(([t,n,r],i)=>{e.push({id:D(i),kind:`token`,rect:{x:v,y:y+i*S,w:b,h:x},tone:`plain`,text:`#${t} · ${n} (${r})`})}),c.forEach(([t,n],r)=>{e.push({id:O(r),kind:`token`,rect:{x:C,y:y+r*S,w,h:x},tone:`plain`,text:`아이템 ${t} → 부모 ${n??`NULL`}`})}),{width:g,height:_,items:e}}var j=e=>({type:`wait`,ms:e}),M=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function N(){let e=new o(A()),t=0,r=new Set([0,1]),i=0,a=[];return e.step({title:`FROM ITEM_INFO: 5개 아이템 행 스캔 시작`,codeHighlights:d.join,work:t,variables:{절:`FROM ITEM_INFO`,아이템수:s.length}}),e.phase(`아이템 테이블 읽기`,`ITEM_INFO 테이블의 5개 아이템 행을 읽으며 부모 연결 상태를 확인할 준비를 합니다.`,d.join),e.do({type:`set`,id:`status`,patch:{text:`FROM ITEM_INFO → LEFT JOIN ITEM_TREE 대기`,tone:`chosen`},pop:!0},j(180)),e.step({title:`LEFT JOIN: I.ITEM_ID = T.PARENT_ITEM_ID 매칭 준비`,codeHighlights:d.join,work:t,variables:{절:`LEFT JOIN`,부모ID수:r.size}}),e.phase(`조인 조건 확인`,`어떤 아이템이 누군가의 PARENT_ITEM_ID로 쓰이는지 LEFT JOIN으로 연결합니다.`,d.join),e.do(...n([M(O(1),`chosen`),M(O(2),`chosen`),M(O(3),`chosen`),M(O(4),`chosen`),{type:`set`,id:`status`,patch:{text:`부모로 쓰인 ID: 0 (ITEM_B,C의 부모), 1 (ITEM_D,E의 부모)`,tone:`chosen`},pop:!0}]),j(200)),s.forEach(([o,s,c],l)=>{let u=r.has(o);if(t+=1,e.step({title:`WHERE T.PARENT_ITEM_ID IS NULL: #${o} ${s} → ${u?`부모로 쓰임(제외)`:`자식 없음(선택!)`}`,codeHighlights:d.where,work:t,variables:{절:`IS NULL 검사`,아이템:`#${o} ${s}`,리프여부:u?`X`:`O`}}),e.phase(`리프 판별`,u?`#${o} ${s}은 다른 아이템의 부모(0 또는 1)로 연결되므로 업그레이드가 가능해 제외합니다.`:`#${o} ${s}은 아무 아이템의 부모도 아닙니다(T.PARENT_ITEM_ID IS NULL). 더 이상 업그레이드할 수 없으므로 선택!`,d.where),u)e.do(M(D(l),`muted`),j(150));else{a.push([o,s,c]);let t=i++;e.do(...n([M(D(l),`good`),{type:`add`,item:{id:k(t),kind:`token`,rect:{x:T,y:y+t*48,w:E,h:38},tone:`good`,text:`#${o} ${s} (${c})`},from:D(l)}]),j(180))}}),e.step({title:`ORDER BY ITEM_ID DESC → #4(ITEM_E) → #3(ITEM_D) → #2(ITEM_C)`,codeHighlights:d.order,work:t+3,variables:{절:`ORDER BY DESC`,출력수:3},answer:l,isKeyframe:!0}),e.phase(`결과 확인`,`부모가 아닌 리프 아이템(C, D, E) 3개가 ITEM_ID 내림차순(4 → 3 → 2)으로 정렬 출력되었습니다.`,d.order),e.do(...n([{type:`set`,id:k(0),patch:{text:`#4 ITEM_E (RARE)`,tone:`path`},pop:!0},{type:`set`,id:k(1),patch:{text:`#3 ITEM_D (RARE)`,tone:`path`},pop:!0},{type:`set`,id:k(2),patch:{text:`#2 ITEM_C (LEGEND)`,tone:`path`},pop:!0},{type:`set`,id:`status`,patch:{text:`정답: ID [4, 3, 2] 3개 아이템 출력 완료`,tone:`path`},pop:!0}])),e.finish()}function P(){let e=new o(A()),t=0,r=0;return s.forEach(([i,a,o],s)=>{t+=c.length;let l=i>=2;if(e.step({title:`상관 서브쿼리: #${i} ${a} 위해 TREE 5행 전부 재스캔`,codeHighlights:p.notExists,work:t,variables:{절:`NOT EXISTS`,아이템:`#${i}`,누적비교:t}}),e.phase(`재스캔`,l?`TREE 5행을 다 훑었지만 PARENT_ITEM_ID=${i}인 행이 없습니다(NOT EXISTS 참). 리프로 판정!`:`TREE를 훑는 도중 PARENT_ITEM_ID=${i}인 자식 행을 발견하여 제외합니다.`,p.notExists),l){let t=r++;e.do(...n([M(D(s),`good`),{type:`add`,item:{id:k(t),kind:`token`,rect:{x:T,y:y+t*48,w:E,h:38},tone:`good`,text:`#${i} ${a} (${o})`},from:D(s)}]),j(170))}else e.do(M(D(s),`muted`),j(150))}),e.step({title:`정답 동일, 하지만 행 비교 ${t}회 (정석은 5회)`,codeHighlights:p.order,work:t,variables:{절:`완료`,최종출력수:3},answer:l,isKeyframe:!0}),e.phase(`결과 확인`,`답은 같지만 아이템마다 TREE를 반복 탐색하느라 ${t}번 비교했습니다.`,p.order),e.do({type:`set`,id:`status`,patch:{text:`정답 3개 동일 (상관 서브쿼리 탐색 ${t}회)`,tone:`path`},pop:!0}),e.finish()}function F(){let e=new o(A()),t=5;return e.step({title:`함정 서브쿼리: PARENT_ITEM_ID에 루트의 NULL이 포함됨!`,codeHighlights:h.trapSubquery,work:t,variables:{절:`서브쿼리`,부모목록:`[NULL, 0, 0, 1, 1]`}}),e.phase(`NULL 전파 함정`,`서브쿼리 (SELECT PARENT_ITEM_ID FROM ITEM_TREE)의 결과에 루트 아이템의 NULL이 들어있습니다!`,h.trapSubquery),e.do(...n([M(O(0),`bad`),{type:`set`,id:`status`,patch:{text:`서브쿼리 결과에 NULL 포함: (NULL, 0, 0, 1, 1)`,tone:`bad`},pop:!0}]),j(200)),s.forEach(([n,r],i)=>{t+=1,e.step({title:`WHERE #${n} NOT IN (NULL, 0, 1) → UNKNOWN(거짓 처리)!`,codeHighlights:h.trapSubquery,work:t,variables:{절:`NOT IN 비교`,아이템:`#${n} ${r}`,판정:`UNKNOWN`}}),e.phase(`모든 행 탈락`,`SQL에서 x NOT IN (NULL, 0, 1)은 (x!=NULL AND x!=0 AND x!=1)로 풀리는데, x!=NULL이 UNKNOWN이라 전체가 UNKNOWN(거짓)이 됩니다! #${n} 탈락.`,h.trapSubquery),e.do(M(D(i),`bad`),j(160))}),e.step({title:`오답: NOT IN (NULL) 때문에 결과가 0건(빈 테이블)이 됨!`,codeHighlights:h.done,work:t,variables:{절:`결과`,출력수:0,정답수:3},answer:[],isKeyframe:!0}),e.phase(`오답 확인`,`리프 아이템(C, D, E)이 분명히 존재하는데도 단 1건도 출력되지 않는 치명적 오답입니다. 서브쿼리에 NULL이 들어갈 수 있을 때는 절대 NOT IN을 쓰면 안 됩니다!`,h.done),e.do({type:`set`,id:`status`,patch:{text:`오답: 0건 반환 (빈 결과) · SQL의 대표적인 NOT IN NULL 함정`,tone:`bad`},pop:!0}),e.finish()}var I={id:`unupgradable-items`,title:`업그레이드 할 수 없는 아이템 구하기`,level:3,category:`sql-is-null`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/273712`,description:{summary:`ITEM_INFO 테이블과 ITEM_TREE 테이블에서 더 이상 업그레이드할 수 없는 아이템의 아이템 ID(ITEM_ID), 아이템 명(ITEM_NAME), 아이템의 희귀도(RARITY)를 출력합니다. 결과는 아이템 ID를 기준으로 내림차순 정렬합니다.`,rules:[`더 이상 업그레이드할 수 없는 아이템 = 어떤 아이템의 PARENT_ITEM_ID로도 등장하지 않는 리프 노드`,`아이템 ID를 기준으로 내림차순 정렬`,`ITEM_TREE의 ROOT 아이템의 PARENT_ITEM_ID는 NULL임`],examples:[{input:`ITEM_INFO = [[0,"ITEM_A","RARE"],[1,"ITEM_B","RARE"],[2,"ITEM_C","LEGEND"],[3,"ITEM_D","RARE"],[4,"ITEM_E","RARE"]], ITEM_TREE = [[0,null],[1,0],[2,0],[3,1],[4,1]]`,output:`[[4, "ITEM_E", "RARE"], [3, "ITEM_D", "RARE"], [2, "ITEM_C", "LEGEND"]]`}]},keyIntuitions:[`"업그레이드할 수 없다"는 것은 다른 아이템의 부모(PARENT_ITEM_ID)로 한 번도 사용되지 않았다는 뜻입니다.`,`ITEM_INFO와 ITEM_TREE를 I.ITEM_ID = T.PARENT_ITEM_ID로 LEFT JOIN한 뒤, T.PARENT_ITEM_ID IS NULL인 행을 찾으면 자식이 없는 리프 아이템만 남습니다.`,`주의: NOT IN (SELECT PARENT_ITEM_ID FROM ITEM_TREE)를 쓰면 루트의 NULL 때문에 전체 조건이 UNKNOWN이 되어 아무것도 반환되지 않는 SQL 최대의 함정에 빠집니다. NOT IN을 쓸 거라면 서브쿼리에 WHERE PARENT_ITEM_ID IS NOT NULL을 반드시 넣어야 합니다.`],demo:{input:[s,c],label:`ITEM_INFO 5개 (0, 1은 부모로 사용됨, 2, 3, 4는 자식 없음)`},workUnit:`아이템 대조 횟수`,approaches:[{id:`unupgradable-left-join-null`,name:`LEFT JOIN 부모키 + IS NULL`,rank:`BEST`,timeComplexity:`O(N + M + K log K)`,spaceComplexity:`O(K)`,verdict:`I.ITEM_ID = T.PARENT_ITEM_ID로 LEFT JOIN 후 부모키가 NULL인 행만 골라내는 정석 쿼리입니다.`,pros:[`해시 조인이나 인덱스를 통해 O(N + M)으로 매우 빠릅니다.`,`NULL이 포함되어 있어도 전혀 오작동하지 않고 안전합니다.`],cons:[`ON 절의 조인 키가 ITEM_ID = PARENT_ITEM_ID라는 점을 헷갈리지 않아야 합니다.`],whyThisRank:`안티 조인(Anti-Join)을 표현하는 가장 안전하고 표준적인 SQL 패턴입니다.`,code:u,visualize:N},{id:`unupgradable-not-exists`,name:`상관 NOT EXISTS 서브쿼리`,rank:`ALTERNATIVE`,timeComplexity:`O(N × M)`,spaceComplexity:`O(1)`,verdict:`아이템마다 서브쿼리로 자식 행이 존재하는지 대조(NOT EXISTS)하는 풀이입니다.`,pros:[`NOT IN과 달리 서브쿼리 결과에 NULL이 있어도 논리적으로 안전합니다.`],cons:[`아이템 수만큼 서브쿼리가 반복 스캔되어 데이터가 커질수록 조인보다 느립니다.`],whyThisRank:`정답은 맞지만 반복 탐색 비용이 듭니다.`,code:f,visualize:P},{id:`unupgradable-not-in-null-trap`,name:`NOT IN 서브쿼리 (NULL 전파 함정)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N + M)`,spaceComplexity:`O(M)`,verdict:`NOT IN 목록에 루트의 PARENT_ITEM_ID인 NULL이 들어가면서 3가 논리(Three-Valued Logic)에 의해 결과가 0건이 되는 치명적 함정입니다.`,pros:[`문법적으로 올바르고 직관적으로 떠오르기 쉬워 실무에서도 많이 실수합니다.`],cons:[`리프 아이템이 3개나 있는데도 결과가 빈 배열([])로 나와 완벽한 오답이 됩니다.`],whyThisRank:`SQL 3가 논리(NULL 비교 시 UNKNOWN 반환)의 위험성을 보여주는 가장 대표적인 함정 사례입니다.`,code:m,visualize:F}],checks:{cases:[{args:[s,c],expected:l},{args:[[[1,`칼`,`COMMON`],[2,`방패`,`RARE`]],[[1,null],[2,1]]],expected:[[2,`방패`,`RARE`]]}],random:e=>[[[0,`I0`,`RARE`],[1,`I1`,`RARE`],[2,`I2`,`LEGEND`]],[[0,null],[1,0],[2,e()<.5?0:1]]]}};export{I as default};