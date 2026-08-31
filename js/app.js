/* =========================================================================
   LIFE PULSE — APP BOOTSTRAP & SIDEBAR LIFECYCLE MANAGER
   ========================================================================= */

// Toggle Mobile Hamburger Drawer
function toggleMobileSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const btn = document.getElementById('hamburgerBtn');

  if (sidebar && backdrop && btn) {
    const isOpen = sidebar.classList.contains('drawer-open');
    if (isOpen) {
      sidebar.classList.remove('drawer-open');
      backdrop.classList.remove('active');
      btn.classList.remove('is-active');
    } else {
      sidebar.classList.add('drawer-open');
      backdrop.classList.add('active');
      btn.classList.add('is-active');
    }
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const btn = document.getElementById('hamburgerBtn');

  if (sidebar) sidebar.classList.remove('drawer-open');
  if (backdrop) backdrop.classList.remove('active');
  if (btn) btn.classList.remove('is-active');
}

// Switch Main Views & Animated Sidebar Navigation
function switchTab(tabId) {
  if (!currentRoleType) {
    document.getElementById('appSidebar')?.classList.add('hidden');
    document.getElementById('mobileTopBar')?.classList.add('hidden');
    document.querySelectorAll('.view-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.getElementById('tab-logins')?.classList.add('active');
    return;
  }

  // Access check for role restrictions
  if (tabId === 'tab-hospital-portal' && currentRoleType === 'patient') {
    document.getElementById('hospitalAccessDeniedCard')?.classList.remove('hidden');
    document.getElementById('hospitalAuthorizedContent')?.classList.add('hidden');
  } else if (tabId === 'tab-hospital-portal') {
    document.getElementById('hospitalAccessDeniedCard')?.classList.add('hidden');
    document.getElementById('hospitalAuthorizedContent')?.classList.remove('hidden');
  }

  if (tabId === 'tab-donor-hub' && currentRoleType === 'patient') {
    document.getElementById('donorHubAccessDeniedCard')?.classList.remove('hidden');
    document.getElementById('donorHubAuthorizedContent')?.classList.add('hidden');
  } else if (tabId === 'tab-donor-hub') {
    document.getElementById('donorHubAccessDeniedCard')?.classList.add('hidden');
    document.getElementById('donorHubAuthorizedContent')?.classList.remove('hidden');
  }

  // Hide all view tabs and show target tab with animation
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  // Highlight active sidebar navigation item
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.remove('is-active');
  });

  const activeNav = document.getElementById('nav-' + tabId);
  if (activeNav) {
    activeNav.classList.add('is-active');
  }

  // Close mobile drawer after navigation
  closeMobileSidebar();

  // Invalidate Leaflet map size on display
  if (tabId === 'tab-dispatch') setTimeout(initDispatchMap, 200);
  if (tabId === 'tab-nearby') setTimeout(initNearbyMap, 200);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toggle Tab in Registration Desk View
function toggleRegistrationTab(type) {
  const donorContainer = document.getElementById('deskDonorFormContainer');
  const patientContainer = document.getElementById('deskPatientFormContainer');
  const donorBadge = document.getElementById('deskDonorBadgePreview');
  const patientBadge = document.getElementById('deskPatientBadgePreview');
  const btnDonor = document.getElementById('regTabBtnDonor');
  const btnPatient = document.getElementById('regTabBtnPatient');

  if (type === 'donor') {
    if (donorContainer) donorContainer.classList.remove('hidden');
    if (patientContainer) patientContainer.classList.add('hidden');
    if (donorBadge) donorBadge.classList.remove('hidden');
    if (patientBadge) patientBadge.classList.add('hidden');
    if (btnDonor) btnDonor.className = "px-4 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2";
    if (btnPatient) btnPatient.className = "px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-400 hover:text-white flex items-center gap-2";
  } else {
    if (donorContainer) donorContainer.classList.add('hidden');
    if (patientContainer) patientContainer.classList.remove('hidden');
    if (donorBadge) donorBadge.classList.add('hidden');
    if (patientBadge) patientBadge.classList.remove('hidden');
    if (btnDonor) btnDonor.className = "px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-400 hover:text-white flex items-center gap-2";
    if (btnPatient) btnPatient.className = "px-4 py-2 rounded-xl text-xs font-bold transition-all bg-amber-600 text-white shadow-lg shadow-amber-600/30 flex items-center gap-2";
  }
}

// Update User Info in the Sidebar
function updateSidebarUserInfo(roleType, roleName) {
  const sidebar = document.getElementById('appSidebar');
  const mobileBar = document.getElementById('mobileTopBar');
  const userNameEl = document.getElementById('sidebarUserName');
  const userRoleBadge = document.getElementById('sidebarUserRoleBadge');

  if (sidebar) sidebar.classList.remove('hidden');
  if (mobileBar) mobileBar.classList.remove('hidden');

  if (userNameEl) userNameEl.textContent = roleName || 'Active User';
  if (userRoleBadge) {
    userRoleBadge.textContent = roleType.toUpperCase();
    userRoleBadge.className = `text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border ${
      roleType === 'hospital' ? 'bg-red-950 text-red-400 border-red-800' :
      roleType === 'donor' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
      'bg-amber-950 text-amber-400 border-amber-800'
    }`;
  }

  // Show/Hide Role-Specific Sidebar Nav Items
  const hospitalNav = document.getElementById('nav-tab-hospital-portal');
  const donorNav = document.getElementById('nav-tab-donor-hub');
  const patientNav = document.getElementById('nav-tab-patient-portal');

  if (hospitalNav) hospitalNav.style.display = (roleType === 'hospital') ? 'flex' : 'none';
  if (donorNav) donorNav.style.display = (roleType === 'donor' || roleType === 'hospital') ? 'flex' : 'none';
  if (patientNav) patientNav.style.display = (roleType === 'patient') ? 'flex' : 'none';
}

// Emergency Sidebar Button Click
function handleEmergencyButtonClick() {
  if (currentRoleType === 'patient') switchTab('tab-patient-portal');
  else switchTab('tab-hospital-portal');
}

// Application Startup Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  startISTClock();
  triggerLiveGeolocation(false);
  loadActiveDispatchesFromBackend();
  renderDispatchCards();
  renderHospitalPendingRequests();
  renderHospitalApprovedRequests();
  renderHospitalRejectedRequests();
  renderHospitalPendingApprovals();
  renderPatientTracker();
});
