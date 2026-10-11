import { Peer } from "peerjs";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const CLUBS = [
  {name:"Real Madrid",short:"ريال مدريد",mark:"RM",color:"#efe7c9"},
  {name:"Barcelona",short:"برشلونة",mark:"FCB",color:"#b93465"},
  {name:"Man City",short:"مان سيتي",mark:"MC",color:"#78d5f8"},
  {name:"Liverpool",short:"ليفربول",mark:"LFC",color:"#eb5261"},
  {name:"Arsenal",short:"أرسنال",mark:"AFC",color:"#e74353"},
  {name:"Man United",short:"مان يونايتد",mark:"MU",color:"#f34f48"},
  {name:"Bayern",short:"بايرن",mark:"FCB",color:"#e83b52"},
  {name:"Dortmund",short:"دورتموند",mark:"BVB",color:"#f6dd4c"},
  {name:"PSG",short:"باريس",mark:"PSG",color:"#6d9cff"},
  {name:"Juventus",short:"يوفنتوس",mark:"JUV",color:"#e2e8f0"}
];
const W=1000,H=560,FLOOR=487,GOAL_TOP=337,GOAL_BOTTOM=487;
let mode="ai",clubA=0,clubB=1,powerChoice="rocket";
let peer=null,conn=null,isHost=false,onlineConnected=false;
let world=null,raf=0,lastFrame=0,stateSend=0,flashTimeout=0;
let held={1:{left:false,right:false},2:{left:false,right:false}};
let paused=false,finished=false,started=false;

function setStatus(msg,badge){$("#netStatus").textContent=msg;if(badge)$("#netBadge").textContent=badge;}
function setSelectedMode(next){mode=next;$$(".mode-card").forEach(b=>b.classList.toggle("chosen",b.dataset.mode===mode));$("#onlinePanel").hidden=mode!=="online";$("#playBtn").querySelector("span").textContent=mode==="online"?"ابدأ المواجهة":"ابدأ المباراة";$("#singleControls").hidden=mode==="local";$("#dualControls").hidden=mode!=="local";}
$$(".mode-card").forEach(b=>b.addEventListener("click",()=>setSelectedMode(b.dataset.mode)));
function renderClubs(){$("#teamGrid").innerHTML=CLUBS.map((c,i)=>'<button class="club-card '+(i===clubA?'active':'')+'" data-club="'+i+'" style="--club:'+c.color+'"><span class="club-mark">'+c.mark+'</span><span>'+c.short+'</span></button>').join("");$$(".club-card").forEach(b=>b.addEventListener("click",()=>{clubA=Number(b.dataset.club);clubB=(clubA+1)%CLUBS.length;renderClubs();}));}
renderClubs();
$("#powerSelect").addEventListener("change",e=>powerChoice=e.target.value);

