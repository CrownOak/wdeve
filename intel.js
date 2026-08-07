/* BONK INTEL ENGINE. One copy, mounted by /briefing/ and the GOBSEC portal.
   BONKINTEL.mount(el) injects the workspace and starts it. Spine elements are
   lazy: nothing heavy loads until a lens asks for it (spec v1.1, red team F1). */
(function(){
var MARKUP='<div class="pgrid">\n <div class="pmain">\n  <div id="thecall"></div>\n  <div id="youare"></div>\n  <div id="statetiles"></div>\n  <div class="askline">Or ask about anyone.</div>\n  <div class="btop">\n   <input id="q" type="text" placeholder="Pilot, corp, alliance or system. A zkill link works too." autocomplete="off" spellcheck="false">\n   <button id="go" class="gobtn">Pull the file</button>\n  </div>\n  <div class="bhelp">Exact in game spelling. Public killboard and public ESI, read at the moment you ask.</div>\n  <div id="chips"></div>\n  <div id="trailbar"></div>\n  <div id="status"></div>\n  <div id="out"></div>\n </div>\n <aside class="prail">\n  <div class="rhud">\n   <div class="rhudk">NEW EDEN, THIS HOUR</div>\n   <div class="rhudbig" id="hudShips">&mdash; <small>ships</small></div>\n   <div class="rhudrow"><span>pods</span><b id="hudPods">&mdash;</b></div>\n   <div class="rhudrow"><span>hottest</span><span id="hudHot">reading&hellip;</span></div>\n   <div class="rhudrow"><span>our roads</span><span id="hudOurs">reading&hellip;</span></div>\n  </div>\n  <div class="rblk">\n   <div class="rhead">\n    <span class="rt" id="rTitle">WHERE IT IS BURNING</span>\n    <span class="rsw" id="rsw">\n     <button data-r="hot" class="on">Hot</button>\n     <button data-r="ours">Ours</button>\n     <button data-r="watch">Watch</button>\n    </span>\n   </div>\n   <div id="rlist"><div class="rnote">reading the map&hellip;</div></div>\n   <div class="rnote" id="rNote">Every row opens its own file.</div>\n  </div>\n </aside>\n</div>';
/* TWO POSTURES, ONE ENGINE (2026-08-06).

   This tool is mounted in two places and they are not the same room. /briefing/ is
   PUBLIC and is the best recruiting asset we own, precisely because it reads only
   ESI and zKillboard and works for a stranger with no account. The GOBSEC desk is
   member gated.

   The problem: the ours layer shipped in both. A logged out visitor got an "Ours"
   tab, a live "our roads" counter, and a rail that named the corridor and both
   homes with kills against them this hour. That is our operational footprint,
   published to anybody curious enough to click a tab, on a page we were about to
   advertise in the recruitment forums. A hostile could watch our roads using our
   own tool.

   So: `ours` is OFF unless the caller asks for it. The per dossier road chips were
   already behind whoami.loggedIn, which is why this reads as a partial fix rather
   than a new one; the rail, the HUD counter and the distance from home were not,
   and those are the ones that draw the map. */
window.BONKINTEL={mount:function(root,opts){
  if(!root) return; root.innerHTML=MARKUP;
  var OURS=!!(opts&&opts.ours);
  if(!OURS){
    /* Remove rather than hide. A display:none tab is still in the DOM for anyone
       who opens devtools, and the whole point is to not publish the map. */
    var ob=root.querySelector("#rsw button[data-r='ours']"); if(ob) ob.parentNode.removeChild(ob);
    var oh=root.querySelector("#hudOurs");
    if(oh&&oh.parentNode&&oh.parentNode.parentNode) oh.parentNode.parentNode.removeChild(oh.parentNode);
  }
  /* module state declared BEFORE anything can use it. A deep link runs loadTarget
     partway down this body, and var hoists the name but not the value, so state
     assigned further down is undefined at that moment. */
  var TRAIL=[], TPOS=-1, TRAILQUIET=false, LASTSYNC=Date.now(), SYNCING=false;
  var TYPEWORD={char:"pilot",corp:"corp",alli:"alliance",sys:"system"};

var GRP={"25":["Frigate",0],"26":["Cruiser",0],"27":["Battleship",0],"28":["Hauler",1],"29":["Capsule",1],"30":["Titan",0],"31":["Shuttle",1],"237":["Corvette",1],"324":["Assault Frigate",0],"358":["Heavy Assault Cruiser",0],"380":["Deep Space Transport",1],"419":["Combat Battlecruiser",0],"420":["Destroyer",0],"463":["Mining Barge",1],"485":["Dreadnought",0],"513":["Freighter",1],"540":["Command Ship",0],"541":["Interdictor",0],"543":["Exhumer",1],"547":["Carrier",0],"659":["Supercarrier",0],"830":["Covert Ops",0],"831":["Interceptor",0],"832":["Logistics",0],"833":["Force Recon Ship",0],"834":["Stealth Bomber",0],"883":["Capital Industrial Ship",1],"893":["Electronic Attack Ship",0],"894":["Heavy Interdiction Cruiser",0],"898":["Black Ops",0],"900":["Marauder",0],"902":["Jump Freighter",1],"906":["Combat Recon Ship",0],"941":["Industrial Command Ship",1],"963":["Strategic Cruiser",0],"1022":["Prototype Exploration Ship",1],"1201":["Attack Battlecruiser",0],"1202":["Blockade Runner",1],"1246":["Mobile Depot",1],"1249":["Mobile Cyno Inhibitor",1],"1250":["Mobile Tractor Unit",1],"1283":["Expedition Frigate",1],"1305":["Tactical Destroyer",0],"1527":["Logistics Frigate",0],"1534":["Command Destroyer",0],"1538":["Force Auxiliary",0],"1972":["Flag Cruiser",0],"4594":["Lancer Dreadnought",0],"4902":["Expedition Command Ship",0],"5087":["Special Edition Yachts",0],"5120":["Command Carrier",0]};
var T2G={"582":25,"583":25,"584":25,"585":25,"586":25,"587":25,"588":237,"589":25,"590":25,"591":25,"592":25,"593":25,"594":25,"596":237,"597":25,"598":25,"599":25,"601":237,"602":25,"603":25,"605":25,"606":237,"607":25,"608":25,"609":25,"615":237,"617":237,"620":26,"621":26,"622":26,"623":26,"624":26,"625":26,"626":26,"627":26,"628":26,"629":26,"630":26,"631":26,"632":26,"633":26,"634":26,"635":5087,"638":27,"639":27,"640":27,"641":27,"642":27,"643":27,"644":27,"645":27,"648":28,"649":28,"650":28,"651":28,"652":28,"653":28,"654":28,"655":28,"656":28,"657":28,"670":29,"671":30,"672":31,"1944":28,"2006":26,"2078":1022,"2161":25,"2834":324,"2836":358,"2863":28,"2998":28,"3514":659,"3516":324,"3518":358,"3532":25,"3756":419,"3764":30,"3766":25,"4302":1201,"4306":1201,"4308":1201,"4310":1201,"4363":28,"4388":28,"11011":26,"11129":31,"11132":31,"11134":31,"11172":830,"11174":893,"11176":831,"11178":831,"11182":830,"11184":831,"11186":831,"11188":830,"11190":893,"11192":830,"11194":893,"11196":831,"11198":831,"11200":831,"11202":831,"11365":324,"11371":324,"11377":834,"11379":324,"11381":324,"11387":893,"11393":324,"11400":324,"11567":30,"11936":27,"11938":27,"11940":25,"11942":25,"11957":833,"11959":906,"11961":906,"11963":833,"11965":833,"11969":833,"11971":906,"11978":832,"11985":832,"11987":832,"11989":832,"11993":358,"11995":894,"11999":358,"12003":358,"12005":358,"12011":358,"12013":894,"12015":358,"12017":894,"12019":358,"12021":894,"12023":358,"12032":834,"12034":834,"12038":834,"12042":324,"12044":324,"12729":1202,"12731":380,"12733":1202,"12735":1202,"12743":1202,"12745":380,"12747":380,"12753":380,"13202":27,"16227":419,"16229":419,"16231":419,"16233":419,"16236":420,"16238":420,"16240":420,"16242":420,"17476":463,"17478":463,"17480":463,"17619":25,"17634":26,"17636":27,"17703":25,"17709":26,"17713":26,"17715":26,"17718":26,"17720":26,"17722":26,"17726":27,"17728":27,"17732":27,"17736":27,"17738":27,"17740":27,"17812":25,"17841":25,"17843":26,"17918":27,"17920":27,"17922":26,"17924":25,"17926":25,"17928":25,"17930":25,"17932":25,"19720":485,"19722":485,"19724":485,"19726":485,"19744":28,"20125":906,"20183":513,"20185":513,"20187":513,"20189":513,"21097":31,"21628":31,"22428":898,"22430":898,"22436":898,"22440":898,"22442":540,"22444":540,"22446":540,"22448":540,"22452":541,"22456":541,"22460":541,"22464":541,"22466":540,"22468":540,"22470":540,"22474":540,"22544":543,"22546":543,"22548":543,"22852":659,"23757":547,"23773":30,"23911":547,"23913":659,"23915":547,"23917":659,"23919":659,"24483":547,"24688":27,"24690":27,"24692":27,"24694":27,"24696":419,"24698":419,"24700":419,"24702":419,"26840":27,"26842":27,"28352":883,"28606":941,"28659":900,"28661":900,"28665":900,"28710":900,"28844":902,"28846":902,"28848":902,"28850":902,"29248":25,"29266":31,"29336":26,"29337":26,"29340":26,"29344":26,"29984":963,"29986":963,"29988":963,"29990":963,"30842":31,"32207":324,"32209":358,"32305":27,"32307":27,"32309":27,"32311":27,"32788":324,"32790":832,"32811":28,"32872":420,"32874":420,"32876":420,"32878":420,"32880":25,"33079":237,"33081":237,"33083":237,"33151":419,"33153":419,"33155":419,"33157":419,"33328":29,"33395":833,"33397":830,"33468":25,"33470":26,"33472":27,"33474":1246,"33475":1250,"33476":1249,"33513":31,"33520":1246,"33522":1246,"33553":26,"33673":831,"33675":833,"33697":1283,"33700":1250,"33702":1250,"33816":25,"33818":26,"33820":27,"34317":1305,"34328":513,"34496":31,"34562":1305,"34590":5087,"34828":1305,"35683":1305,"35779":831,"35781":894,"37135":1283,"37453":25,"37454":25,"37455":25,"37456":25,"37457":1527,"37458":1527,"37459":1527,"37460":1527,"37480":1534,"37481":1534,"37482":1534,"37483":1534,"37604":1538,"37605":1538,"37606":1538,"37607":1538,"42124":485,"42125":659,"42126":30,"42241":30,"42242":1538,"42243":485,"42244":941,"42245":832,"42246":830,"42685":420,"44993":830,"44995":833,"44996":898,"45530":834,"45531":833,"45534":1972,"45645":1538,"45647":485,"45649":30,"47269":25,"47270":26,"47271":27,"47466":27,"48635":833,"48636":830,"49710":420,"49711":419,"49712":26,"49713":832,"52250":324,"52252":358,"52254":1534,"52907":485,"54731":25,"54732":26,"54733":27,"56701":1250,"60764":894,"60765":893,"64034":31,"72811":419,"72812":419,"72869":419,"72872":419,"72903":25,"72904":25,"72907":25,"72913":25,"73787":485,"73789":420,"73790":485,"73792":485,"73793":485,"73794":420,"73795":420,"73796":420,"74141":324,"74316":358,"77114":25,"77281":4594,"77283":4594,"77284":4594,"77288":4594,"77726":358,"78333":420,"78366":419,"78367":420,"78369":419,"78414":324,"78576":30,"81008":28,"81040":513,"81046":1202,"81047":380,"81951":1250,"85062":830,"85086":419,"85087":420,"85229":833,"85236":898,"87381":485,"88001":900,"89240":420,"89607":4902,"89647":420,"89648":25,"89649":1534,"89807":1201,"89808":1305,"91174":420,"91775":420,"91849":420,"91857":420,"91858":420,"92282":5087,"92283":5087,"92284":5087,"92822":5120,"92823":5120,"92824":5120,"92825":5120};
var SOFT_T={"32880": 1};
var ZK="https://zkillboard.com/api", ESI="https://esi.evetech.net/latest", IMG="https://images.evetech.net";
var TPATH={char:"characterID",corp:"corporationID",alli:"allianceID",sys:"solarSystemID"};
var TZW={char:"character",corp:"corporation",alli:"alliance",sys:"system"};
var OUR_ALLI=99015148;
var OUR_CORPS={98342394:1,98840038:1,98838780:1,98807741:1};
var OUR_SYS={30000031:1,30000035:1,30000114:1,30000117:1,30000943:1,30000944:1,30000945:1,30000948:1,30002510:1};
var OUR_REG={"Derelik":1,"Devoid":1,"Great Wildlands":1};
var RENS=30002510;
var LSD="bonk_brief_v1::", LSR="bonk_brief_recent_v1", LSW="bonk_brief_watch_v1";

var q=document.getElementById("q"), go=document.getElementById("go"),
    out=document.getElementById("out"), st=document.getElementById("status"),
    chipsEl=document.getElementById("chips");
var cur=null, whoami={loggedIn:false,role:null};

function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }
function isk(v){ if(v==null||!isFinite(v)) return "0"; var a=Math.abs(v);
  if(a>=1e12) return (v/1e12).toFixed(2)+"T";
  if(a>=1e9) return (v/1e9).toFixed(2)+"B"; if(a>=1e6) return (v/1e6).toFixed(1)+"M";
  if(a>=1e3) return (v/1e3).toFixed(0)+"k"; return String(Math.round(v)); }
function pct(v){ return isFinite(v)?Math.round(v*100)+"%":"0%"; }
function ago(iso){ var s=(Date.now()-new Date(iso).getTime())/1000; if(!isFinite(s)||s<0) s=0;
  if(s<3600) return Math.max(1,Math.round(s/60))+"m ago"; if(s<172800) return Math.round(s/3600)+"h ago";
  return Math.round(s/86400)+"d ago"; }
function wait(ms){ return new Promise(function(res){ setTimeout(res,ms); }); }
function lsGet(k){ try{ return JSON.parse(localStorage.getItem(k)||"null"); }catch(e){ return null; } }
function lsSet(k,v){
  try{ localStorage.setItem(k,JSON.stringify(v)); return true; }
  catch(e){
    /* storage is full. Swallowing this kills the cache invisibly and every read
       goes back to hammering zkill, so drop the oldest half of our own digests
       and try once more. */
    try{
      var mine=[];
      for(var i=0;i<localStorage.length;i++){
        var kk=localStorage.key(i);
        if(kk&&(kk.indexOf(LSD)===0||kk.indexOf("bonk_desk_v1::")===0)) mine.push(kk);
      }
      mine.slice(0,Math.max(1,Math.floor(mine.length/2))).forEach(function(kk){ localStorage.removeItem(kk); });
      localStorage.setItem(k,JSON.stringify(v)); return true;
    }catch(e2){ return false; }
  }
}

/* ---- zkill: serialized, 350ms manners, keeps going after a failure ---- */
var zkChain=Promise.resolve();
function zkGet(path){
  var p=zkChain.then(function(){ return wait(350); }).then(function(){
    return fetch(ZK+path,{headers:{"Accept":"application/json"}}).then(function(r){
      if(!r.ok) throw "http "+r.status; return r.json(); });
  });
  zkChain=p.catch(function(){});
  return p;
}
function postJson(url,body){
  return fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(body)})
    .then(function(r){ if(!r.ok) throw r.status; return r.json(); });
}
/* names: bulk id resolve with binary split so one dead id cannot sink the batch */
function resolveNames(ids){
  var uniq=[], seen={};
  ids.forEach(function(i){ i=+i; if(i>0&&!seen[i]){ seen[i]=1; uniq.push(i); } });
  var outMap={};
  function attempt(list){
    if(!list.length) return Promise.resolve();
    return postJson(ESI+"/universe/names/?datasource=tranquility",list)
      .then(function(a){ a.forEach(function(x){ outMap[x.id]=x; }); })
      .catch(function(){
        if(list.length===1){ outMap[list[0]]={id:list[0],name:"Unknown",category:"unknown"}; return; }
        var mid=list.length>>1;
        return attempt(list.slice(0,mid)).then(function(){ return attempt(list.slice(mid)); });
      });
  }
  var chunks=[]; for(var i=0;i<uniq.length;i+=900) chunks.push(uniq.slice(i,i+900));
  return chunks.reduce(function(p,c){ return p.then(function(){ return attempt(c); }); },Promise.resolve())
    .then(function(){ return outMap; });
}
function nameOf(map,id){ var e=map[id]; return e?e.name:"Unknown"; }

/* ---- belts.json: system name -> region, lazy, best effort ---- */
var beltsIdx=null;
var beltsP=fetch("/lowsec/belts.json").then(function(r){ return r.ok?r.json():null; }).then(function(d){
  beltsIdx={};
  if(d&&d.regions) for(var reg in d.regions){ var l=d.regions[reg]; for(var i2=0;i2<l.length;i2++) beltsIdx[l[i2].n]=reg; }
}).catch(function(){ beltsIdx={}; });
function regionOf(sysName){ return (beltsIdx&&beltsIdx[sysName])||null; }

fetch("/api/whoami",{credentials:"same-origin"}).then(function(r){ return r.ok?r.json():null; })
  .then(function(d){ if(d) whoami=d; }).catch(function(){});

/* ---- status strip: every source reports, silence never reads as peace ---- */
var srcS={};
function paintStatus(){
  var order=["stats","kills","losses","names"], h=[];
  order.forEach(function(k){ if(srcS[k]) h.push(k+" "+(/^(ok|\d)/.test(srcS[k])?srcS[k]:"<span class='bad'>"+esc(srcS[k])+"</span>")); });
  st.innerHTML=h.join(" &middot; ");
}

/* ---- classifiers ---- */
function bandDanger(d){ d=+d||0;
  if(d>=75) return ["HARD TARGET","d3"]; if(d>=50) return ["DANGEROUS","d2"];
  if(d>=25) return ["MODERATE","d1"]; return ["LOW THREAT","d0"]; }
function secBand(s){ s=+s; if(s>=0.45) return ["hs",s.toFixed(1)]; if(s>0) return ["ls",s.toFixed(1)]; return ["ns",s.toFixed(1)]; }
function groupOf(tid){ var g=T2G[tid]; return g?{gid:g,name:GRP[g][0],soft:(SOFT_T[tid]||GRP[g][1])?1:0}:{gid:0,name:"Other",soft:0}; }
function preyVerdict(softPct,nk){
  if(!nk) return null;
  if(softPct>=0.6) return "They shoot people who can't shoot back. Noted.";
  if(softPct>=0.25) return "Mixed hunter. Soft targets when offered, fights when not.";
  return "Combat hunters. They're here for the fight.";
}
function engageClass(avgGang,soloPct){
  if(avgGang<1.5&&soloPct>=0.4) return ["SOLO ARTIST","Confident alone. Check for the bait alt anyway."];
  if(avgGang<3) return ["RUNS A PARTNER","Travels in a pair. Count to two before you tackle."];
  if(avgGang<8) return ["SMALL GANG","If you can see one, there are more you can't."];
  return ["FLEET CREW","Fleet fighter. You won't catch one alone, and you won't want to."];
}
var RE_SH=/Shield Extender|Shield Booster|Shield Hardener|Invulnerability|Multispectrum Shield|Shield Boost Amplifier|Shield Flux/i;
var RE_AR=/Steel Plates|Armor Repairer|Membrane|Energized|Armor Hardener|Adaptive Nano|Layered Plating/i;
var RE_HU=/Bulkhead|Hull Repairer/i;
function tankVerdict(mods){ /* mods: [{name,n}] */
  var sh=0,ar=0,hu=0;
  mods.forEach(function(m){ if(RE_SH.test(m.name)) sh+=m.n; else if(RE_AR.test(m.name)) ar+=m.n; else if(RE_HU.test(m.name)) hu+=m.n; });
  if(!sh&&!ar&&!hu) return ["MIXED OR UNKNOWN","No clear tank pattern. Read the fit on the mail before you commit."];
  if(sh>=ar&&sh>=hu) return ["SHIELD TANK","Shield tanked. Hit EM first and neut the cap."];
  if(ar>=hu) return ["ARMOR TANK","Armor tanked. Explosive damage, and they're the slow kind."];
  return ["HULL TANK","Hull tanked. That's a choice. Shoot whatever you like."];
}
function peakWindow(mat){ /* mat: 7x24 counts -> {a,b,tz,total} or null */
  var hours=[],h,d,best=-1,bi=0,t=0;
  for(h=0;h<24;h++){ hours[h]=0; for(d=0;d<7;d++) hours[h]+=mat[d][h]; t+=hours[h]; }
  if(!t) return null;
  for(h=0;h<24;h++){ var s=0; for(var k=0;k<4;k++) s+=hours[(h+k)%24]; if(s>best){ best=s; bi=h; } }
  var c=(bi+2)%24, tz=(c>=22||c<7)?"USTZ":(c>=14?"EUTZ":"AUTZ");
  return {a:bi,b:(bi+4)%24,tz:tz};
}
function hh(n){ return (n<10?"0":"")+n+":00"; }

/* ---- watchlist + recents ---- */
function watchKey(t,id){ return t+":"+id; }
function getWatch(){ return lsGet(LSW)||[]; }
function isWatched(t,id){ return getWatch().some(function(w){ return w.t===t&&w.id===id; }); }
function toggleWatch(t,id,name){
  var w=getWatch().filter(function(x){ return !(x.t===t&&x.id===id); });
  if(w.length===getWatch().length) w.unshift({t:t,id:id,n:name});
  lsSet(LSW,w.slice(0,12)); renderChips();
}
function addRecent(t,id,name){
  var r=(lsGet(LSR)||[]).filter(function(x){ return !(x.t===t&&x.id===id); });
  r.unshift({t:t,id:id,n:name}); lsSet(LSR,r.slice(0,8)); renderChips(); nameTrail(t,id,name);
}
function renderChips(){
  var h="", w=getWatch(), r=lsGet(LSR)||[];
  w.forEach(function(x){ h+="<button class='chip watch' data-t='"+x.t+"' data-id='"+x.id+"' title='On your watchlist. Stored in this browser only.'>&#9733; "+esc(x.n)+"</button>"; });
  r.forEach(function(x){ if(!isWatched(x.t,x.id)) h+="<button class='chip' data-t='"+x.t+"' data-id='"+x.id+"'>"+esc(x.n)+"</button>"; });
  chipsEl.innerHTML=h;
}
chipsEl.addEventListener("click",function(e){
  var b=e.target.closest?e.target.closest(".chip"):null; if(!b) return;
  loadTarget(b.getAttribute("data-t"),+b.getAttribute("data-id"));
});

/* ---- resolver ---- */
function run(){
  var raw=(q.value||"").trim(); if(!raw) return;
  var m=raw.match(/zkillboard\.com\/(character|corporation|alliance|system)\/(\d+)/);
  if(m){ loadTarget(m[1]==="character"?"char":m[1]==="corporation"?"corp":m[1]==="system"?"sys":"alli",+m[2]); return; }
  if(/^\d+$/.test(raw)){
    out.innerHTML="<div class='mwait'>resolving id...</div>";
    resolveNames([+raw]).then(function(map){
      var e=map[+raw], c=e&&e.category;
      if(c==="character") loadTarget("char",+raw);
      else if(c==="corporation") loadTarget("corp",+raw);
      else if(c==="alliance") loadTarget("alli",+raw);
      else notFound(raw);
    });
    return;
  }
  out.innerHTML="<div class='mwait'>resolving name...</div>";
  postJson(ESI+"/universe/ids/?datasource=tranquility",[raw]).then(function(d){
    var hits=[];
    (d.characters||[]).forEach(function(x){ hits.push({t:"char",id:x.id,n:x.name,l:"PILOT"}); });
    (d.corporations||[]).forEach(function(x){ hits.push({t:"corp",id:x.id,n:x.name,l:"CORP"}); });
    (d.alliances||[]).forEach(function(x){ hits.push({t:"alli",id:x.id,n:x.name,l:"ALLIANCE"}); });
    (d.systems||[]).forEach(function(x){ hits.push({t:"sys",id:x.id,n:x.name,l:"SYSTEM"}); });
    if(!hits.length){ notFound(raw); return; }
    if(hits.length===1){ loadTarget(hits[0].t,hits[0].id); return; }
    var h="<div class='bempty'>More than one match. Which one?</div><div class='ppl'>";
    hits.forEach(function(x){ h+="<button class='pplc' data-t='"+x.t+"' data-id='"+x.id+"'><span>"+esc(x.n)+"</span><span class='n'>"+x.l+"</span></button>"; });
    out.innerHTML=h+"</div>";
    out.querySelectorAll(".pplc").forEach(function(b){ b.addEventListener("click",function(){ loadTarget(b.getAttribute("data-t"),+b.getAttribute("data-id")); }); });
  }).catch(function(){ notFound(raw); });
}
function notFound(raw){
  out.innerHTML="<div class='verr'>No such name. EVE wants exact spelling. <a href='https://zkillboard.com/search/"+encodeURIComponent(raw)+"/' target='_blank' rel='noopener'>Search zkillboard instead</a>.</div>";
}

/* ---- the file ---- */
function loadTarget(t,id,force){
  cur={t:t,id:id};
  pushTrail(t,id);
  try{
    var u=new URL(location.href);
    u.searchParams.set("t",t); u.searchParams.set("id",id); u.searchParams.delete("q");
    history.pushState({t:t,id:id},"",u.pathname+u.search);
  }catch(e){}
  srcS={}; paintStatus();
  var ck=LSD+t+":"+id, cached=force?null:lsGet(ck);
  if(cached&&cached.digest){
    renderDigest(cached.digest,Date.now()-cached.ts);
    if(Date.now()-cached.ts<600000){ addRecent(t,id,cached.digest.name); return; }
  } else out.innerHTML="<div class='mwait'>pulling the file...</div>";
  buildDigest(t,id).then(function(D){
    if(!cur||cur.t!==t||cur.id!==id) return;
    renderDigest(D,0); lsSet(ck,{ts:Date.now(),digest:D});
    addRecent(t,id,D.name);
  }).catch(function(e){
    if(!cur||cur.t!==t||cur.id!==id) return;
    if(cached&&cached.digest) return; /* stale file already on screen, status strip has the story */
    out.innerHTML="<div class='verr'>zKill isn't answering ("+esc(String(e))+"). The file's on their desk: "
      +"<a href='https://zkillboard.com/"+TZW[t]+"/"+id+"/' target='_blank' rel='noopener'>read it there</a>.</div>";
  });
}

function fitted(flag){ return (flag>=11&&flag<=34)||(flag>=92&&flag<=98)||(flag>=125&&flag<=132); }

function buildDigest(t,id){
  if(t==="sys") return buildSystem(id);
  var D={v:1,t:t,id:id,ts:Date.now()};
  srcS.stats="..."; paintStatus();
  return zkGet("/stats/"+TPATH[t]+"/"+id+"/").then(function(s){
    srcS.stats="ok"; paintStatus();
    s=s||{};
    var info=s.info||{};
    D.name=info.name||("#"+id); D.ticker=info.ticker||""; D.members=info.memberCount||0;
    D.corps=info.corpCount||0; D.founded=info.date_founded||null;
    D.myCorp=info.corporationID||null; D.myAlli=info.allianceID||null;
    D.sd=s.shipsDestroyed||0; D.sl=s.shipsLost||0;
    D.ikd=s.iskDestroyed||0; D.ikl=s.iskLost||0;
    D.soloK=s.soloKills||0; D.soloL=s.soloLosses||0;
    D.danger=s.dangerRatio||0; D.gang=s.gangRatio||0; D.avgGang=s.avgGangSize||0;
    var mat=[],d2,h2,act=s.activity||{};
    for(d2=0;d2<7;d2++){ mat[d2]=[]; var row=act[String(d2)]||{}; for(h2=0;h2<24;h2++) mat[d2][h2]=+row[String(h2)]||0; }
    D.mat=mat; D.matMax=+act.max||0;
    D.top={};
    (s.topLists||[]).forEach(function(tl){
      if(tl.type==="solarSystem") D.top.sys=(tl.values||[]).slice(0,6);
      if(tl.type==="shipType") D.top.ship=(tl.values||[]).slice(0,6);
    });
    D.allTimeShips=[];
    if(t==="char") (s.topAllTime||[]).forEach(function(ta){ if(ta.type==="ship") D.allTimeShips=(ta.data||ta.values||[]).slice(0,5); });
    renderDigest(D,0,true);
    srcS.kills="..."; paintStatus();
    return zkGet("/kills/"+TPATH[t]+"/"+id+"/").catch(function(e){ srcS.kills=String(e); return []; });
  }).then(function(k1){
    k1=(k1||[]).filter(Boolean);
    var p=Promise.resolve([]);
    if(k1.length===200) p=zkGet("/kills/"+TPATH[t]+"/"+id+"/page/2/").catch(function(){ return []; });
    return p.then(function(k2){ return k1.concat((k2||[]).filter(Boolean)); });
  }).then(function(kills){
    D.kills=kills; if(srcS.kills==="...") srcS.kills=String(kills.length); paintStatus();
    srcS.losses="..."; paintStatus();
    return zkGet("/losses/"+TPATH[t]+"/"+id+"/").catch(function(e){ srcS.losses=String(e); return []; });
  }).then(function(l1){
    l1=(l1||[]).filter(Boolean);
    var p=Promise.resolve([]);
    if(l1.length===200) p=zkGet("/losses/"+TPATH[t]+"/"+id+"/page/2/").catch(function(){ return []; });
    return p.then(function(l2){ return l1.concat((l2||[]).filter(Boolean)); });
  }).then(function(losses){
    D.losses=losses; if(srcS.losses==="...") srcS.losses=String(losses.length); paintStatus();
    return compute(D);
  });
}

function compute(D){
  var t=D.t, id=D.id, kills=D.kills||[], losses=D.losses||[];
  D.nk=kills.length; D.nl=losses.length;
  function inOrg(a){
    if(t==="corp") return a.corporation_id===id;
    if(t==="alli") return a.alliance_id===id;
    return a.character_id===id;
  }
  /* prey */
  var prey={}, soft=0, tot=0;
  kills.forEach(function(m){
    var g=groupOf(m.victim&&m.victim.ship_type_id);
    prey[g.name]=(prey[g.name]||0)+1; tot++; if(g.soft) soft++;
  });
  D.prey=Object.keys(prey).map(function(n){ return {n:n,c:prey[n]}; }).sort(function(a,b){ return b.c-a.c; }).slice(0,8);
  D.softPct=tot?soft/tot:0;
  /* engagement */
  var largest=0;
  kills.forEach(function(m){ if(m.attackers&&m.attackers.length>largest) largest=m.attackers.length; });
  D.largest=largest;
  /* fleet net + members + victims */
  var net={}, mem={}, vic={};
  kills.forEach(function(m){
    (m.attackers||[]).forEach(function(a){
      if(!a.character_id) return;
      if(t==="char"){ if(a.character_id!==id) net[a.character_id]=(net[a.character_id]||0)+1; }
      else if(inOrg(a)) mem[a.character_id]=(mem[a.character_id]||0)+1;
      else net[a.character_id]=(net[a.character_id]||0)+1;
    });
    if(m.victim&&m.victim.character_id) vic[m.victim.character_id]=(vic[m.victim.character_id]||0)+1;
  });
  function topOf(o,n){ return Object.keys(o).map(function(k){ return {id:+k,c:o[k]}; }).sort(function(a,b){ return b.c-a.c; }).slice(0,n); }
  D.net=topOf(net,8); D.mem=topOf(mem,8); D.vic=topOf(vic,6);
  /* nemeses + modules from losses */
  var nem={}, mods={};
  losses.forEach(function(m){
    (m.attackers||[]).forEach(function(a){ if(a.character_id) nem[a.character_id]=(nem[a.character_id]||0)+(a.final_blow?2:1); });
    ((m.victim&&m.victim.items)||[]).forEach(function(it){ if(fitted(it.flag)) mods[it.item_type_id]=(mods[it.item_type_id]||0)+1; });
  });
  D.nem=topOf(nem,6);
  D.mods=topOf(mods,20);
  /* telemetry: newest 30 of both sides merged */
  var tele=[];
  kills.forEach(function(m){ tele.push({k:1,t:m.killmail_time,kid:m.killmail_id,ship:m.victim&&m.victim.ship_type_id,who:m.victim&&m.victim.character_id,sys:m.solar_system_id,att:(m.attackers||[]).length,val:m.zkb&&m.zkb.totalValue}); });
  losses.forEach(function(m){
    var fb=null; (m.attackers||[]).some(function(a){ if(a.final_blow&&a.character_id){ fb=a.character_id; return true; } return false; });
    tele.push({k:0,t:m.killmail_time,kid:m.killmail_id,ship:m.victim&&m.victim.ship_type_id,who:m.victim&&m.victim.character_id,sys:m.solar_system_id,att:(m.attackers||[]).length,fb:fb,val:m.zkb&&m.zkb.totalValue});
  });
  tele.sort(function(a,b){ return a.t<b.t?1:-1; });
  D.tele=tele.slice(0,30);
  /* roads: recent systems seen anywhere */
  var roads={};
  tele.forEach(function(r){ if(OUR_SYS[r.sys]) roads[r.sys]=1; });
  (D.top.sys||[]).forEach(function(s2){ if(OUR_SYS[s2.solarSystemID]) roads[s2.solarSystemID]=1; });
  D.roadIds=Object.keys(roads).map(Number);
  /* resolve every id we plan to print */
  var ids=[];
  D.net.forEach(function(x){ ids.push(x.id); }); D.mem.forEach(function(x){ ids.push(x.id); });
  D.vic.forEach(function(x){ ids.push(x.id); }); D.nem.forEach(function(x){ ids.push(x.id); });
  D.mods.forEach(function(x){ ids.push(x.id); });
  D.allTimeShips.forEach(function(x){ ids.push(x.shipTypeID); });
  D.tele.forEach(function(r){ ids.push(r.ship); if(r.who) ids.push(r.who); if(r.fb) ids.push(r.fb); ids.push(r.sys); });
  D.roadIds.forEach(function(x){ ids.push(x); });
  if(D.myCorp) ids.push(D.myCorp); if(D.myAlli) ids.push(D.myAlli);
  srcS.names="..."; paintStatus();
  return resolveNames(ids).then(function(map){
    srcS.names="ok"; paintStatus();
    function nm(x){ return nameOf(map,x); }
    D.net.forEach(function(x){ x.n=nm(x.id); }); D.mem.forEach(function(x){ x.n=nm(x.id); });
    D.vic.forEach(function(x){ x.n=nm(x.id); }); D.nem.forEach(function(x){ x.n=nm(x.id); });
    D.mods=D.mods.map(function(x){ return {name:nm(x.id),n:x.c}; });
    D.allTimeShips.forEach(function(x){ x.n=nm(x.shipTypeID); });
    D.tele.forEach(function(r){ r.shipN=nm(r.ship); r.whoN=r.who?nm(r.who):null; r.fbN=r.fb?nm(r.fb):null; r.sysN=nm(r.sys); });
    D.roadNames=D.roadIds.map(nm);
    D.corpN=D.myCorp?nm(D.myCorp):null; D.alliN=D.myAlli?nm(D.myAlli):null;
    D.tank=tankVerdict(D.mods);
    /* jumps from Rens to their top recent system, shortest route */
    var top1=(D.top.sys&&D.top.sys[0])||null;
    var rp=Promise.resolve(null);
    if(top1&&top1.solarSystemID) rp=fetch(ESI+"/route/"+RENS+"/"+top1.solarSystemID+"/?datasource=tranquility")
      .then(function(r){ return r.ok?r.json():null; }).then(function(a){ return a?a.length-1:null; }).catch(function(){ return null; });
    return beltsP.then(function(){ return rp; }).then(function(jumps){
      D.jumps=jumps;
      (D.top.sys||[]).forEach(function(s2){ s2.region=regionOf(s2.solarSystemName); });
      delete D.kills; delete D.losses; /* digest stays small enough to cache */
      return D;
    });
  });
}

/* ================= THE HUNTING GROUND (system dossier) =================
   zkill exposes /stats/solarSystemID/, which carries the whole read in one call:
   who hunts here, what they fly, where the kills land (locationName is already
   resolved, so the camp names itself), and the hour x weekday matrix. The kill
   list adds the two things stats cannot know: who is DYING here (residents), and
   whether the camp is warm right now. Our own additions on top: how far it is
   from home, whether it sits on our roads, what is left to mine, and the
   neighbours, because a quiet system next to a hot one is not quiet. */
/* ================= THE AREA MAP =================
   One system in the middle, every gate a stem of the same length so the picture is
   about connection rather than distance. Click a stem and it becomes the middle: the
   old view fades, the new neighbourhood fades in. Walking it costs nothing, because
   the jump graph and the universe kill feed are both already loaded and every system
   in New Eden is in them. The trail remembers where you came from. */
var MAP={id:null,trail:[]};
function secOf(sec){ return sec>=0.45?["hs","var(--ore)"]:sec>0?["ls","var(--amber)"]:["ns","var(--gob,#ff4757)"]; }
function areaNode(S,A,ix){
  var row=S.d.sys[ix], id=row[1], k=(A&&A.k[id])||{};
  return {ix:ix,id:id,n:row[0],sec:row[2],reg:S.d.regions[row[3]],
          kills:(k.ship_kills||0)+(k.pod_kills||0), npc:k.npc_kills||0,
          jumps:(A&&A.j[id])||0, road:!!OUR_SYS[id], gates:(row[4]||[]).length};
}
function paintMap(sysId,animate){
  var wrap=document.getElementById("mapwrap"); if(!wrap) return;
  Promise.all([loadSysGraph(),esiActivity()]).then(function(res){
    var S=res[0], A=res[1];
    if(!S||!S.d){ wrap.innerHTML="<div class='rnote' style='padding:14px'>The star map did not load.</div>"; return; }
    var ix=S.byId[sysId]; if(ix==null) return;
    MAP.id=sysId;
    var c=areaNode(S,A,ix);
    var nbs=(S.d.sys[ix][4]||[]).map(function(n){ return areaNode(S,A,n); });
    var W=760,H=470,cx=W/2,cy=H/2,R=155;
    var s="<svg viewBox='0 0 "+W+" "+H+"' preserveAspectRatio='xMidYMid meet'>";
    /* stems first so nodes sit on top */
    nbs.forEach(function(n,i){
      var ang=(-Math.PI/2)+(i*2*Math.PI/Math.max(1,nbs.length));
      n.x=cx+Math.cos(ang)*R; n.y=cy+Math.sin(ang)*R;
      s+="<line class='mstem"+(n.kills>0?" hot":"")+(n.road?" road":"")+"' x1='"+cx+"' y1='"+cy+"' x2='"+n.x+"' y2='"+n.y+"'/>";
    });
    var cc=secOf(c.sec);
    s+="<circle cx='"+cx+"' cy='"+cy+"' r='40' fill='#0c0e10' stroke='"+cc[1]+"' stroke-width='2'/>";
    s+="<g class='mnode' data-open='"+c.id+"'><circle cx='"+cx+"' cy='"+cy+"' r='40' fill='transparent' stroke='transparent'/>"
      +"<title>Open the file on "+esc(c.n)+"</title></g>";
    s+="<text class='mn ctr' x='"+cx+"' y='"+(cy-2)+"' text-anchor='middle'>"+esc(c.n)+"</text>";
    s+="<text class='ms' x='"+cx+"' y='"+(cy+12)+"' text-anchor='middle'>"+c.sec.toFixed(1)+" &#183; "+esc(c.reg||"")+"</text>";
    if(c.kills) s+="<text class='mk' x='"+cx+"' y='"+(cy+26)+"' text-anchor='middle' fill='"+"var(--gob,#ff4757)"+"'>"+c.kills+" killed</text>";
    nbs.forEach(function(n){
      var sc=secOf(n.sec), r=n.kills>0?22:18;
      s+="<g class='mnode' data-hop='"+n.id+"'>"
        +"<circle cx='"+n.x+"' cy='"+n.y+"' r='"+r+"' fill='"+(n.kills>0?"rgba(255,71,87,.14)":"#101214")+"' stroke='"+sc[1]+"' stroke-width='"+(n.road?2:1.4)+"'/>"
        +"<title>"+esc(n.n)+" &#183; "+n.sec.toFixed(1)+" &#183; "+n.gates+" gates &#183; "+(n.kills?n.kills+" killed this hour":"quiet")+"</title></g>";
      s+="<text class='mn' x='"+n.x+"' y='"+(n.y+r+13)+"' text-anchor='middle'>"+esc(n.n)+"</text>";
      s+="<text class='ms' x='"+n.x+"' y='"+(n.y+r+23)+"' text-anchor='middle'>"+n.sec.toFixed(1)+((n.road&&OURS)?" &#183; our road":"")+"</text>";
      if(n.kills) s+="<text class='mk' x='"+n.x+"' y='"+(n.y+4)+"' text-anchor='middle' fill='var(--gob,#ff4757)'>"+n.kills+"</text>";
    });
    s+="</svg>";
    function swap(){
      wrap.innerHTML=s;
      wrap.querySelectorAll("[data-hop]").forEach(function(g){
        g.addEventListener("click",function(){
          MAP.trail.push(sysId); if(MAP.trail.length>8) MAP.trail.shift();
          paintMap(+g.getAttribute("data-hop"),true);
        });
      });
      wrap.querySelectorAll("[data-open]").forEach(function(g){
        g.addEventListener("click",function(){ loadTarget("sys",+g.getAttribute("data-open")); });
      });
      paintAreaHud(c,nbs);
      wrap.classList.remove("fade");
    }
    if(animate){ wrap.classList.add("fade"); setTimeout(swap,170); } else swap();
  });
}
function paintAreaHud(c,nbs){
  var hud=document.getElementById("maphud"); if(!hud) return;
  var areaKills=c.kills+nbs.reduce(function(a,n){ return a+n.kills; },0);
  var hottest=nbs.slice().sort(function(a,b){ return b.kills-a.kills; })[0];
  var ls=nbs.filter(function(n){ return n.sec<0.45; }).length;
  var roads=nbs.filter(function(n){ return n.road; }).length+(c.road?1:0);
  var h="";
  h+="<div><div class='k'>GATES</div><div class='v'>"+nbs.length+"</div></div>";
  h+="<div><div class='k'>KILLED IN AREA</div><div class='v"+(areaKills?" hot":" ok")+"'>"+areaKills+"</div></div>";
  h+="<div><div class='k'>HOTTEST GATE</div><div class='v"+(hottest&&hottest.kills?" hot":"")+"' style='font-size:12px'>"
    +(hottest&&hottest.kills?esc(hottest.n)+" "+hottest.kills:"all quiet")+"</div></div>";
  h+="<div><div class='k'>WAY OUT</div><div class='v' style='font-size:12px'>"+(ls===nbs.length&&nbs.length?"none in highsec":(nbs.length-ls)+" highsec")+"</div></div>";
  h+="<div><div class='k'>TRAFFIC</div><div class='v'>"+c.jumps+"</div></div>";
  if(roads && OURS) h+="<div><div class='k'>OUR ROADS</div><div class='v ok'>"+roads+"</div></div>";
  hud.innerHTML=h;
  /* the trail: where you walked in from, newest last, each one a way back */
  var tr=document.getElementById("maptrail");
  if(!tr) return;
  if(!MAP.trail.length){ tr.innerHTML=""; return; }
  loadSysGraph().then(function(S){
    var hops=MAP.trail.slice(-5).map(function(id){
      var ix=S.byId[id]; return {id:id,n:ix!=null?S.d.sys[ix][0]:("system "+id)};
    });
    tr.innerHTML="<span class='sep'>walked in from</span>"
      +hops.map(function(x){ return "<button data-back='"+x.id+"'>"+esc(x.n)+"</button>"; }).join("<span class='sep'>&#8594;</span>");
    tr.querySelectorAll("[data-back]").forEach(function(b){
      b.addEventListener("click",function(){
        var id=+b.getAttribute("data-back");
        var at=MAP.trail.lastIndexOf(id);
        if(at>=0) MAP.trail=MAP.trail.slice(0,at);
        paintMap(id,true);
      });
    });
  });
}

var WEBSRC={id:null,name:null,mails:null};
var SYSG=null;
function loadSysGraph(){
  if(SYSG) return Promise.resolve(SYSG);
  return fetch("/fleet/systems.json").then(function(r){ return r.json(); }).then(function(d){
    var byId={},byName={};
    d.sys.forEach(function(row,i){ byId[row[1]]=i; byName[row[0].toLowerCase()]=i; });
    SYSG={d:d,byId:byId,byName:byName}; return SYSG;
  }).catch(function(){ SYSG={d:null}; return SYSG; });
}
function jumpsBetween(S,fromId,toId,cap){
  if(!S||!S.d) return null;
  var a=S.byId[fromId],b=S.byId[toId]; if(a==null||b==null) return null;
  if(a===b) return 0;
  var seen={},q=[[a,0]]; seen[a]=1;
  while(q.length){
    var cur=q.shift();
    if(cur[1]>=(cap||12)) continue;
    var nb=S.d.sys[cur[0]][4]||[];
    for(var i=0;i<nb.length;i++){
      if(nb[i]===b) return cur[1]+1;
      if(!seen[nb[i]]){ seen[nb[i]]=1; q.push([nb[i],cur[1]+1]); }
    }
  }
  return null;
}
var ESIACT=null;
function esiActivity(){
  if(ESIACT) return Promise.resolve(ESIACT);
  return Promise.all([
    fetch(ESI+"/universe/system_kills/?datasource=tranquility").then(function(r){ return r.ok?r.json():[]; }).catch(function(){ return []; }),
    fetch(ESI+"/universe/system_jumps/?datasource=tranquility").then(function(r){ return r.ok?r.json():[]; }).catch(function(){ return []; })
  ]).then(function(a){
    var k={},j={};
    (a[0]||[]).forEach(function(x){ k[x.system_id]=x; });
    (a[1]||[]).forEach(function(x){ j[x.system_id]=x.ship_jumps; });
    ESIACT={k:k,j:j}; return ESIACT;
  });
}
function buildSystem(id){
  var D={v:1,t:"sys",id:id,ts:Date.now()};
  srcS.stats="..."; paintStatus();
  return zkGet("/stats/solarSystemID/"+id+"/").then(function(s){
    srcS.stats="ok"; paintStatus();
    s=s||{}; var info=s.info||{};
    D.name=info.name||("system "+id);
    D.sec=info.secStatus!=null?info.secStatus:null;
    D.regionID=info.regionID||null; D.secClass=info.secClass||null;
    D.sd=s.shipsDestroyed||0; D.ikd=s.iskDestroyed||0; D.soloK=s.soloKills||0;
    D.avgGang=s.avgGangSize||0;
    var mat=[],d2,h2,act=s.activity||{};
    for(d2=0;d2<7;d2++){ mat[d2]=[]; var row=act[String(d2)]||{}; for(h2=0;h2<24;h2++) mat[d2][h2]=+row[String(h2)]||0; }
    D.mat=mat; D.matMax=+act.max||0;
    D.top={};
    (s.topLists||[]).forEach(function(t){
      var v=t.values||[];
      if(t.type==="character") D.top.chars=v.slice(0,10);
      if(t.type==="corporation") D.top.corps=v.slice(0,6);
      if(t.type==="alliance") D.top.allis=v.slice(0,6);
      if(t.type==="shipType") D.top.ships=v.slice(0,8);
      if(t.type==="location") D.top.locs=v.slice(0,6);
    });
    renderSystem(D,0,true);
    srcS.kills="..."; paintStatus();
    return zkGet("/kills/systemID/"+id+"/").catch(function(e){ srcS.kills=String(e); return []; });
  }).then(function(list){
    list=(list||[]).filter(Boolean);
    srcS.kills=String(list.length); paintStatus();
    /* residents: you die where you live. zkill's system topLists are kill-side only,
       so occupancy has to come from the victims. */
    var vc={},va={},tele=[],locFresh={};
    list.forEach(function(m){
      var v=m.victim||{};
      if(v.corporation_id) vc[v.corporation_id]=(vc[v.corporation_id]||0)+1;
      if(v.alliance_id) va[v.alliance_id]=(va[v.alliance_id]||0)+1;
      var lid=(m.zkb||{}).locationID;
      if(lid&&!locFresh[lid]) locFresh[lid]=m.killmail_time;
      if(tele.length<30){
        var fb=null; (m.attackers||[]).some(function(a){ if(a.final_blow&&a.character_id){ fb=a.character_id; return true; } return false; });
        tele.push({t:m.killmail_time,kid:m.killmail_id,ship:v.ship_type_id,who:v.character_id,
                   att:(m.attackers||[]).length,fb:fb,val:(m.zkb||{}).totalValue});
      }
    });
    function top(o,n){ return Object.keys(o).map(function(k){ return {id:+k,c:o[k]}; }).sort(function(a,b){ return b.c-a.c; }).slice(0,n); }
    WEBSRC={id:id,name:D.name,mails:list};   /* kept in memory for the deep read, never cached */
    D.resCorps=top(vc,6); D.resAllis=top(va,6); D.tele=tele; D.locFresh=locFresh;
    D.nk=list.length;
    var ids=[];
    D.resCorps.forEach(function(x){ ids.push(x.id); }); D.resAllis.forEach(function(x){ ids.push(x.id); });
    D.tele.forEach(function(r){ ids.push(r.ship); if(r.who) ids.push(r.who); if(r.fb) ids.push(r.fb); });
    if(D.regionID) ids.push(D.regionID);
    srcS.names="..."; paintStatus();
    return resolveNames(ids).then(function(map){
      srcS.names="ok"; paintStatus();
      D.resCorps.forEach(function(x){ x.n=nameOf(map,x.id); });
      D.resAllis.forEach(function(x){ x.n=nameOf(map,x.id); });
      D.tele.forEach(function(r){ r.shipN=nameOf(map,r.ship); r.whoN=r.who?nameOf(map,r.who):null; r.fbN=r.fb?nameOf(map,r.fb):null; });
      D.regionN=D.regionID?nameOf(map,D.regionID):null;
      return Promise.all([loadSysGraph(),esiActivity(),beltsP]);
    }).then(function(res){
      var S=res[0],A=res[1];
      D.live=(A.k[id]||{}); D.jumpsHr=A.j[id]||0;
      D.jMohas=jumpsBetween(S,30000031,id,12);
      D.jRens=jumpsBetween(S,30002510,id,12);
      D.ourRoad=!!OUR_SYS[id];
      /* the neighbours: a calm system beside a camp is not calm */
      D.nb=[];
      if(S&&S.d&&S.byId[id]!=null){
        (S.d.sys[S.byId[id]][4]||[]).forEach(function(ix){
          var row=S.d.sys[ix]; if(!row) return;
          var lk=A.k[row[1]]||{};
          D.nb.push({n:row[0],id:row[1],sec:row[2],kills:(lk.ship_kills||0)+(lk.pod_kills||0)});
        });
        D.nb.sort(function(a,b){ return b.kills-a.kills; });
      }
      var reg=regionOf(D.name);
      if(!D.regionN&&reg) D.regionN=reg;
      D.belts=null;
      if(beltsIdx&&D.regionN){ /* belts.json is region keyed; find our row for rock counts */
        D.belts=(BELTROW&&BELTROW[D.name])||null;
      }
      delete D.kills;
      return D;
    });
  });
}
/* belts.json gives belts/moons/stations per system. We index it once, by name. */
var BELTROW=null;
beltsP=beltsP.then(function(){
  return fetch("/lowsec/belts.json").then(function(r){ return r.ok?r.json():null; }).then(function(d){
    BELTROW={};
    if(d&&d.regions) for(var reg in d.regions) d.regions[reg].forEach(function(x){ BELTROW[x.n]={b:x.b,m:x.m,st:x.st,s:x.s}; });
  }).catch(function(){ BELTROW={}; });
});

function hourTotals(mat){ var h=[],i,d; for(i=0;i<24;i++){ h[i]=0; for(d=0;d<7;d++) h[i]+=mat[d][i]; } return h; }
function worstWindow(hours,len,want){
  var best=null,bi=0,i,k;
  for(i=0;i<24;i++){ var s=0; for(k=0;k<len;k++) s+=hours[(i+k)%24];
    if(best===null||(want==="max"?s>best:s<best)){ best=s; bi=i; } }
  return {a:bi,b:(bi+len)%24,v:best};
}
function renderSystem(D,ageMs,partial){
  var secTxt=D.sec!=null?D.sec.toFixed(1):"?";
  var band=D.sec>=0.45?"hs":D.sec>0?"ls":"ns";
  var hours=D.matMax?hourTotals(D.mat):null;
  var hot=hours?worstWindow(hours,4,"max"):null, calm=hours?worstWindow(hours,4,"min"):null;
  var tz=null; if(hot){ var c=(hot.a+2)%24; tz=(c>=22||c<7)?"USTZ":(c>=14?"EUTZ":"AUTZ"); }
  var h="";
  h+="<div class='idcard'><div class='idmain'><div class='idname'>"+esc(D.name)
    +"<span class='secb "+band+"' style='font-size:16px'>"+secTxt+"</span>"
    +(D.regionN?"<span class='tick2'>"+esc(D.regionN)+"</span>":"")
    +(ageMs>60000?"<span class='cachech'>cached "+Math.round(ageMs/60000)+"m ago</span>":"")
    +"</div><div class='idsub'>";
  var bits=[];
  /* Distance from home names our homes. Members only. */
  if(OURS){
    if(D.jMohas!=null) bits.push(D.jMohas+" jumps from Mohas");
    else if(D.jRens==null) bits.push("more than 12 jumps from home");
    if(D.jRens!=null) bits.push(D.jRens+" from Rens");
  }
  if(D.belts) bits.push(D.belts.b+" belts &middot; "+D.belts.m+" moons"+(D.belts.st?" &middot; "+D.belts.st+" stations":""));
  h+=bits.join(" &middot; ")+"</div>";
  h+="<div class='idacts'>"
    +"<button class='starb"+(isWatched("sys",D.id)?" on":"")+"' id='starb'>"+(isWatched("sys",D.id)?"&#9733; watching":"&#9734; watch")+"</button>"
    +"<span class='zlink'><a href='https://zkillboard.com/system/"+D.id+"/' target='_blank' rel='noopener'>zKillboard &#8599;</a></span>"
    /* the cartel link is a PBKDF2 locked page: a guaranteed dead end for a stranger,
       and it advertises that a corridor tool exists. Members only. */
    + (OURS ? "<span class='zlink'><a href='/cartel/?to="+encodeURIComponent(D.name)+"'>check the road &#8594;</a></span>" : "");
  if(D.ourRoad && OURS) h+="<span class='roadchip' style='margin:0'>OUR ROAD</span>";
  h+="</div></div></div>";
  /* the sentence */
  if(hot&&calm){
    h+="<div class='huntline'><span class='hl'>HUNTING GROUND</span>"
      +"Most dangerous "+hh(hot.a)+" to "+hh(hot.b)+" EVE"+(tz?" ("+tz+" prime)":"")+". "
      +"Quietest "+hh(calm.a)+" to "+hh(calm.b)+". "
      +(D.top.locs&&D.top.locs[0]?("Nearly everything dies at "+esc(D.top.locs[0].locationName||"one spot")+"."):"")
      +"</div>";
  }
  h+="<div class='stats'>"
    +"<div class='stt'><div class='k'>SHIPS DESTROYED</div><div class='v'>"+(D.sd>=1000?(D.sd/1000).toFixed(0)+"k":D.sd)+"</div></div>"
    +"<div class='stt'><div class='k'>ISK DESTROYED</div><div class='v'>"+isk(D.ikd)+"</div></div>"
    +"<div class='stt'><div class='k'>KILLS THIS HOUR</div><div class='v "+(((D.live||{}).ship_kills||0)>0?"bad":"")+"'>"+(((D.live||{}).ship_kills)||0)+"</div></div>"
    +"<div class='stt'><div class='k'>PODS THIS HOUR</div><div class='v'>"+(((D.live||{}).pod_kills)||0)+"</div></div>"
    +"<div class='stt'><div class='k'>TRAFFIC / HR</div><div class='v'>"+(D.jumpsHr||0)+"</div></div>"
    +"<div class='stt'><div class='k'>PEAK</div><div class='v' style='font-size:15px'>"+(hot?hh(hot.a)+"-"+hh(hot.b):"n/a")+"</div></div>"
    +"</div>";
  if(partial){ h+="<div class='sec'><div class='mwait'>reading the killmails...</div></div>"; out.innerHTML=h; wireSystem(D); return; }
  /* where it happens */
  if(D.top.locs&&D.top.locs.length){
    var freshest=null;
    (D.top.locs||[]).forEach(function(l){ var f=(D.locFresh||{})[l.locationID]; if(f&&(!freshest||f>freshest.t)) freshest={t:f,n:l.locationName}; });
    h+="<div class='sec'><div class='shead'><b>WHERE IT HAPPENS</b>"
      +(freshest?"<span class='samp'>last kill there "+ago(freshest.t)+"</span>":"")+"</div>";
    var totL=0; D.top.locs.forEach(function(l){ totL+=l.kills||0; });
    var prim=D.top.locs[0];
    if(prim&&totL) h+="<div class='verd'><b style='color:var(--silver)'>"+esc(prim.locationName||"one spot")+"</b> takes "
      +Math.round((prim.kills/totL)*100)+"% of it. If you are passing through, that is the thing to not be near.</div>";
    h+="<table class='btbl'><thead><tr><th>SPOT</th><th class='num'>KILLS</th><th class='num'>ISK</th><th>LAST SEEN</th></tr></thead><tbody>";
    D.top.locs.forEach(function(l){
      var f=(D.locFresh||{})[l.locationID];
      h+="<tr><td>"+esc(l.locationName||("location "+l.locationID))+"</td><td class='num'>"+(l.kills||0)+"</td>"
        +"<td class='num'>"+isk(l.isk)+"</td><td>"+(f?ago(f):"")+"</td></tr>";
    });
    h+="</tbody></table></div>";
  }
  /* the fights: the mails are already in memory, so this costs nothing */
  h+="<div class='sec'><div class='shead'><b>THE FIGHTS</b><span class='samp'>clustered from the same killmails</span></div>"
    +"<div id='fightsout'></div></div>";
  /* danger clock */
  if(hours){
    var mx=Math.max.apply(null,hours)||1;
    h+="<div class='sec'><div class='shead'><b>DANGER CLOCK</b> &middot; KILLS BY HOUR, EVE TIME</div><div class='hmwrap'><div class='hm'>";
    h+="<div class='hmrow' style='grid-template-columns:36px repeat(24,1fr)'><span class='hmd'>KILLS</span>";
    for(var q=0;q<24;q++){
      var a2=hours[q]?(0.12+0.85*hours[q]/mx):0;
      var isHot=hot&&((q>=hot.a&&q<hot.a+4)||(hot.a+4>24&&q<(hot.a+4)%24));
      h+="<span class='hmc' title='"+hh(q)+" &middot; "+hours[q]+" kills'"+(hours[q]?" style='background:rgba(255,71,87,"+a2.toFixed(2)+")"+(isHot?";outline:1px solid rgba(255,71,87,.5)":"")+"'":"")+"></span>";
    }
    h+="</div><div class='hmrow' style='grid-template-columns:36px repeat(24,1fr)'><span class='hmd'></span>";
    for(var q2=0;q2<24;q2++) h+="<span class='hmx'>"+(q2%3===0?(q2<10?"0":"")+q2:"")+"</span>";
    h+="</div></div></div></div>";
  }
  /* who hunts / who dies */
  h+="<div class='sec grid2'><div>";
  h+="<div class='shead'><b>WHO HUNTS HERE</b></div>";
  if(D.top.chars&&D.top.chars.length){
    h+="<div class='ppl'>";
    D.top.chars.forEach(function(c){
      h+="<button class='pplc' data-t='char' data-id='"+c.characterID+"'><img loading='lazy' src='"+IMG+"/characters/"+c.characterID+"/portrait?size=32' onerror='this.style.display=\"none\"' alt=''><span>"+esc(c.characterName)+"</span><span class='n'>"+(c.kills||0)+"</span></button>";
    });
    h+="</div>";
  } else h+="<div class='verd'>Nobody with a repeat.</div>";
  h+="<div class='shead' style='margin-top:16px'><b>ACTIVE ORGS</b> &middot; KILL SIDE</div><div class='ppl'>";
  (D.top.allis||[]).forEach(function(a){ h+="<button class='pplc' data-t='alli' data-id='"+a.allianceID+"'><span>"+esc(a.allianceName)+"</span><span class='n'>"+(a.kills||0)+"</span></button>"; });
  (D.top.corps||[]).forEach(function(c){ h+="<button class='pplc' data-t='corp' data-id='"+c.corporationID+"'><span>"+esc(c.corporationName)+"</span><span class='n'>"+(c.kills||0)+"</span></button>"; });
  h+="</div>";
  h+="</div><div>";
  h+="<div class='shead'><b>WHO DIES HERE</b> &middot; LIKELY RESIDENTS<span class='samp'>from "+(D.nk||0)+" mails</span></div>";
  h+="<div class='verd'>You die where you live. These are the ones taking losses in system.</div><div class='ppl'>";
  (D.resAllis||[]).forEach(function(a){ h+="<button class='pplc' data-t='alli' data-id='"+a.id+"'><span>"+esc(a.n)+"</span><span class='n'>"+a.c+" lost</span></button>"; });
  (D.resCorps||[]).forEach(function(c){ h+="<button class='pplc' data-t='corp' data-id='"+c.id+"'><span>"+esc(c.n)+"</span><span class='n'>"+c.c+" lost</span></button>"; });
  h+="</div>";
  if(D.nb&&D.nb.length){
    h+="<div class='shead' style='margin-top:16px'><b>THE NEIGHBOURS</b> &middot; ONE JUMP OUT</div>";
    h+="<table class='btbl'><thead><tr><th>SYSTEM</th><th>SEC</th><th class='num'>KILLS/HR</th></tr></thead><tbody>";
    D.nb.slice(0,8).forEach(function(n){
      var b2=n.sec>=0.45?"hs":n.sec>0?"ls":"ns";
      h+="<tr><td><a href='?t=sys&id="+n.id+"' style='color:var(--silver-dim)'>"+esc(n.n)+"</a></td>"
        +"<td class='secb "+b2+"'>"+n.sec.toFixed(1)+"</td><td class='num'>"+(n.kills||"")+"</td></tr>";
    });
    h+="</tbody></table></div>";
  }
  h+="</div></div>";
  /* the area, walkable: gates as equal stems, hop one and it recentres */
  h+="<div class='sec'><div class='shead'><b>THE AREA</b><span class='samp'>click a gate to walk it</span></div>"
    +"<div class='mapwrap' id='mapwrap'><div class='rnote' style='padding:18px'>drawing the map&hellip;</div></div>"
    +"<div class='maphud' id='maphud'></div><div class='maptrail' id='maptrail'></div></div>";
  /* the deep read, on request */
  h+="<div class='sec'><div class='shead'><b>READ BETWEEN THE LINES</b><span class='samp'>goes four layers deep</span></div>"
    +"<div class='verd'>Who is actually working this system, whether they are a crew or just a banner, "
    +"and the one that matters: do they live here, or do they come here. Takes about twenty seconds.</div>"
    +"<button class='readbtn' id='webgo'>read between the lines</button>"
    +"<div id='webout'></div></div>";
  /* meta */
  if(D.top.ships&&D.top.ships.length){
    h+="<div class='sec'><div class='shead'><b>THE META HERE</b> &middot; MOST FLOWN ON KILLS</div><div class='docl'>";
    D.top.ships.forEach(function(s){
      h+="<span class='docc'><img loading='lazy' src='"+IMG+"/types/"+s.shipTypeID+"/render?size=64' onerror='this.style.display=\"none\"' alt=''><span><div class='dn'>"+esc(s.shipName||"?")+"</div><div class='dk'>&times;"+(s.kills||0)+"</div></span></span>";
    });
    h+="</div></div>";
  }
  /* weekday heatmap + recent */
  if(D.matMax>0){
    var days=["SUN","MON","TUE","WED","THU","FRI","SAT"];
    h+="<div class='sec'><div class='shead'><b>COMBAT PATTERN</b> &middot; HOUR &times; WEEKDAY</div><div class='hmwrap'><div class='hm'>";
    h+="<div class='hmrow'><span class='hmd'></span>";
    for(var hx=0;hx<24;hx++) h+="<span class='hmx'>"+(hx%3===0?(hx<10?"0":"")+hx:"")+"</span>";
    h+="</div>";
    for(var dd=0;dd<7;dd++){
      h+="<div class='hmrow'><span class='hmd'>"+days[dd]+"</span>";
      for(var hy=0;hy<24;hy++){
        var n3=D.mat[dd][hy],a3=n3?(0.12+0.85*n3/D.matMax):0;
        h+="<span class='hmc' title='"+days[dd]+" "+hh(hy)+" &middot; "+n3+" kills'"+(n3?" style='background:rgba(255,71,87,"+a3.toFixed(2)+")'":"")+"></span>";
      }
      h+="</div>";
    }
    h+="</div></div></div>";
  }
  if(D.tele&&D.tele.length){
    h+="<div class='sec'><div class='shead'><b>RECENT KILLS IN SYSTEM</b><span class='samp'>last "+D.tele.length+"</span></div>";
    h+="<table class='btbl'><thead><tr><th>SHIP</th><th>PILOT</th><th>GANG</th><th class='num'>VALUE</th><th>WHEN</th><th></th></tr></thead><tbody>";
    D.tele.forEach(function(r){
      h+="<tr><td>"+esc(r.shipN||"?")+"</td><td class='telewho'>"+(r.whoN?esc(r.whoN):"<span class='n'>no pilot</span>")
        +(r.fbN?" <span style='color:var(--muted)'>&middot; final blow "+esc(r.fbN)+"</span>":"")+"</td>"
        +"<td>"+(r.att<=1?"SOLO":r.att+" on it")+"</td><td class='num'>"+isk(r.val)+"</td><td>"+ago(r.t)+"</td>"
        +"<td>"+zlink(r.kid)+"</td></tr>";
    });
    h+="</tbody></table></div>";
  }
  out.innerHTML=h;
  wireSystem(D);
}
/* ================= READ BETWEEN THE LINES =================
   The dossier says what happened here. This says what it MEANS, and it only runs
   when asked because the last layer costs a call per pilot.

   L1  the mails we already hold -> every attacker, tallied, with who they fly with
   L2  ONE bulk affiliation call  -> those pilots collapse into crews (alliance else corp)
   L3  a stats call per top hunter -> their OWN number one system
   L4  the inference: if a crew's pilots rank THIS system first they live here. If they
       rank somewhere else first they are visiting, and that somewhere else is where
       they come from, which is the thing you actually want to know before you undock.
   Everything it claims, it shows the number for. */
function runWeb(D){
  var btn=document.getElementById("webgo"), host=document.getElementById("webout");
  if(!btn||!host) return;
  if(!WEBSRC.mails||WEBSRC.id!==D.id){
    host.innerHTML="<div class='mwait'>reading the killmails...</div>";
    btn.disabled=true;
    ensureMails(D.id).then(function(list){
      btn.disabled=false;
      if(!list||!list.length){ host.innerHTML="<div class='verd'>Could not read the killmails for this system.</div>"; return; }
      runWeb(D);
    });
    return;
  }
  btn.disabled=true; btn.textContent="reading...";
  var mails=WEBSRC.mails;
  /* L1: attackers tallied, plus who shares a mail with whom. Cap the clique at 15 so a
     100 man blob does not make every pilot in it look like everyone's crewmate. */
  var pilots={}, pairs={};
  mails.forEach(function(m){
    var ats=(m.attackers||[]).filter(function(a){ return a.character_id; });
    var uniq=[],seen={};
    ats.forEach(function(a){ if(!seen[a.character_id]){ seen[a.character_id]=1; uniq.push(a); } });
    uniq.forEach(function(a){
      var p=pilots[a.character_id]||(pilots[a.character_id]={id:a.character_id,n:0,isk:0,hrs:{},ships:{},corp:a.corporation_id,alli:a.alliance_id});
      p.n++; p.isk+=((m.zkb||{}).totalValue||0);
      var hr=new Date(m.killmail_time).getUTCHours(); p.hrs[hr]=(p.hrs[hr]||0)+1;
      if(a.ship_type_id) p.ships[a.ship_type_id]=(p.ships[a.ship_type_id]||0)+1;
    });
    if(uniq.length<=15){
      for(var i=0;i<uniq.length;i++) for(var j=i+1;j<uniq.length;j++){
        var k=[uniq[i].character_id,uniq[j].character_id].sort().join(":");
        pairs[k]=(pairs[k]||0)+1;
      }
    }
  });
  var plist=Object.keys(pilots).map(function(k){ return pilots[k]; }).sort(function(a,b){ return b.n-a.n; });
  if(!plist.length){ host.innerHTML="<div class='verd'>Nobody killed anything here recently. Nothing to read.</div>"; btn.disabled=false; btn.textContent="read between the lines"; return; }
  var focus=plist.slice(0,40);
  host.innerHTML="<div class='mwait'>grouping "+plist.length+" hunters...</div>";
  /* L2: one call turns 40 pilots into their orgs */
  postJson(ESI+"/characters/affiliation/?datasource=tranquility",focus.map(function(p){ return p.id; }))
  .then(function(aff){
    var by={}; aff.forEach(function(a){ by[a.character_id]=a; });
    focus.forEach(function(p){ var a=by[p.id]||{}; p.corp=a.corporation_id||p.corp; p.alli=a.alliance_id||p.alli; });
    var crews={}, loners=0;
    focus.forEach(function(p){
      /* an NPC starter corp is not an organisation, it is the absence of one. Grouping
         Federal Navy Academy as a "crew" would invent a gang out of unaffiliated pilots. */
      if(!p.alli&&p.corp&&p.corp<2000000){ loners++; return; }
      var key=(p.alli?"a"+p.alli:"c"+p.corp);
      var c=crews[key]||(crews[key]={key:key,id:p.alli||p.corp,t:p.alli?"alli":"corp",pilots:[],n:0,isk:0,hrs:{},ships:{}});
      c.pilots.push(p); c.n+=p.n; c.isk+=p.isk;
      for(var h in p.hrs) c.hrs[h]=(c.hrs[h]||0)+p.hrs[h];
      for(var s in p.ships) c.ships[s]=(c.ships[s]||0)+p.ships[s];
    });
    var clist=Object.keys(crews).map(function(k){ return crews[k]; }).sort(function(a,b){ return b.n-a.n; }).slice(0,6);
    clist.loners=loners;
    /* how tight is each crew: do its own pilots actually appear together */
    clist.forEach(function(c){
      var tog=0,tot=0;
      for(var i=0;i<c.pilots.length;i++) for(var j=i+1;j<c.pilots.length;j++){
        tot++; var k=[c.pilots[i].id,c.pilots[j].id].sort().join(":"); if(pairs[k]) tog++;
      }
      c.tight=tot?tog/tot:0;
    });
    var ids=[]; clist.forEach(function(c){ ids.push(c.id); c.pilots.slice(0,8).forEach(function(p){ ids.push(p.id); }); });
    ids.push(D.id);
    return resolveNames(ids).then(function(map){
      clist.forEach(function(c){
        c.name=nameOf(map,c.id);
        c.pilots.forEach(function(p){ p.name=nameOf(map,p.id); });
      });
      host.innerHTML="<div class='mwait'>reading where "+Math.min(10,focus.length)+" of them actually live...</div>";
      /* L3: the residency question, one call per top hunter, serialized */
      var probe=[];
      clist.forEach(function(c){ c.pilots.slice(0,2).forEach(function(p){ if(probe.length<10) probe.push(p); }); });
      return probe.reduce(function(chain,p){
        return chain.then(function(){
          return statsFor(p.id).then(function(s){
            if(!s) return;
            var tl=(s.topLists||[]).filter(function(t){ return t.type==="solarSystem"; })[0];
            var v=(tl&&tl.values)||[];
            p.homeId=v[0]?v[0].solarSystemID:null;
            p.homeN=v[0]?v[0].solarSystemName:null;
            p.homeKills=v[0]?v[0].kills:0;
            p.hereRank=null;
            v.forEach(function(x,ix){ if(x.solarSystemID===D.id&&p.hereRank===null) p.hereRank=ix+1; });
            p.danger=s.dangerRatio||0; p.lifetime=s.shipsDestroyed||0;
          }).catch(function(){});
        });
      },Promise.resolve()).then(function(){ return {clist:clist,map:map}; });
    });
  }).then(function(res){
    renderWeb(D,res.clist,plist.length);
    btn.disabled=false; btn.textContent="read it again";
  }).catch(function(e){
    host.innerHTML="<div class='verr'>Could not finish the read ("+esc(String(e))+").</div>";
    btn.disabled=false; btn.textContent="read between the lines";
  });
}
function statsFor(id){
  var c=lsGet(LSD+"char:"+id);
  if(c&&c.raw&&Date.now()-c.ts<600000) return Promise.resolve(c.raw);
  return zkGet("/stats/characterID/"+id+"/").then(function(s){
    if(s&&s.info) lsSet(LSD+"char:"+id,{ts:Date.now(),raw:s});
    return s;
  });
}
function crewHours(c){
  var hrs=[],h; for(h=0;h<24;h++) hrs[h]=c.hrs[h]||0;
  var best=-1,bi=0;
  for(h=0;h<24;h++){ var s=hrs[h]+hrs[(h+1)%24]+hrs[(h+2)%24]+hrs[(h+3)%24]; if(s>best){ best=s; bi=h; } }
  return {a:bi,b:(bi+4)%24};
}
function renderWeb(D,clist,totalHunters){
  var host=document.getElementById("webout");
  /* the inference */
  var resident=[],visitor=[];
  clist.forEach(function(c){
    var probed=c.pilots.filter(function(p){ return p.homeId; });
    c.probed=probed.length;
    c.livesHere=probed.length?probed.filter(function(p){ return p.homeId===D.id; }).length/probed.length:0;
    c.from=null;
    if(c.livesHere<0.5&&probed.length){
      var away=probed.filter(function(p){ return p.homeId!==D.id; })[0];
      if(away){ c.from=away.homeN; c.fromId=away.homeId; }
    }
    (c.livesHere>=0.5?resident:visitor).push(c);
  });
  var lead=clist[0], win=lead?crewHours(lead):null;
  var h="";
  /* the read, in layers */
  h+="<div class='layer hot'><div class='lk'>LAYER 1 &middot; WHO IS ACTUALLY HERE</div><div class='lv'>"
    +totalHunters+" pilots put damage on something here, but "+clist.length+" group"+(clist.length===1?"":"s")
    +" account for the weight of it. "+(lead?esc(lead.name)+" is the one that matters, "+lead.n+" appearances.":"")
    +(clist.loners?" "+clist.loners+" of the top names fly in NPC starter corps, which is not a crew, just pilots with no organisation.":"")
    +"</div></div>";
  if(lead) h+="<div class='layer'><div class='lk'>LAYER 2 &middot; WHETHER THEY ARE A CREW</div><div class='lv'>"
    +(lead.tight>=0.5
      ? esc(lead.name)+" fly together, not just near each other: "+Math.round(lead.tight*100)+"% of their pairs share killmails."
      : esc(lead.name)+" mostly show up separately ("+Math.round(lead.tight*100)+"% of pairs share a mail), so this reads as several small groups under one banner rather than one gang.")
    +(win?" Their hours here are "+hh(win.a)+" to "+hh(win.b)+" EVE.":"")
    +"</div></div>";
  /* only crews that actually carry weight get named in the read. A single probed pilot
     from a two mail corp is true and meaningless; it stays in the cards below. */
  var WEIGHT=20;
  var resNamed=resident.filter(function(c){ return c.n>=WEIGHT; }), visNamed=visitor.filter(function(c){ return c.from&&c.n>=WEIGHT; });
  var minor=resident.length-resNamed.length;
  h+="<div class='layer"+(visNamed.length?" hot":"")+"'><div class='lk'>LAYER 3 &middot; DO THEY LIVE HERE</div><div class='lv'>";
  if(!resNamed.length&&!visNamed.length) h+="Not enough history on these pilots to say where they live.";
  else{
    if(resNamed.length) h+="<b style='color:var(--silver)'>"+esc(resNamed.map(function(c){ return c.name; }).join(", "))+"</b> rank this system first on their own killboard. They live here.";
    if(visNamed.length) h+=(resNamed.length?" ":"")+"<b style='color:var(--amber)'>"+esc(visNamed.map(function(c){ return c.name; }).join(", "))+"</b> "
      +(visNamed.length===1?"does":"do")+" not. "+(visNamed.length===1?"They come":"They come")+" from "
      +esc(visNamed.map(function(c){ return c.from; }).filter(Boolean).join(", "))+".";
    if(minor>0) h+=" <span style='color:var(--muted)'>("+minor+" smaller group"+(minor===1?"":"s")+" also rank it first, on too few kills to lean on.)</span>";
  }
  h+="</div></div>";
  h+="<div class='layer'><div class='lk'>LAYER 4 &middot; WHAT THAT MEANS</div><div class='lv'>";
  if(visitor.length&&!resident.length)
    h+="Nobody who kills here lives here. This is a hunting ground, not a home, so the danger arrives and leaves. "
      +(win?"Turn up outside "+hh(win.a)+" to "+hh(win.b)+" and it is a different system.":"");
  else if(resident.length&&visitor.length)
    h+=esc(resident[0].name)+" holds the ground and "+esc(visitor[0].name)+" visits it. Two different problems: "
      +"one you can wait out, one you cannot.";
  else if(resident.length)
    h+=esc(resident[0].name)+" lives here and kills here. Anything you do in this system is on their doorstep, "
      +"and they will be back tomorrow.";
  else h+="Not enough to call it.";
  h+="</div></div>";
  /* the web */
  h+=webSvg(D,clist);
  /* the crews, with their numbers */
  h+="<div class='sec'><div class='shead'><b>THE CREWS</b><span class='samp'>ranked by appearances</span></div>";
  clist.forEach(function(c){
    var w=crewHours(c);
    h+="<div class='crewcard'><div class='cn'>"+esc(c.name)
      +"<span class='tag "+(c.livesHere>=0.5?"res'>LIVES HERE":"vis'>VISITS")+"</span></div>"
      +"<div class='cl'>"+c.pilots.length+" pilot"+(c.pilots.length===1?"":"s")+" &middot; "+c.n+" appearances &middot; "
      +isk(c.isk)+" destroyed &middot; busiest "+hh(w.a)+" to "+hh(w.b)
      +(c.from?" &middot; comes from "+esc(c.from):"")
      +(c.probed?" &middot; read "+c.probed+" of them":"")+"</div><div class='cp'>";
    c.pilots.slice(0,8).forEach(function(p){
      h+="<button class='pplc' data-t='char' data-id='"+p.id+"'><span>"+esc(p.name||("pilot "+p.id))+"</span>"
        +"<span class='n'>"+p.n+(p.danger?" &middot; d"+Math.round(p.danger):"")+"</span></button>";
    });
    h+="</div></div>";
  });
  h+="</div>";
  host.innerHTML=h;
  host.querySelectorAll(".pplc[data-id]").forEach(function(b){
    b.addEventListener("click",function(){ loadTarget(b.getAttribute("data-t"),+b.getAttribute("data-id")); });
  });
  host.querySelectorAll(".wnode[data-id]").forEach(function(g){
    g.addEventListener("click",function(){ loadTarget(g.getAttribute("data-t"),+g.getAttribute("data-id")); });
  });
}
function webSvg(D,clist){
  var W=760,H=430,cx=W/2,cy=H/2;
  var s="<div class='webwrap'><svg viewBox='0 0 "+W+" "+H+"' preserveAspectRatio='xMidYMid meet'>";
  var maxN=clist.length?clist[0].n:1;
  s+="<circle cx='"+cx+"' cy='"+cy+"' r='34' fill='#101214' stroke='rgba(255,71,87,.6)' stroke-width='2'/>";
  s+="<text class='wlbl big' x='"+cx+"' y='"+(cy+4)+"' text-anchor='middle'>"+esc(D.name)+"</text>";
  clist.forEach(function(c,i){
    var ang=(-Math.PI/2)+(i*2*Math.PI/Math.max(1,clist.length));
    var rad=c.livesHere>=0.5?118:172;      /* residents sit close, visitors sit out */
    var x=cx+Math.cos(ang)*rad, y=cy+Math.sin(ang)*rad;
    var r=12+Math.round(16*(c.n/maxN));
    s+="<line class='wedge"+(c.livesHere>=0.5?" res":"")+"' x1='"+cx+"' y1='"+cy+"' x2='"+x+"' y2='"+y+"'/>";
    s+="<g class='wnode' data-t='"+c.t+"' data-id='"+c.id+"'>"
      +"<circle cx='"+x+"' cy='"+y+"' r='"+r+"' fill='"+(c.livesHere>=0.5?"rgba(255,71,87,.22)":"rgba(233,196,106,.16)")
      +"' stroke='"+(c.livesHere>=0.5?"rgba(255,71,87,.7)":"rgba(233,196,106,.6)")+"'/>"
      +"<title>"+esc(c.name)+" &middot; "+c.n+" appearances</title></g>";
    var ly=y+r+12;
    s+="<text class='wlbl' x='"+x+"' y='"+ly+"' text-anchor='middle'>"+esc(c.name.length>22?c.name.slice(0,21)+"…":c.name)+"</text>";
    s+="<text class='wsub' x='"+x+"' y='"+(ly+10)+"' text-anchor='middle'>"+(c.livesHere>=0.5?"lives here":(c.from?"from "+esc(c.from):"visits"))+"</text>";
    /* pilots hang off their crew */
    c.pilots.slice(0,5).forEach(function(p,j){
      var pa=ang+(j-2)*0.17, pr=rad+r+28;
      var px=cx+Math.cos(pa)*pr, py=cy+Math.sin(pa)*pr;
      s+="<line class='wedge' x1='"+x+"' y1='"+y+"' x2='"+px+"' y2='"+py+"'/>";
      s+="<g class='wnode' data-t='char' data-id='"+p.id+"'><circle cx='"+px+"' cy='"+py+"' r='4' fill='#1d2226' stroke='var(--line)'/>"
        +"<title>"+esc(p.name||"pilot")+" &middot; "+p.n+" here</title></g>";
    });
  });
  s+="</svg></div>";
  s+="<div class='rnote' style='margin:6px 2px 0'>Close ring lives here, outer ring travels in. Circle size is how much of the killing they did. Click anything to open its file.</div>";
  return s;
}

function wireSystem(D){
  var sb=document.getElementById("starb");
  if(sb) sb.addEventListener("click",function(){ toggleWatch("sys",D.id,D.name); renderSystem(D,0); });
  if(document.getElementById("fightsout")) renderFights(D);
  var wb=document.getElementById("webgo");
  if(wb) wb.addEventListener("click",function(){ runWeb(D); });
  /* a new system resets the walk; the map starts centred on the file you opened */
  if(MAP.id!==D.id) MAP.trail=[];
  if(document.getElementById("mapwrap")) paintMap(D.id,false);
  out.querySelectorAll(".pplc[data-id]").forEach(function(b){
    b.addEventListener("click",function(){ loadTarget(b.getAttribute("data-t"),+b.getAttribute("data-id")); });
  });
}

/* ---- render ---- */
function zlink(kid){ return "<span class='zlink'><a href='https://zkillboard.com/kill/"+kid+"/' target='_blank' rel='noopener'>mail</a></span>"; }
function pchip(x){ return "<button class='pplc' data-t='char' data-id='"+x.id+"'><img loading='lazy' src='"+IMG+"/characters/"+x.id+"/portrait?size=32' onerror='this.style.display=\"none\"' alt=''><span>"+esc(x.n)+"</span><span class='n'>&times;"+x.c+"</span></button>"; }

function renderDigest(D,ageMs,partial){
  if(D.t==="sys") return renderSystem(D,ageMs,partial);
  var self=(D.t==="alli"&&D.id===OUR_ALLI)||(D.t==="corp"&&OUR_CORPS[D.id]);
  var db=bandDanger(D.danger);
  var pic=D.t==="char"?IMG+"/characters/"+D.id+"/portrait?size=128":D.t==="corp"?IMG+"/corporations/"+D.id+"/logo?size=128":IMG+"/alliances/"+D.id+"/logo?size=128";
  var kd=D.sl?(D.sd/D.sl):D.sd, eff=(D.ikd+D.ikl)?D.ikd/(D.ikd+D.ikl):0;
  var soloPct=D.sd?D.soloK/D.sd:0;
  var h="";
  /* identity */
  h+="<div class='idcard'><img class='pic' src='"+pic+"' onerror='this.style.visibility=\"hidden\"' alt=''>";
  h+="<div class='idmain'><div class='idname'>"+esc(D.name)
    +(D.ticker?"<span class='tick2'>["+esc(D.ticker)+"]</span>":"")
    +"<span class='dchip "+db[1]+"' title='zKillboard&#39;s own danger number, shown as is.'>"+db[0]+" &middot; zkill danger "+Math.round(D.danger)+"</span>"
    +(ageMs>60000?"<span class='cachech'>cached "+Math.round(ageMs/60000)+"m ago &middot; refreshing</span>":"")
    +"</div><div class='idsub'>";
  if(D.t==="char") h+=(D.corpN?esc(D.corpN):"")+(D.alliN?" &middot; "+esc(D.alliN):"");
  if(D.t==="corp") h+=(D.members?D.members+" members":"")+(D.alliN?" &middot; "+esc(D.alliN):"");
  if(D.t==="alli") h+=(D.corps?D.corps+" corps":"")+(D.members?" &middot; "+D.members+" members":"")+(D.founded?" &middot; since "+String(D.founded).slice(0,10):"");
  if(D.gang>=80) h+=" &middot; almost never alone";
  h+="</div>";
  if(self) h+="<div class='selfline'>That's us. The killboard undersells it. Somebody's gotta undock.</div>";
  h+="<div class='idacts'><button class='starb"+(isWatched(D.t,D.id)?" on":"")+"' id='starb'>"+(isWatched(D.t,D.id)?"&#9733; watching":"&#9734; watch")+"</button>"
    +"<span class='zlink'><a href='https://zkillboard.com/"+TZW[D.t]+"/"+D.id+"/' target='_blank' rel='noopener'>full record on zKillboard &#8599;</a></span>";
  if(whoami&&(whoami.role==="officer"||whoami.role==="admin"||whoami.gss)) h+="<a class='gsslink' href='/portal/intel/'>GSS: open the workbench file &#8594;</a>";
  h+="</div></div></div>";
  /* hunt line */
  var pw=D.matMax?peakWindow(D.mat):null;
  if(D.sd||D.sl){
    var hl;
    if(!D.sd) hl="Not much of a hunter. "+D.sl+" losses say they undock anyway.";
    else{
      hl=pw?("Most active "+hh(pw.a)+" to "+hh(pw.b)+" EVE ("+pw.tz+" prime). "):"";
      var ts2=(D.top.sys&&D.top.sys[0])||null, tsh=(D.top.ship&&D.top.ship[0])||null;
      if(ts2){ var rg=ts2.region||regionOf(ts2.solarSystemName); hl+="Hunts around "+esc(ts2.solarSystemName)+(rg?" ("+esc(rg)+")":"")+". "; }
      if(tsh&&tsh.shipName) hl+="Favors the "+esc(tsh.shipName)+".";
    }
    if(hl) h+="<div class='huntline'><span class='hl'>HUNT INTEL</span>"+hl+"</div>";
  }
  /* stat tiles */
  h+="<div class='stats'>"
    +"<div class='stt'><div class='k'>DESTROYED</div><div class='v'>"+D.sd+"</div></div>"
    +"<div class='stt'><div class='k'>LOST</div><div class='v'>"+D.sl+"</div></div>"
    +"<div class='stt'><div class='k'>K/D</div><div class='v "+(kd>=2?"good":kd<0.5?"bad":"")+"'>"+(kd>=99?"99+":kd.toFixed(1))+"</div></div>"
    +"<div class='stt'><div class='k'>ISK DESTROYED</div><div class='v'>"+isk(D.ikd)+"</div></div>"
    +"<div class='stt'><div class='k'>ISK EFFICIENCY</div><div class='v "+(eff>=0.75?"good":eff<0.35?"bad":"")+"'>"+pct(eff)+"</div></div>"
    +"<div class='stt'><div class='k'>SOLO KILLS</div><div class='v'>"+D.soloK+(D.sd?" <span style='font-size:12px;color:var(--muted)'>("+pct(soloPct)+")</span>":"")+"</div></div>"
    +"</div>";
  if(!D.sd&&!D.sl){
    h+="<div class='sec'><div class='verd'>No killmails. Either harmless, or careful. Assume careful.</div></div>";
    out.innerHTML=h; wireDigest(D); return;
  }
  if(partial){
    h+="<div class='sec'><div class='mwait'>reading the killmails...</div></div>";
    out.innerHTML=h; wireDigest(D); return;
  }
  var sampChip="reading the last "+D.nk+" kills / "+D.nl+" losses";
  /* prey + engagement */
  h+="<div class='sec grid2'><div>";
  h+="<div class='shead'><b>WHAT THEY HUNT</b> &middot; PREY PROFILE<span class='samp'>"+sampChip+"</span></div>";
  var pv=preyVerdict(D.softPct,D.nk);
  if(!D.nk) h+="<div class='verd'>No kills on record"+(D.nl?", "+D.nl+" losses though":"")+".</div>";
  else{
    h+="<div class='verd'>"+Math.round(D.softPct*100)+"% soft targets. "+esc(pv||"")+"</div>";
    var mx=D.prey.length?D.prey[0].c:1;
    D.prey.forEach(function(p){
      var g2=null; for(var gk in GRP){ if(GRP[gk][0]===p.n){ g2=GRP[gk]; break; } }
      var isSoft=g2?g2[1]:0;
      h+="<div class='clsrow'><span style='min-width:150px'>"+esc(p.n)+"</span><span class='bar"+(isSoft?" soft":"")+"' style='width:"+Math.max(3,Math.round(p.c/mx*160))+"px'></span><span class='n'>&times;"+p.c+"</span></div>";
    });
  }
  h+="</div><div>";
  h+="<div class='shead'><b>HOW THEY FIGHT</b> &middot; ENGAGEMENT PROFILE</div>";
  var ec=engageClass(D.avgGang,soloPct);
  h+="<div class='verd'><b style='color:var(--silver)'>"+ec[0]+"</b>. "+ec[1]+"</div>";
  h+="<div class='clsrow'><span style='min-width:150px'>avg gang size</span><b>"+(D.avgGang?D.avgGang.toFixed(1):"?")+"</b></div>";
  h+="<div class='clsrow'><span style='min-width:150px'>largest recent gang</span><b>"+(D.largest||0)+"</b></div>";
  h+="<div class='clsrow'><span style='min-width:150px'>solo share of kills</span><b>"+pct(soloPct)+"</b></div>";
  h+="<div class='clsrow'><span style='min-width:150px'>gang ratio (zkill)</span><b>"+Math.round(D.gang)+"%</b></div>";
  h+="</div></div>";
  /* tank */
  h+="<div class='sec'><div class='shead'><b>HOW TO BREAK THEM</b> &middot; TYPICAL FIT<span class='samp'>from "+D.nl+" losses</span></div>";
  if(!D.nl) h+="<div class='verd'>No losses on record. Whatever they fly, they bring it home. Respect that.</div>";
  else{
    h+="<div class='verd'><b style='color:var(--silver)'>"+D.tank[0]+"</b>. "+D.tank[1]+"</div><div class='modl'>";
    D.mods.slice(0,8).forEach(function(m){ h+="<span class='modc'>"+esc(m.name)+" <b>&times;"+m.n+"</b></span>"; });
    h+="</div>";
  }
  h+="</div>";
  /* people */
  h+="<div class='sec grid2'><div>";
  h+="<div class='shead'><b>WHO FLIES WITH THEM</b>"+(D.t==="char"?" &middot; ON THEIR KILLS":" &middot; OUTSIDE THE ORG")+"</div>";
  h+=D.net.length?"<div class='ppl'>"+D.net.map(pchip).join("")+"</div>":"<div class='verd'>Nobody twice. Loners, or careful.</div>";
  if(D.t!=="char"){
    h+="<div class='shead' style='margin-top:16px'><b>ACTIVE MEMBERS</b> &middot; CONFIRMED ON KILLS</div>";
    h+=D.mem.length?"<div class='ppl'>"+D.mem.map(pchip).join("")+"</div>":"<div class='verd'>No member has landed on a kill lately.</div>";
  }
  h+="</div><div>";
  h+="<div class='shead'><b>PREFERRED VICTIMS</b></div>";
  h+=D.vic.length?"<div class='ppl'>"+D.vic.map(pchip).join("")+"</div>":"<div class='verd'>Nobody twice.</div>";
  h+="<div class='shead' style='margin-top:16px'><b>NEMESES</b> &middot; WHO KILLS THEM</div>";
  h+=D.nem.length?"<div class='ppl'>"+D.nem.map(pchip).join("")+"</div>":"<div class='verd'>Nobody owns them yet.</div>";
  h+="</div></div>";
  /* heatmap */
  if(D.matMax>0){
    h+="<div class='sec'><div class='shead'><b>WHEN</b> &middot; ACTIVITY, HOUR &times; WEEKDAY, EVE TIME</div><div class='hmwrap'><div class='hm'>";
    var days=["SUN","MON","TUE","WED","THU","FRI","SAT"];
    h+="<div class='hmrow'><span class='hmd'></span>";
    for(var hx=0;hx<24;hx++) h+="<span class='hmx'>"+(hx%3===0?(hx<10?"0":"")+hx:"")+"</span>";
    h+="</div>";
    for(var dd=0;dd<7;dd++){
      h+="<div class='hmrow'><span class='hmd'>"+days[dd]+"</span>";
      for(var hy=0;hy<24;hy++){
        var n3=D.mat[dd][hy], a3=n3?(0.12+0.85*n3/D.matMax):0;
        h+="<span class='hmc' title='"+days[dd]+" "+hh(hy)+" &middot; "+n3+" kills'"+(n3?" style='background:rgba(255,71,87,"+a3.toFixed(2)+")'":"")+"></span>";
      }
      h+="</div>";
    }
    h+="</div></div><div class='hmleg'><span>COLD</span><span style='width:60px;height:8px;background:linear-gradient(90deg,var(--steel-2),rgba(255,71,87,.95))'></span><span>HOT</span>"
      +(pw?"<span>peak "+hh(pw.a)+" to "+hh(pw.b)+" EVE &middot; "+pw.tz+" prime</span>":"")+"</div></div>";
  }
  /* grounds */
  h+="<div class='sec'><div class='shead'><b>WHERE</b> &middot; HUNTING GROUNDS</div>";
  if(whoami&&whoami.loggedIn&&D.roadNames&&D.roadNames.length)
    h+="<span class='roadchip' title='This one hunts where we work. Worth knowing before you haul.'>WORKS OUR ROADS &middot; "+D.roadNames.map(esc).join(", ")+"</span><br>";
  else if(whoami&&whoami.loggedIn&&(D.top.sys||[]).some(function(s3){ return OUR_REG[s3.region||""]; }))
    h+="<span class='roadchip rg'>operates in our regions</span><br>";
  if(D.top.sys&&D.top.sys.length){
    h+="<table class='btbl'><thead><tr><th>SYSTEM</th><th>SEC</th><th>REGION</th><th class='num'>KILLS</th></tr></thead><tbody>";
    D.top.sys.forEach(function(s4){
      var sb=secBand(s4.solarSystemSecurity);
      h+="<tr><td>"+esc(s4.solarSystemName)+(OUR_SYS[s4.solarSystemID]&&whoami.loggedIn?" <span class='roadchip' style='padding:1px 6px;font-size:9.5px'>OUR ROAD</span>":"")+"</td>"
        +"<td class='secb "+sb[0]+"'>"+sb[1]+"</td><td>"+esc(s4.region||regionOf(s4.solarSystemName)||"")+"</td><td class='num'>"+(s4.kills||0)+"</td></tr>";
    });
    h+="</tbody></table>";
    if(D.jumps!=null) h+="<div class='verd' style='margin-top:8px'>Their top system is "+D.jumps+" jumps from Rens.</div>";
    else if(D.top.sys[0]&&!(D.top.sys[0].region||regionOf(D.top.sys[0].solarSystemName))) h+="<div class='verd' style='margin-top:8px'>No gate route from Rens. Wormhole business.</div>";
  } else h+="<div class='verd'>Nothing recent. They hunt somewhere the killboard hasn't seen lately.</div>";
  h+="</div>";
  /* doctrine */
  if((D.top.ship&&D.top.ship.length)||D.allTimeShips.length){
    h+="<div class='sec'><div class='shead'><b>SHIP DOCTRINE</b> &middot; MOST FLOWN ON KILLS</div><div class='docl'>";
    (D.top.ship||[]).forEach(function(s5){
      h+="<span class='docc'><img loading='lazy' src='"+IMG+"/types/"+s5.shipTypeID+"/render?size=64' onerror='this.style.display=\"none\"' alt=''><span><div class='dn'>"+esc(s5.shipName||"?")+"</div><div class='dk'>&times;"+(s5.kills||0)+" recent</div></span></span>";
    });
    D.allTimeShips.forEach(function(s6){
      h+="<span class='docc'><img loading='lazy' src='"+IMG+"/types/"+s6.shipTypeID+"/render?size=64' onerror='this.style.display=\"none\"' alt=''><span><div class='dn'>"+esc(s6.n||"?")+"</div><div class='dk'>&times;"+(s6.kills||0)+" all time</div></span></span>";
    });
    h+="</div></div>";
  }
  /* telemetry */
  if(D.tele&&D.tele.length){
    h+="<div class='sec'><div class='shead'><b>RECENT COMBAT TELEMETRY</b><span class='samp'>"+sampChip+"</span></div>";
    h+="<table class='btbl'><thead><tr><th></th><th>SHIP</th><th>PILOT</th><th>SYSTEM</th><th>GANG</th><th class='num'>VALUE</th><th>WHEN</th><th></th></tr></thead><tbody>";
    D.tele.forEach(function(r){
      h+="<tr><td><span class='kch "+(r.k?"k":"l")+"'>"+(r.k?"KILL":"LOSS")+"</span></td>"
        +"<td>"+esc(r.shipN||"?")+"</td>"
        +"<td class='telewho'>"+(r.whoN?esc(r.whoN):"<span class='n'>no pilot</span>")+(r.k===0&&r.fbN?" <span style='color:var(--muted)'>&middot; final blow "+esc(r.fbN)+"</span>":"")+"</td>"
        +"<td>"+esc(r.sysN||"?")+"</td>"
        +"<td>"+(r.att<=1?"SOLO":r.att+" on it")+"</td>"
        +"<td class='num'>"+isk(r.val)+"</td><td>"+ago(r.t)+"</td><td>"+zlink(r.kid)+"</td></tr>";
    });
    h+="</tbody></table></div>";
  }
  out.innerHTML=h;
  wireDigest(D);
}
function wireDigest(D){
  var sb=document.getElementById("starb");
  if(sb) sb.addEventListener("click",function(){ toggleWatch(D.t,D.id,D.name); renderDigest(D,0); });
  out.querySelectorAll(".pplc[data-id]").forEach(function(b){
    b.addEventListener("click",function(){ loadTarget(b.getAttribute("data-t"),+b.getAttribute("data-id")); });
  });
}

/* ================= THE SIDEKICK =================
   A heads up display that keeps reading while you work. Left side is whatever file
   you pulled; right side is New Eden burning in real time. Three panes: where it is
   hottest, what is happening on our own roads, and the files you keep coming back to.
   Every row loads into the left. Refreshes every three minutes, and only while the
   tab is visible, because nobody needs us polling a background tab. */
var rPane="hot", rHot=[], rOurs=[];
function hudRow(name,val,sub,t,id){
  return "<button class='rrow' data-t='"+t+"' data-id='"+id+"'><span class='rn'>"+esc(name)+"</span>"
    +(sub?"<span class='rs'>"+esc(sub)+"</span>":"")+"<span class='rv'>"+val+"</span></button>";
}
function paintRail(){
  var el=document.getElementById("rlist"), note=document.getElementById("rNote"),
      title=document.getElementById("rTitle");
  if(!el) return;
  var h="";
  if(rPane==="hot"){
    title.textContent="WHERE IT IS BURNING";
    if(!rHot.length) h="<div class='rnote'>Nothing is dying anywhere. That cannot be right, check back.</div>";
    else rHot.slice(0,12).forEach(function(s){
      h+=hudRow(s.n,"<span style='color:var(--gob,#ff4757)'>"+s.k+"</span>",s.sec,"sys",s.id);
    });
    note.textContent="Ship and pod kills in the last hour, live from ESI.";
  } else if(rPane==="ours"&&OURS){
    title.textContent="OUR ROADS";
    if(!rOurs.length) h="<div class='rnote'>Quiet on our roads. Long may it last.</div>";
    else rOurs.forEach(function(s){
      h+=hudRow(s.n,s.k?("<span style='color:var(--gob,#ff4757)'>"+s.k+"</span>"):"<span style='color:var(--ore)'>0</span>",s.sec,"sys",s.id);
    });
    note.textContent="The corridor and both homes. Live kills this hour.";
  } else {
    title.textContent="YOUR FILES";
    var w=getWatch(), r=(lsGet(LSR)||[]);
    w.forEach(function(x){ h+=hudRow("★ "+x.n,"",x.t==="sys"?"system":x.t,x.t,x.id); });
    r.forEach(function(x){ if(!isWatched(x.t,x.id)) h+=hudRow(x.n,"",x.t==="sys"?"system":x.t,x.t,x.id); });
    if(!h) h="<div class='rnote'>Nothing yet. Star a file and it lives here.</div>";
    note.textContent="Watchlist first, then what you pulled recently.";
  }
  el.innerHTML=h;
  el.querySelectorAll(".rrow").forEach(function(b){
    b.addEventListener("click",function(){ loadTarget(b.getAttribute("data-t"),+b.getAttribute("data-id")); });
  });
}
document.getElementById("rsw").addEventListener("click",function(e){
  var b=e.target.closest?e.target.closest("button[data-r]"):null; if(!b) return;
  rPane=b.getAttribute("data-r");
  var bs=document.getElementById("rsw").querySelectorAll("button");
  for(var i=0;i<bs.length;i++) bs[i].classList.toggle("on",bs[i]===b);
  paintRail();
});
function refreshHud(){
  Promise.all([loadSysGraph(),
    fetch(ESI+"/universe/system_kills/?datasource=tranquility").then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; })
  ]).then(function(res){
    var S=res[0], kills=res[1];
    var ships=document.getElementById("hudShips"), pods=document.getElementById("hudPods"),
        hotEl=document.getElementById("hudHot"), ourEl=document.getElementById("hudOurs");
    /* a dead feed says so. It must never read as a quiet universe. */
    if(!kills){
      if(ships) ships.innerHTML="&mdash; <small>feed down</small>";
      if(hotEl) hotEl.textContent="no eyes";
      return;
    }
    var ts=0,tp=0,list=[];
    kills.forEach(function(k){
      var s=k.ship_kills||0,p=k.pod_kills||0; ts+=s; tp+=p;
      if(s+p>0&&S&&S.d){
        var ix=S.byId[k.system_id];
        if(ix!=null) list.push({id:k.system_id,n:S.d.sys[ix][0],sec:S.d.sys[ix][2].toFixed(1),k:s+p});
      }
    });
    list.sort(function(a,b){ return b.k-a.k; });
    rHot=list;
    if(ships) ships.innerHTML=ts.toLocaleString()+" <small>ships</small>";
    if(pods) pods.textContent=tp.toLocaleString();
    if(hotEl&&list[0]) hotEl.innerHTML="<a href='?t=sys&id="+list[0].id+"' class='hot'>"+esc(list[0].n)+"</a> <span style='color:var(--muted)'>"+list[0].k+"</span>";
    var kBy={}; kills.forEach(function(k){ kBy[k.system_id]=k; });
    rOurs=[];
    /* Not merely hidden: not computed. On the public mount our footprint never
       enters the page's memory, so there is nothing to read out of a console. */
    if(S&&S.d&&OURS) Object.keys(OUR_SYS).forEach(function(sid){
      var ix=S.byId[sid]; if(ix==null) return;
      var k=kBy[+sid];
      rOurs.push({id:+sid,n:S.d.sys[ix][0],sec:S.d.sys[ix][2].toFixed(1),k:k?((k.ship_kills||0)+(k.pod_kills||0)):0});
    });
    rOurs.sort(function(a,b){ return b.k-a.k; });
    var burning=rOurs.filter(function(s){ return s.k>0; });
    if(ourEl) ourEl.innerHTML=burning.length
      ? "<span class='hot'>"+esc(burning[0].n)+" "+burning[0].k+"</span>"
      : "<span class='calm'>quiet</span>";
    paintRail(); paintDelta(); paintCall();
  });
}
refreshHud();
findNearestFight();
setInterval(function(){ if(document.visibilityState==="visible") refreshHud(); },180000);

