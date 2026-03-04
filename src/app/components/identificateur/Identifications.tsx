import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCheck,
  Search,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Edit3,
  CheckCircle,
  Clock,
  Activity,
  Mic,
  MicOff,
  FileText,
  FolderOpen,
  History,
  Plus,
  Send,
  Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Navigation } from '../layout/Navigation';
import { useApp } from '../../contexts/AppContext';
import { NotificationButton } from '../marchand/NotificationButton';
import { toast } from 'sonner';

const PRIMARY_COLOR = '#9F8170';

// Couleur par rôle
function getRoleColor(role: string) {
  if (role === 'marchand') return '#C66A2C';
  if (role === 'producteur') return '#2E8B57';
  if (role === 'cooperative') return '#2072AF';
  return '#9F8170';
}

// Données mockées
const mockIdentifications = [
  {
    id: '1',
    telephone: '+225 07 01 02 03 04',
    prenoms: 'Aminata',
    nom: 'Kouassi',
    role: 'marchand',
    marche: 'Marché de Yopougon',
    commune: 'Yopougon',
    activite: 'Vente de riz',
    dateIdentification: '2026-02-27T10:30:00',
    type: 'nouveau',
    statut: 'soumis',
    dateModification: '2026-02-28T10:30:00',
  },
  {
    id: '2',
    telephone: '+225 05 12 34 56 78',
    prenoms: 'Kouadio',
    nom: 'Yao',
    role: 'producteur',
    marche: 'Plantation Bouaké',
    commune: 'Bouaké',
    activite: 'Production de cacao',
    dateIdentification: '2026-02-26T14:20:00',
    type: 'nouveau',
    statut: 'soumis',
    dateModification: '2026-02-27T14:20:00',
  },
  {
    id: '3',
    telephone: '+225 07 23 45 67 89',
    prenoms: 'Fatou',
    nom: 'Traoré',
    role: 'marchand',
    marche: 'Marché de Cocody',
    commune: 'Cocody',
    activite: 'Vente d\'oignons',
    dateIdentification: '2026-02-26T09:15:00',
    type: 'modifie',
    statut: 'draft',
    dateModification: '2026-03-01T16:20:00',
  },
  {
    id: '4',
    telephone: '+225 01 45 67 89 12',
    prenoms: 'Ibrahim',
    nom: 'Touré',
    role: 'marchand',
    marche: 'Marché d\'Abobo',
    commune: 'Abobo',
    activite: 'Vente de tomates',
    dateIdentification: '2026-02-25T16:45:00',
    type: 'nouveau',
    statut: 'draft',
    dateModification: '2026-03-01T10:15:00',
  },
  {
    id: '5',
    telephone: '+225 05 98 76 54 32',
    prenoms: 'Marie',
    nom: 'Diabaté',
    role: 'producteur',
    marche: 'Plantation Korhogo',
    commune: 'Korhogo',
    activite: 'Production de mangues',
    dateIdentification: '2026-02-25T11:30:00',
    type: 'renouvellement',
    statut: 'soumis',
    dateModification: '2026-02-26T11:30:00',
  },
  {
    id: '6',
    telephone: '+225 07 34 56 78 90',
    prenoms: 'Adjoua',
    nom: 'Koffi',
    role: 'marchand',
    marche: 'Marché de Treichville',
    commune: 'Treichville',
    activite: 'Vente de plantain',
    dateIdentification: '2026-02-24T13:20:00',
    type: 'nouveau',
    statut: 'soumis',
    dateModification: '2026-02-25T13:20:00',
  },
  {
    id: '8',
    telephone: '+225 05 67 89 12 34',
    prenoms: 'Awa',
    nom: 'Bamba',
    role: 'producteur',
    marche: 'Plantation Daloa',
    commune: 'Daloa',
    activite: 'Production de café',
    dateIdentification: '2026-02-23T15:40:00',
    type: 'nouveau',
    statut: 'draft',
    dateModification: '2026-03-02T09:10:00',
  },
  // ── Coopératives identifiées par l'identificateur ────────────────────────
  {
    id: 'coop-1',
    telephone: '+225 07 11 22 33 44',
    prenoms: 'Coop. Agro-Femmes',
    nom: 'de Bouaké',
    role: 'cooperative',
    marche: 'Siège : Bouaké, Gbêkê',
    commune: 'Bouaké',
    activite: 'Agricole — Riz, Maïs, Igname (48 membres)',
    dateIdentification: '2026-02-20T09:00:00',
    type: 'nouveau',
    statut: 'soumis',
    dateModification: '2026-03-01T11:30:00',
  },
  {
    id: 'coop-2',
    telephone: '+225 05 44 55 66 77',
    prenoms: 'Union des Producteurs',
    nom: 'de Cacao de Soubré',
    role: 'cooperative',
    marche: 'Siège : Soubré, Nawa',
    commune: 'Soubré',
    activite: 'Agricole — Cacao, Café, Hévéa (124 membres)',
    dateIdentification: '2026-02-22T14:00:00',
    type: 'nouveau',
    statut: 'draft',
    dateModification: '2026-02-28T16:45:00',
  },
  {
    id: 'coop-3',
    telephone: '+225 01 77 88 99 00',
    prenoms: 'Coop. Maraîchère',
    nom: 'de Korhogo',
    role: 'cooperative',
    marche: 'Siège : Korhogo, Poro',
    commune: 'Korhogo',
    activite: 'Maraîchère — Tomate, Oignon, Gombo (32 membres)',
    dateIdentification: '2026-02-25T08:30:00',
    type: 'nouveau',
    statut: 'soumis',
    dateModification: '2026-03-02T09:15:00',
  },
];

