import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, Download, FileText, TrendingUp, Users, Wallet,
  Calendar, Filter, CheckCircle2, RefreshCw, Globe, MapPin,
  ArrowUpRight, Printer, Table, PieChart, Activity, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const PERIODES = ['7 derniers jours', '30 derniers jours', '3 derniers mois', '6 derniers mois', 'Cette année', 'Personnalisé'];
const REGIONS_LIST = ['Toutes les régions', 'Abidjan', 'Bouaké', 'Korhogo', 'San Pédro', 'Yamoussoukro', 'Man', 'Daloa'];

const MONTHLY_DATA = [
  { mois: 'Sep', acteurs: 820, transactions: 1240, volume: 42, commissions: 1.2, dossiers: 98 },
  { mois: 'Oct', acteurs: 1050, transactions: 1680, volume: 58, commissions: 1.7, dossiers: 142 },
  { mois: 'Nov', acteurs: 1380, transactions: 2100, volume: 74, commissions: 2.2, dossiers: 187 },
  { mois: 'Déc', acteurs: 1620, transactions: 2560, volume: 89, commissions: 2.7, dossiers: 234 },
  { mois: 'Jan', acteurs: 1890, transactions: 3020, volume: 105, commissions: 3.2, dossiers: 289 },
  { mois: 'Fév', acteurs: 2240, transactions: 3580, volume: 128, commissions: 3.9, dossiers: 356 },
  { mois: 'Mar', acteurs: 2680, transactions: 4120, volume: 158, commissions: 4.8, dossiers: 412 },
];

const REGION_PERF = [
  { region: 'Abidjan', acteurs: 8064, volume: 223, taux: 94, commissions: 2.8, color: BO_PRIMARY },
  { region: 'Bouaké', acteurs: 1876, volume: 45, taux: 78, commissions: 0.58, color: '#3B82F6' },
  { region: 'Korhogo', acteurs: 1204, volume: 38, taux: 71, commissions: 0.48, color: '#10B981' },
  { region: 'San Pédro', acteurs: 892, volume: 28, taux: 65, commissions: 0.34, color: '#8B5CF6' },
  { region: 'Yamoussoukro', acteurs: 634, volume: 18, taux: 52, commissions: 0.22, color: '#F59E0B' },
  { region: 'Man', acteurs: 398, volume: 11, taux: 44, commissions: 0.14, color: '#EF4444' },
];

const TYPE_DATA = [
  { name: 'Marchands', value: 5842, color: '#C66A2C' },
  { name: 'Producteurs', value: 3210, color: '#2E8B57' },
  { name: 'Coopératives', value: 892, color: '#1D4ED8' },
  { name: 'Identificateurs', value: 726, color: BO_PRIMARY },
];

const RADAR_DATA = [
  { subject: 'Activité', Abidjan: 95, Bouaké: 72, Korhogo: 65 },
  { subject: 'Croissance', Abidjan: 88, Bouaké: 61, Korhogo: 54 },
  { subject: 'Volume', Abidjan: 97, Bouaké: 45, Korhogo: 38 },
  { subject: 'Satisfaction', Abidjan: 82, Bouaké: 78, Korhogo: 71 },
  { subject: 'Compliance', Abidjan: 91, Bouaké: 83, Korhogo: 76 },
  { subject: 'Enrôlement', Abidjan: 93, Bouaké: 69, Korhogo: 62 },
];

const REPORTS_TYPES = [
  { id: 'acteurs', label: 'Rapport Acteurs', desc: 'Liste complète avec statuts et KPIs', icon: Users, color: '#C66A2C', pages: 12 },
  { id: 'financier', label: 'Rapport Financier', desc: 'Volumes, commissions, flux de trésorerie', icon: Wallet, color: '#10B981', pages: 8 },
  { id: 'enrolement', label: 'Rapport Enrôlement', desc: 'Dossiers soumis, approuvés, rejetés', icon: FileText, color: '#3B82F6', pages: 6 },
  { id: 'performance', label: 'Performance Régionale', desc: 'KPIs par zone, comparaison régions', icon: Globe, color: '#8B5CF6', pages: 10 },
  { id: 'audit', label: 'Rapport Audit', desc: 'Traçabilité complète des actions BO', icon: Activity, color: BO_PRIMARY, pages: 15 },
  { id: 'academy', label: 'Rapport Academy', desc: 'Taux de complétion, scores, missions', icon: TrendingUp, color: '#F59E0B', pages: 7 },
];