function peerOptions(){return {host:"0.peerjs.com",port:443,secure:true,debug:1,config:{iceServers:[{urls:"stun:stun.l.google.com:19302"}]}};}
function resetPeer(){try{if(conn)conn.close();}catch{}try{if(peer)peer.destroy();}catch{}peer=null;conn=null;onlineConnected=false;isHost=false;$("#playBtn").disabled=false;}
function setupConnection(c,hostSide){
  conn=c;
  conn.on("open",()=>{
    onlineConnected=true;$("#playBtn").disabled=false;
    setStatus("تم الاتصال! المضيف يبدأ المباراة من زر ابدأ.","متصل ●");
    if(hostSide){conn.send({type:"hello",version:2});}
    else{conn.send({type:"hello",version:2});}
  });
  conn.on("data",data=>{
    if(!data||typeof data!=="object")return;
    if(data.type==="hello"){setStatus(isHost?"اتصل صديقك. ابدأ المباراة عند الاستعداد.":"اتصال مباشر ناجح. اضغط ابدأ لطلب بدء المباراة.","متصل ●");return;}
    if(data.type==="start_request"&&isHost){startOnlineMatch();return;}
    if(data.type==="start"&&!isHost){if(data.clubs){clubA=data.clubs[0];clubB=data.clubs[1];}startGame(true);return;}
    if(data.type==="input"&&isHost){applyRemoteInput(data);return;}
    if(data.type==="state"&&!isHost){applySnapshot(data.world);return;}
    if(data.type==="pause"&&!isHost){paused=!!data.value;$("#pauseCover").hidden=!paused;$("#pauseBtn").textContent=paused?"▶":"Ⅱ";return;}
    if(data.type==="end"&&!isHost){showFinish(data.world);return;}
    if(data.type==="restart"&&!isHost){startGame(true);return;}
  });
  conn.on("close",()=>{onlineConnected=false;setStatus("انقطع اتصال الخصم. ارجع للقائمة أو حاول الاتصال مجددًا.","غير متصل");if(mode==="online"&&!$("#gameScreen").hidden)showFlash("انقطع الاتصال");});
  conn.on("error",e=>setStatus("تعذر الاتصال: "+(e?.type||"تحقق من الكود والإنترنت"),"مشكلة اتصال"));
}
function createRoomId(){return Math.random().toString(36).slice(2,8).toUpperCase();}
$("#createRoom").addEventListener("click",()=>{
  resetPeer();mode="online";isHost=true;const code=createRoomId();$("#roomCode").value=code;setStatus("جارٍ تجهيز الغرفة…","يتصل");
  try{
    peer=new Peer(code,peerOptions());
    peer.on("open",id=>{isHost=true;$("#roomCode").value=id;setStatus("أرسل هذا الكود لصديقك وانتظر اتصاله.","بانتظار صديقك");});
    peer.on("connection",c=>{if(conn&&conn.open){c.close();return;}setupConnection(c,true);});
    peer.on("error",e=>{setStatus("فشل إنشاء الغرفة ("+(e?.type||"network")+"). اضغط إنشاء غرفة من جديد.","فشل الاتصال");});
  }catch(e){setStatus("تعذر إنشاء الغرفة. تحقق من الإنترنت.","فشل الاتصال");}
});
$("#joinRoom").addEventListener("click",()=>{
  const code=$("#roomCode").value.trim().toUpperCase();
  if(code.length<4){setStatus("اكتب كود الغرفة أولًا.","أدخل الكود");return;}
  resetPeer();mode="online";isHost=false;setStatus("جارٍ الاتصال بالمضيف…","يتصل");
  try{
    peer=new Peer(undefined,peerOptions());
    peer.on("open",()=>{const c=peer.connect(code,{reliable:true,serialization:"json"});setupConnection(c,false);});
    peer.on("error",e=>setStatus("تعذر الاتصال ("+(e?.type||"network")+"). تأكد من الكود وأن المضيف ينتظر.","فشل الاتصال"));
  }catch(e){setStatus("تعذر الاتصال. تحقق من الإنترنت والكود.","فشل الاتصال");}
});
$("#copyCode").addEventListener("click",async()=>{
  const code=$("#roomCode").value.trim();if(!code){setStatus("أنشئ غرفة أولًا ليظهر الكود.","لا يوجد كود");return;}
  try{await navigator.clipboard.writeText(code);setStatus("تم نسخ كود الغرفة: "+code,"تم النسخ");}
  catch{ $("#roomCode").select();setStatus("حدد الكود وانسخه يدويًا.","الكود جاهز");}
});

