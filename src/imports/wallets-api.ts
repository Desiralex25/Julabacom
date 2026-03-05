/**
 * Client API Wallets - JÙLABA
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

export interface Wallet {
  id: string;
  user_id: string;
  solde: number;
  solde_bloque: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'credit' | 'debit' | 'blocage' | 'deblocage' | 'remboursement';
  montant: number;
  description?: string;
  reference?: string;
  statut: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
}

export interface CreditWalletData {
  montant: number;
  description?: string;
  reference?: string;
}

export interface DebitWalletData {
  montant: number;
  description?: string;
  reference?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer le wallet de l'utilisateur
 */
export async function fetchWallet(): Promise<{ wallet: Wallet }> {
  return apiRequest<{ wallet: Wallet }>('/wallet');
}

/**
 * Créditer le wallet
 */
export async function creditWallet(data: CreditWalletData): Promise<{ wallet: Wallet }> {
  return apiRequest<{ wallet: Wallet }>('/wallet/credit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Débiter le wallet
 */
export async function debitWallet(data: DebitWalletData): Promise<{ wallet: Wallet }> {
  return apiRequest<{ wallet: Wallet }>('/wallet/debit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Récupérer l'historique des transactions wallet
 */
export async function fetchWalletTransactions(): Promise<{ transactions: WalletTransaction[] }> {
  return apiRequest<{ transactions: WalletTransaction[] }>('/wallet/transactions');
}
