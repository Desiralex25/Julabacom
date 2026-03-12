import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as stocksApi from '../../imports/stocks-api';
import { DEV_MODE, devLog } from '../config/devMode';
import { NOT_AUTHENTICATED } from '../../imports/api-client';

export interface StockItem {
  id: string;
  marchandId: string;
  produit: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  derniereModification: string;
}

interface StockContextType {
  stocks: StockItem[];
  stock: StockItem[];
  loading: boolean;

  addStock: (data: Omit<StockItem, 'id' | 'derniereModification'>) => Promise<void>;
  updateStock: (id: string, data: Partial<StockItem>) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;
  getStockByProduit: (produit: string) => StockItem | undefined;
  getStockTotal: () => number;
  getStockFaible: (seuil?: number) => StockItem[];
  getValeurTotaleStock: () => number;
  getStock: () => StockItem[];
  addProduct: (data: Omit<StockItem, 'id' | 'derniereModification'>) => Promise<void>;
  recordSale: (produit: string, quantite: number) => Promise<void>;

  refreshStocks: () => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

const MOCK_COCOVICO_STOCKS: StockItem[] = [
  { id: '1', marchandId: 'cocovico', produit: 'Banane plantain', quantite: 150, unite: 'tas', prixUnitaire: 500, derniereModification: new Date().toISOString() },
  { id: '2', marchandId: 'cocovico', produit: 'Poisson', quantite: 50, unite: 'tas', prixUnitaire: 2500, derniereModification: new Date().toISOString() },
  { id: '3', marchandId: 'cocovico', produit: 'Poulet', quantite: 30, unite: 'unité', prixUnitaire: 4500, derniereModification: new Date().toISOString() },
  { id: '4', marchandId: 'cocovico', produit: 'Tomate', quantite: 200, unite: 'tas', prixUnitaire: 500, derniereModification: new Date().toISOString() },
  { id: '5', marchandId: 'cocovico', produit: 'Oignon', quantite: 120, unite: 'tas', prixUnitaire: 600, derniereModification: new Date().toISOString() },
  { id: '6', marchandId: 'cocovico', produit: 'Attiéké', quantite: 300, unite: 'sachet', prixUnitaire: 300, derniereModification: new Date().toISOString() },
  { id: '7', marchandId: 'cocovico', produit: 'Piment', quantite: 80, unite: 'tas', prixUnitaire: 200, derniereModification: new Date().toISOString() },
  { id: '8', marchandId: 'cocovico', produit: 'Viande', quantite: 40, unite: 'kg', prixUnitaire: 3000, derniereModification: new Date().toISOString() },
  { id: '9', marchandId: 'cocovico', produit: 'Poisson fumé', quantite: 60, unite: 'tas', prixUnitaire: 1500, derniereModification: new Date().toISOString() },
  { id: '10', marchandId: 'cocovico', produit: 'Fruits', quantite: 100, unite: 'tas', prixUnitaire: 1000, derniereModification: new Date().toISOString() },
  { id: '11', marchandId: 'cocovico', produit: 'Manioc', quantite: 90, unite: 'tas', prixUnitaire: 500, derniereModification: new Date().toISOString() },
  { id: '12', marchandId: 'cocovico', produit: 'Gombo', quantite: 70, unite: 'tas', prixUnitaire: 200, derniereModification: new Date().toISOString() },
];

export function StockProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<StockItem[]>(MOCK_COCOVICO_STOCKS);
  const [loading, setLoading] = useState(false);

  const loadStocks = async () => {
    // Mode local uniquement, on ne touche pas à Supabase
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const addStock = async (data: Omit<StockItem, 'id' | 'derniereModification'>) => {
    const newItem: StockItem = {
      ...data,
      id: Date.now().toString(),
      derniereModification: new Date().toISOString(),
    };
    setStocks(prev => [...prev, newItem]);
  };

  const updateStock = async (id: string, data: Partial<StockItem>) => {
    setStocks(prev => prev.map(s => 
      s.id === id ? { ...s, ...data, derniereModification: new Date().toISOString() } : s
    ));
  };

  const deleteStock = async (id: string) => {
    setStocks(prev => prev.filter(s => s.id !== id));
  };

  const getStockByProduit = (produit: string): StockItem | undefined => {
    return stocks.find(s => s.produit === produit);
  };

  const getStockTotal = (): number => {
    return stocks.reduce((sum, s) => sum + s.quantite * s.prixUnitaire, 0);
  };

  const getStockFaible = (seuil: number = 5): StockItem[] => {
    return stocks.filter(s => s.quantite <= seuil);
  };

  const getValeurTotaleStock = (): number => {
    return stocks.reduce((sum, s) => sum + s.quantite * s.prixUnitaire, 0);
  };

  const getStock = (): StockItem[] => {
    return stocks;
  };

  const addProduct = async (data: Omit<StockItem, 'id' | 'derniereModification'>) => {
    return addStock(data);
  };

  const recordSale = async (produit: string, quantite: number) => {
    const item = stocks.find(s => s.produit === produit);
    if (item) {
      await updateStock(item.id, { quantite: Math.max(0, item.quantite - quantite) });
    }
  };

  const refreshStocks = async () => {
    await loadStocks();
  };

  const value: StockContextType = {
    stocks,
    stock: stocks,
    loading,
    addStock,
    updateStock,
    deleteStock,
    getStockByProduit,
    getStockTotal,
    getStockFaible,
    getValeurTotaleStock,
    getStock,
    addProduct,
    recordSale,
    refreshStocks,
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStock() {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within StockProvider');
  }
  return context;
}