function newPlayer(id,x,color,power){return {id,x,y:FLOOR,vx:0,vy:0,dir:id===1?1:-1,color,power,ground:true,frozen:0,giant:0,cooldown:0,face:id===1?"cool":"bold",kick:0,jumpAnim:0};}
function resetWorld(){
  const p1=newPlayer(1,250,CLUBS[clubA].color,powerChoice);
  const otherPower=powerChoice==="rocket"?"freeze":powerChoice==="freeze"?"giant":"rocket";
  const p2=newPlayer(2,750,CLUBS[clubB].color,otherPower);
  return {p1,p2,ball:{x:W/2,y:FLOOR-75,vx:0,vy:0,r:17,spin:0},scoreA:0,scoreB:0,remaining:90,elapsed:0,goalPause:0,powerOrb:null,orbTimer:8,orbClock:0,over:false};
}
function startOnlineMatch(){
  if(!isHost||!onlineConnected){setStatus("أنشئ غرفة وانتظر انضمام صديقك.","بانتظار صديقك");return;}
  if(conn&&conn.open)conn.send({type:"start",clubs:[clubA,clubB]});
  startGame(false);
}
function startGame(remoteStarted){
  if(mode==="online"&&!remoteStarted&&!isHost){if(conn&&conn.open){conn.send({type:"start_request"});setStatus("أرسلت طلب بدء المباراة للمضيف.","بانتظار المضيف");}else{setStatus("أنشئ غرفة أو انضم لغرفة أولًا.","غير متصل");}return;}
  started=true;paused=false;finished=false;world=resetWorld();held={1:{left:false,right:false},2:{left:false,right:false}};
  $("#menuScreen").hidden=true;$("#gameScreen").hidden=false;$("#pauseCover").hidden=true;$("#finishCover").hidden=true;$("#gameScreen").classList.remove("match-ended");
  $("#teamLeft").textContent=CLUBS[clubA].name.toUpperCase();$("#teamRight").textContent=CLUBS[clubB].name.toUpperCase();
  $("#scoreA").textContent="0";$("#scoreB").textContent="0";$("#clock").textContent="90";
  $("#controlHint").textContent=mode==="online"?(isHost?"أنت الفريق الأيسر • العب للفوز":"أنت الفريق الأيمن • العب للفوز"):mode==="local"?"كل لاعب يملك أزراره":"تحرّك، اقفز، سدّد واستخدم قوتك!";
  $("#dualControls").hidden=!(mode==="local");$("#singleControls").hidden=mode==="local";
  $$(".player-pad").forEach(p=>p.hidden=false);
  if(mode==="online"){$("#singleControls").hidden=true;$("#dualControls").hidden=false;const pads=$(".player-pad");if(pads.length===2){pads[0].hidden=!isHost;pads[1].hidden=isHost;}$("#controlHint").textContent=isHost?"أنت الفريق الأيسر • صديقك على اليمين":"أنت الفريق الأيمن • المضيف على اليسار";}
  fitCanvas();cancelAnimationFrame(raf);lastFrame=performance.now();stateSend=0;raf=requestAnimationFrame(gameLoop);
}
function enterGame(){if(mode==="online"){if(!onlineConnected){setStatus("اتصل بغرفة قبل بدء المباراة.","غير متصل");return;}if(isHost)startOnlineMatch();else if(conn&&conn.open)conn.send({type:"start_request"});return;}startGame(false);}
$("#playBtn").addEventListener("click",enterGame);
$("#exitBtn").addEventListener("click",()=>{
  cancelAnimationFrame(raf);$("#gameScreen").hidden=true;$("#menuScreen").hidden=false;started=false;
  if(mode==="online")setStatus(onlineConnected?"الغرفة ما زالت متصلة، يمكنك إعادة اللعب.":"أنشئ غرفة أو اتصل بصديقك.","وضع أونلاين");
});
$("#pauseBtn").addEventListener("click",()=>{
  if(mode==="online"&&!isHost){showFlash("المضيف يتحكم بالإيقاف");return;}
  paused=!paused;$("#pauseCover").hidden=!paused;$("#pauseBtn").textContent=paused?"▶":"Ⅱ";
  if(mode==="online"&&conn&&conn.open)conn.send({type:"pause",value:paused});
});
$("#resumeBtn").addEventListener("click",()=>{paused=false;$("#pauseCover").hidden=true;$("#pauseBtn").textContent="Ⅱ";if(mode==="online"&&isHost&&conn)conn.send({type:"pause",value:false});});
$("#rematchBtn").addEventListener("click",()=>{
  if(mode==="online"&&!isHost){if(conn&&conn.open)conn.send({type:"start_request"});$("#finishMessage").textContent="طلبت إعادة المباراة من المضيف.";return;}
  if(mode==="online"&&conn&&conn.open)conn.send({type:"restart"});
  startGame(false);
});
$("#menuBtn").addEventListener("click",()=>{$("#gameScreen").hidden=true;$("#menuScreen").hidden=false;started=false;cancelAnimationFrame(raf);});

const canvas=$("#pitch"),ctx=canvas.getContext("2d");
function fitCanvas(){const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(rect.height*ratio);}
window.addEventListener("resize",fitCanvas);
window.addEventListener("orientationchange",()=>setTimeout(fitCanvas,200));

