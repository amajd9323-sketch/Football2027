/* 
 * Football 2027 Arena — المرحلة الأولى (أوفلاين)
 * جميع ثوابت الفيزياء الأساسية في CONFIG لتسهيل ضبط توازن اللعبة.
 */
const CONFIG = Object.freeze({
  world: {
    width: 1280, height: 720, groundY: 620, standBottom: 146,
    goalX: 120, goalTop: 380, goalBottom: 620, goalDepth: 120,
    goalPostRadius: 8, goalExpand: 1.5
  },
  timing: {
    fps: 60, fixedStep: 1 / 60, physicsSubsteps: 4, matchSeconds: 90,
    countdownSeconds: 3, goalPause: 2, goalSlowSeconds: 0.8, goldenGoalAfter: 30
  },
  physics: {
    /* الوحدات هنا بكسل/ثانية وثانية²، لا بكسل/إطار. */
    gravity: 2600, ballGravity: 1400, maxRunSpeed: 380,
    runAcceleration: 3200, airAcceleration: 2200, stopAcceleration: 4200,
    airDrag: 0.22, jumpVelocity: 960, giantJumpVelocity: 1296,
    playerCollisionRadius: 56, headOffset: 154, headRadius: 56,
    headRestitution: 0.9, headMinBounce: 350, playerVelocityTransfer: 0.6,
    footOffsetX: 34, footOffsetY: 34, footRadius: 22, ballRadius: 26,
    ballMaxSpeed: 1500, ballFriction: 0.15, ballGroundDrag: 2.8,
    ballGroundBounce: 0.72, ballWallBounce: 0.85, goalPostBounce: 0.84,
    stompForce: 800, stompSideForce: 800,
    kickDuration: 0.22, kickCooldown: 0.45, kickForce: 1000,
    airKickForce: 1000, kickLift: -250, airKickLift: -300,
    kickReachX: 108, kickReachY: 98, coyoteTime: 0.08,
    jumpBuffer: 0.1, powerTouchCharge: 0.1
  },
  ai: {
    easy: { speed: 0.72, reaction: 0.30, jumpDistance: 170, kickDistance: 110, accuracy: 0.58, positionError: 60, aggression: 0.3 },
    normal: { speed: 0.88, reaction: 0.18, jumpDistance: 210, kickDistance: 130, accuracy: 0.78, positionError: 30, aggression: 0.6 },
    hard: { speed: 1.03, reaction: 0.10, jumpDistance: 250, kickDistance: 150, accuracy: 0.92, positionError: 10, aggression: 0.9 }
  },
  powers: {
    freeze: { name: "تجميد الخصم", icon: "❄️", charge: 20, duration: 2 },
    bigGoal: { name: "تكبير المرمى", icon: "🥅", charge: 22, duration: 5 },
    fireball: { name: "كرة نارية", icon: "🔥", charge: 18, duration: 4 },
    giantJump: { name: "قفزة عملاقة", icon: "🚀", charge: 21, duration: 6 },
    speed: { name: "سرعة مضاعفة", icon: "⚡", charge: 17, duration: 5 },
    shield: { name: "درع المرمى", icon: "🛡️", charge: 25, duration: 3 }
  },
  rewards: { win: 30, draw: 15, loss: 10, goal: 2, daily: 50 },
  graphics: { spriteHeight: 206, spriteWidthFallback: 100, particleLimit: 110, shake: 7 }
});

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const CHARACTERS = [
  {id:"roksi",name:"ROKSI",ar:"روكسي",tag:"QUEEN",color:"#f1eee0",accent:"#d4b565",speed:5.0,jump:12.9,kick:1.02,head:1.03,img:"./assets/roksi.webp",fallback:"👑"},
  {id:"hema",name:"HEMA / IBI",ar:"هيما / إيبي",tag:"KING",color:"#2452a1",accent:"#c83652",speed:5.05,jump:13.1,kick:1.04,head:1.02,img:"./assets/hema.webp",fallback:"👑"},
  {id:"blaze",name:"BLAZE",ar:"بليز",tag:"STRIKER",color:"#f06442",accent:"#ffbd63",speed:5.35,jump:12.5,kick:1.16,head:0.98,fallback:"🔥"},
  {id:"luna",name:"LUNA",ar:"لونا",tag:"TRICKSTER",color:"#a07aff",accent:"#f2a1e7",speed:5.2,jump:13.7,kick:0.94,head:1.04,fallback:"🌙"},
  {id:"titan",name:"TITAN",ar:"تايتن",tag:"TANK",color:"#b0784b",accent:"#e3d5be",speed:4.35,jump:11.6,kick:1.23,head:1.14,fallback:"🪨"},
  {id:"nova",name:"NOVA",ar:"نوفا",tag:"SPRINTER",color:"#25a9a1",accent:"#a7fff1",speed:5.65,jump:13.0,kick:0.91,head:0.98,fallback:"💫"},
  {id:"volt",name:"VOLT",ar:"فولت",tag:"JUMPER",color:"#d4bb33",accent:"#fff0a0",speed:4.85,jump:14.4,kick:0.98,head:1.0,fallback:"⚡"},
  {id:"echo",name:"ECHO",ar:"إيكو",tag:"BALANCED",color:"#788c9c",accent:"#d6e4ef",speed:5.0,jump:13.0,kick:1.0,head:1.0,fallback:"🎧"}
];
const POWER_IDS = ["freeze","bigGoal","fireball","giantJump","speed","shield"];
const POWER_DESC = {
  freeze:"يجمد حركة الخصم ثانيتين", bigGoal:"يوسع مرمى الخصم مؤقتًا",
  fireball:"يجعل الكرة أسرع مع أثر ناري", giantJump:"قفزة أقوى وأعلى",
  speed:"يضاعف سرعة الحركة مؤقتًا", shield:"يحمي مرماك من هدف لمدة 3 ثوانٍ"
};
const STORAGE_KEY = "football2027_phase1_v1";
const DEFAULT_DATA = {coins:0,wins:0,played:0,bestStreak:0,streak:0,dailyClaim:"",sound:true,music:false,vibrate:true,swap:false,controlScale:100,controlOpacity:85,language:"ar",cups:0};
function loadData(){
  try{return {...DEFAULT_DATA,...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")};}
  catch{return {...DEFAULT_DATA};}
}
let saved = loadData();
function saveData(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));}catch{} updateProfileUI();}
function updateProfileUI(){
  $("#coinCount").textContent=String(saved.coins);
  $("#setupCoins").textContent=String(saved.coins);
  $("#winsStat").textContent=String(saved.wins);
  $("#playedStat").textContent=String(saved.played);
  $("#bestStat").textContent=String(saved.bestStreak);
  $("#dailyStatus").textContent=saved.dailyClaim===new Date().toISOString().slice(0,10)?"تم استلام مكافأة اليوم":"استلم 50 عملة مرة كل يوم";
  $("#dailyRewardBtn").disabled=saved.dailyClaim===new Date().toISOString().slice(0,10);
}
let mode="ai",activeAssign=1,difficulty="normal";
let chosen={1:"roksi",2:"hema"};
let selectedPowers=["freeze","fireball","giantJump"];
let game=null,raf=0,lastFrame=0,accumulator=0,started=false,paused=false,finished=false;
let inputs={1:{left:false,right:false,jump:false,kick:false,power:""},2:{left:false,right:false,jump:false,kick:false,power:""}};
let images={};
let audioContext=null,musicTimer=null,musicIndex=0;
const particles=[];
const canvas=$("#pitch"),ctx=canvas.getContext("2d");

function goScreen(id){
  $$(".screen").forEach(s=>s.hidden=s.id!==id);
  if(id==="matchScreen")resizeCanvas();
  if(id==="menuScreen")updateProfileUI();
}
function charById(id){for(let i=0;i<CHARACTERS.length;i++){if(CHARACTERS[i].id===id)return CHARACTERS[i];}return CHARACTERS[0];}
function setupMode(next){mode=next;$("#vsAiBtn").classList.toggle("chosen",mode==="ai");$("#localBtn").classList.toggle("chosen",mode==="local");$("#aiSetup").hidden=mode!=="ai";}
function openSetup(nextMode){
  setupMode(nextMode);activeAssign=1;renderSetup();goScreen("setupScreen");
}
$("#vsAiBtn").addEventListener("click",()=>openSetup("ai"));
$("#localBtn").addEventListener("click",()=>openSetup("local"));
$("#startSetupBtn").addEventListener("click",()=>openSetup(mode));
$$("[data-back]").forEach(b=>b.addEventListener("click",()=>goScreen(b.dataset.back)));
$("#settingsOpen").addEventListener("click",()=>{if(!started)goScreen("settingsScreen");else showToast("أنهِ المباراة أو أوقفها قبل تغيير الإعدادات.");});
$("#assignP1").addEventListener("click",()=>{activeAssign=1;renderSetup();});
$("#assignP2").addEventListener("click",()=>{activeAssign=2;renderSetup();});

