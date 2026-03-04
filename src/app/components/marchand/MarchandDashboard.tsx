import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Calendar,
  Volume2,
  Edit,
  XCircle,
  ChevronDown,
  Package,
  Info,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import tantieSagesseImg from 'figma:asset/64c3ca539d2561b4696443c44d5985c07aa02f42.png';
import { getPageClasses, RESPONSIVE_IMAGES, RESPONSIVE_GRIDS } from '../../config/responsive';

interface MarchandDashboardProps {
  user: any;
  currentSession: any;
  stats: {
    ventes: number;
    depenses: number;
    caisse: number;
  };
  isSpeaking: boolean;
  isJourneeExpanded: boolean;
  setIsJourneeExpanded: (value: boolean) => void;
  handleListenMessage: () => void;
  setShowOpenDayModal: (value: boolean) => void;
  setShowEditFondModal: (value: boolean) => void;
  setShowCloseDayModal: (value: boolean) => void;
  setShowStatsVentesModal: (value: boolean) => void;
  setShowStatsMargeModal: (value: boolean) => void;
  setShowScoreModal: (value: boolean) => void;
  setShowResumeModal: (value: boolean) => void;
  speak: (message: string) => void;
  navigate: (path: string) => void;
  showCoachMark: boolean;
  onDismissCoachMark: () => void;
  setShowVenteVocaleModal?: (value: boolean) => void;
}

