/* =========================================================================
   LIFE PULSE — VOLUNTEER DONOR HUB & RESPONSE MODAL MODULE
   ========================================================================= */

// Render Verified Emergency Alert Cards for Volunteer Donors
function renderDonorAlertCards() {
  const container = document.getElementById('donorCardsContainer');
  if (!container) return;

  // Filter requests that are active, verified AND within the user's local geofence radius
  const verifiedList = requestDatabase
    .filter(r => r.isVerified && r.status === 'ACTIVE_DISPATCH')
    .map(req => {
      const dist = req.realDistanceKm || calculateDistanceKm(userLatitude, userLongitude, req.lat, req.lng);
      const etaMins = req.realEtaMins || Math.max(3, Math.round(dist * 2.2));
      return { ...req, realDistanceKm: dist, realEtaMins: etaMins };
    })
    .filter(req => req.realDistanceKm <= (activeGeofenceRadiusKm || 10.0) * 1.5) // Within geofence radius
    .sort((a, b) => a.realDistanceKm - b.realDistanceKm); // Sorted strictly by closest distance

  if (verifiedList.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center bg-slate-900 rounded-3xl border border-slate-800">
        <i class="fa-solid fa-check-double text-emerald-500 text-3xl mb-2"></i>
        <h4 class="font-bold text-white">No Immediate Emergencies in Your ${activeGeofenceRadiusKm || 10}km Radius</h4>
        <p class="text-xs text-slate-400 mt-1">All local nearby hospital requirements are currently fulfilled. Expand geofence radius or switch location to view wider alerts.</p>
        <button onclick="setGeofenceRadius(20); switchTab('tab-nearby');" class="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow">
          Expand to 20 km Radius
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = verifiedList.map(req => {
    return `
      <div class="bg-slate-900 rounded-3xl border border-emerald-500/30 p-6 shadow-xl flex flex-col justify-between space-y-4 donor-card-hover relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="font-mono text-xs font-bold text-slate-400">${req.ref}</span>
            <span class="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Hospital Cleared
            </span>
          </div>

          <h3 class="font-extrabold text-xl text-white">${req.item} (${req.units} ${req.category === 'Organ' ? 'Organ' : 'Units'})</h3>
          <p class="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <i class="fa-solid fa-hospital"></i> ${req.hospital}
          </p>
          <p class="text-xs text-slate-400 mt-1.5"><i class="fa-solid fa-location-dot text-red-400 mr-1"></i> ${req.sector}</p>

          <div class="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex items-center justify-between text-xs">
            <span class="text-slate-300 font-medium"><i class="fa-solid fa-route text-emerald-400 mr-1"></i> Proximity: <b class="text-emerald-400">${req.realDistanceKm} km</b></span>
            <span class="text-amber-400 font-mono font-bold"><i class="fa-regular fa-clock mr-1"></i> ~${req.realEtaMins}m ETA</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-mono font-bold"><i class="fa-solid fa-compass text-emerald-400 mr-1"></i> ${req.radius} km radius</span>
          <button onclick="openAcceptModal('${req.ref}')" ${req.assignedDonor ? 'disabled class="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed"' : 'class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 shimmer-btn"'}>
            ${req.assignedDonor ? 'Donor En Route' : 'Offer Donation Response'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Open Donor Acceptance Modal
function openAcceptModal(ref) {
  selectedAcceptRef = ref;
  const req = requestDatabase.find(r => r.ref === ref);
  if (!req) return;
  document.getElementById('modalRef').textContent = req.ref;
  document.getElementById('modalHospital').textContent = req.hospital;
  document.getElementById('modalItem').textContent = `${req.item} (${req.units} ${req.category === 'Organ' ? 'Organ' : 'Units'})`;
  document.getElementById('acceptModal')?.classList.remove('hidden');
}

function closeAcceptModal() {
  document.getElementById('acceptModal')?.classList.add('hidden');
}

// Handle Donor Acceptance Form Submission
async function handleAcceptSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('acceptorName').value;
  const phone = document.getElementById('acceptorPhone').value;
  const eta = document.getElementById('acceptorEta').value;

  try {
    await apiFetch(`/dispatches/${selectedAcceptRef}/respond`, {
      method: 'POST', body: JSON.stringify({ donorName: name, phone, eta })
    });
  } catch (err) {}

  const req = requestDatabase.find(r => r.ref === selectedAcceptRef);
  if (req) {
    req.pendingDonor = { name, phone, eta, status: 'PENDING_APPROVAL' };
  }

  closeAcceptModal();
  renderDispatchCards();
  renderDonorAlertCards();
  showToast(`Response submitted to hospital for clearance!`);
}