function renderSetup(){
  $("#assignP1").classList.toggle("active",activeAssign===1);
  $("#assignP2").classList.toggle("active",activeAssign===2);
  $("#characterGrid").innerHTML=CHARACTERS.map(c=>{
    const img=c.img?'<img src="'+c.img+'" alt="">':'<div class="character-doll" style="color:'+c.color+'">'+c.fallback+'</div>';
    return '<button class="character-card '+(chosen[activeAssign]===c.id?'active':'')+'" data-char="'+c.id+'" style="--char:'+c.accent+'">'+img+'<b>'+c.ar+'</b><small>'+c.tag+'</small></button>';
  }).join("");
  $$(".character-card").forEach(b=>b.addEventListener("click",()=>{
    chosen[activeAssign]=b.dataset.char;renderSetup();
  }));
  const c=charById(chosen[activeAssign]);
  $("#selectedColor").style.setProperty("--club",c.color);
  $("#selectedColor").style.background=c.color;
  $("#selectedName").textContent=c.name;
  $("#selectedBadge").textContent=c.tag;
  $("#selectedStats").textContent="سرعة "+c.speed.toFixed(1)+" • قفز "+c.jump.toFixed(1)+" • قوة ركل "+c.kick.toFixed(2);
  $("#powerCount").textContent=selectedPowers.length+" / 3";
  $("#powerGrid").innerHTML=POWER_IDS.map(id=>{
    const p=CONFIG.powers[id],selected=selectedPowers.includes(id);
    return '<button class="power-card '+(selected?'active':'')+'" data-power-choice="'+id+'"><span class="power-icon">'+p.icon+'</span><b>'+p.name+'</b><small>'+POWER_DESC[id]+'</small></button>';
  }).join("");
  $$(".power-card").forEach(b=>b.addEventListener("click",()=>{
    const id=b.dataset.powerChoice;
    if(selectedPowers.includes(id)){selectedPowers=selectedPowers.filter(x=>x!==id);}
    else if(selectedPowers.length<3){selectedPowers.push(id);}
    else{showToast("اختر 3 قوى فقط. أزل قوة أولًا.");}
    renderSetup();
  }));
  $$(".difficulty").forEach(b=>b.classList.toggle("active",b.dataset.difficulty===difficulty));
  updateProfileUI();
}
$$(".difficulty").forEach(b=>b.addEventListener("click",()=>{difficulty=b.dataset.difficulty;renderSetup();}));

$("#startMatchBtn").addEventListener("click",()=>{
  if(selectedPowers.length!==3){showToast("اختر 3 قوى بالضبط قبل المباراة.");return;}
  startMatch();
});
$("#dailyRewardBtn").addEventListener("click",()=>{
  const today=new Date().toISOString().slice(0,10);
  if(saved.dailyClaim===today){showToast("استلمت مكافأتك اليومية بالفعل.");return;}
  saved.dailyClaim=today;saved.coins+=CONFIG.rewards.daily;saveData();playSound("reward");showToast("وصلتك 50 عملة يومية! 🪙");
});
$("#soundToggle").checked=saved.sound;$("#musicToggle").checked=saved.music;$("#vibrateToggle").checked=saved.vibrate;
$("#swapToggle").checked=saved.swap;$("#controlScale").value=saved.controlScale;$("#controlOpacity").value=saved.controlOpacity;$("#languageSelect").value=saved.language;
$("#soundToggle").addEventListener("change",e=>{saved.sound=e.target.checked;saveData();if(saved.sound)playSound("kick");});
$("#musicToggle").addEventListener("change",e=>{saved.music=e.target.checked;saveData();setMusic(saved.music);});
$("#vibrateToggle").addEventListener("change",e=>{saved.vibrate=e.target.checked;saveData();});
$("#swapToggle").addEventListener("change",e=>{saved.swap=e.target.checked;saveData();});
$("#controlScale").addEventListener("input",e=>{saved.controlScale=Number(e.target.value);applyScale();saveData();});
$("#controlOpacity").addEventListener("input",e=>{saved.controlOpacity=Number(e.target.value);applyControlOpacity();saveData();});
$("#languageSelect").addEventListener("change",e=>{saved.language=e.target.value;document.documentElement.lang=saved.language;document.documentElement.dir=saved.language==="ar"?"rtl":"ltr";applyLanguage();saveData();});
$("#clearDataBtn").addEventListener("click",()=>{
  if(!confirm(saved.language==="ar"?"هل تريد مسح العملات والإحصائيات نهائيًا؟":"Clear all coins and stats?"))return;
  saved={...DEFAULT_DATA};saveData();$("#soundToggle").checked=true;$("#musicToggle").checked=false;$("#vibrateToggle").checked=true;$("#swapToggle").checked=false;$("#controlScale").value=100;setMusic(false);showToast("تم مسح البيانات.");goScreen("menuScreen");
});
function applyScale(){document.documentElement.style.setProperty("--control-scale",String(saved.controlScale/100));}
function applyControlOpacity(){document.documentElement.style.setProperty("--control-opacity",String(saved.controlOpacity/100));}
function applyLanguage(){
  const translatable=$("h1,h2,b,button,small,p,span");
  if(saved.language==="ar"){
    translatable.forEach(el=>{if(el.dataset.orig)el.textContent=el.dataset.orig;});
    return;
  }
  const map={"اختر نمط اللعب":"Choose a match","ضد الكمبيوتر":"VS Computer","لاعبان على نفس الهاتف":"Local 2 Players","اختيار الشخصية والقوى":"Choose character & powers","دخول الملعب":"Enter Arena","إعدادات":"Settings","الإعدادات":"Settings","اختر أبطالك":"Choose your players","الشخصيات الأصلية":"Original characters","اختر 3 قوى للمباراة":"Choose 3 powers","صعوبة الخصم":"CPU difficulty","مبتدئ":"Easy","محترف":"Normal","أسطوري":"Hard","إيقاف مؤقت":"Paused","متابعة المباراة":"Resume match","الخروج للقائمة":"Back to menu","القائمة الرئيسية":"Main menu","إعادة المباراة":"Rematch","انتصارات":"Wins","مباريات":"Matches","هدف ذهبي":"Golden goal"};
  $$("h1,h2,b,button,small,p,span").forEach(el=>{if(!el.dataset.orig)el.dataset.orig=el.textContent;const key=el.dataset.orig.trim();if(map[key])el.textContent=map[key];});
}

function loadCharacterImages(){
  CHARACTERS.forEach(c=>{if(!c.img)return;const im=new Image();im.src=c.img;im.onload=()=>{images[c.id]=im;};im.onerror=()=>{};});
}
loadCharacterImages();

function characterCard(id){return charById(id);}
function createPlayer(id,x,charId){
  const c=characterCard(charId);
  const powers=selectedPowers.map(powerId=>({id:powerId,charge:0,used:false}));
  return {id,charId,x,y:CONFIG.world.groundY,vx:0,vy:0,dir:id===1?1:-1,grounded:true,coyoteTimer:CONFIG.physics.coyoteTime,jumpBuffer:0,jumpInputPrev:false,kickInputPrev:false,powerInputPrev:"",stun:0,giant:0,speedBoost:0,kickTimer:0,kickCooldown:0,kickApplied:false,powers,shield:0,frozen:0,anim:0,prevY:CONFIG.world.groundY};
}
function createWorld(){
  return {p1:createPlayer(1,330,chosen[1]),p2:createPlayer(2,950,chosen[2]),
    ball:{x:CONFIG.world.width/2,y:-25,vx:0,vy:0,r:CONFIG.physics.ballRadius,fire:0,fireOwner:0,spin:0,prevX:CONFIG.world.width/2,prevY:-25},
    scoreA:0,scoreB:0,remaining:CONFIG.timing.matchSeconds,countdown:CONFIG.timing.countdownSeconds,
    celebration:0,slowTimer:0,goldenGoal:false,goldenRemaining:CONFIG.timing.goldenGoalAfter,over:false,bigGoal:{1:0,2:0},shield:{1:0,2:0},
    elapsed:0,shake:0,rng:0x20271011,physicsEvents:0,scoringPlayer:0,ai:{wait:0,left:false,right:false,jump:false,kick:false,power:false},banner:"",bannerTime:0,fireParticles:[]};
}
function resizeCanvas(){
  if(!canvas||!canvas.clientWidth||!canvas.clientHeight)return;
  const ratio=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(canvas.clientWidth*ratio);canvas.height=Math.round(canvas.clientHeight*ratio);
}
window.addEventListener("resize",resizeCanvas);window.addEventListener("orientationchange",()=>setTimeout(resizeCanvas,180));

