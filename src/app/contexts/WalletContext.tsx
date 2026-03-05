import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WalletAccount, 
  WalletTransaction, 
  WalletTransactionType,
  EscrowPayment 
} from '../types/julaba.types';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationsContext';
import * as walletsApi from '../../imports/wallets-api';
import { DEV_MODE, devLog } from '../config/devMode';

interface WalletContextType {
  wallet: WalletAccount | null;
  transactions: WalletTransaction[];
  escrowPayments: EscrowPayment[];
  loading: boolean;
  
  rechargerWallet: (montant: number, provider: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE', reference: string) => Promise<void>;
  retirerWallet: (montant: number, provider: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE') => Promise<void>;
  
  bloquerArgent: (commandeId: string, montant: number, receiverId: string) => Promise<string>;
  libererArgent: (escrowId: string, receiverId: string) => Promise<void>;
  rembourserArgent: (escrowId: string, payerId: string) => Promise<void>;
  recupererArgent: (escrowId: string) => Promise<void>;
  
  getBalance: () => number;
  getEscrowBalance: () => number;
  getAvailableBalance: () => number;
  canAfford: (montant: number) => boolean;
  
  getTransactionHistory: (limit?: number) => WalletTransaction[];
  getPendingEscrows: () => EscrowPayment[];
  
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [escrowPayments, setEscrowPayments] = useState<EscrowPayment[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger le wallet depuis Supabase
  const loadWallet = async () => {
    if (DEV_MODE) {
      devLog('WalletContext', 'Mode dev - skip API call');
      return;
    }
    if (!user?.id) {
      setWallet(null);
      setTransactions([]);
      setEscrowPayments([]);
      return;
    }

    try {
      setLoading(true);
      
      // Charger wallet et transactions
      const [walletData, transactionsData] = await Promise.all([
        walletsApi.fetchWallet(),
        walletsApi.fetchWalletTransactions(),
      ]);

      // Convertir en types frontend
      const walletAccount: WalletAccount = {
        userId: walletData.wallet.user_id,
        balance: walletData.wallet.solde,
        currency: 'FCFA',
        escrowBalance: walletData.wallet.solde_bloque || 0,
        totalReceived: 0, // TODO: calculer
        totalSent: 0, // TODO: calculer
        createdAt: walletData.wallet.created_at,
        updatedAt: walletData.wallet.updated_at,
      };

      const txList: WalletTransaction[] = transactionsData.transactions.map((tx: any) => ({
        id: tx.id,
        userId: tx.user_id,
        type: tx.type as WalletTransactionType,
        amount: tx.montant,
        currency: 'FCFA',
        description: tx.description || '',
        status: tx.statut,
        createdAt: tx.created_at,
        relatedEntityType: tx.related_entity_type,
        relatedEntityId: tx.related_entity_id,
        metadata: tx.metadata,
      }));

      setWallet(walletAccount);
      setTransactions(txList);
    } catch (error) {
      console.error('Error loading wallet:', error);
      
      // Créer wallet vide si n'existe pas
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, [user?.id]);

  const refreshWallet = async () => {
    await loadWallet();
  };

  const rechargerWallet = async (
    montant: number,
    provider: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE',
    reference: string
  ) => {
    try {
      await walletsApi.creditWallet({
        montant,
        description: `Recharge via ${provider}`,
        metadata: { provider, reference },
      });

      await loadWallet();
      
      addNotification({
        titre: 'Wallet rechargé',
        message: `${montant} FCFA ajoutés à votre wallet`,
        type: 'success',
        role: user?.role as any,
      });
    } catch (error) {
      console.error('Error recharging wallet:', error);
      addNotification({
        titre: 'Erreur',
        message: 'Impossible de recharger le wallet',
        type: 'erreur',
        role: user?.role as any,
      });
      throw error;
    }
  };

  const retirerWallet = async (
    montant: number,
    provider: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE'
  ) => {
    try {
      await walletsApi.debitWallet({
        montant,
        description: `Retrait vers ${provider}`,
        metadata: { provider },
      });

      await loadWallet();
      
      addNotification({
        titre: 'Retrait effectué',
        message: `${montant} FCFA retirés de votre wallet`,
        type: 'success',
        role: user?.role as any,
      });
    } catch (error) {
      console.error('Error withdrawing from wallet:', error);
      addNotification({
        titre: 'Erreur',
        message: 'Impossible de retirer les fonds',
        type: 'erreur',
        role: user?.role as any,
      });
      throw error;
    }
  };

  const bloquerArgent = async (
    commandeId: string,
    montant: number,
    receiverId: string
  ): Promise<string> => {
    // TODO: Implémenter avec API Escrow
    const escrowId = Date.now().toString();
    return escrowId;
  };

  const libererArgent = async (escrowId: string, receiverId: string) => {
    // TODO: Implémenter avec API Escrow
  };

  const rembourserArgent = async (escrowId: string, payerId: string) => {
    // TODO: Implémenter avec API Escrow
  };

  const recupererArgent = async (escrowId: string) => {
    // TODO: Implémenter avec API Escrow
  };

  const getBalance = () => wallet?.balance || 0;
  const getEscrowBalance = () => wallet?.escrowBalance || 0;
  const getAvailableBalance = () => (wallet?.balance || 0) - (wallet?.escrowBalance || 0);
  const canAfford = (montant: number) => getAvailableBalance() >= montant;

  const getTransactionHistory = (limit?: number) => {
    const sorted = [...transactions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  };

  const getPendingEscrows = () => {
    return escrowPayments.filter(e => e.status === 'PENDING');
  };

  const value: WalletContextType = {
    wallet,
    transactions,
    escrowPayments,
    loading,
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
    refreshWallet,
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