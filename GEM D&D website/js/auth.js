// Local Mock Firebase SDK & Offline Database
// Backed by localStorage to support complete client-side functionality.

// Default users for local storage database
const defaultUsersMap = {
  "u-admin": {
    email: "admin@kbr.co.za",
    password: "Admin1234!",
    name: "Admin User",
    role: "admin",
    company: "KBR Corporate",
    phone: "+27 82 123 4567"
  },
  "u-employee": {
    email: "employee@kbr.co.za",
    password: "Demo1234!",
    name: "Sipho Ndlovu",
    role: "employee",
    company: "KBR Solutions",
    phone: "+27 82 123 4567"
  },
  "u-client": {
    email: "client@kbr.co.za",
    password: "Demo1234!",
    name: "Smith Co.",
    role: "client",
    company: "Smith Co.",
    phone: "+27 82 123 4567"
  }
};

const DATABASE_DEFAULTS = {
  kbr_invoices: [],
  kbr_projects: [],
  kbr_project_files: [
    { id: "pf-1", projectId: 1, name: "Q1_Tax_Brief.txt", content: "KBR Business Solutions - Q1 Tax Filing project brief and milestones." },
    { id: "pf-2", projectId: 2, name: "Payroll_Requirements.txt", content: "Apex Ltd - Payroll setup and system requirements document." }
  ],
  kbr_appointments: [],
  kbr_courses: [
    {
      level: "Beginner", type: "Video", rating: "4.8", title: "Invoicing Administration", desc: "Master invoicing workflows, from creation to reconciliation.", time: "3h 20m", price: "R850",
      modules: ["Introduction to Invoicing", "Creating Invoices", "Tracking & Reconciliation"],
      more: "+1 more..",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      bookUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      level: "Intermediate", type: "Video", rating: "4.9", title: "QuickBooks for Clients", desc: "Navigate QuickBooks like a pro. Reports, reconciliation, and more.", time: "5h 10m", price: "R920",
      modules: ["Getting Started"],
      more: "+3 more..",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      bookUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      level: "Intermediate", type: "Video", rating: "4.6", title: "Payroll Management Essentials", desc: "Learn to process payroll, pensions, and SARS submissions.", time: "4h 00m", price: "R1,190",
      modules: ["Payroll Setup", "PAYE & UIF", "Payslips"],
      more: "+1 more..",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      bookUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      level: "Advanced", type: "Book", rating: "4.8", title: "Financial Reporting for SMEs", desc: "Build professional management reports for small businesses.", time: "3h 50m", price: "R1,020",
      modules: ["Chapter 1: Introduction", "Chapter 2: Balance Sheets", "Chapter 3: Income Statements"],
      more: "+2 more..",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      bookUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ],
  kbr_employee_tasks: [
    { id: 1, title: "Review Smith Co. Tax Documents", assignee: "Sipho Ndlovu", status: "completed" },
    { id: 2, title: "Setup Payroll for Apex Ltd", assignee: "Lindiwe Dlamini", status: "in_progress" },
    { id: 3, title: "File VAT for Green & Sons", assignee: "Sipho Ndlovu", status: "pending" }
  ],
  kbr_clock_logs: []
};

// Initialize seed data if not present
function initLocalStorageDefaults() {
  let users = null;
  try {
    const stored = localStorage.getItem("kbr_users");
    if (stored) {
      users = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error parsing kbr_users from localStorage:", e);
  }

  if (!users || typeof users !== "object") {
    localStorage.setItem("kbr_users", JSON.stringify(defaultUsersMap));
  } else {
    let updated = false;
    for (const key in defaultUsersMap) {
      if (!users[key]) {
        users[key] = defaultUsersMap[key];
        updated = true;
      }
    }
    if (updated) {
      localStorage.setItem("kbr_users", JSON.stringify(users));
    }
  }

  for (const key in DATABASE_DEFAULTS) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(DATABASE_DEFAULTS[key]));
    }
  }
}
initLocalStorageDefaults();

// Mock Snapshot
class MockSnapshot {
  constructor(value) {
    this._value = value;
  }
  val() {
    return this._value;
  }
  exists() {
    return this._value !== null && this._value !== undefined;
  }
}

// Global subscriptions registry
const pathListeners = {};

