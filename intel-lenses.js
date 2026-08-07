/* BONK INTEL LENSES. Mounted by the GOBSEC portal and by /gobsec/desk/.
   Own module so it can carry its own helpers without colliding with the
   dossier engine's scope. BONKLENS.mount(el) injects the panes and starts. */
(function(){
var MARKUP='<div class="modes">\n      <button data-m="local" class="on">Local</button>\n      <button data-m="grid">Grid</button>\n      <button data-m="roam">Roam</button>\n      <button data-m="war">Warzone</button>\n      <button data-m="road">Corridor</button>\n      <button data-m="rocks">Rocks</button>\n      <button data-m="log">Our Log</button>\n    </div>\n\n    <!-- ---------------- LOCAL ---------------- -->\n    <div class="pane on" id="p-local">\n      <div class="row2">\n        <textarea class="paste" id="lpaste" spellcheck="false" placeholder="Paste the names from local, one per line.&#10;Anything we cannot match gets shown back to you so you can see why."></textarea>\n        <div class="ctl">\n          <input id="lsys" type="text" placeholder="system (optional)" autocomplete="off" spellcheck="false">\n          <button class="gobtn" id="lgo">Read the room</button>\n          <button class="btn" id="lmore" style="display:none">Read the rest</button>\n          <div class="hint">You get the dangerous ones first, with what they fly and who they fly\n          with. This is killboard history, not who is online right now.</div>\n        </div>\n      </div>\n      <div class="status" id="lstatus"></div>\n      <div id="lout"><div class="empty">Paste local and read the room.</div></div>\n    </div>\n\n    <!-- ---------------- GRID ---------------- -->\n    <div class="pane" id="p-grid">\n      <div class="row2">\n        <textarea class="paste" id="gpaste" spellcheck="false" placeholder="Paste an overview selection or a d-scan.&#10;The hull names are the part that matters."></textarea>\n        <div class="ctl">\n          <button class="gobtn" id="ggo">Read the grid</button>\n          <div class="hint">How many hulls, how much logi, who can hold you down, and whether\n          you can leave.</div>\n        </div>\n      </div>\n      <div class="status" id="gstatus"></div>\n      <div id="gout"><div class="empty">Paste what you see on grid.</div></div>\n    </div>\n\n    <!-- ---------------- ROAM ---------------- -->\n    <div class="pane" id="p-roam">\n      <div class="row2" style="align-items:flex-end">\n        <div class="ctl" style="flex-direction:row;flex-wrap:wrap;gap:10px;align-items:center">\n          <input id="rhome" type="text" placeholder="home system" autocomplete="off" spellcheck="false" style="width:150px">\n          <input id="rjumps" type="number" value="8" min="1" max="15" style="width:80px" title="max jumps from home">\n          <span class="toggle" id="rsec">\n            <button data-s="any" class="on">any</button>\n            <button data-s="hs">high</button>\n            <button data-s="ls">low</button>\n            <button data-s="ns">null</button>\n          </span>\n          <button class="gobtn" id="rgo">Find the fight</button>\n        </div>\n      </div>\n      <div class="hint">Where ships are actually dying right now, inside your jump range. Rats dying\n      does not count.</div>\n      <div class="status" id="rstatus"></div>\n      <div id="rout"><div class="empty">Pick a home and a range, then find the fight.</div></div>\n    </div>\n\n    <!-- ---------------- WARZONE ---------------- -->\n    <div class="pane" id="p-war">\n      <div class="row2" style="align-items:flex-end">\n        <div class="ctl" style="flex-direction:row;flex-wrap:wrap;gap:10px;align-items:center">\n          <span class="toggle" id="wfront">\n            <button data-w="500003:500002" class="on">Amarr v Minmatar</button>\n            <button data-w="500001:500004">Caldari v Gallente</button>\n            <button data-w="500011:0">Angel insurgency</button>\n            <button data-w="500010:0">Guristas insurgency</button>\n          </span>\n          <input id="whome" type="text" placeholder="home" autocomplete="off" spellcheck="false" style="width:130px">\n          <button class="gobtn" id="wgo">Read the front</button>\n        </div>\n      </div>\n      <div class="hint">The Amarr and Minmatar front is the closest one to us, about eight jumps.\n      Systems marked flipping are being taken right now, and that is where the fights are.</div>\n      <div class="status" id="wstatus"></div>\n      <div id="wout"><div class="empty">Pick a front and read it.</div></div>\n    </div>\n\n    <!-- ---------------- CORRIDOR ---------------- -->\n    <div class="pane" id="p-road">\n      <div class="row2" style="align-items:flex-end">\n        <div class="ctl" style="flex-direction:row;flex-wrap:wrap;gap:10px;align-items:center">\n          <button class="gobtn" id="dgo">Read the road</button>\n          <span class="cnt" id="droad"></span>\n        </div>\n      </div>\n      <div class="hint">Home to the pocket, hop by hop, live. The standing orders on each system\n      are the ones from the Watchtower. Chokepoints never read better than sketchy while anything\n      is dying there.</div>\n      <div class="status" id="dstatus"></div>\n      <div id="dout"><div class="empty">Read the road before the fleet undocks.</div></div>\n    </div>\n\n    <div class="pane" id="p-rocks">\n      <div class="row2" style="align-items:flex-end">\n        <div class="ctl" style="flex-direction:row;flex-wrap:wrap;gap:10px;align-items:center">\n          <input id="kreg" list="kregs" placeholder="region" autocomplete="off" style="width:180px">\n          <datalist id="kregs"></datalist>\n          <input id="khome" placeholder="home" autocomplete="off" style="width:130px">\n          <button class="gobtn" id="kgo">Find rocks</button>\n        </div>\n      </div>\n      <div class="hint">Belts never move, so they are baked. The danger beside them is live.</div>\n      <div class="status" id="kstatus"></div>\n      <div id="kout"><div class="empty">Pick a region and find the rocks.</div></div>\n    </div>\n\n    <div class="pane" id="p-log">\n      <div class="row2" style="align-items:flex-end">\n        <div class="ctl" style="flex-direction:row;gap:10px;align-items:center">\n          <button class="gobtn" id="ogo">Read our log</button>\n        </div>\n      </div>\n      <div class="hint">What we killed and what we lost, live, not from a bake.</div>\n      <div class="status" id="ostatus"></div>\n      <div id="oout"><div class="empty">Read the log.</div></div>\n    </div>';
window.BONKLENS={mount:function(root){
  if(!root) return; root.innerHTML=MARKUP;
  /* The corridor is doctrine and lives behind the session now. Only a cleared desk
     mounts this file at all, so the request always has a cookie to send; a failure
     leaves ROAD empty and the corridor lens renders nothing rather than guessing. */
  fetch("/api/roads",{credentials:"same-origin"})
    .then(function(r){ return r.ok?r.json():null; })
    .then(function(d){
      if(!d||!d.ok) return;
      if(d.road&&d.road.length) ROAD=d.road;
      HOME_N=d.home?d.home.n:"";
      HOME_REG=(d.regs&&d.regs[0])||"";
      /* prefill the three home inputs now that we know the name */
      ["rhome","whome","khome"].forEach(function(k){ var e=$(k); if(e&&!e.value) e.value=HOME_N; });
      var kr=$("kreg"); if(kr&&!kr.value) kr.value=HOME_REG;
    })
    .catch(function(){});

var GRP={"25":["Frigate",0],"26":["Cruiser",0],"27":["Battleship",0],"28":["Hauler",1],"29":["Capsule",1],"30":["Titan",0],"31":["Shuttle",1],"237":["Corvette",1],"324":["Assault Frigate",0],"358":["Heavy Assault Cruiser",0],"380":["Deep Space Transport",1],"419":["Combat Battlecruiser",0],"420":["Destroyer",0],"463":["Mining Barge",1],"485":["Dreadnought",0],"513":["Freighter",1],"540":["Command Ship",0],"541":["Interdictor",0],"543":["Exhumer",1],"547":["Carrier",0],"659":["Supercarrier",0],"830":["Covert Ops",0],"831":["Interceptor",0],"832":["Logistics",0],"833":["Force Recon Ship",0],"834":["Stealth Bomber",0],"883":["Capital Industrial Ship",1],"893":["Electronic Attack Ship",0],"894":["Heavy Interdiction Cruiser",0],"898":["Black Ops",0],"900":["Marauder",0],"902":["Jump Freighter",1],"906":["Combat Recon Ship",0],"941":["Industrial Command Ship",1],"963":["Strategic Cruiser",0],"1022":["Prototype Exploration Ship",1],"1201":["Attack Battlecruiser",0],"1202":["Blockade Runner",1],"1246":["Mobile Depot",1],"1249":["Mobile Cyno Inhibitor",1],"1250":["Mobile Tractor Unit",1],"1283":["Expedition Frigate",1],"1305":["Tactical Destroyer",0],"1527":["Logistics Frigate",0],"1534":["Command Destroyer",0],"1538":["Force Auxiliary",0],"1972":["Flag Cruiser",0],"4594":["Lancer Dreadnought",0],"4902":["Expedition Command Ship",0],"5087":["Special Edition Yachts",0],"5120":["Command Carrier",0]};
var T2G={"582":25,"583":25,"584":25,"585":25,"586":25,"587":25,"588":237,"589":25,"590":25,"591":25,"592":25,"593":25,"594":25,"596":237,"597":25,"598":25,"599":25,"601":237,"602":25,"603":25,"605":25,"606":237,"607":25,"608":25,"609":25,"615":237,"617":237,"620":26,"621":26,"622":26,"623":26,"624":26,"625":26,"626":26,"627":26,"628":26,"629":26,"630":26,"631":26,"632":26,"633":26,"634":26,"635":5087,"638":27,"639":27,"640":27,"641":27,"642":27,"643":27,"644":27,"645":27,"648":28,"649":28,"650":28,"651":28,"652":28,"653":28,"654":28,"655":28,"656":28,"657":28,"670":29,"671":30,"672":31,"1944":28,"2006":26,"2078":1022,"2161":25,"2834":324,"2836":358,"2863":28,"2998":28,"3514":659,"3516":324,"3518":358,"3532":25,"3756":419,"3764":30,"3766":25,"4302":1201,"4306":1201,"4308":1201,"4310":1201,"4363":28,"4388":28,"11011":26,"11129":31,"11132":31,"11134":31,"11172":830,"11174":893,"11176":831,"11178":831,"11182":830,"11184":831,"11186":831,"11188":830,"11190":893,"11192":830,"11194":893,"11196":831,"11198":831,"11200":831,"11202":831,"11365":324,"11371":324,"11377":834,"11379":324,"11381":324,"11387":893,"11393":324,"11400":324,"11567":30,"11936":27,"11938":27,"11940":25,"11942":25,"11957":833,"11959":906,"11961":906,"11963":833,"11965":833,"11969":833,"11971":906,"11978":832,"11985":832,"11987":832,"11989":832,"11993":358,"11995":894,"11999":358,"12003":358,"12005":358,"12011":358,"12013":894,"12015":358,"12017":894,"12019":358,"12021":894,"12023":358,"12032":834,"12034":834,"12038":834,"12042":324,"12044":324,"12729":1202,"12731":380,"12733":1202,"12735":1202,"12743":1202,"12745":380,"12747":380,"12753":380,"13202":27,"16227":419,"16229":419,"16231":419,"16233":419,"16236":420,"16238":420,"16240":420,"16242":420,"17476":463,"17478":463,"17480":463,"17619":25,"17634":26,"17636":27,"17703":25,"17709":26,"17713":26,"17715":26,"17718":26,"17720":26,"17722":26,"17726":27,"17728":27,"17732":27,"17736":27,"17738":27,"17740":27,"17812":25,"17841":25,"17843":26,"17918":27,"17920":27,"17922":26,"17924":25,"17926":25,"17928":25,"17930":25,"17932":25,"19720":485,"19722":485,"19724":485,"19726":485,"19744":28,"20125":906,"20183":513,"20185":513,"20187":513,"20189":513,"21097":31,"21628":31,"22428":898,"22430":898,"22436":898,"22440":898,"22442":540,"22444":540,"22446":540,"22448":540,"22452":541,"22456":541,"22460":541,"22464":541,"22466":540,"22468":540,"22470":540,"22474":540,"22544":543,"22546":543,"22548":543,"22852":659,"23757":547,"23773":30,"23911":547,"23913":659,"23915":547,"23917":659,"23919":659,"24483":547,"24688":27,"24690":27,"24692":27,"24694":27,"24696":419,"24698":419,"24700":419,"24702":419,"26840":27,"26842":27,"28352":883,"28606":941,"28659":900,"28661":900,"28665":900,"28710":900,"28844":902,"28846":902,"28848":902,"28850":902,"29248":25,"29266":31,"29336":26,"29337":26,"29340":26,"29344":26,"29984":963,"29986":963,"29988":963,"29990":963,"30842":31,"32207":324,"32209":358,"32305":27,"32307":27,"32309":27,"32311":27,"32788":324,"32790":832,"32811":28,"32872":420,"32874":420,"32876":420,"32878":420,"32880":25,"33079":237,"33081":237,"33083":237,"33151":419,"33153":419,"33155":419,"33157":419,"33328":29,"33395":833,"33397":830,"33468":25,"33470":26,"33472":27,"33474":1246,"33475":1250,"33476":1249,"33513":31,"33520":1246,"33522":1246,"33553":26,"33673":831,"33675":833,"33697":1283,"33700":1250,"33702":1250,"33816":25,"33818":26,"33820":27,"34317":1305,"34328":513,"34496":31,"34562":1305,"34590":5087,"34828":1305,"35683":1305,"35779":831,"35781":894,"37135":1283,"37453":25,"37454":25,"37455":25,"37456":25,"37457":1527,"37458":1527,"37459":1527,"37460":1527,"37480":1534,"37481":1534,"37482":1534,"37483":1534,"37604":1538,"37605":1538,"37606":1538,"37607":1538,"42124":485,"42125":659,"42126":30,"42241":30,"42242":1538,"42243":485,"42244":941,"42245":832,"42246":830,"42685":420,"44993":830,"44995":833,"44996":898,"45530":834,"45531":833,"45534":1972,"45645":1538,"45647":485,"45649":30,"47269":25,"47270":26,"47271":27,"47466":27,"48635":833,"48636":830,"49710":420,"49711":419,"49712":26,"49713":832,"52250":324,"52252":358,"52254":1534,"52907":485,"54731":25,"54732":26,"54733":27,"56701":1250,"60764":894,"60765":893,"64034":31,"72811":419,"72812":419,"72869":419,"72872":419,"72903":25,"72904":25,"72907":25,"72913":25,"73787":485,"73789":420,"73790":485,"73792":485,"73793":485,"73794":420,"73795":420,"73796":420,"74141":324,"74316":358,"77114":25,"77281":4594,"77283":4594,"77284":4594,"77288":4594,"77726":358,"78333":420,"78366":419,"78367":420,"78369":419,"78414":324,"78576":30,"81008":28,"81040":513,"81046":1202,"81047":380,"81951":1250,"85062":830,"85086":419,"85087":420,"85229":833,"85236":898,"87381":485,"88001":900,"89240":420,"89607":4902,"89647":420,"89648":25,"89649":1534,"89807":1201,"89808":1305,"91174":420,"91775":420,"91849":420,"91857":420,"91858":420,"92282":5087,"92283":5087,"92284":5087,"92822":5120,"92823":5120,"92824":5120,"92825":5120};
var SOFT_T={"32880": 1};
var ZK="https://zkillboard.com/api", ESI="https://esi.evetech.net/latest", IMG="https://images.evetech.net";
var TRIPWIRE="https://bonk-tripwire.kyle-dd7.workers.dev";
var OUR_ALLI=99015148, OUR_CORPS={98342394:1,98840038:1,98838780:1,98807741:1};
/* desk keeps its OWN cache namespace and READS the briefing's. The briefing digest is a
   different shape, so writing ours into its key would make /briefing/ render a broken file.
   Shared warmth, no cross contamination. Spec cache contract, red team F2. */
var CK_DESK="bonk_desk_v1::", CK_BRIEF="bonk_brief_v1::", TTL=600000;

function $(i){ return document.getElementById(i); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }
function isk(v){ if(v==null||!isFinite(v)) return "0"; var a=Math.abs(v);
  if(a>=1e9) return (v/1e9).toFixed(1)+"B"; if(a>=1e6) return (v/1e6).toFixed(0)+"M";
  if(a>=1e3) return (v/1e3).toFixed(0)+"k"; return String(Math.round(v)); }
function wait(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
function lsGet(k){ try{ return JSON.parse(localStorage.getItem(k)||"null"); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function postJson(u,b){ return fetch(u,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(b)})
  .then(function(r){ if(!r.ok) throw r.status; return r.json(); }); }

/* ---- one serialized zkill chain, with a head-of-queue lane for the active mode ---- */
var chain=Promise.resolve();
function zk(path){
  var p=chain.then(function(){ return wait(350); }).then(function(){
    return fetch(ZK+path,{headers:{"Accept":"application/json"}}).then(function(r){
      if(!r.ok) throw "http "+r.status; return r.json(); });
  });
  chain=p.catch(function(){});
  return p;
}
/* zkill returns 30 bytes of empty for a wrong-type path rather than an error, so an
   empty body is "no data", never "a peaceful entity". */
function statsOf(type,id){
  var path=type==="alli"?"allianceID":type==="corp"?"corporationID":"characterID";
  return zk("/stats/"+path+"/"+id+"/").then(function(d){
    if(!d||typeof d!=="object"||(!d.info&&d.shipsDestroyed==null)) return null; return d; });
}

/* ---- clearance: gate on what whoami actually returns (verified src/index.js:125-131) ---- */
var me={loggedIn:false,gss:false,gobsec:false};
/* The HOST PAGE owns clearance and decides whether this module is mounted at all.
   The module only needs to know who it is talking to, so it reads whoami for the
   GSS overlay and never touches the page shell. Two gates fighting over the same
   #app/#gate elements is how a portal ends up hiding itself. */
fetch("/api/whoami",{credentials:"same-origin",cache:"no-store"})
  .then(function(r){ return r.ok?r.json():null; })
  .then(function(d){ if(d) me=d; if(me.gss) loadFiles(); })
  .catch(function(){});

/* ---- the files: one call, whole set, cleared sessions only ---- */
var FILES={by:{},n:0,state:"none"};
function loadFiles(){
  FILES.state="loading";
  fetch("/api/gss/entities",{credentials:"same-origin"}).then(function(r){ return r.ok?r.json():null; })
    .then(function(d){
      if(!d||!d.ok){ FILES.state="denied"; return; }
      (d.entities||[]).forEach(function(e){ if(e.eve_id) FILES.by[e.eve_id]=e; });
      FILES.n=(d.entities||[]).length; FILES.state="ok";
    }).catch(function(){ FILES.state="error"; });
}
function fileFor(){ for(var i=0;i<arguments.length;i++){ var f=FILES.by[arguments[i]]; if(f) return f; } return null; }

/* ---- status strips: every source reports its outcome. Silence is never peace. ---- */
function paint(el,parts){ $(el).innerHTML=parts.filter(Boolean).join(" &middot; "); }

/* ================= MODE PLUMBING ================= */
var mode="local", gen=0, parked={};
function setMode(m){
  if(m===mode) return;
  parked[mode]=true;          /* park: the queue stops issuing, state stays */
  mode=m; gen++;              /* the entered mode takes the head of the chain */
  var bs=document.querySelectorAll(".modes button");
  for(var i=0;i<bs.length;i++) bs[i].classList.toggle("on",bs[i].getAttribute("data-m")===m);
  ["local","grid","roam","war","road","rocks","log"].forEach(function(k){ $("p-"+k).classList.toggle("on",k===m); });
  /* preserve params this module does not own: the dossier engine writes t and id
     on the same page and the two were wiping each other. */
  try{
    var u=new URL(location.href);
    u.searchParams.set("m",m);
    history.replaceState(history.state,"",u.pathname+u.search);
  }catch(e){}
}
document.querySelector(".modes").addEventListener("click",function(e){
  var b=e.target.closest?e.target.closest("button[data-m]"):null; if(b) setMode(b.getAttribute("data-m"));
});

/* ================= LOCAL ================= */
/* Format agnostic on purpose. Nobody has handed us a verified local dump yet, so we
   try every token and SHOW what failed instead of quietly reading an empty room. */
function tokenize(text){
  var out=[], seen={}, raw=[];
  (text||"").split(/\r?\n/).forEach(function(line){
    var t=line.trim(); if(!t) return;
    raw.push(t);
    var cands=[t];
    if(t.indexOf("\t")>=0) cands=cands.concat(t.split("\t"));
    cands.forEach(function(c){
      c=c.replace(/^[\[\(<]|[\]\)>]$/g,"").replace(/\*+$/,"").trim();
      if(!c||c.length<3||c.length>37) return;
      var k=c.toLowerCase(); if(seen[k]) return; seen[k]=1; out.push(c);
    });
  });
  return {cands:out,raw:raw};
}
var LS_STATE=null;
function readRoom(){
  var g=++gen; parked.local=false;
  var tk=tokenize($("lpaste").value);
  if(!tk.cands.length){ $("lout").innerHTML="<div class='empty'>Nothing in the box.</div>"; return; }
  $("lout").innerHTML="<div class='empty'>resolving "+tk.cands.length+" names...</div>";
  var S={names:"...",aff:"",files:FILES.state==="ok"?("files "+FILES.n):"",orgs:"",pilots:""};
  paint("lstatus",["names ..."]);
  var chunks=[]; for(var i=0;i<tk.cands.length;i+=500) chunks.push(tk.cands.slice(i,i+500));
  var chars=[];
  chunks.reduce(function(p,c){ return p.then(function(){
    return postJson(ESI+"/universe/ids/?datasource=tranquility",c)
      .then(function(d){ (d.characters||[]).forEach(function(x){ chars.push(x); }); })
      .catch(function(){});
  }); },Promise.resolve()).then(function(){
    if(g!==gen) return;
    if(!chars.length){
      $("lstatus").innerHTML="<span class='bad'>nothing resolved</span>";
      $("lout").innerHTML="<div class='empty'>No name in that paste resolved to a character. "
        +"The lines are below exactly as pasted, so you can see what format we got.</div>"
        +"<div class='unres'>"+esc(tk.raw.slice(0,40).join("\n"))+"</div>";
      return;
    }
    var resolved={}; chars.forEach(function(c){ resolved[c.name.toLowerCase()]=1; });
    var unresolved=tk.raw.filter(function(l){
      var t=l.trim().toLowerCase(); if(resolved[t]) return false;
      return !l.split("\t").some(function(f){ return resolved[f.trim().toLowerCase()]; });
    });
    paint("lstatus",["names "+chars.length,"aff ..."]);
    var ids=chars.map(function(c){ return c.id; });
    return postJson(ESI+"/characters/affiliation/?datasource=tranquility",ids.slice(0,1000))
      .then(function(aff){
        if(g!==gen) return;
        var byId={}; aff.forEach(function(a){ byId[a.character_id]=a; });
        LS_STATE={g:g,pilots:chars.map(function(c){
          var a=byId[c.id]||{};
          return {id:c.id,n:c.name,corp:a.corporation_id||0,alli:a.alliance_id||0,
                  band:"unread",stats:null,promoted:false};
        }),unresolved:unresolved,sys:($("lsys").value||"").trim(),orgs:[],orgRead:0,orgSkip:0,pilotRead:0,cap:40};
        classifyAll(); renderRoom();
        paint("lstatus",["names "+chars.length,"aff ok",FILES.state==="ok"?("files "+FILES.n):(me.gss?"files "+FILES.state:"")]);
        runOrgs(g);
      });
  }).catch(function(e){
    if(g!==gen) return;
    $("lstatus").innerHTML="<span class='bad'>resolve failed: "+esc(String(e))+"</span>";
  });
}

function cacheGet(id){
  var d=lsGet(CK_DESK+"char:"+id);
  if(d&&Date.now()-d.ts<TTL&&d.has&&d.has.indexOf("pvp")>=0) return {full:true,s:d.s};
  var b=lsGet(CK_BRIEF+"char:"+id);
  /* briefing entries carry core only: name and headline numbers, never activepvp/groups.
     PARTIAL is a state, not a hit. The pilot stays queued. */
  if(b&&b.digest&&Date.now()-b.ts<TTL) return {full:false,core:b.digest};
  return null;
}
function cachePut(id,s){ lsSet(CK_DESK+"char:"+id,{ts:Date.now(),sv:2,has:["core","pvp"],s:s}); }

function isOurs(p){ return p.alli===OUR_ALLI||OUR_CORPS[p.corp]; }
function bandOf(p){
  if(isOurs(p)) return "ours";
  var f=fileFor(p.id,p.corp,p.alli);
  if(f&&(f.classification==="hostile"||f.classification==="hostile_priority"||f.classification==="target")) return "filed";
  if(!p.stats) return "unread";
  var s=p.stats, k=s.shipsDestroyed||0, l=s.shipsLost||0, d=s.dangerRatio||0, solo=s.soloKills||0;
  if(!k&&!l) return "ghost";
  if(d>=75||solo>=50) return "killer";
  if(d>=40) return "fighter";
  if(!k&&l>20) return "sleeper";
  return "none";
}
function classifyAll(){ if(LS_STATE) LS_STATE.pilots.forEach(function(p){ p.band=bandOf(p); }); }

/* T1: promote first, cap second. A one man corp holding a cyno alt sorts last by
   headcount and is exactly what the flag is for, so headcount order alone would
   quietly disable it. */
function runOrgs(g){
  var st=LS_STATE; if(!st) return;
  var orgs={};
  st.pilots.forEach(function(p){
    if(isOurs(p)) return;
    [["corp",p.corp],["alli",p.alli]].forEach(function(pair){
      if(!pair[1]) return;
      var k=pair[0]+":"+pair[1];
      if(!orgs[k]) orgs[k]={t:pair[0],id:pair[1],n:0,stats:null,members:[]};
      orgs[k].n++; orgs[k].members.push(p);
    });
  });
  var list=Object.keys(orgs).map(function(k){ return orgs[k]; });
  list.forEach(function(o){
    o.file=fileFor(o.id);
    o.hasGhost=o.members.some(function(m){ return m.band==="ghost"; });
    o.hasKiller=o.members.some(function(m){ return m.band==="killer"; });
    o.promoted=!!(o.file||o.hasGhost||o.hasKiller);
  });
  list.sort(function(a,b){ return (b.promoted-a.promoted)||(b.n-a.n); });
  var CAP=25, take=[], skipped=0;
  list.forEach(function(o){ if(o.promoted||take.length<CAP) take.push(o); else skipped++; });
  st.orgs=take; st.orgSkip=skipped;
  take.reduce(function(p,o){ return p.then(function(){
    if(g!==gen||parked[ "local" ]) return;
    return statsOf(o.t,o.id).then(function(s){
      if(g!==gen) return;
      o.stats=s; st.orgRead++;
      paint("lstatus",["names "+st.pilots.length,"aff ok",
        FILES.state==="ok"?("files "+FILES.n):"",
        "<span class='qn'>orgs "+st.orgRead+"/"+take.length+(skipped?" ("+skipped+" skipped)":"")+"</span>"]);
      renderRoom();
    }).catch(function(){ st.orgRead++; });
  }); },Promise.resolve()).then(function(){ if(g===gen) runPilots(g); });
}

function runPilots(g){
  var st=LS_STATE; if(!st) return;
  var order={filed:0,ghost:1,unread:2,ours:9};
  var q=st.pilots.filter(function(p){ return !isOurs(p)&&!p.stats; });
  q.forEach(function(p){
    var o=st.orgs.filter(function(x){ return (x.t==="corp"&&x.id===p.corp)||(x.t==="alli"&&x.id===p.alli); })[0];
    var od=o&&o.stats?(o.stats.dangerRatio||0):0;
    p._pri=(p.band==="filed"?0:o&&o.file?1:od>=50?2:3);
  });
  q.sort(function(a,b){ return a._pri-b._pri; });
  var take=q.slice(0,st.cap);
  $("lmore").style.display=q.length>take.length?"":"none";
  $("lmore").textContent="Read the rest ("+(q.length-take.length)+")";
  take.reduce(function(p,pl){ return p.then(function(){
    if(g!==gen||parked["local"]) return;
    var c=cacheGet(pl.id);
    if(c&&c.full){ pl.stats=c.s; pl.band=bandOf(pl); st.pilotRead++; renderRoom(); return; }
    if(c&&!c.full&&c.core) pl.coreOnly=c.core;   /* renders, still queued */
    return statsOf("char",pl.id).then(function(s){
      if(g!==gen) return;
      if(s){ pl.stats=s; cachePut(pl.id,s); }
      pl.band=bandOf(pl); st.pilotRead++;
      paint("lstatus",["names "+st.pilots.length,"aff ok",
        FILES.state==="ok"?("files "+FILES.n):"",
        "orgs "+st.orgRead+"/"+st.orgs.length+(st.orgSkip?" ("+st.orgSkip+" skipped)":""),
        "<span class='qn'>pilots "+st.pilotRead+"/"+take.length+"</span>"]);
      renderRoom();
    }).catch(function(){ st.pilotRead++; });
  }); },Promise.resolve());
}

function roomVerdict(st){
  var live=st.pilots.filter(function(p){ return !isOurs(p); });
  var unread=live.filter(function(p){ return p.band==="unread"; }).length;
  var killers=live.filter(function(p){ return p.band==="killer"; });
  var ghosts=live.filter(function(p){ return p.band==="ghost"; });
  var filed=live.filter(function(p){ return p.band==="filed"; });
  var suffix=unread?" <span class='vu'>("+unread+" still unread.)</span>":"";
  if(!st.pilots.length) return "Nothing resolved. Check the paste."+suffix;
  if(!live.length) return "Just us."+suffix;
  /* capital friends: an org that has killed in a capital hull */
  var capOrg=null;
  st.orgs.forEach(function(o){
    if(!o.stats||!o.stats.groups) return;
    for(var gid in o.stats.groups){
      var meta=GRP[gid]; if(!meta) continue;
      if(/Carrier|Dreadnought|Titan|Supercarrier|Force Auxiliary/i.test(meta[0])&&(o.stats.groups[gid].shipsDestroyed>0)) capOrg=o;
    }
  });
  if(ghosts.length&&capOrg) return "Somebody here has no killboard and cap friends. That is the whole warning."+suffix;
  var pri=filed.filter(function(p){ var f=fileFor(p.id,p.corp,p.alli); return f&&f.classification==="hostile_priority"; })[0];
  if(pri) return esc(pri.n)+" is in here. You know what that means."+suffix;
  var byOrg={};
  killers.forEach(function(k){ var key=k.alli||k.corp; byOrg[key]=(byOrg[key]||0)+1; });
  var bigKey=null,bigN=0; for(var k2 in byOrg) if(byOrg[k2]>bigN){ bigN=byOrg[k2]; bigKey=k2; }
  if(bigN>=2){
    var o2=st.orgs.filter(function(o){ return String(o.id)===String(bigKey); })[0];
    var nm=o2&&o2.stats&&o2.stats.info?o2.stats.info.name:"They";
    return esc(nm)+" brought "+bigN+" people who kill things. Not a gank crew, a gang."+suffix;
  }
  var blob=st.orgs.filter(function(o){ return o.n>=10&&o.stats&&(o.stats.avgGangSize||0)>=8; })[0];
  if(blob) return (blob.stats.info?esc(blob.stats.info.name):"One org")+" has "+blob.n+" people here and fights in numbers."+suffix;
  if(killers.length) return esc(killers[0].n)+" is the one that matters. The rest is furniture."+suffix;
  if(filed.length) return filed.length+" on file in here. Nothing with teeth yet."+suffix;
  if(unread===live.length) return "Nobody read yet. Give it a second."+suffix;
  if(live.length<=3) return live.length+" names, nothing on any of them. Quiet."+suffix;
  return "Nothing in here has teeth. Undock."+suffix;
}

function renderRoom(){
  var st=LS_STATE; if(!st) return;
  var live=st.pilots.filter(function(p){ return !isOurs(p); });
  var ours=st.pilots.length-live.length;
  var h="<div class='verdict'><span class='vl'>THE ROOM</span><div class='vt'>"+roomVerdict(st)+"</div></div>";
  h+="<div class='flags'>";
  h+="<span class='flag mut'>"+st.pilots.length+" in local</span>";
  h+="<span class='flag mut'>"+st.orgs.length+" orgs</span>";
  if(ours) h+="<span class='flag ok'>"+ours+" ours</span>";
  var filed=live.filter(function(p){ return p.band==="filed"; }).length;
  if(filed) h+="<span class='flag'>"+filed+" on file</span>";
  var gh=live.filter(function(p){ return p.band==="ghost"; }).length;
  if(gh) h+="<span class='flag amb'>"+gh+" no killboard</span>";
  var stale=live.filter(function(p){ var f=fileFor(p.id); return f&&f.eve_type==="pilot"&&p.alli&&f.summary&&false; }).length;
  h+="</div>";
  /* orgs */
  h+="<div class='sect'><div class='sh'><b>THE ORGS</b><span class='rt'>"
    +st.orgRead+" of "+st.orgs.length+" read"+(st.orgSkip?", "+st.orgSkip+" skipped":"")+"</span></div>";
  if(!st.orgs.length) h+="<div class='empty'>Nobody with a corp.</div>";
  else{
    h+="<table class='dt'><thead><tr><th>ORG</th><th class='num'>HERE</th><th>DANGER</th><th class='num'>AVG GANG</th><th>FLIES</th><th>FILE</th></tr></thead><tbody>";
    st.orgs.slice().sort(function(a,b){
      var da=a.stats?(a.stats.dangerRatio||0):-1, db=b.stats?(b.stats.dangerRatio||0):-1;
      return db-da||b.n-a.n;
    }).forEach(function(o){
      var s=o.stats, nm=s&&s.info?s.info.name:(o.t==="alli"?"alliance ":"corp ")+o.id;
      var tick=s&&s.info&&s.info.ticker?" ["+s.info.ticker+"]":"";
      var top=null; if(s&&s.topLists) s.topLists.forEach(function(t){ if(t.type==="shipType"&&t.values&&t.values[0]) top=t.values[0].shipName; });
      h+="<tr"+(o.file?" class='filed'":"")+"><td><a href='https://zkillboard.com/"+(o.t==="alli"?"alliance":"corporation")+"/"+o.id+"/' target='_blank' rel='noopener'>"+esc(nm)+esc(tick)+"</a>"
        +(o.promoted&&!o.file?" <span class='band b-unread'>promoted</span>":"")+"</td>"
        +"<td class='num'>"+o.n+"</td>"
        +"<td>"+(s?"<span class='band "+(s.dangerRatio>=75?"b-killer":s.dangerRatio>=40?"b-fighter":"b-none")+"'>"+Math.round(s.dangerRatio||0)+"</span>":"<span class='band b-unread'>unread</span>")+"</td>"
        +"<td class='num'>"+(s&&s.avgGangSize?s.avgGangSize.toFixed(1):"")+"</td>"
        +"<td>"+esc(top||"")+"</td>"
        +"<td>"+(o.file?"<span class='band b-filed'>"+esc(o.file.classification)+"</span>":"")+"</td></tr>";
    });
    h+="</tbody></table>";
  }
  h+="</div>";
  /* pilots: most dangerous first, always. No ascending sort exists on purpose. */
  h+="<div class='sect'><div class='sh'><b>THE PILOTS</b><span class='rt'>most dangerous first</span></div>";
  h+="<table class='dt'><thead><tr><th>PILOT</th><th>READ</th><th class='num'>KILLS</th><th class='num'>SOLO</th><th class='num'>DANGER</th><th>ORG</th><th></th></tr></thead><tbody>";
  var rank={filed:0,killer:1,fighter:2,ghost:3,sleeper:4,none:5,unread:6,ours:7};
  st.pilots.slice().sort(function(a,b){
    var ra=rank[a.band],rb=rank[b.band];
    if(ra!==rb) return ra-rb;
    var da=a.stats?(a.stats.dangerRatio||0):-1, db=b.stats?(b.stats.dangerRatio||0):-1;
    return db-da;
  }).forEach(function(p){
    var s=p.stats, f=fileFor(p.id,p.corp,p.alli);
    var label={filed:"ON FILE",killer:"HARD TARGET",fighter:"REAL",ghost:"NO KILLBOARD",
               sleeper:"GETS CAUGHT",none:"NOT A THREAT",unread:"UNREAD",ours:"OURS"}[p.band];
    var org=st.orgs.filter(function(o){ return (o.t==="alli"&&o.id===p.alli)||(o.t==="corp"&&o.id===p.corp); })[0];
    var on=org&&org.stats&&org.stats.info?org.stats.info.name:"";
    h+="<tr class='"+(p.band==="filed"?"filed":p.band==="ours"?"ours":"")+"'>"
      +"<td><a href='/briefing/?t=char&id="+p.id+"' title='open the full file'>"+esc(p.n)+"</a></td>"
      +"<td><span class='band b-"+p.band+"'>"+label+"</span>"
        +(f?" <span class='band b-filed'>"+esc(f.classification)+"</span>":"")+"</td>"
      +"<td class='num'>"+(s?(s.shipsDestroyed||0):"")+"</td>"
      +"<td class='num'>"+(s?(s.soloKills||0):"")+"</td>"
      +"<td class='num'>"+(s?Math.round(s.dangerRatio||0):"")+"</td>"
      +"<td>"+esc(on)+"</td>"
      +"<td><a href='https://zkillboard.com/character/"+p.id+"/' target='_blank' rel='noopener'>zkill</a></td></tr>";
  });
  h+="</tbody></table></div>";
  if(st.unresolved&&st.unresolved.length){
    h+="<div class='sect'><div class='sh'><b>UNRESOLVED</b><span class='rt'>"+st.unresolved.length+" lines</span></div>"
      +"<div class='unres'>"+esc(st.unresolved.slice(0,40).join("\n"))+"</div></div>";
  }
  $("lout").innerHTML=h;
}
$("lgo").addEventListener("click",readRoom);
$("lmore").addEventListener("click",function(){ if(LS_STATE){ LS_STATE.cap+=40; runPilots(gen); } });

/* ================= GRID ================= */
/* the role table is shared (see /intel-roles.js): the grid lens and the fight
   reader must never disagree about what a hull does. Fallback keeps this module
   standalone if it is ever mounted without the shared file. */
var ROLEMAP=window.BONKROLES||{of:function(){return "DPS";},counters:function(){return [];}};
var NAME2TYPE=null;
function buildNameIndex(){
  if(NAME2TYPE) return Promise.resolve(NAME2TYPE);
  /* type ids we carry are ship groups only; resolve names for them once, cached */
  var c=lsGet("bonk_desk_hulls_v1");
  if(c&&c.n){ NAME2TYPE=c.n; return Promise.resolve(NAME2TYPE); }
  var ids=Object.keys(T2G).map(Number);
  var out={}, chunks=[];
  for(var i=0;i<ids.length;i+=900) chunks.push(ids.slice(i,i+900));
  return chunks.reduce(function(p,ch){ return p.then(function(){
    return postJson(ESI+"/universe/names/?datasource=tranquility",ch)
      .then(function(a){ a.forEach(function(x){ out[x.name.toLowerCase()]=x.id; }); }).catch(function(){});
  }); },Promise.resolve()).then(function(){ NAME2TYPE=out; lsSet("bonk_desk_hulls_v1",{n:out}); return out; });
}
function readGrid(){
  var g=++gen; parked.grid=false;
  var text=$("gpaste").value||"";
  if(!text.trim()){ $("gout").innerHTML="<div class='empty'>Nothing in the box.</div>"; return; }
  $("gstatus").textContent="reading hulls...";
  buildNameIndex().then(function(idx){
    if(g!==gen) return;
    var counts={}, roles={TACKLE:0,LOGI:0,EWAR:0,CAPITAL:0,DPS:0,SOFT:0,STRUCTURE:0}, unknown=[], total=0;
    text.split(/\r?\n/).forEach(function(line){
      var t=line.trim(); if(!t) return;
      var cands=[t].concat(t.indexOf("\t")>=0?t.split("\t"):[]);
      var hit=null;
      for(var i=0;i<cands.length&&!hit;i++){
        var k=cands[i].trim().toLowerCase();
        if(idx[k]) hit=idx[k];
      }
      if(!hit){ unknown.push(t); return; }
      var grp=GRP[T2G[hit]]; if(!grp) { unknown.push(t); return; }
      var gname=grp[0];
      counts[gname]=(counts[gname]||0)+1; total++;
      roles[ROLEMAP.of(gname)]++;
    });
    $("gstatus").textContent=total+" hulls identified"+(unknown.length?", "+unknown.length+" lines not hulls":"");
    if(!total){
      $("gout").innerHTML="<div class='empty'>No hull names in that paste. The lines are below as pasted.</div>"
        +"<div class='unres'>"+esc(unknown.slice(0,30).join("\n"))+"</div>";
      return;
    }
    var lines=[];
    if(roles.CAPITAL>=1) lines.push("There is a capital on grid. That is not a fight, that is a trap or a bill.");
    if(roles.LOGI>=2) lines.push(roles.LOGI+" logi. You break the reps or you leave.");
    else if(roles.LOGI===1) lines.push("One logi. Alpha it or accept a long fight.");
    if(roles.TACKLE>=2&&roles.DPS>=3) lines.push("They can hold you. Do not orbit anything you cannot leave.");
    if(roles.EWAR>=1) lines.push(roles.EWAR+" EWAR. Assume you get jammed at the worst moment.");
    if(!roles.DPS&&!roles.CAPITAL&&roles.SOFT===total) lines.push("Nothing on grid can hurt you.");
    if(!lines.length) lines.push(total+" hulls, nothing that changes the maths.");
    var h="<div class='verdict'><span class='vl'>ON GRID</span><div class='vt'>"+esc(lines[0])+"</div></div>";
    h+="<div class='flags'>";
    ["CAPITAL","LOGI","EWAR","TACKLE","DPS","SOFT","STRUCTURE"].forEach(function(r){
      if(roles[r]) h+="<span class='flag"+(r==="SOFT"||r==="STRUCTURE"?" mut":r==="DPS"?" amb":"")+"'>"+roles[r]+" "+r+"</span>";
    });
    h+="</div>";
    if(lines.length>1){ h+="<div class='sect'><div class='sh'><b>WHAT IT DOES TO YOU</b></div>";
      lines.slice(1).forEach(function(l){ h+="<div class='hint' style='font-size:13px;color:var(--silver-dim)'>"+esc(l)+"</div>"; });
      h+="</div>"; }
    h+="<div class='sect'><div class='sh'><b>THE CENSUS</b><span class='rt'>"+total+" hulls</span></div><table class='dt'><thead><tr><th>CLASS</th><th class='num'>N</th></tr></thead><tbody>";
    Object.keys(counts).sort(function(a,b){ return counts[b]-counts[a]; }).forEach(function(k){
      h+="<tr><td>"+esc(k)+"</td><td class='num'>"+counts[k]+"</td></tr>"; });
    h+="</tbody></table></div>";
    if(unknown.length) h+="<div class='sect'><div class='sh'><b>NOT HULLS</b><span class='rt'>"+unknown.length+" lines</span></div><div class='unres'>"+esc(unknown.slice(0,30).join("\n"))+"</div></div>";
    $("gout").innerHTML=h;
  });
}
$("ggo").addEventListener("click",readGrid);

/* ================= ROAM ================= */
/* systems.json rows are positional and neighbours are ROW INDICES, not system ids:
   ["Tanoo", 30000001, 0.858, 11, [2,4,6]] = name, id, truesec, regionIdx, neighbourIdxs */
var SYS=null;
function loadSys(){
  if(SYS) return Promise.resolve(SYS);
  return fetch("/fleet/systems.json").then(function(r){ return r.json(); }).then(function(d){
    var byName={}, byId={};
    d.sys.forEach(function(row,i){ byName[row[0].toLowerCase()]=i; byId[row[1]]=i; });
    SYS={d:d,byName:byName,byId:byId}; return SYS;
  });
}
function bfs(S,startIdx,maxJ){
  var dist={}, q=[startIdx], seen={}; seen[startIdx]=1; dist[startIdx]=0;
  while(q.length){
    var cur=q.shift(), dcur=dist[cur];
    if(dcur>=maxJ) continue;
    (S.d.sys[cur][4]||[]).forEach(function(nb){
      if(seen[nb]) return; seen[nb]=1; dist[nb]=dcur+1; q.push(nb);
    });
  }
  return dist;
}
var rsec="any";
$("rsec").addEventListener("click",function(e){
  var b=e.target.closest?e.target.closest("button[data-s]"):null; if(!b) return;
  rsec=b.getAttribute("data-s");
  var bs=$("rsec").querySelectorAll("button");
  for(var i=0;i<bs.length;i++) bs[i].classList.toggle("on",bs[i]===b);
});
function findFight(){
  var g=++gen; parked.roam=false;
  var home=($("rhome").value||HOME_N).trim().toLowerCase();
  var maxJ=Math.max(1,Math.min(15,parseInt($("rjumps").value,10)||8));
  $("rstatus").textContent="mapping...";
  Promise.all([loadSys(),
    fetch(ESI+"/universe/system_kills/?datasource=tranquility").then(function(r){ return r.ok?r.json():[]; }).catch(function(){ return null; }),
    fetch(TRIPWIRE+"/region").then(function(r){ return r.ok?r.json():[]; }).catch(function(){ return null; })
  ]).then(function(res){
    if(g!==gen) return;
    var S=res[0], kills=res[1], ours=res[2];
    var hi=S.byName[home];
    if(hi==null){ $("rstatus").innerHTML="<span class='bad'>no system called "+esc(home)+"</span>"; return; }
    $("rstatus").innerHTML=["esi "+(kills?"ok":"<span class='bad'>down</span>"),
      "our feed "+(ours?ours.length+" kills 24h":"<span class='bad'>down</span>")].join(" &middot; ");
    var dist=bfs(S,hi,maxJ);
    var kBy={}; (kills||[]).forEach(function(k){ kBy[k.system_id]=k; });
    var oBy={}; (ours||[]).forEach(function(k){ oBy[k.sysId]=(oBy[k.sysId]||0)+1; });
    var rows=[];
    Object.keys(dist).forEach(function(idx){
      var row=S.d.sys[idx], id=row[1], sec=row[2], j=dist[idx];
      if(rsec==="hs"&&sec<0.45) return;
      if(rsec==="ls"&&(sec>=0.45||sec<=0)) return;
      if(rsec==="ns"&&sec>0) return;
      var k=kBy[id]||{}, ship=k.ship_kills||0, pod=k.pod_kills||0, o=oBy[id]||0;
      var score=ship+pod*2+o*1.5;      /* npc_kills never counts: rats dying is not a fight */
      if(score<=0) return;
      rows.push({n:row[0],id:id,sec:sec,j:j,ship:ship,pod:pod,ours:o,score:score,reg:S.d.regions[row[3]]});
    });
    rows.sort(function(a,b){ return b.score-a.score||a.j-b.j; });
    if(!rows.length){
      $("rout").innerHTML="<div class='verdict'><span class='vl'>WHERE IT IS HAPPENING</span><div class='vt'>Nothing is dying within "
        +maxJ+" jumps. Widen it, or go make some.</div></div>";
      return;
    }
    var top=rows[0];
    var h="<div class='verdict'><span class='vl'>WHERE IT IS HAPPENING</span><div class='vt'>"
      +esc(top.n)+", "+top.j+" jump"+(top.j===1?"":"s")+" out. "+top.ship+" ship"+(top.ship===1?"":"s")+" dead this hour"
      +(top.ours?", and "+top.ours+" of the last 24 hours were on our feed":"")+".</div></div>";
    h+="<div class='sect'><table class='dt'><thead><tr><th>SYSTEM</th><th>SEC</th><th>REGION</th>"
      +"<th class='num'>JUMPS</th><th class='num'>SHIPS/HR</th><th class='num'>PODS</th><th class='num'>OUR 24H</th><th></th></tr></thead><tbody>";
    rows.slice(0,20).forEach(function(r){
      var cls=r.sec>=0.45?"hs":r.sec>0?"ls":"ns";
      h+="<tr><td>"+esc(r.n)+"</td><td class='band b-"+(cls==="hs"?"none":cls==="ls"?"ghost":"killer")+"'>"+r.sec.toFixed(1)+"</td>"
        +"<td>"+esc(r.reg||"")+"</td><td class='num'>"+r.j+"</td><td class='num'>"+r.ship+"</td>"
        +"<td class='num'>"+r.pod+"</td><td class='num'>"+(r.ours||"")+"</td>"
        +"<td><a href='/cartel/?from="+encodeURIComponent($("rhome").value||HOME_N)+"&to="+encodeURIComponent(r.n)+"'>check the road</a></td></tr>";
    });
    h+="</tbody></table></div>";
    $("rout").innerHTML=h;
  }).catch(function(e){ if(g===gen) $("rstatus").innerHTML="<span class='bad'>"+esc(String(e))+"</span>"; });
}
$("rgo").addEventListener("click",findFight);

/* ================= WARZONE =================
   Faction warfare is the one place in the game that publishes where the fight is
   supposed to be. ESI gives owner, occupier and victory points per frontline
   system; a system whose OCCUPIER is not its OWNER is mid flip, which is the
   loudest content signal on the map. Live kills come from the same universe feed
   ROAM uses. The Amarr front runs through Devoid, a few jumps off our road. */
var FACT={500001:"Caldari State",500002:"Minmatar Republic",500003:"Amarr Empire",
          500004:"Gallente Federation",500010:"Guristas Pirates",500011:"Angel Cartel"};
var wfront="500003:500002";
$("wfront").addEventListener("click",function(e){
  var b=e.target.closest?e.target.closest("button[data-w]"):null; if(!b) return;
  wfront=b.getAttribute("data-w");
  var bs=$("wfront").querySelectorAll("button");
  for(var i=0;i<bs.length;i++) bs[i].classList.toggle("on",bs[i]===b);
});
function readFront(){
  var g=++gen; parked.war=false;
  var pair=wfront.split(":").map(Number), A=pair[0], B=pair[1];
  var home=($("whome").value||HOME_N).trim().toLowerCase();
  $("wstatus").textContent="reading the front...";
  Promise.all([
    fetch(ESI+"/fw/systems/?datasource=tranquility").then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }),
    fetch(ESI+"/fw/stats/?datasource=tranquility").then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }),
    fetch(ESI+"/universe/system_kills/?datasource=tranquility").then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }),
    loadSys()
  ]).then(function(res){
    if(g!==gen) return;
    var sys=res[0], stats=res[1], kills=res[2], S=res[3];
    if(!sys){ $("wstatus").innerHTML="<span class='bad'>ESI faction warfare feed is down</span>"; return; }
    $("wstatus").innerHTML=["fw "+sys.length+" systems","kills "+(kills?"ok":"<span class='bad'>down</span>"),
      "stats "+(stats?"ok":"<span class='bad'>down</span>")].join(" &middot; ");
    var kBy={}; (kills||[]).forEach(function(k){ kBy[k.system_id]=k; });
    var hi=S.byName[home], dist=hi!=null?bfs(S,hi,15):{};
    /* the front we asked for: either a faction pair, or one pirate militia everywhere it sits */
    var rows=sys.filter(function(s){
      if(B) return [A,B].indexOf(s.owner_faction_id)>=0||[A,B].indexOf(s.occupier_faction_id)>=0;
      return s.owner_faction_id===A||s.occupier_faction_id===A;
    }).map(function(s){
      var ix=S.byId[s.solar_system_id], row=ix!=null?S.d.sys[ix]:null;
      var k=kBy[s.solar_system_id]||{};
      var live=(k.ship_kills||0)+(k.pod_kills||0)*2;
      var pct=s.victory_points_threshold?Math.round((s.victory_points/s.victory_points_threshold)*100):0;
      var flip=s.occupier_faction_id&&s.owner_faction_id!==s.occupier_faction_id;
      return {id:s.solar_system_id,n:row?row[0]:("system "+s.solar_system_id),
              sec:row?row[2]:0,reg:row?S.d.regions[row[3]]:"",
              j:(ix!=null&&dist[ix]!=null)?dist[ix]:null,
              own:s.owner_faction_id,occ:s.occupier_faction_id,flip:flip,
              pct:pct,contested:s.contested,live:live,ship:k.ship_kills||0};
    });
    /* danger to you = what is actually dying, then whether it is changing hands,
       then how close it is. A quiet uncontested system ranks last, correctly. */
    rows.forEach(function(r){
      r.score=r.live*10+(r.flip?40:0)+(r.contested==="contested"?15:0)+r.pct*0.2
             +(r.j!=null?Math.max(0,20-r.j*2):0);
    });
    rows.sort(function(a,b){ return b.score-a.score; });
    var hot=rows.filter(function(r){ return r.live>0; }).length;
    var flips=rows.filter(function(r){ return r.flip; }).length;
    var top=rows[0];
    var h="<div class='verdict'><span class='vl'>THE FRONT</span><div class='vt'>";
    if(!rows.length) h+="Nothing on that front right now.";
    else if(top.live>0) h+=esc(top.n)+" is the loudest system on the front, "+top.ship+" ship"+(top.ship===1?"":"s")+" dead this hour"
      +(top.j!=null?", "+top.j+" jumps out":"")+".";
    else if(flips) h+=flips+" system"+(flips===1?" is":"s are")+" changing hands, but nothing is dying this hour. The fight is elsewhere.";
    else h+="The front is quiet. "+rows.length+" systems, nothing burning.";
    h+="</div></div>";
    h+="<div class='flags'><span class='flag mut'>"+rows.length+" systems</span>"
      +(hot?"<span class='flag'>"+hot+" hot</span>":"")
      +(flips?"<span class='flag amb'>"+flips+" mid flip</span>":"");
    if(stats){
      [A,B].forEach(function(f){ if(!f) return;
        var st=stats.filter(function(x){ return x.faction_id===f; })[0];
        if(st) h+="<span class='flag mut'>"+esc(FACT[f]||f)+": "+st.systems_controlled+" systems, "+(st.kills&&st.kills.yesterday||0)+" kills yesterday</span>";
      });
    }
    h+="</div>";
    h+="<div class='sect'><table class='dt'><thead><tr><th>SYSTEM</th><th>SEC</th><th>REGION</th>"
      +"<th>HELD BY</th><th>CONTESTED</th><th class='num'>KILLS/HR</th><th class='num'>JUMPS</th><th></th></tr></thead><tbody>";
    rows.slice(0,40).forEach(function(r){
      var cls=r.sec>=0.45?"none":r.sec>0?"ghost":"killer";
      h+="<tr"+(r.flip?" class='filed'":"")+"><td><a href='/briefing/?t=sys&id="+r.id+"' title='open the system file'>"+esc(r.n)+"</a></td>"
        +"<td><span class='band b-"+cls+"'>"+r.sec.toFixed(1)+"</span></td>"
        +"<td>"+esc(r.reg||"")+"</td>"
        +"<td>"+esc((FACT[r.occ]||"").replace(/ (Empire|Republic|State|Federation|Pirates|Cartel)$/,""))
          +(r.flip?" <span class='band b-ghost'>flipping</span>":"")+"</td>"
        +"<td>"+(r.contested==="contested"?r.pct+"%":"<span style='color:var(--muted)'>quiet</span>")+"</td>"
        +"<td class='num'>"+(r.ship||"")+"</td>"
        +"<td class='num'>"+(r.j!=null?r.j:"")+"</td>"
        +"<td><a href='/cartel/?from="+encodeURIComponent($("whome").value||HOME_N)+"&to="+encodeURIComponent(r.n)+"'>road</a></td></tr>";
    });
    h+="</tbody></table></div>";
    $("wout").innerHTML=h;
  }).catch(function(e){ if(g===gen) $("wstatus").innerHTML="<span class='bad'>"+esc(String(e))+"</span>"; });
}
$("wgo").addEventListener("click",readFront);

