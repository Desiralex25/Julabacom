import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Sprout, Calendar, MapPin, BarChart3, Clock,
  CheckCircle, AlertTriangle, TrendingUp, Layers
} from 'lucide-react';
import { type CycleAgricole } from '../../contexts/ProducteurContext';
import { useApp } from '../../contexts/AppContext';

const COLOR = '#2E8B57';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  draft:     { label: 'Préparation', color: '#6b7280', bg: '#f3f4f6', icon: <Clock className="w-4 h-4" /> },
  active:    { label: 'En cours',   color: '#16a34a', bg: '#dcfce7', icon: <TrendingUp className="w-4 h-4" /> },
  completed: { label: 'Récolté',    color: '#2563eb', bg: '#dbeafe', icon: <CheckCircle className="w-4 h-4" /> },
};

interface Props {
  cycle: CycleAgricole;
  onClose: () => void;
}

export function PlantationDetailModal({ cycle, onClose }: Props) {
  const { speak } = useApp();

  const daysSincePlanting = Math.floor(
    (Date.now() - cycle.datePlantation.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalDays = Math.floor(
    (cycle.dateRecolteEstimee.getTime() - cycle.datePlantation.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysUntilHarvest = Math.floor(
    (cycle.dateRecolteEstimee.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const progressPercent = Math.min(100, Math.max(0, (daysSincePlanting / totalDays) * 100));
  const isUrgent = daysUntilHarvest <= 7 && cycle.status === 'active';

  const status = STATUS_CONFIG[cycle.status] || STATUS_CONFIG.draft;

  React.useEffect(() => {
    speak(`Détails de ta plantation de ${cycle.culture}. Progression ${Math.round(progressPercent)} pourcent.`);
  }, []);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                style={{ background: `linear-gradient(135deg, ${COLOR}, #3BA869)` }}
              >
                <Sprout className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">{cycle.culture}</h2>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ color: status.color, backgroundColor: status.bg }}
                >
                  {status.icon}
                  {status.label}
                </span>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Body scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* Progression */}
            {cycle.status === 'active' && (
              <div
                className="rounded-3xl p-4 border-2"
                style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" style={{ color: COLOR }} />
                    <span className="font-bold text-gray-800">Progression de croissance</span>
                  </div>
                  <span className="text-2xl font-black" style={{ color: COLOR }}>
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${COLOR}, #3BA869)` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500 font-medium">Jour 0</span>
                  <span className="text-xs text-gray-500 font-medium">Jour {totalDays}</span>
                </div>
              </div>
            )}

            {/* Infos clés : grille 2 colonnes */}
            <div className="grid grid-cols-2 gap-3">
              {/* Surface */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 font-bold">Surface</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{cycle.surface}</p>
                <p className="text-xs text-gray-500 font-medium">hectares</p>
              </div>

              {/* Récolte attendue */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 font-bold">Récolte attendue</span>
                </div>
                <p className="text-2xl font-black" style={{ color: COLOR }}>
                  {cycle.quantiteEstimee.toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-gray-500 font-medium">kilogrammes</p>
              </div>

              {/* Date de plantation */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 font-bold">Plantation</span>
                </div>
                <p className="text-sm font-black text-gray-900 leading-tight">
                  {fmtDate(cycle.datePlantation)}
                </p>
                <p className="text-xs text-gray-500 font-medium">il y a {daysSincePlanting} jours</p>
              </div>

              {/* Date de récolte estimée */}
              <div
                className={`rounded-2xl p-4 border-2 flex flex-col gap-1 ${
                  isUrgent ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isUrgent
                    ? <AlertTriangle className="w-4 h-4 text-orange-500" />
                    : <Calendar className="w-4 h-4 text-gray-500" />
                  }
                  <span className={`text-xs font-bold ${isUrgent ? 'text-orange-600' : 'text-gray-600'}`}>
                    Récolte prévue
                  </span>
                </div>
                <p className={`text-sm font-black leading-tight ${isUrgent ? 'text-orange-700' : 'text-gray-900'}`}>
                  {fmtDate(cycle.dateRecolteEstimee)}
                </p>
                <p className={`text-xs font-bold ${isUrgent ? 'text-orange-600' : 'text-gray-500'}`}>
                  {daysUntilHarvest > 0
                    ? `Dans ${daysUntilHarvest} jour${daysUntilHarvest > 1 ? 's' : ''}`
                    : daysUntilHarvest === 0
                    ? "Aujourd'hui !"
                    : `Dépassée de ${Math.abs(daysUntilHarvest)} j`
                  }
                </p>
              </div>
            </div>

            {/* Durée totale du cycle */}
            <div
              className="rounded-2xl p-4 border-2 flex items-center gap-4"
              style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: COLOR }}
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-bold">Durée totale du cycle</p>
                <p className="text-lg font-black text-gray-900">{totalDays} jours</p>
                <p className="text-xs text-gray-500">Plantation → Récolte</p>
              </div>
            </div>

            {/* Alerte urgence */}
            {isUrgent && (
              <motion.div
                className="rounded-2xl p-4 border-2 border-orange-400 bg-orange-50 flex items-start gap-3"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-orange-800">Récolte imminente !</p>
                  <p className="text-xs text-orange-700 mt-0.5">
                    Ta récolte est dans {daysUntilHarvest} jour{daysUntilHarvest > 1 ? 's' : ''}. Prépare-toi !
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-6 pt-3 border-t border-gray-100">
            <motion.button
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg"
              style={{ background: `linear-gradient(135deg, ${COLOR}, #3BA869)` }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              Fermer
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}