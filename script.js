// =====================
// Firebase Setup
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyAM8jDGhoaPZF3BieIKkMuJtd64PXPOsxw",
  authDomain: "arcaneempire-31.firebaseapp.com",
  databaseURL: "https://arcaneempire-31-default-rtdb.firebaseio.com",
  projectId: "arcaneempire-31"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// =====================
// Globals
// =====================
let user = "";
let bossHP = 100;
const maxBossHP = 100;
let lastPurchaseTime = 0;
const purchaseCooldown = 2000; // not used yet but reserved for Step 4

// DOM Elements
const loginScreen = document.getElementById("loginScreen");
const gameUI = document.getElementById("gameUI");
const username = document.getElementById("username");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

const playerName = document.getElementById("playerName");
const goldCount = document.getElementById("goldCount");
const diamondCount = document.getElementById("diamondCount");
const valorCount = document.getElementById("valorCount");

const eventLog = document.getElementById("eventLog");

const fightBtn = document.getElementById("fightBtn");
const trainBtn = document.getElementById("trainBtn");

// PvP Elements
const pvpOpponent = document.getElementById("pvpOpponent");
const fightPlayerBtn = document.getElementById("fightPlayerBtn");
const arenaLog = document.getElementById("arenaLog");

// Guild Elements
const guildInfo = document.getElementById("guildInfo");
const createGuildBtn = document.getElementById("createGuildBtn");
const joinGuildBtn = document.getElementById("joinGuildBtn");
const guildNameInput = document.getElementById("guildNameInput");

// Leaderboards
const playerLeaderboard = document.getElementById("playerLeaderboard");
const guildLeaderboard = document.getElementById("guildLeaderboard");

// Admin
const admin = document.getElementById("admin");
const adminPanel = document.getElementById("adminPanel");

// =====================
// Login / Session
// =====================
window.onload = () => {
  const savedUser = localStorage.getItem("arcaneUser");
  if(savedUser){
    user = savedUser;
    loginScreen.classList.add("hidden");
    gameUI.classList.remove("hidden");
    if(user!=="Zedd") admin.style.display="none"; else admin.style.display="block";
    loadPlayer();
    loadGuild();
    loadPlayerLeaderboard();
    loadGuildLeaderboard();
    initArena(); // Step 3 starts here
  }
};

loginBtn.onclick = async () => {
  const u = username.value.trim();
  const p = password.value.trim();
  if(!u || !p) return alert("Fill all fields");

  const ref = db.ref("players/"+u);
  const snap = await ref.once("value");

  if(!snap.exists()){
    await ref.set({password:p, gold:100, diamond:5, valor:0});
    log("New player created: "+u);
  } else if(snap.val().password !== p){
    alert("Wrong password"); return;
  }

  user = u;
  localStorage.setItem("arcaneUser", user);
  loginScreen.classList.add("hidden");
  gameUI.classList.remove("hidden");
  if(user!=="Zedd") admin.style.display="none"; else admin.style.display="block";

  loadPlayer();
  loadGuild();
  loadPlayerLeaderboard();
  loadGuildLeaderboard();
  initArena(); // Step 3
};

// =====================
// Load Player
// =====================
function loadPlayer(){
  db.ref("players/"+user).on("value", s => {
    const d = s.val();
    playerName.innerText = user;
    goldCount.innerText = d.gold;
    diamondCount.innerText = d.diamond;
    valorCount.innerText = d.valor;
  });
}

// =====================
// Event Log
// =====================
function log(text){
  eventLog.innerHTML += "<p>"+text+"</p>";
  eventLog.scrollTop = eventLog.scrollHeight;
}

// =====================
// Boss Fight
// =====================
function updateBossBar(){
  const bossBar = document.getElementById("bossBar");
  const bossHPText = document.getElementById("bossHPText");
  bossBar.style.width = (bossHP/maxBossHP*100)+"%";
  bossHPText.innerText = "HP: "+bossHP;
}

function createFloating(text, parent){
  let span = document.createElement("span");
  span.className = "floatingText";
  span.style.left = Math.random()*80 + "%";
  span.innerText = text;
  parent.appendChild(span);
  setTimeout(()=> parent.removeChild(span), 1000);
}

fightBtn.onclick = () => {
  if(bossHP <= 0){ log("Boss defeated! Wait for respawn."); return; }
  bossHP -= 10;
  updateBossBar();
  log("Hit boss! HP: "+bossHP);
  createFloating("+10 Valor +10 Gold", eventLog);

  if(bossHP <= 0){
    db.ref("players/"+user).once("value").then(s=>{
      let d = s.val();
      d.gold += 10; d.valor += 10;
      db.ref("players/"+user).set(d);
    });
    log("🐉 Boss defeated! +10 Gold +10 Valor");
    setTimeout(()=>{
      bossHP = maxBossHP;
      log("A new boss appears!");
      updateBossBar();
    },30000);
  }
};

