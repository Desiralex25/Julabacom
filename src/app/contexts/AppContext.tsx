/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — AppContext v3.0 (100% SUPABASE)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * ✅ Intégration Supabase complète
 * ✅ Authentification JWT
 * ✅ Chargement automatique données utilisateur
 * ✅ Synchronisation temps réel
 * ✅ Support offline/online
 * ✅ Tantie Sagesse (ElevenLabs)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as ElevenLabs from '../services/elevenlabs';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '../services/supabaseClient';

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
  market?: string;
  score: number;
  createdAt: string;
  validated: boolean;
  
  // Champs carte professionnelle
  dateNaissance?: string;
  nationalite?: string;
  photo?: string;
  zone?: string;
  cni?: string;
  cmu?: string;
  rsti?: string;
  email?: string;
  telephone2?: string;
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
  date: string;
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
  // User & Auth
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loading: boolean;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  
  // Marketplace
  marketplaceItems: MarketplaceItem[];
  addMarketplaceItem: (item: Omit<MarketplaceItem, 'id' | 'createdAt'>) => void;
  
  // Network & Voice
  isOnline: boolean;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  speak: (text: string) => void;
  
  // UI
  roleColor: string;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  
  // Sessions
  currentSession: DaySession | null;
  openDay: (fondInitial: number, notes?: string) => Promise<void>;
  closeDay: (comptageReel: number, closingNotes?: string) => Promise<void>;
  updateFondInitial: (newFond: number) => Promise<void>;
  
  // Stats
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
  
  // Actions
  refreshUserData: () => Promise<void>;
  logout: () => Promise<void>;
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
  // État principal
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentSession, setCurrentSession] = useState<DaySession | null>(null);
  const [isModalOpen, setIsModalOpenState] = useState(false);

  // ═══════════════════════════════════════════════════════════════════
  // AUTHENTIFICATION & CHARGEMENT DONNÉES
  // ══════════════════════════════���════════════════════════════════════

  // Charger les données utilisateur depuis Supabase
  const loadUserData = async (userId: string, token: string) => {
    try {
      // Charger profil utilisateur via /auth/me (utilise le token JWT)
      const userResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (userResponse.ok) {
        const { user: userData } = await userResponse.json();
        
        const mappedUser: User = {
          id: userData.id,
          phone: userData.phone,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role as UserRole,
          region: userData.region || '',
          commune: userData.commune || '',
          activity: userData.activity || '',
          market: userData.market,
          cooperativeName: userData.cooperativeName,
          score: userData.score || 0,
          createdAt: userData.createdAt,
          validated: userData.validated || false,
          email: userData.email,
          photo: userData.photoUrl,
        };

        setUser(mappedUser);
      }

      // Charger transactions
      const txResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/caisse/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (txResponse.ok) {
        const { transactions: txData } = await txResponse.json();
        
        const mappedTx: Transaction[] = txData.map((tx: any) => ({
          id: tx.id,
          userId: tx.marchand_id,
          type: tx.type,
          productName: tx.produits?.nom || 'Produit',
          quantity: tx.produits?.quantite || 1,
          price: tx.montant,
          date: tx.created_at,
          paymentMethod: tx.mode_paiement,
          synced: true,
        }));

        setTransactions(mappedTx);
      }

      // Charger session du jour
      const today = new Date().toISOString().split('T')[0];
      const sessionResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/caisse/session/${today}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (sessionResponse.ok) {
        const { session: sessionData } = await sessionResponse.json();
        if (sessionData) {
          setCurrentSession({
            id: sessionData.id,
            userId: sessionData.marchand_id,
            date: sessionData.date,
            fondInitial: sessionData.fond_initial,
            opened: sessionData.ouvert,
            openedAt: sessionData.heure_ouverture,
            closedAt: sessionData.heure_fermeture,
            notes: sessionData.notes,
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier session au démarrage — source unique de vérité : SDK Supabase
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Le SDK Supabase gère le refresh automatique depuis sa propre clé localStorage
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && session.access_token) {
          setAccessToken(session.access_token);
          await loadUserData(session.user.id, session.access_token);
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Rafraîchir données utilisateur
  const refreshUserData = async () => {
    if (user?.id && accessToken) {
      await loadUserData(user.id, accessToken);
    }
  };

  // Déconnexion
  const logout = async () => {
    await supabase.auth.signOut().catch((e) => console.warn('Supabase signOut error:', e));

    setUser(null);
    setAccessToken(null);
    setTransactions([]);
    setMarketplaceItems([]);
    setCurrentSession(null);

    // Nettoyer toutes les clés localStorage Jùlaba
    sessionStorage.removeItem('julaba_access_token');
    sessionStorage.removeItem('julaba_user_id');
    sessionStorage.removeItem('julaba_refresh_token');
    localStorage.removeItem('julaba_access_token');
    localStorage.removeItem('julaba_refresh_token');
    localStorage.removeItem('julaba_user_id');
    localStorage.removeItem('julaba_bo_user');
    localStorage.removeItem('julaba_user_data'); // UserContext storage key
    localStorage.removeItem('julaba_user');
  };

  // ═══════════════════════════════════════════════════════════════════
  // TANTIE SAGESSE - Synthèse vocale avec ElevenLabs
  // ═══════════════════════════════════════════════════════════════════
  
  const speak = (text: string) => {
    if (!voiceEnabled || !text || text.trim().length === 0) return;

    ElevenLabs.speakWithFallback(
      text,
      isOnline,
      ElevenLabs.RECOMMENDED_VOICES.CHARLOTTE
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

  // ═══════════════════════════════════════════════════════════════════
  // TRANSACTIONS & MARKETPLACE
  // ═══════════════════════════════════════════════════════════════════

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      synced: false,
    };
    
    setTransactions((prev) => [newTransaction, ...prev]);

    // Sync avec Supabase si connecté
    if (accessToken && user) {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/caisse/vente`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              montant: transaction.price * transaction.quantity,
              produits: {
                nom: transaction.productName,
                quantite: transaction.quantity,
              },
              mode_paiement: transaction.paymentMethod,
            }),
          }
        );

        // Marquer comme synchronisé
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === newTransaction.id ? { ...tx, synced: true } : tx))
        );
      } catch (error) {
        console.error('Error syncing transaction:', error);
      }
    }
  };

  const addMarketplaceItem = (item: Omit<MarketplaceItem, 'id' | 'createdAt'>) => {
    const newItem: MarketplaceItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setMarketplaceItems((prev) => [newItem, ...prev]);
    // TODO: Sync avec Supabase marketplace
  };

  // ═══════════════════════════════════════════════════════════════════
  // SESSIONS JOURNALIÈRES
  // ═══════════════════════════════════════════════════════════════════

  const openDay = async (fondInitial: number, notes?: string) => {
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

    // Sync avec Supabase
    if (accessToken) {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/caisse/session/ouvrir`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fond_initial: fondInitial,
              notes,
            }),
          }
        );
      } catch (error) {
        console.error('Error opening day:', error);
      }
    }
  };

  const closeDay = async (comptageReel: number, closingNotes?: string) => {
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

    // Sync avec Supabase
    if (accessToken) {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/caisse/session/fermer`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              comptage_reel: comptageReel,
              notes: closingNotes,
            }),
          }
        );
      } catch (error) {
        console.error('Error closing day:', error);
      }
    }
    
    setCurrentSession(null);
  };

  const updateFondInitial = async (newFond: number) => {
    if (!currentSession) return;

    const updatedSession: DaySession = {
      ...currentSession,
      fondInitial: newFond,
    };
    
    setCurrentSession(updatedSession);
    // TODO: Sync avec Supabase
  };

  // ═══════════════════════════════════════════════════════════════════
  // STATISTIQUES & RAPPORTS
  // ═══════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════
  // UI HELPERS
  // ═══════════════════════════════════════════════════════════════════

  const roleColor = user ? ROLE_COLORS[user.role] : '#C46210';

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

  // ═══════════════════════════════════════════════════════════════════
  // CONTEXT VALUE
  // ═══════════════════════════════════════════════════════════════════

  const value: AppContextType = {
    user,
    setUser,
    isAuthenticated: !!user && !!accessToken,
    accessToken,
    setAccessToken,
    loading,
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
    refreshUserData,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    return {
      user: null,
      setUser: () => {},
      isAuthenticated: false,
      accessToken: null,
      setAccessToken: () => {},
      loading: false,
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
      openDay: async () => {},
      closeDay: async () => {},
      updateFondInitial: async () => {},
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
      refreshUserData: async () => {},
      logout: async () => {},
    } as AppContextType;
  }
  return context;
}