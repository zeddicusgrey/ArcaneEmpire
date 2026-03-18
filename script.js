import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, get, set, onDisconnect } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

document.addEventListener("DOMContentLoaded", function(){

  const firebaseConfig = {
    apiKey: "AIzaSyAM8jDGhoaPZF3BieIKkMuJtd64PXPOsxw",
    authDomain: "arcaneempire-31.firebaseapp.com",
    databaseURL: "https://arcaneempire-31-default-rtdb.firebaseio.com",
    projectId: "arcaneempire-31",
    storageBucket: "arcaneempire-31.appspot.com",
    messagingSenderId: "92082426208",
    appId: "1:92082426208:web:be6e451895cc21a04f8e05"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  let player = null;
  const adminCredentials = {username:"Zedd", password:"Arcane123"};

  const loginBtn = document.getElementById("loginBtn");
  const btnTraining = document.getElementById("btnTraining");
  const btnBoss = document.getElementById("btnBoss");
  const btnDungeon = document.getElementById("btnDungeon");
  const btnPvP = document.getElementById("btnPvP");
  const btnShop = document.getElementById("btnShop");
  const btnInventory = document.getElementById("btnInventory");
  const btnLeaderboard = document.getElementById("btnLeaderboard");
  const btnOnlinePlayers = document.getElementById("btnOnlinePlayers");
  const btnProfile = document.getElementById("btnProfile");
  const adminLoginBtn = document.getElementById("adminLoginBtn");

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

  // Login
  loginBtn.onclick = async () => {
    const user = document.getElementById("username").value.trim();
    if(!user) return document.getElementById("loginMsg").textContent="⚠ Enter username!";
    try{
      const playerRef = ref(db, "players/" + user);
      const snapshot = await get(playerRef);
      if(snapshot.exists()){
        player = snapshot.val();
      } else {
        player = {username:user, level:1, xp:0, silver:500, gold:20, attack:10, defense:10, health:50, runes:[], equippedRune:null, amulet:1, valor:0};
        await set(playerRef, player);
      }
      document.getElementById("loginPanel").style.display="none";
      document.getElementById("mainGame").style.display="block";
      updateResources(player);
      showPanel("Training");

      // mark online
      const onlineRef = ref(db, "onlinePlayers/" + player.username);
      await set(onlineRef, true);
      onDisconnect(onlineRef).remove();
    } catch(e){
      console.error(e);
      document.getElementById("loginMsg").textContent="⚠ Error connecting to server!";
    }
  };

  // Navigation
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

  function displayTraining(){
    const content=document.getElementById("gameContent");
    content.innerHTML="<h3>🏋 Training</h3>";
    ["Attack","Health","Defense"].forEach(attr=>{
      const btn=document.createElement("button");
      btn.textContent=`Train ${attr} (100 Silver)`;
      btn.onclick=async ()=>{
        if(player.silver>=100){
          player.silver-=100;
          player[attr.toLowerCase()]+=10;
          await set(ref(db, "players/"+player.username), player);
          updateResources(player);
          log(`✅ Trained ${attr}! +10`);
        } else log("❌ Not enough Silver!");
      };
      content.appendChild(btn);
    });
  }

  function displayBoss(){
    const content=document.getElementById("gameContent");
    const boss={name:"🔥 Fire Lord",health:200,maxHealth:200,attack:15};
    const img=document.createElement("img");
    img.src="https://images.pexels.com/photos/1704481/pexels-photo-1704481.jpeg?w=200";
    img.className="boss"; content.appendChild(img);
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
        set(ref(db, "players/"+player.username), player);
        updateResources(player);
        boss.health=boss.maxHealth; healthBar.style.width="100%";
      }
    };
    content.appendChild(attackBtn);
  }

  function updateInventory(){
    const panel=document.getElementById("inventoryPanel"); panel.style.display="block";
    panel.innerHTML="<h3>🎒 Inventory</h3>";
    panel.innerHTML+=player.runes.length?player.runes.map(r=>r.name).join(", "):"Empty";
  }

  function displayProfile(p){
    const panel=document.getElementById("playerProfilePanel"); panel.style.display="block";
    panel.innerHTML=`<h3>${p.username}</h3>
      <img src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=200" class="avatar">
      <p>Level: ${p.level} | XP: ${p.xp}</p>
      <p>Attack: ${p.attack} | Health: ${p.health} | Defense: ${p.defense}</p>
      <p>Equipped Amulet: ${p.amulet}</p>
      <p>Equipped Runes: ${p.runes.map(r=>r.name).join(", ")||"None"}</p>`;
  }

  function displayOnlinePlayers(){
    const panel=document.getElementById("onlinePlayersPanel"); panel.style.display="block"; panel.innerHTML="";
    get(ref(db,"onlinePlayers")).then(s=>{
      const list=s.val(); 
      for(let u in list){
        const div=document.createElement("div"); div.className="onlinePlayer";
        const img=document.createElement("img"); img.src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=100"; div.appendChild(img);
        const span=document.createElement("span"); span.textContent=u; div.appendChild(span);
        div.onclick=()=>{get(ref(db,"players/"+u)).then(snap=>displayProfile(snap.val()));};
        panel.appendChild(div);
      }
    });
  }

});
