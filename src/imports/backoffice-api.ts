/**
 * API Client pour le Back-Office JÙLABA
 * Toutes les requêtes vers Supabase pour le BO
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '../app/services/supabaseClient';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const API_URL = `${SUPABASE_URL}/functions/v1/make-server-488793d3/backoffice`;
const BASE_URL = `${SUPABASE_URL}/functions/v1/make-server-488793d3`;

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Décode le payload d'un JWT (sans vérification signature) */
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/** Vérifie si un token JWT est valide et non expiré */
function isTokenValid(token: string | null): boolean {
  if (!token || token === publicAnonKey) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  const now = Math.floor(Date.now() / 1000);
  // Considère valide si encore valide > 30 secondes
  return !payload.exp || payload.exp > now + 30;
}

/** Rafraîchit un token via le backend Julaba (appel direct REST Supabase côté serveur) */
async function refreshTokenViaBackend(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/token-refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem('julaba_access_token', data.accessToken);
      if (data.refreshToken) localStorage.setItem('julaba_refresh_token', data.refreshToken);
      // Mettre à jour aussi la session SDK (best effort)
      supabase.auth.setSession({ access_token: data.accessToken, refresh_token: data.refreshToken || refreshToken }).catch(() => {});
      console.log('[BO API] Token rafraichi via backend avec succes');
      return data.accessToken;
    }
  } catch (e) {
    console.warn('[BO API] Echec refresh via backend:', e);
  }
  return null;
}

/**
 * Récupérer un token valide — stratégie en 4 étapes :
 * 1. localStorage julaba_access_token (token exact du login, le plus fiable)
 * 2. SDK Supabase getSession() (si setSession() a réussi)
 * 3. Refresh via backend /auth/token-refresh (bypass SDK, appel REST direct)
 * 4. Refresh SDK natif (dernier recours)
 */
async function getValidToken(): Promise<string> {
  // ── Étape 1 : localStorage julaba_access_token (source la plus fiable) ────
  const storedToken = localStorage.getItem('julaba_access_token');
  if (isTokenValid(storedToken)) {
    return storedToken!;
  }

  // ── Étape 2 : session SDK Supabase (si setSession() a stocké quelque chose) ─
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && isTokenValid(session.access_token)) {
      // Synchroniser localStorage pour les prochains appels
      localStorage.setItem('julaba_access_token', session.access_token);
      if (session.refresh_token) localStorage.setItem('julaba_refresh_token', session.refresh_token);
      return session.access_token;
    }
  } catch (e) {
    console.warn('[BO API] getSession() erreur:', e);
  }

  // ── Étape 3 : Refresh via backend (plus fiable que SDK pour les Edge Functions) ─
  const storedRefresh = localStorage.getItem('julaba_refresh_token');
  if (storedRefresh) {
    const refreshed = await refreshTokenViaBackend(storedRefresh);
    if (refreshed) return refreshed;
  }

  // ── Étape 4 : Refresh SDK natif (dernier recours) ─────────────────────────
  try {
    const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
    if (!refreshErr && refreshed.session?.access_token) {
      localStorage.setItem('julaba_access_token', refreshed.session.access_token);
      if (refreshed.session.refresh_token) localStorage.setItem('julaba_refresh_token', refreshed.session.refresh_token);
      console.log('[BO API] Token rafraichi via SDK natif');
      return refreshed.session.access_token;
    }
  } catch (e) {
    console.warn('[BO API] Refresh SDK erreur:', e);
  }

  // ── Aucune session récupérable ────────────────────────────────────────────
  console.warn('[BO API] Aucune session BO valide — reconnexion requise');
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

  // 401 → invalider le token en cache, tenter un refresh robuste, puis retry
  if (response.status === 401) {
    console.warn(`[BO API] 401 sur ${endpoint} — invalidation cache et refresh...`);
    // Invalider le token en cache (il est clairement périmé ou invalide)
    localStorage.removeItem('julaba_access_token');

    // Refresh via backend (étape 3 de getValidToken)
    const storedRefresh = localStorage.getItem('julaba_refresh_token');
    let freshToken: string | null = null;
    if (storedRefresh) {
      freshToken = await refreshTokenViaBackend(storedRefresh);
    }
    // Fallback SDK
    if (!freshToken) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      if (refreshed.session?.access_token) {
        freshToken = refreshed.session.access_token;
        localStorage.setItem('julaba_access_token', freshToken);
        if (refreshed.session.refresh_token) localStorage.setItem('julaba_refresh_token', refreshed.session.refresh_token);
      }
    }
    if (freshToken) {
      response = await doFetch(freshToken);
    } else {
      await supabase.auth.signOut();
      localStorage.removeItem('julaba_bo_user');
      localStorage.removeItem('julaba_access_token');
      localStorage.removeItem('julaba_refresh_token');
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