import React from 'react';

export default function DonorHub({ dispatches, nearbyFacilities, onRespond, onOpenDonorProfile, onFocusHospital }) {
  const verifiedDispatches = dispatches.filter(r => r.isVerified && r.status === 'ACTIVE_DISPATCH');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 py-6">
      {/* Aurora Hero Banner */}
      <div className="donor-hero-banner p-6 sm:p-8 rounded-3xl text-white relative overflow-hidden">
        <div className="donor-aurora-glow"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-xl donor-life-ring shrink-0">
              <i className="fa-solid fa-hand-holding-heart text-emerald-300 animate-heartbeat"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> READY FOR IMMEDIATE DISPATCH
                </span>
                <span className="text-xs text-emerald-200 font-bold"><i className="fa-solid fa-star text-amber-300"></i> Level 2 Hero</span>
              </div>
              <h1 className="font-extrabold text-xl sm:text-3xl text-white tracking-tight mt-1">Exclusive Donor Volunteer Console</h1>
              <p className="text-xs text-emerald-100/80 mt-0.5">Every emergency request below has been verified & cleared by hospital clinical staff.</p>
            </div>
          </div>

          <button onClick={onOpenDonorProfile} className="px-4 py-2.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-extrabold text-xs transition-all shadow-lg flex items-center gap-2">
            <i className="fa-solid fa-id-card text-emerald-600"></i> My Volunteer Profile
          </button>
        </div>

        {/* Impact Stat Cards */}
        <div className="mt-6 pt-4 border-t border-emerald-500/30 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/40 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/20 flex items-center gap-2.5">
            <i className="fa-solid fa-shield-heart text-emerald-400 text-lg"></i>
            <div><div className="text-[10px] text-emerald-200 font-bold uppercase">Status</div><div className="font-extrabold text-white">Emergency On-Call</div></div>
          </div>
          <div className="bg-slate-950/40 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/20 flex items-center gap-2.5">
            <i className="fa-solid fa-droplet text-red-400 text-lg"></i>
            <div><div className="text-[10px] text-emerald-200 font-bold uppercase">Blood Matching</div><div className="font-extrabold text-white">All Rh Matches</div></div>
          </div>
          <div className="bg-slate-950/40 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/20 flex items-center gap-2.5">
            <i className="fa-solid fa-location-arrow text-blue-400 text-lg"></i>
            <div><div className="text-[10px] text-emerald-200 font-bold uppercase">Geofence Radius</div><div className="font-extrabold text-white">10 km Local Grid</div></div>
          </div>
          <div className="bg-slate-950/40 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/20 flex items-center gap-2.5">
            <i className="fa-solid fa-award text-amber-400 text-lg"></i>
            <div><div className="text-[10px] text-emerald-200 font-bold uppercase">Lives Saved</div><div className="font-extrabold text-white">4 Verified Saves</div></div>
          </div>
        </div>
      </div>

      {/* Discovered Nearest Emergency Hospitals In Radius Widget */}
      {nearbyFacilities && nearbyFacilities.length > 0 && (
        <div className="bg-slate-900 rounded-3xl border border-emerald-500/40 p-5 shadow-xl space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="font-extrabold text-sm text-white">Nearest Emergency Hospitals In Your Live Radius</h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full">
              LIVE GPS PROXIMITY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {nearbyFacilities.slice(0, 4).map((h, i) => (
              <div key={i} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">#{i + 1} PROXIMITY</span>
                    <span className="text-emerald-400 font-bold">{h.distanceKm} KM</span>
                  </div>
                  <div className="font-extrabold text-white text-xs mt-1 truncate" title={h.name}>{h.name}</div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-[11px]">
                  <span className="text-amber-400 font-mono font-bold">~{h.etaMins || Math.round(h.distanceKm * 2.2)}m ETA</span>
                  <button 
                    onClick={() => onFocusHospital && onFocusHospital(h)}
                    className="text-emerald-400 hover:underline font-bold"
                  >
                    View Radar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Feed Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
          <i className="fa-solid fa-tower-broadcast text-emerald-400 animate-pulse"></i> Live Verified Emergency Alerts Requiring Donors
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifiedDispatches.map(req => (
            <div key={req.ref} className="bg-slate-900 rounded-3xl border border-emerald-500/30 p-6 shadow-xl flex flex-col justify-between space-y-4 donor-card-hover relative overflow-hidden">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-xs font-bold text-slate-400">{req.ref}</span>
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                    Hospital Cleared
                  </span>
                </div>
                <h3 className="font-extrabold text-xl text-white">{req.item} ({req.units} Units)</h3>
                <p className="text-xs font-bold text-emerald-400 mt-1">{req.hospital}</p>
                <p className="text-xs text-slate-400 mt-2"><i className="fa-solid fa-location-dot text-red-400 mr-1"></i> {req.sector}</p>

                {req.distanceKm && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-emerald-500/20 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-300"><i className="fa-solid fa-route text-emerald-400 mr-1"></i> Proximity: <b className="text-emerald-400">{req.distanceKm} km</b></span>
                    <span className="text-amber-400 font-mono font-bold">~{Math.round(req.distanceKm * 2.2)}m ETA</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono font-bold">{req.radius} km radius</span>
                <button
                  onClick={() => onRespond(req)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 shimmer-btn"
                >
                  Offer Donation Response
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
