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

// ✅ MOCK DATA SUPPRIMÉS - Migration Supabase en cours

export function CommandeProvider({ children }: { children: ReactNode }) {
  // ✅ SUPPRESSION localStorage et MOCK - Migration Supabase
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const { bloquerArgent, libererArgent, rembourserArgent } = useWallet();
  
  let commandeCounter = 1;

  // TODO: Charger les commandes depuis Supabase au mount
  // useEffect(() => {
  //   const loadCommandes = async () => {
  //     const data = await supabase.from('commandes').select('*');
  //     setCommandes(data);
  //   };
  //   loadCommandes();
  // }, []);

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
    // TODO: Gérer le compteur via Supabase sequence
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