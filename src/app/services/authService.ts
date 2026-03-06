/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — SERVICE D'AUTHENTIFICATION SUPABASE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Source unique de vérité : SDK Supabase (auto-refresh intégré).
 * Aucun stockage manuel de JWT.
 */

import { publicAnonKey, projectId } from '../../../utils/supabase/info';
import { supabase } from './supabaseClient';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;

export interface SignupData {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur' | 'consommateur';
  region?: string;
  commune?: string;
  activity?: string;
  market?: string;
  cooperativeName?: string;
  institutionName?: string;
}

export interface LoginData {
  phone: string;
  password: string;
}

export interface JulabaUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  region?: string;
  commune?: string;
  activity?: string;
  market?: string;
  cooperativeName?: string;
  institutionName?: string;
  score: number;
  validated: boolean;
  photoUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: JulabaUser;
  error?: string;
  message?: string;
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function signup(data: SignupData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Signup error:', result);
      return { success: false, error: result.error || "Erreur lors de l'inscription" };
    }

    return { success: true, user: result.user, message: result.message };
  } catch (error) {
    console.error('Signup network error:', error);
    return { success: false, error: 'Erreur de connexion au serveur' };
  }
}

/**
 * Connexion d'un utilisateur
 * Les tokens sont gérés par le SDK Supabase via setSession().
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Login error:', result);
      return { success: false, error: result.error || 'Identifiants incorrects' };
    }

    // Injecter la session dans le SDK Supabase (gère le refresh automatiquement)
    if (result.accessToken) {
      await supabase.auth.setSession({
        access_token: result.accessToken,
        refresh_token: result.refreshToken || '',
      });
    }

    return {
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  } catch (error) {
    console.error('Login network error:', error);
    return { success: false, error: 'Erreur de connexion au serveur' };
  }
}

/**
 * Déconnexion de l'utilisateur
 */
export async function logout(): Promise<AuthResponse> {
  try {
    await supabase.auth.signOut();
    return { success: true, message: 'Déconnexion réussie' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: true, message: 'Déconnexion réussie (locale)' };
  }
}

/**
 * Obtenir un token valide (avec auto-refresh via SDK Supabase)
 */
export async function getValidToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
  } catch (e) {
    console.warn('getValidToken: erreur SDK Supabase', e);
  }
  return null;
}

/**
 * Vérifier si l'utilisateur est connecté
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getValidToken();
  return !!token;
}
