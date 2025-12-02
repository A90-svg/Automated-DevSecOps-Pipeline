/* eslint-env browser */
// =====================================
// SPA Router + State with localStorage persistence
// - Persist db (user, balance, transactions) to localStorage
// - Persist session (loggedIn/email) to localStorage so refresh keeps login (optional)
// - All major mutations call saveDB() to persist
// =====================================

// -----------------------
// Storage keys & defaults
// -----------------------
// Keys used in localStorage so we can persist across page refreshes.
const STORAGE_DB_KEY = 'finsecure_db_v1';
const STORAGE_SESSION_KEY = 'finsecure_session_v1';

// EmailJS configuration handled securely

// Secure random reference generator
function generateSecureRef(prefix) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return prefix + array[0].toString(36).slice(2, 8).toUpperCase();
}

// DEFAULT_DB: base data used when no saved db exists. Kept as a JS constant.
// PayTabs's Developers can update this default dataset if they want different demo data.
const DEFAULT_DB = {
  // Support multiple users - store as object with email as key
  users: {
    'finsecureapp@gmail.com': {
      first: 'Lily',
      last: 'Blue',
      email: 'finsecureapp@gmail.com',
      phone: '33344455',
      password:
        typeof import.meta.env !== 'undefined' && import.meta.env.VITE_DEFAULT_PASSWORD
          ? import.meta.env.VITE_DEFAULT_PASSWORD
          : 'FinSecure123!', // Default password
      mfaEnabled: true,
      balance: 1842.75,
      transactions: [
        {
          title: 'City Market',
          note: 'Groceries',
          amount: -22.95,
          date: '2025-10-28 18:23',
          ref: 'CC-10281823',
        },
        {
          title: 'Fuel Station',
          note: 'Petrol top-up',
          amount: -7.0,
          date: '2025-10-27 09:12',
          ref: 'FS-10270912',
        },
        {
          title: 'Bank Transfer',
          note: 'Transfer to Ali',
          amount: -50.0,
          date: '2025-10-26 21:05',
          ref: 'BT-10262105',
        },
        {
          title: 'Settlement',
          note: 'Freelance payout',
          amount: +120.0,
          date: '2025-10-26 15:42',
          ref: 'SET-10261542',
        },
        {
          title: 'Local Diner',
          note: 'Dinner',
          amount: -5.8,
          date: '2025-10-25 19:56',
          ref: 'LD-10251956',
        },
        {
          title: 'Supermarket',
          note: 'Household',
          amount: -18.2,
          date: '2025-10-24 13:14',
          ref: 'SM-10241314',
        },
        {
          title: 'Mobile Recharge',
          note: 'Top-up',
          amount: -3.0,
          date: '2025-10-23 20:44',
          ref: 'MR-10232044',
        },
        {
          title: 'Utilities',
          note: 'Electricity',
          amount: -28.35,
          date: '2025-10-23 08:10',
          ref: 'UT-10230810',
        },
        {
          title: 'Coffee Shop',
          note: 'Coffee',
          amount: -2.7,
          date: '2025-10-22 11:02',
          ref: 'CS-10221102',
        },
        {
          title: 'Delivery Service',
          note: 'Lunch order',
          amount: -6.9,
          date: '2025-10-21 13:47',
          ref: 'DS-10211347',
        },
        {
          title: 'Bank Transfer',
          note: 'Transfer from Sara',
          amount: +75.0,
          date: '2025-10-21 10:15',
          ref: 'BT-10211015',
        },
        {
          title: 'Marketplace',
          note: 'Electronics',
          amount: -49.99,
          date: '2025-10-20 21:33',
          ref: 'MP-10202133',
        },
        {
          title: 'Telco',
          note: 'Fiber bill',
          amount: -16.0,
          date: '2025-10-19 09:00',
          ref: 'TEL-10210900',
        },
        {
          title: 'Fuel Station',
          note: 'Petrol',
          amount: -6.5,
          date: '2025-10-18 08:40',
          ref: 'FS-10180840',
        },
        {
          title: 'Cinema',
          note: 'Tickets',
          amount: -14.0,
          date: '2025-10-17 20:10',
          ref: 'CIN-10172010',
        },
        {
          title: 'Hotel Booking',
          note: 'Weekend stay',
          amount: -122.0,
          date: '2025-10-16 14:22',
          ref: 'HTL-10161422',
        },
        {
          title: 'Bank Transfer',
          note: 'Rent',
          amount: -300.0,
          date: '2025-10-15 12:00',
          ref: 'BT-10151200',
        },
        {
          title: 'Refund',
          note: 'Accessory',
          amount: +9.99,
          date: '2025-10-14 17:11',
          ref: 'RF-10141711',
        },
        {
          title: 'Burger',
          note: 'Meal',
          amount: -4.6,
          date: '2025-10-13 19:29',
          ref: 'BG-10131929',
        },
        {
          title: 'Pharmacy',
          note: 'Health items',
          amount: -8.25,
          date: '2025-10-12 16:05',
          ref: 'PH-10121605',
        },
        {
          title: 'Government',
          note: 'Fee',
          amount: -2.0,
          date: '2025-10-12 09:30',
          ref: 'GV-10120930',
        },
        {
          title: 'Settlement',
          note: 'Payout',
          amount: +80.0,
          date: '2025-10-11 22:14',
          ref: 'SET-10112214',
        },
        {
          title: 'Supermarket',
          note: 'Groceries',
          amount: -27.3,
          date: '2025-10-11 15:49',
          ref: 'SM-10111549',
        },
        {
          title: 'Mobile Recharge',
          note: 'Mobile',
          amount: -5.0,
          date: '2025-10-10 10:22',
          ref: 'MR-10101022',
        },
        {
          title: 'Corner Store',
          note: 'Snacks',
          amount: -6.1,
          date: '2025-10-09 19:17',
          ref: 'CS-10091917',
        },
        {
          title: 'Utilities',
          note: 'Water',
          amount: -9.75,
          date: '2025-10-08 07:54',
          ref: 'UT-10080754',
        },
        {
          title: 'Delivery Service',
          note: 'Dinner',
          amount: -12.3,
          date: '2025-10-07 21:32',
          ref: 'DS-10072132',
        },
        {
          title: 'Coffee Shop',
          note: 'Coffee',
          amount: -3.1,
          date: '2025-10-06 08:44',
          ref: 'CS-10060844',
        },
        {
          title: 'Fuel Station',
          note: 'Petrol',
          amount: -6.8,
          date: '2025-10-05 12:06',
          ref: 'FS-10051206',
        },
        {
          title: 'Cinema',
          note: 'Tickets',
          amount: -10.0,
          date: '2025-10-04 20:05',
          ref: 'CIN-10042005',
        },
        {
          title: 'Bank Transfer',
          note: 'Transfer to Ahmed',
          amount: -40.0,
          date: '2025-10-03 16:12',
          ref: 'BT-10031612',
        },
        {
          title: 'Settlement',
          note: 'Payout',
          amount: +150.0,
          date: '2025-10-02 14:00',
          ref: 'SET-10021400',
        },
        {
          title: 'Telco',
          note: 'Mobile bill',
          amount: -11.0,
          date: '2025-10-01 09:15',
          ref: 'TEL-10010915',
        },
        {
          title: 'Refund',
          note: 'Order issue',
          amount: +4.5,
          date: '2025-09-30 13:44',
          ref: 'RF-09301344',
        },
        {
          title: 'Local Diner',
          note: 'Lunch',
          amount: -5.4,
          date: '2025-09-29 12:10',
          ref: 'LD-09291210',
        },
        {
          title: 'Supermarket',
          note: 'Groceries',
          amount: -21.8,
          date: '2025-09-28 17:41',
          ref: 'SM-09281741',
        },
        {
          title: 'Fuel Station',
          note: 'Petrol',
          amount: -7.2,
          date: '2025-09-27 18:22',
          ref: 'FS-09271822',
        },
        {
          title: 'Delivery Service',
          note: 'Snacks',
          amount: -3.9,
          date: '2025-09-26 19:40',
          ref: 'DS-09261940',
        },
        {
          title: 'Coffee Shop',
          note: 'Coffee',
          amount: -3.3,
          date: '2025-09-26 08:14',
          ref: 'CS-09260814',
        },
        {
          title: 'Bank Transfer',
          note: 'Transfer from Fatima',
          amount: +60.0,
          date: '2025-09-25 09:05',
          ref: 'BT-09250905',
        },
        {
          title: 'Utilities',
          note: 'Electricity',
          amount: -29.0,
          date: '2025-09-24 07:55',
          ref: 'UT-09240755',
        },
        {
          title: 'City Market',
          note: 'Groceries',
          amount: -17.65,
          date: '2025-09-23 18:38',
          ref: 'CC-09231838',
        },
        {
          title: 'Mobile Recharge',
          note: 'Mobile',
          amount: -3.0,
          date: '2025-09-22 21:12',
          ref: 'MR-09222112',
        },
        {
          title: 'Settlement',
          note: 'Freelance',
          amount: +95.0,
          date: '2025-09-21 16:40',
          ref: 'SET-09211640',
        },
        {
          title: 'Cinema',
          note: 'Tickets',
          amount: -12.0,
          date: '2025-09-20 20:20',
          ref: 'CIN-09202020',
        },
        {
          title: 'Marketplace',
          note: 'Books',
          amount: -18.75,
          date: '2025-09-19 22:02',
          ref: 'MP-09192202',
        },
        {
          title: 'Pharmacy',
          note: 'Essentials',
          amount: -9.2,
          date: '2025-09-18 10:44',
          ref: 'PH-09181044',
        },
        {
          title: 'Telco',
          note: 'Fiber bill',
          amount: -16.0,
          date: '2025-09-17 09:00',
          ref: 'TEL-09170900',
        },
        {
          title: 'Local Diner',
          note: 'Dinner',
          amount: -6.0,
          date: '2025-09-16 19:18',
          ref: 'LD-09161918',
        },
        {
          title: 'Supermarket',
          note: 'Groceries',
          amount: -23.45,
          date: '2025-09-15 14:56',
          ref: 'SM-09151456',
        },
        {
          title: 'Delivery Service',
          note: 'Lunch',
          amount: -8.1,
          date: '2025-09-14 12:30',
          ref: 'DS-09141230',
        },
        {
          title: 'Fuel Station',
          note: 'Petrol',
          amount: -6.6,
          date: '2025-09-13 07:50',
          ref: 'FS-09130750',
        },
        {
          title: 'Refund',
          note: 'Item return',
          amount: +12.0,
          date: '2025-09-12 11:22',
          ref: 'RF-09121122',
        },
        {
          title: 'Bank Transfer',
          note: 'Rent',
          amount: -300.0,
          date: '2025-09-11 12:00',
          ref: 'BT-09111200',
        },
        {
          title: 'Settlement',
          note: 'Payout',
          amount: +130.0,
          date: '2025-09-10 14:00',
          ref: 'SET-09101400',
        },
      ],
    },
  },
  // Current logged-in user email (for quick access)
  currentUser: 'finsecureapp@gmail.com',
  pendingReset: false,
  pendingOTP: null,
};

