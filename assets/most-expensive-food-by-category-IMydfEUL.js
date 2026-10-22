import{n as e,t}from"./index-Cf02qAUa.js";import{c as n,l as r,o as i}from"./shared-CL29HWIp.js";var a=20,o=class extends r{caption=``;acts=[];keyframe=!1;step(e){this.settle(!1),this.keyframe=!!e.isKeyframe,super.step(e)}phase(e,t,n){this.settle(!0),super.phase(e,t,n),this.caption=t,this.acts=[]}do(...e){super.do(...e),this.acts.push(...e)}finish(){return this.settle(!1),super.finish()}settle(n){if(!this.caption)return;let r=n?140:this.keyframe?t:320,i=e({phases:[{label:``,caption:``,actions:this.acts}]}).phases[0],o=Math.max(0,...i.actions.map(e=>e.start+e.duration)),s=a*[...this.caption].length-r-o;this.caption=``,s>0&&o+s>i.end&&super.do({type:`wait`,ms:Math.ceil(s)})}},s=[[`P01`,`맛있는배추김치`,`김치`,19e3],[`P02`,`맛있는초코칩`,`과자`,8e3],[`P03`,`맛있는감자칩`,`과자`,6500],[`P04`,`맛있는미역국`,`국`,6500],[`P05`,`맛있는된장국`,`국`,4500],[`P06`,`맛있는카놀라유`,`식용유`,6500]],c=new Set([`과자`,`국`,`김치`,`식용유`]),l=[[`김치`,19e3,`맛있는배추김치`],[`과자`,8e3,`맛있는초코칩`],[`국`,6500,`맛있는미역국`],[`식용유`,6500,`맛있는카놀라유`]],u={sql:`SELECT CATEGORY, PRICE AS MAX_PRICE, PRODUCT_NAME
FROM FOOD_PRODUCT
WHERE (CATEGORY, PRICE) IN (
    SELECT CATEGORY, MAX(PRICE)
    FROM FOOD_PRODUCT
    WHERE CATEGORY IN ('과자', '국', '김치', '식용유')
    GROUP BY CATEGORY
)
ORDER BY MAX_PRICE DESC;`,python:`def solution(foods):
    target = {'과자', '국', '김치', '식용유'}
    # 서브쿼리: 대상 4대 분류별 최대 가격 계산
    max_price = {}
    for p_id, name, cat, price in foods:
        if cat in target:
            max_price[cat] = max(max_price.get(cat, 0), price)
    # 본 쿼리: (분류, 가격) 쌍이 일치하는 행만 선택
    result = []
    for p_id, name, cat, price in foods:
        if cat in max_price and price == max_price[cat]:
            result.append([cat, price, name])
    return sorted(result, key=lambda r: -r[1])`,javascript:`function solution(foods) {
  const target = new Set(['과자', '국', '김치', '식용유']);
  // 서브쿼리: 대상 4대 분류별 최대 가격 계산
  const maxPrice = new Map();
  for (const [, , cat, price] of foods) {
    if (target.has(cat)) {
      maxPrice.set(cat, Math.max(maxPrice.get(cat) ?? 0, price));
    }
  }
  // 본 쿼리: (분류, 가격) 쌍이 일치하는 행만 선택
  const result = [];
  for (const [, name, cat, price] of foods) {
    if (maxPrice.has(cat) && price === maxPrice.get(cat)) {
      result.push([cat, price, name]);
    }
  }
  return result.sort((a, b) => b[1] - a[1]);
}`},d={subquery:i(u,[`WHERE CATEGORY IN ('과자', '국', '김치', '식용유')`,`GROUP BY CATEGORY`],[`if cat in target:`,`max_price[cat] = max(max_price.get(cat, 0), price)`],[`if (target.has(cat))`,`maxPrice.set(cat, Math.max(maxPrice.get(cat) ?? 0, price));`]),where:i(u,[`WHERE (CATEGORY, PRICE) IN (`,`SELECT CATEGORY, MAX(PRICE)`],[`for p_id, name, cat, price in foods:`,`if cat in max_price and price == max_price[cat]:`],[`for (const [, name, cat, price] of foods)`,`if (maxPrice.has(cat) && price === maxPrice.get(cat))`]),order:i(u,[`SELECT CATEGORY, PRICE AS MAX_PRICE, PRODUCT_NAME`,`ORDER BY MAX_PRICE DESC;`],[`return sorted(result, key=lambda r: -r[1])`],[`return result.sort((a, b) => b[1] - a[1]);`])},f={sql:`SELECT CATEGORY, PRICE AS MAX_PRICE, PRODUCT_NAME
FROM (
    SELECT CATEGORY, PRICE, PRODUCT_NAME,
           ROW_NUMBER() OVER (PARTITION BY CATEGORY ORDER BY PRICE DESC) AS RN
    FROM FOOD_PRODUCT
) S
WHERE RN = 1
  AND CATEGORY IN ('과자', '국', '김치', '식용유')
ORDER BY MAX_PRICE DESC;`,python:`def solution(foods):
    # 윈도우 함수 흉내: 모든 분류별로 정렬해 순위를 다 매긴 뒤 필터
    by_cat = {}
    for p_id, name, cat, price in foods:
        by_cat.setdefault(cat, []).append((price, name))
    result = []
    target = {'과자', '국', '김치', '식용유'}
    for cat, items in by_cat.items():
        if cat in target:
            items.sort(key=lambda r: -r[0])
            result.append([cat, items[0][0], items[0][1]])
    return sorted(result, key=lambda r: -r[1])`,javascript:`function solution(foods) {
  // 윈도우 함수 흉내: 모든 분류별로 정렬해 순위를 다 매긴 뒤 필터합니다
  const byCat = new Map();
  for (const [, name, cat, price] of foods) {
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push({ price, name });
  }
  const result = [];
  const target = new Set(['과자', '국', '김치', '식용유']);
  for (const [cat, items] of byCat) {
    if (target.has(cat)) {
      items.sort((a, b) => b.price - a.price);
      result.push([cat, items[0].price, items[0].name]);
    }
  }
  return result.sort((a, b) => b[1] - a[1]);
}`},p={window:i(f,[`ROW_NUMBER() OVER (PARTITION BY CATEGORY ORDER BY PRICE DESC) AS RN`],[`by_cat.setdefault(cat, []).append((price, name))`,`items.sort(key=lambda r: -r[0])`],[`byCat.get(cat).push({ price, name });`,`items.sort((a, b) => b.price - a.price);`]),order:i(f,[`WHERE RN = 1`,`AND CATEGORY IN ('과자', '국', '김치', '식용유')`,`ORDER BY MAX_PRICE DESC;`],[`return sorted(result, key=lambda r: -r[1])`],[`return result.sort((a, b) => b[1] - a[1]);`])},m={sql:`-- 함정: (CATEGORY, PRICE) 튜플 대신 PRICE만 단일 컬럼으로 비교
SELECT CATEGORY, PRICE AS MAX_PRICE, PRODUCT_NAME
FROM FOOD_PRODUCT
WHERE CATEGORY IN ('과자', '국', '김치', '식용유')
  AND PRICE IN (
      SELECT MAX(PRICE)
      FROM FOOD_PRODUCT
      WHERE CATEGORY IN ('과자', '국', '김치', '식용유')
      GROUP BY CATEGORY
  )
ORDER BY MAX_PRICE DESC;`,python:`def solution(foods):
    target = {'과자', '국', '김치', '식용유'}
    # 함정: 분류별 최고 가격 숫자 집합만 뽑음 {19000, 8000, 6500}
    max_prices = set()
    for cat in target:
        prices = [p for _, _, c, p in foods if c == cat]
        if prices:
            max_prices.add(max(prices))
    # PRICE IN (19000, 8000, 6500)에 걸리면 과자 6500원짜리도 통과!
    result = [
        [cat, price, name]
        for _, name, cat, price in foods
        if cat in target and price in max_prices
    ]
    return sorted(result, key=lambda r: -r[1])`,javascript:`function solution(foods) {
  const target = new Set(['과자', '국', '김치', '식용유']);
  // 함정: 분류별 최고 가격 숫자 집합만 뽑습니다 {19000, 8000, 6500}
  const maxPrices = new Set();
  for (const cat of target) {
    const prices = foods.filter(([, , c]) => c === cat).map(([, , , p]) => p);
    if (prices.length) maxPrices.add(Math.max(...prices));
  }
  // PRICE IN (19000, 8000, 6500)에 걸리면 과자 6500원짜리도 통과합니다!
  const result = [];
  for (const [, name, cat, price] of foods) {
    if (target.has(cat) && maxPrices.has(price)) {
      result.push([cat, price, name]);
    }
  }
  return result.sort((a, b) => b[1] - a[1]);
}`},h={trapSubquery:i(m,[`AND PRICE IN (`,`SELECT MAX(PRICE)`],[`max_prices.add(max(prices))`],[`if (prices.length) maxPrices.add(Math.max(...prices));`]),done:i(m,[`ORDER BY MAX_PRICE DESC;`],[`return sorted(result, key=lambda r: -r[1])`],[`return result.sort((a, b) => b[1] - a[1]);`])},g=600,_=360,v=14,y=36,b=240,x=34,S=40,C=270,w=150,T=436,E=150,D=e=>({x:v,y:y+e*S,w:b,h:x}),O=e=>({x:C,y:y+e*48,w,h:38}),k=e=>({x:T,y:y+e*48,w:E,h:38}),A=e=>`in:${e}`,j=e=>`sub:${e}`,M=e=>`out:${e}`;function N(){let e=[{id:`hdr:in`,kind:`text`,rect:{x:v,y:8,w:b,h:22},tone:`muted`,text:`FOOD_PRODUCT (6건)`},{id:`hdr:sub`,kind:`text`,rect:{x:C,y:8,w,h:22},tone:`chosen`,text:`분류별 MAX 가격`},{id:`hdr:out`,kind:`text`,rect:{x:T,y:8,w:E,h:22},tone:`good`,text:`최고가 식품 결과`},{id:`status`,kind:`token`,rect:{x:v,y:312,w:572,h:32},tone:`plain`,text:`쿼리 실행 준비`}];return s.forEach(([,t,n,r],i)=>{e.push({id:A(i),kind:`token`,rect:D(i),tone:`plain`,text:`${n} · ${t} (${r}원)`})}),{width:g,height:_,items:e}}var P=e=>({type:`wait`,ms:e}),F=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function I(){let e=new o(N()),t=0,r=new Map([[`김치`,19e3],[`과자`,8e3],[`국`,6500],[`식용유`,6500]]);t+=6,e.step({title:`서브쿼리: 4대 분류별 MAX(PRICE) 계산 완료`,codeHighlights:d.subquery,work:t,variables:{절:`서브쿼리 집계`,분류수:4}}),e.phase(`분류별 최고가 집계`,`과자(8000원), 국(6500원), 김치(19000원), 식용유(6500원) 4개 분류의 최고가를 계산합니다.`,d.subquery),e.do(...n([{type:`add`,item:{id:j(0),kind:`token`,rect:O(0),tone:`chosen`,text:`김치: 19,000원`}},{type:`add`,item:{id:j(1),kind:`token`,rect:O(1),tone:`chosen`,text:`과자: 8,000원`}},{type:`add`,item:{id:j(2),kind:`token`,rect:O(2),tone:`chosen`,text:`국: 6,500원`}},{type:`add`,item:{id:j(3),kind:`token`,rect:O(3),tone:`chosen`,text:`식용유: 6,500원`}},{type:`set`,id:`status`,patch:{text:`서브쿼리: 4대 분류별 최고가 (김치:19000, 과자:8000, 국:6500, 식용유:6500)`,tone:`chosen`},pop:!0}]),P(220));let i=0;return s.forEach(([a,o,s,l],u)=>{let f=c.has(s)&&l===r.get(s);if(t+=1,e.step({title:`WHERE (CATEGORY, PRICE) IN: ${o}(${s}, ${l}원) 대조`,codeHighlights:d.where,work:t,variables:{절:`WHERE 튜플 검사`,식품:`${o}(${s})`,일치:f?`O`:`X`}}),e.phase(`튜플 일치 확인`,f?`(${s}, ${l}원) 쌍이 서브쿼리 결과와 정확히 일치하여 최고가 식품으로 선택됩니다.`:a===`P03`?`맛있는감자칩은 가격이 6500원이지만 분류가 '과자'입니다. 과자 최고가는 8000원이므로 (과자, 6500)은 탈락합니다!`:`${o}은 ${s} 최고가(${r.get(s)}원)가 아니므로 제외합니다.`,d.where),f){let t=i++;e.do(...n([F(A(u),`good`),{type:`add`,item:{id:M(t),kind:`token`,rect:k(t),tone:`good`,text:`${s} · ${l}원 (${o})`},from:A(u)}]),P(180))}else e.do(F(A(u),`muted`),P(150))}),e.step({title:`ORDER BY MAX_PRICE DESC: 김치(19000) → 과자(8000) → 국·식용유(6500)`,codeHighlights:d.order,work:t,variables:{절:`ORDER BY`,최종출력수:4},answer:l,isKeyframe:!0}),e.phase(`결과 확인`,`튜플 비교 (CATEGORY, PRICE) IN으로 각 분류별 진짜 1등 4개만 정확히 가격 내림차순 정렬되었습니다.`,d.order),e.do({type:`set`,id:`status`,patch:{text:`정답: [김치, 과자, 국, 식용유] 4개 식품 출력 완료`,tone:`path`},pop:!0}),e.finish()}function L(){let e=new o(N());return e.step({title:`윈도우 함수: 전체 행을 분류별로 나누고 가격 내림차순 정렬`,codeHighlights:p.window,work:14,variables:{절:`PARTITION BY`,순위부여:`전체`}}),e.phase(`전체 순위 부여`,`ROW_NUMBER() OVER (PARTITION BY CATEGORY ORDER BY PRICE DESC)로 각 분류 내 순위를 매깁니다.`,p.window),e.do(...n([...s.map((e,t)=>F(A(t),e[0]===`P03`||e[0]===`P05`?`muted`:`good`)),{type:`set`,id:`status`,patch:{text:`전체 분류별 가격 내림차순 정렬 및 RN 부여 완료`,tone:`chosen`},pop:!0}]),P(220)),e.step({title:`바깥 WHERE: RN = 1 AND CATEGORY IN (...) 필터링`,codeHighlights:p.order,work:18,variables:{절:`RN = 1 필터`,결과수:4},answer:l,isKeyframe:!0}),e.phase(`1위만 추출`,`각 분류 1위(RN=1) 중 과자, 국, 김치, 식용유만 골라냅니다. 정답은 같지만 전체 순위를 매기느라 더 많은 일을 했습니다.`,p.order),e.do(...n([{type:`add`,item:{id:M(0),kind:`token`,rect:k(0),tone:`path`,text:`김치 · 19000원 (배추김치)`}},{type:`add`,item:{id:M(1),kind:`token`,rect:k(1),tone:`path`,text:`과자 · 8000원 (초코칩)`}},{type:`add`,item:{id:M(2),kind:`token`,rect:k(2),tone:`path`,text:`국 · 6500원 (미역국)`}},{type:`add`,item:{id:M(3),kind:`token`,rect:k(3),tone:`path`,text:`식용유 · 6500원 (카놀라유)`}},{type:`set`,id:`status`,patch:{text:`정답 4건 동일 (전체 순위 계산으로 연산 18회)`,tone:`path`},pop:!0}])),e.finish()}function R(){let e=new o(N()),t=6;e.step({title:`함정 서브쿼리: (CATEGORY, PRICE) 대신 PRICE IN (19000, 8000, 6500) 추출`,codeHighlights:h.trapSubquery,work:t,variables:{절:`PRICE IN`,가격목록:`19000, 8000, 6500`}}),e.phase(`분류 결합 누락`,`서브쿼리가 단지 가격 집합 {19000, 8000, 6500}만 반환합니다. 어떤 분류의 최고가였는지가 사라졌습니다!`,h.trapSubquery),e.do(...n([{type:`add`,item:{id:j(0),kind:`token`,rect:O(0),tone:`bad`,text:`허용 가격: 19,000원`}},{type:`add`,item:{id:j(1),kind:`token`,rect:O(1),tone:`bad`,text:`허용 가격: 8,000원`}},{type:`add`,item:{id:j(2),kind:`token`,rect:O(2),tone:`bad`,text:`허용 가격: 6,500원`}},{type:`set`,id:`status`,patch:{text:`함정: PRICE IN (19000, 8000, 6500) 단일 비교 시작`,tone:`bad`},pop:!0}]),P(200));let r=0;return s.forEach(([i,a,o,s],c)=>{let l=[19e3,8e3,6500].includes(s);if(t+=1,e.step({title:`WHERE PRICE IN: ${a}(${s}원) → ${i===`P03`?`과자 6500원인데 잘못 통과(함정!)`:l?`통과`:`제외`}`,codeHighlights:h.done,work:t,variables:{절:`PRICE IN 비교`,식품:a,통과:l?`O`:`X`}}),e.phase(`단일 비교`,i===`P03`?`맛있는감자칩은 과자 최고가가 아닌데도 가격이 6500원(국/식용유 최고가와 같음)이라 PRICE IN에 걸려 잘못 통과합니다!`:`${a}(${s}원)의 가격이 {19000, 8000, 6500} 안에 있는지 검사합니다.`,h.done),l){let t=r++;e.do(...n([F(A(c),i===`P03`?`bad`:`good`),{type:`add`,item:{id:M(t),kind:`token`,rect:k(t),tone:i===`P03`?`bad`:`chosen`,text:`${o} · ${s}원 (${a})`},from:A(c)}]),P(170))}else e.do(F(A(c),`muted`),P(150))}),e.step({title:`오답: 과자 분류에 최고가가 아닌 감자칩(6500원)까지 5건 출력 (정답은 4건)`,codeHighlights:h.done,work:t,variables:{절:`결과`,출력수:5,정답수:4},answer:[[`김치`,19e3,`맛있는배추김치`],[`과자`,8e3,`맛있는초코칩`],[`과자`,6500,`맛있는감자칩`],[`국`,6500,`맛있는미역국`],[`식용유`,6500,`맛있는카놀라유`]],isKeyframe:!0}),e.phase(`오답 확인`,`PRICE IN 단일 비교를 쓰면 다른 분류의 최고가와 가격이 우연히 같은 엉뚱한 행이 섞여 나옵니다. 반드시 (CATEGORY, PRICE) 튜플 비교를 써야 합니다.`,h.done),e.do({type:`set`,id:`status`,patch:{text:`오답: 감자칩(과자 6500원) 포함 5건 반환 · (CATEGORY, PRICE) 묶음 필수`,tone:`bad`},pop:!0}),e.finish()}var z={id:`most-expensive-food-by-category`,title:`식품분류별 가장 비싼 식품의 정보 조회하기`,level:3,category:`sql-group-by`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/131116`,description:{summary:`FOOD_PRODUCT 테이블에서 식품분류별로 가격이 제일 비싼 식품의 분류, 가격, 이름을 조회합니다. 식품분류가 '과자', '국', '김치', '식용유'인 경우만 출력하고, 결과는 식품 가격을 기준으로 내림차순 정렬합니다.`,rules:[`식품분류가 '과자', '국', '김치', '식용유'인 경우만 출력해야 함`,`결과는 식품 가격(MAX_PRICE)을 기준으로 내림차순 정렬`,`컬럼명은 CATEGORY, MAX_PRICE, PRODUCT_NAME으로 출력`],examples:[{input:`FOOD_PRODUCT = [["P01","맛있는배추김치","김치",19000],["P02","맛있는초코칩","과자",8000],["P04","맛있는미역국","국",6500],["P06","맛있는카놀라유","식용유",6500]]`,output:`[["김치",19000,"맛있는배추김치"],["과자",8000,"맛있는초코칩"],["국",6500,"맛있는미역국"],["식용유",6500,"맛있는카놀라유"]]`}]},keyIntuitions:[`서브쿼리에서 4개 분류('과자', '국', '김치', '식용유')별 MAX(PRICE)를 구할 때 WHERE CATEGORY IN (...) 조건을 걸어 대상 분류만 집계합니다.`,`본 쿼리와 서브쿼리를 연결할 때 반드시 WHERE (CATEGORY, PRICE) IN (...) 처럼 분류와 가격을 한 튜플로 묶어야 합니다. PRICE IN만 쓰면 다른 분류의 최고가와 가격이 우연히 같은 다른 상품이 섞여 오답이 됩니다.`,`결과는 가격 내림차순(ORDER BY MAX_PRICE DESC)으로 정렬합니다.`],demo:{input:[s],label:`FOOD_PRODUCT 6건 (김치 19000, 과자 8000, 국 6500, 식용유 6500, 그리고 6500원 과자 감자칩)`},workUnit:`식품 행 비교 횟수`,approaches:[{id:`food-by-cat-tuple-subquery`,name:`(분류, 가격) IN 서브쿼리`,rank:`BEST`,timeComplexity:`O(N + K log K)`,spaceComplexity:`O(K)`,verdict:`(CATEGORY, PRICE) IN (SELECT CATEGORY, MAX(PRICE)...) 튜플 비교로 정확히 각 분류의 최고가 식품만 뽑는 정석 쿼리입니다.`,pros:[`분류와 가격을 한 번에 묶어 비교하므로 동률 가격 상품이 다른 분류에 있어도 절대 오작동하지 않습니다.`,`서브쿼리에서 대상 4대 분류만 미리 필터링해 집계하므로 성능이 가장 뛰어납니다.`],cons:[`다중 컬럼 서브쿼리 문법을 정확히 기억하고 있어야 합니다.`],whyThisRank:`SQL에서 그룹별 최댓값 행을 추출하는 가장 교과서적이고 안전한 정석 기법입니다.`,code:u,visualize:I},{id:`food-by-cat-window-filter`,name:`윈도우 함수 순위 부여 후 필터`,rank:`ALTERNATIVE`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`ROW_NUMBER() / RANK() OVER (PARTITION BY CATEGORY ORDER BY PRICE DESC)로 순위를 매긴 뒤 RN = 1과 대상 분류를 거르는 풀이입니다.`,pros:[`동률 1등 처리 등 세부 정책 변경에 유연하게 대응할 수 있습니다.`],cons:[`대상 4대 분류가 아닌 상품까지 모두 그룹화·정렬 순위를 계산하므로 불필요한 계산 비용이 듭니다.`],whyThisRank:`정답은 같지만 대상 외 분류까지 모두 정렬하므로 정석보다 더 많은 일을 합니다.`,code:f,visualize:L},{id:`food-by-cat-price-only-trap`,name:`PRICE IN 단일 컬럼 비교 (튜플 미사용)`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(K)`,verdict:`(CATEGORY, PRICE) 대신 PRICE IN만 비교해 다른 분류의 최고가와 우연히 가격이 같은 엉뚱한 식품이 함께 출력되는 대표적 함정입니다.`,pros:[`단일 컬럼 IN 절이라 튜플 비교를 모를 때 많이 시도합니다.`],cons:[`과자 최고가가 8000원인데도 6500원짜리 감자칩(국/식용유 최고가와 동률)이 결과에 포함되어 오답이 됩니다.`],whyThisRank:`SQL 코딩테스트 및 실무에서 서브쿼리 튜플 비교를 빠뜨려 가장 빈번하게 발생하는 유명한 버그입니다.`,code:m,visualize:R}],checks:{cases:[{args:[s],expected:l},{args:[[[`F1`,`스낵A`,`과자`,3e3],[`F2`,`스낵B`,`과자`,5e3],[`F3`,`김치A`,`김치`,12e3],[`F4`,`음료A`,`음료`,99999]]],expected:[[`김치`,12e3,`김치A`],[`과자`,5e3,`스낵B`]]}],random:e=>[[[`P1`,`과자1`,`과자`,2e3+Math.floor(e()*4e3)],[`P2`,`과자2`,`과자`,7e3+Math.floor(e()*4e3)],[`P3`,`국1`,`국`,3e3+Math.floor(e()*3e3)],[`P4`,`국2`,`국`,7e3+Math.floor(e()*3e3)]]]}};export{z as default};