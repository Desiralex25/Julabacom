import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  Star,
  Mail,
  MoreVertical,
  UserCheck,
  UserX,
  Edit3,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Navigation } from '../layout/Navigation';
import { useApp } from '../../contexts/AppContext';
import { NotificationButton } from '../marchand/NotificationButton';

// Types d'acteurs avec leurs couleurs
const acteursTypes = [
  { id: 'tous', label: 'Tous', color: '#6B7280', count: 1248 },
  { id: 'marchands', label: 'Marchands', color: '#C66A2C', count: 546 },
  { id: 'producteurs', label: 'Producteurs', color: '#2E8B57', count: 428 },
  { id: 'cooperatives', label: 'Coopératives', color: '#2072AF', count: 98 },
  { id: 'identificateurs', label: 'Identificateurs', color: '#9F8170', count: 176 },
];

const statutOptions = [
  { id: 'tous', label: 'Tous les statuts' },
  { id: 'actif', label: 'Actif' },
  { id: 'inactif', label: 'Inactif' },
  { id: 'suspendu', label: 'Suspendu' },
  { id: 'en_attente', label: 'En attente de validation' },
];

const regionOptions = [
  'Toutes les régions',
  'Abidjan',
  'Bouaké',
  'Yamoussoukro',
  'San-Pedro',
  'Korhogo',
  'Daloa',
  'Man',
];

// Données mockées des acteurs
const mockActeurs = [
  {
    id: '1',
    type: 'marchands',
    nom: 'KOUASSI',
    prenoms: 'Amani Jean',
    numero: 'MRC-2024-0001',
    telephone: '+225 07 12 34 56 78',
    localisation: 'Marché de Cocody',
    region: 'Abidjan',
    statut: 'actif',
    dateInscription: '2024-01-15',
    scoreCredit: 845,
    totalTransactions: 342,
    volumeTransactions: 12500000,
    photo: null,
  },
  {
    id: '2',
    type: 'producteurs',
    nom: 'DIABATÉ',
    prenoms: 'Fatoumata',
    numero: 'PRD-2024-0012',
    telephone: '+225 05 98 76 54 32',
    localisation: 'Bouaké Nord',
    region: 'Bouaké',
    statut: 'actif',
    dateInscription: '2024-01-20',
    scoreCredit: 782,
    totalTransactions: 128,
    volumeTransactions: 8400000,
    photo: null,
  },
  {
    id: '3',
    type: 'cooperatives',
    nom: 'COOP ESPOIR',
    prenoms: 'Directeur: KOFFI',
    numero: 'COP-2024-0003',
    telephone: '+225 01 45 67 89 23',
    localisation: 'Yamoussoukro',
    region: 'Yamoussoukro',
    statut: 'actif',
    dateInscription: '2024-02-05',
    scoreCredit: 920,
    totalTransactions: 856,
    volumeTransactions: 45000000,
    photo: null,
  },
  {
    id: '4',
    type: 'identificateurs',
    nom: 'TOURÉ',
    prenoms: 'Ibrahim',
    numero: 'IDT-2024-0008',
    telephone: '+225 07 23 45 67 89',
    localisation: 'San-Pedro Centre',
    region: 'San-Pedro',
    statut: 'actif',
    dateInscription: '2024-01-28',
    scoreCredit: 695,
    totalTransactions: 245,
    volumeTransactions: 0,
    photo: null,
  },
  {
    id: '5',
    type: 'marchands',
    nom: 'YAO',
    prenoms: 'Adjoua Marie',
    numero: 'MRC-2024-0015',
    telephone: '+225 05 34 56 78 90',
    localisation: 'Marché d\'Abobo',
    region: 'Abidjan',
    statut: 'suspendu',
    dateInscription: '2024-02-10',
    scoreCredit: 456,
    totalTransactions: 89,
    volumeTransactions: 2300000,
    photo: null,
  },
  {
    id: '6',
    type: 'producteurs',
    nom: 'COULIBALY',
    prenoms: 'Seydou',
    numero: 'PRD-2024-0022',
    telephone: '+225 01 67 89 12 34',
    localisation: 'Korhogo Sud',
    region: 'Korhogo',
    statut: 'en_attente',
    dateInscription: '2024-02-25',
    scoreCredit: 0,
    totalTransactions: 0,
    volumeTransactions: 0,
    photo: null,
  },
  {
    id: '7',
    type: 'cooperatives',
    nom: 'COOP SOLIDARITÉ',
    prenoms: 'Directrice: BAMBA',
    numero: 'COP-2024-0005',
    telephone: '+225 07 89 12 34 56',
    localisation: 'Daloa',
    region: 'Daloa',
    statut: 'actif',
    dateInscription: '2024-02-18',
    scoreCredit: 876,
    totalTransactions: 654,
    volumeTransactions: 38000000,
    photo: null,
  },
  {
    id: '8',
    type: 'identificateurs',
    nom: 'KONÉ',
    prenoms: 'Aminata',
    numero: 'IDT-2024-0014',
    telephone: '+225 05 12 34 56 78',
    localisation: 'Man',
    region: 'Man',
    statut: 'actif',
    dateInscription: '2024-02-12',
    scoreCredit: 734,
    totalTransactions: 312,
    volumeTransactions: 0,
    photo: null,
  },
];