// =====================
// Training
// =====================
trainBtn.onclick = () => {
  db.ref("players/"+user).once("value").then(s=>{
    let d = s.val();
    d.valor += 10;
    db.ref("players/"+user).set(d);
    log("🏋 Training complete! +10 Valor");
    createFloating("+10 Valor", eventLog);
  });
};

// =====================
// Chat System
// =====================
document.getElementById("sendMsg").onclick = () => {
  const m = document.getElementById("msg").value.trim();
  if(!m) return;
  db.ref("chat").push({u:user,m});
  document.getElementById("msg").value = "";
};

db.ref("chat").on("child_added", s => {
  const d = s.val();
  document.getElementById("chatMessages").innerHTML += `<p>${d.u}: ${d.m}</p>`;
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// =====================
// Guild
// =====================
createGuildBtn.onclick = () => {
  let gName = guildNameInput.value.trim();
  if(!gName) return alert("Enter a guild name");

  db.ref("guilds/"+gName).once("value").then(s=>{
    if(s.exists()) return alert("Guild already exists!");
    db.ref("guilds/"+gName).set({leader:user,members:[user],points:0});
    db.ref("players/"+user+"/guild").set(gName);
    guildInfo.innerText = "Guild: "+gName;
    log("Guild '"+gName+"' created!");
  });
};

joinGuildBtn.onclick = () => {
  let gName = guildNameInput.value.trim();
  if(!gName) return alert("Enter guild name to join");

  db.ref("guilds/"+gName).once("value").then(s=>{
    if(!s.exists()) return alert("Guild does not exist!");
    let data = s.val();
    if(!data.members.includes(user)) data.members.push(user);
    db.ref("guilds/"+gName+"/members").set(data.members);
    db.ref("players/"+user+"/guild").set(gName);
    guildInfo.innerText = "Guild: "+gName;
    log("Joined guild '"+gName+"'!");
  });
};

function loadGuild(){
  db.ref("players/"+user+"/guild").once("value").then(s=>{
    if(s.exists()) guildInfo.innerText = "Guild: "+s.val();
    else guildInfo.innerText = "Not in a guild";
  });
}

// =====================
// Leaderboards
// =====================
function loadPlayerLeaderboard(){
  db.ref("players").once("value").then(snap=>{
    let players = [];
    snap.forEach(p=>{
      let d = p.val();
      players.push({name:p.key, valor:d.valor||0, gold:d.gold||0});
    });
    players.sort((a,b)=>b.valor - a.valor);
    playerLeaderboard.innerHTML = "<strong>Top Players:</strong>";
    players.slice(0,5).forEach((p,i)=>{
      playerLeaderboard.innerHTML += `<p>${i+1}. ${p.name} ⚔ ${p.valor} | 💰 ${p.gold}</p>`;
    });
  });
}

function loadGuildLeaderboard(){
  db.ref("guilds").once("value").then(snap=>{
    let guilds = [];
    snap.forEach(g=>{
      let d = g.val();
      let totalValor = 0;
      if(d.members){
        let promises = d.members.map(m=>{
          return db.ref("players/"+m+"/valor").once("value").then(snap2=>{
            totalValor += snap2.val()||0;
          });
        });
        Promise.all(promises).then(()=>{
          guilds.push({name:g.key, points:totalValor, members:d.members.length});
          guilds.sort((a,b)=>b.points - a.points);
          guildLeaderboard.innerHTML = "<strong>Top Guilds:</strong>";
          guilds.slice(0,5).forEach((g,i)=>{
            guildLeaderboard.innerHTML += `<p>${i+1}. ${g.name} 👥${g.members} ⚔${g.points}</p>`;
          });
        });
      }
    });
  });
}

// =====================
// PvP Arena & Scheduled Boss
// =====================
function spawnScheduledBoss(){
  bossHP = maxBossHP;
  updateBossBar();
  log("🔥 A Scheduled Boss has appeared! Fight now!");
}

function initArena(){
  // PvP fight button
  fightPlayerBtn.onclick = () => {
    const oppName = pvpOpponent.value.trim();
    if(!oppName || oppName === user){ alert("Enter valid opponent"); return; }

    db.ref("players/"+oppName).once("value").then(snap=>{
      if(!snap.exists()){ alert("Opponent does not exist"); return; }
      let opp = snap.val();

      db.ref("players/"+user).once("value").then(snap2=>{
        let me = snap2.val();

        let winner, loser;
        if(Math.random() < 0.5){ winner = user; loser = oppName; } 
        else { winner = oppName; loser = user; }

        db.ref("players/"+winner).once("value").then(s=>{
          let w = s.val();
          w.gold += 20;
          w.valor += 10;
          db.ref("players/"+winner).set(w);
        });

        arenaLog.innerHTML += `<p>🏹 ${winner} defeated ${loser}! +20 Gold +10 Valor</p>`;
        arenaLog.scrollTop = arenaLog.scrollHeight;
      });
    });
  };

  // Spawn initial boss and set interval
  spawnScheduledBoss();
  setInterval(spawnScheduledBoss, 10*60*1000); // every 10 minutes
  }
