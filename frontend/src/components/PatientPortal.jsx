import React, { useState } from 'react';

export default function PatientPortal({ onPatientSosSubmit, patientRequests }) {
  const [category, setCategory] = useState('Blood');
  const [itemType, setItemType] = useState('B+ Blood');
  const [hospitalName, setHospitalName] = useState('AIIMS Apex Trauma Centre');
  const [doctorName, setDoctorName] = useState('Dr. A. K. Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => setPrescriptionData(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prescriptionData) {
      alert("Please upload doctor prescription note first!");
      return;
    }
    onPatientSosSubmit({
      category,
      itemType,
      hospitalName,
      doctorName,
      phone,
      prescriptionData
    });
    setPrescriptionData(null);
    setFileName('');
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-6 py-6">
      {/* 4-Step Lifeline Banner */}
      <div className="patient-lifeline-banner p-6 sm:p-8 rounded-3xl text-white relative overflow-hidden">
        <div className="patient-aura-glow"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center font-bold text-2xl shadow-xl shrink-0">
                <i className="fa-solid fa-notes-medical text-amber-300 animate-heartbeat"></i>
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-amber-300 uppercase">24/7 Emergency Lifeline</span>
                <h1 className="font-extrabold text-xl sm:text-3xl text-white tracking-tight mt-0.5">Patient SOS & Verification Tracker</h1>
              </div>
            </div>

            <span className="px-4 py-1.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
              <i className="fa-solid fa-shield-heart text-amber-400"></i> Doctor Prescription Verified
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-amber-500/30 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-amber-500/30">
              <div className="font-bold text-amber-400">1. Upload Note</div>
              <p className="text-[11px] text-slate-300">Attach doctor prescription.</p>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-amber-500/30">
              <div className="font-bold text-amber-400">2. Hospital Review</div>
              <p className="text-[11px] text-slate-300">ER staff verifies medical need.</p>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-amber-500/30">
              <div className="font-bold text-amber-400">3. Broadcast Donors</div>
              <p className="text-[11px] text-slate-300">Alerts sent within radius.</p>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-amber-500/30">
              <div className="font-bold text-emerald-400">4. Dispatched</div>
              <p className="text-[11px] text-slate-300">Live GPS tracking to ER desk.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form + Tracker Split Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
            <i className="fa-solid fa-notes-medical text-red-500"></i> Submit New Patient SOS
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Upload Area */}
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-amber-300 uppercase">Doctor Prescription (Mandatory)</label>
                <span className="text-[10px] font-mono font-bold bg-amber-300 text-amber-950 px-2 py-0.5 rounded-full">REQUIRED</span>
              </div>

              <div className="flex items-center gap-4">
                <label className="w-20 h-20 rounded-2xl upload-dropzone-animated bg-slate-950 flex flex-col items-center justify-center cursor-pointer group shrink-0">
                  <i className="fa-solid fa-plus text-xl text-amber-400 group-hover:scale-125 transition-transform"></i>
                  <span className="text-[10px] font-bold text-amber-300 mt-1">Upload</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                </label>

                <div className="text-xs">
                  {prescriptionData ? (
                    <div>
                      <span className="text-emerald-400 font-bold block">{fileName || 'File Attached'}</span>
                      <span className="text-[10px] text-slate-400">Ready for hospital submission</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Upload doctor signed prescription or hospital note</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-white">
                  <option value="Blood">Blood / Blood Components</option>
                  <option value="Organ">Organ / Transplant Tissue</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Item Needed</label>
                <input type="text" value={itemType} onChange={(e) => setItemType(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Hospital</label>
                <input type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Doctor Name</label>
                <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Contact Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white" />
            </div>

            <button type="submit" className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 shimmer-btn">
              Submit Request to Chosen Hospital
            </button>
          </form>
        </div>

        {/* Tracker Panel */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
              <i className="fa-solid fa-clock-rotate-left text-amber-400"></i> My SOS Tracker
            </h3>

            <div className="space-y-3 max-h-[440px] overflow-y-auto">
              {patientRequests.length === 0 ? (
                <div className="p-6 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400">
                  No emergency requests submitted yet.
                </div>
              ) : (
                patientRequests.map(req => (
                  <div key={req.ref} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-slate-400">{req.ref}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        req.isVerified ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-amber-950 text-amber-300 border-amber-700'
                      }`}>
                        {req.isVerified ? '✅ Approved & Live' : '⏳ Pending Review'}
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm">{req.item}</div>
                    <div className="text-slate-400">Hospital: <b className="text-amber-400">{req.hospital}</b></div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400">
            Requests are verified by clinical hospital staff before being broadcast to volunteer donors.
          </div>
        </div>
      </div>
    </div>
  );
}
