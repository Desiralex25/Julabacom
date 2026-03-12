/**
 * Helpers pour faciliter les appels au serveur Supabase
 */

import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;

/**
 * Effectue un appel au serveur Supabase
 * @param route - Route à appeler (ex: '/auth/me')
 * @param options - Options fetch (method, body, etc.)
 * @returns Promise avec la réponse JSON
 */
export async function callServer(
  route: string,
  options: RequestInit = {}
): Promise<any> {
  const token = sessionStorage.getItem('julaba_access_token') || 
                localStorage.getItem('julaba_access_token') || 
                publicAnonKey;

  const response = await fetch(`${API_BASE_URL}${route}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Connexion utilisateur
 */
export async function signIn(phone: string, password: string): Promise<{ user: any; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${errorText}`);
  }

  const data = await response.json();
  
  // Stocker le token
  if (data.token) {
    sessionStorage.setItem('julaba_access_token', data.token);
    localStorage.setItem('julaba_access_token', data.token);
  }

  return data;
}

/**
 * Déconnexion utilisateur
 */
export async function signOut(): Promise<void> {
  sessionStorage.removeItem('julaba_access_token');
  sessionStorage.removeItem('julaba_user_id');
  sessionStorage.removeItem('julaba_refresh_token');
  localStorage.removeItem('julaba_access_token');
  localStorage.removeItem('julaba_refresh_token');
  localStorage.removeItem('julaba_user_id');
  localStorage.removeItem('julaba_bo_user');
  localStorage.removeItem('julaba_user_data');
  localStorage.removeItem('julaba_user');
}

/**
 * Récupérer l'utilisateur actuel
 */
export async function getCurrentUser(): Promise<any> {
  const token = sessionStorage.getItem('julaba_access_token') || 
                localStorage.getItem('julaba_access_token');

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Vérifier la connexion au serveur
 */
export async function checkServerConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
