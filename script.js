// ===== FIREBASE CONFIG =====
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

// ===== GLOBAL =====
let currentUser = null;
let isAdmin = false;

// ===== START =====
document.getElementById("startGameBtn").onclick = () => {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("startGameBtn").style.display = "none";
};

// ===== LOGIN =====
document.getElementById("loginBtn").onclick = () => {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Enter username");

  currentUser = username;
  isAdmin = username.toLowerCase() === "owner";

  db.ref("players/" + username).once("value").then(snap => {
    if (!snap.exists()) {
      db.ref("players/" + username).set({
        gold: 100,
        diamonds: 10,
        valor: 0,
        inventory: []
      });
    }
    loadPlayer();
    openGame();
  });
};

// ===== OPEN GAME =====
function openGame() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("gameUI").classList.remove("hidden");

  if (!isAdmin) document.getElementById("adminTabBtn").style.display = "none";

  setupTabs();
  loadAllSystems();
}

// ===== PLAYER =====
function loadPlayer() {
  db.ref("players/" + currentUser).on("value", snap => {
    const d = snap.val();
    document.getElementById("playerName").innerText = currentUser;
    document.getElementById("goldCount").innerText = d.gold;
    document.getElementById("diamondCount").innerText = d.diamonds;
    document.getElementById("valorCount").innerText = d.valor;

    loadInventory(d.inventory || []);
  });
}

// ===== TABS =====
function setupTabs() {
  document.querySelectorAll(".tabBtn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".tabContent").forEach(c => c.classList.add("hidden"));
      document.getElementById(btn.dataset.tab).classList.remove("hidden");
    };
  });
}

// ===== GAME SYSTEMS =====
function loadAllSystems() {

  // TASKS
  document.getElementById("taskList").innerHTML = `
    <li onclick="addValor(10)">Training (+10 Valor)</li>
    <li onclick="addGold(50)">Daily Boss (+50 Gold)</li>
  `;

  // BOSSES
  document.getElementById("arenaList").innerHTML = `
    <li onclick="addGold(20)">👹 Goblin King</li>
    <li onclick="addGold(100)">🐉 Dragon Lord</li>
  `;

  // RAID
  document.getElementById("raidList").innerHTML = `
    <li onclick="addGold(70)">🔥 Fire Raid</li>
  `;

  // DUNGEON
  document.getElementById("dungeonList").innerHTML = `
    <li onclick="addValor(40)">🏟 Colosseum</li>
  `;

  // STORE
  document.getElementById("weaponShop").innerHTML = `
    <li onclick="buyItem('Sword',50)">⚔ Sword - 50 Gold</li>
  `;
  document.getElementById("amuletShop").innerHTML = `
    <li onclick="buyItem('Amulet',30)">🔮 Amulet - 30 Gold</li>
  `;
  document.getElementById("potionShop").innerHTML = `
    <li onclick="buyItem('Potion',10)">🧪 Potion - 10 Gold</li>
  `;

  // GUILDS
  document.getElementById("guildList").innerHTML = `
    <li>⚔ Warriors</li>
    <li>🧙 Mages</li>
  `;

  loadChat();
  loadForum();
  loadLeaderboard();
  if (isAdmin) loadAdmin();
}

// ===== GAME ACTIONS =====
function addGold(amount) {
  updatePlayer(data => data.gold += amount);
}

function addValor(amount) {
  updatePlayer(data => data.valor += amount);
}

function buyItem(name, cost) {
  updatePlayer(data => {
    if (data.gold < cost) {
      alert("Not enough gold");
      return;
    }
    data.gold -= cost;
    data.inventory.push(name);
  });
}

function updatePlayer(callback) {
  const ref = db.ref("players/" + currentUser);
  ref.once("value").then(snap => {
    let data = snap.val();
    callback(data);
    ref.set(data);
  });
}

// ===== INVENTORY =====
function loadInventory(items) {
  let html = "<h3>Inventory</h3>";
  items.forEach(i => html += `<p>${i}</p>`);
  document.getElementById("playerName").innerHTML = currentUser + html;
}

// ===== CHAT =====
function loadChat() {
  const box = document.getElementById("worldChat");
  db.ref("worldChat").on("child_added", snap => {
    const m = snap.val();
    box.innerHTML += `<p>${m.user}: ${m.message}</p>`;
  });

  document.getElementById("sendWorldMsg").onclick = () => {
    const msg = document.getElementById("worldMessage").value;
    if (!msg) return;
    db.ref("worldChat").push({user: currentUser, message: msg});
    document.getElementById("worldMessage").value = "";
  };
}

// ===== FORUM =====
function loadForum() {
  const box = document.getElementById("forumList");

  db.ref("forum").on("child_added", snap => {
    const m = snap.val();
    box.innerHTML += `<p>${m.user}: ${m.message}</p>`;
  });

  document.getElementById("postForum").onclick = () => {
    const msg = document.getElementById("forumPost").value;
    if (!msg) return;
    db.ref("forum").push({user: currentUser, message: msg});
  };
}

// ===== LEADERBOARD =====
function loadLeaderboard() {
  const list = document.getElementById("arenaLeaderboard");

  db.ref("players").on("value", snap => {
    let players = [];
    snap.forEach(c => players.push({name:c.key,...c.val()}));

    players.sort((a,b)=>b.valor-a.valor);

    list.innerHTML = players.map(p=>`<li>${p.name} - ${p.valor}</li>`).join("");
  });
}

// ===== ADMIN =====
function loadAdmin() {
  const box = document.getElementById("adminControls");

  db.ref("players").on("value", snap => {
    box.innerHTML = "<h3>All Players</h3>";
    snap.forEach(c=>{
      let d=c.val();
      box.innerHTML += `<p>${c.key} | Gold:${d.gold} | Valor:${d.valor}</p>`;
    });
  });
      }
