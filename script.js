const firebaseConfig = {
  apiKey: "AIzaSyAM8jDGhoaPZF3BieIKkMuJtd64PXPOsxw",
  authDomain: "arcaneempire-31.firebaseapp.com",
  databaseURL: "https://arcaneempire-31-default-rtdb.firebaseio.com",
  projectId: "arcaneempire-31"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const pvpOpponent = document.getElementById("pvpOpponent");
const fightPlayerBtn = document.getElementById("fightPlayerBtn");
const arenaLog = document.getElementById("arenaLog");
const scheduledBossInterval = 10*60*1000; // every 10 minutes

function spawnScheduledBoss(){
  bossHP = maxBossHP;
  updateBossBar();
  log("🔥 A Scheduled Boss has appeared! Fight now!");
}

// Automatically spawn boss every interval
setInterval(spawnScheduledBoss, scheduledBossInterval);

// Optional: initial spawn
spawnScheduledBoss();
fightPlayerBtn.onclick = ()=>{
  let oppName = pvpOpponent.value.trim();
  if(!oppName || oppName === user){ alert("Enter valid opponent"); return; }

  db.ref("players/"+oppName).once("value").then(snap=>{
    if(!snap.exists()){ alert("Opponent does not exist"); return; }
    let opp = snap.val();

    db.ref("players/"+user).once("value").then(snap2=>{
      let me = snap2.val();

      // Simple PvP logic: random winner
      let winner, loser;
      if(Math.random() < 0.5){ winner = user; loser = oppName; } else { winner = oppName; loser = user; }

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
let user="";
let bossHP=100;
const maxBossHP=100;
const playerLeaderboard = document.getElementById("playerLeaderboard");
const guildLeaderboard = document.getElementById("guildLeaderboard");

// Load top players by Valor
function loadPlayerLeaderboard() {
  db.ref("players").once("value").then(snap=>{
    let players = [];
    snap.forEach(p=>{
      let d=p.val();
      players.push({name:p.key, valor:d.valor||0, gold:d.gold||0});
    });
    players.sort((a,b)=>b.valor - a.valor); // sort by Valor descending
    playerLeaderboard.innerHTML = "<strong>Top Players:</strong>";
    players.slice(0,5).forEach((p,i)=>{
      playerLeaderboard.innerHTML += `<p>${i+1}. ${p.name} ⚔ ${p.valor} | 💰 ${p.gold}</p>`;
    });
  });
}

// Load top guilds by total member Valor
function loadGuildLeaderboard() {
  db.ref("guilds").once("value").then(snap=>{
    let guilds = [];
    snap.forEach(g=>{
      let d=g.val();
      let totalValor = 0;
      if(d.members) {
        let promises = d.members.map(m=>{
          return db.ref("players/"+m+"/valor").once("value").then(snap2=>{
            totalValor += snap2.val()||0;
          });
        });
        Promise.all(promises).then(()=>{
          guilds.push({name:g.key, points:totalValor, members:d.members.length});
          // Sort & display after all guilds processed
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

// Call leaderboards on login and refresh
loginBtn.onclick = async ()=>{
  /* existing code */
  loadPlayerLeaderboard();
  loadGuildLeaderboard();
};

window.onload = ()=>{
  /* existing code */
  if(savedUser){
    loadPlayerLeaderboard();
    loadGuildLeaderboard();
  }
};

// Optional: refresh every 30 seconds for live updates
setInterval(()=>{
  if(user){
    loadPlayerLeaderboard();
    loadGuildLeaderboard();
  }
}, 30000);
// AUTO CREATE ADMIN
db.ref("players/Zedd").once("value").then(s=>{
  if(!s.exists()){
    db.ref("players/Zedd").set({password:"admin123", gold:500, diamond:50, valor:100});
  }
});

// CHECK SESSION
window.onload = ()=>{
  let savedUser = localStorage.getItem("arcaneUser");
  if(savedUser){
    user=savedUser;
    loginScreen.classList.add("hidden");
    gameUI.classList.remove("hidden");
    if(user!=="Zedd") admin.style.display="none"; else admin.style.display="block";
    loadPlayer();
    log("Welcome back, "+user+"!");
  }
};

// LOGIN
loginBtn.onclick = async ()=>{
  let u=username.value.trim();
  let p=password.value.trim();
  if(!u || !p) return alert("Fill all fields");

  let ref=db.ref("players/"+u);
  let snap=await ref.once("value");

  if(!snap.exists()){
    await ref.set({password:p, gold:100, diamond:5, valor:0});
    log("New player created: "+u);
  } else if(snap.val().password!==p){
    alert("Wrong password"); return;
  }

  user=u;
  localStorage.setItem("arcaneUser",user);
  loginScreen.classList.add("hidden");
  gameUI.classList.remove("hidden");
  if(user!=="Zedd") admin.style.display="none"; else admin.style.display="block";
  loadPlayer();
};

// LOAD PLAYER
function loadPlayer(){
  db.ref("players/"+user).on("value",s=>{
    let d=s.val();
    playerName.innerText=user;
    goldCount.innerText=d.gold;
    diamondCount.innerText=d.diamond;
    valorCount.innerText=d.valor;
  });
}

// EVENT LOG
function log(text){
  eventLog.innerHTML += "<p>"+text+"</p>";
  eventLog.scrollTop = eventLog.scrollHeight;
}

// FIGHT BOSS
fightBtn.onclick = ()=>{
  if(bossHP<=0){ log("Boss defeated! Wait for respawn."); return; }
  bossHP-=10;
  updateBossBar();
  log("Hit boss! HP: "+bossHP);

  // Floating reward text
  createFloating("+10 Valor +10 Gold", eventLog);

  if(bossHP<=0){
    db.ref("players/"+user).once("value").then(s=>{
      let d=s.val();
      d.gold+=10; d.valor+=10;
      db.ref("players/"+user).set(d);
    });
    log("🐉 Boss defeated! +10 Gold +10 Valor");
    setTimeout(()=>{
      bossHP=maxBossHP;
      log("A new boss appears!");
      updateBossBar();
    },30000);
  }
};

function updateBossBar(){
  bossBar.style.width = (bossHP/maxBossHP*100)+"%";
  bossHPText.innerText="HP: "+bossHP;
}

function createFloating(text,parent){
  let span=document.createElement("span");
  span.className="floatingText";
  span.style.left=Math.random()*80+"%";
  span.innerText=text;
  parent.appendChild(span);
  setTimeout(()=>{ parent.removeChild(span); },1000);
}

// TRAINING
trainBtn.onclick = ()=>{
  db.ref("players/"+user).once("value").then(s=>{
    let d=s.val();
    d.valor+=10;
    db.ref("players/"+user).set(d);
    log("🏋 Training complete! +10 Valor");
    createFloating("+10 Valor",eventLog);
  });
};

// STORE
function buyItem(name,cost){
  db.ref("players/"+user).once("value").then(s=>{
    let d=s.val();
    if(d.gold<cost){ alert("Not enough gold!"); return; }
    d.gold-=cost;
    db.ref("players/"+user).set(d);
    log("🛒 Bought "+name+" for "+cost+" gold");
    createFloating("-"+cost+" Gold",eventLog);
  });
}

// CHAT
sendMsg.onclick = ()=>{
  let m=msg.value.trim();
  if(!m) return;
  db.ref("chat").push({u:user,m});
  msg.value="";
};
db.ref("chat").on("child_added",s=>{
  let d=s.val();
  chatMessages.innerHTML += `<p>${d.u}: ${d.m}</p>`;
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// ADMIN PANEL
function loadAdmin(){
  db.ref("players").on("value",snap=>{
    adminPanel.innerHTML="";
    snap.forEach(p=>{
      let d=p.val();
      adminPanel.innerHTML += `<p>${p.key} | Gold:${d.gold} | Diamond:${d.diamond} | Valor:${d.valor}</p>`;
    });
  });
}

// TABS (optional)