export function MarchandDashboard({
  user,
  currentSession,
  stats,
  isSpeaking,
  isJourneeExpanded,
  setIsJourneeExpanded,
  handleListenMessage,
  setShowOpenDayModal,
  setShowEditFondModal,
  setShowCloseDayModal,
  setShowStatsVentesModal,
  setShowStatsMargeModal,
  setShowScoreModal,
  setShowResumeModal,
  speak,
  navigate,
  showCoachMark,
  onDismissCoachMark,
  setShowVenteVocaleModal,
}: MarchandDashboardProps) {
  const marge = stats.ventes - stats.depenses;

  // État pour le modal d'explication des boutons désactivés
  const [showDisabledModal, setShowDisabledModal] = React.useState(false);
  const [disabledMessage, setDisabledMessage] = React.useState('');

  // Fonction pour afficher le message explicatif
  const handleDisabledClick = (message: string) => {
    setDisabledMessage(message);
    setShowDisabledModal(true);
    speak(message);
  };

  // DEBUG : Vérifier l'état de la session
  console.log('🔍 DEBUG currentSession:', currentSession);
  console.log('🔍 opened?', currentSession?.opened);

  return (
    <div className="pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 md:px-6 lg:pl-[280px] xl:pl-[320px] max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-orange-50 to-white">
      
      {/* Card Tantie Sagesse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="mb-8"
      >
        <div className="flex items-stretch gap-2">
          {/* Image Tantie Sagesse à gauche */}
          <motion.div
            className="flex-shrink-0 flex items-center"
            animate={isSpeaking ? { y: [0, -8, 0] } : {}}
            transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0 }}
          >
            <motion.img
              src={tantieSagesseImg}
              alt="Tantie Sagesse"
              className="w-32 md:w-36 lg:w-40 xl:w-44 h-auto object-contain"
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
            />
          </motion.div>

          {/* Card contenu à droite - HAUTEUR FIXE */}
          <Card className="flex-1 px-8 py-6 rounded-3xl border-2 shadow-lg relative overflow-hidden" style={{ borderColor: '#C46210' }}>
            {/* Fond animé */}
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{ background: 'linear-gradient(135deg, #C46210 0%, #FFA500 100%)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative z-10 w-full h-full">
              <motion.h3 
                className="font-bold text-2xl text-gray-900 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                key={currentSession?.opened ? 'opened' : 'closed'}
              >
                Tantie Sagesse
              </motion.h3>
              <motion.p 
                className="text-gray-600 leading-relaxed pr-4"
                style={{
                  fontSize: (currentSession?.opened && currentSession.opened === true)
                    ? (stats.caisse.toLocaleString().length > 10 ? '0.875rem' : '1rem')
                    : (user?.firstName && user.firstName.length > 15 ? '0.875rem' : '1rem')
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                key={`message-${currentSession?.opened}-${stats.caisse}-${stats.ventes}-${stats.depenses}`}
              >
                {(currentSession?.opened && currentSession.opened === true) ? (
                  <>
                    {stats.ventes > 0 && stats.depenses === 0 && (
                      `Bravo ! Tu as ${stats.ventes.toLocaleString()} FCFA de ventes. Ta caisse est à ${stats.caisse.toLocaleString()} FCFA`
                    )}
                    {stats.ventes > 0 && stats.depenses > 0 && (
                      `Ta caisse actuelle est de ${stats.caisse.toLocaleString()} FCFA. Continue comme ça !`
                    )}
                    {stats.ventes === 0 && stats.depenses > 0 && (
                      `Attention, tu as ${stats.depenses.toLocaleString()} FCFA de dépenses. Ta caisse est à ${stats.caisse.toLocaleString()} FCFA`
                    )}
                    {stats.ventes === 0 && stats.depenses === 0 && (
                      `Ta caisse est prête avec ${stats.caisse.toLocaleString()} FCFA. Commence à vendre !`
                    )}
                  </>
                ) : (
                  `Bonjour ${user?.firstName} ! Ouvre ta journée pour commencer`
                )}
              </motion.p>
            </div>
            
            <motion.button
              onClick={handleListenMessage}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-base font-semibold text-white shadow-md absolute bottom-5 left-8 z-20"
              style={{ backgroundColor: '#C46210' }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(196, 98, 16, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Volume2 className="w-5 h-5" />
              couter
            </motion.button>
          </Card>
        </div>
      </motion.div>

      {/* 1. Card Ouvre ta journée / Journée ouverte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <Card className="mb-4 rounded-3xl shadow-md bg-gradient-to-br from-white to-orange-50 overflow-hidden">
          {currentSession ? (
            <>
              {/* Version compacte cliquable */}
              <motion.button
                onClick={() => {
                  setIsJourneeExpanded(!isJourneeExpanded);
                  speak(isJourneeExpanded ? 'Journée réduite' : 'Détails de la journée');
                }}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-orange-50"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(196, 98, 16, 0.13)' }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Calendar className="w-5 h-5" style={{ color: '#C46210' }} />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Journée ouverte</h3>
                    <p className="text-lg font-bold" style={{ color: '#C46210' }}>
                      {currentSession.fondInitial.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isJourneeExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5" style={{ color: '#C46210' }} />
                </motion.div>
              </motion.button>

              {/* Contenu extensible */}
              <AnimatePresence>
                {isJourneeExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <p className="text-xs text-gray-500">
                        {new Date().toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEditFondModal(true);
                          }}
                          variant="outline"
                          className="flex-1 rounded-xl"
                          style={{ borderColor: '#C46210', color: '#C46210' }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier le fond
                        </Button>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCloseDayModal(true);
                          }}
                          className="flex-1 rounded-xl text-white"
                          style={{ backgroundColor: '#DC2626' }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Fermer la caisse
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(196, 98, 16, 0.13)' }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Calendar className="w-6 h-6" style={{ color: '#C46210' }} />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-gray-900">Ouvre ta journée</h3>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative z-10"
              >
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('BOUTON CLIQUÉ - Ouvrir journée');
                    speak('Combien tu as en caisse ce matin ?');
                    setShowOpenDayModal(true);
                  }}
                  className="w-full h-14 rounded-2xl text-lg font-bold text-white shadow-lg pointer-events-auto cursor-pointer relative overflow-hidden"
                  style={{ backgroundColor: '#C46210' }}
                  animate={{
                    boxShadow: [
                      '0 10px 40px rgba(196, 98, 16, 0.3)',
                      '0 10px 60px rgba(196, 98, 16, 0.5)',
                      '0 10px 40px rgba(196, 98, 16, 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Animation de pulse continue */}
                  <motion.div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    animate={{
                      scale: [1, 1.5],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                  <span className="relative z-10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Ouvrir ma journée
                  </span>
                </motion.button>
              </motion.div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* 1.5 Bouton POS - Terminal de Caisse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <motion.button
          onClick={() => {
            if (!currentSession?.opened) {
              handleDisabledClick('Ouvre d\'abord ta journée avant d\'utiliser le terminal POS');
              return;
            }
            speak('Bienvenue sur le terminal de vente. Ajoute tes produits au panier');
            navigate('/marchand/caisse');
          }}
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="w-full text-left"
        >
          <Card 
            className={`p-4 rounded-3xl border-2 ${
              currentSession?.opened 
                ? 'bg-gradient-to-br from-orange-50 via-white to-orange-50' 
                : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
            }`}
            style={{ borderColor: currentSession?.opened ? '#C46210' : '#9CA3AF' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={currentSession?.opened ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}
                  style={{ backgroundColor: currentSession?.opened ? '#FFF7ED' : '#E5E7EB' }}
                >
                  <svg 
                    className={`w-6 h-6 ${currentSession?.opened ? '' : 'text-gray-400'}`}
                    style={{ color: currentSession?.opened ? '#C46210' : undefined }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                    <path d="M9 9h.01M15 9h.01M9 15h6" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </motion.div>
                <div>
                  <p className={`font-bold text-base md:text-lg mb-0.5 ${
                    currentSession?.opened ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    Terminal POS
                  </p>
                  <p className={`text-xs ${
                    currentSession?.opened ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    Caisse digitale avec panier
                  </p>
                </div>
              </div>
              <motion.div
                animate={currentSession?.opened ? { x: [0, 5, 0] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg 
                  className={`w-6 h-6 ${currentSession?.opened ? '' : 'text-gray-400'}`}
                  style={{ color: currentSession?.opened ? '#C46210' : undefined }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            </div>
          </Card>
        </motion.button>
      </motion.div>

      {/* 2. VENDRE et DÉPENSES (2 colonnes) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Bouton VENDRE */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => {
                if (!currentSession?.opened) {
                  handleDisabledClick('Ouvre d\'abord ta journée avant de vendre');
                  return;
                }
                speak('Je t\'écoute pour enregistrer une vente');
                if (setShowVenteVocaleModal) {
                  setShowVenteVocaleModal(true);
                }
              }}
              className="w-full text-left"
            >
              <Card 
                className={`p-3 rounded-3xl border-2 ${
                  currentSession?.opened 
                    ? 'bg-gradient-to-br from-green-50 via-white to-green-50' 
                    : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
                }`}
                style={{ borderColor: currentSession?.opened ? '#16A34A' : '#9CA3AF' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className={`font-medium mb-0.5 font-bold text-sm md:text-base ${
                      currentSession?.opened ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Je vends
                    </p>
                    <p className={`text-xs ${
                      currentSession?.opened ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Encaisser une vente
                    </p>
                  </div>
                  <motion.div
                    animate={currentSession?.opened ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      currentSession?.opened ? 'bg-green-100' : 'bg-gray-200'
                    }`}
                  >
                    <TrendingUp className={`w-5 h-5 ${
                      currentSession?.opened ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </motion.div>
                </div>
              </Card>
            </button>
          </motion.div>

          {/* Bouton DÉPENSES */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => {
                if (!currentSession?.opened) {
                  handleDisabledClick('Ouvre d\'abord ta journée avant de noter tes dépenses');
                  return;
                }
                speak('Note tes dépenses du jour, ça t\'aidera à mieux gérer ta caisse');
                navigate('/marchand/depenses');
              }}
              className="w-full text-left"
            >
              <Card 
                className={`p-3 rounded-3xl border-2 ${
                  currentSession?.opened 
                    ? 'bg-gradient-to-br from-red-50 via-white to-red-50' 
                    : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
                }`}
                style={{ borderColor: currentSession?.opened ? '#DC2626' : '#9CA3AF' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className={`font-medium mb-0.5 font-bold text-sm md:text-base ${
                      currentSession?.opened ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Je dépense
                    </p>
                    <p className={`text-xs ${
                      currentSession?.opened ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Saisir tes dépenses
                    </p>
                  </div>
                  <motion.div
                    animate={currentSession?.opened ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      currentSession?.opened ? 'bg-red-100' : 'bg-gray-200'
                    }`}
                  >
                    <TrendingUp className={`w-5 h-5 rotate-180 ${
                      currentSession?.opened ? 'text-red-600' : 'text-gray-400'
                    }`} />
                  </motion.div>
                </div>
              </Card>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* 3. Card Scoring JULABA (pleine largeur) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <motion.button
          onClick={() => {
            speak('Ton score JULABA est de 85 sur 100. Ton djè est solide ! Continue à enregistrer tes ventes pour améliorer ton score');
            setShowScoreModal(true);
          }}
          whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 30px rgba(196, 98, 16, 0.15)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-full text-left"
        >
          <Card className="p-3 rounded-3xl border-2 bg-gradient-to-br from-orange-50 via-white to-orange-50" style={{ borderColor: '#C46210' }}>
            {/* Titre et Score sur la même ligne */}
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-600 font-bold text-lg md:text-xl">Ton Score JULABA</p>
              <div className="flex items-center gap-2">
                <motion.p 
                  className="font-bold text-2xl md:text-3xl"
                  style={{ color: '#C46210' }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    y: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  85/100
                </motion.p>
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FFF7ED' }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <TrendingUp className="w-4 h-4" style={{ color: '#C46210' }} />
                </motion.div>
              </div>
            </div>

            {/* Jauge de progression avec animation continue */}
            <div className="mb-2 relative">
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                {/* Barre de progression */}
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ backgroundColor: '#C46210', width: '85%' }}
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                {/* Effet shimmer animé en continu */}
                <motion.div
                  className="absolute top-0 left-0 h-full w-20 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                  }}
                  animate={{
                    x: ['-100%', '500%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                    repeatDelay: 0.5
                  }}
                />
              </div>
            </div>

            {/* Message d'encouragement - Plus compact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm font-semibold mb-0.5 leading-tight" style={{ color: '#C46210' }}>
                Ton djè est solide !
              </p>
              <p className="text-xs text-gray-600 leading-tight">
                Si tu notes tout, ça t'aide plus tard
              </p>
            </motion.div>
          </Card>
        </motion.button>
      </motion.div>

      {/* 4. Stats cards - Ventes et Marge (2 colonnes) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => {
              speak(`Tu as gagné ${stats.ventes.toLocaleString()} francs CFA aujourd'hui`);
              setShowStatsVentesModal(true);
            }}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(22, 163, 74, 0.2)', scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-full text-left"
          >
            <Card className="p-3 rounded-3xl border-2 bg-gradient-to-br from-green-50 via-white to-green-50" style={{ borderColor: '#16A34A' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-600 mb-0.5 font-bold text-sm md:text-base">Ventes du jour</p>
                  <motion.p 
                    className="text-3xl font-bold text-green-700"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {stats.ventes.toLocaleString()}
                  </motion.p>
                  <p className="text-xs text-gray-600">FCFA</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
                >
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </motion.div>
              </div>
            </Card>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => {
              speak(`Ta marge du jour est de ${marge.toLocaleString()} francs CFA. ${marge >= 0 ? 'Continue comme ça !' : 'Attention, tes dépenses dépassent tes ventes'}`);
              setShowStatsMargeModal(true);
            }}
            whileHover={{ y: -5, boxShadow: `0 10px 30px ${marge >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-full text-left"
          >
            <Card className={`p-3 rounded-3xl border-2 ${marge >= 0 ? 'bg-gradient-to-br from-green-50 via-white to-green-50' : 'bg-gradient-to-br from-red-50 via-white to-red-50'}`} style={{ borderColor: marge >= 0 ? '#16A34A' : '#DC2626' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-600 mb-0.5 font-bold text-sm md:text-base">Marge du jour</p>
                  <motion.p 
                    className={`text-3xl font-bold ${marge >= 0 ? 'text-green-700' : 'text-red-700'}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {marge >= 0 ? '+' : ''}{marge.toLocaleString()}
                  </motion.p>
                  <p className="text-xs text-gray-600">FCFA</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-10 h-10 rounded-full ${marge >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center flex-shrink-0`}
                >
                  <TrendingUp className={`w-5 h-5 ${marge >= 0 ? 'text-green-600' : 'text-red-600'} ${marge < 0 ? 'rotate-180' : ''}`} />
                </motion.div>
              </div>
            </Card>
          </motion.button>
        </motion.div>
      </div>

      {/* 5. POINT DE VENTE et PRODUITS (2 colonnes) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Bouton POINT DE VENTE */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => {
                if (!currentSession?.opened) {
                  handleDisabledClick('Ouvre d\'abord ta journée avant d\'utiliser le Point de Vente');
                  return;
                }
                speak('Bienvenue sur le terminal de vente. Ajoute tes produits au panier');
                navigate('/marchand/caisse');
              }}
              className="w-full text-left"
            >
              <Card 
                className={`p-3 rounded-3xl border-2 ${
                  currentSession?.opened 
                    ? 'bg-gradient-to-br from-orange-50 via-white to-orange-50' 
                    : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
                }`}
                style={{ borderColor: currentSession?.opened ? '#C46210' : '#9CA3AF' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className={`font-medium mb-0.5 font-bold text-sm md:text-base ${
                      currentSession?.opened ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Point de Vente
                    </p>
                    <p className={`text-xs ${
                      currentSession?.opened ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Terminal POS rapide
                    </p>
                  </div>
                  <motion.div
                    animate={currentSession?.opened ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}
                    style={{ backgroundColor: currentSession?.opened ? '#FFF7ED' : '#E5E7EB' }}
                  >
                    <svg 
                      className={`w-5 h-5 ${currentSession?.opened ? '' : 'text-gray-400'}`}
                      style={{ color: currentSession?.opened ? '#C46210' : undefined }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                      <path d="M9 9h.01M15 9h.01M9 15h6" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </motion.div>
                </div>
              </Card>
            </button>
          </motion.div>

          {/* Bouton PRODUITS */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => {
                speak('Accède à la gestion de tes produits et ton stock');
                navigate('/marchand/produits');
              }}
              className="w-full text-left"
            >
              <Card 
                className="p-3 rounded-3xl border-2 bg-gradient-to-br from-purple-50 via-white to-purple-50"
                style={{ borderColor: '#7C3AED' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-600 mb-0.5 font-bold text-sm md:text-base">
                      Produits
                    </p>
                    <p className="text-xs text-gray-600">
                      Gérer mon stock
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0"
                  >
                    <Package className="w-5 h-5 text-purple-600" />
                  </motion.div>
                </div>
              </Card>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* 6. Card Résumé du jour */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <motion.button
          onClick={() => {
            speak(`Résumé de ta journée : Tu as gagné ${stats.ventes.toLocaleString()} francs, dépensé ${stats.depenses.toLocaleString()} francs, et ta caisse théorique est de ${stats.caisse.toLocaleString()} francs`);
            setShowResumeModal(true);
          }}
          whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-full text-left"
        >
          <Card className="p-3 rounded-3xl shadow-md bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(196, 98, 16, 0.13)' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Calendar className="w-4 h-4" style={{ color: '#C46210' }} />
              </motion.div>
              <h3 className="font-bold text-base text-gray-900">Résumé du jour</h3>
            </div>

            <div className="space-y-2">
              {/* Ventes */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-green-50">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-xs font-medium text-gray-700">Ventes du jour</p>
                </div>
                <p className="text-sm font-bold text-green-700">
                  {stats.ventes.toLocaleString()} FCFA
                </p>
              </div>

              {/* Dépenses */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-red-50">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <p className="text-xs font-medium text-gray-700">Dépenses du jour</p>
                </div>
                <p className="text-sm font-bold text-red-700">
                  {stats.depenses.toLocaleString()} FCFA
                </p>
              </div>

              {/* Caisse théorique */}
              <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: '#FFF7ED' }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C46210' }} />
                  <p className="text-xs font-medium text-gray-700">Caisse théorique</p>
                </div>
                <p className="text-sm font-bold" style={{ color: '#C46210' }}>
                  {stats.caisse.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </Card>
        </motion.button>
      </motion.div>

      {/* Coach Mark - Premier lancement */}
      <AnimatePresence>
        {showCoachMark && !currentSession?.opened && (
          <>
            {/* Overlay sombre avec blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onDismissCoachMark}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            
            {/* Coach Mark Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-full max-w-md pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-4" style={{ borderColor: '#C46210' }}>
                  {/* Icône info avec animation */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#FFF7ED' }}
                    >
                      <Info className="w-10 h-10" style={{ color: '#C46210' }} />
                    </motion.div>
                  </div>

                  {/* Titre */}
                  <h3 className="text-2xl font-bold text-center mb-3 text-gray-900">
                    Premier pas
                  </h3>

                  {/* Message */}
                  <p className="text-center text-gray-600 text-base leading-relaxed mb-8">
                    Ouvre ta journée pour activer ta caisse
                  </p>

                  {/* Bouton J'ai compris */}
                  <motion.button
                    onClick={onDismissCoachMark}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-4 rounded-2xl text-lg font-bold text-white shadow-lg"
                    style={{ backgroundColor: '#C46210' }}
                  >
                    J'ai compris
                  </motion.button>
                </div>

                {/* Flèche animée pointant vers le bouton "Ouvrir ma journée" */}
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex justify-center mt-8"
                >
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <motion.path
                      d="M24 8 L24 40 M24 40 L14 30 M24 40 L34 30"
                      stroke="#C46210"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{ 
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </svg>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Modal d'explication des boutons désactivés */}
      <AnimatePresence>
        {showDisabledModal && (
          <>
            {/* Overlay sombre avec blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisabledModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-full max-w-md pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-4" style={{ borderColor: '#C46210' }}>
                  {/* Icône info avec animation */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#FFF7ED' }}
                    >
                      <Info className="w-10 h-10" style={{ color: '#C46210' }} />
                    </motion.div>
                  </div>

                  {/* Titre */}
                  <h3 className="text-2xl font-bold text-center mb-3 text-gray-900">
                    Explication
                  </h3>

                  {/* Message */}
                  <p className="text-center text-gray-600 text-base leading-relaxed mb-8">
                    {disabledMessage}
                  </p>

                  {/* Bouton J'ai compris */}
                  <motion.button
                    onClick={() => setShowDisabledModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-4 rounded-2xl text-lg font-bold text-white shadow-lg"
                    style={{ backgroundColor: '#C46210' }}
                  >
                    J'ai compris
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}