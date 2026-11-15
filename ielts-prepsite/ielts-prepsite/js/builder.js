/* Sentence builder: connector guide, combine two ideas, write with a target word, and a sentence notebook. */
(function(){
"use strict";
const BW=window.BW;
const H=()=>BW.h;
const e=s=>H().esc(s);
const cap1=s=>s.charAt(0).toUpperCase()+s.slice(1);

const REL={
  addition:{label:"Add an idea",hint:"Both ideas point the same way.",coord:["and"],adv:["In addition","Moreover","Furthermore"],sub:[]},
  contrast:{label:"Show a contrast",hint:"The second idea is surprising or different.",coord:["but","yet"],adv:["However","Nevertheless","On the other hand"],sub:["although","even though","while","whereas"]},
  cause:{label:"Give a reason",hint:"The first idea is the reason; the second is the result.",coord:["so"],adv:["As a result","Therefore","Consequently"],sub:["because","since","as"]},
  purpose:{label:"Show a purpose",hint:"The second idea is the goal of the first.",coord:[],adv:[],sub:["so that","in order that"],backOnly:true},
  condition:{label:"Set a condition",hint:"If the first happens, the second follows.",coord:[],adv:[],sub:["if","provided that","as long as"]},
  time:{label:"Show time order",hint:"The first idea happens before the second.",coord:["and then"],adv:["Afterwards","Subsequently","Eventually"],sub:["after","once","as soon as","before"]}
};
const RELKEYS=Object.keys(REL);
const FRAMES={
  compound:["[idea with WORD], and [another idea].","[idea with WORD], but [a contrasting idea].","[idea with WORD], so [result]."],
  complex:["Although [idea], [idea with WORD].","[Idea with WORD] because [reason].","If [condition], [idea with WORD]."],
  "compound-complex":["Although [idea], [idea with WORD], and [result].","[Idea with WORD], but [idea] because [reason]."]
};
const STRUCT=[["compound","Compound","Two full ideas joined by and, but, so or a semicolon."],["complex","Complex","A main idea plus a because, although or if clause."],["compound-complex","Compound-complex","Both together. Use sparingly and keep it readable."]];
const CONN_CHIPS={
  compound:["and","but","so","yet","or",";  however,",";  moreover,",";  therefore,"],
  complex:["although","because","if","while","since","when","so that","unless","which"],
  "compound-complex":["although","because","if","while","but","so","and","which"]
};
const SUBS=["although","even though","while","whereas","because","since","as long as","as soon as","provided that","so that","in order that","if","unless","when","once","after","before","until"];

const bs={tab:"guide",grel:"all",gq:"",rel:"all",idx:-1,pick:null,brk:"stop",wordId:null,struct:"compound",text:"",result:null,src:"learned"};

/* ---------- helpers ---------- */
function pairs(){return BW.pairs.filter(p=>bs.rel==="all"||p.rel===bs.rel);}
function curPair(){const l=pairs();if(!l.length)return null;if(bs.idx<0||bs.idx>=l.length)bs.idx=Math.floor(Math.random()*l.length);return l[bs.idx];}
function chipsFor(pair){
  const r=REL[pair.rel],out={coord:[],sub:[],adv:[]};
  r.coord.forEach(w=>out.coord.push({kind:"coord",w:w,label:w,pat:"A, "+w+" B"}));
  r.sub.forEach(w=>{
    if(!r.backOnly)out.sub.push({kind:"sub",pos:"front",w:w,label:cap1(w),pat:w==="before"?"Before B, A":cap1(w)+" A, B"});
    out.sub.push({kind:"sub",pos:"back",w:w,label:w,pat:(w==="before"||pair.rel==="purpose"?"A "+w+" B":"B "+w+" A")});
  });
  r.adv.forEach(w=>out.adv.push({kind:"adv",w:w,label:w,pat:"A. "+w+", B"}));
  return out;
}
function build(pair,c){
  const A=pair.a,B=pair.b;
  if(c.kind==="coord")return cap1(A)+", "+c.w+" "+B+".";
  if(c.kind==="adv")return bs.brk==="semi"?cap1(A)+"; "+c.w.toLowerCase()+", "+B+".":cap1(A)+". "+c.w+", "+B+".";
  if(pair.rel==="purpose")return cap1(A)+" "+c.w+" "+B+".";
  const before=c.w==="before";
  if(c.pos==="front")return before?cap1(c.w)+" "+B+", "+A+".":cap1(c.w)+" "+A+", "+B+".";
  return before?cap1(A)+" before "+B+".":cap1(B)+" "+c.w+" "+A+".";
}
function describe(c){
  if(c.kind==="coord")return["Compound sentence","Two full clauses joined by a conjunction. Put a comma before it."];
  if(c.kind==="adv")return bs.brk==="semi"?["Compound sentence (semicolon)","A semicolon joins two related clauses. The linking adverb is followed by a comma."]:["Two sentences linked by an adverb","Linking adverbs are followed by a comma. Use a full stop or a semicolon before them, never a comma alone."];
  return c.pos==="front"?["Complex sentence","When the subordinate clause comes first, add a comma after it."]:["Complex sentence","When the main clause comes first, no comma is needed."];
}
function highlight(sentence,c){
  const esc=e(sentence),w=c.kind==="adv"&&bs.brk==="semi"?c.w.toLowerCase():c.w;
  const i=esc.toLowerCase().indexOf(w.toLowerCase());
  if(i<0)return esc;
  return esc.slice(0,i)+"<mark>"+esc.slice(i,i+w.length)+"</mark>"+esc.slice(i+w.length);
}
function chipBtn(c,k,on){
  return '<button class="cchip'+(on?" on":"")+'" data-a="bpick" data-k="'+k+'"><b>'+e(c.label)+'</b><small>'+e(c.pat)+'</small></button>';
}

/* ---------- tab views ---------- */
function guideGroups(){
  const q=bs.gq.trim().toLowerCase();
  const groups=BW.connectors.filter(g=>bs.grel==="all"||g.rel===bs.grel).map(g=>{
    const items=g.items.filter(a=>!q||a[0].toLowerCase().indexOf(q)>=0||a[3].toLowerCase().indexOf(q)>=0);
    if(!items.length)return"";
    return '<section class="cg"><h3>'+e(g.label)+'</h3>'+items.map(a=>'<div class="crow"><div class="cname"><b>'+e(a[0])+'</b><span class="chip">'+e(a[1])+'</span><span class="chip'+(a[4]==="Both"?"":" hl")+'">'+(a[4]==="Both"?"Speaking and Writing":"Best for "+e(a[4]))+'</span></div><p class="small mute">'+e(a[2])+'</p><p class="ruled">'+H().markEx(a[3])+'</p></div>').join("")+'</section>';
  }).join("");
  return groups||'<div class="empty"><h3>No connector matches</h3><p class="mute">Try a different word or type.</p></div>';
}
function tabGuide(){
  const rels=[["all","All"]].concat(BW.connectors.map(g=>[g.rel,g.label]));
  return '<div class="tools"><div class="seg compact" role="group" aria-label="Connector type" style="max-width:100%">'+rels.map(r=>'<button class="'+(bs.grel===r[0]?"on":"")+'" data-a="bgrel" data-v="'+r[0]+'">'+e(r[1])+'</button>').join("")+'</div>'
    +'<label class="search">'+H().ico("search",18)+'<input data-bind="bgq" type="search" placeholder="Search a connector" value="'+e(bs.gq)+'" aria-label="Search connectors"></label></div>'
    +'<p class="note">Three kinds of connector, three kinds of punctuation. <b>Coordinating</b> (and, but, so): comma plus a conjunction joins two full ideas. <b>Subordinating</b> (although, because, if): adds a smaller idea to a main one. <b>Linking adverbs</b> (however, therefore): start a new sentence, or follow a semicolon, then take a comma.</p>'
    +'<div id="cg-list">'+guideGroups()+'</div>';
}
function tabCombine(){
  const pair=curPair();
  const relBtns=[["all","Any"]].concat(RELKEYS.map(k=>[k,REL[k].label]));
  let h='<div class="tools"><div class="seg compact" role="group" aria-label="Relationship">'+relBtns.map(r=>'<button class="'+(bs.rel===r[0]?"on":"")+'" data-a="brel" data-v="'+r[0]+'">'+e(r[1])+'</button>').join("")+'</div></div>';
  if(!pair)return h+'<div class="empty"><h3>No pairs here</h3></div>';
  const r=REL[pair.rel],ch=chipsFor(pair);
  h+='<div class="ideas"><div class="idea"><span class="small mute">Idea A</span><p>'+e(cap1(pair.a))+'</p></div><div class="idea"><span class="small mute">Idea B</span><p>'+e(cap1(pair.b))+'</p></div></div>'
    +'<p class="small mute" style="margin:10px 0 18px"><span class="chip hl">'+e(r.label)+'</span> '+e(r.hint)+' Pick a connector and see the sentence it makes.</p>';
  const all=[].concat(ch.coord,ch.sub,ch.adv);
  const picked=bs.pick!==null?all.find(c=>c.kind+"|"+c.w+"|"+(c.pos||"")===bs.pick):null;
  const grp=(title,sub,list)=>list.length?'<div class="cgrp"><h4>'+title+'</h4><p class="small mute">'+sub+'</p><div class="cchips">'+list.map(c=>chipBtn(c,c.kind+"|"+c.w+"|"+(c.pos||""),picked===c)).join("")+'</div></div>':"";
  h+=grp("Compound","Join two full ideas with a conjunction.",ch.coord)+grp("Complex","Make one idea smaller with a subordinating connector.",ch.sub)
    +(ch.adv.length?'<div class="cgrp"><h4>Linking adverb</h4><p class="small mute">Break into two parts. <span class="seg compact" style="margin-left:6px"><button class="'+(bs.brk==="stop"?"on":"")+'" data-a="bbrk" data-v="stop">Full stop</button><button class="'+(bs.brk==="semi"?"on":"")+'" data-a="bbrk" data-v="semi">Semicolon</button></span></p><div class="cchips">'+ch.adv.map(c=>chipBtn(c,c.kind+"|"+c.w+"|",picked===c)).join("")+'</div></div>':"");
  if(picked){
    const s=build(pair,picked),d=describe(picked);
    h+='<div class="outbox"><span class="chip">'+e(d[0])+'</span><p class="out">'+highlight(s,picked)+'</p><p class="small mute">'+e(d[1])+'</p><div class="row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn btn-ghost btn-sm" data-a="bspeak" data-t="'+e(s)+'">'+H().ico("volume",16)+'Listen</button><button class="btn btn-ghost btn-sm" data-a="bsave" data-t="'+e(s)+'" data-s="'+(picked.kind==="coord"||(picked.kind==="adv"&&bs.brk==="semi")?"compound":picked.kind==="sub"?"complex":"linked")+'">'+H().ico("bookmark",16)+'Save to my sentences</button></div></div>';
  }else h+='<p class="empty" style="padding:20px 0">Choose a connector above to build the sentence.</p>';
  h+='<div class="row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:18px"><button class="btn btn-primary" data-a="bnext">Next pair</button></div>'
    +'<p class="note" style="margin-top:22px"><b>Challenge:</b> pick a compound sentence, then add a third idea with because or although to make it compound-complex. Say it aloud in one breath.</p>';
  return h;
}
function pickWord(){
  const H0=H(),lv=H0.store.profile.level;
  let list=[];
  if(bs.src==="learned")list=Object.keys(H0.store.words).filter(id=>H0.WMAP[id]).map(id=>H0.WMAP[id]);
  if(!list.length)list=H0.WORDS.filter(w=>w.level===lv&&w.pos!=="adverb");
  const w=list[Math.floor(Math.random()*list.length)];
  bs.wordId=w.id;bs.text="";bs.result=null;
}
function checkSentence(text,w,struct){
  const t=text.trim(),low=t.toLowerCase(),words=(t.match(/[A-Za-z’'\-]+/g)||[]).length,out=[];
  out.push({ok:H().hasWord(t,w.word),msg:"Uses “"+w.word+"”",fix:"Include the target word. Any form of it counts, such as a plural or past tense."});
  out.push({ok:/^[A-Z“"‘']/.test(t)&&/[.!?]["”’']?$/.test(t),msg:"Starts with a capital letter and ends with a full stop",fix:"Begin with a capital letter and finish with a full stop."});
  const coord=/,\s+(and|but|so|yet|or|nor)\s+\S/.test(low),semi=/;\s*\S/.test(low);
  const subs=SUBS.filter(s=>new RegExp("(^|[\\s,;])"+s+"\\s").test(" "+low+" "));
  const rel=/,\s+(which|who|whose)\s+\S/.test(low);
  if(struct==="compound"){
    out.push({ok:coord||semi,msg:"Joins two full ideas (comma plus and, but, so, yet or or; or a semicolon)",fix:"Try: [idea], but [idea]. Remember the comma before the conjunction."});
    out.push({ok:words>=10,msg:"At least 10 words",fix:"Add a detail to each idea to reach about 10 words or more."});
  }else if(struct==="complex"){
    out.push({ok:subs.length>0||rel,msg:"Has a subordinate clause ("+(subs.length?subs.join(", "):"although, because, if…")+")",fix:"Add a clause with although, because, if, while or since."});
    out.push({ok:words>=12,msg:"At least 12 words",fix:"Add a detail or a reason to reach about 12 words."});
  }else{
    out.push({ok:(coord||semi)&&(subs.length>0||rel),msg:"Has two main ideas and a subordinate clause",fix:"Combine: Although [idea], [idea with word], and [result]."});
    out.push({ok:words>=16,msg:"At least 16 words",fix:"A compound-complex sentence is usually 16 words or more."});
  }
  if(SUBS.slice(0,17).some(s=>low.indexOf(s+" ")===0))out.push({ok:/,/.test(t),msg:"Comma after the opening clause",fix:"When a sentence opens with although, if, because and so on, put a comma before the main clause."});
  return out;
}
function tabWord(){
  bs.touched=false;
  const H0=H(),w=bs.wordId?H0.WMAP[bs.wordId]:null,learned=Object.keys(H0.store.words).length;
  let h='<div class="tools"><div class="seg compact" role="group" aria-label="Word source"><button class="'+(bs.src==="learned"?"on":"")+'" data-a="bsrc" data-v="learned">From my learned words</button><button class="'+(bs.src==="all"?"on":"")+'" data-a="bsrc" data-v="all">From any word</button></div><button class="btn btn-primary btn-sm" data-a="bword">'+(w?"Another word":"Give me a word")+'</button></div>';
  if(!w)return h+'<div class="empty"><h3>Write with a word you are learning</h3><p class="mute">Press “Give me a word”. You will get a word, a structure to aim for, and checks on your sentence.'+(learned?"":" You haven’t learned words yet, so you will get words from your level.")+'</p></div>';
  const st=STRUCT.find(x=>x[0]===bs.struct);
  h+='<div class="wbox"><div><span class="hw-s">'+e(w.word)+'</span> <span class="pos">'+e(w.pos)+'</span><p class="def" style="font-size:17px;margin-top:4px">'+e(cap1(w.def))+'.</p><p class="ruled" style="margin-top:8px;font-size:18px">'+H0.markEx(w.ex)+'</p></div><button class="btn btn-ghost btn-sm" data-a="speak" data-t="'+e(w.word)+'">'+H0.ico("volume",16)+'Listen</button></div>'
    +'<div class="fld" style="margin-top:20px"><span>Structure</span><div class="seg compact" role="group" aria-label="Structure">'+STRUCT.map(x=>'<button class="'+(bs.struct===x[0]?"on":"")+'" data-a="bstruct" data-v="'+x[0]+'">'+x[1]+'</button>').join("")+'</div></div><p class="small mute" style="margin:6px 0 12px">'+e(st[2])+'</p>'
    +'<div class="frames">'+FRAMES[bs.struct].map((f,i)=>'<button class="frame" data-a="bframe" data-i="'+i+'">'+e(f.replace(/WORD/g,w.word))+'</button>').join("")+'</div>'
    +'<div class="cchips" style="margin:12px 0 8px"><span class="small mute" style="align-self:center">Insert a connector:</span>'+CONN_CHIPS[bs.struct].map(c=>'<button class="cchip mini" data-a="bins" data-c="'+e(c)+'"><b>'+e(c.replace(/^;\s+/,"; "))+'</b></button>').join("")+'</div>'
    +'<textarea id="bText" data-bind="btext" rows="4" placeholder="Write your sentence here, using “'+e(w.word)+'”.">'+e(bs.text)+'</textarea>'
    +'<div class="row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn btn-primary" data-a="bcheck">Check my sentence</button><button class="btn btn-ghost" data-a="bsave2">'+H0.ico("bookmark",16)+'Save to my sentences</button></div>';
  if(bs.result){
    const ok=bs.result.filter(x=>x.ok).length;
    h+='<div class="outbox"><p class="small"><b>'+ok+" of "+bs.result.length+' checks passed.</b> These checks look for patterns only. They can’t judge meaning, so read your sentence aloud as well.</p><ul class="rchk">'+bs.result.map(x=>'<li class="'+(x.ok?"ok":"no")+'"><span class="st">'+H0.ico(x.ok?"check":"x",13)+'</span><div><b>'+e(x.msg)+'</b>'+(x.ok?"":'<p class="small mute">'+e(x.fix)+'</p>')+'</div></li>').join("")+'</ul></div>';
  }
  return h;
}
function tabMine(){
  const list=H().store.sentences;
  if(!list.length)return'<div class="empty"><h3>No saved sentences yet</h3><p class="mute">Save the sentences you build in Combine ideas or Use a word. Reread them before your test.</p><button class="btn btn-primary" data-a="btab" data-v="word">Write a sentence</button></div>';
  return '<div class="mine">'+list.map((s,i)=>'<div class="ms"><div><p class="ms-t">'+e(s.t)+'</p><p class="small mute">'+(s.w?e(s.w)+", ":"")+e(s.s)+", "+e(s.d)+'</p></div><div class="ms-a"><button class="icon-btn" data-a="bspeak" data-t="'+e(s.t)+'" aria-label="Listen">'+H().ico("volume",18)+'</button><button class="icon-btn" data-a="bdel" data-i="'+i+'" aria-label="Delete">'+H().ico("trash",18)+'</button></div></div>').join("")+'</div>';
}
BW.views.builder=function(){
  const tabs=[["guide","Connector guide"],["combine","Combine ideas"],["word","Use a word"],["mine","My sentences ("+H().store.sentences.length+")"]];
  const body=bs.tab==="guide"?tabGuide():bs.tab==="combine"?tabCombine():bs.tab==="word"?tabWord():tabMine();
  return '<div class="ph"><div><h1>Sentence builder</h1><p class="mute">Band 6 and above needs a mix of simple, compound and complex sentences, joined accurately. Learn the connectors, combine ideas, then write with your own words.</p></div></div>'
    +'<div class="seg" role="tablist" aria-label="Builder sections" style="margin-bottom:22px">'+tabs.map(t=>'<button class="'+(bs.tab===t[0]?"on":"")+'" data-a="btab" data-v="'+t[0]+'">'+e(t[1])+'</button>').join("")+'</div>'+body;
};

/* ---------- actions ---------- */
const A=BW.actions,B=BW.bind;
A.btab=d=>{bs.tab=d.v;H().render();};
A.bgrel=d=>{bs.grel=d.v;H().render();};
A.brel=d=>{bs.rel=d.v;bs.idx=-1;bs.pick=null;H().render();};
A.bnext=()=>{const n=pairs().length;if(n){bs.idx=(bs.idx+1+Math.floor(Math.random()*Math.max(1,n-1)))%n;}bs.pick=null;H().render();};
A.bpick=d=>{bs.pick=d.k;H().render();};
A.bbrk=d=>{bs.brk=d.v;H().render();};
A.bspeak=d=>H().speak(d.t);
A.bsave=d=>saveSentence(d.t,d.s,"");
A.bsrc=d=>{bs.src=d.v;bs.wordId=null;H().render();};
A.bword=()=>{pickWord();H().render();};
A.bstruct=d=>{bs.struct=d.v;bs.result=null;H().render();};
A.bframe=d=>{
  const w=H().WMAP[bs.wordId];
  bs.text=FRAMES[bs.struct][parseInt(d.i,10)].replace(/WORD/g,w.word);bs.result=null;H().render();
  const t=document.getElementById("bText");if(t)t.focus();
};
A.bins=d=>{
  const t=document.getElementById("bText");if(!t)return;
  const c=d.c.replace(/^;\s+/,"; ").replace(/\s+,$/,",");
  const i=bs.touched&&t.selectionStart!=null?t.selectionStart:t.value.length,j=bs.touched&&t.selectionEnd!=null?t.selectionEnd:i;
  const pre=t.value.slice(0,i),post=t.value.slice(j);
  const isSemi=c.charAt(0)===";";
  const ins=isSemi?c+" ":(pre&&!/\s$/.test(pre)&&!/^,/.test(c)?" ":"")+c+" ";
  t.value=(isSemi?pre.replace(/\s+$/,""):pre)+ins+post;bs.text=t.value;t.focus();
  const pos=(isSemi?pre.replace(/\s+$/,"").length:pre.length)+ins.length;t.setSelectionRange(pos,pos);
};
A.bcheck=()=>{
  const t=document.getElementById("bText"),w=H().WMAP[bs.wordId];
  bs.text=t?t.value:bs.text;
  if(!bs.text.trim()){H().toast("Write a sentence first");return;}
  bs.result=checkSentence(bs.text,w,bs.struct);H().render();
};
A.bsave2=()=>{
  const t=document.getElementById("bText");bs.text=t?t.value:bs.text;
  if(!bs.text.trim()){H().toast("Write a sentence first");return;}
  saveSentence(bs.text.trim(),bs.struct,H().WMAP[bs.wordId].word);
};
A.bdel=d=>{H().store.sentences.splice(parseInt(d.i,10),1);H().persist();H().render();};
B.bgq=v=>{
  bs.gq=v;
  const el=document.getElementById("cg-list");
  if(el)el.innerHTML=guideGroups();
};
B.btext=v=>{bs.text=v;bs.touched=true;};
function saveSentence(text,struct,word){
  const s=H().store;
  s.sentences.unshift({t:text,s:struct,w:word,d:H().today()});
  s.sentences=s.sentences.slice(0,80);H().persist();H().toast("Saved to my sentences");
  if(bs.tab==="mine")H().render();
}
})();