go.addEventListener("click",run);
q.addEventListener("keydown",function(e){ if(e.key==="Enter") run(); });
renderChips();
/* deep links: ?t=char|corp|alli&id=N, or ?q=Name */
(function(){
  var sp=new URLSearchParams(location.search);
  var t=sp.get("t"), id=+sp.get("id"), qq=sp.get("q");
  if(t&&TPATH[t]&&id>0) loadTarget(t,id);
  else if(qq){ q.value=qq; run(); }
  /* OPEN ON OURSELVES (public mount only). A tool that opens on an empty search box
     asks a stranger to think of a name before it has proved it does anything, and
     most of them will not bother. Loading our own file first turns the landing state
     into a worked example: this is the shape of the answer, now go and run it on
     whoever ganked you. Everything shown is public zKillboard and ESI, which anyone
     could pull on us anyway, so the demo costs nothing and it is honest about the
     killboard. Members get their own desk state instead, which is more useful to them. */
  else if(!OURS) loadTarget("alli",OUR_ALLI);
})();

/* ==== YOU ARE HERE ====
   The one thing a public tool can never do: the member attached their own ESI, so
   the desk can open with where THEY are and what they are sitting in, and warn them
   about their own system before they undock. Their data, read for them. If they have
   not attached, the band simply never appears.
   Live read on purpose: a cached position confidently tells a goblin they are
   somewhere they left an hour ago, which is worse than saying nothing. */