function getLocalDataAtPath(path) {
  const normPath = path.replace(/\/$/, "");
  if (normPath === "users") {
    return JSON.parse(localStorage.getItem("kbr_users")) || {};
  }
  if (normPath.startsWith("users/")) {
    const uid = normPath.substring(6);
    const users = JSON.parse(localStorage.getItem("kbr_users")) || {};
    return users[uid] || null;
  }
  if (normPath.startsWith("kbr_data/")) {
    const key = normPath.substring(9);
    const val = localStorage.getItem(key);
    try { return val ? JSON.parse(val) : null; } catch { return val; }
  }
  if (normPath === "kbr_data") {
    const keys = ["kbr_invoices", "kbr_projects", "kbr_project_files", "kbr_appointments", "kbr_courses", "kbr_employee_tasks", "kbr_clock_logs", "kbr_notif_client", "kbr_notif_admin", "kbr_users", "kbr_uploaded_reports"];
    const obj = {};
    keys.forEach(k => {
      try { obj[k] = JSON.parse(localStorage.getItem(k)); } catch { obj[k] = localStorage.getItem(k); }
    });
    return obj;
  }
  return null;
}

function setLocalDataAtPath(path, val) {
  const normPath = path.replace(/\/$/, "");
  if (normPath === "users") {
    localStorage.setItem("kbr_users", JSON.stringify(val));
    window.dispatchEvent(new Event("storage"));
    triggerListeners(normPath, val);
    for (const uid in val) {
      triggerListeners(`users/${uid}`, val[uid]);
    }
    return;
  }
  if (normPath.startsWith("users/")) {
    const uid = normPath.substring(6);
    const users = JSON.parse(localStorage.getItem("kbr_users")) || {};
    users[uid] = val;
    localStorage.setItem("kbr_users", JSON.stringify(users));
    window.dispatchEvent(new Event("storage"));
    triggerListeners(normPath, val);
    triggerListeners("users", users);
    return;
  }
  if (normPath.startsWith("kbr_data/")) {
    const key = normPath.substring(9);
    localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val);
    window.dispatchEvent(new Event("storage"));
    triggerListeners(normPath, val);
    return;
  }
  if (normPath === "kbr_data") {
    for (const key in val) {
      localStorage.setItem(key, typeof val[key] === 'object' ? JSON.stringify(val[key]) : val[key]);
      triggerListeners(`kbr_data/${key}`, val[key]);
    }
    window.dispatchEvent(new Event("storage"));
    triggerListeners("kbr_data", val);
    return;
  }
}

function updateLocalDataAtPath(path, val) {
  const normPath = path.replace(/\/$/, "");
  if (normPath.startsWith("users/")) {
    const uid = normPath.substring(6);
    const users = JSON.parse(localStorage.getItem("kbr_users")) || {};
    users[uid] = { ...(users[uid] || {}), ...val };
    localStorage.setItem("kbr_users", JSON.stringify(users));
    window.dispatchEvent(new Event("storage"));
    triggerListeners(normPath, users[uid]);
    triggerListeners("users", users);
    return;
  }
  if (normPath.startsWith("kbr_data/")) {
    const key = normPath.substring(9);
    let original = null;
    try { original = JSON.parse(localStorage.getItem(key)); } catch {}
    if (original && typeof original === 'object') {
      const updated = { ...original, ...val };
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      triggerListeners(normPath, updated);
    } else {
      setLocalDataAtPath(path, val);
    }
    return;
  }
}

function removeLocalDataAtPath(path) {
  const normPath = path.replace(/\/$/, "");
  if (normPath.startsWith("users/")) {
    const uid = normPath.substring(6);
    const users = JSON.parse(localStorage.getItem("kbr_users")) || {};
    delete users[uid];
    localStorage.setItem("kbr_users", JSON.stringify(users));
    window.dispatchEvent(new Event("storage"));
    triggerListeners(normPath, null);
    triggerListeners("users", users);
    return;
  }
  if (normPath.startsWith("kbr_data/")) {
    const key = normPath.substring(9);
    localStorage.removeItem(key);
    window.dispatchEvent(new Event("storage"));
    triggerListeners(normPath, null);
    return;
  }
}

function registerListener(path, callback) {
  const normPath = path.replace(/\/$/, "");
  if (!pathListeners[normPath]) {
    pathListeners[normPath] = [];
  }
  pathListeners[normPath].push(callback);
  
  // Call immediately
  const val = getLocalDataAtPath(normPath);
  callback(new MockSnapshot(val));
}

function triggerListeners(path, val) {
  const normPath = path.replace(/\/$/, "");
  const listeners = pathListeners[normPath];
  if (listeners) {
    listeners.forEach(cb => {
      try { cb(new MockSnapshot(val)); } catch (e) { console.error(e); }
    });
  }
}

// Sync across tabs
window.addEventListener("storage", () => {
  for (const path in pathListeners) {
    const val = getLocalDataAtPath(path);
    triggerListeners(path, val);
  }
});

