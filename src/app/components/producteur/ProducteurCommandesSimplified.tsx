import React, { useState } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Phone,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Package,
  Truck,
  User,
  ArrowUp,
  ArrowDown,
  X,
  MapPin,
  Calendar,
  ChevronRight,
  Award,
  Sparkles,
  Tag,
  Handshake,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Send,
  BadgeAlert,
  TrendingDown,
} from 'lucide-react';
import { Navigation } from '../layout/Navigation';
import { useProducteur } from '../../contexts/ProducteurContext';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { NotificationButton } from '../marchand/NotificationButton';
import type { NegociationStatut } from '../../contexts/ProducteurContext';

const PRIMARY_COLOR = '#2E8B57';

const STATUT_COLORS = {
  'new': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', hex: '#f59e0b', gradient: 'from-yellow-500 to-orange-500' },
  'accepted': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', hex: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
  'preparing': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', hex: '#a855f7', gradient: 'from-purple-500 to-purple-600' },
  'delivered': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', hex: '#10b981', gradient: 'from-green-500 to-emerald-600' },
  'closed': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', hex: '#6b7280', gradient: 'from-gray-500 to-gray-600' },
  'disputed': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', hex: '#ef4444', gradient: 'from-red-500 to-red-600' },
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

// ── Panneau de négociation dans le modal ──────────────────────────
function NegociationPanel({ commande, onUpdateNego, onClose }: {
  commande: any;
  onUpdateNego: (statut: NegociationStatut, contreOffre?: number) => void;
  onClose: () => void;
}) {
  const { speak } = useApp();
  const [mode, setMode] = useState<'view' | 'contre_offre'>('view');
  const [contreOffreValue, setContreOffreValue] = useState('');
  const neg = commande.negociation;
  const prixActuel = Math.round(commande.montant / commande.quantite);
  const diff = neg.prixPropose - prixActuel;
  const diffPct = Math.round(Math.abs(diff / prixActuel) * 100);
  const isBaisse = diff < 0;

  const handleAccepter = () => {
    onUpdateNego('acceptee');
    speak(`Prix accepté. ${neg.prixPropose} francs par kilo.`);
    onClose();
  };

  const handleRefuser = () => {
    onUpdateNego('refusee');
    speak('Négociation refusée.');
    onClose();
  };

  const handleContreOffre = () => {
    const val = parseInt(contreOffreValue);
    if (!val || val <= 0) return;
    onUpdateNego('contre_offre', val);
    speak(`Contre-offre envoyée : ${val} francs par kilo.`);
    onClose();
  };

  // Affichage quand la négo est déjà traitée (contre_offre, acceptee, refusee)
  if (neg.statut === 'acceptee') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-5 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-md">
            <ThumbsUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-green-800">Négociation acceptée</p>
            <p className="text-sm text-green-600">Prix convenu : <strong>{neg.prixPropose} F/kg</strong></p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (neg.statut === 'refusee') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center shadow-md">
            <ThumbsDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-red-800">Négociation refusée</p>
            <p className="text-sm text-red-600">Le client a été informé de ton refus.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (neg.statut === 'contre_offre') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-md">
            <RotateCcw className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-amber-800">Contre-offre envoyée</p>
            <p className="text-xs text-amber-600">En attente de réponse du client</p>
          </div>
        </div>
        <div className="flex items-center justify-between bg-white/70 rounded-2xl px-4 py-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Proposé par le client</p>
            <p className="font-black text-red-600">{neg.prixPropose} F/kg</p>
          </div>
          <ArrowRight />
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Ta contre-offre</p>
            <p className="font-black text-green-700">{neg.contreOffre} F/kg</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Négociation en attente — panneau principal
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 shadow-xl overflow-hidden"
    >
      {/* Header pulsant */}
      <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-white/10"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-10 h-10 rounded-2xl bg-white/25 flex items-center justify-center"
          >
            <Handshake className="w-5 h-5 text-white" />
          </motion.div>
          <div className="flex-1">
            <p className="font-bold text-white">Offre de négociation</p>
            <p className="text-white/80 text-xs">
              {new Date(neg.dateProposition).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              {' à '}
              {new Date(neg.dateProposition).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-white shadow-lg"
          />
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Comparaison des prix */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">Ton prix actuel</p>
            <p className="text-2xl font-black text-gray-900">{prixActuel}<span className="text-sm font-bold"> F/kg</span></p>
          </div>
          <div className={`rounded-2xl p-4 border-2 shadow-sm text-center ${isBaisse ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
            <p className="text-xs font-medium mb-1" style={{ color: isBaisse ? '#dc2626' : '#16a34a' }}>Prix proposé</p>
            <p className={`text-2xl font-black ${isBaisse ? 'text-red-700' : 'text-green-700'}`}>
              {neg.prixPropose}<span className="text-sm font-bold"> F/kg</span>
            </p>
          </div>
        </div>

        {/* Badge différence */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl ${
            isBaisse
              ? 'bg-red-100 border border-red-200'
              : 'bg-green-100 border border-green-200'
          }`}
        >
          {isBaisse
            ? <TrendingDown className="w-4 h-4 text-red-600" />
            : <TrendingUp className="w-4 h-4 text-green-600" />
          }
          <span className={`font-bold text-sm ${isBaisse ? 'text-red-700' : 'text-green-700'}`}>
            {isBaisse ? `-${diffPct}%` : `+${diffPct}%`} sur le prix
          </span>
          <span className="text-gray-500 text-xs">
            ({isBaisse ? '-' : '+'}{Math.abs(diff)} F × {commande.quantite} kg = {(Math.abs(diff) * commande.quantite).toLocaleString()} F)
          </span>
        </motion.div>

        {/* Message du client — bulle de discussion */}
        <div className="relative">
          <div className="absolute -top-1 left-5 w-3 h-3 bg-amber-100 border-l border-t border-amber-300 rotate-45" />
          <div className="bg-amber-100 border border-amber-300 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <User className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-xs font-bold text-amber-800">{commande.acheteur.nom}</span>
            </div>
            <p className="text-sm text-amber-900 leading-relaxed italic">"{neg.message}"</p>
          </div>
        </div>

        {/* Mode contre-offre */}
        <AnimatePresence mode="wait">
          {mode === 'contre_offre' ? (
            <motion.div
              key="contre"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="bg-white rounded-2xl border-2 border-green-300 p-4">
                <p className="text-xs font-bold text-gray-600 mb-2">Ton prix en contre-proposition (F/kg)</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={contreOffreValue}
                      onChange={(e) => setContreOffreValue(e.target.value)}
                      placeholder={`Ex: ${Math.round((prixActuel + neg.prixPropose) / 2)}`}
                      className="w-full h-14 text-2xl font-black text-center border-2 border-green-300 rounded-xl focus:outline-none focus:border-green-500 bg-green-50"
                    />
                  </div>
                  <span className="text-gray-600 font-bold">F/kg</span>
                </div>
                {contreOffreValue && parseInt(contreOffreValue) > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-center text-green-700 mt-2 font-medium"
                  >
                    Total estimé : {(parseInt(contreOffreValue) * commande.quantite).toLocaleString()} F pour {commande.quantite} kg
                  </motion.p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('view')}
                  className="flex-1 h-12 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleContreOffre}
                  disabled={!contreOffreValue || parseInt(contreOffreValue) <= 0}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              {/* Accepter */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={handleAccepter}
                className="w-full relative overflow-hidden h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-xl flex items-center justify-center gap-3 text-base"
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <ThumbsUp className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Accepter {neg.prixPropose} F/kg</span>
              </motion.button>

              {/* Contre-offre */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => {
                  setMode('contre_offre');
                  speak('Fais ta contre-proposition');
                }}
                className="w-full h-14 rounded-2xl border-2 border-amber-500 bg-white text-amber-700 font-bold flex items-center justify-center gap-3 text-base shadow-md"
              >
                <RotateCcw className="w-5 h-5" />
                Faire une contre-offre
              </motion.button>

              {/* Refuser */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleRefuser}
                className="w-full h-12 rounded-2xl border-2 border-red-300 bg-red-50 text-red-600 font-bold flex items-center justify-center gap-2 text-sm"
              >
                <ThumbsDown className="w-4 h-4" />
                Refuser cette offre
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Petite flèche pour la comparaison de prix
function ArrowRight() {
  return (
    <div className="flex items-center justify-center">
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );
}

// Modal de détails de commande
function CommandeDetailModal({ commande, onClose, onAccept, onRefuse, onPrepare, onDeliver, onUpdateNego }: any) {
  const { speak } = useApp();
  const colors = STATUT_COLORS[commande.status as keyof typeof STATUT_COLORS];
  const hasNego = !!commande.negociation;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: '100%', opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-90`} />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <div className="relative p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-11 h-11 bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-xl"
              >
                <Package className="w-10 h-10 text-white" />
              </motion.div>
              <div className="flex-1">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-1 drop-shadow-lg"
                >
                  {commande.produit}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 text-sm font-semibold"
                >
                  #{commande.id.slice(0, 8).toUpperCase()}
                </motion.p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white font-bold text-sm">
                  {STATUT_LABELS[commande.status as keyof typeof STATUT_LABELS]}
                </span>
              </motion.div>

              {/* Badge négociation dans le header */}
              {hasNego && commande.negociation.statut === 'en_attente' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ delay: 0.6, duration: 1.5, repeat: Infinity }}
                  className="inline-flex items-center gap-2 bg-amber-400/90 px-4 py-2.5 rounded-full shadow-lg"
                >
                  <Handshake className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-sm">Négo en cours</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Panneau négociation — EN PREMIER si en attente */}
          {hasNego && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <NegociationPanel
                commande={commande}
                onUpdateNego={onUpdateNego}
                onClose={onClose}
              />
            </motion.div>
          )}

          {/* Client */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl" />
            <div className="relative p-5 border border-gray-200 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Client</p>
                  <h3 className="font-bold text-gray-900 text-xl">{commande.acheteur.nom}</h3>
                </div>
              </div>

              {commande.acheteur.telephone && (
                <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-white rounded-lg px-3 py-2 mb-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{commande.acheteur.telephone}</span>
                </div>
              )}
              {commande.acheteur.adresse && (
                <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-white rounded-lg px-3 py-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{commande.acheteur.adresse}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Détails commande */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 text-xs mb-2 font-semibold">
                <Package className="w-4 h-4" />
                <span>Quantité</span>
              </div>
              <p className="text-3xl font-black text-blue-900">{commande.quantite} <span className="text-lg font-bold">kg</span></p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-4 border border-green-200">
              <div className="flex items-center gap-2 text-green-600 text-xs mb-2 font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>Montant</span>
              </div>
              <p className="text-3xl font-black text-green-900">
                {commande.montant.toLocaleString()} <span className="text-sm font-bold">F</span>
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 border border-purple-200">
              <div className="flex items-center gap-2 text-purple-600 text-xs mb-2 font-semibold">
                <Calendar className="w-4 h-4" />
                <span>Date</span>
              </div>
              <p className="text-sm font-bold text-purple-900">
                {new Date(commande.dateCommande).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-4 border border-orange-200">
              <div className="flex items-center gap-2 text-orange-600 text-xs mb-2 font-semibold">
                <Tag className="w-4 h-4" />
                <span>Prix/kg</span>
              </div>
              <p className="text-sm font-bold text-orange-900">
                {Math.round(commande.montant / commande.quantite).toLocaleString()} F
              </p>
            </div>
          </motion.div>

          {/* Statut paiement */}
          {commande.paymentStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {commande.paymentStatus === 'paid' ? (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 shadow-lg">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-xl">Paiement confirmé</p>
                      <p className="text-sm text-white/90">Transaction validée avec succès</p>
                    </div>
                    <Sparkles className="w-6 h-6 text-white/80" />
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 p-5 shadow-lg">
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-xl">En attente de paiement</p>
                      <p className="text-sm text-white/90">Le client doit confirmer le paiement</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Actions principales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3 pt-3"
          >
            {commande.status === 'new' && (
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    onAccept(commande.id);
                    onClose();
                  }}
                  className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-xl text-lg relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                  <CheckCircle className="w-6 h-6 mr-3 relative z-10" />
                  <span className="relative z-10">Accepter la commande</span>
                </Button>
                <Button
                  onClick={() => {
                    onRefuse(commande.id);
                    onClose();
                  }}
                  variant="outline"
                  className="w-full h-16 border-2 border-red-400 bg-white text-red-600 hover:bg-red-50 font-bold rounded-2xl text-lg shadow-lg"
                >
                  <XCircle className="w-6 h-6 mr-3" />
                  Refuser cette commande
                </Button>
              </div>
            )}

            {commande.status === 'accepted' && (
              <Button
                onClick={() => {
                  onPrepare(commande.id);
                  onClose();
                }}
                className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl text-lg"
              >
                <Package className="w-6 h-6 mr-3" />
                Commencer la préparation
              </Button>
            )}

            {commande.status === 'preparing' && (
              <Button
                onClick={() => {
                  onDeliver(commande.id);
                  onClose();
                }}
                className="w-full h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl text-lg"
              >
                <Truck className="w-6 h-6 mr-3" />
                Marquer comme livrée
              </Button>
            )}

            {commande.status === 'delivered' && (
              <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-8 rounded-2xl shadow-lg">
                <Award className="w-8 h-8" />
                <span className="text-xl">Commande livrée avec succès !</span>
              </div>
            )}

            {commande.status === 'disputed' && (
              <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-8 rounded-2xl shadow-lg">
                <AlertCircle className="w-8 h-8" />
                <span className="text-xl">Commande refusée</span>
              </div>
            )}

            {/* Boutons contact */}
            {commande.status !== 'delivered' && commande.status !== 'disputed' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => speak(`Contacter ${commande.acheteur.nom}`)}
                  className="flex items-center justify-center gap-2.5 h-14 font-bold text-gray-700 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-md"
                >
                  <Phone className="w-5 h-5" />
                  Appeler
                </button>
                <button
                  onClick={() => speak('Envoyer un message')}
                  className="flex items-center justify-center gap-2.5 h-14 font-bold text-gray-700 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-md"
                >
                  <MessageSquare className="w-5 h-5" />
                  Message
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProducteurCommandes() {
  const { commandes, updateCommandeStatus, updateNegociation } = useProducteur();
  const { speak, setIsModalOpen } = useApp();
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [selectedCommande, setSelectedCommande] = useState<any>(null);

  // Gérer l'affichage de la bottom bar selon l'état du modal
  React.useEffect(() => {
    setIsModalOpen(selectedCommande !== null);
  }, [selectedCommande, setIsModalOpen]);

  // Commandes avec négociation en attente
  const negosEnAttente = commandes.filter(c => c.negociation?.statut === 'en_attente');

  const commandesFiltrees = filtreStatut === 'tous'
    ? commandes
    : filtreStatut === 'nego'
    ? commandes.filter(c => !!c.negociation)
    : commandes.filter(c => c.status === filtreStatut);

  const statsCommandes = {
    total: commandes.length,
    nouvelles: commandes.filter(c => c.status === 'new').length,
    acceptees: commandes.filter(c => c.status === 'accepted').length,
    enPreparation: commandes.filter(c => c.status === 'preparing').length,
    livrees: commandes.filter(c => c.status === 'delivered').length,
    litiges: commandes.filter(c => c.status === 'disputed').length,
    negociations: commandes.filter(c => c.negociation?.statut === 'en_attente').length,
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

  const handleUpdateNegociation = (commandeId: string, statut: NegociationStatut, contreOffre?: number) => {
    updateNegociation(commandeId, statut, contreOffre);
    // Mettre à jour la commande sélectionnée localement
    setSelectedCommande((prev: any) => prev
      ? { ...prev, negociation: { ...prev.negociation, statut, ...(contreOffre !== undefined ? { contreOffre } : {}) } }
      : null
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #3BA869 100%)` }}
        className="px-4 pt-12 pb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Mes Commandes</h1>
            <p className="text-white/90 text-sm mt-1">Gère tes ventes en temps réel</p>
          </div>
          <NotificationButton />
        </div>

        {/* KPIs */}
        <div className="space-y-4">
          {/* Revenus totaux */}
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

          {/* Grille KPIs filtres — 3 colonnes */}
          <div className="grid grid-cols-3 gap-2">
            {/* Total */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => { setFiltreStatut('tous'); speak('Toutes les commandes'); }}
              className={`rounded-xl p-3 transition-all relative overflow-hidden ${filtreStatut === 'tous' ? 'shadow-lg scale-105' : 'shadow-sm'}`}
              style={{ background: filtreStatut === 'tous' ? 'linear-gradient(135deg, #0e7490, #0891b2)' : 'linear-gradient(135deg, rgba(14,116,144,0.9), rgba(8,145,178,0.9))' }}
            >
              {filtreStatut === 'tous' && (
                <motion.div className="absolute inset-0 bg-white/20" animate={{ opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
              )}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center mb-1">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Total</div>
                <div className="text-white text-2xl font-black mb-1">
                  <AnimatedNumber value={statsCommandes.total} />
                </div>
              </div>
            </motion.button>

            {/* Négociations — mis en avant */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => { setFiltreStatut('nego'); speak('Négociations de prix'); }}
              className={`rounded-xl p-3 transition-all relative overflow-hidden ${filtreStatut === 'nego' ? 'shadow-lg scale-105' : 'shadow-sm'}`}
              style={{ background: filtreStatut === 'nego' ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'linear-gradient(135deg, rgba(217,119,6,0.9), rgba(245,158,11,0.9))' }}
            >
              {statsCommandes.negociations > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center z-20 shadow-lg"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="text-white text-[9px] font-black">{statsCommandes.negociations}</span>
                </motion.div>
              )}
              {filtreStatut === 'nego' && (
                <motion.div className="absolute inset-0 bg-white/20" animate={{ opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
              )}
              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div
                  className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center mb-1"
                  animate={statsCommandes.negociations > 0 ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Handshake className="w-4 h-4 text-white" />
                </motion.div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Négo</div>
                <div className="text-white text-2xl font-black mb-1">
                  <AnimatedNumber value={statsCommandes.negociations} />
                </div>
              </div>
            </motion.button>

            {/* Nouvelles */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => { setFiltreStatut('new'); speak('Nouvelles commandes'); }}
              className={`rounded-xl p-3 transition-all relative overflow-hidden ${filtreStatut === 'new' ? 'shadow-lg scale-105' : 'shadow-sm'}`}
              style={{ background: filtreStatut === 'new' ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(249,115,22,0.9))' }}
            >
              {filtreStatut === 'new' && (
                <motion.div className="absolute inset-0 bg-white/20" animate={{ opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
              )}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Nouvelles</div>
                <div className="text-white text-2xl font-black mb-1">
                  <AnimatedNumber value={statsCommandes.nouvelles} />
                </div>
              </div>
            </motion.button>

            {/* Acceptées */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => { setFiltreStatut('accepted'); speak('Commandes acceptées'); }}
              className={`rounded-xl p-3 transition-all relative overflow-hidden ${filtreStatut === 'accepted' ? 'shadow-lg scale-105' : 'shadow-sm'}`}
              style={{ background: filtreStatut === 'accepted' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9))' }}
            >
              {filtreStatut === 'accepted' && (
                <motion.div className="absolute inset-0 bg-white/20" animate={{ opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
              )}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center mb-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Acceptées</div>
                <div className="text-white text-2xl font-black mb-1">
                  <AnimatedNumber value={statsCommandes.acceptees} />
                </div>
              </div>
            </motion.button>

            {/* Préparation */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => { setFiltreStatut('preparing'); speak('Commandes en préparation'); }}
              className={`rounded-xl p-3 transition-all relative overflow-hidden ${filtreStatut === 'preparing' ? 'shadow-lg scale-105' : 'shadow-sm'}`}
              style={{ background: filtreStatut === 'preparing' ? 'linear-gradient(135deg, #a855f7, #9333ea)' : 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(147,51,234,0.9))' }}
            >
              {filtreStatut === 'preparing' && (
                <motion.div className="absolute inset-0 bg-white/20" animate={{ opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
              )}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center mb-1">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Préparation</div>
                <div className="text-white text-2xl font-black mb-1">
                  <AnimatedNumber value={statsCommandes.enPreparation} />
                </div>
              </div>
            </motion.button>

            {/* Litiges */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => { setFiltreStatut('disputed'); speak('Commandes en litige'); }}
              className={`rounded-xl p-3 transition-all relative overflow-hidden ${filtreStatut === 'disputed' ? 'shadow-lg scale-105' : 'shadow-sm'}`}
              style={{ background: filtreStatut === 'disputed' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))' }}
            >
              {filtreStatut === 'disputed' && (
                <motion.div className="absolute inset-0 bg-white/20" animate={{ opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
              )}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center mb-1">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div className="text-white/80 text-[10px] font-semibold mb-0.5">Litiges</div>
                <div className="text-white text-2xl font-black mb-1">
                  <AnimatedNumber value={statsCommandes.litiges} />
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="px-4 py-4 pb-24">

        {/* Bannière négociations en attente */}
        <AnimatePresence>
          {negosEnAttente.length > 0 && filtreStatut !== 'nego' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <motion.button
                onClick={() => { setFiltreStatut('nego'); speak(`${negosEnAttente.length} offres de négociation en attente`); }}
                className="w-full relative overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 shadow-lg"
                whileTap={{ scale: 0.98 }}
              >
                {/* Fond animé */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-orange-200/30"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <div className="relative flex items-center gap-4 p-4">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl flex-shrink-0"
                  >
                    <Handshake className="w-7 h-7 text-white" />
                  </motion.div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-amber-900">Offres de négociation</p>
                      <motion.div
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-amber-500"
                      />
                    </div>
                    <p className="text-sm text-amber-700">
                      <strong>{negosEnAttente.length}</strong> marchand{negosEnAttente.length > 1 ? 's' : ''} te propose{negosEnAttente.length > 1 ? 'nt' : ''} un prix
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500 px-3 py-1.5 rounded-full">
                    <span className="text-white text-xs font-bold">Voir</span>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

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
                : filtreStatut === 'nego'
                ? 'Aucune négociation en cours'
                : `Aucune commande ${STATUT_LABELS[filtreStatut as keyof typeof STATUT_LABELS]?.toLowerCase()}`
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {commandesFiltrees.map((commande, index) => {
              const colors = STATUT_COLORS[commande.status as keyof typeof STATUT_COLORS];
              const hasNegoEnAttente = commande.negociation?.statut === 'en_attente';
              const hasNegoContreOffre = commande.negociation?.statut === 'contre_offre';
              const prixActuel = Math.round(commande.montant / commande.quantite);

              return (
                <motion.button
                  key={commande.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedCommande(commande);
                    speak(`Détails de la commande ${commande.produit}`);
                  }}
                  className={`w-full rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all text-left relative group ${
                    hasNegoEnAttente
                      ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-white border-2 border-amber-400'
                      : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
                  }`}
                >
                  {/* Bande de couleur gauche */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${
                    hasNegoEnAttente ? 'from-amber-500 to-orange-500' : colors.gradient
                  }`} />

                  {/* Badge négociation en attente — pulsant */}
                  {hasNegoEnAttente && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute top-3 right-3 flex items-center gap-1.5 bg-amber-500 px-2.5 py-1 rounded-full shadow-md z-10"
                    >
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-white"
                      />
                      <span className="text-white text-[10px] font-bold">NÉGO</span>
                    </motion.div>
                  )}

                  {/* Badge contre-offre */}
                  {hasNegoContreOffre && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-blue-500 px-2.5 py-1 rounded-full shadow-md z-10">
                      <RotateCcw className="w-3 h-3 text-white" />
                      <span className="text-white text-[10px] font-bold">CONTRE-OFFRE</span>
                    </div>
                  )}

                  <div className="p-4 pl-5">
                    {/* En-tête */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-24">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${
                          hasNegoEnAttente ? 'from-amber-500 to-orange-500' : colors.gradient
                        } shadow-lg`}>
                          {hasNegoEnAttente
                            ? <Handshake className="w-7 h-7 text-white" />
                            : <Package className="w-7 h-7 text-white" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
                            {commande.produit}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium">
                            #{commande.id.slice(0, 6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      {!hasNegoEnAttente && !hasNegoContreOffre && (
                        <div className={`px-3 py-1.5 rounded-lg ${colors.bg} border ${colors.border}`}>
                          <span className={`text-xs font-bold ${colors.text}`}>
                            {STATUT_LABELS[commande.status as keyof typeof STATUT_LABELS]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Client */}
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{commande.acheteur.nom}</span>
                    </div>

                    {/* Infos prix — affichage spécial si négo en attente */}
                    {hasNegoEnAttente ? (
                      <div className="bg-white rounded-xl px-3 py-3 mb-3 border border-amber-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-bold text-gray-900">{commande.quantite} kg</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-[10px] text-gray-500">Ton prix</p>
                              <p className="text-sm font-bold text-gray-600 line-through">{prixActuel} F/kg</p>
                            </div>
                            <ArrowDown className="w-3 h-3 text-red-500" />
                            <div className="text-center">
                              <p className="text-[10px] text-amber-700">Proposé</p>
                              <p className="text-sm font-black text-amber-700">{commande.negociation!.prixPropose} F/kg</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl px-3 py-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-bold text-gray-900">{commande.quantite} kg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-bold text-gray-900">
                            {commande.montant.toLocaleString()} F
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {commande.paymentStatus === 'paid' ? (
                        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold text-xs">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Payé
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg font-bold text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          En attente
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600 group-hover:text-green-600 transition-colors">
                        <span>Voir détails</span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de détails */}
      <AnimatePresence>
        {selectedCommande && (
          <CommandeDetailModal
            commande={selectedCommande}
            onClose={() => setSelectedCommande(null)}
            onAccept={handleAccepterCommande}
            onRefuse={handleRefuserCommande}
            onPrepare={handlePreparerCommande}
            onDeliver={handleLivrerCommande}
            onUpdateNego={(statut: NegociationStatut, contreOffre?: number) =>
              handleUpdateNegociation(selectedCommande.id, statut, contreOffre)
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
