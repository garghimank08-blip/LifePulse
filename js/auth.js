/* =========================================================================
   LIFE PULSE — AUTHENTICATION & ROLE SWITCHING ENGINE
   ========================================================================= */

// Switch Visual Role on Login Page
function switchLoginRole(role) {
  document.querySelectorAll('.login-pane').forEach(p => p.classList.add('hidden'));
  const targetForm = document.getElementById(`loginForm${role.charAt(0).toUpperCase() + role.slice(1)}`);
  if (targetForm) targetForm.classList.remove('hidden');

  const card = document.getElementById('mainLoginCard');
  const accentBar = document.getElementById('loginCardAccentBar');
  const orb1 = document.getElementById('ambientOrb1');
  const logo = document.getElementById('mainHeartbeatLogo');
  const sonar1 = document.getElementById('sonarRing1');
  const sonar2 = document.getElementById('sonarRing2');

  if (card) {
    card.classList.remove('role-theme-hospital', 'role-theme-donor', 'role-theme-patient');
  }

  if (role === 'hospital') {
    card?.classList.add('role-theme-hospital');
    if (accentBar) accentBar.className = 'absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-700';
    if (orb1) orb1.style.background = 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0) 70%)';
    if (logo) logo.className = 'w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-2xl shadow-red-600/40 relative z-10 transition-transform hover:scale-110 duration-300';
    [sonar1, sonar2].forEach(s => s && (s.style.borderColor = 'rgba(239, 68, 68, 0.6)'));
  } else if (role === 'donor') {
    card?.classList.add('role-theme-donor');
    if (accentBar) accentBar.className = 'absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700';
    if (orb1) orb1.style.background = 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0) 70%)';
    if (logo) logo.className = 'w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-2xl shadow-emerald-600/40 relative z-10 transition-transform hover:scale-110 duration-300';
    [sonar1, sonar2].forEach(s => s && (s.style.borderColor = 'rgba(16, 185, 129, 0.6)'));
  } else if (role === 'patient') {
    card?.classList.add('role-theme-patient');
    if (accentBar) accentBar.className = 'absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700';
    if (orb1) orb1.style.background = 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0) 70%)';
    if (logo) logo.className = 'w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-2xl shadow-amber-600/40 relative z-10 transition-transform hover:scale-110 duration-300';
    [sonar1, sonar2].forEach(s => s && (s.style.borderColor = 'rgba(245, 158, 11, 0.6)'));
  }

  ['Hospital', 'Donor', 'Patient'].forEach(r => {
    const btn = document.getElementById(`roleBtn${r}`);
    if (btn) {
      if (r.toLowerCase() === role) {
        if (role === 'hospital') {
          btn.className = "py-2.5 sm:py-3 px-2 rounded-xl text-xs font-extrabold bg-red-600 text-white shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 sm:gap-2 transition-all hover:scale-[1.02] active:scale-95";
        } else if (role === 'donor') {
          btn.className = "py-2.5 sm:py-3 px-2 rounded-xl text-xs font-extrabold bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 sm:gap-2 transition-all hover:scale-[1.02] active:scale-95";
        } else {
          btn.className = "py-2.5 sm:py-3 px-2 rounded-xl text-xs font-extrabold bg-amber-600 text-white shadow-lg shadow-amber-600/30 flex items-center justify-center gap-1.5 sm:gap-2 transition-all hover:scale-[1.02] active:scale-95";
        }
      } else {
        btn.className = "py-2.5 sm:py-3 px-2 rounded-xl text-xs font-extrabold text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center justify-center gap-1.5 sm:gap-2 transition-all hover:scale-[1.02] active:scale-95";
      }
    }
  });
}

