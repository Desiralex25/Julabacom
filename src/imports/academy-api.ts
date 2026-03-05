/**
 * Client API Academy - JÙLABA
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/api`;

function getAccessToken(): string {
  return localStorage.getItem('julaba_access_token') || publicAnonKey;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur API');
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AcademyProgress {
  id: string;
  user_id: string;
  module_id: string;
  progres: number;
  complete: boolean;
  score?: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateModuleProgressData {
  progres?: number;
  complete?: boolean;
  score?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer la progression academy de l'utilisateur
 */
export async function fetchAcademyProgress(): Promise<{ progress: AcademyProgress[] }> {
  return apiRequest<{ progress: AcademyProgress[] }>('/academy/progress');
}

/**
 * Mettre à jour la progression d'un module
 */
export async function updateModuleProgress(moduleId: string, data: UpdateModuleProgressData): Promise<{ progress: AcademyProgress }> {
  return apiRequest<{ progress: AcademyProgress }>(`/academy/${moduleId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