function paintYouAre(){
  var host=document.getElementById("youare"); if(!host) return;
  fetch("/api/esi/me/where",{credentials:"same-origin",cache:"no-store"})
    .then(function(r){ return r.ok?r.json():null; })
    .then(function(d){
      if(!d||!d.ok||!d.attached||!d.chars||!d.chars.length) return;
      var me=d.chars.filter(function(c){ return c.system_id; })[0];
      if(!me) return;
      return Promise.all([loadSysGraph(),esiActivity()]).then(function(res){
        var S=res[0],A=res[1];
        var k=(A&&A.k[me.system_id])||{}, live=(k.ship_kills||0)+(k.pod_kills||0);
        var ix=S&&S.byId?S.byId[me.system_id]:null, row=(ix!=null)?S.d.sys[ix]:null;
        var sec=row?row[2]:null, reg=row?S.d.regions[row[3]]:null;
        /* nearest highsec, same walk the corridor lens uses */
        var exit=null;
        if(row&&sec<0.45&&S.d){
          var seen={},q=[[ix,0]]; seen[ix]=1;
          while(q.length){
            var cur=q.shift(); if(cur[1]>6) break;
            var nb=S.d.sys[cur[0]][4]||[];
            for(var i=0;i<nb.length;i++){
              if(seen[nb[i]]) continue; seen[nb[i]]=1;
              var r2=S.d.sys[nb[i]];
              if(r2[2]>=0.45){ exit={n:r2[0],j:cur[1]+1}; q.length=0; break; }
              q.push([nb[i],cur[1]+1]);
            }
          }
        }
        var nbHot=0,nbNames=[];
        if(row&&S.d) (row[4]||[]).forEach(function(n){
          var rr=S.d.sys[n], kk=(A&&A.k[rr[1]])||{};
          var t=(kk.ship_kills||0)+(kk.pod_kills||0);
          if(t>0){ nbHot+=t; nbNames.push(rr[0]); }
        });
        var line;
        if(live>0) line="You are in <b>"+esc(me.system_name||"somewhere")+"</b> and <b class='yhot'>"+live+"</b> ship"+(live===1?"":"s")+" died here this hour.";
        else if(nbHot>0) line="You are in <b>"+esc(me.system_name||"somewhere")+"</b>. Quiet here, but <b class='yhot'>"+esc(nbNames[0])+"</b> next door is not.";
        else line="You are in <b>"+esc(me.system_name||"somewhere")+"</b>. Nothing dying here or next door.";
        var bits=[];
        if(me.ship_name) bits.push("flying a "+esc(me.ship_name));
        if(sec!=null) bits.push(sec.toFixed(1)+(reg?" "+esc(reg):""));
        if(exit) bits.push("nearest highsec "+esc(exit.n)+" "+exit.j+"j");
        else if(sec!=null&&sec>=0.45) bits.push("you are in highsec");
        host.innerHTML="<div class='youare"+(live>0?" hot":"")+"'>"
          +"<span class='yk'>YOU ARE HERE</span>"
          +"<div class='yv'>"+line+"</div>"
          +"<div class='ysub'>"+bits.join(" &middot; ")
          +" &middot; <a href='?t=sys&id="+me.system_id+"'>open this system</a></div></div>";
      });
    }).catch(function(){ /* the band is a bonus; it never breaks the page */ });
}
paintYouAre();
setInterval(function(){ if(document.visibilityState==="visible") paintYouAre(); },120000);

