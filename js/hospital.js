/* =========================================================================
   LIFE PULSE — HOSPITAL CLINICAL COMMAND CONSOLE & VERIFICATION MODULE
   ========================================================================= */

// Switch Facility Console Session
function changeLoggedInHospitalFacility(facility) {
  currentLoggedInHospital = facility;
  const activeHospitalFacilityName = document.getElementById('activeHospitalFacilityName');
  if (activeHospitalFacilityName) activeHospitalFacilityName.textContent = facility;
  
  const pendingScope = document.getElementById('currentScopeLabelPending');
  const approvedScope = document.getElementById('currentScopeLabelApproved');
  const rejectedScope = document.getElementById('currentScopeLabelRejected');
  
  if (pendingScope) pendingScope.textContent = facility;
  if (approvedScope) approvedScope.textContent = facility;
  if (rejectedScope) rejectedScope.textContent = facility;

  renderHospitalPendingRequests();
  renderHospitalApprovedRequests();
  renderHospitalRejectedRequests();
  renderHospitalPendingApprovals();
  showToast(`Hospital session switched to ${facility}`);
}

// Switch Hospital Subtabs (Pending, Approved, Rejected, Approvals, Create)
function switchHospitalSubtab(subtab) {
  const subReq = document.getElementById('hospitalSubtabReqApprovals');
  const subApp = document.getElementById('hospitalSubtabApproved');
  const subRej = document.getElementById('hospitalSubtabRejected');
  const subDonor = document.getElementById('hospitalSubtabApprovals');
  const subCreate = document.getElementById('hospitalSubtabCreate');

  const btnReq = document.getElementById('btnHospitalReqApprovals');
  const btnApp = document.getElementById('btnHospitalApproved');
  const btnRej = document.getElementById('btnHospitalRejected');
  const btnDonor = document.getElementById('btnHospitalApprovals');
  const btnCreate = document.getElementById('btnHospitalCreate');

  [subReq, subApp, subRej, subDonor, subCreate].forEach(el => el && el.classList.add('hidden'));

  const defaultTabClass = "shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 transition-all flex items-center gap-2";
  const activeTabClass = "shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold bg-red-600 text-white shadow-lg shadow-red-600/30 transition-all flex items-center gap-2";
  
  [btnReq, btnApp, btnRej, btnDonor, btnCreate].forEach(btn => {
    if (btn) btn.className = defaultTabClass;
  });

  if (subtab === 'pending-requests') {
    subReq?.classList.remove('hidden');
    if (btnReq) btnReq.className = activeTabClass;
    renderHospitalPendingRequests();
  } else if (subtab === 'approved-requests') {
    subApp?.classList.remove('hidden');
    if (btnApp) btnApp.className = activeTabClass;
    renderHospitalApprovedRequests();
  } else if (subtab === 'rejected-requests') {
    subRej?.classList.remove('hidden');
    if (btnRej) btnRej.className = activeTabClass;
    renderHospitalRejectedRequests();
  } else if (subtab === 'pending-approvals') {
    subDonor?.classList.remove('hidden');
    if (btnDonor) btnDonor.className = activeTabClass;
    renderHospitalPendingApprovals();
  } else {
    subCreate?.classList.remove('hidden');
    if (btnCreate) btnCreate.className = activeTabClass;
  }
}

