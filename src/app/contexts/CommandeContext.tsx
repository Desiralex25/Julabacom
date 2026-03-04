import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Commande, 
  CommandeStatus, 
  CommandeScenario,
  NegotiationHistory,
  calculateMontantTotal,
  calculateTimeout24hOuvrees,
  isCommandeExpired,
  generateNumeroJulaba
} from '../types/julaba.types';
import { useWallet } from './WalletContext';

interface CommandeContextType {
  commandes: Commande[];
  
  // Création commandes (3 scénarios)
  creerCommandeDirecte: (buyerId: string, buyerName: string, sellerId: string, sellerName: string, productName: string, quantity: number, prixPropose: number) => Promise<Commande>;
  creerCommandeMarketplace: (buyerId: string, buyerName: string, buyerRole: 'marchand' | 'cooperative', recolteId: string, quantity: number) => Promise<Commande>;
  
  // Actions Producteur/Vendeur
  accepterCommande: (commandeId: string, userId: string) => Promise<void>;
  refuserCommande: (commandeId: string, userId: string, raison: string) => Promise<void>;
  contreProposerPrix: (commandeId: string, userId: string, nouveauPrix: number, message?: string) => Promise<void>;
  
  // Actions Acheteur (Marchand/Coop)
  accepterContreProposition: (commandeId: string, userId: string) => Promise<void>;
  refuserContreProposition: (commandeId: string, userId: string) => Promise<void>;
  reContreProposer: (commandeId: string, userId: string, nouveauPrix: number) => Promise<void>;
  
  // Paiement
  payerCommande: (commandeId: string, userId: string) => Promise<void>;
  
  // Livraison
  marquerLivree: (commandeId: string, producteurId: string, location?: { latitude: number; longitude: number }) => Promise<void>;
  annulerLivraison: (commandeId: string, producteurId: string, raison: string) => Promise<void>;
  confirmerReception: (commandeId: string, marchandId: string) => Promise<void>;
  
  // Récupération argent (Producteur)
  recupererPaiement: (commandeId: string, producteurId: string) => Promise<void>;
  
  // Helpers
  getCommandeById: (commandeId: string) => Commande | undefined;
  getCommandesByUser: (userId: string) => Commande[];
  getCommandesEnAttente: (sellerId: string) => Commande[];
  verifierTimeouts: () => void; // Vérifie et expire les commandes
}

const CommandeContext = createContext<CommandeContextType | undefined>(undefined);

