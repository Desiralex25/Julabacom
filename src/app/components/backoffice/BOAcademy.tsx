import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Plus, Edit2, Eye, Trash2, Users, Star, Clock,
  CheckCircle2, Play, Award, BarChart3, TrendingUp, Save,
  ChevronDown, ChevronUp, X, Video, FileText, Mic,
  Archive, HelpCircle, CheckCircle, XCircle, ToggleLeft, ToggleRight,
  Target, Layers,
} from 'lucide-react';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';
import {
  AcademyQuestion, ACADEMY_QUESTIONS, getAllQuestionsForRole, saveAllQuestionsForRole, CHAPTER_THEMES,
} from '../academy/academyQuestions';
import { UserRole } from '../academy/types';
import { ImagePickerField } from '../shared/ImagePickerField';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

type ModuleType = 'video' | 'audio' | 'quiz' | 'texte';
type NiveauType = 'debutant' | 'intermediaire' | 'avance';
type ProfilType = 'marchand' | 'producteur' | 'cooperative' | 'identificateur' | 'tous';
type ActiveTab = 'modules' | 'questions';

interface AcademyModule {
  id: string;
  titre: string;
  description: string;
  type: ModuleType;
  niveau: NiveauType;
  profil: ProfilType;
  duree: number;
  points: number;
  statut: 'publie' | 'brouillon' | 'archive';
  nbInscrits: number;
  tauxCompletion: number;
  dateCreation: string;
  image: string;
}

const MOCK_MODULES: AcademyModule[] = [];

// ── CONFIGURATION DES MODULES ACADEMY ─────────────────────────────────────────
const TYPE_CONFIG: Record<ModuleType, { label: string; icon: any; color: string }> = {
  video: { label: 'Video', icon: Video, color: '#EF4444' },
  audio: { label: 'Audio', icon: Mic, color: '#8B5CF6' },
  quiz: { label: 'Quiz', icon: HelpCircle, color: '#10B981' },
  texte: { label: 'Texte', icon: FileText, color: '#3B82F6' },
};

const NIVEAU_CONFIG: Record<NiveauType, { label: string; color: string }> = {
  debutant: { label: 'Debutant', color: '#10B981' },
  intermediaire: { label: 'Intermediaire', color: '#F59E0B' },
  avance: { label: 'Avance', color: '#EF4444' },
};

const STATUT_CONFIG: Record<'publie' | 'brouillon' | 'archive', { label: string; color: string; bg: string; text: string }> = {
  publie: { label: 'Publie', color: '#10B981', bg: 'bg-green-100', text: 'text-green-700' },
  brouillon: { label: 'Brouillon', color: '#F59E0B', bg: 'bg-orange-100', text: 'text-orange-700' },
  archive: { label: 'Archive', color: '#6B7280', bg: 'bg-gray-100', text: 'text-gray-700' },
};

