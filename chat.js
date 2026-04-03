// ─── FIREBASE CONFIG ─────────────────────────────────────
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

// ─── PROFILE PICTURES ────────────────────────────────────
const availableProfiles = [
  { name: 'AuraBaby',               url: 'https://i.ibb.co/Y4L448c1/aurababy.jpg' },
  { name: 'King Darren',            url: 'https://i.ibb.co/1YGkQ5M4/kingdarren.jpg' },
  { name: 'Daniel',                 url: 'https://i.ibb.co/RTwqxcck/daniel.jpg' },
  { name: 'Manuel',                 url: 'https://i.ibb.co/JRr6BWjb/theonewhocknocks.jpg' },
  { name: 'Grant',                  url: 'https://i.ibb.co/TqHnrtSp/grant.jpg' },
  { name: 'Joony',                  url: 'https://i.ibb.co/fd9Kg05w/output.jpg' },
  { name: 'Zoely',                  url: 'https://i.ibb.co/fVLDq186/zoely.png' },
  { name: 'Lemmet',                 url: 'https://i.ibb.co/TBmZmYYh/newlemmet.jpg' },
  { name: 'Kelly',                  url: 'https://i.ibb.co/Xk2DybZg/kelly.jpg' },
  { name: 'Bryce',                  url: 'https://i.ibb.co/pvgyknnq/bryce.jpg' },
  { name: 'FattieBaby',             url: 'https://i.ibb.co/FkyMMCRv/fattiebaby.jpg' },
  { name: 'GoonerBaby',             url: 'https://i.ibb.co/b5DH8g26/goonerbaby.jpg' },
  { name: 'Teros',                  url: 'https://i.ibb.co/Nd6v0WjN/teros.jpg' },
  { name: 'GangstaBaby',            url: 'https://i.ibb.co/TM91vD3z/Officalgangstababy.png' },
  { name: 'DarkAbby',               url: 'https://i.ibb.co/vCTDWs40/output-1.jpg' },
  { name: 'PoorBaby',               url: 'https://i.ibb.co/Nn9v6ZBw/poorbaby.jpg' },
  { name: 'RichBaby',               url: 'https://i.ibb.co/DDSNbypf/richbaby.jpg' },
  { name: 'The Baby That Holds Aura', url: 'https://i.ibb.co/Kx8ZSGCB/The-Baby-That-Holds-Aura.jpg' },
  { name: 'JollyBaby',              url: 'https://i.ibb.co/bgp5mdQZ/jollybaby.png' },
  { name: 'CupidBaby',              url: 'https://i.ibb.co/1GbNb2PX/Untitled-4.png' },
  { name: 'JudgmentBaby',           url: 'https://i.ibb.co/TqtxsJ52/judgment.jpg' },
  { name: 'JusticeN',               url: 'https://i.ibb.co/dwkHnD65/Justicebaby.jpg' }
];

// ─── STATE ───────────────────────────────────────────────
let username         = null;
let isAdmin          = localStorage.getItem('isAdmin') === 'true';
let blockedUsers     = [];
let currentRoom      = 'General 1';
let currentRoomType  = 'public';
let unsub            = null;
let lastSent         = 0;
let cooldownInterval = null;
let selectedFriends  = [];
let currentProfileUser = null;
let countingCooldownEnd = 0;
let typingTimeout    = null;
let currentlyTyping  = new Set();
let userProfilePicture = null;
let profileCache     = {};   // { username: url | null }
let presenceUnsub    = null;

// ─── HELPERS ─────────────────────────────────────────────
function safeSet(ref, data, opts) {
  return ref.set(data, opts || {}).catch(e => console.warn('Firestore set error:', e.message));
}
function safeAdd(ref, data) {
  return ref.add(data).catch(e => { console.warn('Firestore add error:', e.message); throw e; });
}
function safeGet(ref) {
  return ref.get().catch(e => { console.warn('Firestore get error:', e.message); return { exists: false, data: () => null }; });
}

// ─── SIDEBAR TOGGLE ───────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleMembersPanel() {
  const panel = document.querySelector('.members-panel');
  const show = document.getElementById('showMembers').checked;
  if (panel) panel.style.display = show ? 'flex' : 'none';
  localStorage.setItem('showMembers', show);
}

// ─── EMOJI PICKER ─────────────────────────────────────────
const emojis = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','🎮','🎯','🎲','🎰','🎸','🎹','🎺','🎻','🥁','🎭','🎨','⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🏑','🥅','⛳','🏹','🎣','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💯','💢','💥','💫','💦','💨','💤','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','💪','🎈','🎉','🎊','🎁','🏆','🥇','🥈','🥉','⭐','🌟','✨','🔥','💧','☀️','🌙','⚡','☁️','🌈','❄️','⛄'];

function toggleEmojiPicker() {
  const picker = document.getElementById('emojiPicker');
  if (picker.style.display === 'none' || !picker.style.display) {
    picker.style.display = 'block';
    if (!picker.dataset.rendered) {
      renderEmojis();
      picker.dataset.rendered = '1';
    }
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
    div.onclick = () => { insertEmoji(emoji); };
    grid.appendChild(div);
  });
}
function insertEmoji(emoji) {
  const input = document.getElementById('msgInput');
  const pos = input.selectionStart;
  input.value = input.value.slice(0, pos) + emoji + input.value.slice(pos);
  input.focus();
  input.setSelectionRange(pos + emoji.length, pos + emoji.length);
  document.getElementById('emojiPicker').style.display = 'none';
}
document.addEventListener('click', e => {
  const picker = document.getElementById('emojiPicker');
  const btn = document.querySelector('.emoji-btn');
  if (picker && !picker.contains(e.target) && e.target !== btn) {
    picker.style.display = 'none';
  }
});

