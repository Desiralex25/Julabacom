/**
 * Client API Zones - JÙLABA
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
// ──────���──────────────────────────────────────────────────────────────────────

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