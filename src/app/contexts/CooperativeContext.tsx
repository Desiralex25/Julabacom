import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ========== TYPES ==========
export interface MembreCooperative {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  specialite: string; // Type de production (ex: "Maraîcher", "Céréalier", etc.)
  localisation: string;
  dateAdhesion: string;
  cotisationPayee: boolean;
  montantCotisation: number;
  productionsActives: number; // Nombre de produits actuellement en vente
  totalVentes: number; // Total des ventes via la coopérative (FCFA)
  statut: 'actif' | 'inactif' | 'suspendu';
  avatar?: string;
}

export interface TransactionTresorerie {
  id: string;
  type: 'entree' | 'sortie';
  categorie: 'cotisation' | 'vente_groupee' | 'achat_groupe' | 'commission' | 'frais' | 'subvention' | 'autre';
  montant: number;
  description: string;
  membreId?: string; // ID du membre concerné (si applicable)
  membreNom?: string; // Nom du membre (pour affichage rapide)
  date: string;
  statut: 'validee' | 'en_attente' | 'annulee';
  validePar?: string; // ID de l'administrateur qui a validé
}

export interface CommandeGroupee {
  id: string;
  produit: string;
  categorie: string;
  quantiteTotale: number;
  unite: string;
  prixUnitaire: number;
  prixTotal: number;
  fournisseur: string;
  dateCommande: string;
  dateLivraisonPrevue: string;
  statut: 'en_cours' | 'livree' | 'annulee';
  membresParticipants: {
    membreId: string;
    membreNom: string;
    quantite: number;
    montantPaye: boolean;
  }[];
}

interface CooperativeContextType {
  // Membres
  membres: MembreCooperative[];
  ajouterMembre: (membre: Omit<MembreCooperative, 'id'>) => void;
  modifierMembre: (id: string, membre: Partial<MembreCooperative>) => void;
  supprimerMembre: (id: string) => void;
  getMembre: (id: string) => MembreCooperative | undefined;
  
  // Trésorerie
  tresorerie: TransactionTresorerie[];
  soldeActuel: number;
  ajouterTransaction: (transaction: Omit<TransactionTresorerie, 'id'>) => void;
  validerTransaction: (id: string) => void;
  annulerTransaction: (id: string) => void;
  calculerSolde: () => number;
  getRecentTransactions: (limit?: number) => Array<{id: string; type: string; montant: number; date: string}>;
  
  // Commandes groupées
  commandesGroupees: CommandeGroupee[];
  ajouterCommandeGroupee: (commande: Omit<CommandeGroupee, 'id'>) => void;
  modifierCommandeGroupee: (id: string, commande: Partial<CommandeGroupee>) => void;
  
  // Statistiques
  stats: {
    volumeGroupe: number;
    tresorerieActuelle: number;
  };
  getTotalCotisations: () => number;
  getTotalVentesGroupees: () => number;
  getMembresActifs: () => number;
  getCommandesEnCours: () => number;
}

const CooperativeContext = createContext<CooperativeContextType | undefined>(undefined);

