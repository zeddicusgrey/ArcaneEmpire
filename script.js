// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAM8jDGhoaPZF3BieIKkMuJtd64PXPOsxw",
  authDomain: "arcaneempire-31.firebaseapp.com",
  databaseURL: "https://arcaneempire-31-default-rtdb.firebaseio.com",
  projectId: "arcaneempire-31",
  storageBucket: "arcaneempire-31.firebasestorage.app",
  messagingSenderId: "92082426208",
  appId: "1:92082426208:web:be6e451895cc21a04f8e05"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = null;
let isAdmin = false;

// --- Start Game ---
document.getElementById("startGameBtn").onclick = () => {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("startGameBtn").style.display = "none";
};

// --- Login/Register ---
document.getElementById("loginBtn").onclick = () => {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Enter username");
  currentUser = username;
  isAdmin = username.toLowerCase() === "cara";

  triggerDailyEvents(); // 24/7 events

  db.ref("players/" + username).once("value").then(snap => {
    if (!snap.exists()) {
      db.ref("players/" + username).set({gold:100,diamonds:10,valor:0,inventory:[]});
    }
    loadPlayer();
    openGame();
    startTimers(); // start real-time countdowns
  });
};

// --- Trigger Daily Events ---
function triggerDailyEvents(){
  const today = new Date().toDateString();
  db.ref('world/lastEventDate').once('value').then(snap=>{
    if(snap.val() !== today){
      // Boss
      db.ref('world/boss').set({name:'Dragon Lord',health:10000,lastSpawn:Date.now()});
      // Raids
      db.ref('world/raids').set({fireRaid:'available',iceRaid:'available',lastReset:Date.now()});
      // Dungeons
      db.ref('world/dungeons').set({colosseum:'available',darkDungeon:'available',lastReset:Date.now()});
      db.ref('world/lastEventDate').set(today);

      // Daily reward all players
      db.ref('players').once('value').then(players=>{
        players.forEach(p=>{
          p.ref.update({gold:(p.val().gold||0)+50,diamonds:(p.val().diamonds||0)+5});
        });
      });
    }
  });
}

// --- Open Game ---
function openGame() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("gameUI").classList.remove("hidden");
  if(!isAdmin) document.getElementById("adminTabBtn").style.display="none";
  setupTabs();
  loadAllSystems();
}

// --- Load Player Info ---
function loadPlayer(){
  db.ref("players/"+currentUser).on("value",snap=>{
    const d = snap.val();
    document.getElementById("playerName").innerHTML=currentUser+"<br>";
    document.getElementById("goldCount").innerText=d.gold;
    document.getElementById("diamondCount").innerText=d.diamonds;
    document.getElementById("valorCount").innerText=d.valor;
    loadInventory(d.inventory||[]);
  });
}

// --- Tabs Setup ---
function setupTabs(){
  document.querySelectorAll(".tabBtn").forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll(".tabContent").forEach(c=>c.classList.add("hidden"));
      document.getElementById(btn.dataset.tab).classList.remove("hidden");
    };
  });
}

// --- Load All Game Systems ---
function loadAllSystems(){
  document.getElementById("taskList").innerHTML='<li onclick="addValor(10)">Training (+10 Valor)</li><li onclick="addGold(50)">Daily Boss (+50 Gold)</li>';
  document.getElementById("arenaList").innerHTML='<li onclick="addGold(20)">👹 Goblin King</li><li onclick="addGold(100)">🐉 Dragon Lord</li>';
  document.getElementById("raidList").innerHTML='<li onclick="addGold(70)">🔥 Fire Raid</li><li onclick="addGold(70)">❄ Ice Raid</li>';
  document.getElementById("dungeonList").innerHTML='<li onclick="addValor(40)">🏟 Colosseum</li><li onclick="addValor(40)">🌑 Dark Dungeon</li>';
  document.getElementById("weaponShop").innerHTML='<li onclick="buyItem(\'Sword\',50)">⚔ Sword - 50 Gold</li>';
  document.getElementById("amuletShop").innerHTML='<li onclick="buyItem(\'Amulet\',30)">🔮 Amulet - 30 Gold</li>';
  document.getElementById("potionShop").innerHTML='<li onclick="buyItem(\'Potion\',10)">🧪 Potion - 10 Gold</li>';
  document.getElementById("guildList").innerHTML='<li>⚔ Warriors</li><li>🧙 Mages</li>';
  loadChat(); loadForum(); loadLeaderboard(); if(isAdmin) loadAdmin();
}

