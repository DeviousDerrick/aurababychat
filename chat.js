// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYMK_j1QYx-OUdfXAv78PYMMy61C_rTHU",
  authDomain: "aurababychat.firebaseapp.com",
  projectId: "aurababychat",
  storageBucket: "aurababychat.firebasestorage.app",
  messagingSenderId: "302163119026",
  appId: "1:302163119026:web:3f9b15be86d318aac572ab"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Available Profile Pictures Gallery
const availableProfiles = [
  { name: 'AuraBaby', url: 'https://i.ibb.co/Y4L448c1/aurababy.jpg' },
  { name: 'King Darren', url: 'https://i.ibb.co/1YGkQ5M4/kingdarren.jpg' },
  { name: 'Daniel', url: 'https://i.ibb.co/RTwqxcck/daniel.jpg' },
  { name: 'Manuel', url: 'https://i.ibb.co/JRr6BWjb/theonewhocknocks.jpg' },
  { name: 'Grant', url: 'https://i.ibb.co/TqHnrtSp/grant.jpg' },
  { name: 'Joony', url: 'https://i.ibb.co/fd9Kg05w/output.jpg' },
  { name: 'Zoely', url: 'https://i.ibb.co/fVLDq186/zoely.png' },
  { name: 'Lemmet', url: 'https://i.ibb.co/TBmZmYYh/newlemmet.jpg' },
  { name: 'Kelly', url: 'https://i.ibb.co/Xk2DybZg/kelly.jpg' },
  { name: 'Bryce', url: 'https://i.ibb.co/pvgyknnq/bryce.jpg' },
  { name: 'FattieBaby', url: 'https://i.ibb.co/FkyMMCRv/fattiebaby.jpg' },
  { name: 'GoonerBaby', url: 'https://i.ibb.co/b5DH8g26/goonerbaby.jpg' },
  { name: 'Teros', url: 'https://i.ibb.co/Nd6v0WjN/teros.jpg' },
  { name: 'GangstaBaby', url: 'https://i.ibb.co/TM91vD3z/Officalgangstababy.png' },
  { name: 'DarkAbby', url: 'https://i.ibb.co/vCTDWs40/output-1.jpg' },
  { name: 'PoorBaby', url: 'https://i.ibb.co/Nn9v6ZBw/poorbaby.jpg' },
  { name: 'RichBaby', url: 'https://i.ibb.co/DDSNbypf/richbaby.jpg' },
  { name: 'The Baby That Holds Aura', url: 'https://i.ibb.co/Kx8ZSGCB/The-Baby-That-Holds-Aura.jpg' },
  { name: 'JollyBaby', url: 'https://i.ibb.co/bgp5mdQZ/jollybaby.png' },
  { name: 'CupidBaby', url: 'https://i.ibb.co/1GbNb2PX/Untitled-4.png' },
  { name: 'JudgmentBaby', url: 'https://i.ibb.co/TqtxsJ52/judgment.jpg' },
  { name: 'JusticeN', url: 'https://i.ibb.co/dwkHnD65/Justicebaby.jpg' }
];

let userProfilePicture = null;

let username = null;
let isAdmin = localStorage.getItem("isAdmin") === "true";
let blockedUsers = [];
let currentRoom = "General 1";
let currentRoomType = "public";
let unsub = null;
let lastSent = 0;
let cooldownInterval = null;
let selectedFriends = [];
let currentProfileUser = null;
let countingCooldownEnd = 0;
let typingTimeout = null;
let currentlyTyping = new Set();
let userProfilePicture = null;

// SIDEBAR TOGGLE
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
}

// EMOJI PICKER
const emojis = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','🎮','🎯','🎲','🎰','🎸','🎹','🎺','🎻','🥁','🎭','🎨','⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🏑','🥅','⛳','🏹','🎣','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💯','💢','💥','💫','💦','💨','💤','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','💪','🎈','🎉','🎊','🎁','🏆','🥇','🥈','🥉','⭐','🌟','✨','🔥','💧','☀️','🌙','⚡','☁️','🌈','❄️','⛄'];

function toggleEmojiPicker() {
  const picker = document.getElementById('emojiPicker');
  if (picker.style.display === 'none' || !picker.style.display) {
    picker.style.display = 'block';
    renderEmojis();
  } else {
    picker.style.display = 'none';
  }
}

function renderEmojis() {
  const grid = document.getElementById('emojiGrid');
  grid.innerHTML = '';
  emojis.forEach(emoji => {
    const div = document.createElement('div');
    div.className = 'emoji-item';
    div.textContent = emoji;
    div.onclick = () => insertEmoji(emoji);
    grid.appendChild(div);
  });
}

function insertEmoji(emoji) {
  const input = document.getElementById('msgInput');
  input.value += emoji;
  input.focus();
  document.getElementById('emojiPicker').style.display = 'none';
}

document.addEventListener('click', (e) => {
  const picker = document.getElementById('emojiPicker');
  const emojiBtn = document.querySelector('.emoji-btn');
  if (picker && !picker.contains(e.target) && e.target !== emojiBtn) {
    picker.style.display = 'none';
  }
});

