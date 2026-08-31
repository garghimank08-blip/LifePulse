import React, { useState } from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  userRole,
  onLogout,
  activeDispatchesCount,
  onEmergencyClick,
  userCityName,
  onOpenLocationModal
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  if (!userRole) return null;

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Top App Bar (Visible on Mobile & Tablets < lg) */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 py-3 flex items-center justify-between lg:hidden">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => handleNavClick('dispatch')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-red-600/30">
            <i className="fa-solid fa-heart-pulse animate-heartbeat"></i>
          </div>
          <div>
            <span className="font-extrabold text-white text-base">Life Pulse</span>
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800 ml-1.5">
              REACT 18
            </span>
          </div>
        </div>

        {/* Animated Hamburger Button */}
        <button
          className={`hamburger-btn ${mobileDrawerOpen ? 'is-active' : ''}`}
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          aria-label="Toggle Mobile Menu"
        >
          <span className="hamburger-line line-1"></span>
          <span className="hamburger-line line-2"></span>
          <span className="hamburger-line line-3"></span>
        </button>
      </div>

      {/* Backdrop for Mobile Drawer */}
      <div
        className={`sidebar-backdrop ${mobileDrawerOpen ? 'active' : ''}`}
        onClick={() => setMobileDrawerOpen(false)}
      ></div>

      {/* Vertical <aside> Navigation Sidebar */}
      <aside className={`sidebar-aside w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0 z-40 overflow-y-auto ${
        mobileDrawerOpen ? 'drawer-open' : ''
      } hidden lg:flex`}>

        {/* Top Branding & User HUD */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div 
              className="flex items-center gap-3 cursor-pointer select-none" 
              onClick={() => handleNavClick('dispatch')}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-red-600/30">
                <i className="fa-solid fa-heart-pulse animate-heartbeat"></i>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-white tracking-tight">Life Pulse</span>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                    2.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Emergency Care Network</p>
              </div>
            </div>

            <button 
              onClick={() => setMobileDrawerOpen(false)} 
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          {/* User Role HUD Card */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                <i className="fa-solid fa-user-shield"></i>
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-extrabold text-white truncate max-w-[120px]">
                  {userRole.name}
                </div>
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  userRole.type === 'hospital' ? 'bg-red-950 text-red-400 border-red-800' :
                  userRole.type === 'donor' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                  'bg-amber-950 text-amber-400 border-amber-800'
                }`}>
                  {userRole.type}
                </span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="text-rose-400 hover:text-rose-200 text-xs font-bold p-1.5 rounded-lg hover:bg-rose-950/40 transition-colors"
              title="Logout"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>

          {/* Animated Vertical Navigation Buttons */}
          <nav className="space-y-1.5">
            <button
              onClick={() => handleNavClick('dispatch')}
              className={`nav-tab-btn w-full p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeTab === 'dispatch' ? 'is-active text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <i className="fa-solid fa-tower-broadcast text-red-500 text-sm w-5"></i>
                <span>Live Emergency Grid</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-red-950 text-red-400 border border-red-800">
                {activeDispatchesCount}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('nearby')}
              className={`nav-tab-btn w-full p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeTab === 'nearby' ? 'is-active text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <i className="fa-solid fa-compass text-emerald-400 text-sm w-5"></i>
                <span>Nearby Hospitals Radar</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </button>

            <button
              onClick={() => handleNavClick('ml-matching')}
              className={`nav-tab-btn w-full p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeTab === 'ml-matching' ? 'is-active text-purple-200' : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <i className="fa-solid fa-brain text-purple-400 text-sm w-5"></i>
                <span>Scikit-Learn ML Matcher</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-950 border border-purple-800 text-purple-300">
                AI
              </span>
            </button>

            <button
              onClick={() => handleNavClick('registration')}
              className={`nav-tab-btn w-full p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeTab === 'registration' ? 'is-active text-blue-200' : 'text-blue-300 hover:text-white hover:bg-blue-950/40'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <i className="fa-solid fa-address-card text-blue-400 text-sm w-5"></i>
                <span>New Registration Desk</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-950 border border-blue-800 text-blue-300">
                NEW
              </span>
            </button>

            {userRole.type === 'hospital' && (
              <button
                onClick={() => handleNavClick('hospital')}
                className={`nav-tab-btn w-full p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all ${
                  activeTab === 'hospital' ? 'is-active text-red-200' : 'text-red-300 hover:text-white hover:bg-red-950/40'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <i className="fa-solid fa-hospital-user text-red-400 text-sm w-5"></i>
                  <span>Hospital Command Desk</span>
                </span>
              </button>
            )}

            {(userRole.type === 'donor' || userRole.type === 'hospital') && (
              <button
                onClick={() => handleNavClick('donor')}
                className={`nav-tab-btn w-full p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all ${
                  activeTab === 'donor' ? 'is-active text-emerald-200' : 'text-emerald-300 hover:text-white hover:bg-emerald-950/40'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <i className="fa-solid fa-hand-holding-heart text-emerald-400 text-sm w-5"></i>
                  <span>Volunteer Donor Hub</span>
                </span>
              </button>
            )}

            {userRole.type === 'patient' && (
              <button
                onClick={() => handleNavClick('patient')}
                className={`nav-tab-btn w-full p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all ${
                  activeTab === 'patient' ? 'is-active text-amber-200' : 'text-amber-300 hover:text-white hover:bg-amber-950/40'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <i className="fa-solid fa-user-injured text-amber-400 text-sm w-5"></i>
                  <span>Patient SOS Lifeline</span>
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Bottom Action & Telemetry */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          {/* Live GPS Lock Pill */}
          <button
            onClick={onOpenLocationModal}
            className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-[11px] text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-1.5 truncate">
              <i className="fa-solid fa-location-crosshairs text-emerald-400"></i>
              <span className="truncate">{userCityName}</span>
            </span>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
          </button>

          {/* Hotline Quick Dial */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Emergency Hotline:</span>
            <a href="tel:112" className="font-bold text-red-400 hover:text-white flex items-center gap-1">
              <i className="fa-solid fa-phone text-[10px]"></i> 112 / 108
            </a>
          </div>

          {/* Trigger Emergency SOS Button */}
          <button
            onClick={onEmergencyClick}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 shimmer-btn flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-plus-circle"></i>
            <span>Trigger Emergency SOS</span>
          </button>
        </div>

      </aside>
    </>
  );
}
