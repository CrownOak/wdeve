/* SEAL A PAGE.
   The accord page (wdeve/accord/) was sealed by hand and the generator was never
   kept, so the next sealed page had to rediscover the contract. This is that
   generator, saved this time.

   Contract, identical to accord/: PBKDF2(SHA-256, 250k) over the passphrase to an
   AES-GCM key, content encrypted as one blob. The ciphertext is the only copy of
   the body in the file. Nothing readable ships without the passphrase, so this is
   a real gate and not a hidden div.

   usage: node seal-page.mjs <body.html> <passphrase> <out.html> "<title>"
*/
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";

const [, , bodyPath, pass, outPath, titleArg] = process.argv;
if (!bodyPath || !pass || !outPath) {
  console.error('usage: node seal-page.mjs <body.html> <passphrase> <out.html> "<title>"');
  process.exit(1);
}
const TITLE = titleArg || "●●● DISPATCH";
const plain = readFileSync(bodyPath, "utf8");

const ITER = 250000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const enc = new TextEncoder();

const baseKey = await crypto.subtle.importKey("raw", enc.encode(pass), { name: "PBKDF2" }, false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
  baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain)));
const b64 = (u8) => Buffer.from(u8).toString("base64");

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive, noimageindex">
<meta name="referrer" content="no-referrer">
<title>${TITLE}</title>
<link rel="icon" href="/favicon-32.png">
<link rel="stylesheet" href="/common.css?v=7">
<style>
body{ background:var(--black); }
body::before{ content:""; position:fixed; inset:0; pointer-events:none; z-index:0;
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(70,255,94,.05), transparent 70%),
    linear-gradient(rgba(150,168,158,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(150,168,158,.03) 1px, transparent 1px);
  background-size:auto, 46px 46px, 46px 46px; background-position:center top; }
body::after{ content:""; position:fixed; inset:0; pointer-events:none; z-index:1;
  background:repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0 1px, transparent 1px 3px); opacity:.03; }
.sysbar{ position:sticky; top:0; z-index:20; display:flex; align-items:center; gap:12px;
  height:42px; padding:0 20px; background:rgba(7,8,9,.9); backdrop-filter:blur(8px);
  border-bottom:1px solid var(--line); font-family:var(--mono); font-size:11px;
  letter-spacing:.12em; text-transform:uppercase; color:var(--muted); }
.sysbar .lk{ color:var(--ore); }
.sysbar .sb-r{ margin-left:auto; color:var(--silver-dim); }
.sysbar .dot{ width:6px; height:6px; border-radius:50%; background:var(--ore);
  box-shadow:0 0 7px rgba(70,255,94,.6); display:inline-block; vertical-align:middle; margin-right:6px; }
.gate{ min-height:calc(100vh - 42px); display:flex; align-items:center; justify-content:center; padding:24px; position:relative; z-index:5; }
.gbox{ width:100%; max-width:430px; border:1px solid var(--line); background:rgba(12,14,15,.92); padding:34px 30px; }
.gk{ font-family:var(--mono); font-size:10px; letter-spacing:.22em; color:var(--muted); text-transform:uppercase; }
.gt{ font-size:23px; color:var(--silver); margin:12px 0 6px; letter-spacing:.02em; }
.gs{ font-size:13px; color:var(--muted); line-height:1.65; margin-bottom:22px; }
#pw{ width:100%; background:#0a0c0d; border:1px solid var(--line); color:var(--silver);
  font-family:var(--mono); font-size:14px; padding:11px 13px; letter-spacing:.08em; }
#pw:focus{ outline:none; border-color:var(--ore); }
.gbtn{ width:100%; margin-top:11px; background:transparent; border:1px solid var(--ore); color:var(--ore);
  font-family:var(--mono); font-size:11.5px; letter-spacing:.18em; text-transform:uppercase;
  padding:11px; cursor:pointer; transition:background .15s; }
.gbtn:hover{ background:rgba(70,255,94,.09); }
.gerr{ font-family:var(--mono); font-size:11px; color:var(--danger,#ff5c5c); margin-top:11px; min-height:15px; letter-spacing:.05em; }
#doc{ display:none; position:relative; z-index:5; }
</style>
</head>
<body>
<div class="sysbar"><span class="dot"></span><span class="lk">GSS</span><span>SEALED DISPATCH</span><span class="sb-r" id="sbr">LOCKED</span></div>
<div class="gate" id="gate">
  <div class="gbox">
    <div class="gk">Goblin State Security</div>
    <div class="gt">Sealed</div>
    <div class="gs">This dispatch is encrypted. The passphrase decrypts it in your browser, so there is nothing to read here without it.</div>
    <input id="pw" type="password" placeholder="passphrase" autocomplete="off" autofocus>
    <button class="gbtn" id="go">Unseal</button>
    <div class="gerr" id="err"></div>
  </div>
</div>
<div id="doc"></div>
<script>
var BLOB={ s:"${b64(salt)}", iv:"${b64(iv)}", it:${ITER}, ct:"${b64(ct)}" };
function b64ToBytes(b){ var s=atob(b), u=new Uint8Array(s.length); for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i); return u; }
async function unseal(pw){
  var enc=new TextEncoder();
  var baseKey=await crypto.subtle.importKey('raw',enc.encode(pw),{name:'PBKDF2'},false,['deriveKey']);
  var key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64ToBytes(BLOB.s),iterations:BLOB.it,hash:'SHA-256'},
    baseKey,{name:'AES-GCM',length:256},false,['decrypt']);
  var pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64ToBytes(BLOB.iv)},key,b64ToBytes(BLOB.ct));
  return new TextDecoder().decode(pt);
}
async function go(){
  var pw=document.getElementById('pw').value.trim(), err=document.getElementById('err');
  if(!pw) return;
  err.textContent='';
  try{
    var html=await unseal(pw);
    document.getElementById('gate').style.display='none';
    var d=document.getElementById('doc'); d.innerHTML=html; d.style.display='block';
    document.getElementById('sbr').textContent='OPEN';
    try{ sessionStorage.setItem('gsskey',pw); }catch(e){}
  }catch(e){ err.textContent='wrong passphrase'; }
}
document.getElementById('go').addEventListener('click',go);
document.getElementById('pw').addEventListener('keydown',function(e){ if(e.key==='Enter') go(); });
/* auto unseal within the same session so a reload does not re-ask */
(function(){ try{ var k=sessionStorage.getItem('gsskey'); if(k){ document.getElementById('pw').value=k; go(); } }catch(e){} })();
</script>
</body>
</html>
`;
writeFileSync(outPath, page, "utf8");
console.log(`sealed ${plain.length} chars -> ${outPath} (${page.length} bytes, ${ITER} iters)`);
