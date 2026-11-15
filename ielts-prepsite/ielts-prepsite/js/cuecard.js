/* Cue card trainer: 1 minute to prepare, 2 minutes to speak.
   Optional extras: record yourself, and (in Chrome or Edge) get a transcript with a quick analysis. */
(function(){
"use strict";
const BW=window.BW;
const H=()=>BW.h;
const PREP=60,TALK=120,CIRC=2*Math.PI*52;

const CATS=[["all","All cards"],["person","Person"],["place","Place"],["object","Object"],["event","Event"],["experience","Experience"],["hobby","Hobby and media"]];
const CATLABEL={person:"Person",place:"Place",object:"Object",event:"Event",experience:"Experience",hobby:"Hobby and media",custom:"Your card"};
const CAT_TOPIC={person:"sp2people",place:"sp2places",object:"sp2objects",event:"sp2events",experience:"sp2experiences",hobby:"sp2hobbies",custom:"sp2experiences"};
const THINK={
  person:["Who they are and how you know them","Two details: looks, habits, something they often say","A short story that shows their character","How they changed you, or what you learned"],
  place:["Where it is and when you were there","What you could see, hear and smell","What you did, and who was with you","Why it stays in your memory"],
  object:["What it is and what it looks like","Where it came from and how long you have had it","How you use it, with one real example","What it means to you personally"],
  event:["When and where it happened","Who was involved and what was going on","What happened, step by step","How you felt, and what you took from it"],
  experience:["When and where, in one sentence","What led up to it","What happened and how it ended","What you learned or would do differently"],
  hobby:["What it is, in one sentence","When you first came across it","What you do, or what happens, with one detail","Why it appeals to you"]
};
THINK.custom=THINK.experience;
const FRAMES=[
  ["Opening",["I’d like to talk about…","The … I’m going to describe is…","One … that really stands out for me is…"]],
  ["Moving on",["To begin with,","What happened next was…","On top of that,","Another thing worth mentioning is…"]],
  ["Extending",["To give you an example,","What I mean is…","Funnily enough,"]],
  ["Explaining why",["The reason it matters to me is…","What makes it so special is…","Looking back, I’d say…"]],
  ["Closing",["All in all, …","That’s why I’ll always remember…","So, that’s a brief description of…"]]
];
// Where each part of a two-minute answer sits (seconds)
const STAGES=[["Open",0,10],["Bullet 1",10,35],["Bullet 2",35,60],["Bullet 3",60,85],["Explain why",85,115],["Wrap up",115,120]];
const CHECKS=[
  "I covered every bullet on the card.",
  "I explained why it mattered to me.",
  "I kept going for the full two minutes.",
  "I used at least three linking phrases.",
  "I used at least three topic words from my vocabulary.",
  "My tenses stayed consistent (past for a memory, present for a habit)."
];
const STOP=new Set("the a an and or but so to of in on at for with is are was were be been i you he she it we they my me this that these those very really just not do did does have has had as by from up out about into than then there their them our us can could would will if when what which who also more most some any one get got went make made".split(" "));
const BASIC=["and","as","so","if","when","but"];

const cue={phase:"choose",cat:"all",id:null,customText:"",custom:null,mode:"full",support:"guided",wantRec:false,wantTr:false,
  notes:"",card:null,timer:null,end:0,total:0,done:null,stage:-1,final:"",secUsed:0,blob:null,audioUrl:null,checks:{},showPlan:false,micErr:"",
  mr:null,sr:null,stream:null,chunks:[],ac:null};

const canRec=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
const canTr=()=>!!(window.SpeechRecognition||window.webkitSpeechRecognition);
const prefs=()=>H().store.cue.prefs;

/* ---------- cards ---------- */
function curCard(){
  if(cue.id==="custom")return cue.custom;
  return BW.cueCards.find(c=>c.id===cue.id)||null;
}
function parseCustom(text){
  const lines=String(text).split(/\n+/).map(s=>s.trim()).filter(Boolean);
  if(!lines.length)return null;
  const bullets=lines.slice(1).filter(l=>/^[-•*]/.test(l)).map(l=>l.replace(/^[-•*]\s*/,""));
  const whyLine=lines.slice(1).filter(l=>/^(and\s+)?explain/i.test(l)).pop();
  return{id:"custom",cat:"custom",q:lines[0],b:(bullets.length?bullets:["what it is","when it happened","what you did"]).slice(0,3),
    why:(whyLine||"explain why it matters to you.").replace(/^and\s+/i,""),plan:""};
}
function topicWords(c){
  const H0=H(),t=H0.TMAP[CAT_TOPIC[c.cat]||"sp2experiences"];
  if(!t)return[];
  const lv=H0.store.profile.level;
  return t[lv].slice(0,6).map(a=>({w:a[0],d:a[2]}));
}

/* ---------- timers and sound ---------- */
const mmss=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
const left=()=>Math.max(0,Math.ceil((cue.end-Date.now())/1000));
function clearTimer(){if(cue.timer){clearInterval(cue.timer);cue.timer=null;}}
function startTimer(sec,done){
  clearTimer();cue.total=sec;cue.end=Date.now()+sec*1000;cue.done=done;cue.stage=-1;
  cue.timer=setInterval(tick,200);tick();
}
function beep(f,d){
  try{
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    const c=cue.ac||(cue.ac=new C()),o=c.createOscillator(),g=c.createGain();
    o.frequency.value=f||880;g.gain.value=.08;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+(d||.18));
  }catch(e){}
}
function stageIdx(el){for(let i=STAGES.length-1;i>=0;i--)if(el>=STAGES[i][1])return i;return 0;}
function stageText(i,c){
  return[["Open","Name the topic in one sentence, then move on."],["Bullet 1",c.b[0]],["Bullet 2",c.b[1]],["Bullet 3",c.b[2]],["Explain why",c.why],["Wrap up","Finish with one short closing line."]][i];
}
function paintStage(elapsed,silent){
  const i=stageIdx(elapsed);
  if(i===cue.stage)return;
  cue.stage=i;
  document.querySelectorAll(".pace i").forEach((s,k)=>{s.classList.toggle("on",k===i);s.classList.toggle("past",k<i);});
  const t=stageText(i,cue.card),n=document.getElementById("cueStage"),x=document.getElementById("cueHint");
  if(n)n.textContent=t[0];if(x)x.textContent=t[1];
  if(i>0&&!silent)beep(520,.08);
}
function tick(silent){
  const l=left(),el=document.getElementById("cueTime");
  if(el&&el.textContent!==mmss(l))el.textContent=mmss(l);
  const ring=document.getElementById("cueRing");
  if(ring)ring.style.strokeDashoffset=String(CIRC*(1-l/cue.total));
  if(cue.phase==="speak"&&cue.support!=="exam")paintStage(cue.total-l,silent);
  if(l<=0){clearTimer();if(cue.done)cue.done();}
}

/* ---------- microphone, recording, transcript ---------- */
function releaseStream(){if(cue.stream){cue.stream.getTracks().forEach(t=>t.stop());cue.stream=null;}}
async function getMic(){
  cue.micErr="";
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:true});
    if(cue.wantRec)cue.stream=s;else s.getTracks().forEach(t=>t.stop());
  }catch(e){
    cue.micErr="Microphone access was blocked, so recording and transcript are off for this round.";
    cue.wantRec=false;cue.wantTr=false;
  }
}
function startCapture(){
  if(cue.wantRec&&cue.stream&&window.MediaRecorder){
    try{
      cue.chunks=[];
      const mr=new MediaRecorder(cue.stream);
      mr.ondataavailable=e=>{if(e.data&&e.data.size)cue.chunks.push(e.data);};
      mr.onstop=()=>{
        if(cue.chunks.length){cue.blob=new Blob(cue.chunks,{type:mr.mimeType||"audio/webm"});cue.audioUrl=URL.createObjectURL(cue.blob);}
        releaseStream();if(cue.phase==="review")H().render();
      };
      mr.start();cue.mr=mr;
    }catch(e){cue.mr=null;}
  }
  if(cue.wantTr){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(SR){
      try{
        const sr=new SR();sr.lang="en-GB";sr.continuous=true;sr.interimResults=false;
        sr.onresult=ev=>{for(let i=ev.resultIndex;i<ev.results.length;i++){if(ev.results[i].isFinal)cue.final+=ev.results[i][0].transcript+" ";}};
        sr.onend=()=>{
          if(cue.phase==="speak"&&cue.sr===sr){try{sr.start();}catch(e){}}
          else if(cue.phase==="review")H().render();
        };
        sr.onerror=()=>{};
        sr.start();cue.sr=sr;
      }catch(e){cue.sr=null;}
    }
  }
}
function stopCapture(){
  const sr=cue.sr;cue.sr=null;
  if(sr){try{sr.stop();}catch(e){}}
  if(cue.mr&&cue.mr.state!=="inactive"){try{cue.mr.stop();}catch(e){}}else releaseStream();
}

