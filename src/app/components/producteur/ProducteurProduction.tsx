import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sprout, 
  Package, 
  Heart,
  TrendingDown,
  Plus,
  TrendingUp,
  Edit3,
  AlertTriangle,
  Mic,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Navigation } from '../layout/Navigation';
import { useProducteur } from '../../contexts/ProducteurContext';
import { useApp } from '../../contexts/AppContext';
import { NotificationButton } from '../marchand/NotificationButton';
import { HistoriqueList } from '../marche/HistoriqueList';
import { COMMANDES_MARCHE } from '../marche/marketplace-data';
import { PublierRecolteModal } from './PublierRecolteModal';
import { ModifierPublicationModal } from './ModifierPublicationModal';
import { CreerCycleModal } from './CreerCycleModal';
import { RecolteDetailModal } from './RecolteDetailModal';
import { ProductionKPIBar } from './ProductionKPIBar';
import { PlantationDetailModal } from './PlantationDetailModal';
const imgTomate    = '/images/produit-tomate.png';
const imgAubergine = '/images/produit-aubergine.png';
const imgPiment    = '/images/produit-piment.png';
const imgGombo     = '/images/produit-gombo.png';
const imgManioc    = '/images/produit-manioc.png';
const imgIgname    = '/images/produit-igname.png';
const imgMais      = '/images/produit-mais.png';
const imgRiz       = '/images/produit-riz.png';
const imgBanane    = '/images/produit-banane.png';
const imgOignon    = '/images/produit-oignon.png';
const imgAvocat    = '/images/produit-avocat.png';
const imgAutre     = '/images/produit-autre.png';

const PRIMARY_COLOR = '#2E8B57';

const FILTRES_PRODUITS = [
  { id: 'tous',          label: 'Tous',           img: null },
  { id: 'Tomate',        label: 'Tomate',         img: imgTomate },
  { id: 'Aubergine',     label: 'Aubergine',      img: imgAubergine },
  { id: 'Piment',        label: 'Piment',         img: imgPiment },
  { id: 'Gombo',         label: 'Gombo',          img: imgGombo },
  { id: 'Manioc',        label: 'Manioc',         img: imgManioc },
  { id: 'Igname',        label: 'Igname',         img: imgIgname },
  { id: 'Maïs',          label: 'Maïs',           img: imgMais },
  { id: 'Riz',           label: 'Riz',            img: imgRiz },
  { id: 'Banane plantain', label: 'Banane',       img: imgBanane },
  { id: 'Oignon',        label: 'Oignon',         img: imgOignon },
  { id: 'Avocat',        label: 'Avocat',         img: imgAvocat },
  { id: 'Autre',         label: 'Autre',          img: imgAutre },
];

