/**
 * API Client generique (Mode Local)
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Constante d'erreur pour les problèmes d'authentification
export const NOT_AUTHENTICATED = 'NOT_AUTHENTICATED';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  console.log('Mode local - API non disponible:', endpoint);
  return {
    success: false,
    error: 'Mode local - backend non disponible',
  };
}