/* ==== WHAT CHANGED SINCE YOU LOOKED ====
   A dashboard is worth reopening only if it tells you what moved. Pure localStorage,
   costs nothing, and it is the difference between a page and a habit. */
var LSSEEN="bonk_intel_seen_v1";
function deltaLine(){
  var prev=lsGet(LSSEEN), now={t:Date.now(),hot:{}};
  (rHot||[]).slice(0,12).forEach(function(s){ now.hot[s.id]=s.k; });
  (rOurs||[]).forEach(function(s){ if(s.k) now.hot["o"+s.id]=s.k; });
  lsSet(LSSEEN,now);
  if(!prev||!prev.t) return null;
  var mins=Math.round((Date.now()-prev.t)/60000);
  if(mins<10) return null;
  var newly=[];
  (rOurs||[]).forEach(function(s){ if(s.k&&!prev.hot["o"+s.id]) newly.push(s.n); });
  var since=mins<120?(mins+" minutes"):(Math.round(mins/60)+" hours");
  if(newly.length) return "Since you looked "+since+" ago, our roads lit up at "+esc(newly.join(", "))+".";
  return null;
}
function paintDelta(){
  var host=document.getElementById("rNote"); if(!host) return;
  var d=deltaLine();
  if(d) host.innerHTML="<span style='color:var(--amber)'>"+d+"</span>";
}

