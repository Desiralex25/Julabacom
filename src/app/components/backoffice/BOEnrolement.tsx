import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserPlus, Building2, CheckCircle2, XCircle, Clock, AlertCircle,
  FileText, Plus, MessageSquare, ChevronDown, ChevronUp,
  Save, MapPin, Users, X,
} from 'lucide-react';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';
const INST_COLOR = '#712864';

const STATUT_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any; border: string }> = {
  draft:      { label: 'Brouillon',        bg: 'bg-gray-100',   text: 'text-gray-700',   icon: FileText,     border: 'border-gray-200' },
  pending:    { label: 'En attente',        bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock,        border: 'border-orange-200' },
  approved:   { label: 'Approuvé',          bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2, border: 'border-green-200' },
  rejected:   { label: 'Rejeté',            bg: 'bg-red-100',    text: 'text-red-700',    icon: XCircle,      border: 'border-red-200' },
  complement: { label: 'Complément requis', bg: 'bg-blue-100',   text: 'text-blue-700',   icon: AlertCircle,  border: 'border-blue-200' },
};

type FormType = 'admin' | 'identificateur' | 'institution' | null;
type ActiveTab = 'dossiers' | 'creer' | 'cooperatives';
const REGIONS = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'Korhogo', 'San Pédro', 'Man', 'Daloa', 'Divo', 'Abengourou'];

const MOCK_COOPS = [
  { id: 'co1', nom: 'Coopérative Maraîchère Adjamé', president: 'COULIBALY Inza', membres: 47, region: 'Abidjan', statut: 'pending', dateDepot: '2026-02-28', docs: ['Statuts signés', 'Liste membres', 'CNI président', 'PV AG'], capital: '2 500 000 FCFA' },
  { id: 'co2', nom: 'Groupement Femmes Producteurs Bouaké', president: 'KONE Mariam', membres: 23, region: 'Bouaké', statut: 'complement', dateDepot: '2026-02-10', docs: ['Statuts signés', 'CNI président'], capital: '800 000 FCFA' },
  { id: 'co3', nom: 'Coopérative Vivrière Korhogo', president: 'SORO Abib', membres: 31, region: 'Korhogo', statut: 'approved', dateDepot: '2026-01-15', docs: ['Statuts', 'Liste membres', 'CNI président', 'PV AG', 'Attestation MINADER'], capital: '1 200 000 FCFA' },
];

