import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationsContext';

// Types
export type CycleStatus = 'draft' | 'active' | 'completed';
export type RecolteQuality = 'A' | 'B' | 'C';
export type RecolteStatus = 'draft' | 'published' | 'partially_sold' | 'sold_out';
export type CommandeStatus = 'new' | 'accepted' | 'preparing' | 'delivered' | 'closed' | 'disputed';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type NegociationStatut = 'en_attente' | 'acceptee' | 'refusee' | 'contre_offre';

export interface NegociationPrix {
  prixPropose: number;       // prix/kg proposé par le marchand
  message: string;           // message du marchand
  statut: NegociationStatut;
  contreOffre?: number;      // contre-proposition du producteur
  dateProposition: Date;
}

export interface CycleAgricole {
  id: string;
  culture: string;
  surface: number; // en hectares
  datePlantation: Date;
  dateRecolteEstimee: Date;
  quantiteEstimee: number; // en kg
  status: CycleStatus;
  createdAt: Date;
}

export interface Recolte {
  id: string;
  cycleId: string;
  quantiteReelle: number; // en kg
  qualite: RecolteQuality;
  prixUnitaire: number; // FCFA par kg
  photos: string[];
  status: RecolteStatus;
  stockDisponible: number; // kg non vendus
  stockReserve: number; // kg réservés dans commandes
  stockVendu: number; // kg vendus
  createdAt: Date;
  publishedAt?: Date;
}

export interface Commande {
  id: string;
  recolteId: string;
  produit: string;
  quantite: number;
  montant: number;
  acheteur: {
    nom: string;
    phone: string;
    telephone?: string;
    adresse?: string;
    type: 'marchand' | 'cooperative';
  };
  status: CommandeStatus;
  paymentStatus: PaymentStatus;
  paymentMode?: string;
  dateCommande: Date;
  datePreparation?: Date;
  dateReception?: Date;
  negociation?: NegociationPrix;
  litige?: {
    motif: string;
    pieceJointe?: string;
    decision?: string;
  };
}

export interface PublicationOffre {
  id: string;
  recolteId: string;
  cycleId: string;
  produit: string;
  quantiteDisponible: number;
  stockDisponible: number;
  prixUnitaire: number;
  qualite: RecolteQuality;
  photos: string[];
  datePublication: Date;
  dateExpiration: Date;
  isActive: boolean;
}

export interface ProducteurStats {
  productionTotale: number; // kg
  revenusTotaux: number; // FCFA
  volumeVendu: number; // kg
  tauxConversion: number; // %
  delaiMoyenLivraison: number; // jours
  noteMoyenne: number; // /5
  scoreProducteur: number; // /100
  tauxRespectDelais: number; // %
}

interface ProducteurContextType {
  // Cycles agricoles
  cycles: CycleAgricole[];
  addCycle: (cycle: Omit<CycleAgricole, 'id' | 'createdAt'>) => void;
  updateCycle: (id: string, updates: Partial<CycleAgricole>) => void;
  deleteCycle: (id: string) => void;
  
  // Récoltes
  recoltes: Recolte[];
  addRecolte: (recolte: Omit<Recolte, 'id' | 'createdAt' | 'stockDisponible' | 'stockReserve' | 'stockVendu'>) => void;
  updateRecolte: (id: string, updates: Partial<Recolte>) => void;
  publishRecolte: (id: string) => void;
  
  // Commandes
  commandes: Commande[];
  updateCommandeStatus: (id: string, status: CommandeStatus) => void;
  updateNegociation: (commandeId: string, statut: NegociationStatut, contreOffre?: number) => void;
  addLitige: (commandeId: string, motif: string, pieceJointe?: string) => void;
  
  // Publications
  publications: PublicationOffre[];
  createPublication: (recolteId: string, dureeJours: number) => void;
  updatePublication: (id: string, updates: Partial<PublicationOffre>) => void;
  
