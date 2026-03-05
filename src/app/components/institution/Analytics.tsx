import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Download,
  ChevronDown,
  MapPin,
  Globe,
  Building2,
  ShoppingCart,
  Wallet,
  Activity,
  TrendingDown,
  Eye,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { NotificationButton } from '../marchand/NotificationButton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Données mockées pour les graphiques
const evolutionInscriptions = [
  { mois: 'Jan', marchands: 45, producteurs: 32, cooperatives: 8, identificateurs: 12 },
  { mois: 'Fév', marchands: 58, producteurs: 41, cooperatives: 11, identificateurs: 15 },
  { mois: 'Mar', marchands: 72, producteurs: 55, cooperatives: 14, identificateurs: 18 },
  { mois: 'Avr', marchands: 89, producteurs: 68, cooperatives: 18, identificateurs: 22 },
  { mois: 'Mai', marchands: 105, producteurs: 82, cooperatives: 23, identificateurs: 28 },
  { mois: 'Jui', marchands: 124, producteurs: 96, cooperatives: 28, identificateurs: 32 },
];

const evolutionTransactions = [
  { mois: 'Jan', montant: 1250000, nombre: 450 },
  { mois: 'Fév', montant: 1580000, nombre: 582 },
  { mois: 'Mar', montant: 1920000, nombre: 715 },
  { mois: 'Avr', montant: 2350000, nombre: 892 },
  { mois: 'Mai', montant: 2780000, nombre: 1045 },
  { mois: 'Jui', montant: 3150000, nombre: 1248 },
];

const volumesParProduit = [
  { produit: 'Riz', volume: 2500, valeur: 1625000 },
  { produit: 'Tomates', volume: 1800, valeur: 630000 },
  { produit: 'Oignons', volume: 1500, valeur: 600000 },
  { produit: 'Ignames', volume: 1200, valeur: 480000 },
  { produit: 'Plantain', volume: 950, valeur: 285000 },
  { produit: 'Autres', volume: 3200, valeur: 1530000 },
];

const repartitionActeurs = [
  { type: 'Marchands', nombre: 546, color: '#C66A2C' },
  { type: 'Producteurs', nombre: 428, color: '#2E8B57' },
  { type: 'Coopératives', nombre: 98, color: '#2072AF' },
  { type: 'Identificateurs', nombre: 176, color: '#9F8170' },
];

const statsParRegion = [
  { region: 'Abidjan', acteurs: 458, transactions: 5642, volume: 12500000 },
  { region: 'Bouaké', acteurs: 234, transactions: 2856, volume: 6800000 },
  { region: 'Yamoussoukro', acteurs: 187, transactions: 2124, volume: 5200000 },
  { region: 'San-Pedro', acteurs: 156, transactions: 1845, volume: 4100000 },
  { region: 'Korhogo', acteurs: 142, transactions: 1654, volume: 3850000 },
  { region: 'Autres', acteurs: 71, transactions: 892, volume: 2150000 },
];

const secteurActivite = [
  { secteur: 'Céréales', valeur: 3250000, croissance: 12.5 },
  { secteur: 'Légumes', valeur: 2850000, croissance: 8.3 },
  { secteur: 'Tubercules', valeur: 2100000, croissance: 15.2 },
  { secteur: 'Fruits', valeur: 1680000, croissance: 6.7 },
  { secteur: 'Épices', valeur: 950000, croissance: 18.9 },
];

