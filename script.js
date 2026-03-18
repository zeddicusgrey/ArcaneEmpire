// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAM8jDGhoaPZF3BieIKkMuJtd64PXPOsxw",
  authDomain: "arcaneempire-31.firebaseapp.com",
  databaseURL: "https://arcaneempire-31-default-rtdb.firebaseio.com",
  projectId: "arcaneempire-31",
  storageBucket: "arcaneempire-31.appspot.com",
  messagingSenderId: "92082426208",
  appId: "1:92082426208:web:be6e451895cc21a04f8e05"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let player=null;
const adminCredentials={username:"Zedd",password:"Arcane123"};

// --- Utility ---
function log(msg){
  const div=document.createElement("div");
  div.textContent=msg;
  div.style.opacity=0;
  document.getElementById("gameContent").prepend(div);
  let op=0; let intv=setInterval(()=>{op+=0.05; div.style.opacity=op;if(op>=1) clearInterval(intv);},30);
  setTimeout(()=>div.remove(),5000);
}
function updateResources(p){
  document.getElementById("resources").textContent=
    `⚪ Silver: ${p.silver} | 💰 Gold: ${p.gold} | 🏅 VP: ${p.valor||0}`;
  document.getElementById("playerInfo").textContent=
    `👤 ${p.username} | Lv:${p.level} | ⚔${p.attack} ❤️${p.health} 🛡${p.defense}`;
}

// --- Login ---
loginBtn.onclick=()=>{
  let user=document.getElementById("username").value.trim();
  if(!user) return document.getElementById("loginMsg").textContent="Enter username!";
  db.ref("players/"+user).once("value").then(s=>{
    if(s.exists()) player=s.val();
    else{
      player={username:user,level:1,xp:0,silver:500,gold:20,attack:10,defense:10,health:50,runes:[],equippedRune:null,amulet:"None",valor:0};
      db.ref("players/"+user).set(player);
    }
    document.getElementById("loginPanel").style.display="none";
    document.getElementById("mainGame").style.display="block";
    updateResources(player);
    showPanel("Training");
    db.ref("onlinePlayers/"+player.username).set(true);
    window.addEventListener("beforeunload",()=>{db.ref("onlinePlayers/"+player.username).remove();});
  });
};

// --- Panel Navigation ---
btnTraining.onclick=()=>showPanel("Training");
btnBoss.onclick=()=>showPanel("Boss");
btnDungeon.onclick=()=>showPanel("Dungeon");
btnPvP.onclick=()=>showPanel("PvP");
btnShop.onclick=()=>showPanel("Shop");
btnInventory.onclick=()=>showPanel("Inventory");
btnLeaderboard.onclick=()=>showPanel("Leaderboard");
btnOnlinePlayers.onclick=()=>showPanel("OnlinePlayers");
btnProfile.onclick=()=>showPanel("Profile");

function showPanel(name){
  const panels=["Training","Boss","Dungeon","PvP","Shop","Inventory","Leaderboard","OnlinePlayers","Profile"];
  panels.forEach(p=>{document.getElementById(p.toLowerCase()+"Panel")?.style.display="none";});
  const content=document.getElementById("gameContent");
  content.innerHTML="";
  switch(name){
    case "Training": displayTraining(); break;
    case "Boss": displayBoss(); break;
    case "Dungeon": displayDungeon(); break;
    case "PvP": displayPvP(); break;
    case "Shop": displayShop(); break;
    case "Inventory": updateInventory(); break;
    case "Leaderboard": displayLeaderboard(); break;
    case "OnlinePlayers": displayOnlinePlayers(); break;
    case "Profile": displayProfile(player); break;
  }
}

// --- Panels ---

// Training
function displayTraining(){
  const content=document.getElementById("gameContent");
  content.innerHTML="<h3>🏋 Training</h3>";
  ["Attack","Health","Defense"].forEach(attr=>{
    const btn=document.createElement("button");
    btn.textContent=`Train ${attr} (100 Silver)`;
    btn.onclick=()=>{
      if(player.silver>=100){
        player.silver-=100;
        player[attr.toLowerCase()]+=10;
        db.ref("players/"+player.username).set(player);
        updateResources(player);
        log(`✅ Trained ${attr}! +10`);
      } else log("❌ Not enough Silver!");
    };
    content.appendChild(btn);
  });
}

