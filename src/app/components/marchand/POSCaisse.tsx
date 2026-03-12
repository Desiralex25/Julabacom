import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  Mic,
  MicOff,
  Check,
  CreditCard,
  Wallet,
  Smartphone,
  X,
  Package,
  QrCode,
  Percent,
  WifiOff,
  CheckCircle,
  XCircle,
  Loader2,
  UserPlus,
  Tag,
  User,
  Users,
  Wheat,
  Leaf,
  Apple,
  Flame,
  TrendingDown,
  ArrowLeft,
} from 'lucide-react';
import { useCaisse } from '../../contexts/CaisseContext';
import { useStock } from '../../contexts/StockContext';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { NotificationButton } from './NotificationButton';
import { TantieSagesse } from '../voice/TantieSagesse';
import * as ElevenLabs from '../../services/elevenlabs';

// ========== TYPES ==========
export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image?: string;
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

// ========== HELPER: Guess category from product name ==========
function guessCategoryFromName(name: string): string {
  const n = (name || '').toLowerCase();
  if (['riz', 'mais', 'maïs', 'mil', 'sorgho', 'fonio', 'ble'].some((k) => n.includes(k))) return 'Cereales';
  if (['tomate', 'oignon', 'gombo', 'aubergine', 'carotte', 'chou', 'haricot', 'salade', 'concombre', 'poivron'].some((k) => n.includes(k))) return 'Legumes';
  if (['banane', 'mangue', 'papaye', 'ananas', 'orange', 'citron', 'avocat', 'noix', 'coco', 'fruit'].some((k) => n.includes(k))) return 'Fruits';
  if (['piment', 'poivre', 'gingembre', 'curcuma', 'cannelle', 'epice', 'muscade'].some((k) => n.includes(k))) return 'Epices';
  if (['igname', 'manioc', 'attieke', 'patate', 'taro', 'macabo', 'tubercule'].some((k) => n.includes(k))) return 'Tubercules';
  return 'Cereales';
}

type PaymentMethod = 'card' | 'mobile_money' | 'cash' | 'qr_code';
type MobileOperator = 'orange' | 'mtn' | 'moov' | 'wave';
type ConversationState = 'welcome' | 'idle' | 'confirming' | 'payment_method' | 'payment_details' | 'processing';

interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalPurchases: number;
}

interface Discount {
  type: 'percentage' | 'amount';
  value: number;
  label: string;
}

interface PendingAction {
  type: 'add_product' | 'remove_product' | 'clear_cart' | 'apply_discount' | 'select_customer' | 'payment';
  data?: any;
}

// ========== CONFIGURATION ==========
const PRIMARY_COLOR = '#C66A2C';
const SUCCESS_COLOR = '#16A34A';
const ERROR_COLOR = '#DC2626';
const WARNING_COLOR = '#F59E0B';

const PAYMENT_METHODS = [
  { id: 'card' as PaymentMethod, label: 'Carte bancaire', icon: CreditCard, color: '#2563EB' },
  { id: 'mobile_money' as PaymentMethod, label: 'Mobile Money', icon: Smartphone, color: '#F59E0B' },
  { id: 'cash' as PaymentMethod, label: 'Espèces', icon: Wallet, color: SUCCESS_COLOR },
  { id: 'qr_code' as PaymentMethod, label: 'QR Code', icon: QrCode, color: '#8B5CF6' },
];

const MOBILE_OPERATORS = [
  { id: 'orange' as MobileOperator, name: 'Orange Money', color: '#FF6600' },
  { id: 'mtn' as MobileOperator, name: 'MTN Money', color: '#FFCC00' },
  { id: 'moov' as MobileOperator, name: 'Moov Money', color: '#009FE3' },
  { id: 'wave' as MobileOperator, name: 'Wave', color: '#00D9A5' },
];

const categories = [
  { id: 'all', label: 'Tout', icon: Package },
  { id: 'Cereales', label: 'Céréales', icon: Wheat },
  { id: 'Legumes', label: 'Légumes', icon: Leaf },
  { id: 'Fruits', label: 'Fruits', icon: Apple },
  { id: 'Epices', label: 'Épices', icon: Flame },
  { id: 'Tubercules', label: 'Tubercules', icon: Package },
];