// Mutable state for runtime - db holds the app data, cloned from defaults initially.
let db = JSON.parse(JSON.stringify(DEFAULT_DB)); // deep clone so we can mutate safely.

// Helper to get current user data
function getCurrentUser() {
  if (!db.currentUser || !db.users[db.currentUser]) {
    // Fallback to first user or default
    const firstUserEmail = Object.keys(db.users)[0] || 'finsecureapp@gmail.com';
    db.currentUser = firstUserEmail;
    if (!db.users[firstUserEmail]) {
      db.users[firstUserEmail] = JSON.parse(
        JSON.stringify(DEFAULT_DB.users['finsecureapp@gmail.com'])
      );
    }
  }
  return db.users[db.currentUser];
}
// Simple session object for demo: tracks loggedIn and email
const session = {
  loggedIn: false,
  email: null,
};

// -----------------------
// Persistence helpers
// - loadDB/saveDB: manage serialized DB in localStorage
// - loadSession/saveSession: persist login state
// -----------------------
function saveDB() {
  try {
    localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));
  } catch (e) {
    // Failed to save DB to localStorage
  }
}
function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_DB_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    // Merge parsed onto db to avoid losing references to properties that code expects.
    // Deep merge users object to preserve all user accounts
    if (parsed.users) {
      if (!db.users) db.users = {};
      Object.keys(parsed.users).forEach((email) => {
        db.users[email] = parsed.users[email];
      });
    }
    // Merge other properties
    Object.keys(parsed).forEach((k) => {
      if (k !== 'users') {
        db[k] = parsed[k];
      }
    });
  } catch (e) {
    // Failed to load DB from localStorage
  }
}