/* ================= CORRIDOR =================
   The Watchtower's core read, computed live instead of baked: home to the pocket,
   hop by hop, with the standing orders carried across from notes.yml because that
   doctrine is hand written and worth more than any number on the page. The tier
   rules are the Cartel Map's, unchanged: NPC kills never raise a tier (rats dying
   is not a fight) and a chokepoint never reads better than SKETCHY while anything
   is dying there. The habits scrubber and the geographic map stay on /cartel/,
   which keeps recording the ring history this cannot rebuild. */
/* EMPTY IN THE PUBLIC BUNDLE (2026-08-07). This array used to carry the corridor in
   travel order with the chokepoints marked, the pocket named, and our abort criteria
   written out. This file is served by Pages to anybody who requests the URL, so a
   page gate never protected it: it was one curl from being a complete target package.
   The corridor now arrives from the member gated /api/roads at mount. Empty means the
   corridor lens simply has no hops to draw, which is the correct failure direction. */
/* Filled from /api/roads with ROAD. Empty in the file because this bundle is
   public and the site names the home system nowhere else. */
var ROAD=[], HOME_N="", HOME_REG="";
function tierOf(hop){
  var k=hop.ship||0, p=hop.pod||0;
  if(hop.choke&&(k+p)>0) return k+p>=4||p>=2?["NOPE","b-killer"]:["SKETCHY","b-ghost"];
  if(k+p>=5) return ["NOPE","b-killer"];
  if(k+p>=2) return ["HOT","b-fighter"];
  if(k+p===1) return ["SKETCHY","b-ghost"];
  if(hop.seen===false) return ["NO EYES","b-unread"];
  return ["CALM","b-none"];
}
function readRoad(){
  var g=++gen; parked.road=false;
  $("dstatus").textContent="reading the road...";
  Promise.all([
    fetch(ESI+"/universe/system_kills/?datasource=tranquility").then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }),
    fetch(TRIPWIRE+"/region").then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }),
    loadSys()
  ]).then(function(res){
    if(g!==gen) return;
    var kills=res[0], ours=res[1], S=res[2];
    $("dstatus").innerHTML=["esi "+(kills?"ok":"<span class='bad'>down</span>"),
      "our feed "+(ours?ours.length+" kills 24h":"<span class='bad'>down</span>")].join(" &middot; ");
    var kBy={}; (kills||[]).forEach(function(k){ kBy[k.system_id]=k; });
    var oBy={}; (ours||[]).forEach(function(k){ oBy[k.sysId]=(oBy[k.sysId]||0)+1; });
    var hops=ROAD.map(function(r){
      var k=kBy[r.id], ix=S.byId?S.byId[r.id]:null, row=(ix!=null&&S.d)?S.d.sys[ix]:null;
      return {id:r.id,n:r.n,note:r.note,choke:r.choke,home:r.home,pocket:r.pocket,
              sec:row?row[2]:null,ix:ix,
              ship:k?(k.ship_kills||0):0,pod:k?(k.pod_kills||0):0,
              seen:kills?true:false, ours24:oBy[r.id]||0};
    });
    /* nearest highsec: the answer to "where do I run", computed off the same graph */
    hops.forEach(function(h){
      h.exit=null;
      if(h.ix==null||!S.d||h.sec>=0.45) return;
      var seen={},q=[[h.ix,0]]; seen[h.ix]=1;
      while(q.length){
        var cur=q.shift(); if(cur[1]>6) break;
        var nb=S.d.sys[cur[0]][4]||[];
        for(var i=0;i<nb.length;i++){
          if(seen[nb[i]]) continue; seen[nb[i]]=1;
          var row=S.d.sys[nb[i]];
          if(row[2]>=0.45){ h.exit={n:row[0],j:cur[1]+1}; q.length=0; break; }
          q.push([nb[i],cur[1]+1]);
        }
      }
    });
    /* the sentence that decides whether the fleet undocks */
    var worst=null,clear=0;
    for(var i=0;i<hops.length;i++){
      var t=tierOf(hops[i])[0];
      if(t==="NOPE"||t==="HOT"){ worst=hops[i]; break; }
      clear++;
    }
    var h="<div class='verdict'><span class='vl'>THE ROAD</span><div class='vt'>";
    /* NO FOOTPRINT IS NOT A CLEAR ROAD. The corridor now arrives from /api/roads,
       so hops can legitimately be empty (fetch failed, or the session cannot read
       it), and every branch below was written assuming hops existed: zero hops fell
       through to "Clear road, all 0 hops. Go make some ore." with a green flag,
       which is a positive undock call computed from nothing. Silence is never
       peace, and it is never peace hardest when we are the ones who went quiet. */
    if(!hops.length){
      h+="<b style='color:var(--gs)'>No road loaded.</b> The corridor could not be read, "
        +"so this is not an all clear, it is no answer. Reload, and if it stays empty tell an officer.";
      h+="</div></div>";
      $("dout").innerHTML=h;
      return;
    }
    if(!worst) h+="Clear road, all "+hops.length+" hops. Go make some ore.";
    else h+="Clear for "+clear+" hop"+(clear===1?"":"s")+", then <b style='color:var(--gs)'>"+esc(worst.n)+"</b> is "
      +tierOf(worst)[0]+". "+(worst.choke?"That one is a chokepoint, so it is the whole run.":"Route around it or wait it out.");
    h+="</div></div>";
    var hot=hops.filter(function(x){ return x.ship+x.pod>0; }).length;
    h+="<div class='flags'><span class='flag mut'>"+hops.length+" hops</span>"
      +(hot?"<span class='flag'>"+hot+" with kills this hour</span>":"<span class='flag ok'>nothing dying on the road</span>")
      +"<span class='flag mut'>"+hops.reduce(function(a,x){ return a+x.ours24; },0)+" on our feed 24h</span></div>";
    h+="<div class='sect'><table class='dt'><thead><tr><th></th><th>SYSTEM</th><th>SEC</th><th>READ</th>"
      +"<th class='num'>SHIPS</th><th class='num'>PODS</th><th class='num'>OUR 24H</th><th>NEAREST HIGHSEC</th></tr></thead><tbody>";
    hops.forEach(function(x,i){
      var t=tierOf(x);
      h+="<tr"+(x.choke?" class='filed'":"")+"><td class='num' style='color:var(--muted)'>"+(i+1)+"</td>"
        +"<td><a href='/briefing/?t=sys&id="+x.id+"' title='open the system file'>"+esc(x.n)+"</a>"
        +(x.home?" <span class='band b-ours'>HOME</span>":"")
        +(x.pocket?" <span class='band b-ghost'>POCKET</span>":"")
        +(x.choke?" <span class='band b-killer'>CHOKE</span>":"")+"</td>"
        +"<td>"+(x.sec!=null?x.sec.toFixed(1):"")+"</td>"
        +"<td><span class='band "+t[1]+"'>"+t[0]+"</span></td>"
        +"<td class='num'>"+(x.ship||"")+"</td><td class='num'>"+(x.pod||"")+"</td>"
        +"<td class='num'>"+(x.ours24||"")+"</td>"
        +"<td>"+(x.exit?esc(x.exit.n)+" "+x.exit.j+"j":(x.sec>=0.45?"<span style='color:var(--ore)'>you are in it</span>":""))+"</td></tr>";
      h+="<tr><td></td><td colspan='7' style='padding-top:0;border-top:0;color:var(--muted);font-size:11.5px'>"+esc(x.note)+"</td></tr>";
    });
    h+="</tbody></table></div>";
    h+="<div class='hint' style='margin-top:14px'>The habits view, the geographic map and the route checker "
      +"live on the <a href='/cartel/' style='color:var(--gs)'>Watchtower</a>, which is also what records the "
      +"ring history this reads against.</div>";
    $("dout").innerHTML=h;
  }).catch(function(e){ if(g===gen) $("dstatus").innerHTML="<span class='bad'>"+esc(String(e))+"</span>"; });
}
$("dgo").addEventListener("click",readRoad);

