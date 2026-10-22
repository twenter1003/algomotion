import{n as e,t}from"./index-Cf02qAUa.js";import{c as n,l as r,o as i}from"./shared-CL29HWIp.js";var a=20,o=class extends r{caption=``;acts=[];keyframe=!1;step(e){this.settle(!1),this.keyframe=!!e.isKeyframe,super.step(e)}phase(e,t,n){this.settle(!0),super.phase(e,t,n),this.caption=t,this.acts=[]}do(...e){super.do(...e),this.acts.push(...e)}finish(){return this.settle(!1),super.finish()}settle(n){if(!this.caption)return;let r=n?140:this.keyframe?t:320,i=e({phases:[{label:``,caption:``,actions:this.acts}]}).phases[0],o=Math.max(0,...i.actions.map(e=>e.start+e.duration)),s=a*[...this.caption].length-r-o;this.caption=``,s>0&&o+s>i.end&&super.do({type:`wait`,ms:Math.ceil(s)})}},s=[[1,1,10],[2,2,10],[3,1,20],[4,1,10],[5,2,30],[6,1,20],[7,3,20]],c=s.length,l=[[1,20],[1,10]],u={sql:`SELECT USER_ID, PRODUCT_ID
FROM ONLINE_SALE
GROUP BY USER_ID, PRODUCT_ID
HAVING COUNT(*) >= 2
ORDER BY USER_ID ASC, PRODUCT_ID DESC;`,python:`def solution(sales):
    # GROUP BY USER_ID, PRODUCT_ID
    counts = {}
    for sale_id, user_id, product_id in sales:
        key = (user_id, product_id)
        counts[key] = counts.get(key, 0) + 1
    # HAVING COUNT(*) >= 2 + ORDER BY USER_ID ASC, PRODUCT_ID DESC
    pairs = [[u, p] for (u, p), c in counts.items() if c >= 2]
    pairs.sort(key=lambda r: (r[0], -r[1]))
    return pairs`,javascript:`function solution(sales) {
  // GROUP BY USER_ID, PRODUCT_ID
  const counts = new Map();
  for (const [, userId, productId] of sales) {
    const key = \`\${userId}:\${productId}\`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  // HAVING COUNT(*) >= 2 + ORDER BY USER_ID ASC, PRODUCT_ID DESC
  const pairs = [];
  for (const [key, c] of counts) {
    if (c >= 2) pairs.push(key.split(':').map(Number));
  }
  return pairs.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
}`},d={group:i(u,[`FROM ONLINE_SALE`,`GROUP BY USER_ID, PRODUCT_ID`],[`for sale_id, user_id, product_id in sales:`,`counts[key] = counts.get(key, 0) + 1`],[`for (const [, userId, productId] of sales)`,`counts.set(key, (counts.get(key) ?? 0) + 1)`]),having:i(u,[`HAVING COUNT(*) >= 2`],[`pairs = [[u, p] for (u, p), c in counts.items() if c >= 2]`],[`if (c >= 2) pairs.push(key.split(':').map(Number))`]),order:i(u,[`SELECT USER_ID, PRODUCT_ID`,`ORDER BY USER_ID ASC, PRODUCT_ID DESC;`],[`pairs.sort(key=lambda r: (r[0], -r[1]))`,`return pairs`],[`return pairs.sort((a, b) => a[0] - b[0] || b[1] - a[1]);`])},f={sql:`SELECT DISTINCT A.USER_ID, A.PRODUCT_ID
FROM ONLINE_SALE A
JOIN ONLINE_SALE B
  ON A.USER_ID = B.USER_ID
 AND A.PRODUCT_ID = B.PRODUCT_ID
 AND A.ONLINE_SALE_ID <> B.ONLINE_SALE_ID
ORDER BY A.USER_ID ASC, A.PRODUCT_ID DESC;`,python:`def solution(sales):
    # 셀프 조인으로 같은 회원·같은 상품의 다른 판매 기록이 있는지 대조
    found = set()
    for id1, u1, p1 in sales:
        for id2, u2, p2 in sales:
            if id1 != id2 and u1 == u2 and p1 == p2:
                found.add((u1, p1))
    pairs = [[u, p] for u, p in found]
    pairs.sort(key=lambda r: (r[0], -r[1]))
    return pairs`,javascript:`function solution(sales) {
  // 셀프 조인으로 같은 회원·같은 상품의 다른 판매 기록이 있는지 대조합니다
  const found = new Map();
  for (const [id1, u1, p1] of sales) {
    for (const [id2, u2, p2] of sales) {
      if (id1 !== id2 && u1 === u2 && p1 === p2) {
        found.set(\`\${u1}:\${p1}\`, [u1, p1]);
      }
    }
  }
  return [...found.values()].sort((a, b) => a[0] - b[0] || b[1] - a[1]);
}`},p={join:i(f,[`FROM ONLINE_SALE A`,`JOIN ONLINE_SALE B`,`ON A.USER_ID = B.USER_ID`,`AND A.PRODUCT_ID = B.PRODUCT_ID`],[`for id1, u1, p1 in sales:`,`for id2, u2, p2 in sales:`,`if id1 != id2 and u1 == u2 and p1 == p2:`],[`for (const [id1, u1, p1] of sales)`,`for (const [id2, u2, p2] of sales)`,`if (id1 !== id2 && u1 === u2 && p1 === p2)`]),order:i(f,[`SELECT DISTINCT A.USER_ID, A.PRODUCT_ID`,`ORDER BY A.USER_ID ASC, A.PRODUCT_ID DESC;`],[`pairs.sort(key=lambda r: (r[0], -r[1]))`,`return pairs`],[`return [...found.values()].sort((a, b) => a[0] - b[0] || b[1] - a[1]);`])},m={sql:`-- 함정: PRODUCT_ID를 빼고 USER_ID만으로 GROUP BY
SELECT USER_ID, MAX(PRODUCT_ID) AS PRODUCT_ID
FROM ONLINE_SALE
GROUP BY USER_ID
HAVING COUNT(*) >= 2
ORDER BY USER_ID ASC, PRODUCT_ID DESC;`,python:`def solution(sales):
    # 함정: 회원(user_id)만으로 묶어 서로 다른 상품을 산 것도 재구매로 침
    by_user = {}
    for sale_id, user_id, product_id in sales:
        by_user.setdefault(user_id, []).append(product_id)
    pairs = [[u, max(ps)] for u, ps in by_user.items() if len(ps) >= 2]
    pairs.sort(key=lambda r: (r[0], -r[1]))
    return pairs`,javascript:`function solution(sales) {
  // 함정: 회원(userId)만으로 묶어 서로 다른 상품을 산 것도 재구매로 칩니다
  const byUser = new Map();
  for (const [, userId, productId] of sales) {
    if (!byUser.has(userId)) byUser.set(userId, []);
    byUser.get(userId).push(productId);
  }
  const pairs = [];
  for (const [u, ps] of byUser) {
    if (ps.length >= 2) pairs.push([u, Math.max(...ps)]);
  }
  return pairs.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
}`},h={group:i(m,[`GROUP BY USER_ID`,`HAVING COUNT(*) >= 2`],[`for sale_id, user_id, product_id in sales:`,`by_user.setdefault(user_id, []).append(product_id)`],[`for (const [, userId, productId] of sales)`,`byUser.get(userId).push(productId)`]),done:i(m,[`SELECT USER_ID, MAX(PRODUCT_ID) AS PRODUCT_ID`,`ORDER BY USER_ID ASC, PRODUCT_ID DESC;`],[`pairs = [[u, max(ps)] for u, ps in by_user.items() if len(ps) >= 2]`,`return pairs`],[`if (ps.length >= 2) pairs.push([u, Math.max(...ps)]);`,`return pairs.sort`])},g=600,_=368,v=14,y=36,b=240,x=32,S=38,C=286,w=298,T=e=>({x:v,y:y+e*S,w:b,h:x}),E=e=>({x:C,y:y+e*46,w,h:36}),D=e=>`in:${e}`,O=e=>`grp:${e}`;function k(){let e=[{id:`hdr:in`,kind:`text`,rect:{x:v,y:8,w:b,h:22},tone:`muted`,text:`ONLINE_SALE (판매 7건)`},{id:`hdr:grp`,kind:`text`,rect:{x:C,y:8,w,h:22},tone:`chosen`,text:`그룹 집계 / 결과`},{id:`status`,kind:`token`,rect:{x:v,y:320,w:570,h:32},tone:`plain`,text:`GROUP BY 준비`}];return s.forEach(([t,n,r],i)=>{e.push({id:D(i),kind:`token`,rect:T(i),tone:`plain`,text:`#${t} · 회원 ${n} · 상품 ${r}`})}),{width:g,height:_,items:e}}var A=e=>({type:`wait`,ms:e}),j=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function M(){let e=new o(k()),t=0,r=new Map,i=(e,n=`-`)=>({work:t,variables:{절:e,조합:n,그룹수:r.size}});return s.forEach(([a,o,s],c)=>{let l=`(${o}, ${s})`,u=r.get(l),f=u?u.slot:r.size,p=(u?.count??0)+1;r.set(l,{slot:f,u:o,p:s,count:p}),t+=1,e.step({title:`판매 #${a}: (회원 ${o}, 상품 ${s}) → ${p}회`,codeHighlights:d.group,...i(`GROUP BY`,l)}),e.phase(`그룹 묶기`,`판매 #${a}을 (USER_ID=${o}, PRODUCT_ID=${s}) 버킷에 모아 건수를 ${p}로 올립니다.`,d.group),u?e.do(...n([j(D(c),`visited`),{type:`set`,id:O(f),patch:{text:`(회원 ${o}, 상품 ${s}) → COUNT = ${p}`,tone:p>=2?`good`:`plain`},pop:!0}]),A(160)):e.do(...n([j(D(c),`visited`),{type:`add`,item:{id:O(f),kind:`token`,rect:E(f),tone:`plain`,text:`(회원 ${o}, 상품 ${s}) → COUNT = 1`},from:D(c)}]),A(160))}),e.step({title:`HAVING COUNT(*) >= 2: 2회 이상 재구매한 2개 쌍만 선택`,codeHighlights:d.having,...i(`HAVING`,`(1,10), (1,20)`)}),e.phase(`HAVING 필터`,`COUNT가 1인 세 그룹((2,10), (2,30), (3,20))은 버리고 COUNT = 2인 (1,10)과 (1,20)만 남깁니다.`,d.having),e.do(...n([j(O(0),`good`),j(O(1),`muted`),j(O(2),`good`),j(O(3),`muted`),j(O(4),`muted`),{type:`set`,id:`status`,patch:{text:`HAVING COUNT(*) >= 2 → (1, 10), (1, 20) 2개 그룹 통과`,tone:`chosen`},pop:!0}]),A(200)),e.step({title:`ORDER BY USER_ID ASC, PRODUCT_ID DESC → [[1, 20], [1, 10]]`,codeHighlights:d.order,...i(`ORDER BY`,`완료`),answer:l,isKeyframe:!0}),e.phase(`정렬 및 출력`,`회원 ID 오름차순, 같으면 상품 ID 내림차순이므로 (1, 20)이 먼저, (1, 10)이 다음에 출력됩니다.`,d.order),e.do(...n([{type:`set`,id:O(0),patch:{text:`1위: [회원 1, 상품 20] (2회)`,tone:`path`},pop:!0},{type:`set`,id:O(2),patch:{rect:E(1),text:`2위: [회원 1, 상품 10] (2회)`,tone:`path`},pop:!0},{type:`remove`,id:O(1)},{type:`remove`,id:O(3)},{type:`remove`,id:O(4)},{type:`set`,id:`status`,patch:{text:`정답: [[1, 20], [1, 10]] (행 스캔 7회)`,tone:`path`},pop:!0}])),e.finish()}function N(){let e=new o(k()),t=0,r=0,i=new Set,a=e=>({work:t,variables:{방식:`SELF JOIN`,단계:e,찾은쌍:i.size}});return s.forEach(([o,l,u],d)=>{t+=c;let f=s.find(([e,t,n])=>e!==o&&t===l&&n===u),m=`${l}:${u}`,h=!!f&&!i.has(m);if(h&&i.add(m),e.step({title:`A.#${o}(회원 ${l}, 상품 ${u}) ↔ B 전체 ${c}건 대조`,codeHighlights:p.join,...a(`#${o} 대조`)}),e.phase(`셀프 조인 대조`,f?`판매 #${o}과 회원·상품이 같고 판매 ID만 다른 #${f[0]}을 찾았습니다(비교 ${c}회 누적 ${t}회).`:`판매 #${o}은 전체 ${c}건과 대조했지만 같은 회원·상품의 다른 판매 기록이 없습니다.`,p.join),h){let t=r++;e.do(...n([j(D(d),`good`),{type:`add`,item:{id:O(t),kind:`token`,rect:E(t),tone:`chosen`,text:`재구매 확인: (회원 ${l}, 상품 ${u})`},from:D(d)}]),A(160))}else e.do(j(D(d),f?`visited`:`muted`),A(150))}),e.step({title:`DISTINCT + 정렬 완료: 정답 동일, 비교 ${t}회`,codeHighlights:p.order,...a(`완료`),answer:l,isKeyframe:!0}),e.phase(`마무리`,`정답은 같지만 GROUP BY 한 번(7회) 대신 7×7 = ${t}번 행을 대조했습니다.`,p.order),e.do(...n([{type:`set`,id:O(0),patch:{text:`1위: [회원 1, 상품 20]`,tone:`path`},pop:!0},{type:`set`,id:O(1),patch:{text:`2위: [회원 1, 상품 10]`,tone:`path`},pop:!0},{type:`set`,id:`status`,patch:{text:`정답 [[1, 20], [1, 10]] (셀프 조인 비교 ${t}회)`,tone:`path`},pop:!0}])),e.finish()}function P(){let e=new o(k()),t=0,r=new Map,i=(e,n=`-`)=>({work:t,variables:{절:e,회원:n,회원그룹수:r.size}});s.forEach(([a,o,s],c)=>{let l=r.get(o),u=l?l.slot:r.size,d=[...l?.products??[],s];r.set(o,{slot:u,products:d}),t+=1,e.step({title:`판매 #${a}: 회원 ${o} 그룹에 상품 ${s} 추가 (총 ${d.length}건)`,codeHighlights:h.group,...i(`GROUP BY USER_ID`,`회원 ${o}`)}),e.phase(`회원만 묶기`,o===2&&d.length===2?`회원 2는 상품 10과 상품 30을 각각 1번씩 샀는데, USER_ID로만 묶어서 구매 횟수가 2회가 되어 버립니다!`:`PRODUCT_ID를 빼먹고 USER_ID=${o}로만 묶어 구매 기록([${d.join(`, `)}])을 합칩니다.`,h.group),l?e.do(...n([j(D(c),o===2?`bad`:`visited`),{type:`set`,id:O(u),patch:{text:`회원 ${o}: 상품 [${d.join(`, `)}] (${d.length}건)`,tone:o===2?`bad`:`chosen`},pop:!0}]),A(160)):e.do(...n([j(D(c),`visited`),{type:`add`,item:{id:O(u),kind:`token`,rect:E(u),tone:`plain`,text:`회원 ${o}: 상품 [${d.join(`, `)}]`},from:D(c)}]),A(160))});let a=[[1,20],[2,30]];return e.step({title:`오답: 회원 1의 상품 10이 누락되고 회원 2가 잘못 포함됨`,codeHighlights:h.done,...i(`HAVING + SELECT`,`오답`),answer:a,isKeyframe:!0}),e.phase(`오답 확인`,`GROUP BY USER_ID만 쓰면 회원 1이 재구매한 두 상품(10, 20)이 하나로 합쳐지고, 서로 다른 상품을 산 회원 2까지 재구매자로 잘못 뽑힙니다.`,h.done),e.do(...n([j(O(0),`bad`),j(O(1),`bad`),j(O(2),`muted`),{type:`set`,id:`status`,patch:{text:`오답 [[1, 20], [2, 30]] · 정답은 [[1, 20], [1, 10]]`,tone:`bad`},pop:!0}])),e.finish()}var F={id:`repurchase-members`,title:`재구매가 일어난 상품과 회원 리스트 구하기`,level:2,category:`sql-select`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/131536`,description:{summary:`ONLINE_SALE 테이블에서 동일한 회원이 동일한 상품을 재구매한 데이터를 구하여, 재구매한 회원 ID와 재구매한 상품 ID를 출력합니다. 결과는 회원 ID를 기준으로 오름차순 정렬하고, 회원 ID가 같다면 상품 ID를 기준으로 내림차순 정렬합니다.`,rules:[`동일한 날짜, 회원 ID, 상품 ID 조합에 대해서는 하나의 판매 데이터만 존재함`,`재구매란 같은 회원(USER_ID)이 같은 상품(PRODUCT_ID)을 2번 이상 구매한 경우를 뜻함`,`결과는 USER_ID 오름차순, 같으면 PRODUCT_ID 내림차순 정렬`],examples:[{input:`ONLINE_SALE = [[1,1,10],[2,2,10],[3,1,20],[4,1,10],[5,2,30],[6,1,20],[7,3,20]]`,output:`[[1, 20], [1, 10]]`}]},keyIntuitions:[`"같은 회원이 같은 상품을 재구매"했다는 것은 (USER_ID, PRODUCT_ID) 두 컬럼을 함께 GROUP BY로 묶었을 때 행의 개수 COUNT(*)가 2 이상이라는 뜻입니다.`,`그룹화한 뒤의 집계 결과(COUNT(*) >= 2)를 거를 때는 WHERE가 아니라 HAVING 절을 사용해야 합니다.`,`정렬 기준이 두 개일 때는 ORDER BY USER_ID ASC, PRODUCT_ID DESC처럼 방향을 각각 명시합니다.`],demo:{input:[s],label:`ONLINE_SALE 7건: 회원 1은 상품 10·20 각 2회 구매, 회원 2는 상품 10·30 각 1회 구매`},workUnit:`살펴본 판매 기록 수`,approaches:[{id:`repurchase-group-by-two-cols`,name:`GROUP BY 두 열 + HAVING`,rank:`BEST`,timeComplexity:`O(N + K log K)`,spaceComplexity:`O(K)`,verdict:`GROUP BY USER_ID, PRODUCT_ID로 복합 그룹을 만들고 HAVING COUNT(*) >= 2로 재구매 쌍만 추리는 정석 풀이입니다.`,pros:[`테이블을 한 번만 훑어(O(N)) 회원-상품 쌍별 구매 횟수를 정확히 집계합니다.`,`DISTINCT 없이도 그룹 키 자체가 유일한 (USER_ID, PRODUCT_ID) 쌍이 됩니다.`],cons:[`GROUP BY에 두 컬럼을 모두 적어야 한다는 점을 놓치면 안 됩니다.`],whyThisRank:`복합 키 그룹화와 HAVING 조건의 역할을 가장 깔끔하게 보여주는 표준 SQL 풀이입니다.`,code:u,visualize:M},{id:`repurchase-self-join`,name:`셀프 조인(SELF JOIN) + DISTINCT`,rank:`ALTERNATIVE`,timeComplexity:`O(N²)`,spaceComplexity:`O(K)`,verdict:`같은 테이블을 조인해 회원과 상품은 같고 판매 ID만 다른 짝이 존재하는지 찾는 풀이입니다.`,pros:[`GROUP BY나 HAVING 없이 JOIN과 DISTINCT만으로도 같은 답을 낼 수 있습니다.`],cons:[`3번 이상 구매한 경우 중복 행이 여러 개 생겨 DISTINCT로 다시 걸러야 하고, 조인 비교 비용이 큽니다.`],whyThisRank:`정답은 같지만 한 번의 그룹 집계로 끝날 일을 테이블 자기 조인과 중복 제거로 돌아갑니다.`,code:f,visualize:N},{id:`repurchase-user-only-trap`,name:`USER_ID 하나로만 GROUP BY`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(U)`,verdict:`PRODUCT_ID를 빼고 USER_ID로만 묶어서, 서로 다른 상품을 1번씩 산 회원까지 재구매자로 잘못 뽑는 함정입니다.`,pros:[`단일 컬럼 GROUP BY에 익숙할 때 무심코 작성하기 쉽습니다.`],cons:[`회원 2처럼 상품 10과 상품 30을 각각 1번씩 산 회원도 COUNT(*) = 2가 되어 잘못 포함됩니다.`,`한 회원이 여러 상품을 재구매했을 때 상품별로 나뉘지 않고 한 줄로 뭉개집니다.`],whyThisRank:`"누가 무엇을" 재구매했는지 묻는 문제이므로 반드시 두 컬럼을 함께 묶어야 합니다.`,code:m,visualize:P}],checks:{cases:[{args:[s],expected:l},{args:[[[1,2,15],[2,1,10],[3,2,15],[4,1,20]]],expected:[[2,15]]},{args:[[[1,5,100],[2,5,200],[3,6,100]]],expected:[]}],random:e=>{let t=4+Math.floor(e()*6);return[Array.from({length:t},(t,n)=>[n+1,1+Math.floor(e()*3),10*(1+Math.floor(e()*3))])]}}};export{F as default};