// NOTIFICATION SYSTEM
function showNotification(message, type = 'error') {
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// LOGIN/SIGNUP
function toggleSignup() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  if (loginForm.style.display === 'none') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  }
}

async function signup() {
  const user = document.getElementById('signupUsername').value.trim();
  const code = document.getElementById('signupCode').value.trim();
  const confirm = document.getElementById('signupCodeConfirm').value.trim();
  
  if (!user || !code || !confirm) {
    showNotification('Please fill all fields');
    return;
  }
  
  if (user.length < 3) {
    showNotification('Username must be at least 3 characters');
    return;
  }
  
  if (!/^\d{6}$/.test(code)) {
    showNotification('Code must be exactly 6 digits');
    return;
  }
  
  if (code !== confirm) {
    showNotification('Codes do not match');
    return;
  }
  
  const userDoc = await db.collection('users').doc(user).get();
  if (userDoc.exists) {
    showNotification('Username already taken');
    return;
  }
  
  await db.collection('users').doc(user).set({
    code: code,
    createdAt: Date.now()
  });
  
  await db.collection('profiles').doc(user).set({
    bio: "AuraBaby user",
    createdAt: Date.now()
  });
  
  showNotification('Account created! Please login', 'success');
  toggleSignup();
}

async function login() {
  const user = document.getElementById('loginUsername').value.trim();
  const code = document.getElementById('loginCode').value.trim();
  
  if (!user || !code) {
    showNotification('Please fill all fields');
    return;
  }
  
  const userDoc = await db.collection('users').doc(user).get();
  if (!userDoc.exists) {
    showNotification('Username not found');
    return;
  }
  
  const userData = userDoc.data();
  if (userData.code !== code) {
    showNotification('Incorrect code');
    return;
  }
  
  username = user;
  blockedUsers = JSON.parse(localStorage.getItem("blockedUsers_" + username) || "[]");
  localStorage.setItem('username', username);
  localStorage.setItem('userCode', code);
  
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';
  
  initializeApp();
}

window.addEventListener('load', async () => {
  const savedUser = localStorage.getItem('username');
  const savedCode = localStorage.getItem('userCode');
  
  if (savedUser && savedCode) {
    const userDoc = await db.collection('users').doc(savedUser).get();
    if (userDoc.exists && userDoc.data().code === savedCode) {
      username = savedUser;
      blockedUsers = JSON.parse(localStorage.getItem("blockedUsers_" + username) || "[]");
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('mainApp').style.display = 'flex';
      initializeApp();
    }
  }
});

async function initializeApp() {
  document.getElementById("myUsername").textContent = username;
  
  // Load user's profile picture
  const profileDoc = await db.collection("profiles").doc(username).get();
  if (profileDoc.exists && profileDoc.data().profilePicture) {
    userProfilePicture = profileDoc.data().profilePicture;
  }
  
  // Set profile avatar
  const avatarEl = document.getElementById("myAvatar");
  if (userProfilePicture) {
    avatarEl.style.backgroundImage = `url(${userProfilePicture})`;
    avatarEl.style.backgroundSize = 'cover';
    avatarEl.style.backgroundPosition = 'center';
    avatarEl.textContent = '';
  } else {
    avatarEl.textContent = username[0].toUpperCase();
  }

  if (isAdmin) {
    document.getElementById('adminBtn').style.display = 'block';
  }

  startPresence();
  loadPrivateChats();
  loadGroups();
  loadRoom(currentRoom);
  
  // Check for counting cooldown
  const savedCooldown = localStorage.getItem('countingCooldown_' + username);
  if (savedCooldown) {
    countingCooldownEnd = parseInt(savedCooldown);
    if (countingCooldownEnd > Date.now()) {
      startCountingCooldownTimer();
    }
  }
}

// SETTINGS
function openSettings() {
  document.getElementById('settingsPanel').style.display = 'block';
  document.getElementById('settingsOverlay').style.display = 'block';
  
  document.getElementById('showTimestamps').checked = localStorage.getItem('showTimestamps') === 'true';
  document.getElementById('soundEnabled').checked = localStorage.getItem('soundEnabled') === 'true';
  document.getElementById('enterToSend').checked = localStorage.getItem('enterToSend') !== 'false';
  
  loadBlockedUsers();
}

function closeSettings() {
  document.getElementById('settingsPanel').style.display = 'none';
  document.getElementById('settingsOverlay').style.display = 'none';
  
  localStorage.setItem('showTimestamps', document.getElementById('showTimestamps').checked);
  localStorage.setItem('soundEnabled', document.getElementById('soundEnabled').checked);
  localStorage.setItem('enterToSend', document.getElementById('enterToSend').checked);
}

// BLOCKING SYSTEM
function blockUser(user) {
  if (!blockedUsers.includes(user)) {
    blockedUsers.push(user);
    localStorage.setItem("blockedUsers_" + username, JSON.stringify(blockedUsers));
    showNotification(`Blocked ${user}`, 'success');
    loadBlockedUsers();
    loadRoom(currentRoom, currentRoomType);
  }
}

