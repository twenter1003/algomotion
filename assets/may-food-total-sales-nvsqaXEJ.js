import{n as e,t}from"./index-Cf02qAUa.js";import{c as n,l as r,o as i}from"./shared-CL29HWIp.js";var a=20,o=class extends r{caption=``;acts=[];keyframe=!1;step(e){this.settle(!1),this.keyframe=!!e.isKeyframe,super.step(e)}phase(e,t,n){this.settle(!0),super.phase(e,t,n),this.caption=t,this.acts=[]}do(...e){super.do(...e),this.acts.push(...e)}finish(){return this.settle(!1),super.finish()}settle(n){if(!this.caption)return;let r=n?140:this.keyframe?t:320,i=e({phases:[{label:``,caption:``,actions:this.acts}]}).phases[0],o=Math.max(0,...i.actions.map(e=>e.start+e.duration)),s=a*[...this.caption].length-r-o;this.caption=``,s>0&&o+s>i.end&&super.do({type:`wait`,ms:Math.ceil(s)})}},s=[[`P001`,`맛있는스낵`,2e3],[`P002`,`맛있는김치`,1e4],[`P003`,`맛있는라면`,1500],[`P004`,`맛있는콜라`,1200]],c=[[1,`P001`,50,`2022-05-01`],[2,`P001`,30,`2022-05-15`],[3,`P002`,20,`2022-05-10`],[4,`P003`,100,`2022-05-20`],[5,`P004`,80,`2022-04-25`],[6,`P004`,50,`2022-06-02`]],l=[[`P002`,`맛있는김치`,2e5],[`P001`,`맛있는스낵`,16e4],[`P003`,`맛있는라면`,15e4]],u={sql:`SELECT P.PRODUCT_ID, P.PRODUCT_NAME,
       SUM(P.PRICE * O.AMOUNT) AS TOTAL_SALES
FROM FOOD_PRODUCT P
JOIN FOOD_ORDER O ON P.PRODUCT_ID = O.PRODUCT_ID
WHERE O.PRODUCE_DATE LIKE '2022-05%'
GROUP BY P.PRODUCT_ID, P.PRODUCT_NAME
ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;`,python:`def solution(products, orders):
    p_map = {p_id: (name, price) for p_id, name, price in products}
    sales = {}
    for o_id, p_id, amount, date in orders:
        if date.startswith('2022-05') and p_id in p_map:
            name, price = p_map[p_id]
            sales[p_id] = sales.get(p_id, 0) + price * amount
    result = [[p_id, p_map[p_id][0], tot] for p_id, tot in sales.items()]
    return sorted(result, key=lambda r: (-r[2], r[0]))`,javascript:`function solution(products, orders) {
  const pMap = new Map(products.map(([id, name, price]) => [id, { name, price }]));
  const sales = new Map();
  for (const [, pId, amount, date] of orders) {
    if (date.startsWith('2022-05') && pMap.has(pId)) {
      const { price } = pMap.get(pId);
      sales.set(pId, (sales.get(pId) ?? 0) + price * amount);
    }
  }
  const result = [];
  for (const [pId, tot] of sales) {
    result.push([pId, pMap.get(pId).name, tot]);
  }
  return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
}`},d={join:i(u,[`FROM FOOD_PRODUCT P`,`JOIN FOOD_ORDER O ON P.PRODUCT_ID = O.PRODUCT_ID`],[`p_map = {p_id: (name, price) for p_id, name, price in products}`],[`const pMap = new Map(products.map`]),where:i(u,[`WHERE O.PRODUCE_DATE LIKE '2022-05%'`,`GROUP BY P.PRODUCT_ID, P.PRODUCT_NAME`,`SUM(P.PRICE * O.AMOUNT) AS TOTAL_SALES`],[`if date.startswith('2022-05') and p_id in p_map:`,`sales[p_id] = sales.get(p_id, 0) + price * amount`],[`if (date.startsWith('2022-05') && pMap.has(pId))`,`sales.set(pId, (sales.get(pId) ?? 0) + price * amount);`]),order:i(u,[`ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;`],[`return sorted(result, key=lambda r: (-r[2], r[0]))`],[`return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));`])},f={sql:`SELECT P.PRODUCT_ID, P.PRODUCT_NAME,
       SUM(P.PRICE * O.AMOUNT) AS TOTAL_SALES
FROM FOOD_PRODUCT P
JOIN FOOD_ORDER O ON P.PRODUCT_ID = O.PRODUCT_ID
GROUP BY P.PRODUCT_ID, P.PRODUCT_NAME, O.PRODUCE_DATE
HAVING O.PRODUCE_DATE LIKE '2022-05%'
ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;`,python:`def solution(products, orders):
    # 날짜 조건 없이 모든 달 주문을 먼저 조인·곱셈한 뒤 5월만 합산
    p_map = {p_id: (name, price) for p_id, name, price in products}
    all_joined = []
    for o_id, p_id, amount, date in orders:
        if p_id in p_map:
            name, price = p_map[p_id]
            all_joined.append((p_id, name, price * amount, date))
    sales = {}
    for p_id, name, cost, date in all_joined:
        if date.startswith('2022-05'):
            sales[p_id] = sales.get(p_id, 0) + cost
    result = [[p_id, p_map[p_id][0], tot] for p_id, tot in sales.items()]
    return sorted(result, key=lambda r: (-r[2], r[0]))`,javascript:`function solution(products, orders) {
  // 날짜 조건 없이 모든 달 주문을 먼저 조인·곱셈한 뒤 5월만 합산합니다
  const pMap = new Map(products.map(([id, name, price]) => [id, { name, price }]));
  const allJoined = [];
  for (const [, pId, amount, date] of orders) {
    if (pMap.has(pId)) {
      const { name, price } = pMap.get(pId);
      allJoined.push({ pId, name, cost: price * amount, date });
    }
  }
  const sales = new Map();
  for (const { pId, cost, date } of allJoined) {
    if (date.startsWith('2022-05')) {
      sales.set(pId, (sales.get(pId) ?? 0) + cost);
    }
  }
  const result = [];
  for (const [pId, tot] of sales) {
    result.push([pId, pMap.get(pId).name, tot]);
  }
  return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
}`},p={join:i(f,[`JOIN FOOD_ORDER O ON P.PRODUCT_ID = O.PRODUCT_ID`],[`all_joined.append((p_id, name, price * amount, date))`],[`allJoined.push({ pId, name, cost: price * amount, date });`]),order:i(f,[`HAVING O.PRODUCE_DATE LIKE '2022-05%'`,`ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;`],[`return sorted(result, key=lambda r: (-r[2], r[0]))`],[`return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));`])},m={sql:`-- 함정: SUM(AMOUNT) 누락으로 다건 주문 식품의 총매출 과소 계산
SELECT P.PRODUCT_ID, P.PRODUCT_NAME,
       P.PRICE * O.AMOUNT AS TOTAL_SALES
FROM FOOD_PRODUCT P
JOIN FOOD_ORDER O ON P.PRODUCT_ID = O.PRODUCT_ID
WHERE O.PRODUCE_DATE LIKE '2022-05%'
GROUP BY P.PRODUCT_ID, P.PRODUCT_NAME
ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;`,python:`def solution(products, orders):
    # 함정: SUM 없이 첫 번째 주문 수량만 단가에 곱함
    p_map = {p_id: (name, price) for p_id, name, price in products}
    sales = {}
    for o_id, p_id, amount, date in orders:
        if date.startswith('2022-05') and p_id in p_map:
            if p_id not in sales:  # 첫 주문만 반영!
                name, price = p_map[p_id]
                sales[p_id] = price * amount
    result = [[p_id, p_map[p_id][0], tot] for p_id, tot in sales.items()]
    return sorted(result, key=lambda r: (-r[2], r[0]))`,javascript:`function solution(products, orders) {
  // 함정: SUM 없이 첫 번째 주문 수량만 단가에 곱합니다
  const pMap = new Map(products.map(([id, name, price]) => [id, { name, price }]));
  const sales = new Map();
  for (const [, pId, amount, date] of orders) {
    if (date.startsWith('2022-05') && pMap.has(pId)) {
      if (!sales.has(pId)) {
        sales.set(pId, pMap.get(pId).price * amount);
      }
    }
  }
  const result = [];
  for (const [pId, tot] of sales) {
    result.push([pId, pMap.get(pId).name, tot]);
  }
  return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
}`},h={trapSum:i(m,[`P.PRICE * O.AMOUNT AS TOTAL_SALES`],[`if p_id not in sales:  # 첫 주문만 반영!`],[`if (!sales.has(pId)) {`]),done:i(m,[`ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC;`],[`return sorted(result, key=lambda r: (-r[2], r[0]))`],[`return result.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));`])},g=600,_=360,v=14,y=36,b=190,x=34,S=216,C=210,w=438,T=148,E=e=>`prod:${e}`,D=e=>`ord:${e}`,O=e=>`res:${e}`;function k(){let e=[{id:`hdr:p`,kind:`text`,rect:{x:v,y:8,w:b,h:22},tone:`muted`,text:`FOOD_PRODUCT (식품 4종)`},{id:`hdr:o`,kind:`text`,rect:{x:S,y:8,w:C,h:22},tone:`chosen`,text:`FOOD_ORDER (주문 6건)`},{id:`hdr:r`,kind:`text`,rect:{x:w,y:8,w:T,h:22},tone:`good`,text:`5월 총매출 합산`},{id:`status`,kind:`token`,rect:{x:v,y:312,w:572,h:32},tone:`plain`,text:`주문 조인 및 매출 집계 대기`}];return s.forEach(([t,n,r],i)=>{e.push({id:E(i),kind:`token`,rect:{x:v,y:y+i*44,w:b,h:x},tone:`plain`,text:`${t} · ${n} (${r}원)`})}),c.forEach(([t,n,r,i],a)=>{e.push({id:D(a),kind:`token`,rect:{x:S,y:y+a*44,w:C,h:x},tone:`plain`,text:`#${t} [${n}] ${r}개 (${i.slice(5)})`})}),{width:g,height:_,items:e}}var A=e=>({type:`wait`,ms:e}),j=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function M(){let e=new o(k()),t=0,r=new Map(s.map(([e,t,n])=>[e,{name:t,price:n}])),i=new Map;return e.step({title:`FROM FOOD_PRODUCT P: 4개 식품 마스터 로드`,codeHighlights:d.join,work:t,variables:{절:`FROM`,식품수:4}}),e.phase(`식품 테이블 읽기`,`FOOD_PRODUCT 테이블에서 식품 마스터 정보(ID, 이름, 단가) 4건을 로드합니다.`,d.join),e.do({type:`set`,id:`status`,patch:{text:`FROM FOOD_PRODUCT → 4개 식품 단가 확인`,tone:`chosen`},pop:!0},A(180)),e.step({title:`JOIN FOOD_ORDER O: P.PRODUCT_ID = O.PRODUCT_ID 연결`,codeHighlights:d.join,work:t,variables:{절:`JOIN`,총주문수:6}}),e.phase(`주문 테이블 연결`,`FOOD_ORDER 테이블의 주문 내역을 식품 ID 기준으로 조인할 준비를 합니다.`,d.join),e.do({type:`set`,id:`status`,patch:{text:`JOIN FOOD_ORDER → 5월 주문 필터링 대기`,tone:`chosen`},pop:!0},A(180)),e.step({title:`WHERE 5월 필터: PRODUCE_DATE LIKE "2022-05%" 시작`,codeHighlights:d.where,work:t,variables:{절:`WHERE 필터`,대상:`5월 주문만`}}),e.phase(`5월 주문 선별`,`2022년 5월에 생산된 주문(#1, #2, #3, #4) 4건을 먼저 선별하고, 4월·6월 주문은 제외합니다.`,d.where),e.do(...n([j(D(0),`chosen`),j(D(1),`chosen`),j(D(2),`chosen`),j(D(3),`chosen`),j(D(4),`muted`),j(D(5),`muted`),{type:`set`,id:`status`,patch:{text:`5월 주문 4건 통과, 타 월 주문 2건 제외`,tone:`chosen`},pop:!0}]),A(200)),[[1,`P001`,50,1e5],[2,`P001`,30,16e4],[3,`P002`,20,2e5],[4,`P003`,100,15e4]].forEach(([a,o,s,c])=>{t+=1;let l=i.has(o);i.set(o,c);let u=r.get(o);if(e.step({title:`주문 #${a} [${o}]: ${s}개 × ${u.price}원 → 누적 ${c.toLocaleString()}원`,codeHighlights:d.where,work:t,variables:{절:`SUM 집계`,주문:`#${a} [${o}]`,식품누적매출:`${c}원`}}),e.phase(`매출 합산`,l?`주문 #${a}은 스낵(P001)의 5월 두 번째 주문입니다! 이전 10만원에 6만원(30개)을 더해 총 16만원으로 합산됩니다.`:`주문 #${a}의 ${u.name} ${s}개에 단가 ${u.price}원을 곱해 ${c.toLocaleString()}원을 적립합니다.`,d.where),l)e.do(...n([j(D(a-1),`good`),{type:`set`,id:O(0),patch:{text:`${u.name}: ${c.toLocaleString()}원`,tone:`good`},pop:!0}]),A(180));else{let t=i.size-1;e.do(...n([j(D(a-1),`good`),{type:`add`,item:{id:O(t),kind:`token`,rect:{x:w,y:y+t*48,w:T,h:38},tone:`good`,text:`${u.name}: ${c.toLocaleString()}원`},from:D(a-1)}]),A(180))}}),e.step({title:`ORDER BY TOTAL_SALES DESC: 김치(20만) → 스낵(16만) → 라면(15만)`,codeHighlights:d.order,work:t+3,variables:{절:`ORDER BY`,최종출력수:3},answer:l,isKeyframe:!0}),e.phase(`결과 확인`,`총매출 내림차순으로 김치(20만), 스낵(16만), 라면(15만) 순서로 정렬하여 출력을 완료합니다.`,d.order),e.do(...n([{type:`set`,id:O(1),patch:{rect:{x:w,y,w:T,h:38},text:`1위: 김치 (20만원)`,tone:`path`},pop:!0},{type:`set`,id:O(0),patch:{rect:{x:w,y:84,w:T,h:38},text:`2위: 스낵 (16만원)`,tone:`path`},pop:!0},{type:`set`,id:O(2),patch:{rect:{x:w,y:132,w:T,h:38},text:`3위: 라면 (15만원)`,tone:`path`},pop:!0},{type:`set`,id:`status`,patch:{text:`정답: [김치 20만, 스낵 16만, 라면 15만] 3개 식품 출력 완료`,tone:`path`},pop:!0}])),e.finish()}function N(){let e=new o(k());return e.step({title:`전체 조인: 4월·6월 주문까지 포함해 6건 모두 단가 곱셈`,codeHighlights:p.join,work:6,variables:{절:`전체 조인`,계산주문수:6}}),e.phase(`전체 조인 및 곱셈`,`날짜 조건을 나중에 적용하여 4월(#5, 80개)과 6월(#6, 50개) 주문까지 모두 식품 테이블과 조인·곱셈합니다.`,p.join),e.do(...n([...c.map((e,t)=>j(D(t),`chosen`)),{type:`set`,id:`status`,patch:{text:`6개 주문 전체 조인 및 매출 곱셈 완료 (타 월 2건 낭비)`,tone:`chosen`},pop:!0}]),A(220)),e.step({title:`HAVING 5월 필터 + 합산: 정답 동일, 하지만 불필요한 계산 2건 발생`,codeHighlights:p.order,work:10,variables:{절:`HAVING 필터`,결과수:3},answer:l,isKeyframe:!0}),e.phase(`뒤늦은 필터`,`뒤늦게 5월 주문만 남겨 합산합니다. 결과는 같지만 버려질 주문까지 조인·곱셈하느라 더 많은 일을 했습니다.`,p.order),e.do(...n([{type:`add`,item:{id:O(0),kind:`token`,rect:{x:w,y,w:T,h:38},tone:`path`,text:`1위: 김치 (20만원)`}},{type:`add`,item:{id:O(1),kind:`token`,rect:{x:w,y:84,w:T,h:38},tone:`path`,text:`2위: 스낵 (16만원)`}},{type:`add`,item:{id:O(2),kind:`token`,rect:{x:w,y:132,w:T,h:38},tone:`path`,text:`3위: 라면 (15만원)`}},{type:`set`,id:`status`,patch:{text:`정답 3건 동일 (전체 조인 연산 10회)`,tone:`path`},pop:!0}])),e.finish()}function P(){let e=new o(k());return e.step({title:`함정 쿼리: SUM(AMOUNT) 대신 첫 번째 주문(#1)만 단가에 곱함`,codeHighlights:h.trapSum,work:4,variables:{절:`SUM 누락`,스낵반영수량:50}}),e.phase(`합산 누락`,`GROUP BY를 하면서 SUM(AMOUNT)으로 묶지 않아 스낵(P001)의 두 번째 주문(#2, 30개)이 증발하고 첫 주문(#1, 50개)만 반영됩니다!`,h.trapSum),e.do(...n([j(D(0),`good`),j(D(1),`bad`),j(D(2),`good`),j(D(3),`good`),{type:`add`,item:{id:O(0),kind:`token`,rect:{x:w,y,w:T,h:38},tone:`chosen`,text:`김치: 200,000원`}},{type:`add`,item:{id:O(1),kind:`token`,rect:{x:w,y:84,w:T,h:38},tone:`bad`,text:`스낵: 100,000원(누락!)`}},{type:`add`,item:{id:O(2),kind:`token`,rect:{x:w,y:132,w:T,h:38},tone:`chosen`,text:`라면: 150,000원`}},{type:`set`,id:`status`,patch:{text:`함정: 스낵 2번째 주문(30개) 누락 → 16만 아닌 10만 계산`,tone:`bad`},pop:!0}]),A(200)),e.step({title:`오답: 스낵이 라면보다 낮은 10만원으로 계산되어 순위가 뒤바뀜`,codeHighlights:h.done,work:7,variables:{절:`결과`,스낵매출:`10만원(오답)`,라면매출:`15만원`},answer:[[`P002`,`맛있는김치`,2e5],[`P003`,`맛있는라면`,15e4],[`P001`,`맛있는스낵`,1e5]],isKeyframe:!0}),e.phase(`오답 확인`,`스낵 총매출이 16만원이 아닌 10만원으로 왜곡되어 라면(15만원)보다 아래 순위로 밀려났습니다. 반드시 SUM()으로 주문 수량을 합산해야 합니다.`,h.done),e.do({type:`set`,id:`status`,patch:{text:`오답: 스낵 순위 2위→3위 왜곡 (SUM 누락으로 10만원 계산)`,tone:`bad`},pop:!0}),e.finish()}var F={id:`may-food-total-sales`,title:`5월 식품들의 총매출 조회하기`,level:3,category:`sql-join`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/131117`,description:{summary:`FOOD_PRODUCT 테이블과 FOOD_ORDER 테이블에서 생산일자가 2022년 5월인 식품의 식품 ID, 식품 이름, 총매출을 조회합니다. 결과는 총매출을 기준으로 내림차순 정렬하고 총매출이 같다면 식품 ID를 기준으로 오름차순 정렬합니다.`,rules:[`생산일자(PRODUCE_DATE)가 2022년 5월인 주문만 대상으로 함 (PRODUCE_DATE LIKE '2022-05%')`,`총매출 = SUM(P.PRICE * O.AMOUNT)`,`결과는 총매출(TOTAL_SALES) 내림차순, 식품 ID(PRODUCT_ID) 오름차순 정렬`],examples:[{input:`FOOD_PRODUCT = [["P001","맛있는스낵",2000],["P002","맛있는김치",10000],["P003","맛있는라면",1500]], FOOD_ORDER = [[1,"P001",50,"2022-05-01"],[2,"P001",30,"2022-05-15"],[3,"P002",20,"2022-05-10"],[4,"P003",100,"2022-05-20"]]`,output:`[["P002","맛있는김치",200000],["P001","맛있는스낵",160000],["P003","맛있는라면",150000]]`}]},keyIntuitions:[`2022년 5월 주문만 먼저 WHERE PRODUCE_DATE LIKE "2022-05%"로 좁혀 둔 뒤 조인하면 다른 달의 주문을 계산하는 낭비를 없앨 수 있습니다.`,`같은 식품이 5월에 여러 번 주문될 수 있으므로, 반드시 GROUP BY P.PRODUCT_ID, P.PRODUCT_NAME과 함께 SUM(P.PRICE * O.AMOUNT)으로 수량을 모두 누적해야 합니다.`,`정렬 조건은 ORDER BY TOTAL_SALES DESC, P.PRODUCT_ID ASC입니다.`],demo:{input:[s,c],label:`FOOD_PRODUCT 4종, FOOD_ORDER 6건 (스낵은 5월에 50개+30개 2회 주문되어 16만원)`},workUnit:`주문 및 식품 처리 건수`,approaches:[{id:`may-sales-join-sum`,name:`5월 필터 + JOIN + GROUP BY`,rank:`BEST`,timeComplexity:`O(N + M + K log K)`,spaceComplexity:`O(K)`,verdict:`WHERE로 5월 주문만 거른 뒤 식품 테이블과 조인해 SUM(PRICE * AMOUNT)으로 총매출을 정확히 집계하는 정석 쿼리입니다.`,pros:[`5월이 아닌 주문을 조인 단계 전에 차단해 연산량이 최소화됩니다.`,`식품별 다건 주문을 SUM 집계 함수로 누락 없이 정확하게 합산합니다.`],cons:[`GROUP BY 컬럼에 PRODUCT_ID와 PRODUCT_NAME을 모두 명시해야 표준 SQL에 부합합니다.`],whyThisRank:`조인 전 필터링과 그룹 집계를 가장 전형적이고 최적으로 구사한 풀이입니다.`,code:u,visualize:M},{id:`may-sales-join-all-first`,name:`전체 주문 조인 후 HAVING 필터`,rank:`ALTERNATIVE`,timeComplexity:`O(N × M)`,spaceComplexity:`O(N + M)`,verdict:`날짜 필터 없이 모든 달의 주문을 먼저 조인하고 단가를 곱한 뒤 마지막에 5월만 추리는 풀이입니다.`,pros:[`조인 조건을 먼저 생각하고 필터 조건을 나중에 붙이는 순서로 작성하기 쉽습니다.`],cons:[`4월·6월 등 대상이 아닌 대량의 주문까지 전부 조인·곱셈 연산을 수행하므로 비효율적입니다.`],whyThisRank:`정답은 같지만 필터를 뒤로 미뤄 조인 비용이 커집니다.`,code:f,visualize:N},{id:`may-sales-sum-missing-trap`,name:`SUM 집계 누락 (다건 주문 과소 계산)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N + M)`,spaceComplexity:`O(K)`,verdict:`SUM(AMOUNT) 대신 첫 번째 주문 수량만 단가에 곱해, 한 달 동안 여러 번 팔린 식품의 매출이 깎여 순위가 왜곡되는 함정입니다.`,pros:[`식품당 주문이 1건뿐인 단순 테스트 케이스에서는 우연히 통과할 수 있습니다.`],cons:[`스낵처럼 2회 주문된 상품의 매출이 16만원이 아닌 10만원으로 계산되어 오답이 됩니다.`],whyThisRank:`GROUP BY에서 집계 함수(SUM)의 역할을 잊었을 때 발생하는 실무 단골 데이터 오류입니다.`,code:m,visualize:P}],checks:{cases:[{args:[s,c],expected:l},{args:[[[`A1`,`사과`,1e3]],[[1,`A1`,10,`2022-05-02`]]],expected:[[`A1`,`사과`,1e4]]}],random:e=>[[[`P1`,`식품1`,1e3+Math.floor(e()*2e3)],[`P2`,`식품2`,3e3+Math.floor(e()*2e3)]],[[1,`P1`,10+Math.floor(e()*20),`2022-05-01`],[2,`P1`,5+Math.floor(e()*10),`2022-05-15`],[3,`P2`,15+Math.floor(e()*20),`2022-05-10`]]]}};export{F as default};