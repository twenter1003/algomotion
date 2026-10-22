import{n as e,t}from"./index-Cf02qAUa.js";import{c as n,l as r,o as i}from"./shared-CL29HWIp.js";var a=20,o=class extends r{caption=``;acts=[];keyframe=!1;step(e){this.settle(!1),this.keyframe=!!e.isKeyframe,super.step(e)}phase(e,t,n){this.settle(!0),super.phase(e,t,n),this.caption=t,this.acts=[]}do(...e){super.do(...e),this.acts.push(...e)}finish(){return this.settle(!1),super.finish()}settle(n){if(!this.caption)return;let r=n?140:this.keyframe?t:320,i=e({phases:[{label:``,caption:``,actions:this.acts}]}).phases[0],o=Math.max(0,...i.actions.map(e=>e.start+e.duration)),s=a*[...this.caption].length-r-o;this.caption=``,s>0&&o+s>i.end&&super.do({type:`wait`,ms:Math.ceil(s)})}},s=[[`A1`,`Lucy`,`2016-01-01`],[`A2`,`Raven`,`2016-02-01`],[`A3`,`Bella`,`2016-03-01`],[`A4`,`Coco`,`2016-04-01`],[`A5`,`Max`,`2016-05-01`]],c=[[`A1`,`2016-01-05`],[`A2`,`2016-07-01`],[`A3`,`2017-03-01`],[`A4`,`2016-05-01`]],l=[[`A3`,`Bella`],[`A2`,`Raven`]],u={sql:`SELECT I.ANIMAL_ID, I.NAME
FROM ANIMAL_INS I
JOIN ANIMAL_OUTS O ON I.ANIMAL_ID = O.ANIMAL_ID
ORDER BY DATEDIFF(O.DATETIME, I.DATETIME) DESC
LIMIT 2;`,python:`def solution(ins, outs):
    out_map = {id: date for id, date in outs}
    # 입양 간 동물만 조인하여 보호 기간(일수) 계산
    diffs = []
    for id, name, in_date in ins:
        if id in out_map:
            from datetime import date
            d_in = date.fromisoformat(in_date)
            d_out = date.fromisoformat(out_map[id])
            days = (d_out - d_in).days
            diffs.append((id, name, days))
    # 보호 기간 긴 순(내림차순) 상위 2마리 선택
    diffs.sort(key=lambda r: -r[2])
    return [[id, name] for id, name, _ in diffs[:2]]`,javascript:`function solution(ins, outs) {
  const outMap = new Map(outs);
  const diffs = [];
  for (const [id, name, inDate] of ins) {
    if (outMap.has(id)) {
      const ms = new Date(outMap.get(id)).getTime() - new Date(inDate).getTime();
      const days = Math.round(ms / (1000 * 60 * 60 * 24));
      diffs.push({ id, name, days });
    }
  }
  diffs.sort((a, b) => b.days - a.days);
  return diffs.slice(0, 2).map(({ id, name }) => [id, name]);
}`},d={join:i(u,[`FROM ANIMAL_INS I`,`JOIN ANIMAL_OUTS O ON I.ANIMAL_ID = O.ANIMAL_ID`],[`out_map = {id: date for id, date in outs}`],[`const outMap = new Map(outs);`]),diff:i(u,[`ORDER BY DATEDIFF(O.DATETIME, I.DATETIME) DESC`],[`days = (d_out - d_in).days`,`diffs.sort(key=lambda r: -r[2])`],[`const days = Math.round(ms / (1000 * 60 * 60 * 24));`,`diffs.sort((a, b) => b.days - a.days);`]),limit:i(u,[`SELECT I.ANIMAL_ID, I.NAME`,`LIMIT 2;`],[`return [[id, name] for id, name, _ in diffs[:2]]`],[`return diffs.slice(0, 2).map(({ id, name }) => [id, name]);`])},f={sql:`SELECT ANIMAL_ID, NAME
FROM (
    SELECT I.ANIMAL_ID, I.NAME,
           ROW_NUMBER() OVER (ORDER BY DATEDIFF(O.DATETIME, I.DATETIME) DESC) AS RN
    FROM ANIMAL_INS I
    JOIN ANIMAL_OUTS O ON I.ANIMAL_ID = O.ANIMAL_ID
) S
WHERE RN <= 2
ORDER BY RN ASC;`,python:`def solution(ins, outs):
    # 서브쿼리에서 전체 순위를 매긴 뒤 RN <= 2 필터
    out_map = {id: date for id, date in outs}
    from datetime import date
    ranked = []
    for id, name, in_date in ins:
        if id in out_map:
            days = (date.fromisoformat(out_map[id]) - date.fromisoformat(in_date)).days
            ranked.append((id, name, days))
    ranked.sort(key=lambda r: -r[2])
    # 모든 순위를 매긴 뒤 상위 2건 추출
    return [[id, name] for id, name, _ in ranked if True][:2]`,javascript:`function solution(ins, outs) {
  // 서브쿼리에서 전체 순위를 매긴 뒤 RN <= 2 필터합니다
  const outMap = new Map(outs);
  const ranked = [];
  for (const [id, name, inDate] of ins) {
    if (outMap.has(id)) {
      const days = Math.round((new Date(outMap.get(id)).getTime() - new Date(inDate).getTime()) / (1000 * 60 * 60 * 24));
      ranked.push({ id, name, days });
    }
  }
  ranked.sort((a, b) => b.days - a.days);
  return ranked.slice(0, 2).map(({ id, name }) => [id, name]);
}`},p={window:i(f,[`ROW_NUMBER() OVER (ORDER BY DATEDIFF(O.DATETIME, I.DATETIME) DESC) AS RN`],[`ranked.sort(key=lambda r: -r[2])`],[`ranked.sort((a, b) => b.days - a.days);`]),limit:i(f,[`WHERE RN <= 2`,`ORDER BY RN ASC;`],[`return [[id, name] for id, name, _ in ranked if True][:2]`],[`return ranked.slice(0, 2).map(({ id, name }) => [id, name]);`])},m={sql:`-- 함정: 보호 기간(DATEDIFF) 대신 입소일(I.DATETIME ASC) 순 정렬
SELECT I.ANIMAL_ID, I.NAME
FROM ANIMAL_INS I
JOIN ANIMAL_OUTS O ON I.ANIMAL_ID = O.ANIMAL_ID
ORDER BY I.DATETIME ASC
LIMIT 2;`,python:`def solution(ins, outs):
    # 함정: 보호 기간이 아니라 입소일이 빠른 순으로 정렬해 일찍 입양 간 동물이 뽑힘
    out_ids = {id for id, _ in outs}
    adopted = [r for r in ins if r[0] in out_ids]
    adopted.sort(key=lambda r: r[2])  # in_date ASC
    return [[id, name] for id, name, _ in adopted[:2]]`,javascript:`function solution(ins, outs) {
  // 함정: 보호 기간이 아니라 입소일이 빠른 순으로 정렬해 일찍 입양 간 동물이 뽑힙니다
  const outIds = new Set(outs.map(([id]) => id));
  const adopted = ins.filter(([id]) => outIds.has(id));
  adopted.sort((a, b) => a[2].localeCompare(b[2])); // inDate ASC
  return adopted.slice(0, 2).map(([id, name]) => [id, name]);
}`},h={trapOrder:i(m,[`ORDER BY I.DATETIME ASC`,`LIMIT 2;`],[`adopted.sort(key=lambda r: r[2])  # in_date ASC`],[`adopted.sort((a, b) => a[2].localeCompare(b[2])); // inDate ASC`]),done:i(m,[`SELECT I.ANIMAL_ID, I.NAME`],[`return [[id, name] for id, name, _ in adopted[:2]]`],[`return adopted.slice(0, 2).map(([id, name]) => [id, name]);`])},g=600,_=350,v=14,y=36,b=210,x=34,S=236,C=160,w=410,T=176,E=e=>`in:${e}`,D=e=>`out:${e}`,O=e=>`res:${e}`;function k(){let e=[{id:`hdr:i`,kind:`text`,rect:{x:v,y:8,w:b,h:22},tone:`muted`,text:`ANIMAL_INS (입소 5마리)`},{id:`hdr:o`,kind:`text`,rect:{x:S,y:8,w:C,h:22},tone:`chosen`,text:`ANIMAL_OUTS (입양 4마리)`},{id:`hdr:r`,kind:`text`,rect:{x:w,y:8,w:T,h:22},tone:`good`,text:`보호 기간 순위`},{id:`status`,kind:`token`,rect:{x:v,y:304,w:572,h:32},tone:`plain`,text:`조인 및 보호 기간 계산 대기`}];return s.forEach(([t,n,r],i)=>{e.push({id:E(i),kind:`token`,rect:{x:v,y:y+i*44,w:b,h:x},tone:`plain`,text:`${t} · ${n} (${r})`})}),c.forEach(([t,n],r)=>{e.push({id:D(r),kind:`token`,rect:{x:S,y:y+r*44,w:C,h:x},tone:`plain`,text:`${t} 입양 (${n})`})}),{width:g,height:_,items:e}}var A=e=>({type:`wait`,ms:e}),j=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function M(){let e=new o(k()),t=0;return e.step({title:`FROM ANIMAL_INS I: 입소 동물 5마리 확인`,codeHighlights:d.join,work:t,variables:{절:`FROM`,입소동물수:s.length}}),e.phase(`입소 동물 읽기`,`ANIMAL_INS 테이블에서 입소한 동물 5마리의 입소일을 읽습니다.`,d.join),e.do({type:`set`,id:`status`,patch:{text:`FROM ANIMAL_INS → 입소 동물 5마리 로드`,tone:`chosen`},pop:!0},A(180)),e.step({title:`JOIN ANIMAL_OUTS O: 입양 동물 4마리와 조인`,codeHighlights:d.join,work:t,variables:{절:`JOIN`,입양동물수:c.length}}),e.phase(`입양 기록 연결`,`ANIMAL_OUTS와 조인해 입양 간 동물 4마리를 매칭합니다. 미입양 동물(Max)은 제외됩니다.`,d.join),e.do(...n([j(E(0),`chosen`),j(E(1),`chosen`),j(E(2),`chosen`),j(E(3),`chosen`),j(E(4),`muted`),{type:`set`,id:`status`,patch:{text:`입양 동물 4마리 조인 매칭 (A5 Max 미입양 제외)`,tone:`chosen`},pop:!0}]),A(200)),[{id:`A1`,name:`Lucy`,inD:`2016-01-01`,outD:`2016-01-05`,days:4,r:0},{id:`A2`,name:`Raven`,inD:`2016-02-01`,outD:`2016-07-01`,days:151,r:1},{id:`A3`,name:`Bella`,inD:`2016-03-01`,outD:`2017-03-01`,days:365,r:2},{id:`A4`,name:`Coco`,inD:`2016-04-01`,outD:`2016-05-01`,days:30,r:3}].forEach((r,i)=>{t+=1,e.step({title:`DATEDIFF: ${r.name}(${r.id}) → 보호 기간 ${r.days}일 계산`,codeHighlights:d.diff,work:t,variables:{절:`DATEDIFF`,동물:r.name,보호일수:`${r.days}일`}}),e.phase(`보호 기간 계산`,`${r.name}: 입양일(${r.outD}) - 입소일(${r.inD}) = ${r.days}일간 보호되었습니다.`,d.diff),e.do(...n([j(E(r.r),`good`),j(D(r.r),`good`),{type:`add`,item:{id:O(i),kind:`token`,rect:{x:w,y:y+i*48,w:T,h:38},tone:`good`,text:`${r.name}: ${r.days}일`},from:E(r.r)}]),A(180))}),e.step({title:`ORDER BY DATEDIFF DESC: 보호 기간 긴 순서로 정렬`,codeHighlights:d.diff,work:t+4,variables:{절:`ORDER BY DESC`,정렬대상:`입양 4마리`}}),e.phase(`정렬하기`,`보호 기간을 기준으로 Bella(365일) 1위, Raven(151일) 2위, Coco(30일) 3위, Lucy(4일) 4위로 정렬합니다.`,d.diff),e.do(...n([{type:`set`,id:O(2),patch:{rect:{x:w,y,w:T,h:38},text:`1위: Bella (365일)`,tone:`good`},pop:!0},{type:`set`,id:O(1),patch:{rect:{x:w,y:84,w:T,h:38},text:`2위: Raven (151일)`,tone:`good`},pop:!0},{type:`set`,id:O(3),patch:{rect:{x:w,y:132,w:T,h:38},text:`3위: Coco (30일)`,tone:`muted`},pop:!0},{type:`set`,id:O(0),patch:{rect:{x:w,y:180,w:T,h:38},text:`4위: Lucy (4일)`,tone:`muted`},pop:!0}]),A(200)),e.step({title:`LIMIT 2: 상위 2마리 Bella, Raven 최종 추출`,codeHighlights:d.limit,work:t+4,variables:{절:`LIMIT 2`,"1위":`Bella(365일)`,"2위":`Raven(151일)`},answer:l,isKeyframe:!0}),e.phase(`상위 2마리 추출`,`LIMIT 2에 따라 상위 2마리(1위 Bella, 2위 Raven)만 남기고 나머지는 제외합니다.`,d.limit),e.do(...n([j(O(2),`path`),j(O(1),`path`),{type:`remove`,id:O(0)},{type:`remove`,id:O(3)},{type:`set`,id:`status`,patch:{text:`정답: [A3 Bella, A2 Raven] 2마리 출력 완료`,tone:`path`},pop:!0}])),e.finish()}function N(){let e=new o(k());return e.step({title:`윈도우 함수: 전체 입양 동물 4마리 순위(RN) 부여`,codeHighlights:p.window,work:4,variables:{절:`ROW_NUMBER()`,정렬대상:4}}),e.phase(`전체 순위 계산`,`ROW_NUMBER() OVER (ORDER BY DATEDIFF DESC)로 4마리 동물 전체의 보호 기간 순위를 1위부터 4위까지 모두 매깁니다.`,p.window),e.do(...n([{type:`add`,item:{id:O(0),kind:`token`,rect:{x:w,y,w:T,h:38},tone:`chosen`,text:`RN=1: Bella (365일)`}},{type:`add`,item:{id:O(1),kind:`token`,rect:{x:w,y:84,w:T,h:38},tone:`chosen`,text:`RN=2: Raven (151일)`}},{type:`add`,item:{id:O(2),kind:`token`,rect:{x:w,y:132,w:T,h:38},tone:`muted`,text:`RN=3: Coco (30일)`}},{type:`add`,item:{id:O(3),kind:`token`,rect:{x:w,y:180,w:T,h:38},tone:`muted`,text:`RN=4: Lucy (4일)`}},{type:`set`,id:`status`,patch:{text:`전체 동물 4마리 순위(RN=1..4) 매김 완료`,tone:`chosen`},pop:!0}]),A(220)),e.step({title:`WHERE RN <= 2: 상위 2마리 필터링 완료`,codeHighlights:p.limit,work:6,variables:{절:`RN <= 2`,최종출력수:2},answer:l,isKeyframe:!0}),e.phase(`필터링`,`정답은 같지만 상위 2마리만 찾는 대신 모든 동물의 순위를 매긴 뒤 잘라냈습니다.`,p.limit),e.do(...n([j(O(0),`path`),j(O(1),`path`),{type:`remove`,id:O(2)},{type:`remove`,id:O(3)},{type:`set`,id:`status`,patch:{text:`정답 2마리 동일 (서브쿼리 순위 부여 연산 6회)`,tone:`path`},pop:!0}])),e.finish()}function P(){let e=new o(k());return e.step({title:`함정 쿼리: 보호 기간 대신 입소일(I.DATETIME ASC) 빠른 순 정렬`,codeHighlights:h.trapOrder,work:4,variables:{절:`ORDER BY`,정렬기준:`입소일 ASC (오답!)`}}),e.phase(`정렬 기준 왜곡`,`보호 기간(DATEDIFF)을 계산하지 않고 가장 먼저 입소한 동물 순서대로 2마리를 뽑아 버립니다!`,h.trapOrder),e.do(...n([j(E(0),`bad`),j(E(1),`good`),j(E(2),`muted`),{type:`add`,item:{id:O(0),kind:`token`,rect:{x:w,y,w:T,h:38},tone:`bad`,text:`1위: Lucy (4일 보호)`}},{type:`add`,item:{id:O(1),kind:`token`,rect:{x:w,y:84,w:T,h:38},tone:`chosen`,text:`2위: Raven (151일 보호)`}},{type:`set`,id:`status`,patch:{text:`함정: 일찍 입소해 4일만에 나간 Lucy(A1)가 1위로 뽑힘!`,tone:`bad`},pop:!0}]),A(200)),e.step({title:`오답: 365일 보호받은 Bella가 빠지고 4일 보호받은 Lucy가 1위로 출력`,codeHighlights:h.done,work:6,variables:{절:`결과`,"1위":`Lucy (오답)`,정답1위:`Bella`},answer:[[`A1`,`Lucy`],[`A2`,`Raven`]],isKeyframe:!0}),e.phase(`오답 확인`,`가장 오래 보호된 Bella(A3, 365일)가 누락되고 4일 만에 입양 간 Lucy(A1)가 잘못 출력되었습니다. 반드시 DATEDIFF(O.DATETIME, I.DATETIME) 내림차순이어야 합니다.`,h.done),e.do({type:`set`,id:`status`,patch:{text:`오답: [A1 Lucy, A2 Raven] · 진짜 1위 Bella(A3, 365일) 누락`,tone:`bad`},pop:!0}),e.finish()}var F={id:`long-term-protected-animals-2`,title:`오랜 기간 보호한 동물(2)`,level:3,category:`sql-string-date`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/59411`,description:{summary:`입양을 간 동물 중, 보호 기간이 가장 길었던 동물 두 마리의 아이디와 이름을 조회합니다. 이때 결과는 보호 기간이 긴 순(내림차순)으로 조회해야 합니다.`,rules:[`입양을 간 동물만을 대상으로 함 (ANIMAL_INS와 ANIMAL_OUTS 조인)`,`보호 기간 = 입양일(OUTS.DATETIME) - 보호시작일(INS.DATETIME)`,`보호 기간이 긴 순(내림차순)으로 상위 2마리만 출력 (LIMIT 2)`],examples:[{input:`ANIMAL_INS = [["A1","Lucy","2016-01-01"],["A2","Raven","2016-02-01"],["A3","Bella","2016-03-01"]], ANIMAL_OUTS = [["A1","2016-01-05"],["A2","2016-07-01"],["A3","2017-03-01"]]`,output:`[["A3", "Bella"], ["A2", "Raven"]]`}]},keyIntuitions:[`"입양을 간 동물"이어야 하므로 ANIMAL_INS와 ANIMAL_OUTS를 ANIMAL_ID 기준으로 내부 조인(INNER JOIN)합니다.`,`보호 기간은 DATEDIFF(O.DATETIME, I.DATETIME) 또는 O.DATETIME - I.DATETIME으로 계산합니다.`,`가장 오래 보호된 상위 2마리를 뽑아야 하므로 ORDER BY DATEDIFF(...) DESC LIMIT 2로 정렬 및 제한합니다.`,`입소일이 빠른 순(I.DATETIME ASC)으로 잘못 정렬하면 일찍 들어와서 금방 입양 간 동물이 잘못 뽑히므로 주의해야 합니다.`],demo:{input:[s,c],label:`ANIMAL_INS 5마리, ANIMAL_OUTS 4마리 (Bella 365일 1위, Raven 151일 2위, Lucy 4일)`},workUnit:`동물 날짜 대조 횟수`,approaches:[{id:`long-term-datediff-limit`,name:`JOIN + DATEDIFF 내림차순 LIMIT 2`,rank:`BEST`,timeComplexity:`O(N + M + K log K)`,spaceComplexity:`O(K)`,verdict:`INNER JOIN으로 입양 동물만 연결한 뒤 DATEDIFF 내림차순으로 상위 2마리를 추출하는 정석 쿼리입니다.`,pros:[`DATEDIFF 함수로 보호 기간 일수를 정확히 계산합니다.`,`LIMIT 2를 통해 최상위 2개 행만 빠르게 반환합니다.`],cons:[`MySQL의 DATEDIFF(종료일, 시작일) 인자 순서를 반대로 쓰지 않도록 주의해야 합니다.`],whyThisRank:`날짜 연산과 조인, 정렬 제한을 가장 직관적이고 표준적으로 작성한 정석 풀이입니다.`,code:u,visualize:M},{id:`long-term-window-rn`,name:`서브쿼리 윈도우 순위 부여 후 필터`,rank:`ALTERNATIVE`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`ROW_NUMBER()로 전체 동물의 순위를 다 매긴 뒤 바깥에서 RN <= 2를 거르는 풀이입니다.`,pros:[`동률 순위 처리 정책(DENSE_RANK 등) 변경 시 유연하게 수정할 수 있습니다.`],cons:[`LIMIT 2로 끝낼 수 있는 작업을 전체 순위 번호 부여로 돌아가므로 계산 비용이 큽니다.`],whyThisRank:`결과는 같지만 굳이 서브쿼리와 윈도우 함수를 거쳐야 하므로 정석보다 복잡합니다.`,code:f,visualize:N},{id:`long-term-intake-asc-trap`,name:`보호 기간 대신 입소일(I.DATETIME ASC) 순 정렬`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N + M + K log K)`,spaceComplexity:`O(K)`,verdict:`보호 기간 계산을 빠뜨리고 가장 먼저 입소한 순서대로 정렬해, 일찍 입양 간 동물이 잘못 뽑히는 함정입니다.`,pros:[`DATEDIFF 계산 없이 작성하기 쉬워 오해하기 쉽습니다.`],cons:[`1월 1일에 와서 1월 5일에 입양 간 Lucy(4일 보호)가 1위로 뽑히고 진짜 1위 Bella(365일)가 탈락합니다.`],whyThisRank:`"오랜 기간 보호한"이라는 문제 핵심 조건을 "가장 일찍 입소한"으로 잘못 해석한 전형적인 오답입니다.`,code:m,visualize:P}],checks:{cases:[{args:[s,c],expected:l},{args:[[[`B1`,`개1`,`2020-01-01`],[`B2`,`개2`,`2020-02-01`]],[[`B1`,`2020-01-10`],[`B2`,`2020-03-01`]]],expected:[[`B2`,`개2`],[`B1`,`개1`]]}],random:e=>[[[`D1`,`동물1`,`2021-01-01`],[`D2`,`동물2`,`2021-02-01`],[`D3`,`동물3`,`2021-03-01`]],[[`D1`,`2021-01-${String(10+Math.floor(e()*10)).padStart(2,`0`)}`],[`D2`,`2021-08-${String(10+Math.floor(e()*10)).padStart(2,`0`)}`],[`D3`,`2022-01-${String(10+Math.floor(e()*10)).padStart(2,`0`)}`]]]}};export{F as default};