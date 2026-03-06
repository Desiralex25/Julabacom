/**
 * JULABA - Module d'authentification partage
 * 
 * Centralise la logique d'auth pour eviter les declarations
 * dupliquees de checkAuth dans chaque module.
 * 
 * IMPORTANT : Pour valider un JWT utilisateur, il faut utiliser le client
 * ANON KEY (pas service role). Le service role client est reservé aux
 * operations admin (createUser, deleteUser, etc.).
 */

import type { Context } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl       = Deno.env.get('SUPABASE_URL')              ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabaseAnonKey   = Deno.env.get('SUPABASE_ANON_KEY')          ?? '';

// Client admin : opérations DB + auth.admin.* (createUser, deleteUser...)
export const sharedSupabase = createClient(supabaseUrl, supabaseServiceKey);

// Client anon : UNIQUEMENT pour valider les JWTs utilisateurs via getUser(token)
// Le service role client peut retourner "Invalid JWT" sur certains setups Deno/Supabase
const supabaseUserValidator = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Valide un JWT utilisateur et retourne le profil complet
 * Utilise le client anon pour la validation JWT (comportement fiable)
 * Utilise le client service role pour la lecture DB (accès complet)
 */
async function validateUserJWT(accessToken: string): Promise<{ user: any; error?: string }> {
  // Log du préfixe du token pour diagnostic (jamais le token complet)
  const tokenPreview = accessToken ? `${accessToken.substring(0, 20)}...` : 'VIDE';
  console.log('[validateUserJWT] Validation token preview:', tokenPreview, '| longueur:', accessToken?.length);

  // Vérification basique du format JWT (3 parties séparées par des points)
  const parts = accessToken?.split('.');
  if (!accessToken || parts?.length !== 3) {
    console.log('[validateUserJWT] Format JWT invalide — parts:', parts?.length);
    return { user: null, error: 'Format JWT invalide' };
  }

  // Décodage du payload pour vérifier expiration AVANT appel réseau (optimisation)
  try {
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('[validateUserJWT] Token expiré — exp:', payload.exp, 'now:', now, 'delta:', now - payload.exp, 's');
      return { user: null, error: 'JWT expired' };
    }
    console.log('[validateUserJWT] Token non expiré — exp dans', payload.exp - now, 's | sub:', payload.sub?.substring(0, 8));
  } catch (e) {
    console.log('[validateUserJWT] Impossible de décoder le payload JWT:', e);
  }

  // Validation JWT via client anon (obligatoire pour éviter "Invalid JWT" avec service role)
  const { data: authData, error: authError } = await supabaseUserValidator.auth.getUser(accessToken);

  if (authError || !authData?.user) {
    const msg = authError?.message || 'Token JWT invalide';
    console.log('[validateUserJWT] Echec getUser (anon client):', msg);
    return { user: null, error: msg };
  }

  // Lecture profil via client service role (accès complet sans RLS)
  const { data: userProfile, error: profileError } = await sharedSupabase
    .from('users_julaba')
    .select('*')
    .eq('auth_user_id', authData.user.id)
    .single();

  if (profileError || !userProfile) {
    console.log('[validateUserJWT] Profil introuvable pour auth_user_id:', authData.user.id, profileError?.message);
    return { user: null, error: 'Profil introuvable' };
  }

  return { user: userProfile };
}

export async function checkAuth(c: Context) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) return { authorized: false as const, error: 'Token manquant' };

  const { user, error } = await validateUserJWT(accessToken);
  if (!user) return { authorized: false as const, error: error || 'Non autorise' };

  return { authorized: true as const, user };
}

// Export pour usage dans backoffice.ts
export { validateUserJWT };