// Boss
function displayBoss(){
  const content=document.getElementById("gameContent");
  const boss={name:"🔥 Fire Lord",health:200,maxHealth:200,attack:15};
  const img=document.createElement("img");
  img.src="https://via.placeholder.com/200x200.png?text=Fire+Lord"; img.className="boss";
  content.appendChild(img);
  const healthBarContainer=document.createElement("div"); healthBarContainer.className="healthBarContainer";
  const healthBar=document.createElement("div"); healthBar.className="healthBar"; healthBarContainer.appendChild(healthBar);
  content.appendChild(healthBarContainer);
  const attackBtn=document.createElement("button"); attackBtn.textContent="⚔ Attack Boss";
  attackBtn.onclick=()=>{
    const dmg=Math.max(player.attack-boss.attack*0.1,1);
    boss.health=Math.max(boss.health-dmg,0);
    healthBar.style.width=(boss.health/boss.maxHealth*100)+"%";
    log(`You dealt ${dmg.toFixed(1)} damage to ${boss.name}`);
    if(boss.health<=0){
      log(`🎉 You defeated ${boss.name} and earned 50 Silver!`);
      player.silver+=50;
      db.ref("players/"+player.username).set(player);
      updateResources(player);
      boss.health=boss.maxHealth;
      healthBar.style.width="100%";
    }
  };
  content.appendChild(attackBtn);
}

// Inventory
function updateInventory(){
  const panel=document.getElementById("inventoryPanel"); panel.style.display="block";
  panel.innerHTML="<h3>🎒 Inventory</h3>";
  panel.innerHTML+=player.runes.length?player.runes.map(r=>r.name).join(", "):"Empty";
}

// Profile
function displayProfile(p){
  const panel=document.getElementById("playerProfilePanel"); panel.style.display="block";
  panel.innerHTML=`<h3>${p.username}</h3>
  <img src="https://via.placeholder.com/80.png?text=${p.username[0]}" class="avatar">
  <p>Level: ${p.level} | XP: ${p.xp}</p>
  <p>Attack: ${p.attack} | Health: ${p.health} | Defense: ${p.defense}</p>
  <p>Equipped Amulet: ${p.amulet}</p>
  <p>Equipped Runes: ${p.runes.map(r=>r.name).join(", ")||"None"}</p>`;
}

// Online Players
function displayOnlinePlayers(){
  const panel=document.getElementById("onlinePlayersPanel"); panel.style.display="block"; panel.innerHTML="";
  db.ref("onlinePlayers").once("value").then(s=>{
    const list=s.val(); for(let u in list){
      const div=document.createElement("div"); div.className="onlinePlayer";
      const img=document.createElement("img"); img.src="https://via.placeholder.com/50.png?text="+u[0]; div.appendChild(img);
      const span=document.createElement("span"); span.textContent=u; div.appendChild(span);
      div.onclick=()=>{db.ref("players/"+u).once("value").then(snap=>displayProfile(snap.val()));};
      panel.appendChild(div);
    }
  });
}

// Admin
adminLoginBtn.onclick=()=>{
  const u=document.getElementById("adminUser").value;
  const p=document.getElementById("adminPass").value;
  if(u===adminCredentials.username && p===adminCredentials.password){
    document.getElementById("adminLoginPanel").style.display="none";
    document.getElementById("adminPanel").style.display="block";
    adminLog("✅ Admin logged in!");
  } else document.getElementById("adminLoginMsg").textContent="❌ Invalid credentials!";
};
function adminLog(msg){
  document.getElementById("adminPanel").innerHTML=msg+"<br>"+document.getElementById("adminPanel").innerHTML;
}

