/**
 * Client API Coopératives - JÙLABA
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

export interface Cooperative {
  id: string;
  user_id: string;
  nom: string;
  president_id?: string;
  tresorier_id?: string;
  secretaire_id?: string;
  solde_tresorerie: number;
  created_at: string;
  updated_at: string;
}

export interface CooperativeMembre {
  id: string;
  cooperative_id: string;
  membre_id: string;
  role: 'president' | 'tresorier' | 'secretaire' | 'membre';
  date_adhesion: string;
  cotisation_payee: boolean;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface TresorerieTransaction {
  id: string;
  cooperative_id: string;
  type: 'cotisation' | 'vente' | 'achat' | 'subvention' | 'depense' | 'retrait';
  montant: number;
  membre_id?: string;
  description?: string;
  created_at: string;
}

export interface AddTresorerieData {
  type: TresorerieTransaction['type'];
  montant: number;
  membre_id?: string;
  description?: string;
}

export interface AddMembreData {
  membre_id: string;
  role?: CooperativeMembre['role'];
  date_adhesion: string;
  cotisation_payee?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer le profil de la coopérative
 */
export async function fetchCooperative(): Promise<{ cooperative: Cooperative }> {
  return apiRequest<{ cooperative: Cooperative }>('/cooperative');
}

/**
 * Récupérer les membres de la coopérative
 */
export async function fetchCooperativeMembres(): Promise<{ membres: CooperativeMembre[] }> {
  return apiRequest<{ membres: CooperativeMembre[] }>('/cooperative/membres');
}

/**
 * Récupérer l'historique de la trésorerie
 */
export async function fetchCooperativeTresorerie(): Promise<{ transactions: TresorerieTransaction[] }> {
  return apiRequest<{ transactions: TresorerieTransaction[] }>('/cooperative/tresorerie');
}

/**
 * Ajouter une transaction de trésorerie
 */
export async function addTresorerieTransaction(data: AddTresorerieData): Promise<{ transaction: TresorerieTransaction }> {
  return apiRequest<{ transaction: TresorerieTransaction }>('/cooperative/tresorerie', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Ajouter un membre à la coopérative
 */
export async function addCooperativeMembre(data: AddMembreData): Promise<{ membre: CooperativeMembre }> {
  return apiRequest<{ membre: CooperativeMembre }>('/cooperative/membres', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}