// Play Post-Login HUD Welcome Splash
function playPostLoginSplash(roleType, roleName, callback) {
  const overlay = document.getElementById('loginSuccessOverlay');
  const splashIconBox = document.getElementById('splashIconBox');
  const splashIcon = document.getElementById('splashIcon');
  const splashTag = document.getElementById('splashTag');
  const splashTitle = document.getElementById('splashTitle');
  const splashSubtitle = document.getElementById('splashSubtitle');
  const splashProgressBar = document.getElementById('splashProgressBar');
  const splashRing = document.getElementById('splashRing');

  if (!overlay) { callback(); return; }

  if (roleType === 'hospital') {
    splashIconBox.className = "w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-red-600 text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-2xl shadow-red-600/40 relative z-10";
    splashIcon.className = "fa-solid fa-hospital-user animate-heartbeat";
    splashTag.className = "text-[11px] font-mono font-bold uppercase tracking-widest text-red-400";
    splashTag.textContent = "CLINICAL AUTHENTICATION VERIFIED";
    splashTitle.textContent = `${roleName} Console Active`;
    splashSubtitle.textContent = "AIIMS Apex Trauma Medical Gateway connected. Ready for emergency dispatches.";
    splashProgressBar.className = "h-full bg-red-500 rounded-full w-full transition-all duration-700";
    if (splashRing) splashRing.style.borderColor = "rgba(239, 68, 68, 0.7)";
  } else if (roleType === 'donor') {
    splashIconBox.className = "w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-emerald-600 text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-2xl shadow-emerald-600/40 relative z-10";
    splashIcon.className = "fa-solid fa-hand-holding-heart animate-heartbeat";
    splashTag.className = "text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400";
    splashTag.textContent = "VOLUNTEER HERO ACTIVATED";
    splashTitle.textContent = `Welcome, ${roleName}!`;
    splashSubtitle.textContent = "Scanning nearby verified hospital emergency requests & patient dispatches...";
    splashProgressBar.className = "h-full bg-emerald-500 rounded-full w-full transition-all duration-700";
    if (splashRing) splashRing.style.borderColor = "rgba(16, 185, 129, 0.7)";
  } else {
    splashIconBox.className = "w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-amber-600 text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-2xl shadow-amber-600/40 relative z-10";
    splashIcon.className = "fa-solid fa-user-injured animate-heartbeat";
    splashTag.className = "text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400";
    splashTag.textContent = "PATIENT LIFELINE ONLINE";
    splashTitle.textContent = `Welcome, ${roleName}`;
    splashSubtitle.textContent = "Patient SOS Portal ready. Connect directly with trauma facilities & volunteer donors.";
    splashProgressBar.className = "h-full bg-amber-500 rounded-full w-full transition-all duration-700";
    if (splashRing) splashRing.style.borderColor = "rgba(245, 158, 11, 0.7)";
  }

  overlay.classList.remove('hidden');

  setTimeout(() => {
    overlay.classList.add('hidden');
    callback();
  }, 950);
}

// Handle Hospital Login Form Submission
async function handleHospitalLoginSubmit(e) {
  e.preventDefault();
  const facility = document.getElementById('loginHospitalFacilitySelect')?.value || 'AIIMS Apex Trauma Centre';
  const email = document.getElementById('loginHospitalEmail')?.value || 'er.dispatch@aiims.edu.in';
  const password = document.getElementById('loginHospitalPassword')?.value || '';

  if (password !== 'admin123' && password.length < 4) {
    showToast("❌ Invalid Hospital Admin Password! (Default: admin123)", "error");
    return;
  }

  try {
    const data = await apiFetch('/auth/hospital-login', {
      method: 'POST', body: JSON.stringify({ facilityName: facility, email, password })
    });
    if (data.token) authToken = data.token;
  } catch (err) {}

  currentLoggedInHospital = facility;
  playPostLoginSplash('hospital', facility, () => {
    updateUserRoleUI('hospital', facility);
    showToast(`Logged in as Hospital Admin: ${facility}`);
    switchTab('tab-hospital-portal');
  });
}

