import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft,
  FileText,
  TrendingUp,
  Calendar,
  Target,
  Users,
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  Clock,
  Send,
  Award,
  Zap,
  TrendingDown,
  Download,
  Share2,
  X,
  Mail,
  MessageCircle,
  Printer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'sonner';
import { Navigation } from '../layout/Navigation';
import { NotificationButton } from '../marchand/NotificationButton';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { KpiMoisModal, KpiObjectifModal, KpiMoyenneModal } from './KpiModals';

const PRIMARY_COLOR = '#9F8170';

// Données mock des rapports
const mockRapports = [
  {
    id: 1,
    titre: 'Rapport Hebdomadaire Mars',
    periode: 'Du 17/02 au 23/02/2026',
    identifications: 109,
    objectif: 80,
    taux: 136,
    statut: 'soumis' as const,
  },
  {
    id: 2,
    titre: 'Rapport Mensuel Février',
    periode: 'Février 2026',
    identifications: 392,
    objectif: 320,
    taux: 122,
    statut: 'brouillon' as const,
  },
  {
    id: 3,
    titre: 'Rapport Spécial - Opération 15-20',
    periode: 'Opération du 15-20/02/2026',
    identifications: 87,
    objectif: 100,
    taux: 87,
    statut: 'approuve' as const,
  },
];

// Données pour les graphiques de performance
const performanceData = [
  { mois: 'Oct', identifications: 245, objectif: 250, taux: 98 },
  { mois: 'Nov', identifications: 312, objectif: 280, taux: 111 },
  { mois: 'Dec', identifications: 298, objectif: 300, taux: 99 },
  { mois: 'Jan', identifications: 378, objectif: 320, taux: 118 },
  { mois: 'Fev', identifications: 392, objectif: 320, taux: 122 },
  { mois: 'Mar', identifications: 187, objectif: 320, taux: 58 },
];

const weeklyData = [
  { jour: 'Lun', marchands: 12, producteurs: 8 },
  { jour: 'Mar', marchands: 15, producteurs: 6 },
  { jour: 'Mer', marchands: 18, producteurs: 10 },
  { jour: 'Jeu', marchands: 14, producteurs: 7 },
  { jour: 'Ven', marchands: 22, producteurs: 12 },
  { jour: 'Sam', marchands: 28, producteurs: 15 },
  { jour: 'Dim', marchands: 0, producteurs: 0 },
];

const repartitionData = [
  { name: 'Marchands', value: 287, color: '#C66A2C' },
  { name: 'Producteurs', value: 105, color: '#16A34A' },
];

const topZonesData = [
  { zone: 'Adjamé', total: 87, progression: '+12%' },
  { zone: 'Yopougon', total: 64, progression: '+8%' },
  { zone: 'Abobo', total: 52, progression: '+15%' },
  { zone: 'Cocody', total: 48, progression: '+5%' },
  { zone: 'Plateau', total: 41, progression: '-3%' },
];

