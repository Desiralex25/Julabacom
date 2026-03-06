/**
 * API Client pour le Back-Office JÙLABA
 * Toutes les requêtes vers Supabase pour le BO
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '../app/services/supabaseClient';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const API_URL = `${SUPABASE_URL}/functions/v1/make-server-488793d3/backoffice`;

/**
 * Vérifier si un JWT est expiré sans l'envoyer au serveur
 */
function isJWTExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp est en secondes Unix — on ajoute 60s de marge de sécurité
    return payload.exp < (Date.now() / 1000) + 60;
  } catch {
    return true; // Si on ne peut pas décoder → considérer expiré/corrompu
  }
}

/**
 * Récupérer un token valide garanti non-expiré
 * Stratégie renforcée : vérifie l'expiration AVANT d'envoyer au serveur
 */
async function getValidToken(): Promise<string> {
  // ── Étape 1 : Session Supabase SDK (source de vérité absolue) ────────────
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      if (!isJWTExpired(session.access_token)) {
        return session.access_token;
      }
      // Token proche d'expiration → refresh proactif
      console.log('[BO API] Token expirant, refresh proactif...');
      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
      if (!refreshErr && refreshed.session?.access_token) {
        localStorage.setItem('julaba_access_token', refreshed.session.access_token);
        if (refreshed.session.refresh_token) {
          localStorage.setItem('julaba_refresh_token', refreshed.session.refresh_token);
        }
        console.log('[BO API] Token rafraichi avec succes');
        return refreshed.session.access_token;
      }
    }
  } catch (e) {
    console.warn('[BO API] getValidToken: erreur getSession SDK', e);
  }

  // ── Étape 2 : Restaurer depuis refresh_token localStorage ────────────────
  const localToken =
    localStorage.getItem('julaba_access_token') ||
    sessionStorage.getItem('julaba_access_token');
  const localRefresh =
    localStorage.getItem('julaba_refresh_token') ||
    sessionStorage.getItem('julaba_refresh_token');

  if (localRefresh) {
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
        console.log('[BO API] Session restauree depuis refresh_token localStorage');
        return data.session.access_token;
      }
      // Refresh token invalide → nettoyer
      console.warn('[BO API] Refresh token invalide:', error?.message);
      localStorage.removeItem('julaba_access_token');
      localStorage.removeItem('julaba_refresh_token');
      sessionStorage.removeItem('julaba_access_token');
      sessionStorage.removeItem('julaba_refresh_token');
    } catch (e) {
      console.warn('[BO API] Impossible de restaurer la session:', e);
    }
  }

  // ── Étape 3 : Token brut uniquement si non expiré ────────────────────────
  if (localToken && !isJWTExpired(localToken)) {
    console.warn('[BO API] Utilisation token brut localStorage (valide)');
    return localToken;
  }

  if (localToken) {
    localStorage.removeItem('julaba_access_token');
    sessionStorage.removeItem('julaba_access_token');
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

  console.warn('[BO API] forceRefreshBO: echec total du refresh');
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