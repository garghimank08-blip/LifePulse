import React, { useState } from 'react';

export default function LoginHero({ onLoginSuccess, onOpenDonorReg, onOpenPatientReg }) {
  const [selectedRole, setSelectedRole] = useState('hospital');
  
  // Hospital Form
  const [facility, setFacility] = useState('AIIMS Apex Trauma Centre');
  const [hospitalEmail, setHospitalEmail] = useState('er.dispatch@aiims.edu.in');
  const [hospitalPass, setHospitalPass] = useState('admin123');

  // Donor Form
  const [donorPhone, setDonorPhone] = useState('');
  const [donorPass, setDonorPass] = useState('');

  // Patient Form
  const [patientId, setPatientId] = useState('');
  const [patientPass, setPatientPass] = useState('');

  const [loginError, setLoginError] = useState('');

  // Helper to normalize phone
  const cleanPhone = (p) => {
    let raw = String(p || '').replace(/[\s\-\(\)\+]/g, '').trim();
    if (raw.length === 12 && raw.startsWith('91')) raw = raw.substring(2);
    if (raw.length === 11 && raw.startsWith('0')) raw = raw.substring(1);
    return raw;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (selectedRole === 'hospital') {
      if (hospitalPass !== 'admin123' && hospitalPass.length < 4) {
        setLoginError('❌ Invalid Hospital Admin Password! (Default: admin123)');
        return;
      }
      onLoginSuccess({ type: 'hospital', name: facility, email: hospitalEmail });
      return;
    }

    if (selectedRole === 'donor') {
      const inputClean = cleanPhone(donorPhone);
      if (!inputClean) {
        setLoginError('❌ Please enter your registered phone number.');
        return;
      }

      // Pre-seeded demo donors
      const demoDonors = [
        { fullName: 'Vikramaditya Singh', phone: '9876543210', bloodGroup: 'B+', passcode: '123456' },
        { fullName: 'Rohan Sharma', phone: '9810023456', bloodGroup: 'O-', passcode: '123456' }
      ];

      const storedDonors = JSON.parse(localStorage.getItem('lp_donors') || '[]');
      const allDonors = [...demoDonors, ...storedDonors];

      const matchedDonor = allDonors.find(d => cleanPhone(d.phone) === inputClean);

      if (!matchedDonor) {
        setLoginError(`❌ Unregistered Phone Number! No volunteer donor account found for "${donorPhone}". Please register a new account.`);
        return;
      }

      if (donorPass && donorPass !== (matchedDonor.passcode || '123456')) {
        setLoginError('❌ Invalid Passcode! Please check your passcode and try again.');
        return;
      }

      onLoginSuccess({
        type: 'donor',
        name: matchedDonor.fullName || 'Volunteer Donor',
        phone: matchedDonor.phone,
        blood_group: matchedDonor.bloodGroup
      });
      return;
    }

    if (selectedRole === 'patient') {
      const inputClean = patientId.trim().toLowerCase();
      const inputCleanPhone = cleanPhone(patientId);
      
      if (!inputClean) {
        setLoginError('❌ Please enter your ABHA Health ID or registered Mobile Number.');
        return;
      }

      // Pre-seeded demo patients
      const demoPatients = [
        { fullName: 'Ramesh Chandra', phone: '9811122334', abhaId: 'ABHA-9182-4410-2201', bloodGroup: 'B+', passcode: '123456' }
      ];

      const storedPatients = JSON.parse(localStorage.getItem('lp_patients') || '[]');
      const allPatients = [...demoPatients, ...storedPatients];

      const matchedPatient = allPatients.find(p => 
        (p.abhaId && p.abhaId.toLowerCase() === inputClean) ||
        (p.phone && cleanPhone(p.phone) === inputCleanPhone)
      );

      if (!matchedPatient) {
        setLoginError(`❌ Unregistered Patient! No record found for "${patientId}". Please register a new patient account.`);
        return;
      }

      if (patientPass && patientPass !== (matchedPatient.passcode || '123456')) {
        setLoginError('❌ Invalid Passcode! Please check your passcode and try again.');
        return;
      }

      onLoginSuccess({
        type: 'patient',
        name: matchedPatient.fullName || 'Patient Recipient',
        phone: matchedPatient.phone,
        abha_id: matchedPatient.abhaId
      });
      return;
    }
  };

  return (
    <section className="medical-grid-bg relative py-10 sm:py-14 md:py-16 min-h-[92vh] flex flex-col justify-center items-center overflow-hidden px-4">
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>

      <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-8 relative z-20">
        
        {/* Header with ECG Telemetry Monitor */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="sonar-wrapper">
            <span className="sonar-ring"></span>
            <span className="sonar-ring"></span>
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-2xl shadow-red-600/40 relative z-10 transition-transform hover:scale-110 duration-300">
              <i className="fa-solid fa-heart-pulse animate-heartbeat"></i>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-status-pulse"></span>
              SECURE CLINICAL AUTHENTICATION
            </div>
            <h1 className="font-extrabold text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Life Pulse Emergency Care Grid
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
              Registered access only. Select your role to sign in with your verified credentials or register a new record.
            </p>
          </div>

          {/* ECG Monitor Box */}
          <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-inner flex items-center gap-3 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-red-400 shrink-0">
              <i className="fa-solid fa-wave-square animate-pulse"></i> ECG MONITOR
            </div>
            <div className="flex-1 h-6 overflow-hidden relative">
              <svg className="w-full h-full" viewBox="0 0 300 30" preserveAspectRatio="none">
                <path d="M0,15 L60,15 L70,5 L80,25 L90,15 L110,15 L120,2 L130,28 L140,15 L180,15 L190,7 L200,23 L210,15 L300,15" 
                      fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ecg-line-svg"/>
              </svg>
            </div>
            <div className="text-[10px] font-mono font-extrabold text-emerald-400 shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> 72 BPM
            </div>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 sm:p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl max-w-xl mx-auto border border-slate-800 shadow-2xl">
          <button
            type="button"
            onClick={() => { setSelectedRole('hospital'); setLoginError(''); }}
            className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
              selectedRole === 'hospital'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <i className="fa-solid fa-hospital-user"></i> <span className="truncate">Hospital</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedRole('donor'); setLoginError(''); }}
            className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
              selectedRole === 'donor'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <i className="fa-solid fa-hand-holding-heart text-emerald-400"></i> <span className="truncate">Donor</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedRole('patient'); setLoginError(''); }}
            className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
              selectedRole === 'patient'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <i className="fa-solid fa-user-injured text-amber-400"></i> <span className="truncate">Patient</span>
          </button>
        </div>

        {/* Central Frosted Glass Card */}
        <div className={`max-w-md mx-auto bg-slate-900/95 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl role-theme-${selectedRole}`}>
          
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
            selectedRole === 'hospital' ? 'from-red-600 via-rose-500 to-red-700' :
            selectedRole === 'donor' ? 'from-emerald-600 via-teal-500 to-emerald-700' :
            'from-amber-600 via-orange-500 to-amber-700'
          }`}></div>

          {/* Error Message Notification */}
          {loginError && (
            <div className="mb-4 p-3.5 bg-red-950/90 border border-red-500/60 rounded-2xl text-red-200 text-xs font-bold flex items-start gap-2 shadow-lg animate-pulse">
              <i className="fa-solid fa-circle-exclamation text-base text-red-400 mt-0.5 shrink-0"></i>
              <span>{loginError}</span>
            </div>
          )}

          {selectedRole === 'hospital' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-11 h-11 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-lg border border-red-500/30">
                  <i className="fa-solid fa-hospital"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Hospital Facility Portal</h3>
                  <p className="text-xs text-slate-400">Clinical Trauma Verification Console</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Select Facility</label>
                <select 
                  value={facility} 
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-white"
                >
                  <option value="AIIMS Apex Trauma Centre">AIIMS Apex Trauma Centre</option>
                  <option value="Yashoda Super Speciality Hospital">Yashoda Super Speciality Hospital</option>
                  <option value="Max Super Speciality Hospital">Max Super Speciality Hospital</option>
                  <option value="Fortis Hospital Noida">Fortis Hospital Noida</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Facility Email</label>
                <input 
                  type="text" 
                  value={hospitalEmail}
                  onChange={(e) => setHospitalEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Admin Password</label>
                <input 
                  type="password" 
                  value={hospitalPass}
                  onChange={(e) => setHospitalPass(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <button type="submit" className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 shimmer-btn flex items-center justify-center gap-2">
                <i className="fa-solid fa-lock-open"></i>
                <span>Login to Hospital Console</span>
              </button>
            </form>
          )}

          {selectedRole === 'donor' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                  <i className="fa-solid fa-hand-holding-heart"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Volunteer Donor Portal</h3>
                  <p className="text-xs text-slate-400">Sign in with registered mobile number</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Registered Phone Number</label>
                <input 
                  type="tel" 
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Passcode</label>
                <input 
                  type="password" 
                  value={donorPass}
                  onChange={(e) => setDonorPass(e.target.value)}
                  placeholder="Enter passcode (e.g. 123456)"
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button type="submit" className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 shimmer-btn flex items-center justify-center gap-2">
                <i className="fa-solid fa-right-to-bracket"></i>
                <span>Login as Volunteer Donor</span>
              </button>

              <div className="text-center pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Not registered yet?</p>
                <button type="button" onClick={onOpenDonorReg} className="text-xs font-extrabold text-emerald-400 hover:underline inline-flex items-center gap-1">
                  <i className="fa-solid fa-user-plus"></i> Register Volunteer Donor Profile
                </button>
              </div>
            </form>
          )}

          {selectedRole === 'patient' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
                  <i className="fa-solid fa-user-injured"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Patient Lifeline Portal</h3>
                  <p className="text-xs text-slate-400">Sign in with ABHA ID or registered Mobile</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">ABHA Health ID / Mobile Phone</label>
                <input 
                  type="text" 
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g. ABHA-9182-4410-2201 or 9811122334"
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Passcode</label>
                <input 
                  type="password" 
                  value={patientPass}
                  onChange={(e) => setPatientPass(e.target.value)}
                  placeholder="Enter passcode (e.g. 123456)"
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button type="submit" className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 shimmer-btn flex items-center justify-center gap-2">
                <i className="fa-solid fa-right-to-bracket"></i>
                <span>Login as Patient</span>
              </button>

              <div className="text-center pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-400 mb-1">New Patient User?</p>
                <button type="button" onClick={onOpenPatientReg} className="text-xs font-bold text-amber-400 hover:underline inline-flex items-center gap-1">
                  <i className="fa-solid fa-address-card"></i> Register New Patient Account
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </section>
  );
}
