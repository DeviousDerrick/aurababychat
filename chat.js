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
const storage = firebase.storage();

let username = null;
let isAdmin = localStorage.getItem("isAdmin") === "true";
let blockedUsers = [];
let userAvatar = null;

// SIDEBAR TOGGLE
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
}

// EMOJI PICKER
const emojis = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🙈','🙉','🙊','💋','💌','💘','💝','💖','💗','💓','💞','💕','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💯','💢','💥','💫','💦','💨','🕳️','💣','💬','👁️','🗨️','🗯️','💭','💤','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','🎮','🎯','🎲','🎰','🎸','🎹','🎺','🎻','🥁','🎭','🎨','🎬','🎤','🎧','🎼','🎵','🎶','🎪','🎡','🎢','🎠','⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🪀','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌'];

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
  updateWordCount();
}

document.addEventListener('click', (e) => {
  const picker = document.getElementById('emojiPicker');
  const emojiBtn = document.querySelector('.emoji-btn');
  if (picker && !picker.contains(e.target) && e.target !== emojiBtn) {
    picker.style.display = 'none';
  }
});

// IMAGE UPLOAD FOR MESSAGES
document.getElementById('imageUpload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showNotification('Image too large! Max 2MB');
    return;
  }
  
  if (!file.type.startsWith('image/')) {
    showNotification('Please select an image file');
    return;
  }
  
  try {
    showNotification('Uploading image...', 'success');
    const storageRef = storage.ref(`chat-images/${Date.now()}_${file.name}`);
    const snapshot = await storageRef.put(file);
    const imageUrl = await snapshot.ref.getDownloadURL();
    
    sendMessage(imageUrl);
    e.target.value = '';
  } catch (error) {
    console.error('Upload error:', error);
    showNotification('Failed to upload image');
  }
});

// AVATAR UPLOAD
document.getElementById('avatarUpload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (file.size > 1 * 1024 * 1024) {
    showNotification('Avatar too large! Max 1MB');
    return;
  }
  
  if (!file.type.startsWith('image/')) {
    showNotification('Please select an image file');
    return;
  }
  
  try {
    showNotification('Uploading avatar...', 'success');
    const storageRef = storage.ref(`avatars/${username}_${Date.now()}`);
    const snapshot = await storageRef.put(file);
    const avatarUrl = await snapshot.ref.getDownloadURL();
    
    await db.collection('profiles').doc(username).update({
      avatar: avatarUrl,
      avatarUpdated: Date.now()
    });
    
    userAvatar = avatarUrl;
    updateAvatarDisplay();
    showNotification('Avatar updated!', 'success');
    e.target.value = '';
  } catch (error) {
    console.error('Avatar upload error:', error);
    showNotification('Failed to upload avatar');
  }
});

function updateAvatarDisplay() {
  if (userAvatar && userAvatar.startsWith('http')) {
    document.getElementById('myAvatarImg').src = userAvatar;
    document.getElementById('myAvatarImg').style.display = 'flex';
    document.getElementById('myAvatar').style.display = 'none';
    
    document.getElementById('settingsAvatar').src = userAvatar;
    document.getElementById('settingsAvatar').style.display = 'flex';
    document.getElementById('settingsAvatarPlaceholder').style.display = 'none';
  } else {
    document.getElementById('myAvatar').textContent = username[0].toUpperCase();
    document.getElementById('settingsAvatarPlaceholder').textContent = username[0].toUpperCase();
  }
}

// IMAGE VIEWER
function openImageViewer(imageUrl) {
  document.getElementById('imageViewerImg').src = imageUrl;
  document.getElementById('imageViewerModal').style.display = 'block';
  document.getElementById('imageViewerOverlay').style.display = 'block';
}

function closeImageViewer() {
  document.getElementById('imageViewerModal').style.display = 'none';
  document.getElementById('imageViewerOverlay').style.display = 'none';
}

// WORD COUNT
function updateWordCount() {
  const input = document.getElementById('msgInput');
  const counter = document.getElementById('wordCounter');
  const words = input.value.trim().split(/\s+/).filter(w => w.length > 0);
  const count = input.value.trim() === '' ? 0 : words.length;
  
  counter.textContent = `${count}/30 words`;
  
  if (count > 30) {
    counter.classList.add('over-limit');
  } else {
    counter.classList.remove('over-limit');
  }
}

document.getElementById('msgInput').addEventListener('input', updateWordCount);

// AUTOSCROLL
function scrollToBottom() {
  if (localStorage.getItem('autoScroll') !== 'false') {
    const messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
  }
}

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

