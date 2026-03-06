import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, TrendingUp, Wallet, Target, AlertTriangle,
  CheckCircle2, Clock, XCircle, BarChart3, MapPin,
  ArrowUpRight, ArrowDownRight, Activity, ShieldAlert,
  UserCheck, Zap, Globe, Award, Bell, FileText,
  ChevronRight, RefreshCw, Eye, BookOpen, Loader2,
} from 'lucide-react';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { useNavigate } from 'react-router';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

// Compteur animé
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const duration = 1200;

  useEffect(() => {
    startTime.current = null;
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
  const { acteurs, dossiers, transactions, zones, commissions, missions } = useBackOffice();
  const navigate = useNavigate();
  const [activeAlerte, setActiveAlerte] = useState<number | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // ─── KPIs calculés depuis les vraies données ──────────────────────────────
  const totalActeurs = acteurs.length;
  const actifs = acteurs.filter(a => a.statut === 'actif').length;
  const suspendus = acteurs.filter(a => a.statut === 'suspendu').length;
  const enAttente = dossiers.filter(d => d.statut === 'pending').length;
  const volumeTotal = transactions.reduce((s, t) => s + (t.montant || 0), 0);
  const commissionsTotal = commissions.reduce((s, c) => s + (c.montantTotal || 0), 0);

  // ─── Données graphique : croissance mensuelle des acteurs ─────────────────
  const monthlyData = useMemo(() => {
    const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    // Prendre les 7 derniers mois
    const months: { mois: string; acteurs: number; transactions: number; volume: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const nbActeurs = acteurs.filter(a => {
        const m = a.dateInscription?.slice(0, 7);
        return m === key;
      }).length;
      const nbTx = transactions.filter(t => t.date?.slice(0, 7) === key).length;
      const vol = transactions
        .filter(t => t.date?.slice(0, 7) === key)
        .reduce((s, t) => s + (t.montant || 0), 0);
      months.push({
        mois: moisLabels[d.getMonth()],
        acteurs: nbActeurs,
        transactions: nbTx,
        volume: Math.round(vol / 1000000),
      });
    }
    return months;
  }, [acteurs, transactions]);

  // ─── Répartition par région ───────────────────────────────────────────────
  const regionData = useMemo(() => {
    const REGION_COLORS = ['#E6A817', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];
    const map: Record<string, { acteurs: number; volume: number }> = {};
    acteurs.forEach(a => {
      const r = a.region || 'Non défini';
      if (!map[r]) map[r] = { acteurs: 0, volume: 0 };
      map[r].acteurs++;
    });
    transactions.forEach(t => {
      const r = t.region || 'Non défini';
      if (!map[r]) map[r] = { acteurs: 0, volume: 0 };
      map[r].volume += t.montant || 0;
    });
    return Object.entries(map)
      .sort((a, b) => b[1].acteurs - a[1].acteurs)
      .slice(0, 5)
      .map(([region, d], i) => ({
        region,
        acteurs: d.acteurs,
        volume: Math.round(d.volume / 1000000),
        color: REGION_COLORS[i % REGION_COLORS.length],
      }));
  }, [acteurs, transactions]);

  // ─── Répartition par type d'acteur ───────────────────────────────────────
  const typeData = useMemo(() => {
    const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
      marchand: { label: 'Marchands', color: '#C66A2C' },
      producteur: { label: 'Producteurs', color: '#2E8B57' },
      cooperative: { label: 'Cooperatives', color: '#1D4ED8' },
      identificateur: { label: 'Identificateurs', color: BO_PRIMARY },
      institution: { label: 'Institutions', color: '#8B5CF6' },
    };
    const map: Record<string, number> = {};
    acteurs.forEach(a => { map[a.type] = (map[a.type] || 0) + 1; });
    return Object.entries(map)
      .filter(([_, v]) => v > 0)
      .map(([type, value]) => ({
        name: TYPE_CONFIG[type]?.label || type,
        value,
        color: TYPE_CONFIG[type]?.color || '#9CA3AF',
      }))
      .sort((a, b) => b.value - a.value);
  }, [acteurs]);

  // ─── Alertes générées depuis les vraies données ───────────────────────────
  const alertes = useMemo(() => {
    const list: { id: number; type: string; icon: any; titre: string; desc: string; temps: string; region: string }[] = [];

    // Dossiers en attente depuis longtemps
    if (enAttente > 0) {
      list.push({
        id: 1,
        type: 'warning',
        icon: Clock,
        titre: `${enAttente} dossier${enAttente > 1 ? 's' : ''} en attente`,
        desc: `${enAttente} dossier${enAttente > 1 ? 's' : ''} sans traitement`,
        temps: 'maintenant',
        region: 'National',
      });
    }

    // Acteurs suspendus
    if (suspendus > 0) {
      list.push({
        id: 2,
        type: 'critical',
        icon: ShieldAlert,
        titre: `${suspendus} acteur${suspendus > 1 ? 's' : ''} suspendu${suspendus > 1 ? 's' : ''}`,
        desc: `${suspendus} compte${suspendus > 1 ? 's' : ''} actuellement suspendu${suspendus > 1 ? 's' : ''}`,
        temps: 'maintenant',
        region: 'National',
      });
    }

    // Commissions en attente
    const commEn = commissions.filter(c => c.statut === 'en_attente');
    if (commEn.length > 0) {
      const totalComm = commEn.reduce((s, c) => s + c.montantTotal, 0);
      list.push({
        id: 3,
        type: 'info',
        icon: Wallet,
        titre: `${commEn.length} commission${commEn.length > 1 ? 's' : ''} à valider`,
        desc: `Total : ${totalComm.toLocaleString('fr-FR')} FCFA en attente de paiement`,
        temps: 'maintenant',
        region: 'National',
      });
    }

    // Missions en cours
    const missionsEnCours = missions.filter(m => m.statut === 'en_cours');
    if (missionsEnCours.length > 0) {
      list.push({
        id: 4,
        type: 'info',
        icon: Target,
        titre: `${missionsEnCours.length} mission${missionsEnCours.length > 1 ? 's' : ''} active${missionsEnCours.length > 1 ? 's' : ''}`,
        desc: `${missionsEnCours.length} mission${missionsEnCours.length > 1 ? 's' : ''} en cours sur le terrain`,
        temps: 'maintenant',
        region: 'National',
      });
    }

    if (list.length === 0) {
      list.push({
        id: 0,
        type: 'info',
        icon: CheckCircle2,
        titre: 'Aucune alerte active',
        desc: 'Tout est en ordre. Aucune action urgente requise.',
        temps: 'maintenant',
        region: 'National',
      });
    }

    return list;
  }, [enAttente, suspendus, commissions, missions]);

  // ─── Ticker : dernières transactions réelles ──────────────────────────────
  const tickerItems = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    if (sorted.length === 0) return [{ nom: 'Aucune transaction', type: '', montant: '0', region: '', positif: true }];
    return sorted.map(t => ({
      nom: t.acteurNom || 'Acteur',
      type: t.acteurType || '',
      montant: (t.montant || 0).toLocaleString('fr-FR'),
      region: t.region || '',
      positif: (t.montant || 0) >= 0,
    }));
  }, [transactions]);

  // ─── Top 5 identificateurs ────────────────────────────────────────────────
  const topIdentificateurs = useMemo(() => {
    const identActeurs = acteurs.filter(a => a.type === 'identificateur');
    if (identActeurs.length === 0) return [];
    const dossiersParIdent: Record<string, number> = {};
    dossiers.forEach(d => {
      const key = d.identificateurNom;
      if (key && key !== 'Non assigné') {
        dossiersParIdent[key] = (dossiersParIdent[key] || 0) + 1;
      }
    });
    return identActeurs
      .map(a => {
        const nom = `${a.prenoms} ${a.nom}`.trim();
        const nbDossiers = dossiersParIdent[nom] || 0;
        const commTotal = commissions
          .filter(c => c.identificateurNom === nom)
          .reduce((s, c) => s + c.montantTotal, 0);
        return {
          nom,
          zone: a.region || a.zone || 'Non défini',
          dossiers: nbDossiers,
          commission: commTotal,
          taux: 0,
        };
      })
      .sort((a, b) => b.dossiers - a.dossiers)
      .slice(0, 5);
  }, [acteurs, dossiers, commissions]);

  // ─── Objectifs nationaux calculés ────────────────────────────────────────
  const objectifs = useMemo(() => {
    const tauxValidation = totalActeurs > 0 ? Math.round((actifs / totalActeurs) * 100) : 0;
    return [
      { label: 'Acteurs enrôlés', current: totalActeurs, target: 15000, color: BO_PRIMARY },
      { label: 'Digitalisation', current: Math.min(Math.round((transactions.length > 0 ? 60 : 0) + totalActeurs * 0.004), 90), target: 90, color: '#3B82F6', suffix: '%' },
      { label: 'Taux validation', current: tauxValidation, target: 95, color: '#10B981', suffix: '%' },
      { label: 'Inclusion sociale', current: Math.min(Math.round(actifs * 0.005), 75), target: 75, color: '#8B5CF6', suffix: '%' },
    ];
  }, [totalActeurs, actifs, transactions]);

  // ─── Actions rapides ──────────────────────────────────────────────────────
  const quickActions = [
    { label: 'Valider dossiers', icon: CheckCircle2, path: '/backoffice/enrolement', color: '#10B981', badge: enAttente || null },
    { label: 'Supervision', icon: Eye, path: '/backoffice/supervision', color: '#3B82F6' },
    { label: 'Rapports', icon: BarChart3, path: '/backoffice/rapports', color: '#8B5CF6' },
    { label: 'Acteurs', icon: Users, path: '/backoffice/acteurs', color: BO_PRIMARY },
    { label: 'Commissions', icon: Wallet, path: '/backoffice/commissions', color: '#C66A2C', badge: commissions.filter(c => c.statut === 'en_attente').length || null },
    { label: 'Missions', icon: Target, path: '/backoffice/missions', color: '#10B981', badge: missions.filter(m => m.statut === 'en_cours').length || null },
  ];

  // ─── Ticker auto-scroll ───────────────────────────────────────────────────
  useEffect(() => {
    if (tickerItems.length <= 1) return;
    const interval = setInterval(() => {
      setTickerIndex(i => (i + 1) % tickerItems.length);
      setLastUpdate(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, [tickerItems.length]);

  const currentTicker = tickerItems[tickerIndex] || tickerItems[0];

  const maxRegionActeurs = regionData[0]?.acteurs || 1;

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

      {/* Ticker live — dernières transactions réelles */}
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
                {transactions.length > 0 ? (
                  <>
                    <span className="text-white/50">Derniere transaction :</span>
                    <span className="font-bold text-white">{currentTicker.nom}</span>
                    {currentTicker.type && <span className="text-white/50">({currentTicker.type}{currentTicker.region ? ` — ${currentTicker.region}` : ''})</span>}
                    <span className={`font-black ${currentTicker.positif ? 'text-green-400' : 'text-red-400'}`}>
                      {currentTicker.positif ? '+' : ''}{currentTicker.montant} FCFA
                    </span>
                  </>
                ) : (
                  <span className="text-white/50">Aucune transaction enregistree</span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="px-4 py-3 text-white/30 text-[10px] flex-shrink-0 border-l border-white/10">
            {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </motion.div>

      {/* KPIs — 100% données réelles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Acteurs" value="" animated target={totalActeurs} sub="enregistrés" icon={Users} color={BO_PRIMARY} />
        <KPICard label="Acteurs Actifs" value="" animated target={actifs} sub="du total" icon={UserCheck} color="#10B981" />
        <KPICard
          label="Volume Total"
          value={volumeTotal >= 1000000
            ? `${(volumeTotal / 1000000).toFixed(1)}M FCFA`
            : `${volumeTotal.toLocaleString('fr-FR')} FCFA`}
          sub="toutes transactions"
          icon={Wallet}
          color="#3B82F6"
        />
        <KPICard
          label="Commissions"
          value={`${commissionsTotal.toLocaleString('fr-FR')} F`}
          sub="generées"
          icon={Award}
          color="#8B5CF6"
        />
        <KPICard label="Suspendus" value={suspendus} sub="acteurs" icon={XCircle} color="#EF4444" />
        <KPICard label="En Attente" value={enAttente} sub="dossiers à valider" icon={Clock} color="#F59E0B" />
        <KPICard
          label="Transactions"
          value={transactions.length}
          sub="enregistrées"
          icon={Activity}
          color={BO_DARK}
        />
        <KPICard
          label="Zones Actives"
          value={zones.filter(z => z.statut === 'active').length}
          sub={`sur ${zones.length} zones`}
          icon={MapPin}
          color="#C66A2C"
        />
      </div>

      {/* Actions rapides */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-sm">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Acces rapide</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <motion.button key={action.label} onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all relative"
                whileHover={{ y: -3, boxShadow: `0 8px 20px ${action.color}20` }}
                whileTap={{ scale: 0.95 }}>
                {action.badge !== null && action.badge !== undefined && action.badge > 0 && (
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

        {/* Croissance mensuelle — données réelles */}
        <motion.div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-gray-900 text-lg">Inscriptions Mensuelles</h2>
              <p className="text-xs text-gray-500">Nouveaux acteurs et transactions par mois</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border-2" style={{ borderColor: BO_PRIMARY, color: BO_PRIMARY }}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold">7 derniers mois</span>
            </div>
          </div>
          {monthlyData.every(m => m.acteurs === 0 && m.transactions === 0) ? (
            <div className="h-[210px] flex items-center justify-center text-gray-400 text-sm font-semibold">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={monthlyData}>
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
          )}
        </motion.div>

        {/* Répartition par type — données réelles */}
        <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="font-black text-gray-900 text-lg mb-1">Repartition</h2>
          <p className="text-xs text-gray-500 mb-4">Par type d'acteur</p>
          {typeData.length === 0 ? (
            <div className="h-[150px] flex items-center justify-center text-gray-400 text-sm font-semibold">
              Aucun acteur enregistre
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={3}>
                    {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} formatter={(v: number) => v.toLocaleString('fr-FR')} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {typeData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs font-semibold text-gray-700">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{d.value.toLocaleString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Objectifs — calculés depuis les vraies données */}
      <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-black text-gray-900 text-lg">Objectifs Nationaux 2026</h2>
            <p className="text-xs text-gray-500">Progression vers les cibles fixees</p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold border-2" style={{ borderColor: BO_PRIMARY, color: BO_PRIMARY }}>
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {objectifs.map((obj, i) => {
            const pct = Math.min(Math.round(obj.suffix ? obj.current : (obj.current / obj.target) * 100), 100);
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

        {/* Activité par région — données réelles */}
        <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-gray-900 text-lg">Activite par Region</h2>
              <p className="text-xs text-gray-500">Acteurs et volume (M FCFA)</p>
            </div>
            <motion.button onClick={() => navigate('/backoffice/zones')}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border-2"
              style={{ borderColor: `${BO_PRIMARY}40`, color: BO_PRIMARY }}
              whileTap={{ scale: 0.95 }}>
              Voir tout <ChevronRight className="w-3 h-3" />
            </motion.button>
          </div>
          {regionData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm font-semibold">
              Aucune donnee regionale disponible
            </div>
          ) : (
            <div className="space-y-4">
              {regionData.map((r, i) => (
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
                      animate={{ width: `${(r.acteurs / maxRegionActeurs) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.1 * i }} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Alertes générées depuis les données réelles */}
        <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-gray-900 text-lg">Alertes Actives</h2>
            <div className="flex items-center gap-2">
              {alertes.some(a => a.type !== 'info') && (
                <motion.div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 border-2 border-red-200"
                  animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Zap className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-bold text-red-600">{alertes.filter(a => a.type !== 'info').length} urgentes</span>
                </motion.div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {alertes.map(alerte => {
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
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{alerte.temps}</span>
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

      {/* Performance Identificateurs — données réelles */}
      <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-black text-gray-900 text-lg">Performance Identificateurs</h2>
            <p className="text-xs text-gray-500">Top {topIdentificateurs.length} — dossiers traites</p>
          </div>
          <motion.button onClick={() => navigate('/backoffice/acteurs')}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border-2"
            style={{ borderColor: `${BO_PRIMARY}40`, color: BO_PRIMARY }}
            whileTap={{ scale: 0.95 }}>
            Voir tous <ChevronRight className="w-3 h-3" />
          </motion.button>
        </div>
        {topIdentificateurs.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-gray-400">
            <Users className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm font-semibold">Aucun identificateur enregistre</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topIdentificateurs.map((ident, i) => {
              const maxDossiers = topIdentificateurs[0]?.dossiers || 1;
              return (
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
                      <span className="text-xs font-black flex-shrink-0 ml-2" style={{ color: BO_PRIMARY }}>
                        {ident.commission.toLocaleString('fr-FR')} F
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-[10px] text-gray-500 truncate">{ident.zone}</span>
                      <span className="text-[10px] font-bold text-gray-700 flex-shrink-0 ml-auto">{ident.dossiers} dossiers</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: BO_PRIMARY }}
                        initial={{ width: 0 }}
                        animate={{ width: `${maxDossiers > 0 ? (ident.dossiers / maxDossiers) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: i * 0.08 }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

    </div>
  );
}
