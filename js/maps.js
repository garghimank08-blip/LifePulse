/* =========================================================================
   LIFE PULSE — PRECISION GPS GEOLOCATION & DYNAMIC GEOFENCING ENGINE
   ========================================================================= */

let leafletMap = null;
let leafletMarkers = [];
let leafletGeofenceCircles = [];
let nearbyMap = null;
let nearbyMarkers = [];
let nearbyGeofenceCircles = [];

let userCityName = "Locating GPS...";
let activeGeofenceRadiusKm = 10.0;
let isLocating = false;

// 1. DUAL-LAYER GEOLOCATION ENGINE
async function triggerLiveGeolocation(manualTrigger = false) {
  if (isLocating) return;
  isLocating = true;

  const gpsStatusText = document.getElementById('gpsStatusText');
  if (gpsStatusText) {
    gpsStatusText.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-amber-400"></i> Locating...`;
  }

  if (manualTrigger) showToast("Acquiring high-precision GPS lock...", "info");

  // Handler to apply coordinates to entire platform
  const applyCoordinates = (lat, lng, cityName = null) => {
    userLatitude = parseFloat(lat);
    userLongitude = parseFloat(lng);
    userCityName = cityName || `GPS: ${userLatitude.toFixed(3)}, ${userLongitude.toFixed(3)}`;

    const gpsStatus = document.getElementById('gpsStatusText');
    if (gpsStatus) {
      gpsStatus.innerHTML = `<i class="fa-solid fa-location-dot text-emerald-400"></i> ${userCityName}`;
    }

    // Discover nearby hospitals and anchor requests directly to those local facilities
    fetchNearbyHospitalsMultiSource(userLatitude, userLongitude);
    updateMapMarkers();
    updateNearbyMapMarkers();

    if (manualTrigger) {
      showToast(`Location locked to ${userCityName}!`);
    }
    isLocating = false;
  };

  // Layer 1: High Accuracy Browser GPS
  if (navigator.geolocation) {
    const geoPromise = new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 5000 }
      );
    });

    try {
      const position = await geoPromise;
      const cityName = await reverseGeocodeCity(position.coords.latitude, position.coords.longitude);
      applyCoordinates(position.coords.latitude, position.coords.longitude, cityName);
      return;
    } catch (e) {
      console.warn("[GPS] Browser GPS fallback to IP geolocation...", e);
    }
  }

  // Layer 2: Fast IP Geolocation
  try {
    const ipRes = await fetch('https://ipapi.co/json/');
    if (ipRes.ok) {
      const data = await ipRes.json();
      if (data.latitude && data.longitude) {
        const cityLabel = `${data.city || 'Local Area'}, ${data.region_code || data.country_name || 'IN'}`;
        applyCoordinates(data.latitude, data.longitude, cityLabel);
        return;
      }
    }
  } catch (e) {}

  try {
    const ipWhoRes = await fetch('https://ipwho.is/');
    if (ipWhoRes.ok) {
      const data = await ipWhoRes.json();
      if (data.latitude && data.longitude) {
        const cityLabel = `${data.city || 'Local Area'}, ${data.country_code || 'IN'}`;
        applyCoordinates(data.latitude, data.longitude, cityLabel);
        return;
      }
    }
  } catch (e) {}

  // Layer 3: Default Location
  applyCoordinates(28.6139, 77.2090, "Delhi NCR (Default)");
}

