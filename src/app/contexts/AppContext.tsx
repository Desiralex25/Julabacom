import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

// NOTE: Notification interface supprimée — tout passe par NotificationsContext

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
  // Historique et analytics
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

// Mock users for dev mode
const MOCK_USERS: User[] = [
  {
    id: '1',
    phone: '0701020304',
    firstName: 'Aminata',
    lastName: 'Kouassi',
    role: 'marchand',
    region: 'Abidjan',
    commune: 'Yopougon',
    activity: 'Vente de riz',
    market: 'Marché de Yopougon',
    score: 85,
    createdAt: '2024-01-15',
    validated: true,
  },
  {
    id: '2',
    phone: '0709080706',
    firstName: 'Konan',
    lastName: 'Yao',
    role: 'producteur',
    region: 'Bouaké',
    commune: 'Bouaké Centre',
    activity: 'Production de maïs',
    score: 92,
    createdAt: '2024-02-10',
    validated: true,
  },
  {
    id: '3',
    phone: '0705040302',
    firstName: 'Marie',
    lastName: 'Bamba',
    role: 'cooperative',
    region: 'San Pedro',
    commune: 'San Pedro',
    activity: 'Coopérative agricole',
    cooperativeName: 'COOP IVOIRE VIVRIER',
    score: 88,
    createdAt: '2024-03-05',
    validated: true,
  },
  {
    id: '4',
    phone: '0707070707',
    firstName: 'Jean',
    lastName: 'Kouadio',
    role: 'institution',
    region: 'Abidjan',
    commune: 'Plateau',
    activity: 'Direction Générale de l\'Économie',
    score: 100,
    createdAt: '2024-01-01',
    validated: true,
  },
  {
    id: '5',
    phone: '0708080808',
    firstName: 'Sophie',
    lastName: 'Diarra',
    role: 'identificateur',
    region: 'Abidjan',
    commune: 'Marcory',
    activity: 'Agent terrain',
    market: 'Marché de Yopougon',
    score: 95,
    createdAt: '2024-04-20',
    validated: true,
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentSession, setCurrentSession] = useState<DaySession | null>(null);
  const [isModalOpen, setIsModalOpenState] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('julaba_user');
    const savedTransactions = localStorage.getItem('julaba_transactions');
    const savedMarketplace = localStorage.getItem('julaba_marketplace');
    const savedSession = localStorage.getItem('julaba_current_session');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedMarketplace) setMarketplaceItems(JSON.parse(savedMarketplace));
    
    if (savedSession) {
      const session: DaySession = JSON.parse(savedSession);
      const today = new Date().toISOString().split('T')[0];
      if (session.date !== today) {
        setCurrentSession(null);
        localStorage.removeItem('julaba_current_session');
      } else {
        setCurrentSession(session);
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('julaba_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('julaba_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('julaba_marketplace', JSON.stringify(marketplaceItems));
  }, [marketplaceItems]);

  // Sauvegarder la session courante
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('julaba_current_session', JSON.stringify(currentSession));
    }
  }, [currentSession]);

  // Voice synthesis function
  const speak = (text: string) => {
    if (!voiceEnabled) return;

    // Web Speech API (works in Chrome/Edge)
    if ('speechSynthesis' in window) {
      // Annuler les messages en cours pour éviter les interruptions non désirées
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      
      // Gestion des erreurs - ignorer complètement les interruptions
      utterance.onerror = (event) => {
        // Ne rien logger pour les interruptions normales
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error('��� Erreur synthèse vocale:', event.error);
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }
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
  };

  const addMarketplaceItem = (item: Omit<MarketplaceItem, 'id' | 'createdAt'>) => {
    const newItem: MarketplaceItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setMarketplaceItems((prev) => [newItem, ...prev]);
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
  };

  const closeDay = (comptageReel: number, closingNotes?: string) => {
    if (!currentSession) return;

    const stats = getTodayStats();
    const caisseTheorique = currentSession.fondInitial + stats.ventes - stats.depenses;
    const ecart = comptageReel - caisseTheorique;

    const updatedSession: DaySession = {
      ...currentSession,
      opened: false, // ✅ Marquer la session comme fermée
      closedAt: new Date().toISOString(),
      comptageReel,
      ecart,
      closingNotes,
    };
    
    // ✅ Au lieu de sauvegarder la session fermée, on la supprime complètement
    setCurrentSession(null);
    localStorage.removeItem('julaba_current_session');
    
    // On peut sauvegarder dans un historique séparé si besoin
    const closedSessions = JSON.parse(localStorage.getItem('julaba_closed_sessions') || '[]');
    closedSessions.push(updatedSession);
    localStorage.setItem('julaba_closed_sessions', JSON.stringify(closedSessions));
  };

  const updateFondInitial = (newFond: number) => {
    if (!currentSession) return;

    const updatedSession: DaySession = {
      ...currentSession,
      fondInitial: newFond,
    };
    setCurrentSession(updatedSession);
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
    // En développement, retourner des valeurs par défaut au lieu de crasher
    // Cela permet au hot reload de fonctionner sans erreur
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

// Helper function to get mock user by phone
export function getMockUserByPhone(phone: string): User | null {
  return MOCK_USERS.find((u) => u.phone === phone) || null;
}

// Helper function to get all mock users (for dev mode)
export function getAllMockUsers(): User[] {
  return MOCK_USERS;
}