export function BOAcademy() {
  const { hasPermission, addAuditLog, boUser } = useBackOffice();
  const [modules, setModules] = useState<AcademyModule[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterProfil, setFilterProfil] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ titre: '', description: '', type: 'video' as ModuleType, niveau: 'debutant' as NiveauType, profil: 'tous' as ProfilType, duree: 10, points: 50, image: '' });

  // Questions du Jeu
  const [activeTab, setActiveTab] = useState<ActiveTab>('modules');
  const [qRole, setQRole] = useState<UserRole>('marchand');
  const [qChapter, setQChapter] = useState<number>(1);
  const [editingQ, setEditingQ] = useState<AcademyQuestion | null>(null);
  const [showQEditor, setShowQEditor] = useState(false);
  const [qForm, setQForm] = useState<Partial<AcademyQuestion>>({});

  const canWrite = hasPermission('academy.write');

  const ROLES: UserRole[] = ['marchand', 'producteur', 'cooperative', 'identificateur', 'institution'];
  const ROLE_LABELS: Record<UserRole, string> = {
    marchand: 'Marchand', producteur: 'Producteur', cooperative: 'Coopérative',
    identificateur: 'Identificateur', institution: 'Institution',
  };
  const ROLE_COLORS: Record<UserRole, string> = {
    marchand: '#C66A2C', producteur: '#2E8B57', cooperative: '#2072AF',
    identificateur: '#9F8170', institution: '#712864',
  };

  const [questionsCache, setQuestionsCache] = useState<Record<string, AcademyQuestion[]>>({});
  const getQuestions = (role: UserRole, ch: number) => {
    const key = `${role}-${ch}`;
    if (questionsCache[key]) return questionsCache[key];
    const qs = getAllQuestionsForRole(role).filter(q => q.chapter === ch);
    setQuestionsCache(prev => ({ ...prev, [key]: qs }));
    return qs;
  };

  const currentQuestions = getQuestions(qRole, qChapter);
  const chTheme = CHAPTER_THEMES[qRole];
  const chapterNames = [chTheme.ch1, chTheme.ch2, chTheme.ch3];

  const handleToggleQuestion = (q: AcademyQuestion) => {
    const all = getAllQuestionsForRole(qRole);
    const updated = all.map(item => item.id === q.id ? { ...item, active: !item.active } : item);
    saveAllQuestionsForRole(qRole, updated);
    const key = `${qRole}-${qChapter}`;
    setQuestionsCache(prev => ({ ...prev, [key]: updated.filter(x => x.chapter === qChapter) }));
    toast.success(q.active ? 'Question désactivée' : 'Question activée');
  };

  const handleDeleteQuestion = (q: AcademyQuestion) => {
    const all = getAllQuestionsForRole(qRole);
    const updated = all.filter(item => item.id !== q.id);
    saveAllQuestionsForRole(qRole, updated);
    const key = `${qRole}-${qChapter}`;
    setQuestionsCache(prev => ({ ...prev, [key]: updated.filter(x => x.chapter === qChapter) }));
    toast.error('Question supprimée');
  };

  const openQEditor = (q?: AcademyQuestion) => {
    if (q) {
      setEditingQ(q);
      setQForm({ ...q });
    } else {
      setEditingQ(null);
      setQForm({
        id: `q-${Date.now()}`, role: qRole, chapter: qChapter, lesson: 1,
        question: '', correctIndex: 0, explanation: '', active: true,
        options: [
          { text: '', icon: 'CheckCircle' }, { text: '', icon: 'XCircle' },
          { text: '', icon: 'Minus' }, { text: '', icon: 'AlertCircle' },
        ],
      });
    }
    setShowQEditor(true);
  };

  const handleSaveQuestion = () => {
    if (!qForm.question || !qForm.options || qForm.options.some(o => !o.text)) {
      toast.error('Remplis tous les champs');
      return;
    }
    const all = getAllQuestionsForRole(qRole);
    let updated: AcademyQuestion[];
    if (editingQ) {
      updated = all.map(item => item.id === editingQ.id ? { ...item, ...qForm } as AcademyQuestion : item);
      toast.success('Question modifiée');
    } else {
      updated = [...all, qForm as AcademyQuestion];
      toast.success('Question ajoutée');
    }
    saveAllQuestionsForRole(qRole, updated);
    const key = `${qRole}-${qChapter}`;
    setQuestionsCache(prev => ({ ...prev, [key]: updated.filter(x => x.chapter === qChapter) }));
    setShowQEditor(false);
    if (boUser) addAuditLog({ action: editingQ ? 'MODIFICATION question Academy' : 'AJOUT question Academy', utilisateurBO: `${boUser.prenom} ${boUser.nom}`, roleBO: boUser.role, acteurImpacte: qForm.question || '', ancienneValeur: '—', nouvelleValeur: qRole, ip: '127.0.0.1', module: 'Academy' });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newModule: AcademyModule = {
      id: `m${Date.now()}`, ...form, statut: 'brouillon',
      nbInscrits: 0, tauxCompletion: 0, dateCreation: new Date().toISOString().split('T')[0],
    };
    setModules(prev => [newModule, ...prev]);
    if (boUser) addAuditLog({ action: 'CRÉATION module Academy', utilisateurBO: `${boUser.prenom} ${boUser.nom}`, roleBO: boUser.role, acteurImpacte: form.titre, ancienneValeur: '—', nouvelleValeur: 'brouillon', ip: '127.0.0.1', module: 'Academy' });
    toast.success(`Module "${form.titre}" créé en brouillon`);
    setShowCreate(false);
    setForm({ titre: '', description: '', type: 'video', niveau: 'debutant', profil: 'tous', duree: 10, points: 50, image: '' });
  };

  const handlePublier = (id: string) => {
    const mod = modules.find(m => m.id === id);
    setModules(prev => prev.map(m => m.id === id ? { ...m, statut: 'publie' } : m));
    if (boUser && mod) addAuditLog({ action: 'PUBLICATION module Academy', utilisateurBO: `${boUser.prenom} ${boUser.nom}`, roleBO: boUser.role, acteurImpacte: mod.titre, ancienneValeur: 'brouillon', nouvelleValeur: 'publie', ip: '127.0.0.1', module: 'Academy' });
    toast.success('Module publié dans Jùlaba Academy');
  };

  const handleArchiver = (id: string) => {
    const mod = modules.find(m => m.id === id);
    setModules(prev => prev.map(m => m.id === id ? { ...m, statut: 'archive' } : m));
    if (boUser && mod) addAuditLog({ action: 'ARCHIVAGE module Academy', utilisateurBO: `${boUser.prenom} ${boUser.nom}`, roleBO: boUser.role, acteurImpacte: mod.titre, ancienneValeur: 'publie', nouvelleValeur: 'archive', ip: '127.0.0.1', module: 'Academy' });
    toast.warning('Module archivé');
  };

  const handleSupprimer = (id: string) => {
    const mod = modules.find(m => m.id === id);
    setModules(prev => prev.filter(m => m.id !== id));
    if (boUser && mod) addAuditLog({ action: 'SUPPRESSION module Academy (soft)', utilisateurBO: `${boUser.prenom} ${boUser.nom}`, roleBO: boUser.role, acteurImpacte: mod.titre, ancienneValeur: mod.statut, nouvelleValeur: 'supprimé', ip: '127.0.0.1', module: 'Academy' });
    toast.error('Module supprimé définitivement');
  };

  const totalInscrits = useMemo(() => modules.reduce((acc, m) => acc + m.nbInscrits, 0), [modules]);
  const tauxMoyen = useMemo(() => {
    const total = modules.reduce((acc, m) => acc + m.tauxCompletion, 0);
    return total / modules.length || 0;
  }, [modules]);

  const filtered = useMemo(() => {
    return modules.filter(m => {
      if (filterStatut !== 'all' && m.statut !== filterStatut) return false;
      if (filterProfil !== 'all' && m.profil !== filterProfil) return false;
      return true;
    });
  }, [modules, filterStatut, filterProfil]);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Jùlaba Academy</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion des modules de micro-formation</p>
        </div>
        {canWrite && activeTab === 'modules' && (
          <motion.button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold shadow-lg"
            style={{ backgroundColor: BO_PRIMARY }}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouveau module</span>
          </motion.button>
        )}
        {canWrite && activeTab === 'questions' && (
          <motion.button onClick={() => openQEditor()}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold shadow-lg"
            style={{ backgroundColor: ROLE_COLORS[qRole] }}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouvelle question</span>
          </motion.button>
        )}
      </motion.div>

      {/* Onglets principaux */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-2xl w-fit">
        {([['modules', 'Modules', BookOpen], ['questions', 'Questions du Jeu', HelpCircle]] as const).map(([tab, label, Icon]) => (
          <motion.button key={tab} onClick={() => setActiveTab(tab as ActiveTab)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{
              backgroundColor: activeTab === tab ? 'white' : 'transparent',
              color: activeTab === tab ? BO_DARK : '#6B7280',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
            }}
            whileHover={activeTab !== tab ? { y: -1 } : {}} whileTap={{ scale: 0.97 }}>
            <Icon className="w-4 h-4" />
            {label}
          </motion.button>
        ))}
      </div>

      {/* ── TAB : MODULES ── */}
      {activeTab === 'modules' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Modules publiés', value: modules.filter(m => m.statut === 'publie').length, icon: BookOpen, color: BO_PRIMARY },
              { label: 'Apprenants total', value: totalInscrits.toLocaleString(), icon: Users, color: '#3B82F6' },
              { label: 'Taux moyen', value: `${tauxMoyen}%`, icon: TrendingUp, color: '#10B981' },
              { label: 'En brouillon', value: modules.filter(m => m.statut === 'brouillon').length, icon: Edit2, color: '#F59E0B' },
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
                  </div>
                  <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
                  <p className="text-xs font-semibold text-gray-500">{kpi.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex gap-2 flex-wrap">
              {['all', 'publie', 'brouillon', 'archive'].map(s => (
                <motion.button key={s} onClick={() => setFilterStatut(s)}
                  className="px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all"
                  style={{
                    backgroundColor: filterStatut === s ? BO_PRIMARY : 'white',
                    color: filterStatut === s ? 'white' : '#374151',
                    borderColor: filterStatut === s ? BO_PRIMARY : '#e5e7eb',
                  }}
                  whileHover={filterStatut !== s ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
                  {s === 'all' ? 'Tous' : STATUT_CONFIG[s as keyof typeof STATUT_CONFIG]?.label}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'marchand', 'producteur', 'cooperative', 'identificateur'].map(p => (
                <motion.button key={p} onClick={() => setFilterProfil(p)}
                  className="px-3 py-2 rounded-2xl text-xs font-bold border-2 transition-all"
                  style={{
                    backgroundColor: filterProfil === p ? BO_DARK : 'white',
                    color: filterProfil === p ? 'white' : '#374151',
                    borderColor: filterProfil === p ? BO_DARK : '#e5e7eb',
                  }}
                  whileHover={filterProfil !== p ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
                  {p === 'all' ? 'Tous profils' : p.charAt(0).toUpperCase() + p.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Liste modules */}
          <div className="space-y-3">
            {filtered.map((module, index) => {
              const typeConf = TYPE_CONFIG[module.type];
              const TypeIcon = typeConf.icon;
              const niveauConf = NIVEAU_CONFIG[module.niveau];
              const statutConf = STATUT_CONFIG[module.statut];
              const isExpanded = expanded === module.id;

              return (
                <motion.div key={module.id} className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden"
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
                  layout>
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icône type */}
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${typeConf.color}20` }}>
                        <TypeIcon className="w-6 h-6" style={{ color: typeConf.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-bold text-gray-900">{module.titre}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{module.description}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statutConf.bg} ${statutConf.text}`}>{statutConf.label}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold" style={{ backgroundColor: `${niveauConf.color}20`, color: niveauConf.color }}>{niveauConf.label}</span>
                          <span className="text-xs text-gray-500">{module.profil === 'tous' ? 'Tous profils' : module.profil.charAt(0).toUpperCase() + module.profil.slice(1)}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />{module.duree} min
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold" style={{ color: BO_PRIMARY }}>
                            <Star className="w-3 h-3" />{module.points} pts
                          </span>
                          {module.statut === 'publie' && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Users className="w-3 h-3" />{module.nbInscrits.toLocaleString()} inscrits
                            </span>
                          )}
                        </div>

                        {/* Taux de complétion */}
                        {module.statut === 'publie' && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full" style={{ backgroundColor: module.tauxCompletion >= 75 ? '#10B981' : BO_PRIMARY }}
                                initial={{ width: 0 }} animate={{ width: `${module.tauxCompletion}%` }}
                                transition={{ duration: 1, ease: 'easeOut', delay: index * 0.05 }} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 flex-shrink-0">{module.tauxCompletion}%</span>
                          </div>
                        )}
                      </div>

                      <motion.button onClick={() => setExpanded(isExpanded ? null : module.id)}
                        className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"
                        whileTap={{ scale: 0.9 }}>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                      </motion.button>
                    </div>
                  </div>

                  {/* Actions expandable */}
                  <AnimatePresence>
                    {isExpanded && canWrite && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="px-4 pb-4 border-t-2 border-gray-100 pt-4 flex flex-wrap gap-2">
                          <motion.button onClick={() => toast.info('Éditeur module')}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2 border-gray-200 text-gray-700"
                            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                            <Edit2 className="w-4 h-4" />Modifier
                          </motion.button>
                          {module.statut === 'brouillon' && (
                            <motion.button onClick={() => handlePublier(module.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm text-white"
                              style={{ backgroundColor: '#10B981' }}
                              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                              <Play className="w-4 h-4" />Publier
                            </motion.button>
                          )}
                          {module.statut === 'publie' && (
                            <motion.button onClick={() => handleArchiver(module.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm text-white bg-orange-500"
                              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                              <Archive className="w-4 h-4" />Archiver
                            </motion.button>
                          )}
                          {module.statut === 'archive' && (
                            <motion.button onClick={() => handleSupprimer(module.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm text-white bg-red-500"
                              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                              <Trash2 className="w-4 h-4" />Supprimer
                            </motion.button>
                          )}
                          <motion.button onClick={() => toast.info('Statistiques détaillées module')}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2"
                            style={{ borderColor: BO_PRIMARY, color: BO_PRIMARY }}
                            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                            <BarChart3 className="w-4 h-4" />Stats
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* ── TAB : QUESTIONS DU JEU ── */}
      {activeTab === 'questions' && (
        <div>
          {/* KPIs questions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {ROLES.map((r, i) => {
              const count = getAllQuestionsForRole(r).filter(q => q.active).length;
              return (
                <motion.div key={r} className="bg-white rounded-2xl p-4 shadow-sm border-2 cursor-pointer transition-all"
                  style={{ borderColor: qRole === r ? ROLE_COLORS[r] : '#F3F4F6' }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  onClick={() => setQRole(r)} whileHover={{ y: -3 }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: `${ROLE_COLORS[r]}20` }}>
                    <HelpCircle className="w-4 h-4" style={{ color: ROLE_COLORS[r] }} />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{count}</p>
                  <p className="text-xs font-semibold text-gray-500">{ROLE_LABELS[r]}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Sélecteur Rôle */}
          <div className="flex gap-2 flex-wrap mb-4">
            {ROLES.map(r => (
              <motion.button key={r} onClick={() => setQRole(r)}
                className="px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all"
                style={{
                  backgroundColor: qRole === r ? ROLE_COLORS[r] : 'white',
                  color: qRole === r ? 'white' : '#374151',
                  borderColor: qRole === r ? ROLE_COLORS[r] : '#E5E7EB',
                }}
                whileHover={qRole !== r ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
                {ROLE_LABELS[r]}
              </motion.button>
            ))}
          </div>

          {/* Sélecteur Chapitre */}
          <div className="flex gap-2 mb-5">
            {[1, 2, 3].map(ch => (
              <motion.button key={ch} onClick={() => setQChapter(ch)}
                className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition-all"
                style={{
                  backgroundColor: qChapter === ch ? ROLE_COLORS[qRole] : 'white',
                  color: qChapter === ch ? 'white' : '#374151',
                  borderColor: qChapter === ch ? ROLE_COLORS[qRole] : '#E5E7EB',
                }}
                whileHover={qChapter !== ch ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
                <span className="block text-xs opacity-70">Chapitre {ch}</span>
                <span>{chapterNames[ch - 1]}</span>
              </motion.button>
            ))}
          </div>

          {/* Liste questions */}
          <div className="space-y-3">
            {currentQuestions.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border-2 border-gray-100">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-bold text-gray-500">Aucune question pour ce chapitre</p>
                <p className="text-sm text-gray-400 mt-1">Clique sur "Nouvelle question" pour en ajouter</p>
              </div>
            )}
            {currentQuestions.map((q, idx) => (
              <motion.div key={q.id}
                className="bg-white rounded-2xl shadow-sm border-2 p-4 overflow-hidden"
                style={{ borderColor: q.active ? `${ROLE_COLORS[qRole]}30` : '#F3F4F6', opacity: q.active ? 1 : 0.6 }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: q.active ? 1 : 0.6, y: 0 }}
                transition={{ delay: idx * 0.04 }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white text-sm"
                    style={{ backgroundColor: ROLE_COLORS[qRole] }}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 mb-2">{q.question}</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 overflow-hidden ${oi === q.correctIndex ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                          {oi === q.correctIndex && <CheckCircle className="w-3 h-3 inline mr-1 text-green-500" />}
                          <span className="truncate">{opt.text}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 italic">{q.explanation}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {canWrite && (
                      <>
                        <motion.button onClick={() => openQEditor(q)}
                          className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </motion.button>
                        <motion.button onClick={() => handleToggleQuestion(q)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: q.active ? '#D1FAE5' : '#FEE2E2' }}
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          {q.active
                            ? <ToggleRight className="w-4 h-4 text-green-600" />
                            : <ToggleLeft className="w-4 h-4 text-red-500" />}
                        </motion.button>
                        <motion.button onClick={() => handleDeleteQuestion(q)}
                          className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center"
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Modal création module */}
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
                <h2 className="font-black text-gray-900 text-xl">Nouveau module Academy</h2>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                {/* Miniature du module */}
                <ImagePickerField
                  label="Miniature du module"
                  value={(form as any).image || ''}
                  onChange={(url) => setForm(p => ({ ...p, image: url }))}
                  primaryColor={BO_PRIMARY}
                  shape="rect"
                  size={90}
                />

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Titre du module *</label>
                  <input value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} required
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm"
                    placeholder="Ex : Gestion des stocks quotidienne" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm resize-none"
                    placeholder="Décrivez l'objectif de ce module..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as ModuleType }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm">
                      {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Niveau</label>
                    <select value={form.niveau} onChange={e => setForm(p => ({ ...p, niveau: e.target.value as NiveauType }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm">
                      {Object.entries(NIVEAU_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Profil cible</label>
                    <select value={form.profil} onChange={e => setForm(p => ({ ...p, profil: e.target.value as ProfilType }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm">
                      {['tous', 'marchand', 'producteur', 'cooperative', 'identificateur'].map(p => (
                        <option key={p} value={p}>{p === 'tous' ? 'Tous profils' : p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Durée (min)</label>
                    <input type="number" value={form.duree} onChange={e => setForm(p => ({ ...p, duree: +e.target.value }))} min={1}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Points de gamification</label>
                  <input type="number" value={form.points} onChange={e => setForm(p => ({ ...p, points: +e.target.value }))} min={0} step={10}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
                  <motion.button type="submit" className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                    style={{ backgroundColor: BO_PRIMARY }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Save className="w-4 h-4" />Créer en brouillon
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal éditeur question */}
      <AnimatePresence>
        {showQEditor && (
          <motion.div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowQEditor(false)}>
            <motion.div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border-2 max-h-[90vh] overflow-y-auto"
              style={{ borderColor: ROLE_COLORS[qRole] }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-900 text-xl">{editingQ ? 'Modifier la question' : 'Nouvelle question'}</h2>
                <button onClick={() => setShowQEditor(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Question */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Question *</label>
                  <textarea value={qForm.question || ''} onChange={e => setQForm(p => ({ ...p, question: e.target.value }))} rows={2}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm resize-none"
                    style={{ borderColor: ROLE_COLORS[qRole] + '60' }}
                    placeholder="Max 10 mots, simple et clair" />
                </div>

                {/* 4 options */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">4 Réponses *</label>
                  <div className="space-y-2">
                    {(qForm.options || []).map((opt, oi) => (
                      <div key={oi} className={`flex items-center gap-2 p-3 rounded-2xl border-2 ${oi === qForm.correctIndex ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                        <motion.button
                          onClick={() => setQForm(p => ({ ...p, correctIndex: oi }))}
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${oi === qForm.correctIndex ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}
                          whileTap={{ scale: 0.9 }}>
                          {oi === qForm.correctIndex && <CheckCircle className="w-5 h-5 text-white" />}
                        </motion.button>
                        <input value={opt.text} onChange={e => {
                          const newOpts = [...(qForm.options || [])];
                          newOpts[oi] = { ...newOpts[oi], text: e.target.value };
                          setQForm(p => ({ ...p, options: newOpts }));
                        }}
                          className="flex-1 bg-transparent text-sm font-semibold focus:outline-none"
                          placeholder={`Réponse ${oi + 1}${oi === qForm.correctIndex ? ' (correcte)' : ''}`} />
                        <select value={opt.icon} onChange={e => {
                          const newOpts = [...(qForm.options || [])];
                          newOpts[oi] = { ...newOpts[oi], icon: e.target.value };
                          setQForm(p => ({ ...p, options: newOpts }));
                        }} className="text-xs bg-transparent text-gray-500 focus:outline-none">
                          {['CheckCircle', 'XCircle', 'Minus', 'AlertCircle', 'Star', 'Award', 'Wallet', 'Package', 'Users', 'TrendingUp', 'Target', 'Leaf', 'ShoppingBag', 'BookOpen', 'Globe', 'Heart'].map(ic => (
                            <option key={ic} value={ic}>{ic}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Clique le cercle pour marquer la bonne réponse</p>
                </div>

                {/* Explication */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Explication (montrée après réponse)</label>
                  <textarea value={qForm.explanation || ''} onChange={e => setQForm(p => ({ ...p, explanation: e.target.value }))} rows={2}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm resize-none"
                    placeholder="Explication courte et simple..." />
                </div>

                {/* Boutons */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowQEditor(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
                  <motion.button onClick={handleSaveQuestion}
                    className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                    style={{ backgroundColor: ROLE_COLORS[qRole] }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Save className="w-4 h-4" />{editingQ ? 'Modifier' : 'Ajouter'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}