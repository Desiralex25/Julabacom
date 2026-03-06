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

export function StockProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStocks = async () => {
    if (DEV_MODE) {
      devLog('StockContext', 'Mode dev - skip API call');
      return;
    }
    try {
      setLoading(true);
      const { stocks: data } = await stocksApi.fetchStocks();

      const stockList: StockItem[] = data.map((s: any) => ({
        id: s.id,
        marchandId: s.marchand_id,
        produit: s.produit,
        quantite: s.quantite,
        unite: s.unite,
        prixUnitaire: s.prix_unitaire,
        derniereModification: s.updated_at,
      }));

      setStocks(stockList);
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      console.error('Error loading stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const addStock = async (data: Omit<StockItem, 'id' | 'derniereModification'>) => {
    try {
      await stocksApi.createStock({
        produit: data.produit,
        quantite: data.quantite,
        unite: data.unite,
        prix_unitaire: data.prixUnitaire,
      });
      await loadStocks();
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  };

  const updateStock = async (id: string, data: Partial<StockItem>) => {
    try {
      await stocksApi.updateStock(id, {
        quantite: data.quantite,
        prix_unitaire: data.prixUnitaire,
      });
      await loadStocks();
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  const deleteStock = async (id: string) => {
    try {
      await stocksApi.deleteStock(id);
      setStocks(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting stock:', error);
      throw error;
    }
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