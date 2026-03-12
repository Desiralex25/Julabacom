import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { 
  Search, 
  Filter, 
  Store, 
  Sprout, 
  Eye, 
  Edit2, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  AlertCircle,
  UserCheck,
  TrendingUp,
  Wallet,
  Plus,
  BarChart3,
  Mic,
  MicOff,
  Users,
  Download,
  Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useIdentificateur } from '../../contexts/IdentificateurContext';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'sonner';
import { Navigation } from '../layout/Navigation';
import { NotificationButton } from '../marchand/NotificationButton';

const PRIMARY_COLOR = '#9F8170';

export function SuiviIdentifications() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { speak } = useApp();
  const { 
    getMesIdentifications, 
    rechercherParNumero, 
    peutConsulterActeur,
    getTotalCommissions,
    getStatsIdentificateur,
  } = useIdentificateur();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'rejected'>('all');
  const [selectedIdentification, setSelectedIdentification] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showRapports, setShowRapports] = useState(true); // Activé par défaut
  const [selectedRole, setSelectedRole] = useState<'all' | 'marchand' | 'producteur'>('all');

  // Récupérer le filtre depuis la navigation (si venant de l'accueil)
  useEffect(() => {
    if (location.state?.filter) {
      const filter = location.state.filter;
      if (filter === 'draft' || filter === 'submitted' || filter === 'approved' || filter === 'rejected') {
        setActiveFilter(filter);
      }
    }
  }, [location.state]);

  const mesIdentifications = getMesIdentifications();
  const stats = getStatsIdentificateur(user?.telephone || 'ID001');
  const totalCommissions = getTotalCommissions();

  // Stats calculées
  const pendingCount = mesIdentifications.filter(i => normalizeStatut(i.statut) === 'submitted').length;
  const approvedCount = mesIdentifications.filter(i => normalizeStatut(i.statut) === 'approved').length;
  const rejectedCount = mesIdentifications.filter(i => normalizeStatut(i.statut) === 'rejected').length;

  // Conversion des statuts pour correspondre au nouveau système
  function normalizeStatut(statut: string): 'draft' | 'submitted' | 'approved' | 'rejected' {
    switch (statut) {
      case 'en_cours': return 'submitted';
      case 'valide': return 'approved';
      case 'rejete': return 'rejected';
      default: return 'draft';
    }
  }

  // Recherche
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.length >= 8) {
      const result = rechercherParNumero(query);
      
      if (result.acteur && !result.consultable) {
        toast.warning('Accès restreint', {
          description: `Cet acteur n'est pas attribué à votre zone (${result.zone})`,
          icon: <Lock className="w-5 h-5" />,
        });
      }
    }
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

  // Filtrage
  let filteredIdentifications = mesIdentifications;

  // Appliquer le filtre actif des KPIs
  if (activeFilter === 'draft') {
    filteredIdentifications = filteredIdentifications.filter(i => normalizeStatut(i.statut) === 'draft');
  } else if (activeFilter === 'submitted') {
    filteredIdentifications = filteredIdentifications.filter(i => normalizeStatut(i.statut) === 'submitted');
  } else if (activeFilter === 'approved') {
    filteredIdentifications = filteredIdentifications.filter(i => normalizeStatut(i.statut) === 'approved');
  } else if (activeFilter === 'rejected') {
    filteredIdentifications = filteredIdentifications.filter(i => normalizeStatut(i.statut) === 'rejected');
  }

  if (selectedRole !== 'all') {
    filteredIdentifications = filteredIdentifications.filter(i => i.typeActeur === selectedRole);
  }

  if (searchQuery) {
    filteredIdentifications = filteredIdentifications.filter(i =>
      i.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.prenoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.telephone.includes(searchQuery.replace(/\s/g, ''))
    );
  }

  const handleConsulter = (ident: any) => {
    const access = peutConsulterActeur(ident.zoneId);
    
    if (!access.autorise) {
      toast.error('Accès refusé', {
        description: access.raison,
        icon: <Lock className="w-5 h-5" />,
      });
      return;
    }

    setSelectedIdentification(ident.id);
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
            <h1 className="flex-1 font-bold text-gray-900 text-xl sm:text-2xl md:text-3xl">Suivi</h1>

            {/* Bouton Notifications */}
            <NotificationButton />

            {/* Bouton Filtre - Icône réduite */}
            <motion.button
              onClick={() => setShowRapports(!showRapports)}
              className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Filter className="w-5 h-5 text-gray-700" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-[#F5F0ED] to-white">
        
        {/* Stats Cards - HARMONISÉES avec GestionStock */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* KPI 1: Total */}
          <motion.button
            onClick={() => {
              setActiveFilter('all');
              toast('📋 Affichage de toutes les identifications', { icon: '📋' });
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
                <UserCheck className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-blue-600"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {stats.totalIdentifications}
            </motion.p>
            {activeFilter === 'all' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full" />
            )}
          </motion.button>

          {/* KPI 2: Approuvés */}
          <motion.button
            onClick={() => {
              setActiveFilter('approved');
              if (approvedCount === 0) {
                toast.success('Aucune identification approuvée');
              } else {
                toast(`${approvedCount} identification${approvedCount > 1 ? 's' : ''} approuvée${approvedCount > 1 ? 's' : ''}`);
              }
            }}
            className={`relative bg-gradient-to-br from-green-50 via-white to-green-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 ${
              activeFilter === 'approved' ? 'border-green-500 ring-2 ring-green-300' : 'border-green-200'
            } text-left cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(34, 197, 94, 0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Approuvés</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
                animate={approvedCount > 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-green-600"
              animate={approvedCount > 0 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {approvedCount}
            </motion.p>
            {activeFilter === 'approved' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full" />
            )}
          </motion.button>

          {/* KPI 3: Rejetés */}
          <motion.button
            onClick={() => {
              setActiveFilter('rejected');
              if (rejectedCount === 0) {
                toast.success('Aucune identification rejetée');
              } else {
                toast(`${rejectedCount} identification${rejectedCount > 1 ? 's' : ''} rejetée${rejectedCount > 1 ? 's' : ''}`);
              }
            }}
            className={`relative bg-gradient-to-br from-red-50 via-white to-red-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 ${
              activeFilter === 'rejected' ? 'border-red-500 ring-2 ring-red-300' : 'border-red-200'
            } text-left cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Rejetés</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"
                animate={rejectedCount > 0 ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <XCircle className="w-5 h-5 text-red-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-red-600"
              animate={rejectedCount > 0 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {rejectedCount}
            </motion.p>
            {activeFilter === 'rejected' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-500 rounded-full" />
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
              speak('Rapports');
              navigate('/identificateur/rapports');
            }}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#9F8170] transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5 text-[#9F8170]" />
            <span className="font-semibold text-gray-700">Rapports</span>
          </motion.button>

          <motion.button
            onClick={() => {
              speak('Performance');
              toast('Statistiques détaillées de performance');
            }}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#9F8170] transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trophy className="w-5 h-5 text-[#9F8170]" />
            <span className="font-semibold text-gray-700">Performance</span>
          </motion.button>
        </motion.div>

        {/* Barre de recherche */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou numéro..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
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

        {/* Liste des identifications */}
        <div className="space-y-3">
          {filteredIdentifications.map((ident, index) => {
            const access = peutConsulterActeur(ident.zoneId);
            const isLocked = !access.autorise;

            return (
              <motion.div
                key={ident.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${
                  isLocked ? 'border-orange-200 bg-orange-50/50' : 'border-gray-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: isLocked ? 1 : 1.01, y: isLocked ? 0 : -2 }}
                layout
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: ident.typeActeur === 'marchand' ? '#C66A2C' : '#2E8B57' }}
                  >
                    {ident.prenoms.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {ident.prenoms} {ident.nom}
                        </p>
                        <p className="text-xs text-gray-600">{ident.activite}</p>
                      </div>
                      {isLocked && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-100">
                          <Lock className="w-3 h-3 text-orange-600" />
                          <span className="text-xs text-orange-700 font-medium">Hors zone</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{ident.zone}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            normalizeStatut(ident.statut) === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : normalizeStatut(ident.statut) === 'submitted'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {normalizeStatut(ident.statut) === 'approved' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                          {normalizeStatut(ident.statut) === 'submitted' && <Clock className="w-3 h-3 inline mr-1" />}
                          {normalizeStatut(ident.statut) === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                          {normalizeStatut(ident.statut) === 'approved' ? 'Validé' : normalizeStatut(ident.statut) === 'submitted' ? 'En cours' : 'Rejeté'}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(ident.dateIdentification).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleConsulter(ident)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                        style={{
                          backgroundColor: isLocked ? '#FED7AA' : `${PRIMARY_COLOR}20`,
                          color: isLocked ? '#C2410C' : PRIMARY_COLOR,
                        }}
                      >
                        {isLocked ? <Lock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {isLocked ? 'Restreint' : 'Consulter'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredIdentifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-600">Aucune identification trouvée</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery ? 'Essayez une autre recherche' : 'Commencez par identifier des acteurs'}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal Filtres */}
      <AnimatePresence>
        {showRapports && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[200] flex items-end lg:items-center justify-center p-0 lg:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRapports(false)}
          >
            <motion.div
              className="bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-md p-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filtres</h2>
                <button
                  onClick={() => setShowRapports(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Type d'acteur */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Type d'acteur</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRole('all')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      selectedRole === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setSelectedRole('marchand')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      selectedRole === 'marchand' ? 'text-white' : 'bg-orange-50 text-orange-700'
                    }`}
                    style={{ backgroundColor: selectedRole === 'marchand' ? '#C66A2C' : undefined }}
                  >
                    <Store className="w-4 h-4" />
                    Marchands
                  </button>
                  <button
                    onClick={() => setSelectedRole('producteur')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      selectedRole === 'producteur' ? 'text-white' : 'bg-green-50 text-green-700'
                    }`}
                    style={{ backgroundColor: selectedRole === 'producteur' ? '#2E8B57' : undefined }}
                  >
                    <Sprout className="w-4 h-4" />
                    Producteurs
                  </button>
                </div>
              </div>

              {/* Statut */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Statut</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setActiveFilter('draft')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'draft' ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <FileText className="w-3 h-3 inline mr-1" />
                    Brouillon
                  </button>
                  <button
                    onClick={() => setActiveFilter('submitted')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'submitted' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700'
                    }`}
                  >
                    <Clock className="w-3 h-3 inline mr-1" />
                    Soumis
                  </button>
                  <button
                    onClick={() => setActiveFilter('approved')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    Approuvé
                  </button>
                  <button
                    onClick={() => setActiveFilter('rejected')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    <XCircle className="w-3 h-3 inline mr-1" />
                    Rejeté
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowRapports(false)}
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Appliquer les filtres
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal détail */}
      <AnimatePresence>
        {selectedIdentification && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[200] flex items-end lg:items-center justify-center p-0 lg:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIdentification(null)}
          >
            <motion.div
              className="bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-md max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Détails</h2>
                  <button
                    onClick={() => setSelectedIdentification(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                    <p className="font-bold text-gray-900">
                      {selectedIdentification.prenoms} {selectedIdentification.nom}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                    <p className="font-medium text-gray-900">{selectedIdentification.telephone}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Type</p>
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white font-medium"
                      style={{ backgroundColor: selectedIdentification.typeActeur === 'marchand' ? '#C66A2C' : '#2E8B57' }}
                    >
                      {selectedIdentification.typeActeur === 'marchand' ? <Store className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
                      {selectedIdentification.typeActeur}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Activité</p>
                    <p className="font-medium text-gray-900">{selectedIdentification.activite}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Zone</p>
                    <p className="font-medium text-gray-900">{selectedIdentification.zone}</p>
                  </div>

                  {selectedIdentification.cni && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">CNI</p>
                      <p className="font-medium text-gray-900">{selectedIdentification.cni}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Statut</p>
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium ${
                        normalizeStatut(selectedIdentification.statut) === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : normalizeStatut(selectedIdentification.statut) === 'submitted'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {normalizeStatut(selectedIdentification.statut) === 'approved' ? 'Validé' : normalizeStatut(selectedIdentification.statut) === 'submitted' ? 'En cours' : 'Rejeté'}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Commission</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {selectedIdentification.commission.toLocaleString()} FCFA
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedIdentification.commissionPayee ? '✓ Versée' : '⏳ En attente de versement'}
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Identifié le {new Date(selectedIdentification.dateIdentification).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {peutConsulterActeur(selectedIdentification.zoneId).autorise && (
                  <button
                    className="w-full mt-6 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    <Edit2 className="w-5 h-5" />
                    Modifier les informations
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation role="identificateur" />
    </>
  );
}