function saveSession() {
  try {
    localStorage.setItem(
      STORAGE_SESSION_KEY,
      JSON.stringify({
        loggedIn: session.loggedIn,
        email: session.email,
      })
    );
  } catch (e) {
    // Failed to save session to localStorage
  }
}
function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    session.loggedIn = !!parsed.loggedIn;
    session.email = parsed.email || null;
  } catch (e) {
    // Failed to load session from localStorage
  }
}
function clearSessionStorage() {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (e) {
    // Failed to clear session storage
  }
}

// Utility to format BHD values consistently
const formatBHD = (amt) => {
  const v = Math.abs(amt).toFixed(3);
  return `BHD ${v}`;
};

// -----------------------
// DOM references for pages, nav, inputs and controls
// - Keep them at top to make it easy to find UI wiring.
// -----------------------
const pages = {
  login: document.getElementById('page-login'),
  signup: document.getElementById('page-signup'),
  reset: document.getElementById('page-reset'),
  otp: document.getElementById('page-otp'),
  dashboard: document.getElementById('page-dashboard'),
  history: document.getElementById('page-history'),
  terms: document.getElementById('page-terms'),
};

// Brand nav control
const brandNav = document.getElementById('brand-nav');
const navLogout = document.getElementById('nav-logout');
const navLinks = document.querySelectorAll('[data-nav]');