export function Analytics() {
  const navigate = useNavigate();
  const { speak, isOnline } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30j');
  const [selectedRegion, setSelectedRegion] = useState('tous');
  const [selectedSector, setSelectedSector] = useState('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<'global' | 'regional' | 'secteur'>('global');

  // Calculs des KPIs globaux
  const totalActeurs = repartitionActeurs.reduce((acc, r) => acc + r.nombre, 0);
  const totalTransactions = 5642;
  const volumeTotal = 34500000;
  const croissanceMoyenne = 12.3;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPeriod('30j');
    setSelectedRegion('tous');
    setSelectedSector('tous');
    speak('Filtres réinitialisés');
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
              Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Vue d'ensemble de la plateforme JULABA
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

        {/* KPIs globaux rapides */}
        <div className="grid grid-cols-4 gap-3 px-6 pb-4">
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4" style={{ color: '#712864' }} />
              <p className="text-xs font-semibold text-gray-600">Total acteurs</p>
            </div>
            <p className="text-lg font-bold" style={{ color: '#712864' }}>
              {totalActeurs.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-gray-600">Transactions</p>
            </div>
            <p className="text-lg font-bold text-green-700">
              {totalTransactions.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-semibold text-gray-600">Volume total</p>
            </div>
            <p className="text-lg font-bold text-blue-700">
              {(volumeTotal / 1000000).toFixed(1)}M FCFA
            </p>
          </motion.div>

          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <p className="text-xs font-semibold text-gray-600">Croissance</p>
            </div>
            <p className="text-lg font-bold text-orange-700">+{croissanceMoyenne}%</p>
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
              setActiveView('global');
              speak('Vue globale');
            }}
            className={`flex-1 px-4 py-3 rounded-2xl font-semibold transition-all ${
              activeView === 'global'
                ? 'text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-gray-700'
            }`}
            style={activeView === 'global' ? { backgroundColor: '#712864' } : {}}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BarChart3 className="w-4 h-4 mx-auto mb-1" />
            Global
          </motion.button>
          <motion.button
            onClick={() => {
              setActiveView('regional');
              speak('Vue régionale');
            }}
            className={`flex-1 px-4 py-3 rounded-2xl font-semibold transition-all ${
              activeView === 'regional'
                ? 'text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-gray-700'
            }`}
            style={activeView === 'regional' ? { backgroundColor: '#712864' } : {}}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MapPin className="w-4 h-4 mx-auto mb-1" />
            Régional
          </motion.button>
          <motion.button
            onClick={() => {
              setActiveView('secteur');
              speak('Vue par secteur');
            }}
            className={`flex-1 px-4 py-3 rounded-2xl font-semibold transition-all ${
              activeView === 'secteur'
                ? 'text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-gray-700'
            }`}
            style={activeView === 'secteur' ? { backgroundColor: '#712864' } : {}}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Package className="w-4 h-4 mx-auto mb-1" />
            Secteur
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
              placeholder="Rechercher dans les analytics..."
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
                {/* Période */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Période
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#712864] focus:outline-none"
                  >
                    <option value="7j">7 derniers jours</option>
                    <option value="30j">30 derniers jours</option>
                    <option value="3m">3 derniers mois</option>
                    <option value="6m">6 derniers mois</option>
                    <option value="1a">1 an</option>
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
                    <option value="tous">Toutes les régions</option>
                    <option value="abidjan">Abidjan</option>
                    <option value="bouake">Bouaké</option>
                    <option value="yamoussoukro">Yamoussoukro</option>
                    <option value="san-pedro">San-Pedro</option>
                    <option value="korhogo">Korhogo</option>
                  </select>
                </div>

                {/* Secteur */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Secteur d'activité
                  </label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#712864] focus:outline-none"
                  >
                    <option value="tous">Tous les secteurs</option>
                    <option value="cereales">Céréales</option>
                    <option value="legumes">Légumes</option>
                    <option value="tubercules">Tubercules</option>
                    <option value="fruits">Fruits</option>
                    <option value="epices">Épices</option>
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

        {/* Contenu selon la vue active */}
        <AnimatePresence mode="wait">
          {activeView === 'global' && (
            <motion.div
              key="global"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Répartition des acteurs */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Répartition des acteurs</h3>
                  <Users className="w-5 h-5" style={{ color: '#712864' }} />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={repartitionActeurs}
                        dataKey="nombre"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {repartitionActeurs.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {repartitionActeurs.map((acteur) => (
                    <div
                      key={acteur.type}
                      className="p-2 rounded-xl bg-gray-50 flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: acteur.color }}
                      />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">{acteur.type}</p>
                        <p className="text-sm font-bold text-gray-900">{acteur.nombre}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Évolution des inscriptions */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Évolution des inscriptions</h3>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionInscriptions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="mois" stroke="#9CA3AF" />
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
                      <Line type="monotone" dataKey="marchands" stroke="#C66A2C" strokeWidth={2} />
                      <Line type="monotone" dataKey="producteurs" stroke="#2E8B57" strokeWidth={2} />
                      <Line type="monotone" dataKey="cooperatives" stroke="#2072AF" strokeWidth={2} />
                      <Line type="monotone" dataKey="identificateurs" stroke="#9F8170" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Évolution des transactions */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Évolution des transactions</h3>
                  <Activity className="w-5 h-5" style={{ color: '#712864' }} />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={evolutionTransactions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="mois" stroke="#9CA3AF" />
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
                      <Bar dataKey="montant" fill="#712864" name="Montant (FCFA)" />
                      <Bar dataKey="nombre" fill="#34D399" name="Nombre" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Volumes par produit */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Volumes par produit</h3>
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-2">
                  {volumesParProduit.map((produit) => (
                    <motion.div
                      key={produit.produit}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200"
                      whileHover={{ scale: 1.02, borderColor: '#712864' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{produit.produit}</p>
                        <p className="text-sm font-bold" style={{ color: '#712864' }}>
                          {produit.valeur.toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{produit.volume.toLocaleString()} kg</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'regional' && (
            <motion.div
              key="regional"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Stats par région */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Performance par région</h3>
                  <MapPin className="w-5 h-5" style={{ color: '#712864' }} />
                </div>
                <div className="space-y-3">
                  {statsParRegion.map((region, index) => (
                    <motion.div
                      key={region.region}
                      className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-white border border-purple-200"
                      whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(113, 40, 100, 0.1)' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(113, 40, 100, 0.1)' }}
                          >
                            <MapPin className="w-5 h-5" style={{ color: '#712864' }} />
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg">{region.region}</h4>
                        </div>
                        <motion.button
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-gray-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-2 rounded-lg bg-white border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Acteurs</p>
                          <p className="text-base font-bold" style={{ color: '#712864' }}>
                            {region.acteurs}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Transactions</p>
                          <p className="text-base font-bold text-green-600">
                            {region.transactions}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Volume</p>
                          <p className="text-base font-bold text-blue-600">
                            {(region.volume / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'secteur' && (
            <motion.div
              key="secteur"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Stats par secteur */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Performance par secteur</h3>
                  <Package className="w-5 h-5" style={{ color: '#712864' }} />
                </div>
                <div className="space-y-3">
                  {secteurActivite.map((secteur, index) => (
                    <motion.div
                      key={secteur.secteur}
                      className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-white border border-blue-200"
                      whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(32, 114, 175, 0.1)' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg">{secteur.secteur}</h4>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-bold text-green-700">
                            +{secteur.croissance}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Valeur totale</p>
                          <p className="text-xl font-bold" style={{ color: '#712864' }}>
                            {secteur.valeur.toLocaleString()} FCFA
                          </p>
                        </div>
                        <motion.button
                          className="px-4 py-2 rounded-xl text-white font-semibold text-sm"
                          style={{ backgroundColor: '#712864' }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Détails
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton export */}
        <motion.button
          onClick={() => speak('Export des données analytics')}
          className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-bold shadow-lg"
          style={{ backgroundColor: '#712864' }}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(113, 40, 100, 0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-5 h-5" />
          Exporter le rapport complet
        </motion.button>
      </div>
    </div>
  );
}
