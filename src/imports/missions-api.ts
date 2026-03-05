/**
 * Client API Missions - JÙLABA
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

export interface Mission {
  id: string;
  identificateur_id: string;
  titre: string;
  description?: string;
  zone_id?: string;
  objectif?: number;
  progres: number;
  statut: 'en_cours' | 'terminee' | 'annulee';
  date_debut?: string;
  date_fin?: string;
  recompense?: number;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer toutes les missions de l'identificateur
 */
export async function fetchMissions(): Promise<{ missions: Mission[] }> {
  return apiRequest<{ missions: Mission[] }>('/missions');
}

/**
 * Mettre à jour le progrès d'une mission
 */
export async function updateMissionProgres(id: string, progres: number): Promise<{ mission: Mission }> {
  return apiRequest<{ mission: Mission }>(`/missions/${id}/progres`, {
    method: 'PATCH',
    body: JSON.stringify({ progres }),
  });
}
