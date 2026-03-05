import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Star, 
  MapPin, 
  Minus, 
  Plus, 
  X, 
  Package,
  Wheat,
  Leaf,
  Apple,
  Flame,
  Mic,
  MicOff,
  Check,
  Trash2,
  TrendingDown,
  Wallet,
  Banknote,
  ShoppingBag,
  MessageSquare,
  Zap,
  History,
  Users,
  Store,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Navigation } from '../layout/Navigation';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../hooks/useToast';
import { TantieSagesse } from '../voice/TantieSagesse';
import { NotificationButton } from './NotificationButton';
import { useCommande } from '../../contexts/CommandeContext';
import { HistoriqueList } from '../marche/HistoriqueList';
import { COMMANDES_MARCHE } from '../marche/marketplace-data';
import { Montant } from '../shared/Montant';

// Types
interface Product {
  id: string;
  name: string;
  emoji: string;
  image: string;
  
  // 🆕 Type de vendeur (Producteur ou Coopérative)
  sellerType: 'producteur' | 'cooperative';
  sellerName: string;  // Nom du producteur OU de la coopérative
  sellerId: string;    // ID unique du vendeur
  
  // Pour les coopératives : info complémentaire
  cooperativeInfo?: {
    nombreMembres: number;
    certification?: string;
  };
  
  location: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
  status: 'available' | 'low-stock' | 'out-of-stock';
  description: string;
}

const categories = [
  { id: 'tous', label: 'Tous', icon: Package },
  { id: 'cereales', label: 'Céréales', icon: Wheat },
  { id: 'legumes', label: 'Légumes', icon: Leaf },
  { id: 'fruits', label: 'Fruits', icon: Apple },
  { id: 'epices', label: 'Épices', icon: Flame },
];

// Mock products data avec images
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Riz local',
    emoji: '🌾',
    image: '/images/produit-riz.svg',
    sellerType: 'producteur',
    sellerName: 'Kouassi Jean',
    sellerId: 'PROD-001',
    location: 'Yamoussoukro',
    price: 650,
    unit: 'kg',
    stock: 250,
    category: 'cereales',
    status: 'available',
    description: 'Riz local de qualité supérieure cultivé traditionnellement',
  },
  {
    id: '2',
    name: 'Ignames fraîches',
    emoji: '🍠',
    image: '/images/produit-igname.svg',
    sellerType: 'cooperative',
    sellerName: 'Coopérative de Bouaké',
    sellerId: 'COOP-001',
    cooperativeInfo: {
      nombreMembres: 35,
      certification: 'Bio',
    },
    location: 'Bouaké',
    price: 400,
    unit: 'kg',
    stock: 150,
    category: 'legumes',
    status: 'available',
    description: 'Ignames fraîches récoltées ce matin par nos 35 membres certifiés Bio',
  },
  {
    id: '3',
    name: 'Tomates fraîches',
    emoji: '🍅',
    image: '/images/produit-tomate.svg',
    sellerType: 'producteur',
    sellerName: 'Traoré Mamadou',
    sellerId: 'PROD-002',
    location: 'Korhogo',
    price: 350,
    unit: 'kg',
    stock: 80,
    category: 'legumes',
    status: 'available',
    description: 'Tomates fraîches bien mûres',
  },
  {
    id: '4',
    name: 'Maïs grain',
    emoji: '🌽',
    image: '/images/produit-mais.svg',
    sellerType: 'producteur',
    sellerName: 'Yao Akissi',
    sellerId: 'PROD-003',
    location: 'Abengourou',
    price: 500,
    unit: 'kg',
    stock: 120,
    category: 'cereales',
    status: 'available',
    description: 'Maïs grain de première qualité',
  },
  {
    id: '5',
    name: 'Bananes plantain',
    emoji: '🍌',
    image: '/images/produit-plantain.svg',
    sellerType: 'cooperative',
    sellerName: 'Coopérative Adzopé',
    sellerId: 'COOP-002',
    cooperativeInfo: {
      nombreMembres: 28,
    },
    location: 'Adzopé',
    price: 300,
    unit: 'régime',
    stock: 200,
    category: 'fruits',
    status: 'available',
    description: 'Plantains bien mûrs - Production collective de 28 membres',
  },
  {
    id: '6',
    name: 'Piment frais',
    emoji: '🌶️',
    image: '/images/produit-piment.svg',
    sellerType: 'producteur',
    sellerName: 'Ouattara Fatou',
    sellerId: 'PROD-004',
    location: 'Man',
    price: 2500,
    unit: 'kg',
    stock: 5,
    category: 'epices',
    status: 'low-stock',
    description: 'Piment très fort',
  },
  {
    id: '7',
    name: 'Aubergines',
    emoji: '🍆',
    image: '/images/produit-aubergine.svg',
    sellerType: 'cooperative',
    sellerName: 'Coopérative Daloa Sud',
    sellerId: 'COOP-003',
    cooperativeInfo: {
      nombreMembres: 42,
      certification: 'Commerce équitable',
    },
    location: 'Daloa',
    price: 800,
    unit: 'kg',
    stock: 300,
    category: 'legumes',
    status: 'available',
    description: 'Aubergines locales fraîches - Commerce équitable, 42 producteurs',
  },
  {
    id: '8',
    name: 'Gombo',
    emoji: '🫛',
    image: '/images/produit-gombo.svg',
    sellerType: 'producteur',
    sellerName: 'Coulibaly Marie',
    sellerId: 'PROD-005',
    location: 'Gagnoa',
    price: 1500,
    unit: 'kg',
    stock: 30,
    category: 'legumes',
    status: 'available',
    description: 'Gombo frais du jour',
  },
];