// ─── NOTIFICATIONS ────────────────────────────────────────
function showNotification(message, type = 'error') {
  const el = document.createElement('div');
  el.className = `notification${type === 'success' ? ' success' : ''}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'notifOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ─── LOGIN / SIGNUP ───────────────────────────────────────
function toggleSignup() {
  const lf = document.getElementById('loginForm');
  const sf = document.getElementById('signupForm');
  lf.style.display = lf.style.display === 'none' ? 'block' : 'none';
  sf.style.display = sf.style.display === 'none' ? 'block' : 'none';
}

async function signup() {
  const user    = document.getElementById('signupUsername').value.trim();
  const code    = document.getElementById('signupCode').value.trim();
  const confirm = document.getElementById('signupCodeConfirm').value.trim();

  if (!user || !code || !confirm) { showNotification('Please fill all fields'); return; }
  if (user.length < 3)            { showNotification('Username must be at least 3 characters'); return; }
  if (!/^\d{6}$/.test(code))      { showNotification('Code must be exactly 6 digits'); return; }
  if (code !== confirm)           { showNotification('Codes do not match'); return; }

  const userDoc = await safeGet(db.collection('users').doc(user));
  if (userDoc.exists) { showNotification('Username already taken'); return; }

  await safeSet(db.collection('users').doc(user), { code, createdAt: Date.now() });
  await safeSet(db.collection('profiles').doc(user), { bio: 'AuraBaby user', createdAt: Date.now() });

  showNotification('Account created! Please login', 'success');
  toggleSignup();
}

async function login() {
  const user = document.getElementById('loginUsername').value.trim();
  const code = document.getElementById('loginCode').value.trim();

  if (!user || !code) { showNotification('Please fill all fields'); return; }

  const userDoc = await safeGet(db.collection('users').doc(user));
  if (!userDoc.exists) { showNotification('Username not found'); return; }

  const data = userDoc.data();
  if (!data || data.code !== code) { showNotification('Incorrect code'); return; }

  username = user;
  blockedUsers = JSON.parse(localStorage.getItem('blockedUsers_' + username) || '[]');
  localStorage.setItem('username', username);
  localStorage.setItem('userCode', code);

  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';
  document.getElementById('mainApp').style.flexDirection = 'column';
  initializeApp();
}

window.addEventListener('load', async () => {
  const savedUser = localStorage.getItem('username');
  const savedCode = localStorage.getItem('userCode');
  if (!savedUser || !savedCode) return;

  const userDoc = await safeGet(db.collection('users').doc(savedUser));
  if (userDoc.exists && userDoc.data() && userDoc.data().code === savedCode) {
    username = savedUser;
    blockedUsers = JSON.parse(localStorage.getItem('blockedUsers_' + username) || '[]');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    document.getElementById('mainApp').style.flexDirection = 'column';
    initializeApp();
  }
});

// ─── INIT ─────────────────────────────────────────────────
async function initializeApp() {
  document.getElementById('myUsername').textContent = username;

  // Apply saved settings
  applyColors();
  const showMems = localStorage.getItem('showMembers');
  const membersPanel = document.querySelector('.members-panel');
  if (showMems === 'false' && membersPanel) membersPanel.style.display = 'none';
  const showMemCb = document.getElementById('showMembers');
  if (showMemCb) showMemCb.checked = showMems !== 'false';

  // Load profile picture
  const profileImg = await getUserProfilePicture(username);
  userProfilePicture = profileImg;
  setAvatarEl(document.getElementById('myAvatar'), username, profileImg, true);

  if (isAdmin) document.getElementById('adminBtn').style.display = 'flex';

  // Wire up static channel items
  document.querySelectorAll('.channel-item').forEach(item => {
    item.onclick = function () {
      document.querySelectorAll('.channel-item, #groupChatsList .channel-item, #privateChatsList .channel-item')
        .forEach(x => x.classList.remove('active'));
      this.classList.add('active');
      loadRoom(this.dataset.room, this.dataset.type || 'public');
    };
  });

  startPresence();
  watchAllPresence();
  loadPrivateChats();
  loadGroups();
  loadRoom(currentRoom, currentRoomType);

  // Restore counting cooldown
  const savedCd = localStorage.getItem('countingCooldown_' + username);
  if (savedCd) {
    countingCooldownEnd = parseInt(savedCd);
    if (countingCooldownEnd > Date.now()) startCountingCooldownTimer();
  }
}

// ─── AVATAR HELPERS ───────────────────────────────────────
function setAvatarEl(el, user, imgUrl, large) {
  if (!el) return;
  if (imgUrl) {
    el.style.backgroundImage = `url(${imgUrl})`;
    el.style.backgroundSize  = 'cover';
    el.style.backgroundPosition = 'center';
    el.textContent = '';
  } else {
    el.style.backgroundImage = '';
    el.textContent = user === 'SYSTEM' ? '📢' : user[0].toUpperCase();
  }
}

async function getUserProfilePicture(user) {
  if (profileCache.hasOwnProperty(user)) return profileCache[user];
  try {
    const doc = await db.collection('profiles').doc(user).get();
    const url = (doc.exists && doc.data().profilePicture) ? doc.data().profilePicture : null;
    profileCache[user] = url;
    return url;
  } catch (e) {
    profileCache[user] = null;
    return null;
  }
}

// ─── PRESENCE / ONLINE USERS ──────────────────────────────
const PRESENCE_INTERVAL = 8000;   // ping every 8s
const ONLINE_THRESHOLD  = 20000;  // considered online if seen within 20s

function startPresence() {
  const ping = () => safeSet(db.collection('presence').doc(username), { lastSeen: Date.now(), username });
  ping();
  setInterval(ping, PRESENCE_INTERVAL);

  // Remove presence on unload
  window.addEventListener('beforeunload', () => {
    db.collection('presence').doc(username).delete().catch(() => {});
  });
}

function watchAllPresence() {
  if (presenceUnsub) presenceUnsub();

  presenceUnsub = db.collection('presence').onSnapshot(snapshot => {
    const now = Date.now();
    const onlineUsers = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.lastSeen && (now - data.lastSeen) < ONLINE_THRESHOLD) {
        if (!blockedUsers.includes(doc.id)) {
          onlineUsers.push(doc.id);
        }
      }
    });

    renderMembersPanel(onlineUsers);
  }, err => console.warn('Presence watch error:', err.message));
}

function renderMembersPanel(onlineUsers) {
  const list = document.getElementById('membersList');
  const countEl = document.getElementById('onlineCount');
  if (!list) return;

  countEl.textContent = onlineUsers.length;
  list.innerHTML = '';

  if (onlineUsers.length === 0) {
    list.innerHTML = '<div class="empty-state" style="margin-top:12px">No one online</div>';
    return;
  }

  const label = document.createElement('div');
  label.className = 'member-group-label';
  label.textContent = `Online — ${onlineUsers.length}`;
  list.appendChild(label);

  onlineUsers.forEach(async user => {
    const item = document.createElement('div');
    item.className = 'member-item';
    item.onclick = () => openUserProfile(user);

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'member-avatar';

    const dot = document.createElement('div');
    dot.className = 'member-status-dot online';
    avatarDiv.appendChild(dot);

    const nameDiv = document.createElement('div');
    nameDiv.className = 'member-name';
    nameDiv.textContent = user;

    item.appendChild(avatarDiv);
    item.appendChild(nameDiv);
    list.appendChild(item);

    // Load profile picture async
    const img = await getUserProfilePicture(user);
    if (img) {
      avatarDiv.style.backgroundImage = `url(${img})`;
      avatarDiv.style.backgroundSize = 'cover';
      avatarDiv.style.backgroundPosition = 'center';
    } else {
      const initial = document.createElement('span');
      initial.textContent = user[0].toUpperCase();
      // Insert before the dot
      avatarDiv.insertBefore(initial, dot);
    }
  });
}

// ─── SETTINGS ─────────────────────────────────────────────
function openSettings() {
  document.getElementById('settingsPanel').style.display = 'block';
  document.getElementById('settingsOverlay').style.display = 'block';
  document.getElementById('showTimestamps').checked = localStorage.getItem('showTimestamps') === 'true';
  document.getElementById('soundEnabled').checked   = localStorage.getItem('soundEnabled') === 'true';
  document.getElementById('enterToSend').checked    = localStorage.getItem('enterToSend') !== 'false';
  document.getElementById('showMembers').checked    = localStorage.getItem('showMembers') !== 'false';
  document.getElementById('primaryColorPicker').value   = localStorage.getItem('primaryColor')   || '#6c7fff';
  document.getElementById('secondaryColorPicker').value = localStorage.getItem('secondaryColor') || '#ff6cbe';
  loadBlockedUsers();
}
function closeSettings() {
  document.getElementById('settingsPanel').style.display = 'none';
  document.getElementById('settingsOverlay').style.display = 'none';
  localStorage.setItem('showTimestamps', document.getElementById('showTimestamps').checked);
  localStorage.setItem('soundEnabled',   document.getElementById('soundEnabled').checked);
  localStorage.setItem('enterToSend',    document.getElementById('enterToSend').checked);
  localStorage.setItem('showMembers',    document.getElementById('showMembers').checked);
}

function applyColors() {
  const p = localStorage.getItem('primaryColor')   || '#6c7fff';
  const s = localStorage.getItem('secondaryColor') || '#ff6cbe';
  document.documentElement.style.setProperty('--accent',   p);
  document.documentElement.style.setProperty('--accent-2', s);
}
function resetColors() {
  localStorage.removeItem('primaryColor');
  localStorage.removeItem('secondaryColor');
  document.getElementById('primaryColorPicker').value   = '#6c7fff';
  document.getElementById('secondaryColorPicker').value = '#ff6cbe';
  applyColors();
  showNotification('Colors reset!', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('primaryColorPicker').addEventListener('input', e => {
    localStorage.setItem('primaryColor', e.target.value); applyColors();
  });
  document.getElementById('secondaryColorPicker').addEventListener('input', e => {
    localStorage.setItem('secondaryColor', e.target.value); applyColors();
  });
  applyColors();
});

// ─── BLOCKING ─────────────────────────────────────────────
function blockUser(user) {
  if (!blockedUsers.includes(user)) {
    blockedUsers.push(user);
    localStorage.setItem('blockedUsers_' + username, JSON.stringify(blockedUsers));
    showNotification(`Blocked ${user}`, 'success');
    loadBlockedUsers();
    loadRoom(currentRoom, currentRoomType);
  }
}
function unblockUser(user) {
  blockedUsers = blockedUsers.filter(u => u !== user);
  localStorage.setItem('blockedUsers_' + username, JSON.stringify(blockedUsers));
  showNotification(`Unblocked ${user}`, 'success');
  loadBlockedUsers();
  loadRoom(currentRoom, currentRoomType);
}
function loadBlockedUsers() {
  const list = document.getElementById('blockedUsersList');
  if (!list) return;
  list.innerHTML = '';
  if (blockedUsers.length === 0) { list.innerHTML = '<div class="empty-state">No blocked users</div>'; return; }
  blockedUsers.forEach(user => {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.innerHTML = `<span>${user}</span>`;
    const btn = document.createElement('button');
    btn.className = 'success';
    btn.textContent = 'Unblock';
    btn.onclick = () => unblockUser(user);
    div.querySelector('.user-item-actions') || div.appendChild(btn);
    list.appendChild(div);
  });
}
function blockUserFromProfile() {
  if (!currentProfileUser || currentProfileUser === username) return;
  blockedUsers.includes(currentProfileUser) ? unblockUser(currentProfileUser) : blockUser(currentProfileUser);
  closeProfile();
}

// ─── ADMIN UNLOCK ─────────────────────────────────────────
function adminUnlock() {
  if (isAdmin) { showNotification("You're already admin!", 'success'); return; }
  const pass = prompt('Enter admin password:');
  if (pass === 'chickenfish67demonlordohio') {
    isAdmin = true;
    localStorage.setItem('isAdmin', 'true');
    document.getElementById('adminBtn').style.display = 'flex';
    showNotification('Admin unlocked!', 'success');
  } else if (pass) {
    showNotification('Wrong password!');
  }
}

// ─── BANNED SERVER PANEL ──────────────────────────────────
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
  db.collection('bans').onSnapshot(snapshot => {
    const list = document.getElementById('bannedServerList');
    list.innerHTML = '';
    const now = Date.now();
    let any = false;
    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.banUntil > now) {
        any = true;
        const left = d.banUntil - now;
        const h = Math.floor(left/3600000), m = Math.floor((left%3600000)/60000), s = Math.floor((left%60000)/1000);
        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `<span><strong>${doc.id}</strong> — ${h}h ${m}m ${s}s left</span>`;
        list.appendChild(div);
      }
    });
    if (!any) list.innerHTML = '<div class="empty-state">No users currently banned</div>';
  }, err => console.warn('Banned server load error:', err.message));
}

// ─── BLOCKED PANEL ────────────────────────────────────────
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
  if (blockedUsers.length === 0) { list.innerHTML = '<div class="empty-state">No blocked users</div>'; return; }
  blockedUsers.forEach(user => {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.innerHTML = `<span>${user}</span>`;
    const btn = document.createElement('button');
    btn.className = 'success';
    btn.textContent = 'Unblock';
    btn.onclick = () => { unblockUser(user); loadBlockedPanel(); };
    div.appendChild(btn);
    list.appendChild(div);
  });
}

// ─── COOLDOWN TIMERS ──────────────────────────────────────
function startCooldown() {
  const el = document.getElementById('cooldownTimer');
  el.style.display = 'block';
  let t = 3;
  el.textContent = `⏱ Wait ${t}s`;
  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownInterval = setInterval(() => {
    t--;
    if (t > 0) { el.textContent = `⏱ Wait ${t}s`; }
    else { el.style.display = 'none'; clearInterval(cooldownInterval); }
  }, 1000);
}

function startCountingCooldownTimer() {
  const el = document.getElementById('cooldownTimer');
  el.style.display = 'block';
  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownInterval = setInterval(() => {
    const rem = countingCooldownEnd - Date.now();
    if (rem <= 0) {
      el.style.display = 'none';
      clearInterval(cooldownInterval);
      localStorage.removeItem('countingCooldown_' + username);
      countingCooldownEnd = 0;
    } else {
      const h = Math.floor(rem/3600000), m = Math.floor((rem%3600000)/60000), s = Math.floor((rem%60000)/1000);
      el.textContent = `🔢 Counting cooldown: ${h}h ${m}m ${s}s`;
    }
  }, 1000);
}

// ─── TYPING INDICATORS ────────────────────────────────────
function sendTypingIndicator() {
  if (!currentRoom || currentRoomType === 'counting') return;
  const path = currentRoomType === 'group'   ? `groupChats/${currentRoom}/typing`
             : currentRoomType === 'private' ? `privateChats/${currentRoom}/typing`
             : `rooms/${currentRoom}/typing`;
  safeSet(db.collection(path).doc(username), { typing: true, timestamp: Date.now() });
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    db.collection(path).doc(username).delete().catch(() => {});
  }, 3000);
}

function watchTyping(room, type) {
  const path = type === 'group'   ? `groupChats/${room}/typing`
             : type === 'private' ? `privateChats/${room}/typing`
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
    const textEl    = document.getElementById('typingText');
    if (currentlyTyping.size > 0) {
      const users = Array.from(currentlyTyping);
      if (users.length === 1) textEl.textContent = `${users[0]} is typing`;
      else if (users.length === 2) textEl.textContent = `${users[0]} and ${users[1]} are typing`;
      else textEl.textContent = `${users[0]}, ${users[1]} and ${users.length - 2} others are typing`;
      indicator.style.display = 'flex';
    } else {
      indicator.style.display = 'none';
    }
  }, () => {});
}

// ─── PRIVATE CHATS ────────────────────────────────────────
async function openPrivateChat() {
  if (!currentProfileUser || currentProfileUser === username) return;
  const users  = [username, currentProfileUser].sort();
  const chatId = users.join('_');
  await safeSet(db.collection('privateChats').doc(chatId), { users, createdAt: Date.now(), lastMessage: Date.now() }, { merge: true });
  closeProfile();
  loadPrivateChats();
  loadRoom(chatId, 'private');
}

function loadPrivateChats() {
  db.collection('privateChats').where('users', 'array-contains', username).onSnapshot(snapshot => {
    const section = document.getElementById('privateChatsSection');
    const list    = document.getElementById('privateChatsList');
    list.innerHTML = '';
    if (snapshot.empty) { section.style.display = 'none'; return; }
    section.style.display = 'block';

    snapshot.forEach(doc => {
      const data      = doc.data();
      const otherUser = data.users.find(u => u !== username);
      if (blockedUsers.includes(otherUser)) return;

      const div = document.createElement('div');
      div.className = 'channel-item';
      div.dataset.room = doc.id;
      div.dataset.type = 'private';
      div.innerHTML = `<span class="ch-icon">💬</span> ${otherUser}`;
      div.onclick = function () {
        document.querySelectorAll('.channel-item').forEach(r => r.classList.remove('active'));
        this.classList.add('active');
        loadRoom(doc.id, 'private');
      };
      list.appendChild(div);
    });
  }, err => console.warn('Private chats load error:', err.message));
}

// ─── MESSAGING ────────────────────────────────────────────
async function checkBan() {
  try {
    const banDoc = await db.collection('bans').doc(username).get();
    if (banDoc.exists) {
      const d = banDoc.data();
      if (d.banUntil > Date.now()) {
        showNotification(`You are banned for ${Math.ceil((d.banUntil - Date.now()) / 60000)} more minutes`);
        return true;
      }
      await db.collection('bans').doc(username).delete().catch(() => {});
    }
  } catch (e) { console.warn('Ban check error:', e.message); }
  return false;
}

async function checkMute() {
  try {
    const muteDoc = await db.collection('mutes').doc(username).get();
    if (muteDoc.exists) {
      const d = muteDoc.data();
      if (d.muteUntil > Date.now()) {
        showNotification(`You are muted for ${Math.ceil((d.muteUntil - Date.now()) / 60000)} more minutes`);
        return true;
      }
      await db.collection('mutes').doc(username).delete().catch(() => {});
    }
  } catch (e) { console.warn('Mute check error:', e.message); }
  return false;
}

async function sendMessage() {
  const now = Date.now();
  if (now - lastSent < 3000) {
    showNotification(`Wait ${Math.ceil((3000 - (now - lastSent)) / 1000)}s`);
    return;
  }

  if (await checkBan())  return;
  if (await checkMute()) return;

  const input = document.getElementById('msgInput');
  const text  = input.value.trim();
  if (!text) return;
  if (text.length > 200) { showNotification('Max 200 characters!'); return; }

  // Counting channel logic
  if (currentRoomType === 'counting') {
    if (countingCooldownEnd > now) {
      const rem = countingCooldownEnd - now;
      showNotification(`Counting cooldown: ${Math.ceil(rem/60000)} minutes left`);
      return;
    }
    const num = parseInt(text);
    if (isNaN(num)) { showNotification('Counting: numbers only!'); return; }

    try {
      const countDoc  = await db.collection('countingState').doc('current').get();
      const current   = countDoc.exists ? countDoc.data().number : 0;
      if (num !== current + 1) { showNotification(`Wrong! Next number is ${current + 1}`); return; }
      await safeSet(db.collection('countingState').doc('current'), { number: num, user: username, timestamp: Date.now() });
    } catch (e) { showNotification('Error updating count'); return; }

    countingCooldownEnd = now + 3600000;
    localStorage.setItem('countingCooldown_' + username, countingCooldownEnd.toString());
    startCountingCooldownTimer();
  }

  lastSent = now;
  if (currentRoomType !== 'counting') startCooldown();

  const collection = currentRoomType === 'group'    ? db.collection('groupChats').doc(currentRoom).collection('messages')
                   : currentRoomType === 'counting'  ? db.collection('rooms').doc('Counting').collection('messages')
                   : currentRoomType === 'private'   ? db.collection('privateChats').doc(currentRoom).collection('messages')
                   : db.collection('rooms').doc(currentRoom).collection('messages');

  try {
    await collection.add({ user: username, text, time: firebase.firestore.FieldValue.serverTimestamp() });
    input.value = '';
  } catch (e) {
    showNotification('Failed to send message — check Firestore rules');
    console.error('Send error:', e.message);
  }
}

// ─── ROOM LOADING ─────────────────────────────────────────
const CHANNEL_META = {
  'General 1': { icon: '🌌' }, 'General 2': { icon: '💫' },
  'General 3': { icon: '⭐' }, 'Counting':   { icon: '🔢' }
};

async function loadRoom(room, type = 'public') {
  if (unsub) unsub();
  currentRoom     = room;
  currentRoomType = type;

  document.getElementById('messages').innerHTML = '';

  // Header
  const iconEl = document.getElementById('roomIcon');
  const nameEl = document.getElementById('roomName');
  const descEl = document.getElementById('roomDesc');

  if (type === 'group') {
    const doc = await safeGet(db.collection('groupChats').doc(room));
    if (doc.exists) {
      iconEl.textContent = '💬';
      nameEl.textContent = doc.data().name;
      descEl.textContent = `${doc.data().members.length} members`;
    }
  } else if (type === 'counting') {
    iconEl.textContent = '🔢';
    nameEl.textContent = 'Counting';
    const cd = await safeGet(db.collection('countingState').doc('current'));
    descEl.textContent = `Current: ${cd.exists ? cd.data().number : 0}`;
    db.collection('countingState').doc('current').onSnapshot(d => {
      if (d.exists && currentRoomType === 'counting') descEl.textContent = `Current: ${d.data().number}`;
    });
  } else if (type === 'private') {
    const other = room.split('_').find(u => u !== username);
    iconEl.textContent = '💬';
    nameEl.textContent = other;
    descEl.textContent = 'Direct message';
  } else {
    iconEl.textContent = CHANNEL_META[room]?.icon || '#';
    nameEl.textContent = room;
    descEl.textContent = '';
  }

  watchTyping(room, type);

  const collection = type === 'group'   ? db.collection('groupChats').doc(room).collection('messages')
                   : type === 'private' ? db.collection('privateChats').doc(room).collection('messages')
                   : db.collection('rooms').doc(room).collection('messages');

  const showTs = localStorage.getItem('showTimestamps') === 'true';

  unsub = collection.orderBy('time').limitToLast(60).onSnapshot(async snapshot => {
    const container = document.getElementById('messages');
    container.innerHTML = '';

    for (const doc of snapshot.docs) {
      const m = doc.data();
      if (blockedUsers.includes(m.user)) continue;

      const wrap = document.createElement('div');
      wrap.className = 'message';
      if (m.isAnnouncement) wrap.classList.add('announcement');

      // Avatar
      const avatar = document.createElement('div');
      avatar.className = 'msg-avatar';
      if (m.user !== 'SYSTEM') {
        const img = await getUserProfilePicture(m.user);
        setAvatarEl(avatar, m.user, img, false);
        avatar.onclick = () => openUserProfile(m.user);
      } else {
        avatar.textContent = '📢';
      }
      wrap.appendChild(avatar);

      // Body
      const body = document.createElement('div');
      body.className = 'msg-body';

      if (m.user !== 'SYSTEM') {
        const header = document.createElement('div');
        header.className = 'msg-header';

        const uname = document.createElement('span');
        uname.className = 'msg-username';
        uname.textContent = m.user;
        uname.onclick = () => openUserProfile(m.user);
        header.appendChild(uname);

        if (showTs && m.time) {
          const d = m.time.toDate();
          const ts = document.createElement('span');
          ts.className = 'msg-time';
          ts.textContent = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
          header.appendChild(ts);
        }
        body.appendChild(header);
      }

      const textDiv = document.createElement('div');
      textDiv.className = m.user === 'SYSTEM' ? 'msg-text system-text' : 'msg-text';
      textDiv.textContent = m.user === 'SYSTEM' ? m.text : m.text;
      body.appendChild(textDiv);

      wrap.appendChild(body);

      if (isAdmin && m.user !== 'SYSTEM') {
        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.textContent = '✕';
        del.onclick = () => collection.doc(doc.id).delete().catch(() => {});
        wrap.appendChild(del);
      }

      container.appendChild(wrap);
    }

    container.scrollTop = container.scrollHeight;

    if (document.hidden && localStorage.getItem('soundEnabled') === 'true') {
      playNotificationSound();
    }
  }, err => console.warn('Room snapshot error:', err.message));
}

// ─── PRESENCE ─────────────────────────────────────────────
function playNotificationSound() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

// ─── INPUT HANDLERS ───────────────────────────────────────
document.getElementById('msgInput').addEventListener('keypress', e => {
  if (e.key === 'Enter' && localStorage.getItem('enterToSend') !== 'false') sendMessage();
});
document.getElementById('msgInput').addEventListener('input', sendTypingIndicator);

// ─── FRIENDS ──────────────────────────────────────────────
function openFriendsPanel() {
  document.getElementById('friendsPanel').style.display = 'block';
  document.getElementById('friendsOverlay').style.display = 'block';
  loadFriends(); loadGroups(); loadFriendRequests();
}
function closeFriendsPanel() {
  document.getElementById('friendsPanel').style.display = 'none';
  document.getElementById('friendsOverlay').style.display = 'none';
}

function switchTab(tab, btnEl) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  document.getElementById('friendsTab').style.display = tab === 'friends' ? 'block' : 'none';
  document.getElementById('groupsTab').style.display  = tab === 'groups'  ? 'block' : 'none';
  document.getElementById('addTab').style.display     = tab === 'add'     ? 'block' : 'none';
  if (tab === 'groups') loadFriendsForGroup();
}

function loadFriends() {
  db.collection('friends').doc(username).onSnapshot(doc => {
    const list = document.getElementById('friendsList');
    list.innerHTML = '';
    const friends = doc.data() || {};
    const valid = Object.keys(friends).filter(f => friends[f] && !blockedUsers.includes(f));
    if (!valid.length) { list.innerHTML = '<div class="empty-state">No friends yet</div>'; return; }
    valid.forEach(f => {
      const div = document.createElement('div');
      div.className = 'friend-item';
      div.innerHTML = `<div class="fi-avatar">${f[0].toUpperCase()}</div>${f}`;
      div.onclick = () => openUserProfile(f);
      list.appendChild(div);
    });
  }, err => console.warn('Load friends error:', err.message));
}

function loadGroups() {
  db.collection('groupChats').where('members', 'array-contains', username).onSnapshot(snapshot => {
    const list        = document.getElementById('groupsList');
    const sidebarList = document.getElementById('groupChatsList');
    const section     = document.getElementById('groupChatsSection');
    list.innerHTML = ''; sidebarList.innerHTML = '';

    if (snapshot.empty) {
      list.innerHTML = '<div class="empty-state">No groups yet</div>';
      section.style.display = 'none';
      return;
    }
    section.style.display = 'block';

    snapshot.forEach(doc => {
      const data = doc.data();

      const div = document.createElement('div');
      div.className = 'group-item';
      div.textContent = `${data.name} (${data.members.length})`;
      div.onclick = () => { closeFriendsPanel(); loadRoom(doc.id, 'group'); };
      list.appendChild(div);

      const sideDiv = document.createElement('div');
      sideDiv.className = 'channel-item';
      sideDiv.dataset.room = doc.id;
      sideDiv.dataset.type = 'group';
      sideDiv.innerHTML = `<span class="ch-icon">💬</span>${data.name}`;
      sideDiv.onclick = function () {
        document.querySelectorAll('.channel-item').forEach(r => r.classList.remove('active'));
        this.classList.add('active');
        loadRoom(doc.id, 'group');
      };
      sidebarList.appendChild(sideDiv);
    });
  }, err => console.warn('Load groups error:', err.message));
}

function loadFriendsForGroup() {
  db.collection('friends').doc(username).get().then(doc => {
    const list = document.getElementById('friendsSelectList');
    list.innerHTML = '';
    selectedFriends = [];
    const friends = doc.data() || {};
    const valid   = Object.keys(friends).filter(f => friends[f] && !blockedUsers.includes(f));
    if (!valid.length) { list.innerHTML = '<div class="empty-state">No friends to add</div>'; return; }
    valid.forEach(f => {
      const div = document.createElement('div');
      div.className = 'user-item';
      div.style.cursor = 'pointer';
      div.innerHTML = `<span>☐ ${f}</span>`;
      div.onclick = function () {
        const idx = selectedFriends.indexOf(f);
        if (idx > -1) { selectedFriends.splice(idx, 1); this.querySelector('span').textContent = `☐ ${f}`; }
        else { selectedFriends.push(f); this.querySelector('span').textContent = `☑ ${f}`; }
      };
      list.appendChild(div);
    });
  }).catch(err => console.warn('Load friends for group error:', err.message));
}

function createGroupChat() {
  const name = document.getElementById('groupName').value.trim();
  if (!name) { showNotification('Enter a group name'); return; }
  if (!selectedFriends.length) { showNotification('Select at least one friend'); return; }
  db.collection('groupChats').add({ name, members: [username, ...selectedFriends], createdBy: username, createdAt: Date.now() })
    .then(() => { showNotification(`Group "${name}" created!`, 'success'); document.getElementById('groupName').value = ''; selectedFriends = []; })
    .catch(err => { showNotification('Error creating group'); console.error(err); });
}

function sendFriendRequest() {
  const friend = document.getElementById('addFriendUsername').value.trim();
  if (!friend) { showNotification('Enter a username'); return; }
  if (friend === username) { showNotification('Cannot add yourself'); return; }
  db.collection('friendRequests').add({ from: username, to: friend, timestamp: Date.now(), status: 'pending' })
    .then(() => { showNotification(`Request sent to ${friend}!`, 'success'); document.getElementById('addFriendUsername').value = ''; })
    .catch(err => console.warn('Friend request error:', err.message));
}

function loadFriendRequests() {
  db.collection('friendRequests').where('to', '==', username).where('status', '==', 'pending').onSnapshot(snapshot => {
    const list = document.getElementById('friendRequests');
    list.innerHTML = '';
    if (snapshot.empty) { list.innerHTML = '<div class="empty-state">No pending requests</div>'; return; }
    snapshot.forEach(doc => {
      const data = doc.data();
      const div  = document.createElement('div');
      div.className = 'user-item';
      div.innerHTML = `<span>${data.from}</span>`;
      const wrap = document.createElement('div');
      wrap.className = 'user-item-actions';

      const yes = document.createElement('button');
      yes.textContent = '✓'; yes.className = 'success';
      yes.onclick = () => acceptFriendRequest(doc.id, data.from);

      const no = document.createElement('button');
      no.textContent = '✕'; no.className = 'danger';
      no.onclick = () => db.collection('friendRequests').doc(doc.id).update({ status: 'rejected' });

      wrap.appendChild(yes); wrap.appendChild(no);
      div.appendChild(wrap);
      list.appendChild(div);
    });
  }, err => console.warn('Friend requests error:', err.message));
}

function acceptFriendRequest(id, friend) {
  safeSet(db.collection('friends').doc(username), { [friend]: true }, { merge: true });
  safeSet(db.collection('friends').doc(friend),   { [username]: true }, { merge: true });
  db.collection('friendRequests').doc(id).update({ status: 'accepted' }).catch(() => {});
  showNotification(`You're now friends with ${friend}!`, 'success');
}