function renderControls(){
  const powersHtml=(player)=>selectedPowers.map((id,i)=>{
    const p=CONFIG.powers[id];
    return '<button class="power-button" data-player="'+player+'" data-action="power" data-power="'+id+'" aria-label="'+p.name+'" style="--charge:0%"><span>'+p.icon+'</span></button>';
  }).join("");
  const pad=(player,label)=>'<div class="control-player '+(player===2?'p2':'p1')+'" data-pad="'+player+'"><div class="player-tag">'+label+'</div><div class="power-row">'+powersHtml(player)+'</div><div class="control-row"><div class="move-cluster"><button class="left-button" data-player="'+player+'" data-action="left" aria-label="يسار">◀</button><button class="right-button" data-player="'+player+'" data-action="right" aria-label="يمين">▶</button></div><div class="action-cluster"><button class="jump-button" data-player="'+player+'" data-action="jump" aria-label="قفز">⬆</button><button class="kick-button" data-player="'+player+'" data-action="kick" aria-label="ركل">👟</button></div></div></div>';
  $("#gameControls").innerHTML=mode==="local"?pad(1,"PLAYER 1 • ROKSI")+pad(2,"PLAYER 2 • HEMA"):pad(1,"PLAYER 1 • YOU");
  if(mode==="ai")$("#gameControls").insertAdjacentHTML("beforeend",'<div class="cpu-chip">🤖 CPU</div>');
  if(saved.swap)$("#gameControls").classList.add("swapped");else $("#gameControls").classList.remove("swapped");
  $("#gameControls").querySelectorAll("[data-action]").forEach(btn=>{
    const player=Number(btn.dataset.player),action=btn.dataset.action;
    const down=e=>{e.preventDefault();btn.classList.add("held");getAudio();if(saved.vibrate&&navigator.vibrate)navigator.vibrate(8);if(action==="left"||action==="right"){inputs[player][action]=true;}else if(action==="power"){inputs[player].power=btn.dataset.power;}else if(action==="jump"){inputs[player].jump=true;}else if(action==="kick"){inputs[player].kick=true;}try{btn.setPointerCapture(e.pointerId);}catch{}};
    const up=e=>{e.preventDefault();btn.classList.remove("held");if(action==="left"||action==="right"||action==="jump"||action==="kick")inputs[player][action]=false;else if(action==="power")inputs[player].power="";};
    btn.addEventListener("pointerdown",down);btn.addEventListener("pointerup",up);btn.addEventListener("pointercancel",up);btn.addEventListener("lostpointercapture",up);
  });
}
// تحكم لوحة المفاتيح للاختبار على الحاسوب أو جهاز Android مع لوحة مفاتيح.
function onGameKeyDown(e){
  if(!started||$("#matchScreen").hidden)return;
  const k=e.key.toLowerCase();
  const gameKeys=["a","d","w"," ","1","2","3","arrowleft","arrowright","arrowup","enter","7","8","9","escape"];
  if(gameKeys.includes(k))e.preventDefault();
  getAudio();
  if(k==="a")inputs[1].left=true;
  else if(k==="d")inputs[1].right=true;
  else if(k==="arrowleft")inputs[2].left=true;
  else if(k==="arrowright")inputs[2].right=true;
  if(e.repeat)return;
  if(k==="w")inputs[1].jump=true;
  else if(k===" ")inputs[1].kick=true;
  else if(k==="arrowup")inputs[2].jump=true;
  else if(k==="enter")inputs[2].kick=true;
  else if(k==="1"&&selectedPowers[0])inputs[1].power=selectedPowers[0];
  else if(k==="2"&&selectedPowers[1])inputs[1].power=selectedPowers[1];
  else if(k==="3"&&selectedPowers[2])inputs[1].power=selectedPowers[2];
  else if(k==="7"&&selectedPowers[0])inputs[2].power=selectedPowers[0];
  else if(k==="8"&&selectedPowers[1])inputs[2].power=selectedPowers[1];
  else if(k==="9"&&selectedPowers[2])inputs[2].power=selectedPowers[2];
  else if(k==="escape")togglePause();
}
function onGameKeyUp(e){
  const k=e.key.toLowerCase();
  if(k==="a")inputs[1].left=false;
  else if(k==="d")inputs[1].right=false;
  else if(k==="arrowleft")inputs[2].left=false;
  else if(k==="arrowright")inputs[2].right=false;
  else if(k==="w")inputs[1].jump=false;
  else if(k===" ")inputs[1].kick=false;
  else if(k==="arrowup")inputs[2].jump=false;
  else if(k==="enter")inputs[2].kick=false;
  else if(["1","2","3"].includes(k))inputs[1].power="";
  else if(["7","8","9"].includes(k))inputs[2].power="";
}
window.addEventListener("keydown",onGameKeyDown,{passive:false});
window.addEventListener("keyup",onGameKeyUp);
window.addEventListener("blur",clearMatchInputs);
document.addEventListener("visibilitychange",()=>{if(document.hidden&&started&&!paused)togglePause();});
document.addEventListener("contextmenu",e=>{if(e.target.closest("#matchScreen"))e.preventDefault();});
function clearMatchInputs(){inputs={1:{left:false,right:false,jump:false,kick:false,power:""},2:{left:false,right:false,jump:false,kick:false,power:""}};if(game){game.p1.jumpInputPrev=game.p2.jumpInputPrev=false;game.p1.kickInputPrev=game.p2.kickInputPrev=false;game.p1.powerInputPrev=game.p2.powerInputPrev="";}}

