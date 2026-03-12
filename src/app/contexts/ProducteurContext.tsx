import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as recoltesApi from '../../imports/recoltes-api';
import * as commandesApi from '../../imports/commandes-api';
import { DEV_MODE, devLog } from '../config/devMode';
import { NOT_AUTHENTICATED } from '../../imports/api-client';

export interface ProducteurStats {
  recoltesTotales: number;
  recoltesVendues: number;
  revenusTotal: number;
  commandesEnCours: number;
}

interface ProducteurContextType {
  stats: ProducteurStats | null;
  loading: boolean;
  
  getStats: () => Promise<ProducteurStats>;
  refreshStats: () => Promise<void>;
}

const ProducteurContext = createContext<ProducteurContextType | undefined>(undefined);

export function ProducteurProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<ProducteurStats | null>(null);
  const [loading, setLoading] = useState(false);

  const getStats = async (): Promise<ProducteurStats> => {
    const defaultStats: ProducteurStats = {
      recoltesTotales: 0,
      recoltesVendues: 0,
      revenusTotal: 0,
      commandesEnCours: 0,
    };
    
    if (DEV_MODE) {
      devLog('ProducteurContext', 'Mode dev - skip API call');
      setStats(defaultStats);
      return defaultStats;
    }
    try {
      setLoading(true);
      
      const [recoltesData, commandesData] = await Promise.all([
        recoltesApi.fetchRecoltes(),
        commandesApi.fetchCommandes(),
      ]);

      const recoltes = recoltesData.recoltes || [];
      const commandes = commandesData.commandes || [];

      const recoltesVendues = recoltes.filter((r: any) => r.statut === 'vendue').length;
      const revenusTotal = recoltes
        .filter((r: any) => r.statut === 'vendue')
        .reduce((sum: number, r: any) => sum + r.quantite * r.prix_propose, 0);

      const commandesEnCours = commandes.filter((c: any) => 
        c.statut === 'en_attente' || c.statut === 'confirmee' || c.statut === 'en_cours'
      ).length;

      const stats: ProducteurStats = {
        recoltesTotales: recoltes.length,
        recoltesVendues,
        revenusTotal,
        commandesEnCours,
      };

      setStats(stats);
      return stats;
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) {
        setLoading(false);
        setStats(defaultStats);
        return defaultStats;
      }
      // Ignorer silencieusement les erreurs JWT en mode demo
      if (error?.message?.includes('Invalid JWT') || error?.message?.includes('JWT')) {
        setStats(defaultStats);
        return defaultStats;
      }
      console.error('Error loading producteur stats:', error);
      setStats(defaultStats);
      return defaultStats;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  const refreshStats = async () => {
    await getStats();
  };

  const value: ProducteurContextType = {
    stats,
    loading,
    getStats,
    refreshStats,
  };

  return <ProducteurContext.Provider value={value}>{children}</ProducteurContext.Provider>;
}

export function useProducteur() {
  const context = useContext(ProducteurContext);
  if (!context) {
    throw new Error('useProducteur must be used within ProducteurProvider');
  }
  return context;
}