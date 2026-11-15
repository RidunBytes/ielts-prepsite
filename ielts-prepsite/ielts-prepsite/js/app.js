/* IELTS Prepsite: speaking and writing trainer.
   Core app: data wiring, progress storage, quizzes, routing and shared helpers.
   Feature modules (cuecard.js, builder.js, guides.js) plug in through window.BW. */
(function(){
"use strict";
const BW=window.BW=window.BW||{};
BW.views=BW.views||{};BW.actions=BW.actions||{};BW.bind=BW.bind||{};BW.leave=BW.leave||[];BW.after=BW.after||[];
/* ============ helpers ============ */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const pl=(n,w)=>n===1?w:w+"s";
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const pad=n=>String(n).padStart(2,"0");
const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>ymd(new Date());
const parse=s=>{const p=s.split("-").map(Number);return new Date(p[0],p[1]-1,p[2]);};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return ymd(d);};
const daysBetween=(a,b)=>Math.round((parse(b)-parse(a))/864e5);

/* ============ icons ============ */
const IC={
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  book:'<path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4z"/><path d="M20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7z"/>',
  refresh:'<path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 4v7h-7"/>',
  quote:'<path d="M7 7h4v4c0 3-2 5-4 5"/><path d="M15 7h4v4c0 3-2 5-4 5"/>',
  bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon:'<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
  sliders:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  volume:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7"/>',
  left:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  right:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  chev:'<path d="M9 6l6 6-6 6"/>',
  check:'<path d="M5 12l5 5 9-10"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  flame:'<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
  search:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
  pen:'<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  blocks:'<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><path d="M17 13v8M13 17h8"/>',
  play:'<path d="M7 4l13 8-13 8z"/>',
  stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>'
};
const ico=(n,s=18)=>'<svg class="ic" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';

/* ============ vocabulary wiring ============ */
const LV={inter:{name:"Intermediate",band:"5.5–6.5"},adv:{name:"Advanced",band:"7.0–9.0"}};
const TRACKS=[
  {id:"sp1",area:"speaking",full:"Speaking Part 1",title:"Part 1",lead:"Short answers about everyday life",hue:20,blurb:"Natural, specific words for work, weather, music, sport, news and home. A good Part 1 answer has three bits: the answer, a reason and a quick example."},
  {id:"sp2",area:"speaking",full:"Speaking Part 2",title:"Part 2",lead:"The two-minute talk",hue:340,blurb:"Descriptive and storytelling language for cue cards about people, places, objects, events and experiences."},
  {id:"w1",area:"writing",full:"Writing Task 1",title:"Task 1",lead:"Charts, maps and processes",hue:210,blurb:"Precise language for trends, proportions, map changes and process stages, plus overview phrases."},
  {id:"w2",area:"writing",full:"Writing Task 2 language",title:"Task 2 language",lead:"The language of argument",hue:150,blurb:"Cause and effect, problems and solutions, advantages and drawbacks, and the role of government."},
  {id:"gen",area:"writing",full:"Essay topics",title:"Essay topics",lead:"Topic vocabulary for Task 2",hue:262,blurb:"Seven big topics that come up again and again. Also useful for Speaking Part 3."}
];
const TRACK={};TRACKS.forEach(t=>{TRACK[t.id]=t;});
const TOPICS=[],WORDS=[],WMAP={},TMAP={},WBYT={};
TRACKS.forEach(tr=>(BW.vocab[tr.id]||[]).forEach((t,ti)=>{
  if(tr.id!=="gen")t.id=tr.id+t.id;
  t.track=tr.id;
  if(t.hue==null)t.hue=(tr.hue+ti*26)%360;
  t.glyph=t.glyph||t.name.charAt(0);
  TOPICS.push(t);TMAP[t.id]=t;WBYT[t.id]={inter:[],adv:[]};
  ["inter","adv"].forEach(l=>t[l].forEach((a,i)=>{
    const w={id:t.id+"-"+l+"-"+i,kind:"word",topic:t.id,level:l,label:a[0],word:a[0],pos:a[1],def:a[2],ex:a[3],syn:a[4],col:a[5]};
    WORDS.push(w);WMAP[w.id]=w;WBYT[t.id][l].push(w);
  }));
}));

/* ============ phrases wiring ============ */
const PSETS=BW.phraseSets||[];
const PSET={},PITEMS=[];
PSETS.forEach(s=>{
  PSET[s.id]=s;s.list=[];
  s.items.forEach((a,i)=>{
    const p={id:s.id+"."+i,kind:"phrase",set:s.id,pkind:s.kind,label:a[0],def:a[1],ex:a[2]};
    s.list.push(p);PITEMS.push(p);
  });
});
const phrasePool=s=>PITEMS.filter(p=>{const q=PSET[p.set];return q.kind===s.kind&&(s.kind!=="useful"||q.use===s.use);});
const PTABS=[["idioms","Idioms"],["verbs","Phrasal verbs"],["speaking","Speaking phrases"],["writing","Writing phrases"],["all","All phrases"]];
const PNOTE={
  idioms:"Idioms belong in Speaking. In Writing they sound informal and can cost marks.",
  verbs:"Phrasal verbs are natural in Speaking. In formal Writing, prefer a single verb, such as investigate for look into.",
  speaking:"Openers, linking phrases and ways to extend an answer for Parts 1, 2 and 3.",
  writing:"Report openers, essay introductions, body-paragraph phrases and conclusions.",
  all:"Every set in one place. Open any set to read it, then check yourself with five questions."
};
const setsForTab=tab=>PSETS.filter(s=>tab==="all"||(tab==="speaking"?(s.kind==="useful"&&s.use==="Speaking"):tab==="writing"?(s.kind==="useful"&&s.use==="Writing"):s.kind===tab));
const kindLabel=s=>s.kind==="idioms"?"Idioms":s.kind==="verbs"?"Phrasal verbs":s.use+" phrases";
const focusTracks=()=>{const f=store.profile.focus;return f==="speaking"?["sp1","sp2"]:f==="writing"?["w1","w2","gen"]:["sp1","sp2","w1","w2","gen"];};

/* ============ shared text matching ============ */
function hasWord(text,word){
  const t=" "+String(text).toLowerCase().replace(/[^a-z0-9’'\- ]/g," ")+" ";
  return word.toLowerCase().split(/\s+/).every(p=>{
    const base=p.replace(/[^a-z’'\-]/g,"");if(!base)return true;
    const stem=base.length<=4?base:base.slice(0,Math.max(4,base.length-2));
    return new RegExp("[^a-z]"+stem.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"[a-z’'\\-]*").test(t);
  });
}

/* ============ spaced repetition ============ */
const INTERVALS=[0,1,3,7,14,30];
const BOXES=[["Missed","back today"],["Just learned","back in 1 day"],["Familiar","back in 3 days"],["Growing","back in 1 week"],["Strong","back in 2 weeks"],["Mastered","back in 1 month"]];

/* ============ storage ============ */
const KEY="bandwords:v1"; // storage key kept from the first version so saved progress is not lost
const fresh=()=>({profile:{name:"",target:7,level:"adv",exam:"",focus:"both",done:false},words:{},saved:[],phr:{},quizzes:0,answered:0,correct:0,hist:{},theme:null,cue:{log:[],done:{},prefs:{}},sentences:[]});
const store=fresh();
try{
  const raw=localStorage.getItem(KEY);
  if(raw){const o=JSON.parse(raw);Object.assign(store,o);store.profile=Object.assign(fresh().profile,o.profile||{});store.cue=Object.assign(fresh().cue,o.cue||{});}
}catch(e){}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}
function applyTheme(){const r=document.documentElement;if(store.theme)r.setAttribute("data-theme",store.theme);else r.removeAttribute("data-theme");}
const isDark=()=>store.theme?store.theme==="dark":(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches);

/* ============ state ============ */
let session=null;
const ui={q:"",open:{},ptab:"idioms",wtab:"learned",modal:null,confirmReset:false};

/* ============ derived data ============ */
const learnedCount=()=>Object.keys(store.words).filter(id=>WMAP[id]).length;
const dueList=()=>{const t=today();return Object.keys(store.words).filter(id=>WMAP[id]&&store.words[id].due<=t).map(id=>WMAP[id]);};
function act(d){const h=store.hist[d];return !!(h&&((h.q||0)>0||(h.learn||0)>0||(h.cue||0)>0));}
function streak(){let d=today(),s=0;if(!act(d))d=addDays(d,-1);while(act(d)){s++;d=addDays(d,-1);}return s;}
function logAct(k,n){const d=today();const h=store.hist[d]||(store.hist[d]={q:0,learn:0,review:0,phr:0});h[k]=(h[k]||0)+(n==null?1:n);}
function nextFresh(){const l=store.profile.level,ft=focusTracks();return TOPICS.find(t=>ft.indexOf(t.track)>=0&&WBYT[t.id][l].some(w=>!store.words[w.id]))||null;}
function dueText(id){
  const w=store.words[id];if(!w)return"";
  const n=daysBetween(today(),w.due);
  if(n<=0)return w.box===0?"Due now":"Due today";
  if(n===1)return"Due tomorrow";
  return"Due in "+n+" days";
}
const dots=b=>'<span class="dots" role="img" aria-label="Memory strength '+b+' of 5">'+[1,2,3,4,5].map(k=>'<i class="'+(k<=b?"on":"")+'"></i>').join("")+'</span>';
const markEx=ex=>esc(ex).replace(/\{([^}]+)\}/g,"<mark>$1</mark>");
const blankEx=ex=>esc(ex).replace(/\{[^}]+\}/g,'<span class="blank" aria-label="blank"></span>');

function speak(t){try{const u=new SpeechSynthesisUtterance(t);u.lang="en-GB";u.rate=.9;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}}
let toastT;
function toast(m){const el=$("#toast");el.textContent=m;el.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove("show"),1900);}

/* ============ quiz engine ============ */
const KINDS=["d2w","blank","w2d"];
function distractors(item,pool,n){
  const ok=pool.filter(p=>p.id!==item.id&&p.label.toLowerCase()!==item.label.toLowerCase()&&p.def!==item.def);
  const same=item.pos?ok.filter(p=>p.pos===item.pos):[];
  let out=shuffle(same).slice(0,n);
  if(out.length<n)out=out.concat(shuffle(ok.filter(p=>out.indexOf(p)<0)).slice(0,n-out.length));
  return out;
}
function makeQ(item,pool,kind){
  const opts=shuffle([item].concat(distractors(item,pool,3)));
  const q={item:item,kind:kind,answer:opts.indexOf(item)};
  const noun=item.kind==="phrase"?"phrase":"word";
  if(kind==="w2d"){
    q.prompt="What does <em>"+esc(item.label)+"</em> mean?";
    q.options=opts.map(o=>cap(o.def));
  }else if(kind==="d2w"){
    q.prompt="Which "+noun+" matches this meaning?";
    q.sub=cap(item.def);
    q.options=opts.map(o=>o.label);
  }else{
    q.prompt="Choose the "+noun+" that completes the sentence.";
    q.sentence=blankEx(item.ex);
    q.options=opts.map(o=>o.label);
  }
  return q;
}
function buildQs(items,pool){
  const off=Math.floor(Math.random()*3);
  return items.map((it,i)=>makeQ(it,pool,KINDS[(i+off)%3]));
}
function grade(id,ok,mode){
  const w=store.words[id];if(!w)return;
  if(ok){
    w.ok++;
    w.box=mode==="learn"?Math.max(w.box,1):Math.min(5,w.box+1);
    w.due=addDays(today(),INTERVALS[w.box]);
  }else{
    w.no++;w.box=0;w.due=today();
  }
}

/* ============ sessions ============ */
function startLearn(topicId){
  const t=TMAP[topicId],l=store.profile.level,list=WBYT[topicId][l];
  let batch=list.filter(w=>!store.words[w.id]).slice(0,5);
  const newCount=batch.length;
  if(batch.length<5)batch=batch.concat(shuffle(list.filter(w=>batch.indexOf(w)<0)).slice(0,5-batch.length));
  let added=0;
  batch.forEach(w=>{if(!store.words[w.id]){store.words[w.id]={box:0,due:today(),seen:today(),ok:0,no:0};added++;}});
  if(added)logAct("learn",added);
  persist();
  session={mode:"learn",title:t.name,level:l,topic:topicId,items:batch,newCount:newCount,phase:"study",step:0,qs:null,i:0,picked:null,answers:[],back:"#topic-"+topicId,backLabel:t.name};
  render(true);
}
function startReview(){
  const due=dueList().sort((a,b)=>store.words[a.id].box-store.words[b.id].box||store.words[a.id].due.localeCompare(store.words[b.id].due)).slice(0,10);
  if(!due.length){toast("Nothing is due right now");return;}
  const pool=WORDS;
  session={mode:"review",title:"Review",items:due,phase:"quiz",qs:buildQs(due,pool),i:0,picked:null,answers:[],back:"#review",backLabel:"Review"};
  render(true);
}
function startPhrase(setId){
  const s=PSET[setId];
  const items=shuffle(s.list).slice(0,5);
  session={mode:"phrase",title:s.name,set:setId,items:items,phase:"quiz",qs:buildQs(items,phrasePool(s)),i:0,picked:null,answers:[],back:"#set-"+setId,backLabel:s.name};
  render(true);
}
function answer(i){
  const s=session;if(!s||s.phase!=="quiz"||s.picked!==null)return;
  const q=s.qs[s.i];s.picked=i;
  const ok=i===q.answer;
  s.answers.push({item:q.item,ok:ok});
  if(s.mode!=="phrase"){
    grade(q.item.id,ok,s.mode);
    store.answered++;if(ok)store.correct++;
    if(s.mode==="review")logAct("review",1);
  }
  logAct("q",1);
  persist();
  render();
  const nb=$("#nextBtn");if(nb)nb.focus({preventScroll:false});
}
function nextQ(){
  const s=session;if(!s||s.picked===null)return;
  if(s.i<s.qs.length-1){s.i++;s.picked=null;render(true);}
  else{
    s.phase="done";
    const score=s.answers.filter(a=>a.ok).length;
    if(s.mode==="phrase"){
      const p=store.phr[s.set]||{best:0,tries:0};
      p.best=Math.max(p.best,score);p.tries++;store.phr[s.set]=p;logAct("phr",1);
    }else store.quizzes++;
    persist();render(true);
  }
}
function leaveSession(){session=null;render(true);}

/* ============ view parts ============ */
function levelSeg(){
  return '<div class="seg" role="group" aria-label="Level">'+["inter","adv"].map(l=>'<button class="'+(store.profile.level===l?"on":"")+'" data-a="level" data-lv="'+l+'" aria-pressed="'+(store.profile.level===l)+'">'+LV[l].name+'<small>Band '+LV[l].band+'</small></button>').join("")+'</div>';
}
function wordRow(w,opts){
  opts=opts||{};
  const open=!!ui.open[w.id],sw=store.words[w.id],saved=store.saved.indexOf(w.id)>=0;
  let h='<div class="wrow'+(open?" open":"")+'"><button class="wr-head" data-a="toggle" data-id="'+w.id+'" aria-expanded="'+open+'">'
    +'<span class="wr-word">'+esc(w.word)+'</span><span class="pos">'+esc(w.pos)+'</span><span class="wr-def">'+esc(w.def)+'</span>'
    +(opts.showLevel?'<span class="chip">'+LV[w.level].name+'</span>':(sw?dots(sw.box):'<span class="chip">New</span>'))
    +'<span class="chev">'+ico("chev",16)+'</span></button>';
  if(open){
    h+='<div class="wr-body"><p class="ruled">'+markEx(w.ex)+'</p>'
      +'<div class="tags"><p><b>Similar:</b> '+esc(w.syn)+'</p><p><b>Often used with:</b> '+esc(w.col)+'</p></div>'
      +'<div class="acts"><button class="btn btn-ghost btn-sm" data-a="speak" data-t="'+esc(w.word)+'">'+ico("volume",16)+'Listen</button>'
      +'<button class="btn btn-ghost btn-sm" data-a="save" data-id="'+w.id+'">'+ico("bookmark",16)+(saved?"Saved":"Save word")+'</button></div></div>';
  }
  return h+'</div>';
}
function searchResults(){
  const q=ui.q.trim().toLowerCase();
  if(!q)return"";
  const m=WORDS.filter(w=>w.word.toLowerCase().indexOf(q)>=0||w.def.toLowerCase().indexOf(q)>=0||w.syn.toLowerCase().indexOf(q)>=0).slice(0,14);
  if(!m.length)return'<div class="empty"><h3>No match for “'+esc(ui.q.trim())+'”</h3><p class="mute">Try a shorter spelling, or search by meaning, such as “harmful” or “rise”.</p></div>';
  return '<div style="margin-bottom:30px">'+m.map(w=>wordRow(w,{showLevel:true})).join("")+'</div>';
}

/* ============ views ============ */
function tileHTML(t){
  const l=store.profile.level,ws=WBYT[t.id][l],k=ws.filter(w=>store.words[w.id]).length,fr=ws.length-k,n=Math.min(5,fr);
  const label=fr>0?"Learn "+n+" new "+pl(n,"word"):"Revise 5 words";
  return '<article class="tile" style="--h:'+t.hue+'"><div class="glyph" aria-hidden="true">'+esc(t.glyph)+'</div><h3>'+esc(t.name)+'</h3><p class="mute">'+esc(t.blurb||"")+'</p>'
    +'<div class="prog" style="margin-top:6px" role="img" aria-label="'+k+' of '+ws.length+' learned"><div style="width:'+(k/ws.length*100)+'%"></div></div><p class="small mute">'+k+" of "+ws.length+' learned</p>'
    +'<div class="row"><button class="btn btn-primary" data-a="learn" data-topic="'+t.id+'">'+label+'</button><a class="btn btn-ghost" href="#topic-'+t.id+'" data-a="nav">Browse</a></div></article>';
}
function trackBlock(tr){
  const l=store.profile.level,ts=TOPICS.filter(t=>t.track===tr.id);
  let total=0,got=0;
  ts.forEach(t=>{const ws=WBYT[t.id][l];total+=ws.length;got+=ws.filter(w=>store.words[w.id]).length;});
  return '<section class="trk"><div class="trk-h"><div><h2>'+esc(tr.title)+'</h2><p class="mute">'+esc(tr.lead)+'</p></div><span class="chip">'+got+" of "+total+' learned</span></div>'
    +'<p class="note">'+esc(tr.blurb)+'</p><div class="tiles">'+ts.map(tileHTML).join("")+'</div></section>';
}
const banner=(href,title,text)=>'<a class="banner" href="'+href+'" data-a="nav"><div><b>'+title+'</b><span>'+text+'</span></div>'+ico("right",20)+'</a>';

function vSpeaking(){
  return '<div class="ph"><div><h1>Speaking vocabulary</h1><p class="mute">Words and phrases for each part of the test. Learn them in small sets, then use them in the cue card trainer.</p></div></div>'
  +'<div class="tools">'+levelSeg()+'</div>'
  +'<div class="banners">'+banner("#cuecards","Cue card practice","One minute to plan, two minutes to speak, with timers and pacing.")+banner("#builder","Sentence builder","Turn words into compound and complex sentences with connectors.")+'</div>'
  +trackBlock(TRACK.sp1)+trackBlock(TRACK.sp2)
  +'<section class="trk"><div class="trk-h"><div><h2>Part 3</h2><p class="mute">Abstract discussion about society and ideas</p></div></div>'
  +'<p class="note">Part 3 asks for opinions, comparisons and predictions. Use the essay topic words for content, and the Part 3 phrase set to sound fluent.</p>'
  +'<div class="links"><a class="btn btn-ghost" href="#set-ufp3" data-a="nav">Part 3 phrases</a><a class="btn btn-ghost" href="#writing" data-a="nav">Essay topic words</a><a class="btn btn-ghost" href="#builder" data-a="nav">Connector guide</a></div></section>';
}
function vWriting(){
  return '<div class="ph"><div><h1>Writing vocabulary</h1><p class="mute">Task 1 language for reports and Task 2 language for essays, plus the topics that appear most often.</p></div></div>'
  +'<div class="tools">'+levelSeg()+'</div>'
  +'<div class="banners">'+banner("#guides","Report and essay guides","Paragraph plans and sentence frames for every Task 1 and Task 2 type.")+banner("#builder","Sentence builder","Practise compound and complex sentences with connectors.")+'</div>'
  +trackBlock(TRACK.w1)+trackBlock(TRACK.w2)+trackBlock(TRACK.gen);
}

function vToday(){
  const p=store.profile,h=new Date().getHours();
  const g=h<12?"Good morning":h<18?"Good afternoon":"Good evening";
  const dt=new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  const T=today(),A=store.hist[T]||{},ft=focusTracks();
  const pool=WORDS.filter(w=>w.level===p.level&&ft.indexOf(TMAP[w.topic].track)>=0);
  const nd=new Date(),dn=Math.floor(Date.UTC(nd.getFullYear(),nd.getMonth(),nd.getDate())/864e5);
  const w=pool[dn%pool.length];
  const savedW=store.saved.indexOf(w.id)>=0;
  const due=dueList().length,lc=learnedCount(),nf=nextFresh();
  const learnToday=Math.min(A.learn||0,5);
  const firstSet=PSETS.find(s=>!store.phr[s.id])||PSETS[0];
  const strong=Object.keys(store.words).filter(id=>WMAP[id]&&store.words[id].box>=4).length;
  const acc=store.answered?Math.round(store.correct/store.answered*100)+"%":"–";
  const tick='<span class="tick">'+ico("check",14)+'</span>';

  const todo1='<li class="todo '+(learnToday>=5?"done":"")+'">'+tick+'<div><b>Learn 5 new words</b><span class="s">'+(nf?learnToday+" of 5 today":"Every word at this level is learned")+'</span></div>'
    +(nf?'<button class="btn btn-primary btn-sm" data-a="learn" data-topic="'+nf.id+'">'+(learnToday?"Keep going":"Start with "+esc(nf.name.toLowerCase()))+'</button>':'<a class="btn btn-ghost btn-sm" href="#speaking" data-a="nav">Switch level</a>')+'</li>';
  const todo2='<li class="todo '+(lc>0&&due===0?"done":"")+'">'+tick+'<div><b>Review due words</b><span class="s">'+(due?due+" "+pl(due,"word")+" due now":(lc?"Nothing due. Come back tomorrow.":"Learn a few words first"))+'</span></div>'+(due?'<button class="btn btn-primary btn-sm" data-a="review">Review '+Math.min(due,10)+'</button>':'')+'</li>';
  const todo3='<li class="todo '+((A.cue||0)>0?"done":"")+'">'+tick+'<div><b>Practise one cue card</b><span class="s">'+((A.cue||0)>0?"Done today":"One minute to plan, two minutes to speak")+'</span></div><a class="btn btn-ghost btn-sm" href="#cuecards" data-a="nav">Pick a card</a></li>';
  const todo4='<li class="todo '+((A.phr||0)>0?"done":"")+'">'+tick+'<div><b>Check one phrase set</b><span class="s">Five questions on '+esc(firstSet.name.toLowerCase())+'</span></div><a class="btn btn-ghost btn-sm" href="#set-'+firstSet.id+'" data-a="nav">Open set</a></li>';

  const now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),now.getDate()-now.getDay());
  let wk="";
  for(let i=0;i<7;i++){
    const d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i),s=ymd(d);
    wk+='<div class="d '+(act(s)?"act ":"")+(s===T?"now":"")+'"><span>'+"SMTWTFS"[i]+'</span><span class="dot">'+d.getDate()+'</span></div>';
  }
  const sk=streak();
  let examHTML;
  if(p.exam){
    const n=daysBetween(T,p.exam);
    const lbl=parse(p.exam).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
    examHTML='<div><div class="big">'+lbl+'</div><p class="mute small">'+(n>0?"in "+n+" "+pl(n,"day"):n===0?"today":"passed")+'</p></div>';
  }else examHTML='<div><button class="btn btn-ghost btn-sm" data-a="settings">Add exam date</button></div>';

  const rows=TRACKS.map(tr=>{
    const ws=WORDS.filter(x=>TMAP[x.topic].track===tr.id&&x.level===p.level),k=ws.filter(x=>store.words[x.id]).length;
    return '<a class="trow" href="#'+tr.area+'" data-a="nav" style="--h:'+tr.hue+'"><span class="sw"></span><b>'+esc(tr.full)+'</b><div class="prog" role="img" aria-label="'+k+' of '+ws.length+' learned"><div style="width:'+(k/ws.length*100)+'%"></div></div><span class="n">'+k+" / "+ws.length+'</span></a>';
  }).join("");
  const cl=store.cue.log,tried=Object.keys(store.cue.done).length;
  const cueMin=Math.round(cl.reduce((a,x)=>a+(x.sec||0),0)/60);

  return '<div class="hello"><h1>'+g+(p.name?", "+esc(p.name):"")+'.</h1><p class="mute">'+dt+'</p></div>'
  +'<div class="cols"><div>'
  +'<section class="hero" aria-label="Word of the day"><div class="wotd"><div class="top"><span class="chip hl">Word of the day</span><span class="small">'+esc(TRACK[TMAP[w.topic].track].full)+', '+LV[w.level].name.toLowerCase()+'</span></div>'
  +'<h2 class="hw"><mark>'+esc(w.word)+'</mark></h2><div><span class="pos">'+esc(w.pos)+'</span></div><p class="def">'+esc(cap(w.def))+'.</p><p class="ruled">'+markEx(w.ex)+'</p>'
  +'<div class="acts"><button class="btn btn-ghost btn-sm" data-a="speak" data-t="'+esc(w.word)+'">'+ico("volume",16)+'Listen</button><button class="btn btn-ghost btn-sm" data-a="save" data-id="'+w.id+'">'+ico("bookmark",16)+(savedW?"Saved":"Save word")+'</button></div></div>'
  +'<div class="todo-box"><h3>Today</h3><ul style="list-style:none;margin:0;padding:0">'+todo1+todo2+todo3+todo4+'</ul></div></section>'
  +'<div class="numbers"><div class="num"><b>'+lc+'</b><span>Words learned</span></div><div class="num"><b>'+strong+'</b><span>Well known</span></div><div class="num"><b>'+due+'</b><span>Due now</span></div><div class="num"><b>'+store.cue.log.length+'</b><span>Cue card rounds</span></div><div class="num"><b>'+acc+'</b><span>Quiz accuracy</span></div></div>'
  +'<div class="sec-h"><h2>Vocabulary progress</h2><span class="mute small">'+LV[p.level].name+', band '+LV[p.level].band+'</span></div>'+rows
  +'</div><aside class="rail">'
  +'<div class="panel"><h4>Your goal</h4><div class="pair"><div><div class="big">'+Number(p.target).toFixed(1)+'</div><p class="mute small">Target band</p></div>'+examHTML+'</div><button class="btn btn-ghost btn-sm" style="margin-top:14px" data-a="settings">Edit goal</button></div>'
  +'<div class="panel"><h4>'+(sk?sk+"-day streak":"No streak yet")+'</h4><div class="week">'+wk+'</div><p class="mute small" style="margin-top:12px">'+(sk?"Learn a word, answer a question or do a cue card each day to keep it going.":"Learn a word or do a cue card today to start one.")+'</p></div>'
  +'<div class="panel"><h4>Cue card practice</h4><div class="pair"><div><div class="big">'+tried+'</div><p class="mute small">of '+BW.cueCards.length+' cards tried</p></div><div><div class="big">'+cueMin+'</div><p class="mute small">minutes speaking</p></div></div><a class="btn btn-ghost btn-sm" style="margin-top:14px" href="#cuecards" data-a="nav">Practise now</a></div>'
  +'</aside></div>';
}

