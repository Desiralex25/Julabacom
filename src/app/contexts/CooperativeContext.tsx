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

  // ✅ NETTOYAGE PHASE 2 : localStorage SUPPRIMÉ complètement
  // TODO: Charger les données depuis Supabase au démarrage
  // useEffect(() => {
  //   const loadData = async () => {
  //     const { data: membres } = await supabase.from('cooperative_membres').select('*');
  //     const { data: tresorerie } = await supabase.from('cooperative_tresorerie').select('*');
  //     const { data: commandes } = await supabase.from('cooperative_commandes').select('*');
  //     setMembres(membres || []);
  //     setTresorerie(tresorerie || []);
  //     setCommandesGroupees(commandes || []);
  //   };
  //   loadData();
  // }, []);

  // Calculer le solde automatiquement
  useEffect(() => {
    const solde = calculerSolde();
    setSoldeActuel(solde);
  }, [tresorerie]);

  // TODO: Sync avec Supabase à chaque changement
  // useEffect(() => {
  //   if (membres.length > 0) {
  //     supabase.from('cooperative_membres').upsert(membres);
  //   }
  // }, [membres]);

  // useEffect(() => {
  //   if (tresorerie.length > 0) {
  //     supabase.from('cooperative_tresorerie').upsert(tresorerie);
  //   }
  // }, [tresorerie]);

  // useEffect(() => {
  //   if (commandesGroupees.length > 0) {
  //     supabase.from('cooperative_commandes').upsert(commandesGroupees);
  //   }
  // }, [commandesGroupees]);

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