function unblockUser(user) {
  blockedUsers = blockedUsers.filter(u => u !== user);
  localStorage.setItem("blockedUsers_" + username, JSON.stringify(blockedUsers));
  showNotification(`Unblocked ${user}`, 'success');
  loadBlockedUsers();
  loadRoom(currentRoom, currentRoomType);
}

function loadBlockedUsers() {
  const list = document.getElementById('blockedUsersList');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (blockedUsers.length === 0) {
    list.innerHTML = 'No blocked users';
    return;
  }
  
  blockedUsers.forEach(user => {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.innerHTML = `<span>${user}</span>`;
    
    const btn = document.createElement('button');
    btn.textContent = 'Unblock';
    btn.onclick = () => unblockUser(user);
    div.appendChild(btn);
    
    list.appendChild(div);
  });
}

function blockUserFromProfile() {
  if (currentProfileUser && currentProfileUser !== username) {
    if (blockedUsers.includes(currentProfileUser)) {
      unblockUser(currentProfileUser);
    } else {
      blockUser(currentProfileUser);
    }
    closeProfile();
  }
}

// Admin unlock
function adminUnlock() {
  if (isAdmin) {
    showNotification("You're already admin!", 'success');
    return;
  }
  const pass = prompt("Enter admin password:");
  if (pass === "chickenfish67demonlordohio") {
    isAdmin = true;
    localStorage.setItem("isAdmin", "true");
    document.getElementById('adminBtn').style.display = 'block';
    showNotification("Admin unlocked!", 'success');
  } else if (pass) {
    showNotification("Wrong password!");
  }
}

// BANNED SERVER
function openBannedServer() {
  document.getElementById('bannedServerPanel').style.display = 'block';
  document.getElementById('bannedServerOverlay').style.display = 'block';
  loadBannedServer();
}

function closeBannedServer() {
  document.getElementById('bannedServerPanel').style.display = 'none';
  document.getElementById('bannedServerOverlay').style.display = 'none';
}

function loadBannedServer() {
  db.collection("bans").onSnapshot(snapshot => {
    const list = document.getElementById("bannedServerList");
    list.innerHTML = "";
    const now = Date.now();
    let hasBanned = false;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.banUntil > now) {
        hasBanned = true;
        const timeLeft = data.banUntil - now;
        const hours = Math.floor(timeLeft / 3600000);
        const mins = Math.floor((timeLeft % 3600000) / 60000);
        const secs = Math.floor((timeLeft % 60000) / 1000);
        
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerHTML = `<span><strong>${doc.id}</strong> - ${hours}h ${mins}m ${secs}s</span>`;
        list.appendChild(div);
      }
    });
    
    if (!hasBanned) list.innerHTML = "No users currently banned";
  });
}

// BLOCKED USERS PANEL
function openBlockedPanel() {
  document.getElementById('blockedPanel').style.display = 'block';
  document.getElementById('blockedPanelOverlay').style.display = 'block';
  loadBlockedPanel();
}

function closeBlockedPanel() {
  document.getElementById('blockedPanel').style.display = 'none';
  document.getElementById('blockedPanelOverlay').style.display = 'none';
}

function loadBlockedPanel() {
  const list = document.getElementById('blockedPanelList');
  list.innerHTML = '';
  
  if (blockedUsers.length === 0) {
    list.innerHTML = 'No blocked users';
    return;
  }
  
  blockedUsers.forEach(user => {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.innerHTML = `<span>${user}</span>`;
    
    const btn = document.createElement('button');
    btn.textContent = 'Unblock';
    btn.onclick = () => {
      unblockUser(user);
      loadBlockedPanel();
    };
    div.appendChild(btn);
    
    list.appendChild(div);
  });
}

// COOLDOWN
function startCooldown() {
  const timerEl = document.getElementById('cooldownTimer');
  timerEl.style.display = 'block';
  
  let timeLeft = 3;
  timerEl.textContent = `Wait ${timeLeft}s`;
  
  if (cooldownInterval) clearInterval(cooldownInterval);
  
  cooldownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      timerEl.textContent = `Wait ${timeLeft}s`;
    } else {
      timerEl.style.display = 'none';
      clearInterval(cooldownInterval);
    }
  }, 1000);
}

function startCountingCooldownTimer() {
  const timerEl = document.getElementById('cooldownTimer');
  timerEl.style.display = 'block';
  
  if (cooldownInterval) clearInterval(cooldownInterval);
  
  cooldownInterval = setInterval(() => {
    const remaining = countingCooldownEnd - Date.now();
    if (remaining <= 0) {
      timerEl.style.display = 'none';
      clearInterval(cooldownInterval);
      localStorage.removeItem('countingCooldown_' + username);
      countingCooldownEnd = 0;
    } else {
      const hours = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      timerEl.textContent = `Counting cooldown: ${hours}h ${mins}m ${secs}s`;
    }
  }, 1000);
}

// TYPING INDICATORS
function sendTypingIndicator() {
  if (!currentRoom || currentRoomType === 'counting') return;
  
  const path = currentRoomType === 'group' 
    ? `groupChats/${currentRoom}/typing`
    : currentRoomType === 'private'
    ? `privateChats/${currentRoom}/typing`
    : `rooms/${currentRoom}/typing`;
  
  db.collection(path).doc(username).set({
    typing: true,
    timestamp: Date.now()
  });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    db.collection(path).doc(username).delete().catch(() => {});
  }, 3000);
}

