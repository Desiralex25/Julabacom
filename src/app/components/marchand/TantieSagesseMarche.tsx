import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
}

interface TantieSagesseProps {
  userName: string;
  products: Product[];
  onAddToCart: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onFilterCategory: (category: string) => void;
  onSearch: (query: string) => void;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
}

type ConversationState = 'welcome' | 'waiting' | 'confirming' | 'idle';

interface PendingAction {
  type: 'add_to_cart';
  product: Product;
  quantity: number;
}

export function TantieSagesseMarche({
  userName,
  products,
  onAddToCart,
  onClearCart,
  onFilterCategory,
  onSearch,
  isListening,
  onListeningChange,
}: TantieSagesseProps) {
  const [conversationState, setConversationState] = useState<ConversationState>('welcome');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const hasWelcomed = useRef(false);
  const recognitionRef = useRef<any>(null);

  // Fonction TTS (Text-to-Speech)
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Arrêter toute synthèse en cours
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      // Afficher le message visuellement
      setCurrentMessage(text);
      setShowMessage(true);

      utterance.onend = () => {
        setTimeout(() => {
          setShowMessage(false);
        }, 2000);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Message de bienvenue au chargement
  useEffect(() => {
    if (!hasWelcomed.current && userName) {
      hasWelcomed.current = true;
      setTimeout(() => {
        speak(`Bienvenue ${userName} au Marché Digital. Tu souhaites que je t'aide à choisir ou tu préfères le faire toi-même ?`);
        setConversationState('waiting');
      }, 1000);
    }
  }, [userName]);

  // Reconnaissance vocale intelligente
  const startListening = () => {
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
      onListeningChange(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      processVoiceCommand(transcript);
    };

    recognition.onerror = () => {
      onListeningChange(false);
    };

    recognition.onend = () => {
      onListeningChange(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Traiter les commandes vocales
  const processVoiceCommand = (command: string) => {
    console.log('Command:', command);

    // Réponse à la question d'aide
    if (conversationState === 'waiting') {
      if (command.includes('aide') || command.includes('aider') || command.includes('choisir')) {
        speak('OK, dis-moi ce que tu veux et je t\'aiderai à mettre ça directement dans le panier');
        setConversationState('idle');
        return;
      } else if (command.includes('seul') || command.includes('moi-même') || command.includes('non')) {
        speak('D\'accord ! Je reste là si tu as besoin');
        setConversationState('idle');
        return;
      }
    }

    // Confirmation d'ajout au panier
    if (conversationState === 'confirming' && pendingAction) {
      if (command.includes('oui') || command.includes('confirme') || command.includes('ok') || command.includes('d\'accord')) {
        const { product, quantity } = pendingAction;
        onAddToCart(product.id, quantity);
        speak(`Parfait ! ${quantity} ${product.unit} de ${product.name} ajouté au panier`);
        setPendingAction(null);
        setConversationState('idle');
        return;
      } else if (command.includes('non') || command.includes('annule')) {
        speak('D\'accord, commande annulée');
        setPendingAction(null);
        setConversationState('idle');
        return;
      }
    }

    // Commande "Vide mon panier"
    if (command.includes('vide') && command.includes('panier')) {
      onClearCart();
      speak('Ton panier a été vidé');
      return;
    }

    // Commande "Montre-moi" + catégorie
    if (command.includes('montre') || command.includes('affiche') || command.includes('voir')) {
      if (command.includes('légume')) {
        onFilterCategory('legumes');
        speak('Voici les légumes disponibles');
        return;
      } else if (command.includes('fruit')) {
        onFilterCategory('fruits');
        speak('Voici les fruits disponibles');
        return;
      } else if (command.includes('céréale') || command.includes('riz') || command.includes('maïs')) {
        onFilterCategory('cereales');
        speak('Voici les céréales disponibles');
        return;
      } else if (command.includes('épice') || command.includes('piment')) {
        onFilterCategory('epices');
        speak('Voici les épices disponibles');
        return;
      } else if (command.includes('tout')) {
        onFilterCategory('tous');
        speak('Voici tous les produits disponibles');
        return;
      }
    }

    // Commande "Combien coûte"
    if (command.includes('combien') && (command.includes('coûte') || command.includes('coute') || command.includes('prix'))) {
      const product = findProductByName(command);
      if (product) {
        speak(`Le ${product.name} coûte ${product.price} francs CFA le ${product.unit}`);
        return;
      } else {
        speak('Je n\'ai pas trouvé ce produit');
        return;
      }
    }

    // Commande "Je veux" ou "Ajoute" + quantité + produit
    if (command.includes('veux') || command.includes('ajoute') || command.includes('prend')) {
      const result = extractProductAndQuantity(command);
      
      if (result) {
        const { product, quantity } = result;
        // Demander confirmation avec le prix
        speak(`Le ${product.name} coûte ${product.price} francs CFA le ${product.unit}. Tu veux ${quantity} ${product.unit} pour ${product.price * quantity} francs CFA. Je confirme ?`);
        setPendingAction({ type: 'add_to_cart', product, quantity });
        setConversationState('confirming');
        return;
      } else {
        speak('Je n\'ai pas compris quel produit tu veux. Peux-tu répéter ?');
        return;
      }
    }

    // Recherche générale
    const product = findProductByName(command);
    if (product) {
      onSearch(product.name);
      speak(`Voici le ${product.name}`);
      return;
    }

    // Si rien ne correspond
    speak('Je n\'ai pas compris. Demande-moi d\'ajouter un produit, de filtrer par catégorie, ou de connaître le prix d\'un article');
  };

  // Trouver un produit par nom
  const findProductByName = (text: string): Product | null => {
    const keywords: Record<string, string[]> = {
      'riz': ['riz', 'ri'],
      'igname': ['igname', 'ignames', 'ignam'],
      'tomate': ['tomate', 'tomates', 'tomato'],
      'maïs': ['maïs', 'mais', 'maiz'],
      'banane': ['banane', 'bananes', 'plantain'],
      'piment': ['piment', 'piments'],
      'aubergine': ['aubergine', 'aubergines'],
      'gombo': ['gombo', 'gombos'],
    };

    for (const [productKey, variants] of Object.entries(keywords)) {
      if (variants.some(variant => text.includes(variant))) {
        const found = products.find(p => p.name.toLowerCase().includes(productKey));
        if (found) return found;
      }
    }

    return null;
  };

  // Extraire produit et quantité de la commande
  const extractProductAndQuantity = (text: string): { product: Product; quantity: number } | null => {
    // Chercher le produit
    const product = findProductByName(text);
    if (!product) return null;

    // Chercher la quantité (nombres en chiffres ou en lettres)
    const numberWords: Record<string, number> = {
      'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5,
      'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10,
    };

    let quantity = 1;

    // Chercher nombre en chiffres
    const numberMatch = text.match(/(\d+)/);
    if (numberMatch) {
      quantity = parseInt(numberMatch[1]);
    } else {
      // Chercher nombre en lettres
      for (const [word, num] of Object.entries(numberWords)) {
        if (text.includes(word)) {
          quantity = num;
          break;
        }
      }
    }

    return { product, quantity };
  };

  return (
    <>
      {/* Bulle de message Tantie Sagesse */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] lg:max-w-md"
          >
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 py-4 rounded-3xl shadow-2xl border-4 border-purple-400/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-purple-200 mb-1">Tantie Sagesse</p>
                  <p className="text-sm font-medium leading-relaxed">{currentMessage}</p>
                </div>
                <button
                  onClick={() => setShowMessage(false)}
                  className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export de la fonction pour le bouton micro */}
      {React.cloneElement(<div />, { ref: (el: any) => {
        if (el) {
          (el as any).startListening = startListening;
        }
      }})}
    </>
  );
}

// Hook pour utiliser Tantie Sagesse
export function useTantieSagesse() {
  const [isListening, setIsListening] = useState(false);
  const tantieSagesseRef = useRef<any>(null);

  const startListening = () => {
    if (tantieSagesseRef.current?.startListening) {
      tantieSagesseRef.current.startListening();
    }
  };

  return {
    isListening,
    setIsListening,
    tantieSagesseRef,
    startListening,
  };
}
