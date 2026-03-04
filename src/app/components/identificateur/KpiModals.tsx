import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Users,
  Target,
  TrendingUp,
  Calendar,
  Download,
  Mail,
  MessageCircle,
  Printer,
  CheckCircle2,
  FileText,
  Award,
  Zap,
  BarChart3,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'sonner';

interface KpiModalProps {
  show: boolean;
  onClose: () => void;
  onDownload: () => void;
  onShare: (platform: 'whatsapp' | 'email' | 'print') => void;
}

export function KpiMoisModal({ show, onClose, onDownload, onShare }: KpiModalProps) {
  const { speak } = useApp();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center p-0 lg:p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        className="relative bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] lg:max-h-[85vh] overflow-y-auto"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-xl">Identifications du mois</h2>
            <motion.button
              onClick={() => {
                onClose();
                speak('Fermeture du détail');
              }}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Section titre et statut */}
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-3xl p-5 border-2 border-amber-200">
            <div className="flex items-start gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Users className="w-8 h-8 text-white" strokeWidth={2.5} />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">392 Identifications</h3>
                <p className="text-sm text-gray-600 mb-3">Février 2026 - Mois en cours</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-green-100 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Objectif dépassé de 22%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explication détaillée */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-5 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-gray-900">Qu'est-ce que ce chiffre représente ?</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Ce chiffre représente le <span className="font-bold">nombre total d'acteurs identifiés</span> durant le mois en cours (Février 2026). 
              Il inclut à la fois les <span className="font-bold text-[#C66A2C]">marchands</span> et les <span className="font-bold text-[#16A34A]">producteurs</span> que 
              vous avez enregistrés dans le système Jùlaba. Chaque identification validée contribue à votre Score Jùlaba.
            </p>
          </div>

          {/* Répartition détaillée */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-4 border-2 border-orange-200"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#C66A2C]/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#C66A2C]" />
                </div>
                <p className="text-xs text-gray-600 font-semibold">Marchands</p>
              </div>
              <p className="text-3xl font-bold text-[#C66A2C]">287</p>
              <p className="text-xs text-gray-500 mt-1">73% du total</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-4 border-2 border-green-200"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#16A34A]/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#16A34A]" />
                </div>
                <p className="text-xs text-gray-600 font-semibold">Producteurs</p>
              </div>
              <p className="text-3xl font-bold text-[#16A34A]">105</p>
              <p className="text-xs text-gray-500 mt-1">27% du total</p>
            </motion.div>
          </div>

          {/* Statistiques supplémentaires */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-5 border-2 border-gray-200 space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#9F8170]" />
              Statistiques détaillées
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Zones couvertes</p>
                <p className="text-lg font-bold text-blue-600">12</p>
                <p className="text-xs text-gray-500 mt-1">Territoires différents</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Identifications validées</p>
                <p className="text-lg font-bold text-purple-600">78 400</p>
                <p className="text-xs text-gray-500 mt-1">ce mois</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Meilleure journée</p>
                <p className="text-lg font-bold text-indigo-600">Samedi 15</p>
                <p className="text-xs text-gray-500 mt-1">43 identifications</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Taux validation</p>
                <p className="text-lg font-bold text-green-600">94%</p>
                <p className="text-xs text-gray-500 mt-1">Dossiers approuvés</p>
              </div>
            </div>
          </div>

          {/* Impact et récompenses */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-5 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-gray-900">Votre impact</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Vous avez aidé <span className="font-bold">392 acteurs vivriers</span> à rejoindre l'économie formelle</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Votre Score Jùlaba a augmenté de <span className="font-bold text-[#9F8170]">+580 points XP</span></span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Vous êtes dans le <span className="font-bold">Top 15%</span> des identificateurs de votre région</span>
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Actions disponibles</p>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={onDownload}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-[#9F8170] to-[#B39485] text-white border-2 border-[#9F8170] shadow-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5" />
                <span>PDF</span>
              </motion.button>

              <motion.button
                onClick={() => onShare('print')}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-white text-gray-700 border-2 border-gray-300 hover:border-[#9F8170]"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Printer className="w-5 h-5" />
                <span>Imprimer</span>
              </motion.button>
            </div>

            <div className="pt-2 border-t-2 border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-3">Partager via</p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => onShare('whatsapp')}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-[#25D366] text-white border-2 border-[#25D366] shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </motion.button>

                <motion.button
                  onClick={() => onShare('email')}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-blue-600 text-white border-2 border-blue-600 shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function KpiObjectifModal({ show, onClose, onDownload, onShare }: KpiModalProps) {
  const { speak } = useApp();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center p-0 lg:p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] lg:max-h-[85vh] overflow-y-auto"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-xl">Atteinte des objectifs</h2>
            <motion.button
              onClick={() => {
                onClose();
                speak('Fermeture du détail');
              }}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-5 border-2 border-green-200">
            <div className="flex items-start gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Target className="w-8 h-8 text-white" strokeWidth={2.5} />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">122% d'atteinte</h3>
                <p className="text-sm text-gray-600 mb-3">Objectif largement dépassé ce mois</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-amber-100 text-amber-700">
                  <Award className="w-4 h-4" />
                  <span>Performance exceptionnelle !</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-5 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-gray-900">Qu'est-ce que ce chiffre représente ?</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Ce pourcentage indique le <span className="font-bold">taux d'atteinte de vos objectifs mensuels</span>. 
              Votre objectif était de <span className="font-bold text-blue-600">320 identifications</span> pour Février 2026, 
              et vous avez réalisé <span className="font-bold text-green-600">392 identifications</span>, soit 
              <span className="font-bold"> 72 identifications supplémentaires</span> (+22% de bonus). Ce dépassement vous permet 
              d'obtenir des <span className="font-bold text-purple-600">primes exceptionnelles</span> et d'améliorer significativement 
              votre Score Jùlaba.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border-2 border-blue-200"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <p className="text-xs text-gray-600 font-semibold">Objectif fixé</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">320</p>
              <p className="text-xs text-gray-500 mt-1">Identifications attendues</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-4 border-2 border-green-200"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-xs text-gray-600 font-semibold">Réalisé</p>
              </div>
              <p className="text-3xl font-bold text-green-600">392</p>
              <p className="text-xs text-gray-500 mt-1">Identifications validées</p>
            </motion.div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-5 border-2 border-gray-200 space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#9F8170]" />
              Progression par semaine
            </h4>
            
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600 font-semibold">Semaine 1 (1-7 Fév)</p>
                  <span className="text-xs font-bold text-green-600">+15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">74/80 identifications</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600 font-semibold">Semaine 2 (8-14 Fév)</p>
                  <span className="text-xs font-bold text-amber-600">+25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">100/80 identifications</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600 font-semibold">Semaine 3 (15-21 Fév)</p>
                  <span className="text-xs font-bold text-green-600">+12%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">90/80 identifications</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600 font-semibold">Semaine 4 (22-28 Fév)</p>
                  <span className="text-xs font-bold text-amber-600">+58%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">128/80 identifications</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-5 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-gray-900">Récompenses débloquées</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><span className="font-bold">Prime de dépassement :</span> +15 600 FCFA supplémentaires</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><span className="font-bold">Badge :</span> "Identificateur Elite" débloqué</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><span className="font-bold">Bonus XP :</span> +220 points Score Jùlaba</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Actions disponibles</p>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={onDownload}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-[#9F8170] to-[#B39485] text-white border-2 border-[#9F8170] shadow-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5" />
                <span>PDF</span>
              </motion.button>

              <motion.button
                onClick={() => onShare('print')}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-white text-gray-700 border-2 border-gray-300 hover:border-[#9F8170]"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Printer className="w-5 h-5" />
                <span>Imprimer</span>
              </motion.button>
            </div>

            <div className="pt-2 border-t-2 border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-3">Partager via</p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => onShare('whatsapp')}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-[#25D366] text-white border-2 border-[#25D366] shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </motion.button>

                <motion.button
                  onClick={() => onShare('email')}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-blue-600 text-white border-2 border-blue-600 shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function KpiMoyenneModal({ show, onClose, onDownload, onShare }: KpiModalProps) {
  const { speak } = useApp();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center p-0 lg:p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] lg:max-h-[85vh] overflow-y-auto"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-xl">Moyenne journalière</h2>
            <motion.button
              onClick={() => {
                onClose();
                speak('Fermeture du détail');
              }}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-5 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">18 identifications/jour</h3>
                <p className="text-sm text-gray-600 mb-3">Moyenne calculée sur Février 2026</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-green-100 text-green-700">
                  <TrendingUp className="w-4 h-4" />
                  <span>+5% par rapport au mois dernier</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-5 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-gray-900">Qu'est-ce que ce chiffre représente ?</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Ce chiffre représente votre <span className="font-bold">moyenne d'identifications par jour travaillé</span> durant 
              le mois en cours. Il est calculé en divisant le nombre total d'identifications (392) par le nombre de jours travaillés (22 jours). 
              Cette métrique est importante car elle permet d'évaluer votre <span className="font-bold text-[#9F8170]">régularité</span> et 
              votre <span className="font-bold text-blue-600">productivité quotidienne</span>. Plus cette moyenne est élevée et stable, 
              plus vous optimisez votre temps de travail.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <motion.div
              className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-3 border-2 border-indigo-200"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <p className="text-xs text-gray-600 font-semibold">Meilleur</p>
              </div>
              <p className="text-2xl font-bold text-indigo-600">43</p>
              <p className="text-xs text-gray-500 mt-1">Sam 15 Fév</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-3 border-2 border-blue-200"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-600 font-semibold">Moyenne</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">18</p>
              <p className="text-xs text-gray-500 mt-1">par jour</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-3 border-2 border-orange-200"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <p className="text-xs text-gray-600 font-semibold">Minimum</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">5</p>
              <p className="text-xs text-gray-500 mt-1">Dim 23 Fév</p>
            </motion.div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-5 border-2 border-gray-200 space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#9F8170]" />
              Performance par jour de la semaine
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs font-semibold text-gray-600 w-12">Lundi</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 ml-3 w-8 text-right">12</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs font-semibold text-gray-600 w-12">Mardi</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '83%' }}></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 ml-3 w-8 text-right">15</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs font-semibold text-gray-600 w-12">Mercredi</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-600 ml-3 w-8 text-right">18</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs font-semibold text-gray-600 w-12">Jeudi</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 ml-3 w-8 text-right">14</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs font-semibold text-gray-600 w-12">Vendredi</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-600 ml-3 w-8 text-right">22</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs font-semibold text-gray-600 w-12">Samedi</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-600 ml-3 w-8 text-right">28</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs font-semibold text-gray-600 w-12">Dimanche</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-400 ml-3 w-8 text-right">0</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white rounded-3xl p-5 border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-gray-900">Conseils pour améliorer</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span><span className="font-bold">Concentrez-vous sur les samedis :</span> C'est votre meilleur jour (28 identifications)</span>
              </p>
              <p className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span><span className="font-bold">Optimisez les lundis et jeudis :</span> Potentiel d'amélioration de +40%</span>
              </p>
              <p className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span><span className="font-bold">Objectif :</span> Atteindre 20 identifications/jour pour le mois prochain</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Actions disponibles</p>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={onDownload}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-[#9F8170] to-[#B39485] text-white border-2 border-[#9F8170] shadow-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5" />
                <span>PDF</span>
              </motion.button>

              <motion.button
                onClick={() => onShare('print')}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-white text-gray-700 border-2 border-gray-300 hover:border-[#9F8170]"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Printer className="w-5 h-5" />
                <span>Imprimer</span>
              </motion.button>
            </div>

            <div className="pt-2 border-t-2 border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-3">Partager via</p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => onShare('whatsapp')}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-[#25D366] text-white border-2 border-[#25D366] shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </motion.button>

                <motion.button
                  onClick={() => onShare('email')}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-blue-600 text-white border-2 border-blue-600 shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}