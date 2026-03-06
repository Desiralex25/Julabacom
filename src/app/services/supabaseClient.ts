/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — Client Supabase Singleton
 * ═══════════════════════════════════════════════════════════════════
 *
 * Instance unique partagée par toute l'application frontend.
 * Évite les "Multiple GoTrueClient instances" et permet la gestion
 * automatique du refresh de token par Supabase.
 *
 * Utilisation :
 *   import { supabase } from '../services/supabaseClient';
 *
 * Après un login via le serveur Hono :
 *   await supabase.auth.setSession({ access_token, refresh_token });
 *
 * Pour obtenir un token valide (auto-refresh si expiré) :
 *   const { data: { session } } = await supabase.auth.getSession();
 *   const token = session?.access_token;
 */

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    // Supabase gère le refresh automatique des tokens
    autoRefreshToken: true,
    persistSession: true,
    // Utiliser localStorage pour persister entre les rechargements de page
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'julaba_supabase_session',
    detectSessionInUrl: false,
  },
});