// ─── PICTURE PANEL ────────────────────────────────────────
function openPicturePanel() {
  document.getElementById('picturePanel').style.display = 'block';
  document.getElementById('picturePanelOverlay').style.display = 'block';
  loadProfileGallery();
}
function closePicturePanel() {
  document.getElementById('picturePanel').style.display = 'none';
  document.getElementById('picturePanelOverlay').style.display = 'none';
}

function loadProfileGallery() {
  const gallery = document.getElementById('profileGallery');
  gallery.innerHTML = '';
  availableProfiles.forEach(p => {
    const div = document.createElement('div');
    div.className = 'profile-option';
    if (userProfilePicture === p.url) div.classList.add('selected');
    div.style.backgroundImage = `url(${p.url})`;

    const label = document.createElement('div');
    label.className = 'profile-name-label';
    label.textContent = p.name;
    div.appendChild(label);
    div.onclick = () => selectProfilePicture(p.url);
    gallery.appendChild(div);
  });
}

async function selectProfilePicture(url) {
  userProfilePicture = url;
  profileCache[username] = url;
  await safeSet(db.collection('profiles').doc(username), { profilePicture: url }, { merge: true });
  setAvatarEl(document.getElementById('myAvatar'), username, url, true);
  loadProfileGallery();
  showNotification('Profile picture updated!', 'success');
}

