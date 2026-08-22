import React, { useState, useEffect } from 'react';

export default function HospitalDesk() {
  const [requests, setRequests] = useState([
    { id: 'REQ-101', patient_name: 'Rahul Verma', need_type: 'blood', blood_group: 'O-', organ_type: null, hospital_name: 'City Trauma Center', status: 'UNVERIFIED_PENDING' },
    { id: 'REQ-102', patient_name: 'Ananya Roy', need_type: 'organ', blood_group: null, organ_type: 'Kidney', hospital_name: 'Metro Hospital', status: 'VERIFIED_BROADCAST' }
  ]);

  useEffect(() => {
    fetch('http://localhost:8000/api/requests')
      .then((res) => res.json())
      .then((data) => { if (data && data.length) setRequests(data); })
      .catch(() => {});
  }, []);

  const handleVerify = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/requests/${id}/verify`, { method: 'PUT' });
    } catch (e) {}

    setRequests(requests.map(r => r.id === id ? { ...r, status: 'VERIFIED_BROADCAST' } : r));
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            Hospital Verification Control Panel
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Authorize emergency tickets to trigger real-time donor broadcasts.</p>
        </div>
        <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full">
          Authorized ER Console
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-3">Ticket ID</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Type</th>
              <th className="p-3">Requirement</th>
              <th className="p-3">Hospital</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-slate-700/30">
                <td className="p-3 font-mono font-bold text-slate-300">{r.id}</td>
                <td className="p-3 font-semibold text-white">{r.patient_name}</td>
                <td className="p-3 uppercase text-slate-400">{r.need_type}</td>
                <td className="p-3 font-bold text-red-400">{r.blood_group || r.organ_type}</td>
                <td className="p-3 text-slate-300">{r.hospital_name}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    r.status === 'VERIFIED_BROADCAST'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {r.status === 'UNVERIFIED_PENDING' ? (
                    <button
                      onClick={() => handleVerify(r.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded font-bold transition"
                    >
                      Authorize & Broadcast
                    </button>
                  ) : (
                    <span className="text-slate-500 italic">Broadcast Active</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}