export function MarcheVirtuel() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast, ToastContainer } = useToast();
  const { creerCommandeDirecte } = useCommande();
  
  // État pour les 3 vues (Coop / Producteurs / Historique)
  const [activeTab, setActiveTab] = useState<'cooperatives' | 'producteurs' | 'historique'>('cooperatives');
  
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [tantieSpeaking, setTantieSpeaking] = useState(false);
  const [tantieMessage, setTantieMessage] = useState('');
  const [conversationState, setConversationState] = useState<'welcome' | 'waiting' | 'confirming' | 'idle'>('welcome');
  const [pendingProduct, setPendingProduct] = useState<{product: Product; quantity: number} | null>(null);
  const hasWelcomed = useRef(false);
  
  // États pour le paiement
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash' | null>(null);
  const [walletBalance] = useState(125000); // Solde wallet simulé
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // États pour le mode négocié
  // États pour la négociation (produit individuel)
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [productToNegotiate, setProductToNegotiate] = useState<Product | null>(null);
  const [negotiationQuantity, setNegotiationQuantity] = useState(1);
  const [negotiationPrice, setNegotiationPrice] = useState(0);
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [showNegotiationSuccess, setShowNegotiationSuccess] = useState(false);

  // Fonction TTS (sans affichage de Tantie)
  const speakSilent = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fonction TTS (avec affichage de Tantie)
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      setTantieMessage(text);
      setTantieSpeaking(true);
      
      utterance.onend = () => {
        setTimeout(() => {
          setTantieSpeaking(false);
        }, 2000);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

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
        speak(`Bienvenue ${user.prenoms} au Marché Digital. Tu souhaites que je t'aide à choisir ou tu préfères le faire toi-même ?`);
        setConversationState('waiting');
      }, 1000);
    }
  }, [user]);

  // Trouver produit par nom
  const findProductByName = (text: string): Product | null => {
    const keywords: Record<string, string[]> = {
      'riz': ['riz', 'ri'],
      'igname': ['igname', 'ignames', 'ignam'],
      'tomate': ['tomate', 'tomates'],
      'maïs': ['maïs', 'mais'],
      'banane': ['banane', 'bananes', 'plantain'],
      'piment': ['piment', 'piments'],
      'aubergine': ['aubergine', 'aubergines'],
      'gombo': ['gombo', 'gombos'],
    };

    for (const [productKey, variants] of Object.entries(keywords)) {
      if (variants.some(variant => text.includes(variant))) {
        // Si on est dans l'historique, chercher dans tous les produits sans filtre
        if (activeTab === 'historique') {
          return mockProducts.find(p => p.name.toLowerCase().includes(productKey)) || null;
        }
        // Priorité : chercher dans la vue active
        const filteredByTab = mockProducts.filter(p => 
          activeTab === 'producteurs' ? p.sellerType === 'producteur' : p.sellerType === 'cooperative'
        );
        return filteredByTab.find(p => p.name.toLowerCase().includes(productKey)) || 
               mockProducts.find(p => p.name.toLowerCase().includes(productKey)) || 
               null;
      }
    }
    return null;
  };

  // Extraire quantité
  const extractQuantity = (text: string): number => {
    const numberWords: Record<string, number> = {
      'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5,
      'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10,
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
      if (lowerCommand.includes('aide') || lowerCommand.includes('aider') || lowerCommand.includes('choisir')) {
        speak('OK, dis-moi ce que tu veux et je t\'aiderai à mettre ça directement dans le panier');
        setConversationState('idle');
        return;
      } else if (lowerCommand.includes('seul') || lowerCommand.includes('moi-même') || lowerCommand.includes('non')) {
        speak('D\'accord ! Je reste là si tu as besoin');
        setConversationState('idle');
        return;
      }
    }

    // Confirmation d'ajout
    if (conversationState === 'confirming' && pendingProduct) {
      if (lowerCommand.includes('oui') || lowerCommand.includes('confirme') || lowerCommand.includes('ok')) {
        addToCart(pendingProduct.product.id, pendingProduct.quantity);
        const total = pendingProduct.product.price * pendingProduct.quantity;
        speak(`Parfait ! ${pendingProduct.quantity} ${pendingProduct.product.unit} de ${pendingProduct.product.name} ajouté au panier`);
        showToast(`${pendingProduct.quantity} ${pendingProduct.product.unit} de ${pendingProduct.product.name} ajouté (${total.toLocaleString()} FCFA)`, 'success');
        setPendingProduct(null);
        setConversationState('idle');
        return;
      } else if (lowerCommand.includes('non') || lowerCommand.includes('annule')) {
        speak('D\'accord, commande annulée');
        setPendingProduct(null);
        setConversationState('idle');
        return;
      }
    }

    // Vider panier
    if (lowerCommand.includes('vide') && lowerCommand.includes('panier')) {
      setCart({});
      speak('Ton panier a été vidé');
      showToast('Panier vidé', 'info');
      return;
    }

    // Filtrer par catégorie
    if (lowerCommand.includes('montre') || lowerCommand.includes('affiche') || lowerCommand.includes('voir')) {
      if (lowerCommand.includes('légume')) {
        setSelectedCategory('legumes');
        speak('Voici les légumes disponibles');
        return;
      } else if (lowerCommand.includes('fruit')) {
        setSelectedCategory('fruits');
        speak('Voici les fruits disponibles');
        return;
      } else if (lowerCommand.includes('céréale') || lowerCommand.includes('cereale')) {
        setSelectedCategory('cereales');
        speak('Voici les céréales disponibles');
        return;
      } else if (lowerCommand.includes('épice') || lowerCommand.includes('epice')) {
        setSelectedCategory('epices');
        speak('Voici les épices disponibles');
        return;
      } else if (lowerCommand.includes('tout')) {
        setSelectedCategory('tous');
        speak('Voici tous les produits disponibles');
        return;
      }
    }

    // Demander prix
    if (lowerCommand.includes('combien') && (lowerCommand.includes('coûte') || lowerCommand.includes('coute') || lowerCommand.includes('prix'))) {
      const product = findProductByName(lowerCommand);
      if (product) {
        speak(`Le ${product.name} coûte ${product.price} francs CFA le ${product.unit}`);
        return;
      } else {
        speak('Je n\'ai pas trouvé ce produit');
        return;
      }
    }

    // Ajouter au panier
    if (lowerCommand.includes('veux') || lowerCommand.includes('ajoute') || lowerCommand.includes('prend')) {
      const product = findProductByName(lowerCommand);
      const quantity = extractQuantity(lowerCommand);
      
      if (product) {
        const total = product.price * quantity;
        speak(`Le ${product.name} coûte ${product.price} francs CFA le ${product.unit}. Tu veux ${quantity} ${product.unit} pour ${total} francs CFA. Je confirme ?`);
        setPendingProduct({ product, quantity });
        setConversationState('confirming');
        return;
      } else {
        speak('Je n\'ai pas compris quel produit tu veux. Peux-tu répéter ?');
        return;
      }
    }

    // Recherche générale
    const product = findProductByName(lowerCommand);
    if (product) {
      setSearchQuery(product.name);
      speak(`Voici le ${product.name}`);
      return;
    }

    speak('Je n\'ai pas compris. Demande-moi d\'ajouter un produit, de filtrer par catégorie, ou de connaître le prix d\'un article');
  };

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = selectedCategory === 'tous' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'historique') return false;
    const matchesTab = activeTab === 'producteurs' ? product.sellerType === 'producteur' : product.sellerType === 'cooperative';
    return matchesCategory && matchesSearch && matchesTab;
  });

  // Fonction de recherche vocale
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

  const addToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity,
    }));
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      const newCart = { ...cart };
      delete newCart[productId];
      setCart(newCart);
    } else {
      setCart(prev => ({ ...prev, [productId]: quantity }));
    }
  };

  // Fonction de négociation pour produit individuel
  const handleNegotiationSubmit = async () => {
    try {
      if (!user || !productToNegotiate) {
        throw new Error('Informations manquantes');
      }

      if (negotiationQuantity <= 0) {
        throw new Error('La quantité doit être supérieure à 0');
      }

      if (negotiationPrice <= 0) {
        throw new Error('Le prix proposé doit être supérieur à 0');
      }

      // Créer une commande de négociation
      await creerCommandeDirecte(
        user.id,
        user.prenoms,
        productToNegotiate.sellerId,
        productToNegotiate.sellerName,
        productToNegotiate.name,
        negotiationQuantity,
        negotiationPrice
      );
      
      // Fermer modal et afficher succès
      setShowNegotiationModal(false);
      setProductToNegotiate(null);
      setShowNegotiationSuccess(true);
      speakSilent(`Proposition de prix envoyée à ${productToNegotiate.sellerName}. Tu recevras une réponse bientôt`);
      showToast('Proposition envoyée ! Tu recevras une notification dès la réponse', 'success');
    } catch (error: any) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
      speakSilent('Erreur lors de l\'envoi de la proposition');
    }
  };

  // Fonction de paiement
  const handlePayment = () => {
    if (!paymentMethod) return;

    if (paymentMethod === 'wallet') {
      // Vérifier le solde
      if (cartTotal > walletBalance) {
        setErrorMessage('Solde Wallet insuffisant pour cette commande');
        setShowErrorModal(true);
        speakSilent('Désolé, ton solde Wallet est insuffisant pour cette commande');
        return;
      }
      
      // Vérifier si la sécurité PIN est activée
      if (user?.pinSecurityEnabled) {
        // PIN activé - Demander confirmation
        setShowPaymentModal(false);
        setShowPinModal(true);
        speakSilent('Entre ton code PIN à 4 chiffres pour confirmer le paiement');
      } else {
        // PIN désactivé - Paiement direct
        speakSilent(`Paiement de ${cartTotal.toLocaleString()} francs CFA effectué avec succès depuis ton Wallet`);
        
        // Vider le panier et afficher succès
        setCart({});
        setShowPaymentModal(false);
        setShowCart(false);
        setShowSuccessModal(true);
        setPaymentMethod(null);
      }
    } else if (paymentMethod === 'cash') {
      // Paiement cash - pas de PIN nécessaire
      speakSilent('Commande validée ! Paiement en espèces à la livraison');
      
      // Vider le panier et afficher succès
      setCart({});
      setShowPaymentModal(false);
      setShowCart(false);
      setShowSuccessModal(true);
      setPaymentMethod(null);
    }
  };

  // Valider le paiement avec PIN
  const handlePinValidation = () => {
    if (pinCode.length !== 4) {
      setErrorMessage('Le code PIN doit contenir 4 chiffres');
      setShowErrorModal(true);
      speakSilent('Le code PIN doit contenir 4 chiffres');
      return;
    }

    // Vérifier le code PIN (si défini dans le profil utilisateur)
    if (user?.pinCode && pinCode !== user.pinCode) {
      setErrorMessage('Code PIN incorrect. Réessaye');
      setShowErrorModal(true);
      speakSilent('Code PIN incorrect');
      setPinCode('');
      return;
    }

    // Si pas de pinCode défini, accepter n'importe quel code sauf 0000 (pour démo)
    if (!user?.pinCode && pinCode === '0000') {
      setErrorMessage('Code PIN incorrect. Réessaye');
      setShowErrorModal(true);
      speakSilent('Code PIN incorrect');
      setPinCode('');
      return;
    }

    // Paiement réussi
    speakSilent(`Paiement de ${cartTotal.toLocaleString()} francs CFA effectué avec succès depuis ton Wallet`);
    
    // Vider le panier
    setCart({});
    setShowPinModal(false);
    setShowCart(false);
    setShowSuccessModal(true);
    setPaymentMethod(null);
    setPinCode('');
  };

  const cartItems = Object.entries(cart).map(([id, quantity]) => ({
    product: mockProducts.find(p => p.id === id)!,
    quantity,
  }));

  const cartTotal = cartItems.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  );

  const cartCount = Object.keys(cart).length;
  const favoritesCount = favorites.size;

  return (
    <>
      {/* Header fixe simple - UNE seule ligne */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-orange-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            {/* Titre - Plus grand sans bouton retour */}
            <h1 className="flex-1 font-bold text-gray-900 text-xl sm:text-2xl md:text-3xl">
              Marché Virtuel
            </h1>

            {/* Boutons actions - Icônes réduites */}
            <div className="flex items-center gap-2">
              {/* Bouton Notifications */}
              <NotificationButton />

              {/* Bouton Panier */}
              <motion.button
                onClick={() => setShowCart(true)}
                className="relative w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {cartCount > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C46210] text-white text-[10px] font-bold flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {cartCount}
                  </motion.div>
                )}
              </motion.button>

              {/* Bouton Favoris */}
              <motion.button
                onClick={() => setShowFavorites(true)}
                className="relative w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className="w-5 h-5 text-gray-700" />
                {favoritesCount > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C46210] text-white text-[10px] font-bold flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {favoritesCount}
                  </motion.div>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-orange-50 to-white">
        
        {/* 1. Barre de recherche */}
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

        {/* 2. Tabs - Marketplace Coop / Producteurs / Historique */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            <div className="grid grid-cols-3 gap-1.5">
              {/* Tab Coopératives */}
              <motion.button
                onClick={() => { setActiveTab('cooperatives'); speakSilent('Marketplace Coopérative'); }}
                className={`relative flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl font-bold text-[11px] transition-all ${activeTab === 'cooperatives' ? 'bg-gradient-to-r from-[#2072AF] to-[#3B8CC4] text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                whileTap={{ scale: 0.98 }}
              >
                <Store className="w-4 h-4 flex-shrink-0" />
                <span>Coop</span>
                {activeTab === 'cooperatives' && <motion.div className="absolute inset-0 bg-white/20 rounded-xl" layoutId="activeTabMarchand" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
              </motion.button>

              {/* Tab Producteurs */}
              <motion.button
                onClick={() => { setActiveTab('producteurs'); speakSilent('Marketplace Producteurs'); }}
                className={`relative flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl font-bold text-[11px] transition-all ${activeTab === 'producteurs' ? 'bg-gradient-to-r from-[#2E8B57] to-[#3BA56E] text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                whileTap={{ scale: 0.98 }}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>Producteurs</span>
                {activeTab === 'producteurs' && <motion.div className="absolute inset-0 bg-white/20 rounded-xl" layoutId="activeTabMarchand" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
              </motion.button>

              {/* Tab Historique */}
              <motion.button
                onClick={() => { setActiveTab('historique'); speakSilent('Historique de tes achats'); }}
                className={`relative flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl font-bold text-[11px] transition-all ${activeTab === 'historique' ? 'bg-gradient-to-r from-[#C66A2C] to-[#D97706] text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                whileTap={{ scale: 0.98 }}
              >
                <History className="w-4 h-4 flex-shrink-0" />
                <span>Historique</span>
                {activeTab === 'historique' && <motion.div className="absolute inset-0 bg-white/20 rounded-xl" layoutId="activeTabMarchand" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
              </motion.button>
            </div>
          </div>

          {/* Description */}
          <motion.p key={activeTab} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm text-gray-600 text-center">
            {activeTab === 'cooperatives' ? 'Achète en volume auprès des coopératives agricoles'
              : activeTab === 'producteurs' ? 'Achète directement auprès des producteurs individuels'
              : 'Toutes tes commandes passées'}
          </motion.p>
        </motion.div>

        {/* ── VUE HISTORIQUE ── */}
        {activeTab === 'historique' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <HistoriqueList
              commandes={COMMANDES_MARCHE}
              profil="marchand"
              sens="achat"
              emptyLabel="Aucune commande dans ton historique"
            />
          </motion.div>
        )}

        {/* ── MARKETPLACE (Coop + Producteur) ── */}
        {activeTab !== 'historique' && (<>
        {/* 3. Filtres catégories - Grille 5 colonnes sur une seule ligne */}
        <div className="grid grid-cols-5 gap-2 mb-5">
          {categories.map((cat, index) => {
            const IconComponent = cat.icon;
            return (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center gap-1.5 w-full px-1 py-3 rounded-2xl font-bold transition-all border-2 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-br from-[#C46210] to-[#D97706] text-white shadow-lg shadow-orange-300/50 border-[#C46210]'
                    : 'bg-white text-gray-700 border-gray-200 shadow-sm'
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <IconComponent
                  className={`w-5 h-5 flex-shrink-0 ${
                    selectedCategory === cat.id ? 'text-white' : 'text-[#C46210]'
                  }`}
                  strokeWidth={2.5}
                />
                <span className={`text-[10px] font-semibold leading-tight truncate w-full text-center ${
                  selectedCategory === cat.id ? 'text-white' : 'text-gray-600'
                }`}>
                  {cat.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* 3. Grille produits - 2 colonnes ultra simple */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedProduct(product)}
              className={`relative bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-3xl overflow-hidden shadow-md border-2 cursor-pointer ${
                product.status === 'low-stock' ? 'border-orange-400' : 'border-gray-200'
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -4, boxShadow: '0 10px 30px rgba(196, 98, 16, 0.15)' }}
            >
              {/* Badge Stock Bas */}
              {product.status === 'low-stock' && (
                <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Stock bas
                </div>
              )}

              {/* Bouton Favori en haut à gauche */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                  const isFavorite = favorites.has(product.id);
                  showToast(
                    isFavorite ? `${product.name} retiré des favoris` : `${product.name} ajouté aux favoris`,
                    isFavorite ? 'info' : 'success'
                  );
                }}
                className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                <Heart 
                  className={`w-4 h-4 ${favorites.has(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} 
                />
              </motion.button>

              {/* Image produit - PLUS GRANDE */}
              <div className="relative w-full h-40 bg-gray-100">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Infos produit - ULTRA MINIMALISTE */}
              <div className="p-3">
                {/* Badge Type de vendeur */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-2 ${
                  product.sellerType === 'producteur' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {product.sellerType === 'producteur' ? 'Producteur' : 'Coopérative'}
                  {product.cooperativeInfo && (
                    <span className="text-[9px]">• {product.cooperativeInfo.nombreMembres} membres</span>
                  )}
                </div>
                
                {/* Nom */}
                <h3 className="font-bold text-sm text-gray-900 mb-0.5 leading-tight">
                  {product.name}
                </h3>
                
                {/* Vendeur */}
                <p className="text-[10px] text-gray-500 mb-1.5">{product.sellerName}</p>

                {/* Prix */}
                <p className="text-2xl font-bold text-[#C46210] mb-3">
                  <Montant value={product.price} unit={product.unit} size="xl" color="#C46210" />
                </p>

                {/* Bouton Ajouter */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product.id);
                    showToast(`${product.name} ajouté au panier`, 'success');
                    speakSilent(`${product.name} ajouté au panier`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#C46210] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(196, 98, 16, 0.3)' }}
                >
                  <Plus className="w-4 h-4" strokeWidth={3} />
                  Ajouter
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
        </>)}
      </div>

      {/* Navigation Bottom */}
      <Navigation role="marchand" onMicClick={startVoiceSearch} />

      {/* Modal Détail Produit */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center px-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col"
            >
              {/* Header sticky */}
              <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <h2 className="text-xl font-bold text-gray-900">Détails</h2>
                <motion.button
                  onClick={() => setSelectedProduct(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Image grande */}
                <div className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden">
                  <ImageWithFallback
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Nom + Prix */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedProduct.name}</h3>
                  <p className="text-3xl font-bold text-[#C46210]">
                    <Montant value={selectedProduct.price} unit={selectedProduct.unit} size="2xl" color="#C46210" />
                  </p>
                </div>

                {/* Infos carte */}
                <div className={`rounded-2xl p-3 space-y-2.5 ${
                  selectedProduct.sellerType === 'producteur' ? 'bg-green-50' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                      selectedProduct.sellerType === 'producteur' ? 'bg-green-200 text-green-700' : 'bg-blue-200 text-blue-700'
                    }`}>
                      {selectedProduct.sellerType === 'producteur' ? 'P' : 'C'}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{selectedProduct.sellerType === 'producteur' ? 'Producteur' : 'Coopérative'}</p>
                      <p className="font-bold text-gray-900 text-sm">{selectedProduct.sellerName}</p>
                      {selectedProduct.cooperativeInfo && (
                        <p className="text-xs text-gray-600 mt-0.5">{selectedProduct.cooperativeInfo.nombreMembres} membres{selectedProduct.cooperativeInfo.certification ? ` • ${selectedProduct.cooperativeInfo.certification}` : ''}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#C46210]" />
                    <div>
                      <p className="text-xs text-gray-500">Localisation</p>
                      <p className="font-bold text-gray-900 text-sm">{selectedProduct.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📦</span>
                    <div>
                      <p className="text-xs text-gray-500">Stock disponible</p>
                      <p className="font-bold text-gray-900 text-sm">{selectedProduct.stock} {selectedProduct.unit}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                </div>
              </div>

              {/* Boutons d'action sticky */}
              <div className="flex-shrink-0 bg-white border-t border-gray-100 px-6 py-4 space-y-3 rounded-b-3xl">
                {/* Bouton Ajouter au panier */}
                <motion.button
                  onClick={() => {
                    addToCart(selectedProduct.id);
                    showToast(`${selectedProduct.name} ajouté au panier`, 'success');
                    speakSilent(`${selectedProduct.name} ajouté au panier`);
                    setSelectedProduct(null);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#C46210] text-white font-bold text-base shadow-lg flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Plus className="w-5 h-5" strokeWidth={3} />
                  Ajouter au panier
                </motion.button>

                {/* Bouton Négocier le prix */}
                <motion.button
                  onClick={() => {
                    setProductToNegotiate(selectedProduct);
                    setNegotiationPrice(selectedProduct.price);
                    setNegotiationQuantity(1);
                    setNegotiationMessage('');
                    setSelectedProduct(null);
                    setShowNegotiationModal(true);
                    speakSilent('Propose ton prix et ta quantité');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-white border-2 border-[#C46210] text-[#C46210] font-bold text-base shadow-sm flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <MessageSquare className="w-5 h-5" />
                  Négocier le prix
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Panier */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-[#C46210]" />
                  Panier ({cartCount})
                </h2>
                <motion.button
                  onClick={() => setShowCart(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4 pb-8">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">🛒</span>
                    <p className="text-gray-500">Votre panier est vide</p>
                  </div>
                ) : (
                  <>
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 rounded-2xl p-4"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{item.product.name}</h3>
                            <p className="text-sm text-gray-500">{item.product.producer}</p>
                            <p className="text-lg font-bold text-[#C46210] mt-1">
                              <Montant value={item.product.price} unit={item.product.unit} size="md" color="#C46210" />
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center"
                              whileTap={{ scale: 0.9 }}
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <span className="w-12 text-center font-bold">{item.quantity}</span>
                            <motion.button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-[#C46210] text-white flex items-center justify-center"
                              whileTap={{ scale: 0.9 }}
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <p className="text-xl font-bold text-gray-900">
                            {(item.product.price * item.quantity).toLocaleString()} F
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-3xl font-bold text-[#C46210]">
                          <Montant value={cartTotal} size="2xl" color="#C46210" />
                        </span>
                      </div>

                      <motion.button
                        onClick={() => {
                          speakSilent('Choisis ton mode de paiement');
                          setShowPaymentModal(true);
                        }}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C46210] to-[#D97706] text-white font-bold text-lg shadow-lg"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Zap className="w-5 h-5" />
                          Commander maintenant
                        </span>
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Favoris */}
      <AnimatePresence>
        {showFavorites && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => setShowFavorites(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-[#C46210]" />
                  Favoris ({favoritesCount})
                </h2>
                <motion.button
                  onClick={() => setShowFavorites(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4 pb-8">
                {favoritesCount === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">💝</span>
                    <p className="text-gray-500 font-semibold mb-2">Aucun favori pour le moment</p>
                    <p className="text-sm text-gray-400">Appuyez sur ❤️ pour ajouter des produits</p>
                  </div>
                ) : (
                  <>
                    {mockProducts.filter(p => favorites.has(p.id)).map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-2xl p-4 border-2 border-gray-200"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                              <motion.button
                                onClick={() => {
                                  toggleFavorite(product.id);
                                  showToast(`${product.name} retiré des favoris`, 'info');
                                }}
                                className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center"
                                whileTap={{ scale: 0.9 }}
                              >
                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                              </motion.button>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">📍 {product.location}</p>
                            <p className="text-2xl font-bold text-[#C46210]">
                              {product.price} F
                              <span className="text-sm text-gray-500 ml-1">/{product.unit}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => {
                              addToCart(product.id);
                              showToast(`${product.name} ajouté au panier`, 'success');
                            }}
                            className="flex-1 py-3 rounded-xl bg-[#C46210] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Ajouter au panier
                          </motion.button>
                          <motion.button
                            onClick={() => setSelectedProduct(product)}
                            className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm"
                            whileTap={{ scale: 0.95 }}
                          >
                            Détails
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Paiement */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => {
              setShowPaymentModal(false);
              setPaymentMethod(null);
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl mx-auto shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h2 className="text-xl font-bold text-gray-900">Mode de paiement</h2>
                <motion.button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentMethod(null);
                  }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Montant total */}
                <div className="bg-orange-50 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
                  <p className="text-3xl font-bold text-[#C46210]">
                    <Montant value={cartTotal} size="2xl" color="#C46210" />
                  </p>
                </div>

                {/* Option Wallet */}
                <motion.button
                  onClick={() => {
                    setPaymentMethod('wallet');
                    speakSilent('Paiement par Wallet sélectionné');
                  }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'wallet'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white border-gray-200'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'wallet' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Wallet className={`w-7 h-7 ${
                        paymentMethod === 'wallet' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-gray-900 text-lg">Payer par Wallet</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Solde disponible: {walletBalance.toLocaleString('fr-FR')} <span className="text-[10px] opacity-70">FCFA</span>
                      </p>
                    </div>
                    {paymentMethod === 'wallet' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Check className="w-6 h-6 text-green-600" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>

                {/* Option Cash */}
                <motion.button
                  onClick={() => {
                    setPaymentMethod('cash');
                    speakSilent('Paiement en espèces sélectionné');
                  }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-orange-50 border-[#C46210]'
                      : 'bg-white border-gray-200'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      <Banknote className={`w-7 h-7 ${
                        paymentMethod === 'cash' ? 'text-[#C46210]' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-gray-900 text-lg">Payer en espèces</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Paiement à la livraison
                      </p>
                    </div>
                    {paymentMethod === 'cash' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Check className="w-6 h-6 text-[#C46210]" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>

                {/* Bouton Valider */}
                <motion.button
                  onClick={handlePayment}
                  disabled={!paymentMethod}
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg mt-6 ${
                    paymentMethod
                      ? 'bg-gradient-to-r from-[#C46210] to-[#D97706] text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  whileTap={paymentMethod ? { scale: 0.95 } : {}}
                  whileHover={paymentMethod ? { scale: 1.02 } : {}}
                >
                  {paymentMethod ? 'Valider la commande' : 'Choisir un mode de paiement'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal PIN */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => {
              setShowPinModal(false);
              setPinCode('');
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl mx-auto shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h2 className="text-xl font-bold text-gray-900">Confirmer le paiement</h2>
                <motion.button
                  onClick={() => {
                    setShowPinModal(false);
                    setPinCode('');
                  }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Montant total */}
                <div className="bg-orange-50 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
                  <p className="text-3xl font-bold text-[#C46210]">
                    {cartTotal.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>

                {/* Entrée PIN */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Entrez votre code PIN à 4 chiffres</p>
                  <input
                    type="password"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-base placeholder:text-gray-400 shadow-sm"
                    maxLength={4}
                  />
                </div>

                {/* Bouton Valider */}
                <motion.button
                  onClick={handlePinValidation}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C46210] to-[#D97706] text-white font-bold text-lg shadow-lg"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  Valider
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Succès */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => {
              setShowSuccessModal(false);
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl mx-auto shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h2 className="text-xl font-bold text-gray-900">Commande validée</h2>
                <motion.button
                  onClick={() => {
                    setShowSuccessModal(false);
                  }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Montant total */}
                <div className="bg-orange-50 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Montant payé</p>
                  <p className="text-3xl font-bold text-[#C46210]">
                    {cartTotal.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>

                {/* Message de succès */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Votre commande a été validée avec succès</p>
                  <p className="text-lg font-bold text-gray-900">Merci pour votre achat !</p>
                </div>

                {/* Bouton Fermer */}
                <motion.button
                  onClick={() => {
                    setShowSuccessModal(false);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C46210] to-[#D97706] text-white font-bold text-lg shadow-lg"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  Fermer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Erreur */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => {
              setShowErrorModal(false);
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl mx-auto shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h2 className="text-xl font-bold text-gray-900">Erreur</h2>
                <motion.button
                  onClick={() => {
                    setShowErrorModal(false);
                  }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Montant total */}
                <div className="bg-orange-50 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
                  <p className="text-3xl font-bold text-[#C46210]">
                    {cartTotal.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>

                {/* Message d erreur */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Une erreur s'est produite</p>
                  <p className="text-lg font-bold text-red-500">{errorMessage}</p>
                </div>

                {/* Bouton Fermer */}
                <motion.button
                  onClick={() => {
                    setShowErrorModal(false);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C46210] to-[#D97706] text-white font-bold text-lg shadow-lg"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  Fermer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Négociation - Produit individuel */}
      <AnimatePresence>
        {showNegotiationModal && productToNegotiate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => {
              setShowNegotiationModal(false);
              setProductToNegotiate(null);
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl mx-auto shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Négocier le prix</h2>
                  <p className="text-sm text-gray-500 mt-1">Propose ton prix à {productToNegotiate.sellerName}</p>
                </div>
                <motion.button
                  onClick={() => {
                    setShowNegotiationModal(false);
                    setProductToNegotiate(null);
                  }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Produit */}
                <div className={`rounded-2xl p-4 ${
                  productToNegotiate.sellerType === 'producteur' ? 'bg-green-50' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden shadow-sm">
                      <ImageWithFallback
                        src={productToNegotiate.image}
                        alt={productToNegotiate.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{productToNegotiate.name}</h3>
                      <p className="text-sm text-gray-600">{productToNegotiate.sellerName}</p>
                      <p className="text-xl font-bold text-[#C46210] mt-1">
                        {productToNegotiate.price} FCFA<span className="text-sm text-gray-500">/{productToNegotiate.unit}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantité */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Quantité ({productToNegotiate.unit})
                  </label>
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={() => setNegotiationQuantity(Math.max(1, negotiationQuantity - 1))}
                      className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </motion.button>
                    
                    <input
                      type="number"
                      value={negotiationQuantity}
                      onChange={(e) => setNegotiationQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-center font-bold text-xl"
                    />
                    
                    <motion.button
                      onClick={() => setNegotiationQuantity(negotiationQuantity + 1)}
                      className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>
                </div>

                {/* Prix proposé */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Ton prix proposé (FCFA/{productToNegotiate.unit})
                  </label>
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={() => setNegotiationPrice(Math.max(50, negotiationPrice - 50))}
                      className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </motion.button>
                    
                    <input
                      type="number"
                      value={negotiationPrice}
                      onChange={(e) => setNegotiationPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-center font-bold text-xl"
                    />
                    
                    <motion.button
                      onClick={() => setNegotiationPrice(negotiationPrice + 50)}
                      className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>

                  {/* Comparaison */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Prix catalogue</p>
                      <p className="text-lg font-bold text-gray-400 line-through">
                        {(productToNegotiate.price * negotiationQuantity).toLocaleString()} <span className="text-[11px] opacity-60">FCFA</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ton total</p>
                      <p className="text-2xl font-bold text-[#C46210]">
                        <Montant value={negotiationPrice * negotiationQuantity} size="xl" color="#C46210" />
                      </p>
                    </div>
                  </div>

                  {negotiationPrice < productToNegotiate.price && (
                    <div className="mt-3 bg-green-100 rounded-lg p-3 text-center">
                      <p className="text-sm font-bold text-green-700">
                        Économie: {(((productToNegotiate.price - negotiationPrice) / productToNegotiate.price) * 100).toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Message optionnel */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Message (optionnel)
                  </label>
                  <textarea
                    value={negotiationMessage}
                    onChange={(e) => setNegotiationMessage(e.target.value)}
                    placeholder="Ajoute un message pour justifier ton prix..."
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-sm resize-none"
                    rows={3}
                  />
                </div>

                {/* Bouton envoyer */}
                <motion.button
                  onClick={handleNegotiationSubmit}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C46210] to-[#D97706] text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <MessageSquare className="w-5 h-5" />
                  Envoyer la proposition
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Succès Négociation */}
      <AnimatePresence>
        {showNegotiationSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => {
              setShowNegotiationSuccess(false);
              setShowCart(false);
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl mx-auto shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h2 className="text-xl font-bold text-gray-900">Proposition envoyée</h2>
                <motion.button
                  onClick={() => {
                    setShowNegotiationSuccess(false);
                    setShowCart(false);
                  }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Icône succès */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-green-600" />
                  </div>
                </div>

                {/* Message */}
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    Ta proposition a été envoyée
                  </p>
                  <p className="text-sm text-gray-600">
                    Le vendeur va étudier ton prix et te répondra bientôt. 
                    Tu recevras une notification dès qu'il aura fait une contre-proposition.
                  </p>
                </div>

                {/* Info */}
                <div className="bg-orange-50 rounded-2xl p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Astuce:</strong> Va dans <strong>Mes Commandes</strong> pour suivre l'état de tes négociations
                  </p>
                </div>

                {/* Boutons */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={() => {
                      setShowNegotiationSuccess(false);
                      setShowCart(false);
                      navigate('/marchand/mes-commandes');
                    }}
                    className="py-3 rounded-xl bg-[#C46210] text-white font-bold"
                    whileTap={{ scale: 0.95 }}
                  >
                    Mes Commandes
                  </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      setShowNegotiationSuccess(false);
                      setShowCart(false);
                    }}
                    className="py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-bold"
                    whileTap={{ scale: 0.95 }}
                  >
                    Continuer
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tantie Voice Assistant */}
      <TantieSagesse 
        isVisible={isListening || tantieSpeaking} 
        isSpeaking={tantieSpeaking}
        onSkip={stopSpeaking}
      />

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
}