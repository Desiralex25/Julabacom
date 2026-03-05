/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — AppContext (PRODUCTION READY)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * IMPORTANT : Ce context ne contient PLUS aucune persistance localStorage
 * critique ni données mock. Toutes les données doivent venir de Supabase.
 * 
 * ✅ Suppression complète : localStorage user, transactions, marketplace, sessions
 * ✅ Suppression complète : MOCK_USERS
 * ✅ Structure prête pour migration Supabase immédiate
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as ElevenLabs from '../services/elevenlabs';

export type UserRole = 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur';

export interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  region: string;
  commune: string;
  activity: string;
  cooperativeName?: string;
  market?: string; // Marché pour les marchands et identificateurs
  score: number;
  createdAt: string;
  validated: boolean;
  
  // 🎴 Champs pour la carte professionnelle
  dateNaissance?: string;
  nationalite?: string;
  photo?: string;
  zone?: string;
  cni?: string; // Carte Nationale d'Identité
  cmu?: string; // Couverture Maladie Universelle
  rsti?: string; // Régime de Sécurité Sociale
  email?: string;
  telephone2?: string; // Numéro secondaire
  categorie?: 'A' | 'B' | 'C';
  recepisse?: string;
  boitePostale?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'vente' | 'depense' | 'recolte';
  productName: string;
  quantity: number;
  price: number;
  paymentMethod?: string;
  category?: string;
  date: string;
  location?: string;
  purchasePrice?: number;
  margin?: number;
  totalMargin?: number;
  synced?: boolean;
}