function vTopic(id){
  const t=TMAP[id],tr=TRACK[t.track],l=store.profile.level,ws=WBYT[id][l];
  const k=ws.filter(w=>store.words[w.id]).length,fr=ws.length-k,n=Math.min(5,fr);
  return '<a class="back" href="#'+tr.area+'" data-a="nav">'+ico("left",16)+cap(tr.area)+'</a>'
  +'<div class="ph"><div><span class="chip hl" style="margin-bottom:12px">'+esc(tr.full)+'</span><h1>'+esc(t.name)+'</h1><p class="mute">'+esc(t.blurb||"")+' '+k+" of "+ws.length+' learned.</p></div><button class="btn btn-primary" data-a="learn" data-topic="'+id+'">'+(fr>0?"Learn "+n+" new "+pl(n,"word"):"Revise 5 words")+'</button></div>'
  +'<div class="tools">'+levelSeg()+'</div><div>'+ws.map(w=>wordRow(w)).join("")+'</div>';
}

function vReview(){
  const due=dueList().length,lc=learnedCount(),T=today();
  const counts=[0,0,0,0,0,0];let tomorrow=0,week=0;
  Object.keys(store.words).forEach(id=>{
    if(!WMAP[id])return;const w=store.words[id];counts[w.box]++;
    const n=daysBetween(T,w.due);if(n===1)tomorrow++;if(n>=1&&n<=7)week++;
  });
  const mx=Math.max.apply(null,counts.concat([1]));
  let left;
  if(!lc){
    left='<div class="empty" style="padding-top:0"><h3>Nothing to review yet</h3><p class="mute">Review starts once you have learned some words. Learn your first five, and they will show up here.</p><a class="btn btn-primary" href="#speaking" data-a="nav">Learn first words</a></div>';
  }else{
    left='<div class="due-big">'+due+'</div><p style="font-size:19px;margin-top:10px">'+(due?pl(due,"word")+" due now.":"words due now.")+'</p><p class="mute" style="margin-top:6px">'
      +(due?"Each session takes up to 10 words. A right answer pushes a word further out; a wrong one brings it back today.":"You are caught up. "+tomorrow+" "+pl(tomorrow,"word")+" come back tomorrow, "+week+" within the week.")+'</p>'
      +(due?'<button class="btn btn-primary" style="margin-top:20px" data-a="review">Start review of '+Math.min(due,10)+'</button>':'<a class="btn btn-ghost" style="margin-top:20px" href="#speaking" data-a="nav">Learn more words</a>');
  }
  const boxes=BOXES.map((b,i)=>'<div class="box"><div><b>'+b[0]+'</b><small>'+b[1]+'</small></div><div class="bar" role="img" aria-label="'+counts[i]+' words"><div style="width:'+(counts[i]/mx*100)+'%"></div></div><span class="c">'+counts[i]+'</span></div>').join("");
  return '<div class="ph"><div><h1>Review</h1><p class="mute">Words return just before you would forget them, so you spend time on the ones that need it.</p></div></div>'
  +'<div class="rv"><div>'+left+'</div><div><h2 style="margin-bottom:18px">Where your words sit</h2><div class="boxes">'+boxes+'</div></div></div>';
}

