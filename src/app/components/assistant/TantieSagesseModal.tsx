import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, MessageCircle, Mic, Keyboard, Headphones,
  Loader2, Brain, Volume2, CheckCircle2, AlertTriangle,
  Send, ArrowRight, RotateCcw, MicOff
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router';
import { TantieSagesseFlow, type FlowState, type FlowStep } from '../../services/tantieSagesseFlow';

const tantieSagesseImg = '/images/tantie-sagesse.png';

interface TantieSagesseModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur';
}

const ROLE_COLORS: Record<string, string> = {
  marchand: '#C46210',
  producteur: '#00563B',
  cooperative: '#2072AF',
  institution: '#702963',
  identificateur: '#9F8170',
};

const ROLE_SUGGESTIONS: Record<string, string[]> = {
  marchand: [
    "Aujourd'hui j'ai fait combien ?",
    "Je veux mettre un peu de cote",
    "Quelle est ma meilleure vente ?",
    "Voir mon stock",
  ],
  producteur: [
    "Ma recolte vaut combien ?",
    "Declarer ma recolte de cacao",
    "Quel est mon meilleur produit ?",
    "Creer un cycle agricole",
  ],
  cooperative: [
    "Combien de membres actifs ?",
    "Notre tresorerie est a combien ?",
    "Faire un achat groupe",
    "Qui n'a pas paye sa cotisation ?",
  ],
  institution: [
    "Combien d'utilisateurs actifs ?",
    "Volume total des transactions ?",
    "Valider un compte",
    "Generer un rapport",
  ],
  identificateur: [
    "Identifier un acteur",
    "Combien d'identifications ce mois ?",
    "Valider un dossier",
    "Rechercher un producteur",
  ],
};

// Labels et icones par etape du flow
const STEP_CONFIG: Record<FlowStep, { label: string; icon: React.ReactNode; color: string }> = {
  idle: { label: '', icon: null, color: '' },
  recording: { label: "Je t'ecoute...", icon: <Mic className="w-5 h-5" />, color: '#EF4444' },
  transcribing: { label: 'Je lis tes levres...', icon: <Loader2 className="w-5 h-5 animate-spin" />, color: '#F59E0B' },
  thinking: { label: 'Tantie reflechit...', icon: <Brain className="w-5 h-5" />, color: '#8B5CF6' },
  executing: { label: 'Je m\'en occupe...', icon: <ArrowRight className="w-5 h-5" />, color: '#3B82F6' },
  speaking: { label: 'Tantie te parle...', icon: <Volume2 className="w-5 h-5" />, color: '#10B981' },
  done: { label: 'C\'est fait !', icon: <CheckCircle2 className="w-5 h-5" />, color: '#10B981' },
  error: { label: 'Aie, un souci...', icon: <AlertTriangle className="w-5 h-5" />, color: '#EF4444' },
};