export function Acteurs() {
  const navigate = useNavigate();
  const { speak, isOnline } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('tous');
  const [selectedStatut, setSelectedStatut] = useState('tous');
  const [selectedRegion, setSelectedRegion] = useState('Toutes les régions');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActeur, setSelectedActeur] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'liste' | 'cards'>('cards');
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

  // Filtrer les acteurs
  const filteredActeurs = useMemo(() => {
    return mockActeurs.filter((acteur) => {
      const matchSearch =
        searchQuery === '' ||
        acteur.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acteur.prenoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acteur.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acteur.telephone.includes(searchQuery);

      const matchType = selectedType === 'tous' || acteur.type === selectedType;

      const matchStatut = selectedStatut === 'tous' || acteur.statut === selectedStatut;

      const matchRegion =
        selectedRegion === 'Toutes les régions' || acteur.region === selectedRegion;

      return matchSearch && matchType && matchStatut && matchRegion;
    });
  }, [searchQuery, selectedType, selectedStatut, selectedRegion]);

  // Stats calculées
  const stats = useMemo(() => {
    const total = filteredActeurs.length;
    const actifs = filteredActeurs.filter((a) => a.statut === 'actif').length;
    const suspendus = filteredActeurs.filter((a) => a.statut === 'suspendu').length;
    const enAttente = filteredActeurs.filter((a) => a.statut === 'en_attente').length;

    return { total, actifs, suspendus, enAttente };
  }, [filteredActeurs]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('tous');
    setSelectedStatut('tous');
    setSelectedRegion('Toutes les régions');
    speak('Filtres réinitialisés');
  };

  const handleActeurClick = (acteurId: string) => {
    setSelectedActeur(selectedActeur === acteurId ? null : acteurId);
    speak('Détails de l\'acteur');
  };

  const handleValidateActeur = (acteurId: string) => {
    speak('Acteur validé');
    setShowActionsMenu(null);
  };

  const handleSuspendActeur = (acteurId: string) => {
    speak('Acteur suspendu');
    setShowActionsMenu(null);
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'actif':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-700',
          icon: CheckCircle,
        };
      case 'suspendu':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-700',
          icon: Ban,
        };
      case 'en_attente':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-300',
          text: 'text-orange-700',
          icon: AlertCircle,
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: XCircle,
        };
    }
  };

  const getTypeColor = (type: string) => {
    const typeConfig = acteursTypes.find((t) => t.id === type);
    return typeConfig?.color || '#6B7280';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header fixe */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-4 px-6 py-4">
          <motion.button
            onClick={() => navigate('/institution')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(113, 40, 100, 0.1)' }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#712864' }} />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#712864' }}>
              Acteurs
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Gestion des utilisateurs de la plateforme
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
        <div className="grid grid-cols-4 gap-3 px-6 pb-4">
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs font-semibold text-gray-600 mb-1">Total</p>
            <p className="text-lg font-bold" style={{ color: '#712864' }}>
              {stats.total}
            </p>
          </motion.div>

          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs font-semibold text-gray-600 mb-1">Actifs</p>
            <p className="text-lg font-bold text-green-700">{stats.actifs}</p>
          </motion.div>

          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs font-semibold text-gray-600 mb-1">Suspendus</p>
            <p className="text-lg font-bold text-red-700">{stats.suspendus}</p>
          </motion.div>

          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs font-semibold text-gray-600 mb-1">En attente</p>
            <p className="text-lg font-bold text-orange-700">{stats.enAttente}</p>
          </motion.div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-6 py-4">
        {/* Filtres par type d'acteur */}
        <motion.div
          className="mb-4 flex gap-2 overflow-x-auto pb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {acteursTypes.map((type) => (
            <motion.button
              key={type.id}
              onClick={() => {
                setSelectedType(type.id);
                speak(type.label);
              }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all border-2 ${
                selectedType === type.id
                  ? 'text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
              style={
                selectedType === type.id
                  ? { backgroundColor: type.color, borderColor: type.color }
                  : {}
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {type.label}
              <span className="ml-2 opacity-80">({type.count})</span>
            </motion.button>
          ))}
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
              placeholder="Rechercher par nom, numéro, téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:border-[#712864] focus:outline-none transition-colors"
            />
          </div>
        </motion.div>

        {/* Bouton filtres */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full mb-4 flex items-center justify-between px-4 py-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#712864] transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" style={{ color: '#712864' }} />
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
                {/* Statut */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={selectedStatut}
                    onChange={(e) => setSelectedStatut(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#712864] focus:outline-none"
                  >
                    {statutOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Région */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Région
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#712864] focus:outline-none"
                  >
                    {regionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
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
                    style={{ backgroundColor: '#712864' }}
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

        {/* Liste des acteurs */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredActeurs.map((acteur, index) => {
              const statutConfig = getStatutBadge(acteur.statut);
              const typeColor = getTypeColor(acteur.type);
              const isExpanded = selectedActeur === acteur.id;

              return (
                <motion.div
                  key={acteur.id}
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
                    onClick={() => handleActeurClick(acteur.id)}
                    whileHover={{ backgroundColor: '#FAFAFA' }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Photo/Avatar */}
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                        style={{
                          backgroundColor: `${typeColor}15`,
                          borderColor: typeColor,
                        }}
                      >
                        <Users className="w-7 h-7" style={{ color: typeColor }} />
                      </div>

                      {/* Infos principales */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base truncate">
                              {acteur.prenoms} {acteur.nom}
                            </h3>
                            <p className="text-sm text-gray-600">{acteur.numero}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 ${statutConfig.bg} ${statutConfig.border}`}
                            >
                              <statutConfig.icon className={`w-3 h-3 ${statutConfig.text}`} />
                              <span className={`text-xs font-bold ${statutConfig.text} capitalize`}>
                                {acteur.statut.replace('_', ' ')}
                              </span>
                            </div>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActionsMenu(
                                  showActionsMenu === acteur.id ? null : acteur.id
                                );
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Infos rapides */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{acteur.telephone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{acteur.localisation}</span>
                          </div>
                        </div>

                        {/* Mini KPIs */}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-0.5">Score</p>
                            <p className="text-sm font-bold" style={{ color: typeColor }}>
                              {acteur.scoreCredit}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-0.5">Transactions</p>
                            <p className="text-sm font-bold text-green-600">
                              {acteur.totalTransactions}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-0.5">Volume</p>
                            <p className="text-sm font-bold text-blue-600">
                              {acteur.volumeTransactions > 0
                                ? `${(acteur.volumeTransactions / 1000000).toFixed(1)}M`
                                : '-'}
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
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-white border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <p className="text-xs font-semibold text-gray-600">
                                  Date d'inscription
                                </p>
                              </div>
                              <p className="text-sm font-bold text-gray-900">
                                {new Date(acteur.dateInscription).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <p className="text-xs font-semibold text-gray-600">Région</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900">{acteur.region}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {acteur.statut === 'en_attente' && (
                              <motion.button
                                onClick={() => handleValidateActeur(acteur.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <UserCheck className="w-4 h-4" />
                                Valider
                              </motion.button>
                            )}
                            {acteur.statut === 'actif' && (
                              <motion.button
                                onClick={() => handleSuspendActeur(acteur.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Ban className="w-4 h-4" />
                                Suspendre
                              </motion.button>
                            )}
                            <motion.button
                              onClick={() => speak('Voir les détails complets')}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold"
                              style={{ backgroundColor: '#712864' }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Eye className="w-4 h-4" />
                              Détails
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Menu actions */}
                  <AnimatePresence>
                    {showActionsMenu === acteur.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-4 mt-2 w-48 bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden z-50"
                      >
                        <button
                          onClick={() => {
                            speak('Éditer l\'acteur');
                            setShowActionsMenu(null);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-semibold text-gray-700">Éditer</span>
                        </button>
                        <button
                          onClick={() => {
                            speak('Voir le profil');
                            setShowActionsMenu(null);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-t border-gray-200"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-semibold text-gray-700">
                            Voir le profil
                          </span>
                        </button>
                        {acteur.statut === 'actif' && (
                          <button
                            onClick={() => handleSuspendActeur(acteur.id)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors border-t border-gray-200"
                          >
                            <Ban className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-semibold text-red-700">Suspendre</span>
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredActeurs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-600">Aucun acteur trouvé</p>
              <p className="text-sm text-gray-500 mt-1">
                Essayez de modifier vos critères de recherche
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <Navigation role="institution" />
    </div>
  );
}