// Render Patient Requests Pending Review for Current Hospital
function renderHospitalPendingRequests() {
  const container = document.getElementById('hospitalPendingRequestsList');
  const badge = document.getElementById('hospitalPendingReqBadge');
  if (!container) return;

  const pendingList = requestDatabase.filter(r => 
    r.hospital === currentLoggedInHospital && 
    !r.isVerified && 
    r.status === 'PENDING_HOSPITAL_VERIFICATION'
  );

  if (badge) badge.textContent = pendingList.length;

  if (pendingList.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
        <i class="fa-solid fa-shield-check text-emerald-400 text-3xl mb-2"></i>
        <h4 class="font-bold text-sm text-white">No Pending Requests for ${currentLoggedInHospital}</h4>
        <p class="text-xs text-slate-400">All incoming patient requests for this facility have been processed.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pendingList.map(req => `
    <div class="p-5 rounded-2xl border border-amber-500/40 bg-slate-950 space-y-4 hospital-card-hover">
      <div class="flex justify-between items-center">
        <span class="font-mono text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700/60 px-2.5 py-0.5 rounded-full">${req.ref}</span>
        <span class="text-xs font-bold text-amber-400"><i class="fa-solid fa-hourglass-half mr-1"></i> Pending Review</span>
      </div>

      <div class="grid sm:grid-cols-2 gap-3 text-xs">
        <div>
          <div class="font-extrabold text-sm text-white">${req.item} (${req.units} ${req.category === 'Organ' ? 'Organ' : 'Units'})</div>
          <p class="text-slate-400 mt-0.5">Facility: <b class="text-slate-200">${req.hospital}</b></p>
          <p class="text-slate-400">Doctor: <b class="text-slate-200">${req.doctor}</b></p>
        </div>

        <div class="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div class="font-bold text-white">Doctor Prescription</div>
            <div class="text-[11px] text-slate-400">Uploaded by patient</div>
          </div>
          ${req.prescriptionUrl ? `
            <button onclick="inspectPrescription('${req.prescriptionUrl}')" class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors">
              Inspect File
            </button>
          ` : '<span class="text-xs text-red-400 font-bold">No File Attached</span>'}
        </div>
      </div>

      <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
        <button onclick="rejectPatientSos('${req.ref}')" class="px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs transition-colors">Decline Request</button>
        <button onclick="verifyPatientSos('${req.ref}')" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 shimmer-btn">Verify & Publish to Donor Hub</button>
      </div>
    </div>
  `).join('');
}

// Render Approved Requests for Current Hospital
function renderHospitalApprovedRequests() {
  const container = document.getElementById('hospitalApprovedRequestsList');
  const badge = document.getElementById('hospitalApprovedReqBadge');
  if (!container) return;

  const approvedList = requestDatabase.filter(r => 
    r.hospital === currentLoggedInHospital && 
    r.isVerified && 
    r.status === 'ACTIVE_DISPATCH'
  );

  if (badge) badge.textContent = approvedList.length;

  if (approvedList.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
        <i class="fa-solid fa-circle-check text-slate-600 text-3xl mb-2"></i>
        <h4 class="font-bold text-sm text-white">No Approved Dispatches for ${currentLoggedInHospital}</h4>
      </div>
    `;
    return;
  }

  container.innerHTML = approvedList.map(req => `
    <div class="p-4 rounded-2xl border border-emerald-500/40 bg-slate-950 space-y-2">
      <div class="flex justify-between items-center">
        <span class="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">${req.ref}</span>
        <span class="text-xs font-bold text-emerald-400"><i class="fa-solid fa-circle-check mr-1"></i> Live on Donor Grid</span>
      </div>
      <div class="text-xs font-extrabold text-white">${req.item} (${req.units} ${req.category === 'Organ' ? 'Organ' : 'Units'})</div>
    </div>
  `).join('');
}

// Render Rejected Requests for Current Hospital
function renderHospitalRejectedRequests() {
  const container = document.getElementById('hospitalRejectedRequestsList');
  const badge = document.getElementById('hospitalRejectedReqBadge');
  if (!container) return;

  const rejectedList = requestDatabase.filter(r => 
    r.hospital === currentLoggedInHospital && 
    r.status === 'REJECTED'
  );

  if (badge) badge.textContent = rejectedList.length;

  if (rejectedList.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
        <i class="fa-solid fa-circle-xmark text-slate-600 text-3xl mb-2"></i>
        <h4 class="font-bold text-sm text-white">No Rejected Requests for ${currentLoggedInHospital}</h4>
      </div>
    `;
    return;
  }

  container.innerHTML = rejectedList.map(req => `
    <div class="p-4 rounded-2xl border border-red-500/40 bg-slate-950 space-y-2">
      <div class="flex justify-between items-center">
        <span class="font-mono text-xs font-bold text-red-400 bg-red-950 px-2.5 py-0.5 rounded-full border border-red-800">${req.ref}</span>
        <span class="text-xs font-bold text-red-400">Rejected</span>
      </div>
      <div class="text-xs font-extrabold text-white">${req.item} (${req.units} ${req.category === 'Organ' ? 'Organ' : 'Units'})</div>
    </div>
  `).join('');
}

// Render Donor Responses Awaiting Clearance
function renderHospitalPendingApprovals() {
  const container = document.getElementById('hospitalPendingApprovalsList');
  const badge = document.getElementById('hospitalBadgeCount');
  if (!container) return;

  const pendingApprovals = requestDatabase.filter(r => 
    r.hospital === currentLoggedInHospital && 
    r.pendingDonor
  );

  if (badge) badge.textContent = pendingApprovals.length;

  if (pendingApprovals.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
        <i class="fa-solid fa-user-clock text-slate-600 text-3xl mb-2"></i>
        <h4 class="font-bold text-sm text-white">No Donor Responses Awaiting Clearance</h4>
      </div>
    `;
    return;
  }

  container.innerHTML = pendingApprovals.map(req => `
    <div class="p-4 rounded-2xl border border-amber-500/40 bg-slate-950 flex justify-between items-center text-xs">
      <div>
        <div class="font-bold text-white">${req.pendingDonor.name} (${req.pendingDonor.phone})</div>
        <div class="text-slate-400">Ref: <b>${req.ref}</b> | ETA: <b class="text-amber-400">${req.pendingDonor.eta}</b></div>
      </div>
      <button onclick="confirmDonorResponse('${req.ref}')" class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold shimmer-btn">Approve Donor</button>
    </div>
  `).join('');
}

// Verify Patient SOS Request
async function verifyPatientSos(ref) {
  try {
    await apiFetch(`/requests/${ref}/verify`, { method: 'PATCH', body: JSON.stringify({ action: 'APPROVE' }) });
  } catch (err) {}

  const req = requestDatabase.find(r => r.ref === ref);
  if (req) {
    req.isVerified = true;
    req.status = 'ACTIVE_DISPATCH';
    showToast(`Request ${ref} verified and published to Donor Hub!`);
    renderHospitalPendingRequests();
    renderHospitalApprovedRequests();
    renderDispatchCards();
    renderPatientTracker();
  }
}

// Reject Patient SOS Request
async function rejectPatientSos(ref) {
  try {
    await apiFetch(`/requests/${ref}/verify`, { method: 'PATCH', body: JSON.stringify({ action: 'REJECT' }) });
  } catch (err) {}

  const req = requestDatabase.find(r => r.ref === ref);
  if (req) {
    req.status = 'REJECTED';
    req.isVerified = false;
    showToast(`Request ${ref} rejected.`, 'error');
    renderHospitalPendingRequests();
    renderHospitalRejectedRequests();
    renderPatientTracker();
  }
}

// Confirm Donor Response
function confirmDonorResponse(ref) {
  const req = requestDatabase.find(r => r.ref === ref);
  if (req && req.pendingDonor) {
    req.assignedDonor = { ...req.pendingDonor };
    req.pendingDonor = null;
    showToast(`Donor response approved for ${ref}`);
    renderHospitalPendingApprovals();
    renderDispatchCards();
  }
}

// Handle Direct Hospital Emergency SOS Creation Form
function handleSosFormSubmit(e) {
  e.preventDefault();
  const newRef = 'LP-IN-' + Math.floor(1000 + Math.random() * 9000);
  const newReq = {
    ref: newRef,
    category: document.getElementById('sosCategory').value,
    item: document.getElementById('sosItemType').value,
    units: parseInt(document.getElementById('sosUnits').value) || 1,
    urgency: document.getElementById('sosUrgency').value,
    hospital: document.getElementById('sosHospital').value,
    doctor: document.getElementById('sosDoctor').value,
    email: document.getElementById('sosEmail').value,
    sector: document.getElementById('sosSector').value,
    lat: userLatitude,
    lng: userLongitude,
    radius: parseFloat(document.getElementById('sosRadius').value),
    isVerified: true,
    status: 'ACTIVE_DISPATCH',
    donorsMatched: 15,
    assignedDonor: null,
    pendingDonor: null,
    prescriptionUrl: null,
    submittedByPatient: false,
    timestamp: getFormattedISTTime()
  };

  requestDatabase.unshift(newReq);
  renderDispatchCards();
  showToast(`Hospital Direct SOS ${newRef} published to Donor Hub!`);

  e.target.reset();
  switchTab('tab-dispatch');
}

// Category Change for Hospital Form
function handleCategoryChange() {
  const category = document.getElementById('sosCategory').value;
  const itemSelect = document.getElementById('sosItemType');
  const labelItem = document.getElementById('labelBloodOrganItem');

  if (!itemSelect) return;

  if (category === 'Organ') {
    if (labelItem) labelItem.textContent = 'Organ / Tissue Required';
    itemSelect.innerHTML = `
      <option value="Kidney (Transplant)">🫘 Kidney (Transplant)</option>
      <option value="Liver Lobe / Whole">🫀 Liver (Lobe / Whole)</option>
      <option value="Heart (Transplant)">❤️ Heart (Transplant)</option>
      <option value="Lungs (Bilateral / Single)">🫁 Lungs (Single / Bilateral)</option>
      <option value="Pancreas">🩸 Pancreas</option>
      <option value="Cornea (Ocular Tissue)">👁️ Cornea (Ocular Tissue)</option>
      <option value="Bone Marrow / Stem Cells">🦴 Bone Marrow / Stem Cells</option>
      <option value="Small Intestine / Bowel">🩺 Small Intestine / Bowel</option>
      <option value="Skin Graft / Tissue">🧬 Skin Graft / Tissue</option>
      <option value="Heart Valves">🫀 Heart Valves</option>
    `;
  } else {
    if (labelItem) labelItem.textContent = 'Blood Group Required';
    itemSelect.innerHTML = `
      <option value="O- Blood">O- (Universal Red Cells)</option>
      <option value="O+ Blood">O+ (Positive)</option>
      <option value="A- Blood">A- (Negative)</option>
      <option value="A+ Blood">A+ (Positive)</option>
      <option value="B- Blood">B- (Negative)</option>
      <option value="B+ Blood">B+ (Positive)</option>
      <option value="AB- Blood">AB- (Negative)</option>
      <option value="AB+ Blood">AB+ (Positive)</option>
      <option value="Platelets">Single Donor Platelets (SDP)</option>
      <option value="Plasma">Fresh Frozen Plasma (FFP)</option>
      <option value="Cryoprecipitate">Cryoprecipitate</option>
      <option value="Whole Blood">Whole Blood</option>
    `;
  }
}
