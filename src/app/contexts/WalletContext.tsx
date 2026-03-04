import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WalletAccount, 
  WalletTransaction, 
  WalletTransactionType,
  EscrowPayment 
} from '../types/julaba.types';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationsContext';
import { NotifRole } from './NotificationsContext';

interface WalletContextType {
  // Compte wallet
  wallet: WalletAccount | null;
  
  // Transactions
  transactions: WalletTransaction[];
  escrowPayments: EscrowPayment[];
  
  // Actions wallet
  rechargerWallet: (montant: number, provider: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE', reference: string) => Promise<void>;
  retirerWallet: (montant: number, provider: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE') => Promise<void>;
  
  // Actions commandes (escrow)
  bloquerArgent: (commandeId: string, montant: number, receiverId: string) => Promise<string>; // Retourne escrowId
  libererArgent: (escrowId: string, receiverId: string) => Promise<void>;
  rembourserArgent: (escrowId: string, payerId: string) => Promise<void>;
  
  // Récupération argent (action manuelle Producteur)
  recupererArgent: (escrowId: string) => Promise<void>;
  
  // Helpers
  getBalance: () => number;
  getEscrowBalance: () => number;
  getAvailableBalance: () => number; // balance - escrowBalance
  canAfford: (montant: number) => boolean;
  
  // Historique
  getTransactionHistory: (limit?: number) => WalletTransaction[];
  getPendingEscrows: () => EscrowPayment[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [escrowPayments, setEscrowPayments] = useState<EscrowPayment[]>([]);

  // Clés scopées par userId — isolation totale entre comptes
  const walletKey   = user?.id ? `julaba_wallet_${user.id}` : null;
  const txKey       = user?.id ? `julaba_wallet_txns_${user.id}` : null;
  const escrowKey   = user?.id ? `julaba_wallet_escrow_${user.id}` : null;

  // Chargement/reset au changement d'userId
  useEffect(() => {
    if (!user?.id) {
      setWallet(null);
      setTransactions([]);
      setEscrowPayments([]);
      return;
    }

    const storedWallet       = walletKey   ? localStorage.getItem(walletKey)   : null;
    const storedTransactions = txKey       ? localStorage.getItem(txKey)       : null;
    const storedEscrows      = escrowKey   ? localStorage.getItem(escrowKey)   : null;

    if (storedWallet) {
      setWallet(JSON.parse(storedWallet));
    } else {
      // Initialiser un nouveau wallet pour cet utilisateur
      const newWallet: WalletAccount = {
        userId: user.id,
        balance: 0,
        currency: 'FCFA',
        escrowBalance: 0,
        totalReceived: 0,
        totalSent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setWallet(newWallet);
      if (walletKey) localStorage.setItem(walletKey, JSON.stringify(newWallet));
    }

    setTransactions(storedTransactions ? JSON.parse(storedTransactions) : []);
    setEscrowPayments(storedEscrows ? JSON.parse(storedEscrows) : []);
  }, [user?.id]);

  // Sauvegarde automatique — scopée par userId
  useEffect(() => {
    if (wallet && walletKey) {
      localStorage.setItem(walletKey, JSON.stringify(wallet));
    }
  }, [wallet, walletKey]);

  useEffect(() => {
    if (txKey) localStorage.setItem(txKey, JSON.stringify(transactions));
  }, [transactions, txKey]);

  useEffect(() => {
    if (escrowKey) localStorage.setItem(escrowKey, JSON.stringify(escrowPayments));
  }, [escrowPayments, escrowKey]);

  // Créer une transaction wallet
  const createTransaction = (
    type: WalletTransactionType,
    amount: number,
    description: string,
    options?: {
      relatedEntityType?: 'commande' | 'recolte' | 'cooperative';
      relatedEntityId?: string;
      mobileMoneyProvider?: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE';
      mobileMoneyReference?: string;
      status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    }
  ): WalletTransaction => {
    if (!wallet) throw new Error('Wallet non initialisé');

    const balanceBefore = wallet.balance;
    const transaction: WalletTransaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      walletId: wallet.userId,
      userId: wallet.userId,
      type,
      amount,
      balanceBefore,
      balanceAfter: balanceBefore, // Sera mis à jour
      description,
      status: options?.status || 'COMPLETED',
      createdAt: new Date().toISOString(),
      ...options,
    };

    if (transaction.status === 'COMPLETED') {
      transaction.completedAt = new Date().toISOString();
    }

    return transaction;
  };

  // 💰 Recharger le wallet (depuis Mobile Money)
  const rechargerWallet = async (
    montant: number,
    provider: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE',
    reference: string
  ) => {
    if (!wallet) throw new Error('Wallet non initialisé');
    if (montant <= 0) throw new Error('Montant invalide');

    // Créer la transaction
    const transaction = createTransaction(
      'RECHARGE',
      montant,
      `Rechargement ${provider} Money`,
      {
        mobileMoneyProvider: provider,
        mobileMoneyReference: reference,
        status: 'COMPLETED',
      }
    );

    // Mettre à jour le wallet
    const updatedWallet: WalletAccount = {
      ...wallet,
      balance: wallet.balance + montant,
      totalReceived: wallet.totalReceived + montant,
      updatedAt: new Date().toISOString(),
    };

    transaction.balanceAfter = updatedWallet.balance;

    setWallet(updatedWallet);
    setTransactions([transaction, ...transactions]);

    // TODO: Dans version production, appeler API Mobile Money
    console.log(`✅ Rechargement ${montant} FCFA via ${provider}`);
  };

  // 💸 Retirer du wallet (vers Mobile Money ou Agent)
  const retirerWallet = async (
    montant: number,
    provider: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE'
  ) => {
    if (!wallet) throw new Error('Wallet non initialisé');
    if (montant <= 0) throw new Error('Montant invalide');
    if (wallet.balance < montant) throw new Error('Solde insuffisant');

    const transaction = createTransaction(
      'RETRAIT',
      montant,
      `Retrait vers ${provider} Money`,
      {
        mobileMoneyProvider: provider,
        status: 'COMPLETED',
      }
    );

    const updatedWallet: WalletAccount = {
      ...wallet,
      balance: wallet.balance - montant,
      totalSent: wallet.totalSent + montant,
      updatedAt: new Date().toISOString(),
    };

    transaction.balanceAfter = updatedWallet.balance;

    setWallet(updatedWallet);
    setTransactions([transaction, ...transactions]);

    console.log(`✅ Retrait ${montant} FCFA vers ${provider}`);
  };

  // 🔒 Bloquer l'argent en escrow (lors du paiement d'une commande)
  const bloquerArgent = async (
    commandeId: string,
    montant: number,
    receiverId: string
  ): Promise<string> => {
    if (!wallet) throw new Error('Wallet non initialisé');
    if (wallet.balance < montant) throw new Error('Solde insuffisant');

    // Créer l'escrow
    const escrow: EscrowPayment = {
      id: `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      commandeId,
      payerId: wallet.userId,
      receiverId,
      amount: montant,
      status: 'BLOCKED',
      createdAt: new Date().toISOString(),
    };

    // Créer la transaction
    const transaction = createTransaction(
      'ESCROW_BLOQUE',
      montant,
      `Paiement commande #${commandeId} (escrow)`,
      {
        relatedEntityType: 'commande',
        relatedEntityId: commandeId,
        status: 'COMPLETED',
      }
    );

    // Mettre à jour le wallet (débiter balance, créditer escrowBalance)
    const updatedWallet: WalletAccount = {
      ...wallet,
      balance: wallet.balance - montant,
      escrowBalance: wallet.escrowBalance + montant,
      totalSent: wallet.totalSent + montant,
      updatedAt: new Date().toISOString(),
    };

    transaction.balanceAfter = updatedWallet.balance;

    setWallet(updatedWallet);
    setTransactions([transaction, ...transactions]);
    setEscrowPayments([escrow, ...escrowPayments]);

    console.log(`🔒 Argent bloqué en escrow : ${montant} FCFA pour commande ${commandeId}`);
    return escrow.id;
  };

  // 🔓 Libérer l'argent escrow (après confirmation livraison)
  const libererArgent = async (escrowId: string, receiverId: string) => {
    const escrow = escrowPayments.find(e => e.id === escrowId);
    if (!escrow) throw new Error('Escrow introuvable');
    if (escrow.status !== 'BLOCKED') throw new Error('Escrow déjà traité');
    if (!wallet) throw new Error('Wallet non initialisé');

    // Marquer l'escrow comme libéré (argent reste bloqué jusqu'à récupération manuelle)
    const updatedEscrow: EscrowPayment = {
      ...escrow,
      status: 'RELEASED',
      releasedAt: new Date().toISOString(),
      releaseTrigger: 'VALIDATION',
    };

    setEscrowPayments(
      escrowPayments.map(e => (e.id === escrowId ? updatedEscrow : e))
    );

    console.log(`✅ Escrow ${escrowId} libéré. ${receiverId} peut récupérer l'argent.`);
  };

  // 💵 Récupérer l'argent (action manuelle du Producteur)
  const recupererArgent = async (escrowId: string) => {
    const escrow = escrowPayments.find(e => e.id === escrowId);
    if (!escrow) throw new Error('Escrow introuvable');
    if (escrow.status !== 'RELEASED') throw new Error('Argent pas encore libéré');
    if (!wallet) throw new Error('Wallet non initialisé');

    // Créer la transaction de réception
    const transaction = createTransaction(
      'PAIEMENT_RECU',
      escrow.amount,
      `Paiement reçu commande #${escrow.commandeId}`,
      {
        relatedEntityType: 'commande',
        relatedEntityId: escrow.commandeId,
        status: 'COMPLETED',
      }
    );

    // Mettre à jour le wallet (créditer balance, débiter escrowBalance du payeur)
    const updatedWallet: WalletAccount = {
      ...wallet,
      balance: wallet.balance + escrow.amount,
      totalReceived: wallet.totalReceived + escrow.amount,
      updatedAt: new Date().toISOString(),
    };

    transaction.balanceAfter = updatedWallet.balance;

    // Supprimer l'escrow (traité)
    setEscrowPayments(escrowPayments.filter(e => e.id !== escrowId));
    setWallet(updatedWallet);
    setTransactions([transaction, ...transactions]);

    console.log(`💰 ${escrow.amount} FCFA récupérés dans le wallet`);
  };

  // 🔙 Rembourser (si commande annulée)
  const rembourserArgent = async (escrowId: string, payerId: string) => {
    const escrow = escrowPayments.find(e => e.id === escrowId);
    if (!escrow) throw new Error('Escrow introuvable');
    if (escrow.status !== 'BLOCKED') throw new Error('Escrow déjà traité');

    // Créer transaction de remboursement
    const transaction = createTransaction(
      'ESCROW_REMBOURSE',
      escrow.amount,
      `Remboursement commande annulée #${escrow.commandeId}`,
      {
        relatedEntityType: 'commande',
        relatedEntityId: escrow.commandeId,
        status: 'COMPLETED',
      }
    );

    // Si c'est le wallet du payeur, on recrédite
    if (wallet && wallet.userId === payerId) {
      const updatedWallet: WalletAccount = {
        ...wallet,
        balance: wallet.balance + escrow.amount,
        escrowBalance: wallet.escrowBalance - escrow.amount,
        updatedAt: new Date().toISOString(),
      };

      transaction.balanceAfter = updatedWallet.balance;
      setWallet(updatedWallet);
      setTransactions([transaction, ...transactions]);
    }

    // Marquer escrow comme remboursé
    const updatedEscrow: EscrowPayment = {
      ...escrow,
      status: 'REFUNDED',
      releasedAt: new Date().toISOString(),
    };

    setEscrowPayments(
      escrowPayments.map(e => (e.id === escrowId ? updatedEscrow : e))
    );

    console.log(`🔙 Escrow ${escrowId} remboursé à ${payerId}`);
  };

  // Helpers
  const getBalance = () => wallet?.balance || 0;
  
  const getEscrowBalance = () => wallet?.escrowBalance || 0;
  
  const getAvailableBalance = () => {
    if (!wallet) return 0;
    return wallet.balance - wallet.escrowBalance;
  };
  
  const canAfford = (montant: number) => {
    return getAvailableBalance() >= montant;
  };
  
  const getTransactionHistory = (limit?: number) => {
    return limit ? transactions.slice(0, limit) : transactions;
  };
  
  const getPendingEscrows = () => {
    return escrowPayments.filter(e => e.status === 'BLOCKED');
  };

  const value: WalletContextType = {
    wallet,
    transactions,
    escrowPayments,
    rechargerWallet,
    retirerWallet,
    bloquerArgent,
    libererArgent,
    rembourserArgent,
    recupererArgent,
    getBalance,
    getEscrowBalance,
    getAvailableBalance,
    canAfford,
    getTransactionHistory,
    getPendingEscrows,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet doit être utilisé dans un WalletProvider');
  }
  return context;
}