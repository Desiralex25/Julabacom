import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Mic, Keyboard, Headphones } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router';
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
    "Je veux mettre un peu de côté",
    "Quelle est ma meilleure vente ?",
    "Comment gérer mon stock ?",
  ],
  producteur: [
    "Ma récolte vaut combien ?",
    "Comment déclarer ma récolte ?",
    "Quel est mon meilleur produit ?",
    "Comment créer un cycle agricole ?",
  ],
  cooperative: [
    "Combien de membres actifs ?",
    "Notre trésorerie est à combien ?",
    "Comment faire un achat groupé ?",
    "Qui n'a pas payé sa cotisation ?",
  ],
  institution: [
    "Combien d'utilisateurs actifs ?",
    "Volume total des transactions ?",
    "Comment valider un compte ?",
    "Générer un rapport ?",
  ],
  identificateur: [
    "Comment identifier un acteur ?",
    "Combien d'identifications ce mois ?",
    "Comment valider un dossier ?",
    "Rechercher un producteur ?",
  ],
};

export function TantieSagesseModal({ isOpen, onClose, role }: TantieSagesseModalProps) {
  const { speak } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'ecrire' | 'parler'>('parler');
  const [isListening, setIsListening] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const activeColor = ROLE_COLORS[role] || ROLE_COLORS.marchand;
  const suggestions = ROLE_SUGGESTIONS[role] || ROLE_SUGGESTIONS.marchand;

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    speak(suggestion);
  };

  const handleMicClick = () => {
    setIsListening(!isListening);
    if (!isListening) {
      speak("Je t'écoute, dis-moi ce que tu veux faire.");
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      speak(`Tu as dit: ${inputValue}`);
      setInputValue('');
    }
  };

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
            {/* Cercles décoratifs */}
            <div className="absolute inset-0 flex items-start justify-center pt-24 pointer-events-none">
              <motion.div
                className="absolute rounded-full border-2 border-white/20"
                style={{ width: '380px', height: '380px' }}
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute rounded-full border-2 border-white/15"
                style={{ width: '500px', height: '500px' }}
                animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
            </div>

            {/* Bouton Fermer */}
            <motion.button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-20 hover:bg-white/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-white" strokeWidth={2.5} />
            </motion.button>

            {/* ── SECTION HAUTE — image + badge (fixe) ── */}
            <div className="relative z-10 flex flex-col items-center pt-14 px-6">
              {/* Image Tantie */}
              <motion.img
                src={tantieSagesseImg}
                alt="Tantie Sagesse"
                className="w-44 h-auto object-contain drop-shadow-2xl"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              />

              {/* Badge Tu peux dire */}
              <motion.div
                className="mt-2 mb-3 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span className="text-white font-medium text-sm">Tu peux dire:</span>
                </div>
              </motion.div>

              {/* Bouton Support */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { onClose(); navigate(`/${role}/support`); }}
                className="mb-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md"
                style={{ color: activeColor }}
              >
                <Headphones className="w-4 h-4" />
                <span className="text-sm font-bold">Support & Aide JÙLABA</span>
              </motion.button>
            </div>

            {/* ── SECTION MILIEU — suggestions (scrollable si besoin) ── */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-2">
              <div className="grid grid-cols-2 gap-3">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="relative bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-lg text-left group overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + index * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
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

              {/* Mode Écrire : champ de saisie sous les suggestions */}
              {mode === 'ecrire' && (
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Écris ta question ici..."
                      className="flex-1 outline-none text-gray-700 placeholder:text-gray-400 text-sm"
                    />
                    <motion.button
                      onClick={handleSubmit}
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: activeColor }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MessageCircle className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── SECTION BAS — micro (mode parler) + boutons ── */}
            <div className="relative z-10 px-6 pb-8 pt-2 flex flex-col items-center gap-4">

              {/* Micro intégré — visible uniquement en mode "parler" */}
              {mode === 'parler' && (
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 250 }}
                >
                  {/* Halo pulsant quand écoute active */}
                  <div className="relative">
                    {isListening && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full bg-white/30"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full bg-white/20"
                          animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                        />
                      </>
                    )}
                    <motion.button
                      onClick={handleMicClick}
                      className="relative w-20 h-20 rounded-full shadow-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: isListening ? 'white' : 'rgba(255,255,255,0.25)',
                        border: '3px solid rgba(255,255,255,0.6)',
                      }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      animate={isListening ? { scale: [1, 1.06, 1] } : {}}
                      transition={isListening ? { duration: 1, repeat: Infinity } : {}}
                    >
                      <Mic
                        className="w-9 h-9"
                        style={{ color: isListening ? activeColor : 'white' }}
                        strokeWidth={2.5}
                      />
                    </motion.button>
                  </div>

                  <motion.p
                    className="mt-2 text-white/90 text-xs font-medium text-center"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isListening ? "Je t'écoute..." : "Appuie pour parler"}
                  </motion.p>
                </motion.div>
              )}

              {/* Boutons Écrire / Parler */}
              <div className="flex gap-3 w-full">
                <motion.button
                  onClick={() => { setMode('ecrire'); setIsListening(false); }}
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
                  Écrire
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