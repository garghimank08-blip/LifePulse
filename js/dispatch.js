/* =========================================================================
   LIFE PULSE — LIVE DISPATCH GRID & FILTERING MODULE
   ========================================================================= */

// Render Live Dispatch Cards
function renderDispatchCards() {
  const container = document.getElementById('dispatchCardsList');
  if (!container) return;

  const searchVal = document.getElementById('dispatchSearch')?.value.toLowerCase() || '';
  const typeFilter = document.getElementById('dispatchTypeFilter')?.value || 'ALL';
  const urgencyFilter = document.getElementById('dispatchUrgencyFilter')?.value || 'ALL';

  const verifiedList = requestDatabase.filter(req => {
    if (!req.isVerified || req.status !== 'ACTIVE_DISPATCH') return false;

    const textMatch = req.ref.toLowerCase().includes(searchVal) || 
                      req.hospital.toLowerCase().includes(searchVal) || 
                      req.item.toLowerCase().includes(searchVal);

    let typeMatch = true;
    if (typeFilter === 'Blood') typeMatch = (req.category === 'Blood');
    if (typeFilter === 'Organ') typeMatch = (req.category === 'Organ');

    let urgencyMatch = true;
    if (urgencyFilter !== 'ALL') urgencyMatch = (req.urgency === urgencyFilter);

    return textMatch && typeMatch && urgencyMatch;
  });

  const badgeEl = document.getElementById('activeRequestCountBadge');
  const statActiveEl = document.getElementById('statActiveCount');
  if (badgeEl) badgeEl.textContent = verifiedList.length;
  if (statActiveEl) statActiveEl.textContent = `${verifiedList.length} Active`;

  if (verifiedList.length === 0) {
    container.innerHTML = `
      <div class="bg-slate-900 rounded-3xl border border-slate-800 p-8 text-center space-y-2 shadow-xl">
        <i class="fa-solid fa-shield-check text-slate-600 text-3xl"></i>
        <h4 class="font-extrabold text-sm text-white">No active verified dispatches match filter</h4>
        <p class="text-xs text-slate-400">Hospital verified emergency dispatches will appear here live.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = verifiedList.map(req => {
    const isCritical = (req.urgency === 'Critical');
    const badgeClass = isCritical ? 'bg-red-950/80 text-red-400 border-red-800' : 'bg-amber-950/80 text-amber-400 border-amber-800';
    const categoryBadge = req.category === 'Organ' 
      ? `<span class="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"><i class="fa-solid fa-dna mr-1"></i>Organ Transplant</span>`
      : `<span class="bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full"><i class="fa-solid fa-droplet mr-1"></i>Blood Component</span>`;

    const dist = req.realDistanceKm || calculateDistanceKm(userLatitude, userLongitude, req.lat, req.lng);
    const etaMins = req.realEtaMins || Math.max(3, Math.round(dist * 2.2));

    let donorAssignedBadge = '';
    if (req.assignedDonor) {
      donorAssignedBadge = `<div class="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center justify-between">
        <span><i class="fa-solid fa-circle-check text-emerald-400 mr-1.5"></i> Donor Confirmed: <b>${req.assignedDonor.name}</b> (${req.assignedDonor.eta})</span>
      </div>`;
    } else if (req.pendingDonor) {
      donorAssignedBadge = `<div class="mt-3 p-3 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-bold flex items-center justify-between">
        <span><i class="fa-solid fa-user-clock text-amber-400 mr-1.5"></i> Donor Responded (${req.pendingDonor.name}) — Awaiting Clearance</span>
      </div>`;
    }

    return `
      <div class="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl hover:border-red-500/50 transition-all space-y-3.5 relative overflow-hidden">
        <div class="flex justify-between items-start">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono font-extrabold text-xs text-slate-400">${req.ref}</span>
              ${categoryBadge}
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeClass}">
                ${req.urgency} Tier
              </span>
            </div>
            <h3 class="font-extrabold text-lg text-white mt-1.5">${req.item} <span class="text-xs font-bold text-slate-400 font-mono">(${req.units} ${req.category === 'Organ' ? 'Organ/Tissue' : 'Units'})</span></h3>
          </div>
          <span class="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800 font-mono">
            ${req.radius} km Radius
          </span>
        </div>

        <div class="text-xs text-slate-300 space-y-1.5 font-medium">
          <div class="flex items-center gap-2"><i class="fa-solid fa-hospital text-blue-400 w-4"></i> <b class="text-white">${req.hospital}</b></div>
          <div class="flex items-center gap-2"><i class="fa-solid fa-user-doctor text-slate-400 w-4"></i> ${req.doctor}</div>
          <div class="flex items-center gap-2"><i class="fa-solid fa-location-dot text-red-400 w-4"></i> ${req.sector}</div>
        </div>

        <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-semibold">
          <span class="text-slate-300"><i class="fa-solid fa-location-crosshairs text-blue-400 mr-1"></i> Proximity: <b class="text-white">${dist} km</b></span>
          <span class="text-amber-400 font-mono"><i class="fa-solid fa-car-side mr-1"></i> ~${etaMins}m ETA</span>
        </div>

        ${donorAssignedBadge}

        <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <i class="fa-solid fa-users text-xs"></i> ${req.donorsMatched} Matched Donors
          </span>
          ${currentRoleType === 'donor' || currentRoleType === 'hospital' ? `
            <button onclick="openAcceptModal('${req.ref}')" ${(req.assignedDonor || req.pendingDonor) ? 'disabled class="opacity-50 cursor-not-allowed px-3.5 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold"' : 'class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all shimmer-btn"'}>
              ${req.assignedDonor ? 'En Route' : (req.pendingDonor ? 'Under Review' : 'Respond as Donor')}
            </button>
          ` : `
            <span class="text-[11px] font-bold text-slate-400 italic">Login as Donor to Respond</span>
          `}
        </div>
      </div>
    `;
  }).join('');

  renderDonorAlertCards();
}

// Load Active Dispatches from Backend DB
async function loadActiveDispatchesFromBackend() {
  try {
    const activeData = await apiFetch('/dispatches/active');
    if (Array.isArray(activeData) && activeData.length > 0) {
      const mappedBackendRequests = activeData.map(item => ({
        ref: item.reference_id,
        category: item.category,
        item: item.item_required,
        units: item.units,
        urgency: item.urgency,
        hospital: item.hospital_name || 'Emergency Hospital Center',
        doctor: item.doctor_name,
        email: 'dispatch@hospital.org',
        sector: item.sector_location,
        lat: parseFloat(item.latitude),
        lng: parseFloat(item.longitude),
        radius: parseFloat(item.geofence_radius_km || 10.0),
        isVerified: true,
        status: 'ACTIVE_DISPATCH',
        donorsMatched: Math.floor(12 + Math.random() * 15),
        assignedDonor: item.assigned_donor_id ? { name: 'Confirmed Donor', eta: 'En Route' } : null,
        pendingDonor: null,
        prescriptionUrl: item.prescription_data,
        submittedByPatient: item.submitted_by_patient,
        timestamp: 'Synced from DB'
      }));

      const existingRefs = new Set(mappedBackendRequests.map(r => r.ref));
      requestDatabase = [
        ...mappedBackendRequests,
        ...requestDatabase.filter(r => !existingRefs.has(r.ref))
      ];
      renderDispatchCards();
    }
  } catch (err) {
    setApiConnectionStatus(false);
  }
}

function applyDispatchFilters() {
  renderDispatchCards();
}

function resetDispatchFilters() {
  const s = document.getElementById('dispatchSearch');
  const t = document.getElementById('dispatchTypeFilter');
  const u = document.getElementById('dispatchUrgencyFilter');
  if (s) s.value = '';
  if (t) t.value = 'ALL';
  if (u) u.value = 'ALL';
  renderDispatchCards();
}
