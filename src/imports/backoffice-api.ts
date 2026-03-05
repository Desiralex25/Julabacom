/**
 * API Client pour le Back-Office JÙLABA
 * Toutes les requêtes vers Supabase pour le BO
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/backoffice`;

/**
 * Récupérer le token d'accès
 */
function getAccessToken(): string {
  return localStorage.getItem('julaba_access_token') || publicAnonKey;
}

/**
 * Effectuer une requête API
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur API');
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTEURS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchActeurs() {
  return apiRequest<{ acteurs: any[] }>('/acteurs');
}

export async function updateActeurStatut(id: string, statut: string, logAction?: string) {
  return apiRequest(`/acteurs/${id}/statut`, {
    method: 'PATCH',
    body: JSON.stringify({ statut, logAction }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DOSSIERS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchDossiers() {
  return apiRequest<{ dossiers: any[] }>('/dossiers');
}

export async function updateDossierStatut(id: string, statut: string, motif?: string) {
  return apiRequest(`/dossiers/${id}/statut`, {
    method: 'PATCH',
    body: JSON.stringify({ statut, motif }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchTransactions() {
  return apiRequest<{ transactions: any[] }>('/transactions');
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONES
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchZones() {
  return apiRequest<{ zones: any[] }>('/zones');
}

export async function updateZoneStatut(id: string, statut: string) {
  return apiRequest(`/zones/${id}/statut`, {
    method: 'PATCH',
    body: JSON.stringify({ statut }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMISSIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchCommissions() {
  return apiRequest<{ commissions: any[] }>('/commissions');
}

export async function updateCommissionStatut(id: string, statut: string) {
  return apiRequest(`/commissions/${id}/statut`, {
    method: 'PATCH',
    body: JSON.stringify({ statut }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAuditLogs() {
  return apiRequest<{ logs: any[] }>('/audit');
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILISATEURS BO
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchBOUsers() {
  return apiRequest<{ users: any[] }>('/users');
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTITUTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchInstitutions() {
  return apiRequest<{ institutions: any[] }>('/institutions');
}

export async function createInstitution(data: any) {
  return apiRequest('/institutions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInstitutionModules(id: string, modules: any) {
  return apiRequest(`/institutions/${id}/modules`, {
    method: 'PATCH',
    body: JSON.stringify({ modules }),
  });
}

export async function updateInstitutionStatut(id: string, statut: string) {
  return apiRequest(`/institutions/${id}/statut`, {
    method: 'PATCH',
    body: JSON.stringify({ statut }),
  });
}

export async function deleteInstitution(id: string) {
  return apiRequest(`/institutions/${id}`, {
    method: 'DELETE',
  });
}
