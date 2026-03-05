import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, MessageCircle, Edit, Mic2 } from 'lucide-react';
import { Navigation } from '../layout/Navigation';
import { getRoleColor } from '../../config/roleConfig';

// Import image Tantie Sagesse
const tantieSagesseImg = '/images/tantie-sagesse.png';

interface UniversalPageWrapperProps {
  role: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur';
  children: ReactNode;
  suggestions?: string[];
  className?: string;
}

export function UniversalPageWrapper({ 
  role, 
  children, 
  suggestions,
  className = ''
}: UniversalPageWrapperProps) {
  const [tantieSagesseOuverte, setTantieSagesseOuverte] = useState(false);
  const [tantieMode, setTantieMode] = useState<'ecrire' | 'parler'>('ecrire');
  const [messageUtilisateur, setMessageUtilisateur] = useState('');
  const [enEcoute, setEnEcoute] = useState(false);

  const activeColor = getRoleColor(role);

  // Suggestions par défaut basées sur le rôle
  const defaultSuggestions: Record<typeof role, string[]> = {
    marchand: [
      "Combien j'ai vendu aujourd'hui ?",
      "État de ma caisse",
      "Mes produits en stock",
      "Ajouter une vente",
    ],
    producteur: [
      "Combien j'ai vendu ce mois ?",
      "Mes stocks de tomates",
      "Nouvelles commandes",
      "Planifier une livraison",
    ],
    cooperative: [
      "État des stocks",
      "Liste des membres",
      "Commandes en cours",
      "Finances du mois",
    ],
    institution: [
      "Statistiques globales",
      "Acteurs validés",
      "Rapports mensuels",
      "Données analytiques",
    ],
    identificateur: [
      "Identifications du jour",
      "Nouveaux marchands",
      "Mes statistiques",
      "Générer un rapport",
    ],
  };

  const phrasesSuggestions = suggestions || defaultSuggestions[role];

  const handleExampleClick = (phrase: string) => {
    setMessageUtilisateur(phrase);
  };

  const handleMicClick = () => {
    setTantieSagesseOuverte(true);
    setTantieMode('parler');
  };

  const toggleListening = () => {
    setEnEcoute(!enEcoute);
  };

  // Couleurs de gradient basées sur le rôle
  const gradientColors: Record<typeof role, { from: string; to: string }> = {
    marchand: { from: '#FFF7ED', to: '#FFF' },
    producteur: { from: '#F0FDF4', to: '#FFF' },
    cooperative: { from: '#EFF6FF', to: '#FFF' },
    institution: { from: '#FAF5FF', to: '#FFF' },
    identificateur: { from: '#FFF7ED', to: '#FFF' },
  };

  const gradient = gradientColors[role];

  return (
    <>
      <Navigation role={role} onMicClick={handleMicClick} />
      
      <div 
        className={`pb-32 lg:pb-8 pt-16 lg:pt-10 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen ${className}`}
        style={{
          background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})`
        }}
      >
        {children}
      </div>

      {/* Modal Tantie Sagesse */}
      <AnimatePresence>
        {tantieSagesseOuverte && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-end lg:items-center justify-center p-0 lg:p-6"
            onClick={() => setTantieSagesseOuverte(false)}
          >
            <motion.div
              initial={{ y: '100%', scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 0.9 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full lg:max-w-2xl rounded-t-3xl lg:rounded-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
              style={{
                background: `linear-gradient(135deg, ${activeColor}, ${activeColor}DD)`
              }}
            >
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                      <img src={tantieSagesseImg} alt="Tantie" className="w-12 h-12 object-contain" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Tantie Sagesse</h2>
                      <p className="text-sm text-white/80">Ton assistante vocale</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTantieSagesseOuverte(false)}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Photo Tantie avec ondes */}
              <div className="relative px-6 py-8 flex justify-center">
                <div className="relative">
                  {enEcoute && (
                    <>
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-full border-4 border-white/40"
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{ 
                            scale: [1, 1.5, 2],
                            opacity: [0.8, 0.4, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                          }}
                        />
                      ))}
                    </>
                  )}
                  <img
                    src={tantieSagesseImg}
                    alt="Tantie Sagesse"
                    className="w-32 h-32 object-contain relative z-10"
                  />
                </div>
              </div>

              {/* Boutons Écrire / Parler */}
              <div className="px-6 pb-4">
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setTantieMode('ecrire')}
                    className={`flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      tantieMode === 'ecrire'
                        ? 'bg-white shadow-xl'
                        : 'bg-white/20 border-2 border-white/40'
                    }`}
                    style={{
                      color: tantieMode === 'ecrire' ? activeColor : 'white'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit className="w-5 h-5" />
                    Écrire
                  </motion.button>
                  <motion.button
                    onClick={() => setTantieMode('parler')}
                    className={`flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      tantieMode === 'parler'
                        ? 'bg-white shadow-xl'
                        : 'bg-white/20 border-2 border-white/40'
                    }`}
                    style={{
                      color: tantieMode === 'parler' ? activeColor : 'white'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mic className="w-5 h-5" />
                    Parler
                  </motion.button>
                </div>
              </div>

              {/* Contenu selon mode */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {tantieMode === 'ecrire' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 justify-center mb-4">
                      <MessageCircle className="w-6 h-6 text-white" />
                      <span className="text-white font-semibold text-lg">Tu peux dire:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {phrasesSuggestions.map((phrase, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleExampleClick(phrase)}
                          className="p-4 rounded-2xl text-left hover:bg-white/35 transition-colors"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(15px)',
                            border: '1.5px solid rgba(255, 255, 255, 0.4)',
                            borderRadius: index % 2 === 0 ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                          }}
                          whileHover={{ scale: 1.05, y: -6 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <p className="text-white text-sm font-medium leading-snug">{phrase}</p>
                        </motion.button>
                      ))}
                    </div>
                    <div className="mt-6">
                      <input
                        type="text"
                        value={messageUtilisateur}
                        onChange={(e) => setMessageUtilisateur(e.target.value)}
                        placeholder="Écris ta question ici..."
                        className="w-full px-5 py-4 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white placeholder-white/60 focus:outline-none focus:border-white/60"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                      <motion.button
                        onClick={toggleListening}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                          enEcoute ? 'bg-red-500' : 'bg-white/30 backdrop-blur-sm'
                        } border-4 border-white/60`}>
                          <Mic2 className="w-12 h-12 text-white" strokeWidth={2} />
                        </div>
                      </motion.button>
                    </div>
                    <p className="text-white text-2xl font-semibold">
                      {enEcoute ? "Je t'écoute..." : "Appuie pour parler"}
                    </p>
                    <div className="mt-6 space-y-3 px-4">
                      <div className="flex items-center gap-3 justify-center mb-4">
                        <MessageCircle className="w-6 h-6 text-white" />
                        <span className="text-white font-semibold text-lg">Tu peux dire:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                        {phrasesSuggestions.map((phrase, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleExampleClick(phrase)}
                            className="p-4 rounded-2xl text-left hover:bg-white/35 transition-colors"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.25)',
                              backdropFilter: 'blur(15px)',
                              border: '1.5px solid rgba(255, 255, 255, 0.4)',
                              borderRadius: index % 2 === 0 ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                            }}
                            whileHover={{ scale: 1.05, y: -6 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <p className="text-white text-sm font-medium leading-snug">{phrase}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}