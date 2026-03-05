import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MapPin,
  Phone,
  Users,
  Clock,
  Mic,
  MicOff,
  Filter,
  Calendar,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Download,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Archive,
  RefreshCw,
  FileText,
  Shield,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { NotificationButton } from '../marchand/NotificationButton';
import { toast } from 'sonner';
import { matchesSearch } from '../../utils/searchUtils';
import { useBackOffice } from '../../contexts/BackOfficeContext';

const C = '#712864';
const C_LIGHT = '#F9F5F8';

// ── Types ─────────────────────────────────────────────────────────────────────
type PeriodType = 'mois' | 'annuel' | 'historique';
type TabType = 'valides' | 'en_attente' | 'rejetes';

// ✅ NETTOYAGE PHASE 2 : MOCK_TRANSACTIONS supprimé - utilise BackOfficeContext

const AUDIT_LOG = [
  { action: 'Suspension acteur', utilisateur: 'Brice Koné — Admin CNPS', acteurConcerne: 'Awa Bamba (A007)', date: '2026-03-03 10:22', ip: '196.10.44.21', statut: 'success' },
  { action: 'Validation dossier', utilisateur: 'Mariam Diallo — Agent Supervision', acteurConcerne: 'Ibrahim Touré (A004)', date: '2026-03-03 09:18', ip: '196.10.44.18', statut: 'success' },
  { action: 'Export rapport PDF', utilisateur: 'Issa Coulibaly — Dir. Régional', acteurConcerne: 'Rapport mensuel Fev-2026', date: '2026-03-02 17:45', ip: '196.10.44.30', statut: 'success' },
  { action: 'Rejet transaction', utilisateur: 'Fatou Traoré — Agent Supervision', acteurConcerne: 'Coop. Agro-Femmes (TXN-1099)', date: '2026-03-02 14:55', ip: '196.10.44.22', statut: 'warning' },
  { action: 'Connexion supervision', utilisateur: 'Kofi Asante — Dir. National', acteurConcerne: '—', date: '2026-03-02 08:00', ip: '196.10.44.10', statut: 'success' },
  { action: 'Anomalie détectée', utilisateur: 'Système automatique', acteurConcerne: 'Union Cacao Soubré (TXN-0755)', date: '2026-03-01 09:35', ip: 'Système', statut: 'danger' },
];

function getTypeColor(type: string) {
  if (type === 'marchand') return { bg: 'bg-orange-100', text: 'text-orange-700' };
  if (type === 'producteur') return { bg: 'bg-green-100', text: 'text-green-700' };
  if (type === 'cooperative') return { bg: 'bg-blue-100', text: 'text-blue-700' };
  return { bg: 'bg-stone-100', text: 'text-stone-700' };
}

function getTypeLabel(type: string) {
  if (type === 'marchand') return 'Marchand';
  if (type === 'producteur') return 'Producteur';
  if (type === 'cooperative') return 'Coopérative';
  return 'Identificateur';
}

function MontantRing({ montant, size = 56 }: { montant: number; size?: number }) {
  const max = 1500000;
  const pct = Math.min(montant / max, 1);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = pct * circ;
  const color = pct > 0.6 ? '#16A34A' : pct > 0.2 ? '#EA580C' : '#9CA3AF';
  const label = montant >= 1000000
    ? `${(montant / 1000000).toFixed(1)}M`
    : montant >= 1000
    ? `${(montant / 1000).toFixed(0)}K`
    : montant.toString();

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={5} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - filled }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-tight">
        <span className="text-[9px] font-bold" style={{ color }}>{label}</span>
        <span className="text-[8px] text-gray-400">FCFA</span>
      </div>
    </div>
  );
}

