import React, { useState } from 'react';
import { apiRequest } from '../services/api';

export default function RegistrationHub({ onRegisteredSuccess }) {
  const [activeRegType, setActiveRegType] = useState('donor'); // 'donor' or 'patient'
  
  // Track registered phones in session
  const [registeredPhonesList, setRegisteredPhonesList] = useState([
    '9876543210', '9810023456', '9811122334'
  ]);

  // Donor Form State
  const initialDonorState = {
    fullName: '',
    email: '',
    bloodGroup: 'O+',
    phone: '',
    age: 26,
    city: 'Delhi NCR',
    availability: 'Immediate',
    passcode: '123456'
  };

  // Patient Form State
  const initialPatientState = {
    fullName: '',
    phone: '',
    email: '',
    bloodGroup: 'B+',
    ageGender: '35 / Male',
    abhaId: '',
    emergencyContact: '',
    passcode: '123456'
  };

  const [donorData, setDonorData] = useState(initialDonorState);
  const [patientData, setPatientData] = useState(initialPatientState);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Normalize Phone helper
  const cleanPhone = (p) => {
    let raw = String(p || '').replace(/[\s\-\(\)\+]/g, '').trim();
    if (raw.length === 12 && raw.startsWith('91')) raw = raw.substring(2);
    if (raw.length === 11 && raw.startsWith('0')) raw = raw.substring(1);
    return raw;
  };

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const normPhone = cleanPhone(donorData.phone);

    // Duplicate Phone Check
    if (registeredPhonesList.includes(normPhone)) {
      setErrorMessage(`⚠️ Phone number (${donorData.phone}) is already registered! Please provide a unique phone number.`);
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/auth/donor-register', {
        method: 'POST',
        body: JSON.stringify(donorData)
      });
    } catch (err) {}

    // Add to registered set & reset form
    setRegisteredPhonesList(prev => [...prev, normPhone]);
    const submittedName = donorData.fullName;
    const submittedBg = donorData.bloodGroup;
    setDonorData(initialDonorState); // Clear form fields
    setLoading(false);

    if (onRegisteredSuccess) {
      onRegisteredSuccess({
        type: 'donor',
        name: submittedName || 'Volunteer Hero',
        blood_group: submittedBg
      });
    }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const normPhone = cleanPhone(patientData.phone);

    // Duplicate Phone Check
    if (registeredPhonesList.includes(normPhone)) {
      setErrorMessage(`⚠️ Phone number (${patientData.phone}) is already registered! Please provide a unique phone number.`);
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/auth/patient-register', {
        method: 'POST',
        body: JSON.stringify(patientData)
      });
    } catch (err) {}

    // Add to registered set & reset form
    setRegisteredPhonesList(prev => [...prev, normPhone]);
    const submittedName = patientData.fullName;
    const submittedPhone = patientData.phone;
    setPatientData(initialPatientState); // Clear form fields
    setLoading(false);

    if (onRegisteredSuccess) {
      onRegisteredSuccess({
        type: 'patient',
        name: submittedName || 'Patient Recipient',
        phone: submittedPhone
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 py-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-950 border border-slate-800 shadow-2xl text-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-red-600/30 shrink-0">
              <i className="fa-solid fa-address-card animate-pulse"></i>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                LIFE PULSE ONBOARDING PORTAL
              </span>
              <h1 className="font-extrabold text-2xl sm:text-3xl text-white">
                New Record Registration Desk
              </h1>
            </div>
          </div>

          {/* Switcher Tab Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => { setActiveRegType('donor'); setErrorMessage(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeRegType === 'donor'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-hand-holding-medical"></i>
              <span>Volunteer Donor</span>
            </button>

            <button
              onClick={() => { setActiveRegType('patient'); setErrorMessage(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeRegType === 'patient'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-user-injured"></i>
              <span>Emergency Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/90 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
          <i className="fa-solid fa-circle-exclamation text-base text-red-400"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Registration Forms Container */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Main Form (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          
          {activeRegType === 'donor' ? (
            <form onSubmit={handleDonorSubmit} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                  <i className="fa-solid fa-hand-holding-heart"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Volunteer Donor Registration Form</h3>
                  <p className="text-xs text-slate-400">Register to receive hospital-verified emergency alerts</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singh"
                  value={donorData.fullName}
                  onChange={(e) => setDonorData({ ...donorData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Mobile Phone (Unique ID)</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={donorData.phone}
                    onChange={(e) => setDonorData({ ...donorData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="vikram@example.com"
                    value={donorData.email}
                    onChange={(e) => setDonorData({ ...donorData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Blood Group Chips Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Blood Group & Rh Factor</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setDonorData({ ...donorData, bloodGroup: bg })}
                      className={`py-2 rounded-xl text-xs font-mono font-extrabold transition-all border ${
                        donorData.bloodGroup === bg
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30 scale-105'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-500/50'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={donorData.age}
                    onChange={(e) => setDonorData({ ...donorData, age: parseInt(e.target.value) || 18 })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">City / District</label>
                  <input
                    type="text"
                    value={donorData.city}
                    onChange={(e) => setDonorData({ ...donorData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Availability Status</label>
                <select
                  value={donorData.availability}
                  onChange={(e) => setDonorData({ ...donorData, availability: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-white"
                >
                  <option value="Immediate">🟢 Immediate Emergency On-Call</option>
                  <option value="24 Hours">🟡 Available within 24 Hours</option>
                  <option value="Scheduled">🔵 Scheduled / Weekend Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Create Account Passcode</label>
                <input
                  type="password"
                  value={donorData.passcode}
                  onChange={(e) => setDonorData({ ...donorData, passcode: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 shimmer-btn flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <i className="fa-solid fa-user-plus"></i>
                <span>{loading ? 'Saving Record to Database...' : 'Complete Volunteer Registration & Access Site'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
                  <i className="fa-solid fa-user-injured"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Patient Record Registration Form</h3>
                  <p className="text-xs text-slate-400">Register to submit verified emergency requests & track dispatches</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={patientData.fullName}
                  onChange={(e) => setPatientData({ ...patientData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Primary Mobile Phone (Unique ID)</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={patientData.phone}
                    onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={patientData.email}
                    onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Blood Group</label>
                  <select
                    value={patientData.bloodGroup}
                    onChange={(e) => setPatientData({ ...patientData, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-white"
                  >
                    <option>O-</option><option>O+</option><option>A-</option><option>A+</option><option>B-</option><option selected>B+</option><option>AB-</option><option>AB+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Age & Gender</label>
                  <input
                    type="text"
                    placeholder="e.g. 42 / Male"
                    value={patientData.ageGender}
                    onChange={(e) => setPatientData({ ...patientData, ageGender: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">ABHA Health ID / UHID</label>
                  <input
                    type="text"
                    placeholder="ABHA-9182-4410-2201"
                    value={patientData.abhaId}
                    onChange={(e) => setPatientData({ ...patientData, abhaId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya (+91 98111 22334)"
                    value={patientData.emergencyContact}
                    onChange={(e) => setPatientData({ ...patientData, emergencyContact: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Create Account Passcode</label>
                <input
                  type="password"
                  value={patientData.passcode}
                  onChange={(e) => setPatientData({ ...patientData, passcode: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 shimmer-btn flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <i className="fa-solid fa-address-card"></i>
                <span>{loading ? 'Saving Record to Database...' : 'Register Patient Profile & Access Site'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Live ID Preview Badge Card (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-id-badge text-blue-400"></i>
              <span>Live Record Preview Badge</span>
            </h3>

            {activeRegType === 'donor' ? (
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/40 space-y-4 relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase">NATIONAL DONOR REGISTRY</span>
                    <h4 className="font-extrabold text-lg text-white mt-1">
                      {donorData.fullName || 'Volunteer Donor Name'}
                    </h4>
                    <p className="text-xs text-slate-400">{donorData.city || 'District Location'}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg font-mono">
                    {donorData.bloodGroup}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Availability</span>
                    <div className="font-bold text-emerald-400">{donorData.availability}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Verified Mobile</span>
                    <div className="font-bold text-slate-200">{donorData.phone || '+91 - - - - - - -'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 border border-amber-500/40 space-y-4 relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold text-amber-400 uppercase">EMERGENCY PATIENT CARD</span>
                    <h4 className="font-extrabold text-lg text-white mt-1">
                      {patientData.fullName || 'Patient Full Name'}
                    </h4>
                    <p className="text-xs text-slate-400">{patientData.ageGender || 'Age & Gender'}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-lg font-mono">
                    {patientData.bloodGroup}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">ABHA UHID</span>
                    <div className="font-bold text-amber-300 truncate">{patientData.abhaId || 'ABHA-Auto-Assigned'}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Emergency Contact</span>
                    <div className="font-bold text-slate-200 truncate">{patientData.emergencyContact || 'Designated Contact'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <i className="fa-solid fa-shield-check text-emerald-400"></i> HIPAA / ABDM Compliant
            </div>
            <p>All medical records and emergency contacts are encrypted and verified against clinical databases.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