// Handle Verified Volunteer Donor Login Submission
function handleDonorLoginSubmit(e) {
  e.preventDefault();
  const inputPhone = document.getElementById('loginDonorPhone')?.value || '';
  const inputPass = document.getElementById('loginDonorPassword')?.value || '';

  const cleanInputPhone = normalizePhone(inputPhone);
  if (!cleanInputPhone) {
    showToast("❌ Please enter your registered phone number", "error");
    return;
  }

  // Pre-seeded demo donors
  const demoDonors = [
    { fullName: 'Vikramaditya Singh', phone: '9876543210', bloodGroup: 'B+', passcode: '123456' },
    { fullName: 'Rohan Sharma', phone: '9810023456', bloodGroup: 'O-', passcode: '123456' }
  ];

  const storedDonors = JSON.parse(localStorage.getItem('lp_donors') || '[]');
  const allDonors = [...demoDonors, ...storedDonors, ...donorDatabase];

  const matchedDonor = allDonors.find(d => normalizePhone(d.phone) === cleanInputPhone);

  if (!matchedDonor) {
    showToast(`❌ Unregistered Phone! No donor account found for ${inputPhone}. Please register first.`, "error");
    return;
  }

  if (inputPass && inputPass !== (matchedDonor.passcode || '123456')) {
    showToast("❌ Incorrect passcode! Please enter the correct password.", "error");
    return;
  }

  playPostLoginSplash('donor', matchedDonor.fullName || 'Volunteer Donor', () => {
    updateUserRoleUI('donor', matchedDonor.fullName || 'Volunteer Donor');
    showToast(`Welcome back, ${matchedDonor.fullName}!`);
    switchTab('tab-donor-hub');
  });
}

// Handle Verified Patient Login Submission
function handlePatientLoginSubmit(e) {
  e.preventDefault();
  const inputId = document.getElementById('loginPatientId')?.value || '';
  const inputPass = document.getElementById('loginPatientPassword')?.value || '';

  const cleanInputId = inputId.trim().toLowerCase();
  const cleanInputPhone = normalizePhone(inputId);

  if (!cleanInputId) {
    showToast("❌ Please enter your ABHA ID or registered Mobile", "error");
    return;
  }

  // Pre-seeded demo patients
  const demoPatients = [
    { fullName: 'Ramesh Chandra', phone: '9811122334', abhaId: 'ABHA-9182-4410-2201', bloodGroup: 'B+', passcode: '123456' }
  ];

  const storedPatients = JSON.parse(localStorage.getItem('lp_patients') || '[]');
  const allPatients = [...demoPatients, ...storedPatients, ...patientDatabase];

  const matchedPatient = allPatients.find(p => 
    (p.abhaId && p.abhaId.toLowerCase() === cleanInputId) ||
    (p.phone && normalizePhone(p.phone) === cleanInputPhone)
  );

  if (!matchedPatient) {
    showToast(`❌ Unregistered Patient! No record found for "${inputId}". Please register first.`, "error");
    return;
  }

  if (inputPass && inputPass !== (matchedPatient.passcode || '123456')) {
    showToast("❌ Incorrect passcode! Please enter the correct password.", "error");
    return;
  }

  playPostLoginSplash('patient', matchedPatient.fullName || 'Patient Recipient', () => {
    updateUserRoleUI('patient', matchedPatient.fullName || 'Patient Recipient');
    showToast(`Welcome, ${matchedPatient.fullName}!`);
    switchTab('tab-patient-portal');
  });
}

// Update Role UI and Navigation Visibility
function updateUserRoleUI(type, name) {
  currentRoleType = type;
  updateSidebarUserInfo(type, name);
  renderDispatchCards();
}

// Logout Role Handler
function logoutRole() {
  currentRoleType = null;
  authToken = null;
  document.getElementById('appSidebar')?.classList.add('hidden');
  document.getElementById('mobileTopBar')?.classList.add('hidden');
  closeMobileSidebar();
  showToast("Logged out successfully");
  switchTab('tab-logins');
}

// Donor Registration
function openDonorRegistrationModal() { document.getElementById('donorRegModal')?.classList.remove('hidden'); }
function closeDonorRegistrationModal() { document.getElementById('donorRegModal')?.classList.add('hidden'); }

