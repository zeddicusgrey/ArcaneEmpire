// DOM elements
const startGameBtn = document.getElementById('startGameBtn');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const gameUI = document.getElementById('gameUI');

const goldCount = document.getElementById('goldCount');
const diamondCount = document.getElementById('diamondCount');
const valorCount = document.getElementById('valorCount');

const tabButtons = document.querySelectorAll('.tabBtn');
const tabContents = document.querySelectorAll('.tabContent');

// Guilds
const guildList = document.getElementById('guildList');
const guilds = ['St Anthony','St Paul','St John','St Monica','St Augustine','CAS','St Luke','St Mary'];

// Tasks
const taskList = document.getElementById('taskList');
const tasks = [{name:'Daily Quest',reward:10},{name:'Training',reward:5}];

// Arena/Boss
const arenaList = document.getElementById('arenaList');
const arenas = ['Goblin Boss','Dragon Arena','Dark Wizard'];

// Raid
const raidList = document.getElementById('raidList');
const raids = ['Forest Raid','Mountain Raid'];

// Dungeon
const dungeonList = document.getElementById('dungeonList');
const dungeons = ['Colosseum','Ancient Dungeon'];

// Store
const weaponShop = document.getElementById('weaponShop');
const amuletShop = document.getElementById('amuletShop');
const potionShop = document.getElementById('potionShop');
const weapons = ['Sword','Axe','Bow'];
const amulets = ['Amulet of Strength','Amulet of Wisdom'];
const potions = ['Health Potion','Mana Potion'];

// Chat & Forum
const worldChat = document.getElementById('worldChat');
const privateChat = document.getElementById('privateChat');
const forumList = document.getElementById('forumList');

// Leaderboards
const arenaLeaderboard = document.getElementById('arenaLeaderboard');
const strengthLeaderboard = document.getElementById('strengthLeaderboard');
const dungeonLeaderboard = document.getElementById('dungeonLeaderboard');
const valorLeaderboard = document.getElementById('valorLeaderboard');

// Scheduled
const scheduledList = document.getElementById('scheduledList');
const scheduledBattles = ['Dragon Raid - 6PM','Arena Battle - 8PM'];

// Player stats
let gold=0, diamonds=0, valor=0;

// Show login form
startGameBtn.addEventListener('click',()=>{
    startGameBtn.style.display='none';
    loginForm.classList.remove('hidden');
});

// Login/Register
loginBtn.addEventListener('click',()=>{
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if(username && password){
        alert(`Welcome ${username}!`);
        loginForm.classList.add('hidden');
        gameUI.classList.remove('hidden');
        loadGame();
    } else alert('Enter username & password');
});

// Tab navigation
tabButtons.forEach(btn=>{
    btn.addEventListener('click',()=>{
        tabContents.forEach(c=>c.classList.add('hidden'));
        document.getElementById(btn.dataset.tab).classList.remove('hidden');
    });
});

// Load all sections
function loadGame(){
    // Guilds
    guildList.innerHTML='';
    guilds.forEach(g=>{
        const li=document.createElement('li');
        li.textContent=g;
        guildList.appendChild(li);
    });
    // Tasks
    taskList.innerHTML='';
    tasks.forEach(t=>{
        const li=document.createElement('li');
        li.textContent=`${t.name} (+${t.reward} gold)`;
        li.addEventListener('click',()=>completeTask(t));
        taskList.appendChild(li);
    });
    // Arena
    arenaList.innerHTML='';
    arenas.forEach(a=>{
        const li=document.createElement('li');
        li.textContent=a;
        li.addEventListener('click',()=>completeArena(a));
        arenaList.appendChild(li);
    });
    // Raids
    raidList.innerHTML='';
    raids.forEach(r=>{
        const li=document.createElement('li');
        li.textContent=r;
        li.addEventListener('click',()=>completeRaid(r));
        raidList.appendChild(li);
    });
    // Dungeons
    dungeonList.innerHTML='';
    dungeons.forEach(d=>{
        const li=document.createElement('li');
        li.textContent=d;
        li.addEventListener('click',()=>completeDungeon(d));
        dungeonList.appendChild(li);
    });
    // Store
    weaponShop.innerHTML=''; weapons.forEach(i=>{const li=document.createElement('li');li.textContent=i;weaponShop.appendChild(li);});
    amuletShop.innerHTML=''; amulets.forEach(i=>{const li=document.createElement('li');li.textContent=i;amuletShop.appendChild(li);});
    potionShop.innerHTML=''; potions.forEach(i=>{const li=document.createElement('li');li.textContent=i;potionShop.appendChild(li);});
    // Scheduled
    scheduledList.innerHTML=''; scheduledBattles.forEach(b=>{const li=document.createElement('li');li.textContent=b;scheduledList.appendChild(li);});
    // Leaderboards (placeholder)
    arenaLeaderboard.innerHTML='<li>Arena Leaderboard Placeholder</li>';
    strengthLeaderboard.innerHTML='<li>Strength Leaderboard Placeholder</li>';
    dungeonLeaderboard.innerHTML='<li>Dungeon Leaderboard Placeholder</li>';
    valorLeaderboard.innerHTML='<li>Valor Points Leaderboard Placeholder</li>';
}

// Task completion
function completeTask(t){ gold+=t.reward; valor+=Math.floor(t.reward/2); goldCount.textContent=gold; valorCount.textContent=valor; alert(`Completed "${t.name}" +${t.reward} gold +${Math.floor(t.reward/2)} valor`);}
function completeArena(a){ gold+=20; valor+=10; goldCount.textContent=gold; valorCount.textContent=valor; alert(`Won Arena: "${a}" +20 gold +10 valor`);}
function completeRaid(r){ gold+=30; diamonds+=10; goldCount.textContent=gold; diamondCount.textContent=diamonds; alert(`Completed Raid: "${r}" +30 gold +10 diamonds`);}
function completeDungeon(d){ gold+=40; valor+=20; goldCount.textContent=gold; valorCount.textContent=valor; alert(`Completed Dungeon: "${d}" +40 gold +20 valor`);}
