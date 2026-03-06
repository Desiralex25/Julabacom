/**
 * API Client pour le Back-Office JÙLABA
 * Toutes les requêtes vers Supabase pour le BO
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '../app/services/supabaseClient';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const API_URL = `${SUPABASE_URL}/functions/v1/make-server-488793d3/backoffice`;

/**
 * Récupérer un token valide depuis la session SDK Supabase
 * La session est créée par signInWithPassword() dans BOLogin → gestion native du refresh
 */
async function getValidToken(): Promise<string> {
  // ── Source de vérité : session Supabase SDK ───────────────────────────────
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    // Synchroniser localStorage pour compatibilité
    localStorage.setItem('julaba_access_token', session.access_token);
    if (session.refresh_token) localStorage.setItem('julaba_refresh_token', session.refresh_token);
    return session.access_token;
  }

  // ── Tentative de refresh si session expirée ───────────────────────────────
  const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
  if (!refreshErr && refreshed.session?.access_token) {
    localStorage.setItem('julaba_access_token', refreshed.session.access_token);
    if (refreshed.session.refresh_token) localStorage.setItem('julaba_refresh_token', refreshed.session.refresh_token);
    console.log('[BO API] Session rafraichie avec succes');
    return refreshed.session.access_token;
  }

  // ── Aucune session disponible ─────────────────────────────────────────────
  console.warn('[BO API] Aucune session active — reconnexion requise');
  throw new Error('AUCUNE_SESSION_BO');
}

/**
 * Effectuer une requête API avec gestion automatique des erreurs
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token: string;
  try {
    token = await getValidToken();
  } catch (e: any) {
    console.error('[BO API] Pas de session BO valide:', e?.message);
    window.dispatchEvent(new CustomEvent('julaba:session-expired'));
    throw new Error('SESSION_EXPIRED');
  }

  const doFetch = async (authToken: string) =>
    fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers,
      },
    });

  let response = await doFetch(token);

  // 401 → tenter un refresh puis retry
  if (response.status === 401) {
    console.warn(`[BO API] 401 sur ${endpoint} — refresh et retry...`);
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed.session?.access_token) {
      localStorage.setItem('julaba_access_token', refreshed.session.access_token);
      response = await doFetch(refreshed.session.access_token);
    } else {
      await supabase.auth.signOut();
      localStorage.removeItem('julaba_bo_user');
      window.dispatchEvent(new CustomEvent('julaba:session-expired'));
      throw new Error('SESSION_EXPIRED');
    }
  }

  if (!response.ok) {
    let errorMessage = `Erreur HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorBody.message || errorMessage;
    } catch { /* ignore */ }
    console.error(`[BO API] Erreur ${response.status} sur ${endpoint}:`, errorMessage);
    throw new Error(errorMessage);
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTEURS
// ─────────────────────────────────────────────────────────��──────────────────

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

// ───────────────────────────────────────────────────────────────────────────
// TRANSACTIONS
// ───────────────────────────────────────────────────────────────────────────

export async function fetchTransactions() {
  return apiRequest<{ transactions: any[] }>('/transactions');
}

// ────────────────────────────────────────────────────────────────────────────
// ZONES
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchZones() {
  return apiRequest<{ zones: any[] }>('/zones');
}

export async function createZone(data: { nom: string; region: string; gestionnaire?: string }) {
  return apiRequest<{ success: boolean; zone: any }>('/zones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateZone(id: string, data: { nom?: string; region?: string; gestionnaire?: string }) {
  return apiRequest<{ success: boolean; zone: any }>(`/zones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
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

// ────────────────────────────────────────────────────────────────────────────
// AUDIT
// ────────────────────────────────────────────────────────────────────────────

export async function fetchAuditLogs() {
  return apiRequest<{ logs: any[] }>('/audit');
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILISATEURS BO
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchBOUsers() {
  return apiRequest<{ users: any[] }>('/users');
}

export async function createBOUser(data: { prenom: string; nom: string; email: string; password: string; role: string; region?: string }) {
  return apiRequest<{ success: boolean; user: any }>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBOUserActif(id: string, actif: boolean) {
  return apiRequest<{ success: boolean; actif: boolean }>(`/users/${id}/actif`, {
    method: 'PATCH',
    body: JSON.stringify({ actif }),
  });
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

// ─────────────────────────────────────────────────────────────────────────────
// MISSIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchMissions() {
  return apiRequest<{ missions: any[] }>('/missions');
}

export async function createMission(data: any) {
  return apiRequest<{ success: boolean; mission: any }>('/missions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMissionStatut(id: string, statut: string) {
  return apiRequest<{ success: boolean; mission: any }>(`/missions/${id}/statut`, {
    method: 'PATCH',
    body: JSON.stringify({ statut }),
  });
}

export async function createIdentificateur(data: { prenom: string; nom: string; telephone: string; cni?: string; region?: string; zoneId?: string; objectifMensuel?: string; institutionRattachee?: string }) {
  return apiRequest<{ success: boolean; user: any }>('/enrolement/identificateur', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}