// Inputs / Buttons
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const btnLogin = document.getElementById('btn-login');
const loginMessage = document.getElementById('login-message');

const linkForgot = document.getElementById('link-forgot');

// Signup inputs
const suFirst = document.getElementById('su-first');
const suLast = document.getElementById('su-last');
const suEmail = document.getElementById('su-email');
const suPhone = document.getElementById('su-phone');
const suPassword = document.getElementById('su-password');
const suConfirm = document.getElementById('su-confirm');
const btnSignup = document.getElementById('btn-signup');
const signupMessage = document.getElementById('signup-message');
const signupSuccess = document.getElementById('signup-success');

// Reset inputs
const rpPassword = document.getElementById('rp-password');
const rpConfirm = document.getElementById('rp-confirm');
const btnReset = document.getElementById('btn-reset');
const resetMessage = document.getElementById('reset-message');
const resetSuccess = document.getElementById('reset-success');

// OTP / MFA elements
const btnVerifyOTP = document.getElementById('btn-verify-otp');
const btnResendOTP = document.getElementById('btn-resend-otp');
const otpMessage = document.getElementById('otp-message');
const otpGrid = document.getElementById('otp-grid');
const otpHint = document.getElementById('otp-hint');
const otpTimer = document.getElementById('otp-timer');

// Dashboard elements
const balanceValue = document.getElementById('balance-value');
const visaNumber = document.getElementById('visa-number');
const visaName = document.getElementById('visa-name');

// Transaction search/list
const txSearch = document.getElementById('tx-search');
const btnSearch = document.getElementById('btn-search');
const txList = document.getElementById('tx-list');
const txCount = document.getElementById('tx-count');

// App session mock (otp timer)
let otpIntervalId = null;
const OTP_RESEND_SECONDS = 60;
let otpRemaining = 0;

// -------------------------------------------------------
// Helpers: clear sensitive inputs (improves security/UX)
// -------------------------------------------------------
function clearLoginInputs() {
  loginPassword.value = '';
}
function clearResetInputs() {
  rpPassword.value = '';
  rpConfirm.value = '';
}
function clearSignupPasswords() {
  suPassword.value = '';
  suConfirm.value = '';
}
function clearOtpInputs() {
  Array.from(otpGrid.children).forEach((inp) => (inp.value = ''));
}

// -------------------------------------------------------
// Brand nav visibility: only show when logged in
// -------------------------------------------------------
function updateBrandNavVisibility() {
  if (session.loggedIn) {
    brandNav.style.display = 'flex';
    brandNav.removeAttribute('aria-hidden');
  } else {
    brandNav.style.display = 'none';
    // Don't set aria-hidden when hidden - just use display:none
    brandNav.removeAttribute('aria-hidden');
  }
}

