/* Writing guides: paragraph plans and sentence frames for Task 1 and Task 2. */
(function(){
"use strict";
const BW=window.BW;
const H=()=>BW.h;
const e=s=>H().esc(s);
const gs={tab:"task1",open:{}};

function item(g){
  const open=!!gs.open[g.id];
  let h='<article class="gd'+(open?" open":"")+'"><button class="gd-h" data-a="gopen" data-id="'+g.id+'" aria-expanded="'+open+'"><div><h3>'+e(g.name)+'</h3><p class="small mute">'+e(g.when)+'</p></div><span class="chev">'+H().ico("chev",18)+'</span></button>';
  if(open){
    h+='<div class="gd-b"><div class="gd-plan">'+g.plan.map(p=>'<div class="gp"><b>'+e(p[0])+'</b><p>'+e(p[1])+'</p></div>').join("")+'</div>';
    if(g.tense)h+='<p class="small"><b>Tense:</b> '+e(g.tense)+'</p>';
    h+='<div><h4 class="gh">Sentence frames</h4>'+g.templates.map(t=>'<p class="ruled">'+e(t)+'</p>').join("")+'</div>'
      +'<div><h4 class="gh">Connectors that fit</h4><div class="wchips">'+g.links.map(l=>'<span class="wchip"><b>'+e(l)+'</b></span>').join("")+'</div><p class="small mute" style="margin-top:8px"><a class="ulink" href="#builder" data-a="nav">Practise these in the sentence builder</a></p></div>'
      +'<p class="warn"><b>Watch out:</b> '+e(g.watch)+'</p></div>';
  }
  return h+'</article>';
}
BW.views.guides=function(){
  const d=BW.guides[gs.tab];
  return '<a class="back" href="#writing" data-a="nav">'+H().ico("left",16)+'Writing</a>'
    +'<div class="ph"><div><h1>Report and essay guides</h1><p class="mute">'+e(d.intro)+'</p></div></div>'
    +'<div class="seg" role="tablist" aria-label="Task" style="margin-bottom:22px"><button class="'+(gs.tab==="task1"?"on":"")+'" data-a="gtab" data-v="task1">Task 1: reports</button><button class="'+(gs.tab==="task2"?"on":"")+'" data-a="gtab" data-v="task2">Task 2: essays</button></div>'
    +'<div class="gds">'+d.items.map(item).join("")+'</div>';
};
BW.actions.gtab=d=>{gs.tab=d.v;H().render();};
BW.actions.gopen=d=>{gs.open[d.id]=!gs.open[d.id];H().render();};
})();
