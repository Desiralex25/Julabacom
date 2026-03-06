/**
 * Client API Stocks - JÙLABA
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