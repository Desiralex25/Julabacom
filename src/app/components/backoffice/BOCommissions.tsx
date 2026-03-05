import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, CheckCircle2, Clock, Download, TrendingUp, Users, Percent, ChevronDown, ChevronUp, Filter, Search, AlertTriangle, X } from 'lucide-react';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const STATUT_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  en_attente: { label: 'En attente', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  validee:    { label: 'Validée',    bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200' },
  payee:      { label: 'Payée',      bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200' },
};

function ConfirmModal({ open, title, message, onConfirm, onCancel, danger }: any) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
          <motion.div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2"
            style={{ borderColor: danger ? '#EF4444' : BO_PRIMARY }}
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: danger ? '#FEE2E2' : `${BO_PRIMARY}20` }}>
                <AlertTriangle className="w-6 h-6" style={{ color: danger ? '#EF4444' : BO_PRIMARY }} />
              </div>
              <h3 className="font-black text-gray-900 text-lg">{title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
              <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl font-bold text-white"
                style={{ backgroundColor: danger ? '#EF4444' : BO_PRIMARY }}>Confirmer</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BOCommissions() {
  const { commissions, hasPermission, updateCommissionStatut } = useBackOffice();
  const [tauxCommission, setTauxCommission] = useState('2');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [showTaux, setShowTaux] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmPay, setConfirmPay] = useState<string | null>(null);

  const filtered = commissions.filter(c =>
    (filterStatut === 'all' || c.statut === filterStatut) &&
    (!search || c.identificateurNom.toLowerCase().includes(search.toLowerCase()) || c.periode.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCommissions = commissions.reduce((s, c) => s + c.montantTotal, 0);
  const totalPayees = commissions.filter(c => c.statut === 'payee').reduce((s, c) => s + c.montantTotal, 0);
  const totalAttente = commissions.filter(c => c.statut === 'en_attente').reduce((s, c) => s + c.montantTotal, 0);
  const totalValidees = commissions.filter(c => c.statut === 'validee').reduce((s, c) => s + c.montantTotal, 0);

  const handleValider = (id: string) => {
    updateCommissionStatut(id, 'validee');
    toast.info('Commission validée et journalisée');
  };

  const handlePayer = (id: string) => {
    updateCommissionStatut(id, 'payee');
    toast.success('Commission payée et journalisée');
    setConfirmPay(null);
  };

  const commissionPayer = confirmPay ? commissions.find(c => c.id === confirmPay) : null;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Commissions & Paiements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion des commissions identificateurs</p>
        </div>
        <motion.button onClick={() => toast.success('Export comptable en cours — simulation')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-gray-200 font-bold text-sm text-gray-700 bg-white"
          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Export comptable</span>
        </motion.button>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total généré', value: `${totalCommissions.toLocaleString('fr-FR')} F`, icon: Wallet, color: BO_PRIMARY },
          { label: 'Payées', value: `${totalPayees.toLocaleString('fr-FR')} F`, icon: CheckCircle2, color: '#10B981' },
          { label: 'En attente', value: `${totalAttente.toLocaleString('fr-FR')} F`, icon: Clock, color: '#F59E0B' },
          { label: 'Validées', value: `${totalValidees.toLocaleString('fr-FR')} F`, icon: TrendingUp, color: '#3B82F6' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <p className="text-xs font-bold text-gray-500">{kpi.label}</p>
              </div>
              <p className="text-lg lg:text-xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Taux commission — collapsible */}
      {hasPermission('commissions.write') && (
        <motion.div className="bg-white rounded-3xl border-2 border-gray-100 mb-6 overflow-hidden shadow-sm"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setShowTaux(!showTaux)}
            className="w-full flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${BO_PRIMARY}15` }}>
                <Percent className="w-5 h-5" style={{ color: BO_PRIMARY }} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm">Taux de commission</p>
                <p className="text-xs text-gray-400">Taux actuel : {tauxCommission}% par dossier validé</p>
              </div>
            </div>
            {showTaux ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          <AnimatePresence>
            {showTaux && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t-2 border-gray-100 px-6 pb-5 pt-4">
                <div className="flex items-center gap-4 mb-4">
                  <input type="range" min="0.5" max="5" step="0.5" value={tauxCommission}
                    onChange={e => setTauxCommission(e.target.value)}
                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: BO_PRIMARY }} />
                  <span className="text-2xl font-black min-w-[60px] text-right" style={{ color: BO_PRIMARY }}>{tauxCommission}%</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  {[
                    { label: '200 dossiers/mois', montant: Math.round(200 * 200 * Number(tauxCommission) / 100) },
                    { label: '30 dossiers/mois', montant: Math.round(30 * 200 * Number(tauxCommission) / 100) },
                    { label: '10 dossiers/mois', montant: Math.round(10 * 200 * Number(tauxCommission) / 100) },
                  ].map(sim => (
                    <div key={sim.label} className="bg-gray-50 rounded-2xl p-3 border-2 border-gray-100">
                      <p className="text-[10px] text-gray-400 font-semibold">{sim.label}</p>
                      <p className="font-black text-sm mt-0.5" style={{ color: BO_DARK }}>{sim.montant.toLocaleString()} F</p>
                    </div>
                  ))}
                </div>
                <motion.button
                  onClick={() => {
                    toast.success(`Taux de commission mis à jour à ${tauxCommission}% — journalisé`);
                    setShowTaux(false);
                  }}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                  style={{ backgroundColor: BO_PRIMARY }}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
                  Appliquer ce taux
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Recherche + filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher par identificateur ou période..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none bg-white text-sm"
            style={{ borderColor: search ? BO_PRIMARY : undefined }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'en_attente', 'validee', 'payee'].map(s => (
            <motion.button key={s} onClick={() => setFilterStatut(s)}
              className="px-4 py-3 rounded-2xl text-sm font-bold border-2 transition-all"
              style={{
                backgroundColor: filterStatut === s ? BO_PRIMARY : 'white',
                color: filterStatut === s ? 'white' : '#374151',
                borderColor: filterStatut === s ? BO_PRIMARY : '#e5e7eb',
              }}
              whileHover={filterStatut !== s ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
              {s === 'all' ? 'Toutes' : STATUT_CONFIG[s]?.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Liste commissions */}
      <div className="space-y-3">
        {filtered.map((comm, index) => {
          const statutConf = STATUT_CONFIG[comm.statut];
          return (
            <motion.div key={comm.id} className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-4"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
              whileHover={{ y: -2 }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${BO_PRIMARY}20` }}>
                    <Users className="w-5 h-5" style={{ color: BO_PRIMARY }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{comm.identificateurNom}</p>
                    <p className="text-xs text-gray-500">{comm.periode} • {comm.nbDossiers} dossiers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-black text-lg" style={{ color: BO_PRIMARY }}>{comm.montantTotal.toLocaleString('fr-FR')} F</p>
                    <p className="text-xs text-gray-400">{new Date(comm.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${statutConf.bg} ${statutConf.text} ${statutConf.border}`}>
                    {statutConf.label}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {(hasPermission('commissions.write') || hasPermission('commissions.pay')) && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  {hasPermission('commissions.write') && comm.statut === 'en_attente' && (
                    <motion.button onClick={() => handleValider(comm.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm text-blue-700 border-2 border-blue-200 bg-blue-50"
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                      <CheckCircle2 className="w-4 h-4" /> Valider
                    </motion.button>
                  )}
                  {hasPermission('commissions.pay') && comm.statut === 'validee' && (
                    <motion.button onClick={() => setConfirmPay(comm.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm text-white"
                      style={{ backgroundColor: '#10B981' }}
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                      <Wallet className="w-4 h-4" /> Payer
                    </motion.button>
                  )}
                  <motion.button onClick={() => toast.info('Détail commission — simulation')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2 border-gray-200 text-gray-600"
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                    Détail
                  </motion.button>
                </div>
              )}
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-bold text-gray-500">Aucune commission trouvée</p>
          </motion.div>
        )}
      </div>

      {/* Confirm paiement */}
      <ConfirmModal
        open={!!confirmPay}
        title="Confirmer le paiement ?"
        message={commissionPayer ? `Payer ${commissionPayer.montantTotal.toLocaleString('fr-FR')} FCFA à ${commissionPayer.identificateurNom} pour la période ${commissionPayer.periode}. Action irréversible et journalisée.` : ''}
        onConfirm={() => confirmPay && handlePayer(confirmPay)}
        onCancel={() => setConfirmPay(null)}
        danger={false}
      />
    </div>
  );
}