/**
 * Client API Identifications - JÙLABA
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

export interface Identification {
  id: string;
  identificateur_id: string;
  acteur_id: string;
  type_acteur: 'marchand' | 'producteur' | 'cooperative' | 'institution';
  statut: 'en_attente' | 'validee' | 'rejetee';
  documents?: any;
  zone_id?: string;
  commission?: number;
  commission_payee: boolean;
  date_identification: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIdentificationData {
  acteur_id: string;
  type_acteur: 'marchand' | 'producteur' | 'cooperative' | 'institution';
  documents?: any;
  zone_id?: string;
  commission?: number;
  date_identification: string;
}

export interface UpdateIdentificationData {
  statut?: Identification['statut'];
  documents?: any;
  commission?: number;
  commission_payee?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer toutes les identifications de l'identificateur
 */
export async function fetchIdentifications(): Promise<{ identifications: Identification[] }> {
  return apiRequest<{ identifications: Identification[] }>('/identifications');
}

/**
 * Créer une nouvelle identification
 */
export async function createIdentification(data: CreateIdentificationData): Promise<{ identification: Identification }> {
  return apiRequest<{ identification: Identification }>('/identifications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Modifier une identification
 */
export async function updateIdentification(id: string, data: UpdateIdentificationData): Promise<{ identification: Identification }> {
  return apiRequest<{ identification: Identification }>(`/identifications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
