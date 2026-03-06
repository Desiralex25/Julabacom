/**
 * Client API Commissions - JÙLABA
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

export interface Commission {
  id: string;
  identificateur_id: string;
  identification_id?: string;
  montant: number;
  statut: 'en_attente' | 'validee' | 'payee';
  periode?: string;
  date_paiement?: string;
  created_at: string;
}

export interface CommissionsStats {
  total: number;
  en_attente: number;
  validees: number;
  payees: number;
  montant_total: number;
  montant_paye: number;
  montant_en_attente: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer toutes les commissions de l'identificateur
 */
export async function fetchCommissions(): Promise<{ commissions: Commission[] }> {
  return apiRequest<{ commissions: Commission[] }>('/commissions');
}

/**
 * Récupérer les statistiques des commissions
 */
export async function fetchCommissionsStats(): Promise<{ stats: CommissionsStats }> {
  return apiRequest<{ stats: CommissionsStats }>('/commissions/stats');
}