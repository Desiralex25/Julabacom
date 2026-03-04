import React, { useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Package,
  Truck,
  User,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Navigation } from '../layout/Navigation';
import { useProducteur } from '../../contexts/ProducteurContext';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { NotificationButton } from '../marchand/NotificationButton';

const PRIMARY_COLOR = '#2E8B57';

// IDENTIQUE à MesCommandes
const STATUT_COLORS = {
  'new': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  'accepted': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'preparing': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'delivered': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  'closed': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  'disputed': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

const STATUT_LABELS = {
  'new': 'Nouvelle',
  'accepted': 'Acceptée',
  'preparing': 'En préparation',
  'delivered': 'Livrée',
  'closed': 'Clôturée',
  'disputed': 'Litige',
};

// Composant pour animer les chiffres
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => {
    if (suffix === 'K') {
      return `${Math.round(current / 1000)}K`;
    }
    return Math.round(current).toString();
  });

  React.useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function ProducteurCommandes() {
  const { commandes, updateCommandeStatus } = useProducteur();
  const { speak, setIsModalOpen } = useApp();
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [selectedCommande, setSelectedCommande] = useState<any>(null);

  const commandesFiltrees = filtreStatut === 'tous' 
    ? commandes 
    : commandes.filter(c => c.status === filtreStatut);

  const statsCommandes = {
    total: commandes.length,
    nouvelles: commandes.filter(c => c.status === 'new').length,
    acceptees: commandes.filter(c => c.status === 'accepted').length,
    enPreparation: commandes.filter(c => c.status === 'preparing').length,
    livrees: commandes.filter(c => c.status === 'delivered').length,
    litiges: commandes.filter(c => c.status === 'disputed').length,
    montantTotal: commandes
      .filter(c => c.paymentStatus === 'paid')
      .reduce((sum, c) => sum + c.montant, 0),
    montantEnAttente: commandes
      .filter(c => c.paymentStatus === 'pending')
      .reduce((sum, c) => sum + c.montant, 0),
  };

  const handleAccepterCommande = (commandeId: string) => {
    updateCommandeStatus(commandeId, 'accepted');
    speak('Commande acceptée');
  };

  const handleRefuserCommande = (commandeId: string) => {
    updateCommandeStatus(commandeId, 'disputed');
    speak('Commande refusée');
  };

  const handlePreparerCommande = (commandeId: string) => {
    updateCommandeStatus(commandeId, 'preparing');
    speak('Commande en préparation');
  };

  const handleLivrerCommande = (commandeId: string) => {
    updateCommandeStatus(commandeId, 'delivered');
    speak('Commande marquée comme livrée');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec gradient moderne */}
      <div 
        style={{ 
          background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #3BA869 100%)`
        }} 
        className="px-4 pt-12 pb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Mes Commandes</h1>
            <p className="text-white/90 text-sm mt-1">Gère tes ventes en temps réel</p>
          </div>
          <NotificationButton />
        </div>

        {/* KPIs Dynamiques et Animés - BEAUCOUP PLUS GRANDS */}
        <div className="space-y-4">
          {/* Ligne 1: Revenus Total (très grand) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/80 text-sm font-medium">Revenus Totaux</span>
              </div>
              <div className="flex items-center gap-1 text-green-300 text-xs font-semibold">
                <ArrowUp className="w-3 h-3" />
                <span>+12%</span>
              </div>
            </div>
            <div className="text-white text-4xl font-bold mt-3">
              <AnimatedNumber value={statsCommandes.montantTotal} /> <span className="text-2xl">FCFA</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">En attente</span>
                <span className="text-white/90 font-semibold">
                  {statsCommandes.montantEnAttente.toLocaleString()} F
                </span>
              </div>
            </div>
          </motion.div>

          {/* Ligne 2: KPIs Cliquables (Filtres intégrés) - Grille 3x2 */}
          <div className="grid grid-cols-3 gap-3">
            {/* Total - Cyan */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => {
                setFiltreStatut('tous');
                speak('Toutes les commandes');
              }}
              className={`rounded-xl p-3 transition-all duration-300 relative overflow-hidden ${
                filtreStatut === 'tous' 
                  ? 'shadow-lg scale-105' 
                  : 'shadow-sm hover:shadow-md'
              }`}
              style={{
                background: filtreStatut === 'tous'
                  ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                  : 'linear-gradient(135deg, rgba(6, 182, 212, 0.9) 0%, rgba(8, 145, 178, 0.9) 100%)'
              }}
            >
              {/* Effet glow animé sur sélection */}
              {filtreStatut === 'tous' && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mb-1.5"
                  animate={filtreStatut === 'tous' ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <ShoppingBag className="w-5 h-5 text-white" />
                </motion.div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Total</div>
                <motion.div 
                  className="text-white text-2xl font-black mb-1.5"
                  animate={filtreStatut === 'tous' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <AnimatedNumber value={statsCommandes.total} />
                </motion.div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-white rounded-full shadow-lg"
                  />
                </div>
              </div>
            </motion.button>

            {/* Nouvelles - Orange */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => {
                setFiltreStatut('new');
                speak('Nouvelles commandes');
              }}
              className={`rounded-xl p-3 transition-all duration-300 relative overflow-hidden ${
                filtreStatut === 'new' 
                  ? 'shadow-lg scale-105' 
                  : 'shadow-sm hover:shadow-md'
              }`}
              style={{
                background: filtreStatut === 'new'
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)'
              }}
            >
              {filtreStatut === 'new' && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mb-1.5"
                  animate={filtreStatut === 'new' ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <Clock className="w-5 h-5 text-white" />
                </motion.div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Nouvelles</div>
                <motion.div 
                  className="text-white text-2xl font-black mb-1.5"
                  animate={filtreStatut === 'new' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <AnimatedNumber value={statsCommandes.nouvelles} />
                </motion.div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(statsCommandes.nouvelles / Math.max(statsCommandes.total, 1)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full bg-white rounded-full shadow-lg"
                  />
                </div>
              </div>
            </motion.button>

            {/* Acceptées - Bleu */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => {
                setFiltreStatut('accepted');
                speak('Commandes acceptées');
              }}
              className={`rounded-xl p-3 transition-all duration-300 relative overflow-hidden ${
                filtreStatut === 'accepted' 
                  ? 'shadow-lg scale-105' 
                  : 'shadow-sm hover:shadow-md'
              }`}
              style={{
                background: filtreStatut === 'accepted'
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)'
              }}
            >
              {filtreStatut === 'accepted' && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mb-1.5"
                  animate={filtreStatut === 'accepted' ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Acceptées</div>
                <motion.div 
                  className="text-white text-2xl font-black mb-1.5"
                  animate={filtreStatut === 'accepted' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <AnimatedNumber value={statsCommandes.acceptees} />
                </motion.div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(statsCommandes.acceptees / Math.max(statsCommandes.total, 1)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-white rounded-full shadow-lg"
                  />
                </div>
              </div>
            </motion.button>

            {/* En préparation - Violet */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => {
                setFiltreStatut('preparing');
                speak('Commandes en préparation');
              }}
              className={`rounded-xl p-3 transition-all duration-300 relative overflow-hidden ${
                filtreStatut === 'preparing' 
                  ? 'shadow-lg scale-105' 
                  : 'shadow-sm hover:shadow-md'
              }`}
              style={{
                background: filtreStatut === 'preparing'
                  ? 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
                  : 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)'
              }}
            >
              {filtreStatut === 'preparing' && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mb-1.5"
                  animate={filtreStatut === 'preparing' ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <Package className="w-5 h-5 text-white" />
                </motion.div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Préparation</div>
                <motion.div 
                  className="text-white text-2xl font-black mb-1.5"
                  animate={filtreStatut === 'preparing' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <AnimatedNumber value={statsCommandes.enPreparation} />
                </motion.div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(statsCommandes.enPreparation / Math.max(statsCommandes.total, 1)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full bg-white rounded-full shadow-lg"
                  />
                </div>
              </div>
            </motion.button>

            {/* Livrées - Vert Émeraude */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => {
                setFiltreStatut('delivered');
                speak('Commandes livrées');
              }}
              className={`rounded-xl p-3 transition-all duration-300 relative overflow-hidden ${
                filtreStatut === 'delivered' 
                  ? 'shadow-lg scale-105' 
                  : 'shadow-sm hover:shadow-md'
              }`}
              style={{
                background: filtreStatut === 'delivered'
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)'
              }}
            >
              {filtreStatut === 'delivered' && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mb-1.5"
                  animate={filtreStatut === 'delivered' ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <Truck className="w-5 h-5 text-white" />
                </motion.div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Livrées</div>
                <motion.div 
                  className="text-white text-2xl font-black mb-1.5"
                  animate={filtreStatut === 'delivered' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <AnimatedNumber value={statsCommandes.livrees} />
                </motion.div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(statsCommandes.livrees / Math.max(statsCommandes.total, 1)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="h-full bg-white rounded-full shadow-lg"
                  />
                </div>
              </div>
            </motion.button>

            {/* Litiges - Rouge/Rose */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => {
                setFiltreStatut('disputed');
                speak('Commandes en litige');
              }}
              className={`rounded-xl p-3 transition-all duration-300 relative overflow-hidden ${
                filtreStatut === 'disputed' 
                  ? 'shadow-lg scale-105' 
                  : 'shadow-sm hover:shadow-md'
              }`}
              style={{
                background: filtreStatut === 'disputed'
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)'
              }}
            >
              {filtreStatut === 'disputed' && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mb-1.5"
                  animate={filtreStatut === 'disputed' ? { 
                    rotate: [0, -10, 10, -10, 10, 0],
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <AlertCircle className="w-5 h-5 text-white" />
                </motion.div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Litiges</div>
                <motion.div 
                  className="text-white text-2xl font-black mb-1.5"
                  animate={filtreStatut === 'disputed' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <AnimatedNumber value={statsCommandes.litiges} />
                </motion.div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(statsCommandes.litiges / Math.max(statsCommandes.total, 1)) * 100}%` }}
                    transition={{ duration: 1, delay: 1.0 }}
                    className="h-full bg-white rounded-full shadow-lg"
                  />
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Liste des commandes - SIMPLIFIÉE et ÉPURÉE */}
      <div className="px-4 py-4 pb-24">
        {commandesFiltrees.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune commande</h3>
            <p className="text-gray-500 text-sm">
              {filtreStatut === 'tous' 
                ? 'Tu n\'as pas encore reçu de commandes' 
                : `Aucune commande ${STATUT_LABELS[filtreStatut as keyof typeof STATUT_LABELS]?.toLowerCase()}`
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {commandesFiltrees.map((commande, index) => {
              const colors = STATUT_COLORS[commande.status as keyof typeof STATUT_COLORS];

              return (
                <motion.div
                  key={commande.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    {/* En-tête avec produit et statut */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${PRIMARY_COLOR}15` }}
                        >
                          <Package className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">
                            {commande.produit}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            #{commande.id.slice(0, 6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl ${colors.bg} border-2 ${colors.border}`}>
                        <span className={`text-sm font-bold ${colors.text}`}>
                          {STATUT_LABELS[commande.status as keyof typeof STATUT_LABELS]}
                        </span>
                      </div>
                    </div>

                    {/* Informations client */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-bold text-gray-900">{commande.acheteur.nom}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <Package className="w-3.5 h-3.5" />
                            <span>Quantité</span>
                          </div>
                          <div className="font-bold text-gray-900">{commande.quantite} kg</div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Montant</span>
                          </div>
                          <div className="font-bold text-gray-900">
                            {commande.montant.toLocaleString()} F
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statut paiement */}
                    {commande.paymentStatus && (
                      <div className="mb-4">
                        {commande.paymentStatus === 'paid' ? (
                          <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="font-bold text-green-700">Payé</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-orange-50 border-2 border-orange-200 rounded-xl px-4 py-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="font-bold text-orange-700">En attente de paiement</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions principales */}
                    <div className="space-y-3">
                      {commande.status === 'new' && (
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => handleAccepterCommande(commande.id)}
                            className="h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Accepter
                          </Button>
                          <Button
                            onClick={() => handleRefuserCommande(commande.id)}
                            variant="outline"
                            className="h-14 border-2 border-red-300 text-red-600 hover:bg-red-50 font-bold rounded-xl"
                          >
                            <XCircle className="w-5 h-5 mr-2" />
                            Refuser
                          </Button>
                        </div>
                      )}

                      {commande.status === 'accepted' && (
                        <Button
                          onClick={() => handlePreparerCommande(commande.id)}
                          className="w-full h-14 text-white font-bold rounded-xl shadow-sm"
                          style={{ backgroundColor: PRIMARY_COLOR }}
                        >
                          <Package className="w-5 h-5 mr-2" />
                          Commencer la préparation
                        </Button>
                      )}

                      {commande.status === 'preparing' && (
                        <Button
                          onClick={() => handleLivrerCommande(commande.id)}
                          className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm"
                        >
                          <Truck className="w-5 h-5 mr-2" />
                          Marquer comme livrée
                        </Button>
                      )}

                      {commande.status === 'delivered' && (
                        <div className="flex items-center justify-center gap-2 text-green-600 font-bold py-4 bg-green-50 rounded-xl border-2 border-green-200">
                          <CheckCircle className="w-6 h-6" />
                          <span>Commande livrée avec succès</span>
                        </div>
                      )}

                      {commande.status === 'disputed' && (
                        <div className="flex items-center justify-center gap-2 text-red-600 font-bold py-4 bg-red-50 rounded-xl border-2 border-red-200">
                          <AlertCircle className="w-6 h-6" />
                          <span>Commande refusée</span>
                        </div>
                      )}

                      {/* Boutons de contact */}
                      {commande.status !== 'delivered' && commande.status !== 'disputed' && (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => speak(`Contacter ${commande.acheteur.nom}`)}
                            className="flex items-center justify-center gap-2 h-12 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                          >
                            <Phone className="w-5 h-5" />
                            Appeler
                          </button>
                          <button
                            onClick={() => speak('Envoyer un message')}
                            className="flex items-center justify-center gap-2 h-12 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                          >
                            <MessageSquare className="w-5 h-5" />
                            Message
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Navigation role="producteur" />
    </div>
  );
}