/* ---------- flow ---------- */
async function begin(){
  const c=curCard();if(!c)return;
  cue.card=c;cue.notes="";cue.final="";cue.blob=null;cue.audioUrl=null;cue.checks={};cue.secUsed=0;cue.showPlan=false;cue.stage=-1;
  if(cue.wantRec||cue.wantTr)await getMic();
  cue.phase="prep";H().render(true);
  startTimer(PREP,endPrep);
}
function endPrep(){
  clearTimer();
  if(cue.mode==="drill"){finishDrill();return;}
  beep(880,.25);
  cue.phase="speak";H().render(true);
  startCapture();
  startTimer(TALK,finishSpeak);
}
function finishSpeak(){
  if(cue.phase!=="speak")return;
  const used=cue.total-left();
  clearTimer();cue.secUsed=Math.min(TALK,Math.max(0,used));
  cue.phase="review";stopCapture();beep(660,.25);
  record();H().render(true);
}
function finishDrill(){
  clearTimer();cue.secUsed=0;cue.phase="review";cue.showPlan=true;record();H().render(true);
}
function record(){
  const s=H().store,c=cue.card;
  s.cue.log.unshift({d:H().today(),id:c.id,q:c.q,sec:cue.secUsed,mode:cue.mode,support:cue.support});
  s.cue.log=s.cue.log.slice(0,60);
  s.cue.done[c.id]=(s.cue.done[c.id]||0)+1;
  H().logAct("cue",1);H().persist();
}
function exit(){
  clearTimer();stopCapture();releaseStream();cue.phase="choose";H().render(true);
}
BW.leave.push(()=>{
  if(cue.phase==="prep"||cue.phase==="speak"){clearTimer();stopCapture();releaseStream();cue.phase="choose";}
});
BW.after.push(()=>{if((cue.phase==="prep"||cue.phase==="speak")&&cue.timer){cue.stage=-1;tick(true);}});

