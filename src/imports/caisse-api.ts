/**
 * Client API Caisse - JÙLABA
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

export interface CaisseTransaction {
  id: string;
  marchand_id: string;
  type: 'vente' | 'depense' | 'approvisionnement';
  montant: number;
  produits?: any;
  mode_paiement?: string;
  notes?: string;
  created_at: string;
}

export interface EnregistrerVenteData {
  montant: number;
  produits?: any;
  mode_paiement?: string;
  notes?: string;
}

export interface EnregistrerDepenseData {
  montant: number;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer l'historique des transactions caisse
 */
export async function fetchCaisseTransactions(): Promise<{ transactions: CaisseTransaction[] }> {
  return apiRequest<{ transactions: CaisseTransaction[] }>('/caisse/transactions');
}

/**
 * Enregistrer une vente
 */
export async function enregistrerVente(data: EnregistrerVenteData): Promise<{ transaction: CaisseTransaction }> {
  return apiRequest<{ transaction: CaisseTransaction }>('/caisse/vente', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Enregistrer une dépense
 */
export async function enregistrerDepense(data: EnregistrerDepenseData): Promise<{ transaction: CaisseTransaction }> {
  return apiRequest<{ transaction: CaisseTransaction }>('/caisse/depense', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}