function playerJump(p){if(p.ground){p.vy=-13.5;p.ground=false;p.jumpAnim=1;}}
function playerKick(p,extra){
  if(!world)return;const b=world.ball;const hx=p.x+p.dir*12,hy=p.y-120;
  if(Math.hypot(b.x-hx,b.y-hy)<108||Math.abs(b.x-p.x)<94){
    b.vx=p.dir*(extra?22:14)+p.vx*.55;b.vy=extra?-9:-6.2;
  }else{b.vx=p.dir*(extra?15:9);b.vy=extra?-7:-3.5;}
  p.kick=.24;
  if(extra)showFlash("تسديدة خارقة!");
}
function usePower(p){
  if(p.cooldown>0||!world)return;
  p.cooldown=9;
  if(p.power==="rocket"){playerKick(p,true);}
  else if(p.power==="freeze"){const enemy=p.id===1?world.p2:world.p1;enemy.frozen=2.2;showFlash("تجميد! ❄️");}
  else{p.giant=4;showFlash("وضع العملاق! 💪");}
}
function handleAction(n,a,down){
  if(!started||finished||paused)return;
  if(mode==="online"&&!isHost&&n===2){if(conn&&conn.open)conn.send({type:"input",action:a,down:down});return;}
  const p=n===1?world?.p1:world?.p2;if(!p)return;
  if(a==="left"||a==="right"){held[n][a]=down;return;}
  if(!down)return;
  if(a==="jump")playerJump(p);else if(a==="shoot")playerKick(p,false);else if(a==="power")usePower(p);
}
$$("[data-action]").forEach(button=>{
  const n=Number(button.dataset.player),a=button.dataset.action;
  const down=e=>{e.preventDefault();button.classList.add("held");handleAction(n,a,true);};
  const up=e=>{e.preventDefault();button.classList.remove("held");if(a==="left"||a==="right")handleAction(n,a,false);};
  button.addEventListener("pointerdown",down);button.addEventListener("pointerup",up);button.addEventListener("pointercancel",up);button.addEventListener("pointerleave",up);
});
window.addEventListener("keydown",e=>{
  if(["ArrowLeft","ArrowRight","ArrowUp"," ","a","A","d","D","w","W","f","F","g","G","Enter"].includes(e.key))e.preventDefault();
  if(e.key==="ArrowLeft")handleAction(2,"left",true);if(e.key==="ArrowRight")handleAction(2,"right",true);if(e.key==="ArrowUp")handleAction(2,"jump",true);if(e.key==="Enter")handleAction(2,"shoot",true);
  if(e.key==="a"||e.key==="A")handleAction(1,"left",true);if(e.key==="d"||e.key==="D")handleAction(1,"right",true);if(e.key==="w"||e.key==="W")handleAction(1,"jump",true);if(e.key==="f"||e.key==="F")handleAction(1,"shoot",true);if(e.key==="g"||e.key==="G")handleAction(1,"power",true);
});
window.addEventListener("keyup",e=>{if(e.key==="ArrowLeft")handleAction(2,"left",false);if(e.key==="ArrowRight")handleAction(2,"right",false);if(e.key==="a"||e.key==="A")handleAction(1,"left",false);if(e.key==="d"||e.key==="D")handleAction(1,"right",false);});

