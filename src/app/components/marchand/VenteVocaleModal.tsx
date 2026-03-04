import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Eye, EyeOff, History, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { useStock } from '../../contexts/StockContext';
import tantieSagesseImg from 'figma:asset/c503d0acc72377dbc52462a00eea2a8e1e249e38.png';

interface VenteVocaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Period = 'today' | 'week' | 'month' | 'all';

export function VenteVocaleModal({ isOpen, onClose }: VenteVocaleModalProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getSalesHistory, speak } = useApp();
  const { getStock, recordSale } = useStock();
  
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');
  const [showBalance, setShowBalance] = useState(false); // Masqué par défaut
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [tantieMessage, setTantieMessage] = useState('');
  const [pendingSale, setPendingSale] = useState<{
    productName: string;
    quantity: number;
    price: number;
    unit: string;
  } | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const hasWelcomed = useRef(false);

  // Calculer le solde selon la période
  const calculateBalance = () => {
    const now = new Date();
    const sales = getSalesHistory({});
    
    let filteredSales = sales;
    
    switch (selectedPeriod) {
      case 'today':
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filteredSales = sales.filter(s => new Date(s.date) >= todayStart);
        break;
      case 'week':
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSales = sales.filter(s => new Date(s.date) >= weekStart);
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredSales = sales.filter(s => new Date(s.date) >= monthStart);
        break;
      case 'all':
        filteredSales = sales;
        break;
    }
    
    return filteredSales.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
  };

  const balance = calculateBalance();

  // Labels des périodes
  const periodLabels = {
    today: "Aujourd'hui",
    week: 'Semaine',
    month: 'Mois',
    all: 'Tout'
  };

  // Message de bienvenue
  useEffect(() => {
    if (isOpen && !hasWelcomed.current && user) {
      hasWelcomed.current = true;
      setTimeout(() => {
        speakMessage(`Salut ${user.prenoms} ! Dis-moi ce que tu as vendu, par exemple : j'ai vendu 2 tomates à 500 francs.`);
      }, 500);
    }
    
    // Reset quand on ferme
    if (!isOpen) {
      hasWelcomed.current = false;
      setPendingSale(null);
      stopListening();
    }
  }, [isOpen, user]);

  // Fonction TTS
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      setTantieMessage(text);
      setIsSpeaking(true);
      
      utterance.onend = () => {
        setTimeout(() => setIsSpeaking(false), 1500);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fonction pour trouver un produit dans le stock
  const findProductInStock = (productName: string) => {
    const stock = getStock();
    const normalizedName = productName.toLowerCase().trim();
    
    // Recherche exacte
    let product = stock.find(p => p.name.toLowerCase() === normalizedName);
    
    // Recherche partielle
    if (!product) {
      product = stock.find(p => 
        p.name.toLowerCase().includes(normalizedName) || 
        normalizedName.includes(p.name.toLowerCase())
      );
    }
    
    return product;
  };

  // Parser la commande vocale
  const parseVoiceCommand = (text: string) => {
    const normalized = text.toLowerCase();
    
    // Pattern: "j'ai vendu X PRODUIT à Y" ou "X PRODUIT à Y"
    const patterns = [
      /(?:j'ai vendu|vendu)\s+(\d+(?:[.,]\d+)?)\s+(.+?)\s+(?:à|a)\s+(\d+)/i,
      /(\d+(?:[.,]\d+)?)\s+(.+?)\s+(?:à|a)\s+(\d+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) {
        const quantity = parseFloat(match[1].replace(',', '.'));
        const productName = match[2].trim();
        const price = parseInt(match[3]);
        
        // Chercher le produit dans le stock
        const product = findProductInStock(productName);
        
        if (product) {
          // Produit trouvé dans le stock
          setPendingSale({
            productName: product.name,
            quantity,
            price,
            unit: product.unit || 'unité'
          });
          
          speakMessage(
            `J'ai compris : ${quantity} ${product.unit || 'unité'} de ${product.name} à ${price.toLocaleString()} francs CFA. Je confirme ?`
          );
          return true;
        } else {
          // Produit non trouvé
          speakMessage(
            `Je n'ai pas trouvé "${productName}" dans ton stock. Vérifie le nom ou ajoute-le d'abord.`
          );
          return false;
        }
      }
    }
    
    speakMessage(
      "Je n'ai pas bien compris. Dis-moi par exemple : j'ai vendu 2 tomates à 500 francs."
    );
    return false;
  };

  // Démarrer l'écoute vocale
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speakMessage("Désolée, ton navigateur ne supporte pas la reconnaissance vocale.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      speakMessage("Je t'écoute...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Commande vocale:', transcript);
      
      // Si on est en attente de confirmation
      if (pendingSale) {
        const normalized = transcript.toLowerCase();
        if (normalized.includes('oui') || normalized.includes('confirme') || normalized.includes('ok')) {
          confirmSale();
        } else if (normalized.includes('non') || normalized.includes('annule')) {
          setPendingSale(null);
          speakMessage("D'accord, annulé. Que veux-tu faire ?");
        } else {
          speakMessage("Dis oui pour confirmer ou non pour annuler.");
        }
      } else {
        // Parser la nouvelle commande
        parseVoiceCommand(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Erreur reconnaissance vocale:', event.error);
      setIsListening(false);
      if (event.error !== 'no-speech') {
        speakMessage("Je n'ai pas bien entendu, réessaie.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Confirmer la vente
  const confirmSale = () => {
    if (!pendingSale) return;
    
    const product = findProductInStock(pendingSale.productName);
    if (!product) {
      speakMessage("Erreur : produit introuvable.");
      setPendingSale(null);
      return;
    }

    // Enregistrer la vente
    recordSale({
      productId: product.id,
      productName: product.name,
      quantity: pendingSale.quantity,
      price: pendingSale.price,
      category: product.category,
      purchasePrice: product.purchasePrice,
      paymentMethod: 'Espèces',
    });

    const total = pendingSale.quantity * pendingSale.price;
    speakMessage(
      `Vente enregistrée ! ${pendingSale.quantity} ${pendingSale.unit} de ${pendingSale.productName} pour ${total.toLocaleString()} francs CFA.`
    );
    
    setPendingSale(null);
    
    // Rafraîchir le solde après 2 secondes
    setTimeout(() => {
      setSelectedPeriod('today');
    }, 2000);
  };

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
  };

  const handleVendreClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Fond avec image de marché blurée */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1759344114577-b6c32e4d68c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0JTIwdmVnZXRhYmxlcyUyMGNvbG9yZnVsfGVufDF8fHx8MTc3MjIyNDQ3MXww&ixlib=rb-4.1.0&q=80&w=1080)`,
            filter: 'blur(12px) brightness(0.7)',
          }}
        />
        
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Contenu */}
        <div 
          className="relative flex flex-col h-full px-6 pt-12 pb-32"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Salutation */}
          <motion.h1
            className="text-white text-3xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Bonjour {user?.prenoms} 👋
          </motion.h1>

          {/* Carte Solde */}
          <motion.div
            className="bg-white rounded-3xl px-6 py-5 mb-4 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Solde</span>
              <motion.button
                onClick={() => setShowBalance(!showBalance)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                {showBalance ? (
                  <Eye className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
              </motion.button>
            </div>
            
            {showBalance ? (
              <div className="text-[#FF5722] text-4xl font-bold">
                {balance.toLocaleString()} FCFA
              </div>
            ) : (
              <div className="text-[#FF5722] text-4xl font-bold">
                •••••• FCFA
              </div>
            )}
          </motion.div>

          {/* Boutons de période */}
          <motion.div
            className="flex gap-2 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {(['today', 'week', 'month', 'all'] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  selectedPeriod === period
                    ? 'bg-[#FF5722] text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700'
                }`}
              >
                {periodLabels[period]}
              </button>
            ))}
          </motion.div>

          {/* Espace flexible pour centrer le micro */}
          <div className="flex-1" />

          {/* Gros cercle Micro avec texte VENDRE */}
          <motion.div
            className="flex flex-col items-center gap-4 mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          >
            <motion.button
              onClick={handleVendreClick}
              className="relative w-64 h-64 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isListening || isSpeaking ? {
                filter: [
                  'drop-shadow(0 0 0px rgba(255, 87, 34, 0.7))',
                  'drop-shadow(0 0 40px rgba(255, 87, 34, 0.9))',
                  'drop-shadow(0 0 0px rgba(255, 87, 34, 0.7))',
                ],
                scale: isSpeaking ? [1, 1.08, 1] : 1
              } : {}}
              transition={{
                duration: isSpeaking ? 0.8 : 1.5,
                repeat: (isListening || isSpeaking) ? Infinity : 0,
                repeatType: 'loop',
                ease: 'easeInOut'
              }}
            >
              <img 
                src={tantieSagesseImg} 
                alt="Tantie Sagesse" 
                className="w-full h-full object-contain"
              />
            </motion.button>
            
            <div className="text-white text-4xl font-bold tracking-wide">
              VENDRE
            </div>
          </motion.div>

          {/* Espace flexible */}
          <div className="flex-1" />

          {/* Bouton Mes ventes */}
          <motion.button
            onClick={() => {
              navigate('/marchand/ventes-passees');
              onClose();
            }}
            className="bg-white rounded-2xl px-6 py-4 flex items-center justify-center gap-3 shadow-lg mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <History className="w-6 h-6 text-gray-700" />
            <span className="text-gray-900 text-lg font-semibold">Mes ventes</span>
          </motion.button>

          {/* Bulle de message de Tantie Sagesse - alignée avec bouton Mes ventes */}
          <AnimatePresence>
            {isSpeaking && tantieMessage && (
              <motion.div
                className="bg-white rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <p className="text-gray-700 text-base leading-relaxed flex-1">
                  {tantieMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bouton de fermeture flottant centré en bas */}
        <motion.button
          onClick={onClose}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white/90 backdrop-blur-lg border-2 border-white/50 shadow-2xl flex items-center justify-center text-gray-800 hover:bg-white transition-all z-[110]"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 25 }}
          whileHover={{ scale: 1.1, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X className="w-8 h-8" strokeWidth={3} />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}