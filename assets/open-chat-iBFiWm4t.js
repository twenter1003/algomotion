import{c as e,i as t,s as n}from"./shared-e6uNbDLo.js";var r=[`Enter uid1234 Muzi`,`Enter uid4567 Prodo`,`Leave uid1234`,`Enter uid1234 Prodo`,`Change uid4567 Ryan`],i=r.length,a=[`uid1234`,`uid4567`],o=[`Prodo님이 들어왔습니다.`,`Ryan님이 들어왔습니다.`,`Prodo님이 나갔습니다.`,`Prodo님이 들어왔습니다.`],s=e=>`{${[...e].map(([e,t])=>`${e}: "${t}"`).join(`, `)}}`,c={python:`def solution(record):
    nick = {}
    for line in record:                         # 1차 순회: 마지막 닉네임만 사전에 기록
        parts = line.split()
        if parts[0] != "Leave":                 # Enter와 Change일 때 닉네임 갱신
            nick[parts[1]] = parts[2]

    answer = []
    for line in record:                         # 2차 순회: 확정된 닉네임으로 문장 생성
        parts = line.split()
        if parts[0] == "Enter":
            answer.append(f"{nick[parts[1]]}님이 들어왔습니다.")
        elif parts[0] == "Leave":
            answer.append(f"{nick[parts[1]]}님이 나갔습니다.")
    return answer`,javascript:`function solution(record) {
  const nick = new Map();
  for (const line of record) { // 1차 순회: 마지막 닉네임만 사전에 기록
    const [cmd, uid, name] = line.split(' ');
    if (cmd !== 'Leave') nick.set(uid, name); // Enter와 Change일 때 닉네임 갱신
  }

  const answer = [];
  for (const line of record) { // 2차 순회: 확정된 닉네임으로 문장 생성
    const [cmd, uid] = line.split(' ');
    if (cmd === 'Enter') answer.push(\`\${nick.get(uid)}님이 들어왔습니다.\`);
    else if (cmd === 'Leave') answer.push(\`\${nick.get(uid)}님이 나갔습니다.\`);
  }
  return answer;
}`},l={pass1Loop:t(c,[`for line in record:                         # 1차 순회`,`parts = line.split()`],[`for (const line of record) { // 1차 순회`,`const [cmd, uid, name] = line.split`]),pass1Save:t(c,[`if parts[0] != "Leave":`,`nick[parts[1]] = parts[2]`],[`if (cmd !== 'Leave') nick.set(uid, name)`]),pass2Enter:t(c,[`for line in record:                         # 2차 순회`,`if parts[0] == "Enter":`,`님이 들어왔습니다.`],[`for (const line of record) { // 2차 순회`,`if (cmd === 'Enter') answer.push`]),pass2Leave:t(c,[`for line in record:                         # 2차 순회`,`elif parts[0] == "Leave":`,`님이 나갔습니다.`],[`for (const line of record) { // 2차 순회`,`else if (cmd === 'Leave') answer.push`]),done:t(c,[`return answer`],[`return answer`])},u={python:`def solution(record):
    nick = {}
    events = []                                 # (유저 아이디, 동작 문구)
    answer = []

    for line in record:
        parts = line.split()
        cmd, uid = parts[0], parts[1]
        if cmd != "Leave":
            nick[uid] = parts[2]
        if cmd == "Enter":
            events.append((uid, "님이 들어왔습니다."))
        elif cmd == "Leave":
            events.append((uid, "님이 나갔습니다."))
        # 기록 하나를 처리할 때마다 지금까지의 메시지 전체를 다시 만든다
        answer = [nick[u] + suffix for u, suffix in events]
    return answer`,javascript:`function solution(record) {
  const nick = new Map();
  const events = []; // [유저 아이디, 동작 문구]
  let answer = [];

  for (const line of record) {
    const [cmd, uid, name] = line.split(' ');
    if (cmd !== 'Leave') nick.set(uid, name);
    if (cmd === 'Enter') events.push([uid, '님이 들어왔습니다.']);
    else if (cmd === 'Leave') events.push([uid, '님이 나갔습니다.']);
    // 기록 하나를 처리할 때마다 지금까지의 메시지 전체를 다시 만든다
    answer = events.map(([u, suffix]) => nick.get(u) + suffix);
  }
  return answer;
}`},d={step:t(u,[`for line in record:`,`if cmd != "Leave":`,`nick[uid] = parts[2]`],[`for (const line of record)`,`if (cmd !== 'Leave') nick.set(uid, name)`]),rebuild:t(u,[`answer = [nick[u] + suffix for u, suffix in events]`],[`answer = events.map(([u, suffix]) => nick.get(u) + suffix)`]),done:t(u,[`return answer`],[`return answer`])},f={python:`# 주의: 당시 닉네임으로 바로 문장을 만들고 이후 변경을 반영하지 않아 틀리는 풀이입니다
def solution(record):
    nick = {}
    answer = []
    for line in record:
        parts = line.split()
        cmd, uid = parts[0], parts[1]
        if cmd == "Enter":
            nick[uid] = parts[2]
            answer.append(f"{nick[uid]}님이 들어왔습니다.")  # 당시 닉네임으로 바로 고정!
        elif cmd == "Leave":
            answer.append(f"{nick[uid]}님이 나갔습니다.")
        elif cmd == "Change":
            nick[uid] = parts[2]                            # 이전 문장은 바뀌지 않음
    return answer`,javascript:`// 주의: 당시 닉네임으로 바로 문장을 만들고 이후 변경을 반영하지 않아 틀리는 풀이입니다
function solution(record) {
  const nick = new Map();
  const answer = [];
  for (const line of record) {
    const [cmd, uid, name] = line.split(' ');
    if (cmd === 'Enter') {
      nick.set(uid, name);
      answer.push(\`\${nick.get(uid)}님이 들어왔습니다.\`); // 당시 닉네임으로 바로 고정!
    } else if (cmd === 'Leave') {
      answer.push(\`\${nick.get(uid)}님이 나갔습니다.\`);
    } else if (cmd === 'Change') {
      nick.set(uid, name); // 이전 문장은 바뀌지 않음
    }
  }
  return answer;
}`},p={enter:t(f,[`if cmd == "Enter":`,`nick[uid] = parts[2]`,`님이 들어왔습니다.`],[`if (cmd === 'Enter')`,`nick.set(uid, name)`,`님이 들어왔습니다.`]),leave:t(f,[`elif cmd == "Leave":`,`님이 나갔습니다.`],[`} else if (cmd === 'Leave')`,`님이 나갔습니다.`]),change:t(f,[`elif cmd == "Change":`,`nick[uid] = parts[2]`],[`} else if (cmd === 'Change')`,`nick.set(uid, name)`]),done:t(f,[`return answer`],[`return answer`])},m=(...e)=>({python:[...new Set(e.flatMap(e=>e.python))].sort((e,t)=>e-t),javascript:[...new Set(e.flatMap(e=>e.javascript))].sort((e,t)=>e-t)}),h=620,g=316,_=e=>({x:0,y:34+e*52,w:216,h:42}),v=e=>({x:236+e*188,y:34,w:176,h:54}),y=e=>({x:240,y:136+e*40,w:360,h:32}),b=e=>`rec:${e}`,x=e=>`user:${e}`,S=e=>`msg:${e}`;function C(){let e=[{id:`rec:head`,kind:`text`,rect:{x:0,y:6,w:216,h:22},text:`기록 (record)`},{id:`dict:head`,kind:`text`,rect:{x:236,y:6,w:364,h:22},text:`닉네임 사전 (nick)`},{id:`msg:head`,kind:`text`,rect:{x:236,y:102,w:364,h:22},text:`출력 메시지 (answer)`},{id:`msg:bg`,kind:`zone`,rect:{x:232,y:128,w:376,h:176}}];return r.forEach((t,n)=>{e.push({id:b(n),kind:`token`,rect:_(n),tone:`plain`,text:t})}),a.forEach((t,n)=>{e.push({id:x(n),kind:`cell`,rect:v(n),tone:`plain`,text:`-`,tag:t})}),{width:h,height:g,items:e}}var w=e=>({type:`wait`,ms:e}),T=(e,t)=>({type:`set`,id:e,patch:{tone:t}});function E(){let t=new e(C()),o=new Map,c=[],u=0,d=`1차(닉네임)`,f=`-`,p=()=>({work:u,variables:{단계:d,line:f,nick:s(o),"메시지 수":c.length}});for(let e=0;e<i;e++){let i=r[e],[s,c,d]=i.split(` `),h=a.indexOf(c),g=o.get(c);s!==`Leave`&&o.set(c,d),u+=1,f=i,t.step({title:`1차 순회 #${e+1}: ${s===`Leave`?`${c} 퇴장 — 닉네임 그대로`:`${c} → "${d}"${g?` (${g} 덮어쓰기)`:``}`}`,codeHighlights:s===`Leave`?l.pass1Loop:m(l.pass1Loop,l.pass1Save),...p()}),t.phase(`기록 읽기`,`1차 순회: "${i}" 기록을 읽습니다.`,l.pass1Loop),t.do(T(b(e),`current`),w(200)),s===`Leave`?(t.phase(`건너뛰기`,`Leave에는 새 닉네임이 없으므로 사전을 바꾸지 않고 넘어갑니다.`,l.pass1Loop),t.do(T(b(e),`visited`),w(200))):(t.phase(`닉네임 갱신`,g?`${c}의 닉네임을 "${g}"에서 "${d}"으로 덮어씁니다.`:`${c}의 닉네임 "${d}"을 사전에 기록합니다.`,l.pass1Save),t.do({type:`focus`,ids:[b(e),x(h)]},{type:`arrow`,from:b(e),to:x(h),verdict:g?`good`:`new`,label:g?`${g}→${d}`:d},{type:`set`,id:x(h),patch:{text:d,tone:`chosen`},pop:!0}),t.do(...n([{type:`unfocus`},{type:`clearMarks`},T(b(e),`visited`)])))}d=`2차(메시지)`;let h=0;for(let e=0;e<i;e++){let i=r[e],[s,d]=i.split(` `);if(s===`Change`)continue;let m=a.indexOf(d),g=o.get(d),_=`${g}님이 ${s===`Enter`?`들어왔습니다.`:`나갔습니다.`}`,v=h++;c.push(_),u+=1,f=i,t.step({title:`2차 순회: ${s} ${d} → "${_}"`,codeHighlights:s===`Enter`?l.pass2Enter:l.pass2Leave,...p()}),t.phase(`문장 만들기`,`사전에서 ${d}의 최종 닉네임 "${g}"을 꺼내 "${_}"를 추가합니다.`,s===`Enter`?l.pass2Enter:l.pass2Leave),t.do(T(b(e),`current`),{type:`focus`,ids:[b(e),x(m)]},{type:`arrow`,from:x(m),to:b(e),verdict:`good`,label:g},{type:`add`,item:{id:S(v),kind:`token`,rect:y(v),tone:`good`,text:_},from:x(m)}),t.do(...n([{type:`unfocus`},{type:`clearMarks`},T(b(e),`chosen`)]))}return t.step({title:`메시지 ${c.length}개 완성 (총 ${u}번 확인)`,codeHighlights:l.done,...p(),answer:[...c],isKeyframe:!0}),t.phase(`정답`,`1차 순회로 마지막 닉네임을 확정하고 2차 순회로 문장을 만들어 총 ${u}번의 확인으로 끝났습니다.`,l.done),t.do(...n(c.map((e,t)=>T(S(t),`path`))),w(500)),t.finish()}function D(){let t=new e(C()),o=new Map,c=[],l=[],u=0,f=`-`,p=()=>({work:u,variables:{line:f,nick:s(o),"다시 쓴 메시지":c.length}});for(let e=0;e<i;e++){let i=r[e],[s,h,g]=i.split(` `),_=a.indexOf(h);s!==`Leave`&&o.set(h,g);let v=s===`Enter`||s===`Leave`;s===`Enter`?c.push([h,`님이 들어왔습니다.`]):s===`Leave`&&c.push([h,`님이 나갔습니다.`]),l=c.map(([e,t])=>`${o.get(e)}${t}`),u+=1+c.length,f=i,t.step({title:`#${e+1} (${i}) 처리 후 메시지 ${c.length}개 전체 다시 생성`,codeHighlights:m(d.step,d.rebuild),...p()}),t.phase(`기록 반영`,`"${i}"을 처리하고 지금까지 쌓인 메시지 ${c.length}개를 처음부터 다시 만듭니다.`,m(d.step,d.rebuild));let C=[T(b(e),`current`)];s!==`Leave`&&C.push({type:`set`,id:x(_),patch:{text:g,tone:`chosen`},pop:!0}),l.forEach((n,r)=>{v&&r===l.length-1&&!t.has(S(r))?C.push({type:`add`,item:{id:S(r),kind:`token`,rect:y(r),tone:`chosen`,text:n},from:b(e)}):C.push({type:`set`,id:S(r),patch:{text:n,tone:`chosen`},pop:!0})}),t.do(...n(C),w(300),T(b(e),`visited`))}return t.step({title:`완성 (총 ${u}번 확인 — 정석은 9번)`,codeHighlights:d.done,...p(),answer:[...l],isKeyframe:!0}),t.phase(`정답`,`답은 같지만, 기록마다 지금까지의 메시지 배열 전체를 다시 만들어 ${u}번(정석은 9번) 확인했습니다.`,d.done),t.do(...n(l.map((e,t)=>T(S(t),`path`))),w(500)),t.finish()}function O(){let t=new e(C()),c=new Map,l=[],u=0,d=`-`,f=()=>({work:u,variables:{line:d,nick:s(c),"메시지 수":l.length}}),m=0;for(let e=0;e<i;e++){let n=r[e],[i,o,s]=n.split(` `),h=a.indexOf(o);if(u+=1,d=n,i===`Enter`){c.set(o,s);let n=`${s}님이 들어왔습니다.`,r=m++;l.push(n),t.step({title:`#${e+1} Enter: "${n}"를 바로 문자열로 고정`,codeHighlights:p.enter,...f()}),t.phase(`즉시 문장 생성`,`${o}의 당시 닉네임 "${s}"으로 문장을 바로 만들어 넣습니다. 이전에 만든 문장은 고치지 않습니다.`,p.enter),t.do(T(b(e),`current`),{type:`set`,id:x(h),patch:{text:s,tone:`bad`},pop:!0},{type:`add`,item:{id:S(r),kind:`token`,rect:y(r),tone:e===0?`bad`:`chosen`,text:n},from:b(e)},w(250),T(b(e),`visited`))}else if(i===`Leave`){let n=c.get(o),r=`${n}님이 나갔습니다.`,i=m++;l.push(r),t.step({title:`#${e+1} Leave: 당시 닉네임 "${n}"으로 퇴장 문장 고정`,codeHighlights:p.leave,...f()}),t.phase(`즉시 문장 생성`,`${o}의 현재 닉네임 "${n}"으로 퇴장 문장을 바로 만듭니다.`,p.leave),t.do(T(b(e),`current`),{type:`add`,item:{id:S(i),kind:`token`,rect:y(i),tone:`bad`,text:r},from:b(e)},w(250),T(b(e),`visited`))}else c.set(o,s),t.step({title:`#${e+1} Change: 사전만 "${s}"으로 바뀌고 2번째 문장은 "Prodo" 그대로 남음!`,codeHighlights:p.change,...f()}),t.phase(`이전 문장 미반영`,`사전의 ${o}는 "${s}"으로 바뀌었지만, 이미 문자열로 만들어 둔 앞선 문장들은 바뀌지 않습니다.`,p.change),t.do(T(b(e),`current`),{type:`set`,id:x(h),patch:{text:s,tone:`bad`},pop:!0},T(S(1),`bad`),w(250),T(b(e),`visited`))}return t.step({title:`오답 확인: 앞선 3개 문장에 옛 닉네임(Muzi, Prodo)이 그대로 남음`,codeHighlights:p.done,...f(),answer:[...l],isKeyframe:!0}),t.phase(`오답 확인`,`1~3번째 문장이 옛 닉네임("Muzi", "Prodo")으로 남아 오답입니다. 정답은 첫 문장부터 "${o[0]}", "${o[1]}", "${o[2]}"여야 합니다.`,p.done),t.do(...n([T(S(0),`bad`),T(S(1),`bad`),T(S(2),`bad`)]),w(600)),t.finish()}var k={id:`open-chat`,title:`오픈채팅방`,level:2,category:`hash`,sourceUrl:`https://school.programmers.co.kr/learn/courses/30/lessons/42888`,description:{summary:`오픈채팅방에서 유저가 들어오고(Enter) 나가거나(Leave) 닉네임을 바꾸면(Change), 이전에 출력된 메시지의 닉네임까지 모두 마지막 닉네임으로 바뀝니다. 기록 배열 record가 주어질 때 최종적으로 화면에 보이는 메시지 배열을 구합니다.`,rules:[`record의 길이는 1 이상 100,000 이하`,`각 원소는 "Enter [유저 아이디] [닉네임]", "Leave [유저 아이디]", "Change [유저 아이디] [닉네임]" 중 하나`,`유저 아이디와 닉네임은 알파벳 대소문자와 숫자로 이루어진 길이 1~10 문자열`],examples:[{input:`record = ["Enter uid1234 Muzi", "Enter uid4567 Prodo", "Leave uid1234", "Enter uid1234 Prodo", "Change uid4567 Ryan"]`,output:`["Prodo님이 들어왔습니다.", "Ryan님이 들어왔습니다.", "Prodo님이 나갔습니다.", "Prodo님이 들어왔습니다."]`}]},keyIntuitions:[`중간에 닉네임이 몇 번 바뀌든 최종 화면에 찍히는 이름은 유저마다 "맨 마지막 닉네임" 하나뿐입니다.`,`따라서 문장을 바로 만들지 말고, 1차 순회에서 {유저 아이디 → 마지막 닉네임} 사전을 완성한 뒤 2차 순회에서 문장을 조립하면 앞선 문장을 고칠 일이 없습니다.`,`Leave 기록에는 닉네임이 들어 있지 않으므로 1차 순회에서 건너뛰고, Change 기록은 화면에 문장을 남기지 않으므로 2차 순회에서 건너뜁니다.`],demo:{input:[r],label:`record = ["Enter uid1234 Muzi", "Enter uid4567 Prodo", "Leave uid1234", "Enter uid1234 Prodo", "Change uid4567 Ryan"]`},workUnit:`기록이나 메시지를 확인한 횟수`,approaches:[{id:`open-chat-two-pass`,name:`마지막 닉네임 사전 만든 뒤 두 번째 순회로 출력`,rank:`BEST`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`1차 순회로 유저별 최종 닉네임을 사전에 확정하고, 2차 순회로 메시지를 한 번에 만드는 풀이입니다.`,pros:[`기록 배열을 두 번만 훑으므로 기록이 10만 개여도 O(N)에 끝납니다.`,`이미 만든 문자열을 다시 찾아 바꾸는 복잡한 처리가 전혀 필요 없습니다.`],cons:[`Enter/Leave/Change 세 명령어가 1차 순회와 2차 순회에서 각각 어떻게 쓰이는지 구분해야 합니다.`],whyThisRank:`"변하는 이름(닉네임)"과 "변하지 않는 식별자(유저 아이디)"를 분리해 해시 사전으로 연결하는 가장 정석적인 2-pass 풀이입니다.`,code:c,visualize:E},{id:`open-chat-rewrite`,name:`기록마다 지금까지의 메시지 전체를 다시 만들기`,rank:`ALTERNATIVE`,timeComplexity:`O(N²)`,spaceComplexity:`O(N)`,verdict:`기록을 한 줄 처리할 때마다 지금까지 쌓인 메시지 배열 전체를 새로 만드는 풀이로, 중복 작업이 많습니다.`,pros:[`어느 시점에 멈춰도 그 시점까지의 채팅방 화면 상태를 바로 볼 수 있습니다.`],cons:[`기록이 N개면 1 + 2 + … + N번 메시지를 다시 만들어 O(N²) 시간이 걸립니다. N = 100,000이면 시간 초과가 납니다.`,`결국 마지막 닉네임만 쓰이는데 중간 상태의 문자열을 계속 만들었다 버리는 낭비가 있습니다.`],whyThisRank:`문제에서 요구하는 것은 중간 화면이 아니라 모든 기록이 끝난 뒤의 최종 화면뿐이므로, 마지막에 한 번만 문장을 조립하는 정석이 훨씬 효율적입니다.`,code:u,visualize:D},{id:`open-chat-immediate`,name:`들어오고 나갈 때 당시 닉네임으로 바로 문장 만들기`,rank:`TRAP`,trap:`wrong`,timeComplexity:`O(N)`,spaceComplexity:`O(N)`,verdict:`입장·퇴장 시점의 닉네임으로 문자열을 바로 고정해 버려서, 나중에 바뀐 닉네임이 이전 메시지에 반영되지 않는 오답 풀이입니다.`,pros:[`닉네임이 한 번도 바뀌지 않는 입력에서는 우연히 맞습니다.`],cons:[`재입장(Enter)이나 변경(Change)으로 닉네임이 바뀌면 이전에 출력된 메시지가 옛 닉네임 그대로 남습니다.`],whyThisRank:`"기존에 채팅방에 출력되어 있던 메시지의 닉네임도 전부 변경된다"는 핵심 규칙을 놓치고 한 번의 순회로 문자열까지 완성하려 한 실수입니다.`,code:f,visualize:O}],checks:{cases:[{args:[[`Enter uid1234 Muzi`,`Enter uid4567 Prodo`,`Leave uid1234`,`Enter uid1234 Prodo`,`Change uid4567 Ryan`]],expected:[`Prodo님이 들어왔습니다.`,`Ryan님이 들어왔습니다.`,`Prodo님이 나갔습니다.`,`Prodo님이 들어왔습니다.`]},{args:[[`Enter u1 Alice`,`Change u1 Bob`,`Leave u1`]],expected:[`Bob님이 들어왔습니다.`,`Bob님이 나갔습니다.`]},{args:[[`Enter u1 A`,`Leave u1`,`Enter u1 B`]],expected:[`B님이 들어왔습니다.`,`B님이 나갔습니다.`,`B님이 들어왔습니다.`]},{args:[[`Enter u1 Solo`]],expected:[`Solo님이 들어왔습니다.`]}],random:e=>{let t=[`u1`,`u2`,`u3`],n=[`Kim`,`Lee`,`Park`,`Choi`,`Jung`],r=new Set,i=[],a=2+Math.floor(e()*6);for(;i.length<a;){let a=t[Math.floor(e()*t.length)],o=n[Math.floor(e()*n.length)];r.has(a)?e()<.5?(r.delete(a),i.push(`Leave ${a}`)):i.push(`Change ${a} ${o}`):(r.add(a),i.push(`Enter ${a} ${o}`))}return i.some(e=>!e.startsWith(`Change`))||i.push(`Enter u1 Kim`),[i]}}};export{k as default};