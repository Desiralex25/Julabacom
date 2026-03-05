import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Sparkles, MessageCircle, ChevronDown, Volume2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useCaisseOptional } from '../../contexts/CaisseContext';
import { useUser } from '../../contexts/UserContext';
import {
  TANTI_SAGESSE_CONFIGS,
  getModuleFromPath,
  ModuleType,
  ModuleConfig,
} from '../../config/tantieSagesseConfig';
const tantieSagesseImg = '/images/tantie-sagesse.png';

interface TantieSagesseProps {
  floating?: boolean; // Mode flottant ou intégré
  onAction?: (action: string, data?: any) => void; // Callback pour actions
}

export function TantieSagesse({ floating = true, onAction }: TantieSagesseProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { speak, currentSession } = useApp();
  const caisseContext = useCaisseOptional();
  const { user } = useUser();

  // Use caisse context if available, otherwise use defaults
  const stats = caisseContext?.stats || { ventesJour: 0, depensesJour: 0, epargne: 0, solde: 0, cnps: 0, cmu: 0 };
  const products = caisseContext?.products || [];

  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [config, setConfig] = useState<ModuleConfig>(TANTI_SAGESSE_CONFIGS.dashboard);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [contextMessage, setContextMessage] = useState('');

  const recognitionRef = useRef<any>(null);

  // Detect current module from path
  useEffect(() => {
    const module = getModuleFromPath(location.pathname);
    
    // Only update if module changed
    if (module !== currentModule) {
      setCurrentModule(module);
      setConfig(TANTI_SAGESSE_CONFIGS[module]);
      
      // Announce context change
      const newConfig = TANTI_SAGESSE_CONFIGS[module];
      setContextMessage(`Module ${newConfig.name} activé`);
      
      // Auto-clear context message after 3s
      setTimeout(() => setContextMessage(''), 3000);
    }
  }, [location.pathname, currentModule]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        setTranscript(transcriptResult);

        // Process command when final
        if (event.results[current].isFinal) {
          processVoiceCommand(transcriptResult.toLowerCase());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        speak('Désolée, je n\'ai pas compris. Réessaye.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Process voice command based on current context
  const processVoiceCommand = (command: string) => {
    speak(`Commande reçue : ${command}`);

    // Find matching voice command in current module
    const matchedCommand = config.voiceCommands.find((cmd) =>
      cmd.patterns.some((pattern) => command.includes(pattern))
    );

    if (matchedCommand) {
      executeAction(matchedCommand.action, command);
    } else {
      speak(`Je ne comprends pas cette commande dans le module ${config.name}. ${config.blockMessage || ''}`);
    }

    setTranscript('');
  };

  // Execute action based on context
  const executeAction = (action: string, data?: any) => {
    // Common actions handled here
    switch (action) {
      // Dashboard actions
      case 'announce_sales':
        speak(`Tu as gagné ${stats.ventesJour.toLocaleString()} francs CFA aujourd'hui`);
        break;
      
      case 'announce_expenses':
        speak(`Tu as dépensé ${stats.depensesJour.toLocaleString()} francs CFA aujourd'hui`);
        break;
      
      case 'announce_balance':
        speak(`Ton solde de caisse est de ${stats.solde.toLocaleString()} francs CFA`);
        break;

      case 'open_day':
        speak('Ouvre ta journée pour commencer à travailler');
        break;

      case 'close_day':
        speak('Ferme ta journée pour faire le bilan');
        break;

      // POS actions (handled by parent component)
      case 'show_cart':
      case 'checkout':
      case 'clear_cart':
      case 'add_to_cart':
      case 'remove_from_cart':
        if (onAction) {
          onAction(action, data);
        }
        break;

      // Product actions
      case 'show_low_stock':
        const lowStock = products.filter((p) => (p.stock || 0) < 10);
        speak(`Tu as ${lowStock.length} produits en stock faible`);
        break;

      // Profile actions
      case 'show_score':
        if (user) {
          speak(`Ton score crédit est de ${user.scoreCredit} points. Niveau ${user.niveauMembre}.`);
        }
        break;

      case 'logout':
        speak('Déconnexion confirmée');
        setTimeout(() => navigate('/login'), 1000);
        break;

      // Cotisations
      case 'show_cnps':
        speak(`Ta cotisation CNPS du mois est de ${stats.cnps.toLocaleString()} francs CFA`);
        break;

      case 'show_cmu':
        speak(`Ta cotisation CMU du mois est de ${stats.cmu.toLocaleString()} francs CFA`);
        break;

      case 'explain_cotisations':
        speak('La CNPS est la Caisse Nationale de Prévoyance Sociale. La CMU est la Couverture Maladie Universelle. Ces cotisations sont calculées automatiquement sur tes ventes.');
        break;

      default:
        // Pass to parent component
        if (onAction) {
          onAction(action, data);
        } else {
          speak('Cette action n\'est pas encore disponible');
        }
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
      speak(`Je t'écoute. ${config.personality}`);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSuggestionClick = (action: string) => {
    speak(`Action : ${action}`);
    executeAction(action);
  };

  // Floating button mode
  if (floating && !isExpanded) {
    return (
      <>
        {/* Floating button */}
        <motion.button
          onClick={() => {
            setIsExpanded(true);
            speak(config.welcomeMessage);
          }}
          className="fixed bottom-28 right-6 z-50 rounded-full shadow-2xl overflow-hidden"
          style={{
            width: '70px',
            height: '70px',
            background: 'linear-gradient(135deg, #C46210 0%, #E07B2A 100%)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <img
            src={tantieSagesseImg}
            alt="Tanti Sagesse"
            className="w-full h-full object-cover"
          />
          
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-orange-400"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Module indicator */}
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
            style={{ backgroundColor: config.color }}
          >
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </motion.button>

        {/* Context change notification */}
        <AnimatePresence>
          {contextMessage && (
            <motion.div
              className="fixed bottom-40 right-6 z-40 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg"
              style={{ backgroundColor: config.color }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              {contextMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Expanded panel mode
  return (
    <AnimatePresence>
      {(isExpanded || !floating) && (
        <motion.div
          className={`${
            floating
              ? 'fixed bottom-28 right-6 z-50 w-[90vw] max-w-md'
              : 'w-full'
          }`}
          initial={floating ? { opacity: 0, y: 100, scale: 0.8 } : {}}
          animate={floating ? { opacity: 1, y: 0, scale: 1 } : {}}
          exit={floating ? { opacity: 0, y: 100, scale: 0.8 } : {}}
          transition={{ type: 'spring', damping: 25 }}
        >
          <div
            className="rounded-3xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F0 100%)',
            }}
          >
            {/* Header */}
            <div
              className="p-4 text-white relative overflow-hidden"
              style={{ backgroundColor: config.color }}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-10"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                    <img
                      src={tantieSagesseImg}
                      alt="Tanti Sagesse"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Tanti Sagesse</h3>
                    <p className="text-xs opacity-90">{config.personality}</p>
                  </div>
                </div>

                {floating && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Module badge */}
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">{config.name}</span>
              </div>
            </div>

            {/* Welcome message */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-start gap-3">
                <Volume2 className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: config.color }} />
                <p className="text-sm text-gray-700 leading-relaxed">
                  {config.welcomeMessage}
                </p>
              </div>
            </div>

            {/* Voice input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={isListening ? stopListening : startListening}
                  className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{
                    backgroundColor: isListening ? '#DC2626' : config.color,
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                  transition={isListening ? { duration: 1, repeat: Infinity } : {}}
                >
                  <Mic className="w-6 h-6" />
                </motion.button>

                <div className="flex-1 min-w-0">
                  {isListening ? (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">J'écoute...</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {transcript || 'Parle-moi...'}
                      </p>
                      {/* Wave animation */}
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 rounded-full"
                            style={{ backgroundColor: config.color }}
                            animate={{
                              height: [4, 16, 4],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500">Commande vocale</p>
                      <p className="text-sm font-semibold text-gray-900">
                        Clique pour parler
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick suggestions */}
            {showSuggestions && config.quickSuggestions.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-600">
                    Actions rapides
                  </p>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Masquer
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {config.quickSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion.action}
                      onClick={() => handleSuggestionClick(suggestion.action)}
                      className="px-3 py-2 rounded-xl bg-white border-2 hover:shadow-md transition-all text-left"
                      style={{
                        borderColor: `${config.color}40`,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <p className="text-xs font-semibold text-gray-900">
                        {suggestion.label}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Available commands hint */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                {config.voiceCommands.length} commandes disponibles dans ce module
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}