function watchTyping(room, type) {
  const path = type === 'group'
    ? `groupChats/${room}/typing`
    : type === 'private'
    ? `privateChats/${room}/typing`
    : `rooms/${room}/typing`;
  
  db.collection(path).onSnapshot(snapshot => {
    currentlyTyping.clear();
    const now = Date.now();
    
    snapshot.forEach(doc => {
      if (doc.id !== username && now - doc.data().timestamp < 4000 && !blockedUsers.includes(doc.id)) {
        currentlyTyping.add(doc.id);
      }
    });
    
    const indicator = document.getElementById('typingIndicator');
    if (currentlyTyping.size > 0) {
      const users = Array.from(currentlyTyping);
      if (users.length === 1) {
        indicator.textContent = `${users[0]} is typing...`;
      } else if (users.length === 2) {
        indicator.textContent = `${users[0]} and ${users[1]} are typing...`;
      } else {
        indicator.textContent = `${users[0]}, ${users[1]}, and ${users.length - 2} others are typing...`;
      }
      indicator.style.display = 'block';
    } else {
      indicator.style.display = 'none';
    }
  });
}

// PRIVATE CHATS
async function openPrivateChat() {
  if (!currentProfileUser || currentProfileUser === username) return;
  
  const users = [username, currentProfileUser].sort();
  const chatId = users.join('_');
  
  await db.collection('privateChats').doc(chatId).set({
    users: users,
    createdAt: Date.now(),
    lastMessage: Date.now()
  }, {merge: true});
  
  closeProfile();
  loadPrivateChats();
  loadRoom(chatId, 'private');
}

function loadPrivateChats() {
  db.collection('privateChats').where('users', 'array-contains', username).onSnapshot(snapshot => {
    const section = document.getElementById('privateChatsSection');
    const list = document.getElementById('privateChatsList');
    
    list.innerHTML = "";
    
    if (snapshot.empty) {
      section.style.display = 'none';
      return;
    }
    
    section.style.display = 'block';
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const otherUser = data.users.find(u => u !== username);
      
      if (blockedUsers.includes(otherUser)) return;
      
      const div = document.createElement('div');
      div.className = 'room';
      div.dataset.room = doc.id;
      div.dataset.type = 'private';
      div.textContent = `💬 ${otherUser}`;
      
      div.onclick = function() {
        document.querySelectorAll('.room').forEach(r => r.classList.remove('active'));
        this.classList.add('active');
        loadRoom(doc.id, 'private');
      };
      
      list.appendChild(div);
    });
  });
}

// MESSAGING
async function checkBan() {
  const banDoc = await db.collection("bans").doc(username).get();
  if (banDoc.exists) {
    const banData = banDoc.data();
    if (banData.banUntil > Date.now()) {
      const timeLeft = Math.ceil((banData.banUntil - Date.now()) / 60000);
      showNotification(`You are banned for ${timeLeft} more minutes`);
      return true;
    } else {
      await db.collection("bans").doc(username).delete();
    }
  }
  return false;
}

async function checkMute() {
  const muteDoc = await db.collection("mutes").doc(username).get();
  if (muteDoc.exists) {
    const muteData = muteDoc.data();
    if (muteData.muteUntil > Date.now()) {
      const timeLeft = Math.ceil((muteData.muteUntil - Date.now()) / 60000);
      showNotification(`You are muted for ${timeLeft} more minutes`);
      return true;
    } else {
      await db.collection("mutes").doc(username).delete();
    }
  }
  return false;
}

async function sendMessage() {
  const now = Date.now();
  
  if (now - lastSent < 3000) {
    const remaining = Math.ceil((3000 - (now - lastSent)) / 1000);
    showNotification(`Wait ${remaining}s`);
    return;
  }
  
  const isBanned = await checkBan();
  if (isBanned) return;
  
  const isMuted = await checkMute();
  if (isMuted) return;
  
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  
  if (!text) return;
  
  if (text.length > 200) {
    showNotification('Message too long! Max 200 characters');
    return;
  }

  // Counting channel logic with 1-hour cooldown
  if (currentRoomType === 'counting') {
    // Check if user is still on cooldown
    if (countingCooldownEnd > now) {
      const remaining = countingCooldownEnd - now;
      const mins = Math.ceil(remaining / 60000);
      showNotification(`You can count again in ${mins} minutes`);
      return;
    }
    
    const num = parseInt(text);
    if (isNaN(num)) {
      showNotification('Counting: numbers only!');
      return;
    }
    
    const countDoc = await db.collection('countingState').doc('current').get();
    const currentCount = countDoc.exists ? countDoc.data().number : 0;
    
    if (num !== currentCount + 1) {
      showNotification(`Wrong! Next is ${currentCount + 1}`);
      return;
    }
    
    await db.collection('countingState').doc('current').set({number: num, user: username, timestamp: Date.now()});
    
    // Set 1-hour cooldown
    countingCooldownEnd = now + 3600000; // 1 hour
    localStorage.setItem('countingCooldown_' + username, countingCooldownEnd.toString());
    startCountingCooldownTimer();
  }
  
  lastSent = now;
  if (currentRoomType !== 'counting') {
    startCooldown();
  }

  const collection = currentRoomType === 'group' 
    ? db.collection("groupChats").doc(currentRoom).collection("messages")
    : currentRoomType === 'counting'
    ? db.collection("rooms").doc("Counting").collection("messages")
    : currentRoomType === 'private'
    ? db.collection("privateChats").doc(currentRoom).collection("messages")
    : db.collection("rooms").doc(currentRoom).collection("messages");

  await collection.add({
    user: username,
    text: text,
    time: firebase.firestore.FieldValue.serverTimestamp()
  });

  input.value = "";
}

