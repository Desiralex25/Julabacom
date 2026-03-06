/**
 * API Client pour le Back-Office JÙLABA
 * Toutes les requêtes vers Supabase pour le BO
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '../app/services/supabaseClient';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const API_URL = `${SUPABASE_URL}/functions/v1/make-server-488793d3/backoffice`;

/**
 * Récupérer un token valide — plusieurs stratégies en cascade :
 * 1. Session Supabase active (source de vérité)
 * 2. Refresh automatique si session expirée
 * 3. Fallback sur les tokens localStorage (héritage BOLogin.persistSession)
 * 4. Erreur claire si aucun token disponible
 */
async function getValidToken(): Promise<string> {
  // 1. Session Supabase active
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
  } catch (e) {
    console.warn('[BO API] getValidToken: erreur getSession SDK', e);
  }

  // 2. Tokens localStorage (sauvegardés par BOLogin.persistSession)
  const localToken =
    localStorage.getItem('julaba_access_token') ||
    sessionStorage.getItem('julaba_access_token');
  const localRefresh =
    localStorage.getItem('julaba_refresh_token') ||
    sessionStorage.getItem('julaba_refresh_token');

  if (localRefresh) {
    // Tenter de restaurer la session Supabase avec le refresh_token
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: localToken || localRefresh,
        refresh_token: localRefresh,
      });
      if (!error && data.session?.access_token) {
        localStorage.setItem('julaba_access_token', data.session.access_token);
        if (data.session.refresh_token) {
          localStorage.setItem('julaba_refresh_token', data.session.refresh_token);
        }
        console.log('[BO API] Session restaurée depuis localStorage');
        return data.session.access_token;
      }
    } catch (e) {
      console.warn('[BO API] Impossible de restaurer la session:', e);
    }
  }

  // 3. Token brut localStorage en dernier recours
  if (localToken) {
    console.warn('[BO API] Utilisation token brut localStorage (peut être expiré)');
    return localToken;
  }

  throw new Error('AUCUNE_SESSION_BO');
}

/**
 * Forcer un refresh du token BO
 */
async function forceRefreshBO(): Promise<string | null> {
  // Essai 1 : refresh via SDK
  const { data, error } = await supabase.auth.refreshSession();
  if (!error && data.session?.access_token) {
    localStorage.setItem('julaba_access_token', data.session.access_token);
    if (data.session.refresh_token) {
      localStorage.setItem('julaba_refresh_token', data.session.refresh_token);
    }
    return data.session.access_token;
  }

  // Essai 2 : setSession avec refresh_token localStorage
  const refreshToken = localStorage.getItem('julaba_refresh_token') || sessionStorage.getItem('julaba_refresh_token');
  const accessToken  = localStorage.getItem('julaba_access_token')  || sessionStorage.getItem('julaba_access_token');
  if (refreshToken) {
    try {
      const { data: d2, error: e2 } = await supabase.auth.setSession({
        access_token: accessToken || refreshToken,
        refresh_token: refreshToken,
      });
      if (!e2 && d2.session?.access_token) {
        localStorage.setItem('julaba_access_token', d2.session.access_token);
        if (d2.session.refresh_token) {
          localStorage.setItem('julaba_refresh_token', d2.session.refresh_token);
        }
        return d2.session.access_token;
      }
    } catch { /* ignore */ }
  }

  console.warn('[BO API] forceRefreshBO: échec total du refresh');
  return null;
}

/**
 * Effectuer une requête API avec gestion automatique du refresh token
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token: string;
  try {
    token = await getValidToken();
  } catch (e: any) {
    console.error('[BO API] Impossible d\'obtenir un token BO:', e?.message);
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

  // Si 401 (token JWT invalide/expiré), forcer un refresh
  if (response.status === 401) {
    console.warn(`[BO API] 401 sur ${endpoint} — tentative de refresh JWT...`);
    const newToken = await forceRefreshBO();
    if (newToken) {
      response = await doFetch(newToken);
    } else {
      // Effacer les tokens corrompus
      localStorage.removeItem('julaba_access_token');
      localStorage.removeItem('julaba_refresh_token');
      localStorage.removeItem('julaba_bo_user');
      window.dispatchEvent(new CustomEvent('julaba:session-expired'));
      throw new Error('SESSION_EXPIRED');
    }
  }

  if (!response.ok) {
    let errorMessage = 'Erreur API';
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorBody.message || `Erreur HTTP ${response.status}`;
    } catch {
      errorMessage = `Erreur HTTP ${response.status}`;
    }
    console.error(`[BO API] Erreur ${response.status} sur ${endpoint}:`, errorMessage);
    throw new Error(errorMessage);
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTEURS
// ────────────────────────────────────────────────────────────────────────────

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