function vPhrases(){
  const tab=ui.ptab,sets=setsForTab(tab);
  const checked=PSETS.filter(s=>store.phr[s.id]).length;
  const tiles=sets.map(s=>{
    const r=store.phr[s.id];
    return '<a class="set" href="#set-'+s.id+'" data-a="nav"><div class="top"><span class="chip">'+kindLabel(s)+'</span><span class="chip '+(r?"hl":"")+'">'+(r?"Best "+r.best+" of 5":"Not checked")+'</span></div><h3>'+esc(s.name)+'</h3><p>'+s.list.slice(0,4).map(p=>esc(p.label)).join(", ")+'…</p><p class="small">Best for '+s.use+', '+s.list.length+' phrases</p></a>';
  }).join("");
  return '<div class="ph"><div><h1>Phrases</h1><p class="mute">Idioms, phrasal verbs and ready-made phrases for Speaking and Writing. Read a set, then check yourself with five questions.</p></div><div class="pstat"><div><b>'+PSETS.length+'</b><span>Sets</span></div><div><b>'+checked+'</b><span>Checked</span></div></div></div>'
  +'<div class="seg compact" role="group" aria-label="Phrase type">'+PTABS.map(t=>'<button class="'+(tab===t[0]?"on":"")+'" data-a="ptab" data-t="'+t[0]+'">'+t[1]+'</button>').join("")+'</div>'
  +'<p class="note">'+PNOTE[tab]+'</p><div class="sets">'+tiles+'</div>';
}