function applyRemoteInput(data){
  if(!world||!data)return;
  const p=world.p2;
  if(data.action==="left"||data.action==="right")held[2][data.action]=!!data.down;
  if(data.down){if(data.action==="jump")playerJump(p);else if(data.action==="shoot")playerKick(p,false);else if(data.action==="power")usePower(p);}
}
function updateGame(dt){
  if(!world||world.over)return;
  const s=Math.min(dt*60,2.5);world.remaining=Math.max(0,world.remaining-dt);world.elapsed+=dt;
  const p1=world.p1,p2=world.p2,b=world.ball;
  if(world.goalPause>0){world.goalPause-=dt;if(world.goalPause<=0)serveBall();updateHud();return;}
  p1.cooldown=Math.max(0,p1.cooldown-dt);p2.cooldown=Math.max(0,p2.cooldown-dt);p1.frozen=Math.max(0,p1.frozen-dt);p2.frozen=Math.max(0,p2.frozen-dt);p1.giant=Math.max(0,p1.giant-dt);p2.giant=Math.max(0,p2.giant-dt);p1.kick=Math.max(0,p1.kick-dt);p2.kick=Math.max(0,p2.kick-dt);
  if(mode==="ai"){
    const target=b.x+ (b.vx>0?35:-12);
    held[2].left=target<p2.x-17;held[2].right=target>p2.x+17;
    if(b.y<FLOOR-108&&Math.abs(b.x-p2.x)<165&&p2.ground&&Math.random()<.09)playerJump(p2);
    if(Math.abs(b.x-p2.x)<82&&Math.random()<.045)playerKick(p2,false);
    if(p2.cooldown<=0&&Math.abs(b.x-p2.x)<110&&Math.random()<.006)usePower(p2);
  }
  for(const p of [p1,p2]){
    const input=held[p.id],frozen=p.frozen>0;
    if(!frozen){p.vx=(input.right?1:0)-(input.left?1:0);if(p.vx!==0)p.dir=p.vx>0?1:-1;p.x+=p.vx*5.0*s;}
    else{p.vx=0;}
    p.x=Math.max(58,Math.min(W-58,p.x));
    p.vy+=.62*s;p.y+=p.vy*s;
    if(p.y>=FLOOR){p.y=FLOOR;p.vy=0;p.ground=true;p.jumpAnim=0;}else p.ground=false;
  }
  b.vy+=.31*s;b.x+=b.vx*s;b.y+=b.vy*s;b.spin+=b.vx*.02*s;
  b.vx*=Math.pow(.994,s);b.vy*=Math.pow(.997,s);
  const size=b.r;
  if(b.y<size+28){b.y=size+28;b.vy=Math.abs(b.vy)*.72;}
  if(b.y>FLOOR-size){b.y=FLOOR-size;b.vy=-Math.abs(b.vy)*.73;if(Math.abs(b.vy)<1.1)b.vy=0;b.vx*=.91;}
  if(b.x<30&&b.y>GOAL_TOP&&b.y<GOAL_BOTTOM){goal(2);return;}
  if(b.x>W-30&&b.y>GOAL_TOP&&b.y<GOAL_BOTTOM){goal(1);return;}
  if(b.x<size+24){b.x=size+24;b.vx=Math.abs(b.vx)*.75;}
  if(b.x>W-size-24){b.x=W-size-24;b.vx=-Math.abs(b.vx)*.75;}
  collidePlayer(p1,b);collidePlayer(p2,b);
  world.orbClock+=dt;
  if(!world.powerOrb&&world.orbClock>world.orbTimer){world.powerOrb={x:W*(.18+Math.random()*.64),y:FLOOR-130,phase:Math.random()*7};world.orbClock=0;world.orbTimer=10+Math.random()*6;}
  if(world.powerOrb){
    world.powerOrb.phase+=dt*3;
    for(const p of [p1,p2])if(Math.hypot(p.x-world.powerOrb.x,(p.y-55)-world.powerOrb.y)<52){p.cooldown=0;world.powerOrb=null;showFlash("استعدت طاقتك! ⚡");break;}
  }
  if(world.remaining<=0){world.remaining=0;world.over=true;showFinish(world);}
  updateHud();
}
function collidePlayer(p,b){
  const giant=p.giant>0?1.27:1,headX=p.x+p.dir*2,headY=p.y-122*giant,headR=29*giant;
  let dx=b.x-headX,dy=b.y-headY,d=Math.hypot(dx,dy),min=b.r+headR;
  if(d<min&&d>0){const nx=dx/d,ny=dy/d;b.x=headX+nx*(min+1);b.y=headY+ny*(min+1);b.vx+=nx*(1.8+p.vx*.5);b.vy+=ny*2.2-1;}
  if(Math.abs(b.x-p.x)<27*giant+b.r&&b.y>p.y-61*giant&&b.y<p.y-17){b.vx+=(b.x<p.x?-1:1)*1.2;b.vy-=.7;}
}
function goal(team){
  if(!world)return;if(team===1)world.scoreA++;else world.scoreB++;
  showFlash(team===1?"GOOOAL! ⚽":"هــــدف! ⚽");world.goalPause=1.05;world.ball.vx=world.ball.vy=0;world.ball.x=W/2;world.ball.y=FLOOR-80;updateHud();
}
function serveBall(){if(!world)return;world.ball={x:W/2,y:FLOOR-65,vx:(Math.random()-.5)*2,vy:-2,r:17,spin:0};world.p1.x=250;world.p1.y=FLOOR;world.p1.vx=world.p1.vy=0;world.p1.ground=true;world.p2.x=750;world.p2.y=FLOOR;world.p2.vx=world.p2.vy=0;world.p2.ground=true;}
function updateHud(){
  if(!world)return;$("#scoreA").textContent=world.scoreA;$("#scoreB").textContent=world.scoreB;$("#clock").textContent=String(Math.ceil(world.remaining)).padStart(2,"0");
  const p=(mode==="online"&&!isHost)?world.p2:world.p1;const cd=Math.ceil(p.cooldown);
  $("#cooldownText").textContent=cd>0?"⚡ "+cd+"ث":"⚡ جاهزة";$$(".power-btn").forEach(b=>{b.classList.toggle("used",p.cooldown>0);});
}
function showFlash(text){const el=$("#matchFlash");el.textContent=text;el.classList.add("show");clearTimeout(flashTimeout);flashTimeout=setTimeout(()=>el.classList.remove("show"),950);}
function showFinish(w){
  if(!w||finished)return;finished=true;paused=false;w.over=true;$("#pauseCover").hidden=true;$("#finishCover").hidden=false;$("#gameScreen").classList.add("match-ended");$("#finishA").textContent=w.scoreA;$("#finishB").textContent=w.scoreB;
  const stats=loadCoupleStats();stats.matches=(stats.matches||0)+1;
  if(w.scoreA>w.scoreB)stats.roksiWins=(stats.roksiWins||0)+1;else if(w.scoreB>w.scoreA)stats.hemaWins=(stats.hemaWins||0)+1;else stats.draws=(stats.draws||0)+1;
  try{localStorage.setItem(COUPLE_STATS_KEY,JSON.stringify(stats));}catch{}
  updateCoupleRecord();
  const scoreA=w.scoreA,scoreB=w.scoreB;
  $("#finishTitle").textContent=scoreA===scoreB?"تعادل!":scoreA>scoreB?"فوز رائع!":"حاول مرة أخرى";
  $("#finishMessage").textContent=scoreA===scoreB?"مباراة متكافئة حتى النهاية.":(scoreA>scoreB?CLUBS[clubA].short:CLUBS[clubB].short)+" حسم المواجهة!";
  if(mode==="online"&&isHost&&conn&&conn.open)conn.send({type:"end",world:serialWorld()});
}
function serialWorld(){if(!world)return null;return {p1:{...world.p1},p2:{...world.p2},ball:{...world.ball},scoreA:world.scoreA,scoreB:world.scoreB,remaining:world.remaining,elapsed:world.elapsed,goalPause:world.goalPause,orbClock:world.orbClock,orbTimer:world.orbTimer,powerOrb:world.powerOrb?{...world.powerOrb}:null,over:world.over};}
function applySnapshot(s){if(!s)return;world=s;updateHud();if(s.over&&!finished)showFinish(s);}
function gameLoop(ts){
  if($("#gameScreen").hidden)return;
  const dt=Math.min(.04,Math.max(0,(ts-lastFrame)/1000));lastFrame=ts;
  if(!paused&&!finished&&world&&(mode!=="online"||isHost)){
    updateGame(dt);
    if(mode==="online"&&isHost&&conn&&conn.open&&ts-stateSend>50){conn.send({type:"state",world:serialWorld()});stateSend=ts;}
  }
  drawScene();
  raf=requestAnimationFrame(gameLoop);
}

function roundedRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function drawScene(){
  if(!ctx||!world)return;ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#102b3d");sky.addColorStop(.58,"#234257");sky.addColorStop(1,"#163b38");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  drawStands();drawPitch();drawGoals();
  if(world.powerOrb){const o=world.powerOrb;ctx.save();ctx.shadowColor="#d7ff62";ctx.shadowBlur=20;ctx.fillStyle="#d7ff62";ctx.beginPath();ctx.arc(o.x,o.y+Math.sin(o.phase)*5,13,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#25350d";ctx.font="bold 16px sans-serif";ctx.textAlign="center";ctx.fillText("⚡",o.x,o.y+6);ctx.restore();}
  drawCharacter(world.p1);drawCharacter(world.p2);drawBall(world.ball);
}
function drawStands(){
  ctx.fillStyle="#122638";ctx.fillRect(0,0,W,125);
  for(let row=0;row<4;row++)for(let i=0;i<52;i++){const x=i*20+(row%2)*9,y=16+row*25;const colors=["#e1e7ec","#eebc75","#75c4ea","#e87569","#b2dd7f","#a99be0"];ctx.fillStyle=colors[(i*3+row*5)%colors.length];ctx.globalAlpha=.35+((i+row)%3)*.12;ctx.beginPath();ctx.arc(x,y,4+(i%2),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  ctx.fillStyle="#0c1d2b";ctx.fillRect(0,107,W,30);
  for(let i=0;i<8;i++){ctx.fillStyle=i%2?"#c7ff56":"#e7f0f4";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText(i%2?"F27":"ARENA",65+i*125,126);}
}
function drawPitch(){
  const ground=ctx.createLinearGradient(0,125,0,H);ground.addColorStop(0,"#21834f");ground.addColorStop(1,"#145f3d");ctx.fillStyle=ground;ctx.fillRect(0,130,W,H-130);
  const stripeW=W/10;for(let i=0;i<10;i++){ctx.fillStyle=i%2?"#ffffff08":"#001c0b10";ctx.fillRect(i*stripeW,130,stripeW,H-130);}
  ctx.strokeStyle="#ddffdfb9";ctx.lineWidth=3;ctx.strokeRect(23,148,W-46,FLOOR-144);ctx.beginPath();ctx.moveTo(W/2,148);ctx.lineTo(W/2,FLOOR+4);ctx.stroke();ctx.beginPath();ctx.arc(W/2,316,70,0,Math.PI*2);ctx.stroke();
  ctx.strokeRect(22,230,113,185);ctx.strokeRect(W-135,230,113,185);ctx.strokeRect(22,270,48,104);ctx.strokeRect(W-70,270,48,104);
  ctx.fillStyle="#e8ffeb";ctx.beginPath();ctx.arc(W/2,316,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#ffffff12";ctx.fillRect(24,FLOOR+3,W-48,4);
}
function drawGoals(){
  ctx.fillStyle="#09151d88";ctx.fillRect(0,GOAL_TOP+5,35,GOAL_BOTTOM-GOAL_TOP-5);ctx.fillRect(W-35,GOAL_TOP+5,35,GOAL_BOTTOM-GOAL_TOP-5);
  ctx.strokeStyle="#ebf6ff";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(22,GOAL_TOP);ctx.lineTo(22,GOAL_BOTTOM);ctx.lineTo(0,GOAL_BOTTOM);ctx.moveTo(W-22,GOAL_TOP);ctx.lineTo(W-22,GOAL_BOTTOM);ctx.lineTo(W,GOAL_BOTTOM);ctx.stroke();
  ctx.strokeStyle="#ffffff65";ctx.lineWidth=1;for(let y=GOAL_TOP+10;y<GOAL_BOTTOM;y+=14){ctx.beginPath();ctx.moveTo(1,y);ctx.lineTo(26,y);ctx.moveTo(W-26,y);ctx.lineTo(W-1,y);ctx.stroke();}
  for(let x=5;x<28;x+=8){ctx.beginPath();ctx.moveTo(x,GOAL_TOP);ctx.lineTo(x,GOAL_BOTTOM);ctx.moveTo(W-x,GOAL_TOP);ctx.lineTo(W-x,GOAL_BOTTOM);ctx.stroke();}
}
function drawCharacter(p){
  const x=p.x,y=p.y,giant=p.giant>0?1.22:1;
  const sprite=p.id===1?spriteImages.roksi:spriteImages.hema;
  const bob=Math.abs(p.vx)>0?Math.sin(world.elapsed*12+p.id)*3:Math.sin(world.elapsed*3+p.id)*1.2;
  const height=(p.giant>0?218:184),width=sprite&&sprite.naturalWidth?sprite.naturalWidth/sprite.naturalHeight*height:76;
  ctx.save();ctx.translate(x,y+bob);ctx.scale(giant,giant);
  ctx.fillStyle="#04130c66";ctx.beginPath();ctx.ellipse(0,4,width*.43,9,0,0,Math.PI*2);ctx.fill();
  if(p.giant>0){ctx.strokeStyle="#d6ff64";ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-height*.47,width*.64,height*.52,0,0,Math.PI*2);ctx.stroke();}
  if(p.frozen>0){ctx.strokeStyle="#a5e9ff";ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-height*.47,width*.61,height*.52,0,0,Math.PI*2);ctx.stroke();}
  if(sprite&&sprite.complete&&sprite.naturalWidth>0){
    if(p.kick>0)ctx.rotate(p.dir*.08);
    ctx.drawImage(sprite,-width/2,-height,width,height);
    ctx.fillStyle="#fff6dc";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.strokeStyle="#0a1621";ctx.lineWidth=3;
    ctx.strokeText(p.id===1?"ROKSI":"HEMA / IBI",0,-height-6);ctx.fillText(p.id===1?"ROKSI":"HEMA / IBI",0,-height-6);
    if(p.frozen>0){ctx.font="20px sans-serif";ctx.fillText("❄",0,-height-19);}
    ctx.restore();return;
  }
  const kicking=p.kick>0,legShift=kicking?p.dir*13:Math.sin(world.elapsed*9+p.id)*4;
  ctx.strokeStyle="#e7edf4";ctx.lineWidth=12;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-10,-19);ctx.lineTo(-15+legShift,-3);ctx.lineTo(-20+legShift,-1);ctx.moveTo(10,-19);ctx.lineTo(16-legShift*.5,-4);ctx.lineTo(23-legShift*.5,-2);ctx.stroke();
  ctx.strokeStyle="#152533";ctx.lineWidth=17;ctx.beginPath();ctx.moveTo(-18+legShift,-2);ctx.lineTo(-6+legShift,-2);ctx.moveTo(12-legShift*.5,-3);ctx.lineTo(26-legShift*.5,-3);ctx.stroke();
  ctx.fillStyle=p.color;roundedRect(ctx,-26,-65,52,47,12);ctx.fill();
  ctx.fillStyle="#ffffff";ctx.font="bold 19px sans-serif";ctx.textAlign="center";ctx.fillText(p.id===1?"27":"11",0,-36);
  ctx.fillStyle="#ecc29e";ctx.beginPath();ctx.arc(0,-86,29,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#33241f";ctx.beginPath();ctx.arc(0,-94,28,Math.PI,Math.PI*2);ctx.fill();
  ctx.fillStyle="#18222b";ctx.beginPath();ctx.ellipse(-10,-85,6,4,0,0,Math.PI*2);ctx.ellipse(10,-85,6,4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#f3dfbc";ctx.font="bold 10px sans-serif";ctx.fillText(p.id===1?"ROKSI":"HEMA",0,-124);
  ctx.restore();
}
function drawBall(b){
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.spin);ctx.fillStyle="#00140866";ctx.beginPath();ctx.ellipse(4,19,20,7,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#f4f8ff";ctx.strokeStyle="#18232c";ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle="#15232c";ctx.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;const px=Math.cos(a)*7,py=Math.sin(a)*7;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.arc(Math.cos(a)*11,Math.sin(a)*11,2.5,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

setSelectedMode("ai");
const spriteImages={roksi:new Image(),hema:new Image()};
spriteImages.roksi.src="./assets/roksi.webp";
spriteImages.hema.src="./assets/hema.webp";
const COUPLE_STATS_KEY="football2027_couple_stats_v1";
function loadCoupleStats(){
  try{return JSON.parse(localStorage.getItem(COUPLE_STATS_KEY)||'{"matches":0,"roksiWins":0,"hemaWins":0,"draws":0}');}
  catch{return {matches:0,roksiWins:0,hemaWins:0,draws:0};}
}
function updateCoupleRecord(){
  const s=loadCoupleStats();const el=$("#coupleRecord");
  if(el)el.textContent="سجل المواجهات • روكسي "+s.roksiWins+" — هيما "+s.hemaWins+" • تعادل "+s.draws;
}
updateCoupleRecord();
$("#coupleMatchBtn").addEventListener("click",()=>{
  clubA=0;clubB=1;powerChoice="rocket";$("#powerSelect").value=powerChoice;
  renderClubs();setSelectedMode("ai");startGame(false);
});
setStatus("جاهز للمباراة. روكسي بالريال مدريد وهيما/إيبي ببرشلونة.","جاهز للعب");