// TODO: Next steps for PvP, Dungeon, Shop, full combat, runes upgrades, leaderboards
// --- PvP Arena — Style 2 (Real Combat) ---
function displayPvP(){
  const content = document.getElementById("gameContent");
  content.innerHTML = `<h3>🤝 PvP Arena: Choose an Opponent</h3>`;

  const select = document.createElement("select");
  select.id = "pvpOpponentSelect";
  content.appendChild(select);

  const fightBtn = document.createElement("button");
  fightBtn.textContent = "⚔ Fight Opponent";
  content.appendChild(fightBtn);

  // Load opponents (public)
  db.ref("players").once("value").then(snapshot => {
    let ops = snapshot.val();
    select.innerHTML = `<option value="">-- Select --</option>`;
    for (let u in ops) {
      if (u !== player.username) {
        let p = ops[u];
        select.innerHTML += `<option value="${u}">${p.username} (Lvl ${p.level})</option>`;
      }
    }
  });

  fightBtn.onclick = () => {
    let opponentName = select.value;
    if (!opponentName) return log("⚠️ Pick an opponent first!");

    db.ref("players/"+opponentName).once("value").then(snap => {
      let opponent = snap.val();
      if (!opponent) return log("⚠️ Opponent not found!");

      startPvPCombat(player, opponent);
    });
  };
}

function startPvPCombat(p1, p2) {
  const content = document.getElementById("gameContent");
  content.innerHTML = `<h3>⚔ PvP Combat vs ${p2.username}</h3>`;

  // Display avatars
  const img1 = document.createElement("img");
  img1.src = `https://images.pexels.com/photos/1704481/pexels-photo-1704481.jpeg?w=200`; 
  img1.className = "avatar";
  content.appendChild(img1);

  const img2 = document.createElement("img");
  img2.src = `https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=200`;
  img2.className = "avatar";
  content.appendChild(img2);

  // Health bars
  const p1HealthBar = document.createElement("div");
  p1HealthBar.className = "healthBarContainer";
  const p1Inner = document.createElement("div");
  p1Inner.className = "healthBar"; p1HealthBar.appendChild(p1Inner);
  content.appendChild(p1HealthBar);

  const p2HealthBar = document.createElement("div");
  p2HealthBar.className = "healthBarContainer";
  const p2Inner = document.createElement("div");
  p2Inner.className = "healthBar"; p2HealthBar.appendChild(p2Inner);
  content.appendChild(p2HealthBar);

  // Reset temp health
  let hp1 = p1.health;
  let hp2 = p2.health;

  function getDamage(attacker, defender) {
    let variance = 0.8 + Math.random() * 0.4; 
    let raw = attacker.attack * attacker.amulet * variance - defender.defense * 0.5;
    return Math.max(Math.floor(raw), 1);
  }

  let turn = 1;
  function nextTurn() {
    if (hp1 <= 0 || hp2 <= 0) return endCombat();

    let dmg;
    if (turn % 2 === 1) {
      dmg = getDamage(p1, p2);
      hp2 -= dmg;
      log(`🗡 You hit ${p2.username} for ${dmg} damage`);
    } else {
      dmg = getDamage(p2, p1);
      hp1 -= dmg;
      log(`🛡 ${p2.username} hit you for ${dmg} damage`);
    }
    turn++;

    p1Inner.style.width = Math.max((hp1 / p1.health) * 100, 0) + "%";
    p2Inner.style.width = Math.max((hp2 / p2.health) * 100, 0) + "%";

    setTimeout(nextTurn, 800);
  }

  nextTurn();

  function endCombat() {
    if (hp1 <= 0 && hp2 <= 0) {
      log("🤝 It's a draw!");
      return;
    }
    let winner = hp1 > 0 ? p1 : p2;
    let loser  = hp1 > 0 ? p2 : p1;

    if (winner.username === p1.username) {

      let gainSilver = 50 + p1.level*5;
      let gainXP     = 30 + p1.level*3;
      let gainValor  = 10;

      player.silver  += gainSilver;
      player.xp      += gainXP;
      player.valor   += gainValor;

      db.ref("players/"+player.username).set(player);

      log(`🏆 YOU WON! +${gainSilver} ⚪  +${gainXP} XP +${gainValor} VP`);
      updateResources(player);

    } else {

      let lossXP = Math.floor(p1.xp * 0.10);
      player.xp = Math.max(player.xp - lossXP, 0);
      db.ref("players/"+player.username).set(player);

      log(`💀 YOU LOST! -${lossXP} XP`);
      updateResources(player);
    }
  }
    }
