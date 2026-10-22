import{n as e,t}from"./index-Cf02qAUa.js";import{c as n,l as r,o as i}from"./shared-CL29HWIp.js";var a=20,o=class extends r{caption=``;acts=[];keyframe=!1;step(e){this.settle(!1),this.keyframe=!!e.isKeyframe,super.step(e)}phase(e,t,n){this.settle(!0),super.phase(e,t,n),this.caption=t,this.acts=[]}do(...e){super.do(...e),this.acts.push(...e)}finish(){return this.settle(!1),super.finish()}settle(n){if(!this.caption)return;let r=n?140:this.keyframe?t:320,i=e({phases:[{label:``,caption:``,actions:this.acts}]}).phases[0],o=Math.max(0,...i.actions.map(e=>e.start+e.duration)),s=a*[...this.caption].length-r-o;this.caption=``,s>0&&o+s>i.end&&super.do({type:`wait`,ms:Math.ceil(s)})}},s={0:`BASS`,1:`SNAPPER`,2:`ANCHOVY`},c=[[0,0,30],[1,0,50],[2,0,40],[3,1,20],[4,1,60],[5,2,73]],l=[[1,`BASS`,50],[4,`SNAPPER`,60],[5,`ANCHOVY`,73]],u={sql:`SELECT I.ID, N.FISH_NAME, I.LENGTH
FROM FISH_INFO I
JOIN FISH_NAME_INFO N ON I.FISH_TYPE = N.FISH_TYPE
WHERE (I.FISH_TYPE, I.LENGTH) IN (
    SELECT FISH_TYPE, MAX(LENGTH)
    FROM FISH_INFO
    GROUP BY FISH_TYPE
)
ORDER BY I.ID ASC;`,python:`def solution(fishes, names):
    # 서브쿼리: 종류별 최대 길이 계산
    max_len = {}
    for f_id, f_type, length in fishes:
        max_len[f_type] = max(max_len.get(f_type, 0), length)
    # 본 쿼리: (종류, 최대 길이) 일치하는 행 선택 + 이름 조인
    result = []
    for f_id, f_type, length in fishes:
        if length == max_len[f_type]:
            name = names.get(f_type) or names.get(str(f_type))
            result.append([f_id, name, length])
    return sorted(result, key=lambda r: r[0])`,javascript:`function solution(fishes, names) {
  // 서브쿼리: 종류별 최대 길이 계산
  const maxLen = new Map();
  for (const [, type, len] of fishes) {
    maxLen.set(type, Math.max(maxLen.get(type) ?? 0, len));
  }
  // 본 쿼리: (종류, 최대 길이) 일치하는 행 선택 + 이름 조인
  const result = [];
  for (const [id, type, len] of fishes) {
    if (len === maxLen.get(type)) {
      result.push([id, names[type], len]);
    }
  }
  return result.sort((a, b) => a[0] - b[0]);
}`},d={subquery:i(u,[`SELECT FISH_TYPE, MAX(LENGTH)`,`GROUP BY FISH_TYPE`],[`for f_id, f_type, length in fishes:`,`max_len[f_type] = max(max_len.get(f_type, 0), length)`],[`for (const [, type, len] of fishes)`,`maxLen.set(type, Math.max(maxLen.get(type) ?? 0, len))`]),join:i(u,[`JOIN FISH_NAME_INFO N ON I.FISH_TYPE = N.FISH_TYPE`,`WHERE (I.FISH_TYPE, I.LENGTH) IN (`],[`for f_id, f_type, length in fishes:`,`if length == max_len[f_type]:`],[`for (const [id, type, len] of fishes)`,`if (len === maxLen.get(type))`]),order:i(u,[`ORDER BY I.ID ASC;`],[`return sorted(result, key=lambda r: r[0])`],[`return result.sort((a, b) => a[0] - b[0]);`])},f={sql:`SELECT I.ID, N.FISH_NAME, I.LENGTH
FROM FISH_INFO I
JOIN FISH_NAME_INFO N ON I.FISH_TYPE = N.FISH_TYPE
WHERE I.LENGTH = (
    SELECT MAX(I2.LENGTH)
    FROM FISH_INFO I2
    WHERE I2.FISH_TYPE = I.FISH_TYPE
)
ORDER BY I.ID ASC;`,python:`def solution(fishes, names):
    # 상관 서브쿼리: 각 물고기마다 전체를 다시 훑어 같은 종류의 최댓값 계산
    result = []
    for f_id, f_type, length in fishes:
        same_type_max = max(l for _, t, l in fishes if t == f_type)
        if length == same_type_max:
            name = names.get(f_type) or names.get(str(f_type))
            result.append([f_id, name, length])
    return sorted(result, key=lambda r: r[0])`,javascript:`function solution(fishes, names) {
  // 상관 서브쿼리: 각 물고기마다 전체를 다시 훑어 같은 종류의 최댓값 계산합니다
  const result = [];
  for (const [id, type, len] of fishes) {
    const sameTypeMax = Math.max(...fishes.filter(([, t]) => t === type).map(([, , l]) => l));
    if (len === sameTypeMax) {
      result.push([id, names[type], len]);
    }
  }
  return result.sort((a, b) => a[0] - b[0]);
}`},p={correlate:i(f,[`WHERE I.LENGTH = (`,`SELECT MAX(I2.LENGTH)`,`WHERE I2.FISH_TYPE = I.FISH_TYPE`],[`same_type_max = max(l for _, t, l in fishes if t == f_type)`],[`const sameTypeMax = Math.max(...fishes.filter`]),order:i(f,[`ORDER BY I.ID ASC;`],[`return sorted(result, key=lambda r: r[0])`],[`return result.sort((a, b) => a[0] - b[0]);`])},m={sql:`-- 함정: 종류별 GROUP BY 없이 전체 MAX(LENGTH) 하나만 비교
SELECT I.ID, N.FISH_NAME, I.LENGTH
FROM FISH_INFO I
JOIN FISH_NAME_INFO N ON I.FISH_TYPE = N.FISH_TYPE
WHERE I.LENGTH = (
    SELECT MAX(LENGTH)
    FROM FISH_INFO
)
ORDER BY I.ID ASC;`,python:`def solution(fishes, names):
    # 함정: 종류 구분 없이 전체에서 가장 긴 물고기 하나만 찾음
    overall_max = max(length for _, _, length in fishes)
    result = [
        [f_id, names.get(f_type) or names.get(str(f_type)), length]
        for f_id, f_type, length in fishes
        if length == overall_max
    ]
    return sorted(result, key=lambda r: r[0])`,javascript:`function solution(fishes, names) {
  // 함정: 종류 구분 없이 전체에서 가장 긴 물고기 하나만 찾습니다
  const overallMax = Math.max(...fishes.map(([, , len]) => len));
  const result = [];
  for (const [id, type, len] of fishes) {
    if (len === overallMax) {
      result.push([id, names[type], len]);
    }
  }
  return result.sort((a, b) => a[0] - b[0]);
}`},h={trapMax:i(m,[`SELECT MAX(LENGTH)`,`FROM FISH_INFO`],[`overall_max = max(length for _, _, length in fishes)`],[`const overallMax = Math.max(...fishes.map`]),done:i(m,[`ORDER BY I.ID ASC;`],[`return sorted(result, key=lambda r: r[0])`],[`return result.sort((a, b) => a[0] - b[0]);`])},g=600,_=360,v=14,y=36,b=250,x=34,S=40,C=280,w=140,T=436,E=150,D=e=>({x:v,y:y+e*S,w:b,h:x}),O=e=>({x:C,y:y+e*48,w,h:38}),k=e=>({x:T,y:y+e*48,w:E,h:38}),A=e=>`in:${e}`,j=e=>`sub:${e}`,M=e=>`out:${e}`;function N(){let e=[{id:`hdr:in`,kind:`text`,rect:{x:v,y:8,w:b,h:22},tone:`muted`,text:`FISH_INFO 테이블 (6마리)`},{id:`hdr:sub`,kind:`text`,rect:{x:C,y:8,w,h:22},tone:`chosen`,text:`종류별 MAX 길이`},{id:`hdr:out`,kind:`text`,rect:{x:T,y:8,w:E,h:22},tone:`good`,text:`선택된 대어 (결과)`},{id:`status`,kind:`token`,rect:{x:v,y:312,w:572,h:32},tone:`plain`,text:`쿼리 실행 준비`}];return c.forEach(([t,n,r],i)=>{e.push({id:A(i),kind:`token`,rect:D(i),tone:`plain`,text:`#${t} · ${s[n]} · ${r}cm`})}),{width:g,height:_,items:e}}var P=e=>({type:`wait`,ms:e}),F=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function I(){let e=new o(N()),t=0,r=new Map,i=(e,n=`-`)=>({work:t,variables:{절:e,물고기:n,집계수:r.size}});[0,1,2].forEach(e=>{let n=c.filter(([,t])=>t===e).map(([,,e])=>e),i=Math.max(...n);r.set(e,i),t+=n.length}),e.step({title:`서브쿼리: GROUP BY FISH_TYPE으로 종류별 MAX 계산`,codeHighlights:d.subquery,...i(`서브쿼리 MAX`)}),e.phase(`종류별 최대 길이 계산`,`서브쿼리가 테이블을 한 번 훑어 BASS 50cm, SNAPPER 60cm, ANCHOVY 73cm를 구합니다.`,d.subquery),e.do(...n([{type:`add`,item:{id:j(0),kind:`token`,rect:O(0),tone:`chosen`,text:`BASS MAX: 50cm`}},{type:`add`,item:{id:j(1),kind:`token`,rect:O(1),tone:`chosen`,text:`SNAPPER MAX: 60cm`}},{type:`add`,item:{id:j(2),kind:`token`,rect:O(2),tone:`chosen`,text:`ANCHOVY MAX: 73cm`}},{type:`set`,id:`status`,patch:{text:`종류별 최대 길이 3개 확정 (BASS: 50, SNAPPER: 60, ANCHOVY: 73)`,tone:`chosen`},pop:!0}]),P(220));let a=0;return c.forEach(([o,c,l],u)=>{let f=l===r.get(c);if(t+=1,e.step({title:`본 쿼리 WHERE: #${o} ${s[c]} ${l}cm ↔ MAX(${r.get(c)}cm)`,codeHighlights:d.join,...i(`WHERE 대조`,`#${o}`)}),e.phase(`대어 여부 검사`,f?`#${o} 물고기는 길이가 ${l}cm로 ${s[c]} 종류의 최댓값과 일치합니다! 이름 테이블과 조인해 선택합니다.`:`#${o} 물고기(${l}cm)는 ${s[c]} 최대 길이(${r.get(c)}cm)보다 작으므로 제외합니다.`,d.join),f){let t=a++;e.do(...n([F(A(u),`good`),{type:`add`,item:{id:M(t),kind:`token`,rect:k(t),tone:`good`,text:`#${o} ${s[c]} (${l}cm)`},from:A(u)}]),P(180))}else e.do(F(A(u),`muted`),P(150))}),e.step({title:`ORDER BY ID ASC → 3마리 대어 출력 완료`,codeHighlights:d.order,...i(`ORDER BY`,`완료`),answer:l,isKeyframe:!0}),e.phase(`결과 확인`,`모든 종류별 대어(BASS 1번, SNAPPER 4번, ANCHOVY 5번)를 ID 오름차순으로 완벽히 추출했습니다.`,d.order),e.do({type:`set`,id:`status`,patch:{text:`정답: ID [1, 4, 5] 3마리 대어 조회 완료`,tone:`path`},pop:!0}),e.finish()}function L(){let e=new o(N()),t=0,r=0,i=(e,n=`-`)=>({work:t,variables:{절:e,물고기:n,누적비교:t}});return c.forEach(([a,o,l],u)=>{let d=c.filter(([,e])=>e===o);t+=d.length;let f=Math.max(...d.map(([,,e])=>e)),m=l===f;if(e.step({title:`상관 서브쿼리: #${a} ${s[o]} 위해 같은 종류 ${d.length}마리 재스캔`,codeHighlights:p.correlate,...i(`상관 서브쿼리`,`#${a}`)}),e.phase(`행마다 재집계`,`#${a} 물고기마다 WHERE 서브쿼리가 실행되어 같은 ${s[o]} ${d.length}마리를 처음부터 다시 훑어 최댓값(${f}cm)을 구합니다.`,p.correlate),m){let t=r++;e.do(...n([F(A(u),`good`),{type:`add`,item:{id:M(t),kind:`token`,rect:k(t),tone:`good`,text:`#${a} ${s[o]} (${l}cm)`},from:A(u)}]),P(170))}else e.do(F(A(u),`muted`),P(150))}),e.step({title:`정답 동일, 하지만 행 비교 ${t}회 (정석은 12회)`,codeHighlights:p.order,...i(`ORDER BY`,`완료`),answer:l,isKeyframe:!0}),e.phase(`결과 확인`,`답은 같지만 행마다 서브쿼리를 반복 실행하느라 총 ${t}번 비교했습니다.`,p.order),e.do({type:`set`,id:`status`,patch:{text:`정답 3마리 동일 (상관 서브쿼리 연산 ${t}회)`,tone:`path`},pop:!0}),e.finish()}function R(){let e=new o(N()),t=6,r=Math.max(...c.map(([,,e])=>e));return e.step({title:`함정 서브쿼리: GROUP BY 없이 전체 MAX(LENGTH) = 73 계산`,codeHighlights:h.trapMax,work:t,variables:{절:`전체 MAX`,최대길이:r}}),e.phase(`종류 누락`,`종류별로 묶지 않고 전체 6마리 중 가장 긴 물고기 길이 하나(${r}cm)만 구합니다.`,h.trapMax),e.do(...n([{type:`add`,item:{id:j(0),kind:`token`,rect:O(0),tone:`bad`,text:`전체 MAX: ${r}cm`}},{type:`set`,id:`status`,patch:{text:`종류 구분 없이 전체 최댓값(73cm) 하나만 적용`,tone:`bad`},pop:!0}]),P(200)),c.forEach(([i,a,o],c)=>{let l=o===r;t+=1,e.step({title:`WHERE 검사: #${i} ${s[a]} ${o}cm ↔ 전체MAX(${r}cm)`,codeHighlights:h.done,work:t,variables:{절:`WHERE 비교`,물고기:`#${i}`,통과:l?`O`:`X`}}),e.phase(`비교`,l?`#${i} ANCHOVY(73cm)만 전체 최댓값과 일치해 선택됩니다.`:`#${i} ${s[a]}(${o}cm)는 BASS/SNAPPER의 대어인데도 전체 최댓값(73cm)보다 작아서 탈락합니다!`,h.done),l?e.do(...n([F(A(c),`good`),{type:`add`,item:{id:M(0),kind:`token`,rect:k(0),tone:`bad`,text:`#${i} ${s[a]} (${o}cm)`},from:A(c)}]),P(180)):e.do(F(A(c),`muted`),P(150))}),e.step({title:`오답: BASS와 SNAPPER 대어가 모두 빠지고 ANCHOVY 1마리만 반환`,codeHighlights:h.done,work:t,variables:{절:`결과`,출력수:1,정답수:3},answer:[[5,`ANCHOVY`,73]],isKeyframe:!0}),e.phase(`오답 확인`,`종류별 대어가 아니라 전체 중 1등만 뽑혀서 정답 3건 중 2건이 누락되었습니다.`,h.done),e.do({type:`set`,id:`status`,patch:{text:`오답: [5번 ANCHOVY] 1마리만 출력 · BASS, SNAPPER 대어 누락`,tone:`bad`},pop:!0}),e.finish()}var z={id:`biggest-fish-per-type`,title:`물고기 종류 별 대어 찾기`,level:3,category:`sql-aggregate`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/293261`,description:{summary:`FISH_INFO 테이블과 FISH_NAME_INFO 테이블에서 물고기 종류(FISH_TYPE)별로 가장 큰 물고기의 ID, 물고기 이름(FISH_NAME), 길이(LENGTH)를 출력합니다. 결과는 물고기의 ID에 대해 오름차순 정렬합니다. 물고기 종류별 가장 큰 물고기는 1마리만 존재합니다.`,rules:[`물고기 종류별로 가장 큰 물고기를 찾아야 함`,`물고기 ID에 대해 오름차순 정렬`,`물고기 종류별 가장 큰 물고기는 1마리만 주어지며 10cm 이하인 경우는 없음`],examples:[{input:`FISH_INFO = [[0,0,30],[1,0,50],[2,0,40],[3,1,20],[4,1,60],[5,2,73]], FISH_NAME_INFO = {0:"BASS", 1:"SNAPPER", 2:"ANCHOVY"}`,output:`[[1, "BASS", 50], [4, "SNAPPER", 60], [5, "ANCHOVY", 73]]`}]},keyIntuitions:[`집계 함수(MAX)와 그 최댓값을 가진 원본 행의 다른 컬럼(ID)을 함께 조회하려면, 서브쿼리에서 (FISH_TYPE, MAX(LENGTH)) 쌍을 구한 뒤 본 쿼리에서 (FISH_TYPE, LENGTH) IN (...)으로 일치시켜야 합니다.`,`물고기 이름(FISH_NAME)은 FISH_NAME_INFO 테이블에 있으므로 FISH_TYPE을 외래키로 조인(JOIN)해야 합니다.`,`GROUP BY 없이 MAX(LENGTH)만 쓰면 전체 중 최고 길이 하나만 비교하게 되므로 반드시 종류별 GROUP BY를 포함해야 합니다.`],demo:{input:[c,s],label:`FISH_INFO 6마리 (BASS 3마리 중 50cm, SNAPPER 2마리 중 60cm, ANCHOVY 1마리 73cm)`},workUnit:`물고기 행 비교 횟수`,approaches:[{id:`biggest-fish-group-subquery`,name:`종류별 MAX 서브쿼리 + JOIN`,rank:`BEST`,timeComplexity:`O(N + K log K)`,spaceComplexity:`O(K)`,verdict:`서브쿼리에서 종류별 MAX(LENGTH)를 한 번에 집계하고 (FISH_TYPE, LENGTH) IN으로 대어 행만 골라내는 정석 쿼리입니다.`,pros:[`테이블을 2번만 훑어(서브쿼리 1회 + 본 쿼리 1회) 모든 종류의 대어를 효율적으로 찾습니다.`,`튜플 비교 (I.FISH_TYPE, I.LENGTH) IN (...) 구문이 매우 직관적이고 표준적입니다.`],cons:[`MySQL 등 일부 RDBMS에서는 서브쿼리 인덱스 최적화가 필요할 수 있습니다.`],whyThisRank:`종류별 집계와 행 선택을 가장 깔끔하고 의도가 분명하게 분리한 표준 SQL 패턴입니다.`,code:u,visualize:I},{id:`biggest-fish-correlated-subquery`,name:`상관 서브쿼리로 행마다 재집계`,rank:`ALTERNATIVE`,timeComplexity:`O(N²)`,spaceComplexity:`O(1)`,verdict:`본 쿼리의 물고기 행마다 서브쿼리를 실행해 같은 종류 물고기들의 최댓값을 매번 다시 구하는 풀이입니다.`,pros:[`튜플 비교 문법 없이 단일 컬럼 비교로 작성할 수 있습니다.`],cons:[`물고기 수 N만큼 서브쿼리가 반복 실행되어 행 수가 많을수록 심각하게 느려집니다.`],whyThisRank:`정답은 같지만 한 번의 GROUP BY 집계로 끝날 일을 행마다 반복해 계산 낭비가 큽니다.`,code:f,visualize:L},{id:`biggest-fish-overall-max-trap`,name:`종류 구분 없이 전체 MAX(LENGTH)만 비교`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(1)`,verdict:`종류별(GROUP BY) 분리를 빠뜨리고 전체 테이블에서 가장 긴 물고기 하나만 비교해 다른 종류의 대어를 모두 놓치는 함정입니다.`,pros:[`GROUP BY를 잊었을 때 자주 실수하는 형태입니다.`],cons:[`BASS나 SNAPPER의 대어(50cm, 60cm)가 73cm보다 작아 전부 누락되고 ANCHOVY만 출력됩니다.`],whyThisRank:`"종류별 대어"라는 핵심 요구사항을 전체 최댓값으로 축소해 버린 전형적인 오답입니다.`,code:m,visualize:R}],checks:{cases:[{args:[c,s],expected:l},{args:[[[1,0,45],[2,0,52],[3,1,30]],{0:`BASS`,1:`SNAPPER`}],expected:[[2,`BASS`,52],[3,`SNAPPER`,30]]}],random:e=>[[[1,0,20+Math.floor(e()*20)],[2,0,45+Math.floor(e()*20)],[3,1,30+Math.floor(e()*20)],[4,1,55+Math.floor(e()*20)]],{0:`BASS`,1:`SNAPPER`}]}};export{z as default};