// --- Game Actions ---
function addGold(amount){updatePlayer(d=>d.gold+=amount);}
function addValor(amount){updatePlayer(d=>d.valor+=amount);}
function buyItem(name,cost){updatePlayer(d=>{if(d.gold<cost){alert("Not enough gold"); return;} d.gold-=cost; d.inventory.push(name);});}
function updatePlayer(cb){db.ref("players/"+currentUser).once("value").then(snap=>{let d=snap.val(); cb(d); db.ref("players/"+currentUser).set(d);});}

// --- Inventory ---
function loadInventory(items){
  let html="";
  items.forEach(i=>html+=`<p>${i}</p>`);
  document.getElementById("playerName").innerHTML=currentUser+"<br>"+html;
}

// --- Chat ---
function loadChat(){
  const box=document.getElementById("worldChat");
  db.ref("worldChat").on("child_added",snap=>{
    const m=snap.val();
    box.innerHTML+=`<p>${m.user}: ${m.message}</p>`;
  });
  document.getElementById("sendWorldMsg").onclick=()=>{
    const msg=document.getElementById("worldMessage").value;
    if(!msg) return;
    db.ref("worldChat").push({user:currentUser,message:msg});
    document.getElementById("worldMessage").value="";
  };
}

// --- Forum ---
function loadForum(){
  const box=document.getElementById("forumList");
  db.ref("forum").on("child_added",snap=>{
    const m=snap.val();
    box.innerHTML+=`<p>${m.user}: ${m.message}</p>`;
  });
  document.getElementById("postForum").onclick=()=>{
    const msg=document.getElementById("forumPost").value;
    if(!msg) return;
    db.ref("forum").push({user:currentUser,message:msg});
    document.getElementById("forumPost").value="";
  };
}

// --- Leaderboard ---
function loadLeaderboard(){
  db.ref("players").on("value",snap=>{
    let players=[];
    snap.forEach(c=>players.push({name:c.key,...c.val()}));
    players.sort((a,b)=>b.valor-a.valor);
    // optional: display somewhere
  });
}

// --- Admin Panel ---
function loadAdmin(){
  const box=document.getElementById("adminControls");
  db.ref("players").on("value",snap=>{
    box.innerHTML="<h3>All Players</h3>";
    snap.forEach(c=>{
      let d=c.val();
      box.innerHTML+=`<p>${c.key} | Gold:${d.gold} | Valor:${d.valor}</p>`;
    });
  });
}

// --- Real-Time Event Timers ---
function startTimers(){
  setInterval(async ()=>{
    const world = await db.ref('world').once('value').then(s=>s.val());
    const now = Date.now();

    // Boss
    if(world.boss){
      const bossDiv=document.getElementById('arenaList');
      const spawnTime = world.boss.lastSpawn || 0;
      const diff = 24*60*60*1000 - (now - spawnTime);
      bossDiv.querySelectorAll('li')[1].innerText = `🐉 Dragon Lord - Respawn in: ${msToTime(diff)}`;
    }

    // Raids
    if(world.raids){
      const raidDiv=document.getElementById('raidList');
      const diff = 6*60*60*1000 - (now - (world.raids.lastReset||0));
      raidDiv.querySelectorAll('li')[0].innerText = `🔥 Fire Raid - Reset in: ${msToTime(diff)}`;
      raidDiv.querySelectorAll('li')[1].innerText = `❄ Ice Raid - Reset in: ${msToTime(diff)}`;
    }

    // Dungeons
    if(world.dungeons){
      const dungeonDiv=document.getElementById('dungeonList');
      const diff = 12*60*60*1000 - (now - (world.dungeons.lastReset||0));
      dungeonDiv.querySelectorAll('li')[0].innerText = `🏟 Colosseum - Reset in: ${msToTime(diff)}`;
      dungeonDiv.querySelectorAll('li')[1].innerText = `🌑 Dark Dungeon - Reset in: ${msToTime(diff)}`;
    }

  },1000);
}

// --- Helper: ms to HH:MM:SS ---
function msToTime(duration){
  if(duration < 0) return "Available!";
  let seconds = Math.floor((duration/1000)%60),
      minutes = Math.floor((duration/(1000*60))%60),
      hours = Math.floor((duration/(1000*60*60))%24);
  return `${hours}h ${minutes}m ${seconds}s`;
    }
