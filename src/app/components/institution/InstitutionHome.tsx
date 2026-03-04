import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Volume2,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  MapPin,
  BarChart3,
  ShieldAlert,
  UserPlus,
  ArrowRight,
  Wifi,
  Heart,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { Navigation } from '../layout/Navigation';
import { Card } from '../ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import tantieSagesseImg from 'figma:asset/267116a23e4c64fcb00a127e2e64d1ebe888d92e.png';

const PRIMARY_COLOR = '#712864';

// ── Mock Data ────────────────────────────────────────────────────────────────
const MACRO_KPIs = {
  acteursActifs: 14_823,
  totalActeurs: 18_440,
  acteursSuspendus: 312,
  volumeTransactions: 9_287,
  valeurMonetaire: 4_862_500_000,
  pctDigitalisation: 68,
  pctInclusionCNPS: 42,
  pctInclusionCNAM: 37,
  croissanceMensuelle: 8.4,
};

const RESUME_JOUR = {
  nouveauxInscrits: 127,
  dossiersValides: 84,
  dossiersRejetes: 9,
  transactionsDuJour: 1_342,
  alertesCritiquesActives: 3,
};

const DATA_EVOLUTION = [
  { mois: 'Sep', transactions: 5200, valeur: 2.1 },
  { mois: 'Oct', transactions: 6100, valeur: 2.6 },
  { mois: 'Nov', transactions: 7800, valeur: 3.2 },
  { mois: 'Dec', transactions: 6900, valeur: 2.9 },
  { mois: 'Jan', transactions: 8400, valeur: 3.8 },
  { mois: 'Fev', transactions: 9100, valeur: 4.3 },
  { mois: 'Mar', transactions: 9287, valeur: 4.86 },
];

const DATA_REPARTITION = [
  { name: 'Marchands', value: 8640, color: '#C66A2C' },
  { name: 'Producteurs', value: 4920, color: '#2E8B57' },
  { name: 'Coopératives', value: 2180, color: '#2072AF' },
  { name: 'Identificateurs', value: 2700, color: '#9F8170' },
];

const DATA_REGIONS = [
  { region: 'Abidjan', acteurs: 6200 },
  { region: 'Bouaké', acteurs: 2800 },
  { region: 'Korhogo', acteurs: 1900 },
  { region: 'Daloa', acteurs: 1600 },
  { region: 'San-Pédro', acteurs: 1400 },
  { region: 'Autres', acteurs: 4540 },
];

const ALERTES = [
  { id: 1, type: 'baisse', message: 'Baisse activité de 22% à Korhogo cette semaine', severity: 'high' },
  { id: 2, type: 'pic', message: 'Pic anormal de transactions à Yopougon : +340%', severity: 'high' },
  { id: 3, type: 'inactivite', message: 'Région de Man inactive depuis 14 jours', severity: 'medium' },
  { id: 4, type: 'rejet', message: 'Taux rejet dossiers élevé : 18% à Abobo', severity: 'medium' },
  { id: 5, type: 'anomalie', message: 'Anomalie transaction détectée : réf. TXN-20260303-8821', severity: 'low' },
];