// ROOM LOADING - FIXED MESSAGE RENDERING
async function loadRoom(room, type = 'public') {
  if (unsub) unsub();
  currentRoom = room;
  currentRoomType = type;
  
  const collection = type === 'group'
    ? db.collection("groupChats").doc(room).collection("messages")
    : type === 'private'
    ? db.collection("privateChats").doc(room).collection("messages")
    : db.collection("rooms").doc(room).collection("messages");
  
  document.getElementById("messages").innerHTML = "";
  
  // Update header
  if (type === 'group') {
    db.collection("groupChats").doc(room).get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        document.getElementById("roomName").innerHTML = `💬 ${data.name}`;
      }
    });
  } else if (type === 'counting') {
    db.collection('countingState').doc('current').get().then(doc => {
      const count = doc.exists ? doc.data().number : 0;
      document.getElementById("roomName").innerHTML = `🔢 Counting <span style="font-size:14px; opacity:0.8;">(Current: ${count})</span>`;
    });
    
    db.collection('countingState').doc('current').onSnapshot(doc => {
      if (doc.exists && currentRoomType === 'counting') {
        const count = doc.data().number;
        document.getElementById("roomName").innerHTML = `🔢 Counting <span style="font-size:14px; opacity:0.8;">(Current: ${count})</span>`;
      }
    });
  } else if (type === 'private') {
    const users = room.split('_');
    const otherUser = users.find(u => u !== username);
    document.getElementById("roomName").innerHTML = `💬 ${otherUser}`;
  } else {
    document.getElementById("roomName").innerHTML = `🌌 ${room}`;
  }
  
  // Watch typing indicators
  watchTyping(room, type);
  
  const showTimestamps = localStorage.getItem('showTimestamps') === 'true';
  
  unsub = collection.orderBy("time").limitToLast(50).onSnapshot(async snapshot => {
    document.getElementById("messages").innerHTML = "";
    
    for (const doc of snapshot.docs) {
      const m = doc.data();
      
      // Filter blocked users
      if (blockedUsers.includes(m.user)) continue;
      
      const div = document.createElement("div");
      div.className = "message";
      if (m.isAnnouncement) div.classList.add('announcement');
      
      // Avatar with profile image
      const avatar = document.createElement("div");
      avatar.className = "message-avatar";
      const profileImg = m.user !== 'SYSTEM' ? await getUserProfilePicture(m.user) : null;
      
      if (profileImg) {
        avatar.style.backgroundImage = `url(${profileImg})`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
      } else {
        avatar.textContent = m.user === 'SYSTEM' ? '📢' : m.user[0].toUpperCase();
      }
      
      avatar.onclick = () => m.user !== 'SYSTEM' && openUserProfile(m.user);
      div.appendChild(avatar);
      
      // Content
      const content = document.createElement("div");
      content.className = "message-content";
      
      if (m.user !== 'SYSTEM') {
        const usernameSpan = document.createElement("span");
        usernameSpan.className = "username";
        usernameSpan.textContent = m.user;
        usernameSpan.onclick = () => openUserProfile(m.user);
        content.appendChild(usernameSpan);
        
        if (showTimestamps && m.time) {
          const timestamp = document.createElement("span");
          timestamp.className = "timestamp";
          const date = m.time.toDate();
          const hours = date.getHours().toString().padStart(2, '0');
          const mins = date.getMinutes().toString().padStart(2, '0');
          timestamp.textContent = ` ${hours}:${mins}`;
          content.appendChild(timestamp);
        }
      }
      
      const textNode = document.createTextNode(m.user === 'SYSTEM' ? m.text : `: ${m.text}`);
      content.appendChild(textNode);
      
      div.appendChild(content);
      
      if (isAdmin && m.user !== 'SYSTEM') {
        const delBtn = document.createElement("button");
        delBtn.textContent = "×";
        delBtn.className = "delete-btn";
        delBtn.onclick = () => collection.doc(doc.id).delete();
        div.appendChild(delBtn);
      }
      
      document.getElementById("messages").appendChild(div);
    }
    
    // Auto scroll
    const messages = document.getElementById("messages");
    messages.scrollTop = messages.scrollHeight;
    
    // Show notification for new messages if not in focus
    if (document.hidden && localStorage.getItem('soundEnabled') === 'true') {
      playNotificationSound();
    }
  });
}

// Room switching
document.querySelectorAll(".room").forEach(r => {
  r.onclick = function() {
    document.querySelectorAll(".room").forEach(x => x.classList.remove("active"));
    this.classList.add("active");
    loadRoom(this.dataset.room, this.dataset.type);
  };
});

