/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — SERVICE D'AUTHENTIFICATION SUPABASE
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Service pour gérer l'authentification avec Supabase Backend.
 * Remplace les mock users par de vraies données Supabase.
 * 
 * MIGRATION PROGRESSIVE - SEMAINE 1
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';

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
      return {
        success: false,
        error: result.error || 'Erreur lors de l\'inscription',
      };
    }

    return {
      success: true,
      user: result.user,
      message: result.message,
    };
  } catch (error) {
    console.error('Signup network error:', error);
    return {
      success: false,
      error: 'Erreur de connexion au serveur',
    };
  }
}

/**
 * Connexion d'un utilisateur
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
      return {
        success: false,
        error: result.error || 'Identifiants incorrects',
      };
    }

    // Stocker les tokens de manière sécurisée
    if (result.accessToken) {
      sessionStorage.setItem('julaba_access_token', result.accessToken);
    }
    if (result.refreshToken) {
      sessionStorage.setItem('julaba_refresh_token', result.refreshToken);
    }

    return {
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  } catch (error) {
    console.error('Login network error:', error);
    return {
      success: false,
      error: 'Erreur de connexion au serveur',
    };
  }
}

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const accessToken = sessionStorage.getItem('julaba_access_token');

    if (!accessToken) {
      return {
        success: false,
        error: 'Aucune session active',
      };
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      // Si le token est invalide, nettoyer la session
      if (response.status === 401) {
        sessionStorage.removeItem('julaba_access_token');
        sessionStorage.removeItem('julaba_refresh_token');
      }

      console.error('Get current user error:', result);
      return {
        success: false,
        error: result.error || 'Erreur lors de la récupération du profil',
      };
    }

    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error('Get current user network error:', error);
    return {
      success: false,
      error: 'Erreur de connexion au serveur',
    };
  }
}

/**
 * Déconnexion de l'utilisateur
 */
export async function logout(): Promise<AuthResponse> {
  try {
    const accessToken = sessionStorage.getItem('julaba_access_token');

    if (accessToken) {
      // Appeler l'endpoint de déconnexion
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    }

    // Nettoyer les tokens localement
    sessionStorage.removeItem('julaba_access_token');
    sessionStorage.removeItem('julaba_refresh_token');

    return {
      success: true,
      message: 'Déconnexion réussie',
    };
  } catch (error) {
    console.error('Logout error:', error);
    // Nettoyer quand même les tokens localement
    sessionStorage.removeItem('julaba_access_token');
    sessionStorage.removeItem('julaba_refresh_token');
    
    return {
      success: true,
      message: 'Déconnexion réussie (locale)',
    };
  }
}

/**
 * Vérifier si l'utilisateur est connecté
 */
export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem('julaba_access_token');
}

/**
 * Obtenir le token d'accès actuel
 */
export function getAccessToken(): string | null {
  return sessionStorage.getItem('julaba_access_token');
}