// ── Données mock initiales : négociations de marchands en attente ──────────
const MOCK_COMMANDES_INITIALES: Commande[] = [
  {
    id: 'MOCK-NEG-001',
    numeroCommande: 'CMD-2026-0001',
    scenario: 'MARCHAND_TO_PRODUCTEUR' as any,
    buyerId: 'MARCH-001',
    buyerName: 'Koffi Marchand — Adjamé',
    buyerRole: 'marchand',
    sellerId: 'PROD-001',
    sellerName: 'Kouassi Producteur',
    sellerRole: 'producteur',
    productName: 'Tomate Grade A',
    quantity: 300,
    uniteProduit: 'kg',
    prixInitial: 350,
    prixNegocie: 290,
    prixFinal: 350,
    montantTotal: 87000,
    status: CommandeStatus.EN_ATTENTE,
    negotiationHistory: [{
      id: 'NEG-001-1', commandeId: 'MOCK-NEG-001', round: 1 as 1,
      proposerId: 'MARCH-001', proposerRole: 'marchand',
      prixPropose: 290,
      message: 'Bonjour ! Je prends 300 kg si tu m\'acceptes à 290 F/kg. Je suis client régulier et je paie cash à la livraison.',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    }],
    negotiationCount: 1,
    paymentStatus: 'PENDING',
    deliveryStatus: 'NOT_STARTED',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 21 * 3600000).toISOString(),
  },
  {
    id: 'MOCK-NEG-002',
    numeroCommande: 'CMD-2026-0002',
    scenario: 'MARCHAND_TO_PRODUCTEUR' as any,
    buyerId: 'MARCH-002',
    buyerName: 'Diabaté — Marché Treichville',
    buyerRole: 'marchand',
    sellerId: 'PROD-001',
    sellerName: 'Kouassi Producteur',
    sellerRole: 'producteur',
    productName: 'Plantain (régimes)',
    quantity: 50,
    uniteProduit: 'régimes',
    prixInitial: 2500,
    prixNegocie: 2100,
    prixFinal: 2500,
    montantTotal: 105000,
    status: CommandeStatus.EN_ATTENTE,
    negotiationHistory: [{
      id: 'NEG-002-1', commandeId: 'MOCK-NEG-002', round: 1 as 1,
      proposerId: 'MARCH-002', proposerRole: 'marchand',
      prixPropose: 2100,
      message: 'Mon ami producteur, je viens chercher moi-même au champ donc pas de transport. 2100 F par régime pour 50 régimes. Deal ?',
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    }],
    negotiationCount: 1,
    paymentStatus: 'PENDING',
    deliveryStatus: 'NOT_STARTED',
    createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 3600000).toISOString(),
  },
  {
    id: 'MOCK-NEG-003',
    numeroCommande: 'CMD-2026-0003',
    scenario: 'MARCHAND_TO_PRODUCTEUR' as any,
    buyerId: 'MARCH-003',
    buyerName: 'Awa Traoré — Resto Yopougon',
    buyerRole: 'marchand',
    sellerId: 'PROD-001',
    sellerName: 'Kouassi Producteur',
    sellerRole: 'producteur',
    productName: 'Maïs local',
    quantity: 200,
    uniteProduit: 'kg',
    prixInitial: 500,
    prixNegocie: 430,
    prixFinal: 500,
    montantTotal: 86000,
    status: CommandeStatus.EN_NEGOCIATION,
    negotiationHistory: [
      {
        id: 'NEG-003-1', commandeId: 'MOCK-NEG-003', round: 1 as 1,
        proposerId: 'MARCH-003', proposerRole: 'marchand',
        prixPropose: 430,
        message: 'Mon restaurant commande chaque semaine. Pour 200 kg, accepte 430 F/kg.',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
      {
        id: 'NEG-003-2', commandeId: 'MOCK-NEG-003', round: 2 as 2,
        proposerId: 'PROD-001', proposerRole: 'producteur',
        prixPropose: 470,
        message: 'Je ne peux pas descendre en dessous de 470 F/kg. C\'est mon prix de revient.',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
    ],
    negotiationCount: 2,
    paymentStatus: 'PENDING',
    deliveryStatus: 'NOT_STARTED',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 18 * 3600000).toISOString(),
  },
];