// ========== PROVIDER ==========
export function CooperativeProvider({ children }: { children: ReactNode }) {
  const [membres, setMembres] = useState<MembreCooperative[]>([]);
  const [tresorerie, setTresorerie] = useState<TransactionTresorerie[]>([]);
  const [commandesGroupees, setCommandesGroupees] = useState<CommandeGroupee[]>([]);
  const [soldeActuel, setSoldeActuel] = useState<number>(0);

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const savedMembres = localStorage.getItem('julaba_cooperative_membres');
    const savedTresorerie = localStorage.getItem('julaba_cooperative_tresorerie');
    const savedCommandes = localStorage.getItem('julaba_cooperative_commandes');

    if (savedMembres) {
      setMembres(JSON.parse(savedMembres));
    } else {
      // Membres mock initiaux
      const membresMock: MembreCooperative[] = [
        {
          id: '1',
          nom: 'Kouassi',
          prenom: 'Jean',
          telephone: '+225 07 12 34 56 78',
          specialite: 'Maraîcher',
          localisation: 'Yopougon',
          dateAdhesion: '2025-01-15',
          cotisationPayee: true,
          montantCotisation: 25000,
          productionsActives: 5,
          totalVentes: 1250000,
          statut: 'actif',
        },
        {
          id: '2',
          nom: 'Koné',
          prenom: 'Aminata',
          telephone: '+225 05 98 76 54 32',
          specialite: 'Céréalière',
          localisation: 'Abobo',
          dateAdhesion: '2025-01-10',
          cotisationPayee: true,
          montantCotisation: 25000,
          productionsActives: 3,
          totalVentes: 890000,
          statut: 'actif',
        },
        {
          id: '3',
          nom: 'Traoré',
          prenom: 'Ibrahim',
          telephone: '+225 01 23 45 67 89',
          specialite: 'Fruitier',
          localisation: 'Adjamé',
          dateAdhesion: '2025-02-01',
          cotisationPayee: false,
          montantCotisation: 25000,
          productionsActives: 2,
          totalVentes: 450000,
          statut: 'actif',
        },
        {
          id: '4',
          nom: 'Ouattara',
          prenom: 'Fatoumata',
          telephone: '+225 07 55 66 77 88',
          specialite: 'Tubercules',
          localisation: 'Cocody',
          dateAdhesion: '2024-12-20',
          cotisationPayee: true,
          montantCotisation: 25000,
          productionsActives: 4,
          totalVentes: 1680000,
          statut: 'actif',
        },
      ];
      setMembres(membresMock);
      localStorage.setItem('julaba_cooperative_membres', JSON.stringify(membresMock));
    }

    if (savedTresorerie) {
      setTresorerie(JSON.parse(savedTresorerie));
    } else {
      // Transactions mock initiales
      const tresorerieMock: TransactionTresorerie[] = [
        {
          id: '1',
          type: 'entree',
          categorie: 'cotisation',
          montant: 25000,
          description: 'Cotisation mensuelle - Kouassi Jean',
          membreId: '1',
          membreNom: 'Kouassi Jean',
          date: new Date().toISOString(),
          statut: 'validee',
        },
        {
          id: '2',
          type: 'entree',
          categorie: 'cotisation',
          montant: 25000,
          description: 'Cotisation mensuelle - Koné Aminata',
          membreId: '2',
          membreNom: 'Koné Aminata',
          date: new Date().toISOString(),
          statut: 'validee',
        },
        {
          id: '3',
          type: 'entree',
          categorie: 'commission',
          montant: 45000,
          description: 'Commission vente groupée (3%)',
          date: new Date().toISOString(),
          statut: 'validee',
        },
        {
          id: '4',
          type: 'sortie',
          categorie: 'achat_groupe',
          montant: 350000,
          description: 'Achat groupé engrais bio',
          date: new Date(Date.now() - 86400000).toISOString(),
          statut: 'validee',
        },
      ];
      setTresorerie(tresorerieMock);
      localStorage.setItem('julaba_cooperative_tresorerie', JSON.stringify(tresorerieMock));
    }

    if (savedCommandes) {
      setCommandesGroupees(JSON.parse(savedCommandes));
    } else {
      // Commandes mock initiales
      const commandesMock: CommandeGroupee[] = [
        {
          id: '1',
          produit: 'Engrais bio NPK',
          categorie: 'Intrants agricoles',
          quantiteTotale: 500,
          unite: 'kg',
          prixUnitaire: 700,
          prixTotal: 350000,
          fournisseur: 'AgroTech CI',
          dateCommande: new Date().toISOString(),
          dateLivraisonPrevue: new Date(Date.now() + 7 * 86400000).toISOString(),
          statut: 'en_cours',
          membresParticipants: [
            { membreId: '1', membreNom: 'Kouassi Jean', quantite: 200, montantPaye: true },
            { membreId: '2', membreNom: 'Koné Aminata', quantite: 150, montantPaye: true },
            { membreId: '4', membreNom: 'Ouattara Fatoumata', quantite: 150, montantPaye: false },
          ],
        },
      ];
      setCommandesGroupees(commandesMock);
      localStorage.setItem('julaba_cooperative_commandes', JSON.stringify(commandesMock));
    }
  }, []);

  // Calculer le solde automatiquement
  useEffect(() => {
    const solde = calculerSolde();
    setSoldeActuel(solde);
  }, [tresorerie]);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('julaba_cooperative_membres', JSON.stringify(membres));
  }, [membres]);

  useEffect(() => {
    localStorage.setItem('julaba_cooperative_tresorerie', JSON.stringify(tresorerie));
  }, [tresorerie]);

  useEffect(() => {
    localStorage.setItem('julaba_cooperative_commandes', JSON.stringify(commandesGroupees));
  }, [commandesGroupees]);

  // ========== GESTION DES MEMBRES ==========
  const ajouterMembre = (membre: Omit<MembreCooperative, 'id'>) => {
    const nouveauMembre: MembreCooperative = {
      ...membre,
      id: Date.now().toString(),
    };
    setMembres(prev => [...prev, nouveauMembre]);
  };

  const modifierMembre = (id: string, membre: Partial<MembreCooperative>) => {
    setMembres(prev => prev.map(m => (m.id === id ? { ...m, ...membre } : m)));
  };

  const supprimerMembre = (id: string) => {
    setMembres(prev => prev.filter(m => m.id !== id));
  };

  const getMembre = (id: string) => {
    return membres.find(m => m.id === id);
  };

  // ========== GESTION DE LA TRÉSORERIE ==========
  const ajouterTransaction = (transaction: Omit<TransactionTresorerie, 'id'>) => {
    const nouvelleTransaction: TransactionTresorerie = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTresorerie(prev => [nouvelleTransaction, ...prev]);
  };

  const validerTransaction = (id: string) => {
    setTresorerie(prev =>
      prev.map(t => (t.id === id ? { ...t, statut: 'validee' as const } : t))
    );
  };

  const annulerTransaction = (id: string) => {
    setTresorerie(prev =>
      prev.map(t => (t.id === id ? { ...t, statut: 'annulee' as const } : t))
    );
  };

  const calculerSolde = () => {
    return tresorerie
      .filter(t => t.statut === 'validee')
      .reduce((acc, t) => {
        return t.type === 'entree' ? acc + t.montant : acc - t.montant;
      }, 0);
  };

  const getRecentTransactions = (limit?: number) => {
    return tresorerie
      .filter(t => t.statut === 'validee')
      .map(t => ({ id: t.id, type: t.type, montant: t.montant, date: t.date }))
      .slice(0, limit);
  };

  // ========== GESTION DES COMMANDES GROUPÉES ==========
  const ajouterCommandeGroupee = (commande: Omit<CommandeGroupee, 'id'>) => {
    const nouvelleCommande: CommandeGroupee = {
      ...commande,
      id: Date.now().toString(),
    };
    setCommandesGroupees(prev => [...prev, nouvelleCommande]);
  };

  const modifierCommandeGroupee = (id: string, commande: Partial<CommandeGroupee>) => {
    setCommandesGroupees(prev =>
      prev.map(c => (c.id === id ? { ...c, ...commande } : c))
    );
  };

  // ========== STATISTIQUES ==========
  const getTotalCotisations = () => {
    return tresorerie
      .filter(t => t.categorie === 'cotisation' && t.statut === 'validee')
      .reduce((acc, t) => acc + t.montant, 0);
  };

  const getTotalVentesGroupees = () => {
    return tresorerie
      .filter(t => t.categorie === 'vente_groupee' && t.statut === 'validee')
      .reduce((acc, t) => acc + t.montant, 0);
  };

  const getMembresActifs = () => {
    return membres.filter(m => m.statut === 'actif').length;
  };

  const getCommandesEnCours = () => {
    return commandesGroupees.filter(c => c.statut === 'en_cours').length;
  };

  const value: CooperativeContextType = {
    // Membres
    membres,
    ajouterMembre,
    modifierMembre,
    supprimerMembre,
    getMembre,

    // Trésorerie
    tresorerie,
    soldeActuel,
    ajouterTransaction,
    validerTransaction,
    annulerTransaction,
    calculerSolde,
    getRecentTransactions,

    // Commandes groupées
    commandesGroupees,
    ajouterCommandeGroupee,
    modifierCommandeGroupee,

    // Statistiques
    stats: {
      volumeGroupe: getTotalVentesGroupees(),
      tresorerieActuelle: soldeActuel,
    },
    getTotalCotisations,
    getTotalVentesGroupees,
    getMembresActifs,
    getCommandesEnCours,
  };

  return (
    <CooperativeContext.Provider value={value}>
      {children}
    </CooperativeContext.Provider>
  );
}

// ========== HOOK ==========
export function useCooperative() {
  const context = useContext(CooperativeContext);
  if (context === undefined) {
    throw new Error('useCooperative doit être utilisé dans un CooperativeProvider');
  }
  return context;
}