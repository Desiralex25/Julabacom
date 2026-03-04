import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationsContext';

// ── Types ────────────────────────────────────────────────────

export interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  seuilAlerte: number; // seuil en dessous duquel on alerte
  image?: string;
}

export interface Sale {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  category?: string;
  purchasePrice?: number;
  paymentMethod?: string;
}

interface StockContextType {
  stock: StockItem[];
  getStock: () => StockItem[];
  addProduct: (item: Omit<StockItem, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<StockItem>) => void;
  deleteProduct: (id: string) => void;
  recordSale: (sale: Sale) => void;
  reapprovisionner: (productId: string, quantite: number) => void;
  getStockFaible: () => StockItem[];
  getValeurTotaleStock: () => number;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

// ── Données initiales ────────────────────────────────────────

const MOCK_STOCK: StockItem[] = [
  { id: '1', name: 'Riz local',    category: 'cereales',   unit: 'kg',      quantity: 150, purchasePrice: 600,  salePrice: 650,  seuilAlerte: 30  },
  { id: '2', name: 'Tomates',      category: 'legumes',    unit: 'kg',      quantity: 45,  purchasePrice: 300,  salePrice: 350,  seuilAlerte: 15  },
  { id: '3', name: 'Oignons',      category: 'legumes',    unit: 'kg',      quantity: 80,  purchasePrice: 350,  salePrice: 400,  seuilAlerte: 20  },
  { id: '4', name: 'Huile',        category: 'epices',     unit: 'L',       quantity: 25,  purchasePrice: 1400, salePrice: 1500, seuilAlerte: 5   },
  { id: '5', name: 'Ignames',      category: 'tubercules', unit: 'kg',      quantity: 120, purchasePrice: 350,  salePrice: 400,  seuilAlerte: 25  },
  { id: '6', name: 'Plantain',     category: 'fruits',     unit: 'régimes', quantity: 15,  purchasePrice: 250,  salePrice: 300,  seuilAlerte: 5   },
  { id: '7', name: 'Maïs',        category: 'cereales',   unit: 'kg',      quantity: 200, purchasePrice: 250,  salePrice: 300,  seuilAlerte: 40  },
  { id: '8', name: 'Piment',       category: 'epices',     unit: 'kg',      quantity: 8,   purchasePrice: 800,  salePrice: 1000, seuilAlerte: 5   },
  { id: '9', name: 'Attiéké',     category: 'cereales',   unit: 'kg',      quantity: 60,  purchasePrice: 400,  salePrice: 500,  seuilAlerte: 15  },
  { id: '10', name: 'Gombo',       category: 'legumes',    unit: 'kg',      quantity: 12,  purchasePrice: 600,  salePrice: 750,  seuilAlerte: 8   },
];

// ── Provider ─────────────────────────────────────────────────

export function StockProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const notifications = useNotifications();

  const storageKey = user?.id ? `julaba_stock_${user.id}` : null;

  const [stock, setStock] = useState<StockItem[]>(() => {
    if (!user?.id) return MOCK_STOCK;
    try {
      const saved = localStorage.getItem(`julaba_stock_${user.id}`);
      return saved ? JSON.parse(saved) : MOCK_STOCK;
    } catch {
      return MOCK_STOCK;
    }
  });

  // Persistance scopée par userId
  useEffect(() => {
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(stock)); } catch {}
    }
  }, [stock, storageKey]);

  // Reset si userId change
  useEffect(() => {
    if (!user?.id) { setStock(MOCK_STOCK); return; }
    try {
      const saved = localStorage.getItem(`julaba_stock_${user.id}`);
      setStock(saved ? JSON.parse(saved) : MOCK_STOCK);
    } catch {
      setStock(MOCK_STOCK);
    }
  }, [user?.id]);

  // ── Détection automatique stocks faibles ─────────────────
  // On garde un ref pour ne pas re-déclencher la même alerte sans cesse
  const alertedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id || user.role !== 'marchand') return;

    stock.forEach(item => {
      if (item.quantity <= item.seuilAlerte && !alertedRef.current.has(item.id)) {
        alertedRef.current.add(item.id);
        notifications.triggerStockFaible(
          user.id,
          item.name,
          item.quantity,
          item.unit
        );
      }
      // Ré-autoriser l'alerte si le stock est reconstitué (> seuil * 2)
      if (item.quantity > item.seuilAlerte * 2) {
        alertedRef.current.delete(item.id);
      }
    });
  }, [stock, user?.id, user?.role]);

  // ── Actions ──────────────────────────────────────────────

  const getStock = (): StockItem[] => stock;

  const addProduct = (item: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = { ...item, id: `prod-${Date.now()}` };
    setStock(prev => [...prev, newItem]);
  };

  const updateProduct = (id: string, updates: Partial<StockItem>) => {
    setStock(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteProduct = (id: string) => {
    setStock(prev => prev.filter(item => item.id !== id));
  };

  const recordSale = (sale: Sale) => {
    setStock(prev =>
      prev.map(item =>
        item.id === sale.productId
          ? { ...item, quantity: Math.max(0, item.quantity - sale.quantity) }
          : item
      )
    );
  };

  const reapprovisionner = (productId: string, quantite: number) => {
    setStock(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + quantite }
          : item
      )
    );
    // Ré-autoriser l'alerte pour ce produit
    alertedRef.current.delete(productId);
  };

  const getStockFaible = () => stock.filter(item => item.quantity <= item.seuilAlerte);

  const getValeurTotaleStock = () =>
    stock.reduce((total, item) => total + item.quantity * item.salePrice, 0);

  const value: StockContextType = {
    stock,
    getStock,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
    reapprovisionner,
    getStockFaible,
    getValeurTotaleStock,
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStock() {
  const context = useContext(StockContext);
  if (!context) {
    return {
      stock: [],
      getStock: () => [],
      addProduct: () => {},
      updateProduct: () => {},
      deleteProduct: () => {},
      recordSale: () => {},
      reapprovisionner: () => {},
      getStockFaible: () => [],
      getValeurTotaleStock: () => 0,
    } as StockContextType;
  }
  return context;
}
