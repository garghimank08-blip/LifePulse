import React, { useState } from 'react';
import PatientForm from './components/PatientForm';
import HospitalDesk from './components/HospitalDesk';
import DonorFeed from './components/DonorFeed';
import H2HExchange from './components/H2HExchange';

export default function App() {
  const [activeTab, setActiveTab] = useState('patient');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-600/40">
              ♥
            </div>
            <span className="font-bold text-xl tracking-tight text-white">LifePulse</span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'patient', label: 'Patient Request' },
              { id: 'hospital', label: 'Hospital Desk' },
              { id: 'donor', label: 'Donor Live Feed' },
              { id: 'h2h', label: 'H2H Exchange' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-red-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'patient' && <PatientForm />}
        {activeTab === 'hospital' && <HospitalDesk />}
        {activeTab === 'donor' && <DonorFeed />}
        {activeTab === 'h2h' && <H2HExchange />}
      </main>
    </div>
  );
}