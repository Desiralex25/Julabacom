import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, MessageCircle, Mic, Keyboard, Headphones } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router';
import tantieSagesseImg from 'figma:asset/c57c6b035a1cf2a547f2ddf8ab7ca6884bc3980e.png';

interface TantieSagesseModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur';
}

export function TantieSagesseModal({ isOpen, onClose, role }: TantieSagesseModalProps) {
  const { speak } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'ecrire' | 'parler'>('parler');
  const [isListening, setIsListening] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const roleColors = {
    marchand: '#C46210',
    producteur: '#00563B',
    cooperative: '#2072AF',
    institution: '#702963',
    identificateur: '#FF6B35',
  };

  const activeColor = roleColors[role];

  // Suggestions de questions prédéfinies
  const suggestions = [
    "Aujourd'hui j'ai fais combien?",
    "Je veux mettre un peu de côté",
    "Quelle est ma meilleure vente?",
    "Comment gérer mon stock?",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    speak(suggestion);
  };

  const handleMicClick = () => {
    setIsListening(!isListening);
    if (!isListening) {
      speak('Je t\'écoute, dis-moi ce que tu veux faire.');
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
        <>
          {/* Full Screen Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <div 
              className="relative w-full h-full max-w-2xl overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${activeColor}F5 0%, ${activeColor}E5 40%, ${activeColor}D0 100%)`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cercles concentriques en arrière-plan */}
              <div className="absolute inset-0 flex items-start justify-center pt-32">
                <motion.div
                  className="absolute rounded-full border-2 border-white/20"
                  style={{ width: '400px', height: '400px' }}
                  animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute rounded-full border-2 border-white/15"
                  style={{ width: '500px', height: '500px' }}
                  animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
                <motion.div
                  className="absolute rounded-full border-2 border-white/10"
                  style={{ width: '600px', height: '600px' }}
                  animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
              </div>

              {/* Bouton Fermer */}
              <motion.button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10 hover:bg-white/30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-white" strokeWidth={2.5} />
              </motion.button>

              {/* Contenu */}
              <div className="relative h-full flex flex-col items-center pt-16 px-6 pb-6">
                {/* Image de Tantie Sagesse */}
                <motion.div
                  className="relative mb-4 z-10"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                >
                  {/* Image sans masque */}
                  <img
                    src={tantieSagesseImg}
                    alt="Tantie Sagesse"
                    className="relative z-10 w-48 h-auto object-contain drop-shadow-2xl"
                  />
                </motion.div>

                {/* Badge "Tu peux dire:" */}
                <motion.div
                  className="mb-4 px-6 py-2 rounded-full bg-white/20 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">Tu peux dire:</span>
                  </div>
                </motion.div>

                {/* Bouton Support rapide */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    onClose();
                    navigate(`/${role}/support`);
                  }}
                  className="mb-4 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md"
                  style={{ color: activeColor }}
                >
                  <Headphones className="w-4 h-4" />
                  <span className="text-sm font-bold">Support & Aide JÙLABA</span>
                </motion.button>

                {/* Zone de contenu selon le mode */}
                <div className="flex-1 w-full overflow-y-auto mb-4 px-2 scrollbar-hide"
                  style={{ 
                    maxHeight: mode === 'ecrire' ? 'calc(100vh - 480px)' : 'calc(100vh - 480px)',
                  }}
                >
                  {mode === 'ecrire' ? (
                    <>
                      {/* Suggestions */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {suggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="relative bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all group overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              delay: 0.6 + index * 0.1,
                              type: 'spring',
                              stiffness: 300,
                              damping: 20
                            }}
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Effet shine au hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            
                            {/* Texte */}
                            <p 
                              className="text-sm font-semibold leading-snug text-left"
                              style={{ color: activeColor }}
                            >
                              {suggestion}
                            </p>
                          </motion.button>
                        ))}
                      </div>

                      {/* Champ de saisie */}
                      <div className="sticky bottom-0 pt-4">
                        <div className="bg-white rounded-2xl p-3 shadow-lg flex items-center gap-3">
                          <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Écris ta question ici..."
                            className="flex-1 outline-none text-gray-700 placeholder:text-gray-400"
                          />
                          <motion.button
                            onClick={handleSubmit}
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: activeColor }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <MessageCircle className="w-5 h-5 text-white" />
                          </motion.button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Mode Parler - avec suggestions aussi
                    <>
                      {/* Suggestions */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {suggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="relative bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all group overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              delay: 0.6 + index * 0.1,
                              type: 'spring',
                              stiffness: 300,
                              damping: 20
                            }}
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Effet shine au hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            
                            {/* Texte */}
                            <p 
                              className="text-sm font-semibold leading-snug text-left"
                              style={{ color: activeColor }}
                            >
                              {suggestion}
                            </p>
                          </motion.button>
                        ))}
                      </div>

                      {/* Bouton micro central avec état */}
                      <div className="flex flex-col items-center justify-center pt-4">
                        <motion.button
                          onClick={handleMicClick}
                          className="w-32 h-32 rounded-full shadow-2xl flex items-center justify-center mb-6"
                          style={{ backgroundColor: isListening ? activeColor : 'rgba(255, 255, 255, 0.3)' }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                          transition={isListening ? { duration: 1, repeat: Infinity } : {}}
                        >
                          <Mic className="w-16 h-16 text-white" strokeWidth={2.5} />
                        </motion.button>

                        {isListening ? (
                          <div className="text-center">
                            <p className="text-white text-xl font-medium">Je t'écoute...</p>
                            <p className="text-white/80 text-sm mt-2">Parle maintenant</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-white text-lg">Appuie sur le bouton</p>
                            <p className="text-white/80 text-sm mt-2">pour commencer à parler</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Boutons Écrire/Parler - en bas, toujours visibles */}
                <div className="flex gap-3 justify-center w-full px-4 pb-2 mt-6">
                  {/* Bouton Écrire */}
                  <motion.button
                    onClick={() => setMode('ecrire')}
                    className={`flex-1 px-5 py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      mode === 'ecrire'
                        ? 'bg-white shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                    }`}
                    style={mode === 'ecrire' ? { color: activeColor } : {}}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Keyboard className="w-5 h-5" />
                    Écrire
                  </motion.button>

                  {/* Bouton Parler */}
                  <motion.button
                    onClick={() => setMode('parler')}
                    className={`flex-1 px-5 py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      mode === 'parler'
                        ? 'bg-white shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                    }`}
                    style={mode === 'parler' ? { color: activeColor } : {}}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mic className="w-5 h-5" />
                    Parler
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}