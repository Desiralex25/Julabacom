import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  FileText,
  Search,
  Filter,
  ChevronDown,
  TrendingUp,
  Calendar,
  Download,
  Send,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Activity,
  BarChart3,
  Target,
  Award,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Navigation } from '../layout/Navigation';
import { useApp } from '../../contexts/AppContext';
import { NotificationButton } from '../marchand/NotificationButton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Types de rapport
const typeRapportOptions = [
  { id: 'tous', label: 'Tous les rapports' },
  { id: 'hebdomadaire', label: 'Hebdomadaire' },
  { id: 'mensuel', label: 'Mensuel' },
  { id: 'special', label: 'Spécial' },
];

// Statut de rapport
const statutOptions = [
  { id: 'tous', label: 'Tous les statuts' },
  { id: 'brouillon', label: 'Brouillon' },
  { id: 'soumis', label: 'Soumis' },
  { id: 'approuve', label: 'Approuvé' },
];

// Données mockées pour les graphiques de performance
const performanceHebdo = [
  { jour: 'Lun', identifications: 12, objectif: 15 },
  { jour: 'Mar', identifications: 18, objectif: 15 },
  { jour: 'Mer', identifications: 15, objectif: 15 },
  { jour: 'Jeu', identifications: 22, objectif: 15 },
  { jour: 'Ven', identifications: 20, objectif: 15 },
  { jour: 'Sam', identifications: 14, objectif: 15 },
  { jour: 'Dim', identifications: 8, objectif: 15 },
];

const performanceMensuelle = [
  { semaine: 'S1', identifications: 87, objectif: 80 },
  { semaine: 'S2', identifications: 94, objectif: 80 },
  { semaine: 'S3', identifications: 109, objectif: 80 },
  { semaine: 'S4', identifications: 102, objectif: 80 },
];

// Données mockées des rapports
const mockRapports = [
  {
    id: '1',
    titre: 'Rapport Hebdomadaire S8 2026',
    type: 'hebdomadaire',
    periode: 'Du 17/02 au 23/02/2026',
    dateCreation: '2026-02-23T18:00:00',
    dateSoumission: '2026-02-23T18:30:00',
    statut: 'soumis',
    identificationsTotal: 109,
    objectif: 80,
    tauxReussite: 136,
    observations: 'Excellente semaine, objectifs largement dépassés. Zone Yopougon particulièrement productive.',
  },
  {
    id: '2',
    titre: 'Rapport Mensuel Février 2026',
    type: 'mensuel',
    periode: 'Février 2026',
    dateCreation: '2026-02-28T16:00:00',
    dateSoumission: null,
    statut: 'brouillon',
    identificationsTotal: 392,
    objectif: 320,
    tauxReussite: 122,
    observations: '',
  },
  {
    id: '3',
    titre: 'Rapport Spécial - Opération Marchés',
    type: 'special',
    periode: 'Opération du 15-20/02/2026',
    dateCreation: '2026-02-20T14:00:00',
    dateSoumission: '2026-02-20T17:00:00',
    statut: 'approuve',
    identificationsTotal: 67,
    objectif: 50,
    tauxReussite: 134,
    observations: 'Opération ciblée sur les nouveaux marchés. Résultats satisfaisants.',
  },
  {
    id: '4',
    titre: 'Rapport Hebdomadaire S7 2026',
    type: 'hebdomadaire',
    periode: 'Du 10/02 au 16/02/2026',
    dateCreation: '2026-02-16T18:00:00',
    dateSoumission: '2026-02-16T18:45:00',
    statut: 'approuve',
    identificationsTotal: 94,
    objectif: 80,
    tauxReussite: 117,
    observations: 'Bonne performance, légère augmentation par rapport à S6.',
  },
  {
    id: '5',
    titre: 'Rapport Hebdomadaire S6 2026',
    type: 'hebdomadaire',
    periode: 'Du 03/02 au 09/02/2026',
    dateCreation: '2026-02-09T18:00:00',
    dateSoumission: '2026-02-09T19:00:00',
    statut: 'approuve',
    identificationsTotal: 87,
    objectif: 80,
    tauxReussite: 108,
    observations: 'Objectifs atteints, performance stable.',
  },
];

