const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

// Players and Guilds
let players = {};
let guilds = {}; // { guildName: { members: [], diamonds: 0 } }

// Tasks
const personalTasks = [
  { id:1, task:"Win 3 battles", reward:{gold:50, coins:10} },
  { id:2, task:"Use skill 5 times", reward:{gold:30, coins:20} }
];
const guildTasks = [
  { id:1, task:"Complete 10 attacks", reward:{diamonds:5} },
  { id:2, task:"Collect 100 gold as guild", reward:{diamonds:10} }
];

// Classes
const classes = {
  Mage: { hp: 80, dmg: 25 },
  Knight: { hp: 120, dmg: 15 },
  Assassin: { hp: 90, dmg: 20 }
};

io.on("connection", (socket) => {

  // Join game
  socket.on("join", ({ username, playerClass, guild }) => {
    const base = classes[playerClass];
    players[socket.id] = {
      username,
      class: playerClass,
      hp: base.hp,
      maxHp: base.hp,
      dmg: base.dmg,
      gold:0,
      coins:0,
      diamonds:0,
      inventory:[],
      guild: guild || null,
      tasks:[...personalTasks]
    };

    if(guild){
      if(!guilds[guild]) guilds[guild]={members:[],diamonds:0};
      guilds[guild].members.push(socket.id);
    }

    io.emit("update",{players,guilds});
  });

  // Attack
  socket.on("attack",(targetId)=>{
    const a = players[socket.id];
    const t = players[targetId];
    if(!a||!t) return;

    let damage = a.dmg;
    t.hp -= damage;

    if(t.hp<=0){
      t.hp = t.maxHp;
      a.gold +=30; a.coins +=15; a.diamonds +=2;
      const items=["Potion","Sword","Gem"];
      a.inventory.push(items[Math.floor(Math.random()*3)]);
      if(a.guild) guilds[a.guild].diamonds +=2;
    }

    io.emit("update",{players,guilds,damage,targetId});
  });

  // Skill
  socket.on("skill",(targetId)=>{
    const a = players[socket.id];
    const t = players[targetId];
    if(!a||!t) return;
    let damage = a.dmg*2;
    t.hp -= damage;
    io.emit("update",{players,guilds,damage,targetId});
  });

  // Complete personal task
  socket.on("completeTask",(taskId)=>{
    const p = players[socket.id];
    if(!p) return;
    const idx = p.tasks.findIndex(t=>t.id===taskId);
    if(idx>-1){
      const reward = p.tasks[idx].reward;
      p.gold += reward.gold||0;
      p.coins += reward.coins||0;
      p.diamonds += reward.diamonds||0;
      p.tasks.splice(idx,1);
      io.emit("update",{players,guilds});
    }
  });

  // Disconnect
  socket.on("disconnect",()=>{
    const p = players[socket.id];
    if(p && p.guild){
      const g = guilds[p.guild];
      if(g) g.members = g.members.filter(id=>id!==socket.id);
    }
    delete players[socket.id];
    io.emit("update",{players,guilds});
  });

});

http.listen(3000,()=>console.log("Arcane Empire server running on port 3000"));