/* deep link ?m= */
(function(){ var m=new URLSearchParams(location.search).get("m");
  if(m&&["local","grid","roam","war","road","rocks","log"].indexOf(m)>=0&&m!=="local") setMode(m); })();

/* ==== LENS: ROCKS ==== belts are baked because they never move; the danger beside
   them is live. The mining half of the same map the fighters read. */
var BELTS=null;
function loadBelts(){
  if(BELTS) return Promise.resolve(BELTS);
  return fetch("/lowsec/belts.json").then(function(r){ return r.ok?r.json():null; })
    .then(function(d){ BELTS=d||{regions:{}}; return BELTS; })
    .catch(function(){ BELTS={regions:{}}; return BELTS; });
}
function findRocks(){
  var g=++gen; parked.rocks=false;
  var reg=($("kreg").value||HOME_REG).trim(), home=($("khome").value||HOME_N).trim().toLowerCase();
  $("kstatus").textContent="reading belts...";
  Promise.all([loadBelts(),loadSys(),
    fetch(ESI+"/universe/system_kills/?datasource=tranquility").then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; })
  ]).then(function(res){
    if(g!==gen) return;
    var B=res[0],S=res[1],kills=res[2];
    var dl=$("kregs");
    if(dl&&!dl.childNodes.length) dl.innerHTML=Object.keys(B.regions||{}).sort().map(function(r){ return "<option value='"+esc(r)+"'>"; }).join("");
    var rows=(B.regions||{})[reg];
    if(!rows){ $("kstatus").innerHTML="<span class='bad'>no region called "+esc(reg)+"</span>"; return; }
    $("kstatus").innerHTML=["belts ok","kills "+(kills?"ok":"<span class='bad'>down</span>")].join(" &middot; ");
    var kBy={}; (kills||[]).forEach(function(k){ kBy[k.system_id]=k; });
    var hi=S.byName?S.byName[home]:null, dist=(hi!=null)?bfs(S,hi,15):{};
    var out=rows.filter(function(r){ return (r.b||0)>0; }).map(function(r){
      var ix=S.byName?S.byName[String(r.n).toLowerCase()]:null;
      var id=(ix!=null)?S.d.sys[ix][1]:null, k=id?kBy[id]:null;
      return {n:r.n,sec:r.s,belts:r.b,moons:r.m,st:r.st,id:id,
              j:(ix!=null&&dist[ix]!=null)?dist[ix]:null,
              kills:k?((k.ship_kills||0)+(k.pod_kills||0)):0};
    });
    out.sort(function(a,b){ return (a.kills-b.kills)||(b.belts-a.belts)||((a.j==null?99:a.j)-(b.j==null?99:b.j)); });
    var quiet=out.filter(function(r){ return !r.kills; }).length;
    var h="<div class='verdict'><span class='vl'>THE ROCKS</span><div class='vt'>"
      +esc(reg)+": "+out.length+" systems with belts, "+quiet+" with nothing dying in them this hour."
      +(out[0]?" Most rock in the quiet is <b style='color:var(--gs)'>"+esc(out[0].n)+"</b>"
        +(out[0].j!=null?", "+out[0].j+" jumps out":"")+".":"")+"</div></div>";
    h+="<div class='sect'><table class='dt'><thead><tr><th>SYSTEM</th><th>SEC</th><th class='num'>BELTS</th>"
      +"<th class='num'>MOONS</th><th class='num'>STATIONS</th><th class='num'>KILLS/HR</th><th class='num'>JUMPS</th></tr></thead><tbody>";
    out.slice(0,40).forEach(function(r){
      var cls=r.sec>=0.45?"none":r.sec>0?"ghost":"killer";
      h+="<tr><td>"+(r.id?"<a href='/briefing/?t=sys&id="+r.id+"'>"+esc(r.n)+"</a>":esc(r.n))+"</td>"
        +"<td><span class='band b-"+cls+"'>"+(r.sec!=null?Number(r.sec).toFixed(1):"")+"</span></td>"
        +"<td class='num'>"+r.belts+"</td><td class='num'>"+(r.moons||"")+"</td><td class='num'>"+(r.st||"")+"</td>"
        +"<td class='num'"+(r.kills?" style='color:var(--gs)'":"")+">"+(r.kills||"")+"</td>"
        +"<td class='num'>"+(r.j!=null?r.j:"")+"</td></tr>";
    });
    h+="</tbody></table></div>";
    $("kout").innerHTML=h;
  }).catch(function(e){ if(g===gen) $("kstatus").innerHTML="<span class='bad'>"+esc(String(e))+"</span>"; });
}
$("kgo").addEventListener("click",findRocks);
/* ==== END LENS: ROCKS ==== */

