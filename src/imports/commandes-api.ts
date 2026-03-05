/**
 * Client API Commandes - JÙLABA
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/api`;

/**
 * Récupérer le token d'accès
 */
function getAccessToken(): string {
  return localStorage.getItem('julaba_access_token') || publicAnonKey;
}

/**
 * Effectuer une requête API
 */
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
