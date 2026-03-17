const socket = io();
let myId = null;
let skillReady = true;
let users = {};

function startGame(){
  let username = document.getElementById("name").value;
  if(!username) username = "Guest"+Math.floor(Math.random()*1000);
  const playerClass = document.getElementById("class").value;
  const guild = document.getElementById("guildName").value || null;

  socket.emit("join",{username,playerClass,guild});
  document.getElementById("game").style.display="block";

  setTimeout(()=>{document.getElementById("save-popup").style.display="block";},5000);
}

function closeSavePopup(){
  document.getElementById("save-popup").style.display="none";
  alert("✅ Account saved and 50 gold added!");
}

function register(){
  const username=document.getElementById("name").value;
  const password=document.getElementById("password").value;
  if(!username||!password) return alert("Enter username & password");
  if(users[username]) return alert("Username exists!");
  users[username]={password};
  alert("✅ Registered!");
}

function login(){
  const username=document.getElementById("name").value;
  const password=document.getElementById("password").value;
  if(!username||!password) return alert("Enter username & password");
  if(!users[username]) return alert("User not found");
  if(users[username].password!==password) return alert("Incorrect password");
  const playerClass=document.getElementById("class").value;
  const guild=document.getElementById("guildName").value||null;
  socket.emit("join",{username,playerClass,guild});
  document.getElementById("game").style.display="block";
  alert("✅ Logged in!");
}

function attack(id){socket.emit("attack",id);}
function skillCooldown(){
  if(!skillReady)return;
  const target=document.querySelector(".target");
  if(!target)return;
  skillReady=false;
  socket.emit("skill",target.dataset.id);
  document.getElementById("skillBtn").disabled=true;
  setTimeout(()=>{skillReady=true;document.getElementById("skillBtn").disabled=false;},5000);
}

socket.on("update",({players,guilds,damage,targetId})=>{
  renderPlayers(players);
  updateLeaderboard(players);
  renderGuilds(guilds);
  renderTasks(players);
  if(damage&&targetId) showDamage(targetId,damage);
});

function renderPlayers(players){
  const div=document.getElementById("players");
  div.innerHTML="";
  myId=Object.keys(players).find(id=>players[id].username===document.getElementById("name").value||id.startsWith("Guest"));
  for(let id in players){
    const p=players[id];
    let percent=(p.hp/p.maxHp)*100;
    div.innerHTML+=`
    <div class="player ${id!==myId?"target":""}" data-id="${id}">
      <b>${p.username}</b> (${p.class})<br>
      <div class="hpbar" style="width:${percent}%"></div>
      💰 ${p.gold} | 💎 ${p.diamonds}<br>
      🎒 ${p.inventory? p.inventory.join(","):""}<br>
      ${id!==myId? `<button onclick="attack('${id}')">Attack</button>`:"<i>You</i>"}
    </div>`;
  }
}

function showDamage(id,dmg){
  const el=document.querySelector(`[data-id='${id}']`);
  if(!el) return;
  const dmgEl=document.createElement("div");
  dmgEl.className="damage";
  dmgEl.innerText="-"+dmg;
  el.appendChild(dmgEl);
  setTimeout(()=>dmgEl.remove(),1000);
}

function updateLeaderboard(players){
  const sorted=Object.values(players).sort((a,b)=>b.gold-a.gold);
  document.getElementById("leaderboard").innerHTML=sorted.map(p=>`${p.username} - ${p.gold}`).join("<br>");
}

function renderGuilds(guilds){
  const div=document.getElementById("guildList");
  div.innerHTML="";
  for(const g in guilds){
    const members = guilds[g].members.length;
    const diamonds = guilds[g].diamonds;
    div.innerHTML+=`<b>${g}</b> - Members: ${members} | 💎 Diamonds: ${diamonds}<br>`;
  }
}

function renderTasks(players){
  const div=document.getElementById("taskList");
  const player=players[myId];
  if(!player) return;
  div.innerHTML="";
  player.tasks.forEach(t=>{
    div.innerHTML+=`${t.task} <button onclick="completeTask(${t.id})">Complete</button><br>`;
  });
}

function completeTask(taskId){ socket.emit("completeTask",taskId); }