import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
  unit: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number; // Prix modifiable
}

export interface Transaction {
  id: string;
  type: 'vente' | 'depense' | 'epargne-depot' | 'epargne-retrait' | 'epargne';
  amount: number;
  items?: any[]; // Cart items for detailed sales
  product?: string;
  category?: string;
  quantity?: number;
  unitPrice?: number;
  note?: string;
  description?: string;
  timestamp: number;
  synced: boolean;
  source?: 'caisse' | 'vocal'; // Source de la transaction
  paymentMethod?: 'mobile_money' | 'wallet' | 'cash';
  cnps?: number; // Montant CNPS
  cmu?: number; // Montant CMU
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entree' | 'sortie' | 'ajustement' | 'vente';
  quantity: number;
  unit: string;
  reason?: string;
  note?: string;
  timestamp: number;
  previousStock: number;
  newStock: number;
}

interface CaisseStats {
  ventesJour: number;
  depensesJour: number;
  epargne: number;
  solde: number;
  cnps: number;
  cmu: number;
}

interface CaisseContextType {
  transactions: Transaction[];
  stats: CaisseStats;
  isOnline: boolean;
  products: Product[];
  cart: CartItem[];
  stockMovements: StockMovement[];
  speak: (text: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  updateCartItemPrice: (productId: string, price: number) => void;
  clearCart: () => void;
  getTotalCart: () => { subtotal: number, totalItems: number };
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'synced'>) => void;
  deleteTransaction: (id: string) => void;
  getTodayTransactions: () => Transaction[];
  getTransactionsByType: (type: Transaction['type']) => Transaction[];
  syncTransactions: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'timestamp' | 'previousStock' | 'newStock'>) => void;
  getStockMovementsByProduct: (productId: string) => StockMovement[];
  getLowStockProducts: (threshold?: number) => Product[];
}

const CaisseContext = createContext<CaisseContextType | undefined>(undefined);

const STORAGE_KEY = 'julaba_caisse_transactions';
const PRODUCTS_STORAGE_KEY = 'julaba_caisse_products';
const STOCK_MOVEMENTS_STORAGE_KEY = 'julaba_caisse_stock_movements';
const CNPS_RATE = 0.035; // 3.5% pour CNPS
const CMU_RATE = 0.02; // 2% pour CMU

