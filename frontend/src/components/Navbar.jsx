import React from 'react';

export default function Navbar({ activeTab, setActiveTab, userRole, setUserRole, activeDispatchesCount, onEmergencyClick }) {
  if (!userRole) return null;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between py-2.5 lg:h-20 gap-2.5">
          
          {/* Logo & Mobile Role Controls */}
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('dispatch')}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg shadow-red-600/30">
                <i className="fa-solid fa-heart-pulse animate-heartbeat"></i>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight leading-none">
                    Life Pulse
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-700/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> REACT 18
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1">
                  Emergency Care & Organ Network
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <button 
                onClick={() => setUserRole(null)} 
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-950 text-rose-400 border border-slate-800"
              >
                Logout
              </button>
              <button 
                onClick={onEmergencyClick} 
                className="px-3 py-1 rounded-xl text-[11px] font-bold text-white bg-red-600 active:scale-95 transition-all"
              >
                SOS
              </button>
            </div>
          </div>

          {/* Navigation Scroll Dock */}
          <nav className="overflow-x-auto no-scrollbar flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 text-xs font-semibold shadow-inner w-full lg:w-auto">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`shrink-0 px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                activeTab === 'dispatch'
                  ? 'text-white bg-slate-800 shadow-md border border-slate-700/70'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <i className="fa-solid fa-tower-broadcast text-red-500"></i>
              <span>Live Grid</span>
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full font-mono">
                {activeDispatchesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('nearby')}
              className={`shrink-0 px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                activeTab === 'nearby'
                  ? 'text-white bg-slate-800 shadow-md border border-slate-700/70'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <i className="fa-solid fa-compass text-emerald-400"></i>
              <span>Nearby Hubs</span>
            </button>

            <button
              onClick={() => setActiveTab('ml-matching')}
              className={`shrink-0 px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                activeTab === 'ml-matching'
                  ? 'text-white bg-purple-900/60 shadow-md border border-purple-500/50 text-purple-200'
                  : 'text-purple-400 hover:text-purple-200 hover:bg-purple-950/40'
              }`}
            >
              <i className="fa-solid fa-brain text-purple-400"></i>
              <span>Scikit-Learn ML Matcher</span>
            </button>

            {(userRole.type === 'hospital') && (
              <button
                onClick={() => setActiveTab('hospital')}
                className={`shrink-0 px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'hospital'
                    ? 'text-white bg-slate-800 shadow-md border border-slate-700/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <i className="fa-solid fa-hospital text-red-400"></i>
                <span>Hospital Console</span>
              </button>
            )}

            {(userRole.type === 'patient') && (
              <button
                onClick={() => setActiveTab('patient')}
                className={`shrink-0 px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'patient'
                    ? 'text-amber-300 bg-amber-950/60 border border-amber-500/50'
                    : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/40'
                }`}
              >
                <i className="fa-solid fa-user-injured text-amber-400"></i>
                <span>Patient SOS</span>
              </button>
            )}

            {(userRole.type === 'donor' || userRole.type === 'hospital') && (
              <button
                onClick={() => setActiveTab('donor')}
                className={`shrink-0 px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'donor'
                    ? 'text-white bg-emerald-950/60 border border-emerald-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <i className="fa-solid fa-hand-holding-medical text-emerald-400"></i>
                <span>Donor Hub</span>
              </button>
            )}
          </nav>

          {/* Desktop User Badge & Emergency SOS */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-950/80 text-slate-200 border border-slate-800">
              <i className="fa-solid fa-circle-user text-blue-400 text-sm"></i>
              <span className="max-w-[150px] truncate">{userRole.name}</span>
              <button
                onClick={() => setUserRole(null)}
                className="ml-1 text-rose-400 hover:text-white text-[11px] font-bold bg-rose-950/60 hover:bg-rose-900/80 px-2.5 py-1 rounded-xl border border-rose-800/50 transition-all"
              >
                Logout
              </button>
            </div>

            <button
              onClick={onEmergencyClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-600/30 active:scale-95 transition-all shimmer-btn"
            >
              <i className="fa-solid fa-plus-circle"></i>
              <span>Emergency SOS</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