function vSet(id){
  const s=PSET[id],r=store.phr[id];
  return '<a class="back" href="#phrases" data-a="nav">'+ico("left",16)+'Phrases</a>'
  +'<div class="ph"><div><h1>'+esc(s.name)+'</h1><p class="mute">'+kindLabel(s)+', best for '+s.use+'. '+(r?"Your best score is "+r.best+" of 5.":"Read through, then check yourself.")+'</p></div><button class="btn btn-primary" data-a="checkset" data-id="'+id+'">Check yourself</button></div>'
  +'<p class="note" style="margin-top:-8px">'+PNOTE[s.kind==="useful"?(s.use==="Speaking"?"speaking":"writing"):s.kind]+'</p>'
  +s.list.map(p=>'<div class="phr"><div><h3>'+esc(p.label)+'</h3><button class="btn btn-ghost btn-sm" style="margin-top:10px" data-a="speak" data-t="'+esc(p.label)+'">'+ico("volume",16)+'Listen</button></div><div><p class="m">'+esc(cap(p.def))+'</p><p class="ruled" style="margin-top:8px">'+markEx(p.ex)+'</p></div></div>').join("");
}

function vWords(){
  const tab=ui.wtab;
  const learned=Object.keys(store.words).filter(id=>WMAP[id]).map(id=>WMAP[id]).sort((a,b)=>store.words[a.id].due.localeCompare(store.words[b.id].due)||a.word.localeCompare(b.word));
  const saved=store.saved.filter(id=>WMAP[id]).map(id=>WMAP[id]);
  const list=tab==="learned"?learned:saved;
  let body;
  if(!list.length){
    body=tab==="learned"
      ?'<div class="empty"><h3>No words learned yet</h3><p class="mute">Words appear here with their memory strength and next review date as soon as you learn them.</p><a class="btn btn-primary" href="#speaking" data-a="nav">Learn first words</a></div>'
      :'<div class="empty"><h3>Nothing saved yet</h3><p class="mute">Tap Save word on any entry to keep it here for quick revision.</p><a class="btn btn-ghost" href="#writing" data-a="nav">Browse writing vocabulary</a></div>';
  }else{
    body=list.map(w=>{
      const sw=store.words[w.id];
      let h=wordRow(w);
      if(sw&&tab==="learned"&&!ui.open[w.id])h=h.replace('</button></div>','</button><div class="small mute" style="padding:0 4px 12px;margin-top:-6px">'+TRACK[TMAP[w.topic].track].full+', '+dueText(w.id).toLowerCase()+'</div></div>');
      return h;
    }).join("");
  }
  return '<div class="ph"><div><h1>My words</h1><p class="mute">Everything you have learned or saved, with when each word is due back. Search finds any word in the app.</p></div></div>'
  +'<div class="tools"><div class="seg compact" role="group" aria-label="Word list"><button class="'+(tab==="learned"?"on":"")+'" data-a="wtab" data-t="learned">Learned ('+learned.length+')</button><button class="'+(tab==="saved"?"on":"")+'" data-a="wtab" data-t="saved">Saved ('+saved.length+')</button></div>'
  +'<label class="search">'+ico("search",18)+'<input data-bind="search" type="search" placeholder="Search any word or meaning" value="'+esc(ui.q)+'" aria-label="Search all words"></label></div>'
  +'<div id="results">'+searchResults()+'</div>'+body;
}

