import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as caisseApi from '../../imports/caisse-api';
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

// Générateur de ventes pour la période 7-12 mars 2026
function genererVentesCocovico(): CaisseTransaction[] {
  const produits = [
    { nom: 'Banane plantain', unite: 'tas', prix: 500 },
    { nom: 'Poisson', unite: 'tas', prix: 2500 },
    { nom: 'Poulet', unite: 'unité', prix: 4500 },
    { nom: 'Tomate', unite: 'tas', prix: 500 },
    { nom: 'Oignon', unite: 'tas', prix: 600 },
    { nom: 'Attiéké', unite: 'sachet', prix: 300 },
    { nom: 'Piment', unite: 'tas', prix: 200 },
    { nom: 'Viande', unite: 'kg', prix: 3000 },
    { nom: 'Poisson fumé', unite: 'tas', prix: 1500 },
    { nom: 'Fruits', unite: 'tas', prix: 1000 },
    { nom: 'Manioc', unite: 'tas', prix: 500 },
    { nom: 'Gombo', unite: 'tas', prix: 200 },
  ];

  const marchands = [
    { id: '1', nom: 'Aminata Kouassi' },
    { id: '3', nom: 'Fatou Traoré' },
    { id: '4', nom: 'Ibrahim Touré' },
    { id: '6', nom: 'Adjoua Koffi' },
    { id: '7', nom: 'Jean KOUASSI' },
  ];

  const ventes: CaisseTransaction[] = [];
  let idCounter = 1000;

  // Période : 7 mars au 12 mars 2026
  const dates = [
    { date: '2026-03-07', ventesCount: 28 }, // Vendredi
    { date: '2026-03-08', ventesCount: 35 }, // Samedi - plus de ventes
    { date: '2026-03-09', ventesCount: 18 }, // Dimanche - moins de ventes
    { date: '2026-03-10', ventesCount: 25 }, // Lundi
    { date: '2026-03-11', ventesCount: 30 }, // Mardi
    { date: '2026-03-12', ventesCount: 40 }, // Mercredi - jour actuel, pic
  ];

  dates.forEach(({ date, ventesCount }) => {
    for (let i = 0; i < ventesCount; i++) {
      // Sélection aléatoire d'un produit et d'un marchand
      const produit = produits[Math.floor(Math.random() * produits.length)];
      const marchand = marchands[Math.floor(Math.random() * marchands.length)];
      
      // Quantité réaliste selon le type de produit
      let quantite = 1;
      if (produit.prix <= 500) {
        quantite = Math.floor(Math.random() * 5) + 1; // 1-5 pour produits bon marché
      } else if (produit.prix <= 1500) {
        quantite = Math.floor(Math.random() * 3) + 1; // 1-3 pour produits moyens
      } else {
        quantite = Math.floor(Math.random() * 2) + 1; // 1-2 pour produits chers
      }

      const montant = produit.prix * quantite;
      
      // Heure aléatoire entre 8h et 18h
      const heure = 8 + Math.floor(Math.random() * 10);
      const minute = Math.floor(Math.random() * 60);
      const dateISO = `${date}T${String(heure).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

      // Modes de paiement réalistes
      const modesPaiement = ['Espèces', 'Wave', 'Orange Money', 'MTN Mobile Money'];
      const modePaiement = modesPaiement[Math.floor(Math.random() * modesPaiement.length)];

      ventes.push({
        id: `vente-${idCounter++}`,
        marchandId: marchand.id,
        type: 'vente',
        montant,
        produits: {
          nom: produit.nom,
          quantite,
          unite: produit.unite,
          prixUnitaire: produit.prix,
        },
        mode_paiement: modePaiement,
        notes: `Identifié par Mamadou Coulibaly - ${marchand.nom}`,
        date: dateISO,
      });
    }
  });

  // Trier par date (du plus ancien au plus récent)
  return ventes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function CaisseProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<CaisseTransaction[]>(genererVentesCocovico());
  const [loading, setLoading] = useState(false);

  const loadTransactions = async () => {
    // Mode local, aucune transaction initiale par défaut pour l'instant
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
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
    const nouvelleVente: CaisseTransaction = {
      id: Date.now().toString(),
      marchandId: 'cocovico-local',
      type: 'vente',
      montant,
      produits,
      mode_paiement: modePaiement,
      notes,
      date: new Date().toISOString()
    };
    setTransactions(prev => [nouvelleVente, ...prev]);
  };

  const enregistrerDepense = async (montant: number, notes?: string) => {
    const nouvelleDepense: CaisseTransaction = {
      id: Date.now().toString(),
      marchandId: 'cocovico-local',
      type: 'depense',
      montant,
      notes,
      date: new Date().toISOString()
    };
    setTransactions(prev => [nouvelleDepense, ...prev]);
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