// Online presence
function startPresence() {
  setInterval(() => {
    db.collection("presence").doc(username).set({lastSeen: Date.now()});
  }, 5000);
}

// Notification sound
function playNotificationSound() {
  // Create a simple beep sound
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

// Enter to send
document.getElementById("msgInput").addEventListener("keypress", e => {
  if (e.key === "Enter" && localStorage.getItem('enterToSend') !== 'false') {
    sendMessage();
  }
});

// Typing indicator on input
document.getElementById("msgInput").addEventListener("input", sendTypingIndicator);

// FRIENDS FUNCTIONS
function openFriendsPanel() {
  document.getElementById("friendsPanel").style.display = "block";
  document.getElementById("friendsOverlay").style.display = "block";
  loadFriends();
  loadGroups();
  loadFriendRequests();
}

function closeFriendsPanel() {
  document.getElementById("friendsPanel").style.display = "none";
  document.getElementById("friendsOverlay").style.display = "none";
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  document.getElementById('friendsTab').style.display = tab === 'friends' ? 'block' : 'none';
  document.getElementById('groupsTab').style.display = tab === 'groups' ? 'block' : 'none';
  document.getElementById('profilesTab').style.display = tab === 'profiles' ? 'block' : 'none';
  document.getElementById('addTab').style.display = tab === 'add' ? 'block' : 'none';
  
  if (tab === 'groups') loadFriendsForGroup();
  if (tab === 'profiles') loadProfileGallery();
}

function loadProfileGallery() {
  const gallery = document.getElementById('profileGallery');
  gallery.innerHTML = '';
  
  availableProfiles.forEach(profile => {
    const div = document.createElement('div');
    div.className = 'profile-option';
    if (userProfilePicture === profile.url) {
      div.classList.add('selected');
    }
    
    div.style.backgroundImage = `url(${profile.url})`;
    div.style.backgroundSize = 'cover';
    div.style.backgroundPosition = 'center';
    
    const nameLabel = document.createElement('div');
    nameLabel.className = 'profile-name-label';
    nameLabel.textContent = profile.name;
    div.appendChild(nameLabel);
    
    div.onclick = () => selectProfilePicture(profile.url);
    
    gallery.appendChild(div);
  });
}

async function selectProfilePicture(url) {
  userProfilePicture = url;
  
  // Save to Firestore
  await db.collection('profiles').doc(username).set({
    profilePicture: url
  }, { merge: true });
  
  // Update sidebar avatar
  const avatarEl = document.getElementById("myAvatar");
  avatarEl.style.backgroundImage = `url(${url})`;
  avatarEl.style.backgroundSize = 'cover';
  avatarEl.style.backgroundPosition = 'center';
  avatarEl.textContent = '';
  
  // Reload gallery to show selection
  loadProfileGallery();
  
  showNotification('Profile picture updated!', 'success');
}

async function getUserProfilePicture(user) {
  try {
    const profileDoc = await db.collection('profiles').doc(user).get();
    if (profileDoc.exists && profileDoc.data().profilePicture) {
      return profileDoc.data().profilePicture;
    }
  } catch (e) {
    console.error('Error loading profile picture:', e);
  }
  return null;
}

function loadFriends() {
  db.collection("friends").doc(username).onSnapshot(doc => {
    const list = document.getElementById("friendsList");
    list.innerHTML = "";
    const friends = doc.data() || {};
    
    Object.keys(friends).forEach(friendName => {
      if (friends[friendName] && !blockedUsers.includes(friendName)) {
        const div = document.createElement("div");
        div.className = "friend-item";
        div.textContent = friendName;
        div.onclick = () => openUserProfile(friendName);
        list.appendChild(div);
      }
    });
    if (list.innerHTML === "") list.innerHTML = "No friends yet";
  });
}

function loadGroups() {
  db.collection("groupChats").where("members", "array-contains", username).onSnapshot(snapshot => {
    const list = document.getElementById("groupsList");
    const sidebarList = document.getElementById("groupChatsList");
    const section = document.getElementById("groupChatsSection");
    
    list.innerHTML = "";
    sidebarList.innerHTML = "";
    
    if (snapshot.empty) {
      list.innerHTML = "No groups yet";
      section.style.display = "none";
      return;
    }
    
    section.style.display = "block";
    snapshot.forEach(doc => {
      const data = doc.data();
      
      const div = document.createElement("div");
      div.className = "group-item";
      div.textContent = `${data.name} (${data.members.length})`;
      div.onclick = () => {
        closeFriendsPanel();
        loadRoom(doc.id, 'group');
      };
      list.appendChild(div);
      
      const sideDiv = document.createElement("div");
      sideDiv.className = "room";
      sideDiv.dataset.room = doc.id;
      sideDiv.dataset.type = "group";
      sideDiv.textContent = `💬 ${data.name}`;
      sideDiv.onclick = function() {
        document.querySelectorAll(".room").forEach(r => r.classList.remove("active"));
        this.classList.add("active");
        loadRoom(doc.id, 'group');
      };
      sidebarList.appendChild(sideDiv);
    });
  });
}

function loadFriendsForGroup() {
  db.collection("friends").doc(username).get().then(doc => {
    const list = document.getElementById("friendsSelectList");
    list.innerHTML = "";
    const friends = doc.data() || {};
    selectedFriends = [];
    
    Object.keys(friends).forEach(friendName => {
      if (friends[friendName] && !blockedUsers.includes(friendName)) {
        const div = document.createElement("div");
        div.className = "user-item";
        div.style.cursor = "pointer";
        div.innerHTML = `<span>☐ ${friendName}</span>`;
        div.onclick = function() {
          const idx = selectedFriends.indexOf(friendName);
          if (idx > -1) {
            selectedFriends.splice(idx, 1);
            this.querySelector('span').textContent = `☐ ${friendName}`;
          } else {
            selectedFriends.push(friendName);
            this.querySelector('span').textContent = `☑ ${friendName}`;
          }
        };
        list.appendChild(div);
      }
    });
    if (list.innerHTML === "") list.innerHTML = "No friends to add";
  });
}

function createGroupChat() {
  const groupName = document.getElementById("groupName").value.trim();
  if (!groupName) return showNotification("Enter group name");
  if (selectedFriends.length === 0) return showNotification("Select at least one friend");
  
  const members = [username, ...selectedFriends];
  
  db.collection("groupChats").add({
    name: groupName,
    members: members,
    createdBy: username,
    createdAt: Date.now()
  }).then(() => {
    showNotification(`Group "${groupName}" created!`, 'success');
    document.getElementById("groupName").value = "";
    selectedFriends = [];
    loadGroups();
  });
}

function sendFriendRequest() {
  const friendName = document.getElementById("addFriendUsername").value.trim();
  if (!friendName) return showNotification("Enter username");
  if (friendName === username) return showNotification("Cannot add yourself");
  
  db.collection("friendRequests").add({
    from: username,
    to: friendName,
    timestamp: Date.now(),
    status: "pending"
  }).then(() => {
    showNotification(`Friend request sent to ${friendName}!`, 'success');
    document.getElementById("addFriendUsername").value = "";
  });
}

function loadFriendRequests() {
  db.collection("friendRequests").where("to", "==", username).where("status", "==", "pending")
    .onSnapshot(snapshot => {
      const list = document.getElementById("friendRequests");
      list.innerHTML = "";
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerHTML = `<span>${data.from}</span>`;
        
        const acceptBtn = document.createElement("button");
        acceptBtn.textContent = "✓";
        acceptBtn.style.background = "#10b981";
        acceptBtn.onclick = () => acceptFriendRequest(doc.id, data.from);
        
        const rejectBtn = document.createElement("button");
        rejectBtn.textContent = "×";
        rejectBtn.style.background = "#ef4444";
        rejectBtn.onclick = () => rejectFriendRequest(doc.id);
        
        div.appendChild(acceptBtn);
        div.appendChild(rejectBtn);
        list.appendChild(div);
      });
      
      if (list.innerHTML === "") list.innerHTML = "No pending requests";
    });
}

