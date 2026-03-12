import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as cooperativesApi from '../../imports/cooperatives-api';
import { NOT_AUTHENTICATED } from '../../imports/api-client';

export interface Cooperative {
  id: string;
  nom: string;
  presidentId?: string;
  treorierId?: string;
  secretaireId?: string;
  soldeTresorerie: number;
}

export interface CooperativeMembre {
  id: string;
  membreId: string;
  role: 'president' | 'tresorier' | 'secretaire' | 'membre';
  dateAdhesion: string;
  cotisationPayee: boolean;
  actif: boolean;
  // Compat alias
  statut?: 'actif' | 'inactif';
}

// Alias pour compatibilité avec ancien code
export type MembreCooperative = CooperativeMembre;

export interface TresorerieTransaction {
  id: string;
  type: 'cotisation' | 'vente' | 'achat' | 'subvention' | 'depense' | 'retrait';
  montant: number;
  membreId?: string;
  description?: string;
  date: string;
}

// Alias pour compatibilité
export type TransactionTresorerie = TresorerieTransaction;

interface CooperativeStats {
  volumeGroupe: number;
  tresorerieActuelle: number;
  totalMembres: number;
  membresActifs: number;
  totalCotisations: number;
  totalVentes: number;
}

interface CooperativeContextType {
  cooperative: Cooperative | null;
  membres: CooperativeMembre[];
  tresorerie: TresorerieTransaction[];
  loading: boolean;
  stats: CooperativeStats;
  soldeActuel: number;

  addMembre: (membreId: string, role?: string, dateAdhesion?: string) => Promise<void>;
  addTransaction: (type: TresorerieTransaction['type'], montant: number, description?: string, membreId?: string) => Promise<void>;
  supprimerMembre: (membreId: string) => Promise<void>;

  getMembresActifs: () => CooperativeMembre[];
  getCommandesEnCours: () => any[];
  getRecentTransactions: (n: number) => TresorerieTransaction[];
  getTotalCotisations: () => number;
  getTotalVentesGroupees: () => number;

  refreshCooperative: () => Promise<void>;
  refreshMembres: () => Promise<void>;
  refreshTresorerie: () => Promise<void>;
}

const CooperativeContext = createContext<CooperativeContextType | undefined>(undefined);

export function CooperativeProvider({ children }: { children: ReactNode }) {
  const [cooperative, setCooperative] = useState<Cooperative | null>(null);
  const [membres, setMembres] = useState<CooperativeMembre[]>([]);
  const [tresorerie, setTresorerie] = useState<TresorerieTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCooperative = async () => {
    try {
      const { cooperative: data } = await cooperativesApi.fetchCooperative();
      if (data) {
        setCooperative({
          id: data.id,
          nom: data.nom,
          presidentId: data.president_id,
          treorierId: data.tresorier_id,
          secretaireId: data.secretaire_id,
          soldeTresorerie: data.solde_tresorerie,
        });
      }
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      // Ignorer silencieusement les erreurs JWT en mode demo
      if (error?.message?.includes('Invalid JWT') || error?.message?.includes('JWT')) return;
      console.error('Error loading cooperative:', error);
    }
  };

  const loadMembres = async () => {
    try {
      const { membres: data } = await cooperativesApi.fetchCooperativeMembres();
      if (data) {
        setMembres(data.map((m: any) => ({
          id: m.id,
          membreId: m.membre_id,
          role: m.role,
          dateAdhesion: m.date_adhesion,
          cotisationPayee: m.cotisation_payee,
          actif: m.actif,
          statut: m.actif ? 'actif' : 'inactif', // compat alias
        })));
      }
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      // Ignorer silencieusement les erreurs JWT en mode demo
      if (error?.message?.includes('Invalid JWT') || error?.message?.includes('JWT')) return;
      console.error('Error loading membres:', error);
    }
  };

  const loadTresorerie = async () => {
    try {
      const { transactions: data } = await cooperativesApi.fetchCooperativeTresorerie();
      if (data) {
        setTresorerie(data.map((t: any) => ({
          id: t.id,
          type: t.type,
          montant: t.montant,
          membreId: t.membre_id,
          description: t.description,
          date: t.created_at,
        })));
      }
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      // Ignorer silencieusement les erreurs JWT en mode demo
      if (error?.message?.includes('Invalid JWT') || error?.message?.includes('JWT')) return;
      console.error('Error loading tresorerie:', error);
    }
  };

  useEffect(() => {
    Promise.all([loadCooperative(), loadMembres(), loadTresorerie()]);
  }, []);

  // ── Fonctions calculées ──────────────────────────────────────────────────────
  const getMembresActifs = () => membres.filter(m => m.actif);

  const getCommandesEnCours = (): any[] => [];

  const getRecentTransactions = (n: number) =>
    [...tresorerie].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, n);

  const getTotalCotisations = () =>
    tresorerie.filter(t => t.type === 'cotisation').reduce((sum, t) => sum + t.montant, 0);

  const getTotalVentesGroupees = () =>
    tresorerie.filter(t => t.type === 'vente').reduce((sum, t) => sum + t.montant, 0);

  const soldeActuel = cooperative?.soldeTresorerie ?? 0;

  const stats: CooperativeStats = {
    volumeGroupe: tresorerie.filter(t => t.type === 'vente').reduce((s, t) => s + t.montant, 0),
    tresorerieActuelle: soldeActuel,
    totalMembres: membres.length,
    membresActifs: membres.filter(m => m.actif).length,
    totalCotisations: getTotalCotisations(),
    totalVentes: getTotalVentesGroupees(),
  };

  // ── Mutations ───────────────────────────────────────────────────────────────
  const addMembre = async (membreId: string, role?: string, dateAdhesion?: string) => {
    try {
      await cooperativesApi.addCooperativeMembre({
        membre_id: membreId,
        role: role as any,
        date_adhesion: dateAdhesion || new Date().toISOString().split('T')[0],
      });
      await loadMembres();
    } catch (error) {
      console.error('Error adding membre:', error);
      throw error;
    }
  };

  const supprimerMembre = async (membreId: string) => {
    try {
      // Soft delete : mettre actif = false si l'API le supporte
      await loadMembres();
    } catch (error) {
      console.error('Error removing membre:', error);
      throw error;
    }
  };

  const addTransaction = async (
    type: TresorerieTransaction['type'],
    montant: number,
    description?: string,
    membreId?: string
  ) => {
    try {
      await cooperativesApi.addTresorerieTransaction({ type, montant, description, membre_id: membreId });
      await Promise.all([loadCooperative(), loadTresorerie()]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const refreshCooperative = async () => { await loadCooperative(); };
  const refreshMembres = async () => { await loadMembres(); };
  const refreshTresorerie = async () => { await loadTresorerie(); };

  const value: CooperativeContextType = {
    cooperative, membres, tresorerie, loading,
    stats, soldeActuel,
    addMembre, addTransaction, supprimerMembre,
    getMembresActifs, getCommandesEnCours, getRecentTransactions,
    getTotalCotisations, getTotalVentesGroupees,
    refreshCooperative, refreshMembres, refreshTresorerie,
  };

  return <CooperativeContext.Provider value={value}>{children}</CooperativeContext.Provider>;
}

export function useCooperative() {
  const context = useContext(CooperativeContext);
  if (!context) {
    throw new Error('useCooperative must be used within CooperativeProvider');
  }
  return context;
}