/* ============ session views ============ */
function vSession(){
  const s=session;
  const close='<button class="btn btn-ghost btn-sm" data-a="leave">'+ico("x",16)+'Exit</button>';
  if(s.phase==="study"){
    const w=s.items[s.step],last=s.step===s.items.length-1,saved=store.saved.indexOf(w.id)>=0;
    return '<div class="sess"><div class="sess-top"><div><b>'+esc(s.title)+'</b><div class="small mute">'+(s.newCount>=5?"Meet 5 new words":s.newCount>0?"Meet "+s.newCount+" new "+pl(s.newCount,"word")+" and revise "+(5-s.newCount):"Revise 5 words")+'</div></div>'+close+'</div>'
    +'<div class="segs" aria-label="Word '+(s.step+1)+' of '+s.items.length+'">'+s.items.map((_,k)=>'<i class="'+(k===s.step?"cur":k<s.step?"ok":"")+'"></i>').join("")+'</div>'
    +'<div class="card study" data-key="'+w.id+'"><div class="meta"><span class="chip">'+esc(TMAP[w.topic].name)+'</span><span class="chip">'+LV[w.level].name+'</span>'+(store.words[w.id]&&store.words[w.id].box>0?'<span class="chip hl">Revising</span>':"")+'</div>'
    +'<h2 class="hw"><mark>'+esc(w.word)+'</mark></h2><div><span class="pos">'+esc(w.pos)+'</span></div><p class="def">'+esc(cap(w.def))+'.</p><p class="ruled">'+markEx(w.ex)+'</p>'
    +'<div class="tags"><p><b>Similar:</b> '+esc(w.syn)+'</p><p><b>Often used with:</b> '+esc(w.col)+'</p></div>'
    +'<div class="acts" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" data-a="speak" data-t="'+esc(w.word)+'">'+ico("volume",16)+'Listen</button><button class="btn btn-ghost btn-sm" data-a="save" data-id="'+w.id+'">'+ico("bookmark",16)+(saved?"Saved":"Save word")+'</button></div></div>'
    +'<div class="nav-row"><button class="btn btn-ghost" data-a="prev" '+(s.step===0?"disabled":"")+'>'+ico("left",16)+'Previous</button>'
    +(last?'<button class="btn btn-primary" data-a="startquiz">Start the quiz</button>':'<button class="btn btn-ink" data-a="nextword">Next word'+ico("right",16)+'</button>')+'</div></div>';
  }
  if(s.phase==="quiz"){
    const q=s.qs[s.i],answered=s.picked!==null,ok=answered&&s.picked===q.answer,last=s.i===s.qs.length-1;
    let h='<div class="sess"><div class="sess-top"><div><b>'+esc(s.title)+'</b><div class="small mute">Question '+(s.i+1)+' of '+s.qs.length+'</div></div>'+close+'</div>'
    +'<div class="segs">'+s.qs.map((_,k)=>'<i class="'+(k<s.answers.length?(s.answers[k].ok?"ok":"no"):k===s.i?"cur":"")+'"></i>').join("")+'</div>'
    +'<div class="card"><p class="q">'+q.prompt+'</p>'+(q.sub?'<p class="q-sub">'+esc(q.sub)+'</p>':"")+(q.sentence?'<p class="ruled" style="margin-top:14px;font-size:22px">'+q.sentence+'</p>':"")
    +'<div class="opts" role="group" aria-label="Answer options">'+q.options.map((o,k)=>{
      let c="opt";if(answered){if(k===q.answer)c+=" correct";else if(k===s.picked)c+=" wrong";}
      return '<button class="'+c+'" data-a="answer" data-i="'+k+'" '+(answered?'aria-disabled="true"':"")+'><span class="key">'+(k+1)+'</span><span>'+esc(o)+'</span></button>';
    }).join("")+'</div>';
    if(answered){
      const it=q.item;
      h+='<div class="fb '+(ok?"good":"bad")+'" aria-live="polite"><strong>'+(ok?"Correct.":"Not quite. The answer is “"+esc(it.label)+"”.")+'</strong><div class="ent"><b>'+esc(it.label)+'</b>'+(it.pos?' <span class="pos">'+esc(it.pos)+'</span>':"")+': '+esc(it.def)+'.</div><div class="ruled">'+markEx(it.ex)+'</div></div>'
      +'<div class="nav-row"><span></span><button class="btn btn-primary" id="nextBtn" data-a="nextq">'+(last?"See results":"Next question")+'</button></div>';
    }
    return h+'</div></div>';
  }
  // done
  const n=s.answers.filter(a=>a.ok).length,tot=s.answers.length;
  let msg;
  if(s.mode==="phrase")msg=n===tot?"Every phrase right. Try using two of them in your next answer.":"Read the set once more, then check yourself again.";
  else msg=n===tot?"A clean round. These words will come back for review on schedule.":n>=tot*.6?"Solid. The words you missed are due again today.":"These need another pass. The missed words are due again today.";
  const more=s.mode==="review"&&dueList().length>0;
  let acts;
  if(s.mode==="learn")acts='<button class="btn btn-primary" data-a="learn" data-topic="'+s.topic+'">Learn more words</button><a class="btn btn-ghost" href="'+s.back+'" data-a="nav">Back to '+esc(s.backLabel.toLowerCase())+'</a>';
  else if(s.mode==="review")acts=(more?'<button class="btn btn-primary" data-a="review">Review more</button>':"")+'<a class="btn btn-ghost" href="#today" data-a="nav">Back to today</a>';
  else acts='<button class="btn btn-primary" data-a="checkset" data-id="'+s.set+'">Check again</button><a class="btn btn-ghost" href="'+s.back+'" data-a="nav">Back to set</a>';
  return '<div class="sess"><div class="sess-top"><b>'+esc(s.title)+'</b><span></span></div><div class="card"><div class="score">'+n+'<span class="mute" style="font-size:.45em;letter-spacing:0"> of '+tot+'</span></div><p style="font-size:19px;margin-top:12px;max-width:44ch">'+msg+'</p>'
  +'<div class="rlist">'+s.answers.map(a=>'<div class="rl"><span class="st '+(a.ok?"ok":"no")+'">'+ico(a.ok?"check":"x",13)+'</span><div><b>'+esc(a.item.label)+'</b><p>'+esc(cap(a.item.def))+'</p></div><span class="small mute">'+(a.ok?"Right":"Missed")+'</span></div>').join("")+'</div>'
  +'<div class="nav-row" style="justify-content:flex-start;gap:10px">'+acts+'</div></div></div>';
}

