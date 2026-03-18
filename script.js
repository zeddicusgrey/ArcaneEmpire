const firebaseConfig = {
  apiKey: "AIzaSyAM8jDGhoaPZF3BieIKkMuJtd64PXPOsxw",
  authDomain: "arcaneempire-31.firebaseapp.com",
  databaseURL: "https://arcaneempire-31-default-rtdb.firebaseio.com",
  projectId: "arcaneempire-31"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let user="";
let bossHP=100;
const maxBossHP=100;

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
