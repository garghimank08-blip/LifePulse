import React, { useState } from 'react';

export default function HospitalDesk() {
  const [pin, setPin] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  
  // Mock requests for presentation view
  const [requests, setRequests] = useState([
    { id: 'REQ-101', patient: 'Ananya Roy', need: 'O- Negative Blood (2 Units)', hospital: 'City Trauma Center', status: 'UNVERIFIED_PENDING' },
    { id: 'REQ-102', patient: 'Vikram Singh', need: 'Kidney Transplant', hospital: 'Metro General', status: 'VERIFIED_EMERGENCY' }
  ]);

  const verifyTicket = (id) => {
    if (pin === '4026') {
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'VERIFIED_EMERGENCY' } : r));
      alert('Ticket Verified! Real-time WebSocket SOS broadcasted to nearby donors.');
      setSelectedReq(null);
      setPin('');
    } else {
      alert('Invalid Security PIN! (Use demo PIN: 4026)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          Hospital ER Control Desk (Verification Portal)
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-700/50 text-slate-400">
              <tr>
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Requirement</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-700/30">
                  <td className="p-3 font-mono font-bold">{r.id}</td>
                  <td className="p-3 font-semibold">{r.patient}</td>
                  <td className="p-3 text-slate-300">{r.need}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      r.status === 'VERIFIED_EMERGENCY' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {r.status === 'UNVERIFIED_PENDING' ? (
                      <button 
                        onClick={() => setSelectedReq(r.id)}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg font-semibold text-xs transition"
                      >
                        Verify & Broadcast
                      </button>
                    ) : (
                      <span className="text-slate-500 text-xs">Active Broadcast</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification PIN Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Doctor Verification • {selectedReq}</h3>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center text-slate-400 text-xs">
              [ Prescription Document Preview Checked ]
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Enter 4-Digit Hospital Security PIN</label>
              <input 
                type="password" 
                maxLength="4"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4026"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-lg tracking-widest text-white"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedReq(null)} className="flex-1 bg-slate-700 p-2 rounded-lg text-sm font-semibold">Cancel</button>
              <button onClick={() => verifyTicket(selectedReq)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 p-2 rounded-lg text-sm font-semibold">Authorize SOS</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}