// =======================
// OTP UI / lifecycle
// - buildOTPInputs: creates 6 inputs and wires basic keyboard navigation
// - sendOTP: generates a demo code, stores in db.pendingOTP and starts resend timer
// - startOtpCountdown / cancelOtpTimer: manage resend cooldown UI
// =======================
function buildOTPInputs() {
  otpGrid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.maxLength = 1;
    inp.className = 'otp-input';
    inp.inputMode = 'numeric';
    inp.autocomplete = 'one-time-code';

    // When user types, automatically move to next input
    inp.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val && val.length > 0) {
        const next = otpGrid.children[i + 1];
        if (next) next.focus();
      }
    });

    // Handle backspace to move focus left (and clear)
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value) {
        const prev = otpGrid.children[i - 1];
        if (prev) {
          prev.focus();
          prev.value = '';
        }
      }
    });
    otpGrid.appendChild(inp);
  }
  if (otpGrid.children[0]) otpGrid.children[0].focus();
}

function startOtpCountdown() {
  otpRemaining = OTP_RESEND_SECONDS;
  btnResendOTP.disabled = true;
  updateOtpTimerText();
  if (otpIntervalId) clearInterval(otpIntervalId);
  otpIntervalId = setInterval(() => {
    otpRemaining--;
    if (otpRemaining <= 0) {
      clearInterval(otpIntervalId);
      otpIntervalId = null;
      btnResendOTP.disabled = false;
      otpTimer.textContent = '';
      btnResendOTP.textContent = 'Resend code';
    } else {
      updateOtpTimerText();
    }
  }, 1000);
}

function updateOtpTimerText() {
  btnResendOTP.textContent = `Resend (${otpRemaining}s)`;
  otpTimer.textContent = `You can request a new code in ${otpRemaining}s`;
}

function sendOTP() {
  // Use crypto API for secure random number generation
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const code = String(100000 + (array[0] % 900000));
  db.pendingOTP = code;
  otpMessage.style.display = 'none';
  const user = getCurrentUser();
  const targetEmail = session.email || user.email;
  otpHint.textContent = `A 6-digit code was sent to ${targetEmail}.`;
  clearOtpInputs();
  startOtpCountdown();
  // Persist pendingOTP so refresh won't lose the generated code in demo
  saveDB();
  sendOtpEmail(targetEmail, code);
}

async function sendOtpEmail(targetEmail, code) {
  // Use server-side API only for security (no exposed tokens)
  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: targetEmail, code }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errorMsg = err.error || `Failed to send email (${res.status})`;
      // Failed to send OTP email:

      // Show more detailed error message to user
      otpHint.textContent = errorMsg;
      otpMessage.textContent = errorMsg;
      otpMessage.style.display = 'block';
      return;
    }

    otpHint.textContent = `Code sent to ${targetEmail}. Check your inbox.`;
    otpMessage.style.display = 'none';
  } catch (err) {
    // Failed to send OTP email:
    const errorMsg = err.message || "We couldn't send the email. Please retry in a moment.";
    otpHint.textContent = errorMsg;
    otpMessage.textContent = errorMsg;
    otpMessage.style.display = 'block';
  }
}

function cancelOtpTimer() {
  if (otpIntervalId) {
    clearInterval(otpIntervalId);
    otpIntervalId = null;
  }
  otpTimer.textContent = '';
  btnResendOTP.disabled = false;
  btnResendOTP.textContent = 'Resend code';
}

