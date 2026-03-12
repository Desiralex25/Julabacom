import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  TrendingUp,
  AlertCircle,
  Plus,
  Search,
  Trash2,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ArrowLeft,
  Filter,
  SortAsc,
  Mic,
  MicOff,
  Volume2,
  Edit3,
  Receipt,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Montant, MontantCard } from '../shared/Montant';
import { Navigation } from '../layout/Navigation';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../hooks/useToast';
import { TantieSagesse } from '../voice/TantieSagesse';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ImagePickerField } from '../shared/ImagePickerField';
import { SelectWithAutre } from '../shared/SelectWithAutre';
import { NotificationButton } from './NotificationButton';
import { VenteVocaleModal } from './VenteVocaleModal';
import { useCaisse } from '../../contexts/CaisseContext';
import { useStock } from '../../contexts/StockContext';

interface Stock {
  id: string;
  name: string;
  image: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  threshold: number;
  category: string;
}

const categories = [
  { id: 'tous', label: 'Tous' },
  { id: 'cereales', label: 'Céréales' },
  { id: 'legumes', label: 'Légumes' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'tubercules', label: 'Tubercules' },
  { id: 'epices', label: 'Épices' },
];

const sortOptions = [
  { id: 'name', label: 'Nom (A-Z)' },
  { id: 'quantity_asc', label: 'Quantité (croissant)' },
  { id: 'quantity_desc', label: 'Quantité (décroissant)' },
  { id: 'margin', label: 'Marge (élevée)' },
];

const mockStocks: Stock[] = [
  { id: '1', name: 'Riz local', image: '/images/produit-riz.png', quantity: 150, unit: 'kg', purchasePrice: 600, salePrice: 650, threshold: 50, category: 'cereales' },
  { id: '2', name: 'Tomates', image: '/images/produit-tomate.png', quantity: 45, unit: 'kg', purchasePrice: 300, salePrice: 350, threshold: 50, category: 'legumes' },
  { id: '3', name: 'Oignons', image: '/images/produit-oignon.png', quantity: 80, unit: 'kg', purchasePrice: 350, salePrice: 400, threshold: 40, category: 'legumes' },
  { id: '4', name: 'Huile', image: '/images/produit-huile.png', quantity: 25, unit: 'L', purchasePrice: 1400, salePrice: 1500, threshold: 30, category: 'epices' },
  { id: '5', name: 'Ignames', image: '/images/produit-igname.png', quantity: 120, unit: 'kg', purchasePrice: 350, salePrice: 400, threshold: 60, category: 'tubercules' },
  { id: '6', name: 'Plantain', image: '/images/produit-plantain.png', quantity: 15, unit: 'régimes', purchasePrice: 250, salePrice: 300, threshold: 20, category: 'fruits' },
  { id: '7', name: 'Piment', image: '/images/produit-piment.png', quantity: 8, unit: 'tas', purchasePrice: 150, salePrice: 200, threshold: 10, category: 'epices' },
  { id: '8', name: 'Gombo', image: '/images/produit-gombo.png', quantity: 30, unit: 'tas', purchasePrice: 120, salePrice: 150, threshold: 15, category: 'legumes' },
  { id: '9', name: 'Maïs', image: '/images/produit-mais.png', quantity: 100, unit: 'kg', purchasePrice: 450, salePrice: 500, threshold: 40, category: 'cereales' },
  { id: '10', name: 'Aubergines', image: '/images/produit-aubergine.png', quantity: 35, unit: 'kg', purchasePrice: 700, salePrice: 800, threshold: 25, category: 'legumes' },
];