// LOGIN/SIGNUP SYSTEM
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
    createdAt: Date.now(),
    joinTime: Date.now()
  });
  
  await db.collection('profiles').doc(user).set({
    bio: "AuraBaby user",
    avatar: user[0].toUpperCase(),
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
  document.getElementById("myAvatar").textContent = username[0].toUpperCase();

  // Load user profile
  const profileDoc = await db.collection("profiles").doc(username).get();
  if (profileDoc.exists) {
    const profileData = profileDoc.data();
    userAvatar = profileData.avatar;
    updateAvatarDisplay();
  }

  db.collection("users").doc(username).get().then(doc => {
    const joinTime = doc.data().joinTime || Date.now();
    localStorage.setItem("joinTime", joinTime);
    updateMyTime();
  });

  if (isAdmin) {
    document.getElementById('adminBtn').style.display = 'block';
  }

  applySettings();
  startPresence();
  loadPrivateChats();
  loadGroups();
  loadRoom(currentRoom);
  checkBan();
  loadBlockedUsers();
}

// SETTINGS MANAGEMENT
function applySettings() {
  const fontSize = localStorage.getItem('fontSize') || 'medium';
  const density = localStorage.getItem('messageDensity') || 'normal';
  
  document.body.className = '';
  if (fontSize === 'small') document.body.classList.add('font-small');
  if (fontSize === 'large') document.body.classList.add('font-large');
  if (density === 'compact') document.body.classList.add('density-compact');
  if (density === 'comfortable') document.body.classList.add('density-comfortable');
}

document.getElementById('fontSize')?.addEventListener('change', (e) => {
  localStorage.setItem('fontSize', e.target.value);
  applySettings();
});

document.getElementById('messageDensity')?.addEventListener('change', (e) => {
  localStorage.setItem('messageDensity', e.target.value);
  applySettings();
});

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

// Admin unlock function
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

// Time tracking
function formatTime(ms) {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ${mins % 60}m`;
}

function updateMyTime() {
  const joinTime = parseInt(localStorage.getItem("joinTime")) || Date.now();
  const elapsed = Date.now() - joinTime;
  document.getElementById("myTime").textContent = `⏱️ ${formatTime(elapsed)}`;
  
  db.collection("userTimes").doc(username).set({
    totalTime: elapsed,
    lastUpdate: Date.now()
  }, {merge: true});
}

setInterval(updateMyTime, 1000);

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

// LEADERBOARD
function openLeaderboard() {
  document.getElementById('leaderboardPanel').style.display = 'block';
  document.getElementById('leaderboardOverlay').style.display = 'block';
  loadLeaderboard();
}

function closeLeaderboard() {
  document.getElementById('leaderboardPanel').style.display = 'none';
  document.getElementById('leaderboardOverlay').style.display = 'none';
}

function loadLeaderboard() {
  db.collection("userTimes").orderBy("totalTime", "desc").limit(10).get().then(snapshot => {
    const list = document.getElementById('leaderboardList');
    list.innerHTML = "";
    
    snapshot.forEach((doc, idx) => {
      const data = doc.data();
      const div = document.createElement('div');
      div.className = 'leaderboard-item';
      
      const rank = document.createElement('div');
      rank.className = 'leaderboard-rank';
      if (idx === 0) rank.classList.add('gold');
      else if (idx === 1) rank.classList.add('silver');
      else if (idx === 2) rank.classList.add('bronze');
      rank.textContent = idx + 1;
      
      const info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML = `<div>${doc.id}</div><div style="font-size:11px; opacity:0.7;">${formatTime(data.totalTime)}</div>`;
      
      div.appendChild(rank);
      div.appendChild(info);
      list.appendChild(div);
    });
    
    if (list.innerHTML === "") list.innerHTML = "No data yet";
  });
}

// ONLINE USERS
function openOnlineUsers() {
  document.getElementById('onlineUsersPanel').style.display = 'block';
  document.getElementById('onlineUsersOverlay').style.display = 'block';
  loadOnlineUsersList();
}

function closeOnlineUsers() {
  document.getElementById('onlineUsersPanel').style.display = 'none';
  document.getElementById('onlineUsersOverlay').style.display = 'none';
}

function loadOnlineUsersList() {
  db.collection("presence").get().then(snapshot => {
    const list = document.getElementById('onlineUsersList');
    list.innerHTML = "";
    const now = Date.now();
    
    snapshot.forEach(doc => {
      if (now - doc.data().lastSeen < 7000) {
        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `<span>${doc.id}</span>`;
        
        if (doc.id !== username) {
          const btn = document.createElement('button');
          btn.textContent = 'Profile';
          btn.onclick = () => {
            closeOnlineUsers();
            openUserProfile(doc.id);
          };
          div.appendChild(btn);
        }
        
        list.appendChild(div);
      }
    });
    
    if (list.innerHTML === "") list.innerHTML = "No users online";
  });
}

// NOTIFICATIONS
const unreadCounts = {};

function updateNotifications() {
  document.querySelectorAll('.room').forEach(room => {
    const roomName = room.dataset.room;
    const isActive = room.classList.contains('active');
    
    if (!isActive && unreadCounts[roomName] > 0) {
      let badge = room.querySelector('.notification-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'notification-badge';
        room.appendChild(badge);
      }
      badge.textContent = unreadCounts[roomName] > 99 ? '99+' : unreadCounts[roomName];
    } else {
      const badge = room.querySelector('.notification-badge');
      if (badge) badge.remove();
    }
  });
}

// TYPING INDICATOR
let typingTimeout;
let currentlyTyping = new Set();

function sendTypingIndicator() {
  if (!currentRoom || currentRoomType === 'counting') return;
  if (localStorage.getItem('showTyping') === 'false') return;
  
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
    db.collection(path).doc(username).delete();
  }, 3000);
}

function watchTyping(room, type) {
  if (localStorage.getItem('showTyping') === 'false') return;
  
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
    } else {
      indicator.textContent = "";
    }
  });
}

document.getElementById('msgInput').addEventListener('input', sendTypingIndicator);

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
      
      db.collection('streaks').doc(doc.id).get().then(streakDoc => {
        if (streakDoc.exists) {
          const streak = streakDoc.data().streak || 0;
          if (streak > 0) {
            const badge = document.createElement('span');
            badge.className = 'streak-badge';
            badge.textContent = `🔥 ${streak}`;
            badge.style.fontSize = '9px';
            badge.style.marginLeft = '4px';
            div.appendChild(badge);
          }
        }
      });
      
      div.onclick = function() {
        document.querySelectorAll('.room').forEach(r => r.classList.remove('active'));
        this.classList.add('active');
        loadRoom(doc.id, 'private');
      };
      
      list.appendChild(div);
    });
  });
}

// STREAK SYSTEM
async function updateStreak(chatId) {
  const streakDoc = await db.collection('streaks').doc(chatId).get();
  const now = Date.now();
  const oneDayMs = 86400000;
  
  if (streakDoc.exists) {
    const data = streakDoc.data();
    const lastChat = data.lastChat || 0;
    const timeDiff = now - lastChat;
    
    if (timeDiff < oneDayMs) {
      return;
    } else if (timeDiff < oneDayMs * 2) {
      await db.collection('streaks').doc(chatId).update({
        streak: (data.streak || 0) + 1,
        lastChat: now
      });
    } else {
      await db.collection('streaks').doc(chatId).set({
        streak: 1,
        lastChat: now
      });
    }
  } else {
    await db.collection('streaks').doc(chatId).set({
      streak: 1,
      lastChat: now
    });
  }
}

// THEMES
const themes = [
  {name: 'Galaxy Purple', bg: 'linear-gradient(135deg, #0a0e27 0%, #1a0b2e 50%, #160b28 100%)', primary: '#667eea', secondary: '#764ba2', accent: '#f093fb'},
  {name: 'Ocean Blue', bg: 'linear-gradient(135deg, #0a1628 0%, #0e2747 50%, #1a3a52 100%)', primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa'},
  {name: 'Forest Green', bg: 'linear-gradient(135deg, #0a1e0a 0%, #0f2e0f 50%, #1a3a1a 100%)', primary: '#10b981', secondary: '#059669', accent: '#34d399'},
  {name: 'Sunset Orange', bg: 'linear-gradient(135deg, #2e1a0a 0%, #3d220e 50%, #4d2a12 100%)', primary: '#f97316', secondary: '#ea580c', accent: '#fb923c'},
  {name: 'Rose Pink', bg: 'linear-gradient(135deg, #2e0a1e 0%, #3d0e28 50%, #4d1232 100%)', primary: '#ec4899', secondary: '#db2777', accent: '#f472b6'},
  {name: 'Cyberpunk', bg: 'linear-gradient(135deg, #0a0e1e 0%, #1a0b2e 50%, #2e0b3e 100%)', primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee'}
];

function renderThemes() {
  const container = document.getElementById('themeOptions');
  themes.forEach((theme, idx) => {
    const div = document.createElement('div');
    div.className = 'theme-option';
    div.innerHTML = `
      <div class="theme-preview" style="background: ${theme.primary}"></div>
      <div style="flex:1;">
        <div>${theme.name}</div>
      </div>
    `;
    div.onclick = () => applyTheme(theme, idx);
    container.appendChild(div);
  });
  
  const saved = localStorage.getItem('theme');
  if (saved) {
    const theme = themes[parseInt(saved)];
    if (theme) applyTheme(theme, parseInt(saved), false);
  }
}

function applyTheme(theme, idx, save = true) {
  document.documentElement.style.setProperty('--bg-gradient', theme.bg);
  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--secondary-color', theme.secondary);
  document.documentElement.style.setProperty('--accent-color', theme.accent);
  
  document.querySelectorAll('.theme-option').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });
  
  if (save) {
    localStorage.setItem('theme', idx);
    showNotification(`Theme "${theme.name}" applied!`, 'success');
  }
}

renderThemes();

// SETTINGS
function openSettings() {
  document.getElementById('settingsPanel').style.display = 'block';
  document.getElementById('settingsOverlay').style.display = 'block';
  
  document.getElementById('showTimestamps').checked = localStorage.getItem('showTimestamps') !== 'false';
  document.getElementById('soundEnabled').checked = localStorage.getItem('soundEnabled') === 'true';
  document.getElementById('messageProtection').checked = localStorage.getItem('messageProtection') === 'true';
  document.getElementById('autoScroll').checked = localStorage.getItem('autoScroll') !== 'false';
  document.getElementById('showAvatars').checked = localStorage.getItem('showAvatars') !== 'false';
  document.getElementById('compactMode').checked = localStorage.getItem('compactMode') === 'true';
  document.getElementById('showTyping').checked = localStorage.getItem('showTyping') !== 'false';
  document.getElementById('enterToSend').checked = localStorage.getItem('enterToSend') !== 'false';
  document.getElementById('fontSize').value = localStorage.getItem('fontSize') || 'medium';
  document.getElementById('messageDensity').value = localStorage.getItem('messageDensity') || 'normal';
  
  loadBlockedUsers();
}

function closeSettings() {
  document.getElementById('settingsPanel').style.display = 'none';
  document.getElementById('settingsOverlay').style.display = 'none';
  
  localStorage.setItem('showTimestamps', document.getElementById('showTimestamps').checked);
  localStorage.setItem('soundEnabled', document.getElementById('soundEnabled').checked);
  localStorage.setItem('messageProtection', document.getElementById('messageProtection').checked);
  localStorage.setItem('autoScroll', document.getElementById('autoScroll').checked);
  localStorage.setItem('showAvatars', document.getElementById('showAvatars').checked);
  localStorage.setItem('compactMode', document.getElementById('compactMode').checked);
  localStorage.setItem('showTyping', document.getElementById('showTyping').checked);
  localStorage.setItem('enterToSend', document.getElementById('enterToSend').checked);
  
  applySettings();
}

function updateBio() {
  const bio = document.getElementById('bioInput').value.trim();
  if (!bio) return showNotification('Enter a bio');
  
  db.collection('profiles').doc(username).update({bio: bio}).then(() => {
    showNotification('Bio updated!', 'success');
    document.getElementById('bioInput').value = '';
  });
}

// Color presets for tags
const tagColors = [
  {name: 'Purple', bg: '#8b5cf6', text: '#fff'},
  {name: 'Pink', bg: '#ec4899', text: '#fff'},
  {name: 'Blue', bg: '#3b82f6', text: '#fff'},
  {name: 'Green', bg: '#10b981', text: '#fff'},
  {name: 'Red', bg: '#ef4444', text: '#fff'},
  {name: 'Gold', bg: '#f59e0b', text: '#000'},
  {name: 'Cyan', bg: '#06b6d4', text: '#fff'},
  {name: 'Orange', bg: '#f97316', text: '#fff'}
];

let selectedColor = tagColors[0];

const colorPicker = document.getElementById('tagColorPicker');
if (colorPicker) {
  tagColors.forEach((color, idx) => {
    const div = document.createElement('div');
    div.className = 'color-option' + (idx === 0 ? ' selected' : '');
    div.style.background = color.bg;
    div.onclick = () => {
      document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      selectedColor = color;
    };
    colorPicker.appendChild(div);
  });
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

function kickUser() {
  const targetUser = document.getElementById("kickUsername").value.trim();
  if (!targetUser) return showNotification("Enter a username");
  
  db.collection("kicks").doc(targetUser).set({
    kickedBy: username,
    timestamp: Date.now()
  }).then(() => {
    showNotification(`${targetUser} kicked!`, 'success');
    document.getElementById("kickUsername").value = "";
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

async function clearRoomMessages() {
  const room = document.getElementById("clearRoom").value;
  if (!confirm(`Clear all messages in ${room}?`)) return;
  
  const messages = await db.collection("rooms").doc(room).collection("messages").get();
  const batch = db.batch();
  messages.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  showNotification(`${room} messages cleared!`, 'success');
}

function changeUsername() {
  const targetUser = document.getElementById("targetUsername").value.trim();
  const newTag = document.getElementById("newTag").value.trim();
  if (!targetUser || !newTag) return showNotification("Enter both fields");
  
  db.collection("usernameTags").doc(targetUser).set({
    displayName: newTag,
    changedBy: username,
    timestamp: Date.now()
  }).then(() => {
    showNotification(`Tag changed: ${targetUser} → ${newTag}`, 'success');
    document.getElementById("targetUsername").value = "";
    document.getElementById("newTag").value = "";
  });
}

function assignSpecialTag() {
  const targetUser = document.getElementById("specialTagUser").value.trim();
  const tagText = document.getElementById("specialTagText").value.trim();
  if (!targetUser || !tagText) return showNotification("Enter both fields");
  
  db.collection("specialTags").doc(targetUser).set({
    tag: tagText,
    bgColor: selectedColor.bg,
    textColor: selectedColor.text,
    assignedBy: username,
    timestamp: Date.now()
  }).then(() => {
    showNotification(`Special tag assigned to ${targetUser}!`, 'success');
    document.getElementById("specialTagUser").value = "";
    document.getElementById("specialTagText").value = "";
  });
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
        div.innerHTML = `<span>${doc.id} - ${timeLeft > 1440 ? Math.ceil(timeLeft/1440) + "d" : timeLeft + "m"}</span>`;
        
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

// FRIENDS FUNCTIONS
let selectedFriends = [];

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
  document.getElementById('addTab').style.display = tab === 'add' ? 'block' : 'none';
  
  if (tab === 'groups') loadFriendsForGroup();
  if (tab === 'add') loadOnlinePlayers();
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
        acceptBtn.textContent = "Accept";
        acceptBtn.onclick = () => acceptFriendRequest(doc.id, data.from);
        
        const rejectBtn = document.createElement("button");
        rejectBtn.textContent = "Reject";
        rejectBtn.style.background = "linear-gradient(135deg, #ff416c, #ff4b2b)";
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

function loadOnlinePlayers() {
  db.collection("presence").get().then(snapshot => {
    const list = document.getElementById("onlinePlayersList");
    list.innerHTML = "";
    const now = Date.now();
    
    snapshot.forEach(doc => {
      if (now - doc.data().lastSeen < 7000 && doc.id !== username && !blockedUsers.includes(doc.id)) {
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerHTML = `<span>${doc.id}</span>`;
        
        const btn = document.createElement("button");
        btn.textContent = "Add";
        btn.onclick = () => {
          document.getElementById("addFriendUsername").value = doc.id;
          sendFriendRequest();
        };
        div.appendChild(btn);
        list.appendChild(div);
      }
    });
    if (list.innerHTML === "") list.innerHTML = "No players online";
  });
}

// PROFILE FUNCTIONS
let currentProfileUser = null;

function openMyProfile() {
  openUserProfile(username);
}

async function openUserProfile(user) {
  currentProfileUser = user;
  document.getElementById("profileModal").style.display = "block";
  document.getElementById("profileOverlay").style.display = "block";
  
  document.getElementById("profileTitle").textContent = user === username ? "My Profile" : `${user}'s Profile`;
  document.getElementById("profileUsername").textContent = user;
  
  // Load profile data
  const profileDoc = await db.collection("profiles").doc(user).get();
  if (profileDoc.exists) {
    const data = profileDoc.data();
    document.getElementById("profileBio").textContent = data.bio || "AuraBaby user";
    
    if (data.avatar && data.avatar.startsWith('http')) {
      document.getElementById("profileAvatarImg").src = data.avatar;
      document.getElementById("profileAvatarImg").style.display = 'flex';
      document.getElementById("profileAvatar").style.display = 'none';
    } else {
      document.getElementById("profileAvatar").textContent = user[0].toUpperCase();
      document.getElementById("profileAvatarImg").style.display = 'none';
      document.getElementById("profileAvatar").style.display = 'flex';
    }
  }
  
  const userDoc = await db.collection("users").doc(user).get();
  if (userDoc.exists) {
    const userJoinTime = userDoc.data().joinTime || Date.now();
    const elapsed = Date.now() - userJoinTime;
    document.getElementById("profileTimeSpent").textContent = `⏱️ Time: ${formatTime(elapsed)}`;
  }
  
  const actionsDiv = document.getElementById("profileActions");
  const blockBtn = document.getElementById("profileBlockBtn");
  
  if (user === username) {
    actionsDiv.style.display = "none";
    document.getElementById("profileStreakSection").style.display = "none";
  } else {
    actionsDiv.style.display = "block";
    
    if (blockedUsers.includes(user)) {
      blockBtn.textContent = "UNBLOCK";
      blockBtn.onclick = () => {
        unblockUser(user);
        closeProfile();
      };
    } else {
      blockBtn.textContent = "BLOCK";
      blockBtn.onclick = blockUserFromProfile;
    }
    
    db.collection("friends").doc(username).get().then(doc => {
      const friends = doc.data() || {};
      document.getElementById("profileAddFriend").textContent = 
        friends[user] ? "✓ Friends" : "ADD FRIEND";
    });
    
    const users = [username, user].sort();
    const chatId = users.join('_');
    db.collection('streaks').doc(chatId).get().then(streakDoc => {
      if (streakDoc.exists) {
        const streak = streakDoc.data().streak || 0;
        if (streak > 0) {
          document.getElementById('profileStreakSection').style.display = 'block';
          document.getElementById('profileStreak').textContent = `🔥 ${streak} day${streak !== 1 ? 's' : ''}`;
        } else {
          document.getElementById('profileStreakSection').style.display = 'none';
        }
      } else {
        document.getElementById('profileStreakSection').style.display = 'none';
      }
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

// MESSAGING
async function checkBan() {
  const banDoc = await db.collection("bans").doc(username).get();
  if (banDoc.exists) {
    const banData = banDoc.data();
    if (banData.banUntil > Date.now()) {
      const timeLeft = Math.ceil((banData.banUntil - Date.now()) / 60000);
      showNotification(`You are banned for ${timeLeft} more minutes`);
      document.getElementById("msgInput").disabled = true;
      document.getElementById("msgInput").placeholder = "You are banned";
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

async function getDisplayName(user) {
  const tagDoc = await db.collection("usernameTags").doc(user).get();
  if (tagDoc.exists) return tagDoc.data().displayName;
  return user;
}

async function getSpecialTag(user) {
  const tagDoc = await db.collection("specialTags").doc(user).get();
  if (tagDoc.exists) return tagDoc.data();
  return null;
}

async function getUserAvatar(user) {
  const profileDoc = await db.collection("profiles").doc(user).get();
  if (profileDoc.exists && profileDoc.data().avatar) {
    return profileDoc.data().avatar;
  }
  return null;
}

let lastSent = 0;
let cooldownInterval = null;

function filterText(text) {
  const cleanText = text.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
  
  const badWords = [
    /p+o+r+n+/gi, /t+i+t+s+/gi, /b+o+o+b+s+/gi, /a+s+s+/gi, /s+e+x+/gi, /p+e+n+i+s+/gi, 
    /d+i+c+k+/gi, /c+o+c+k+/gi, /p+u+s+s+y+/gi, /v+a+g+i+n+a+/gi, /c+u+m+/gi, /h+o+r+n+y+/gi,
    /n+u+d+e+/gi, /n+a+k+e+d+/gi, /r+a+p+e+/gi, /m+o+l+e+s+t+/gi, /p+e+d+o+/gi,
    /f+u+c+k+/gi, /s+h+i+t+/gi, /b+i+t+c+h+/gi, /n+i+g+g+a+/gi, /n+i+g+g+e+r+/gi, /n+i+g+a+/gi,
    /f+a+g+/gi, /r+e+t+a+r+d+/gi, /w+h+o+r+e+/gi, /s+l+u+t+/gi, /c+u+n+t+/gi,
    /a+s+s+h+o+l+e+/gi, /b+a+s+t+a+r+d+/gi, /d+a+m+n+/gi
  ];
  
  let filtered = text;
  let hasInappropriate = false;
  
  badWords.forEach(rx => {
    if (rx.test(cleanText)) {
      hasInappropriate = true;
      filtered = filtered.replace(rx, "***");
    }
  });
  
  return {text: filtered, inappropriate: hasInappropriate};
}

function startCooldown() {
  const timerEl = document.getElementById('cooldownTimer');
  timerEl.style.display = 'block';
  
  let timeLeft = 5;
  timerEl.textContent = `${timeLeft}s`;
  
  if (cooldownInterval) clearInterval(cooldownInterval);
  
  cooldownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      timerEl.textContent = `${timeLeft}s`;
    } else {
      timerEl.style.display = 'none';
      clearInterval(cooldownInterval);
    }
  }, 1000);
}

async function sendMessage(imageUrl = null) {
  const now = Date.now();
  
  if (now - lastSent < 5000 && !imageUrl) {
    const remaining = Math.ceil((5000 - (now - lastSent)) / 1000);
    showNotification(`Wait ${remaining}s`);
    return;
  }
  
  const isBanned = await checkBan();
  if (isBanned) return;
  
  const isMuted = await checkMute();
  if (isMuted) return;
  
  const input = document.getElementById("msgInput");
  const text = imageUrl ? "" : input.value.trim();
  
  if (!text && !imageUrl) return;

  // 30 WORD LIMIT CHECK
  if (text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 30) {
      showNotification('Message too long! Max 30 words');
      return;
    }
  }

  // Counting channel logic
  if (currentRoomType === 'counting' && !imageUrl) {
    const num = parseInt(text);
    if (isNaN(num)) {
      showNotification('Counting: numbers only!');
      return;
    }
    
    const userCountDoc = await db.collection('countingUsers').doc(username).get();
    if (userCountDoc.exists) {
      const data = userCountDoc.data();
      const hourAgo = Date.now() - 3600000;
      if (data.lastCount > hourAgo) {
        const timeLeft = Math.ceil((3600000 - (Date.now() - data.lastCount)) / 60000);
        showNotification(`Wait ${timeLeft}m to count again!`);
        return;
      }
    }
    
    const countDoc = await db.collection('countingState').doc('current').get();
    const currentCount = countDoc.exists ? countDoc.data().number : 0;
    
    if (num !== currentCount + 1) {
      showNotification(`Wrong! Next is ${currentCount + 1}`);
      return;
    }
    
    await db.collection('countingState').doc('current').set({number: num, user: username, timestamp: Date.now()});
    await db.collection('countingUsers').doc(username).set({lastCount: Date.now()});
  }
  
  const filtered = text ? filterText(text) : {text: "", inappropriate: false};
  
  if (currentRoomType === 'private') {
    await updateStreak(currentRoom);
  }
  
  lastSent = now;
  if (!imageUrl) startCooldown();

  const collection = currentRoomType === 'group' 
    ? db.collection("groupChats").doc(currentRoom).collection("messages")
    : currentRoomType === 'counting'
    ? db.collection("rooms").doc("Counting").collection("messages")
    : currentRoomType === 'private'
    ? db.collection("privateChats").doc(currentRoom).collection("messages")
    : db.collection("rooms").doc(currentRoom).collection("messages");

  const messageData = {
    user: username,
    time: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (imageUrl) {
    messageData.imageUrl = imageUrl;
    messageData.text = text || "";
  } else {
    messageData.text = filtered.text;
    messageData.inappropriate = filtered.inappropriate;
  }

  collection.add(messageData);

  if (!imageUrl) {
    input.value = "";
    updateWordCount();
  }
}

// Room switching
let currentRoom = "General 1";
let currentRoomType = "public";
let unsub = null;
let lastMessageCount = {};

async function loadRoom(room, type = 'public') {
  if (unsub) unsub();
  currentRoom = room;
  currentRoomType = type;
  
  unreadCounts[room] = 0;
  updateNotifications();
  
  const collection = type === 'group'
    ? db.collection("groupChats").doc(room).collection("messages")
    : type === 'private'
    ? db.collection("privateChats").doc(room).collection("messages")
    : db.collection("rooms").doc(room).collection("messages");
  
  document.getElementById("messages").innerHTML = "";
  
  // Update header
  if (type === 'group') {
    const groupDoc = await db.collection("groupChats").doc(room).get();
    if (groupDoc.exists) {
      const data = groupDoc.data();
      document.getElementById("roomName").innerHTML = `💬 ${data.name} <span class="online-btn" onclick="openOnlineUsers()">Members: ${data.members.length}</span>`;
    }
  } else if (type === 'counting') {
    const countDoc = await db.collection('countingState').doc('current').get();
    const count = countDoc.exists ? countDoc.data().number : 0;
    document.getElementById("roomName").innerHTML = `🔢 Counting <span>Current: ${count}</span>`;
    
    db.collection('countingState').doc('current').onSnapshot(doc => {
      if (doc.exists && currentRoomType === 'counting') {
        const count = doc.data().number;
        document.getElementById("roomName").innerHTML = `🔢 Counting <span>Current: ${count}</span>`;
      }
    });
  } else if (type === 'private') {
    const users = room.split('_');
    const otherUser = users.find(u => u !== username);
    document.getElementById("roomName").innerHTML = `💬 ${otherUser}`;
  } else {
    document.getElementById("roomName").innerHTML = `🌌 ${room} <span class="online-btn" onclick="openOnlineUsers()">Online: <span id="onlineCount">0</span></span>`;
  }
  
  watchTyping(room, type);
  
  const showTimestamps = localStorage.getItem('showTimestamps') !== 'false';
  const showAvatars = localStorage.getItem('showAvatars') !== 'false';
  const compactMode = localStorage.getItem('compactMode') === 'true';
  
  unsub = collection.orderBy("time").onSnapshot(snap => {
    document.getElementById("messages").innerHTML = "";
    const messageProtection = localStorage.getItem('messageProtection') === 'true';
    
    snap.forEach(async doc => {
      const m = doc.data();
      
      // Filter blocked users and system messages
      if (blockedUsers.includes(m.user) && m.user !== 'SYSTEM') return;
      
      const div = document.createElement("div");
      div.className = "message";
      if (compactMode) div.classList.add('compact-mode');
      if (m.isAnnouncement) div.classList.add('announcement');
      
      if (messageProtection && m.inappropriate && !m.imageUrl) {
        div.classList.add('hidden-msg');
        div.onclick = function() {
          this.classList.remove('hidden-msg');
          this.onclick = null;
        };
      }
      
      // Avatar
      if (showAvatars && m.user !== 'SYSTEM') {
        const userAv = await getUserAvatar(m.user);
        if (userAv && userAv.startsWith('http')) {
          const avatarImg = document.createElement("img");
          avatarImg.className = "message-avatar";
          avatarImg.src = userAv;
          avatarImg.onclick = () => openUserProfile(m.user);
          div.appendChild(avatarImg);
        } else {
          const avatar = document.createElement("div");
          avatar.className = "message-avatar";
          avatar.textContent = m.user[0].toUpperCase();
          avatar.onclick = () => openUserProfile(m.user);
          div.appendChild(avatar);
        }
      }
      
      const content = document.createElement("div");
      content.className = "message-content";
      
      if (m.user !== 'SYSTEM') {
        const displayName = await getDisplayName(m.user);
        const specialTag = await getSpecialTag(m.user);
        
        const usernameSpan = document.createElement("span");
        usernameSpan.className = "username";
        usernameSpan.textContent = displayName;
        usernameSpan.onclick = () => openUserProfile(m.user);
        
        content.appendChild(usernameSpan);
        
        if (specialTag) {
          const tagSpan = document.createElement("span");
          tagSpan.className = "special-tag";
          tagSpan.textContent = specialTag.tag;
          tagSpan.style.background = specialTag.bgColor;
          tagSpan.style.color = specialTag.textColor;
          content.appendChild(tagSpan);
        }
        
        if (showTimestamps && m.time) {
          const timestamp = document.createElement("span");
          timestamp.className = "timestamp";
          const date = m.time.toDate();
          const hours = date.getHours().toString().padStart(2, '0');
          const mins = date.getMinutes().toString().padStart(2, '0');
          timestamp.textContent = `${hours}:${mins}`;
          content.appendChild(timestamp);
        }
      }
      
      if (m.text) {
        const textNode = document.createTextNode(m.user === 'SYSTEM' ? m.text : ": " + m.text);
        content.appendChild(textNode);
      }
      
      if (m.imageUrl) {
        const imageDiv = document.createElement("div");
        const img = document.createElement("img");
        img.className = "message-image";
        img.src = m.imageUrl;
        img.onclick = () => openImageViewer(m.imageUrl);
        
        const toggleBtn = document.createElement("span");
        toggleBtn.className = "image-toggle";
        toggleBtn.textContent = "Minimize";
        toggleBtn.onclick = () => {
          if (img.classList.contains('minimized')) {
            img.classList.remove('minimized');
            toggleBtn.textContent = "Minimize";
          } else {
            img.classList.add('minimized');
            toggleBtn.textContent = "Expand";
          }
        };
        
        imageDiv.appendChild(img);
        imageDiv.appendChild(document.createElement("br"));
        imageDiv.appendChild(toggleBtn);
        content.appendChild(imageDiv);
      }
      
      div.appendChild(content);
      
      if (isAdmin && m.user !== 'SYSTEM') {
        const delBtn = document.createElement("button");
        delBtn.textContent = "Del";
        delBtn.onclick = () => collection.doc(doc.id).delete();
        div.appendChild(delBtn);
      }
      
      document.getElementById("messages").appendChild(div);
    });
    
    // AUTOSCROLL TO BOTTOM
    scrollToBottom();
  });
  
  closeFriendsPanel();
}

// Listen for new messages
db.collection("rooms").get().then(snapshot => {
  snapshot.forEach(roomDoc => {
    db.collection("rooms").doc(roomDoc.id).collection("messages").onSnapshot(snap => {
      if (currentRoom !== roomDoc.id || currentRoomType !== 'public') {
        const count = snap.size - (lastMessageCount[roomDoc.id] || 0);
        if (count > 0 && lastMessageCount[roomDoc.id] !== undefined) {
          unreadCounts[roomDoc.id] = (unreadCounts[roomDoc.id] || 0) + count;
          updateNotifications();
        }
        lastMessageCount[roomDoc.id] = snap.size;
      }
    });
  });
});

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
  }, 3000);

  db.collection("presence").onSnapshot(snap => {
    let online = 0;
    const now = Date.now();
    snap.forEach(doc => {
      if (now - doc.data().lastSeen < 7000) online++;
    });
    const countEl = document.getElementById("onlineCount");
    if (countEl) countEl.textContent = online;
  });
}

// Enter to send
document.getElementById("msgInput").addEventListener("keypress", e => {
  if (e.key === "Enter" && localStorage.getItem('enterToSend') !== 'false') {
    sendMessage();
  }
});