function acceptFriendRequest(requestId, friendName) {
  db.collection("friends").doc(username).set({[friendName]: true}, {merge: true});
  db.collection("friends").doc(friendName).set({[username]: true}, {merge: true});
  db.collection("friendRequests").doc(requestId).update({status: "accepted"});
  showNotification(`You are now friends with ${friendName}!`, 'success');
}

function rejectFriendRequest(requestId) {
  db.collection("friendRequests").doc(requestId).update({status: "rejected"});
}

// PROFILE FUNCTIONS
function openMyProfile() {
  openUserProfile(username);
}

async function openUserProfile(user) {
  currentProfileUser = user;
  document.getElementById("profileModal").style.display = "block";
  document.getElementById("profileOverlay").style.display = "block";
  
  document.getElementById("profileTitle").textContent = user === username ? "My Profile" : `${user}'s Profile`;
  document.getElementById("profileUsername").textContent = user;
  
  // Set profile avatar with image
  const avatarEl = document.getElementById("profileAvatar");
  const profileImg = await getUserProfilePicture(user);
  if (profileImg) {
    avatarEl.style.backgroundImage = `url(${profileImg})`;
    avatarEl.style.backgroundSize = 'cover';
    avatarEl.style.backgroundPosition = 'center';
    avatarEl.textContent = '';
  } else {
    avatarEl.textContent = user[0].toUpperCase();
    avatarEl.style.backgroundImage = 'none';
  }
  
  const profileDoc = await db.collection("profiles").doc(user).get();
  if (profileDoc.exists) {
    const data = profileDoc.data();
    document.getElementById("profileBio").textContent = data.bio || "AuraBaby user";
  }
  
  const actionsDiv = document.getElementById("profileActions");
  
  if (user === username) {
    actionsDiv.style.display = "none";
  } else {
    actionsDiv.style.display = "block";
    
    const blockBtn = document.getElementById("profileBlockBtn");
    if (blockedUsers.includes(user)) {
      blockBtn.textContent = "UNBLOCK";
    } else {
      blockBtn.textContent = "BLOCK";
    }
    
    db.collection("friends").doc(username).get().then(doc => {
      const friends = doc.data() || {};
      document.getElementById("profileAddFriend").textContent = 
        friends[user] ? "✓ Friends" : "ADD FRIEND";
    });
  }
  
  // Load friends and groups
  db.collection("friends").doc(user).get().then(doc => {
    const list = document.getElementById("profileFriends");
    list.innerHTML = "";
    const friends = doc.data() || {};
    
    Object.keys(friends).forEach(friend => {
      if (friends[friend]) {
        const div = document.createElement("div");
        div.className = "friend-item";
        div.textContent = friend;
        div.onclick = () => openUserProfile(friend);
        list.appendChild(div);
      }
    });
    if (list.innerHTML === "") list.innerHTML = "No friends";
  });
  
  db.collection("groupChats").where("members", "array-contains", user).get().then(snapshot => {
    const list = document.getElementById("profileGroups");
    list.innerHTML = "";
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "group-item";
      div.textContent = data.name;
      list.appendChild(div);
    });
    if (list.innerHTML === "") list.innerHTML = "No groups";
  });
}