/* ---------- analysis ---------- */
function analyse(text,sec,card){
  const H0=H(),toks=(text.toLowerCase().match(/[a-z’']+/g)||[]),words=toks.length;
  const wpm=sec>10?Math.round(words/(sec/60)):0;
  const low=" "+text.toLowerCase().replace(/[^a-z’' ]/g," ").replace(/\s+/g," ")+" ";
  const found=[],seen={};
  BW.connectors.forEach(g=>g.items.forEach(a=>{
    const c=a[0].toLowerCase();
    if(c.indexOf("…")>=0||BASIC.indexOf(c)>=0||seen[c])return;
    seen[c]=1;let n=0,i=-1;const key=" "+c+" ";
    while((i=low.indexOf(key,i+1))>=0)n++;
    if(n)found.push([c,n]);
  }));
  H0.PSETS.filter(ps=>ps.kind==="useful").forEach(ps=>ps.list.forEach(p=>{
    const c=p.label.toLowerCase().replace(/[^a-z’' ]/g,"");
    if(c.indexOf(" ")<0||seen[c])return;
    seen[c]=1;let n=0,i=-1;const key=" "+c+" ";
    while((i=low.indexOf(key,i+1))>=0)n++;
    if(n)found.push([c,n]);
  }));
  const mapped=CAT_TOPIC[card.cat]||"sp2experiences",used=[];
  H0.WORDS.forEach(w=>{
    if((H0.store.words[w.id]||w.topic===mapped)&&H0.hasWord(text,w.word))used.push(w.word);
  });
  const counts={};
  toks.forEach(t=>{if(t.length>3&&!STOP.has(t))counts[t]=(counts[t]||0)+1;});
  const rep=Object.keys(counts).filter(k=>counts[k]>=4).sort((a,b)=>counts[b]-counts[a]).slice(0,4).map(k=>[k,counts[k]]);
  return{words:words,wpm:wpm,found:found,used:used.slice(0,12),rep:rep};
}

/* ---------- views ---------- */
function cardHTML(c){
  return '<div class="cuecard"><p class="cc-q">'+H().esc(c.q)+'</p><p class="cc-s">You should say:</p><ul>'+c.b.map(b=>'<li>'+H().esc(b)+'</li>').join("")+'</ul><p class="cc-w">and '+H().esc(c.why)+'</p></div>';
}
function supportSeg(){
  return '<div class="seg compact" role="group" aria-label="Support level">'+[["guided","Guided"],["light","Light"],["exam","Exam"]].map(o=>'<button class="'+(cue.support===o[0]?"on":"")+'" data-a="cuesupport" data-v="'+o[0]+'">'+o[1]+'</button>').join("")+'</div>';
}
function helperHTML(c){
  const e=H().esc;
  if(cue.support==="exam")return'<div class="panel"><h4>Exam mode</h4><p class="mute small">Only the card, the notes box and the clock, just like the test.</p></div>';
  const words=topicWords(c);
  let h='<div class="panel helper"><h4>Words you could use</h4><div class="wchips">'+words.map(x=>'<span class="wchip" title="'+e(x.d)+'"><b>'+e(x.w)+'</b>'+(cue.support==="guided"?'<small>'+e(x.d)+'</small>':"")+'</span>').join("")+'</div></div>';
  if(cue.support==="guided"){
    const th=THINK[c.cat]||THINK.custom;
    h+='<div class="panel helper"><h4>Plan it in 60 seconds</h4><ol class="think"><li><b>0 to 10 seconds.</b> Pick one real memory. Do not invent from scratch.</li><li><b>10 to 45 seconds.</b> One keyword and one detail per bullet. Think: '+e(th[0].toLowerCase())+'; '+e(th[1].toLowerCase())+'; '+e(th[2].toLowerCase())+'.</li><li><b>45 to 60 seconds.</b> Note one feeling word and your reason: '+e(th[3].toLowerCase())+'.</li></ol></div>';
    h+='<div class="panel helper"><h4>Sentence starters</h4>'+FRAMES.map(f=>'<p class="small"><b>'+e(f[0])+':</b> '+f[1].map(e).join("   ")+'</p>').join("")+'</div>';
  }
  return h;
}
function vChoose(){
  const e=H().esc,s=H().store,done=s.cue.done,log=s.cue.log;
  const all=BW.cueCards,list=all.filter(c=>cue.cat==="all"||c.cat===cue.cat);
  const sel=curCard();
  const minutes=Math.round(log.reduce((a,x)=>a+(x.sec||0),0)/60);
  const rows=list.map(c=>'<button class="cc-row'+(cue.id===c.id?" sel":"")+'" data-a="cuepick" data-id="'+c.id+'"><span class="cc-t">'+e(c.q)+'</span><span class="cc-m"><span class="chip">'+CATLABEL[c.cat]+'</span>'+(done[c.id]?'<span class="chip hl">Done '+done[c.id]+'×</span>':"")+'</span></button>').join("");
  const rec=canRec(),tr=canTr();
  const side='<aside class="cue-side"><div class="panel"><h4>'+(sel?"Your card":"Choose a card")+'</h4>'+(sel?cardHTML(sel):'<p class="mute small">Pick a card from the list, or press Random card.</p>')
   +'<div class="fld" style="margin-top:16px"><span>Mode</span><div class="seg compact" role="group" aria-label="Mode"><button class="'+(cue.mode==="full"?"on":"")+'" data-a="cuemode" data-v="full">Full practice</button><button class="'+(cue.mode==="drill"?"on":"")+'" data-a="cuemode" data-v="drill">Planning drill</button></div></div>'
   +'<p class="small mute" style="margin:6px 0 12px">'+(cue.mode==="full"?"One minute to plan, then two minutes to speak, like the real test.":"Only the one-minute planning, then compare with a sample plan. Quick and low pressure.")+'</p>'
   +'<div class="fld"><span>Support</span>'+supportSeg()+'</div>'
   +'<p class="small mute" style="margin:6px 0 12px">'+(cue.support==="guided"?"Prompts, words and starters on screen. Start here.":cue.support==="light"?"Topic words only. Move here once guided feels easy.":"Card and notes only. Your goal.")+'</p>'
   +(cue.mode==="full"?'<label class="tog'+(rec?"":" off")+'"><input type="checkbox" data-a="cuetoggle" data-k="wantRec" '+(cue.wantRec&&rec?"checked":"")+' '+(rec?"":"disabled")+'><span>Record my answer<small>'+(rec?"Stays on your device. You can play it back.":"Not supported in this browser.")+'</small></span></label>'
   +'<label class="tog'+(tr?"":" off")+'"><input type="checkbox" data-a="cuetoggle" data-k="wantTr" '+(cue.wantTr&&tr?"checked":"")+' '+(tr?"":"disabled")+'><span>Transcript and analysis<small>'+(tr?"Chrome and Edge send audio to their speech service to transcribe it.":"Works in Chrome or Edge.")+'</small></span></label>':"")
   +(cue.micErr?'<p class="small" style="color:var(--bad)">'+e(cue.micErr)+'</p>':"")
   +'<div class="row" style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" data-a="cuestart" '+(sel?"":"disabled")+'>'+(cue.mode==="full"?"Start: 1 minute to plan":"Start planning drill")+'</button><button class="btn btn-ghost" data-a="cuerandom">Random card</button></div></div>'
   +'<div class="panel"><h4>Your practice</h4><div class="pair"><div><div class="big">'+log.length+'</div><p class="mute small">rounds</p></div><div><div class="big">'+Object.keys(done).length+'</div><p class="mute small">of '+all.length+' cards tried</p></div></div><p class="mute small" style="margin-top:10px">'+minutes+" "+H().pl(minutes,"minute")+' of speaking so far.</p>'
   +(log.length?'<ul class="cc-log">'+log.slice(0,4).map(x=>'<li><span>'+e(x.q.replace(/^Describe /,"").replace(/\.$/,""))+'</span><small>'+(x.mode==="drill"?"drill":H().ico("timer",12)+" "+mmss(x.sec))+'</small></li>').join("")+'</ul>':"")+'</div></aside>';
  return '<div class="ph"><div><h1>Cue card practice</h1><p class="mute">The real test gives you one minute to plan and two minutes to talk. Train that exact routine, with support you can remove as you improve.</p></div></div>'
   +'<div class="cue-grid"><section><div class="seg compact" role="group" aria-label="Card type" style="margin-bottom:16px">'+CATS.map(c=>'<button class="'+(cue.cat===c[0]?"on":"")+'" data-a="cuecat" data-v="'+c[0]+'">'+c[1]+'</button>').join("")+'</div>'
   +'<div class="cc-list">'+rows+'</div>'
   +'<details class="custom"'+(cue.id==="custom"?" open":"")+'><summary>Use your own cue card</summary><p class="small mute" style="margin:8px 0">Type or paste a card. First line is the topic, then one bullet per line starting with a dash, then “and explain…”.</p><textarea data-bind="cuecustom" rows="6" placeholder="Describe a place you would like to visit again.\n- where it is\n- when you went there\n- what you did there\nand explain why you would like to go back.">'+e(cue.customText)+'</textarea><button class="btn btn-ghost btn-sm" style="margin-top:8px" data-a="cuecustom">Use this card</button></details></section>'+side+'</div>';
}
function timerHTML(label,showSkip){
  return '<div class="timer"><div class="ringwrap"><svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle class="rb" cx="60" cy="60" r="52"/><circle class="rf" id="cueRing" cx="60" cy="60" r="52" style="stroke-dasharray:'+CIRC.toFixed(1)+';stroke-dashoffset:'+(CIRC*(1-left()/cue.total)).toFixed(1)+'"/></svg><div class="tdigits"><span id="cueTime" aria-live="off">'+mmss(left())+'</span><small>'+label+'</small></div></div></div>';
}
function vPrep(){
  const c=cue.card,e=H().esc;
  return '<div class="cue-run"><div class="sess-top"><div><b>Preparation</b><div class="small mute">'+(cue.mode==="drill"?"Planning drill":"Speaking starts automatically at zero")+'</div></div><button class="btn btn-ghost btn-sm" data-a="cueexit">'+H().ico("x",16)+'Exit</button></div>'
   +'<div class="run-grid"><div>'+timerHTML("to plan")+'<div class="row" style="display:flex;gap:8px;justify-content:center;margin:14px 0 4px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" data-a="cueskip">'+(cue.mode==="drill"?"Finish planning":"I’m ready, start speaking")+'</button></div></div>'
   +'<div>'+cardHTML(c)+'<label class="fld" style="margin-top:14px"><span>Your notes (keywords, not sentences)</span><textarea id="cueNotes" data-bind="cuenotes" rows="6" placeholder="open: …\nbullet 1: …\nbullet 2: …\nbullet 3: …\nwhy: …">'+e(cue.notes)+'</textarea></label><div class="seg compact" style="margin-top:10px" role="group" aria-label="Support level">'+['guided','light','exam'].map(v=>'<button class="'+(cue.support===v?"on":"")+'" data-a="cuesupport" data-v="'+v+'">'+cap(v)+'</button>').join("")+'</div></div></div>'
   +'<div class="helpers">'+helperHTML(c)+'</div></div>';
}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function vSpeak(){
  const c=cue.card,e=H().esc,showPace=cue.support!=="exam";
  const st=stageText(Math.max(0,stageIdx(cue.total-left())),c);
  return '<div class="cue-run"><div class="sess-top"><div><b>Speaking</b><div class="small mute">'+(cue.sr?"Listening for your transcript":cue.mr?"Recording":"Talk for the full two minutes")+'</div></div><button class="btn btn-ink btn-sm" data-a="cuefinish">'+H().ico("stop",16)+'Finish early</button></div>'
   +'<div class="run-grid"><div>'+timerHTML("to speak")
   +(showPace?'<div class="pace" aria-hidden="true">'+STAGES.map(s=>'<i style="flex:'+(s[2]-s[1])+'" title="'+s[0]+'"></i>').join("")+'</div><div class="stage"><b id="cueStage">'+e(st[0])+'</b><span id="cueHint">'+e(st[1])+'</span></div>':"<p class=\"mute small\" style=\"text-align:center\">Exam mode: no pacing hints.</p>")
   +'</div><div>'+cardHTML(c)+'<div class="notes-view"><h4>Your notes</h4><pre>'+e(cue.notes||"(no notes)")+'</pre></div></div></div>'
   +(cue.support==="guided"?'<div class="helpers">'+helperHTML(c)+'</div>':"")+'</div>';
}
function vReviewCue(){
  const c=cue.card,e=H().esc,H0=H();
  const drill=cue.mode==="drill";
  const plan=(c.plan||"").split(" / ").filter(Boolean);
  const labels=["Opening","Bullet 1","Bullet 2","Bullet 3","Why"];
  let h='<div class="cue-run"><div class="sess-top"><div><b>'+(drill?"Planning drill finished":"Round finished")+'</b><div class="small mute">'+e(c.q)+'</div></div></div>';
  h+='<div class="rev-grid"><div>';
  if(!drill){
    const t=cue.secUsed;
    h+='<div class="panel"><div class="pair"><div><div class="big">'+mmss(t)+'</div><p class="mute small">time spoken of 2:00</p></div>';
    const hasT=cue.final.trim().length>0;
    if(hasT){const a=analyse(cue.final,t,c);h+='<div><div class="big">'+a.words+'</div><p class="mute small">words ('+a.wpm+' a minute)</p></div></div>';
      h+='<p class="small mute" style="margin-top:10px">'+(t<110?"You stopped early. In the test you can keep going, so use the time to add an example and a feeling. ":"")+(a.wpm&&a.wpm<100?"Your pace was slow. Try shorter pauses and link ideas with phrases. ":a.wpm>170?"Your pace was fast. Slow down slightly so each point lands. ":"A comfortable pace is about 110 to 160 words a minute. ")+'</p></div>';
      h+='<div class="panel"><h4>Linking phrases used</h4>'+(a.found.length?'<div class="wchips">'+a.found.map(x=>'<span class="wchip"><b>'+e(x[0])+'</b>'+(x[1]>1?'<small>×'+x[1]+'</small>':"")+'</span>').join("")+'</div>':'<p class="mute small">None detected. Try “to begin with”, “what happened next was” and “that’s why”.</p>')+'</div>';
      h+='<div class="panel"><h4>Vocabulary from the app you used</h4>'+(a.used.length?'<div class="wchips">'+a.used.map(x=>'<span class="wchip"><b>'+e(x)+'</b></span>').join("")+'</div>':'<p class="mute small">None detected. Pick two words from the plan panel to aim for next time.</p>')+'</div>';
      if(a.rep.length)h+='<div class="panel"><h4>Repeated often</h4><p class="small">'+a.rep.map(x=>e(x[0])+' ('+x[1]+')').join(", ")+'. Swap some for synonyms.</p></div>';
      h+='<div class="panel"><h4>Transcript</h4><p class="transcript">'+e(cue.final.trim())+'</p><p class="small mute" style="margin-top:8px">Automatic transcripts can miss words, especially names. Treat the counts as a rough guide.</p></div>';
    }else{
      h+='<div></div></div><p class="small mute" style="margin-top:10px">'+(t<110?"You stopped early. In the test you can keep going, so use the time to add an example and a feeling. ":"You used the full time. ")+(cue.wantTr?"No transcript was captured this round.":"Turn on Transcript and analysis next time for word counts, linking phrases and vocabulary used (Chrome or Edge).")+'</p></div>';
    }
    if(cue.audioUrl)h+='<div class="panel"><h4>Listen to yourself</h4><audio controls src="'+cue.audioUrl+'" style="width:100%"></audio><p class="small mute" style="margin-top:8px">Listen once for clarity, once for ideas. Note one thing to fix.</p></div>';
  }
  h+='<div class="panel"><h4>Self-check</h4><div class="checks">'+CHECKS.map((t,i)=>'<label class="chk"><input type="checkbox" data-a="cuecheck" data-i="'+i+'" '+(cue.checks[i]?"checked":"")+'><span>'+e(t)+'</span></label>').join("")+'</div></div></div>';
  h+='<div><div class="panel"><h4>Your notes</h4><pre class="notes-pre">'+e(cue.notes||"(no notes)")+'</pre></div>';
  h+='<div class="panel"><h4>'+(plan.length?"A sample 60-second plan":"Structure to aim for")+'</h4>'+(plan.length?'<ol class="think">'+plan.map((p,i)=>'<li><b>'+labels[i]+':</b> '+e(p)+'</li>').join("")+'</ol><p class="small mute">Notice how short it is. Keywords and one concrete detail per bullet.</p>':'<ol class="think"><li><b>0 to 10 seconds:</b> name the topic.</li><li><b>10 to 85 seconds:</b> one bullet at a time, with a detail each.</li><li><b>85 to 115 seconds:</b> explain why, with a feeling and a reason.</li><li><b>Last 5 seconds:</b> one closing line.</li></ol>')+'</div>';
  h+='<div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" data-a="cueagain">Same card again</button><button class="btn btn-ghost" data-a="cuerandom2">New random card</button><button class="btn btn-ghost" data-a="cueexit">Back to cards</button></div></div></div></div>';
  return h;
}
BW.views.cuecards=function(){
  if(cue.phase==="prep")return vPrep();
  if(cue.phase==="speak")return vSpeak();
  if(cue.phase==="review")return vReviewCue();
  return vChoose();
};

/* ---------- actions ---------- */
function savePrefs(){const p=prefs();p.support=cue.support;p.mode=cue.mode;p.wantRec=cue.wantRec;p.wantTr=cue.wantTr;H().persist();}
function randomCard(){
  const done=H().store.cue.done,list=BW.cueCards.filter(c=>cue.cat==="all"||c.cat===cue.cat);
  const fresh=list.filter(c=>!done[c.id]);
  const pool=fresh.length?fresh:list;
  return pool[Math.floor(Math.random()*pool.length)];
}
BW.actions.cuecat=d=>{cue.cat=d.v;H().render();};
BW.actions.cuepick=d=>{cue.id=d.id;H().render();};
BW.actions.cuerandom=()=>{const c=randomCard();cue.id=c.id;H().render();};
BW.actions.cuerandom2=()=>{cue.cat="all";const c=randomCard();cue.id=c.id;cue.phase="choose";H().render(true);begin();};
BW.actions.cuemode=d=>{cue.mode=d.v;savePrefs();H().render();};
BW.actions.cuesupport=d=>{cue.support=d.v;savePrefs();H().render();};
BW.actions.cuetoggle=(d,t)=>{cue[d.k]=t.checked;savePrefs();H().render();};
BW.actions.cuecustom=()=>{
  const c=parseCustom(cue.customText);
  if(!c){H().toast("Type a cue card first");return;}
  cue.custom=c;cue.id="custom";H().render();
};
BW.actions.cuestart=()=>{begin();};
BW.actions.cueskip=()=>{if(cue.phase==="prep"){clearTimer();endPrep();}};
BW.actions.cuefinish=()=>{finishSpeak();};
BW.actions.cueagain=()=>{cue.phase="choose";begin();};
BW.actions.cueexit=()=>{exit();};
BW.actions.cuecheck=(d,t)=>{cue.checks[d.i]=t.checked;};
BW.bind.cuenotes=v=>{cue.notes=v;};
BW.bind.cuecustom=v=>{cue.customText=v;};

// restore saved preferences
(function(){
  try{
    const p=JSON.parse(localStorage.getItem("bandwords:v1")||"{}").cue;
    if(p&&p.prefs){if(p.prefs.support)cue.support=p.prefs.support;if(p.prefs.mode)cue.mode=p.prefs.mode;cue.wantRec=!!p.prefs.wantRec;cue.wantTr=!!p.prefs.wantTr;}
  }catch(e){}
})();
})();