// -------------------------------------------------------
// Render helpers
// - renderCard: update visa name & masked number
// - renderBalance: refresh displayed balance
// - renderTransactions: populate tx list
// -------------------------------------------------------
function renderCard() {
  const user = getCurrentUser();
  const name = session.loggedIn ? (user.first + ' ' + user.last).toUpperCase() : 'MARK BLUE';
  visaName.textContent = name;
  visaNumber.textContent = '4242 68•• ••21 9012';
}
function renderBalance() {
  const user = getCurrentUser();
  balanceValue.textContent = `BHD ${(user.balance || 0).toFixed(2)}`;
}
function renderTransactions(filter = '') {
  txList.innerHTML = '';
  const user = getCurrentUser();
  const transactions = user.transactions || [];
  const data = transactions.filter((tx) => {
    const key = `${tx.title} ${tx.note} ${tx.ref}`.toLowerCase();
    return key.includes(filter.toLowerCase());
  });

  // Build DOM nodes for each transaction (simple card)
  data.forEach((tx) => {
    const item = document.createElement('div');
    item.className = 'tx-item';

    const icon = document.createElement('div');
    icon.className = 'tx-icon';
    icon.textContent = tx.title.slice(0, 2).toUpperCase();

    const meta = document.createElement('div');
    meta.className = 'tx-meta';
    const t = document.createElement('div');
    t.className = 'tx-title';
    t.textContent = tx.title;
    const s = document.createElement('div');
    s.className = 'tx-sub';
    s.textContent = `${tx.note} • ${tx.date} • Ref: ${tx.ref}`;
    meta.appendChild(t);
    meta.appendChild(s);

    const amt = document.createElement('div');
    amt.className = 'tx-amount ' + (tx.amount < 0 ? 'negative' : 'positive');
    amt.textContent = (tx.amount < 0 ? '-' : '+') + formatBHD(tx.amount);

    item.appendChild(icon);
    item.appendChild(meta);
    item.appendChild(amt);

    txList.appendChild(item);
  });
  txCount.textContent = `${data.length} transactions`;
}

// -------------------------------------------------------
// Password policy check
// - Use this to validate password complexity for signup/reset flows
// -------------------------------------------------------
function checkPasswordPolicy(pw) {
  const long = pw.length >= 12;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const digit = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return long && upper && lower && digit && special;
}

// -------------------------------------------------------
// Routing & page control
// - showPage handles access control (protects dashboard/history)
// - handleRoute reads location.hash and shows appropriate page
// -------------------------------------------------------
function showPage(name) {
  // Protected pages redirect to login when not authenticated
  const protectedPages = ['dashboard', 'history'];
  if (protectedPages.includes(name) && !session.loggedIn) {
    location.hash = '#/login';
    return;
  }

  // Hide all pages then show the requested one
  Object.values(pages).forEach((p) => (p.hidden = true));
  if (pages[name]) pages[name].hidden = false;

  // Mark nav links active (if nav is visible)
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const target = href ? href.replace('#/', '') : '';
    link.classList.toggle('active', target === name);
  });

  // Clear sensitive inputs on transitions to reduce leaked credentials in UI
  if (name !== 'login') {
    clearLoginInputs();
  }
  if (name !== 'reset') {
    clearResetInputs();
  }
  if (name !== 'signup') {
    clearSignupPasswords();
  }

  // When leaving OTP page cancel timer and remove inputs
  if (name !== 'otp') {
    cancelOtpTimer();
    otpHint.textContent = '';
    if (otpGrid) otpGrid.innerHTML = '';
  }

  // Page-specific setup
  if (name === 'otp') {
    buildOTPInputs();
    sendOTP();
  }
  if (name === 'dashboard') {
    renderBalance();
    renderCard();
  }
  if (name === 'history') {
    renderTransactions();
  }

  updateBrandNavVisibility();
}

// Choose default route: if no hash and session.loggedIn show dashboard; otherwise login.
function handleRoute() {
  const hash = location.hash.replace('#/', '');
  const name = hash || (session.loggedIn ? 'dashboard' : 'login');
  showPage(name);
}

// Wire routing events
window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', () => {
  // Load stored data or use defaults
  const stored = localStorage.getItem(STORAGE_DB_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Migrate old single-user format to new multi-user format
      if (parsed.user && !parsed.users) {
        // Migrating to multi-user format...
        parsed.users = {};
        parsed.users[parsed.user.email] = {
          ...parsed.user,
          balance: parsed.balance || 0,
          transactions: parsed.transactions || [],
        };
        parsed.currentUser = parsed.user.email;
        delete parsed.user;
        delete parsed.balance;
        delete parsed.transactions;
      }
      // Ensure default user exists
      if (!parsed.users || !parsed.users['finsecureapp@gmail.com']) {
        if (!parsed.users) parsed.users = {};
        parsed.users['finsecureapp@gmail.com'] = JSON.parse(
          JSON.stringify(DEFAULT_DB.users['finsecureapp@gmail.com'])
        );
      }
      // Load the parsed data
      loadDB();
    } catch (e) {
      // If parsing fails, reset to defaults
      // Failed to parse stored DB, resetting to defaults
      db = JSON.parse(JSON.stringify(DEFAULT_DB));
      saveDB();
    }
  } else {
    // No stored data, use defaults
    db = JSON.parse(JSON.stringify(DEFAULT_DB));
    saveDB();
  }

  loadSession();

  // If first time (no stored db) persist default so subsequent refreshes keep changes
  // (this won't overwrite an existing DB because loadDB only merges if something present)
  saveDB();

  // If session indicates logged in, keep logged-in state across refresh
  updateBrandNavVisibility();

  // If user already logged in and no explicit route, show dashboard
  handleRoute();
  renderCard();
  updateBrandNavVisibility();
});