export function Rapports() {
  const navigate = useNavigate();
  const { speak, isOnline } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('tous');
  const [selectedStatut, setSelectedStatut] = useState('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'rapports' | 'performance'>('rapports');

  // Filtrer les rapports
  const filteredRapports = useMemo(() => {
    return mockRapports.filter((rapport) => {
      const matchSearch =
        searchQuery === '' ||
        rapport.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rapport.periode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedType === 'tous' || rapport.type === selectedType;

      const matchStatut = selectedStatut === 'tous' || rapport.statut === selectedStatut;

      return matchSearch && matchType && matchStatut;
    });
  }, [searchQuery, selectedType, selectedStatut]);

  // Stats personnelles
  const statsPersonnelles = {
    totalIdentifications: 392,
    objectifMois: 320,
    tauxReussite: 122,
    rapportsSoumis: 12,
    rapportsApprouves: 11,
    moyenne7jours: 18,
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('tous');
    setSelectedStatut('tous');
    speak('Filtres réinitialisés');
  };

  const handleRapportClick = (rapportId: string) => {
    setSelectedRapport(selectedRapport === rapportId ? null : rapportId);
    speak('Détails du rapport');
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'approuve':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-700',
          icon: CheckCircle,
        };
      case 'soumis':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-700',
          icon: Send,
        };
      case 'brouillon':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: Clock,
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: FileText,
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header fixe */}
      <div className="sticky top-0 z-40 bg-white shadow-sm pt-6">
        <div className="flex items-center gap-4 px-6 py-4">
          <motion.button
            onClick={() => navigate('/identificateur')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(159, 129, 112, 0.1)' }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#9F8170' }} />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#9F8170' }}>
              Rapports
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Mes rapports et statistiques de performance
            </p>
          </div>

          {/* Bouton Notifications */}
          <NotificationButton />

          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs font-medium text-gray-600">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>

        {/* KPIs rapides */}
        <div className="grid grid-cols-3 gap-3 px-6 pb-4">
          <motion.div
            className="p-3 rounded-2xl border border-gray-200"
            style={{ backgroundColor: '#F5F0ED' }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4" style={{ color: '#9F8170' }} />
              <p className="text-xs font-semibold text-gray-600">Ce mois</p>
            </div>
            <p className="text-lg font-bold" style={{ color: '#9F8170' }}>
              {statsPersonnelles.totalIdentifications}
            </p>
          </motion.div>

          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-gray-600">Objectif</p>
            </div>
            <p className="text-lg font-bold text-green-700">
              {statsPersonnelles.tauxReussite}%
            </p>
          </motion.div>

          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-semibold text-gray-600">Moyenne/jour</p>
            </div>
            <p className="text-lg font-bold text-blue-700">
              {statsPersonnelles.moyenne7jours}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-6 py-4">
        {/* Onglets de vue */}
        <motion.div
          className="mb-4 flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={() => {
              setActiveView('rapports');
              speak('Vue rapports');
            }}
            className={`flex-1 px-4 py-3 rounded-2xl font-semibold transition-all ${
              activeView === 'rapports'
                ? 'text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-gray-700'
            }`}
            style={activeView === 'rapports' ? { backgroundColor: '#9F8170' } : {}}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText className="w-4 h-4 mx-auto mb-1" />
            Rapports
          </motion.button>
          <motion.button
            onClick={() => {
              setActiveView('performance');
              speak('Vue performance');
            }}
            className={`flex-1 px-4 py-3 rounded-2xl font-semibold transition-all ${
              activeView === 'performance'
                ? 'text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-gray-700'
            }`}
            style={activeView === 'performance' ? { backgroundColor: '#9F8170' } : {}}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BarChart3 className="w-4 h-4 mx-auto mb-1" />
            Performance
          </motion.button>
        </motion.div>

        {/* Contenu selon la vue active */}
        <AnimatePresence mode="wait">
          {activeView === 'rapports' && (
            <motion.div
              key="rapports"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Barre de recherche */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un rapport..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none transition-colors"
                  />
                </div>
              </motion.div>

              {/* Bouton filtres */}
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full mb-4 flex items-center justify-between px-4 py-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#9F8170] transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5" style={{ color: '#9F8170' }} />
                  <span className="font-semibold text-gray-700">Filtres avancés</span>
                </div>
                <motion.div
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </motion.button>

              {/* Panel de filtres */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="p-4 rounded-2xl bg-white border-2 border-gray-200 space-y-3">
                      {/* Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Type de rapport
                        </label>
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                        >
                          {typeRapportOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Statut */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Statut
                        </label>
                        <select
                          value={selectedStatut}
                          onChange={(e) => setSelectedStatut(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                        >
                          {statutOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Boutons actions */}
                      <div className="flex gap-2 pt-2">
                        <motion.button
                          onClick={resetFilters}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Réinitialiser
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            setShowFilters(false);
                            speak('Filtres appliqués');
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold"
                          style={{ backgroundColor: '#9F8170' }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Appliquer
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Liste des rapports */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredRapports.map((rapport, index) => {
                    const statutBadge = getStatutBadge(rapport.statut);
                    const isExpanded = selectedRapport === rapport.id;

                    return (
                      <motion.div
                        key={rapport.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden"
                      >
                        {/* Card principale */}
                        <motion.div
                          className="p-4"
                          onClick={() => handleRapportClick(rapport.id)}
                          style={{ backgroundColor: '#ffffff' }}
                          whileHover={{ backgroundColor: '#FAFAFA' }}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: 'rgba(159, 129, 112, 0.1)' }}
                            >
                              <FileText className="w-7 h-7" style={{ color: '#9F8170' }} />
                            </div>

                            {/* Infos principales */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-900 text-base truncate">
                                    {rapport.titre}
                                  </h3>
                                  <p className="text-sm text-gray-600">{rapport.periode}</p>
                                </div>
                                <div
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 flex-shrink-0 ${statutBadge.bg} ${statutBadge.border}`}
                                >
                                  <statutBadge.icon className={`w-3 h-3 ${statutBadge.text}`} />
                                  <span
                                    className={`text-xs font-bold ${statutBadge.text} capitalize`}
                                  >
                                    {rapport.statut.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>

                              {/* Mini stats */}
                              <div className="grid grid-cols-3 gap-2 mt-3">
                                <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                                  <p className="text-xs text-gray-600 mb-0.5">Identifications</p>
                                  <p className="text-sm font-bold" style={{ color: '#9F8170' }}>
                                    {rapport.identificationsTotal}
                                  </p>
                                </div>
                                <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                                  <p className="text-xs text-gray-600 mb-0.5">Objectif</p>
                                  <p className="text-sm font-bold text-blue-600">
                                    {rapport.objectif}
                                  </p>
                                </div>
                                <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                                  <p className="text-xs text-gray-600 mb-0.5">Taux</p>
                                  <p className="text-sm font-bold text-green-600">
                                    {rapport.tauxReussite}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Détails étendus */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t-2 border-gray-200 overflow-hidden"
                            >
                              <div className="p-4 space-y-3 bg-gray-50">
                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 rounded-xl bg-white border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Calendar className="w-4 h-4 text-gray-500" />
                                      <p className="text-xs font-semibold text-gray-600">
                                        Créé le
                                      </p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">
                                      {new Date(rapport.dateCreation).toLocaleDateString('fr-FR')}
                                    </p>
                                  </div>
                                  {rapport.dateSoumission && (
                                    <div className="p-3 rounded-xl bg-white border border-gray-200">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Send className="w-4 h-4 text-gray-500" />
                                        <p className="text-xs font-semibold text-gray-600">
                                          Soumis le
                                        </p>
                                      </div>
                                      <p className="text-sm font-bold text-gray-900">
                                        {new Date(rapport.dateSoumission).toLocaleDateString(
                                          'fr-FR'
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Observations */}
                                {rapport.observations && (
                                  <div className="p-3 rounded-xl bg-white border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">
                                      Observations
                                    </p>
                                    <p className="text-sm text-gray-700">{rapport.observations}</p>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <motion.button
                                    onClick={() => speak('Télécharger le rapport')}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold border-2 border-gray-200"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Download className="w-4 h-4" />
                                    Télécharger
                                  </motion.button>
                                  <motion.button
                                    onClick={() => speak('Voir le rapport complet')}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold"
                                    style={{ backgroundColor: '#9F8170' }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Eye className="w-4 h-4" />
                                    Voir détails
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredRapports.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-600">Aucun rapport trouvé</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Essayez de modifier vos critères de recherche
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeView === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Stats de performance */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Performance hebdomadaire</h3>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="h-64 min-h-[256px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceHebdo}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="jour" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="identifications" fill="#9F8170" name="Identifications" />
                      <Bar dataKey="objectif" fill="#10B981" name="Objectif" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Évolution mensuelle */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Évolution mensuelle</h3>
                  <Activity className="w-5 h-5" style={{ color: '#9F8170' }} />
                </div>
                <div className="h-64 min-h-[256px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceMensuelle}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="semaine" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="identifications"
                        stroke="#9F8170"
                        strokeWidth={3}
                        name="Identifications"
                      />
                      <Line
                        type="monotone"
                        dataKey="objectif"
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Objectif"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Accomplissements</h3>
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="space-y-3">
                  <motion.div
                    className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Top Performer</p>
                        <p className="text-sm text-gray-600">
                          Objectif dépassé 4 semaines consécutives
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Régularité</p>
                        <p className="text-sm text-gray-600">
                          100% de présence ce mois
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Précision</p>
                        <p className="text-sm text-gray-600">
                          98% de dossiers validés du premier coup
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton nouveau rapport (visible uniquement sur vue rapports) */}
        {activeView === 'rapports' && (
          <motion.button
            onClick={() => speak('Créer un nouveau rapport')}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-bold shadow-lg"
            style={{ backgroundColor: '#9F8170' }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(159, 129, 112, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FileText className="w-5 h-5" />
            Créer un nouveau rapport
          </motion.button>
        )}
      </div>

      <Navigation role="identificateur" />
    </div>
  );
}