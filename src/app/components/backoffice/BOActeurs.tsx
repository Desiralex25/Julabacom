import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, Eye, UserX, UserCheck, Trash2,
  CheckCircle2, Clock, XCircle, AlertCircle, Users,
  MapPin, TrendingUp, Store, Sprout, Building2, Shield, UserPlus,
  ChevronRight, RotateCcw, Download,
} from 'lucide-react';
import { useBackOffice, BOActeur } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const TYPE_COLORS: Record<string, string> = {
  marchand: '#C66A2C',
  producteur: '#2E8B57',
  cooperative: '#1D4ED8',
  institution: '#7C3AED',
  identificateur: '#E6A817',
};

const TYPE_ICONS: Record<string, any> = {
  marchand: Store,
  producteur: Sprout,
  cooperative: Building2,
  institution: Shield,
  identificateur: UserPlus,
};

const STATUT_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  actif: { label: 'Actif', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  suspendu: { label: 'Suspendu', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  en_attente: { label: 'En attente', bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock },
  rejete: { label: 'Rejeté', bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle },
};

function ConfirmModal({ open, title, message, onConfirm, onCancel, danger }: any) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2"
            style={{ borderColor: danger ? '#EF4444' : BO_PRIMARY }}
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-2xl font-bold text-white"
                style={{ backgroundColor: danger ? '#EF4444' : BO_PRIMARY }}
              >
                Confirmer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BOActeurs() {
  const navigate = useNavigate();
  const { acteurs, hasPermission, updateActeurStatut } = useBackOffice();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterScore, setFilterScore] = useState<string>('all'); // NEW
  const [filterDateDepuis, setFilterDateDepuis] = useState<string>(''); // NEW
  const [showFilters, setShowFilters] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; action: string; acteur: BOActeur | null; danger: boolean }>({
    open: false, action: '', acteur: null, danger: false,
  });

  const regions = [...new Set(acteurs.map(a => a.region))];

  const filtered = acteurs.filter(a => {
    const matchSearch = !search || `${a.nom} ${a.prenoms} ${a.telephone}`.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || a.type === filterType;
    const matchStatut = filterStatut === 'all' || a.statut === filterStatut;
    const matchRegion = filterRegion === 'all' || a.region === filterRegion;
    // Filtre score
    const matchScore = filterScore === 'all'
      || (filterScore === 'excellent' && a.score >= 80)
      || (filterScore === 'bon' && a.score >= 50 && a.score < 80)
      || (filterScore === 'faible' && a.score < 50);
    // Filtre date
    const matchDate = !filterDateDepuis || new Date(a.dateInscription) >= new Date(filterDateDepuis);
    return matchSearch && matchType && matchStatut && matchRegion && matchScore && matchDate;
  });

  const handleAction = (action: string, acteur: BOActeur) => {
    if (action === 'voir') { navigate(`/backoffice/acteurs/${acteur.id}`); return; }
    setConfirm({ open: true, action, acteur, danger: action === 'supprimer' });
  };

  const executeAction = () => {
    const { action, acteur } = confirm;
    if (!acteur) return;
    if (action === 'suspendre') {
      updateActeurStatut(acteur.id, 'suspendu', 'SUSPENSION acteur');
      toast.warning(`${acteur.prenoms} ${acteur.nom} suspendu`);
    } else if (action === 'reactiver') {
      updateActeurStatut(acteur.id, 'actif', 'RÉACTIVATION acteur');
      toast.success(`${acteur.prenoms} ${acteur.nom} réactivé`);
    } else if (action === 'supprimer') {
      updateActeurStatut(acteur.id, 'rejete', 'SUPPRESSION acteur (soft delete)');
      toast.error(`${acteur.prenoms} ${acteur.nom} supprimé (soft delete)`);
    }
    setConfirm({ open: false, action: '', acteur: null, danger: false });
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Acteurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} acteur{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''} sur {acteurs.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => toast.success('Export CSV Acteurs — simulation')}
            className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-gray-200 font-bold text-sm text-gray-700 bg-white"
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">Exporter</span>
          </motion.button>
          {hasPermission('enrolement.write') && (
            <motion.button
              onClick={() => navigate('/backoffice/enrolement')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold shadow-lg"
              style={{ backgroundColor: BO_PRIMARY }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <UserPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Nouvel acteur</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Actifs', value: acteurs.filter(a => a.statut === 'actif').length, color: '#10B981' },
          { label: 'En attente', value: acteurs.filter(a => a.statut === 'en_attente').length, color: '#F59E0B' },
          { label: 'Suspendus', value: acteurs.filter(a => a.statut === 'suspendu').length, color: '#EF4444' },
          { label: 'Rejetés', value: acteurs.filter(a => a.statut === 'rejete').length, color: '#6B7280' },
        ].map((s, i) => (
          <motion.button
            key={s.label}
            onClick={() => setFilterStatut(s.label.toLowerCase().replace(' ', '_') === 'en_attente' ? 'en_attente' : s.label.toLowerCase())}
            className="bg-white rounded-2xl p-3 shadow-sm border-2 border-gray-100 text-left"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3, boxShadow: `0 8px 20px ${s.color}20` }}
            whileTap={{ scale: 0.97 }}
          >
            <p className="text-xs font-bold text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </motion.button>
        ))}
      </div>

      {/* Barre de recherche + filtre */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none bg-white text-sm"
            style={{ borderColor: search ? BO_PRIMARY : undefined }}
          />
        </div>
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 font-semibold text-sm"
          style={{ borderColor: showFilters ? BO_PRIMARY : undefined, color: showFilters ? BO_PRIMARY : '#374151' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filtres</span>
        </motion.button>
      </div>

      {/* Filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="bg-white rounded-3xl p-5 border-2 border-gray-200 mb-5 space-y-4"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Type</p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'marchand', 'producteur', 'cooperative', 'institution', 'identificateur'].map(t => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2"
                      style={{
                        backgroundColor: filterType === t ? (t === 'all' ? BO_DARK : TYPE_COLORS[t] || BO_PRIMARY) : 'transparent',
                        color: filterType === t ? 'white' : '#374151',
                        borderColor: filterType === t ? (t === 'all' ? BO_DARK : TYPE_COLORS[t] || BO_PRIMARY) : '#e5e7eb',
                      }}
                    >
                      {t === 'all' ? 'Tous' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Statut</p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'actif', 'suspendu', 'en_attente', 'rejete'].map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatut(s)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all"
                      style={{
                        backgroundColor: filterStatut === s ? BO_PRIMARY : 'transparent',
                        color: filterStatut === s ? 'white' : '#374151',
                        borderColor: filterStatut === s ? BO_PRIMARY : '#e5e7eb',
                      }}
                    >
                      {s === 'all' ? 'Tous' : s === 'en_attente' ? 'En attente' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Région</p>
                <select
                  value={filterRegion}
                  onChange={e => setFilterRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                  style={{ borderColor: filterRegion !== 'all' ? BO_PRIMARY : undefined }}
                >
                  <option value="all">Toutes les régions</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Score performance</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: 'all', label: 'Tous' },
                    { v: 'excellent', label: 'Excellent (80+)' },
                    { v: 'bon', label: 'Bon (50-79)' },
                    { v: 'faible', label: 'Faible (<50)' },
                  ].map(({ v, label }) => (
                    <button key={v} onClick={() => setFilterScore(v)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all"
                      style={{ backgroundColor: filterScore === v ? '#10B981' : 'transparent', color: filterScore === v ? 'white' : '#374151', borderColor: filterScore === v ? '#10B981' : '#e5e7eb' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Inscrit depuis</p>
                <input type="date" value={filterDateDepuis} onChange={e => setFilterDateDepuis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                  style={{ borderColor: filterDateDepuis ? BO_PRIMARY : undefined }} />
              </div>
              <div className="flex items-end">
                <button onClick={() => { setFilterType('all'); setFilterStatut('all'); setFilterRegion('all'); setFilterScore('all'); setFilterDateDepuis(''); }}
                  className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:text-gray-700 transition-all">
                  Réinitialiser filtres
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste acteurs */}
      <div className="space-y-3">
        {filtered.map((acteur, index) => {
          const TypeIcon = TYPE_ICONS[acteur.type] || Users;
          const statutConf = STATUT_CONFIG[acteur.statut];
          const StatutIcon = statutConf.icon;
          const typeColor = TYPE_COLORS[acteur.type];

          return (
            <motion.div
              key={acteur.id}
              className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
              layout
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: typeColor }}
                >
                  {acteur.prenoms.charAt(0)}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{acteur.prenoms} {acteur.nom}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <TypeIcon className="w-3 h-3 flex-shrink-0" style={{ color: typeColor }} />
                        <span className="text-xs font-semibold" style={{ color: typeColor }}>{acteur.type.charAt(0).toUpperCase() + acteur.type.slice(1)}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 truncate">{acteur.region}</span>
                      </div>
                    </div>
                    {/* Statut */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${statutConf.bg} ${statutConf.text}`}>
                      <StatutIcon className="w-3 h-3" />
                      {statutConf.label}
                    </div>
                  </div>

                  {/* Score + transactions */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${acteur.score}%`, backgroundColor: acteur.score >= 70 ? '#10B981' : acteur.score >= 40 ? BO_PRIMARY : '#EF4444' }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{acteur.score}/100</span>
                    </div>
                    <span className="text-xs text-gray-500">{acteur.transactionsTotal} transactions</span>
                    <span className="text-xs font-bold" style={{ color: BO_DARK }}>{acteur.volumeTotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                {/* Actions desktop */}
                <div className="hidden sm:flex items-center gap-2">
                  <motion.button
                    onClick={() => handleAction('voir', acteur)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-gray-200 hover:border-[#E6A817] transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Voir le détail"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </motion.button>

                  {hasPermission('acteurs.suspend') && acteur.statut === 'actif' && (
                    <motion.button
                      onClick={() => handleAction('suspendre', acteur)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-red-200 hover:bg-red-50 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Suspendre"
                    >
                      <UserX className="w-4 h-4 text-red-500" />
                    </motion.button>
                  )}

                  {hasPermission('acteurs.suspend') && acteur.statut === 'suspendu' && (
                    <motion.button
                      onClick={() => handleAction('reactiver', acteur)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-green-200 hover:bg-green-50 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Réactiver"
                    >
                      <RotateCcw className="w-4 h-4 text-green-500" />
                    </motion.button>
                  )}

                  {hasPermission('acteurs.delete') && (
                    <motion.button
                      onClick={() => handleAction('supprimer', acteur)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Supprimer (soft)"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </motion.button>
                  )}
                </div>

                {/* Flèche mobile */}
                <motion.button
                  className="sm:hidden"
                  onClick={() => handleAction('voir', acteur)}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-bold text-gray-500">Aucun acteur trouvé</p>
            <p className="text-sm text-gray-400 mt-1">Modifiez vos filtres de recherche</p>
          </motion.div>
        )}
      </div>

      {/* Modal confirmation */}
      <ConfirmModal
        open={confirm.open}
        title={
          confirm.action === 'suspendre' ? 'Suspendre cet acteur ?' :
          confirm.action === 'reactiver' ? 'Réactiver cet acteur ?' :
          'Supprimer cet acteur ?'
        }
        message={
          confirm.acteur ?
          `Vous êtes sur le point de ${confirm.action} ${confirm.acteur.prenoms} ${confirm.acteur.nom}. Cette action sera journalisée.` : ''
        }
        onConfirm={executeAction}
        onCancel={() => setConfirm({ open: false, action: '', acteur: null, danger: false })}
        danger={confirm.danger}
      />
    </div>
  );
}