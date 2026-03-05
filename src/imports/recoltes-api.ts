/**
 * Client API Récoltes - JÙLABA
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

export interface Recolte {
  id: string;
  producteur_id: string;
  produit: string;
  quantite: number;
  unite: string;
  qualite: 'standard' | 'premium' | 'bio';
  prix_unitaire: number;
  statut: 'declaree' | 'validee' | 'vendue';
  date_recolte: string;
  parcelle?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRecolteData {
  produit: string;
  quantite: number;
  unite: string;
  qualite?: 'standard' | 'premium' | 'bio';
  prix_unitaire: number;
  date_recolte: string;
  parcelle?: string;
  notes?: string;
}

export interface UpdateRecolteData {
  statut?: Recolte['statut'];
  quantite?: number;
  prix_unitaire?: number;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer toutes les récoltes du producteur
 */
export async function fetchRecoltes(): Promise<{ recoltes: Recolte[] }> {
  return apiRequest<{ recoltes: Recolte[] }>('/recoltes');
}

/**
 * Déclarer une nouvelle récolte
 */
export async function createRecolte(data: CreateRecolteData): Promise<{ recolte: Recolte }> {
  return apiRequest<{ recolte: Recolte }>('/recoltes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Modifier une récolte
 */
export async function updateRecolte(id: string, data: UpdateRecolteData): Promise<{ recolte: Recolte }> {
  return apiRequest<{ recolte: Recolte }>(`/recoltes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Supprimer une récolte
 */
export async function deleteRecolte(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/recoltes/${id}`, {
    method: 'DELETE',
  });
}