export function TantieSagesseModal({ isOpen, onClose, role }: TantieSagesseModalProps) {
  const { user } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'ecrire' | 'parler'>('parler');
  const [inputValue, setInputValue] = useState('');
  const [flowState, setFlowState] = useState<FlowState>({
    step: 'idle',
    transcribedText: '',
    intentResult: null,
    responseMessage: '',
    actionPath: '',
    error: '',
  });

  const flowRef = useRef<TantieSagesseFlow | null>(null);

  const activeColor = ROLE_COLORS[role] || ROLE_COLORS.marchand;
  const suggestions = ROLE_SUGGESTIONS[role] || ROLE_SUGGESTIONS.marchand;
  const currentScreen = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Init flow orchestrator
  useEffect(() => {
    flowRef.current = new TantieSagesseFlow((state) => {
      setFlowState({ ...state });
    });
    return () => {
      flowRef.current?.abort();
    };
  }, []);

  // Reset on modal close
  useEffect(() => {
    if (!isOpen) {
      flowRef.current?.reset();
      setInputValue('');
    }
  }, [isOpen]);

  // Navigate when action detected
  useEffect(() => {
    if (flowState.step === 'done' && flowState.actionPath) {
      const action = flowState.actionPath;
      if (action.startsWith('navigate:')) {
        const path = action.replace('navigate:', '');
        // Petit delai pour que l'utilisateur entende la reponse
        const timer = setTimeout(() => {
          onClose();
          navigate(path);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [flowState.step, flowState.actionPath, navigate, onClose]);

  // ---- HANDLERS ----

  const handleMicPress = useCallback(async () => {
    if (!flowRef.current) return;

    if (flowState.step === 'recording') {
      // Stop and process
      await flowRef.current.stopAndProcess(role, currentScreen, user?.id);
    } else {
      // Start recording
      await flowRef.current.startRecording();
    }
  }, [flowState.step, role, currentScreen, user?.id]);

  const handleTextSubmit = useCallback(async () => {
    if (!flowRef.current || !inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue('');
    await flowRef.current.processText(text, role, currentScreen, user?.id);
  }, [inputValue, role, currentScreen, user?.id]);

  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    if (!flowRef.current) return;
    setInputValue(suggestion);
    await flowRef.current.processText(suggestion, role, currentScreen, user?.id);
  }, [role, currentScreen, user?.id]);

  const handleRetry = useCallback(() => {
    flowRef.current?.reset();
  }, []);

  const isProcessing = !['idle', 'done', 'error'].includes(flowState.step) && flowState.step !== 'recording';
  const showResults = flowState.step === 'done' || flowState.step === 'error' || isProcessing;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div
            className="relative w-full h-full max-w-2xl mx-auto flex flex-col overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${activeColor}F5 0%, ${activeColor}E0 50%, ${activeColor}CC 100%)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cercles decoratifs animes */}
            <div className="absolute inset-0 flex items-start justify-center pt-24 pointer-events-none">
              <motion.div
                className="absolute rounded-full border-2 border-white/20"
                style={{ width: '380px', height: '380px' }}
                animate={{
                  scale: flowState.step === 'recording' ? [1, 1.15, 1] : [1, 1.05, 1],
                  opacity: flowState.step === 'recording' ? [0.4, 0.7, 0.4] : [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: flowState.step === 'recording' ? 1.2 : 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute rounded-full border-2 border-white/15"
                style={{ width: '500px', height: '500px' }}
                animate={{
                  scale: flowState.step === 'recording' ? [1, 1.12, 1] : [1, 1.05, 1],
                  opacity: flowState.step === 'recording' ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: flowState.step === 'recording' ? 1.5 : 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.3,
                }}
              />
            </div>

            {/* Bouton Fermer */}
            <motion.button
              onClick={() => { flowRef.current?.abort(); onClose(); }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-20 hover:bg-white/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-white" strokeWidth={2.5} />
            </motion.button>

            {/* -- SECTION HAUTE -- Avatar + Badge status */}
            <div className="relative z-10 flex flex-col items-center pt-14 px-6">
              {/* Image Tantie avec halo d'etat */}
              <div className="relative">
                {flowState.step !== 'idle' && (
                  <motion.div
                    className="absolute -inset-4 rounded-full"
                    style={{
                      border: `3px solid ${STEP_CONFIG[flowState.step].color}`,
                      opacity: 0.6,
                    }}
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <motion.img
                  src={tantieSagesseImg}
                  alt="Tantie Sagesse"
                  className="w-36 h-auto object-contain drop-shadow-2xl"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: flowState.step === 'speaking' ? [0, -4, 0] : 0,
                  }}
                  transition={
                    flowState.step === 'speaking'
                      ? { y: { duration: 0.6, repeat: Infinity } }
                      : { delay: 0.2, type: 'spring', stiffness: 200 }
                  }
                />
              </div>

              {/* Badge d'etat du flow */}
              <AnimatePresence mode="wait">
                {flowState.step !== 'idle' ? (
                  <motion.div
                    key={flowState.step}
                    className="mt-3 mb-2 px-5 py-2.5 rounded-full backdrop-blur-sm flex items-center gap-2.5"
                    style={{ backgroundColor: `${STEP_CONFIG[flowState.step].color}30`, border: `1.5px solid ${STEP_CONFIG[flowState.step].color}60` }}
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span style={{ color: STEP_CONFIG[flowState.step].color }}>{STEP_CONFIG[flowState.step].icon}</span>
                    <span className="text-white font-semibold text-sm">{STEP_CONFIG[flowState.step].label}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    className="mt-3 mb-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-white" />
                      <span className="text-white font-medium text-sm">Tu peux dire:</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton Support */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { flowRef.current?.abort(); onClose(); navigate(`/${role}/support`); }}
                className="mb-3 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md"
                style={{ color: activeColor }}
              >
                <Headphones className="w-4 h-4" />
                <span className="text-sm font-bold">Support & Aide JULABA</span>
              </motion.button>
            </div>

            {/* -- SECTION MILIEU -- Resultats / Suggestions */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-2">

              {/* Texte transcrit */}
              <AnimatePresence>
                {flowState.transcribedText && (
                  <motion.div
                    className="mb-3 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-xs font-medium text-gray-400 mb-1">Ce que tu as dit :</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {flowState.transcribedText}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message de reponse */}
              <AnimatePresence>
                {flowState.responseMessage && flowState.step !== 'thinking' && (
                  <motion.div
                    className="mb-3 rounded-2xl p-4 shadow-lg border-2"
                    style={{
                      backgroundColor: `${activeColor}15`,
                      borderColor: `${activeColor}40`,
                    }}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-xs font-medium mb-1" style={{ color: activeColor }}>
                      Tantie Sagesse :
                    </p>
                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                      {flowState.responseMessage}
                    </p>

                    {/* Badge action detectee */}
                    {flowState.intentResult && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: activeColor }}
                        >
                          {flowState.intentResult.intent.replace(/_/g, ' ')}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Confiance: {Math.round((flowState.intentResult.confidence || 0) * 100)}%
                        </span>
                      </div>
                    )}

                    {/* Bouton action navigation */}
                    {flowState.actionPath?.startsWith('navigate:') && flowState.step === 'done' && (
                      <motion.button
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-white text-sm font-bold shadow-lg"
                        style={{ backgroundColor: activeColor }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const path = flowState.actionPath.replace('navigate:', '');
                          flowRef.current?.abort();
                          onClose();
                          navigate(path);
                        }}
                      >
                        <ArrowRight className="w-4 h-4" />
                        Y aller maintenant
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Erreur */}
              <AnimatePresence>
                {flowState.step === 'error' && (
                  <motion.div
                    className="mb-3 bg-red-50 border-2 border-red-200 rounded-2xl p-4 shadow-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700">{flowState.error}</p>
                        <motion.button
                          className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800"
                          onClick={handleRetry}
                          whileTap={{ scale: 0.95 }}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reessayer
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggestions (visibles au repos ou apres done) */}
              {(flowState.step === 'idle' || flowState.step === 'done') && (
                <div className="grid grid-cols-2 gap-3">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isProcessing}
                      className="relative bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-lg text-left group overflow-hidden disabled:opacity-50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                      whileHover={{ scale: 1.04, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <p className="text-sm font-semibold leading-snug" style={{ color: activeColor }}>
                        {suggestion}
                      </p>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Mode Ecrire : champ de saisie */}
              {mode === 'ecrire' && flowState.step === 'idle' && (
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-white rounded-2xl p-3 shadow-lg flex items-center gap-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                      placeholder="Ecris ta question ici..."
                      className="flex-1 outline-none text-gray-700 placeholder:text-gray-400 text-sm bg-transparent"
                      disabled={isProcessing}
                    />
                    <motion.button
                      onClick={handleTextSubmit}
                      disabled={!inputValue.trim() || isProcessing}
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                      style={{ backgroundColor: activeColor }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* -- SECTION BAS -- Micro + boutons mode */}
            <div className="relative z-10 px-6 pb-8 pt-2 flex flex-col items-center gap-4">

              {/* Micro principal (mode parler) */}
              {mode === 'parler' && (
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 250 }}
                >
                  <div className="relative">
                    {/* Halos pulsants quand enregistrement actif */}
                    {flowState.step === 'recording' && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full bg-red-400/40"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full bg-red-400/25"
                          animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full bg-red-400/15"
                          animate={{ scale: [1, 2.1, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                        />
                      </>
                    )}

                    {/* Halos quand traitement en cours */}
                    {isProcessing && (
                      <motion.div
                        className="absolute -inset-3 rounded-full"
                        style={{ border: `2px solid ${STEP_CONFIG[flowState.step].color}` }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    )}

                    <motion.button
                      onClick={handleMicPress}
                      disabled={isProcessing}
                      className="relative w-20 h-20 rounded-full shadow-2xl flex items-center justify-center disabled:opacity-50"
                      style={{
                        backgroundColor: flowState.step === 'recording' ? '#EF4444' : 'rgba(255,255,255,0.25)',
                        border: `3px solid ${flowState.step === 'recording' ? '#FCA5A5' : 'rgba(255,255,255,0.6)'}`,
                      }}
                      whileHover={!isProcessing ? { scale: 1.08 } : {}}
                      whileTap={!isProcessing ? { scale: 0.92 } : {}}
                      animate={flowState.step === 'recording' ? { scale: [1, 1.06, 1] } : {}}
                      transition={flowState.step === 'recording' ? { duration: 0.8, repeat: Infinity } : {}}
                    >
                      {isProcessing ? (
                        <Loader2
                          className="w-9 h-9 text-white animate-spin"
                          strokeWidth={2.5}
                        />
                      ) : flowState.step === 'recording' ? (
                        <MicOff className="w-9 h-9 text-white" strokeWidth={2.5} />
                      ) : (
                        <Mic
                          className="w-9 h-9 text-white"
                          strokeWidth={2.5}
                        />
                      )}
                    </motion.button>
                  </div>

                  <motion.p
                    className="mt-2 text-white/90 text-xs font-medium text-center"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {flowState.step === 'recording'
                      ? "Appuie pour arreter"
                      : isProcessing
                        ? STEP_CONFIG[flowState.step].label
                        : "Appuie pour parler"
                    }
                  </motion.p>
                </motion.div>
              )}

              {/* Boutons Ecrire / Parler */}
              <div className="flex gap-3 w-full">
                <motion.button
                  onClick={() => { setMode('ecrire'); flowRef.current?.abort(); }}
                  className={`flex-1 px-5 py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    mode === 'ecrire'
                      ? 'bg-white shadow-lg'
                      : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                  }`}
                  style={mode === 'ecrire' ? { color: activeColor } : {}}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Keyboard className="w-5 h-5" />
                  Ecrire
                </motion.button>

                <motion.button
                  onClick={() => { setMode('parler'); }}
                  className={`flex-1 px-5 py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    mode === 'parler'
                      ? 'bg-white shadow-lg'
                      : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                  }`}
                  style={mode === 'parler' ? { color: activeColor } : {}}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Mic className="w-5 h-5" />
                  Parler
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
