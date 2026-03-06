import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as caisseApi from '../../imports/caisse-api';
import { DEV_MODE, devLog } from '../config/devMode';
import { NOT_AUTHENTICATED } from '../../imports/api-client';

export interface CaisseTransaction {
  id: string;
  marchandId: string;
  type: 'vente' | 'depense' | 'approvisionnement';
  montant: number;
  produits?: any;
  mode_paiement?: string;
  notes?: string;
  date: string;
}

interface CaisseContextType {
  transactions: CaisseTransaction[];
  loading: boolean;
  
  enregistrerVente: (montant: number, produits?: any, modePaiement?: string, notes?: string) => Promise<void>;
  enregistrerDepense: (montant: number, notes?: string) => Promise<void>;
  
  getSoldeJour: () => number;
  getVentesJour: () => CaisseTransaction[];
  getDepensesJour: () => CaisseTransaction[];
  
  refreshTransactions: () => Promise<void>;
}

const CaisseContext = createContext<CaisseContextType | undefined>(undefined);

export function CaisseProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<CaisseTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTransactions = async () => {
    if (DEV_MODE) {
      devLog('CaisseContext', 'Mode dev - skip API call');
      return;
    }
    try {
      setLoading(true);
      const { transactions: data } = await caisseApi.fetchCaisseTransactions();
      
      const txList: CaisseTransaction[] = data.map((tx: any) => ({
        id: tx.id,
        marchandId: tx.marchand_id,
        type: tx.type,
        montant: tx.montant,
        produits: tx.produits,
        mode_paiement: tx.mode_paiement,
        notes: tx.notes,
        date: tx.created_at,
      }));

      setTransactions(txList);
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      console.error('Error loading caisse transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const enregistrerVente = async (
    montant: number,
    produits?: any,
    modePaiement?: string,
    notes?: string
  ) => {
    try {
      await caisseApi.enregistrerVente({
        montant,
        produits,
        mode_paiement: modePaiement,
        notes,
      });
      await loadTransactions();
    } catch (error) {
      console.error('Error recording vente:', error);
      throw error;
    }
  };

  const enregistrerDepense = async (montant: number, notes?: string) => {
    try {
      await caisseApi.enregistrerDepense({
        montant,
        notes,
      });
      await loadTransactions();
    } catch (error) {
      console.error('Error recording depense:', error);
      throw error;
    }
  };

  const getSoldeJour = () => {
    const today = new Date().toISOString().split('T')[0];
    const txJour = transactions.filter(tx => tx.date.startsWith(today));
    
    const ventes = txJour.filter(tx => tx.type === 'vente').reduce((sum, tx) => sum + tx.montant, 0);
    const depenses = txJour.filter(tx => tx.type === 'depense').reduce((sum, tx) => sum + tx.montant, 0);
    
    return ventes - depenses;
  };

  const getVentesJour = () => {
    const today = new Date().toISOString().split('T')[0];
    return transactions.filter(tx => tx.type === 'vente' && tx.date.startsWith(today));
  };

  const getDepensesJour = () => {
    const today = new Date().toISOString().split('T')[0];
    return transactions.filter(tx => tx.type === 'depense' && tx.date.startsWith(today));
  };

  const refreshTransactions = async () => {
    await loadTransactions();
  };

  const value: CaisseContextType = {
    transactions,
    loading,
    enregistrerVente,
    enregistrerDepense,
    getSoldeJour,
    getVentesJour,
    getDepensesJour,
    refreshTransactions,
  };

  return <CaisseContext.Provider value={value}>{children}</CaisseContext.Provider>;
}

export function useCaisse() {
  const context = useContext(CaisseContext);
  if (!context) {
    throw new Error('useCaisse must be used within CaisseProvider');
  }
  return context;
}