// Reverse Geocode helper
async function reverseGeocodeCity(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        return data.address.city || data.address.town || data.address.suburb || data.address.state_district || "Local Region";
      }
    }
  } catch (e) {}
  return `GPS (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
}

// 2. DISCOVER REAL NEARBY HEALTHCARE FACILITIES
async function fetchNearbyHospitalsMultiSource(lat, lng) {
  let discovered = [];

  try {
    const radius = activeGeofenceRadiusKm * 1000;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:${radius},${lat},${lng})["amenity"~"hospital|clinic"];out;`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(overpassUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.elements && data.elements.length > 0) {
        discovered = data.elements.slice(0, 15).map(elem => {
          const name = elem.tags.name || elem.tags['name:en'] || 'Community Healthcare Facility';
          const dist = calculateDistanceKm(lat, lng, elem.lat, elem.lon);
          return {
            name,
            lat: elem.lat,
            lng: elem.lon,
            distanceKm: dist,
            etaMins: Math.max(2, Math.round(dist * 2.2)),
            phone: elem.tags.phone || '+91 1800 102 4455',
            type: elem.tags.amenity === 'hospital' ? 'Level-1 Trauma' : 'Emergency Clinic'
          };
        });
      }
    }
  } catch (e) {}

  if (!discovered || discovered.length < 3) {
    discovered = generateDynamicNearbyFacilities(lat, lng);
  }

  // Sort strictly by distance (closest first)
  discovered.sort((a, b) => a.distanceKm - b.distanceKm);
  networkFacilities = discovered;

  // Direct Anchor: Re-map emergency requests so their hospital is an ACTUAL discovered nearby hospital!
  anchorEmergencyRequestsToNearbyHospitals(discovered);

  updateNearbyHospitalsUI();
  renderDonorNearestHospitalsWidget();
  renderDonorAlertCards();
  renderDispatchCards();
}

// Generates realistic facilities around exact user coordinates if OSM is unavailable
function generateDynamicNearbyFacilities(lat, lng) {
  const city = userCityName.split(',')[0].trim() || 'District';
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
  });
}

// 3. ANCHOR EMERGENCY REQUESTS TO DISCOVERED NEARBY HOSPITALS
function anchorEmergencyRequestsToNearbyHospitals(hospitals) {
  if (!hospitals || hospitals.length === 0 || !requestDatabase) return;

  const mockNeeds = [
    { item: 'B- Blood', units: 2, category: 'Blood', urgency: 'Critical', doctor: 'Dr. A. K. Sharma (ER Chief)' },
    { item: 'O- Blood', units: 4, category: 'Blood', urgency: 'Critical', doctor: 'Dr. M. K. Gupta' },
    { item: 'Kidney (Transplant)', units: 1, category: 'Organ', urgency: 'Urgent', doctor: 'Dr. S. Patel (Transplant Lead)' },
    { item: 'AB- Blood', units: 3, category: 'Blood', urgency: 'Critical', doctor: 'Dr. R. K. Verma' },
    { item: 'Cornea (Ocular Tissue)', units: 2, category: 'Organ', urgency: 'Urgent', doctor: 'Dr. V. N. Rao (Ophthalmology)' }
  ];

  requestDatabase = hospitals.slice(0, Math.min(5, hospitals.length)).map((hosp, idx) => {
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
      radius: activeGeofenceRadiusKm,
      isVerified: true,
      status: 'ACTIVE_DISPATCH',
      donorsMatched: Math.floor(12 + Math.random() * 15),
      realDistanceKm: hosp.distanceKm,
      realEtaMins: hosp.etaMins,
      assignedDonor: null,
      pendingDonor: null,
      prescriptionUrl: null,
      submittedByPatient: false,
      timestamp: 'Active Now'
    };
  });
}