export function RapportsIdentificateur() {
  const navigate = useNavigate();
  const { speak } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'rapports' | 'performance'>('rapports');
  const [selectedRapport, setSelectedRapport] = useState<typeof mockRapports[0] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showRepartitionModal, setShowRepartitionModal] = useState(false);
  const [showTopZonesModal, setShowTopZonesModal] = useState(false);
  const [showBestDayModal, setShowBestDayModal] = useState(false);
  const [showSuccessRateModal, setShowSuccessRateModal] = useState(false);
  const [showKpiMoisModal, setShowKpiMoisModal] = useState(false);
  const [showKpiObjectifModal, setShowKpiObjectifModal] = useState(false);
  const [showKpiMoyenneModal, setShowKpiMoyenneModal] = useState(false);

  const handleDownload = (rapport: typeof mockRapports[0]) => {
    speak('Téléchargement du rapport en PDF');
    toast.success(`Téléchargement de ${rapport.titre} en cours...`);
    // Logique de téléchargement PDF ici
  };

  const handleShare = (platform: 'whatsapp' | 'email' | 'print') => {
    if (platform === 'whatsapp') {
      speak('Partage via WhatsApp');
      toast.success('Ouverture de WhatsApp...');
    } else if (platform === 'email') {
      speak('Partage par email');
      toast.success('Ouverture de votre application email...');
    } else if (platform === 'print') {
      speak('Impression du rapport');
      toast.success('Impression en cours...');
      window.print();
    }
  };

  return (
    <>
      {/* Header fixe */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-[#F5F0ED]"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            {/* Bouton retour + Titre */}
            <div className="flex items-center gap-3 flex-1">
              <motion.button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </motion.button>
              <div>
                <h1 className="font-bold text-gray-900 text-xl sm:text-2xl">Rapports</h1>
                <p className="text-xs sm:text-sm text-gray-600">Mes rapports et statistiques de performance</p>
              </div>
            </div>

            {/* Bouton Notifications */}
            <NotificationButton />
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="pt-28 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-[#F5F0ED] to-white">
        
        {/* KPIs - Stats de performance */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* KPI 1: Ce mois */}
          <motion.div
            className="bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-3xl p-3 shadow-md border-2 border-amber-200 cursor-pointer hover:border-amber-400 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              speak('Détails des identifications du mois');
              setShowKpiMoisModal(true);
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Ce mois</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Users className="w-5 h-5 text-amber-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-amber-600"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              392
            </motion.p>
          </motion.div>

          {/* KPI 2: Objectif */}
          <motion.div
            className="bg-gradient-to-br from-green-50 via-white to-green-50 rounded-3xl p-3 shadow-md border-2 border-green-200 cursor-pointer hover:border-green-400 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              speak('Détails de l\'atteinte des objectifs');
              setShowKpiObjectifModal(true);
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Objectif</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Target className="w-5 h-5 text-green-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-green-600"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              122%
            </motion.p>
          </motion.div>

          {/* KPI 3: Moyenne/jour */}
          <motion.div
            className="bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl p-3 shadow-md border-2 border-blue-200 cursor-pointer hover:border-blue-400 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              speak('Détails de la moyenne journalière');
              setShowKpiMoyenneModal(true);
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Moy/jour</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-blue-600"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              18
            </motion.p>
          </motion.div>
        </div>

        {/* Tabs - Rapports / Performance */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={() => {
              setSelectedTab('rapports');
              speak('Rapports');
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold transition-all ${
              selectedTab === 'rapports'
                ? 'bg-gradient-to-r from-[#9F8170] to-[#B39485] text-white border-2 border-[#9F8170] shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#9F8170]'
            }`}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText className="w-5 h-5" />
            <span>Rapports</span>
          </motion.button>

          <motion.button
            onClick={() => {
              setSelectedTab('performance');
              speak('Performance');
              toast('Statistiques détaillées de performance');
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold transition-all ${
              selectedTab === 'performance'
                ? 'bg-gradient-to-r from-[#9F8170] to-[#B39485] text-white border-2 border-[#9F8170] shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#9F8170]'
            }`}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Performance</span>
          </motion.button>
        </motion.div>

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
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none text-base placeholder:text-gray-400 shadow-sm"
            />
          </div>
        </motion.div>

        {/* Bouton Filtres avancés */}
        <motion.button
          onClick={() => {
            setShowFilters(!showFilters);
            speak(showFilters ? 'Masquer les filtres' : 'Afficher les filtres avancés');
          }}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#9F8170] transition-colors mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-700">Filtres avancés</span>
          </div>
          <motion.div
            animate={{ rotate: showFilters ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </motion.button>

        {/* Contenu conditionnel selon l'onglet */}
        <AnimatePresence mode="wait">
          {selectedTab === 'rapports' ? (
            <motion.div
              key="rapports"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Liste des rapports */}
              <div className="space-y-3">
                {mockRapports.map((rapport, index) => (
                  <motion.div
                    key={rapport.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-200 hover:border-[#9F8170] transition-all cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      speak(`Rapport ${rapport.titre}`);
                      toast(`Ouverture du rapport ${rapport.titre}`);
                      setSelectedRapport(rapport);
                      setShowModal(true);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icône */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9F8170]/10 to-[#B39485]/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-[#9F8170]" />
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-bold text-gray-900 text-sm mb-1">{rapport.titre}</p>
                            <p className="text-xs text-gray-600">{rapport.periode}</p>
                          </div>
                          {/* Badge statut */}
                          <div
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${
                              rapport.statut === 'soumis'
                                ? 'bg-blue-100 text-blue-700'
                                : rapport.statut === 'brouillon'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {rapport.statut === 'soumis' && <Send className="w-3 h-3" />}
                            {rapport.statut === 'brouillon' && <Clock className="w-3 h-3" />}
                            {rapport.statut === 'approuve' && <CheckCircle2 className="w-3 h-3" />}
                            <span>
                              {rapport.statut === 'soumis' ? 'Soumis' : rapport.statut === 'brouillon' ? 'Brouillon' : 'Approuvé'}
                            </span>
                          </div>
                        </div>

                        {/* Stats du rapport */}
                        <div className="flex items-center gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">Identifications</p>
                            <p className="text-sm font-bold text-gray-900">{rapport.identifications}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Objectif</p>
                            <p className="text-sm font-bold text-blue-600">{rapport.objectif}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Taux</p>
                            <p className={`text-sm font-bold ${rapport.taux >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                              {rapport.taux}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Message si aucun résultat */}
              {mockRapports.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-600">Aucun rapport trouvé</p>
                  <p className="text-sm text-gray-500 mt-1">Créez votre premier rapport</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="performance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Section 1: Évolution mensuelle */}
              <motion.div
                className="bg-white rounded-3xl p-4 shadow-md border-2 border-gray-200 cursor-pointer hover:border-[#9F8170] transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  speak('Détails de l\'évolution mensuelle');
                  setShowEvolutionModal(true);
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Évolution sur 6 mois</h3>
                    <p className="text-xs text-gray-600">Identifications vs Objectifs</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorIdentifications" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9F8170" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9F8170" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorObjectif" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="mois" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #E5E7EB', 
                        borderRadius: '12px',
                        fontSize: '12px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="identifications" 
                      stroke="#9F8170" 
                      strokeWidth={3}
                      fill="url(#colorIdentifications)" 
                      name="Identifications"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="objectif" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#colorObjectif)" 
                      name="Objectif"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Section 2: Performance hebdomadaire */}
              <motion.div
                className="bg-white rounded-3xl p-4 shadow-md border-2 border-gray-200 cursor-pointer hover:border-[#9F8170] transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  speak('Détails de la performance hebdomadaire');
                  setShowWeeklyModal(true);
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Cette semaine</h3>
                    <p className="text-xs text-gray-600">Répartition par jour et par type</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="jour" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #E5E7EB', 
                        borderRadius: '12px',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="marchands" fill="#C66A2C" radius={[8, 8, 0, 0]} name="Marchands" />
                    <Bar dataKey="producteurs" fill="#16A34A" radius={[8, 8, 0, 0]} name="Producteurs" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Section 3: Répartition et Top Zones */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Répartition par type */}
                <motion.div
                  className="bg-white rounded-3xl p-4 shadow-md border-2 border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Répartition</h3>
                      <p className="text-xs text-gray-600">Par type d'acteur</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={repartitionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {repartitionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #E5E7EB', 
                          borderRadius: '12px',
                          fontSize: '12px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-6 mt-2">
                    {repartitionData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-600">{item.name}: <span className="font-bold">{item.value}</span></span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Top 5 Zones */}
                <motion.div
                  className="bg-white rounded-3xl p-4 shadow-md border-2 border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Top 5 Zones</h3>
                      <p className="text-xs text-gray-600">Meilleurs territoires</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {topZonesData.map((zone, index) => (
                      <motion.div
                        key={zone.zone}
                        className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{zone.zone}</p>
                            <p className="text-xs text-gray-600">{zone.total} identifications</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                          zone.progression.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {zone.progression.startsWith('+') ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{zone.progression}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Section 4: Stats rapides */}
              <motion.div
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50 rounded-3xl p-4 shadow-md border-2 border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    <p className="text-xs text-gray-600 font-semibold">Meilleur jour</p>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600">Samedi</p>
                  <p className="text-xs text-gray-600 mt-1">43 identifications</p>
                </div>

                <div className="bg-gradient-to-br from-rose-50 via-white to-rose-50 rounded-3xl p-4 shadow-md border-2 border-rose-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-rose-600" />
                    <p className="text-xs text-gray-600 font-semibold">Taux réussite</p>
                  </div>
                  <p className="text-2xl font-bold text-rose-600">94%</p>
                  <p className="text-xs text-gray-600 mt-1">Validations approuvées</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Navigation role="identificateur" />

      {/* Modal de détails du rapport */}
      <AnimatePresence>
        {showModal && selectedRapport && (
          <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center p-0 lg:p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
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
                  <h2 className="font-bold text-gray-900 text-xl">Détails du rapport</h2>
                  <motion.button
                    onClick={() => {
                      setShowModal(false);
                      speak('Fermeture du rapport');
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
                <div className="bg-gradient-to-br from-[#F5F0ED] to-white rounded-3xl p-5 border-2 border-[#9F8170]/20">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9F8170] to-[#B39485] flex items-center justify-center flex-shrink-0 shadow-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{selectedRapport.titre}</h3>
                      <p className="text-sm text-gray-600 mb-3">{selectedRapport.periode}</p>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${
                          selectedRapport.statut === 'soumis'
                            ? 'bg-blue-100 text-blue-700'
                            : selectedRapport.statut === 'brouillon'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {selectedRapport.statut === 'soumis' && <Send className="w-4 h-4" />}
                        {selectedRapport.statut === 'brouillon' && <Clock className="w-4 h-4" />}
                        {selectedRapport.statut === 'approuve' && <CheckCircle2 className="w-4 h-4" />}
                        <span>
                          {selectedRapport.statut === 'soumis' ? 'Soumis le 23/02/2026' : selectedRapport.statut === 'brouillon' ? 'Brouillon en cours' : 'Approuvé le 25/02/2026'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPIs détaillés */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border-2 border-blue-200"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <p className="text-xs text-gray-600 font-semibold">Identifications</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{selectedRapport.identifications}</p>
                    <p className="text-xs text-gray-500 mt-1">acteurs enregistrés</p>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-4 border-2 border-green-200"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <p className="text-xs text-gray-600 font-semibold">Objectif</p>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{selectedRapport.objectif}</p>
                    <p className="text-xs text-gray-500 mt-1">acteurs attendus</p>
                  </motion.div>

                  <motion.div
                    className={`bg-gradient-to-br rounded-2xl p-4 border-2 ${
                      selectedRapport.taux >= 100
                        ? 'from-amber-50 to-white border-amber-200'
                        : 'from-orange-50 to-white border-orange-200'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className={`w-5 h-5 ${selectedRapport.taux >= 100 ? 'text-amber-600' : 'text-orange-600'}`} />
                      <p className="text-xs text-gray-600 font-semibold">Taux</p>
                    </div>
                    <p className={`text-3xl font-bold ${selectedRapport.taux >= 100 ? 'text-amber-600' : 'text-orange-600'}`}>
                      {selectedRapport.taux}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedRapport.taux >= 100 ? 'Objectif dépassé' : 'En progression'}
                    </p>
                  </motion.div>
                </div>

                {/* Détails supplémentaires */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-5 border-2 border-gray-200 space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#9F8170]" />
                    Détails de la période
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Marchands identifiés</p>
                      <p className="text-lg font-bold text-[#C66A2C]">
                        {selectedRapport.id === 1 ? 68 : selectedRapport.id === 2 ? 287 : 64}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Producteurs identifiés</p>
                      <p className="text-lg font-bold text-[#16A34A]">
                        {selectedRapport.id === 1 ? 41 : selectedRapport.id === 2 ? 105 : 23}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Zones couvertes</p>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedRapport.id === 1 ? 5 : selectedRapport.id === 2 ? 12 : 4}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Taux de validation</p>
                      <p className="text-lg font-bold text-purple-600">
                        {selectedRapport.id === 1 ? '91' : selectedRapport.id === 2 ? '94' : '88'}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Actions disponibles</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Télécharger PDF */}
                    <motion.button
                      onClick={() => handleDownload(selectedRapport)}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-[#9F8170] to-[#B39485] text-white border-2 border-[#9F8170] shadow-lg"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-5 h-5" />
                      <span>PDF</span>
                    </motion.button>

                    {/* Imprimer */}
                    <motion.button
                      onClick={() => handleShare('print')}
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
                      {/* WhatsApp */}
                      <motion.button
                        onClick={() => handleShare('whatsapp')}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-[#25D366] text-white border-2 border-[#25D366] shadow-lg"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>WhatsApp</span>
                      </motion.button>

                      {/* Email */}
                      <motion.button
                        onClick={() => handleShare('email')}
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

                {/* Note de bas de page */}
                <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Note :</span> Ce rapport sera automatiquement soumis au superviseur pour validation dans les 48h.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal d'évolution mensuelle */}
      <AnimatePresence>
        {showEvolutionModal && (
          <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center p-0 lg:p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEvolutionModal(false)}
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
                  <h2 className="font-bold text-gray-900 text-xl">Évolution mensuelle</h2>
                  <motion.button
                    onClick={() => {
                      setShowEvolutionModal(false);
                      speak('Fermeture de l\'évolution mensuelle');
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
                <div className="bg-gradient-to-br from-[#F5F0ED] to-white rounded-3xl p-5 border-2 border-[#9F8170]/20">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9F8170] to-[#B39485] flex items-center justify-center flex-shrink-0 shadow-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Évolution sur 6 mois</h3>
                      <p className="text-sm text-gray-600 mb-3">Identifications vs Objectifs</p>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${
                          selectedRapport?.statut === 'soumis'
                            ? 'bg-blue-100 text-blue-700'
                            : selectedRapport?.statut === 'brouillon'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {selectedRapport?.statut === 'soumis' && <Send className="w-4 h-4" />}
                        {selectedRapport?.statut === 'brouillon' && <Clock className="w-4 h-4" />}
                        {selectedRapport?.statut === 'approuve' && <CheckCircle2 className="w-4 h-4" />}
                        <span>
                          {selectedRapport?.statut === 'soumis' ? 'Soumis le 23/02/2026' : selectedRapport?.statut === 'brouillon' ? 'Brouillon en cours' : 'Approuvé le 25/02/2026'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPIs détaillés */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border-2 border-blue-200"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <p className="text-xs text-gray-600 font-semibold">Identifications</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">392</p>
                    <p className="text-xs text-gray-500 mt-1">acteurs enregistrés</p>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-4 border-2 border-green-200"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <p className="text-xs text-gray-600 font-semibold">Objectif</p>
                    </div>
                    <p className="text-3xl font-bold text-green-600">320</p>
                    <p className="text-xs text-gray-500 mt-1">acteurs attendus</p>
                  </motion.div>

                  <motion.div
                    className={`bg-gradient-to-br rounded-2xl p-4 border-2 ${
                      122 >= 100
                        ? 'from-amber-50 to-white border-amber-200'
                        : 'from-orange-50 to-white border-orange-200'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className={`w-5 h-5 ${122 >= 100 ? 'text-amber-600' : 'text-orange-600'}`} />
                      <p className="text-xs text-gray-600 font-semibold">Taux</p>
                    </div>
                    <p className={`text-3xl font-bold ${122 >= 100 ? 'text-amber-600' : 'text-orange-600'}`}>
                      122%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {122 >= 100 ? 'Objectif dépassé' : 'En progression'}
                    </p>
                  </motion.div>
                </div>

                {/* Détails supplémentaires */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-5 border-2 border-gray-200 space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#9F8170]" />
                    Détails de la période
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Marchands identifiés</p>
                      <p className="text-lg font-bold text-[#C66A2C]">
                        287
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Producteurs identifiés</p>
                      <p className="text-lg font-bold text-[#16A34A]">
                        105
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Zones couvertes</p>
                      <p className="text-lg font-bold text-blue-600">
                        12
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Commissions gagnées</p>
                      <p className="text-lg font-bold text-purple-600">
                        78 400 FCFA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Actions disponibles</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Télécharger PDF */}
                    <motion.button
                      onClick={() => handleDownload(selectedRapport!)}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-[#9F8170] to-[#B39485] text-white border-2 border-[#9F8170] shadow-lg"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-5 h-5" />
                      <span>PDF</span>
                    </motion.button>

                    {/* Imprimer */}
                    <motion.button
                      onClick={() => handleShare('print')}
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
                      {/* WhatsApp */}
                      <motion.button
                        onClick={() => handleShare('whatsapp')}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-[#25D366] text-white border-2 border-[#25D366] shadow-lg"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>WhatsApp</span>
                      </motion.button>

                      {/* Email */}
                      <motion.button
                        onClick={() => handleShare('email')}
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

                {/* Note de bas de page */}
                <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Note :</span> Ce rapport sera automatiquement soumis au superviseur pour validation dans les 48h.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de performance hebdomadaire */}
      <AnimatePresence>
        {showWeeklyModal && (
          <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center p-0 lg:p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWeeklyModal(false)}
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
                  <h2 className="font-bold text-gray-900 text-xl">Performance hebdomadaire</h2>
                  <motion.button
                    onClick={() => {
                      setShowWeeklyModal(false);
                      speak('Fermeture de la performance hebdomadaire');
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
                <div className="bg-gradient-to-br from-[#F5F0ED] to-white rounded-3xl p-5 border-2 border-[#9F8170]/20">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9F8170] to-[#B39485] flex items-center justify-center flex-shrink-0 shadow-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Cette semaine</h3>
                      <p className="text-sm text-gray-600 mb-3">Répartition par jour et par type</p>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${
                          selectedRapport?.statut === 'soumis'
                            ? 'bg-blue-100 text-blue-700'
                            : selectedRapport?.statut === 'brouillon'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {selectedRapport?.statut === 'soumis' && <Send className="w-4 h-4" />}
                        {selectedRapport?.statut === 'brouillon' && <Clock className="w-4 h-4" />}
                        {selectedRapport?.statut === 'approuve' && <CheckCircle2 className="w-4 h-4" />}
                        <span>
                          {selectedRapport?.statut === 'soumis' ? 'Soumis le 23/02/2026' : selectedRapport?.statut === 'brouillon' ? 'Brouillon en cours' : 'Approuvé le 25/02/2026'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPIs détaillés */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border-2 border-blue-200"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <p className="text-xs text-gray-600 font-semibold">Identifications</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">392</p>
                    <p className="text-xs text-gray-500 mt-1">acteurs enregistrés</p>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-4 border-2 border-green-200"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <p className="text-xs text-gray-600 font-semibold">Objectif</p>
                    </div>
                    <p className="text-3xl font-bold text-green-600">320</p>
                    <p className="text-xs text-gray-500 mt-1">acteurs attendus</p>
                  </motion.div>

                  <motion.div
                    className={`bg-gradient-to-br rounded-2xl p-4 border-2 ${
                      122 >= 100
                        ? 'from-amber-50 to-white border-amber-200'
                        : 'from-orange-50 to-white border-orange-200'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className={`w-5 h-5 ${122 >= 100 ? 'text-amber-600' : 'text-orange-600'}`} />
                      <p className="text-xs text-gray-600 font-semibold">Taux</p>
                    </div>
                    <p className={`text-3xl font-bold ${122 >= 100 ? 'text-amber-600' : 'text-orange-600'}`}>
                      122%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {122 >= 100 ? 'Objectif dépassé' : 'En progression'}
                    </p>
                  </motion.div>
                </div>

                {/* Détails supplémentaires */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-5 border-2 border-gray-200 space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#9F8170]" />
                    Détails de la période
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Marchands identifiés</p>
                      <p className="text-lg font-bold text-[#C66A2C]">
                        287
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Producteurs identifiés</p>
                      <p className="text-lg font-bold text-[#16A34A]">
                        105
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Zones couvertes</p>
                      <p className="text-lg font-bold text-blue-600">
                        12
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Commissions gagnées</p>
                      <p className="text-lg font-bold text-purple-600">
                        78 400 FCFA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Actions disponibles</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Télécharger PDF */}
                    <motion.button
                      onClick={() => handleDownload(selectedRapport!)}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-[#9F8170] to-[#B39485] text-white border-2 border-[#9F8170] shadow-lg"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-5 h-5" />
                      <span>PDF</span>
                    </motion.button>

                    {/* Imprimer */}
                    <motion.button
                      onClick={() => handleShare('print')}
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
                      {/* WhatsApp */}
                      <motion.button
                        onClick={() => handleShare('whatsapp')}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold bg-[#25D366] text-white border-2 border-[#25D366] shadow-lg"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>WhatsApp</span>
                      </motion.button>

                      {/* Email */}
                      <motion.button
                        onClick={() => handleShare('email')}
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

                {/* Note de bas de page */}
                <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Note :</span> Ce rapport sera automatiquement soumis au superviseur pour validation dans les 48h.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals KPI */}
      <AnimatePresence>
        <KpiMoisModal
          show={showKpiMoisModal}
          onClose={() => setShowKpiMoisModal(false)}
          onDownload={() => {
            speak('Téléchargement du rapport KPI Mois');
            toast.success('Téléchargement du rapport en cours...');
          }}
          onShare={handleShare}
        />
      </AnimatePresence>

      <AnimatePresence>
        <KpiObjectifModal
          show={showKpiObjectifModal}
          onClose={() => setShowKpiObjectifModal(false)}
          onDownload={() => {
            speak('Téléchargement du rapport Objectif');
            toast.success('Téléchargement du rapport en cours...');
          }}
          onShare={handleShare}
        />
      </AnimatePresence>

      <AnimatePresence>
        <KpiMoyenneModal
          show={showKpiMoyenneModal}
          onClose={() => setShowKpiMoyenneModal(false)}
          onDownload={() => {
            speak('Téléchargement du rapport Moyenne');
            toast.success('Téléchargement du rapport en cours...');
          }}
          onShare={handleShare}
        />
      </AnimatePresence>
    </>
  );
}