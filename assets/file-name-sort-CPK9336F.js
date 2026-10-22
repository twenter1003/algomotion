import{n as e,t}from"./index-D3a9ZpZK.js";import{o as n}from"./layout-DFaYBMY_.js";import{c as r,i,l as a}from"./shared-CL29HWIp.js";var o=20,s=class extends a{caption=``;acts=[];keyframe=!1;step(e){this.settle(!1),this.keyframe=!!e.isKeyframe,super.step(e)}phase(e,t,n){this.settle(!0),super.phase(e,t,n),this.caption=t,this.acts=[]}do(...e){super.do(...e),this.acts.push(...e)}finish(){return this.settle(!1),super.finish()}settle(n){if(!this.caption)return;let r=n?140:this.keyframe?t:320,i=e({phases:[{label:``,caption:``,actions:this.acts}]}).phases[0],a=Math.max(0,...i.actions.map(e=>e.start+e.duration)),s=o*[...this.caption].length-r-a;this.caption=``,s>0&&a+s>i.end&&super.do({type:`wait`,ms:Math.ceil(s)})}},c=[`img12.png`,`img10.png`,`img02.png`,`img1.png`,`IMG01.GIF`,`img2.JPG`],l=c.length,u=c.map((e,t)=>{let n=e.match(/^([^\d]+)(\d{1,5})/);return{idx:t,file:e,head:n[1].toLowerCase(),numStr:n[2],num:Number(n[2])}}),d=[...u].sort((e,t)=>e.head.localeCompare(t.head)||e.num-t.num||e.idx-t.idx).map(e=>e.idx),f=d.map(e=>c[e]),p=[...u].sort((e,t)=>e.head.localeCompare(t.head)||(e.numStr<t.numStr?-1:e.numStr>t.numStr?1:e.idx-t.idx)).map(e=>e.idx),m=p.map(e=>c[e]),h={python:`import re

def solution(files):
    def sort_key(file):
        m = re.match(r'([^\\d]+)(\\d{1,5})', file)
        head, number = m.group(1), m.group(2)
        return (head.lower(), int(number))   # 소문자 HEAD, 정수 NUMBER

    # Python의 sort/sorted는 안정 정렬이라 동률이면 입력 순서가 유지된다
    return sorted(files, key=sort_key)`,javascript:`function solution(files) {
  const parsed = files.map((file, idx) => {
    const [, head, number] = file.match(/^([^\\d]+)(\\d{1,5})/);
    return { file, head: head.toLowerCase(), num: Number(number), idx };
  });
  parsed.sort((a, b) => {
    if (a.head !== b.head) return a.head < b.head ? -1 : 1;
    if (a.num !== b.num) return a.num - b.num;
    return a.idx - b.idx; // 원래 입력 순서 유지
  });
  return parsed.map((p) => p.file);
}`},g={parse:i(h,[`def sort_key(file):`,`m = re.match`,`return (head.lower(), int(number))`],[`const parsed = files.map`,`const [, head, number] = file.match`,`return { file, head: head.toLowerCase()`]),sort:i(h,[`return sorted(files, key=sort_key)`],[`parsed.sort((a, b) => {`,`if (a.head !== b.head)`,`if (a.num !== b.num)`]),tie:i(h,[`return sorted(files, key=sort_key)`],[`return a.idx - b.idx;`]),done:i(h,[`return sorted(files, key=sort_key)`],[`return parsed.map((p) => p.file)`])},_={python:`def parse(file):
    i = 0
    while i < len(file) and not file[i].isdigit():
        i += 1
    j = i
    while j < len(file) and file[j].isdigit() and j - i < 5:
        j += 1
    return file[:i].lower(), int(file[i:j])

def solution(files):
    res = list(files)
    # 이웃한 두 파일을 비교할 때마다 매번 글자를 훑어 HEAD·NUMBER를 다시 뽑는다
    for i in range(len(res)):
        for j in range(len(res) - 1 - i):
            if parse(res[j]) > parse(res[j + 1]):
                res[j], res[j + 1] = res[j + 1], res[j]
    return res`,javascript:`function parse(file) {
  let i = 0;
  while (i < file.length && (file[i] < '0' || file[i] > '9')) i++;
  let j = i;
  while (j < file.length && file[j] >= '0' && file[j] <= '9' && j - i < 5) j++;
  return [file.slice(0, i).toLowerCase(), Number(file.slice(i, j))];
}

function solution(files) {
  const res = [...files];
  // 이웃한 두 파일을 비교할 때마다 매번 글자를 훑어 HEAD·NUMBER를 다시 뽑습니다
  for (let i = 0; i < res.length; i++) {
    for (let j = 0; j < res.length - 1 - i; j++) {
      const [ha, na] = parse(res[j]);
      const [hb, nb] = parse(res[j + 1]);
      if (ha > hb || (ha === hb && na > nb)) {
        [res[j], res[j + 1]] = [res[j + 1], res[j]];
      }
    }
  }
  return res;
}`},v={init:i(_,[`res = list(files)`],[`const res = [...files]`]),loop:i(_,[`for i in range(len(res)):`,`for j in range(len(res) - 1 - i):`,`if parse(res[j]) > parse(res[j + 1]):`],[`for (let i = 0; i < res.length; i++)`,`for (let j = 0; j < res.length - 1 - i; j++)`,`const [ha, na] = parse(res[j])`]),swap:i(_,[`res[j], res[j + 1] = res[j + 1], res[j]`],[`[res[j], res[j + 1]] = [res[j + 1], res[j]]`]),done:i(_,[`return res`],[`return res`])},y={python:`import re

def solution(files):
    def trap_key(file):
        m = re.match(r'([^\\d]+)(\\d{1,5})', file)
        # 함정: NUMBER에 int()를 씌우지 않고 문자열 그대로 비교한다
        return (m.group(1).lower(), m.group(2))

    return sorted(files, key=trap_key)`,javascript:`function solution(files) {
  const parsed = files.map((file, idx) => {
    const [, head, number] = file.match(/^([^\\d]+)(\\d{1,5})/);
    // 함정: NUMBER를 Number()로 바꾸지 않고 문자열 그대로 비교합니다
    return { file, head: head.toLowerCase(), numStr: number, idx };
  });
  parsed.sort((a, b) => {
    if (a.head !== b.head) return a.head < b.head ? -1 : 1;
    if (a.numStr !== b.numStr) return a.numStr < b.numStr ? -1 : 1;
    return a.idx - b.idx;
  });
  return parsed.map((p) => p.file);
}`},b={parse:i(y,[`def trap_key(file):`,`return (m.group(1).lower(), m.group(2))`],[`const parsed = files.map`,`return { file, head: head.toLowerCase(), numStr: number`]),sort:i(y,[`return sorted(files, key=trap_key)`],[`parsed.sort((a, b) => {`,`if (a.numStr !== b.numStr)`])},x=640,S=228,C=n({x:76,y:34,w:86,h:52,gap:6}),w=n({x:76,y:98,w:86,h:28,gap:6}),T=e=>`f:${e}`,E=e=>`k:${e}`,D={x:76,y:140,w:260,h:32},O={x:76,y:182,w:260,h:32},k={x:348,y:182,w:268,h:32},A=e=>({type:`wait`,ms:e}),j=(...e)=>r([{type:`unfocus`},{type:`clearMarks`},...e]),M=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function N(){let e=[{id:`lab:file`,kind:`text`,rect:{x:6,y:34,w:64,h:52},text:`파일명`},{id:`lab:key`,kind:`text`,rect:{x:6,y:98,w:64,h:28},tone:`muted`,text:`정렬 키`},{id:`lab:stat`,kind:`text`,rect:{x:6,y:140,w:64,h:32},tone:`muted`,text:`상태`},{id:`lab:ans`,kind:`text`,rect:{x:6,y:182,w:64,h:32},text:`결과`},{id:`tok:stat`,kind:`token`,rect:D,tone:`plain`,text:`파싱 대기`},{id:`tok:ans`,kind:`token`,rect:O,tone:`plain`,text:`정렬 전`}];return c.forEach((t,n)=>{e.push({id:T(n),kind:`cell`,rect:C(n),tone:`plain`,text:t}),e.push({id:E(n),kind:`token`,rect:w(n),tone:`muted`,text:`-`})}),{width:x,height:S,items:e}}function P(){let e=new s(N()),t=0,n=(e=`-`,n=`-`)=>({work:t,variables:{file:e,key:n,parsedCount:t}});for(let i=0;i<l;i++){let a=u[i];t++;let o=`("${a.head}", ${a.num})`;e.step({title:`${i+1}번째 파일 키 추출: ${a.file} → ${o}`,codeHighlights:g.parse,...n(a.file,o)}),e.phase(`추출하기`,`"${a.file}"에서 숫자 앞부분 HEAD "${a.head}"와 연속된 숫자 NUMBER ${a.num}(문자열 "${a.numStr}")을 뽑습니다.`,g.parse),e.do(...r([{type:`focus`,ids:[T(i),E(i)]},M(T(i),`current`),{type:`set`,id:E(i),patch:{text:`${a.head} | ${a.num}`,tone:`chosen`},pop:!0},{type:`set`,id:`tok:stat`,patch:{text:`${a.file} → (${a.head}, ${a.num})`,tone:`chosen`},pop:!0}]),A(180)),e.phase(`저장하기`,`${i+1}번째 파일의 정렬 키 ${o}와 원래 순서(${i})를 저장합니다.`,g.parse),e.do(...j(M(T(i),`visited`)))}return e.step({title:`HEAD 사전 순 → NUMBER 정수 순으로 정렬`,codeHighlights:g.sort,...n(`전체`,`비교`)}),e.phase(`정렬하기`,`모든 파일의 HEAD가 "img"로 같으므로 NUMBER 정수 값(1 = 1 < 2 = 2 < 10 < 12) 순서로 자리를 옮깁니다.`,g.sort),e.do(...r([...d.map((e,t)=>({type:`set`,id:T(e),patch:{rect:C(t),tone:`chosen`}})),...d.map((e,t)=>({type:`set`,id:E(e),patch:{rect:w(t),tone:`chosen`}})),{type:`set`,id:`tok:stat`,patch:{text:`NUMBER: 1, 1, 2, 2, 10, 12`,tone:`good`},pop:!0}]),A(250)),e.step({title:`동률 파일은 원래 입력 순서 유지 (안정 정렬)`,codeHighlights:g.tie,...n(`동률 확인`,`idx 유지`)}),e.phase(`동률 확인`,`"img1.png"와 "IMG01.GIF"는 둘 다 ("img", 1)이라 먼저 들어온 "img1.png"가 앞섭니다. "img02.png"와 "img2.JPG"도 마찬가지입니다.`,g.tie),e.do(...r([{type:`focus`,ids:[T(3),T(4),T(2),T(5)]},M(T(3),`good`),M(T(4),`good`),M(T(2),`good`),M(T(5),`good`)])),e.do({type:`arrow`,from:T(3),to:T(4),verdict:`good`,label:`동률 → 입력 순`},A(200)),e.step({title:`정렬 완료 (키 추출 ${t}회)`,codeHighlights:g.done,...n(`완료`,`완료`),answer:f,isKeyframe:!0}),e.phase(`정답`,`파일마다 딱 한 번씩만(총 ${t}회) HEAD·NUMBER를 추출해 안정 정렬로 올바른 순서를 구했습니다.`,g.done),e.do(...j(...d.map(e=>M(T(e),`path`)),{type:`set`,id:`tok:ans`,patch:{text:`img1 → IMG01 → img02 → img2…`,tone:`path`},pop:!0})),e.finish()}function F(){let e=new s(N()),t=0,n=[...Array(l).keys()],i=(e,n)=>({work:t,variables:{pass:e,swaps:n,parseCalls:t}});e.step({title:`키를 미리 뽑지 않고 인접 비교 시작`,codeHighlights:v.init,...i(`-`,`-`)}),e.phase(`초기화`,`정렬 키를 미리 저장하지 않고, 이웃한 두 파일을 비교할 때마다 글자를 처음부터 훑어 HEAD·NUMBER를 다시 파싱합니다.`,v.init),e.do({type:`set`,id:`tok:stat`,patch:{text:`매 비교마다 parse() 2번 호출`,tone:`chosen`},pop:!0});for(let a=0;a<l-1;a++){let o=0;for(let e=0;e<l-1-a;e++){t+=2;let r=u[n[e]],i=u[n[e+1]];(r.head>i.head||r.head===i.head&&r.num>i.num)&&([n[e],n[e+1]]=[n[e+1],n[e]],o++)}let s=u[n[l-1-a]];e.step({title:`${a+1}회전: 비교 ${l-1-a}쌍 (파싱 +${(l-1-a)*2}회, 교환 ${o}회)`,codeHighlights:o?v.swap:v.loop,...i(a+1,o)}),e.phase(`비교 및 재파싱`,`${a+1}회전에서 이웃 ${l-1-a}쌍을 비교하며 parse()를 ${(l-1-a)*2}번 호출했습니다(누적 ${t}회).`,v.loop),e.do(...r([...n.map((e,t)=>({type:`set`,id:T(e),patch:{rect:C(t),tone:t>=l-1-a?`visited`:`current`}})),...n.map((e,t)=>({type:`set`,id:E(e),patch:{rect:w(t),text:`${u[e].head}|${u[e].num}`,tone:`chosen`}})),{type:`set`,id:`tok:stat`,patch:{text:`누적 파싱 ${t}회 (정석은 6회)`,tone:`chosen`},pop:!0}]),A(220)),e.phase(`자리 이동`,`이번 회전 끝에 "${s.file}"의 자리가 확정되었습니다.`,o?v.swap:v.loop),e.do(...r(n.map((e,t)=>M(T(e),t>=l-1-a?`visited`:`plain`))))}return e.step({title:`정렬 완료 (파싱 총 ${t}회)`,codeHighlights:v.done,...i(l,0),answer:f,isKeyframe:!0}),e.phase(`정답`,`답은 정석과 같지만, 키를 미리 만들어 두지 않아 파일 파싱을 ${t}번이나 반복했습니다(정석은 ${l}번).`,v.done),e.do(...r([...n.map(e=>M(T(e),`path`)),{type:`set`,id:`tok:ans`,patch:{text:`img1 → IMG01 → img02 → img2…`,tone:`path`},pop:!0}])),e.finish()}function I(){let e=new s(N()),t=0,n=e=>({work:t,variables:{detail:e,parsedCount:t}});for(let i=0;i<l;i++){let a=u[i];t++,e.step({title:`${i+1}번째 파일: NUMBER를 문자열 "${a.numStr}" 그대로 저장`,codeHighlights:b.parse,...n(`${a.file} → "${a.numStr}"`)}),e.phase(`문자열 키 추출`,`"${a.file}"에서 NUMBER를 정수로 바꾸지 않고 문자열 "${a.numStr}" 그대로 키에 넣습니다.`,b.parse),e.do(...r([{type:`focus`,ids:[T(i),E(i)]},M(T(i),`current`),{type:`set`,id:E(i),patch:{text:`${a.head}|"${a.numStr}"`,tone:`bad`},pop:!0},{type:`set`,id:`tok:stat`,patch:{text:`문자열 NUMBER: "${a.numStr}"`,tone:`bad`},pop:!0}]),A(180)),e.phase(`키 기록`,`정수 ${a.num} 대신 문자열 "${a.numStr}"가 저장되었습니다.`,b.parse),e.do(...j(M(T(i),`plain`)))}return e.step({title:`문자열 NUMBER 사전 순 비교: "01" < "1", "10" < "2"`,codeHighlights:b.sort,...n(`"01" < "10" < "2"`)}),e.phase(`사전 순 왜곡`,`문자열로 비교하면 앞자리 0 때문에 "01" < "1"이 되어 IMG01.GIF가 img1.png 앞으로 가고, 첫 글자 "1" < "2" 때문에 img10.png가 img2.JPG 앞으로 갑니다!`,b.sort),e.do(...r([...p.map((e,t)=>({type:`set`,id:T(e),patch:{rect:C(t),tone:`bad`}})),...p.map((e,t)=>({type:`set`,id:E(e),patch:{rect:w(t),tone:`bad`}}))])),e.do({type:`arrow`,from:T(1),to:T(5),verdict:`bad`,label:`"10" < "2" 오판`},A(220)),e.step({title:`오답: IMG01.GIF가 맨 앞, img2.JPG가 맨 뒤`,codeHighlights:b.sort,...n(`오답`),answer:m,isKeyframe:!0}),e.phase(`오답 확인`,`NUMBER를 정수로 변환하지 않으면 앞자리 0("01" vs "1")과 자릿수 차이("10" vs "2")에서 모두 순서가 뒤집힙니다.`,b.sort),e.do(...j({type:`set`,id:`tok:ans`,patch:{text:`이 방법: IMG01 → img02 → img1…`,tone:`bad`},pop:!0},{type:`add`,item:{id:`tok:truth`,kind:`token`,rect:k,tone:`good`,text:`정답: img1 → IMG01 → img02…`}})),e.finish()}var L={id:`file-name-sort`,title:`파일명 정렬`,level:2,category:`sort`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/17686`,description:{summary:`파일명에 포함된 숫자를 반영해 파일명을 정렬합니다. 파일명은 숫자가 아닌 문자로 시작하는 HEAD, 최대 다섯 글자의 연속된 숫자인 NUMBER, 그 뒤의 TAIL 세 부분으로 나뉩니다. HEAD 사전 순(대소문자 구분 없음) → NUMBER의 숫자 값 순 → 원래 입력 순서 유지를 기준으로 정렬합니다.`,rules:[`files는 1,000개 이하의 배열이며, 파일명은 100글자 이하`,`HEAD는 숫자가 아닌 문자로 1글자 이상이며 대소문자 구분 없이 비교`,`NUMBER는 1~5글자의 연속된 숫자로, 앞의 0을 무시한 정수 값으로 비교(012와 12는 같음)`,`HEAD와 NUMBER의 숫자 값까지 같으면 TAIL은 보지 않고 원래 입력 순서를 유지`],examples:[{input:`files = ["img12.png", "img10.png", "img02.png", "img1.png", "IMG01.GIF", "img2.JPG"]`,output:`["img1.png", "IMG01.GIF", "img02.png", "img2.JPG", "img10.png", "img12.png"]`},{input:`files = ["F-5 Freedom Fighter", "B-50 Superfortress", "A-10 Thunderbolt II", "F-14 Tomcat"]`,output:`["A-10 Thunderbolt II", "B-50 Superfortress", "F-5 Freedom Fighter", "F-14 Tomcat"]`}]},keyIntuitions:[`정렬 기준은 오직 (HEAD 소문자, NUMBER 정수 값) 두 가지뿐이고, TAIL은 정렬에 전혀 영향을 주지 않습니다.`,`"01"과 "1"이 같은 값으로 취급되려면 NUMBER를 반드시 정수(int / Number)로 변환해 비교해야 합니다.`,`HEAD와 NUMBER가 모두 같을 때 원래 순서를 유지해야 하므로 안정 정렬(또는 원래 인덱스 포함)을 써야 합니다.`],demo:{input:[c],label:`files = ["img12.png", "img10.png", "img02.png", "img1.png", "IMG01.GIF", "img2.JPG"]`},workUnit:`파일명에서 HEAD·NUMBER를 추출한 횟수`,approaches:[{id:`file-name-head-number`,name:`HEAD·NUMBER 한 번 추출 후 안정 정렬`,rank:`BEST`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`파일마다 정규식으로 (소문자 HEAD, 정수 NUMBER) 키를 한 번만 뽑아 두고 안정 정렬하는 정석 풀이입니다.`,pros:[`각 파일에서 문자열 파싱을 딱 한 번씩만(N회) 수행해 가장 빠릅니다.`,`Python의 기본 정렬과 최신 JS의 Array.prototype.sort(또는 idx 보조 키)로 원래 순서가 깔끔하게 유지됩니다.`],cons:[`NUMBER가 최대 5자리라는 조건(\\d{1,5})을 놓치면 숫자가 6자리 이상 이어진 파일에서 다를 수 있습니다.`],whyThisRank:`정렬 키 생성(O(N·L))과 키 비교(O(N log N))를 분리해 불필요한 문자열 재파싱을 없앤 가장 효율적인 방법입니다.`,code:h,visualize:P},{id:`file-name-reparse-bubble`,name:`비교할 때마다 글자를 훑어 재파싱 + 인접 교환 정렬`,rank:`ALTERNATIVE`,timeComplexity:`O(N² · L)`,spaceComplexity:`O(N)`,verdict:`정렬 키를 미리 저장하지 않고, 두 파일을 비교할 때마다 매번 문자열을 다시 파싱하며 인접 교환 정렬하는 느린 풀이입니다.`,pros:[`정규식 없이 반복문만으로 HEAD와 NUMBER 구간을 끊는 과정을 직접 볼 수 있습니다.`,`이웃한 원소끼리만 자리를 바꾸므로 동률일 때 입력 순서가 자연스럽게 유지됩니다.`],cons:[`같은 파일명을 비교할 때마다 반복해서 파싱하므로 파싱 횟수가 O(N²)으로 늘어납니다.`],whyThisRank:`정답은 같지만, 파일당 한 번이면 끝날 HEAD·NUMBER 추출을 비교할 때마다 되풀이해 문자열 처리 비용이 크게 늘어납니다.`,code:_,visualize:F},{id:`file-name-string-num-trap`,name:`NUMBER를 정수로 바꾸지 않고 문자열로 비교`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N log N)`,spaceComplexity:`O(N)`,verdict:`HEAD와 NUMBER를 나누었지만 NUMBER에 정수 변환을 하지 않아 "10" < "2", "01" < "1"로 정렬되는 함정입니다.`,pros:[`HEAD와 NUMBER를 분리하는 정규식까지는 정석과 거의 비슷해 보입니다.`],cons:[`문자열 비교에서는 "10"이 "2"보다 앞이고, "01"이 "1"과 다른 값으로 취급되어 동률 순서도 깨집니다.`],whyThisRank:`파일명 정렬을 하는 이유 자체가 문자열 사전 순("img10" < "img2") 대신 숫자 값 크기(2 < 10)와 앞자리 0 무시를 적용하기 위함이므로, 정수 변환을 빼먹으면 틀립니다.`,code:y,visualize:I}],checks:{cases:[{args:[[`img12.png`,`img10.png`,`img02.png`,`img1.png`,`IMG01.GIF`,`img2.JPG`]],expected:[`img1.png`,`IMG01.GIF`,`img02.png`,`img2.JPG`,`img10.png`,`img12.png`]},{args:[[`F-5 Freedom Fighter`,`B-50 Superfortress`,`A-10 Thunderbolt II`,`F-14 Tomcat`]],expected:[`A-10 Thunderbolt II`,`B-50 Superfortress`,`F-5 Freedom Fighter`,`F-14 Tomcat`]},{args:[[`a0001.txt`,`A1.png`,`a01.doc`]],expected:[`a0001.txt`,`A1.png`,`a01.doc`]},{args:[[`foo010bar020.zip`,`foo9.txt`,`FOO009.zip`]],expected:[`foo9.txt`,`FOO009.zip`,`foo010bar020.zip`]},{args:[[`muzi123456.png`,`muzi12345.png`]],expected:[`muzi123456.png`,`muzi12345.png`]}],random:e=>{let t=[`img`,`IMG`,`File-`,`file-`,`doc `,`DOC `],n=[`.png`,`.JPG`,`.gif`,`2026.txt`,``],r=2+Math.floor(e()*6);return[Array.from({length:r},()=>{let r=t[Math.floor(e()*t.length)],i=Math.floor(e()*25);return`${r}${`0`.repeat(Math.floor(e()*3))}${i}${n[Math.floor(e()*n.length)]}`})]}}};export{L as default};