/* ==== KEYBOARD ====
   Slash focuses the box, Escape clears it, and the rail panes are one key each.
   The people who use this most will use it fifty times a night. */
document.addEventListener("keydown",function(e){
  var t=e.target, typing=t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA");
  if(e.key==="/"&&!typing){ e.preventDefault(); if(q){ q.focus(); q.select(); } return; }
  if(e.key==="Escape"&&typing&&t===q){ q.value=""; return; }
  if(typing) return;
  if(e.key==="["){ trailBack(); return; }
  if(e.key==="]"){ trailFwd(); return; }
  if(e.key==="s"){ syncNow(true); return; }
  var pane={h:"hot",o:"ours",w:"watch"}[e.key];
  if(pane){
    var b=document.querySelector("#rsw button[data-r='"+pane+"']");
    if(b) b.click();
  }
});

/* ==== THE CALL ====
   A dashboard that opens with an empty box makes every visit cost a decision. This
   opens with the answer to the question most people came to ask: is anything
   happening, and should I undock. Two stages on purpose. The first paint uses the
   activity feed the rail already fetched, so it is instant. The distance work needs
   the jump graph, which is lazy, so it arrives a moment later and sharpens the line
   rather than delaying it. */
var CALLST={near:null};
function callSentence(){
  var ours=(rOurs||[]).filter(function(s){ return s.k>0; });
  var top=(rHot||[])[0];
  if(ours.length){
    var w=ours[0];
    return {tone:"hot", text:"<b class='chot'>"+esc(w.n)+"</b> is hot, "+w.k+" dead there this hour. That is our road."};
  }
  /* "our roads" means nothing to a stranger and quietly implies a footprint we are
     no longer publishing, so the public mount speaks about New Eden instead. */
  var clear=OURS?"Roads are clear. ":"";
  if(CALLST.near&&CALLST.near.j!=null){
    return {tone:"calm", text:clear+"Nearest fight is <b>"+esc(CALLST.near.n)+"</b>, "
      +CALLST.near.j+" jump"+(CALLST.near.j===1?"":"s")+" out, "+CALLST.near.k+" dead this hour."};
  }
  if(top) return {tone:"calm", text:clear+"Loudest system in New Eden is <b>"+esc(top.n)+"</b> with "+top.k+"."};
  return {tone:"calm", text:OURS?"Nothing on our roads. Quiet everywhere we can see."
                                :"Quiet everywhere we can see."};
}
function paintCall(){
  var host=document.getElementById("thecall"); if(!host) return;
  if(!rHot.length&&!rOurs.length){ host.innerHTML="<div class='call'><div class='ct'>reading the map&hellip;</div></div>"; return; }
  var c=callSentence();
  host.innerHTML="<div class='call "+c.tone+"'><span class='ck'>THE CALL</span><div class='ct'>"+c.text+"</div></div>";
  paintTiles();
}
/* the three states worth knowing without asking, in the order you would ask them */
function paintTiles(){
  var host=document.getElementById("statetiles"); if(!host) return;
  var ours=(rOurs||[]).filter(function(s){ return s.k>0; });
  var oursV=ours.length?(esc(ours[0].n)+" "+ours[0].k):"quiet";
  var neTotal=(rHot||[]).reduce(function(a,s){ return a+s.k; },0);
  var near=CALLST.near;
  host.innerHTML=
    "<div class='tiles'>"
    +"<div class='tile"+(ours.length?" bad":" good")+"'><div class='tk'>OUR ROADS</div><div class='tv'>"+oursV+"</div></div>"
    +"<div class='tile'><div class='tk'>NEAREST FIGHT</div><div class='tv'>"
      +(near?esc(near.n)+" <small>"+near.j+"j</small>":"&mdash;")+"</div></div>"
    +"<div class='tile'><div class='tk'>NEW EDEN, THIS HOUR</div><div class='tv'>"+neTotal+" <small>ships + pods</small></div></div>"
    +"</div>";
}
/* the distance half: lazy graph, then sharpen */
function findNearestFight(){
  Promise.all([loadSysGraph(),esiActivity()]).then(function(res){
    var S=res[0],A=res[1];
    if(!S||!S.d) return;
    /* Public anchors on RENS, which is on our own front page and in the recruitment
       copy, so a distance measured from it leaks nothing new. Mohas is the home and
       stays members only. */
    var home=S.byName?S.byName[OURS?"mohas":"rens"]:null; if(home==null) return;
    var dist={},q=[home],seen={}; seen[home]=1; dist[home]=0;
    while(q.length){
      var cur=q.shift(); if(dist[cur]>=10) continue;
      (S.d.sys[cur][4]||[]).forEach(function(n){ if(!seen[n]){ seen[n]=1; dist[n]=dist[cur]+1; q.push(n); } });
    }
    var best=null;
    Object.keys(dist).forEach(function(ix){
      var row=S.d.sys[ix], k=A.k[row[1]]||{};
      var t=(k.ship_kills||0)+(k.pod_kills||0);
      if(t<=0) return;
      if(!best||dist[ix]<best.j||(dist[ix]===best.j&&t>best.k)) best={n:row[0],id:row[1],j:dist[ix],k:t};
    });
    if(best){ CALLST.near=best; paintCall(); }
  }).catch(function(){});
}