$("#pauseBtn").addEventListener("click",togglePause);
$("#resumeBtn").addEventListener("click",togglePause);
$("#quitPausedBtn").addEventListener("click",()=>{stopLoop();goScreen("menuScreen");});
$("#exitMatchBtn").addEventListener("click",()=>{if(confirm(saved.language==="ar"?"إنهاء المباراة والعودة للقائمة؟":"Quit match?")){stopLoop();goScreen("menuScreen");}});
$("#rematchBtn").addEventListener("click",()=>startMatch());
$("#resultSetupBtn").addEventListener("click",()=>{renderSetup();goScreen("setupScreen");});
$("#resultMenuBtn").addEventListener("click",()=>goScreen("menuScreen"));
function togglePause(){
  if(!started||finished)return;paused=!paused;if(paused)clearMatchInputs();$("#pauseOverlay").hidden=!paused;
  $("#pauseBtn").textContent=paused?"▶":"Ⅱ";
  if(!paused){lastFrame=performance.now();accumulator=0;}
}
function prepareMatchDisplay(){
  try{
    if(screen.orientation&&typeof screen.orientation.lock==="function"){
      const lock=screen.orientation.lock("landscape");if(lock&&typeof lock.catch==="function")lock.catch(()=>{});
    }
  }catch{}
  try{
    if(document.documentElement.requestFullscreen&&!document.fullscreenElement){
      const request=document.documentElement.requestFullscreen();if(request&&typeof request.catch==="function")request.catch(()=>{});
    }
  }catch{}
}
function startMatch(){
  started=true;paused=false;finished=false;mode=mode==="local"?"local":"ai";
  prepareMatchDisplay();
  game=createWorld();inputs={1:{left:false,right:false,jump:false,kick:false,power:""},2:{left:false,right:false,jump:false,kick:false,power:""}};particles.length=0;
  $("#scoreLeft").textContent="0";$("#scoreRight").textContent="0";$("#pauseOverlay").hidden=true;$("#eventOverlay").hidden=true;$("#goldenOverlay").hidden=true;
  $("#nameLeft").textContent=characterCard(chosen[1]).name;$("#nameRight").textContent=mode==="ai"?"CPU • "+characterCard(chosen[2]).name:characterCard(chosen[2]).name;
  $("#avatarLeft").src=characterCard(chosen[1]).img||"./assets/game-logo.webp";$("#avatarRight").src=characterCard(chosen[2]).img||"./assets/game-logo.webp";
  $("#cupsLeft").textContent="🏆 "+saved.cups;$("#cupsRight").textContent="🏆 "+(mode==="ai"?Math.max(0,saved.cups-1):saved.cups);
  $("#matchModeLabel").textContent=mode==="ai"?"ARCADE • VS CPU":"LOCAL • 2 PLAYERS";
  $("#clockCaption").textContent="SECONDS";
  $("#gameClock").textContent=String(CONFIG.timing.matchSeconds);
  $("#controlHelp").textContent=mode==="local"?"اليسار: اللاعب 1 • اليمين: اللاعب 2":"◀ ▶ حركة • ⬆ قفز • 👟 ركل";
  renderControls();goScreen("matchScreen");resizeCanvas();
  playSound("whistle");lastFrame=performance.now();accumulator=0;cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
}
function stopLoop(){cancelAnimationFrame(raf);started=false;paused=false;}
function frame(now){
  if(!started||$("#matchScreen").hidden)return;
  let elapsed=Math.min(.1,(now-lastFrame)/1000);lastFrame=now;
  if(!paused){accumulator+=elapsed;while(accumulator>=CONFIG.timing.fixedStep){updateGame(CONFIG.timing.fixedStep);accumulator-=CONFIG.timing.fixedStep;if(finished)break;}}
  drawGame(accumulator/CONFIG.timing.fixedStep);
  raf=requestAnimationFrame(frame);
}
function jumpPlayer(id){
  if(!game||paused||finished||game.countdown>0)return;
  inputs[id].jump=true;
}
function kickPlayer(id){
  if(!game||paused||finished||game.countdown>0)return;
  const p=id===1?game.p1:game.p2;
  if(p.kickCooldown>0)return;
  p.kickTimer=CONFIG.physics.kickDuration;p.kickCooldown=CONFIG.physics.kickCooldown;p.kickApplied=false;
  playSound("kick");
}
function usePower(id,powerId){
  if(!game||paused||finished||game.countdown>0)return;
  const p=id===1?game.p1:game.p2,slot=p.powers.find(s=>s.id===powerId);
  if(!slot||slot.used||slot.charge<1){showToast(slot&&slot.used?"استخدمت هذه القوة.":"القوة لم تُشحن بعد.");return;}
  slot.used=true;slot.charge=0;
  const enemy=id===1?game.p2:game.p1;
  switch(powerId){
    case "freeze": enemy.frozen=CONFIG.powers.freeze.duration;burst(p.x,p.y-100,"#a8ebff",20);showToast("تجميد الخصم! ❄️");playSound("power");break;
    case "bigGoal": game.bigGoal[id===1?2:1]=CONFIG.powers.bigGoal.duration;burst(id===1?CONFIG.world.width-30:30,CONFIG.world.goalTop,"#d2ff68",20);showToast("مرمى الخصم أصبح أكبر! 🥅");playSound("power");break;
    case "fireball": {game.ball.fire=CONFIG.powers.fireball.duration;game.ball.fireOwner=id;const sign=game.ball.vx===0?p.dir:Math.sign(game.ball.vx);game.ball.vx=sign*Math.max(300,Math.abs(game.ball.vx)*1.4);game.ball.vy*=1.4;game.ball.vx=Math.max(-CONFIG.physics.ballMaxSpeed,Math.min(CONFIG.physics.ballMaxSpeed,game.ball.vx));burst(game.ball.x,game.ball.y,"#ff713e",22);showToast("كرة نارية! 🔥");playSound("power");break;}
    case "giantJump": p.giant=CONFIG.powers.giantJump.duration;p.vy=-CONFIG.physics.giantJumpVelocity;p.grounded=false;p.coyoteTimer=0;p.jumpBuffer=0;burst(p.x,p.y,"#b7ff4b",18);showToast("قفزة عملاقة! 🚀");playSound("power");break;
    case "speed": p.speedBoost=CONFIG.powers.speed.duration;burst(p.x,p.y-80,"#fff07a",16);showToast("سرعة مضاعفة! ⚡");playSound("power");break;
    case "shield": game.shield[id]=CONFIG.powers.shield.duration;burst(id===1?45:CONFIG.world.width-45,CONFIG.world.groundY-90,"#66d9ff",18);showToast("درع المرمى مفعّل! 🛡️");playSound("power");break;
  }
  updatePowerButtons();
}
function updatePowerButtons(){
  if(!game)return;
  $("#gameControls").querySelectorAll(".power-button").forEach(btn=>{
    const id=Number(btn.dataset.player),p=id===1?game.p1:game.p2,slot=p.powers.find(x=>x.id===btn.dataset.power);
    if(!slot)return;
    const pct=Math.floor(slot.charge*100);
    btn.style.setProperty("--charge",pct+"%");
    btn.classList.toggle("used",slot.used);btn.classList.toggle("ready",slot.charge>=1&&!slot.used);
    btn.title=slot.used?"مستعملة":slot.charge>=1?"جاهزة":"شحن "+pct+"%";
  });
}
function processInputActions(){
  for(let id=1;id<=2;id++){
    const p=id===1?game.p1:game.p2,inp=inputs[id];
    if(inp.jump&&!p.jumpInputPrev){
      p.jumpBuffer=CONFIG.physics.jumpBuffer;
      playSound("jump");
      if(saved.vibrate&&navigator.vibrate)navigator.vibrate(8);
    }
    p.jumpInputPrev=!!inp.jump;
    if(inp.kick&&!p.kickInputPrev)kickPlayer(id);
    p.kickInputPrev=!!inp.kick;
    const power=inp.power||"";
    if(power&&power!==p.powerInputPrev)usePower(id,power);
    p.powerInputPrev=power;
  }
}
function updateGame(dt){
  if(!game||game.over||finished)return;
  if(game.countdown>0){
    game.countdown-=dt;
    const digit=Math.ceil(game.countdown);
    $("#countdownOverlay").hidden=game.countdown<=0;
    $("#countdownOverlay").textContent=String(Math.max(1,digit));
    if(game.countdown<=0){game.countdown=0;game.ball.y=-24;game.ball.vx=0;game.ball.vy=0;playSound("whistle");}
    return;
  }
  $("#countdownOverlay").hidden=true;
  game.elapsed+=dt;
  if(game.celebration>0){
    game.celebration-=dt;game.slowTimer=Math.max(0,game.slowTimer-dt);
    if(game.celebration<=0){
      if(game.goldenPending){finishGame();return;}
      kickoff();
    }
    return;
  }
  if(!game.goldenGoal){
    game.remaining=Math.max(0,game.remaining-dt);
    if(game.remaining<=0){
      game.remaining=0;
      if(game.scoreA===game.scoreB){
        game.goldenGoal=true;game.goldenRemaining=CONFIG.timing.goldenGoalAfter;game.banner="الهدف الذهبي!";game.bannerTime=2.5;game.countdown=CONFIG.timing.countdownSeconds;game.ball={x:CONFIG.world.width/2,y:-CONFIG.physics.ballRadius-8,vx:0,vy:0,r:CONFIG.physics.ballRadius,fire:0,fireOwner:0,spin:0,prevX:CONFIG.world.width/2,prevY:-CONFIG.physics.ballRadius-8};$("#goldenOverlay").hidden=false;
      }else{finishGame();return;}
    }
  }else{
    game.goldenRemaining=Math.max(0,game.goldenRemaining-dt);
    if(game.goldenRemaining<=0&&game.scoreA===game.scoreB){finishGame();return;}
  }
  if(game.bannerTime>0)game.bannerTime-=dt;
  updatePowerTimers(game.p1,dt);updatePowerTimers(game.p2,dt);
  game.bigGoal[1]=Math.max(0,game.bigGoal[1]-dt);game.bigGoal[2]=Math.max(0,game.bigGoal[2]-dt);
  game.shield[1]=Math.max(0,game.shield[1]-dt);game.shield[2]=Math.max(0,game.shield[2]-dt);
  game.p1.stun=Math.max(0,game.p1.stun-dt);game.p2.stun=Math.max(0,game.p2.stun-dt);
  game.p1.kickCooldown=Math.max(0,game.p1.kickCooldown-dt);game.p2.kickCooldown=Math.max(0,game.p2.kickCooldown-dt);
  
  game.p1.giant=Math.max(0,game.p1.giant-dt);game.p2.giant=Math.max(0,game.p2.giant-dt);
  game.p1.speedBoost=Math.max(0,game.p1.speedBoost-dt);game.p2.speedBoost=Math.max(0,game.p2.speedBoost-dt);
  if(mode==="ai")updateAI(dt);
  processInputActions();
  let simEvents=0;
  const subDt=dt/CONFIG.timing.physicsSubsteps;
  for(let sub=0;sub<CONFIG.timing.physicsSubsteps;sub++){
    const event=step(game,inputs,subDt);simEvents|=event;
    if(event&SIM_EVENT.GOAL){scoreGoal(game.scoringPlayer);break;}
  }
  if(simEvents&SIM_EVENT.HEADER){playSound("header");burst(game.ball.x,game.ball.y,"#edfaff",4);}
  if(simEvents&SIM_EVENT.STOMP){playSound("stomp");burst(game.ball.x,game.ball.y,"#e6ff7a",14);game.shake=CONFIG.graphics.shake;}
  if(simEvents&SIM_EVENT.KICK){burst(game.ball.x,game.ball.y,game.ball.fire>0?"#ff6b37":"#eff9ff",game.ball.fire>0?18:9);game.shake=CONFIG.graphics.shake*.3;}
  if(simEvents&SIM_EVENT.SHIELD){burst(game.ball.x,game.ball.y,"#6bdcff",12);}
  if(simEvents&SIM_EVENT.PLAYER_HIT){burst((game.p1.x+game.p2.x)/2,game.ball.y,"#ff8c56",8);}
  updateFireParticles(dt);updatePowerButtons();
  if(game.shake>0)game.shake=Math.max(0,game.shake-dt*18);
  $("#scoreLeft").textContent=game.scoreA;$("#scoreRight").textContent=game.scoreB;
  if(game.goldenGoal){$("#gameClock").textContent=String(Math.ceil(game.goldenRemaining)).padStart(2,"0");$("#clockCaption").textContent="GOLDEN GOAL";}
  else{$("#gameClock").textContent=String(Math.ceil(game.remaining)).padStart(2,"0");$("#clockCaption").textContent="SECONDS";}
}
function updatePowerTimers(p,dt){
  for(let i=0;i<p.powers.length;i++){
    const slot=p.powers[i],chargeTime=CONFIG.powers[slot.id].charge;
    slot.charge=Math.min(1,slot.charge+dt/chargeTime);
    if(slot.charge>=1)slot.used=false;
  }
  p.frozen=Math.max(0,p.frozen-dt);
}
/* محرك المحاكاة: هذا الجزء لا يقرأ DOM ولا يستخدم ساعة النظام أو أرقامًا عشوائية.
   السرعات بوحدة بكسل/ثانية، ويُستدعى أربع مرات لكل إطار ثابت. */