// Mock Query
class MockQuery {
  constructor(path, childKey) {
    this.path = path;
    this.childKey = childKey;
  }
  equalTo(value) {
    return {
      once: async (event) => {
        if (event !== 'value') throw new Error("Only value is supported in query");
        const rawData = getLocalDataAtPath(this.path) || {};
        const filteredObj = {};
        for (const key in rawData) {
          if (rawData[key] && rawData[key][this.childKey] === value) {
            filteredObj[key] = rawData[key];
          }
        }
        return new MockSnapshot(filteredObj);
      }
    };
  }
}

// Mock Database Reference
class MockRef {
  constructor(path) {
    this.path = path;
  }
  async set(val) {
    setLocalDataAtPath(this.path, val);
  }
  async update(val) {
    updateLocalDataAtPath(this.path, val);
  }
  async remove() {
    removeLocalDataAtPath(this.path);
  }
  async once(event) {
    if (event !== 'value') throw new Error("Only value is supported in once()");
    const val = getLocalDataAtPath(this.path);
    return new MockSnapshot(val);
  }
  on(event, callback) {
    if (event !== 'value') throw new Error("Only value is supported in on()");
    registerListener(this.path, callback);
    return callback;
  }
  off(event, callback) {
    const normPath = this.path.replace(/\/$/, "");
    if (pathListeners[normPath]) {
      if (callback) {
        pathListeners[normPath] = pathListeners[normPath].filter(cb => cb !== callback);
      } else {
        pathListeners[normPath] = [];
      }
    }
  }
  orderByChild(childKey) {
    return new MockQuery(this.path, childKey);
  }
}

// Mock User Account object
class MockUser {
  constructor(profile, uid) {
    this.uid = uid;
    this.email = profile.email;
    this.name = profile.name;
    this.role = profile.role;
  }
  async updatePassword(newPassword) {
    const users = JSON.parse(localStorage.getItem("kbr_users")) || {};
    if (users[this.uid]) {
      users[this.uid].password = newPassword;
      localStorage.setItem("kbr_users", JSON.stringify(users));
    }
  }
  async delete() {
    const users = JSON.parse(localStorage.getItem("kbr_users")) || {};
    delete users[this.uid];
    localStorage.setItem("kbr_users", JSON.stringify(users));
    localStorage.removeItem("kbr_session");
  }
}

// Mock Auth Class
class MockAuth {
  constructor() {
    this._listeners = [];
  }
  get currentUser() {
    const session = JSON.parse(localStorage.getItem("kbr_session"));
    if (!session) return null;
    const users = JSON.parse(localStorage.getItem("kbr_users")) || {};
    const uid = Object.keys(users).find(k => users[k].email === session.email);
    if (!uid) return null;
    return new MockUser(users[uid], uid);
  }
  async signInWithEmailAndPassword(email, password) {
    const users = JSON.parse(localStorage.getItem("kbr_users")) || {};
    const uid = Object.keys(users).find(k => users[k].email.toLowerCase() === email.toLowerCase());
    if (!uid || users[uid].password !== password) {
      const err = new Error("Invalid email or password.");
      err.code = "auth/wrong-password";
      throw err;
    }
    const profile = users[uid];
    const session = {
      email: profile.email,
      role: profile.role || 'client',
      name: profile.name || 'User'
    };
    localStorage.setItem("kbr_session", JSON.stringify(session));
    this._triggerAuthStateChanged();
    return { user: new MockUser(profile, uid) };
  }
  async createUserWithEmailAndPassword(email, password) {
    const users = JSON.parse(localStorage.getItem("kbr_users")) || {};
    const exists = Object.keys(users).some(k => users[k].email.toLowerCase() === email.toLowerCase());
    if (exists) {
      const err = new Error("The email address is already in use by another account.");
      err.code = "auth/email-already-in-use";
      throw err;
    }
    const uid = "u-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const profile = {
      email: email,
      password: password,
      name: email.split('@')[0],
      role: 'client',
      company: '',
      phone: ''
    };
    users[uid] = profile;
    localStorage.setItem("kbr_users", JSON.stringify(users));
    
    // Also update profile data in database representation
    triggerListeners("users", users);
    triggerListeners(`users/${uid}`, profile);

    const session = {
      email: profile.email,
      role: profile.role,
      name: profile.name
    };
    localStorage.setItem("kbr_session", JSON.stringify(session));
    this._triggerAuthStateChanged();
    return { user: new MockUser(profile, uid) };
  }
  async signOut() {
    localStorage.removeItem("kbr_session");
    this._triggerAuthStateChanged();
  }
  onAuthStateChanged(callback) {
    this._listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this._listeners = this._listeners.filter(cb => cb !== callback);
    };
  }
  _triggerAuthStateChanged() {
    const user = this.currentUser;
    this._listeners.forEach(cb => {
      try { cb(user); } catch (e) { console.error(e); }
    });
  }
  async setPersistence() {
    return Promise.resolve();
  }
}