/* ==== LENS: THE FIGHT ====
   A killboard shreds an engagement into unrelated rows. Two hundred mails in one
   system were never two hundred duels: they were a handful of fights, and the
   question worth answering is what happened in each one and what it would do to us.
   Costs nothing: the mails are already in memory from the system read.
   Spec: Downloads/BONK-THE-FIGHT-SPEC.md */
/* Clustering a fight is NOT "kills near each other in time". Validated against four
   systems on 2026-07-31 and a pure 20 minute gap failed three of them: Uedama welded
   a whole ganking shift into one 93 kill "fight" spanning 78 minutes, Amamake produced
   a 55 kill object spanning 215 minutes, and Jita daisy chained unrelated suicide ganks
   for 86 minutes. A camp killing a passer by every fifteen minutes is not one long
   engagement.
   TWO SIGNALS, both required to merge: kills must be close in time AND share at least
   one participating organisation. Shared people is what actually makes two killmails
   the same fight. Plus a hard duration cap, because a permanently contested system can
   satisfy both signals all evening.
   Re-measured after the fix: Ignoitton still yields its real 181 kill / 41 minute
   capital battle intact, while Uedama drops to 31 kills / 7 minutes (one gank volley),
   Amamake to 10 / 22 and Jita to 12 / 17. */