const SIM_EVENT = Object.freeze({JUMP:1,KICK:2,HEADER:4,STOMP:8,GOAL:16,SHIELD:32,PLAYER_HIT:64});
function approachZero(value,amount){if(value>0)return Math.max(0,value-amount);if(value<0)return Math.min(0,value+amount);return 0;}
function touchCharge(player){
  for(let i=0;i<player.powers.length;i++){
    const slot=player.powers[i];
    slot.charge=Math.min(1,slot.charge+CONFIG.physics.powerTouchCharge);
    if(slot.charge>=1)slot.used=false;
  }
}
function goalTopFor(state,goalkeeper){
  const height=CONFIG.world.goalBottom-CONFIG.world.goalTop;
  return state.bigGoal[goalkeeper]>0?CONFIG.world.goalBottom-height*CONFIG.world.goalExpand:CONFIG.world.goalTop;
}
function stepKickPlayer(state,p,dt){
  const b=state.ball;
  let hit=0;
  if(p.kickTimer>0&&!p.kickApplied){
    const progress=Math.max(0,Math.min(1,1-p.kickTimer/CONFIG.physics.kickDuration));
    const angle=(-30+110*progress)*Math.PI/180;
    const reach=CONFIG.physics.footRadius*1.15;
    const footX=p.x+p.dir*(CONFIG.physics.footOffsetX+Math.cos(angle)*reach);
    const footY=p.y-CONFIG.physics.footOffsetY-Math.sin(angle)*reach;
    const fx=b.x-footX,fy=b.y-footY,dist=Math.hypot(fx,fy);
    if(dist<=b.r+CONFIG.physics.footRadius&&dist>0){
      const c=charById(p.charId);
      const boost=b.fire>0?1.4:1;
      const force=(p.grounded?CONFIG.physics.kickForce:CONFIG.physics.airKickForce)*c.kick*boost;
      let ax=fx/dist+p.dir*.18,ay=fy/dist-.25,alen=Math.hypot(ax,ay)||1;
      b.vx=ax/alen*force+p.vx*.35;b.vy=ay/alen*force+p.vy*.35;
      if(b.vx>CONFIG.physics.ballMaxSpeed)b.vx=CONFIG.physics.ballMaxSpeed;
      if(b.vx< -CONFIG.physics.ballMaxSpeed)b.vx=-CONFIG.physics.ballMaxSpeed;
      if(b.vy>CONFIG.physics.ballMaxSpeed)b.vy=CONFIG.physics.ballMaxSpeed;
      if(b.vy< -CONFIG.physics.ballMaxSpeed)b.vy=-CONFIG.physics.ballMaxSpeed;
      p.kickApplied=true;touchCharge(p);hit=SIM_EVENT.KICK;
    }
  }
  p.kickTimer=Math.max(0,p.kickTimer-dt);
  return hit;
}
function movePlayerSim(p,inp,dt){
  p.prevY=p.y;
  if(p.grounded)p.coyoteTimer=CONFIG.physics.coyoteTime;
  else p.coyoteTimer=Math.max(0,p.coyoteTimer-dt);
  if(p.jumpBuffer>0&&p.coyoteTimer>0&&p.frozen<=0){
    const c=charById(p.charId);
    p.vy=-(p.giant>0?CONFIG.physics.giantJumpVelocity:CONFIG.physics.jumpVelocity)*(c.jump/13);
    p.grounded=false;p.coyoteTimer=0;p.jumpBuffer=0;
  }
  p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);
  if(p.frozen>0||p.stun>0){
    p.vx=approachZero(p.vx,CONFIG.physics.stopAcceleration*dt);
  }else{
    const direction=(inp.right?1:0)-(inp.left?1:0);
    const c=charById(p.charId);
    const topSpeed=CONFIG.physics.maxRunSpeed*(c.speed/5)*(p.speedBoost>0?1.4:1);
    if(direction){p.dir=direction;p.vx+=direction*(p.grounded?CONFIG.physics.runAcceleration:CONFIG.physics.airAcceleration)*dt;}
    else p.vx=approachZero(p.vx,(p.grounded?CONFIG.physics.stopAcceleration:CONFIG.physics.stopAcceleration*.18)*dt);
    if(p.vx>topSpeed)p.vx=topSpeed;if(p.vx< -topSpeed)p.vx=-topSpeed;
  }
  p.x+=p.vx*dt;
  const minX=CONFIG.world.goalX+CONFIG.physics.playerCollisionRadius;
  const maxX=CONFIG.world.width-CONFIG.world.goalX-CONFIG.physics.playerCollisionRadius;
  if(p.x<minX){p.x=minX;if(p.vx<0)p.vx=0;}
  if(p.x>maxX){p.x=maxX;if(p.vx>0)p.vx=0;}
  p.vy+=CONFIG.physics.gravity*dt;
  p.y+=p.vy*dt;
  if(p.y>=CONFIG.world.groundY){p.y=CONFIG.world.groundY;p.vy=0;p.grounded=true;p.coyoteTimer=CONFIG.physics.coyoteTime;}
  else p.grounded=false;
  p.anim+=dt*(Math.abs(p.vx)>.3?12:2);
}
function updateAI(dt){
  const p=game.p2,b=game.ball,ai=CONFIG.ai[difficulty];
  game.ai.wait-=dt;
  if(game.ai.wait<=0){
    const predictedX=b.x+b.vx*.6;
    const positionError=(simRandom()*2-1)*ai.positionError;
    const target=Math.max(CONFIG.world.goalX+CONFIG.physics.playerCollisionRadius,Math.min(CONFIG.world.width-CONFIG.world.goalX-CONFIG.physics.playerCollisionRadius,predictedX+positionError));
    game.ai.left=target<p.x-16;game.ai.right=target>p.x+16;
    game.ai.jump=(b.y<p.y-100&&Math.abs(b.x-p.x)<ai.jumpDistance&&p.grounded);
    game.ai.kick=(Math.abs(b.x-p.x)<ai.kickDistance&&Math.abs(b.y-(p.y-CONFIG.physics.footOffsetY))<190);
    game.ai.power=Math.abs(b.x-p.x)<155;
    game.ai.wait=ai.reaction;
  }
  inputs[2].left=game.ai.left;inputs[2].right=game.ai.right;
  inputs[2].jump=!!(game.ai.jump&&p.grounded);
  const aim=(CONFIG.world.goalTop+CONFIG.world.goalBottom)/2;
  const targetX=b.x+(b.vx>0?25:-25);
  const error=Math.abs(targetX-p.x);
  inputs[2].kick=!!(game.ai.kick&&p.kickCooldown<=0&&(Math.abs(b.y-aim)<300||error<ai.kickDistance*ai.accuracy));
  const readyPower=p.powers.find(s=>!s.used&&s.charge>=1);
  inputs[2].power=game.ai.power&&readyPower&&simRandom()<.006*ai.aggression?readyPower.id:"";
}
function step(state,inputFrame,dt){
  let events=0;
  const p1=state.p1,p2=state.p2,b=state.ball;
  movePlayerSim(p1,inputFrame[1],dt);
  movePlayerSim(p2,inputFrame[2],dt);

  b.prevX=b.x;b.prevY=b.y;
  b.vy+=CONFIG.physics.ballGravity*dt;
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  b.spin+=b.vx*dt*.006;
  b.fire=Math.max(0,b.fire-dt);if(b.fire<=0)b.fireOwner=0;
  if(b.vx>CONFIG.physics.ballMaxSpeed)b.vx=CONFIG.physics.ballMaxSpeed;
  if(b.vx< -CONFIG.physics.ballMaxSpeed)b.vx=-CONFIG.physics.ballMaxSpeed;
  if(b.vy>CONFIG.physics.ballMaxSpeed)b.vy=CONFIG.physics.ballMaxSpeed;
  if(b.vy< -CONFIG.physics.ballMaxSpeed)b.vy=-CONFIG.physics.ballMaxSpeed;

  if(b.y<b.r+8){b.y=b.r+8;if(b.vy<0)b.vy=Math.abs(b.vy)*CONFIG.physics.ballWallBounce;}
  if(b.y>CONFIG.world.groundY-b.r){
    b.y=CONFIG.world.groundY-b.r;
    b.vy=-Math.abs(b.vy)*CONFIG.physics.ballGroundBounce;
    if(Math.abs(b.vy)<40)b.vy=0;
    b.vx*=Math.exp(-CONFIG.physics.ballGroundDrag*dt);
  }else b.vx*=Math.exp(-CONFIG.physics.ballFriction*dt);

  const leftTop=goalTopFor(state,1),rightTop=goalTopFor(state,2),bottom=CONFIG.world.goalBottom;
  if(b.x<CONFIG.world.goalX&&b.y>=leftTop+b.r*.82&&b.y<bottom){
    if(state.shield[1]>0){b.x=CONFIG.world.goalX+b.r+1;b.vx=Math.abs(b.vx)*1.15;events|=SIM_EVENT.SHIELD;}
    else{state.scoringPlayer=2;state.physicsEvents=events|SIM_EVENT.GOAL;return state.physicsEvents;}
  }
  if(b.x>CONFIG.world.width-CONFIG.world.goalX&&b.y>=rightTop+b.r*.82&&b.y<bottom){
    if(state.shield[2]>0){b.x=CONFIG.world.width-CONFIG.world.goalX-b.r-1;b.vx=-Math.abs(b.vx)*1.15;events|=SIM_EVENT.SHIELD;}
    else{state.scoringPlayer=1;state.physicsEvents=events|SIM_EVENT.GOAL;return state.physicsEvents;}
  }

  /* العارضة جسم دائري ثابت؛ نعيد الكرة إلى خارج القطعة ونغيّر مركبة السرعة العمودية. */
  const postR=CONFIG.world.goalPostRadius,minDist=b.r+postR;
  if(b.x<=CONFIG.world.goalX+b.r){
    let qx=Math.max(0,Math.min(CONFIG.world.goalX,b.x)),dx=b.x-qx,dy=b.y-leftTop,d=Math.hypot(dx,dy);
    if(d<minDist&&d>0){const nx=dx/d,ny=dy/d;b.x=qx+nx*minDist;b.y=leftTop+ny*minDist;const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+CONFIG.physics.goalPostBounce)*vn*nx;b.vy-=(1+CONFIG.physics.goalPostBounce)*vn*ny;}}
  }
  if(b.x>=CONFIG.world.width-CONFIG.world.goalX-b.r){
    let qx=Math.max(CONFIG.world.width-CONFIG.world.goalX,Math.min(CONFIG.world.width,b.x)),dx=b.x-qx,dy=b.y-rightTop,d=Math.hypot(dx,dy);
    if(d<minDist&&d>0){const nx=dx/d,ny=dy/d;b.x=qx+nx*minDist;b.y=rightTop+ny*minDist;const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+CONFIG.physics.goalPostBounce)*vn*nx;b.vy-=(1+CONFIG.physics.goalPostBounce)*vn*ny;}}
  }
  if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx)*CONFIG.physics.ballWallBounce;}
  if(b.x>CONFIG.world.width-b.r){b.x=CONFIG.world.width-b.r;b.vx=-Math.abs(b.vx)*CONFIG.physics.ballWallBounce;}

  if(p1.vy>0&&p1.prevY<b.y-b.r&&p1.y>=b.y-b.r&&Math.abs(p1.x-b.x)<b.r+CONFIG.physics.footRadius){
    b.y=p1.y-b.r-1;b.vy=CONFIG.physics.stompForce;b.vx=p1.dir*CONFIG.physics.stompSideForce;p1.vy=-120;touchCharge(p1);events|=SIM_EVENT.STOMP;
  }
  if(p2.vy>0&&p2.prevY<b.y-b.r&&p2.y>=b.y-b.r&&Math.abs(p2.x-b.x)<b.r+CONFIG.physics.footRadius){
    b.y=p2.y-b.r-1;b.vy=CONFIG.physics.stompForce;b.vx=p2.dir*CONFIG.physics.stompSideForce;p2.vy=-120;touchCharge(p2);events|=SIM_EVENT.STOMP;
  }

  /* تصادم دائري للرأس باستخدام السرعة النسبية والارتداد. */
  let head=charById(p1.charId),hx=p1.x,hy=p1.y-CONFIG.physics.headOffset,hr=CONFIG.physics.headRadius*head.head;
  let dx=b.x-hx,dy=b.y-hy,d=Math.hypot(dx,dy),min=hr+b.r;
  if(d<min&&d>0){
    const nx=dx/d,ny=dy/d;b.x=hx+nx*(min+.2);b.y=hy+ny*(min+.2);
    let rvx=b.vx-p1.vx,rvy=b.vy-p1.vy,vn=rvx*nx+rvy*ny;
    if(vn<0){rvx-=(1+CONFIG.physics.headRestitution)*vn*nx;rvy-=(1+CONFIG.physics.headRestitution)*vn*ny;}
    b.vx=rvx+p1.vx*CONFIG.physics.playerVelocityTransfer;b.vy=rvy+p1.vy*CONFIG.physics.playerVelocityTransfer;
    if(ny<-.2&&b.vy> -CONFIG.physics.headMinBounce)b.vy=-CONFIG.physics.headMinBounce;
    touchCharge(p1);events|=SIM_EVENT.HEADER;
    if(b.fire>0&&b.fireOwner!==0&&b.fireOwner!==p1.id){p1.vx+=nx*240;p1.vy=Math.min(p1.vy,-180);p1.stun=.18;events|=SIM_EVENT.PLAYER_HIT;}
  }
  head=charById(p2.charId);hx=p2.x;hy=p2.y-CONFIG.physics.headOffset;hr=CONFIG.physics.headRadius*head.head;
  dx=b.x-hx;dy=b.y-hy;d=Math.hypot(dx,dy);min=hr+b.r;
  if(d<min&&d>0){
    const nx=dx/d,ny=dy/d;b.x=hx+nx*(min+.2);b.y=hy+ny*(min+.2);
    let rvx=b.vx-p2.vx,rvy=b.vy-p2.vy,vn=rvx*nx+rvy*ny;
    if(vn<0){rvx-=(1+CONFIG.physics.headRestitution)*vn*nx;rvy-=(1+CONFIG.physics.headRestitution)*vn*ny;}
    b.vx=rvx+p2.vx*CONFIG.physics.playerVelocityTransfer;b.vy=rvy+p2.vy*CONFIG.physics.playerVelocityTransfer;
    if(ny<-.2&&b.vy> -CONFIG.physics.headMinBounce)b.vy=-CONFIG.physics.headMinBounce;
    touchCharge(p2);events|=SIM_EVENT.HEADER;
    if(b.fire>0&&b.fireOwner!==0&&b.fireOwner!==p2.id){p2.vx+=nx*240;p2.vy=Math.min(p2.vy,-180);p2.stun=.18;events|=SIM_EVENT.PLAYER_HIT;}
  }

  /* قوس القدم 110 درجة، وركلة واحدة فقط لكل ضغطة. */
  events|=stepKickPlayer(state,p1,dt);
  events|=stepKickPlayer(state,p2,dt);

  /* دفع رأسي للاعبين مع فصل المراكز، ثم أثر الكرة النارية عند الالتحام. */
  dx=p2.x-p1.x;d=Math.abs(dx);min=CONFIG.physics.playerCollisionRadius*2;
  if(d<min&&Math.abs(p1.y-p2.y)<min){
    const overlap=(min-d)*.5,dir=dx>=0?1:-1;
    p1.x-=overlap*dir;p2.x+=overlap*dir;
    const push=(p1.vx-p2.vx)*.16;p1.vx-=push;p2.vx+=push;
    if(b.fire>0&&b.fireOwner!==0){
      const attacker=b.fireOwner===1?p1:b.fireOwner===2?p2:null;
      const victim=b.fireOwner===1?p2:p1;
      if(attacker){victim.vx+=(victim.x>=attacker.x?1:-1)*260;victim.vy=Math.min(victim.vy,-200);victim.stun=.2;events|=SIM_EVENT.PLAYER_HIT;}
    }
  }
  state.physicsEvents=events;
  return events;
}
function scoreGoal(scoringPlayer){
  if(game.celebration>0)return;
  if(scoringPlayer===1)game.scoreA++;else game.scoreB++;
  $("#scoreLeft").textContent=game.scoreA;$("#scoreRight").textContent=game.scoreB;
  game.celebration=CONFIG.timing.goalPause;game.slowTimer=CONFIG.timing.goalSlowSeconds;
  game.goldenPending=game.goldenGoal;
  game.ball.vx=0;game.ball.vy=0;game.ball.x=CONFIG.world.width/2;game.ball.y=CONFIG.world.groundY-85;
  game.shake=CONFIG.graphics.shake;burst(game.ball.x,game.ball.y,"#d5ff62",32);playSound("goal");
  if(saved.vibrate&&navigator.vibrate)navigator.vibrate([60,30,100]);
  showToast("هــــدف! ⚽ "+(scoringPlayer===1?characterCard(chosen[1]).ar:characterCard(chosen[2]).ar));
}
function simRandom(){if(!game)return .5;game.rng=(Math.imul(game.rng,1664525)+1013904223)>>>0;return game.rng/4294967296;}
function kickoff(){
  game.p1.x=330;game.p2.x=950;game.p1.y=game.p2.y=CONFIG.world.groundY;
  game.p1.vx=game.p1.vy=game.p2.vx=game.p2.vy=0;game.p1.grounded=game.p2.grounded=true;
  game.p1.coyoteTimer=game.p2.coyoteTimer=CONFIG.physics.coyoteTime;
  game.p1.jumpBuffer=game.p2.jumpBuffer=0;game.p1.kickTimer=game.p2.kickTimer=0;
  game.ball={x:CONFIG.world.width/2,y:-CONFIG.physics.ballRadius-8,vx:(simRandom()-.5)*90,vy:0,r:CONFIG.physics.ballRadius,fire:0,fireOwner:0,spin:0,prevX:CONFIG.world.width/2,prevY:-CONFIG.physics.ballRadius-8};
  game.countdown=CONFIG.timing.countdownSeconds;$("#countdownOverlay").hidden=false;$("#countdownOverlay").textContent="3";
}
function finishGame(){
  if(finished)return;finished=true;game.over=true;stopLoop();
  const a=game.scoreA,b=game.scoreB,draw=a===b,winner=a>b?1:b>a?2:0;
  let reward=draw?CONFIG.rewards.draw:(winner===1?CONFIG.rewards.win:CONFIG.rewards.loss);
  saved.played++;if(winner===1){saved.wins++;saved.streak++;saved.bestStreak=Math.max(saved.bestStreak,saved.streak);saved.cups+=3;}else if(winner===2){saved.cups=Math.max(0,saved.cups-1);saved.streak=0;}else{saved.streak=0;}
  saved.coins+=reward+CONFIG.rewards.goal*(a+b);const totalReward=reward+CONFIG.rewards.goal*(a+b);saveData();
  $("#resultMedal").textContent=draw?"🤝":winner===1?"🏆":"⚽";
  $("#resultTitle").textContent=draw?"تعادل!":winner===1?"فوز رائع!":"حاول مرة أخرى";
  $("#resultDescription").textContent=draw?"مباراة متكافئة حتى النهاية.":(winner===1?characterCard(chosen[1]).ar:characterCard(chosen[2]).ar)+" حسم المواجهة!";
  $("#resultNameA").textContent=characterCard(chosen[1]).name;$("#resultNameB").textContent=mode==="ai"?"CPU":characterCard(chosen[2]).name;
  $("#resultScoreA").textContent=a;$("#resultScoreB").textContent=b;$("#matchReward").textContent="🪙 +"+totalReward;
  goScreen("resultScreen");playSound("whistleEnd");
}
function updateFireParticles(dt){
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx;p.y+=p.vy;p.vy+=.13;if(p.life<=0)particles.splice(i,1);}
}
function burst(x,y,color,count){
  for(let i=0;i<count&&particles.length<CONFIG.graphics.particleLimit;i++){
    const angle=Math.random()*Math.PI*2,speed=1+Math.random()*5;
    particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:.24+Math.random()*.65,color,size:2+Math.random()*4});
  }
}
function drawGame(alpha){
  if(!game)return;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
  const sx=canvas.width/CONFIG.world.width,sy=canvas.height/CONFIG.world.height;
  ctx.setTransform(sx,0,0,sy,0,0);
  const shake=game.shake>0?Math.sin(game.elapsed*90)*game.shake:0;
  ctx.save();ctx.translate(Math.sin(game.elapsed*91.7)*shake,0);
  drawStadium();drawGoals();drawPlayer(game.p1);drawPlayer(game.p2);drawBall(game.ball);drawParticles();
  ctx.restore();
  if(game.countdown>0){$("#countdownOverlay").hidden=false;$("#countdownOverlay").textContent=String(Math.max(1,Math.ceil(game.countdown)));}
  else if(game.celebration>0){$("#countdownOverlay").hidden=true;$("#eventOverlay").hidden=false;$("#eventOverlay").textContent="GOOOAL! ⚽";}
  else{$("#eventOverlay").hidden=true;}
  $("#goldenOverlay").hidden=!game.goldenGoal;
}
function drawStadium(){
  const g=ctx.createLinearGradient(0,0,0,CONFIG.world.height);g.addColorStop(0,"#17394d");g.addColorStop(.36,"#2c586b");g.addColorStop(.361,"#24824c");g.addColorStop(1,"#145e3b");ctx.fillStyle=g;ctx.fillRect(0,0,CONFIG.world.width,CONFIG.world.height);
  ctx.fillStyle="#12283a";ctx.fillRect(0,0,CONFIG.world.width,CONFIG.world.standBottom);
  const crowd=["#e5e9ee","#e9bb6e","#77c9ed","#e87569","#b4e37f","#ab9ee5"];
  for(let row=0;row<5;row++)for(let i=0;i<64;i++){ctx.fillStyle=crowd[(i*3+row*7)%crowd.length];ctx.globalAlpha=.32+((i+row)%3)*.14;ctx.beginPath();ctx.arc(i*21+(row%2)*8,18+row*24,3+(i%2),0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;ctx.fillStyle="#0b1b28";ctx.fillRect(0,118,CONFIG.world.width,30);
  for(let i=0;i<10;i++){ctx.fillStyle=i%2?"#c7ff56":"#edf3f5";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText(i%2?"F27 ARENA":"ROKSI × HEMA",65+i*127,137);}
  const floor=CONFIG.world.groundY;ctx.fillStyle="#1e7d48";ctx.fillRect(0,148,CONFIG.world.width,floor-148);
  for(let i=0;i<10;i++){ctx.fillStyle=i%2?"#ffffff08":"#001a0d12";ctx.fillRect(i*CONFIG.world.width/10,148,CONFIG.world.width/10,floor-148);}
  ctx.strokeStyle="#e0ffe4bf";ctx.lineWidth=3;ctx.strokeRect(22,158,CONFIG.world.width-44,floor-158);
  ctx.beginPath();ctx.moveTo(CONFIG.world.width/2,158);ctx.lineTo(CONFIG.world.width/2,floor);ctx.stroke();
  ctx.beginPath();ctx.arc(CONFIG.world.width/2,390,77,0,Math.PI*2);ctx.stroke();
  ctx.strokeRect(CONFIG.world.goalX,250,125,205);ctx.strokeRect(CONFIG.world.width-CONFIG.world.goalX-125,250,125,205);
  ctx.strokeRect(CONFIG.world.goalX,292,52,120);ctx.strokeRect(CONFIG.world.width-CONFIG.world.goalX-52,292,52,120);
  ctx.fillStyle="#ffffff22";ctx.fillRect(0,floor,CONFIG.world.width,CONFIG.world.height-floor);
  ctx.fillStyle="#eaffef";ctx.beginPath();ctx.arc(CONFIG.world.width/2,390,4,0,Math.PI*2);ctx.fill();
}
function drawGoals(){
  const base=CONFIG.world.goalBottom,top=CONFIG.world.goalTop;
  const leftTop=game.bigGoal[1]>0?top-65:top,rightTop=game.bigGoal[2]>0?top-65:top;
  ctx.fillStyle="#07131d88";ctx.fillRect(0,leftTop,CONFIG.world.goalX,base-leftTop);ctx.fillRect(CONFIG.world.width-CONFIG.world.goalX,rightTop,CONFIG.world.goalX,base-rightTop);
  ctx.strokeStyle="#edf6ff";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(CONFIG.world.goalX,leftTop);ctx.lineTo(CONFIG.world.goalX,base);ctx.lineTo(0,base);ctx.lineTo(0,leftTop);ctx.moveTo(CONFIG.world.width-CONFIG.world.goalX,rightTop);ctx.lineTo(CONFIG.world.width-CONFIG.world.goalX,base);ctx.lineTo(CONFIG.world.width,base);ctx.lineTo(CONFIG.world.width,rightTop);ctx.stroke();
  ctx.strokeStyle="#ffffff65";ctx.lineWidth=1;
  for(let y=leftTop+10;y<base;y+=14){ctx.beginPath();ctx.moveTo(1,y);ctx.lineTo(CONFIG.world.goalX+2,y);ctx.stroke();}
  for(let y=rightTop+10;y<base;y+=14){ctx.beginPath();ctx.moveTo(CONFIG.world.width-CONFIG.world.goalX-2,y);ctx.lineTo(CONFIG.world.width-1,y);ctx.stroke();}
  if(game.shield[1]>0){ctx.strokeStyle="#66d9ff";ctx.lineWidth=5;ctx.beginPath();ctx.arc(35,(leftTop+base)/2,45,-Math.PI/2,Math.PI/2);ctx.stroke();}
  if(game.shield[2]>0){ctx.strokeStyle="#66d9ff";ctx.lineWidth=5;ctx.beginPath();ctx.arc(CONFIG.world.width-35,(rightTop+base)/2,45,Math.PI/2,Math.PI*1.5);ctx.stroke();}
}
function drawPlayer(p){
  const c=characterCard(p.charId),x=p.x,y=p.y,im=images[p.charId];
  const bob=p.grounded&&Math.abs(p.vx)>.2?Math.sin(p.anim)*3:0;
  const h=CONFIG.graphics.spriteHeight,w=im? h*im.naturalWidth/im.naturalHeight:CONFIG.graphics.spriteWidthFallback;
  ctx.save();ctx.translate(x,y+bob);
  ctx.fillStyle="#00150955";ctx.beginPath();ctx.ellipse(0,5,w*.4,9,0,0,Math.PI*2);ctx.fill();
  if(p.giant>0){ctx.strokeStyle="#d6ff64";ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-h*.45,w*.66,h*.48,0,0,Math.PI*2);ctx.stroke();}
  if(p.frozen>0){ctx.strokeStyle="#9ae9ff";ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-h*.45,w*.62,h*.48,0,0,Math.PI*2);ctx.stroke();}
  if(im){
    // صور روكسي وهيما مدمجة في الأصول وتظل ظاهرة حتى مع اللعب السريع.
    ctx.drawImage(im,-w/2,-h,w,h);
    if(p.kickTimer>0){ctx.strokeStyle="#fff8cb";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(p.dir*w*.18,-22);ctx.lineTo(p.dir*(w*.8),-38);ctx.stroke();ctx.fillStyle="#fff4c7";ctx.font="bold 22px sans-serif";ctx.textAlign="center";ctx.fillText("👟",p.dir*w*.82,-36);}
    ctx.fillStyle="#ffffff";ctx.font="bold 12px sans-serif";ctx.textAlign="center";ctx.strokeStyle="#07111d";ctx.lineWidth=3;ctx.strokeText(c.name,0,-h-7);ctx.fillText(c.name,0,-h-7);
  }else{
    const shift=p.kickTimer>0?p.dir*20:Math.sin(p.anim)*5;
    ctx.strokeStyle="#e8f0f7";ctx.lineWidth=15;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-15,-23);ctx.lineTo(-19+shift,-4);ctx.moveTo(15,-23);ctx.lineTo(20-shift*.4,-4);ctx.stroke();
    ctx.fillStyle="#16222d";ctx.fillRect(-26+shift,-7,21,8);ctx.fillRect(10-shift*.4,-7,23,8);
    ctx.fillStyle=c.color;ctx.beginPath();ctx.roundRect(-30,-82,60,59,13);ctx.fill();ctx.strokeStyle="#ffffffaa";ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle="#fff";ctx.font="bold 19px sans-serif";ctx.textAlign="center";ctx.fillText(String(p.id===1?27:11),0,-48);
    ctx.fillStyle="#efc5a2";ctx.beginPath();ctx.arc(0,-121,34*c.head,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#5a392c";ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle="#35261e";ctx.beginPath();ctx.arc(0,-130,34*c.head,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-31,-132,62,8);
    ctx.fillStyle="#17252e";ctx.beginPath();ctx.ellipse(-12,-120,6,4,0,0,Math.PI*2);ctx.ellipse(12,-120,6,4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(-12,-120,2,0,Math.PI*2);ctx.arc(12,-120,2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#f9edc8";ctx.font="bold 10px sans-serif";ctx.fillText(c.name,0,-174);
  }
  ctx.restore();
}
function drawBall(b){
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.spin);
  ctx.fillStyle="#00140866";ctx.beginPath();ctx.ellipse(4,b.r+5,b.r+3,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=b.fire>0?"#ffac55":"#f7f9ff";ctx.strokeStyle=b.fire>0?"#ff4b24":"#18232c";ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle=b.fire>0?"#a92716":"#14232c";ctx.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2,px=Math.cos(a)*7,py=Math.sin(a)*7;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.arc(Math.cos(a)*11,Math.sin(a)*11,2.5,0,Math.PI*2);ctx.fill();}
  if(b.fire>0){ctx.shadowColor="#ff5a28";ctx.shadowBlur=18;ctx.strokeStyle="#ff8e45";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,b.r+5,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}
function drawParticles(){for(const p of particles){ctx.globalAlpha=Math.max(0,Math.min(1,p.life));ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

function getAudio(){
  if(!saved.sound&&!saved.music)return null;
  try{if(!audioContext){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;audioContext=new AC();}if(audioContext.state==="suspended")audioContext.resume();return audioContext;}catch{return null;}
}
function tone(freq,duration,type,volume){
  if(!saved.sound)return;
  const ac=getAudio();if(!ac)return;
  try{const osc=ac.createOscillator(),gain=ac.createGain();osc.type=type||"sine";osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,ac.currentTime);gain.gain.exponentialRampToValueAtTime(volume||.06,ac.currentTime+.015);gain.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+duration);osc.connect(gain);gain.connect(ac.destination);osc.start();osc.stop(ac.currentTime+duration+.02);}catch{}
}
function playSound(type){
  if(type==="kick"){tone(180,.08,"triangle",.045);tone(105,.06,"sine",.025);}
  else if(type==="jump"){tone(420,.09,"sine",.035);}
  else if(type==="header"){tone(310,.07,"triangle",.04);}
  else if(type==="stomp"){tone(120,.13,"square",.04);}
  else if(type==="power"){tone(520,.08,"sawtooth",.025);setTimeout(()=>tone(760,.12,"sine",.04),65);}
  else if(type==="goal"){tone(523,.18,"triangle",.055);setTimeout(()=>tone(659,.23,"triangle",.06),110);setTimeout(()=>tone(784,.32,"triangle",.07),230);setTimeout(()=>tone(1046,.35,"sine",.045),360);}
  else if(type==="whistle"){tone(1100,.22,"sine",.04);setTimeout(()=>tone(900,.15,"sine",.03),170);}
  else if(type==="whistleEnd"){tone(850,.3,"sine",.035);setTimeout(()=>tone(650,.4,"sine",.035),260);}
  else if(type==="reward"){tone(700,.1,"triangle",.04);setTimeout(()=>tone(1000,.18,"triangle",.045),120);}
}
function setMusic(on){
  if(musicTimer){clearInterval(musicTimer);musicTimer=null;}
  if(!on||!saved.sound)return;
  const notes=[392,494,587,494,440,523,659,523];
  musicTimer=setInterval(()=>{if(saved.music&&saved.sound){tone(notes[musicIndex%notes.length],.26,"sine",.012);musicIndex++;}},650);
}
function showToast(message){
  const el=$("#eventOverlay");
  if($("#matchScreen").hidden){let t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.querySelector(".app").appendChild(t);}t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1900);}
  else{el.textContent=message;el.hidden=false;setTimeout(()=>{if(game&&game.celebration<=0)el.hidden=true;},1300);}
}
applyScale();applyControlOpacity();updateProfileUI();renderSetup();setMusic(saved.music);