// -------------------------------------------------------
// Authentication / Events
// -------------------------------------------------------

// Login button click handler
btnLogin.addEventListener('click', () => {
  loginMessage.style.display = 'none';
  const email = (loginEmail.value || '').trim();
  const pw = loginPassword.value || '';

  if (!email || !pw) {
    loginMessage.textContent = 'Please enter email and password.';
    loginMessage.style.display = 'block';
    return;
  }

  // Check credentials against users object (case-insensitive email)
  const emailLower = email.toLowerCase();
  const user = Object.values(db.users || {}).find((u) => u.email.toLowerCase() === emailLower);

  if (user && pw === user.password) {
    // Set current user
    db.currentUser = user.email;
    saveDB();

    session.email = email;
    // persist session state
    session.loggedIn = false; // will set true after MFA or directly if not required
    saveSession();

    if (user.mfaEnabled) {
      location.hash = '#/otp';
    } else {
      session.loggedIn = true;
      saveSession();
      updateBrandNavVisibility();
      location.hash = '#/dashboard';
    }
  } else {
    loginMessage.textContent = 'Invalid email or password.';
    loginMessage.style.display = 'block';
    clearLoginInputs();
  }
});

// "Forgot password" handler: set pendingReset in db and go to reset page
linkForgot.addEventListener('click', (e) => {
  e.preventDefault();
  db.pendingReset = true;
  saveDB();
  clearResetInputs();
  location.hash = '#/reset';
});

// Signup handler: validate, save to db and persist
btnSignup.addEventListener('click', () => {
  signupMessage.style.display = 'none';
  signupSuccess.style.display = 'none';

  const first = (suFirst.value || '').trim();
  const last = (suLast.value || '').trim();
  const email = (suEmail.value || '').trim();
  const phone = (suPhone.value || '').trim();
  const pw = suPassword.value || '';
  const cf = suConfirm.value || '';

  if (!first || !last || !email || !phone || !pw || !cf) {
    signupMessage.textContent = 'Please complete all fields.';
    signupMessage.style.display = 'block';
    return;
  }
  if (!checkPasswordPolicy(pw)) {
    signupMessage.textContent =
      'Password must be >= 12 characters and include uppercase, lowercase, number, and special character.';
    signupMessage.style.display = 'block';
    return;
  }
  if (pw !== cf) {
    signupMessage.textContent = 'Passwords do not match.';
    signupMessage.style.display = 'block';
    return;
  }

  // Save new user to users object
  if (!db.users) {
    db.users = {};
  }

  // Initialize user with default balance and empty transactions if new
  if (!db.users[email]) {
    db.users[email] = {
      first,
      last,
      email,
      phone,
      password: pw,
      mfaEnabled: true,
      balance: 0,
      transactions: [],
    };
  } else {
    // Update existing user info
    db.users[email] = { ...db.users[email], first, last, phone, password: pw };
  }

  // Set as current user
  db.currentUser = email;
  saveDB();

  signupSuccess.textContent = 'Signup successful. Redirecting to login...';
  signupSuccess.style.display = 'block';

  setTimeout(() => {
    suPassword.value = '';
    suConfirm.value = '';
    location.hash = '#/login';
  }, 1200);
});

