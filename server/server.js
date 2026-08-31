/**
 * =========================================================================
 * LIFE PULSE — EXPRESS.JS BACKEND REST API SERVER
 * =========================================================================
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// In-Memory Database Storage
let db = {
  users: [],
  dispatches: [
    {
      reference_id: 'LP-IN-9018',
      category: 'Blood',
      item_required: 'B- Blood',
      units: 2,
      urgency: 'Critical',
      hospital_name: 'AIIMS Apex Trauma Centre',
      doctor_name: 'Dr. A. K. Sharma (ER Chief)',
      sector_location: 'Ring Road, Safdarjung Enclave',
      latitude: 28.5672,
      longitude: 77.2100,
      geofence_radius_km: 5.0,
      is_verified: true,
      status: 'ACTIVE_DISPATCH',
      assigned_donor_id: null,
      prescription_data: null,
      submitted_by_patient: false,
      created_at: new Date().toISOString()
    },
    {
      reference_id: 'LP-IN-7842',
      category: 'Blood',
      item_required: 'O- Blood',
      units: 4,
      urgency: 'Critical',
      hospital_name: 'Yashoda Super Speciality Hospital',
      doctor_name: 'Dr. M. K. Gupta',
      sector_location: 'Nehru Nagar, Ghaziabad',
      latitude: 28.6692,
      longitude: 77.4538,
      geofence_radius_km: 10.0,
      is_verified: true,
      status: 'ACTIVE_DISPATCH',
      assigned_donor_id: null,
      prescription_data: null,
      submitted_by_patient: false,
      created_at: new Date().toISOString()
    }
  ]
};

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), activeDispatches: db.dispatches.length });
});

// Authentication APIs
app.post('/api/auth/hospital-login', (req, res) => {
  const { facilityName, email, password } = req.body;
  if (!facilityName || !email) {
    return res.status(400).json({ error: 'Facility and Email required' });
  }
  res.json({
    token: `jwt_hospital_${Date.now()}`,
    user: { name: facilityName, role: 'hospital', email }
  });
});

app.post('/api/auth/donor-register', (req, res) => {
  const { fullName, phone, email, bloodGroup } = req.body;
  const user = { id: `donor_${Date.now()}`, fullName, phone, email, bloodGroup, role: 'donor' };
  db.users.push(user);
  res.json({ token: `jwt_donor_${Date.now()}`, user });
});

app.post('/api/auth/patient-register', (req, res) => {
  const { fullName, phone, email, bloodGroup } = req.body;
  const user = { id: `patient_${Date.now()}`, fullName, phone, email, bloodGroup, role: 'patient' };
  db.users.push(user);
  res.json({ token: `jwt_patient_${Date.now()}`, user });
});

// Dispatches APIs
app.get('/api/dispatches/active', (req, res) => {
  const active = db.dispatches.filter(d => d.is_verified && d.status === 'ACTIVE_DISPATCH');
  res.json(active);
});

app.post('/api/requests/patient-sos', (req, res) => {
  const { category, itemType, hospitalName, doctorName, phone, prescriptionData, latitude, longitude } = req.body;
  const newDispatch = {
    reference_id: 'LP-IN-' + Math.floor(1000 + Math.random() * 9000),
    category: category || 'Blood',
    item_required: itemType || 'B+ Blood',
    units: 1,
    urgency: 'Critical',
    hospital_name: hospitalName || 'Regional Hospital',
    doctor_name: doctorName || 'Attending Physician',
    sector_location: 'Patient SOS Sector',
    latitude: latitude || 28.6139,
    longitude: longitude || 77.2090,
    geofence_radius_km: 10.0,
    is_verified: false,
    status: 'PENDING_HOSPITAL_VERIFICATION',
    assigned_donor_id: null,
    prescription_data: prescriptionData || null,
    submitted_by_patient: true,
    created_at: new Date().toISOString()
  };
  db.dispatches.unshift(newDispatch);
  res.json({ success: true, request: newDispatch });
});

app.patch('/api/requests/:ref/verify', (req, res) => {
  const { ref } = req.params;
  const { action } = req.body;
  const item = db.dispatches.find(d => d.reference_id === ref);
  if (!item) return res.status(404).json({ error: 'Request not found' });

  if (action === 'APPROVE') {
    item.is_verified = true;
    item.status = 'ACTIVE_DISPATCH';
  } else {
    item.is_verified = false;
    item.status = 'REJECTED';
  }
  res.json({ success: true, request: item });
});

app.post('/api/dispatches/:ref/respond', (req, res) => {
  const { ref } = req.params;
  const { donorName, phone, eta } = req.body;
  const item = db.dispatches.find(d => d.reference_id === ref);
  if (!item) return res.status(404).json({ error: 'Dispatch not found' });

  item.pendingDonor = { name: donorName, phone, eta, status: 'PENDING_APPROVAL' };
  res.json({ success: true, dispatch: item });
});

app.listen(PORT, () => {
  console.log(`[Life Pulse Server] Running on http://localhost:${PORT}`);
});
