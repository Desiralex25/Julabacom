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

// ✅ MOCK_STOCK SUPPRIMÉ - Migration Supabase

// ── Provider ─────────────────────────────────────────────────

export function StockProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const notifications = useNotifications();

  const storageKey = user?.id ? `julaba_stock_${user.id}` : null;

  const [stock, setStock] = useState<StockItem[]>([]);

  // TODO: Charger depuis Supabase au mount et lors du changement d'utilisateur
  // ✅ localStorage SUPPRIMÉ
  // useEffect(() => {
  //   if (user?.id) {
  //     const loadStock = async () => {
  //       const { data } = await supabase.from('stock').select('*').eq('userId', user.id);
  //       setStock(data || []);
  //     };
  //     loadStock();
  //   } else {
  //     setStock([]);
  //   }
  // }, [user?.id]);

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