// Produits par défaut pour la Côte d'Ivoire
const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Riz local', category: 'Cereales', price: 650, unit: 'kg', stock: 150, image: 'https://images.unsplash.com/photo-1743674452796-ad8d0cf38005?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHJpY2UlMjBncmFpbnMlMjBib3dsfGVufDF8fHx8MTc3MjM2Njg2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '2', name: 'Tomates', category: 'Legumes', price: 350, unit: 'kg', stock: 45, image: 'https://images.unsplash.com/photo-1443131612988-32b6d97cc5da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHJlZCUyMHRvbWF0b2VzfGVufDF8fHx8MTc3MjI4OTM3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '3', name: 'Oignons', category: 'Legumes', price: 400, unit: 'kg', stock: 80, image: 'https://images.unsplash.com/photo-1756361946737-6a1a2784928c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmlvbnMlMjBidWxiJTIwdmVnZXRhYmxlfGVufDF8fHx8MTc3MjM2Njg2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '4', name: 'Huile', category: 'Epices', price: 1500, unit: 'L', stock: 25, image: 'https://images.unsplash.com/photo-1757801333069-f7b3cabaec4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsJTIwYm90dGxlfGVufDF8fHx8MTc3MjI5NjQ0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '5', name: 'Ignames', category: 'Tubercules', price: 400, unit: 'kg', stock: 120, image: 'https://images.unsplash.com/photo-1757332051150-a5b3c4510af8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5YW0lMjB0dWJlciUyMHZlZ2V0YWJsZSUyMGZyZXNofGVufDF8fHx8MTc3MjM2Njg2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '6', name: 'Plantain', category: 'Fruits', price: 300, unit: 'régimes', stock: 15, image: 'https://images.unsplash.com/photo-1635013973792-2d1595bfa0b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudGFpbiUyMGJhbmFuYSUyMGJ1bmNofGVufDF8fHx8MTc3MjM2Njg3MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '7', name: 'Piment', category: 'Epices', price: 200, unit: 'tas', stock: 8, image: 'https://images.unsplash.com/photo-1761669411746-8f401c29e9a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBjaGlsaSUyMHBlcHBlciUyMGZyZXNofGVufDF8fHx8MTc3MjM2Njg3MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '8', name: 'Gombo', category: 'Legumes', price: 150, unit: 'tas', stock: 30, image: 'https://images.unsplash.com/photo-1654786733145-78fa33b56de0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxva3JhJTIwZ3JlZW4lMjB2ZWdldGFibGV8ZW58MXx8fHwxNzcyMzY2ODcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '9', name: 'Maïs', category: 'Cereales', price: 500, unit: 'kg', stock: 100, image: 'https://images.unsplash.com/photo-1651667343153-6dc318e27e41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuJTIwbWFpemUlMjB5ZWxsb3clMjBncmFpbnN8ZW58MXx8fHwxNzcyMzY2ODcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '10', name: 'Aubergines', category: 'Legumes', price: 800, unit: 'kg', stock: 35, image: 'https://images.unsplash.com/photo-1659260180173-8d58b38648f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZ2dwbGFudCUyMGF1YmVyZ2luZSUyMHB1cnBsZXxlbnwxfHx8fDE3NzIzNjY4NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
];