var FIGHT_GAP=10*60*1000, FIGHT_MIN=3, FIGHT_MAXSPAN=60*60*1000;
function fightOrgs(m){
  var s={}, v=m.victim||{};
  if(v.alliance_id) s["a"+v.alliance_id]=1; else if(v.corporation_id) s["c"+v.corporation_id]=1;
  (m.attackers||[]).forEach(function(a){
    if(a.alliance_id) s["a"+a.alliance_id]=1; else if(a.corporation_id) s["c"+a.corporation_id]=1;
  });
  return s;
}
function fightShares(a,b){ for(var k in a) if(b[k]) return true; return false; }
function clusterFights(mails){
  var m=(mails||[]).filter(Boolean).slice().sort(function(a,b){ return a.killmail_time<b.killmail_time?-1:1; });
  var raw=[],cur=null;
  m.forEach(function(k){
    var t=new Date(k.killmail_time).getTime(), o=fightOrgs(k);
    if(cur&&(t-cur.last)<=FIGHT_GAP&&fightShares(o,cur.orgs)){
      cur.mails.push(k); cur.last=t; for(var x in o) cur.orgs[x]=1;
    } else { if(cur) raw.push(cur); cur={mails:[k],first:t,last:t,orgs:o}; }
  });
  if(cur) raw.push(cur);
  /* a cluster that ran past the cap gets re-split at its widest internal lull */
  var capped=[],q=raw.slice();
  while(q.length){
    var c=q.shift();
    if((c.last-c.first)<=FIGHT_MAXSPAN||c.mails.length<FIGHT_MIN*2){ capped.push(c); continue; }
    var wi=1,wg=-1;
    for(var i=1;i<c.mails.length;i++){
      var g=new Date(c.mails[i].killmail_time)-new Date(c.mails[i-1].killmail_time);
      if(g>wg){ wg=g; wi=i; }
    }
    [c.mails.slice(0,wi),c.mails.slice(wi)].forEach(function(half){
      q.push({mails:half,first:new Date(half[0].killmail_time).getTime(),
              last:new Date(half[half.length-1].killmail_time).getTime(),orgs:{}});
    });
  }
  var fights=capped.filter(function(c){ return c.mails.length>=FIGHT_MIN; })
    .map(function(c){ return c.mails; })
    .sort(function(a,b){ return b.length-a.length; });
  return {fights:fights, dropped:capped.length-fights.length};
}
/* DR-FIGHT-1: headcounts are UNIQUE PILOTS, never appearances. Counting attacker
   rows reported 641 of one hull in a 181 kill fight, because a pilot on fifty mails
   counts fifty times. DR-FIGHT-2: one kill credited per side per mail, or a ninety
   man blob books ninety kills. */