export function GestionStock() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast, ToastContainer } = useToast();
  const { products, addProduct, updateProduct, deleteProduct } = useCaisse();
  const { speak, setIsModalOpen } = useApp();
  const stockCtx = useStock();

  // Convertir Product (CaisseContext) vers Stock (GestionStock) — fallback
  const productsToStocks = (): Stock[] => {
    if (!products || !Array.isArray(products)) return [];
    return products.map((p: any) => ({
      id: p.id,
      name: p.name || 'Produit inconnu',
      image: p.image || '',
      quantity: p.stock || 0,
      unit: p.unit || 'unité',
      purchasePrice: 0,
      salePrice: p.price || 0,
      threshold: 10,
      category: (p.category || 'autres').toLowerCase(),
    }));
  };

  // StockContext comme source principale
  const stocks: Stock[] = stockCtx.stock.length > 0
    ? stockCtx.stock.map((s: any) => ({
        id: s.id,
        name: s.produit || s.name || 'Produit inconnu',
        image: s.image || '',
        quantity: s.quantite ?? s.quantity ?? 0,
        unit: s.unite || s.unit || 'unité',
        purchasePrice: s.purchasePrice || 0,
        salePrice: s.prixUnitaire ?? s.salePrice ?? 0,
        threshold: s.seuilAlerte || 10,
        category: (s.category || 'autres').toLowerCase(),
      }))
    : productsToStocks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [showVenteVocaleModal, setShowVenteVocaleModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'alerts' | 'value'>('all');
  
  // Gérer l'affichage de la bottom bar selon l'état des modals
  useEffect(() => {
    const isAnyModalOpen = showAddModal || showEditModal || showFilterModal || showVenteVocaleModal;
    setIsModalOpen(isAnyModalOpen);
  }, [showAddModal, showEditModal, showFilterModal, showVenteVocaleModal, setIsModalOpen]);
  
  // Tantie Sagesse
  const [isListening, setIsListening] = useState(false);
  const [tantieSpeaking, setTantieSpeaking] = useState(false);
  const [tantieMessage, setTantieMessage] = useState('');
  const [conversationState, setConversationState] = useState<'welcome' | 'waiting' | 'confirming' | 'idle'>('welcome');
  const [pendingAction, setPendingAction] = useState<any>(null);
  const hasWelcomed = useRef(false);

  // Formulaire ajout
  const [newStock, setNewStock] = useState({
    name: '',
    image: '📦',
    quantity: 0,
    unit: 'kg',
    purchasePrice: 0,
    salePrice: 0,
    threshold: 10,
    category: 'cereales',
  });

  // Fonction pour arrêter le TTS
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
        speak(`Bienvenue ${user.prenoms} dans la gestion de stock. Je peux t'aider à ajouter, modifier ou consulter tes produits. Que veux-tu faire ?`);
        setConversationState('waiting');
      }, 1000);
    }
  }, [user]);

  // Trouver produit par nom
  const findStockByName = (text: string): Stock | null => {
    const keywords: Record<string, string[]> = {
      'riz': ['riz', 'ri'],
      'tomate': ['tomate', 'tomates'],
      'oignon': ['oignon', 'oignons'],
      'huile': ['huile'],
      'igname': ['igname', 'ignames'],
      'plantain': ['plantain', 'banane'],
      'piment': ['piment', 'piments'],
      'gombo': ['gombo', 'gombos'],
      'maïs': ['maïs', 'mais'],
      'aubergine': ['aubergine', 'aubergines'],
    };

    for (const [productKey, variants] of Object.entries(keywords)) {
      if (variants.some(variant => text.includes(variant))) {
        return stocks.find(s => (s.name || '').toLowerCase().includes(productKey)) || null;
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
      'cent': 100, 'mille': 1000,
    };

    const numberMatch = text.match(/(\d+)/);
    if (numberMatch) return parseInt(numberMatch[1]);

    for (const [word, num] of Object.entries(numberWords)) {
      if (text.includes(word)) return num;
    }
    return 1;
  };

  // Traiter commande vocale
  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Réponse à la question d'aide
    if (conversationState === 'waiting') {
      if (lowerCommand.includes('aide') || lowerCommand.includes('aider')) {
        speak('D\'accord ! Dis-moi ce que tu veux faire : ajouter un produit, modifier une quantité, ou consulter ton stock');
        setConversationState('idle');
        return;
      } else if (lowerCommand.includes('rien') || lowerCommand.includes('non')) {
        speak('D\'accord ! Je reste là si tu as besoin');
        setConversationState('idle');
        return;
      }
    }

    // Confirmation d'action
    if (conversationState === 'confirming' && pendingAction) {
      if (lowerCommand.includes('oui') || lowerCommand.includes('confirme') || lowerCommand.includes('ok')) {
        if (pendingAction.type === 'add') {
          const { name, quantity } = pendingAction;
          stockCtx.addStock({ marchandId: '', produit: name, unite: 'kg', quantite: quantity, prixUnitaire: 0 });
          addProduct({ name, category: 'Céréales', price: 0, stock: quantity, unit: 'kg' });
          speak(`Parfait ! ${quantity} kg de ${name} ajouté au stock`);
          showToast(`${quantity} kg de ${name} ajouté au stock`, 'success');
        } else if (pendingAction.type === 'update') {
          const { stock: s, quantity } = pendingAction;
          const newQty = s.quantity + quantity;
          stockCtx.updateStock(s.id, { quantite: newQty });
          updateProduct(s.id, { stock: newQty });
          speak(`Stock mis à jour ! ${s.name} : ${newQty} ${s.unit}`);
          showToast(`Stock mis à jour : ${s.name}`, 'success');
        }
        setPendingAction(null);
        setConversationState('idle');
        return;
      } else if (lowerCommand.includes('non') || lowerCommand.includes('annule')) {
        speak('D\'accord, action annulée');
        setPendingAction(null);
        setConversationState('idle');
        return;
      }
    }

    // Consulter stock d'un produit
    if (lowerCommand.includes('combien') && (lowerCommand.includes('stock') || lowerCommand.includes('j\'ai') || lowerCommand.includes('jai'))) {
      const stock = findStockByName(lowerCommand);
      if (stock) {
        speak(`Tu as ${stock.quantity} ${stock.unit} de ${stock.name} en stock`);
        return;
      } else {
        speak('Je n\'ai pas trouvé ce produit dans ton stock');
        return;
      }
    }

    // Valeur totale du stock
    if (lowerCommand.includes('valeur') && lowerCommand.includes('totale')) {
      const totalValue = stocks.reduce((sum, s) => sum + (s.quantity * s.purchasePrice), 0);
      speak(`La valeur totale de ton stock est de ${totalValue.toLocaleString()} francs CFA`);
      return;
    }

    // Nombre de produits
    if (lowerCommand.includes('combien') && lowerCommand.includes('produit')) {
      speak(`Tu as ${stocks.length} produits différents en stock`);
      return;
    }

    // Alertes stock bas
    if (lowerCommand.includes('alerte') || (lowerCommand.includes('stock') && lowerCommand.includes('bas'))) {
      const lowStocks = stocks.filter(s => s.quantity < s.threshold);
      if (lowStocks.length === 0) {
        speak('Tous tes stocks sont au-dessus du seuil. Tout va bien !');
      } else {
        speak(`Tu as ${lowStocks.length} produits en stock bas : ${lowStocks.map(s => s.name).join(', ')}`);
      }
      return;
    }

    // Ajouter au stock
    if (lowerCommand.includes('ajoute') || lowerCommand.includes('veux ajouter')) {
      const stock = findStockByName(lowerCommand);
      const quantity = extractQuantity(lowerCommand);

      if (stock) {
        // Produit existe déjà, on augmente la quantité
        speak(`Tu veux ajouter ${quantity} ${stock.unit} de ${stock.name} à ton stock actuel de ${stock.quantity} ${stock.unit}. Je confirme ?`);
        setPendingAction({ type: 'update', stock, quantity });
        setConversationState('confirming');
        return;
      } else {
        // Nouveau produit (extraction du nom)
        const words = lowerCommand.split(' ');
        const productName = words[words.length - 1];
        speak(`Tu veux ajouter ${quantity} kg de ${productName} au stock. Je confirme ?`);
        setPendingAction({ type: 'add', name: productName, quantity });
        setConversationState('confirming');
        return;
      }
    }

    // Filtrer par catégorie
    if (lowerCommand.includes('montre') || lowerCommand.includes('affiche')) {
      if (lowerCommand.includes('légume')) {
        setSelectedCategory('legumes');
        speak('Voici tes légumes en stock');
        return;
      } else if (lowerCommand.includes('fruit')) {
        setSelectedCategory('fruits');
        speak('Voici tes fruits en stock');
        return;
      } else if (lowerCommand.includes('céréale') || lowerCommand.includes('cereale')) {
        setSelectedCategory('cereales');
        speak('Voici tes céréales en stock');
        return;
      } else if (lowerCommand.includes('tubercule')) {
        setSelectedCategory('tubercules');
        speak('Voici tes tubercules en stock');
        return;
      } else if (lowerCommand.includes('tout')) {
        setSelectedCategory('tous');
        speak('Voici tous tes produits en stock');
        return;
      }
    }

    // Recherche générale
    const stock = findStockByName(lowerCommand);
    if (stock) {
      setSearchQuery(stock.name);
      speak(`Voici le ${stock.name}`);
      return;
    }

    speak('Je n\'ai pas compris. Demande-moi d\'ajouter un produit, de consulter ton stock, ou de filtrer par catégorie');
  };

  // Reconnaissance vocale
  const startVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speak('Désolée, la reconnaissance vocale n\'est pas supportée sur ce navigateur');
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

  // Filtrage et tri
  const filteredStocks = stocks
    .filter(stock => {
      const categorySafe = (stock.category || 'autres').toLowerCase();
      const matchesCategory = selectedCategory === 'tous' || categorySafe === selectedCategory.toLowerCase();
      const matchesSearch = (stock.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      
      // Appliquer le filtre actif des KPIs
      let matchesActiveFilter = true;
      if (activeFilter === 'alerts') {
        matchesActiveFilter = stock.quantity < stock.threshold;
      } else if (activeFilter === 'value') {
        // Trier par valeur totale (quantité × prix de vente)
        matchesActiveFilter = true; // On affiche tous mais on triera après
      }
      
      return matchesCategory && matchesSearch && matchesActiveFilter;
    })
    .sort((a, b) => {
      // Si le filtre "value" est actif, trier par valeur totale
      if (activeFilter === 'value') {
        const valueA = a.quantity * a.salePrice;
        const valueB = b.quantity * b.salePrice;
        return valueB - valueA; // Décroissant
      }
      
      // Sinon, utiliser le tri sélectionné
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity_asc':
          return a.quantity - b.quantity;
        case 'quantity_desc':
          return b.quantity - a.quantity;
        case 'margin':
          const marginA = a.salePrice - a.purchasePrice;
          const marginB = b.salePrice - b.purchasePrice;
          return marginB - marginA;
        default:
          return 0;
      }
    });

  const lowStocks = stocks.filter(s => s.quantity < s.threshold);
  const totalValue = stocks.reduce((sum, s) => sum + (s.quantity * s.purchasePrice), 0);

  const addStock = () => {
    // StockContext — source de vérité
    stockCtx.addStock({
      marchandId: '',
      produit: newStock.name,
      unite: newStock.unit,
      quantite: newStock.quantity,
      prixUnitaire: newStock.purchasePrice,
    });
    // CaisseContext — sync pour la caisse / POS
    addProduct({
      name: newStock.name,
      category: newStock.category.charAt(0).toUpperCase() + newStock.category.slice(1),
      price: newStock.salePrice,
      stock: newStock.quantity,
      unit: newStock.unit,
      image: newStock.image,
    });
    showToast(`${newStock.name} ajouté au stock`, 'success');
    speak(`${newStock.name} ajouté avec succès`);
    setShowAddModal(false);
    setNewStock({
      name: '',
      image: '',
      quantity: 0,
      unit: 'kg',
      purchasePrice: 0,
      salePrice: 0,
      threshold: 10,
      category: 'cereales',
    });
  };

  const updateStock = (id: string, quantity: number) => {
    stockCtx.updateProduct(id, { quantity });
    updateProduct(id, { stock: quantity });
    setSelectedStock(prev => prev && prev.id === id ? { ...prev, quantity } : prev);
    showToast('Stock mis à jour', 'success');
  };

  const deleteStock = (id: string) => {
    const stock = stocks.find(s => s.id === id);
    stockCtx.deleteProduct(id);
    deleteProduct(id);
    showToast(`${stock?.name} supprimé du stock`, 'info');
    speak(`${stock?.name} supprimé du stock`);
    setShowEditModal(false);
  };

  return (
    <>
      {/* Header fixe */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-orange-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            {/* Titre - Plus grand sans bouton retour */}
            <h1 className="flex-1 font-bold text-gray-900 text-xl sm:text-2xl md:text-3xl">Gestion du Stock</h1>

            {/* Bouton Notifications */}
            <NotificationButton />

            {/* Bouton Filtre - Icône réduite */}
            <motion.button
              onClick={() => setShowFilterModal(true)}
              className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Filter className="w-5 h-5 text-gray-700" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-orange-50 to-white">
        
        {/* Stats Cards - HARMONISÉES avec le Dashboard */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* KPI 1: Produits */}
          <motion.button
            onClick={() => {
              setActiveFilter('all');
              showToast('📦 Affichage de tous les produits', 'info');
            }}
            className={`relative bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 ${
              activeFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-blue-200'
            } text-left cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Produits</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Package className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-blue-600"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {stocks.length}
            </motion.p>
            {activeFilter === 'all' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full" />
            )}
          </motion.button>

          {/* KPI 2: Alertes */}
          <motion.button
            onClick={() => {
              setActiveFilter('alerts');
              if (lowStocks.length === 0) {
                showToast('✅ Aucune alerte stock', 'success');
              } else {
                showToast(`⚠️ ${lowStocks.length} produit${lowStocks.length > 1 ? 's' : ''} en stock bas`, 'warning');
              }
            }}
            className={`relative bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 ${
              activeFilter === 'alerts' ? 'border-orange-500 ring-2 ring-orange-300' : 'border-orange-300'
            } text-left cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(249, 115, 22, 0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Alertes</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"
                animate={lowStocks.length > 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <AlertCircle className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-orange-600"
              animate={lowStocks.length > 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {lowStocks.length}
            </motion.p>
            {lowStocks.length > 0 && (
              null
            )}
            {activeFilter === 'alerts' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full" />
            )}
          </motion.button>

          {/* KPI 3: Valeur */}
          <motion.button
            onClick={() => {
              setShowValueModal(true);
            }}
            className={`relative bg-gradient-to-br from-green-50 via-white to-green-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 ${
              showValueModal ? 'border-green-500 ring-2 ring-green-300' : 'border-green-200'
            } text-left cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(34, 197, 94, 0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Valeur</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-5 h-5 text-green-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-base font-bold text-green-600 leading-tight"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Montant value={totalValue} size="md" color="#16a34a" />
            </motion.p>
            {showValueModal && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full" />
            )}
          </motion.button>
        </div>

        {/* Boutons d'actions stratégiques */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={() => navigate('/marchand/ventes-passees')}
            className="flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#C46210] transition-colors whitespace-nowrap"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Receipt className="w-5 h-5 text-[#C46210] flex-shrink-0" />
            <span className="font-semibold text-gray-700">Ventes passées</span>
          </motion.button>

          <motion.button
            onClick={() => navigate('/marchand/resume-caisse')}
            className="flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#C46210] transition-colors whitespace-nowrap"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Wallet className="w-5 h-5 text-[#C46210] flex-shrink-0" />
            <span className="font-semibold text-gray-700">Résumé caisse</span>
          </motion.button>
        </motion.div>

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
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
            />
            <motion.button
              onClick={startVoiceCommand}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isListening ? <MicOff className="w-5 h-5 text-[#C46210]" /> : null}
            </motion.button>
          </div>
        </motion.div>

        {/* Boutons d'action - Alignés horizontalement */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="py-4 px-4 rounded-2xl bg-white border-2 border-[#C46210] text-[#C46210] font-bold flex items-center justify-center gap-2 whitespace-nowrap"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
          >
            <Plus className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
            Ajouter
          </motion.button>

          <motion.button
            onClick={() => setShowVenteVocaleModal(true)}
            className="py-4 rounded-2xl bg-[#C46210] text-white font-bold flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
          >
            <Mic className="w-5 h-5" strokeWidth={3} />
            Vendre
          </motion.button>
        </div>

        {/* Liste des stocks */}
        <div className="grid grid-cols-2 gap-3">
          {filteredStocks.map((stock, index) => {
            const isLow = stock.quantity < stock.threshold;
            const margin = stock.salePrice - stock.purchasePrice;
            const marginPercent = ((margin / stock.purchasePrice) * 100).toFixed(0);

            return (
              <motion.div
                key={stock.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedStock(stock);
                  setShowEditModal(true);
                }}
                className={`bg-gradient-to-br ${
                  isLow ? 'from-red-50 via-white to-red-50 border-red-300' : 'from-orange-50 via-white to-orange-50 border-gray-200'
                } rounded-3xl overflow-hidden shadow-md border-2 cursor-pointer`}
                whileHover={{ scale: 1.02, y: -4, boxShadow: '0 10px 30px rgba(196, 98, 16, 0.15)' }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Image en haut - grande et mise en avant */}
                <div className="relative w-full h-36 overflow-hidden">
                  <ImageWithFallback 
                    src={stock.image} 
                    alt={stock.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Badge alerte par-dessus l'image */}
                  {isLow && (
                    <div className="absolute top-2 right-2">
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg"
                      >
                        <AlertCircle className="w-3 h-3" />
                        Bas
                      </motion.span>
                    </div>
                  )}
                  {/* Badge marge par-dessus l'image */}
                  <div className="absolute top-2 left-2">
                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-lg font-bold shadow-lg">
                      +{marginPercent}%
                    </span>
                  </div>
                  {/* Gradient overlay au bas de l'image */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* Nom du produit sur l'image */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="font-bold text-white text-sm drop-shadow-lg">{stock.name}</h3>
                  </div>
                </div>

                {/* Informations compactes sous l'image */}
                <div className="p-3 space-y-2">
                  {/* Quantité en grand */}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-3xl font-bold ${isLow ? 'text-red-600' : 'text-[#C46210]'}`}>
                      {stock.quantity}
                    </span>
                    <span className="text-sm text-gray-500 font-semibold">{stock.unit}</span>
                  </div>

                  {/* Prix et marge en compact */}
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="bg-red-50 rounded-lg p-1.5 text-center">
                      <p className="text-red-600 font-semibold mb-0.5">Achat</p>
                      <Montant value={stock.purchasePrice} size="xs" color="#374151" />
                    </div>
                    <div className="bg-green-50 rounded-lg p-1.5 text-center">
                      <p className="text-green-600 font-semibold mb-0.5">Vente</p>
                      <Montant value={stock.salePrice} size="xs" color="#374151" />
                    </div>
                  </div>

                  {/* Barre de progression du stock */}
                  <div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${isLow ? 'bg-red-500' : 'bg-green-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((stock.quantity / (stock.threshold * 2)) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: index * 0.05 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <Navigation role="marchand" onMicClick={startVoiceCommand} />

      {/* Modal Ajout */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h2 className="text-xl font-bold">Ajouter un produit</h2>
                <motion.button
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4">
                {/* Photo du produit */}
                <ImagePickerField
                  label="Photo du produit"
                  value={newStock.image.startsWith('data:') || newStock.image.startsWith('http') ? newStock.image : ''}
                  onChange={(url) => setNewStock({ ...newStock, image: url })}
                  primaryColor="#C46210"
                  shape="rect"
                  size={96}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du produit</label>
                  <input
                    type="text"
                    value={newStock.name}
                    onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
                    placeholder="Ex: Riz local"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantité</label>
                    <input
                      type="number"
                      value={newStock.quantity}
                      onChange={(e) => setNewStock({ ...newStock, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
                    />
                  </div>
                  <SelectWithAutre
                    label="Unité"
                    value={newStock.unit}
                    onChange={(v) => setNewStock({ ...newStock, unit: v })}
                    options={['kg', 'L', 'tas', 'régimes', 'sac', 'tonne', 'carton']}
                    primaryColor="#C46210"
                    placeholder="Ex: bouteille, caisse..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prix d'achat (FCFA)</label>
                    <input
                      type="number"
                      value={newStock.purchasePrice}
                      onChange={(e) => setNewStock({ ...newStock, purchasePrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
                      placeholder="Ex: 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prix de vente (FCFA)</label>
                    <input
                      type="number"
                      value={newStock.salePrice}
                      onChange={(e) => setNewStock({ ...newStock, salePrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
                      placeholder="Ex: 600"
                    />
                  </div>
                </div>

                <SelectWithAutre
                  label="Catégorie"
                  value={newStock.category}
                  onChange={(v) => setNewStock({ ...newStock, category: v })}
                  options={categories.filter(c => c.id !== 'tous').map(cat => cat.id)}
                  primaryColor="#C46210"
                  placeholder="Ex: épices, condiments..."
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Seuil d'alerte</label>
                  <input
                    type="number"
                    value={newStock.threshold}
                    onChange={(e) => setNewStock({ ...newStock, threshold: parseInt(e.target.value) || 10 })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none"
                  />
                </div>

                <motion.button
                  onClick={addStock}
                  className="w-full py-4 rounded-2xl bg-[#C46210] text-white font-bold"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  Ajouter au stock
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Edition */}
      <AnimatePresence>
        {showEditModal && selectedStock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-h-[90vh] overflow-y-auto border-2 shadow-2xl"
              style={{ borderColor: '#C4621030' }}
            >
              {/* HEADER gradient orange */}
              <div
                className="sticky top-0 z-10 border-b-2 px-5 py-4 rounded-t-3xl flex items-center justify-between"
                style={{
                  background: 'linear-gradient(90deg, #FFF7ED 0%, #FFFFFF 50%, #FFF7ED 100%)',
                  borderColor: '#C4621022',
                }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#C4621022' }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Edit3 className="w-5 h-5" style={{ color: '#C46210' }} />
                  </motion.div>
                  <div>
                    <h2 className="font-bold text-gray-900" style={{ fontSize: '1.1rem' }}>Modifier le stock</h2>
                    <p className="text-xs text-gray-400">{selectedStock.name}</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowEditModal(false)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center border-2"
                  style={{ backgroundColor: '#C4621011', borderColor: '#C4621033' }}
                  whileHover={{ rotate: 90, scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" style={{ color: '#C46210' }} />
                </motion.button>
              </div>

              <div className="w-full">
                {/* Image hero */}
                <div className="relative w-full h-52">
                  <ImageWithFallback
                    src={selectedStock.image}
                    alt={selectedStock.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-2xl mb-2">{selectedStock.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-bold border border-white/30">
                        {categories.find(c => c.id === selectedStock.category)?.label || selectedStock.category}
                      </span>
                      <motion.span
                        className="text-xs text-white px-3 py-1.5 rounded-full font-bold shadow-lg"
                        style={{ backgroundColor: '#C46210' }}
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        +{(((selectedStock.salePrice - selectedStock.purchasePrice) / selectedStock.purchasePrice) * 100).toFixed(0)}% marge
                      </motion.span>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="px-4 py-5 space-y-4">

                  {/* Quantité */}
                  <motion.div
                    className="rounded-3xl border-2"
                    style={{ borderColor: '#C4621033', backgroundColor: '#FFF7ED' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                  >
                    <div className="px-4 pt-4 pb-1 flex items-center gap-2">
                      <Package className="w-4 h-4" style={{ color: '#C46210' }} />
                      <span className="text-sm font-bold" style={{ color: '#C46210' }}>Quantité en stock</span>
                    </div>
                    <div className="px-3 pb-4 pt-3">
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => updateStock(selectedStock.id, Math.max(0, selectedStock.quantity - 1))}
                          className="w-11 h-11 rounded-2xl bg-white border-2 flex items-center justify-center shadow-sm flex-shrink-0"
                          style={{ borderColor: '#C4621033' }}
                          whileTap={{ scale: 0.88 }}
                        >
                          <Minus className="w-5 h-5 text-gray-600" />
                        </motion.button>
                        <input
                          type="number"
                          value={selectedStock.quantity}
                          onChange={(e) => updateStock(selectedStock.id, parseInt(e.target.value) || 0)}
                          className="flex-1 min-w-0 text-center text-3xl font-bold px-2 py-3 rounded-2xl border-2 bg-white focus:outline-none"
                          style={{ borderColor: '#C4621044', color: '#C46210' }}
                        />
                        <motion.button
                          onClick={() => updateStock(selectedStock.id, selectedStock.quantity + 1)}
                          className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shadow-md flex-shrink-0"
                          style={{ backgroundColor: '#C46210' }}
                          whileTap={{ scale: 0.88 }}
                        >
                          <Plus className="w-5 h-5" />
                        </motion.button>
                      </div>
                      <p className="text-center text-sm text-gray-400 mt-2 font-medium">{selectedStock.unit}</p>
                    </div>
                  </motion.div>

                  {/* Prix & Marges */}
                  <motion.div
                    className="rounded-3xl border-2 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50"
                    style={{ borderColor: '#C4621022' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                  >
                    <div className="px-4 pt-4 pb-1 flex items-center gap-2">
                      <Receipt className="w-4 h-4" style={{ color: '#C46210' }} />
                      <span className="text-sm font-bold" style={{ color: '#C46210' }}>Prix et Marges</span>
                    </div>
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-orange-100">
                        <span className="text-sm text-gray-500">Prix d'achat</span>
                        <Montant value={selectedStock.purchasePrice} size="sm" color="#1f2937" />
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-orange-100">
                        <span className="text-sm text-gray-500">Prix de vente</span>
                        <Montant value={selectedStock.salePrice} size="sm" color="#1f2937" />
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-orange-100">
                        <span className="text-sm text-gray-500">Bénéfice unitaire</span>
                        <Montant value={selectedStock.salePrice - selectedStock.purchasePrice} size="sm" color="#C46210" showPlus />
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 rounded-2xl" style={{ backgroundColor: '#C4621011' }}>
                        <span className="text-sm font-bold text-gray-600">Valeur totale stock</span>
                        <motion.span
                          animate={{ scale: [1, 1.04, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Montant value={selectedStock.quantity * selectedStock.salePrice} size="sm" color="#16a34a" />
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Bouton Supprimer */}
                  <motion.button
                    onClick={() => deleteStock(selectedStock.id)}
                    className="w-full py-4 rounded-3xl text-white font-bold flex items-center justify-center gap-2 border-2 border-red-400 shadow-md"
                    style={{ backgroundColor: '#EF4444' }}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(239,68,68,0.3)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Trash2 className="w-5 h-5" />
                    Supprimer du stock
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Filtres */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full"
            >
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold">Filtres et tri</h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-bold mb-3">Catégorie</h3>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setShowFilterModal(false);
                        }}
                        className={`w-full px-4 py-3 rounded-xl text-left font-semibold ${
                          selectedCategory === cat.id
                            ? 'bg-[#C46210] text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-3">Trier par</h3>
                  <div className="space-y-2">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id);
                          setShowFilterModal(false);
                        }}
                        className={`w-full px-4 py-3 rounded-xl text-left font-semibold ${
                          sortBy === opt.id
                            ? 'bg-[#C46210] text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Valeur du Stock */}
      <AnimatePresence>
        {showValueModal && (() => {
          // Calculs dynamiques
          const totalPurchaseValue = stocks.reduce((sum, s) => sum + (s.quantity * s.purchasePrice), 0);
          const totalSaleValue = stocks.reduce((sum, s) => sum + (s.quantity * s.salePrice), 0);
          const totalMargin = totalSaleValue - totalPurchaseValue;
          const roi = ((totalMargin / totalPurchaseValue) * 100).toFixed(1);

          // Répartition par catégorie
          const categoryStats = categories
            .filter(c => c.id !== 'tous')
            .map(cat => {
              const catStocks = stocks.filter(s => s.category === cat.id);
              const value = catStocks.reduce((sum, s) => sum + (s.quantity * s.salePrice), 0);
              return { ...cat, value, count: catStocks.length };
            })
            .filter(c => c.count > 0)
            .sort((a, b) => b.value - a.value);

          const maxCategoryValue = Math.max(...categoryStats.map(c => c.value));

          // Top 3 produits par valeur
          const topProducts = stocks
            .map(s => ({
              ...s,
              totalValue: s.quantity * s.salePrice,
              totalMargin: s.quantity * (s.salePrice - s.purchasePrice),
            }))
            .sort((a, b) => b.totalValue - a.totalValue)
            .slice(0, 3);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
              onClick={() => setShowValueModal(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto"
              >
                {/* Header sticky */}
                <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex items-center justify-between rounded-t-3xl z-10">
                  <div>
                    <h2 className="text-xl font-bold text-white">Valeur du Stock</h2>
                    <p className="text-sm text-green-50 mt-0.5">Analyse financière complète</p>
                  </div>
                  <motion.button
                    onClick={() => setShowValueModal(false)}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                <div className="p-6 space-y-6">
                  {/* KPIs Financiers Principaux */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Valeur d'achat */}
                    <motion.div
                      className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border-2 border-red-200"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                          <ArrowDownRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Valeur d'achat</p>
                      </div>
                      <MontantCard accentColor="#EF4444" className="rounded-xl">
                        <Montant value={totalPurchaseValue} size="xl" color="#dc2626" />
                      </MontantCard>
                      <p className="text-xs text-gray-500 mt-1">Investissement total</p>
                    </motion.div>

                    {/* Valeur de vente */}
                    <motion.div
                      className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border-2 border-green-200"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Valeur de vente</p>
                      </div>
                      <MontantCard accentColor="#10B981" className="rounded-xl">
                        <Montant value={totalSaleValue} size="xl" color="#16a34a" />
                      </MontantCard>
                      <p className="text-xs text-gray-500 mt-1">Potentiel total</p>
                    </motion.div>

                    {/* Marge potentielle */}
                    <motion.div
                      className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border-2 border-orange-300"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#C46210] flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Marge totale</p>
                      </div>
                      <MontantCard accentColor="#C46210" className="rounded-xl">
                        <Montant value={totalMargin} size="xl" color="#C46210" />
                      </MontantCard>
                      <p className="text-xs text-gray-500 mt-1">Bénéfice potentiel</p>
                    </motion.div>

                    {/* ROI */}
                    <motion.div
                      className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border-2 border-purple-200"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                          <Package className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Bénéfice par 100 FCFA</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        +{roi} FCFA
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Pour chaque 100 FCFA investi</p>
                    </motion.div>
                  </div>

                  {/* Répartition par catégorie */}
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-2 border-blue-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <Filter className="w-4 h-4 text-white" />
                      </div>
                      Répartition par catégorie
                    </h3>
                    <div className="space-y-3">
                      {categoryStats.map((cat, index) => (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
                            <span className="text-xs font-bold text-blue-600">
                              {cat.value.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                          <div className="h-2.5 bg-white rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(cat.value / maxCategoryValue) * 100}%` }}
                              transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{cat.count} produit{cat.count > 1 ? 's' : ''}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Top 3 Produits */}
                  <motion.div
                    className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border-2 border-amber-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Top 3 Produits par valeur
                    </h3>
                    <div className="space-y-3">
                      {topProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          className="bg-white rounded-xl p-3 flex items-center gap-3"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          {/* Badge position */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                          }`}>
                            {index + 1}
                          </div>

                          {/* Info produit */}
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                {product.totalValue.toLocaleString('fr-FR')} FCFA
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                              {product.quantity} {product.unit}
                            </span>
                          </div>

                          {/* Marge */}
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Bénéfice</p>
                            <p className="text-xs font-bold text-[#C46210]">
                              +{product.totalMargin.toLocaleString('fr-FR')} FCFA
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Résumé final */}
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Ton bénéfice total</p>
                        <Montant value={totalMargin} size="xl" color="white" />
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-xs opacity-90 mb-1">Si tu vends tout ton stock aux prix actuels :</p>
                      <p className="font-semibold text-sm">
                        Tu gagneras <span className="text-yellow-300">{roi} <span className="text-xs font-bold opacity-80">FCFA</span></span> pour chaque <span className="text-yellow-300">100 <span className="text-xs font-bold opacity-80">FCFA</span></span> investi
                      </p>
                      <p className="text-xs opacity-75 mt-2">
                        Investissement : <Montant value={totalPurchaseValue} size="xs" color="rgba(255,255,255,0.9)" />
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Tantie Voice Assistant */}
      <TantieSagesse 
        isVisible={isListening || tantieSpeaking} 
        isSpeaking={tantieSpeaking}
        onSkip={stopSpeaking}
      />

      {/* Toast Container */}
      <ToastContainer />

      {/* Modal Vente Vocale */}
      <VenteVocaleModal 
        isOpen={showVenteVocaleModal}
        onClose={() => setShowVenteVocaleModal(false)}
      />
    </>
  );
}