/* ============ chrome ============ */
const LOGO_HTML='<a class="logo" href="#today" data-a="nav" aria-label="IELTS Prepsite home"><img class="lg lt" src="assets/logo.png" alt="IELTS Prepsite"><img class="lg dk" src="assets/logo-dark.png" alt="" aria-hidden="true"></a>';
const NAV=[["today","Today","home"],["speaking","Speaking","mic"],["writing","Writing","pen"],["cuecards","Cue cards","timer"],["builder","Sentence builder","blocks"],["review","Review","refresh"],["phrases","Phrases","quote"],["words","My words","bookmark"]];
const NAVSHORT={today:"Today",speaking:"Speaking",writing:"Writing",cuecards:"Cue cards",builder:"Builder",review:"Review",phrases:"Phrases",words:"My words"};
const ROUTES={today:vToday,speaking:vSpeaking,writing:vWriting,review:vReview,phrases:vPhrases,words:vWords,topic:r=>vTopic(r.arg),set:r=>vSet(r.arg)};
function parseHash(){
  const h=location.hash.slice(1)||"today";
  const i=h.indexOf("-"),n=i<0?h:h.slice(0,i),arg=i<0?"":h.slice(i+1);
  if(n==="topic"&&TMAP[arg])return{name:"topic",arg:arg};
  if(n==="set"&&PSET[arg])return{name:"set",arg:arg};
  if(!arg&&(ROUTES[h]||BW.views[h]))return{name:h};
  return{name:"today"};
}
function activeNav(r){
  if(r.name==="topic")return TRACK[TMAP[r.arg].track].area;
  if(r.name==="set")return"phrases";
  if(r.name==="guides")return"writing";
  return r.name;
}
function renderChrome(r){
  const cur=activeNav(r),due=dueList().length,p=store.profile,sk=streak();
  const initial=(p.name||"B").trim().charAt(0).toUpperCase();
  const link=(n,size,cls)=>'<a href="#'+n[0]+'" data-a="nav" class="'+(cur===n[0]?"on":"")+'" '+(cur===n[0]?'aria-current="page"':"")+'>'+ico(n[2],size)+(cls?NAVSHORT[n[0]]:n[1])+(n[0]==="review"&&due?'<span class="badge">'+due+'</span>':"")+'</a>';
  $("#side").innerHTML=LOGO_HTML+'<nav class="nav">'+NAV.map(n=>link(n,19,false)).join("")+'</nav>'
    +'<div class="side-foot"><div class="streak">'+ico("flame",19)+'<span>'+(sk?sk+"-day streak":"Start a streak today")+'</span></div>'
    +'<div class="me"><span class="avatar">'+esc(initial)+'</span><div style="flex:1;min-width:0"><b>'+esc(p.name||"Learner")+'</b><small>Target band '+Number(p.target).toFixed(1)+'</small></div>'
    +'<button class="icon-btn" data-a="theme" aria-label="Switch between light and dark">'+ico(isDark()?"sun":"moon",18)+'</button><button class="icon-btn" data-a="settings" aria-label="Settings">'+ico("sliders",18)+'</button></div></div>';
  $("#topbar").innerHTML=LOGO_HTML+'<div style="display:flex;gap:4px"><button class="icon-btn" data-a="theme" aria-label="Switch between light and dark">'+ico(isDark()?"sun":"moon",20)+'</button><button class="icon-btn" data-a="settings" aria-label="Settings">'+ico("sliders",20)+'</button></div>';
  $("#tabbar").innerHTML=NAV.map(n=>link(n,22,true)).join("");
}
function modalHTML(){
  const p=store.profile,first=ui.modal==="first";
  const bands=[5.5,6,6.5,7,7.5,8,8.5,9].map(b=>'<option value="'+b+'" '+(Number(p.target)===b?"selected":"")+'>Band '+b.toFixed(1)+'</option>').join("");
  const focus=[["both","Speaking and Writing"],["speaking","Speaking first"],["writing","Writing first"]].map(o=>'<option value="'+o[0]+'" '+(p.focus===o[0]?"selected":"")+'>'+o[1]+'</option>').join("");
  let h='<div class="scrim" data-a="closeModal"><div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlgT"><h2 id="dlgT">'+(first?"Set your target":"Study settings")+'</h2>'
  +'<p class="mute">'+(first?"Pick a band and we’ll match the words to it. You can change this any time.":"Changes apply straight away.")+'</p>'
  +'<label class="fld"><span>Your name</span><input id="fName" value="'+esc(p.name)+'" maxlength="30" autocomplete="given-name" placeholder="What should we call you?"></label>'
  +'<label class="fld"><span>Target band</span><select id="fBand">'+bands+'</select></label>'
  +'<label class="fld"><span>Focus for new words</span><select id="fFocus">'+focus+'</select></label>'
  +'<label class="fld"><span>Exam date (optional)</span><input id="fExam" type="date" value="'+esc(p.exam)+'"></label>';
  if(!first){
    h+='<div class="fld"><span>Appearance</span><div class="seg compact" role="group" aria-label="Appearance">'+[["auto","Auto"],["light","Light"],["dark","Dark"]].map(o=>'<button class="'+((store.theme||"auto")===o[0]?"on":"")+'" data-a="themepick" data-v="'+o[0]+'">'+o[1]+'</button>').join("")+'</div></div><hr>'
    +(ui.confirmReset?'<p><b>Erase all progress, saved words, sentences and streaks?</b> This cannot be undone.</p><div class="row"><button class="btn btn-danger solid" data-a="reset2">Yes, erase everything</button><button class="btn btn-ghost" data-a="reset0">Keep my progress</button></div>':'<button class="btn btn-danger btn-sm" style="justify-self:start" data-a="reset1">Reset all progress</button>');
  }
  h+='<div class="row" style="margin-top:4px"><button class="btn btn-primary" data-a="saveprofile">'+(first?"Start learning":"Save changes")+'</button>'+(first?"":'<button class="btn btn-ghost" data-a="closeModal">Close</button>')+'</div></div></div>';
  return h;
}
function renderModal(){
  const m=$("#modal");
  m.innerHTML=ui.modal?modalHTML():"";
  if(ui.modal){const f=$("#fName");if(f&&!ui.confirmReset)f.focus();}
}
function render(scroll){
  const r=parseHash();
  renderChrome(r);
  let html;
  if(session)html=vSession();
  else{const f=ROUTES[r.name]||BW.views[r.name];html=f?f(r):vToday();}
  $("#view").innerHTML=html;
  BW.after.forEach(f=>{try{f(r);}catch(e){}});
  if(scroll)window.scrollTo(0,0);
}