btnReset.addEventListener('click', () => {
  resetMessage.style.display = 'none';
  resetSuccess.style.display = 'none';

  const pw = rpPassword.value || '';
  const cf = rpConfirm.value || '';

  if (!checkPasswordPolicy(pw)) {
    resetMessage.textContent =
      'Password must be >= 12 characters and include uppercase, lowercase, number, and special character.';
    resetMessage.style.display = 'block';
    return;
  }
  if (pw !== cf) {
    resetMessage.textContent = 'Passwords do not match.';
    resetMessage.style.display = 'block';
    return;
  }

  const user = getCurrentUser();
  user.password = pw;
  db.pendingReset = false;
  saveDB();

  resetSuccess.textContent = 'Password reset successful. Redirecting to login...';
  resetSuccess.style.display = 'block';

  setTimeout(() => {
    clearResetInputs();
    location.hash = '#/login';
  }, 1200);
});

btnVerifyOTP.addEventListener('click', () => {
  otpMessage.style.display = 'none';
  const code = Array.from(otpGrid.children)
    .map((i) => i.value)
    .join('');
  if (code.length !== 6) {
    otpMessage.textContent = 'Please enter the 6-digit code.';
    otpMessage.style.display = 'block';
    return;
  }
  if (code !== db.pendingOTP) {
    otpMessage.textContent = 'Incorrect code. Try again or resend.';
    otpMessage.style.display = 'block';
    clearOtpInputs();
    return;
  }
  // Success
  session.loggedIn = true;
  const user = getCurrentUser();
  session.email = session.email || user.email;
  db.pendingOTP = null;
  saveDB();
  saveSession();
  cancelOtpTimer();
  updateBrandNavVisibility();
  location.hash = '#/dashboard';
});

btnResendOTP.addEventListener('click', (e) => {
  e.preventDefault();
  if (btnResendOTP.disabled) return;
  sendOTP();
});

// Logout handler (top nav)
navLogout.addEventListener('click', (e) => {
  e.preventDefault();
  session.loggedIn = false;
  session.email = null;
  clearSessionStorage();
  clearLoginInputs();
  clearResetInputs();
  clearSignupPasswords();
  cancelOtpTimer();
  db.pendingOTP = null;
  saveDB(); // persist cleared pendingOTP
  otpHint.textContent = '';
  updateBrandNavVisibility();
  location.hash = '#/login';
});

navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = href.replace('#/', '');
    if ((target === 'dashboard' || target === 'history') && !session.loggedIn) {
      e.preventDefault();
      location.hash = '#/login';
    }
  });
});

// Transactions search
btnSearch.addEventListener('click', () => {
  renderTransactions(txSearch.value || '');
});
txSearch.addEventListener('input', () => {
  renderTransactions(txSearch.value || '');
});

// Quick actions (mock) — persist changes
document.getElementById('qa-add-funds').addEventListener('click', () => {
  const user = getCurrentUser();
  user.balance = (user.balance || 0) + 50.0;
  saveDB();
  renderBalance();
});
document.getElementById('qa-transfer').addEventListener('click', () => {
  const user = getCurrentUser();
  user.balance = (user.balance || 0) - 20.0;
  if (!user.transactions) user.transactions = [];
  user.transactions.unshift({
    title: 'Bank Transfer',
    note: 'Transfer to Friend',
    amount: -20.0,
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ref: generateSecureRef('BT-'),
  });
  saveDB();
  renderBalance();
});
document.getElementById('qa-pay-bills').addEventListener('click', () => {
  const user = getCurrentUser();
  user.balance = (user.balance || 0) - 12.3;
  if (!user.transactions) user.transactions = [];
  user.transactions.unshift({
    title: 'Utilities',
    note: 'Internet',
    amount: -12.3,
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ref: generateSecureRef('UT-'),
  });
  saveDB();
  renderBalance();
});
document.getElementById('qa-exchange').addEventListener('click', () => {
  const user = getCurrentUser();
  user.balance = (user.balance || 0) + 5.25;
  if (!user.transactions) user.transactions = [];
  user.transactions.unshift({
    title: 'FX Exchange',
    note: 'USD to BHD',
    amount: +5.25,
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ref: generateSecureRef('FX-'),
  });
  saveDB();
  renderBalance();
});

// Expose a quick reset helper in console for devs:
// localStorage.removeItem("finsecure_db_v1"); localStorage.removeItem("finsecure_session_v1"); location.reload();
