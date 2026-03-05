import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Montant, MontantCard } from '../shared/Montant';
import { Volume2, Users, Package, TrendingUp, ArrowRight, Calendar, Edit, XCircle, ChevronDown } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
const tantieSagesseImg = '/images/tantie-sagesse-cooperative.svg';
import { RESPONSIVE_IMAGES, RESPONSIVE_GRIDS } from '../../config/responsive';

interface CooperativeDashboardProps {
  user: any;
  currentSession: any;
  stats: {
    achatsCollectifs: number;
    ventesGroupees: number;
    fondsCommun: number;
  };
  isSpeaking: boolean;
  isJourneeExpanded: boolean;
  setIsJourneeExpanded: (value: boolean) => void;
  handleListenMessage: () => void;
  setShowOpenDayModal: (value: boolean) => void;
  setShowEditFondModal: (value: boolean) => void;
  setShowCloseDayModal: (value: boolean) => void;
  setShowStatsAchatsModal: (value: boolean) => void;
  setShowStatsVentesModal: (value: boolean) => void;
  speak: (message: string) => void;
  navigate: (path: string) => void;
}

export function CooperativeDashboard({
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
  setShowStatsAchatsModal,
  setShowStatsVentesModal,
  speak,
  navigate,
}: CooperativeDashboardProps) {
  const benefice = stats.ventesGroupees - stats.achatsCollectifs;

  return (
    <div className="pb-32 lg:pb-8 pt-16 lg:pt-10 px-4 md:px-6 lg:pl-[280px] xl:pl-[320px] max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-blue-50 to-white">
      
      {/* Card Tantie Sagesse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="mb-4"
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
              className="w-36 h-auto object-contain"
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
            />
          </motion.div>

          {/* Card contenu à droite */}
          <Card className="flex-1 px-5 py-5 rounded-3xl border-2 shadow-lg relative overflow-hidden" style={{ borderColor: '#2072AF' }}>
            {/* Fond animé */}
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{ background: 'linear-gradient(135deg, #2072AF 0%, #3B82F6 100%)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex-1 flex flex-col justify-center">
                <motion.h3 
                  className="font-black text-gray-900 mb-1 leading-tight"
                  style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Tantie Sagesse
                </motion.h3>
                <motion.p 
                  className="text-gray-600 leading-snug"
                  style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentSession?.opened
                    ? `Fonds commun ouvert avec ${currentSession.fondInitial.toLocaleString()} FCFA`
                    : `Bonjour ${user?.firstName} ! Ouvre le fonds commun pour commencer`
                  }
                </motion.p>
              </div>
              <div className="flex justify-end mt-2">
                <motion.button
                  onClick={handleListenMessage}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0"
                  style={{ backgroundColor: '#2072AF' }}
                  whileHover={{ scale: 1.1, boxShadow: '0 8px 20px rgba(32, 114, 175, 0.35)' }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Volume2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Card Ouvre le fonds / Fonds ouvert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <Card className="mb-4 rounded-3xl shadow-md bg-gradient-to-br from-white to-blue-50 overflow-hidden">
          {currentSession ? (
            <>
              {/* Version compacte cliquable */}
              <motion.button
                onClick={() => {
                  setIsJourneeExpanded(!isJourneeExpanded);
                  speak(isJourneeExpanded ? 'Fonds réduit' : 'Détails du fonds');
                }}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-blue-50"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(32, 114, 175, 0.13)' }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Calendar className="w-5 h-5" style={{ color: '#2072AF' }} />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Fonds commun ouvert</h3>
                    <p className="font-bold" style={{ color: '#2072AF' }}>
                      <Montant value={currentSession.fondInitial} size="lg" color="#2072AF" />
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isJourneeExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5" style={{ color: '#2072AF' }} />
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
                          style={{ borderColor: '#2072AF', color: '#2072AF' }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier le fonds
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
                          Clôturer
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
                    style={{ backgroundColor: 'rgba(32, 114, 175, 0.13)' }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Calendar className="w-6 h-6" style={{ color: '#2072AF' }} />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-gray-900">Ouvre le fonds commun</h3>
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
              >
                <Button
                  onClick={() => {
                    speak('Combien vous avez dans le fonds commun ce matin ?');
                    setShowOpenDayModal(true);
                  }}
                  className="w-full h-14 rounded-2xl text-lg font-bold text-white shadow-lg"
                  style={{ backgroundColor: '#2072AF' }}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Ouvrir le fonds
                </Button>
              </motion.div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Gros boutons ACHATS COLLECTIFS / VENTES GROUPÉES / MEMBRES */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Bouton ACHATS COLLECTIFS */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => {
                if (!currentSession?.opened) {
                  speak('Ouvre d\'abord le fonds commun');
                  return;
                }
                speak('Enregistre un achat collectif pour la coopérative');
                navigate('/cooperative/achats');
              }}
              disabled={!currentSession?.opened}
              className="w-full h-16 rounded-2xl text-xl font-bold text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center"
              style={{ 
                backgroundColor: currentSession?.opened ? '#DC2626' : '#9CA3AF',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-20"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative z-10 text-xl leading-tight">ACHATS</span>
              <span className="relative z-10 text-[11px] font-normal opacity-80">Collectifs</span>
            </Button>
          </motion.div>

          {/* Bouton VENTES GROUPÉES */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => {
                if (!currentSession?.opened) {
                  speak('Ouvre d\'abord le fonds commun');
                  return;
                }
                speak('Enregistre une vente groupée');
                navigate('/cooperative/ventes');
              }}
              disabled={!currentSession?.opened}
              className="w-full h-16 rounded-2xl text-xl font-bold text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center"
              style={{ 
                backgroundColor: currentSession?.opened ? '#16A34A' : '#9CA3AF',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-20"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative z-10 text-xl leading-tight">VENTES</span>
              <span className="relative z-10 text-[11px] font-normal opacity-80">Groupées</span>
            </Button>
          </motion.div>
        </div>

        {/* Bouton MEMBRES - Full Width */}
        <motion.div
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => {
              speak('Gestion des membres de la coopérative');
              navigate('/cooperative/membres');
            }}
            className="w-full h-16 rounded-2xl text-xl font-bold text-white shadow-xl relative overflow-hidden flex items-center justify-center gap-3"
            style={{ backgroundColor: '#2072AF' }}
          >
            <motion.div
              className="absolute inset-0 bg-white opacity-20"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Users className="w-7 h-7 relative z-10" />
            <div className="relative z-10 flex flex-col items-start">
              <span className="text-xl leading-tight">MEMBRES</span>
              <span className="text-[11px] font-normal opacity-80">Gestion coopérative</span>
            </div>
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats cards - Cliquables */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => {
              speak(`Ventes groupées : ${stats.ventesGroupees.toLocaleString()} francs CFA`);
              setShowStatsVentesModal(true);
            }}
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(22, 163, 74, 0.15)', scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-full text-left"
          >
            <Card className="p-3 rounded-3xl bg-gradient-to-br from-green-50 via-white to-green-50 border-2 border-green-200 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium mb-0.5 font-bold text-sm md:text-base text-gray-600">
                    Ventes groupées
                  </p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100"
                >
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {stats.ventesGroupees.toLocaleString()} <span className="text-sm">F</span>
              </p>
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
              speak(`Bénéfice collectif : ${benefice.toLocaleString()} francs CFA`);
              setShowStatsAchatsModal(true);
            }}
            whileHover={{ y: -4, boxShadow: `0 10px 30px ${benefice >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(220, 38, 38, 0.15)'}`, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-full text-left"
          >
            <Card className={`p-3 rounded-3xl border-2 shadow-md ${benefice >= 0 ? 'bg-gradient-to-br from-green-50 via-white to-green-50 border-green-200' : 'bg-gradient-to-br from-red-50 via-white to-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium mb-0.5 font-bold text-sm md:text-base text-gray-600">
                    Bénéfice
                  </p>
                  <p className="text-xs text-gray-600">Collectif</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${benefice >= 0 ? 'bg-green-100' : 'bg-red-100'}`}
                >
                  <TrendingUp className={`w-5 h-5 ${benefice >= 0 ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
                </motion.div>
              </div>
              <p className={`text-3xl font-bold ${benefice >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {benefice >= 0 ? '+' : ''}{benefice.toLocaleString()} <span className="text-sm">F</span>
              </p>
            </Card>
          </motion.button>
        </motion.div>
      </div>

      {/* Card Scoring JULABA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <Card className="p-5 rounded-3xl border-2 bg-gradient-to-br from-blue-50 via-white to-blue-50" style={{ borderColor: '#2072AF' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Score Coopérative JULABA</p>
              <motion.p 
                className="text-4xl font-bold"
                style={{ color: '#2072AF' }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                92/100
              </motion.p>
            </div>
            <motion.div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#EFF6FF' }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Users className="w-7 h-7" style={{ color: '#2072AF' }} />
            </motion.div>
          </div>

          {/* Jauge de progression */}
          <div className="mb-4">
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ backgroundColor: '#2072AF' }}
                initial={{ width: 0 }}
                animate={{ width: '92%' }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>

          {/* Message d'encouragement */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-3"
          >
            <p className="text-base font-semibold" style={{ color: '#2072AF' }}>
              ✨ Excellente coopération !
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-gray-600"
          >
            Continuez les achats groupés pour renforcer votre solidarité
          </motion.p>
        </Card>
      </motion.div>

      {/* Card Résumé */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <Card className="p-5 rounded-3xl shadow-md bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(32, 114, 175, 0.13)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Calendar className="w-5 h-5" style={{ color: '#2072AF' }} />
            </motion.div>
            <h3 className="font-bold text-lg text-gray-900">Résumé de la période</h3>
          </div>

          <div className="space-y-3">
            {/* Ventes groupées */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm font-medium text-gray-700">Ventes groupées</p>
              </div>
              <Montant value={stats.ventesGroupees} size="md" color="#15803d" />
            </div>

            {/* Achats collectifs */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-sm font-medium text-gray-700">Achats collectifs</p>
              </div>
              <Montant value={stats.achatsCollectifs} size="md" color="#b91c1c" />
            </div>

            {/* Fonds commun */}
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#EFF6FF' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2072AF' }} />
                <p className="text-sm font-medium text-gray-700">Fonds commun</p>
              </div>
              <Montant value={stats.fondsCommun} size="md" color="#2072AF" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}