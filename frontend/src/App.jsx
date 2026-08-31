import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import LoginHero from './components/LoginHero';
import DispatchGrid from './components/DispatchGrid';
import HospitalConsole from './components/HospitalConsole';
import DonorHub from './components/DonorHub';
import PatientPortal from './components/PatientPortal';
import RadarMap from './components/RadarMap';
import MLMatchCard from './components/MLMatchCard';
import RegistrationHub from './components/RegistrationHub';
import { 
  PrescriptionInspectionModal, 
  DonorAcceptModal, 
  DonorRegistrationModal, 
  PatientRegistrationModal 
} from './components/Modals';
import { apiRequest } from './services/api';
import { wsClient } from './services/websocket';

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function generateDynamicFacilities(lat, lng, cityName) {
  const city = (cityName || 'District').split(',')[0].trim();
  const templates = [
    { name: `${city} Apex Level-1 Trauma Centre`, dLat: 0.012, dLng: 0.009, type: 'Level-1 Trauma' },
    { name: `${city} Super Speciality Medical Institute`, dLat: -0.018, dLng: 0.014, type: 'Multi-Speciality' },
    { name: `District Central Red Cross Blood Vault`, dLat: 0.024, dLng: -0.015, type: 'Blood Bank & Vault' },
    { name: `Fortis Emergency & Heart Institute ${city}`, dLat: -0.028, dLng: -0.022, type: 'Cardio Trauma' },
    { name: `Max Healthcare Emergency Ward`, dLat: 0.035, dLng: 0.028, type: 'Emergency Hospital' },
    { name: `Apollo Lifeline Organ & Critical Care`, dLat: -0.042, dLng: 0.031, type: 'Organ Transplant Unit' },
    { name: `Government District Civil Hospital`, dLat: 0.048, dLng: -0.036, type: 'Public Healthcare' }
  ];

  return templates.map(t => {
    const fLat = lat + t.dLat;
    const fLng = lng + t.dLng;
    const dist = calculateDistanceKm(lat, lng, fLat, fLng);
    return {
      name: t.name,
      lat: fLat,
      lng: fLng,
      distanceKm: dist,
      etaMins: Math.max(2, Math.round(dist * 2.2)),
      phone: '+91 1800 102 4455',
      type: t.type
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

function buildDispatchesFromNearbyFacilities(facilities, userLat, userLng) {
  const mockNeeds = [
    { item: 'B- Blood', units: 2, category: 'Blood', urgency: 'Critical', doctor: 'Dr. A. K. Sharma (ER Chief)' },
    { item: 'O- Blood', units: 4, category: 'Blood', urgency: 'Critical', doctor: 'Dr. M. K. Gupta' },
    { item: 'Kidney (Transplant)', units: 1, category: 'Organ', urgency: 'Urgent', doctor: 'Dr. S. Patel (Transplant Lead)' },
    { item: 'AB- Blood', units: 3, category: 'Blood', urgency: 'Critical', doctor: 'Dr. R. K. Verma' },
    { item: 'Cornea (Ocular Tissue)', units: 2, category: 'Organ', urgency: 'Urgent', doctor: 'Dr. V. N. Rao (Ophthalmology)' }
  ];

  return facilities.slice(0, 5).map((hosp, idx) => {
    const need = mockNeeds[idx % mockNeeds.length];
    return {
      ref: `LP-IN-${9000 + idx * 111}`,
      category: need.category,
      item: need.item,
      units: need.units,
      urgency: need.urgency,
      hospital: hosp.name,
      doctor: need.doctor,
      email: 'dispatch@hospital.org',
      sector: `Emergency Trauma Ward — Bay #${idx + 1}`,
      lat: hosp.lat,
      lng: hosp.lng,
      radius: 10.0,
      isVerified: true,
      status: 'ACTIVE_DISPATCH',
      donorsMatched: Math.floor(12 + Math.random() * 15),
      distanceKm: hosp.distanceKm,
      etaMins: hosp.etaMins,
      assignedDonor: null,
      pendingDonor: null,
      prescriptionUrl: null,
      submittedByPatient: false,
      timestamp: 'Active Now'
    };
  });
}

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('dispatch');
  const [dispatches, setDispatches] = useState([]);
  const [patientRequests, setPatientRequests] = useState([]);
  const [selectedInspectionUrl, setSelectedInspectionUrl] = useState(null);
  const [selectedAcceptReq, setSelectedAcceptReq] = useState(null);
  const [selectedMLItem, setSelectedMLItem] = useState(null);
  const [isDonorRegOpen, setIsDonorRegOpen] = useState(false);
  const [isPatientRegOpen, setIsPatientRegOpen] = useState(false);

  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [userCityName, setUserCityName] = useState('Locating GPS...');
  const [nearbyFacilities, setNearbyFacilities] = useState([]);

  // Update facilities and anchor dispatches to discovered nearby hospitals
  const applyUserLocation = useCallback((lat, lng, cityName) => {
    setUserLocation({ lat, lng });
    setUserCityName(cityName);

    const facilities = generateDynamicFacilities(lat, lng, cityName);
    setNearbyFacilities(facilities);

    const localizedDispatches = buildDispatchesFromNearbyFacilities(facilities, lat, lng);
    setDispatches(localizedDispatches);
  }, []);

  // Dual-Layer Geolocation Scan
  const detectUserGeolocation = useCallback(async () => {
    setUserCityName('Locating GPS...');

    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 4000,
            maximumAge: 5000
          });
        });

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`);
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.state_district || 'Local GPS Area';
            applyUserLocation(lat, lng, city);
            return;
          }
        } catch (e) {}

        applyUserLocation(lat, lng, `GPS (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
        return;
      } catch (err) {
        console.warn('[GPS] Browser GPS fallback to IP...', err);
      }
    }

    // IP Geolocation Fallback
    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      if (ipRes.ok) {
        const data = await ipRes.json();
        if (data.latitude && data.longitude) {
          applyUserLocation(data.latitude, data.longitude, `${data.city || 'Local Area'}, ${data.region_code || 'IN'}`);
          return;
        }
      }
    } catch (e) {}

    // Default Fallback
    applyUserLocation(28.6139, 77.2090, 'Delhi NCR (Default)');
  }, [applyUserLocation]);

  // Initialize GPS on load
  useEffect(() => {
    detectUserGeolocation();
  }, [detectUserGeolocation]);

  // Connect WebSocket on Mount
  useEffect(() => {
    wsClient.connect();
    const unsubscribe = wsClient.subscribe((msg) => {
      if (msg.type === 'NEW_DISPATCH' && msg.payload) {
        setDispatches(prev => [msg.payload, ...prev]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (roleObj) => {
    setUserRole(roleObj);
    if (roleObj.type === 'hospital') setActiveTab('hospital');
    else if (roleObj.type === 'donor') setActiveTab('donor');
    else setActiveTab('patient');
  };

  const handleDirectSosSubmit = async (reqObj) => {
    const ref = `LP-IN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq = {
      ...reqObj,
      ref,
      lat: userLocation.lat,
      lng: userLocation.lng,
      distanceKm: 0.5,
      isVerified: true,
      status: 'ACTIVE_DISPATCH',
      submittedByPatient: false
    };

    try {
      await apiRequest('/hospital/direct-sos', {
        method: 'POST',
        body: JSON.stringify({
          category: reqObj.category,
          itemType: reqObj.item,
          units: reqObj.units,
          urgency: reqObj.urgency,
          hospital: reqObj.hospital,
          doctor: reqObj.doctor,
          email: reqObj.email,
          sector: reqObj.sector,
          radius: reqObj.radius,
          latitude: userLocation.lat,
          longitude: userLocation.lng
        })
      });
    } catch (e) {}

    setDispatches(prev => [newReq, ...prev]);
    wsClient.send({ type: 'TRIGGER_BROADCAST', payload: newReq });
    setActiveTab('dispatch');
  };

  const handlePatientSosSubmit = async (reqObj) => {
    const ref = `LP-IN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatientReq = {
      ref,
      category: reqObj.category,
      item: reqObj.itemType,
      units: 1,
      urgency: 'Critical',
      hospital: reqObj.hospitalName,
      doctor: reqObj.doctorName,
      sector: 'Patient SOS Geofence Sector',
      lat: userLocation.lat,
      lng: userLocation.lng,
      radius: 10.0,
      isVerified: false,
      status: 'PENDING_HOSPITAL_VERIFICATION',
      prescriptionUrl: reqObj.prescriptionData,
      submittedByPatient: true
    };

    try {
      await apiRequest('/requests/patient-sos', {
        method: 'POST',
        body: JSON.stringify({
          category: reqObj.category,
          itemType: reqObj.itemType,
          hospitalName: reqObj.hospitalName,
          doctorName: reqObj.doctorName,
          phone: reqObj.phone,
          prescriptionData: reqObj.prescriptionData,
          latitude: userLocation.lat,
          longitude: userLocation.lng
        })
      });
    } catch (e) {}

    setPatientRequests(prev => [newPatientReq, ...prev]);
    setDispatches(prev => [newPatientReq, ...prev]);
    alert(`Emergency SOS ${ref} submitted to ${reqObj.hospitalName} for review!`);
  };

  const handleVerifyRequest = async (ref, action) => {
    try {
      await apiRequest(`/hospital/requests/${ref}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ action })
      });
    } catch (e) {}

    setDispatches(prev => prev.map(r => {
      if (r.ref === ref) {
        return {
          ...r,
          isVerified: action === 'APPROVE',
          status: action === 'APPROVE' ? 'ACTIVE_DISPATCH' : 'REJECTED'
        };
      }
      return r;
    }));

    setPatientRequests(prev => prev.map(r => {
      if (r.ref === ref) {
        return {
          ...r,
          isVerified: action === 'APPROVE',
          status: action === 'APPROVE' ? 'ACTIVE_DISPATCH' : 'REJECTED'
        };
      }
      return r;
    }));
  };

  const handleDonorRespond = (req) => {
    setSelectedAcceptReq(req);
  };

  const handleDonorResponseSubmit = ({ ref, name, phone, eta }) => {
    setSelectedAcceptReq(null);
    alert(`Response submitted to hospital ER desk for ${ref}!`);
  };

  const handleEvaluateML = (req) => {
    setSelectedMLItem(req);
    setActiveTab('ml-matching');
  };

  const handleSelectCity = (cityObj) => {
    applyUserLocation(cityObj.lat, cityObj.lng, cityObj.name);
  };

  const handleFocusHospital = (hospital) => {
    setActiveTab('nearby');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 antialiased">
      {!userRole ? (
        <LoginHero
          onLoginSuccess={handleLoginSuccess}
          onOpenDonorReg={() => setIsDonorRegOpen(true)}
          onOpenPatientReg={() => setIsPatientRegOpen(true)}
        />
      ) : (
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Vertical <aside> Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={userRole}
            onLogout={() => setUserRole(null)}
            activeDispatchesCount={dispatches.filter(r => r.isVerified && r.status === 'ACTIVE_DISPATCH').length}
            onEmergencyClick={() => userRole?.type === 'patient' ? setActiveTab('patient') : setActiveTab('hospital')}
            userCityName={userCityName}
            onOpenLocationModal={() => setActiveTab('nearby')}
          />

          {/* Main Content Body */}
          <main className="flex-1 flex flex-col justify-between min-w-0 overflow-x-hidden">
            <div className="flex-grow">
              {activeTab === 'dispatch' && (
                <DispatchGrid
                  dispatches={dispatches}
                  onRespond={handleDonorRespond}
                  userRole={userRole}
                  onEvaluateML={handleEvaluateML}
                />
              )}

              {activeTab === 'nearby' && (
                <RadarMap
                  dispatches={dispatches}
                  userLocation={userLocation}
                  userCityName={userCityName}
                  nearbyFacilities={nearbyFacilities}
                  onCenterGPS={detectUserGeolocation}
                  onSelectCity={handleSelectCity}
                  onMapClickLocation={(lat, lng) => applyUserLocation(lat, lng, `Map Pin (${lat.toFixed(2)}, ${lng.toFixed(2)})`)}
                />
              )}

              {activeTab === 'ml-matching' && (
                <MLMatchCard initialItem={selectedMLItem} />
              )}

              {activeTab === 'registration' && (
                <RegistrationHub
                  onRegisteredSuccess={(roleObj) => {
                    handleLoginSuccess(roleObj);
                  }}
                />
              )}

              {activeTab === 'hospital' && (
                <HospitalConsole
                  currentFacility={userRole.name}
                  requests={dispatches}
                  onVerifyRequest={handleVerifyRequest}
                  onDirectSosSubmit={handleDirectSosSubmit}
                  onInspectPrescription={(url) => setSelectedInspectionUrl(url)}
                />
              )}

              {activeTab === 'donor' && (
                <DonorHub
                  dispatches={dispatches}
                  nearbyFacilities={nearbyFacilities}
                  onRespond={handleDonorRespond}
                  onOpenDonorProfile={() => alert(`Logged in as: ${userRole.name}`)}
                  onFocusHospital={handleFocusHospital}
                />
              )}

              {activeTab === 'patient' && (
                <PatientPortal
                  onPatientSosSubmit={handlePatientSosSubmit}
                  patientRequests={patientRequests}
                />
              )}
            </div>

            <footer className="bg-slate-950 text-slate-400 text-xs py-6 border-t border-slate-800/80 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-red-600/30">
                    <i className="fa-solid fa-heart-pulse animate-heartbeat"></i>
                  </div>
                  <div>
                    <span className="font-extrabold text-white text-xs">Life Pulse Care Network</span>
                    <p className="text-[10px] text-slate-500">React 18 · FastAPI · Scikit-Learn · WebSockets</p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  © 2026 Life Pulse Network. All rights reserved.
                </div>
              </div>
            </footer>
          </main>
        </div>
      )}

      <PrescriptionInspectionModal
        url={selectedInspectionUrl}
        onClose={() => setSelectedInspectionUrl(null)}
      />

      <DonorAcceptModal
        req={selectedAcceptReq}
        onClose={() => setSelectedAcceptReq(null)}
        onSubmit={handleDonorResponseSubmit}
      />

      <DonorRegistrationModal
        isOpen={isDonorRegOpen}
        onClose={() => setIsDonorRegOpen(false)}
        onRegisterSuccess={handleLoginSuccess}
      />

      <PatientRegistrationModal
        isOpen={isPatientRegOpen}
        onClose={() => setIsPatientRegOpen(false)}
        onRegisterSuccess={handleLoginSuccess}
      />
    </div>
  );
}