/* ============ actions ============ */
const A={
  nav(){if(session){session=null;render(true);}},
  theme(){store.theme=isDark()?"light":"dark";applyTheme();persist();render();},
  themepick(d){store.theme=d.v==="auto"?null:d.v;applyTheme();persist();renderChrome(parseHash());renderModal();},
  settings(){ui.modal="settings";ui.confirmReset=false;renderModal();},
  closeModal(d,t,e){if(e.target!==t)return;closeModal();},
  saveprofile(){
    const p=store.profile;
    p.name=($("#fName").value||"").trim();
    p.target=parseFloat($("#fBand").value)||7;
    p.exam=$("#fExam").value||"";
    p.focus=$("#fFocus").value||"both";
    p.level=p.target>=7?"adv":"inter";
    p.done=true;persist();closeModal();render(true);toast("Saved");
  },
  reset1(){ui.confirmReset=true;renderModal();},
  reset0(){ui.confirmReset=false;renderModal();},
  reset2(){const th=store.theme;Object.keys(store).forEach(k=>{delete store[k];});Object.assign(store,fresh());store.theme=th;store.profile.done=true;persist();ui.modal=null;ui.confirmReset=false;ui.open={};session=null;renderModal();render(true);toast("Progress erased");},
  level(d){store.profile.level=d.lv;persist();render();},
  toggle(d){ui.open[d.id]=!ui.open[d.id];render();},
  save(d){
    const i=store.saved.indexOf(d.id);
    if(i>=0){store.saved.splice(i,1);toast("Removed from saved");}
    else{store.saved.push(d.id);toast("Saved “"+WMAP[d.id].word+"”");}
    persist();render();
  },
  speak(d){speak(d.t);},
  learn(d){startLearn(d.topic);},
  review(){startReview();},
  checkset(d){startPhrase(d.id);},
  ptab(d){ui.ptab=d.t;render();},
  wtab(d){ui.wtab=d.t;render();},
  prev(){if(session.step>0){session.step--;render();}},
  nextword(){if(session.step<session.items.length-1){session.step++;render();}},
  startquiz(){
    const s=session;
    s.qs=buildQs(s.items,WORDS.filter(w=>w.level===s.level));
    s.phase="quiz";s.i=0;s.picked=null;s.answers=[];render(true);
  },
  answer(d){answer(parseInt(d.i,10));},
  nextq(){nextQ();},
  leave(){leaveSession();}
};
function closeModal(){
  if(ui.modal==="first"){store.profile.done=true;persist();}
  ui.modal=null;ui.confirmReset=false;renderModal();
}
Object.assign(A,BW.actions);
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-a]");if(!t)return;
  const fn=A[t.dataset.a];if(fn)fn(t.dataset,t,e);
});
BW.bind.search=v=>{ui.q=v;const r=$("#results");if(r)r.innerHTML=searchResults();};
document.addEventListener("input",e=>{
  const b=e.target.dataset&&e.target.dataset.bind;
  if(b&&BW.bind[b])BW.bind[b](e.target.value,e.target);
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&ui.modal){closeModal();return;}
  if(ui.modal||!session||session.phase!=="quiz"||session.picked!==null)return;
  if(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
  const n=parseInt(e.key,10);
  if(n>=1&&n<=4&&n<=session.qs[session.i].options.length)answer(n-1);
});
window.addEventListener("hashchange",()=>{BW.leave.forEach(f=>{try{f();}catch(e){}});session=null;render(true);});

/* ============ shared API for feature modules ============ */
BW.h={$:$,esc:esc,cap:cap,pl:pl,shuffle:shuffle,ico:ico,today:today,addDays:addDays,daysBetween:daysBetween,store:store,persist:persist,render:render,toast:toast,speak:speak,
  levelSeg:levelSeg,wordRow:wordRow,markEx:markEx,blankEx:blankEx,hasWord:hasWord,logAct:logAct,ui:ui,A:A,
  WORDS:WORDS,WMAP:WMAP,TMAP:TMAP,TOPICS:TOPICS,TRACKS:TRACKS,TRACK:TRACK,LV:LV,PSETS:PSETS,PSET:PSET};

/* ============ init ============ */
applyTheme();
try{if(!location.hash)history.replaceState(null,"","#today");}catch(e){}
render();
if(!store.profile.done){ui.modal="first";renderModal();}
})();
