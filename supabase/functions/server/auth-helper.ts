/**
 * JULABA - Module d'authentification partage
 * 
 * Centralise la logique d'auth pour eviter les declarations
 * dupliquees de checkAuth dans chaque module.
 */

import type { Context } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

export const sharedSupabase = createClient(supabaseUrl, supabaseServiceKey);

export async function checkAuth(c: Context) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) return { authorized: false as const, error: 'Token manquant' };

  const { data: authUser, error: authError } = await sharedSupabase.auth.getUser(accessToken);
  if (authError || !authUser?.user) return { authorized: false as const, error: 'Non autorise' };

  const { data: userProfile, error: profileError } = await sharedSupabase
    .from('users_julaba')
    .select('*')
    .eq('auth_user_id', authUser.user.id)
    .single();

  if (profileError || !userProfile) return { authorized: false as const, error: 'Profil introuvable' };
  return { authorized: true as const, user: userProfile };
}