export function BOEnrolement() {
  const { dossiers, zones, hasPermission, updateDossierStatut, addAuditLog, boUser } = useBackOffice();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dossiers');
  const [formType, setFormType] = useState<FormType>(null);
  const [expandedDossier, setExpandedDossier] = useState<string | null>(null);
  const [expandedCoop, setExpandedCoop] = useState<string | null>(null);
  const [rejetModal, setRejetModal] = useState<{ open: boolean; dossierId: string | null }>({ open: false, dossierId: null });
  const [motifRejet, setMotifRejet] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [adminForm, setAdminForm] = useState({ nom: '', prenom: '', email: '', telephone: '', region: '', role: 'admin_national' });
  const [identForm, setIdentForm] = useState({ nom: '', prenom: '', telephone: '', cni: '', zoneId: '', region: '', objectifMensuel: '30', institutionRattachee: '' });

  const filteredDossiers = dossiers.filter(d => filterStatut === 'all' || d.statut === filterStatut);
  const zonesDisponibles = zones.filter(z => z.statut === 'active');
  const selectedZone = zonesDisponibles.find(z => z.id === identForm.zoneId);

  const handleValider = (id: string) => { updateDossierStatut(id, 'approved'); toast.success('Dossier approuvé'); };
  const handleRejeter = () => {
    if (!rejetModal.dossierId || !motifRejet.trim()) { toast.error('Motif de rejet obligatoire'); return; }
    if (rejetModal.dossierId.startsWith('coop_')) {
      const coopNom = MOCK_COOPS.find(c => `coop_${c.id}` === rejetModal.dossierId)?.nom || '';
      if (boUser) addAuditLog({ action: 'REJET coopérative', utilisateurBO: `${boUser.prenom} ${boUser.nom}`, roleBO: boUser.role, acteurImpacte: coopNom, ancienneValeur: 'pending', nouvelleValeur: 'rejected', ip: '127.0.0.1', module: 'Enrôlement' });
      toast.error('Coopérative rejetée');
    } else {
      updateDossierStatut(rejetModal.dossierId, 'rejected', motifRejet);
      toast.error('Dossier rejeté');
    }
    setRejetModal({ open: false, dossierId: null }); setMotifRejet('');
  };
  const handleComplement = (id: string) => { updateDossierStatut(id, 'complement'); toast.info('Demande de complément envoyée'); };

  const handleSubmitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.prenom || !adminForm.nom || !adminForm.email) return;
    if (boUser) addAuditLog({ action: 'CRÉATION compte Admin BO', utilisateurBO: `${boUser.prenom} ${boUser.nom}`, roleBO: boUser.role, acteurImpacte: `${adminForm.prenom} ${adminForm.nom}`, ancienneValeur: '—', nouvelleValeur: adminForm.role, ip: '127.0.0.1', module: 'Enrôlement' });
    toast.success(`Compte "${adminForm.prenom} ${adminForm.nom}" créé — identifiants envoyés par email`);
    setAdminForm({ nom: '', prenom: '', email: '', telephone: '', region: '', role: 'admin_national' });
    setFormType(null);
  };

  const handleSubmitIdent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identForm.zoneId) { toast.error('Veuillez sélectionner une zone'); return; }
    if (boUser) addAuditLog({ action: 'CRÉATION identificateur', utilisateurBO: `${boUser.prenom} ${boUser.nom}`, roleBO: boUser.role, acteurImpacte: `${identForm.prenom} ${identForm.nom}`, ancienneValeur: '—', nouvelleValeur: `Zone: ${selectedZone?.nom || identForm.zoneId}`, ip: '127.0.0.1', module: 'Enrôlement' });
    toast.success(`Identificateur "${identForm.prenom} ${identForm.nom}" créé — Zone : ${selectedZone?.nom}`);
    setIdentForm({ nom: '', prenom: '', telephone: '', cni: '', zoneId: '', region: '', objectifMensuel: '30', institutionRattachee: '' });
    setFormType(null);
  };

  const TABS: { id: ActiveTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dossiers', label: 'Dossiers', icon: FileText, badge: dossiers.filter(d => d.statut === 'pending').length },
    { id: 'cooperatives', label: 'Coopératives', icon: Users, badge: MOCK_COOPS.filter(c => c.statut === 'pending').length },
    { id: 'creer', label: 'Créer un compte', icon: Plus },
  ];
  const inputCls = 'w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm';

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Enrôlement</h1>
        <p className="text-sm text-gray-500 mt-0.5">Validation dossiers • Coopératives • Création Admin & Identificateurs</p>
      </motion.div>

      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <motion.button key={tab.id} onClick={() => { setActiveTab(tab.id); setFormType(null); }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border-2 transition-all flex-shrink-0"
            style={{ backgroundColor: activeTab === tab.id ? BO_PRIMARY : 'white', color: activeTab === tab.id ? 'white' : '#374151', borderColor: activeTab === tab.id ? BO_PRIMARY : '#e5e7eb' }}
            whileHover={activeTab !== tab.id ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="w-5 h-5 rounded-full text-white text-[9px] font-black flex items-center justify-center"
                style={{ backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.4)' : '#EF4444' }}>{tab.badge}</span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── DOSSIERS */}
        {activeTab === 'dossiers' && (
          <motion.div key="dossiers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-5 gap-3 mb-5">
              {Object.entries(STATUT_CONFIG).map(([key, conf]) => {
                const Icon = conf.icon;
                const count = dossiers.filter(d => d.statut === key).length;
                return (
                  <motion.button key={key} onClick={() => setFilterStatut(filterStatut === key ? 'all' : key)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${conf.bg} ${filterStatut === key ? conf.border : 'border-transparent'}`}
                    whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                    <Icon className={`w-4 h-4 ${conf.text} mb-1`} />
                    <p className={`text-xl font-black ${conf.text}`}>{count}</p>
                    <p className={`text-[10px] font-bold ${conf.text} leading-tight`}>{conf.label}</p>
                  </motion.button>
                );
              })}
            </div>
            <div className="space-y-3">
              {filteredDossiers.map((dossier, index) => {
                const conf = STATUT_CONFIG[dossier.statut];
                const Icon = conf.icon;
                const expanded = expandedDossier === dossier.id;
                return (
                  <motion.div key={dossier.id} className="bg-white rounded-2xl border-2 shadow-sm overflow-hidden"
                    style={{ borderColor: expanded ? BO_PRIMARY : '#f3f4f6' }}
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} layout>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${conf.bg}`}><Icon className={`w-5 h-5 ${conf.text}`} /></div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900">{dossier.acteurNom}</p>
                            <p className="text-xs text-gray-500">{dossier.acteurType} • Identificateur : {dossier.identificateurNom}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{dossier.region} • Créé le {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`px-3 py-1 rounded-xl text-xs font-bold ${conf.bg} ${conf.text}`}>{conf.label}</div>
                          <motion.button onClick={() => setExpandedDossier(expanded ? null : dossier.id)}
                            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                            {expanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 border-t-2 border-gray-100 pt-4">
                            <p className="text-xs font-bold text-gray-600 mb-2">Documents fournis</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {dossier.documents.map(doc => (
                                <span key={doc} className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700"><FileText className="w-3 h-3" />{doc}</span>
                              ))}
                            </div>
                            {dossier.motifRejet && (
                              <div className="mb-4 p-3 rounded-2xl bg-red-50 border-2 border-red-200">
                                <p className="text-xs font-bold text-red-700 mb-1">Motif de rejet</p>
                                <p className="text-xs text-red-600">{dossier.motifRejet}</p>
                              </div>
                            )}
                            {hasPermission('enrolement.validate') && dossier.statut === 'pending' && (
                              <div className="flex gap-3 flex-wrap">
                                <motion.button onClick={() => handleValider(dossier.id)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm text-white" style={{ backgroundColor: '#10B981' }} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}><CheckCircle2 className="w-4 h-4" /> Valider</motion.button>
                                <motion.button onClick={() => setRejetModal({ open: true, dossierId: dossier.id })} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm text-white bg-red-500" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}><XCircle className="w-4 h-4" /> Rejeter</motion.button>
                                <motion.button onClick={() => handleComplement(dossier.id)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm border-2 border-blue-300 text-blue-700" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}><MessageSquare className="w-4 h-4" /> Complément</motion.button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              {filteredDossiers.length === 0 && <div className="text-center py-12 text-gray-400"><FileText className="w-16 h-16 mx-auto mb-3" /><p className="font-bold">Aucun dossier trouvé</p></div>}
            </div>
          </motion.div>
        )}

        {/* ── COOPÉRATIVES */}
        {activeTab === 'cooperatives' && (
          <motion.div key="cooperatives" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'En attente validation', value: MOCK_COOPS.filter(c => c.statut === 'pending').length, color: '#F59E0B' },
                { label: 'Agréées', value: MOCK_COOPS.filter(c => c.statut === 'approved').length, color: '#10B981' },
                { label: 'Complément requis', value: MOCK_COOPS.filter(c => c.statut === 'complement').length, color: '#3B82F6' },
              ].map((s, i) => (
                <motion.div key={s.label} className="bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <p className="text-xs text-gray-500 font-semibold mb-1">{s.label}</p>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                </motion.div>
              ))}
            </div>
            <div className="space-y-3">
              {MOCK_COOPS.map((coop, i) => {
                const conf = STATUT_CONFIG[coop.statut] || STATUT_CONFIG.pending;
                const Icon = conf.icon;
                const expanded = expandedCoop === coop.id;
                return (
                  <motion.div key={coop.id} className="bg-white rounded-2xl border-2 shadow-sm overflow-hidden"
                    style={{ borderColor: expanded ? BO_PRIMARY : '#f3f4f6' }}
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} layout>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-blue-700" /></div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900">{coop.nom}</p>
                            <p className="text-xs text-gray-500">Président : {coop.president} • {coop.membres} membres</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <p className="text-xs text-gray-400">{coop.region} • Déposé le {new Date(coop.dateDepot).toLocaleDateString('fr-FR')}</p>
                              <p className="text-xs font-bold" style={{ color: BO_PRIMARY }}>Capital : {coop.capital}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`px-3 py-1 rounded-xl text-xs font-bold ${conf.bg} ${conf.text}`}>{conf.label}</div>
                          <motion.button onClick={() => setExpandedCoop(expanded ? null : coop.id)}
                            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 border-t-2 border-gray-100 pt-4">
                            <p className="text-xs font-bold text-gray-600 mb-2">Documents fournis ({coop.docs.length})</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {coop.docs.map(doc => (
                                <span key={doc} className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700"><FileText className="w-3 h-3" />{doc}</span>
                              ))}
                            </div>
                            {hasPermission('enrolement.validate') && coop.statut === 'pending' && (
                              <div className="flex gap-3 flex-wrap">
                                <motion.button onClick={() => {
                                  if (boUser) addAuditLog({ action: 'AGRÉMENT coopérative', utilisateurBO: `${boUser.prenom} ${boUser.nom}`, roleBO: boUser.role, acteurImpacte: coop.nom, ancienneValeur: 'pending', nouvelleValeur: 'approved', ip: '127.0.0.1', module: 'Enrôlement' });
                                  toast.success(`Coopérative "${coop.nom}" agréée`);
                                }} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm text-white" style={{ backgroundColor: '#10B981' }} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}><CheckCircle2 className="w-4 h-4" /> Agréer</motion.button>
                                <motion.button onClick={() => toast.info('Demande de complément envoyée')} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm border-2 border-blue-300 text-blue-700" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}><MessageSquare className="w-4 h-4" /> Complément</motion.button>
                                {/* Rejet avec modal motif obligatoire */}
                                <motion.button onClick={() => setRejetModal({ open: true, dossierId: `coop_${coop.id}` })} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm text-red-700 border-2 border-red-300" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}><XCircle className="w-4 h-4" /> Rejeter</motion.button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── CRÉER */}
        {activeTab === 'creer' && (
          <motion.div key="creer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {!formType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                <motion.button onClick={() => setFormType('admin')} className="p-8 rounded-3xl border-2 border-gray-200 bg-white text-left hover:shadow-lg transition-all" whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${BO_DARK}15` }}><Building2 className="w-8 h-8" style={{ color: BO_DARK }} /></div>
                  <h3 className="font-black text-gray-900 text-lg mb-2">Créer Admin BO</h3>
                  <p className="text-sm text-gray-500">Administrateur national, gestionnaire de zone ou analyste</p>
                </motion.button>
                <motion.button onClick={() => setFormType('identificateur')} className="p-8 rounded-3xl border-2 border-gray-200 bg-white text-left hover:shadow-lg transition-all" whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${BO_PRIMARY}20` }}><UserPlus className="w-8 h-8" style={{ color: BO_PRIMARY }} /></div>
                  <h3 className="font-black text-gray-900 text-lg mb-2">Créer Identificateur</h3>
                  <p className="text-sm text-gray-500">Agent de terrain avec zone assignée, objectifs mensuels et accès applicatif mobile</p>
                </motion.button>
                <motion.button
                  onClick={() => navigate('/backoffice/institutions')}
                  className="p-8 rounded-3xl border-2 bg-white text-left hover:shadow-lg transition-all"
                  style={{ borderColor: `${INST_COLOR}40` }}
                  whileHover={{ y: -6, scale: 1.02, borderColor: INST_COLOR }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${INST_COLOR}15` }}>
                    <Building2 className="w-8 h-8" style={{ color: INST_COLOR }} />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg mb-2">Créer Institution</h3>
                  <p className="text-sm text-gray-500">CNPS, BNI, Ministère, ANADER, ONG — avec accès modules configurables</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${INST_COLOR}15`, color: INST_COLOR }}>
                    Module dédié
                  </div>
                </motion.button>
              </div>
            )}
            {formType === 'admin' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100 max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div><h2 className="font-black text-gray-900 text-xl">Nouvel Admin / Institution</h2><p className="text-xs text-gray-400 mt-0.5">Identifiants envoyés par email • Action journalisée</p></div>
                  <motion.button onClick={() => setFormType(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" whileTap={{ scale: 0.9 }}><X className="w-5 h-5 text-gray-600" /></motion.button>
                </div>
                <form onSubmit={handleSubmitAdmin} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Prénom *</label><input value={adminForm.prenom} onChange={e => setAdminForm(p => ({ ...p, prenom: e.target.value }))} required className={inputCls} placeholder="Jean-Baptiste" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Nom *</label><input value={adminForm.nom} onChange={e => setAdminForm(p => ({ ...p, nom: e.target.value }))} required className={inputCls} placeholder="KOUASSI" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Email *</label><input type="email" value={adminForm.email} onChange={e => setAdminForm(p => ({ ...p, email: e.target.value }))} required className={inputCls} placeholder="nom@julaba.ci" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label><input type="tel" value={adminForm.telephone} onChange={e => setAdminForm(p => ({ ...p, telephone: e.target.value }))} className={inputCls} placeholder="0705XXXXXX" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Rôle *</label>
                      <select value={adminForm.role} onChange={e => setAdminForm(p => ({ ...p, role: e.target.value }))} className={inputCls}>
                        <option value="admin_national">Admin National</option>
                        <option value="gestionnaire_zone">Gestionnaire de Zone</option>
                        <option value="analyste">Analyste / Observateur</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Région assignée</label>
                      <select value={adminForm.region} onChange={e => setAdminForm(p => ({ ...p, region: e.target.value }))} className={inputCls}>
                        <option value="">Nationale (toutes)</option>
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Preview permissions selon rôle */}
                  <div className="p-3 rounded-2xl bg-gray-50 border-2 border-gray-100">
                    <p className="text-xs font-bold text-gray-600 mb-2">Permissions du rôle sélectionné</p>
                    <div className="flex flex-wrap gap-1">
                      {adminForm.role === 'admin_national' && ['Voir acteurs', 'Modifier acteurs', 'Suspendre', 'Valider dossiers', 'Voir transactions', 'Voir audit'].map(p => (
                        <span key={p} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-700">{p}</span>
                      ))}
                      {adminForm.role === 'gestionnaire_zone' && ['Voir acteurs', 'Valider dossiers', 'Voir transactions', 'Voir commissions'].map(p => (
                        <span key={p} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-green-50 text-green-700">{p}</span>
                      ))}
                      {adminForm.role === 'analyste' && ['Voir acteurs', 'Voir transactions', 'Voir commissions', 'Voir audit'].map(p => (
                        <span key={p} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-purple-50 text-purple-700">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setFormType(null)} className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
                    <motion.button type="submit" className="flex-1 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2" style={{ backgroundColor: BO_DARK }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}><Save className="w-5 h-5" /> Créer le compte Admin</motion.button>
                  </div>
                </form>
              </motion.div>
            )}
            {formType === 'identificateur' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100 max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div><h2 className="font-black text-gray-900 text-xl">Nouvel Identificateur</h2><p className="text-xs text-gray-400 mt-0.5">Accès applicatif envoyé par SMS • Action journalisée</p></div>
                  <motion.button onClick={() => setFormType(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" whileTap={{ scale: 0.9 }}><X className="w-5 h-5 text-gray-600" /></motion.button>
                </div>
                <form onSubmit={handleSubmitIdent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Prénom *</label><input value={identForm.prenom} onChange={e => setIdentForm(p => ({ ...p, prenom: e.target.value }))} required className={inputCls} placeholder="Brice" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Nom *</label><input value={identForm.nom} onChange={e => setIdentForm(p => ({ ...p, nom: e.target.value }))} required className={inputCls} placeholder="GNAGNE" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Téléphone * (login app)</label><input type="tel" value={identForm.telephone} onChange={e => setIdentForm(p => ({ ...p, telephone: e.target.value }))} required className={inputCls} placeholder="0705XXXXXX" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Numéro CNI</label><input value={identForm.cni} onChange={e => setIdentForm(p => ({ ...p, cni: e.target.value }))} className={inputCls} placeholder="CI-AB-XXXX-XXXXXX" /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Zone assignée *</label>
                    <select value={identForm.zoneId} onChange={e => { const z = zonesDisponibles.find(z => z.id === e.target.value); setIdentForm(p => ({ ...p, zoneId: e.target.value, region: z?.region || '' })); }} required className={inputCls}>
                      <option value="">Choisir une zone active...</option>
                      {zonesDisponibles.map(z => <option key={z.id} value={z.id}>{z.nom} — {z.region} ({z.nbActeurs} acteurs)</option>)}
                    </select>
                    <AnimatePresence>
                      {selectedZone && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mt-2 p-3 rounded-2xl border-2 flex items-center gap-3" style={{ borderColor: `${BO_PRIMARY}40`, backgroundColor: `${BO_PRIMARY}08` }}>
                          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: BO_PRIMARY }} />
                          <div>
                            <p className="text-xs font-black text-gray-900">{selectedZone.nom} — {selectedZone.region}</p>
                            <p className="text-xs text-gray-500">{selectedZone.nbActeurs} acteurs • {selectedZone.nbIdentificateurs} identificateurs • Activité : {selectedZone.tauxActivite}%</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Objectif mensuel (dossiers)</label><input type="number" value={identForm.objectifMensuel} onChange={e => setIdentForm(p => ({ ...p, objectifMensuel: e.target.value }))} min="5" max="200" className={inputCls} /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Institution rattachée</label><input value={identForm.institutionRattachee} onChange={e => setIdentForm(p => ({ ...p, institutionRattachee: e.target.value }))} className={inputCls} placeholder="DGE Abidjan" /></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setFormType(null)} className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
                    <motion.button type="submit" className="flex-1 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2" style={{ backgroundColor: BO_PRIMARY }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}><Save className="w-5 h-5" /> Créer l'identificateur</motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Rejet — avec motif obligatoire pour dossiers ET coopératives */}
      <AnimatePresence>
        {rejetModal.open && (
          <motion.div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setRejetModal({ open: false, dossierId: null })}>
            <motion.div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2 border-red-300"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()}>
              <h3 className="font-black text-gray-900 text-lg mb-2">Motif de rejet</h3>
              <p className="text-sm text-gray-500 mb-4">Obligatoire — sera communiqué. Action journalisée dans l'audit.</p>
              <textarea value={motifRejet} onChange={e => setMotifRejet(e.target.value)} rows={4}
                placeholder="Ex : CNI illisible, document manquant..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-red-400 focus:outline-none text-sm resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setRejetModal({ open: false, dossierId: null })} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
                <button onClick={handleRejeter} className="flex-1 py-3 rounded-2xl font-bold text-white bg-red-500">Rejeter</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}