  // Stats
  stats: ProducteurStats;
  refreshStats: () => void;
  
  // Alertes
  alertes: {
    recoltesProches: CycleAgricole[];
    stocksFaibles: Recolte[];
    commandesRetard: Commande[];
    paiementsAttente: Commande[];
  };
}

const ProducteurContext = createContext<ProducteurContextType | undefined>(undefined);

// ✅ MOCK DATA SUPPRIMÉS - Migration Supabase
/* const MOCK_CYCLES: CycleAgricole[] = [
  {
    id: '1',
    culture: 'Tomate',
    surface: 2.5,
    datePlantation: new Date('2026-01-15'),
    dateRecolteEstimee: new Date('2026-04-15'),
    quantiteEstimee: 5000,
    status: 'active',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '2',
    culture: 'Aubergine',
    surface: 1.5,
    datePlantation: new Date('2026-02-01'),
    dateRecolteEstimee: new Date('2026-05-01'),
    quantiteEstimee: 3000,
    status: 'active',
    createdAt: new Date('2026-02-01'),
  },
  {
    id: '3',
    culture: 'Piment',
    surface: 1.0,
    datePlantation: new Date('2025-12-10'),
    dateRecolteEstimee: new Date('2026-03-10'),
    quantiteEstimee: 2000,
    status: 'active',
    createdAt: new Date('2025-12-10'),
  },
  {
    id: '4',
    culture: 'Gombo',
    surface: 2.0,
    datePlantation: new Date('2026-01-20'),
    dateRecolteEstimee: new Date('2026-04-20'),
    quantiteEstimee: 3500,
    status: 'active',
    createdAt: new Date('2026-01-20'),
  },
  {
    id: '5',
    culture: 'Manioc',
    surface: 3.0,
    datePlantation: new Date('2025-09-01'),
    dateRecolteEstimee: new Date('2026-03-01'),
    quantiteEstimee: 8000,
    status: 'completed',
    createdAt: new Date('2025-09-01'),
  },
  {
    id: '6',
    culture: 'Igname',
    surface: 2.5,
    datePlantation: new Date('2025-10-15'),
    dateRecolteEstimee: new Date('2026-04-15'),
    quantiteEstimee: 6000,
    status: 'active',
    createdAt: new Date('2025-10-15'),
  },
  {
    id: '7',
    culture: 'Maïs',
    surface: 4.0,
    datePlantation: new Date('2025-11-01'),
    dateRecolteEstimee: new Date('2026-03-15'),
    quantiteEstimee: 10000,
    status: 'active',
    createdAt: new Date('2025-11-01'),
  },
  {
    id: '8',
    culture: 'Oignon',
    surface: 1.5,
    datePlantation: new Date('2025-12-20'),
    dateRecolteEstimee: new Date('2026-04-20'),
    quantiteEstimee: 3500,
    status: 'active',
    createdAt: new Date('2025-12-20'),
  },
];

const MOCK_RECOLTES: Recolte[] = [
  {
    id: '1',
    cycleId: '1',
    quantiteReelle: 4800,
    qualite: 'A',
    prixUnitaire: 350,
    photos: ['/images/produit-tomate.png'],
    status: 'published',
    stockDisponible: 3200,
    stockReserve: 800,
    stockVendu: 800,
    createdAt: new Date('2026-02-20'),
    publishedAt: new Date('2026-02-20'),
  },
  {
    id: '2',
    cycleId: '2',
    quantiteReelle: 2900,
    qualite: 'A',
    prixUnitaire: 400,
    photos: ['/images/produit-aubergine.png'],
    status: 'draft',
    stockDisponible: 2900,
    stockReserve: 0,
    stockVendu: 0,
    createdAt: new Date('2026-02-25'),
  },
  {
    id: '3',
    cycleId: '3',
    quantiteReelle: 1850,
    qualite: 'A',
    prixUnitaire: 600,
    photos: ['/images/produit-piment.png'],
    status: 'draft',
    stockDisponible: 1850,
    stockReserve: 0,
    stockVendu: 0,
    createdAt: new Date('2026-02-15'),
  },
  {
    id: '4',
    cycleId: '4',
    quantiteReelle: 3400,
    qualite: 'B',
    prixUnitaire: 300,
    photos: ['/images/produit-gombo.png'],
    status: 'draft',
    stockDisponible: 3400,
    stockReserve: 0,
    stockVendu: 0,
    createdAt: new Date('2026-02-22'),
  },
  {
    id: '5',
    cycleId: '5',
    quantiteReelle: 7800,
    qualite: 'A',
    prixUnitaire: 200,
    photos: ['/images/produit-manioc.png'],
    status: 'draft',
    stockDisponible: 7800,
    stockReserve: 0,
    stockVendu: 0,
    createdAt: new Date('2026-02-28'),
  },
  {
    id: '6',
    cycleId: '6',
    quantiteReelle: 5900,
    qualite: 'A',
    prixUnitaire: 250,
    photos: ['/images/produit-igname.png'],
    status: 'draft',
    stockDisponible: 5900,
    stockReserve: 0,
    stockVendu: 0,
    createdAt: new Date('2026-02-26'),
  },
  {
    id: '7',
    cycleId: '7',
    quantiteReelle: 9500,
    qualite: 'B',
    prixUnitaire: 180,
    photos: ['/images/produit-mais.png'],
    status: 'draft',
    stockDisponible: 9500,
    stockReserve: 0,
    stockVendu: 0,
    createdAt: new Date('2026-02-18'),
  },
  {
    id: '8',
    cycleId: '8',
    quantiteReelle: 3300,
    qualite: 'A',
    prixUnitaire: 450,
    photos: ['/images/produit-oignon.png'],
    status: 'draft',
    stockDisponible: 3300,
    stockReserve: 0,
    stockVendu: 0,
    createdAt: new Date('2026-02-24'),
  },
];

const MOCK_COMMANDES: Commande[] = [
  {
    id: '1',
    recolteId: '1',
    produit: 'Tomate Grade A',
    quantite: 500,
    montant: 175000,
    acheteur: {
      nom: 'Marché Adjamé',
      phone: '+225 07 01 02 03 04',
      telephone: '+225 07 01 02 03 04',
      adresse: 'Adjamé, Abidjan',
      type: 'marchand',
    },
    status: 'accepted',
    paymentStatus: 'paid',
    paymentMode: 'Mobile Money',
    dateCommande: new Date('2026-02-25'),
  },
  {
    id: '2',
    recolteId: '1',
    produit: 'Tomate Grade A',
    quantite: 300,
    montant: 105000,
    acheteur: {
      nom: 'Coop Bio Abidjan',
      phone: '+225 07 05 06 07 08',
      telephone: '+225 07 05 06 07 08',
      adresse: 'Cocody, Abidjan',
      type: 'cooperative',
    },
    status: 'new',
    paymentStatus: 'pending',
    dateCommande: new Date('2026-02-28'),
    negociation: {
      prixPropose: 310,
      message: 'Bonjour ! Je prends 300 kg si tu me fais à 310 F/kg au lieu de 350 F. Je suis client régulier et je paie cash.',
      statut: 'en_attente',
      dateProposition: new Date('2026-03-01T08:30:00'),
    },
  },
  {
    id: '3',
    recolteId: '2',
    produit: 'Aubergine Grade B',
    quantite: 200,
    montant: 60000,
    acheteur: {
      nom: 'Koffi Marché Central',
      phone: '+225 07 09 10 11 12',
      telephone: '+225 07 09 10 11 12',
      adresse: 'Plateau, Abidjan',
      type: 'marchand',
    },
    status: 'new',
    paymentStatus: 'pending',
    dateCommande: new Date('2026-03-01'),
    negociation: {
      prixPropose: 270,
      message: 'Ami producteur, je commande souvent chez toi. Pour 200 kg, peux-tu me faire 270 F/kg ? Je viens chercher directement au champ, pas besoin de livraison.',
      statut: 'en_attente',
      dateProposition: new Date('2026-03-02T10:15:00'),
    },
  },
  {
    id: '4',
    recolteId: '1',
    produit: 'Tomate Grade A',
    quantite: 150,
    montant: 48000,
    acheteur: {
      nom: 'Awa Traoré Resto',
      phone: '+225 07 13 14 15 16',
      telephone: '+225 07 13 14 15 16',
      adresse: 'Yopougon, Abidjan',
      type: 'marchand',
    },
    status: 'preparing',
    paymentStatus: 'pending',
    dateCommande: new Date('2026-02-27'),
    negociation: {
      prixPropose: 280,
      message: 'Je voudrais 150 kg à 280 F/kg. Mon restaurant commande chaque semaine.',
      statut: 'contre_offre',
      contreOffre: 320,
      dateProposition: new Date('2026-02-26T14:00:00'),
    },
  },
]; */

