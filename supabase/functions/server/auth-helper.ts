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
  // Validation JWT via client anon (obligatoire pour éviter "Invalid JWT")
  const { data: authData, error: authError } = await supabaseUserValidator.auth.getUser(accessToken);

  if (authError || !authData?.user) {
    const msg = authError?.message || 'Token JWT invalide';
    console.log('[validateUserJWT] Echec validation JWT (anon client):', msg);
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