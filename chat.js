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

let username = null;
let currentRoom = "General 1";
let unsub = null;
let lastSent = 0;
let cooldownInterval = null;

// SIDEBAR TOGGLE
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
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
  localStorage.setItem('username', username);
  localStorage.setItem('userCode', code);
  
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';
  
  initializeApp();
}

function logout() {
  localStorage.removeItem('username');
  localStorage.removeItem('userCode');
  location.reload();
}

window.addEventListener('load', async () => {
  const savedUser = localStorage.getItem('username');
  const savedCode = localStorage.getItem('userCode');
  
  if (savedUser && savedCode) {
    const userDoc = await db.collection('users').doc(savedUser).get();
    if (userDoc.exists && userDoc.data().code === savedCode) {
      username = savedUser;
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('mainApp').style.display = 'flex';
      initializeApp();
    }
  }
});

function initializeApp() {
  document.getElementById("myUsername").textContent = username;
  document.getElementById("myAvatar").textContent = username[0].toUpperCase();
  
  loadRoom(currentRoom);
  startPresence();
}

// SETTINGS
function openSettings() {
  document.getElementById('settingsPanel').style.display = 'block';
  document.getElementById('settingsOverlay').style.display = 'block';
  
  document.getElementById('showTimestamps').checked = localStorage.getItem('showTimestamps') === 'true';
  document.getElementById('soundEnabled').checked = localStorage.getItem('soundEnabled') === 'true';
}

function closeSettings() {
  document.getElementById('settingsPanel').style.display = 'none';
  document.getElementById('settingsOverlay').style.display = 'none';
  
  localStorage.setItem('showTimestamps', document.getElementById('showTimestamps').checked);
  localStorage.setItem('soundEnabled', document.getElementById('soundEnabled').checked);
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

// MESSAGING
async function sendMessage() {
  const now = Date.now();
  
  if (now - lastSent < 3000) {
    const remaining = Math.ceil((3000 - (now - lastSent)) / 1000);
    showNotification(`Wait ${remaining}s`);
    return;
  }
  
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  
  if (!text) return;
  
  if (text.length > 200) {
    showNotification('Message too long! Max 200 characters');
    return;
  }
  
  lastSent = now;
  startCooldown();

  await db.collection("rooms").doc(currentRoom).collection("messages").add({
    user: username,
    text: text,
    time: firebase.firestore.FieldValue.serverTimestamp()
  });

  input.value = "";
}

// ROOM LOADING
function loadRoom(room) {
  if (unsub) unsub();
  currentRoom = room;
  
  document.getElementById("roomName").textContent = `🌌 ${room}`;
  document.getElementById("messages").innerHTML = "";
  
  const showTimestamps = localStorage.getItem('showTimestamps') === 'true';
  
  unsub = db.collection("rooms").doc(room).collection("messages")
    .orderBy("time")
    .limitToLast(50)
    .onSnapshot(snapshot => {
      document.getElementById("messages").innerHTML = "";
      
      snapshot.forEach(doc => {
        const m = doc.data();
        
        const div = document.createElement("div");
        div.className = "message";
        
        // Avatar
        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        avatar.textContent = m.user[0].toUpperCase();
        div.appendChild(avatar);
        
        // Content
        const content = document.createElement("div");
        content.className = "message-content";
        
        // Username
        const usernameSpan = document.createElement("span");
        usernameSpan.className = "username";
        usernameSpan.textContent = m.user;
        content.appendChild(usernameSpan);
        
        // Timestamp
        if (showTimestamps && m.time) {
          const timestamp = document.createElement("span");
          timestamp.className = "timestamp";
          const date = m.time.toDate();
          const hours = date.getHours().toString().padStart(2, '0');
          const mins = date.getMinutes().toString().padStart(2, '0');
          timestamp.textContent = ` ${hours}:${mins}`;
          content.appendChild(timestamp);
        }
        
        // Message text
        const textSpan = document.createElement("span");
        textSpan.textContent = `: ${m.text}`;
        content.appendChild(textSpan);
        
        div.appendChild(content);
        document.getElementById("messages").appendChild(div);
      });
      
      // Auto scroll to bottom
      const messages = document.getElementById("messages");
      messages.scrollTop = messages.scrollHeight;
    });
}

// Room switching
document.querySelectorAll(".room").forEach(r => {
  r.onclick = function() {
    document.querySelectorAll(".room").forEach(x => x.classList.remove("active"));
    this.classList.add("active");
    loadRoom(this.dataset.room);
  };
});

// Online presence
function startPresence() {
  setInterval(() => {
    db.collection("presence").doc(username).set({lastSeen: Date.now()});
  }, 5000);
}

// Enter to send
document.getElementById("msgInput").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
