import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  Filter,
  Eye,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Package,
  TrendingUp,
  Download,
  Trophy,
  Mic,
  MicOff,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'sonner';
import { Navigation } from '../layout/Navigation';
import { NotificationButton } from '../marchand/NotificationButton';

const PRIMARY_COLOR = '#2E8B57';

// Types
interface Commande {
  id: string;
  clientName: string;
  clientType: string;
  location: string;
  productName: string;
  quantity: string;
  totalAmount: number;
  status: 'nouvelle' | 'en_cours' | 'livree' | 'annulee';
  orderDate: string;
  description: string;
}

// Mock data
const mockCommandes: Commande[] = [
  {
    id: '1',
    clientName: 'Coopérative Espoir du Plateau',
    clientType: 'Coopérative',
    location: 'Plateau',
    productName: 'Tomates fraîches',
    quantity: '500 kg',
    totalAmount: 375000,
    status: 'nouvelle',
    orderDate: 'Il y a 15 min',
    description: 'Commande urgente pour le marché de demain matin',
  },
  {
    id: '2',
    clientName: 'Marché Adjamé - Aminata',
    clientType: 'Marchande',
    location: 'Adjamé',
    productName: 'Aubergines locales',
    quantity: '200 kg',
    totalAmount: 160000,
    status: 'nouvelle',
    orderDate: 'Il y a 1h',
    description: 'Livraison souhaitée demain matin avant 8h',
  },
  {
    id: '3',
    clientName: 'Restaurant Le Wafou',
    clientType: 'Restaurant',
    location: 'Cocody',
    productName: 'Gombo frais',
    quantity: '20 tas',
    totalAmount: 70000,
    status: 'en_cours',
    orderDate: 'Il y a 3h',
    description: 'Commande hebdomadaire régulière',
  },
  {
    id: '4',
    clientName: 'Coopérative Yopougon',
    clientType: 'Coopérative',
    location: 'Yopougon',
    productName: 'Piment frais',
    quantity: '5 sacs',
    totalAmount: 125000,
    status: 'livree',
    orderDate: 'Hier',
    description: 'Commande livrée et payée',
  },
  {
    id: '5',
    clientName: 'Marché Abobo - Fatou',
    clientType: 'Marchande',
    location: 'Abobo',
    productName: 'Oignons',
    quantity: '10 sacs',
    totalAmount: 450000,
    status: 'livree',
    orderDate: 'Hier',
    description: 'Commande livrée avec succès',
  },
  {
    id: '6',
    clientName: 'Hôtel Ivoire',
    clientType: 'Hôtel',
    location: 'Plateau',
    productName: 'Bananes plantain',
    quantity: '30 régimes',
    totalAmount: 60000,
    status: 'nouvelle',
    orderDate: 'Il y a 2h',
    description: 'Livraison pour le restaurant de l\'hôtel',
  },
  {
    id: '7',
    clientName: 'Marché Treichville - Aya',
    clientType: 'Marchande',
    location: 'Treichville',
    productName: 'Riz local',
    quantity: '100 kg',
    totalAmount: 65000,
    status: 'en_cours',
    orderDate: 'Aujourd\'hui',
    description: 'En cours de préparation',
  },
  {
    id: '8',
    clientName: 'Cantine Scolaire Riviera',
    clientType: 'Cantine',
    location: 'Riviera',
    productName: 'Maïs grain',
    quantity: '150 kg',
    totalAmount: 75000,
    status: 'livree',
    orderDate: 'Il y a 2 jours',
    description: 'Commande mensuelle livrée',
  },
  {
    id: '9',
    clientName: 'Supermarché Hayat',
    clientType: 'Supermarché',
    location: 'Cocody',
    productName: 'Ignames blanches',
    quantity: '300 kg',
    totalAmount: 210000,
    status: 'annulee',
    orderDate: 'Il y a 3 jours',
    description: 'Commande annulée par le client',
  },
];

