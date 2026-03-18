// Firebase config
var firebaseConfig = {
  apiKey: "AIzaSyAM8jDGhoaPZF3BieIKkMuJtd64PXPOsxw",
  authDomain: "arcaneempire-31.firebaseapp.com",
  databaseURL: "https://arcaneempire-31-default-rtdb.firebaseio.com",
  projectId: "arcaneempire-31",
  storageBucket: "arcaneempire-31.appspot.com",
  messagingSenderId: "92082426208",
  appId: "1:92082426208:web:be6e451895cc21a04f8e05"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();

let player = null;
let boss = { hp:200, max:200 };

// LOGIN
function login(){
  let name = document.getElementById("username").value.trim();

  if(!name){
    document.getElementById("msg").innerText = "Enter name!";
    return;
  }

  db.ref("players/" + name).once("value", function(snapshot){

    if(snapshot.exists()){
      player = snapshot.val();
    }else{
      player = {
        name:name,
        attack:10,
        health:50,
        defense:10,
        silver:500
      };
      db.ref("players/" + name).set(player);
    }

    document.getElementById("loginPanel").style.display = "none";
    document.getElementById("game").style.display = "block";

    update();

    // mark online
    db.ref("online/" + name).set(true);
  });
}

// UPDATE UI
function update(){
  document.getElementById("welcome").innerText = "Welcome " + player.name;

  document.getElementById("stats").innerText =
    "⚔ " + player.attack +
    " ❤️ " + player.health +
    " 🛡 " + player.defense +
    " 💰 " + player.silver;
}

// SAVE
function save(){
  db.ref("players/" + player.name).set(player);
}

// TRAIN
function train(type){
  if(player.silver < 100){
    log("Not enough silver");
    return;
  }

  player.silver -= 100;
  player[type] += 10;

  save();
  update();

  log("Trained " + type);
}

// BOSS
function attackBoss(){
  let dmg = player.attack;
  boss.hp -= dmg;

  if(boss.hp <= 0){
    boss.hp = boss.max;
    player.silver += 50;
    log("Boss defeated! +50 silver");
  }else{
    log("Hit boss for " + dmg + " damage");
  }

  save();
  update();
}

// LOG
function log(text){
  document.getElementById("log").innerText = text;
        }
