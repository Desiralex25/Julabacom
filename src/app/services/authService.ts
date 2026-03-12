/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — SERVICE D'AUTHENTIFICATION (Mode Local)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Version simplifiée sans backend
 * Utilise uniquement le stockage local
 */

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
 * Inscription d'un nouvel utilisateur (mode local)
 */
export async function signup(data: SignupData): Promise<AuthResponse> {
  console.log('Signup mode local:', data.phone);
  return { 
    success: false, 
    error: 'Mode local - utilisez le mode DEV pour tester l\'application' 
  };
}

/**
 * Connexion d'un utilisateur (mode local)
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  console.log('Login mode local:', data.phone);
  return { 
    success: false, 
    error: 'Mode local - utilisez le mode DEV pour tester l\'application' 
  };
}

/**
 * Deconnexion de l'utilisateur
 */
export async function logout(): Promise<AuthResponse> {
  localStorage.removeItem('julaba_user');
  localStorage.removeItem('julaba_access_token');
  localStorage.removeItem('julaba_refresh_token');
  return { success: true, message: 'Deconnexion reussie' };
}

/**
 * Obtenir un token valide (mode local - retourne null)
 */
export async function getValidToken(): Promise<string | null> {
  return localStorage.getItem('julaba_access_token');
}

/**
 * Verifier si l'utilisateur est connecte
 */
export async function isAuthenticated(): Promise<boolean> {
  return !!localStorage.getItem('julaba_user');
}