// ─── PROFILE MODAL ────────────────────────────────────────
function openMyProfile() { openUserProfile(username); }

async function openUserProfile(user) {
  currentProfileUser = user;
  document.getElementById('profileModal').style.display = 'block';
  document.getElementById('profileOverlay').style.display = 'block';
  document.getElementById('profileTitle').textContent = user === username ? 'My Profile' : `${user}'s Profile`;
  document.getElementById('profileUsername').textContent = user;

  const imgUrl = await getUserProfilePicture(user);
  const bigAv  = document.getElementById('profileAvatar');
  setAvatarEl(bigAv, user, imgUrl, true);

  const profileDoc = await safeGet(db.collection('profiles').doc(user));
  document.getElementById('profileBio').textContent = (profileDoc.exists && profileDoc.data().bio) || 'AuraBaby user';

  const actions = document.getElementById('profileActions');
  if (user === username) {
    actions.style.display = 'none';
  } else {
    actions.style.display = 'flex';
    document.getElementById('profileBlockBtn').textContent = blockedUsers.includes(user) ? 'Unblock' : 'Block';
    const fd = await safeGet(db.collection('friends').doc(username));
    const friends = fd.data() || {};
    document.getElementById('profileAddFriend').textContent = friends[user] ? '✓ Friends' : 'Add Friend';
  }

  // Friends list
  const fl = await safeGet(db.collection('friends').doc(user));
  const friendData = fl.data() || {};
  const fList = document.getElementById('profileFriends');
  fList.innerHTML = '';
  const fKeys = Object.keys(friendData).filter(k => friendData[k]);
  if (!fKeys.length) { fList.innerHTML = '<div class="empty-state">No friends</div>'; }
  else fKeys.forEach(f => {
    const d = document.createElement('div');
    d.className = 'friend-item';
    d.innerHTML = `<div class="fi-avatar">${f[0].toUpperCase()}</div>${f}`;
    d.onclick = () => openUserProfile(f);
    fList.appendChild(d);
  });

  // Groups list
  db.collection('groupChats').where('members', 'array-contains', user).get().then(snap => {
    const gList = document.getElementById('profileGroups');
    gList.innerHTML = '';
    if (snap.empty) { gList.innerHTML = '<div class="empty-state">No groups</div>'; return; }
    snap.forEach(doc => {
      const div = document.createElement('div');
      div.className = 'group-item';
      div.textContent = doc.data().name;
      gList.appendChild(div);
    });
  }).catch(() => {});
}