// ========== MAIN COMPONENT ==========
export function POSCaisse() {
  const navigate = useNavigate();
  const { enregistrerVente } = useCaisse();
  const { stocks, recordSale } = useStock();
  const { user } = useApp();

  // Derive products from stock context
  const products: Product[] = (stocks || []).map((s) => ({
    id: s.id,
    name: s.produit,
    price: s.prixUnitaire,
    unit: s.unite || 'kg',
    category: guessCategoryFromName(s.produit),
    stock: s.quantite,
  }));

  // Local cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCartLocal = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, unitPrice: product.price }];
    });
  };

  const removeFromCartLocal = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartItemQuantityLocal = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartLocal(productId);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCartLocal = () => {
    setCart([]);
  };

  const getTotalCart = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, totalItems };
  };

  // ========== STATE ==========
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  
  // Tantie Sagesse states
  const [tantieSpeaking, setTantieSpeaking] = useState(false);
  const [tantieMessage, setTantieMessage] = useState('');
  const [conversationState, setConversationState] = useState<ConversationState>('welcome');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const hasWelcomed = useRef(false);

  // ========== CALCULATIONS ==========
  const filteredProducts = (products || []).filter((product: Product) => {
    const matchesSearch = (product.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = getTotalCart().subtotal;
  const cnpsRate = 0.03;
  const cmuRate = 0.02;
  const cnpsAmount = subtotal * cnpsRate;
  const cmuAmount = subtotal * cmuRate;
  
  let discountAmount = 0;
  if (discount) {
    discountAmount = discount.type === 'percentage' 
      ? subtotal * (discount.value / 100)
      : discount.value;
  }
  
  const totalBeforeTaxes = subtotal - discountAmount;
  const total = totalBeforeTaxes + cnpsAmount + cmuAmount;
  const totalItems = getTotalCart().totalItems;

  // ========== TANTIE SAGESSE FUNCTIONS ==========
  const speak = async (text: string) => {
    setTantieMessage(text);
    
    const onStart = () => setTantieSpeaking(true);
    const onEnd = () => {
      setTimeout(() => {
        setTantieSpeaking(false);
      }, 2000);
    };

    const success = await ElevenLabs.speak(text, undefined, onStart, onEnd);
    if (!success) {
      ElevenLabs.speakWithWebSpeech(text, onStart, onEnd);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setTantieSpeaking(false);
      setIsListening(false);
    }
  };

  // Message de bienvenue
  useEffect(() => {
    if (!hasWelcomed.current && user) {
      hasWelcomed.current = true;
      setTimeout(() => {
        speak(`Bienvenue ${user?.firstName || user?.prenoms || ''} a la Caisse Digitale. Tu souhaites que je t'aide a enregistrer tes ventes ou tu preferes le faire toi-meme ?`);
        setConversationState('idle');
      }, 1000);
    }
  }, [user]);

  // Trouver produit par nom
  const findProductByName = (text: string): Product | null => {
    const normalized = text.toLowerCase().trim();
    
    // Recherche exacte d'abord
    let product = products.find(p => (p.name || '').toLowerCase() === normalized);
    if (product) return product;
    
    // Recherche partielle
    product = products.find(p => (p.name || '').toLowerCase().includes(normalized));
    if (product) return product;
    
    // Recherche par mots-clés
    const keywords: Record<string, string[]> = {
      'riz': ['riz', 'ri'],
      'igname': ['igname', 'ignames', 'ignam'],
      'tomate': ['tomate', 'tomates'],
      'maïs': ['maïs', 'mais', 'maize'],
      'banane': ['banane', 'bananes', 'plantain'],
      'piment': ['piment', 'piments'],
      'aubergine': ['aubergine', 'aubergines'],
      'gombo': ['gombo', 'gombos'],
      'manioc': ['manioc'],
      'attiéké': ['attieke', 'attiéké', 'atieke'],
    };

    for (const [productKey, variants] of Object.entries(keywords)) {
      if (variants.some(variant => normalized.includes(variant))) {
        return products.find(p => (p.name || '').toLowerCase().includes(productKey)) || null;
      }
    }
    
    return null;
  };

  // Extraire quantité
  const extractQuantity = (text: string): number => {
    const numberWords: Record<string, number> = {
      'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5,
      'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10,
      'vingt': 20, 'trente': 30, 'quarante': 40, 'cinquante': 50,
    };

    const numberMatch = text.match(/(\d+)/);
    if (numberMatch) return parseInt(numberMatch[1]);

    for (const [word, num] of Object.entries(numberWords)) {
      if (text.includes(word)) return num;
    }
    return 1;
  };

  // Trouver client par nom
  const findCustomerByName = (text: string): Customer | null => {
    const customers: Customer[] = [
      { id: '1', name: 'Kouassi Jean', phone: '+225 07 12 34 56 78', points: 250, totalPurchases: 125000 },
      { id: '2', name: 'Aya Marie', phone: '+225 05 98 76 54 32', points: 180, totalPurchases: 89000 },
      { id: '3', name: 'Koné Abdoul', phone: '+225 01 23 45 67 89', points: 420, totalPurchases: 210000 },
    ];
    
    const normalized = text.toLowerCase();
    return customers.find(c => 
      normalized.includes(c.name.toLowerCase()) ||
      normalized.includes(c.name.split(' ')[0].toLowerCase()) ||
      normalized.includes(c.name.split(' ')[1].toLowerCase())
    ) || null;
  };

  // Traiter commande vocale
  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase().trim();

    // ===== CONFIRMATION =====
    if (conversationState === 'confirming' && pendingAction) {
      if (lowerCommand.includes('oui') || lowerCommand.includes('confirme') || lowerCommand.includes('ok') || lowerCommand.includes('valide')) {
        executeAction(pendingAction);
        return;
      } else if (lowerCommand.includes('non') || lowerCommand.includes('annule')) {
        speak('D\'accord, commande annulée');
        setPendingAction(null);
        setConversationState('idle');
        return;
      }
    }

    // ===== VIDER PANIER =====
    if (lowerCommand.includes('vide') && (lowerCommand.includes('panier') || lowerCommand.includes('tout'))) {
      setPendingAction({ type: 'clear_cart' });
      setConversationState('confirming');
      speak('Tu veux vraiment vider le panier ? Dis oui pour confirmer');
      return;
    }

    // ===== AJOUTER PRODUIT =====
    if (lowerCommand.includes('ajoute') || lowerCommand.includes('ajout') || lowerCommand.includes('mets')) {
      const product = findProductByName(lowerCommand);
      if (product) {
        const quantity = extractQuantity(lowerCommand);
        addToCart(product, quantity);
        const itemTotal = product.price * quantity;
        speak(`${quantity} ${product.unit} de ${product.name} ajouté, le total fait ${total + itemTotal} francs CFA`);
      } else {
        speak('Je n\'ai pas trouvé ce produit. Peux-tu répéter le nom ?');
      }
      return;
    }

    // ===== MODIFIER QUANTITÉ =====
    if (lowerCommand.includes('modifie') || lowerCommand.includes('change')) {
      const product = findProductByName(lowerCommand);
      if (product) {
        const quantity = extractQuantity(lowerCommand);
        const cartItem = cart.find(item => item.product.id === product.id);
        if (cartItem) {
          updateQuantity(product.id, quantity);
          speak(`Quantité modifiée : ${quantity} ${product.unit} de ${product.name}`);
        } else {
          speak('Ce produit n\'est pas dans le panier');
        }
      }
      return;
    }

    // ===== RETIRER PRODUIT =====
    if (lowerCommand.includes('retire') || lowerCommand.includes('enlève') || lowerCommand.includes('supprime')) {
      const product = findProductByName(lowerCommand);
      if (product) {
        const cartItem = cart.find(item => item.product.id === product.id);
        if (cartItem) {
          removeFromCart(product.id);
          speak(`${product.name} retiré du panier`);
        } else {
          speak('Ce produit n\'est pas dans le panier');
        }
      }
      return;
    }

    // ===== REMISE =====
    if (lowerCommand.includes('remise') || lowerCommand.includes('réduction') || lowerCommand.includes('promo')) {
      const percentMatch = lowerCommand.match(/(\d+)\s*(?:pour\s*cent|pourcent|%)/);
      const amountMatch = lowerCommand.match(/(\d+)\s*(?:franc|fcfa)/);
      
      if (percentMatch) {
        const value = parseInt(percentMatch[1]);
        applyDiscount('percentage', value, `Remise ${value}%`);
        speak(`Remise de ${value} pourcent appliquée`);
      } else if (amountMatch) {
        const value = parseInt(amountMatch[1]);
        applyDiscount('amount', value, `Remise ${value} FCFA`);
        speak(`Remise de ${value} francs CFA appliquée`);
      } else {
        speak('Je n\'ai pas compris le montant de la remise. Dis par exemple : remise de 10 pourcent');
      }
      return;
    }

    // ===== CLIENT =====
    if (lowerCommand.includes('client')) {
      const customer = findCustomerByName(lowerCommand);
      if (customer) {
        selectCustomer(customer);
        speak(`Client ${customer.name} sélectionné`);
      } else {
        speak('Je n\'ai pas trouvé ce client dans la liste');
      }
      return;
    }

    // ===== FILTRER CATÉGORIE =====
    if (lowerCommand.includes('montre') || lowerCommand.includes('affiche') || lowerCommand.includes('filtre')) {
      if (lowerCommand.includes('légume')) {
        setSelectedCategory('Legumes');
        speak('Voici les légumes disponibles');
      } else if (lowerCommand.includes('fruit')) {
        setSelectedCategory('Fruits');
        speak('Voici les fruits disponibles');
      } else if (lowerCommand.includes('céréale')) {
        setSelectedCategory('Cereales');
        speak('Voici les céréales disponibles');
      } else if (lowerCommand.includes('épice')) {
        setSelectedCategory('Epices');
        speak('Voici les épices disponibles');
      } else if (lowerCommand.includes('tubercule')) {
        setSelectedCategory('Tubercules');
        speak('Voici les tubercules disponibles');
      } else if (lowerCommand.includes('tout')) {
        setSelectedCategory('all');
        speak('Tous les produits affichés');
      }
      return;
    }

    // ===== PAIEMENT =====
    if (lowerCommand.includes('paiement') || lowerCommand.includes('paye') || lowerCommand.includes('encaisse')) {
      if (cart.length === 0) {
        speak('Le panier est vide, ajoute des produits d\'abord');
        return;
      }

      // Détection méthode de paiement
      if (lowerCommand.includes('mobile') || lowerCommand.includes('orange') || lowerCommand.includes('mtn') || lowerCommand.includes('moov') || lowerCommand.includes('wave')) {
        setPaymentMethod('mobile_money');
        setShowPaymentModal(true);
        speak(`Paiement de ${total.toLocaleString()} francs CFA par mobile money`);
      } else if (lowerCommand.includes('carte') || lowerCommand.includes('bancaire')) {
        setPaymentMethod('card');
        setShowPaymentModal(true);
        speak(`Paiement de ${total.toLocaleString()} francs CFA par carte bancaire`);
      } else if (lowerCommand.includes('espèce') || lowerCommand.includes('cash') || lowerCommand.includes('liquide')) {
        setPaymentMethod('cash');
        setShowPaymentModal(true);
        speak(`Paiement de ${total.toLocaleString()} francs CFA en espèces`);
      } else if (lowerCommand.includes('qr') || lowerCommand.includes('code')) {
        setPaymentMethod('qr_code');
        setShowPaymentModal(true);
        speak(`Paiement de ${total.toLocaleString()} francs CFA par QR code`);
      } else {
        setShowPaymentModal(true);
        speak(`Le total est de ${total.toLocaleString()} francs CFA. Choisis ta méthode de paiement`);
      }
      return;
    }

    // ===== TOTAL =====
    if (lowerCommand.includes('total') || lowerCommand.includes('combien') || lowerCommand.includes('montant')) {
      if (cart.length === 0) {
        speak('Le panier est vide');
      } else {
        speak(`Le total du panier est de ${total.toLocaleString()} francs CFA pour ${totalItems} article${totalItems > 1 ? 's' : ''}`);
      }
      return;
    }

    // ===== AIDE =====
    if (lowerCommand.includes('aide') || lowerCommand.includes('comment') || lowerCommand.includes('que faire')) {
      speak('Je peux t\'aider à ajouter des produits, modifier les quantités, appliquer des remises, sélectionner un client et encaisser. Dis-moi ce que tu veux faire');
      return;
    }

    // Commande non reconnue
    speak('Je n\'ai pas bien compris. Peux-tu répéter ou dire "aide" pour connaître mes commandes ?');
  };

  const executeAction = (action: PendingAction) => {
    switch (action.type) {
      case 'clear_cart':
        clearCart();
        speak('Panier vidé');
        break;
      case 'payment':
        handlePayment();
        break;
    }
    setPendingAction(null);
    setConversationState('idle');
  };

  // ========== HANDLERS ==========
  const addToCart = (product: Product, quantity: number = 1) => {
    addToCartLocal(product, quantity);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartLocal(productId);
    } else {
      updateCartItemQuantityLocal(productId, quantity);
    }
  };

  const removeFromCart = (productId: string) => {
    removeFromCartLocal(productId);
  };

  const clearCart = () => {
    clearCartLocal();
    setDiscount(null);
    setSelectedCustomer(null);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const produitsData = cart.map((item) => ({
        produit: item.product.name,
        quantite: item.quantity,
        prixUnitaire: item.unitPrice,
        total: item.unitPrice * item.quantity,
      }));

      await enregistrerVente(
        total,
        produitsData,
        paymentMethod,
        selectedCustomer ? `Client: ${selectedCustomer.name}` : undefined
      );

      // Update stock for each sold item
      for (const item of cart) {
        try {
          await recordSale(item.product.name, item.quantity);
        } catch (e) {
          console.warn('Stock update failed for', item.product.name, e);
        }
      }

      const transaction = {
        id: `TXN-${Date.now()}`,
        type: 'vente' as const,
        amount: total,
        items: cart,
        timestamp: Date.now(),
        synced: isOnline,
        source: 'caisse' as const,
        paymentMethod: paymentMethod as any,
        cnps: cnpsAmount,
        cmu: cmuAmount,
        discount: discountAmount,
        customer: selectedCustomer,
      };

      setLastTransaction(transaction);
      clearCart();
      setIsProcessing(false);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      speak(`Paiement valide. Montant total ${total} francs CFA`);
    } catch (err) {
      console.error('Payment error:', err);
      setIsProcessing(false);
      setShowPaymentModal(false);
      setShowErrorModal(true);
      speak('Paiement refuse. Veuillez reessayer');
    }
  };

  const applyDiscount = (type: 'percentage' | 'amount', value: number, label: string) => {
    setDiscount({ type, value, label });
    setShowDiscountModal(false);
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowClientModal(false);
  };

  // Voice recognition - Pour les commandes vocales
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('La recherche vocale n\'est pas supportée par votre navigateur');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processVoiceCommand(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Network status
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

  // ========== RENDER ==========
  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-3 px-4 flex items-center justify-center gap-2"
          >
            <WifiOff className="w-5 h-5" />
            <span className="font-semibold">Mode hors ligne - Les transactions seront synchronisées</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header fixe */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-orange-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <motion.button
                onClick={() => navigate('/marchand')}
                className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </motion.button>
              <h1 className="font-bold text-gray-900 text-xl sm:text-2xl md:text-3xl">
                Caisse Digitale
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <NotificationButton />
              <motion.button
                onClick={() => setShowCartDrawer(true)}
                className="relative w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {totalItems > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C46210] text-white text-[10px] font-bold flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {totalItems}
                  </motion.div>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-orange-50 to-white">
        
        {/* Barre de recherche */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-base placeholder:text-gray-400 shadow-sm"
            />
            <motion.button
              onClick={startVoiceSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-100"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isListening ? <MicOff className="w-5 h-5 text-[#C46210]" /> : <Mic className="w-5 h-5 text-gray-400" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Filtres catégories */}
        <div className="flex items-center gap-3 lg:gap-4 overflow-x-auto pb-4 mb-5 scrollbar-hide">
          {categories.map((cat, index) => {
            const IconComponent = cat.icon;
            return (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex flex-col items-center justify-center gap-2 min-w-[90px] lg:min-w-[140px] px-4 lg:px-6 py-3 lg:py-5 rounded-2xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-br from-[#C46210] to-[#D97706] text-white shadow-lg shadow-orange-300/50'
                    : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <IconComponent 
                  className={`w-8 h-8 lg:w-10 lg:h-10 ${
                    selectedCategory === cat.id ? 'text-white' : 'text-[#C46210]'
                  }`}
                  strokeWidth={2.5}
                />
                <span className={`text-xs lg:text-sm font-semibold ${
                  selectedCategory === cat.id ? 'text-white' : 'text-gray-600'
                }`}>
                  {cat.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Grille produits */}
        {filteredProducts.length === 0 ? (
          <EmptyState message="Aucun produit trouvé" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={(p) => addToCart(p, 1)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tantie Voice Assistant */}
      <TantieSagesse 
        isVisible={isListening || tantieSpeaking} 
        isSpeaking={tantieSpeaking}
        onSkip={stopSpeaking}
      />

      {/* Mobile Cart Drawer - Style Marché Virtuel */}
      <AnimatePresence>
        {showCartDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => setShowCartDrawer(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              {/* Header sticky */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-[#C46210]" />
                  Panier ({totalItems})
                </h2>
                <motion.button
                  onClick={() => setShowCartDrawer(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Contenu */}
              <div className="p-6 space-y-4 pb-8">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Votre panier est vide</p>
                  </div>
                ) : (
                  <>
                    {/* Items du panier */}
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 rounded-2xl p-4"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                            {item.product.image ? (
                              <ImageWithFallback
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{item.product.name}</h3>
                            <p className="text-sm text-gray-500">Stock: {item.product.stock || 0} {item.product.unit}</p>
                            <p className="text-lg font-bold text-[#C46210] mt-1">
                              {item.unitPrice.toLocaleString('fr-FR')} FCFA / {item.product.unit}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center"
                              whileTap={{ scale: 0.9 }}
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <span className="w-12 text-center font-bold">{item.quantity}</span>
                            <motion.button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-[#C46210] text-white flex items-center justify-center"
                              whileTap={{ scale: 0.9 }}
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <p className="text-xl font-bold text-gray-900">
                            {(item.unitPrice * item.quantity).toLocaleString()} F
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {/* Client & Discount - Style cards */}
                    {selectedCustomer && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 rounded-2xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-bold text-gray-900">{selectedCustomer.name}</p>
                              <p className="text-sm text-gray-600">{selectedCustomer.points} points fidélité</p>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => setSelectedCustomer(null)}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {discount && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 rounded-2xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-bold text-gray-900">{discount.label}</p>
                              <p className="text-sm text-gray-600">-{discountAmount.toLocaleString()} FCFA</p>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => setDiscount(null)}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Actions - Style Marché */}
                    <div className="flex gap-2">
                      {!selectedCustomer && (
                        <motion.button
                          onClick={() => setShowClientModal(true)}
                          className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2"
                          whileTap={{ scale: 0.95 }}
                        >
                          <UserPlus className="w-4 h-4" />
                          Client
                        </motion.button>
                      )}
                      {!discount && (
                        <motion.button
                          onClick={() => setShowDiscountModal(true)}
                          className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2"
                          whileTap={{ scale: 0.95 }}
                        >
                          <Percent className="w-4 h-4" />
                          Remise
                        </motion.button>
                      )}
                    </div>

                    {/* Résumé détaillé */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sous-total</span>
                        <span className="font-semibold text-gray-900">{subtotal.toLocaleString()} F</span>
                      </div>
                      
                      {discount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Remise</span>
                          <span className="font-semibold text-green-600">-{discountAmount.toLocaleString()} F</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CNPS (3%)</span>
                        <span className="font-semibold text-gray-900">{cnpsAmount.toLocaleString()} F</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CMU (2%)</span>
                        <span className="font-semibold text-gray-900">{cmuAmount.toLocaleString()} F</span>
                      </div>
                    </div>

                    {/* Total et bouton paiement */}
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-3xl font-bold text-[#C46210]">
                          {total.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>

                      <motion.button
                        onClick={() => {
                          setShowCartDrawer(false);
                          setShowPaymentModal(true);
                        }}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C46210] to-[#D97706] text-white font-bold text-lg shadow-lg"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        Procéder au paiement
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal
            total={total}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            isProcessing={isProcessing}
            onConfirm={handlePayment}
            onCancel={() => setShowPaymentModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <SuccessModal
            transaction={lastTransaction}
            onClose={() => setShowSuccessModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <ErrorModal
            onRetry={() => {
              setShowErrorModal(false);
              setShowPaymentModal(true);
            }}
            onCancel={() => setShowErrorModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Discount Modal */}
      <AnimatePresence>
        {showDiscountModal && (
          <DiscountModal
            onApply={applyDiscount}
            onClose={() => setShowDiscountModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Client Modal */}
      <AnimatePresence>
        {showClientModal && (
          <ClientModal
            onSelect={selectCustomer}
            onClose={() => setShowClientModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ========== PRODUCT CARD ==========
interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  index: number;
}

function ProductCard({ product, onAdd, index }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const isLowStock = (product.stock || 0) < 10;
  const isOutOfStock = (product.stock || 0) === 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    
    setIsAdding(true);
    onAdd(product);
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`relative bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-3xl overflow-hidden shadow-md border-2 ${
        isLowStock ? 'border-orange-400' : 'border-gray-200'
      }`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -4, boxShadow: '0 10px 30px rgba(196, 98, 16, 0.15)' }}
    >
      {isLowStock && !isOutOfStock && (
        <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          Stock bas
        </div>
      )}

      {isOutOfStock && (
        <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">
          Rupture
        </div>
      )}

      <div className="relative w-full h-40 bg-gray-100">
        {product.image ? (
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-900 mb-1.5 leading-tight">
          {product.name}
        </h3>

        <p className="text-2xl font-bold text-[#C46210] mb-3">
          {product.price.toLocaleString('fr-FR')} FCFA
          <span className="text-xs text-gray-500 ml-1">/{product.unit}</span>
        </p>

        <motion.button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-md ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#C46210] text-white'
          }`}
          whileTap={isOutOfStock ? {} : { scale: 0.95 }}
          whileHover={isOutOfStock ? {} : { scale: 1.02, boxShadow: '0 8px 20px rgba(196, 98, 16, 0.3)' }}
        >
          {isAdding ? (
            <Check className="w-4 h-4" strokeWidth={3} />
          ) : (
            <>
              <Plus className="w-4 h-4" strokeWidth={3} />
              Ajouter
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ========== PAYMENT MODAL ==========
interface PaymentModalProps {
  total: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function PaymentModal({
  total,
  paymentMethod,
  setPaymentMethod,
  isProcessing,
  onConfirm,
  onCancel,
}: PaymentModalProps) {
  const [selectedOperator, setSelectedOperator] = useState<MobileOperator>('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  const change = cashReceived ? parseFloat(cashReceived) - total : 0;

  const canConfirm = () => {
    if (paymentMethod === 'mobile_money') return phoneNumber.length >= 10;
    if (paymentMethod === 'card') return cardNumber.length === 16 && cvv.length === 3;
    if (paymentMethod === 'cash') return parseFloat(cashReceived || '0') >= total;
    if (paymentMethod === 'qr_code') return confirmationCode.length >= 6;
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white rounded-[20px] w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Paiement</h3>
            <motion.button
              onClick={onCancel}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6 p-4 rounded-xl bg-gray-50">
            <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
            <p className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
              {total.toLocaleString()} FCFA
            </p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              
              return (
                <motion.button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full h-12 rounded-xl flex items-center gap-3 px-4 border-2 transition-all ${
                    isSelected
                      ? 'border-current shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    borderColor: isSelected ? method.color : undefined,
                    backgroundColor: isSelected ? `${method.color}10` : undefined,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" style={{ color: method.color }} />
                  <span className="font-semibold text-gray-900">{method.label}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <Check className="w-5 h-5" style={{ color: method.color }} />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Payment Details */}
          <AnimatePresence mode="wait">
            {paymentMethod === 'mobile_money' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 mb-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opérateur</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MOBILE_OPERATORS.map((op) => (
                      <button
                        key={op.id}
                        onClick={() => setSelectedOperator(op.id)}
                        className={`p-3 rounded-xl border-2 font-semibold text-sm ${
                          selectedOperator === op.id
                            ? 'border-current shadow-md'
                            : 'border-gray-200'
                        }`}
                        style={{
                          borderColor: selectedOperator === op.id ? op.color : undefined,
                          backgroundColor: selectedOperator === op.id ? `${op.color}10` : undefined,
                        }}
                      >
                        {op.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+225 XX XX XX XX XX"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            {paymentMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 mb-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de carte</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            {paymentMethod === 'cash' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 mb-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Montant reçu</label>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder={total.toString()}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
                  />
                </div>
                {change > 0 && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                    <p className="text-sm text-gray-600">Monnaie à rendre</p>
                    <p className="text-2xl font-bold text-green-600">{change.toLocaleString()} FCFA</p>
                  </div>
                )}
              </motion.div>
            )}

            {paymentMethod === 'qr_code' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 mb-6"
              >
                <div className="p-8 bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code de confirmation</label>
                  <input
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    placeholder="XXXXXX"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={onConfirm}
            disabled={isProcessing || !canConfirm()}
            className="w-full h-12 rounded-xl text-white font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: SUCCESS_COLOR }}
            whileHover={isProcessing || !canConfirm() ? {} : { scale: 1.02 }}
            whileTap={isProcessing || !canConfirm() ? {} : { scale: 0.98 }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Confirmer le paiement
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== SUCCESS MODAL ==========
interface SuccessModalProps {
  transaction: any;
  onClose: () => void;
}

function SuccessModal({ transaction, onClose }: SuccessModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white rounded-[20px] w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>

          <h3 className="text-2xl font-bold mb-2">Paiement réussi !</h3>
          <p className="text-gray-600 mb-6">La transaction a été enregistrée avec succès</p>

          {transaction && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Numéro de transaction</span>
                <span className="text-sm font-bold">{transaction.id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Montant</span>
                <span className="text-sm font-bold">{transaction.amount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Méthode</span>
                <span className="text-sm font-bold capitalize">
                  {transaction.paymentMethod?.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          <motion.button
            onClick={onClose}
            className="w-full h-12 rounded-xl text-white font-bold shadow-lg"
            style={{ backgroundColor: SUCCESS_COLOR }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Nouvelle vente
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== ERROR MODAL ==========
interface ErrorModalProps {
  onRetry: () => void;
  onCancel: () => void;
}

function ErrorModal({ onRetry, onCancel }: ErrorModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white rounded-[20px] w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center"
          >
            <XCircle className="w-12 h-12 text-red-600" />
          </motion.div>

          <h3 className="text-2xl font-bold mb-2">Paiement refusé</h3>
          <p className="text-gray-600 mb-6">
            Le paiement n'a pas pu être traité. Veuillez vérifier les informations et réessayer.
          </p>

          <div className="flex gap-3">
            <motion.button
              onClick={onCancel}
              className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-700 font-bold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Annuler
            </motion.button>
            <motion.button
              onClick={onRetry}
              className="flex-1 h-12 rounded-xl text-white font-bold shadow-lg"
              style={{ backgroundColor: PRIMARY_COLOR }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Réessayer
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== DISCOUNT MODAL ==========
interface DiscountModalProps {
  onApply: (type: 'percentage' | 'amount', value: number, label: string) => void;
  onClose: () => void;
}

function DiscountModal({ onApply, onClose }: DiscountModalProps) {
  const [type, setType] = useState<'percentage' | 'amount'>('percentage');
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');

  const handleApply = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    
    onApply(type, numValue, label || `Remise ${type === 'percentage' ? `${numValue}%` : `${numValue} FCFA`}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[20px] w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Ajouter une remise</h3>
            <motion.button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setType('percentage')}
              className={`flex-1 h-10 rounded-xl font-semibold transition-all ${
                type === 'percentage'
                  ? 'bg-[#C46210] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Pourcentage %
            </button>
            <button
              onClick={() => setType('amount')}
              className={`flex-1 h-10 rounded-xl font-semibold transition-all ${
                type === 'amount'
                  ? 'bg-[#C46210] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Montant fixe
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'percentage' ? 'Pourcentage' : 'Montant'} de remise
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === 'percentage' ? '10' : '5000'}
              className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Libellé (optionnel)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Promotion fidélité"
              className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
            />
          </div>

          <motion.button
            onClick={handleApply}
            disabled={!value || parseFloat(value) <= 0}
            className="w-full h-12 rounded-xl text-white font-bold shadow-lg disabled:opacity-50"
            style={{ backgroundColor: SUCCESS_COLOR }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Appliquer la remise
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== CLIENT MODAL ==========
interface ClientModalProps {
  onSelect: (customer: Customer) => void;
  onClose: () => void;
}

function ClientModal({ onSelect, onClose }: ClientModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const customers: Customer[] = [
    { id: '1', name: 'Kouassi Jean', phone: '+225 07 12 34 56 78', points: 250, totalPurchases: 125000 },
    { id: '2', name: 'Aya Marie', phone: '+225 05 98 76 54 32', points: 180, totalPurchases: 89000 },
    { id: '3', name: 'Koné Abdoul', phone: '+225 01 23 45 67 89', points: 420, totalPurchases: 210000 },
  ];

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[20px] w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Sélectionner un client</h3>
            <motion.button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou téléphone..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#C46210] focus:outline-none"
            />
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {filteredCustomers.map((customer) => (
              <motion.button
                key={customer.id}
                onClick={() => onSelect(customer)}
                className="w-full p-3 rounded-xl border border-gray-200 hover:border-[#C46210] hover:bg-orange-50 text-left transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: PRIMARY_COLOR }}>
                      {customer.points} pts
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer.totalPurchases.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun client trouvé</p>
            </div>
          )}

          <motion.button
            className="w-full mt-4 h-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#C46210] flex items-center justify-center gap-2 text-gray-600 hover:text-[#C46210] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Créer un nouveau client</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== EMPTY STATE ==========
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <Package className="w-16 h-16 mb-4 opacity-30" />
      <p className="text-lg font-semibold">{message}</p>
    </div>
  );
}