/* ==== LENS: OUR LOG ==== read live off zkill instead of the encrypted bake, so it is
   never stale and needs no generator. The losses are the half that teaches. */
function readLog(){
  var g=++gen; parked.log=false;
  $("ostatus").textContent="reading...";
  Promise.all([
    zk("/kills/allianceID/"+OUR_ALLI+"/").catch(function(){ return []; }),
    zk("/losses/allianceID/"+OUR_ALLI+"/").catch(function(){ return []; })
  ]).then(function(res){
    if(g!==gen) return;
    var k=(res[0]||[]).filter(Boolean), l=(res[1]||[]).filter(Boolean);
    $("ostatus").innerHTML="kills "+k.length+" &middot; losses "+l.length;
    var rows=[];
    k.forEach(function(m){ rows.push({k:1,m:m}); });
    l.forEach(function(m){ rows.push({k:0,m:m}); });
    rows.sort(function(a,b){ return a.m.killmail_time<b.m.killmail_time?1:-1; });
    var ids=[];
    rows.slice(0,40).forEach(function(r){
      var v=r.m.victim||{}; ids.push(v.ship_type_id); if(v.character_id) ids.push(v.character_id);
      ids.push(r.m.solar_system_id);
    });
    return resolveNames(ids).then(function(map){
      var iskLost=l.reduce(function(a,m){ return a+((m.zkb||{}).totalValue||0); },0);
      var iskKilled=k.reduce(function(a,m){ return a+((m.zkb||{}).totalValue||0); },0);
      var h="<div class='verdict'><span class='vl'>OUR LOG</span><div class='vt'>"
        +k.length+" killed, "+l.length+" lost on the board right now. "
        +(iskLost>iskKilled?"We are paying more than we are taking.":"We are taking more than we are paying.")
        +"</div></div>";
      h+="<div class='flags'><span class='flag ok'>"+isk(iskKilled)+" destroyed</span>"
        +"<span class='flag'>"+isk(iskLost)+" lost</span></div>";
      h+="<div class='sect'><table class='dt'><thead><tr><th></th><th>SHIP</th><th>PILOT</th><th>SYSTEM</th><th class='num'>VALUE</th><th>WHEN</th><th></th></tr></thead><tbody>";
      rows.slice(0,40).forEach(function(r){
        var m=r.m,v=m.victim||{};
        h+="<tr><td><span class='band "+(r.k?"b-ours'>KILL":"b-killer'>LOSS")+"</span></td>"
          +"<td>"+esc(nameOf(map,v.ship_type_id))+"</td>"
          +"<td>"+(v.character_id?esc(nameOf(map,v.character_id)):"<span style='color:var(--muted)'>structure</span>")+"</td>"
          +"<td><a href='/briefing/?t=sys&id="+m.solar_system_id+"'>"+esc(nameOf(map,m.solar_system_id))+"</a></td>"
          +"<td class='num'>"+isk((m.zkb||{}).totalValue)+"</td><td>"+ago(m.killmail_time)+"</td>"
          +"<td><a href='https://zkillboard.com/kill/"+m.killmail_id+"/' target='_blank' rel='noopener'>mail</a></td></tr>";
      });
      h+="</tbody></table></div>";
      $("oout").innerHTML=h;
    });
  }).catch(function(e){ if(g===gen) $("ostatus").innerHTML="<span class='bad'>"+esc(String(e))+"</span>"; });
}
$("ogo").addEventListener("click",readLog);
/* ==== END LENS: OUR LOG ==== */

}};
})();
