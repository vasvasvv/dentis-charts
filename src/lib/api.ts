// API Configuration
// Change this URL when deploying to a different environment

const API_URLS = {
  production: 'https://dentis-cards-api.nesterenkovasil9.workers.dev',
  development: 'http://localhost:8787', // wrangler dev
} as const;

// Auto-detect environment
const isDev = import.meta.env.DEV;

export const API_URL = isDev ? API_URLS.development : API_URLS.production;

// Helper for API calls
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Typed API methods
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiCall<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { email: string; password: string; fullName: string; roleId: number }) =>
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Patients
  getPatients: (token: string) =>
    apiCall<any[]>('/api/patients', {}, token),

  getPatient: (id: string, token: string) =>
    apiCall<any>(`/api/patients/${id}`, {}, token),

  createPatient: (data: any, token: string) =>
    apiCall('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updatePatient: (id: string, data: any, token: string) =>
    apiCall(`/api/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  deletePatient: (id: string, token: string) =>
    apiCall(`/api/patients/${id}`, { method: 'DELETE' }, token),

  // Teeth
  getTeeth: (patientId: string, token: string) =>
    apiCall<any[]>(`/api/patients/${patientId}/teeth`, {}, token),

  updateTooth: (patientId: string, data: any, token: string) =>
    apiCall(`/api/patients/${patientId}/teeth`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  // Visits
  getVisits: (patientId: string, token: string) =>
    apiCall<any[]>(`/api/patients/${patientId}/visits`, {}, token),

  createVisit: (patientId: string, data: any, token: string) =>
    apiCall(`/api/patients/${patientId}/visits`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  deleteVisit: (patientId: string, visitId: string, token: string) =>
    apiCall(`/api/patients/${patientId}/visits/${visitId}`, { method: 'DELETE' }, token),

  // Doctors
  getDoctors: (token: string) =>
    apiCall<any[]>('/api/doctors', {}, token),
};
