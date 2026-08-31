import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export default function RadarMap({ dispatches, userLocation, userCityName, nearbyFacilities, onCenterGPS, onSelectCity, onMapClickLocation }) {
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);
  const markersRef = useRef([]);
  const circlesRef = useRef([]);
  const [geofenceRadiusKm, setGeofenceRadiusKm] = useState(10);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      leafletInstance.current = L.map(mapRef.current, { zoomControl: true }).setView([userLocation.lat, userLocation.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletInstance.current);

      leafletInstance.current.on('click', (e) => {
        if (onMapClickLocation) {
          onMapClickLocation(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    const map = leafletInstance.current;

    // Clear existing layers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    circlesRef.current.forEach(c => map.removeLayer(c));
    circlesRef.current = [];

    // 1. User Live Draggable Pin
    const userPin = L.divIcon({
      className: 'custom-user-icon',
      html: `<div class="user-gps-pin" title="Drag to adjust position"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userPin, draggable: true })
      .addTo(map)
      .bindPopup(`
        <div class='text-xs font-bold text-slate-100 p-1 space-y-1'>
          <div class='text-blue-400 font-extrabold flex items-center gap-1'>📍 My Current Location (Draggable)</div>
          <div class='text-slate-300'>${userCityName || 'Live GPS Location'}</div>
          <div class='text-[10px] text-slate-400 font-mono'>${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</div>
        </div>
      `);

    userMarker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      if (onMapClickLocation) onMapClickLocation(pos.lat, pos.lng);
    });

    markersRef.current.push(userMarker);

    // 2. User Detection Geofence Ring
    const userGeofenceCircle = L.circle([userLocation.lat, userLocation.lng], {
      radius: geofenceRadiusKm * 1000,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.05,
      weight: 2,
      dashArray: '6, 8'
    }).addTo(map);
    circlesRef.current.push(userGeofenceCircle);

    // 3. Nearby facilities markers
    nearbyFacilities.forEach(f => {
      const m = L.marker([f.lat, f.lng]).addTo(map).bindPopup(`
        <div class='text-xs p-1 space-y-1'>
          <b class='text-white font-extrabold'>${f.name}</b>
          <div class='text-emerald-400 font-bold'><i class='fa-solid fa-route mr-1'></i> ${f.distanceKm} km away (~${f.etaMins || Math.round(f.distanceKm * 2.2)}m ETA)</div>
          <div class='text-slate-400 text-[10px]'>Phone: ${f.phone || '+91 1800 102 4455'}</div>
        </div>
      `);
      markersRef.current.push(m);
    });

    // 4. Verified emergency dispatches markers & incident geofences
    dispatches.filter(r => r.isVerified && r.status === 'ACTIVE_DISPATCH').forEach(req => {
      const circle = L.circleMarker([req.lat, req.lng], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.95,
        radius: 9,
        weight: 2
      }).addTo(map).bindPopup(`
        <div class='text-xs p-1 space-y-1'>
          <div class='font-extrabold text-red-400'>${req.hospital}</div>
          <div class='text-white font-bold'>${req.item} (${req.units} Units)</div>
          <div class='text-emerald-400 font-bold'><i class='fa-solid fa-route mr-1'></i> ${req.distanceKm || 2.4} km away</div>
          <div class='text-[10px] text-slate-400'>Geofence: ${req.radius || 10} km</div>
        </div>
      `);
      markersRef.current.push(circle);

      // Draw incident emergency geofence
      const incidentCircle = L.circle([req.lat, req.lng], {
        radius: (req.radius || 10) * 1000,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.04,
        weight: 1.5,
        dashArray: '4, 6'
      }).addTo(map);
      circlesRef.current.push(incidentCircle);
    });

    map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.2 });

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

  }, [dispatches, userLocation, nearbyFacilities, userCityName, geofenceRadiusKm, onMapClickLocation]);

  const quickCities = [
    { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
    { name: 'Ghaziabad, UP', lat: 28.6692, lng: 77.4538 },
    { name: 'Noida, UP', lat: 28.5355, lng: 77.3910 },
    { name: 'Mumbai, MH', lat: 19.0760, lng: 72.8777 },
    { name: 'Bengaluru, KA', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad, TS', lat: 17.3850, lng: 78.4867 },
    { name: 'Kolkata, WB', lat: 22.5726, lng: 88.3639 },
    { name: 'Chennai, TN', lat: 13.0827, lng: 80.2707 },
    { name: 'Pune, MH', lat: 18.5204, lng: 73.8567 },
    { name: 'Jaipur, RJ', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow, UP', lat: 26.8467, lng: 80.9462 },
    { name: 'Dehradun, UK', lat: 30.3165, lng: 78.0322 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 py-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Live GPS Discovery Radar</span>
            <span className="text-[11px] font-bold bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 text-slate-300">
              <i className="fa-solid fa-location-dot text-emerald-400 mr-1"></i> {userCityName}
            </span>
          </div>
          <h2 className="font-extrabold text-2xl text-white mt-1">Healthcare Centers & Active Geofences</h2>
          <p className="text-xs text-slate-400">Drag your pin or click anywhere on the map to anchor geofences to your exact location.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all"
          >
            <i className="fa-solid fa-city text-blue-400"></i> Change City
          </button>

          <button
            onClick={onCenterGPS}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
          >
            <i className="fa-solid fa-crosshairs animate-pulse"></i> Auto-Detect GPS
          </button>
        </div>
      </div>

      {/* Quick City Selector Drawer */}
      {showLocationPicker && (
        <div className="bg-slate-900 rounded-3xl border border-blue-500/40 p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <i className="fa-solid fa-map-location-dot text-blue-400"></i> Quick Select City / Region
            </h3>
            <button onClick={() => setShowLocationPicker(false)} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
            {quickCities.map(c => (
              <button
                key={c.name}
                onClick={() => {
                  onSelectCity(c);
                  setShowLocationPicker(false);
                }}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-left hover:border-emerald-500/50 transition-all truncate"
              >
                📍 {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
        <div ref={mapRef} className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner"></div>

        {/* Geofence Radius Slider / Buttons */}
        <div className="flex flex-wrap items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <i className="fa-solid fa-radar text-emerald-400 text-sm"></i>
            <span>Geofence Detection Radius:</span>
            <span className="font-mono text-emerald-400 text-sm font-extrabold">{geofenceRadiusKm} KM</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[5, 10, 20, 50].map(r => (
              <button
                key={r}
                onClick={() => setGeofenceRadiusKm(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  geofenceRadiusKm === r
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white inline-block"></span> 📍 My Live Pin (Draggable)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Healthcare Hub</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Emergency Hospital ({geofenceRadiusKm}km Geofence)</span>
          </div>
          <span className="font-semibold text-emerald-400">💡 Click anywhere on map to set location</span>
        </div>
      </div>

      {/* Nearby Facilities List Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <i className="fa-solid fa-hospital text-emerald-400"></i> Discovered Healthcare Centers ({nearbyFacilities.length})
          </h3>
          <span className="text-xs font-mono font-bold text-slate-400">Calculated from your live pin</span>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {nearbyFacilities.map((f, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 shadow-sm flex justify-between items-center text-xs">
              <div>
                <div className="font-extrabold text-white text-sm">{f.name}</div>
                <div className="flex items-center gap-3 text-slate-400 mt-1">
                  <span className="text-emerald-400 font-bold"><i className="fa-solid fa-route mr-1"></i> {f.distanceKm} km away</span>
                  <span className="text-amber-400 font-mono"><i className="fa-regular fa-clock mr-1"></i> ~{f.etaMins || Math.round(f.distanceKm * 2.2)}m ETA</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (leafletInstance.current) {
                    leafletInstance.current.flyTo([f.lat, f.lng], 15, { duration: 1.2 });
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-800 hover:bg-emerald-900/80 transition-colors"
              >
                Focus Map
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