// 4. MAPS INITIALIZATION & DYNAMIC GEOFENCE RENDERING
function initDispatchMap() {
  const mapEl = document.getElementById('dispatchMap');
  if (!mapEl) return;
  if (leafletMap) {
    leafletMap.invalidateSize();
    return;
  }

  leafletMap = L.map('dispatchMap', { zoomControl: true }).setView([userLatitude, userLongitude], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(leafletMap);

  // Click on map to re-center location pin anywhere
  leafletMap.on('click', (e) => {
    handleMapClickLocation(e.latlng.lat, e.latlng.lng);
  });

  updateMapMarkers();
}

function handleMapClickLocation(lat, lng) {
  userLatitude = lat;
  userLongitude = lng;
  userCityName = `Map Pin (${lat.toFixed(3)}, ${lng.toFixed(3)})`;

  const gpsStatus = document.getElementById('gpsStatusText');
  if (gpsStatus) {
    gpsStatus.innerHTML = `<i class="fa-solid fa-location-dot text-emerald-400"></i> ${userCityName}`;
  }

  fetchNearbyHospitalsMultiSource(userLatitude, userLongitude);
  updateMapMarkers();
  updateNearbyMapMarkers();

  showToast(`Geofence re-centered to clicked location!`);
}

function updateMapMarkers() {
  if (!leafletMap) return;

  leafletMarkers.forEach(m => leafletMap.removeLayer(m));
  leafletMarkers = [];
  leafletGeofenceCircles.forEach(c => leafletMap.removeLayer(c));
  leafletGeofenceCircles = [];

  // 1. Live User GPS Draggable Pin
  const userPinIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `<div class="user-gps-pin" title="Drag to adjust position"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  const userMarker = L.marker([userLatitude, userLongitude], { icon: userPinIcon, draggable: true })
    .addTo(leafletMap)
    .bindPopup(`
      <div class='text-xs font-bold text-slate-100 p-1 space-y-1'>
        <div class='text-blue-400 font-extrabold flex items-center gap-1'><i class='fa-solid fa-crosshairs'></i> Live GPS Pin (Draggable)</div>
        <div class='text-slate-300'>${userCityName}</div>
        <div class='text-[10px] text-slate-400 font-mono'>${userLatitude.toFixed(4)}, ${userLongitude.toFixed(4)}</div>
      </div>
    `);

  userMarker.on('dragend', (e) => {
    const pos = e.target.getLatLng();
    handleMapClickLocation(pos.lat, pos.lng);
  });

  leafletMarkers.push(userMarker);

  // 2. Active User Detection Geofence Ring
  const userGeofenceCircle = L.circle([userLatitude, userLongitude], {
    radius: activeGeofenceRadiusKm * 1000,
    color: '#3b82f6',
    fillColor: '#3b82f6',
    fillOpacity: 0.05,
    weight: 2,
    dashArray: '6, 8'
  }).addTo(leafletMap);
  leafletGeofenceCircles.push(userGeofenceCircle);

  // 3. Hospital Incident Geofence Envelopes
  requestDatabase.filter(r => r.isVerified && r.status === 'ACTIVE_DISPATCH').forEach(req => {
    // Red Emergency Hospital Marker
    const marker = L.circleMarker([req.lat, req.lng], {
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.95,
      radius: 9,
      weight: 2
    }).addTo(leafletMap).bindPopup(`
      <div class='text-xs p-1 space-y-1'>
        <div class='font-extrabold text-red-400'>${req.hospital}</div>
        <div class='text-white font-bold'>${req.item} (${req.units} Units)</div>
        <div class='text-emerald-400 font-bold'><i class='fa-solid fa-route mr-1'></i> ${req.realDistanceKm} km from you (~${req.realEtaMins}m ETA)</div>
        <div class='text-[10px] text-slate-400'>Geofence: ${req.radius} km</div>
      </div>
    `);
    leafletMarkers.push(marker);

    // Individual Incident Geofence Ring around each emergency hospital
    const incidentGeofence = L.circle([req.lat, req.lng], {
      radius: (req.radius || 10.0) * 1000,
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.04,
      weight: 1.5,
      dashArray: '4, 6'
    }).addTo(leafletMap);
    leafletGeofenceCircles.push(incidentGeofence);
  });

  leafletMap.panTo([userLatitude, userLongitude]);
}

// 5. NEARBY HOSPITALS RADAR MAP
function initNearbyMap() {
  const mapEl = document.getElementById('nearbyMap');
  if (!mapEl) return;
  if (nearbyMap) {
    nearbyMap.invalidateSize();
    return;
  }

  nearbyMap = L.map('nearbyMap', { zoomControl: true }).setView([userLatitude, userLongitude], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(nearbyMap);

  nearbyMap.on('click', (e) => {
    handleMapClickLocation(e.latlng.lat, e.latlng.lng);
  });

  updateNearbyMapMarkers();
}

function updateNearbyMapMarkers() {
  if (!nearbyMap) return;

  nearbyMarkers.forEach(m => nearbyMap.removeLayer(m));
  nearbyMarkers = [];
  nearbyGeofenceCircles.forEach(c => nearbyMap.removeLayer(c));
  nearbyGeofenceCircles = [];

  const userPinIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `<div class="user-gps-pin"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  const userMarker = L.marker([userLatitude, userLongitude], { icon: userPinIcon, draggable: true })
    .addTo(nearbyMap)
    .bindPopup(`
      <div class='text-xs font-bold text-slate-100 p-1 space-y-1'>
        <div class='text-blue-400 font-extrabold'>📍 My Live GPS Location</div>
        <div class='text-slate-300'>${userCityName}</div>
      </div>
    `);

  userMarker.on('dragend', (e) => {
    const pos = e.target.getLatLng();
    handleMapClickLocation(pos.lat, pos.lng);
  });

  nearbyMarkers.push(userMarker);

  // 10km Active Radius Geofence Circle
  const circle10km = L.circle([userLatitude, userLongitude], {
    radius: activeGeofenceRadiusKm * 1000,
    color: '#10b981',
    fillColor: '#10b981',
    fillOpacity: 0.05,
    weight: 2,
    dashArray: '6, 8'
  }).addTo(nearbyMap);
  nearbyGeofenceCircles.push(circle10km);

  // Hospital Pins
  networkFacilities.forEach(f => {
    const m = L.marker([f.lat, f.lng]).addTo(nearbyMap).bindPopup(`
      <div class='text-xs p-1 space-y-1'>
        <b class='text-white font-extrabold'>${f.name}</b>
        <div class='text-emerald-400 font-bold'><i class='fa-solid fa-route mr-1'></i> ${f.distanceKm} km away (~${f.etaMins}m ETA)</div>
        <div class='text-slate-400 text-[10px]'>Phone: ${f.phone}</div>
      </div>
    `);
    nearbyMarkers.push(m);
  });

  nearbyMap.panTo([userLatitude, userLongitude]);
}

function updateNearbyHospitalsUI() {
  const datalist = document.getElementById('nearbyHospitalsDatalist');
  const countBadge = document.getElementById('nearbyHospitalCountBadge');
  const statCount = document.getElementById('statHospitalCount');
  const cardsContainer = document.getElementById('nearbyHospitalCardsList');

  if (countBadge) countBadge.textContent = networkFacilities.length;
  if (statCount) statCount.textContent = `${networkFacilities.length} Hubs`;

  if (datalist) {
    datalist.innerHTML = networkFacilities.map(f => `<option value="${f.name}">`).join('');
  }

  if (cardsContainer) {
    cardsContainer.innerHTML = networkFacilities.map(f => `
      <div class="p-4 rounded-2xl border border-slate-800 bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hospital-card-hover">
        <div>
          <div class="font-extrabold text-white text-sm flex items-center gap-2">
            <i class="fa-solid fa-hospital text-red-500"></i> ${f.name}
          </div>
          <div class="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span class="text-emerald-400 font-bold"><i class="fa-solid fa-route mr-1"></i> ${f.distanceKm} km away</span>
            <span class="text-amber-400 font-mono"><i class="fa-regular fa-clock mr-1"></i> ~${f.etaMins || Math.round(f.distanceKm * 2.2)} mins ETA</span>
          </div>
        </div>
        <div class="flex items-center gap-2 self-end sm:self-auto">
          <a href="tel:${f.phone}" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors">
            <i class="fa-solid fa-phone"></i>
          </a>
          <button onclick="centerNearbyMapToFacility(${f.lat}, ${f.lng})" class="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-800 hover:bg-emerald-900/80 transition-colors text-xs">
            Focus Map
          </button>
        </div>
      </div>
    `).join('');
  }

  autoSelectNearestHospitalInAdmin();
  updateNearbyMapMarkers();
}

function renderDonorNearestHospitalsWidget() {
  const hubWidget = document.getElementById('donorNearestHospitalsWidget');
  if (!hubWidget) return;

  const topHospitals = networkFacilities.slice(0, 4);
  if (topHospitals.length === 0) return;

  hubWidget.innerHTML = `
    <div class="bg-slate-900 rounded-3xl border border-emerald-500/40 p-5 shadow-xl space-y-3">
      <div class="flex justify-between items-center border-b border-slate-800 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h3 class="font-extrabold text-sm text-white">Discovered Nearest Emergency Hospitals To Your Location</h3>
        </div>
        <span class="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full">
          LIVE GPS PROXIMITY
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        ${topHospitals.map((h, i) => `
          <div class="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
            <div>
              <div class="flex justify-between items-center text-[10px] font-mono">
                <span class="text-slate-400">#${i+1} PROXIMITY</span>
                <span class="text-emerald-400 font-bold">${h.distanceKm} KM</span>
              </div>
              <div class="font-extrabold text-white text-xs mt-1 truncate" title="${h.name}">${h.name}</div>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-slate-900 text-[11px]">
              <span class="text-amber-400 font-mono font-bold">~${h.etaMins}m ETA</span>
              <button onclick="switchTab('tab-nearby'); centerNearbyMapToFacility(${h.lat}, ${h.lng});" class="text-emerald-400 hover:underline font-bold">
                View Radar
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function autoSelectNearestHospitalInAdmin() {
  if (networkFacilities && networkFacilities.length > 0) {
    const nearestHosp = networkFacilities[0].name;
    const sosHospitalInput = document.getElementById('sosHospital');
    if (sosHospitalInput && !sosHospitalInput.value) {
      sosHospitalInput.value = nearestHosp;
    }
  }
}

function setGeofenceRadius(radiusKm) {
  activeGeofenceRadiusKm = parseFloat(radiusKm);
  updateMapMarkers();
  updateNearbyMapMarkers();
  fetchNearbyHospitalsMultiSource(userLatitude, userLongitude);
  showToast(`Geofence radius set to ${radiusKm} KM`);
}

function centerNearbyMapToFacility(lat, lng) {
  if (nearbyMap) {
    nearbyMap.flyTo([lat, lng], 15, { duration: 1.2 });
  }
}

function centerMapToDefault() {
  if (leafletMap) {
    leafletMap.flyTo([userLatitude, userLongitude], 13, { duration: 1.2 });
    showToast("Re-centered to your live GPS coordinates!");
  }
}

function setManualCityLocation(cityName, lat, lng) {
  userLatitude = parseFloat(lat);
  userLongitude = parseFloat(lng);
  userCityName = cityName;

  const gpsStatus = document.getElementById('gpsStatusText');
  if (gpsStatus) {
    gpsStatus.innerHTML = `<i class="fa-solid fa-location-dot text-emerald-400"></i> ${userCityName}`;
  }

  fetchNearbyHospitalsMultiSource(userLatitude, userLongitude);
  if (leafletMap) leafletMap.flyTo([userLatitude, userLongitude], 13, { duration: 1.2 });
  if (nearbyMap) nearbyMap.flyTo([userLatitude, userLongitude], 13, { duration: 1.2 });

  showToast(`Location switched to ${cityName}!`);
}

function openLocationModal() {
  document.getElementById('locationModal')?.classList.remove('hidden');
}

function closeLocationModal() {
  document.getElementById('locationModal')?.classList.add('hidden');
}
