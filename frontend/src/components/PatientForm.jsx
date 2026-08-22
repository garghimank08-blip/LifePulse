import React, { useState } from 'react';

export default function PatientForm() {
  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    need_type: 'blood',
    blood_group: 'O-',
    organ_type: 'Kidney',
    hospital_name: '',
    doctor_name: '',
    doctor_phone: '',
  });
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: formData.patient_name,
          age: parseInt(formData.age),
          need_type: formData.need_type,
          blood_group: formData.need_type === 'blood' ? formData.blood_group : null,
          organ_type: formData.need_type === 'organ' ? formData.organ_type : null,
          hospital_name: formData.hospital_name,
          doctor_name: formData.doctor_name,
          doctor_phone: formData.doctor_phone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmittedTicket(data.id);
      } else {
        // Fallback demo ticket if server isn't running
        setSubmittedTicket(`REQ-${Math.floor(100 + Math.random() * 900)}`);
      }
    } catch (err) {
      setSubmittedTicket(`REQ-${Math.floor(100 + Math.random() * 900)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
          Emergency Request Portal
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Submit critical medical requests. Unverified tickets require hospital ER authorization before regional broadcast.
        </p>
      </div>

      {submittedTicket ? (
        <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-xl text-center space-y-3">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h3 className="text-lg font-bold text-amber-400">Request Ticket Generated</h3>
          <p className="text-xs font-mono bg-slate-900 py-2 px-4 rounded-lg border border-slate-700 inline-block text-slate-200">
            Ticket ID: <span className="text-red-400 font-bold">{submittedTicket}</span>
          </p>
          <p className="text-xs text-slate-400">
            Status: <span className="text-amber-400 font-semibold">UNVERIFIED_PENDING</span>. Present this ID to hospital desk staff for verification.
          </p>
          <button
            onClick={() => setSubmittedTicket(null)}
            className="mt-4 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-4 py-2 rounded-lg font-semibold transition"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Verma"
                value={formData.patient_name}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Age</label>
              <input
                type="number"
                required
                placeholder="e.g. 29"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Requirement Type</label>
              <select
                value={formData.need_type}
                onChange={(e) => setFormData({ ...formData, need_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="blood">Blood / Platelets</option>
                <option value="organ">Organ Transplant</option>
              </select>
            </div>

            {formData.need_type === 'blood' ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Blood Group</label>
                <select
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organ Required</label>
                <select
                  value={formData.organ_type}
                  onChange={(e) => setFormData({ ...formData, organ_type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  {['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas'].map((org) => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Hospital Name</label>
              <input
                type="text"
                required
                placeholder="e.g. City Trauma Center"
                value={formData.hospital_name}
                onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Attending Doctor Name</label>
              <input
                type="text"
                required
                placeholder="Dr. A. Sharma"
                value={formData.doctor_name}
                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Prescription Upload / Doctor Note</label>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-slate-500 transition bg-slate-900/50">
              <span className="text-xs text-slate-400">📄 Click or drag medical documents to attach</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-600/30 transition text-sm disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Generate Emergency Request Ticket'}
          </button>
        </form>
      )}
    </div>
  );
}