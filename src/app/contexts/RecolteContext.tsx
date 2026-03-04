import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Recolte, RecolteStatus, RecolteQuality } from '../types/julaba.types';

interface RecolteContextType {
  recoltes: Recolte[];
  
  // CRUD récoltes
  creerRecolte: (producteurId: string, producteurName: string, data: Partial<Recolte>) => Promise<Recolte>;
  publierRecolte: (recolteId: string, producteurId: string) => Promise<void>;
  modifierRecolte: (recolteId: string, producteurId: string, updates: Partial<Recolte>) => Promise<void>;
  retirerRecolte: (recolteId: string, producteurId: string) => Promise<void>;
  
  // Gestion stock
  decrementerStock: (recolteId: string, quantiteVendue: number) => Promise<void>;
  incrementerStock: (recolteId: string, nouvelleQuantite: number) => Promise<void>;
  
  // Helpers
  getRecolteById: (recolteId: string) => Recolte | undefined;
  getRecoltesByProducteur: (producteurId: string) => Recolte[];
  getRecoltesEnLigne: (region?: string) => Recolte[];
  getRecoltesDraft: (producteurId: string) => Recolte[];
  calculerTauxConversion: (recolteId: string) => number;
}

const RecolteContext = createContext<RecolteContextType | undefined>(undefined);

