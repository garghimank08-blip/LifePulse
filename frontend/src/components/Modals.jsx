import React, { useState } from 'react';
import { apiRequest } from '../services/api';

export function PrescriptionInspectionModal({ url, onClose }) {
  if (!url) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-4 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white text-sm">✕</button>
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <i className="fa-solid fa-file-medical text-blue-400"></i> Doctor Prescription Inspection
        </h3>
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center min-h-[280px] p-2">
          <img src={url} alt="Prescription" className="max-h-[65vh] object-contain rounded-2xl shadow" />
        </div>
        <div className="text-right">
          <button onClick={onClose} className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

export function DonorAcceptModal({ req, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [eta, setEta] = useState('15-20 Mins');

  if (!req) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ref: req.ref, name, phone, eta });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-5 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white text-sm">✕</button>
        
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-lg border border-red-500/30">
            <i className="fa-solid fa-hand-holding-heart"></i>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Offer Donation Response</h3>
            <p className="text-xs text-slate-400">Requires Hospital Review & Clearance</p>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5">
          <div className="flex justify-between"><span className="text-slate-400">Ref:</span><b className="font-mono text-white">{req.ref}</b></div>
          <div className="flex justify-between"><span className="text-slate-400">Hospital:</span><b className="text-white">{req.hospital}</b></div>
          <div className="flex justify-between"><span className="text-slate-400">Requirement:</span><b className="text-red-400">{req.item} ({req.units} Units)</b></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Your Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Contact Phone</label>
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Estimated Arrival (ETA)</label>
            <select value={eta} onChange={(e) => setEta(e.target.value)} className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-white">
              <option value="15-20 Mins">Within 15–20 Minutes (En Route)</option>
              <option value="30 Mins">Within 30 Minutes</option>
              <option value="45 Mins">Within 45 Minutes</option>
            </select>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose} className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs">Cancel</button>
            <button type="submit" className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 shimmer-btn">Submit Response</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Dedicated Volunteer Donor Registration Modal
export function DonorRegistrationModal({ isOpen, onClose, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bloodGroup: 'B+',
    phone: '',
    age: 25,
    city: 'Delhi NCR',
    availability: 'Immediate',
    passcode: '123456'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check duplicate phone locally
    const existingDonors = JSON.parse(localStorage.getItem('lp_donors') || '[]');
    const cleanPhone = String(formData.phone).replace(/[\s\-\(\)\+]/g, '');
    
    if (existingDonors.some(d => String(d.phone).replace(/[\s\-\(\)\+]/g, '') === cleanPhone)) {
      setError(`⚠️ Phone number (${formData.phone}) is already registered! Please use a unique phone number.`);
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/auth/donor-register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    } catch (err) {}

    // Save to local storage
    existingDonors.push({ ...formData, id: `DONOR-${Date.now()}` });
    localStorage.setItem('lp_donors', JSON.stringify(existingDonors));

    // Reset form fields
    const registeredName = formData.fullName;
    setFormData({
      fullName: '',
      email: '',
      bloodGroup: 'B+',
      phone: '',
      age: 25,
      city: 'Delhi NCR',
      availability: 'Immediate',
      passcode: '123456'
    });
    setLoading(false);
    onClose();

    // Authenticate & open site
    onRegisterSuccess({
      type: 'donor',
      name: registeredName || 'Volunteer Hero',
      bloodGroup: formData.bloodGroup
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 relative max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white text-sm">✕</button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
            <i className="fa-solid fa-hand-holding-heart"></i>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Volunteer Donor Registration</h3>
            <p className="text-xs text-slate-400">Join district emergency response network</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-red-400"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikramaditya Singh"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Mobile Phone (Unique)</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email Address</label>
              <input
                type="email"
                placeholder="vikram@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-white"
              >
                <option>O-</option><option>O+</option><option>A-</option><option>A+</option><option>B-</option><option>B+</option><option>AB-</option><option>AB+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Age (Years)</label>
              <input
                type="number"
                min="18"
                max="65"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">City / District</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Availability</label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-white"
              >
                <option value="Immediate">🟢 Immediate On-Call</option>
                <option value="24 Hours">🟡 Within 24h</option>
                <option value="Scheduled">🔵 Scheduled Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Account Passcode</label>
            <input
              type="password"
              value={formData.passcode}
              onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 shimmer-btn"
            >
              {loading ? 'Saving...' : 'Complete & Access Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Dedicated Emergency Patient Registration Modal
export function PatientRegistrationModal({ isOpen, onClose, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    bloodGroup: 'B+',
    ageGender: '35 / Male',
    abhaId: '',
    emergencyContact: '',
    passcode: '123456'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check duplicate phone locally
    const existingPatients = JSON.parse(localStorage.getItem('lp_patients') || '[]');
    const cleanPhone = String(formData.phone).replace(/[\s\-\(\)\+]/g, '');
    
    if (existingPatients.some(p => String(p.phone).replace(/[\s\-\(\)\+]/g, '') === cleanPhone)) {
      setError(`⚠️ Phone number (${formData.phone}) is already registered! Please use a unique phone number.`);
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/auth/patient-register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    } catch (err) {}

    // Save to local storage
    existingPatients.push({ ...formData, id: `PATIENT-${Date.now()}` });
    localStorage.setItem('lp_patients', JSON.stringify(existingPatients));

    // Reset form fields
    const registeredName = formData.fullName;
    const registeredPhone = formData.phone;
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      bloodGroup: 'B+',
      ageGender: '35 / Male',
      abhaId: '',
      emergencyContact: '',
      passcode: '123456'
    });
    setLoading(false);
    onClose();

    // Authenticate & open site
    onRegisterSuccess({
      type: 'patient',
      name: registeredName || 'Patient Recipient',
      phone: registeredPhone
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 relative max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white text-sm">✕</button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
            <i className="fa-solid fa-user-injured"></i>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Patient Record Registration</h3>
            <p className="text-xs text-slate-400">Register to submit verified emergency requests</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-red-400"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Patient Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Mobile Phone (Unique)</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email Address</label>
              <input
                type="email"
                placeholder="patient@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-white"
              >
                <option>O-</option><option>O+</option><option>A-</option><option>A+</option><option>B-</option><option>B+</option><option>AB-</option><option>AB+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Age & Gender</label>
              <input
                type="text"
                value={formData.ageGender}
                onChange={(e) => setFormData({ ...formData, ageGender: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">ABHA ID / UHID</label>
              <input
                type="text"
                placeholder="ABHA-9182-4410-2201"
                value={formData.abhaId}
                onChange={(e) => setFormData({ ...formData, abhaId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Emergency Contact</label>
              <input
                type="text"
                required
                placeholder="Priya (+91 98111 22334)"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Account Passcode</label>
            <input
              type="password"
              value={formData.passcode}
              onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 shimmer-btn"
            >
              {loading ? 'Saving...' : 'Complete & Access Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
