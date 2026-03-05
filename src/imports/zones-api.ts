/**
 * Client API Zones - JÙLABA
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

export interface Zone {
  id: string;
  nom: string;
  type: 'region' | 'departement' | 'commune' | 'village';
  parent_id?: string;
  gestionnaire_id?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer toutes les zones actives
 */
export async function fetchZones(): Promise<{ zones: Zone[] }> {
  return apiRequest<{ zones: Zone[] }>('/zones');
}

/**
 * Récupérer une zone par ID
 */
export async function fetchZoneById(id: string): Promise<{ zone: Zone }> {
  return apiRequest<{ zone: Zone }>(`/zones/${id}`);
}
