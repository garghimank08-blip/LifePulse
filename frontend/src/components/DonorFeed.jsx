import React, { useState, useEffect } from 'react';

export default function DonorFeed() {
  const [alerts, setAlerts] = useState([
    {
      id: 'REQ-102',
      title: 'CRITICAL O- NEGATIVE NEEDED',
      hospital: 'Metro Hospital',
      distance: '3.2 km away',
      units: '2 Units',
      accepted: false
    },
    {
      id: 'SOS-881',
      title: 'PLATELETS REQUEST (B+)',
      hospital: 'City Care Hospital',
      distance: '6.8 km away',
      units: '1 Unit',
      accepted: false
    }
  ]);

  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'EMERGENCY_BROADCAST_ALERT') {
          const newAlert = {
            id: msg.data.id,
            title: msg.data.title,
            hospital: msg.data.hospital_name,
            distance: '2.1 km away',
            units: '1 Unit',
            accepted: false
          };
          setAlerts((prev) => [newAlert, ...prev]);
        }
      } catch (e) {}
    };

    return () => ws.close();
  }, []);

  const toggleAccept = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, accepted: !a.accepted } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            Live Donor Emergency Feed
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">WebSocket alerts pushed to verified donors within geofenced regional radius.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border ${
          wsConnected 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
          {wsConnected ? 'WebSocket Live' : 'Simulated Feed'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-5 rounded-2xl border transition-all ${
              alert.accepted 
                ? 'bg-emerald-950/30 border-emerald-500/40' 
                : 'bg-slate-800 border-slate-700 hover:border-red-500/50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 border border-red-800 px-2.5 py-0.5 rounded-full">
                {alert.id}
              </span>
              <span className="text-xs text-slate-400">Just now</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{alert.title}</h3>
            <p className="text-sm text-slate-300 font-medium mb-3">{alert.hospital}</p>

            <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
              <div>📍 <span className="text-slate-200 font-semibold">{alert.distance}</span></div>
              <div>🩸 <span className="text-slate-200 font-semibold">{alert.units}</span></div>
            </div>

            <button
              onClick={() => toggleAccept(alert.id)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
                alert.accepted
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
              }`}
            >
              {alert.accepted ? '✓ Accepted (ER Staff Notified)' : 'Respond to Emergency'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}