export function Commandes() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { speak } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'livree' | 'annulee'>('all');
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showFiltres, setShowFiltres] = useState(false);
  const [selectedStatut, setSelectedStatut] = useState<'all' | 'nouvelle' | 'en_cours' | 'livree' | 'annulee'>('all');

  // Stats calculées
  const totalCount = mockCommandes.length;
  const livreeCount = mockCommandes.filter(c => c.status === 'livree').length;
  const annuleeCount = mockCommandes.filter(c => c.status === 'annulee').length;

  // Recherche vocale
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
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      speak(`Recherche pour ${transcript}`);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Filtrage
  let filteredCommandes = mockCommandes;

  if (activeFilter === 'livree') {
    filteredCommandes = filteredCommandes.filter(c => c.status === 'livree');
  } else if (activeFilter === 'annulee') {
    filteredCommandes = filteredCommandes.filter(c => c.status === 'annulee');
  }

  if (selectedStatut !== 'all') {
    filteredCommandes = filteredCommandes.filter(c => c.status === selectedStatut);
  }

  if (searchQuery) {
    filteredCommandes = filteredCommandes.filter(c =>
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const getStatusStyle = (status: Commande['status']) => {
    switch (status) {
      case 'nouvelle': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertCircle, label: 'Nouvelle' };
      case 'en_cours': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'En cours' };
      case 'livree': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Livrée' };
      case 'annulee': return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Annulée' };
    }
  };

  return (
    <>
      {/* Header fixe */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-[#EAF4EE]"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <h1 className="flex-1 font-bold text-gray-900 text-xl sm:text-2xl md:text-3xl">Commandes</h1>

            {/* Bouton Notifications */}
            <NotificationButton />

            {/* Bouton Filtre */}
            <motion.button
              onClick={() => setShowFiltres(!showFiltres)}
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
      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-[#EAF4EE] to-white">

        {/* KPI Cards - 3 colonnes */}
        <div className="grid grid-cols-3 gap-3 mb-4">

          {/* KPI 1: Total */}
          <motion.button
            onClick={() => {
              setActiveFilter('all');
              setSelectedStatut('all');
              toast('Affichage de toutes les commandes');
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
                <Package className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-blue-600"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {totalCount}
            </motion.p>
            {activeFilter === 'all' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full" />
            )}
          </motion.button>

          {/* KPI 2: Livrées */}
          <motion.button
            onClick={() => {
              setActiveFilter('livree');
              if (livreeCount === 0) {
                toast.success('Aucune commande livrée');
              } else {
                toast(`${livreeCount} commande${livreeCount > 1 ? 's' : ''} livrée${livreeCount > 1 ? 's' : ''}`);
              }
            }}
            className={`relative bg-gradient-to-br from-green-50 via-white to-green-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 ${
              activeFilter === 'livree' ? 'border-green-500 ring-2 ring-green-300' : 'border-green-200'
            } text-left cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(34, 197, 94, 0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Livrées</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
                animate={livreeCount > 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-green-600"
              animate={livreeCount > 0 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {livreeCount}
            </motion.p>
            {activeFilter === 'livree' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full" />
            )}
          </motion.button>

          {/* KPI 3: Annulées */}
          <motion.button
            onClick={() => {
              setActiveFilter('annulee');
              if (annuleeCount === 0) {
                toast.success('Aucune commande annulée');
              } else {
                toast(`${annuleeCount} commande${annuleeCount > 1 ? 's' : ''} annulée${annuleeCount > 1 ? 's' : ''}`);
              }
            }}
            className={`relative bg-gradient-to-br from-red-50 via-white to-red-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 ${
              activeFilter === 'annulee' ? 'border-red-500 ring-2 ring-red-300' : 'border-red-200'
            } text-left cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Annulées</p>
              <motion.div
                className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"
                animate={annuleeCount > 0 ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <XCircle className="w-5 h-5 text-red-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-red-600"
              animate={annuleeCount > 0 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {annuleeCount}
            </motion.p>
            {activeFilter === 'annulee' && (
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
              toast('Rapports de commandes');
            }}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#2E8B57] transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5 text-[#2E8B57]" />
            <span className="font-semibold text-gray-700">Rapports</span>
          </motion.button>

          <motion.button
            onClick={() => {
              speak('Performance');
              toast('Statistiques détaillées de performance');
            }}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#2E8B57] transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trophy className="w-5 h-5 text-[#2E8B57]" />
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
              placeholder="Rechercher par client ou produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:border-[#2E8B57] focus:outline-none"
            />
            <motion.button
              onClick={startVoiceSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#2E8B57]/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isListening ? <MicOff className="w-5 h-5 text-[#2E8B57]" /> : <Mic className="w-5 h-5 text-gray-400" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Liste des commandes */}
        <div className="space-y-3">
          {filteredCommandes.map((commande, index) => {
            const statusStyle = getStatusStyle(commande.status);
            const StatusIcon = statusStyle.icon;

            return (
              <motion.div
                key={commande.id}
                className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.01, y: -2 }}
                layout
              >
                <div className="flex items-start gap-3">
                  {/* Avatar client */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    {commande.clientName.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{commande.clientName}</p>
                        <p className="text-xs text-gray-600">{commande.productName} • {commande.quantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{commande.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusStyle.label}
                        </div>
                        <span className="text-xs text-gray-500">{commande.orderDate}</span>
                      </div>

                      <button
                        onClick={() => setSelectedCommande(commande)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                        style={{
                          backgroundColor: `${PRIMARY_COLOR}20`,
                          color: PRIMARY_COLOR,
                        }}
                      >
                        <Eye className="w-3 h-3" />
                        Consulter
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredCommandes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-600">Aucune commande trouvée</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery ? 'Essayez une autre recherche' : 'Aucune commande dans cette catégorie'}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <Navigation role="producteur" onMicClick={startVoiceSearch} />

      {/* Modal Filtres */}
      <AnimatePresence>
        {showFiltres && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFiltres(false)}
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
                  onClick={() => setShowFiltres(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600"
                >
                  X
                </button>
              </div>

              {/* Statut */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Statut</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedStatut('all')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      selectedStatut === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Toutes
                  </button>
                  <button
                    onClick={() => setSelectedStatut('nouvelle')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      selectedStatut === 'nouvelle' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700'
                    }`}
                  >
                    <AlertCircle className="w-3 h-3" />
                    Nouvelle
                  </button>
                  <button
                    onClick={() => setSelectedStatut('en_cours')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      selectedStatut === 'en_cours' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    En cours
                  </button>
                  <button
                    onClick={() => setSelectedStatut('livree')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      selectedStatut === 'livree' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Livrée
                  </button>
                  <button
                    onClick={() => setSelectedStatut('annulee')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      selectedStatut === 'annulee' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    <XCircle className="w-3 h-3" />
                    Annulée
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowFiltres(false)}
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Appliquer les filtres
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Détail Commande */}
      <AnimatePresence>
        {selectedCommande && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCommande(null)}
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
                    onClick={() => setSelectedCommande(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600"
                  >
                    X
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Client</p>
                    <p className="font-bold text-gray-900">{selectedCommande.clientName}</p>
                    <p className="text-sm text-gray-500">{selectedCommande.clientType} — {selectedCommande.location}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Produit</p>
                    <p className="font-bold text-gray-900">{selectedCommande.productName}</p>
                    <p className="text-sm text-gray-500">Quantité : {selectedCommande.quantity}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Montant total</p>
                    <p className="font-bold text-2xl" style={{ color: PRIMARY_COLOR }}>
                      {selectedCommande.totalAmount.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-semibold text-gray-900">{selectedCommande.orderDate}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-700">{selectedCommande.description}</p>
                  </div>

                  {/* Statut */}
                  {(() => {
                    const s = getStatusStyle(selectedCommande.status);
                    const SIcon = s.icon;
                    return (
                      <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl ${s.bg}`}>
                        <SIcon className={`w-5 h-5 ${s.text}`} />
                        <span className={`font-bold ${s.text}`}>{s.label}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
