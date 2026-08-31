import React, { useState } from 'react';

export default function HospitalConsole({ currentFacility, requests, onVerifyRequest, onDirectSosSubmit, onInspectPrescription }) {
  const [subtab, setSubtab] = useState('pending');
  const [category, setCategory] = useState('Blood');
  const [itemType, setItemType] = useState('O- Blood');
  const [urgency, setUrgency] = useState('Critical');
  const [units, setUnits] = useState(1);
  const [doctor, setDoctor] = useState('Dr. M. Ross (ER Staff)');
  const [email, setEmail] = useState('er.dispatch@aiims.edu.in');
  const [sector, setSector] = useState('Central ER Wing — Bed #12');
  const [radius, setRadius] = useState(10.0);

  const pendingList = requests.filter(r => r.hospital === currentFacility && !r.isVerified && r.status === 'PENDING_HOSPITAL_VERIFICATION');
  const approvedList = requests.filter(r => r.hospital === currentFacility && r.isVerified && r.status === 'ACTIVE_DISPATCH');
  const rejectedList = requests.filter(r => r.hospital === currentFacility && r.status === 'REJECTED');

  const handleSubmit = (e) => {
    e.preventDefault();
    onDirectSosSubmit({
      category,
      item: itemType,
      units: parseInt(units) || 1,
      urgency,
      hospital: currentFacility,
      doctor,
      email,
      sector,
      radius: parseFloat(radius)
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 py-6">
      {/* HUD Banner */}
      <div className="hospital-hud-banner p-6 rounded-3xl text-white relative overflow-hidden">
        <div className="hospital-radar-sweep"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="emergency-strobe px-3.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase border flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> LEVEL-1 TRAUMA DISPATCH
            </span>
            <span className="text-xs font-mono text-slate-400">FACILITY ID #ER-901</span>
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-white">Hospital Emergency Operations</h1>
          <p className="text-xs text-slate-300">
            Active Clinical Console: <b className="text-red-400 font-extrabold">{currentFacility}</b>
          </p>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="overflow-x-auto no-scrollbar flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setSubtab('pending')}
          className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            subtab === 'pending' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <i className="fa-solid fa-hourglass-half"></i> Pending Review ({pendingList.length})
        </button>

        <button
          onClick={() => setSubtab('approved')}
          className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            subtab === 'approved' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <i className="fa-solid fa-circle-check text-emerald-400"></i> Approved & Verified ({approvedList.length})
        </button>

        <button
          onClick={() => setSubtab('rejected')}
          className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            subtab === 'rejected' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <i className="fa-solid fa-circle-xmark text-red-400"></i> Rejected ({rejectedList.length})
        </button>

        <button
          onClick={() => setSubtab('create')}
          className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 sm:ml-auto ${
            subtab === 'create' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <i className="fa-solid fa-plus-circle text-red-500"></i> Register ER SOS
        </button>
      </div>

      {/* Pending Reviews */}
      {subtab === 'pending' && (
        <div className="space-y-4">
          {pendingList.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800">
              <i className="fa-solid fa-shield-check text-emerald-400 text-3xl mb-2"></i>
              <h4 className="font-bold text-white">No Pending Patient SOS Requests</h4>
              <p className="text-xs text-slate-400">All patient requests for {currentFacility} have been reviewed.</p>
            </div>
          ) : (
            pendingList.map(req => (
              <div key={req.ref} className="p-5 rounded-2xl border border-amber-500/40 bg-slate-950 space-y-4 hospital-card-hover">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700/60 px-2.5 py-0.5 rounded-full">{req.ref}</span>
                  <span className="text-xs font-bold text-amber-400"><i className="fa-solid fa-hourglass-half mr-1"></i> Awaiting Doctor Verification</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-extrabold text-sm text-white">{req.item} ({req.units} {req.category === 'Organ' ? 'Organ' : 'Units'})</div>
                    <p className="text-slate-400 mt-0.5">Doctor: <b className="text-slate-200">{req.doctor}</b></p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Doctor Prescription</div>
                      <div className="text-[11px] text-slate-400">Attached by patient</div>
                    </div>
                    {req.prescriptionUrl ? (
                      <button onClick={() => onInspectPrescription(req.prescriptionUrl)} className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                        Inspect File
                      </button>
                    ) : (
                      <span className="text-xs text-red-400">No File Attached</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <button onClick={() => onVerifyRequest(req.ref, 'REJECT')} className="px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs">
                    Decline
                  </button>
                  <button onClick={() => onVerifyRequest(req.ref, 'APPROVE')} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 shimmer-btn">
                    Verify & Broadcast to Donor Hub
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Approved List */}
      {subtab === 'approved' && (
        <div className="space-y-4">
          {approvedList.map(req => (
            <div key={req.ref} className="p-4 rounded-2xl border border-emerald-500/40 bg-slate-950 flex justify-between items-center">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-400">{req.ref}</span>
                <div className="text-xs font-extrabold text-white">{req.item} ({req.units} Units)</div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                Live on Donor Radar
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Direct SOS Creator */}
      {subtab === 'create' && (
        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 max-w-2xl mx-auto">
          <h3 className="font-extrabold text-base text-white">Direct Hospital Emergency SOS Creator</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-white">
                <option value="Blood">Blood / Blood Components</option>
                <option value="Organ">Organ / Transplant Tissue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Item Required</label>
              <input type="text" value={itemType} onChange={(e) => setItemType(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Doctor Name</label>
              <input type="text" value={doctor} onChange={(e) => setDoctor(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Geofence Radius (km)</label>
              <input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"/>
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 shimmer-btn">
            Publish Emergency Request Directly to Donor Hub
          </button>
        </form>
      )}
    </div>
  );
}