function addFriendFromProfile() {
  if (!currentProfileUser) return;
  document.getElementById("addFriendUsername").value = currentProfileUser;
  closeProfile();
  openFriendsPanel();
  switchTab('add');
  sendFriendRequest();
}

function closeProfile() {
  document.getElementById("profileModal").style.display = "none";
  document.getElementById("profileOverlay").style.display = "none";
  currentProfileUser = null;
}

// ADMIN FUNCTIONS
function openAdminPanel() {
  if (!isAdmin) return showNotification("You're not an admin!");
  document.getElementById("adminPanel").style.display = "block";
  document.getElementById("adminOverlay").style.display = "block";
  loadBannedUsers();
  loadMutedUsers();
}

function closeAdminPanel() {
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("adminOverlay").style.display = "none";
}

function banUser() {
  const targetUser = document.getElementById("banUsername").value.trim();
  const duration = parseInt(document.getElementById("banDuration").value);
  if (!targetUser) return showNotification("Enter a username");
  
  db.collection("bans").doc(targetUser).set({
    bannedBy: username,
    banUntil: Date.now() + duration,
    timestamp: Date.now()
  }).then(() => {
    showNotification(`${targetUser} banned!`, 'success');
    document.getElementById("banUsername").value = "";
    loadBannedUsers();
  });
}

function muteUser() {
  const targetUser = document.getElementById("muteUsername").value.trim();
  const duration = parseInt(document.getElementById("muteDuration").value);
  if (!targetUser) return showNotification("Enter a username");
  
  db.collection("mutes").doc(targetUser).set({
    mutedBy: username,
    muteUntil: Date.now() + duration,
    timestamp: Date.now()
  }).then(() => {
    showNotification(`${targetUser} muted!`, 'success');
    document.getElementById("muteUsername").value = "";
    loadMutedUsers();
  });
}

function sendAnnouncement() {
  const text = document.getElementById("announcementText").value.trim();
  const room = document.getElementById("announcementRoom").value;
  if (!text) return showNotification("Enter announcement text");
  
  if (room === 'all') {
    ['General 1', 'General 2', 'General 3'].forEach(r => {
      db.collection("rooms").doc(r).collection("messages").add({
        user: "SYSTEM",
        text: `📢 ${text}`,
        isAnnouncement: true,
        time: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
  } else {
    db.collection("rooms").doc(room).collection("messages").add({
      user: "SYSTEM",
      text: `📢 ${text}`,
      isAnnouncement: true,
      time: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
  
  showNotification("Announcement sent!", 'success');
  document.getElementById("announcementText").value = "";
}

function loadBannedUsers() {
  const list = document.getElementById("bannedList");
  if (!list) return;
  
  db.collection("bans").get().then(snapshot => {
    list.innerHTML = "";
    const now = Date.now();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.banUntil > now) {
        const timeLeft = Math.ceil((data.banUntil - now) / 60000);
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerHTML = `<span>${doc.id} - ${timeLeft}m</span>`;
        
        const btn = document.createElement("button");
        btn.textContent = "Unban";
        btn.onclick = () => {
          db.collection("bans").doc(doc.id).delete();
          loadBannedUsers();
        };
        div.appendChild(btn);
        list.appendChild(div);
      }
    });
    if (list.innerHTML === "") list.innerHTML = "No banned users";
  });
}

function loadMutedUsers() {
  const list = document.getElementById("mutedList");
  if (!list) return;
  
  db.collection("mutes").get().then(snapshot => {
    list.innerHTML = "";
    const now = Date.now();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.muteUntil > now) {
        const timeLeft = Math.ceil((data.muteUntil - now) / 60000);
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerHTML = `<span>${doc.id} - ${timeLeft}m</span>`;
        
        const btn = document.createElement("button");
        btn.textContent = "Unmute";
        btn.onclick = () => {
          db.collection("mutes").doc(doc.id).delete();
          loadMutedUsers();
        };
        div.appendChild(btn);
        list.appendChild(div);
      }
    });
    if (list.innerHTML === "") list.innerHTML = "No muted users";
  });
}