export function Identifications() {
  const navigate = useNavigate();
  const { speak, isOnline } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'submitted'>('all');
  const [selectedIdentification, setSelectedIdentification] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'all' | 'marchand' | 'producteur' | 'cooperative'>('all');

  // Stats calculées
  const stats = useMemo(() => {
    const total = mockIdentifications.length;
    const brouillons = mockIdentifications.filter((i) => i.statut === 'draft').length;
    const soumis = mockIdentifications.filter((i) => i.statut === 'soumis').length;

    return { total, brouillons, soumis };
  }, []);

  // Filtrer les identifications
  const filteredIdentifications = useMemo(() => {
    return mockIdentifications.filter((identification) => {
      // Filtre recherche
      const matchSearch =
        searchQuery === '' ||
        identification.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        identification.prenoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
        identification.telephone.includes(searchQuery);

      // Filtre statut actif - Convertir 'submitted' en 'soumis'
      let statutToMatch = activeFilter;
      if (activeFilter === 'submitted') {
        statutToMatch = 'soumis';
      }
      const matchStatut = activeFilter === 'all' || identification.statut === statutToMatch;

      // Filtre rôle
      const matchRole = selectedRole === 'all' || identification.role === selectedRole;

      return matchSearch && matchStatut && matchRole;
    });
  }, [searchQuery, activeFilter, selectedRole]);

  // Séparer en brouillons et soumissions
  const brouillons = filteredIdentifications.filter(i => i.statut === 'draft');
  const soumissions = filteredIdentifications.filter(i => i.statut === 'soumis');

  const handleIdentificationClick = (identificationId: string) => {
    setSelectedIdentification(selectedIdentification === identificationId ? null : identificationId);
    speak('Détails de l\'identification');
  };

  // Fonction de recherche vocale
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speak('La recherche vocale n\'est pas supportée par votre navigateur');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      speak(`Recherche pour ${transcript}`);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      {/* Header fixe - Style GestionStock */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-[#F5F0ED]"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            {/* Titre - Plus grand sans bouton retour */}
            <h1 className="flex-1 font-bold text-gray-900 text-xl sm:text-2xl md:text-3xl">
              Acteurs
            </h1>

            {/* Boutons actions */}
            <NotificationButton />
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-[#F5F0ED] to-white">
        
        {/* Stats Cards - HARMONISÉES avec SuiviIdentifications */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* KPI 1: Total dossiers */}
          <motion.button
            onClick={() => {
              setActiveFilter('all');
              toast('Affichage de tous les dossiers');
            }}
            className={`relative bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 ${
              activeFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-blue-200'
            } text-left cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Total</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FileText className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-blue-600"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {stats.total}
            </motion.p>
            {activeFilter === 'all' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full" />
            )}
          </motion.button>

          {/* KPI 2: Brouillons */}
          <motion.button
            onClick={() => {
              setActiveFilter('draft');
              if (stats.brouillons === 0) {
                toast.success('Aucun brouillon');
              } else {
                toast(`${stats.brouillons} brouillon${stats.brouillons > 1 ? 's' : ''}`);
              }
            }}
            className={`relative bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 ${
              activeFilter === 'draft' ? 'border-orange-500 ring-2 ring-orange-300' : 'border-orange-300'
            } text-left cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(249, 115, 22, 0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Brouillons</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"
                animate={stats.brouillons > 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FolderOpen className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-orange-600"
              animate={stats.brouillons > 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {stats.brouillons}
            </motion.p>
            {activeFilter === 'draft' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full" />
            )}
          </motion.button>

          {/* KPI 3: Soumissions */}
          <motion.button
            onClick={() => {
              setActiveFilter('submitted');
              toast(`${stats.soumis} soumission${stats.soumis > 1 ? 's' : ''}`);
            }}
            className={`relative bg-gradient-to-br from-green-50 via-white to-green-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 ${
              activeFilter === 'submitted' ? 'border-green-500 ring-2 ring-green-300' : 'border-green-200'
            } text-left cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(34, 197, 94, 0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Soumissions</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Send className="w-5 h-5 text-green-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-green-600"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {stats.soumis}
            </motion.p>
            {activeFilter === 'submitted' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full" />
            )}
          </motion.button>
        </div>

        {/* Boutons d'actions stratégiques */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={() => {
              speak('Acteurs');
              toast('Historique des acteurs : Marchands et Producteurs');
            }}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#9F8170] transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <History className="w-5 h-5 text-[#9F8170]" />
            <span className="font-semibold text-gray-700">Acteurs</span>
          </motion.button>

          <motion.button
            onClick={() => {
              speak('Nouveau dossier');
              navigate('/identificateur/identification');
            }}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#9F8170] to-[#B39485] text-white border-2 border-[#9F8170]"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Nouveau dossier</span>
          </motion.button>
        </motion.div>

        {/* Tabs - Filtre par rôle (Tous / Marchands / Producteurs / Coopérative) */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            <div className="grid grid-cols-4 gap-1.5">
              {/* Tab Tous */}
              <motion.button
                onClick={() => {
                  setSelectedRole('all');
                  speak('Tous les acteurs');
                }}
                className={`relative flex items-center justify-center px-2 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  selectedRole === 'all'
                    ? 'bg-gradient-to-r from-[#9F8170] to-[#B39485] text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <span>Tous</span>
                {selectedRole === 'all' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    layoutId="activeRoleTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>

              {/* Tab Marchands */}
              <motion.button
                onClick={() => {
                  setSelectedRole('marchand');
                  speak('Marchands');
                }}
                className={`relative flex items-center justify-center px-2 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  selectedRole === 'marchand'
                    ? 'bg-gradient-to-r from-[#C66A2C] to-[#D87E47] text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <span>Marchands</span>
                {selectedRole === 'marchand' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    layoutId="activeRoleTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>

              {/* Tab Producteurs */}
              <motion.button
                onClick={() => {
                  setSelectedRole('producteur');
                  speak('Producteurs');
                }}
                className={`relative flex items-center justify-center px-2 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  selectedRole === 'producteur'
                    ? 'bg-gradient-to-r from-[#2E8B57] to-[#3BA56E] text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <span>Producteurs</span>
                {selectedRole === 'producteur' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    layoutId="activeRoleTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>

              {/* Tab Coopérative */}
              <motion.button
                onClick={() => {
                  setSelectedRole('cooperative');
                  speak('Coopératives');
                }}
                className={`relative flex items-center justify-center px-2 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  selectedRole === 'cooperative'
                    ? 'bg-gradient-to-r from-[#2072AF] to-[#3A8FCC] text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <span>Coopérative</span>
                {selectedRole === 'cooperative' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    layoutId="activeRoleTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Barre de recherche */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none text-base placeholder:text-gray-400 shadow-sm"
            />
            <motion.button
              onClick={startVoiceSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#9F8170]/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isListening ? <MicOff className="w-5 h-5 text-[#9F8170]" /> : <Mic className="w-5 h-5 text-gray-400" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Section: BROUILLONS */}
        {brouillons.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 px-1">
              <FolderOpen className="w-5 h-5 text-orange-600" />
              <h2 className="font-bold text-gray-900 text-lg">Brouillons</h2>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                {brouillons.length}
              </span>
            </div>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {brouillons.map((identification, index) => {
                  const roleColor = getRoleColor(identification.role);
                  const isExpanded = selectedIdentification === identification.id;
                  const isCooperative = identification.role === 'cooperative';

                  return (
                    <motion.div
                      key={identification.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-white rounded-2xl border-2 border-orange-200 overflow-hidden"
                    >
                      {/* Card principale */}
                      <motion.div
                        className="p-4"
                        onClick={() => handleIdentificationClick(identification.id)}
                        whileHover={{ backgroundColor: '#FAFAFA' }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                            style={{
                              backgroundColor: `${roleColor}15`,
                              borderColor: roleColor,
                            }}
                          >
                            {isCooperative
                              ? <Building2 className="w-7 h-7" style={{ color: roleColor }} />
                              : <User className="w-7 h-7" style={{ color: roleColor }} />
                            }
                          </div>

                          {/* Infos principales */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-base truncate">
                                  {identification.prenoms} {identification.nom}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div
                                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                                    style={{
                                      backgroundColor: `${roleColor}15`,
                                      color: roleColor,
                                    }}
                                  >
                                    {identification.role.charAt(0).toUpperCase() +
                                      identification.role.slice(1)}
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-orange-100 border-orange-300">
                                    <Edit3 className="w-3 h-3 text-orange-700" />
                                    <span className="text-xs font-bold text-orange-700">
                                      Brouillon
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Infos rapides */}
                            <div className="space-y-1 mt-2 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{identification.telephone}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">
                                  {identification.marche} - {identification.commune}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  Modifié le {new Date(identification.dateModification).toLocaleDateString(
                                    'fr-FR',
                                    {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Détails étendus */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t-2 border-orange-200 overflow-hidden"
                          >
                            <div className="p-4 space-y-3 bg-orange-50/30">
                              <div className="p-3 rounded-xl bg-white border border-orange-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <Activity className="w-4 h-4 text-gray-500" />
                                  <p className="text-xs font-semibold text-gray-600">Activité</p>
                                </div>
                                <p className="text-sm font-bold text-gray-900">
                                  {identification.activite}
                                </p>
                              </div>

                              {/* Bouton continuer */}
                              <motion.button
                                onClick={() => {
                                  speak('Continuer le dossier');
                                  toast('Reprise du dossier en cours...');
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 text-white font-semibold"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Edit3 className="w-4 h-4" />
                                Continuer le dossier
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Section: SOUMISSIONS */}
        {soumissions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Send className="w-5 h-5 text-green-600" />
              <h2 className="font-bold text-gray-900 text-lg">Soumissions</h2>
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                {soumissions.length}
              </span>
            </div>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {soumissions.map((identification, index) => {
                  const roleColor = getRoleColor(identification.role);
                  const isExpanded = selectedIdentification === identification.id;
                  const isCooperative = identification.role === 'cooperative';

                  return (
                    <motion.div
                      key={identification.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-white rounded-2xl border-2 border-green-200 overflow-hidden"
                    >
                      {/* Card principale */}
                      <motion.div
                        className="p-4"
                        onClick={() => handleIdentificationClick(identification.id)}
                        whileHover={{ backgroundColor: '#FAFAFA' }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                            style={{
                              backgroundColor: `${roleColor}15`,
                              borderColor: roleColor,
                            }}
                          >
                            {isCooperative
                              ? <Building2 className="w-7 h-7" style={{ color: roleColor }} />
                              : <User className="w-7 h-7" style={{ color: roleColor }} />
                            }
                          </div>

                          {/* Infos principales */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-base truncate">
                                  {identification.prenoms} {identification.nom}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div
                                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                                    style={{
                                      backgroundColor: `${roleColor}15`,
                                      color: roleColor,
                                    }}
                                  >
                                    {identification.role.charAt(0).toUpperCase() +
                                      identification.role.slice(1)}
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-green-100 border-green-300">
                                    <CheckCircle className="w-3 h-3 text-green-700" />
                                    <span className="text-xs font-bold text-green-700">
                                      Soumis
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Infos rapides */}
                            <div className="space-y-1 mt-2 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{identification.telephone}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">
                                  {identification.marche} - {identification.commune}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  Soumis le {new Date(identification.dateModification).toLocaleDateString(
                                    'fr-FR',
                                    {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Détails étendus */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t-2 border-green-200 overflow-hidden"
                          >
                            <div className="p-4 space-y-3 bg-green-50/30">
                              <div className="p-3 rounded-xl bg-white border border-green-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <Activity className="w-4 h-4 text-gray-500" />
                                  <p className="text-xs font-semibold text-gray-600">Activité</p>
                                </div>
                                <p className="text-sm font-bold text-gray-900">
                                  {identification.activite}
                                </p>
                              </div>

                              {/* Statut actuel */}
                              <div className="p-3 rounded-xl bg-white border border-green-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <p className="text-xs font-semibold text-gray-600">Statut actuel</p>
                                </div>
                                <p className="text-sm font-bold text-green-700">
                                  Transmis au BO-Admin
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  En attente de validation par l'équipe d'administration
                                </p>
                              </div>

                              {/* Bouton voir détails */}
                              <motion.button
                                onClick={() => {
                                  speak('Voir les détails complets');
                                  toast('Affichage des détails...');
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#9F8170] text-white font-semibold"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Eye className="w-4 h-4" />
                                Voir les détails (lecture seule)
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Message si aucun résultat */}
        {filteredIdentifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold text-gray-600">Aucun dossier trouvé</p>
            <p className="text-sm text-gray-500 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
          </motion.div>
        )}
      </div>

      <Navigation role="identificateur" />
    </>
  );
}