function addFriendFromProfile() {
  if (!currentProfileUser) return;
  document.getElementById('addFriendUsername').value = currentProfileUser;
  closeProfile(); openFriendsPanel();
  document.querySelectorAll('.tab-btn')[2].click();
  sendFriendRequest();
}

function closeProfile() {
  document.getElementById('profileModal').style.display = 'none';
  document.getElementById('profileOverlay').style.display = 'none';
  currentProfileUser = null;
}

// ─── ADMIN ────────────────────────────────────────────────
function openAdminPanel() {
  if (!isAdmin) { showNotification("You're not an admin!"); return; }
  document.getElementById('adminPanel').style.display = 'block';
  document.getElementById('adminOverlay').style.display = 'block';
  loadBannedUsers(); loadMutedUsers();
}
function closeAdminPanel() {
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminOverlay').style.display = 'none';
}

function banUser() {
  const target   = document.getElementById('banUsername').value.trim();
  const duration = parseInt(document.getElementById('banDuration').value);
  if (!target) { showNotification('Enter a username'); return; }
  safeSet(db.collection('bans').doc(target), { bannedBy: username, banUntil: Date.now() + duration, timestamp: Date.now() })
    .then(() => { showNotification(`${target} banned!`, 'success'); document.getElementById('banUsername').value = ''; loadBannedUsers(); });
}

