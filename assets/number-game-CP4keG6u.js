import{a as e,i as t,r as n,s as r}from"./shared-e6uNbDLo.js";import{t as i}from"./paced-DMEp_Mu1.js";var a=[7,3,10,5,8,4,9,6],o=[9,4,11,2,7,10,5,8],s=a.length,c=e=>e.map((e,t)=>t).sort((t,n)=>e[t]-e[n]||t-n),l=c(a),u=c(o),d=l.map(e=>a[e]),f=u.map(e=>o[e]),p=(()=>{let[e,t]=[0,0];for(let n of f)n>d[e]&&([e,t]=[e+1,t+1]);return t})(),m={python:`def solution(A, B):
    A.sort()                           # 약한 A부터
    B.sort()                           # 약한 B부터
    answer = 0
    a = 0                              # 아직 못 이긴 가장 약한 A
    for b in B:                        # B를 약한 순서로 낸다
        if b > A[a]:                   # 가장 약한 A를 이길 수 있으면 이긴다
            answer += 1
            a += 1
    return answer`,javascript:`function solution(A, B) {
  A.sort((x, y) => x - y); // 약한 A부터
  B.sort((x, y) => x - y); // 약한 B부터
  let answer = 0;
  let a = 0; // 아직 못 이긴 가장 약한 A
  for (const b of B) { // B를 약한 순서로 낸다
    if (b > A[a]) { // 가장 약한 A를 이길 수 있으면 이긴다
      answer++;
      a++;
    }
  }
  return answer;
}`},h={sort:t(m,[`A.sort()`,`B.sort()`],[`A.sort(`,`B.sort(`]),init:t(m,[`answer = 0`,`a = 0`],[`let answer = 0`,`let a = 0`]),look:t(m,[`for b in B`,`if b > A[a]`],[`for (const b of B)`,`if (b > A[a])`]),win:t(m,[`answer += 1`,`a += 1`],[`answer++`,`a++`]),done:t(m,[`for b in B`,`return answer`],[`for (const b of B)`,`return answer`])},g={python:`def solution(A, B):
    A.sort()                           # 약한 A부터
    B.sort()
    used = [False] * len(B)            # 이미 낸 B
    answer = 0
    for a in A:
        for i in range(len(B)):        # 약한 B부터 훑으며 a를 이길 수 있는 첫 B를 찾는다
            if not used[i] and B[i] > a:
                used[i] = True
                answer += 1
                break
    return answer`,javascript:`function solution(A, B) {
  A.sort((x, y) => x - y); // 약한 A부터
  B.sort((x, y) => x - y);
  const used = new Array(B.length).fill(false); // 이미 낸 B
  let answer = 0;
  for (const a of A) {
    for (let i = 0; i < B.length; i++) { // 약한 B부터 훑으며 a를 이길 수 있는 첫 B를 찾는다
      if (!used[i] && B[i] > a) {
        used[i] = true;
        answer++;
        break;
      }
    }
  }
  return answer;
}`},_={sort:t(g,[`A.sort()`,`B.sort()`],[`A.sort(`,`B.sort(`]),init:t(g,[`used = [False] * len(B)`,`answer = 0`],[`const used = new Array(B.length)`,`let answer = 0`]),look:t(g,[`for a in A`,`for i in range(len(B))`,`if not used[i] and B[i] > a`],[`for (const a of A)`,`for (let i = 0; i < B.length; i++)`,`if (!used[i] && B[i] > a)`]),win:t(g,[`used[i] = True`,`answer += 1`,`break`],[`used[i] = true`,`answer++`,`break`]),done:t(g,[`for a in A`,`return answer`],[`for (const a of A)`,`return answer`])},v={python:`def solution(A, B):
    A.sort()
    B.sort()
    answer = 0
    for i in range(len(A)):            # 같은 순위끼리 겨룬다 (i번째로 약한 B와 A)
        if B[i] > A[i]:
            answer += 1
    return answer  # A = [2, 10], B = [1, 5]는 0점 (정답은 1점)`,javascript:`function solution(A, B) {
  A.sort((x, y) => x - y);
  B.sort((x, y) => x - y);
  let answer = 0;
  for (let i = 0; i < A.length; i++) { // 같은 순위끼리 겨룬다 (i번째로 약한 B와 A)
    if (B[i] > A[i]) answer++;
  }
  return answer; // A = [2, 10], B = [1, 5]는 0점 (정답은 1점)
}`},y={sort:t(v,[`A.sort()`,`B.sort()`],[`A.sort(`,`B.sort(`]),init:t(v,[`answer = 0`],[`let answer = 0`]),look:t(v,[`for i in range(len(A))`,`if B[i] > A[i]`],[`for (let i = 0; i < A.length; i++)`,`if (B[i] > A[i])`]),win:t(v,[`answer += 1`],[`answer++`]),done:t(v,[`for i in range(len(A))`,`return answer`],[`for (let i = 0; i < A.length; i++)`,`return answer`])},b=70,x=56,S=50,C=40,w=136,T=e=>b+e*x,E=(e,t)=>({x:T(t),y:e===`a`?C:w,w:S,h:48}),D=(e,t)=>({x:T(Math.min(t,s))+7,y:e===`a`?0:192,w:36,h:e===`a`?18:20}),O=e=>`a:${e}`,k=e=>`b:${e}`,A=e=>O(l[e]),j=e=>k(u[e]),M={x:b,y:226,w:120,h:28},N={x:200,y:226,w:140,h:28},P=e=>({type:`wait`,ms:e}),F=(...e)=>r([{type:`unfocus`},{type:`clearMarks`},...e]),I=(e,t)=>e.map(e=>({type:`set`,id:e,patch:{tone:t}})),L=(e,t=`chosen`,n=`승점 ${e}`)=>({type:`set`,id:`tok:score`,patch:{text:n,tone:t},pop:!0}),R=(e,t,n,r)=>{let i=`ptr:${t}`;return e.has(i)?{type:`set`,id:i,patch:{rect:D(t,n)}}:{type:`add`,item:{id:i,kind:`token`,rect:D(t,n),tone:`chosen`,text:r}}};function z(){let e=[{id:`lab:a`,kind:`text`,rect:{x:0,y:C,w:64,h:48},text:`A팀`},{id:`lab:b`,kind:`text`,rect:{x:0,y:w,w:64,h:48},text:`B팀`},{id:`tok:score`,kind:`token`,rect:M,tone:`plain`,text:`승점 0`}];return a.forEach((t,n)=>e.push({id:O(n),kind:`cell`,rect:E(`a`,n),tone:`plain`,text:String(t)})),o.forEach((t,n)=>e.push({id:k(n),kind:`cell`,rect:E(`b`,n),tone:`plain`,text:String(t)})),{width:b+s*x+60,height:262,items:e}}function B(e,t,n){e.step({title:`두 팀을 약한 순서로 정렬하기`,codeHighlights:t,...n}),e.phase(`정렬하기`,`두 팀의 숫자를 약한 순서로 정렬합니다. 왼쪽일수록 약합니다.`),e.do(...r([...l.map((e,t)=>({type:`set`,id:O(e),patch:{rect:E(`a`,t)}})),...u.map((e,t)=>({type:`set`,id:k(e),patch:{rect:E(`b`,t)}}))]),P(600))}function V(){let e=new i(z()),[t,a,o]=[0,0,0],c=0,l=()=>({work:o,variables:{b:c||`-`,a:t,answer:a}});return B(e,h.sort,l()),e.step({title:`answer = 0, a = 0`,codeHighlights:h.init,...l()}),e.phase(`시작`,`가장 약한 B부터 내면서, 아직 못 이긴 가장 약한 A와 겨룹니다. 이길 때만 다음 A로 넘어갑니다.`),e.do(...r([R(e,`a`,0,`a`),R(e,`b`,0,`b`),L(0)])),f.forEach((i,s)=>{let[u,f]=[t,d[t]],p=i>f;c=i,o++,p&&(a++,t++),e.step({title:`B ${i} vs A ${f}: ${p?`이김`:`짐`}`,codeHighlights:p?h.win:h.look,...l()}),e.phase(`겨루기`,`B의 ${n(i,`이`,`가`)} 아직 못 이긴 가장 약한 A의 ${n(f,`과`,`와`)} 겨룹니다.`,h.look),e.do(...r([{type:`focus`,ids:[j(s),A(u)]},...I([j(s),A(u)],`current`)])),e.do({type:`arrow`,from:j(s),to:A(u),verdict:p?`good`:`bad`,label:p?`${i} > ${f} 승`:`${i} ≤ ${f} 패`},P(450)),p?(e.phase(`정하기`,`${i} > ${n(f,`이라`,`라`)} 이겼습니다. 이긴 A는 더 보지 않고 다음으로 약한 A로 넘어갑니다. 승점 ${a}점.`,h.win),e.do(...F(...I([j(s),A(u)],`visited`),R(e,`a`,t,`a`),R(e,`b`,s+1,`b`),L(a)))):(e.phase(`정하기`,`${i} ≤ ${n(f,`이라`,`라`)} 가장 약한 A도 못 이깁니다. ${n(i,`은`,`는`)} 쓸모가 없으니 다음 B로 넘어갑니다.`,h.look),e.do(...F(...I([j(s)],`explored`),...I([A(u)],`plain`),R(e,`b`,s+1,`b`))))}),c=0,e.step({title:`승점 ${a}`,codeHighlights:h.done,...l(),answer:a,isKeyframe:!0}),e.phase(`정답`,`B를 모두 냈습니다. 이길 수 있는 가장 약한 A만 골라 이기고, 못 이기는 B는 버렸으니 승점은 ${a}점입니다.`),e.do(...r([...I([...Array(s).keys()].flatMap(e=>[A(e),j(e)]).filter(t=>e.get(t).tone===`visited`),`path`),L(a,`path`)])),e.finish()}function H(){let t=new i(z()),a=Array(s).fill(!1),[o,c]=[0,0],l=0,u=()=>({work:c,variables:{a:l||`-`,answer:o}});return B(t,_.sort,u()),t.step({title:`used = 전부 False, answer = 0`,codeHighlights:_.init,...u()}),t.phase(`시작`,`약한 A부터 하나씩 보며, 약한 B부터 훑어 그 A를 이길 수 있고 아직 내지 않은 첫 B를 찾습니다.`),t.do(L(0)),d.forEach((i,d)=>{let p=[],m;for(let e=0;e<s&&m===void 0;e++)p.push(e),!a[e]&&f[e]>i&&(m=e);c+=p.length,l=i,m!==void 0&&(a[m]=!0,o++);let h=e=>e===m?{verdict:`good`,label:`승`}:a[e]&&f[e]>i?{verdict:`seen`,label:`사용됨`}:{verdict:`bad`,label:`패`};t.step({title:m===void 0?`A ${i}: 이길 B가 없음`:`A ${i}: B ${e(f[m])} 이김`,codeHighlights:m===void 0?_.look:_.win,...u()}),t.phase(`훑기`,m===void 0?`A의 ${n(i,`을`,`를`)} 이길 B를 약한 쪽부터 ${p.length}개 모두 확인했지만 없습니다.`:`A의 ${n(i,`을`,`를`)} 이길 B를 약한 쪽부터 ${p.length}개 확인해, B의 ${f[m]}에서 멈춥니다.`,_.look),t.do(...r([{type:`focus`,ids:[A(d),...p.map(j)]},...I([A(d)],`current`),R(t,`a`,d,`a`)])),t.do(...r(p.map(e=>({type:`arrow`,from:A(d),to:j(e),...h(e)}))),P(500)),m===void 0?(t.phase(`정하기`,`이길 B가 없으니 A의 ${n(i,`은`,`는`)} 그대로 둡니다. 승점은 ${o}점입니다.`,_.look),t.do(...F(...I([A(d)],`explored`)))):(t.phase(`정하기`,`A의 ${n(i,`을`,`를`)} B의 ${e(f[m])} 이깁니다. 이 B는 이제 쓰였습니다. 승점 ${o}점.`,_.win),t.do(...F(...I([A(d),j(m)],`visited`),L(o))))}),l=0,t.step({title:`승점 ${o}`,codeHighlights:_.done,...u(),answer:o,isKeyframe:!0}),t.phase(`정답`,`A를 모두 봤습니다. 정석과 같은 승점 ${o}점이지만 B 카드를 ${c}번 확인했습니다. 정석은 ${s}번이면 됩니다.`),t.do(...r([...I([...Array(s).keys()].flatMap(e=>[A(e),j(e)]).filter(e=>t.get(e).tone===`visited`),`path`),L(o,`path`)])),t.finish()}function U(){let e=new i(z()),[t,a]=[0,0],o=-1,s=()=>({work:a,variables:{i:o<0?`-`:o,answer:t}});return B(e,y.sort,s()),e.step({title:`answer = 0`,codeHighlights:y.init,...s()}),e.phase(`시작`,`i번째로 약한 B와 i번째로 약한 A를 겨루게 합니다. 순위가 같은 카드끼리만 겨룹니다.`),e.do(...r([R(e,`a`,0,`i`),R(e,`b`,0,`i`),L(0)])),f.forEach((i,c)=>{let l=d[c],u=i>l;o=c,a++,u&&t++,e.step({title:`${c+1}번째: B ${i} vs A ${l}: ${u?`이김`:`짐`}`,codeHighlights:u?y.win:y.look,...s()}),e.phase(`겨루기`,`${c+1}번째로 약한 B의 ${n(i,`이`,`가`)} ${c+1}번째로 약한 A의 ${n(l,`과`,`와`)} 겨룹니다.`,y.look),e.do(...r([{type:`focus`,ids:[j(c),A(c)]},...I([j(c),A(c)],`current`)])),e.do({type:`arrow`,from:j(c),to:A(c),verdict:u?`good`:`bad`,label:u?`${i} > ${l} 승`:`${i} ≤ ${l} 패`},P(450)),e.phase(`정하기`,u?`${i} > ${n(l,`이라`,`라`)} 이겼습니다. 승점 ${t}점.`:`${i} ≤ ${n(l,`이라`,`라`)} 졌습니다. 같은 순위끼리만 겨루니 다른 A는 보지 않습니다.`,u?y.win:y.look),e.do(...F(...I([j(c),A(c)],u?`visited`:`explored`),R(e,`a`,c+1,`i`),R(e,`b`,c+1,`i`),...u?[L(t)]:[]))}),o=-1,e.step({title:`이 방법 ${t}점, 정답은 ${p}점`,codeHighlights:y.done,...s(),answer:t,isKeyframe:!0}),e.phase(`오답 확인`,`같은 순위끼리만 겨루면 ${t}점이지만, B의 4와 5는 한 칸 아래 A의 3과 4를 이길 수 있어 정답은 ${p}점입니다.`),e.do(...r([L(t,`bad`,`이 방법 ${t}점`),{type:`add`,item:{id:`tok:truth`,kind:`token`,rect:N,tone:`good`,text:`정답 ${p}점`}}])),e.finish()}var W={id:`number-game`,title:`숫자 게임`,level:3,category:`greedy`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/12987`,description:{summary:`A팀과 B팀이 N명씩 있고, 모든 사원은 자연수 하나를 받습니다. 사원들은 상대 팀 사원과 한 번씩 일대일로 겨루고, 숫자가 큰 쪽이 1점을 얻으며 같으면 아무도 점수를 얻지 못합니다. A팀의 출전 순서가 먼저 공개되고, B팀은 그 순서를 보고 자기 팀의 출전 순서를 정합니다. B팀이 얻을 수 있는 최대 승점을 구합니다.`,rules:[`A와 B의 길이는 같고, 1 이상 100,000 이하`,`A와 B의 원소는 1 이상 1,000,000,000 이하의 자연수`,`B팀은 A팀의 출전 순서를 보고 자기 출전 순서를 자유롭게 정할 수 있음`,`숫자가 같으면 승점 없음`],examples:[{input:`A = [5, 1, 3, 7], B = [2, 2, 6, 8]`,output:`3`},{input:`A = [2, 2, 2, 2], B = [1, 1, 1, 1]`,output:`0`}]},keyIntuitions:[`B팀이 순서를 마음대로 정할 수 있으니 A의 순서는 상관없고, 어떤 B가 어떤 A와 짝이 될지만 정하면 됩니다.`,`B의 숫자 하나는 이길 수 있는 A 중 가장 약한 것을 이기는 데 쓰는 것이 가장 알뜰합니다. 두 팀을 약한 순서로 정렬해, 약한 B부터 아직 못 이긴 가장 약한 A를 이기면 짝을 짓고, 못 이기면 그 B는 버립니다.`,`같은 순위끼리만 겨루게 하면 한 칸 아래 A를 이길 수 있는 B를 놓칩니다. 이 방법은 공식 예제를 통과해서 더 위험합니다.`],demo:{input:[a,o],label:`A = [7, 3, 10, 5, 8, 4, 9, 6], B = [9, 4, 11, 2, 7, 10, 5, 8]`},workUnit:`숫자를 비교한 횟수`,approaches:[{id:`number-game-two-pointers`,name:`정렬 + 약한 B부터 이기는 짝짓기`,rank:`BEST`,timeComplexity:`O(N log N)`,spaceComplexity:`O(1)`,verdict:`두 팀을 약한 순서로 정렬하고, 약한 B부터 아직 못 이긴 가장 약한 A를 이기면 짝을 짓는 풀이입니다.`,pros:[`정렬한 뒤에는 포인터 하나로 한 번만 훑으면 되어 O(N)입니다.`,`B 하나가 이길 수 있는 가장 약한 A만 쓰므로 B를 낭비하지 않습니다.`,`코드가 짧고 분기가 하나입니다.`],cons:[`"약한 B는 가장 약한 A만 노린다"는 생각을 떠올려야 합니다.`,`숫자가 같으면 이기지 못하므로 비교에 등호를 넣으면 안 됩니다.`],whyThisRank:`이길 수 있는 B는 어떤 A든 이길 수 있는 것 중 가장 약한 A를 상대하는 것이 최선입니다. 그래야 더 강한 A를 이길 강한 B가 남기 때문입니다. 약한 B부터 가장 약한 A를 노리는 한 번의 훑기로 최대 승점이 나옵니다.`,code:m,visualize:V},{id:`number-game-scan`,name:`A마다 이길 B를 훑어 찾기`,rank:`ALTERNATIVE`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`약한 A부터 하나씩 보며, 약한 B부터 훑어 그 A를 이길 수 있고 아직 내지 않은 첫 B를 찾는 맞지만 느린 풀이입니다.`,pros:[`"이길 수 있는 가장 약한 B를 쓴다"는 생각이 그대로 코드가 됩니다.`,`정석과 같은 답을 냅니다.`],cons:[`A마다 B를 처음부터 훑어 N이 10만이면 최대 약 100억 번입니다.`,`이미 낸 B를 표시할 used 배열이 따로 필요합니다.`],whyThisRank:`이길 B를 찾는 생각은 정석과 같지만, 매번 B를 처음부터 훑으면서 이미 쓴 B와 못 이기는 B도 다시 봅니다. 포인터를 앞으로만 움직이면 그 훑기가 사라집니다.`,code:g,visualize:H},{id:`number-game-same-rank`,name:`정렬 후 같은 순위끼리 비교`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N log N)`,spaceComplexity:`O(1)`,verdict:`두 팀을 정렬해 i번째로 약한 B와 i번째로 약한 A를 겨루게 하는 풀이로, 한 칸 아래 A를 이길 수 있는 B를 놓칩니다.`,pros:[`코드가 가장 짧고, 공식 예제 두 개는 우연히 통과합니다.`],cons:[`B의 숫자가 같은 순위 A보다 작아도 더 약한 A는 이길 수 있는데, 그 짝짓기를 보지 않습니다.`,`A = [2, 10], B = [1, 5]이면 정답은 1점인데 0점이 나옵니다.`],whyThisRank:`순서를 마음대로 정할 수 있다는 점을 쓰지 않고 같은 순위로 고정해 버립니다. B가 이길 수 있는 A는 같은 순위 A만이 아니라 더 약한 A 전부입니다.`,code:v,visualize:U}],checks:{cases:[{args:[[5,1,3,7],[2,2,6,8]],expected:3},{args:[[2,2,2,2],[1,1,1,1]],expected:0},{args:[[1],[1]],expected:0},{args:[[1],[2]],expected:1},{args:[[2,10],[1,5]],expected:1},{args:[[1,2,3],[2,3,4]],expected:3},{args:[[5,5,5],[5,5,5]],expected:0},{args:[[3,3,5],[4,4,4]],expected:2},{args:[a,o],expected:7}],random:e=>{let t=1+Math.floor(e()*8),n=()=>Array.from({length:t},()=>1+Math.floor(e()*10));return[n(),n()]}}};export{W as default};