import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  User,
  MapPin,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Activity,
  Mic,
  MicOff,
  Users,
  Filter,
  ChevronDown,
  AlertTriangle,
  FileText,
  History,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Navigation } from '../layout/Navigation';
import { useApp } from '../../contexts/AppContext';
import { NotificationButton } from '../marchand/NotificationButton';
import { toast } from 'sonner';

const PRIMARY_COLOR = '#712864';

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_ACTEURS = [
  { id: 'A001', nom: 'Kouassi', prenoms: 'Aminata', type: 'marchand', region: 'Abidjan', commune: 'Yopougon', telephone: '+225 07 01 02 03 04', statut: 'actif', dateCreation: '2025-08-15', activiteRecente: '2026-03-02', activite: 'Vente de riz' },
  { id: 'A002', nom: 'Yao', prenoms: 'Kouadio', type: 'producteur', region: 'Gbêkê', commune: 'Bouaké', telephone: '+225 05 12 34 56 78', statut: 'actif', dateCreation: '2025-09-01', activiteRecente: '2026-03-01', activite: 'Production de cacao' },
  { id: 'A003', nom: 'Traoré', prenoms: 'Fatou', type: 'marchand', region: 'Abidjan', commune: 'Cocody', telephone: '+225 07 23 45 67 89', statut: 'suspendu', dateCreation: '2025-06-20', activiteRecente: '2026-01-15', activite: 'Vente d\'oignons' },
  { id: 'A004', nom: 'Touré', prenoms: 'Ibrahim', type: 'marchand', region: 'Abidjan', commune: 'Abobo', telephone: '+225 01 45 67 89 12', statut: 'actif', dateCreation: '2025-10-10', activiteRecente: '2026-03-03', activite: 'Vente de tomates' },
  { id: 'A005', nom: 'Diabaté', prenoms: 'Marie', type: 'producteur', region: 'Hambol', commune: 'Korhogo', telephone: '+225 05 98 76 54 32', statut: 'actif', dateCreation: '2025-07-05', activiteRecente: '2026-02-28', activite: 'Production de mangues' },
  { id: 'A006', nom: 'Koffi', prenoms: 'Adjoua', type: 'cooperative', region: 'Abidjan', commune: 'Treichville', telephone: '+225 07 34 56 78 90', statut: 'actif', dateCreation: '2025-05-12', activiteRecente: '2026-03-02', activite: 'Coopérative maraîchère (32 membres)' },
  { id: 'A007', nom: 'Bamba', prenoms: 'Awa', type: 'producteur', region: 'Haut-Sassandra', commune: 'Daloa', telephone: '+225 05 67 89 12 34', statut: 'suspendu', dateCreation: '2025-11-01', activiteRecente: '2026-01-20', activite: 'Production de café' },
  { id: 'A008', nom: 'Coulibaly', prenoms: 'Seydou', type: 'identificateur', region: 'Abidjan', commune: 'Plateau', telephone: '+225 07 88 99 00 11', statut: 'actif', dateCreation: '2025-04-18', activiteRecente: '2026-03-03', activite: 'Identification d\'acteurs' },
  { id: 'A009', nom: 'Ouattara', prenoms: 'Mariam', type: 'marchand', region: 'Woroba', commune: 'Séguéla', telephone: '+225 01 22 33 44 55', statut: 'actif', dateCreation: '2025-12-08', activiteRecente: '2026-03-01', activite: 'Vente de maïs' },
  { id: 'A010', nom: 'Soro', prenoms: 'Gaoussou', type: 'cooperative', region: 'Poro', commune: 'Korhogo', telephone: '+225 05 33 44 55 66', statut: 'actif', dateCreation: '2026-01-15', activiteRecente: '2026-03-02', activite: 'Coop. cacao/café (124 membres)' },
];

const REGIONS = ['Toutes', 'Abidjan', 'Gbêkê', 'Hambol', 'Haut-Sassandra', 'Poro', 'Woroba'];
const TYPES = ['Tous', 'marchand', 'producteur', 'cooperative', 'identificateur'];
const STATUTS = ['Tous', 'actif', 'suspendu'];

