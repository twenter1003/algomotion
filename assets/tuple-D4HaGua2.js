import{n as e,t}from"./index-D3a9ZpZK.js";import{o as n}from"./layout-DFaYBMY_.js";import{a as r,c as i,i as a,l as o,r as s}from"./shared-CL29HWIp.js";import{t as c}from"./lane-BzDhdR3X.js";var l=20,u=class extends o{caption=``;acts=[];keyframe=!1;step(e){this.settle(!1),this.keyframe=!!e.isKeyframe,super.step(e)}phase(e,t,n){this.settle(!0),super.phase(e,t,n),this.caption=t,this.acts=[]}do(...e){super.do(...e),this.acts.push(...e)}finish(){return this.settle(!1),super.finish()}settle(n){if(!this.caption)return;let r=n?140:this.keyframe?t:320,i=e({phases:[{label:``,caption:``,actions:this.acts}]}).phases[0],a=Math.max(0,...i.actions.map(e=>e.start+e.duration)),o=l*[...this.caption].length-r-a;this.caption=``,o>0&&a+o>i.end&&super.do({type:`wait`,ms:Math.ceil(o)})}},d=`{{4,2,3},{3},{2,3,4,1},{2,3},{2,3,4,1,5}}`,f=d.slice(2,-2).split(`},{`).map(e=>e.split(`,`).map(Number)),p=f.length,m=f.map((e,t)=>t).sort((e,t)=>f[e].length-f[t].length),h=m.map(e=>f[e]),g=[3,2,4,1,5],_=[4,2,3,1,5],v=e=>`{${e.join(`,`)}}`,y=e=>`[${e.join(`, `)}]`,b={python:`def solution(s):
    groups = [list(map(int, g.split(','))) for g in s[2:-2].split('},{')]
    groups.sort(key=len)             # 원소 개수가 적은 집합부터 길이순 정렬
    seen = set()
    answer = []
    for g in groups:
        for x in g:
            if x not in seen:        # 해시 집합으로 O(1)에 새 원소 확인
                seen.add(x)
                answer.append(x)
                break
    return answer`,javascript:`function solution(s) {
  const groups = s.slice(2, -2).split('},{').map((g) => g.split(',').map(Number));
  groups.sort((a, b) => a.length - b.length); // 원소 개수가 적은 집합부터 길이순 정렬
  const seen = new Set();
  const answer = [];
  for (const g of groups) {
    for (const x of g) {
      if (!seen.has(x)) { // 해시 집합으로 O(1)에 새 원소 확인
        seen.add(x);
        answer.push(x);
        break;
      }
    }
  }
  return answer;
}`},x={parse:a(b,[`groups = [list(map(int, g.split(',')))`],[`const groups = s.slice(2, -2).split('},{')`]),sort:a(b,[`groups.sort(key=len)`,`seen = set()`,`answer = []`],[`groups.sort((a, b) => a.length - b.length)`,`const seen = new Set()`,`const answer = []`]),scan:a(b,[`for g in groups:`,`for x in g:`,`if x not in seen:`],[`for (const g of groups)`,`for (const x of g)`,`if (!seen.has(x))`]),add:a(b,[`seen.add(x)`,`answer.append(x)`,`break`],[`seen.add(x)`,`answer.push(x)`,`break`]),done:a(b,[`return answer`],[`return answer`])},S={python:`def solution(s):
    groups = [list(map(int, g.split(','))) for g in s[2:-2].split('},{')]
    groups.sort(key=len)
    answer = []
    for g in groups:
        for x in g:
            # Set 없이 매번 answer 배열을 처음부터 끝까지 훑어 중복을 확인한다
            if x not in answer:
                answer.append(x)
    return answer`,javascript:`function solution(s) {
  const groups = s.slice(2, -2).split('},{').map((g) => g.split(',').map(Number));
  groups.sort((a, b) => a.length - b.length);
  const answer = [];
  for (const g of groups) {
    for (const x of g) {
      // Set 없이 매번 answer 배열을 처음부터 끝까지 훑어 중복을 확인합니다
      if (!answer.includes(x)) {
        answer.push(x);
      }
    }
  }
  return answer;
}`},C={parse:a(S,[`groups = [list(map(int, g.split(',')))`],[`const groups = s.slice(2, -2).split('},{')`]),sort:a(S,[`groups.sort(key=len)`,`answer = []`],[`groups.sort((a, b) => a.length - b.length)`,`const answer = []`]),scan:a(S,[`for g in groups:`,`for x in g:`,`if x not in answer:`],[`for (const g of groups)`,`for (const x of g)`,`if (!answer.includes(x))`]),add:a(S,[`answer.append(x)`],[`answer.push(x)`]),done:a(S,[`return answer`],[`return answer`])},w={python:`def solution(s):
    groups = [list(map(int, g.split(','))) for g in s[2:-2].split('},{')]
    # 함정: 집합들을 길이순으로 정렬하지 않고 문자열에 적힌 순서대로 본다
    answer = []
    for g in groups:
        for x in g:
            if x not in answer:
                answer.append(x)
    return answer`,javascript:`function solution(s) {
  const groups = s.slice(2, -2).split('},{').map((g) => g.split(',').map(Number));
  // 함정: 집합들을 길이순으로 정렬하지 않고 문자열에 적힌 순서대로 봅니다
  const answer = [];
  for (const g of groups) {
    for (const x of g) {
      if (!answer.includes(x)) answer.push(x);
    }
  }
  return answer;
}`},T={parse:a(w,[`groups = [list(map(int, g.split(',')))`],[`const groups = s.slice(2, -2).split('},{')`]),scan:a(w,[`for g in groups:`,`for x in g:`,`if x not in answer:`],[`for (const g of groups)`,`for (const x of g)`,`if (!answer.includes(x))`]),add:a(w,[`answer.append(x)`],[`answer.push(x)`]),done:a(w,[`return answer`],[`return answer`])},E=620,D=236,O=n({x:76,y:36,w:100,h:52,gap:6}),k={id:`tup`,x:76,y:120,slotW:62,slotH:40,gap:8,max:p},A=e=>`g:${e}`,j=e=>A(m[e]),M={x:76,y:184,w:230,h:32},N={x:318,y:184,w:230,h:32},P=e=>({type:`wait`,ms:e}),F=(...e)=>i([{type:`unfocus`},{type:`clearMarks`},...e]),I=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function L(){let e=[{id:`lab:grp`,kind:`text`,rect:{x:6,y:36,w:64,h:52},text:`집합들`},{id:`lab:tup`,kind:`text`,rect:{x:6,y:120,w:64,h:40},text:`튜플`},{id:`tup:bg`,kind:`zone`,rect:{x:70,y:114,w:p*70+4,h:52}},{id:`lab:ans`,kind:`text`,rect:{x:6,y:184,w:64,h:32},text:`결과`},{id:`tok:ans`,kind:`token`,rect:M,tone:`plain`,text:`추출 전`}];return f.forEach((t,n)=>e.push({id:A(n),kind:`cell`,rect:O(n),tone:`plain`,text:v(t),sub:`길이 ${t.length}`})),{width:E,height:D,items:e}}function R(){let e=new u(L()),t=new c(e,k),n=[],r=0,a=(e=`-`,t=`-`)=>({work:r,variables:{group:e,added:t,answer:y(n)}});e.step({title:`문자열에서 집합 ${p}개 파싱`,codeHighlights:x.parse,...a()}),e.phase(`파싱하기`,`바깥 중괄호를 떼고 "},{"로 나누어 ${p}개의 집합으로 분리합니다.`,x.parse),e.do(...i(f.map((e,t)=>I(A(t),`chosen`))),P(200)),e.step({title:`집합을 원소 개수(길이) 오름차순으로 정렬`,codeHighlights:x.sort,...a()}),e.phase(`정렬하기`,`길이가 1인 집합부터 차례로 오도록 길이순으로 정렬합니다. 길이가 k인 집합에는 k번째 원소가 새로 추가되어 있습니다.`,x.sort),e.do(...i(m.map((e,t)=>({type:`set`,id:A(e),patch:{rect:O(t),tone:`plain`}}))),P(250));let o=new Set;return h.forEach((c,l)=>{let u=0;for(let e of c)if(r++,!o.has(e)){o.add(e),n.push(e),u=e;break}e.step({title:`길이 ${c.length} 집합 ${v(c)}: 새 원소 ${u} 추가`,codeHighlights:x.add,...a(v(c),u)}),e.phase(`새 원소 찾기`,`${v(c)}의 원소를 Set에서 조회해 아직 없던 원소 ${s(u,`을`,`를`)} 바로 찾습니다.`,x.scan),e.do(...i([{type:`focus`,ids:[j(l)]},I(j(l),`current`)]),P(180)),e.phase(`튜플에 넣기`,`${s(u,`을`,`를`)} 튜플의 ${l+1}번째 원소로 확정하고 break로 넘어갑니다.`,x.add),e.do(...F(I(j(l),`visited`))),t.push({id:`t:${l}`,text:String(u),tone:`chosen`},j(l)),e.do({type:`set`,id:`tok:ans`,patch:{text:y(n),tone:`chosen`},pop:!0})}),e.step({title:`튜플 완성: ${y(g)}`,codeHighlights:x.done,...a(`완료`,`-`),answer:g,isKeyframe:!0}),e.phase(`정답`,`길이 1부터 ${p}까지 새 원소를 하나씩 뽑아 원본 튜플 ${y(g)}를 복원했습니다.`,x.done),e.do(...i([...t.ids.map(e=>I(e,`path`)),{type:`set`,id:`tok:ans`,patch:{text:`정답 ${y(g)}`,tone:`path`},pop:!0}])),e.finish()}function z(){let e=new u(L()),t=new c(e,k),n=[],r=0,a=(e=`-`,t=`-`)=>({work:r,variables:{group:e,added:t,answer:y(n)}});return e.step({title:`문자열에서 집합 ${p}개 파싱`,codeHighlights:C.parse,...a()}),e.phase(`파싱하기`,`문자열을 파싱해 ${p}개의 집합으로 분리합니다.`,C.parse),e.do(...i(f.map((e,t)=>I(A(t),`chosen`))),P(200)),e.step({title:`집합을 길이순으로 정렬`,codeHighlights:C.sort,...a()}),e.phase(`정렬하기`,`원소 개수가 적은 집합부터 오름차순으로 정렬합니다.`,C.sort),e.do(...i(m.map((e,t)=>({type:`set`,id:A(e),patch:{rect:O(t),tone:`plain`}}))),P(250)),h.forEach((o,c)=>{let l=0,u=0;for(let e of o){let t=n.indexOf(e),i=t>=0?t+1:Math.max(1,n.length);r+=i,u+=i,t<0&&(n.push(e),l=e)}e.step({title:`길이 ${o.length} 집합 ${v(o)}: 배열 스캔 ${u}회 → ${l} 추가`,codeHighlights:C.add,...a(v(o),l)}),e.phase(`배열 처음부터 비교`,`Set 없이 ${v(o)}의 모든 원소마다 answer 배열을 처음부터 훑어 중복을 확인하느라 ${u}번 비교했습니다.`,C.scan),e.do(...i([{type:`focus`,ids:[j(c),...t.ids]},I(j(c),`current`)]),P(200)),e.phase(`튜플에 넣기`,`중복이 아닌 ${s(l,`을`,`를`)} answer 끝에 넣습니다.`,C.add),e.do(...F(I(j(c),`visited`))),t.push({id:`t:${c}`,text:String(l),tone:`chosen`},j(c)),e.do({type:`set`,id:`tok:ans`,patch:{text:y(n),tone:`chosen`},pop:!0})}),e.step({title:`튜플 완성: ${y(g)} (비교 ${r}회)`,codeHighlights:C.done,...a(`완료`,`-`),answer:g,isKeyframe:!0}),e.phase(`정답`,`답은 ${y(g)}로 같지만, 매번 answer 배열을 선형 탐색하고 break도 하지 않아 ${r}번 비교했습니다(정석은 12번).`,C.done),e.do(...i([...t.ids.map(e=>I(e,`path`)),{type:`set`,id:`tok:ans`,patch:{text:`정답 ${y(g)}`,tone:`path`},pop:!0}])),e.finish()}function B(){let e=new u(L()),t=new c(e,k),n=[],a=0,o=(e=`-`,t=`-`)=>({work:a,variables:{group:e,added:t,answer:y(n)}});return e.step({title:`집합 파싱 후 정렬 없이 그대로 진행`,codeHighlights:T.parse,...o()}),e.phase(`정렬 생략`,`집합들의 순서가 뒤섞여 있다는 점을 잊고, 길이순 정렬 없이 첫 번째 집합 {4,2,3}부터 차례로 훑습니다.`,T.parse),e.do(...i(f.map((e,t)=>I(A(t),`chosen`))),P(200)),f.forEach((r,s)=>{let c=[];for(let e of r)a++,n.includes(e)||(n.push(e),c.push(e));let l=c.length?c.join(`, `):`없음`;e.step({title:`${s+1}번째 집합 ${v(r)}: [${l}] 추가`,codeHighlights:c.length?T.add:T.scan,...o(v(r),l)}),e.phase(`그대로 훑기`,s===0?`첫 집합이 길이 3인 ${v(r)}인데 그대로 넣어서 4, 2, 3 순서로 한꺼번에 들어가 버립니다!`:`${v(r)}에서 아직 안 나온 원소 [${l}]를 확인합니다.`,T.scan),e.do(...i([{type:`focus`,ids:[A(s)]},I(A(s),s===0?`bad`:`current`)]),P(200)),e.phase(`기록하기`,c.length?`[${l}]를 결과 배열에 추가해 ${y(n)}가 됩니다.`:`모든 원소가 이미 들어 있어 넘어갑니다.`,c.length?T.add:T.scan),e.do(...F(I(A(s),s===0?`bad`:`visited`)));for(let e of c)t.push({id:`t:${t.ids.length}`,text:String(e),tone:s===0?`bad`:`chosen`},A(s));e.do({type:`set`,id:`tok:ans`,patch:{text:y(n),tone:`bad`},pop:!0})}),e.step({title:`이 방법 ${y(_)}, 정답은 ${y(g)}`,codeHighlights:T.done,...o(`완료`,`-`),answer:_,isKeyframe:!0}),e.phase(`오답 확인`,`집합을 길이순으로 정렬하지 않으면 첫 집합 {4,2,3}의 순서에 끌려가 ${y(_)}가 나옵니다. 진짜 첫 원소는 {3}에 있던 ${r(3)}, 정답은 ${y(g)}입니다.`,T.done),e.do(...i([...t.ids.map(e=>I(e,`bad`)),{type:`set`,id:`tok:ans`,patch:{text:`이 방법 ${y(_)}`,tone:`bad`},pop:!0},{type:`add`,item:{id:`tok:truth`,kind:`token`,rect:N,tone:`good`,text:`정답 ${y(g)}`}}])),e.finish()}var V={id:`tuple`,title:`튜플`,level:2,category:`sort`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/64065`,description:{summary:`중복되는 원소가 없는 튜플 (a1, a2, ..., an)을 집합 기호 "{{a1}, {a1, a2}, ...}" 형태로 표현한 문자열 s가 주어집니다. 집합들의 순서와 각 집합 내부 원소의 순서는 뒤바뀔 수 있을 때, s가 표현하는 원래 튜플을 배열에 담아 반환합니다.`,rules:[`s의 길이는 5 이상 1,000,000 이하`,`s는 숫자와 "{", "}", ","로만 이루어져 있음`,`숫자가 0으로 시작하는 경우는 없으며, 원소는 1 이상 100,000 이하의 자연수`,`중복되는 원소가 없는 올바른 튜플만 입력으로 주어지며, 반환 배열 길이는 1 이상 500 이하`],examples:[{input:`s = "{{2},{2,1},{2,1,3},{2,1,3,4}}"`,output:`[2, 1, 3, 4]`},{input:`s = "{{1,2,3},{2,1},{1,2,4,3},{2}}"`,output:`[2, 1, 3, 4]`},{input:`s = "{{20,111},{111}}"`,output:`[111, 20]`},{input:`s = "{{123}}"`,output:`[123]`},{input:`s = "{{4,2,3},{3},{2,3,4,1},{2,3}}"`,output:`[3, 2, 4, 1]`}]},keyIntuitions:[`원소 개수가 1개인 집합에는 튜플의 첫 번째 원소만 들어 있고, 원소 개수가 k개인 집합에는 직전(k - 1개) 집합에 없던 k번째 원소가 딱 하나 새로 추가됩니다.`,`따라서 집합들을 원소 개수(길이) 오름차순으로 정렬한 뒤, 앞에서부터 처음 등장하는 원소를 하나씩 챙기면 원래 튜플 순서가 복원됩니다.`,`새 원소인지 확인할 때 해시 집합(Set)을 쓰면 각 원소를 O(1)에 조회할 수 있습니다.`],demo:{input:[d],label:`s = "{{4,2,3},{3},{2,3,4,1},{2,3},{2,3,4,1,5}}"`},workUnit:`원소를 확인·비교한 횟수`,approaches:[{id:`tuple-length-set`,name:`길이순 정렬 + 해시 집합(Set)으로 새 원소 찾기`,rank:`BEST`,timeComplexity:`O(N²)`,spaceComplexity:`O(N²)`,verdict:`집합들을 길이 오름차순으로 정렬한 뒤, 해시 집합(Set)으로 이전에 없던 새 원소를 O(1)에 찾아내는 정석 풀이입니다.`,pros:[`길이순 정렬 한 번으로 튜플의 각 자리 원소가 어떤 집합에서 나오는지 바로 정해집니다.`,`Set 조회는 O(1)이고 새 원소를 찾자마자 break하므로 원소 확인 횟수가 최소입니다.`],cons:[`바깥 중괄호 두 겹("{{", "}}")을 먼저 벗겨 내는 문자열 파싱 실수를 주의해야 합니다.`],whyThisRank:`집합의 길이 총합이 O(N²)이므로 모든 원소를 한 번씩 읽는 것만으로 하한에 도달하며, Set을 써서 중복 검사 비용을 O(1)로 줄입니다.`,code:b,visualize:R},{id:`tuple-length-list-scan`,name:`길이순 정렬 + 배열 선형 탐색으로 중복 확인`,rank:`ALTERNATIVE`,timeComplexity:`O(N³)`,spaceComplexity:`O(N²)`,verdict:`길이순 정렬은 같지만, Set 대신 결과 배열을 매번 처음부터 끝까지 훑어(in / includes) 중복을 검사하는 느린 풀이입니다.`,pros:[`별도의 Set 자료구조 없이 결과 배열 하나만으로 구현할 수 있습니다.`,`정석과 똑같은 정답을 냅니다.`],cons:[`집합이N개일 때 원소 총합 O(N²)개마다 길이 O(N)인 answer 배열을 처음부터 훑어 전체 시간이 O(N³)으로 늘어납니다.`],whyThisRank:`정렬 아이디어는 맞지만, O(1) 해시 집합 대신 O(N) 배열 탐색을 반복해 원소 비교 횟수가 불필요하게 커집니다.`,code:S,visualize:z},{id:`tuple-no-sort-trap`,name:`길이순 정렬 없이 등장 순서대로 중복 제거`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N³)`,spaceComplexity:`O(N²)`,verdict:`집합들이 이미 짧은 순서대로 주어졌다고 착각해, 길이순 정렬을 빼먹고 앞에서부터 중복을 제거하는 함정입니다.`,pros:[`첫 번째 예제 "{{2},{2,1},{2,1,3},{2,1,3,4}}"는 우연히 길이순으로 적혀 있어 통과합니다.`],cons:[`집합 순서가 섞여 있는 예제("{{4,2,3},{3},...}")에서는 첫 집합의 원소 순서대로 들어가 오답을 냅니다.`],whyThisRank:`문제에서 집합들의 순서가 바뀔 수 있다고 명시했으므로, 길이순 정렬 없이는 튜플의 몇 번째 원소인지 알 수 없습니다.`,code:w,visualize:B}],checks:{cases:[{args:[`{{2},{2,1},{2,1,3},{2,1,3,4}}`],expected:[2,1,3,4]},{args:[`{{1,2,3},{2,1},{1,2,4,3},{2}}`],expected:[2,1,3,4]},{args:[`{{20,111},{111}}`],expected:[111,20]},{args:[`{{123}}`],expected:[123]},{args:[`{{4,2,3},{3},{2,3,4,1},{2,3}}`],expected:[3,2,4,1]},{args:[d],expected:g}],random:e=>{let t=1+Math.floor(e()*6),n=[];for(;n.length<t;){let t=1+Math.floor(e()*50);n.includes(t)||n.push(t)}let r=n.map((t,r)=>{let i=n.slice(0,r+1);for(let t=i.length-1;t>0;t--){let n=Math.floor(e()*(t+1));[i[t],i[n]]=[i[n],i[t]]}return i.join(`,`)});for(let t=r.length-1;t>0;t--){let n=Math.floor(e()*(t+1));[r[t],r[n]]=[r[n],r[t]]}return[`{{${r.join(`},{`)}}}`]}}};export{V as default};