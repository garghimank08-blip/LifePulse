import React, { useState } from 'react';

export default function H2HExchange() {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);

  const runMLMatch = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/h2h/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organ_type: 'Kidney',
          blood_group: 'O+',
          donor_age: 28,
          max_ischemia_hours: 12.0,
          current_ischemia_hours: 2.5,
          hla_match_ratio: 0.92
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMatches(data.ranked_matches);
      } else {
        fallbackMock();
      }
    } catch (e) {
      fallbackMock();
    } finally {
      setLoading(false);
    }
  };

  const fallbackMock = () => {
    setMatches([
      { recipient_id: 'R-201', recipient_name: 'Rohan Sharma', hospital: 'Metro Heart Institute', match_score: 91.2, hla_compatibility_pct: 92.0, remaining_ischemia_hours: 9.5, recommendation: 'OPTIMAL_MATCH' },
      { recipient_id: 'R-202', recipient_name: 'Priya Patel', hospital: 'City Care Hospital', match_score: 78.4, hla_compatibility_pct: 84.0, remaining_ischemia_hours: 9.5, recommendation: 'OPTIMAL_MATCH' },
    ]);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
          Inter-Hospital (H2H) Organ Exchange Engine
        </h2>
        <p className="text-xs text-slate-400 mt-1">Cross-match donor organs with regional recipient waitlists based on HLA compatibility and ischemia decay models.</p>
      </div>

      <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-xs text-slate-300 space-y-1">
          <p><strong className="text-slate-400">Donor Organ:</strong> Kidney (Left) | <strong className="text-slate-400">Blood Group:</strong> O+</p>
          <p><strong className="text-slate-400">Max Ischemia Window:</strong> 12.0 Hours | <strong className="text-slate-400">Elapsed:</strong> 2.5 Hours</p>
        </div>
        <button
          onClick={runMLMatch}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition shadow-lg shadow-indigo-600/30"
        >
          {loading ? 'Processing ML Matrix...' : 'Run Compatibility Cross-Match'}
        </button>
      </div>

      {matches && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Ranked Regional Matches</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Hospital</th>
                  <th className="p-3">HLA Match</th>
                  <th className="p-3">ML Compatibility Score</th>
                  <th className="p-3">Ischemia Buffer</th>
                  <th className="p-3 text-right">Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {matches.map((m) => (
                  <tr key={m.recipient_id} className="hover:bg-slate-700/30">
                    <td className="p-3 font-semibold text-white">{m.recipient_name}</td>
                    <td className="p-3 text-slate-300">{m.hospital}</td>
                    <td className="p-3 font-mono">{m.hla_compatibility_pct}%</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{m.match_score}%</td>
                    <td className="p-3 text-amber-400 font-semibold">{m.remaining_ischemia_hours} hrs remaining</td>
                    <td className="p-3 text-right">
                      <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded font-bold transition">
                        Initiate Transit Corridor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}