// ── Component ────────────────────────────────────────────────────────────────
export function InstitutionHome() {
  const navigate = useNavigate();
  const { user, speak, setIsModalOpen } = useApp();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAlertes, setShowAlertes] = useState(false);

  const handleListenMessage = () => {
    const msg = `Bonjour ${user?.firstName} ! La plateforme compte ${MACRO_KPIs.totalActeurs.toLocaleString()} acteurs dont ${MACRO_KPIs.acteursActifs.toLocaleString()} actifs. Volume de transactions : ${MACRO_KPIs.volumeTransactions.toLocaleString()}. Croissance mensuelle : ${MACRO_KPIs.croissanceMensuelle}%.`;
    speak(msg);
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 4000);
  };

  const handleTantieClick = () => {
    speak('Bonjour ! Je suis Tantie Sagesse. Comment puis-je vous aider avec la supervision nationale ?');
    setIsModalOpen(true);
  };

  const alertesHigh = ALERTES.filter(a => a.severity === 'high');

  return (
    <>
      <div className="pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50">

        {/* ── Tantie Sagesse — IDENTIQUE à IdentificateurHome ─────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-8"
        >
          <div className="flex items-stretch gap-2">
            {/* Image Tantie Sagesse à gauche — MÊME position/taille/animation */}
            <motion.div
              className="flex-shrink-0 flex items-center"
              animate={isSpeaking ? { y: [0, -8, 0] } : {}}
              transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0 }}
            >
              <motion.img
                src={tantieSagesseImg}
                alt="Tantie Sagesse"
                className="w-36 h-auto object-contain"
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              />
            </motion.div>

            {/* Card contenu à droite */}
            <Card className="flex-1 px-8 py-6 rounded-3xl border-2 shadow-lg relative overflow-hidden" style={{ borderColor: PRIMARY_COLOR }}>
              <motion.div
                className="absolute inset-0 opacity-5"
                style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}FF 0%, ${PRIMARY_COLOR}99 100%)` }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="relative z-10 w-full h-full">
                <motion.h3
                  className="font-bold text-2xl text-gray-900 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Tantie Sagesse
                </motion.h3>
                <motion.p
                  className="text-gray-600 leading-relaxed pr-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Bonjour {user?.firstName} ! {MACRO_KPIs.acteursActifs.toLocaleString()} acteurs actifs sur {MACRO_KPIs.totalActeurs.toLocaleString()} inscrits
                </motion.p>
              </div>
              <motion.button
                onClick={handleListenMessage}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-base font-semibold text-white shadow-md absolute bottom-5 left-8 z-20"
                style={{ backgroundColor: PRIMARY_COLOR }}
                whileHover={{ scale: 1.05, boxShadow: `0 8px 20px ${PRIMARY_COLOR}33` }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Volume2 className="w-5 h-5" />
                Écouter
              </motion.button>
            </Card>
          </div>
        </motion.div>

        {/* ── Alertes critiques actives ───────────────────────────────────── */}
        {alertesHigh.length > 0 && (
          <motion.button
            onClick={() => setShowAlertes(v => !v)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-6 bg-red-50 border-2 border-red-300 rounded-3xl p-4 text-left"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
              </motion.div>
              <span className="font-bold text-red-800">{ALERTES.length} alertes critiques actives</span>
              <span className="ml-auto text-red-500 text-sm">{showAlertes ? 'Fermer' : 'Voir tout'}</span>
            </div>
            <AnimatePresence>
              {showAlertes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2"
                >
                  {ALERTES.map(a => (
                    <div key={a.id} className={`flex items-start gap-2 p-3 rounded-2xl border-2 ${
                      a.severity === 'high' ? 'bg-red-50 border-red-200' :
                      a.severity === 'medium' ? 'bg-orange-50 border-orange-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}>
                      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        a.severity === 'high' ? 'text-red-500' :
                        a.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'
                      }`} />
                      <p className="text-sm text-gray-800 font-medium">{a.message}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}

        {/* ── Bloc KPI Macro — 9 indicateurs ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
              style={{ background: PRIMARY_COLOR }}
            >
              <Globe className="w-5 h-5 text-white" />
            </motion.div>
            <h2 className="font-bold text-gray-900 text-xl">Vue Macro Nationale</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Acteurs actifs', value: MACRO_KPIs.acteursActifs.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'blue', border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700' },
              { label: 'Total acteurs', value: MACRO_KPIs.totalActeurs.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'purple', border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-700' },
              { label: 'Suspendus', value: MACRO_KPIs.acteursSuspendus.toLocaleString(), icon: <XCircle className="w-5 h-5" />, color: 'red', border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700' },
              { label: 'Transactions', value: MACRO_KPIs.volumeTransactions.toLocaleString(), icon: <Activity className="w-5 h-5" />, color: 'green', border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-700' },
              { label: 'Valeur (Mds FCFA)', value: (MACRO_KPIs.valeurMonetaire / 1_000_000_000).toFixed(2), icon: <TrendingUp className="w-5 h-5" />, color: 'emerald', border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700' },
              { label: 'Digitalisation', value: `${MACRO_KPIs.pctDigitalisation}%`, icon: <Wifi className="w-5 h-5" />, color: 'cyan', border: 'border-cyan-200', bg: 'bg-cyan-50', text: 'text-cyan-700' },
              { label: 'Inclusion CNPS', value: `${MACRO_KPIs.pctInclusionCNPS}%`, icon: <Shield className="w-5 h-5" />, color: 'orange', border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-700' },
              { label: 'Inclusion CNAM', value: `${MACRO_KPIs.pctInclusionCNAM}%`, icon: <Heart className="w-5 h-5" />, color: 'pink', border: 'border-pink-200', bg: 'bg-pink-50', text: 'text-pink-700' },
              { label: 'Croissance mois', value: `+${MACRO_KPIs.croissanceMensuelle}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'teal', border: 'border-teal-200', bg: 'bg-teal-50', text: 'text-teal-700' },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                className={`bg-white rounded-3xl p-4 shadow-lg border-2 ${kpi.border} relative overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className={`absolute right-3 top-3 w-9 h-9 rounded-full ${kpi.bg} flex items-center justify-center`}>
                  <span className={kpi.text}>{kpi.icon}</span>
                </div>
                <p className="text-xs text-gray-500 font-semibold mb-1 pr-10">{kpi.label}</p>
                <motion.p
                  className={`text-2xl font-black ${kpi.text}`}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                >
                  {kpi.value}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Résumé du Jour (sans ventes) ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-3xl p-6 border-2 shadow-lg"
          style={{ borderColor: `${PRIMARY_COLOR}30` }}
        >
          <div className="flex items-center gap-3 mb-5">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: PRIMARY_COLOR }}
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </motion.div>
            <h2 className="font-bold text-gray-900 text-xl">Résumé du Jour</h2>
            <span className="ml-auto text-xs text-gray-500 font-semibold">03 Mar 2026</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <motion.div whileHover={{ y: -3 }} className="bg-white rounded-3xl p-4 border-2 border-blue-100 shadow-md text-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <UserPlus className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              </motion.div>
              <p className="text-2xl font-bold text-blue-600">{RESUME_JOUR.nouveauxInscrits}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Nouveaux inscrits</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="bg-white rounded-3xl p-4 border-2 border-green-100 shadow-md text-center">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              </motion.div>
              <p className="text-2xl font-bold text-green-600">{RESUME_JOUR.dossiersValides}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Dossiers validés</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="bg-white rounded-3xl p-4 border-2 border-red-100 shadow-md text-center">
              <motion.div animate={{ x: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }}>
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              </motion.div>
              <p className="text-2xl font-bold text-red-600">{RESUME_JOUR.dossiersRejetes}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Dossiers rejetés</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="bg-white rounded-3xl p-4 border-2 border-purple-100 shadow-md text-center">
              <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity }}>
                <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              </motion.div>
              <p className="text-2xl font-bold text-purple-600">{RESUME_JOUR.transactionsDuJour.toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Transactions</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="bg-white rounded-3xl p-4 border-2 border-orange-100 shadow-md text-center col-span-1">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              </motion.div>
              <p className="text-2xl font-bold text-orange-600">{RESUME_JOUR.alertesCritiquesActives}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Alertes actives</p>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Graphiques comparatifs ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-5 mb-6"
        >
          {/* Évolution mensuelle transactions */}
          <div className="bg-white rounded-3xl p-5 border-2 shadow-lg" style={{ borderColor: `${PRIMARY_COLOR}20` }}>
            <h3 className="font-bold text-gray-900 mb-4">Évolution mensuelle des transactions</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={DATA_EVOLUTION}>
                <defs>
                  <linearGradient id="gradTx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: `2px solid ${PRIMARY_COLOR}40` }}
                  formatter={(v: any) => [v.toLocaleString(), 'Transactions']}
                />
                <Area type="monotone" dataKey="transactions" stroke={PRIMARY_COLOR} strokeWidth={2} fill="url(#gradTx)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition acteurs par type */}
          <div className="bg-white rounded-3xl p-5 border-2 shadow-lg" style={{ borderColor: `${PRIMARY_COLOR}20` }}>
            <h3 className="font-bold text-gray-900 mb-4">Répartition acteurs par type</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={DATA_REPARTITION} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {DATA_REPARTITION.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [v.toLocaleString(), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {DATA_REPARTITION.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-gray-700 flex-1">{d.name}</span>
                    <span className="text-sm font-bold text-gray-900">{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activité par région */}
          <div className="bg-white rounded-3xl p-5 border-2 shadow-lg" style={{ borderColor: `${PRIMARY_COLOR}20` }}>
            <h3 className="font-bold text-gray-900 mb-4">Activité par région</h3>
            <div className="overflow-x-auto">
              <div style={{ minWidth: 320 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={DATA_REGIONS} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="region" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: `2px solid ${PRIMARY_COLOR}40` }}
                      formatter={(v: any) => [v.toLocaleString(), 'Acteurs']}
                    />
                    <Bar dataKey="acteurs" fill={PRIMARY_COLOR} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Courbe adoption */}
          <div className="bg-white rounded-3xl p-5 border-2 shadow-lg" style={{ borderColor: `${PRIMARY_COLOR}20` }}>
            <h3 className="font-bold text-gray-900 mb-4">Courbe adoption plateforme</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={DATA_EVOLUTION}>
                <defs>
                  <linearGradient id="gradVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '2px solid #16A34A40' }}
                  formatter={(v: any) => [`${v} Mds FCFA`, 'Valeur']}
                />
                <Area type="monotone" dataKey="valeur" stroke="#16A34A" strokeWidth={2} fill="url(#gradVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Accès rapide ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <motion.button
            onClick={() => navigate('/institution/acteurs')}
            className="text-left bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 rounded-3xl p-6 shadow-2xl border-2 border-purple-500 overflow-hidden relative"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/30">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Gérer les acteurs</h3>
                  <p className="text-white/80 text-sm">Suspendre, réactiver, voir dossiers</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </motion.button>

          <motion.button
            onClick={() => navigate('/institution/supervision')}
            className="text-left bg-gradient-to-r from-teal-600 via-teal-700 to-teal-600 rounded-3xl p-6 shadow-2xl border-2 border-teal-500 overflow-hidden relative"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
            />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/30">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Supervision</h3>
                  <p className="text-white/80 text-sm">Transactions, KPIs, Audit, Export</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </motion.button>
        </motion.div>
      </div>

      <Navigation role="institution" onMicClick={handleTantieClick} />
    </>
  );
}

// ShieldIcon manquant dans les imports
function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}