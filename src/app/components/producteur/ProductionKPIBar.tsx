import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, TrendingUp, Banknote, ShoppingBag,
  AlertCircle, Layers, CheckCircle, Sprout, Clock, Map,
} from 'lucide-react';
import { useProducteur } from '../../contexts/ProducteurContext';

// ─── Formatage intégral ───────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('fr-FR');
}

// ─── Card KPI compacte ────────────────────────────────────────────────────────
interface KPICardProps {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  pulse?: boolean;
  delay?: number;
}

function KPICard({ label, value, suffix, icon, color, textColor, pulse = false, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28, delay }}
      className="bg-white rounded-2xl border-2 p-3 shadow-sm flex items-center gap-3"
      style={{ borderColor: color }}
    >
      {/* Icône */}
      <motion.div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}
        animate={pulse ? { scale: [1, 1.18, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      >
        <span style={{ color }}>{icon}</span>
      </motion.div>

      {/* Texte */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide leading-none mb-0.5 truncate">{label}</p>
        <div className="flex items-baseline gap-1">
          <motion.span
            className="font-black leading-none"
            style={{ color: textColor, fontSize: value.length > 9 ? '0.85rem' : value.length > 6 ? '1rem' : '1.25rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.1 }}
          >
            {value}
          </motion.span>
          {suffix && (
            <span className="text-[9px] font-bold text-gray-400 leading-none">{suffix}</span>
          )}
        </div>
      </div>

      {/* Barre décorative verticale */}
      <motion.div
        className="w-1 self-stretch rounded-full"
        style={{ backgroundColor: `${color}30` }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.15 }}
      />
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props {
  activeTab: 'cycles' | 'recoltes' | 'publications' | 'historique';
}

export function ProductionKPIBar({ activeTab }: Props) {
  const { stats } = useProducteur();

  // Safe defaults — ces tableaux ne sont pas dans ProducteurContext
  const cycles: any[]       = [];
  const recoltes: any[]     = [];
  const commandes: any[]    = [];

  // ── KPIs Ma Plantation ─────────────────────────────────────────────────────
  const cyclesActifs    = cycles.filter(c => c.status === 'active').length;
  const superficieTotale = cycles.filter(c => c.status === 'active').reduce((s, c) => s + (c.surface || 0), 0);
  const recoltesProches = cycles.filter(c => {
    if (c.status !== 'active') return false;
    const days = Math.floor((c.dateRecolteEstimee.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 14;
  }).length;
  const cyclesTermines  = cycles.filter(c => c.status === 'completed').length;

  // ── KPIs Mes Récoltes ──────────────────────────────────────────────────────
  const totalRecolte = recoltes.reduce((s, r) => s + r.quantiteReelle, 0);
  const totalDispo   = recoltes.reduce((s, r) => s + r.stockDisponible, 0);
  const valeurStock  = recoltes.reduce((s, r) => s + r.stockDisponible * r.prixUnitaire, 0);
  const nbPubliees   = recoltes.filter(r => r.status === 'published' || r.status === 'partially_sold').length;

  // ── KPIs Mon Marché ────────────────────────────────────────────────────────
  const cmdActives  = commandes.filter(c => ['new', 'accepted', 'preparing'].includes(c.status)).length;
  const cmdUrgentes = commandes.filter(c => c.status === 'new').length;
  const revenuTotal = recoltes.reduce((s, r) => s + r.stockVendu * r.prixUnitaire, 0);
  const cmdLivrees  = commandes.filter(c => c.status === 'delivered').length;

  // ── Config par tab ─────────────────────────────────────────────────────────
  const kpisMap: Record<string, KPICardProps[]> = {
    cycles: [
      { label: 'Plantations actives', value: `${cyclesActifs}`,             icon: <Sprout className="w-4 h-4" />,    color: '#2E8B57', textColor: '#1a6b3c' },
      { label: 'Superficie',          value: `${superficieTotale.toFixed(1)}`, suffix: 'ha', icon: <Map className="w-4 h-4" />,      color: '#3b82f6', textColor: '#1d4ed8' },
      { label: 'Récoltes proches',    value: `${recoltesProches}`,           icon: <Clock className="w-4 h-4" />,     color: '#f97316', textColor: '#c2410c', pulse: recoltesProches > 0 },
      { label: 'Cycles terminés',     value: `${cyclesTermines}`,            icon: <CheckCircle className="w-4 h-4" />, color: '#10b981', textColor: '#047857' },
    ],
    recoltes: [
      { label: 'Total récolté', value: fmt(totalRecolte), suffix: 'kg',   icon: <Layers className="w-4 h-4" />,    color: '#2E8B57', textColor: '#1a6b3c' },
      { label: 'En stock',      value: fmt(totalDispo),   suffix: 'kg',   icon: <Package className="w-4 h-4" />,   color: '#3b82f6', textColor: '#1d4ed8' },
      { label: 'Valeur stock',  value: fmt(valeurStock),  suffix: 'FCFA', icon: <Banknote className="w-4 h-4" />,  color: '#8b5cf6', textColor: '#6d28d9' },
      { label: 'Publiées',      value: `${nbPubliees}`,                   icon: <TrendingUp className="w-4 h-4" />, color: '#f59e0b', textColor: '#b45309' },
    ],
    publications: [
      { label: 'Commandes', value: `${cmdActives}`,              icon: <ShoppingBag className="w-4 h-4" />, color: '#3b82f6', textColor: '#1d4ed8' },
      { label: 'Urgentes',  value: `${cmdUrgentes}`,             icon: <AlertCircle className="w-4 h-4" />,  color: '#f97316', textColor: '#c2410c', pulse: cmdUrgentes > 0 },
      { label: 'Revenus',   value: fmt(revenuTotal), suffix: 'FCFA', icon: <TrendingUp className="w-4 h-4" />, color: '#2E8B57', textColor: '#1a6b3c' },
      { label: 'Livrées',   value: `${cmdLivrees}`,              icon: <CheckCircle className="w-4 h-4" />, color: '#10b981', textColor: '#047857' },
    ],
  };

  const kpis = kpisMap[activeTab] ?? [];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="mb-4"
      >
        {/* Grille 2x2 */}
        <div className="grid grid-cols-2 gap-2.5">
          {kpis.map((kpi, i) => (
            <KPICard key={kpi.label} {...kpi} delay={i * 0.05} />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}