function buildFight(cluster){
  var sides={}, first=new Date(cluster[0].killmail_time), last=new Date(cluster[cluster.length-1].killmail_time);
  function side(id){ return sides[id]||(sides[id]={id:id,kills:0,losses:0,iskLost:0,pilots:{},hulls:{}}); }
  cluster.forEach(function(m){
    var v=m.victim||{}, vo=v.alliance_id||v.corporation_id||0;
    if(vo){ var S=side(vo); S.losses++; S.iskLost+=((m.zkb||{}).totalValue||0);
      if(v.character_id) S.pilots[v.character_id]=1;
      if(v.character_id&&v.ship_type_id) S.hulls[v.character_id+":"+v.ship_type_id]=v.ship_type_id; }
    var credited={};
    (m.attackers||[]).forEach(function(a){
      var ao=a.alliance_id||a.corporation_id||0; if(!ao) return;
      var A=side(ao);
      if(a.character_id) A.pilots[a.character_id]=1;
      if(a.character_id&&a.ship_type_id) A.hulls[a.character_id+":"+a.ship_type_id]=a.ship_type_id;
      if(!credited[ao]){ A.kills++; credited[ao]=1; }
    });
  });
  var list=Object.keys(sides).map(function(k){
    var S=sides[k], hulls={};
    Object.keys(S.hulls).forEach(function(key){ var t=S.hulls[key]; hulls[t]=(hulls[t]||0)+1; });
    var roles={TACKLE:0,LOGI:0,EWAR:0,CAPITAL:0,DPS:0,SOFT:0,STRUCTURE:0};
    Object.keys(hulls).forEach(function(t){
      var g=GRP[T2G[t]]; if(!g) return;
      roles[(window.BONKROLES?window.BONKROLES.of(g[0]):"DPS")]+=hulls[t];
    });
    return {id:+k,kills:S.kills,losses:S.losses,iskLost:S.iskLost,
            n:Object.keys(S.pilots).length,hulls:hulls,roles:roles,
            firstSeen:null};
  }).sort(function(a,b){ return b.n-a.n; });
  /* when did each side turn up: a side that arrives late and loses nothing is a
     third party cleaning up, which is a different story from two sides grinding */
  list.forEach(function(S){
    for(var i=0;i<cluster.length;i++){
      var m=cluster[i], v=m.victim||{};
      var inIt=((v.alliance_id||v.corporation_id)===S.id)
        ||(m.attackers||[]).some(function(a){ return (a.alliance_id||a.corporation_id)===S.id; });
      if(inIt){ S.firstSeen=new Date(m.killmail_time); break; }
    }
  });
  return {sides:list,start:first,end:last,mins:Math.max(1,Math.round((last-first)/60000)),
          kills:cluster.length,cluster:cluster};
}
function fightVerdict(F){
  var s=F.sides; if(!s.length) return "Nothing readable here.";
  var loser=s.slice().sort(function(a,b){ return b.losses-a.losses; })[0];
  var winner=s.slice().sort(function(a,b){ return b.kills-a.kills||a.losses-b.losses; })[0];
  var third=s.filter(function(x){
    return x!==winner&&x.kills>0&&x.losses===0&&x.firstSeen&&
      (x.firstSeen-F.start)>((F.end-F.start)*0.25);
  })[0];
  var out=[];
  if(!winner||!loser||winner===loser) out.push("One sided. "+(loser?nameOf(FMAP,loser.id):"Somebody")+" just died here.");
  else if(loser.n<=1) out.push("That was not a fight, that was a gank.");
  else if(winner.iskLost*3<loser.iskLost) out.push("<b>"+esc(nameOf(FMAP,winner.id))+"</b> rolled <b>"+esc(nameOf(FMAP,loser.id))+"</b>.");
  else if(winner.losses>0) out.push("<b>"+esc(nameOf(FMAP,winner.id))+"</b> took it, and paid "+isk(winner.iskLost)+" doing it.");
  else out.push("<b>"+esc(nameOf(FMAP,winner.id))+"</b> took it clean.");
  if(third) out.push("<b>"+esc(nameOf(FMAP,third.id))+"</b> turned up late with "+third.n+" and lost nothing. That is a third party cleaning up.");
  return out.join(" ");
}
var FMAP={};
function timelineStrip(F){
  var buckets=[],i,per=Math.max(1,Math.ceil(F.mins/40));
  for(i=0;i<Math.ceil(F.mins/per)+1;i++) buckets[i]=0;
  F.cluster.forEach(function(m){
    var b=Math.floor((new Date(m.killmail_time)-F.start)/60000/per);
    buckets[b]=(buckets[b]||0)+1;
  });
  var mx=Math.max.apply(null,buckets)||1;
  return "<div class='ftl' title='kills over the "+F.mins+" minutes of this fight'>"
    +buckets.map(function(v){ return "<i style='height:"+Math.max(2,Math.round(v/mx*22))+"px'></i>"; }).join("")
    +"</div>";
}
/* The mails are memory only (they are far too big for localStorage) while the digest
   caches for ten minutes. So a revisit renders from cache without ever fetching them.
   Rather than tell the reader the tool is empty, go and get them. */
function ensureMails(id){
  if(WEBSRC.mails&&WEBSRC.id===id) return Promise.resolve(WEBSRC.mails);
  if(WEBSRC.pending&&WEBSRC.pendingId===id) return WEBSRC.pending;
  WEBSRC.pendingId=id;
  WEBSRC.pending=zkGet("/kills/systemID/"+id+"/").then(function(list){
    list=(list||[]).filter(Boolean);
    WEBSRC={id:id,name:WEBSRC.name,mails:list};
    return list;
  }).catch(function(){ WEBSRC.pending=null; return null; });
  return WEBSRC.pending;
}
function renderFights(D){
  var host=document.getElementById("fightsout"); if(!host) return;
  if(!WEBSRC.mails||WEBSRC.id!==D.id){
    host.innerHTML="<div class='mwait'>reading the killmails...</div>";
    ensureMails(D.id).then(function(list){
      if(!list||!list.length){ host.innerHTML="<div class='verd'>Could not read the killmails for this system.</div>"; return; }
      if(cur&&cur.t==="sys"&&cur.id===D.id) renderFights(D);
    });
    return;
  }
  var C=clusterFights(WEBSRC.mails);
  if(!C.fights.length){
    host.innerHTML="<div class='verd'>No engagement in this window. "
      +(C.dropped?C.dropped+" one off kills, which is traffic rather than a fight.":"Nothing at all.")+"</div>";
    return;
  }
  var built=C.fights.slice(0,6).map(buildFight);
  var ids=[];
  built.forEach(function(F){ F.sides.slice(0,4).forEach(function(S){ ids.push(S.id); });
    F.sides.slice(0,4).forEach(function(S){ Object.keys(S.hulls).slice(0,40).forEach(function(t){ ids.push(+t); }); }); });
  resolveNames(ids).then(function(map){
    FMAP=map;
    var h="<div class='verd'>"+C.fights.length+" engagement"+(C.fights.length===1?"":"s")+" in the last "
      +WEBSRC.mails.length+" killmails"+(C.dropped?", plus "+C.dropped+" one off kills that are traffic rather than fights":"")+".</div>";
    built.forEach(function(F,ix){
      var top=F.sides.slice(0,4);
      h+="<div class='fight'><div class='fh'><span class='fn'>"+F.kills+" kills</span>"
        +"<span class='fm'>"+F.mins+" min</span>"
        +"<span class='fw'>"+ago(F.cluster[F.cluster.length-1].killmail_time)+"</span></div>";
      h+="<div class='fv'>"+fightVerdict(F)+"</div>";
      h+=timelineStrip(F);
      h+="<table class='btbl fst'><thead><tr><th>SIDE</th><th class='num'>PILOTS</th><th class='num'>KILLS</th>"
        +"<th class='num'>LOST</th><th>FLEW</th></tr></thead><tbody>";
      top.forEach(function(S){
        var hulls=Object.keys(S.hulls).map(function(t){ return {t:+t,c:S.hulls[t]}; })
          .sort(function(a,b){ return b.c-a.c; }).slice(0,3)
          .map(function(x){ return esc(nameOf(map,x.t))+" &times;"+x.c; }).join(", ");
        h+="<tr><td><button class='linkish' data-t='"+(S.id>99000000?"alli":"corp")+"' data-id='"+S.id+"'>"
          +esc(nameOf(map,S.id))+"</button></td>"
          +"<td class='num'>"+S.n+"</td><td class='num'>"+S.kills+"</td><td class='num'>"+S.losses+"</td>"
          +"<td>"+hulls+"</td></tr>";
      });
      h+="</tbody></table>";
      var wn=F.sides.slice().sort(function(a,b){ return b.kills-a.kills||a.losses-b.losses; })[0];
      if(wn){
        var lines=window.BONKROLES?window.BONKROLES.counters(wn.roles,wn.n):[];
        if(lines.length) h+="<div class='fcounter'><span class='fck'>IF YOU MEET THIS</span>"
          +lines.map(function(l){ return "<div>"+esc(l)+"</div>"; }).join("")+"</div>";
      }
      h+="</div>";
    });
    host.innerHTML=h;
    host.querySelectorAll(".linkish[data-id]").forEach(function(b){
      b.addEventListener("click",function(){ loadTarget(b.getAttribute("data-t"),+b.getAttribute("data-id")); });
    });
  });
}
/* ==== END LENS: THE FIGHT ==== */

/* ==== THE TRAIL ====
   Intel work is comparison: you read a pilot, then his corp, then the system he
   dies in, then back to the pilot. Losing the last thing you looked at is the
   single most annoying thing a console can do, so every target you open stays in
   a strip you can flip through. Flipping back is instant because the digest is
   already cached, which is what makes this worth having rather than a nicety. */
function pushTrail(t,id){
  if(TRAILQUIET) return;
  var here=TRAIL[TPOS];
  if(here&&here.t===t&&here.id===id) return;
  TRAIL=TRAIL.slice(0,TPOS+1);
  TRAIL.push({t:t,id:id,n:null});
  TPOS=TRAIL.length-1;
  if(TRAIL.length>24){ TRAIL.shift(); TPOS--; }
  paintTrail();
}
function nameTrail(t,id,name){
  var hit=false;
  TRAIL.forEach(function(x){ if(x.t===t&&x.id===id&&!x.n){ x.n=name; hit=true; } });
  if(hit) paintTrail();
}
function goTrail(i){
  if(i<0||i>=TRAIL.length||i===TPOS) return;
  TPOS=i; TRAILQUIET=true;
  loadTarget(TRAIL[i].t,TRAIL[i].id);
  TRAILQUIET=false; paintTrail();
}
function trailBack(){ goTrail(TPOS-1); }
function trailFwd(){ goTrail(TPOS+1); }
function paintTrail(){
  var el=document.getElementById("trailbar"); if(!el) return;
  if(TRAIL.length<1){ el.innerHTML=""; return; }
  var h="<div class='trail'>";
  h+="<button class='tnav' id='tback'"+(TPOS<=0?" disabled":"")+" title='back  [ '>&#8592;</button>";
  h+="<button class='tnav' id='tfwd'"+(TPOS>=TRAIL.length-1?" disabled":"")+" title='forward  ] '>&#8594;</button>";
  h+="<span class='tsep'></span>";
  TRAIL.forEach(function(x,i){
    h+="<button class='tchip"+(i===TPOS?" on":"")+"' data-i='"+i+"' title='"+esc(TYPEWORD[x.t]||x.t)+"'>"
      +esc(x.n||("#"+x.id))+"</button>";
  });
  h+="<span class='tsync' id='tsync'></span></div>";
  el.innerHTML=h;
  var b=document.getElementById("tback"), f=document.getElementById("tfwd");
  if(b) b.addEventListener("click",trailBack);
  if(f) f.addEventListener("click",trailFwd);
  el.querySelectorAll(".tchip").forEach(function(c){
    c.addEventListener("click",function(){ goTrail(+c.getAttribute("data-i")); });
  });
  paintSync();
}
/* the browser's own back button should do what the arrows do */
window.addEventListener("popstate",function(e){
  var st=e.state;
  if(st&&st.t&&st.id){ TRAILQUIET=true; loadTarget(st.t,st.id); TRAILQUIET=false;
    for(var i=0;i<TRAIL.length;i++) if(TRAIL[i].t===st.t&&TRAIL[i].id===st.id){ TPOS=i; break; }
    paintTrail(); }
});

/* ==== SYNC ====
   Two different clocks, deliberately. The LIVE layer (what is dying right now,
   where you are, the call) refreshes itself every five minutes because it is one
   cheap ESI call and it is worthless when stale. The open dossier does NOT
   refresh on a timer: a pilot's lifetime killboard does not move in five minutes,
   and refetching killboards on a loop is rude to zKillboard for no gain. It shows
   how old it is and syncs when you ask. */
function paintSync(){
  var el=document.getElementById("tsync"); if(!el) return;
  var mins=Math.floor((Date.now()-LASTSYNC)/60000);
  el.innerHTML="<button class='syncb"+(SYNCING?" spin":"")+"' id='syncbtn' title='refresh the live layer, and this file'>"
    +(SYNCING?"syncing":"sync")+"</button><span class='syncage'>"
    +(mins<1?"just now":mins+"m ago")+"</span>";
  var b=document.getElementById("syncbtn");
  if(b) b.addEventListener("click",function(){ syncNow(true); });
}
function syncNow(alsoTarget){
  if(SYNCING) return;
  SYNCING=true; paintSync();
  ESIACT=null;                 /* force the shared activity feed to refetch */
  CALLST.near=null;
  var jobs=[refreshHud(),Promise.resolve(findNearestFight()),Promise.resolve(paintYouAre())];
  if(alsoTarget&&cur){ try{ lsSet(LSD+cur.t+":"+cur.id,null); }catch(e){} loadTarget(cur.t,cur.id,true); }
  Promise.all(jobs.map(function(j){ return Promise.resolve(j).catch(function(){}); })).then(function(){
    LASTSYNC=Date.now(); SYNCING=false; paintSync();
  });
  setTimeout(function(){ if(SYNCING){ SYNCING=false; LASTSYNC=Date.now(); paintSync(); } },12000);
}
setInterval(function(){
  if(document.visibilityState!=="visible") return;
  ESIACT=null; CALLST.near=null;
  refreshHud(); findNearestFight(); paintYouAre();
  LASTSYNC=Date.now(); paintSync();
},300000);
setInterval(paintSync,60000);

}};
})();
