const API_BASE_URL = 'http://localhost:5000/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('lp_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`[API] Fetch failed for ${endpoint}:`, error.message);
    throw error;
  }
}

export async function evaluateMLMatch(donorBg, recipientBg, distanceKm, urgencyTier, transitMins) {
  return await apiRequest('/ml/match', {
    method: 'POST',
    body: JSON.stringify({
      donor_blood_group: donorBg,
      recipient_blood_group: recipientBg,
      distance_km: distanceKm,
      urgency_tier: urgencyTier,
      transit_time_mins: transitMins,
      donor_vitality_score: 88.0
    })
  });
}