function muteUser() {
  const target   = document.getElementById('muteUsername').value.trim();
  const duration = parseInt(document.getElementById('muteDuration').value);
  if (!target) { showNotification('Enter a username'); return; }
  safeSet(db.collection('mutes').doc(target), { mutedBy: username, muteUntil: Date.now() + duration, timestamp: Date.now() })
    .then(() => { showNotification(`${target} muted!`, 'success'); document.getElementById('muteUsername').value = ''; loadMutedUsers(); });
}

function sendAnnouncement() {
  const text = document.getElementById('announcementText').value.trim();
  const room = document.getElementById('announcementRoom').value;
  if (!text) { showNotification('Enter announcement text'); return; }
  const rooms = room === 'all' ? ['General 1', 'General 2', 'General 3'] : [room];
  rooms.forEach(r => {
    safeAdd(db.collection('rooms').doc(r).collection('messages'), {
      user: 'SYSTEM', text: `📢 ${text}`, isAnnouncement: true,
      time: firebase.firestore.FieldValue.serverTimestamp()
    });
  });
  showNotification('Announcement sent!', 'success');
  document.getElementById('announcementText').value = '';
}

function loadBannedUsers() {
  db.collection('bans').get().then(snap => {
    const list = document.getElementById('bannedList');
    if (!list) return;
    list.innerHTML = '';
    const now = Date.now();
    let any = false;
    snap.forEach(doc => {
      const d = doc.data();
      if (d.banUntil > now) {
        any = true;
        const left = Math.ceil((d.banUntil - now) / 60000);
        const div  = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `<span>${doc.id} — ${left}m</span>`;
        const btn = document.createElement('button'); btn.textContent = 'Unban';
        btn.onclick = () => { db.collection('bans').doc(doc.id).delete(); loadBannedUsers(); };
        div.appendChild(btn); list.appendChild(div);
      }
    });
    if (!any) list.innerHTML = '<div class="empty-state">No banned users</div>';
  }).catch(err => console.warn('Load banned error:', err.message));
}

function loadMutedUsers() {
  db.collection('mutes').get().then(snap => {
    const list = document.getElementById('mutedList');
    if (!list) return;
    list.innerHTML = '';
    const now = Date.now();
    let any = false;
    snap.forEach(doc => {
      const d = doc.data();
      if (d.muteUntil > now) {
        any = true;
        const left = Math.ceil((d.muteUntil - now) / 60000);
        const div  = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `<span>${doc.id} — ${left}m</span>`;
        const btn = document.createElement('button'); btn.textContent = 'Unmute';
        btn.onclick = () => { db.collection('mutes').doc(doc.id).delete(); loadMutedUsers(); };
        div.appendChild(btn); list.appendChild(div);
      }
    });
    if (!any) list.innerHTML = '<div class="empty-state">No muted users</div>';
  }).catch(err => console.warn('Load muted error:', err.message));
}
