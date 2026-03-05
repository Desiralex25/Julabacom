/**
 * Client API Scores - JÙLABA
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

export interface Score {
  id: string;
  user_id: string;
  score_total: number;
  score_fiabilite: number;
  score_qualite: number;
  score_ponctualite: number;
  nb_transactions: number;
  nb_avis: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateScoreData {
  score_total?: number;
  score_fiabilite?: number;
  score_qualite?: number;
  score_ponctualite?: number;
  nb_transactions?: number;
  nb_avis?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer le score d'un utilisateur
 */
export async function fetchScore(userId: string): Promise<{ score: Score }> {
  return apiRequest<{ score: Score }>(`/scores/${userId}`);
}

/**
 * Mettre à jour le score d'un utilisateur
 */
export async function updateScore(userId: string, data: UpdateScoreData): Promise<{ score: Score }> {
  return apiRequest<{ score: Score }>(`/scores/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
