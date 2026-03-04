import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Users, BarChart3, TrendingUp, ArrowRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import tantieSagesseImg from 'figma:asset/c57c6b035a1cf2a547f2ddf8ab7ca6884bc3980e.png';
import { RESPONSIVE_IMAGES, RESPONSIVE_GRIDS } from '../../config/responsive';

interface AdministrateurDashboardProps {
  user: any;
  stats: {
    utilisateurs: number;
    transactions: number;
    volume: number;
  };
  isSpeaking: boolean;
  isStatsExpanded: boolean;
  setIsStatsExpanded: (value: boolean) => void;
  handleListenMessage: () => void;
  setShowUtilisateursModal: (value: boolean) => void;
  setShowTransactionsModal: (value: boolean) => void;
  setShowRapportModal: (value: boolean) => void;
  speak: (message: string) => void;
  navigate: (path: string) => void;
}

export function AdministrateurDashboard({
  user,
  stats,
  isSpeaking,
  isStatsExpanded,
  setIsStatsExpanded,
  handleListenMessage,
  setShowUtilisateursModal,
  setShowTransactionsModal,
  setShowRapportModal,
  speak,
  navigate,
}: AdministrateurDashboardProps) {
  return (
    <div className="pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 md:px-6 lg:pl-[280px] xl:pl-[320px] max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-purple-50 to-white">
      
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
          <Card className="flex-1 px-8 py-6 rounded-3xl border-2 shadow-lg relative overflow-hidden" style={{ borderColor: '#702963' }}>
            {/* Fond animé */}
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{ background: 'linear-gradient(135deg, #702963 0%, #A855F7 100%)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative z-10 w-full h-full">
              <motion.h3 
                className="font-bold text-2xl text-gray-900 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Tantie Sagesse
              </motion.h3>
              <motion.p 
                className="text-gray-600 leading-relaxed pr-4"
                style={{
                  fontSize: user?.firstName && user.firstName.length > 15 ? '0.875rem' : '1rem'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Bonjour {user?.firstName} ! Supervise la plateforme JULABA
              </motion.p>
            </div>
            
            <motion.button
              onClick={handleListenMessage}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-base font-semibold text-white shadow-md absolute bottom-5 left-8 z-20"
              style={{ backgroundColor: '#702963' }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(112, 41, 99, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Volume2 className="w-5 h-5" />
              Écouter
            </motion.button>
          </Card>
        </div>
      </motion.div>

      {/* Card Statistiques globales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <Card className="mb-4 rounded-3xl shadow-md bg-gradient-to-br from-white to-purple-50 overflow-hidden">
          <motion.button
            onClick={() => {
              setIsStatsExpanded(!isStatsExpanded);
              speak(isStatsExpanded ? 'Statistiques réduites' : 'Détails des statistiques');
            }}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-purple-50"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(112, 41, 99, 0.13)' }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <BarChart3 className="w-5 h-5" style={{ color: '#702963' }} />
              </motion.div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Vue d'ensemble</h3>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isStatsExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5" style={{ color: '#702963' }} />
            </motion.div>
          </motion.button>

          {/* Contenu extensible */}
          <AnimatePresence>
            {isStatsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-xl bg-purple-50">
                      <p className="text-xs text-gray-600">Utilisateurs actifs</p>
                      <p className="text-lg font-bold" style={{ color: '#702963' }}>
                        {stats.utilisateurs.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-purple-50">
                      <p className="text-xs text-gray-600">Transactions</p>
                      <p className="text-lg font-bold" style={{ color: '#702963' }}>
                        {stats.transactions.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-purple-50">
                      <p className="text-xs text-gray-600">Volume</p>
                      <p className="text-lg font-bold" style={{ color: '#702963' }}>
                        {(stats.volume / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Gros boutons UTILISATEURS / TRANSACTIONS / RAPPORTS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Bouton UTILISATEURS */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => {
                speak('Gestion des utilisateurs de la plateforme');
                navigate('/admin/utilisateurs');
              }}
              className="w-full h-16 rounded-2xl text-xl font-bold text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center"
              style={{ backgroundColor: '#2563EB' }}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-20"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Users className="w-6 h-6 relative z-10 mb-1" />
              <span className="relative z-10 text-sm leading-tight">UTILISATEURS</span>
            </Button>
          </motion.div>

          {/* Bouton TRANSACTIONS */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => {
                speak('Suivi des transactions');
                navigate('/admin/transactions');
              }}
              className="w-full h-16 rounded-2xl text-xl font-bold text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center"
              style={{ backgroundColor: '#16A34A' }}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-20"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <TrendingUp className="w-6 h-6 relative z-10 mb-1" />
              <span className="relative z-10 text-sm leading-tight">TRANSACTIONS</span>
            </Button>
          </motion.div>
        </div>

        {/* Bouton RAPPORTS - Full Width */}
        <motion.div
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => {
              speak('Génération de rapports d\'activité');
              navigate('/admin/rapports');
            }}
            className="w-full h-16 rounded-2xl text-xl font-bold text-white shadow-xl relative overflow-hidden flex items-center justify-center gap-3"
            style={{ backgroundColor: '#702963' }}
          >
            <motion.div
              className="absolute inset-0 bg-white opacity-20"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <BarChart3 className="w-7 h-7 relative z-10" />
            <div className="relative z-10 flex flex-col items-start">
              <span className="text-xl leading-tight">RAPPORTS</span>
              <span className="text-[11px] font-normal opacity-80">Analyse & Export</span>
            </div>
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => {
              speak(`${stats.utilisateurs.toLocaleString()} utilisateurs actifs`);
              setShowUtilisateursModal(true);
            }}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(37, 99, 235, 0.2)', scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-full text-left"
          >
            <Card className="p-1.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center gap-1.5 mb-1">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"
                >
                  <Users className="w-2.5 h-2.5 text-white" />
                </motion.div>
                <p className="text-blue-700 font-medium leading-none font-bold text-[12px]">Utilisateurs</p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="font-bold text-blue-800 leading-none text-[22px]">
                  {stats.utilisateurs.toLocaleString()}
                </p>
              </div>
            </Card>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <motion.button
            onClick={() => {
              speak(`${stats.transactions.toLocaleString()} transactions aujourd'hui`);
              setShowTransactionsModal(true);
            }}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(22, 163, 74, 0.2)', scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-full text-left"
          >
            <Card className="p-1.5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center gap-1.5 mb-1">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                >
                  <TrendingUp className="w-2.5 h-2.5 text-white" />
                </motion.div>
                <p className="text-green-700 font-medium leading-none font-bold text-[12px]">Transactions</p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="font-bold text-green-800 leading-none text-[22px]">
                  {stats.transactions.toLocaleString()}
                </p>
              </div>
            </Card>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={() => {
              speak(`Volume total : ${(stats.volume / 1000000).toFixed(1)} millions de francs CFA`);
              setShowRapportModal(true);
            }}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(112, 41, 99, 0.2)', scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-full text-left"
          >
            <Card className="p-1.5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center gap-1.5 mb-1">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0"
                >
                  <ShieldCheck className="w-2.5 h-2.5 text-white" />
                </motion.div>
                <p className="text-purple-700 font-medium leading-none font-bold text-[12px]">Volume</p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="font-bold text-purple-800 leading-none text-[22px]">
                  {(stats.volume / 1000000).toFixed(1)}M
                </p>
                <p className="text-[9px] text-purple-600 leading-none">FCFA</p>
              </div>
            </Card>
          </motion.button>
        </motion.div>
      </div>

      {/* Card Supervision JULABA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <Card className="p-5 rounded-3xl border-2 bg-gradient-to-br from-purple-50 via-white to-purple-50" style={{ borderColor: '#702963' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">État de la Plateforme</p>
              <motion.div
                className="flex items-center gap-2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <p className="text-2xl font-bold text-green-600">Opérationnelle</p>
              </motion.div>
            </div>
            <motion.div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#FAF5FF' }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <ShieldCheck className="w-7 h-7" style={{ color: '#702963' }} />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-600"
          >
            🎯 Tous les services JULABA fonctionnent normalement. {stats.utilisateurs.toLocaleString()} utilisateurs connectés.
          </motion.p>
        </Card>
      </motion.div>

      {/* Card Activité récente */}
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
              style={{ backgroundColor: 'rgba(112, 41, 99, 0.13)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BarChart3 className="w-5 h-5" style={{ color: '#702963' }} />
            </motion.div>
            <h3 className="font-bold text-lg text-gray-900">Résumé d'activité</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-sm font-medium text-gray-700">Utilisateurs actifs</p>
              </div>
              <p className="text-base font-bold text-blue-700">
                {stats.utilisateurs.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm font-medium text-gray-700">Transactions du jour</p>
              </div>
              <p className="text-base font-bold text-green-700">
                {stats.transactions.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#FAF5FF' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#702963' }} />
                <p className="text-sm font-medium text-gray-700">Volume total</p>
              </div>
              <p className="text-base font-bold" style={{ color: '#702963' }}>
                {stats.volume.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}