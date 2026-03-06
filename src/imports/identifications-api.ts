/**
 * Client API Identifications - JÙLABA
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