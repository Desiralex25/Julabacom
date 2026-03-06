/**
 * Client API Commandes - JÙLABA
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

export interface Commande {
  id: string;
  user_id: string;
  acheteur_id?: string;
  vendeur_id?: string;
  type: 'achat' | 'vente';
  statut: 'en_attente' | 'confirmee' | 'en_route' | 'livree' | 'annulee';
  produit: string;
  quantite: string;
  prix: number;
  total: number;
  mode_paiement?: string;
  date_creation: string;
  date_livraison?: string;
  adresse_livraison?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommandeData {
  type: 'achat' | 'vente';
  produit: string;
  quantite: string;
  prix: number;
  acheteur_id?: string;
  vendeur_id?: string;
  mode_paiement?: string;
  adresse_livraison?: string;
  notes?: string;
}

export interface UpdateCommandeData {
  statut?: Commande['statut'];
  date_livraison?: string;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer toutes les commandes de l'utilisateur
 */
export async function fetchCommandes(): Promise<{ commandes: Commande[] }> {
  return apiRequest<{ commandes: Commande[] }>('/commandes');
}

/**
 * Créer une nouvelle commande
 */
export async function createCommande(data: CreateCommandeData): Promise<{ commande: Commande }> {
  return apiRequest<{ commande: Commande }>('/commandes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Modifier une commande
 */
export async function updateCommande(id: string, data: UpdateCommandeData): Promise<{ commande: Commande }> {
  return apiRequest<{ commande: Commande }>(`/commandes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Annuler une commande
 */
export async function cancelCommande(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/commandes/${id}`, {
    method: 'DELETE',
  });
}