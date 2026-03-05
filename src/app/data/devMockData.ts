/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — Données Mock pour Mode Développement
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Données minimales pour permettre la navigation UI sans backend
 */

import type { User, Transaction, DaySession } from '../contexts/AppContext';

// Utilisateur par défaut en mode dev
export const DEV_USER: User = {
  id: 'dev-user-001',
  phone: '0700000000',
  firstName: 'Utilisateur',
  lastName: 'Dev',
  role: 'marchand',
  region: 'Abidjan',
  commune: 'Cocody',
  activity: 'Commerce',
  market: 'Marché Test',
  score: 85,
  createdAt: new Date().toISOString(),
  validated: true,
  zone: 'Zone 1',
  categorie: 'A',
};

// Données vides par défaut
export const DEV_EMPTY_DATA = {
  transactions: [] as Transaction[],
  sessions: [] as DaySession[],
  recoltes: [],
  commandes: [],
  stocks: [],
  cooperatives: [],
  institutions: [],
  zones: [],
  producteurs: [],
  notifications: [],
  tickets: [],
  audits: [],
  wallets: [],
  scores: [],
};

// Helper pour générer des données mock si nécessaire
export const generateDevData = <T,>(count: number, generator: (index: number) => T): T[] => {
  return Array.from({ length: count }, (_, i) => generator(i));
};
