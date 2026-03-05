import { supabase } from './supabase-client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

/**
 * URL du serveur Supabase Edge Functions
 */
export const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;

/**
 * Effectue une requête vers le serveur backend
 * 
 * @param route - Route du serveur (ex: '/health', '/kv/test')
 * @param options - Options fetch (method, body, etc.)
 * @param useAuth - Utilise le token d'authentification si disponible
 */
export async function callServer<T = any>(
  route: string,
  options: RequestInit = {},
  useAuth: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Si useAuth est true, ajoute le token d'accès
  if (useAuth) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    } else {
      throw new Error('Aucune session active - authentification requise');
    }
  } else {
    // Sinon, utilise la clé publique anon
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${serverUrl}${route}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Erreur serveur [${route}]:`, error);
    throw new Error(`Erreur serveur: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Vérifie si l'utilisateur est connecté
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Récupère l'utilisateur actuel
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Connexion avec email/password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }

  return data;
}

/**
 * Déconnexion
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Erreur de déconnexion:', error);
    throw error;
  }
}

/**
 * Inscription (création compte)
 * Note: Nécessite un endpoint serveur pour créer l'utilisateur
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const response = await callServer('/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      user_metadata: metadata,
    }),
  });

  return response;
}