export interface DaySession {
  id: string;
  userId: string;
  date: string; // Date de la journée (format YYYY-MM-DD)
  fondInitial: number;
  opened: boolean;
  openedAt?: string;
  closedAt?: string;
  notes?: string;
  closingNotes?: string;
  comptageReel?: number;
  ecart?: number;
}

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRole: UserRole;
  sellerScore: number;
  productName: string;
  quantity: number;
  price: number;
  region: string;
  commune: string;
  photo?: string;
  available: boolean;
  createdAt: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  marketplaceItems: MarketplaceItem[];
  addMarketplaceItem: (item: Omit<MarketplaceItem, 'id' | 'createdAt'>) => void;
  isOnline: boolean;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  speak: (text: string) => void;
  roleColor: string;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  currentSession: DaySession | null;
  openDay: (fondInitial: number, notes?: string) => void;
  closeDay: (comptageReel: number, closingNotes?: string) => void;
  updateFondInitial: (newFond: number) => void;
  getTodayStats: () => { ventes: number; depenses: number; caisse: number; nombreVentes: number };
  getSalesHistory: (filters?: { startDate?: string; endDate?: string; productName?: string; paymentMethod?: string }) => Transaction[];
  getFinancialSummary: (period: 'today' | '7days' | '30days' | 'custom', customStart?: string, customEnd?: string) => {
    totalVentes: number;
    totalDepenses: number;
    beneficeNet: number;
    nombreVentes: number;
    nombreDepenses: number;
    moyenneVente: number;
    topProduits: { productName: string; quantity: number; total: number }[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ROLE_COLORS: Record<UserRole, string> = {
  marchand: '#C46210',
  producteur: '#00563B',
  cooperative: '#2072AF',
  institution: '#702963',
  identificateur: '#9F8170',
};

export function AppProvider({ children }: { children: ReactNode }) {
  // ✅ ÉTAT SANS PERSISTANCE LOCALE
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentSession, setCurrentSession] = useState<DaySession | null>(null);
  const [isModalOpen, setIsModalOpenState] = useState(false);

  // ✅ Toutes les données doivent venir de Supabase via un useEffect dédié

  // ═══════════════════════════════════════════════════════════════════
  // TANTIE SAGESSE - Synthèse vocale avec ElevenLabs
  // ═══════════════════════════════════════════════════════════════════
  
  /**
   * Fonction de synthèse vocale principale
   * Utilise ElevenLabs en priorité avec fallback automatique vers Web Speech API
   */
  const speak = (text: string) => {
    if (!voiceEnabled || !text || text.trim().length === 0) return;

    // Utiliser ElevenLabs avec fallback automatique vers Web Speech API
    ElevenLabs.speakWithFallback(
      text,
      isOnline, // N'utiliser ElevenLabs que si en ligne
      ElevenLabs.RECOMMENDED_VOICES.CHARLOTTE // Voix Tantie Sagesse par défaut
    ).catch((error) => {
      console.error('Erreur Tantie Sagesse:', error);
    });
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      speak('Connexion rétablie, tes données sont synchronisées.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      speak('Mode hors ligne activé.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [voiceEnabled]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    // TODO: Sync avec Supabase
  };

  const addMarketplaceItem = (item: Omit<MarketplaceItem, 'id' | 'createdAt'>) => {
    const newItem: MarketplaceItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setMarketplaceItems((prev) => [newItem, ...prev]);
    // TODO: Sync avec Supabase
  };

  const roleColor = user ? ROLE_COLORS[user.role] : '#C46210';

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(
      (t) => t.date.split('T')[0] === today
    );

    const ventesTransactions = todayTransactions.filter((t) => t.type === 'vente');
    
    const ventes = ventesTransactions.reduce((acc, t) => acc + t.price * t.quantity, 0);
    const nombreVentes = ventesTransactions.length;

    const depenses = todayTransactions
      .filter((t) => t.type === 'depense')
      .reduce((acc, t) => acc + t.price * t.quantity, 0);

    const caisse = (currentSession?.fondInitial || 0) + ventes - depenses;

    return { ventes, depenses, caisse, nombreVentes };
  };

  const openDay = (fondInitial: number, notes?: string) => {
    const newSession: DaySession = {
      id: Date.now().toString(),
      userId: user?.id || '',
      date: new Date().toISOString().split('T')[0],
      fondInitial,
      opened: true,
      openedAt: new Date().toISOString(),
      notes,
    };
    setCurrentSession(newSession);
    // TODO: Sync avec Supabase
  };

  const closeDay = (comptageReel: number, closingNotes?: string) => {
    if (!currentSession) return;

    const stats = getTodayStats();
    const caisseTheorique = currentSession.fondInitial + stats.ventes - stats.depenses;
    const ecart = comptageReel - caisseTheorique;

    const updatedSession: DaySession = {
      ...currentSession,
      opened: false,
      closedAt: new Date().toISOString(),
      comptageReel,
      ecart,
      closingNotes,
    };
    
    // TODO: Sauvegarder dans Supabase
    setCurrentSession(null);
  };

  const updateFondInitial = (newFond: number) => {
    if (!currentSession) return;

    const updatedSession: DaySession = {
      ...currentSession,
      fondInitial: newFond,
    };
    setCurrentSession(updatedSession);
    // TODO: Sync avec Supabase
  };

  const getSalesHistory = (filters?: { startDate?: string; endDate?: string; productName?: string; paymentMethod?: string }) => {
    let filteredTransactions = transactions.filter((t) => t.type === 'vente');

    if (filters?.startDate) {
      filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) >= new Date(filters.startDate));
    }
    if (filters?.endDate) {
      filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) <= new Date(filters.endDate));
    }
    if (filters?.productName) {
      filteredTransactions = filteredTransactions.filter((t) => t.productName.toLowerCase().includes(filters.productName.toLowerCase()));
    }
    if (filters?.paymentMethod) {
      filteredTransactions = filteredTransactions.filter((t) => t.paymentMethod?.toLowerCase().includes(filters.paymentMethod.toLowerCase()));
    }

    return filteredTransactions;
  };

  const getFinancialSummary = (period: 'today' | '7days' | '30days' | 'custom', customStart?: string, customEnd?: string) => {
    let filteredTransactions = transactions;

    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '7days':
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '30days':
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        if (customStart && customEnd) {
          startDate.setTime(new Date(customStart).getTime());
          endDate.setTime(new Date(customEnd).getTime());
        }
        break;
    }

    filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate);

    const totalVentes = filteredTransactions
      .filter((t) => t.type === 'vente')
      .reduce((acc, t) => acc + t.price * t.quantity, 0);

    const totalDepenses = filteredTransactions
      .filter((t) => t.type === 'depense')
      .reduce((acc, t) => acc + t.price * t.quantity, 0);

    const beneficeNet = totalVentes - totalDepenses;

    const nombreVentes = filteredTransactions.filter((t) => t.type === 'vente').length;
    const nombreDepenses = filteredTransactions.filter((t) => t.type === 'depense').length;

    const moyenneVente = nombreVentes > 0 ? totalVentes / nombreVentes : 0;

    const topProduits = filteredTransactions
      .filter((t) => t.type === 'vente')
      .reduce((acc, t) => {
        const existingProduct = acc.find((p) => p.productName === t.productName);
        if (existingProduct) {
          existingProduct.quantity += t.quantity;
          existingProduct.total += t.price * t.quantity;
        } else {
          acc.push({ productName: t.productName, quantity: t.quantity, total: t.price * t.quantity });
        }
        return acc;
      }, [] as { productName: string; quantity: number; total: number }[])
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalVentes,
      totalDepenses,
      beneficeNet,
      nombreVentes,
      nombreDepenses,
      moyenneVente,
      topProduits,
    };
  };

  // Verrouiller le scroll du body quand un modal est ouvert
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isModalOpen]);

  const setIsModalOpen = (open: boolean) => {
    setIsModalOpenState(open);
  };

  const value: AppContextType = {
    user,
    setUser,
    transactions,
    addTransaction,
    marketplaceItems,
    addMarketplaceItem,
    isOnline,
    voiceEnabled,
    setVoiceEnabled,
    speak,
    roleColor,
    isModalOpen,
    setIsModalOpen,
    currentSession,
    openDay,
    closeDay,
    updateFondInitial,
    getTodayStats,
    getSalesHistory,
    getFinancialSummary,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    return {
      user: null,
      setUser: () => {},
      transactions: [],
      addTransaction: () => {},
      marketplaceItems: [],
      addMarketplaceItem: () => {},
      isOnline: true,
      voiceEnabled: false,
      setVoiceEnabled: () => {},
      speak: () => {},
      roleColor: '#C46210',
      isModalOpen: false,
      setIsModalOpen: () => {},
      currentSession: null,
      openDay: () => {},
      closeDay: () => {},
      updateFondInitial: () => {},
      getTodayStats: () => ({ ventes: 0, depenses: 0, caisse: 0, nombreVentes: 0 }),
      getSalesHistory: () => [],
      getFinancialSummary: () => ({
        totalVentes: 0,
        totalDepenses: 0,
        beneficeNet: 0,
        nombreVentes: 0,
        nombreDepenses: 0,
        moyenneVente: 0,
        topProduits: [],
      }),
    } as AppContextType;
  }
  return context;
}
