import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Leaf,
  Package,
  TrendingUp,
  Eye,
  Plus,
  Check,
  Clock,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Filter,
  Star,
  Sprout,
  Truck,
  ShoppingCart,
  Share2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useProducteur, Recolte, CycleAgricole } from '../../contexts/ProducteurContext';
import { useApp } from '../../contexts/AppContext';

const COLOR = '#2E8B57';

const QUALITE_CONFIG = {
  A: { label: 'Qualité A', color: '#16A34A', bg: '#DCFCE7' },
  B: { label: 'Qualité B', color: '#D97706', bg: '#FEF3C7' },
  C: { label: 'Qualité C', color: '#DC2626', bg: '#FEE2E2' },
};

const STATUS_CONFIG = {
  draft:          { label: 'Brouillon',       color: '#6B7280', bg: '#F3F4F6', Icon: Clock },
  published:      { label: 'Publiée',          color: '#2E8B57', bg: '#D1FAE5', Icon: Check },
  partially_sold: { label: 'En cours',         color: '#D97706', bg: '#FEF3C7', Icon: ShoppingCart },
  sold_out:       { label: 'Épuisée',          color: '#DC2626', bg: '#FEE2E2', Icon: Package },
};

// ── Modal détail récolte ─────────────────────────────────────

function ModalDetailRecolte({
  recolte,
  cycle,
  onClose,
  onPublish,
  color,
}: {
  recolte: Recolte;
  cycle: CycleAgricole | undefined;
  onClose: () => void;
  onPublish: (id: string) => void;
  color: string;
}) {
  const cfg = STATUS_CONFIG[recolte.status];
  const qual = QUALITE_CONFIG[recolte.qualite];
  const valeurTotale = recolte.quantiteReelle * recolte.prixUnitaire;
  const valeurRestante = recolte.stockDisponible * recolte.prixUnitaire;
  const pctVendu = recolte.quantiteReelle > 0
    ? Math.round((recolte.stockVendu / recolte.quantiteReelle) * 100)
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-2" />

          {/* Photo */}
          {recolte.photos.length > 0 && (
            <div className="relative h-40 overflow-hidden">
              <img src={recolte.photos[0]} alt={cycle?.culture} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-5 right-14">
                <h2 className="text-2xl font-bold text-white">{cycle?.culture || 'Récolte'}</h2>
                <p className="text-white/80 text-sm">{cycle?.surface} ha — Récolte #{recolte.id}</p>
              </div>
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          )}

          <div className="p-5 space-y-4">
            {/* Badges statut + qualité */}
            <div className="flex gap-2">
              <span
                className="px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: qual.bg, color: qual.color }}
              >
                {qual.label}
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}
              >
                {cfg.label}
              </span>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Quantité réelle',  value: `${recolte.quantiteReelle.toLocaleString('fr-FR')} kg` },
                { label: 'Prix unitaire',    value: `${recolte.prixUnitaire.toLocaleString('fr-FR')} FCFA/kg` },
                { label: 'Valeur totale',    value: `${valeurTotale.toLocaleString('fr-FR')} FCFA` },
                { label: 'Stock restant',    value: `${recolte.stockDisponible.toLocaleString('fr-FR')} kg` },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className="font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Barre progression vente */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Progression des ventes</span>
                <span className="text-sm font-bold" style={{ color: COLOR }}>{pctVendu}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: COLOR }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pctVendu}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">{recolte.stockVendu} kg vendus</p>
                <p className="text-xs text-gray-400">{recolte.stockReserve} kg réservés</p>
              </div>
            </div>

            {/* Action publier si brouillon */}
            {recolte.status === 'draft' && (
              <motion.button
                onClick={() => { onPublish(recolte.id); onClose(); }}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: COLOR }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="w-5 h-5" />
                Publier sur le marché
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Page principale ──────────────────────────────────────────

export function MesRecoltesPage() {
  const navigate = useNavigate();
  const { speak } = useApp();
  const { recoltes, cycles, publishRecolte, stats } = useProducteur();

  const [filtreStatus, setFiltreStatus] = useState<Recolte['status'] | 'tout'>('tout');
  const [recolteSelectionnee, setRecolte] = useState<Recolte | null>(null);

  const recolteFiltrees = useMemo(() => {
    if (filtreStatus === 'tout') return [...recoltes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return recoltes.filter(r => r.status === filtreStatus).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [recoltes, filtreStatus]);

  const getCycle = (cycleId: string) => cycles.find(c => c.id === cycleId);

  // Résumé global
  const totalKg     = recoltes.reduce((s, r) => s + r.quantiteReelle, 0);
  const totalVendu  = recoltes.reduce((s, r) => s + r.stockVendu, 0);
  const valeurStock = recoltes.reduce((s, r) => s + r.stockDisponible * r.prixUnitaire, 0);
  const nbPubliees  = recoltes.filter(r => r.status === 'published' || r.status === 'partially_sold').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div
        className="relative pb-20 pt-safe"
        style={{ background: `linear-gradient(145deg, ${COLOR} 0%, ${COLOR}AA 100%)` }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-8 translate-x-8" />

        <div className="relative flex items-center justify-between px-5 pt-5 pb-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-white/80" />
            <span className="text-white font-bold text-lg">Mes Récoltes</span>
          </div>
          <motion.button
            onClick={() => navigate('/producteur/publier-recolte')}
            className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Stats header */}
        <div className="relative px-5">
          <div className="text-center mb-3">
            <p className="text-white/70 text-sm">Production totale</p>
            <p className="text-4xl font-bold text-white">{totalKg.toLocaleString('fr-FR')} kg</p>
          </div>
          <div className="flex justify-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-2">
              <ShoppingCart className="w-3 h-3 text-white/80" />
              <span className="text-sm text-white/90">{nbPubliees} offres actives</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARTE STATS FLOTTANTE */}
      <div className="px-5 -mt-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="bg-white rounded-3xl border-2 border-gray-100 shadow-xl p-5"
        >
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Vendu',         value: `${totalVendu.toLocaleString()} kg`,       Icon: Check,      color: '#16A34A' },
              { label: 'Valeur stock',  value: `${Math.round(valeurStock / 1000)}k FCFA`, Icon: TrendingUp, color: COLOR },
              { label: 'Score',         value: `${stats.scoreProducteur}/100`,            Icon: Star,       color: '#D97706' },
            ].map(({ label, value, Icon, color }) => (
              <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-gray-50">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="text-xs text-gray-500 text-center">{label}</p>
                <p className="font-bold text-gray-900 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* FILTRES + LISTE */}
      <div className="px-5 mt-4 pb-36">
        {/* Filtres */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
          {([
            { id: 'tout',          label: 'Tout' },
            { id: 'published',     label: 'Publiées' },
            { id: 'partially_sold',label: 'En cours' },
            { id: 'draft',         label: 'Brouillons' },
            { id: 'sold_out',      label: 'Épuisées' },
          ] as { id: typeof filtreStatus; label: string }[]).map(f => (
            <motion.button
              key={f.id}
              onClick={() => setFiltreStatus(f.id)}
              className="px-4 py-2 rounded-full border-2 text-sm font-semibold whitespace-nowrap flex-shrink-0"
              style={filtreStatus === f.id
                ? { backgroundColor: COLOR, borderColor: COLOR, color: 'white' }
                : { backgroundColor: 'white', borderColor: '#E5E7EB', color: '#6B7280' }
              }
              whileTap={{ scale: 0.95 }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Liste récoltes */}
        <div className="space-y-4">
          {recolteFiltrees.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Sprout className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm text-center">Aucune récolte dans cette catégorie.</p>
              <motion.button
                onClick={() => navigate('/producteur/publier-recolte')}
                className="px-6 py-3 rounded-2xl font-bold text-white"
                style={{ backgroundColor: COLOR }}
                whileTap={{ scale: 0.97 }}
              >
                Déclarer une récolte
              </motion.button>
            </div>
          ) : (
            recolteFiltrees.map((recolte, i) => {
              const cycle  = getCycle(recolte.cycleId);
              const cfg    = STATUS_CONFIG[recolte.status];
              const qual   = QUALITE_CONFIG[recolte.qualite];
              const StatusIcon = cfg.Icon;
              const pctVendu = recolte.quantiteReelle > 0
                ? Math.round((recolte.stockVendu / recolte.quantiteReelle) * 100)
                : 0;

              return (
                <motion.div
                  key={recolte.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 220 }}
                  onClick={() => { setRecolte(recolte); speak(`Récolte de ${cycle?.culture || 'produit'}, ${recolte.stockDisponible} kilogrammes disponibles`); }}
                  className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden active:scale-99 cursor-pointer"
                >
                  {/* Photo thumbnail */}
                  {recolte.photos.length > 0 && (
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={recolte.photos[0]}
                        alt={cycle?.culture}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Badges flottants */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: qual.bg, color: qual.color }}
                        >
                          {qual.label}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Culture + prix */}
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                        <div>
                          <h3 className="text-white font-bold text-lg">{cycle?.culture || 'Récolte'}</h3>
                          <p className="text-white/80 text-sm">{recolte.stockDisponible.toLocaleString()} kg disponibles</p>
                        </div>
                        <p className="text-white font-bold text-base">{recolte.prixUnitaire.toLocaleString()} FCFA/kg</p>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    {/* Progression */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{pctVendu}% vendu</span>
                      <span className="text-sm font-bold" style={{ color: COLOR }}>
                        {(recolte.stockVendu * recolte.prixUnitaire).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: COLOR }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pctVendu}%` }}
                        transition={{ delay: 0.3 + i * 0.06, duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Infos rapides */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{recolte.stockReserve} kg réservés</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{recolte.stockVendu} kg livrés</span>
                        </div>
                      </div>
                      <motion.div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${COLOR}15` }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronRight className="w-5 h-5" style={{ color: COLOR }} />
                      </motion.div>
                    </div>

                    {/* Bouton publier si brouillon */}
                    {recolte.status === 'draft' && (
                      <motion.button
                        onClick={e => {
                          e.stopPropagation();
                          publishRecolte(recolte.id);
                          speak(`Récolte de ${cycle?.culture} publiée sur le marché`);
                        }}
                        className="mt-3 w-full py-2.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                        style={{ backgroundColor: `${COLOR}15`, color: COLOR }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Share2 className="w-4 h-4" />
                        Publier sur le marché
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal détail */}
      {recolteSelectionnee && (
        <ModalDetailRecolte
          recolte={recolteSelectionnee}
          cycle={getCycle(recolteSelectionnee.cycleId)}
          onClose={() => setRecolte(null)}
          onPublish={id => { publishRecolte(id); speak('Récolte publiée sur le marché Jùlaba'); }}
          color={COLOR}
        />
      )}

      {/* FAB */}
      <motion.button
        onClick={() => navigate('/producteur/publier-recolte')}
        className="fixed bottom-28 right-5 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl z-40"
        style={{ backgroundColor: COLOR }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Plus className="w-7 h-7 text-white" />
      </motion.button>
    </div>
  );
}