export function CaisseProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load transactions:', e);
      }
    }

    const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (savedProducts) {
      try {
        const loadedProducts = JSON.parse(savedProducts);
        // Merge avec les images des DEFAULT_PRODUCTS
        const updatedProducts = loadedProducts.map((product: Product) => {
          const defaultProduct = DEFAULT_PRODUCTS.find(p => p.id === product.id);
          return {
            ...product,
            image: defaultProduct?.image || product.image,
          };
        });
        setProducts(updatedProducts);
      } catch (e) {
        console.error('Failed to load products:', e);
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      // Si aucun produit en localStorage, utiliser DEFAULT_PRODUCTS
      setProducts(DEFAULT_PRODUCTS);
    }

    const savedStockMovements = localStorage.getItem(STOCK_MOVEMENTS_STORAGE_KEY);
    if (savedStockMovements) {
      try {
        setStockMovements(JSON.parse(savedStockMovements));
      } catch (e) {
        console.error('Failed to load stock movements:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STOCK_MOVEMENTS_STORAGE_KEY, JSON.stringify(stockMovements));
  }, [stockMovements]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate stats
  const calculateStats = (): CaisseStats => {
    const today = new Date().setHours(0, 0, 0, 0);
    
    let ventesJour = 0;
    let depensesJour = 0;
    let epargne = 0;

    transactions.forEach((t) => {
      const transactionDate = new Date(t.timestamp).setHours(0, 0, 0, 0);
      
      if (transactionDate === today) {
        if (t.type === 'vente') {
          ventesJour += t.amount;
        } else if (t.type === 'depense') {
          depensesJour += t.amount;
        }
      }

      if (t.type === 'epargne-depot') {
        epargne += t.amount;
      } else if (t.type === 'epargne-retrait') {
        epargne -= t.amount;
      }
    });

    // Calculate CNPS & CMU on sales
    const cnps = ventesJour * CNPS_RATE;
    const cmu = ventesJour * CMU_RATE;
    const solde = ventesJour - depensesJour;

    return { ventesJour, depensesJour, epargne, solde, cnps, cmu };
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp' | 'synced'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      synced: isOnline,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getTodayTransactions = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    return transactions.filter((t) => {
      const transactionDate = new Date(t.timestamp).setHours(0, 0, 0, 0);
      return transactionDate === today;
    });
  };

  const getTransactionsByType = (type: Transaction['type']) => {
    return transactions.filter((t) => t.type === type);
  };

  const syncTransactions = async () => {
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setTransactions((prev) =>
      prev.map((t) => ({ ...t, synced: true }))
    );
  };

  // Cart management
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, unitPrice: product.price }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateCartItemPrice = (productId: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, unitPrice: price } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalCart = () => {
    const subtotal = cart.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    return { subtotal, totalItems };
  };

  // Product management
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...product } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Stock movement management
  const addStockMovement = (movement: Omit<StockMovement, 'id' | 'timestamp' | 'previousStock' | 'newStock'>) => {
    // Get product to calculate previous and new stock
    const product = products.find((p) => p.id === movement.productId);
    if (!product) return;

    const previousStock = product.stock || 0;
    let newStock = previousStock;

    // Calculate new stock based on movement type
    if (movement.type === 'entree') {
      newStock = previousStock + movement.quantity;
    } else if (movement.type === 'sortie' || movement.type === 'vente') {
      newStock = previousStock - movement.quantity;
    } else if (movement.type === 'ajustement') {
      newStock = movement.quantity; // For adjustments, quantity is the absolute new stock
    }

    const newMovement: StockMovement = {
      ...movement,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      previousStock,
      newStock,
    };

    setStockMovements((prev) => [newMovement, ...prev]);
    
    // ✅ UPDATE PRODUCT STOCK AUTOMATICALLY
    updateProduct(movement.productId, { stock: newStock });
  };

  const getStockMovementsByProduct = (productId: string) => {
    return stockMovements.filter((m) => m.productId === productId);
  };

  const getLowStockProducts = (threshold: number = 10) => {
    return products.filter((p) => p.stock !== undefined && p.stock <= threshold);
  };

  const stats = calculateStats();

  return (
    <CaisseContext.Provider
      value={{
        transactions,
        stats,
        isOnline,
        products,
        cart,
        stockMovements,
        speak: (text: string) => {
          const utterance = new SpeechSynthesisUtterance(text);
          speechSynthesis.speak(utterance);
        },
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        updateCartItemPrice,
        clearCart,
        getTotalCart,
        addTransaction,
        deleteTransaction,
        getTodayTransactions,
        getTransactionsByType,
        syncTransactions,
        addProduct,
        updateProduct,
        deleteProduct,
        addStockMovement,
        getStockMovementsByProduct,
        getLowStockProducts,
      }}
    >
      {children}
    </CaisseContext.Provider>
  );
}

export function useCaisse() {
  const context = useContext(CaisseContext);
  if (!context) {
    // En développement, retourner des valeurs par défaut au lieu de crasher
    console.warn('useCaisse called outside of CaisseProvider - using default values');
    return {
      transactions: [],
      stats: { ventesJour: 0, depensesJour: 0, epargne: 0, solde: 0, cnps: 0, cmu: 0 },
      isOnline: true,
      products: [],
      cart: [],
      stockMovements: [],
      speak: () => {},
      addToCart: () => {},
      removeFromCart: () => {},
      updateCartItemQuantity: () => {},
      updateCartItemPrice: () => {},
      clearCart: () => {},
      getTotalCart: () => ({ subtotal: 0, totalItems: 0 }),
      addTransaction: () => {},
      deleteTransaction: () => {},
      getTodayTransactions: () => [],
      getTransactionsByType: () => [],
      syncTransactions: async () => {},
      addProduct: () => {},
      updateProduct: () => {},
      deleteProduct: () => {},
      addStockMovement: () => {},
      getStockMovementsByProduct: () => [],
      getLowStockProducts: () => [],
    } as CaisseContextType;
  }
  return context;
}

// Optional hook that doesn't throw error if provider is not available
export function useCaisseOptional() {
  const context = useContext(CaisseContext);
  return context || null;
}