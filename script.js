const firebaseConfig = {
  apiKey: "AIzaSyAM8jDGhoaPZF3BieIKkMuJtd64PXPOsxw",
  authDomain: "arcaneempire-31.firebaseapp.com",
  databaseURL: "https://arcaneempire-31-default-rtdb.firebaseio.com",
  projectId: "arcaneempire-31"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let user="";

loginBtn.onclick = async ()=>{
  let u=username.value;
  let p=password.value;

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

  loadPlayer();
};

function loadPlayer(){
  db.ref("players/"+user).on("value",s=>{
    let d=s.val();
    playerName.innerText=user;
    goldCount.innerText=d.gold;
    diamondCount.innerText=d.diamond;
    valorCount.innerText=d.valor;
  });
}

function fightBoss(){
  db.ref("players/"+user).once("value").then(s=>{
    let d=s.val();
    d.gold+=100;
    d.valor+=20;
    db.ref("players/"+user).set(d);
    log("You defeated a boss!");
  });
}

function train(){
  db.ref("players/"+user).once("value").then(s=>{
    let d=s.val();
    d.valor+=10;
    db.ref("players/"+user).set(d);
    log("Training complete!");
  });
}

function buyItem(name,cost){
  db.ref("players/"+user).once("value").then(s=>{
    let d=s.val();
    if(d.gold<cost) return alert("No gold");
    d.gold-=cost;
    db.ref("players/"+user).set(d);
    log("Bought "+name);
  });
}

function log(text){
  eventLog.innerHTML += "<p>"+text+"</p>";
}

function sendMsg(){
  let m=msg.value;
  if(!m) return;
  db.ref("chat").push({u:user,m});
  msg.value="";
}

db.ref("chat").on("child_added",s=>{
  let d=s.val();
  chatMessages.innerHTML += `<p>${d.u}: ${d.m}</p>`;
});