export function RecolteProvider({ children }: { children: ReactNode }) {
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  let recolteCounter = 1;

  // Charger depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('julaba_recoltes');
    if (stored) {
      setRecoltes(JSON.parse(stored));
      
      const storedCounter = localStorage.getItem('julaba_recolte_counter');
      if (storedCounter) {
        recolteCounter = parseInt(storedCounter, 10);
      }
    }
  }, []);

  // Sauvegarder automatiquement
  useEffect(() => {
    localStorage.setItem('julaba_recoltes', JSON.stringify(recoltes));
  }, [recoltes]);

  // Générer numéro récolte
  const generateNumeroRecolte = (): string => {
    const numero = `REC-2024-${String(recolteCounter).padStart(4, '0')}`;
    recolteCounter++;
    localStorage.setItem('julaba_recolte_counter', String(recolteCounter));
    return numero;
  };

  // 🌾 Créer une récolte (état DRAFT par défaut)
  const creerRecolte = async (
    producteurId: string,
    producteurName: string,
    data: Partial<Recolte>
  ): Promise<Recolte> => {
    const recolte: Recolte = {
      id: `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      numeroRecolte: generateNumeroRecolte(),
      producteurId,
      producteurName,
      
      produit: data.produit || '',
      categorieProduit: data.categorieProduit || 'LEGUME',
      quantiteRecoltee: data.quantiteRecoltee || 0,
      stockRestant: data.quantiteRecoltee || 0,
      unite: data.unite || 'kg',
      
      qualite: data.qualite || 'BON',
      dateRecolte: data.dateRecolte || new Date().toISOString(),
      localisation: data.localisation || {
        region: '',
        commune: '',
      },
      
      prixUnitaire: data.prixUnitaire || 0,
      prixMinimum: data.prixMinimum,
      status: RecolteStatus.DRAFT,
      
      visibleSurMarche: false,
      
      photos: data.photos || [],
      certificationBio: data.certificationBio || false,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      nombreVues: 0,
      nombreCommandes: 0,
      tauxConversion: 0,
    };

    setRecoltes([recolte, ...recoltes]);
    console.log(`🌾 Récolte créée (DRAFT) : ${recolte.numeroRecolte}`);
    
    return recolte;
  };

  // 📢 Publier une récolte (DRAFT → EN_LIGNE)
  const publierRecolte = async (recolteId: string, producteurId: string) => {
    const recolte = recoltes.find(r => r.id === recolteId);
    if (!recolte) throw new Error('Récolte introuvable');
    if (recolte.producteurId !== producteurId) throw new Error('Non autorisé');
    if (recolte.status !== RecolteStatus.DRAFT) throw new Error('Récolte déjà publiée');
    if (!recolte.produit || !recolte.prixUnitaire || recolte.quantiteRecoltee <= 0) {
      throw new Error('Données incomplètes : produit, prix et quantité requis');
    }

    const updated: Recolte = {
      ...recolte,
      status: RecolteStatus.EN_LIGNE,
      visibleSurMarche: true,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecoltes(recoltes.map(r => r.id === recolteId ? updated : r));
    console.log(`📢 Récolte ${recolte.numeroRecolte} publiée sur le marché`);
  };

  // ✏️ Modifier une récolte
  const modifierRecolte = async (
    recolteId: string,
    producteurId: string,
    updates: Partial<Recolte>
  ) => {
    const recolte = recoltes.find(r => r.id === recolteId);
    if (!recolte) throw new Error('Récolte introuvable');
    if (recolte.producteurId !== producteurId) throw new Error('Non autorisé');

    // Si déjà en vente et vendue partiellement, interdire modification quantité
    if (recolte.status === RecolteStatus.PARTIELLEMENT_VENDUE && updates.quantiteRecoltee) {
      throw new Error('Impossible de modifier la quantité (déjà partiellement vendue)');
    }

    const updated: Recolte = {
      ...recolte,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setRecoltes(recoltes.map(r => r.id === recolteId ? updated : r));
    console.log(`✏️ Récolte ${recolte.numeroRecolte} modifiée`);
  };

  // 🗑️ Retirer une récolte du marché
  const retirerRecolte = async (recolteId: string, producteurId: string) => {
    const recolte = recoltes.find(r => r.id === recolteId);
    if (!recolte) throw new Error('Récolte introuvable');
    if (recolte.producteurId !== producteurId) throw new Error('Non autorisé');

    const updated: Recolte = {
      ...recolte,
      status: RecolteStatus.RETIREE,
      visibleSurMarche: false,
      updatedAt: new Date().toISOString(),
    };

    setRecoltes(recoltes.map(r => r.id === recolteId ? updated : r));
    console.log(`🗑️ Récolte ${recolte.numeroRecolte} retirée du marché`);
  };

  // 📉 Décrémenter stock (après vente)
  const decrementerStock = async (recolteId: string, quantiteVendue: number) => {
    const recolte = recoltes.find(r => r.id === recolteId);
    if (!recolte) throw new Error('Récolte introuvable');
    if (recolte.stockRestant < quantiteVendue) throw new Error('Stock insuffisant');

    const nouveauStock = recolte.stockRestant - quantiteVendue;
    let nouveauStatus = recolte.status;

    // Transitions d'état automatiques
    if (nouveauStock === 0) {
      nouveauStatus = RecolteStatus.SOLD_OUT;
    } else if (nouveauStock < recolte.quantiteRecoltee && recolte.status === RecolteStatus.EN_LIGNE) {
      nouveauStatus = RecolteStatus.PARTIELLEMENT_VENDUE;
    }

    const updated: Recolte = {
      ...recolte,
      stockRestant: nouveauStock,
      status: nouveauStatus,
      visibleSurMarche: nouveauStock > 0, // Masquer si sold out
      nombreCommandes: recolte.nombreCommandes + 1,
      updatedAt: new Date().toISOString(),
    };

    setRecoltes(recoltes.map(r => r.id === recolteId ? updated : r));
    
    if (nouveauStatus === RecolteStatus.SOLD_OUT) {
      console.log(`🎉 Récolte ${recolte.numeroRecolte} épuisée (SOLD OUT)`);
    } else {
      console.log(`📉 Stock décrémenter : ${nouveauStock} kg restants`);
    }
  };

  // 📈 Incrémenter stock (ajout nouvelle récolte)
  const incrementerStock = async (recolteId: string, nouvelleQuantite: number) => {
    const recolte = recoltes.find(r => r.id === recolteId);
    if (!recolte) throw new Error('Récolte introuvable');

    const nouveauStock = recolte.stockRestant + nouvelleQuantite;
    const nouveauTotal = recolte.quantiteRecoltee + nouvelleQuantite;

    // Si c'était SOLD_OUT, repasser à EN_LIGNE
    let nouveauStatus = recolte.status;
    if (recolte.status === RecolteStatus.SOLD_OUT) {
      nouveauStatus = RecolteStatus.EN_LIGNE;
    }

    const updated: Recolte = {
      ...recolte,
      quantiteRecoltee: nouveauTotal,
      stockRestant: nouveauStock,
      status: nouveauStatus,
      visibleSurMarche: true,
      updatedAt: new Date().toISOString(),
    };

    setRecoltes(recoltes.map(r => r.id === recolteId ? updated : r));
    console.log(`📈 Stock augmenté : +${nouvelleQuantite} kg → Total ${nouveauStock} kg`);
  };

  // 📊 Calculer taux de conversion (commandes / vues)
  const calculerTauxConversion = (recolteId: string): number => {
    const recolte = recoltes.find(r => r.id === recolteId);
    if (!recolte || recolte.nombreVues === 0) return 0;
    
    return (recolte.nombreCommandes / recolte.nombreVues) * 100;
  };

  // Helpers
  const getRecolteById = (recolteId: string) => {
    return recoltes.find(r => r.id === recolteId);
  };

  const getRecoltesByProducteur = (producteurId: string) => {
    return recoltes.filter(r => r.producteurId === producteurId);
  };

  const getRecoltesEnLigne = (region?: string) => {
    let filtered = recoltes.filter(r => r.visibleSurMarche && r.stockRestant > 0);
    
    if (region) {
      filtered = filtered.filter(r => r.localisation.region === region);
    }
    
    return filtered.sort((a, b) => {
      // Tri par score du producteur (à implémenter avec ScoreContext)
      // Pour l'instant, tri par date de publication
      return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
    });
  };

  const getRecoltesDraft = (producteurId: string) => {
    return recoltes.filter(
      r => r.producteurId === producteurId && r.status === RecolteStatus.DRAFT
    );
  };

  const value: RecolteContextType = {
    recoltes,
    creerRecolte,
    publierRecolte,
    modifierRecolte,
    retirerRecolte,
    decrementerStock,
    incrementerStock,
    getRecolteById,
    getRecoltesByProducteur,
    getRecoltesEnLigne,
    getRecoltesDraft,
    calculerTauxConversion,
  };

  return <RecolteContext.Provider value={value}>{children}</RecolteContext.Provider>;
}

export function useRecolte() {
  const context = useContext(RecolteContext);
  if (context === undefined) {
    throw new Error('useRecolte doit être utilisé dans un RecolteProvider');
  }
  return context;
}
