import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target, Plus, CheckCircle2, Clock, TrendingUp, Award,
  MapPin, Users, AlertTriangle, Edit2, Save, X, Trophy,
  Flame, BarChart3, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

interface Mission {
  id: string;
  titre: string;
  description: string;
  type: 'identification' | 'formation' | 'transaction' | 'zone';
  cible: string;
  objectif: number;
  realise: number;
  dateDebut: string;
  dateFin: string;
  statut: 'active' | 'terminee' | 'echouee' | 'draft';
  region: string;
  points: number;
  participantsCount: number;
}

const TYPE_CONFIG: Record<Mission['type'], { label: string; color: string; icon: any }> = {
  identification: { label: 'Identification', color: BO_PRIMARY, icon: Users },
  formation: { label: 'Formation', color: '#8B5CF6', icon: Award },
  transaction: { label: 'Transaction', color: '#3B82F6', icon: TrendingUp },
  zone: { label: 'Couverture zone', color: '#10B981', icon: MapPin },
};

const STATUT_CONFIG: Record<Mission['statut'], { label: string; bg: string; text: string; icon: any }> = {
  active: { label: 'Active', bg: 'bg-green-100', text: 'text-green-700', icon: Flame },
  terminee: { label: 'Terminée', bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle2 },
  echouee: { label: 'Échouée', bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
  draft: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock },
};

function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = Math.min(Math.round((value / total) * 100), 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-700">{pct}% accompli</span>
        <span className="text-xs text-gray-500">{value.toLocaleString()} / {total.toLocaleString()}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
        <motion.div className="h-full rounded-full"
          style={{ backgroundColor: pct >= 100 ? '#10B981' : pct >= 70 ? color : pct >= 40 ? BO_PRIMARY : '#EF4444' }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }} />
      </div>
    </div>
  );
}

