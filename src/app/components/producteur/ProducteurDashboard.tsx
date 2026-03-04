import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Calendar,
  Volume2,
  Edit,
  XCircle,
  ChevronDown,
  Package,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import tantieSagesseImg from 'figma:asset/ea74d578f6b563853423b6d08f6cc6dcb454702f.png';

interface ProducteurDashboardProps {
  user: any;
  currentSession: any;
  stats: {
    recoltes: number;
    ventes: number;
    stocks: number;
  };
  isSpeaking: boolean;
  isJourneeExpanded: boolean;
  setIsJourneeExpanded: (value: boolean) => void;
  handleListenMessage: () => void;
  setShowRecoltesModal: (value: boolean) => void;
  setShowVentesModal: (value: boolean) => void;
  setShowStocksModal: (value: boolean) => void;
  speak: (message: string) => void;
  navigate: (path: string) => void;
}

export function ProducteurDashboard({
  user,
  currentSession,
  stats,
  isSpeaking,
  isJourneeExpanded,
  setIsJourneeExpanded,
  handleListenMessage,
  setShowRecoltesModal,
  setShowVentesModal,
  setShowStocksModal,
  speak,
  navigate,
}: ProducteurDashboardProps) {
  const revenu = stats.ventes;

  return (
    <div className="pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-green-50 to-white">
      
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
          <Card className="flex-1 px-8 py-6 rounded-3xl border-2 shadow-lg relative overflow-hidden" style={{ borderColor: '#00563B' }}>
            {/* Fond animé */}
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{ background: 'linear-gradient(135deg, #00563B 0%, #16A34A 100%)' }}
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
                Bonjour {user?.firstName} ! Aujourd'hui, enregistre tes récoltes et ventes
              </motion.p>
            </div>
            
            <motion.button
              onClick={handleListenMessage}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-base font-semibold text-white shadow-md absolute bottom-5 left-8 z-20"
              style={{ backgroundColor: '#00563B' }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(0, 86, 59, 0.3)' }}
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

      {/* Card Activité du jour */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <Card className="mb-4 rounded-3xl shadow-md bg-gradient-to-br from-white to-green-50 overflow-hidden">
          <motion.button
            onClick={() => {
              setIsJourneeExpanded(!isJourneeExpanded);
              speak(isJourneeExpanded ? 'Activité réduite' : 'Détails de l\'activité');
            }}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-green-50"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0, 86, 59, 0.13)' }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Calendar className="w-5 h-5" style={{ color: '#00563B' }} />
              </motion.div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Activité du jour</h3>
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
              animate={{ rotate: isJourneeExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5" style={{ color: '#00563B' }} />
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
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600">
                    📊 Suivi de tes récoltes, ventes et stocks aujourd'hui
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Gros boutons RÉCOLTES / VENTES / STOCKS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Bouton RÉCOLTES */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => {
                speak('Enregistre une nouvelle récolte');
                navigate('/producteur/recoltes');
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
              <span className="relative z-10 text-xl leading-tight">RÉCOLTES</span>
              <span className="relative z-10 text-[11px] font-normal opacity-80">Enregistrer</span>
            </Button>
          </motion.div>

          {/* Bouton VENTES */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => {
                speak('Consulte ou enregistre tes ventes');
                navigate('/producteur/ventes');
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
              <span className="relative z-10 text-xl leading-tight">VENTES</span>
              <span className="relative z-10 text-[11px] font-normal opacity-80">Gérer mes ventes</span>
            </Button>
          </motion.div>
        </div>

        {/* Bouton STOCKS - Full Width */}
        <motion.div
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => {
              speak('Consulte l\'état de tes stocks');
              navigate('/producteur/stocks');
            }}
            className="w-full h-16 rounded-2xl text-xl font-bold text-white shadow-xl relative overflow-hidden flex items-center justify-center gap-3"
            style={{ backgroundColor: '#00563B' }}
          >
            <motion.div
              className="absolute inset-0 bg-white opacity-20"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Package className="w-7 h-7 relative z-10" />
            <div className="relative z-10 flex flex-col items-start">
              <span className="text-xl leading-tight">MES STOCKS</span>
              <span className="text-[11px] font-normal opacity-80">Inventaire produits</span>
            </div>
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => {
              speak(`Récoltes du jour : ${stats.recoltes.toLocaleString()} kilogrammes`);
              setShowRecoltesModal(true);
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
                    Récoltes
                  </p>
                  <p className="text-xs text-gray-600">Aujourd'hui</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100"
                >
                  <Package className="w-5 h-5 text-green-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {stats.recoltes.toLocaleString()} <span className="text-sm">kg</span>
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
              speak(`Ventes : ${stats.ventes.toLocaleString()} francs CFA`);
              setShowVentesModal(true);
            }}
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)', scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-full text-left"
          >
            <Card className="p-3 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 border-blue-200 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium mb-0.5 font-bold text-sm md:text-base text-gray-600">
                    Ventes
                  </p>
                  <p className="text-xs text-gray-600">Revenus</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100"
                >
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {stats.ventes.toLocaleString()} <span className="text-sm">F</span>
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
        <Card className="p-5 rounded-3xl border-2 bg-gradient-to-br from-green-50 via-white to-green-50" style={{ borderColor: '#00563B' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ton Score Producteur JULABA</p>
              <motion.p 
                className="text-4xl font-bold"
                style={{ color: '#00563B' }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                88/100
              </motion.p>
            </div>
            <motion.div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#F0FDF4' }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Package className="w-7 h-7" style={{ color: '#00563B' }} />
            </motion.div>
          </div>

          {/* Jauge de progression */}
          <div className="mb-4">
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ backgroundColor: '#00563B' }}
                initial={{ width: 0 }}
                animate={{ width: '88%' }}
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
            <p className="text-base font-semibold" style={{ color: '#00563B' }}>
              ✨ Excellent travail champion !
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-gray-600"
          >
            Continue à enregistrer tes récoltes pour améliorer ton score
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
              style={{ backgroundColor: 'rgba(0, 86, 59, 0.13)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Calendar className="w-5 h-5" style={{ color: '#00563B' }} />
            </motion.div>
            <h3 className="font-bold text-lg text-gray-900">Résumé du mois</h3>
          </div>

          <div className="space-y-3">
            {/* Récoltes */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm font-medium text-gray-700">Récoltes totales</p>
              </div>
              <p className="text-base font-bold text-green-700">
                {stats.recoltes.toLocaleString()} kg
              </p>
            </div>

            {/* Ventes */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-sm font-medium text-gray-700">Chiffre d'affaires</p>
              </div>
              <p className="text-base font-bold text-blue-700">
                {stats.ventes.toLocaleString()} FCFA
              </p>
            </div>

            {/* Stocks */}
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#F0FDF4' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00563B' }} />
                <p className="text-sm font-medium text-gray-700">Stock disponible</p>
              </div>
              <p className="text-base font-bold" style={{ color: '#00563B' }}>
                {stats.stocks.toLocaleString()} kg
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}