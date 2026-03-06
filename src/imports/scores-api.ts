/**
 * Client API Scores - JÙLABA
 */

import { projectId } from '/utils/supabase/info';
import { apiRequest as _apiRequest } from './api-client';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/api`;

function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return _apiRequest<T>(API_URL, endpoint, options);
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