export function ProducteurProvider({ children }: { children: ReactNode }) {
  const [cycles, setCycles] = useState<CycleAgricole[]>([]);
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [publications, setPublications] = useState<PublicationOffre[]>([]);
  const [stats, setStats] = useState<ProducteurStats>({
    productionTotale: 4800,
    revenusTotaux: 280000,
    volumeVendu: 800,
    tauxConversion: 75,
    delaiMoyenLivraison: 2,
    noteMoyenne: 4.5,
    scoreProducteur: 85,
    tauxRespectDelais: 92,
  });

  const { user } = useUser();
  const notifications = useNotifications();
  const alertedCyclesRef = useRef<Set<string>>(new Set());

  // ── Détection automatique cycles proches (≤7 jours) ────────
  useEffect(() => {
    if (!user?.id || user.role !== 'producteur') return;

    cycles.forEach(cycle => {
      if (cycle.status !== 'active') return;
      const joursRestants = Math.floor(
        (cycle.dateRecolteEstimee.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (joursRestants <= 7 && joursRestants >= 0 && !alertedCyclesRef.current.has(cycle.id)) {
        alertedCyclesRef.current.add(cycle.id);
        notifications.triggerRecolteProche(user.id, cycle.culture, joursRestants);
      }
      // Réinitialiser si la récolte est terminée
      if (cycle.status === 'completed') {
        alertedCyclesRef.current.delete(cycle.id);
      }
    });
  }, [cycles, user?.id, user?.role]);

  // Calculer les alertes
  const alertes = {
    recoltesProches: cycles.filter(c => {
      const daysUntilHarvest = Math.floor((c.dateRecolteEstimee.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilHarvest <= 7 && c.status === 'active';
    }),
    stocksFaibles: recoltes.filter(r => r.stockDisponible < r.quantiteReelle * 0.2 && r.status === 'published'),
    commandesRetard: commandes.filter(c => {
      if (!c.datePreparation) return false;
      const daysLate = Math.floor((Date.now() - c.datePreparation.getTime()) / (1000 * 60 * 60 * 24));
      return daysLate > 3 && c.status !== 'delivered';
    }),
    paiementsAttente: commandes.filter(c => c.paymentStatus === 'pending'),
  };

  // Fonctions Cycles
  const addCycle = (cycleData: Omit<CycleAgricole, 'id' | 'createdAt'>) => {
    const newCycle: CycleAgricole = {
      ...cycleData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setCycles(prev => [newCycle, ...prev]);
  };

  const updateCycle = (id: string, updates: Partial<CycleAgricole>) => {
    setCycles(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCycle = (id: string) => {
    setCycles(prev => prev.filter(c => c.id !== id));
  };

  // Fonctions Récoltes
  const addRecolte = (recolteData: Omit<Recolte, 'id' | 'createdAt' | 'stockDisponible' | 'stockReserve' | 'stockVendu'>) => {
    const newRecolte: Recolte = {
      ...recolteData,
      id: Date.now().toString(),
      stockDisponible: recolteData.quantiteReelle,
      stockReserve: 0,
      stockVendu: 0,
      createdAt: new Date(),
    };
    setRecoltes(prev => [newRecolte, ...prev]);
  };

  const updateRecolte = (id: string, updates: Partial<Recolte>) => {
    setRecoltes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const publishRecolte = (id: string) => {
    setRecoltes(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'published' as RecolteStatus, publishedAt: new Date() } : r
    ));
  };

  // Fonctions Commandes
  const updateCommandeStatus = (id: string, status: CommandeStatus) => {
    setCommandes(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const updateNegociation = (commandeId: string, statut: NegociationStatut, contreOffre?: number) => {
    setCommandes(prev => prev.map(c =>
      c.id === commandeId && c.negociation
        ? { ...c, negociation: { ...c.negociation, statut, ...(contreOffre !== undefined ? { contreOffre } : {}) } }
        : c
    ));
  };

  const addLitige = (commandeId: string, motif: string, pieceJointe?: string) => {
    setCommandes(prev => prev.map(c => 
      c.id === commandeId 
        ? { ...c, status: 'disputed' as CommandeStatus, litige: { motif, pieceJointe } }
        : c
    ));
  };

  // Fonctions Publications
  const createPublication = (recolteId: string, dureeJours: number) => {
    const recolte = recoltes.find(r => r.id === recolteId);
    if (!recolte) return;

    const cycle = cycles.find(c => c.id === recolte.cycleId);
    if (!cycle) return;

    const newPublication: PublicationOffre = {
      id: Date.now().toString(),
      recolteId,
      cycleId: cycle.id,
      produit: cycle.culture,
      quantiteDisponible: recolte.stockDisponible,
      stockDisponible: recolte.stockDisponible,
      prixUnitaire: recolte.prixUnitaire,
      qualite: recolte.qualite,
      photos: recolte.photos,
      datePublication: new Date(),
      dateExpiration: new Date(Date.now() + dureeJours * 24 * 60 * 60 * 1000),
      isActive: true,
    };

    setPublications(prev => [newPublication, ...prev]);
  };

  const updatePublication = (id: string, updates: Partial<PublicationOffre>) => {
    setPublications(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Rafraîchir les stats
  const refreshStats = () => {
    const totalProduction = recoltes.reduce((sum, r) => sum + r.quantiteReelle, 0);
    const totalVendu = recoltes.reduce((sum, r) => sum + r.stockVendu, 0);
    const totalRevenus = commandes
      .filter(c => c.paymentStatus === 'paid')
      .reduce((sum, c) => sum + c.montant, 0);

    setStats(prev => ({
      ...prev,
      productionTotale: totalProduction,
      volumeVendu: totalVendu,
      revenusTotaux: totalRevenus,
      tauxConversion: totalProduction > 0 ? Math.round((totalVendu / totalProduction) * 100) : 0,
    }));
  };

  return (
    <ProducteurContext.Provider
      value={{
        cycles,
        addCycle,
        updateCycle,
        deleteCycle,
        recoltes,
        addRecolte,
        updateRecolte,
        publishRecolte,
        commandes,
        updateCommandeStatus,
        updateNegociation,
        addLitige,
        publications,
        createPublication,
        updatePublication,
        stats,
        refreshStats,
        alertes,
      }}
    >
      {children}
    </ProducteurContext.Provider>
  );
}

export function useProducteur() {
  const context = useContext(ProducteurContext);
  if (!context) {
    throw new Error('useProducteur must be used within ProducteurProvider');
  }
  return context;
}