function getTypeColor(type: string) {
  if (type === 'marchand') return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
  if (type === 'producteur') return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
  if (type === 'cooperative') return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
  return { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' };
}

function getTypeLabel(type: string) {
  if (type === 'marchand') return 'Marchand';
  if (type === 'producteur') return 'Producteur';
  if (type === 'cooperative') return 'Coopérative';
  if (type === 'identificateur') return 'Identificateur';
  return type;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function InstitutionActeurs() {
  const navigate = useNavigate();
  const { speak } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'actif' | 'suspendu'>('all');
  const [selectedType, setSelectedType] = useState('Tous');
  const [selectedRegion, setSelectedRegion] = useState('Toutes');
  const [selectedActeur, setSelectedActeur] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<'liste' | 'detail'>('liste');
  const [detailActeur, setDetailActeur] = useState<any>(null);

  // Stats
  const stats = useMemo(() => ({
    total: MOCK_ACTEURS.length,
    actifs: MOCK_ACTEURS.filter(a => a.statut === 'actif').length,
    suspendus: MOCK_ACTEURS.filter(a => a.statut === 'suspendu').length,
  }), []);

  // Filtrage
  const filtered = useMemo(() => {
    return MOCK_ACTEURS.filter(a => {
      const matchSearch = searchQuery === '' ||
        a.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.prenoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.telephone.includes(searchQuery) ||
        a.commune.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatut = activeFilter === 'all' || a.statut === activeFilter;
      const matchType = selectedType === 'Tous' || a.type === selectedType;
      const matchRegion = selectedRegion === 'Toutes' || a.region === selectedRegion;
      return matchSearch && matchStatut && matchType && matchRegion;
    });
  }, [searchQuery, activeFilter, selectedType, selectedRegion]);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speak('La recherche vocale n\'est pas supportée');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      setSearchQuery(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSuspendre = (acteur: any) => {
    toast.error(`Acteur suspendu : ${acteur.prenoms} ${acteur.nom}`, {
      description: 'Action enregistrée dans l\'audit log',
    });
  };

  const handleReactiver = (acteur: any) => {
    toast.success(`Acteur réactivé : ${acteur.prenoms} ${acteur.nom}`, {
      description: 'Action enregistrée dans l\'audit log',
    });
  };

  const handleVoirDossier = (acteur: any) => {
    setDetailActeur(acteur);
    setActiveView('detail');
    speak(`Dossier de ${acteur.prenoms} ${acteur.nom}`);
  };

  if (activeView === 'detail' && detailActeur) {
    return <ActeurDetail acteur={detailActeur} onBack={() => setActiveView('liste')} />;
  }

  return (
    <>
      {/* Header fixe */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: '#F9F5F8' }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-bold text-gray-900 text-2xl">Acteurs</h1>
            <NotificationButton />
            <motion.button
              onClick={() => setShowFilters(v => !v)}
              className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center border-2"
              style={{ borderColor: showFilters ? PRIMARY_COLOR : '#e5e7eb' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Filter className="w-5 h-5" style={{ color: showFilters ? PRIMARY_COLOR : '#6b7280' }} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-purple-50 to-white">

        {/* Stats KPI */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total', value: stats.total, color: 'blue', filter: 'all' as const },
            { label: 'Actifs', value: stats.actifs, color: 'green', filter: 'actif' as const },
            { label: 'Suspendus', value: stats.suspendus, color: 'red', filter: 'suspendu' as const },
          ].map((s, i) => (
            <motion.button
              key={s.label}
              onClick={() => setActiveFilter(s.filter)}
              className={`relative rounded-3xl p-3 border-2 shadow-md text-left ${
                s.color === 'blue' ? `bg-gradient-to-br from-blue-50 to-white ${activeFilter === s.filter ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-200'}` :
                s.color === 'green' ? `bg-gradient-to-br from-green-50 to-white ${activeFilter === s.filter ? 'border-green-500 ring-2 ring-green-200' : 'border-green-200'}` :
                `bg-gradient-to-br from-red-50 to-white ${activeFilter === s.filter ? 'border-red-500 ring-2 ring-red-200' : 'border-red-200'}`
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <p className={`text-xs font-semibold mb-1 ${s.color === 'blue' ? 'text-blue-600' : s.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>{s.label}</p>
              <motion.p className={`text-3xl font-bold ${s.color === 'blue' ? 'text-blue-700' : s.color === 'green' ? 'text-green-700' : 'text-red-700'}`}
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
                {s.value}
              </motion.p>
              {activeFilter === s.filter && <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${s.color === 'blue' ? 'bg-blue-500' : s.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`} />}
            </motion.button>
          ))}
        </div>

        {/* Barre de recherche */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4 relative">
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}20, ${PRIMARY_COLOR}40)` }}>
              <Search className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, téléphone, commune..."
              className="w-full pl-20 pr-16 py-5 rounded-3xl border-2 focus:outline-none text-base bg-white shadow-md"
              style={{ borderColor: searchQuery ? PRIMARY_COLOR : '#e5e7eb' }}
            />
            <motion.button
              onClick={startVoiceSearch}
              className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isListening ? PRIMARY_COLOR : '#f3f4f6' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={isListening ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.8, repeat: isListening ? Infinity : 0 }}
            >
              {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-gray-600" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Filtres avancés */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 bg-white rounded-3xl p-5 border-2 shadow-md"
              style={{ borderColor: `${PRIMARY_COLOR}30` }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2">Type d'acteur</p>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map(t => (
                      <motion.button
                        key={t}
                        onClick={() => setSelectedType(t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${selectedType === t ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
                        style={selectedType === t ? { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR } : {}}
                        whileTap={{ scale: 0.95 }}
                      >
                        {t === 'Tous' ? 'Tous' : getTypeLabel(t)}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2">Région</p>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map(r => (
                      <motion.button
                        key={r}
                        onClick={() => setSelectedRegion(r)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${selectedRegion === r ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
                        style={selectedRegion === r ? { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR } : {}}
                        whileTap={{ scale: 0.95 }}
                      >
                        {r}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Résultats */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-500 font-semibold mb-3">
          {filtered.length} acteur{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
        </motion.p>

        {/* Liste */}
        <div className="space-y-3">
          {filtered.map((acteur, idx) => {
            const typeStyle = getTypeColor(acteur.type);
            const isSelected = selectedActeur === acteur.id;
            return (
              <motion.div
                key={acteur.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white rounded-3xl border-2 shadow-md overflow-hidden"
                style={{ borderColor: isSelected ? PRIMARY_COLOR : '#f3f4f6' }}
              >
                {/* Ligne principale */}
                <motion.button
                  className="w-full px-5 py-4 flex items-center gap-3 text-left"
                  onClick={() => setSelectedActeur(isSelected ? null : acteur.id)}
                  whileHover={{ backgroundColor: '#faf5fb' }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #9B3D8A)` }}>
                    {acteur.prenoms.charAt(0)}{acteur.nom.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{acteur.prenoms} {acteur.nom}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border-2 ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                        {getTypeLabel(acteur.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{acteur.commune}, {acteur.region}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                      acteur.statut === 'actif' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {acteur.statut === 'actif' ? 'Actif' : 'Suspendu'}
                    </span>
                    <motion.div animate={isSelected ? { rotate: 180 } : { rotate: 0 }}>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </div>
                </motion.button>

                {/* Détails expandés */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 border-t-2 border-gray-100">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-50 rounded-2xl p-3">
                            <p className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Téléphone</p>
                            <p className="text-sm font-bold text-gray-900">{acteur.telephone}</p>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-3">
                            <p className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Créé le</p>
                            <p className="text-sm font-bold text-gray-900">{new Date(acteur.dateCreation).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-3">
                            <p className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Dernière activité</p>
                            <p className="text-sm font-bold text-gray-900">{new Date(acteur.activiteRecente).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-3">
                            <p className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Activité</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{acteur.activite}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                          <motion.button
                            onClick={() => handleVoirDossier(acteur)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Eye className="w-4 h-4" />
                            Voir dossier
                          </motion.button>
                          <motion.button
                            onClick={() => toast('Historique activité', { description: `Chargement pour ${acteur.prenoms}...` })}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-50 text-blue-700 font-semibold text-sm border-2 border-blue-200"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <History className="w-4 h-4" />
                            Historique
                          </motion.button>
                          {acteur.statut === 'actif' ? (
                            <motion.button
                              onClick={() => handleSuspendre(acteur)}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 text-red-700 font-semibold text-sm border-2 border-red-200"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <XCircle className="w-4 h-4" />
                              Suspendre
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={() => handleReactiver(acteur)}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-50 text-green-700 font-semibold text-sm border-2 border-green-200"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Réactiver
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white rounded-3xl border-2 border-gray-100">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">Aucun acteur trouvé</p>
            </motion.div>
          )}
        </div>
      </div>

      <Navigation role="institution" />
    </>
  );
}

// ── Vue Détail Acteur ─────────────────────────────────────────────────────────
function ActeurDetail({ acteur, onBack }: { acteur: any; onBack: () => void }) {
  const { speak } = useApp();
  const [activeTab, setActiveTab] = useState<'infos' | 'transactions' | 'historique' | 'stats'>('infos');
  const typeStyle = getTypeColor(acteur.type);

  const MOCK_TRANSACTIONS = [
    { id: 'TX001', date: '2026-03-02', montant: 45_000, type: 'vente', statut: 'validé' },
    { id: 'TX002', date: '2026-03-01', montant: 18_500, type: 'achat', statut: 'validé' },
    { id: 'TX003', date: '2026-02-28', montant: 62_000, type: 'vente', statut: 'validé' },
  ];

  const MOCK_HISTORIQUE = [
    { action: 'Connexion plateforme', date: '2026-03-03 08:12', ip: '196.168.1.45' },
    { action: 'Transaction enregistrée', date: '2026-03-02 14:30', ip: '196.168.1.45' },
    { action: 'Profil mis à jour', date: '2026-02-28 11:05', ip: '196.168.1.22' },
  ];

  return (
    <>
      <motion.div className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-gray-100" initial={{ y: -80 }} animate={{ y: 0 }}>
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto flex items-center gap-3">
          <motion.button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </motion.button>
          <h1 className="font-bold text-gray-900 text-xl">{acteur.prenoms} {acteur.nom}</h1>
        </div>
      </motion.div>

      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gray-50">
        {/* Header acteur */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 border-2 shadow-md mb-4" style={{ borderColor: `${PRIMARY_COLOR}30` }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md"
              style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #9B3D8A)` }}>
              {acteur.prenoms.charAt(0)}{acteur.nom.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-xl">{acteur.prenoms} {acteur.nom}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>{getTypeLabel(acteur.type)}</span>
            </div>
            <span className={`ml-auto px-3 py-1.5 rounded-full text-xs font-bold border-2 ${acteur.statut === 'actif' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {acteur.statut === 'actif' ? 'Actif' : 'Suspendu'}
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(['infos', 'transactions', 'historique', 'stats'] as const).map(tab => (
            <motion.button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap border-2 transition-all ${activeTab === tab ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
              style={activeTab === tab ? { backgroundColor: PRIMARY_COLOR } : {}}
              whileTap={{ scale: 0.95 }}>
              {tab === 'infos' ? 'Informations' : tab === 'transactions' ? 'Transactions' : tab === 'historique' ? 'Historique' : 'Statistiques'}
            </motion.button>
          ))}
        </div>

        {/* Contenu onglets */}
        <AnimatePresence mode="wait">
          {activeTab === 'infos' && (
            <motion.div key="infos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              {[
                { label: 'Téléphone', value: acteur.telephone, icon: <Phone className="w-4 h-4" /> },
                { label: 'Région', value: acteur.region, icon: <MapPin className="w-4 h-4" /> },
                { label: 'Commune', value: acteur.commune, icon: <MapPin className="w-4 h-4" /> },
                { label: 'Activité', value: acteur.activite, icon: <Activity className="w-4 h-4" /> },
                { label: 'Date création', value: new Date(acteur.dateCreation).toLocaleDateString('fr-FR'), icon: <Calendar className="w-4 h-4" /> },
                { label: 'Dernière activité', value: new Date(acteur.activiteRecente).toLocaleDateString('fr-FR'), icon: <Clock className="w-4 h-4" /> },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-3xl p-4 border-2 border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${PRIMARY_COLOR}15`, color: PRIMARY_COLOR }}>{item.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">{item.label}</p>
                    <p className="font-bold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div key="tx" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              {MOCK_TRANSACTIONS.map(tx => (
                <div key={tx.id} className="bg-white rounded-3xl p-4 border-2 border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{tx.id}</p>
                      <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString('fr-FR')} — {tx.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{tx.montant.toLocaleString()} FCFA</p>
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">{tx.statut}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'historique' && (
            <motion.div key="hist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              {MOCK_HISTORIQUE.map((h, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 border-2 border-gray-100">
                  <p className="font-bold text-gray-900 mb-1">{h.action}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{h.date}</span>
                    <span>IP : {h.ip}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 gap-3">
              {[
                { label: 'Transactions totales', value: '48', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
                { label: 'Valeur totale', value: '2.4M FCFA', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
                { label: 'Taux activité', value: '87%', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
                { label: 'Score fiabilité', value: '94/100', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
              ].map(s => (
                <div key={s.label} className={`rounded-3xl p-4 border-2 ${s.bg} ${s.border} text-center`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-600 font-semibold mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Navigation role="institution" />
    </>
  );
}

function Phone({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.43a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.09 6.09l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>;
}
function Clock({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}