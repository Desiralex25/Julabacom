import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, Eye, Snowflake, X, AlertTriangle,
  CheckCircle2, Clock, XCircle, DollarSign, Download,
  MapPin, BarChart3, TrendingUp, Activity, Globe,
  AlertCircle, Edit2, ChevronDown, ChevronUp, ShoppingBag,
  Play, Pause, RotateCcw, Zap, TrendingDown, Award,
  Package,
} from 'lucide-react';
import { useBackOffice, BOTransaction } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { VentesCocovico } from './VentesCocovico';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const STATUT_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any; border: string }> = {
  validee:  { label: 'Validée',   bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, border: 'border-green-200' },
  en_cours: { label: 'En cours',  bg: 'bg-blue-100',  text: 'text-blue-700',  icon: Clock,        border: 'border-blue-200' },
  gelee:    { label: 'Gelée',     bg: 'bg-cyan-100',  text: 'text-cyan-700',  icon: Snowflake,    border: 'border-cyan-200' },
  annulee:  { label: 'Annulée',   bg: 'bg-gray-100',  text: 'text-gray-700',  icon: XCircle,      border: 'border-gray-200' },
  litige:   { label: 'Litige',    bg: 'bg-red-100',   text: 'text-red-700',   icon: AlertTriangle, border: 'border-red-200' },
};

const REGION_COLORS: Record<string, string> = {
  Abidjan: BO_PRIMARY,
  Bouaké: '#3B82F6',
  Korhogo: '#10B981',
  'San Pédro': '#8B5CF6',
  Yamoussoukro: '#F59E0B',
  Man: '#EF4444',
  Daloa: '#EC4899',
};

// Données régionales enrichies pour la carte thermique
const REGION_HEAT = [
  { region: 'Abidjan',       transactions: 1847, volume: 223400000, acteurs: 8064, taux: 94, color: BO_PRIMARY },
  { region: 'Bouaké',        transactions: 412,  volume: 45200000,  acteurs: 1876, taux: 78, color: '#3B82F6' },
  { region: 'Korhogo',       transactions: 284,  volume: 38100000,  acteurs: 1204, taux: 71, color: '#10B981' },
  { region: 'San Pédro',     transactions: 198,  volume: 28300000,  acteurs: 892,  taux: 65, color: '#8B5CF6' },
  { region: 'Yamoussoukro',  transactions: 87,   volume: 18200000,  acteurs: 634,  taux: 52, color: '#F59E0B' },
  { region: 'Man',           transactions: 54,   volume: 11400000,  acteurs: 398,  taux: 44, color: '#EF4444' },
  { region: 'Daloa',         transactions: 38,   volume: 8700000,   acteurs: 276,  taux: 39, color: '#EC4899' },
];

type ViewMode = 'liste' | 'regionale' | 'cocovico';

