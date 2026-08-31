/* =========================================================================
   LIFE PULSE — APP CONFIGURATION & DATABASE STATE
   ========================================================================= */

const API_BASE_URL = 'http://localhost:5000/api';
let isBackendConnected = false;
let authToken = null;

let currentRoleType = null;
let currentLoggedInHospital = 'AIIMS Apex Trauma Centre';
let selectedAcceptRef = null;
let patientPrescriptionData = null;

let userLatitude = 28.6139;
let userLongitude = 77.2090;
let networkFacilities = [];

// Persistent Registered Database Storage
let donorDatabase = JSON.parse(localStorage.getItem('lp_donors') || '[]');
let patientDatabase = JSON.parse(localStorage.getItem('lp_patients') || '[]');

// Helper to normalize phone
function getCleanPhone(p) {
  if (!p) return '';
  return String(p).replace(/[\s\-\(\)\+]/g, '').trim();
}

// Track registered credentials to prevent duplicate phone numbers
let registeredPhones = new Set([
  '919876543210', '919810023456', '919811122334', '9876543210', '9810023456', '9811122334',
  ...donorDatabase.map(d => getCleanPhone(d.phone)),
  ...patientDatabase.map(p => getCleanPhone(p.phone))
]);

let registeredEmails = new Set([
  'er.dispatch@aiims.edu.in',
  'er.unit@yashodahospital.org',
  'transplant.dept@maxhealthcare.in',
  'emergency@fortishealth.com',
  'trauma.dispatch@aiims.edu.in',
  'eye.bank@aiims.edu.in',
  ...donorDatabase.map(d => (d.email || '').trim().toLowerCase()).filter(Boolean),
  ...patientDatabase.map(p => (p.email || '').trim().toLowerCase()).filter(Boolean)
]);

// Initial Database State with Mock Dispatches
let requestDatabase = [
  {
    ref: 'LP-IN-9018',
    category: 'Blood',
    item: 'B- Blood',
    units: 2,
    urgency: 'Critical',
    hospital: 'AIIMS Apex Trauma Centre',
    doctor: 'Dr. A. K. Sharma (ER Chief)',
    email: 'trauma.dispatch@aiims.edu.in',
    sector: 'Ring Road, Safdarjung Enclave',
    lat: 28.5672,
    lng: 77.2100,
    radius: 5.0,
    isVerified: true,
    status: 'ACTIVE_DISPATCH',
    donorsMatched: 18,
    assignedDonor: null,
    pendingDonor: {
      name: 'Rohan Sharma',
      phone: '+91 98100 23456',
      eta: '15-20 Mins',
      status: 'PENDING_APPROVAL'
    },
    prescriptionUrl: null,
    submittedByPatient: false,
    timestamp: '07:45 PM IST'
  },
  {
    ref: 'LP-IN-7842',
    category: 'Blood',
    item: 'O- Blood',
    units: 4,
    urgency: 'Critical',
    hospital: 'Yashoda Super Speciality Hospital',
    doctor: 'Dr. M. K. Gupta',
    email: 'er.unit@yashodahospital.org',
    sector: 'Nehru Nagar, Ghaziabad',
    lat: 28.6692,
    lng: 77.4538,
    radius: 10.0,
    isVerified: true,
    status: 'ACTIVE_DISPATCH',
    donorsMatched: 24,
    assignedDonor: null,
    pendingDonor: null,
    prescriptionUrl: null,
    submittedByPatient: false,
    timestamp: '06:15 PM IST'
  },
  {
    ref: 'LP-IN-3401',
    category: 'Organ',
    item: 'Kidney (Transplant)',
    units: 1,
    urgency: 'Urgent',
    hospital: 'Max Super Speciality Hospital',
    doctor: 'Dr. S. Patel (Transplant Lead)',
    email: 'transplant.dept@maxhealthcare.in',
    sector: 'Vaishali Sector 1, Ghaziabad',
    lat: 28.6418,
    lng: 77.3374,
    radius: 20.0,
    isVerified: true,
    status: 'ACTIVE_DISPATCH',
    donorsMatched: 6,
    assignedDonor: null,
    pendingDonor: null,
    prescriptionUrl: null,
    submittedByPatient: false,
    timestamp: '05:00 PM IST'
  },
  {
    ref: 'LP-IN-5210',
    category: 'Organ',
    item: 'Cornea (Ocular Tissue)',
    units: 2,
    urgency: 'Urgent',
    hospital: 'AIIMS Apex Trauma Centre',
    doctor: 'Dr. V. N. Rao (Ophthalmology)',
    email: 'eye.bank@aiims.edu.in',
    sector: 'Safdarjung Enclave',
    lat: 28.5685,
    lng: 77.2115,
    radius: 15.0,
    isVerified: true,
    status: 'ACTIVE_DISPATCH',
    donorsMatched: 9,
    assignedDonor: null,
    pendingDonor: null,
    prescriptionUrl: null,
    submittedByPatient: false,
    timestamp: '04:20 PM IST'
  },
  {
    ref: 'LP-IN-1102',
    category: 'Blood',
    item: 'AB- Blood',
    units: 3,
    urgency: 'Critical',
    hospital: 'Fortis Hospital Noida',
    doctor: 'Dr. R. K. Verma',
    email: 'emergency@fortishealth.com',
    sector: 'Sector 62, Noida, Uttar Pradesh',
    lat: 28.6212,
    lng: 77.3639,
    radius: 10.0,
    isVerified: false,
    status: 'PENDING_HOSPITAL_VERIFICATION',
    donorsMatched: 12,
    assignedDonor: null,
    pendingDonor: null,
    prescriptionUrl: 'https://placehold.co/600x800/1e293b/ffffff?text=Doctor+Prescription+Doc+#8831',
    submittedByPatient: true,
    timestamp: '08:10 PM IST'
  }
];
