/**
 * Client API Tickets Support - JÙLABA
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

export interface Ticket {
  id: string;
  user_id: string;
  titre: string;
  description: string;
  categorie: 'technique' | 'paiement' | 'livraison' | 'compte' | 'autre';
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  assigne_a?: string;
  reponses?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketData {
  titre: string;
  description: string;
  categorie?: Ticket['categorie'];
  priorite?: Ticket['priorite'];
}

export interface UpdateTicketData {
  statut?: Ticket['statut'];
  reponses?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer tous les tickets de l'utilisateur
 */
export async function fetchTickets(): Promise<{ tickets: Ticket[] }> {
  return apiRequest<{ tickets: Ticket[] }>('/tickets');
}

/**
 * Créer un nouveau ticket
 */
export async function createTicket(data: CreateTicketData): Promise<{ ticket: Ticket }> {
  return apiRequest<{ ticket: Ticket }>('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Modifier un ticket
 */
export async function updateTicket(id: string, data: UpdateTicketData): Promise<{ ticket: Ticket }> {
  return apiRequest<{ ticket: Ticket }>(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
