/**
 * Client API Commissions - JÙLABA
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
