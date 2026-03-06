/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — Client API Partagé avec Refresh Token Automatique
 * ═══════════════════════════════════════════════════════════════════
 *
 * Utilise le client Supabase singleton pour obtenir un token
 * toujours valide (refresh automatique intégré).
 *
 * Sur 401 :
 *  1. Appel supabase.auth.refreshSession() → nouveau token
 *  2. Si OK → relance la requête avec le nouveau token
 *  3. Si KO → émet 'julaba:session-expired' et lève SESSION_EXPIRED
 *
 * Si aucune session n'existe → lève NOT_AUTHENTICATED (silencieux)
 */

import { supabase } from '../app/services/supabaseClient';

// ─── Erreur spéciale : pas de session (pas loggué, pas d'erreur réseau) ────────
export const NOT_AUTHENTICATED = 'NOT_AUTHENTICATED';

// ─── Obtenir le token actuel (avec auto-refresh Supabase) ─────────────────────

/**
 * Retourne l'access token de la session active.
 * Supabase gère le refresh automatiquement si le token est proche de l'expiration.
 * Lance NOT_AUTHENTICATED si aucune session n'existe.
 */
async function getValidToken(): Promise<string> {
  // 1. Source de vérité : singleton Supabase (lit julaba_supabase_session dans localStorage)
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return session.access_token;
  }

  // 2. Fallback : tokens legacy (stockés manuellement lors du login)
  const legacyToken =
    sessionStorage.getItem('julaba_access_token') ||
    localStorage.getItem('julaba_access_token');

  if (legacyToken) {
    // Tenter de restaurer la session dans le singleton pour activer le refresh auto
    const refreshToken =
      sessionStorage.getItem('julaba_refresh_token') ||
      localStorage.getItem('julaba_refresh_token');
    if (refreshToken) {
      try {
        const { data: restored } = await supabase.auth.setSession({
          access_token: legacyToken,
          refresh_token: refreshToken,
        });
        if (restored.session?.access_token) {
          return restored.session.access_token;
        }
      } catch {
        // Ignorer les erreurs de restauration, utiliser le token brut
      }
    }
    return legacyToken;
  }

  // 3. Aucune session → l'utilisateur n'est pas connecté
  throw new Error(NOT_AUTHENTICATED);
}

// ─── Forcer un refresh via Supabase ──────────────────────────────────────────

async function forceRefresh(): Promise<string | null> {
  // Essai 1 : refresh via le singleton Supabase (préféré — utilise le refresh_token interne)
  const { data, error } = await supabase.auth.refreshSession();
  if (!error && data.session?.access_token) {
    return data.session.access_token;
  }

  // Essai 2 : restaurer la session avec les tokens legacy et laisser Supabase rafraîchir
  const refreshToken =
    sessionStorage.getItem('julaba_refresh_token') ||
    localStorage.getItem('julaba_refresh_token');
  const accessToken =
    sessionStorage.getItem('julaba_access_token') ||
    localStorage.getItem('julaba_access_token');

  if (!refreshToken) {
    console.warn('[API Client] Aucun refresh_token disponible');
    return null;
  }

  // setSession nécessite un access_token non vide (même expiré) + un refresh_token valide
  const { data: data2, error: error2 } = await supabase.auth.setSession({
    access_token: accessToken || refreshToken, // valeur non vide requise
    refresh_token: refreshToken,
  });

  if (!error2 && data2.session?.access_token) {
    // Mettre à jour les storages avec le nouveau token rafraîchi
    localStorage.setItem('julaba_access_token', data2.session.access_token);
    localStorage.setItem('julaba_refresh_token', data2.session.refresh_token);
    return data2.session.access_token;
  }

  console.warn('[API Client] Refresh échoué:', error2?.message || error?.message);
  return null;
}

// ─── Fonction principale ───────────────────────────────────────────────────────

export async function apiRequest<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const doFetch = (token: string) =>
    fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

  let token: string;
  try {
    token = await getValidToken();
  } catch (e: any) {
    if (e?.message === NOT_AUTHENTICATED) {
      // Pas de session active — pas loggué, c'est normal au démarrage de l'app
      throw new Error(NOT_AUTHENTICATED);
    }
    throw e;
  }

  let response = await doFetch(token);

  // Token expiré → tenter un refresh
  if (response.status === 401) {
    console.warn(`[API Client] 401 sur ${endpoint} - tentative de refresh…`);
    const newToken = await forceRefresh();

    if (newToken) {
      response = await doFetch(newToken);
    } else {
      // Impossible de renouveler → session expirée
      window.dispatchEvent(new CustomEvent('julaba:session-expired'));
      throw new Error('SESSION_EXPIRED');
    }
  }

  if (!response.ok) {
    let msg = `Erreur HTTP ${response.status}`;
    try {
      const body = await response.json();
      msg = body.error || body.message || msg;
    } catch { /* ignore */ }
    console.error(`[API Client] ${response.status} sur ${endpoint}: ${msg}`);
    throw new Error(msg);
  }

  return response.json() as Promise<T>;
}
