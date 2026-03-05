import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as cooperativesApi from '../../imports/cooperatives-api';
import { DEV_MODE, devLog } from '../config/devMode';

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
}

export interface TresorerieTransaction {
  id: string;
  type: 'cotisation' | 'vente' | 'achat' | 'subvention' | 'depense' | 'retrait';
  montant: number;
  membreId?: string;
  description?: string;
  date: string;
}

interface CooperativeContextType {
  cooperative: Cooperative | null;
  membres: CooperativeMembre[];
  tresorerie: TresorerieTransaction[];
  loading: boolean;
  
  addMembre: (membreId: string, role?: string, dateAdhesion?: string) => Promise<void>;
  addTransaction: (type: TresorerieTransaction['type'], montant: number, description?: string, membreId?: string) => Promise<void>;
  
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
    if (DEV_MODE) {
      devLog('CooperativeContext', 'Mode dev - skip loadCooperative');
      return;
    }
    try {
      const { cooperative: data } = await cooperativesApi.fetchCooperative();
      
      setCooperative({
        id: data.id,
        nom: data.nom,
        presidentId: data.president_id,
        treorierId: data.tresorier_id,
        secretaireId: data.secretaire_id,
        soldeTresorerie: data.solde_tresorerie,
      });
    } catch (error) {
      console.error('Error loading cooperative:', error);
    }
  };

  const loadMembres = async () => {
    if (DEV_MODE) {
      devLog('CooperativeContext', 'Mode dev - skip loadMembres');
      return;
    }
    try {
      const { membres: data } = await cooperativesApi.fetchCooperativeMembres();
      
      setMembres(data.map((m: any) => ({
        id: m.id,
        membreId: m.membre_id,
        role: m.role,
        dateAdhesion: m.date_adhesion,
        cotisationPayee: m.cotisation_payee,
        actif: m.actif,
      })));
    } catch (error) {
      console.error('Error loading membres:', error);
    }
  };

  const loadTresorerie = async () => {
    if (DEV_MODE) {
      devLog('CooperativeContext', 'Mode dev - skip loadTresorerie');
      return;
    }
    try {
      const { transactions: data } = await cooperativesApi.fetchCooperativeTresorerie();
      
      setTresorerie(data.map((t: any) => ({
        id: t.id,
        type: t.type,
        montant: t.montant,
        membreId: t.membre_id,
        description: t.description,
        date: t.created_at,
      })));
    } catch (error) {
      console.error('Error loading tresorerie:', error);
    }
  };

  useEffect(() => {
    Promise.all([
      loadCooperative(),
      loadMembres(),
      loadTresorerie(),
    ]);
  }, []);

  const addMembre = async (
    membreId: string,
    role?: string,
    dateAdhesion?: string
  ) => {
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

  const addTransaction = async (
    type: TresorerieTransaction['type'],
    montant: number,
    description?: string,
    membreId?: string
  ) => {
    try {
      await cooperativesApi.addTresorerieTransaction({
        type,
        montant,
        description,
        membre_id: membreId,
      });
      await Promise.all([loadCooperative(), loadTresorerie()]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const refreshCooperative = async () => {
    await loadCooperative();
  };

  const refreshMembres = async () => {
    await loadMembres();
  };

  const refreshTresorerie = async () => {
    await loadTresorerie();
  };

  const value: CooperativeContextType = {
    cooperative,
    membres,
    tresorerie,
    loading,
    addMembre,
    addTransaction,
    refreshCooperative,
    refreshMembres,
    refreshTresorerie,
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