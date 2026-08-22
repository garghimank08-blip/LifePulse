import React, { useState } from 'react';
import PatientForm from './components/PatientForm';
import HospitalDesk from './components/HospitalDesk';
import DonorFeed from './components/DonorFeed';
import H2HExchange from './components/H2HExchange';

export default function App() {
  const [activeTab, setActiveTab] = useState('hospital');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white font-extrabold px-3 py-1 rounded-lg text-lg tracking-wide">
              LifePulse
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              v2.0 • Emergency & Organ Network
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'patient', label: '1. Patient Request' },
              { id: 'hospital', label: '2. ER Control Desk' },
              { id: 'donor', label: '3. Donor SOS Feed' },
              { id: 'h2h', label: '4. Inter-Hospital (H2H)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main View Port */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {activeTab === 'patient' && <PatientForm />}
        {activeTab === 'hospital' && <HospitalDesk />}
        {activeTab === 'donor' && <DonorFeed />}
        {activeTab === 'h2h' && <H2HExchange />}
      </main>
    </div>
  );
}