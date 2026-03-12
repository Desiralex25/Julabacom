import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Users, TrendingUp, Plus, Edit2, UserCog, CheckCircle2, XCircle, Activity, Save, X, Power, ChevronRight, Building2, Map } from 'lucide-react';
import { useBackOffice, BOZone } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const GESTIONNAIRES = ['ICONE SOLUTION', 'KOFFI Ange-Désiré', 'DIALLO Mamadou', 'ASSI Roméo', 'SORO Abib', 'TOURE Aminata'];
const REGIONS_LIST = ['Lagunes', 'Yamoussoukro', 'Haut-Sassandra', 'La Mé'];

// Regroupement hiérarchique des zones
interface ZoneHierarchy {
  region: BOZone;
  villes: {
    ville: BOZone;
    communes: {
      commune: BOZone;
      marches: BOZone[];
    }[];
  }[];
}

export function BOZones() {
  const { zones, hasPermission, addAuditLog, boUser, updateZoneStatut, addZone, updateZoneData } = useBackOffice();
  const [showCreate, setShowCreate] = useState(false);
  const [editZone, setEditZone] = useState<BOZone | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [expandedRegions, setExpandedRegions] = useState<string[]>(['region-lagunes']); // Lagunes ouvert par défaut
  const [expandedVilles, setExpandedVilles] = useState<string[]>(['ville-abidjan']);
  const [expandedCommunes, setExpandedCommunes] = useState<string[]>(['commune-cocody']);
  const [form, setForm] = useState({ nom: '', region: '', gestionnaire: '' });
  const [editForm, setEditForm] = useState({ nom: '', region: '', gestionnaire: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculer uniquement les acteurs des marchés (niveau le plus fin)
  const totalActeurs = zones.filter(z => z.niveau === 'marche').reduce((s, z) => s + z.nbActeurs, 0);
  const totalVolume = zones.filter(z => z.niveau === 'marche').reduce((s, z) => s + z.volumeTotal, 0);
  const zoneActive = zones.filter(z => z.statut === 'active').length;

  // Construction de la hiérarchie
  const hierarchy = useMemo((): ZoneHierarchy[] => {
    const regions = zones.filter(z => z.niveau === 'region');
    
    return regions.map(region => {
      const villes = zones.filter(z => z.niveau === 'ville' && z.parentId === region.id);
      
      return {
        region,
        villes: villes.map(ville => {
          const communes = zones.filter(z => z.niveau === 'commune' && z.parentId === ville.id);
          
          return {
            ville,
            communes: communes.map(commune => {
              const marches = zones.filter(z => z.niveau === 'marche' && z.parentId === commune.id);
              return {
                commune,
                marches,
              };
            }),
          };
        }),
      };
    });
  }, [zones]);

  const toggleRegion = (regionId: string) => {
    setExpandedRegions(prev => 
      prev.includes(regionId) ? prev.filter(id => id !== regionId) : [...prev, regionId]
    );
  };

  const toggleVille = (villeId: string) => {
    setExpandedVilles(prev => 
      prev.includes(villeId) ? prev.filter(id => id !== villeId) : [...prev, villeId]
    );
  };

  const toggleCommune = (communeId: string) => {
    setExpandedCommunes(prev => 
      prev.includes(communeId) ? prev.filter(id => id !== communeId) : [...prev, communeId]
    );
  };

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

  // Icônes selon le niveau
  const getNiveauIcon = (niveau: string) => {
    switch (niveau) {
      case 'region': return Map;
      case 'ville': return Building2;
      case 'commune': return MapPin;
      case 'marche': return Activity;
      default: return MapPin;
    }
  };

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case 'region': return '#6366F1';
      case 'ville': return '#8B5CF6';
      case 'commune': return BO_PRIMARY;
      case 'marche': return '#10B981';
      default: return BO_PRIMARY;
    }
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Zones & Territoires</h1>
          <p className="text-sm text-gray-500 mt-0.5">{hierarchy.length} regions • {totalActeurs.toLocaleString()} acteurs</p>
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
          { label: 'Volume total', value: `${totalVolume.toLocaleString()} FCFA`, icon: TrendingUp, color: '#3B82F6' },
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

      {/* Vue hiérarchique */}
      <div className="bg-white rounded-3xl shadow-md border-2 border-gray-100 overflow-hidden">
        {hierarchy.map((regionData, regionIndex) => (
          <div key={regionData.region.id}>
            {/* RÉGION */}
            <motion.div
              className={`p-6 cursor-pointer border-b-2 border-gray-100 ${expandedRegions.includes(regionData.region.id) ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => toggleRegion(regionData.region.id)}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <motion.div
                    animate={{ rotate: expandedRegions.includes(regionData.region.id) ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </motion.div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100">
                    <Map className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">{regionData.region.nom}</h3>
                    <p className="text-xs font-semibold text-gray-500">Région</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500 mb-1.5">Acteurs</p>
                    <p className="font-black text-indigo-600 text-xl">{regionData.region.nbActeurs}</p>
                  </div>
                  <div className="text-right min-w-[160px]">
                    <p className="text-xs font-semibold text-gray-500 mb-1.5">Volume</p>
                    <p className="font-black text-gray-900 text-base">{regionData.region.volumeTotal.toLocaleString()} FCFA</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* VILLES */}
            <AnimatePresence>
              {expandedRegions.includes(regionData.region.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-gray-50"
                >
                  {regionData.villes.map((villeData) => (
                    <div key={villeData.ville.id}>
                      <motion.div
                        className={`p-5 pl-16 cursor-pointer border-b border-gray-200 ${expandedVilles.includes(villeData.ville.id) ? 'bg-purple-50' : 'hover:bg-gray-100'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVille(villeData.ville.id);
                        }}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <motion.div
                              animate={{ rotate: expandedVilles.includes(villeData.ville.id) ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-5 h-5 text-gray-600" />
                            </motion.div>
                            <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-purple-100">
                              <Building2 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">{villeData.ville.nom}</h4>
                              <p className="text-xs font-semibold text-gray-500">Ville</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-xs font-semibold text-gray-500 mb-1.5">Acteurs</p>
                              <p className="font-black text-purple-600 text-lg">{villeData.ville.nbActeurs}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* COMMUNES */}
                      <AnimatePresence>
                        {expandedVilles.includes(villeData.ville.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-white"
                          >
                            {villeData.communes.map((communeData) => (
                              <div key={communeData.commune.id}>
                                <motion.div
                                  className={`p-5 pl-28 cursor-pointer border-b border-gray-100 ${expandedCommunes.includes(communeData.commune.id) ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCommune(communeData.commune.id);
                                  }}
                                  whileHover={{ x: 4 }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                      <motion.div
                                        animate={{ rotate: expandedCommunes.includes(communeData.commune.id) ? 90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                      </motion.div>
                                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${BO_PRIMARY}20` }}>
                                        <MapPin className="w-5 h-5" style={{ color: BO_PRIMARY }} />
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-gray-900 text-base">{communeData.commune.nom}</h5>
                                        <p className="text-xs font-semibold text-gray-500">Commune</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                      <div className="text-right">
                                        <p className="text-xs font-semibold text-gray-500 mb-1.5">Acteurs</p>
                                        <p className="font-black text-lg" style={{ color: BO_PRIMARY }}>{communeData.commune.nbActeurs}</p>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>

                                {/* MARCHÉS */}
                                <AnimatePresence>
                                  {expandedCommunes.includes(communeData.commune.id) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden bg-gray-50"
                                    >
                                      {communeData.marches.map((marche, mIndex) => (
                                        <motion.div
                                          key={marche.id}
                                          className={`p-5 pl-40 border-b border-gray-100 cursor-pointer ${selectedZone === marche.id ? 'bg-green-50 border-l-4' : 'hover:bg-white'}`}
                                          style={selectedZone === marche.id ? { borderLeftColor: '#10B981' } : {}}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedZone(selectedZone === marche.id ? null : marche.id);
                                          }}
                                          whileHover={{ x: 4 }}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: mIndex * 0.05 }}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-100">
                                                <Activity className="w-4 h-4 text-green-600" />
                                              </div>
                                              <div>
                                                <h6 className="font-bold text-gray-900">{marche.nom}</h6>
                                                <p className="text-xs font-semibold text-gray-500">Marché / Zone</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                              <div className="text-right">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Acteurs</p>
                                                <p className="font-black text-green-600 text-base">{marche.nbActeurs}</p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Identificateurs</p>
                                                <p className="font-bold text-gray-700">{marche.nbIdentificateurs}</p>
                                              </div>
                                              <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${marche.statut === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {marche.statut === 'active' ? 'Actif' : 'Inactif'}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Détails marché */}
                                          <AnimatePresence>
                                            {selectedZone === marche.id && (
                                              <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                              >
                                                <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                                                  <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                      <p className="text-xs text-gray-500 font-semibold mb-1">Volume total</p>
                                                      <p className="font-black text-sm text-gray-900">{marche.volumeTotal.toLocaleString()} FCFA</p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                      <p className="text-xs text-gray-500 font-semibold mb-1">Taux d'activité</p>
                                                      <p className="font-black text-sm" style={{ color: marche.tauxActivite >= 70 ? '#10B981' : BO_PRIMARY }}>
                                                        {marche.tauxActivite}%
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-2">
                                                        <UserCog className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm font-semibold text-gray-700">Gestionnaire</span>
                                                      </div>
                                                      <span className="text-sm font-bold text-gray-900">{marche.gestionnaire || 'Non assigné'}</span>
                                                    </div>
                                                  </div>
                                                  {hasPermission('zones.write') && (
                                                    <div className="flex gap-2">
                                                      <motion.button
                                                        onClick={(e) => openEdit(e, marche)}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-700"
                                                        whileHover={{ y: -2 }}
                                                        whileTap={{ scale: 0.97 }}
                                                      >
                                                        <Edit2 className="w-4 h-4" /> Modifier
                                                      </motion.button>
                                                      <motion.button
                                                        onClick={(e) => handleToggleStatut(e, marche)}
                                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs ${marche.statut === 'active' ? 'bg-red-50 text-red-600 border-2 border-red-200' : 'bg-green-50 text-green-600 border-2 border-green-200'}`}
                                                        whileHover={{ y: -2 }}
                                                        whileTap={{ scale: 0.97 }}
                                                      >
                                                        <Power className="w-3.5 h-3.5" />
                                                        {marche.statut === 'active' ? 'Désactiver' : 'Activer'}
                                                      </motion.button>
                                                    </div>
                                                  )}
                                                </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </motion.div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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