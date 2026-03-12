/**
 * API Client pour le Back-Office JULABA (Mode Local)
 * Version simplifiee sans backend
 */

// Mock response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helpers
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  const now = Math.floor(Date.now() / 1000);
  return !payload.exp || payload.exp > now + 30;
}

async function getValidToken(): Promise<string> {
  const storedToken = localStorage.getItem('julaba_access_token');
  if (isTokenValid(storedToken)) {
    return storedToken!;
  }
  throw new Error('Token non valide - mode local');
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  console.log('Mode local - API non disponible:', endpoint);
  return {
    success: false,
    error: 'Mode local - backend non disponible',
  };
}

// Authentification
export async function loginBackoffice(phone: string, password: string): Promise<ApiResponse> {
  return apiRequest('/auth/login-bo', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export async function logoutBackoffice(): Promise<void> {
  localStorage.removeItem('julaba_access_token');
  localStorage.removeItem('julaba_refresh_token');
  localStorage.removeItem('julaba_bo_user');
}

// Utilisateurs
export async function fetchUsers(): Promise<any> {
  console.log('Mode local - fetchUsers non disponible');
  return { users: [] };
}

export async function fetchUserById(userId: string): Promise<any> {
  console.log('Mode local - fetchUserById non disponible');
  return { user: null };
}

export async function updateUser(userId: string, updates: any): Promise<ApiResponse> {
  return apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteUser(userId: string): Promise<ApiResponse> {
  return apiRequest(`/users/${userId}`, {
    method: 'DELETE',
  });
}

// Dashboard & Stats
export async function fetchDashboardStats(): Promise<any> {
  console.log('Mode local - fetchDashboardStats non disponible');
  return { stats: null };
}

export async function fetchActivityLog(): Promise<any> {
  console.log('Mode local - fetchActivityLog non disponible');
  return { logs: [] };
}

// Zones
export async function fetchZones(): Promise<any> {
  console.log('Mode local - fetchZones non disponible');
  return { zones: [] };
}

export async function createZone(zone: any): Promise<ApiResponse> {
  return apiRequest('/zones', {
    method: 'POST',
    body: JSON.stringify(zone),
  });
}

export async function updateZone(zoneId: string, updates: any): Promise<ApiResponse> {
  return apiRequest(`/zones/${zoneId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteZone(zoneId: string): Promise<ApiResponse> {
  return apiRequest(`/zones/${zoneId}`, {
    method: 'DELETE',
  });
}

// Institutions
export async function fetchInstitutions(): Promise<any> {
  console.log('Mode local - fetchInstitutions non disponible');
  return { institutions: [] };
}

export async function createInstitution(institution: any): Promise<ApiResponse> {
  return apiRequest('/institutions', {
    method: 'POST',
    body: JSON.stringify(institution),
  });
}

export async function updateInstitution(institutionId: string, updates: any): Promise<ApiResponse> {
  return apiRequest(`/institutions/${institutionId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteInstitution(institutionId: string): Promise<ApiResponse> {
  return apiRequest(`/institutions/${institutionId}`, {
    method: 'DELETE',
  });
}

// Commissions
export async function fetchCommissions(): Promise<any> {
  console.log('Mode local - fetchCommissions non disponible');
  return { commissions: [] };
}

export async function updateCommission(commissionId: string, updates: any): Promise<ApiResponse> {
  return apiRequest(`/commissions/${commissionId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// Rapports
export async function generateReport(type: string, params: any): Promise<ApiResponse> {
  return apiRequest('/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ type, params }),
  });
}

export async function fetchReports(): Promise<any> {
  console.log('Mode local - fetchReports non disponible');
  return { reports: [] };
}

// Notifications
export async function sendNotification(notification: any): Promise<ApiResponse> {
  return apiRequest('/notifications/send', {
    method: 'POST',
    body: JSON.stringify(notification),
  });
}

export async function fetchNotifications(): Promise<any> {
  console.log('Mode local - fetchNotifications non disponible');
  return { notifications: [] };
}

// Support
export async function fetchTickets(): Promise<any> {
  console.log('Mode local - fetchTickets non disponible');
  return { tickets: [] };
}

export async function updateTicket(ticketId: string, updates: any): Promise<ApiResponse> {
  return apiRequest(`/support/tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// Academy
export async function fetchAcademyStats(): Promise<any> {
  console.log('Mode local - fetchAcademyStats non disponible');
  return { stats: null };
}

export async function fetchQuizResults(): Promise<any> {
  console.log('Mode local - fetchQuizResults non disponible');
  return { results: [] };
}