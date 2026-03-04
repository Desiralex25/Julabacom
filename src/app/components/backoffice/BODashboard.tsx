import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, TrendingUp, Wallet, Target, AlertTriangle,
  CheckCircle2, Clock, XCircle, BarChart3, MapPin,
  ArrowUpRight, ArrowDownRight, Activity, ShieldAlert,
  UserCheck, Zap, Globe, Award, Bell, FileText,
  ChevronRight, RefreshCw, Eye, BookOpen,
} from 'lucide-react';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { useNavigate } from 'react-router';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const MONTHLY_DATA = [
  { mois: 'Sep', acteurs: 820, transactions: 1240, volume: 42 },
  { mois: 'Oct', acteurs: 1050, transactions: 1680, volume: 58 },
  { mois: 'Nov', acteurs: 1380, transactions: 2100, volume: 74 },
  { mois: 'Déc', acteurs: 1620, transactions: 2560, volume: 89 },
  { mois: 'Jan', acteurs: 1890, transactions: 3020, volume: 105 },
  { mois: 'Fév', acteurs: 2240, transactions: 3580, volume: 128 },
  { mois: 'Mar', acteurs: 2680, transactions: 4120, volume: 158 },
];

const REGION_DATA = [
  { region: 'Abidjan', acteurs: 8064, volume: 223, color: BO_PRIMARY },
  { region: 'Bouaké', acteurs: 1876, volume: 45, color: '#3B82F6' },
  { region: 'Korhogo', acteurs: 1204, volume: 38, color: '#10B981' },
  { region: 'San Pédro', acteurs: 892, volume: 28, color: '#8B5CF6' },
  { region: 'Yamoussoukro', acteurs: 634, volume: 18, color: '#F59E0B' },
];

const TYPE_DATA = [
  { name: 'Marchands', value: 5842, color: '#C66A2C' },
  { name: 'Producteurs', value: 3210, color: '#2E8B57' },
  { name: 'Coopératives', value: 892, color: '#1D4ED8' },
  { name: 'Identificateurs', value: 726, color: BO_PRIMARY },
];

const ALERTES = [
  { id: 1, type: 'critical', icon: ShieldAlert, titre: 'Fraude suspectée', desc: 'Activité anormale sur le compte BAMBA Koffi (Adjamé) — 47 transactions en 2h', temps: '12 min', region: 'Abidjan' },
  { id: 2, type: 'warning', icon: Clock, titre: '5 dossiers en attente +72h', desc: 'Dossiers sans réponse de validation depuis plus de 72h', temps: '3h', region: 'National' },
  { id: 3, type: 'warning', icon: Activity, titre: 'Inactivité régionale', desc: 'Zone Yamoussoukro Centre : aucune transaction depuis 8 jours', temps: '1j', region: 'Yamoussoukro' },
  { id: 4, type: 'info', icon: AlertTriangle, titre: 'Pic d\'activité Adjamé', desc: 'Volume de transactions x3 sur le Marché d\'Adjamé ce matin', temps: '2h', region: 'Abidjan' },
];

// Ticker live — transactions simulées en temps réel
const TICKER_ITEMS = [
  { nom: 'KOUASSI J.', type: 'Marchand', montant: '37 500', region: 'Cocody', positif: true },
  { nom: 'KOFFI M.', type: 'Producteur', montant: '140 000', region: 'Yopougon', positif: true },
  { nom: 'COULIBALY I.', type: 'Coopérative', montant: '285 000', region: 'Treichville', positif: true },
  { nom: 'YAO P.', type: 'Marchand', montant: '12 500', region: 'Bouaké', positif: true },
  { nom: 'DIOMANDE S.', type: 'Producteur', montant: '98 000', region: 'Korhogo', positif: true },
  { nom: 'SORO K.', type: 'Marchand', montant: '45 200', region: 'San Pédro', positif: true },
  { nom: 'TOURE A.', type: 'Producteur', montant: '67 300', region: 'Yamoussoukro', positif: true },
  { nom: 'BAMBA K.', type: 'Marchand', montant: '-18 000', region: 'Adjamé', positif: false },
];