function BadgeStatut({ statut }: { statut: StatutTx }) {
  const cfg = {
    valide: { label: 'Validé', bg: 'bg-green-100', text: 'text-green-700', Icon: CheckCircle },
    en_attente: { label: 'En attente', bg: 'bg-orange-100', text: 'text-orange-700', Icon: Clock },
    rejete: { label: 'Rejeté', bg: 'bg-red-100', text: 'text-red-700', Icon: XCircle },
  };
  const { label, bg, text, Icon } = cfg[statut];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Composant principal ──────────────────────────────────────────────────────
export function InstitutionSupervision() {
  const { speak, setIsModalOpen } = useApp();
  const { transactions } = useBackOffice(); // ✅ Utilise BackOfficeContext

  const [tab, setTab] = useState<TabType>('valides');
  const [periode, setPeriode] = useState<PeriodType>('mois');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<'transactions' | 'audit' | 'export'>('transactions');
  const [showAuditInline, setShowAuditInline] = useState(false);
  const [showExportInline, setShowExportInline] = useState(false);

  React.useEffect(() => {
    setIsModalOpen(selectedTx !== null);
  }, [selectedTx, setIsModalOpen]);
  React.useEffect(() => () => { setIsModalOpen(false); }, [setIsModalOpen]);

  // ✅ KPIs basés sur données réelles BackOfficeContext
  const kpis = useMemo(() => ({
    total: transactions.length,
    enAttente: transactions.filter(t => t.statut === 'en_cours').length,
    rejetes: transactions.filter(t => t.statut === 'annulee').length,
    valides: transactions.filter(t => t.statut === 'validee').length,
    volumeMois: transactions.filter(t => t.statut === 'validee').reduce((s, t) => s + t.montant, 0),
  }), [transactions]);

  // ✅ Filtrage sur données réelles
  const filtrees = useMemo(() => {
    return transactions.filter(tx => {
      const statutMap = { valides: 'validee', en_attente: 'en_cours', rejetes: 'annulee' };
      if (tab && tx.statut !== statutMap[tab]) return false;
      if (searchQuery) {
        if (!matchesSearch(searchQuery, tx.acteurNom, tx.acteurType, tx.produit, tx.id)) return false;
      }
      if (filterType !== 'all' && tx.acteurType.toLowerCase() !== filterType) return false;
      if (filterRegion !== 'all' && tx.region !== filterRegion) return false;
      return true;
    });
  }, [transactions, tab, searchQuery, filterType, filterRegion]);

  const startVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speak('Recherche vocale non supportée'); return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => { setSearchQuery(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  }, [speak]);

  const handleExport = (format: string) => {
    toast.success(`Export ${format.toUpperCase()} lancé`, { description: `Période : ${periode === 'mois' ? 'Mois en cours' : periode === 'annuel' ? 'Cumul annuel' : 'Historique'}` });
  };

  return (
    <>
      {/* Header fixe */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: C_LIGHT }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-bold text-gray-900 text-2xl">Supervision</h1>
            <NotificationButton />
          </div>
        </div>
      </motion.div>

      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen" style={{ backgroundColor: C_LIGHT }}>

        {activeView === 'transactions' && (
          <>
            {/* ── Onglets période — clone exact Membres ──────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border-2 border-gray-100 p-1.5 flex gap-1 mb-5 shadow-sm"
            >
              {([
                { key: 'mois', label: 'Mois en cours' },
                { key: 'annuel', label: 'Cumul annuel' },
                { key: 'historique', label: 'Historique' },
              ] as const).map(p => (
                <motion.button
                  key={p.key}
                  onClick={() => setPeriode(p.key)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all`}
                  style={periode === p.key ? { backgroundColor: C, color: '#fff' } : { color: '#6B7280' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {p.label}
                </motion.button>
              ))}
            </motion.div>

            {/* ── KPI Cards — clone exact Membres (3 cartes) ─────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-3 gap-3 mb-5"
            >
              {[
                { label: 'Total', value: kpis.total, icon: <Activity className="w-5 h-5 text-blue-400" />, border: 'border-blue-200', text: 'text-blue-700', bg: 'bg-blue-50' },
                { label: 'En attente', value: kpis.enAttente, icon: <Clock className="w-5 h-5 text-orange-400" />, border: 'border-orange-300', text: 'text-orange-600', bg: 'bg-white' },
                { label: 'Rejetés', value: kpis.rejetes, icon: <ShieldAlert className="w-5 h-5 text-red-400" />, border: 'border-red-200', text: 'text-red-600', bg: 'bg-white' },
              ].map((kpi, i) => (
                <motion.div key={kpi.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                  className={`rounded-2xl border-2 p-4 shadow-sm ${kpi.bg} ${kpi.border}`}
                  whileHover={{ y: -3 }}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-gray-500 font-semibold">{kpi.label}</p>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">{kpi.icon}</div>
                  </div>
                  <motion.p className={`text-3xl font-black ${kpi.text}`}
                    animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}>
                    {kpi.value}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>

            {/* ── Boutons action — clone "Membres / Ajouter membre" ──────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-3 mb-5"
            >
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border-2 border-gray-200 font-bold text-gray-700 shadow-sm"
                whileHover={{ scale: 1.02, borderColor: C }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAuditInline(v => !v)}
                style={showAuditInline ? { borderColor: C, color: C } : {}}
              >
                <Shield className="w-5 h-5" style={showAuditInline ? { color: C } : {}} />
                Audit Log
              </motion.button>
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white shadow-md"
                style={showExportInline ? { backgroundColor: '#9B3D8A', border: '2px solid #fff' } : { backgroundColor: C }}
                whileHover={{ scale: 1.02, opacity: 0.9 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowExportInline(v => !v)}
              >
                <Download className="w-5 h-5" />
                Export données
              </motion.button>
            </motion.div>

            {/* ── Audit Log inline ────────────────────────────────────────── */}
            <AnimatePresence>
              {showAuditInline && (
                <motion.div
                  key="audit-inline"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="mb-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: C }}>
                        <Shield className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-bold text-gray-900">Audit Log</span>
                      <span className="text-xs font-black rounded-full px-2 py-0.5 bg-purple-100 text-purple-700">{AUDIT_LOG.length}</span>
                    </div>
                    <motion.button onClick={() => setShowAuditInline(false)}
                      className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                      whileTap={{ scale: 0.9 }}>
                      <X className="w-4 h-4 text-gray-500" />
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    {AUDIT_LOG.map((log, idx) => (
                      <motion.div key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`bg-white rounded-2xl p-3.5 border-2 shadow-sm ${
                          log.statut === 'danger' ? 'border-red-200' :
                          log.statut === 'warning' ? 'border-orange-200' : 'border-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            log.statut === 'danger' ? 'bg-red-100' :
                            log.statut === 'warning' ? 'bg-orange-100' : 'bg-green-100'
                          }`}>
                            {log.statut === 'danger' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                             log.statut === 'warning' ? <AlertTriangle className="w-4 h-4 text-orange-500" /> :
                             <CheckCircle className="w-4 h-4 text-green-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm">{log.action}</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{log.utilisateur}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">{log.date}</span>
                              <span className="text-xs text-gray-300">|</span>
                              <span className="text-xs text-gray-400">{log.ip}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Export données inline ───────────────────────────────────── */}
            <AnimatePresence>
              {showExportInline && (
                <motion.div
                  key="export-inline"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="mb-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: C }}>
                        <Download className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-bold text-gray-900">Export données</span>
                    </div>
                    <motion.button onClick={() => setShowExportInline(false)}
                      className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                      whileTap={{ scale: 0.9 }}>
                      <X className="w-4 h-4 text-gray-500" />
                    </motion.button>
                  </div>

                  {/* Onglets période */}
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-1.5 flex gap-1 mb-4 shadow-sm">
                    {([
                      { key: 'mois', label: 'Mois en cours' },
                      { key: 'annuel', label: 'Cumul annuel' },
                      { key: 'historique', label: 'Historique' },
                    ] as const).map(p => (
                      <motion.button key={p.key} onClick={() => setPeriode(p.key)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                        style={periode === p.key ? { backgroundColor: C, color: '#fff' } : { color: '#6B7280' }}
                        whileTap={{ scale: 0.97 }}>
                        {p.label}
                      </motion.button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {[
                      { format: 'pdf', label: 'Exporter en PDF', desc: 'Rapport complet pour impression', iconBg: 'bg-red-50', iconBorder: 'border-red-200', iconColor: 'text-red-600' },
                      { format: 'excel', label: 'Exporter en Excel', desc: 'Tableau avec formules et graphiques', iconBg: 'bg-green-50', iconBorder: 'border-green-200', iconColor: 'text-green-600' },
                      { format: 'csv', label: 'Exporter en CSV', desc: 'Données brutes tous logiciels', iconBg: 'bg-blue-50', iconBorder: 'border-blue-200', iconColor: 'text-blue-600' },
                    ].map((btn, i) => (
                      <motion.button key={btn.format} onClick={() => handleExport(btn.format)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="w-full bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm text-left"
                        whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${btn.iconBg} ${btn.iconBorder}`}>
                            <Download className={`w-5 h-5 ${btn.iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">{btn.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{btn.desc}</p>
                          </div>
                          <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </motion.div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-3">
                    Période : {periode === 'mois' ? 'Mois en cours' : periode === 'annuel' ? 'Cumul annuel' : 'Historique complet'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Sous-onglets statut — clone exact "Actifs / En attente / Archivés" ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-white rounded-2xl border-2 border-gray-100 p-2 flex gap-1 mb-5 shadow-sm"
            >
              {([
                { key: 'valides', label: 'Validés', count: kpis.valides },
                { key: 'en_attente', label: 'En attente', count: kpis.enAttente },
                { key: 'rejetes', label: 'Rejetés', count: kpis.rejetes },
              ] as const).map(t => (
                <motion.button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all`}
                  style={tab === t.key ? { backgroundColor: C, color: '#fff' } : { color: '#6B7280' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t.label}
                  <span className={`text-xs rounded-full px-1.5 py-0.5 font-black ${
                    tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>{t.count}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* ── Barre de recherche — clone exact Membres ───────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="bg-white rounded-2xl border-2 border-gray-200 flex items-center gap-3 px-4 py-3 mb-5 shadow-sm"
            >
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, commune, téléphone..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400"
              />
              <motion.button onClick={startVoiceSearch}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${isListening ? 'text-white' : 'text-gray-400'}`}
                style={isListening ? { backgroundColor: C } : {}}
                whileTap={{ scale: 0.9 }}
                animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.6, repeat: isListening ? Infinity : 0 }}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </motion.button>
              <motion.button onClick={() => setShowFilters(v => !v)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${showFilters ? 'text-white' : 'text-gray-400'}`}
                style={showFilters ? { backgroundColor: C } : {}}
                whileTap={{ scale: 0.9 }}>
                <Filter className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Filtres avancés */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl border-2 border-gray-100 p-4 mb-5 shadow-sm overflow-hidden"
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-2">Type d'acteur</p>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'marchand', 'producteur', 'cooperative', 'identificateur'].map(t => (
                          <motion.button key={t} onClick={() => setFilterType(t)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${filterType === t ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
                            style={filterType === t ? { backgroundColor: C } : {}}
                            whileTap={{ scale: 0.95 }}>
                            {t === 'all' ? 'Tous' : t.charAt(0).toUpperCase() + t.slice(1)}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-2">Région</p>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'Abidjan', 'Gbèkè', 'Hambol', 'Haut-Sassandra', 'Poro', 'Nawa', 'Woroba'].map(r => (
                          <motion.button key={r} onClick={() => setFilterRegion(r)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${filterRegion === r ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
                            style={filterRegion === r ? { backgroundColor: C } : {}}
                            whileTap={{ scale: 0.95 }}>
                            {r === 'all' ? 'Toutes' : r}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Label section — clone "Actifs 10" ──────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.16 }}
              className="flex items-center gap-2 mb-3"
            >
              {tab === 'valides' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {tab === 'en_attente' && <Clock className="w-5 h-5 text-orange-500" />}
              {tab === 'rejetes' && <XCircle className="w-5 h-5 text-red-500" />}
              <span className="font-bold text-gray-900 text-base">
                {tab === 'valides' ? 'Validés' : tab === 'en_attente' ? 'En attente' : 'Rejetés'}
              </span>
              <span className={`text-xs font-black rounded-full px-2.5 py-0.5 ${
                tab === 'valides' ? 'bg-green-100 text-green-700' :
                tab === 'en_attente' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>{filtrees.length}</span>
            </motion.div>

            {/* ── Liste transactions  clone exact cartes Membres ─────────── */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filtrees.map((tx, index) => {
                  const typeStyle = getTypeColor(tx.type);
                  const montant = tx.montant[periode];
                  return (
                    <motion.div
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-white rounded-2xl overflow-hidden"
                      style={{ border: `2px solid ${
                        tx.statut === 'rejete' ? '#FECACA' :
                        tx.statut === 'en_attente' ? '#FED7AA' : '#DBEAFE'
                      }` }}
                    >
                      <motion.div
                        className="p-4"
                        onClick={() => setSelectedTx(tx)}
                        style={{ cursor: 'pointer', backgroundColor: '#ffffff' }}
                        whileHover={{ backgroundColor: '#FAFAFA' }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar initiales — clone exact Membres */}
                          <div className="relative flex-shrink-0">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md"
                              style={{ background: `linear-gradient(135deg, ${C} 0%, #9B3D8A 100%)` }}
                            >
                              {tx.initiales}
                            </div>
                          </div>

                          {/* Infos acteur */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-bold text-gray-900 text-sm">{tx.acteur}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeStyle.bg} ${typeStyle.text}`}>
                                {getTypeLabel(tx.type)}
                              </span>
                              <BadgeStatut statut={tx.statut} />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              <span>{tx.telephone}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span>{tx.commune} — {tx.region}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span>Le {new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} à {tx.heure}</span>
                            </div>
                          </div>

                          {/* Anneau montant — clone exact ScoreRing */}
                          <div className="flex flex-col items-center gap-0.5">
                            <MontantRing montant={montant} size={56} />
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filtrees.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white rounded-2xl border-2 border-gray-100">
                  <Activity className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-semibold text-sm">Aucune transaction trouvée</p>
                </motion.div>
              )}
            </div>
          </>
        )}

        {/* ── VUE AUDIT LOG ─────────────────────────────────────────────── */}
        {activeView === 'audit' && (
          <motion.div key="audit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Audit Log</h2>
                <p className="text-xs text-gray-500">{AUDIT_LOG.length} actions enregistrées</p>
              </div>
            </div>
            <div className="space-y-3">
              {AUDIT_LOG.map((log, idx) => (
                <motion.div key={idx}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-2xl p-4 border-2 shadow-sm ${
                    log.statut === 'danger' ? 'border-red-200' :
                    log.statut === 'warning' ? 'border-orange-200' : 'border-gray-100'
                  }`}
                  whileHover={{ y: -2 }}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      log.statut === 'danger' ? 'bg-red-100' :
                      log.statut === 'warning' ? 'bg-orange-100' : 'bg-green-100'
                    }`}>
                      {log.statut === 'danger' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                       log.statut === 'warning' ? <AlertTriangle className="w-4 h-4 text-orange-500" /> :
                       <CheckCircle className="w-4 h-4 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{log.action}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{log.utilisateur}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">Concerne : {log.acteurConcerne}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400">{log.date}</span>
                        <span className="text-xs text-gray-400">IP : {log.ip}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── VUE EXPORT ─────────────────────────────────────────────────── */}
        {activeView === 'export' && (
          <motion.div key="export" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Onglets période */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-1.5 flex gap-1 mb-5 shadow-sm">
              {([
                { key: 'mois', label: 'Mois en cours' },
                { key: 'annuel', label: 'Cumul annuel' },
                { key: 'historique', label: 'Historique' },
              ] as const).map(p => (
                <motion.button key={p.key} onClick={() => setPeriode(p.key)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={periode === p.key ? { backgroundColor: C, color: '#fff' } : { color: '#6B7280' }}
                  whileTap={{ scale: 0.97 }}>
                  {p.label}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C }}>
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Export des données</h2>
                <p className="text-xs text-gray-500">Période : {periode === 'mois' ? 'Mois en cours' : periode === 'annuel' ? 'Cumul annuel' : 'Historique complet'}</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { format: 'pdf', label: 'Exporter en PDF', desc: 'Rapport complet formaté pour impression', iconBg: 'bg-red-50', iconBorder: 'border-red-200', iconColor: 'text-red-600' },
                { format: 'excel', label: 'Exporter en Excel', desc: 'Tableau avec formules et graphiques', iconBg: 'bg-green-50', iconBorder: 'border-green-200', iconColor: 'text-green-600' },
                { format: 'csv', label: 'Exporter en CSV', desc: 'Données brutes compatibles tout logiciel', iconBg: 'bg-blue-50', iconBorder: 'border-blue-200', iconColor: 'text-blue-600' },
              ].map((btn, i) => (
                <motion.button key={btn.format} onClick={() => handleExport(btn.format)}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
                  className="w-full bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm text-left"
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${btn.iconBg} ${btn.iconBorder}`}>
                      <Download className={`w-6 h-6 ${btn.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{btn.label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{btn.desc}</p>
                    </div>
                    <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                </motion.button>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mt-5">
              Tous les exports sont filtrables par région, type d'acteur et statut
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Drawer détail transaction — clone drawer Membres ────────── */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end"
            onClick={() => setSelectedTx(null)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full bg-white rounded-t-3xl overflow-hidden max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Poignée */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Header drawer */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm"
                  style={{ background: `linear-gradient(135deg, ${C} 0%, #9B3D8A 100%)` }}>
                  {selectedTx.initiales}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{selectedTx.acteur}</p>
                  <p className="text-xs text-gray-500">{selectedTx.ref}</p>
                </div>
                <motion.button onClick={() => setSelectedTx(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Contenu */}
              <div className="px-5 py-5 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${getTypeColor(selectedTx.type).bg} ${getTypeColor(selectedTx.type).text}`}>
                    {getTypeLabel(selectedTx.type)}
                  </span>
                  <BadgeStatut statut={selectedTx.statut} />
                </div>

                {/* Infos grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Téléphone', value: selectedTx.telephone },
                    { label: 'Région', value: selectedTx.region },
                    { label: 'Commune', value: selectedTx.commune },
                    { label: 'Date', value: `${new Date(selectedTx.date).toLocaleDateString('fr-FR')} à ${selectedTx.heure}` },
                    { label: 'Mois en cours', value: `${selectedTx.montant.mois.toLocaleString()} FCFA` },
                    { label: 'Cumul annuel', value: `${selectedTx.montant.annuel.toLocaleString()} FCFA` },
                    { label: 'Historique', value: `${selectedTx.montant.historique.toLocaleString()} FCFA` },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-2xl p-3">
                      <p className="text-xs text-gray-400 font-semibold mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Motif rejet si applicable */}
                {selectedTx.motifRejet && (
                  <div className="bg-red-50 rounded-2xl p-4 border-2 border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <p className="text-sm font-bold text-red-700">Motif de rejet</p>
                    </div>
                    <p className="text-sm text-red-600">{selectedTx.motifRejet}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {selectedTx.statut === 'en_attente' && (
                    <>
                      <motion.button
                        onClick={() => { toast.success('Transaction validée'); setSelectedTx(null); }}
                        className="flex-1 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#16A34A' }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <CheckCircle className="w-4 h-4" />
                        Valider
                      </motion.button>
                      <motion.button
                        onClick={() => { toast.error('Transaction rejetée'); setSelectedTx(null); }}
                        className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-red-500 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </motion.button>
                    </>
                  )}
                  {selectedTx.statut !== 'en_attente' && (
                    <motion.button
                      onClick={() => { toast('Export de la transaction'); setSelectedTx(null); }}
                      className="flex-1 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                      style={{ backgroundColor: C }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Download className="w-4 h-4" />
                      Exporter ce dossier
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}