import React, { useState } from 'react';

export default function DispatchGrid({ dispatches, onRespond, userRole, onEvaluateML }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  const filtered = dispatches.filter(req => {
    const textMatch = req.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      req.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      req.item.toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = categoryFilter === 'ALL' || req.category === categoryFilter;
    const urgMatch = urgencyFilter === 'ALL' || req.urgency === urgencyFilter;
    return textMatch && catMatch && urgMatch;
  });

  return (
    <div className="space-y-6">
      {/* Stats Ribbon */}
      <section className="bg-slate-900 border-b border-slate-800 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center font-bold text-lg shrink-0">
                <i className="fa-solid fa-heart-circle-bolt animate-pulse"></i>
              </div>
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Verified Dispatches</div>
                <div className="text-lg sm:text-xl font-extrabold text-white font-mono">{filtered.length} Active</div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Registered Donors</div>
                <div className="text-lg sm:text-xl font-extrabold text-white font-mono">184 Local</div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-lg shrink-0">
                <i className="fa-solid fa-brain"></i>
              </div>
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-300">ML Match Engine</div>
                <div className="text-lg sm:text-xl font-extrabold text-white font-mono">RandomForest</div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
                <i className="fa-solid fa-stopwatch"></i>
              </div>
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Fan-out Dispatch</div>
                <div className="text-lg sm:text-xl font-extrabold text-white font-mono">&lt; 2.0 Secs</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 shadow-xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Hospital, Ref ID, or Organ / Blood..."
                className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-red-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-slate-200"
            >
              <option value="ALL">All Categories</option>
              <option value="Blood">Blood & Components</option>
              <option value="Organ">Organ & Tissue</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-slate-200"
            >
              <option value="ALL">All Priority Tiers</option>
              <option value="Critical">🚨 Critical (&lt; 30 Mins)</option>
              <option value="Urgent">⚠️ Urgent (&lt; 2 Hours)</option>
              <option value="Routine">📋 Scheduled</option>
            </select>
          </div>

          <button
            onClick={() => { setSearchTerm(''); setCategoryFilter('ALL'); setUrgencyFilter('ALL'); }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(req => (
            <div key={req.ref} className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl hover:border-red-500/50 transition-all space-y-3.5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-extrabold text-xs text-slate-400">{req.ref}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        req.category === 'Organ' ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-red-950 text-red-300 border-red-800'
                      }`}>
                        {req.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        req.urgency === 'Critical' ? 'bg-red-950/80 text-red-400 border-red-800' : 'bg-amber-950/80 text-amber-400 border-amber-800'
                      }`}>
                        {req.urgency}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-lg text-white mt-1.5">{req.item} ({req.units} {req.category === 'Organ' ? 'Organ' : 'Units'})</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                    {req.radius} km
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1.5 mt-3 font-medium">
                  <div className="flex items-center gap-2"><i className="fa-solid fa-hospital text-blue-400 w-4"></i> <b className="text-white">{req.hospital}</b></div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-user-doctor text-slate-400 w-4"></i> {req.doctor}</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-location-dot text-red-400 w-4"></i> {req.sector}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onEvaluateML(req)}
                  className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <i className="fa-solid fa-brain text-xs"></i> ML Score
                </button>

                {userRole?.type === 'donor' || userRole?.type === 'hospital' ? (
                  <button
                    onClick={() => onRespond(req)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 shimmer-btn"
                  >
                    Respond
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Login to respond</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
