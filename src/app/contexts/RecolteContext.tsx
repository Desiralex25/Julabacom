import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as recoltesApi from '../../imports/recoltes-api';
import { DEV_MODE, devLog } from '../config/devMode';
import { NOT_AUTHENTICATED } from '../../imports/api-client';

export interface Recolte {
  id: string;
  producteurId: string;
  produit: string;
  quantite: number;
  unite: string;
  qualite: 'standard' | 'premium' | 'bio';
  prixPropose: number;
  statut: 'declaree' | 'vendue' | 'expiree';
  dateRecolte: string;
  dateExpiration: string;
}

interface RecolteContextType {
  recoltes: Recolte[];
  loading: boolean;
  
  addRecolte: (data: Omit<Recolte, 'id'>) => Promise<void>;
  updateRecolte: (id: string, data: Partial<Recolte>) => Promise<void>;
  deleteRecolte: (id: string) => Promise<void>;
  getRecoltesByStatut: (statut: Recolte['statut']) => Recolte[];
  
  refreshRecoltes: () => Promise<void>;
}

const RecolteContext = createContext<RecolteContextType | undefined>(undefined);

export function RecolteProvider({ children }: { children: ReactNode }) {
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecoltes = async () => {
    if (DEV_MODE) {
      devLog('RecolteContext', 'Mode dev - skip API call');
      return;
    }
    try {
      setLoading(true);
      const { recoltes: data } = await recoltesApi.fetchRecoltes();
      
      if (data && Array.isArray(data)) {
        const recolteList: Recolte[] = data.map((r: any) => ({
          id: r.id,
          producteurId: r.producteur_id,
          produit: r.produit,
          quantite: r.quantite,
          unite: r.unite,
          qualite: r.qualite,
          prixPropose: r.prix_propose,
          statut: r.statut,
          dateRecolte: r.date_recolte,
          dateExpiration: r.date_expiration,
        }));

        setRecoltes(recolteList);
      } else {
        setRecoltes([]);
      }
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      // Ignorer silencieusement les erreurs JWT en mode demo
      if (error?.message?.includes('Invalid JWT') || error?.message?.includes('JWT')) return;
      console.error('Error loading recoltes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecoltes();
  }, []);

  const addRecolte = async (data: Omit<Recolte, 'id'>) => {
    try {
      await recoltesApi.createRecolte({
        produit: data.produit,
        quantite: data.quantite,
        unite: data.unite,
        qualite: data.qualite,
        prix_propose: data.prixPropose,
        date_recolte: data.dateRecolte,
        date_expiration: data.dateExpiration,
      });
      await loadRecoltes();
    } catch (error) {
      console.error('Error adding recolte:', error);
      throw error;
    }
  };

  const updateRecolte = async (id: string, data: Partial<Recolte>) => {
    try {
      await recoltesApi.updateRecolte(id, {
        statut: data.statut,
        quantite: data.quantite,
        prix_propose: data.prixPropose,
      });
      await loadRecoltes();
    } catch (error) {
      console.error('Error updating recolte:', error);
      throw error;
    }
  };

  const deleteRecolte = async (id: string) => {
    try {
      await recoltesApi.deleteRecolte(id);
      setRecoltes(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting recolte:', error);
      throw error;
    }
  };

  const getRecoltesByStatut = (statut: Recolte['statut']) => {
    return recoltes.filter(r => r.statut === statut);
  };

  const refreshRecoltes = async () => {
    await loadRecoltes();
  };

  const value: RecolteContextType = {
    recoltes,
    loading,
    addRecolte,
    updateRecolte,
    deleteRecolte,
    getRecoltesByStatut,
    refreshRecoltes,
  };

  return <RecolteContext.Provider value={value}>{children}</RecolteContext.Provider>;
}

export function useRecolte() {
  const context = useContext(RecolteContext);
  if (!context) {
    throw new Error('useRecolte must be used within RecolteProvider');
  }
  return context;
}