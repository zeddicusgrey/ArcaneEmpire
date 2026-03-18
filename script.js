const firebaseConfig = {
  apiKey: "AIzaSyAM8jDGhoaPZF3BieIKkMuJtd64PXPOsxw",
  authDomain: "arcaneempire-31.firebaseapp.com",
  databaseURL: "https://arcaneempire-31-default-rtdb.firebaseio.com",
  projectId: "arcaneempire-31"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let user="";

// AUTO-CREATE ADMIN (Zedd)
db.ref("players/Zedd").once("value").then(s=>{
  if(!s.exists()){
    db.ref("players/Zedd").set({password:"admin123", gold:500, diamond:50, valor:100});
  }
});

// LOGIN BUTTON
loginBtn.onclick = async ()=>{
  let u=username.value;
  let p=password.value;

  if(!u || !p) return alert("Fill all fields");

  let ref=db.ref("players/"+u);
  let snap=await ref.once("value");

  if(!snap.exists()){
    await ref.set({password:p,gold:100,diamond:5,valor:0});
  } else {
    if(snap.val().password!==p){
      alert("Wrong password");
      return;
    }
  }

  user=u;
  loginScreen.classList.add("hidden");
  gameUI.classList.remove("hidden");

  // SHOW ADMIN TAB ONLY FOR Zedd
  if(u!=="Zedd"){
    admin.style.display="none";
  } else {
    admin.style.display="block";
  }

  loadPlayer();
};

// LOAD PLAYER STATS
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
}

// ACTIONS
function fightBoss(){
  db.ref("players/"+user).once("value").then(s=>{
    let d=s.val();
    d.gold += 100;
    d.valor += 20;
    db.ref("players/"+user).set(d);
    log("🐉 Boss defeated! Gold +100, Valor +20");
  });
}

function train(){
  db.ref("players/"+user).once("value").then(s=>{
    let d=s.val();
    d.valor += 10;
    db.ref("players/"+user).set(d);
    log("🏋 Training complete! Valor +10");
  });
}

// STORE
function buyItem(name,cost){
  db.ref("players/"+user).once("value").then(s=>{
    let d=s.val();
    if(d.gold<cost){
      alert("Not enough gold!");
      return;
    }
    d.gold -= cost;
    db.ref("players/"+user).set(d);
    log("🛒 Bought "+name+" for "+cost+" gold");
  });
}

// CHAT
sendMsg.onclick = ()=>{
  let m=msg.value;
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
      adminPanel.innerHTML += `<p>${p.key} | Gold: ${d.gold} | Diamond: ${d.diamond} | Valor: ${d.valor}</p>`;
    });
  });
}

// TAB SWITCHING
document.querySelectorAll(".tabBtn").forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll(".panel, .center, .chatBox, #admin").forEach(t=>t.classList.add("hidden"));
    let tab=b.dataset.tab;
    if(tab==="arena") document.querySelector(".panel").classList.remove("hidden");
    if(tab==="store") document.querySelectorAll(".panel")[2].classList.remove("hidden");
    if(tab==="chat") document.querySelector(".chatBox").classList.remove("hidden");
    if(tab==="admin") { 
      document.querySelector("#admin").classList.remove("hidden"); 
      loadAdmin(); 
    }
  };
});