function StatCard({ label, value, sub, icon: Icon, color, trend }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-xl">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-3">
      <p className="font-bold text-gray-900 text-sm mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>{p.name} : {p.value.toLocaleString()}</p>
      ))}
    </div>
  );
};

export function BORapports() {
  const { hasPermission } = useBackOffice();
  const [periode, setPeriode] = useState('30 derniers jours');
  const [region, setRegion] = useState('Toutes les régions');
  const [activeChart, setActiveChart] = useState<'area' | 'bar' | 'line'>('area');
  const [activeMetric, setActiveMetric] = useState<'acteurs' | 'transactions' | 'volume' | 'commissions'>('acteurs');
  const [generating, setGenerating] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleGenerate = async (reportId: string, label: string) => {
    setGenerating(reportId);
    await new Promise(r => setTimeout(r, 1800));
    setGenerating(null);
    toast.success(`${label} généré`, { description: 'Le fichier PDF est prêt au téléchargement.' });
  };

  const handleExportCSV = () => {
    toast.success('Export CSV démarré', { description: 'Le fichier sera téléchargé dans quelques secondes.' });
  };

  const METRIC_COLORS: Record<string, string> = {
    acteurs: BO_PRIMARY,
    transactions: '#3B82F6',
    volume: '#10B981',
    commissions: '#8B5CF6',
  };
  const METRIC_LABELS: Record<string, string> = {
    acteurs: 'Acteurs enrôlés',
    transactions: 'Transactions',
    volume: 'Volume (M FCFA)',
    commissions: 'Commissions (M FCFA)',
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Rapports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Supervision nationale — données au 02 Mars 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-bold text-sm"
            style={{ borderColor: showFilters ? BO_PRIMARY : '#e5e7eb', color: showFilters ? BO_PRIMARY : '#374151' }}
            whileTap={{ scale: 0.97 }}>
            <Filter className="w-4 h-4" /> Filtres
          </motion.button>
          <motion.button onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-bold text-sm shadow-lg"
            style={{ backgroundColor: BO_PRIMARY }}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Download className="w-4 h-4" /> Exporter CSV
          </motion.button>
        </div>
      </motion.div>

      {/* Filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Période</label>
                <div className="flex flex-wrap gap-2">
                  {PERIODES.slice(0, 5).map(p => (
                    <button key={p} onClick={() => setPeriode(p)}
                      className="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all"
                      style={{ borderColor: periode === p ? BO_PRIMARY : '#e5e7eb', backgroundColor: periode === p ? `${BO_PRIMARY}15` : 'transparent', color: periode === p ? BO_PRIMARY : '#6b7280' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Région</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS_LIST.slice(0, 5).map(r => (
                    <button key={r} onClick={() => setRegion(r)}
                      className="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all"
                      style={{ borderColor: region === r ? BO_PRIMARY : '#e5e7eb', backgroundColor: region === r ? `${BO_PRIMARY}15` : 'transparent', color: region === r ? BO_PRIMARY : '#6b7280' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Acteurs" value="12 670" sub="Enrôlés et validés" icon={Users} color={BO_PRIMARY} trend="+18%" />
        <StatCard label="Volume échangé" value="334 M" sub="FCFA ce mois" icon={Wallet} color="#10B981" trend="+23%" />
        <StatCard label="Transactions" value="4 120" sub="Ce mois" icon={BarChart3} color="#3B82F6" trend="+12%" />
        <StatCard label="Commissions" value="4,8 M" sub="FCFA générées" icon={TrendingUp} color="#8B5CF6" trend="+19%" />
      </div>

      {/* Graphique principal */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-black text-gray-900 text-lg">Évolution nationale</h2>
            <p className="text-xs text-gray-400">{periode} — {region}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Metric switcher */}
            {(Object.keys(METRIC_LABELS) as (keyof typeof METRIC_LABELS)[]).map(m => (
              <button key={m} onClick={() => setActiveMetric(m)}
                className="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all"
                style={{ borderColor: activeMetric === m ? METRIC_COLORS[m] : '#e5e7eb', backgroundColor: activeMetric === m ? `${METRIC_COLORS[m]}15` : 'transparent', color: activeMetric === m ? METRIC_COLORS[m] : '#9ca3af' }}>
                {METRIC_LABELS[m]}
              </button>
            ))}
            {/* Chart type */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {(['area', 'bar', 'line'] as const).map(t => (
                <button key={t} onClick={() => setActiveChart(t)}
                  className="px-2 py-1 rounded-lg text-xs font-bold transition-all"
                  style={{ backgroundColor: activeChart === t ? 'white' : 'transparent', color: activeChart === t ? BO_DARK : '#9ca3af', boxShadow: activeChart === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                  {t === 'area' ? 'Aire' : t === 'bar' ? 'Barres' : 'Ligne'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          {activeChart === 'bar' ? (
            <BarChart data={MONTHLY_DATA} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={activeMetric} name={METRIC_LABELS[activeMetric]} fill={METRIC_COLORS[activeMetric]} radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : activeChart === 'line' ? (
            <LineChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey={activeMetric} name={METRIC_LABELS[activeMetric]} stroke={METRIC_COLORS[activeMetric]} strokeWidth={3} dot={{ fill: METRIC_COLORS[activeMetric], r: 5 }} />
            </LineChart>
          ) : (
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id={`grad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={METRIC_COLORS[activeMetric]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={METRIC_COLORS[activeMetric]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={activeMetric} name={METRIC_LABELS[activeMetric]} stroke={METRIC_COLORS[activeMetric]} strokeWidth={3} fill={`url(#grad-${activeMetric})`} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </motion.div>

      {/* Grille graphiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Répartition types acteurs */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-900 mb-4">Répartition par type d'acteur</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <RechartsPie>
                <Pie data={TYPE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {TYPE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {TYPE_DATA.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-semibold text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-gray-900">{item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-gray-500">Total</span>
                  <span className="text-xs font-black text-gray-900">{TYPE_DATA.reduce((s, i) => s + i.value, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Radar régional */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-900 mb-4">Comparaison régionale (Top 3)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#f0f0f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700 }} />
              <Radar name="Abidjan" dataKey="Abidjan" stroke={BO_PRIMARY} fill={BO_PRIMARY} fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Bouaké" dataKey="Bouaké" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Korhogo" dataKey="Korhogo" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} />
              <Legend iconType="circle" iconSize={8} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tableau performances régionales */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-gray-900">Performance par région</h3>
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 font-semibold">{REGION_PERF.length} régions</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100">
                {['Région', 'Acteurs', 'Volume (M FCFA)', 'Commissions (M)', 'Taux activité', 'Score'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-black text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REGION_PERF.map((r, i) => (
                <motion.tr key={r.region}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="font-bold text-gray-900">{r.region}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-700">{r.acteurs.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-gray-900">{r.volume} M</td>
                  <td className="py-3 px-3 font-bold" style={{ color: '#10B981' }}>{r.commissions} M</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full max-w-[80px]">
                        <div className="h-2 rounded-full" style={{ width: `${r.taux}%`, backgroundColor: r.color }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{r.taux}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, si) => (
                        <div key={si} className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: si < Math.round(r.taux / 20) ? r.color : '#e5e7eb' }} />
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Génération de rapports */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${BO_PRIMARY}15` }}>
            <Printer className="w-5 h-5" style={{ color: BO_PRIMARY }} />
          </div>
          <div>
            <h3 className="font-black text-gray-900">Génération de rapports PDF</h3>
            <p className="text-xs text-gray-400">Rapports officiels prêts à imprimer ou partager</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORTS_TYPES.map(report => {
            const Icon = report.icon;
            const isGenerating = generating === report.id;
            return (
              <motion.div key={report.id}
                className="p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all"
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${report.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: report.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{report.label}</p>
                    <p className="text-xs text-gray-500">{report.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <FileText className="w-3 h-3" />
                    <span>{report.pages} pages</span>
                  </div>
                  <motion.button onClick={() => handleGenerate(report.id, report.label)}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                    style={{ backgroundColor: isGenerating ? `${report.color}60` : report.color }}
                    whileHover={!isGenerating ? { scale: 1.05 } : {}}
                    whileTap={!isGenerating ? { scale: 0.95 } : {}}>
                    {isGenerating ? (
                      <motion.div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    {isGenerating ? 'Génération...' : 'Générer PDF'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}
