/* =========================================================================
   LIFE PULSE — UTILITY & HELPER FUNCTIONS
   ========================================================================= */

// Normalize Phone Number for Unique Duplicate Checking
function normalizePhone(phone) {
  if (!phone) return '';
  let clean = String(phone).replace(/[\s\-\(\)\+]/g, '').trim();
  // Remove leading 91 or 0 if 12/11 digits
  if (clean.length === 12 && clean.startsWith('91')) {
    clean = clean.substring(2);
  } else if (clean.length === 11 && clean.startsWith('0')) {
    clean = clean.substring(1);
  }
  return clean;
}

// Normalize Email Address
function normalizeEmail(email) {
  if (!email) return '';
  return String(email).trim().toLowerCase();
}

// Check Duplicate Email/Phone Registration
function checkDuplicateAndRegister(email, phone) {
  const normEmail = normalizeEmail(email);
  const normPhone = normalizePhone(phone);

  if (normPhone) {
    // Check against registered phone set and databases
    if (
      registeredPhones.has(normPhone) ||
      registeredPhones.has('91' + normPhone) ||
      registeredPhones.has('+91' + normPhone) ||
      donorDatabase.some(d => normalizePhone(d.phone) === normPhone) ||
      patientDatabase.some(p => normalizePhone(p.phone) === normPhone)
    ) {
      showToast(`⚠️ Phone number (${phone}) is already registered!`, "error");
      return false;
    }
  }

  if (normEmail && normEmail.length > 3) {
    if (
      registeredEmails.has(normEmail) ||
      donorDatabase.some(d => normalizeEmail(d.email) === normEmail) ||
      patientDatabase.some(p => normalizeEmail(p.email) === normEmail)
    ) {
      showToast(`⚠️ Email (${email}) is already registered!`, "error");
      return false;
    }
  }

  if (normEmail) registeredEmails.add(normEmail);
  if (normPhone) {
    registeredPhones.add(normPhone);
    registeredPhones.add('91' + normPhone);
  }
  return true;
}

// Start Live IST Clock
function startISTClock() {
  function updateClock() {
    const clockEl = document.getElementById('istClockDisplay');
    if (clockEl) {
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      clockEl.textContent = `${new Intl.DateTimeFormat('en-IN', options).format(now)} IST`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);
}

// Get Formatted IST Timestamp
function getFormattedISTTime() {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
  }).format(new Date()) + ' IST';
}

// Haversine Formula for Distance Calculation (km)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round((R * c) * 10) / 10;
}

// Global Toast Notifications
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const text = document.getElementById('toastText');
  const icon = document.getElementById('toastIcon');
  if (!toast || !text) return;

  text.textContent = msg;
  icon.className = (type === 'error') ? 'fa-solid fa-circle-exclamation text-red-400 text-base' : 'fa-solid fa-circle-check text-emerald-400 text-base';

  toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
  }, 4000);
}

// Backend API Fetch Helper
async function apiFetch(endpoint, options = {}) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers, signal: controller.signal });
    clearTimeout(id);

    setApiConnectionStatus(true);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || `Server HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError' || err.message.includes('Failed to fetch')) {
      setApiConnectionStatus(false);
    }
    throw err;
  }
}

// Update API Status Badge
function setApiConnectionStatus(connected) {
  const badge = document.getElementById('apiStatusBadge');
  if (badge) {
    if (connected) {
      badge.className = "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800";
      badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> API: Connected`;
    } else {
      badge.className = "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-900 text-amber-400 border border-slate-800";
      badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> API: Ready`;
    }
  }
}