export function BOMissions() {
  const { hasPermission, addMission, updateMissionStatut, missions } = useBackOffice();
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ titre: '', description: '', type: 'identification' as Mission['type'], objectif: 50, region: 'Abidjan', cible: '', dateDebut: '', dateFin: '', points: 300 });

  const canWrite = hasPermission('missions.write');

  const filtered = missions.filter((m: any) =>
    (filterStatut === 'all' || m.statut === filterStatut) &&
    (filterType === 'all' || m.type === filterType)
  );

  const actives = missions.filter((m: any) => m.statut === 'active').length;
  const terminees = missions.filter((m: any) => m.statut === 'terminee').length;
  const totalNonDraft = missions.filter((m: any) => m.statut !== 'draft').length;
  const tauxSucces = totalNonDraft > 0 ? Math.round((terminees / totalNonDraft) * 100) : 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addMission(form);
      toast.success(`Mission "${form.titre}" créée en brouillon`);
      setShowCreate(false);
      setForm({ titre: '', description: '', type: 'identification', objectif: 50, region: 'Abidjan', cible: '', dateDebut: '', dateFin: '', points: 300 });
    } catch (error) {
      console.error('Erreur création mission:', error);
      toast.error('Erreur lors de la création de la mission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublier = async (id: string) => {
    try {
      await updateMissionStatut(id, 'active');
      toast.success('Mission activée — notifications envoyées');
    } catch (error) {
      toast.error('Erreur lors de l\'activation de la mission');
    }
  };

  const handleCloturer = async (id: string) => {
    try {
      await updateMissionStatut(id, 'terminee');
      toast.info('Mission clôturée — résultats archivés');
    } catch (error) {
      toast.error('Erreur lors de la clôture de la mission');
    }
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Missions & Objectifs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pilotage de la performance nationale par zones</p>
        </div>
        {canWrite && (
          <motion.button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold shadow-lg"
            style={{ backgroundColor: BO_PRIMARY }}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouvelle mission</span>
          </motion.button>
        )}
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Missions actives', value: actives, icon: Flame, color: '#10B981' },
          { label: 'Terminées', value: terminees, icon: Trophy, color: '#3B82F6' },
          { label: 'Taux succès', value: `${isNaN(tauxSucces) ? 0 : tauxSucces}%`, icon: Target, color: BO_PRIMARY },
          { label: 'En brouillon', value: missions.filter(m => m.statut === 'draft').length, icon: Edit2, color: '#F59E0B' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: `${kpi.color}20` }}>
                <Icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
              <p className="text-xs font-semibold text-gray-500">{kpi.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Classement / Leaderboard */}
      <motion.div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm mb-6 overflow-hidden"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <button onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="w-full flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${BO_PRIMARY}15` }}>
              <Trophy className="w-5 h-5" style={{ color: BO_PRIMARY }} />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">Classement National — Identificateurs</p>
              <p className="text-xs text-gray-400">Top performers de la période en cours</p>
            </div>
          </div>
          {showLeaderboard ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t-2 border-gray-100">
              {[
                { rang: 1, nom: 'GNAGNE Brice-Olivier', zone: 'Grand Abidjan Nord', dossiers: 47, pts: 4700, badge: '🥇' },
                { rang: 2, nom: 'TOURE Aminata', zone: 'Grand Abidjan Sud', dossiers: 38, pts: 3800, badge: '🥈' },
                { rang: 3, nom: 'KONE Drissa', zone: 'Bouaké Centre', dossiers: 31, pts: 3100, badge: '🥉' },
                { rang: 4, nom: 'SORO Abib', zone: 'Korhogo Nord', dossiers: 28, pts: 2800, badge: '' },
                { rang: 5, nom: 'DIALLO Awa', zone: 'San Pédro Littoral', dossiers: 22, pts: 2200, badge: '' },
              ].map((p, i) => (
                <motion.div key={p.rang} className="flex items-center gap-4 px-6 py-3 border-b border-gray-50 last:border-0"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${p.rang <= 3 ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                    style={p.rang <= 3 ? { backgroundColor: p.rang === 1 ? '#F59E0B' : p.rang === 2 ? '#9CA3AF' : '#C66A2C' } : {}}>
                    {p.rang}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{p.nom}</p>
                    <p className="text-xs text-gray-400 truncate">{p.zone}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-sm" style={{ color: BO_PRIMARY }}>{p.pts.toLocaleString()} pts</p>
                    <p className="text-xs text-gray-400">{p.dossiers} dossiers</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'terminee', 'echouee', 'draft'].map(s => (
            <motion.button key={s} onClick={() => setFilterStatut(s)}
              className="px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all"
              style={{
                backgroundColor: filterStatut === s ? BO_PRIMARY : 'white',
                color: filterStatut === s ? 'white' : '#374151',
                borderColor: filterStatut === s ? BO_PRIMARY : '#e5e7eb',
              }}
              whileHover={filterStatut !== s ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
              {s === 'all' ? 'Toutes' : STATUT_CONFIG[s as Mission['statut']]?.label}
            </motion.button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...Object.keys(TYPE_CONFIG)].map(t => (
            <motion.button key={t} onClick={() => setFilterType(t)}
              className="px-3 py-2 rounded-2xl text-xs font-bold border-2 transition-all"
              style={{
                backgroundColor: filterType === t ? BO_DARK : 'white',
                color: filterType === t ? 'white' : '#374151',
                borderColor: filterType === t ? BO_DARK : '#e5e7eb',
              }}
              whileHover={filterType !== t ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
              {t === 'all' ? 'Tous types' : TYPE_CONFIG[t as Mission['type']]?.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Liste missions */}
      <div className="space-y-4">
        {filtered.map((mission, index) => {
          const typeConf = TYPE_CONFIG[mission.type];
          const statutConf = STATUT_CONFIG[mission.statut];
          const TypeIcon = typeConf.icon;
          const StatutIcon = statutConf.icon;
          const isExpanded = expanded === mission.id;

          return (
            <motion.div key={mission.id} className="bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              layout>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${typeConf.color}20` }}>
                    <TypeIcon className="w-6 h-6" style={{ color: typeConf.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                      <div>
                        <p className="font-black text-gray-900">{mission.titre}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{mission.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold ${statutConf.bg} ${statutConf.text}`}>
                          <StatutIcon className="w-3.5 h-3.5" />
                          {statutConf.label}
                        </div>
                        <motion.button onClick={() => setExpanded(isExpanded ? null : mission.id)}
                          className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
                          whileTap={{ scale: 0.9 }}>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </motion.button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{mission.region}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{mission.cible} ({mission.participantsCount} participants)</span>
                      <span className="flex items-center gap-1"><Award className="w-3 h-3" style={{ color: BO_PRIMARY }} /><strong style={{ color: BO_PRIMARY }}>{mission.points} pts</strong></span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                        {new Date(mission.dateDebut).toLocaleDateString('fr-FR')} → {new Date(mission.dateFin).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {mission.statut !== 'draft' && (
                      <ProgressBar value={mission.realise} total={mission.objectif} color={typeConf.color} />
                    )}
                  </div>
                </div>

                {/* Actions expandable */}
                <AnimatePresence>
                  {isExpanded && canWrite && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t-2 border-gray-100 flex gap-2 flex-wrap">
                        {mission.statut === 'draft' && (
                          <motion.button onClick={() => handlePublier(mission.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm text-white"
                            style={{ backgroundColor: '#10B981' }}
                            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                            <Flame className="w-4 h-4" />Activer la mission
                          </motion.button>
                        )}
                        {mission.statut === 'active' && (
                          <motion.button onClick={() => handleCloturer(mission.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2 border-blue-200 text-blue-700 bg-blue-50"
                            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                            <CheckCircle2 className="w-4 h-4" />Clôturer
                          </motion.button>
                        )}
                        <motion.button onClick={() => toast.info('Modifier la mission')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2 border-gray-200 text-gray-700"
                          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                          <Edit2 className="w-4 h-4" />Modifier
                        </motion.button>
                        <motion.button onClick={() => setShowLeaderboard(true)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2"
                          style={{ borderColor: BO_PRIMARY, color: BO_PRIMARY }}
                          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                          <Trophy className="w-4 h-4" />Classement
                        </motion.button>
                        <motion.button onClick={() => toast.info('Analytics mission')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2 border-gray-200"
                          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                          <BarChart3 className="w-4 h-4" />Analytics
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal création */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}>
            <motion.div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border-2 max-h-[90vh] overflow-y-auto"
              style={{ borderColor: BO_PRIMARY }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-900 text-xl">Nouvelle Mission</h2>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Titre *</label>
                  <input value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} required
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" placeholder="Ex : Sprint Identification Korhogo" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm resize-none"
                    placeholder="Objectif de la mission..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as Mission['type'] }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm">
                      {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Région</label>
                    <input value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" placeholder="Abidjan" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cible</label>
                    <input value={form.cible} onChange={e => setForm(p => ({ ...p, cible: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" placeholder="Identificateurs" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Objectif chiffré</label>
                    <input type="number" value={form.objectif} onChange={e => setForm(p => ({ ...p, objectif: +e.target.value }))} min={1}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date début *</label>
                    <input type="date" value={form.dateDebut} onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))} required
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date fin *</label>
                    <input type="date" value={form.dateFin} onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))} required
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Points récompense</label>
                  <input type="number" value={form.points} onChange={e => setForm(p => ({ ...p, points: +e.target.value }))} min={0} step={50}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
                  <motion.button type="submit" className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                    style={{ backgroundColor: BO_PRIMARY }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Save className="w-4 h-4" />Créer
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}