const OBJECTIFS = [
  { label: 'Acteurs enrôlés', current: 12670, target: 15000, color: BO_PRIMARY },
  { label: 'Digitalisation', current: 78, target: 90, color: '#3B82F6', suffix: '%' },
  { label: 'Taux validation', current: 84, target: 95, color: '#10B981', suffix: '%' },
  { label: 'Inclusion sociale', current: 64, target: 75, color: '#8B5CF6', suffix: '%' },
];

const QUICK_ACTIONS = [
  { label: 'Valider dossiers', icon: CheckCircle2, path: '/backoffice/enrolement', color: '#10B981', badge: 5 },
  { label: 'Alertes actives', icon: ShieldAlert, path: '/backoffice/notifications', color: '#EF4444', badge: 4 },
  { label: 'Supervision', icon: Eye, path: '/backoffice/supervision', color: '#3B82F6' },
  { label: 'Rapports', icon: BarChart3, path: '/backoffice/rapports', color: '#8B5CF6' },
  { label: 'Acteurs', icon: Users, path: '/backoffice/acteurs', color: BO_PRIMARY },
  { label: 'Commissions', icon: Wallet, path: '/backoffice/commissions', color: '#C66A2C' },
];

// Compteur animé
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const duration = 1200;

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);

  return <>{prefix}{count.toLocaleString('fr-FR')}{suffix}</>;
}

function KPICard({ label, value, sub, icon: Icon, color, trend, trendUp, animated, target }: any) {
  return (
    <motion.div
      className="bg-white rounded-3xl p-5 shadow-md border-2 border-gray-100 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: `0 12px 32px ${color}25` }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <motion.div className="absolute right-0 top-0 w-24 h-24 rounded-full opacity-10"
        style={{ backgroundColor: color, transform: 'translate(30%, -30%)' }}
        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 3, repeat: Infinity }} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} strokeWidth={2.5} />
        </div>
      </div>
      <p className="text-3xl font-black text-gray-900 mb-1">
        {animated && target !== undefined
          ? <AnimatedCounter target={target} />
          : value}
      </p>
      <div className="flex items-center gap-2">
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-bold ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
        <span className="text-xs text-gray-500">{sub}</span>
      </div>
    </motion.div>
  );
}