export function BOSupervision() {
  const { transactions, hasPermission, addAuditLog, boUser } = useBackOffice();
  const [viewMode, setViewMode] = useState<ViewMode>('liste');
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterDateDebut, setFilterDateDebut] = useState('');
  const [filterMontantMin, setFilterMontantMin] = useState('');
  const [filterMontantMax, setFilterMontantMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<BOTransaction | null>(null);
  const [pendingAction, setPendingAction] = useState<{ action: string; txId: string } | null>(null);
  const [localTx, setLocalTx] = useState(transactions);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionMetric, setRegionMetric] = useState<'transactions' | 'volume'>('transactions');

  const regions = [...new Set(transactions.map(t => t.region))];

  const filtered = localTx.filter(t => {
    const matchSearch = !search || `${t.acteurNom} ${t.produit}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'all' || t.statut === filterStatut;
    const matchRegion = filterRegion === 'all' || t.region === filterRegion;
    const matchDate = !filterDateDebut || new Date(t.date) >= new Date(filterDateDebut);
    const matchMin = !filterMontantMin || t.montant >= Number(filterMontantMin);
    const matchMax = !filterMontantMax || t.montant <= Number(filterMontantMax);
    return matchSearch && matchStatut && matchRegion && matchDate && matchMin && matchMax;
  });

  const volumeTotal = filtered.reduce((s, t) => s + t.montant, 0);

  const executeAction = (action: string, txId: string) => {
    const tx = localTx.find(t => t.id === txId);
    if (!tx) return;
    const ancienStatut = tx.statut;
    let newStatut: BOTransaction['statut'] = tx.statut;
    let logAction = '';

    if (action === 'geler') { newStatut = 'gelee'; logAction = 'GEL transaction'; }
    else if (action === 'annuler') { newStatut = 'annulee'; logAction = 'ANNULATION transaction'; }
    else if (action === 'litige') { newStatut = 'litige'; logAction = 'LITIGE déclaré'; }
    else if (action === 'corriger') { newStatut = 'validee'; logAction = 'CORRECTION transaction → validée'; }

    setLocalTx(prev => prev.map(t => t.id === txId ? { ...t, statut: newStatut } : t));

    if (boUser) addAuditLog({
      action: logAction,
      utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
      roleBO: boUser.role,
      acteurImpacte: tx.acteurNom,
      ancienneValeur: ancienStatut,
      nouvelleValeur: newStatut,
      ip: '127.0.0.1',
      module: 'Supervision',
    });

    const msgs: Record<string, () => void> = {
      geler: () => toast.info('Transaction gelée et journalisée'),
      annuler: () => toast.warning('Transaction annulée et journalisée'),
      litige: () => toast.error('Litige déclaré — dossier ouvert'),
      corriger: () => toast.success('Transaction corrigée → validée'),
    };
    msgs[action]?.();
    setPendingAction(null);
    setSelected(null);
  };

  const handleExport = (format: string) => toast.success(`Export ${format} en cours — simulation`);

  const METRIC_LABELS = {
    transactions: 'Transactions',
    volume: 'Volume (M FCFA)',
  };

  const chartData = REGION_HEAT.map(r => ({
    region: r.region.length > 9 ? r.region.substring(0, 9) + '.' : r.region,
    fullRegion: r.region,
    value: regionMetric === 'transactions' ? r.transactions : Math.round(r.volume / 1000000),
    color: r.color,
  }));

  const selectedRegionData = REGION_HEAT.find(r => r.region === selectedRegion);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Supervision</h1>
          <p className="text-sm text-gray-500 mt-0.5">Transactions nationales en temps réel</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Vue switcher */}
          <div className="flex items-center bg-gray-100 rounded-2xl p-1">
            <motion.button onClick={() => setViewMode('liste')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ backgroundColor: viewMode === 'liste' ? 'white' : 'transparent', color: viewMode === 'liste' ? BO_DARK : '#9ca3af', boxShadow: viewMode === 'liste' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}
              whileTap={{ scale: 0.95 }}>
              <Activity className="w-3.5 h-3.5" /> Liste
            </motion.button>
            <motion.button onClick={() => setViewMode('regionale')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ backgroundColor: viewMode === 'regionale' ? 'white' : 'transparent', color: viewMode === 'regionale' ? BO_DARK : '#9ca3af', boxShadow: viewMode === 'regionale' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}
              whileTap={{ scale: 0.95 }}>
              <Globe className="w-3.5 h-3.5" /> Carte
            </motion.button>
            <motion.button onClick={() => setViewMode('cocovico')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ backgroundColor: viewMode === 'cocovico' ? 'white' : 'transparent', color: viewMode === 'cocovico' ? BO_DARK : '#9ca3af', boxShadow: viewMode === 'cocovico' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}
              whileTap={{ scale: 0.95 }}>
              <ShoppingBag className="w-3.5 h-3.5" /> Cocovico
            </motion.button>
          </div>
          {['CSV', 'Excel', 'PDF'].map(fmt => (
            <motion.button key={fmt} onClick={() => handleExport(fmt)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-600 bg-white"
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Download className="w-3.5 h-3.5" /> {fmt}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Transactions', value: filtered.length, color: '#3B82F6' },
          { label: 'Volume total', value: `${volumeTotal.toLocaleString('fr-FR')} FCFA`, color: BO_PRIMARY },
          { label: 'Litiges / Gelées', value: localTx.filter(t => t.statut === 'gelee' || t.statut === 'litige').length, color: '#EF4444' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <p className="text-xs font-bold text-gray-500 mb-1">{kpi.label}</p>
            <p className="text-xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── VUE RÉGIONALE / CARTE ───────────────────────────── */}
        {viewMode === 'regionale' && (
          <motion.div key="regionale" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-5">

            {/* Graphique barres */}
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-black text-gray-900 text-lg">Distribution régionale</h2>
                  <p className="text-xs text-gray-500">Cliquez sur une région pour le détail</p>
                </div>
                <div className="flex gap-2">
                  {(Object.keys(METRIC_LABELS) as (keyof typeof METRIC_LABELS)[]).map(m => (
                    <button key={m} onClick={() => setRegionMetric(m)}
                      className="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all"
                      style={{ borderColor: regionMetric === m ? BO_PRIMARY : '#e5e7eb', backgroundColor: regionMetric === m ? `${BO_PRIMARY}15` : 'white', color: regionMetric === m ? BO_PRIMARY : '#6b7280' }}>
                      {METRIC_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer key="chart-bo-supervision" width="100%" height={220}>
                <BarChart data={chartData} barSize={32} onClick={d => d?.activePayload && setSelectedRegion(d.activePayload[0]?.payload?.fullRegion)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="region" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: `${BO_PRIMARY}10` }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-3">
                          <p className="font-black text-gray-900 text-sm">{payload[0].payload.fullRegion}</p>
                          <p className="text-xs font-semibold mt-1" style={{ color: payload[0].payload.color }}>
                            {METRIC_LABELS[regionMetric]} : {(payload[0].value as number).toLocaleString()}
                            {regionMetric === 'volume' ? ' M FCFA' : ''}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Cliquez pour le détail</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color}
                        opacity={selectedRegion && selectedRegion !== entry.fullRegion ? 0.4 : 1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Détail région sélectionnée */}
            <AnimatePresence>
              {selectedRegion && selectedRegionData && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                  className="bg-white rounded-3xl p-6 border-2 shadow-md"
                  style={{ borderColor: selectedRegionData.color }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${selectedRegionData.color}20` }}>
                        <MapPin className="w-6 h-6" style={{ color: selectedRegionData.color }} />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-xl">{selectedRegionData.region}</h3>
                        <p className="text-xs text-gray-500">Vue détaillée de la région</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedRegion(null)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[
                      { label: 'Acteurs', value: selectedRegionData.acteurs.toLocaleString(), color: selectedRegionData.color },
                      { label: 'Transactions', value: selectedRegionData.transactions.toLocaleString(), color: '#3B82F6' },
                      { label: 'Volume', value: `${selectedRegionData.volume.toLocaleString()} FCFA`, color: '#10B981' },
                      { label: "Taux d'activité", value: `${selectedRegionData.taux}%`, color: selectedRegionData.taux >= 70 ? '#10B981' : selectedRegionData.taux >= 50 ? BO_PRIMARY : '#EF4444' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 text-center">
                        <p className="text-xs text-gray-500 font-semibold mb-1">{stat.label}</p>
                        <p className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-gray-600">Taux d'activité</span>
                      <span className="text-xs font-black" style={{ color: selectedRegionData.color }}>{selectedRegionData.taux}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ backgroundColor: selectedRegionData.color }}
                        initial={{ width: 0 }} animate={{ width: `${selectedRegionData.taux}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grille thermique régions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {REGION_HEAT.map((r, i) => (
                <motion.div key={r.region}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl p-4 border-2 cursor-pointer transition-all"
                  style={{ borderColor: selectedRegion === r.region ? r.color : '#f3f4f6' }}
                  onClick={() => setSelectedRegion(selectedRegion === r.region ? null : r.region)}
                  whileHover={{ y: -3, boxShadow: `0 8px 20px ${r.color}20` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                    <p className="font-black text-gray-900 text-sm">{r.region}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Transactions</span>
                      <span className="font-bold text-gray-900">{r.transactions}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Volume</span>
                      <span className="font-bold" style={{ color: r.color }}>{r.volume.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ backgroundColor: r.color }}
                        initial={{ width: 0 }} animate={{ width: `${r.taux}%` }}
                        transition={{ duration: 0.8, delay: i * 0.06 }} />
                    </div>
                    <p className="text-[10px] text-gray-400 text-right font-semibold">{r.taux}% actif</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── VUE LISTE ────────────────────────────────────────── */}
        {viewMode === 'liste' && (
          <motion.div key="liste" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">

            {/* Recherche + filtres */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Rechercher acteur ou produit..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none bg-white text-sm"
                  style={{ borderColor: search ? BO_PRIMARY : undefined }} />
              </div>
              <motion.button onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border-2 font-bold text-sm bg-white"
                style={{ borderColor: showFilters ? BO_PRIMARY : '#e5e7eb', color: showFilters ? BO_PRIMARY : '#374151' }}
                whileTap={{ scale: 0.97 }}>
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtres</span>
              </motion.button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Statut</label>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setFilterStatut('all')}
                          className="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all"
                          style={{ borderColor: filterStatut === 'all' ? BO_PRIMARY : '#e5e7eb', backgroundColor: filterStatut === 'all' ? `${BO_PRIMARY}15` : 'transparent', color: filterStatut === 'all' ? BO_PRIMARY : '#6b7280' }}>
                          Tous
                        </button>
                        {Object.entries(STATUT_CONFIG).map(([k, v]) => (
                          <button key={k} onClick={() => setFilterStatut(k)}
                            className="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all"
                            style={{ borderColor: filterStatut === k ? BO_PRIMARY : '#e5e7eb', backgroundColor: filterStatut === k ? `${BO_PRIMARY}15` : 'transparent', color: filterStatut === k ? BO_PRIMARY : '#6b7280' }}>
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Région</label>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setFilterRegion('all')}
                          className="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all"
                          style={{ borderColor: filterRegion === 'all' ? BO_PRIMARY : '#e5e7eb', backgroundColor: filterRegion === 'all' ? `${BO_PRIMARY}15` : 'transparent', color: filterRegion === 'all' ? BO_PRIMARY : '#6b7280' }}>
                          Toutes
                        </button>
                        {regions.map(r => (
                          <button key={r} onClick={() => setFilterRegion(r)}
                            className="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all"
                            style={{ borderColor: filterRegion === r ? BO_PRIMARY : '#e5e7eb', backgroundColor: filterRegion === r ? `${BO_PRIMARY}15` : 'transparent', color: filterRegion === r ? BO_PRIMARY : '#6b7280' }}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Date depuis</label>
                      <input type="date" value={filterDateDebut} onChange={e => setFilterDateDebut(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                        style={{ borderColor: filterDateDebut ? BO_PRIMARY : undefined }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Montant min (FCFA)</label>
                      <input type="number" value={filterMontantMin} onChange={e => setFilterMontantMin(e.target.value)}
                        placeholder="0" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                        style={{ borderColor: filterMontantMin ? BO_PRIMARY : undefined }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Montant max (FCFA)</label>
                      <input type="number" value={filterMontantMax} onChange={e => setFilterMontantMax(e.target.value)}
                        placeholder="Illimité" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                        style={{ borderColor: filterMontantMax ? BO_PRIMARY : undefined }} />
                    </div>
                    <div className="flex items-end">
                      <button onClick={() => { setFilterStatut('all'); setFilterRegion('all'); setFilterDateDebut(''); setFilterMontantMin(''); setFilterMontantMax(''); }}
                        className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500">
                        Réinitialiser
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop Table / Mobile Cards */}
            <div className="hidden lg:block bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: `${BO_DARK}08` }}>
                  <tr>
                    {['Acteur', 'Produit', 'Montant', 'Statut', 'Région', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, i) => {
                    const conf = STATUT_CONFIG[tx.statut];
                    const Icon = conf?.icon || Clock;
                    return (
                      <motion.tr key={tx.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelected(tx)}>
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-gray-900">{tx.acteurNom}</p>
                            <p className="text-xs text-gray-400">{tx.acteurType}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-gray-700">{tx.produit}</p>
                          <p className="text-xs text-gray-400">{tx.quantite}</p>
                        </td>
                        <td className="py-3.5 px-4 font-black text-gray-900">{tx.montant.toLocaleString()} F</td>
                        <td className="py-3.5 px-4">
                          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${conf?.bg} ${conf?.text}`}>
                            <Icon className="w-3 h-3" />
                            {conf?.label}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: REGION_COLORS[tx.region] || '#9ca3af' }} />
                            <span className="text-xs font-semibold text-gray-600">{tx.region}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-500">
                          {new Date(tx.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3.5 px-4">
                          <motion.button onClick={e => { e.stopPropagation(); setSelected(tx); }}
                            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Eye className="w-4 h-4 text-gray-600" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-bold">Aucune transaction trouvée</p>
                </div>
              )}
            </div>

            {/* MOBILE — Cards */}
            <div className="lg:hidden space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-bold">Aucune transaction</p>
                </div>
              ) : (
                filtered.map((tx, i) => {
                  const conf = STATUT_CONFIG[tx.statut];
                  const Icon = conf?.icon || Clock;
                  return (
                    <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm"
                      onClick={() => setSelected(tx)}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900">{tx.acteurNom}</p>
                          <p className="text-xs text-gray-400">{tx.acteurType} • {tx.region}</p>
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold ${conf?.bg} ${conf?.text}`}>
                          <Icon className="w-3 h-3" />
                          {conf?.label}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">{tx.produit} • {tx.quantite}</p>
                          <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-900">{tx.montant.toLocaleString()} F</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* ── VUE COCOVICO ──────────────────────────────────────── */}
        {viewMode === 'cocovico' && (
          <motion.div key="cocovico" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-5">
            <VentesCocovico />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal détail transaction */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}>
            <motion.div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border-2"
              style={{ borderColor: BO_PRIMARY }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-900 text-xl">Détail transaction</h2>
                <button onClick={() => setSelected(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Acteur', value: selected.acteurNom },
                  { label: 'Type', value: selected.acteurType },
                  { label: 'Produit', value: selected.produit },
                  { label: 'Quantité', value: selected.quantite },
                  { label: 'Montant', value: `${selected.montant.toLocaleString()} FCFA` },
                  { label: 'Paiement', value: selected.modePaiement },
                  { label: 'Région', value: selected.region },
                  { label: 'Date', value: new Date(selected.date).toLocaleString('fr-FR') },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500 font-semibold">{row.label}</span>
                    <span className="text-sm font-bold text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
              {hasPermission('supervision.freeze') && (
                <div className="flex flex-wrap gap-3 mt-5">
                  {selected.statut !== 'gelee' && (
                    <motion.button onClick={() => { setPendingAction({ action: 'geler', txId: selected.id }); setSelected(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-cyan-700 border-2 border-cyan-300 bg-cyan-50 min-w-[100px]"
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                      <Snowflake className="w-4 h-4" /> Geler
                    </motion.button>
                  )}
                  {selected.statut !== 'annulee' && (
                    <motion.button onClick={() => { setPendingAction({ action: 'annuler', txId: selected.id }); setSelected(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-red-700 border-2 border-red-300 bg-red-50 min-w-[100px]"
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                      <XCircle className="w-4 h-4" /> Annuler
                    </motion.button>
                  )}
                  {selected.statut !== 'litige' && (
                    <motion.button onClick={() => { setPendingAction({ action: 'litige', txId: selected.id }); setSelected(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-red-800 border-2 border-red-400 bg-red-50 min-w-[100px]"
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                      <AlertCircle className="w-4 h-4" /> Litige
                    </motion.button>
                  )}
                  {(selected.statut === 'gelee' || selected.statut === 'en_cours') && (
                    <motion.button onClick={() => { setPendingAction({ action: 'corriger', txId: selected.id }); setSelected(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-green-700 border-2 border-green-300 bg-green-50 min-w-[100px]"
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                      <Edit2 className="w-4 h-4" /> Corriger
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Confirmation Action */}
      <AnimatePresence>
        {pendingAction && (
          <motion.div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPendingAction(null)}>
            <motion.div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2"
              style={{ borderColor: ['annuler', 'litige'].includes(pendingAction.action) ? '#EF4444' : pendingAction.action === 'geler' ? '#06B6D4' : '#10B981' }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <h3 className="font-black text-gray-900 text-lg mb-2">
                {pendingAction.action === 'geler' ? 'Confirmer le gel ?' :
                 pendingAction.action === 'annuler' ? 'Confirmer l\'annulation ?' :
                 pendingAction.action === 'litige' ? 'Déclarer un litige ?' : 'Corriger la transaction ?'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {pendingAction.action === 'geler' ? 'Le gel bloque immédiatement les fonds. Action journalisée dans l\'audit.' :
                 pendingAction.action === 'annuler' ? 'L\'annulation est irréversible. Action journalisée dans l\'audit.' :
                 pendingAction.action === 'litige' ? 'Un dossier de litige sera ouvert. Action journalisée dans l\'audit.' :
                 'La transaction sera reclassée en validée. Action journalisée dans l\'audit.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setPendingAction(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
                <button onClick={() => executeAction(pendingAction.action, pendingAction.txId)}
                  className="flex-1 py-3 rounded-2xl font-bold text-white"
                  style={{ backgroundColor: ['annuler', 'litige'].includes(pendingAction.action) ? '#EF4444' : pendingAction.action === 'geler' ? '#06B6D4' : '#10B981' }}>
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}