export function ProducteurProduction() {
  const navigate = useNavigate();
  const { stats } = useProducteur();
  const { speak } = useApp();

  // Safe defaults since these arrays are not in ProducteurContext
  const cycles: any[] = [];
  const recoltes: any[] = [];
  const publications: any[] = [];

  const totalAlertes = (stats?.commandesEnCours ?? 0);

  const [activeTab, setActiveTab] = useState<'cycles' | 'recoltes' | 'publications' | 'historique'>('cycles');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) newFavorites.delete(id);
    else newFavorites.add(id);
    setFavorites(newFavorites);
  };

  // Filtre dynamique : par recherche texte ET par catégorie produit
  const filterItems = (items: any[], getCulture: (item: any) => string) =>
    items.filter((item) => {
      const culture = getCulture(item)?.toLowerCase() ?? '';
      const matchSearch = searchQuery.trim() === '' || culture.includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'tous' || getCulture(item) === selectedCategory;
      return matchSearch && matchCat;
    });

  const cyclesFiltres    = filterItems(cycles,       (c) => c.culture);
  const recoltesFiltrees = filterItems(recoltes,     (r) => {
    const cycle = cycles.find((c) => c.id === r.cycleId);
    return cycle?.culture ?? '';
  });
  const publicationsFiltrees = filterItems(publications, (p) => {
    const cycle = cycles.find((c) => c.id === p.cycleId);
    return cycle?.culture ?? '';
  });

  return (
    <>
      <div className="pb-32 lg:pb-8 pt-16 lg:pt-10 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gray-50">
        
        {/* 1. Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900">
            Marché Producteur
          </h1>
          <div className="flex items-center gap-3">
            {totalAlertes > 0 && (
              <motion.button
                onClick={() => navigate('/producteur/alertes')}
                className="relative w-11 h-11 rounded-2xl flex items-center justify-center bg-orange-50 border-2 border-orange-200"
                whileTap={{ scale: 0.9 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <motion.div
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <span className="text-white text-xs font-bold">{totalAlertes}</span>
                </motion.div>
              </motion.button>
            )}
            <NotificationButton />
          </div>
        </div>

        {/* ── KPIs dynamiques — toutes les vues ── */}
        <ProductionKPIBar activeTab={activeTab} />

        {/* 2. Barre de recherche + filtre produits */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          {/* Barre de recherche avec bouton filtre intégré */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Recherche une culture, une récolte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-[110px] py-4 rounded-2xl bg-white border-2 border-gray-200 focus:border-[#2E8B57] focus:outline-none text-base placeholder:text-gray-400 shadow-sm"
            />
            {/* Bouton filtre dans la barre */}
            <motion.button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 transition-all ${
                selectedCategory !== 'tous' || showFilterPanel
                  ? 'bg-[#2E8B57] border-[#2E8B57] text-white shadow-md'
                  : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
              }`}
              whileTap={{ scale: 0.92 }}
            >
              <SlidersHorizontal className="w-4 h-4" strokeWidth={2.5} />
              {selectedCategory !== 'tous' ? (
                <img
                  src={FILTRES_PRODUITS.find(f => f.id === selectedCategory)?.img ?? undefined}
                  alt={selectedCategory}
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <span className="text-xs font-bold">Filtre</span>
              )}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`}
                strokeWidth={2.5}
              />
            </motion.button>
          </div>

          {/* Panneau filtre déroulant */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="mt-2 bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-3 origin-top"
              >
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {FILTRES_PRODUITS.map((f, index) => {
                    const isActive = selectedCategory === f.id;
                    return (
                      <motion.button
                        key={f.id}
                        onClick={() => {
                          setSelectedCategory(f.id);
                          speak(f.label);
                          setShowFilterPanel(false);
                        }}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 rounded-2xl px-3 py-2 border-2 transition-all ${
                          isActive
                            ? 'border-[#2E8B57] shadow-md'
                            : 'bg-gray-50 border-transparent hover:border-green-300'
                        }`}
                        style={isActive ? { backgroundColor: `${PRIMARY_COLOR}15`, borderColor: PRIMARY_COLOR } : {}}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.025 }}
                        whileTap={{ scale: 0.88 }}
                        whileHover={{ scale: 1.06, y: -2 }}
                      >
                        {f.img ? (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-white shadow-sm' : 'bg-white'}`}>
                            <img src={f.img} alt={f.label} className="w-7 h-7 object-contain" />
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                            <Package className="w-5 h-5" style={{ color: isActive ? PRIMARY_COLOR : '#9ca3af' }} strokeWidth={2.5} />
                          </div>
                        )}
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: isActive ? PRIMARY_COLOR : '#6b7280' }}
                        >
                          {f.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 3. Tabs Cycles/Récoltes/Publications */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-gray-200">
            <div className="grid grid-cols-4 gap-1">
              {/* Tab Ma Plantation */}
              <motion.button
                onClick={() => {
                  setActiveTab('cycles');
                  speak('Ma Plantation');
                }}
                className={`relative flex items-center justify-center text-center px-2 py-4 rounded-xl font-bold transition-all ${
                  activeTab === 'cycles'
                    ? 'bg-gradient-to-r from-[#2E8B57] to-[#3BA869] text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-[13px] leading-tight">Ma Plantation</span>
                {activeTab === 'cycles' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>

              {/* Tab Récoltes */}
              <motion.button
                onClick={() => {
                  setActiveTab('recoltes');
                  speak('Mes récoltes');
                }}
                className={`relative flex items-center justify-center text-center px-2 py-4 rounded-xl font-bold transition-all ${
                  activeTab === 'recoltes'
                    ? 'bg-gradient-to-r from-[#2E8B57] to-[#3BA869] text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-[13px] leading-tight">Mes Récoltes</span>
                {activeTab === 'recoltes' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>

              {/* Tab Publications */}
              <motion.button
                onClick={() => {
                  setActiveTab('publications');
                  speak('Mon Marché');
                }}
                className={`relative flex items-center justify-center text-center px-2 py-4 rounded-xl font-bold transition-all ${
                  activeTab === 'publications'
                    ? 'bg-gradient-to-r from-[#2E8B57] to-[#3BA869] text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-[13px] leading-tight">Mon Marché</span>
                {activeTab === 'publications' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>

              {/* Tab Historique Ventes */}
              <motion.button
                onClick={() => {
                  setActiveTab('historique');
                  speak('Mon Historique de ventes');
                }}
                className={`relative flex items-center justify-center text-center px-2 py-4 rounded-xl font-bold transition-all ${
                  activeTab === 'historique'
                    ? 'bg-gradient-to-r from-[#2E8B57] to-[#3BA869] text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-[13px] leading-tight">Mon Historique</span>
                {activeTab === 'historique' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            </div>
          </div>

          {/* Description de la vue active */}
          <motion.p
            key={activeTab}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-gray-600 text-center"
          >
            {activeTab === 'cycles' 
              ? 'Gère tes plantations de la mise en terre à la récolte'
              : activeTab === 'recoltes'
              ? 'Consulte et valorise tes récoltes disponibles'
              : activeTab === 'publications'
              ? 'Produits actuellement visibles sur le marché'
              : 'Toutes tes transactions de vente'
            }
          </motion.p>
        </motion.div>

        {/* 5. Contenu selon le tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'cycles' && <CyclesView key="cycles" cycles={cyclesFiltres} />}
          {activeTab === 'recoltes' && (
            <RecoltesView 
              key="recoltes" 
              recoltes={recoltesFiltrees} 
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          )}
          {activeTab === 'publications' && (
            <PublicationsView 
              key="publications"
              publications={publicationsFiltrees}
            />
          )}
          {activeTab === 'historique' && (
            <motion.div
              key="historique"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HistoriqueList
                commandes={COMMANDES_MARCHE}
                profil="producteur"
                sens="vente"
                emptyLabel="Aucune vente dans ton historique"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Navigation role="producteur" />
    </>
  );
}

// Vue Cycles
function CyclesView({ cycles }: { cycles: any[] }) {
  const { speak } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<any | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Bouton Créer */}
      <motion.button
        onClick={() => {
          speak('Suivre une nouvelle plantation');
          setShowCreateModal(true);
        }}
        className="w-full bg-gradient-to-r from-[#2E8B57] to-[#3BA869] text-white rounded-2xl p-5 flex items-center justify-center gap-3 shadow-lg font-bold text-lg"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
        Nouvelle plantation
      </motion.button>

      {/* Liste des cycles */}
      {cycles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Aucune plantation</p>
          <p className="text-sm text-gray-500 mt-2">Crée ta première plantation pour démarrer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cycles.map((cycle, index) => {
            const daysUntilHarvest = Math.floor(
              (cycle.dateRecolteEstimee.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const isUrgent = daysUntilHarvest <= 7 && cycle.status === 'active';
            const daysSincePlanting = Math.floor(
              (Date.now() - cycle.datePlantation.getTime()) / (1000 * 60 * 60 * 24)
            );
            const totalDays = Math.floor(
              (cycle.dateRecolteEstimee.getTime() - cycle.datePlantation.getTime()) / (1000 * 60 * 60 * 24)
            );
            const progressPercent = Math.min(100, Math.max(0, (daysSincePlanting / totalDays) * 100));

            return (
              <motion.div
                key={cycle.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-green-50 via-white to-green-50 rounded-3xl p-5 shadow-lg border-2 border-green-200 cursor-pointer"
                whileHover={{ scale: 1.01, y: -4, boxShadow: '0 12px 30px rgba(46, 139, 87, 0.2)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedCycle(cycle);
                  speak(`Détails de ta plantation de ${cycle.culture}`);
                }}
              >
                {/* Header avec icône et statut */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* Grande icône */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#3BA869] flex items-center justify-center shadow-lg">
                      <Sprout className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    
                    <div>
                      <h3 className="font-black text-gray-900 text-2xl mb-1">{cycle.culture}</h3>
                      <p className="text-base text-gray-600 font-medium">{cycle.surface} hectares</p>
                    </div>
                  </div>
                  
                  {/* Badge statut */}
                  <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                    cycle.status === 'active' ? 'bg-green-500 text-white' :
                    cycle.status === 'completed' ? 'bg-blue-500 text-white' :
                    'bg-gray-400 text-white'
                  }`}>
                    {cycle.status === 'active' ? 'En cours' :
                     cycle.status === 'completed' ? 'Récolté' : 'Préparation'}
                  </span>
                </div>

                {/* Barre de progression */}
                {cycle.status === 'active' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">Croissance</span>
                      <span className="text-sm font-black text-green-600">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-[#2E8B57] to-[#3BA869] rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Infos en grille - SIMPLIFIÉES */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Date de récolte */}
                  <div className={`rounded-2xl p-4 ${
                    isUrgent ? 'bg-orange-100 border-2 border-orange-400' : 'bg-white border-2 border-gray-200'
                  }`}>
                    <p className="text-xs text-gray-600 font-bold mb-1">Récolte prévue</p>
                    <p className="text-lg font-black text-gray-900">
                      {cycle.dateRecolteEstimee.toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short'
                      })}
                    </p>
                    {isUrgent ? (
                      <p className="text-xs text-orange-600 font-black mt-1">
                        Bientôt ! ({daysUntilHarvest}j)
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        Dans {daysUntilHarvest} jours
                      </p>
                    )}
                  </div>

                  {/* Quantité estimée */}
                  <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                    <p className="text-xs text-gray-600 font-bold mb-1">Récolte attendue</p>
                    <p className="text-lg font-black text-green-600">
                      {cycle.quantiteEstimee.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      kilogrammes
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de création de cycle */}
      {showCreateModal && (
        <CreerCycleModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Modal détail plantation */}
      {selectedCycle && (
        <PlantationDetailModal
          cycle={selectedCycle}
          onClose={() => setSelectedCycle(null)}
        />
      )}
    </motion.div>
  );
}

// Vue Récoltes - GRILLE 2 COLONNES IDENTIQUE au Marché Virtuel
interface RecoltesViewProps {
  recoltes: any[];
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
}

function RecoltesView({ recoltes, favorites, toggleFavorite }: RecoltesViewProps) {
  const { speak } = useApp();
  const cycles: any[] = [];
  const [selectedRecolte, setSelectedRecolte] = useState<any | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<any | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [detailRecolte, setDetailRecolte] = useState<any | null>(null);
  const [detailCycle, setDetailCycle] = useState<any | null>(null);
  const navigate = useNavigate();

  const handlePublish = (recolte: any, cycle: any) => {
    setSelectedRecolte(recolte);
    setSelectedCycle(cycle);
    setShowPublishModal(true);
  };

  const handleCardClick = (recolte: any, cycle: any) => {
    setDetailRecolte(recolte);
    setDetailCycle(cycle);
    speak(`Détails de ${cycle?.culture || 'la récolte'}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Bouton Déclarer récolte */}
      <motion.button
        onClick={() => {
          speak('Déclarer une récolte');
          navigate('/producteur/declarer-recolte');
        }}
        className="w-full mb-4 bg-gradient-to-r from-[#2E8B57] to-[#3BA869] text-white rounded-2xl p-5 flex items-center justify-center gap-3 shadow-lg font-bold text-lg"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Mic className="w-6 h-6" strokeWidth={2.5} />
        Déclarer récolte
      </motion.button>

      {recoltes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Aucune récolte</p>
          <p className="text-sm text-gray-500 mt-2">Tes récoltes apparaîtront ici</p>
        </div>
      ) : (
        <>
          {/* GRILLE 2 COLONNES - IDENTIQUE AU MARCHÉ VIRTUEL */}
          <div className="grid grid-cols-2 gap-3">
            {recoltes.map((recolte, index) => {
              const cycle = cycles.find(c => c.id === recolte.cycleId);
              const isLowStock = recolte.stockDisponible < (recolte.quantiteReelle * 0.2);

              return (
                <motion.div
                  key={recolte.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-3xl overflow-hidden shadow-md border-2 cursor-pointer ${
                    isLowStock ? 'border-orange-400' : 'border-gray-200'
                  }`}
                  onClick={() => handleCardClick(recolte, cycle)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02, y: -4, boxShadow: '0 10px 30px rgba(196, 98, 16, 0.15)' }}
                >
                  {/* Badge Stock Bas */}
                  {isLowStock && (
                    <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Stock bas
                    </div>
                  )}

                  {/* Bouton Favori - IDENTIQUE */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recolte.id);
                    }}
                    className="absolute top-2 left-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.has(recolte.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </motion.button>

                  {/* Image */}
                  <div className="relative w-full aspect-square bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    {recolte.photos && recolte.photos.length > 0 ? (
                      <img 
                        src={recolte.photos[0]} 
                        alt={cycle?.culture}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Sprout className="w-16 h-16 text-green-500" />
                    )}
                  </div>

                  {/* Info produit */}
                  <div className="p-3">
                    {/* Nom */}
                    <h3 className="font-black text-gray-900 text-base mb-1 line-clamp-1">
                      {cycle?.culture || 'Culture'}
                    </h3>

                    {/* Localisation */}
                    <div className="flex items-center gap-1 mb-2">
                      <Package className="w-3 h-3 text-gray-400" />
                      <p className="text-[11px] text-gray-600">
                        {recolte.stockDisponible} kg disponibles
                      </p>
                    </div>

                    {/* Prix - STYLE IDENTIQUE */}
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-black text-[#C46210]">
                        {recolte.prixUnitaire}
                      </span>
                      <span className="text-xs text-gray-600 font-semibold">FCFA/kg</span>
                    </div>

                    {/* Bouton Publier sur le marché */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublish(recolte, cycle);
                      }}
                      className="w-full bg-gradient-to-r from-[#C46210] to-[#D97706] text-white py-2.5 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
                      whileTap={{ scale: 0.95 }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Publier
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Modal de publication */}
          {selectedRecolte && selectedCycle && (
            <PublierRecolteModal
              recolte={selectedRecolte}
              cycle={selectedCycle}
              isOpen={showPublishModal}
              onClose={() => {
                setShowPublishModal(false);
                setSelectedRecolte(null);
                setSelectedCycle(null);
              }}
            />
          )}

          {detailRecolte && (
            <RecolteDetailModal
              recolte={detailRecolte}
              cycle={detailCycle}
              onClose={() => { setDetailRecolte(null); setDetailCycle(null); }}
              onPublish={() => handlePublish(detailRecolte, detailCycle)}
            />
          )}
        </>
      )}
    </motion.div>
  );
}

// Vue Publications
interface PublicationsViewProps {
  publications: any[];
}

function PublicationsView({ publications }: PublicationsViewProps) {
  const { speak } = useApp();
  const cycles: any[] = [];
  const [selectedPublication, setSelectedPublication] = useState<any | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (publication: any, cycle: any) => {
    setSelectedPublication(publication);
    setSelectedCycle(cycle);
    setShowEditModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {publications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Aucune publication</p>
          <p className="text-sm text-gray-500 mt-2">Tes publications apparaîtront ici</p>
        </div>
      ) : (
        <>
          {/* GRILLE 2 COLONNES - IDENTIQUE AU MARCHÉ VIRTUEL */}
          <div className="grid grid-cols-2 gap-3">
            {publications.map((publication, index) => {
              const cycle = cycles.find(c => c.id === publication.cycleId);
              const isLowStock = publication.stockDisponible < (publication.quantiteDisponible * 0.2);

              return (
                <motion.div
                  key={publication.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-3xl overflow-hidden shadow-md border-2 cursor-pointer ${
                    isLowStock ? 'border-orange-400' : 'border-gray-200'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02, y: -4, boxShadow: '0 10px 30px rgba(196, 98, 16, 0.15)' }}
                >
                  {/* Badge Stock Bas */}
                  {isLowStock && (
                    <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Stock bas
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative w-full aspect-square bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    {publication.photos && publication.photos.length > 0 ? (
                      <img 
                        src={publication.photos[0]} 
                        alt={cycle?.culture}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Sprout className="w-16 h-16 text-green-500" />
                    )}
                  </div>

                  {/* Info produit */}
                  <div className="p-3">
                    {/* Nom */}
                    <h3 className="font-black text-gray-900 text-base mb-1 line-clamp-1">
                      {cycle?.culture || 'Culture'}
                    </h3>

                    {/* Localisation */}
                    <div className="flex items-center gap-1 mb-2">
                      <Package className="w-3 h-3 text-gray-400" />
                      <p className="text-[11px] text-gray-600">
                        {publication.stockDisponible} kg disponibles
                      </p>
                    </div>

                    {/* Prix - STYLE IDENTIQUE */}
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-black text-[#C46210]">
                        {publication.prixUnitaire}
                      </span>
                      <span className="text-xs text-gray-600 font-semibold">FCFA/kg</span>
                    </div>

                    {/* Bouton Modifier le prix */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(publication, cycle);
                      }}
                      className="w-full bg-gradient-to-r from-[#C66A2C] to-[#D97706] text-white py-2.5 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit3 className="w-4 h-4" />
                      Modifier
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Modal de modification */}
          {selectedPublication && selectedCycle && (
            <ModifierPublicationModal
              publication={selectedPublication}
              cycle={selectedCycle}
              isOpen={showEditModal}
              onClose={() => {
                setShowEditModal(false);
                setSelectedPublication(null);
                setSelectedCycle(null);
              }}
            />
          )}
        </>
      )}
    </motion.div>
  );
}