export function BODashboard() {
  const { acteurs, dossiers, transactions, zones, boUser } = useBackOffice();
  const navigate = useNavigate();
  const [activeAlerte, setActiveAlerte] = useState<number | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const totalActeurs = acteurs.length;
  const actifs = acteurs.filter(a => a.statut === 'actif').length;
  const suspendus = acteurs.filter(a => a.statut === 'suspendu').length;
  const volumeTotal = transactions.reduce((s, t) => s + t.montant, 0);
  const commissionsTotal = transactions.reduce((s, t) => s + t.commission, 0);
  const dossiersPending = dossiers.filter(d => d.statut === 'pending').length;

  // Ticker auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(i => (i + 1) % TICKER_ITEMS.length);
      setLastUpdate(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentTicker = TICKER_ITEMS[tickerIndex];

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Vue nationale — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <motion.div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-green-50 border-2 border-green-200"
          animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-bold text-green-700">En direct</span>
        </motion.div>
      </motion.div>

      {/* Ticker live */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 overflow-hidden"
        style={{ backgroundColor: BO_DARK, borderColor: `${BO_PRIMARY}40` }}>
        <div className="flex items-center gap-0">
          <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0 border-r border-white/10"
            style={{ backgroundColor: BO_PRIMARY }}>
            <Activity className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-black uppercase tracking-widest">Live</span>
          </div>
          <div className="flex-1 px-4 py-3 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div key={tickerIndex}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 text-xs">
                <span className="text-white/50">Nouvelle transaction :</span>
                <span className="font-bold text-white">{currentTicker.nom}</span>
                <span className="text-white/50">({currentTicker.type} — {currentTicker.region})</span>
                <span className={`font-black ${currentTicker.positif ? 'text-green-400' : 'text-red-400'}`}>
                  {currentTicker.positif ? '+' : ''}{currentTicker.montant} FCFA
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="px-4 py-3 text-white/30 text-[10px] flex-shrink-0 border-l border-white/10">
            {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Acteurs" value="" animated target={totalActeurs + 12660} sub="enregistrés" icon={Users} color={BO_PRIMARY} trend="+12%" trendUp={true} />
        <KPICard label="Acteurs Actifs" value="" animated target={actifs + 12540} sub={`du total`} icon={UserCheck} color="#10B981" trend="+8%" trendUp={true} />
        <KPICard label="Volume Total" value={`${(volumeTotal / 1000000 + 329).toFixed(0)}M FCFA`} sub="ce mois" icon={Wallet} color="#3B82F6" trend="+23%" trendUp={true} />
        <KPICard label="Commissions" value={`${(commissionsTotal + 4742000).toLocaleString('fr-FR')} F`} sub="générées" icon={Award} color="#8B5CF6" trend="+15%" trendUp={true} />
        <KPICard label="Suspendus" value={suspendus} sub="acteurs" icon={XCircle} color="#EF4444" trend="-2%" trendUp={false} />
        <KPICard label="En Attente" value={dossiersPending} sub="dossiers à valider" icon={Clock} color="#F59E0B" />
        <KPICard label="Digitalisation" value="78%" sub="objectif 90%" icon={Globe} color={BO_DARK} trend="+5pts" trendUp={true} />
        <KPICard label="Inclusion Sociale" value="64%" sub="objectif 75%" icon={Target} color="#C66A2C" trend="+3pts" trendUp={true} />
      </div>

      {/* Actions rapides */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-sm">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Accès rapide</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <motion.button key={action.label} onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all relative"
                whileHover={{ y: -3, boxShadow: `0 8px 20px ${action.color}20` }}
                whileTap={{ scale: 0.95 }}>
                {action.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center z-10">
                    {action.badge}
                  </span>
                )}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${action.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Croissance mensuelle */}
        <motion.div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-gray-900 text-lg">Croissance Mensuelle</h2>
              <p className="text-xs text-gray-500">Acteurs enrôlés et transactions</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border-2" style={{ borderColor: BO_PRIMARY, color: BO_PRIMARY }}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold">+12%/mois</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="colorActeurs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BO_PRIMARY} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={BO_PRIMARY} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: `2px solid ${BO_PRIMARY}20`, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="acteurs" stroke={BO_PRIMARY} fill="url(#colorActeurs)" strokeWidth={2.5} name="Acteurs" />
              <Area type="monotone" dataKey="transactions" stroke="#3B82F6" fill="url(#colorTx)" strokeWidth={2.5} name="Transactions" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Répartition types */}
        <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="font-black text-gray-900 text-lg mb-1">Répartition</h2>
          <p className="text-xs text-gray-500 mb-4">Par type d'acteur</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={TYPE_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={3}>
                {TYPE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} formatter={(v: number) => v.toLocaleString('fr-FR')} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {TYPE_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs font-semibold text-gray-700">{d.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{d.value.toLocaleString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Objectifs nationaux */}
      <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-black text-gray-900 text-lg">Objectifs Nationaux Q1 2026</h2>
            <p className="text-xs text-gray-500">Progression vers les cibles fixées</p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold border-2" style={{ borderColor: BO_PRIMARY, color: BO_PRIMARY }}>
            Mars 2026
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {OBJECTIFS.map((obj, i) => {
            const pct = Math.round(
              obj.suffix ? obj.current / obj.target * 100
              : obj.current / obj.target * 100
            );
            return (
              <motion.div key={obj.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-600">{obj.label}</span>
                  <span className="text-xs font-black" style={{ color: obj.color }}>{pct}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <motion.div className="h-full rounded-full"
                    style={{ backgroundColor: obj.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.1 }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{obj.suffix ? `${obj.current}${obj.suffix}` : obj.current.toLocaleString()}</span>
                  <span>Cible : {obj.suffix ? `${obj.target}${obj.suffix}` : obj.target.toLocaleString()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Activité régionale + Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Activité par région */}
        <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-gray-900 text-lg">Activité par Région</h2>
              <p className="text-xs text-gray-500">Acteurs et volume (M FCFA)</p>
            </div>
            <motion.button onClick={() => navigate('/backoffice/zones')}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border-2"
              style={{ borderColor: `${BO_PRIMARY}40`, color: BO_PRIMARY }}
              whileTap={{ scale: 0.95 }}>
              Voir tout <ChevronRight className="w-3 h-3" />
            </motion.button>
          </div>
          <div className="space-y-4">
            {REGION_DATA.map((r, i) => (
              <motion.div key={r.region} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="text-sm font-bold text-gray-800">{r.region}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                    <span>{r.acteurs.toLocaleString()} acteurs</span>
                    <span className="font-black" style={{ color: r.color }}>{r.volume}M F</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ backgroundColor: r.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.acteurs / 8064) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.1 * i }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Alertes critiques */}
        <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-gray-900 text-lg">Alertes Actives</h2>
            <div className="flex items-center gap-2">
              <motion.div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 border-2 border-red-200"
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Zap className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-600">{ALERTES.length} alertes</span>
              </motion.div>
              <motion.button onClick={() => navigate('/backoffice/notifications')}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border-2"
                style={{ borderColor: `${BO_PRIMARY}40`, color: BO_PRIMARY }}
                whileTap={{ scale: 0.95 }}>
                Tout voir <ChevronRight className="w-3 h-3" />
              </motion.button>
            </div>
          </div>
          <div className="space-y-3">
            {ALERTES.map(alerte => {
              const Icon = alerte.icon;
              const isCritical = alerte.type === 'critical';
              const isWarning = alerte.type === 'warning';
              return (
                <motion.button key={alerte.id}
                  onClick={() => setActiveAlerte(activeAlerte === alerte.id ? null : alerte.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${isCritical ? 'bg-red-50 border-red-200' : isWarning ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <div className="flex items-start gap-3">
                    <motion.div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCritical ? 'bg-red-100' : isWarning ? 'bg-orange-100' : 'bg-blue-100'}`}
                      animate={isCritical ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Icon className={`w-5 h-5 ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-blue-600'}`} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-bold text-sm text-gray-900">{alerte.titre}</p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">il y a {alerte.temps}</span>
                      </div>
                      <AnimatePresence>
                        {activeAlerte === alerte.id && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-gray-600 mt-1">{alerte.desc}</motion.p>
                        )}
                      </AnimatePresence>
                      {activeAlerte !== alerte.id && (
                        <p className="text-xs text-gray-500 truncate">{alerte.desc}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400 font-semibold">{alerte.region}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Performance Identificateurs */}
      <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-black text-gray-900 text-lg">Performance Identificateurs</h2>
            <p className="text-xs text-gray-500">Top 5 — dossiers validés ce mois</p>
          </div>
          <motion.button onClick={() => navigate('/backoffice/acteurs')}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border-2"
            style={{ borderColor: `${BO_PRIMARY}40`, color: BO_PRIMARY }}
            whileTap={{ scale: 0.95 }}>
            Voir tous <ChevronRight className="w-3 h-3" />
          </motion.button>
        </div>
        <div className="space-y-3">
          {[
            { nom: 'GNAGNE Brice-Olivier', zone: 'Grand Abidjan Nord', dossiers: 47, objectif: 50, commission: 4700, taux: 94 },
            { nom: 'TOURE Aminata', zone: 'Grand Abidjan Sud', dossiers: 38, objectif: 40, commission: 3800, taux: 95 },
            { nom: 'KONE Drissa', zone: 'Bouaké Centre', dossiers: 31, objectif: 35, commission: 3100, taux: 89 },
            { nom: 'SORO Abib', zone: 'Korhogo Nord', dossiers: 28, objectif: 30, commission: 2800, taux: 93 },
            { nom: 'DIALLO Awa', zone: 'San Pédro Littoral', dossiers: 22, objectif: 30, commission: 2200, taux: 73 },
          ].map((ident, i) => (
            <motion.div key={ident.nom} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border-2 border-gray-100"
              initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 text-white"
                style={{ backgroundColor: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : i === 2 ? '#C66A2C' : BO_DARK }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-sm text-gray-900 truncate">{ident.nom}</p>
                  <span className="text-xs font-black ml-2 flex-shrink-0" style={{ color: BO_PRIMARY }}>{ident.dossiers}/{ident.objectif}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ backgroundColor: ident.taux >= 90 ? '#10B981' : ident.taux >= 70 ? BO_PRIMARY : '#EF4444' }}
                      initial={{ width: 0 }} animate={{ width: `${ident.taux}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.08 }} />
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{ident.taux}%</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{ident.zone} • Commission: {ident.commission.toLocaleString('fr-FR')} F</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}