export function CommandeProvider({ children }: { children: ReactNode }) {
  const [commandes, setCommandes] = useState<Commande[]>(() => {
    // Charger depuis localStorage, sinon utiliser les mocks
    const stored = localStorage.getItem('julaba_commandes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Si le localStorage est vide ou ne contient pas les mocks, les ajouter
        if (parsed.length === 0) return MOCK_COMMANDES_INITIALES;
        // Vérifier si les mocks sont déjà présents
        const hasMocks = parsed.some((c: Commande) => c.id.startsWith('MOCK-NEG-'));
        if (!hasMocks) return [...MOCK_COMMANDES_INITIALES, ...parsed];
        return parsed;
      } catch {
        return MOCK_COMMANDES_INITIALES;
      }
    }
    return MOCK_COMMANDES_INITIALES;
  });
  const { bloquerArgent, libererArgent, rembourserArgent } = useWallet();
  
  let commandeCounter = 1;

  // Sauvegarder automatiquement
  useEffect(() => {
    localStorage.setItem('julaba_commandes', JSON.stringify(commandes));
  }, [commandes]);

  // Vérifier les timeouts toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      verifierTimeouts();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [commandes]);

  // Générer numéro commande
  const generateNumeroCommande = (): string => {
    const numero = `CMD-2024-${String(commandeCounter).padStart(4, '0')}`;
    commandeCounter++;
    localStorage.setItem('julaba_commande_counter', String(commandeCounter));
    return numero;
  };

  // 📝 Créer commande directe (Scénario 1 : Marchand → Producteur)
  const creerCommandeDirecte = async (
    buyerId: string,
    buyerName: string,
    sellerId: string,
    sellerName: string,
    productName: string,
    quantity: number,
    prixPropose: number
  ): Promise<Commande> => {
    const commande: Commande = {
      id: `CMD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      numeroCommande: generateNumeroCommande(),
      scenario: 'MARCHAND_TO_PRODUCTEUR',
      
      buyerId,
      buyerName,
      buyerRole: 'marchand',
      
      sellerId,
      sellerName,
      sellerRole: 'producteur',
      
      productName,
      quantity,
      uniteProduit: 'kg',
      
      prixInitial: prixPropose,
      prixFinal: prixPropose,
      montantTotal: calculateMontantTotal(quantity, prixPropose),
      
      status: CommandeStatus.EN_ATTENTE,
      negotiationHistory: [],
      negotiationCount: 0,
      
      paymentStatus: 'PENDING',
      deliveryStatus: 'NOT_STARTED',
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: calculateTimeout24hOuvrees(new Date()).toISOString(),
    };

    setCommandes([commande, ...commandes]);
    console.log(`✅ Commande créée : ${commande.numeroCommande}`);
    
    return commande;
  };

  // 🛒 Créer commande marketplace (Scénario 2 & 3)
  const creerCommandeMarketplace = async (
    buyerId: string,
    buyerName: string,
    buyerRole: 'marchand' | 'cooperative',
    recolteId: string,
    quantity: number
  ): Promise<Commande> => {
    // TODO: Récupérer info récolte depuis RecolteContext
    // Pour l'instant, mock
    const mockRecolte = {
      producteurId: 'PROD-001',
      producteurName: 'Jean Kouassi',
      produit: 'Tomate',
      prixUnitaire: 500,
    };

    const commande: Commande = {
      id: `CMD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      numeroCommande: generateNumeroCommande(),
      scenario: 'MARKETPLACE_PRODUCTEUR',
      
      buyerId,
      buyerName,
      buyerRole,
      
      sellerId: mockRecolte.producteurId,
      sellerName: mockRecolte.producteurName,
      sellerRole: 'producteur',
      
      productName: mockRecolte.produit,
      quantity,
      uniteProduit: 'kg',
      
      prixInitial: mockRecolte.prixUnitaire,
      prixFinal: mockRecolte.prixUnitaire,
      montantTotal: calculateMontantTotal(quantity, mockRecolte.prixUnitaire),
      
      status: CommandeStatus.EN_ATTENTE,
      negotiationHistory: [],
      negotiationCount: 0,
      
      paymentStatus: 'PENDING',
      deliveryStatus: 'NOT_STARTED',
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: calculateTimeout24hOuvrees(new Date()).toISOString(),
    };

    setCommandes([commande, ...commandes]);
    console.log(`✅ Commande marketplace créée : ${commande.numeroCommande}`);
    
    return commande;
  };

  // ✅ Accepter commande (Producteur)
  const accepterCommande = async (commandeId: string, userId: string) => {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) throw new Error('Commande introuvable');
    if (commande.sellerId !== userId) throw new Error('Non autorisé');
    if (commande.status !== CommandeStatus.EN_ATTENTE) throw new Error('Commande déjà traitée');

    const updated: Commande = {
      ...commande,
      status: CommandeStatus.ACCEPTEE,
      updatedAt: new Date().toISOString(),
    };

    setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
    console.log(`✅ Commande ${commande.numeroCommande} acceptée par ${userId}`);
  };

  // ❌ Refuser commande (Producteur)
  const refuserCommande = async (commandeId: string, userId: string, raison: string) => {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) throw new Error('Commande introuvable');
    if (commande.sellerId !== userId) throw new Error('Non autorisé');
    if (commande.status !== CommandeStatus.EN_ATTENTE) throw new Error('Commande déjà traitée');

    const updated: Commande = {
      ...commande,
      status: CommandeStatus.REFUSEE,
      cancellationReason: raison,
      updatedAt: new Date().toISOString(),
    };

    setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
    console.log(`❌ Commande ${commande.numeroCommande} refusée : ${raison}`);
  };

  // 🔄 Contre-proposer prix (Producteur)
  const contreProposerPrix = async (
    commandeId: string,
    userId: string,
    nouveauPrix: number,
    message?: string
  ) => {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) throw new Error('Commande introuvable');
    if (commande.sellerId !== userId) throw new Error('Non autorisé');
    if (commande.status !== CommandeStatus.EN_ATTENTE && commande.status !== CommandeStatus.EN_NEGOCIATION) {
      throw new Error('Négociation impossible');
    }
    if (commande.negotiationCount >= 2) throw new Error('Maximum 2 allers-retours atteints');

    const negotiation: NegotiationHistory = {
      id: `NEG-${Date.now()}`,
      commandeId,
      round: (commande.negotiationCount + 1) as 1 | 2,
      proposerId: userId,
      proposerRole: 'producteur',
      prixPropose: nouveauPrix,
      message,
      createdAt: new Date().toISOString(),
    };

    const updated: Commande = {
      ...commande,
      status: CommandeStatus.EN_NEGOCIATION,
      prixNegocie: nouveauPrix,
      negotiationHistory: [...commande.negotiationHistory, negotiation],
      negotiationCount: commande.negotiationCount + 1,
      updatedAt: new Date().toISOString(),
      expiresAt: calculateTimeout24hOuvrees(new Date()).toISOString(), // Nouveau timeout
    };

    setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
    console.log(`🔄 Contre-proposition : ${nouveauPrix} FCFA/kg`);
  };

  // ✅ Accepter contre-proposition (Marchand)
  const accepterContreProposition = async (commandeId: string, userId: string) => {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) throw new Error('Commande introuvable');
    if (commande.buyerId !== userId) throw new Error('Non autorisé');
    if (commande.status !== CommandeStatus.EN_NEGOCIATION) throw new Error('Pas de négociation en cours');

    const dernierNego = commande.negotiationHistory[commande.negotiationHistory.length - 1];
    dernierNego.response = 'ACCEPTED';
    dernierNego.respondedAt = new Date().toISOString();

    const updated: Commande = {
      ...commande,
      status: CommandeStatus.CONTRE_PROPOSITION_ACCEPTEE,
      prixFinal: commande.prixNegocie || commande.prixInitial,
      montantTotal: calculateMontantTotal(commande.quantity, commande.prixNegocie || commande.prixInitial),
      negotiationHistory: [...commande.negotiationHistory.slice(0, -1), dernierNego],
      updatedAt: new Date().toISOString(),
    };

    // Transition automatique vers ACCEPTEE
    updated.status = CommandeStatus.ACCEPTEE;

    setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
    console.log(`✅ Contre-proposition acceptée`);
  };

  // ❌ Refuser contre-proposition (Marchand)
  const refuserContreProposition = async (commandeId: string, userId: string) => {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) throw new Error('Commande introuvable');
    if (commande.buyerId !== userId) throw new Error('Non autorisé');
    if (commande.status !== CommandeStatus.EN_NEGOCIATION) throw new Error('Pas de négociation en cours');

    const dernierNego = commande.negotiationHistory[commande.negotiationHistory.length - 1];
    dernierNego.response = 'REJECTED';
    dernierNego.respondedAt = new Date().toISOString();

    const updated: Commande = {
      ...commande,
      status: CommandeStatus.ANNULEE,
      cancellationReason: 'Contre-proposition refusée',
      negotiationHistory: [...commande.negotiationHistory.slice(0, -1), dernierNego],
      updatedAt: new Date().toISOString(),
    };

    setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
    console.log(`❌ Contre-proposition refusée → Commande annulée`);
  };

  // 🔄 Re-contre-proposer (Marchand, max 2 fois)
  const reContreProposer = async (commandeId: string, userId: string, nouveauPrix: number) => {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) throw new Error('Commande introuvable');
    if (commande.buyerId !== userId) throw new Error('Non autorisé');
    if (commande.status !== CommandeStatus.EN_NEGOCIATION) throw new Error('Pas de négociation en cours');
    if (commande.negotiationCount >= 2) throw new Error('Maximum 2 allers-retours');

    const negotiation: NegotiationHistory = {
      id: `NEG-${Date.now()}`,
      commandeId,
      round: (commande.negotiationCount + 1) as 1 | 2,
      proposerId: userId,
      proposerRole: 'marchand',
      prixPropose: nouveauPrix,
      createdAt: new Date().toISOString(),
    };

    const updated: Commande = {
      ...commande,
      prixNegocie: nouveauPrix,
      negotiationHistory: [...commande.negotiationHistory, negotiation],
      negotiationCount: commande.negotiationCount + 1,
      updatedAt: new Date().toISOString(),
      expiresAt: calculateTimeout24hOuvrees(new Date()).toISOString(),
    };

    setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
    console.log(`🔄 Re-contre-proposition Marchand : ${nouveauPrix} FCFA/kg`);
  };

  // 💳 Payer commande (Marchand)
  const payerCommande = async (commandeId: string, userId: string) => {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) throw new Error('Commande introuvable');
    if (commande.buyerId !== userId) throw new Error('Non autorisé');
    if (commande.status !== CommandeStatus.ACCEPTEE) throw new Error('Commande pas encore acceptée');

    // Bloquer argent en escrow
    const escrowId = await bloquerArgent(commandeId, commande.montantTotal, commande.sellerId);

    const updated: Commande = {
      ...commande,
      status: CommandeStatus.PAYEE,
      paymentStatus: 'PAID',
      escrowId,
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
    console.log(`💳 Commande ${commande.numeroCommande} payée : ${commande.montantTotal} FCFA`);
  };

  // 🚚 Marquer livrée (Producteur)
  const marquerLivree = async (
    commandeId: string,
    producteurId: string,
    location?: { latitude: number; longitude: number }
  ) => {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) throw new Error('Commande introuvable');
    if (commande.sellerId !== producteurId) throw new Error('Non autorisé');
    if (commande.status !== CommandeStatus.PAYEE) throw new Error('Commande pas encore payée');

    const updated: Commande = {
      ...commande,
      status: CommandeStatus.EN_ATTENTE_CONFIRMATION_MARCHAND,
      deliveryStatus: 'IN_PROGRESS',
      producerMarkedDeliveredAt: new Date().toISOString(),
      deliveryLocation: location,
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Timeout 48h
    };

    setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
    console.log(`🚚 Producteur a marqué la commande ${commande.numeroCommande} comme livrée`);
  };

  // 🔙 Annuler livraison (Producteur si erreur)
  const annulerLivraison = async (commandeId: string, producteurId: string, raison: string) => {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) throw new Error('Commande introuvable');
    if (commande.sellerId !== producteurId) throw new Error('Non autorisé');
    if (commande.status !== CommandeStatus.EN_ATTENTE_CONFIRMATION_MARCHAND) {
      throw new Error('Impossible d\'annuler');
    }

    const updated: Commande = {
      ...commande,
      status: CommandeStatus.PAYEE, // Retour à PAYEE
      deliveryStatus: 'NOT_STARTED',
      producerMarkedDeliveredAt: undefined,
      cancellationReason: raison,
      updatedAt: new Date().toISOString(),
      expiresAt: undefined, // Annule le timeout 48h
    };

    setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
    console.log(`🔙 Livraison annulée : ${raison}`);
  };

  // ✅ Confirmer réception (Marchand)
  const confirmerReception = async (commandeId: string, marchandId: string) => {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) throw new Error('Commande introuvable');
    if (commande.buyerId !== marchandId) throw new Error('Non autorisé');
    if (commande.status !== CommandeStatus.EN_ATTENTE_CONFIRMATION_MARCHAND) {
      throw new Error('Livraison pas encore déclarée');
    }

    // Libérer l'escrow (argent reste bloqué jusqu'à récupération manuelle)
    if (commande.escrowId) {
      await libererArgent(commande.escrowId, commande.sellerId);
    }

    const updated: Commande = {
      ...commande,
      status: CommandeStatus.LIVREE,
      deliveryStatus: 'CONFIRMED',
      buyerConfirmedAt: new Date().toISOString(),
      paymentStatus: 'RELEASED',
      updatedAt: new Date().toISOString(),
      expiresAt: undefined,
    };

    setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
    console.log(`✅ Marchand a confirmé la réception de ${commande.numeroCommande}`);
  };

  // 💰 Récupérer paiement (Producteur clique "Récupérer l'argent")
  const recupererPaiement = async (commandeId: string, producteurId: string) => {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) throw new Error('Commande introuvable');
    if (commande.sellerId !== producteurId) throw new Error('Non autorisé');
    if (commande.status !== CommandeStatus.LIVREE) throw new Error('Livraison pas encore confirmée');
    if (commande.paymentStatus !== 'RELEASED') throw new Error('Paiement pas encore libéré');

    // Cette action sera gérée par le WalletContext (recupererArgent)
    // On marque juste la commande comme TERMINEE

    const updated: Commande = {
      ...commande,
      status: CommandeStatus.TERMINEE,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
    console.log(`💰 Producteur a récupéré le paiement de ${commande.numeroCommande}`);
  };

  // 🕐 Vérifier les timeouts
  const verifierTimeouts = () => {
    const now = new Date();
    
    commandes.forEach(commande => {
      if (!commande.expiresAt) return;
      
      const expired = new Date(commande.expiresAt) < now;
      
      if (expired) {
        if (commande.status === CommandeStatus.EN_ATTENTE) {
          // Timeout 24h : Producteur n'a pas répondu
          const updated: Commande = {
            ...commande,
            status: CommandeStatus.EXPIREE,
            updatedAt: new Date().toISOString(),
          };
          
          setCommandes(prev => prev.map(c => c.id === commande.id ? updated : c));
          console.log(`⏰ Commande ${commande.numeroCommande} expirée (timeout 24h)`);
        }
        
        if (commande.status === CommandeStatus.EN_NEGOCIATION) {
          // Timeout négociation : Contre-proposition auto-rejetée
          const updated: Commande = {
            ...commande,
            status: CommandeStatus.EXPIREE,
            cancellationReason: 'Timeout négociation (24h)',
            updatedAt: new Date().toISOString(),
          };
          
          setCommandes(prev => prev.map(c => c.id === commande.id ? updated : c));
          console.log(`⏰ Négociation ${commande.numeroCommande} expirée`);
        }
        
        if (commande.status === CommandeStatus.EN_ATTENTE_CONFIRMATION_MARCHAND) {
          // Timeout 48h : Marchand n'a pas confirmé → Retour à ACCEPTEE
          const updated: Commande = {
            ...commande,
            status: CommandeStatus.ACCEPTEE,
            deliveryStatus: 'NOT_STARTED',
            producerMarkedDeliveredAt: undefined,
            cancellationReason: 'Timeout confirmation marchand (48h)',
            updatedAt: new Date().toISOString(),
            expiresAt: undefined,
          };
          
          setCommandes(prev => prev.map(c => c.id === commande.id ? updated : c));
          console.log(`⏰ Timeout confirmation ${commande.numeroCommande} → Retour ACCEPTEE`);
        }
      }
    });
  };

  // Helpers
  const getCommandeById = (commandeId: string) => {
    return commandes.find(c => c.id === commandeId);
  };

  const getCommandesByUser = (userId: string) => {
    return commandes.filter(c => c.buyerId === userId || c.sellerId === userId);
  };

  const getCommandesEnAttente = (sellerId: string) => {
    return commandes.filter(
      c => c.sellerId === sellerId && c.status === CommandeStatus.EN_ATTENTE
    );
  };

  const value: CommandeContextType = {
    commandes,
    creerCommandeDirecte,
    creerCommandeMarketplace,
    accepterCommande,
    refuserCommande,
    contreProposerPrix,
    accepterContreProposition,
    refuserContreProposition,
    reContreProposer,
    payerCommande,
    marquerLivree,
    annulerLivraison,
    confirmerReception,
    recupererPaiement,
    getCommandeById,
    getCommandesByUser,
    getCommandesEnAttente,
    verifierTimeouts,
  };

  return <CommandeContext.Provider value={value}>{children}</CommandeContext.Provider>;
}

export function useCommande() {
  const context = useContext(CommandeContext);
  if (context === undefined) {
    throw new Error('useCommande doit être utilisé dans un CommandeProvider');
  }
  return context;
}