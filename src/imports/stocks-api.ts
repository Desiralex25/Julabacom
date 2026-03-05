/**
 * Client API Stocks - JÙLABA
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

export interface Stock {
  id: string;
  user_id: string;
  produit: string;
  quantite: number;
  unite: string;
  prix_achat?: number;
  derniere_modification: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertStockData {
  produit: string;
  quantite: number;
  unite: string;
  prix_achat?: number;
}

export interface UpdateStockData {
  quantite?: number;
  prix_achat?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer tout le stock de l'utilisateur
 */
export async function fetchStocks(): Promise<{ stocks: Stock[] }> {
  return apiRequest<{ stocks: Stock[] }>('/stocks');
}

/**
 * Ajouter ou mettre à jour un stock
 */
export async function upsertStock(data: UpsertStockData): Promise<{ stock: Stock }> {
  return apiRequest<{ stock: Stock }>('/stocks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Modifier un stock
 */
export async function updateStock(id: string, data: UpdateStockData): Promise<{ stock: Stock }> {
  return apiRequest<{ stock: Stock }>(`/stocks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Supprimer un stock
 */
export async function deleteStock(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/stocks/${id}`, {
    method: 'DELETE',
  });
}
