import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Users, TrendingUp, Plus, Edit2, UserCog, CheckCircle2, XCircle, Activity, Save, X, Power } from 'lucide-react';
import { useBackOffice, BOZone } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const GESTIONNAIRES = ['KOFFI Ange-Désiré', 'DIALLO Mamadou', 'ASSI Roméo', 'SORO Abib', 'TOURE Aminata'];
const REGIONS_LIST = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'Korhogo', 'San Pédro', 'Man', 'Daloa'];

export function BOZones() {
  const { zones, hasPermission, addAuditLog, boUser, updateZoneStatut, addZone, updateZoneData } = useBackOffice();
  const [showCreate, setShowCreate] = useState(false);
  const [editZone, setEditZone] = useState<BOZone | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [form, setForm] = useState({ nom: '', region: '', gestionnaire: '' });
  const [editForm, setEditForm] = useState({ nom: '', region: '', gestionnaire: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalActeurs = zones.reduce((s, z) => s + z.nbActeurs, 0);
  const totalVolume = zones.reduce((s, z) => s + z.volumeTotal, 0);
  const zoneActive = zones.filter(z => z.statut === 'active').length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addZone({
        nom: form.nom,
        region: form.region,
        gestionnaire: form.gestionnaire || undefined,
      });
      toast.success(`Zone "${form.nom}" créée avec succès`);
      setShowCreate(false);
      setForm({ nom: '', region: '', gestionnaire: '' });
    } catch (error) {
      console.error('Erreur création zone:', error);
      toast.error('Erreur lors de la création de la zone');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (e: React.MouseEvent, zone: BOZone) => {
    e.stopPropagation();
    setEditZone(zone);
    setEditForm({ nom: zone.nom, region: zone.region, gestionnaire: zone.gestionnaire || '' });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editZone) return;
    setIsSubmitting(true);
    try {
      await updateZoneData(editZone.id, {
        nom: editForm.nom,
        region: editForm.region,
        gestionnaire: editForm.gestionnaire || undefined,
      });
      toast.success(`Zone "${editForm.nom}" mise à jour avec succès`);
      setEditZone(null);
    } catch (error) {
      console.error('Erreur modification zone:', error);
      toast.error('Erreur lors de la mise à jour de la zone');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatut = (e: React.MouseEvent, zone: BOZone) => {
    e.stopPropagation();
    const newStatut = zone.statut === 'active' ? 'inactive' : 'active';
    updateZoneStatut(zone.id, newStatut);
    toast.success(`Zone "${zone.nom}" ${newStatut === 'active' ? 'activée' : 'désactivée'}`);
  };

  const inputCls = 'w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm';

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Zones & Territoires</h1>
          <p className="text-sm text-gray-500 mt-0.5">{zones.length} zones • {totalActeurs.toLocaleString()} acteurs</p>
        </div>
        {hasPermission('zones.write') && (
          <motion.button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold shadow-lg"
            style={{ backgroundColor: BO_PRIMARY }}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouvelle zone</span>
          </motion.button>
        )}
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Zones actives', value: zoneActive, icon: CheckCircle2, color: '#10B981' },
          { label: 'Total acteurs', value: totalActeurs.toLocaleString(), icon: Users, color: BO_PRIMARY },
          { label: 'Volume total', value: `${(totalVolume / 1000000).toFixed(0)}M F`, icon: TrendingUp, color: '#3B82F6' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
                <p className="text-xs font-bold text-gray-500">{kpi.label}</p>
              </div>
              <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Grille zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {zones.map((zone, index) => (
          <motion.div key={zone.id}
            className={`bg-white rounded-3xl p-5 shadow-md border-2 cursor-pointer ${selectedZone === zone.id ? 'border-[#E6A817]' : 'border-gray-100'}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
            onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${BO_PRIMARY}20` }}>
                  <MapPin className="w-6 h-6" style={{ color: BO_PRIMARY }} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900">{zone.nom}</h3>
                  <p className="text-xs font-semibold text-gray-500">{zone.region}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${zone.statut === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {zone.statut === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {zone.statut === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Acteurs', value: zone.nbActeurs.toLocaleString(), color: BO_PRIMARY },
                { label: 'Identificateurs', value: zone.nbIdentificateurs, color: '#3B82F6' },
                { label: 'Volume', value: `${(zone.volumeTotal / 1000000).toFixed(0)}M F`, color: '#10B981' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-2xl p-3 border-2 border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-semibold mb-1">{s.label}</p>
                  <p className="font-black text-sm" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Barre activité */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-600">Taux d'activité</span>
                <span className="text-xs font-black" style={{ color: zone.tauxActivite >= 70 ? '#10B981' : zone.tauxActivite >= 50 ? BO_PRIMARY : '#EF4444' }}>
                  {zone.tauxActivite}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ backgroundColor: zone.tauxActivite >= 70 ? '#10B981' : zone.tauxActivite >= 50 ? BO_PRIMARY : '#EF4444' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${zone.tauxActivite}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }} />
              </div>
            </div>

            {/* Détail expandable */}
            <AnimatePresence>
              {selectedZone === zone.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-4 pt-4 border-t-2 border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCog className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">Gestionnaire</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{zone.gestionnaire || 'Non assigné'}</span>
                    </div>
                    {hasPermission('zones.write') && (
                      <div className="flex gap-2 mt-3">
                        <motion.button onClick={e => openEdit(e, zone)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 border-gray-200 font-bold text-sm text-gray-700"
                          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                          <Edit2 className="w-4 h-4" /> Modifier
                        </motion.button>
                        <motion.button onClick={e => { e.stopPropagation(); toast.success('Gestionnaire mis à jour'); }}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm text-white"
                          style={{ backgroundColor: BO_PRIMARY }}
                          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                          <UserCog className="w-4 h-4" /> Assigner
                        </motion.button>
                        <motion.button onClick={e => handleToggleStatut(e, zone)}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl font-bold text-xs border-2 ${zone.statut === 'active' ? 'border-red-200 text-red-600 bg-red-50' : 'border-green-200 text-green-600 bg-green-50'}`}
                          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                          <Power className="w-3.5 h-3.5" />
                          {zone.statut === 'active' ? 'Désactiver' : 'Activer'}
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Modal Créer Zone */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}>
            <motion.div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border-2" style={{ borderColor: BO_PRIMARY }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-900 text-xl">Créer une zone</h2>
                <motion.button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                  <X className="w-4 h-4 text-gray-600" />
                </motion.button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nom de la zone *</label>
                  <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} required
                    className={inputCls} placeholder="Grand Abidjan Est" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Région *</label>
                  <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} required className={inputCls}>
                    <option value="">Choisir une région</option>
                    {REGIONS_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Gestionnaire</label>
                  <select value={form.gestionnaire} onChange={e => setForm(p => ({ ...p, gestionnaire: e.target.value }))} className={inputCls}>
                    <option value="">Non assigné</option>
                    {GESTIONNAIRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
                  <motion.button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ backgroundColor: BO_PRIMARY }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Save className="w-4 h-4" /> {isSubmitting ? 'Création...' : 'Créer'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Modifier Zone */}
      <AnimatePresence>
        {editZone && (
          <motion.div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditZone(null)}>
            <motion.div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border-2" style={{ borderColor: BO_DARK }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-black text-gray-900 text-xl">Modifier la zone</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{editZone.nom}</p>
                </div>
                <motion.button onClick={() => setEditZone(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                  <X className="w-4 h-4 text-gray-600" />
                </motion.button>
              </div>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nom de la zone *</label>
                  <input value={editForm.nom} onChange={e => setEditForm(p => ({ ...p, nom: e.target.value }))} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Région *</label>
                  <select value={editForm.region} onChange={e => setEditForm(p => ({ ...p, region: e.target.value }))} required className={inputCls}>
                    {REGIONS_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Gestionnaire</label>
                  <select value={editForm.gestionnaire} onChange={e => setEditForm(p => ({ ...p, gestionnaire: e.target.value }))} className={inputCls}>
                    <option value="">Non assigné</option>
                    {GESTIONNAIRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* Info zones non modifiables */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-gray-50 border-2 border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold">Acteurs actuels</p>
                    <p className="font-black text-sm" style={{ color: BO_PRIMARY }}>{editZone.nbActeurs.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold">Taux activité</p>
                    <p className="font-black text-sm" style={{ color: '#10B981' }}>{editZone.tauxActivite}%</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditZone(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
                  <motion.button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ backgroundColor: BO_DARK }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Save className="w-4 h-4" /> {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
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