// Define the global window.firebase Mock SDK
const mockAuthInstance = new MockAuth();
const mockFirebase = {
  apps: [{ name: "[DEFAULT]" }],
  initializeApp: (config, name) => {
    return {
      auth: () => mockAuthInstance,
      database: () => ({
        ref: (path) => new MockRef(path)
      }),
      delete: async () => { return Promise.resolve(); }
    };
  },
  auth: () => mockAuthInstance,
  database: () => ({
    ref: (path) => new MockRef(path)
  })
};
mockFirebase.auth.Auth = {
  Persistence: {
    LOCAL: "local",
    SESSION: "session"
  }
};
window.firebase = mockFirebase;
const firebaseConfig = {}; // Dummy empty config object


// Helper to ensure Firebase SDK is loaded before executing auth functions
// (Already fulfilled synchronously by our mock)
function ensureFirebaseLoaded(callback) {
  if (window.firebase && firebase.auth && firebase.database) {
    return callback();
  }
  // Fallback (should not be hit)
  callback();
}

// Clock in/out helpers
function clockInEmployee(employeeName) {
  const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

  let logs = JSON.parse(localStorage.getItem("kbr_clock_logs")) || [];
  const active = logs.find(log => log.employeeName === employeeName && !log.clockOut);
  if (active) return; // already clocked in

  const newLog = {
    id: "clock-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    employeeName: employeeName,
    date: dateStr,
    clockIn: timeStr,
    clockOut: null
  };

  logs.unshift(newLog);
  localStorage.setItem("kbr_clock_logs", JSON.stringify(logs));
}

function clockOutEmployee(employeeName) {
  const timeStr = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

  let logs = JSON.parse(localStorage.getItem("kbr_clock_logs")) || [];
  const active = logs.find(log => log.employeeName === employeeName && !log.clockOut);
  if (active) {
    active.clockOut = timeStr;
    localStorage.setItem("kbr_clock_logs", JSON.stringify(logs));
  }
}

const browserLocalPersistence = "local";
const browserSessionPersistence = "session";

async function setPersistence(auth, persistenceType) {
  return auth.setPersistence(persistenceType);
}

async function sendPasswordResetEmail(auth, email) {
  return Promise.resolve(); // Mock success
}

async function login(email, password, rememberMe = false) {
  return new Promise((resolve, reject) => {
    ensureFirebaseLoaded(async () => {
      try {
        const auth = firebase.auth();
        const db = firebase.database();

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Fetch additional profile info (role, name) from database
        const userSnapshot = await db.ref(`users/${user.uid}`).once('value');
        const profile = userSnapshot.val();

        if (!profile) {
          throw new Error("User profile not found in database.");
        }

        const session = {
          email: user.email,
          role: profile.role || 'client',
          name: profile.name || 'User'
        };

        localStorage.setItem("kbr_session", JSON.stringify(session));

        if (session.role === "employee") {
          clockInEmployee(session.name);
        }

        resolve(session);
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function registerUser(email, password, profileData) {
  return new Promise((resolve, reject) => {
    ensureFirebaseLoaded(async () => {
      try {
        const auth = firebase.auth();
        const db = firebase.database();

        // Create Auth user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save profile data in Realtime Database
        const newProfile = {
          email: email,
          name: profileData.name || 'New Client',
          company: profileData.company || '',
          phone: profileData.phone || '',
          vat: profileData.vat || '',
          role: profileData.role || 'client'
        };

        await db.ref(`users/${user.uid}`).set(newProfile);
        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function sendPasswordReset(email) {
  return new Promise((resolve, reject) => {
    ensureFirebaseLoaded(async () => {
      try {
        const auth = firebase.auth();
        await sendPasswordResetEmail(auth, email);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

function getSession() {
  try { return JSON.parse(localStorage.getItem("kbr_session")); } catch { return null; }
}

async function deleteCurrentUser() {
  return new Promise((resolve, reject) => {
    ensureFirebaseLoaded(async () => {
      try {
        const user = firebase.auth().currentUser;
        if (!user) {
          throw new Error("No authenticated user found. Please log in again.");
        }
        const uid = user.uid;
        const db = firebase.database();
        await db.ref(`users/${uid}`).remove();
        await user.delete();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

function signOut() {
  ensureFirebaseLoaded(async () => {
    try {
      await firebase.auth().signOut();
    } catch (e) {
      console.error("Firebase signOut error:", e);
    }
    localStorage.removeItem("kbr_session");
    window.location.href = "login.html";
  });
}

function requireAuth(allowedRoles) {
  const s = getSession();
  if (!s) { window.location.href = "login.html"; return null; }
  if (allowedRoles && !allowedRoles.includes(s.role)) { window.location.href = "dashboard.html"; return null; }
  return s;
}
