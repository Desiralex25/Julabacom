import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as commandesApi from '../../imports/commandes-api';
import { NOT_AUTHENTICATED } from '../../imports/api-client';

export interface Commande {
  id: string;
  acheteurId: string;
  vendeurId: string;
  type: 'achat' | 'vente';
  produit: string;
  quantite: number;
  prixUnitaire: number;
  total: number;
  statut: 'en_attente' | 'confirmee' | 'en_cours' | 'livree' | 'annulee';
  dateCommande: string;
  dateLivraison?: string;
}

interface CommandeContextType {
  commandes: Commande[];
  loading: boolean;
  
  addCommande: (data: Omit<Commande, 'id' | 'dateCommande'>) => Promise<void>;
  updateCommande: (id: string, data: Partial<Commande>) => Promise<void>;
  annulerCommande: (id: string) => Promise<void>;
  
  getCommandesByStatut: (statut: Commande['statut']) => Commande[];
  getCommandesAchat: () => Commande[];
  getCommandesVente: () => Commande[];
  
  refreshCommandes: () => Promise<void>;
}

const CommandeContext = createContext<CommandeContextType | undefined>(undefined);

export function CommandeProvider({ children }: { children: ReactNode }) {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      const { commandes: data } = await commandesApi.fetchCommandes();
      
      if (data && Array.isArray(data)) {
        const commandeList: Commande[] = data.map((c: any) => ({
          id: c.id,
          acheteurId: c.acheteur_id,
          vendeurId: c.vendeur_id,
          type: c.type,
          produit: c.produit,
          quantite: c.quantite,
          prixUnitaire: c.prix_unitaire,
          total: c.total,
          statut: c.statut,
          dateCommande: c.created_at,
          dateLivraison: c.date_livraison,
        }));

        setCommandes(commandeList);
      } else {
        setCommandes([]);
      }
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      // Ignorer silencieusement les erreurs JWT en mode demo
      if (error?.message?.includes('Invalid JWT') || error?.message?.includes('JWT')) return;
      console.error('Error loading commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommandes();
  }, []);

  const addCommande = async (data: Omit<Commande, 'id' | 'dateCommande'>) => {
    try {
      await commandesApi.createCommande({
        vendeur_id: data.vendeurId,
        type: data.type,
        produit: data.produit,
        quantite: data.quantite,
        prix_unitaire: data.prixUnitaire,
        date_livraison: data.dateLivraison,
      });
      await loadCommandes();
    } catch (error) {
      console.error('Error adding commande:', error);
      throw error;
    }
  };

  const updateCommande = async (id: string, data: Partial<Commande>) => {
    try {
      await commandesApi.updateCommande(id, {
        statut: data.statut,
        date_livraison: data.dateLivraison,
      });
      await loadCommandes();
    } catch (error) {
      console.error('Error updating commande:', error);
      throw error;
    }
  };

  const annulerCommande = async (id: string) => {
    try {
      await commandesApi.deleteCommande(id);
      setCommandes(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error canceling commande:', error);
      throw error;
    }
  };

  const getCommandesByStatut = (statut: Commande['statut']) => {
    return commandes.filter(c => c.statut === statut);
  };

  const getCommandesAchat = () => {
    return commandes.filter(c => c.type === 'achat');
  };

  const getCommandesVente = () => {
    return commandes.filter(c => c.type === 'vente');
  };

  const refreshCommandes = async () => {
    await loadCommandes();
  };

  const value: CommandeContextType = {
    commandes,
    loading,
    addCommande,
    updateCommande,
    annulerCommande,
    getCommandesByStatut,
    getCommandesAchat,
    getCommandesVente,
    refreshCommandes,
  };

  return <CommandeContext.Provider value={value}>{children}</CommandeContext.Provider>;
}

export function useCommande() {
  const context = useContext(CommandeContext);
  if (!context) {
    throw new Error('useCommande must be used within CommandeProvider');
  }
  return context;
}