async function handleDonorRegisterSubmit(e) {
  e.preventDefault();
  const form = e.target;
  
  // Extract values from form inputs
  const fullName = form.querySelector('input[type="text"]')?.value || document.getElementById('regDonorName')?.value || 'Volunteer Donor';
  const email = form.querySelector('input[type="email"]')?.value || document.getElementById('regDonorEmail')?.value || '';
  const bloodGroup = form.querySelector('select')?.value || document.getElementById('regDonorBloodGroup')?.value || 'B+';
  const phone = form.querySelector('input[type="tel"]')?.value || document.getElementById('regDonorPhone')?.value || '';
  const age = parseInt(form.querySelector('input[type="number"]')?.value || document.getElementById('regDonorAge')?.value || '26');
  const city = document.getElementById('regDonorCity')?.value || 'Local Area';
  const availability = document.getElementById('regDonorStatus')?.value || 'Immediate';
  const passcode = document.getElementById('regDonorPasscode')?.value || '123456';

  // Strict Phone Duplicate Validation
  if (!checkDuplicateAndRegister(email, phone)) {
    return;
  }

  const newDonorRecord = {
    id: `DONOR-${Date.now()}`,
    fullName,
    email,
    bloodGroup,
    phone,
    age,
    city,
    availability,
    passcode,
    createdAt: new Date().toISOString()
  };

  // Persist to local array & localStorage
  donorDatabase.push(newDonorRecord);
  localStorage.setItem('lp_donors', JSON.stringify(donorDatabase));

  try {
    const data = await apiFetch('/auth/donor-register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, bloodGroup, phone, age, city, availability, passcode })
    });
    if (data.token) authToken = data.token;
  } catch (err) {}

  // Clear all filled fields in the form
  form.reset();
  closeDonorRegistrationModal();

  // Instant login and portal entry
  playPostLoginSplash('donor', fullName, () => {
    updateUserRoleUI('donor', fullName);
    showToast(`Volunteer ${fullName} registered & signed in!`);
    switchTab('tab-donor-hub');
  });
}

// Patient Registration
function openPatientRegistrationModal() { document.getElementById('patientRegModal')?.classList.remove('hidden'); }
function closePatientRegistrationModal() { document.getElementById('patientRegModal')?.classList.add('hidden'); }

async function handlePatientRegisterSubmit(e) {
  e.preventDefault();
  const form = e.target;

  // Extract values from form inputs
  const fullName = form.querySelector('input[type="text"]')?.value || document.getElementById('regPatientName')?.value || 'Patient Recipient';
  const phone = form.querySelector('input[type="tel"]')?.value || document.getElementById('regPatientPhone')?.value || '';
  const email = form.querySelector('input[type="email"]')?.value || document.getElementById('regPatientEmail')?.value || '';
  const bloodGroup = form.querySelector('select')?.value || document.getElementById('regPatientBloodGroup')?.value || 'B+';
  const ageGender = document.getElementById('regPatientAgeGender')?.value || '35 / Male';
  const abhaId = document.getElementById('regPatientAbha')?.value || `ABHA-${Math.floor(1000 + Math.random()*9000)}`;
  const emergencyContact = document.getElementById('regPatientEmergencyContact')?.value || '';
  const passcode = document.getElementById('regPatientPasscode')?.value || '123456';

  // Strict Phone Duplicate Validation
  if (!checkDuplicateAndRegister(email, phone)) {
    return;
  }

  const newPatientRecord = {
    id: `PATIENT-${Date.now()}`,
    fullName,
    phone,
    email,
    bloodGroup,
    ageGender,
    abhaId,
    emergencyContact,
    passcode,
    createdAt: new Date().toISOString()
  };

  // Persist to local array & localStorage
  patientDatabase.push(newPatientRecord);
  localStorage.setItem('lp_patients', JSON.stringify(patientDatabase));

  try {
    const data = await apiFetch('/auth/patient-register', {
      method: 'POST',
      body: JSON.stringify({ fullName, phone, email, bloodGroup, ageGender, abhaId, emergencyContact, passcode })
    });
    if (data.token) authToken = data.token;
  } catch (err) {}

  // Clear all filled fields in the form
  form.reset();
  closePatientRegistrationModal();

  // Instant login and portal entry
  playPostLoginSplash('patient', fullName, () => {
    updateUserRoleUI('patient', fullName);
    showToast(`Patient ${fullName} registered & signed in!`);
    switchTab('tab-patient-portal');
  });
}
