/* =========================================================================
   LIFE PULSE — PATIENT SOS & EMERGENCY PROGRESS TRACKER
   ========================================================================= */

// Handle Prescription File Selection
function handlePatientPrescriptionSelect(e) {
  const file = e.target.files[0];
  const previewBox = document.getElementById('patientPrescriptionPreviewContainer');
  if (file && previewBox) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      patientPrescriptionData = evt.target.result;
      previewBox.innerHTML = `
        <div class="relative group">
          <img src="${patientPrescriptionData}" class="w-16 h-16 object-cover rounded-2xl border border-amber-400/50 shadow-md">
          <button type="button" onclick="inspectPrescription('${patientPrescriptionData}')" class="absolute inset-0 bg-slate-950/70 rounded-2xl text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">View</button>
        </div>
        <div>
          <span class="text-xs font-bold text-amber-300 block">${file.name}</span>
          <span class="text-[10px] font-mono text-emerald-400"><i class="fa-solid fa-circle-check"></i> File Ready</span>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }
}

// Inspect Prescription Modal
function inspectPrescription(url) {
  const content = document.getElementById('prescriptionModalContent');
  if (content) content.innerHTML = `<img src="${url}" class="max-h-[65vh] object-contain rounded-2xl shadow">`;
  document.getElementById('prescriptionModal')?.classList.remove('hidden');
}

function closePrescriptionModal() {
  document.getElementById('prescriptionModal')?.classList.add('hidden');
}

// Handle Patient SOS Submission
async function handlePatientSosSubmit(e) {
  e.preventDefault();
  if (!patientPrescriptionData) {
    showToast("Please upload doctor prescription note first!", "error");
    return;
  }

  const chosenHospital = document.getElementById('patientHospital').value;
  const category = document.getElementById('patientCategory').value;
  const itemType = document.getElementById('patientItemType').value;
  const doctorName = document.getElementById('patientDoctor').value;
  const phone = document.getElementById('patientPhone').value;

  let createdReqObj = null;

  try {
    const resData = await apiFetch('/requests/patient-sos', {
      method: 'POST',
      body: JSON.stringify({
        category, itemType, hospitalName: chosenHospital, doctorName, phone, prescriptionData: patientPrescriptionData, latitude: userLatitude, longitude: userLongitude
      })
    });
    if (resData && resData.request) {
      const serverReq = resData.request;
      createdReqObj = {
        ref: serverReq.reference_id, category: serverReq.category, item: serverReq.item_required, units: serverReq.units || 1, urgency: serverReq.urgency || 'Critical',
        hospital: chosenHospital, doctor: doctorName, email: 'patient.request@life-pulse.org', sector: 'Patient SOS Sector', lat: userLatitude, lng: userLongitude,
        radius: 10.0, isVerified: false, status: 'PENDING_HOSPITAL_VERIFICATION', donorsMatched: 10, assignedDonor: null, pendingDonor: null,
        prescriptionUrl: patientPrescriptionData, submittedByPatient: true, timestamp: getFormattedISTTime()
      };
    }
  } catch (err) {}

  if (!createdReqObj) {
    const newRef = 'LP-IN-' + Math.floor(1000 + Math.random() * 9000);
    createdReqObj = {
      ref: newRef, category, item: itemType, units: 1, urgency: 'Critical', hospital: chosenHospital, doctor: doctorName, email: 'patient.request@life-pulse.org',
      sector: 'Patient SOS Sector', lat: userLatitude + (Math.random() - 0.5) * 0.04, lng: userLongitude + (Math.random() - 0.5) * 0.04, radius: 10.0,
      isVerified: false, status: 'PENDING_HOSPITAL_VERIFICATION', donorsMatched: Math.floor(8 + Math.random() * 10), assignedDonor: null, pendingDonor: null,
      prescriptionUrl: patientPrescriptionData, submittedByPatient: true, timestamp: getFormattedISTTime()
    };
  }

  requestDatabase.unshift(createdReqObj);
  renderPatientTracker();
  renderHospitalPendingRequests();
  showToast(`Emergency SOS ${createdReqObj.ref} submitted to ${chosenHospital} for verification!`);

  e.target.reset();
  patientPrescriptionData = null;
  const previewBox = document.getElementById('patientPrescriptionPreviewContainer');
  if (previewBox) previewBox.innerHTML = `<div class="text-xs text-slate-400 italic">Click the + icon to upload prescription image or PDF document.</div>`;
  const fileInput = document.getElementById('patientPrescriptionInput');
  if (fileInput) fileInput.value = '';
}

// Render Patient Request Tracker List
function renderPatientTracker() {
  const container = document.getElementById('patientTrackerList');
  const countBadge = document.getElementById('patientRequestCount');
  if (!container) return;

  const patientReqs = requestDatabase.filter(r => r.submittedByPatient);
  if (countBadge) countBadge.textContent = `${patientReqs.length} Requests`;

  if (patientReqs.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
        <i class="fa-solid fa-notes-medical text-amber-400 text-2xl mb-2"></i>
        <p class="text-xs text-slate-400">No emergency requests submitted yet. Use the form to submit an SOS request.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = patientReqs.map(req => {
    let statusClass = 'bg-amber-950 text-amber-300 border-amber-600';
    let statusText = '⏳ Pending Hospital Verification';
    if (req.isVerified) {
      statusClass = 'bg-emerald-950 text-emerald-300 border-emerald-600';
      statusText = '✅ Verified & Live on Donor Hub';
    } else if (req.status === 'REJECTED') {
      statusClass = 'bg-red-950 text-red-300 border-red-600';
      statusText = '❌ Rejected by Hospital';
    }

    return `
      <div class="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-mono text-xs font-bold text-slate-400">${req.ref}</span>
          <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusClass}">${statusText}</span>
        </div>

        <div class="text-xs space-y-1">
          <div class="font-extrabold text-white text-sm">${req.item} (${req.units} ${req.category === 'Organ' ? 'Organ' : 'Units'})</div>
          <div class="text-slate-300">Hospital: <b class="text-amber-400">${req.hospital}</b></div>
          <div class="text-slate-500 text-[10px]">Submitted: ${req.timestamp}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Category Change for Patient Form
function handlePatientCategoryChange() {
  const category = document.getElementById('patientCategory').value;
  const itemSelect = document.getElementById('patientItemType');
  const labelItem = document.getElementById('labelPatientItem');

  if (!itemSelect) return;

  if (category === 'Organ') {
    if (labelItem) labelItem.textContent = 'Organ / Tissue Needed';
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
    if (labelItem) labelItem.textContent = 'Item / Blood Group Needed';
    itemSelect.innerHTML = `
      <option value="O- Blood">O- Blood</option>
      <option value="O+ Blood">O+ Blood</option>
      <option value="A- Blood">A- Blood</option>
      <option value="A+ Blood">A+ Blood</option>
      <option value="B- Blood">B- Blood</option>
      <option value="B+ Blood" selected>B+ Blood</option>
      <option value="AB- Blood">AB- Blood</option>
      <option value="AB+ Blood">AB+ Blood</option>
      <option value="Platelets">Single Donor Platelets (SDP)</option>
      <option value="Plasma">Fresh Frozen Plasma (FFP)</option>
    `;
  }
}
